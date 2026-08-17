"""
简报类型（可配置，默认 9 类）
"""
from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(80), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    item_kind_hint = Column(String(20), default="video")  # video / tool / model

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "sort_order": self.sort_order,
            "is_active": bool(self.is_active),
            "item_kind_hint": self.item_kind_hint or "video",
        }
