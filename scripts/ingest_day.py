#!/usr/bin/env python3
"""
每日收录：把一条创意视频（链接 + 元信息 + GIF 地址）写进 content/videos/<日期>.json，
并重新编译 feed.json。

单条：
    python scripts/ingest_day.py \
      --url "https://www.youtube.com/watch?v=xxxx" \
      --title "品牌片标题" --category ai-ad --orientation landscape \
      --gif-a https://github.com/<owner>/<repo>/releases/download/<tag>/xxx-a.gif \
      --gif-b https://github.com/<owner>/<repo>/releases/download/<tag>/xxx-b.gif \
      --intro "100–150 字中文简介……" --tags "全片生成,品牌片" --author "Some Studio"

自动补标题/作者（YouTube / X / Bilibili，不需要 API Key）：
    python scripts/ingest_day.py --url ... --fetch-meta --category ai-ad --gif-a ... --gif-b ... --intro ...

批量（JSON 数组，每个对象字段同上，键名用 title/url/gif_a_url/gif_b_url/intro_zh…）：
    python scripts/ingest_day.py --from-json drafts/2026-09-17.json

写到远端后端而不是本地文件：
    python scripts/ingest_day.py ... --api https://your-api.example.com --token $ADMIN_TOKEN
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import _bootstrap  # noqa: F401
from app.services.content_store import (  # noqa: E402
    CATEGORY_SLUGS,
    DEFAULT_CONTENT_DIR,
    DEFAULT_FEED_PATH,
    ContentError,
    ContentStore,
    detect_platform,
    intro_warnings,
    normalize_video,
)

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"


def _get_json(url: str, headers: dict[str, str] | None = None, timeout: int = 12) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def fetch_meta(url: str) -> dict[str, str]:
    """尽力抓标题 / 作者 / 封面。抓不到就返回空字典，不阻断收录。"""
    platform = detect_platform(url)
    try:
        if platform == "youtube":
            data = _get_json("https://www.youtube.com/oembed?" + urllib.parse.urlencode({"url": url, "format": "json"}))
            return {"title": data.get("title", ""), "author": data.get("author_name", ""),
                    "cover_url": data.get("thumbnail_url", "")}
        if platform == "x":
            data = _get_json("https://publish.twitter.com/oembed?" + urllib.parse.urlencode({"url": url, "omit_script": "1"}))
            html = re.sub(r"<[^>]+>", "", data.get("html", ""))
            title = re.sub(r"\s+", " ", html).strip()
            return {"title": title[:80], "author": data.get("author_name", "")}
        if platform == "bilibili":
            m = re.search(r"(BV[0-9A-Za-z]{10})", url)
            if not m:
                return {}
            data = _get_json(f"https://api.bilibili.com/x/web-interface/view?bvid={m.group(1)}",
                             headers={"Referer": "https://www.bilibili.com"})
            if data.get("code") != 0:
                return {}
            v = data.get("data") or {}
            pic = v.get("pic", "")
            if pic.startswith("//"):
                pic = "https:" + pic
            return {"title": v.get("title", ""), "author": (v.get("owner") or {}).get("name", ""), "cover_url": pic}
        if platform == "vimeo":
            data = _get_json("https://vimeo.com/api/oembed.json?" + urllib.parse.urlencode({"url": url}))
            return {"title": data.get("title", ""), "author": data.get("author_name", ""),
                    "cover_url": data.get("thumbnail_url", "")}
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError, OSError) as exc:
        print(f"  ! 抓取元信息失败（{platform}）：{exc}", file=sys.stderr)
    return {}


def post_to_api(api_base: str, token: str, entry: dict[str, Any]) -> dict[str, Any]:
    endpoint = api_base.rstrip("/") + "/api/v1/creative/ingest"
    body = json.dumps(entry, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(endpoint, data=body, method="POST", headers={
        "Content-Type": "application/json",
        "X-Admin-Token": token,
        "User-Agent": UA,
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def entries_from_args(args: argparse.Namespace) -> list[dict[str, Any]]:
    if args.from_json:
        data = json.loads(Path(args.from_json).read_text(encoding="utf-8"))
        items = data if isinstance(data, list) else [data]
        return [dict(item) for item in items]

    if not args.url:
        raise ContentError("需要 --url（或 --from-json 批量文件）")
    entry: dict[str, Any] = {
        "url": args.url,
        "title": args.title,
        "author": args.author,
        "platform": args.platform,
        "orientation": args.orientation,
        "category": args.category,
        "tags": args.tags,
        "intro_zh": args.intro,
        "collected_date": args.date,
        "gif_a_url": args.gif_a,
        "gif_b_url": args.gif_b,
        "cover_url": args.cover,
        "source_video_url": args.source_video,
        "heat_score": args.heat,
        "influence_score": args.influence,
        "creativity_score": args.creativity,
        "source_notes": args.notes,
    }
    if args.id:
        entry["id"] = args.id
    return [entry]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = parser.add_argument_group("单条录入")
    src.add_argument("--url")
    src.add_argument("--title")
    src.add_argument("--author")
    src.add_argument("--platform", help="默认按域名自动识别（youtube/bilibili/x/…）")
    src.add_argument("--orientation", choices=["landscape", "vertical"], default=None)
    src.add_argument("--category", help="可选：" + ", ".join(CATEGORY_SLUGS))
    src.add_argument("--tags", help="逗号分隔")
    src.add_argument("--intro", help="100–150 字中文简介")
    src.add_argument("--date", help="收录日期 YYYY-MM-DD（默认上海时区今天）")
    src.add_argument("--gif-a", dest="gif_a", help="横版上段 / 竖版唯一 GIF 地址")
    src.add_argument("--gif-b", dest="gif_b", help="横版下段 GIF 地址")
    src.add_argument("--cover", help="封面图地址（可选）")
    src.add_argument("--source-video", dest="source_video", help="源 mp4 地址（可选）")
    src.add_argument("--heat", type=float, help="可选热度分（内部排序用，不展示）")
    src.add_argument("--influence", type=float)
    src.add_argument("--creativity", type=float)
    src.add_argument("--notes", help="来源备注")
    src.add_argument("--id", help="自定义 id（默认 日期-标题 slug）")
    src.add_argument("--fetch-meta", action="store_true", help="用 oEmbed / B 站接口补标题、作者、封面")

    batch = parser.add_argument_group("批量 / 目标")
    batch.add_argument("--from-json", help="JSON 文件（数组或单对象）")
    batch.add_argument("--content", default=str(DEFAULT_CONTENT_DIR))
    batch.add_argument("--feed-out", default=str(DEFAULT_FEED_PATH))
    batch.add_argument("--api", help="后端地址，如 https://xxx.onrender.com；给出时改为 POST 到接口")
    batch.add_argument("--token", help="X-Admin-Token（配合 --api）")
    batch.add_argument("--no-build", action="store_true", help="写入后不重新编译 feed.json")
    batch.add_argument("--dry-run", action="store_true", help="只打印规范化结果，不写入")
    args = parser.parse_args(argv)

    try:
        entries = entries_from_args(args)
    except (ContentError, OSError, json.JSONDecodeError) as exc:
        print(f"✗ {exc}", file=sys.stderr)
        return 2

    store = ContentStore(Path(args.content))
    failures = 0
    for raw in entries:
        if args.fetch_meta or raw.pop("fetch_meta", False):
            meta = fetch_meta(raw.get("url", ""))
            for key, value in meta.items():
                if value and not raw.get(key):
                    raw[key] = value
        try:
            entry = normalize_video(raw)
        except ContentError as exc:
            failures += 1
            print(f"✗ {raw.get('title') or raw.get('url')}: {exc}", file=sys.stderr)
            continue

        if args.dry_run:
            print(json.dumps(entry, ensure_ascii=False, indent=2))
            continue

        if args.api:
            if not args.token:
                print("✗ --api 需要同时给 --token", file=sys.stderr)
                return 2
            try:
                result = post_to_api(args.api, args.token, entry)
            except urllib.error.HTTPError as exc:
                failures += 1
                print(f"✗ 接口返回 {exc.code}: {exc.read().decode('utf-8', 'replace')[:300]}", file=sys.stderr)
                continue
            print(f"✓ 已提交到接口：{result.get('video', {}).get('id', entry['id'])}（{'新建' if result.get('created') else '更新'}）")
        else:
            saved, created = store.upsert_video(raw)
            print(f"✓ {'新建' if created else '更新'} {saved['id']} → content/videos/{saved['collected_date']}.json")
            for w in intro_warnings(saved):
                print(f"  ! {w}")

    if not args.dry_run and not args.api and not args.no_build:
        store.write_feed(Path(args.feed_out))
        print(f"✓ feed.json 已更新 → {args.feed_out}")

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
