"""
AI分析服务 - 使用 DashScope API (requests直调)
"""
from app.core.config import get_settings
import requests
import json

settings = get_settings()


class AIAnalyzer:
    def __init__(self):
        self.api_key = settings.dashscope_api_key
        self.api_url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

    def generate_summary(self, title: str, description: str = "", tags: list = None) -> str:
        """根据标题、简介生成吸引人的视频简介（50字以内）"""
        if not self.api_key:
            return self._fallback_summary(title, description)

        tags_str = "、".join(tags) if tags else ""

        prompt = f"""你是一个短视频内容编辑，请根据以下信息生成一段吸引人的视频简介（30-50字）：

标题：{title}
简介：{description[:200] if description else "无"}
标签：{tags_str}

要求：
1. 突出视频亮点和价值
2. 语言简洁有趣，吸引点击
3. 不要重复标题
4. 直接输出简介内容

简介："""

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "qwen-turbo",
                "input": {
                    "messages": [
                        {"role": "system", "content": "你是一个短视频内容编辑，擅长生成吸引人的视频简介。"},
                        {"role": "user", "content": prompt}
                    ]
                }
            }

            resp = requests.post(self.api_url, headers=headers, json=payload, timeout=15)
            data = resp.json()

            if "output" in data and "text" in data["output"]:
                result = data["output"]["text"].strip()
                if len(result) > 55:
                    result = result[:50] + "..."
                return result

            return self._fallback_summary(title, description)

        except Exception as e:
            print(f"AI生成简介失败: {e}")
            return self._fallback_summary(title, description)

    def _fallback_summary(self, title: str, description: str) -> str:
        """降级方案"""
        if description and len(description) > 10:
            desc = description.replace("\n", " ").strip()
            prefixes = ["视频简介：", "简介：", "内容："]
            for p in prefixes:
                if desc.startswith(p):
                    desc = desc[len(p):]
            if len(desc) > 50:
                return desc[:47] + "..."
            return desc

        if "教程" in title:
            return "详细教程，手把手教你掌握核心技巧"
        elif "对比" in title or "vs" in title.lower():
            return "多款工具对比测评，帮你选最适合的"
        elif "最新" in title or "发布" in title:
            return "最新动态，了解前沿AI技术发展"
        elif "教程" not in title:
            return "精彩AI创意内容，不容错过"
        return title[:50]


ai_analyzer = AIAnalyzer()
