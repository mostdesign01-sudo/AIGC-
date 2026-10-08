#!/usr/bin/env python3
"""
周榜 TOP3：把三条视频钉到某个 ISO 周的三个槽位（最热 / 最影响力 / 最有创意）。

看本周候选：
    python scripts/pick_week_top3.py --list                # 默认当前周
    python scripts/pick_week_top3.py --list --week 2026-W37

候选只来自这一周（周一到周日，上海日期）的日更收录 content/videos/*.json；
选了别的周的条目会直接报错。没进 TOP3 的当周日更会自动作为「备选」展示在周榜页。

选榜（写 content/weeks/<week>.json 并重编 feed.json）：
    python scripts/pick_week_top3.py --week 2026-W38 \
      --hottest 2026-09-15-houxiyouji-trailer \
      --influential 2026-09-16-china-mobile-cosmic-heart \
      --creative 2026-09-15-motorola-india-100-ai \
      --note "本周三条都指向全片生成进入主流。" \
      --reason-hottest "一句话入选理由" --reason-influential "..." --reason-creative "..."

只改标签文案（三个槽位的名字 / 副标题）：
    python scripts/pick_week_top3.py --set-label hottest "最热" "本周传播最广的一条"

远端：
    python scripts/pick_week_top3.py --week 2026-W38 --hottest ... --api https://xxx --token $ADMIN_TOKEN
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

import _bootstrap  # noqa: F401
from app.services.content_store import (  # noqa: E402
    DEFAULT_CONTENT_DIR,
    DEFAULT_FEED_PATH,
    WEEKLY_SLOTS,
    ContentError,
    ContentStore,
    current_week_id,
    parse_week_id,
    week_range,
)


def _put_json(url: str, token: str, payload: dict[str, Any]) -> dict[str, Any]:
    req = urllib.request.Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), method="PUT",
                                 headers={"Content-Type": "application/json", "X-Admin-Token": token})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def list_candidates(store: ContentStore, week_id: str) -> None:
    start, end = week_range(week_id)
    labels = store.load_labels()
    current = (store.load_week(week_id) or {}).get("picks") or {}
    videos = store.week_candidates(week_id)
    print(f"{week_id}（{start} ~ {end}）候选 {len(videos)} 条（= 当周日更）：")
    if not videos:
        print("  （这一周还没有收录，先跑 ingest_day）")
    for v in sorted(videos, key=lambda x: x["collected_date"], reverse=True):
        slot = next((s for s, vid in current.items() if vid == v["id"]), None)
        mark = f"  ← {labels[slot]['label']}" if slot else ""
        print(f"  {v['collected_date']}  {v['id']:<48} {v['orientation']:<9} {v['category']:<16} {v['title'][:28]}{mark}")
    print()
    reasons = (store.load_week(week_id) or {}).get("reasons") or {}
    print("当前槽位：")
    for slot in WEEKLY_SLOTS:
        print(f"  {slot:<12} {labels[slot]['label']:<6} → {current.get(slot) or '（空）'}")
        if reasons.get(slot):
            print(f"  {'':<12} 理由：{reasons[slot]}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--week", default=None, help="ISO 周，例如 2026-W38（默认当前周，上海时区）")
    parser.add_argument("--list", action="store_true", help="列出该周候选和当前槽位")
    parser.add_argument("--hottest")
    parser.add_argument("--influential")
    parser.add_argument("--creative")
    parser.add_argument("--note", default="", help="本周一句话说明")
    parser.add_argument("--reason-hottest", default="", help="最热槽位的入选理由")
    parser.add_argument("--reason-influential", default="", help="最影响力槽位的入选理由")
    parser.add_argument("--reason-creative", default="", help="最有创意槽位的入选理由")
    parser.add_argument("--clear", action="store_true", help="清空该周三个槽位")
    parser.add_argument("--set-label", nargs=3, metavar=("SLOT", "LABEL", "TAGLINE"), action="append",
                        help="修改槽位文案，可重复")
    parser.add_argument("--content", default=str(DEFAULT_CONTENT_DIR))
    parser.add_argument("--feed-out", default=str(DEFAULT_FEED_PATH))
    parser.add_argument("--api", help="后端地址；给出时改为调用接口")
    parser.add_argument("--token")
    parser.add_argument("--no-build", action="store_true")
    args = parser.parse_args(argv)

    store = ContentStore(Path(args.content))
    week_id = args.week or current_week_id()
    try:
        parse_week_id(week_id)
    except ContentError as exc:
        print(f"✗ {exc}", file=sys.stderr)
        return 2

    changed = False
    try:
        if args.set_label:
            labels = {slot: {"label": label, "tagline": tagline} for slot, label, tagline in args.set_label}
            if args.api:
                _put_json(args.api.rstrip("/") + "/api/v1/creative/labels", args.token or "", labels)
            else:
                store.save_labels(labels)
            print("✓ 槽位文案已更新")
            changed = True

        if args.list:
            list_candidates(store, week_id)

        picks = {"hottest": args.hottest, "influential": args.influential, "creative": args.creative}
        reasons = {"hottest": args.reason_hottest, "influential": args.reason_influential,
                   "creative": args.reason_creative}
        if args.clear:
            picks = {slot: None for slot in WEEKLY_SLOTS}
        if any(picks.values()) or args.clear:
            if not args.clear:
                existing = (store.load_week(week_id) or {}).get("picks") or {}
                picks = {slot: picks[slot] or existing.get(slot) for slot in WEEKLY_SLOTS}
            if args.api:
                if not args.token:
                    print("✗ --api 需要同时给 --token", file=sys.stderr)
                    return 2
                result = _put_json(f"{args.api.rstrip('/')}/api/v1/creative/weeks/{week_id}/top3", args.token,
                                   {"picks": picks, "note": args.note, "reasons": reasons})
                print(f"✓ 接口已保存 {result.get('week_id', week_id)}")
            else:
                data = store.save_week(week_id, picks, args.note, reasons=reasons)
                labels = store.load_labels()
                print(f"✓ {week_id} 周榜已写入 content/weeks/{week_id}.json")
                for slot in WEEKLY_SLOTS:
                    print(f"  {labels[slot]['label']:<6} → {data['picks'][slot] or '（空）'}")
                    if data["reasons"].get(slot):
                        print(f"  {'':<6}   理由：{data['reasons'][slot]}")
            changed = True
    except ContentError as exc:
        print(f"✗ {exc}", file=sys.stderr)
        return 1
    except urllib.error.HTTPError as exc:
        print(f"✗ 接口返回 {exc.code}: {exc.read().decode('utf-8', 'replace')[:300]}", file=sys.stderr)
        return 1

    if changed and not args.api and not args.no_build:
        store.write_feed(Path(args.feed_out))
        print(f"✓ feed.json 已更新 → {args.feed_out}")
    if not changed and not args.list:
        parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
