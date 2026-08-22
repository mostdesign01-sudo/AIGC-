// 走进 HTML：电影级静帧叙事 + 滚动转场
// 三维只出现在第 5 章互动实验室
import * as THREE from 'three';
import { CHAPTERS, chapterAt } from './config.js';
import { mountContent } from './content.js';
import { createHUD } from './hud.js';
import { createAudio } from './audio.js';
import { createLab } from './lab.js';
import { createSlides } from './slides.js';

/* ---------- 十个统一调性的核心镜头 ---------- */
const STILLS = [
  { src: 'assets/stills/01-exterior.jpg',   from: 0.00, to: 0.13, pan: [50, 50] },
  { src: 'assets/stills/02-entrance.jpg',   from: 0.10, to: 0.22, pan: [50, 50] },
  { src: 'assets/stills/03-lobby.jpg',      from: 0.19, to: 0.31, pan: [48, 50] },
  { src: 'assets/stills/03b-escalator.jpg', from: 0.28, to: 0.37, pan: [50, 50] },
  { src: 'assets/stills/04-infohall.jpg',   from: 0.34, to: 0.47, pan: [50, 50] },
  { src: 'assets/stills/04b-elevator.jpg',  from: 0.44, to: 0.53, pan: [50, 50] },
  { src: 'assets/stills/05-meeting.jpg',    from: 0.50, to: 0.62, pan: [48, 50] },
  { src: 'assets/stills/06-lab.jpg',        from: 0.59, to: 0.75, pan: [52, 50] },
  { src: 'assets/stills/07-cinema.jpg',     from: 0.72, to: 0.87, pan: [50, 50] },
  { src: 'assets/stills/08-roof.jpg',       from: 0.84, to: 1.01, pan: [50, 50] },
];

function overlap(p, a, b) {
  const fade = Math.min(0.035, (b - a) * 0.35);
  if (p < a || p > b) return 0;
  if (p < a + fade) return (p - a) / fade;
  if (p > b - fade) return (b - p) / fade;
  return 1;
}
function smooth(x) { return x * x * (3 - 2 * x); }

/* ---------- 预载静帧 ---------- */
const stillsRoot = document.getElementById('stills');
const layers = STILLS.map((s) => {
  const el = document.createElement('div');
  el.className = 'still';
  el.style.backgroundImage = `url(${s.src})`;
  stillsRoot.appendChild(el);
  return { ...s, el };
});

const loaderFill = document.getElementById('loader-fill');
const enterBtn = document.getElementById('enter-btn');
const loader = document.getElementById('loader');
let loaded = 0;
const total = STILLS.length + 1;

function bump() {
  loaded++;
  loaderFill.style.width = `${Math.min(100, (loaded / total) * 100)}%`;
  if (loaded >= total) {
    enterBtn.disabled = false;
    enterBtn.textContent = '进入 T7';
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

enterBtn.addEventListener('click', () => {
  loader.classList.add('done');
  document.body.classList.add('started');
  window.scrollTo(0, 0);
});

/* ---------- 滚动 ---------- */
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

/* ---------- 会议层 PPT（叠在静帧上的真实画布） ---------- */
const deckCanvas = document.getElementById('deck-canvas');
const agendaCanvas = document.createElement('canvas');
agendaCanvas.width = 560; agendaCanvas.height = 528;
const fakeScreen = (c) => ({ userData: { ctx: c.getContext('2d'), canvas: c, texture: { needsUpdate: false } } });
const slides = createSlides(fakeScreen(deckCanvas), fakeScreen(agendaCanvas));
const deckPanel = document.getElementById('deck-panel');

/* ---------- 放映厅 ---------- */
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

/* ---------- 实验室三维（仅此章使用 Three.js） ---------- */
const labCanvas = document.getElementById('lab-gl');
const labScene = new THREE.Scene();
const labCam = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
labCam.position.set(0, 1.6, 5.2);
labCam.lookAt(0, 0.9, 0);
const labRenderer = new THREE.WebGLRenderer({ canvas: labCanvas, alpha: true, antialias: true });
labRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
labRenderer.outputColorSpace = THREE.SRGBColorSpace;
labRenderer.toneMapping = THREE.ACESFilmicToneMapping;
labRenderer.toneMappingExposure = 1.1;
labScene.add(new THREE.HemisphereLight(0xc8d4dc, 0x1a1410, 0.7));
const key = new THREE.SpotLight(0xffffff, 40, 16, 0.5, 0.5, 1.6);
key.position.set(1.2, 4.2, 3.2);
labScene.add(key, key.target);
const fill = new THREE.PointLight(0xffe0b8, 12, 10, 1.8);
fill.position.set(-2, 2.2, 2);
labScene.add(fill);
const pedestals = [
  new THREE.Vector3(-1.65, 0, 0.15),
  new THREE.Vector3(-0.5, 0, -0.25),
  new THREE.Vector3(0.65, 0, -0.25),
  new THREE.Vector3(1.8, 0, 0.15),
];
const ringMat = new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: 0x01c2c3, emissiveIntensity: 1.6 });
const pedMat = new THREE.MeshStandardMaterial({ color: 0x585d63, metalness: 0.75, roughness: 0.35 });
pedestals.forEach((p) => {
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.16, 28), pedMat);
  ped.position.copy(p);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.018, 8, 36), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(p.x, p.y + 0.09, p.z);
  labScene.add(ped, ring);
});
const lab = createLab(labScene, pedestals, labCam, labCanvas);

const labPanel = document.getElementById('lab-panel');
const labCasesEl = document.getElementById('lab-cases');
const labVariantsEl = document.getElementById('lab-variants');
const labTip = document.getElementById('lab-tip');
lab.cases.forEach((c, i) => {
  const btn = document.createElement('button');
  btn.className = 'lab-case-btn' + (i === 0 ? ' active' : '');
  btn.innerHTML = `${c.name}<small>${c.en}</small>`;
  btn.addEventListener('click', () => lab.setActive(i));
  labCasesEl.appendChild(btn);
});
function renderVariants(idx) {
  labVariantsEl.innerHTML = '';
  const c = lab.cases[idx];
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
      b.style.width = 'auto'; b.style.borderRadius = '15px';
    }
    b.addEventListener('click', () => {
      lab.applyVariant(idx, vi);
      [...labVariantsEl.children].forEach((el, k) => el.classList.toggle('active', k === vi));
    });
    labVariantsEl.appendChild(b);
  });
}
lab.onSelect((i) => {
  [...labCasesEl.children].forEach((el, k) => el.classList.toggle('active', k === i));
  renderVariants(i);
});
renderVariants(0);

function sizeLab() {
  const r = labCanvas.getBoundingClientRect();
  const w = Math.max(2, r.width), h = Math.max(2, r.height);
  labRenderer.setSize(w, h, false);
  labCam.aspect = w / h;
  labCam.updateProjectionMatrix();
}

/* ---------- 深链 ---------- */
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
  if (h.includes('auto')) {
    loader.classList.add('done');
    document.body.classList.add('started');
  }
}
window.addEventListener('hashchange', applyHash);

/* ---------- 逐帧 ---------- */
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

  layers.forEach((L, i) => {
    const raw = overlap(p, L.from, L.to);
    const a = smooth(raw);
    L.el.style.opacity = a;
    const local = (p - L.from) / (L.to - L.from);
    const ken = rm ? 1 : 1.03 - 0.03 * Math.min(1, Math.max(0, local));
    const px = L.pan[0] + (i % 2 === 0 ? -0.8 : 0.8) * (local - 0.5);
    const py = L.pan[1] + 0.9 * (local - 0.5);
    L.el.style.transform = `scale(${ken})`;
    L.el.style.backgroundPosition = `${px}% ${py}%`;
  });

  content.update(p);
  hud.update(p, null);

  const ch = chapterAt(p);
  const meetingOn = ch.key === 'meeting';
  deckPanel.classList.toggle('hidden-panel', !meetingOn);
  if (meetingOn) slides.update((p - ch.from) / (ch.to - ch.from));

  const labOn = ch.key === 'lab';
  labCanvas.classList.toggle('on', labOn);
  labPanel.classList.toggle('hidden-panel', !labOn);
  lab.setEnabled(labOn);
  if (labOn) {
    sizeLab();
    lab.update(dt, rm);
    const focus = pedestals[lab.state.active];
    labCam.position.lerp(new THREE.Vector3(focus.x * 0.35, 1.55, 5.0), 0.04);
    labCam.lookAt(focus.x * 0.4, 0.95, focus.z);
    labRenderer.render(labScene, labCam);
  }

  const cinemaOn = ch.key === 'cinema';
  cinemaPanel.classList.toggle('hidden-panel', !cinemaOn);
  if (cinemaOn && videoEl.paused && !userPaused && document.body.classList.contains('started')) {
    videoEl.play().catch(() => {});
  } else if (!cinemaOn && !videoEl.paused) {
    videoEl.pause();
  }
  if (videoEl.duration) cineFill.style.width = `${(videoEl.currentTime / videoEl.duration) * 100}%`;
}

window.addEventListener('resize', sizeLab);
applyHash();
sizeLab();
requestAnimationFrame(tick);
