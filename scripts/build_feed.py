#!/usr/bin/env python3
"""
把 content/ 编译成前端直接打包的 frontend/src/data/feed.json。

    python scripts/build_feed.py
    python scripts/build_feed.py --content ./content --out frontend/src/data/feed.json
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import _bootstrap  # noqa: F401  (sys.path)
from app.services.content_store import (  # noqa: E402
    DEFAULT_CONTENT_DIR,
    DEFAULT_FEED_PATH,
    ContentError,
    ContentStore,
    intro_warnings,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--content", default=str(DEFAULT_CONTENT_DIR), help="内容目录（默认 content/）")
    parser.add_argument("--out", default=str(DEFAULT_FEED_PATH), help="输出 feed.json 路径")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args(argv)

    store = ContentStore(Path(args.content))
    try:
        feed = store.write_feed(Path(args.out))
    except ContentError as exc:
        print(f"✗ 内容校验失败：{exc}", file=sys.stderr)
        return 1

    if not args.quiet:
        print(f"✓ feed.json → {args.out}")
        print(f"  视频 {len(feed['videos'])} 条 · 日期 {len(feed['days'])} 天 · 周榜 {len(feed['weeks'])} 周")
        for v in feed["videos"]:
            for w in intro_warnings(v):
                print(f"  ! {v['id']}: {w}")
        for w in feed["weeks"]:
            missing = [p["slot"] for p in w["picks"] if not p["video_id"]]
            if missing:
                print(f"  ! {w['week_id']} 缺槽位：{', '.join(missing)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
