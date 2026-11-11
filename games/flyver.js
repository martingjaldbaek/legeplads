/* Papirflyver: fold a paper plane, then throw it over the countryside.
 *
 * Folding: pick a sheet (colours and patterns along the top), then six folds. Each fold shows a dashed
 * crease, an arrow and a pointing hand, and the flap teases up now and then. Tap anywhere to fold, or drag:
 * the flap follows the finger and finishes by itself on release. The sheet is a real little fold engine
 * (polygon layers clipped and reflected across each crease), so the plane that flies is the one you folded.
 *
 * Throwing: flick the plane (direction and speed count: a hard upward flick loops) or just tap for a nice
 * throw. It glides with simple glider physics past stars (collect), balloons (pop) and birds (flee).
 * Tap during the flight for a gust of wind. It lands, then flies back to your hand. Folded planes wait in
 * the hangar (top right); 📄 folds a new one.
 */

const PAPERS = [
  { c: '#ff3b6b', k: 'dots' }, { c: '#3a86ff', k: 'stripes' }, { c: '#ffc400', k: 'stars' },
  { c: '#06d6a0', k: 'checks' }, { c: '#8338ec', k: 'hearts' }, { c: '#ff8a00', k: 'zigzag' },
  { c: '#00a6fb', k: 'plain' }, { c: '#f15bb5', k: 'rainbow' }, { c: '#e85d04', k: 'stars' },
  { c: '#2ec4b6', k: 'dots' },
];
const RAINBOW = ['#ff3b6b', '#ff8a00', '#ffc400', '#06d6a0', '#3a86ff', '#8338ec'];
const PILOTS = ['🐻', '🐱', '🐶', '🐰', '🐸', '🐵', '🐷', '🐥', '🦊', '🐼'];
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

// The sheet is 200×280 paper units, nose up, x from -100 to 100. Each fold: crease a→b, and a point p on
// the side that folds over. `tag` marks the folded layers; `only` folds just the layers with that tag.
const T22 = 100 / Math.tan(Math.PI / 8);   // 241.4: edge-to-centre fold at 22.5°
const STEPS = [
  { a: [0, 0], b: [-100, 100], p: [-78, 14] },
  { a: [0, 0], b: [100, 100], p: [78, 14] },
  { a: [0, 0], b: [-100, T22], p: [-88, 150] },
  { a: [0, 0], b: [100, T22], p: [88, 150] },
  { a: [0, 0], b: [0, 280], p: [-55, 210], tag: 'L' },
  { a: [0, 0], b: [35, 280], p: [72, 236], only: 'L' },
];
const AXIS = { n: [0, 0], t: [35, 280] };   // the finished plane's centre line, nose → tail

const CSS = `
.fly-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.fly-top { position:absolute; top:12px; right:12px; display:flex; gap:8px; align-items:center; z-index:3; }
.fly-top button { border:0; padding:0; background:rgba(255,255,255,.85); border-radius:18px;
  box-shadow:0 4px 0 rgba(0,0,0,.12); display:grid; place-items:center; }
.fly-top .hang { width:64px; height:64px; }
.fly-top .hang canvas { width:56px; height:56px; }
.fly-top .hang.pop { animation: fly-pop .4s ease; }
.fly-top .new { width:76px; height:76px; font-size:44px; }
.fly-top .new.glow { animation: fly-glow 1.2s ease-in-out infinite alternate; }
@keyframes fly-glow { from { box-shadow:0 4px 0 rgba(0,0,0,.12) } to { box-shadow:0 0 0 8px rgba(255,255,255,.7), 0 4px 0 rgba(0,0,0,.12); transform:scale(1.08) } }
@keyframes fly-pop { 0% { transform:scale(.3) } 70% { transform:scale(1.15) } 100% { transform:none } }
.fly-top.hide { opacity:0; pointer-events:none; }
.fly-fold { position:absolute; inset:0; z-index:2; background:rgba(255,255,255,.45); transition:opacity .5s; }
.fly-fold.hide { opacity:0; pointer-events:none; }
.fly-pick { position:absolute; top:12px; left:104px; right:12px; display:flex; justify-content:center; gap:8px; z-index:1; }
.fly-pick button { flex:1 1 0; max-width:84px; aspect-ratio:3/4; border:3px solid #4a3b5c; border-radius:8px;
  padding:0; background-size:24px 24px; box-shadow:0 4px 0 rgba(0,0,0,.15); transition:transform .15s; }
.fly-pick button.on { transform:translateY(6px) scale(1.06); box-shadow:0 0 0 5px #ffd60a; }
`;

/* ---------- small helpers ---------- */
function mix(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function rng(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function starPath(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = i * Math.PI / 5 - Math.PI / 2;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}

/** A 48×48 (rainbow: 48×72) repeating tile for one side of a sheet. */
function makeTile(kind, bg, ink, pale) {
  const c = document.createElement('canvas');
  c.width = 48; c.height = kind === 'rainbow' ? 72 : 48;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = ink; x.strokeStyle = ink;
  if (kind === 'dots') { for (const [a, b] of [[12, 12], [36, 36]]) { x.beginPath(); x.arc(a, b, 6, 0, 6.29); x.fill(); } }
  else if (kind === 'stripes') x.fillRect(0, 0, 16, 48);
  else if (kind === 'checks') { x.globalAlpha = 0.55; x.fillRect(0, 0, 24, 24); x.fillRect(24, 24, 24, 24); }
  else if (kind === 'stars') { starPath(x, 14, 14, 9); x.fill(); starPath(x, 37, 35, 6); x.fill(); }
  else if (kind === 'hearts') {
    x.beginPath(); x.moveTo(24, 36);
    x.bezierCurveTo(4, 22, 12, 8, 24, 18); x.bezierCurveTo(36, 8, 44, 22, 24, 36); x.fill();
  } else if (kind === 'zigzag') {
    x.lineWidth = 6; x.lineJoin = 'round'; x.beginPath();
    for (const [a, b] of [[-2, 30], [12, 18], [24, 30], [36, 18], [50, 30]]) x.lineTo(a, b);
    x.stroke();
  } else if (kind === 'rainbow') {
    RAINBOW.forEach((col, i) => { x.fillStyle = pale ? mix(col, '#ffffff', 0.65) : col; x.fillRect(0, i * 12, 48, 12); });
  }
  return c;
}
function makePaper(p) {
  return {
    c: p.c,
    front: makeTile(p.k, p.c, mix(p.c, '#ffffff', 0.75)),
    back: makeTile(p.k, mix(p.c, '#ffffff', 0.72), mix(p.c, '#ffffff', 0.4), true),
  };
}

/* ---------- fold engine ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
function lineInfo(step) {
  const d = sub(step.b, step.a), L = Math.hypot(d[0], d[1]);
  let n = [-d[1] / L, d[0] / L];   // unit normal
  const s = (step.p[0] - step.a[0]) * n[0] + (step.p[1] - step.a[1]) * n[1];
  if (s < 0) n = [-n[0], -n[1]];    // point it at the flap side
  return { n, dist: q => (q[0] - step.a[0]) * n[0] + (q[1] - step.a[1]) * n[1] };
}
/** Affine squash across the crease: k = 1 flat, 0 edge-on, -1 folded over (a reflection). */
function foldMatrix(step, k) {
  const { n } = lineInfo(step), m = 1 - k, na = step.a[0] * n[0] + step.a[1] * n[1];
  return new DOMMatrix([1 - m * n[0] * n[0], -m * n[0] * n[1], -m * n[0] * n[1], 1 - m * n[1] * n[1], m * na * n[0], m * na * n[1]]);
}
const apply = (M, pts) => pts.map(([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]);
function clip(pts, f) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const P = pts[i], Q = pts[(i + 1) % pts.length], fp = f(P), fq = f(Q);
    if (fp >= 0) out.push(P);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
  }
  let area = 0;
  for (let i = 0; i < out.length; i++) { const P = out[i], Q = out[(i + 1) % out.length]; area += P[0] * Q[1] - Q[0] * P[1]; }
  return out.length >= 3 && Math.abs(area) > 2 ? out : null;
}
const freshSheet = () => [{ pts: [[-100, 0], [100, 0], [100, 280], [-100, 280]], M: new DOMMatrix(), front: false, tag: '' }];
/** Split the layers for a step into the ones that stay and the flaps that fold. */
function splitFor(layers, step) {
  const { dist } = lineInfo(step), keep = [], flaps = [];
  for (const L of layers) {
    if (step.only && L.tag !== step.only) { keep.push(L); continue; }
    const stay = clip(L.pts, q => -dist(q)), go = clip(L.pts, q => dist(q));
    if (stay) keep.push({ ...L, pts: stay });
    if (go) flaps.push({ ...L, pts: go });
  }
  return { keep, flaps };
}
/** The layers drawn at fold progress t (0…1). */
function foldedAt(split, step, t) {
  const k = Math.cos(Math.PI * t), F = foldMatrix(step, k);
  const moved = split.flaps.map(L => ({ ...L, pts: apply(F, L.pts), M: F.multiply(L.M), front: k < 0 ? !L.front : L.front, shade: 1 - Math.abs(k), flap: true }));
  return split.keep.concat(k < 0 ? moved.reverse() : moved);
}
function commit(split, step) {
  return foldedAt(split, step, 1).map(L => ({ ...L, shade: 0, flap: false, tag: (L.flap && step.tag) || L.tag }));
}

/* Pattern objects are made per drawing context. */
const patCache = new WeakMap();
function pattern(ctx, tile) {
  let m = patCache.get(ctx);
  if (!m) patCache.set(ctx, m = new Map());
  if (!m.has(tile)) m.set(tile, ctx.createPattern(tile, 'repeat'));
  return m.get(tile);
}
/** Draw layers in the context's current (paper-unit) transform. px = screen px per paper unit. */
function drawLayers(ctx, layers, paper, px) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, 2.6 / px);
  ctx.strokeStyle = '#4a3b5c';
  for (const L of layers) {
    ctx.beginPath();
    L.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    const pat = pattern(ctx, L.front ? paper.front : paper.back);
    pat.setTransform(L.M);
    ctx.fillStyle = pat;
    ctx.fill();
    if (L.shade) { ctx.fillStyle = `rgba(40,20,60,${0.3 * L.shade})`; ctx.fill(); }
    ctx.stroke();
  }
}

export default {
  id: 'flyver',
  title: 'Papirflyver',
  icon: '✈️',
  color: '#3a86ff',
  edge: '#5fb544',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    root.style.background = '#5fb544';

    /* ---------- DOM ---------- */
    const cv = document.createElement('canvas');
    cv.className = 'fly-cv';
    const top = document.createElement('div');
    top.className = 'fly-top';
    const newBtn = document.createElement('button');
    newBtn.className = 'new';
    newBtn.textContent = '📄';
    top.appendChild(newBtn);
    const foldEl = document.createElement('div');
    foldEl.className = 'fly-fold';
    const fcv = document.createElement('canvas');
    fcv.className = 'fly-cv';
    const pick = document.createElement('div');
    pick.className = 'fly-pick';
    foldEl.append(fcv, pick);
    root.append(cv, top, foldEl);
    const cx = cv.getContext('2d'), fx = fcv.getContext('2d');

    const papers = PAPERS.map(makePaper);
    const pickBtns = papers.map((p, i) => {
      const b = document.createElement('button');
      b.style.backgroundImage = `url(${p.front.toDataURL()})`;
      b.style.backgroundColor = p.c;
      b.addEventListener('pointerdown', e => { e.stopPropagation(); choosePaper(i); });
      pick.appendChild(b);
      return b;
    });

    let W = 0, H = 0, U = 1;
    function resize() {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = root.clientWidth; H = root.clientHeight; U = Math.min(W, H) / 100;
      for (const [c, x] of [[cv, cx], [fcv, fx]]) { c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); }
    }
    resize();
    const offResize = kit.onResize(root, resize);

    /* ================= FOLDING ================= */
    let paperIdx = 0, layers = freshSheet(), step = 0, split = null;
    let fold = null;           // { t, anim, id, sx, sy, t0 } while a fold is under way
    let folding = true, idleAt = performance.now(), finished = false;
    let view = { ox: 0, sc: 1, cy: 0 }, viewOx = 0, hop = 0;

    function choosePaper(i) {
      paperIdx = i;
      pickBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      layers = freshSheet(); step = 0; split = null; fold = null; finished = false; viewOx = 0;
      kit.sfx.rustle();
      kit.tone(kit.scaleHz(i % 8), { dur: 0.15, type: 'triangle', vol: 0.12 });
      idleAt = performance.now();
    }
    function openFold() {
      folding = true;
      foldEl.classList.remove('hide');
      top.classList.add('hide');
      newBtn.classList.remove('glow');
      choosePaper(Math.floor(Math.random() * papers.length));
    }

    function foldLayout() {
      const pickH = Math.min(120, Math.max(80, W / 12 * 4 / 3)) + 24;
      const avH = H - pickH - 40, avW = W - 40;
      view.sc = Math.min(avH / 300, avW / 300);
      view.cy = pickH + 20 + avH / 2;
      return pickH;
    }
    const toPaper = (sx, sy) => [(sx - W / 2) / view.sc - view.ox, (sy - view.cy) / view.sc + 140];

    function beginFold(e) {
      if (step >= STEPS.length || finished) return;
      if (fold) { fold.anim = true; fold.id = null; return; }   // a new touch finishes the fold under way
      split = splitFor(layers, STEPS[step]);
      fold = { t: 0, anim: false, id: e.pointerId, sx: e.clientX, sy: e.clientY, t0: performance.now(), moved: false };
      kit.sfx.rustle();
    }
    fcv.addEventListener('pointerdown', e => { e.preventDefault(); kit.audio(); beginFold(e); });
    fcv.addEventListener('pointermove', e => {
      if (!fold || fold.id !== e.pointerId || fold.anim) return;
      const st = STEPS[step], { n, dist } = lineInfo(st);
      const span = 2 * dist(st.p) * view.sc;   // screen px from the flap point to where it lands
      const dx = e.clientX - fold.sx, dy = e.clientY - fold.sy;
      const prog = -(dx * n[0] + dy * n[1]) / span;
      if (Math.hypot(dx, dy) > 12) fold.moved = true;
      fold.t = Math.max(0, Math.min(0.97, prog));
    });
    const foldUp = e => { if (fold && fold.id === e.pointerId) { fold.anim = true; fold.id = null; } };
    fcv.addEventListener('pointerup', foldUp);
    fcv.addEventListener('pointercancel', foldUp);

    function foldDone() {
      const st = STEPS[step];
      layers = commit(split, st);
      split = null; fold = null; step++;
      idleAt = performance.now();
      kit.noise({ dur: 0.05, vol: 0.12, freq: 3200 });
      kit.tone(kit.scaleHz(step * 2), { dur: 0.25, type: 'triangle', vol: 0.15 });
      hop = 1;
      if (step === STEPS.length) planeReady();
    }

    function planeReady() {
      finished = true;
      t.later(() => { kit.sfx.chime(); kit.burst(W / 2, view.cy, 40, 0.8); kit.say('En flyver!'); hop = 1.4; }, 300);
      t.later(() => {
        const p = { paper: papers[paperIdx], layers, pilot: kit.pick(PILOTS) };
        if (plane) parkPlane(plane);
        plane = p;
        toHand();
        folding = false;
        foldEl.classList.add('hide');
        top.classList.remove('hide');
        kit.sfx.fwip();
      }, 1700);
    }

    function drawFold(now) {
      const pickH = foldLayout();
      fx.clearRect(0, 0, W, H);
      // shown layers
      let shown = layers;
      if (fold) {
        if (fold.anim) { fold.t = Math.min(1, fold.t + 0.032 + (1 - fold.t) * 0.06); }
        shown = foldedAt(split, STEPS[step], fold.t);
      } else if (step < STEPS.length && !finished && now - idleAt > 900) {
        // tease: the next flap lifts a little now and then
        const ph = ((now - idleAt) / 1000) % 2.6, lift = ph < 0.8 ? Math.sin(ph / 0.8 * Math.PI) * 0.16 : 0;
        if (lift > 0) shown = foldedAt(splitFor(layers, STEPS[step]), STEPS[step], lift);
      }
      // centre on the paper as it gets narrower
      let minX = 1e9, maxX = -1e9;
      for (const L of layers) for (const [x] of L.pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
      viewOx = -(minX + maxX) / 2;
      view.ox += (viewOx - view.ox) * 0.12;
      hop = Math.max(0, hop - 0.06);
      const sc = view.sc * (1 + 0.06 * Math.sin(hop * Math.PI));
      fx.save();
      fx.translate(W / 2, view.cy);
      fx.scale(sc, sc);
      fx.translate(view.ox, -140);
      fx.save();
      fx.translate(5, 7);
      fx.fillStyle = 'rgba(40,30,60,.18)';
      for (const L of shown) { fx.beginPath(); L.pts.forEach(([x, y], i) => (i ? fx.lineTo(x, y) : fx.moveTo(x, y))); fx.fill(); }
      fx.restore();
      drawLayers(fx, shown, papers[paperIdx], sc);
      if (step < STEPS.length && !finished && !(fold && fold.t > 0.05)) drawHint(STEPS[step], now, sc);
      fx.restore();
      if (fold && fold.t >= 1) foldDone();
      // progress dots
      const n = STEPS.length, r = 9, gap = 30, x0 = W / 2 - (n - 1) * gap / 2, y = pickH + 6;
      for (let i = 0; i < n; i++) {
        fx.beginPath(); fx.arc(x0 + i * gap, y, r, 0, 6.29);
        fx.fillStyle = i < step ? '#ffd60a' : 'rgba(255,255,255,.8)'; fx.fill();
        fx.lineWidth = 2.5; fx.strokeStyle = '#4a3b5c'; fx.stroke();
      }
    }

    function drawHint(st, now, sc) {
      const { n, dist } = lineInfo(st), P = st.p, d = dist(P), Q = [P[0] - 2 * d * n[0], P[1] - 2 * d * n[1]];
      const lw = 1 / sc;
      // crease
      const L = sub(st.b, st.a);
      fx.setLineDash([10 * lw, 8 * lw]);
      fx.lineWidth = 3 * lw; fx.strokeStyle = 'rgba(255,255,255,.95)';
      fx.beginPath(); fx.moveTo(st.a[0] - L[0] * 0.04, st.a[1] - L[1] * 0.04); fx.lineTo(st.b[0] + L[0] * 0.04, st.b[1] + L[1] * 0.04); fx.stroke();
      fx.setLineDash([]);
      // curved arrow from the flap to where it lands
      const mid = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], perp = [-(Q[1] - P[1]) * 0.35, (Q[0] - P[0]) * 0.35];
      const C = mid[1] + perp[1] < mid[1] ? [mid[0] + perp[0], mid[1] + perp[1]] : [mid[0] - perp[0], mid[1] - perp[1]];
      const pulse = 0.6 + 0.4 * Math.sin(now / 220);
      for (const [w, col] of [[11, '#4a3b5c'], [6, `rgba(255,214,10,${pulse})`]]) {
        fx.lineWidth = w * lw; fx.strokeStyle = col; fx.lineCap = 'round';
        fx.beginPath(); fx.moveTo(P[0], P[1]); fx.quadraticCurveTo(C[0], C[1], Q[0], Q[1]); fx.stroke();
        const ang = Math.atan2(Q[1] - C[1], Q[0] - C[0]), h = 18 * lw;
        fx.beginPath();
        fx.moveTo(Q[0] + Math.cos(ang + 2.5) * h, Q[1] + Math.sin(ang + 2.5) * h);
        fx.lineTo(Q[0], Q[1]);
        fx.lineTo(Q[0] + Math.cos(ang - 2.5) * h, Q[1] + Math.sin(ang - 2.5) * h);
        fx.stroke();
      }
      // a hand that shows the move
      const ph = ((now / 1000) % 1.8) / 1.4;
      if (ph <= 1) {
        const e = ph < 0.5 ? 2 * ph * ph : 1 - 2 * (1 - ph) * (1 - ph), u = 1 - e;
        const hx = u * u * P[0] + 2 * u * e * C[0] + e * e * Q[0], hy = u * u * P[1] + 2 * u * e * C[1] + e * e * Q[1];
        fx.save();
        fx.translate(hx, hy); fx.scale(lw, lw);
        fx.globalAlpha = Math.min(1, Math.sin(ph * Math.PI) * 3);
        fx.font = `54px ${EMOJI_FONT}`; fx.fillStyle = '#000'; fx.textAlign = 'center'; fx.textBaseline = 'top';
        fx.fillText('👆', 6, -4);
        fx.restore();
      }
    }

    /* ================= FLYING ================= */
    let plane = null, hangar = [];
    const G = 120, S0 = 50, DRAG = 0.4;   // U/s², trim speed U/s, drag 1/s
    const HAND = { x: 0, a: 30 }, REST = 2.6;   // REST: altitude of the plane's middle when it lies on the grass
    const P = { st: 'none', x: 0, a: 30, s: 0, th: 0, tt: 0, wob: 0, trail: [] };
    let camX = -30, camA = 0, grab = null, idleThrow = 0, hits = new Map(), starN = 0, flightT = 0, lastGust = 0;
    let lastWhoosh = 0, loops = 0, thPrev = 0, ret = null;

    function toHand() {
      Object.assign(P, { st: 'hand', x: HAND.x, a: HAND.a, s: 0, th: 0.15, trail: [] });
      idleThrow = performance.now();
    }

    function parkPlane(p) {
      hangar.unshift(p);
      if (hangar.length > 5) hangar.pop();
      renderHangar();
    }
    function renderHangar() {
      top.querySelectorAll('.hang').forEach(b => b.remove());
      hangar.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'hang';
        const c = document.createElement('canvas');
        c.width = c.height = 112;
        const x = c.getContext('2d');
        x.scale(2, 2);
        drawPlaneAt(x, p, 28, 30, -0.3, 50, 1, false);
        b.appendChild(c);
        b.addEventListener('pointerdown', e => {
          e.stopPropagation();
          if (folding) return;
          hangar.splice(i, 1);
          if (plane) hangar.unshift(plane);
          plane = p;
          renderHangar();
          toHand();
          kit.sfx.pickUp();
          kit.burst(e.clientX, e.clientY + 40, 14, 0.5);
        });
        top.insertBefore(b, newBtn);
      });
    }
    newBtn.addEventListener('pointerdown', e => { e.stopPropagation(); if (!folding) { kit.sfx.blip(8); openFold(); } });

    /** Draw a folded plane pointing along `ang` (screen radians, 0 = right), `len` px long. */
    function drawPlaneAt(c, p, x, y, ang, len, squash, pilot = true) {
      const N = AXIS.n, Tl = AXIS.t, ax = Math.atan2(N[1] - Tl[1], N[0] - Tl[0]);
      const span = Math.hypot(Tl[0] - N[0], Tl[1] - N[1]), sc = len / span;
      c.save();
      c.translate(x, y);
      c.rotate(ang);
      c.scale(1, squash);
      c.scale(sc, sc);
      c.rotate(-ax);
      c.translate(-(N[0] + Tl[0]) / 2, -(N[1] + Tl[1]) / 2);
      drawLayers(c, p.layers, p.paper, sc);
      c.restore();
      if (pilot) {
        c.save();
        c.translate(x, y);
        c.rotate(ang * 0.35);
        c.font = `${len * 0.36}px ${EMOJI_FONT}`;
        c.fillStyle = '#000';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(p.pilot, -len * 0.06, -len * 0.16);
        c.restore();
      }
    }

    function throwPlane(s, th) {
      P.st = 'fly'; P.s = s; P.th = th; P.trail = []; P.wob = 0;
      hits = new Map(); starN = 0; flightT = 0; loops = 0; thPrev = th;
      kit.sfx.whoosh();
      if (Math.random() < 0.4) t.later(() => kit.say(kit.pick(['Wiii!', 'Flyv!', 'Afsted!'])), 200);
    }

    cv.addEventListener('pointerdown', e => {
      e.preventDefault();
      kit.audio();
      if (folding || !plane) return;
      const now = performance.now();
      if (grab) { releaseGrab(null); return; }          // a lost finger: the new touch throws it
      if (P.st === 'hand') {
        grab = { id: e.pointerId, sx: e.clientX, sy: e.clientY, pts: [[e.clientX, e.clientY, now]], dx: 0, dy: 0 };
        kit.sfx.pickUp();
      } else if (P.st === 'fly' && now - lastGust > 250) {
        // a gust of wind
        lastGust = now;
        P.s = Math.min(140, P.s + 22);
        P.th += 0.35;
        windPuffs.push({ x: e.clientX, y: e.clientY, t: 0 });
        if (now - lastWhoosh > 400) { lastWhoosh = now; kit.noise({ dur: 0.3, vol: 0.09, freq: 700, q: 0.8, sweep: 2200 }); }
      } else if (P.st === 'landed') startReturn();
    });
    cv.addEventListener('pointermove', e => {
      if (!grab || grab.id !== e.pointerId) return;
      const now = performance.now();
      grab.pts.push([e.clientX, e.clientY, now]);
      while (grab.pts.length > 2 && now - grab.pts[0][2] > 100) grab.pts.shift();
      grab.dx = e.clientX - grab.sx; grab.dy = e.clientY - grab.sy;
    });
    const grabUp = e => { if (grab && grab.id === e.pointerId) releaseGrab(e); };
    cv.addEventListener('pointerup', grabUp);
    cv.addEventListener('pointercancel', grabUp);
    function releaseGrab(e) {
      const g = grab;
      grab = null;
      if (P.st !== 'hand') return;
      let vx = 0, vy = 0;
      if (e && g.pts.length > 1) {
        const a = g.pts[0], b = [e.clientX, e.clientY, performance.now()], dt = Math.max(16, b[2] - a[2]) / 1000;
        vx = (b[0] - a[0]) / dt; vy = (b[1] - a[1]) / dt;
      }
      const v = Math.hypot(vx, vy);
      if (v < 350 || Math.hypot(g.dx, g.dy) < 20) { throwPlane(S0 * 1.25, 0.28); return; }
      const th = Math.max(-0.5, Math.min(1.25, Math.atan2(-vy, Math.abs(vx))));
      throwPlane(Math.max(35, Math.min(135, (v / U) * 0.32)), th);
    }

    function startReturn() {
      if (P.st !== 'landed') return;
      P.st = 'return';
      ret = { x0: P.x, t: 0, dur: Math.min(2.2, 1.1 + Math.abs(P.x) / 600) };
      kit.sfx.fwip();
    }

    /* ---------- the world: endless, generated per 60-U segment ---------- */
    const GROUND = [['🌳', 15], ['🌲', 14], ['🏠', 13], ['🏡', 13], ['🌷', 5], ['🌻', 6], ['🐄', 8], ['🐑', 7],
      ['🐴', 8], ['⛪', 15], ['🚜', 8], ['🌼', 5], ['🐖', 7], ['🏰', 17], ['🌳', 13], ['🐓', 6], ['🦆', 5]];
    const SKY = [['⭐', 'star', 6], ['⭐', 'star', 6], ['⭐', 'star', 6], ['🎈', 'pop', 8], ['🎈', 'pop', 8],
      ['🐦', 'flee', 6], ['🦋', 'flee', 6], ['🛸', 'flee', 9], ['🪁', 'flee', 8], ['🐝', 'flee', 5]];
    const segs = new Map();
    function seg(i) {
      if (segs.has(i)) return segs.get(i);
      const r = rng(i * 9973 + 17), s = { ground: [], sky: [], clouds: [] };
      const ng = 1 + Math.floor(r() * 3);
      for (let j = 0; j < ng; j++) { const [e, z] = GROUND[Math.floor(r() * GROUND.length)]; s.ground.push({ e, z: z * (0.85 + r() * 0.3), x: i * 60 + r() * 60 }); }
      if (i >= 1) {
        const ns = 2 + Math.floor(r() * 2);
        for (let j = 0; j < ns; j++) {
          const [e, kind, z] = SKY[Math.floor(r() * SKY.length)];
          s.sky.push({ id: i * 10 + j, e, kind, z, x: i * 60 + r() * 60, a: 12 + r() * 60, ph: r() * 6 });
        }
      }
      s.clouds.push({ x: i * 60 + r() * 60, a: 45 + r() * 50, z: 0.7 + r() * 0.7 });
      if (segs.size > 400) segs.clear();
      segs.set(i, s);
      return s;
    }
    const windPuffs = [];

    function hitItem(it, sx, sy) {
      hits.set(it.id, flightT);
      if (it.kind === 'star') {
        starN++;
        kit.sfx.xylo(kit.scaleHz(Math.min(14, 4 + starN)));
        kit.burst(sx, sy, 14, 0.5);
        if (starN % 5 === 0) t.later(() => kit.sfx.giggle(), 250);
      } else if (it.kind === 'pop') {
        kit.sfx.pop(kit.rand(3, 9) | 0);
        kit.burst(sx, sy, 30, 0.8);
      } else {
        kit.sfx.squeak(); t.later(() => kit.sfx.squeak(), 110);
      }
    }

    function land() {
      P.st = 'landed';
      const far = P.x > 330;
      t.later(() => {
        const sx = (P.x - camX) * U, sy = groundY() + camA * U;
        if (far) { kit.sfx.fanfare(); kit.bigBurst(); kit.say('Sikke langt!'); }
        else { kit.sfx.chime(); kit.burst(sx, sy - 4 * U, 40, 0.9); if (Math.random() < 0.6) kit.say(kit.pick(['Flot!', 'Hurra!', 'Godt kastet!'])); }
      }, 250);
      t.later(startReturn, far ? 2600 : 1800);
    }

    const groundY = () => H - 16 * U;

    function updatePlane(dt, now) {
      if (P.st === 'fly') {
        flightT += dt;
        const s = Math.max(8, P.s);
        P.s += (-G * Math.sin(P.th) - DRAG * P.s) * dt;
        P.th += ((G / (S0 * S0)) * s * s - G * Math.cos(P.th)) / s * dt;
        if (flightT > 25) P.th = Math.min(P.th, -0.3);   // a safety net: come down eventually
        P.x += Math.cos(P.th) * P.s * dt;
        P.a += Math.sin(P.th) * P.s * dt;
        P.wob += dt * 3;
        // a loop the loop
        if (Math.floor((thPrev - Math.PI / 2) / (2 * Math.PI)) !== Math.floor((P.th - Math.PI / 2) / (2 * Math.PI)) && P.th > thPrev) {
          loops++;
          kit.sfx.whoosh();
          if (loops === 1) t.later(() => kit.say('Rundt!'), 150);
        }
        thPrev = P.th;
        P.trail.push([P.x, P.a]);
        if (P.trail.length > 90) P.trail.shift();
        if (P.a <= REST) {
          P.a = REST; P.st = 'slide';
          P.th = Math.atan2(Math.sin(P.th), Math.cos(P.th));
          kit.sfx.plop(); t.later(() => kit.sfx.rustle(), 120);
        }
      } else if (P.st === 'slide') {
        P.s = Math.max(0, P.s - 70 * dt);
        P.th += (0 - P.th) * Math.min(1, dt * 10);
        P.x += P.s * dt;
        if (P.s <= 0) land();
      } else if (P.st === 'return') {
        ret.t += dt / ret.dur;
        const e = Math.min(1, ret.t), k = e < 0.5 ? 2 * e * e : 1 - 2 * (1 - e) * (1 - e);
        P.x = ret.x0 + (HAND.x - ret.x0) * k;
        P.a = REST + (HAND.a - REST) * k + 30 * Math.sin(Math.PI * e);
        P.th = Math.PI - 0.2 * Math.cos(Math.PI * e);
        if (e >= 1) toHand();
      } else if (P.st === 'hand') {
        P.th = 0.15 + Math.sin(now / 400) * 0.05;
      }
    }

    function drawWorld(now, dt) {
      const gy = groundY(), Wu = W / U;
      // camera
      let tx = -Wu * 0.22, ta = 0;
      if (P.st === 'fly' || P.st === 'slide' || P.st === 'landed') { tx = P.x - Wu * 0.35; ta = Math.max(0, P.a - (gy / U - 22)); }
      else if (P.st === 'return') tx = P.x - Wu * 0.5;
      const ease = P.st === 'return' ? 1 : Math.min(1, dt * 4);
      camX += (tx - camX) * ease;
      camA += (ta - camA) * Math.min(1, dt * 3);
      const SX = x => (x - camX) * U, SY = a => gy - (a - camA) * U;

      // sky
      const sky = cx.createLinearGradient(0, 0, 0, gy);
      sky.addColorStop(0, mix('#4fa8f0', '#2f7fd8', Math.min(1, camA / 80)));
      sky.addColorStop(1, '#d4efff');
      cx.fillStyle = sky; cx.fillRect(0, 0, W, H);
      cx.fillStyle = '#ffe066';
      cx.beginPath(); cx.arc(W - 22 * U, 14 * U + camA * U * 0.1, 7 * U, 0, 6.29); cx.fill();

      // clouds (half parallax)
      const cx0 = camX * 0.5;
      for (let i = Math.floor(cx0 / 60) - 1; i <= Math.floor((cx0 + Wu) / 60) + 1; i++) {
        for (const c of seg(i).clouds) {
          const sx = (c.x - cx0) * U, sy = SY(c.a) + camA * U * 0.5, s = 5 * U * c.z;
          cx.fillStyle = 'rgba(255,255,255,.9)';
          for (const [dx, dy, r] of [[0, 0, 1], [1.1, -0.3, 0.8], [-1, 0.1, 0.7], [0.4, 0.3, 0.9]]) {
            cx.beginPath(); cx.arc(sx + dx * s, sy + dy * s, r * s, 0, 6.29); cx.fill();
          }
        }
      }
      // hills
      for (const [par, col, f] of [[0.3, '#a9dc9b', x => 16 + 7 * Math.sin(x * 0.011) + 4 * Math.sin(x * 0.029 + 1)],
        [0.6, '#86cc6e', x => 7 + 4 * Math.sin(x * 0.019 + 2) + 2.5 * Math.sin(x * 0.047)]]) {
        cx.fillStyle = col;
        cx.beginPath(); cx.moveTo(0, H);
        for (let px = 0; px <= W + 10; px += 10) cx.lineTo(px, SY(f(camX * par + px / U)) );
        cx.lineTo(W, H); cx.fill();
      }
      cx.fillStyle = '#5fb544';
      cx.fillRect(0, SY(0), W, H);
      cx.fillStyle = '#54a73b';
      cx.fillRect(0, SY(0), W, 1.2 * U);

      const i0 = Math.floor(camX / 60) - 1, i1 = Math.floor((camX + Wu) / 60) + 1;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillStyle = '#000';   // emoji take the fill's alpha
      // ground things
      for (let i = i0; i <= i1; i++) for (const g of seg(i).ground) {
        cx.font = `${g.z * U}px ${EMOJI_FONT}`;
        cx.fillText(g.e, SX(g.x), SY(0) - g.z * U * 0.42);
      }
      // sky things
      const flying = P.st === 'fly';
      for (let i = i0; i <= i1; i++) for (const it of seg(i).sky) {
        const hit = hits.get(it.id);
        let x = it.x, a = it.a + Math.sin(now / 600 + it.ph) * 1.5, alpha = 1, sz = it.z, rot = 0;
        if (it.kind === 'star') rot = Math.sin(now / 300 + it.ph) * 0.2;
        if (hit !== undefined) {
          const age = flightT - hit;
          if (it.kind !== 'flee' || age > 2) continue;
          x += age * 40; a += age * 30; alpha = 1 - age / 2;
        }
        const sx = SX(x), sy = SY(a);
        if (flying && hit === undefined && Math.hypot(x - P.x, a - P.a) < sz * 0.6 + 4) hitItem(it, sx, sy);
        cx.save();
        cx.globalAlpha = alpha;
        cx.translate(sx, sy); cx.rotate(rot);
        cx.font = `${sz * U}px ${EMOJI_FONT}`;
        cx.fillText(it.e, 0, 0);
        cx.restore();
      }
      // trail
      if (P.trail.length > 1 && P.st !== 'hand') {
        cx.lineCap = 'round';
        for (let k = 1; k < P.trail.length; k += 2) {
          const [x, a] = P.trail[k];
          cx.fillStyle = `rgba(255,255,255,${0.7 * k / P.trail.length})`;
          cx.beginPath(); cx.arc(SX(x), SY(a), 0.5 * U, 0, 6.29); cx.fill();
        }
      }
      // throw hint
      if (P.st === 'hand' && !grab && now - idleThrow > 2500) {
        const ph = ((now - idleThrow - 2500) / 1000) % 2;
        if (ph < 1.3) {
          const k = ph / 1.3, hx = SX(HAND.x) - 6 * U + 20 * U * k, hy = SY(HAND.a) + 6 * U - 14 * U * k * (1 - 0.3 * k);
          cx.save(); cx.globalAlpha = Math.sin(k * Math.PI);
          cx.font = `${9 * U}px ${EMOJI_FONT}`; cx.fillStyle = '#000'; cx.fillText('👆', hx, hy);
          cx.restore();
        }
        cx.setLineDash([U, 1.5 * U]); cx.lineWidth = 0.6 * U; cx.strokeStyle = 'rgba(255,255,255,.75)';
        cx.beginPath();
        for (let k = 0; k <= 20; k++) { const x = HAND.x + 8 + k * 4; cx.lineTo(SX(x), SY(HAND.a + k * 1.8 - k * k * 0.06)); }
        cx.stroke(); cx.setLineDash([]);
      }
      // plane + shadow
      if (plane && P.st !== 'none') {
        let x = P.x, a = P.a;
        if (grab) { x += Math.max(-8, Math.min(8, grab.dx / U * 0.3)); a -= Math.max(-8, Math.min(8, grab.dy / U * 0.3)); }
        const sx = SX(x), sy = SY(a), len = 15 * U;
        const sh = Math.max(0, 1 - a / 70);
        cx.fillStyle = `rgba(30,60,20,${0.25 * sh})`;
        cx.beginPath(); cx.ellipse(sx, SY(0) + 0.6 * U, len * 0.45 * (0.5 + sh / 2), 1.2 * U, 0, 0, 6.29); cx.fill();
        const squash = P.st === 'fly' ? 0.82 + 0.18 * Math.cos(P.wob) : 1;
        let ang = -P.th;
        if (P.st === 'return') ang = 0;   // flies back nose first, mirrored
        cx.save();
        if (P.st === 'return') { cx.translate(sx, 0); cx.scale(-1, 1); cx.translate(-sx, 0); }
        drawPlaneAt(cx, plane, sx, sy, ang, len, squash);
        cx.restore();
      }
      // wind puffs from taps
      for (let k = windPuffs.length - 1; k >= 0; k--) {
        const w = windPuffs[k];
        w.t += dt;
        if (w.t > 0.6) { windPuffs.splice(k, 1); continue; }
        cx.strokeStyle = `rgba(255,255,255,${1 - w.t / 0.6})`; cx.lineWidth = 0.6 * U; cx.lineCap = 'round';
        for (let j = -1; j <= 1; j++) {
          cx.beginPath();
          cx.arc(w.x + w.t * 30 * U, w.y + j * 3 * U, 3 * U, -0.9, 0.9);
          cx.stroke();
        }
      }
    }

    /* ---------- main loop ---------- */
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // the flight (and everything else that moves in the sky) holds still while a new plane is being folded
      if (!folding) updatePlane(dt, now);
      cx.setTransform(Math.min(2, window.devicePixelRatio || 1), 0, 0, Math.min(2, window.devicePixelRatio || 1), 0, 0);
      drawWorld(now, folding ? 0 : dt);
      if (folding) drawFold(now);
      if (!folding && !plane) newBtn.classList.add('glow');
      raf = requestAnimationFrame(frame);
    }
    openFold();
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); t.clear(); offResize(); };
  },
};
