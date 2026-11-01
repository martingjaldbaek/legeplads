/* Tryllemaling: like a "paint with water" book. The page starts as a colouring-book outline of the main
 * characters; wherever a finger brushes, the colours magically appear – and hidden surprises (a butterfly,
 * a crab…) that had no outline at all pop into view. When most of the page is painted it finishes itself
 * with a sparkle, and ➡️ turns to the next page.
 */
// emoji, spoken name, x, y (fractions of the page), size (fraction of the short side), hidden
const SCENES = [
  { sky: ['#9fdcff', '#e6f7ff'], ground: ['#8ed46b', '#5fb347'], horizon: 0.6, clouds: true, objects: [
    ['🏠', 'Huset', 0.24, 0.47, 0.32], ['🌳', 'Træet', 0.78, 0.44, 0.34], ['🐶', 'Hunden', 0.52, 0.76, 0.26], ['☀️', 'Solen', 0.88, 0.13, 0.17],
    ['🦋', 'en sommerfugl', 0.45, 0.25, 0.11, 1], ['🌷', 'en blomst', 0.1, 0.84, 0.12, 1], ['🐦', 'en fugl', 0.62, 0.15, 0.1, 1], ['🐞', 'en mariehøne', 0.88, 0.86, 0.09, 1]] },
  { sky: ['#a5e4ff', '#e9fbff'], ground: ['#4fb6ec', '#1f78c8'], horizon: 0.42, clouds: true, objects: [
    ['⛵', 'Båden', 0.3, 0.34, 0.22], ['🐳', 'Hvalen', 0.6, 0.66, 0.34], ['☀️', 'Solen', 0.1, 0.13, 0.15],
    ['🐠', 'en fisk', 0.18, 0.64, 0.12, 1], ['🐙', 'en blæksprutte', 0.86, 0.82, 0.14, 1], ['🦀', 'en krabbe', 0.36, 0.9, 0.1, 1], ['🐢', 'en skildpadde', 0.9, 0.52, 0.11, 1]] },
  { sky: ['#1b1a4a', '#3b2a7a'], ground: ['#8a7fc9', '#5f54a0'], horizon: 0.84, stars: true, objects: [
    ['🚀', 'Raketten', 0.5, 0.5, 0.36], ['🌙', 'Månen', 0.17, 0.2, 0.2], ['🪐', 'Planeten', 0.83, 0.24, 0.22],
    ['👽', 'et rumvæsen', 0.84, 0.74, 0.13, 1], ['⭐', 'en stjerne', 0.36, 0.14, 0.09, 1], ['🛸', 'en flyvende tallerken', 0.17, 0.66, 0.15, 1], ['🌟', 'en stjerne', 0.64, 0.12, 0.08, 1]] },
  { sky: ['#bdf2cf', '#effff4'], ground: ['#4fbf5a', '#2f8f3d'], horizon: 0.64, clouds: true, objects: [
    ['🦁', 'Løven', 0.32, 0.72, 0.28], ['🐘', 'Elefanten', 0.74, 0.66, 0.32], ['🌴', 'Palmetræet', 0.1, 0.42, 0.34],
    ['🐒', 'en abe', 0.52, 0.3, 0.12, 1], ['🦜', 'en papegøje', 0.9, 0.24, 0.11, 1], ['🍌', 'en banan', 0.5, 0.9, 0.09, 1], ['🐍', 'en slange', 0.92, 0.9, 0.12, 1]] },
];
const GRID_X = 32, GRID_Y = 24;
const DONE_AT = 0.86;
const INK = '#4a3b5c';

const CSS = `
.tm-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.tm-full { opacity:0; transition: opacity .9s ease; pointer-events:none; }
.tm-full.show { opacity:1; }
.tm-next { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.9); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(32px, 4.6vmin); }
.tm-next.pulse { animation: tm-pulse 1s ease-in-out infinite; }
.tm-next:active { transform: scale(.9); }
@keyframes tm-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
`;

export default {
  id: 'tryllemaling',
  title: 'Tryllemaling',
  icon: '🪄',
  color: '#8338ec',
  edge: '#fffaf0',

  start(root, kit) {
    root.style.background = '#fffaf0';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const lineCv = document.createElement('canvas');    // the outline page
    const paintCv = document.createElement('canvas');   // colour revealed so far
    const fullCv = document.createElement('canvas');    // the finished picture, faded in at the end
    const fxCv = document.createElement('canvas');      // sparkles
    for (const c of [lineCv, paintCv, fullCv, fxCv]) { c.className = 'tm-cv'; root.appendChild(c); }
    fullCv.classList.add('tm-full');
    const colorCv = document.createElement('canvas');   // offscreen: the full-colour picture
    const next = document.createElement('button');
    next.className = 'tm-next';
    next.textContent = '➡️';
    next.setAttribute('aria-label', 'Næste side');
    root.appendChild(next);
    const lc = lineCv.getContext('2d'), pc = paintCv.getContext('2d'), fc = fullCv.getContext('2d'),
          xc = fxCv.getContext('2d'), cc = colorCv.getContext('2d');

    let W = 0, H = 0, S = 0, dpr = 1, sceneIdx = Math.floor(Math.random() * SCENES.length), scene = SCENES[sceneIdx];
    let grid, found, strokes = [], done = false;
    const sparkles = [];

    const emojiFont = px => `${px}px system-ui, "Apple Color Emoji", sans-serif`;
    const obj = o => ({ e: o[0], name: o[1], x: o[2] * W, y: o[3] * H, size: o[4] * S * 1.15, hidden: !!o[5] });

    function drawBackground(ctx) {
      const hy = scene.horizon * H;
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, scene.sky[0]); sky.addColorStop(1, scene.sky[1]);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);   // full height: no seam under the wavy ground
      const gr = ctx.createLinearGradient(0, hy, 0, H);
      gr.addColorStop(0, scene.ground[0]); gr.addColorStop(1, scene.ground[1]);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.quadraticCurveTo(W * 0.3, hy - H * 0.05, W * 0.55, hy);
      ctx.quadraticCurveTo(W * 0.8, hy + H * 0.04, W, hy - H * 0.02);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      if (scene.clouds) {
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        for (const [cx, cy, s] of [[0.15, 0.12, 1], [0.6, 0.08, 0.8], [0.42, 0.2, 0.6]]) {
          for (const [dx, dy, r] of [[0, 0, 1], [1, -0.35, 0.8], [-0.9, 0.1, 0.7], [0.5, 0.3, 0.8]]) {
            ctx.beginPath(); ctx.arc(cx * W + dx * S * 0.05 * s, cy * H + dy * S * 0.05 * s, r * S * 0.05 * s, 0, 6.283); ctx.fill();
          }
        }
      }
      if (scene.stars) {
        ctx.fillStyle = '#fff8c4';
        for (let i = 0; i < 70; i++) {
          const x = ((i * 977) % 1000) / 1000 * W, y = ((i * 613) % 1000) / 1000 * scene.horizon * H;
          ctx.beginPath(); ctx.arc(x, y, S * (0.002 + (i % 3) * 0.0015), 0, 6.283); ctx.fill();
        }
      }
    }

    // colouring-book outline of an emoji: dilate its silhouette and cut the silhouette back out
    function outline(ctx, o) {
      const thick = Math.max(2, S * 0.006) * dpr, size = o.size * dpr, pad = thick * 2 + 6;
      const s = Math.ceil(size * 1.35 + pad * 2);
      const sil = document.createElement('canvas'); sil.width = sil.height = s;
      const sc = sil.getContext('2d');
      sc.font = emojiFont(size); sc.textAlign = 'center'; sc.textBaseline = 'middle';
      sc.fillText(o.e, s / 2, s / 2);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = INK; sc.fillRect(0, 0, s, s);
      const ring = document.createElement('canvas'); ring.width = ring.height = s;
      const rc = ring.getContext('2d');
      for (let a = 0; a < 16; a++) rc.drawImage(sil, Math.cos(a / 16 * 6.283) * thick, Math.sin(a / 16 * 6.283) * thick);
      rc.globalCompositeOperation = 'destination-out';
      rc.drawImage(sil, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(ring, o.x * dpr - s / 2, o.y * dpr - s / 2);
      ctx.restore();
    }

    function render() {
      W = root.clientWidth; H = root.clientHeight; S = Math.min(W, H);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [lineCv, paintCv, fullCv, fxCv, colorCv]) { c.width = W * dpr; c.height = H * dpr; }
      for (const ctx of [lc, pc, fc, xc, cc]) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const objs = scene.objects.map(obj);
      // full-colour picture (offscreen)
      drawBackground(cc);
      cc.textAlign = 'center'; cc.textBaseline = 'middle';
      for (const o of objs) { cc.font = emojiFont(o.size); cc.fillText(o.e, o.x, o.y); }
      // the outline page: paper, a pencil horizon, outlines of the main characters only
      lc.fillStyle = '#fffaf0'; lc.fillRect(0, 0, W, H);
      lc.strokeStyle = 'rgba(74,59,92,.35)'; lc.lineWidth = Math.max(1.5, S * 0.003);
      const hy = scene.horizon * H;
      lc.beginPath(); lc.moveTo(0, hy);
      lc.quadraticCurveTo(W * 0.3, hy - H * 0.05, W * 0.55, hy);
      lc.quadraticCurveTo(W * 0.8, hy + H * 0.04, W, hy - H * 0.02);
      lc.stroke();
      for (const o of objs) if (!o.hidden) outline(lc, o);
      fc.drawImage(colorCv, 0, 0, W, H);
      // re-apply what was already painted (after a rotation)
      for (const [x, y, r] of strokes) dab(x * W, y * H, r * S, false);
    }

    function newPage(first) {
      if (!first) {
        sceneIdx = (sceneIdx + 1) % SCENES.length;
        scene = SCENES[sceneIdx];
        kit.sfx.whoosh();
      }
      grid = new Uint8Array(GRID_X * GRID_Y);
      found = new Set();
      strokes = [];
      done = false;
      fullCv.classList.remove('show');
      next.classList.remove('pulse');
      pc.clearRect(0, 0, W, H);
      render();
    }

    // reveal the colour picture in a circle around (x, y)
    function dab(x, y, r, record = true) {
      pc.save();
      pc.beginPath();
      pc.arc(x, y, r, 0, 6.283);
      pc.clip();
      const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r), w = Math.min(W, x + r) - x0, h = Math.min(H, y + r) - y0;
      if (w > 0 && h > 0) pc.drawImage(colorCv, x0 * dpr, y0 * dpr, w * dpr, h * dpr, x0, y0, w, h);
      pc.restore();
      if (!record) return;
      strokes.push([x / W, y / H, r / S]);
      // coverage grid
      const gx0 = Math.max(0, Math.floor((x - r) / W * GRID_X)), gx1 = Math.min(GRID_X - 1, Math.floor((x + r) / W * GRID_X));
      const gy0 = Math.max(0, Math.floor((y - r) / H * GRID_Y)), gy1 = Math.min(GRID_Y - 1, Math.floor((y + r) / H * GRID_Y));
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        const cx = (gx + 0.5) / GRID_X * W, cy = (gy + 0.5) / GRID_Y * H;
        if (Math.hypot(cx - x, cy - y) < r + W / GRID_X * 0.4) grid[gy * GRID_X + gx] = 1;
      }
      // did we just uncover something?
      scene.objects.map(obj).forEach((o, i) => {
        if (found.has(i) || Math.hypot(o.x - x, o.y - y) > o.size * 0.32) return;
        found.add(i);
        if (o.hidden) {
          kit.sfx.chime();
          kit.burst(o.x, o.y, 30, 0.7);
          kit.say(`Se! ${o.name[0].toUpperCase()}${o.name.slice(1)}!`, { pitch: 1.3 });
        } else {
          kit.say(o.name + '!', { pitch: 1.2 });
        }
      });
      if (Math.random() < 0.5) sparkles.push({ x: x + kit.rand(-1, 1) * r, y: y + kit.rand(-1, 1) * r, life: 1, hue: kit.rand(0, 360), s: S * kit.rand(0.01, 0.02) });
    }

    function finish() {
      done = true;
      fullCv.classList.add('show');
      kit.sfx.fanfare();
      kit.bigBurst();
      t.later(() => kit.say('Flot! Sikke et flot billede!', { pitch: 1.3 }), 600);
      t.later(() => next.classList.add('pulse'), 1500);
    }

    const last = new Map();
    let lastShimmer = 0, lastCheck = 0;
    function brush(id, x, y) {
      const r = S * 0.065;
      const p = last.get(id) || { x, y };
      const d = Math.hypot(x - p.x, y - p.y), n = Math.max(1, Math.ceil(d / (r * 0.4)));
      for (let i = 1; i <= n; i++) dab(p.x + (x - p.x) * i / n, p.y + (y - p.y) * i / n, r * kit.rand(0.9, 1.08));
      last.set(id, { x, y });
      const now = performance.now();
      if (now - lastShimmer > 140) {
        lastShimmer = now;
        kit.tone(kit.scaleHz(Math.floor(kit.rand(8, 16)), 523.25), { dur: 0.35, vol: 0.05, attack: 0.01 });
      }
      if (!done && now - lastCheck > 250) {
        lastCheck = now;
        let n2 = 0;
        for (const v of grid) n2 += v;
        if (n2 / grid.length >= DONE_AT) finish();
      }
    }

    fxCv.addEventListener('pointerdown', e => { e.preventDefault(); last.delete(e.pointerId); brush(e.pointerId, e.clientX, e.clientY); });
    fxCv.addEventListener('pointermove', e => {
      if (!last.has(e.pointerId)) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const ev of (evs.length ? evs : [e])) brush(e.pointerId, ev.clientX, ev.clientY);
    });
    const up = e => last.delete(e.pointerId);
    fxCv.addEventListener('pointerup', up);
    fxCv.addEventListener('pointercancel', up);
    next.addEventListener('click', () => newPage(false));

    let raf = 0;
    function frame() {
      xc.clearRect(0, 0, W, H);
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.life -= 0.03;
        if (p.life <= 0) { sparkles.splice(i, 1); continue; }
        xc.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.life})`;
        xc.beginPath();
        for (let k = 0; k < 8; k++) {
          const rr = k % 2 ? p.s * 0.4 : p.s, a = k * Math.PI / 4;
          xc.lineTo(p.x + Math.cos(a) * rr, p.y - (1 - p.life) * S * 0.03 + Math.sin(a) * rr);
        }
        xc.closePath(); xc.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const offResize = kit.onResize(root, render);
    newPage(true);
    return () => { t.clear(); cancelAnimationFrame(raf); offResize(); };
  },
};
