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

    # 创意站内容库（文件型）。默认仓库根目录 content/；部署时可指向持久盘。
    content_dir: str = os.path.join(BASE_DIR, "content")
    # 编译产物；留空则不落盘（仅通过接口 /creative/feed 输出）。
    feed_path: str = os.path.join(BASE_DIR, "frontend", "src", "data", "feed.json")
    # 写接口（ingest / TOP3 / labels）需要在请求头 X-Admin-Token 带上这个值；为空则写接口全部关闭。
    admin_token: str = ""
    # ffmpeg 可执行文件（可选，脚本 make_gifs.py 使用）
    ffmpeg_path: str = ""
    
    # 抓取配置
    min_play_count: int = 100000
    min_like_count: int = 5000
    crawler_keywords: str = "AI动画,AIGC视频,Runway,Pika,Seedance,Zephyr,虚拟人,数字人,Gen-3,AI短片,Sora,Stable Video"
    
    class Config:
        env_file = os.path.join(BASE_DIR, "backend", ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()