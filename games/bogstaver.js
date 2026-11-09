/* Bogstaver: the iPad version of Bogstavleg (~/Dropbox/Adam-spil/bogstavleg, the PC keyboard game).
 * A Danish keyboard fills the bottom of the screen; the letter to find glows and pulses on it, just like the
 * target letter above. Two modes, switched with the round buttons top right:
 *   🔤 Find bogstavet – a random letter (A–Å, no W) pops up and is named; tap its key for confetti and praise.
 *   🎵 ABC-sangen – the letters come in song order, a line of seven at a time; each right key sings that letter.
 *      After Å the whole alphabet shows and "28 skal der stå på min lærers storetå" plays.
 * Wrong keys just boop and float away as a ghost letter. Our own recordings live in games/bogstav-lyd/
 * (navn = neutral name, ros = excited name + ekstra1–6 praise words, sang = sung letter + finale);
 * Æ Ø Å are named AE OE AA. A missing clip falls back to the iPad's Danish voice.
 */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVXYZÆØÅ'.split('');   // the 28 of the Danish ABC song: no W
const SONG = [
  [['A', 'C', 1], ['B', 'C', 1], ['C', 'G', 1], ['D', 'G', 1], ['E', 'A', 1], ['F', 'A', 1], ['G', 'G', 2]],
  [['H', 'F', 1], ['I', 'F', 1], ['J', 'E', 1], ['K', 'E', 1], ['L', 'D', 1], ['M', 'D', 1], ['N', 'C', 2]],
  [['O', 'G', 1], ['P', 'G', 1], ['Q', 'F', 1], ['R', 'F', 1], ['S', 'E', 1], ['T', 'E', 1], ['U', 'D', 2]],
  [['V', 'G', 1], ['X', 'G', 1], ['Y', 'F', 1], ['Z', 'F', 1], ['Æ', 'E', 1], ['Ø', 'E', 1], ['Å', 'D', 2]],
];
const NOTE_HZ = { C: 523.25, D: 587.33, E: 659.25, F: 698.46, G: 783.99, A: 880.0 };
const KEYS = ['QWERTYUIOPÅ', 'ASDFGHJKLÆØ', 'ZXCVBNM'];   // Danish layout
const PRAISE = ['Flot!', 'Super!', 'Ja!', 'Godt klaret!', 'Sejt!', 'Hurra!', 'Du fandt den!'];
const COLORS = ['#ff3b6b', '#ff8a00', '#2ec4b6', '#3a86ff', '#8338ec', '#06d6a0', '#ef476f', '#f15bb5', '#00a6fb', '#e85d04'];
const HINT_MS = 8000, MAX_IDLE_HINTS = 3;
const CLIPS = new URL('./bogstav-lyd/', import.meta.url);
const clipName = ch => ({ 'Æ': 'AE', 'Ø': 'OE', 'Å': 'AA' })[ch] || ch;

const BUDDY = `<svg viewBox="0 0 240 270">
  <circle cx="48" cy="98" r="24" fill="#a0522d"/><circle cx="192" cy="98" r="24" fill="#a0522d"/>
  <circle cx="58" cy="76" r="8" fill="#ffd23f"/><circle cx="182" cy="76" r="8" fill="#ffd23f"/>
  <rect x="94" y="232" width="18" height="26" rx="8" fill="#ffd9b8"/><rect x="128" y="232" width="18" height="26" rx="8" fill="#ffd9b8"/>
  <ellipse cx="100" cy="261" rx="17" ry="8" fill="#5b8def"/><ellipse cx="140" cy="261" rx="17" ry="8" fill="#5b8def"/>
  <path d="M120 158 C 84 158 64 196 54 244 Q 120 262 186 244 C 176 196 156 158 120 158 Z" fill="#ff7eb3"/>
  <circle cx="100" cy="210" r="5" fill="#fff" opacity=".8"/><circle cx="132" cy="196" r="5" fill="#fff" opacity=".8"/>
  <circle cx="146" cy="226" r="5" fill="#fff" opacity=".8"/><circle cx="90" cy="236" r="5" fill="#fff" opacity=".8"/>
  <circle cx="118" cy="232" r="5" fill="#fff" opacity=".8"/>
  <circle cx="120" cy="100" r="64" fill="#ffd9b8"/>
  <path d="M57 96 C 56 48 96 30 120 32 C 150 30 184 50 183 96 C 172 72 150 62 128 72 C 110 58 78 64 57 96 Z" fill="#a0522d"/>
  <g transform="translate(158 44) rotate(15)"><path d="M0 0 L-17 -11 L-17 11 Z M0 0 L17 -11 L17 11 Z" fill="#ffd23f"/><circle r="5" fill="#ffaa00"/></g>
  <g class="bs-eyes"><ellipse cx="98" cy="106" rx="8" ry="11" fill="#3b2a4a"/><ellipse cx="142" cy="106" rx="8" ry="11" fill="#3b2a4a"/>
    <circle cx="101" cy="101" r="3" fill="#fff"/><circle cx="145" cy="101" r="3" fill="#fff"/></g>
  <circle cx="80" cy="128" r="10" fill="#ff8fab" opacity=".55"/><circle cx="160" cy="128" r="10" fill="#ff8fab" opacity=".55"/>
  <path class="bs-smile" d="M104 132 Q 120 148 136 132" stroke="#3b2a4a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse class="bs-sing" cx="120" cy="139" rx="10" ry="12" fill="#a8324a"/>
  <g class="bs-arm" data-side="L"><rect x="0" y="-9" width="56" height="18" rx="9" fill="#ff5c9d"/><circle cx="60" cy="0" r="12" fill="#ffd9b8"/>
    <rect class="bs-finger" x="64" y="-4" width="22" height="8" rx="4" fill="#ffd9b8"/></g>
  <g class="bs-arm" data-side="R"><rect x="0" y="-9" width="56" height="18" rx="9" fill="#ff5c9d"/><circle cx="60" cy="0" r="12" fill="#ffd9b8"/>
    <rect class="bs-finger" x="64" y="-4" width="22" height="8" rx="4" fill="#ffd9b8"/></g>
</svg>`;

const CSS = `
.bs { position:absolute; inset:0; font-family: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif;
  color:#3b2a4a; background: radial-gradient(circle at 50% 30%, var(--bg1, #fff7e6), var(--bg2, #ffe3f1)); transition: background .8s; }
.bs-top { position:absolute; left:0; right:0; top:0; }
.bs-single { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; animation: bs-float 3.2s ease-in-out infinite; pointer-events:none; }
.bs-big { display:inline-block; font-weight:900; line-height:1; text-shadow: 0 .04em 0 rgba(0,0,0,.18), 0 0 .25em rgba(255,255,255,.9); }
.bs-big.in  { animation: bs-popin .6s cubic-bezier(.3,1.7,.5,1) both; }
.bs-big.hit { animation: bs-boing 1s ease both; }
.bs-big.out { animation: bs-out .35s ease-in both; }
.bs-row { position:absolute; left:0; right:0; display:flex; flex-direction:column; align-items:center; gap:1.2vh; pointer-events:none; }
.bs-line { display:flex; gap:1.4vw; animation: bs-slidein .6s cubic-bezier(.3,1.4,.5,1) both; }
.bs-ltr { display:inline-block; font-weight:900; text-align:center; line-height:1.1; min-width:.8em; color:var(--c);
  text-shadow: 0 .05em 0 rgba(0,0,0,.15); transition: opacity .3s, color .3s; }
.bs-ltr.future { opacity:.25; color:#8f86a0; }
.bs-ltr.target, .bs-key.target { background: rgba(255,255,255,.85); border-radius:.2em; padding:0 .08em;
  box-shadow: 0 0 0 .05em var(--c), 0 .1em .3em rgba(0,0,0,.12); animation: bs-pulse 1.1s ease-in-out infinite; }
.bs-ltr.pop { animation: bs-pop .55s ease; }
.bs-wiggle { animation: bs-wiggle .45s ease !important; }

.bs-buddy { position:absolute; pointer-events:none; }
.bs-buddy svg { width:100%; height:100%; display:block; overflow:visible; }
.bs-buddy svg.jump { animation: bs-jump .5s cubic-bezier(.3,.6,.4,1); }
.bs-eyes { transform-box: fill-box; transform-origin:center; animation: bs-blink 4.5s infinite; }
.bs-sing { display:none; transform-box: fill-box; transform-origin:center; }
.bs-buddy svg.singing .bs-sing { display:inline; animation: bs-mouth .25s ease-in-out infinite alternate; }
.bs-buddy svg.singing .bs-smile { display:none; }
.bs-finger { display:none; }
.bs-arm.on .bs-finger { display:inline; }

/* the keyboard */
.bs-kb { position:absolute; left:0; right:0; bottom:0; background: rgba(74,59,92,.10); border-top: 3px solid rgba(74,59,92,.12);
  touch-action:none; }
.bs-key { position:absolute; display:flex; align-items:center; justify-content:center; font-weight:900; color:#3b2a4a;
  background:#fff; border-radius:14px; box-shadow: 0 5px 0 rgba(74,59,92,.22); transition: transform .08s, box-shadow .08s; }
.bs-key.target { color: var(--c); border-radius:14px; padding:0; z-index:2;
  box-shadow: 0 0 0 5px var(--c), 0 0 22px 6px var(--c), 0 5px 0 rgba(74,59,92,.22); }
.bs-key.down { transform: translateY(4px) scale(.96); box-shadow: 0 1px 0 rgba(74,59,92,.22); }
.bs-key.target.down { box-shadow: 0 0 0 5px var(--c), 0 1px 0 rgba(74,59,92,.22); }
.bs-key.w { opacity:.6; }

.bs-modes { position:absolute; top:12px; right:12px; display:flex; gap:10px; z-index:5; }
.bs-modes button { width:64px; height:64px; border:0; border-radius:50%; background:rgba(255,255,255,.75); font-size:32px;
  box-shadow: 0 4px 0 rgba(0,0,0,.1); touch-action:none; }
.bs-modes button.on { background:#fff; box-shadow: 0 0 0 4px #ffd23f, 0 4px 0 rgba(0,0,0,.1); }

.bs-ghost { position:absolute; z-index:6; pointer-events:none; font-weight:900; color: rgba(90,70,110,.35); animation: bs-ghost 1.1s ease-out forwards; }

@keyframes bs-float  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5vh) } }
@keyframes bs-popin  { from { transform: scale(0) rotate(-25deg); opacity:0 } to { transform: scale(1) rotate(0); opacity:1 } }
@keyframes bs-boing  { 0% { transform: scale(1) } 18% { transform: scale(1.4) rotate(-7deg) } 36% { transform: scale(.88) rotate(6deg) }
                       54% { transform: scale(1.18) rotate(-3deg) } 72% { transform: scale(.97) } 100% { transform: scale(1.06) } }
@keyframes bs-out    { to { transform: scale(0) rotate(30deg); opacity:0 } }
@keyframes bs-pulse  { 0%,100% { transform: scale(1.12) } 50% { transform: scale(1.3) } }
@keyframes bs-pop    { 0% { transform: scale(1) } 40% { transform: scale(1.7) rotate(-10deg) } 100% { transform: scale(1) } }
@keyframes bs-wiggle { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-9deg) } 75% { transform: rotate(9deg) } }
@keyframes bs-slidein { from { transform: translateY(-30vh); opacity:0 } to { transform:none; opacity:1 } }
@keyframes bs-jump   { 0%,100% { transform: translateY(0) } 40% { transform: translateY(-12%) scaleY(1.05) } 80% { transform: translateY(0) scaleY(.94) } }
@keyframes bs-blink  { 0%,93%,100% { transform: scaleY(1) } 96% { transform: scaleY(.1) } }
@keyframes bs-mouth  { from { transform: scaleY(.45) } to { transform: scaleY(1.15) } }
@keyframes bs-ghost  { 0% { transform: scale(.5); opacity:0 } 20% { transform: translateY(-2vh) scale(1); opacity:1 }
                       100% { transform: translateY(-14vh) scale(1.1); opacity:0 } }
/* the pulsing key is smaller than a letter: pulse it less */
.bs-key.target { animation: bs-keypulse 1.1s ease-in-out infinite; }
@keyframes bs-keypulse { 0%,100% { transform: scale(1.06) } 50% { transform: scale(1.16) } }
.bs-key.target.down { animation: none; transform: translateY(4px) scale(1.02); }
`;

export default {
  id: 'bogstaver',
  title: 'Bogstaver',
  icon: '🔤',
  color: '#ff3b6b',
  edge: '#e9d9ea',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    root.insertAdjacentHTML('beforeend', `<div class="bs">
      <div class="bs-top"><div class="bs-single"></div><div class="bs-row"></div><div class="bs-buddy">${BUDDY}</div></div>
      <div class="bs-kb"></div>
      <div class="bs-modes"><button data-mode="random">🔤</button><button data-mode="song">🎵</button></div></div>`);
    const bs = root.querySelector('.bs'), top = bs.querySelector('.bs-top'), single = bs.querySelector('.bs-single');
    const row = bs.querySelector('.bs-row'), kb = bs.querySelector('.bs-kb'), buddyEl = bs.querySelector('.bs-buddy');
    const bsvg = buddyEl.querySelector('svg'), modeBtns = [...bs.querySelectorAll('.bs-modes button')];
    let W = 0, H = 0, topH = 0, alive = true;

    /* ---------- recordings (Web Audio, so they play with the mute switch on and never need a second gesture) ---------- */
    const bufs = new Map();   // "kind/id" -> Promise<AudioBuffer|null>
    let ctx = null, curSrc = null;
    function load(key) {
      if (!bufs.has(key)) {
        ctx = ctx || kit.output().context;
        bufs.set(key, fetch(new URL(key + '.mp3', CLIPS)).then(r => (r.ok ? r.arrayBuffer() : null))
          .then(b => (b ? new Promise((ok, no) => ctx.decodeAudioData(b, ok, no)) : null)).catch(() => null));
      }
      return bufs.get(key);
    }
    function preload() {
      LETTERS.forEach(ch => { load('navn/' + clipName(ch)); load('ros/' + clipName(ch)); load('sang/' + clipName(ch)); });
      for (let i = 1; i <= 6; i++) load('ros/ekstra' + i);
      load('sang/finale');
    }
    function stopClip() { if (curSrc) { try { curSrc.stop(); } catch (e) {} curSrc = null; } }
    // resolves when the clip ends; resolves false at once when it's missing (caller falls back to the voice)
    async function clip(key) {
      const buf = await load(key);
      if (!buf || !alive) return false;
      stopClip();
      if (window.speechSynthesis) speechSynthesis.cancel();
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.connect(kit.output());
      curSrc = s;
      return new Promise(r => {
        s.onended = () => { if (curSrc === s) curSrc = null; r(true); };
        s.start();
        setTimeout(() => r(true), buf.duration * 1000 + 300);   // never hang on a missed onended
      });
    }
    const wait = ms => new Promise(r => setTimeout(r, ms));
    async function sayLetter(ch, mood) {
      if (await clip((mood === 'praise' ? 'ros/' : 'navn/') + clipName(ch))) return;
      if (mood === 'praise') kit.say(ch + '!', { pitch: 1.5, rate: 1.05 }); else kit.say(ch, { pitch: 1.15, rate: 0.85 });
      await wait(900);
    }
    async function sayPraise() {
      if (await clip('ros/ekstra' + (1 + Math.floor(Math.random() * 6)))) return;
      kit.say(kit.pick(PRAISE), { pitch: 1.5, rate: 1.05 });
      await wait(1200);
    }
    function singLetter(ch, note, beats) {
      clip('sang/' + clipName(ch)).then(ok => {
        if (ok || !alive) return;
        kit.tone(NOTE_HZ[note], { dur: 0.35 + beats * 0.25, type: 'triangle', vol: 0.2 });
        kit.say(ch, { pitch: 1.2, rate: 1.1 });
      });
    }
    const chime = () => kit.sfx.chime();
    const boop = () => kit.tone(196, { dur: 0.16, vol: 0.14 });

    /* ---------- the buddy (points at letters; positions from our own layout, no getScreenCTM) ---------- */
    const arms = {};
    bsvg.querySelectorAll('.bs-arm').forEach(g => {
      const L = g.dataset.side === 'L';
      arms[g.dataset.side] = { g, pivot: L ? [80, 180] : [160, 180], rest: L ? 112 : 68, angle: L ? 112 : 68, token: 0 };
    });
    let restTimer = 0, singTimer = 0;
    const setArm = (a, ang) => { a.angle = ang; a.g.setAttribute('transform', `translate(${a.pivot[0]} ${a.pivot[1]}) rotate(${ang})`); };
    function tween(a, to, ms = 230) {
      const from = a.angle, d = ((to - from + 540) % 360) - 180, t0 = performance.now(), tok = ++a.token;
      const step = now => {
        if (tok !== a.token || !alive) return;
        const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        setArm(a, from + d * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    const restArms = () => Object.values(arms).forEach(a => { a.g.classList.remove('on'); tween(a, a.rest, 350); });
    Object.values(arms).forEach(a => setArm(a, a.rest));
    function buddyPt(x, y) {   // buddy svg units -> screen px (viewBox 0 0 240 270, no aspect distortion)
      const r = bsvg.getBoundingClientRect(), k = r.width / 240;
      return [r.left + x * k, r.top + y * k];
    }
    function point(el, hold = 1400) {
      if (!el) return;
      const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
      const side = tx < buddyPt(120, 180)[0] ? 'L' : 'R', a = arms[side], o = arms[side === 'L' ? 'R' : 'L'];
      const [px, py] = buddyPt(...a.pivot);
      a.g.classList.add('on'); tween(a, Math.atan2(ty - py, tx - px) * 180 / Math.PI);
      o.g.classList.remove('on'); tween(o, o.rest);
      clearTimeout(restTimer);
      restTimer = setTimeout(restArms, hold);
    }
    const jump = () => kit.replay(bsvg, 'jump');
    function sing(ms) { bsvg.classList.add('singing'); clearTimeout(singTimer); singTimer = setTimeout(() => bsvg.classList.remove('singing'), ms); }

    function shiftBackground() {
      const h = Math.floor(Math.random() * 360);
      bs.style.setProperty('--bg1', `hsl(${h},100%,96%)`);
      bs.style.setProperty('--bg2', `hsl(${(h + 50) % 360},90%,87%)`);
    }
    const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

    /* ---------- keyboard ---------- */
    const keyEl = {};
    KEYS.forEach(line => [...line].forEach(ch => {
      const k = document.createElement('div');
      k.className = 'bs-key';
      k.textContent = ch;
      k.dataset.ch = ch;
      kb.appendChild(k);
      keyEl[ch] = k;
    }));
    keyEl.W.classList.add('w');   // on the keyboard, but not in the song alphabet

    /* ---------- state ---------- */
    const st = { mode: 'random', busy: true, target: null, line: 0, pos: 0, lastPrompt: 0, idleHints: 0, wrongSince: 0, lastBoop: 0, session: 0 };
    const colorOf = ch => COLORS[(LETTERS.indexOf(ch) * 3) % COLORS.length];

    function currentTarget() {
      if (st.mode === 'random') return st.target;
      const l = SONG[st.line];
      return l && l[st.pos] ? l[st.pos][0] : null;
    }
    const targetEl = () => (st.mode === 'random' ? single.querySelector('.bs-big') : row.querySelector('.bs-ltr.target'));
    // the key of the letter to find glows in the same colour as the letter on screen
    function markKey() {
      const ch = st.busy ? null : currentTarget();
      Object.values(keyEl).forEach(k => k.classList.remove('target'));
      if (!ch) return;
      const el = targetEl();
      keyEl[ch].style.setProperty('--c', (el && el.style.getPropertyValue('--c')) || colorOf(ch));
      keyEl[ch].classList.add('target');
    }
    function wiggle(el) { if (!el) return; kit.replay(el, 'bs-wiggle'); setTimeout(() => el.classList.remove('bs-wiggle'), 450); }
    function promptTarget() {
      const ch = currentTarget();
      if (!ch || !alive) return;
      st.lastPrompt = performance.now();
      st.wrongSince = 0;
      sayLetter(ch, 'prompt');
      wiggle(targetEl());
      wiggle(keyEl[ch]);
    }

    /* ---------- mode 1: random letter ---------- */
    function nextRandom() {
      let ch;
      do ch = kit.pick(LETTERS); while (ch === st.target);
      st.target = ch;
      single.innerHTML = '';
      const s = document.createElement('span');
      s.className = 'bs-big in';
      s.textContent = ch;
      const c = kit.pick(COLORS);
      s.style.color = c; s.style.setProperty('--c', c);
      s.addEventListener('animationend', e => { if (e.animationName === 'bs-popin') s.classList.remove('in'); });
      single.appendChild(s);
      layoutTop();
      st.busy = false;
      markKey();
      t.later(promptTarget, 450);
    }
    async function hitRandom() {
      st.busy = true;
      markKey();
      const session = st.session, el = single.querySelector('.bs-big');
      el.className = 'bs-big hit';
      const [x, y] = centerOf(el);
      kit.burst(x, y, 130, 1.15);
      chime();
      point(el, 2500);
      jump(); t.later(jump, 500);
      shiftBackground();
      await wait(250);
      await sayLetter(st.target, 'praise');
      if (session !== st.session || !alive) return;
      await sayPraise();
      if (session !== st.session || !alive) return;
      t.later(() => { el.className = 'bs-big out'; }, 150);
      t.later(nextRandom, 500);
    }

    /* ---------- mode 2: the ABC song ---------- */
    function makeLine(li, cls) {
      const div = document.createElement('div');
      div.className = 'bs-line';
      SONG[li].forEach(([ch], i) => {
        const s = document.createElement('span');
        s.textContent = ch;
        s.className = 'bs-ltr ' + (cls || (i < st.pos ? 'done' : i === st.pos ? 'target' : 'future'));
        s.style.setProperty('--c', COLORS[(li * 9 + i) % COLORS.length]);
        div.appendChild(s);
      });
      return div;
    }
    function renderLine() {
      row.classList.remove('all');
      row.innerHTML = '';
      row.appendChild(makeLine(st.line));
      layoutTop();
    }
    function markRow() {
      row.querySelectorAll('.bs-ltr').forEach((s, i) => {
        s.classList.remove('target', 'future', 'done');
        s.classList.add(i === st.pos ? 'target' : i > st.pos ? 'future' : 'done');
      });
    }
    function hitSong() {
      st.busy = true;
      markKey();
      const [ch, note, beats] = SONG[st.line][st.pos];
      const el = row.querySelector('.bs-ltr.target');
      el.classList.remove('target', 'bs-wiggle');
      el.classList.add('done');
      kit.replay(el, 'pop');
      const [x, y] = centerOf(el);
      kit.burst(x, y, 35, 0.8);
      singLetter(ch, note, beats);
      point(el, 1500);
      sing(500 + beats * 300);
      st.pos++;
      if (st.pos >= SONG[st.line].length) {
        t.later(() => { row.querySelectorAll('.bs-ltr').forEach(s => { const [a, b] = centerOf(s); kit.burst(a, b, 20, 0.9); }); jump(); shiftBackground(); }, 1300);
        t.later(nextLine, 2600);
      } else {
        t.later(() => { markRow(); st.busy = false; markKey(); }, 300);
      }
    }
    function nextLine() {
      st.line++; st.pos = 0;
      if (st.line >= SONG.length) return finale();
      renderLine();
      st.busy = false;
      markKey();
      t.later(promptTarget, 700);
    }
    async function finale() {
      st.busy = true;
      markKey();
      const session = st.session;
      row.classList.add('all');
      row.innerHTML = '';
      SONG.forEach((_, li) => row.appendChild(makeLine(li, 'done')));
      layoutTop();
      buddyEl.style.left = Math.max(12, W * 0.03) + 'px';   // step aside so the whole alphabet shows
      const spans = [...row.querySelectorAll('.bs-ltr')];
      chime(); kit.bigBurst(); jump();
      const wave = t.every(() => {
        const s = kit.pick(spans);
        kit.replay(s, 'pop');
        if (Math.random() < 0.35) { const [x, y] = centerOf(s); kit.burst(x, y, 30, 0.9); }
        if (Math.random() < 0.2) jump();
        // the keyboard joins in: random keys light up
        const k = keyEl[kit.pick(LETTERS)];
        k.style.setProperty('--c', kit.pick(COLORS)); k.classList.add('target'); setTimeout(() => k.classList.remove('target'), 500);
      }, 260);
      sing(12000);
      if (!(await clip('sang/finale'))) { kit.say('Otteogtyve skal der stå på min lærers storetå!', { pitch: 1.4, rate: 1 }); await wait(4000); }
      clearInterval(wave);
      bsvg.classList.remove('singing');
      if (session !== st.session || !alive) return;
      chime(); kit.bigBurst(); jump();
      t.later(() => { if (session !== st.session) return; st.line = 0; st.pos = 0; renderLine(); layout(); st.busy = false; markKey(); promptTarget(); }, 3500);
    }

    /* ---------- input: every touch on a key counts, several fingers at once are fine ---------- */
    function ghost(ch) {
      const g = document.createElement('div');
      g.className = 'bs-ghost';
      g.textContent = ch;
      g.style.fontSize = Math.min(W, H) * 0.12 + 'px';
      g.style.left = W * (0.05 + Math.random() * 0.8) + 'px';
      g.style.top = topH * (0.15 + Math.random() * 0.55) + 'px';
      bs.appendChild(g);
      setTimeout(() => g.remove(), 1200);
    }
    function wrong(ch) {
      const now = performance.now();
      if (now - st.lastBoop > 140) { boop(); st.lastBoop = now; }
      ghost(ch);
      wiggle(targetEl());
      if (++st.wrongSince >= 5 && now - st.lastPrompt > 2500) promptTarget();
    }
    kb.addEventListener('pointerdown', e => {
      e.preventDefault();
      const k = e.target.closest('.bs-key');
      if (!k) return;
      k.classList.add('down');
      setTimeout(() => k.classList.remove('down'), 160);   // not tied to pointerup, which iOS can swallow
      st.idleHints = 0;
      if (st.busy) { kit.tone(kit.scaleHz(LETTERS.indexOf(k.dataset.ch) % 10), { dur: 0.12, type: 'triangle', vol: 0.08 }); return; }
      const ch = k.dataset.ch;
      if (ch === currentTarget()) {
        st.lastPrompt = performance.now();
        st.wrongSince = 0;
        k.classList.remove('target');
        if (st.mode === 'random') hitRandom(); else hitSong();
      } else wrong(ch);
    });
    // tapping the big letter (or the buddy) names it again
    top.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (st.busy || performance.now() - st.lastPrompt < 1200) return;
      promptTarget();
    });

    function setMode(mode) {
      st.session++;
      t.clear();
      stopClip();
      if (window.speechSynthesis) speechSynthesis.cancel();
      Object.assign(st, { mode, busy: true, target: null, line: 0, pos: 0, idleHints: 0, wrongSince: 0 });
      modeBtns.forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
      single.innerHTML = ''; row.innerHTML = '';
      bs.dataset.mode = mode;
      bsvg.classList.remove('singing');
      layout();
      startIdle();
      if (mode === 'random') nextRandom();
      else { renderLine(); st.busy = false; markKey(); t.later(promptTarget, 700); }
    }
    modeBtns.forEach(b => b.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      if (b.dataset.mode === st.mode) { promptTarget(); return; }
      kit.sfx.fwip();
      setMode(b.dataset.mode);
    }));

    function startIdle() {
      t.every(() => {
        if (st.busy || st.idleHints >= MAX_IDLE_HINTS) return;
        if (performance.now() - st.lastPrompt > HINT_MS) { st.idleHints++; promptTarget(); }
      }, 500);
    }

    /* ---------- layout ---------- */
    function layoutTop() {
      const portrait = H > W;
      const big = single.querySelector('.bs-big');
      if (big) big.style.fontSize = Math.min(topH * 0.78, W * (portrait ? 0.6 : 0.5)) + 'px';
      const all = row.classList.contains('all');
      row.style.top = (all ? Math.max(84, topH * 0.04) : Math.max(90, topH * (portrait ? 0.14 : 0.08))) + 'px';
      const fs = all ? Math.min(topH * 0.12, W * (portrait ? 0.075 : 0.06)) : Math.min(topH * 0.2, W * (portrait ? 0.105 : 0.085));
      row.querySelectorAll('.bs-ltr').forEach(s => { s.style.fontSize = fs + 'px'; });
    }
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const portrait = H > W, pad = 10, gap = Math.max(6, W * 0.008);
      // key size: 11 keys across the widest row, rows staggered like a real keyboard
      const kw = Math.min((W - 2 * pad - 10.5 * gap) / 11.5, H * (portrait ? 0.075 : 0.12) * 1.15);
      const kh = portrait ? Math.min(kw * 1.45, H * 0.085) : Math.min(kw * 1.05, H * 0.11);   // taller keys in portrait
      const kbH = 3 * kh + 2 * gap + 2 * pad + 12;
      kb.style.height = kbH + 'px';
      const offs = [0, 0.35, 1.0];
      KEYS.forEach((line, r) => {
        const n = line.length, rowW = n * kw + (n - 1) * gap;
        // rows 1–2 centred together (row 2 sits a third of a key to the right), row 3 centred a little left
        const left = r === 2 ? (W - rowW) / 2 - kw * 0.2 : (W - (11.35 * kw + 10 * gap)) / 2 + offs[r] * kw;
        [...line].forEach((ch, i) => {
          Object.assign(keyEl[ch].style, { left: left + i * (kw + gap) + 'px', top: pad + r * (kh + gap) + 'px',
            width: kw + 'px', height: kh + 'px', fontSize: kh * 0.55 + 'px' });
        });
      });
      topH = H - kbH;
      top.style.height = topH + 'px';
      // buddy: bottom-left beside the big letter, or centred under the song row
      const bh = st.mode === 'song' ? topH * (portrait ? 0.4 : 0.55) : topH * (portrait ? 0.3 : 0.5);
      const bw = bh * 240 / 270;
      Object.assign(buddyEl.style, { height: bh + 'px', width: bw + 'px', top: topH - bh - 4 + 'px',
        left: (st.mode === 'song' ? (W - bw) / 2 : Math.max(12, W * 0.03)) + 'px' });
      layoutTop();
    }

    const offResize = kit.onResize(root, layout);
    preload();
    setMode('random');
    return () => {
      alive = false;
      st.session++;
      t.clear(); offResize();
      clearTimeout(restTimer); clearTimeout(singTimer);
      stopClip();
    };
  },
};
