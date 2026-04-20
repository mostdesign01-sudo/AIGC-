"""
爬虫API - 多平台支持
"""
from fastapi import APIRouter, BackgroundTasks
from sqlalchemy.orm import Session
import json
from app.db.database import get_db, SessionLocal
from app.models.video import Video
from app.crawlers.bilibili import BilibiliCrawler
from app.crawlers.douyin import DouyinCrawler
from app.crawlers.youtube import YouTubeCrawler
from app.services.qiniu_service import qiniu_service
from app.services.ai_analyzer import ai_analyzer
from datetime import datetime, timezone
from typing import List, Optional

router = APIRouter()

# 爬虫状态
crawler_status = {
    "running": False,
    "last_run": None,
    "videos_collected": 0,
    "current_platform": None,
}

# 支持的平台
SUPPORTED_PLATFORMS = {
    "bilibili": "B站",
    "douyin": "抖音",
    "youtube": "YouTube",
    "all": "全部平台",
}


def run_crawler_task(platforms: List[str] = ["bilibili"]):
    """后台爬虫任务 - 支持多平台"""
    global crawler_status
    crawler_status["running"] = True

    try:
        db = SessionLocal()
        total_collected = 0

        for platform in platforms:
            crawler_status["current_platform"] = platform
            print(f"\n{'='*50}")
            print(f"开始抓取: {SUPPORTED_PLATFORMS.get(platform, platform)}")
            print(f"{'='*50}")

            # 选择爬虫
            if platform == "bilibili":
                crawler = BilibiliCrawler()
                videos = crawler.run(use_keywords=True, enrich=True)
            elif platform == "douyin":
                crawler = DouyinCrawler()
                videos = crawler.run(use_keywords=True, enrich=True)
            elif platform == "youtube":
                crawler = YouTubeCrawler()
                videos = crawler.run(use_keywords=True, enrich=True)
            else:
                print(f"未知平台: {platform}")
                continue

            print(f"[{platform}] 爬取到 {len(videos)} 个视频")

            collected = 0
            for v in videos:
                # 检查是否已存在
                existing = db.query(Video).filter(Video.video_id == str(v["video_id"])).first()
                if existing:
                    print(f"视频已存在: {v['video_id']}")
                    continue

                # 上传封面到七牛云
                qiniu_url = ""
                if v.get("cover_url"):
                    try:
                        print(f"上传封面: {v['title'][:30]}...")
                        qiniu_url = qiniu_service.upload_from_url(v["cover_url"])
                        print(f"上传成功")
                    except Exception as e:
                        print(f"上传封面失败: {e}")

                # AI生成简介
                ai_summary = ""
                try:
                    print(f"生成简介: {v['title'][:30]}...")
                    ai_summary = ai_analyzer.generate_summary(
                        title=v["title"],
                        description=v.get("description", ""),
                        tags=v.get("tags", [])
                    )
                    print(f"简介: {ai_summary}")
                except Exception as e:
                    print(f"生成简介失败: {e}")

                # 保存到数据库
                video = Video(
                    platform=v["platform"],
                    video_id=str(v["video_id"]),
                    title=v["title"],
                    description=v.get("description", ""),
                    url=v["url"],
                    cover_url=v.get("cover_url", ""),
                    qiniu_cover_url=qiniu_url,
                    play_count=v.get("play_count", 0),
                    like_count=v.get("like_count", 0),
                    author=v.get("author", ""),
                    author_id=str(v.get("author_id", "")),
                    tags=json.dumps(v.get("tags", [])),
                    ai_summary=ai_summary,
                    collected_at=datetime.now(timezone.utc)
                )
                db.add(video)
                collected += 1
                print(f"保存成功: {v['title'][:30]}")

            db.commit()
            total_collected += collected
            print(f"[{platform}] 本次收集 {collected} 个视频")

        db.close()

        crawler_status["videos_collected"] = total_collected
        crawler_status["last_run"] = datetime.now(timezone.utc).isoformat()
        print(f"\n总计收集 {total_collected} 个视频")

    except Exception as e:
        print(f"爬虫任务失败: {e}")
        import traceback
        traceback.print_exc()

    finally:
        crawler_status["running"] = False
        crawler_status["current_platform"] = None


@router.get("/status")
def get_crawler_status():
    """获取爬虫状态"""
    return {
        **crawler_status,
        "supported_platforms": SUPPORTED_PLATFORMS,
    }


@router.get("/platforms")
def get_platforms():
    """获取支持的平台列表"""
    return SUPPORTED_PLATFORMS


@router.post("/run")
def run_crawler(
    background_tasks: BackgroundTasks,
    platform: str = "bilibili",
):
    """启动爬虫 - 支持多平台

    参数:
    - platform: 平台名称 (bilibili/douyin/youtube/all)
    """
    if crawler_status["running"]:
        return {"message": "爬虫正在运行中", "status": crawler_status}

    # 解析平台
    if platform == "all":
        platforms = ["bilibili", "youtube"]  # 抖音暂不支持
    elif platform in SUPPORTED_PLATFORMS:
        platforms = [platform]
    else:
        return {"message": f"不支持的平台: {platform}", "supported": list(SUPPORTED_PLATFORMS.keys())}

    background_tasks.add_task(run_crawler_task, platforms)
    return {
        "message": f"爬虫已启动 - {SUPPORTED_PLATFORMS.get(platform, platform)}",
        "platforms": platforms,
        "status": crawler_status
    }


@router.post("/bilibili/run")
def run_bilibili_crawler(background_tasks: BackgroundTasks):
    """手动触发B站爬虫 (兼容旧接口)"""
    return run_crawler(background_tasks, "bilibili")
