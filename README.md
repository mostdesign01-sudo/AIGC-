# 得物 AIGC 创意双周报

给团队用的**公开下载页**（聊天里传不了文件）。手机可以直接打开，看当期简报、下成片和 2× GIF。

不依赖本地后端。Vercel / GitHub Pages 部署前端即可。

当期：**VOL.11**，收录窗口 **2026-08-17 → 2026-08-31**（Asia/Shanghai）。

线上预期地址：把 Vercel 指到本仓库后，根路径就是 VOL.11。

## 本地预览

```bash
cd frontend
npm ci
npm run dev
# http://127.0.0.1:5174
```

构建：

```bash
cd frontend
npm run build
npm run preview
```

## 页面里有什么

- 刊发日 + 收录窗口
- **创意简报**：3–5 条入选。横版成片叠**正好两张** 2× GIF（上/下，720×406）；竖版一张。GIF 页内可见，也可下载。
- **九类覆盖**（每类一张卡：类型、标题、一句为什么值得看、源链接；有成片则「下载视频」，否则源链接 + 「暂无成片下载」）
  1. AI创意短片
  2. AI创意广告
  3. 换装/时尚
  4. 道具/转场
  5. AR/物料
  6. AI创意工具
  7. 新模型表现
  8. 3D/渲染
  9. IP/角色
- 某类本窗口没有样本时，卡片仍在，写「本期空」。

数据在 `frontend/src/data/`。九类 slug 与已关闭的工作台 PR 保持一致，方便以后接回编辑后台。

## 怎么加 VOL.12

1. 复制 `frontend/src/data/issues/vol11.ts` → `vol12.ts`。
2. 改期号、刊发日、窗口（默认再往后 14 天，时区仍是 Asia/Shanghai）。
3. 重写 `summary`、`brief`（3–5 条）、`slots`（九类都要有，空的标 `empty: true`）。
4. **不要编造**播放量、日期、模型归属。没有源就不写源。
5. 在 `frontend/src/data/issues/index.ts` 登记：

```ts
import { vol12 } from './vol12'

export const CURRENT_VOL = 12

const registry: Record<number, Issue> = {
  [vol11.vol]: vol11,
  [vol12.vol]: vol12,
}
```

6. 把成片 / GIF 传到 GitHub Release，tag 用 `vol12-gifs`（见下）。`releaseTag` 和文件名必须对得上。

## GIF 怎么命名、怎么出

横版（简报里上下叠两张，和 VOL.10 仙宫一对一样）：

| 用途 | 文件名 | 规格 |
|---|---|---|
| 成片 | `{nn}-{slug}-src.mp4` | 原片 |
| 上半 GIF | `{nn}-{slug}-a.gif` | **720×406**，**2× 速** |
| 下半 GIF | `{nn}-{slug}-b.gif` | **720×406**，**2× 速** |

竖版只要一张：`{nn}-{slug}.gif`（可另存 `{nn}-{slug}-src.mp4`）。

VOL.11 已用文件名：

```
01-wencangsheng-src.mp4
01-wencangsheng-a.gif
01-wencangsheng-b.gif
02-wan30-src.mp4
02-wan30-a.gif
02-wan30-b.gif
03-zephyr-src.mp4
03-zephyr-a.gif
03-zephyr-b.gif
```

简报横版只叠 `*-a.gif` / `*-b.gif`。Release 里若还有 `03-zephyr-c.gif`–`f.gif` 或 `03-houxiyouji-*`，不要排进三条简报。

页面下载按钮写死为：

`https://github.com/mostdesign01-sudo/AIGC-/releases/download/{tag}/{filename}`

文件还没传上去也能先上线；传完刷新即可下。Release 页：<https://github.com/mostdesign01-sudo/AIGC-/releases/tag/vol11-gifs>

### 上传到 Releases

没有 tag 时先建：

```bash
gh release create vol11-gifs \
  --title "VOL.11 locked-pick 2x GIFs" \
  --notes "VOL.11 简报成片与 2× GIF（横版 720×406 上下一对）"
```

上传（文件名必须一致；已有文件可加 `--clobber`）：

```bash
gh release upload vol11-gifs \
  01-wencangsheng-src.mp4 \
  01-wencangsheng-a.gif \
  01-wencangsheng-b.gif \
  02-wan30-src.mp4 \
  02-wan30-a.gif \
  02-wan30-b.gif \
  03-zephyr-src.mp4 \
  03-zephyr-a.gif \
  03-zephyr-b.gif
```

VOL.12 把 `vol11-gifs` 换成 `vol12-gifs`，文件名按上面的规则改。

出 GIF 可用 ffmpeg（片源约 6 秒，`setpts=0.5*PTS` 变 2×，缩到 720×406）：

```bash
ffmpeg -y -i clip.mp4 -vf "setpts=0.5*PTS,scale=720:406:force_original_aspect_ratio=increase,crop=720:406,fps=10,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" out.gif
```

横版两条分别从成片前半 / 后半（或上下画面）各出一张。

## 部署

### Vercel

仓库根目录已有 `vercel.json`：安装并构建 `frontend`，输出 `frontend/dist`。

1. Vercel → Import 本仓库（或连着已有项目 `aigc-phi`）。
2. **Root Directory 留空**（用根目录的 `vercel.json`）。若项目已经把 Root Directory 设成 `frontend`，也可以，`frontend/vercel.json` 负责 SPA 回退。
3. 框架：Vite / Other 均可。构建命令不必再手填。
4. 部署完成后打开根路径，应直接是 VOL.11，无需登录、无需后端。

### GitHub Pages

```bash
cd frontend
npm ci
npm run build
```

把 `frontend/dist` 发到 `gh-pages` 分支，或在仓库 Settings → Pages 选 GitHub Actions 上传该目录。

单页应用：加一个和 `index.html` 相同的 `404.html`，避免直接打开 `/?vol=12` 以外的 history 路径 404。本页期号用查询参数 `?vol=11`，Pages 根路径即可。

## 旧收集站 / 工作台

`backend/` 仍是原来的 FastAPI 抓取骨架。已关闭的 PR #1 做过「出报工作台」（9 类、入选 3 条、2× GIF），**本期先交付可打开的公开页**。工作台没有合并进生产。

旧接口本地启动：

```bash
cd backend
pip install -r requirements.txt
python run.py
```
