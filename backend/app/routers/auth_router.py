from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password, verify_password, create_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=user.email,
        password=hash_password(user.password),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login")
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_token(
        {"sub": db_user.email},
        settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    refresh = create_token(
        {"sub": db_user.email},
        settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer"
    }