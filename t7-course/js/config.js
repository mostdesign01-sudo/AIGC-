// 全局常量与章节配置
export const COLORS = {
  bg: 0x0a0b0d,
  aurora: 0x01c2c3,
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

// 建筑尺寸（米）
export const B = {
  FLOOR_H: 4.2,
  TOWER_FLOORS: 14,
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
B.TOWER_H = B.TOWER_FLOORS * B.FLOOR_H;          // 58.8
B.WING_H = B.WING_FLOORS * B.FLOOR_H;            // 42
B.PODIUM_H = B.PODIUM_FLOORS * B.FLOOR_H + 1.2;  // 9.6

// 列车轨道（参考图：更低更近，列车从楼前掠过）
export const TRACK = { RADIUS: 50, HEIGHT: 21, TILT: 0 };

// 章节进度区间（滚动 0-1）；anchor 为章节跳转的落位点
export const CHAPTERS = [
  { id: 1, key: 'exterior', name: 'T7 外景', en: 'ARRIVAL',       from: 0.000, to: 0.145, anchor: 0.02,  floor: 'GF · 广场' },
  { id: 2, key: 'lobby',    name: '入口大厅', en: 'THE CONTAINER', from: 0.145, to: 0.310, anchor: 0.24,  floor: '1F · 门厅' },
  { id: 3, key: 'infohall', name: '信息大厅', en: 'ONE PAGE',      from: 0.310, to: 0.470, anchor: 0.40,  floor: '3F · 数字展廊' },
  { id: 4, key: 'meeting',  name: '会议层',   en: 'PRESENTATION',  from: 0.470, to: 0.610, anchor: 0.55,  floor: '6F · 演示中心' },
  { id: 5, key: 'lab',      name: '互动实验室', en: 'INTERACTIVE',  from: 0.610, to: 0.750, anchor: 0.68,  floor: '9F · 实验室' },
  { id: 6, key: 'cinema',   name: '放映厅',   en: 'HYPERFRAMES',   from: 0.750, to: 0.870, anchor: 0.80,  floor: '11F · 放映厅' },
  { id: 7, key: 'roof',     name: '屋顶 · 作业', en: 'ROOFTOP',    from: 0.870, to: 1.001, anchor: 0.94,  floor: 'RF · 屋顶' },
];

export function chapterAt(p) {
  for (const c of CHAPTERS) if (p >= c.from && p < c.to) return c;
  return CHAPTERS[CHAPTERS.length - 1];
}

// 区间内插值工具
export function span(p, a, b) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
export function smooth(x) { return x * x * (3 - 2 * x); }
