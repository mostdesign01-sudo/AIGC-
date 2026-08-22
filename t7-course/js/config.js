// 全局常量与章节配置
export const COLORS = {
  bg: 0x0a0b0d,
  aurora: 0x01c2c3,
  klein: 0x002fa7,
  brick: 0x87473a,
  brickDark: 0x6e3a2f,
  mortar: 0x4a413c,
  glassTint: 0x1a2228,
  frame: 0x23262a,
  warmLight: 0xffd9a6,
  warmDim: 0xcfa878,
  concrete: 0x3a3d40,
  metal: 0x55595e,
  textWhite: 0xe8e6e1,
};

export const STILL_SIZE = { w: 1536, h: 864 };

// 把互动嵌进静帧里的屏幕（图内 0–1 UV；cover 映射到视口）
export const DIEGETIC = {
  meeting: { rect: [0.355, 0.175, 0.675, 0.455] },
  lab:     { rect: [0.335, 0.195, 0.705, 0.555] },
  cinema:  { rect: [0.195, 0.175, 0.805, 0.575] },
};

export const B = {
  FLOOR_H: 4.2,
  TOWER_FLOORS: 19,
  TOWER_W: 30,
  TOWER_D: 26,
  WING_FLOORS: 10,
  WING_W: 11.5,
  WING_D: 23,
  PODIUM_FLOORS: 2,
  PODIUM_W: 54,
  PODIUM_D: 36,
  PARAPET: 1.4,
};
B.TOWER_H = B.TOWER_FLOORS * B.FLOOR_H;
B.WING_H = B.WING_FLOORS * B.FLOOR_H;
B.PODIUM_H = B.PODIUM_FLOORS * B.FLOOR_H + 1.2;

export const TRACK = { RADIUS: 50, HEIGHT: 21, TILT: 0 };

// 得物 T7：只有直梯。设计部与 CEO 都在 19F。
export const CHAPTERS = [
  { id: 1, key: 'exterior', name: 'T7 外景',     en: 'ARRIVAL',      from: 0.000, to: 0.145, anchor: 0.02,  floor: 'GF · 广场' },
  { id: 2, key: 'lobby',    name: '入口大厅',     en: 'THE CONTAINER', from: 0.145, to: 0.330, anchor: 0.24,  floor: '1F · 门厅' },
  { id: 3, key: 'infohall', name: '19F 设计部',   en: 'ONE PAGE',     from: 0.330, to: 0.490, anchor: 0.44,  floor: '19F · 设计部' },
  { id: 4, key: 'meeting',  name: 'CEO 会议室',   en: 'PRESENTATION', from: 0.490, to: 0.620, anchor: 0.55,  floor: '19F · CEO' },
  { id: 5, key: 'lab',      name: '设计工位',     en: 'INTERACTIVE',  from: 0.620, to: 0.760, anchor: 0.69,  floor: '19F · 工位' },
  { id: 6, key: 'cinema',   name: '放映',         en: 'HYPERFRAMES',  from: 0.760, to: 0.870, anchor: 0.81,  floor: '19F · 放映' },
  { id: 7, key: 'roof',     name: '屋顶 · 作业',  en: 'ROOFTOP',      from: 0.870, to: 1.001, anchor: 0.94,  floor: 'RF · 屋顶' },
];

export function chapterAt(p) {
  for (const c of CHAPTERS) if (p >= c.from && p < c.to) return c;
  return CHAPTERS[CHAPTERS.length - 1];
}

export function floorAt(p) {
  if (p >= 0.30 && p < 0.41) return '直梯 · 前往 19F';
  return chapterAt(p).floor;
}

export function span(p, a, b) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
export function smooth(x) { return x * x * (3 - 2 * x); }
