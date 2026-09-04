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
| `.cut` | 同图 `screen` 裁切；探测 `poster/hand-left.png` / `hand-right.png` / `approach.svg`，有则用，无则裁母本 |

用在：P07 `.demo.win`、P13–15 `.device.win`、P19 `.prompt.win`、讲稿 `.notes.win`、`.toast.win`、门页窗口按钮。

### 母本坐标（批次 I）

母本已落盘：`poster/cover-poster-master.png` 与 `cover-poster.webp`（1200×675，标题在上半、窗口在下约 1/3、双手从两侧指向窗口）。

`.door-win` 按该图实测量终值：

| 机位 | `--win-x` | `--win-y` | `--win-w` | `--win-h` |
|---|---|---|---|---|
| 桌面 cover / 1440×900 | 34.4% | 59.9% | 30.3% | 27.8% |
| 手机 contain / 390 | 35.9% | 60% | 27.3% | 7.3% |

手机门页：`object-fit: contain; object-position: 50% 60%`，整幅入画，两手不被裁掉。

## 门页规则 · 海报延展

纯 CSS `z-index`。氛围层固定、`pointer-events: none`。底景只能是 Hao 母本整图。

| z | 节点 | 角色 |
|---|---|---|
| 0 | `.door-mid` + `cover-poster.webp` | 固定底景。海报 `object-fit: cover`，滚动时最慢 translate。窗口按钮叠在这一层，跟着海报走 |
| 10 | `.door-read` / `.door-hero` | 滚动阅读层：`.sl` eyebrow、骨白重标、窄栏副文、右侧 scroll cue |
| 20 | `.door-near` / `.door-fg` | 角标 + 两枚指尖 `.cut`（滚动 -16% 上移） |
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

进课后 `#loader` 淡出，`.scene-root` 接住同一张海报。页不再是舞台里的卡片。机位 `transform` 写在 `*-cam`，指针视差写在 `*-par`，两层包裹，互不覆盖。wash 不位移。

| z | 层 | 节点 | 角色 | 视差 @ ±0.5 |
|---|---|---|---|---|
| 0 | 底景 far | `.scene-far > .scene-far-cam > .scene-far-par > img` | 母本整图，`[data-ch]` 换机位 900ms；讲解页 `brightness(.5)`，章首 `.7`，ch5 章首 `.6` | 4px |
| 1 | 中景 mid | `.scene-mid` | 空容器（批次 L 再填字母 / 纹理） | 8px |
| 2 | 洗 wash | `.scene-wash` | `open / talk / case` 三套暗角，**不位移** | 0 |
| 10 | 前景文案 | `.page-fore` | 窄栏标题 / 短句 / 细线互动；视差走 `--par-x/y` | 14px |
| 20 | 近景 near | `.scene-near` | 点阵手 / 指尖 / Approach（按密度表）；贴边不跟机位缩放；手机不出现 | 24px |
| 55 | 氛围 | `.scene-vignette` | 径向暗角 | 0 |
| 60 | 氛围 | `.scene-grain` | canvas 噪点 | 0 |
| 70 | HUD | rail / dock / hud / `.page-side` | 细描边，不铺实心底 | 0 |

章首（`chStarts` = P01 / P03 / P06 / P08 / P12 / P17）：

- t0 暗场 `.scene-veil` .72（380ms）
- t0+80 far / mid 换机位 900ms `cubic-bezier(.16,1,.3,1)`
- t0+120 章标 `.scene-mark.sl`：`\ 0n 章名 /`，骨白、`--display-weight`、18px、`letter-spacing: .28em`
- t0+380 `applyPage()`，veil 退，`.page-fore` 从左下入场 720ms
- t0+500 `.scene-near` 入场 class；`.cut` 从对应角入 900ms
- t0+900 章标退
- `prefers-reduced-motion`：无机位位移、无 veil、无视差，静态可读

### 六机位终值（批次 J，母本 1200×675）

`.scene-root[data-ch]` ← `applyPage()` 写页上已有 `data-ch`。`--cam-x/y` 是 `object-position` + `transform-origin`，`--cam-s` 是外层 `scale`。

| ch | 页 | `--cam-x` | `--cam-y` | `--cam-s` | 看到什么 | 文案安全区 |
|---|---|---|---|---|---|---|
| 0 | P01–P02 | `50%` | `8%` | `1.32` | 上半：字母 + 方标；窗口上约 1/3 露在帧底，与课名不相交 | 中央偏上，课名居中 |
| 1 | P03–P05 | `12%` | `78%` | `1.6` | 左手大、字母在后 | 右上：x 约 48–100%，y 靠上 |
| 2 | P06–P07 | `50%` | `75%` | `1.5` | 窗口居中偏下 | 金句在窗口上方，y 约 18–48% |
| 3 | P08–P11 | `88%` | `78%` | `1.6` | 右手大 | 左上：x 约 6–56% |
| 4 | P12–P16 | `50%` | `20%` | `1.3` | 字母 + 方标，wash `case` 右侧更透 | 标题左上；预览仍右 64% |
| 5 | P17–P20 | `50%` | `50%` | `1.1` | 全图回归 | P17 左栏；P20 居中 |

> ch0 简报原写 `50% 100% / 1.25`。现母本窗口在下 1/3，该值会把镜头钉在窗口上，与「看上半、窗口落帧外」相反，按 1200 文件改为 `50% 8% / 1.32`。其余五档沿用简报表。母本仅 1200 宽，1.6× 会发软——**待 Hao ≥2400 原图**，不要 AI 重画。

同章翻页只换 wash / 亮度，不换机位。换章 far 位移 ≥ 6% 帧宽。

手机：机位切换保留；wash 上限 .8（无 `!important`）；`.page-fore` 底 `.78` + 1px 边；near 不出现。

### 近景密度（批次 K）

20 页里 `.scene-near` 非空恰好 10 页；讲解页子节点 = 0。手 `pointer-events: none`。

| 页 | 近景 |
|---|---|
| 门页 | 2 指尖（`.door-near`，另计） |
| P01 | 2 指尖 |
| P03 / P08 / P17 | 左手 |
| P06 | 右手 |
| P12 | 右指尖 + Approach（底景已有手时不叠整手） |
| P13 / P15 | 左指尖，贴预览外侧 |
| P14 | 右指尖，贴预览外侧 |
| P20 | 左右指尖 + Approach（`--cut-a` .35，避四只手） |
| 其余讲解页 | 空 |

同图裁切（母本 1200×675，无分层文件时）：左手体 x0–39 / y53–85，指尖 ≈ (38, 71)；右手体 x60–100 / y62–92，指尖 ≈ (60, 72)；Approach x62–78 / y50–61。遮罩中心对准指尖，四边羽化到 alpha 0；标题带 y40–53、底行 y91–96、窗口 x36–64 / y60–88 不进裁切（指尖入窗 ≤ 3%）。

## Motion

- 课堂卡片 hover：点阵底，不要大投影、不要蓝块。
- 门页窗口 hover：骨白描边 + 标题栏图标微亮。
- 章节过渡 300–900ms。不要 Three.js、不要 4200vh、不要自定义 WebGL。
- 门页分层跟短距滚动；课堂桌面跟指针。不加迈步帧、无音频。
- 桌面 ring cursor：22px 点阵细圈（`--dots` 描边），`mix-blend-mode: difference`。移动端 / `prefers-reduced-motion` / 改字态关闭。

## 真实素材

**当前 `cover-poster.webp` 与 `poster/cover-poster-master.png` 已是 Hao 双手相触母本（1200×675）。** `assets/poizon/` 子目录为空占位。完整状态表见 `ASSETS.md`。

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
