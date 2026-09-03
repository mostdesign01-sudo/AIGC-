# HTML+ 批次 H · 5.1 验收（Kage 式门页）

- 验收对象：`demos/html-plus-course/`，分支 `cursor/html-plus-batch-h-464f`，HEAD `8bbeeeb`（PR #24，base = `cursor/html-plus-batch-g-21e2` @ `045088a`）。
- **复验对象（第 0 节）**：修补分支 `cursor/html-plus-batch-h-cta-5b4c`，HEAD `6d745fe`（PR #26，base = `8bbeeeb`）；只修打回项 H-1。
- 验收依据：批次 H 六条成功标准（完整 landing hero 层栈与细 CTA；多速率视差 + stagger + reduced-motion；进课路径与 HUD 时机；无 Three / npm / 字体 CDN / PlayCanvas、无朱红、冻结句 / `data-note` 不改坏；1440 + 390 可读、海报构图可辨；`DESIGN.md` 有说明）+ `OPTIMIZATION-5.1.md` §5.2 / §5.3 / §5.6。
- 验收方式：通读 `045088a..8bbeeeb` 全部 diff（`index.html` +387 / −220，`DESIGN.md`、`README.md`）；`grep -c -F` 核对冻结句、禁词、外链；Chrome 148 无头渲染 1440×900 与 390×844（另补 390×664），分别在 `prefers-reduced-motion: no-preference / reduce` 下加载，读 `getComputedStyle` / `getBoundingClientRect`，脚本驱动 `#door-scroller.scrollTop` 到 0 / 50% / 80% / 90%，点按钮、按 `Enter`、按空格三条进课路径各开一个新 context；截图后把阅读层设 `visibility: hidden` 再截一张，取 CTA 矩形内海报像素亮度做可读性量化。
- 验收人：Fable 5.1 QA。本轮只新增本文件，不改业务文件。复验轮只更新本文件，不改 `index.html`。

---

## 结论：通过（复验 `6d745fe`）

H-1 已修：`@media (max-width: 979px)` 给 `.enter-btn` 加 `background: rgba(7, 9, 13, .62)` + `backdrop-filter: blur(8px)`，hover / active 同样保留。按第 2.3 节口径复量：390×844 与 390×664 下 `backgroundColor` 都是 `rgba(7, 9, 13, 0.62)`、`backdrop-filter blur(8px)`；不隐藏阅读层截图时按钮矩形平均亮度由修补前 129.6 / 138.7 降到 62.1 / 71.0，亮像素（> 160）占比由 56.8% / 60.4% 降到 3.3% / 6.8%，底（P20）与字 / 描边（P97）对比 6.8:1 / 9.3:1，2× 近景「进入课堂」四字与 pill 描边完整可辨；1440 `backgroundColor` 仍 `rgba(0, 0, 0, 0)`、`backdrop-filter none`、1px 白描边，未回退成实心 Klein；点 / `Enter` / 空格 / 滚到 90% 四条路径仍到 `#p01`；冻结句 10 个计数、`data-frozen` 15、`data-note` 20 且内容逐字不变、禁词 0，与基线一致。diff 只有 `index.html` +10 行 CSS。证据见第 0 节。批次 H 可以合，批次 I 可以开工；3.x 非阻塞项照原计划带上。

以下「打回」结论及第 1–4 节为 `8bbeeeb` 首轮验收记录，原样保留。

---

## 0. 复验记录（`8bbeeeb` → `6d745fe`，PR #26）

复验方式：`git diff 8bbeeeb..6d745fe` 通读（只有 `index.html` L1848–1857 一个 hunk，+10 行：手机媒体查询里 `.enter-btn` 及其 `:hover / :active` 的半透明黑场 + blur）；Chrome 148 无头，`deviceScaleFactor 2`，`8bbeeeb` 与 `6d745fe` 各自本地静态目录同一脚本跑一遍，加载 1.3s 后读 `getComputedStyle` / `getBoundingClientRect` / `elementFromPoint`，截图后取 `#enter-btn` 矩形内像素亮度；再把 `.door-read` 设 `visibility: hidden` 截一张量底下海报（应与基线相同，确认对比口径一致）。点按钮 / `Enter` / 空格 / `scrollTop = 90%` 各开新 context。全程 0 `pageerror`、0 console error（本地 http 服务的 `favicon.ico` 404 除外，`file://` 下不存在）。

### 0.1 第 2.3 节第 2 条 · 计算样式

| 视口 | `backgroundColor` | `backdrop-filter` | `border` | hover 后 `backgroundColor` | 结果 |
|---|---|---|---|---|---|
| 390×844 | `rgba(7, 9, 13, 0.62)` | `blur(8px)` | `1px rgba(255,255,255,.28)` / `999px` | `rgba(7, 9, 13, 0.62)` | ✓ 半透明黑 α .62 ≥ .5，有 blur |
| 390×664 | `rgba(7, 9, 13, 0.62)` | `blur(8px)` | 同上 | `rgba(7, 9, 13, 0.62)` | ✓ |
| 1440×900 | `rgba(0, 0, 0, 0)` | `none` | 同上 | `rgba(0, 0, 0, 0)` | ✓ 桌面透明底、细描边未变 |

`prefers-reduced-motion: reduce` 下 390 两种视口 `backgroundColor` 同为 `rgba(7, 9, 13, 0.62)`（媒体查询与 reduce 规则无交叉）。桌面 `.enter-btn:hover / :active { background: transparent }` 在 979px 内被修补的同名规则覆盖，hover 不会掉回透明——第 2.1 节「更保险」那条也做了。

### 0.2 第 2.3 节第 1 条 · 按钮矩形亮度（不隐藏阅读层，2× 截图）

矩形两种视口都是 106.7×33.6px（`x 18`，`y 759 / 579`），与基线同位同尺寸，落在海报 headline 第二行白笔画上（隐藏阅读层量底下海报：平均 124.7 / 131.7、亮像素 56.1% / 58.4%，与首轮 123.8 / 56.2% 一致，口径没变）。

| 视口 | 版本 | 平均亮度 | 亮像素 > 160 | P20（底） | P97（字 / 描边） | 底 vs 字对比 |
|---|---|---|---|---|---|---|
| 390×844 | `8bbeeeb` | 129.6 | 56.8% | 8 | 211 | —（字与笔画同为白，量不出层次） |
| 390×844 | `6d745fe` | **62.1** | **3.3%** | 35 | 170 | **6.78 : 1** |
| 390×664 | `8bbeeeb` | 138.7 | 60.4% | 10 | 221 | — |
| 390×664 | `6d745fe` | **71.0** | **6.8%** | 41 | 207 | **9.30 : 1** |
| 1440×900 | 两版相同 | 15.2 | 2.9% | 3 | 153 | 7.25 : 1 |

平均亮度降到修补前一半、亮像素从五成多降到个位数；对比按 WCAG 相对亮度算，390 两种视口 6.8 / 9.3 都过 4.5:1。近景截图：修补前只能认出「进 课」半个字，修补后「进入课堂」四字 + 箭头 + pill 描边完整，笔画被 blur 揉成灰底。**通过。**

### 0.3 第 2.3 节第 3 条 · 命中与进课

`elementFromPoint(按钮中心)` 三种视口都是 `#enter-btn`。点（390 用 `tap`）后 `body.started`、`hash = #p01`、`#loader visibility: hidden / opacity 0`、第一页 `.page.is-on`，`h1` =「《HTML+：AI 时代的工作表达新方式》」、`.sub` =「不用学编程，也能做出能讲、能点、能分享的工作成果」；390 `.hud display: flex` / `.rail none`，1440 反之。`Enter` / 空格 / `scrollTop = 90%` 在 390×844 与 390×664 各一次，全部 `started` + `#p01`。**通过。**

### 0.4 回归 grep（`8bbeeeb` / `6d745fe`）

冻结句 10 个计数 `1/1、1/1、1/1、3/3 · 6/6 · 9/9 · 7/7、1/1、2/2、2/2` 全等（副标题 1/1 与首轮 3.1 备注一致）；`data-frozen` 15 / 15；`data-note="…"` 20 / 20 逐字 diff 为空；`Cursor / Vite / React / vibe / Html大法 / 三招 / PlayCanvas / Three.js / THREE / npm / fonts.googleapis / fonts.gstatic / @font-face / <link / https:// / http:// / Kage / 朱红 / vermilion` 全 0；`HyperFrames` 1、`AI Coding` 2、`editSel` 2 不变。diff 新增色值只有 `rgba(7, 9, 13, .62)`（与 vignette 同色系，无红系）。不恶化。

### 0.5 复验备注（非阻塞，不影响通过）

- 第 2.1 节建议的 `.door-cue { text-shadow }` 未做：390×664 下 cue「下滑进入」矩形亮像素仍 32%（390×844 为 7.7%），与基线相同。cue 不是 CTA，不在 2.3 节量法内，且 0.88 进课前用户主要看按钮；记入批次 I 顺手补。
- 第 2.1 节建议 `DESIGN.md` 「门页排版 · CTA」句尾补「手机上加半透明黑场垫底」未做（PR #26 只改 `index.html`）；`DESIGN.md` L52「细描边 pill；不要实心大按钮挡画面」与实现不冲突，批次 I 一并补一句。
- PR #26 commit 标题为 `HTML+ 批次H：手机进入按钮可读`，与第 4 节建议的标题不同，主题清楚，不要求改。
- 3.1（门页不放冻结副标题）、3.2（`得物` 标志裁顶）仍待 Hao，PR #26 描述已列。

---

## 首轮结论（`8bbeeeb`）：打回

六条标准里五条满足（层栈与细 CTA、多速率视差 + stagger + reduced-motion、三条进课路径与 HUD 时机、无禁用依赖 / 无朱红 / 冻结句与 `data-note` 完整、`DESIGN.md` 更新），**第 5 条「手机 390 门页可读」不满足**：390 宽下「进入课堂 →」CTA 落在海报大字「工作表达新方式」的白色笔画上，按钮是 1px 白描边 + 白字、无底色，实测按钮矩形内 55.6% 像素亮度 > 160、平均亮度 124（白字 255），字与描边都溶进笔画里，读不出来；390×664（Safari 带工具栏）同样 56.2%。桌面 1440 无此问题（同位置平均亮度 3）。

批次 H 把手机标题挪到左上、避开了海报大字（这一点比批次 G 好），但 CTA 由实心 Klein 块改成细描边后失去了垫底，正好停在海报 headline 带上。这是一条 `@media (max-width: 979px)` 里的 CSS 修补，QA 已用注入样式预演通过，见第 2 节。修完按第 2.3 节量一次即可再提交，不需要重做批次 H 其他部分。

---

## 1. 逐条证据

### 1.1 标准 1 · 完整 landing hero 层栈；CTA 细描边

层栈（1440×900，`getComputedStyle`）：

| 节点 | L | `position` | `z-index` | 实测 | 结果 |
|---|---|---|---|---|---|
| `.door-mid` + `img.door-still` | L1349 / L1353 | absolute（在 `.door-sticky` 内） | 0 | `cover-poster.webp` 1440×900 铺满，`object-fit: cover`，`object-position: center 46%` | ✓ 底景海报 |
| `.door-read` → `.door-hero` | L1350 / L1452 | absolute | 10 | eyebrow「00 · 门前」10px / 0.22em uppercase；`.door-mark`「走进 HTML+」73.6px、字重 400、`line-height` 77.28px（1.05）、`letter-spacing` −0.88px（−0.012em）、`text-shadow 0 2px 34px`；`.door-lede` 14.7px、字重 300、`max-width 320px`；两条竖排 `POIZON DESIGN` / `OPEN CLASS` | ✓ 阅读层 |
| `.door-near` → `.door-fg` | L1351 | absolute | 20 | 四角 22px 角标、右下 200×133 3:2 线框（含 20px 窗口条）、`\ HTML+ /` 10px | ✓ 近景 cut-out |
| `.door-vignette` | L1368 | fixed | 55 | `radial-gradient(125% 95% at 50% 42%, transparent 40%, rgba(7,9,13,.55))` | ✓ vignette |
| `.door-grain` | L1372 / L2942 | fixed | 60 | `background-image: url(data:image/png;base64,…)`，canvas 180×180 `toDataURL`，`opacity .055`，`mix-blend-mode: overlay`，`background-size 180px` | ✓ grain |

`.door-sticky` 是 `position: sticky`（自成 stacking context），三个 `.door-layer` 的 0 / 10 / 20 在其内排序；vignette / grain 是 `#loader` 直系 fixed 子节点，55 / 60 排在 sticky 之上。CTA 与文字在 z 10，在 grain 之下，与 PR 描述一致。

CTA `.enter-btn`（L1580）：`background: rgba(0,0,0,0)`、`border: 1px solid rgba(255,255,255,.28)`、`border-radius 999px`、11px / 0.22em uppercase、106.7×33.6px；箭头 `.arr` 色 `rgb(122,162,255)` = `--klein-on-dark`。hover 实测：`border-color rgba(255,255,255,.55)`、`translateY(-2px)`、箭头 `translateX(4px)`、背景仍透明。不是实心块。scroll cue「下滑进入」9px / 0.3em + 54×1px 轨 + `door-cue-sweep` 扫光。

**通过。**

### 1.2 标准 2 · 多速率视差；stagger；reduced-motion

`.door-track` 185vh（L1335）；1440×900 下 `scrollHeight 1665 / clientHeight 900 / max 765`；390×844 下 `1561 / 844 / 717`。`CSS.supports("animation-timeline","scroll()")` = true，三层各挂 `animation-timeline: --door`（L1615–1628）。

`scrollTop = 50%` 时的 `getComputedStyle().transform`：

| 层 | 1440×900 | 390×844 | 到 t=1 的目标（keyframes L1629–1640） |
|---|---|---|---|
| `.door-mid` | `matrix(1.02, …, 0, -18.02)` | `matrix(1.02, …, 0, -16.9)` | `translateY(-4%) scale(1.04)`（最慢） |
| `.door-read-shift` | `translateY(-31.5px)` | `translateY(-29.6px)` | `-7vh`（中） |
| `.door-near` | `translateY(-72.1px)` | `translateY(-67.6px)` | `-16%`（最快） |

三层三种速率，全是 translate（`.door-mid` 附加 4% 缩放），不跟指针。无 SDA 的降级路径：注入 `CSS.supports` 返回 false 并 `animation: none` 后，`applyDoorParallax` 在 50% 处写出内联 `translate3d(0,-2.0%,0) scale(1.02)` / `-8.0%` / `-3.5vh`，与 SDA 路径数值一致（L2928–2932）。

字入场：`wireDoorReveal`（L2970）给 6 个 `[data-rv] / .mask-line` 节点写 `data-rvd = 0 / 85 / 170 / 255 / 340 / 425ms`，`IntersectionObserver`（root = `#door-scroller`）触发后按延迟加 `.rv-in`；加载 150ms 时实测 eyebrow `opacity .21`、`.door-mark` `.rv-in` 已加但 `opacity 0`（刚起步）、lede / cue / 两侧竖排还未加——是逐个进场；1450ms 时 6 个全部 `opacity 1` / `transform none`。`.door-mark` 同时是 `.mask-line`，内层 `span` 从 `translateY(110%)` 滑入（L1520–1526）。900ms 兜底（`8bbeeeb` 加的）保证观察器不触发时也能全部露出。

`prefers-reduced-motion: reduce`（1440 与 390 各一次）：`.door-scroller overflow-y: hidden`，`.door-track height 900px`（= 一屏，`max = 0`），`.door-mid / .door-near / .door-read-shift` `animation-name: none`、`transform: none`，`.door-cue display: none`，`.door-cue .track i` 无动画，6 个 `[data-rv]` 一律 `opacity 1`（脚本直接加 `.rv-in`，L2973–2976），静态封面可读；`Enter` 仍能进 P01。

**通过。**

### 1.3 标准 3 · 进课路径与 HUD 时机

每条路径单独新 context，1440 与 390 各跑一遍：

| 路径 | 结果（两种视口相同） |
|---|---|
| 点 `#enter-btn` | `body.started`、`#loader visibility: hidden / opacity 0`、`hash = #p01`、P01 `h1` =「《HTML+：AI 时代的工作表达新方式》」 |
| `Enter`（L2530） | 同上 |
| 空格（L2530） | 同上 |
| 滚到阈值（L2939 `t >= 0.88`） | `scrollTop = 50% / 80%` 未进课；`= 90%` 进课，`hash = #p01` |

按钮命中：`elementFromPoint(按钮中心)` 两种视口都返回按钮本身（vignette / grain / 近景层都是 `pointer-events: none`，`.door-cta` 单独 `pointer-events: auto`）。

HUD 时机：进课前 `.rail / .hud / .dock` `visibility: hidden; pointer-events: none`（L1663–1668），进课后 `visibility: visible`；桌面 `.rail display: flex`、`.hud display: none`（桌面本就不用 HUD，L1670），390 下 `.hud display: flex`、`.rail none`。`#loader.done .door-hero / .door-cta` 0.15s 先淡出（L1321–1322）。P01 两种视口截图正常（Klein 卡片、四动作、讲稿）。

**通过。**

### 1.4 标准 4 · 无禁用依赖；无朱红；冻结句 / `data-note`

`grep -c -F`（`8bbeeeb` 的 `index.html`）：`Three.js / three / THREE / npm / PlayCanvas / playcanvas / fonts.googleapis / fonts.gstatic / @font-face / <link / https:// / http:// / import ` 全 0；唯一外部资源是 L1900 `src="cover-poster.webp"`（同目录相对路径）。`cursor: none / url(` 0，`<audio / new Audio` 0。`Cursor / Vite / React / vibe / Html大法 / 三招` 0；`Kage / kage / 朱红 / vermilion` 0。

新增色值只有 8 个：`rgba(0,0,0,.7)`（线框投影）、`rgba(1,194,195,.55)`（极光青圆点光晕）、`rgba(255,255,255,.28/.36/.46/.48)`（描边 / 微标签）、`rgba(3,6,8,.72)`（标题阴影）、`rgba(7,9,13,.55)`（vignette）。无红系。删掉的是 `rgba(0,47,167,.45)`（旧实心按钮光晕）等 5 个。

§5.3 冻结句 `045088a` → `8bbeeeb`：`1/1、2/1、1/1、3/3 · 6/6 · 9/9 · 7/7、1/1、2/2、2/2`；`data-frozen` 15 / 15；`data-note` 20 / 20，且 20 条 `data-note="…"` 内容逐字 diff 为空；`HyperFrames` 1 / 1、`AI Coding` 2 / 2、`editSel` 2 / 2。唯一计数变化是副标题「不用学编程…」2 → 1：门页删掉了不带 `data-frozen` 的那份 `.loader-sub`（基线 L1845），P01 带 `data-frozen` 的那份原样在（进课截图可见）。§5.3 要求「出现次数 ≥ 1 且字符串一致」，满足；`DESIGN.md` L54 已说明「海报已有课名大字，不再叠冻结副标题」。记入 3.1 待 Hao 确认。

diff 范围：`index.html` 10 个 hunk 全部落在门页 CSS（L1318–1660、L1828–1848）、门页 HTML（L1896–1948）、门页 JS（L2426–2431、L2914–3006）；课堂 20 页、`FROZEN`、`go()`、快捷键、`bindEdits` 未动。改动只在 `demos/html-plus-course/`（3 个文件）。无头运行全程 0 `pageerror` / 0 console error。

**通过。**

### 1.5 标准 5 · 1440 + 390 可读；海报构图可辨

桌面 1440×900：

- 门页：海报双手、窗口、`AI 时代的 \ 工作表达新方式 /`、`得物 POIZON`、`TIME / ADD` 一屏全在，构图完整。左上 eyebrow / 标题 / lede 压在海报背景大字「H」的暗灰笔画上，靠 `text-shadow` 与 0.62 白可读；把阅读层隐藏后量到标题区平均亮度 22、lede 区 24、CTA 区 3、cue 区 3（全暗底），无冲突。
- 下滑 50% / 80%：三层错速可见（海报上移 18 / 29px，近景线框上移 72 / 115px），P01 在 90% 处接上。
- P01：`.rail` + `.dock` + 舞台正常。

手机 390×844（`@media (max-width: 979px)` L1831–1847：海报放大 122%、`left -11% / top -8% / object-position center 34%`；近景 / 竖排隐藏；标题 `clamp(1.65rem, 8vw, 2.05rem)` = 31.2px）：

- 标题「走进 HTML+」（y 50–83）与 lede（y 105）在海报窗口之上的暗区，可读；比批次 G（标题压在「AI 时代的」上）明显改善。
- 海报窗口三行字、`AI 时代的` 一行可辨；双手因 3:2 → 竖屏 cover 被裁掉、`工作表达新方式` 左右各裁一字（`作表达新方`），属横版海报进竖屏的固有代价，批次 G 同样如此。
- **CTA 不可读**：`#enter-btn` 矩形 `x 18–125 / y 759–793` 正好落在海报 headline 第二行白色笔画上。隐藏阅读层后量该矩形：平均亮度 123.8、亮度 > 160 的像素 55.6%；按钮白字 / 白描边与笔画叠成一团（2× 截图里只能勉强认出「进 课」两个字的一半）。390×664 下 CTA 矩形 56.2% 亮像素，同样不可读，且 cue「下滑进入」也有 27% 亮像素。桌面同一元素 0%。
- P01：390 下 HUD + dock + Klein 卡正常，与批次 G 一致。

**打回（仅 390 CTA 一项）。** 修补见第 2 节。→ 复验 `6d745fe` 已通过，见第 0 节。

### 1.6 标准 6 · `DESIGN.md` 更新

`DESIGN.md` diff：Overview 改为「Kage 式短距 landing hero」；Colors 加「门页不借用 Kage 朱红色 / CTA 不用实心 Klein 块，Klein 只作箭头」；Typography 新增门页排版 5 条（字重 400 / 1.05 / −0.012em、微标签 9–11px、lede 300 / 320px、竖排、CTA 细描边）；「门页规则 · Kage-inspired layer stack」z 0 / 10 / 20 / 55 / 60 表 + 8 条规则；Motion / Do / Don't 更新（明确不借朱红、Three 寺庙、五章叙事、PNG 素材库、音频、大光标）。与实现逐项对得上（z 值、185vh、`toDataURL` 180px、`.055` overlay、手机隐藏近景 / 竖排）。`README.md` 两处同步（层栈、1.8 屏）。

**通过。**

---

## 2. 修补清单（打回项，只有一条）

### 2.1 必改

**H-1 · 390 宽下 CTA「进入课堂 →」压在海报白色大字上，无底色不可读**

在 `@media (max-width: 979px)`（L1686 起，门页手机规则 L1831–1847 附近）加一条，只对手机生效，桌面不变：

```css
/* 手机：细描边保留，只补一层半透明黑场垫底，不回到实心 Klein 块 */
.enter-btn {
  background: rgba(7, 9, 13, 0.62);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.door-cue { text-shadow: 0 1px 8px rgba(7, 9, 13, 0.9); }
```

- QA 已用注入样式在 390×844 / 390×664 预演：描边 pill 形状和 11px 字在白笔画上清晰可读，箭头 Klein 色保留，风格仍是「细描边 + 文本」而不是厚重实心块，符合标准 1。
- 对应 `DESIGN.md` 「门页排版 · CTA」句尾补一句「手机上加半透明黑场垫底」即可。
- `.enter-btn:hover / :active` 现在写的 `background: transparent` 是桌面规则，手机媒体查询里这条会覆盖它；如果想更保险，可把 hover 一起写进媒体查询。

### 2.2 可接受的替代方案（择一即可，不必叠加）

- 手机专用底部渐变：`.door-read::after { content:""; position:absolute; inset:auto 0 0 0; height:30vh; background: linear-gradient(0deg, rgba(7,9,13,.88), rgba(7,9,13,.55) 55%, transparent); pointer-events:none }`（批次 G 桌面曾有 36vh 同类渐变）。QA 预演可读，但会把海报 headline 整体压暗一档，构图损失比 2.1 大。
- 不接受：改回实心 Klein 大按钮（与标准 1 / `DESIGN.md` 冲突）；把 `.door-still` 手机 `top: -8%` 改成 `0`（QA 试过：`得物` 标志会与标题「HTML+」重叠，见 3.2）。

### 2.3 再次验收时 QA 会量的三个数（390×844 与 390×664 各一次，加载 1.3s 后）

1. 隐藏 `.door-read` 后，`#enter-btn` 矩形内亮度 > 160 的像素占比不作要求，但**不隐藏**阅读层截图时，按钮字「进入课堂」四字与 pill 描边肉眼完整可辨（2× 截图）。
2. `getComputedStyle(#enter-btn).backgroundColor` 在 390 下不是 `rgba(0,0,0,0)`；在 1440 下仍是 `rgba(0,0,0,0)`（桌面不变）。
3. `elementFromPoint(按钮中心)` 仍返回按钮；点击 / `Enter` / 空格 / 滚到 90% 四条路径仍到 `#p01`。

同时复跑 1.4 节 grep（冻结句 10 个计数、`data-frozen` 15、`data-note` 20 且内容不变、禁词 0）。

---

## 3. 非阻塞备注（不构成打回，记入后续批次或待 Hao）

3.1 **门页不再显示冻结副标题**「不用学编程，也能做出能讲、能点、能分享的工作成果」：批次 G 门页有一份（非 `data-frozen`），批次 H 删掉，只剩 P01 那份。`DESIGN.md` 有说明，§5.3 计数 ≥ 1 满足。待 Hao 确认门页不放副标题是否可以。

3.2 **390 下 `得物` 标志被裁顶**：`.door-still top: -8%`（L1835）让海报顶部 67px 出画，`得物` 方框只剩下缘 + `POIZON` 字样，且 `POIZON` 与标题末尾「HTML+」的「+」几乎相接（x 150–240 / y 60–115 对 x 18–306 / y 50–83）。QA 试 `top: 0` 会让标志整个压到标题上，更差；这是横版海报进竖屏的两难，建议待 Hao 定：(a) 接受裁顶；(b) 手机标题再下移 / 缩小；(c) 出一张竖版海报。

3.3 **阅读层是「滚出画面」而不是淡出**：`door-read` 到 t=1 上移 7vh，390 下 eyebrow 在 t≈0.35 就出了顶（top −0.7px），t=0.8 时标题 top 2.7px 贴边；桌面 t=0.8 eyebrow top −1.4px。0.88 就进课，所以主讲看不到太久，但如果想更像 Kage，可以给 `.door-read-shift` 在 t 0.6→1 加 `opacity 1→0`，或手机把 `-7vh` 收到 `-4vh`。

3.4 **桌面近景线框与海报手写 `Approach` 相接**：`.door-peek` 左缘 x 1153.6 / y 640–774，压到 `Approach` 的「h」上扬笔画尾端和 headline 右侧「/」的一角；海报字仍完整可读。若要干净，`right` 从 `clamp(56px, 6vw, 110px)` 收到 `clamp(40px, 4vw, 72px)` 或 `bottom` 抬 40px。

3.5 **品牌字样重复**：海报自带横排 `POIZON DESIGN` / `OPEN CLASS`（顶部两角）+ 自带角标；门页又加竖排同文（`.door-side`，L1559）+ 四角 `.door-tick`（L1382，与海报左上角标基本重合）。桌面看是双份，不影响可读；手机已隐藏。可考虑只留一份。

3.6 **`body:not(.started) { overflow: hidden; height: 100% }` 写了两遍**（L1308 与 L1659，批次 H 新增第二份）；`--rv-delay` 自定义属性定义了但 JS 用 `setTimeout` 做 stagger，没有节点设过它（L1518 / L1525）。都无副作用，下批顺手清。

3.7 **视差 50% 的实测值**是 SDA 路径（Chrome 148）；无 SDA 浏览器走 `applyDoorParallax`，QA 用注入方式验证过数值一致，但 Safari 真机没测。

3.8 **提交方式**：批次 H 4 个 commit（`07b73db / bfcb4f3 / fd26eae / 8bbeeeb`），与 §5.6「每批一个 commit」有出入；都在同一主题下，不要求 squash，记录一下。

---

## 4. 给批次 H 修补的交接

- 基线仍是 `8bbeeeb`；只改第 2.1 节一条手机媒体查询（+ `DESIGN.md` 一句）。
- 不碰层栈 z 值、三层 keyframes、`wireDoorReveal`、`paintDoorGrain`、`enterClass`、`t >= 0.88`、冻结句、`data-note`。
- commit 标题沿用 `HTML+ 批次H：Kage式门页（修补 390 CTA 垫底）`，PR #24 描述追加「手机 CTA 加半透明黑场垫底；门页不放冻结副标题、`得物` 标志裁顶待 Hao 确认」。
- 修补通过后再开批次 I；开工时把 3.2 / 3.3 / 3.4 一并带上。
