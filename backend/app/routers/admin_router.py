from fastapi import APIRouter, Depends, Query as QueryParam, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, timedelta
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import require_roles
from app.core.security import hash_password
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.models.bed import Bed
from app.models.inventory import InventoryItem
from app.models.lab_report import LabReport


# ── Admin: Create Doctor ──────────────────────────────────────────────────────
class AdminDoctorCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str = "Doctor@123"
    specialty: str
    department: str
    qualification: Optional[str] = None
    experience_years: int = 0
    consultation_fee: float = 500.0
    bio: Optional[str] = None


# ── Admin: Create Appointment ─────────────────────────────────────────────────
class AdminAppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: str   # YYYY-MM-DD
    appointment_time: str   # HH:MM AM/PM
    department: Optional[str] = None
    reason: Optional[str] = None

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


@router.post("/doctors", status_code=201)
async def create_doctor(data: AdminDoctorCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Create user
    user = User(
        name=data.name, email=data.email, phone=data.phone,
        password=hash_password(data.password), role="DOCTOR",
    )
    db.add(user)
    await db.flush()
    # Create doctor profile
    doctor = Doctor(
        user_id=user.id, specialty=data.specialty, department=data.department,
        qualification=data.qualification, experience_years=data.experience_years,
        consultation_fee=data.consultation_fee, bio=data.bio, is_available=True,
    )
    db.add(doctor)
    await db.commit()
    await db.refresh(doctor)
    return {
        "id": doctor.id, "user_id": user.id, "name": user.name, "email": user.email,
        "specialty": doctor.specialty, "department": doctor.department,
        "qualification": doctor.qualification, "experience_years": doctor.experience_years,
        "consultation_fee": doctor.consultation_fee, "bio": doctor.bio,
        "is_available": doctor.is_available, "rating": doctor.rating,
        "image": f"https://ui-avatars.com/api/?name={user.name.replace(' ', '+')}&background=0f4b80&color=fff",
        "reviews": 0, "experience": f"{doctor.experience_years}+ Years",
    }


@router.post("/appointments", status_code=201)
async def admin_create_appointment(data: AdminAppointmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    # Verify patient and doctor exist
    patient = await db.execute(select(Patient).where(Patient.id == data.patient_id))
    if not patient.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Patient not found")
    doctor = await db.execute(select(Doctor).where(Doctor.id == data.doctor_id))
    if not doctor.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Doctor not found")
    # Auto token
    token_res = await db.execute(
        select(func.count()).where(
            Appointment.appointment_date == data.appointment_date,
            Appointment.doctor_id == data.doctor_id,
        )
    )
    token = (token_res.scalar() or 0) + 1
    appt = Appointment(
        patient_id=data.patient_id, doctor_id=data.doctor_id,
        appointment_date=data.appointment_date, appointment_time=data.appointment_time,
        department=data.department, reason=data.reason, token_number=token, status="SCHEDULED",
    )
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    # Return enriched
    patient_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id == appt.patient_id)
    )
    p_row = patient_res.first()
    doctor_res = await db.execute(
        select(Doctor, User).join(User, Doctor.user_id == User.id).where(Doctor.id == appt.doctor_id)
    )
    d_row = doctor_res.first()
    return {
        "id": appt.id, "patient_id": appt.patient_id, "doctor_id": appt.doctor_id,
        "patient": p_row[1].name if p_row else "Unknown",
        "doctor": d_row[1].name if d_row else "Unknown",
        "department": appt.department, "appointment_date": appt.appointment_date,
        "appointment_time": appt.appointment_time, "reason": appt.reason,
        "status": appt.status, "token_number": appt.token_number,
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


@router.get("/reports")
async def get_report_data(
    report_type: str = QueryParam("revenue"),
    period: str = QueryParam("today"),
    start_date: Optional[str] = QueryParam(None),
    end_date: Optional[str] = QueryParam(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
    """
    Generate report data for a given type and period.
    period: today | yesterday | this_week | this_month | last_month | all | custom
    For custom: pass start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    today = date.today()
    if period == "today":
        start, end = today, today
    elif period == "yesterday":
        start = end = today - timedelta(days=1)
    elif period == "this_week":
        start = today - timedelta(days=today.weekday())
        end = today
    elif period == "this_month":
        start = today.replace(day=1)
        end = today
    elif period == "last_month":
        first_this = today.replace(day=1)
        end = first_this - timedelta(days=1)
        start = end.replace(day=1)
    elif period == "custom" and start_date and end_date:
        try:
            start = date.fromisoformat(start_date)
            end = date.fromisoformat(end_date)
            if start > end:
                start, end = end, start
        except ValueError:
            start, end = today, today
    else:  # all
        start = date(2000, 1, 1)
        end = today

    start_str = start.isoformat()
    end_str = end.isoformat()

    if report_type == "revenue":
        # paid_at is stored as varchar "2026-03-16T10:00:00" — compare first 10 chars
        bills = (await db.execute(
            select(Bill).where(
                and_(Bill.status == "PAID",
                     Bill.paid_at.isnot(None),
                     func.left(Bill.paid_at, 10) >= start_str,
                     func.left(Bill.paid_at, 10) <= end_str)
            )
        )).scalars().all()
        total = sum(b.total for b in bills)
        patient_ids = list({b.patient_id for b in bills})
        patients_res = await db.execute(
            select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
        )
        patients_map = {p.id: u.name for p, u in patients_res.all()}
        return {
            "type": "revenue", "period": period, "start": start_str, "end": end_str,
            "summary": {"total_revenue": total, "total_bills": len(bills)},
            "rows": [
                {
                    "bill_number": b.bill_number,
                    "patient": patients_map.get(b.patient_id, "Unknown"),
                    "amount": b.total,
                    "method": b.payment_method or "N/A",
                    "paid_at": b.paid_at,
                }
                for b in bills
            ],
        }

    elif report_type == "appointments":
        # appointment_date is stored as varchar "2026-03-16" — direct string compare works for ISO
        appts = (await db.execute(
            select(Appointment).where(
                and_(Appointment.appointment_date >= start_str,
                     Appointment.appointment_date <= end_str)
            )
        )).scalars().all()
        patient_ids = list({a.patient_id for a in appts})
        doctor_ids = list({a.doctor_id for a in appts})
        patients_res = await db.execute(
            select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
        )
        patients_map = {p.id: u.name for p, u in patients_res.all()}
        doctors_res = await db.execute(
            select(Doctor, User).join(User, Doctor.user_id == User.id).where(Doctor.id.in_(doctor_ids))
        )
        doctors_map = {d.id: u.name for d, u in doctors_res.all()}
        by_status = {}
        for a in appts:
            by_status[a.status] = by_status.get(a.status, 0) + 1
        return {
            "type": "appointments", "period": period, "start": start_str, "end": end_str,
            "summary": {"total": len(appts), "by_status": by_status},
            "rows": [
                {
                    "id": a.id,
                    "patient": patients_map.get(a.patient_id, "Unknown"),
                    "doctor": doctors_map.get(a.doctor_id, "Unknown"),
                    "department": a.department,
                    "date": a.appointment_date,
                    "time": a.appointment_time,
                    "status": a.status,
                }
                for a in appts
            ],
        }

    elif report_type == "beds":
        beds = (await db.execute(select(Bed))).scalars().all()
        by_status = {}
        by_ward = {}
        for b in beds:
            by_status[b.status] = by_status.get(b.status, 0) + 1
            by_ward[b.ward] = by_ward.get(b.ward, {"total": 0, "occupied": 0})
            by_ward[b.ward]["total"] += 1
            if b.status == "OCCUPIED":
                by_ward[b.ward]["occupied"] += 1
        return {
            "type": "beds", "period": period, "start": start_str, "end": end_str,
            "summary": {"total": len(beds), "by_status": by_status},
            "rows": [
                {"ward": ward, "total": data["total"], "occupied": data["occupied"],
                 "available": data["total"] - data["occupied"],
                 "occupancy_pct": round(data["occupied"] / data["total"] * 100) if data["total"] else 0}
                for ward, data in by_ward.items()
            ],
        }

    elif report_type == "patients":
        # created_at is a real TIMESTAMPTZ — compare func.date() against Python date objects directly
        patients_res = await db.execute(
            select(Patient, User).join(User, Patient.user_id == User.id).where(
                and_(func.date(Patient.created_at) >= start,
                     func.date(Patient.created_at) <= end)
            )
        )
        rows = patients_res.all()
        by_gender = {}
        by_blood = {}
        for p, u in rows:
            g = p.gender or "Unknown"
            by_gender[g] = by_gender.get(g, 0) + 1
            bg = p.blood_group or "Unknown"
            by_blood[bg] = by_blood.get(bg, 0) + 1
        return {
            "type": "patients", "period": period, "start": start_str, "end": end_str,
            "summary": {"total": len(rows), "by_gender": by_gender, "by_blood_group": by_blood},
            "rows": [
                {"id": p.id, "name": u.name, "email": u.email, "phone": u.phone,
                 "gender": p.gender, "blood_group": p.blood_group, "registered": p.created_at.isoformat() if p.created_at else ""}
                for p, u in rows
            ],
        }

    elif report_type == "lab":
        reports = (await db.execute(
            select(LabReport).where(
                and_(LabReport.report_date >= start_str,
                     LabReport.report_date <= end_str)
            )
        )).scalars().all()
        patient_ids = list({r.patient_id for r in reports})
        patients_res = await db.execute(
            select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
        )
        patients_map = {p.id: u.name for p, u in patients_res.all()}
        by_status = {}
        for r in reports:
            by_status[r.status] = by_status.get(r.status, 0) + 1
        return {
            "type": "lab", "period": period, "start": start_str, "end": end_str,
            "summary": {"total": len(reports), "by_status": by_status},
            "rows": [
                {"id": r.id, "patient": patients_map.get(r.patient_id, "Unknown"),
                 "test_name": r.test_name, "test_type": r.test_type,
                 "date": r.report_date, "status": r.status, "remarks": r.remarks}
                for r in reports
            ],
        }

    elif report_type == "discharge":
        completed = (await db.execute(
            select(Appointment).where(
                and_(Appointment.status == "COMPLETED",
                     Appointment.appointment_date >= start_str,
                     Appointment.appointment_date <= end_str)
            )
        )).scalars().all()
        patient_ids = list({a.patient_id for a in completed})
        doctor_ids = list({a.doctor_id for a in completed})
        patients_res = await db.execute(
            select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
        )
        patients_map = {p.id: u.name for p, u in patients_res.all()}
        doctors_res = await db.execute(
            select(Doctor, User).join(User, Doctor.user_id == User.id).where(Doctor.id.in_(doctor_ids))
        )
        doctors_map = {d.id: u.name for d, u in doctors_res.all()}
        by_dept = {}
        for a in completed:
            by_dept[a.department] = by_dept.get(a.department, 0) + 1
        return {
            "type": "discharge", "period": period, "start": start_str, "end": end_str,
            "summary": {"total_discharged": len(completed), "by_department": by_dept},
            "rows": [
                {"id": a.id, "patient": patients_map.get(a.patient_id, "Unknown"),
                 "doctor": doctors_map.get(a.doctor_id, "Unknown"),
                 "department": a.department, "date": a.appointment_date}
                for a in completed
            ],
        }

    return {"type": report_type, "period": period, "summary": {}, "rows": []}
