from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class LabReport(Base, TimestampMixin):
    __tablename__ = "lab_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    test_type: Mapped[str] = mapped_column(String(100), nullable=True)
    results: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string
    report_date: Mapped[str] = mapped_column(String(20), nullable=True)
    # PENDING | PROCESSING | COMPLETED
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    file_url: Mapped[str] = mapped_column(String(500), nullable=True)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="lab_reports")
