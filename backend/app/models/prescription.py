from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"))
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    diagnosis: Mapped[str] = mapped_column(Text, nullable=True)
    medications: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    instructions: Mapped[str] = mapped_column(Text, nullable=True)
    valid_until: Mapped[str] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")  # ACTIVE | EXPIRED | DISPENSED

    patient: Mapped["Patient"] = relationship("Patient", back_populates="prescriptions")
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="prescriptions")
