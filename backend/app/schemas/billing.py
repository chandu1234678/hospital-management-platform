from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BillCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    items: str  # JSON string
    subtotal: float
    tax: float = 0.0
    discount: float = 0.0
    total: float
    notes: Optional[str] = None


class BillUpdate(BaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    paid_at: Optional[str] = None
    discount: Optional[float] = None
    notes: Optional[str] = None


class BillResponse(BaseModel):
    id: int
    patient_id: int
    appointment_id: Optional[int]
    bill_number: str
    items: str
    subtotal: float
    tax: float
    discount: float
    total: float
    status: str
    payment_method: Optional[str]
    paid_at: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
