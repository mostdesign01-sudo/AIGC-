"""
简报类型（可配置）
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.category import Category

router = APIRouter()


class CategoryIn(BaseModel):
    slug: Optional[str] = None
    name: str
    sort_order: Optional[int] = None
    is_active: Optional[bool] = True
    item_kind_hint: Optional[str] = "video"


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Category).order_by(Category.sort_order.asc(), Category.id.asc()).all()
    return {"data": [c.to_dict() for c in rows]}


@router.post("")
def create_category(payload: CategoryIn, db: Session = Depends(get_db)):
    slug = (payload.slug or payload.name).strip().lower().replace(" ", "-")
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(400, "slug 已存在")
    max_order = db.query(Category).count()
    cat = Category(
        slug=slug,
        name=payload.name.strip(),
        sort_order=payload.sort_order if payload.sort_order is not None else max_order + 1,
        is_active=True if payload.is_active is None else payload.is_active,
        item_kind_hint=payload.item_kind_hint or "video",
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat.to_dict()


@router.put("/{category_id}")
def update_category(category_id: int, payload: CategoryIn, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(404, "类型不存在")
    cat.name = payload.name.strip()
    if payload.slug:
        cat.slug = payload.slug.strip()
    if payload.sort_order is not None:
        cat.sort_order = payload.sort_order
    if payload.is_active is not None:
        cat.is_active = payload.is_active
    if payload.item_kind_hint:
        cat.item_kind_hint = payload.item_kind_hint
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat.to_dict()
