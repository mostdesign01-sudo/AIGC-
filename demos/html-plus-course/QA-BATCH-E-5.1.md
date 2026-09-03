# HTML+ 批次 E · 5.1 验收

- 验收对象：`demos/html-plus-course/index.html` + `README.md`，分支 `cursor/html-plus-batch-e-157f`（PR #19，base = `cursor/html-plus-batch-d-a572` @ `8bf5399`，批次 D 已过复验 PR #18）。HEAD `420dd28`，一个 commit `HTML+ 批次E：讲稿与验收`。
- 验收依据：`OPTIMIZATION-5.1.md` §4 批次 E 成功标准（P1-8 / P2-6）、§5.1 / §5.2 / §5.3 / §5.5、§6 讲稿与状态三项；`QA-BATCH-D-5.1.md` §3 带入项 3.1 / 3.5 / 3.7 / 3.8。
- 验收方式：通读 `8bf5399..420dd28` 全部 diff（`index.html` +79 / −25，`README.md` +35 / −1，只这两个文件）；把两版 `index.html` 的 `data-note` 值抹平后再 diff，确认其余改动只剩 `.notes` CSS、`#notes-body`、`renderNotes()`；脚本统计 20 个 `data-note` 的段数与字数；`grep -o -F | wc -l` 核对冻结句、禁词、`AI Coding`、`HyperFrames`、外链；Chrome 148 无头驱动 1440×900 / 1280×800（桌面）与 390×844 / 360×780（`isMobile + hasTouch`），`localStorage` 先清空，点「进入课堂」→ 开讲稿 → 逐页读 `#notes-body .note-row` 的标签、文本、`getBoundingClientRect`，与 `data-note` 按 `｜` 拆分的结果逐字比对；P07 / P13 / P14 / P15 按「操作」段写的顺序脚本点击并读状态；键盘表逐键按；基线 `8bf5399` 同脚本再跑一遍作对照。
- 验收人：Fable 5.1 QA。不改 `index.html` / `README.md`，只新增本文件。

---

## 结论：通过

六条标准全部成立，无必改项。20 页讲稿都是「口播｜操作｜过渡」三段、合计 ≤ 120 字（最长 P13 = 117，含标签不含 `｜`；含 `｜` 也只 119），面板桌面 + 手机都分三行渲染且文本与 `data-note` 逐字一致；P07 / P13 / P14 / P15 的「操作」段里每一个「」内的词都在页上找到了同名控件，按它写的顺序点，页面反应与讲稿描述一致；README 键表与 `keydown` 处理器逐键对得上，`t7-3.jpg` 三条规则与 §5.5 逐字同源，冻结句段指向 §5.3；冻结句 / 禁词 / `HyperFrames` / 蓝龙虾 / POIZON / 视频插件计数与基线相同或只因讲稿引用原句而增加；把 `data-note` 抹平后两版 `index.html` 的 diff 只剩 `.notes` 面板三处，主题、门前、布局、互动逻辑、`editSel`、两处台上 `AI Coding`、P09 版面都没动。

**优化管线 A–E 收口。可以开批次 F（海报视觉中档）。** 开工前把第 3 节 3.1（手机端讲稿面板压住 P07 身份键 / P14 P15 价值栏）一并带上；3.2–3.9 待 Hao。

---

## 1. 逐条证据

### 1.1 标准 1 · 20 页 `data-note` 三段、≤ 120 字；`.notes` 分三行

`data-note=` 20 / 20。每条按 `｜` 拆分恰好 3 段，段首依次是 `口播：` `操作：` `过渡：`：

| 页 | 含标签字数 | 页 | 含标签字数 | 页 | 含标签字数 | 页 | 含标签字数 |
|---|---|---|---|---|---|---|---|
| P01 | 67 | P06 | 61 | P11 | 94 | P16 | 58 |
| P02 | 82 | P07 | 99 | P12 | 71 | P17 | 72 |
| P03 | 65 | P08 | 59 | P13 | **117** | P18 | 92 |
| P04 | 71 | P09 | 82 | P14 | 109 | P19 | 69 |
| P05 | 83 | P10 | 101 | P15 | 114 | P20 | 74 |

最长 P13 = 117（去掉三个标签是 108；连两个 `｜` 一起算是 119），20 页全部 ≤ 120。

面板：CSS L1267–1280 `.notes .note-row { display: flex; gap: 10px; margin-top: 6px; font-size: 14px; line-height: 1.45 }`、`b { flex: 0 0 2.5em; color: var(--klein) }`、`span { flex: 1; min-width: 0 }`；HTML L2138 `<div id="notes-body">`；JS L2152 `NOTE_LABELS = ["口播","操作","过渡"]`，L2200–2216 `renderNotes()` 按 `｜` 拆、去掉段首 `标签：`、每段一个 `<p class="note-row"><b>标签</b><span>正文</span></p>`，`go()` L2190 每次翻页重绘。

无头读数（1440×900，`S` 开讲稿，`←`/`→` 走完 20 页）：

- 20 页 `#notes-body .note-row` 都是 **3 行**，标签依次 `口播 / 操作 / 过渡`，`span.textContent` 与 `data-note` 拆分后去标签的文本 **逐字相同**（20 × 3 = 60 段，0 处不一致）。
- 三行 `top` = 813 / 839 / 866，各高 20px，14px，纵向依次堆叠，无并排；标签列宽 35px（`2.5em`），`b.scrollWidth == clientWidth`；正文 `span.scrollWidth ≤ clientWidth`（P13 操作段 78 字在 1139px 宽内单行放完），无横向溢出。
- 面板 `position: fixed`，`top 776 / bottom 900`，高 124px；舞台底 755，**不压舞台**（余 21px）。20 页 `page.scrollHeight == 664 == clientHeight`。
- 390×844 抽检 P01 / P04 / P07 / P13 / P14 / P15 / P19 / P20：都是 3 行三标签、文本逐字一致；面板 `left 0 / right 390`，`bottom 760 == dock.top`，dock 与 HUD 不被压；面板高 144（P01 / P04 / P19）/ 164（P13 / P20）/ 185（P07 / P14 / P15）；长段自动折 2–3 行（P13 操作段 61px = 3 行）。360×780 同一组页：144 / 164 / 185 / 205，同样 3 行、`scrollWidth == 360`。
- 三个视口全程 0 `pageerror` / 0 console error。

**通过。**

### 1.2 标准 2 · P07 / P13 / P14 / P15「操作」段的点击顺序与页上控件文案

逐词对照（讲稿「」内的词 vs `textContent.trim()`）并按讲稿顺序脚本点击（1440×900）：

| 页 | 讲稿「操作」 | 页上控件 | 点击后 | 结果 |
|---|---|---|---|---|
| P07 | 依次点「装下内容」「组织信息」「接收操作」「给出回应」，再点「新同学」。等金句出现、四卡全亮 | `#actions .pick h3` = `装下内容 / 组织信息 / 接收操作 / 给出回应`；`#roles button` = `新同学 / 志愿者 / 嘉宾 / 组织者` | 四动作依次点 → 单选（最后只 04 亮，金句未出）；点「新同学」→ `#punchline.is-in` true、22px；四 `.pick` 全 `is-on`；`#next-step` = `新同学　先到 1F 签到…` | ✓ 顺序、文案、结果三者一致 |
| P13 | 依次点四拍「原来 / 旧形式不够 / 多了哪个动作 / 交付给谁」；再点「T恤 / 物流箱 / 奖杯 / 防伪」；T恤上点「字标 / 贴花 / 吊牌」并拖 | `[data-beats] .n` 四个逐字同；`.mat-tab` = `T恤 / 物流箱 / 奖杯 / 防伪`；`.tee-tools button` = `字标 / 贴花 / 吊牌` | 四拍单选；tab 切换：物流箱 → `#tee.is-off` + `.mat-ph[box].is-on`，奖杯 / 防伪同理，回 T恤 → `is-off` 去掉；贴花 → `#shirt-mark` = `POIZON`，吊牌 → `吊牌`，字标 → `11`；`.tee-tools` 底 536 < `.device-view` 底 604（可见）；拖 80px → `--ry: 32deg`；`hash` 仍 `#p13` | ✓ |
| P14 | 依次点四拍「原来 / 旧形式不够 / 多了哪个动作 / 交付给谁」。再点「01」「02」，看对比卡；再点可取消 | 四拍逐字同；`#nono .nono` = `01高帮 … 09高帮`，`<b>01</b>` 为可见款号 | 点 01 → `#nono-out` = `已选 01高帮。再点一款。`；点 02 → `#nono-compare.is-on`、`display: grid`，`no-a / no-b` = `01 / 02`，帮型 `—`（QA-C 3.2 既有）；再点 02 → 卡关、`is-on` 1、回到「已选 01高帮」 | ✓ 「再点可取消」成立 |
| P15 | 点四拍「原来 / 旧形式不够 / 多了哪个动作 / 交付给谁」。再点「加上时间」「加上转场」「加上声音」。转场只闪一次，立刻看 | 四拍逐字同；`.tl-btns button` = `加上时间 / 加上转场 / 加上声音` | 时间 → `#tl.is-on`；转场 → `#fake-page.is-play`，`.layer` `animation: rise 0.9s`，`animation-iteration-count: 1`（**只闪一次**，与讲稿一致）；声音 → `.is-sound`、`.wave` opacity 1；三键全开 → `#hf.is-on`，10px，仍只 `HyperFrames` 一处 | ✓ |

其余页「操作」段顺带核对：P02「点四张卡」= 4 个 `.overview-grid .pick`；P04「六张岗位卡」= 6 个 `#jobs .job`；P10「讲清楚 / 走完流程 / 比较和选择 / 让想法被体验」= `#one-scene button` 四个逐字同；P11「谁会使用？」「他要完成什么？」= `#checks .check` 1 / 2，「第 3 条常亮」= `.is-stop` 在 L2412 不参与单选；P12「进入房间 →」= 三个 `.door .go`；P18「11 周年活动页」「入职鉴别指引」「一页可点方案」= `#tasks h3` 三个逐字同；P19「复制提示词」= `#copy-btn`；P05 / P16「不点」两页确无按钮；P01「四个拍子」= `.beat` 四个 `文档 / 页面 / 交互 / 分享`。

**通过。**

### 1.3 标准 3 · README 快捷键全表、`t7-3.jpg` 规则、冻结句指向 §5.3、`Esc` 再 `R`、改字只在桌面

README 键表 vs `keydown`（L2249–2286）逐键：

| README | 代码 | 无头实测 | 结果 |
|---|---|---|---|
| `Enter` / 空格 · 门前进入 | L2258–2262 `!started` 时 `Enter` / `" "` → `enterClass()` | 门前按 `Enter` → `body.started`、`#p01` | ✓ |
| `←` / `PageUp` 上一页 | L2268 | P06 按 `PageUp` → `#p05` | ✓ |
| `→` / 空格 / `PageDown` 下一页 | L2264 | P05 `PageDown` → `#p06`；空格 → `#p06` | ✓ |
| `S` 开/关讲稿（三行） | L2274 | 默认 `display: none`，按 `S` → `block` | ✓ |
| `E` 开/关改字（仅桌面） | L2276；`#edit-btn` 手机端 `display: none` | `E` → `body.is-edit`、159 个 `contenteditable=true`、`[data-frozen]` 可编辑 **0**、按钮 `aria-pressed=true`；390 / 360 `#edit-btn` `display: none` | ✓ |
| `R` 重置：清改字、清演示、回 P01 | L2279 `resetCourse()` | 见下行 | ✓ |
| `F` 全屏 | L2271 | 按 `F` → `document.fullscreenElement` 非空 | ✓ |
| `Esc` 退讲稿、退改字 | L2282–2285 | 讲稿开着按 `Esc` → `none`；编辑态 `Esc` → `is-edit` false | ✓ |
| 编辑焦点内先 `Esc` 再 `R` | L2250–2257 `inField` 只处理 `Escape` 后 `return` | 光标在 P02 `h3` 末按 `R` → 文本变 `重新认识 HTMLr`、`hash` 仍 `#p02`、未重置；`Esc` → 焦点回 `BODY`、`is-edit` false、`localStorage` = `{"3":"重新认识 HTMLr"}`；再按 `R` → `#p01`、`h3` 回 `重新认识 HTML`、`localStorage` `null` | ✓ QA-D 3.7 已写进 README 且属实 |
| 「改字只在桌面」 | 同上 | 手机 dock 无「改字」 | ✓ QA-D 3.8 |

README「另外」一段：左栏 / HUD 六点章首（`.ch[data-go]` L2220）、dock 上一页 / 下一页（L2221–2222）、舞台左右 22% 点击翻页且卡片 / 按钮 / 设备框上不翻（L2303–2308 的 `closest` 白名单含 `button, .tee, .nono-grid, .roles, .beats4, .timeline-box, .device`）、手机滑动翻页且 T恤 / 九格 / 身份按钮上不翻（L2295 白名单含 `.tee, .shirt, .nono-grid, .roles`）——四句都在代码里有对应。

`t7-3.jpg` 段三条（只接受 Hao 的 T7 街拍「街对面、三拱、两辆车、无 T2 字样」/ 不在目录 = 纯 Klein、不用替代建筑 / 落盘后转 `door-still.webp` q85、拱门下 1/3、Klein 渐变垫底）与 §5.5 三条逐字同源。现行 HTML 无 `<img>` 引用 `door-still`（只剩 CSS L1319 / L1445 两条空规则），门前确为纯 Klein，与 README 一致。

冻结句段：写明七条（课名 / 副标题 / 定义 / 四个动作 / 金句 / 提示词 / 结课句）、链接 `OPTIMIZATION-5.1.md` §5.3、`data-frozen` 改字模式下不可编辑（实测 0 个 frozen 可编辑）、复制永远从常量复制（L2514 `FROZEN.prompt`）。

「单文件，无外链、无字体 CDN」：`http` / `@import` / `<link` 在 `index.html` 中各 **0**。

**通过。**

### 1.4 标准 4 · 冻结句 / `data-frozen` / 禁词 / `HyperFrames` / 蓝龙虾 / POIZON / 视频插件；讲稿不编造

`grep -o -F | wc -l`，`8bf5399` → `420dd28`：

| 项 | 基线 | HEAD | 说明 |
|---|---|---|---|
| 课名前缀 `《HTML+：AI 时代的` | 2 | 2 | 不变 |
| 副标题 | 2 | 2 | 不变 |
| 定义全句 | 1 | 1 | 不变 |
| `装下内容 / 组织信息 / 接收操作 / 给出回应` | 2 / 5 / 7 / 5 | 3 / 6 / 9 / 7 | 增量全部来自 P07 / P13 / P14 讲稿引用四动作原词，用字与顺序不变 |
| 金句全句 | 1 | 1 | 不变 |
| 提示词全句 | 2 | 2 | 不变 |
| 结课句全句 | 1 | 2 | P20 讲稿「口播」段整句引用，与 §5.3 第 7 条逐字一致 |
| `data-frozen` | 15 | 15 | HTML 7 处 + CSS / JS 选择器未动 |
| `editSel` | 2 | 2 | 常量原样 |
| `HyperFrames` | 1 | 1 | 仅 `.hf`；P15 讲稿说「视频插件」 |
| `视频插件` | 3 | 3 | P12 门 / P15 lede / P15 讲稿各一 |
| `蓝龙虾` | 5 | 7 | P18 / P19 讲稿各加一处，仍是唯一工具名 |
| `POIZON` | 3 | 3 | 唯一品牌英文 |
| `AI Coding` | 4 | 2 | 两处台上 `.klein-bar`（P13 L1951 / P14 L1996）**原样未动**；消失的两处是旧 `data-note` 里的「可写 AI Coding」，随讲稿重写去掉，符合 §5.2「口播一律说借助 AI」 |
| `等级` | 1 | 0 | 旧 P07 讲稿「四个动作不是等级」去掉（QA-B 3.3 收口） |
| `Cursor / Vite / React / vibe / Html大法 / 一份HTML N种形态 / 三招 / PlayCanvas / 四级 / 层级` | 全 0 | 全 0 | — |

讲稿内容逐页核对来源：P02 结课目标句 = `.punch`；P03 / P08 / P17 口播 = 各章封面 `.gold`；P05 四列口径 = `.compare .kind`；P06 = `.gold` 改述；P09 四场景名 = `#scenes h3`；P10 / P11 = 页上 `.dim p` / `.rows`；P13「平面稿看不出结构」= `.door p` / 四拍；P14「九款散在不同文件」= 四拍第一拍；P15「页能看，但不能按时间讲。加上时间、转场、声音，现场叫它视频插件」= `.lede`；P18 三题 = `#tasks h3`；P19 四条 = `.list4`。P07 身份流程里的「1F 签到处」等是既有 `roles` 常量（L2327–2332），讲稿未引用。**没有新数字、新案例、新金句**；「多了哪个动作」处用的词都取自四个动作原词。

**通过。**

### 1.5 标准 5 · 未越权

把两版 `index.html` 的 `data-note="…"` 统一抹成 `data-note=""` 再 `difflib` 对比，剩余差异只有三处：L1267 `.notes p` → `.notes .note-row / b / span`（14 行 CSS）；L2138 `<p id="notes-text">` → `<div id="notes-body">`；JS L2151–2152 `notesBody / NOTE_LABELS`、L2190 `renderNotes()`、L2200–2216 新函数。以下全部 **0 行改动**：`:root` 色板、`.klein-field` / 门前 `#loader`、`.page / .stage / .split / .grid4 / .beats4 / .device`、`chStarts`、章名六词、`editSel`、`resetCourse / persistEdits / applyRhythm / revealAboveChrome`、P13 / P14 `.klein-bar`（两处台上 `AI Coding` 原文在）、P09 `.scene-grid / .scene .more`（`-webkit-line-clamp: 1` 仍在，QA-D 3.1 留给 Hao）、极光青用法。

1440×900 基线 vs HEAD 六页（P01 / P07 / P13 / P14 / P15 / P20）关讲稿时 `page.scrollHeight` 都是 664，与基线相同；390 六页 `documentElement.scrollWidth` 390，`hud + dock` 仍 84px。README 之外没有新增文件；commit 只有一个，标题 `HTML+ 批次E：讲稿与验收`，符合 §5.6。

**通过。**

### 1.6 标准 6 · 桌面 + 手机抽检讲稿面板

| 页 | 1440×900 面板 / 三行 top | 390×844 面板高 / 三行高 | 360×780 面板高 | 文本 == data-note |
|---|---|---|---|---|
| P01 | 776–900 / 813 · 839 · 866 | 144 / 41 · 20 · 20 | 144 | ✓ |
| P07 | 同 | 185 / 41 · 61 · 20 | 185 | ✓ |
| P13 | 同 | 164 / 20 · 61 · 20 | 205 | ✓ |
| P14 | 同 | 185 / 41 · 61 · 20 | 185 | ✓ |
| P15 | 同 | 185 / 41 · 61 · 20 | 205 | ✓ |
| P20 | 同 | 164 / 61 · 20 · 20 | 164 | ✓ |

加测 P04 / P19（手机）同样 3 行。截图（DPR 2）目视：三个 Klein 色标签左对齐成一列，正文右侧对齐，长段在手机端换行不串行；PR #19 附的门前 / P01 / P04 / P07 / P13 / P19 桌面 + 手机 12 张覆盖 §4 要求的截图页，本次抽检页与之重合并各自读数。

**通过。**

### 1.7 §6 讲稿与状态三项

- [x] 20 页讲稿面板均为「口播｜操作｜过渡」三段（1.1）。
- [x] 刷新后演示输出回初始、`R` 一键清空——本批未动 `persistEdits / resetCourse`，1.3 的 `R` 实测 `localStorage` 回 `null`、P02 改字还原；QA-D 1.5 结论沿用。
- [x] README 与实际快捷键、门前规则一致（1.3）。

---

## 2. 修补清单

无。本批无必改项。

---

## 3. 非阻塞备注（记入批次 F 或待 Hao）

3.1 **手机端讲稿面板打开时压住页底控件**（本批新引入的程度变化，不阻塞）。390×844 面板高从基线的 93–114px 长到 144–185px，`bottom` 贴 dock 顶 760 不动，所以 `top` 上移：P07 `#roles` 四个身份键底边 587 > 面板顶 575，键的下 12px 被盖（仍可点，选后 `#punchline` 678–744 整段在面板下——基线也如此）；P14 `.klein-bar` 底 640、P15 `.klein-bar` 底 650 > 575，价值栏被盖（基线面板顶 667，未盖）。P01 / P04 / P13 / P19 / P20 无被盖元素；桌面 1440 / 1280 面板不压舞台。原因是 `.page` 手机端 `padding-bottom` 只算 `hud + dock + 24`（108px），不含讲稿面板。若 Hao 要「手机开讲稿也能点到全部控件」，一行 CSS 放进 `@media (max-width: 979px)`：`body:has(.notes.is-on) .page { padding-bottom: calc(var(--hud) + var(--dock) + 24px + 200px); }`，让页面可滚到面板之上；复验会量 390 / 360 下 P07 / P14 / P15 开讲稿后滚到底时 `roles / .klein-bar` 底边 ≤ `notes.top`。主讲视口是桌面，手机讲稿是预览用，故不打回。

3.2 **桌面讲稿面板盖住 dock**（基线既有）。1440×900 面板 776–900 覆盖 dock 836–900（基线 828–900 同样盖住）；开讲稿后 dock 的上一页 / 下一页 / 讲稿 / 重置四个按钮点不到，只能靠键盘 `← → S R`。README 键表齐全后影响小；若要改，`.notes { bottom: 64px }`（dock 高）即可，留给 F 或 Hao。

3.3 **README「也无键盘 `E`」是对手机硬件的描述，不是代码门禁**。`keydown` 的 `E` 分支（L2276）不看视口，接外接键盘的手机仍会进编辑态（虚线框会出现，但 `#edit-btn` 隐藏、无按钮退出，需按 `Esc`）。极端场景，记录备查；若要严格，`E` 分支前加 `if (window.matchMedia("(max-width: 979px)").matches) return;`。

3.4 **P17「操作」段「四问只点到现场有共鸣的那一个」**：`.qs article` 不是按钮，此处「点到」是口语「提一下」，与其它页「点」= 点击的用法并列时可能被主讲误读。建议下次改讲稿时换成「只提其中一问」；不改字数（14 → 12）。

3.5 **QA-D 3.1 P09 省略号**：本批未改 P09 版面，`.scene .more` 仍 `-webkit-line-clamp: 1`，1440 下每卡约 14 字 + `…`；与 §6「无省略号」的出入照旧待 Hao 二选一（QA 仍倾向默认两行）。

3.6 **QA-D 3.5 1280×800 P15 设备框超舞台 12px**：本批未动案例框；本次 1280×800 读数 P15 `page.scrollHeight` 586 vs 其它页 574，与基线相同。§6 版面项只量 1440×900，不阻塞。

3.7 **QA-D 3.6 `editSel` 双绑**：P11 `.rows li` 与内层 `p` 都在 `editSel`，本批按 PR 说明未动（改选择器会错位 `data-edit` 下标、伤旧 `localStorage`）。待 Hao 决定是否值得清一次 `localStorage` 换干净的选择器。

3.8 **P1-6 台上「AI Coding」两处**（P13 / P14 `.klein-bar`）：仍待 Hao 点头；讲稿侧已按 §5.2 只说「借助 AI」。原四处里另两处随旧 `data-note` 消失，不再计入。

3.9 **QA-C 遗留**：P14 九格帮型（高帮 / 低帮 / 袜套）与对比卡「帮型 —」并存（3.2）；P14 设备框 420×304 非 3:2（2.1）。沿用，待 Hao 给 `data-cut / data-diff` 真值。

3.10 **README 标题** `# HTML+：AI 时代的工作表达新方式` 无书名号：属文档标题，不在台上、非 `data-frozen`，与 §5.3 第 1 条不冲突；如要与课名一字不差可加《》，不计。

---

## 4. 交接

- 批次 E 通过，`420dd28` 为 A–E 管线收口点；后续批次以此为基线。
- 批次 F（海报视觉中档）开工时带上 3.1（可选一行 CSS）与 3.2；3.3–3.10 待 Hao 决定，不在 F 范围内除非 Hao 点头。
- 本文件之外不改任何文件；`index.html` / `README.md` 保持 `420dd28` 原样。
