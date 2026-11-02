/* Akvariet: make your own fish and fill a tank.
 *   - The panel builds a fish: tap the buttons for body, tail, colour, pattern and eyes; the big fish changes.
 *   - Drag the big fish into the water (or just tap it) and it swims off. Its colour is named in Danish.
 *   - The bottom row adds friends: crab, octopus, turtle, pufferfish, whale.
 *   - Tap the water to sprinkle food: it sinks and the fish race to eat it (and grow a little).
 *   - Tap a fish and it does a somersault. Tap a bubble to pop it. Tap the treasure chest to open it.
 */
import { fishSVG, BODIES, TAILS, COLOURS, PATTERNS, EYES, WEED, CHEST } from './art/akvarie-art.js';

const COLOUR_NAMES = ['Orange', 'Rød', 'Gul', 'Blå', 'Grøn', 'Lilla'];
// emoji, name, which way the emoji faces (1 = right), how it moves
const FRIENDS = [['🦀', 'Krabbe', 1, 'walk'], ['🐙', 'Blæksprutte', 1, 'float'], ['🐢', 'Skildpadde', -1, 'swim'],
  ['🐡', 'Kuglefisk', -1, 'swim'], ['🐳', 'Hval', -1, 'swim']];
const MAX = 18;

const CSS = `
.akv-water { position:absolute; inset:0; overflow:hidden; touch-action:none;
  background: linear-gradient(#bfeaff, #5ec2f2 55%, #2f9fdc); }
.akv-rays { position:absolute; inset:0; pointer-events:none; opacity:.25;
  background: repeating-linear-gradient(100deg, transparent 0 6%, rgba(255,255,255,.7) 7% 9%, transparent 10% 16%);
  animation: akv-rays 9s ease-in-out infinite alternate; }
@keyframes akv-rays { to { transform: translateX(4%) } }
.akv-floor { position:absolute; left:0; right:0; bottom:0; pointer-events:none; }
.akv-floor svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
.akv-weed { transform-box: view-box; animation: akv-sway 3.2s ease-in-out infinite alternate; }
.akv-weed:nth-child(2n) { animation-duration: 2.6s; animation-delay: -1s; }
@keyframes akv-sway { from { transform: rotate(-7deg) } to { transform: rotate(7deg) } }
.akv-chest { position:absolute; pointer-events:auto; touch-action:none; }
.akv-chestsvg { width:100%; height:100%; overflow:visible; }
.akv-chestsvg .akv-lid { transform-box: fill-box; transform-origin: 0% 100%; transition: transform .4s cubic-bezier(.3,1.5,.5,1); }
.akv-chest.open .akv-lid { transform: rotate(-40deg) translateY(-6%); }
.akv-swim { position:absolute; left:0; top:0; will-change: transform; touch-action:none; }
.akv-turn { width:100%; height:100%; transition: transform .35s ease; }
.akv-flip { width:100%; height:100%; }
.akv-flip.spin { animation: akv-spin .7s ease; }
.akv-flip.gulp { animation: akv-gulp .3s ease; }
.akv-flip.pop-in { animation: akv-pop .5s cubic-bezier(.3,1.6,.5,1); }
@keyframes akv-spin { 0% { transform:none } 100% { transform: rotate(-360deg) } }
@keyframes akv-gulp { 50% { transform: scale(1.15, .9) } }
@keyframes akv-pop { from { transform: scale(0) } to { transform:none } }
.akv-fishsvg { width:100%; height:100%; overflow:visible; display:block; }
.akv-tail { transform-box: fill-box; transform-origin: 100% 50%; animation: akv-wag .45s ease-in-out infinite alternate; }
@keyframes akv-wag { from { transform: rotate(-16deg) } to { transform: rotate(16deg) } }
.akv-fin { transform-box: fill-box; transform-origin: 100% 0%; animation: akv-wag .6s ease-in-out infinite alternate; }
.akv-emoji { width:100%; height:100%; display:flex; align-items:center; justify-content:center; line-height:1; }
.akv-food { position:absolute; left:0; top:0; width:10px; height:10px; border-radius:40%; pointer-events:none;
  background:#c4732f; box-shadow: inset -2px -2px 0 rgba(0,0,0,.2); }
.akv-bub { position:absolute; left:0; top:0; border-radius:50%; touch-action:none;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), rgba(255,255,255,.25) 45%, rgba(255,255,255,.1));
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.7); }
.akv-panel { position:absolute; z-index:5; display:flex; gap:1.4vmin; padding:1.6vmin; border-radius:3vmin;
  background: rgba(255,255,255,.78); box-shadow: 0 1vmin 0 rgba(0,0,0,.1); touch-action:none; }
.akv-preview { position:relative; flex: none; border-radius:2.4vmin; background: linear-gradient(#e6f7ff, #bfe7fb);
  touch-action:none; display:flex; align-items:center; justify-content:center; }
.akv-preview .akv-big { width:88%; height:88%; animation: akv-bob 1.6s ease-in-out infinite; }
.akv-preview .akv-big.pop-in { animation: akv-pop .4s cubic-bezier(.3,1.6,.5,1); }
.akv-preview::after { content:'👆'; position:absolute; right:4%; bottom:2%; font-size: 2.2em; animation: akv-hint 1.4s ease-in-out infinite; }
@keyframes akv-bob { 0%,100% { transform:none } 50% { transform: translateY(-5%) rotate(-3deg) } }
@keyframes akv-hint { 0%,100% { transform:none } 50% { transform: translate(-20%, -20%) } }
.akv-rows { display:flex; flex-direction:column; justify-content:space-between; gap:1vmin; flex:1; }
.akv-row { display:flex; gap:1vmin; justify-content:space-between; }
.akv-opt { flex:1; height: var(--cell); min-width:0; overflow:hidden; border:none; padding:0; border-radius:1.6vmin; background:#fff; box-shadow: 0 .5vmin 0 rgba(0,0,0,.1);
  display:flex; align-items:center; justify-content:center; line-height:1; transition: transform .12s; }
.akv-opt.on { box-shadow: 0 0 0 .6vmin #ffd23f, 0 .5vmin 0 rgba(0,0,0,.1); }
.akv-opt:active { transform: scale(.9); }
.akv-opt svg { width:86%; height:86%; overflow:visible; }
.akv-opt.eye svg { overflow:hidden; width:100%; height:100%; }
.akv-opt .akv-tail, .akv-opt .akv-fin { animation:none; }
.akv-swatch { width: calc(var(--cell) * .62); height: calc(var(--cell) * .62); flex:none; border-radius:50%; box-shadow: inset 0 -.6vmin 0 rgba(0,0,0,.18); border: .5vmin solid #4a3b5c; }
.akv-ghost { position:absolute; left:0; top:0; z-index:20; pointer-events:none; filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
`;

export default {
  id: 'akvarie',
  title: 'Akvariet',
  icon: '🐠',
  color: '#00a6fb',
  edge: '#2f9fdc',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const water = document.createElement('div');
    water.className = 'akv-water';
    water.innerHTML = '<div class="akv-rays"></div><div class="akv-floor"><svg></svg></div>';
    const floor = water.querySelector('.akv-floor'), floorSvg = floor.querySelector('svg');
    const chest = document.createElement('div');
    chest.className = 'akv-chest';
    chest.innerHTML = CHEST;
    floor.appendChild(chest);
    const panel = document.createElement('div');
    panel.className = 'akv-panel';
    panel.innerHTML = '<div class="akv-preview"></div><div class="akv-rows"></div>';
    const preview = panel.querySelector('.akv-preview'), rows = panel.querySelector('.akv-rows');
    root.append(water, panel);

    let W = 0, H = 0, sc = 1, sandY = 0, bounds = { x0: 0, x1: 0, y0: 0, y1: 0 }, portrait = false;
    let raf = 0, last = 0, made = 0, bubT = 0;
    const cfg = { body: 'oval', tail: 'fan', colour: 0, pattern: 'stripes', eyes: 'normal' };
    const swimmers = [], food = [], bubbles = [];

    // ---------- the maker panel ----------
    function drawPreview(pop) {
      preview.innerHTML = `<div class="akv-big${pop ? ' pop-in' : ''}">${fishSVG(cfg)}</div>`;
    }
    function optButton(row, html, on, fn, cls = '') {
      const b = document.createElement('button');
      b.className = 'akv-opt' + (on ? ' on' : '') + (cls ? ' ' + cls : '');
      b.innerHTML = html;
      b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); fn(); });
      row.appendChild(b);
    }
    function drawRows() {
      rows.innerHTML = '';
      const row = () => { const r = document.createElement('div'); r.className = 'akv-row'; rows.appendChild(r); return r; };
      const set = (key, val, step) => () => { cfg[key] = val; kit.sfx.blip(step); drawPreview(true); drawRows(); };
      let r = row();
      Object.keys(BODIES).forEach((b, i) => optButton(r, fishSVG({ ...cfg, body: b }), cfg.body === b, set('body', b, i + 3)));
      r = row();
      Object.keys(TAILS).forEach((tl, i) => optButton(r, fishSVG({ ...cfg, tail: tl }), cfg.tail === tl, set('tail', tl, i + 5)));
      r = row();
      COLOURS.forEach((c, i) => optButton(r, `<div class="akv-swatch" style="background:${c[0]}"></div>`, cfg.colour === i, () => {
        set('colour', i, i + 2)();
        kit.say(COLOUR_NAMES[i] + '!', { pitch: 1.25 });
      }));
      r = row();
      PATTERNS.forEach((p, i) => optButton(r, fishSVG({ ...cfg, pattern: p }), cfg.pattern === p, set('pattern', p, i + 4)));
      r = row();
      // eyes: show a close-up of the head
      EYES.forEach((ey, i) => optButton(r, fishSVG({ ...cfg, eyes: ey }).replace('viewBox="-120 -90 240 180"', 'viewBox="-34 -74 140 105"'),
        cfg.eyes === ey, set('eyes', ey, i + 6), 'eye'));
      r = row();
      FRIENDS.forEach((f, i) => optButton(r, `<span style="font-size:${cell * 0.62}px">${f[0]}</span>`, false, () => addFriend(i)));
    }
    let cell = 60;

    // drag the big fish into the water, or just tap it
    let ghost = null, downAt = null;
    kit.draggable(preview, {
      start(e) {
        downAt = [e.clientX, e.clientY];
        ghost = document.createElement('div');
        ghost.className = 'akv-ghost';
        ghost.innerHTML = fishSVG(cfg);
        const w = fishSize();
        Object.assign(ghost.style, { width: w + 'px', height: w * 0.75 + 'px' });
        root.appendChild(ghost);
        moveGhost(e);
        kit.sfx.pickUp();
      },
      move: e => moveGhost(e),
      end(e) {
        const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const tapped = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 14;
        ghost.remove(); ghost = null;
        if (!tapped && inPanel(x, y)) { kit.sfx.boing(); return; }
        const pr = preview.getBoundingClientRect();
        const from = tapped ? [pr.left + pr.width / 2 - r.left, pr.top + pr.height / 2 - r.top] : [x, y];
        releaseFish(from, tapped);
      },
    });
    function moveGhost(e) {
      const r = root.getBoundingClientRect(), w = fishSize();
      ghost.style.transform = `translate(${e.clientX - r.left - w / 2}px, ${e.clientY - r.top - w * 0.375}px)`;
    }
    const fishSize = () => kit.rand(120, 165) * sc;
    function inPanel(x, y) {
      const p = panel.getBoundingClientRect(), r = root.getBoundingClientRect();
      return x > p.left - r.left && x < p.right - r.left && y > p.top - r.top && y < p.bottom - r.top;
    }

    function releaseFish([x, y], fromPanel) {
      const f = addSwimmer(fishSVG(cfg), { x, y, size: fishSize(), base: 1, kind: 'fish' });
      if (fromPanel) f.target = randomPoint();   // swim out of the panel
      kit.sfx.plop();
      kit.say(COLOUR_NAMES[cfg.colour] + ' fisk!', { pitch: 1.3 });
      made++;
      if (made % 5 === 0) t.later(() => { kit.sfx.fanfare(); kit.burst(x, y, 70); }, 400);
      // next fish: new colour and pattern so it doesn't look the same
      cfg.colour = (cfg.colour + 1 + Math.floor(Math.random() * (COLOURS.length - 1))) % COLOURS.length;
      cfg.pattern = kit.pick(PATTERNS);
      drawPreview(true); drawRows();
    }

    function addFriend(i) {
      const [emoji, name, face, how] = FRIENDS[i];
      const size = (how === 'walk' ? 90 : emoji === '🐳' ? 170 : 120) * sc;
      const start = how === 'walk' ? { x: kit.rand(bounds.x0, bounds.x1), y: sandY - size * 0.35 } : randomPoint();
      addSwimmer(`<div class="akv-emoji" style="font-size:${size * 0.8}px">${emoji}</div>`, { ...start, size, base: face, kind: how });
      kit.sfx.chime();
      kit.say(name + '!', { pitch: 1.25 });
    }

    // ---------- swimmers ----------
    function randomPoint() {
      return { x: kit.rand(bounds.x0, bounds.x1), y: kit.rand(bounds.y0, bounds.y1) };
    }
    function addSwimmer(html, { x, y, size, base, kind }) {
      const el = document.createElement('div');
      el.className = 'akv-swim';
      el.innerHTML = `<div class="akv-turn"><div class="akv-flip pop-in">${html}</div></div>`;
      water.appendChild(el);
      const f = { el, turn: el.firstChild, flip: el.firstChild.firstChild, x, y, vx: 0, vy: 0, size, base, kind,
        grow: 1, dir: Math.random() < 0.5 ? 1 : -1, target: null, speed: kit.rand(70, 120) * sc * (kind === 'float' ? 0.4 : kind === 'walk' ? 0.6 : 1),
        phase: Math.random() * 6 };
      f.target = kind === 'walk' ? { x: kit.rand(bounds.x0, bounds.x1), y } : randomPoint();
      sizeSwimmer(f);
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        kit.replay(f.flip, 'spin');
        kit.tone(kit.scaleHz(Math.round(10 - f.size / sc / 25)), { dur: 0.25, type: 'triangle', vol: 0.15, slide: kit.scaleHz(12) });
        for (let i = 0; i < 4; i++) t.later(() => bubble(f.x, f.y - f.size * 0.2, kit.rand(12, 22) * sc), i * 90);
        f.target = randomPoint();
      });
      swimmers.push(f);
      // too many: the oldest swims away
      const fishes = swimmers.filter(s => !s.leaving);
      if (fishes.length > MAX) {
        const old = fishes[0];
        old.leaving = true;
        old.target = { x: old.x < W / 2 ? -W : 2 * W, y: old.y };
      }
      return f;
    }
    function sizeSwimmer(f) {
      const w = f.size * f.grow;
      f.el.style.width = w + 'px';
      f.el.style.height = w * 0.75 + 'px';
    }

    // ---------- food and bubbles ----------
    water.addEventListener('pointerdown', e => {
      if (e.target.closest('.akv-chest')) return;
      e.preventDefault();
      const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = Math.min(e.clientY - r.top, sandY - 20);
      for (let i = 0; i < 7; i++) {
        const el = document.createElement('div');
        el.className = 'akv-food';
        water.appendChild(el);
        food.push({ el, x: x + kit.rand(-40, 40) * sc, y: y + kit.rand(-20, 10) * sc, vy: kit.rand(35, 60) * sc, age: 0, ph: Math.random() * 6 });
      }
      kit.sfx.rustle();
      [0, 1, 2].forEach(i => kit.tone(kit.scaleHz(9 + i * 2), { at: i * 0.05, dur: 0.08, vol: 0.06 }));
      swimmers.forEach(f => { f.target = null; });
    });

    function bubble(x, y, r) {
      const el = document.createElement('div');
      el.className = 'akv-bub';
      el.style.width = el.style.height = 2 * r + 'px';
      water.appendChild(el);
      const b = { el, x, y, r, ph: Math.random() * 6 };
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        kit.sfx.pop(Math.max(0, 9 - Math.round(r / sc / 5)));
        popBubble(b);
      });
      bubbles.push(b);
    }
    function popBubble(b) {
      const i = bubbles.indexOf(b);
      if (i >= 0) bubbles.splice(i, 1);
      b.el.remove();
    }

    chest.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      chest.classList.add('open');
      kit.sfx.chime();
      const r = root.getBoundingClientRect(), c = chest.getBoundingClientRect();
      const x = c.left + c.width / 2 - r.left, y = c.top - r.top;
      for (let i = 0; i < 14; i++) t.later(() => bubble(x + kit.rand(-30, 30) * sc, y, kit.rand(10, 30) * sc), i * 60);
      kit.burst(x, y, 50, 0.8);
      t.later(() => chest.classList.remove('open'), 1600);
    });

    // ---------- layout ----------
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      sc = Math.min(W, H) / 820;
      portrait = H > W;
      sandY = H - Math.max(70, H * 0.1);
      floor.style.height = H - sandY + 40 * sc + 'px';
      const fw = W, fh = H - sandY + 40 * sc, top = 40 * sc;
      floorSvg.setAttribute('viewBox', `0 0 ${fw} ${fh}`);
      const weeds = [];
      for (let x = 30; x < fw; x += kit.rand(70, 130) * sc) weeds.push(WEED(x, top + 20 * sc, kit.rand(90, 190) * sc, kit.pick(['#2ec4b6', '#06a77d', '#5fbf4e', '#ff8fab']), 26 * sc));
      floorSvg.innerHTML = `${weeds.join('')}
        <path d="M0 ${top + 14 * sc} Q${fw * 0.25} ${top - 6 * sc} ${fw * 0.5} ${top + 10 * sc} T${fw} ${top + 6 * sc} V${fh} H0 Z" fill="#f6dca2" stroke="#e0bd78" stroke-width="${4 * sc}"/>
        ${[0.15, 0.42, 0.7, 0.9].map((f, i) => `<ellipse cx="${fw * f}" cy="${top + 30 * sc}" rx="${(30 + i * 6) * sc}" ry="${16 * sc}" fill="#b8b1c9" stroke="#4a3b5c" stroke-width="${3.5 * sc}"/>`).join('')}`;
      const cw = 130 * sc;
      Object.assign(chest.style, { width: cw + 'px', height: cw * 0.66 + 'px', bottom: (H - sandY) * 0.45 + 'px',
        left: (portrait ? W * 0.72 : W * 0.82) + 'px' });

      if (portrait) {
        const pw = W - 32, ph = Math.min(H * 0.4, 470);
        cell = Math.min((pw * 0.62) / 6.4, ph / 7.2);
        Object.assign(panel.style, { left: '16px', right: 'auto', top: 'auto', bottom: H - sandY + 12 + 'px', width: pw + 'px', height: ph + 'px', flexDirection: 'row' });
        Object.assign(preview.style, { width: pw * 0.34 + 'px', height: '100%' });
        bounds = { x0: 80 * sc, x1: W - 80 * sc, y0: 120 * sc, y1: H - (H - sandY) - ph - 70 * sc };
      } else {
        const pw = Math.min(W * 0.36, 430), ph = H - 110 - (H - sandY) - 10;
        cell = Math.min(pw / 6.6, (ph - pw * 0.5) / 6.8);
        Object.assign(panel.style, { left: Math.max(16, W * 0.015) + 'px', right: 'auto', top: '96px', bottom: 'auto', width: pw + 'px', height: ph + 'px', flexDirection: 'column' });
        Object.assign(preview.style, { width: '100%', height: Math.max(110, ph - 6 * (cell + 8) - 30) + 'px' });
        bounds = { x0: pw + 90 * sc, x1: W - 80 * sc, y0: 110 * sc, y1: sandY - 80 * sc };
      }
      rows.style.setProperty('--cell', cell + 'px');
      drawRows();
      swimmers.forEach(f => { f.target = null; });
    }

    // ---------- the loop ----------
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      // food sinks, wobbling, and lies on the sand for a while
      for (let i = food.length - 1; i >= 0; i--) {
        const p = food[i];
        p.age += dt;
        if (p.y < sandY - 6) { p.y += p.vy * dt; p.x += Math.sin(p.age * 3 + p.ph) * 12 * sc * dt; }
        if (p.age > 9) { p.el.remove(); food.splice(i, 1); continue; }
        p.el.style.transform = `translate(${p.x - 5}px, ${p.y - 5}px) rotate(${p.age * 90}deg)`;
        p.el.style.opacity = p.age > 8 ? 9 - p.age : 1;
      }
      for (let i = swimmers.length - 1; i >= 0; i--) {
        const f = swimmers[i];
        const fishLike = f.kind === 'fish' || f.kind === 'swim';
        // fish chase the nearest food
        let goal = f.target;
        if (fishLike && food.length && !f.leaving) {
          let best = null, bd = Infinity;
          food.forEach(p => { const d = Math.hypot(p.x - f.x, p.y - f.y); if (d < bd) { bd = d; best = p; } });
          goal = best;
          const mouthX = f.x + f.dir * f.size * f.grow * 0.38;
          if (Math.hypot(best.x - mouthX, best.y - f.y) < 26 * sc + f.size * 0.08) {
            best.el.remove(); food.splice(food.indexOf(best), 1);
            kit.replay(f.flip, 'gulp');
            kit.tone(600, { dur: 0.1, vol: 0.12, slide: 900 });
            if (f.grow < 1.35) { f.grow += 0.04; sizeSwimmer(f); }
          }
        }
        if (!goal) goal = f.target = f.kind === 'walk' ? { x: kit.rand(bounds.x0, bounds.x1), y: f.y } : randomPoint();
        const dx = goal.x - f.x, dy = (f.kind === 'walk' ? 0 : goal.y - f.y), d = Math.hypot(dx, dy);
        if (d < 30 * sc && goal === f.target) {
          if (f.leaving) { f.el.remove(); swimmers.splice(i, 1); continue; }
          f.target = null;
        }
        const sp = f.speed * (food.length && fishLike ? 1.8 : 1) * (f.leaving ? 1.6 : 1);
        const want = d > 1 ? [dx / d * sp, dy / d * sp] : [0, 0];
        f.vx += (want[0] - f.vx) * Math.min(1, dt * 1.6);
        f.vy += (want[1] - f.vy) * Math.min(1, dt * 1.6);
        f.x += f.vx * dt; f.y += f.vy * dt;
        f.phase += dt;
        if (f.kind !== 'walk' && Math.abs(f.vx) > 10 * sc) f.dir = f.vx > 0 ? 1 : -1;
        const w = f.size * f.grow, h = w * 0.75;
        const tilt = fishLike ? Math.max(-22, Math.min(22, Math.atan2(f.vy, Math.abs(f.vx) + 1) * 57)) * f.dir : 0;
        const bob = f.kind === 'float' ? Math.sin(f.phase * 1.5) * 14 * sc : f.kind === 'walk' ? -Math.abs(Math.sin(f.phase * 9)) * 4 * sc : Math.sin(f.phase * 2) * 4 * sc;
        f.el.style.transform = `translate(${f.x - w / 2}px, ${f.y - h / 2 + bob}px) rotate(${tilt}deg)`;
        f.turn.style.transform = `scaleX(${f.kind === 'walk' || f.kind === 'float' ? 1 : f.dir * f.base})`;
      }
      // bubbles from the chest corner and the weeds
      bubT -= dt;
      if (bubT <= 0) { bubT = kit.rand(0.4, 1.1); bubble(kit.rand(W * 0.1, W * 0.95), sandY + 10, kit.rand(8, 22) * sc); }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= (40 + b.r * 2) * sc * dt;
        b.ph += dt * 3;
        if (b.y < -40) { popBubble(b); continue; }
        b.el.style.transform = `translate(${b.x - b.r + Math.sin(b.ph) * 8 * sc}px, ${b.y - b.r}px)`;
      }
    }

    layout();
    drawPreview();
    // a few fish to start with, so the tank is alive
    [['oval', 'fan', 0, 'stripes', 'normal'], ['round', 'round', 3, 'spots', 'big'], ['tall', 'flowy', 5, 'belly', 'lashes']]
      .forEach(([body, tail, colour, pattern, eyes]) => {
        const p = randomPoint();
        addSwimmer(fishSVG({ body, tail, colour, pattern, eyes }), { ...p, size: fishSize(), base: 1, kind: 'fish' });
      });
    raf = requestAnimationFrame(frame);
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); cancelAnimationFrame(raf); };
  },
};
