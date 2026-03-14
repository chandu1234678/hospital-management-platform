from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.lab_report import LabReport
from app.schemas.lab_report import LabReportCreate, LabReportUpdate, LabReportResponse

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports"])


@router.post("", response_model=LabReportResponse, status_code=201)
async def create(data: LabReportCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    report = LabReport(**data.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("", response_model=list[LabReportResponse])
async def list_reports(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(LabReport)
    if patient_id:
        q = q.where(LabReport.patient_id == patient_id)
    if status:
        q = q.where(LabReport.status == status)
    result = await db.execute(q.order_by(LabReport.created_at.desc()))
    return result.scalars().all()


@router.get("/{report_id}", response_model=LabReportResponse)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(LabReport).where(LabReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    return report


@router.patch("/{report_id}", response_model=LabReportResponse)
async def update_report(report_id: int, data: LabReportUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(LabReport).where(LabReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(report, k, v)
    await db.commit()
    await db.refresh(report)
    return report


