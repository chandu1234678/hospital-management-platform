from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.bed import Bed
from app.schemas.bed import BedCreate, BedUpdate, BedResponse

router = APIRouter(prefix="/beds", tags=["Beds"])


@router.post("", response_model=BedResponse, status_code=201)
async def create_bed(data: BedCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    bed = Bed(**data.model_dump())
    db.add(bed)
    await db.commit()
    await db.refresh(bed)
    return bed


@router.get("", response_model=list[BedResponse])
async def list_beds(
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "RECEPTION", "DOCTOR")),
):
    q = select(Bed)
    if status:
        q = q.where(Bed.status == status)
    if ward:
        q = q.where(Bed.ward == ward)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/{bed_id}", response_model=BedResponse)
async def update_bed(bed_id: int, data: BedUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN", "RECEPTION"))):
    result = await db.execute(select(Bed).where(Bed.id == bed_id))
    bed = result.scalar_one_or_none()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(bed, k, v)
    await db.commit()
    await db.refresh(bed)
    return bed




@router.delete("/{bed_id}", status_code=204)
async def delete_bed(bed_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(Bed).where(Bed.id == bed_id))
    bed = result.scalar_one_or_none()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    await db.delete(bed)
    await db.commit()
