"""
创意站内容库（文件型，纯标准库）。

目录约定（仓库根目录 `content/`）：

    content/
      labels.json               # 周榜三个槽位的标签文案（可编辑）
      videos/YYYY-MM-DD.json    # 当天收录的视频数组（Asia/Shanghai 日期）
      weeks/YYYY-Www.json       # 该 ISO 周的 TOP3 选择

这里不依赖 FastAPI / SQLAlchemy，脚本（scripts/*.py）和 API 共用同一份逻辑，
保证 CLI 写入的数据和接口写入的数据格式一致。
"""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable, Optional
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

SHANGHAI = ZoneInfo("Asia/Shanghai")

CATEGORIES: list[dict[str, Any]] = [
    {"slug": "ai-short-film", "name": "AI创意短片", "sort_order": 1},
    {"slug": "ai-ad", "name": "AI创意广告", "sort_order": 2},
    {"slug": "fashion", "name": "换装/时尚", "sort_order": 3},
    {"slug": "props-transition", "name": "道具/转场", "sort_order": 4},
    {"slug": "ar-material", "name": "AR/物料", "sort_order": 5},
    {"slug": "ai-tool", "name": "AI创意工具", "sort_order": 6},
    {"slug": "new-model", "name": "新模型表现", "sort_order": 7},
    {"slug": "3d-render", "name": "3D/渲染", "sort_order": 8},
    {"slug": "ip-character", "name": "IP/角色", "sort_order": 9},
]
CATEGORY_SLUGS = [c["slug"] for c in CATEGORIES]

ORIENTATIONS = ("landscape", "vertical")

WEEKLY_SLOTS = ("hottest", "influential", "creative")
DEFAULT_SLOT_LABELS: dict[str, dict[str, str]] = {
    "hottest": {"label": "最热", "tagline": "本周讨论最多、传播最广的一条"},
    "influential": {"label": "最影响力", "tagline": "最可能改变行业做法或品牌预期的一条"},
    "creative": {"label": "最有创意", "tagline": "点子最新、落点最准的一条"},
}

PLATFORM_HOSTS: dict[str, str] = {
    "youtube.com": "youtube",
    "youtu.be": "youtube",
    "bilibili.com": "bilibili",
    "b23.tv": "bilibili",
    "x.com": "x",
    "twitter.com": "x",
    "douyin.com": "douyin",
    "xiaohongshu.com": "xiaohongshu",
    "vimeo.com": "vimeo",
    "instagram.com": "instagram",
    "github.com": "github",
}

SCORE_FIELDS = ("heat_score", "influence_score", "creativity_score")

# 不允许出现在公开数据里的“假分析”字段，写入时直接丢弃。
FORBIDDEN_FIELDS = ("play_count", "view_count", "like_count", "views", "likes")


class ContentError(ValueError):
    """内容校验失败。"""


# ---------------------------------------------------------------------------
# 日期 / 周 工具
# ---------------------------------------------------------------------------

def today_shanghai() -> date:
    return datetime.now(SHANGHAI).date()


def parse_date(value: str | date | None) -> date:
    if value is None or value == "" or value == "today":
        return today_shanghai()
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError as exc:
        raise ContentError(f"日期格式应为 YYYY-MM-DD：{value!r}") from exc


def week_id_for(d: date) -> str:
    iso = d.isocalendar()
    return f"{iso[0]}-W{iso[1]:02d}"


def parse_week_id(week_id: str) -> tuple[int, int]:
    m = re.fullmatch(r"(\d{4})-W(\d{2})", week_id or "")
    if not m:
        raise ContentError(f"周编号格式应为 YYYY-Www（例如 2026-W38）：{week_id!r}")
    year, week = int(m.group(1)), int(m.group(2))
    if not 1 <= week <= 53:
        raise ContentError(f"周编号超出范围：{week_id!r}")
    return year, week


def week_range(week_id: str) -> tuple[date, date]:
    year, week = parse_week_id(week_id)
    start = date.fromisocalendar(year, week, 1)
    return start, start + timedelta(days=6)


def current_week_id() -> str:
    return week_id_for(today_shanghai())


# ---------------------------------------------------------------------------
# 规范化
# ---------------------------------------------------------------------------

def detect_platform(url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    for suffix, platform in PLATFORM_HOSTS.items():
        if host == suffix or host.endswith("." + suffix):
            return platform
    return "web"


def slugify(text: str, max_len: int = 48) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:max_len].strip("-")


def _video_key_from_url(url: str) -> str:
    """从 URL 提取平台视频 ID，尽量让 slug 稳定可读。"""
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    path = parsed.path or ""
    if "bilibili" in host:
        m = re.search(r"(BV[0-9A-Za-z]{10})", path)
        if m:
            return m.group(1).lower()
    if host.endswith("youtu.be"):
        return path.strip("/").split("/")[0].lower()
    if "youtube" in host:
        m = re.search(r"[?&]v=([\w-]{6,})", parsed.query)
        if m:
            return m.group(1).lower()
        m = re.search(r"/(?:shorts|embed)/([\w-]{6,})", path)
        if m:
            return m.group(1).lower()
    if host in ("x.com", "twitter.com") or host.endswith(".x.com"):
        m = re.search(r"/status/(\d+)", path)
        if m:
            return m.group(1)
    return ""


def _short_hash(text: str, n: int = 6) -> str:
    import hashlib

    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:n]


def make_video_id(title: str, url: str, collected: date) -> str:
    """日期-标题 slug；中文标题拿不到 ASCII slug 时退到平台视频 ID，再退到 URL 哈希。"""
    base = slugify(title)
    if len(base) < 3:
        base = slugify(_video_key_from_url(url))
    if len(base) < 3:
        base = f"{slugify(urlparse(url).hostname or 'video') or 'video'}-{_short_hash(url)}"
    return f"{collected.isoformat()}-{base}"


def _clean_str(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _opt_float(value: Any, name: str) -> Optional[float]:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ContentError(f"{name} 应为数字：{value!r}") from exc


def _as_tags(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        parts = re.split(r"[,，、\s]+", value)
    else:
        parts = list(value)
    seen: list[str] = []
    for p in parts:
        p = _clean_str(p)
        if p and p not in seen:
            seen.append(p)
    return seen


def normalize_video(raw: dict[str, Any], *, existing_id: str | None = None) -> dict[str, Any]:
    """校验并补全一条视频记录。抛出 ContentError 说明哪里不对。"""
    if not isinstance(raw, dict):
        raise ContentError("视频记录应为对象")

    title = _clean_str(raw.get("title"))
    url = _clean_str(raw.get("url"))
    if not title:
        raise ContentError("缺少 title")
    if not url or not urlparse(url).scheme.startswith("http"):
        raise ContentError(f"url 必须是 http(s) 链接：{url!r}")

    orientation = _clean_str(raw.get("orientation")).lower() or "landscape"
    if orientation in ("portrait", "9:16", "v"):
        orientation = "vertical"
    if orientation in ("horizontal", "16:9", "h"):
        orientation = "landscape"
    if orientation not in ORIENTATIONS:
        raise ContentError(f"orientation 只能是 landscape / vertical：{orientation!r}")

    category = _clean_str(raw.get("category")).lower()
    if not category:
        raise ContentError(f"缺少 category，可选：{', '.join(CATEGORY_SLUGS)}")
    if category not in CATEGORY_SLUGS:
        by_name = {c["name"]: c["slug"] for c in CATEGORIES}
        if category in by_name:
            category = by_name[category]
        else:
            raise ContentError(f"未知 category {category!r}，可选：{', '.join(CATEGORY_SLUGS)}")

    collected = parse_date(raw.get("collected_date"))

    gif_a = _clean_str(raw.get("gif_a_url"))
    gif_b = _clean_str(raw.get("gif_b_url"))
    if orientation == "vertical":
        gif_b = ""  # 竖版只用一张

    video_id = existing_id or _clean_str(raw.get("id")) or make_video_id(title, url, collected)
    if not re.fullmatch(r"[a-z0-9][a-z0-9\-_.]*", video_id):
        raise ContentError(f"id 只能包含小写字母、数字、-、_、.：{video_id!r}")

    slot = _clean_str(raw.get("weekly_slot")).lower() or None
    if slot is not None and slot not in WEEKLY_SLOTS:
        raise ContentError(f"weekly_slot 只能是 {WEEKLY_SLOTS} 之一或留空：{slot!r}")

    entry: dict[str, Any] = {
        "id": video_id,
        "title": title,
        "url": url,
        "platform": _clean_str(raw.get("platform")).lower() or detect_platform(url),
        "author": _clean_str(raw.get("author")),
        "orientation": orientation,
        "category": category,
        "tags": _as_tags(raw.get("tags")),
        "intro_zh": _clean_str(raw.get("intro_zh") or raw.get("intro")),
        "collected_date": collected.isoformat(),
        "gif_a_url": gif_a,
        "gif_b_url": gif_b,
        "cover_url": _clean_str(raw.get("cover_url")),
        "source_video_url": _clean_str(raw.get("source_video_url")),
        "heat_score": _opt_float(raw.get("heat_score"), "heat_score"),
        "influence_score": _opt_float(raw.get("influence_score"), "influence_score"),
        "creativity_score": _opt_float(raw.get("creativity_score"), "creativity_score"),
        "source_notes": _clean_str(raw.get("source_notes") or raw.get("notes")),
        "week_id": week_id_for(collected),
        "weekly_slot": slot,
    }
    for banned in FORBIDDEN_FIELDS:
        raw.pop(banned, None)
    return entry


def intro_warnings(entry: dict[str, Any]) -> list[str]:
    """不阻断写入的提示（简介长度、缺 GIF 等）。"""
    warnings: list[str] = []
    n = len(entry.get("intro_zh") or "")
    if n == 0:
        warnings.append("intro_zh 为空，卡片上不会显示简介")
    elif n < 80:
        warnings.append(f"intro_zh 只有 {n} 字，建议 100–150 字")
    elif n > 170:
        warnings.append(f"intro_zh 有 {n} 字，建议控制在 150 字左右")
    if not entry.get("gif_a_url"):
        warnings.append("缺少 gif_a_url，卡片会显示占位")
    if entry.get("orientation") == "landscape" and not entry.get("gif_b_url"):
        warnings.append("横版建议提供 gif_b_url（上下两段）")
    return warnings


# ---------------------------------------------------------------------------
# 文件库
# ---------------------------------------------------------------------------

def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    tmp.replace(path)


@dataclass
class ContentStore:
    root: Path
    _cache: dict[str, Any] = field(default_factory=dict, repr=False)

    def __post_init__(self) -> None:
        self.root = Path(self.root)

    # -- paths -------------------------------------------------------------
    @property
    def videos_dir(self) -> Path:
        return self.root / "videos"

    @property
    def weeks_dir(self) -> Path:
        return self.root / "weeks"

    @property
    def labels_path(self) -> Path:
        return self.root / "labels.json"

    # -- labels ------------------------------------------------------------
    def load_labels(self) -> dict[str, dict[str, str]]:
        data = _read_json(self.labels_path, {})
        labels: dict[str, dict[str, str]] = {}
        for slot in WEEKLY_SLOTS:
            merged = dict(DEFAULT_SLOT_LABELS[slot])
            merged.update({k: v for k, v in (data.get(slot) or {}).items() if isinstance(v, str)})
            labels[slot] = merged
        return labels

    def save_labels(self, labels: dict[str, dict[str, str]]) -> dict[str, dict[str, str]]:
        current = self.load_labels()
        for slot, values in (labels or {}).items():
            if slot not in WEEKLY_SLOTS:
                raise ContentError(f"未知槽位 {slot!r}，可选：{WEEKLY_SLOTS}")
            for key in ("label", "tagline"):
                if key in values and isinstance(values[key], str) and values[key].strip():
                    current[slot][key] = values[key].strip()
        _write_json(self.labels_path, current)
        return current

    # -- days --------------------------------------------------------------
    def list_days(self) -> list[str]:
        if not self.videos_dir.exists():
            return []
        days = [p.stem for p in self.videos_dir.glob("*.json") if re.fullmatch(r"\d{4}-\d{2}-\d{2}", p.stem)]
        return sorted(days, reverse=True)

    def load_day(self, day: str | date) -> list[dict[str, Any]]:
        d = parse_date(day)
        data = _read_json(self.videos_dir / f"{d.isoformat()}.json", [])
        if not isinstance(data, list):
            raise ContentError(f"{d.isoformat()}.json 应为数组")
        return data

    def save_day(self, day: str | date, videos: Iterable[dict[str, Any]]) -> None:
        d = parse_date(day)
        _write_json(self.videos_dir / f"{d.isoformat()}.json", list(videos))

    def all_videos(self) -> list[dict[str, Any]]:
        videos: list[dict[str, Any]] = []
        for day in self.list_days():
            for raw in self.load_day(day):
                entry = normalize_video({**raw, "collected_date": raw.get("collected_date") or day})
                videos.append(entry)
        return videos

    def find_video(self, video_id: str) -> Optional[dict[str, Any]]:
        for v in self.all_videos():
            if v["id"] == video_id:
                return v
        return None

    def upsert_video(self, raw: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        """写入一条视频，返回 (记录, 是否新建)。同 id 或同 url 视为更新。"""
        entry = normalize_video(raw)
        day = entry["collected_date"]

        # 同一 URL 已在别的日期收录：直接更新那条，避免重复。
        for other_day in self.list_days():
            if other_day == day:
                continue
            others = self.load_day(other_day)
            for idx, existing in enumerate(others):
                if existing.get("url") == entry["url"] or existing.get("id") == entry["id"]:
                    merged = normalize_video({**existing, **{k: v for k, v in raw.items() if v not in (None, "")},
                                              "collected_date": existing.get("collected_date") or other_day},
                                             existing_id=existing.get("id"))
                    others[idx] = merged
                    self.save_day(other_day, others)
                    return merged, False

        current = self.load_day(day)
        explicit_id = bool(_clean_str(raw.get("id")))
        for idx, existing in enumerate(current):
            same_url = existing.get("url") == entry["url"]
            same_id = existing.get("id") == entry["id"]
            if same_url or (same_id and explicit_id):
                merged = normalize_video({**existing, **{k: v for k, v in raw.items() if v not in (None, "")}},
                                         existing_id=existing.get("id"))
                current[idx] = merged
                self.save_day(day, current)
                return merged, False

        # 自动生成的 id 撞上另一条不同 URL 的记录：加哈希后缀，避免误合并。
        taken = {v.get("id") for v in current}
        if entry["id"] in taken:
            entry["id"] = f"{entry['id']}-{_short_hash(entry['url'])}"

        current.append(entry)
        self.save_day(day, current)
        return entry, True

    def delete_video(self, video_id: str) -> bool:
        for day in self.list_days():
            current = self.load_day(day)
            kept = [v for v in current if v.get("id") != video_id]
            if len(kept) != len(current):
                self.save_day(day, kept)
                return True
        return False

    # -- weeks -------------------------------------------------------------
    def list_weeks(self) -> list[str]:
        if not self.weeks_dir.exists():
            return []
        weeks = [p.stem for p in self.weeks_dir.glob("*.json") if re.fullmatch(r"\d{4}-W\d{2}", p.stem)]
        return sorted(weeks, reverse=True)

    def load_week(self, week_id: str) -> Optional[dict[str, Any]]:
        parse_week_id(week_id)
        data = _read_json(self.weeks_dir / f"{week_id}.json", None)
        return data if isinstance(data, dict) else None

    def save_week(self, week_id: str, picks: dict[str, str | None], note: str = "",
                  *, validate_ids: bool = True) -> dict[str, Any]:
        parse_week_id(week_id)
        known = {v["id"] for v in self.all_videos()} if validate_ids else set()
        clean: dict[str, Optional[str]] = {}
        for slot in WEEKLY_SLOTS:
            vid = _clean_str(picks.get(slot)) or None
            if vid and validate_ids and vid not in known:
                raise ContentError(f"{slot}: 找不到视频 {vid!r}（先 ingest 再选榜）")
            clean[slot] = vid
        chosen = [v for v in clean.values() if v]
        if len(chosen) != len(set(chosen)):
            raise ContentError("同一视频不能占两个槽位")
        existing = self.load_week(week_id) or {}
        data = {
            "week_id": week_id,
            "picks": clean,
            "note": _clean_str(note) or existing.get("note", ""),
            "updated_at": datetime.now(SHANGHAI).isoformat(timespec="seconds"),
        }
        _write_json(self.weeks_dir / f"{week_id}.json", data)
        return data

    # -- feed --------------------------------------------------------------
    def build_feed(self) -> dict[str, Any]:
        labels = self.load_labels()
        videos = self.all_videos()
        by_id = {v["id"]: v for v in videos}

        weeks_out: list[dict[str, Any]] = []
        slot_of: dict[str, str] = {}
        for week_id in self.list_weeks():
            week = self.load_week(week_id) or {}
            start, end = week_range(week_id)
            picks_out = []
            for slot in WEEKLY_SLOTS:
                vid = (week.get("picks") or {}).get(slot)
                if vid and vid in by_id:
                    slot_of[vid] = slot
                picks_out.append({
                    "slot": slot,
                    "label": labels[slot]["label"],
                    "tagline": labels[slot]["tagline"],
                    "video_id": vid if vid in by_id else None,
                })
            weeks_out.append({
                "week_id": week_id,
                "start": start.isoformat(),
                "end": end.isoformat(),
                "note": week.get("note", ""),
                "picks": picks_out,
            })

        for v in videos:
            v["weekly_slot"] = slot_of.get(v["id"])

        # 同一天内保持文件顺序，天与天之间新到旧。
        videos.sort(key=lambda v: v["collected_date"], reverse=True)

        day_counts: dict[str, int] = {}
        for v in videos:
            day_counts[v["collected_date"]] = day_counts.get(v["collected_date"], 0) + 1
        days_out = [
            {"date": d, "week_id": week_id_for(date.fromisoformat(d)), "count": n}
            for d, n in sorted(day_counts.items(), reverse=True)
        ]

        return {
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "timezone": "Asia/Shanghai",
            "categories": [{"slug": c["slug"], "name": c["name"]} for c in CATEGORIES],
            "slot_labels": labels,
            "videos": videos,
            "days": days_out,
            "weeks": weeks_out,
        }

    def write_feed(self, out_path: Path) -> dict[str, Any]:
        feed = self.build_feed()
        _write_json(Path(out_path), feed)
        return feed


# ---------------------------------------------------------------------------
# 默认路径
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_CONTENT_DIR = REPO_ROOT / "content"
DEFAULT_FEED_PATH = REPO_ROOT / "frontend" / "src" / "data" / "feed.json"


def default_store(content_dir: str | Path | None = None) -> ContentStore:
    return ContentStore(Path(content_dir) if content_dir else DEFAULT_CONTENT_DIR)
