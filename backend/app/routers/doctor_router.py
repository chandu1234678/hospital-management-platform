from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.patient import Patient

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


@router.get("/me/appointments")
async def get_my_appointments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get appointments for the logged-in doctor."""
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
    """Get unique patients seen by the logged-in doctor."""
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
