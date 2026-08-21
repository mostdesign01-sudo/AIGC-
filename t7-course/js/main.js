// 走进 HTML：一份内容，三种交付 —— 得物 T7 沉浸式课程
// 主控：渲染器 / 滚动时间轴 / 场景装配 / 逐帧同步
import * as THREE from 'three';
import { COLORS, CHAPTERS, chapterAt, span, smooth } from './config.js';
import { createBuilding } from './building.js';
import { createEnvironment } from './environment.js';
import { createTrain } from './train.js';
import { createInteriors, LV } from './interiors.js';
import { samplePath, TIMES, windowSpan } from './cameraPath.js';
import { createLab } from './lab.js';
import { createSlides } from './slides.js';
import { mountContent } from './content.js';
import { createHUD } from './hud.js';
import { createAudio } from './audio.js';

/* ================= 基础设置 ================= */
const canvas = document.getElementById('gl');
const isMobile = window.innerWidth < 820 || (navigator.maxTouchPoints > 1 && window.innerWidth < 1100);
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const settings = {
  lowPerf: isMobile,
  reducedMotion: prefersReduced,
  onQualityChange() { applyQuality(); },
};

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: !isMobile, powerPreference: 'high-performance',
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.bg);

const camera = new THREE.PerspectiveCamera(isMobile ? 64 : 55, innerWidth / innerHeight, 0.1, 1200);
camera.position.set(44, 9, 108);

function applyQuality() {
  renderer.setPixelRatio(settings.lowPerf ? 1 : Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  scene.fog.density = settings.lowPerf ? 0.0034 : 0.0028;
}

/* ================= 环境反射贴图（简易渐变室内环境） ================= */
function buildEnvMap() {
  const envScene = new THREE.Scene();
  const grad = new THREE.Mesh(
    new THREE.SphereGeometry(10, 16, 12),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x0e1418 })
  );
  envScene.add(grad);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0x8aa2ac }));
  top.position.y = 8; top.rotation.x = Math.PI / 2;
  envScene.add(top);
  const warm = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ color: 0xffd9a6 }));
  warm.position.set(4, 2, -5);
  envScene.add(warm);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  return envTex;
}
scene.environment = buildEnvMap();
scene.environmentIntensity = 0.5;

/* ================= 场景装配 ================= */
const env = createEnvironment(scene, settings);
const building = createBuilding();
scene.add(building);
const train = createTrain(scene);

const videoEl = document.getElementById('hf-video');
videoEl.muted = true;
const interiors = createInteriors(scene, videoEl);
const lab = createLab(scene, interiors.dyn.labPedestals, camera, canvas);
const slides = createSlides(interiors.dyn.deckScreen, interiors.dyn.agendaScreen);
const content = mountContent(document.getElementById('content'));
const audio = createAudio();

/* ================= 滚动系统 ================= */
const scroll = {
  target: 0, value: 0,
  get max() { return document.body.scrollHeight - innerHeight; },
  goTo(p) { window.scrollTo({ top: p * this.max, behavior: 'auto' }); },
  nudge(dp) { window.scrollBy({ top: dp * this.max, behavior: 'auto' }); },
};
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('scroll', () => {
  scroll.target = Math.min(1, Math.max(0, window.scrollY / scroll.max));
}, { passive: true });

const hud = createHUD(scroll, audio, settings);

/* ================= 实验室面板 ================= */
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

/* ================= 放映厅面板 ================= */
const cinemaPanel = document.getElementById('cinema-panel');
const btnPlay = document.getElementById('video-play');
const btnRestart = document.getElementById('video-restart');
const btnFs = document.getElementById('video-fs');
const cineFill = document.getElementById('cinema-progress-fill');
let userPaused = false;

btnPlay.addEventListener('click', () => {
  if (videoEl.paused) {
    videoEl.muted = false;
    videoEl.play();
    userPaused = false;
  } else {
    videoEl.pause();
    userPaused = true;
  }
});
btnRestart.addEventListener('click', () => {
  videoEl.currentTime = 0;
  videoEl.muted = false;
  videoEl.play();
  userPaused = false;
});
btnFs.addEventListener('click', () => {
  videoEl.muted = false;
  if (videoEl.requestFullscreen) videoEl.requestFullscreen();
  else if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
});
videoEl.addEventListener('play', () => { btnPlay.textContent = '暂停'; });
videoEl.addEventListener('pause', () => { btnPlay.textContent = '播放'; });

/* ================= 加载页 ================= */
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const enterBtn = document.getElementById('enter-btn');
let ready = false;
let fakeProgress = 0;
const readyTimer = setInterval(() => {
  fakeProgress = Math.min(96, fakeProgress + 9 + Math.random() * 12);
  loaderFill.style.width = fakeProgress + '%';
  if (fakeProgress >= 96 && !ready) markReady();
}, 120);
function markReady() {
  if (ready) return;
  ready = true;
  clearInterval(readyTimer);
  loaderFill.style.width = '100%';
  enterBtn.disabled = false;
  enterBtn.textContent = '进入 T7';
}
videoEl.addEventListener('canplaythrough', () => precompileThen(markReady), { once: true });
setTimeout(() => precompileThen(markReady), 3500);

// 预编译全部材质与光照组合，避免章节转场/深链首帧卡顿
let precompiled = false;
function precompileThen(cb) {
  if (precompiled) { cb(); return; }
  precompiled = true;
  const wasVisible = {};
  for (const [k, g] of Object.entries(interiors.chapterGroups)) {
    wasVisible[k] = g.visible;
    g.visible = true;
  }
  try { renderer.compile(scene, camera); } catch (e) { /* 忽略编译异常，运行时再按需编译 */ }
  for (const [k, g] of Object.entries(interiors.chapterGroups)) g.visible = wasVisible[k];
  cb();
}
enterBtn.addEventListener('click', () => {
  loader.classList.add('done');
  document.body.classList.add('started');
  window.scrollTo(0, 0);
});

/* ================= 逐帧同步 ================= */
const clock = new THREE.Clock();
const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _trainPos = new THREE.Vector3();
const beacon = building.getObjectByName('beacon');
let lastElevDing = false;
let currentChapterIdx = 0;

function floorLabel(p, y) {
  // 移动段显示实时楼层
  const inRide = (p >= TIMES.elevRide[0] && p <= TIMES.elevRide[1]) ||
                 (p >= TIMES.corridor[0] && p <= TIMES.corridor[1]) ||
                 (p >= TIMES.lightwell[0] && p <= TIMES.lightwell[1]) ||
                 (p >= TIMES.ramp[0] && p <= TIMES.ramp[1]);
  if (inRide) {
    const f = Math.max(1, Math.min(14, Math.round((y - 0.3) / 4.2) + 1));
    return `${f}F · 上行中`;
  }
  return null;
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, clock.getDelta());
  const rm = settings.reducedMotion;

  // 滚动平滑（限制最大速度 → 章节跳转成为真实穿行）
  const k = rm ? 0.14 : 0.055;
  let dp = (scroll.target - scroll.value) * k;
  const maxStep = (rm ? 0.010 : 0.0042) * (dt * 60);
  dp = Math.max(-maxStep, Math.min(maxStep, dp));
  scroll.value += dp;
  if (Math.abs(scroll.target - scroll.value) < 0.00002) scroll.value = scroll.target;
  const p = scroll.value;

  // 摄像机
  samplePath(p, _pos, _look);
  camera.position.copy(_pos);
  // 互动实验室：注视焦点微调至当前展台
  if (currentChapterIdx === 4 && p > 0.605 && p < 0.7) {
    const target = interiors.dyn.labPedestals[lab.state.active];
    _look.lerp(new THREE.Vector3(target.x, target.y + 0.6, target.z), 0.45);
  }
  camera.lookAt(_look);

  // 章节
  const ch = chapterAt(p);
  const chIdx = CHAPTERS.indexOf(ch);
  if (chIdx !== currentChapterIdx) {
    currentChapterIdx = chIdx;
    interiors.updateVisibility(chIdx);
  }

  // 入口玻璃门
  building.userData.setDoorOpen(smooth(windowSpan(p, TIMES.door)));

  // 观光电梯
  const cab = interiors.dyn.elevatorCab;
  const ride = smooth(windowSpan(p, TIMES.elevRide));
  cab.position.y = LV.F3 + (LV.F6 - LV.F3) * ride;
  const dOpen1 = windowSpan(p, TIMES.elevDoorOpen1);
  const dClose1 = windowSpan(p, [TIMES.elevDoorOpen1[1], TIMES.elevRide[0]]);
  const dOpen2 = windowSpan(p, TIMES.elevDoorOpen2);
  interiors.dyn.elevatorDoor.userData.setOpen(Math.max(dOpen1 * (1 - dClose1), dOpen2));
  const dinging = dOpen2 > 0 && dOpen2 < 1;
  if (dinging && !lastElevDing) audio.elevatorDing();
  lastElevDing = dinging;

  // 会议室幻灯片
  if (chIdx === 3) slides.update(windowSpan(p, TIMES.slides));

  // 实验室交互开关与面板
  const labOn = chIdx === 4 && p > 0.60 && p < 0.706;
  lab.setEnabled(labOn);
  labPanel.classList.toggle('hidden-panel', !labOn);
  lab.update(dt, rm);

  // 放映厅
  const cinemaOn = p >= TIMES.video[0] && p <= TIMES.video[1];
  cinemaPanel.classList.toggle('hidden-panel', !cinemaOn);
  if (cinemaOn && videoEl.paused && !userPaused && document.body.classList.contains('started')) {
    videoEl.play().catch(() => {});
  } else if (!cinemaOn && !videoEl.paused) {
    videoEl.pause();
  }
  if (videoEl.duration) cineFill.style.width = `${(videoEl.currentTime / videoEl.duration) * 100}%`;

  // 列车
  train.update(dt, rm);
  train.headPosition(_trainPos);
  audio.updateTrain(_trainPos.distanceTo(camera.position));

  // 灯光呼吸与航空障碍灯
  const t = performance.now() * 0.001;
  if (!rm) {
    beacon.material.emissiveIntensity = 1.2 + Math.sin(t * 2.2) * 1.0;
    building.userData.uplights.children.forEach((l, i) => {
      if (l.isSpotLight) l.intensity = 340 + Math.sin(t * 0.7 + i) * 30;
    });
  }

  // 文字层与 HUD
  content.update(p);
  hud.update(p, floorLabel(p, camera.position.y));

  renderer.render(scene, camera);
}

/* ================= 事件 ================= */
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  applyQuality();
});

/* ================= 深链：#p=0.42 或 #ch=3 直达（讲师上课可用） ================= */
function applyHash() {
  const h = location.hash;
  let target = null;
  const mp = h.match(/p=([\d.]+)/);
  const mc = h.match(/ch=(\d)/);
  if (mp) target = parseFloat(mp[1]);
  else if (mc) {
    const c = CHAPTERS[Math.max(0, Math.min(6, parseInt(mc[1], 10) - 1))];
    target = c.from + 0.004;
  }
  if (target === null) return;
  target = Math.max(0, Math.min(1, target));
  scroll.goTo(target);
  scroll.target = target;
  scroll.value = target;   // 深链直接落位，不做穿行动画
  interiors.updateVisibility(CHAPTERS.indexOf(chapterAt(target)));
  if (h.includes('auto')) {
    markReady();
    loader.classList.add('done');
    document.body.classList.add('started');
  }
}
window.addEventListener('hashchange', applyHash);

applyQuality();
interiors.updateVisibility(0);
applyHash();
tick();
