// T7 内部课程空间：大厅 / 信息大厅 / 会议层 / 中庭坡道 / 实验室 / 放映厅 / 屋顶
// 所有空间位于同一楼体内部，由真实的门、扶梯、电梯、坡道、光井楼梯连接
//
// 楼层标高：
//   大厅 0.3（挑高至 8.5）  信息大厅 F3=8.7  会议层 F6=21.3
//   实验室 F9=33.9（挑高）  放映厅 F11=42.6  屋顶 59.55
import * as THREE from 'three';
import { B, COLORS } from './config.js';
import {
  makeInteriorFloor, screenCanvas, screenTexture,
  drawKicker, drawTitle, drawBody, drawBars,
  SCREEN_AURORA, SCREEN_FG, SCREEN_DIM,
} from './textures.js';

export const LV = {
  LOBBY: 0.3,
  F3: 2 * B.FLOOR_H + 0.3,      // 8.7
  F6: 5 * B.FLOOR_H + 0.3,      // 21.3
  F9: 8 * B.FLOOR_H + 0.3,      // 33.9
  F11: 10 * B.FLOOR_H + 0.6,    // 42.6
  ROOF: B.TOWER_H + 0.75,       // 59.55
};

/* ============ 通用材质 ============ */
function makeMats() {
  const floorTex = makeInteriorFloor();
  return {
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0.15 }),
    wall: new THREE.MeshStandardMaterial({ color: 0x2a2c2f, roughness: 0.92 }),
    wallWarm: new THREE.MeshStandardMaterial({ color: 0x38322d, roughness: 0.95 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x71413a, roughness: 1.0 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x1c1e20, roughness: 0.95 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.85, roughness: 0.4 }),
    lightMetal: new THREE.MeshStandardMaterial({ color: 0x585d63, metalness: 0.8, roughness: 0.35 }),
    ceilLight: new THREE.MeshStandardMaterial({ color: 0x1a1a16, emissive: 0xffe0b8, emissiveIntensity: 2.0 }),
    auroraStrip: new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: COLORS.aurora, emissiveIntensity: 1.8 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x9fc0c6, transmission: 0.9, transparent: true, roughness: 0.06,
      metalness: 0, thickness: 0.05, depthWrite: false,
    }),
    screenFrame: new THREE.MeshStandardMaterial({ color: 0x121416, metalness: 0.7, roughness: 0.3 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x4a3b2e, roughness: 0.8 }),
    seat: new THREE.MeshStandardMaterial({ color: 0x232528, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x08090b, roughness: 1 }),
  };
}

/* 带门洞的墙（世界坐标开口，由分段盒体拼成） */
function wallSegments(group, mat, { length, height, thick, openings = [], pos, rotY = 0 }) {
  const segs = [];
  const sorted = [...openings].sort((a, b) => a.c - b.c);
  let cursor = -length / 2;
  for (const o of sorted) {
    const left = o.c - o.w / 2;
    if (left > cursor + 0.01) segs.push({ x: (cursor + left) / 2, w: left - cursor, y: height / 2, h: height });
    if (o.h < height - 0.01) segs.push({ x: o.c, w: o.w, y: o.h + (height - o.h) / 2, h: height - o.h });
    cursor = o.c + o.w / 2;
  }
  if (cursor < length / 2 - 0.01) segs.push({ x: (cursor + length / 2) / 2, w: length / 2 - cursor, y: height / 2, h: height });
  const g = new THREE.Group();
  for (const s of segs) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, thick), mat);
    m.position.set(s.x, s.y, 0);
    g.add(m);
  }
  g.position.copy(pos);
  g.rotation.y = rotY;
  group.add(g);
  return g;
}

/* 带矩形洞的水平板（地板 / 天花开洞） */
function slabWithHole(group, mat, { w, d, t, cx, cz, y, hole }) {
  // hole: {x0,x1,z0,z1} 相对板中心
  const parts = [];
  if (hole) {
    const { x0, x1, z0, z1 } = hole;
    parts.push({ x: (-w / 2 + x0) / 2, z: 0, pw: x0 + w / 2, pd: d });                  // 西侧整条
    parts.push({ x: (x1 + w / 2) / 2, z: 0, pw: w / 2 - x1, pd: d });                   // 东侧整条
    parts.push({ x: (x0 + x1) / 2, z: (z1 + d / 2) / 2, pw: x1 - x0, pd: d / 2 - z1 }); // 北条
    parts.push({ x: (x0 + x1) / 2, z: (-d / 2 + z0) / 2, pw: x1 - x0, pd: z0 + d / 2 }); // 南条
  } else {
    parts.push({ x: 0, z: 0, pw: w, pd: d });
  }
  for (const p of parts) {
    if (p.pw < 0.02 || p.pd < 0.02) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(p.pw, t, p.pd), mat);
    m.position.set(cx + p.x, y, cz + p.z);
    group.add(m);
  }
}

/* 内容屏 */
function makeScreen(mats, w, h, draw, opts = {}) {
  const { c, x } = screenCanvas(opts.pw || 1024, opts.ph || Math.round((opts.pw || 1024) * h / w));
  draw(x, c.width, c.height);
  const t = screenTexture(c);
  const g = new THREE.Group();
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.85, roughness: 0.4 })
  );
  g.add(panel);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.09), mats.screenFrame);
  frame.position.z = -0.055;
  g.add(frame);
  g.userData = { canvas: c, ctx: x, texture: t };
  return g;
}

function ceilingLights(group, mats, y, xs, half, alongX = true, cz = 0) {
  for (const v of xs) {
    const geo = alongX
      ? new THREE.BoxGeometry(0.18, 0.05, half * 2 * 0.8)
      : new THREE.BoxGeometry(half * 2 * 0.8, 0.05, 0.18);
    const m = new THREE.Mesh(geo, mats.ceilLight);
    if (alongX) m.position.set(v, y, cz); else m.position.set(cz, y, v);
    group.add(m);
  }
}

function slidingDoor(mats, w, h) {
  const g = new THREE.Group();
  const leafW = w / 2;
  const leaves = [];
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    const p = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.06, h - 0.1, 0.06), mats.lightMetal);
    p.position.y = h / 2; leaf.add(p);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(leafW - 0.2, 0.04, 0.07), mats.auroraStrip);
    stripe.position.y = h * 0.55; leaf.add(stripe);
    leaf.position.x = side * leafW / 2;
    leaf.userData.side = side;
    g.add(leaf); leaves.push(leaf);
  }
  g.userData.setOpen = (t) => {
    leaves.forEach(l => { l.position.x = l.userData.side * (leafW / 2 + t * leafW * 0.96); });
  };
  return g;
}

/* ==================================================================== */
export function createInteriors(scene, videoEl) {
  const mats = makeMats();
  const root = new THREE.Group();
  root.name = 'interiors';
  const chapterGroups = {};
  const dyn = {};

  function chGroup(key) {
    if (!chapterGroups[key]) {
      chapterGroups[key] = new THREE.Group();
      chapterGroups[key].name = `space-${key}`;
      root.add(chapterGroups[key]);
    }
    return chapterGroups[key];
  }

  /* ================= 02 入口大厅（裙房内，挑高 8.5m） ================= */
  {
    const g = chGroup('lobby');
    const W = 33, D = 34, H = 8.2, Y = LV.LOBBY;
    // 地面
    slabWithHole(g, mats.floor, { w: W, d: D, t: 0.12, cx: 0, cz: 0, y: Y - 0.06 });
    // 天花（扶梯穿越处开洞）
    slabWithHole(g, mats.ceiling, {
      w: W, d: D, t: 0.15, cx: 0, cz: 0, y: Y + H + 0.08,
      hole: { x0: -1.9, x1: 1.9, z0: -5.2, z1: 0.5 },
    });
    ceilingLights(g, mats, Y + H, [-10, -5, 5, 10], D / 2 * 0.85, true);

    // 墙体
    wallSegments(g, mats.wall, {
      length: W, height: H + 0.4, thick: 0.35,
      openings: [{ c: 0, w: 11, h: 7.6 }],
      pos: new THREE.Vector3(0, Y - 0.1, 16.4),
    });
    wallSegments(g, mats.wallWarm, {
      length: W, height: H + 0.4, thick: 0.35, openings: [],
      pos: new THREE.Vector3(0, Y - 0.1, -16.6),
    });
    for (const side of [-1, 1]) {
      wallSegments(g, mats.wall, {
        length: D, height: H + 0.4, thick: 0.35, openings: [],
        pos: new THREE.Vector3(side * 16.5, Y - 0.1, 0), rotY: Math.PI / 2,
      });
    }
    // 红砖结构柱（主楼落柱）
    for (const [cx, cz] of [[-9, 8], [9, 8], [-9, -7], [9, -7]]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, H, 1.1), mats.brick);
      col.position.set(cx, Y + H / 2, cz);
      g.add(col);
    }

    // 媒体墙（后墙）
    const media = makeScreen(mats, 14, 5.6, (x, w, h) => {
      drawKicker(x, 'CHAPTER 02 · WHAT IS HTML', 70, 90, 22);
      drawTitle(x, 'HTML，一个可以打开的内容容器', 70, 185, 58);
      const items = ['文字', '图片', '视频', '动画', '数据', '互动'];
      items.forEach((it, i) => {
        const bx = 80 + i * 165, by = 265;
        x.strokeStyle = 'rgba(1,194,195,0.7)'; x.lineWidth = 2;
        x.strokeRect(bx, by, 130, 116);
        x.fillStyle = SCREEN_FG;
        x.font = '600 36px "PingFang SC",sans-serif';
        x.fillText(it, bx + 28, by + 70);
      });
      drawBody(x, [
        '不需要理解语法 —— 一个链接、一次打开，内容自己开始表达。',
        '今天课程里的所有案例，最终都是一个可以直接打开的 HTML。',
      ], 70, 470, 26, 1.9);
    }, { pw: 1600 });
    media.position.set(0, Y + 4.6, -16.2);
    g.add(media);

    // 侧墙创意案例屏
    const casesL = makeScreen(mats, 7.5, 3.6, (x, w, h) => {
      drawKicker(x, 'HTML SHOWCASE', 60, 80, 20);
      drawTitle(x, 'HTML 能做到什么', 60, 160, 48);
      const cases = [['品牌发布页', '#0f3538'], ['数据可视化', '#132a3a'], ['3D 产品页', '#15323a'], ['互动年报', '#0f2d33']];
      cases.forEach((cs, i) => {
        const bx = 60 + (i % 2) * 440, by = 210 + ((i / 2) | 0) * 150;
        const grd = x.createLinearGradient(bx, by, bx + 400, by + 120);
        grd.addColorStop(0, cs[1]); grd.addColorStop(1, '#0c0e10');
        x.fillStyle = grd; x.fillRect(bx, by, 410, 122);
        x.strokeStyle = 'rgba(1,194,195,0.4)'; x.strokeRect(bx, by, 410, 122);
        x.fillStyle = SCREEN_FG; x.font = '600 30px "PingFang SC",sans-serif';
        x.fillText(cs[0], bx + 24, by + 56);
        x.fillStyle = SCREEN_AURORA; x.font = '18px monospace';
        x.fillText('index.html', bx + 24, by + 94);
      });
    }, { pw: 1000 });
    casesL.position.set(-16.2, Y + 4.2, 0);
    casesL.rotation.y = Math.PI / 2;
    g.add(casesL);

    // 楼层导视屏（东墙）
    const directory = makeScreen(mats, 3.4, 4.6, (x, w, h) => {
      drawKicker(x, 'T7 DIRECTORY', 50, 70, 18);
      const floors = [
        ['RF', '屋顶 · 最终作业'], ['11F', '放映厅 · HyperFrames'],
        ['9F', '互动实验室 · Three.js'], ['6F', '会议层 · Presentation'],
        ['3F', '信息大厅 · 一页说清楚'], ['1F', '入口大厅 · 什么是 HTML'],
      ];
      floors.forEach((f, i) => {
        const y = 150 + i * 105;
        x.fillStyle = i === 5 ? SCREEN_AURORA : SCREEN_DIM;
        x.font = '700 34px monospace'; x.fillText(f[0], 50, y);
        x.fillStyle = i === 5 ? SCREEN_FG : SCREEN_DIM;
        x.font = '28px "PingFang SC",sans-serif'; x.fillText(f[1], 140, y);
        x.strokeStyle = 'rgba(232,230,225,0.12)';
        x.beginPath(); x.moveTo(50, y + 34); x.lineTo(w - 50, y + 34); x.stroke();
      });
    }, { pw: 620, ph: 840 });
    directory.position.set(16.2, Y + 3.6, -2);
    directory.rotation.y = -Math.PI / 2;
    g.add(directory);

    // 接待台
    const desk = new THREE.Mesh(new THREE.BoxGeometry(7, 1.1, 1.4), mats.wood);
    desk.position.set(9, Y + 0.55, 6);
    g.add(desk);
    const deskStrip = new THREE.Mesh(new THREE.BoxGeometry(7, 0.06, 0.04), mats.auroraStrip);
    deskStrip.position.set(9, Y + 0.28, 6.72);
    g.add(deskStrip);

    /* --- 扶梯：大厅(z=7.5) → 3F 信息大厅(z=-4) --- */
    const escStart = new THREE.Vector3(0, Y, 7.5);
    const escEnd = new THREE.Vector3(0, LV.F3, -4.0);
    const esc = new THREE.Group();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = escStart.clone().lerp(escEnd, t);
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 0.5), mats.metal);
      step.position.set(p.x, p.y + 0.08, p.z);
      esc.add(step);
    }
    // 底部斜梁
    const escLen = escStart.distanceTo(escEnd);
    const pitch = Math.atan2(escEnd.y - escStart.y, escStart.z - escEnd.z);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, escLen), mats.metal);
    beam.position.set(0, (escStart.y + escEnd.y) / 2 - 0.35, (escStart.z + escEnd.z) / 2);
    beam.rotation.x = pitch;
    esc.add(beam);
    // 玻璃扶手 + 极光蓝扶手灯带
    for (const side of [-1, 1]) {
      const balu = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, escLen * 0.98), mats.glass);
      balu.position.set(side * 1.5, (escStart.y + escEnd.y) / 2 + 0.75, (escStart.z + escEnd.z) / 2);
      balu.rotation.x = pitch;
      esc.add(balu);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, escLen * 0.98), mats.auroraStrip);
      rail.position.set(side * 1.5, (escStart.y + escEnd.y) / 2 + 1.3, (escStart.z + escEnd.z) / 2);
      rail.rotation.x = pitch;
      esc.add(rail);
    }
    g.add(esc);

    const l1 = new THREE.PointLight(0xffe0b8, 240, 34, 1.8); l1.position.set(0, 7.2, 6);
    const l2 = new THREE.PointLight(0xffe0b8, 200, 30, 1.8); l2.position.set(-8, 7.2, -8);
    const l3 = new THREE.PointLight(0xbfd8dc, 90, 26, 2);   l3.position.set(10, 6, -10);
    g.add(l1, l2, l3);
  }

  /* ================= 03 信息大厅（3F 数字展廊） ================= */
  {
    const g = chGroup('infohall');
    const W = 28, D = 16, CZ = -3.5, Y = LV.F3, H = 3.9;
    // 地板（扶梯上口开洞）
    slabWithHole(g, mats.floor, {
      w: W, d: D, t: 0.12, cx: 0, cz: CZ, y: Y - 0.06,
      hole: { x0: -1.9, x1: 1.9, z0: -2.0, z1: 1.2 }, // 世界 z -5.5..-2.3 → 相对 CZ
    });
    slabWithHole(g, mats.ceiling, { w: W, d: D, t: 0.12, cx: 0, cz: CZ, y: Y + H + 0.06 });
    ceilingLights(g, mats, Y + H, [-9, -3, 3, 9], D / 2 * 0.8, true, CZ);

    // 扶梯口玻璃围挡
    for (const side of [-1, 1]) {
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 3.6), mats.glass);
      guard.position.set(side * 1.95, Y + 0.55, -3.9);
      g.add(guard);
      const grail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 3.6), mats.auroraStrip);
      grail.position.set(side * 1.95, Y + 1.1, -3.9);
      g.add(grail);
    }
    const guardN = new THREE.Mesh(new THREE.BoxGeometry(3.96, 1.05, 0.06), mats.glass);
    guardN.position.set(0, Y + 0.55, -5.75);
    g.add(guardN);

    // 墙体：北墙挂屏；南墙；西墙；东墙开电梯厅门
    wallSegments(g, mats.wallWarm, { length: W, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(0, Y, CZ - D / 2) });
    wallSegments(g, mats.wall, { length: W, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(0, Y, CZ + D / 2) });
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(-W / 2, Y, CZ), rotY: Math.PI / 2 });
    // 东墙（x=13.5），门洞世界 z=-3 → 局部 c = pos.z - worldZ = -0.5
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [{ c: -0.5, w: 2.8, h: 3.0 }], pos: new THREE.Vector3(13.5, Y, CZ), rotY: Math.PI / 2 });

    // 北墙 4 块信息屏
    const infoScreens = [
      (x, w, h) => {
        drawKicker(x, 'WEEKLY REPORT', 50, 70, 18);
        drawTitle(x, '本周周报 · 一页', 50, 150, 44);
        drawBody(x, ['· 需求评审完成 12 项', '· 上线功能 5 个', '· 线上问题清零', '· 下周重点：大促页面'], 50, 220, 26, 1.85);
        x.fillStyle = SCREEN_AURORA; x.font = '600 22px monospace';
        x.fillText('weekly.html · 一个链接直接打开', 50, h - 50);
      },
      (x, w, h) => {
        drawKicker(x, 'PROJECT REVIEW', 50, 70, 18);
        drawTitle(x, '项目复盘 · 三段式', 50, 150, 44);
        drawBody(x, ['目标 → 达成 108%', '过程 → 两次关键调整', '沉淀 → 3 条可复用经验'], 50, 230, 28, 2.0);
      },
      (x, w, h) => {
        drawKicker(x, 'BIG NUMBER', 50, 70, 18);
        x.fillStyle = SCREEN_AURORA;
        x.font = '700 150px "PingFang SC",sans-serif';
        x.fillText('128%', 50, 280);
        drawBody(x, ['季度目标完成率 · 经营大字报', '让一个数字自己说话'], 50, 370, 26, 1.9);
      },
      (x, w, h) => {
        drawKicker(x, 'DATA VIEW', 50, 70, 18);
        drawTitle(x, '数据直接活在页面里', 50, 140, 40);
        drawBars(x, 60, 180, w - 130, 240, [0.32, 0.45, 0.4, 0.62, 0.58, 0.83]);
      },
    ];
    infoScreens.forEach((drawFn, i) => {
      const scr = makeScreen(mats, 5.4, 3.0, drawFn, { pw: 900 });
      scr.position.set(-9.9 + i * 6.6, Y + 2.0, CZ - D / 2 + 0.22);
      g.add(scr);
    });

    // 南墙长条屏：适用清单
    const listScreen = makeScreen(mats, 11, 1.7, (x, w, h) => {
      x.fillStyle = SCREEN_DIM; x.font = '30px "PingFang SC",sans-serif';
      x.fillText('适合做成一页 HTML 的日常内容：', 50, 90);
      x.fillStyle = SCREEN_FG; x.font = '600 33px "PingFang SC",sans-serif';
      x.fillText('会议总结 · 项目复盘 · 周报 · 经营大字报 · 数据展示 · 活动说明 · 工作汇报', 50, 160);
    }, { pw: 1800, ph: 278 });
    listScreen.position.set(-2, Y + 2.2, CZ + D / 2 - 0.2);
    listScreen.rotation.y = Math.PI;
    g.add(listScreen);

    const l1 = new THREE.PointLight(0xffe0b8, 130, 24, 1.8); l1.position.set(-6, Y + 3.3, CZ);
    const l2 = new THREE.PointLight(0xffe0b8, 130, 24, 1.8); l2.position.set(7, Y + 3.3, CZ);
    g.add(l1, l2);
  }

  /* ============ 观光电梯（3F → 6F，位于东侧翼楼内） ============ */
  {
    const g = chGroup('elevator');
    const SX = 16.7, SZ = -3;                  // 轿厢中心
    const y0 = LV.F3, y1 = LV.F6;
    const shaftH = y1 - y0 + 7;
    // 井道：背板砖，两侧金属
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, shaftH, 4.6), mats.brick);
    back.position.set(SX + 1.7, (y0 + y1) / 2 + 1.6, SZ);
    g.add(back);
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(3.6, shaftH, 0.3), mats.metal);
      sw.position.set(SX, (y0 + y1) / 2 + 1.6, SZ + side * 2.15);
      g.add(sw);
    }
    // 前侧井道玻璃（观光面，露出楼层光环）
    const front = new THREE.Mesh(new THREE.BoxGeometry(0.08, shaftH, 4.2), mats.glass);
    front.position.set(SX - 1.7, (y0 + y1) / 2 + 1.6, SZ);
    g.add(front);
    // 楼层光环
    for (let f = 2; f <= 5; f++) {
      const ring = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 4.2), mats.auroraStrip);
      ring.position.set(SX + 1.5, f * B.FLOOR_H + 0.4, SZ);
      g.add(ring);
    }
    // 3F / 6F 电梯厅（连接展厅东墙与井道）
    for (const fy of [y0, y1]) {
      const lobbyFloor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 4.6), mats.floor);
      lobbyFloor.position.set(14.4, fy - 0.06, SZ);
      g.add(lobbyFloor);
      const lobbyCeil = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 4.6), mats.ceiling);
      lobbyCeil.position.set(14.4, fy + 3.1, SZ);
      g.add(lobbyCeil);
      for (const side of [-1, 1]) {
        const lw = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 0.25), mats.wall);
        lw.position.set(14.4, fy + 1.6, SZ + side * 2.15);
        g.add(lw);
      }
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.16), mats.ceilLight);
      lamp.position.set(14.4, fy + 3.02, SZ);
      g.add(lamp);
      // 楼层显示牌
      const sign = makeScreen(mats, 0.9, 0.5, (x, w, h) => {
        x.fillStyle = SCREEN_AURORA; x.font = '700 96px monospace';
        x.fillText(fy === y0 ? '3F' : '6F', 30, 105);
      }, { pw: 256, ph: 142 });
      sign.position.set(14.4, fy + 2.5, SZ - 2.0);
      g.add(sign);
    }
    // 玻璃轿厢
    const cab = new THREE.Group();
    const cabFloor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.14, 3.8), mats.metal);
    cabFloor.position.y = 0.07; cab.add(cabFloor);
    const cabCeil = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 3.8), mats.metal);
    cabCeil.position.y = 2.9; cab.add(cabCeil);
    const cabLamp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 2.8), mats.ceilLight);
    cabLamp.position.y = 2.83; cab.add(cabLamp);
    for (const side of [-1, 1]) {
      const gw = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.8, 0.05), mats.glass);
      gw.position.set(0, 1.5, side * 1.85); cab.add(gw);
    }
    const gwBack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 3.7), mats.glass);
    gwBack.position.set(1.45, 1.5, 0); cab.add(gwBack);
    const cabDoor = slidingDoor(mats, 2.5, 2.75);
    cabDoor.rotation.y = Math.PI / 2;
    cabDoor.position.set(-1.5, 0.12, 0);
    cab.add(cabDoor);
    const cabPt = new THREE.PointLight(0xffe0b8, 42, 8, 1.6);
    cabPt.position.set(0, 2.5, 0);
    cab.add(cabPt);
    cab.position.set(SX, y0, SZ);
    g.add(cab);
    dyn.elevatorCab = cab;
    dyn.elevatorDoor = cabDoor;
  }

  /* ================= 04 会议层（6F 演示中心） ================= */
  {
    const g = chGroup('meeting');
    const W = 27, CX = -1.5, D = 17, CZ = -3.5, Y = LV.F6, H = 3.8;
    slabWithHole(g, mats.floor, { w: W, d: D, t: 0.12, cx: CX, cz: CZ, y: Y - 0.06 });
    slabWithHole(g, mats.ceiling, { w: W, d: D, t: 0.12, cx: CX, cz: CZ, y: Y + H + 0.06 });
    ceilingLights(g, mats, Y + H, [-11, -6, -1, 4, 9], D / 2 * 0.78, true, CZ);

    // 墙体：西墙主屏；东墙开电梯口；北墙开中庭坡道门；南墙侧屏
    wallSegments(g, mats.wallWarm, { length: D, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(CX - W / 2, Y, CZ), rotY: Math.PI / 2 });
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [{ c: -0.5, w: 2.8, h: 3.0 }], pos: new THREE.Vector3(CX + W / 2, Y, CZ), rotY: Math.PI / 2 });
    wallSegments(g, mats.wall, { length: W, height: H, thick: 0.3, openings: [{ c: -6.5, w: 3.2, h: 3.2 }], pos: new THREE.Vector3(CX, Y, CZ + D / 2) });
    wallSegments(g, mats.wall, { length: W, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(CX, Y, CZ - D / 2) });

    // 主屏（HTML PPT，随滚动翻页 — 画布由 slides 模块重绘）
    const deck = makeScreen(mats, 8.8, 4.6, () => {}, { pw: 1440, ph: 752 });
    deck.position.set(CX - W / 2 + 0.25, Y + 2.55, CZ);
    deck.rotation.y = Math.PI / 2;
    g.add(deck);
    dyn.deckScreen = deck;

    // 侧屏 Agenda（南墙）
    const agenda = makeScreen(mats, 3.4, 3.2, () => {}, { pw: 560, ph: 528 });
    agenda.position.set(CX + 6, Y + 2.1, CZ - D / 2 + 0.2);
    g.add(agenda);
    dyn.agendaScreen = agenda;

    // 长桌 + 桌沿灯带 + 座椅
    const table = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.1, 2.6), mats.wood);
    table.position.set(-4, Y + 1.05, CZ);
    g.add(table);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 2.2), mats.metal);
      leg.position.set(-4 + side * 4.2, Y + 0.5, CZ);
      g.add(leg);
    }
    const tStrip = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.03, 0.05), mats.auroraStrip);
    tStrip.position.set(-4, Y + 1.11, CZ + 1.28);
    g.add(tStrip);
    for (let i = 0; i < 5; i++) {
      for (const side of [-1, 1]) {
        const chair = new THREE.Group();
        const seatM = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), mats.seat);
        seatM.position.y = 0.55; chair.add(seatM);
        const backM = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.08), mats.seat);
        backM.position.set(0, 0.95, side * 0.27); chair.add(backM);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.55), mats.metal);
        post.position.y = 0.28; chair.add(post);
        chair.position.set(-7.6 + i * 1.85, Y, CZ + side * 2.1);
        g.add(chair);
      }
    }

    const l1 = new THREE.PointLight(0xffe0b8, 140, 22, 1.8); l1.position.set(-4, Y + 3.2, CZ);
    const l2 = new THREE.PointLight(0xbfd8dc, 60, 18, 2); l2.position.set(6, Y + 3, CZ);
    g.add(l1, l2);
  }

  /* ============ 中庭坡道（6F → 9F，北侧圆形中庭） ============ */
  {
    const g = chGroup('ramp');
    const CX = -8, CZ = 9.0, R0 = 1.2, R1 = 2.9;
    const y0 = LV.F6, y1 = LV.F9;
    // 中庭砖筒（南向开口）
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(3.9, 3.9, y1 - y0 + 2.4, 30, 1, true, Math.PI * 1.25, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: 0x6b4038, roughness: 1, side: THREE.DoubleSide })
    );
    shaft.position.set(CX, (y0 + y1) / 2 + 0.6, CZ);
    g.add(shaft);
    // 顶盖
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.25, 30), mats.ceiling);
    cap.position.set(CX, y1 + 3.7, CZ);
    g.add(cap);
    // 中央结构柱
    const column = new THREE.Mesh(new THREE.CylinderGeometry(R0 - 0.3, R0 - 0.3, y1 - y0 + 3.6, 20), mats.brick);
    column.position.set(CX, (y0 + y1) / 2 + 1.2, CZ);
    g.add(column);
    // 螺旋坡道踏面（一整圈）
    const a0 = Math.PI * 1.5;
    const segs = 96;
    const helixPts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const a = a0 + t * Math.PI * 2;
      const y = y0 + (y1 - y0) * t;
      const rMid = (R0 + R1) / 2;
      const step = new THREE.Mesh(new THREE.BoxGeometry(R1 - R0, 0.1, 0.42), mats.metal);
      step.position.set(CX + Math.cos(a) * rMid, y, CZ + Math.sin(a) * rMid);
      step.rotation.y = -a + Math.PI / 2;
      g.add(step);
      helixPts.push(new THREE.Vector3(CX + Math.cos(a) * (R1 + 0.08), y + 1.05, CZ + Math.sin(a) * (R1 + 0.08)));
    }
    const railCurve = new THREE.CatmullRomCurve3(helixPts);
    const rail = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 140, 0.05, 6), mats.auroraStrip);
    g.add(rail);
    // 光照
    const skyLight = new THREE.PointLight(0xbfd8dc, 110, 20, 1.8);
    skyLight.position.set(CX, y1 + 2.6, CZ);
    g.add(skyLight);
    const warm = new THREE.PointLight(0xffe0b8, 70, 14, 1.8);
    warm.position.set(CX, (y0 + y1) / 2, CZ);
    g.add(warm);
  }

  /* ================= 05 互动实验室（9F 挑高） ================= */
  {
    const g = chGroup('lab');
    const W = 28, D = 16, CZ = -3.5, Y = LV.F9, H = 7.4;
    slabWithHole(g, mats.floor, { w: W, d: D, t: 0.12, cx: 0, cz: CZ, y: Y - 0.06 });
    slabWithHole(g, mats.ceiling, { w: W, d: D, t: 0.12, cx: 0, cz: CZ, y: Y + H + 0.06 });

    // 墙体：北墙两门（坡道入口 x=-8、放映走廊口 x=+9）
    wallSegments(g, mats.wall, {
      length: W, height: H, thick: 0.3,
      openings: [{ c: -8, w: 3.2, h: 3.2 }, { c: 9, w: 3.0, h: 3.0 }],
      pos: new THREE.Vector3(0, Y, CZ + D / 2),
    });
    wallSegments(g, mats.wallWarm, { length: W, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(0, Y, CZ - D / 2) });
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(-W / 2, Y, CZ), rotY: Math.PI / 2 });
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(W / 2, Y, CZ), rotY: Math.PI / 2 });

    // 背景大屏（南墙）
    const labScreen = makeScreen(mats, 10, 3.4, (x, w, h) => {
      drawKicker(x, 'CHAPTER 05 · THREE.JS LAB', 60, 80, 20);
      drawTitle(x, '当内容需要被操作，把 HTML 升级成模型', 60, 170, 46);
      drawBody(x, [
        '拖动旋转 · 滚轮缩放 · 点击切换材质与状态',
        '不需要写代码 —— 这些都是打开即用的 HTML 页面',
      ], 60, 250, 26, 1.9);
    }, { pw: 1500 });
    labScreen.position.set(0, Y + 4.6, CZ - D / 2 + 0.22);
    g.add(labScreen);

    // 展台（4 座弧形）
    const pedestals = [];
    const pedPos = [[-6.6, -6.0], [-2.2, -7.6], [2.2, -7.6], [6.6, -6.0]];
    pedPos.forEach(([px, pz]) => {
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 1.0, 28), mats.lightMetal);
      ped.position.set(px, Y + 0.5, pz);
      g.add(ped);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.035, 8, 40), mats.auroraStrip);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(px, Y + 1.01, pz);
      g.add(ring);
      const spot = new THREE.SpotLight(0xffffff, 90, 12, 0.5, 0.55, 2);
      spot.position.set(px, Y + H - 0.6, pz + 1.5);
      spot.target.position.set(px, Y + 1.6, pz);
      g.add(spot, spot.target);
      pedestals.push(new THREE.Vector3(px, Y + 1.0, pz));
    });
    dyn.labPedestals = pedestals;
    dyn.labGroup = g;

    // 工作台
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 7), mats.metal);
    bench.position.set(-13.0, Y + 0.45, CZ);
    g.add(bench);

    const l1 = new THREE.PointLight(0xdfe8ea, 110, 22, 1.9); l1.position.set(0, Y + 6.4, CZ);
    const l2 = new THREE.PointLight(0xffe0b8, 60, 16, 1.9); l2.position.set(-9, Y + 5, CZ + 4);
    g.add(l1, l2);
  }

  /* ======== 台阶走廊（9F 实验室 → 11F 放映厅，北侧夹层通道） ======== */
  {
    const g = chGroup('gallery-corridor');
    const y0 = LV.F9, y1 = LV.F11;
    const x0 = 9, x1 = -9, CZ = 8, CW = 3.4;
    const slope = Math.atan2(y1 - y0, x1 - x0); // 负角度（向西升高）
    // 入口平台（实验室北门外）
    const land0 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 4.5), mats.floor);
    land0.position.set(9, y0 - 0.06, 5.9);
    g.add(land0);
    const land0b = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 3.4), mats.floor);
    land0b.position.set(9, y0 - 0.06, CZ);
    g.add(land0b);
    // 台阶
    const steps = 46;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const step = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0) / steps + 0.08, 0.14, CW), mats.metal);
      step.position.set(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, CZ);
      g.add(step);
    }
    // 两侧墙（贴合坡度）
    const len = Math.hypot(x1 - x0, y1 - y0) + 4;
    for (const side of [-1, 1]) {
      const wallM = new THREE.Mesh(new THREE.BoxGeometry(len, 3.6, 0.25), mats.wall);
      wallM.position.set((x0 + x1) / 2, (y0 + y1) / 2 + 1.55, CZ + side * (CW / 2 + 0.12));
      wallM.rotation.z = Math.atan2(y1 - y0, x1 - x0) + Math.PI;
      g.add(wallM);
    }
    const corrCeil = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, CW + 0.5), mats.ceiling);
    corrCeil.position.set((x0 + x1) / 2, (y0 + y1) / 2 + 3.35, CZ);
    corrCeil.rotation.z = Math.atan2(y1 - y0, x1 - x0) + Math.PI;
    g.add(corrCeil);
    // 台阶两侧极光蓝地灯线
    for (const side of [-1, 1]) {
      const guide = new THREE.Mesh(new THREE.BoxGeometry(len - 2, 0.04, 0.06), mats.auroraStrip);
      guide.position.set((x0 + x1) / 2, (y0 + y1) / 2 + 0.14, CZ + side * (CW / 2 - 0.12));
      guide.rotation.z = Math.atan2(y1 - y0, x1 - x0) + Math.PI;
      g.add(guide);
    }
    // 出口平台（放映厅北门外）
    const land1 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 4.5), mats.floor);
    land1.position.set(-9, y1 - 0.06, 6.4);
    g.add(land1);
    // 海报灯箱
    const poster = makeScreen(mats, 2.0, 2.8, (x, w, h) => {
      x.fillStyle = '#0a0d0f'; x.fillRect(0, 0, w, h);
      drawKicker(x, 'NOW SHOWING', 40, 70, 16);
      x.fillStyle = SCREEN_FG; x.font = '700 64px monospace';
      x.fillText('HYPER', 40, 200); x.fillText('FRAMES', 40, 280);
      x.fillStyle = SCREEN_AURORA; x.font = '24px "PingFang SC",sans-serif';
      x.fillText('让同一份内容，获得时间', 40, 360);
      x.fillStyle = SCREEN_DIM; x.font = '18px monospace';
      x.fillText('T7 SCREENING ROOM · 11F', 40, h - 40);
    }, { pw: 440, ph: 610 });
    poster.position.set(0, (y0 + y1) / 2 + 1.8, CZ + CW / 2 + 0.04);
    poster.rotation.y = Math.PI;
    poster.rotation.z = Math.atan2(y1 - y0, x0 - x1);
    g.add(poster);
    const cl = new THREE.PointLight(0xffe0b8, 60, 13, 1.8);
    cl.position.set(0, (y0 + y1) / 2 + 2.9, CZ);
    g.add(cl);
    const cl2 = new THREE.PointLight(0xffe0b8, 40, 10, 1.8);
    cl2.position.set(-8, y1 + 2.6, 6.4);
    g.add(cl2);
  }

  /* ================= 06 放映厅（11F，银幕朝西侧观众） ================= */
  {
    const g = chGroup('cinema');
    const W = 26, CX = -2, D = 17, CZ = -3.5, Y = LV.F11, H = 7.2;
    slabWithHole(g, mats.floor, { w: W, d: D, t: 0.12, cx: CX, cz: CZ, y: Y - 0.06 });
    slabWithHole(g, mats.ceiling, { w: W, d: D, t: 0.12, cx: CX, cz: CZ, y: Y + H + 0.06 });

    // 墙体：东墙 = 银幕墙（旁开出口门 → 光井）；北墙开走廊入口；西墙、南墙实体
    wallSegments(g, mats.wall, { length: D, height: H, thick: 0.3, openings: [{ c: -6.9, w: 2.2, h: 2.7 }], pos: new THREE.Vector3(CX + W / 2, Y, CZ), rotY: Math.PI / 2 });
    wallSegments(g, mats.wallWarm, { length: D, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(CX - W / 2, Y, CZ), rotY: Math.PI / 2 });
    wallSegments(g, mats.wall, { length: W, height: H, thick: 0.3, openings: [{ c: -7, w: 3.2, h: 3.4 }], pos: new THREE.Vector3(CX, Y, CZ + D / 2) });
    wallSegments(g, mats.wall, { length: W, height: H, thick: 0.3, openings: [], pos: new THREE.Vector3(CX, Y, CZ - D / 2) });

    // 银幕（真实视频纹理，朝 -x 观众方向）
    const videoTex = new THREE.VideoTexture(videoEl);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 5.75),
      new THREE.MeshBasicMaterial({ map: videoTex, toneMapped: false })
    );
    screenMesh.position.set(CX + W / 2 - 0.28, Y + 3.35, CZ);
    screenMesh.rotation.y = -Math.PI / 2;
    g.add(screenMesh);
    dyn.cinemaScreen = screenMesh;
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 6.3, 10.9), mats.screenFrame);
    screenFrame.position.set(CX + W / 2 - 0.16, Y + 3.35, CZ);
    g.add(screenFrame);

    // 银幕上方跑马灯
    const marquee = makeScreen(mats, 6.5, 0.7, (x, w, h) => {
      x.fillStyle = SCREEN_AURORA; x.font = '600 42px monospace';
      x.fillText('HYPERFRAMES · NOW SHOWING', 60, 82);
    }, { pw: 1400, ph: 150 });
    marquee.position.set(CX + W / 2 - 0.3, Y + H - 0.55, CZ);
    marquee.rotation.y = -Math.PI / 2;
    g.add(marquee);

    // 阶梯座席（5 排，向西逐排升高，中央走道）
    for (let row = 0; row < 5; row++) {
      const rx = 3.2 - row * 2.6;               // 距银幕由近到远
      const ry = Y + row * 0.52;
      if (row > 0) {
        const riser = new THREE.Mesh(new THREE.BoxGeometry(2.6, row * 0.52, 14.5), mats.ceiling);
        riser.position.set(rx, Y + row * 0.26, CZ);
        g.add(riser);
      }
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 14), mats.auroraStrip);
      edge.position.set(rx + 1.28, ry + 0.04, CZ);
      g.add(edge);
      for (let sIdx = 0; sIdx < 8; sIdx++) {
        if (sIdx === 3 || sIdx === 4) continue; // 中央走道
        const chair = new THREE.Group();
        const seatM = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.6), mats.seat);
        seatM.position.y = 0.4; chair.add(seatM);
        const backM = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.85, 0.6), mats.seat);
        backM.position.set(-0.32, 0.68, 0); chair.add(backM);
        chair.position.set(rx, ry, CZ - 7.3 + 1.1 + sIdx * 1.8);
        g.add(chair);
      }
    }

    // 放映机 + 光束（克制体积光）
    const projector = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), mats.metal);
    projector.position.set(CX - W / 2 + 1.4, Y + 5.9, CZ);
    g.add(projector);
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(3.1, 20, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9fc8cc, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.rotation.z = -Math.PI / 2;
    beam.position.set(1, Y + 4.7, CZ);
    g.add(beam);

    // 壁灯
    for (const wz of [CZ - 7, CZ - 2.5, CZ + 2.5, CZ + 7]) {
      const sconce = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.16), mats.ceilLight);
      sconce.position.set(CX - W / 2 + 0.2, Y + 2.6, wz);
      g.add(sconce);
    }
    const dim = new THREE.PointLight(0x8a94a0, 30, 24, 1.8);
    dim.position.set(-2, Y + 5.6, CZ);
    g.add(dim);
  }

  /* ============ 光井楼梯（11F → 屋顶） ============ */
  {
    const g = chGroup('lightwell');
    const SX = 12.8, SZ = 3.4;
    const y0 = LV.F11, y1 = LV.ROOF;
    // 井壁
    for (const [dx, dz, w, d] of [[1.9, 0, 0.3, 5.0], [0, 2.5, 4.1, 0.3], [0, -2.5, 4.1, 0.3]]) {
      const wallM = new THREE.Mesh(new THREE.BoxGeometry(w, y1 - y0 + 3.2, d), mats.brick);
      wallM.position.set(SX + dx, (y0 + y1) / 2 + 1.1, SZ + dz);
      g.add(wallM);
    }
    // 西壁（门洞下方入口）
    wallSegments(g, mats.brick, {
      length: 5.0, height: y1 - y0 + 3.2, thick: 0.3,
      openings: [{ c: 0, w: 2.2, h: 2.7 }],
      pos: new THREE.Vector3(SX - 1.9, y0, SZ), rotY: Math.PI / 2,
    });
    // 井底地板
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.12, 4.8), mats.floor);
    base.position.set(SX, y0 - 0.06, SZ);
    g.add(base);
    // 螺旋踏步
    const stepsN = 34;
    for (let i = 0; i <= stepsN; i++) {
      const t = i / stepsN;
      const a = t * Math.PI * 3.5;
      const y = y0 + (y1 - y0) * t;
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.4), mats.metal);
      st.position.set(SX + Math.cos(a) * 0.8, y, SZ + Math.sin(a) * 0.8);
      st.rotation.y = -a;
      g.add(st);
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, y1 - y0 + 3), mats.metal);
    pole.position.set(SX, (y0 + y1) / 2 + 1, SZ);
    g.add(pole);
    // 垂直极光蓝导引光线
    for (const [dx, dz] of [[1.6, 1.9], [-1.6, -1.9], [1.6, -1.9], [-1.6, 1.9]]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.05, y1 - y0 + 2.4, 0.05), mats.auroraStrip);
      line.position.set(SX + dx, (y0 + y1) / 2 + 1, SZ + dz);
      g.add(line);
    }
    const wl = new THREE.PointLight(0x9adfe0, 70, 16, 1.7);
    wl.position.set(SX, y1 + 1, SZ);
    g.add(wl);
    const wl2 = new THREE.PointLight(0xffe0b8, 40, 10, 1.7);
    wl2.position.set(SX, y0 + 2.5, SZ);
    g.add(wl2);
    // 屋顶出口小楼（bulkhead），门朝西（-x）
    wallSegments(g, mats.brick, {
      length: 6.0, height: 3.2, thick: 0.3,
      openings: [{ c: 0, w: 1.8, h: 2.5 }],
      pos: new THREE.Vector3(SX - 2.3, y1, SZ), rotY: Math.PI / 2,
    });
    for (const [dx, dz, w, d] of [[2.3, 0, 0.3, 6.0], [0, 3, 4.9, 0.3], [0, -3, 4.9, 0.3]]) {
      const bw = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, d), mats.brick);
      bw.position.set(SX + dx, y1 + 1.6, SZ + dz);
      g.add(bw);
    }
    const bulkRoof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 6.6), mats.ceiling);
    bulkRoof.position.set(SX, y1 + 3.3, SZ);
    g.add(bulkRoof);
  }

  /* ================= 07 屋顶 ================= */
  {
    const g = chGroup('roof');
    const Y = LV.ROOF;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(26, 0.1, 22), mats.floor);
    deck.position.set(0, Y - 0.05, 0);
    g.add(deck);
    // 栏杆
    const railY = Y + 1.1;
    const perim = [[-12.5, -10.5, 12.5, -10.5], [-12.5, 10.5, 12.5, 10.5], [-12.5, -10.5, -12.5, 10.5], [12.5, -10.5, 12.5, 10.5]];
    for (const [ax, az, bx, bz] of perim) {
      const lenR = Math.hypot(bx - ax, bz - az);
      const vertical = Math.abs(bx - ax) < 0.1;
      const rail = new THREE.Mesh(new THREE.BoxGeometry(lenR, 0.06, 0.06), mats.metal);
      rail.position.set((ax + bx) / 2, railY, (az + bz) / 2);
      rail.rotation.y = vertical ? Math.PI / 2 : 0;
      g.add(rail);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(lenR, 0.03, 0.03), mats.auroraStrip);
      glow.position.set((ax + bx) / 2, railY - 0.18, (az + bz) / 2);
      glow.rotation.y = vertical ? Math.PI / 2 : 0;
      g.add(glow);
      const n = Math.floor(lenR / 1.6);
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), mats.metal);
        post.position.set(ax + (bx - ax) * t, Y + 0.55, az + (bz - az) * t);
        g.add(post);
      }
    }
    // 三个作业方向光柱装置
    const totems = [
      ['01', ['HTML', 'PPT'], '会讲故事的演示'],
      ['02', ['THREE', '.JS'], '可以操作的模型'],
      ['03', ['HYPER', 'FRAMES'], '自动播放的视频'],
    ];
    totems.forEach((tt, i) => {
      const tx = (i - 1) * 5.5, tz = 3.5;
      const totem = makeScreen(mats, 1.7, 3.2, (x, w, h) => {
        x.fillStyle = SCREEN_AURORA; x.font = '600 30px monospace';
        x.fillText(tt[0], 40, 80);
        x.fillStyle = SCREEN_FG; x.font = '700 52px monospace';
        tt[1].forEach((wd, wi) => x.fillText(wd, 40, 180 + wi * 64));
        x.fillStyle = SCREEN_DIM; x.font = '26px "PingFang SC",sans-serif';
        x.fillText(tt[2], 40, 400);
        x.fillStyle = SCREEN_AURORA;
        x.fillRect(40, h - 80, 60, 4);
      }, { pw: 340, ph: 640 });
      totem.position.set(tx, Y + 1.75, tz);
      totem.rotation.y = Math.PI;   // 面向南侧镜头
      g.add(totem);
      const baseM = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 0.7), mats.metal);
      baseM.position.set(tx, Y + 0.07, tz);
      g.add(baseM);
    });
    // 长椅
    for (const bx of [-8, 8]) {
      const benchM = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 0.8), mats.wood);
      benchM.position.set(bx, Y + 0.35, 8);
      g.add(benchM);
    }
    const rl = new THREE.PointLight(0xffe0b8, 170, 30, 1.9);
    rl.position.set(0, Y + 4.5, 4);
    g.add(rl);
    const rl2 = new THREE.PointLight(0x9adfe0, 70, 26, 1.9);
    rl2.position.set(-4, Y + 5, 10);
    g.add(rl2);
  }

  scene.add(root);

  /* ============ 章节可见性 ============ */
  const visibility = {
    lobby: [0, 1, 2], infohall: [1, 2, 3], elevator: [2, 3],
    meeting: [3, 4], ramp: [3, 4], lab: [4, 5], 'gallery-corridor': [4, 5],
    cinema: [5, 6], lightwell: [5, 6], roof: [5, 6],
  };
  function updateVisibility(chIdx) {
    for (const [key, grp] of Object.entries(chapterGroups)) {
      const vis = visibility[key] ? visibility[key].includes(chIdx) : true;
      if (grp.visible !== vis) grp.visible = vis;
    }
  }

  return { root, mats, dyn, chapterGroups, updateVisibility };
}
