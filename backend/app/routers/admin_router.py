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
from app.models.inventory import InventoryItem
from app.models.lab_report import LabReport

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


@router.get("/appointments")
async def get_all_appointments(db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(Appointment))
    appointments = result.scalars().all()

    # Load patients and doctors
    patient_ids = list({a.patient_id for a in appointments})
    doctor_ids = list({a.doctor_id for a in appointments})

    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: u.name for p, u in patients_res.all()}

    doctors_res = await db.execute(
        select(Doctor, User).join(User, Doctor.user_id == User.id).where(Doctor.id.in_(doctor_ids))
    )
    doctors_map = {d.id: u.name for d, u in doctors_res.all()}

    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "patient": patients_map.get(a.patient_id, "Unknown"),
            "doctor": doctors_map.get(a.doctor_id, "Unknown"),
            "department": a.department,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "reason": a.reason,
            "status": a.status,
            "token_number": a.token_number,
            "notes": a.notes,
        }
        for a in appointments
    ]


@router.get("/patients")
async def get_all_patients(db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id)
    )
    rows = result.all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "date_of_birth": p.date_of_birth,
            "address": p.address,
            "allergies": p.allergies,
            "medical_history": p.medical_history,
            "emergency_contact": p.emergency_contact,
        }
        for p, u in rows
    ]


@router.get("/billing")
async def get_all_billing(db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(Bill))
    bills = result.scalars().all()

    patient_ids = list({b.patient_id for b in bills})
    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: u.name for p, u in patients_res.all()}

    return [
        {
            "id": b.id,
            "bill_number": b.bill_number,
            "patient_id": b.patient_id,
            "patient": patients_map.get(b.patient_id, "Unknown"),
            "appointment_id": b.appointment_id,
            "items": b.items,
            "subtotal": b.subtotal,
            "tax": b.tax,
            "discount": b.discount,
            "total": b.total,
            "status": b.status,
            "payment_method": b.payment_method,
            "paid_at": b.paid_at,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in bills
    ]


@router.get("/lab")
async def get_all_lab_reports(db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(LabReport))
    reports = result.scalars().all()

    patient_ids = list({r.patient_id for r in reports})
    doctor_ids = list({r.doctor_id for r in reports if r.doctor_id})

    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: u.name for p, u in patients_res.all()}

    doctors_res = await db.execute(
        select(Doctor, User).join(User, Doctor.user_id == User.id).where(Doctor.id.in_(doctor_ids))
    )
    doctors_map = {d.id: u.name for d, u in doctors_res.all()}

    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "doctor_id": r.doctor_id,
            "patient": patients_map.get(r.patient_id, "Unknown"),
            "doctor": doctors_map.get(r.doctor_id, "Unknown") if r.doctor_id else "N/A",
            "test_name": r.test_name,
            "test_type": r.test_type,
            "results": r.results,
            "report_date": r.report_date,
            "status": r.status,
            "remarks": r.remarks,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]
