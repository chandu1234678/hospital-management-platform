from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("", response_model=PrescriptionResponse, status_code=201)
async def create(data: PrescriptionCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    rx = Prescription(**data.model_dump())
    db.add(rx)
    await db.commit()
    await db.refresh(rx)
    return rx


@router.get("", response_model=list[PrescriptionResponse])
async def list_prescriptions(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(Prescription)
    if patient_id:
        q = q.where(Prescription.patient_id == patient_id)
    if doctor_id:
        q = q.where(Prescription.doctor_id == doctor_id)
    result = await db.execute(q.order_by(Prescription.created_at.desc()))
    return result.scalars().all()


@router.get("/{rx_id}", response_model=PrescriptionResponse)
async def get_prescription(rx_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Prescription).where(Prescription.id == rx_id))
    rx = result.scalar_one_or_none()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return rx


@router.patch("/{rx_id}", response_model=PrescriptionResponse)
async def update_prescription(rx_id: int, data: PrescriptionUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Prescription).where(Prescription.id == rx_id))
    rx = result.scalar_one_or_none()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(rx, k, v)
    await db.commit()
    await db.refresh(rx)
    return rx


