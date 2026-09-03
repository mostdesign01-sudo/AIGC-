# HTML+ DesignLang

门页与课堂共用的视觉合同。改皮肤先改本文件，再改 `index.html` 里对应 token。不改冻结句。

## Overview

黑场电影感课堂。门页是 Kage 式短距 landing hero：固定氛围层 + 中景海报 + 前景阅读层 + 近景 cut-out。课堂里卡片轻抬、舞台 3:2 气质框。只借层栈、排版密度、滚动入场；不借 plaza / locale / 走楼，不引入 Three.js / PlayCanvas / 字体 CDN。

## Colors

### Brand & Accent

| Token | Hex | 用法 |
|---|---|---|
| 黑场 `--bg` | `#07090d` | 页底、门页垫底 |
| Klein `--klein` | `#002FA7` | 课堂按钮、选中卡、强调条、章封面 |
| 极光青 `--aurora` | `#01c2c3` | 仅点缀：2px tick / 下划线 / 进度条 / 门页 eyebrow 圆点 |

极光青不进正文、不进大标题。Klein 不当大面积字色；暗底上的 Klein 字用 `--klein-on-dark`。门页不借用 Kage 朱红色。门页 CTA 不用实心 Klein 块，Klein 只作箭头强调。

### Surface

| Token | Hex |
|---|---|
| `--stage` | `#0c0f14` |
| `--surface-1` | `#12161d` |
| `--surface-2` | `#181d26` |
| `--surface-3` | `#1f2530` |

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

课堂标题可加 `--title-glow`。冻结句逐字不动，见 `OPTIMIZATION-5.1.md` §5.3。

门页排版（Kage 气质，本课色）：

- 显示标题 `.door-mark`：字重 **400**、`line-height: 1.05`、`letter-spacing: -0.012em`、大字 `clamp`、轻 `text-shadow`
- 微标签（eyebrow / cue）：9–11px、uppercase、`letter-spacing: .2em ~ .3em`、muted
- 副文 `.door-lede`：字重 300，窄栏 `max-width: 320px`
- 竖排品牌：`writing-mode: vertical-rl`，左右各一条 `POIZON DESIGN` / `OPEN CLASS`
- CTA：tracked 文本链 + 小箭头，细描边 pill；不要实心大按钮挡画面

海报已有课名大字。前景短标放左上阅读区，不再叠冻结副标题。

## Layout

间距：4 / 8 / 12 / 16 / 24 / 32。圆角：4 / 6 / 8 / 12 / 16。

舞台比例气质：3:2 框（课堂舞台沿用现有比例）。门页近景 cut-out 可用 3:2 线框，但不压在海报正中窗口上。

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

## Motion

- 课堂卡片 hover：`translateY(-3px)`。
- 门页 CTA hover：细边加亮 + 箭头右移，不铺实心块。
- 门页分层只跟短距滚动走，不跟指针、不加迈步帧、无自定义大光标、无音频。

## Do

- 黑场 + Klein 强调点 + 极光青点缀。
- 海报整图做底景；氛围、阅读、cut-out 分层。
- `file://` 单文件可开：相对路径资源，无外链。

## Don't

- 不改冻结句 / `data-note` / 案例互动主逻辑。
- 不借 plaza、locale、走楼、朱红、Three 寺庙世界、五章叙事、他们的 PNG 素材库、音频、自定义大光标。
- 不引入构建工具、字体 CDN、三维引擎、npm。
- 不做瀑布流、不把整站做成长页作品集或 Kage 克隆。
