// 环境：广场 / 远景城市 / 巨型 HTML 立体字 / 天空与基础照明
import * as THREE from 'three';
import { COLORS } from './config.js';
import { makePlazaMap } from './textures.js';

/* HTML 四个字母都由直线笔画构成，用盒体硬表面拼装，边缘锐利 */
function buildLetter(letter, h, mat) {
  const g = new THREE.Group();
  const t = h * 0.16;  // 笔画厚度
  const w = h * 0.62;  // 字宽
  const d = h * 0.14;  // 字深
  const box = (bw, bh, x, y, rz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d), mat);
    m.position.set(x, y, 0);
    m.rotation.z = rz;
    g.add(m);
    return m;
  };
  switch (letter) {
    case 'H':
      box(t, h, -w / 2 + t / 2, 0);
      box(t, h, w / 2 - t / 2, 0);
      box(w - t * 2, t, 0, 0);
      break;
    case 'T':
      box(w, t, 0, h / 2 - t / 2);
      box(t, h - t, 0, -t / 2);
      break;
    case 'M': {
      box(t, h, -w / 2 + t / 2, 0);
      box(t, h, w / 2 - t / 2, 0);
      const diagLen = h * 0.62;
      box(t * 0.9, diagLen, -w * 0.15, h * 0.14, -0.5);
      box(t * 0.9, diagLen, w * 0.15, h * 0.14, 0.5);
      break;
    }
    case 'L':
      box(t, h, -w / 2 + t / 2, 0);
      box(w - t, t, t / 2, -h / 2 + t / 2);
      break;
  }
  return g;
}

export function createEnvironment(scene, quality) {
  const group = new THREE.Group();

  /* ---------- 天空：大半球渐变 ---------- */
  const skyGeo = new THREE.SphereGeometry(900, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x05060a) },
      mid: { value: new THREE.Color(0x0b0e14) },
      bottom: { value: new THREE.Color(0x191d24) },
    },
    vertexShader: `varying vec3 vp; void main(){ vp = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vp;
      uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
      void main(){
        float hgt = normalize(vp).y;
        vec3 c = hgt > 0.12 ? mix(mid, top, smoothstep(0.12, 0.7, hgt))
                            : mix(bottom, mid, smoothstep(-0.08, 0.12, hgt));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  group.add(sky);

  /* ---------- 广场地面 ---------- */
  const plazaTex = makePlazaMap();
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(600, 48),
    new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.9, metalness: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  group.add(ground);

  // 极光蓝路径引导线：从广场指向入口
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x032a2a, emissive: COLORS.aurora, emissiveIntensity: 1.2,
  });
  for (let i = 0; i < 7; i++) {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 2.6), pathMat);
    seg.position.set(0, 0.03, 26 + i * 4.6);
    group.add(seg);
  }
  // 广场景观灯柱
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x232629, roughness: 0.5, metalness: 0.8 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x1a1a14, emissive: 0xffd9a6, emissiveIntensity: 2.2 });
  [[-16, 34], [16, 34], [-24, 52], [24, 52], [-12, 66], [12, 66]].forEach(([x, z]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.6), poleMat);
    pole.position.set(x, 2.8, z);
    group.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.3), lampMat);
    head.position.set(x, 5.6, z);
    group.add(head);
  });
  // 树阵（克制的深色景观树：干 + 简洁球冠）
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a211c, roughness: 1 });
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x17251d, roughness: 1 });
  [[-30, 42], [-38, 58], [30, 42], [38, 58], [-46, 40], [46, 40], [-26, 70], [26, 70]].forEach(([x, z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.6, 8), trunkMat);
    trunk.position.set(x, 1.3, z);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), crownMat);
    crown.position.set(x, 4.0, z);
    crown.scale.y = 1.25;
    group.add(trunk, crown);
  });

  /* ---------- 巨型 HTML 立体字（建筑背后） ---------- */
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0x14171a, metalness: 0.6, roughness: 0.35,
    emissive: 0xdfe8ea, emissiveIntensity: 0.28,
  });
  const htmlGroup = new THREE.Group();
  const letters = ['H', 'T', 'M', 'L'];
  const LH = 30;
  letters.forEach((l, i) => {
    const lg = buildLetter(l, LH, letterMat);
    lg.position.x = (i - 1.5) * LH * 0.82;
    htmlGroup.add(lg);
    // 底部极光蓝细托座
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(LH * 0.7, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x0a0f10, emissive: COLORS.aurora, emissiveIntensity: 0.9 })
    );
    base.position.set(lg.position.x, -LH / 2 - 0.3, 0);
    htmlGroup.add(base);
  });
  htmlGroup.position.set(0, LH / 2 + 14, -120);
  group.add(htmlGroup);

  // HTML 字后方的冷色轮廓光
  const htmlLight = new THREE.PointLight(0x3899a8, 1800, 260, 1.8);
  htmlLight.position.set(0, 40, -150);
  group.add(htmlLight);

  /* ---------- 远景城市（稀疏低层体块 + 少量亮窗） ---------- */
  const cityGroup = new THREE.Group();
  const cityMat = new THREE.MeshStandardMaterial({ color: 0x101317, roughness: 0.95 });
  let s = 3;
  const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 60; i++) {
    const ang = rand() * Math.PI * 2;
    const r = 190 + rand() * 320;
    const bw = 12 + rand() * 26;
    const bh = 8 + rand() * 46;
    const bx = Math.cos(ang) * r, bz = Math.sin(ang) * r;
    if (Math.abs(bx) < 60 && bz < -60 && bz > -200) continue; // 给 HTML 字留出天际线
    const bld = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw * (0.7 + rand() * 0.6)), cityMat);
    bld.position.set(bx, bh / 2, bz);
    bld.rotation.y = rand() * Math.PI;
    cityGroup.add(bld);
  }
  group.add(cityGroup);

  /* ---------- 基础照明 ---------- */
  const hemi = new THREE.HemisphereLight(0x24303c, 0x0c0a09, 0.55);
  group.add(hemi);
  const moon = new THREE.DirectionalLight(0x9db4c8, 0.55);
  moon.position.set(-80, 140, 60);
  group.add(moon);
  // 广场暖色补光
  const plazaFill = new THREE.PointLight(0xffd9a6, 300, 90, 1.9);
  plazaFill.position.set(0, 10, 42);
  group.add(plazaFill);

  scene.fog = new THREE.FogExp2(0x0a0c0f, 0.0028);
  scene.add(group);
  return { group, htmlGroup, sky };
}
