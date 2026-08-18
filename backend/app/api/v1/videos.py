"""
视频 / 素材 API
"""
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.video import Video
from app.services.deconstruct_service import deconstruct_video
from app.services.gif_service import FFmpegNotFoundError, GifError, generate_2x_gif
from app.services.issue_service import get_or_create_current_issue
from app.services.media_service import (
    GIF_DIR,
    absolute_media_path,
    attach_remote_media,
    create_from_link,
    create_from_upload,
    ensure_media_dirs,
)
from app.services.ytdlp_service import DownloadError, YtDlpNotFoundError, should_auto_download

router = APIRouter()


class VideoPatch(BaseModel):
    title: Optional[str] = None
    intro: Optional[str] = None
    ai_summary: Optional[str] = None
    category_id: Optional[int] = None
    issue_id: Optional[int] = None
    item_kind: Optional[str] = None
    url: Optional[str] = None
    cover_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    author: Optional[str] = None


class LinkIn(BaseModel):
    url: str
    title: str
    intro: Optional[str] = ""
    category_id: Optional[int] = None
    issue_id: Optional[int] = None
    cover_url: Optional[str] = ""
    item_kind: Optional[str] = "video"
    duration_seconds: Optional[int] = 0
    author: Optional[str] = ""
    assign_current: bool = True
    download: Optional[bool] = None


@router.get("")
def get_videos(
    platform: Optional[str] = None,
    issue_id: Optional[int] = None,
    category_id: Optional[int] = None,
    selected: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """获取视频列表（兼容旧接口，并支持期号/类型筛选）"""
    query = db.query(Video)

    if platform:
        query = query.filter(Video.platform == platform)
    if issue_id is not None:
        query = query.filter(Video.issue_id == issue_id)
    if category_id is not None:
        query = query.filter(Video.category_id == category_id)
    if selected is not None:
        query = query.filter(Video.selected.is_(selected))

    total = query.count()
    videos = query.order_by(Video.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [v.to_dict() for v in videos],
    }


@router.get("/best")
def best_of_fortnight(
    days: int = Query(14, ge=1, le=60),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """旧「双周最佳」：过去 N 天按播放量取热门。发现用，不是出报入选。"""
    from datetime import datetime, timedelta, timezone

    since = datetime.now(timezone.utc) - timedelta(days=days)
    videos = (
        db.query(Video)
        .filter(Video.collected_at >= since)
        .order_by(Video.play_count.desc())
        .limit(limit)
        .all()
    )
    return {
        "days": days,
        "limit": limit,
        "total": len(videos),
        "data": [v.to_dict() for v in videos],
        "note": "按播放量热度发现，与当期「入选简报」3 条不是同一套逻辑",
    }


@router.post("/from-link")
def ingest_link(payload: LinkIn, db: Session = Depends(get_db)):
    issue_id = payload.issue_id
    if payload.assign_current and not issue_id:
        issue_id = get_or_create_current_issue(db).id
    try:
        video = create_from_link(
            db,
            url=payload.url,
            title=payload.title,
            intro=payload.intro or "",
            category_id=payload.category_id,
            issue_id=issue_id,
            cover_url=payload.cover_url or "",
            item_kind=payload.item_kind or "video",
            duration_seconds=payload.duration_seconds or 0,
            author=payload.author or "",
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    body = video.to_dict()
    if should_auto_download(video.platform, video.item_kind or "video", payload.download):
        try:
            video = attach_remote_media(db, video)
            body = video.to_dict()
        except YtDlpNotFoundError as exc:
            if payload.download is True:
                raise HTTPException(503, str(exc))
            body["download_error"] = str(exc)
        except DownloadError as exc:
            body["download_error"] = str(exc)
    return body


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    title: str = Form(""),
    intro: str = Form(""),
    category_id: Optional[int] = Form(None),
    issue_id: Optional[int] = Form(None),
    item_kind: str = Form("video"),
    url: str = Form(""),
    author: str = Form(""),
    assign_current: bool = Form(True),
    db: Session = Depends(get_db),
):
    if assign_current and not issue_id:
        issue_id = get_or_create_current_issue(db).id
    content = await file.read()
    if not content:
        raise HTTPException(400, "空文件")
    if len(content) > 80 * 1024 * 1024:
        raise HTTPException(400, "文件超过 80MB")
    try:
        video = create_from_upload(
            db,
            filename=file.filename or "upload.bin",
            content=content,
            title=title,
            intro=intro,
            category_id=category_id,
            issue_id=issue_id,
            item_kind=item_kind,
            url=url,
            author=author,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    return video.to_dict()


@router.get("/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    """获取单个视频"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return {"error": "视频不存在"}
    return video.to_dict()


@router.patch("/{video_id}")
def patch_video(video_id: int, payload: VideoPatch, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(video, key, value)
    db.add(video)
    db.commit()
    db.refresh(video)
    return video.to_dict()


@router.post("/{video_id}/assign-current")
def assign_current(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    issue = get_or_create_current_issue(db)
    video.issue_id = issue.id
    db.add(video)
    db.commit()
    db.refresh(video)
    return video.to_dict()


@router.post("/{video_id}/gif")
def make_gif(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    src = absolute_media_path(video.local_media_path)
    if not src:
        raise HTTPException(400, "该条目没有本地视频，无法生成 GIF。请先「下载成片」或手动上传。")
    if video.media_type == "image":
        raise HTTPException(400, "图片条目无需生成 GIF")

    ensure_media_dirs()
    out_name = f"item-{video.id}.gif"
    out_abs = os_path_join_gif(out_name)
    video.gif_status = "pending"
    video.gif_error = None
    db.add(video)
    db.commit()

    try:
        result = generate_2x_gif(src, out_abs, orientation=video.orientation or "unknown")
        video.gif_path = f"gifs/{out_name}"
        video.gif_status = "ready"
        video.gif_error = result.get("warning")
        if result.get("orientation"):
            video.orientation = result["orientation"]
    except FFmpegNotFoundError as exc:
        video.gif_status = "failed"
        video.gif_error = str(exc)
        db.add(video)
        db.commit()
        raise HTTPException(503, str(exc))
    except GifError as exc:
        video.gif_status = "failed"
        video.gif_error = str(exc)
        db.add(video)
        db.commit()
        raise HTTPException(400, str(exc))

    db.add(video)
    db.commit()
    db.refresh(video)
    return video.to_dict()


@router.post("/{video_id}/fetch-media")
def fetch_media(video_id: int, db: Session = Depends(get_db)):
    """把外链拉成本地成片，之后才能出 GIF / 画面拆解。"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    try:
        video = attach_remote_media(db, video)
    except YtDlpNotFoundError as exc:
        raise HTTPException(503, str(exc))
    except DownloadError as exc:
        raise HTTPException(400, str(exc))
    return video.to_dict()


@router.post("/{video_id}/deconstruct")
def deconstruct_item(
    video_id: int,
    overwrite_intro: bool = False,
    db: Session = Depends(get_db),
):
    """拆解怎么做 / 创意点 / 能用在哪。写入 AI 摘要；介绍为空时一并填上。"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    result = deconstruct_video(video, overwrite_intro=overwrite_intro)
    db.add(video)
    db.commit()
    db.refresh(video)
    body = video.to_dict()
    body["deconstruct"] = result
    return body


@router.get("/{video_id}/gif")
def download_gif(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "视频不存在")
    path = absolute_media_path(video.gif_path)
    if not path:
        raise HTTPException(404, "尚未生成 GIF")
    filename = f"VOL-item-{video.id}-2x.gif"
    return FileResponse(path, media_type="image/gif", filename=filename)


@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """删除视频"""
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return {"error": "视频不存在"}
    db.delete(video)
    db.commit()
    return {"message": "删除成功"}


def os_path_join_gif(name: str) -> str:
    import os
    return os.path.join(GIF_DIR, name)
