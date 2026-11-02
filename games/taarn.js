/* Tårnet: build a tower from colourful blocks, then knock it down.
 * Drag blocks out of the box at the side and stack them. Blocks have real (simple) physics: they rest,
 * wobble and topple. Tap a block in the tower to make it hop. Fling a block to throw it.
 * 🚜 sends a bulldozer that drives in and pushes everything over; 🧹 tidies up.
 * Physics: a small Box2D-lite style solver (oriented boxes, SAT + clipping for contacts, sequential
 * impulses with warm starting), fixed 1/120 s steps. The whole scene goes to sleep once it is still,
 * so a finished tower never creeps; any touch wakes it.
 */

const INK = '#4a3b5c';
// block types, in world units (a cube is 1×1)
const TYPES = [
  { id: 'cube', w: 1, h: 1, deco: 'face' },
  { id: 'plank', w: 2.4, h: 0.5, deco: 'stripes' },
  { id: 'pillar', w: 0.55, h: 1.7, deco: 'dots' },
  { id: 'big', w: 1.5, h: 1, deco: 'star' },
  { id: 'small', w: 0.7, h: 0.7, deco: 'heart' },
];
const PALETTE = ['#ff4d6d', '#ff8a00', '#ffc400', '#2ec4b6', '#3a86ff', '#8338ec', '#06d6a0', '#f15bb5'];
const MAX_BLOCKS = 30;
const DT = 1 / 120, ITER = 10, GRAV = 22, SLOP = 0.01, BAUM = 0.2, MU = 0.7;

const CSS = `
.taarn-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.taarn-box { position:absolute; display:flex; gap:1.6vmin; padding:1.6vmin; border-radius:3vmin;
  background: rgba(255,255,255,.72); box-shadow: 0 1vmin 0 rgba(0,0,0,.08); z-index:5; }
.taarn-src { position:relative; border-radius:1.6vmin; background:#fff; box-shadow: 0 .5vmin 0 rgba(0,0,0,.08);
  display:flex; align-items:center; justify-content:center; touch-action:none; }
.taarn-src i { display:block; border:max(3px,.45vmin) solid ${INK}; border-radius:.9vmin; }
.taarn-btn { position:absolute; z-index:6; width:max(70px,10vmin); height:max(70px,10vmin); border:none; border-radius:50%;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(38px,5.6vmin); padding:0; line-height:1; }
.taarn-btn:active { transform: scale(.9); }
.taarn-btn.go { animation: taarn-pulse 1.4s ease-in-out infinite; }
@keyframes taarn-pulse { 0%,100% { transform:none } 50% { transform: scale(1.12) } }
`;

/* ---------- tiny rigid-box physics ---------- */
let nextId = 1;
function makeBody(x, y, hw, hh, dynamic = true) {
  const m = dynamic ? 4 * hw * hh : 0;
  const I = dynamic ? m * ((2 * hw) ** 2 + (2 * hh) ** 2) / 12 : 0;
  return { id: nextId++, x, y, a: 0, vx: 0, vy: 0, w: 0, hw, hh,
    invM: m ? 1 / m : 0, invI: I ? 1 / I : 0, m0: m ? 1 / m : 0, i0: I ? 1 / I : 0, r: Math.hypot(hw, hh) };
}
function verts(b) {
  const c = Math.cos(b.a), s = Math.sin(b.a);
  return [[-b.hw, -b.hh], [b.hw, -b.hh], [b.hw, b.hh], [-b.hw, b.hh]]
    .map(([lx, ly]) => [b.x + c * lx - s * ly, b.y + s * lx + c * ly]);
}
function normals(v) {
  return v.map((p, i) => {
    const q = v[(i + 1) % 4], ex = q[0] - p[0], ey = q[1] - p[1], l = Math.hypot(ex, ey);
    return [ey / l, -ex / l];
  });
}
// largest separation of polygon b's vertices along a's face normals → [sep, faceIndex]
function maxSep(va, na, vb) {
  let best = -Infinity, bi = 0;
  for (let i = 0; i < 4; i++) {
    const n = na[i], p = va[i];
    let m = Infinity;
    for (const q of vb) m = Math.min(m, n[0] * (q[0] - p[0]) + n[1] * (q[1] - p[1]));
    if (m > best) { best = m; bi = i; }
  }
  return [best, bi];
}
// contacts between boxes A and B: [{x, y, nx, ny, pen}] with the normal pointing from A to B
function collide(A, B) {
  const va = verts(A), vb = verts(B), na = normals(va), nb = normals(vb);
  const [sa, fa] = maxSep(va, na, vb); if (sa > 0) return [];
  const [sb, fb] = maxSep(vb, nb, va); if (sb > 0) return [];
  let ref, inc, nref, ninc, fi, flip;
  if (sb > 0.95 * sa + 0.01 * 0.5) { ref = vb; nref = nb; inc = va; ninc = na; fi = fb; flip = true; }
  else { ref = va; nref = na; inc = vb; ninc = nb; fi = fa; flip = false; }
  const n = nref[fi];
  let j = 0, md = Infinity;
  for (let k = 0; k < 4; k++) { const d = ninc[k][0] * n[0] + ninc[k][1] * n[1]; if (d < md) { md = d; j = k; } }
  let p1 = inc[j], p2 = inc[(j + 1) % 4];
  const r1 = ref[fi], r2 = ref[(fi + 1) % 4];
  const tx = r2[0] - r1[0], ty = r2[1] - r1[1], tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl;
  const lo = ux * r1[0] + uy * r1[1], hi = ux * r2[0] + uy * r2[1];
  // clip segment p1–p2 to lo ≤ u·p ≤ hi
  const clip = (a, b, off, sign) => {
    const da = sign * (ux * a[0] + uy * a[1] - off), db = sign * (ux * b[0] + uy * b[1] - off);
    const out = [];
    if (da >= 0) out.push(a);
    if (db >= 0) out.push(b);
    if (da * db < 0) { const t = da / (da - db); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
    return out;
  };
  let pts = clip(p1, p2, lo, 1); if (pts.length < 2) return [];
  pts = clip(pts[0], pts[1], hi, -1); if (pts.length < 2) return [];
  const res = [];
  for (const p of pts) {
    const sep = n[0] * (p[0] - r1[0]) + n[1] * (p[1] - r1[1]);
    if (sep <= 0.02) res.push({ x: p[0], y: p[1], nx: flip ? -n[0] : n[0], ny: flip ? -n[1] : n[1], pen: -sep });
  }
  return res;
}

export default {
  id: 'taarn',
  title: 'Tårnet',
  icon: '🧱',
  color: '#e85d04',
  edge: '#9bd28a',

  start(root, kit) {
    root.style.background = 'linear-gradient(#8fd3ff 0%, #d8f1ff 70%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const cv = document.createElement('canvas');
    cv.className = 'taarn-cv';
    const box = document.createElement('div');
    box.className = 'taarn-box';
    const dozerBtn = document.createElement('button');
    dozerBtn.className = 'taarn-btn';
    dozerBtn.textContent = '🚜';
    dozerBtn.setAttribute('aria-label', 'Bulldozer');
    const tidyBtn = document.createElement('button');
    tidyBtn.className = 'taarn-btn';
    tidyBtn.textContent = '🧹';
    tidyBtn.setAttribute('aria-label', 'Ryd op');
    root.append(cv, box, dozerBtn, tidyBtn);
    const g = cv.getContext('2d');

    let W = 0, H = 0, S = 60, WU = 10, HU = 10, groundY = 9, portrait = false;
    const blocks = [];   // dynamic bodies with .type, .color, .born
    let statics = [];
    let dozer = null;     // { body, dir, phase, sound }
    const arbiters = new Map();
    let awake = true, stillFor = 0, record = 0, settleCheck = false;
    let leftU = 0;   // world x of the supply box's right edge in landscape (0 in portrait): no block may rest left of it
    let topU = 0;    // world y of the supply row's bottom edge in portrait (0 in landscape): held blocks stay below it

    /* ---------- layout ---------- */
    function layout() {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = root.clientWidth; H = root.clientHeight; portrait = H > W;
      cv.width = W * d; cv.height = H * d;
      g.setTransform(d, 0, 0, d, 0, 0);
      const oldS = S;
      S = portrait ? Math.min(W / 8, H / 13) : Math.min(H / 9.5, W / 12);
      WU = W / S; HU = H / S;
      groundY = HU - (portrait ? 0.9 : 0.8);
      // keep existing blocks where they were on screen, proportionally
      if (oldS !== S && blocks.length) { blocks.forEach(b => { b.x *= oldS / S; b.y *= oldS / S; }); }
      // in landscape the supply box sits on the left: the wall stands just right of it, so blocks never hide behind it
      const leftEdge = portrait ? 0 : (cellPx() * 1 + 14 + 3.2 * Math.min(W, H) / 100 + 8) / S;
      leftU = leftEdge;
      statics = [
        makeBody(WU / 2, groundY + 5, WU * 2, 5, false),
        makeBody(leftEdge - 5, HU / 2 - 20, 5, HU + 40, false),
        makeBody(WU + 5, HU / 2 - 20, 5, HU + 40, false),
      ];
      blocks.forEach(b => { b.y = Math.min(b.y, groundY - b.hh); });
      arbiters.clear();
      // supply box: a column on the left (landscape) or a row along the top (portrait)
      const cell = cellPx();
      box.style.flexDirection = portrait ? 'row' : 'column';
      Object.assign(box.style, portrait
        ? { left: '50%', top: 'calc(env(safe-area-inset-top) + 14px)', transform: 'translateX(-50%)' }
        : { left: 'calc(env(safe-area-inset-left) + 14px)', top: '50%', transform: 'translateY(-50%)' });
      srcs.forEach((s, i) => {
        const ty = TYPES[i], k = cell * 0.62 / Math.max(ty.w, ty.h, 1.2);
        s.style.width = s.style.height = cell + 'px';
        Object.assign(s.firstChild.style, { width: ty.w * k * 1.3 + 'px', height: ty.h * k * 1.3 + 'px' });
      });
      const bs = 'calc(env(safe-area-inset-top) + 14px)';
      Object.assign(dozerBtn.style, { top: bs, right: 'calc(env(safe-area-inset-right) + 14px)' });
      Object.assign(tidyBtn.style, { top: bs, right: `calc(env(safe-area-inset-right) + 28px + max(70px,10vmin))` });
      { const br = box.getBoundingClientRect(), cr = cv.getBoundingClientRect(); topU = portrait ? (br.bottom - cr.top) / S : 0; }
      if (portrait) {
        // below the supply row, top right, out of the building area
        const below = `calc(env(safe-area-inset-top) + 34px + ${cell}px + 3.2vmin)`;
        Object.assign(dozerBtn.style, { top: below });
        Object.assign(tidyBtn.style, { top: below });
      }
      wake();
    }

    const cellPx = () => (portrait ? Math.min(W * 0.13, H * 0.08) : Math.min(H * 0.12, W * 0.085));
    const srcs = TYPES.map((ty, i) => {
      const s = document.createElement('div');
      s.className = 'taarn-src';
      const swatch = document.createElement('i');
      swatch.style.background = PALETTE[(i * 3) % PALETTE.length];
      s.appendChild(swatch);
      box.appendChild(s);
      s.addEventListener('pointerdown', e => {
        e.preventDefault();
        dropStale(e);
        kit.unlock && kit.unlock();
        const [x, y] = toWorld(e);
        const b = addBlock(ty, x, y, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        grab(e, b, 0, 0, true);
        kit.sfx.pickUp();
      });
      return s;
    });

    function addBlock(ty, x, y, color) {
      const b = makeBody(x, y, ty.w / 2, ty.h / 2);
      Object.assign(b, { type: ty, color, born: performance.now(), scale: 0.3 });
      blocks.push(b);
      // too many blocks: the oldest one pops away
      if (blocks.length > MAX_BLOCKS) {
        const old = blocks.find(o => !o.held);
        if (old) removeBlock(old, true);
      }
      wake();
      return b;
    }
    function removeBlock(b, sound) {
      const i = blocks.indexOf(b);
      if (i < 0) return;
      blocks.splice(i, 1);
      for (const k of [...arbiters.keys()]) if (k.split('|').includes(String(b.id))) arbiters.delete(k);
      if (sound) kit.sfx.pop(Math.floor(Math.random() * 8));
      kit.burst(b.x * S, b.y * S, 18, 0.6);
      wake();
    }

    /* ---------- input ---------- */
    const held = new Map();   // pointerId -> { b, ox, oy, tx, ty, hist, t0, moved, pending }
    const toWorld = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / S, (e.clientY - r.top) / S]; };
    function hit(x, y) {
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (b.held) continue;
        const c = Math.cos(-b.a), s = Math.sin(-b.a), dx = x - b.x, dy = y - b.y;
        const lx = c * dx - s * dy, ly = s * dx + c * dy, pad = 0.25;   // generous for small fingers
        if (Math.abs(lx) < b.hw + pad && Math.abs(ly) < b.hh + pad) return b;
      }
      return null;
    }
    function grab(e, b, ox, oy, now) {
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      const [x, y] = toWorld(e);
      const h = { b, ox, oy, tx: x, ty: y, hist: [[performance.now(), x, y]], t0: performance.now(), moved: 0, pending: !now };
      held.set(e.pointerId, h);
      if (now) take(h);
      wake();
    }
    function take(h) {
      const b = h.b;
      h.pending = false;
      b.held = true;
      b.invM = 0; b.invI = 0;
      for (const k of [...arbiters.keys()]) if (k.split('|').includes(String(b.id))) arbiters.delete(k);
    }
    // A first finger (isPrimary) means no other finger is down, so anything still marked as held belongs to a
    // pointer whose pointerup never arrived (iOS edge gestures, Guided Access…). Let go of it, or it would hang
    // in the air for good: held blocks are kinematic, so nothing can knock them loose.
    function dropStale(e) {
      if (!e.isPrimary) return;
      for (const [id, h] of [...held]) if (id !== e.pointerId) release({ pointerId: id, clientX: -1e4, clientY: -1e4 });
    }
    cv.addEventListener('pointerdown', e => {
      e.preventDefault();
      dropStale(e);
      const [x, y] = toWorld(e);
      const b = hit(x, y);
      if (!b) return;
      // keep the grip offset in the block's own frame
      const c = Math.cos(-b.a), s = Math.sin(-b.a), dx = x - b.x, dy = y - b.y;
      grab(e, b, c * dx - s * dy, s * dx + c * dy, false);
    });
    // move/up are listened for on window: a block taken from the supply box starts with its pointer on the box's
    // tile, and on iPad touch events stay with that tile (implicit capture) if moving the capture to the canvas
    // fails, so canvas-only listeners never heard the finger lift and the block hung behind the box for ever.
    const onMove = e => {
      const h = held.get(e.pointerId);
      if (!h) return;
      const [x, y] = toWorld(e);
      h.moved += Math.hypot(x - h.tx, y - h.ty);
      h.tx = x; h.ty = y;
      h.hist.push([performance.now(), x, y]);
      if (h.hist.length > 6) h.hist.shift();
      if (h.pending && h.moved > 0.2) { take(h); kit.sfx.pickUp(); }
      wake();
    };
    const release = e => {
      const h = held.get(e.pointerId);
      if (!h) return;
      held.delete(e.pointerId);
      const b = h.b;
      if (h.pending) {
        // a tap: the block hops and the tower wobbles
        b.vy -= 4.5; b.w += kit.rand(-3, 3); b.vx += kit.rand(-1, 1);
        kit.sfx.boing();
        wake();
        return;
      }
      b.held = false; b.invM = b.m0; b.invI = b.i0;
      // dropped back on the supply box: tidy it away
      const r = box.getBoundingClientRect();
      if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) { removeBlock(b, true); return; }
      // fling: keep the finger's recent velocity, capped
      // only the last ~100 ms count: a finger that stopped before letting go just drops the block
      const now = performance.now(), recent = h.hist.filter(p => now - p[0] < 100);
      let vx = 0, vy = 0;
      if (recent.length >= 2) {
        const a = recent[0], z = recent[recent.length - 1], dt = Math.max(0.016, (z[0] - a[0]) / 1000);
        vx = (z[1] - a[1]) / dt; vy = (z[2] - a[2]) / dt;
      }
      vx *= 0.7; vy *= 0.7;   // a gentler throw: placing a block shouldn't fling it
      const sp = Math.hypot(vx, vy), cap = 14;
      if (sp < 3) { vx = 0; vy = 0; } else if (sp > cap) { vx *= cap / sp; vy *= cap / sp; }
      b.vx = vx; b.vy = vy; b.w = 0;
      if (sp > 6) kit.sfx.whoosh();
      settleCheck = true;
      wake();
    };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);

    /* ---------- buttons ---------- */
    dozerBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!dozer) { startDozer(); return; }
      // pressed again while it's out: it turns round and charges again
      dozer.dir = 1; dozer.hitSaid = false;
      kit.tone(330, { dur: 0.12, type: 'square', vol: 0.08 }); kit.tone(262, { at: 0.14, dur: 0.18, type: 'square', vol: 0.08 });
    });
    tidyBtn.addEventListener('pointerdown', e => {
      e.preventDefault();
      const list = blocks.filter(b => !b.held);
      kit.sfx.rustle();
      list.forEach((b, i) => t.later(() => removeBlock(b, true), 60 * i));
      record = 0;
    });

    function startDozer() {
      const body = makeBody(-2, groundY - 0.75, 1.3, 0.75, false);
      body.kin = true;
      dozer = { body, dir: 1, speed: 5.5, turnAt: WU * 0.72, hitSaid: false };
      dozer.sound = kit.sustain({ type: 'sawtooth', freq: 55, vol: 0.05 });
      dozerBtn.classList.add('go');
      kit.say('Brum brum!', { pitch: 1.1 });
      record = 0;
      wake();
    }
    function stopDozer() {
      if (!dozer) return;
      dozer.sound.stop(0.3);
      dozer = null;
      dozerBtn.classList.remove('go');
    }

    /* ---------- simulation ---------- */
    function wake() { awake = true; stillFor = 0; }

    function step() {
      // kinematic bodies: held blocks follow their finger, the bulldozer drives
      for (const h of held.values()) {
        if (h.pending) continue;
        const b = h.b;
        const c = Math.cos(b.a), s = Math.sin(b.a);
        // where the block centre should be so the grip point sits under the finger
        let tx = h.tx - (c * h.ox - s * h.oy), ty = h.ty - (s * h.ox + c * h.oy) - 0.15;
        tx = Math.max(leftU + b.hw, Math.min(WU - b.hw, tx));   // never behind the supply box…
        if (topU) ty = Math.max(topU + Math.max(b.hw, b.hh), ty);   // …or the supply row
        ty = Math.min(groundY - Math.max(b.hw, b.hh) * Math.abs(Math.sin(b.a)) - b.hh * Math.abs(Math.cos(b.a)), ty);
        let vx = (tx - b.x) / DT * 0.35, vy = (ty - b.y) / DT * 0.35;
        const sp = Math.hypot(vx, vy); if (sp > 30) { vx *= 30 / sp; vy *= 30 / sp; }
        b.vx = vx; b.vy = vy;
        // ease back to the nearest upright angle
        const q = Math.round(b.a / (Math.PI / 2)) * (Math.PI / 2);
        b.w = (q - b.a) * 12;
      }
      if (dozer) {
        const d = dozer.body;
        d.vx = dozer.speed * dozer.dir; d.vy = 0; d.w = 0;
        if (dozer.dir > 0 && d.x > dozer.turnAt) { dozer.dir = -1; }
        if (dozer.dir < 0 && d.x < -2.5) stopDozer();
      }
      const dyn = blocks;
      for (const b of dyn) if (b.invM) { b.vy += GRAV * DT; b.vx *= 0.999; b.vy *= 0.999; b.w *= 0.985; }
      // safety net: a loose block that somehow ended up behind the supply box is nudged back out
      if (leftU) for (const b of dyn) if (b.invM && b.x < leftU + b.hw * 0.5) { b.x = leftU + b.hw + 0.02; if (b.vx < 0) b.vx = 0; }

      // contacts
      const all = dozer ? [...dyn, dozer.body] : dyn;
      const live = new Set();
      const cons = [];
      const pairs = [];
      for (let i = 0; i < all.length; i++) {
        const A = all[i];
        for (let j = i + 1; j < all.length; j++) pairs.push([A, all[j]]);
        for (const s of statics) pairs.push([s, A]);
      }
      let loudest = 0;
      for (const [A, B] of pairs) {
        if (!A.invM && !B.invM) continue;
        if (Math.abs(A.x - B.x) > A.r + B.r + 1 && A.hw < 50 && B.hw < 50) continue;
        if (Math.abs(A.y - B.y) > A.r + B.r + 1 && A.hh < 50 && B.hh < 50) continue;
        const cs = collide(A, B);
        if (!cs.length) continue;
        const key = A.id + '|' + B.id;
        live.add(key);
        const old = arbiters.get(key) || [];
        for (const c of cs) {
          c.A = A; c.B = B;
          c.rax = c.x - A.x; c.ray = c.y - A.y; c.rbx = c.x - B.x; c.rby = c.y - B.y;
          c.tx = -c.ny; c.ty = c.nx;
          const rnA = c.rax * c.ny - c.ray * c.nx, rnB = c.rbx * c.ny - c.rby * c.nx;
          c.mn = 1 / (A.invM + B.invM + A.invI * rnA * rnA + B.invI * rnB * rnB);
          const rtA = c.rax * c.ty - c.ray * c.tx, rtB = c.rbx * c.ty - c.rby * c.tx;
          c.mt = 1 / (A.invM + B.invM + A.invI * rtA * rtA + B.invI * rtB * rtB);
          c.bias = BAUM / DT * Math.max(0, c.pen - SLOP);
          const o = old.find(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < 0.12);
          c.pn = o ? o.pn : 0; c.pt = o ? o.pt : 0;
          // impact speed, for the knock sound (only for fresh contacts)
          if (!o) {
            const dvx = B.vx - B.w * c.rby - (A.vx - A.w * c.ray), dvy = B.vy + B.w * c.rbx - (A.vy + A.w * c.rax);
            const vn = -(dvx * c.nx + dvy * c.ny);
            if (vn > loudest) loudest = vn;
            if (dozer && (A === dozer.body || B === dozer.body) && !dozer.hitSaid) { dozer.hitSaid = true; t.later(() => kit.say('Bum!', { pitch: 1.3 }), 50); }
          }
          // warm start
          applyImpulse(c, c.pn * c.nx + c.pt * c.tx, c.pn * c.ny + c.pt * c.ty);
          cons.push(c);
        }
        arbiters.set(key, cs);
      }
      for (const k of [...arbiters.keys()]) if (!live.has(k)) arbiters.delete(k);
      if (loudest > 1.6) knock(loudest);

      for (let it = 0; it < ITER; it++) {
        for (const c of cons) {
          const A = c.A, B = c.B;
          let dvx = B.vx - B.w * c.rby - (A.vx - A.w * c.ray), dvy = B.vy + B.w * c.rbx - (A.vy + A.w * c.rax);
          const vn = dvx * c.nx + dvy * c.ny;
          let dpn = c.mn * (-vn + c.bias);
          const pn0 = c.pn; c.pn = Math.max(pn0 + dpn, 0); dpn = c.pn - pn0;
          applyImpulse(c, dpn * c.nx, dpn * c.ny);
          dvx = B.vx - B.w * c.rby - (A.vx - A.w * c.ray); dvy = B.vy + B.w * c.rbx - (A.vy + A.w * c.rax);
          const vt = dvx * c.tx + dvy * c.ty;
          let dpt = c.mt * -vt;
          const maxF = MU * c.pn, pt0 = c.pt;
          c.pt = Math.max(-maxF, Math.min(maxF, pt0 + dpt)); dpt = c.pt - pt0;
          applyImpulse(c, dpt * c.tx, dpt * c.ty);
        }
      }
      // integrate (held blocks and the bulldozer too: they move by their set velocity)
      let maxV = 0;
      for (const b of all) {
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 30) { b.vx *= 30 / sp; b.vy *= 30 / sp; }
        b.x += b.vx * DT; b.y += b.vy * DT; b.a += b.w * DT;
        if (b.invM) maxV = Math.max(maxV, sp, Math.abs(b.w) * b.r);
        // anything that escapes somehow comes back from the sky
        // (not the bulldozer: it leaves on the left, and teleporting it kept it driving forever)
        if (b !== dozer?.body && (b.y > HU + 3 || b.x < -3 || b.x > WU + 3)) { b.x = WU / 2; b.y = -2; b.vx = b.vy = b.w = 0; }
      }
      return maxV;
    }
    function applyImpulse(c, px, py) {
      const A = c.A, B = c.B;
      A.vx -= px * A.invM; A.vy -= py * A.invM; A.w -= A.invI * (c.rax * py - c.ray * px);
      B.vx += px * B.invM; B.vy += py * B.invM; B.w += B.invI * (c.rbx * py - c.rby * px);
    }

    let lastKnock = 0;
    function knock(v) {
      const now = performance.now();
      if (now - lastKnock < 45) return;
      lastKnock = now;
      const vol = Math.min(0.3, 0.05 + v * 0.025);
      const f = kit.rand(300, 620);
      kit.tone(f, { dur: 0.09, type: 'triangle', vol, slide: f * 0.7, attack: 0.002 });
      kit.noise({ dur: 0.05, vol: vol * 0.8, freq: 1400, q: 0.8 });
      if (v > 7) kit.noise({ dur: 0.25, vol: 0.2, freq: 500, q: 0.5, sweep: 150 });
    }

    // when everything has settled after a drop, celebrate new tower heights
    function checkHeight() {
      let top = Infinity;
      for (const b of blocks) {
        if (b.held) continue;
        const v = verts(b);
        const lowest = Math.max(...v.map(p => p[1]));
        if (groundY - lowest > 0.3) top = Math.min(top, Math.min(...v.map(p => p[1])));
      }
      if (top === Infinity) return;
      const h = groundY - top;
      if (h >= 2.5 && h > record + 0.8) {
        const big = Math.floor(h / 2) > Math.floor(record / 2);
        record = h;
        const tb = blocks.reduce((m, b) => (b.y < m.y ? b : m), blocks[0]);
        kit.burst(tb.x * S, top * S, 50, 0.9);
        kit.sfx.chime();
        if (big) t.later(() => kit.say(h > 7 ? 'Helt op til himlen!' : kit.pick(['Sikke et højt tårn!', 'Flot tårn!', 'Højere og højere!']), { pitch: 1.25 }), 300);
      }
    }

    /* ---------- drawing ---------- */
    const clouds = [0, 1, 2, 3].map(() => ({ x: Math.random(), y: kit.rand(0.06, 0.4), s: kit.rand(0.7, 1.3), v: kit.rand(0.004, 0.01) }));
    function rr(x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }
    function drawBlock(b, now) {
      const grow = b.scale < 1 ? (b.scale = Math.min(1, b.scale + 0.12)) : 1;
      const w = b.hw * 2 * S, h = b.hh * 2 * S, lw = Math.max(3, S * 0.07);
      g.save();
      g.translate(b.x * S, b.y * S); g.rotate(b.a); g.scale(grow, grow);
      if (b.held) { g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = S * 0.3; g.shadowOffsetY = S * 0.15; }
      rr(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.18);
      g.fillStyle = b.color; g.fill();
      g.shadowColor = 'transparent';
      // soft top highlight
      g.save(); g.clip();
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-w / 2, -h / 2, w, h * 0.3);
      g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-w / 2, h / 2 - h * 0.18, w, h * 0.18);
      g.restore();
      g.lineWidth = lw; g.strokeStyle = INK; g.stroke();
      const m = Math.min(w, h);
      g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round';
      const d = b.type.deco;
      if (d === 'face') {
        const blink = (now + b.id * 977) % 4200 < 140;
        for (const sx of [-1, 1]) {
          if (blink) { g.lineWidth = lw * 0.8; g.beginPath(); g.moveTo(sx * m * 0.18 - m * 0.06, -m * 0.08); g.lineTo(sx * m * 0.18 + m * 0.06, -m * 0.08); g.stroke(); }
          else { g.beginPath(); g.arc(sx * m * 0.18, -m * 0.08, m * 0.07, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(sx * m * 0.18 + m * 0.02, -m * 0.1, m * 0.025, 0, 7); g.fill(); g.fillStyle = INK; }
        }
        const fall = Math.hypot(b.vx, b.vy) > 4 || b.held;
        g.lineWidth = lw * 0.8;
        g.beginPath();
        if (fall) { g.fillStyle = '#a8324a'; g.ellipse(0, m * 0.16, m * 0.08, m * 0.1, 0, 0, 7); g.fill(); g.stroke(); }
        else { g.arc(0, m * 0.08, m * 0.14, 0.2, Math.PI - 0.2); g.stroke(); }
        g.fillStyle = 'rgba(255,143,171,.6)';
        for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * m * 0.32, m * 0.1, m * 0.07, 0, 7); g.fill(); }
      } else if (d === 'stripes') {
        g.lineWidth = lw * 0.9; g.strokeStyle = 'rgba(255,255,255,.75)';
        for (let x = -w / 2 + m * 0.7; x < w / 2 - m * 0.3; x += m * 0.8) { g.beginPath(); g.moveTo(x, -h * 0.25); g.lineTo(x + m * 0.3, h * 0.25); g.stroke(); }
      } else if (d === 'dots') {
        g.fillStyle = 'rgba(255,255,255,.8)';
        for (let y = -h / 2 + w * 0.5; y < h / 2 - w * 0.3; y += w * 0.75) { g.beginPath(); g.arc(0, y, w * 0.15, 0, 7); g.fill(); }
      } else if (d === 'star') {
        g.fillStyle = '#fff6b0'; g.lineWidth = lw * 0.7;
        g.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? m * 0.14 : m * 0.32, an = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
        g.closePath(); g.fill(); g.stroke();
      } else if (d === 'heart') {
        g.fillStyle = '#fff'; const k = m * 0.022;
        g.beginPath(); g.moveTo(0, 7 * k);
        g.bezierCurveTo(-12 * k, -1 * k, -6 * k, -11 * k, 0, -4 * k); g.bezierCurveTo(6 * k, -11 * k, 12 * k, -1 * k, 0, 7 * k);
        g.fill();
      }
      g.restore();
    }
    function drawDozer(d) {
      const b = d.body, x = b.x * S, y = b.y * S, w = b.hw * 2 * S, h = b.hh * 2 * S, lw = Math.max(3, S * 0.07);
      g.save(); g.translate(x, y);
      if (d.dir < 0) g.scale(-1, 1);
      const bob = Math.sin(performance.now() / 60) * S * 0.02;
      g.translate(0, bob);
      g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round';
      // tracks
      rr(-w / 2, h * 0.1, w * 0.8, h * 0.4, h * 0.2); g.fillStyle = '#5b5b6e'; g.fill(); g.stroke();
      g.fillStyle = '#9a9ab0';
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-w / 2 + h * 0.2 + i * (w * 0.8 - h * 0.4) / 3, h * 0.3, h * 0.11, 0, 7); g.fill(); g.stroke(); }
      // body + cab
      rr(-w * 0.45, -h * 0.2, w * 0.72, h * 0.34, h * 0.08); g.fillStyle = '#ffc400'; g.fill(); g.stroke();
      rr(-w * 0.4, -h * 0.75, w * 0.4, h * 0.58, h * 0.1); g.fillStyle = '#ffc400'; g.fill(); g.stroke();
      rr(-w * 0.34, -h * 0.66, w * 0.28, h * 0.3, h * 0.06); g.fillStyle = '#bfe6ff'; g.fill(); g.stroke();
      // face in the window
      g.fillStyle = INK;
      for (const sx of [-1, 1]) { g.beginPath(); g.arc(-w * 0.2 + sx * w * 0.06, -h * 0.53, h * 0.045, 0, 7); g.fill(); }
      g.lineWidth = lw * 0.7; g.beginPath(); g.arc(-w * 0.2, -h * 0.5, h * 0.07, 0.3, Math.PI - 0.3); g.stroke();
      // exhaust pipe + puff
      g.lineWidth = lw; g.fillStyle = '#5b5b6e'; rr(w * 0.1, -h * 0.55, w * 0.06, h * 0.38, 3); g.fill(); g.stroke();
      // arm + blade
      g.beginPath(); g.moveTo(w * 0.22, -h * 0.05); g.lineTo(w * 0.42, h * 0.02); g.lineWidth = lw * 2.2; g.stroke();
      g.lineWidth = lw * 1.2; g.strokeStyle = '#ffc400'; g.stroke(); g.strokeStyle = INK; g.lineWidth = lw;
      g.beginPath(); g.moveTo(w * 0.4, -h * 0.4); g.quadraticCurveTo(w * 0.58, h * 0.05, w * 0.42, h * 0.5); g.lineTo(w * 0.52, h * 0.5);
      g.quadraticCurveTo(w * 0.62, 0, w * 0.5, -h * 0.4); g.closePath(); g.fillStyle = '#9a9ab0'; g.fill(); g.stroke();
      g.restore();
      // exhaust smoke
      if (Math.random() < 0.3) puffs.push({ x: x + (d.dir > 0 ? 0.13 : -0.13) * w, y: y - h * 0.55, r: S * 0.1, life: 1 });
    }
    const puffs = [];

    function draw(now) {
      g.clearRect(0, 0, W, H);
      // clouds
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (const c of clouds) {
        c.x += c.v / 60; if (c.x > 1.2) c.x = -0.2;
        const cx = c.x * W, cy = c.y * H, r = S * 0.45 * c.s;
        g.beginPath(); g.arc(cx, cy, r, 0, 7); g.arc(cx + r, cy + r * 0.2, r * 0.8, 0, 7); g.arc(cx - r, cy + r * 0.25, r * 0.7, 0, 7); g.fill();
      }
      // grass
      const gy = groundY * S;
      g.fillStyle = '#7cc66b'; g.fillRect(0, gy, W, H - gy);
      g.fillStyle = '#9bd28a'; g.fillRect(0, gy, W, S * 0.18);
      g.strokeStyle = 'rgba(74,59,92,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke();
      // shadows under blocks near the ground
      for (const b of blocks) {
        const d = groundY - b.y;
        if (d < 4) { g.fillStyle = `rgba(0,0,0,${0.12 * (1 - d / 4)})`; g.beginPath(); g.ellipse(b.x * S, gy + 3, b.hw * S * 1.1, S * 0.09, 0, 0, 7); g.fill(); }
      }
      for (const p of puffs) { p.y -= 0.6; p.r += 0.4; p.life -= 0.02; g.fillStyle = `rgba(120,120,130,${p.life * 0.4})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); }
      for (let i = puffs.length - 1; i >= 0; i--) if (puffs[i].life <= 0) puffs.splice(i, 1);
      for (const b of blocks) if (!b.held) drawBlock(b, now);
      if (dozer) drawDozer(dozer);
      for (const b of blocks) if (b.held) drawBlock(b, now);
    }

    let raf = 0, last = performance.now(), acc = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      if (held.size || dozer) wake();
      if (awake) {
        let maxV = 0;
        while (acc >= DT) { maxV = Math.max(maxV, step()); acc -= DT; }
        // the whole scene sleeps once everything has been still for a moment
        if (maxV < 0.12 && !held.size && !dozer) {
          stillFor += 1 / 60;
          if (stillFor > 0.5) {
            awake = false;
            blocks.forEach(b => { b.vx = b.vy = b.w = 0; });
            if (settleCheck) { settleCheck = false; checkHeight(); }
          }
        } else stillFor = 0;
      } else acc = 0;
      draw(now);
    }

    layout();
    const offResize = kit.onResize(root, layout);
    // a few blocks to start with, so there is something to knock over straight away
    const startX = WU * (portrait ? 0.5 : 0.55);
    [[0, 0], [0, 1], [1, 2]].forEach(([ti, row], i) => {
      const ty = TYPES[ti];
      addBlock(ty, startX, groundY - 0.6 - row * 1.2 - (ti === 1 ? 0.3 : 0), PALETTE[(i * 2 + 1) % PALETTE.length]).scale = 1;
    });
    settleCheck = false;
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', release);
      removeEventListener('pointercancel', release);
      t.clear();
      offResize();
      if (dozer) dozer.sound.stop(0.05);
    };
  },
};
