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
      top: { value: new THREE.Color(0x060810) },
      mid: { value: new THREE.Color(0x0c1220) },     // 蓝调时刻的低空
      bottom: { value: new THREE.Color(0x141a26) },
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
  // 树阵（参考图：茂密的簇状树冠，混少量暖色秋树）
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a211c, roughness: 1 });
  const crownMats = [
    new THREE.MeshStandardMaterial({ color: 0x1c3524, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x2c4a2c, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x17251d, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x8a4520, roughness: 1 }),
  ];
  function tree(x, z, scale = 1, warm = false) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, 2.6 * scale, 7), trunkMat);
    trunk.position.set(x, 1.3 * scale, z);
    group.add(trunk);
    const main = warm ? crownMats[3] : crownMats[(x * 7 + z) % 2 === 0 ? 0 : 1];
    for (const [dx, dy, dz, r] of [[0, 3.9, 0, 1.9], [1.1, 3.1, 0.4, 1.2], [-1.0, 3.3, -0.5, 1.3], [0.2, 4.9, 0.2, 1.15]]) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * scale, 1), main);
      c.position.set(x + dx * scale, dy * scale, z + dz * scale);
      group.add(c);
    }
  }
  [[-24, 40], [-34, 52], [24, 40], [34, 52], [-42, 38], [42, 38], [-22, 64], [22, 64],
   [-30, 26], [30, 26], [-38, 14], [38, 14], [-16, 52], [16, 52]].forEach(([x, z], i) => {
    tree(x, z, 0.85 + (i % 3) * 0.18, i % 5 === 0);
  });

  /* ---------- 巨型 HTML 立体字（建筑背后，比楼体更宽更高可见） ---------- */
  const letterMat = new THREE.MeshStandardMaterial({
    color: 0x181c1f, metalness: 0.55, roughness: 0.4,
    emissive: 0xe6eff1, emissiveIntensity: 1.1,
  });
  const htmlGroup = new THREE.Group();
  const letters = ['H', 'T', 'M', 'L'];
  const LH = 38;
  letters.forEach((l, i) => {
    const lg = buildLetter(l, LH, letterMat);
    lg.position.x = (i - 1.5) * LH * 0.88;
    htmlGroup.add(lg);
    // 底部极光蓝细托座
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(LH * 0.72, 0.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x0a0f10, emissive: COLORS.aurora, emissiveIntensity: 1.1 })
    );
    base.position.set(lg.position.x, -LH / 2 - 0.35, 0);
    htmlGroup.add(base);
    // 支承桅杆（托座落到地面的结构，避免悬空）
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x191c1f, metalness: 0.6, roughness: 0.5 });
    for (const mx of [-LH * 0.24, LH * 0.24]) {
      const mast = new THREE.Mesh(new THREE.BoxGeometry(1.1, 20.4, 1.6), mastMat);
      mast.position.set(lg.position.x + mx, -LH / 2 - 10, 0);
      htmlGroup.add(mast);
    }
  });
  // 抬高至与主楼同高：外景中从楼后耸出，屋顶终幕越过女儿墙可见
  htmlGroup.position.set(0, LH / 2 + 20, -132);
  group.add(htmlGroup);

  // HTML 字后方的冷色轮廓光
  const htmlLight = new THREE.PointLight(0x3899a8, 2600, 300, 1.8);
  htmlLight.position.set(0, 46, -165);
  group.add(htmlLight);

  /* ---------- 远景城市（稀疏低层体块 + 少量亮窗） ---------- */
  const cityGroup = new THREE.Group();
  const cityMat = new THREE.MeshStandardMaterial({ color: 0x0c0e11, roughness: 0.95, envMapIntensity: 0.12 });
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

  /* ---------- 极光光带（参考图：多条宽幅半透明光带环绕塔身） ---------- */
  const dream = new THREE.Group();
  const ribbons = [];
  function ribbon(radius, height, tiltX, tiltZ, bandH, opacity) {
    // 开口圆柱面 = 环绕塔身的宽幅光带；上下边缘做透明渐隐
    const geo = new THREE.CylinderGeometry(radius, radius, bandH, 110, 1, true);
    const c = document.createElement('canvas');
    c.width = 4; c.height = 64;
    const gx = c.getContext('2d');
    const grd = gx.createLinearGradient(0, 0, 0, 64);
    grd.addColorStop(0, 'rgba(1,194,195,0)');
    grd.addColorStop(0.5, 'rgba(1,194,195,1)');
    grd.addColorStop(1, 'rgba(1,194,195,0)');
    gx.fillStyle = grd; gx.fillRect(0, 0, 4, 64);
    const gt = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshBasicMaterial({
      map: gt, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = tiltX;
    m.rotation.z = tiltZ;
    m.position.y = height;
    m.userData.baseOpacity = opacity;
    dream.add(m);
    ribbons.push(m);
    return m;
  }
  // 内侧亮带 + 外侧两条虚化宽带（角度错开，形成缠绕感）
  ribbon(33, 40, 0.14, 0.09, 7, 0.42);
  ribbon(41, 30, -0.10, -0.16, 10, 0.22);
  ribbon(29, 51, 0.20, -0.07, 6, 0.30);
  group.add(dream);

  /* ---------- 悬浮岩石小岛与玻璃方块（参考图元素，克制数量） ---------- */
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x35322f, roughness: 1 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x24401f, roughness: 1 });
  const floaters = [];
  const islands = [[-52, 30, -20, 1.4], [58, 44, -34, 1.7], [-64, 52, -60, 2.0], [50, 24, 40, 1.1], [-44, 60, 30, 1.0]];
  islands.forEach(([ix, iy, iz, s], idx) => {
    const isl = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(3 * s, 1), rockMat);
    rock.scale.y = 1.2;
    rock.position.y = -1.6 * s;
    isl.add(rock);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(2.6 * s, 3.0 * s, 0.7 * s, 9), grassMat);
    isl.add(top);
    // 岛上小树
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.16 * s, 1.6 * s, 6), trunkMat);
    tr.position.y = 1.1 * s;
    isl.add(tr);
    const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 * s, 1), crownMats[idx % 2 === 0 ? 1 : 3]);
    cr.position.y = 2.4 * s;
    isl.add(cr);
    isl.position.set(ix, iy, iz);
    isl.userData = { baseY: iy, phase: idx * 1.7, amp: 0.6 + idx * 0.15 };
    dream.add(isl);
    floaters.push(isl);
  });
  const cubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fdfe0, metalness: 0, roughness: 0.06,
    transparent: true, opacity: 0.32, transmission: 0.6,
    thickness: 0.5, depthWrite: false,
  });
  [[-38, 56, -8, 2.2], [46, 62, -18, 1.6], [-58, 42, 16, 1.8], [40, 36, 26, 1.2], [62, 54, 6, 2.6]].forEach(([cx2, cy, cz2, s], idx) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), cubeMat);
    cube.position.set(cx2, cy, cz2);
    cube.rotation.set(idx, idx * 0.7, idx * 0.3);
    cube.userData = { baseY: cy, phase: idx * 2.3, amp: 0.4, spin: 0.1 + idx * 0.03 };
    dream.add(cube);
    floaters.push(cube);
  });

  function animate(t, reducedMotion) {
    if (reducedMotion) return;
    ribbons.forEach((r, i) => {
      r.material.opacity = r.userData.baseOpacity * (0.85 + Math.sin(t * 0.5 + i * 2.1) * 0.15);
    });
    for (const f of floaters) {
      f.position.y = f.userData.baseY + Math.sin(t * 0.4 + f.userData.phase) * f.userData.amp;
      if (f.userData.spin) { f.rotation.y += 0.0015; f.rotation.x += 0.0008; }
    }
  }

  /* ---------- 基础照明 ---------- */
  const hemi = new THREE.HemisphereLight(0x2a3846, 0x0e0b0a, 0.75);
  group.add(hemi);
  const moon = new THREE.DirectionalLight(0x9db4c8, 0.75);
  moon.position.set(-80, 140, 60);
  group.add(moon);
  // 正面柔和补光（保证红砖立面可读）
  const frontFill = new THREE.DirectionalLight(0xcbb49a, 0.5);
  frontFill.position.set(50, 70, 140);
  group.add(frontFill);
  // 广场暖色补光
  const plazaFill = new THREE.PointLight(0xffd9a6, 480, 100, 1.9);
  plazaFill.position.set(0, 12, 42);
  group.add(plazaFill);

  scene.fog = new THREE.FogExp2(0x0a0c0f, 0.0022);
  scene.add(group);
  return { group, htmlGroup, sky, animate };
}
