"""
双周刊期号：窗口计算、当期创建、9 类覆盖、入选 3 条。
"""
from __future__ import annotations

import math
from datetime import date, timedelta
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.models.category import Category
from app.models.issue import Issue
from app.models.video import Video

MAX_SELECTED = 3


class IssueError(ValueError):
    pass


def issue_calendar(today: Optional[date] = None) -> dict:
    """根据锚点期号计算任意一天所属 VOL 与窗口。"""
    settings = get_settings()
    today = today or date.today()
    anchor_vol = settings.issue_anchor_vol
    anchor_end = date.fromisoformat(settings.issue_anchor_end)
    span = settings.issue_span_days
    vol = vol_for_date(today, anchor_vol, anchor_end, span)
    start, end = window_for_vol(vol, anchor_vol, anchor_end, span)
    return {
        "today": today.isoformat(),
        "vol_number": vol,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "anchor_vol": anchor_vol,
        "anchor_end": anchor_end.isoformat(),
        "span_days": span,
    }


def vol_for_date(
    day: date,
    anchor_vol: int,
    anchor_end: date,
    span: int,
) -> int:
    days = (day - anchor_end).days
    if days == 0:
        return anchor_vol
    return anchor_vol + math.ceil(days / span)


def window_for_vol(
    vol: int,
    anchor_vol: int,
    anchor_end: date,
    span: int,
) -> Tuple[date, date]:
    offset = vol - anchor_vol
    end = anchor_end + timedelta(days=offset * span)
    start = end - timedelta(days=span)
    return start, end


def get_or_create_issue(db: Session, vol_number: int, title: Optional[str] = None) -> Issue:
    existing = db.query(Issue).filter(Issue.vol_number == vol_number).first()
    if existing:
        return existing
    settings = get_settings()
    start, end = window_for_vol(
        vol_number,
        settings.issue_anchor_vol,
        date.fromisoformat(settings.issue_anchor_end),
        settings.issue_span_days,
    )
    issue = Issue(
        vol_number=vol_number,
        title=title or "AIGC创意双周报 · 创意灵感",
        start_date=start,
        end_date=end,
        summary="",
        status="collecting",
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


def get_or_create_current_issue(db: Session, today: Optional[date] = None) -> Issue:
    cal = issue_calendar(today)
    return get_or_create_issue(db, cal["vol_number"])


def week_index(collected_at, issue: Issue) -> int:
    if not collected_at or not issue or not issue.start_date:
        return 1
    day = collected_at.date() if hasattr(collected_at, "date") else collected_at
    delta = (day - issue.start_date).days
    return 1 if delta < 7 else 2


def active_categories(db: Session) -> List[Category]:
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )


def coverage(db: Session, issue: Issue) -> dict:
    categories = active_categories(db)
    items = (
        db.query(Video)
        .options(joinedload(Video.category))
        .filter(Video.issue_id == issue.id)
        .order_by(Video.selected.desc(), Video.selected_rank.asc(), Video.collected_at.desc())
        .all()
    )
    by_cat = {c.id: [] for c in categories}
    uncategorized = []
    for item in items:
        if item.category_id in by_cat:
            by_cat[item.category_id].append(item)
        else:
            uncategorized.append(item)

    slots = []
    missing = []
    for cat in categories:
        cat_items = by_cat.get(cat.id, [])
        filled = len(cat_items) > 0
        has_selected = any(v.selected for v in cat_items)
        if not filled:
            missing.append(cat.to_dict())
        slots.append({
            "category": cat.to_dict(),
            "filled": filled,
            "item_count": len(cat_items),
            "has_selected": has_selected,
            "items": [v.to_dict() for v in cat_items],
        })

    selected = [v for v in items if v.selected]
    selected.sort(key=lambda v: (v.selected_rank or 99, v.id))

    return {
        "issue": issue.to_dict(),
        "required_count": len(categories),
        "filled_count": len(categories) - len(missing),
        "missing_categories": missing,
        "selected_count": len(selected),
        "selected_needed": MAX_SELECTED,
        "selected_gap": max(0, MAX_SELECTED - len(selected)),
        "category_gap": len(missing),
        "ready_for_brief": len(missing) == 0 and len(selected) == MAX_SELECTED,
        "slots": slots,
        "uncategorized": [v.to_dict() for v in uncategorized],
        "picks": [v.to_dict() for v in selected],
    }


def set_selected(db: Session, issue: Issue, video: Video, selected: bool) -> Video:
    if video.issue_id != issue.id:
        raise IssueError("只能从当期素材中入选")
    if selected:
        already = (
            db.query(Video)
            .filter(Video.issue_id == issue.id, Video.selected.is_(True))
            .order_by(Video.selected_rank.asc())
            .all()
        )
        if video.selected:
            return video
        if len(already) >= MAX_SELECTED:
            raise IssueError(f"每期最多入选 {MAX_SELECTED} 条")
        used = {v.selected_rank for v in already if v.selected_rank}
        rank = next((i for i in range(1, MAX_SELECTED + 1) if i not in used), len(already) + 1)
        video.selected = True
        video.selected_rank = rank
    else:
        video.selected = False
        video.selected_rank = None
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def export_payload(db: Session, issue: Issue) -> dict:
    data = coverage(db, issue)
    picks = []
    for item in data["picks"]:
        picks.append({
            "rank": item.get("selected_rank"),
            "category": (item.get("category") or {}).get("name") or "未分类",
            "title": item.get("title"),
            "headline": _headline(item),
            "intro": item.get("brief_intro") or "",
            "cover": item.get("display_cover"),
            "gif_url": item.get("gif_url"),
            "duration": item.get("duration_label"),
            "source": item.get("source_label"),
            "url": item.get("url"),
            "item_kind": item.get("item_kind"),
        })
    return {
        "vol": issue.vol_number,
        "vol_label": f"VOL.{issue.vol_number:02d}",
        "title": issue.title,
        "dates": issue.to_dict()["date_label"],
        "start_date": issue.start_date.isoformat() if issue.start_date else None,
        "end_date": issue.end_date.isoformat() if issue.end_date else None,
        "summary": issue.summary or "",
        "picks": picks,
        "coverage": {
            "filled": data["filled_count"],
            "required": data["required_count"],
            "selected": data["selected_count"],
            "ready": data["ready_for_brief"],
        },
    }


def export_markdown(payload: dict) -> str:
    lines = [
        f"# {payload.get('title') or 'AIGC创意双周报 · 创意灵感'} {payload['vol_label']}",
        "",
        f"**日期**：{payload.get('dates') or ''}",
        "",
        "## 综述",
        "",
        payload.get("summary") or "（待写）",
        "",
        "## 创意灵感",
        "",
    ]
    for pick in payload.get("picks", []):
        lines.append(f"### {pick.get('rank')}. {pick.get('headline')}")
        lines.append("")
        if pick.get("duration"):
            lines.append(f"- 时长：{pick['duration']}")
        if pick.get("source"):
            lines.append(f"- 来源：{pick['source']}")
        if pick.get("url"):
            lines.append(f"- 链接：{pick['url']}")
        if pick.get("gif_url"):
            lines.append(f"- GIF：{pick['gif_url']}")
        lines.append("")
        lines.append(pick.get("intro") or "")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def _headline(item: dict) -> str:
    cat = (item.get("category") or {}).get("name") or "未分类"
    title = item.get("title") or ""
    return f"{cat} | {title}"
