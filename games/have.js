import { sign, PLANTS, SEEDS, FLOWER_COLS, packet, SEED_COLS, CAN, CAN_TIP, BASKET_BACK, BASKET_FRONT, SUN, BEE, BUTTERFLY } from './art/have-art.js';

/* Plant en have: drag a seed packet to a hole and the seeds drop in. Water with the watering can (it pours
 * while you hold it) and tap the sun – each makes the plants grow a stage: sprout, young plant, bud, and finally
 * a flower, sunflower, carrot, strawberries or a pumpkin. Bees and butterflies come to the flowers. Pull or tap a
 * finished plant and it flies into the basket; a full basket gets a fanfare and is emptied. Harvested holes can
 * be planted again.
 */
const NS = 'http://www.w3.org/2000/svg';
const BASKET_FULL = 8;
const HOLES = 6;

const CSS = `
.hv-svg { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.hv-svg text { font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
.hv-anim { transform-box: fill-box; transform-origin: 50% 100%; }
.hv-plant.hv-grow { animation: hv-grow .5s cubic-bezier(.3,1.6,.5,1); }
.hv-plant.hv-wiggle, .hv-packet.hv-wiggle { animation: hv-wiggle .4s ease; }
.hv-packet.hv-hint { animation: hv-hint 1.4s ease-in-out infinite; }
.hv-can-tilt.hv-hint { animation: hv-hint 1.4s ease-in-out infinite; }
.hv-basket.hv-wiggle { animation: hv-wiggle .4s ease; }
.hv-sun-in { transform-box: fill-box; transform-origin: center; }
.hv-sun-in.hv-shine { animation: hv-shine .9s ease; }
.hv-rays { transform-box: fill-box; transform-origin: center; animation: hv-spin 16s linear infinite; }
.hv-sun-in.hv-shine .hv-rays { animation-duration: 1.2s; }
.hv-eyes { transform-box: fill-box; transform-origin: center; animation: hv-blink 4.5s infinite; }
.hv-bee .hv-wings { transform-box: fill-box; transform-origin: 50% 100%; animation: hv-buzz .07s linear infinite alternate; }
.hv-fly .hv-wings { transform-box: fill-box; transform-origin: center; animation: hv-flut .22s ease-in-out infinite alternate; }
@keyframes hv-grow { 0%{transform:scale(.7,.5)} 100%{transform:none} }
@keyframes hv-wiggle { 0%,100%{transform:none} 25%{transform:rotate(-6deg)} 60%{transform:rotate(5deg)} }
@keyframes hv-hint { 0%,70%,100%{transform:none} 80%{transform:translateY(-8%)} 90%{transform:translateY(0)} }
@keyframes hv-shine { 0%{transform:none} 40%{transform:scale(1.25)} 100%{transform:none} }
@keyframes hv-spin { to { transform: rotate(360deg) } }
@keyframes hv-blink { 0%,94%,100%{transform:none} 97%{transform:scaleY(.1)} }
@keyframes hv-buzz { from{transform:scaleY(1)} to{transform:scaleY(.4)} }
@keyframes hv-flut { from{transform:scaleX(1)} to{transform:scaleX(.25)} }
`;

export default {
  id: 'have',
  title: 'Haven',
  icon: '🌻',
  color: '#2a9d4b',
  edge: '#7cc35a',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    root.style.background = '#7cc35a';

    // game state survives re-layout
    const holes = Array.from({ length: HOLES }, () => ({ type: null, stage: -1, water: 0, col: null }));
    let pile = 0, sunReady = 0;
    let VW = 1000, VH = 1000, L = {};      // viewBox size and layout positions
    let svg, plantEls = [], pileEl, critLayer, dropLayer, floatLayer, canG, canTilt, basketEl, packetEls = [], sunIn;

    /* ---------- robust dragging ----------
     * kit.draggable relies on pointer capture and on the pointerup arriving. On the iPad a touch can end
     * without either (system gestures, a second finger, capture lost on an SVG group); the drag then never
     * ended, its floating packet stayed in front of the tray, and the source refused all new drags.
     * Here: move/up/cancel are heard on the window, a cancelled drag cleans up without acting, a new touch
     * ends any drag that has gone quiet, and a drag with no events for `stale` ms ends by itself. */
    const drags = new Set();
    function finishDrag(d, e, cancelled) {
      if (d.id === null) return;
      d.id = null;
      drags.delete(d);
      removeEventListener('pointermove', d.onMove, true);
      removeEventListener('pointerup', d.onUp, true);
      removeEventListener('pointercancel', d.onUp, true);
      d.h.end(e, cancelled);
    }
    function drag(target, h, stale = 4000) {
      const d = { id: null, last: null, t: 0, h, stale };
      d.onMove = e => { if (e.pointerId !== d.id) return; d.last = e; d.t = performance.now(); if (h.move) h.move(e); };
      d.onUp = e => { if (e.pointerId === d.id) finishDrag(d, e.type === 'pointerup' ? e : d.last, e.type !== 'pointerup'); };
      target.addEventListener('pointerdown', e => {
        if (d.id !== null) finishDrag(d, d.last, true);   // a stale drag on this source: a new touch always wins
        if (h.start && h.start(e) === false) return;
        e.preventDefault(); e.stopPropagation();
        d.id = e.pointerId; d.last = e; d.t = performance.now();
        try { target.setPointerCapture(e.pointerId); } catch (err) {}
        addEventListener('pointermove', d.onMove, true);
        addEventListener('pointerup', d.onUp, true);
        addEventListener('pointercancel', d.onUp, true);
        drags.add(d);
      });
    }
    const endAllDrags = () => [...drags].forEach(d => finishDrag(d, d.last, true));
    // any new touch ends drags whose finger has gone quiet (its pointerup was probably swallowed)
    const onAnyDown = e => {
      const now = performance.now();
      [...drags].forEach(d => { if (d.id !== e.pointerId && now - d.t > 1200) finishDrag(d, d.last, true); });
    };
    addEventListener('pointerdown', onAnyDown, true);

    const el = (tag, attrs = {}, html = '') => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (html) e.innerHTML = html;
      return e;
    };
    const toSvg = e => {
      const r = svg.getBoundingClientRect();
      return [(e.clientX - r.left) * VW / r.width, (e.clientY - r.top) * VH / r.height];
    };
    const toScreen = (x, y) => {
      const r = svg.getBoundingClientRect();
      return [r.left + x * r.width / VW, r.top + y * r.height / VH];
    };

    // ---------- layout & drawing ----------
    function computeLayout() {
      const W = root.clientWidth || 1, H = root.clientHeight || 1;
      if (H > W) {
        VW = 1000; VH = 1000 * H / W;
        const rowY = [VH * 0.57, VH * 0.79];
        L = {
          horizon: VH * 0.36, sun: [860, 112], ps: 1.1,
          packets: SEEDS.map((_, i) => [110 + i * 195, 335]),
          beds: rowY.map(y => ({ x: 50, y: y - 50, w: 900, h: 110 })),
          holes: Array.from({ length: HOLES }, (_, i) => [200 + (i % 3) * 300, rowY[Math.floor(i / 3)]]),
          basket: [190, VH - 110], can: [VW - 190, VH - 110], s: 1.1,
        };
      } else {
        VH = 1000; VW = 1000 * W / H;
        const span = VW - 160;
        L = {
          horizon: 470, sun: [VW - 150, 140], ps: 1,
          packets: SEEDS.map((_, i) => [190 + i * 160, 125]),
          beds: [{ x: 60, y: 630, w: VW - 120, h: 120 }],
          holes: Array.from({ length: HOLES }, (_, i) => [80 + span * (i + 0.5) / HOLES, 690]),
          basket: [170, 890], can: [VW - 180, 880], s: 1,
        };
      }
    }

    function build() {
      endAllDrags();
      computeLayout();
      if (svg) svg.remove();
      svg = el('svg', { class: 'hv-svg', viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'none' });
      svg.innerHTML = `<defs><linearGradient id="hv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#d8f1ff"/></linearGradient></defs>
        <rect width="${VW}" height="${VH}" fill="url(#hv-sky)"/>
        <path d="M0 ${L.horizon + 30} Q${VW * 0.25} ${L.horizon - 40} ${VW * 0.5} ${L.horizon + 10} T${VW} ${L.horizon - 10} V${VH} H0 Z" fill="#a5d97c"/>
        <path d="M0 ${L.horizon + 70} Q${VW * 0.4} ${L.horizon + 20} ${VW * 0.75} ${L.horizon + 60} T${VW * 1.2} ${L.horizon + 50} V${VH} H0 Z" fill="#7cc35a"/>
        ${L.beds.map(b => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="40" fill="#a0673f" stroke="#4a3b5c" stroke-width="5"/>
          <rect x="${b.x + 14}" y="${b.y + 10}" width="${b.w - 28}" height="${b.h * 0.35}" rx="20" fill="#b97a4c"/>`).join('')}
        ${L.holes.map(([x, y]) => `<ellipse cx="${x}" cy="${y + 4}" rx="48" ry="15" fill="#5c3a21"/>`).join('')}`;
      // sun
      const sunG = el('g', { transform: `translate(${L.sun[0]} ${L.sun[1]})` });
      sunIn = el('g', { class: 'hv-sun-in' }, SUN);
      sunG.appendChild(sunIn);
      svg.appendChild(sunG);
      sunIn.addEventListener('pointerdown', e => { e.preventDefault(); shine(); });
      // seed packets
      packetEls = SEEDS.map((type, i) => {
        const [x, y] = L.packets[i];
        const g = el('g', { transform: `translate(${x} ${y}) scale(${L.ps})` });
        const inner = el('g', { class: 'hv-packet hv-anim' }, packet(type, SEED_COLS[type]));
        g.appendChild(inner);
        svg.appendChild(g);
        bindPacket(inner, type);
        return inner;
      });
      // plants
      plantEls = L.holes.map(([x, y], i) => {
        const g = el('g', { transform: `translate(${x} ${y})` });
        const inner = el('g', { class: 'hv-plant hv-anim' });
        g.appendChild(inner);
        svg.appendChild(g);
        bindPlant(inner, i);
        return inner;
      });
      holes.forEach((_, i) => drawPlant(i));
      critLayer = el('g');
      svg.appendChild(critLayer);
      // basket
      const bg = el('g', { transform: `translate(${L.basket[0]} ${L.basket[1]}) scale(${L.s * 0.9})` });
      basketEl = el('g', { class: 'hv-basket hv-anim' }, BASKET_BACK);
      pileEl = el('g');
      basketEl.appendChild(pileEl);
      basketEl.insertAdjacentHTML('beforeend', BASKET_FRONT);
      bg.appendChild(basketEl);
      svg.appendChild(bg);
      drawPile();
      dropLayer = el('g', { 'pointer-events': 'none' });
      svg.appendChild(dropLayer);
      // watering can
      canG = el('g');
      canTilt = el('g', { class: 'hv-can-tilt hv-anim' }, CAN);
      canG.appendChild(canTilt);
      svg.appendChild(canG);
      can.x = L.can[0]; can.y = L.can[1];
      bindCan();
      floatLayer = el('g', { 'pointer-events': 'none' });   // a floating packet must never catch the next touch meant for its source
      svg.appendChild(floatLayer);
      root.appendChild(svg);
      crits.length = 0;
      updateCritters();
      updateHints();
    }

    function drawPlant(i) {
      const h = holes[i], g = plantEls[i];
      g.innerHTML = h.stage < 0 ? '' : (h.stage < 3 ? sign(PLANTS[h.type].emoji) : '') + PLANTS[h.type].draw(h.stage, h.col);
    }
    function drawPile() {
      pileEl.innerHTML = '';
      for (let k = 0; k < pile; k++) {
        pileEl.appendChild(el('text', { x: -66 + (k % 4) * 44, y: -58 - Math.floor(k / 4) * 36, 'font-size': 60, 'text-anchor': 'middle' }, pileItems[k] || '🥕'));
      }
    }
    const pileItems = [];

    function updateHints() {
      const anyPlanted = holes.some(h => h.stage >= 0);
      const anyGrowing = holes.some(h => h.stage >= 0 && h.stage < 4);
      packetEls.forEach(p => p.classList.toggle('hv-hint', !anyPlanted));
      canTilt.classList.toggle('hv-hint', anyGrowing && !can.drag);
    }

    // ---------- seeds ----------
    function bindPacket(g, type) {
      let f = null;
      drag(g, {
        start(e) {
          if (f) f.remove();
          const [x, y] = toSvg(e);
          f = el('g', { transform: `translate(${x} ${y}) rotate(-25) scale(${L.ps * 0.8})` }, packet(type, SEED_COLS[type]));
          floatLayer.appendChild(f);
          kit.replay(g, 'hv-wiggle');
          kit.sfx.pickUp();
        },
        move(e) { if (!f) return; const [x, y] = toSvg(e); f.setAttribute('transform', `translate(${x} ${y}) rotate(-25) scale(${L.ps * 0.8})`); },
        end(e, cancelled) {
          if (f) { f.remove(); f = null; }
          if (cancelled || !e) { kit.sfx.whoosh(); return; }
          const [x, y] = toSvg(e);
          let best = -1, bd = 220;
          L.holes.forEach(([hx, hy], i) => {
            const d = Math.hypot(hx - x, hy - y);
            if (holes[i].stage < 0 && d < bd) { bd = d; best = i; }
          });
          if (best < 0) { kit.sfx.whoosh(); return; }
          plant(best, type);
        },
      });
    }
    function plant(i, type) {
      const h = holes[i];
      Object.assign(h, { type, stage: 0, water: 0, col: kit.pick(FLOWER_COLS) });
      const [hx, hy] = L.holes[i];
      // a few seeds drop into the hole
      for (let k = 0; k < 4; k++) {
        const s = el('circle', { r: 7, fill: '#6b4a2b', cx: hx - 18 + k * 12, cy: hy - 120 });
        dropLayer.appendChild(s);
        tweens.push({ el: s, t: -k * 0.06, d: 0.35, from: [0, 0], to: [0, 120], attr: 'move', done: () => s.remove() });
      }
      t.later(() => { drawPlant(i); kit.replay(plantEls[i], 'hv-grow'); kit.sfx.plop(); }, 450);
      kit.sfx.rustle();
      t.later(() => kit.say(PLANTS[type].name + '!', { pitch: 1.25 }), 150);
      updateHints();
    }

    // ---------- growing ----------
    function grow(i, quiet) {
      const h = holes[i];
      if (h.stage < 0 || h.stage >= 4) return;
      h.stage++; h.water = 0;
      drawPlant(i);
      kit.replay(plantEls[i], 'hv-grow');
      kit.tone(kit.scaleHz(3 + h.stage * 2), { dur: 0.3, type: 'triangle', vol: 0.13 });
      if (h.stage === 4) {
        const [hx, hy] = L.holes[i];
        const [sx, sy] = toScreen(hx, hy - PLANTS[h.type].head);
        kit.burst(sx, sy, 30, 0.7);
        t.later(() => kit.sfx.chime(), 150);
        if (!quiet && Math.random() < 0.5) t.later(() => kit.say(PLANTS[h.type].name + '!', { pitch: 1.25 }), 300);
        updateCritters();
      }
      updateHints();
    }
    function shine() {
      const now = performance.now();
      kit.replay(sunIn, 'hv-shine');
      if (now < sunReady) { kit.sfx.blip(9); return; }
      sunReady = now + 1200;
      kit.sfx.chime();
      let k = 0;
      holes.forEach((h, i) => { if (h.stage >= 0 && h.stage < 4) t.later(() => grow(i, true), 300 + 180 * k++); });
      if (!k) t.later(() => kit.say('Solen skinner!', { pitch: 1.25 }), 200);
    }

    // ---------- watering can ----------
    const can = { x: 0, y: 0, tx: 0, ty: 0, a: 0, drag: false, pour: 0, snd: 0 };
    function bindCan() {
      drag(canTilt, {
        start(e) {
          can.drag = true;
          const [x, y] = toSvg(e);
          can.tx = x; can.ty = y + 80 * L.s;
          kit.sfx.pickUp();
          updateHints();
        },
        move(e) { const [x, y] = toSvg(e); can.tx = x; can.ty = y + 80 * L.s; },
        end() { can.drag = false; updateHints(); },
      }, 10000);   // holding still to pour is fine, but not forever
    }
    const drops = [];
    function canTip() {
      const a = can.a * Math.PI / 180, [tx, ty] = CAN_TIP.map(v => v * L.s);
      return [can.x + tx * Math.cos(a) - ty * Math.sin(a), can.y + tx * Math.sin(a) + ty * Math.cos(a)];
    }
    function floorBelow(x, y) {
      for (const [hx, hy] of L.holes) if (Math.abs(hx - x) < VW && hy > y + 10) return hy;   // first bed row below
      return VH - 20;
    }

    // ---------- harvest ----------
    function bindPlant(g, i) {
      let y0 = 0, pulled = 0;
      drag(g, {
        start(e) {
          const h = holes[i];
          if (h.stage < 0) return false;
          if (h.stage < 4) { kit.replay(g, 'hv-wiggle'); kit.sfx.rustle(); return false; }
          y0 = toSvg(e)[1]; pulled = 0;
          kit.sfx.squeak();
        },
        move(e) {
          pulled = Math.max(-140, Math.min(0, toSvg(e)[1] - y0));
          g.style.transform = `translateY(${pulled * 0.4}px) scaleY(${1 - pulled / 500})`;
        },
        end(e, cancelled) { g.style.transform = ''; if (!cancelled && holes[i].stage === 4) harvest(i); },
      });
    }
    function harvest(i) {
      const h = holes[i], [hx, hy] = L.holes[i], P = PLANTS[h.type];
      kit.sfx.pop(8);
      const [sx, sy] = toScreen(hx, hy - P.head);
      kit.burst(sx, sy, 20, 0.6);
      const item = el('text', { 'font-size': 110, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, P.emoji);
      floatLayer.appendChild(item);
      tweens.push({ el: item, t: 0, d: 0.8, from: [hx, hy - P.head], to: [L.basket[0], L.basket[1] - 60], attr: 'arc', done: () => {
        item.remove();
        pileItems[pile] = P.emoji;
        pile++;
        drawPile();
        kit.replay(basketEl, 'hv-wiggle');
        kit.sfx.plop();
        if (pile >= BASKET_FULL) basketFull();
      } });
      if (Math.random() < 0.6) t.later(() => kit.say(P.name + '!', { pitch: 1.3 }), 200);
      Object.assign(h, { type: null, stage: -1, water: 0 });
      drawPlant(i);
      updateCritters();
      updateHints();
    }
    function basketFull() {
      t.later(() => {
        kit.sfx.fanfare();
        kit.bigBurst();
        kit.say('Sikke en høst!', { pitch: 1.25 });
      }, 300);
      t.later(() => { pile = 0; pileItems.length = 0; drawPile(); kit.sfx.whoosh(); }, 2600);
    }

    // ---------- bees and butterflies ----------
    const crits = [];
    function updateCritters() {
      const ripe = holes.map((h, i) => (h.stage === 4 && PLANTS[h.type].critter ? i : -1)).filter(i => i >= 0);
      const want = Math.min(3, ripe.length);
      while (crits.length > want) crits.pop().g.remove();
      crits.forEach(c => { if (!ripe.includes(c.target)) c.target = kit.pick(ripe); });
      while (crits.length < want) {
        const bee = crits.length % 2 === 0;
        const g = el('g', { class: bee ? 'hv-bee' : 'hv-fly' }, bee ? BEE : BUTTERFLY(kit.pick(['#ff8fab', '#3a86ff', '#ffb703', '#8338ec'])));
        const c = { g, bee, target: kit.pick(ripe), ph: Math.random() * 6, sp: 1, boost: 0, x: L.sun[0], y: L.sun[1] };
        g.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          c.boost = 1.5;
          if (bee) for (let k = 0; k < 8; k++) kit.tone(220 + (k % 2) * 25, { at: k * 0.04, dur: 0.05, type: 'sawtooth', vol: 0.04 });
          else kit.sfx.fwip();
          if (Math.random() < 0.5) kit.say(bee ? 'Bzzz! En bi!' : 'Sommerfugl!', { pitch: 1.3 });
        });
        critLayer.appendChild(g);
        crits.push(c);
      }
    }

    // ---------- animation loop ----------
    const tweens = [];
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      drags.forEach(d => { if (now - d.t > d.stale) finishDrag(d, d.last, true); });
      // can follows the finger (or goes home) and tilts while held
      const gx = can.drag ? can.tx : L.can[0], gy = can.drag ? can.ty : L.can[1];
      can.x += (gx - can.x) * Math.min(1, dt * 14); can.y += (gy - can.y) * Math.min(1, dt * 14);
      can.a += ((can.drag ? -38 : 0) - can.a) * Math.min(1, dt * 10);
      canG.setAttribute('transform', `translate(${can.x} ${can.y}) rotate(${can.a}) scale(${L.s})`);
      if (can.drag && can.a < -25) {
        const [x, y] = canTip();
        for (let k = 0; k < 2; k++) {
          if (drops.length > 90) break;
          const d = el('circle', { r: 6 + Math.random() * 3, fill: '#5aa9ff', opacity: 0.85 });
          dropLayer.appendChild(d);
          drops.push({ el: d, x: x + Math.random() * 10 - 5, y, vx: -60 - Math.random() * 60, vy: 40 + Math.random() * 40, end: floorBelow(x, y) });
        }
        can.snd -= dt;
        if (can.snd <= 0) { can.snd = 0.14; kit.noise({ dur: 0.18, vol: 0.05, freq: 3000 + Math.random() * 1500, q: 0.6 }); }
        holes.forEach((h, i) => {
          const [hx, hy] = L.holes[i];
          if (h.stage >= 0 && h.stage < 4 && Math.abs(x - 40 - hx) < 110 && y < hy) {
            h.water += dt;
            if (h.water > 0.8) grow(i);
          }
        });
      }
      for (let k = drops.length - 1; k >= 0; k--) {
        const d = drops[k];
        d.vy += 1400 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.y > d.end) { d.el.remove(); drops.splice(k, 1); continue; }
        d.el.setAttribute('cx', d.x); d.el.setAttribute('cy', d.y);
      }
      // tweens: seeds dropping and harvest flying to the basket
      for (let k = tweens.length - 1; k >= 0; k--) {
        const w = tweens[k];
        w.t += dt;
        const p = Math.max(0, Math.min(1, w.t / w.d));
        if (w.attr === 'move') w.el.setAttribute('transform', `translate(0 ${w.to[1] * p * p})`);
        else {
          const x = w.from[0] + (w.to[0] - w.from[0]) * p, y = w.from[1] + (w.to[1] - w.from[1]) * p - Math.sin(p * Math.PI) * 220;
          w.el.setAttribute('transform', `translate(${x} ${y}) scale(${1 - p * 0.4})`);
        }
        if (p >= 1) { tweens.splice(k, 1); w.done(); }
      }
      // critters circle their flower
      crits.forEach(c => {
        const [hx, hy] = L.holes[c.target] || L.sun, head = holes[c.target]?.type ? PLANTS[holes[c.target].type].head : 0;
        c.boost = Math.max(0, c.boost - dt);
        c.ph += dt * (c.bee ? 1.6 : 1.1) * (1 + c.boost * 3);
        const r = 110 + c.boost * 120;
        const tx = hx + Math.cos(c.ph) * r, ty = hy - head - 40 + Math.sin(c.ph * 2) * 50;
        const px = c.x;
        c.x += (tx - c.x) * Math.min(1, dt * 3); c.y += (ty - c.y) * Math.min(1, dt * 3);
        const dir = c.x < px ? 1 : -1;
        c.g.setAttribute('transform', `translate(${c.x} ${c.y}) scale(${(c.bee ? dir : 1) * 1.3 * L.s} ${1.3 * L.s})`);
      });
      raf = requestAnimationFrame(frame);
    }

    build();
    raf = requestAnimationFrame(frame);
    const offResize = kit.onResize(root, () => { drops.splice(0).forEach(d => d.el.remove()); tweens.splice(0).forEach(w => w.done()); build(); });
    t.later(() => kit.say('Plant et frø!', { pitch: 1.25 }), 500);
    return () => { cancelAnimationFrame(raf); t.clear(); offResize(); endAllDrags(); removeEventListener('pointerdown', onAnyDown, true); };
  },
};
