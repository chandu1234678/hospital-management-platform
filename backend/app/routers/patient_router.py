from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Patients"])


def _enrich(patient: Patient, user: User) -> dict:
    """Merge user fields into patient response."""
    data = {c.name: getattr(patient, c.name) for c in patient.__table__.columns}
    data["name"] = user.name if user else None
    data["phone"] = user.phone if user else None
    return data


@router.get("", response_model=list[PatientResponse])
async def list_patients(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "DOCTOR", "RECEPTION")),
):
    result = await db.execute(select(Patient))
    patients = result.scalars().all()
    user_ids = [p.user_id for p in patients]
    users_res = await db.execute(select(User).where(User.id.in_(user_ids)))
    users_map = {u.id: u for u in users_res.scalars().all()}
    return [_enrich(p, users_map.get(p.user_id)) for p in patients]


@router.get("/me", response_model=PatientResponse)
async def get_my_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Patient).where(Patient.user_id == current_user.id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return _enrich(patient, current_user)


@router.patch("/me", response_model=PatientResponse)
async def update_my_profile(data: PatientUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Patient).where(Patient.user_id == current_user.id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    # Update patient fields
    for k, v in data.model_dump(exclude_none=True).items():
        if hasattr(patient, k):
            setattr(patient, k, v)
    # Update user fields if provided
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    await db.commit()
    await db.refresh(patient)
    await db.refresh(current_user)
    return _enrich(patient, current_user)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN", "DOCTOR", "RECEPTION"))):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    user_res = await db.execute(select(User).where(User.id == patient.user_id))
    user = user_res.scalar_one_or_none()
    return _enrich(patient, user)


