// Ember Court — procedural sound.
// One job: every sound the game makes, synthesised with WebAudio. No audio
// files, no network. The context is created on the first user gesture.

let ctx = null;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click() { tone(660, 0.07, 'triangle', 0.12); },
  playCard() { tone(520, 0.09, 'triangle', 0.16); tone(780, 0.12, 'sine', 0.10, 0.05); },
  damage() { tone(180, 0.22, 'sawtooth', 0.16, 0, 70); },
  guard() { tone(340, 0.14, 'sine', 0.14); tone(510, 0.16, 'sine', 0.10, 0.06); },
  heal() { tone(440, 0.12, 'sine', 0.12); tone(660, 0.18, 'sine', 0.10, 0.08); },
  ember() { tone(880, 0.08, 'square', 0.06); tone(1170, 0.10, 'square', 0.05, 0.05); },
  turn() { tone(392, 0.10, 'triangle', 0.10); tone(523, 0.12, 'triangle', 0.10, 0.07); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.14, i * 0.11));
  },
  loss() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.32, 'sawtooth', 0.09, i * 0.14));
  },
};
