/* Snekugle: a big snow globe. Drag little figures from the tray into the globe; they drop onto the snowy
 * mound. Grab the globe and shake it: it follows the finger and springs back, and the flakes lag behind like
 * water, swirl up and slowly settle while a music box twinkles. A tap puffs flakes up where you touch. The
 * buttons swap snow for glitter, hearts, stars or bubbles (which float up instead). Hold the base to wind the
 * music box (the key turns, ratchet clicks); let go and it plays, longer the more it was wound.
 */
const FIGS = [
  ['⛄', 'Snemand', .34], ['🎄', 'Juletræ', .4], ['🏡', 'Hus', .4], ['🦌', 'Rensdyr', .32],
  ['🧒', 'Barn', .26], ['🐧', 'Pingvin', .26], ['🐻‍❄️', 'Isbjørn', .3], ['🎅', 'Julemand', .3],
  ['🐰', 'Kanin', .24], ['🦊', 'Ræv', .26], ['🏰', 'Slot', .42], ['🛷', 'Kælk', .28],
  ['🦄', 'Enhjørning', .3], ['🎁', 'Gave', .22],
];
// kind, button, spoken name, particle count, size range (globe units), gravity, inside colours, mound colours
const THEMES = [
  { kind: 'snow', btn: '❄️', name: 'Sne', n: 340, r: [1.6, 4.2], g: .6, sky: ['#cfeaff', '#7fb6f0'], mound: ['#ffffff', '#dceeff'] },
  { kind: 'glitter', btn: '✨', name: 'Glimmer', n: 380, r: [1.4, 3.2], g: 0.75, sky: ['#e9d8ff', '#9a7bf0'], mound: ['#fff4fb', '#ead9ff'],
    cols: ['#ffd23f', '#ff9de2', '#8be9ff', '#ffffff', '#c3a6ff'] },
  { kind: 'heart', btn: '💗', name: 'Hjerter', n: 130, r: [4, 8], g: 0.8, sky: ['#ffe0ee', '#ff9cc4'], mound: ['#fff0f6', '#ffd0e4'],
    cols: ['#ff4d6d', '#ff8fab', '#ff1f5a', '#ffb3c6'] },
  { kind: 'star', btn: '⭐', name: 'Stjerner', n: 130, r: [4, 8], g: 0.8, sky: ['#3a3f8f', '#141a4a'], mound: ['#e8eeff', '#b9c6ff'],
    cols: ['#ffd23f', '#fff1a8', '#ffb703'] },
  { kind: 'bubble', btn: '🫧', name: 'Bobler', n: 90, r: [3, 11], g: -0.55, sky: ['#c9fbff', '#4cc9f0'], mound: ['#fff6d6', '#ffe08a'] },
];

const CSS = `
.snekugle-stars { position:absolute; inset:0; pointer-events:none; opacity:.6;
  background-image: radial-gradient(2px 2px at 12% 18%, #fff, transparent), radial-gradient(2px 2px at 82% 12%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 30% 70%, #fff, transparent), radial-gradient(2px 2px at 70% 82%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 92% 55%, #fff, transparent), radial-gradient(1.5px 1.5px at 6% 60%, #fff, transparent),
    radial-gradient(2px 2px at 55% 6%, #fff, transparent), radial-gradient(1.5px 1.5px at 44% 92%, #fff, transparent); }
.snekugle-globe { position:absolute; touch-action:none; transform-origin: 50% 100%; }
.snekugle-scene { position:absolute; inset:0; border-radius:50%; overflow:hidden; transition: background .6s; }
.snekugle-mound { position:absolute; border-radius:50%; transition: background .6s; }
.snekugle-scene canvas { position:absolute; left:0; top:0; pointer-events:none; }
.snekugle-glass { position:absolute; inset:0; border-radius:50%; pointer-events:none;
  background: radial-gradient(circle at 32% 26%, rgba(255,255,255,.55) 0, rgba(255,255,255,.12) 18%, rgba(255,255,255,0) 32%),
    radial-gradient(circle at 70% 80%, rgba(255,255,255,0) 60%, rgba(255,255,255,.25) 72%, rgba(255,255,255,0) 74%);
  box-shadow: inset 0 0 0 var(--rim) rgba(255,255,255,.55), inset 0 -2vmin 6vmin rgba(255,255,255,.25), 0 0 6vmin rgba(160,200,255,.35); }
.snekugle-base { position:absolute; overflow:visible; touch-action:none; }
.snekugle-base .key { transform-box: fill-box; transform-origin: 50% 50%; }
.snekugle-base.wind .key, .snekugle-base.play .key { animation: snekugle-key .5s linear infinite; }
.snekugle-base.play .key { animation-duration: .9s; animation-direction: reverse; }
@keyframes snekugle-key { 0% { transform: scaleY(1) } 50% { transform: scaleY(-1) } 100% { transform: scaleY(1) } }
.snekugle-hand { position:absolute; pointer-events:none; line-height:1; opacity:0; z-index:5; }
.snekugle-hand.show { animation: snekugle-hand 2.4s ease-in-out; }
@keyframes snekugle-hand { 0% { opacity:0; transform: translateX(-40%) } 12% { opacity:1 } 30% { transform: translateX(40%) }
  50% { transform: translateX(-40%) } 70% { transform: translateX(40%) } 88% { opacity:1 } 100% { opacity:0; transform: translateX(0) } }
.snekugle-fig { position:absolute; line-height:1; touch-action:none; transform: translate(-50%, -92%); will-change: top, left; }
.snekugle-fig span { display:inline-block; transform-origin: 50% 100%; }
.snekugle-fig.drop { transition: top .5s cubic-bezier(.34,1.56,.64,1); }
.snekugle-fig.hop span { animation: snekugle-hop .5s ease; }
.snekugle-fig.lift span { transform: scale(1.15); filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.3)); }
.snekugle-fig.poof { transition: opacity .3s, transform .3s; opacity:0; transform: translate(-50%, -92%) scale(0); }
@keyframes snekugle-hop { 0%,100%{transform:none} 30%{transform:translateY(-35%) scale(.95,1.08)} 60%{transform:scale(1.1,.9)} }
.snekugle-tray { position:absolute; display:grid; gap:1.2vmin; padding:1.4vmin; background:rgba(255,255,255,.18);
  border-radius:3vmin; }
.snekugle-src { display:flex; align-items:center; justify-content:center; border-radius:2vmin; background:rgba(255,255,255,.9);
  box-shadow: 0 .5vmin 0 rgba(0,0,0,.15); touch-action:none; line-height:1; }
.snekugle-themes { position:absolute; display:flex; gap:1.4vmin; }
.snekugle-theme { border:none; padding:0; border-radius:50%; background:rgba(255,255,255,.25); line-height:1;
  transition: transform .15s, background .15s; touch-action:manipulation; }
.snekugle-theme.on { background:#ffd23f; transform: scale(1.12); box-shadow: 0 .6vmin 0 rgba(0,0,0,.2); }
`;

const BASE_SVG = `<svg viewBox="0 0 300 120" class="snekugle-base" preserveAspectRatio="none">
  <path d="M40 18 Q150 -2 260 18 L282 100 Q150 128 18 100 Z" fill="#c8323f" stroke="#4a3b5c" stroke-width="6" stroke-linejoin="round"/>
  <path d="M30 56 Q150 76 270 56" fill="none" stroke="#ffd23f" stroke-width="10" stroke-linecap="round"/>
  <path d="M30 56 Q150 76 270 56" fill="none" stroke="#4a3b5c" stroke-width="3" opacity=".35"/>
  <ellipse cx="150" cy="17" rx="112" ry="13" fill="#e04a57" stroke="#4a3b5c" stroke-width="6"/>
  <path d="M150 74 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 z" fill="#ffd23f" stroke="#4a3b5c" stroke-width="3.5" stroke-linejoin="round"/>
  <g class="key"><rect x="280" y="64" width="16" height="8" rx="3" fill="#ffd23f" stroke="#4a3b5c" stroke-width="3"/>
    <path d="M294 52 q14 -2 14 16 q0 18 -14 16 z" fill="#ffd23f" stroke="#4a3b5c" stroke-width="3.5" stroke-linejoin="round"/></g>
</svg>`;

const TUNE = [4, 6, 7, 6, 4, 2, 4, 5, 4, 2, 0, 2, 4, 2, 0];   // pentatonic steps for the music box

export default {
  id: 'snekugle',
  title: 'Snekugle',
  icon: '⛄',
  color: '#4cc9f0',
  edge: '#232b70',

  start(root, kit) {
    // (style, not a class: the stage element is reused by the next game)
    root.style.background = 'radial-gradient(ellipse at 50% 30%, #4b4fb0 0%, #2d3a8c 55%, #222a6e 100%)';
    kit.injectCSS(root, CSS);
    root.insertAdjacentHTML('beforeend', '<div class="snekugle-stars"></div>');
    const t = kit.timers();

    const globe = document.createElement('div');
    globe.className = 'snekugle-globe';
    globe.innerHTML = '<div class="snekugle-scene"><div class="snekugle-mound"></div><canvas></canvas></div><div class="snekugle-glass"></div>';
    const scene = globe.querySelector('.snekugle-scene'), mound = globe.querySelector('.snekugle-mound');
    const cv = globe.querySelector('canvas'), ctx = cv.getContext('2d');
    root.insertAdjacentHTML('beforeend', BASE_SVG);
    const base = root.querySelector('.snekugle-base');
    const tray = document.createElement('div');
    tray.className = 'snekugle-tray';
    const themesEl = document.createElement('div');
    themesEl.className = 'snekugle-themes';
    root.append(globe, tray, themesEl);
    root.appendChild(base);   // base in front of the globe's foot

    let W = 0, H = 0, GR = 100, gx = 0, gy = 0, cell = 80, dpr = 1;
    let theme = 0, parts = [], swirl = 0, tilt = 0, tiltV = 0, energy = 0, raf = 0, last = performance.now();
    const figs = [];   // { el, fig, u } – u: x position inside the globe in globe radii (0..2)

    // ---------- geometry (globe-local px) ----------
    const moundGeo = () => ({ cx: GR, cy: GR * 1.9, rx: GR * 1.15, ry: GR * 0.56 });
    function groundY(x) {
      const m = moundGeo(), k = (x - m.cx) / m.rx;
      return k * k >= 1 ? 2 * GR : m.cy - m.ry * Math.sqrt(1 - k * k);
    }

    // ---------- particles ----------
    const sprites = {};
    function sprite(kind, col) {
      const key = kind + col;
      if (sprites[key]) return sprites[key];
      const S = 48, c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      g.translate(S / 2, S / 2);
      if (kind === 'snow') {
        const rg = g.createRadialGradient(0, 0, 0, 0, 0, S / 2);
        rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.45, 'rgba(255,255,255,.95)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, S / 2, 0, 7); g.fill();
      } else if (kind === 'glitter') {
        g.fillStyle = col; g.beginPath();
        g.moveTo(0, -S / 2); g.lineTo(S / 6, 0); g.lineTo(0, S / 2); g.lineTo(-S / 6, 0); g.closePath(); g.fill();
        g.moveTo(-S / 2, 0); g.lineTo(0, -S / 7); g.lineTo(S / 2, 0); g.lineTo(0, S / 7); g.closePath(); g.fill();
      } else if (kind === 'heart') {
        const s = S / 2.3;
        g.fillStyle = col; g.strokeStyle = 'rgba(74,59,92,.6)'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(0, s * .9);
        g.bezierCurveTo(-s * 1.3, -s * .1, -s * .6, -s * 1.1, 0, -s * .4);
        g.bezierCurveTo(s * .6, -s * 1.1, s * 1.3, -s * .1, 0, s * .9); g.fill(); g.stroke();
      } else if (kind === 'star') {
        const s = S / 2.2;
        g.fillStyle = col; g.strokeStyle = 'rgba(74,59,92,.55)'; g.lineWidth = 2.5; g.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .45 : s; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        g.closePath(); g.fill(); g.stroke();
      } else {   // bubble
        const s = S / 2 - 2;
        const rg = g.createRadialGradient(-s * .3, -s * .3, 1, 0, 0, s);
        rg.addColorStop(0, 'rgba(255,255,255,.5)'); rg.addColorStop(.7, 'rgba(200,245,255,.12)'); rg.addColorStop(1, 'rgba(255,255,255,.55)');
        g.fillStyle = rg; g.beginPath(); g.arc(0, 0, s, 0, 7); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(-s * .38, -s * .42, s * .2, s * .12, -.7, 0, 7); g.fill();
      }
      return (sprites[key] = c);
    }

    function makeParts() {
      const th = THEMES[theme], u = GR / 140;
      parts = [];
      for (let i = 0; i < th.n; i++) {
        // start spread through the globe so a theme change looks like a fresh shake
        let x, y;
        do { x = kit.rand(0, 2 * GR); y = kit.rand(0, 2 * GR); } while (Math.hypot(x - GR, y - GR) > GR * .9 || y > groundY(x) - 4);
        parts.push({
          x, y, vx: kit.rand(-1, 1) * GR * .3, vy: kit.rand(-1, 1) * GR * .3,
          r: kit.rand(th.r[0], th.r[1]) * u, fall: kit.rand(.6, 1.4), rot: kit.rand(0, 6.28), vr: kit.rand(-2, 2),
          ph: kit.rand(0, 6.28), img: sprite(th.kind, th.cols ? kit.pick(th.cols) : '#fff'),
        });
      }
      energy = 1;
    }

    function setTheme(i, speak) {
      theme = i;
      const th = THEMES[i];
      scene.style.background = `radial-gradient(circle at 50% 35%, ${th.sky[0]}, ${th.sky[1]})`;
      mound.style.background = `radial-gradient(ellipse at 50% 20%, ${th.mound[0]}, ${th.mound[1]})`;
      themeBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      makeParts();
      if (speak) { kit.sfx.chime(); t.later(() => kit.say(th.name + '!'), 250); }
    }

    // stir: (dx, dy) is how far the globe was moved, in px; the liquid lags behind, so flakes go the other way
    function stir(dx, dy, px, py) {
      let m = Math.hypot(dx, dy);
      if (!m) return;
      if (m > 30) { dx *= 30 / m; dy *= 30 / m; m = 30; }   // a wild swipe shouldn't fling everything to the top
      const k = GR / 300;
      for (const p of parts) {
        const near = px == null ? 1 : Math.max(.35, 1 - Math.hypot(p.x - px, p.y - py) / (GR * 1.4));
        p.vx += (dx * 1.6 + kit.rand(-1, 1) * m * 2.4) * near * k;
        p.vy += (dy * 1.6 + kit.rand(-1, 1) * m * 2.4 - m * (p.y > GR ? 1.6 : .6)) * near * k;
      }
      swirl += (dx > 0 ? 1 : -1) * Math.min(m, 30) * .006;
      tiltV += dx * .02;
      energy = Math.min(1.5, energy + m / 60);
      shakeSound(m);
    }

    // ---------- sound ----------
    let lastSwish = 0, noteStep = 4, lastNote = 0;
    function shakeSound(m) {
      const now = performance.now();
      if (now - lastSwish < 130 || m < 6) return;
      lastSwish = now;
      kit.noise({ dur: .22, vol: Math.min(.14, .03 + m / 400), freq: 1800, q: .7, sweep: 3500 });
    }
    function musicBox(step, at = 0, vol = .09) {
      const f = kit.scaleHz(step, 1046.5);
      kit.tone(f, { at, dur: 1.4, vol, attack: .002 });
      kit.tone(f * 3, { at, dur: .25, vol: vol * .18, attack: .002 });
    }
    function twinkle(now) {
      // the more the flakes move, the more the music box plinks
      if (energy < .12 || now - lastNote < 420 - energy * 230) return;
      lastNote = now;
      noteStep = Math.max(0, Math.min(9, noteStep + kit.pick([-2, -1, 1, 1, 2])));
      musicBox(noteStep, 0, .04 + Math.min(.06, energy * .05));
    }
    let tuneEnd = 0;
    function playTune(notes = TUNE.length) {
      base.classList.remove('wind');
      base.classList.add('play');
      const tune = [];
      while (tune.length < notes) tune.push(...TUNE);
      tune.length = notes;
      tune.forEach((s, i) => musicBox(s, i * .2, .1));
      stir(0, -12, GR, GR * 1.6);
      const end = performance.now() + notes * 200 + 300;
      tuneEnd = end;
      t.later(() => { if (tuneEnd === end) base.classList.remove('play'); }, notes * 200 + 300);
    }
    // hold the base to wind the music box; let go and it plays
    let wind = null;
    function windStart() {
      if (wind) windStop();
      base.classList.remove('play');
      base.classList.add('wind');
      wind = { clicks: 0, id: t.every(() => {
        wind.clicks++;
        kit.tone(2400 + (wind.clicks % 2) * 300, { dur: .03, vol: .05, attack: .001 });
        if (wind.clicks >= 16) windStop();   // fully wound (also the safety net if iOS loses the finger)
      }, 180) };
      kit.tone(2400, { dur: .03, vol: .05, attack: .001 });
    }
    function windStop() {
      if (!wind) return;
      clearInterval(wind.id);
      const n = Math.max(TUNE.length, Math.min(45, wind.clicks * 3));
      wind = null;
      playTune(n);
    }

    // ---------- animation ----------
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.033, (now - last) / 1000);
      last = now;
      const th = THEMES[theme], drag = Math.exp(-2.4 * dt), grav = th.g * GR * .3;
      let moving = 0;
      swirl *= Math.exp(-.9 * dt);
      for (const p of parts) {
        // swirl around the middle, gentle wander, gravity, water drag
        const ox = p.x - GR, oy = p.y - GR;
        p.vx += (-oy * swirl * 2.2 + Math.sin(now / 900 + p.ph) * GR * .02) * dt;
        p.vy += (ox * swirl * 2.2 + grav * p.fall) * dt;
        p.vx *= drag; p.vy *= drag;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt * (1 + Math.abs(p.vx) / GR);
        // glass wall
        const d = Math.hypot(p.x - GR, p.y - GR), lim = GR * .97 - p.r;
        if (d > lim) {
          const nx = (p.x - GR) / d, ny = (p.y - GR) / d, vn = p.vx * nx + p.vy * ny;
          p.x = GR + nx * lim; p.y = GR + ny * lim;
          if (vn > 0) { p.vx -= 1.2 * vn * nx; p.vy -= 1.2 * vn * ny; }
        }
        // settle on the mound (bubbles float, so they rest against the top of the glass instead)
        const gy2 = groundY(p.x) - p.r * .4;
        if (p.y > gy2) { p.y = gy2; if (p.vy > 0) p.vy = 0; p.vx *= .85; }
        moving += Math.abs(p.vx) + Math.abs(p.vy);
      }
      energy = energy * .9 + .1 * (moving / Math.max(1, parts.length)) / (GR * .25);
      twinkle(now);

      // the globe rocks a little when shaken, and springs back
      tiltV += -tilt * 40 * dt; tiltV *= Math.exp(-5 * dt); tilt += tiltV * dt * 10;
      tilt = Math.max(-8, Math.min(8, tilt));
      if (!ptrs.size) {   // let go: spring back to the middle with a little wobble
        offV[0] += -off[0] * 90 * dt; offV[1] += -off[1] * 90 * dt;
        offV[0] *= Math.exp(-6 * dt); offV[1] *= Math.exp(-6 * dt);
        const ox = off[0], oy = off[1];
        off[0] += offV[0] * dt; off[1] += offV[1] * dt;
        if (Math.abs(offV[0]) + Math.abs(offV[1]) > 20) stir(off[0] - ox, off[1] - oy);
      }
      globe.style.transform = `translate(${off[0]}px, ${off[1]}px) rotate(${tilt}deg)`;
      base.style.transform = `translate(${off[0]}px, ${off[1]}px)`;
      // idle hint: a hand shows the shake
      if (now - lastTouch > 7000) { lastTouch = now; showHand(); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, 2 * GR, 2 * GR);
      for (const p of parts) {
        const s = p.r * 2;
        ctx.save();
        ctx.translate(p.x, p.y);
        if (th.kind !== 'snow' && th.kind !== 'bubble') ctx.rotate(p.rot);
        if (th.kind === 'glitter') ctx.globalAlpha = .55 + .45 * Math.sin(now / 160 + p.ph);
        ctx.drawImage(p.img, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    }

    // ---------- layout ----------
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const portrait = H > W, oldGR = GR;
      if (portrait) {
        GR = Math.min(W * .38, H * .23); gx = W / 2; gy = H * .42;
        cell = Math.min((W * .94 - 90) / 7, H * .075);
        tray.style.gridTemplateColumns = 'repeat(7, 1fr)';
        Object.assign(tray.style, { left: '50%', top: 'auto', bottom: '3vh', transform: 'translateX(-50%)' });
        themesEl.style.flexDirection = 'row';
        Object.assign(themesEl.style, { left: '50%', top: 'calc(env(safe-area-inset-top) + 14px)', right: 'auto', transform: 'translateX(-50%)' });
      } else {
        GR = Math.min(H * .34, W * .25); gx = W / 2; gy = H * .42;
        cell = Math.min(H * .105, W * .07);
        tray.style.gridTemplateColumns = 'repeat(2, 1fr)';
        Object.assign(tray.style, { left: '3vw', top: '50%', bottom: 'auto', transform: 'translateY(-50%)' });
        themesEl.style.flexDirection = 'column';
        Object.assign(themesEl.style, { left: 'auto', right: '3vw', top: '50%', transform: 'translateY(-50%)' });
      }
      Object.assign(globe.style, { left: gx - GR + 'px', top: gy - GR + 'px', width: 2 * GR + 'px', height: 2 * GR + 'px' });
      globe.style.setProperty('--rim', Math.max(3, GR * .025) + 'px');
      const m = moundGeo();
      Object.assign(mound.style, { left: m.cx - m.rx + 'px', top: m.cy - m.ry + 'px', width: 2 * m.rx + 'px', height: 2 * m.ry + 'px' });
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = cv.height = Math.round(2 * GR * dpr);
      cv.style.width = cv.style.height = 2 * GR + 'px';
      const bw = GR * 1.6, bh = GR * .62;
      Object.assign(base.style, { left: gx - bw / 2 + 'px', top: gy + GR * .74 + 'px', width: bw + 'px', height: bh + 'px' });
      srcs.forEach(s => { s.style.width = s.style.height = cell + 'px'; s.style.fontSize = cell * .66 + 'px'; });
      themeBtns.forEach(b => { b.style.width = b.style.height = cell * 1.05 + 'px'; b.style.fontSize = cell * .6 + 'px'; });
      if (oldGR && oldGR !== GR) for (const p of parts) { p.x *= GR / oldGR; p.y *= GR / oldGR; p.r *= GR / oldGR; p.vx = p.vy = 0; }
      figs.forEach(placeFig);
    }

    function sizeFig(el, fig) { el.style.fontSize = 2 * GR * fig[2] * .5 + 'px'; }
    function placeFig(f) {
      sizeFig(f.el, f.fig);
      const x = f.u * GR;
      f.el.style.left = x + 'px';
      f.el.style.top = groundY(x) + GR * .05 + 'px';
    }
    const inGlobe = (x, y) => Math.hypot(x - gx, y - gy) < GR * 1.05;

    function poof(el) {
      el.classList.add('poof');
      kit.sfx.whoosh();
      setTimeout(() => el.remove(), 320);
    }

    // drop a figure into the globe at screen point (x, y): it falls onto the mound
    function dropIn(el, fig, x, y) {
      const lx = Math.max(GR * .3, Math.min(GR * 1.7, x - (gx - GR)));
      const ly = Math.max(GR * .2, y - (gy - GR));
      el.className = 'snekugle-fig';
      el.style.transform = '';
      sizeFig(el, fig);
      el.style.left = lx + 'px'; el.style.top = ly + 'px';
      scene.insertBefore(el, cv);
      const f = { el, fig, u: lx / GR };
      figs.push(f);
      if (figs.length > 9) poof(figs.shift().el);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('drop');
        el.style.top = groundY(lx) + GR * .05 + 'px';
      }));
      t.later(() => { el.classList.remove('drop'); kit.sfx.plop(); stir(0, 6, lx, groundY(lx)); }, 380);
      t.later(() => kit.say(fig[1] + '!', { pitch: 1.2 }), 500);
      bindFig(f);
    }

    // figures already in the globe: tap to make them hop, drag to move, drag out to remove
    function bindFig(f) {
      let sx = 0, sy = 0, moved = false;
      kit.draggable(f.el, {
        start(e) { sx = e.clientX; sy = e.clientY; moved = false; },
        move(e) {
          if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 10) return;
          if (!moved) {
            moved = true;
            figs.splice(figs.indexOf(f), 1);
            f.el.classList.add('lift');
            f.el.style.transform = 'translate(-50%, -92%)';
            root.appendChild(f.el);
            kit.sfx.pickUp();
          }
          f.el.style.left = e.clientX + 'px'; f.el.style.top = e.clientY + f.el.offsetHeight * .4 + 'px';
        },
        end(e) {
          if (!moved) { kit.replay(f.el, 'hop'); kit.sfx.boing(); return; }
          if (inGlobe(e.clientX, e.clientY)) dropIn(f.el, f.fig, e.clientX, e.clientY);
          else poof(f.el);
        },
      });
    }

    const srcs = FIGS.map(fig => {
      const s = document.createElement('div');
      s.className = 'snekugle-src';
      s.textContent = fig[0];
      tray.appendChild(s);
      let el = null;
      kit.draggable(s, {
        start(e) {
          el = document.createElement('div');
          el.className = 'snekugle-fig lift';
          el.innerHTML = `<span>${fig[0]}</span>`;
          sizeFig(el, fig);
          el.style.zIndex = 50;
          root.appendChild(el);
          el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px';
          kit.sfx.pickUp();
        },
        move(e) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + el.offsetHeight * .4 + 'px'; },
        end(e) {
          el.style.zIndex = '';
          if (inGlobe(e.clientX, e.clientY)) dropIn(el, fig, e.clientX, e.clientY);
          else poof(el);
          el = null;
        },
      });
      return s;
    });

    const themeBtns = THEMES.map((th, i) => {
      const b = document.createElement('button');
      b.className = 'snekugle-theme';
      b.textContent = th.btn;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (i !== theme) setTheme(i, true); else stir(20, -10); });
      themesEl.appendChild(b);
      return b;
    });

    // grab the globe and shake it: it follows the finger (within limits) and the flakes lag behind
    const ptrs = new Map(), off = [0, 0], offV = [0, 0];
    let lastTouch = performance.now();
    function puff(px, py) {
      // a tap puffs up the flakes around the finger, including the ones resting on the mound
      for (const p of parts) {
        const d = Math.hypot(p.x - px, p.y - py);
        if (d > GR * .55) continue;
        const k = (1 - d / (GR * .55)) * GR * 2.2, a = Math.atan2(p.y - py, p.x - px);
        p.vx += Math.cos(a) * k * .6 + kit.rand(-.2, .2) * k;
        p.vy += Math.sin(a) * k * .6 - k * .9;
      }
      energy = Math.min(1.5, energy + .5);
      kit.noise({ dur: .18, vol: .07, freq: 2200, q: .7, sweep: 4000 });
    }
    globe.addEventListener('pointerdown', e => {
      e.preventDefault();
      lastTouch = performance.now();
      // a new touch always wins: forget fingers iOS may have lost
      for (const id of [...ptrs.keys()]) if (id !== e.pointerId) ptrs.delete(id);
      try { globe.setPointerCapture(e.pointerId); } catch (err) {}
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      offV[0] = offV[1] = 0;
      puff(e.clientX - (gx - GR) - off[0], e.clientY - (gy - GR) - off[1]);
    });
    globe.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      lastTouch = performance.now();
      const lim = GR * .3, dx = e.clientX - p[0], dy = e.clientY - p[1];
      const nx = Math.max(-lim, Math.min(lim, off[0] + dx)), ny = Math.max(-lim * .6, Math.min(lim * .6, off[1] + dy));
      const mx = nx - off[0], my = ny - off[1];
      off[0] = nx; off[1] = ny;
      // the glass moves by (mx, my); the finger's full movement still stirs a bit even at the limit
      stir(mx * 1.6 + dx * .4, my * 1.6 + dy * .4, e.clientX - (gx - GR) - off[0], e.clientY - (gy - GR) - off[1]);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    });
    const up = e => { ptrs.delete(e.pointerId); lastTouch = performance.now(); };
    globe.addEventListener('pointerup', up);
    globe.addEventListener('pointercancel', up);
    base.addEventListener('pointerdown', e => { e.preventDefault(); lastTouch = performance.now(); windStart(); });
    base.addEventListener('pointerup', windStop);
    base.addEventListener('pointercancel', windStop);
    base.addEventListener('pointerleave', windStop);

    const hand = document.createElement('div');
    hand.className = 'snekugle-hand';
    hand.textContent = '👆';
    root.appendChild(hand);
    function showHand() {
      Object.assign(hand.style, { left: gx - GR * .2 + 'px', top: gy - GR * .1 + 'px', fontSize: GR * .4 + 'px' });
      kit.replay(hand, 'show');
      tiltV += 6;   // the globe gives a little wobble too
    }

    // real shaking, only if motion events already flow (iOS needs a permission prompt, which we never show)
    let lastAcc = null;
    const onMotion = e => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null) return;
      if (lastAcc) {
        const dx = a.x - lastAcc.x, dy = a.y - lastAcc.y;
        if (Math.hypot(dx, dy) > 4) stir(-dx * 3, dy * 3);
      }
      lastAcc = { x: a.x, y: a.y };
    };
    addEventListener('devicemotion', onMotion);

    layout();
    setTheme(0, false);
    raf = requestAnimationFrame(frame);
    const offResize = kit.onResize(root, layout);
    return () => { cancelAnimationFrame(raf); t.clear(); offResize(); removeEventListener('devicemotion', onMotion); };
  },
};
