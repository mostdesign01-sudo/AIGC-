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

/* ---------------- 红砖：颜色 + 粗糙度 + 法线（照片级密度） ---------------- */
export function makeBrickMaps() {
  const W = 1024, H = 1024;
  const col = canvas(W, H), rough = canvas(W, H), hgt = canvas(W, H);
  const cx = col.getContext('2d'), rx = rough.getContext('2d'), hx = hgt.getContext('2d');

  cx.fillStyle = '#6a5c52'; cx.fillRect(0, 0, W, H);       // 砖缝（浅灰浆，参照照片）
  rx.fillStyle = '#e6e6e6'; rx.fillRect(0, 0, W, H);       // 缝更糙
  hx.fillStyle = '#404040'; hx.fillRect(0, 0, W, H);       // 缝更低

  const rows = 40, gap = 2;
  const bh = H / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 0.5;
    const cols = 10;
    const bw = W / cols;
    for (let i = -1; i < cols + 1; i++) {
      const x = (i + offset) * bw;
      // 每块砖的色相/明度抖动，模拟真实烧制差异（参照照片的中红棕）
      const t = rnd();
      const rr = 128 + t * 46 + rnd() * 16;
      const gg = 62 + t * 26 + rnd() * 12;
      const bb = 48 + t * 18 + rnd() * 10;
      cx.fillStyle = `rgb(${rr | 0},${gg | 0},${bb | 0})`;
      cx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh - gap * 2);
      // 少量风化暗斑与泛白盐霜
      if (rnd() < 0.16) {
        cx.fillStyle = `rgba(40,26,22,${0.1 + rnd() * 0.14})`;
        cx.fillRect(x + gap + rnd() * bw * 0.4, r * bh + gap + rnd() * bh * 0.3, bw * 0.4, bh * 0.5);
      }
      if (rnd() < 0.06) {
        cx.fillStyle = `rgba(220,205,190,${0.05 + rnd() * 0.08})`;
        cx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh * 0.4);
      }
      const rv = 148 + rnd() * 66;
      rx.fillStyle = `rgb(${rv | 0},${rv | 0},${rv | 0})`;
      rx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh - gap * 2);
      // 高度图：砖面凸起，带轻微弧度
      const hv = 165 + rnd() * 50;
      hx.fillStyle = `rgb(${hv | 0},${hv | 0},${hv | 0})`;
      hx.fillRect(x + gap, r * bh + gap, bw - gap * 2, bh - gap * 2);
    }
  }
  // 细颗粒噪点
  const noise = cx.getImageData(0, 0, W, H);
  for (let i = 0; i < noise.data.length; i += 4) {
    const n = (rnd() - 0.5) * 12;
    noise.data[i] += n; noise.data[i + 1] += n; noise.data[i + 2] += n;
  }
  cx.putImageData(noise, 0, 0);

  // 由高度图推导法线贴图（Sobel）
  const hd = hx.getImageData(0, 0, W, H).data;
  const nrmC = canvas(W, H), nx = nrmC.getContext('2d');
  const out = nx.createImageData(W, H);
  const hAt = (x, y) => hd[(((y + H) % H) * W + ((x + W) % W)) * 4];
  const strength = 2.2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (hAt(x + 1, y) - hAt(x - 1, y)) / 255 * strength;
      const dy = (hAt(x, y + 1) - hAt(x, y - 1)) / 255 * strength;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const idx = (y * W + x) * 4;
      out.data[idx] = ((-dx * invLen) * 0.5 + 0.5) * 255;
      out.data[idx + 1] = ((dy * invLen) * 0.5 + 0.5) * 255;
      out.data[idx + 2] = (invLen * 0.5 + 0.5) * 255;
      out.data[idx + 3] = 255;
    }
  }
  nx.putImageData(out, 0, 0);
  return { map: tex(col), roughnessMap: tex(rough, 1, 1, false), normalMap: tex(nrmC, 1, 1, false) };
}

/* -------- 夜景玻璃幕墙：竖向长窗内的楼层灯光（自发光贴图） --------
   参照真实照片：每条幕墙 3 列窗格、层间深色横梁、暖/冷办公灯光混合 */
export function makeCurtainEmissive(floors, litRatio = 0.55, w = 256, hPerFloor = 96) {
  const H = floors * hPerFloor;
  const c = canvas(w, H);
  const x = c.getContext('2d');
  x.fillStyle = '#05080b'; x.fillRect(0, 0, w, H);
  const COLSN = 3;
  const colW = w / COLSN;
  const SP = 20;                       // 层间梁高度（像素）
  for (let f = 0; f < floors; f++) {
    const y0 = H - (f + 1) * hPerFloor;
    // 层间梁（深色金属，微弱反光）
    x.fillStyle = '#0a0d10';
    x.fillRect(0, y0, w, SP);
    x.fillStyle = 'rgba(120,140,150,0.10)';
    x.fillRect(0, y0 + SP - 3, w, 2);
    const lit = rnd() < litRatio;
    const coolOffice = rnd() < 0.3;    // 少量冷白办公室
    for (let cI = 0; cI < COLSN; cI++) {
      const px = cI * colW;
      // 同层各窗格独立明暗（真实办公室有人走有人留）
      const paneLit = lit && rnd() < 0.85;
      if (paneLit) {
        let cr, cg, cb;
        if (coolOffice) { cr = 210 + rnd() * 30; cg = 225 + rnd() * 25; cb = 235 + rnd() * 20; }
        else { const warm = rnd(); cr = 255; cg = 185 + warm * 45; cb = 115 + warm * 65; }
        const alpha = 0.45 + rnd() * 0.5;
        const grd = x.createLinearGradient(0, y0 + SP, 0, y0 + hPerFloor);
        grd.addColorStop(0, `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha * 0.9})`);
        grd.addColorStop(0.55, `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha})`);
        grd.addColorStop(1, `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha * 0.55})`);
        x.fillStyle = grd;
        x.fillRect(px + 5, y0 + SP + 2, colW - 10, hPerFloor - SP - 6);
        // 室内层次：天花灯带 + 隔断 / 家具剪影
        x.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
        x.fillRect(px + 5, y0 + SP + 3, colW - 10, 3);
        x.fillStyle = 'rgba(8,7,9,0.55)';
        const nDiv = (rnd() * 3 | 0);
        for (let d = 0; d < nDiv; d++) {
          x.fillRect(px + 8 + rnd() * (colW - 26), y0 + SP + 8, 4 + rnd() * 8, hPerFloor - SP - 14);
        }
        x.fillStyle = 'rgba(8,7,9,0.4)';
        x.fillRect(px + 5, y0 + hPerFloor - 22, colW - 10, 16);
      } else {
        // 未亮窗格：夜空冷反射，顶部略亮
        const refl = 0.10 + rnd() * 0.10;
        const grd = x.createLinearGradient(0, y0 + SP, 0, y0 + hPerFloor);
        grd.addColorStop(0, `rgba(70,95,115,${refl + 0.08})`);
        grd.addColorStop(1, `rgba(30,45,58,${refl * 0.5})`);
        x.fillStyle = grd;
        x.fillRect(px + 5, y0 + SP + 2, colW - 10, hPerFloor - SP - 6);
      }
      // 竖梃
      x.fillStyle = '#04060a';
      x.fillRect(px, y0, 5, hPerFloor);
    }
    x.fillStyle = '#04060a';
    x.fillRect(w - 5, y0, 5, hPerFloor);
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
