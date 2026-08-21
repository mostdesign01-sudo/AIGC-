#!/usr/bin/env python3
"""生成 HyperFrames 演示视频（放映厅银幕内容）。

叙事：同一份周报页面 → 获得时间轴 → 元素按时间出现 → PPT 翻页 → 结尾卡。
运行：python3 tools/make_video.py  （输出 assets/video/hyperframes-demo.mp4）
"""
import math
import os
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
FPS = 24
DUR = 22
FRAMES = FPS * DUR

FONT = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
if not os.path.exists(MONO):
    MONO = FONT

BG = (12, 14, 16)
FG = (232, 230, 225)
DIM = (141, 146, 150)
AUR = (1, 194, 195)


def font(sz, mono=False):
    return ImageFont.truetype(MONO if mono else FONT, sz)


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def seg(t, a, b):
    return ease((t - a) / (b - a)) if b > a else 1.0


def draw_page(d, ox, oy, scale, reveal, playhead=None):
    """绘制"周报页面"卡片。reveal: 各元素出现进度 0-1 列表控制。"""
    pw, ph = int(560 * scale), int(560 * scale)
    d.rounded_rectangle([ox, oy, ox + pw, oy + ph], 12, fill=(18, 21, 24), outline=(60, 64, 68))
    pad = int(36 * scale)
    r_title, r_lines, r_bars = reveal
    # 标题
    if r_title > 0:
        a = int(255 * r_title)
        d.rectangle([ox + pad, oy + pad + 8, ox + pad + int(46 * r_title), oy + pad + 12], fill=AUR)
        d.text((ox + pad, oy + pad + 26), "本周周报 · 一页", font=font(int(34 * scale)),
               fill=(FG[0], FG[1], FG[2], a))
        d.text((ox + pad, oy + pad + 74), "weekly.html", font=font(int(16 * scale), True), fill=DIM)
    # 列表
    lines = ["需求评审完成 12 项", "上线功能 5 个", "线上问题清零", "下周重点：大促页面"]
    for i, ln in enumerate(lines):
        lr = max(0.0, min(1.0, r_lines * len(lines) - i))
        if lr <= 0:
            continue
        ly = oy + pad + int(120 * scale) + i * int(44 * scale)
        slide = int((1 - ease(lr)) * 30)
        d.ellipse([ox + pad + 2, ly + 8, ox + pad + 10, ly + 16], fill=AUR)
        d.text((ox + pad + 24 + slide, ly), ln, font=font(int(22 * scale)), fill=DIM)
    # 柱状图
    vals = [0.32, 0.45, 0.4, 0.62, 0.58, 0.83]
    bx0, by1 = ox + pad, oy + ph - pad
    bw_total = pw - pad * 2
    bh_max = int(150 * scale)
    d.line([bx0, by1, bx0 + bw_total, by1], fill=(70, 74, 78), width=2)
    for i, v in enumerate(vals):
        br = max(0.0, min(1.0, r_bars * len(vals) - i))
        bh = int(v * bh_max * ease(br))
        bw = bw_total // len(vals)
        x0 = bx0 + i * bw + bw // 4
        color = AUR if i == len(vals) - 1 else (90, 96, 100)
        if bh > 0:
            d.rectangle([x0, by1 - bh, x0 + bw // 2, by1], fill=color)
    return pw, ph


def draw_timeline(d, t, appear, playhead):
    """底部时间轴。"""
    a = ease(appear)
    if a <= 0:
        return
    y = H - 92 + int((1 - a) * 100)
    d.rectangle([60, y, W - 60, y + 64], fill=(16, 19, 22), outline=(60, 64, 68))
    d.text((76, y + 8), "TIMELINE", font=font(14, True), fill=DIM)
    # 三条轨道
    tracks = [("标题", 0.06, 0.2), ("列表", 0.22, 0.5), ("图表", 0.52, 0.86)]
    for i, (name, s0, s1) in enumerate(tracks):
        ty = y + 26 + i * 12
        x0 = 150 + int(s0 * (W - 260))
        x1 = 150 + int(s1 * (W - 260))
        d.rectangle([x0, ty, x1, ty + 7], fill=(30, 70, 72))
        d.rectangle([x0, ty, x0 + 3, ty + 7], fill=AUR)
    d.text((84, y + 30), "轨道", font=font(13), fill=(90, 96, 100))
    # 播放头
    px = 150 + int(playhead * (W - 260))
    d.rectangle([px - 1, y + 6, px + 1, y + 58], fill=AUR)


def frame(i):
    t = i / FPS
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    if t < 4.0:
        # 场景一：这是一份普通的 HTML 页面
        s = seg(t, 0.2, 1.2)
        off = int((1 - s) * 60)
        draw_page(d, 120, 90 + off, 0.82, (1, 1, 1))
        ts = seg(t, 0.8, 1.8)
        d.text((760, 250), "这是一份周报", font=font(44), fill=(int(FG[0]*ts), int(FG[1]*ts), int(FG[2]*ts)))
        d.text((760, 320), "一个可以打开的 HTML 页面", font=font(24), fill=(int(DIM[0]*ts),)*3)
        d.text((760, 380), "静止的。", font=font(24), fill=(int(DIM[0]*ts),)*3)
    elif t < 8.0:
        # 场景二：给它一条时间轴
        draw_page(d, 120, 66, 0.78, (1, 1, 1))
        ap = seg(t, 4.4, 5.6)
        draw_timeline(d, t, ap, 0.02)
        ts = seg(t, 4.6, 5.6)
        d.text((740, 210), "HYPERFRAMES", font=font(26, True), fill=(int(AUR[0]*ts), int(AUR[1]*ts), int(AUR[2]*ts)))
        d.text((740, 260), "给页面一条时间轴", font=font(42), fill=(int(FG[0]*ts),)*3)
        d.text((740, 330), "标题、列表、图表 ——", font=font(24), fill=(int(DIM[0]*ts),)*3)
        d.text((740, 370), "每个元素都排上出场时间", font=font(24), fill=(int(DIM[0]*ts),)*3)
    elif t < 14.0:
        # 场景三：元素按时间出现（播放）
        ph = seg(t, 8.2, 13.4)
        r_title = seg(ph, 0.06, 0.2)
        r_lines = seg(ph, 0.22, 0.5)
        r_bars = seg(ph, 0.52, 0.86)
        draw_page(d, 120, 66, 0.78, (r_title, r_lines, r_bars))
        draw_timeline(d, t, 1, ph)
        d.text((740, 210), "PLAYING", font=font(22, True), fill=AUR)
        d.text((740, 255), "静态内容", font=font(40), fill=FG)
        d.text((740, 315), "变成动态叙事", font=font(40), fill=FG)
        d.text((740, 395), "同一份内容，没有重做，", font=font(23), fill=DIM)
        d.text((740, 432), "只是获得了时间。", font=font(23), fill=DIM)
    elif t < 18.0:
        # 场景四：HTML PPT 翻页成片
        k = seg(t, 14.0, 17.6)
        page = min(2, int(k * 3))
        titles = ["01 背景与目标", "02 关键数据", "03 里程碑"]
        for pi in range(3):
            px = 140 + pi * 340 - int(k * 120)
            active = pi == page
            col = (20, 24, 27) if not active else (16, 34, 35)
            d.rounded_rectangle([px, 200, px + 300, 480], 10, fill=col,
                                outline=AUR if active else (60, 64, 68), width=2 if active else 1)
            d.text((px + 24, 230), titles[pi], font=font(26), fill=FG if active else DIM)
            for li in range(4):
                d.rectangle([px + 24, 300 + li * 34, px + 240, 308 + li * 34],
                            fill=(46, 50, 54) if not active else (30, 70, 72))
        d.text((140, 100), "HTML PPT，同样可以直接成片", font=font(38), fill=FG)
        d.text((140, 160), "章节即分镜 · 翻页即转场", font=font(22), fill=DIM)
        ph2 = seg(t, 14.0, 17.8)
        d.rectangle([0, H - 8, int(W * ph2), H], fill=AUR)
    else:
        # 结尾卡
        s = seg(t, 18.2, 19.2)
        d.rectangle([W // 2 - int(120 * s), 250, W // 2 + int(120 * s), 254], fill=AUR)
        d.text((W // 2, 300), "一份内容，三种交付", font=font(52), fill=FG, anchor="mm")
        d.text((W // 2, 370), "HTML · HTML PPT · THREE.JS · HYPERFRAMES", font=font(20, True), fill=DIM, anchor="mm")
        d.text((W // 2, 440), "得物 · 走进 HTML", font=font(24), fill=AUR, anchor="mm")

    # 顶部克制信息条
    d.text((60, 30), "HYPERFRAMES DEMO", font=font(14, True), fill=(80, 86, 90))
    d.text((W - 60, 30), f"{t:05.2f}s", font=font(14, True), fill=(80, 86, 90), anchor="ra")
    return img


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "video")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.abspath(os.path.join(out_dir, "hyperframes-demo.mp4"))
    with tempfile.TemporaryDirectory() as td:
        for i in range(FRAMES):
            frame(i).save(os.path.join(td, f"f{i:05d}.png"))
            if i % 100 == 0:
                print(f"frame {i}/{FRAMES}")
        # 柔和的合成配乐：两枚低音正弦 + 轻噪声
        audio = (
            "sine=frequency=110:duration=22,volume=0.06[a1];"
            "sine=frequency=164.8:duration=22,volume=0.04[a2];"
            "anoisesrc=duration=22:color=brown:amplitude=0.02[a3];"
            "[a1][a2][a3]amix=inputs=3,afade=t=in:d=1.5,afade=t=out:st=20:d=2[aout]"
        )
        subprocess.run([
            "ffmpeg", "-y",
            "-framerate", str(FPS), "-i", os.path.join(td, "f%05d.png"),
            "-filter_complex", audio,
            "-map", "0:v", "-map", "[aout]",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
            "-c:a", "aac", "-b:a", "96k",
            "-movflags", "+faststart",
            out,
        ], check=True)
    print("saved", out)


if __name__ == "__main__":
    main()
