from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schema import UserCreate, UserOut
from routers.auth import require_roles
from security import hash_password

router = APIRouter(prefix="/users",tags=["users"])
@router.post("/", response_model=UserOut)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
   """Account creation is administrator-only - role_level decides what a
   user can reach, so anonymous signup would be privilege escalation."""
   user_data = user.model_dump()
   plain_password = user_data.pop("password")
   new_user = User(**user_data, password_hash=hash_password(plain_password))
   db.add(new_user)
   db.commit()
   db.refresh(new_user)
   return new_user

@router.get("/", response_model=list[UserOut])
def list_user(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "OFFICER")),
):
    return db.query(User).all()