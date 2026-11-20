// 空间环境音（WebAudio 合成，无音频文件依赖）
// 环境底噪 + 列车经过声 + 电梯/门厅提示音，默认关闭
export function createAudio() {
  let ctx = null, master = null;
  let padGain = null, trainGain = null, trainFilter = null;
  let enabled = false;

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // 低频环境底噪（建筑夜晚的空气感）
    const noiseLen = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < noiseLen; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass'; nf.frequency.value = 220;
    padGain = ctx.createGain(); padGain.gain.value = 0.16;
    noise.connect(nf).connect(padGain).connect(master);
    noise.start();

    // 轻微和声垫（两枚低音正弦）
    for (const [f, g] of [[54, 0.035], [81.5, 0.02]]) {
      const o = ctx.createOscillator();
      o.frequency.value = f; o.type = 'sine';
      const og = ctx.createGain(); og.gain.value = g;
      o.connect(og).connect(master);
      o.start();
    }

    // 列车经过声（滤波噪声，由距离控制）
    const tn = ctx.createBufferSource();
    tn.buffer = buf; tn.loop = true; tn.playbackRate.value = 1.7;
    trainFilter = ctx.createBiquadFilter();
    trainFilter.type = 'bandpass'; trainFilter.frequency.value = 500; trainFilter.Q.value = 0.8;
    trainGain = ctx.createGain(); trainGain.gain.value = 0;
    tn.connect(trainFilter).connect(trainGain).connect(master);
    tn.start();
  }

  function chime(freqs, dur = 0.5, vol = 0.12) {
    if (!enabled || !ctx) return;
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0 + i * 0.12);
      g.gain.linearRampToValueAtTime(vol, t0 + i * 0.12 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + dur);
      o.connect(g).connect(master);
      o.start(t0 + i * 0.12);
      o.stop(t0 + i * 0.12 + dur + 0.1);
    });
  }

  return {
    get enabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      if (enabled) {
        ensure();
        if (ctx.state === 'suspended') ctx.resume();
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.2);
      } else if (ctx) {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      return enabled;
    },
    // dist: 相机到列车距离
    updateTrain(dist) {
      if (!enabled || !trainGain) return;
      const v = Math.max(0, 1 - dist / 90);
      trainGain.gain.value = v * v * 0.5;
      trainFilter.frequency.value = 300 + v * 900;
    },
    elevatorDing() { chime([880, 1174.6], 0.6, 0.1); },
    doorChime() { chime([659.2], 0.4, 0.08); },
    chapterTick() { chime([1318.5], 0.18, 0.045); },
  };
}
