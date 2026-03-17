from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.doctor import Doctor
from app.models.doctor_schedule import DoctorSchedule
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.lab_report import LabReport


class DoctorUpdate(BaseModel):
    specialty: Optional[str] = None
    department: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None
    available_slots: Optional[str] = None
    is_available: Optional[bool] = None
    name: Optional[str] = None
    phone: Optional[str] = None


class ScheduleEntry(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30
    is_active: bool = True


class AppointmentStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


router = APIRouter(prefix="/doctors", tags=["Doctors"])

# Doctor image map — keyed by email
DOCTOR_IMAGES = {
    "rajesh@deepthi.com":  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    "priya@deepthi.com":   "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    "anil@deepthi.com":    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
    "sarah@deepthi.com":   "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
    "meena@deepthi.com":   "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80",
    "vikram@deepthi.com":  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80",
    "ananya@deepthi.com":  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80",
    "suresh@deepthi.com":  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80",
    "kavitha@deepthi.com": "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&q=80",
    "ramesh@deepthi.com":  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80",
}

DOCTOR_REVIEWS = {
    "rajesh@deepthi.com": 248, "priya@deepthi.com": 192, "anil@deepthi.com": 315,
    "sarah@deepthi.com": 167, "meena@deepthi.com": 143, "vikram@deepthi.com": 201,
    "ananya@deepthi.com": 89, "suresh@deepthi.com": 134, "kavitha@deepthi.com": 178,
    "ramesh@deepthi.com": 256,
}


def _format_doctor(d: Doctor, u: User) -> dict:
    exp = d.experience_years
    exp_str = f"{exp}+ Years" if exp else "N/A"
    return {
        "id": d.id,
        "user_id": d.user_id,
        "name": u.name if u else "",
        "email": u.email if u else "",
        "specialty": d.specialty,
        "department": d.department,
        "qualification": d.qualification,
        "experience_years": d.experience_years,
        "experience": exp_str,
        "consultation_fee": d.consultation_fee,
        "bio": d.bio,
        "rating": d.rating,
        "is_available": d.is_available,
        "image": DOCTOR_IMAGES.get(u.email if u else "", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80"),
        "reviews": DOCTOR_REVIEWS.get(u.email if u else "", 0),
    }


# ── Public / Admin routes ─────────────────────────────────────────────────────

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
    user_ids = [d.user_id for d in doctors]
    users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users_map = {u.id: u for u in users_result.scalars().all()}
    return [_format_doctor(d, users_map.get(d.user_id)) for d in doctors]


# ── /me/* routes MUST come before /{doctor_id} ───────────────────────────────

@router.get("/me/profile")
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
    doctor = doc_res.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    data = _format_doctor(doctor, current_user)
    data["available_slots"] = doctor.available_slots
    return data


@router.get("/me/appointments")
async def get_my_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
    doctor = doc_res.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = await db.execute(select(Appointment).where(Appointment.doctor_id == doctor.id))
    appointments = result.scalars().all()

    patient_ids = list({a.patient_id for a in appointments})
    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: {"name": u.name, "phone": u.phone} for p, u in patients_res.all()}

    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "patient": patients_map.get(a.patient_id, {}).get("name", "Unknown"),
            "patient_phone": patients_map.get(a.patient_id, {}).get("phone", ""),
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


@router.get("/me/patients")
async def get_my_patients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
    doctor = doc_res.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = await db.execute(
        select(Appointment.patient_id).where(Appointment.doctor_id == doctor.id).distinct()
    )
    patient_ids = [row[0] for row in result.all()]
    if not patient_ids:
        return []

    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    return [
        {
            "id": p.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "date_of_birth": p.date_of_birth,
            "allergies": p.allergies,
        }
        for p, u in patients_res.all()
    ]


@router.get("/me/prescriptions")
async def get_my_prescriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
    doctor = doc_res.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = await db.execute(select(Prescription).where(Prescription.doctor_id == doctor.id))
    prescriptions = result.scalars().all()

    patient_ids = list({p.patient_id for p in prescriptions})
    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: u.name for p, u in patients_res.all()}

    return [
        {
            "id": rx.id,
            "patient_id": rx.patient_id,
            "patient": patients_map.get(rx.patient_id, "Unknown"),
            "doctor_id": rx.doctor_id,
            "diagnosis": rx.diagnosis,
            "medications": rx.medications,
            "instructions": rx.instructions,
            "status": rx.status,
            "created_at": rx.created_at.isoformat() if rx.created_at else None,
        }
        for rx in prescriptions
    ]


@router.get("/me/lab-reports")
async def get_my_lab_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
    doctor = doc_res.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = await db.execute(select(LabReport).where(LabReport.doctor_id == doctor.id))
    reports = result.scalars().all()

    patient_ids = list({r.patient_id for r in reports})
    patients_res = await db.execute(
        select(Patient, User).join(User, Patient.user_id == User.id).where(Patient.id.in_(patient_ids))
    )
    patients_map = {p.id: u.name for p, u in patients_res.all()}

    return [
        {
            "id": r.id,
            "patient_id": r.patient_id,
            "patient": patients_map.get(r.patient_id, "Unknown"),
            "doctor_id": r.doctor_id,
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


# ── /{doctor_id} routes ───────────────────────────────────────────────────────

@router.get("/{doctor_id}", response_model=dict)
async def get_doctor(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    user_result = await db.execute(select(User).where(User.id == d.user_id))
    u = user_result.scalar_one_or_none()
    data = _format_doctor(d, u)
    data["available_slots"] = d.available_slots
    return data


@router.patch("/{doctor_id}", response_model=dict)
async def update_doctor(
    doctor_id: int,
    data: DoctorUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    user_result = await db.execute(select(User).where(User.id == d.user_id))
    u = user_result.scalar_one_or_none()
    for k, v in data.model_dump(exclude_none=True).items():
        if k in ("name", "phone"):
            continue
        if hasattr(d, k):
            setattr(d, k, v)
    if data.name and u:
        u.name = data.name
    if data.phone and u:
        u.phone = data.phone
    await db.commit()
    await db.refresh(d)
    if u:
        await db.refresh(u)
    result_data = _format_doctor(d, u)
    result_data["available_slots"] = d.available_slots
    return result_data


@router.get("/{doctor_id}/schedule", response_model=list[dict])
async def get_doctor_schedule(
    doctor_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "DOCTOR", "RECEPTION")),
):
    result = await db.execute(select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id))
    schedules = result.scalars().all()
    return [
        {
            "id": s.id,
            "doctor_id": s.doctor_id,
            "day_of_week": s.day_of_week,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "slot_duration_minutes": s.slot_duration_minutes,
            "is_active": s.is_active,
        }
        for s in schedules
    ]


@router.post("/{doctor_id}/schedule", response_model=list[dict])
async def set_doctor_schedule(
    doctor_id: int,
    entries: List[ScheduleEntry],
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN")),
):
    existing = await db.execute(select(DoctorSchedule).where(DoctorSchedule.doctor_id == doctor_id))
    for s in existing.scalars().all():
        await db.delete(s)
    new_schedules = []
    for e in entries:
        s = DoctorSchedule(
            doctor_id=doctor_id,
            day_of_week=e.day_of_week,
            start_time=e.start_time,
            end_time=e.end_time,
            slot_duration_minutes=e.slot_duration_minutes,
            is_active=e.is_active,
        )
        db.add(s)
        new_schedules.append(s)
    await db.commit()
    for s in new_schedules:
        await db.refresh(s)
    return [
        {
            "id": s.id,
            "doctor_id": s.doctor_id,
            "day_of_week": s.day_of_week,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "slot_duration_minutes": s.slot_duration_minutes,
            "is_active": s.is_active,
        }
        for s in new_schedules
    ]


# ── Appointment status updates (shared by doctor + reception) ─────────────────

@router.patch("/appointments/{appointment_id}")
async def update_appointment_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if current_user.role == "DOCTOR":
        doc_res = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
        doctor = doc_res.scalar_one_or_none()
        if not doctor or appt.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    appt.status = data.status.upper()
    if data.notes:
        appt.notes = data.notes
    await db.commit()
    await db.refresh(appt)
    return {"id": appt.id, "status": appt.status, "notes": appt.notes}


@router.patch("/appointments/{appointment_id}/checkin")
async def checkin_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "RECEPTION")),
):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "CONFIRMED"
    await db.commit()
    await db.refresh(appt)
    return {"id": appt.id, "status": appt.status}
