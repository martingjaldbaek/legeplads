/* Togbanen: a wooden train set.
 *   - Three pieces of the track are missing (dashed and glowing). Drag a track piece from the tray anywhere
 *     onto the scene and it flies into the nearest gap, fitted and turned the right way.
 *   - Drag wagons from the tray onto the scene and they couple on behind the loco.
 *   - Drag the animals waiting on the platform into a wagon (or the loco's cab).
 *   - When the track is whole, tap the train: it toots, puffs steam and chugs one lap, through the tunnel and
 *     over the bridge, and stops at the station again. Tap a passenger to let them off.
 *   - 🔨 takes the track apart again, uncouples the wagons and sends everyone back to the platform.
 */
import { LOCO, LOCO_LEN, CAR, CAR_LEN, CAR_ICON, PIECE_ICON, CHIMNEY, CAB, TREE, HOUSE } from './art/tog-art.js';

const ANIMALS = [['🐷', 'Grisen'], ['🐶', 'Hunden'], ['🐱', 'Katten'], ['🐰', 'Kaninen'], ['🐻', 'Bamsen'], ['🐸', 'Frøen']];
const CAR_COLORS = ['#ffd23f', '#06d6a0', '#9b5de5', '#ff8a00'];
const GAP_CANDIDATES = [0, 1, 2, 8, 9];   // never the station (bottom) or the tunnel (right side)
const NS = 'http://www.w3.org/2000/svg';
const DROP = 34;   // see makeUnit

const CSS = `
.tog-svg { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.tog-gap { animation: tog-glow 1s ease-in-out infinite alternate; }
@keyframes tog-glow { from { opacity:.35 } to { opacity:1 } }
.tog-pop { transform-box: fill-box; transform-origin: center; animation: tog-pop .45s cubic-bezier(.3,1.6,.5,1); }
@keyframes tog-pop { from { transform: scale(1.25); } to { transform: none; } }
.tog-art { transform-box: fill-box; transform-origin: 50% 100%; }
.tog-ready .tog-loco .tog-art { animation: tog-ready .9s ease-in-out infinite; }
@keyframes tog-ready { 0%,100% { transform:none } 50% { transform: scale(1.08) translateY(-3%) } }
.tog-bump { animation: tog-bump .35s ease !important; }
@keyframes tog-bump { 0%,100% { transform:none } 40% { transform: scale(1.12, .9) } }
.tog-moving .tog-wheel { animation: tog-spin .5s linear infinite; }
@keyframes tog-spin { to { transform: rotate(360deg) } }
.tog-eyes { transform-box: fill-box; transform-origin: center; animation: tog-blink 4s infinite; }
@keyframes tog-blink { 0%,94%,100% { transform:none } 97% { transform: scaleY(.1) } }
.tog-tray { position:absolute; left:50%; transform:translateX(-50%); display:flex; gap:1.4vmin; padding:1.2vmin 1.6vmin;
  background: rgba(255,255,255,.65); border-radius:3vmin; box-shadow: 0 1vmin 0 rgba(0,0,0,.08); z-index:5; min-height:4vmin; }
.tog-tray:empty { display:none; }
.tog-item { background:#fff; border-radius:2vmin; box-shadow: 0 .5vmin 0 rgba(0,0,0,.1); touch-action:none;
  display:flex; align-items:center; justify-content:center; animation: tog-in .4s cubic-bezier(.3,1.5,.5,1); }
.tog-item svg { width:84%; height:84%; overflow:visible; }
.tog-item.piece { background:#fff8e1; animation: tog-in .4s cubic-bezier(.3,1.5,.5,1), tog-wiggle 1.6s ease-in-out .4s infinite; }
@keyframes tog-in { from { transform: scale(0) } to { transform:none } }
@keyframes tog-wiggle { 0%,80%,100% { transform:none } 86% { transform: rotate(-8deg) } 93% { transform: rotate(8deg) } }
.tog-ghost { position:absolute; left:0; top:0; z-index:20; pointer-events:none; line-height:1;
  filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.tog-ghost svg { width:100%; height:100%; overflow:visible; display:block; }
.tog-ghost.fly { transition: transform .35s cubic-bezier(.4,1.2,.5,1), opacity .35s; }
.tog-animal { position:absolute; left:0; top:0; z-index:6; line-height:1; touch-action:none; transition: transform .45s cubic-bezier(.4,1.4,.5,1); }
.tog-animal span { display:inline-block; animation: tog-wait 1.6s ease-in-out infinite; }
.tog-animal.lift { transition:none; z-index:21; }
.tog-animal.lift span { animation:none; transform: scale(1.2); filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.tog-animal.gone { display:none; }
@keyframes tog-wait { 0%,100% { transform:none } 50% { transform: translateY(-8%) } }
.tog-rebuild { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(34px, 5vmin); }
.tog-rebuild:active { transform: scale(.9); }
.tog-duck { transform-box: fill-box; transform-origin: center; }
.tog-duck.quack { animation: tog-bump .35s ease; }
`;

export default {
  id: 'tog',
  title: 'Togbanen',
  icon: '🚂',
  color: '#e63946',
  edge: '#9fd88a',

  start(root, kit) {
    root.style.background = 'radial-gradient(circle at 50% 40%, #d4f2bf, #9fd88a)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'tog-svg');
    const layer = () => { const g = document.createElementNS(NS, 'g'); svg.appendChild(g); return g; };
    const gDecor = layer(), gTrack = layer(), gGaps = layer(), gTrain = layer(), gTop = layer(), gPuffs = layer();
    const tray = document.createElement('div');
    tray.className = 'tog-tray';
    const rebuildBtn = document.createElement('button');
    rebuildBtn.className = 'tog-rebuild';
    rebuildBtn.textContent = '🔨';
    rebuildBtn.setAttribute('aria-label', 'Byg igen');
    root.append(svg, tray, rebuildBtn);

    // ---------- state ----------
    let W = 0, H = 0, k = 1, cell = 80, trayTop = 0, L = 1, segs = [], geo = null;
    let gaps = new Set();
    const cars = [];          // { color, g, passenger: animal|null }
    const loco = { g: null, passenger: null };
    let s = 0, v = 0, moving = false, target = 0, sStation = 0;
    let puffT = 0, chugT = 0, last = 0, raf = 0, wasInTunnel = false;
    const puffs = [];
    const animals = ANIMALS.map(([emoji, name], i) => {
      const el = document.createElement('div');
      el.className = 'tog-animal';
      el.innerHTML = `<span>${emoji}</span>`;
      root.appendChild(el);
      return { emoji, name, el, i, seat: null, x: 0, y: 0 };
    });

    // ---------- track geometry: a rounded rectangle cut into 10 pieces, running clockwise ----------
    function buildGeometry() {
      const m = Math.max(64, W * 0.075);
      const x0 = m, x1 = W - m, y0 = Math.max(70, H * 0.09), y1 = trayTop - 40 * k;
      const r = Math.min(x1 - x0, y1 - y0) * 0.3, cx = (x0 + x1) / 2;
      const line = (ax, ay, bx, by) => ({ type: 'line', a: [ax, ay], b: [bx, by], len: Math.hypot(bx - ax, by - ay) });
      const arc = (ccx, ccy, a0) => ({ type: 'arc', c: [ccx, ccy], a0, len: r * Math.PI / 2 });
      segs = [
        line(x0 + r, y0, cx, y0), line(cx, y0, x1 - r, y0),
        arc(x1 - r, y0 + r, -Math.PI / 2), line(x1, y0 + r, x1, y1 - r), arc(x1 - r, y1 - r, 0),
        line(x1 - r, y1, cx, y1), line(cx, y1, x0 + r, y1),
        arc(x0 + r, y1 - r, Math.PI / 2), line(x0, y1 - r, x0, y0 + r), arc(x0 + r, y0 + r, Math.PI),
      ];
      let acc = 0;
      segs.forEach(sg => { sg.r = r; sg.start = acc; acc += sg.len; });
      L = acc;
      geo = { x0, x1, y0, y1, r, cx };
      sStation = segs[6].start;
    }
    function segPoint(sg, u) {
      if (sg.type === 'line') {
        const f = u / sg.len, a = Math.atan2(sg.b[1] - sg.a[1], sg.b[0] - sg.a[0]);
        return { x: sg.a[0] + (sg.b[0] - sg.a[0]) * f, y: sg.a[1] + (sg.b[1] - sg.a[1]) * f, a };
      }
      const th = sg.a0 + u / sg.r;
      return { x: sg.c[0] + sg.r * Math.cos(th), y: sg.c[1] + sg.r * Math.sin(th), a: th + Math.PI / 2 };
    }
    function pointAt(d) {
      d = ((d % L) + L) % L;
      for (const sg of segs) if (d <= sg.start + sg.len) return segPoint(sg, d - sg.start);
      return segPoint(segs[0], 0);
    }
    function segD(sg) {
      const p = segPoint(sg, 0), q = segPoint(sg, sg.len);
      return sg.type === 'line' ? `M${p.x} ${p.y} L${q.x} ${q.y}` : `M${p.x} ${p.y} A${sg.r} ${sg.r} 0 0 1 ${q.x} ${q.y}`;
    }
    const segMid = sg => segPoint(sg, sg.len / 2);

    // ---------- drawing ----------
    const wood = (d, extra = '') => `<g ${extra}>
      <path d="${d}" fill="none" stroke="#b8894f" stroke-width="${62 * k}"/>
      <path d="${d}" fill="none" stroke="#f0cf96" stroke-width="${54 * k}"/>
      <path d="${d}" fill="none" stroke="#c99a5e" stroke-width="${34 * k}"/>
      <path d="${d}" fill="none" stroke="#f0cf96" stroke-width="${24 * k}"/></g>`;

    function drawScene() {
      const { x0, x1, y0, y1, r, cx } = geo;
      // river from the top edge, under the bridge, into a pond inside the loop
      const pondY = y0 + Math.max(r * 0.95, (y1 - y0) * 0.3), rw = 30 * k;
      const ducks = [[cx - 40 * k, pondY + 6 * k], [cx + 46 * k, pondY - 4 * k]];
      gDecor.innerHTML = `
        <path d="M${cx - rw} 0 C${cx - rw} ${y0 * 0.5} ${cx - rw * 1.3} ${pondY - 40 * k} ${cx - rw} ${pondY} H${cx + rw}
          C${cx + rw * 1.3} ${pondY - 40 * k} ${cx + rw} ${y0 * 0.5} ${cx + rw} 0 Z" fill="#6cc4f4"/>
        <ellipse cx="${cx}" cy="${pondY + 10 * k}" rx="${110 * k}" ry="${50 * k}" fill="#6cc4f4" stroke="#4aa6dc" stroke-width="${5 * k}"/>
        <path d="M${cx - 50 * k} ${pondY + 22 * k} q20 ${-8 * k} 40 0" fill="none" stroke="#fff" stroke-width="${4 * k}" stroke-linecap="round" opacity=".6"/>
        ${ducks.map(([x, y], i) => `<text class="tog-duck" data-duck="${i}" x="${x}" y="${y}" font-size="${44 * k}" text-anchor="middle" dominant-baseline="middle">🦆</text>`).join('')}
        <rect x="${cx - 46 * k}" y="${y0 - 44 * k}" width="${92 * k}" height="${88 * k}" rx="${8 * k}" fill="#a86b3c" stroke="#7a4a26" stroke-width="${4 * k}"/>
        ${[-30, -10, 10, 30].map(o => `<path d="M${cx + o * k} ${y0 - 42 * k} V${y0 + 42 * k}" stroke="#7a4a26" stroke-width="${3 * k}"/>`).join('')}
        <rect x="${x0 + r * 0.55}" y="${y1 - 108 * k}" width="${Math.min(x1 - x0 - r * 1.1, 520 * k)}" height="${30 * k}" rx="${8 * k}"
          fill="#d9d4e6" stroke="#9b93b3" stroke-width="${4 * k}"/>
        ${HOUSE(x0 + r * 0.55 + 10 * k, y1 - 112 * k, 0.75 * k)}
        ${TREE(x0 + r * 0.9, y0 + r * 1.1, 0.8 * k)}${TREE(x1 - r * 1.2, y0 + r * 1.15, 0.7 * k)}
        ${TREE(x0 - 10 * k, y1 + 34 * k, 0.55 * k)}`;
      gTrack.innerHTML = segs.map((sg, i) => gaps.has(i) ? '' : wood(segD(sg), `data-seg="${i}"`)).join('');
      gGaps.innerHTML = [...gaps].map(i => `<path class="tog-gap" d="${segD(segs[i])}" fill="none" stroke="#fff"
        stroke-width="${54 * k}" stroke-dasharray="${14 * k} ${12 * k}" stroke-linecap="butt" opacity=".8"/>
        <path class="tog-gap" d="${segD(segs[i])}" fill="none" stroke="#ffd23f" stroke-width="${8 * k}" stroke-linecap="round"/>`).join('');
      // the tunnel: a hill over the middle of the right-hand side, drawn above the train
      const sg = segs[3], th = Math.min(sg.len * 0.75, 210 * k), my = (sg.a[1] + sg.b[1]) / 2, hw = 70 * k;
      gTop.innerHTML = `
        <path d="M${x1 - hw} ${my - th / 2} Q${x1 - hw * 1.5} ${my} ${x1 - hw} ${my + th / 2} H${x1 + hw}
          Q${x1 + hw * 1.5} ${my} ${x1 + hw} ${my - th / 2} Z" fill="#5fae4e" stroke="#3f8a35" stroke-width="${5 * k}"/>
        <path d="M${x1 - 40 * k} ${my - th / 2 + 2} Q${x1} ${my - th / 2 - 30 * k} ${x1 + 40 * k} ${my - th / 2 + 2} Z" fill="#3b2a4a"/>
        <path d="M${x1 - 40 * k} ${my + th / 2 - 2} Q${x1} ${my + th / 2 + 30 * k} ${x1 + 40 * k} ${my + th / 2 - 2} Z" fill="#3b2a4a"/>
        <path d="M${x1 - hw * 0.8} ${my - th / 2} H${x1 + hw * 0.8} M${x1 - hw * 0.8} ${my + th / 2} H${x1 + hw * 0.8}" stroke="#8b6b4a" stroke-width="${10 * k}" stroke-linecap="round"/>
        ${TREE(x1 + 10 * k, my + 30 * k, 0.45 * k)}`;
      geo.tunnel = [sg.start + (sg.len - th) / 2, sg.start + (sg.len + th) / 2];
      gDecor.querySelectorAll('.tog-duck').forEach(d => d.addEventListener('pointerdown', e => {
        e.preventDefault();
        kit.replay(d, 'quack');
        kit.tone(520, { dur: 0.12, type: 'sawtooth', vol: 0.06, slide: 380 });
        kit.tone(500, { at: 0.16, dur: 0.12, type: 'sawtooth', vol: 0.06, slide: 360 });
      }));
    }

    // ---------- the train ----------
    function makeUnit(art) {
      const g = document.createElementNS(NS, 'g');
      // lowered so the body, not the wheels, sits on the track's centre line: on the vertical sides the
      // train then straddles the track instead of sticking out sideways
      g.innerHTML = `<g transform="translate(0 ${DROP})"><g class="tog-art">${art}</g></g>`;
      gTrain.prepend(g);   // later wagons sit behind earlier ones
      g.addEventListener('pointerdown', e => { e.preventDefault(); onTrainTap(g); });
      return g;
    }
    loco.g = makeUnit(LOCO);
    loco.g.classList.add('tog-loco');
    gTrain.appendChild(loco.g);

    function seatEl(g) { return g.querySelector('.tog-seat'); }
    function showPassenger(unit) {
      const seat = seatEl(unit.g);
      if (!unit.passenger) { seat.innerHTML = ''; return; }
      seat.innerHTML = unit === loco
        ? `<text x="${CAB[0]}" y="${CAB[1]}" font-size="30" text-anchor="middle">${unit.passenger.emoji}</text>`
        : `<text x="0" y="-52" font-size="50" text-anchor="middle">${unit.passenger.emoji}</text>`;
    }

    // where each unit's centre is along the track, behind the loco
    const unitOffset = i => i < 0 ? 0 : LOCO_LEN / 2 * k + 6 * k + (CAR_LEN * k + 8 * k) * i + CAR_LEN / 2 * k;
    function place(g, d) {
      const p = pointAt(d), deg = p.a * 180 / Math.PI;
      const flip = Math.cos(p.a) < -0.02;
      g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${flip ? deg - 180 : deg}) scale(${flip ? -k : k} ${k})`);
      return { p, flip };
    }
    function inTunnel(d) {
      d = ((d % L) + L) % L;
      return geo.tunnel && d > geo.tunnel[0] + 10 * k && d < geo.tunnel[1] - 10 * k;
    }
    function drawTrain() {
      const lp = place(loco.g, s);
      cars.forEach((c, i) => place(c.g, s - unitOffset(i)));
      return lp;
    }
    function chimneyPos() {
      const p = pointAt(s), flip = Math.cos(p.a) < -0.02, rot = flip ? p.a - Math.PI : p.a;
      const lx = CHIMNEY[0] * (flip ? -k : k), ly = (CHIMNEY[1] + DROP) * k;
      return [p.x + lx * Math.cos(rot) - ly * Math.sin(rot), p.y + lx * Math.sin(rot) + ly * Math.cos(rot)];
    }
    function puff(big = 1) {
      const [x, y] = chimneyPos();
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('fill', '#fff');
      c.setAttribute('stroke', '#e2e2ee');
      c.setAttribute('stroke-width', 3 * k);
      gPuffs.appendChild(c);
      puffs.push({ c, x, y, age: 0, big, dx: kit.rand(-12, 12) * k });
    }

    // ---------- sounds ----------
    function toot() {
      [466, 587, 698].forEach(f => {
        kit.tone(f, { dur: 0.32, type: 'triangle', vol: 0.12, attack: 0.03 });
        kit.tone(f, { at: 0.42, dur: 0.6, type: 'triangle', vol: 0.12, attack: 0.03 });
      });
      kit.noise({ dur: 0.9, vol: 0.05, freq: 2500, q: 2 });
    }
    const chug = vol => kit.noise({ dur: 0.1, vol, freq: 900, q: 0.8, sweep: 350 });
    const clank = () => { kit.noise({ dur: 0.05, vol: 0.3, freq: 1500 }); kit.tone(220, { dur: 0.12, type: 'square', vol: 0.05 }); };
    const bell = () => { kit.tone(1568, { dur: 0.9, vol: 0.12 }); kit.tone(2093, { at: 0.25, dur: 0.9, vol: 0.1 }); };

    // ---------- actions ----------
    const complete = () => gaps.size === 0;
    function onTrainTap(g) {
      if (!moving) {
        const unit = g === loco.g ? loco : cars.find(c => c.g === g);
        if (unit && unit !== loco && unit.passenger) { letOff(unit); return; }
        if (unit === loco && loco.passenger && !complete()) { letOff(loco); return; }
      }
      kit.replay(loco.g.querySelector('.tog-art'), 'tog-bump');
      toot();
      puff(1.3); t.later(() => puff(1.3), 200);
      if (moving) return;
      if (!complete()) {
        gGaps.querySelectorAll('.tog-gap').forEach(el => kit.replay(el, 'tog-pop'));
        return;
      }
      if (cars.some(c => c.passenger) || loco.passenger) t.later(() => kit.say('Alle om bord!', { pitch: 1.3 }), 900);
      moving = true;
      target = s + L;
      svg.classList.add('tog-moving');
      svg.classList.remove('tog-ready');
    }
    function arrive() {
      moving = false; v = 0;
      s = sStation;
      svg.classList.remove('tog-moving');
      svg.classList.add('tog-ready');
      bell();
      t.later(() => kit.say('Station!', { pitch: 1.3 }), 300);
      const p = pointAt(s);
      kit.burst(p.x, p.y - 60 * k, 40);
    }

    function letOff(unit) {
      const a = unit.passenger;
      unit.passenger = null;
      showPassenger(unit);
      a.seat = null;
      const p = pointAt(unit === loco ? s : s - unitOffset(cars.indexOf(unit)));
      a.el.classList.remove('gone');
      a.el.style.transition = 'none';
      setAnimalXY(a, p.x, p.y - 60 * k);
      void a.el.offsetWidth;
      a.el.style.transition = '';
      t.later(() => setAnimalXY(a, a.x, a.y), 20);
      kit.sfx.boing();
    }

    function setAnimalXY(a, x, y) { a.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`; }
    function homeAnimals() {
      const { x0, x1, y1, r } = geo;
      const left = x0 + r * 0.55 + 90 * k, right = x0 + r * 0.55 + Math.min(x1 - x0 - r * 1.1, 520 * k);
      const step = Math.min(78 * k, (right - left) / ANIMALS.length);
      animals.forEach((a, i) => {
        a.x = left + step * (i + 0.5); a.y = y1 - 92 * k;
        a.el.style.fontSize = 60 * k + 'px';
        if (!a.seat) setAnimalXY(a, a.x, a.y);
      });
    }

    // drag animals onto the train
    animals.forEach(a => {
      const move = e => { const r = root.getBoundingClientRect(); setAnimalXY(a, e.clientX - r.left, e.clientY - r.top + 30 * k); };
      kit.draggable(a.el, {
      start(e) { if (a.seat) return false; a.el.classList.add('lift'); kit.sfx.pickUp(); move(e); },
      move,
      end(e) {
        a.el.classList.remove('lift');
        const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        // nearest free seat (wagons first, then the loco's cab), within a generous radius
        let best = null, bd = 170 * k;
        const units = [...cars.map((c, i) => [c, s - unitOffset(i)]), [loco, s]];
        for (const [u, d] of units) {
          if (u.passenger) continue;
          const p = pointAt(d), dist = Math.hypot(p.x - x, p.y - 40 * k - y) - (u === loco ? 0 : 20 * k);
          if (dist < bd) { bd = dist; best = u; }
        }
        if (!best) { setAnimalXY(a, a.x, a.y); kit.sfx.boing(); return; }
        best.passenger = a; a.seat = best;
        a.el.classList.add('gone');
        showPassenger(best);
        kit.replay(best.g.querySelector('.tog-art'), 'tog-bump');
        kit.sfx.plop();
        t.later(() => kit.say(a.name + '!', { pitch: 1.3 }), 150);
      },
    });
    });

    // ---------- the tray: track pieces and wagons ----------
    function ghost(html, size) {
      const g = document.createElement('div');
      g.className = 'tog-ghost';
      g.innerHTML = html;
      g.style.width = g.style.height = size + 'px';
      root.appendChild(g);
      return g;
    }
    const setGhost = (g, x, y, rot = 0) => { g.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot}deg)`; };

    function addTrayItem(kind, data) {
      const it = document.createElement('div');
      it.className = 'tog-item ' + kind;
      it.innerHTML = kind === 'piece' ? PIECE_ICON[data] : CAR_ICON(data);
      it.style.width = (kind === 'piece' ? cell : cell * 1.25) + 'px';
      it.style.height = cell + 'px';
      if (kind === 'piece') tray.prepend(it); else tray.appendChild(it);
      let gh = null;
      const move = e => { const r = root.getBoundingClientRect(); setGhost(gh, e.clientX - r.left, e.clientY - r.top); };
      kit.draggable(it, {
        start(e) {
          gh = ghost(it.innerHTML, kind === 'piece' ? cell * 1.5 : cell * 1.6);
          it.style.visibility = 'hidden';
          kit.sfx.pickUp();
          move(e);
        },
        move,
        end(e) {
          const r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          const g = gh; gh = null;
          if (y > trayTop - 10 || (kind === 'piece' && !gaps.size)) {      // dropped back on the tray
            g.remove(); it.style.visibility = ''; kit.sfx.boing(); return;
          }
          it.remove();
          if (kind === 'piece') {
            // the nearest gap, preferring one of the same shape; any gap will do
            let best = null, bd = Infinity;
            gaps.forEach(i => { const m = segMid(segs[i]); const d = Math.hypot(m.x - x, m.y - y) * (segs[i].type === data ? 1 : 1.6); if (d < bd) { bd = d; best = i; } });
            const m = segMid(segs[best]);
            g.classList.add('fly');
            setGhost(g, m.x, m.y, 0);
            g.style.opacity = '0';
            t.later(() => { g.remove(); fillGap(best); }, 330);
          } else {
            g.classList.add('fly');
            const back = pointAt(s - unitOffset(cars.length));
            setGhost(g, back.x, back.y - 40 * k);
            g.style.opacity = '0';
            t.later(() => { g.remove(); addCar(data); }, 330);
          }
        },
      });
    }

    function fillGap(i) {
      gaps.delete(i);
      drawScene();
      const el = gTrack.querySelector(`[data-seg="${i}"]`);
      if (el) kit.replay(el, 'tog-pop');
      kit.sfx.snap();
      const m = segMid(segs[i]);
      kit.burst(m.x, m.y, 25, 0.6);
      if (complete()) {
        t.later(() => { kit.sfx.fanfare(); kit.bigBurst(); kit.say('Sporet er klar! Tryk på toget!', { pitch: 1.2 }); }, 350);
        svg.classList.add('tog-ready');
      }
    }

    function addCar(color) {
      const c = { color, g: makeUnit(CAR(color)), passenger: null };
      cars.push(c);
      drawTrain();
      kit.replay(c.g.querySelector('.tog-art'), 'tog-pop');
      clank();
      t.later(clank, 140);
    }

    // ---------- rebuild ----------
    function rebuild(first = false) {
      if (moving) return;
      gaps = new Set(kit.shuffle([...GAP_CANDIDATES]).slice(0, 3));
      animals.forEach(a => { if (a.seat) { a.seat.passenger = null; showPassenger(a.seat); a.seat = null; a.el.classList.remove('gone'); } });
      cars.splice(0).forEach(c => c.g.remove());
      tray.innerHTML = '';
      [...gaps].forEach(i => addTrayItem('piece', segs[i].type));
      CAR_COLORS.forEach(c => addTrayItem('car', c));
      s = sStation;
      svg.classList.remove('tog-ready');
      drawScene(); drawTrain(); homeAnimals();
      if (!first) { kit.sfx.whoosh(); kit.sfx.bang(); }
    }
    rebuildBtn.addEventListener('click', () => rebuild());

    // ---------- layout ----------
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      k = Math.min(W, H) / 760;
      cell = Math.max(60, Math.min(Math.min(W, H) * 0.11, 104, (W * 0.92 - 8 * 14) / 9.5));
      const pad = 12;
      trayTop = H - cell - 2 * pad - Math.max(16, H * 0.025);
      Object.assign(tray.style, { bottom: Math.max(16, H * 0.025) + 'px' });
      tray.querySelectorAll('.tog-item').forEach(it => {
        it.style.width = (it.classList.contains('piece') ? cell : cell * 1.25) + 'px';
        it.style.height = cell + 'px';
      });
      const frac = L ? (((s % L) + L) % L) / L : 0;
      buildGeometry();
      s = moving ? frac * L : sStation;
      if (moving) target = s + (target - s);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      drawScene(); drawTrain(); homeAnimals();
    }

    // ---------- main loop ----------
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (moving) {
        const vmax = 280 * k, acc = 160 * k, rem = target - s;
        const want = Math.min(vmax, Math.sqrt(2 * acc * Math.max(0, rem)) + 12 * k);
        v += Math.sign(want - v) * Math.min(Math.abs(want - v), acc * dt);
        s += v * dt;
        if (s >= target - 0.5) { s = target; arrive(); }
        drawTrain();
        chugT -= dt;
        if (chugT <= 0 && v > 5) { chug(0.05 + 0.12 * v / vmax); chugT = 0.5 * Math.max(0.35, 1 - v / vmax) + 0.12; }
        puffT -= dt;
        const tun = inTunnel(s);
        if (tun && !wasInTunnel) t.later(toot, 200);
        wasInTunnel = tun;
        if (puffT <= 0 && !tun) { puff(); puffT = 0.22; }
      } else {
        puffT -= dt;
        if (puffT <= 0) { puff(0.7); puffT = 1.6; }
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += dt;
        const f = p.age / 1.3;
        if (f >= 1) { p.c.remove(); puffs.splice(i, 1); continue; }
        p.c.setAttribute('cx', p.x + p.dx * f);
        p.c.setAttribute('cy', p.y - 60 * k * f);
        p.c.setAttribute('r', (8 + 20 * f) * k * p.big);
        p.c.setAttribute('opacity', 0.95 * (1 - f));
      }
    }

    W = root.clientWidth; H = root.clientHeight;
    layout();
    rebuild(true);
    raf = requestAnimationFrame(frame);
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); cancelAnimationFrame(raf); };
  },
};
