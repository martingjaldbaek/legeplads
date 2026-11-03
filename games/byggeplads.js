/* Byggepladsen: three stations on a building site, switched with the picture buttons in the top-right corner.
 *  1. The digger: drag the bucket. Dig in the sand pile, then tip the sand into the truck. Three loads and
 *     the truck honks and drives off; a new one reverses in, beeping.
 *  2. The crane: drag anywhere to move the hook. Touch a floor on the pile to hook it, lower it onto the
 *     building and it clicks into place. Six floors and the roof goes on, with people waving in the windows.
 *  3. The cement mixer: tap the drum to spin it, hold below the chute to pour cement into the mould, then
 *     press hand prints into the wet cement.
 * Scenes are SVG in a 1400×1000 box (ground at y = 860), scaled to fit; art is in games/art/byggeplads-art.js.
 */
import { DEFS, SKY, DIGGER_BASE, BOOM, STICK, BUCKET, TRUCK, CRANE, TROLLEY, HOOK, FLOOR, CHAINS, ROOF, MIXER, ICONS, INK } from './art/byggeplads-art.js';

const NS = 'http://www.w3.org/2000/svg';
const GROUND = 860;
const TRUCK_COLORS = ['#ff4d6d', '#3a86ff', '#06d6a0', '#8338ec', '#ff8a00'];
const FLOOR_COLORS = ['#ff8a00', '#3a86ff', '#06d6a0', '#f15bb5', '#8338ec', '#ffc400', '#2ec4b6'];

const CSS = `
.bp-svg { position:absolute; inset:0; width:100%; height:100%; touch-action:none; pointer-events:none; }
.bp-nav { position:absolute; z-index:6; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  display:flex; gap:1.4vmin; }
.bp-nav button { width:max(84px,12vmin); height:max(70px,9.5vmin); border:none; border-radius:2.4vmin; padding:.6vmin;
  background: rgba(255,255,255,.6); box-shadow: 0 .6vmin 0 rgba(0,0,0,.12); opacity:.7; transition: transform .15s, opacity .15s; }
.bp-nav button svg { width:100%; height:100%; }
.bp-nav button.on { background:#fff; opacity:1; transform: translateY(-.5vmin) scale(1.06); }
.bp-eyes { transform-box: fill-box; transform-origin: center; animation: bp-blink 4.4s infinite; }
@keyframes bp-blink { 0%,94%,100% { transform:none } 97% { transform: scaleY(.1) } }
.bp-oh { display:none; }
.talk .bp-oh { display:inline; } .talk .bp-smile { display:none; }
.bp-person { transform-box: fill-box; transform-origin: 50% 100%; animation: bp-wave .7s ease-in-out infinite alternate; }
@keyframes bp-wave { from { transform: translateY(4px) } to { transform: translateY(-6px) } }
.bp-flag { transform-box: fill-box; transform-origin: 0 50%; animation: bp-flap .5s ease-in-out infinite alternate; }
@keyframes bp-flap { from { transform: scaleX(1) } to { transform: scaleX(.75) skewY(6deg) } }
.bp-glow { animation: bp-glow 1.2s ease-in-out infinite; }
@keyframes bp-glow { 0%,100% { opacity:.25 } 50% { opacity:.7 } }
`;

export default {
  id: 'byggeplads',
  title: 'Byggeplads',
  icon: '🏗️',
  color: '#ffb703',
  edge: '#c9a26b',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    root.style.background = '#c9a26b';
    const t = kit.timers();

    // shared gradients/patterns live in a hidden svg so every scene and icon can use them
    const defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
    defs.style.position = 'absolute';
    defs.innerHTML = DEFS;
    root.appendChild(defs);

    const nav = document.createElement('div');
    nav.className = 'bp-nav';
    const navBtns = ICONS.map((icon, i) => {
      const b = document.createElement('button');
      b.innerHTML = icon;
      b.setAttribute('aria-label', ['Graveren', 'Kranen', 'Betonblanderen'][i]);
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (i !== pageIdx) { kit.sfx.fwip(); show(i); } });
      nav.appendChild(b);
      return b;
    });
    root.appendChild(nav);

    const svgEl = (tag, attrs = {}, parent = null, html = '') => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (html) e.innerHTML = html;
      if (parent) parent.appendChild(e);
      return e;
    };
    const lerp = (a, b, k) => a + (b - a) * k;
    const talk = (el, ms = 700) => { el.classList.add('talk'); t.later(() => el.classList.remove('talk'), ms); };
    // Scene ↔ screen mapping, done by hand from our own viewBox rather than getScreenCTM (unreliable in
    // Safari for an outer <svg> inside fixed/transformed boxes). The viewBox always has the root's exact aspect
    // ratio, so there is no letterboxing: one scale, one offset.
    const vb = { x: 0, y: 0, w: 1400, h: 1000, s: 1 };
    // horizontal span each page needs to show; vertically everything from y = 40 to the ground and a bit below
    const FOCUS = [[-10, 1310], [200, 1220], [110, 1270]];
    function fitView() {
      if (!svg) return;
      const W = root.clientWidth || 1, H = root.clientHeight || 1;
      const [x0, x1] = FOCUS[pageIdx];
      const s = Math.min(W / (x1 - x0), H / 960);
      vb.s = s; vb.w = W / s; vb.h = H / s;
      vb.x = (x0 + x1) / 2 - vb.w / 2;
      // spare height: mostly sky above, some ground below (so the scene isn't squashed at the bottom in portrait)
      const spare = vb.h - 960;
      vb.y = 40 - spare * 0.72;
      svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
      const sun = svg.querySelector('.bp-sun');
      if (sun) { sun.setAttribute('cx', vb.x + 120); sun.setAttribute('cy', vb.y + 120); }
    }
    const toScene = (cx, cy) => { const r = root.getBoundingClientRect(); return { x: vb.x + (cx - r.left) / vb.s, y: vb.y + (cy - r.top) / vb.s }; };
    // confetti uses screen pixels: convert a scene point
    const toScreen = (_svg, x, y) => [(x - vb.x) * vb.s, (y - vb.y) * vb.s];

    /* ================= 1. digger + truck ================= */
    function diggerPage(svg) {
      svg.innerHTML = SKY;
      const pile = svgEl('path', { fill: '#e0b46a', stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, svg);
      const truckG = svgEl('g', {}, svg);
      svgEl('g', {}, svg, DIGGER_BASE);
      const digger = svg.lastChild;
      const boom = svgEl('g', {}, svg), stick = svgEl('g', {}, svg), bucket = svgEl('g', {}, svg, BUCKET);
      const L1 = 330, L2 = 280, BX = 620, BY = 690;
      boom.innerHTML = BOOM(L1); stick.innerHTML = STICK(L2);
      const load = bucket.querySelector('.bp-load');
      const sand = svgEl('g', {}, svg);
      // a soft glow on the truck box when the bucket is full, to show where the sand goes
      let pileH = 250, fill = 0, full = false, dumping = 0, bAng = 10;
      let tx = 0, truckState = 'parked', truckLoad = 0, colorIdx = 0, beepT = 0, scrapeT = 0;
      const tgt = { x: 330, y: 640 }, cur = { x: 330, y: 640 };
      let wheelRot = 0;

      function drawTruck() {
        truckG.innerHTML = TRUCK(TRUCK_COLORS[colorIdx % TRUCK_COLORS.length]);
        truckG.querySelector('.bp-box').insertAdjacentHTML('afterbegin',
          '<path class="bp-glow" d="M-10 -210 L300 -210 L290 -90 L0 -90 Z" fill="#fff6b0" style="display:none"/>');
      }
      drawTruck();
      const surf = x => GROUND - pileH * Math.max(0, 1 - ((x - 170) / 260) ** 2);
      function drawPile() {
        let d = `M-120 ${GROUND + 4}`;
        for (let x = -100; x <= 440; x += 20) d += ` L${x} ${surf(x)}`;
        pile.setAttribute('d', d + ` L460 ${GROUND + 4} Z`);
      }
      drawPile();

      const grains = [];
      function spill(x, y, n, toY) {
        for (let i = 0; i < n; i++) {
          const c = svgEl('circle', { r: kit.rand(7, 13), fill: kit.pick(['#e0b46a', '#d9a65a', '#c99550']) }, sand);
          grains.push({ c, x: x + kit.rand(-30, 30), y: y + kit.rand(-10, 10), vx: kit.rand(-40, 40), vy: kit.rand(-60, 20), toY: toY + kit.rand(-15, 10) });
        }
      }

      function tip() {
        const a = bAng * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
        return [cur.x + c * 88 - s * 92, cur.y + s * 88 + c * 92];
      }

      function update(dt) {
        const px = cur.x, py = cur.y;
        cur.x = lerp(cur.x, tgt.x, 0.25); cur.y = lerp(cur.y, tgt.y, 0.25);
        // inverse kinematics: two links from the boom pivot to the bucket pivot, elbow up
        let dx = cur.x - BX, dy = cur.y - BY, d = Math.hypot(dx, dy);
        const dMax = L1 + L2 - 2, dMin = 120;
        if (d > dMax) { cur.x = BX + dx / d * dMax; cur.y = BY + dy / d * dMax; d = dMax; }
        if (d < dMin) { cur.x = BX + dx / d * dMin; cur.y = BY + dy / d * dMin; d = dMin; }
        dx = cur.x - BX; dy = cur.y - BY;
        const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
        const j1 = [BX + L1 * Math.cos(th - al), BY + L1 * Math.sin(th - al)], j2 = [BX + L1 * Math.cos(th + al), BY + L1 * Math.sin(th + al)];
        const a1 = j1[1] < j2[1] ? th - al : th + al;
        const jx = BX + L1 * Math.cos(a1), jy = BY + L1 * Math.sin(a1);
        const a2 = Math.atan2(cur.y - jy, cur.x - jx);
        boom.setAttribute('transform', `translate(${BX} ${BY}) rotate(${a1 * 180 / Math.PI})`);
        stick.setAttribute('transform', `translate(${jx} ${jy}) rotate(${a2 * 180 / Math.PI})`);

        // bucket angle: open when empty, curled up when full, tipped right over while dumping
        const want = dumping > 0 ? 130 : full ? -40 : 10;
        bAng = lerp(bAng, want, dumping > 0 ? 0.2 : 0.12);
        bucket.setAttribute('transform', `translate(${cur.x} ${cur.y}) rotate(${bAng})`);
        load.style.opacity = full ? 1 : Math.min(1, fill);
        load.setAttribute('transform', `scale(${0.4 + 0.6 * Math.min(1, fill)})`);

        const [tx0, ty0] = tip();
        const moved = Math.hypot(cur.x - px, cur.y - py);
        // digging
        if (!full && !dumping && ty0 > surf(tx0) - 6 && tx0 < 440) {
          fill += moved * 0.006 + dt * 0.25;
          scrapeT -= dt;
          if (scrapeT <= 0 && moved > 0.5) { scrapeT = 0.13; kit.noise({ dur: 0.12, vol: 0.12, freq: 900, q: 0.6, sweep: 400 }); }
          if (fill >= 1) {
            full = true; fill = 1;
            pileH = Math.max(110, pileH - 14); drawPile();
            kit.sfx.plop(); kit.sfx.rustle();
            spill(tx0, ty0, 4, surf(tx0));
          }
        }
        // dumping into the truck
        const boxL = 860 + tx, boxR = 1150 + tx;
        const glow = truckG.querySelector('.bp-glow');
        if (glow) glow.style.display = full && truckState === 'parked' ? '' : 'none';
        if (full && !dumping && truckState === 'parked' && tx0 > boxL - 30 && tx0 < boxR + 20 && ty0 < 700) {
          dumping = 0.8;
          kit.sfx.whoosh();
          t.later(() => {
            spill(Math.max(boxL + 40, Math.min(boxR - 40, tip()[0])), tip()[1], 16, 660);
            kit.noise({ dur: 0.5, vol: 0.25, freq: 600, q: 0.5, sweep: 200 });
          }, 220);
          t.later(() => {
            truckLoad++;
            kit.sfx.splat();
            talk(truckG, 600);
            if (truckLoad >= 3) {
              const [sx, sy] = toScreen(svg, boxL + 145, 620);
              kit.burst(sx, sy, 60, 1);
              kit.sfx.fanfare();
              t.later(() => { horn(); kit.say('Fuld! Brum brum!', { pitch: 1.2 }); }, 500);
              t.later(() => { truckState = 'leaving'; }, 1400);
            }
          }, 650);
        }
        if (dumping > 0) { dumping -= dt; if (dumping <= 0) { dumping = 0; full = false; fill = 0; } }

        // truck heap and driving
        const heap = truckG.querySelector('.bp-heap');
        if (heap) heap.setAttribute('transform', `translate(145 -200) scale(1 ${Math.min(1, truckLoad / 3)}) translate(-145 200)`);
        if (truckState === 'leaving') {
          tx += dt * Math.min(600, 150 + (tx + 1) * 2.2);
          wheelRot += dt * 360;
          if (tx > 900) { truckState = 'arriving'; truckLoad = 0; colorIdx++; drawTruck(); beepT = 0; }
        } else if (truckState === 'arriving') {
          tx = Math.max(0, tx - dt * 260);
          wheelRot -= dt * 260;
          beepT -= dt;
          if (beepT <= 0) { beepT = 0.5; kit.tone(1046, { dur: 0.22, type: 'square', vol: 0.06 }); }
          if (tx === 0) { truckState = 'parked'; talk(truckG); kit.sfx.chime(); }
        }
        truckG.setAttribute('transform', `translate(${860 + tx} ${GROUND})`);
        truckG.querySelectorAll('.bp-wheel').forEach(w => {
          const base = w.getAttribute('data-x') || w.getAttribute('transform').match(/translate\(([-\d.]+)/)[1];
          w.setAttribute('data-x', base);
          w.setAttribute('transform', `translate(${base} -38) rotate(${wheelRot})`);
        });

        // falling sand
        for (let i = grains.length - 1; i >= 0; i--) {
          const g = grains[i];
          g.vy += 1800 * dt; g.x += g.vx * dt; g.y += g.vy * dt;
          if (g.y >= g.toY) { g.c.remove(); grains.splice(i, 1); continue; }
          g.c.setAttribute('cx', g.x); g.c.setAttribute('cy', g.y);
        }
        // the pile slowly grows back
        if (pileH < 250 && Math.random() < dt * 0.3) { pileH += 10; drawPile(); }
      }
      function horn() { kit.tone(392, { dur: 0.25, type: 'square', vol: 0.08 }); kit.tone(330, { at: 0.3, dur: 0.4, type: 'square', vol: 0.08 }); }

      let dragging = false;
      return {
        update,
        down(p) { dragging = true; tgt.x = p.x; tgt.y = Math.min(p.y, 850); talk(digger, 400); kit.sfx.pickUp(); },
        move(p) { if (dragging) { tgt.x = p.x; tgt.y = Math.min(p.y, 850); } },
        up() { dragging = false; },
        stop() {},
      };
    }

    /* ================= 2. crane + building ================= */
    function cranePage(svg) {
      svg.innerHTML = SKY;
      const BXC = 900;   // building centre
      svgEl('rect', { x: BXC - 160, y: GROUND - 16, width: 320, height: 22, rx: 6, fill: '#9a9ab0', stroke: INK, 'stroke-width': 6 }, svg);
      const target = svgEl('rect', { class: 'bp-glow', x: BXC - 140, width: 280, height: 20, rx: 8, fill: '#fff6b0' }, svg);
      const building = svgEl('g', {}, svg), pileG = svgEl('g', {}, svg);
      svgEl('g', {}, svg, CRANE);
      const crane = svg.lastChild;
      const cable = svgEl('line', { stroke: INK, 'stroke-width': 5 }, svg);
      const trolley = svgEl('g', {}, svg, TROLLEY);
      const hookG = svgEl('g', {}, svg);
      const carryG = svgEl('g', {}, hookG);
      hookG.insertAdjacentHTML('beforeend', HOOK);
      const JIB = 170;
      let hx = 700, L = 320, tgx = 700, tgL = 320, phi = 0, om = 0, lastHx = 700, lastV = 0;
      let carried = null, cool = 0, floors = 0, done = false, colorI = 0;
      const pieces = [];   // { x, y (bottom), color, g }
      const SPOTS = [360, 620], spotWait = [0, 0];

      function newPiece(spot, fromLeft) {
        const color = FLOOR_COLORS[colorI++ % FLOOR_COLORS.length];
        const g = svgEl('g', {}, pileG, FLOOR(color));
        const p = { x: fromLeft ? -200 : spot, spot, y: GROUND, color, g, sliding: fromLeft };
        pieces.push(p);
        if (fromLeft) kit.noise({ dur: 0.5, vol: 0.08, freq: 300, q: 0.6 });
        return p;
      }
      SPOTS.forEach(s => newPiece(s, false));

      const topY = () => GROUND - 16 - floors * 80;
      function placeFloor(p) {
        const g = svgEl('g', { transform: `translate(${BXC} ${topY()})` }, building, FLOOR(p.color));
        g.dataset.color = p.color;
        floors++;
        kit.sfx.bang();
        kit.tone(kit.scaleHz(floors + 2), { at: 0.1, dur: 0.4, type: 'triangle', vol: 0.15 });
        const [sx, sy] = toScreen(svg, BXC, topY() + 80);
        kit.burst(sx, sy, 30, 0.7);
        talk(crane, 600);
        if (floors >= 6) finish();
      }
      function finish() {
        done = true;
        tgL = 60; tgx = 420;   // hook out of the way for the roof
        const roof = svgEl('g', { transform: `translate(${BXC} -300)` }, building, ROOF);
        const y0 = -300, y1 = topY();
        let k = 0;
        const fall = t.every(() => {
          k = Math.min(1, k + 0.05);
          roof.setAttribute('transform', `translate(${BXC} ${lerp(y0, y1, k * k)})`);
          if (k >= 1) {
            clearInterval(fall);
            kit.sfx.bang(); kit.sfx.fanfare(); kit.bigBurst();
            // people appear in the windows and wave
            [...building.children].forEach(g => { if (g.dataset.color) g.innerHTML = FLOOR(g.dataset.color, true); });
            t.later(() => kit.say('Huset er færdigt!', { pitch: 1.2 }), 700);
            t.later(clearBuilding, 9000);
          }
        }, 16);
      }
      function clearBuilding() {
        const kids = [...building.children].reverse();
        kids.forEach((g, i) => t.later(() => { g.remove(); kit.sfx.pop(i); }, 150 * i));
        t.later(() => { floors = 0; done = false; }, 150 * kids.length + 100);
      }

      function update(dt) {
        hx = lerp(hx, tgx, 0.12); L = lerp(L, tgL, 0.15);
        // a little pendulum swing from the trolley's acceleration
        const v = (hx - lastHx) / Math.max(dt, 0.001), acc = (v - lastV) / Math.max(dt, 0.001);
        lastHx = hx; lastV = v;
        om += (-(1800 / Math.max(L, 80)) * Math.sin(phi) - acc / Math.max(L, 80) * 0.6) * dt;
        om *= 0.97; phi += om * dt; phi = Math.max(-0.35, Math.min(0.35, phi));
        const hookX = hx + Math.sin(phi) * L, hookY = JIB + Math.cos(phi) * L;
        trolley.setAttribute('transform', `translate(${hx} ${JIB})`);
        cable.setAttribute('x1', hx); cable.setAttribute('y1', JIB + 12); cable.setAttribute('x2', hookX); cable.setAttribute('y2', hookY);
        hookG.setAttribute('transform', `translate(${hookX} ${hookY}) rotate(${-phi * 57.3})`);
        const cx = hookX, cy = hookY + 70;   // the hook's catch point
        cool = Math.max(0, cool - dt);

        // pieces sliding in from the delivery side
        for (const p of pieces) {
          if (p.sliding) { p.x = Math.min(p.spot, p.x + dt * 700); if (p.x >= p.spot) { p.sliding = false; kit.sfx.plop(); } }
          if (p !== carried) p.g.setAttribute('transform', `translate(${p.x} ${p.y})`);
        }
        // an empty spot on the pile gets a new floor delivered after a moment
        SPOTS.forEach((sp, i) => {
          const busy = pieces.some(q => q !== carried && Math.abs(q.x - sp) < 230 && q.y === GROUND);
          spotWait[i] = busy ? 0 : spotWait[i] + dt;
          if (spotWait[i] > 1.5) { spotWait[i] = 0; newPiece(sp, true); }
        });
        target.setAttribute('y', topY() - 18);
        target.style.display = carried && !done ? '' : 'none';

        if (!carried && !cool) {
          const p = pieces.find(q => !q.sliding && Math.abs(cx - q.x) < 120 && cy > q.y - 200 && cy < q.y - 40);
          if (p) {
            carried = p;
            p.g.remove(); carryG.appendChild(p.g);
            p.g.insertAdjacentHTML('beforeend', CHAINS);
            kit.sfx.snap();
            talk(crane, 500);
            p.spot = null; p.hookedAt = cy + 150; p.lifted = false;
          }
        }
        if (carried) {
          // the floor hangs from the hook: chains meet 150 above its bottom
          carried.g.setAttribute('transform', `translate(0 ${70 + 150})`);
          const bottom = cy + 150, bx = cx;
          if (!done && Math.abs(bx - BXC) < 170 && bottom >= topY() - 24) {
            const p = carried;
            carried = null; cool = 1;
            p.g.remove(); pieces.splice(pieces.indexOf(p), 1);
            placeFloor(p);
            tgL = Math.min(tgL, topY() - JIB - 300);
          } else {
            // set down on the ground somewhere else (only after it has really been lifted): it stays there
            if (bottom < carried.hookedAt - 70) carried.lifted = true;
            if (carried.lifted && bottom >= GROUND - 4) {
              const p = carried;
              carried = null; cool = 1.2;
              p.g.remove(); pileG.appendChild(p.g);
              p.g.querySelector('path[stroke-dasharray]')?.remove();
              p.x = bx; p.y = GROUND; p.spot = null;
              kit.sfx.plop();
              tgL -= 140;
            }
          }
        }
        // keep the hook (and anything it carries) above the ground and out of the building
        const maxCatch = carried ? GROUND - 150 : GROUND - 10;
        const overB = Math.abs(cx - BXC) < 170;
        const limit = overB ? Math.min(maxCatch, (carried ? topY() - 150 : topY() - 10)) : maxCatch;
        tgL = Math.min(tgL, limit - 70 - JIB);
      }
      let dragging = false;
      const setTarget = p => { tgx = Math.max(300, Math.min(1150, p.x)); tgL = Math.max(80, Math.min(GROUND - JIB, p.y - JIB)); };
      return {
        update,
        down(p) { dragging = true; setTarget(p); kit.sfx.pickUp(); },
        move(p) { if (dragging) setTarget(p); },
        up() { dragging = false; },
        stop() {},
      };
    }

    /* ================= 3. cement mixer ================= */
    function mixerPage(svg) {
      svg.innerHTML = SKY;
      const MX = 650;
      const mould = svgEl('g', {}, svg);
      const truck = svgEl('g', { transform: `translate(${MX} ${GROUND})` }, svg, MIXER);
      const stripes = truck.querySelector('.bp-drumstripes');
      const stream = svgEl('path', { fill: 'none', stroke: '#8d8d9e', 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0 }, svg);
      const MX0 = 160, MX1 = 600, MY = 852, MH = 54;
      let fill = 0, wet = false, prints = 0, speed = 0, stripeX = 0, pouring = false, glugT = 0, drying = false, mouldX = 0, sliding = 0;
      let rumbleT = 0;

      function drawMould() {
        mould.innerHTML = `
          <clipPath id="bp-mclip"><rect x="${MX0 + 16}" y="${MY - MH}" width="${MX1 - MX0 - 32}" height="${MH}"/></clipPath>
          <rect x="${MX0}" y="${MY - MH - 12}" width="${MX1 - MX0}" height="${MH + 20}" rx="8" fill="#c98a4b" stroke="${INK}" stroke-width="6"/>
          <rect x="${MX0 + 16}" y="${MY - MH}" width="${MX1 - MX0 - 32}" height="${MH}" fill="#7a5a3a"/>
          <g clip-path="url(#bp-mclip)"><rect class="bp-cement" x="${MX0 + 16}" width="${MX1 - MX0 - 32}" fill="#9a9aab"/>
            <g class="bp-prints"></g></g>`;
      }
      drawMould();
      const cementEl = () => mould.querySelector('.bp-cement');

      function hand(x, y, s, flip) {
        const g = svgEl('g', { transform: `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`, fill: '#6f6f80', opacity: 0.9 }, mould.querySelector('.bp-prints'));
        g.innerHTML = `<ellipse cx="0" cy="8" rx="17" ry="14"/>
          <ellipse cx="-19" cy="-4" rx="5" ry="11" transform="rotate(-35 -19 -4)"/>
          <ellipse cx="-10" cy="-16" rx="5" ry="12"/><ellipse cx="0" cy="-19" rx="5" ry="13"/>
          <ellipse cx="10" cy="-17" rx="5" ry="12"/><ellipse cx="18" cy="-9" rx="4.5" ry="10" transform="rotate(20 18 -9)"/>`;
      }

      function update(dt) {
        if (pouring && fill < 1 && !sliding) speed = Math.max(speed, 2);
        speed *= Math.pow(0.6, dt);
        if (speed < 0.05) speed = 0;
        stripeX = (stripeX + speed * dt * 60) % 160;
        stripes.setAttribute('transform', `translate(${stripeX} 0)`);
        // drum rumble: soft short pulses, faster when it spins faster (a held low sawtooth buzzed on the iPad)
        if (speed > 0.2) {
          rumbleT -= dt;
          if (rumbleT <= 0) {
            rumbleT = Math.max(0.09, 0.2 - speed * 0.015);
            const f = 120 + speed * 6;
            kit.tone(f, { dur: 0.09, vol: 0.1, slide: f * 0.8, attack: 0.015 });
            kit.tone(f * 2, { dur: 0.06, vol: 0.03, attack: 0.015 });
          }
        } else rumbleT = 0;

        const pourNow = pouring && fill < 1 && !wet && !sliding;
        if (pourNow) {
          fill = Math.min(1, fill + dt * 0.2);
          glugT -= dt;
          if (glugT <= 0) { glugT = 0.28; kit.tone(kit.rand(110, 170), { dur: 0.18, vol: 0.18, slide: 70 }); }
          if (fill >= 1) {
            wet = true; pouring = false;
            kit.sfx.chime();
            talk(truck, 900);
            const [sx, sy] = toScreen(svg, (MX0 + MX1) / 2, MY - MH);
            kit.burst(sx, sy, 40, 0.8);
            t.later(() => kit.say('Tryk med hånden!', { pitch: 1.2 }), 500);
          }
        }
        const surfY = MY - MH * fill;
        stream.setAttribute('d', `M${MX - 66} ${GROUND - 96} Q${MX - 90} ${GROUND - 70} ${MX - 96} ${surfY}`);
        stream.setAttribute('opacity', pourNow ? 1 : 0);
        const c = cementEl();
        c.setAttribute('y', surfY); c.setAttribute('height', MH * fill + 2);
        c.setAttribute('fill', drying ? '#c9c9d4' : '#9a9aab');
        if (sliding) {
          sliding -= dt;
          mouldX = sliding > 0.6 ? lerp(mouldX, -800, 0.08) : lerp(mouldX, 0, 0.12);
          if (sliding > 0.55 && sliding - dt <= 0.6) { /* swap at the far side */ }
          mould.setAttribute('transform', `translate(${mouldX} 0)`);
          if (sliding <= 0) { sliding = 0; mouldX = 0; mould.setAttribute('transform', ''); }
        }
      }
      function nextMould() {
        sliding = 1.6;
        kit.sfx.whoosh();
        t.later(() => { fill = 0; wet = false; drying = false; prints = 0; drawMould(); mouldX = -800; }, 700);
      }

      const onDrum = p => p.x > MX + 30 && p.x < MX + 460 && p.y > GROUND - 360 && p.y < GROUND - 100;
      return {
        update,
        down(p) {
          if (onDrum(p)) {
            speed = Math.min(8, speed + 2.2);
            kit.sfx.boing();
            talk(truck, 500);
            return;
          }
          // once the cement is wet, a tap anywhere presses a hand print (at the nearest spot in the mould)
          if (wet && !drying) {
            hand(Math.max(MX0 + 40, Math.min(MX1 - 40, p.x)), MY - MH / 2, 1.1, prints % 2);
            prints++;
            kit.sfx.splat();
            const [sx, sy] = toScreen(svg, p.x, MY - MH);
            kit.burst(sx, sy, 14, 0.5);
            if (prints >= 6) {
              drying = true;
              t.later(() => { kit.sfx.fanfare(); kit.say('Flot!', { pitch: 1.3 }); }, 400);
              t.later(nextMould, 3200);
            }
            return;
          }
          // anywhere else: hold to pour (the drum turns while it pours)
          pouring = true;
        },
        move() {},
        up() { pouring = false; },
        stop() {},
      };
    }

    /* ================= page switching and input ================= */
    const PAGES = [diggerPage, cranePage, mixerPage];
    let pageIdx = -1, page = null, svg = null;
    function show(i) {
      if (page) page.stop();
      if (svg) svg.remove();
      pageIdx = i;
      navBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'bp-svg');
      svg.setAttribute('preserveAspectRatio', 'none');
      root.insertBefore(svg, nav);
      active = null;
      page = PAGES[i](svg);
      fitView();
    }

    // Input lives on the root div (the svg ignores pointers), so capture is on a plain HTML element, which Safari
    // handles reliably. Touching anywhere drives the current station. One finger at a time, but a new touch
    // always wins, so a pointerup that iOS swallowed (edge gestures) can never lock the game.
    let active = null;
    root.style.touchAction = 'none';
    root.addEventListener('pointerdown', e => {
      if (e.target.closest('.bp-nav') || e.target.closest('#homeBtn')) return;
      e.preventDefault();
      if (active !== null && active !== e.pointerId) page.up(toScene(e.clientX, e.clientY));
      active = e.pointerId;
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      page.down(toScene(e.clientX, e.clientY));
    });
    root.addEventListener('pointermove', e => { if (e.pointerId === active) page.move(toScene(e.clientX, e.clientY)); });
    const up = e => { if (e.pointerId === active) { active = null; page.up(toScene(e.clientX, e.clientY)); } };
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    root.addEventListener('lostpointercapture', up);
    show(0);

    let raf = 0, last = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      page.update(dt);
    }
    raf = requestAnimationFrame(frame);
    const offResize = kit.onResize(root, fitView);

    return () => { cancelAnimationFrame(raf); t.clear(); offResize(); if (page) page.stop(); };
  },
};
