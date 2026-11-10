import * as gaarden from './art/gaarden.js';
import * as havet from './art/havet.js';
import * as rummet from './art/rummet.js';
import * as junglen from './art/junglen.js';
import * as byen from './art/byen.js';

/* Tryllemaling: like a "paint with water" book. The page starts as a colouring-book outline of the main
 * characters; wherever a finger brushes, the colours magically appear – and hidden surprises (a butterfly,
 * a crab…) that had no outline at all pop into view with a chime. When most of the page is painted it
 * finishes itself with a fanfare, and the next page in the row along the top starts to pulse.
 * No voice – just sparkles and chimes.
 *
 * Pages are hand-drawn SVG (games/art/gaarden.js, havet.js, rummet.js, junglen.js, byen.js), each drawn in a
 * 1600×1000 box with the sky and ground reaching far beyond it. Landscape shows the box (cropped a little at
 * the sides); portrait shows nearly its full width with extra sky above and ground below.
 * Each page remembers what was painted, so you can switch back and forth; tapping the current page in the
 * row starts it over.
 */
const PAGES = [gaarden, havet, rummet, junglen, byen];
const GRID_X = 32, GRID_Y = 24;
const DONE_AT = 0.86;
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

const CSS = `
.tm-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.tm-full { opacity:0; transition: opacity .9s ease; pointer-events:none; }
.tm-full.show { opacity:1; }
.tm-pick { position:absolute; z-index:10; top:12px; left:104px; right:12px; display:flex; justify-content:center; gap:10px;
  pointer-events:none; }
.tm-pick button { pointer-events:auto; position:relative; flex:1 1 0; max-width:130px; aspect-ratio:16/10; padding:0; border:4px solid #fff;
  border-radius:14px; overflow:hidden; background:#fffaf0; box-shadow:0 4px 0 rgba(0,0,0,.15); transition: transform .15s; }
.tm-pick img { width:100%; height:100%; object-fit:cover; display:block; }
.tm-pick button.on { border-color:#ffd60a; transform: translateY(4px) scale(1.06); }
.tm-pick button.done::after { content:'⭐'; position:absolute; right:2px; bottom:0; font-size:22px; line-height:1; }
.tm-pick button.pulse { animation: tm-pulse 1s ease-in-out infinite; }
.tm-pick button:active { transform: scale(.92); }
@keyframes tm-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
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
    const fxCv = document.createElement('canvas');      // sparkles, hint wand
    for (const c of [lineCv, paintCv, fullCv, fxCv]) { c.className = 'tm-cv'; root.appendChild(c); }
    fullCv.classList.add('tm-full');
    const colorCv = document.createElement('canvas');   // offscreen: the full-colour picture
    const lc = lineCv.getContext('2d'), pc = paintCv.getContext('2d'), fc = fullCv.getContext('2d'),
          xc = fxCv.getContext('2d'), cc = colorCv.getContext('2d');

    const svgSrc = str => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
    const svgImage = str => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = svgSrc(str); });

    // page picker: thumbnails of the finished pictures
    const pick = document.createElement('div');
    pick.className = 'tm-pick';
    const pickBtns = PAGES.map((art, i) => {
      const b = document.createElement('button');
      b.innerHTML = `<img alt="" src="${svgSrc(art.svg(false, 320, 200, '0 0 1600 1000'))}">`;
      b.addEventListener('click', () => (i === pageIdx ? restartPage() : goPage(i)));
      pick.appendChild(b);
      return b;
    });
    root.appendChild(pick);

    let W = 0, H = 0, S = 0, dpr = 1, pageIdx = 0, art = PAGES[0];
    // per-page progress, kept while the game is open: strokes in page units, coverage, finds
    const states = PAGES.map(() => null);
    const fresh = () => ({ grid: new Uint8Array(GRID_X * GRID_Y), found: new Set(), strokes: [], done: false });
    let st = null;
    const sparkles = [];
    let pageStart = performance.now();

    // the page's 1600×1000 box → the screen below the page row: cover it, but never crop to less than
    // 1540 units wide (portrait then shows extra sky above and ground below)
    let k = 1, ox = 0, oy = 0;
    function view() {
      const top = pick.offsetHeight + 16, h = H - top;
      k = Math.min(Math.max(W / art.W, h / art.H), W / 1540);
      ox = (W - art.W * k) / 2; oy = top + (h - art.H * k) / 2;
      return `${(-ox / k).toFixed(2)} ${(-oy / k).toFixed(2)} ${(W / k).toFixed(2)} ${(H / k).toFixed(2)}`;
    }
    const hiddenScreen = () => art.hidden.map(h => ({ x: ox + h.x * k, y: oy + h.y * k, hit: h.r * k }));
    let renderToken = 0;

    function render() {
      W = root.clientWidth; H = root.clientHeight; S = Math.min(W, H);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [lineCv, paintCv, fullCv, fxCv, colorCv]) { c.width = W * dpr; c.height = H * dpr; }
      for (const ctx of [lc, pc, fc, xc, cc]) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const vb = view();
      const token = ++renderToken;
      lc.fillStyle = '#fffaf0'; lc.fillRect(0, 0, W, H);
      // rasterise both versions at the exact device-pixel size for crisp lines
      Promise.all([svgImage(art.svg(true, W * dpr, H * dpr, vb)), svgImage(art.svg(false, W * dpr, H * dpr, vb))]).then(([li, co]) => {
        if (token !== renderToken || !li || !co) return;
        lc.drawImage(li, 0, 0, W, H);
        cc.drawImage(co, 0, 0, W, H);
        fc.clearRect(0, 0, W, H);
        fc.drawImage(colorCv, 0, 0, W, H);
        for (const [x, y, r] of st.strokes) dab(ox + x * k, oy + y * k, r * k, false);
      });
    }

    function showPage(i) {
      pageIdx = i; art = PAGES[i];
      st = states[i] || (states[i] = fresh());
      fullCv.classList.toggle('show', st.done);
      pickBtns.forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.remove('pulse'); b.classList.toggle('done', !!(states[j] && states[j].done)); });
      pc.clearRect(0, 0, W, H);
      pageStart = performance.now();
      render();
    }
    function goPage(i) { kit.sfx.whoosh(); showPage(i); }
    function restartPage() {
      kit.sfx.rustle();
      states[pageIdx] = null;
      showPage(pageIdx);
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
      st.strokes.push([(x - ox) / k, (y - oy) / k, r / k]);
      // coverage grid (screen cells)
      const gx0 = Math.max(0, Math.floor((x - r) / W * GRID_X)), gx1 = Math.min(GRID_X - 1, Math.floor((x + r) / W * GRID_X));
      const gy0 = Math.max(0, Math.floor((y - r) / H * GRID_Y)), gy1 = Math.min(GRID_Y - 1, Math.floor((y + r) / H * GRID_Y));
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        const cx = (gx + 0.5) / GRID_X * W, cy = (gy + 0.5) / GRID_Y * H;
        if (Math.hypot(cx - x, cy - y) < r + W / GRID_X * 0.4) st.grid[gy * GRID_X + gx] = 1;
      }
      // did we just uncover something?
      hiddenScreen().forEach((o, i) => {
        if (st.found.has(i) || Math.hypot(o.x - x, o.y - y) > o.hit) return;
        st.found.add(i);
        kit.sfx.chime();
        kit.burst(o.x, o.y, 30, 0.7);
      });
      if (Math.random() < 0.5) sparkles.push({ x: x + kit.rand(-1, 1) * r, y: y + kit.rand(-1, 1) * r, life: 1, hue: kit.rand(0, 360), s: S * kit.rand(0.01, 0.02) });
    }

    function finish() {
      st.done = true;
      const mine = st;
      fullCv.classList.add('show');
      kit.sfx.fanfare();
      kit.bigBurst();
      // any surprises not found yet show themselves with a sparkle
      hiddenScreen().forEach((o, i) => {
        if (st.found.has(i)) return;
        st.found.add(i);
        t.later(() => { if (st !== mine) return; kit.burst(o.x, o.y, 24, 0.6); kit.sfx.xylo(kit.scaleHz(7 + i)); }, 900 + i * 260);
      });
      pickBtns[pageIdx].classList.add('done');
      const nxt = [...PAGES.keys()].map(j => (pageIdx + 1 + j) % PAGES.length).find(j => !(states[j] && states[j].done));
      t.later(() => { if (st === mine && nxt !== undefined) pickBtns[nxt].classList.add('pulse'); }, 1800);
    }

    const last = new Map();
    let lastShimmer = 0, lastCheck = 0;
    function brush(id, x, y) {
      const r = S * 0.07;
      const p = last.get(id) || { x, y };
      const d = Math.hypot(x - p.x, y - p.y), n = Math.max(1, Math.ceil(d / (r * 0.4)));
      for (let i = 1; i <= n; i++) dab(p.x + (x - p.x) * i / n, p.y + (y - p.y) * i / n, r * kit.rand(0.9, 1.08));
      last.set(id, { x, y });
      const now = performance.now();
      if (now - lastShimmer > 140) {
        lastShimmer = now;
        kit.tone(kit.scaleHz(Math.floor(kit.rand(8, 16)), 523.25), { dur: 0.35, vol: 0.05, attack: 0.01 });
      }
      if (!st.done && now - lastCheck > 250) {
        lastCheck = now;
        let n2 = 0;
        for (const v of st.grid) n2 += v;
        if (n2 / st.grid.length >= DONE_AT) finish();
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

    let raf = 0;
    function frame(now) {
      xc.clearRect(0, 0, W, H);
      // hint: on an untouched page, a magic wand drifts about trailing sparkles
      if (!st.strokes.length && now - pageStart > 2500) {
        const ph = (now - pageStart - 2500) / 1000;
        const wx = W / 2 + Math.sin(ph * 1.3) * W * 0.25, wy = H * 0.55 + Math.sin(ph * 2.6) * H * 0.12;
        if (Math.random() < 0.6) sparkles.push({ x: wx - S * 0.03, y: wy + S * 0.03, life: 1, hue: kit.rand(0, 360), s: S * kit.rand(0.008, 0.016) });
        xc.save();
        xc.font = `${S * 0.1}px ${EMOJI_FONT}`; xc.textAlign = 'center'; xc.textBaseline = 'middle'; xc.fillStyle = '#000';
        xc.globalAlpha = Math.min(1, ph);
        xc.fillText('🪄', wx, wy);
        xc.restore();
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.life -= 0.03;
        if (p.life <= 0) { sparkles.splice(i, 1); continue; }
        xc.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.life})`;
        xc.beginPath();
        for (let q = 0; q < 8; q++) {
          const rr = q % 2 ? p.s * 0.4 : p.s, a = q * Math.PI / 4;
          xc.lineTo(p.x + Math.cos(a) * rr, p.y - (1 - p.life) * S * 0.03 + Math.sin(a) * rr);
        }
        xc.closePath(); xc.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    const offResize = kit.onResize(root, render);
    W = root.clientWidth; H = root.clientHeight;
    showPage(0);
    raf = requestAnimationFrame(frame);
    return () => { t.clear(); cancelAnimationFrame(raf); offResize(); };
  },
};
