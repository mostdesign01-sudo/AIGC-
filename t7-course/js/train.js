// 悬浮列车：完整结构细节的未来通勤列车 + 环形轨道
// 车头 / 驾驶舱前窗 / 分段车窗 / 车门与门框 / 多节车厢 / 连接器
// 底盘 / 悬浮橇 / 车顶设备 / 受电弓 / 头灯 / 极光蓝灯带 / 车身编号
import * as THREE from 'three';
import { COLORS, TRACK } from './config.js';

const CAR_LEN = 11.5;
const CAR_W = 2.9;
const CAR_H = 3.1;

function makeNumberTexture(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 256, 64);
  x.fillStyle = '#9aa3a8';
  x.font = '600 40px "SF Mono", monospace';
  x.textBaseline = 'middle';
  x.fillText(text, 12, 34);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createTrain(scene) {
  const mats = {
    body: new THREE.MeshStandardMaterial({ color: 0xdfe3e6, metalness: 0.75, roughness: 0.28 }),
    bodyDark: new THREE.MeshStandardMaterial({ color: 0x24282c, metalness: 0.8, roughness: 0.35 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x0b1216, metalness: 0.9, roughness: 0.08,
      emissive: 0xffdca8, emissiveIntensity: 0.35,
    }),
    cabGlass: new THREE.MeshStandardMaterial({ color: 0x05090c, metalness: 0.9, roughness: 0.06 }),
    strip: new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: COLORS.aurora, emissiveIntensity: 2.4 }),
    headlight: new THREE.MeshStandardMaterial({ color: 0x2a2a20, emissive: 0xfff3d6, emissiveIntensity: 4 }),
    taillight: new THREE.MeshStandardMaterial({ color: 0x220808, emissive: 0xff3b30, emissiveIntensity: 2.5 }),
    underframe: new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: 0.6, roughness: 0.6 }),
    roofEq: new THREE.MeshStandardMaterial({ color: 0x8f969c, metalness: 0.7, roughness: 0.4 }),
  };

  /* ---------------- 单节车厢 ---------------- */
  function buildCar(kind /* 'head' | 'mid' | 'tail' */, index) {
    const car = new THREE.Group();
    const bodyLen = kind === 'mid' ? CAR_LEN : CAR_LEN - 2.2;

    // 车身主体（上部略窄，硬表面两段式）
    const lower = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, CAR_H * 0.52, CAR_W), mats.body);
    lower.position.y = CAR_H * 0.26;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(bodyLen, CAR_H * 0.44, CAR_W * 0.88), mats.body);
    upper.position.y = CAR_H * 0.52 + CAR_H * 0.22;
    car.add(lower, upper);
    // 车顶圆弧盖板
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(CAR_W * 0.44, CAR_W * 0.44, bodyLen, 20, 1, false, 0, Math.PI), mats.body);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.scale.y = 0.35;
    roof.position.y = CAR_H * 0.96;
    car.add(roof);

    // 分段车窗（带窗间柱）
    const winCount = kind === 'mid' ? 5 : 4;
    const winW = 1.35, winH = 0.78;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < winCount; i++) {
        const wx = (i - (winCount - 1) / 2) * (bodyLen / (winCount + 0.6));
        const win = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.04), mats.glass);
        win.position.set(wx, CAR_H * 0.68, side * (CAR_W * 0.44 + 0.01));
        car.add(win);
        // 窗框
        const wf = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.02), mats.bodyDark);
        wf.position.set(wx, CAR_H * 0.68, side * (CAR_W * 0.44));
        car.add(wf);
      }
      // 车门（每侧 1 樘，双开）+ 门框
      const doorX = bodyLen / 2 - 1.6;
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.15, 0.03), mats.bodyDark);
      doorFrame.position.set(doorX, CAR_H * 0.38, side * (CAR_W * 0.5 + 0.005));
      car.add(doorFrame);
      for (const dside of [-1, 1]) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.03), mats.body);
        leaf.position.set(doorX + dside * 0.37, CAR_H * 0.36, side * (CAR_W * 0.5 + 0.02));
        car.add(leaf);
        const dw = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.02), mats.glass);
        dw.position.set(doorX + dside * 0.37, CAR_H * 0.62, side * (CAR_W * 0.5 + 0.04));
        car.add(dw);
      }
      // 极光蓝识别灯带（车身裙边）
      const strip = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.94, 0.06, 0.03), mats.strip);
      strip.position.set(0, 0.36, side * (CAR_W * 0.5 + 0.01));
      car.add(strip);
    }

    // 底盘 + 裙板
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.96, 0.34, CAR_W * 0.86), mats.underframe);
    chassis.position.y = -0.14;
    car.add(chassis);
    // 悬浮橇（抱轨机构，前后各一组）
    for (const bx of [-bodyLen * 0.32, bodyLen * 0.32]) {
      const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, CAR_W * 0.95), mats.underframe);
      bogie.position.set(bx, -0.5, 0);
      car.add(bogie);
      for (const side of [-1, 1]) {
        const skid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.22), mats.bodyDark);
        skid.position.set(bx, -0.85, side * (CAR_W * 0.42));
        car.add(skid);
        // 悬浮磁体发光面
        const mag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.1), mats.strip);
        mag.position.set(bx, -1.2, side * (CAR_W * 0.36));
        car.add(mag);
      }
    }

    // 车顶设备：空调机组 + 走线槽
    const ac = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.32, 1.7), mats.roofEq);
    ac.position.set(-bodyLen * 0.18, CAR_H * 1.12, 0);
    car.add(ac);
    const duct = new THREE.Mesh(new THREE.BoxGeometry(bodyLen * 0.8, 0.1, 0.3), mats.bodyDark);
    duct.position.set(0, CAR_H * 1.06, 0.6);
    car.add(duct);

    // 受电弓 / 能源集电装置（仅第二节）
    if (index === 1) {
      const panto = new THREE.Group();
      const armMat = mats.bodyDark;
      const lowArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), armMat);
      lowArm.rotation.z = 0.8; lowArm.position.set(-0.3, 0.5, 0);
      const upArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3), armMat);
      upArm.rotation.z = -0.9; upArm.position.set(0.35, 1.15, 0);
      const contact = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 1.6), mats.roofEq);
      contact.position.set(0.8, 1.66, 0);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 1.4), mats.strip);
      glow.position.set(0.8, 1.72, 0);
      panto.add(lowArm, upArm, contact, glow);
      panto.position.set(bodyLen * 0.2, CAR_H * 1.05, 0);
      car.add(panto);
    }

    // 车头 / 车尾特殊结构
    if (kind === 'head' || kind === 'tail') {
      const nose = new THREE.Group();
      // 锥形整流罩（三段渐缩）
      const seg1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, CAR_H * 0.8, CAR_W * 0.92), mats.body);
      seg1.position.set(bodyLen / 2 + 0.6, CAR_H * 0.42, 0);
      const seg2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, CAR_H * 0.6, CAR_W * 0.74), mats.body);
      seg2.position.set(bodyLen / 2 + 1.55, CAR_H * 0.36, 0);
      const seg3 = new THREE.Mesh(new THREE.BoxGeometry(0.7, CAR_H * 0.34, CAR_W * 0.5), mats.bodyDark);
      seg3.position.set(bodyLen / 2 + 2.25, CAR_H * 0.28, 0);
      nose.add(seg1, seg2, seg3);
      // 驾驶舱前窗（倾斜黑玻璃）
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, CAR_W * 0.68), mats.cabGlass);
      cab.position.set(bodyLen / 2 + 0.95, CAR_H * 0.78, 0);
      cab.rotation.z = -0.42;
      nose.add(cab);
      // 头灯（双侧）与灯带回环
      for (const side of [-1, 1]) {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.5), kind === 'head' ? mats.headlight : mats.taillight);
        hl.position.set(bodyLen / 2 + 2.55, 0.55, side * CAR_W * 0.17);
        nose.add(hl);
      }
      const noseStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, CAR_W * 0.6), mats.strip);
      noseStrip.position.set(bodyLen / 2 + 1.2, 0.34, 0);
      nose.add(noseStrip);
      if (kind === 'tail') nose.rotation.y = Math.PI;
      car.add(nose);

      // 车身编号（克制的品牌识别）
      const numTex = makeNumberTexture(`DEWU · T7-0${index + 1}`);
      for (const side of [-1, 1]) {
        const plate = new THREE.Mesh(
          new THREE.PlaneGeometry(1.8, 0.45),
          new THREE.MeshBasicMaterial({ map: numTex, transparent: true, side: THREE.DoubleSide })
        );
        plate.position.set(-bodyLen * 0.28, CAR_H * 0.32, side * (CAR_W * 0.5 + 0.03));
        plate.rotation.y = side === 1 ? 0 : Math.PI;
        car.add(plate);
      }
      // 头灯照明（真实光源，仅车头）
      if (kind === 'head') {
        const beam = new THREE.SpotLight(0xfff3d6, 250, 40, 0.35, 0.5, 1.8);
        beam.position.set(bodyLen / 2 + 2.2, 0.8, 0);
        beam.target.position.set(bodyLen / 2 + 12, 0, 0);
        car.add(beam, beam.target);
      }
    } else {
      // 中部车厢编号
      const numTex = makeNumberTexture(`T7-0${index + 1}`);
      for (const side of [-1, 1]) {
        const plate = new THREE.Mesh(
          new THREE.PlaneGeometry(1.3, 0.32),
          new THREE.MeshBasicMaterial({ map: numTex, transparent: true, side: THREE.DoubleSide })
        );
        plate.position.set(0, CAR_H * 0.3, side * (CAR_W * 0.5 + 0.03));
        plate.rotation.y = side === 1 ? 0 : Math.PI;
        car.add(plate);
      }
    }
    return car;
  }

  /* ---------------- 轨道 ---------------- */
  const trackGroup = new THREE.Group();
  const R = TRACK.RADIUS, TH = TRACK.HEIGHT;
  // 主导轨梁（扁矩形截面）
  const beam = new THREE.Mesh(
    new THREE.TorusGeometry(R, 0.85, 4, 160),
    new THREE.MeshStandardMaterial({ color: 0x2b2e33, metalness: 0.75, roughness: 0.4 })
  );
  beam.rotation.x = Math.PI / 2;
  beam.scale.set(1, 1, 0.55);
  beam.position.y = TH - 1.6;
  trackGroup.add(beam);
  // 极光蓝导向灯带（轨道顶面双线）
  for (const dr of [-0.5, 0.5]) {
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(R + dr, 0.07, 6, 200),
      new THREE.MeshStandardMaterial({ color: 0x022a2a, emissive: COLORS.aurora, emissiveIntensity: 2.0 })
    );
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.y = TH - 1.1;
    trackGroup.add(glowRing);
  }
  // 支撑柱（避开建筑与入口方向）
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x232629, metalness: 0.5, roughness: 0.6 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 7) {
    const px = Math.cos(a) * R, pz = Math.sin(a) * R;
    if (Math.abs(px) < 40 && Math.abs(pz) < 26) continue;  // 楼体内不落柱
    if (pz > 30 && Math.abs(px) < 14) continue;            // 入口轴线不落柱
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, TH - 1.6, 10), pylonMat);
    pylon.position.set(px, (TH - 1.6) / 2, pz);
    trackGroup.add(pylon);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1.2), pylonMat);
    arm.position.set(px, TH - 1.85, pz);
    arm.lookAt(0, TH - 1.85, 0);
    trackGroup.add(arm);
  }

  /* ---------------- 编组 ---------------- */
  const trainGroup = new THREE.Group();
  const kinds = ['head', 'mid', 'mid', 'tail'];
  const cars = kinds.map((k, i) => {
    const car = buildCar(k, i);
    trainGroup.add(car);
    return car;
  });
  // 车厢连接器（风挡）
  const couplers = [];
  const couplerMat = new THREE.MeshStandardMaterial({ color: 0x0f1113, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const cp = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.1, 12), couplerMat);
    cp.rotation.z = Math.PI / 2;
    trainGroup.add(cp);
    couplers.push(cp);
  }

  scene.add(trackGroup, trainGroup);

  /* ---------------- 运行逻辑 ---------------- */
  const state = { angle: Math.PI * 0.35, speed: 0.021, paused: false };
  const gapA = (CAR_LEN + 1.2) / R; // 车厢间弧长差

  function placeCar(obj, a, yOff = 0) {
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    obj.position.set(x, TH + yOff, z);
    // 车头朝切线方向（逆时针运行）
    obj.rotation.y = -a - Math.PI / 2 + Math.PI;
  }

  function update(dt, reducedMotion) {
    const sp = reducedMotion ? state.speed * 0.25 : state.speed;
    state.angle -= sp * dt; // 逆时针
    cars.forEach((car, i) => {
      const a = state.angle + i * gapA;
      // 极轻微的悬浮起伏（真实重量感：低频小振幅）
      const bob = Math.sin(performance.now() * 0.0006 + i * 1.7) * 0.015;
      placeCar(car, a, bob);
    });
    couplers.forEach((cp, i) => {
      const a = state.angle + (i + 0.5) * gapA + 0.006;
      const x = Math.cos(a) * R, z = Math.sin(a) * R;
      cp.position.set(x, TH + CAR_H * 0.5, z);
      cp.rotation.y = -a;
    });
  }

  // 供音效模块查询车头世界位置
  function headPosition(out) {
    return out.copy(cars[0].position);
  }

  return { trainGroup, trackGroup, update, headPosition, state };
}
