# 真实素材清单

**当前仓库状态（分支 `cursor/html-plus-batch-l-6af8`）**：课程海报已落盘；`assets/poizon/` 已接入箱纹理、logo、三枚贴花、防伪证书正面。奖杯 / NONO / 动态单帧仍无合格静帧（奖杯包内只有 `.glb`，未拷）。分层手图 / Approach 路径未到，近景用母本同图裁切。

批次 L：槽位已接；已落盘文件出图，其余槽位保持「待补」。

## 已落盘（真实文件在磁盘上）

| 路径 | 来源 | 用法 | 场景用途 | 状态 |
|---|---|---|---|---|
| `cover-poster.webp` | Hao 母本「双手相触」横版（1200×675） | 门页底景；进课后 `.scene-root` far | — | ✅ 已落盘 |
| `poster/cover-poster-master.png` | 同一母本 PNG 原图 | 存档；webp 源 | — | ✅ 已落盘 |
| `poster/hand-left.png` | Hao 分层（可选） | `.cut` 近景左手 | — | 未落盘 → 同图裁切 |
| `poster/hand-right.png` | Hao 分层（可选） | `.cut` 近景右手 | — | 未落盘 → 同图裁切 |
| `poster/approach.svg` | Hao 路径（可选） | Approach 手写 | — | 未落盘 → 同图裁切；不用 web font |
| `assets/poizon/logo/poizon.png` | zip 静帧（800×278） | HUD `.brand-slot`（探测 svg 失败后用 png） | — | ✅ 已落盘 |
| `assets/poizon/logo/dewu.png` | zip 静帧（512×512） | 得物方标存档；本课 HUD 仍走 `poizon.png` | — | ✅ 已落盘 |
| `assets/poizon/decal/mark.png` | zip 静帧（793×1000） | P13 `.shirt-skin` 字标 | pane | ✅ 已落盘 |
| `assets/poizon/decal/decal.png` | zip 静帧（1200×493） | P13 `.shirt-skin` 贴花 | pane | ✅ 已落盘 |
| `assets/poizon/decal/hangtag.png` | zip 静帧（964×999） | P13 `.shirt-skin` 吊牌 | pane | ✅ 已落盘 |
| `assets/poizon/box/texture.webp` | zip 静帧（1600×501） | ch4 `.scene-mid` `soft-light .18`；P13 物流箱 pane | 中景纹理 / pane | ✅ 已落盘 |
| `assets/poizon/anti/preview.webp` | zip 静帧，证书正面（825×1200） | P13 防伪 pane | pane | ✅ 已落盘 |

构图：标题在上半、窗口在下约 1/3、双手从两侧指向窗口。旧捏窗版已作废。`.door-win` 热区终值见 `DESIGN.md`。

## 非产品图（结构占位，不是 zip 素材）

| 项 | 说明 |
|---|---|
| P13 T恤 SVG | 浏览器内绘制的**交互线框**，用于拖 / 换贴花演示；贴花叠在 `.shirt-skin` 上 |
| `assets/poizon/**/.gitkeep` | 接入目录占位；有真实文件的目录不再「空」 |

## 槽位与页上表现

来源包：`POIZON_统一产品互动演示_20260821.zip`。代码用 `Image()` 探测，**文件存在才显示**。

| 槽位 | 期望路径 | 页 | 场景用途 | 状态 | 当前页上表现 |
|---|---|---|---|---|---|
| Logo | `assets/poizon/logo/poizon.png`（另有 `dewu.png`） | HUD 角标 | — | ✅ | 探测到 `poizon.png` 后显示 |
| 字标 | `assets/poizon/decal/mark.png` | P13 | pane | ✅ | `.shirt-skin` 出图；`.win-bar`「字标」 |
| 贴花 | `assets/poizon/decal/decal.png` | P13 | pane | ✅ | `.shirt-skin` 出图；`.win-bar`「贴花」 |
| 吊牌 | `assets/poizon/decal/hangtag.png` | P13 | pane | ✅ | `.shirt-skin` 出图；`.win-bar`「吊牌」 |
| 物流箱 | `assets/poizon/box/texture.webp` | P13 / ch4 中景 | 中景纹理 / pane | ✅ | 中景 soft-light；物流箱 Tab 出图，无「待补」 |
| 奖杯 | `assets/poizon/cup/preview.webp` | P13 | pane | 待补 | 「待补 · 奖杯静帧」（包内只有 `.glb`，未拷） |
| 防伪 | `assets/poizon/anti/preview.webp` | P13 | pane | ✅ | 证书正面；`object-fit: cover` + `.win` |
| 动态纹理单帧 | `assets/poizon/motion/frame.webp` | P15 | pane | 待补 | 不显示（包内无合格静帧） |
| NONO 01–09 | `assets/poizon/nono/01.webp` … `09.webp` | P14 | 缩略 | 待补 | 仅编号格；对比卡两侧缩略位隐藏 |

场景用途取值：`pane`（设备框内静帧 / 贴花）、`中景纹理`（ch4 `.scene-mid`）、`缩略`（九格底 + 对比卡）。

本目录已落盘静帧合计约 1.13MB（≤ 3MB）。无 `.js / .wasm / .glb / .json / .mp4`。

## 待 M（本批不修）

- `.shirt-skin` 现为 `width/height: auto` + 贴花原图像素（宽边 793–1200）叠在 118×124 的 `.shirt` 上，**会撑破**线框。批次 M 收口时修宽高（`width/height: 100%` 或等价约束），L 不改皮肤。

## 下一步（Hao / 设计侧）

1. 奖杯若有合格静帧（非 `.glb`），落 `cup/preview.webp`。NONO / motion 同理。
2. **不要**拷 PlayCanvas / Three 工程、wasm、`.glb`、`.json`、`.js`、`.mp4` 或整包 runtime。禁止视频自动播放。
3. 已落盘文件勿删、勿 AI 重画。

## 未改项

- 冻结句、`data-note` 讲稿、四动作词、20 页顺序：本批未动。
- P13 / P14 `.klein-bar` 内「可用 AI Coding …」两句：仍待 Hao 口径，本批未改。
