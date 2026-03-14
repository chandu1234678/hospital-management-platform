from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(data: AppointmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    # Auto-assign token number for the day
    result = await db.execute(
        select(func.count()).where(
            Appointment.appointment_date == data.appointment_date,
            Appointment.doctor_id == data.doctor_id,
        )
    )
    token = (result.scalar() or 0) + 1

    appt = Appointment(**data.model_dump(), token_number=token)
    db.add(appt)
    await db.commit()
    await db.refresh(appt)
    return appt


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(Appointment)
    if patient_id:
        q = q.where(Appointment.patient_id == patient_id)
    if doctor_id:
        q = q.where(Appointment.doctor_id == doctor_id)
    if status:
        q = q.where(Appointment.status == status)
    if date:
        q = q.where(Appointment.appointment_date == date)
    result = await db.execute(q.order_by(Appointment.appointment_date.desc()))
    return result.scalars().all()


@router.get("/{appt_id}", response_model=AppointmentResponse)
async def get_appointment(appt_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Appointment).where(Appointment.id == appt_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.patch("/{appt_id}", response_model=AppointmentResponse)
async def update_appointment(appt_id: int, data: AppointmentUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Appointment).where(Appointment.id == appt_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(appt, k, v)
    await db.commit()
    await db.refresh(appt)
    return appt


@router.delete("/{appt_id}", status_code=204)
async def cancel_appointment(appt_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Appointment).where(Appointment.id == appt_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "CANCELLED"
    await db.commit()



# ── Payment endpoints ────────────────────────────────────────────────────────
import hmac as hmac_module, hashlib, razorpay
from datetime import datetime, timezone
from pydantic import BaseModel
from app.core.config import settings
from app.models.billing import Bill


def _gen_bill_number() -> str:
    return f"BILL-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"


class ApptPayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/{appt_id}/pay", tags=["Payments"])
async def create_appointment_order(
    appt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Razorpay order for appointment consultation fee."""
    result = await db.execute(select(Appointment).where(Appointment.id == appt_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID == "rzp_test_REPLACE_ME":
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    # Check if already has a paid bill
    bill_result = await db.execute(select(Bill).where(Bill.appointment_id == appt_id, Bill.status == "PAID"))
    if bill_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Appointment fee already paid")

    # Use fee from notes or default 500
    fee = 500.0
    try:
        if appt.notes and "fee:" in appt.notes:
            fee = float(appt.notes.split("fee:")[1].split()[0])
    except Exception:
        pass

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    order = client.order.create({
        "amount": int(fee * 100),
        "currency": "INR",
        "receipt": f"APPT-{appt_id}",
        "notes": {"appt_id": str(appt_id), "patient_id": str(appt.patient_id)},
    })

    return {
        "order_id": order["id"],
        "amount": int(fee * 100),
        "currency": "INR",
        "fee": fee,
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/{appt_id}/pay/verify", tags=["Payments"])
async def verify_appointment_payment(
    appt_id: int,
    data: ApptPayVerify,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify payment and create a PAID bill for the appointment."""
    result = await db.execute(select(Appointment).where(Appointment.id == appt_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac_module.new(
        settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256
    ).hexdigest()
    if not hmac_module.compare_digest(expected, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Create a PAID bill for this appointment
    import json
    fee = 500.0
    bill = Bill(
        patient_id=appt.patient_id,
        appointment_id=appt_id,
        bill_number=_gen_bill_number(),
        items=json.dumps([{"name": "Consultation Fee", "amount": fee}]),
        subtotal=fee,
        tax=0.0,
        total=fee,
        status="PAID",
        payment_method="RAZORPAY",
        paid_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
    db.add(bill)
    appt.status = "CONFIRMED"
    await db.commit()
    await db.refresh(bill)
    return {"status": "ok", "bill_number": bill.bill_number, "appt_status": appt.status}
