# HTML+ 批次 B · 5.1 验收

- 验收对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-batch-b-b63a`，HEAD `caa1061`（PR #11，base = `cursor/html-plus-batch-a-e1d7` @ `c923b91`）。
- 验收依据：`OPTIMIZATION-5.1.md` §4 批次 B 成功标准 + §5.2 禁词 + §5.3 冻结句。
- 验收方式：通读 `c923b91..caa1061` 全部 diff（1 个文件，+238 / −66）；`grep -c -F` 核对冻结句与禁词；Chrome 148 无头渲染 1440×900 与 390×844，脚本驱动 P01 / P04 / P05 / P06 / P07 / P11 / P19 / P20 与编辑态，读取 computed style 与 DOM 状态；`localStorage` 每次清空后再测。
- 验收人：Fable 5.1 QA。本轮不改 `index.html`。

---

## 结论：通过

批次 B 7 条成功标准全部满足；未越批（未碰 P13–P16、P09、HUD、`data-note`、README）；改动只落在 `demos/html-plus-course/index.html`。

**可以开批次 C。**

下方第 3 节 4 条备注均为非阻塞，归入后续批次或 Hao 决定，不要求批次 B 返工。

---

## 1. 逐条证据

### 1.1 P06 `.flow` 四词 == P07 四动作

| 位置 | 行 | 四词 |
|---|---|---|
| P06 `.flow-step h3` | L1602–1605 | 装下内容 / 组织信息 / 接收操作 / 给出回应 |
| P07 `#actions .pick h3` | L1616–1619 | 装下内容 / 组织信息 / 接收操作 / 给出回应 |

- 无头读取两组 `h3.textContent`，`JSON.stringify` 相等，且与 §5.3 第 4 条逐字一致（桌面 + 390 均通过）。
- P06 小字保留活动通知语境：`通知、流程、注意在一页 / 先选身份再看流程 / 点一下，页知道你是谁 / 拿到自己的下一步`，与 P0-4 指令一致。
- P06 金句 `普通文件把内容交给你，HTML 还可以回应你的操作。` 未动。

**通过。**

### 1.2 P07 金句与四步对应

未选身份（桌面 / 390 相同）：
- `#punchline`（`.demo-punch`，L1637）`display: none`，`offsetParent === null`，`aria-hidden="true"`；`.demo` 内已无 `.klein-bar`。
- 四张动作卡 `is-on` 全为 `false`。
- 点 01 → `.demo-hold.is-hl`；点 02 → `.demo-org.is-hl`；点 03 → `#roles.is-hl` + `.is-pulse`；点 04 → `#next-step.is-hl`。每次只亮被点那一张，`#next-step` 换对应说明句。金句仍隐藏。

选身份「新同学」后：
- 桌面：金句 `display: block`，`font-size: 22px`（`clamp(18px, 2vw, 22px)`），`aria-hidden="false"`，位于 `.demo` 下半部（rect top 611 / demo 179–706），与 `#next-step` 不重叠。
- 390：金句 `font-size: 18px`，可见，不与 `#next-step` 重叠，无横向滚动；滚到底后金句在 dock 之上（viewport 628–695，dock top 723）。
- 四张动作卡 `is-on` = `[true, true, true, true]`，按 80ms 间隔 01→04 顺序点亮（`lightActionsInOrder`，L2115）；`prefers-reduced-motion` 下直接全亮。
- 选身份后再点 01：四卡保持全亮，`.demo-hold` 高亮，金句不消失。
- 金句文本与 §5.3 第 5 条逐字一致（`<u>` 已去，整句一个文本节点）。

**通过。**

### 1.3 P04 定义主视觉

- `.def-page .quote`（L487–496）：桌面 `font-size: 28px`，390 下 `20px`；`border-left: 3px rgb(1,194,195)`；`data-frozen` ✓。
- 页面内可见文字按字号排序，第一名为 `.quote`（桌面 28px，其次 16px；390 下 20px，其次 16px）；`.quote` 是 kicker 之下的第一个元素。
- 定义文本与 §5.3 第 3 条逐字一致。
- pills：`11px`，单行（桌面 `nowrap`，390 下 `wrap` 仍为 1 行），位于定义之下。
- 旧/新认知 + 六张岗位卡合并为 `.cognition`（L1550–1564），岗位卡 3×2、`min-height: 0`；点「入职导航」输出 `入职导航　新同学第一天该去哪、找谁、带什么`。
- 390：`.old` 隐藏，顺序 定义 → 新认知 → 岗位卡，与 P0-6 一致；无横向滚动。

**通过。**

### 1.4 P05 vs P11 去重；P11 三自检

P05（L1570–1595）四卡：`共同改稿 / 现场线性讲 / 固定节奏 / 查看 · 选择 · 互动 · 复用` + `.use` + `.more`，`.more` 以 1px 分隔线成上下两段，`flex: 1` 已去，卡高随内容（163px）。

P11 `.rows`（L1694–1699）：批次 A 时四行是 `共同编辑文档表格 / 现场线性讲PPT / 固定节奏传播视频 / 查看 · 选择 · 互动 · 复用HTML`，与 P05 `.kind` 列逐字重复；现改为 `先排除 / 先排除 / 先排除 / 留下` 阶梯（左缩进 0 / 16 / 32 / 48px，390 下取消缩进），每行一句「这样就够了」。两页不再共用同一组四行标签。

P11 `.check`（L759–773）：`text-align: left`、`justify-items: start`，三条左边 886px 对齐，与左栏同一基线；`.checks` 列不再被拉伸到 340px。

三自检行为：
- 点 1 → 1 亮、2 灭、3 仍亮（`rgb(0,47,167)`）。
- 点 3 → 1 仍亮、3 仍亮、`is-on` 不加到 3 上（`is-stop` 不参与单选，L2168–2173）。
- 390 结果相同。

**通过。**（见备注 3.1）

### 1.5 `data-frozen` / `editSel` / 复制常量

`grep -c 'data-frozen'` = 7（6 个元素 + `editSel` 一行）：

| 元素 | 行 |
|---|---|
| P01 `h1` | L1518 |
| P01 `.sub` | L1519 |
| P04 `.quote` | L1546 |
| P07 `#punchline` | L1637 |
| P19 `#prompt` | L1883 |
| P20 `.gold` | L1899 |

- `editSel`（L2257）每个选择器都带 `:not([data-frozen])`。
- 按 `E` 进入编辑态：`body.is-edit` = true，页面 159 个元素 `contenteditable="true"`；6 个 `[data-frozen]` 元素 `isContentEditable === false`、无 `data-edit`、无 `contenteditable` 属性。`Esc` 退出后 `contenteditable="true"` 归零。
- 复制：`const promptText = FROZEN.prompt`（L2240），不读 `#prompt`。stub `navigator.clipboard.writeText` 后点复制，得到的字符串与 §5.3 第 6 条逐字一致；把 `#prompt.textContent` 改成「被改过的提示词」再复制，仍得到原文。`copy-state` 变为「已复制，去蓝龙虾贴上。」

**通过。**

### 1.6 P1-6 「AI Coding」未改

- `grep -c 'AI Coding'` = 4：L1722（P13 `data-note`）、L1750（P13 `.klein-bar`）、L1756（P14 `data-note`）、L1781（P14 `.klein-bar`），与批次 A 完全一致，diff 中无此四行。
- PR #11 描述有独立小节「待 Hao 确认（P1-6，本批未改字）」。

**通过。**

### 1.7 冻结句 grep / 禁词 / 越批

§5.3 `grep -c -F`（`index.html`）：

| # | 冻结句 | 次数 |
|---|---|---|
| 1 | `《HTML+：AI 时代的工作表达新方式》` | 1（`FROZEN.title` 常量；`h1` 含 `<br>`，DOM `textContent` 逐字一致，属允许的换行位置） |
| 2 | `不用学编程，也能做出能讲、能点、能分享的工作成果` | 2 |
| 3 | 定义 | 1 |
| 4 | `装下内容` / `组织信息` / `接收操作` / `给出回应` | 2 / 5 / 7 / 5 |
| 5 | 金句 | 1 |
| 6 | 提示词 | 2（`#prompt` + `FROZEN.prompt`） |
| 7 | 结课句 | 1 |

无头读取 P01 `h1.textContent`、`.sub`、P04 `.quote`、P07 `#punchline`、P19 `#prompt`、P20 `.gold`，六处与 §5.3 逐字相等。

§5.2 禁词：`Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas` 均为 0；`HyperFrames` 2 处（L1787 P15 `data-note`、L1811 `.hf`），与批次 A 相同，未新增；`四级 / 层级` 0；`等级` 1（L1610 P07 `data-note`「四个动作不是等级」，批次 A 之前已有，见备注 3.3）。`蓝龙虾` 5、`POIZON` 3，无第二个工具名 / 品牌英文。

越批检查（diff 逐段）：改动限于 `.def-page / .cognition / .compare / .flow / .demo* / .roles / .rows / .check` 的 CSS，P01 / P04 / P05 / P06 / P07 / P11 / P19 / P20 的 HTML，以及 P07 / P11 / 复制 三段 JS。未触碰 P13–P16 `.device-view`、P09、P02 / P18 版面、HUD / dock、任何 `data-note`、README。单 commit `caa1061`，标题 `HTML+ 批次B：主线文案与重点句`，只改 1 个文件。无头运行全程 0 `pageerror` / 0 console error。

**通过。**

---

## 2. 批次 A 是否被打回归

- `E` 改字 / `Esc` 退出仍正常；非冻结元素编辑态数量 159。
- P07 手机端原「`#next-step` 与 `.klein-bar` 4px 重叠」随 `.klein-bar` 移除一并消失（390 实测不重叠）。
- P13 / P14 `.klein-bar` 与 `--klein-bar-space`（L827–913）未动。

---

## 3. 非阻塞备注（不构成打回）

3.1 **P11 第 4 行与 P05 HTML 卡 `.more` 仍有一句近重复**：P11 `别人要自己看、自己选、自己走下一步。` vs P05 `别人自己看、自己选、自己走下一步。`。四行标签已去重，成功标准满足；这一句建议在批次 D / E 顺手改一处即可，例如 P11 改为「要让人当场点、当场拿到下一步，才上 HTML。」（待 Hao）。

3.2 **P05 改为卡高随内容后页面下 65% 留白**：属 P2-1 舞台节律，已在批次 D 范围，此处只记录。

3.3 **P07 `data-note`「四个动作不是等级」含「等级」**：§6「四级 / 等级 / 层级不出现在四个动作附近」将在批次 E 讲稿重写时触发，建议改为「四个动作不分先后、不分高低」。批次 A 之前已存在，非批次 B 引入。

3.4 **P1-3（演示状态不入库 + `R` 重置）目前不在 A–E 任何一批**：`persistEdits()` 仍按 `editSel` 下标 `data-edit="i"` 序列化 `innerHTML`，`#next-step` 等演示输出仍会写进 `localStorage`；批次 B 增删了 `editSel` 命中元素（+4 个 `.rows p`、+1 `.demo-ask`、−1 P07 `.klein-bar`），旧 `localStorage` 会把上一版的文字回填到错位的元素里。冻结元素不在 `editSel` 内，不受影响。建议：P1-3 并入批次 D 或 E，并把 `EDIT_KEY` 升到 `v2`（或改成按稳定 key 而不是下标）。

3.5 小清理（可在任一批顺手）：`.demo` 上 `--klein-bar-space`（L628）已无使用者；`FROZEN.title`（L1942）只为 grep 存在，无引用。

---

## 4. 给批次 C 的交接

- 基线：`caa1061`。批次 C 范围 §4：P1-2、P2-2、P2-3 + P13 物料占位；只动 P13 / P14 / P15 / P16 `.device-view` 内部与三行表。
- 批次 C 不得碰：六个 `data-frozen` 元素、`editSel`、`FROZEN`、P04–P07 / P11 本批结构。
- P13 / P14 `.klein-bar` 的「AI Coding」四处继续保持原文，直到 Hao 对 P1-6 点头。
