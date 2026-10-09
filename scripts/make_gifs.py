#!/usr/bin/env python3
"""
从 mp4 切 2 倍速 GIF（需要 ffmpeg / ffprobe）。

规则：
  横版 landscape → 两张 720×406，命名 <slug>-a.gif / <slug>-b.gif，卡片上 a 在上、b 在下
  竖版 vertical  → 一张 360×640，命名 <slug>.gif
  两者都是 2× 速度（setpts=0.5*PTS），默认 14 fps，palettegen/paletteuse 两遍调色
  自动去黑边：每段先抽帧检测上下（letterbox）/左右（pillarbox）黑边（整行/整列 luma<24），
  裁掉后再 scale+居中裁切铺满目标尺寸，不加 pad —— a/b 上下拼接时中间不会出现黑带
  体积上限：单张 GIF > --max-bytes（默认 10 MB）时自动降色数 / fps 重出

用法：
    python scripts/make_gifs.py input.mp4 --slug motorola-100ai --out-dir dist/gifs
    python scripts/make_gifs.py input.mp4 --slug raven --orientation vertical --a-start 3 --seg 7
    python scripts/make_gifs.py input.mp4 --slug x --a-start 5 --b-start 40 --seg 8 --fps 12 --cover

默认取段：a 段从时长 10% 处开始，b 段从 60% 处开始，每段源片 11 秒（GIF 5.5 秒）。
只检测不出图：python scripts/make_gifs.py input.mp4 --slug x --detect-only --a-start 12 --seg 11
关闭去黑边：--no-autocrop
产物上传到 GitHub Release（或任意 CDN）后，把 URL 交给 ingest_day.py 的 --gif-a / --gif-b。
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
import shutil
import subprocess
import sys
from pathlib import Path

LANDSCAPE = (720, 406)
VERTICAL = (360, 640)
MAX_BYTES = 10 * 1024 * 1024
BAR_LUMA = 24          # 整行/整列最大亮度低于此值视为黑边
BAR_MIN_PX = 4         # 小于 4px 的边忽略（编码噪声）
BAR_MARGIN_PX = 2      # 多裁 2px，吃掉黑边与画面交界的过渡行
BAR_MAX_FRAC = 0.30    # 单边最多裁 30%，防止把暗场内容当黑边


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


def _edge_run(dark) -> int:
    n = 0
    for d in dark:
        if not d:
            break
        n += 1
    return n


def detect_bars(ffmpeg: str, src: Path, start: float, seg: float, src_w: int, src_h: int,
                samples: int = 12) -> dict:
    """抽 samples 帧，返回 {top,bottom,left,right}（源分辨率像素）。

    逐帧量「从边缘起连续多少行/列整行 max luma < 24」。真黑边逐帧恒定：某一边宽在 ≥40% 帧里稳定出现
    且对边也有（或单边 ≥80% 帧）才算黑边，暗场/黑底产品镜头（边宽随画面抖动）不会被误裁。
    上下都检到时按较大值对称裁；对边被黑边里的字幕打断时也一起裁掉。
    """
    try:
        import numpy as np  # noqa: WPS433
    except ImportError:
        print("! 未安装 numpy，跳过自动去黑边（pip install numpy）", file=sys.stderr)
        return {"top": 0, "bottom": 0, "left": 0, "right": 0}
    fps = max(samples / max(seg, 0.5), 0.2)
    cmd = [ffmpeg, "-v", "error", "-ss", f"{max(start, 0):.2f}", "-t", f"{seg:.2f}", "-i", str(src),
           "-vf", f"fps={fps:.4f},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (src_w * src_h)
    if n == 0:
        return {"top": 0, "bottom": 0, "left": 0, "right": 0}
    frames = np.frombuffer(raw[: n * src_w * src_h], np.uint8).reshape(n, src_h, src_w)
    per = {"top": [], "bottom": [], "left": [], "right": []}
    def edge(f, axis: int) -> tuple[int, int]:
        """axis=1 量上/下黑边，axis=0 量左/右。

        先按整行（整列）判定；再把画面切成 6 条，各条单独量，≥3 条一致（±2px）时取该值 ——
        黑边里压着台标 / 字幕时整行判定会被打断，分条投票能量出真实黑边。
        单条暗到超过 45% 的视为纯黑底条（黑底产品镜头），不参与投票。
        """
        full = f.max(axis=axis) < BAR_LUMA
        res = []
        for rev in (False, True):
            base = _edge_run(full[::-1] if rev else full)
            limit = int(full.size * 0.45)
            runs = []
            for part in np.array_split(f, 6, axis=axis):
                d = part.max(axis=axis) < BAR_LUMA
                r = _edge_run(d[::-1] if rev else d)
                if r < limit:
                    runs.append(r)
            best = base
            for v in sorted(set(runs), reverse=True):
                if v <= base:
                    break
                if sum(1 for r in runs if abs(r - v) <= 2) >= 3:
                    best = v
                    break
            res.append(best)
        return res[0], res[1]

    for f in frames:
        rows = f.max(axis=1) < BAR_LUMA
        if rows.mean() > 0.9:  # 黑场/淡入淡出帧不参与
            continue
        t, b = edge(f, 1)
        l, r = edge(f, 0)
        per["top"].append(t)
        per["bottom"].append(b)
        per["left"].append(l)
        per["right"].append(r)
    if not per["top"]:
        return {"top": 0, "bottom": 0, "left": 0, "right": 0}

    total = len(per["top"])

    def stable(vals: list[int]) -> tuple[int, float]:
        """最常见的边宽（±2px 视为同一值）及其出现比例。真黑边逐帧恒定，暗场内容会抖动。"""
        best_v, best_n = 0, 0
        for v in set(vals):
            if v < BAR_MIN_PX:
                continue
            n = sum(1 for x in vals if abs(x - v) <= 2)
            if n > best_n or (n == best_n and v > best_v):
                best_v, best_n = v, n
        if best_n == 0:
            return 0, 0.0
        return max(x for x in vals if abs(x - best_v) <= 2), best_n / total

    bars = {k: 0 for k in per}
    for a, b in (("top", "bottom"), ("left", "right")):
        (va, fa), (vb, fb) = stable(per[a]), stable(per[b])
        ok_a = fa >= 0.4 and (fb >= 0.4 or fa >= 0.8)
        ok_b = fb >= 0.4 and (fa >= 0.4 or fb >= 0.8)
        if ok_a and ok_b:
            bars[a] = bars[b] = max(va, vb)          # 对称裁
        elif ok_a or ok_b:
            v = va if ok_a else vb
            other = per[b] if ok_a else per[a]
            # 对边被字幕等打断时（中位数也偏暗），按对称黑边处理，一起裁掉
            mirror = statistics.median(other) >= 0.25 * v
            bars[a] = v if (ok_a or mirror) else 0
            bars[b] = v if (ok_b or mirror) else 0
    limit = {"top": src_h, "bottom": src_h, "left": src_w, "right": src_w}
    for k in bars:
        v = bars[k]
        # 小于 4px 或 0.6% 边长（缩到 GIF 后 ≤2px）的细边忽略
        tiny = max(BAR_MIN_PX, int(limit[k] * 0.006))
        bars[k] = 0 if v < tiny else min(v + BAR_MARGIN_PX, int(limit[k] * BAR_MAX_FRAC))
    bars["_median"] = {k: int(statistics.median(v)) for k, v in per.items()}
    return bars


def crop_prefix(bars: dict | None) -> str:
    """把检测到的黑边转成 ffmpeg crop（偶数对齐），没有黑边时返回空串。"""
    if not bars:
        return ""
    t, b, l, r = (bars.get(k, 0) for k in ("top", "bottom", "left", "right"))
    if not any((t, b, l, r)):
        return ""
    t, b, l, r = (v + (v & 1) for v in (t, b, l, r))
    return f"crop=iw-{l + r}:ih-{t + b}:{l}:{t},"


def gif_filter(size: tuple[int, int], fps: int, speed: float, bars: dict | None = None,
               colors: int = 200) -> str:
    w, h = size
    return (
        f"{crop_prefix(bars)}setpts={1 / speed:.4f}*PTS,fps={fps},"
        f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},"
        f"split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors={colors}[p];"
        "[s1][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle"
    )


def cut_gif(ffmpeg: str, src: Path, out: Path, start: float, seg: float, size: tuple[int, int],
            fps: int, speed: float, bars: dict | None = None, max_bytes: int = MAX_BYTES) -> tuple[int, int]:
    """出图；超过 max_bytes 时按 色数→fps 阶梯降级重出。返回最终 (fps, colors)。"""
    out.parent.mkdir(parents=True, exist_ok=True)
    ladder = [(fps, 200), (fps, 128), (fps, 96), (max(fps - 2, 8), 96), (max(fps - 4, 8), 80),
              (8, 64), (8, 48)]
    seen = set()
    for f, c in ladder:
        if (f, c) in seen:
            continue
        seen.add((f, c))
        cmd = [
            ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-ss", f"{max(start, 0):.2f}", "-t", f"{seg:.2f}", "-i", str(src),
            "-filter_complex", gif_filter(size, f, speed, bars, c),
            "-loop", "0", str(out),
        ]
        subprocess.run(cmd, check=True)
        if out.stat().st_size <= max_bytes:
            return f, c
    print(f"! {out.name} 降到 8fps/48 色仍 > {human(max_bytes)}，请减小 --seg", file=sys.stderr)
    return f, c


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
    parser.add_argument("--seg", type=float, default=11.0, help="每段源片秒数，2× 后 GIF 时长为其一半")
    parser.add_argument("--fps", type=int, default=14)
    parser.add_argument("--speed", type=float, default=2.0, help="倍速，默认 2")
    parser.add_argument("--cover", action="store_true", help="同时导出一张封面 jpg")
    parser.add_argument("--no-autocrop", action="store_true", help="关闭自动去黑边")
    parser.add_argument("--detect-only", action="store_true", help="只打印各段黑边检测结果与 crop，不出图")
    parser.add_argument("--print-crop", action="store_true",
                        help="只打印 a 段（--a-start/--seg）的 crop 前缀（如 crop=iw-0:ih-72:0:36,），供 shell 脚本拼 -vf")
    parser.add_argument("--max-bytes", type=int, default=MAX_BYTES, help="单张 GIF 上限，默认 10 MB")
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
    print(f"源片 {info['width']}x{info['height']} · {duration:.1f}s · 判定 {orientation}",
          file=sys.stderr if args.print_crop else sys.stdout)

    seg = min(args.seg, max(duration, 1.0))
    a_start = args.a_start if args.a_start is not None else max(0.0, duration * 0.10)
    if a_start + seg > duration:
        a_start = max(0.0, duration - seg)

    if args.print_crop:
        bars = None if args.no_autocrop else detect_bars(ffmpeg, src, a_start, seg, info["width"], info["height"])
        print(crop_prefix(bars))
        return 0

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
            bars = None if args.no_autocrop else detect_bars(ffmpeg, src, start, seg, info["width"], info["height"])
            if args.detect_only:
                print(f"[{tag}] {start:.1f}s~{start + seg:.1f}s bars={bars} crop={crop_prefix(bars).rstrip(',') or '-'}")
                continue
            used_fps, used_colors = cut_gif(ffmpeg, src, out, start, seg, LANDSCAPE, args.fps, args.speed,
                                            bars, args.max_bytes)
            outputs.append(out)
            cropped = crop_prefix(bars).rstrip(",")
            print(f"✓ {out}  {LANDSCAPE[0]}x{LANDSCAPE[1]} · 源 {start:.1f}s~{start + seg:.1f}s · "
                  f"{used_fps}fps/{used_colors}色 · {human(out.stat().st_size)}"
                  + (f" · 去黑边 {cropped}" if cropped else ""))
        if args.detect_only:
            return 0
        if args.cover:
            cover = out_dir / f"{args.slug}-cover.jpg"
            extract_cover(ffmpeg, src, cover, a_start + seg / 2, (1280, 720))
            print(f"✓ {cover}")
    else:
        out = out_dir / f"{args.slug}.gif"
        bars = None if args.no_autocrop else detect_bars(ffmpeg, src, a_start, seg, info["width"], info["height"])
        if args.detect_only:
            print(f"[v] {a_start:.1f}s~{a_start + seg:.1f}s bars={bars} crop={crop_prefix(bars).rstrip(',') or '-'}")
            return 0
        cut_gif(ffmpeg, src, out, a_start, seg, VERTICAL, args.fps, args.speed, bars, args.max_bytes)
        outputs.append(out)
        print(f"✓ {out}  {VERTICAL[0]}x{VERTICAL[1]} · 源 {a_start:.1f}s~{a_start + seg:.1f}s · {human(out.stat().st_size)}")
        if args.cover:
            cover = out_dir / f"{args.slug}-cover.jpg"
            extract_cover(ffmpeg, src, cover, a_start + seg / 2, (720, 1280))
            print(f"✓ {cover}")

    big = [o for o in outputs if o.stat().st_size > args.max_bytes]
    if big:
        print(f"! 以下 GIF 仍超过 {human(args.max_bytes)}，请减小 --seg：" + ", ".join(o.name for o in big))
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
