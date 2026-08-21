// 程序化 PBR 贴图：红砖 / 窗格 / 幕墙夜景 / 地面 / 屏幕内容底图
import * as THREE from 'three';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function tex(c, repeatX = 1, repeatY = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

/* ---------------- 红砖：颜色 + 粗糙度 ---------------- */
export function makeBrickMaps() {
  const W = 512, H = 512;
  const col = canvas(W, H), rough = canvas(W, H);
  const cx = col.getContext('2d'), rx = rough.getContext('2d');

  cx.fillStyle = '#4a413c'; cx.fillRect(0, 0, W, H);       // 砖缝
  rx.fillStyle = '#e0e0e0'; rx.fillRect(0, 0, W, H);       // 缝更糙

  const rows = 26, gap = 3;
  const bh = H / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 0.5;
    const cols = 8;
    const bw = W / cols;
    for (let i = -1; i < cols + 1; i++) {
      const x = (i + offset) * bw;
      // 每块砖的色相/明度抖动，模拟真实烧制差异
      const t = rnd();
      const rr = 118 + t * 42 + rnd() * 14;
      const gg = 58 + t * 22 + rnd() * 10;
      const bb = 46 + t * 16 + rnd() * 8;
      cx.fillStyle = `rgb(${rr | 0},${gg | 0},${bb | 0})`;
      cx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh - gap * 2);
      // 少量风化暗斑
      if (rnd() < 0.18) {
        cx.fillStyle = `rgba(40,26,22,${0.12 + rnd() * 0.15})`;
        cx.fillRect(x + gap + rnd() * bw * 0.4, r * bh + gap + rnd() * bh * 0.3, bw * 0.4, bh * 0.5);
      }
      const rv = 150 + rnd() * 70;
      rx.fillStyle = `rgb(${rv | 0},${rv | 0},${rv | 0})`;
      rx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh - gap * 2);
    }
  }
  // 细颗粒噪点
  const noise = cx.getImageData(0, 0, W, H);
  for (let i = 0; i < noise.data.length; i += 4) {
    const n = (rnd() - 0.5) * 14;
    noise.data[i] += n; noise.data[i + 1] += n; noise.data[i + 2] += n;
  }
  cx.putImageData(noise, 0, 0);
  return { map: tex(col), roughnessMap: tex(rough, 1, 1, false) };
}

/* -------- 夜景玻璃幕墙：竖向长窗内的楼层灯光（自发光贴图） -------- */
export function makeCurtainEmissive(floors, litRatio = 0.55, w = 128, hPerFloor = 64) {
  const H = floors * hPerFloor;
  const c = canvas(w, H);
  const x = c.getContext('2d');
  x.fillStyle = '#060a0d'; x.fillRect(0, 0, w, H);
  for (let f = 0; f < floors; f++) {
    const y0 = H - (f + 1) * hPerFloor;
    // 层间梁（暗）
    x.fillStyle = '#04060a';
    x.fillRect(0, y0, w, 10);
    const lit = rnd() < litRatio;
    if (lit) {
      const warm = rnd();
      const cr = 255, cg = 190 + warm * 40, cb = 120 + warm * 60;
      const alpha = 0.5 + rnd() * 0.5;
      const grd = x.createLinearGradient(0, y0 + 10, 0, y0 + hPerFloor);
      grd.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.35})`);
      grd.addColorStop(0.6, `rgba(${cr},${cg},${cb},${alpha})`);
      grd.addColorStop(1, `rgba(${cr},${cg},${cb},${alpha * 0.7})`);
      x.fillStyle = grd;
      x.fillRect(6, y0 + 12, w - 12, hPerFloor - 16);
      // 室内层次：天花灯带 + 隔断影
      x.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
      x.fillRect(6, y0 + 13, w - 12, 3);
      x.fillStyle = 'rgba(10,8,10,0.5)';
      const nDiv = 1 + (rnd() * 3 | 0);
      for (let d = 0; d < nDiv; d++) x.fillRect(8 + rnd() * (w - 20), y0 + 14, 3 + rnd() * 5, hPerFloor - 18);
    } else {
      // 未亮楼层：冷灰反射
      x.fillStyle = `rgba(40,58,68,${0.12 + rnd() * 0.12})`;
      x.fillRect(6, y0 + 12, w - 12, hPerFloor - 16);
    }
    // 竖梃
    x.fillStyle = '#04060a';
    x.fillRect(0, y0, 4, hPerFloor); x.fillRect(w - 4, y0, 4, hPerFloor);
    x.fillRect(w / 2 - 2, y0, 4, hPerFloor);
  }
  return tex(c);
}

/* ---------------- 广场铺装 ---------------- */
export function makePlazaMap() {
  const S = 512;
  const c = canvas(S, S), x = c.getContext('2d');
  x.fillStyle = '#141517'; x.fillRect(0, 0, S, S);
  const n = 8, g = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 18 + rnd() * 8;
    x.fillStyle = `rgb(${v | 0},${(v + 1) | 0},${(v + 2) | 0})`;
    x.fillRect(i * g + 1.5, j * g + 1.5, g - 3, g - 3);
  }
  return tex(c, 40, 40);
}

/* ---------------- 室内地板（深灰石材） ---------------- */
export function makeInteriorFloor() {
  const S = 256;
  const c = canvas(S, S), x = c.getContext('2d');
  x.fillStyle = '#1a1b1d'; x.fillRect(0, 0, S, S);
  const n = 4, g = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 26 + rnd() * 8;
    x.fillStyle = `rgb(${v | 0},${v | 0},${(v + 2) | 0})`;
    x.fillRect(i * g + 1, j * g + 1, g - 2, g - 2);
  }
  return tex(c, 6, 6);
}

/* ---------------- 通用屏幕画布（供各空间内容屏使用） ---------------- */
export const SCREEN_BG = '#0c0e10';
export const SCREEN_FG = '#e8e6e1';
export const SCREEN_DIM = '#8d9296';
export const SCREEN_AURORA = '#01c2c3';

export function screenCanvas(w = 1024, h = 576) {
  const c = canvas(w, h);
  const x = c.getContext('2d');
  x.fillStyle = SCREEN_BG; x.fillRect(0, 0, w, h);
  return { c, x };
}

export function screenTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// 屏幕排版助手
export function drawKicker(x, text, px, py, size = 20) {
  x.fillStyle = SCREEN_AURORA;
  x.fillRect(px, py - size * 0.7, size * 1.6, 3);
  x.font = `${size}px "SF Mono", monospace`;
  x.fillText(text, px + size * 2.2, py);
}
export function drawTitle(x, text, px, py, size = 54, color = SCREEN_FG) {
  x.fillStyle = color;
  x.font = `700 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  x.fillText(text, px, py);
}
export function drawBody(x, lines, px, py, size = 24, lh = 1.9, color = SCREEN_DIM) {
  x.fillStyle = color;
  x.font = `${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  lines.forEach((l, i) => x.fillText(l, px, py + i * size * lh));
}
export function drawBars(x, px, py, w, h, values, color = SCREEN_AURORA) {
  const n = values.length, bw = w / n * 0.55, gap = w / n;
  x.strokeStyle = 'rgba(232,230,225,0.15)'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(px, py + h); x.lineTo(px + w, py + h); x.stroke();
  values.forEach((v, i) => {
    x.fillStyle = i === n - 1 ? color : 'rgba(232,230,225,0.28)';
    const bh = h * v;
    x.fillRect(px + i * gap + (gap - bw) / 2, py + h - bh, bw, bh);
  });
}
