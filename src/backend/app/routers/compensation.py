import random
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from calculations import SOLATIUM_MULTIPLIER, calculate_compensation
from database import get_db
from models import CompensationRecord, Land_parcel, User
from routers.auth import get_current_user
from scoping import can_view_parcel, visible_parcel_ids
from schema import CompensationCreate, CompensationOut

router = APIRouter(prefix="/compensation", tags=["compensation"])


def _record_in_scope(db: Session, current_user: User, record_id: int, writing: bool = False):
    """Fetch a record, or 404 if the caller may not see it. 403 if they may see but not change it."""
    record = db.query(CompensationRecord).filter(CompensationRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Compensation record not found")

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None and record.parcel_id not in allowed_parcels:
        raise HTTPException(status_code=404, detail="Compensation record not found")

    if writing and current_user.role not in ("OFFICER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only officers may approve or disburse awards.")

    return record




@router.post("/", response_model=CompensationOut)
def create_compensation_record(
    record: CompensationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Open an award record for a parcel.

    The money is read off the parcel and recalculated here rather than accepted
    from the request, then frozen onto this row - once an award is declared
    under Sec 23 it must not change if the parcel is edited later.
    """
    if current_user.role not in ("OFFICER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only officers may open award records.")

    parcel = db.query(Land_parcel).filter(Land_parcel.id == record.parcel_id).first()
    if not can_view_parcel(db, current_user, parcel):
        raise HTTPException(status_code=404, detail="Land parcel not found")

    money = calculate_compensation(
        area_acre=parcel.area_acre,
        circle_rate_per_acre=parcel.circle_rate_per_acre,
        additional_asset_value=parcel.additional_asset_value,
    )

    data = record.model_dump()
    data.update(
        project_id=data.get("project_id") or parcel.project_id,
        landowner_id=data.get("landowner_id") or parcel.owner_user_id,
        basic_land_value=money["market_value_total"],
        solatium_multiplier=SOLATIUM_MULTIPLIER,
        solatium_amount=money["solatium_amount"],
        additional_asset_value=money["additional_asset_value"],
        total_compensation=money["total_compensation"],
    )

    new_record = CompensationRecord(**data)
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/", response_model=list[CompensationOut])
def list_compensation(
    project_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Scoped through the parent parcel - a citizen sees only their own awards."""
    query = db.query(CompensationRecord)

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None:
        query = (
            query.filter(CompensationRecord.parcel_id.in_(allowed_parcels))
            if allowed_parcels else query.filter(False)
        )
    if project_id is not None:
        query = query.filter(CompensationRecord.project_id == project_id)
    if status is not None:
        query = query.filter(CompensationRecord.status == status)
    return query.all()


@router.get("/{record_id}", response_model=CompensationOut)
def get_compensation(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(CompensationRecord).filter(CompensationRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Compensation record not found")

    allowed_parcels = visible_parcel_ids(db, current_user)
    if allowed_parcels is not None and record.parcel_id not in allowed_parcels:
        raise HTTPException(status_code=404, detail="Compensation record not found")

    return record


@router.post("/{record_id}/approve", response_model=CompensationOut)
def approve_compensation(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sign off an award. Stamps who approved it and when."""
    record = _record_in_scope(db, current_user, record_id, writing=True)

    if record.status == "Paid":
        raise HTTPException(status_code=400, detail="Already disbursed")

    record.status = "Approved"
    record.approved_by_id = current_user.id
    record.approved_date = datetime.now()

    db.commit()
    db.refresh(record)
    return record


@router.post("/{record_id}/disburse", response_model=CompensationOut)
def disburse_compensation(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Release the payment through DBT.

    Only an approved award can be disbursed - that ordering is the whole point
    of having an approval step, so it is enforced here rather than trusted to
    the interface.
    """
    record = _record_in_scope(db, current_user, record_id, writing=True)

    if record.status != "Approved":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot disburse a record with status '{record.status}' - it must be Approved first",
        )

    record.status = "Paid"
    record.disbursement_date = datetime.now()
    # Stands in for the reference a real PFMS integration would return.
    record.dbt_transaction_id = f"PFMS{datetime.now():%Y%m%d}{random.randint(100000, 999999)}"

    db.commit()
    db.refresh(record)
    return record
