from sqlalchemy import String, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Bill(Base, TimestampMixin):
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"))
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    bill_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    items: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax: Mapped[float] = mapped_column(Float, default=0.0)
    discount: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    # PENDING | PAID | PARTIAL | CANCELLED
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    payment_method: Mapped[str] = mapped_column(String(50), nullable=True)
    paid_at: Mapped[str] = mapped_column(String(50), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="bills")
    appointment: Mapped["Appointment"] = relationship("Appointment", back_populates="bill")
