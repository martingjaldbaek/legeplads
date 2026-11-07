/* Saml dyret: an animal's body stands in the middle with dashed outlines where its head, legs, tail…
 * belong. The loose parts lie around it; drag them on. Snapping is generous: a part dropped anywhere on
 * the animal jumps to the nearest free spot of its kind (any leg fits any leg slot). Each part is named
 * as it clicks into place. When the animal is whole it comes alive, says something, walks (or flies)
 * off, and the next animal walks in. Art lives in games/art/dyr-art.js.
 */
import { ANIMALS } from './art/dyr-art.js';

const WORD = { leg: 'Ben', arm: 'Arm', head: 'Hoved', tail: 'Hale', wing: 'Vinge', wing2: 'Vinge', ear: 'Øre', spikes: 'Takker' };
const ORIGIN = { leg: '50% 6%', arm: '50% 6%', head: '50% 90%', tail: '50% 50%', wing: '50% 50%', wing2: '50% 50%', ear: '0% 50%', spikes: '50% 100%' };
const NS = 'http://www.w3.org/2000/svg';

const CSS = `
.dyr-animal { position:absolute; left:0; top:0; will-change:transform; }
.dyr-bob { width:100%; height:100%; }
.dyr-animal svg { width:100%; height:100%; overflow:visible; display:block; }
.dyr-p, .dyr-bob, .eyes { transform-box: fill-box; }
.dyr-ghost * { fill: rgba(74,59,92,.07) !important; stroke: rgba(74,59,92,.5) !important; stroke-width: 4px !important; stroke-dasharray: 10 9; }
.dyr-ghost .line { fill: none !important; }
.dyr-ghost .d { display: none; }
.dyr-ghost { animation: dyr-pulse 1.4s ease-in-out infinite alternate; }
@keyframes dyr-pulse { from { opacity:.45 } to { opacity:1 } }
.dyr-animal .m-open { display:none; }
.dyr-animal.talk .m-open { display:inline; } .dyr-animal.talk .m-closed { display:none; }
.dyr-animal .eyes, .dyr-piece .eyes { transform-origin:center; animation: dyr-blink 3.8s infinite; }
@keyframes dyr-blink { 0%,93%,100% { transform:none } 96% { transform:scaleY(.1) } }
.dyr-p { transform-origin: var(--o); }
.dyr-p.snap { animation: dyr-wiggle .5s ease; }
@keyframes dyr-wiggle { 0%,100%{transform:none} 20%{transform:rotate(-9deg) scale(1.08)} 45%{transform:rotate(7deg)} 70%{transform:rotate(-4deg)} }
.dyr-bob.boing { animation: dyr-boing .45s ease; }
@keyframes dyr-boing { 0%,100%{transform:none} 30%{transform:scale(1.05,.93)} 60%{transform:scale(.97,1.04)} }

/* walking / flying */
.walk .dyr-bob { animation: dyr-hop .34s ease-in-out infinite alternate; }
@keyframes dyr-hop { from { transform:none } to { transform: translateY(-3%) rotate(-1.5deg) } }
.fly.walk .dyr-bob { animation: dyr-flutter 1s ease-in-out infinite alternate; }
@keyframes dyr-flutter { from { transform: translateY(4%) } to { transform: translateY(-6%) } }
.walk .k-leg, .walk .k-arm { animation: dyr-step .34s ease-in-out infinite alternate; }
.walk .k-leg.alt, .walk .k-arm.alt { animation-direction: alternate-reverse; }
@keyframes dyr-step { from { transform: rotate(16deg) } to { transform: rotate(-16deg) } }
.walk .k-tail, .alive .k-tail { animation: dyr-wag .25s ease-in-out infinite alternate; }
@keyframes dyr-wag { from { transform: rotate(-12deg) } to { transform: rotate(12deg) } }
.walk .k-head, .alive .k-head { animation: dyr-nod .5s ease-in-out infinite alternate; }
@keyframes dyr-nod { from { transform: rotate(-4deg) } to { transform: rotate(4deg) } }
.walk .k-wing, .walk .k-wing2, .alive .k-wing, .alive .k-wing2 { animation: dyr-flap .18s ease-in-out infinite alternate; }
@keyframes dyr-flap { from { transform: none } to { transform: scaleX(.55) } }
.walk .k-ear, .alive .k-ear { animation: dyr-ear .3s ease-in-out infinite alternate; }
@keyframes dyr-ear { from { transform: none } to { transform: rotate(-12deg) scaleX(1.1) } }

.dyr-piece { position:absolute; left:0; top:0; touch-action:none; will-change:transform; }
.dyr-piece::before { content:''; position:absolute; inset:-28px; }   /* bigger target for thin parts like tails */
.dyr-piece svg { width:100%; height:100%; overflow:visible; display:block; filter: drop-shadow(0 .8vmin 0 rgba(0,0,0,.12)); }
.dyr-piece.fly { transition: transform .22s ease-out, width .22s ease-out, height .22s ease-out; }
.dyr-piece.lift svg { filter: drop-shadow(0 2vmin 1.4vmin rgba(0,0,0,.25)); }
.dyr-piece.pop { animation: dyr-pop .4s ease backwards; }
@keyframes dyr-pop { from { opacity:0; scale:.2 } 70% { scale:1.1 } to { opacity:1; scale:1 } }

/* animal picker along the top */
.dyr-pick { position:absolute; top:12px; left:104px; right:12px; display:flex; justify-content:center; gap:8px; }
.dyr-pick button { flex:1 1 0; max-width:104px; aspect-ratio:4/3; padding:4px; border:0; border-radius:16px;
  background:rgba(255,255,255,.7); box-shadow:0 3px 0 rgba(0,0,0,.08); touch-action:none; transition: transform .15s; }
.dyr-pick button.on { background:#fff; box-shadow:0 0 0 4px #ffd23f, 0 3px 0 rgba(0,0,0,.08); transform: scale(1.08); }
.dyr-pick button.tap { animation: dyr-boing .35s ease; }
.dyr-pick svg { width:100%; height:100%; display:block; overflow:visible; pointer-events:none; }
.dyr-pick .m-open { display:none; }
.dyr-leave { transition: transform .7s ease-in, opacity .7s ease-in !important; opacity:0; }
.dyr-piece.gone { transition: transform .35s ease-in, opacity .35s; opacity:0; pointer-events:none; }
`;

export default {
  id: 'dyrpuslespil',
  title: 'Saml dyret',
  icon: '🦒',
  color: '#06a77d',
  edge: '#a8dc96',

  start(root, kit) {
    root.style.background = 'linear-gradient(#bde4ff 0%, #e8f6ff 58%, #c6eab4 58%, #a8dc96 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const order = kit.shuffle(ANIMALS.slice());
    let idx = 0, cur = null, z = 20;
    let W = 0, H = 0, s = 1, ax = 0, ay = 0, aw = 0, ah = 0;   // animal box on screen (px)

    /* ---------- picker: a button per animal, tap to build that one now ---------- */
    const pick = document.createElement('div');
    pick.className = 'dyr-pick';
    root.appendChild(pick);
    const btns = ANIMALS.map(a => {
      const b = document.createElement('button');
      const back = a.parts.filter(p => p.layer !== 'front').map(p => p.svg).join('');
      const front = a.parts.filter(p => p.layer === 'front').map(p => p.svg).join('');
      b.innerHTML = `<svg viewBox="20 10 360 280">${back}${a.body}${front}</svg>`;
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        kit.replay(b, 'tap');
        choose(a);
      });
      pick.appendChild(b);
      return { a, b };
    });
    const markPicked = a => btns.forEach(x => x.b.classList.toggle('on', x.a === a));
    const pickBottom = () => pick.getBoundingClientRect().bottom - root.getBoundingClientRect().top;

    function choose(a) {
      if (cur && cur.a === a && !cur.done) { kit.sfx.boing(); kit.say(a.name, { pitch: 1.25 }); return; }
      kit.sfx.fwip();
      kit.say(a.name, { pitch: 1.25 });
      const old = cur;
      cur = null;
      if (old) {
        // the unfinished animal scoots off to the right, its loose parts poof
        old.pieces.forEach(pc => { if (pc.el.isConnected) { pc.el.classList.add('gone'); setTimeout(() => pc.el.remove(), 400); } });
        old.wrap.style.transition = '';
        old.wrap.classList.add('walk', 'dyr-leave');
        old.wrap.style.transform = `translateX(${W - ax + 30}px)`;
        setTimeout(() => old.wrap.remove(), 750);
      }
      next(a);
    }

    /* ---------- building an animal ---------- */
    function build(a) {
      const wrap = document.createElement('div');
      wrap.className = 'dyr-animal' + (a.fly ? ' fly' : '');
      wrap.innerHTML = `<div class="dyr-bob"><svg viewBox="0 0 400 300">
        <g class="gb"></g><g class="lb"></g><g class="body">${a.body}</g><g class="gf"></g><g class="lf"></g></svg></div>`;
      root.insertBefore(wrap, root.firstChild.nextSibling);   // after the <style>, below all pieces
      const g = sel => wrap.querySelector(sel);
      const seen = {};
      const slots = a.parts.map(p => {
        const n = seen[p.kind] = (seen[p.kind] || 0) + 1;
        const ghost = document.createElementNS(NS, 'g');
        ghost.setAttribute('class', 'dyr-ghost');
        ghost.innerHTML = p.svg;
        g(p.layer === 'front' ? '.gf' : '.gb').appendChild(ghost);
        return { p, ghost, filled: false, alt: n % 2 === 0 };
      });
      wrap.addEventListener('pointerdown', e => {
        if (!cur || cur.done) return;
        e.preventDefault();
        kit.replay(g('.dyr-bob'), 'boing');
        kit.sfx.boing();
      });
      return { a, wrap, slots, pieces: [], done: false, g };
    }

    // bounding boxes need the SVG laid out, so measure after the first layout
    function measure(c) {
      c.slots.forEach(sl => {
        const b = sl.ghost.getBBox(), pad = 7;
        sl.box = { x: b.x - pad, y: b.y - pad, w: b.width + 2 * pad, h: b.height + 2 * pad };
      });
    }

    function makePieces(c) {
      c.pieces = kit.shuffle(c.slots.slice()).map(sl => {
        const b = sl.box;
        const el = document.createElement('div');
        el.className = 'dyr-piece pop';
        el.innerHTML = `<svg viewBox="${b.x} ${b.y} ${b.w} ${b.h}">${sl.p.svg}</svg>`;
        el.dataset.kind = sl.p.kind;
        root.appendChild(el);
        const pc = { el, kind: sl.p.kind, box: b, rot: kit.rand(-14, 14), x: 0, y: 0, ps: 1, home: null };
        bindPiece(c, pc);
        return pc;
      });
      layoutPieces(c);
      c.pieces.forEach((pc, i) => { pc.el.style.animationDelay = i * 90 + 'ms'; });
    }

    /* ---------- layout ---------- */
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const portrait = H > W;
      aw = portrait ? Math.min(W * 0.84, H * 0.40 * 4 / 3) : Math.min(W * 0.46, H * 0.62 * 4 / 3);
      s = aw / 400; ah = 300 * s;
      ax = (W - aw) / 2;
      ay = portrait ? H * 0.5 - ah / 2 : H * 0.54 - ah / 2;
      ay = Math.max(ay, pickBottom() + 20);
      if (cur) {
        Object.assign(cur.wrap.style, { width: aw + 'px', height: ah + 'px', left: ax + 'px', top: ay + 'px' });
        layoutPieces(cur);
      }
    }

    // spread the loose pieces in the free space: left/right of the animal in landscape, above/below in portrait
    function layoutPieces(c) {
      const loose = c.pieces.filter(pc => !pc.placed);
      if (!loose.length) return;
      const portrait = H > W, top = pickBottom() + 10, gapX = 16;
      const zoneA = [], zoneB = [];
      loose.forEach((pc, i) => (i % 2 ? zoneB : zoneA).push(pc));
      const place = (list, zx, zy, zw, zh, horizontal) => {
        const n = list.length;
        list.forEach((pc, i) => {
          const cw = horizontal ? zw / n : zw, ch = horizontal ? zh : zh / n;
          const cx = horizontal ? zx + cw * (i + 0.5) : zx + zw / 2;
          const cy = horizontal ? zy + zh / 2 : zy + ch * (i + 0.5);
          pc.ps = Math.min(s, (cw * 0.86) / pc.box.w, (ch * 0.86) / pc.box.h);
          pc.home = { x: cx + kit.rand(-0.06, 0.06) * cw, y: cy + kit.rand(-0.05, 0.05) * ch };
          setPiece(pc, pc.home.x, pc.home.y, pc.ps);
        });
      };
      if (portrait) {
        place(zoneA, gapX, top, W - 2 * gapX, ay - top, true);
        place(zoneB, gapX, ay + ah, W - 2 * gapX, H - ay - ah - 12, true);
      } else {
        place(zoneA, gapX, top, ax - gapX, H - top - 12, false);
        place(zoneB, ax + aw, top, W - ax - aw - gapX, H - top - 12, false);
      }
    }

    function setPiece(pc, x, y, scale, rot = pc.rot) {
      pc.x = x; pc.y = y;
      const w = pc.box.w * scale, h = pc.box.h * scale;
      pc.el.style.width = w + 'px'; pc.el.style.height = h + 'px';
      pc.el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${rot}deg)`;
    }

    const slotCenter = sl => ({ x: ax + (sl.box.x + sl.box.w / 2) * s, y: ay + (sl.box.y + sl.box.h / 2) * s });

    /* ---------- dragging ---------- */
    function bindPiece(c, pc) {
      let dx = 0, dy = 0;
      kit.draggable(pc.el, {
        start(e) {
          if (pc.placed || c.done) return false;
          pc.el.classList.remove('fly', 'pop');
          pc.el.classList.add('lift');
          pc.el.style.zIndex = ++z;
          // grab point stays under the finger while the piece grows to full size
          const k = s / pc.ps;
          dx = (pc.x - e.clientX) * k; dy = (pc.y - e.clientY) * k;
          setPiece(pc, e.clientX + dx, e.clientY + dy, s, 0);
          kit.sfx.pickUp();
        },
        move(e) { setPiece(pc, e.clientX + dx, e.clientY + dy, s, 0); },
        end() {
          pc.el.classList.remove('lift');
          if (cur !== c) return;   // another animal was picked mid-drag
          drop(c, pc, pc.x, pc.y);
        },
      });
    }

    function drop(c, pc, x, y) {
      const free = c.slots.filter(sl => !sl.filled && !sl.taken && sl.p.kind === pc.kind);
      let best = null, bd = Infinity;
      free.forEach(sl => { const q = slotCenter(sl); const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = sl; } });
      const overAnimal = x > ax - aw * 0.15 && x < ax + aw * 1.15 && y > ay - ah * 0.2 && y < ay + ah * 1.15;
      if (best && (overAnimal || bd < Math.max(best.box.w, best.box.h) * s * 0.9 + 60)) return snap(c, pc, best);
      if (overAnimal) {   // wrong place on top of the animal: hop back home
        pc.el.classList.add('fly');
        setPiece(pc, pc.home.x, pc.home.y, pc.ps);
        kit.sfx.boing();
        return;
      }
      pc.home = { x, y };   // dropped in free space: leave it there
      pc.el.classList.add('fly');
      setPiece(pc, x, y, pc.ps, pc.rot);
      kit.sfx.plop();
    }

    function snap(c, pc, sl) {
      sl.taken = true; pc.placed = true;
      const q = slotCenter(sl);
      // fly to the slot, showing the slot's own drawing (legs are interchangeable but mirror per side)
      pc.el.innerHTML = `<svg viewBox="${sl.box.x} ${sl.box.y} ${sl.box.w} ${sl.box.h}">${sl.p.svg}</svg>`;
      pc.box = sl.box;
      pc.el.classList.add('fly');
      setPiece(pc, q.x, q.y, s, 0);
      t.later(() => {
        pc.el.remove();
        if (cur !== c) return;
        sl.ghost.remove();
        sl.filled = true;
        const gEl = document.createElementNS(NS, 'g');
        gEl.setAttribute('class', `dyr-p k-${sl.p.kind}${sl.alt ? ' alt' : ''}`);
        gEl.style.setProperty('--o', sl.p.o || ORIGIN[sl.p.kind]);
        gEl.innerHTML = sl.p.svg;
        c.g(sl.p.layer === 'front' ? '.lf' : '.lb').appendChild(gEl);
        kit.replay(gEl, 'snap');
        kit.sfx.snap();
        kit.burst(q.x, q.y, 14, 0.5);
        if (c.slots.every(x => x.filled)) t.later(() => alive(c), 500);
        else kit.say(WORD[sl.p.kind] + '!', { pitch: 1.25 });
      }, 230);
    }

    /* ---------- complete: come alive, leave, next animal ---------- */
    function alive(c) {
      if (cur !== c) return;
      c.done = true;
      c.wrap.classList.add('alive', 'talk');
      kit.sfx.fanfare();
      kit.say(c.a.line, { pitch: 1.2 });
      kit.burst(ax + aw / 2, ay + ah / 2, 90, 1.1);
      t.later(() => c.wrap.classList.remove('talk'), 1800);
      t.later(() => {
        if (cur !== c) return;
        c.wrap.classList.add('walk');
        c.wrap.style.transition = 'transform 3.2s ease-in';
        c.wrap.style.transform = `translate(${W - ax + 30}px, ${c.a.fly ? -ay - ah : 0}px)`;
        kit.sfx.whoosh();
      }, 2400);
      t.later(() => { if (cur !== c) return; c.wrap.remove(); next(); }, 5600);
    }

    function next(chosen) {
      let a = chosen;
      if (!a) {
        a = order[idx++ % order.length];
        if (idx % order.length === 0) kit.shuffle(order);
      }
      markPicked(a);
      cur = build(a);
      layout();
      measure(cur);
      // walk in from the left
      const w = cur.wrap;
      w.classList.add('walk');
      w.style.transform = `translateX(${-(ax + aw + 30)}px)`;
      void w.offsetWidth;
      w.style.transition = 'transform 1.6s ease-out';
      w.style.transform = 'none';
      const c = cur;
      t.later(() => {
        if (cur !== c) return;
        w.classList.remove('walk');
        w.style.transition = '';
        makePieces(c);
        kit.sfx.fwip();
      }, 1650);
    }

    next();
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); };
  },
};
