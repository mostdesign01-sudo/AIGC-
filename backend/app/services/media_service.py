"""
本地上传 / 外链收录
"""
from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.db.database import DATA_DIR
from app.models.video import Video
from app.services.gif_service import FFmpegNotFoundError, extract_cover, probe_media
from app.services.ytdlp_service import copy_into_uploads, download_from_url

UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
GIF_DIR = os.path.join(DATA_DIR, "gifs")

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}


def ensure_media_dirs():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(GIF_DIR, exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "exports"), exist_ok=True)


def guess_platform_from_url(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    if "bilibili.com" in host or "b23.tv" in host:
        return "bilibili"
    if "youtube.com" in host or "youtu.be" in host:
        return "youtube"
    if "douyin.com" in host or "iesdouyin.com" in host:
        return "douyin"
    return "link"


def create_from_link(
    db: Session,
    *,
    url: str,
    title: str,
    intro: str = "",
    category_id: Optional[int] = None,
    issue_id: Optional[int] = None,
    cover_url: str = "",
    item_kind: str = "video",
    duration_seconds: int = 0,
    author: str = "",
) -> Video:
    url = (url or "").strip()
    if not url:
        raise ValueError("外链不能为空")
    existing = db.query(Video).filter(Video.url == url).first()
    if existing:
        if issue_id and not existing.issue_id:
            existing.issue_id = issue_id
            db.add(existing)
            db.commit()
            db.refresh(existing)
        return existing

    platform = guess_platform_from_url(url)
    if platform == "link":
        platform = "link"
    video = Video(
        platform=platform if platform in ("bilibili", "youtube", "douyin") else "link",
        video_id=f"link-{uuid.uuid4().hex[:16]}",
        title=title.strip() or url,
        description="",
        url=url,
        cover_url=cover_url or "",
        intro=intro or "",
        category_id=category_id,
        issue_id=issue_id,
        item_kind=item_kind or "video",
        media_type="link",
        duration_seconds=duration_seconds or 0,
        author=author or "",
        author_id="",
        tags="[]",
        ai_summary="",
        collected_at=datetime.now(timezone.utc),
        selected=False,
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def attach_remote_media(db: Session, video: Video) -> Video:
    """把外链拉成本地成片 + 封面。"""
    if not video.url or video.url.startswith("/media/"):
        raise DownloadError("没有可下载的原始链接")
    ensure_media_dirs()
    tmp_dir = os.path.join(DATA_DIR, "tmp", "ytdlp", str(video.id or "new"))
    os.makedirs(tmp_dir, exist_ok=True)
    stem = f"dl-{video.id or uuid.uuid4().hex[:8]}"
    result = download_from_url(video.url, tmp_dir, stem)
    stored = f"{uuid.uuid4().hex}_{os.path.basename(result['video_path'])}"
    abs_video = os.path.join(UPLOAD_DIR, stored)
    copy_into_uploads(result["video_path"], abs_video)
    video.local_media_path = f"uploads/{stored}"
    video.media_type = "video"
    if result.get("thumb_path"):
        cover_name = f"{os.path.splitext(stored)[0]}_cover.jpg"
        copy_into_uploads(result["thumb_path"], os.path.join(UPLOAD_DIR, cover_name))
        video.local_cover_path = f"uploads/{cover_name}"
    else:
        cover_name = f"{os.path.splitext(stored)[0]}_cover.jpg"
        try:
            extract_cover(abs_video, os.path.join(UPLOAD_DIR, cover_name))
            video.local_cover_path = f"uploads/{cover_name}"
        except (FFmpegNotFoundError, Exception):
            pass
    probe = probe_media(abs_video)
    video.duration_seconds = int(probe.get("duration") or result.get("duration") or 0)
    video.orientation = probe.get("orientation") or "unknown"
    if result.get("title") and (not video.title or video.title == video.url):
        video.title = result["title"][:500]
    if result.get("description") and not video.description:
        video.description = result["description"][:2000]
    if result.get("author") and not video.author:
        video.author = result["author"][:100]
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def create_from_upload(
    db: Session,
    *,
    filename: str,
    content: bytes,
    title: str,
    intro: str = "",
    category_id: Optional[int] = None,
    issue_id: Optional[int] = None,
    item_kind: str = "video",
    url: str = "",
    author: str = "",
) -> Video:
    ensure_media_dirs()
    ext = os.path.splitext(filename or "")[1].lower() or ".bin"
    if ext not in IMAGE_EXTS | VIDEO_EXTS:
        raise ValueError(f"不支持的文件类型 {ext}，请上传 mp4/webm/mov 或 jpg/png/webp")

    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename))[:40]
    stored = f"{uuid.uuid4().hex}_{safe}"
    abs_path = os.path.join(UPLOAD_DIR, stored)
    with open(abs_path, "wb") as f:
        f.write(content)

    rel_media = f"uploads/{stored}"
    is_image = ext in IMAGE_EXTS
    media_type = "image" if is_image else "video"
    rel_cover = rel_media if is_image else None
    duration = 0
    orientation = "unknown"

    if not is_image:
        probe = probe_media(abs_path)
        duration = int(probe.get("duration") or 0)
        orientation = probe.get("orientation") or "unknown"
        cover_name = f"{os.path.splitext(stored)[0]}_cover.jpg"
        cover_abs = os.path.join(UPLOAD_DIR, cover_name)
        try:
            extract_cover(abs_path, cover_abs)
            rel_cover = f"uploads/{cover_name}"
        except (FFmpegNotFoundError, Exception):
            rel_cover = None

    video = Video(
        platform="manual",
        video_id=f"manual-{uuid.uuid4().hex[:16]}",
        title=title.strip() or os.path.splitext(filename)[0],
        description="",
        url=url or f"/media/{rel_media}",
        cover_url="",
        intro=intro or "",
        category_id=category_id,
        issue_id=issue_id,
        item_kind=item_kind or "video",
        media_type=media_type,
        local_media_path=rel_media,
        local_cover_path=rel_cover,
        duration_seconds=duration,
        orientation=orientation,
        author=author or "",
        author_id="",
        tags="[]",
        ai_summary="",
        collected_at=datetime.now(timezone.utc),
        selected=False,
        gif_status="none",
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def absolute_media_path(rel: Optional[str]) -> Optional[str]:
    if not rel:
        return None
    if os.path.isabs(rel) and os.path.isfile(rel):
        return rel
    candidate = os.path.join(DATA_DIR, rel)
    return candidate if os.path.isfile(candidate) else None
