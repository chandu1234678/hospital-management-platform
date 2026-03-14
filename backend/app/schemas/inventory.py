from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InventoryCreate(BaseModel):
    name: str
    category: str
    sku: Optional[str] = None
    quantity: int = 0
    unit: Optional[str] = None
    unit_price: float = 0.0
    reorder_level: int = 10
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    status: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None


class InventoryResponse(BaseModel):
    id: int
    name: str
    category: str
    sku: Optional[str]
    quantity: int
    unit: Optional[str]
    unit_price: float
    reorder_level: int
    expiry_date: Optional[str]
    supplier: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
