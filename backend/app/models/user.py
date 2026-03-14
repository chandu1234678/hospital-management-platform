from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="PATIENT", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # relationships
    patient_profile: Mapped["Patient"] = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile: Mapped["Doctor"] = relationship("Doctor", back_populates="user", uselist=False)
