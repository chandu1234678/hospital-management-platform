from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_token, decode_token
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()

    # Auto-create patient profile for PATIENT role
    if data.role == "PATIENT":
        db.add(Patient(user_id=user.id))

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    return {
        "access_token": create_token({"sub": user.email, "role": user.role}, settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "refresh_token": create_token({"sub": user.email, "role": user.role}, settings.REFRESH_TOKEN_EXPIRE_MINUTES),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    payload = decode_token(data.refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    return {
        "access_token": create_token({"sub": payload["sub"], "role": payload.get("role")}, settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "refresh_token": create_token({"sub": payload["sub"], "role": payload.get("role")}, settings.REFRESH_TOKEN_EXPIRE_MINUTES),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
