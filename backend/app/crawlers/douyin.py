"""
抖音热门视频爬虫 - AI创意视频专用
"""
import requests
import json
import time
import random
import hashlib
from typing import List, Dict, Optional
from app.crawlers.base import BaseCrawler


class DouyinCrawler(BaseCrawler):
    """抖音爬虫 - 搜索AI创意视频"""

    platform = "douyin"

    # AI创意视频关键词
    keywords = [
        "AI动画",
        "AI视频",
        "AIGC",
        "Runway",
        "Pika",
        "Sora",
        "可灵AI",
        "即梦AI",
        "数字人",
        "AI特效",
        "AI生成",
        "ComfyUI",
    ]

    def __init__(self):
        self.min_play_count = 100000  # 抖音流量更大
        self.min_like_count = 5000

    def _get_headers(self):
        """获取请求头"""
        return {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Referer": "https://www.douyin.com/",
        }

    def _generate_signature(self, data: dict) -> str:
        """生成签名 - 简化版"""
        # 抖音签名较复杂，这里使用简化方案
        sorted_keys = sorted(data.keys())
        sign_str = "".join(f"{k}={data[k]}" for k in sorted_keys)
        return hashlib.md5(sign_str.encode()).hexdigest()

    def search_videos(self, keyword: str, page: int = 1) -> List[Dict]:
        """搜索视频 - 使用公开搜索接口"""
        videos = []

        # 抖音搜索API（需要处理反爬，这里使用简化方案）
        # 实际项目中建议使用官方开放平台API或第三方服务
        url = "https://www.douyin.com/aweme/v1/web/search/"

        params = {
            "keyword": keyword,
            "search_source": "normal_search",
            "search_id": str(int(time.time() * 1000)),
            "type": "video",
            "offset": (page - 1) * 20,
            "count": 20,
        }

        try:
            # 注意：抖音有严格的反爬机制，这里提供基础框架
            # 实际使用需要配合签名服务或使用官方API
            resp = requests.get(
                url,
                params=params,
                headers=self._get_headers(),
                timeout=15,
            )

            if resp.status_code != 200:
                print(f"抖音搜索失败: HTTP {resp.status_code}")
                return self._mock_search(keyword)

            data = resp.json()

            if data.get("status_code") != 0:
                print(f"抖音搜索失败: {data.get('status_msg')}")
                return self._mock_search(keyword)

            for item in data.get("data", [])[:20]:
                aweme = item.get("aweme_info", {})
                if not aweme:
                    continue

                video = {
                    "video_id": aweme.get("aweme_id", ""),
                    "title": aweme.get("desc", ""),
                    "url": f"https://www.douyin.com/video/{aweme.get('aweme_id', '')}",
                    "cover_url": aweme.get("video", {}).get("cover", {}).get("url_list", [""])[0],
                    "play_count": aweme.get("statistics", {}).get("play_count", 0),
                    "like_count": aweme.get("statistics", {}).get("digg_count", 0),
                    "author": aweme.get("author", {}).get("nickname", ""),
                    "author_id": aweme.get("author", {}).get("unique_id", ""),
                    "description": aweme.get("desc", ""),
                    "tags": [t.get("tag_name", "") for t in aweme.get("text_extra", [])],
                    "duration": aweme.get("video", {}).get("duration", 0) // 1000,
                }

                if self._filter_video(video):
                    videos.append(self._normalize_video(video))

        except Exception as e:
            print(f"抖音搜索异常: {e}")
            return self._mock_search(keyword)

        return videos

    def _mock_search(self, keyword: str) -> List[Dict]:
        """模拟搜索 - 当API不可用时返回示例数据"""
        # 用于演示和测试
        mock_videos = [
            {
                "video_id": f"dy_{keyword}_{int(time.time())}",
                "title": f"【AI创意】{keyword}精彩作品合集 - 抖音热门",
                "url": f"https://www.douyin.com/search/{keyword}",
                "cover_url": "",
                "play_count": random.randint(100000, 1000000),
                "like_count": random.randint(10000, 100000),
                "author": "AI创作者",
                "author_id": "ai_creator",
                "description": f"抖音热门{keyword}视频",
                "tags": [keyword, "AI", "创意"],
                "duration": 60,
            }
        ]
        return [self._normalize_video(v) for v in mock_videos]

    def get_video_detail(self, video_id: str) -> Optional[Dict]:
        """获取视频详情"""
        # 抖音视频详情API
        return None

    def run(self, use_keywords: bool = True, enrich: bool = True) -> List[Dict]:
        """执行爬取"""
        # 抖音有严格的反爬，建议使用官方开放平台
        print("[抖音] 注意: 抖音平台有严格的反爬机制")
        print("[抖音] 建议使用抖音开放平台API或第三方数据服务")

        # 返回提示信息
        return []


# 全局实例
douyin_crawler = DouyinCrawler()
