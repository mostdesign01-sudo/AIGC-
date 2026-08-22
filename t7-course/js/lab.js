// 互动实验室：可拖拽旋转 / 缩放 / 切换状态的得物工作案例
// 01 11 周年 T 恤   02 物流箱（可开箱）   03 奖杯 AR   04 NONO 盲盒
import * as THREE from 'three';
import { COLORS } from './config.js';

const AUR = COLORS.aurora;

function shirtPrintTexture(text = '11', sub = 'DEWU ANNIVERSARY') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 512, 512);
  x.fillStyle = '#01c2c3';
  x.font = '700 300px "PingFang SC", sans-serif';
  x.textAlign = 'center';
  x.fillText(text, 256, 300);
  x.fillStyle = 'rgba(232,230,225,0.9)';
  x.font = '600 36px monospace';
  x.fillText(sub, 256, 380);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function boxLogoTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 512, 256);
  x.fillStyle = '#0f6b6c';
  x.font = '700 120px "PingFang SC", sans-serif';
  x.textAlign = 'center';
  x.fillText('得物', 256, 150);
  x.font = '600 34px monospace';
  x.fillText('DEWU LOGISTICS', 256, 210);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- 01 11 周年 T 恤 ---------- */
function buildShirt() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xe8e6e1, roughness: 0.85 });
  // 衣身（挤出轮廓）
  const shape = new THREE.Shape();
  shape.moveTo(-0.42, -0.62);
  shape.lineTo(-0.42, 0.30);
  shape.lineTo(-0.78, 0.18);   // 左袖下
  shape.lineTo(-0.66, 0.52);   // 左袖上
  shape.lineTo(-0.24, 0.62);   // 左肩
  shape.quadraticCurveTo(0, 0.5, 0.24, 0.62); // 领口
  shape.lineTo(0.66, 0.52);
  shape.lineTo(0.78, 0.18);
  shape.lineTo(0.42, 0.30);
  shape.lineTo(0.42, -0.62);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  geo.translate(0, 0, -0.08);
  const body = new THREE.Mesh(geo, mat);
  g.add(body);
  // 前胸印花
  const print = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.55),
    new THREE.MeshStandardMaterial({ map: shirtPrintTexture(), transparent: true, roughness: 0.8 })
  );
  print.position.set(0, -0.02, 0.125);
  g.add(print);
  // 衣架
  const hangerMat = new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.9, roughness: 0.3 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1), hangerMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.56;
  g.add(bar);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 20, Math.PI), hangerMat);
  hook.position.y = 0.72;
  g.add(hook);
  g.position.y = 0.75;
  return {
    group: g,
    name: '11 周年 T 恤', en: 'ANNIVERSARY TEE',
    tip: '拖动旋转查看印花 · 点击色块切换配色',
    variants: [
      { label: '本白', color: 0xe8e6e1 }, { label: '碳黑', color: 0x1c1e22 }, { label: '极光蓝', color: 0x01c2c3 },
    ],
    applyVariant(v) { mat.color.setHex(v.color); },
  };
}

/* ---------- 02 物流箱 ---------- */
function buildBox() {
  const g = new THREE.Group();
  const card = new THREE.MeshStandardMaterial({ color: 0xb9946a, roughness: 0.92 });
  const cardIn = new THREE.MeshStandardMaterial({ color: 0x96744f, roughness: 0.95 });
  const W = 1.1, H = 0.66, D = 0.78, TH = 0.03;
  // 箱体五面
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(W, TH, D), card);
  bottom.position.y = TH / 2; g.add(bottom);
  for (const [sx, sz, w, r] of [[0, D / 2, W, 0], [0, -D / 2, W, 0], [W / 2, 0, D, Math.PI / 2], [-W / 2, 0, D, Math.PI / 2]]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, H, TH), card);
    wall.position.set(sx, H / 2, sz);
    wall.rotation.y = r;
    g.add(wall);
  }
  // 翻盖（两大两小，可开合）
  const flaps = [];
  for (const side of [-1, 1]) {
    const flap = new THREE.Group();
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(W, TH, D / 2), cardIn);
    leaf.position.z = side * D / 4;
    flap.add(leaf);
    flap.position.set(0, H, side * 0); // 铰链位于 z=±D/2? 沿箱口边
    flap.position.z = 0;
    flap.userData.side = side;
    // 铰链在 z = side*D/2：将叶片以铰链为原点
    leaf.position.z = -side * D / 4;
    flap.position.z = side * D / 2;
    g.add(flap);
    flaps.push(flap);
  }
  // 胶带
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, TH + 0.005, D),
    new THREE.MeshStandardMaterial({ color: 0x01c2c3, roughness: 0.4 })
  );
  tape.position.y = H + TH / 2 + 0.002;
  g.add(tape);
  // 品牌印刷
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.35),
    new THREE.MeshStandardMaterial({ map: boxLogoTexture(), transparent: true, roughness: 0.9 })
  );
  logo.position.set(0, H / 2, D / 2 + 0.017);
  g.add(logo);
  const logo2 = logo.clone();
  logo2.rotation.y = Math.PI;
  logo2.position.z = -D / 2 - 0.017;
  g.add(logo2);
  // 箱内物品（开箱可见）
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x0d3a3b, emissive: AUR, emissiveIntensity: 0.35, roughness: 0.5 })
  );
  inner.position.y = H / 2 - 0.05;
  g.add(inner);
  g.position.y = 0.15;

  let openT = 0, targetOpen = 0;
  return {
    group: g,
    name: '物流箱', en: 'LOGISTICS BOX',
    tip: '点击“开箱”查看内部 · 拖动旋转',
    variants: [
      { label: '封箱', open: 0 }, { label: '开箱', open: 1 },
    ],
    applyVariant(v) { targetOpen = v.open; },
    update(dt) {
      openT += (targetOpen - openT) * Math.min(1, dt * 5);
      flaps.forEach(f => { f.rotation.x = f.userData.side * openT * 1.9; });
      tape.visible = openT < 0.25;
    },
  };
}

/* ---------- 03 奖杯 AR ---------- */
function buildTrophy() {
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af5a, metalness: 0.95, roughness: 0.22 });
  const pts = [];
  pts.push(new THREE.Vector2(0.0, 0));
  pts.push(new THREE.Vector2(0.30, 0));
  pts.push(new THREE.Vector2(0.30, 0.06));
  pts.push(new THREE.Vector2(0.10, 0.10));
  pts.push(new THREE.Vector2(0.07, 0.32));
  pts.push(new THREE.Vector2(0.13, 0.36));
  pts.push(new THREE.Vector2(0.30, 0.44));
  pts.push(new THREE.Vector2(0.36, 0.66));
  pts.push(new THREE.Vector2(0.32, 0.9));
  pts.push(new THREE.Vector2(0.0, 0.98));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), gold);
  g.add(cup);
  // 把手
  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 10, 24, Math.PI * 1.2), gold);
    handle.position.set(side * 0.4, 0.66, 0);
    handle.rotation.z = side * -0.4 + (side === 1 ? Math.PI : 0);
    g.add(handle);
  }
  // 底座铭牌
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.4, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x18140f, roughness: 0.4, metalness: 0.4 })
  );
  plinth.position.y = -0.05;
  g.add(plinth);
  const ringGlow = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.012, 8, 40),
    new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: AUR, emissiveIntensity: 2 })
  );
  ringGlow.rotation.x = Math.PI / 2;
  ringGlow.position.y = 0.0;
  g.add(ringGlow);
  g.position.y = 0.12;
  return {
    group: g,
    name: '奖杯 AR', en: 'TROPHY AR',
    tip: 'AR 展示：拖动 360° 观察 · 点击换材质',
    variants: [
      { label: '鎏金', color: 0xd4af5a, metal: 0.95, rough: 0.22, em: 0 },
      { label: '铂银', color: 0xcfd4d8, metal: 0.95, rough: 0.18, em: 0 },
      { label: '极光晶体', color: 0x0d3a3b, metal: 0.3, rough: 0.1, em: 0.7 },
    ],
    applyVariant(v) {
      gold.color.setHex(v.color); gold.metalness = v.metal; gold.roughness = v.rough;
      gold.emissive.setHex(v.em ? AUR : 0x000000); gold.emissiveIntensity = v.em || 0;
    },
  };
}

/* ---------- 04 NONO 盲盒 ---------- */
function buildNono() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xefe9df, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.5 });
  // 盲盒底座（半开的盒子）
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x101416, roughness: 0.5, metalness: 0.2 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.5, 0.72), boxMat);
  base.position.y = 0.25;
  g.add(base);
  const boxEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.02, 0.74),
    new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: AUR, emissiveIntensity: 1.6 })
  );
  boxEdge.position.y = 0.51;
  g.add(boxEdge);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.1, 0.74), boxMat);
  lid.position.set(0.55, 0.12, -0.4);
  lid.rotation.set(0.3, 0.6, 1.2);
  g.add(lid);
  // NONO：胶囊头 + 方身潮玩
  const fig = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 18), bodyMat);
  head.scale.set(1, 0.92, 0.95);
  head.position.y = 0.95;
  fig.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 12), bodyMat);
    ear.position.set(side * 0.16, 1.2, 0);
    ear.rotation.z = side * -0.35;
    fig.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), darkMat);
    eye.position.set(side * 0.1, 0.98, 0.225);
    fig.add(eye);
  }
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.24), bodyMat);
  torso.position.y = 0.62;
  fig.add(torso);
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.05, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: AUR, emissiveIntensity: 1.2 })
  );
  belt.position.y = 0.56;
  fig.add(belt);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 10), bodyMat);
    arm.position.set(side * 0.24, 0.66, 0);
    arm.rotation.z = side * 0.5;
    fig.add(arm);
    const legM = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.14, 4, 10), bodyMat);
    legM.position.set(side * 0.1, 0.36, 0);
    fig.add(legM);
  }
  fig.position.y = 0.5;
  g.add(fig);
  return {
    group: g,
    name: 'NONO 盲盒', en: 'NONO BLINDBOX',
    tip: '拖动旋转 · 点击切换隐藏款配色',
    variants: [
      { label: '经典白', color: 0xefe9df }, { label: '午夜黑', color: 0x22252a }, { label: '隐藏款 · 极光', color: 0x01c2c3 },
    ],
    applyVariant(v) { bodyMat.color.setHex(v.color); },
  };
}

/* ==================================================================== */
export function createLab(scene, pedestals, camera, dom, opts = {}) {
  const single = opts.single !== false;
  const cases = [buildShirt(), buildBox(), buildTrophy(), buildNono()];
  const group = new THREE.Group();
  cases.forEach((c, i) => {
    if (single) {
      c.group.position.set(0, 0.15, 0);
      c.group.visible = i === 0;
    } else if (pedestals[i]) {
      c.group.position.add(pedestals[i]);
    }
    c.baseScale = single ? 1.15 : 1;
    c.group.userData.caseIndex = i;
    group.add(c.group);
  });
  scene.add(group);

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const state = {
    enabled: false,
    active: 0,
    dragging: false,
    lastX: 0, lastY: 0,
    velX: 0, velY: 0,
  };

  function pick(e) {
    const r = dom.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(group.children, true);
    if (!hits.length) return null;
    let o = hits[0].object;
    while (o && o.userData.caseIndex === undefined) o = o.parent;
    return o ? o.userData.caseIndex : null;
  }

  function onDown(e) {
    if (!state.enabled) return;
    const idx = pick(e);
    if (idx === null) return;
    state.active = idx;
    state.dragging = true;
    state.lastX = e.clientX; state.lastY = e.clientY;
    dom.style.cursor = 'grabbing';
    listeners.select.forEach(f => f(idx));
    e.preventDefault();
  }
  function onMove(e) {
    if (!state.enabled) return;
    if (state.dragging) {
      const dx = e.clientX - state.lastX, dy = e.clientY - state.lastY;
      state.lastX = e.clientX; state.lastY = e.clientY;
      const c = cases[state.active];
      c.group.rotation.y += dx * 0.012;
      c.group.rotation.x = Math.max(-0.7, Math.min(0.7, c.group.rotation.x + dy * 0.008));
      state.velX = dx * 0.012;
    } else {
      const idx = pick(e);
      dom.style.cursor = idx !== null ? 'grab' : '';
    }
  }
  function onUp() {
    state.dragging = false;
    if (state.enabled) dom.style.cursor = '';
  }
  // 悬停模型时滚轮为缩放；其余情况滚轮驱动课程
  function onWheel(e) {
    if (!state.enabled) return;
    const idx = pick(e);
    if (idx === null) return;
    e.preventDefault();
    e.stopPropagation();
    const c = cases[idx];
    c.baseScale = Math.max(0.6, Math.min(1.9, c.baseScale * (e.deltaY > 0 ? 0.94 : 1.06)));
  }

  dom.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  dom.addEventListener('wheel', onWheel, { passive: false });
  // 触屏：手指落在模型上时，该手势用于旋转模型而不是滚动页面
  dom.addEventListener('touchstart', (e) => {
    if (!state.enabled || !e.touches.length) return;
    if (pick(e.touches[0]) !== null) e.preventDefault();
  }, { passive: false });
  dom.addEventListener('touchmove', (e) => {
    if (state.dragging) e.preventDefault();
  }, { passive: false });

  const listeners = { select: [] };

  function update(dt, reducedMotion) {
    cases.forEach((c, i) => {
      // 未拖拽时缓慢自转（减少动画模式下静止）
      if (!state.dragging || state.active !== i) {
        if (!reducedMotion) c.group.rotation.y += dt * (i === state.active ? 0.12 : 0.3);
      }
      const s = c.baseScale;
      c.group.scale.set(s, s, s);
      if (c.update) c.update(dt);
    });
    // 惯性
    if (!state.dragging && Math.abs(state.velX) > 0.0005) {
      cases[state.active].group.rotation.y += state.velX;
      state.velX *= 0.94;
    }
  }

  return {
    cases, group, state, update,
    setEnabled(v) { state.enabled = v; if (!v) { state.dragging = false; dom.style.cursor = ''; } },
    setActive(i) {
      state.active = i;
      if (single) cases.forEach((c, k) => { c.group.visible = k === i; });
      listeners.select.forEach(f => f(i));
    },
    onSelect(f) { listeners.select.push(f); },
    applyVariant(caseIdx, vIdx) {
      const c = cases[caseIdx];
      c.applyVariant(c.variants[vIdx]);
    },
  };
}
