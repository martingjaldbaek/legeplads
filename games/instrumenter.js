import { DRUM, BELL, MARACAS, HORN, ART_CSS } from './art/instrumenter-art.js';

/* Instrumenter: a little band. Drum, bell, shaker and trumpet to tap (hold the trumpet to blow),
 * and a rainbow harp in the middle to strum by sweeping a finger across the strings.
 */
const HARP = [
  ['#ff3b6b', 79], ['#ff8a00', 76], ['#ffc400', 74], ['#06d6a0', 71], ['#3a86ff', 69], ['#8338ec', 67], ['#f15bb5', 62],
];  // colour, midi note – a G major pentatonic, high at the top
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const CSS = `
.ins-wrap { position:absolute; inset:0; display:grid; gap:3vmin; padding: calc(env(safe-area-inset-top) + 13vmin) 4vw 5vmin;
  grid-template-columns: 1fr 1.5fr 1fr; grid-template-rows: 1fr 1fr;
  grid-template-areas: "drum harp bell" "shake harp horn"; }
@media (orientation: portrait) { .ins-wrap { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1.4fr 1fr;
  grid-template-areas: "drum bell" "harp harp" "shake horn"; } }
.ins { position:relative; border-radius:5vmin; background: rgba(255,255,255,.55); box-shadow: 0 1vmin 0 rgba(0,0,0,.06);
  display:flex; align-items:center; justify-content:center; touch-action:none; overflow:visible; }
.ins .emo { font-size: min(17vmin, 15vw); line-height:1; display:inline-block; pointer-events:none; }
.ins.hit .emo { animation: ins-squash .3s ease; }
.ins.swing .emo { animation: ins-swing .9s ease; transform-origin: 50% 0; }
.ins.shake .emo { animation: ins-shake .18s ease; }
.ins.blow .emo { animation: ins-blow .5s ease-in-out infinite alternate; }
.ins-word { position:absolute; left:50%; top:8%; transform:translateX(-50%); font-weight:900; font-size:6vmin; color:#fff;
  -webkit-text-stroke: .25vmin #3b2a4a; paint-order: stroke; pointer-events:none; white-space:nowrap; animation: ins-word .9s ease-out forwards; }
.ins-note { position:absolute; font-size:6vmin; pointer-events:none; animation: ins-note 1.2s ease-out forwards; }
.ins-harp { background: linear-gradient(#fff6e8, #ffe7c4); border: 1.6vmin solid #c98a4b; padding: 4% 6%;
  flex-direction:column; justify-content:space-between; align-items:stretch; }
.ins-string { position:relative; height: 1.4vmin; border-radius: 1vmin; background: var(--c); box-shadow: 0 .4vmin 0 rgba(0,0,0,.12); pointer-events:none; }
.ins-string.twang { animation: ins-twang .6s ease-out; }
@keyframes ins-squash { 0%{transform:none} 35%{transform:scale(1.18,.82)} 70%{transform:scale(.95,1.06)} 100%{transform:none} }
@keyframes ins-swing { 0%,100%{transform:none} 20%{transform:rotate(18deg)} 45%{transform:rotate(-14deg)} 70%{transform:rotate(8deg)} 85%{transform:rotate(-4deg)} }
@keyframes ins-shake { 0%,100%{transform:none} 33%{transform:rotate(-14deg) translateY(-4%)} 66%{transform:rotate(12deg)} }
@keyframes ins-blow { from { transform: scale(1) } to { transform: scale(1.12) rotate(-4deg) } }
@keyframes ins-word { 0%{transform:translateX(-50%) scale(.3); opacity:0} 20%{transform:translateX(-50%) scale(1.15); opacity:1} 100%{transform:translate(-50%,-5vh); opacity:0} }
@keyframes ins-note { from { transform: translate(0,0) scale(.6); opacity:1 } to { transform: translate(var(--dx), -16vh) scale(1.2); opacity:0 } }
@keyframes ins-twang { 0%{transform:translateY(0)} 10%{transform:translateY(-60%) scaleY(1.6)} 25%{transform:translateY(50%)} 40%{transform:translateY(-35%)}
  55%{transform:translateY(25%)} 70%{transform:translateY(-12%)} 100%{transform:none} }
`;

export default {
  id: 'instrumenter',
  title: 'Instrumenter',
  icon: '🥁',
  color: '#e85d04',
  edge: '#ffd7b0',

  start(root, kit) {
    root.style.background = 'radial-gradient(circle at 50% 30%, #fff3e3, #ffd7b0)';
    kit.injectCSS(root, CSS + ART_CSS);
    const ac = kit.audio(), out = kit.output();
    const wrap = document.createElement('div');
    wrap.className = 'ins-wrap';
    root.appendChild(wrap);

    function box(area, art) {
      const el = document.createElement('div');
      el.className = 'ins';
      el.style.gridArea = area;
      if (art) el.innerHTML = art;
      wrap.appendChild(el);
      return el;
    }
    // open the character's mouth for a moment
    const singTimers = new Map();
    function sing(el, ms = 350) {
      el.classList.add('sing');
      clearTimeout(singTimers.get(el));
      singTimers.set(el, setTimeout(() => el.classList.remove('sing'), ms));
    }
    function word(el, text) {
      const w = document.createElement('div');
      w.className = 'ins-word';
      w.textContent = text;
      el.appendChild(w);
      setTimeout(() => w.remove(), 950);
    }
    function note(el, x, y) {
      const n = document.createElement('div');
      n.className = 'ins-note';
      n.textContent = kit.pick(['♪', '♫', '♬']);
      n.style.left = x + 'px'; n.style.top = y + 'px';
      n.style.color = kit.pick(kit.COLORS);
      n.style.setProperty('--dx', kit.rand(-5, 5) + 'vw');
      el.appendChild(n);
      setTimeout(() => n.remove(), 1250);
    }

    /* ---------- drum ---------- */
    const drum = box('drum', DRUM);
    let drumSide = 0;
    drum.addEventListener('pointerdown', e => {
      e.preventDefault();
      kit.tone(120, { dur: 0.45, vol: 0.6, slide: 50, attack: 0.002 });
      kit.noise({ dur: 0.12, vol: 0.25, freq: 900, q: 0.6 });
      drumSide ^= 1;
      kit.replay(drum, drumSide ? 'hit' : 'hit2');
      sing(drum);
      word(drum, kit.pick(['Bum!', 'Bom!', 'Dunk!']));
    });

    /* ---------- bell ---------- */
    const bell = box('bell', BELL);
    const bellNotes = [84, 88, 91, 96];
    bell.addEventListener('pointerdown', e => {
      e.preventDefault();
      const f = midi(kit.pick(bellNotes));
      kit.tone(f, { dur: 2.4, vol: 0.2, attack: 0.002 });
      kit.tone(f * 2.76, { dur: 1.1, vol: 0.06, attack: 0.002 });
      kit.tone(f * 5.4, { dur: 0.4, vol: 0.03, attack: 0.001 });
      kit.replay(bell, 'swing');
      sing(bell, 700);
      word(bell, 'Ding!');
    });

    /* ---------- shaker: tap or wiggle a finger on it ---------- */
    const shake = box('shake', MARACAS);
    let shakeSide = 0;
    const shakeAnim = () => { shakeSide ^= 1; kit.replay(shake, shakeSide ? 'shake' : 'shake2'); sing(shake, 250); };
    const shakeSound = () => kit.noise({ dur: 0.08, vol: 0.28, freq: 6500, q: 0.9 });
    const shakePos = new Map();
    shake.addEventListener('pointerdown', e => {
      e.preventDefault();
      shakePos.set(e.pointerId, [e.clientX, e.clientY]);
      shakeSound(); shakeAnim();
    });
    shake.addEventListener('pointermove', e => {
      const p = shakePos.get(e.pointerId);
      if (!p || Math.hypot(e.clientX - p[0], e.clientY - p[1]) < 25) return;
      shakePos.set(e.pointerId, [e.clientX, e.clientY]);
      shakeSound(); shakeAnim();
    });
    for (const ev of ['pointerup', 'pointercancel']) shake.addEventListener(ev, e => shakePos.delete(e.pointerId));

    /* ---------- trumpet: hold to blow ---------- */
    const horn = box('horn', HORN);
    let blowing = null, vib = 0, noteTimer = 0;
    horn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (blowing) return;
      const base = midi(kit.pick([60, 64, 67, 72]));
      blowing = { a: kit.sustain({ type: 'square', freq: base, vol: 0.07 }), b: kit.sustain({ type: 'sawtooth', freq: base * 1.003, vol: 0.035 }), base, id: e.pointerId };
      horn.classList.add('blow', 'sing');
      let t = 0;
      vib = setInterval(() => { t += 0.05; const f = base * (1 + 0.01 * Math.sin(t * 30)); blowing.a.set(f, 0.02); blowing.b.set(f * 1.003, 0.02); }, 50);
      noteTimer = setInterval(() => note(horn, horn.clientWidth * kit.rand(0.5, 0.8), horn.clientHeight * 0.3), 300);
      word(horn, 'Trut!');
    });
    const stopBlow = e => {
      if (!blowing || (e && e.pointerId !== blowing.id)) return;
      blowing.a.stop(0.1); blowing.b.stop(0.1);
      blowing = null;
      clearInterval(vib); clearInterval(noteTimer);
      horn.classList.remove('blow', 'sing');
    };
    horn.addEventListener('pointerup', stopBlow);
    horn.addEventListener('pointercancel', stopBlow);
    horn.addEventListener('pointerleave', stopBlow);

    /* ---------- harp: Karplus–Strong plucked strings, strum by sweeping ---------- */
    const harp = box('harp');
    harp.classList.add('ins-harp');
    const strings = HARP.map(([c]) => {
      const s = document.createElement('div');
      s.className = 'ins-string';
      s.style.setProperty('--c', c);
      harp.appendChild(s);
      return s;
    });
    const buffers = HARP.map(([, m]) => {
      const f = midi(m), sr = ac.sampleRate, len = Math.floor(sr * 2), N = Math.round(sr / f);
      const buf = ac.createBuffer(1, len, sr), d = buf.getChannelData(0);
      for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
      for (let i = N; i < len; i++) d[i] = 0.497 * (d[i - N] + d[i - N - 1 < 0 ? 0 : i - N - 1]);
      return buf;
    });
    const lastPluck = new Array(HARP.length).fill(0);
    function pluck(i) {
      const now = performance.now();
      if (now - lastPluck[i] < 60) return;
      lastPluck[i] = now;
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buffers[i];
      g.gain.value = 0.5;
      src.connect(g).connect(out);
      src.start();
      kit.replay(strings[i], 'twang');
    }
    const stringYs = () => strings.map(s => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    const harpY = new Map();
    harp.addEventListener('pointerdown', e => {
      e.preventDefault();
      const ys = stringYs();
      let best = 0;
      ys.forEach((y, i) => { if (Math.abs(y - e.clientY) < Math.abs(ys[best] - e.clientY)) best = i; });
      pluck(best);
      harpY.set(e.pointerId, e.clientY);
    });
    harp.addEventListener('pointermove', e => {
      if (!harpY.has(e.pointerId)) return;
      const y0 = harpY.get(e.pointerId), y1 = e.clientY;
      stringYs().forEach((y, i) => { if ((y0 - y) * (y1 - y) < 0) pluck(i); });   // crossed this string
      harpY.set(e.pointerId, y1);
    });
    for (const ev of ['pointerup', 'pointercancel']) harp.addEventListener(ev, e => harpY.delete(e.pointerId));

    return () => stopBlow();
  },
};
