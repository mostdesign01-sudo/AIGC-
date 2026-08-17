"""
配置管理
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

# 获取项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


class Settings(BaseSettings):
    # 七牛云
    qiniu_access_key: str = ""
    qiniu_secret_key: str = ""
    qiniu_bucket_name: str = "aigc-creative"
    qiniu_domain: str = ""
    
    # DashScope AI
    dashscope_api_key: str = ""

    # YouTube
    youtube_api_key: str = ""

    # 飞书
    feishu_app_id: str = ""
    feishu_app_secret: str = ""
    
    # 数据库
    database_url: str = "sqlite:///./data/videos.db"

    # 双周刊锚点：VOL.09 刊发日 2026-08-03，每期 14 天
    issue_anchor_vol: int = 9
    issue_anchor_end: str = "2026-08-03"
    issue_span_days: int = 14

    # ffmpeg（可选，默认走 PATH）
    ffmpeg_path: str = ""
    ffprobe_path: str = ""
    
    # 抓取配置
    min_play_count: int = 100000
    min_like_count: int = 5000
    crawler_keywords: str = "AI动画,AIGC视频,Runway,Pika,Seedance,Zephyr,虚拟人,数字人,Gen-3,AI短片,Sora,Stable Video"
    
    class Config:
        env_file = os.path.join(BASE_DIR, "backend", ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()