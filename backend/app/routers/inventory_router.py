from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.inventory import InventoryItem
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("", response_model=InventoryResponse, status_code=201)
async def create_item(data: InventoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    item = InventoryItem(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("", response_model=list[InventoryResponse])
async def list_items(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "DOCTOR")),
):
    q = select(InventoryItem)
    if category:
        q = q.where(InventoryItem.category == category)
    if status:
        q = q.where(InventoryItem.status == status)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/{item_id}", response_model=InventoryResponse)
async def update_item(item_id: int, data: InventoryUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(require_roles("ADMIN"))):
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()


