# 得物 AIGC 创意站

每日收集行业前沿的 AI 创意视频（广告、时尚换装、短片、工具演示……只收成片，不收教程），
每条配 **2× 速度的关键 GIF（可下载）**、**可下载的原片 mp4** 和 **背景 / 制作 / 创意构思三段中文解读**；每周从收录里钉出 **TOP3**（最热 / 最影响力 / 最有创意）。

线上：https://aigc-phi.vercel.app

- 首页：本周 TOP3 + 最近几天的每日收录（可按 9 个分类 / 横竖版筛选）
- `/days`、`/day/2026-09-17`：按日期归档
- `/weeks`、`/week/2026-W38`：周榜归档，往期都保留
- `/video/<id>`：单条详情（GIF、三段简介、GIF / 原片下载、来源链接、备注）
- 每张卡片：简介按「背景 · 制作 · 创意」三段带标签展示；底部有「GIF 上段 / GIF 下段 / 下载原片」按钮（直链 GitHub Release 资产，点了就是下载）

> 站点不展示、也不编造播放量/点赞数。排序分（`heat_score` 等）只做内部参考，可选填。

---

## 目录结构

```
content/                      ← 唯一的数据源（JSON，进 git）
  labels.json                 ← 三个周榜槽位的文案（可改）
  videos/YYYY-MM-DD.json      ← 当天收录（Asia/Shanghai 日期），一个数组
  weeks/YYYY-Www.json         ← 该 ISO 周的 TOP3 选择
scripts/
  ingest_day.py               ← 每日收录（单条 / 批量 / 自动补元信息 / 可直接 POST 到后端）
  pick_week_top3.py           ← 选周榜、看候选、改槽位文案
  make_gifs.py                ← ffmpeg 切 2× GIF（横版 2 张 720×406，竖版 1 张 360×640）
  upload_original.py          ← 原片下载（yt-dlp）→ 上传 daily-<日期> Release（<slug>.mp4）→ 回写 video_download_url
  prompts/intro_guide.md      ← 简介写法：背景 / 制作 / 创意构思（例程必读）
  build_feed.py               ← 把 content/ 编译成 frontend/src/data/feed.json
Makefile                      ← ingest_day / pick_week_top3 / gifs / build_feed 等目标
frontend/                     ← Vue 3 + Vite + vue-router，静态部署到 Vercel
  src/data/feed.json          ← 构建产物（进 git，Vercel 直接打包，不依赖后端）
backend/                      ← FastAPI（可选）
  app/services/content_store.py   ← 纯标准库的内容库逻辑，脚本与 API 共用
  app/api/v1/creative.py          ← /api/v1/creative/* 读写接口
```

数据流：`content/*.json` →（`build_feed.py`）→ `frontend/src/data/feed.json` → Vercel 构建。
后端不是必需的：前端默认只用打包进去的 `feed.json`；配置了 `VITE_API_BASE` 才会去接口拉实时数据覆盖。

---

## 本地运行

```bash
# 前端（http://localhost:5174）
cd frontend && npm install && npm run dev

# 后端（可选，http://localhost:8001/docs）
cd backend && pip install -r requirements.txt
cp .env.example .env            # 至少填 ADMIN_TOKEN 才能用写接口
PORT=8001 python run.py
```

前端要连本地后端时，在 `frontend/.env.local` 写 `VITE_API_BASE=http://localhost:8001`。

---

## 每日工作流（Hao 或 agent 例程）

1. **找片**：YouTube / Bilibili / X / 品牌官网，只要成片（广告、换装、短片、可视化的工具 demo），不要教程。
2. **切 GIF**（有 ffmpeg 时）：

   ```bash
   python scripts/make_gifs.py clip.mp4 --slug motorola-100ai --out-dir dist/gifs
   # 横版 → dist/gifs/motorola-100ai-a.gif, motorola-100ai-b.gif
   # 竖版 → dist/gifs/<slug>.gif（--orientation auto 会按宽高自动判定）
   ```

3. **上传 GIF** 到当天的 GitHub Release `daily-YYYY-MM-DD`，拿到 URL，例如
   `https://github.com/mostdesign01-sudo/AIGC-/releases/download/daily-2026-10-08/norte-one-shoe-20-styles-a.gif`。
4. **写简介**：按 [`scripts/prompts/intro_guide.md`](scripts/prompts/intro_guide.md) 写三段——
   **背景**（谁做的、官方还是提案 / 虚构品牌 / 同人、赛事或发布语境）、
   **制作**（工具 / 模型 / 流程，查不到写「制作工具未公开」）、
   **创意构思**（核心点子与落点）。合计约 80–150 字，只写有来源的事实，不要纯描述画面。
5. **收录**：

   ```bash
   python scripts/ingest_day.py \
     --url "https://www.youtube.com/watch?v=paWIMl3ljSQ" --fetch-meta \
     --category props-transition --orientation landscape \
     --gif-a "https://github.com/.../daily-2026-10-08/norte-one-shoe-20-styles-a.gif" \
     --gif-b "https://github.com/.../daily-2026-10-08/norte-one-shoe-20-styles-b.gif" \
     --background "自由创作者 Maksym Alaybov 的提案片，NORTE 为虚构品牌。" \
     --production "Nano Banana 出设定图和关键帧，Kling 3.0 生成视频，ElevenLabs 配音、Suno 配乐。" \
     --concept "同一双鞋穿过 20 种画风而造型不变，把产品一致性本身做成卖点。"
   ```

   - `--fetch-meta` 用 oEmbed / B 站接口补标题、作者、封面（YouTube、X、Bilibili、Vimeo，不需要 API Key）。
   - 默认写到 `content/videos/<上海今天>.json`，`--date 2026-09-16` 可指定日期。
   - 同一 URL 再次 ingest 视为更新，不会重复。
   - 批量：`--from-json drafts.json`（数组，键名同接口字段，含 `intro_background / intro_production / intro_concept`）。
   - 每次写入后自动重编 `feed.json`；`--dry-run` 只看规范化结果。缺段、超字数、缺原片都会打 warning。
6. **原片**：每收一条都要把原片传上去（例程必做）：

   ```bash
   python scripts/upload_original.py --date 2026-10-08              # 当天所有缺原片的条目
   python scripts/upload_original.py --date 2026-10-08 --id <id> --file clips/xxx.mp4   # 已下载好的源片
   ```

   - yt-dlp 取 ≤1080p 的 H.264 + AAC（需要时 `--cookies` 或 `$YTDLP_COOKIES`）；不是 H.264/AAC 或 > 1.9 GB 时转码 1080p H.264（CRF 20，faststart），保证 Mac / 飞书能直接播。
   - 资产名 `<slug>.mp4`（和 GIF 同名），传到 `daily-<日期>` Release（`--clobber`），并写回 `video_download_url`。
   - B 站常 412：先用 `source_notes` / `--mirror` 里作者自己的 YouTube 版；都没有就写 `video_download_note`，卡片显示「原片不可下载」。

7. **提交并推送** `content/` 与 `frontend/src/data/feed.json`，Vercel 自动重新部署。

### 分类 slug

| slug | 名称 | slug | 名称 | slug | 名称 |
| --- | --- | --- | --- | --- | --- |
| `ai-short-film` | AI创意短片 | `props-transition` | 道具/转场 | `new-model` | 新模型表现 |
| `ai-ad` | AI创意广告 | `ar-material` | AR/物料 | `3d-render` | 3D/渲染 |
| `fashion` | 换装/时尚 | `ai-tool` | AI创意工具 | `ip-character` | IP/角色 |

### 视频字段

`id`（自动：`日期-标题slug`）、`title`、`url`、`platform`（自动识别）、`author`、`orientation`（`landscape` / `vertical`）、
`category`、`tags[]`、`intro_background` / `intro_production` / `intro_concept`（三段简介，卡片上分标签展示）、
`intro_zh`（三段自动合成的回退文本；旧数据只有这一段时卡片直接显示它）、`collected_date`、`gif_a_url`、`gif_b_url`（横版下段；竖版留空）、`cover_url`、
`video_download_url`（原片 mp4，Release 资产）、`video_download_note`（拿不到原片的原因）、`source_video_url`（旧字段，GIF 切片用的源）、`heat_score` / `influence_score` / `creativity_score`（可选数字）、`source_notes`、
`week_id`（自动）、`weekly_slot`（由周榜文件推算，不用手填）。
`play_count`、`like_count` 等字段会被直接丢弃。

---

## GIF 规则

| 方向 | 张数 | 尺寸 | 速度 | 展示 |
| --- | --- | --- | --- | --- |
| 横版 16:9 | 2（a / b 两段） | 720×406 | 2× | 卡片里 a 在上、b 在下 |
| 竖版 9:16 | 1 | 360×640 | 2× | 卡片里一张，放在等高的深色画框中 |

`make_gifs.py` 默认：a 段从时长 10% 处开始、b 段从 60% 处开始，每段取源片 11 秒（2× 后 GIF 约 5.5 秒），14 fps，
palettegen/paletteuse 两遍调色；先自动裁掉 letterbox / pillarbox 黑边再铺满，a/b 上下贴齐无缝；单张 ≤ 10 MB（超了自动降色数 / fps）。
可用 `--a-start / --b-start / --seg / --fps` 调整。卡片与详情页每段 GIF 都有下载按钮。

没有 ffmpeg？按上表尺寸用任何工具导出，再把 URL 交给 `ingest_day.py` 即可；文件名约定 `<slug>-a.gif` / `<slug>-b.gif`（横版）、`<slug>.gif`（竖版）。

---

## 每周 TOP3

```bash
# 看本周候选（默认上海时区当前 ISO 周）
python scripts/pick_week_top3.py --list
# 选榜：三个槽位可分次填，未给的槽位保留原值
python scripts/pick_week_top3.py --week 2026-W38 \
  --hottest 2026-09-15-houxiyouji-trailer \
  --influential 2026-09-16-china-mobile-cosmic-heart \
  --creative 2026-09-15-motorola-india-100-ai \
  --note "本周三条都指向全片生成进入主流。"
# 改槽位文案
python scripts/pick_week_top3.py --set-label hottest "最热" "本周传播最广的一条"
```

Make 写法：`make list_week`、`make pick_week_top3 WEEK=2026-W38 HOTTEST=<id> INFLUENTIAL=<id> CREATIVE=<id>`。

也可以直接改 `content/weeks/2026-W38.json` 与 `content/labels.json`，然后 `make build_feed`。
首页显示**最近一个有选择的周**；`/weeks` 保留所有往期。

---

## 后端接口（可选）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/creative/feed` | 整站数据，与 `feed.json` 同构 |
| GET | `/api/v1/creative/videos?category=&orientation=&day=&week=` | 列表筛选 |
| GET | `/api/v1/creative/videos/{id}` · `/days` · `/days/{date}` · `/weeks` · `/weeks/current` · `/weeks/{week}` | 读 |
| POST | `/api/v1/creative/ingest` | 收录（同 URL 更新），需 `X-Admin-Token` |
| PUT | `/api/v1/creative/weeks/{week}/top3` | `{"picks": {"hottest": id, ...}, "note": ""}`，需 token |
| PUT | `/api/v1/creative/labels` | 槽位文案，需 token |
| DELETE | `/api/v1/creative/videos/{id}` | 需 token |

写接口只在设置了 `ADMIN_TOKEN` 时开放。脚本加 `--api https://your-api --token $ADMIN_TOKEN` 即可改为走接口
（此时数据写在后端的 `CONTENT_DIR`，要让 Vercel 站点也更新，仍需把 `content/` 提交回仓库，或让前端配置 `VITE_API_BASE`）。

旧版爬虫接口（`/api/v1/videos`、`/api/v1/crawlers/*`）保留不动；七牛云等密钥现在为可选，不填也能启动。

环境变量见 `backend/.env.example`：`ADMIN_TOKEN`、`CONTENT_DIR`、`FEED_PATH`、`FFMPEG_PATH`，以及旧版的七牛 / DashScope / YouTube Key。

---

## 部署

**前端（Vercel）**

- Root Directory 设为 `frontend`（Framework: Vite）。`frontend/vercel.json` 已配置 SPA rewrite 与静态资源缓存。
  若 Root Directory 用仓库根目录，根目录的 `vercel.json` 给出了 `cd frontend && npm run build` / `frontend/dist`。
- 环境变量（可选）：`VITE_API_BASE=https://your-api.example.com`。不配则纯静态。
- 每次 `content/` 变更后记得 `make build_feed` 并提交 `frontend/src/data/feed.json`。

**后端（Render / Docker，可选）**

- `render.yaml` / `Dockerfile` 沿用；新增 `ADMIN_TOKEN`、`CONTENT_DIR`（建议指向持久盘）。
- 免费实例文件系统不持久，通过接口写入的内容重启后会丢——所以推荐把 `content/` 留在 git 里作为真源。

---

## 示例数据

首次部署自带 10 条示例卡片与两周示例周榜（`2026-W37`、`2026-W38`），GIF 全部来自本仓库已有的 GitHub Release
（`vol10-gifs`、`vol11-gifs`、`ads-pick-gifs`）。收录日期与周榜选择均为演示用途，`source_notes` 里有标注，可随时删除或替换。
