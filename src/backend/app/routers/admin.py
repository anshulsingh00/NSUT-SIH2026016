"""
Administrative endpoints: audit trail, system settings, project stage
timelines and statutory notifications.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import (
    AuditLog,
    ProjectStage,
    StatutoryNotification,
    SystemSettings,
    User as UserModel,
)
from routers.auth import get_current_user, require_roles
from scoping import visible_jurisdiction_ids
from schema import (
    AuditLogOut,
    ProjectStageOut,
    StatutoryNotificationCreate,
    StatutoryNotificationOut,
    SystemSettingsOut,
    SystemSettingsUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"])

# Audit trails and security settings are administrator-only - they must never
# be readable or writable anonymously.
AdminOnly = Depends(require_roles("ADMIN"))

# Stage timelines and gazette notifications are operational records an officer
# needs to do their job, so officers may read them too.
OfficerOrAdmin = Depends(require_roles("ADMIN", "OFFICER"))


# ---------------------------------------------------------------------------
# Audit trail
# ---------------------------------------------------------------------------

@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    entity_type: str | None = None,
    entity_id: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: UserModel = AdminOnly,
):
    """
    The audit trail, newest first.

    Filtering by entity_type + entity_id gives you one record's whole history -
    which is how a project's activity feed is served, rather than keeping a
    second log table that could drift out of step.
    """
    query = db.query(AuditLog)
    if entity_type is not None:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id is not None:
        query = query.filter(AuditLog.entity_id == entity_id)
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()


# ---------------------------------------------------------------------------
# System settings - a single row, id = 1
# ---------------------------------------------------------------------------

def _get_or_create_settings(db: Session) -> SystemSettings:
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if settings is None:
        settings = SystemSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings", response_model=SystemSettingsOut)
def get_settings(db: Session = Depends(get_db), _: UserModel = AdminOnly):
    return _get_or_create_settings(db)


@router.patch("/settings", response_model=SystemSettingsOut)
def update_settings(updates: SystemSettingsUpdate, db: Session = Depends(get_db), _: UserModel = AdminOnly):
    """
    PATCH, not PUT: callers send only the fields they are changing.

    exclude_unset drops anything the caller left out, so an omitted field keeps
    its stored value instead of being overwritten with null.
    """
    settings = _get_or_create_settings(db)

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings


# ---------------------------------------------------------------------------
# Project stage timelines
# ---------------------------------------------------------------------------

@router.get("/projects/{project_id}/stages", response_model=list[ProjectStageOut])
def project_stages(project_id: int, db: Session = Depends(get_db), _: UserModel = OfficerOrAdmin):
    """All ten statutory stages for a project, in order."""
    return (
        db.query(ProjectStage)
        .filter(ProjectStage.project_id == project_id)
        .order_by(ProjectStage.sequence)
        .all()
    )


# ---------------------------------------------------------------------------
# Statutory notifications (Sec 4, 6, 11, 19, 23)
# ---------------------------------------------------------------------------

@router.post("/statutory-notifications", response_model=StatutoryNotificationOut)
def create_statutory_notification(
    notification: StatutoryNotificationCreate,
    db: Session = Depends(get_db),
    _: UserModel = OfficerOrAdmin,
):
    new_notification = StatutoryNotification(**notification.model_dump())
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification


@router.get("/statutory-notifications", response_model=list[StatutoryNotificationOut])
def list_statutory_notifications(
    project_id: int | None = None,
    section: str | None = None,
    db: Session = Depends(get_db),
    current_user: UserModel = OfficerOrAdmin,
):
    query = db.query(StatutoryNotification)

    allowed = visible_jurisdiction_ids(db, current_user)
    if allowed is not None:
        query = (
            query.filter(StatutoryNotification.jurisdiction_id.in_(allowed))
            if allowed else query.filter(False)
        )
    if project_id is not None:
        query = query.filter(StatutoryNotification.project_id == project_id)
    if section is not None:
        query = query.filter(StatutoryNotification.section == section)
    return query.order_by(StatutoryNotification.issue_date.desc()).all()
