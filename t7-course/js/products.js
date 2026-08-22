// 19F 工位上的产品演示
// 优先读 assets/products/manifest.json（把 POIZON 互动包解压进去即可）
// 没有真实包时，回退到 lab.js 里的四个程序化案例

const FALLBACK = {
  title: '19F · PRODUCT',
  demos: [
    { id: 'tee',    name: '11 周年 T 恤', en: 'ANNIVERSARY TEE', mode: 'three', case: 0 },
    { id: 'box',    name: '物流箱',       en: 'LOGISTICS BOX',   mode: 'three', case: 1 },
    { id: 'trophy', name: '奖杯 AR',      en: 'TROPHY AR',       mode: 'three', case: 2 },
    { id: 'nono',   name: 'NONO 盲盒',    en: 'NONO BLINDBOX',   mode: 'three', case: 3 },
  ],
};

export async function loadDemos() {
  try {
    const r = await fetch('assets/products/manifest.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('no manifest');
    const m = await r.json();
    if (m && Array.isArray(m.demos) && m.demos.length) {
      return {
        title: m.title || FALLBACK.title,
        demos: m.demos.map((d, i) => ({
          id: d.id || `demo-${i}`,
          name: d.name || d.title || `案例 ${i + 1}`,
          en: d.en || d.subtitle || '',
          mode: d.src ? 'iframe' : (d.mode || 'three'),
          src: d.src || '',
          case: Number.isInteger(d.case) ? d.case : i,
        })),
      };
    }
  } catch {
    /* 使用内置回退 */
  }
  return FALLBACK;
}

export function placeDiegetic(el, rect, stillSize) {
  const viewW = innerWidth;
  const viewH = innerHeight;
  const ir = stillSize.w / stillSize.h;
  const vr = viewW / viewH;
  let x, y, w, h;
  if (vr > ir) {
    w = viewW;
    h = viewW / ir;
    x = 0;
    y = (viewH - h) / 2;
  } else {
    h = viewH;
    w = viewH * ir;
    x = (viewW - w) / 2;
    y = 0;
  }
  el.style.left = `${x + rect[0] * w}px`;
  el.style.top = `${y + rect[1] * h}px`;
  el.style.width = `${(rect[2] - rect[0]) * w}px`;
  el.style.height = `${(rect[3] - rect[1]) * h}px`;
}
