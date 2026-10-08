#!/usr/bin/env python3
"""
原片抓取 → 上传到当天的 GitHub Release（daily-YYYY-MM-DD），并回写 content/videos/<日期>.json 的 video_download_url。

单条（日更例程每收一条就跑一次）：
    python scripts/upload_original.py --date 2026-10-08 --id 2026-10-08-xxx
    # 或不依赖 JSON：--url https://www.youtube.com/watch?v=xxxx --slug norte-one-shoe-20-styles --date 2026-10-08

整天 / 补历史：
    python scripts/upload_original.py --date 2026-10-08            # 当天所有缺原片的条目
    python scripts/upload_original.py --since 2026-09-15           # 从某天起全部补齐

已下载好的源片可直接给：--file clips/xxx.mp4（跳过下载）。

规则
- 资产名 <slug>.mp4，slug 与 GIF 同名（xxx-a.gif → xxx.mp4）。
- 下载：yt-dlp 取最佳 mp4（H.264 优先），合并音轨；YouTube 需要时用 --cookies（默认读 $YTDLP_COOKIES）。
- B 站（当前常 412）：先找 source_notes / --mirror 里作者自己的 YouTube 版；都没有就写 video_download_note=「B 站 412，原片暂不可下载」。
- 超过 1.9 GB、或不是 H.264/AAC mp4（浏览器播不了）时，转码为 1080p H.264 + AAC（-crf 20，faststart）。
- 上传：gh release upload daily-<日期> <slug>.mp4 --clobber（Release 不存在会先创建）。
- 下载地址：https://github.com/<repo>/releases/download/<tag>/<slug>.mp4（GitHub 以附件返回，点了就是下载）。
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import _bootstrap  # noqa: F401
from app.services.content_store import DEFAULT_CONTENT_DIR, DEFAULT_FEED_PATH, ContentStore  # noqa: E402

REPO = os.environ.get("AIGC_RELEASE_REPO", "mostdesign01-sudo/AIGC-")
MAX_BYTES = int(1.9 * 1024**3)
YT_RE = re.compile(r"(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([\w-]{11})")


def slug_of(entry: dict) -> str:
    name = os.path.basename(entry.get("gif_a_url") or "")
    name = re.sub(r"(-a)?\.gif$", "", name)
    name = re.sub(r"^\d\d-", "", name)
    return name or entry["id"]


def youtube_url_for(entry: dict, mirror: str | None = None) -> str | None:
    """主链接是 YouTube 就用它；否则在 mirror / source_notes 里找作者自己的 YouTube 版。"""
    for text in (mirror or "", entry.get("url", ""), entry.get("source_notes", "")):
        m = YT_RE.search(text or "")
        if m:
            return f"https://www.youtube.com/watch?v={m.group(1)}"
    return None


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height:format=duration",
         "-of", "json", str(path)], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def needs_transcode(path: Path) -> bool:
    info = probe(path)
    v = [s for s in info.get("streams", []) if s.get("codec_type") == "video"]
    a = [s for s in info.get("streams", []) if s.get("codec_type") == "audio"]
    if path.stat().st_size > MAX_BYTES:
        return True
    if not v or v[0].get("codec_name") != "h264":
        return True
    if a and a[0].get("codec_name") not in ("aac", "mp3"):
        return True
    return path.suffix.lower() != ".mp4"


def transcode_1080p(src: Path, dst: Path) -> None:
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(src),
        "-vf", "scale='min(1920,iw)':-2", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(dst),
    ], check=True)


def remux_faststart(src: Path, dst: Path) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-c", "copy", "-movflags", "+faststart", str(dst)],
                   check=True)


def download(url: str, out_dir: Path, cookies: str | None) -> Path:
    cmd = ["yt-dlp", "--no-playlist", "--no-progress",
           "-f", "bv*[vcodec^=avc1][height<=1080]+ba[acodec^=mp4a]/bv*[height<=1080]+ba/b",
           "--merge-output-format", "mp4", "-o", str(out_dir / "%(id)s.%(ext)s"), url]
    if cookies and Path(cookies).exists():
        cmd[1:1] = ["--cookies", cookies]
    subprocess.run(cmd, check=True)
    files = sorted(out_dir.glob("*.mp4"), key=lambda p: p.stat().st_size, reverse=True)
    if not files:
        raise RuntimeError("yt-dlp 没有产出 mp4")
    return files[0]


def ensure_release(tag: str) -> None:
    r = subprocess.run(["gh", "release", "view", tag, "-R", REPO], capture_output=True, text=True)
    if r.returncode != 0:
        subprocess.run(["gh", "release", "create", tag, "-R", REPO, "--title", f"日更 {tag.removeprefix('daily-')}",
                        "--notes", "日更 GIF 与原片"], check=True)


def upload(path: Path, tag: str, asset_name: str) -> str:
    ensure_release(tag)
    target = path
    if path.name != asset_name:
        target = path.with_name(asset_name)
        shutil.copyfile(path, target)
    subprocess.run(["gh", "release", "upload", tag, str(target), "-R", REPO, "--clobber"], check=True)
    return f"https://github.com/{REPO}/releases/download/{tag}/{asset_name}"


def process(entry: dict, *, file: str | None, mirror: str | None, cookies: str | None, dry_run: bool) -> dict:
    """返回 {video_download_url | video_download_note}。"""
    date = entry["collected_date"]
    slug = slug_of(entry)
    tag = f"daily-{date}"
    src_url = youtube_url_for(entry, mirror)
    with tempfile.TemporaryDirectory(prefix="orig-") as tmp:
        tmpd = Path(tmp)
        if file:
            src = Path(file)
        elif src_url:
            if dry_run:
                return {"video_download_url": f"(dry-run) {src_url} → {tag}/{slug}.mp4"}
            src = download(src_url, tmpd, cookies)
        else:
            reason = "B 站 412，作者未发 YouTube 版，原片暂不可下载" if entry.get("platform") == "bilibili" \
                else "来源平台不支持直接下载原片"
            return {"video_download_note": reason}
        out = tmpd / f"{slug}.mp4"
        if needs_transcode(src):
            transcode_1080p(src, out)
        else:
            remux_faststart(src, out)
        if dry_run:
            return {"video_download_url": f"(dry-run) {out} → {tag}"}
        return {"video_download_url": upload(out, tag, f"{slug}.mp4"), "video_download_note": ""}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--date", help="收录日期 YYYY-MM-DD")
    ap.add_argument("--since", help="从该日期起补齐所有缺原片的条目")
    ap.add_argument("--id", help="只处理这条（content 里的 id）")
    ap.add_argument("--url", help="不依赖 JSON 时的原片链接（配 --slug --date）")
    ap.add_argument("--slug", help="资产名（不含 .mp4）")
    ap.add_argument("--file", help="已下载好的源片，跳过下载")
    ap.add_argument("--mirror", help="B 站等无法下载时，作者自己的 YouTube 版链接")
    ap.add_argument("--cookies", default=os.environ.get("YTDLP_COOKIES"), help="yt-dlp cookies 文件（默认 $YTDLP_COOKIES）")
    ap.add_argument("--force", action="store_true", help="已有 video_download_url 也重传")
    ap.add_argument("--content", default=str(DEFAULT_CONTENT_DIR))
    ap.add_argument("--feed-out", default=str(DEFAULT_FEED_PATH))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    if args.url and not args.id:
        if not (args.slug and args.date):
            print("✗ --url 需要配 --slug 和 --date", file=sys.stderr)
            return 2
        entry = {"id": args.slug, "url": args.url, "collected_date": args.date,
                 "gif_a_url": f"{args.slug}-a.gif", "platform": "", "source_notes": ""}
        res = process(entry, file=args.file, mirror=args.mirror, cookies=args.cookies, dry_run=args.dry_run)
        print(json.dumps(res, ensure_ascii=False))
        return 0 if res.get("video_download_url") else 1

    store = ContentStore(Path(args.content))
    days = [d for d in store.list_days() if (args.date and d == args.date) or (args.since and d >= args.since)]
    if not days:
        print("✗ 需要 --date 或 --since（或 --url/--slug/--date）", file=sys.stderr)
        return 2
    failures = 0
    for day in days:
        rows = store.load_day(day)
        changed = False
        for row in rows:
            if args.id and row.get("id") != args.id:
                continue
            if row.get("video_download_url") and not args.force:
                continue
            entry = {**row, "collected_date": row.get("collected_date") or day}
            try:
                res = process(entry, file=args.file, mirror=args.mirror, cookies=args.cookies, dry_run=args.dry_run)
            except Exception as exc:  # noqa: BLE001
                failures += 1
                print(f"✗ {row['id']}: {exc}", file=sys.stderr)
                continue
            print(f"{'✓' if res.get('video_download_url') else '·'} {row['id']}: {res}")
            if not args.dry_run:
                row.update(res)
                changed = True
        if changed:
            store.save_day(day, rows)
    if not args.dry_run:
        store.write_feed(Path(args.feed_out))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
