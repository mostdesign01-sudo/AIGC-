// 19F CEO 会议室：克莱因蓝瑞士平面 HTML PPT，嵌在墙面主屏上
const KLEIN = '#002FA7';
const FG = '#ffffff';
const DIM = 'rgba(255,255,255,0.55)';
const HAIR = 'rgba(255,255,255,0.22)';

function kicker(x, text, px, py) {
  x.fillStyle = FG;
  x.font = '20px "SF Mono", ui-monospace, monospace';
  x.fillText(text, px, py);
  x.fillRect(px, py + 10, 36, 1);
}
function title(x, text, px, py, size = 64) {
  x.fillStyle = FG;
  x.font = `500 ${size}px "PingFang SC","Helvetica Neue",sans-serif`;
  x.fillText(text, px, py);
}
function body(x, text, px, py, size = 28) {
  x.fillStyle = DIM;
  x.font = `${size}px "PingFang SC","Helvetica Neue",sans-serif`;
  x.fillText(text, px, py);
}

const SLIDES = [
  {
    agenda: '01 开场',
    draw(x, w, h) {
      kicker(x, 'HTML PRESENTATION  ·  19F CEO', 80, 90);
      title(x, 'Q3 项目汇报', 80, 280, 92);
      body(x, '一次会讲故事的演示', 80, 360, 34);
      x.fillStyle = HAIR;
      x.fillRect(80, h - 120, w - 220, 1);
      body(x, 'DEWU T7', 80, h - 80, 22);
    },
  },
  {
    agenda: '02 为什么不是一页',
    draw(x, w, h, b) {
      kicker(x, '02  /  WHY NOT ONE PAGE', 80, 90);
      title(x, '一页放不下的时候', 80, 200, 58);
      const rows = [
        ['普通一页', '所有信息同时出现，读者自己找重点'],
        ['HTML PPT', '章节 · 节奏 · 层级 · 按讲述顺序展开'],
      ];
      rows.forEach((r, i) => {
        if (b < (i + 1) / 2 - 0.01) return;
        const y = 300 + i * 140;
        x.fillStyle = i === 1 ? FG : DIM;
        x.font = '500 36px "PingFang SC",sans-serif';
        x.fillText(r[0], 80, y);
        body(x, r[1], 80, y + 48, 26);
      });
    },
  },
  {
    agenda: '03 章节与节奏',
    draw(x, w, h, b) {
      kicker(x, '03  /  STRUCTURE', 80, 90);
      title(x, '给内容一个讲述顺序', 80, 200, 58);
      const chs = ['背景与目标', '关键数据', '方案与取舍', '里程碑与下一步'];
      chs.forEach((c, i) => {
        const on = b >= (i + 1) / chs.length - 0.01;
        const y = 290 + i * 86;
        x.fillStyle = on ? FG : 'rgba(255,255,255,0.28)';
        x.font = '500 28px monospace';
        x.fillText(`0${i + 1}`, 80, y);
        x.font = '400 32px "PingFang SC",sans-serif';
        x.fillText(c, 170, y);
      });
    },
  },
  {
    agenda: '04 数据',
    draw(x, w, h, b) {
      kicker(x, '04  /  DATA', 80, 90);
      title(x, '数据跟着讲述出现', 80, 200, 58);
      const vals = [0.35, 0.48, 0.42, 0.66, 0.72, 0.9];
      const n = vals.length;
      const px = 90, py = 280, bwArea = w - 220, bh = 280;
      const gap = bwArea / n, barW = gap * 0.42;
      x.strokeStyle = HAIR; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, py + bh); x.lineTo(px + bwArea, py + bh); x.stroke();
      vals.forEach((v, i) => {
        const shown = i / n < b ? v : 0.02;
        x.fillStyle = i === n - 1 ? FG : 'rgba(255,255,255,0.35)';
        const hh = bh * shown;
        x.fillRect(px + i * gap + (gap - barW) / 2, py + bh - hh, barW, hh);
      });
      body(x, 'APR    MAY    JUN    JUL    AUG    SEP', 110, h - 70, 20);
    },
  },
  {
    agenda: '05 下一步',
    draw(x, w, h) {
      kicker(x, '05  /  NEXT', 80, 90);
      title(x, '同一份内容，还能继续走', 80, 220, 54);
      body(x, '这套演示本身就是一个 HTML 页面。', 80, 320, 28);
      body(x, '加上时间轴与旁白，它就能自动播放。', 80, 368, 28);
      x.fillStyle = HAIR;
      x.fillRect(80, h - 120, w - 220, 1);
      body(x, 'NEXT  →  19F 工位 · 19F 放映', 80, h - 80, 22);
    },
  },
];

export function createSlides(deckScreen) {
  const dc = deckScreen.userData.ctx;
  const dcv = deckScreen.userData.canvas;
  let lastKey = '';

  return {
    update(sp) {
      const f = Math.min(4.999, sp * 5);
      const idx = Math.floor(f);
      const build = f - idx;
      const key = `${idx}-${(build * 8) | 0}`;
      if (key === lastKey) return;
      lastKey = key;
      dc.fillStyle = KLEIN;
      dc.fillRect(0, 0, dcv.width, dcv.height);
      dc.fillStyle = DIM;
      dc.font = '20px monospace';
      dc.fillText(`${idx + 1} / ${SLIDES.length}`, dcv.width - 130, 56);
      dc.fillStyle = 'rgba(255,255,255,0.35)';
      dc.fillRect(0, dcv.height - 4, dcv.width * ((idx + build) / SLIDES.length), 4);
      SLIDES[idx].draw(dc, dcv.width, dcv.height, build);
      deckScreen.userData.texture.needsUpdate = true;
    },
  };
}
