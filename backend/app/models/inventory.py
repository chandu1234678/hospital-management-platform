from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class InventoryItem(Base, TimestampMixin):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # MEDICINE | EQUIPMENT | CONSUMABLE
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit: Mapped[str] = mapped_column(String(20), nullable=True)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10)
    expiry_date: Mapped[str] = mapped_column(String(20), nullable=True)
    supplier: Mapped[str] = mapped_column(String(255), nullable=True)
    # IN_STOCK | LOW_STOCK | OUT_OF_STOCK | EXPIRED
    status: Mapped[str] = mapped_column(String(20), default="IN_STOCK")
