# HTML+ 5.1 场景母系统优化简报

- 审课对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-scene-flow-983d`（PR #28，场景流），HEAD `3cf44a2`，叠在 `cursor/html-plus-batch-h-cta-5b4c`（批次 H · Kage 门页）之上。
- 审课依据：Hao 2026-09-04 三条问题 + 附件 1 海报横版（母本）+ 附件 2–3 Kage 参考截图 + 本目录 `DESIGN.md` / `ASSETS.md` / `OPTIMIZATION-5.1.md`（旧简报，冻结句、禁词、批次纪律全部继承）。
- 审课方式：通读 `index.html` 3643 行；Chrome 148 无头 + CDP 渲染门页、P01 / P03 / P04 / P05 / P06 / P07 / P08 / P09 / P11 / P12 / P13 / P14 / P15 / P17 / P19 / P20（1440×900），门页 / P03 / P07 / P13（390×844）；`getBoundingClientRect` 量标题与海报元素的重叠。
- 执行者：Grok 4.6，按第 4 节批次 I → M 执行，每批一个 commit、一次 PR 更新、回到第 6 节自验。
- 本轮不改 `index.html`，不改任何业务代码；只新增本文件。
- 行号以 HEAD `3cf44a2` 为准，批次 I 之后会漂移，Grok 以选择器为准。

> **两条前置事实，Grok 开工前先确认：**
> 1. 仓库里的 `cover-poster.webp`（1536×1024）是「双手捏窗」版：两只点阵手从左右中部伸进来夹住窗口，课名大字在下 1/3，窗口在中部。Hao 本轮给的母本（附件 1）是「双手相触」版：两只手从左下 / 右下角伸出，得物方标居中顶部，`AI 时代的 \ 工作表达新方式 /` 在中部，窗口线框在下 1/3 正中，`TIME . 0915 / 20:00　ADD . 11F — 培训室1103` 压底。两版构图不同，本简报所有机位、安全区、切层坐标按**母本**写；母本落盘前 Grok 只能做与坐标无关的部分（token、组件、去蓝模块）。
> 2. 附件 1–3 在本次云环境里**没有落盘**（`html-plus-course/poster/`、`kage-ref/` 路径不存在）。母本必须由 Hao 落到 `demos/html-plus-course/poster/cover-poster-master.png`（原图）并转 `cover-poster.webp`（q≈85，宽边 ≤ 2400）覆盖现文件。Grok 不得用旧版海报、不得用 AI 重画、不得截图放大充数。

---

## 0. 诊断（对照 Hao 三条）

### 0.1 「封面没有把海报元素真正结合好」

| 现状证据（HEAD `3cf44a2`） | 位置 | 根因 |
|---|---|---|
| 门页阅读层只有 `00 · 门前` 10px eyebrow、`走进 HTML+`（1440 宽下 73.6px、字重 400、白色）、一句 lede、一个 107×34 的细边 pill 按钮。海报自己的标题是重字重、带柔光的展示体，课程层的字是细的 Kage 式 sans。两套字并排出现，没有母子关系 | `.door-mark` L1546–1554；`.door-hero-top` L1513 | 阅读层的排版是从 Kage 借来的，不是从海报拆出来的 |
| `.door-peek` 在右下 (1154, 641) 画了一个 200×133 的 CSS 窗口线框，与海报正中已有的窗口重复；两扇窗口无任何关系（不同比例、不同位置、不同文案） | `.door-peek` L1448–1460；标记 L2383–2389 | 「窗口 chrome」被当成装饰角标，而不是从海报里提出的可复用元件 |
| `\ HTML+ /` 斜杠标只有 10px、alpha .36，在 1440 宽下位于 (1284, 795)，与海报标题上真正的斜杠（贴着「工作表达新方式」两侧、与字同高）没有尺度关系 | `.door-slash` L1491–1501 | 斜杠没有被当成排版符号，而是当成小字标签 |
| 左右竖排 `POIZON DESIGN` / `OPEN CLASS`（L2369–2374）与海报顶部已印的 `POIZON DESIGN` / `OPEN CLASS` 双份出现 | `.door-side` L1612–1632 | 没有先盘点海报已有什么，再决定层里补什么 |
| 「点阵手」只以整图形式存在。滚动视差里手与字母、窗口、标题是同一张贴图同速运动（`door-mid` 一层 -4%）；`door-near` 层里只有 4 个 22px 角标与假窗口 | `.door-near` L1404、L1686–1689 | 没有任何切层：海报是一张壁纸，不是一套图层 |
| `Approach` 手写、得物方标只在海报像素里；课堂 HUD、章首、结课都没有它们的回响 | 全文无 `approach` 节点；方标只有 `.brand-slot`（L2343）探测 `assets/poizon/logo/`，文件未落盘所以从不显示 | 母本元件没有被拆成 token / 组件 |
| 手机 390：海报 `object-position: 58% 8%` + `scale(1.42)`，两只手全部裁掉，只剩字母和被裁半的标题 | L2253–2256（门页复用 `.door-still` 默认 `center 46%`） | 手机没有独立机位，靠放大把手裁掉换可读性 |

**结论：门页把海报当成一张好看的背景图，又在上面叠了一套与海报无关的 Kage 式 HUD。**修法不是再加元素，而是把海报拆成 6 个元件（点阵手 / 窗口 chrome / 斜杠 / Approach / 得物方标 / 黑场噪点），让课程层用这 6 个元件说话。

### 0.2 「内页仍偏 Klein 蓝模块感，没有 three.js / Kage 的分层与空间感」

| 现状证据 | 位置 | 根因 |
|---|---|---|
| 实心 Klein 填充 14 处（`::selection` 不计）：`.vs .new`、`.roles button.is-on`、`.rows li:last-child`、`.check.is-on / .is-stop`、`.tee-tools .is-on`、`.nono.is-on`、`.tl-btns .is-on`、`.sum3 .who`、`.toast`、`.notes-btn.is-on`、手机端 `.page.cover.is-on` / `.main:has(.cover.is-on)` 整页 Klein 底，另 `.klein-bar`（L445）与 `.dots .is-on`（L1296）两条实心规则被后文覆盖成死规则；Klein 洗 5 处（`.pick.is-on` .42、`.compare .is-html` .42、`.beats4 .is-on` .42、`.rows / .who` .48、`.klein-bar` .55） | L445、588、744、852、868、1050、1111、1184、1209、1296、1346、1737、1820、1824；L500、640、889、2183、2186 | 「选中 = 填满 Klein」是唯一的状态语言；P04 / P11 / P13 一屏最多同时出现 2–3 块实心蓝 |
| 9 个选择器共用同一张「卡」：`rgba(7,9,13,.28)` + 1px 白边 + `blur(8px)` + 8px 圆角（`.card, .pick, .job, .scene, .dim, .door, .task, .check, .flow-step`）。P02 四卡、P04 六卡、P07 四卡、P09 四卡、P12 三门、P18 三卡 = 卡片墙 | L462–468 | 内容层没有「字压在画面上」的形态，只有「字装在卡里」 |
| 场景层只有 1 张位图 + 3 个渐变：`.scene-mid`（海报 `scale(1.06)`，全 20 页同一机位，实测 1526×954 @ (-43,-27) 不变）、`.scene-wash`、`.scene-vignette`、`.scene-grain`。指针视差把 wash（渐变）也位移 -16px——渐变位移肉眼不可见，所以实际只有「海报 / 文字」两层 | L1957–2011；L3630–3640 | 层栈有名无实：没有中景物、没有近景物 |
| 章首标题全部落在海报窗口文案上（1440×900 实测）：P01 `h1` 268–1164 × 284–412；P03 `.gold` y 385–483；P06 y 319–417；P12 y 293–342；海报窗口 x 447–1001 × y 260–555。四个章首都是「字压字」 | P01 / P03 / P06 / P12 | 机位固定，文案安全区没有随海报构图设计 |
| 章过渡 = 暗场 .72 380ms → 11px 章标 → `.page-fore` 从 (-28, 18) 滑入。背景在过渡前后完全一样，观众感知不到「换了地方」 | `go()` L2969–3003；`.scene-mark` L2022–2040 | 过渡只做了前景，底景没有机位变化 |
| 手机 390：`.scene-wash` .94–.96 `!important`，`.page-fore` 底 .94 + 阴影。海报只剩一片深灰，P03 截图就是一张黑卡 | L2252–2281 | 手机把「可读」做成了「盖掉」 |

**结论：Klein 的问题是「用法」不是「颜色」——它被当成状态填充与整页底色；分层的问题是「层里没有东西」——三层都是同一张贴图或看不见的渐变。**

### 0.3 「以海报为母本延展手的质感 × 日系分层 × 课程内容为主 × 互动感」

| 现状证据 | 根因 |
|---|---|
| 「手」在 20 页里 0 次以独立元件出现；所有页共用同一机位，手永远在同一位置、同一亮度，讲到 P11 时观众已经看不见它 | 没有密度规划 |
| Kage 借到的只有：短距滚动、grain、vignette、竖排小字、ring cursor。没借到的是 Kage 真正的空间感来源：**巨型字母作为中景并随滚动位移**、**前景剪影（草、松）从边缘压住字母与文字**、**窄栏排版留出大面积空白** | 借了「氛围层」，没借「物层」 |
| 互动是有的（P02 跳章、P04 岗位卡、P07 身份、P09 场景、P10 单选、P11 自检、P13 拖、P14 比、P15 三键、P18 选题、P19 复制），但全部发生在卡片里，跟场景没有任何关系；点了任何东西，背景、手、窗口都不动 | 互动与场景两套系统 |
| POIZON 案例包一张图也没落盘（`assets/poizon/**/.gitkeep`），P13 三个 pane「待补」、P14 九格无图。这是事实而不是缺陷，但结构上只把静帧当「填格子」，没有当「场景纹理」 | 素材接入只想了一层 |

---

## 1. 视觉母系统（从海报延展）

### 1.1 Token（新增 / 改用法；改 `:root` L8–54，同步 `DESIGN.md`）

| Token | 值 | 用法 | 禁止 |
|---|---|---|---|
| `--bg` 黑场 | `#07090d`（不变） | 页底、门页垫底、veil | — |
| `--bone` 骨白 | `#ece9e2` | 展示标题（`.door-mark` / `.gold` / `.scene-mark` / 章号）、窗口线框、点阵、斜杠 | 不做正文（正文仍 `--text` `#f5f7fa` / `--soft`） |
| `--bone-soft` | `rgba(236,233,226,.72)` | 副文、`.win-bar` 图标 | — |
| `--bone-line` | `rgba(236,233,226,.34)` | 窗口边、卡片底线、章首细线（替代 `--chrome` .38 白） | — |
| `--klein` | `#002FA7`（不变） | **只剩三种用法**：① 2px 左侧强调条 / 箭头 / 下划线；② 选中态**描边** `1px solid var(--klein-on-dark)` + 文字 `--klein-on-dark`；③ 主 CTA 一处（门页「进入课堂」箭头 + P19 复制按钮箭头） | 任何面积 ≥ 一张卡 25% 的填充；整章封面底；`.toast` 底；手机整页底 |
| `--klein-wash` | `rgba(0,47,167,.18)` | 选中态**最大**允许填充（`.pick.is-on` 等 .42 全部降到 ≤ .18） | > .18 |
| `--aurora` 极光青 | `#01c2c3`（不变） | 2px tick / 进度 / eyebrow 圆点 / **Approach 手写**（海报里 Approach 就是这个青）/ 提示词 `【谁】【什么事】` 下划线 | 正文、标题、填充 |
| `--dots` 点阵 | `radial-gradient(circle, rgba(236,233,226,.62) 0 .55px, transparent .95px)`，`background-size: 3px 3px` | hover 填充、`.watermark` 章号填充、进度轨、章首边缘渐隐；配合 `mask-image` 做点阵渐出 | 大面积铺满；正文底 |
| `--grain-a` | `.055`（门页）/ `.05`（课堂）不变 | `canvas toDataURL` 现法保留 | 不换成图片 |
| `--vig` | `radial-gradient(120% 90% at 50% 42%, transparent 38%, rgba(7,9,13,.62) 100%)` 不变 | | |
| `--display-weight` | `700` | 章首 `.gold`、`.door-mark`、`.scene-mark` | 讲解页 `h2` 仍 400–500 |
| `--display-glow` | `0 0 22px rgba(236,233,226,.22)` | 只随 `--display-weight` 出现 | 讲解页、正文 |

> `--display-weight: 700` 是本简报**唯一的审美改向**（DESIGN.md 现写 400、去 glow）。理由：海报标题就是重字重 + 柔光，章首要「像海报的下一页」而不是「像 Kage 的下一屏」。若 Hao 不点头，回退为 500 + 无 glow，其余不受影响。批次 I 在 PR 里单列此项。

### 1.2 从海报拆出的 6 个可复用元件

母本坐标（按附件 1 比例量取，单位 % 帧宽 × % 帧高，Grok 落盘后用实际文件重新量一遍并把终值写进 `DESIGN.md`）：

| 元件 | 母本位置 | 首选来源 | 无分层文件时的 CSS 近似 | 用在 |
|---|---|---|---|---|
| **点阵手 · 左** | 从 (0, 100) 伸到指尖约 (39, 66) | `poster/hand-left.png`（带 alpha，Hao 导出） | **同图裁切 + `mix-blend-mode: screen`**：手是白点、底是近黑，screen 混合到黑场时黑底自动消失，等价于免费的 alpha；容器 `overflow:hidden` + `mask-image: radial-gradient(… #000 55%, transparent 100%)` 羽化边缘；`filter: contrast(1.15) brightness(1.05)` 压住底噪 | 门页（海报本体）、章首单手、案例场指尖 |
| **点阵手 · 右** | 从 (100, 100) 伸到指尖约 (62, 75) | `poster/hand-right.png` | 同上 | 同上，与左手交替 |
| **窗口 chrome** | (36–64, 60–87)，标题栏右侧 `— ☐ ✕`，1px 骨白线、几乎无圆角、内部透明 | `poster/window.svg`（可选） | 组件 `.win`：`border:1px solid var(--bone-line); border-radius:2px; background:rgba(7,9,13,.22)`；`.win-bar` 22px、底线、右对齐三图标（现 `.door-chrome-bar` L1461–1490 已有画法，抽成通用类） | P07 `.demo`、P13–15 `.device`、P19 `.prompt`、`.notes` 面板、门页 CTA 目标、P12 三门 |
| **斜杠** | 贴着「工作表达新方式」两侧，细、与字同高 | — | `.sl::before{content:"\\ "} .sl::after{content:" /"}`，字重 300、`opacity:.7`、与宿主同字号 | `.scene-mark` 章标（`\ 01 什么是 HTML /`）、章首 `.ch-no`、门页 eyebrow；**不**用在讲解页 kicker |
| **Approach 手写** | (62–79, 50–60)，极光青 | `poster/approach.svg`（Hao 导出路径） | 同图裁切 + screen（青在黑上同样可 screen） | **≤ 3 处**：门页（海报本体）、P12 章首章标右侧 28px 高、P20 结课右下 |
| **得物方标** | (45–55, 11–22)，白线圆角方 + `POIZON` | `assets/poizon/logo/poizon.svg`（`brand-slot` 已探测此路径） | 同图裁切 + screen | rail 顶部 20px（`.rail-brand` 上方）、P20 顶部居中 alpha .6；**不**在每页出现 |

素材存在性一律用现有 `probeAsset()`（L3564–3570）探测：有分层文件用分层文件，没有就用同图裁切；两者都没有（母本未落盘）就**不渲染**，绝不用旧版海报的手冒充。

同图裁切的写法示意（不是代码交付，是约束）：

```css
.cut { position:absolute; overflow:hidden; pointer-events:none; mix-blend-mode:screen; will-change:transform; }
.cut > img { position:absolute; width:var(--pw); left:var(--px); top:var(--py); }  /* 同一张 cover-poster.webp，浏览器只解码一次 */
.cut { mask-image: radial-gradient(60% 60% at var(--mx) var(--my), #000 55%, transparent 100%); }
```

每页 `.cut` ≤ 3 个；`--pw/--px/--py/--mx/--my` 六个机位各一组，写成 `[data-ch]` 变量，不写死像素。

### 1.3 「手的质感」密度表

| 页型 | 页 | 手的出现 | 亮度 / 面积上限 | 说明 |
|---|---|---|---|---|
| 门页 | 门前 | 两只手（海报本体）+ 近景层 1–2 个指尖 `.cut` 随滚动 -16% 上移 | 100% / 海报原样 | 手「伸进」窗口是门页唯一的动态 |
| 开场封面 | P01 | 海报机位上移，手退到下缘只露指尖两个 `.cut` | .7 / 各 ≤ 22% 宽 | 课名接管海报标题位（见 2.3） |
| 章首 | P03 / P06 / P08 / P12 / P17 | **单手**，左右交替（P03 左、P06 右、P08 左、P12 右、P17 左），从对应下角伸入，指尖指向章标或第一行 | .6 / ≤ 30% 帧面积 | 每章一只、位置不同，观众才知道「换章了」 |
| 讲解页 | P02 / P04 / P05 / P07 / P09–P11 / P16 / P18 / P19 | **无手** | 0 | 底景只留字母微光；这是「课程内容为主」的落地 |
| 案例场 | P13 / P14 / P15 | 一个指尖 `.cut` 贴在预览框外侧边缘（P13 左侧、P14 右侧、P15 左侧），像在「点」预览 | .5 / ≤ 15% 帧面积 | 不进 3:2 框内，不压四拍 |
| 结课 | P20 | 两只手回来（呼应门页），机位回全图 | .55 | 唯一允许双手的内页 |

「不要每页满手」= 20 页里手出现 10 页，其中 4 页（P01 / P13 / P14 / P15）只是指尖。

---

## 2. 空间分层（日系建筑分层 × Kage 层栈，无 Three）

### 2.1 从 Kage 借什么 / 不借什么

| 借（气质与结构） | 不借（禁止） |
|---|---|
| 巨型字母做**中景**，随滚动 / 换章位移，被前景压住一角 | 朱红 / 寺庙 / 月亮 / 枫叶 / 山门文案 |
| 前景剪影（Kage 是草与松，我们是**点阵手与窗口线框**）从下缘、侧缘压住字母与文案边 | Three.js / WebGL / PlayCanvas / 任何 runtime |
| 窄栏排版 + 大面积留黑；标题左、段落右 | 五章叙事、长卷轴、4200vh |
| 竖排小字（已有 `.page-side`） | 巨大自定义光标、音频、PNG 素材库 |
| 章数字 01–04 当进度（我们已有 dock dots + rail） | 「SCROLL TO ENTER」式整站 landing |

### 2.2 z 阶梯（替换 `.scene-root` L1957–2011 的四层）

| z | 层 | 节点 | 内容 | 指针视差（桌面，px @ ±0.5） | 章过渡时 |
|---|---|---|---|---|---|
| 0 | 底景 far | `.scene-far > img` | 母本整图，按 `[data-ch]` 机位 `translate/scale`；讲解页 `brightness(.5)`，章首 `.7` | 4 | 900ms 换机位 |
| 1 | 中景 mid | `.scene-mid` | ① 母本字母区 `.cut`（screen）；② 案例场若 `assets/poizon/box/texture.webp` 等存在，换成该纹理 `soft-light` `.18`（见批次 L） | 8 | 随机位 |
| 2 | 洗 wash | `.scene-wash` | `open / talk / case` 三套渐变**不再位移**（L3636 删） | 0 | 640ms 换色 |
| 10 | 前景文案 | `.page-fore` | 窄栏标题 / 短句 / 细线互动 | 14 | 720ms 入场 |
| 20 | 近景 cut-out | `.scene-near > .cut` | 点阵手 / 指尖 / Approach / 方标（按 1.3 密度表） | 24（最近，动最多） | 900ms 从角入，延迟 120ms |
| 55 | vignette | 不变 | | 0 | |
| 60 | grain | 不变 | | 0 | |
| 70 | HUD | rail / dock / hud / `.page-side` / `.notes` | 细描边，不铺实心底 | 0 | |

三层视差可读的判据：桌面指针从左到右扫一遍，far 动 8px、fore 动 28px、near 动 48px，肉眼能分出三个速度。现状 mid -10 / wash -16（看不见）/ fore -22 只能分出一个。

### 2.3 六机位（同一张母本，六个「摄影机」）

机位写成 `.scene-root[data-ch="n"] { --cam-x --cam-y --cam-s }`，`applyPage()`（L2943）已经写 `dataset.scene`，同处再写 `dataset.ch`。坐标是母本 % 位置（`object-position` 语义），Grok 按实际文件校正后落进 `DESIGN.md`。

| ch | 页 | 机位 | 看到什么 | 文案安全区 | 近景 |
|---|---|---|---|---|---|
| 0 | P01–P02 | `50% 100%`，`scale 1.25` | 母本**上半**：字母 + 得物方标；海报标题与窗口落到帧外 | 中央 x 22–78%（**课名接管海报标题位**，同字重、同位置） | 两个指尖从下角 |
| 1 | P03–P05 | `12% 78%`，`scale 1.6` | 左手大、字母在后 | 右 55%：x 42–92% | 无（手已在底景）；P03 章首再叠一个左指尖 `.cut` 靠近章标 |
| 2 | P06–P07 | `50% 75%`，`scale 1.5` | 窗口线框居中偏下 | P06 金句在窗口上方 y 18–48%；P07 `.demo.win` 与底景窗口同宽对齐（±4%） | 右指尖 |
| 3 | P08–P11 | `88% 78%`，`scale 1.6` | 右手大 | 左 55%：x 6–56% | 左指尖 |
| 4 | P12–P16 | `50% 20%`，`scale 1.3` | 字母 + 方标，wash `case` 右侧更透 | 左 36% 文案，右 64% 预览（现有栅格） | 一个指尖贴预览边 |
| 5 | P17–P20 | `50% 50%`，`scale 1.1` | 全图回归，`brightness .6` | P17 / P19 左栏；P20 居中 | P20 双手回归 |

普通页在章内**不换机位**，只换 wash；这样机位变化 = 章变化，观众用余光就能记住「现在第几章」。

### 2.4 章过渡（改 `go()` L2969–3003 时序，不改页序）

```text
t0      前页 .is-leave（现有）
t0      veil .72 起（380ms，现有）
t0+80   far / mid 开始换机位（900ms，cubic-bezier(.16,1,.3,1)）
t0+120  .scene-mark 出现：`\ 01 什么是 HTML /`，--bone，--display-weight，18px（现 11px），letter-spacing .28em
t0+380  applyPage()；veil 退（现有）
t0+380  .page-fore 从左下入场 720ms（现有）
t0+500  .scene-near .cut 从对应角入场 900ms
t0+900  .scene-mark 退
```

规则：过渡中**背景任何时刻都不是纯色**（veil 最深 .72，母本仍透出）；`prefers-reduced-motion` 下机位瞬切、无 veil、无 near 入场（现有分支保留）；手机端机位切换保留但 near 不出现。

### 2.5 前景互动穿插（哪些页允许近景参与，怎么不抢课）

| 允许 | 页 | 行为 | 不允许 |
|---|---|---|---|
| 指针视差 | 所有桌面页 | near 24px、fore 14px、far 4px | 跟随指针的「磁吸手」 |
| 状态联动（手回应内容，不回应点击） | P07 点「接收操作」→ 右指尖朝身份按钮位移 12px 后回弹；P12 hover 三门 → 指尖在三门间三档位移；P13 拖 T恤 → 指尖跟随 ±6px | 手成为点击目标；手挡住任何可点元素 |
| 近景可点 | 门页：**窗口即门**——透明 `<button>` 覆盖母本窗口矩形，hover 骨白描边 + 标题栏图标微亮，底边居中 tracked 文字「进入课堂 →」（替代左下 pill）；P12 三门改 `.win`（本来就可点） | 章首金句、P01 课名、P20 结课句附近任何可点近景 |
| 窗口 chrome 参与内容 | P07 `.demo.win` 的 `.win-bar` 随四动作点亮：01 整框描边闪、02 身份行、03 按钮脉冲、04 `#next-step`（批次 B 逻辑保留，只换外壳） | 在窗口栏里塞新文案 |

「不抢课」的硬指标：任何近景元素 `pointer-events: none`（门页窗口按钮、P12 三门除外）；近景与 `.page-fore` 的重叠面积 ≤ 8%（用 `getBoundingClientRect` 交集量）；讲解页 near 为空。

---

## 3. 课程优先的互动增强（演绎感）

前提：不改 7 条冻结句、不改 20 页顺序、不改四动作词、不改 `data-note`（新互动必须在现有「操作」段之外也能讲完；若确需写进讲稿，PR 单列「待 Hao 确认」）。每个互动都要能回答「它演的是四动作里的哪一个」；答不上来就不做。

| 级 | 页 | 互动 | 演的是 | 改什么（只做结构与样式，不写新长文案） | 微文案上限 |
|---|---|---|---|---|---|
| P0 | P07 | `.demo` → `.win`；四动作卡点亮窗口对应区；「接收操作」时右指尖位移 | 四个动作各一 | `.demo` 加 `.win` 外壳；`data-act` 四态映射到 `.win-bar` / `.roles` / `#next-step` 的 class；near 指尖 `--nudge` 变量 | 0 |
| P0 | P13 / P14 / P15 | **四拍点亮预览**：「原来」→ 预览灰阶 `filter:grayscale(1) opacity(.7)`；「旧形式不够」→ 预览边框出现斜杠 `\ /` 划掉态；「多了哪个动作」→ 工具键 / 九格 / 三键脉冲；「交付给谁」→ `.win-bar` 左侧显示该拍 `h3` 文字（复用已有字，不新写） | 装下 → 组织 → 接收 → 给出 | `[data-beats] button` 已有单选逻辑，新增 `data-beat-state` 到 `.device` | 0 |
| P0 | P05 | HTML 那列加一个 `.win` 小窗，内含一个开关：点前显示 `.use` 原文「内容随操作变化」，点后同一行换成 `.more` 原文「别人自己看、自己选、自己走下一步。」——这页本身就在证明这句话 | 接收操作 + 给出回应 | 只复用该 article 已有两句，加一个 28px 高的切换按钮 | 「点一下」4 字 |
| P1 | P19 | 提示词里 `【谁】【什么事】` 用 `<span class="slot">` 包住加极光青下划线；若 P18 已选任务，`.copy-row` 上方多一行 `.job-out` 预览 `data-hint` 原文 | 组织信息 + 给出回应 | `#prompt.textContent` 必须与 §5.3 第 6 条逐字一致；复制仍走 `FROZEN.prompt` 常量；跨页状态用内存变量，不入 `localStorage` | 0 |
| P1 | P02 | hover 四卡 → rail 对应章 `.ch` 预亮 | 组织信息 | `data-jump` 已有，加 `mouseenter` 映射 | 0 |
| P1 | P12 | 三门 → 三扇 `.win`，hover 时指尖三档位移 | 接收操作 | `.door` 外壳换 `.win`，`.go` 保留 | 0 |
| P1 | P09 | 点开一张时其余三张退到点阵 hover 态（不再灰掉整卡） | 组织信息 | `.scene:not(.is-on)` 用 `--dots` mask 渐隐 | 0 |
| P2 | P16 | hover 三行任一 → 行内「多了哪个动作」里的动作词加极光青下划线 | 复习四动作 | 用 `<u>` 已有样式 | 0 |
| P2 | P20 | 双手回归 + 指针视差；无点击 | — | near 双 `.cut` | 0 |
| P2 | 全局 | ring cursor 改点阵小圈（`--dots` 描边） | 质感统一 | `.ring` L2194–2242 | 0 |

不做的（旧简报 §5.1 之外新增）：不做拖拽排序、不做计分、不做「展览式」全屏手动画、不做每页入场都动手；P01 / P03 / P06 / P08 / P17 章首**只有视差**，没有可点。

---

## 4. 批次拆解（给 Grok 4.6）

每批一个主题、一个 commit（标题 `HTML+ 批次X：<主题>`）、一次 PR 更新；做完跑第 6 节对应项；**不跨批带工作，不碰冻结句**。批次顺序 I → J → K → L → M；J 依赖 I 的 token 与 `.win`，K 依赖 J 的 near 层，L 独立可并行但建议在 K 后，M 收口。

### 批次 I · 海报元件系统 + 内页去蓝模块（P0）

范围文件：`index.html`（`:root` L8–54；卡片 L462–530；Klein 填充 13 + 5 处；门页 CSS L1360–1720 与标记 L2344–2398；手机 `.klein-field` L1814–1830）；`DESIGN.md`（token 表、门页规则）；`ASSETS.md`（新增 `poster/` 行）。
做什么：
1. 落 §1.1 token；`--display-weight` 与 glow 按 §1.1 注做成可回退。
2. 抽 `.win` / `.win-bar` / `.sl` / `--dots` 四个通用元件；`.door-peek` 删除，`.door-chrome-bar` 并入 `.win-bar`。
3. 14 处实心 Klein → 描边 + `--klein-on-dark` 字（两条死规则直接删）；5 处 Klein 洗 → ≤ `--klein-wash`；手机 `.page.cover.is-on` / `.main:has(.cover.is-on)` Klein 底删除；`.toast` 改 `.win` 黑底骨白字。
4. 9 选择器卡片：讲解页去 `blur` 与填充，改「字 + 1px `--bone-line` 底线 + tag」；hover = `--dots` 填充；选中 = 2px Klein 左条 + 骨白字。`.device` / `.demo` / `.prompt` 换 `.win`。
5. 门页：删竖排 `.door-side`（海报已印）、删 `.door-slash` 小标，eyebrow 改 `.sl`；`.door-mark` 用 `--bone` + `--display-weight`；**窗口即门**（§2.5）；手机机位改 `50% 60%` 不再裁掉两手（母本落盘后校）。
6. 若母本已落盘：替换 `cover-poster.webp`；未落盘：其余全部照做，PR 标「门页机位待母本」。
成功标准：
- `grep -c "background: var(--klein)"` = 1（只剩 `::selection`）；`rgba(0, ?47, ?167` 出现的 alpha 全部 ≤ .18。
- 1440×900 下 P04 / P11 / P13 一屏内没有任何一块面积 > 8000px² 的蓝色填充。
- P02 / P04 / P07 / P09 / P12 / P18 不再出现 `backdrop-filter` 卡；文字直接压在画面上，hover 有点阵。
- 门页：只有一套 `POIZON DESIGN / OPEN CLASS`（海报的）；无 CSS 假窗口；点海报窗口矩形或按 Enter / 空格进入 P01；390 宽下两只手至少各露出一段前臂。
- 冻结句 7 条 `grep -c -F` 各 ≥ 1 且逐字一致；`data-frozen` 6 个不变。
禁止项：不改 `data-note`、不改页序、不加页；不引入字体 / 图标；不用旧版海报做切层；不改 `go()` 时序（那是 J）。
风险：`.check.is-stop` 常亮态失去实心蓝后要靠 2px 条 + 骨白字维持「第三条最重」；`.klein-bar` 降到 .18 后文字对比要 ≥ 4.5:1（必要时底加 `rgba(7,9,13,.55)`）；`mix-blend-mode` 在 Safari 上与 `backdrop-filter` 同层会失效——本批已去 blur，顺带解决。

### 批次 J · 章首空间分层 + 六机位 + 过渡（P0）

范围文件：`index.html`（`.scene-root` L1957–2040 与标记 L2332–2341；`applyPage()` / `go()` L2943–3003；指针视差 L3630–3640；手机 L2252–2320）；`DESIGN.md`（机位表终值）。
做什么：
1. `.scene-root` 拆成 §2.2 五层（far / mid / wash / near / 氛围），near 先留空容器。
2. `[data-ch]` 六机位变量 + 900ms 换机位；`applyPage()` 写 `dataset.ch`。
3. `.scene-mark` 改 `.sl` 骨白 18px；过渡时序按 §2.4；wash 不再位移。
4. 指针视差改 far 4 / mid 8 / fore 14 / near 24。
5. 手机：wash 上限 .8（去 `!important`），`.page-fore` 底 ≤ .78 + 1px 边，让母本在每页至少透出 20% 亮度；机位切换保留。
6. 讲解页底景 `brightness(.5)`，章首 `.7`。
成功标准：
- 1440×900 实测：P01 / P03 / P06 / P12 标题矩形与母本窗口矩形（按机位换算）交集为 0。
- 换章（P02→P03、P05→P06、P07→P08、P11→P12、P16→P17）时能看到底景明显移动或缩放（far 位移 ≥ 6% 帧宽）；同章翻页底景不动。
- 指针从左到右扫过：far / fore 位移之比 ≈ 1 : 3.5；三层可读。
- 手机 P03 截图能看到母本字母或手，不再是黑卡。
- `prefers-reduced-motion` 下无 veil、无位移、静态可读。
禁止项：不在 near 放任何东西（那是 K）；不改互动逻辑；不改机位以外的文案位置（除为避让窗口而调 `max-width` / 对齐）。
风险：机位放大 1.6 后母本 1536 宽在 1920 屏会软——母本建议 ≥ 2400 宽落盘；`transform` 换机位与 `pointermove` 视差同时写 `transform` 会互相覆盖，far 用两层包裹（外层机位、内层视差）。

### 批次 K · 前景手 / 窗 cut-out 与轻互动（P1）

范围文件：`index.html`（`.scene-near`；`probeAsset` 复用；P05 / P07 / P12 / P13–15 / P19 对应块；ring L2194–2242）；`ASSETS.md`（`poster/hand-left.png` 等可选分层行）。
做什么：
1. `.cut` 组件 + 同图 screen 裁切；探测 `poster/hand-left.png` / `hand-right.png` / `approach.svg`，有则用，无则裁切，母本未落盘则不渲染。
2. 按 §1.3 密度表铺近景：门页 2 指尖、P01 2 指尖、5 章首各 1 手、3 案例场各 1 指尖、P20 双手；讲解页无。
3. §3 表 P0 三项（P07 窗口点亮 + 指尖位移、P13–15 四拍点亮、P05 小窗开关）与 P1 四项（P19 slot、P02 hover、P12 三门、P09 点阵退隐）。
4. ring 点阵化（P2，可选）。
成功标准：
- 20 页里 near 非空的页恰好 10 页（门页另计）；讲解页 `.scene-near` 子节点 = 0。
- 任一近景与 `.page-fore` 交集 ≤ 8% 帧面积；近景 `pointer-events: none`。
- P07 依次点四动作，窗口四区各亮一次，指尖在 03 时位移并回弹；P13 点「原来」预览变灰、点「多了哪个动作」工具键脉冲。
- P05 点开关，两句在同一行切换，页面其他不变。
- P19 `#prompt.textContent === FROZEN.prompt`；复制结果与 §5.3 第 6 条逐字一致；P18 选题后 P19 出现预览行，刷新后消失。
- 微文案新增总计 ≤ 4 字（「点一下」）。
禁止项：不改 `data-note`；手不可点；不加拖拽 / 计分 / 全屏手动画；不用 AI 生成的手图；`Approach` 不用任何 web font。
风险：`mix-blend-mode: screen` 让母本底噪微微提亮黑场，用 mask 羽化 + `contrast(1.15)` 压；多 `.cut` 共用一张 `<img>` 但各自 `transform` → 用 `will-change` 且每页 ≤ 3；P13 拖动与指尖跟随共享 `pointermove`，要节流到 rAF。

### 批次 L · 案例场真素材静帧接入结构（P1，素材未到也可做完）

范围文件：`index.html`（P13–15 `.device` 内部、`.scene-mid` 案例分支、`probeAsset` 列表）；`ASSETS.md`；`assets/poizon/README.md`。
做什么（全部「文件存在才显示」，否则「待补」）：
1. 纹理入场：`assets/poizon/box/texture.webp` 存在 → ch4 `.scene-mid` 改用它 `soft-light .18` 做中景（海报字母退到 far）；`cup / anti / preview.webp` 存在 → 各自 pane 用 `object-fit: cover` + `.win` 框；`motion/frame.webp` → P15 `.fake-page` 底（现有）。
2. 贴花合成：`decal/mark.png / decal.png / hangtag.png` → `.shirt-skin`（现有）+ 切换时 `.win-bar` 左侧显示当前贴花名（复用按钮文字）。
3. NONO：`nono/01–09.webp` → 九格底（现有）+ 选中两款后对比卡两侧各放缩略（`background-image` 复用）。
4. 静帧规格写进 `assets/poizon/README.md`：宽边 ≤ 1600、webp q≈80、每案例 ≤ 6 张、总量 ≤ 3MB；**禁止** `.glb` / wasm / `build/` / 播放器脚本 / 视频自动播放。
5. `ASSETS.md` 表增加「场景用途」列（pane / 中景纹理 / 缩略）。
成功标准：
- 无素材时 P13–15 与批次 K 结束时逐像素一致（除 `.win-bar` 文字）；有素材时对应槽位出图、无「待补」。
- 放入任意一张 `box/texture.webp` 后 P13 中景变为该纹理且文案对比度仍 ≥ 4.5:1。
- `assets/poizon/` 内没有任何 `.js / .wasm / .glb / .json / .mp4`。
禁止项：不从网上找图、不用海报裁块冒充产品、不写产品材质描述、不改三案四拍文案、`AI Coding` 两句仍待 Hao。
风险：真实静帧色温与黑场母本冲突 → 统一 `filter: saturate(.85) brightness(.9)` 进场景，pane 内原色。

### 批次 M · 手机 / reduced-motion 收口 + 验收（P2）

范围文件：`index.html`（`@media (max-width: 979px)` 两处、`prefers-reduced-motion` 三处）；`README.md`（快捷键、机位说明）；新增 `QA-SCENE-5.1.md`。
做什么：手机三层减配（far 机位 + wash ≤ .8 + 无 near；P20 允许一个指尖）；reduced-motion 全静态；跑第 6 节 24 项；截图门页 / P01 / P03 / P07 / P13 / P20 桌面 + 390 附 PR。
成功标准：第 6 节全勾；390 宽 20 页无横滚、底部固定区 ≤ 96px、`.page-fore` 不再是 .94 实心卡。
禁止项：不趁收口改任何前批视觉决定；有争议写「待 Hao 确认」。

---

## 5. 防跑偏守则

### 5.1 继承（旧 `OPTIMIZATION-5.1.md` §5 全文有效）
- §5.1 Grok 不得发明：不加页、不删页、不改页序与 `chStarts`、不切主题、不改课名副标题章名、不加 IP / 角色 / 跟随指针角色 / 迈步帧、不编案例事实、不把课的主轴改成任何工具或供应商。
- §5.2 台上禁词：`Cursor` `Vite` `React` `vibe coding` `Html大法` `一份HTML N种形态` `三招` `PlayCanvas`；`HyperFrames` 只在 `.hf`；工具入口只有 **蓝龙虾**；品牌英文只有 **POIZON**。
- §5.3 冻结句 7 条逐字；`data-frozen`；复制永远从常量。
- §5.4 案例填充规则；§5.5 门前照片规则（现已由海报规则取代：**只接受 Hao 母本**）；§5.6 交付方式。

### 5.2 本轮新增
- **禁 Three.js / WebGL / PlayCanvas / 任何 3D 或播放器 runtime**；不引入 npm、构建工具、字体 CDN、`@font-face`、图标库。`Approach` 手写只能是 Hao 导出的 SVG 或同图裁切。
- **禁整页朱红寺庙抄袭**：不用 Kage 的配色（朱红 / 墨绿 / 血月）、不用寺庙 / 山门 / 枫叶 / 月亮任何意象、不用其五章文案结构、不做 4200vh 长卷。只借 §2.1 左列。
- **Klein 用法**：可留作按钮强调（2px 条 / 箭头 / 描边 / ≤ .18 洗），**不得再当整章封面纯色底、手机整页底、`.toast` 底、任何 > 卡面 25% 的填充**。
- **海报规则**：门页与课堂底景只能是 Hao 母本整图；不得用旧版「捏窗」海报做切层去冒充母本的手；不得用 CSS 仿海报当主视觉；不得用 AI 重画手。
- **手不可点**、手不进讲解页、每页 `.cut` ≤ 3。
- **互动不新写长文案**：新增微文案全课 ≤ 4 字；`data-note` 不改；跨页状态不入 `localStorage`。
- **DESIGN.md 同步**：token 与机位终值每批写回，`index.html` 与 `DESIGN.md` 不一致视为该批未完成。
- 任何「要不要」的犹豫，答案是不做，写进 PR「待 Hao 确认」。本简报已知需 Hao 点头的两项：`--display-weight: 700`（§1.1）、`AI Coding` 两句（旧 §P1-6）。

---

## 6. 验收清单（主讲视角）

打开方式：双击 `index.html`，Chrome / Edge / Safari，`file://`，无网络。1440×900 与 390×844 各过一遍。

**门页一眼是海报母本延展**
- [ ] 底景是 Hao 母本（双手从下角相触、得物方标居中顶部、窗口在下 1/3），不是「捏窗」旧版。
- [ ] 屏上只有一套 `POIZON DESIGN / OPEN CLASS`、一扇窗口、一个得物方标（全是海报的）。
- [ ] 课程层只加了：`\ 00 · 门前 /` eyebrow、骨白重字重 `走进 HTML+`、一句 lede、窗口底边「进入课堂 →」、右侧下滑 cue；字重与海报标题同族。
- [ ] 轻滚时手与窗口比字母动得多；点窗口 / Enter / 空格一步到 P01。
- [ ] 390 宽下两只手都在，窗口可点，文案不压海报标题。

**内页不再「蓝卡片墙」**
- [ ] 全课 `background: var(--klein)` = 0；任一屏没有 > 卡面 25% 的蓝填充；章首无纯色底。
- [ ] P02 / P04 / P07 / P09 / P12 / P18 文字直接压在画面上，hover 是点阵不是蓝块；选中是 2px 条 + 骨白字。
- [ ] P07 `.demo`、P13–15 `.device`、P19 `.prompt`、讲稿面板都是同一种窗口 chrome（`— ☐ ✕`）。
- [ ] 极光青只在：tick / 进度 / eyebrow 点 / Approach / `【谁】【什么事】` 下划线。

**至少三层视差可读**
- [ ] 桌面指针左右扫：底景微动、文案中动、近景手 / 窗口大动，三速能分出来。
- [ ] 换章时底景换机位（能看出「镜头动了」），同章翻页不动。
- [ ] P01 / P03 / P06 / P12 标题不压母本窗口文案。
- [ ] 章标 `\ 0n 章名 /` 骨白 18px 居中出现后退场；veil 期间仍能看到母本。
- [ ] 手机每页都能看到母本一部分（不是黑卡）。

**前景有克制互动**
- [ ] 手出现在门页、P01（指尖）、P03 / P06 / P08 / P12 / P17（单手交替）、P13–15（指尖）、P20（双手）；其余页无手。
- [ ] 手全部不可点；近景不盖住任何按钮、卡、预览。
- [ ] P07 点四动作，窗口四区各亮，03 时指尖位移回弹；P13 四拍点亮预览四态；P05 开关两句互换；P12 hover 三门指尖三档。
- [ ] P19 复制结果逐字 = §5.3 第 6 条；P18 选题后 P19 有预览行，刷新后无。

**课还能讲完**
- [ ] 7 条冻结句逐字；四动作词逐字；20 页顺序与 `chStarts` 不变；`data-note` 20 条未改。
- [ ] 禁词 0；`HyperFrames` 仅 `.hf`；`蓝龙虾` 唯一工具名；`POIZON` 唯一品牌英文；无 Three / PlayCanvas / CDN / `@font-face`。
- [ ] 关掉所有新互动（不点任何近景）也能按讲稿三段讲完 P01–P20。
- [ ] `prefers-reduced-motion`：无 veil、无机位位移、无 near 入场、静态可读。
- [ ] 390 宽 20 页无横滚、底部固定区 ≤ 96px、无元素被遮。
- [ ] `assets/poizon/` 无 runtime 文件；素材缺失处仍写「待补」。

24 项全勾 = 可交付主讲。
