from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LabReportCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    appointment_id: Optional[int] = None
    test_name: str
    test_type: Optional[str] = None
    results: Optional[str] = None
    report_date: Optional[str] = None
    remarks: Optional[str] = None


class LabReportUpdate(BaseModel):
    results: Optional[str] = None
    report_date: Optional[str] = None
    status: Optional[str] = None
    file_url: Optional[str] = None
    remarks: Optional[str] = None


class LabReportResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int]
    test_name: str
    test_type: Optional[str]
    results: Optional[str]
    report_date: Optional[str]
    status: str
    file_url: Optional[str]
    remarks: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
