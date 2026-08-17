"""
创意素材（在原 Video 上扩展：类型、期号、入选、本地媒体、GIF）
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime


SOURCE_LABELS = {
    "bilibili": "B站",
    "youtube": "YouTube",
    "douyin": "抖音",
    "manual": "手动上传",
    "link": "外链",
}


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False, index=True)  # bilibili/youtube/douyin/manual/link
    video_id = Column(String(100), nullable=False, unique=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    url = Column(String(500), nullable=False)
    cover_url = Column(String(500))
    qiniu_cover_url = Column(String(500))
    play_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    author = Column(String(100))
    author_id = Column(String(100))
    tags = Column(Text)
    ai_summary = Column(Text)
    collected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- 出报工作台扩展 ---
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True, index=True)
    intro = Column(Text)  # 编辑手改介绍（出报用）
    duration_seconds = Column(Integer, default=0)
    media_type = Column(String(20), default="video")  # video / image / link
    item_kind = Column(String(20), default="video")  # video / tool / model
    local_media_path = Column(String(500))
    local_cover_path = Column(String(500))
    gif_path = Column(String(500))
    gif_status = Column(String(20), default="none")  # none / pending / ready / failed
    gif_error = Column(Text)
    selected = Column(Boolean, default=False, nullable=False)
    selected_rank = Column(Integer, nullable=True)
    orientation = Column(String(20), default="unknown")  # portrait / landscape / unknown

    category = relationship("Category")
    issue = relationship("Issue")

    def to_dict(self):
        cover = self.display_cover()
        return {
            "id": self.id,
            "platform": self.platform,
            "source": self.platform,
            "source_label": SOURCE_LABELS.get(self.platform, self.platform),
            "video_id": self.video_id,
            "title": self.title,
            "description": self.description,
            "url": self.url,
            "cover_url": self.cover_url,
            "qiniu_cover_url": self.qiniu_cover_url,
            "display_cover": cover,
            "play_count": self.play_count or 0,
            "like_count": self.like_count or 0,
            "author": self.author,
            "author_id": self.author_id,
            "tags": self.tags,
            "ai_summary": self.ai_summary,
            "intro": self.intro or "",
            "brief_intro": (self.intro or self.ai_summary or "").strip(),
            "duration_seconds": self.duration_seconds or 0,
            "duration_label": format_duration(self.duration_seconds or 0),
            "media_type": self.media_type or "video",
            "item_kind": self.item_kind or "video",
            "local_media_path": self.local_media_path,
            "local_cover_path": self.local_cover_path,
            "media_url": to_media_url(self.local_media_path),
            "gif_path": self.gif_path,
            "gif_url": to_media_url(self.gif_path),
            "gif_status": self.gif_status or "none",
            "gif_error": self.gif_error,
            "selected": bool(self.selected),
            "selected_rank": self.selected_rank,
            "orientation": self.orientation or "unknown",
            "category_id": self.category_id,
            "category": self.category.to_dict() if self.category else None,
            "issue_id": self.issue_id,
            "collected_at": self.collected_at.isoformat() if self.collected_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def display_cover(self):
        if self.local_cover_path:
            return to_media_url(self.local_cover_path)
        if self.qiniu_cover_url:
            return self.qiniu_cover_url
        if self.cover_url:
            if self.cover_url.startswith("//"):
                return "https:" + self.cover_url
            return self.cover_url
        return None


def to_media_url(path: str | None):
    if not path:
        return None
    if path.startswith("http://") or path.startswith("https://") or path.startswith("/"):
        return path
    return "/media/" + path.lstrip("/")


def format_duration(seconds: int) -> str:
    seconds = int(seconds or 0)
    if seconds <= 0:
        return ""
    minutes, sec = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{sec:02d}"
    return f"{minutes}:{sec:02d}"
