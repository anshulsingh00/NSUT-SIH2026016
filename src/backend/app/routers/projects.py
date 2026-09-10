from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, User
from routers.auth import get_current_user, require_roles
from schema import ProjectCreate, ProjectOut
from scoping import visible_jurisdiction_ids, visible_project_ids

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectOut)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "OFFICER")),
):
    """Officers may only create projects inside their own jurisdiction."""
    allowed = visible_jurisdiction_ids(db, current_user)
    if (
        allowed is not None
        and project.jurisdiction_id is not None
        and project.jurisdiction_id not in allowed
    ):
        raise HTTPException(
            status_code=403,
            detail="Cannot create a project outside your jurisdiction.",
        )

    new_project = Project(**project.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Projects reachable from the signed-in user's position in the tree."""
    allowed = visible_project_ids(db, current_user)
    query = db.query(Project)
    if allowed is not None:
        query = query.filter(Project.id.in_(allowed)) if allowed else query.filter(False)
    return query.all()


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    allowed = visible_project_ids(db, current_user)
    if allowed is not None and project.id not in allowed:
        # 404 rather than 403: revealing that a record exists but is off-limits
        # leaks information about other jurisdictions.
        raise HTTPException(status_code=404, detail="Project not found")

    return project
