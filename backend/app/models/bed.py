from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Bed(Base, TimestampMixin):
    __tablename__ = "beds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    bed_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    ward: Mapped[str] = mapped_column(String(100), nullable=False)
    bed_type: Mapped[str] = mapped_column(String(50), nullable=False)  # GENERAL | ICU | PRIVATE | SEMI_PRIVATE
    # AVAILABLE | OCCUPIED | MAINTENANCE | RESERVED
    status: Mapped[str] = mapped_column(String(20), default="AVAILABLE")
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="SET NULL"), nullable=True)
    admitted_at: Mapped[str] = mapped_column(String(30), nullable=True)
    notes: Mapped[str] = mapped_column(String(500), nullable=True)
