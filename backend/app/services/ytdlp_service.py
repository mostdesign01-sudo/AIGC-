"""
外链成片：用 yt-dlp 拉本地视频和封面，供 GIF / 拆解使用。
"""
from __future__ import annotations

import glob
import os
import shutil
from typing import Optional

from app.core.config import get_settings


class YtDlpNotFoundError(RuntimeError):
    pass


class DownloadError(RuntimeError):
    pass


VIDEO_HOSTS = ("bilibili", "youtube", "douyin")


def ensure_yt_dlp():
    try:
        import yt_dlp  # noqa: F401
    except ImportError as exc:
        raise YtDlpNotFoundError(
            "未检测到 yt-dlp。请先执行 `pip install yt-dlp`，"
            "B 站若 403 可把浏览器 cookies 导出后设置 YTDLP_COOKIES_FILE。"
        ) from exc


def should_auto_download(platform: str, item_kind: str, download: Optional[bool]) -> bool:
    if download is True:
        return True
    if download is False:
        return False
    return (item_kind or "video") == "video" and (platform or "") in VIDEO_HOSTS


def download_from_url(url: str, dest_dir: str, stem: str, max_seconds: int = 60) -> dict:
    """
    下载最多约 max_seconds 的成片，控制体积。
    返回 video_path / thumb_path / title / description / duration / author。
    """
    ensure_yt_dlp()
    import yt_dlp

    os.makedirs(dest_dir, exist_ok=True)
    outtmpl = os.path.join(dest_dir, f"{stem}.%(ext)s")
    settings = get_settings()
    cookies = (settings.ytdlp_cookies_file or "").strip()

    opts = {
        "outtmpl": outtmpl,
        "format": "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "writethumbnail": True,
        "max_filesize": 40 * 1024 * 1024,
        "socket_timeout": 30,
        "retries": 2,
    }
    if cookies and os.path.isfile(cookies):
        opts["cookiefile"] = cookies

    try:
        from yt_dlp.utils import download_range_func
        opts["download_ranges"] = download_range_func(None, [(0, max_seconds)])
        opts["force_keyframes_at_cuts"] = True
    except Exception:
        pass

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except YtDlpNotFoundError:
        raise
    except Exception as exc:
        raise DownloadError(f"yt-dlp 下载失败：{exc}") from exc

    if not info:
        raise DownloadError("yt-dlp 没有返回视频信息")

    video_path = _find_video(dest_dir, stem)
    if not video_path:
        raise DownloadError("下载完成但没有找到视频文件")

    thumb = _find_thumb(dest_dir, stem)
    duration = info.get("duration") or 0
    try:
        duration = int(float(duration))
    except (TypeError, ValueError):
        duration = 0

    return {
        "video_path": video_path,
        "thumb_path": thumb,
        "title": (info.get("title") or "").strip(),
        "description": (info.get("description") or "").strip(),
        "duration": duration,
        "author": (info.get("uploader") or info.get("channel") or "").strip(),
        "webpage_url": info.get("webpage_url") or url,
    }


def _find_video(dest_dir: str, stem: str) -> Optional[str]:
    for ext in (".mp4", ".webm", ".mkv", ".mov", ".m4v"):
        path = os.path.join(dest_dir, stem + ext)
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            return path
    matches = [
        p for p in glob.glob(os.path.join(dest_dir, stem + ".*"))
        if os.path.splitext(p)[1].lower() not in {".jpg", ".jpeg", ".png", ".webp", ".vtt", ".json"}
    ]
    return matches[0] if matches else None


def _find_thumb(dest_dir: str, stem: str) -> Optional[str]:
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        path = os.path.join(dest_dir, stem + ext)
        if os.path.isfile(path):
            return path
    return None


def copy_into_uploads(src: str, dest_abs: str) -> str:
    os.makedirs(os.path.dirname(dest_abs), exist_ok=True)
    shutil.copy2(src, dest_abs)
    return dest_abs
