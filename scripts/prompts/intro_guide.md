# 日更简介写法（背景 · 制作 · 创意构思）

> 给日更例程 / 人工收录共用。每条收录必须写三段，合计 **约 80–150 字**，简体中文。
> **不要纯描述画面**——画面 GIF 已经在卡片上了，简介要回答「这是谁做的、怎么做的、点子是什么」。

## 三段字段

| 字段 | 卡片标签 | 写什么 | 字数 |
| --- | --- | --- | --- |
| `intro_background` | 背景 | 谁做的（作者 / 工作室 / 品牌 / 代理商）；**官方投放还是非官方提案（spec）/ 虚构品牌 / 同人**；语境：参赛（Higgsfield 电影节、OpenArt Ad Awards、AAAIF…）、新品发布、品牌 campaign、系列第几集 | 25–50 |
| `intro_production` | 制作 | 工具 / 模型 / 流程：如 Kling 4.0、Seedance 2.5、Nano Banana 出关键帧、Blender 白模定机位再交 AI、实拍 + AI 合成、ElevenLabs 配音、Suno 配乐、人工剪辑调色。**查不到就写「制作工具未公开」**，可补一句能确认的事实（如「片长 11 分钟、无对白」） | 15–45 |
| `intro_concept` | 创意 | 核心点子与落点：用一句话说清楚「它为什么值得看 / 可借鉴的创意手法」，可带一个最关键的画面作为证据，但不要逐镜头复述 | 25–50 |

`intro_zh` 会由三段自动合成（`【背景】…【制作】…【创意构思】…`），作为旧接口 / 搜索的回退文本；不用手写。

## 事实来源（只写有来源的）

1. 视频标题 + 简介（`yt-dlp -J` 的 `description`，或 B 站 `api.bilibili.com/x/web-interface/view` 的 `desc`）。
2. 作者 / 品牌的帖子、项目页（Higgsfield project 页、Behance、品牌新闻稿、行业媒体报道）。
3. 赛事页面（短名单、获奖名单）。

- 工具、模型、版本号、赛事、官方与否 **必须能在以上来源里找到**；找不到 → 「制作工具未公开」/「未注明是否官方」，不要猜。
- 「非官方 / spec / 虚构品牌 / 同人」要明确写出，避免被误读成品牌官方投放。
- 不写播放量、点赞数、排名等数字。

## 例子

```json
{
  "intro_background": "自由创作者 Maksym Alaybov 的提案片，NORTE 是他为这支片子虚构的越野跑鞋品牌，非真实客户。",
  "intro_production": "Nano Banana（Google Flow）出角色与产品设定图和关键帧，Kling 3.0 生成视频，ElevenLabs 配音、Suno 配乐，剪辑用自写代码管线。",
  "intro_concept": "同一双鞋穿过 3D、黏土、水彩、像素等 20 种画风而造型不变，把「产品一致性」这个 AI 难题本身做成卖点。"
}
```

反例（只描述画面，不合格）：「一双越野跑鞋、一个跑者，画风连换二十种：3D、动漫、黏土、水彩……」

## 例程里的位置

1. 找片 → 2. `yt-dlp -J` 取元信息存档（description 是写「背景 / 制作」的依据）→
3. 切 GIF（`make_gifs.py`，规则见 README）→ 4. 上传 GIF 与原片（`upload_original.py`）→
5. 按本文件写三段简介 → 6. `ingest_day.py --background … --production … --concept … --video-download …` →
7. `build_feed.py` 看 warning（缺段 / 超字数 / 缺原片都会提示）→ 提交。
