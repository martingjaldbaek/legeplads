/* Shared toolkit for all games: random helpers, synthesized sound, Danish speech, confetti.
 * Games receive this module as `kit` in start(root, kit).
 */

/* ---------- helpers ---------- */
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
export const COLORS = ['#ff3b6b', '#ff8a00', '#ffc400', '#2ec4b6', '#3a86ff', '#8338ec', '#06d6a0', '#f15bb5', '#00a6fb', '#e85d04'];

/* ---------- audio (Web Audio, everything synthesized: no files to load) ---------- */
let ac = null, master = null, unlocked = false;

export function audio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.85;
    master.connect(ac.destination);
  }
  // iOS suspends/interrupts the context when the app is backgrounded; resume on every gesture.
  if (ac.state !== 'running') ac.resume().catch(() => {});
  return ac;
}

/** Call from inside a tap handler. iOS only allows sound after a user gesture. */
export function unlock() {
  // Play as media, so the sound isn't muted by the silent switch (Safari 16.4+).
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  const a = audio();
  if (unlocked) return;
  unlocked = true;
  const src = a.createBufferSource();
  src.buffer = a.createBuffer(1, 1, 22050);
  src.connect(a.destination);
  src.start(0);
  if (window.speechSynthesis) {            // warm up speech inside the gesture as well
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

export function tone(freq, { at = 0, dur = 0.3, type = 'sine', vol = 0.2, slide = null, attack = 0.008 } = {}) {
  const a = audio(), t = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let noiseBuf = null;
export function noise({ at = 0, dur = 0.08, vol = 0.15, freq = 3000, q = 1 } = {}) {
  const a = audio();
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + at;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf;
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

/** Major pentatonic: any combination of steps sounds nice together. */
const PENTA = [0, 2, 4, 7, 9];
export function scaleHz(step, base = 523.25) {
  const oct = Math.floor(step / 5), n = PENTA[((step % 5) + 5) % 5];
  return base * Math.pow(2, oct + n / 12);
}

export const sfx = {
  pop(step = 5) {
    const f = scaleHz(step, 261.63);
    tone(f * 2, { dur: 0.09, vol: 0.3, slide: f });
    noise({ dur: 0.05, vol: 0.12, freq: 2500 });
    tone(f, { at: 0.03, dur: 0.3, type: 'triangle', vol: 0.12 });
  },
  blip(step = 7) { tone(scaleHz(step), { dur: 0.14, type: 'triangle', vol: 0.15 }); },
  pickUp() { tone(440, { dur: 0.12, type: 'triangle', vol: 0.12, slide: 660 }); },
  snap() {
    noise({ dur: 0.04, vol: 0.25, freq: 1200 });
    [0, 2, 4].forEach((s, i) => tone(scaleHz(s + 5), { at: 0.04 + i * 0.07, dur: 0.35, type: 'triangle', vol: 0.16 }));
  },
  boing() { tone(330, { dur: 0.35, type: 'triangle', vol: 0.16, slide: 170 }); },
  chime() {
    [0, 2, 4, 5].forEach((s, i) => tone(scaleHz(s + 5), { at: i * 0.08, dur: 0.5, type: 'triangle', vol: 0.15 }));
    tone(scaleHz(12), { at: 0.34, dur: 0.7, vol: 0.08 });
  },
  fanfare() {
    [0, 2, 4, 5, 7, 10].forEach((s, i) => tone(scaleHz(s + 5), { at: i * 0.1, dur: 0.5, type: 'triangle', vol: 0.16 }));
    tone(scaleHz(15), { at: 0.6, dur: 1.2, vol: 0.12 });
    tone(scaleHz(10), { at: 0.6, dur: 1.2, type: 'triangle', vol: 0.08 });
  },
};

/* ---------- speech (on-device Danish voice) ---------- */
let voice = null;
function pickVoice() {
  if (!window.speechSynthesis) return;
  const score = v => (/premium/i.test(v.name) ? 3 : /enhanced|forbedret|udvidet/i.test(v.name) ? 2 : 0) + (/sara/i.test(v.name) ? 1 : 0);
  const da = speechSynthesis.getVoices().filter(v => /^da/i.test(v.lang)).sort((a, b) => score(b) - score(a));
  voice = da[0] || null;
}
if (window.speechSynthesis) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
export const voiceName = () => (voice ? voice.name : null);

export function say(text, { pitch = 1.15, rate = 0.95 } = {}) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'da-DK';
  if (voice) u.voice = voice;
  u.pitch = pitch;
  u.rate = rate;
  speechSynthesis.speak(u);
}

/* ---------- confetti ---------- */
let cv = null, cx = null, parts = [], running = false;
function ensureCanvas() {
  if (cv) return;
  cv = document.createElement('canvas');
  cv.id = 'confetti';
  document.body.appendChild(cv);
  cx = cv.getContext('2d');
  const resize = () => {
    const d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  };
  addEventListener('resize', resize);
  resize();
}
export function burst(x, y, n = 60, power = 1) {
  ensureCanvas();
  const s0 = Math.min(innerWidth, innerHeight) / 700;   // scale with screen size
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (3 + Math.random() * 9) * power * s0;
    parts.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5 * power * s0,
      r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
      c: pick(COLORS), sz: (7 + Math.random() * 10) * s0,
      sh: Math.random() < 0.3 ? 'star' : Math.random() < 0.5 ? 'circ' : 'rect', life: 1,
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}
export function bigBurst() {
  for (let i = 0; i < 6; i++) setTimeout(() => burst(innerWidth * rand(0.1, 0.9), innerHeight * rand(0.15, 0.55), 90, 1.3), i * 200);
}
export function clearConfetti() { parts = []; }
function star(s) {
  cx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? s * 0.45 : s, a = i * Math.PI / 5 - Math.PI / 2;
    cx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  cx.closePath();
  cx.fill();
}
function tick() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 50);
  const g = 0.32 * Math.min(innerWidth, innerHeight) / 700;
  for (const p of parts) {
    p.vy += g; p.vx *= 0.985; p.vy *= 0.985;
    p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.007;
    cx.save();
    cx.globalAlpha = Math.min(1, p.life * 2);
    cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    if (p.sh === 'rect') cx.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2);
    else if (p.sh === 'circ') { cx.beginPath(); cx.arc(0, 0, p.sz / 2, 0, 6.28); cx.fill(); }
    else star(p.sz * 0.7);
    cx.restore();
  }
  if (parts.length) requestAnimationFrame(tick);
  else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
}
