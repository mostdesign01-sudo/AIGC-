// 走进 HTML：电影静帧走楼 + 克莱因蓝克制 HUD
// 三维 / 真实产品只出现在 19F 工位屏上
import * as THREE from 'three';
import { CHAPTERS, chapterAt, floorAt, DIEGETIC, STILL_SIZE } from './config.js';
import { mountContent } from './content.js';
import { createHUD } from './hud.js';
import { createAudio } from './audio.js';
import { createLab } from './lab.js';
import { createSlides } from './slides.js';
import { loadDemos, placeDiegetic } from './products.js';
import { createAtmosphere } from './atmosphere.js';

/* 无扶梯。大厅 → 直梯 → 19F */
const STILLS = [
  { src: 'assets/stills/01-exterior.jpg',  from: 0.00, to: 0.14, pan: [50, 50] },
  { src: 'assets/stills/02-entrance.jpg',  from: 0.11, to: 0.24, pan: [50, 50] },
  { src: 'assets/stills/03-lobby.jpg',     from: 0.21, to: 0.34, pan: [48, 50] },
  { src: 'assets/stills/04b-elevator.jpg', from: 0.31, to: 0.44, pan: [50, 50], lock: true },
  { src: 'assets/stills/04-infohall.jpg',  from: 0.41, to: 0.54, pan: [50, 50] },
  { src: 'assets/stills/05-meeting.jpg',   from: 0.51, to: 0.64, pan: [48, 50], lock: true },
  { src: 'assets/stills/06-studio.jpg',    from: 0.61, to: 0.76, pan: [50, 50], lock: true },
  { src: 'assets/stills/07-cinema.jpg',    from: 0.73, to: 0.87, pan: [50, 50], lock: true },
  { src: 'assets/stills/08-roof.jpg',      from: 0.84, to: 1.01, pan: [50, 50] },
];

function overlap(p, a, b) {
  const fade = Math.min(0.035, (b - a) * 0.35);
  if (p < a || p > b) return 0;
  // 首尾两张不从 0 淡入/淡出，避免进入时整屏变黑
  if (a > 0 && p < a + fade) return (p - a) / fade;
  if (b < 1 && p > b - fade) return (b - p) / fade;
  return 1;
}
function smooth(x) { return x * x * (3 - 2 * x); }

const stillsRoot = document.getElementById('stills');
const layers = STILLS.map((s, i) => {
  const el = document.createElement('div');
  el.className = 'still' + (s.lock ? ' lock' : '');
  el.style.backgroundImage = `url(${s.src})`;
  if (i === 0) el.style.opacity = '1';
  stillsRoot.appendChild(el);
  return { ...s, el };
});

const loaderFill = document.getElementById('loader-fill');
const loaderSub = document.getElementById('loader-sub');
const enterBtn = document.getElementById('enter-btn');
const loader = document.getElementById('loader');
let loaded = 0;
const total = STILLS.length + 1;
let enterT = 0;
let entering = false;

function bump() {
  loaded++;
  const pct = Math.min(100, Math.round((loaded / total) * 100));
  loaderFill.style.width = `${pct}%`;
  if (loaderSub) loaderSub.textContent = `正在升起 T7 · ${pct}%`;
  if (loaded >= total) {
    enterBtn.disabled = false;
    enterBtn.textContent = '滚动进入';
    if (loaderSub) loaderSub.textContent = '门已打开 · 互联宝地 T7';
  }
}

STILLS.forEach((s) => {
  const img = new Image();
  img.onload = bump;
  img.onerror = bump;
  img.src = s.src;
});

const videoEl = document.getElementById('hf-video');
videoEl.muted = true;
videoEl.addEventListener('canplaythrough', bump, { once: true });
setTimeout(bump, 2500);

function beginWalk(skipRitual) {
  loader.classList.add('done');
  document.body.classList.add('started');
  window.scrollTo(0, 0);
  entering = !skipRitual;
  enterT = skipRitual ? 1 : 0;
  audio.doorChime();
}

enterBtn.addEventListener('click', () => beginWalk(false));

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const settings = { reducedMotion: prefersReduced, lowPerf: false, onQualityChange() {} };
const scroll = {
  target: 0, value: 0,
  get max() { return Math.max(1, document.body.scrollHeight - innerHeight); },
  goTo(p) { window.scrollTo({ top: p * this.max, behavior: 'auto' }); },
  nudge(dp) { window.scrollBy({ top: dp * this.max, behavior: 'auto' }); },
};
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('scroll', () => {
  scroll.target = Math.min(1, Math.max(0, window.scrollY / scroll.max));
}, { passive: true });

const audio = createAudio();
const hud = createHUD(scroll, audio, settings);
const content = mountContent(document.getElementById('content'));
const atmosphere = createAtmosphere(document.getElementById('atmosphere'));

/* ---------- 会议主屏（嵌进 19F 墙面） ---------- */
const deckSlot = document.getElementById('deck-slot');
const deckCanvas = document.getElementById('deck-canvas');
const fakeScreen = (c) => ({ userData: { ctx: c.getContext('2d'), canvas: c, texture: { needsUpdate: false } } });
const slides = createSlides(fakeScreen(deckCanvas));

/* ---------- 放映厅银幕 ---------- */
const cinemaSlot = document.getElementById('cinema-slot');
const cinemaPanel = document.getElementById('cinema-panel');
const btnPlay = document.getElementById('video-play');
const btnRestart = document.getElementById('video-restart');
const btnFs = document.getElementById('video-fs');
const cineFill = document.getElementById('cinema-progress-fill');
let userPaused = false;
btnPlay.addEventListener('click', () => {
  if (videoEl.paused) { videoEl.muted = false; videoEl.play(); userPaused = false; }
  else { videoEl.pause(); userPaused = true; }
});
btnRestart.addEventListener('click', () => { videoEl.currentTime = 0; videoEl.muted = false; videoEl.play(); userPaused = false; });
btnFs.addEventListener('click', () => {
  videoEl.muted = false;
  if (videoEl.requestFullscreen) videoEl.requestFullscreen();
  else if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
});
videoEl.addEventListener('play', () => { btnPlay.textContent = '暂停'; });
videoEl.addEventListener('pause', () => { btnPlay.textContent = '播放'; });

/* ---------- 19F 工位屏：真实 HTML 或 Three.js 回退 ---------- */
const productSlot = document.getElementById('product-slot');
const productFrame = document.getElementById('product-frame');
const labCanvas = document.getElementById('lab-gl');
const labPanel = document.getElementById('lab-panel');
const labCasesEl = document.getElementById('lab-cases');
const labVariantsEl = document.getElementById('lab-variants');
const labTip = document.getElementById('lab-tip');

const labScene = new THREE.Scene();
const labCam = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
labCam.position.set(0, 0.72, 2.55);
labCam.lookAt(0, 0.42, 0);
const labRenderer = new THREE.WebGLRenderer({ canvas: labCanvas, alpha: false, antialias: true });
labRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
labRenderer.setClearColor(0x00153d, 1);
labRenderer.outputColorSpace = THREE.SRGBColorSpace;
labRenderer.toneMapping = THREE.ACESFilmicToneMapping;
labRenderer.toneMappingExposure = 1.2;
labScene.add(new THREE.HemisphereLight(0xe8eef4, 0x0a1228, 0.95));
const key = new THREE.SpotLight(0xffffff, 36, 14, 0.5, 0.4, 1.3);
key.position.set(1.0, 2.8, 2.2);
labScene.add(key, key.target);
const fill = new THREE.PointLight(0xffe0b8, 10, 8, 1.6);
fill.position.set(-1.4, 1.5, 1.6);
labScene.add(fill);
const rim = new THREE.PointLight(0x7aa7ff, 8, 8, 1.4);
rim.position.set(0.2, 1.0, -1.6);
labScene.add(rim);
const board = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 3.4),
  new THREE.MeshBasicMaterial({ color: 0x002fa7 })
);
board.position.set(0, 0.55, -1.35);
labScene.add(board);
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(0.85, 40),
  new THREE.MeshBasicMaterial({ color: 0x000814, transparent: true, opacity: 0.35 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
labScene.add(ground);

const lab = createLab(labScene, [new THREE.Vector3(0, 0, 0)], labCam, labCanvas, { single: true });

let demos = { title: '19F · PRODUCT', demos: [] };
let activeDemo = 0;
let iframeOn = false;

function showThree() {
  iframeOn = false;
  productFrame.hidden = true;
  productFrame.src = 'about:blank';
  labCanvas.style.display = 'block';
}
function showIframe(src) {
  iframeOn = true;
  labCanvas.style.display = 'none';
  productFrame.hidden = false;
  productFrame.src = src;
}

function renderVariants(idx) {
  labVariantsEl.innerHTML = '';
  const c = lab.cases[idx];
  if (!c) return;
  labTip.textContent = c.tip;
  c.variants.forEach((v, vi) => {
    const b = document.createElement('button');
    b.className = 'variant-btn' + (vi === 0 ? ' active' : '');
    if (v.color !== undefined) {
      b.style.background = '#' + v.color.toString(16).padStart(6, '0');
      b.title = v.label;
    } else {
      b.style.background = '#e8e6e1';
      b.textContent = v.label;
      b.style.width = 'auto';
      b.style.borderRadius = '15px';
    }
    b.addEventListener('click', () => {
      lab.applyVariant(idx, vi);
      [...labVariantsEl.children].forEach((el, k) => el.classList.toggle('active', k === vi));
    });
    labVariantsEl.appendChild(b);
  });
}

function setDemo(i) {
  activeDemo = i;
  const d = demos.demos[i];
  [...labCasesEl.children].forEach((el, k) => el.classList.toggle('active', k === i));
  if (d && d.mode === 'iframe' && d.src) {
    showIframe(d.src);
    lab.setEnabled(false);
    labVariantsEl.innerHTML = '';
    labTip.textContent = '工位屏上的真实产品页 · 可在画面里直接操作';
  } else {
    showThree();
    const caseIdx = d ? d.case : i;
    lab.setActive(caseIdx);
    renderVariants(caseIdx);
  }
}

loadDemos().then((pack) => {
  demos = pack;
  labCasesEl.innerHTML = '';
  pack.demos.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'lab-case-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML = `${d.name}${d.en ? `<small>${d.en}</small>` : ''}`;
    btn.addEventListener('click', () => setDemo(i));
    labCasesEl.appendChild(btn);
  });
  setDemo(0);
});

lab.onSelect((i) => {
  const mapped = demos.demos.findIndex((d) => d.mode !== 'iframe' && d.case === i);
  if (mapped >= 0) {
    [...labCasesEl.children].forEach((el, k) => el.classList.toggle('active', k === mapped));
    renderVariants(i);
  }
});

function sizeLab() {
  const r = labCanvas.getBoundingClientRect();
  const w = Math.max(2, r.width), h = Math.max(2, r.height);
  labRenderer.setSize(w, h, false);
  labCam.aspect = w / h;
  labCam.updateProjectionMatrix();
}

function applyHash() {
  const h = location.hash;
  let target = null;
  const mp = h.match(/p=([\d.]+)/);
  const mc = h.match(/ch=(\d)/);
  if (mp) target = parseFloat(mp[1]);
  else if (mc) {
    const c = CHAPTERS[Math.max(0, Math.min(6, parseInt(mc[1], 10) - 1))];
    target = c.anchor;
  }
  if (target === null) return;
  target = Math.max(0, Math.min(1, target));
  scroll.goTo(target);
  scroll.target = target;
  scroll.value = target;
  if (h.includes('auto')) beginWalk(true);
}
window.addEventListener('hashchange', applyHash);

let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const rm = settings.reducedMotion;
  const k = rm ? 0.18 : 0.075;
  scroll.value += (scroll.target - scroll.value) * k;
  if (Math.abs(scroll.target - scroll.value) < 0.00004) scroll.value = scroll.target;
  const p = scroll.value;
  if (entering) {
    enterT = Math.min(1, enterT + dt / 1.8);
    if (enterT >= 1) entering = false;
  }

  layers.forEach((L, i) => {
    const raw = overlap(p, L.from, L.to);
    const a = smooth(raw);
    L.el.style.opacity = a;
    if (L.lock || rm) {
      L.el.style.transform = 'none';
      L.el.style.backgroundPosition = '50% 50%';
      return;
    }
    const local = (p - L.from) / (L.to - L.from);
    const walk = i === 0
      ? 1.18 - 0.10 * Math.min(1, Math.max(0, local)) - 0.05 * enterT
      : i === 1
        ? 1.09 - 0.06 * Math.min(1, Math.max(0, local))
        : 1.03 - 0.03 * Math.min(1, Math.max(0, local));
    const px = i === 0 ? 46 + 11 * local : L.pan[0] + (i % 2 === 0 ? -0.8 : 0.8) * (local - 0.5);
    const py = i === 0 ? 56 - 8 * local : L.pan[1] + 0.9 * (local - 0.5);
    L.el.style.transform = `scale(${walk})`;
    L.el.style.backgroundPosition = `${px}% ${py}%`;
  });

  atmosphere.update(p, dt, rm, enterT);
  content.update(p);
  hud.update(p, floorAt(p));

  const ch = chapterAt(p);

  const meetingOn = ch.key === 'meeting';
  deckSlot.classList.toggle('on', meetingOn);
  if (meetingOn) {
    placeDiegetic(deckSlot, DIEGETIC.meeting.rect, STILL_SIZE);
    slides.update((p - ch.from) / (ch.to - ch.from));
  }

  const labOn = ch.key === 'lab';
  productSlot.classList.toggle('on', labOn);
  labPanel.classList.toggle('hidden-panel', !labOn);
  if (labOn) {
    placeDiegetic(productSlot, DIEGETIC.lab.rect, STILL_SIZE);
    if (!iframeOn) {
      lab.setEnabled(true);
      sizeLab();
      lab.update(dt, rm);
      labRenderer.render(labScene, labCam);
    } else {
      lab.setEnabled(false);
    }
  } else {
    lab.setEnabled(false);
  }

  const cinemaOn = ch.key === 'cinema';
  cinemaSlot.classList.toggle('on', cinemaOn);
  cinemaPanel.classList.toggle('hidden-panel', !cinemaOn);
  if (cinemaOn) {
    placeDiegetic(cinemaSlot, DIEGETIC.cinema.rect, STILL_SIZE);
    if (videoEl.paused && !userPaused && document.body.classList.contains('started')) {
      videoEl.play().catch(() => {});
    }
  } else if (!videoEl.paused) {
    videoEl.pause();
  }
  if (videoEl.duration) cineFill.style.width = `${(videoEl.currentTime / videoEl.duration) * 100}%`;
}

window.addEventListener('resize', () => {
  sizeLab();
  const p = scroll.value;
  const ch = chapterAt(p);
  if (ch.key === 'meeting') placeDiegetic(deckSlot, DIEGETIC.meeting.rect, STILL_SIZE);
  if (ch.key === 'lab') placeDiegetic(productSlot, DIEGETIC.lab.rect, STILL_SIZE);
  if (ch.key === 'cinema') placeDiegetic(cinemaSlot, DIEGETIC.cinema.rect, STILL_SIZE);
});
applyHash();
sizeLab();
requestAnimationFrame(tick);
