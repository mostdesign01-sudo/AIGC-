# 真实素材清单

**当前仓库状态（分支 `cursor/html-plus-scene-flow-983d`）**：除课程海报外，`assets/poizon/` 下各子目录仅有 `.gitkeep` 占位，**没有任何 zip 内产品图已落盘**。页面对应槽位一律显示「待补」或保留 SVG 线框交互，不会加载假图。

## 已落盘（真实文件在磁盘上）

| 路径 | 来源 | 用法 | 状态 |
|---|---|---|---|
| `cover-poster.webp` | Hao 确认的横版课程海报 | 门页底景；进课后 `.scene-root` 中景 | ✅ 已落盘 |

## 非产品图（结构占位，不是 zip 素材）

| 项 | 说明 |
|---|---|
| P13 T恤 SVG | 浏览器内绘制的**交互线框**，用于拖 / 换贴花演示；不是 POIZON 包里的产品渲染图 |
| `assets/poizon/**/.gitkeep` | 接入目录占位；**不等于素材已接入** |

## 待从 zip 落盘（当前全部缺失）

来源包：`POIZON_统一产品互动演示_20260821.zip`（本机授权；云环境无法读取）。  
落盘方法见 [`assets/poizon/README.md`](./assets/poizon/README.md)。代码用 `Image()` 探测路径，**文件存在才显示**，否则保持「待补」。

| 槽位 | 期望路径 | 页 | 当前页上表现 |
|---|---|---|---|
| Logo | `assets/poizon/logo/poizon.svg` 或 `poizon.png` | HUD 角标 | 不显示（探测失败） |
| 字标 | `assets/poizon/decal/mark.png` | P13 | 仅 SVG + 文字「11」 |
| 贴花 | `assets/poizon/decal/decal.png` | P13 | 仅 SVG + 文字「POIZON」 |
| 吊牌 | `assets/poizon/decal/hangtag.png` | P13 | 仅 SVG + 文字「吊牌」 |
| 物流箱 | `assets/poizon/box/texture.webp`（或 `.png`） | P13 物流箱 Tab | 「待补 · 物流箱纹理」 |
| 奖杯 | `assets/poizon/cup/preview.webp` | P13 奖杯 Tab | 「待补 · 奖杯静帧」 |
| 防伪 | `assets/poizon/anti/preview.webp` | P13 防伪 Tab | 「待补 · 防伪静帧」 |
| 动态纹理单帧 | `assets/poizon/motion/frame.webp` | P15 可选底图 | 不显示（可选） |
| NONO 01–09 | `assets/poizon/nono/01.webp` … `09.webp` | P14 九格背景 | 仅编号格，无鞋图 |

## 下一步（Hao / 设计侧）

1. 在本机解压 `POIZON_统一产品互动演示_20260821.zip`，按上表路径导出**静态**截图 / 纹理（宽边 ≤ 1600，webp q≈80 优先）。
2. 拷入 `demos/html-plus-course/assets/poizon/`，提交到本分支或后续 PR。
3. 刷新 `index.html`（`file://`）验证：P13 三 Tab 出图、贴花按钮换真实 decal、P14 格子上出现静帧（若有）。
4. **不要**拷 PlayCanvas / Three 工程、wasm、`.glb` 或整包 runtime。

## 未改项

- 冻结句、`data-note` 讲稿、四动作词、20 页顺序：本批未动。
- P13 / P14 `.klein-bar` 内「可用 AI Coding …」两句：仍待 Hao 口径，本批未改。
