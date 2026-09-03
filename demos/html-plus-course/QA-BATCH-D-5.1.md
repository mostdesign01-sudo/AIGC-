# HTML+ 批次 D · 5.1 验收

- 验收对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-batch-d-a572`（PR #16，base = `cursor/html-plus-batch-c-59dc` @ `48e2852`，批次 C 修补后已通过）。首轮 HEAD `5c7510c`；复验 HEAD `8bf5399`（D-1 修补）。
- 验收依据：`OPTIMIZATION-5.1.md` §4 批次 D 成功标准（P1-7 / P2-1 / P2-4）+ QA-C 备注 3.1 / 3.3（并入的 P1-3）+ §5.1 / §5.2 / §5.3。
- 验收方式：通读 `48e2852..5c7510c` 全部 diff（`index.html` +197 / −35，两个 commit `2fc1d53` `5c7510c`，只改这一个文件）；`grep -c -F` 核对冻结句、禁词、`AI Coding`、`HyperFrames`、`data-note` 计数；Chrome 148 无头渲染 1440×900 / 1280×800 / 1920×1080 与 390×844 / 360×780，基线与 HEAD 各出 20 页舞台截图做逐像素比对，脚本驱动 P02 / P07 / P09 / P13 / P14 / P15 / P18 全部点击路径，读取 `getBoundingClientRect` / `getComputedStyle` / `elementFromPoint` / `scrollWidth`；`localStorage` 每次清空后再测。
- 验收人：Fable 5.1 QA。两轮都不改 `index.html`。

---

## 结论：通过（复验 `8bf5399`）

首轮（`5c7510c`）打回一条：390 / 360 宽下 HUD 当前章「什么是 HTML」被截成「什么是 HT…」（D-1）。修补 commit `8bf5399` 只加一行 CSS（L1505 `.hud .ch.is-on { flex: 1.5; }`，位于 `@media (max-width: 979px)` 内、L1504 `.hud .ch.is-on .lab { display: block; }` 之后），与首轮第 2.1 节要求逐字一致。复验第 2.3 节两个数在 390×844 与 360×780 全部成立，六个章名都不再截断；批次 D 成功标准 1 / 2 / 4 / 5 抽检仍过，冻结句 / 禁词 grep 与基线完全相同，diff 不含任何 `data-frozen / data-note / editSel / AI Coding` 行。

**可以开批次 E。** 开工时带上第 3 节 3.1 / 3.5 / 3.7 / 3.8（首轮已记，未变）。

---

## 0. 复验记录（`5c7510c` → `8bf5399`，2026-09-03）

修补 diff：`git diff 5c7510c 8bf5399 --stat` = `demos/html-plus-course/index.html | 1 +`，只这一行、只这一个文件。方法与首轮相同：Chrome 148 无头，`isMobile + hasTouch`、DPR 2，`localStorage` 先清空，点「进入课堂」后经 `.hud .ch[data-go]` 依次切到六个章首页读数；基线 `5c7510c` 同脚本再跑一遍作对照。全程 0 `pageerror` / 0 console error（390 / 360 / 1440 三个视口）。

### 0.1 第 2.3 节第 1 个数 · 六章首页 `.hud .ch.is-on .lab` 的 `scrollWidth / clientWidth` 与字号

| 页 · 当前章 | 390×844 基线 `5c7510c` | 390×844 复验 `8bf5399` | 360×780 基线 | 360×780 复验 | 字号 | 结果 |
|---|---|---|---|---|---|---|
| P01 · 00 开场 | 22 / 22 | 22 / 22 | 22 / 22 | 22 / 22 | 11px | ✓ |
| P03 · 01 什么是 HTML | 64 / **61**（截断） | **64 / 64** | 64 / **56**（截断） | **64 / 64** | 11px | ✓ |
| P06 · 02 可以做什么 | 55 / 55 | 55 / 55 | 55 / 55 | 55 / 55 | 11px | ✓ |
| P08 · 03 怎么选择 | 44 / 44 | 44 / 44 | 44 / 44 | 44 / 44 | 11px | ✓ |
| P12 · 04 我们的案例 | 55 / 55 | 55 / 55 | 55 / 55 | 55 / 55 | 11px | ✓ |
| P17 · 05 轮到你了 | 44 / 44 | 44 / 44 | 44 / 44 | 44 / 44 | 11px | ✓ |

- 六个 `.ch` 宽度：390 下当前章 **88.5px**、其余五章各 60.3px（基线六格各 65px）；360 下当前章 **81.5px**、其余 55.7px（基线各 60px）。`getComputedStyle(.ch.is-on).flexGrow` = `1.5`。非当前章仍只显示两位 `num`（10px），`.lab` `display: none`，60px 足够。
- `.lab` 计算样式 `display: block; font-size: 11px`，六页都是。L1499–1502 的 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` 兜底保留，未触发。
- 390 与 360 P03 HUD 截图（DPR 2）目视：「01 / 什么是 HTML」完整，无省略号。

### 0.2 第 2.3 节第 2 个数 · 底部固定区高度与横向滚动

| 项 | 390×844 | 360×780 | 结果 |
|---|---|---|---|
| `.hud` | 高 40.0，top 804 / bottom 844 | 高 40.0，top 740 / bottom 780 | ✓ |
| `.dock` | 高 44.0，top 760 / bottom 804 | 高 44.0，top 696 / bottom 740 | ✓ |
| 合计 | **84** ≤ 96，dock.bottom == hud.top，hud.bottom == innerHeight | **84** ≤ 96，同样贴合 | ✓ |
| `documentElement.scrollWidth` | 六个章首页都 **390** == innerWidth（`body.scrollWidth` 390） | 六页都 **360** == innerWidth | ✓ |

六个章首页六次读数全部一致，切章时 HUD 高度不变。

### 0.3 批次 D 成功标准抽检（1 / 2 / 4 / 5）

| # | 标准 | 复验读数（`8bf5399`） | 结果 |
|---|---|---|---|
| 1 | P2-1 · 1440×900 P02 / P09 / P18 / P19 ≥ 55% 或居中 | 舞台 1184×666：P02 0.413 `is-short` 上下 200 / 191；P09 **0.854** 无 `is-short`；P18 0.359 `is-short` 217 / 210；P19 0.375 `is-short` 213 / 221；P05 0.375、P16 0.471 同被居中（首轮 3.3）；六页 `scrollHeight == clientHeight` | ✓ 与首轮 1.1 同 |
| 2 | P1-7 · P09 四场景默认一行、点开其余不消失、单开 | 默认四卡 `line-clamp 1`、13px、`.more` 18px、`.ex` 隐藏；点 01 `.more` → 01 `is-on`、`clamp 2`、36px、`.ex` 可见，02 / 03 / 04 仍 18px 一行；再点 02 `h3` → 02 开、01 收；再点 02 → 全收；`hash` 始终 `#p09` | ✓ 与首轮 1.2 同 |
| 4 | 390 全部 20 页无横向滚动、案例控件进页不被 dock 压 | 390：20 页 `documentElement.scrollWidth == body.scrollWidth == 390`，逐元素扫描 `left < 0 / right > 390` 为 0；`button / .tee-tools / .tee-cap / #nono / .tl-btns / .hf / .klein-bar / .copy-row / .roles` 共 76 个控件，`bottom > dock.top` 的 **0 个**；P12 `revealAboveChrome` 上滚 17px（首轮 18）。360：20 页 `scrollWidth` 360，越界元素 0，被压控件 0；P11 上滚 16、P12 上滚 108。以上每一项与基线 `5c7510c` 同脚本读数**完全相同**（scrollY 序列逐页一致） | ✓ 与首轮 1.4 同 |
| 5 | P1-3 · 演示输出不入库；`R` 重置 | 1440：点 P04 岗位 02、P07 身份 01（`#punchline.is-in` true）、P18 任务 01 后 `#job-out / #next-step / #task-out` 都变、`localStorage[EDIT_KEY]` **`null`**、`[data-dirty]` 0；按 `R` → `#p01`，三个输出回初始文案、`is-in` 关、`localStorage` 仍 `null`。390 / 360：P14 九格点 01 + 04 → `#nono-compare.is-on`，`localStorage` `null`、`data-dirty` 0 | ✓ 与首轮 1.5 同 |

### 0.4 冻结句 / 禁词 grep（`5c7510c` vs `8bf5399`，`grep -c -F`）

§5.3 七条冻结句十个计数（课名前缀 · 副标题 · 定义 · 装下内容 / 组织信息 / 接收操作 / 给出回应 · 金句 · 提示词 · 结课句）：`2 2 1 · 2 5 7 5 · 1 2 1` → 逐项相同。`data-frozen` 出现次数 15 / 15（含 CSS / JS 选择器；HTML 属性 7 处未动），`data-note=` 20 / 20，`HyperFrames` 1 / 1，`AI Coding` 4 / 4（待 Hao，PR #16 已列），`Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas / 四级 / 层级` 全 0 / 0，`等级` 1 / 1（P07 `data-note`，既有），`蓝龙虾` 5 / 5，`POIZON` 3 / 3，`视频插件` 3 / 3。diff 中命中 `data-frozen / data-note / editSel / AI Coding` 的增删行 **0**。

### 0.5 越批

`8bf5399` 只增一行 CSS，不加页、不改 `chStarts`、不动章名、不动主题 / 主色；commit 标题 `HTML+ 批次D：版面节律与手机（修补 HUD 章名）`，与首轮第 4 节交接一致（§5.6 一批一 commit 的出入见 3.9，不阻塞）。

---

## 1. 逐条证据（首轮 `5c7510c` 记录，保留原文）

### 1.1 P2-1 · 1440×900 下 P02 / P09 / P18 / P19 内容占舞台 ≥ 55% 或垂直居中

舞台 1184×666。`applyRhythm()`（L2546）在 `go()` 双 rAF 后按子元素高度求和，< 55% 时给 `.page` 加 `is-short`（L217 `justify-content: center`；手机端 L1530 关掉）。

| 页 | 基线 内容占比 / 上下留白 | HEAD 内容占比 / 上下留白 | `is-short` | 结果 |
|---|---|---|---|---|
| P02 | 0.853（四卡 `flex:1` 撑满）/ 0 / 0 | 0.413 / **147 / 147** | ✓ | 居中 ✓ |
| P09 | 0.255 / 0 / 398 | **0.854** / 0 / 0 | — | ≥ 55% ✓ |
| P18 | 0.359 / 0 / 329 | 0.359 / **165 / 165** | ✓ | 居中 ✓ |
| P19 | 0.375 / 0 / 320 | 0.375 / **160 / 160** | ✓ | 居中 ✓ |

- P02 四卡：`.overview-grid .pick`（L712–721）`flex: 0 1 auto`、`max-height: 220px`，实测高 135.3px（≤ 220），`h3` 距卡顶 41.8px（tag 之下）、文字贴顶，`p` 下方留 21px；`.punch` `margin-top: auto` → `20px`（L262），不再被推到底。点卡片上的 `p` 文字仍跳章（点 02 → `#p06`；390 下 `touchscreen.tap` 点 03 → `#p08`）。
- 1280×800：P02 0.477 / 106 / 106，P18 0.415 / 124 / 124，P19 0.472 / 108 / 108，P09 0.845；1920×1080：P02 0.271 / 292 / 292，P18 0.255 / 300 / 300，P19 0.267 / 295 / 295，P09 0.896。三种分辨率一致。
- 逐像素比对基线 vs HEAD 的 20 张舞台截图：P01 / P03 / P04 / P06 / P07 / P08 / P10–P15 / P17 / P20 **0 像素差**；P02 3.03%、P09 0.46%、P18 1.98%、P19 3.55% 为本批预期改动；另有 **P05 12.18%、P16 4.49%**——两页内容 0.375 / 0.471 < 55%，被同一条通用规则居中（上下留白 160 / 160 与 127 / 127）。这是 P2-1 原文「规则：内容高 < 舞台 55% 时，`.page` 用 `justify-content:center`」的直接后果，不算越批，记 3.3。
- 章封面 P03 / P06 / P08 / P17 与 P01 / P20 本身已 `justify-content: center`（`.cover` L282、`.center-page` L364、`.close-page` L1206），加不加 `is-short` 都不动，截图 0 差。
- 全部 20 页 `page.scrollHeight == clientHeight`（无内部溢出），无元素超出舞台，无 `text-overflow` 截断（1440×900）。

**通过。**

### 1.2 P1-7 · P09 四场景默认各一行说明，点开一个其余三个不消失

CSS L723–751：`.scene-grid { flex: 1; align-content: stretch }`、`.scene { height: 100% }`、`.scene .more` 默认 `-webkit-line-clamp: 1`、13px、`line-height 1.4`；`.scene.is-on .more` 两行；`.scene .ex` 默认隐藏、12px，`is-on` 时显示、`rgba(255,255,255,.7)`。HTML L1834–1837 每张卡加一个 `.ex`。

| 状态（1440×900） | 01 | 02 | 03 | 04 | 结果 |
|---|---|---|---|---|---|
| 默认 | `.more` 1 行 13px 可见，`.ex` 隐藏 | 同 | 同 | 同 | 四张各一行 ✓ |
| 点 01 的 `.more` 文字 | `is-on`，`.more` 2 行（`scrollHeight == clientHeight`，全文放完）+ `.ex` 可见 | 1 行仍在 | 1 行仍在 | 1 行仍在 | 其余不消失 ✓ |
| 再点 02 的 `h3` | 收回 1 行 | 展开 2 行 + `.ex` | 1 行 | 1 行 | 单开 ✓ |
| 再点 02 | 1 行 | 收回 1 行 | 1 行 | 1 行 | 可关 ✓ |
| 点 04 | 1 行 | 1 行 | 1 行 | 展开 | ✓ |

- 四卡等高 484×263px，展开态内容底 363 < 卡底 706，`.ex` 不溢出卡外；`hash` 始终 `#p09`（点在文字上不翻页）。
- 390×844：四卡 111px，`.more` 1 行；`touchscreen.tap` 点 03 的 `.more` → 03 变 138px、`.ex` 可见，其余三张 1 行仍在；`documentElement.scrollWidth` 390。
- 四个「例：」出处：`业务知多少 VOL.06` = P15 标题（L1915）；`入职鉴别` / `防伪五件套` = P18 任务 02 原文（L2067–2070，基线已有）；`NONO 九款` = P14；`11 周年物料` + `拖一拖、换贴花` = P13 `.tee-cap`。四条都取自课里已有案例，无新造事实，符合 §5.1 / §5.4。
- 默认一行是 `-webkit-line-clamp: 1`，在 263px 卡宽下四条说明（20–26 字）都显示约 14 字加省略号——这是 P1-7「默认一行 / 点开两行」的设计本身，与 §6「无省略号」有出入，记 3.1 待 Hao。

**通过。**

### 1.3 P2-4 · 390 宽底部固定区 ≤ 96px；当前章标签可读（≥ 11px）

`:root` 手机端 `--hud: 40px; --dock: 44px`（L1459–1460）；`.hud` 与 `.dock` 都 `position: fixed`、`height/min/max = var()`（L1477–1479、L1622–1624）。

| 项 | 390×844 实测 | 360×780 | 结果 |
|---|---|---|---|
| HUD | top 804 / bottom 844 / 高 40.0 | 40.0 | ✓ |
| dock | top 760 / bottom 804 / 高 44.0，`overflow: hidden` | 44.0 | ✓ |
| 合计 | **84px**，两块贴合无缝（dock.bottom == hud.top，hud.bottom == innerHeight） | 84 | ≤ 96 ✓ |
| dock 内容 | 上一页 8–69 / 下一页 75–136 / `P01 / 20` 142–181（11px）/ 重置 187–235 / 讲稿 241–289，按钮高 36、13px，无一被 `overflow: hidden` 裁掉；`#edit-btn` `display: none`（L1634）；`.dots` 隐藏 | 同，右侧仍余 71px | ✓ |
| HUD 非当前章 | 只显示 `num` 10px，`.lab` `display: none`（L1494–1503） | 同 | ✓ |
| HUD 当前章 `.lab` | `display: block`，**11px**（L1504） | 11px | 字号 ✓ |
| 当前章 `.lab` 装得下 | 开场 22/22 · 可以做什么 55/55 · 怎么选择 44/44 · 我们的案例 55/55 · 轮到你了 44/44（`scrollWidth / clientWidth`）；**什么是 HTML 64/61 → 截断** | 什么是 HTML **64/56 → 截断** | **不通过** |

P03 / P04 / P05 的 HUD 在 390 下显示的是「01 / 什么是 HT…」（QA 无头截图 P03 底部 2× 放大可见）。原因：六个 `.ch` `flex: 1` 各 65px，减 `padding: 2px 2px 3px` 后 61px；`.hud .ch .lab` 带 `max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`（L1499–1502），11px 的「什么是 HTML」（3 个汉字 + 空格 + 4 个拉丁字母）需要 64px。批次 C 时 `.lab` 10px 六章全显，58px 装得下；提到 11px 后恰好差 3px。PR #16 自验截图只有 P01（开场，最短的章名），没量到第 01 章。

**打回。** 修补见第 2 节。

### 1.4 390 宽全部 20 页无横向滚动、案例控件进页不被 HUD / dock 遮住（QA-C 3.1）

`.page` 手机端底部 padding 改为 `calc(var(--hud) + var(--dock) + 24px)` = 108px（L1525）；`revealAboveChrome()`（L2558）进页后若页内最低的 `button / .tee-tools / .tee-cap / #nono / .tl-btns / .hf / .klein-bar / .copy-row / .roles` 底边 > dock.top − 8，就 `scrollBy` 补差。

- 横向：20 页 `documentElement.scrollWidth == body.scrollWidth == stage.scrollWidth == 390`；逐元素扫描 `getBoundingClientRect`，无 `left < 0` 或 `right > 390`（360 宽同样全过）。
- 进页 `scrollY = 0` 时页内所有控件 vs dock.top 760：

| 页 | 最低控件 | 底边 | 被 dock 压住的控件数 | 结果 |
|---|---|---|---|---|
| P13 | `.klein-bar` | 574.9（`.tee-tools` 506.1、`.tee-cap` 517.3、四 tab 362.7） | 0 / 14 | ✓ |
| P14 | `.klein-bar` | 639.7（07 / 08 / 09 格底 570.9） | 0 / 15 | ✓ |
| P14 选 01 + 04 | `.klein-bar` | 639.7；对比卡 61.2px 出现后 07 / 08 / 09 底 580.9 < 底栏 top 587.3；九格每格 44.0px；`elementFromPoint(格中心, 格底 −8)` 九格全部命中格本身 | 0 / 15 | ✓（QA-C 2.3 三个数在 390 下同时成立） |
| P15 | `.klein-bar` | 650.4（三键 545.2）；三键点完 `#hf` 549–564 可见，`.wave` 12×12 在假页右上 | 0 / 9 | ✓ |
| P07 | `#roles` | 581.6；选「新同学」后 `#punchline` 678–744 `is-in`、18px，仍在 dock 之上；`.actions` 2 列（L1565 `.beats4` 同为 2×2）；01–04 全亮 | 0 / 9 | ✓ |
| P02 / P04 / P09 / P10 / P11 / P18 / P19 | 574 / 481 / 577 / 517 / 692 / 457 / 274 | — | 0 | ✓ |
| P12 | `.door` 739 → `revealAboveChrome` 自动上滚 **18px**，kicker 仍在视口内（top 35） | — | 0 | ✓ |

- P13 点「贴花」`#shirt-mark` = `POIZON`、`hash` 仍 `#p13`；P14 / P15 `touchscreen.tap` 后 `hash` 不变。
- P13 / P14 / P15 `.klein-bar` `white-space: normal`，`scrollWidth == clientWidth`（355），两行无省略号。
- P05 / P16 页高 893 > 844，无任何控件，进页时最后一张卡 / 最后一行在 dock 之下，滑 49px 后全部露出（页底 padding 108 > chrome 84）。属可滚动的非互动内容，记 3.4。
- 无头运行全程 0 `pageerror` / 0 console error（1440 / 1280 / 1920 / 390 / 360 五个视口）。

**通过。**

### 1.5 P1-3 / QA-C 3.3 · 演示输出不入库；「重置」+ `R` 清脏状态

`DEMO_OUT_IDS`（L2499）列出四个输出 id；`persistEdits()`（L2504）只在 `body.is-edit` 下序列化 `[data-edit][data-dirty]` 且跳过四个 id；四处 `persistEdits()` 调用从岗位 / 身份 / 动作 / 九格 / 任务的点击处理里删掉；`input` 监听只在编辑态标 `data-dirty`。`resetCourse()`（L2574）清 `EDIT_KEY`、清 `data-dirty`、按 `editOriginals` 还原 159 个可编辑元素、按 `defaultOn` 快照还原 `.is-on`、关编辑 / 讲稿、清 P07 / P13 / P14 / P15 内部状态、`go(0)`。

| 步骤（1440×900，`localStorage` 先清空） | 证据 | 结果 |
|---|---|---|
| 点 P04 岗位 02、P07 志愿者 + 动作 01、P13 吊牌 + 奖杯 tab、P14 02 + 05、P15 时间 + 声音、P18 任务 03、P09 02、P10 04、P11 自检 01 | `#job-out / #next-step / #nono-out / #task-out` 都变了；`localStorage.getItem(EDIT_KEY)` **`null`**；`[data-dirty]` 0 | 不入库 ✓ |
| 刷新 → 进入课堂 | 四个输出回初始（「点一张岗位卡…」「还没选…」「点两款…」「点一个任务…」）；`.is-on` 集合与首次加载逐元素相同 | ✓（§6「刷新后演示输出回到初始」） |
| `E` → P02 第一张卡 `h3` 末尾键入「QA改」 | `h3` = `重新认识 HTMLQA改`；`localStorage` = `{"3":"重新认识 HTMLQA改"}`；`data-dirty` 1；`[data-frozen]` 无 `contenteditable` | 手动改字入库 ✓ |
| `Esc` → 点 P04 岗位 01 | `is-edit` 关；`localStorage` 仍只有 `{"3":…}`，无 `#job-out` | ✓ |
| 刷新 | `h3` 仍 `重新认识 HTMLQA改`（`data-dirty` 回填），`#job-out` 初始 | ✓ |
| 再点身份 / 两款 / 物流箱 tab / 任务 01，开讲稿，按 `R` | `hash` `#p01`；`localStorage` **`null`**；`h3` 回 `重新认识 HTML`；`data-dirty` 0；四个输出初始；`#punchline` 无 `is-in`；`#nono-compare` 关、`#nono-out` 回显；`#tee` 无 `is-off`、`#shirt-mark` = `11`；`#tl` / `.is-sound` 关；讲稿 / 编辑关；`.is-on` 集合与首次加载**逐元素相同**（T恤 tab、字标、P10 02、P11 第 3 条…） | ✓ |
| 再选 P14 01 + 09 → 点 dock「重置」 | `#p01`、对比卡关、九格 0 亮；dock 提示文案 `← → 空格 · F 全屏 · R 重置` | ✓ |
| 重置后再点身份 / 两款 / 岗位 / 任务 | 全部照常（`新同学…`、金句 `is-in`、对比卡 `01 / 02`、岗位 / 任务输出），`localStorage` 仍 `null` | 还原不破坏引用 ✓ |
| 重置后 `E` 改第二张卡 | `localStorage` = `{"5":"看见 HTML 的能力X"}` | 编辑通道仍在 ✓ |

390 下：点两款、点任务后 `localStorage` 同为 `null`（1.4 表内一并读取）。

**通过。**

### 1.6 冻结句 / 口径 / 越批

§5.3 冻结句 `grep -c -F`，`48e2852` → `5c7510c`：`1/1、2/2、1/1、2/2 · 5/5 · 7/7 · 5/5、1/1、2/2、1/1`，全部不变；`data-frozen` 7 不变；diff 不含 `data-frozen / FROZEN / editSel` 行（`editSel` 常量原样，命中数仍 159）。

§5.2 禁词 `Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas` 均 0；`HyperFrames` 1；`四级 / 层级` 0；`等级` 1（P07 `data-note`，批次 A 前既有）；`蓝龙虾` 5、`POIZON` 3；`视频插件` 3。全部与基线相同。

`AI Coding` = 4，diff 无这四行；PR #16 描述有「待 Hao 确认：P1-6 四处仍未改字」。

越批：`data-note=` 20 处，diff 中没有任何 `data-note` 行（P02 / P09 的 `data-note` 只作上下文出现）；`.notes` 面板、README 未改；未加页、未改 `chStarts`、未改主题 / 主色，极光青仍只在 `.chain i` / tick / 进度条。diff 全部落在：`--dock` 变量、`.page.is-short`、`.punch`、`.overview-grid / .scene-grid / .scene .more / .scene .ex`、手机端 `.hud / .dock / .page / .notes / .toast / .beats4` 尺寸、dock 加「重置」按钮与提示、P02 / P09 HTML、JS 的 `applyRhythm / revealAboveChrome / resetCourse / persistEdits` 与 `R` 键。改动只落在 `demos/html-plus-course/index.html`。

**通过。**

---

## 2. 修补清单（首轮打回项，只有一条 · **已在 `8bf5399` 修补并复验通过**，见第 0 节）

### 2.1 必改

**D-1 · 390 宽 HUD 当前章「什么是 HTML」被截成「什么是 HT…」** — 已修，`8bf5399` L1505。

在 `@media (max-width: 979px)` 内、L1504 `.hud .ch.is-on .lab { display: block; }` 之后加一行，让当前章多拿一点宽度：

```css
.hud .ch.is-on { flex: 1.5; }
```

- QA 在副本上预演：390 宽下当前章 88px（内 84）、其余五章各 60px；「什么是 HTML」64/64 不截断，六个章名逐一切到当前都 `scrollWidth == clientWidth`；360 宽下当前章 82、其余 56，同样六章全过。HUD 仍 40px、合计仍 84px，20 页 `scrollWidth` 仍 390 / 360，被压控件仍 0。
- 保留 L1499–1502 的 `overflow: hidden; text-overflow: ellipsis` 作兜底，不必删。
- 非当前章只显示两位数字，60px 足够；切章时六格宽度会重排一次，是常见的「当前 tab 加宽」样式，不算新增功能。

### 2.2 不接受的替代方案

- `.lab` 字号 < 11px：违反本批成功标准。
- 只去掉 `.hud .ch` 的 2px 左右 padding：61 → 65px，只余 1px；iOS PingFang 下「HTML」四个字母更宽，大概率仍截断。
- 改章名（如「什么是HTML」去空格）：§2「章节导航文案」六个词不可动。
- `.lab` `overflow: visible` 让它压到邻格：能显示，但依赖邻格恰好空着，不如直接给宽度。

### 2.3 再次验收时 QA 会量的两个数（390×844 与 360×780 各一次）

1. 依次进 P01 / P03 / P06 / P08 / P12 / P17，`.hud .ch.is-on .lab` 的 `scrollWidth ≤ clientWidth`，`font-size` = 11px。
2. `.hud` 高 + `.dock` 高 ≤ 96，`documentElement.scrollWidth` == 视口宽。

同时复跑第 1.6 节 grep（冻结句 10 个计数、`HyperFrames` 1、`AI Coding` 4、禁词 0、`data-note=` 20）。

---

## 3. 非阻塞备注（不构成打回，记入批次 E 或待 Hao）

3.1 **P09 默认一行带省略号**：`-webkit-line-clamp: 1` 在 1440 宽（卡 263px）下四条说明各显示约 14 字 + `…`，点开才见全文两行。这是 P1-7「默认一行 / 点开两行」的原设计，但 §6 版面项写「1440×900 全部 20 页无省略号」。二选一待 Hao：(a) 接受 P09 的省略号为有意设计，批次 E 在 §6 该项旁注明；(b) 默认就放两行（卡高 484px，多一行绝对装得下），点开只加「例：」。QA 倾向 (b)，一行 CSS（`-webkit-line-clamp: 2`）且不改文案。

3.2 **P09 四卡靠拉高填充**：`.scene-grid { flex: 1 }` + `.scene { height: 100% }` 让四卡撑到 484px，内容只占卡内上 1/3（展开态 250px）。成功标准「内容占舞台 ≥ 55%」按元素高度算是 0.854，但视觉上仍是四根竖条。可选：`grid-template-columns: repeat(2, 1fr)` 做 2×2，每卡 236px 高更紧凑。属版面口味，待 Hao，不在批次 E 范围内除非 Hao 点头。

3.3 **P05 / P16 也被居中**：P2-1 通用规则的副作用（1.1 表），两页原来顶对齐、下方留 319 / 255px 空白，现在上下各 160 / 127px。视觉是改善，记录以备 Hao 知情。

3.4 **390 下 P05 / P16 需要滑 49px**：两页无控件，`revealAboveChrome` 不介入，进页时最后一张卡 / 最后一行在 dock 下方。属可滚动的静态内容，与 3.1「案例控件不被挡」的口径不冲突；若 Hao 要求「进页即全露」，得把 P05 四卡在手机端改 2×2 或缩 `.more`，留给批次 E 之后。

3.5 **1280×800 下 P15 设备框超出舞台 12px**：`.device / .device-view / .klein-bar` 底边越过舞台底，`page.scrollHeight` 比 `clientHeight` 多 12px。基线 `48e2852` 同样数字，不是本批引入；1440×900 / 1920×1080 无此问题。记给批次 E 的 §6 全跑（「1440×900 全部 20 页无截断」只要求主讲视口）。

3.6 **P11 `.rows li` 与其内 `p` 都在 `editSel` 里**（批次 B 起）：`resetCourse` 按 `editOriginals` 还原 `li.innerHTML` 时，内层 `p` 被重建、丢掉 `data-edit`。功能上仍可通过 `li` 编辑、`R` 后一切照常（1.5 已验），只是 `editOriginals` 里多四个游离节点。批次 E 若顺手，可让 `editSel` 排除 `.rows li > p` 或跳过有 `[data-edit]` 子元素的父级。

3.7 **`R` 在编辑焦点里不生效**：光标在可编辑元素内时 `R` 会键入字母（L2218 `inField` 守卫），先 `Esc` 再 `R`。这是键盘守卫的既定行为，README（批次 E · P2-6）写快捷键表时注一句。

3.8 **手机端没有编辑入口**：`#edit-btn` 按 P2-4 隐藏，且手机无键盘 `E`。符合简报；README 应写明「改字只在桌面」。

3.9 **三个 commit**：`2fc1d53` + `5c7510c`（P07 手机端动作卡两列的补丁）+ `8bf5399`（D-1 HUD 修补），与 §5.6「每批一个 commit」有出入；三者都在批次 D 范围内，不要求合并。

3.10 **仍开着的待 Hao 项**：P1-6「AI Coding」四处（PR #16 已列）；QA-C 3.2 P14 九格「高帮 / 低帮 / 袜套」与对比卡「帮型 —」并存；QA-C 2.1 P14 设备框 420×304 非 3:2。

---

## 4. 给批次 D 修补的交接（首轮原文；已按此完成）

- 基线仍是 `5c7510c`；只改第 2.1 节一行 CSS。→ `8bf5399` 照做，`index.html | 1 +`。
- 不碰 P02 / P09 / P18 / P19 已通过的版面、`revealAboveChrome / resetCourse / persistEdits`、七个 `data-frozen`、`editSel`、四处 `AI Coding`、20 个 `data-note`。→ 复验 0.3 / 0.4 确认未碰。
- commit 标题沿用 `HTML+ 批次D：版面节律与手机（修补 HUD 当前章标签）`，PR #16 描述追加 390 与 360 下六章 HUD 截图各一张（至少含「什么是 HTML」）。→ 实际标题「修补 HUD 章名」，意思一致，不计。
- 修补通过后再开批次 E；批次 E 开工时把本文件 3.1（P09 省略号）、3.5（1280 P15）、3.7 / 3.8（README 快捷键）一并带上。→ **复验通过，可以开批次 E**，批次 E 基线 = `8bf5399`。
