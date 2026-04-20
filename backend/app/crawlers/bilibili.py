"""
B站热门视频爬虫 - AI创意视频专用
"""
import requests
import json
from typing import List, Dict, Optional
from app.core.config import get_settings
import time

settings = get_settings()

# AI创意视频关键词
KEYWORDS = [
    "HappyOyster",
    "Runway Gen-3",
    "Pika",
    "Sora",
    "Seedance",
    "可灵AI",
    "即梦AI",
    "AI动画",
    "AI短片",
    "虚拟人",
    "数字人",
    "AI视频生成",
    "ComfyUI",
    "AI特效",
    "AIGC动画",
    "Wan2.1",
]


class BilibiliCrawler:
    """B站爬虫 - 搜索AI创意视频"""

    def __init__(self):
        self.keywords = KEYWORDS
        self.min_play_count = 10000
        self.min_like_count = 500

    def _get_headers(self):
        """获取请求头 - 模拟浏览器"""
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.bilibili.com",
            "Accept": "application/json, text/plain, */*",
        }

    def get_video_detail(self, bvid: str) -> Optional[Dict]:
        """获取视频详情（包括简介）"""
        url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
        try:
            resp = requests.get(url, headers=self._get_headers(), timeout=10)
            data = resp.json()

            if data.get("code") != 0:
                return None

            v = data["data"]
            # 获取标签
            tags = [t["tag_name"] for t in v.get("tag", [])][:5]

            return {
                "description": v.get("desc", ""),
                "tags": tags,
                "duration": v.get("duration", 0),
                "tname": v.get("tname", ""),
            }
        except Exception as e:
            print(f"获取视频详情失败 {bvid}: {e}")
            return None

    def search_videos(self, keyword: str, page: int = 1) -> List[Dict]:
        """搜索视频"""
        url = "https://api.bilibili.com/x/web-interface/search/type"
        params = {
            "keyword": keyword,
            "search_type": "video",
            "page": page,
            "ps": 20,
        }

        try:
            resp = requests.get(url, params=params, headers=self._get_headers(), timeout=15)
            data = resp.json()

            if data.get("code") != 0:
                print(f"搜索 '{keyword}' 失败: {data.get('message')}")
                return []

            videos = []
            results = data.get("data", {}).get("result", [])

            for item in results:
                # 转换封面URL为HTTPS
                cover = item.get("pic", "")
                if cover and cover.startswith("http://"):
                    cover = "https://" + cover[7:]

                bvid = item.get("bvid", "")

                video = {
                    "platform": "bilibili",
                    "video_id": item.get("aid", 0),
                    "bvid": bvid,
                    "title": item.get("title", "").replace("<em class=\"keyword\">", "").replace("</em>", ""),
                    "url": f"https://www.bilibili.com/video/{bvid}",
                    "cover_url": cover,
                    "play_count": item.get("play", 0),
                    "like_count": item.get("like", 0),
                    "author": item.get("author", ""),
                    "author_id": item.get("mid", 0),
                    "description": "",  # 搜索结果没有简介，后面获取
                    "tags": [],
                }

                # 筛选条件
                if video["play_count"] >= self.min_play_count or video["like_count"] >= self.min_like_count:
                    videos.append(video)

            return videos

        except Exception as e:
            print(f"搜索 '{keyword}' 异常: {e}")
            return []

    def get_ranking_videos(self, rid: int = 36) -> List[Dict]:
        """获取科技区排行榜"""
        url = "https://api.bilibili.com/x/web-interface/ranking/v2"
        params = {"rid": rid, "type": "all"}

        try:
            resp = requests.get(url, params=params, headers=self._get_headers(), timeout=15)
            data = resp.json()

            if data.get("code") != 0:
                return []

            videos = []
            for item in data.get("data", {}).get("list", [])[:30]:
                cover = item.get("pic", "")
                if cover and cover.startswith("http://"):
                    cover = "https://" + cover[7:]

                bvid = item.get("bvid", "")

                video = {
                    "platform": "bilibili",
                    "video_id": item.get("aid", 0),
                    "bvid": bvid,
                    "title": item.get("title", ""),
                    "url": f"https://www.bilibili.com/video/{bvid}",
                    "cover_url": cover,
                    "play_count": item.get("stat", {}).get("view", 0),
                    "like_count": item.get("stat", {}).get("like", 0),
                    "author": item.get("owner", {}).get("name", ""),
                    "author_id": item.get("owner", {}).get("mid", 0),
                    "description": "",
                    "tags": [],
                }

                # 检查是否AI相关
                title = video["title"].lower()
                if any(kw.lower() in title for kw in self.keywords):
                    videos.append(video)

            return videos

        except Exception as e:
            print(f"获取排行榜异常: {e}")
            return []

    def enrich_video_details(self, videos: List[Dict]) -> List[Dict]:
        """补充视频详情（简介、标签）"""
        enriched = []
        for i, v in enumerate(videos):
            bvid = v.get("bvid", "")
            if bvid:
                print(f"  获取详情 ({i+1}/{len(videos)}): {v['title'][:30]}...")
                detail = self.get_video_detail(bvid)
                if detail:
                    v["description"] = detail.get("description", "")
                    v["tags"] = detail.get("tags", [])
                time.sleep(0.3)  # 避免请求过快
            enriched.append(v)
        return enriched

    def run(self, use_keywords: bool = True, enrich: bool = True) -> List[Dict]:
        """执行爬取"""
        all_videos = []

        # 搜索关键词
        if use_keywords:
            for keyword in self.keywords[:8]:
                print(f"搜索: {keyword}")
                videos = self.search_videos(keyword)
                print(f"  找到 {len(videos)} 个视频")
                all_videos.extend(videos)

        # 获取科技区排行榜中AI相关视频
        print("获取科技区排行榜...")
        ranking = self.get_ranking_videos()
        all_videos.extend(ranking)

        # 去重
        seen = set()
        unique_videos = []
        for v in all_videos:
            vid = v.get("video_id") or v.get("bvid")
            if vid and vid not in seen:
                seen.add(vid)
                unique_videos.append(v)

        print(f"共获取 {len(unique_videos)} 个不重复视频")

        # 补充视频详情
        if enrich and unique_videos:
            print("补充视频详情...")
            unique_videos = self.enrich_video_details(unique_videos)

        return unique_videos


# 全局实例
bilibili_crawler = BilibiliCrawler()
