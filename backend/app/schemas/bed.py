from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BedCreate(BaseModel):
    bed_number: str
    ward: str
    bed_type: str
    notes: Optional[str] = None


class BedUpdate(BaseModel):
    status: Optional[str] = None
    patient_id: Optional[int] = None
    admitted_at: Optional[str] = None
    notes: Optional[str] = None


class BedResponse(BaseModel):
    id: int
    bed_number: str
    ward: str
    bed_type: str
    status: str
    patient_id: Optional[int]
    admitted_at: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
