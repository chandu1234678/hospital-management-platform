import hmac as hmac_module
import hashlib, razorpay
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.config import settings
from app.models.user import User
from app.models.billing import Bill
from app.schemas.billing import BillCreate, BillUpdate, BillResponse
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["Billing"])


def _gen_bill_number() -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"BILL-{ts}"


def _razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("", response_model=BillResponse, status_code=201)
async def create_bill(data: BillCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN", "RECEPTION"))):
    bill = Bill(**data.model_dump(), bill_number=_gen_bill_number())
    db.add(bill)
    await db.commit()
    await db.refresh(bill)
    return bill


@router.get("", response_model=list[BillResponse])
async def list_bills(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(Bill)
    if patient_id:
        q = q.where(Bill.patient_id == patient_id)
    if status:
        q = q.where(Bill.status == status)
    result = await db.execute(q.order_by(Bill.created_at.desc()))
    return result.scalars().all()


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.patch("/{bill_id}", response_model=BillResponse)
async def update_bill(bill_id: int, data: BillUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN", "RECEPTION"))):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(bill, k, v)
    await db.commit()
    await db.refresh(bill)
    return bill




@router.post("/{bill_id}/pay", tags=["Payments"])
async def create_payment_order(
    bill_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a Razorpay order for a pending bill."""
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    if bill.status == "PAID":
        raise HTTPException(status_code=400, detail="Bill is already paid")

    if not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID == "rzp_test_REPLACE_ME":
        raise HTTPException(status_code=503, detail="Payment gateway not configured. Add RAZORPAY_KEY_ID to .env")

    client = _razorpay_client()
    amount_paise = int(bill.total * 100)  # Razorpay uses paise
    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": bill.bill_number,
        "notes": {
            "bill_id": str(bill.id),
            "patient_id": str(bill.patient_id),
        }
    })

    return {
        "order_id": order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "bill_number": bill.bill_number,
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/{bill_id}/verify", response_model=BillResponse, tags=["Payments"])
async def verify_payment(
    bill_id: int,
    data: PaymentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify Razorpay payment signature and mark bill as PAID."""
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    # Verify HMAC-SHA256 signature
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac_module.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac_module.compare_digest(expected, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed — invalid signature")

    # Mark bill as paid
    bill.status = "PAID"
    bill.payment_method = "RAZORPAY"
    bill.paid_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    await db.commit()
    await db.refresh(bill)
    return bill


@router.post("/webhook/razorpay", tags=["Payments"], include_in_schema=False)
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Razorpay webhook — auto-marks bills PAID on payment.captured event."""
    body = await request.body()
    sig = request.headers.get("X-Razorpay-Signature", "")

    if settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_KEY_SECRET != "REPLACE_ME":
        expected = hmac_module.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac_module.compare_digest(expected, sig):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    payload = json.loads(body)
    event = payload.get("event")

    if event == "payment.captured":
        notes = payload.get("payload", {}).get("payment", {}).get("entity", {}).get("notes", {})
        bill_id = notes.get("bill_id")
        if bill_id:
            result = await db.execute(select(Bill).where(Bill.id == int(bill_id)))
            bill = result.scalar_one_or_none()
            if bill and bill.status != "PAID":
                bill.status = "PAID"
                bill.payment_method = "RAZORPAY"
                bill.paid_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                await db.commit()

    return {"status": "ok"}
