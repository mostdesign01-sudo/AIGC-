# HTML+ · Fable 5.1 系统方案 · Kage 五段重接（2026-09-06）

- 课：《HTML+：AI 时代的工作表达新方式》，本仓库 `demos/html-plus-course/`。
- 审稿席：Fable 5.1（本文件作者）。只审、只出方案、控节奏；本轮不改 `index.html`、不改任何业务代码、不改冻结文案。
- 执行者：Grok 4.6，按第 3 节批次 R0 → R5 执行；每批一个 commit、一次 PR 更新、回到第 5 节自验。
- 审稿依据：Hao 2026-09-06 定调三条 + **Hao 本地《Kage互动大纲-2026-09-06》摘要（§1.0，本方案映射以它为准）** + 五张核心截图（门页 / P01 / P03 章封面 / P12 案例门 / P13 案例一，1024×621）+ 本目录 `DESIGN.md` `ASSETS.md` `OPTIMIZATION-5.1.md` `OPTIMIZATION-SCENE-5.1.md` `QA-SCENE-5.1.md` + `poster/cover-poster-master.png` + Kage 公开页与其 `PROMPT.md`（只读其板块叙事，不读其代码）。
- 硬约束（全文有效）：入口只有 **蓝龙虾**；对外只有 **POIZON**；不教任何编辑器 / 构建工具 / 前端框架 / 「氛围编程」类口号（禁词表原文见 `OPTIMIZATION-5.1.md` §5.2，本文件不复述）；`HyperFrames` 只在 P15 `.hf` 小标签，口播叫 **视频插件**；主副标 / 定义 / 四动作 / 金句 / 提示词 / 结课句七条冻结句逐字不动（§5.3）；**仍是 16:9 页翻，禁止整包 Three.js / 多 canvas / 寺庙引擎**。
- 已落地、勿推翻：B2 章封面场 + 案例窗（窗内无 grain、白底卡、奖杯「静帧待补」）；P01 黑场海报化；非案例文案急修；案例一已接 decal / 箱 / 证书真图。
- 另轨、不在本方案范围：**案例四问**。本方案不动 `.beats4` 四拍文案与逻辑，只动其选中态外观（§3 R4）。

---

## 0. 前置事实（Grok 开工前先读，三条都要确认）

### 0.1 两个谱系，截图不是仓库 tip

| | 仓库 tip | 五张截图（Hao 本地课件） |
|---|---|---|
| 分支 / 提交 | `cursor/html-plus-batch-m-e5cb` @ `5ab1fd5`（批次 I–M，「场景流」谱系） | 未入库；结构对应 `cursor/html-plus-course-8c8b` 谱系 + 本地批次（B2 章封面场 / 案例窗、P01 黑场、文案急修、案例一真图） |
| 判据 | dock 有「改字 / 重置 / 讲稿」三键；门页 eyebrow 是 `\ 00 · 门前 /`；`--bg: #07090d` 黑场；海报母本是全课底景，六机位 | dock 只有「讲稿」一键；门页 kicker 是 `CHAPTER 00 · 门前`；`--bg: #f5f6f6` 浅灰 + Klein 左栏 + 16:9 白舞台卡；`.cine-word` 巨字 `HTML+` |
| 海报母本 | 门页与全课底景 | 门页用的是另一张「蓝色山景 + 玻璃屋 + 蓝衣角色」渲染图，**不是** `poster/` 母本 |
| 冻结保护 | `data-frozen` ×6 + `FROZEN` 常量 + 复制从常量 | 8c8b 谱系无 `data-frozen`、无 `FROZEN` 常量（本地是否补过，未知） |

**结论：Hao 的「已落地、勿推翻」与《Kage互动大纲》全部在截图谱系上，本方案以截图谱系为基线。**仓库 tip 上批次 I–M 做过的东西不是要被丢掉，而是拆成「元件」被移植（`.win / .win-bar / .sl / .cut` 同图裁切、`probeAsset`、`data-frozen` + `FROZEN`、六机位终值）。Grok 不得把批次 M 的黑场整套压回来，也不得把本地课件按批次 M 重写。

**前置动作（批次 R0 第一步）**：Hao 把本地 `index.html`（连同 `door-still.webp`、已接入素材、`Kage互动大纲-2026-09-06.md`）落到仓库分支；Grok 在落盘版本上跑第 5.5 节「不变量」核对，通过后才开 R1。落盘前 Grok 只能做与页面无关的准备（读本文件、对照选择器）。

### 0.2 母本只有 PNG，PSB 仍在追

`poster/cover-poster-master.png`（1200×675）是唯一母本：黑场→钢蓝渐变；巨型 `HTML` 字母居中做中景；得物方标居顶；`\ AI 时代的 工作表达新方式 /` 白色重字重柔光；`Approach` 极光青手写压在标题右下；居中窗口线框（`— ☐ ✕`，内有两问）；两只点阵手从左下 / 右下伸向窗口；底栏 `TIME . 0915 / 20:00　ADD . 11F — 培训室1103`；两侧 `POIZON DESIGN` / `OPEN CLASS`。

PSB 未到 = 没有分层。手 / 字母 / Approach / 窗口全部走**同图裁切**（`.cut`：`overflow:hidden` + `mix-blend-mode: screen` + `mask-image` 羽化；坐标见 `DESIGN.md`「近景密度」一节，已按 1200 文件量过）。PSB 到了再换分层文件，选择器与坐标变量不变。**禁止 AI 重画、禁止放大截图充数、禁止用旧「捏窗」版冒充。**

### 0.3 门页角色不在母本里

截图 01 门页有一个三维蓝衣角色。它不来自母本，也不在 Hao 本轮「已落地」清单里；旧守则（`OPTIMIZATION-5.1.md` §5.1）写明「不加 IP、不加角色」。本方案默认：**角色不进任何内页；门页是否保留由 Hao 一句话定**（第 6 节第 1 条）。Hao 未答复前，Grok 不动门页底图，只做 R1 里与底图无关的项。

---

## 1. Kage 五段 → 课页 / 互动映射表

### 1.0 Hao 大纲摘要（原文口径，本方案以此为准；完整稿在协作机 `html-plus-course/Kage互动大纲-2026-09-06.md`，R0 一并落盘）

| Kage 段 | Hao 大纲对应 |
|---|---|
| hero | `#loader` → P01 |
| gate | P02 四卡跳章 + P03 / P06 / P08 章封面场 |
| pathways | P12 三门 → P13–P15 案例窗（奖杯 / NONO / VOL.06 静帧待补） |
| lessons | P07 四动作；P09–P11 判断；P17–P19 作业 + 蓝龙虾 |
| eternity | P20 结课句 |

节奏：**进入 → 过门 → 分路 → 功课 → 收束**。仍 16:9 页翻，禁止整包 Three.js。B2 章场 + 案例窗已齐；下一轮优先：**静帧、「只进一间」讲法、轻量选中态**。案例四问另轨。

> 大纲是**功能分段**，不是页序分段（pathways 的 P12–P15 在页序上晚于 lessons 的 P07 / P09–P11）。这是对的：Kage 五段也是「每段一种动作」，观众在页序里遇到哪一段就进入哪一段的节奏。本方案所有签名元件、批次、验收都按功能段归属，不按页序。
>
> 大纲未点名的页（P04 / P05 / P16）由 Fable 补位，标 ※：P04 / P05 归 gate（过门后的讲解页，定义与对照，**无签名元件**）；P16 归 pathways（三路收束成三行）。若与 Hao 完整稿冲突，以完整稿为准。

### 1.1 总表

| 段 | Kage 做了什么（节奏） | HTML+ 页（Hao 大纲） | 这段的动作 | 段签名元件（母本 DNA，第 4 节） | 段的光 | 段内互动（全部已有，不新造） |
|---|---|---|---|---|---|---|
| **hero · 进入** | 一个雕塑感字标 + 一句标题 + 一行引子 + 一个进入动作；不讲道理，只立场 | `#loader` → P01 | 进入 | 巨字 `HTML+` + 斜杠 `\ /` | 黑场（P01 已黑场海报化；门页应回母本黑场） | 一键进入 |
| **gate · 过门** | 山门：一道门 = 一句话；「Cross the threshold」一个动作；每道门一个新构图镜头 | P02 四卡跳章 + P03 / P06 / P08 章封面场（※ P04 / P05 讲解页） | 过门 | 章封面**同图不同机位**（三门三镜头）+ `.ch-no` 斜杠；P02 是门牌 | Klein 章封面（已落地）+ 白舞台讲解页 | P02 四卡 `data-jump`；章封面停住只立一句 |
| **pathways · 分路** | 庭园三径（参道 / 灯籠 / 月影，`01 / 03` 计数），横向卡片，**选一条走** | P12 三门 → P13 / P14 / P15 案例窗（※ P16 三行） | 分路 · 只进一间 | 三门 `01 / 03` 计数 + 点阵手 / 指尖 + 设备框窗口 chrome | 黑场三门（已落地）+ 白底案例窗（B2 已落地） | 三门进房间；P13 四拍 + 材质 Tab + 拖贴花；P14 九格比两款；P15 加时间 / 转场 / 声音 |
| **lessons · 功课** | 编号课表：「每章是一次行走，带走一件值得留下的东西」；可各自进出 | P07 四动作；P09 / P10 / P11 判断；P17 / P18 / P19 作业 + 蓝龙虾 | 功课 · 亲手做一次 | **轻量选中态**（极光青 tick / 2px Klein 条 / 描边，不再实心填满）+ 窗口 chrome（P07 `.demo`、P19 `.prompt`） | 白舞台 + P17 Klein 章封面 | P07 四动作 + 身份 → 金句；P09 只点开一张；P10 单选；P11 三自检；P17 四问；P18 三选一；P19 复制到蓝龙虾 |
| **eternity · 收束** | Afterlight：撤掉场景，剩一墙光 + 一句「门不会在你身后关上」 | P20 结课句 | 收束 | Approach 手写 + 双手回归（母本全图） | 黑场母本全图回归 | 停住，一字不改 |

### 1.2 借法与不借法（逐段）

| 段 | 借（结构 / 节奏） | 不借（禁止） |
|---|---|---|
| hero | 一个字标扛整段；标题 + 一行引子 + 一个进入动作 | 「Scroll to enter」长卷；hero 里塞目录（目录是 P02，属 gate） |
| gate | 「一道门 = 一句话」；每道门一个新构图（同图换机位）；门牌可点（P02 四卡） | 长文；寺庙意象；门上加数字条 |
| pathways | 三径计数 `01 / 03`；「选一条走」= **现场只进一间**，其余两间留给观众自己看 | 图片大卡当路径；改三案数量、名称、四拍词 |
| lessons | 「一课带走一件」= 一页只让人做一个动作；编号 / 计数已在 kicker | 时长数字；术语标签；新长文案 |
| eternity | 撤掉场景只剩光 + 一句话；「门不关」= 母本回来 | 结课后自动回门页；manifesto 页脚；新增任何句子 |

---

## 2. 相对现行课（截图谱系）的差分

### 2.1 已齐（勿动）

| 项 | 证据 | 归属段 |
|---|---|---|
| 巨字 `HTML+` 扛门页 | 截图 01 `.cine-word` | hero |
| P01 黑场海报化：黑卡 + 角标括线 + `POIZON 全员课` + 课名 + 副标 + 四拍线 + 开场问 | 截图 02 | hero |
| B2 章封面场：Klein 整卡 + 章号大水印 + `0n 章名` 字距标 + 金句 | 截图 03 | gate |
| P12 黑场三门：`.door.win` 线框 + `进入房间 →` + `04` 水印 | 截图 04 | pathways |
| B2 案例窗：白底卡 + `HTML 3:2` 黑设备框 + 四拍 + 材质 Tab；窗内无 grain | 截图 05 | pathways |
| 案例一真图：字标 / 贴花 / 吊牌 `.shirt-skin`、箱纹理、证书正面；奖杯「静帧待补」 | 截图 05 右栏；`ASSETS.md` | pathways |
| 20 页顺序、`chStarts = [0,2,5,7,11,16]`、六章名、`data-note` 二十条 | 仓库两谱系一致 | 全局 |
| 段内互动全部存在（§1.1 最右列） | 8c8b 谱系与批次 M 谱系均有 | 全局 |

### 2.2 缺口（本方案要补的；★ = Hao 大纲「下一轮优先」）

| # | 缺口 | 段 | 补法（第 3 节哪一批） |
|---|---|---|---|
| ★G1 | 奖杯 / NONO 01–09 / VOL.06 静帧未落盘；槽位有、文件无 | pathways | R3b：槽位与探测就位，文件到即出，无文件保持「待补」；Hao 侧供图（第 6 节第 2 条） |
| ★G2 | 「只进一间」没有结构支撑：三门等权、房间页不知道自己是第几间、讲师只能靠 dots 跳出 | pathways | R3a：三门 `01 / 03` 计数；房间 `.win-title` 显示 `案例一 · 01 / 03`；三门 hover 手三档；讲稿口径待 Hao 给字（第 6 节第 3 条） |
| ★G3 | 选中态 = 实心 Klein 填满（截图 05 首拍；P07 身份、P10 单选、P11 常亮、P18 任务同法），一屏可同时 2–3 块实心蓝 | lessons（及 pathways 四拍） | R4：全局 `.is-on` 改轻量选中态；每屏实心 Klein ≤ 1 块（只留 P11 第三条常亮） |
| G4 | 门页底图不是母本；蓝衣角色不在母本、不在守则 | hero | R1b（待 Hao 定角色；默认母本回门页） |
| G5 | 母本 DNA 只到门页巨字一处；内页无斜杠 / 窗口 chrome / 点阵手 / Approach / 方标回响 | 全部 | R0 建元件库；R1–R5 每段落一个签名元件 |
| G6 | 三张 gate 章封面（P03 / P06 / P08）除章号外无差别，「三道门」看不出是三个地方 | gate | R2：章封面底层加母本同图三机位，Klein 洗仍在上 |
| G7 | P07（功课第一课）演示框是普通卡；P19 提示词框是普通卡 | lessons | R4：`.demo` / `.prompt` 换 `.win` 外壳；四动作点亮窗口四区（批次 K 映射移植） |
| G8 | P20 结课与门页无回响 | eternity | R5：底层母本全图 + 双手 + Approach |
| G9 | 截图 05 设备框底边被舞台裁切，`.klein-bar` 不可见（1024×621） | pathways | R3b：`.device` 高度上限；1440×900 与 1024×621 双测 |
| G10 | 截图谱系无 `data-frozen` / `FROZEN` / `probeAsset`（本地是否补过未知） | 全局 | R0 核对；缺则移植 |
| G11 | `DESIGN.md` 描述的是批次 M 黑场系统，与截图谱系不一致 | 文档 | R0：加「谱系说明」；token 表分「共用 / 仅黑场谱系」 |

### 2.3 风险

| # | 风险 | 触发条件 | 预案 |
|---|---|---|---|
| K1 | Grok 在仓库 tip（批次 M）上执行，做完与本地对不上 | R0 未落盘就开工 | R0 硬门：落盘 + §5.5 不变量通过才开 R1 |
| K2 | 把「借 Kage 板块」做成「做一个 Kage」：加 canvas、加滚动长卷、加寺庙意象 | 任何批次 | §5.6：`<canvas>` ≤ 1（仅 grain）、无 WebGL context、无 `<script src>`、16:9 页翻不变 |
| K3 | 「只进一间」被做成改翻页逻辑（P13 下一页直跳 P16） | R3a | 默认**不改翻页**；只做计数 + 标题 + 讲稿口径；若 Hao 要「进一间即跳」，作为 R3a 附加项单列 |
| K4 | 轻量选中态让 P11「第三条最重」失焦 | R4 | P11 `.check.is-stop` 是全课唯一保留的实心 Klein |
| K5 | 同图裁切在白底卡上失效（`screen` 在白上不可见） | R3b 案例窗 | 白底卡用 `.cut.on-light`（`multiply` + `invert(1)`）；仍不行就不放，写「待 PSB」 |
| K6 | 母本 1200 宽，章封面 1.6× 在 1920 屏发软 | R2 | 章封面底层 `opacity ≤ .3` + Klein 洗在上；仍向 Hao 追 ≥ 2400 原图 |
| K7 | 角色去留拖住 R1 | Hao 未答复 | R1 拆 R1a（P01）与 R1b（门页） |
| K8 | 新增微文案越界 | R3a 计数 | 全课新增 `textContent` ≤ 12 字；计数用伪元素，不进 `textContent` |
| K9 | 冻结句被伪元素 / 换行位置改动 | R1a 斜杠 | `.sl` 只加在 `.who` / `.ch-no` / `.loader-kicker` / `.sum3 .who`，**不**加在任何 `[data-frozen]` |
| K10 | 案例真图色温与黑场母本冲突 | R3b | 设备框内原色；框外 `saturate(.85) brightness(.9)` |
| K11 | 手机 390 上签名元件互相叠 | R5 | 手机只留巨字、斜杠、窗口 chrome、轻量选中态；`.cut` 全隐，P20 例外一个左指尖 |

---

## 3. 分批执行清单（Grok 4.6）

每批一个主题、一个 commit（标题 `HTML+ 重接R<n>：<主题>`）、一次 PR 更新；做完跑第 5 节对应项；**不跨批带工作、不碰冻结句、不碰 `data-note`、不改页序、不改翻页逻辑**。

顺序与优先（按 Hao「下一轮优先」）：R0 → R3a（只进一间）→ R4（轻量选中态）→ R3b（静帧结构 + 设备框）→ R1 → R2 → R5。R3a / R4 / R3b 三批彼此不依赖，可并行，PR 分开。

节奏（Fable 控）：R0 单独复验；R3a + R4 合并复验（Hao 优先项）；R3b 单独复验（静帧到一批验一批）；R1 + R2 合并复验（含 Hao 角色答复）；R5 终验。

### 全局勿动区（每批都适用）

- 七条冻结句文本、`[data-frozen]` 节点内容、`FROZEN` 常量；复制永远从常量。
- `data-note` 二十条；20 页顺序；`chStarts`；六章名；四动作词与顺序；三案名与四拍词；**案例四问（另轨）**。
- 已落地：B2 章封面场的 Klein / 黑场配色与版式、P01 黑卡版式、案例窗白底与 `HTML 3:2` 设备框、案例一真图接法。
- 16:9 页翻不变；不引入 npm / 构建 / 字体 CDN / `@font-face` / 图标库 / Three.js / 任何 3D 或播放器 runtime；`<canvas>` 只允许现有 grain 一处。
- 不新增页、不加 IP / 角色 / 跟随指针角色、不加音频、不加二维码 / 投票 / 计时器。
- 不动 `frontend/` `backend/` 与其他 demos。

### R0 · 基线落盘 + 母本元件库（P0，硬门）

范围：`index.html`（仅 `:root` token、新增通用类 CSS、`probeAsset` / `FROZEN` 脚本段；**不改任何页的标记**）；`DESIGN.md`；`ASSETS.md`；落盘 `Kage互动大纲-2026-09-06.md`。
做什么：
1. Hao 落盘本地 `index.html` + `door-still.webp` + 已接入素材 + 大纲；Grok 跑 §5.5 不变量。
2. 缺则移植：`data-frozen`（6 处：P01 `h1` / `.sub`、P04 `.quote`、P07 `#punchline`、P19 `#prompt`、P20 `.gold`）、`FROZEN` 常量、复制走常量、改字模式若存在则排除 `[data-frozen]`。
3. 从批次 M 谱系移植四个通用类与一个探测函数，只定义不使用：`.win` / `.win-bar`（`— ☐ ✕`，含 `.win-title` 槽）、`.sl`（`::before "\\ "` / `::after " /"`）、`.cut`（同图裁切：`overflow:hidden; mix-blend-mode:screen; mask-image` 羽化；变量 `--pw/--px/--py/--mx/--my`）、`.cut.on-light`（白底用：`mix-blend-mode:multiply; filter:invert(1) contrast(1.15)`）、`probeAsset()`。
4. token 补进 `:root`：`--bone #ece9e2`、`--bone-soft`、`--bone-line`、`--aurora #01c2c3`、`--dots`、`--klein-wash-light rgba(0,47,167,.10)`（白底选中洗上限）、`--cam-x/--cam-y/--cam-s`（默认 `50% 50% / 1`）。
5. `DESIGN.md` 顶部加「谱系说明」：本课基线 = 浅灰舞台 + Klein 左栏 + 16:9 卡 + B2 章封面场 / 案例窗；token 表标注共用 / 仅黑场谱系历史值；六机位终值表保留。`ASSETS.md` 加 `door-still.webp` 一行（来源、状态、「待 Hao 定去留」）。
成功标准：
- 页面像素与落盘版本逐页一致（新类未被引用）。
- `document.querySelectorAll('[data-frozen]').length` = 6；`grep -c 'const FROZEN'` = 1；§5.5 全部通过。
勿动区：全部页标记；门页底图；任何颜色决定。
风险：本地版可能已有同名类（如 `.win` 用在 P12 三门）。冲突时保留本地定义、以 `.win-r` 前缀移植，并在 `DESIGN.md` 记录。

### R3a · pathways · 只进一间（★P0）

范围：P12 `.doors .door.win`、`.ch-no`；P13 / P14 / P15 `.device-chrome .win-title`；`README.md` 讲法一段。
做什么：
1. 三门计数：`.door .tag` 后以 `::after` 渲染 ` · 01 / 03`、` · 02 / 03`、` · 03 / 03`（伪元素，不改 `textContent`）。
2. 三门 hover：一只母本左手 `.cut`（`12% 78% / 1.6`，`opacity .5`，`screen`）从左下伸向三门，hover 哪扇门手 `translateX` 三档（0 / 8px / 16px）；手 `pointer-events:none`。`.ch-no` 改 `.sl`。
3. 房间页自报：进房间时 `.device-chrome .win-title` 写 `案例一 · 01 / 03`（用该页 `kicker` 已有字 + 计数；不新写文案）。
4. 讲法结构：`README.md` 加「只进一间」一段——现场从 P12 点一扇门进一间，讲完用左栏 / dots 回 P16；其余两间留给观众课后自己开。**翻页逻辑不改**（P13 下一页仍是 P14）。
5. 讲稿 `data-note` P12 现文「点『进入房间 →』进案例一、二或三」若要改成「只进一间」口径，**由 Hao 给字**，Grok 不自写。
成功标准：
- 三门可见 `01 / 03 … 03 / 03`，`textContent` 不含 `/ 03`。
- hover 三门手三档位移；手与 `.doors` 交集 ≤ 8% 帧面积；手不可点。
- 进任一房间，`.win-title` 显示对应计数；`data-note` 未改。
勿动区：三门文案、三案名、四拍、翻页顺序、案例四问。
风险：本地 `.door.win` 若已含 `.win-bar`，计数放 `.tag` 行不放 bar。

### R4 · lessons · 轻量选中态 + 窗口 chrome（★P0）

范围：全局 `.is-on` 规则（`.pick` / `.roles button` / `.scene` / `.scene-mini button` / `.check` / `.task` / `.beats4 button` / `.mat-tab` / `.tee-tools button` / `.nono` / `.tl-btns button` / `.qs article`）；P07 `.demo`；P19 `.prompt` / `.slot` / `.job-out`；P17 `.ch-no`。
做什么：
1. 轻量选中态（白底卡上）：`border: 1px solid var(--klein)` + 左侧 2px Klein 条 + 标题字 `--klein` + 填充 ≤ `--klein-wash-light`（.10）；hover = `--dots` 点阵；**唯一保留实心 Klein**：P11 `.check.is-stop`。黑场页（P12 三门）选中 = 1px `--bone-line` → Klein 描边。
2. 极光青 tick：P09 `.scene`、P10 `.scene-mini`、P17 `.qs`、P18 `.task` 选中项底加 2px 极光青下划线（tick 只做选中，不做正文）。
3. P07 `.demo` 换 `.win` 外壳；四动作映射窗口四区：`hold` → 整框描边亮一次；`org` → `.demo-org` 行亮；`recv` → `.roles` 脉冲；`reply` → `#next-step` 亮；`#punchline` 逻辑不变。
4. P19 `.prompt` 换 `.win` 外壳；`【谁】【什么事】` `.slot` 极光青下划线；P18 选题后 P19 `.job-out` 显示 `data-hint` 原文（内存变量，不入 `localStorage`）；复制仍从 `FROZEN.prompt`。
5. P17 章封面 `.ch-no` 改 `.sl`；底层 `.cut` 母本（`50% 50% / 1.1`，`opacity .3`）。
成功标准：
- 1440×900 任一屏实心 Klein 填充块 ≤ 1（P11）；其余选中态为描边 + 2px 条 + ≤ .10 洗；`rgba(0, ?47, ?167` 出现的 alpha 在白底卡上全部 ≤ .10。
- 选中文字对比度 ≥ 4.5:1（Klein 字在白上 ≈ 8.6:1，达标）。
- P07 依次点四动作窗口四区各亮；点身份后 `#punchline` 出现，逐字 = §5.3 第 5 条。
- P19 复制结果逐字 = §5.3 第 6 条；刷新后 `.job-out` 空。
勿动区：所有选项文案；P11 三自检句；P18 `data-hint`；P17 四问；四拍文案（案例四问另轨）。
风险：`.beats4` 首拍默认 `is-on` 失去实心后与其他三拍区分度下降 → 首拍额外 `font-weight: 600`。

### R3b · pathways · 静帧接入结构 + 设备框（★P1，文件未到也可做完）

范围：P13 `.mat-ph[data-mat-pane]`；P14 `.nono` / `.cc-shot`；P15 `.fake-page .motion-still`；`.device` 尺寸；`ASSETS.md`；`assets/poizon/README.md`。
做什么（全部「文件存在才显示」，否则「待补」）：
1. 奖杯：`assets/poizon/cup/preview.webp` → P13 奖杯 pane `object-fit: cover` + `.win`；无文件保持「静帧待补」。
2. NONO：`assets/poizon/nono/01–09.webp` → 九格底 + 对比卡两侧 `.cc-shot`；无文件仅编号格。
3. VOL.06：`assets/poizon/motion/frame.webp` → P15 `.fake-page` 底；无文件不显示。
4. 指尖：P13 左、P14 右、P15 左各一个 `.cut.on-light`（`opacity .35`）贴设备框外侧白底区，不进 3:2 框、不贴 pane。
5. 修 G9：`.device` 高度上限 = 舞台高 − 四拍高 − 24px；1440×900 与 1024×621 下 `.klein-bar` 完整可见。
6. 静帧规格写进 `assets/poizon/README.md`（已有则核对）：宽边 ≤ 1600、webp q≈80、每案例 ≤ 6 张、总量 ≤ 3MB；禁 `.glb / wasm / build/ / 播放器脚本 / 视频自动播放`。
成功标准：
- 无素材时 P13–15 与 R0 落盘版逐像素一致（除指尖与设备框高度）；放入任一静帧后对应槽位出图、无「待补」。
- 1024×621 截图设备框底边与 `.klein-bar` 完整可见。
- 指尖对比度 ≥ 2:1 且不遮任何按钮；做不到就不放，PR 写「待 PSB」。
- `assets/poizon/` 无 `.js / .wasm / .glb / .json / .mp4`。
勿动区：三案四拍文案；`AI Coding` 两句（仍待 Hao）；B2 白底与设备框 chrome；真图接法与路径；奖杯「待补」文案。
风险：`on-light` 反相版在证书白图旁发灰 → 只贴框外侧。

### R1 · hero（`#loader` → P01）（P1）

拆 R1a（P01，立即可做）与 R1b（门页，等 Hao 第 6 节第 1 条答复）。

范围：`#loader`（`.door-field / .door-still / .cine-word / .loader-copy / .loader-kicker / .loader-title / .loader-sub / .enter-btn`）；P01 `.page.cover`（`.who`）。
做什么：
- R1a：P01 `.who` 改 `.sl`（渲染为 `\ POIZON 全员课 /`，与母本标题两侧斜杠同法）；黑卡底层加一个 `.cut` 母本字母区（`50% 8% / 1.32`，`opacity .22`），字母只做暗纹；角标括线保留。
- R1b（三选一，按 Hao 答复）
  - A（默认，符合定调 1）：`door-still.webp` 换 `cover-poster.webp`；`.door-field` 渐变改 `linear-gradient(90deg, rgba(0,47,167,.28), transparent 60%)`；`.cine-word` 巨字保留，但门页不得出现两套可读的 `HTML`：巨字压在母本字母区之上、左缘对齐，母本字母 `brightness(.55)` 退成「影」（`getBoundingClientRect` 交集 ≥ 60%，否则调 `left / top`，不改字号）；`.loader-kicker` 改 `.sl`；`.enter-btn` 保留白底按钮；角色不出现。
  - B（Hao 保留角色）：底图不动；`.loader-kicker` 用 `.sl`；右下一个 `.win` 空线框（与母本窗口同比例 28:27，宽 18vw）；巨字加 `--display-glow`。角色不进内页。
  - C（Hao 另给门页图）：按 A 的层法接新图，仍走 `door-still.webp` 路径。
成功标准：
- P01 黑卡里能看见母本字母暗纹（对比度 ≤ 1.3:1，不抢课名）；课名、副标 `textContent` 与 §5.3 第 1 / 2 条逐字一致。
- 门页（A / C）底图即母本或 Hao 新图；无角色；巨字与母本字母不形成两套可读 `HTML`。
勿动区：`.loader-sub`（冻结副标）；一键进入流程；P01 版式与四拍线。
风险：巨字与母本字母重叠出摩尔纹 → 巨字 `mix-blend-mode: normal` + 母本字母区 `brightness(.55)`。

### R2 · gate（P02 + P03 / P06 / P08）（P1）

范围：P02 `.overview-grid .pick`；P03 / P06 / P08 `.center-page.is-chapter` 底层与 `.ch-no`。
做什么：
1. 三道门三个镜头：P03 `.cut` 母本（`12% 78% / 1.6`，左手大）、P06（`50% 75% / 1.5`，窗口居中）、P08（`88% 78% / 1.6`，右手大），均 `opacity .3`，Klein 洗在上层不变；`.ch-no` 改 `.sl`。
2. P02 门牌：hover 四卡 → 左栏对应 `.ch` 预亮（`data-jump` 已有，加 `mouseenter` 映射）；P02 不加斜杠、不加 `.cut`。
3. P04 / P05 不动（※ 讲解页无签名元件）。
成功标准：
- P03 / P06 / P08 底层母本任意两张位移 ≥ 6% 帧宽（量 `.cut > img`）；Klein 面积与颜色不变。
- P02 hover 卡 → 左栏章预亮，移开还原；点卡跳章不变。
勿动区：章封面金句、四步 / 链式词；P02 四卡文案；P04 定义与六岗位卡；P05 四列。
风险：`.cut` 与 Klein 卡 `border-radius` 冲突 → `.cut` 放卡内 `inset:0; border-radius: inherit; overflow:hidden`。

### R5 · eternity（P20）+ 手机 / reduced-motion 收口（P1）

范围：P20 `.close-page`；`@media (max-width: 979px)`；`@media (prefers-reduced-motion: reduce)`；新增 `QA-KAGE-5.1.md`。
做什么：
1. P20：底层母本全图 `.cut`（`50% 50% / 1.1`，`opacity .35`，与 P17 同机位）+ 左右指尖两个 `.cut`（`opacity .55`，从下角入）+ Approach 手写 `.cut`（`--cut-a .35`）右下；结课句居中不动；不加任何新句。
2. 手机 ≤ 979：只留巨字（门页）、斜杠、窗口 chrome、轻量选中态；所有 `.cut` 隐藏，P20 例外一个左指尖；底部固定区 ≤ 96px；20 页无横滚。
3. `prefers-reduced-motion`：`.cut` 无入场、无 hover 位移；四动作 / 四拍点亮改瞬切；门页静态。
4. 新增 `QA-KAGE-5.1.md`：第 5 节全部条目勾选 + 截图（门页 / P01 / P03 / P07 / P12 / P13 / P18 / P20 桌面 + 390）放 PR 附件，不入仓库。
成功标准：
- P20 能看到母本双手与窗口；结课句 `textContent` = §5.3 第 7 条。
- 390 宽 20 页无横滚；`.cut` 数 = 0（P20 = 1）；reduced-motion 下 `document.getAnimations().length` = 0。
勿动区：结课句；P17–P19 文案。
风险：P20 母本全图 + 双手与 P01 观感重复 → P01 只字母暗纹，P20 才双手。

---

## 4. 海报 DNA 深延内页（仍不搬 Three.js）

### 4.1 元件表（母本 → 课内回响）

| 母本元件 | 母本位置（% 帧宽 × % 帧高，1200×675 实测） | 课内元件 | 出现处 | 不出现处 |
|---|---|---|---|---|
| 黑场→钢蓝渐变 | 全幅 | 章封面 / P01 / P12 / P20 底层 `.cut` 母本 + 各段洗 | 章封面与黑场页 | 白舞台讲解页（保持浅灰 / 白，勿推翻） |
| 巨型 `HTML` 字母 | 居中，y 5–45 | 门页 `.cine-word`（已有）；P01 底层暗纹 | hero | 讲解页 |
| 斜杠 `\ /` | 贴标题两侧，与字同高 | `.sl`：`.who`、`.ch-no`、`.loader-kicker`、`.sum3 .who` | hero / gate / pathways | 冻结句节点；讲解页 `kicker` |
| 窗口 chrome `— ☐ ✕` | (36–64, 60–87) | `.win` / `.win-bar` / `.win-title`：P12 三门（已有）、P13–15 设备框（已有黑框，补 `.win-title` 自报）、P07 `.demo`、P19 `.prompt`、讲稿面板 | pathways / lessons | 章封面（封面不放窗） |
| 点阵手 · 左 / 右 | 左手 x0–39 / y53–85；右手 x60–100 / y62–92；左指尖 ≈ (40.5, 71)；右指尖裁切 x56–62.5 | `.cut`（黑场 `screen`）/ `.cut.on-light`（白底 `multiply` + 反相） | P03 左手、P06 窗口、P08 右手、P12 左手、P13–15 指尖、P20 双手 | 讲解页、P01（只字母）、P02、P04、P05、P07、P09–P11、P16、P18、P19 |
| Approach 手写（极光青） | x62–78 / y50–61 | `.cut` 同图裁切 ≤ 2 处 | P20 右下；门页（母本本体） | 其他任何页 |
| 得物方标 | (45–55, 11–22) | `.brand-slot`（探测 `assets/poizon/logo/poizon.png`，已落盘） | 左栏顶部 20px；P20 顶部居中 alpha .6 | 每页 |
| 底栏 `TIME / ADD` 小字 | y 93–97 | 不复用（课堂无时间地点信息） | — | 全课 |
| `POIZON DESIGN` / `OPEN CLASS` | 两侧 | 不复用（左栏已有 `POIZON 全员课`） | — | 全课 |
| 极光青（Approach 的颜色） | — | **轻量选中态** tick / 下划线 / `.slot` | lessons | 正文、标题、填充 |

### 4.2 每段一个签名（观众余光分段的依据，按 Hao 大纲功能段）

| 段 | 签名元件 | 章封面底层机位（`.cut`） | 出现页 |
|---|---|---|---|
| hero · 进入 | 巨字 + 斜杠 | P01 `50% 8% / 1.32`（字母暗纹） | 门页 / P01 |
| gate · 过门 | 三门三镜头 + `.ch-no` 斜杠；P02 门牌 hover 预亮 | P03 `12% 78% / 1.6`；P06 `50% 75% / 1.5`；P08 `88% 78% / 1.6` | P02 / P03 / P06 / P08 |
| pathways · 分路 | 三门 `01 / 03` 计数 + 左手 + 指尖 + 设备框自报 | P12 `50% 20% / 1.3` + 左手 `.cut` | P12 手；P13–15 指尖 |
| lessons · 功课 | 轻量选中态（极光青 tick / 2px Klein 条 / 描边）+ 窗口 chrome | P17 `50% 50% / 1.1` | P07 / P09–P11 / P17–P19 |
| eternity · 收束 | 母本全图 + 双手 + Approach | P20 `50% 50% / 1.1`（与 P17 同） | P20 |

五张章封面（P03 / P06 / P08 / P12 / P17）五个机位，任意两张母本位移 ≥ 6% 帧宽；同段翻页底层不动（P20 与 P17 同机位，只多指尖与 Approach）。这就是 Kage「每段一个新构图镜头」的无 Three 版本：一张图、五个裁切、CSS `object-position + scale`，一次解码，16:9 页翻不变。

### 4.3 密度与亮度上限

| 页型 | `.cut` 数 | 亮度上限 | 备注 |
|---|---|---|---|
| 门页 | 0（母本本体即手）+ 巨字 | 母本原样 | 角色去留待 Hao |
| P01 | 1（字母暗纹） | `.22` | 不放手 |
| gate 章封面 P03 / P06 / P08 | 1（机位底层） | `.3` | Klein 洗在上 |
| P12（黑场三门） | 2（机位底层 + 左手） | 底 `.3` / 手 `.5` | 手响应 hover，不可点 |
| 案例窗 P13–15 | 1（反相指尖） | `.35` | 白底用 `on-light`；不进 3:2 框 |
| P17 章封面 | 1（机位底层） | `.3` | |
| 讲解 / 功课页 | 0 | — | 「课程内容为主」的落地；功课页靠轻量选中态说话 |
| P20 | 4（全图 + 双指尖 + Approach） | `.35` / `.55` | 唯一双手内页 |

全课 `.cut` 非空页 = 10（P01、P03、P06、P08、P12、P13、P14、P15、P17、P20）。

### 4.4 与「不搬 Three.js」的边界

- 空间感来自三件事：**机位不同的同图裁切**（章封面）、**近景压边**（手 / 指尖贴框外侧）、**留白**（讲解页无手无纹）。不需要 WebGL。
- 允许的动：`transform / opacity` 过渡 300–900ms；hover 三档位移；点亮瞬态。不允许：滚动驱动相机、逐帧、粒子、雨、叶、月。
- 允许的层：`.cut` 每页 ≤ 4（仅 P20）、其余 ≤ 2；`<canvas>` 仅现有 grain 一处；`mix-blend-mode` 只用 `screen`（黑场）/ `multiply`（白底）。
- PSB 到后：`poster/hand-left.png` / `hand-right.png` / `approach.svg` / `letters.png` 落盘，`probeAsset` 有则用，选择器与变量不变。

---

## 5. 验收标准（给下一轮 5.1 复验）

打开方式：双击 `index.html`，Chrome / Edge / Safari，`file://`，无网络。1440×900、1024×621、390×844 各过一遍。

### 5.1 五段能被余光分出来（进入 → 过门 → 分路 → 功课 → 收束）
- [ ] 进入：门页巨字 + 斜杠；P01 底层母本字母暗纹可见但不抢课名。
- [ ] 过门：P03 / P06 / P08 底层母本三个机位互不相同；P02 hover 四卡左栏预亮。
- [ ] 分路：P12 三门 `01 / 03 … 03 / 03`，hover 手三档；进任一房间 `.win-title` 自报计数；P13–15 各一个指尖贴框外。
- [ ] 功课：P07 / P09 / P10 / P11 / P17 / P18 选中态全部为描边 + 2px 条 + ≤ .10 洗（P11 第三条除外）；P07 `.demo` 与 P19 `.prompt` 是同一种窗口 chrome。
- [ ] 收束：P20 母本全图 + 双手 + Approach，结课句居中。
- [ ] 任意两张章封面底层母本位移 ≥ 6% 帧宽（量 `.cut > img`）；同段翻页底层不动。

### 5.2 已落地未被推翻
- [ ] 章封面仍是 Klein 整卡 + 章号水印 + `0n 章名`；P01 仍黑卡 + 角标括线 + 四拍线；P12 仍黑场三门；P13–15 仍白底卡 + `HTML 3:2` 黑设备框，窗内无 grain；奖杯无文件时仍「静帧待补」。
- [ ] 案例一字标 / 贴花 / 吊牌 / 箱纹理 / 证书真图仍出；`ASSETS.md` 路径未改。
- [ ] 非案例文案与落盘版本逐字一致（`diff` 只允许新增伪元素 / 类名 / 结构包裹；新增 `textContent` 只有 §5.5 列出的字符）。
- [ ] 翻页顺序未改：P13 下一页是 P14；`chStarts` 不变。

### 5.3 母本 DNA 用法合规
- [ ] `.sl` 只出现在 `.who` / `.ch-no` / `.loader-kicker` / `.sum3 .who`；不在任何 `[data-frozen]` 节点上。
- [ ] 极光青只在：选中 tick / 下划线 / `.slot` / Approach；不在正文、标题、填充。
- [ ] 实心 Klein 填充：1440×900 任一屏 ≤ 1 块（P11 `.check.is-stop`）；白底卡上 Klein 洗 alpha ≤ .10。
- [ ] `.cut` 非空页恰好 10 页（§4.3）；讲解 / 功课页 `.cut` = 0；所有 `.cut` `pointer-events: none`。
- [ ] 门页底图为母本或 Hao 新图；无角色（或 Hao 已书面批准保留且角色不进内页）。
- [ ] 无 AI 重画、无旧「捏窗」版素材。

### 5.4 互动仍是课的互动
- [ ] P07 点四动作窗口四区各亮，点身份后金句出现；P13 四拍 + 拖贴花；P14 点两款出对比卡；P15 加时间 / 转场 / 声音；P18 选题 → P19 预览行，刷新后无；P19 复制结果逐字 = §5.3 第 6 条。
- [ ] 「只进一间」讲法能走通：P12 进一间 → 讲完 → 左栏 / dots 回 P16，其余两间未被隐藏、仍可进。
- [ ] 关掉所有新增视觉（不 hover、不看手）也能按 `data-note` 三段讲完 P01–P20。

### 5.5 不变量（每批必跑）
- [ ] 七条冻结句 `grep -c -F` 各 ≥ 1 且逐字；`[data-frozen]` 节点 = 6；`FROZEN.title` / `FROZEN.prompt` 与 §5.3 一致。
- [ ] 禁词 0（按 `OPTIMIZATION-5.1.md` §5.2 表逐词 grep，含注释）；`HyperFrames` 仅 `.hf` 一处；`蓝龙虾` 是唯一工具名；`POIZON` 是唯一品牌英文。
- [ ] 20 页；`chStarts = [0,2,5,7,11,16]`；`data-note` 20 条未改（「只进一间」口径若改，须是 Hao 给字并在 PR 单列）；六章名未改。
- [ ] 全课新增 `textContent` 字符清单（R0–R5 累计）≤ 12 个，逐字列在 `QA-KAGE-5.1.md`；计数 `01 / 03` 与 `.win-title` 自报为伪元素 / 复用已有字，不计入。

### 5.6 不是 Kage 克隆
- [ ] `grep -ci 'three\|webgl\|getContext("webgl'` = 0；`<canvas>` ≤ 1；`<script src>` = 0；无 `@font-face` / CDN。
- [ ] 仍是 16:9 页翻：无滚动驱动相机、无长卷（门页轨道不变）、无寺庙 / 月亮 / 枫叶 / 朱红意象、无音频、无巨大自定义光标。
- [ ] `assets/` 与 `poster/` 无 `.js / .wasm / .glb / .json / .mp4`。

### 5.7 三尺寸
- [ ] 1440×900 与 1024×621：P13 设备框底边与 `.klein-bar` 完整可见；无元素被舞台裁切。
- [ ] 390×844：20 页无横滚；底部固定区 ≤ 96px；`.cut` = 0（P20 = 1）；门页可读可点。
- [ ] `prefers-reduced-motion`：`document.getAnimations().length` = 0；点亮瞬切；门页静态。

全部勾选 = 可交付主讲；任一条不过 = 该批退回，不进下一批。

---

## 6. 待 Hao 确认（Grok 不得自行决定）

1. **门页角色去留**：默认按守则去掉、门页回母本（R1b 方案 A）。保留则走方案 B，角色不进内页。另给新图走方案 C。
2. **静帧供图**：奖杯 `cup/preview.webp`、NONO `nono/01–09.webp`、VOL.06 `motion/frame.webp`（规格见 `assets/poizon/README.md`）。R3b 结构先做，文件到一批出一批。
3. **「只进一间」讲稿口径**：P12 `data-note` 操作段现文「点『进入房间 →』进案例一、二或三」是否改为「只进一间」口径，请给字；默认不改。是否要「进一间即跳 P16」的翻页逻辑，默认不要。
4. **母本 ≥ 2400 宽原图 / PSB 分层**：到了就换分层文件；未到按同图裁切。
5. **P13 / P14 `.klein-bar` 里「可用 AI Coding …」两句**：旧简报遗留，仍待口径；本轮不动。
6. **`--display-weight: 700` + glow**：批次 I 曾提；截图谱系章封面用的是 400–500 无 glow。本方案不改字重，若要重字重作为 R5 附加项。

---

## 附：五张截图对照索引

| 截图 | 页 | 本方案对应段 | 读到的事实 |
|---|---|---|---|
| 01-door | 门页 | hero | 巨字 `HTML+`；蓝山景 + 玻璃屋 + 蓝衣角色（非母本）；`CHAPTER 00 · 门前` / `走进 HTML+` / 冻结副标 / 白底「进入课堂」/ `点进去，从一份写好的内容开始。` |
| 02-p01 | P01 | hero | 浅灰舞台 + Klein 左栏；黑卡 + 角标括线；`POIZON 全员课`；课名；副标；`文档 — 页面 — 交互 — 分享`（分享极光青下划）；开场问；dock 仅「讲稿」 |
| 03-chapter | P03 | gate | Klein 整卡；`01 什么是 HTML` 字距标；金句两行；`01` 大水印 |
| 04-case-doors | P12 | pathways | 黑卡；`04 我们的 HTML 案例`；金句；三门线框 + `进入房间 →`；`04` 水印 |
| 05-case1 | P13 | pathways | 白卡；`P13 · 案例一 · 比较 / 体验`；四拍（首拍 Klein 实心 → R4 改轻量）；`HTML 3:2` 黑设备框 + T恤 + 贴花；右栏箱纹理 / 证书 / 防伪 / `奖杯静帧待补`；设备框底边被裁切（G9） |
