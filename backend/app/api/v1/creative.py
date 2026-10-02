"""
创意站 API：每日收录 / 周榜 TOP3。

读接口公开；写接口需要请求头 `X-Admin-Token`（等于环境变量 ADMIN_TOKEN）。
数据落在文件库 content/（见 app/services/content_store.py），与 scripts/*.py 完全一致。
"""
from __future__ import annotations

import secrets
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.services.content_store import (
    CATEGORIES,
    WEEKLY_SLOTS,
    ContentError,
    ContentStore,
    current_week_id,
    intro_warnings,
    parse_week_id,
    week_range,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# 依赖
# ---------------------------------------------------------------------------

def get_store() -> ContentStore:
    settings = get_settings()
    return ContentStore(Path(settings.content_dir))


def require_admin(x_admin_token: Optional[str] = Header(default=None)) -> None:
    token = get_settings().admin_token
    if not token:
        raise HTTPException(status_code=403, detail="写接口未开启：请在环境变量设置 ADMIN_TOKEN")
    if not x_admin_token or not secrets.compare_digest(x_admin_token, token):
        raise HTTPException(status_code=401, detail="X-Admin-Token 不正确")


def _rebuild_feed(store: ContentStore) -> None:
    feed_path = (get_settings().feed_path or "").strip()
    if feed_path:
        try:
            store.write_feed(Path(feed_path))
        except OSError:
            # 只读文件系统（例如某些托管平台）时忽略落盘，接口仍可实时输出。
            pass


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class VideoIn(BaseModel):
    title: str
    url: str
    category: str
    orientation: str = "landscape"
    intro_zh: str = ""
    id: Optional[str] = None
    platform: Optional[str] = None
    author: str = ""
    tags: list[str] | str = Field(default_factory=list)
    collected_date: Optional[str] = Field(default=None, description="YYYY-MM-DD，默认上海时区今天")
    gif_a_url: str = ""
    gif_b_url: str = ""
    cover_url: str = ""
    source_video_url: str = ""
    heat_score: Optional[float] = None
    influence_score: Optional[float] = None
    creativity_score: Optional[float] = None
    source_notes: str = ""


class WeekPicksIn(BaseModel):
    picks: dict[str, Optional[str]] = Field(description="{hottest, influential, creative} → video id")
    note: str = ""


class LabelsIn(BaseModel):
    hottest: Optional[dict[str, str]] = None
    influential: Optional[dict[str, str]] = None
    creative: Optional[dict[str, str]] = None


# ---------------------------------------------------------------------------
# 读接口
# ---------------------------------------------------------------------------

@router.get("/feed")
def get_feed(store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    """前端整站数据（与 frontend/src/data/feed.json 同构）。"""
    try:
        return store.build_feed()
    except ContentError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/categories")
def get_categories() -> list[dict[str, Any]]:
    return [{"slug": c["slug"], "name": c["name"]} for c in CATEGORIES]


@router.get("/videos")
def list_videos(
    category: Optional[str] = None,
    orientation: Optional[str] = None,
    day: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
    week: Optional[str] = Query(default=None, description="YYYY-Www"),
    limit: int = Query(default=100, ge=1, le=500),
    store: ContentStore = Depends(get_store),
) -> dict[str, Any]:
    feed = store.build_feed()
    videos = feed["videos"]
    if category:
        videos = [v for v in videos if v["category"] == category]
    if orientation:
        videos = [v for v in videos if v["orientation"] == orientation]
    if day:
        videos = [v for v in videos if v["collected_date"] == day]
    if week:
        videos = [v for v in videos if v["week_id"] == week]
    return {"total": len(videos), "data": videos[:limit]}


@router.get("/videos/{video_id}")
def get_video(video_id: str, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    for v in store.build_feed()["videos"]:
        if v["id"] == video_id:
            return v
    raise HTTPException(status_code=404, detail="视频不存在")


@router.get("/days")
def list_days(store: ContentStore = Depends(get_store)) -> list[dict[str, Any]]:
    return store.build_feed()["days"]


@router.get("/days/{day}")
def get_day(day: str, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    feed = store.build_feed()
    videos = [v for v in feed["videos"] if v["collected_date"] == day]
    if not videos:
        raise HTTPException(status_code=404, detail="这一天没有收录")
    return {"date": day, "week_id": videos[0]["week_id"], "videos": videos}


@router.get("/weeks")
def list_weeks(store: ContentStore = Depends(get_store)) -> list[dict[str, Any]]:
    return store.build_feed()["weeks"]


@router.get("/weeks/current")
def get_current_week(store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    return _week_payload(store, current_week_id())


@router.get("/weeks/{week_id}")
def get_week(week_id: str, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    try:
        parse_week_id(week_id)
    except ContentError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _week_payload(store, week_id)


def _week_payload(store: ContentStore, week_id: str) -> dict[str, Any]:
    feed = store.build_feed()
    by_id = {v["id"]: v for v in feed["videos"]}
    week = next((w for w in feed["weeks"] if w["week_id"] == week_id), None)
    start, end = week_range(week_id)
    if week is None:
        labels = feed["slot_labels"]
        week = {
            "week_id": week_id, "start": start.isoformat(), "end": end.isoformat(), "note": "",
            "picks": [{"slot": s, "label": labels[s]["label"], "tagline": labels[s]["tagline"], "video_id": None}
                      for s in WEEKLY_SLOTS],
        }
    picks = [{**p, "video": by_id.get(p["video_id"]) if p["video_id"] else None} for p in week["picks"]]
    candidates = [v for v in feed["videos"] if v["week_id"] == week_id]
    return {**week, "picks": picks, "candidates": candidates}


# ---------------------------------------------------------------------------
# 写接口
# ---------------------------------------------------------------------------

@router.post("/ingest", dependencies=[Depends(require_admin)], status_code=201)
def ingest_video(payload: VideoIn, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    """收录一条视频（同 URL / 同 id 视为更新）。"""
    raw = payload.model_dump(exclude_none=True)
    try:
        video, created = store.upsert_video(raw)
    except ContentError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    _rebuild_feed(store)
    return {"created": created, "video": video, "warnings": intro_warnings(video)}


@router.delete("/videos/{video_id}", dependencies=[Depends(require_admin)])
def delete_video(video_id: str, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    if not store.delete_video(video_id):
        raise HTTPException(status_code=404, detail="视频不存在")
    _rebuild_feed(store)
    return {"deleted": video_id}


@router.put("/weeks/{week_id}/top3", dependencies=[Depends(require_admin)])
def set_week_top3(week_id: str, payload: WeekPicksIn, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    """设置某周三个槽位；传空字符串/null 可清空某一槽。"""
    try:
        data = store.save_week(week_id, payload.picks, payload.note)
    except ContentError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    _rebuild_feed(store)
    return data


@router.put("/labels", dependencies=[Depends(require_admin)])
def set_labels(payload: LabelsIn, store: ContentStore = Depends(get_store)) -> dict[str, Any]:
    try:
        labels = store.save_labels(payload.model_dump(exclude_none=True))
    except ContentError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    _rebuild_feed(store)
    return labels
