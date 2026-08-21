// 会议层 HTML PPT：主屏随滚动逐步展开的幻灯片
import { drawKicker, drawTitle, drawBody, drawBars, SCREEN_AURORA, SCREEN_FG, SCREEN_DIM } from './textures.js';

const SLIDES = [
  {
    agenda: '01 封面与开场',
    draw(x, w, h, b) {
      x.fillStyle = SCREEN_AURORA; x.fillRect(80, 150, 70, 6);
      drawTitle(x, 'Q3 项目汇报', 80, 300, 96);
      drawTitle(x, '一次会讲故事的演示', 80, 400, 52, SCREEN_DIM);
      x.fillStyle = SCREEN_DIM; x.font = '26px monospace';
      x.fillText('HTML PRESENTATION · DEWU T7', 80, h - 90);
    },
  },
  {
    agenda: '02 为什么不是普通一页',
    draw(x, w, h, b) {
      drawKicker(x, '02 / WHY NOT ONE PAGE', 80, 110, 22);
      drawTitle(x, '一页放不下的时候', 80, 210, 64);
      const rows = [
        ['普通一页', '所有信息同时出现，读者自己找重点'],
        ['HTML PPT', '章节 · 节奏 · 层级 · 按演讲顺序逐步展开'],
      ];
      rows.forEach((r, i) => {
        if (b < (i + 1) / 2 - 0.01) return;
        const y = 300 + i * 150;
        x.fillStyle = i === 1 ? SCREEN_AURORA : SCREEN_DIM;
        x.font = '700 40px "PingFang SC",sans-serif';
        x.fillText(r[0], 80, y);
        x.fillStyle = SCREEN_FG; x.font = '30px "PingFang SC",sans-serif';
        x.fillText(r[1], 80, y + 52);
      });
    },
  },
  {
    agenda: '03 章节与节奏',
    draw(x, w, h, b) {
      drawKicker(x, '03 / STRUCTURE', 80, 110, 22);
      drawTitle(x, '给内容一个讲述顺序', 80, 210, 64);
      const chs = ['背景与目标', '关键数据', '方案与取舍', '里程碑与下一步'];
      chs.forEach((c, i) => {
        const on = b >= (i + 1) / chs.length - 0.01;
        const y = 300 + i * 92;
        x.fillStyle = on ? SCREEN_AURORA : 'rgba(141,146,150,0.35)';
        x.font = '700 36px monospace'; x.fillText(`0${i + 1}`, 80, y);
        x.fillStyle = on ? SCREEN_FG : 'rgba(141,146,150,0.35)';
        x.font = '34px "PingFang SC",sans-serif'; x.fillText(c, 170, y);
      });
    },
  },
  {
    agenda: '04 数据逐步展开',
    draw(x, w, h, b) {
      drawKicker(x, '04 / DATA', 80, 110, 22);
      drawTitle(x, '数据跟着讲述出现', 80, 210, 64);
      const vals = [0.35, 0.48, 0.42, 0.66, 0.72, 0.9];
      const shown = vals.map((v, i) => (i / vals.length < b ? v : 0.02));
      drawBars(x, 90, 260, w - 220, 320, shown);
      x.fillStyle = SCREEN_DIM; x.font = '24px monospace';
      x.fillText('APR    MAY    JUN    JUL    AUG    SEP', 130, h - 60);
    },
  },
  {
    agenda: '05 转化为视频',
    draw(x, w, h, b) {
      drawKicker(x, '05 / NEXT', 80, 110, 22);
      drawTitle(x, '同一份内容，还能继续走', 80, 210, 60);
      drawBody(x, [
        '这套演示本身就是一个 HTML 页面。',
        '接下来 —— 给它加上时间轴与旁白，',
        '它就能变成一段自动播放的视频。',
      ], 80, 300, 34, 1.9);
      x.fillStyle = SCREEN_AURORA; x.font = '600 30px monospace';
      x.fillText('NEXT FLOOR ↑ 9F LAB · 11F HYPERFRAMES', 80, h - 90);
    },
  },
];

export function createSlides(deckScreen, agendaScreen) {
  const dc = deckScreen.userData.ctx, dcv = deckScreen.userData.canvas;
  const ac = agendaScreen.userData.ctx, acv = agendaScreen.userData.canvas;
  let lastKey = '';

  function drawAgenda(active) {
    ac.fillStyle = '#0c0e10'; ac.fillRect(0, 0, acv.width, acv.height);
    ac.fillStyle = SCREEN_AURORA; ac.fillRect(46, 50, 34, 4);
    ac.font = '20px monospace'; ac.fillStyle = SCREEN_DIM;
    ac.fillText('AGENDA', 92, 58);
    SLIDES.forEach((s, i) => {
      ac.fillStyle = i === active ? SCREEN_AURORA : SCREEN_DIM;
      ac.font = `600 26px "PingFang SC",sans-serif`;
      ac.fillText(s.agenda, 46, 120 + i * 78);
      if (i === active) { ac.fillRect(30, 108 + i * 78, 5, 20); }
    });
    agendaScreen.userData.texture.needsUpdate = true;
  }

  return {
    update(sp) {
      // sp: 0..1 会议章节子进度 → 5 页 + 页内 build
      const f = Math.min(4.999, sp * 5);
      const idx = Math.floor(f);
      const build = f - idx;
      const key = `${idx}-${(build * 8) | 0}`;
      if (key === lastKey) return;
      lastKey = key;
      dc.fillStyle = '#0c0e10'; dc.fillRect(0, 0, dcv.width, dcv.height);
      // 页码
      dc.fillStyle = SCREEN_DIM; dc.font = '24px monospace';
      dc.fillText(`${idx + 1} / ${SLIDES.length}`, dcv.width - 130, dcv.height - 50);
      dc.fillStyle = 'rgba(1,194,195,0.5)';
      dc.fillRect(0, dcv.height - 6, dcv.width * ((idx + build) / SLIDES.length), 6);
      SLIDES[idx].draw(dc, dcv.width, dcv.height, build);
      deckScreen.userData.texture.needsUpdate = true;
      drawAgenda(idx);
    },
  };
}
