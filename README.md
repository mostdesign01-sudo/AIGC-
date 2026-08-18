# AIGC创意双周报 · 工作台

把原来的 AI 创意视频收集站，收成一份能出「AIGC 创意双周报 · 创意灵感」的编辑工作台。

仍然是 **FastAPI + SQLite + Vue**。B站 / YouTube / 抖音抓取接口都还在；在此之上加了期号、9 类覆盖、手传/外链、入选 3 条、2 倍速 GIF、出报预览。

## 和旧「双周最佳」的关系

| | 双周最佳（旧） | 当期工作台（新） |
|---|---|---|
| 窗口 | 滚动过去 14 天 | 锚定双周刊 VOL，当前默认 VOL.10（2026.08.03–2026.08.17） |
| 规则 | 按播放量取 12 条 | 先铺满可配置的 9 类，再人工抽最多 3 条进简报 |
| 用途 | 发现高热 | 出报：封面/GIF、标题、介绍 |

抓到的视频会挂到**当期**，出现在工作台「未分类」里，你可以再分类型、改介绍、决定是否入选。热度榜还在「双周最佳」页，不自动等于入选。

期号算法可改，不必改代码：环境变量 `ISSUE_ANCHOR_VOL`（默认 9）、`ISSUE_ANCHOR_END`（默认 `2026-08-03`）、`ISSUE_SPAN_DAYS`（默认 14）。上一期 VOL.09 刊发日是 2026.08.03，所以 2026-08-17 会落到 VOL.10。

## 依赖

- Python 3.12、Node.js 20+
- **ffmpeg**（出 2x GIF / 抽帧拆解必需）
  - macOS: `brew install ffmpeg`
  - Debian/Ubuntu: `sudo apt-get install -y ffmpeg`
  - 也可设 `FFMPEG_PATH` 指向可执行文件
  - 未安装时，生成 GIF 的接口会返回清楚的 503 说明，不会闷声失败
- **yt-dlp**（外链下载成片，已写入 `requirements.txt`）
  - B 站若 403：从浏览器导出 cookies.txt，设环境变量 `YTDLP_COOKIES_FILE`

## 启动

```bash
# 后端（前端代理指向 8001）
cd backend
pip install -r requirements.txt
PORT=8001 python run.py
# API: http://127.0.0.1:8001/docs

# 另开终端：前端
cd frontend
npm install
npm run dev
# http://127.0.0.1:5174
```

生产环境可设 `VITE_API_BASE`；本地默认走 Vite 代理 `/api`、`/media` → `8001`。

不要把 `.env`、本地 `*.db`、上传文件和 GIF 提交进仓库。

## 当期怎么建

1. 打开工作台，会自动 `POST /api/v1/issues/current`：按今天算出 VOL，没有就建一期。
2. 也可以 `POST /api/v1/issues` 带 `vol_number` 建指定期。
3. 默认 9 类来自 `backend/app/data/default_categories.json`，工作台「管理类型」可改/停用/新增，接口在 `/api/v1/categories`。
4. 收录方式：
   - 旧抓取：`POST /api/v1/crawlers/run?platform=bilibili`（youtube/douyin/all 仍可用）
   - 粘贴外链：工具/模型也可以，链接 + 封面 + 标题 + 介绍；视频类可勾选 yt-dlp 下载成片
   - 手动上传视频或图
5. 每类至少 1 条后，在当期里最多勾 3 条「入选简报」。类型没铺满或没抽满 3，顶栏缺口会一直亮着。
6. 已有原链但没有本地成片的，点「下载成片」。有本地视频后再出 2x GIF 或「拆解实现」。
7. 「拆解实现」会写成「怎么做 / 创意点 / 能用在哪」：有成片则抽帧走视觉模型，否则用标题简介；没 Key 走规则降级。结果进 AI 摘要，介绍为空时一并填上（仍可手改）。
8. 「出报预览」按 VOL.09 编辑向版式：期号/日期/综述/缩略图 + 3 张竖版卡片。导出 JSON / Markdown / zip 给设计文案。

本地灌一套能走通的示例（9 类各 1 条，抽 3，带视频的出 GIF）：

```bash
cd backend
python scripts/seed_issue_demo.py
```

## GIF 怎么出

- 接口：`POST /api/v1/videos/{id}/gif`，下载 `GET /api/v1/videos/{id}/gif`
- 只处理本地成片：手动上传，或外链点「下载成片」（`POST /api/v1/videos/{id}/fetch-media`）
- 拆解：`POST /api/v1/videos/{id}/deconstruct?overwrite_intro=false`
- ffmpeg：片源最多约 6 秒，`setpts=0.5*PTS` 变成 2 倍速，竖版宽 360 / 横版宽 480，10fps，调色板限制颜色；超过约 2.5MB 会自动再收一档参数

## 测试

```bash
cd backend
pytest -q
```

覆盖：当期窗口、9 类种子、选 3 拒第 4、上传后出 GIF、拆解降级、外链成片挂载。

## 主要 API

- `GET/POST /api/v1/issues/current` 当期（含 9 类槽和入选缺口）
- `PATCH /api/v1/issues/{id}` 综述
- `GET /api/v1/issues/{id}/preview` 出报数据
- `GET /api/v1/issues/{id}/export?format=json|markdown|zip`
- `POST /api/v1/videos/from-link` `POST /api/v1/videos/upload`
- `POST /api/v1/videos/{id}/fetch-media` 外链下载成片
- `POST /api/v1/videos/{id}/deconstruct` 拆解怎么做 / 创意点 / 能用在哪
- `POST /api/v1/issues/{id}/items/{video_id}/select`
- `GET /api/v1/videos/best` 旧热度榜
- 爬虫原路径未拆：`/api/v1/crawlers/*`

## 原 Phase 能力

七牛封面、DashScope 摘要、飞书（规划中）仍按原配置工作。抓取结果会多写 `issue_id`、`duration_seconds`，介绍位留给编辑手改，AI 摘要单独保留。
