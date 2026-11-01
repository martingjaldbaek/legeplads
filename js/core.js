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

/** A held note you can bend and release: for finger-follows-sound games. */
export function sustain({ type = 'triangle', freq = 440, vol = 0.1 } = {}) {
  const a = audio(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  o.connect(g).connect(master);
  o.start();
  let stopped = false;
  return {
    set(f, glide = 0.03) { if (!stopped) o.frequency.setTargetAtTime(f, a.currentTime, glide); },
    stop(fade = 0.12) {
      if (stopped) return;
      stopped = true;
      const t2 = a.currentTime;
      g.gain.cancelScheduledValues(t2);
      g.gain.setTargetAtTime(0.0001, t2, fade / 3);
      o.stop(t2 + fade + 0.1);
    },
  };
}

let noiseBuf = null;
export function noise({ at = 0, dur = 0.08, vol = 0.15, freq = 3000, q = 1, sweep = null } = {}) {
  const a = audio();
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + at;
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf;
  f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
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
  xylo(freq) {
    tone(freq, { dur: 1.3, vol: 0.28, attack: 0.002 });
    tone(freq * 4, { dur: 0.15, vol: 0.05, attack: 0.002 });
    tone(freq * 10, { dur: 0.04, vol: 0.02, attack: 0.001 });
    noise({ dur: 0.02, vol: 0.08, freq: 4000 });
  },
  squeak() { const f = rand(1100, 1700); tone(f, { dur: 0.09, vol: 0.07, slide: f * 1.35 }); },
  splat() { noise({ dur: 0.2, vol: 0.35, freq: 500, q: 0.7, sweep: 150 }); tone(130, { dur: 0.15, vol: 0.18, slide: 60 }); },
  bang() { noise({ dur: 0.4, vol: 0.6, freq: 1000, q: 0.4, sweep: 200 }); tone(95, { dur: 0.3, vol: 0.35, slide: 40 }); },
  whoosh() { noise({ dur: 0.45, vol: 0.2, freq: 400, q: 0.8, sweep: 3000 }); },
  plop() { tone(520, { dur: 0.16, vol: 0.25, slide: 170 }); tone(260, { at: 0.05, dur: 0.22, type: 'triangle', vol: 0.1 }); },
  rustle() { noise({ dur: 0.25, vol: 0.1, freq: 2500, q: 0.6, sweep: 1200 }); },
  fwip() { tone(300, { dur: 0.25, type: 'triangle', vol: 0.1, slide: 900 }); },
  giggle() { [0, 2, 0, 3, 1].forEach((s, i) => tone(scaleHz(s + 10), { at: i * 0.075, dur: 0.09, vol: 0.1, type: 'triangle' })); },
};

/* ---------- game helpers ---------- */

/** Per-game timer set: call clear() in the game's stop function. */
export function timers() {
  const set = new Set();
  return {
    later(fn, ms) { const id = setTimeout(() => { set.delete(id); fn(); }, ms); set.add(id); return id; },
    every(fn, ms) { const id = setInterval(fn, ms); set.add(id); return id; },
    clear() { set.forEach(id => { clearTimeout(id); clearInterval(id); }); set.clear(); },
  };
}

/** Add a <style> block that disappears with the game's root. */
export function injectCSS(root, css) {
  const s = document.createElement('style');
  s.textContent = css;
  root.appendChild(s);
}

/** Pointer-captured dragging of one element by one finger. start(e) may return false to refuse. */
export function draggable(el, { start, move, end }) {
  let id = null;
  el.addEventListener('pointerdown', e => {
    if (id !== null) return;
    if (start && start(e) === false) return;
    e.preventDefault();
    e.stopPropagation();
    id = e.pointerId;
    try { el.setPointerCapture(id); } catch (err) {}
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === id && move) move(e); });
  const fin = e => { if (e.pointerId !== id) return; id = null; if (end) end(e); };
  el.addEventListener('pointerup', fin);
  el.addEventListener('pointercancel', fin);
  return { release() { id = null; } };
}

/** Restart a CSS animation class on an element. */
export function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

/** Call fn whenever el changes size (rotation, window resize). Uses ResizeObserver, which reports
 *  AFTER layout – window 'resize' on iOS can fire before the new size is known, which left canvases
 *  stretched. A late re-check after orientation changes catches any stragglers. Returns an unsubscribe. */
export function onResize(el, fn) {
  let w = el.clientWidth, h = el.clientHeight, raf = 0, late = 0;
  const check = () => {
    if (el.clientWidth === w && el.clientHeight === h) return;
    w = el.clientWidth; h = el.clientHeight;
    fn();
  };
  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(check); });
  ro.observe(el);
  const lateCheck = () => { clearTimeout(late); late = setTimeout(check, 400); };
  addEventListener('orientationchange', lateCheck);
  addEventListener('resize', lateCheck);
  return () => {
    ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(late);
    removeEventListener('orientationchange', lateCheck);
    removeEventListener('resize', lateCheck);
  };
}

/** The master output node, for games that build their own audio graph. */
export function output() { audio(); return master; }

/* ---------- speech (on-device Danish voice) ---------- */
let voice = null;
// Higher-quality voices are often only told apart by their voiceURI (…voice.enhanced.da-DK.Sara),
// not their name, so look at both.
const quality = v => { const s = (v.name + ' ' + v.voiceURI).toLowerCase();
  return /premium/.test(s) ? 3 : /enhanced|forbedret|udvidet|neural|natural/.test(s) ? 2 : /compact|kompakt/.test(s) ? 0 : 1; };
export const danishVoices = () => (window.speechSynthesis ? speechSynthesis.getVoices().filter(v => /^da/i.test(v.lang)) : []);
function pickVoice() {
  if (!window.speechSynthesis) return;
  let chosen = null;
  try { chosen = localStorage.getItem('legeplads-voice'); } catch (e) {}
  const da = danishVoices().sort((a, b) => quality(b) - quality(a) + (/sara/i.test(b.name) - /sara/i.test(a.name)) * 0.1);
  voice = da.find(v => v.voiceURI === chosen) || da[0] || null;
}
export function chooseVoice(uri) { try { localStorage.setItem('legeplads-voice', uri); } catch (e) {} pickVoice(); }
export const voiceQuality = () => (!voice ? '' : [' (kompakt)', '', ' (forbedret)', ' (premium)'][quality(voice)]);
if (window.speechSynthesis) { pickVoice(); speechSynthesis.addEventListener?.('voiceschanged', pickVoice); }
export const voiceName = () => (voice ? voice.name : null);
export const voiceCount = () => (window.speechSynthesis ? speechSynthesis.getVoices().length : 0);

// Safari drops an utterance queued right after cancel(), so only cancel when something is actually
// playing, and then give the synthesizer a moment before speaking again.
let speakTimer = 0;
export function say(text, { pitch = 1.15, rate = 0.95 } = {}) {
  if (!window.speechSynthesis) return;
  if (!voice) pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'da-DK';
  if (voice) u.voice = voice;
  u.pitch = pitch;
  u.rate = rate;
  u.volume = 1;
  clearTimeout(speakTimer);
  const go = () => { try { speechSynthesis.resume(); } catch (e) {} speechSynthesis.speak(u); };
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
    speakTimer = setTimeout(go, 90);
  } else go();
}

/* ---------- confetti ---------- */
let cv = null, cx = null, parts = [], running = false;
// the confetti layer may be taller than the window (see --vp-gap), so measure the canvas itself
const CW = () => (cv ? cv.clientWidth : window.innerWidth), CH = () => (cv ? cv.clientHeight : window.innerHeight);
function ensureCanvas() {
  if (cv) return;
  cv = document.createElement('canvas');
  cv.id = 'confetti';
  document.body.appendChild(cv);
  cx = cv.getContext('2d');
  const resize = () => {
    const d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  };
  onResize(document.body, resize);
  resize();
}
export function burst(x, y, n = 60, power = 1) {
  ensureCanvas();
  const s0 = Math.min(CW(), CH()) / 700;   // scale with screen size
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
  for (let i = 0; i < 6; i++) setTimeout(() => burst(CW() * rand(0.1, 0.9), CH() * rand(0.15, 0.55), 90, 1.3), i * 200);
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
  cx.clearRect(0, 0, CW(), CH());
  parts = parts.filter(p => p.life > 0 && p.y < CH() + 50);
  const g = 0.32 * Math.min(CW(), CH()) / 700;
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
  else { running = false; cx.clearRect(0, 0, CW(), CH()); }
}
