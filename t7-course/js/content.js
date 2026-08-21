// 章节 DOM 文字层：文字放置在两侧/底部，不遮挡建筑与案例
// 每章有独立的显示窗口（比章节区间略窄，转场时收起）
export const CHAPTER_DOM = [
  {
    key: 'exterior', show: [0.0, 0.095],
    html: `
    <div class="chapter-inner hero-inner">
      <div class="hero-eyebrow">DEWU · 互联宝地 T7 · AI 通识课</div>
      <h1 class="hero-title">走进 HTML<br><span class="hl">一份内容，三种交付</span></h1>
      <p class="hero-sub">同一份工作内容 —— 可以是一页展示、一套会讲故事的演示、<br>一个可以操作的模型，也可以成为一段自动播放的视频。</p>
    </div>`,
  },
  {
    key: 'lobby', show: [0.165, 0.24],
    html: `
    <div class="chapter-inner pos-right">
      <div class="ch-kicker">CHAPTER 02 · 入口大厅</div>
      <h2 class="ch-title">什么是 <span class="hl">HTML</span></h2>
      <p class="ch-body">把它理解为一个<strong>可以在浏览器中打开的内容容器</strong>。它可以同时承载文字、图片、视频、动画、数据和互动。<br><br>先不用管它怎么写 —— 先看看它<span class="hl">能做到什么</span>。</p>
    </div>`,
  },
  {
    key: 'infohall', show: [0.295, 0.385],
    html: `
    <div class="chapter-inner pos-right">
      <div class="ch-kicker">CHAPTER 03 · 信息大厅 · 3F</div>
      <h2 class="ch-title">一页<span class="hl">说清楚</span></h2>
      <p class="ch-body">日常工作里的大多数内容，<strong>一页就够了</strong>：</p>
      <ul class="ch-list">
        <li>会议总结 · 项目复盘 · 周报</li>
        <li>经营大字报 · 数据展示</li>
        <li>活动说明 · 简单工作汇报</li>
      </ul>
      <p class="ch-body" style="margin-top:14px">发出去的不再是截图和附件，<br>而是一个<span class="hl">可以打开的链接</span>。</p>
    </div>`,
  },
  {
    key: 'meeting', show: [0.475, 0.545],
    html: `
    <div class="chapter-inner pos-right">
      <div class="ch-kicker">CHAPTER 04 · 会议层 · 6F</div>
      <h2 class="ch-title">HTML <span class="hl">Presentation</span></h2>
      <p class="ch-body">当内容变多、变长，一页放不下 ——<br>给它<strong>章节、节奏和信息层级</strong>。</p>
      <ul class="ch-list">
        <li>多章节内容 · 项目汇报 · 经营分析</li>
        <li>课程演示 · 品牌发布 · 叙事型提案</li>
      </ul>
      <p class="ch-body" style="margin-top:14px">它和普通一页的区别：<span class="hl">逐步展开，按演讲的顺序讲</span>。<br>继续滚动，看主屏如何翻页。</p>
    </div>`,
  },
  {
    key: 'lab', show: [0.62, 0.70],
    html: `
    <div class="chapter-inner pos-right">
      <div class="ch-kicker">CHAPTER 05 · 互动实验室 · 9F</div>
      <h2 class="ch-title">Three.js <span class="hl">互动模型</span></h2>
      <p class="ch-body">当内容需要被<strong>观察、探索和操作</strong>，<br>把 HTML 升级成三维互动体验。<br><br>试试展台上的案例：<span class="hl">拖动旋转、滚轮缩放、点击切换</span>。<br>依然不需要写一行代码。</p>
    </div>`,
  },
  {
    key: 'cinema', show: [0.748, 0.83],
    html: `
    <div class="chapter-inner pos-top-center" style="max-width:640px">
      <div class="ch-kicker" style="justify-content:center">CHAPTER 06 · 放映厅 · 11F</div>
      <h2 class="ch-title" style="font-size:clamp(22px,2.4vw,34px)">HyperFrames：让同一份内容<span class="hl">获得时间</span></h2>
      <p class="ch-body">页面 + 时间轴 + 转场 + 音乐 + 旁白 = 一段可以自动播放的视频。<br>同一份 HTML，不用重新制作，继续复用。</p>
    </div>`,
  },
  {
    key: 'roof', show: [0.895, 1.01],
    html: `
    <div class="chapter-inner finale-inner">
      <div class="ch-kicker" style="justify-content:center">CHAPTER 07 · 屋顶 · 最终作业</div>
      <h2 class="ch-title">把你自己的工作内容，<br>选择一种方式<span class="hl">重新表达</span></h2>
      <div class="finale-paths">
        <div class="path-card">
          <div class="path-num">PATH 01</div>
          <div class="path-name">HTML PPT</div>
          <div class="path-desc">给内容章节与节奏，<br>做一次会讲故事的演示</div>
        </div>
        <div class="path-card">
          <div class="path-num">PATH 02</div>
          <div class="path-name">Three.js 互动页</div>
          <div class="path-desc">让内容可以被旋转、<br>点击、探索</div>
        </div>
        <div class="path-card">
          <div class="path-num">PATH 03</div>
          <div class="path-name">HyperFrames 视频</div>
          <div class="path-desc">加上时间轴与旁白，<br>让它自动播放</div>
        </div>
      </div>
      <p class="finale-note">作业支持课后完成与提交 · 不要求现场使用电脑 · 选一条你最想走的路径就好<br><span style="color:var(--aurora)">一份内容，三种交付 —— 从今天开始，换一种方式表达工作。</span></p>
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
      }
    },
  };
}
