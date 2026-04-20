"""
视频数据模型
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base
from datetime import datetime


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False, index=True)  # bilibili/youtube/douyin
    video_id = Column(String(100), nullable=False, unique=True)  # 平台视频ID
    title = Column(String(500), nullable=False)
    description = Column(Text)  # 视频原始简介
    url = Column(String(500), nullable=False)
    cover_url = Column(String(500))  # 原始封面URL
    qiniu_cover_url = Column(String(500))  # 七牛云封面URL
    play_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    author = Column(String(100))
    author_id = Column(String(100))
    tags = Column(Text)  # JSON格式标签
    ai_summary = Column(Text)  # AI生成的简介
    collected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "platform": self.platform,
            "video_id": self.video_id,
            "title": self.title,
            "description": self.description,
            "url": self.url,
            "cover_url": self.cover_url,
            "qiniu_cover_url": self.qiniu_cover_url,
            "play_count": self.play_count,
            "like_count": self.like_count,
            "author": self.author,
            "author_id": self.author_id,
            "tags": self.tags,
            "ai_summary": self.ai_summary,
            "collected_at": self.collected_at.isoformat() if self.collected_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }