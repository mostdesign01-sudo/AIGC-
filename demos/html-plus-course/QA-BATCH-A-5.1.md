# HTML+ 批次 A · 5.1 验收

- 验收对象：`demos/html-plus-course/index.html`，分支 `cursor/html-plus-batch-a-e1d7`（PR #9），HEAD `c923b91`「HTML+ 批次A：能点能读」。
- 对照基线：`dfe0879`（批次 A 之前的最后一个提交）。
- 验收依据：`OPTIMIZATION-5.1.md` 第 4 节「批次 A · 能点能读」成功标准（P0-1、P0-2、P0-3、P0-7、P1-1、P2-5）。
- 验收方式：通读 `dfe0879 → c923b91` 全部 diff；Chrome 无头（Chromium 151）渲染门前 / P01 / P02 / P07 / P12 / P13 / P14 / P15，桌面 1440×900 鼠标 + 手机 390×844 触摸各跑一遍；对文案做纯文本 diff；对 7 条冻结句和禁词表做 `grep` 计数。

---

## 结论：通过

六条成功标准全部通过。下方「备注」里的几点都不在批次 A 范围内、也不是批次 A 引入的倒退（或只是 4px 级别的无感差异），已按批次归位，不作为打回理由。

---

## 逐条对照

### 1. 点卡片上的字触发动作；只有「改字」/`E` 进入编辑；退出清除虚线框；默认 `contenteditable=false` —— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| 默认态 | 过 | 页面加载后 `[data-edit]` 共 161 个，`contenteditable="false"` 161 / `"true"` 0；`document.querySelectorAll('[contenteditable="true"]').length === 0`；`body.is-edit` 不存在。桌面 / 手机一致。 |
| 入口 | 过 | dock 里 `#edit-btn`（`<button class="notes-btn edit-hint" aria-pressed="false">改字</button>`）取代了原来的 `<span>点字可改</span>`。点按钮 → `body.is-edit` 开；再点 → 关。键盘 `E` 同效（L1900–1902，`e.preventDefault()`）。 |
| 非编辑态点字 = 动作 | 过 | P02：鼠标 / 触摸点在 `.pick[data-jump="2"] > h3`「重新认识 HTML」正中 → 页码 `P02 → P03`。P07：点 `#actions .pick:nth-child(2) > h3` → 该卡 `is-on`（`[false,true,false,false]`）。P12：点 `.door[data-jump="12"] > h3`「11 周年物料」→ `P13`。三处 `h3` 在点击时 `contenteditable` 均为 `"false"`。 |
| 编辑态 | 过 | 按 `E` 后：`body.is-edit` = true，161 个 `[data-edit]` 全部 `"true"`，`#edit-btn[aria-pressed="true"]`，`.page.is-on [data-edit]` 计算样式 `outline: dashed 1px`（L423–427）。此时点 P02 卡片 `h3` → 页码仍 `P02`，`document.activeElement.contentEditable === "true"`（进入编辑而非跳页，符合「编辑态下点字不跳转」）。 |
| 退出 | 过 | `Esc` 后：`body.is-edit` = false，`"true"` 数 0，`aria-pressed="false"`，可见元素中 `outlineStyle !== 'none'` 的数量 = 0（截图 `p02-noedit`：四卡 / 标题 / 结课句均无虚线框）。 |
| 守卫改写 | 过 | 全部 12 处容器守卫由 `closest("[contenteditable]")` 改为 `closest("[contenteditable='true']")`（L1911、1916、1925、1933、1941、1957、1968、1980、1989、1996、2004、2031、2058）；`bindEdits` 内 `click` / `mousedown` 的 `stopPropagation` 仅在 `body.is-edit` 时生效（L2103–2108）。 |
| P2-5 键盘守卫 | 过 | L1874 `e.target instanceof Element && e.target.closest(...)`；`document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))` 不抛错，`pageerror` 为空。 |

### 2. 门前 `#loader`：无真 T7 照片时纯 Klein；无错楼照片 —— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| 无照片 | 过 | `#loader img` 数量 0；`.door-field` 已是空 `<div>`（L1349）；`door-still.webp` 从目录删除（diff `Bin 131598 -> 0 bytes`）；`rg door-still` 只剩两条无对象的死 CSS（L1046、L1172）。 |
| 纯 Klein | 过 | `#loader` 与 `.door-field` 计算 `background-color: rgb(0, 47, 167)`，`background-image: none`。截图 `desk1440-door` / `phone390-door`：整屏纯蓝，无建筑。 |
| 五层可读 | 过 | 1440：`.cine-word` 208px @ (72,144)；`.loader-kicker` 13px；`.loader-title` 32px；`.loader-sub` 16px；`.enter-btn` 120×40；`.loader-hint` 12px，全部在视口内。390：`.cine-word` 85.8px；title 22px；sub 14px 单行 335px 宽；按钮 y=688–728；hint y=742–760，全部在 844 高视口内，未被裁切。 |
| 渐变垫底 | 过 | `.door-field::after` 与 `.loader-copy::before` 均为 `linear-gradient(0deg, rgba(0,47,167,.6), transparent)` 高 `40vh`（L1057–1066、L1095–1105），符合 P0-3「无论有无照片，底部加 40vh 渐变垫底」。 |

### 3. P01 封面 390 宽可读（纯 Klein 或遮罩 ≥ .78）—— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| 去照片 | 过 | `.cover .door-field, .cover img` 数量 0（L1391–1393 已删）；`.cover > :not(.door-field)`、`.cover > .door-field`、`.cover.is-push .door-still` 三条规则与 `enterClass()` 里的 `is-push` 一并删除。 |
| 纯 Klein | 过 | `.cover` 计算 `background-color: rgb(0,47,167)`，`background-image: none`。 |
| 390 可读 | 过 | `h1` 32px @ y=192–262；`.sub` 16px 两行 @ y=278–326，`rgba(255,255,255,.78)`；`.ask` 15px 两行 @ y=464–509。`scrollWidth` 390 = 视口宽，无横向滚动。截图 `phone390-p01`：副标题与开场问题清晰，无窗格压字。 |
| 1440 | 过 | `h1` 56px；`.sub` 18px；`.ask` 16px；全部在 900 高内。 |

### 4. P13 字标 / 贴花 / 吊牌 + 拖动提示可见；拖动 ±40° —— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| CSS 修法 | 过 | `.device-view > .tee { position:absolute; inset:0 }`（L716–719），`height:118%` / `translateX(-50%)` 已删；`.device-view` 新增 `--klein-bar-space: calc(2.8em + 16px)`（计算值 60.8px）；`.tee-tools` / `.tee-cap` / `.job-out` 的 `bottom` 改为 `calc(var(--klein-bar-space) + 8px)`（L744、788、799）。 |
| 三键可见 | 过 | 1440：`.device-view` y=348–604，`.klein-bar` y=552–604，三键 `字标 / 贴花 / 吊牌` 各 42×24 @ y=512–536，`.tee-cap`「拖一拖 · 换贴花」@ y=529–547，全部在设备框内、在 `.klein-bar` 上方（`tools_above_bar / cap_above_bar / tools_in_dv` 均 true）。390：三键 @ y=618–642，cap @ y=635–653，klein-bar top 658，同样成立。截图 `desk1440-p13` / `phone390-p13`。 |
| 三键可用 | 过 | 点「贴花」→ `#shirt-mark.textContent === "POIZON"`，页码不变。 |
| 拖动 ±40° | 过 | 用 30 步、16ms 间隔的真实拖动：从 0 向左 400px → `--ry: -40deg`；再向右 800px → `40deg`；再向左 50px → `20deg`（0.4 系数正确）。`transform` 计算值 `matrix3d(0.766, 0, -0.643, …)` 即 rotateY(40°)。桌面 / 手机均成立。（PR 自述「实测约 32°」是拖动距离不足，不是钳位问题；代码钳位 `Math.max(-40, Math.min(40, …))` 未动。） |

### 5. P13 / P14 `.klein-bar` 无 nowrap / ellipsis 截断 —— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| CSS | 过 | L394–395 `white-space: normal; overflow: visible`，`text-overflow` 回到默认 `clip`；手机媒体查询里 `.klein-bar { white-space: normal }`（L1279）保持一致。 |
| P13 | 过 | 1440：`scrollWidth 416 == clientWidth 416`，高 52px = 2 行 × 18.2 + 16 padding；全文「价值　静态设计稿变成能观察比较的沟通工具。可用 AI Coding 把已有物料收进同一页。」完整。390：355 == 355，两行完整。 |
| P14 | 过 | 1440 / 390 同上，「价值　把比较收进一页。可用 AI Coding 先出能打开的操作台，再用人话改到能用。」两行完整，`#nono-out` 在 klein-bar 上方（y=519–547 vs 552）。 |
| 全课扫描 | 过 | 20 页 × 2 尺寸，所有 `.klein-bar`（P07 / P13 / P14 / P15）`scrollWidth == clientWidth`，`text-overflow: clip`，`white-space: normal`；20 页 `scrollWidth == innerWidth`，无横向滚动。 |
| 文案未压短 | 过 | 「AI Coding」两处原文保留，P1-6 未越批执行，PR 描述已单列「待 Hao 确认」。 |

### 6. 批次 A 范围外无文案 / 冻结句改动；禁词干净 —— 过

| 检查点 | 结果 | 证据 |
|---|---|---|
| 可见文案 diff | 过 | 对 `<body>` 到 `<script>` 之间的文本节点 + 全部 `data-note` 做纯文本 diff，`dfe0879 → c923b91` 唯一差异：`-点字可改 / +改字`（dock 按钮，P0-1 明文要求）。 |
| 冻结句 | 过 | 7 条冻结句 `grep -c -F` 计数 HEAD 与基线逐条相同：课名 1/1、副标题 2/2（P01 + 门前）、定义 1/1、装下内容 1/1、组织信息 4/4、接收操作 6/6、给出回应 4/4、金句 1/1、提示词 1/1、结课句 1/1。 |
| 禁词 | 过 | `Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas` 在 `index.html` / `README.md` 中 0 次（`cursor` 仅作 CSS 属性）。`HyperFrames` 2 处（`.hf` 小标签 + P15 `data-note`），与基线相同，非本批引入。 |
| 改动落点 | 过 | `git diff --name-only` 全部在 `demos/html-plus-course/`（`index.html`、`OPTIMIZATION-5.1.md` 新增、`door-still.webp` 删除）。 |
| 未越批 | 过 | 无 `data-frozen` 属性落地（只在 `editSel` 里预留 `:not([data-frozen])`）；P06 / P07 / P04 / P05 / P11 文案与结构未动；无新增页面 / 主题 / 主色改动；无外链、无构建。 |

---

## 备注（不阻塞，按批次归位，供 Grok 4.6 后续参考）

1. **P07 · 390 宽**：`.klein-bar` 去 nowrap 后变两行（52px），而手机端 `.demo { padding-bottom: 48px }`（L1323）只留了一行的量，`#next-step` 底边与 klein-bar 顶边重叠 4.4px。重叠落在 `#next-step` 的内边距上，文字未被压，截图看不出来。建议放进**批次 B · P0-5**（本来就要重做 P07 金句的显隐）：`.demo` 手机端 `padding-bottom` 改为 `calc(2.8em + 16px)` 或沿用 `--klein-bar-space`。
2. **P13 · 390 宽**：`.tee { padding-top: 10% }` 让 T恤下沿（y=655）低于三键顶边（y=618），T恤外框左下角与「吊牌」按钮右缘相接（按钮右 165 vs 衣身左约 163）。按钮在 DOM 后、绘制在上，完整可读可点；只是视觉上挨着。可在**批次 D**（手机节律）把 `.tee` 手机端 `padding-top` 缩到 4–6%。
3. **P15 · 390 宽**：「加上时间 / 加上转场 / 加上声音」三键仍有下半被 `.klein-bar` 盖住（基线是整排不可见，本批 `bottom: var(--klein-bar-space)` 已让它露出一半）。**批次 C · P2-2** 处理 P15 反馈时一并把 `.timeline-box` 内部按钮位置改为随框高。
4. **P14 · 390 宽**：3×3 九格溢出 3:2 框，第三行被 klein-bar 盖住。基线同样如此，属 **批次 C · P1-2**（九格改 `repeat(3,1fr)` 且格高 ≥ 44px）。
5. **拖 T恤翻页（基线已有）**：桌面上按住 T恤向左拖出设备框、在舞台左 22% 区域松手时，`click` 的 target 是 `mousedown` / `mouseup` 的公共祖先（`.page`），不命中 `.tee` 守卫，触发 `prev()`。真实 ±40° 只需 100px 位移，正常演示不会出框；建议**批次 D** 在 `stage click` 里加一个「刚发生过拖动则忽略」的标记。
6. **README 过期**：仍写「点字可改」「轻微前推」「把 t7-3.jpg 放进本目录即可换成得物大楼」（现已无 `<img>` 可自动接管）。属 **批次 E · P2-6**。
7. 死 CSS：`.door-still` 两条规则（L1046–1056、L1172）已无对象，无害，可在批次 E 清理。

---

## 可以开批次 B
