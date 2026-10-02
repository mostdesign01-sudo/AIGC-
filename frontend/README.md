# frontend

Vue 3 + Vite + vue-router 前端。数据来自 `src/data/feed.json`（由仓库根目录 `scripts/build_feed.py` 生成），可选通过 `VITE_API_BASE` 连接 FastAPI 后端。

完整说明见仓库根目录 [README](../README.md)。

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # vue-tsc + vite build → dist/
```
