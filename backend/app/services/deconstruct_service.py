"""
拆解「怎么做 / 创意点 / 能用在哪」。
有本地成片就抽帧走视觉模型；否则用标题简介走文本；没 Key 则规则降级。
"""
from __future__ import annotations

import json
import os
import re
from typing import Optional

from app.db.database import DATA_DIR
from app.models.video import Video
from app.services.ai_analyzer import ai_analyzer
from app.services.gif_service import FFmpegNotFoundError, extract_frames
from app.services.media_service import absolute_media_path


def compose_structured(how: str, idea: str, use: str) -> str:
    return f"怎么做：{how}\n创意点：{idea}\n能用在哪：{use}"


def fallback_deconstruct(title: str, description: str = "", category: str = "") -> dict:
    text = f"{title} {description}".lower()
    how = "先定主体与参考图，用主流生成模型出镜头，再补光影和转场。"
    if any(k in text for k in ("runway", "gen-3", "gen3")):
        how = "用 Runway 做运动镜头，再叠产品或人物一致性。"
    elif any(k in text for k in ("可灵", "kling")):
        how = "用可灵锁角色/主体，短镜头拼接后再调色。"
    elif any(k in text for k in ("seedance", "即梦")):
        how = "用 Seedance/即梦出群像或广告镜头，再回剪辑对齐品牌物料。"
    elif any(k in text for k in ("sora",)):
        how = "用 Sora 出长镜头氛围，再截可用拍点做竖版。"
    elif any(k in text for k in ("3d", "blender", "渲染")):
        how = "三维粗模打底，AI 补材质和灯光，再回三维修反射。"
    idea = (title or "画面和节奏本身就是卖点").strip()
    if len(idea) > 40:
        idea = idea[:37] + "…"
    use = category or "短视频种草 / 出报卡片"
    brief = f"{how} 创意点在于{idea}。适合用在{use}。"
    return {
        "how": how,
        "idea": idea,
        "use": use,
        "brief": brief,
        "source": "fallback",
    }


def deconstruct_video(video: Video, overwrite_intro: bool = False) -> dict:
    category = video.category.name if video.category else ""
    frames: list[str] = []
    src = absolute_media_path(video.local_media_path)
    if src:
        frame_dir = os.path.join(DATA_DIR, "tmp", "frames", str(video.id))
        try:
            frames = extract_frames(src, frame_dir, count=3)
        except FFmpegNotFoundError:
            frames = []

    result = ai_analyzer.deconstruct(
        title=video.title or "",
        description=video.description or "",
        category=category,
        frames=frames,
    )
    structured = compose_structured(result["how"], result["idea"], result["use"])
    video.ai_summary = structured
    if overwrite_intro or not (video.intro or "").strip():
        video.intro = result["brief"]
    result["structured"] = structured
    result["frame_count"] = len(frames)
    return result


def parse_deconstruct_json(raw: str) -> Optional[dict]:
    if not raw:
        return None
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    if fence:
        text = fence.group(1).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start < 0 or end <= start:
            return None
        try:
            data = json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            return None
    if not isinstance(data, dict):
        return None
    how = str(data.get("how") or "").strip()
    idea = str(data.get("idea") or "").strip()
    use = str(data.get("use") or "").strip()
    brief = str(data.get("brief") or "").strip()
    if not (how or idea or use):
        return None
    return {"how": how, "idea": idea, "use": use, "brief": brief or f"{how} {idea}。适合{use}。"}
