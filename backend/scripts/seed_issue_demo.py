"""
为当期灌入 9 类各 1 条示例，抽 3 条并给带视频的条目出 2x GIF。

用法（在 backend 目录）:
    python scripts/seed_issue_demo.py
"""
from __future__ import annotations

import os
import subprocess
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from app.db.database import SessionLocal, init_db  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.video import Video  # noqa: E402
from app.services.gif_service import FFmpegNotFoundError, generate_2x_gif  # noqa: E402
from app.services.issue_service import (  # noqa: E402
    coverage,
    get_or_create_current_issue,
    set_selected,
)
from app.services.media_service import GIF_DIR, UPLOAD_DIR, ensure_media_dirs  # noqa: E402


SAMPLES = [
    {
        "slug": "ai-short-film",
        "title": "雨夜便利店",
        "intro": "用可灵做主体一致性，再叠一层手持伪纪录片运镜。适合品牌讲「深夜情绪」的短片开场。",
        "kind": "video",
        "with_video": True,
        "duration": 8,
        "portrait": True,
    },
    {
        "slug": "ai-ad",
        "title": "球鞋拆箱光影",
        "intro": "先 Midjourney 出静帧，Runway 做推轨，最后用产品实拍贴合。适合新品上市 15 秒广告。",
        "kind": "video",
        "with_video": True,
        "duration": 6,
        "portrait": True,
    },
    {
        "slug": "fashion",
        "title": "一衣三穿街拍",
        "intro": "同一人物种子换三套材质球，保持脸与体态。适合电商详情页的换装对比。",
        "kind": "video",
        "with_video": False,
    },
    {
        "slug": "props-transition",
        "title": "纸杯变舞台",
        "intro": "道具做转场锚点：前一镜纸杯特写，后一镜同构图换成剧场。适合信息流中段留人。",
        "kind": "video",
        "with_video": False,
    },
    {
        "slug": "ar-material",
        "title": "盒内小剧场",
        "intro": "包装平面印识别图，AR 打开后是 3 秒角色表演。适合线下物料扫码互动。",
        "kind": "video",
        "with_video": False,
    },
    {
        "slug": "ai-tool",
        "title": "Kling 3.0 角色锁定",
        "intro": "新版本把「角色锁定」做成一键。适合系列短片里反复出场的同一 IP。",
        "kind": "tool",
        "url": "https://klingai.com",
        "with_video": False,
    },
    {
        "slug": "new-model",
        "title": "Seedance 2.0 群像",
        "intro": "多人物同框不再糊脸，适合群像走秀和派对场面。广告里「一镜多人」可以先试它。",
        "kind": "model",
        "url": "https://jimeng.jianying.com",
        "with_video": False,
    },
    {
        "slug": "3d-render",
        "title": "亚克力城市夜景",
        "intro": "Blender 粗模 + AI 材质替换，再回三维补反射。适合美妆/数码的桌面场景。",
        "kind": "video",
        "with_video": True,
        "duration": 5,
        "portrait": False,
    },
    {
        "slug": "ip-character",
        "title": "小幽灵店员",
        "intro": "先定三视图和口头禅，再用同一参考图做表情包和短视频。适合做持续运营的品牌 IP。",
        "kind": "video",
        "with_video": False,
    },
]


def _make_clip(path: str, seconds: int, portrait: bool) -> None:
    size = "360x640" if portrait else "640x360"
    color = "0x00DBDB" if portrait else "0x111111"
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c={color}:s={size}:d={seconds}",
        "-f", "lavfi", "-i", f"sine=frequency=440:duration={seconds}",
        "-shortest", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        path,
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    init_db()
    ensure_media_dirs()
    db = SessionLocal()
    try:
        issue = get_or_create_current_issue(db)
        cats = {c.slug: c for c in db.query(Category).all()}
        created = []
        for sample in SAMPLES:
            cat = cats.get(sample["slug"])
            if not cat:
                raise SystemExit(f"缺少类型 {sample['slug']}，请先启动一次后端以写入默认类型")
            existing = (
                db.query(Video)
                .filter(Video.issue_id == issue.id, Video.title == sample["title"])
                .first()
            )
            if existing:
                created.append(existing)
                continue

            rel_media = None
            rel_cover = None
            duration = sample.get("duration") or 0
            orientation = "unknown"
            media_type = "link" if sample["kind"] in ("tool", "model") else "video"
            if sample.get("with_video"):
                fname = f"demo_{sample['slug']}.mp4"
                abs_path = os.path.join(UPLOAD_DIR, fname)
                _make_clip(abs_path, sample["duration"], sample.get("portrait", True))
                rel_media = f"uploads/{fname}"
                media_type = "video"
                orientation = "portrait" if sample.get("portrait") else "landscape"

            video = Video(
                platform="manual" if sample.get("with_video") else "link",
                video_id=f"demo-{sample['slug']}-vol{issue.vol_number}",
                title=sample["title"],
                description="",
                url=sample.get("url") or "",
                intro=sample["intro"],
                ai_summary=sample["intro"],
                category_id=cat.id,
                issue_id=issue.id,
                item_kind=sample["kind"],
                media_type=media_type,
                local_media_path=rel_media,
                local_cover_path=rel_cover,
                duration_seconds=duration,
                orientation=orientation,
                author="示例",
                tags="[]",
                play_count=0,
                like_count=0,
                selected=False,
                gif_status="none",
            )
            db.add(video)
            db.commit()
            db.refresh(video)
            created.append(video)

        if not issue.summary:
            issue.summary = (
                "这一期把近半月里能讲清「怎么做 / 创意点 / 能用在哪」的作品收成 9 类，"
                "再抽出 3 条做成竖版卡片，方便设计快速扫。"
            )
            db.add(issue)
            db.commit()

        # 抽 3：短片、广告、3D
        pick_titles = {"雨夜便利店", "球鞋拆箱光影", "亚克力城市夜景"}
        for video in created:
            if video.title in pick_titles and not video.selected:
                set_selected(db, issue, video, True)

        gif_ok = 0
        for video in created:
            if not video.selected or not video.local_media_path:
                continue
            src = os.path.join(UPLOAD_DIR, os.path.basename(video.local_media_path))
            out = os.path.join(GIF_DIR, f"item-{video.id}.gif")
            try:
                generate_2x_gif(src, out, orientation=video.orientation)
                video.gif_path = f"gifs/item-{video.id}.gif"
                video.gif_status = "ready"
                video.gif_error = None
                gif_ok += 1
            except FFmpegNotFoundError as exc:
                video.gif_status = "failed"
                video.gif_error = str(exc)
                print(exc)
            db.add(video)
        db.commit()

        data = coverage(db, issue)
        print(f"当期 {data['issue']['vol_label']} {data['issue']['date_label']}")
        print(f"类型覆盖 {data['filled_count']}/{data['required_count']}，入选 {data['selected_count']}/3")
        print(f"已生成 GIF {gif_ok} 条")
        print("ready" if data["ready_for_brief"] else "仍有缺口")
    finally:
        db.close()


if __name__ == "__main__":
    main()
