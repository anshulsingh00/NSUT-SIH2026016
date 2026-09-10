from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Notification, User
from routers.auth import get_current_user
from schema import NotificationCreate, NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/", response_model=NotificationOut)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    new_notification = Notification(**notification.model_dump())
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification


@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Notifications for the signed-in user.

    Three ways one can reach them: addressed to them personally, broadcast to
    their role, or broadcast to everyone.
    """
    query = db.query(Notification).filter(
        or_(
            Notification.target_user_id == current_user.id,
            Notification.target_role == current_user.role,
            Notification.target_role == "ALL",
        )
    )
    if unread_only:
        query = query.filter(Notification.read.is_(False))
    return query.order_by(Notification.timestamp.desc()).all()


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = (
        db.query(Notification)
        .filter(
            or_(
                Notification.target_user_id == current_user.id,
                Notification.target_role == current_user.role,
                Notification.target_role == "ALL",
            ),
            Notification.read.is_(False),
        )
        .update({Notification.read: True}, synchronize_session=False)
    )
    db.commit()
    return {"marked_read": updated}
