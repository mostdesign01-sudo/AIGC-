"""
双周刊期号、覆盖度、出报导出
"""
import io
import json
import os
import zipfile
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import DATA_DIR, get_db
from app.models.issue import Issue
from app.models.video import Video
from app.services.issue_service import (
    IssueError,
    coverage,
    export_markdown,
    export_payload,
    get_or_create_current_issue,
    get_or_create_issue,
    issue_calendar,
    set_selected,
    week_index,
)

router = APIRouter()


class IssueUpdate(BaseModel):
    summary: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None


class IssueCreate(BaseModel):
    vol_number: Optional[int] = None
    title: Optional[str] = None


@router.get("/calendar")
def get_calendar(day: Optional[str] = None):
    today = date.fromisoformat(day) if day else date.today()
    return issue_calendar(today)


@router.get("")
def list_issues(db: Session = Depends(get_db)):
    rows = db.query(Issue).order_by(Issue.vol_number.desc()).all()
    return {"data": [i.to_dict() for i in rows]}


@router.get("/current")
def current_issue(db: Session = Depends(get_db)):
    issue = get_or_create_current_issue(db)
    return coverage(db, issue)


@router.post("/current")
def ensure_current(db: Session = Depends(get_db)):
    issue = get_or_create_current_issue(db)
    return coverage(db, issue)


@router.post("")
def create_issue(payload: IssueCreate, db: Session = Depends(get_db)):
    vol = payload.vol_number
    if vol is None:
        issue = get_or_create_current_issue(db)
    else:
        issue = get_or_create_issue(db, vol, title=payload.title)
        if payload.title:
            issue.title = payload.title
            db.add(issue)
            db.commit()
            db.refresh(issue)
    return coverage(db, issue)


@router.get("/{issue_id}")
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(404, "期号不存在")
    return coverage(db, issue)


@router.patch("/{issue_id}")
def update_issue(issue_id: int, payload: IssueUpdate, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(404, "期号不存在")
    if payload.summary is not None:
        issue.summary = payload.summary
    if payload.title is not None:
        issue.title = payload.title
    if payload.status is not None:
        issue.status = payload.status
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return coverage(db, issue)


@router.get("/{issue_id}/coverage")
def get_coverage(issue_id: int, db: Session = Depends(get_db)):
    return get_issue(issue_id, db)


@router.get("/{issue_id}/items")
def list_issue_items(
    issue_id: int,
    category_id: Optional[int] = None,
    week: Optional[int] = Query(None, ge=1, le=2),
    selected: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(404, "期号不存在")
    query = db.query(Video).filter(Video.issue_id == issue_id)
    if category_id:
        query = query.filter(Video.category_id == category_id)
    if selected is not None:
        query = query.filter(Video.selected.is_(selected))
    items = query.order_by(Video.selected.desc(), Video.selected_rank.asc(), Video.collected_at.desc()).all()
    if week:
        items = [v for v in items if week_index(v.collected_at, issue) == week]
    return {"data": [v.to_dict() for v in items], "total": len(items)}


@router.post("/{issue_id}/items/{video_id}/select")
def select_item(issue_id: int, video_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    video = db.query(Video).filter(Video.id == video_id).first()
    if not issue or not video:
        raise HTTPException(404, "期号或素材不存在")
    try:
        video = set_selected(db, issue, video, True)
    except IssueError as exc:
        raise HTTPException(400, str(exc))
    return video.to_dict()


@router.post("/{issue_id}/items/{video_id}/unselect")
def unselect_item(issue_id: int, video_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    video = db.query(Video).filter(Video.id == video_id).first()
    if not issue or not video:
        raise HTTPException(404, "期号或素材不存在")
    try:
        video = set_selected(db, issue, video, False)
    except IssueError as exc:
        raise HTTPException(400, str(exc))
    return video.to_dict()


@router.get("/{issue_id}/preview")
def preview_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(404, "期号不存在")
    data = coverage(db, issue)
    data["export"] = export_payload(db, issue)
    return data


@router.get("/{issue_id}/export")
def export_issue(
    issue_id: int,
    format: str = Query("json", pattern="^(json|markdown|md|zip)$"),
    db: Session = Depends(get_db),
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(404, "期号不存在")
    payload = export_payload(db, issue)
    if format in ("markdown", "md"):
        return PlainTextResponse(
            export_markdown(payload),
            media_type="text/markdown; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="VOL{issue.vol_number:02d}.md"'},
        )
    if format == "zip":
        return _export_zip(issue, payload, db)
    return payload


def _export_zip(issue: Issue, payload: dict, db: Session):
    picks = (
        db.query(Video)
        .filter(Video.issue_id == issue.id, Video.selected.is_(True))
        .order_by(Video.selected_rank.asc())
        .all()
    )
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("issue.json", json.dumps(payload, ensure_ascii=False, indent=2))
        zf.writestr("issue.md", export_markdown(payload))
        for video in picks:
            rank = video.selected_rank or 0
            prefix = f"{rank:02d}"
            for rel, label in (
                (video.gif_path, f"{prefix}-preview.gif"),
                (video.local_cover_path, f"{prefix}-cover.jpg"),
            ):
                if not rel:
                    continue
                abs_path = os.path.join(DATA_DIR, rel)
                if os.path.isfile(abs_path):
                    zf.write(abs_path, label)
    buf.seek(0)
    filename = f"VOL{issue.vol_number:02d}-export.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
