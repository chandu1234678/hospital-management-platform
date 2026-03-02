from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.schemas.user import UserResponse
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user 