# 真实素材清单

**当前仓库状态（分支 `cursor/html-plus-batch-l-6af8`）**：除课程海报外，`assets/poizon/` 下各子目录仅有 `.gitkeep` 占位，**没有任何 zip 内产品图已落盘**。页面对应槽位一律显示「待补」或保留 SVG 线框交互，不会加载假图。分层手图 / Approach 路径未到，近景用母本同图裁切。

批次 L：**槽位就绪，静帧待补。** 探测结构、中景纹理分支、`.win` pane、贴花名、对比卡缩略位已接好；放入文件即出图。

## 已落盘（真实文件在磁盘上）

| 路径 | 来源 | 用法 | 场景用途 | 状态 |
|---|---|---|---|---|
| `cover-poster.webp` | Hao 母本「双手相触」横版（1200×675） | 门页底景；进课后 `.scene-root` 中景 | — | ✅ 已落盘 |
| `poster/cover-poster-master.png` | 同一母本 PNG 原图 | 存档；webp 源 | — | ✅ 已落盘 |
| `poster/hand-left.png` | Hao 分层（可选） | `.cut` 近景左手 | — | 未落盘 → 同图裁切 |
| `poster/hand-right.png` | Hao 分层（可选） | `.cut` 近景右手 | — | 未落盘 → 同图裁切 |
| `poster/approach.svg` | Hao 路径（可选） | Approach 手写 | — | 未落盘 → 同图裁切；不用 web font |

构图：标题在上半、窗口在下约 1/3、双手从两侧指向窗口。旧捏窗版已作废。`.door-win` 热区终值见 `DESIGN.md`。

## 非产品图（结构占位，不是 zip 素材）

| 项 | 说明 |
|---|---|
| P13 T恤 SVG | 浏览器内绘制的**交互线框**，用于拖 / 换贴花演示；不是 POIZON 包里的产品渲染图 |
| `assets/poizon/**/.gitkeep` | 接入目录占位；**不等于素材已接入** |

## 待从 zip 落盘（当前全部缺失）

来源包：`POIZON_统一产品互动演示_20260821.zip`（本机授权；云环境无法读取）。  
落盘方法与静帧规格见 [`assets/poizon/README.md`](./assets/poizon/README.md)。代码用 `Image()` 探测路径，**文件存在才显示**，否则保持「待补」。

| 槽位 | 期望路径 | 页 | 场景用途 | 当前页上表现 |
|---|---|---|---|---|
| Logo | `assets/poizon/logo/poizon.svg` 或 `poizon.png` | HUD 角标 | — | 不显示（探测失败） |
| 字标 | `assets/poizon/decal/mark.png` | P13 | pane | 仅 SVG + 文字「11」；`.win-bar` 左侧「字标」 |
| 贴花 | `assets/poizon/decal/decal.png` | P13 | pane | 仅 SVG + 文字「POIZON」；切换后 `.win-bar`「贴花」 |
| 吊牌 | `assets/poizon/decal/hangtag.png` | P13 | pane | 仅 SVG + 文字「吊牌」；切换后 `.win-bar`「吊牌」 |
| 物流箱 | `assets/poizon/box/texture.webp`（或 `.png`） | P13 / ch4 中景 | 中景纹理 / pane | pane「待补 · 物流箱纹理」；中景仍空 |
| 奖杯 | `assets/poizon/cup/preview.webp` | P13 | pane | 「待补 · 奖杯静帧」 |
| 防伪 | `assets/poizon/anti/preview.webp` | P13 | pane | 「待补 · 防伪静帧」 |
| 动态纹理单帧 | `assets/poizon/motion/frame.webp` | P15 | pane | 不显示（可选） |
| NONO 01–09 | `assets/poizon/nono/01.webp` … `09.webp` | P14 | 缩略 | 仅编号格，无鞋图；对比卡两侧缩略位隐藏 |

场景用途取值：`pane`（设备框内静帧 / 贴花）、`中景纹理`（ch4 `.scene-mid`）、`缩略`（九格底 + 对比卡）。

## 下一步（Hao / 设计侧）

1. 在本机解压 `POIZON_统一产品互动演示_20260821.zip`，按上表路径导出**静态**截图 / 纹理（宽边 ≤ 1600，webp q≈80，每案例 ≤ 6 张，本目录总量 ≤ 3MB）。
2. 拷入 `demos/html-plus-course/assets/poizon/`，提交到本分支或后续 PR。
3. 刷新 `index.html`（`file://`）验证：P13 三 Tab 出图且不再「待补」、贴花按钮换真实 decal 且 `.win-bar` 出贴花名、ch4 中景出现箱纹理、P14 格子与对比卡出现静帧（若有）。
4. **不要**拷 PlayCanvas / Three 工程、wasm、`.glb`、`.json`、`.js`、`.mp4` 或整包 runtime。禁止视频自动播放。

## 未改项

- 冻结句、`data-note` 讲稿、四动作词、20 页顺序：本批未动。
- P13 / P14 `.klein-bar` 内「可用 AI Coding …」两句：仍待 Hao 口径，本批未改。
