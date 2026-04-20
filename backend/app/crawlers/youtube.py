"""
YouTube热门视频爬虫 - AI创意视频专用
使用YouTube Data API v3
"""
import requests
from typing import List, Dict, Optional
from app.crawlers.base import BaseCrawler
from app.core.config import get_settings

settings = get_settings()


class YouTubeCrawler(BaseCrawler):
    """YouTube爬虫 - 搜索AI创意视频"""

    platform = "youtube"

    # AI创意视频关键词（英文）
    keywords = [
        "AI animation",
        "Runway Gen-3",
        "Pika AI",
        "Sora AI",
        "AI video generation",
        "AI art",
        "ComfyUI tutorial",
        "Stable Diffusion",
        "Midjourney AI",
        "AI filmmaking",
        "AI music video",
        "Generative AI art",
    ]

    def __init__(self, api_key: str = None):
        self.api_key = api_key or getattr(settings, 'youtube_api_key', None)
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.min_play_count = 50000  # 5万播放量
        self.min_like_count = 2000

    def _get_headers(self):
        """获取请求头"""
        return {
            "Accept": "application/json",
        }

    def search_videos(self, keyword: str, page: int = 1) -> List[Dict]:
        """搜索视频"""
        if not self.api_key:
            print("[YouTube] 未配置API Key，跳过搜索")
            return self._mock_search(keyword)

        url = f"{self.base_url}/search"
        params = {
            "part": "snippet",
            "q": keyword,
            "type": "video",
            "maxResults": 20,
            "order": "viewCount",  # 按播放量排序
            "key": self.api_key,
        }

        if page > 1:
            params["pageToken"] = self._get_page_token(page)

        try:
            resp = requests.get(url, params=params, headers=self._get_headers(), timeout=15)
            data = resp.json()

            if "error" in data:
                print(f"YouTube搜索失败: {data['error'].get('message', 'Unknown error')}")
                return []

            videos = []
            for item in data.get("items", []):
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]

                video = {
                    "video_id": video_id,
                    "title": snippet.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "cover_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                    "play_count": 0,  # 需要单独获取
                    "like_count": 0,
                    "author": snippet.get("channelTitle", ""),
                    "author_id": snippet.get("channelId", ""),
                    "description": snippet.get("description", ""),
                    "tags": [],
                    "published_at": snippet.get("publishedAt", ""),
                }
                videos.append(video)

            # 批量获取视频统计信息
            if videos:
                self._enrich_statistics(videos)

            # 过滤
            return [self._normalize_video(v) for v in videos if self._filter_video(v)]

        except Exception as e:
            print(f"YouTube搜索异常: {e}")
            return []

    def _get_page_token(self, page: int) -> str:
        """获取分页Token - 简化实现"""
        return ""

    def _enrich_statistics(self, videos: List[Dict]) -> None:
        """批量获取视频统计信息"""
        if not self.api_key or not videos:
            return

        video_ids = [v["video_id"] for v in videos]
        url = f"{self.base_url}/videos"
        params = {
            "part": "statistics,contentDetails",
            "id": ",".join(video_ids[:50]),  # YouTube限制最多50个
            "key": self.api_key,
        }

        try:
            resp = requests.get(url, params=params, timeout=15)
            data = resp.json()

            stats_map = {}
            for item in data.get("items", []):
                vid = item["id"]
                stats = item.get("statistics", {})
                content = item.get("contentDetails", {})

                stats_map[vid] = {
                    "play_count": int(stats.get("viewCount", 0)),
                    "like_count": int(stats.get("likeCount", 0)),
                    "duration": self._parse_duration(content.get("duration", "PT0S")),
                }

            # 更新视频统计信息
            for video in videos:
                vid = video["video_id"]
                if vid in stats_map:
                    video["play_count"] = stats_map[vid]["play_count"]
                    video["like_count"] = stats_map[vid]["like_count"]
                    video["duration"] = stats_map[vid]["duration"]

        except Exception as e:
            print(f"获取YouTube统计信息失败: {e}")

    def _parse_duration(self, duration: str) -> int:
        """解析ISO 8601时长格式 (PT15M33S) 为秒数"""
        import re
        match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
        if not match:
            return 0
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        return hours * 3600 + minutes * 60 + seconds

    def get_video_detail(self, video_id: str) -> Optional[Dict]:
        """获取视频详情"""
        if not self.api_key:
            return None

        url = f"{self.base_url}/videos"
        params = {
            "part": "snippet,statistics,contentDetails",
            "id": video_id,
            "key": self.api_key,
        }

        try:
            resp = requests.get(url, params=params, timeout=15)
            data = resp.json()

            if not data.get("items"):
                return None

            item = data["items"][0]
            snippet = item["snippet"]
            stats = item["statistics"]

            return {
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
                "tags": snippet.get("tags", [])[:10],
                "play_count": int(stats.get("viewCount", 0)),
                "like_count": int(stats.get("likeCount", 0)),
            }

        except Exception as e:
            print(f"获取YouTube视频详情失败: {e}")
            return None

    def get_trending_videos(self, region_code: str = "US") -> List[Dict]:
        """获取热门视频"""
        if not self.api_key:
            return []

        url = f"{self.base_url}/videos"
        params = {
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": region_code,
            "videoCategoryId": "28",  # Science & Technology
            "maxResults": 20,
            "key": self.api_key,
        }

        try:
            resp = requests.get(url, params=params, timeout=15)
            data = resp.json()

            videos = []
            for item in data.get("items", []):
                snippet = item["snippet"]
                stats = item["statistics"]
                video_id = item["id"]

                # 检查是否AI相关
                title = snippet.get("title", "").lower()
                desc = snippet.get("description", "").lower()
                if not any(kw.lower() in title or kw.lower() in desc for kw in self.keywords):
                    continue

                video = {
                    "video_id": video_id,
                    "title": snippet.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "cover_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                    "play_count": int(stats.get("viewCount", 0)),
                    "like_count": int(stats.get("likeCount", 0)),
                    "author": snippet.get("channelTitle", ""),
                    "author_id": snippet.get("channelId", ""),
                    "description": snippet.get("description", ""),
                    "tags": snippet.get("tags", [])[:5],
                }

                videos.append(self._normalize_video(video))

            return videos

        except Exception as e:
            print(f"获取YouTube热门视频失败: {e}")
            return []

    def _mock_search(self, keyword: str) -> List[Dict]:
        """模拟搜索 - 当API不可用时返回提示"""
        print(f"[YouTube] 未配置API Key，无法搜索: {keyword}")
        print("[YouTube] 请在 .env 中配置 YOUTUBE_API_KEY")
        print("[YouTube] 获取API Key: https://console.cloud.google.com/apis/credentials")
        return []

    def run(self, use_keywords: bool = True, enrich: bool = True) -> List[Dict]:
        """执行爬取"""
        if not self.api_key:
            print("[YouTube] ⚠️ 未配置 YouTube API Key")
            print("[YouTube] 请在 .env 中添加: YOUTUBE_API_KEY=your_api_key")
            print("[YouTube] 获取API Key: https://console.cloud.google.com/apis/credentials")
            print("[YouTube] 需要启用 YouTube Data API v3")
            return []

        return super().run(use_keywords, enrich)


# 全局实例
youtube_crawler = YouTubeCrawler()
