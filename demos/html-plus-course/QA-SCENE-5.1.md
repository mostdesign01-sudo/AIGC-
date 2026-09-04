# HTML+ 场景 5.1 · 批次 M 收口验收

- 对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-batch-m-e5cb`，叠在 `cursor/html-plus-batch-l-6af8`（PR #33）之上。
- 依据：`OPTIMIZATION-SCENE-5.1.md` §批次 M + §6 全文（约 24 项）。
- 方式：Chrome 无头 1440×900 / 390×844；`getComputedStyle` / `scrollWidth` / `getBoundingClientRect`；`grep -c -F` 冻结句与禁词。打开方式同简报：单文件、无网络。
- 执行：Grok 4.6。I→L 视觉决定未回退。有争议写「待 Hao」。

---

## 结论

§6 全勾。390 二十页无横滚；底栏 HUD 40 + dock 44 = **84px ≤ 96**；有 `.page-fore` 的页底 **alpha .78**（不是 .94 实心卡）。桌面 `prefers-reduced-motion` 全静态可读。冻结句 / `data-note` / 页序 / 禁词 0。

**待 Hao（前批已挂，本批未改）：** `--display-weight: 700` + glow；P13/P14「AI Coding」两句；母本 ≥2400 宽原图（现 1200×675，1.6× 会发软）。

---

## 批次 M 本批实测

| 项 | 证据 | 结果 |
|---|---|---|
| 手机无 near | 390 下 P01–P19 `.scene-near` `display:none`，子节点 0 | ✓ |
| P20 一个指尖 | 390 P20 `display:block`，1 个 `.cut`（`tip-l`），贴底栏之上 | ✓ 简报例外 |
| wash ≤ .8 | 手机 `.scene-wash` 最高 `rgba(7,9,13,0.8)`，无 `!important` | ✓（J 已落，M 未改） |
| far 机位保留 | 390 换章 `data-ch` 仍写 0–5 | ✓ |
| reduced-motion | veil `display:none`；far `transition-duration: 0s`；cut / fore `transform: none`；ring `none`；指针左右扫 `--par` 与 far 位移皆空 | ✓ |
| 390 无横滚 | P01–P20 `scrollWidth === clientWidth === 390` | ✓ |
| 底栏 ≤ 96 | 二十页 `chromeH = 84`（hud 40 + dock 44） | ✓ |
| page-fore 非 .94 | 有 fore 的页 `background-color` alpha **0.78** | ✓ |
| `.shirt-skin` | 2400×2400 试图：skin 66×74 落在 shirt 118×124 内，`inside: true` | ✓ L 暴露、M 修 |

截图（附 PR）：门页 / P01 / P03 / P07 / P13 / P20 × 1440 + 390，另 P03 桌面 reduced-motion。

---

## §6 逐条

### 门页一眼是海报母本延展

- [x] 底景是 Hao 母本（双手从下角相触、得物方标居中顶部、窗口在下 1/3），不是「捏窗」旧版。1440 / 390 门页截图。
- [x] 屏上只有一套 `POIZON DESIGN / OPEN CLASS`、一扇窗口、一个得物方标（全是海报的）。课程层无竖排复写、无 CSS 假窗口。
- [x] 课程层只加了：`\ 00 · 门前 /` eyebrow、骨白重字重 `走进 HTML+`、一句 lede、窗口底边「进入课堂 →」、右侧下滑 cue。
- [x] 轻滚时手与窗口比字母动得多（桌面 scroll-timeline / JS 视差保留）；点窗口 / Enter / 空格一步到 P01（无头点 `.door-win` → `body.started` + `#p01`）。
- [x] 390：`object-fit: contain; object-position: 50% 60%`；门页 near cut `display:none`（手在海报本体里）；窗口可点。

### 内页不再「蓝卡片墙」

- [x] `background: var(--klein)` = **1**（仅 `::selection`）。`rgba(0, 47, 167` 只在 `--klein-wash` .18 与 keyframe 散到 0。章首无纯色底。
- [x] P02 / P04 / P07 / P09 / P12 / P18 字压画面；选中是描边 + 骨白 / Klein-on-dark，不是实心蓝块（I 已落，M 未改用法）。
- [x] P07 `.demo`、P13–15 `.device`、P19 `.prompt`、讲稿均为 `.win`（`— ☐ ✕`）。无头：P07 / P13 `classList.contains("win")`。
- [x] 极光青仍只在 tick / 进度 / eyebrow 点 / Approach / `【谁】【什么事】` 下划线。本批未新开青。

### 至少三层视差可读

- [x] 桌面指针 far / mid / fore / near 仍 4 / 8 / 14 / 24（J/K，M 未改桌面）。
- [x] 换章写 `data-ch` 换机位；同章只换 wash。六机位终值见 `DESIGN.md` / `README.md`。
- [x] P01 / P03 / P06 / P12 文案安全区沿用 J（本批未动机位）。1440 截图标题在安全区。
- [x] 章标 `.scene-mark.sl` 18px 骨白；reduced-motion 下不出现、无 veil。
- [x] 手机每页都能看到母本一部分：wash ≤ .8、fore .78、P03 390 截图可见底景纹理，不是黑卡。

### 前景有克制互动

- [x] 桌面 near 非空恰好 10 页：P01 二指尖、P03/P08/P17 左手、P06 右手、P12 右指尖+Approach、P13/P15 左指尖、P14 右指尖、P20 左右指尖+Approach。讲解页 0。门页另计。
- [x] 手 `pointer-events: none`。手机除 P20 外 near 关闭。
- [x] P07 点四动作 `winAct` = hold → org → recv → reply；P13 四拍 `beatState` = was / lack / act / who；P05「点一下」两句互换（「内容随操作变化」↔「别人自己看、自己选、自己走下一步。」）；P12 两枚 near（tip-r + approach）。
- [x] P19 `#prompt.textContent` 与 §5.3 第 6 条逐字一致。P18 点一题后 P19 出现预览行（`#job-out` 有 `data-hint` 原文）。刷新后内存态清空——未写入 `localStorage`（L/K 约定，M 未改）。

### 课还能讲完

- [x] 冻结句 `grep -c -F`：课名 1、副标题 1、定义 1、装下内容 3、组织信息 6、接收操作 9、给出回应 7、金句 1、提示词 1、结课句 2。`data-frozen` 7（6 元素 + `editSel`）。`data-note` 20。`chStarts = [0, 2, 5, 7, 11, 16]`。
- [x] 禁词 0：`Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas / Three.js / @font-face`。`HyperFrames` 1（`.hf`）。工具名只有 **蓝龙虾**（6）。品牌英文只有 **POIZON**（6）。
- [x] 不点近景也能按讲稿三段讲完：近景不可点；P05 / P07 / P13 互动都在既有按钮上。
- [x] `prefers-reduced-motion`：门页 overflow hidden、轨道 100%、无 cue、无机位动画；课堂无 veil、far 过渡 0s、cut/fore 无位移、无视差、无 ring。P03 1440 reduced 截图静态可读。
- [x] 390 二十页无横滚、底栏 84px、无元素被底栏永久遮住（`revealAboveChrome` 仍在；padding-bottom = hud+dock+24）。
- [x] `assets/poizon/` 无 `.js / .wasm / .glb / .json / .mp4`。素材缺失处仍写「待补」。

24 / 24。

---

## 本批改动边界

只动了手机 near 例外、reduced-motion 补洞、`.shirt-skin` 显式盒、README / DESIGN 机位说明。未改字重、机位数字、cut 裁切、去蓝、冻结句、`data-note`、页序。未编静帧、未开新互动、未引入引擎。
