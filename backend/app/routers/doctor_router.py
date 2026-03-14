from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.doctor import Doctor
from app.schemas.user import UserResponse

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=list[dict])
async def list_doctors(
    department: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Doctor)
    if department:
        q = q.where(Doctor.department == department)
    result = await db.execute(q)
    doctors = result.scalars().all()
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "specialty": d.specialty,
            "department": d.department,
            "qualification": d.qualification,
            "experience_years": d.experience_years,
            "consultation_fee": d.consultation_fee,
            "bio": d.bio,
            "rating": d.rating,
            "is_available": d.is_available,
        }
        for d in doctors
    ]


@router.get("/{doctor_id}", response_model=dict)
async def get_doctor(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "id": d.id,
        "user_id": d.user_id,
        "specialty": d.specialty,
        "department": d.department,
        "qualification": d.qualification,
        "experience_years": d.experience_years,
        "consultation_fee": d.consultation_fee,
        "bio": d.bio,
        "rating": d.rating,
        "is_available": d.is_available,
        "available_slots": d.available_slots,
    }


