// 克制克莱因蓝条：一行 kicker + 一句，贴底，不压画面
export const CHAPTER_DOM = [
  {
    key: 'exterior', show: [0.0, 0.09],
    html: `
    <div class="chapter-inner threshold">
      <div class="th-kicker">CHAPTER 00 — 门前 · DEWU T7</div>
      <h1 class="th-title"><span class="w" style="--i:0">走</span><span class="w" style="--i:1">进</span><span class="w" style="--i:2">&nbsp;</span><span class="w" style="--i:3">H</span><span class="w" style="--i:4">T</span><span class="w" style="--i:5">M</span><span class="w" style="--i:6">L</span></h1>
      <p class="th-sub">一份内容，三种交付 · 互联宝地 T7 · 19F</p>
      <div class="th-cue">滚动进入</div>
    </div>`,
  },
  {
    key: 'lobby', show: [0.20, 0.30],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">02 / 1F 门厅</div>
      <div class="kb-line">HTML 是可以打开的内容容器<span>文字 · 图 · 视频 · 数据 · 互动</span></div>
    </div>`,
  },
  {
    key: 'lift', show: [0.32, 0.40],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">直梯</div>
      <div class="kb-line">上行 19F<span>设计部与 CEO 都在这一层</span></div>
    </div>`,
  },
  {
    key: 'infohall', show: [0.42, 0.51],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">03 / 19F 设计部</div>
      <div class="kb-line">一页说清楚<span>周报 · 复盘 · 大字报 · 数据</span></div>
    </div>`,
  },
  {
    key: 'meeting', show: [0.52, 0.61],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">04 / 19F CEO 会议室</div>
      <div class="kb-line">HTML Presentation<span>章节、节奏，按讲述顺序展开</span></div>
    </div>`,
  },
  {
    key: 'lab', show: [0.63, 0.75],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">05 / 19F 设计工位</div>
      <div class="kb-line">产品演示嵌在工位屏上<span>拖动 · 换色 · 开箱</span></div>
    </div>`,
  },
  {
    key: 'cinema', show: [0.77, 0.86],
    html: `
    <div class="chapter-inner klein-bar">
      <div class="kb-kicker">06 / 19F 放映</div>
      <div class="kb-line">HyperFrames<span>同一份内容，获得时间</span></div>
    </div>`,
  },
  {
    key: 'roof', show: [0.88, 1.01],
    html: `
    <div class="chapter-inner klein-bar finale">
      <div class="kb-kicker">07 / RF 作业</div>
      <div class="kb-line">选一条路径，重新表达你的工作</div>
      <div class="finale-paths">
        <div class="path-card"><em>01</em>HTML PPT</div>
        <div class="path-card"><em>02</em>Three.js 互动</div>
        <div class="path-card"><em>03</em>HyperFrames</div>
      </div>
    </div>`,
  },
];

export function mountContent(container) {
  const els = CHAPTER_DOM.map(c => {
    const div = document.createElement('section');
    div.className = 'chapter';
    div.dataset.key = c.key;
    div.innerHTML = c.html;
    container.appendChild(div);
    return { ...c, el: div };
  });
  return {
    update(p) {
      for (const c of els) {
        const vis = p >= c.show[0] && p <= c.show[1];
        c.el.classList.toggle('visible', vis);
        if (c.key === 'exterior' && vis) {
          const t = 1 - Math.min(1, p / 0.085);
          c.el.style.opacity = String(t);
          c.el.style.filter = `blur(${(1 - t) * 10}px)`;
          c.el.style.transform = `translateY(${(1 - t) * -18}px)`;
        } else {
          c.el.style.opacity = '';
          c.el.style.filter = '';
          c.el.style.transform = '';
        }
      }
    },
  };
}
