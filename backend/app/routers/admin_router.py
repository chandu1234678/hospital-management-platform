from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.models.bed import Bed

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    total_patients = (await db.execute(select(func.count()).select_from(Patient))).scalar()
    total_doctors = (await db.execute(select(func.count()).select_from(Doctor))).scalar()
    total_appointments = (await db.execute(select(func.count()).select_from(Appointment))).scalar()
    today_appointments = (await db.execute(
        select(func.count()).select_from(Appointment).where(
            func.date(Appointment.appointment_date) == func.current_date()
        )
    )).scalar()
    available_beds = (await db.execute(
        select(func.count()).select_from(Bed).where(Bed.status == "AVAILABLE")
    )).scalar()
    total_beds = (await db.execute(select(func.count()).select_from(Bed))).scalar()
    pending_bills = (await db.execute(
        select(func.count()).select_from(Bill).where(Bill.status == "PENDING")
    )).scalar()
    total_revenue = (await db.execute(
        select(func.sum(Bill.total)).where(Bill.status == "PAID")
    )).scalar() or 0

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "available_beds": available_beds,
        "total_beds": total_beds,
        "pending_bills": pending_bills,
        "total_revenue": total_revenue,
    }
