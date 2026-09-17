#!/usr/bin/env python3
"""
从 mp4 切 2 倍速 GIF（需要 ffmpeg / ffprobe）。

规则：
  横版 landscape → 两张 720×406，命名 <slug>-a.gif / <slug>-b.gif，卡片上 a 在上、b 在下
  竖版 vertical  → 一张 360×640，命名 <slug>.gif
  两者都是 2× 速度（setpts=0.5*PTS），默认 14 fps，palettegen/paletteuse 两遍调色

用法：
    python scripts/make_gifs.py input.mp4 --slug motorola-100ai --out-dir dist/gifs
    python scripts/make_gifs.py input.mp4 --slug raven --orientation vertical --a-start 3 --seg 7
    python scripts/make_gifs.py input.mp4 --slug x --a-start 5 --b-start 40 --seg 8 --fps 12 --cover

默认取段：a 段从时长 10% 处开始，b 段从 60% 处开始，每段源片 8 秒（GIF 4 秒）。
产物上传到 GitHub Release（或任意 CDN）后，把 URL 交给 ingest_day.py 的 --gif-a / --gif-b。
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

LANDSCAPE = (720, 406)
VERTICAL = (360, 640)


def which_or_die(name: str, env_var: str) -> str:
    configured = os.environ.get(env_var, "").strip()
    if configured and os.path.isfile(configured):
        return configured
    found = shutil.which(name)
    if not found:
        print(
            f"✗ 找不到 {name}。macOS: brew install ffmpeg；Debian/Ubuntu: sudo apt-get install -y ffmpeg；"
            f"或用环境变量 {env_var} 指定路径。\n"
            "  没有 ffmpeg 时也可以用其它工具产出同尺寸 GIF，再把 URL 交给 ingest_day.py。",
            file=sys.stderr,
        )
        raise SystemExit(2)
    return found


def probe(ffprobe: str, path: Path) -> dict:
    cmd = [ffprobe, "-v", "error", "-select_streams", "v:0",
           "-show_entries", "stream=width,height,duration:format=duration", "-of", "json", str(path)]
    data = json.loads(subprocess.check_output(cmd, stderr=subprocess.STDOUT))
    stream = (data.get("streams") or [{}])[0]
    duration = stream.get("duration") or (data.get("format") or {}).get("duration") or 0
    return {
        "width": int(stream.get("width") or 0),
        "height": int(stream.get("height") or 0),
        "duration": float(duration or 0),
    }


def gif_filter(size: tuple[int, int], fps: int, speed: float) -> str:
    w, h = size
    return (
        f"setpts={1 / speed:.4f}*PTS,fps={fps},"
        f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},"
        "split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors=200[p];"
        "[s1][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle"
    )


def cut_gif(ffmpeg: str, src: Path, out: Path, start: float, seg: float, size: tuple[int, int],
            fps: int, speed: float) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{max(start, 0):.2f}", "-t", f"{seg:.2f}", "-i", str(src),
        "-filter_complex", gif_filter(size, fps, speed),
        "-loop", "0", str(out),
    ]
    subprocess.run(cmd, check=True)


def extract_cover(ffmpeg: str, src: Path, out: Path, at: float, size: tuple[int, int]) -> None:
    w, h = size
    cmd = [ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{at:.2f}", "-i", str(src),
           "-frames:v", "1", "-vf", f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}",
           "-q:v", "3", str(out)]
    subprocess.run(cmd, check=True)


def human(n: int) -> str:
    return f"{n / 1024 / 1024:.1f} MB" if n > 1024 * 1024 else f"{n / 1024:.0f} KB"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", help="源 mp4 / mov / webm")
    parser.add_argument("--slug", required=True, help="文件名前缀，例如 motorola-100ai")
    parser.add_argument("--out-dir", default="dist/gifs")
    parser.add_argument("--orientation", choices=["auto", "landscape", "vertical"], default="auto")
    parser.add_argument("--a-start", type=float, default=None, help="a 段起点（秒），默认时长的 10%%")
    parser.add_argument("--b-start", type=float, default=None, help="b 段起点（秒），默认时长的 60%%（仅横版）")
    parser.add_argument("--seg", type=float, default=8.0, help="每段源片秒数，2× 后 GIF 时长为其一半")
    parser.add_argument("--fps", type=int, default=14)
    parser.add_argument("--speed", type=float, default=2.0, help="倍速，默认 2")
    parser.add_argument("--cover", action="store_true", help="同时导出一张封面 jpg")
    args = parser.parse_args(argv)

    ffmpeg = which_or_die("ffmpeg", "FFMPEG_PATH")
    ffprobe = which_or_die("ffprobe", "FFPROBE_PATH")

    src = Path(args.input)
    if not src.is_file():
        print(f"✗ 找不到文件：{src}", file=sys.stderr)
        return 2

    info = probe(ffprobe, src)
    duration = info["duration"]
    orientation = args.orientation
    if orientation == "auto":
        orientation = "vertical" if info["height"] > info["width"] else "landscape"
    print(f"源片 {info['width']}x{info['height']} · {duration:.1f}s · 判定 {orientation}")

    seg = min(args.seg, max(duration, 1.0))
    a_start = args.a_start if args.a_start is not None else max(0.0, duration * 0.10)
    if a_start + seg > duration:
        a_start = max(0.0, duration - seg)

    out_dir = Path(args.out_dir)
    outputs: list[Path] = []

    if orientation == "landscape":
        b_start = args.b_start if args.b_start is not None else duration * 0.60
        if b_start + seg > duration:
            b_start = max(0.0, duration - seg)
        if abs(b_start - a_start) < seg * 0.5 and duration > seg * 2:
            b_start = min(duration - seg, a_start + seg)
        for tag, start in (("a", a_start), ("b", b_start)):
            out = out_dir / f"{args.slug}-{tag}.gif"
            cut_gif(ffmpeg, src, out, start, seg, LANDSCAPE, args.fps, args.speed)
            outputs.append(out)
            print(f"✓ {out}  {LANDSCAPE[0]}x{LANDSCAPE[1]} · 源 {start:.1f}s~{start + seg:.1f}s · {human(out.stat().st_size)}")
        if args.cover:
            cover = out_dir / f"{args.slug}-cover.jpg"
            extract_cover(ffmpeg, src, cover, a_start + seg / 2, (1280, 720))
            print(f"✓ {cover}")
    else:
        out = out_dir / f"{args.slug}.gif"
        cut_gif(ffmpeg, src, out, a_start, seg, VERTICAL, args.fps, args.speed)
        outputs.append(out)
        print(f"✓ {out}  {VERTICAL[0]}x{VERTICAL[1]} · 源 {a_start:.1f}s~{a_start + seg:.1f}s · {human(out.stat().st_size)}")
        if args.cover:
            cover = out_dir / f"{args.slug}-cover.jpg"
            extract_cover(ffmpeg, src, cover, a_start + seg / 2, (720, 1280))
            print(f"✓ {cover}")

    big = [o for o in outputs if o.stat().st_size > 8 * 1024 * 1024]
    if big:
        print("! 以下 GIF 超过 8 MB，建议减小 --seg 或 --fps：" + ", ".join(o.name for o in big))
    print("\n下一步：把 GIF 上传到 GitHub Release / CDN，然后：")
    if orientation == "landscape":
        print(f"  python scripts/ingest_day.py --url <源链接> --category <slug> --orientation landscape "
              f"--gif-a <URL/{args.slug}-a.gif> --gif-b <URL/{args.slug}-b.gif> --intro \"…\"")
    else:
        print(f"  python scripts/ingest_day.py --url <源链接> --category <slug> --orientation vertical "
              f"--gif-a <URL/{args.slug}.gif> --intro \"…\"")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
