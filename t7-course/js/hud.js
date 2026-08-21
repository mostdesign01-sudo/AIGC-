// HUD：章节导航 / 楼层显示 / 声音 / 画质 / 动效 / 返回顶部 / 键盘控制
import { CHAPTERS, chapterAt } from './config.js';

export function createHUD(scroll, audio, settings) {
  const nav = document.getElementById('chapter-nav');
  const lineFill = document.getElementById('nav-line-fill');
  const hudChapter = document.getElementById('hud-chapter');
  const hudFloor = document.getElementById('hud-floor');
  const cue = document.getElementById('scroll-cue');

  // 章节圆点
  const items = CHAPTERS.map((c) => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.setAttribute('aria-label', c.name);
    btn.innerHTML = `<span class="nav-label">0${c.id} ${c.name}</span><span class="nav-dot"></span>`;
    btn.addEventListener('click', () => scroll.goTo(c.from + 0.004));
    nav.appendChild(btn);
    return btn;
  });

  // 顶部按钮
  const btnAudio = document.getElementById('btn-audio');
  const btnPerf = document.getElementById('btn-perf');
  const btnMotion = document.getElementById('btn-motion');
  const btnTop = document.getElementById('btn-top');

  btnAudio.addEventListener('click', () => {
    const on = audio.toggle();
    btnAudio.textContent = on ? '声音 开' : '声音 关';
    btnAudio.classList.toggle('on', on);
  });
  btnPerf.addEventListener('click', () => {
    settings.lowPerf = !settings.lowPerf;
    btnPerf.textContent = settings.lowPerf ? '画质 低' : '画质 高';
    btnPerf.classList.toggle('on', settings.lowPerf);
    settings.onQualityChange();
  });
  btnMotion.addEventListener('click', () => {
    settings.reducedMotion = !settings.reducedMotion;
    btnMotion.textContent = settings.reducedMotion ? '动效 少' : '动效 全';
    btnMotion.classList.toggle('on', settings.reducedMotion);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  });
  btnTop.addEventListener('click', () => scroll.goTo(0));

  // 初始状态按钮文案
  if (settings.lowPerf) { btnPerf.textContent = '画质 低'; btnPerf.classList.add('on'); }
  if (settings.reducedMotion) { btnMotion.textContent = '动效 少'; btnMotion.classList.add('on'); document.body.classList.add('reduced-motion'); }

  // 键盘：↑↓ 微调 / PgUp PgDn 章节 / Home 顶部 / End 屋顶
  window.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const p = scroll.target;
    const ch = chapterAt(p);
    const idx = CHAPTERS.indexOf(ch);
    switch (e.key) {
      case 'ArrowDown': scroll.nudge(0.006); e.preventDefault(); break;
      case 'ArrowUp': scroll.nudge(-0.006); e.preventDefault(); break;
      case 'PageDown':
      case 'ArrowRight':
        if (idx < CHAPTERS.length - 1) scroll.goTo(CHAPTERS[idx + 1].from + 0.004);
        e.preventDefault(); break;
      case 'PageUp':
      case 'ArrowLeft':
        if (p - ch.from > 0.02) scroll.goTo(ch.from + 0.004);
        else if (idx > 0) scroll.goTo(CHAPTERS[idx - 1].from + 0.004);
        e.preventDefault(); break;
      case 'Home': scroll.goTo(0); e.preventDefault(); break;
      case 'End': scroll.goTo(1); e.preventDefault(); break;
    }
  });

  let lastIdx = -1;
  return {
    update(p, floorLabel) {
      const ch = chapterAt(p);
      const idx = CHAPTERS.indexOf(ch);
      if (idx !== lastIdx) {
        lastIdx = idx;
        hudChapter.textContent = `0${ch.id} / ${ch.name}`;
        items.forEach((el, i) => el.classList.toggle('active', i === idx));
        audio.chapterTick();
      }
      hudFloor.textContent = floorLabel || ch.floor;
      lineFill.style.height = `${(p * 100).toFixed(1)}%`;
      cue.classList.toggle('show', p < 0.02);
      return idx;
    },
  };
}
