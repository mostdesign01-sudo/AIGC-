"""
视频API
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.video import Video
import json

router = APIRouter()


@router.get("")
def get_videos(
    platform: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取视频列表"""
    query = db.query(Video)
    
    if platform:
        query = query.filter(Video.platform == platform)
    
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [v.to_dict() for v in videos]
    }


@router.get("/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    """获取单个视频"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return {"error": "视频不存在"}
    return video.to_dict()


@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """删除视频"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return {"error": "视频不存在"}
    db.delete(video)
    db.commit()
    return {"message": "删除成功"}