# HTML+ DesignLang

门页与课堂共用的视觉合同。改皮肤先改本文件，再改 `index.html` 里对应 token。不改冻结句。

## Overview

黑场电影感课堂。门页是 Kage 式短距 landing hero：固定氛围层 + 中景海报 + 前景阅读层 + 近景 cut-out。进课后同一海报留下，做整幅场景底；页是压在画面上的窄栏文案，不是 16:9 白板里的卡片堆。只借层栈、排版密度、短距过渡；不借 plaza / locale / 走楼，不引入 Three.js / PlayCanvas / 字体 CDN。

## Colors

### Brand & Accent

| Token | Hex | 用法 |
|---|---|---|
| 黑场 `--bg` | `#07090d` | 页底、门页垫底 |
| Klein `--klein` | `#002FA7` | 选中态半透明洗、强调条 |
| 极光青 `--aurora` | `#01c2c3` | 仅点缀：2px tick / 下划线 / 进度 / 门页 eyebrow 圆点 |

极光青不进正文、不进大标题。Klein 不当大面积字色；暗底上的 Klein 字用 `--klein-on-dark`。门页不借用 Kage 朱红色。门页 CTA 不用实心 Klein 块，Klein 只作箭头强调。章封面不再铺满 Klein 色块。

### Surface

| Token | Hex |
|---|---|
| `--stage` | `#0c0f14` |
| `--surface-1` | `#12161d` |
| `--surface-2` | `#181d26` |
| `--surface-3` | `#1f2530` |

课堂卡片改为半透明 HUD（约 `rgba(7,9,13,.28)` + 细白边），不再用实心 surface 白卡。

### Text

| Token | Hex / value |
|---|---|
| `--ink` / `--text` | `#f5f7fa` |
| `--soft` | `#c4c8d0` |
| `--dim` | `#8b909a` |
| `--line` | `rgba(255, 255, 255, 0.12)` |
| `--chrome` | `rgba(255, 255, 255, 0.38)` |

## Typography

系统栈：`--sans`（SF Pro / PingFang / Noto Sans SC）。不引入字体 CDN、不写 `@font-face`。

课堂标题可加轻阴影，不再用重 glow 抢画面。冻结句逐字不动，见 `OPTIMIZATION-5.1.md` §5.3。

门页与课堂共用：

- 显示标题 / `.gold` / `h2`：字重 **400**、`line-height: 1.05–1.08`、`letter-spacing: -0.016em` 左右
- 微标签（kicker / ch-no / eyebrow / cue）：9–11px、uppercase、`letter-spacing: .2em ~ .3em`、muted
- 副文：字重 300，窄栏
- 竖排：门页 `POIZON DESIGN` / `OPEN CLASS`；课堂右侧 `HTML+` / 章标
- CTA：tracked 文本链 + 小箭头，细描边 pill；不要实心大按钮挡画面

海报已有课名大字。前景短标放左上阅读区，不再叠冻结副标题。

## Layout

间距：4 / 8 / 12 / 16 / 24 / 32。圆角：HUD 用 4 / 6，少用大圆角卡片。

案例预览保持 3:2 线框。P13 / P14 / P15 改为左窄栏文案 + 右整幅预览，压在场景底上。

## 门页规则 · Kage-inspired layer stack

纯 CSS `z-index`，与 Kage 同阶。氛围层固定、`pointer-events: none`。WebGL 底景用 Hao 海报代替，不引入 Three.js。

| z | 节点 | 角色 |
|---|---|---|
| 0 | `.door-mid` + `cover-poster.webp` | 固定底景。海报 `object-fit: cover`，滚动时最慢 translate |
| 10 | `.door-read` / `.door-hero` | 滚动阅读层：eyebrow、短标、窄栏副文、CTA、scroll cue |
| 20 | `.door-near` / `.door-fg` | 可选近景 cut-out（角标 / 窗口线框 / 斜杠） |
| 55 | `.door-vignette` | 固定径向暗角 |
| 60 | `.door-grain` | canvas 生成 180px 噪点 `toDataURL`，`opacity: .055`，`mix-blend-mode: overlay` |

CTA 与字在阅读层（z 10），不抬到 grain 之上。

1. 封面必须是 `cover-poster.webp`（Hao 海报整图）。禁止纯 CSS 仿海报当主视觉，禁止假建筑图。
2. 进入课堂前可轻微纵向滚动，轨道约 1.8 屏（185vh）。不要长卷轴，不要 4200vh。
3. 底 / 中 / 前景不同 **translate** 速率。不是一张贴图。
4. `[data-rv]` / `.mask-line`：字从下方滑入。`IntersectionObserver` stagger。优先 `animation-timeline: scroll()`；不支持时用轻量 `scroll` 监听。
5. 底部 scroll cue 文案「下滑进入」= 细轨 + 扫光。点「进入课堂」、滚到阈值、或 Enter / 空格，一层进入 P01。
6. `prefers-reduced-motion`：无动画、轨道收成一屏、静态可读。
7. 手机减弱近景：窗口线框 / 斜杠 / 角标 / 竖排隐藏。
8. 左栏 / HUD / dock 进课后才出现。

## 课堂场景流

进课后 `#loader` 淡出，`.scene-root` 接住同一张海报。页不再是舞台里的卡片。

| 层 | 节点 | 角色 |
|---|---|---|
| 底 | `.scene-mid` + 海报 | 固定中景，桌面指针轻微平移 |
| 洗 | `.scene-wash` | `open / talk / case` 三套暗角，案例页右侧更透 |
| 氛 | `.scene-vignette` + `.scene-grain` | 与门页同手法 |
| 文 | `.page-fore` | 窄栏标题 / 短句 / 细线互动 |
| HUD | 左栏、dock、`.page-side`、3:2 线框 | 细描边，不铺实心底 |

章首（`chStarts` = P01 / P03 / P06 / P08 / P12 / P17，对应用户说的章节首）：

- 暗场 `.scene-veil` 约 380ms
- 章标 `.scene-mark` 居中短暂停留
- `.page-fore` 从左下入场 720ms
- 背景海报保持，不切到纯色 Klein 场

普通页：420–560ms opacity + 短距 translate。案例页文案从左侧切入，预览留在中景。

## Motion

- 课堂 HUD hover：细边加亮 + `translateY(-2px)`，不要大投影卡片。
- 门页 CTA hover：细边加亮 + 箭头右移。
- 章节过渡 300–900ms。不要 Three.js、不要 4200vh、不要自定义 WebGL。
- 门页分层跟短距滚动；课堂桌面跟指针三速率。不加迈步帧、无音频。
- 桌面 ring cursor：22px 细圈，`mix-blend-mode: difference`，hover 到 32px 并微磁吸。移动端 / `prefers-reduced-motion` / 改字态关闭。

## 真实素材

只认已落盘文件。缺文件写「待补」，不生成假产品图。路径见 `ASSETS.md`。T恤 SVG 是交互线框，不是产品照片。

## Do

- 黑场 + Klein 强调点 + 极光青点缀。
- 海报整图做底景；氛围、阅读、cut-out 分层。
- `file://` 可开：相对路径资源，无外链。

## Don't

- 不改冻结句 / `data-note` / 案例互动主逻辑。
- 不借 plaza、locale、走楼、朱红、Three 寺庙世界、五章叙事、他们的 PNG 素材库、音频、巨大自定义光标。
- 不引入构建工具、字体 CDN、三维引擎、npm。
- 不做瀑布流、不把整站做成长页作品集或 Kage 克隆。
- 不把海报只当成一个按钮背景。
