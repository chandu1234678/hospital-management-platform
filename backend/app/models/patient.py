from sqlalchemy import String, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    date_of_birth: Mapped[str] = mapped_column(String(20), nullable=True)
    gender: Mapped[str] = mapped_column(String(10), nullable=True)
    blood_group: Mapped[str] = mapped_column(String(5), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[str] = mapped_column(String(255), nullable=True)
    allergies: Mapped[str] = mapped_column(Text, nullable=True)
    medical_history: Mapped[str] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="patient")
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="patient")
    lab_reports: Mapped[list["LabReport"]] = relationship("LabReport", back_populates="patient")
    bills: Mapped[list["Bill"]] = relationship("Bill", back_populates="patient")
