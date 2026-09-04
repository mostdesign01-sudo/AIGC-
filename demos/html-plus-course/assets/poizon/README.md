# POIZON 真实素材接入

本目录只收用户授权的 `POIZON_统一产品互动演示_20260821.zip` 里的**静态截图 / 纹理 / logo**。  
不引入 PlayCanvas / Three runtime，不编造产品图。已落盘文件勿删、勿 AI 重画。

文件存在即自动显示；不存在则页上写「待补」，不回退到假图。

## 静帧规格（批次 L）

| 项 | 规格 |
|---|---|
| 格式 | webp 优先（logo 可用 SVG / 透明 PNG；贴花可用 PNG） |
| 宽边 | ≤ 1600 px |
| 质量 | webp q≈80 |
| 每案例张数 | ≤ 6 张（案例一：字标 / 贴花 / 吊牌 / 箱 / 杯 / 防伪；案例二：九格可只落有的款；案例三：单帧） |
| 本目录总量 | ≤ 3 MB（当前已落盘约 1.13MB） |

**禁止**放进本目录：

- `.glb` / 任何网格或场景包
- wasm、播放器脚本、`.js`、`.json` 场景描述
- `build/`、`__settings__`、Three / PlayCanvas runtime
- `.mp4` / 视频，以及任何视频自动播放
- 未授权第三方精修图、AI 生成的「看起来像」产品图、海报裁块冒充产品

## 落盘状态

| 要找的真实物 | 建议落盘路径（相对本课目录） | 用在 | 场景用途 | 状态 |
|---|---|---|---|---|
| POIZON logo | `assets/poizon/logo/poizon.png` | 课堂 HUD 角标 | — | ✅ |
| 得物方标 | `assets/poizon/logo/dewu.png` | 存档；HUD 现用 `poizon.png` | — | ✅ |
| T恤字标 / 贴花 / 吊牌 | `assets/poizon/decal/mark.png` `decal.png` `hangtag.png` | P13 `.shirt-skin` | pane | ✅ |
| 物流箱纹理 | `assets/poizon/box/texture.webp` | ch4 `.scene-mid` `soft-light .18`；P13「物流箱」pane | 中景纹理 / pane | ✅ |
| 防伪静帧（证书正面） | `assets/poizon/anti/preview.webp` | P13「防伪」pane，`object-fit: cover` + `.win` | pane | ✅ |
| 奖杯静帧 | `assets/poizon/cup/preview.webp` | P13「奖杯」pane | pane | 待补（包内只有 `.glb`，未拷） |
| 动态纹理单帧 | `assets/poizon/motion/frame.webp` | P15 `.fake-page` 底 | pane | 待补（包内无合格静帧） |
| NONO 九款静帧 | `assets/poizon/nono/01.webp` … `09.webp` | P14 九格底 + 对比卡两侧缩略 | 缩略 | 待补（包内无合格静帧） |

进场景的中景纹理统一 `filter: saturate(.85) brightness(.9)`；pane 内静帧保持原色。

`.shirt-skin` 贴花原图宽边 793–1200，叠在 118×124 的 `.shirt` 上会撑破——待批次 M 修宽高，本目录不改图。
