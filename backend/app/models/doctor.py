from sqlalchemy import String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Doctor(Base, TimestampMixin):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    specialty: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    qualification: Mapped[str] = mapped_column(String(255), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    consultation_fee: Mapped[float] = mapped_column(Float, default=0.0)
    bio: Mapped[str] = mapped_column(Text, nullable=True)
    available_slots: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    is_available: Mapped[bool] = mapped_column(default=True)

    user: Mapped["User"] = relationship("User", back_populates="doctor_profile")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="doctor")
    prescriptions: Mapped[list["Prescription"]] = relationship("Prescription", back_populates="doctor")
    schedules: Mapped[list["DoctorSchedule"]] = relationship("DoctorSchedule", back_populates="doctor")
