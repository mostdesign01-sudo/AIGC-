# HTML+ 批次 F · 5.1 验收（海报视觉中档）

- 验收对象：`demos/html-plus-course/index.html` + `README.md`，分支 `cursor/html-plus-batch-f-5b8d`（PR #21，base = `cursor/html-plus-batch-e-157f` @ `420dd28`，批次 E 已过 5.1，PR #20）。HEAD `ec1e190`，一个 commit `HTML+ 批次F：海报视觉中档`，只动这两个文件（`index.html` +204 / −50，`README.md` +3 / −3）。
- 验收依据：Hao 授权的视觉例外（中档 = 门页海报化 + 全局黑场色板；主色仍 Klein `#002FA7`；极光青不进正文 / 大标题）；本批 7 条验收标准；`OPTIMIZATION-5.1.md` §5.1 / §5.2 / §5.3 / §5.6；`QA-BATCH-E-5.1.md` §3.1 / §3.2。
- 验收方式：通读 `420dd28..ec1e190` 全部 diff；把两版 `index.html` 的 `</style>` 之后（HTML + JS）单独 diff，确认标记只多了 `#loader` 内 11 行、JS 0 行；`grep -o -F | wc -l` 核对冻结句、禁词、`data-note`、外链；20 个 `data-note` 值逐条 diff；Chrome 148 无头（DPR 2）渲染 1440×900 / 1280×800 / 1920×1080 / 1366×768 / 1280×720（桌面）与 390×844 / 360×780（`isMobile + hasTouch`），`localStorage` 先清空，门前读 13 个元素的 `getBoundingClientRect / getComputedStyle`，点「进入课堂」与按 `Enter` 各走一次，再走 P01 → P04（点岗位卡）→ P07（开讲稿）→ P13 → P14（选 01 + 02）→ P19 → P20 → P03 → P09 / P10 / P11 / P02 / P05 / P16 / P18 截图；按 WCAG 相对亮度公式算 34 组前景 / 背景对比度；监听 `pageerror` / console error / 非 `file://` 请求。
- 验收人：Fable 5.1 QA。不改 `index.html` / `README.md`，只新增本文件。

---

## 结论：通过

七条标准全部成立，无必改项。门前是黑场（`#07090d` + 两层径向暗角 + 极轻颗粒），`HTML+` 大字与「走进 HTML+」带白色 bloom，无任何 `img / url()`，五层文案桌面 + 390 都在视口内且对比度 ≥ 5.3:1，「进入课堂」与 `Enter` 一步到 P01；全局 token 换成暗场阶梯后左栏 / 卡片 / HUD / dock / 讲稿面板统一，正文对比度 10:1 以上、辅文 ≥ 4.8:1；Klein 仍是按钮 / 选中卡 / `.klein-bar` / 设备顶栏 / 章封面的颜色；极光青只多了一处 `Approach` 手写点缀，`h1 / h2 / .gold / .lede` 无一处用它；冻结句、`data-frozen`、20 条 `data-note`、`editSel`、JS 与 E 基线逐字相同，禁词 0，`HyperFrames` 1，`http / @import / <link / @font-face` 全 0；两处台上 `AI Coding` 原样；QA-E 3.1 的一行 CSS 已加，390 / 360 开讲稿后滚到底 P07 身份键、P14 / P15 价值栏都在面板之上。

**海报中档收口。** 若 Hao 要重皮，可开下一视觉深档；开工前把第 3 节 3.1（门前 Klein 小横线压在 `CHAPTER 00` 上，一行 CSS）顺手带上，3.2–3.9 待 Hao。

---

## 1. 逐条证据

### 1.1 标准 1 · 门前

黑场 / 发光 / 无假建筑（`getComputedStyle` 读数，五个视口一致）：

| 项 | 证据 | 结果 |
|---|---|---|
| 黑场 | `#loader` `background: rgb(7, 9, 13)`；`.door-field` `background-image` = 两层 `radial-gradient`（底部 `rgba(20,40,80,.28)` 冷雾 + 顶部 `rgba(0,0,0,.45)` 暗角）叠 `var(--bg)`；`::before` `repeating-radial-gradient` 颗粒 `opacity .55`；`::after` 42vh 底部渐变 `rgba(7,9,13,.78) → transparent`（L1318–1357） | ✓ |
| 标题发光 | `.cine-word` / `.loader-title` `text-shadow: rgba(255,255,255,.42) 0 0 18px, rgba(255,255,255,.18) 0 0 48px`（`--title-glow`，L31）；截图目视 `HTML+` 与「走进 HTML+」有白色 bloom | ✓ |
| 无假建筑 | `#loader` 内 `img / svg / canvas / video` = **0**；全文 `<img` 0、`url(` 0；`.door-still` 只剩空规则（L1328），无元素引用；目录里无 `t7-3.jpg / door-still.webp` | ✓ |
| 无整张海报硬贴 | 同上；海报气质只由 CSS 表达（线框 `.door-chrome`、斜杠、左右小字、`Approach`、Klein 小横线） | ✓ |
| 一层流程 | 点 `#enter-btn` → `body.started`、`#loader.done`、`hash = #p01`；按 `Enter` 同（5 个桌面视口各测一次）；进入前 `.rail / .hud / .dock` `visibility: hidden`，进入后可见 | ✓ |

五层可读（`HTML+` 大字 / `CHAPTER 00 · 门前` / `走进 HTML+` / 副标题 / `进入课堂`），全部在视口内、互不重叠：

| 视口 | `HTML+` | kicker | 标题 | 副标题 | 按钮 | `elementFromPoint(按钮中心)` |
|---|---|---|---|---|---|---|
| 1440×900 | 144–315，208px | 607–624，13px | 638–676，32px | 690–714，16px | 748–788，40px，Klein 底白字 | `#enter-btn` |
| 1280×800 | 128–299 | 515–532 | 546–584 | 598–622 | 656–696 | `#enter-btn` |
| 1920×1080 | 173–343 | 787–804 | 818–856 | 870–894 | 928–968 | `#enter-btn` |
| 390×844 | 59–129，85.8px | 561–578 | 592–619，22px | 633–654，14px | 688–728，40px | `#enter-btn` |
| 360×780 | 55–120，79.2px | 483–500 | 514–540 | 554–596（两行） | 630–670 | `#enter-btn` |

对比度（前景按 alpha 与 `#07090d` 混合后算）：kicker `.55` **6.24**、副标题 `.72` **10.27**、提示 `.5` **5.32**、按钮白字 / Klein **10.69**、`HTML+` `.94` ≈ 17。装饰层：左右小字 `.38` 3.47、斜杠 `.32` 2.79、线框 `.38` 3.47——都是 10–11px 点缀不承载信息，可接受。390 下 `.door-slash / .door-klein-tick` `display: none`，`.door-chrome` 缩到 280×120、位于大字与文案之间（227–347），与文案块无纵向重叠。

**通过。** 备注见 3.1（Klein 小横线压 kicker）与 3.2（线框 / `Approach` 与大字叠压）。

### 1.2 标准 2 · 全局 token 与黑场统一；Klein 用途

Token（L18–32）：`--bg #07090d / --stage #0c0f14 / --surface-1 #12161d / --surface-2 #181d26 / --surface-3 #1f2530`，`--ink/--text #f5f7fa / --soft #c4c8d0 / --dim #8b909a`，`--line rgba(255,255,255,.12)`，新增 `--title-glow / --chrome / --klein-on-dark #7aa2ff`；`color-scheme: dark`（L68）。`.rail / .hud / .dock / .notes / .main / .stage` 全部改用这组变量（L100–102、L1611–1612、L1681–1684、L1776–1782、L1266）；`.mat-ph` 三处写死的 `#d4d4d4 / #666 / #888`（QA-C 3.7）顺手换成 `var(--surface-3 / --soft / --dim)`（L916–920）。

实测（1440×900 / 390×844）：`.rail` `rgb(7,9,13)` + 右侧 1px 线；`.stage` `rgb(12,15,20)`；手机 `.hud / .dock` `rgb(7,9,13)`，P01 封面页上 dock 也不再是浅灰板（`.main:has(.cover.is-on) .dock` → `var(--bg)`，L1681）；`.notes` `rgb(18,22,29)`。

对比度（WCAG）：

| 前景 / 背景 | 用在 | 比值 |
|---|---|---|
| `--ink` / `--stage` | 标题、正文 | 17.88 |
| `--soft` / `--surface-1` | 卡片 `p`、九格 10px | 10.81 |
| `--soft` / `--surface-2` | 定义 `.quote`、`.demo` | 10.08 |
| `--dim` / `--stage` | kicker 13px、P04 pills 11px | 5.99 |
| `--dim` / `--surface-1` | `.tag` 12px、`.scene .ex` | 5.66 |
| `--dim` / `--bg` | dock 文案 12px | 6.22 |
| `--dim` / `--surface-2` | `.hf` 10px、`.rows li` | 5.27 |
| `--dim` / `--surface-3` | `.mat-ph-wait` | 4.80 |
| `--klein-on-dark` / `--surface-1` | `.check .n`、讲稿标签 | 7.29 |
| `--klein-on-dark` / `--surface-2` | `#job-out b` | 6.79 |
| 白 / Klein | 按钮、选中卡、`.klein-bar`、封面 | 10.69 |
| 白 `.78` / Klein | 封面 `.sub / .ask` | 7.00 |
| 左栏 `.lab .78` / `--bg`；`.num .5` | 章名 14px；序号 12px | 12.02；5.32 |
| HUD `.lab .78`；`.num .5` | 11px；10px | 12.02；5.32 |

全部文字 ≥ 4.5:1。截图目视（P01 / P02 / P03 / P04 / P05 / P07 / P09 / P10 / P11 / P13 / P14 / P16 / P18 / P19 / P20，桌面 + 手机）无一块浅色板、无黑字压黑底。

Klein 仍在：`.enter-btn`（改为 Klein 底白字，L1544）、`.pick/.job/.scene/.door/.task/.dim.is-on`、`.roles button.is-on`、`.check.is-on / .is-stop`、`.beats4 button.is-on`、`.nono.is-on`、`.tl-btns / .tee-tools button.is-on`、`.klein-bar`、`.device-chrome`、`.vs .new`、`.rows li:last-child`、`.sum3 .who`、`.copy-row button`、`.notes-btn.is-on`、`.toast`、`.dots button.is-on`、`.klein-field` 四个章封面 + P01 + P20。P04 点「HR 入职导航」后 `.job.is-on` `rgb(0,47,167)`，`#job-out b` `rgb(122,162,255)`。`#002FA7` 直接当字色的四处（`.job-out b / .check .n / .notes .lab / .note-row b`）换成 `--klein-on-dark`，是暗底上 Klein 字对比不够（`#002FA7` / `#12161d` 只有 1.3:1）的必要替代；Klein 作底色的地方一处未动。

**通过。**

### 1.3 标准 3 · 极光青 / Approach 仅点缀

`grep -n aurora`：18 处引用（不含 L16 定义；基线 17），17 处与基线相同（rail tick、进度条、`.beat i`、`.flow i`、`.chain i`、`.klein-bar` 左线、`.quote / .prompt` 左线、`.punch u / .gold u` 下划线、`.demo .is-hl` 内阴影、`.tl > i`、`.dots .is-ch` 外框、HUD 当前章顶线、`.loader-bar-fill`），新增 **1** 处 `.door-approach { color: var(--aurora) }`（L1447）。`h1 / h2 / h3 / .gold / .lede / .punch / p` 的 `color` 无一处引用 `--aurora`；P01 `h1` `rgb(255,255,255)`、P20 `.gold` `rgb(255,255,255)`、P04 `.quote` `rgb(245,247,250)`。

`Approach`：28px（1440）/ 18px（390）斜体手写感，`opacity .82`、`rotate(-8deg)`、`pointer-events: none`、`aria-hidden` 容器内，不进任何标题元素，不进 `data-note`。字体栈 `"Segoe Script", "Apple Chancery", "Palatino Linotype", Palatino, serif` 全是本机字体，无 `@font-face` / 外链；Linux 无头下落到 serif 斜体，仍可读。

**通过。** 备注见 3.2（它与大字有叠压）。

### 1.4 标准 4 · 未越权

`grep -o -F | wc -l`，`420dd28` → `ec1e190`：

| 项 | 基线 | HEAD |
|---|---|---|
| 课名全句 / 前缀 | 1 / 2 | 1 / 2 |
| 副标题 | 2 | 2 |
| 定义全句 | 1 | 1 |
| `装下内容 / 组织信息 / 接收操作 / 给出回应` | 3 / 6 / 9 / 7 | 3 / 6 / 9 / 7 |
| 金句 / 提示词 / 结课句 | 1 / 2 / 2 | 1 / 2 / 2 |
| `data-frozen` / `FROZEN` / `editSel` | 15 / 2 / 2 | 15 / 2 / 2 |
| `data-note=` | 20 | 20（20 条值逐条 diff **相同**） |
| `HyperFrames` | 1（`.hf`） | 1 |
| `视频插件` / `蓝龙虾` | 3 / 7 | 3 / 7 |
| `POIZON` | 3 | 4（多的一处是门前 `POIZON Design` 小字，仍是唯一品牌英文） |
| `AI Coding` | 2 | 2 |
| `Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas / 四级 / 等级 / 层级 / Lovart / Just Design / 千图` | 全 0 | 全 0 |
| `http` / `@import` / `<link` / `@font-face` / `<script src` / `<img` / `url(` | 全 0 | 全 0 |
| `chStarts` / `enterClass` | 3 / 3 | 3 / 3 |

两版 `index.html` 取 `</style>` 之后单独 diff：唯一差异是 `#loader > .door-field` 从空元素变为含 `.door-chrome`（含三个 `<i>` 线稿图标）、`.door-slash`、两个 `.door-mark`、`.door-approach`、`.door-klein-tick` 的 11 行；20 个 `section.page`、rail / HUD / dock / notes 标记、`<script>` 全部 **0 行改动**。CSS 侧 diff 只落在 `:root`、`.rail`、`h1 / .gold` 加 `text-shadow`、编辑虚线框色、`.job-out b / .check .n / .notes` 字色、`.demo .is-hl`、`.mat-ph`、`#loader` 一族、`.enter-btn`、手机 `.hud / .dock / .nav-btns` 底色、`body:has(.notes.is-on) .page`；`.page / .stage / .split / .grid* / .beats4 / .device / .nono-*` 尺寸规则未动。

无点阵大手 / 第二人 / IP：新增标记只有线框、斜杠、两组小字、一个手写词、一条 3px 横线；无跟随指针、无迈步帧。无框架 / CDN：同上全 0；`file://` 打开全程 0 个非本地请求。

README 改动两处：门前一句（「黑场电影感 … 禁止假建筑」）与 §5.5 落地规则第 2 / 3 条（「黑场纯色 / 渐变」「黑场渐变垫底；Klein 只作按钮与强调条」），与代码一致；键表、冻结句指向未动。

commit 一个、标题 `HTML+ 批次F：海报视觉中档`、改动只在 `demos/html-plus-course/`，符合 §5.6。三个视口 0 `pageerror` / 0 console error；`documentElement.scrollWidth` = 视口宽（1440 / 1280 / 1920 / 390 / 360）。

**通过。**

### 1.5 标准 5 · 台上「AI Coding」

`AI Coding` 2 处，与基线同：P13 `.klein-bar`「可用 AI Coding 把已有物料收进同一页」、P14 `.klein-bar`「可用 AI Coding 先出能打开的操作台，再用人话改到能用」；两行不在 diff 里，截图（1440 P13 / P14，390 P13）原字可见。PR #21 描述「未做」小节写明「仍未改」。

**通过。**

### 1.6 标准 6 · QA-E 3.1 修补；3.2 注明

修补：`@media (max-width: 979px)` 内加 `body:has(.notes.is-on) .page { padding-bottom: calc(var(--hud) + var(--dock) + 24px + 200px); }`（L1795–1797），实测 `padding-bottom` = 308px；桌面 `.page` 规则未变。

| 视口 | 页 | 开讲稿后（`scrollTop = 0`） | 滚到底后 | 结果 |
|---|---|---|---|---|
| 390×844 | P07 | `#roles` 底 582.8 > `.notes` 顶 575.2（盖 7.6px，与 QA-E 记录同源） | `#roles` 底 **427.6 ≤ 575.2**；`elementFromPoint(身份键中心)` = `button` | ✓ |
| 390×844 | P14 | — | `.klein-bar` 底 **534.7 ≤ 575.2** | ✓ |
| 390×844 | P15 | — | `.klein-bar` 底 **535.4 ≤ 575.2** | ✓ |
| 360×780 | P07 | — | `#roles` 底 **363.6 ≤ 511.2** | ✓ |
| 360×780 | P14 / P15 | — | `.klein-bar` 底 470.8 ≤ 511.2 / 471.0 ≤ 490.9 | ✓ |

面板本身：390 高 184.8（P07），`bottom 760 == dock.top`，dock / HUD 不被压，三行标签 `口播 / 操作 / 过渡` 仍是三行（截图）。

QA-E 3.2（桌面讲稿面板盖 dock）：**未修**，1440×900 `.notes` 776–900 覆盖 `.dock` 836–900（重叠 1232×64），与基线一致；PR #21 描述已注明「未改，待确认」。按本批标准「可不修但需注明」，成立。

**通过。**

### 1.7 标准 7 · 抽检截图与对比度

门前 / P01 / P04（点岗位卡后）桌面 1440×900 + 手机 390×844 六张，另附 1440 门前两处局部放大（kicker + Klein 横线；大字 + 线框 + `Approach`）、390 P07 开讲稿滚到底、1440 P13，随 PR 附件。目视：黑场上白字与浅灰辅文清晰；Klein 卡 / 按钮上白字清晰；rail / HUD / dock 与舞台同一色系无断层；390 P01 封面 Klein 与底部黑色 dock / HUD 衔接正常。可读性数值见 1.1 / 1.2。

**通过。**

---

## 2. 修补清单

无。本批无必改项。

---

## 3. 非阻塞备注（建议随下一视觉批次顺手修，或待 Hao）

3.1 **门前 Klein 小横线压在 `CHAPTER 00 · 门前` 上**（本批新引入，桌面全视口）。`.door-klein-tick` 用 `bottom: clamp(210px, 38vh, 280px)`（L1455）定位，而 `.loader-copy` 的顶（= `clamp(28px, 9vh, 80px)` + 文案块 ≈ 213px）总在它上面几像素：1440×900 横线 617–620 vs kicker 607–624（落在「CHAP」的下半），1280×800 517–520 vs 515–532，1920×1080 797–800 vs 787–804，1366×768 / 1280×720 各差 2px 也叠上。目视像一条误画的下划线；不影响 kicker 可读（6.24:1），故不打回。一行修法（无头预演五个视口都得到横线在 kicker 之上 19px）：

```css
.door-klein-tick { bottom: calc(clamp(28px, 9vh, 80px) + 232px); }
```

390 / 360 下该元素 `display: none`，不受影响。

3.2 **线框与 `Approach` 叠在 `HTML+` 大字上**（构图，待 Hao）。1440×900 `.door-chrome`（490–950 × 222–462）与 `.cine-word`（72–651 × 144–315）重叠 161×93px，线框顶边与左上角穿过「+」和「L」的下半；1280×800 重叠 233×115px；1920 无横向重叠。`Approach`（516–635 × 190–248）落在「L+」上，1440 / 1280 / 390 / 360 都叠，青字压在白色发光字形上时局部对比只有 2.21:1（压在黑底上是 9.02:1）。海报式叠压可以是有意为之；若 Hao 想让「+」完整，`.door-chrome { top: 44%; }` 或 `.door-approach { left: clamp(44vw, 48vw, 52vw); }` 任一即可。不计入本批。

3.3 **P13 T恤在暗场上几乎融进背景**。SVG 内联 `fill="#1c2126"`（L2090）对 `.tee` 底色 `#181d26` 只有 1.04:1，描边 `rgba(238,244,246,.22)` 1.96:1；截图里只剩一圈淡轮廓和 `11` 字标，「拖一拖 · 换贴花」的对象不显眼。三键与拖动仍可用，不影响标准。这是标记里的写死色，本批「只改 CSS / 门前」的范围没碰它；下一视觉批次若开，建议 `fill` 提到 `#2a313c` 或把 `.tee` 底色改 `var(--surface-3)`，或加 `.shirt { filter: drop-shadow(0 0 1px rgba(255,255,255,.35)) }`。

3.4 **桌面 dock 页点 `.dots button.is-on` Klein 点在黑底上 1.86:1**（7px）。当前页点几乎看不见，只有章首点（极光青外框）清楚；`R` / 页码 / 左栏进度条仍能定位页。要改可把 `.dots button.is-on` 换 `var(--klein-on-dark)`，一行。

3.5 **`OPTIMIZATION-5.1.md` §5.5 / §6 与本批口径不一致**：§5.5「文件不在磁盘上 = 门前纯 Klein」「Klein 渐变垫底」、§6「门前：Klein 底或 T7 照片」「极光青只出现在 2px tick / 下划线 / 进度条」仍是浅色时代的写法；README 已改成黑场口径。简报不属于批次可改文件，建议 Hao 在简报里加一行「批次 F 起视觉例外：门前 / 全局黑场，Klein 作按钮与强调条，极光青允许门前一处 `Approach` 点缀」，或在下一批 README 里注明「视觉例外见 PR #21」。

3.6 **`h1` 与 `.gold` 的 `text-shadow` 是全局的**（L250 / L284）：P01 课名、P03 / P06 / P08 / P17 章封面金句、P20 结课句都带白色 bloom，含 Klein 底上的白字。截图上 Klein 底的 bloom 比黑底柔和，可读；若只想门前发光，把两处 `text-shadow` 收进 `.cover h1 / .klein-field .gold` 或删除即可。属风格选择，待 Hao。

3.7 **`.scene-mini button.is-on` 仍是 `#fff` 底 Klein 字**（L778，P10 选场景后）。黑场里唯一一块纯白按钮，与「选中 = Klein 底白字」的其它控件不一致；对比 8.6:1 不影响可读。可改 `background: var(--klein); color: #fff`。

3.8 **QA-E 3.2 桌面讲稿面板盖 dock**：未修，见 1.6；`.notes { bottom: 64px }` 仍是备选，待 Hao。

3.9 **沿用待 Hao 项**：P1-6 两处台上 `AI Coding`（1.5）；QA-D 3.1 P09 `.more` `-webkit-line-clamp: 1` 省略号、QA-D 3.6 `editSel` 双绑、QA-C 2.1 P14 设备框 420×304 非 3:2、QA-C 3.2 九格帮型与对比卡「—」并存、QA-E 3.3 外接键盘 `E`、QA-E 3.4 P17「点到」措辞——本批均未动，状态与 QA-E §3 相同。

---

## 4. 交接

- 批次 F 通过，`ec1e190` 为海报中档收口点；后续以此为基线。
- 若 Hao 决定开视觉深档（重皮）：先把 3.1 一行带上，3.2 / 3.3 / 3.6 / 3.7 由 Hao 挑；仍守 §5.1（不换字体栈、不引框架 / CDN、不加 IP / 第二人 / 点阵大手、不动冻结句与 `data-note`）。
- 若不开深档，3.1 建议在合并前作为「批次F：修补门前横线」单独一个一行 commit；不改其它文件。
- 本文件之外不改任何文件；`index.html` / `README.md` 保持 `ec1e190` 原样。
