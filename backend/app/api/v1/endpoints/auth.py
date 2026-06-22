import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.core.security import (
    verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
)
from app.schemas.auth import (
    LoginRequest, RegisterRequest, Token, ForgotPasswordRequest,
    ResetPasswordRequest, OTPVerifyRequest, RefreshRequest
)
from app.schemas.user import UserOut
from app.api.deps import get_current_user

router = APIRouter()

# In-memory OTP store for demo purposes (forgot password / MFA flows)
_otp_store: dict[str, str] = {}


@router.post("/register", response_model=UserOut)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        branch_id=payload.branch_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    user.last_login = datetime.utcnow()
    db.add(AuditLog(user_id=user.id, action="login", entity_type="user", entity_id=str(user.id),
                     details="User logged in", timestamp=datetime.utcnow()))
    db.commit()
    access = create_access_token(str(user.id), user.role.value, user.branch_id)
    refresh = create_refresh_token(str(user.id))
    return Token(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == int(decoded["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access = create_access_token(str(user.id), user.role.value, user.branch_id)
    new_refresh = create_refresh_token(str(user.id))
    return Token(access_token=access, refresh_token=new_refresh)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't leak whether the email exists
        return {"message": "If the email exists, an OTP has been sent."}
    otp = f"{random.randint(100000, 999999)}"
    _otp_store[payload.email] = otp
    # In production: send via email/SMS provider. For demo, return in response.
    return {"message": "OTP sent to registered email.", "demo_otp": otp}


@router.post("/verify-otp")
def verify_otp(payload: OTPVerifyRequest):
    stored = _otp_store.get(payload.email)
    if not stored or stored != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified successfully"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored = _otp_store.get(payload.email)
    if not stored or stored != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    del _otp_store[payload.email]
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
