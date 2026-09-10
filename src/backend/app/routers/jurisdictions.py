from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import require_roles
from models import User, Jurisdiction
from schema import JurisdictionCreate, JurisdictionOut

router = APIRouter(prefix="/jurisdictions",tags=["jurisdictions"])
@router.post("/", response_model=JurisdictionOut)
def create_jurisdiction(
    jurisdiction: JurisdictionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
    new_jurisdiction = Jurisdiction(**jurisdiction.model_dump())
    db.add(new_jurisdiction)
    db.commit()
    db.refresh(new_jurisdiction)
    return new_jurisdiction

@router.get("/", response_model=list[JurisdictionOut])
def list_jurisdiction(db: Session = Depends(get_db)):
    return db.query(Jurisdiction).all()