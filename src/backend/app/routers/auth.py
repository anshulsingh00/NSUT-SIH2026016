from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models import SystemSettings, User
from schema import LoginRequest, TokenResponse, UserOut
from security import create_access_token, decode_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

bearer_scheme = HTTPBearer()


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Session length is administrator-configurable, not hardcoded.
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()

    token = create_access_token(
        user_id=user.id,
        role_level=user.role_level,
        jurisdiction_id=user.jurisdiction_id,
        expires_minutes=settings.session_timeout_minutes if settings else None,
    )
    return TokenResponse(access_token=token)


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(creds.credentials)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == int(payload["sub"])).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return user


def require_roles(*allowed_roles: str):
    """
    Build a dependency that allows only the given roles.

    Used as:  current_user: User = Depends(require_roles("ADMIN"))

    Returns a *function*, so each endpoint gets its own guard with its own
    list of permitted roles baked in.
    """

    def guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Requires one of: {', '.join(allowed_roles)}. "
                    f"Your role is {current_user.role}."
                ),
            )
        return current_user

    return guard


# Read-only auditors (L10) map to ADMIN, so they must be blocked from writes
# separately - being able to see everything is not permission to change it.
def forbid_readonly(current_user: User = Depends(get_current_user)) -> User:
    """Any signed-in user except the read-only oversight role."""
    if current_user.role_level == "L10":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Auditor accounts have read-only access.",
        )
    return current_user


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
