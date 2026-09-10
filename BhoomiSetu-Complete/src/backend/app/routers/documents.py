from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Document, DocumentVerification, User
from routers.auth import get_current_user
from scoping import visible_parcel_ids
from schema import (
    DocumentCreate,
    DocumentOut,
    DocumentVerificationOut,
    DocumentVerifyRequest,
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/", response_model=DocumentOut)
def upload_document(document: DocumentCreate, db: Session = Depends(get_db)):
    new_document = Document(**document.model_dump())
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    return new_document


@router.get("/", response_model=list[DocumentOut])
def list_documents(
    parcel_id: int | None = None,
    project_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Optional query filters, e.g. /documents/?parcel_id=3&status=Pending

    Always narrowed to parcels the caller may see, so a filter cannot be used
    to reach documents in another jurisdiction.
    """
    query = db.query(Document)

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None:
        query = query.filter(Document.parcel_id.in_(allowed_parcels)) if allowed_parcels else query.filter(False)
    if parcel_id is not None:
        query = query.filter(Document.parcel_id == parcel_id)
    if project_id is not None:
        query = query.filter(Document.project_id == project_id)
    if status is not None:
        query = query.filter(Document.status == status)
    return query.all()


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None and document.parcel_id not in allowed_parcels:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


@router.post("/{document_id}/verify", response_model=DocumentOut)
def verify_document(
    document_id: int,
    decision: DocumentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record a verification decision.

    Two writes, deliberately: the document's current status is updated, and an
    immutable row is appended to document_verification so the full review
    history survives - including earlier rejections.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.role not in ("OFFICER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only officers may verify documents.")

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None and document.parcel_id not in allowed_parcels:
        raise HTTPException(status_code=404, detail="Document not found")

    document.status = decision.status
    document.verified_by_id = current_user.id
    document.verified_date = datetime.now()
    document.rejection_reason = (
        decision.remarks if decision.status == "Rejected" else None
    )

    db.add(
        DocumentVerification(
            document_id=document.id,
            verified_by_id=current_user.id,
            status=decision.status,
            remarks=decision.remarks,
        )
    )

    db.commit()
    db.refresh(document)
    return document


@router.get("/{document_id}/history", response_model=list[DocumentVerificationOut])
def document_history(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Every verification round this document has been through, oldest first."""
    document = db.query(Document).filter(Document.id == document_id).first()
    allowed_parcels = visible_parcel_ids(db, current_user)
    if document is None or (allowed_parcels is not None and document.parcel_id not in allowed_parcels):
        raise HTTPException(status_code=404, detail="Document not found")

    return (
        db.query(DocumentVerification)
        .filter(DocumentVerification.document_id == document_id)
        .order_by(DocumentVerification.verified_at)
        .all()
    )
