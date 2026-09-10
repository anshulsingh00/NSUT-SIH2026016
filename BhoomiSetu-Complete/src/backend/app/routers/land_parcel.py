from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from calculations import calculate_compensation
from database import get_db
from models import Land_parcel, User
from routers.auth import get_current_user, require_roles
from schema import LandParcelCreate, LandParcelOut
from scoping import can_view_parcel, scope_parcel_query, visible_jurisdiction_ids

router = APIRouter(prefix="/land_parcel", tags=["LandParcel"])


@router.post("/", response_model=LandParcelOut)
def create_land_parcel(
    parcel: LandParcelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "OFFICER")),
):
    parcel_data = parcel.model_dump()

    allowed = visible_jurisdiction_ids(db, current_user)
    if (
        allowed is not None
        and parcel_data.get("jurisdiction_id") is not None
        and parcel_data["jurisdiction_id"] not in allowed
    ):
        raise HTTPException(
            status_code=403,
            detail="Cannot create a parcel outside your jurisdiction.",
        )

    # Compensation is derived here, never taken from the request body.
    compensation = calculate_compensation(
        area_acre=parcel_data.get("area_acre"),
        circle_rate_per_acre=parcel_data.get("circle_rate_per_acre"),
        additional_asset_value=parcel_data.get("additional_asset_value"),
    )
    parcel_data.update(compensation)

    new_land_parcel = Land_parcel(**parcel_data)
    db.add(new_land_parcel)
    db.commit()
    db.refresh(new_land_parcel)
    return new_land_parcel


@router.get("/", response_model=list[LandParcelOut])
def list_land_parcel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Scoped by jurisdiction - except for citizens, who see the parcels they own
    wherever those happen to be.
    """
    return scope_parcel_query(db.query(Land_parcel), db, current_user).all()


@router.get("/{parcel_id}", response_model=LandParcelOut)
def get_land_parcel(
    parcel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parcel = db.query(Land_parcel).filter(Land_parcel.id == parcel_id).first()
    if not can_view_parcel(db, current_user, parcel):
        raise HTTPException(status_code=404, detail="Land parcel not found")
    return parcel
