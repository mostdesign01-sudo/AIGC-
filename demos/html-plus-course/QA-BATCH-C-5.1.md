# HTML+ 批次 C · 5.1 验收

- 验收对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-batch-c-59dc`，HEAD `1d02595`（PR #13，base = `cursor/html-plus-batch-b-b63a` @ `caa1061`，批次 B 已通过）。
- 验收依据：`OPTIMIZATION-5.1.md` §4 批次 C 成功标准 + §5.4 案例填充规则 + §5.1 / §5.2 / §5.3。
- 验收方式：通读 `caa1061..1d02595` 全部 diff（`index.html` +227 / −31，另附 `QA-BATCH-B-5.1.md`）；`grep -c -F` 核对冻结句、禁词、`AI Coding`、`HyperFrames`；Chrome 148 无头渲染 1440×900、1280×800、1920×1080 与 390×844，脚本驱动 P13 / P14 / P15 / P16 全部点击路径，读取 `getBoundingClientRect` / `getComputedStyle` / `elementFromPoint`；`localStorage` 每次清空后再测。
- 验收人：Fable 5.1 QA。本轮不改 `index.html`。

---

## 结论：打回

批次 C 五条成功标准里四条满足（P13 tab、P15 三键反馈、P16 单行、冻结句 / 口径 / 越批），**P14 一条不满足**：选中两款、对比卡出现后，桌面端九格第三行（07 / 08 / 09）被 `.klein-bar` 压住 17.6px，「帮型」标签不可读、格子下 40% 点不到——这正是成功标准描述的那个状态（「选两款后出现 2 栏对比卡 … 格高 ≥ 44px」），且落在 1440×900 主讲视口。

这是一个 CSS 尺寸问题，修补范围一行规则，见第 2 节。修完按第 2.3 节量一次即可再次提交，不需要重做批次 C 其他部分。

**不开批次 D**，等 P14 修补通过后再开。

---

## 1. 逐条证据

### 1.1 P13 `.device-chrome` 四件物料 tab

| 项 | 证据 | 结果 |
|---|---|---|
| 四个 tab | L1840–1845 `.device-chrome.has-tabs` 内 4 个 `button.mat-tab`：`T恤 / 物流箱 / 奖杯 / 防伪`，11px，高 22px，默认 `T恤` `is-on`（桌面 + 390 相同） | ✓ |
| T恤 有 SVG | `#tee svg path` 存在；默认 `#tee` 可见，字标 / 贴花 / 吊牌三键可见（桌面 y=511，390 y=666），`.tee-cap`「拖一拖 · 换贴花」可见；点「贴花」`#shirt-mark` = `POIZON`；拖 120px 后 `--ry` = `40deg` | ✓ |
| 其余三件灰底占位 | L1862–1864 三个 `.mat-ph`，各含 `.mat-ph-name`（16px，`#666`）+ `.mat-ph-wait`「待补图」（12px，`#888`）；`background: rgb(212,212,212)`（L868）；无 `img / svg / canvas`；三块占位样式相同 | ✓ |
| 切换行为 | 点 `物流箱 / 奖杯 / 防伪`：对应 `.mat-ph.is-on` 显示，`#tee` 加 `is-off` 隐藏（含三键与提示），其余占位隐藏，tab 只亮一个（L2333–2343）；回点 `T恤` 全部还原 | ✓ |
| 占位不压底栏 | 占位 `bottom: var(--klein-bar-space)`（L862）：桌面占位 bottom 543.5 < 底栏 top 552；390 下 698.1 < 706.5 | ✓ |
| 不臆造实物 | 占位只有名字与「待补图」；diff 中无新增图片、路径或材质描述 | ✓ |
| 点 tab 不翻页 | 点任一 tab 后 `hash` 仍 `#p13`，页码 `P13 / 20`（tab 是 `button`，被 L2190 守卫排除）；390 下在占位上横滑 `hash` 仍 `#p13`（`.mat-ph` 已加入 L2181 忽略列表） | ✓ |

**通过。** 备注：`.device-chrome` 原 `HTML / 3:2` 两个字样在 P13 被 tab 取代，P14 / P15 保留；chrome 本体仍在，与 §2 一致。

### 1.2 P14 选两款 → 2 栏对比卡

功能与数据（桌面 + 390 相同）：

| 状态 | 证据 | 结果 |
|---|---|---|
| 初始 | `#nono-compare` 隐藏；`#nono-out`「点两款，看「比较」怎么发生。」可见；九格 `grid-template-columns` 3 列，格高 44px（390 下 50.4px） | ✓ |
| 选 1 款 | 对比卡仍隐藏；`#nono-out`「已选 01高帮。再点一款。」 | ✓ |
| 选 2 款（01 + 04） | `#nono-compare.is-on` `display: grid`、2 列、11px，位于九格上方（卡 bottom ≤ 格 top）；`#nono-out` 隐藏；字段 `no-a=01 / no-b=04`，`cut-a / cut-b / diff-a / diff-b` 全为 `—` | ✓ |
| 只读 `data-*` | `nonoField()`（L2348–2351）只读 `getAttribute("data-"+name)`，空 / 缺 → `—`；九格 `button` 只带 `data-no`（L1899–1907），无 `data-cut / data-diff`；diff 中无任何帮型 / 配色 / 差别文字 | ✓ |
| 选第 3 款 | 卡仍显示前两款（DOM 序），第 3 款只高亮 | ✓（与批次 A 前 `slice(0,2)` 语义一致） |
| 取消回 1 / 0 款 | 卡隐藏，`#nono-out` 回「已选 07低帮。再点一款。」/「点两款，看「比较」怎么发生。」 | ✓ |
| 点在文字上触发 | 点 `.nono b`（款号）切换成功；390 下 `touchscreen.tap` 在文字上切换成功，`hash` 不变；在九格 / 对比卡内横滑不翻页（`.nono-stage` 已加入 L2181） | ✓ |
| `.klein-bar` 完整 | `white-space: normal`，`scrollWidth == clientWidth`，两行无省略号 | ✓ |

版面（**不通过**）：

对比卡出现后 `.nono-stage` 里可用高度 = 舞台 − 卡 61.2px − 间距 8px，只剩 110px（`#nono` 盒高 110，`scrollHeight` 144），而 `grid-auto-rows: minmax(44px, 1fr)`（L989）不允许行缩到 44px 以下，于是三行 3×44 + 2×6 = 144px 从盒子底部溢出，第三行压进 `.klein-bar`：

| 视口 | `.device-view` 高 | 07 / 08 / 09 bottom | `.klein-bar` top | 被压 | `elementFromPoint(格底 −8px)` |
|---|---|---|---|---|---|
| 1440×900 | 256 | 569.6 | 552.0 | **17.6px** | `.klein-bar` |
| 1280×800 | 256 | 560.1 | 542.5 | **17.6px** | `.klein-bar` |
| 1920×1080 | 256 | 524.6 | 507.0 | **17.6px** | `.klein-bar` |
| 390×844 | 276（`min-height: 300px` 生效，L1506） | 764.9 | 767.3 | 0 | 格本身 |

桌面三种分辩率一致，因为 `.case-extra .device` 固定 `min(100%, 420px)` 宽 × 3:2 = 280px 高，不随视口变。未选两款时（无卡）三行 bottom 536.3 < 552，不压；**问题只在成功标准要求的「对比卡出现」状态下发生**。截图（1440×900，选 01 + 04）里第三行只露出 `07 / 08 / 09` 三个款号，`高帮 / 低帮 / 袜套` 标签被底栏盖住。

390 下不压是因为批次 C 给手机加了 `.device:has(.nono-stage) { aspect-ratio: auto; min-height: 300px }`（L1506–1509，仅 `@media (max-width: 979px)` 内），桌面没有同等规则。

**打回。** 修补见第 2 节。

### 1.3 P15 三键反馈；`HyperFrames` 只在 `.hf`

| 项 | 证据 | 结果 |
|---|---|---|
| 初始 | `#hf` 隐藏（`display: none`，10px）；`#tl > i` `opacity: 0`；`.wave` `display: none`；三键均未亮 | ✓ |
| 加上时间 | `#tl.is-on`，三个刻度 `opacity: 1`（极光青 2px，符合 §2 用法）；按钮 Klein 底 | ✓ |
| 加上转场 | `#fake-page.is-play`，`.layer` `animation: rise 0.9s`（实测中途 `opacity: 0.146`）；按钮 Klein 底 | ✓（反馈为 900ms 动画 + 按钮高亮，属批次 A 前既有行为，P2-2 未要求改） |
| 加上声音 | `#fake-page.is-sound`，`.wave` `display: block`、12×12px、在假页右上角（距右 / 上各 9px）、完全在假页内；`::before` 为 2×5px 竖条 + 两道 `box-shadow` 竖条，纯 CSS，无 `img / svg`（L1036–1054）；再点 `.is-sound` 移除、`.wave` 隐藏 | ✓ |
| `.hf` 出现条件 | L2384–2385 `adds.every(is-on)`：三键全亮才 `is-on`；关掉任一键即消失（实测关「声音」后 `#hf` 隐藏） | ✓ |
| `HyperFrames` 范围 | `grep -c` = **1**（L1941 `.hf`）；批次 B 时为 2，P15 `data-note` 里的「HyperFrames 只是房间里的小标签」已删（L1916）；`.notes` 面板文字实测无该词；`h2` = `《得物业务知多少》VOL.06`；`.hf` `font-size: 10px` ≤ 10px | ✓ |
| 「视频插件」口径 | `grep -c 视频插件` = 3：P12 门（L1824）、P15 `data-note`（L1916）、P15 `.lede`（L1919）；P15 `.klein-bar`「固定节奏传播仍可用视频；这里看的是页怎么被加上时间。」未提任何工具名 | ✓ |
| 三键可点 | 390 下三键 bottom 729.2，dock top 723——按钮上 22px 在 dock 之上，`elementFromPoint` 中心命中按钮本身 | ✓（见 3.1） |

**通过。**

### 1.4 P16 `.who` 单行

- `.sum3 article` 第一列 `88px` → `minmax(112px, auto)`（L1097）；`.sum3 .who` 加 `white-space: nowrap`（L1112）。
- 桌面：三个 `.who`（`周年物料 / NONO 九款 / 业务知多少`）各 112×37px，`Range.getClientRects()` 均为 1 行，`scrollWidth == clientWidth`（不溢出）；列宽 `112 / 277 / 277 / 360`。
- 390：`article` 单列 328.8px，三个 `.who` 各 1 行，不溢出，页面无横向滚动。

**通过。**

### 1.5 冻结句 / 口径 / 越批

§5.3 冻结句 `grep -c -F`，`caa1061` → `1d02595`：`1/1、2/2、1/1、2/2 · 5/5 · 7/7 · 5/5、1/1、2/2、1/1`，全部不变；`data-frozen` = 7 不变；diff 中不含任何 `data-frozen / FROZEN / editSel` 行；`editSel` 命中元素数 159（`localStorage` 键数）与批次 B 一致，未新增 `p / h3 / li`，旧 `localStorage` 不会错位回填。

§5.2 禁词：`Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas` 均 0；`HyperFrames` 1；`四级 / 层级` 0；`等级` 1（P07 `data-note`，批次 A 前既有，QA-B 3.3 已记）；`蓝龙虾` 5、`POIZON` 3，无第二工具名 / 品牌英文。

`AI Coding` = 4（P13 `data-note` L1829、P13 `.klein-bar` L1865、P14 `data-note` L1871、P14 `.klein-bar` L1910），与批次 A / B 相同；diff 中无这四行；PR #13 描述有「待 Hao 确认（P1-6，本批未改字）」小节。

越批：diff 限于 `.device-chrome.has-tabs / .mat-*`、`.nono-*`、`.timeline-box / .fake-page / .wave / .tl / .hf`、`.sum3` 的 CSS；P13 / P14 / P15 的 `.device-view` 内部 HTML；P16 无 HTML 改动；JS 三段（物料 tab、`renderNonoCompare`、三键）+ `touchend` 忽略列表加 `.nono-stage / .mat-ph`。唯一的 `data-note` 改动是删 P15 里的 `HyperFrames`，由批次 C 成功标准「不进讲稿」直接要求。未碰 P02 / P09 / P18 / P19 版面、HUD / dock、README、其余 `data-note`。改动只落在 `demos/html-plus-course/`。无头运行全程 0 `pageerror` / 0 console error，P13–P16 桌面 + 390 无横向滚动。

**通过。**

---

## 2. 修补清单（打回项，只有一条）

### 2.1 必改

**C-1 · P14 桌面端对比卡出现后第三行压进 `.klein-bar`**

把 L1506–1509 的手机专用规则提升为全宽规则（`@media (max-width: 979px)` 里的那条可以删掉或保留，二者等价），并给 4px 余量：

```css
/* 放在 .nono-stage 规则附近（L954 前后），不在 @media 内 */
.case-extra .device:has(.nono-stage) { min-height: 304px; }
```

- 无头预演：`min-height: 300px` 全宽应用后，1440×900 选 01 + 04 时 07 / 08 / 09 bottom 569.6 < 底栏 top 572（余 2.4px），390 下 764.9 < 767.3；`304px` 把桌面余量放到 6.4px。
- 只需 `min-height`，不必写 `aspect-ratio: auto`：`min-height` 优先于 `aspect-ratio`，P13 / P15 的设备框不受影响（选择器带 `:has(.nono-stage)`）。
- **待 Hao 确认**：这会让 P14 的设备框从 420×280（3:2）变为 420×304（≈1.38:1）；390 下批次 C 已经用 `aspect-ratio: auto; min-height: 300px` 离开了 3:2。§2「案例 3:2 `.device` 框」与「3×44px 格 + 对比卡」在 420px 宽下装不下（需要 ≈ 304px，3:2 只有 280px），QA 实测把对比卡压到 53.8px 仍差 6.1px，所以二选一由 Hao 决定；QA 建议接受 P14 单页放高。

### 2.2 不接受的替代方案

- 把 `grid-auto-rows: minmax(44px, 1fr)` 改回 `1fr` 或降 `min-height`：会让格高 < 44px，违反 P1-2。
- 让 `.nono-grid` `overflow: auto`：把第三行藏进滚动区，台上更看不见。
- 对比卡覆盖在九格上 / 出现时隐藏第三行：与 P1-2「上方空区渲染」和「九格多选」冲突。

### 2.3 再次验收时 QA 会量的三个数（1440×900 与 390×844 各一次，选 01 + 04 后）

1. `.nono[data-no="07"]`（08 / 09 同）`getBoundingClientRect().bottom` ≤ 同一 `.device-view` 内 `.klein-bar` 的 `top`。
2. `document.elementFromPoint(格中心 x, 格 bottom − 8)` 返回该格本身或其 `<b>`。
3. `#nono-compare` bottom ≤ `#nono` top（卡在格上方），九格每格高 ≥ 44px。

同时复跑第 1.5 节 grep（冻结句 10 个计数、`HyperFrames` 1、`AI Coding` 4、禁词 0）。

---

## 3. 非阻塞备注（不构成打回，记入后续批次或待 Hao）

3.1 **390 下案例框底部与 dock / HUD 重叠**（批次 D · P2-4，PR #13 已自述）：`scrollTop = 0` 时 P13 `.klein-bar`（top 706）、P14 第三行（top 700）与 `.klein-bar`、P15 `.hf`（top 733）都在 dock（top 723）之下；页面可滚 48 / 109 / 123px，滚到底后全部露出且可点。`go()` 每次进页 `scrollTo(0,0)`，所以主讲在手机上要先滑一下。归批次 D「390 宽全部 20 页无元素被 HUD 遮住」。

3.2 **P14 对比卡「帮型 —」与九格里的「高帮 / 低帮 / 袜套」并排出现**：九格标签是批次 A 前就有的字样，对比卡按 §5.1 规则只读 `data-*`、不编帮型，于是同一屏出现「01 高帮」和「01 · 帮型 —」。两种收口都不在批次 C 权限内，待 Hao：(a) 确认九格的帮型属实，给九个 `button` 补 `data-cut`；或 (b) 把九格标签改成「待补」。

3.3 **`#nono-out` 仍写入 `localStorage`**（P1-3，QA-B 3.4 已记）：`renderNonoCompare()` 后 `persistEdits()` 会把「已选 07低帮。再点一款。」存下，下次开课 `#nono-out` 带旧字但无格子高亮。`editSel` 命中数未变（159），未恶化。仍建议 P1-3 并入批次 D / E。

3.4 **`.nono` 文字拼接**：`已选 01高帮` 款号与帮型之间无空格（`<b>01</b>高帮` 无空白节点），批次 A 前既有；批次 E 若改讲稿可顺手在 `labels` 里加一个空格。

3.5 **P15 「加上转场」反馈是一次 900ms 动画**：动画结束后假页外观回到原样，只剩按钮 Klein 底表示已开；成功标准满足，口播时建议主讲点完立刻说「看，它出现了一次」。

3.6 **提交内容**：`1d02595` 同时带入 `QA-BATCH-B-5.1.md`（批次 B 验收记录），与 §5.6「每批一个 commit、一个主题」有出入；文件是 QA 记录不是课件改动，不要求拆分，下次批次 commit 只放本批改动。

3.7 **占位色值**：`.mat-ph` 用了写死的 `#d4d4d4 / #666 / #888`（L868–872），其余组件用 `var(--surface-* / --dim / --soft)`；不影响验收，Hao 补图后这三块会整体删掉。

---

## 4. 给批次 C 修补的交接

- 基线仍是 `1d02595`；只改第 2.1 节一条 CSS（+ 可选删除 L1506–1509 的重复规则）。
- 不碰 P13 / P15 / P16 已通过部分、六个 `data-frozen`、`editSel`、`FROZEN`、四处 `AI Coding`。
- commit 标题沿用 `HTML+ 批次C：案例房间（修补 P14 第三行）`，PR #13 描述追加「3:2 → 420×304 待 Hao 确认」。
- 修补通过后再开批次 D；批次 D 开工时把 3.1 / 3.3 一并带上。
