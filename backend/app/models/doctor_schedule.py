from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class DoctorSchedule(Base, TimestampMixin):
    __tablename__ = "doctor_schedules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"))
    day_of_week: Mapped[str] = mapped_column(String(10), nullable=False)  # MON | TUE | ...
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)
    slot_duration_minutes: Mapped[int] = mapped_column(default=30)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    doctor: Mapped["Doctor"] = relationship("Doctor", back_populates="schedules")
