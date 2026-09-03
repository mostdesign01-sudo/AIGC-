# HTML+ DesignLang

门页与课堂共用的视觉合同。改皮肤先改本文件，再改 `index.html` 里对应 token。不改冻结句。

## Overview

黑场电影感课堂。门页 = Hao 指定海报整图 + 短距分层视差。课堂里卡片轻抬、舞台 3:2 气质框。只借分层、hover、比例；不借 plaza / locale / 走楼。

## Colors

### Brand & Accent

| Token | Hex | 用法 |
|---|---|---|
| 黑场 `--bg` | `#07090d` | 页底、门页垫底 |
| Klein `--klein` | `#002FA7` | 按钮、选中卡、强调条、章封面 |
| 极光青 `--aurora` | `#01c2c3` | 仅点缀：2px tick / 下划线 / 进度条 |

极光青不进正文、不进大标题。Klein 不当大面积字色；暗底上的 Klein 字用 `--klein-on-dark`。

### Surface

| Token | Hex |
|---|---|
| `--stage` | `#0c0f14` |
| `--surface-1` | `#12161d` |
| `--surface-2` | `#181d26` |
| `--surface-3` | `#1f2530` |

### Text

| Token | Hex / value |
|---|---|
| `--ink` / `--text` | `#f5f7fa` |
| `--soft` | `#c4c8d0` |
| `--dim` | `#8b909a` |
| `--line` | `rgba(255, 255, 255, 0.12)` |
| `--chrome` | `rgba(255, 255, 255, 0.38)` |

## Typography

系统栈：`--sans`（SF Pro / PingFang / Noto Sans SC）。不引入字体 CDN、不写 `@font-face`。

标题可加 `--title-glow`。冻结句逐字不动，见 `OPTIMIZATION-5.1.md` §5.3。

## Layout

间距：4 / 8 / 12 / 16 / 24 / 32。圆角：4 / 6 / 8 / 12 / 16。

舞台比例气质：3:2 框（门页中层 `.door-frame-32`，课堂舞台沿用现有比例）。

## 门页规则

1. 封面必须是 `cover-poster.webp`（Hao 海报整图），`#loader` / `.door` 层 `object-fit: cover` 铺满。禁止纯 CSS 仿海报当主视觉，禁止假建筑图。
2. 进入课堂前可轻微纵向滚动，轨道约 1.5 屏。不要长卷轴。
3. 至少三层不同速率：
   - 底层：海报图（最慢，微缩放）
   - 中层：窗口线框 / 斜杠 / 3:2 框（中速）
   - 上层：标题区上浮；CTA「进入课堂」固定底部（最快或钉底）
4. 优先 `animation-timeline: scroll()`。`prefers-reduced-motion` 降级为静态封面。不支持 scroll-driven 时用轻量 `scroll` 监听 `transform`。
5. 点「进入课堂」、滚到阈值、或 Enter / 空格，一层进入 P01。左栏 / HUD / dock 进课后才出现。

## Motion

- 卡片 / 门 / 进入按钮 hover：`translateY(-3px)`。
- 门页分层只跟短距滚动走，不跟指针、不加迈步帧。

## Do

- 黑场 + Klein 按钮 + 极光青点缀。
- 海报整图做门页；分层只做短距。
- `file://` 单文件可开：相对路径资源，无外链。

## Don't

- 不改冻结句 / `data-note` / 案例互动主逻辑。
- 不借 plaza、locale、走楼。
- 不引入构建工具、字体 CDN、三维引擎。
- 不做瀑布流、不把整站做成长页作品集。
