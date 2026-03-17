from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientCreate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None


class PatientUpdate(PatientCreate):
    name: Optional[str] = None
    phone: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str]
    gender: Optional[str]
    blood_group: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]
    allergies: Optional[str]
    medical_history: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
