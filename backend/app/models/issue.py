"""
双周刊期号
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    vol_number = Column(Integer, nullable=False, unique=True, index=True)
    title = Column(String(200), default="AIGC创意双周报 · 创意灵感")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    summary = Column(Text, default="")
    status = Column(String(30), default="collecting", nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "vol_number": self.vol_number,
            "vol_label": f"VOL.{self.vol_number:02d}",
            "title": self.title or "AIGC创意双周报 · 创意灵感",
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "date_label": _date_label(self.start_date, self.end_date),
            "summary": self.summary or "",
            "status": self.status or "collecting",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


def _date_label(start, end) -> str:
    if not start or not end:
        return ""
    return f"{start.strftime('%Y.%m.%d')} – {end.strftime('%Y.%m.%d')}"
