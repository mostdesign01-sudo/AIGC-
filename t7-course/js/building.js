// T7 大楼：硬表面程序化建模
// 依据真实照片：中央 14 层主楼 + 两级退台翼楼 + 2 层裙房
// 红砖壁柱 + 竖向玻璃幕墙条 + 入口雨棚 + 屋顶设备层 + 得物 LOGO
import * as THREE from 'three';
import { B, COLORS } from './config.js';
import { makeBrickMaps, makeCurtainEmissive } from './textures.js';

const BRICK_TILE = 3.2; // 贴图对应的真实尺寸（米）

// 让 BoxGeometry 每个面的 UV 与真实尺寸成正比，保证砖块密度一致
function worldUV(geo, w, h, d, tile = BRICK_TILE) {
  const uv = geo.attributes.uv;
  const face = [
    [d / tile, h / tile], [d / tile, h / tile],   // +x -x
    [w / tile, d / tile], [w / tile, d / tile],   // +y -y
    [w / tile, h / tile], [w / tile, h / tile],   // +z -z
  ];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * face[f][0], uv.getY(i) * face[f][1]);
    }
  }
  uv.needsUpdate = true;
  return geo;
}

export function createBuilding() {
  const group = new THREE.Group();
  group.name = 'T7';

  const brickMaps = makeBrickMaps();
  const matBrick = new THREE.MeshStandardMaterial({
    map: brickMaps.map, roughnessMap: brickMaps.roughnessMap,
    roughness: 1.0, metalness: 0.02,
  });
  const matBrickDark = new THREE.MeshStandardMaterial({
    map: brickMaps.map, roughnessMap: brickMaps.roughnessMap,
    color: 0x8a7f78, roughness: 1.0, metalness: 0.02,
  });
  const matFrame = new THREE.MeshStandardMaterial({ color: COLORS.frame, roughness: 0.45, metalness: 0.85 });
  const matConcrete = new THREE.MeshStandardMaterial({ color: 0x2e3033, roughness: 0.9, metalness: 0.05 });

  // 幕墙材质：不透明 + 自发光窗格贴图 + 高金属度反射（避免透明排序问题，边缘锐利）
  const curtainCache = {};
  function curtainMat(floors, litRatio, variant) {
    const key = `${floors}-${litRatio}-${variant}`;
    if (!curtainCache[key]) {
      const em = makeCurtainEmissive(floors, litRatio);
      curtainCache[key] = new THREE.MeshStandardMaterial({
        color: 0x0c1116, metalness: 0.9, roughness: 0.18,
        emissive: 0xffffff, emissiveMap: em, emissiveIntensity: 1.35,
      });
    }
    return curtainCache[key];
  }

  function brickBox(w, h, d, x, y, z, mat = matBrick) {
    const g = worldUV(new THREE.BoxGeometry(w, h, d), w, h, d);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y + h / 2, z);
    group.add(m);
    return m;
  }

  /**
   * 构建一个体块：红砖壁柱 + 竖向幕墙条 + 檐口 + 勒脚
   * strips: {front, side} 每面玻璃条数量
   * hollow: 空壳（裙房：大厅位于其内部）
   * liftBase: 外壳从该标高开始（塔楼底部隐藏于裙房内，让位给大厅）
   */
  function buildBlock({ w, d, floors, x = 0, z = 0, stripsFront = 5, stripsSide = 3, litRatio = 0.55, skipFaces = [], hollow = false, liftBase = 0 }) {
    const h = floors * B.FLOOR_H;
    const lift = liftBase;
    const fh = h - lift;       // 外壳实际高度
    const block = new THREE.Group();
    block.position.set(x, 0, z);

    const PIL_D = 1.1;         // 壁柱厚度（凸出量）
    const GLASS_RECESS = 0.55; // 幕墙内凹
    const visFloors = Math.max(1, Math.round(fh / B.FLOOR_H));

    // 内核体（防止缝隙漏光；从内部看因背面剔除而不可见）
    if (!hollow) {
      const core = new THREE.Mesh(
        worldUV(new THREE.BoxGeometry(w - 0.4, fh, d - 0.4), w, fh, d),
        matBrick
      );
      core.position.y = lift + fh / 2;
      block.add(core);
    }

    // 每个立面：壁柱与幕墙条交替
    const faces = [
      { dir: 'z+', len: w, strips: stripsFront, cx: 0, cz: d / 2, rot: 0 },
      { dir: 'z-', len: w, strips: stripsFront, cx: 0, cz: -d / 2, rot: Math.PI },
      { dir: 'x+', len: d, strips: stripsSide, cx: w / 2, cz: 0, rot: Math.PI / 2 },
      { dir: 'x-', len: d, strips: stripsSide, cx: -w / 2, cz: 0, rot: -Math.PI / 2 },
    ];

    for (const f of faces) {
      if (skipFaces.includes(f.dir)) continue;
      const n = f.strips;
      const pilW = (f.len * 0.42) / (n + 1);       // 壁柱宽
      const glassW = (f.len - pilW * (n + 1)) / n; // 玻璃条宽
      const faceG = new THREE.Group();
      faceG.position.set(f.cx, 0, f.cz);
      faceG.rotation.y = f.rot;

      let cursor = -f.len / 2;
      for (let i = 0; i <= n; i++) {
        // 壁柱（凸出）
        const pil = new THREE.Mesh(
          worldUV(new THREE.BoxGeometry(pilW, fh, PIL_D), pilW, fh, PIL_D),
          matBrick
        );
        pil.position.set(cursor + pilW / 2, lift + fh / 2, PIL_D / 2 - 0.2);
        faceG.add(pil);
        cursor += pilW;
        if (i < n) {
          // 幕墙条（内凹，自发光窗格）
          const variant = i % 3;
          const glass = new THREE.Mesh(
            new THREE.BoxGeometry(glassW, fh - 1.6, 0.25),
            curtainMat(visFloors, litRatio, variant)
          );
          glass.position.set(cursor + glassW / 2, lift + (fh - 1.6) / 2 + 0.4, -GLASS_RECESS + 0.15);
          faceG.add(glass);
          // 窗框竖梃
          const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.14, fh - 1.6, 0.34), matFrame);
          mullion.position.set(cursor + glassW / 2, lift + (fh - 1.6) / 2 + 0.4, -GLASS_RECESS + 0.2);
          faceG.add(mullion);
          // 幕墙顶部过梁
          const lintel = new THREE.Mesh(
            worldUV(new THREE.BoxGeometry(glassW, 1.2, PIL_D * 0.8), glassW, 1.2, PIL_D),
            matBrick
          );
          lintel.position.set(cursor + glassW / 2, h - 0.6, PIL_D * 0.4 - 0.2);
          faceG.add(lintel);
          cursor += glassW;
        }
      }
      block.add(faceG);
    }

    // 檐口 + 女儿墙（顶部收头，照片中的线脚）
    const cornice = new THREE.Mesh(
      worldUV(new THREE.BoxGeometry(w + 1.0, 0.5, d + 1.0), w + 1, 0.5, d + 1),
      matBrickDark
    );
    cornice.position.y = h + 0.25;
    block.add(cornice);
    const parapet = new THREE.Mesh(
      worldUV(new THREE.BoxGeometry(w + 0.4, B.PARAPET, d + 0.4), w, B.PARAPET, d),
      matBrick
    );
    parapet.position.y = h + 0.5 + B.PARAPET / 2;
    block.add(parapet);

    // 勒脚（底部石材基座，仅落地体块）
    if (lift === 0) {
      const plinth = new THREE.Mesh(
        worldUV(new THREE.BoxGeometry(w + 0.6, 1.1, d + 0.6), w, 1.1, d),
        matConcrete
      );
      plinth.position.y = 0.55;
      block.add(plinth);
    }

    // 楼板顶面（屋面）
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, 0.3, d - 0.6), matConcrete);
    roofSlab.position.y = h + 0.15;
    block.add(roofSlab);

    group.add(block);
    return { block, h, w, d, x, z };
  }

  /* ------- 主楼（14 层，外壳自 3 层起，底部让位给挑高大厅） ------- */
  const LIFT = 2 * B.FLOOR_H; // 8.4
  buildBlock({
    w: B.TOWER_W, d: B.TOWER_D, floors: B.TOWER_FLOORS,
    stripsFront: 5, stripsSide: 3, litRatio: 0.62, liftBase: LIFT,
  });

  /* ------- 一级退台翼楼（10 层，左右） ------- */
  const wingOffset = B.TOWER_W / 2 + B.WING_W / 2 - 0.3;
  buildBlock({
    w: B.WING_W, d: B.WING_D, floors: B.WING_FLOORS,
    x: wingOffset, stripsFront: 2, stripsSide: 3, litRatio: 0.5, skipFaces: ['x-'], liftBase: LIFT,
  });
  buildBlock({
    w: B.WING_W, d: B.WING_D, floors: B.WING_FLOORS,
    x: -wingOffset, stripsFront: 2, stripsSide: 3, litRatio: 0.5, skipFaces: ['x+'], liftBase: LIFT,
  });

  /* ------- 二级退台（6 层，更外侧） ------- */
  const wing2Offset = B.TOWER_W / 2 + B.WING_W + 4.2 - 0.6;
  buildBlock({
    w: 8.6, d: 20, floors: 6, x: wing2Offset,
    stripsFront: 1, stripsSide: 2, litRatio: 0.42, skipFaces: ['x-'], liftBase: LIFT,
  });
  buildBlock({
    w: 8.6, d: 20, floors: 6, x: -wing2Offset,
    stripsFront: 1, stripsSide: 2, litRatio: 0.42, skipFaces: ['x+'], liftBase: LIFT,
  });

  /* ------- 低层裙房（2 层，横向展开，大网格玻璃） ------- */
  const podium = new THREE.Group();
  {
    const w = B.PODIUM_W, d = B.PODIUM_D, h = B.PODIUM_H;
    // 裙房分左右两段，中间留出入口开间
    const GATE_W = 13;
    const segW = (w - GATE_W) / 2;
    for (const side of [-1, 1]) {
      buildBlock({
        w: segW, d, floors: 2, x: side * (GATE_W / 2 + segW / 2),
        stripsFront: 4, stripsSide: 2, litRatio: 0.75,
        skipFaces: [side === 1 ? 'x-' : 'x+'],
        hollow: true,
      });
    }

    /* --- 入口开间：挑高玻璃门厅 + 雨棚 --- */
    const gate = new THREE.Group();
    gate.position.set(0, 0, 0);
    const gateD = d;
    const frontZ = d / 2;

    // 门洞两侧加厚砖墩
    for (const side of [-1, 1]) {
      const pierG = worldUV(new THREE.BoxGeometry(2.2, h, 2.4), 2.2, h, 2.4);
      const pier = new THREE.Mesh(pierG, matBrick);
      pier.position.set(side * (GATE_W / 2 - 1.1), h / 2, frontZ - 0.6);
      gate.add(pier);
    }
    // 门洞上方砖梁 + 楼名
    const beam = new THREE.Mesh(
      worldUV(new THREE.BoxGeometry(GATE_W, h - 7.4, 2.4), GATE_W, h - 7.4, 2.4),
      matBrick
    );
    beam.position.set(0, 7.4 + (h - 7.4) / 2, frontZ - 0.6);
    gate.add(beam);

    // 入口开间屋面补板（封闭大厅上空）
    const gateRoof = new THREE.Mesh(new THREE.BoxGeometry(GATE_W + 0.5, 0.3, d - 0.6), matConcrete);
    gateRoof.position.set(0, 2 * B.FLOOR_H + 0.15, 0);
    gate.add(gateRoof);

    // 雨棚：悬挑金属平板 + 灯槽
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(GATE_W - 1.4, 0.35, 4.6), matFrame);
    canopy.position.set(0, 5.6, frontZ + 1.9);
    gate.add(canopy);
    const canopyGlow = new THREE.Mesh(
      new THREE.BoxGeometry(GATE_W - 2.2, 0.06, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: COLORS.warmLight, emissiveIntensity: 1.6 })
    );
    canopyGlow.position.set(0, 5.4, frontZ + 1.9);
    gate.add(canopyGlow);
    // 雨棚吊杆
    for (const side of [-1, 1]) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6), matFrame);
      rod.position.set(side * (GATE_W / 2 - 2.4), 6.9, frontZ + 3.4);
      rod.rotation.z = side * 0.35;
      gate.add(rod);
    }

    // 玻璃门厅立面（透明，中间两扇滑动门）
    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x8fb6bd, metalness: 0, roughness: 0.05,
      transmission: 0.92, transparent: true, opacity: 1, thickness: 0.1,
      ior: 1.5, depthWrite: false,
    });
    const doorFrameMat = matFrame;
    const doorZ = frontZ - 1.6;
    // 固定侧窗
    for (const side of [-1, 1]) {
      const fixed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7.0, 0.08), doorGlassMat);
      fixed.position.set(side * (GATE_W / 2 - 3.0), 3.6, doorZ);
      gate.add(fixed);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7.0, 0.2), doorFrameMat);
      fr.position.set(side * (GATE_W / 2 - 4.6), 3.6, doorZ);
      gate.add(fr);
    }
    // 顶部玻璃横梁
    const transom = new THREE.Mesh(new THREE.BoxGeometry(GATE_W - 3, 0.25, 0.25), doorFrameMat);
    transom.position.set(0, 7.15, doorZ);
    gate.add(transom);

    // 滑动门（两扇，随镜头开启）
    const doorL = new THREE.Group(), doorR = new THREE.Group();
    for (const [g, side] of [[doorL, -1], [doorR, 1]]) {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(2.35, 6.8, 0.07), doorGlassMat);
      glass.position.set(side * 1.25, 3.5, 0);
      g.add(glass);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.18, 0.16), doorFrameMat);
      frame.position.set(side * 1.25, 6.85, 0); g.add(frame);
      const frameB = frame.clone(); frameB.position.y = 0.15; g.add(frameB);
      const frameS = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.8, 0.16), doorFrameMat);
      frameS.position.set(side * 2.45, 3.5, 0); g.add(frameS);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.2, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x111416, emissive: COLORS.aurora, emissiveIntensity: 0.8 })
      );
      handle.position.set(side * 0.25, 3.4, 0.1); g.add(handle);
      g.position.set(0, 0, doorZ);
      gate.add(g);
    }

    // 台阶
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(GATE_W + 2 + s * 1.4, 0.16, 1.2 + s * 0.9), matConcrete);
      step.position.set(0, 0.4 - s * 0.16, frontZ + 3.2 + s * 0.45);
      gate.add(step);
    }

    // 门厅内地面延伸（衔接大厅）
    podium.add(gate);
    group.add(podium);

    group.userData.doors = { left: doorL, right: doorR };
  }

  /* ------- 屋顶设备层 ------- */
  {
    const roofY = B.TOWER_H + 0.6;
    const pent = new THREE.Mesh(
      worldUV(new THREE.BoxGeometry(11, 3.4, 7), 11, 3.4, 7),
      matBrick
    );
    pent.position.set(-6, roofY + 1.7, -5);
    group.add(pent);
    const pentDoorMat = new THREE.MeshStandardMaterial({ color: 0x15181b, emissive: 0xffd9a6, emissiveIntensity: 0.35 });
    const pentDoor = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.1), pentDoorMat);
    pentDoor.position.set(-6, roofY + 1.2, -1.44);
    group.add(pentDoor);

    // 空调机组
    const acMat = new THREE.MeshStandardMaterial({ color: 0x44484d, roughness: 0.7, metalness: 0.5 });
    [[6, -7, 2.6, 1.4], [9, -3, 1.8, 1.1], [7.5, 2, 2.2, 1.2]].forEach(([x, z, w, h]) => {
      const ac = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), acMat);
      ac.position.set(x, roofY + h / 2, z);
      group.add(ac);
      const grill = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.28, w * 0.28, 0.08, 16), matFrame);
      grill.position.set(x, roofY + h + 0.04, z);
      group.add(grill);
    });

    // 天线桅杆 + 航空障碍灯
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 7), matFrame);
    mast.position.set(-6, roofY + 3.4 + 3.5, -5);
    group.add(mast);
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2222, emissiveIntensity: 2 })
    );
    beacon.position.set(-6, roofY + 10.6, -5);
    beacon.name = 'beacon';
    group.add(beacon);
  }

  /* ------- 得物 LOGO（真实素材，主楼正面顶部偏左） ------- */
  {
    const loader = new THREE.TextureLoader();
    const logoTex = loader.load('assets/brand/dewu-logo-white.png');
    logoTex.colorSpace = THREE.SRGBColorSpace;
    const logoMat = new THREE.MeshStandardMaterial({
      map: logoTex, transparent: true,
      emissive: 0xffffff, emissiveMap: logoTex, emissiveIntensity: 1.5,
      color: 0xffffff, roughness: 0.6,
    });
    const logoW = 7.4, logoH = logoW * 217 / 375;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(logoW, logoH), logoMat);
    // 正面顶部（照片：位于顶部砖墙面，偏左）
    logo.position.set(-8.2, B.TOWER_H - 3.4, B.TOWER_D / 2 + 1.02);
    group.add(logo);
    // 背面同位置（镜头绕行时可见品牌）
    const logoBack = logo.clone();
    logoBack.position.set(8.2, B.TOWER_H - 3.4, -B.TOWER_D / 2 - 1.02);
    logoBack.rotation.y = Math.PI;
    group.add(logoBack);
  }

  /* ------- 立面泛光灯（暖色洗墙） ------- */
  const uplights = new THREE.Group();
  [[-14, 22], [0, 24], [14, 22]].forEach(([x, z]) => {
    const sp = new THREE.SpotLight(0xffd0a0, 340, 95, 0.58, 0.65, 1.5);
    sp.position.set(x, 1, z + 6);
    sp.target.position.set(x * 0.7, 34, 8);
    uplights.add(sp, sp.target);
  });
  group.add(uplights);
  group.userData.uplights = uplights;

  // 开门控制（0 关 - 1 全开）
  group.userData.setDoorOpen = (t) => {
    const d = group.userData.doors;
    d.left.position.x = -t * 2.6;
    d.right.position.x = t * 2.6;
  };

  return group;
}
