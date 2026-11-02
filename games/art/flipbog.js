/* Flip-book engine shared by Fjæs (games/blandeansigt.js) and Figurer (games/blandefigur.js).
 * A picture is cut into horizontal bands. Each band is a strip that you swipe sideways on its own; it follows the
 * finger, snaps to the next option with a little bounce, and wraps round forever. 🎲 spins all strips like a slot
 * machine. When every strip shows the same set, onMatch(set) is called.
 *
 * Art is authored in one coordinate system for the whole picture (canvas W×H). Each strip shows its band
 * [y0, y1] of that picture through an SVG viewBox, so pieces line up at the seams as long as each set keeps to
 * the shared seam shapes.
 */
const CSS = `
.fb-wrap { position:absolute; inset:0; }
.fb-strip { position:absolute; left:0; right:0; touch-action:none; overflow:visible; }
.fb-cell { position:absolute; top:0; left:0; will-change:transform; pointer-events:none; }
.fb-cell svg { display:block; width:100%; height:100%; overflow:hidden; }
.fb-cell.bump svg { animation: fb-bump .38s cubic-bezier(.3,1.6,.5,1); }
@keyframes fb-bump { 0%{transform:scale(.94,1.06)} 50%{transform:scale(1.04,.96)} 100%{transform:none} }
.fb-dice { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(34px, 5vmin); line-height:1; }
.fb-dice:active { transform: scale(.9); }
.fb-dice.roll { animation: fb-roll .6s ease; }
@keyframes fb-roll { 0%{transform:none} 50%{transform:rotate(200deg) scale(1.2)} 100%{transform:rotate(360deg)} }
.fb-eyes { transform-box: fill-box; transform-origin: center; animation: fb-blink 4.6s infinite; }
@keyframes fb-blink { 0%,93%,100% { transform:none } 96% { transform:scaleY(.1) } }
`;

const mod = (a, n) => ((a % n) + n) % n;
const easeOutBack = (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/**
 * opts:
 *   canvas: [W, H]            picture size in art units
 *   bands:  [[y0, y1], …]      top to bottom
 *   count:  number of sets
 *   art(set, band) → SVG markup in picture coordinates
 *   fit(rootW, rootH) → { h, cx, top }   picture height in px, its centre x and top y
 *   onTap(strip, e), onMatch(set), onSettle(strip)
 */
export function flipbog(root, kit, opts) {
  const { canvas: [W, H], bands, count: N, art } = opts;
  kit.injectCSS(root, CSS);
  const wrap = document.createElement('div');
  wrap.className = 'fb-wrap';
  root.appendChild(wrap);
  const dice = document.createElement('button');
  dice.className = 'fb-dice';
  dice.textContent = '🎲';
  dice.setAttribute('aria-label', 'Bland');
  root.appendChild(dice);

  const cache = new Map();
  const markup = (set, b) => {
    const k = set * 10 + b;
    if (!cache.has(k)) {
      const [y0, y1] = bands[b];
      // 1 unit of overlap at inner seams hides hairline gaps from sub-pixel rounding
      const a = b > 0 ? y0 - 1 : y0, z = b < bands.length - 1 ? y1 + 1 : y1;
      cache.set(k, `<svg viewBox="0 ${a} ${W} ${z - a}" preserveAspectRatio="none">${art(set, b)}</svg>`);
    }
    return cache.get(k);
  };

  let scale = 1, cx = 0, top = 0, gap = 0, raf = 0, lastMatch = -1;
  const strips = bands.map((band, b) => {
    const el = document.createElement('div');
    el.className = 'fb-strip';
    el.style.zIndex = 1 + b;
    wrap.appendChild(el);
    const cells = [-2, -1, 0, 1, 2].map(() => {
      const c = document.createElement('div');
      c.className = 'fb-cell';
      c.set = -1;
      el.appendChild(c);
      return c;
    });
    return { b, band, el, cells, pos: Math.floor(Math.random() * N), anim: null, drag: null, shown: null };
  });
  // start on a match so the first picture is a whole character
  const first = Math.floor(Math.random() * N);
  strips.forEach(s => { s.pos = first; s.shown = first; });
  lastMatch = first;

  function layout() {
    const f = opts.fit(root.clientWidth, root.clientHeight);
    scale = f.h / H; cx = f.cx; top = f.top;
    const w = W * scale;
    gap = w * (opts.gap || 1.2);
    strips.forEach(s => {
      const [y0, y1] = s.band;
      const a = s.b > 0 ? y0 - 1 : y0, z = s.b < bands.length - 1 ? y1 + 1 : y1;
      Object.assign(s.el.style, { top: top + a * scale + 'px', height: (z - a) * scale + 'px' });
      s.cells.forEach(c => { c.style.width = w + 'px'; c.style.height = (z - a) * scale + 'px'; });
      render(s);
    });
  }

  function render(s) {
    const base = Math.round(s.pos), w = W * scale;
    s.cells.forEach((c, i) => {
      const idx = base + i - 2, set = mod(idx, N);
      if (c.set !== set) { c.set = set; c.innerHTML = markup(set, s.b); }
      const d = idx - s.pos;
      c.style.transform = `translateX(${cx - w / 2 + d * gap}px)`;
      c.style.opacity = 1 - Math.min(Math.abs(d), 1) * 0.55;
    });
    const now = mod(base, N);
    if (now !== s.tick) {
      if (s.tick !== undefined && (s.drag || s.anim)) {
        const t = performance.now();
        if (!s.lastTick || t - s.lastTick > 45) { kit.tone(1500 + s.b * 300, { dur: 0.03, vol: 0.05, type: 'square' }); s.lastTick = t; }
      }
      s.tick = now;
    }
  }

  function loop() {
    raf = 0;
    const t = performance.now();
    let busy = false;
    strips.forEach(s => {
      if (s.anim) {
        const a = s.anim, k = Math.min(1, (t - a.t0) / a.dur);
        if (k < 0) { busy = true; return; }
        s.pos = a.from + (a.to - a.from) * easeOutBack(k, a.s);
        if (k >= 1) { s.pos = a.to; s.anim = null; settled(s); } else busy = true;
        render(s);
      }
      if (s.drag) busy = true;
    });
    if (busy) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function go(s, to, dur, delay = 0, overshoot = 1.4) {
    s.anim = { from: s.pos, to, t0: performance.now() + delay, dur, s: overshoot };
    kick();
  }

  function settled(s) {
    const set = mod(Math.round(s.pos), N);
    const centre = s.cells[2];
    kit.replay(centre, 'bump');
    if (set !== s.shown) { s.shown = set; kit.tone(kit.scaleHz(4 + s.b * 2), { dur: 0.12, type: 'triangle', vol: 0.14 }); }
    opts.onSettle && opts.onSettle(s);
    if (strips.some(o => o.anim || o.drag)) return;
    const sets = strips.map(o => mod(Math.round(o.pos), N));
    if (sets.every(x => x === sets[0])) {
      if (sets[0] !== lastMatch) { lastMatch = sets[0]; opts.onMatch && opts.onMatch(sets[0]); }
    } else lastMatch = -1;
  }

  /* ---- dragging ---- */
  strips.forEach(s => {
    s.el.addEventListener('pointerdown', e => {
      if (s.drag) return;
      e.preventDefault();
      try { s.el.setPointerCapture(e.pointerId); } catch (_) {}
      s.anim = null;
      s.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: s.pos, t0: performance.now(), moved: 0, samples: [[performance.now(), e.clientX]] };
      kick();
    });
    s.el.addEventListener('pointermove', e => {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) return;
      d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x0, e.clientY - d.y0));
      s.pos = d.p0 - (e.clientX - d.x0) / gap;
      d.samples.push([performance.now(), e.clientX]);
      if (d.samples.length > 6) d.samples.shift();
      render(s);
    });
    const up = e => {
      const d = s.drag;
      if (!d || d.id !== e.pointerId) return;
      s.drag = null;
      const dt = performance.now() - d.t0;
      if (d.moved < 12 && dt < 400) {
        s.pos = d.p0; render(s);
        if (opts.onTap) opts.onTap(s, e); else spin(s);
        return;
      }
      const [ta, xa] = d.samples[0], [tb, xb] = d.samples[d.samples.length - 1];
      const v = tb - ta > 5 ? -(xb - xa) / (tb - ta) * 1000 / gap : 0;   // cells per second
      const start = Math.round(d.p0);
      let to = Math.round(s.pos + Math.max(-3, Math.min(3, v * 0.2)));
      if (to === start && Math.abs(s.pos - d.p0) > 0.1) to = start + Math.sign(s.pos - d.p0);
      to = Math.max(start - 4, Math.min(start + 4, to));
      if (to !== start) kit.sfx.whoosh();
      go(s, to, 420);
    };
    s.el.addEventListener('pointerup', up);
    s.el.addEventListener('pointercancel', up);
  });

  /** Spin one strip by a few steps (or to a given set). */
  function spin(s, { steps, toSet, delay = 0, dur } = {}) {
    if (s.drag) return;
    const base = Math.round(s.anim ? s.anim.to : s.pos);
    let n = steps || (3 + Math.floor(Math.random() * 6));
    if (toSet !== undefined) {
      n = mod(toSet - mod(base, N), N);
      while (n < (steps || 4)) n += N;
    }
    go(s, base + n, dur || 500 + n * 70, delay, 1.1);
    if (!delay) kit.sfx.fwip();
  }

  function spinAll() {
    kit.replay(dice, 'roll');
    kit.sfx.whoosh();
    // a third of the time, line up a whole set: the jackpot is the fun part
    const jackpot = Math.random() < 0.34 ? Math.floor(Math.random() * N) : undefined;
    strips.forEach((s, i) => {
      const toSet = jackpot !== undefined ? jackpot : Math.floor(Math.random() * N);
      spin(s, { toSet, steps: 6 + i * 3, delay: i * 180, dur: 1100 + i * 350 });
    });
  }
  dice.addEventListener('click', spinAll);

  layout();
  const offResize = kit.onResize(root, layout);
  return {
    wrap, strips, spin, spinAll, layout,
    stop() { cancelAnimationFrame(raf); offResize(); },
    current: () => strips.map(s => mod(Math.round(s.pos), N)),
  };
}
