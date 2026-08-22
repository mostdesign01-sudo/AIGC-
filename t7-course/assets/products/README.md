# 把真实产品演示嵌进 19F 工位屏

云端拿不到你本机的 `/Users/admin/Downloads/POIZON_统一产品互动演示_20260821.zip`。
请把压缩包解压后的 HTML（或每个案例的 `index.html`）放进这个目录，然后改 `manifest.json`：

```json
{
  "title": "19F · PRODUCT",
  "demos": [
    { "id": "case-a", "name": "案例名", "en": "CASE A", "src": "demos/case-a/index.html" }
  ]
}
```

有 `src` 的条目会以 iframe 铺满工位显示器；没有 `src` 时继续用内置 Three.js 模型。
刷新页面即可，不必构建。
