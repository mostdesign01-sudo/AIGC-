# POIZON 真实素材接入（待落盘）

本目录只收用户授权的 `POIZON_统一产品互动演示_20260821.zip` 里的**静态截图 / 纹理 / logo**。  
不引入 PlayCanvas / Three runtime，不编造产品图。

云环境读不到本机 zip。把包解开后，按下面文件名拷进对应文件夹。文件存在即自动显示；不存在则页上写「待补」，不回退到假图。

## 从 zip 提取什么

在包内搜索（名称因打包工具可能大小写不同）：

| 要找的真实物 | 建议落盘路径（相对本课目录） | 用在 |
|---|---|---|
| POIZON / 得物 logo（SVG 或透明 PNG） | `assets/poizon/logo/poizon.svg` 或 `poizon.png` | 课堂 HUD 角标、P13 贴花预览 |
| T恤 / 字标 / 贴花 / 吊牌 decal | `assets/poizon/decal/mark.png` `decal.png` `hangtag.png` | P13 字标 / 贴花 / 吊牌 |
| 物流箱纹理或产品静帧 | `assets/poizon/box/texture.webp`（或 `.png`） | P13「物流箱」页 |
| 奖杯静帧 | `assets/poizon/cup/preview.webp` | P13「奖杯」页 |
| 防伪静帧 | `assets/poizon/anti/preview.webp` | P13「防伪」页 |
| 动态纹理序列的**单帧**或短循环图 | `assets/poizon/motion/frame.webp` | P15 时间轴底，可选 |
| NONO 九款静帧（若包内有） | `assets/poizon/nono/01.webp` … `09.webp` | P14 九格 |

宽边建议 ≤ 1600，webp q≈80，保持 `file://` 可开。不要把整个工程、`.glb`、场景 JSON、播放器脚本拷进来。

## 不要放

- PlayCanvas / Three 的 `build/`、`__settings__`、wasm
- 未授权的第三方鞋款精修图
- AI 生成的「看起来像」物流箱 / 奖杯

确认包内没有对应静帧时，保持「待补」，不要用海报裁一块冒充产品。
