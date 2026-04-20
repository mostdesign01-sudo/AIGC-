"""
爬虫基类 - 多平台视频爬虫抽象
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime, timezone


class BaseCrawler(ABC):
    """爬虫基类"""

    platform: str = "unknown"
    min_play_count: int = 10000
    min_like_count: int = 500
    keywords: List[str] = []

    @abstractmethod
    def search_videos(self, keyword: str, page: int = 1) -> List[Dict]:
        """搜索视频 - 子类实现"""
        pass

    @abstractmethod
    def get_video_detail(self, video_id: str) -> Optional[Dict]:
        """获取视频详情 - 子类实现"""
        pass

    def _filter_video(self, video: Dict) -> bool:
        """过滤视频 - 基于播放量和点赞数"""
        play_count = video.get("play_count", 0)
        like_count = video.get("like_count", 0)
        return play_count >= self.min_play_count or like_count >= self.min_like_count

    def _normalize_video(self, video: Dict) -> Dict:
        """标准化视频数据结构"""
        return {
            "platform": self.platform,
            "video_id": str(video.get("video_id", "")),
            "title": video.get("title", ""),
            "url": video.get("url", ""),
            "cover_url": video.get("cover_url", ""),
            "play_count": video.get("play_count", 0),
            "like_count": video.get("like_count", 0),
            "author": video.get("author", ""),
            "author_id": str(video.get("author_id", "")),
            "description": video.get("description", ""),
            "tags": video.get("tags", []),
            "duration": video.get("duration", 0),
            "collected_at": datetime.now(timezone.utc).isoformat(),
        }

    def enrich_video_details(self, videos: List[Dict]) -> List[Dict]:
        """补充视频详情 - 子类可重写"""
        return videos

    def run(self, use_keywords: bool = True, enrich: bool = True) -> List[Dict]:
        """执行爬取 - 通用流程"""
        import time

        all_videos = []

        # 搜索关键词
        if use_keywords and self.keywords:
            for keyword in self.keywords:
                print(f"[{self.platform}] 搜索: {keyword}")
                videos = self.search_videos(keyword)
                print(f"  找到 {len(videos)} 个视频")
                all_videos.extend(videos)
                time.sleep(1)  # 避免请求过快

        # 去重
        seen = set()
        unique_videos = []
        for v in all_videos:
            vid = v.get("video_id")
            if vid and vid not in seen:
                seen.add(vid)
                unique_videos.append(v)

        print(f"[{self.platform}] 共获取 {len(unique_videos)} 个不重复视频")

        # 补充视频详情
        if enrich and unique_videos:
            print(f"[{self.platform}] 补充视频详情...")
            unique_videos = self.enrich_video_details(unique_videos)

        return unique_videos
