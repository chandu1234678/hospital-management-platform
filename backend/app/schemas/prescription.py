from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    diagnosis: Optional[str] = None
    medications: str  # JSON string
    instructions: Optional[str] = None
    valid_until: Optional[str] = None


class PrescriptionUpdate(BaseModel):
    diagnosis: Optional[str] = None
    medications: Optional[str] = None
    instructions: Optional[str] = None
    status: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int]
    diagnosis: Optional[str]
    medications: str
    instructions: Optional[str]
    valid_until: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
