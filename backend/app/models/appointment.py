from sqlalchemy import String, Date, Time, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"))
    appointment_date: Mapped[str] = mapped_column(String(20), nullable=False)
    appointment_time: Mapped[str] = mapped_column(String(20), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    # SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
    status: Mapped[str] = mapped_column(String(20), default="SCHEDULED")
    token_number: Mapped[int] = mapped_column(nullable=True)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="appointments")
    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="appointments")
    bill: Mapped["Bill"] = relationship("Bill", back_populates="appointment", uselist=False)
