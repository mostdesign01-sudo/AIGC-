# HTML+ DesignLang

门页与课堂共用的视觉合同。改皮肤先改本文件，再改 `index.html` 里对应 token。不改冻结句。

## Overview

黑场电影感课堂。门页是海报母本的下一页：固定氛围层 + 中景海报 + 前景阅读层。进课后同一海报留下，做整幅场景底；页是压在画面上的窄栏文案，不是 16:9 白板里的卡片堆。只借层栈、排版密度、短距过渡；不借 plaza / locale / 走楼，不引入 Three.js / PlayCanvas / 字体 CDN。

## Colors

### Brand & Accent

| Token | Hex / value | 用法 | 禁止 |
|---|---|---|---|
| 黑场 `--bg` | `#07090d` | 页底、门页垫底、veil | — |
| 骨白 `--bone` | `#ece9e2` | 展示标题（`.door-mark` / `.gold` / `.scene-mark` / 章号）、窗口线框、点阵、斜杠 | 不做正文（正文仍 `--text` / `--soft`） |
| `--bone-soft` | `rgba(236,233,226,.72)` | 副文、`.win-bar` 图标 | — |
| `--bone-line` | `rgba(236,233,226,.34)` | 窗口边、卡片底线、章首细线 | — |
| Klein `--klein` | `#002FA7` | ① 2px 左侧强调条 / 箭头 / 下划线；② 选中态描边 `1px solid var(--klein-on-dark)` + 文字 `--klein-on-dark`；③ 主 CTA 一处（门页「进入课堂」箭头 + P19 复制按钮箭头） | 任何面积 ≥ 一张卡 25% 的填充；整章封面底；`.toast` 底；手机整页底 |
| `--klein-on-dark` | `#7aa2ff` | 暗底上的 Klein 字 / 描边 | 大面积字色 |
| `--klein-wash` | `rgba(0,47,167,.18)` | 选中态**最大**允许填充 | > .18 |
| 极光青 `--aurora` | `#01c2c3` | 2px tick / 进度 / eyebrow 圆点 / Approach 手写 / 提示词槽位下划线 | 正文、标题、填充 |
| `--dots` | `radial-gradient(circle, rgba(236,233,226,.62) 0 .55px, transparent .95px)`，`background-size: 3px 3px` | hover 填充、进度轨 | 大面积铺满；正文底 |

极光青不进正文、不进大标题。门页不借用 Kage 朱红色。章封面不再铺满 Klein 色块。

### Surface

| Token | Hex |
|---|---|
| `--stage` | `#0c0f14` |
| `--surface-1` | `#12161d` |
| `--surface-2` | `#181d26` |
| `--surface-3` | `#1f2530` |

讲解页卡片不再用半透明 HUD + blur。形态是「字 + 1px `--bone-line` 底线 + tag」；hover = `--dots`；选中 = 2px Klein 左条 + 骨白字。

### Text

| Token | Hex / value |
|---|---|
| `--ink` / `--text` | `#f5f7fa` |
| `--soft` | `#c4c8d0` |
| `--dim` | `#8b909a` |
| `--line` | `rgba(255, 255, 255, 0.12)` |
| `--chrome` | `var(--bone-line)` |

## Typography

系统栈：`--sans`（SF Pro / PingFang / Noto Sans SC）。不引入字体 CDN、不写 `@font-face`。

| Token | 值 | 用法 |
|---|---|---|
| `--display-weight` | `700` | `.gold` / `.door-mark` / `.scene-mark` |
| `--display-glow` | `0 0 22px rgba(236,233,226,.22)` | 只随 `--display-weight` 出现 |

> **待 Hao**：`--display-weight: 700` + glow 是本批唯一审美改向。若否，回退为 `500` + `--display-glow: none`，其余不受影响。

冻结句逐字不动，见 `OPTIMIZATION-5.1.md` §5.3。

门页与课堂共用：

- 展示标题 / `.gold` / `.door-mark` / `.scene-mark`：字重 **`--display-weight`**、骨白、柔光
- 讲解页 `h2`：字重 **400–500**、无 glow
- 微标签（kicker / ch-no / eyebrow / cue）：9–11px、uppercase、`letter-spacing: .2em ~ .3em`、muted；门页 eyebrow 用 `.sl`（`\ … /`）
- 副文：字重 300，窄栏
- 竖排：课堂右侧 `HTML+` / 章标。门页不再叠 `POIZON DESIGN` / `OPEN CLASS`（海报已印）
- CTA：门页 = 透明按钮覆盖母本窗口，底边 tracked「进入课堂 →」；不要实心大按钮挡画面

海报已有课名大字。前景短标放左上阅读区，不再叠冻结副标题。

## Layout

间距：4 / 8 / 12 / 16 / 24 / 32。圆角：窗口 chrome 用 2px，少用大圆角卡片。

案例预览保持 3:2 线框。P13 / P14 / P15 改为左窄栏文案 + 右整幅预览，压在场景底上。

## 海报元件

通用类（批次 I 已抽）：

| 类 | 画法 |
|---|---|
| `.win` | `border: 1px solid var(--bone-line); border-radius: 2px; background: rgba(7,9,13,.22)` |
| `.win-bar` | 22px、底线、右对齐 `— ☐ ✕`（原 `.door-chrome-bar`） |
| `.sl` | `::before "\\ "` / `::after " /"`，字重 300、opacity .7 |
| `.cut` | 同图裁切地基（`mix-blend-mode: screen`）；本批不铺各章手 |

用在：P07 `.demo.win`、P13–15 `.device.win`、P19 `.prompt.win`、讲稿 `.notes.win`、`.toast.win`、门页窗口按钮。

### 母本坐标（批次 I）

母本（双手从下角相触、窗口在下 1/3）应落在 `poster/cover-poster-master.png`，并转 `cover-poster.webp`（q≈85，宽边 ≤ 2400，横版）。

当前仓库 `cover-poster.webp`（1536×1024，窗口在画心）实测后写入 `.door-win`：

| 机位 | `--win-x` | `--win-y` | `--win-w` | `--win-h` |
|---|---|---|---|---|
| 桌面 cover / 1440×900 | 31% | 28% | 38% | 34% |
| 手机 contain / 390 | 22% | 48% | 56% | 16% |

简报母本（双手下角相触、窗口在下 1/3）预置是 `36 / 60 / 28 / 27`。母本落盘后按实图改回并写终值。

手机门页：`object-fit: contain; object-position: 50% 60%`，避免裁掉两手。

## 门页规则 · 海报延展

纯 CSS `z-index`。氛围层固定、`pointer-events: none`。底景只能是 Hao 母本整图。

| z | 节点 | 角色 |
|---|---|---|
| 0 | `.door-mid` + `cover-poster.webp` | 固定底景。海报 `object-fit: cover`，滚动时最慢 translate。窗口按钮叠在这一层，跟着海报走 |
| 10 | `.door-read` / `.door-hero` | 滚动阅读层：`.sl` eyebrow、骨白重标、窄栏副文、右侧 scroll cue |
| 20 | `.door-near` / `.door-fg` | 角标；近景手 cut 留给后续批次 |
| 55 | `.door-vignette` | 固定径向暗角 |
| 60 | `.door-grain` | canvas 生成 180px 噪点 `toDataURL`，`opacity: .055`，`mix-blend-mode: overlay` |

1. 封面必须是 Hao 母本 `cover-poster.webp`。禁止纯 CSS 仿海报当主视觉，禁止用旧版「捏窗」海报冒充母本的手，禁止 AI 重画。
2. 进入课堂前可轻微纵向滚动，轨道约 1.8 屏（185vh）。不要长卷轴，不要 4200vh。
3. 底 / 中 / 前景不同 **translate** 速率。
4. `[data-rv]` / `.mask-line`：字从下方滑入。
5. **窗口即门**：透明 `<button.door-win>` 覆盖母本窗口矩形。点窗口 / 滚到阈值 / Enter / 空格，一层进入 P01。
6. `prefers-reduced-motion`：无动画、轨道收成一屏、静态可读。
7. 手机：`contain` + `50% 60%`，两手至少各露前臂；窗口可点。不叠竖排字、不画假窗口。
8. 左栏 / HUD / dock 进课后才出现。

## 课堂场景流

进课后 `#loader` 淡出，`.scene-root` 接住同一张海报。页不再是舞台里的卡片。

| 层 | 节点 | 角色 |
|---|---|---|
| 底 | `.scene-mid` + 海报 | 固定中景，桌面指针轻微平移 |
| 洗 | `.scene-wash` | `open / talk / case` 三套暗角，案例页右侧更透 |
| 氛 | `.scene-vignette` + `.scene-grain` | 与门页同手法 |
| 文 | `.page-fore` | 窄栏标题 / 短句 / 细线互动 |
| HUD | 左栏、dock、`.page-side`、3:2 `.win` 线框 | 细描边，不铺实心底 |

章首（`chStarts` = P01 / P03 / P06 / P08 / P12 / P17）：

- 暗场 `.scene-veil` 约 380ms
- 章标 `.scene-mark` 居中短暂停留（骨白、`--display-weight`）
- `.page-fore` 从左下入场 720ms
- 背景海报保持，不切到纯色 Klein 场

六机位切层是后续批次，本批不铺。

## Motion

- 课堂卡片 hover：点阵底，不要大投影、不要蓝块。
- 门页窗口 hover：骨白描边 + 标题栏图标微亮。
- 章节过渡 300–900ms。不要 Three.js、不要 4200vh、不要自定义 WebGL。
- 门页分层跟短距滚动；课堂桌面跟指针。不加迈步帧、无音频。
- 桌面 ring cursor：22px 细圈，`mix-blend-mode: difference`。移动端 / `prefers-reduced-motion` / 改字态关闭。

## 真实素材

**当前仅旧版 `cover-poster.webp`（双手捏窗，1536×1024）在仓库。** Hao 母本（双手相触）应落到 `poster/cover-poster-master.png` 并覆盖 webp。`assets/poizon/` 子目录为空占位。完整状态表见 `ASSETS.md`。

## Do

- 黑场 + Klein 强调点（条 / 描边 / ≤.18 洗）+ 极光青点缀。
- 海报整图做底景；氛围、阅读、cut-out 分层。
- `file://` 可开：相对路径资源，无外链。

## Don't

- 不改冻结句 / `data-note` / 案例互动主逻辑。
- 不借 plaza、locale、走楼、朱红、Three 寺庙世界、五章叙事、他们的 PNG 素材库、音频、巨大自定义光标。
- 不引入构建工具、字体 CDN、三维引擎、npm。
- 不做瀑布流、不把整站做成长页作品集或 Kage 克隆。
- 不把海报只当成一个按钮背景；不编造 POIZON 案例图。
- 不用旧版「捏窗」手冒充母本切层，不用 AI 重画手。
