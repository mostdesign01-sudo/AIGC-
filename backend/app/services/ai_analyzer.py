"""
AI分析服务 - 使用 DashScope API (requests直调)
"""
from app.core.config import get_settings
import os
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

    def deconstruct(
        self,
        title: str,
        description: str = "",
        category: str = "",
        frames: list = None,
    ) -> dict:
        """拆成怎么做 / 创意点 / 能用在哪。有帧走 VL，否则走文本。"""
        from app.services.deconstruct_service import fallback_deconstruct, parse_deconstruct_json

        frames = frames or []
        if not self.api_key:
            return fallback_deconstruct(title, description, category)

        prompt = f"""你是 AIGC 创意编辑，要给双周报「创意灵感」写拆解。根据标题、简介和可选画面，用 JSON 输出（不要其它文字）：
{{"how":"怎么做的（模型/流程，1句）","idea":"创意点（1句）","use":"能用在哪（1句）","brief":"给简报用的一段话，讲清怎么做/创意点/能用在哪"}}

标题：{title}
类型：{category or "未分类"}
简介：{(description or "")[:400] or "无"}
"""
        try:
            if frames:
                raw = self._call_vl(prompt, frames[:3])
            else:
                raw = self._call_text(prompt)
            parsed = parse_deconstruct_json(raw or "")
            if parsed:
                parsed["source"] = "vl" if frames else "text"
                return parsed
        except Exception as exc:
            print(f"拆解失败，走降级：{exc}")
        result = fallback_deconstruct(title, description, category)
        result["source"] = "fallback"
        return result

    def _call_text(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "qwen-turbo",
            "input": {
                "messages": [
                    {"role": "system", "content": "你只输出 JSON。"},
                    {"role": "user", "content": prompt},
                ]
            },
        }
        resp = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
        data = resp.json()
        if "output" in data and "text" in data["output"]:
            return data["output"]["text"].strip()
        return ""

    def _call_vl(self, prompt: str, frame_paths: list) -> str:
        import base64

        content = []
        for path in frame_paths:
            if not os.path.isfile(path):
                continue
            with open(path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
            content.append({"image": f"data:image/jpeg;base64,{b64}"})
        content.append({"text": prompt})
        if len(content) == 1:
            return self._call_text(prompt)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "qwen-vl-plus",
            "input": {
                "messages": [{"role": "user", "content": content}],
            },
        }
        url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        data = resp.json()
        output = data.get("output") or {}
        choices = output.get("choices") or []
        if choices:
            msg = (choices[0].get("message") or {}).get("content")
            if isinstance(msg, list):
                texts = [x.get("text", "") for x in msg if isinstance(x, dict)]
                return "".join(texts).strip()
            if isinstance(msg, str):
                return msg.strip()
        if "text" in output:
            return str(output["text"]).strip()
        return ""

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
