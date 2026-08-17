"""
入选视频 → 2 倍速短循环 GIF（竖版优先、控制体积）。
"""
from __future__ import annotations

import os
import shutil
import subprocess
from typing import Optional

from app.core.config import get_settings


class FFmpegNotFoundError(RuntimeError):
    pass


class GifError(RuntimeError):
    pass


def ffmpeg_bin() -> str:
    settings = get_settings()
    configured = (settings.ffmpeg_path or "").strip()
    if configured and os.path.isfile(configured) and os.access(configured, os.X_OK):
        return configured
    found = shutil.which("ffmpeg")
    if found:
        return found
    raise FFmpegNotFoundError(
        "未检测到 ffmpeg。请先安装后再生成 GIF："
        "macOS 使用 `brew install ffmpeg`，"
        "Debian/Ubuntu 使用 `sudo apt-get install -y ffmpeg`。"
        "也可在环境变量 FFMPEG_PATH 中指定可执行文件路径。"
    )


def ffprobe_bin() -> Optional[str]:
    settings = get_settings()
    configured = (settings.ffprobe_path or "").strip()
    if configured and os.path.isfile(configured):
        return configured
    return shutil.which("ffprobe")


def probe_media(path: str) -> dict:
    """读取时长、宽高。ffprobe 不可用时返回空信息。"""
    info = {"duration": 0.0, "width": 0, "height": 0, "orientation": "unknown"}
    probe = ffprobe_bin()
    if not probe or not os.path.isfile(path):
        return info
    cmd = [
        probe, "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-show_entries", "format=duration",
        "-of", "json",
        path,
    ]
    try:
        raw = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=30)
        import json
        data = json.loads(raw.decode("utf-8", errors="replace"))
        stream = (data.get("streams") or [{}])[0]
        fmt = data.get("format") or {}
        width = int(float(stream.get("width") or 0))
        height = int(float(stream.get("height") or 0))
        duration = stream.get("duration") or fmt.get("duration") or 0
        try:
            duration = float(duration)
        except (TypeError, ValueError):
            duration = 0.0
        info.update({
            "duration": duration,
            "width": width,
            "height": height,
            "orientation": "portrait" if height >= width and height > 0 else (
                "landscape" if width > height else "unknown"
            ),
        })
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ValueError, OSError):
        pass
    return info


def extract_cover(video_path: str, cover_path: str) -> str:
    ffmpeg = ffmpeg_bin()
    os.makedirs(os.path.dirname(cover_path), exist_ok=True)
    cmd = [
        ffmpeg, "-y", "-i", video_path,
        "-vframes", "1", "-q:v", "3",
        cover_path,
    ]
    _run(cmd, "提取封面失败")
    return cover_path


def generate_2x_gif(input_path: str, output_path: str, orientation: str = "unknown") -> dict:
    """
    将视频转为 2 倍速短循环 GIF。
    竖版优先按竖版出图；限制片源秒数、分辨率和调色板，避免巨大文件。
    """
    if not os.path.isfile(input_path):
        raise GifError("找不到源视频文件")

    ffmpeg = ffmpeg_bin()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    probe = probe_media(input_path)
    orient = orientation if orientation in ("portrait", "landscape") else probe.get("orientation") or "unknown"
    portrait = orient == "portrait" or (
        probe.get("height", 0) >= probe.get("width", 0) and probe.get("height", 0) > 0
    )

    # 先用较稳妥的参数，超体积再收一档
    attempts = [
        {"src_seconds": 6, "fps": 10, "width": 360 if portrait else 480, "colors": 64},
        {"src_seconds": 4, "fps": 8, "width": 280 if portrait else 400, "colors": 48},
    ]

    last_error = None
    for params in attempts:
        try:
            _encode_gif(ffmpeg, input_path, output_path, params)
            size = os.path.getsize(output_path) if os.path.isfile(output_path) else 0
            if size <= 0:
                last_error = "GIF 文件为空"
                continue
            if size <= 2_500_000:
                return {
                    "path": output_path,
                    "size_bytes": size,
                    "orientation": "portrait" if portrait else "landscape",
                    "params": params,
                }
            # 太大则尝试下一档
            last_error = f"GIF 体积 {size} 字节偏大，尝试更小参数"
        except GifError as exc:
            last_error = str(exc)

    if os.path.isfile(output_path) and os.path.getsize(output_path) > 0:
        return {
            "path": output_path,
            "size_bytes": os.path.getsize(output_path),
            "orientation": "portrait" if portrait else "landscape",
            "params": attempts[-1],
            "warning": last_error,
        }
    raise GifError(last_error or "GIF 生成失败")


def _encode_gif(ffmpeg: str, input_path: str, output_path: str, params: dict) -> None:
    src_seconds = params["src_seconds"]
    fps = params["fps"]
    width = params["width"]
    colors = params["colors"]
    # setpts=0.5*PTS => 2x speed; 源取 src_seconds，输出约 src_seconds/2
    vf = (
        f"setpts=0.5*PTS,fps={fps},"
        f"scale={width}:-2:flags=lanczos,"
        f"split[s0][s1];[s0]palettegen=max_colors={colors}:stats_mode=diff[p];"
        f"[s1][p]paletteuse=dither=bayer:bayer_scale=3"
    )
    cmd = [
        ffmpeg, "-y",
        "-t", str(src_seconds),
        "-i", input_path,
        "-an",
        "-filter_complex", vf,
        "-loop", "0",
        output_path,
    ]
    _run(cmd, "ffmpeg 生成 GIF 失败")


def _run(cmd: list, err_prefix: str) -> None:
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=120,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise GifError(f"{err_prefix}：超时") from exc
    except OSError as exc:
        raise GifError(f"{err_prefix}：{exc}") from exc
    if proc.returncode != 0:
        stderr = (proc.stderr or b"").decode("utf-8", errors="replace")[-800:]
        raise GifError(f"{err_prefix}：{stderr.strip() or '未知错误'}")
