/* Bageriet: pick a recipe at the top (🥞 pancakes, 🧁 muffins, 🥤 smoothie, 🍪 cookies), or one comes at random.
 * Every recipe has the same short shape:
 *  1. Ingredients: a recipe card shows dashed slots; drag each ingredient in (or just tap it). Anywhere on the
 *     work area counts. Eggs crack open on the way in.
 *  2. Mix: stir round in the bowl with a finger (any movement counts), or hold the blender button.
 *  3. One signature action: pour pancakes and flip them (×3) / fill the muffin cups and bake / pour the smoothie
 *     and add a straw and a strawberry / stamp cookies with a cutter and bake.
 *  4. Eat it bite by bite, "Mmm!", confetti, and the next recipe.
 * The work area is a 700×700 "stage" square; everything inside is positioned in stage units (as % of the
 * square), so rotating just rescales it. Ingredients wait beside it (landscape) or above it (portrait).
 */
import { BAG, BOWL, WHISK, BLENDER, PAN, OVEN, PLATE, GLASS, STRAW, SHAPES, cookie, CUPS, tin, muffin, EGG_CRACK } from './art/bageri-art.js';

const ING = {
  mel: { name: 'Mel', svg: BAG('#f4ede1', 'MEL'), col: '#fffaf0' },
  sukker: { name: 'Sukker', svg: BAG('#dff0ff', 'SUKKER'), col: '#ffffff' },
  maelk: { name: 'Mælk', e: '🥛', col: '#f4f7ff' },
  aeg: { name: 'Æg', e: '🥚', col: '#ffc93c', egg: true },
  smoer: { name: 'Smør', e: '🧈', col: '#ffe48a' },
  choko: { name: 'Chokolade', e: '🍫', col: '#6b3a1f' },
  blaa: { name: 'Blåbær', e: '🫐', col: '#4a5bd8' },
  jord: { name: 'Jordbær', e: '🍓', col: '#ff4d6d' },
  banan: { name: 'Banan', e: '🍌', col: '#ffe680' },
  honning: { name: 'Honning', e: '🍯', col: '#f4a51c' },
};
const RECIPES = [
  { id: 'pande', name: 'Pandekager', e: '🥞', ing: ['mel', 'maelk', 'aeg', 'smoer'], batter: '#ffe3a1' },
  { id: 'muffin', name: 'Muffins', e: '🧁', ing: ['mel', 'sukker', 'aeg', 'smoer', 'blaa'], batter: '#ecc890', dots: '#4a5bd8' },
  { id: 'smoothie', name: 'Smoothie', e: '🥤', ing: ['banan', 'jord', 'blaa', 'maelk'], batter: '#ff8fb1', blender: true },
  { id: 'kager', name: 'Småkager', e: '🍪', ing: ['mel', 'sukker', 'smoer', 'aeg', 'choko'], batter: '#f3cf8e', dots: '#5a3018' },
];
const CUTTERS = ['hjerte', 'stjerne', 'cirkel', 'blomst'];
const CUTTER_NAME = { hjerte: 'Hjerte', stjerne: 'Stjerne', cirkel: 'Cirkel', blomst: 'Blomst' };
const SU = 700;   // stage units across

const CSS = `
.bg-stage { position:absolute; }
.bg-o { position:absolute; display:flex; align-items:center; justify-content:center; line-height:1; touch-action:none; }
.bg-o > svg, .bg-o > .in > svg { width:100%; height:100%; display:block; overflow:visible; }
.bg-o > .in { width:100%; height:100%; display:flex; align-items:center; justify-content:center; transition: transform .45s ease; }
.bg-o.mv { transition: left .45s ease, top .45s ease, opacity .45s, transform .45s; }
.bg-o.gone { opacity:0; pointer-events:none; }
.bg-hint { animation: bg-hint .9s ease-in-out infinite alternate; }
@keyframes bg-hint { from { transform:none; filter: drop-shadow(0 0 0 rgba(255,214,10,0)); }
  to { transform: scale(1.06); filter: drop-shadow(0 0 14em #ffd60a) drop-shadow(0 0 6em #fff); } }
.bg-pop { animation: bg-pop .4s ease backwards; }
@keyframes bg-pop { from { transform: scale(.2); opacity:0 } 70% { transform: scale(1.12) } to { transform:none; opacity:1 } }
.bg-wob { animation: bg-wob .45s ease; }
@keyframes bg-wob { 0%,100%{transform:none} 25%{transform:rotate(-8deg) scale(1.06)} 60%{transform:rotate(6deg)} }
.bg-o .eyes { transform-box: fill-box; transform-origin:center; animation: bg-blink 4s infinite; }
@keyframes bg-blink { 0%,94%,100% { transform:none } 97% { transform:scaleY(.1) } }
.bg-card { background:#fffdf5; border:7em solid #4a3b5c; border-radius:30em; box-shadow:0 10em 0 rgba(0,0,0,.12); gap:10em; padding:0 16em; }
.bg-slot { width:96em; height:96em; border-radius:50%; border:6em dashed rgba(74,59,92,.45); display:flex; align-items:center;
  justify-content:center; position:relative; flex:none; }
.bg-slot .ic { width:78%; height:78%; display:flex; align-items:center; justify-content:center; font-size:58em; opacity:.3; filter: grayscale(.6); }
.bg-slot .ic svg { width:100%; height:100%; }
.bg-slot.ic-svg .ic { font-size:1em; }
.bg-slot:not(.done) { animation: bg-slotp 1.2s ease-in-out infinite alternate; }
@keyframes bg-slotp { from { border-color: rgba(74,59,92,.3) } to { border-color: rgba(255,170,0,.95) } }
.bg-slot.done { border-style:solid; border-color:#06d6a0; background:#e6fff6; }
.bg-slot.done .ic { opacity:1; filter:none; }
.bg-slot.done::after { content:'✓'; position:absolute; right:-.15em; top:-.25em; font-size:44em; font-weight:900; color:#06a77d; }
.bg-piece { position:absolute; left:0; top:0; display:flex; align-items:center; justify-content:center; line-height:1;
  touch-action:none; will-change:transform; filter: drop-shadow(0 6px 0 rgba(0,0,0,.12)); }
.bg-piece svg { width:100%; height:100%; display:block; overflow:visible; }
.bg-piece.fly { transition: transform .33s ease-in, opacity .33s; }
.bg-piece.lift { filter: drop-shadow(0 16px 10px rgba(0,0,0,.25)); }
.bg-piece.idle { animation: bg-bob 1.6s ease-in-out infinite alternate; }
@keyframes bg-bob { from { margin-top:0 } to { margin-top:-8px } }
.bg-pick { position:absolute; top:12px; left:104px; right:12px; display:flex; justify-content:center; gap:10px; z-index:30; }
.bg-pick button { flex:1 1 0; max-width:116px; height:84px; border:0; border-radius:20px; font-size:52px; line-height:1;
  background:rgba(255,255,255,.75); box-shadow:0 4px 0 rgba(0,0,0,.1); transition: transform .15s; touch-action:none; padding:0; }
.bg-pick button.on { background:#fff; box-shadow:0 0 0 5px #ffd23f, 0 4px 0 rgba(0,0,0,.1); transform: scale(1.08); }
.bg-pick button.tap { animation: bg-wob .4s ease; }
.bg-ring { border-radius:50%; border:10em dashed rgba(255,255,255,.9); pointer-events:none; }
/* the oval stays put; the finger travels round it */
.bg-ring::after { content:'👆'; position:absolute; transform:translate(-50%,-15%); font-size:80em; line-height:1;
  animation: bg-orbit 2.2s linear infinite; }
@keyframes bg-orbit {
  0%,100% { left:50%; top:-4% } 12.5% { left:85%; top:14% } 25% { left:100%; top:50% } 37.5% { left:85%; top:86% }
  50% { left:50%; top:104% } 62.5% { left:15%; top:86% } 75% { left:0%; top:50% } 87.5% { left:15%; top:14% } }
.bg-whisk { pointer-events:none; transform-origin: 50% 90%; }
.bg-shake .jar-shake { animation: bg-shake .1s linear infinite alternate; transform-box: view-box; transform-origin: 120px 250px; }
@keyframes bg-shake { from { transform: rotate(-2deg) translateX(-2px) } to { transform: rotate(2deg) translateX(2px) } }
.bg-btn { border-radius:50%; background:#ffd23f; border:.12em solid #4a3b5c; font-size:56em; box-shadow:0 .1em 0 rgba(0,0,0,.2); }
.bg-btn.down { transform: translateY(.05em) scale(.94); }
.bg-cake { border-radius:50%; }
.bg-flip { animation: bg-flip .8s ease-in-out; }
@keyframes bg-flip { 0%{transform:none} 50%{transform: translateY(-190%) scaleY(-1) rotate(8deg)} 100%{transform:none} }
.bg-crack .shell-l { animation: bg-shl .5s ease forwards; transform-box: fill-box; transform-origin: 100% 100%; }
.bg-crack .shell-r { animation: bg-shr .5s ease forwards; transform-box: fill-box; transform-origin: 0% 100%; }
.bg-crack .yolk { animation: bg-yolk .55s .2s ease-in forwards; }
@keyframes bg-shl { to { transform: translate(-30px, -6px) rotate(-35deg) } }
@keyframes bg-shr { to { transform: translate(30px, -6px) rotate(35deg) } }
@keyframes bg-yolk { to { transform: translateY(120px); opacity:0 } }
.bg-cutter { border-radius:24em; background:rgba(255,255,255,.8); box-shadow:0 8em 0 rgba(0,0,0,.1); padding:14em; transition: transform .15s; }
.bg-cutter.on { background:#fff; box-shadow:0 0 0 10em #ffd23f; transform: scale(1.1); }
.bg-cutter svg path { fill:#ffd6e0; }
.bg-dough { border-radius:120em; background:#f3cf8e; border:8em solid #4a3b5c; box-shadow: inset 0 -24em 0 rgba(0,0,0,.08); }
.bg-stream { background: var(--c); border-radius: 20em; transform-origin: 50% 0; animation: bg-stream .9s ease forwards; pointer-events:none; }
@keyframes bg-stream { 0% { transform: scaleY(0) } 20%,75% { transform: scaleY(1) } 100% { transform: scaleY(0); transform-origin:50% 100% } }
.bg-bubble { border-radius:50%; border:5em solid rgba(160,110,40,.5); background:rgba(255,255,255,.35); pointer-events:none; }
.bg-steam { pointer-events:none; font-size:90em; animation: bg-steam 1.6s ease-out forwards; }
@keyframes bg-steam { from { opacity:0; transform:translateY(0) } 30% { opacity:.9 } to { opacity:0; transform:translateY(-1.2em) } }
`;

export default {
  id: 'bageri',
  title: 'Bageriet',
  icon: '🧁',
  color: '#ff8fab',
  edge: '#e2b07a',

  start(root, kit) {
    root.style.background = 'linear-gradient(#fff3d6 0%, #ffe7c2 60%, #f0c890 60%, #e2b07a 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const stage = document.createElement('div');
    stage.className = 'bg-stage';
    root.appendChild(stage);
    let W = 0, H = 0, SL = 0, ST = 0, SS = 1, portrait = false;

    /* ---------- recipe picker ---------- */
    const pick = document.createElement('div');
    pick.className = 'bg-pick';
    root.appendChild(pick);
    const btns = RECIPES.map(r => {
      const b = document.createElement('button');
      b.textContent = r.e;
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        kit.replay(b, 'tap');
        if (R === r && phase !== 'done') { kit.sfx.boing(); kit.say(r.name, { pitch: 1.25 }); return; }
        kit.sfx.fwip();
        begin(r);
      });
      pick.appendChild(b);
      return b;
    });

    /* ---------- stage helpers: everything in 700-unit stage coordinates ---------- */
    const P = v => (v / SU * 100) + '%';
    function obj(html, u, v, w, h, cls = '') {
      const el = document.createElement('div');
      el.className = 'bg-o ' + cls;
      el.innerHTML = html;
      const o = { el, u, v, w, h };
      place(o, u, v);
      el.style.width = P(w); el.style.height = P(h);
      stage.appendChild(el);
      return o;
    }
    function place(o, u, v) { o.u = u; o.v = v; o.el.style.left = P(u - o.w / 2); o.el.style.top = P(v - o.h / 2); }
    const toStage = (x, y) => [(x - SL) / SS * SU, (y - ST) / SS * SU];
    const toScreen = (u, v) => [SL + u / SU * SS, ST + v / SU * SS];
    const near = (o, u, v, r) => Math.hypot(o.u - u, o.v - v) < r;

    /* ---------- state ---------- */
    let R = null, run = 0, phase = '', pieces = [], z = 10, order = kit.shuffle(RECIPES.slice()), orderI = 0;
    const later = (fn, ms) => { const my = run; return t.later(() => { if (run === my) fn(); }, ms); };
    let raf = 0, tickFn = null, last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (tickFn) tickFn(dt, now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function clearAll() {
      run++;
      tickFn = null;
      stage.innerHTML = '';
      pieces.forEach(pc => pc.el.remove());
      pieces = [];
    }

    function begin(r) {
      clearAll();
      if (!r) { r = order[orderI++ % order.length]; if (orderI % order.length === 0) kit.shuffle(order); }
      R = r;
      btns.forEach((b, i) => b.classList.toggle('on', RECIPES[i] === r));
      kit.say(r.name, { pitch: 1.25 });
      ingredients();
    }

    /* ---------- loose pieces beside the stage (ingredients, straw…) ---------- */
    function makePieces(list) {
      // list: [{ html, isSvg, size (rel), target(): [u,v], land() }]
      pieces = list.map((d, i) => {
        const el = document.createElement('div');
        el.className = 'bg-piece bg-pop idle';
        el.innerHTML = d.html;
        el.style.animationDelay = `${i * 90}ms, 0s`;
        root.appendChild(el);
        const pc = { ...d, el, x: 0, y: 0, home: null, sz: 100, done: false, rot: kit.rand(-10, 10) };
        let dx = 0, dy = 0, sx = 0, sy = 0, moved = false;
        kit.draggable(el, {
          start(e) {
            if (pc.done) return false;
            el.classList.remove('fly', 'idle', 'bg-pop');
            el.classList.add('lift');
            el.style.zIndex = ++z;
            dx = pc.x - e.clientX; dy = pc.y - e.clientY; sx = e.clientX; sy = e.clientY; moved = false;
            kit.sfx.pickUp();
          },
          move(e) {
            if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12) moved = true;
            setPc(pc, e.clientX + dx, e.clientY + dy, 1.1, 0);
          },
          end(e) {
            el.classList.remove('lift');
            if (pc.done || !pieces.includes(pc)) return;
            const [u, v] = toStage(pc.x, pc.y);
            if (!moved || (u > -40 && u < SU + 40 && v > -40 && v < SU + 40)) accept(pc);
            else { el.classList.add('fly'); setPc(pc, pc.home.x, pc.home.y); kit.sfx.boing(); }
          },
        });
        return pc;
      });
      layoutPieces();
    }
    function setPc(pc, x, y, k = 1, rot = pc.rot) {
      pc.x = x; pc.y = y;
      const s = pc.sz * (pc.size || 1) * k;
      pc.el.style.width = s + 'px'; pc.el.style.height = s + 'px';
      if (!pc.isSvg) pc.el.style.fontSize = s * 0.82 + 'px';
      pc.el.style.transform = `translate(${x - s / 2}px, ${y - s / 2}px) rotate(${rot}deg)`;
    }
    function accept(pc) {
      pc.done = true;
      const [u, v] = pc.target();
      const [x, y] = toScreen(u, v);
      pc.el.classList.add('fly');
      pc.el.style.opacity = '.0';
      setPc(pc, x, y, 0.6, 0);
      t.later(() => pc.el.remove(), 360);
      later(() => pc.land(), 330);
    }
    function layoutPieces() {
      const loose = pieces.filter(pc => !pc.done);
      if (!loose.length) return;
      const top = pick.getBoundingClientRect().bottom + 10;
      if (portrait) {
        const zh = ST - top - 6, n = loose.length, cw = (W - 24) / n;
        loose.forEach((pc, i) => {
          pc.sz = Math.min(zh * 0.82, cw * 0.82, 130);
          pc.home = { x: 12 + cw * (i + 0.5), y: top + zh / 2 };
          if (!pc.el.classList.contains('lift')) setPc(pc, pc.home.x, pc.home.y);
        });
      } else {
        const zw = SL - 12, a = loose.filter((_, i) => i % 2 === 0), b = loose.filter((_, i) => i % 2 === 1);
        [[a, 6 + zw / 2], [b, SL + SS + zw / 2]].forEach(([list, cx]) => {
          const zh = (H - top - 20) / Math.max(1, list.length);
          list.forEach((pc, i) => {
            pc.sz = Math.min(zw * 0.8, zh * 0.8, 140);
            pc.home = { x: cx, y: top + zh * (i + 0.5) };
            if (!pc.el.classList.contains('lift')) setPc(pc, pc.home.x, pc.home.y);
          });
        });
      }
    }

    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      portrait = H > W;
      const top = pick.getBoundingClientRect().bottom - root.getBoundingClientRect().top + 10;
      if (portrait) {
        const zone = Math.min(170, H * 0.15);
        SS = Math.min(W - 24, H - top - zone - 40);
        SL = (W - SS) / 2; ST = top + zone + Math.max(0, (H - top - zone - 30 - SS) / 2);
      } else {
        SS = Math.min(H - top - 24, W * 0.62);
        SL = (W - SS) / 2; ST = top + Math.max(0, (H - top - 24 - SS) / 2);
      }
      Object.assign(stage.style, { left: SL + 'px', top: ST + 'px', width: SS + 'px', height: SS + 'px', fontSize: SS / SU + 'px' });
      layoutPieces();
    }

    /* small sound helpers */
    const nom = () => { kit.tone(320, { dur: 0.09, vol: 0.18, slide: 220 }); kit.tone(300, { at: 0.13, dur: 0.1, vol: 0.18, slide: 200 }); };
    const plopIn = () => { kit.sfx.plop(); };
    const crack = () => { kit.noise({ dur: 0.05, vol: 0.2, freq: 2600 }); kit.tone(900, { at: 0.03, dur: 0.06, vol: 0.08 }); };
    const ding = () => { kit.tone(1568, { dur: 1.2, vol: 0.2, attack: 0.002 }); kit.tone(3136, { dur: 0.4, vol: 0.05 }); };
    const stagePt = (u, v) => toScreen(u, v);
    function steam(u, v, n = 3) {
      for (let i = 0; i < n; i++) {
        later(() => { const s = obj('💨', u + kit.rand(-60, 60), v, 90, 90, 'bg-steam'); s.el.style.transform = 'rotate(-90deg)'; t.later(() => s.el.remove(), 1700); }, i * 260);
      }
    }

    /* ================= 1. INGREDIENTS ================= */
    let vessel = null;
    function ingredients() {
      phase = 'ingr';
      const r = R, n = r.ing.length;
      const w = n * 112 + 40;
      const card = obj('', 350, 100, w, 140, 'bg-card');
      const slots = {};
      r.ing.forEach(id => {
        const d = ING[id], s = document.createElement('div');
        s.className = 'bg-slot' + (d.svg ? ' ic-svg' : '');
        s.innerHTML = `<div class="ic">${d.svg || d.e}</div>`;
        card.el.appendChild(s);
        slots[id] = s;
      });
      vessel = r.blender ? makeBlender(350, 450) : makeBowl(350, 470);
      let got = 0;
      makePieces(kit.shuffle(r.ing.slice()).map(id => {
        const d = ING[id];
        return {
          html: d.svg || d.e, isSvg: !!d.svg, size: d.svg ? 1 : 0.9,
          target: () => [vessel.o.u, vessel.o.v - (r.blender ? 110 : 30)],
          land() {
            const add = () => {
              vessel.add(id);
              slots[id].classList.add('done');
              kit.replay(slots[id], 'bg-wob');
              kit.say(d.name, { pitch: 1.25 });
              const [x, y] = stagePt(vessel.o.u, vessel.o.v - 40);
              kit.burst(x, y, 12, 0.4);
              if (++got === n) later(() => { card.el.classList.add('mv', 'gone'); mix(); }, 900);
            };
            if (d.egg && !r.blender) {
              const eg = obj('🥚', 350, 330, 120, 120);
              eg.el.style.fontSize = '100em';
              kit.replay(eg.el, 'bg-wob');
              crack();
              later(() => { eg.el.style.fontSize = ''; eg.el.innerHTML = EGG_CRACK; eg.el.classList.add('bg-crack'); crack(); }, 350);
              later(() => { eg.el.classList.add('mv', 'gone'); plopIn(); add(); }, 900);
              later(() => eg.el.remove(), 1500);
            } else { plopIn(); add(); }
          },
        };
      }));
    }

    function makeBowl(u, v) {
      const o = obj(BOWL, u, v, 440, 275, 'bg-pop');
      const svg = o.el.querySelector('svg'), batter = svg.querySelector('.batter'), blobs = svg.querySelector('.blobs'),
        dots = svg.querySelector('.dots'), swirl = svg.querySelector('.swirl'), swirlR = svg.querySelector('.swirl-r');
      const NS = 'http://www.w3.org/2000/svg';
      let count = 0;
      return {
        o, kind: 'bowl',
        add(id) {
          count++;
          batter.setAttribute('opacity', 1);
          for (let i = 0; i < 4; i++) {
            const c = document.createElementNS(NS, 'ellipse');
            c.setAttribute('cx', 200 + kit.rand(-120, 120)); c.setAttribute('cy', 66 + kit.rand(-12, 14));
            c.setAttribute('rx', kit.rand(16, 34)); c.setAttribute('ry', kit.rand(6, 11));
            c.setAttribute('fill', ING[id].col);
            if (id === 'mel' || id === 'sukker' || id === 'maelk') c.setAttribute('opacity', 0.9);
            blobs.appendChild(c);
          }
          kit.replay(o.el, 'bg-wob');
        },
        setMix(p, ang) {
          blobs.setAttribute('opacity', Math.max(0, 1 - p * 1.3));
          batter.setAttribute('fill', mixCol('#f6efe3', R.batter, Math.min(1, p * 1.2)));
          swirl.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
          swirl.setAttribute('transform', 'translate(200 70)');
          swirlR.setAttribute('transform', `rotate(${ang})`);
          if (R.dots && !dots.childNodes.length && p > 0.4) {
            for (let i = 0; i < 9; i++) {
              const c = document.createElementNS(NS, 'circle');
              c.setAttribute('cx', 200 + kit.rand(-130, 130)); c.setAttribute('cy', 68 + kit.rand(-14, 16)); c.setAttribute('r', 6);
              c.setAttribute('fill', R.dots);
              dots.appendChild(c);
            }
          }
        },
        get count() { return count; },
      };
    }

    function makeBlender(u, v) {
      const o = obj(BLENDER, u, v, 240, 360, 'bg-pop');
      const jar = o.el.querySelector('.jar'), NS = 'http://www.w3.org/2000/svg';
      const bands = [];
      return {
        o, kind: 'blender',
        add(id) {
          const h = 48, y = 250 - (bands.length + 1) * h;
          const g = document.createElementNS(NS, 'g');
          g.innerHTML = `<rect x="0" y="${y}" width="240" height="${h + 2}" fill="${ING[id].col}"/>
            <text x="${80 + bands.length % 2 * 70}" y="${y + 38}" font-size="36" text-anchor="middle">${ING[id].e}</text>`;
          jar.appendChild(g);
          bands.push(g);
          kit.replay(o.el, 'bg-wob');
        },
        setMix(p) {
          bands.forEach(g => {
            g.querySelector('rect').setAttribute('fill', mixCol(g.querySelector('rect').dataset.c || (g.querySelector('rect').dataset.c = g.querySelector('rect').getAttribute('fill')), R.batter, p));
            g.querySelector('text').setAttribute('opacity', Math.max(0, 1 - p * 1.5));
          });
        },
      };
    }

    /* ================= 2. MIX ================= */
    function mix() {
      phase = 'mix';
      if (R.blender) return blend();
      const bowl = vessel;
      const ring = obj('', 350, 450, 300, 120, 'bg-ring');
      const whisk = obj(WHISK, 470, 330, 90, 280, 'bg-whisk bg-pop');
      let p = 0, ang = 0, dist = 0, lastP = null, sinceSnd = 0, done = false;
      const pad = obj('', 350, 400, 700, 600);
      pad.el.style.zIndex = 5;
      kit.draggable(pad.el, {
        start(e) { ring.el.classList.add('mv', 'gone'); lastP = toStage(e.clientX, e.clientY); move(e); },
        move,
        end() { lastP = null; },
      });
      function move(e) {
        if (done) return;
        const [u, v] = toStage(e.clientX, e.clientY);
        const wu = Math.max(170, Math.min(530, u)), wv = Math.max(340, Math.min(500, v));
        place(whisk, wu, wv - 110);
        whisk.el.style.transform = `rotate(${(wu - 350) / 9}deg)`;
        if (lastP) {
          const d = Math.hypot(u - lastP[0], v - lastP[1]);
          dist += d; sinceSnd += d; ang += d * 0.9;
          p = Math.min(1, dist / 1500);
          bowl.setMix(p, ang);
          if (sinceSnd > 120) { sinceSnd = 0; kit.tone(kit.rand(520, 700), { dur: 0.07, vol: 0.06, type: 'triangle' }); }
          if (p >= 1) finish();
        }
        lastP = [u, v];
      }
      function finish() {
        done = true;
        bowl.setMix(1, ang);
        kit.sfx.chime();
        const [x, y] = stagePt(350, 420);
        kit.burst(x, y, 30, 0.7);
        whisk.el.classList.add('mv', 'gone');
        pad.el.remove();
        later(signature, 1100);
      }
    }

    function blend() {
      const bl = vessel;
      const btn = obj('▶️', 350, 450 + 128, 92, 92, 'bg-btn bg-hint');
      let held = false, until = 0, time = 0, pulse = 0, done = false;
      kit.draggable(btn.el, {
        start() { held = true; until = performance.now() + 600; btn.el.classList.add('down'); btn.el.classList.remove('bg-hint'); },
        end() { held = false; btn.el.classList.remove('down'); },
      });
      tickFn = (dt, now) => {
        if (done) return;
        const on = held || now < until;
        bl.o.el.classList.toggle('bg-shake', on);
        if (!on) return;
        time += dt; pulse -= dt;
        if (pulse <= 0) { pulse = 0.11; const f = 150 + 30 * Math.sin(time * 9); kit.tone(f, { dur: 0.09, vol: 0.11, attack: 0.015 }); kit.tone(f * 2, { dur: 0.06, vol: 0.03, attack: 0.015 }); }
        bl.setMix(Math.min(1, time / 2.2));
        if (time >= 2.2) {
          done = true; tickFn = null;
          bl.o.el.classList.remove('bg-shake');
          kit.sfx.chime();
          const [x, y] = stagePt(350, 380);
          kit.burst(x, y, 30, 0.7);
          btn.el.classList.add('mv', 'gone');
          later(signature, 1000);
        }
      };
    }

    /* ================= 3. SIGNATURE ================= */
    function signature() {
      phase = 'sig';
      ({ pande: pancakes, muffin: muffins, smoothie, kager: cookies })[R.id]();
    }

    // drag a vessel (bowl/blender) onto something, or tap; returns a controller
    function pourable(o, home, onPour, onMove) {
      let busy = false, sx = 0, sy = 0, du = 0, dv = 0, moved = false;
      kit.draggable(o.el, {
        start(e) {
          if (busy) return false;
          o.el.classList.remove('mv');
          const [u, v] = toStage(e.clientX, e.clientY);
          du = o.u - u; dv = o.v - v; sx = e.clientX; sy = e.clientY; moved = false;
          o.el.style.zIndex = 8;
          kit.sfx.pickUp();
        },
        move(e) {
          if (Math.hypot(e.clientX - sx, e.clientY - sy) > 12) moved = true;
          const [u, v] = toStage(e.clientX, e.clientY);
          place(o, u + du, v + dv);
          if (onMove) onMove(o.u, o.v);
        },
        end() {
          if (!onPour(o.u, o.v, !moved)) { o.el.classList.add('mv'); place(o, home[0], home[1]); }
        },
      });
      return { set busy(b) { busy = b; } };
    }
    function tiltPour(o, u, v, col, dur, then) {
      o.el.classList.add('mv');
      place(o, u, v);
      const inner = o.el;
      later(() => {
        inner.style.transform = 'rotate(-38deg)';
        const s = obj('', u + o.w * 0.12, v + 20, 30, 150, 'bg-stream');
        s.el.style.setProperty('--c', col);
        kit.tone(300, { dur: dur / 1000, vol: 0.06, slide: 160, type: 'triangle' });
        later(() => { s.el.remove(); inner.style.transform = ''; then(); }, dur);
      }, 420);
    }

    /* --- 🥞 pour, bubble, flip; three pancakes on the plate --- */
    function pancakes() {
      stage.innerHTML = '';
      const pan = obj(PAN, 290, 480, 460, 220);
      const plate = obj(PLATE, 560, 215, 240, 65);
      const home = [150, 190];
      const bowl = obj(BOWL, home[0], home[1], 230, 144, 'bg-hint');
      bowl.el.querySelector('.batter').setAttribute('opacity', 1);
      bowl.el.querySelector('.batter').setAttribute('fill', R.batter);
      const PU = 290 - 230 + 170, PV = 480 - 110 + 108;   // pan middle in stage units
      let state = 'pour', cake = null, made = 0, bubbles = [];
      const stack = [];
      const ctl = pourable(bowl, home, (u, v, tap) => {
        if (state !== 'pour') return false;
        if (!tap && !(Math.hypot(u - PU, v - PV) < 260)) return false;
        pour();
        return true;
      });
      pan.el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (state === 'pour') { pour(); return; }
        if (state === 'ready') flip();
        else { kit.replay(pan.el, 'bg-wob'); kit.sfx.boing(); }
      });
      function pour() {
        state = 'pouring'; ctl.busy = true;
        bowl.el.classList.remove('bg-hint');
        tiltPour(bowl, PU - 40, PV - 170, R.batter, 900, () => {
          bowl.el.classList.add('mv'); place(bowl, home[0], home[1]); ctl.busy = false;
        });
        later(() => {
          cake = obj(`<svg viewBox="0 0 240 130"><ellipse cx="120" cy="65" rx="116" ry="61" fill="${R.batter}" stroke="#4a3b5c" stroke-width="6"/></svg>`, PU, PV, 240, 130, 'bg-cake bg-pop');
          cake.el.style.pointerEvents = 'none';
          state = 'cook';
          for (let i = 0; i < 7; i++) {
            later(() => {
              const b = obj('', PU + kit.rand(-80, 80), PV + kit.rand(-32, 32), 22, 22, 'bg-bubble bg-pop');
              bubbles.push(b);
              kit.tone(kit.rand(800, 1100), { dur: 0.05, vol: 0.05, slide: 600 });
            }, 400 + i * 280);
          }
          later(() => { state = 'ready'; pan.el.classList.add('bg-hint'); }, 400 + 7 * 280);
        }, 700);
      }
      function flip() {
        state = 'flip';
        pan.el.classList.remove('bg-hint');
        bubbles.forEach(b => b.el.remove()); bubbles = [];
        cake.el.classList.add('bg-flip');
        kit.sfx.fwip();
        later(() => { cake.el.querySelector('ellipse').setAttribute('fill', '#e9a548'); }, 400);
        later(() => { kit.sfx.splat(); kit.say(kit.pick(['Hop!', 'Vend!', 'Flot!']), { pitch: 1.3 }); }, 800);
        later(() => {
          // slide onto the plate
          cake.el.classList.remove('bg-flip');
          cake.el.classList.add('mv');
          cake.w = 190; cake.h = 100; cake.el.style.width = P(190); cake.el.style.height = P(100);
          place(cake, 560, 200 - made * 22);
          stack.push(cake);
          kit.sfx.plop();
          made++;
          if (made >= 3) later(() => eat(), 900);
          else later(() => { state = 'pour'; bowl.el.classList.add('bg-hint'); }, 600);
        }, 1400);
      }
    }

    /* --- 🧁 fill six cups, then bake --- */
    function muffins() {
      stage.innerHTML = '';
      const cups = [0, 0, 0, 0, 0, 0];
      const tinO = obj(tin(cups, R.dots), 350, 500, 560, 248);
      const home = [350, 170];
      const bowl = obj(BOWL, home[0], home[1], 260, 162, 'bg-hint');
      bowl.el.querySelector('.batter').setAttribute('opacity', 1);
      bowl.el.querySelector('.batter').setAttribute('fill', R.batter);
      const cupAt = i => [350 - 280 + CUPS[i][0] * 560 / 520, 500 - 124 + CUPS[i][1] * 248 / 230];
      let filled = 0, moving = false;
      function fill(i) {
        if (cups[i]) return;
        cups[i] = 1; filled++;
        tinO.el.innerHTML = tin(cups, R.dots);
        kit.tone(kit.scaleHz(3 + filled), { dur: 0.25, type: 'triangle', vol: 0.15 });
        kit.sfx.plop();
        const [x, y] = stagePt(...cupAt(i));
        kit.burst(x, y, 8, 0.35);
        if (filled === 6) { bowl.el.classList.remove('bg-hint'); later(() => { bowl.el.classList.add('mv', 'gone'); bake(cups, 'muffin'); }, 700); }
      }
      pourable(bowl, home, (u, v, tap) => {
        if (tap) { const i = cups.indexOf(0); if (i >= 0) fill(i); }
        return false;
      }, (u, v) => {
        for (let i = 0; i < 6; i++) { const [cu, cv] = cupAt(i); if (Math.hypot(u - cu, v + 60 - cv) < 75) fill(i); }
      });
      tinO.el.addEventListener('pointerdown', e => {
        e.preventDefault();
        const [u, v] = toStage(e.clientX, e.clientY);
        let best = -1, bd = 1e9;
        for (let i = 0; i < 6; i++) { if (cups[i]) continue; const [cu, cv] = cupAt(i); const d = Math.hypot(u - cu, v - cv); if (d < bd) { bd = d; best = i; } }
        if (best >= 0) fill(best);
      });
    }

    /* --- 🍪 stamp cookies with a cutter, then bake --- */
    function cookies() {
      stage.innerHTML = '';
      let cut = 0;
      const cutters = CUTTERS.map((c, i) => {
        const o = obj(`<svg viewBox="0 0 100 100"><path d="${SHAPES[c]}" stroke="#4a3b5c" stroke-width="7" stroke-linejoin="round"/></svg>`, 350 + (i - 1.5) * 140, 110, 112, 112, 'bg-cutter' + (i === 0 ? ' on' : ''));
        o.el.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          cut = i;
          cutters.forEach((x, j) => x.el.classList.toggle('on', j === i));
          kit.replay(o.el.firstElementChild, 'bg-wob');
          kit.sfx.blip(5 + i);
          kit.say(CUTTER_NAME[c], { pitch: 1.25 });
        });
        return o;
      });
      const dough = obj('', 350, 450, 600, 380, 'bg-dough bg-hint');
      const made = [];
      dough.el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (made.length >= 6) return;
        dough.el.classList.remove('bg-hint');
        let [u, v] = toStage(e.clientX, e.clientY);
        u = Math.max(110, Math.min(590, u)); v = Math.max(320, Math.min(580, v));
        const shape = CUTTERS[cut];
        const ck = obj(cookie(shape, '#f6dcae', true), u, v, 110, 110, 'bg-pop');
        ck.el.style.pointerEvents = 'none';
        made.push({ shape, ck });
        kit.tone(kit.scaleHz(3 + made.length), { dur: 0.2, type: 'triangle', vol: 0.14 });
        kit.noise({ dur: 0.04, vol: 0.1, freq: 1500 });
        if (made.length === 6) later(() => { cutters.forEach(x => x.el.classList.add('mv', 'gone')); lastShapes = made.map(m => m.shape); bake(lastShapes, 'cookie'); }, 900);
      });
    }

    /* --- shared: into the oven, tick-tock, ding --- */
    function bake(what, kind) {
      stage.innerHTML = '';
      const oven = obj(OVEN, 460, 430, 340, 360);
      const trayHtml = baked => kind === 'muffin' ? tin(what.map(() => baked ? 2 : 1), R.dots)
        : `<svg viewBox="0 0 520 230" overflow="visible"><rect x="6" y="20" width="508" height="200" rx="26" fill="#c0c6d8" stroke="#4a3b5c" stroke-width="7"/>
           ${what.map((s, i) => `<g transform="translate(${30 + (i % 3) * 160} ${i < 3 ? 30 : 118}) scale(.95)">${cookie(s, baked ? '#e3a35a' : '#f6dcae', true).replace(/<\/?svg[^>]*>/g, '')}</g>`).join('')}</svg>`;
      const home = [150, 560];
      const tray = obj(trayHtml(false), home[0], home[1], 250, 110, 'bg-hint');
      let state = 'in';
      const go = () => {
        if (state !== 'in') return;
        state = 'baking';
        tray.el.classList.remove('bg-hint');
        tray.el.classList.add('mv');
        place(tray, 460, 450);
        later(() => { tray.el.style.opacity = 0; kit.sfx.snap(); }, 400);
        const glow = oven.el.querySelector('.glow');
        let n = 0;
        const tick = () => {
          if (n >= 6) return;
          glow.setAttribute('opacity', n % 2 ? 0.5 : 0.8);
          kit.tone(n % 2 ? 1300 : 1100, { dur: 0.05, vol: 0.06 });
          kit.replay(oven.el, 'bg-wob');
          n++;
          later(tick, 500);
        };
        later(tick, 600);
        later(() => {
          ding();
          glow.setAttribute('opacity', 0);
          kit.say('Ding!', { pitch: 1.3 });
          tray.el.innerHTML = trayHtml(true);
          tray.el.style.opacity = 1;
          tray.w = 520; tray.h = 230;
          tray.el.style.width = P(520); tray.el.style.height = P(230);
          place(tray, 350, 470);
          steam(350, 380);
          oven.el.classList.add('mv', 'gone');
        }, 600 + 6 * 500 + 200);
        later(() => eat(), 600 + 6 * 500 + 2000);
      };
      pourable(tray, home, (u, v, tap) => { if (tap || Math.hypot(u - 460, v - 430) < 220) { go(); return state !== 'in'; } return false; });
      oven.el.addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'in') go(); else kit.sfx.boing(); });
    }

    /* --- 🥤 pour into the glass, add a straw and a strawberry --- */
    function smoothie() {
      const bl = vessel;
      bl.o.el.classList.add('mv');
      const home = [170, 400];
      place(bl.o, home[0], home[1]);
      bl.o.el.classList.add('bg-hint');
      const glass = obj(GLASS(R.batter), 480, 470, 190, 275);
      const fillR = glass.el.querySelector('.fill');
      let state = 'pour';
      const go = () => {
        if (state !== 'pour') return;
        state = 'pouring';
        bl.o.el.classList.remove('bg-hint');
        tiltPour(bl.o, 400, 230, R.batter, 1100, () => { bl.o.el.classList.add('mv', 'gone'); });
        later(() => { fillR.style.transition = 'y 1s ease'; fillR.setAttribute('y', 70); glass.el.querySelector('.froth').setAttribute('opacity', 1); glass.el.querySelector('.froth').setAttribute('transform', 'translate(0 72)'); }, 500);
        later(decorate, 1800);
      };
      pourable(bl.o, home, (u, v, tap) => { if (tap || Math.hypot(u - 480, v - 470) < 240) { go(); return true; } return false; });
      glass.el.addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'pour') go(); });
      function decorate() {
        state = 'decor';
        const gStraw = obj(STRAW, 530, 330, 70, 175);
        gStraw.el.style.opacity = 0.35;
        const gBerry = obj('🍓', 405, 345, 80, 80);
        gBerry.el.style.fontSize = '66em'; gBerry.el.style.opacity = 0.35; gBerry.el.style.filter = 'grayscale(.6)';
        let n = 0;
        const done1 = g => {
          g.el.style.opacity = 1; g.el.style.filter = ''; kit.replay(g.el, 'bg-pop'); kit.sfx.snap();
          const [x, y] = stagePt(g.u, g.v); kit.burst(x, y, 12, 0.4);
          if (++n === 2) later(eat, 900);
        };
        makePieces([
          { html: STRAW, isSvg: true, target: () => [530, 330], land() { done1(gStraw); kit.say('Sugerør!', { pitch: 1.25 }); } },
          { html: '🍓', target: () => [405, 345], land() { done1(gBerry); kit.say('Jordbær!', { pitch: 1.25 }); } },
        ]);
        glassObj = glass;
      }
    }
    let glassObj = null, lastShapes = [];

    /* ================= 4. EAT ================= */
    function eat() {
      phase = 'eat';
      const keepGlass = R.id === 'smoothie';
      let items = [];
      if (!keepGlass) {
        stage.innerHTML = '';
        obj(PLATE, 350, 520, 600, 160);
      }
      if (R.id === 'pande') {
        for (let i = 0; i < 3; i++) items.push(obj(`<svg viewBox="0 0 240 130"><ellipse cx="120" cy="70" rx="116" ry="56" fill="#e9a548" stroke="#4a3b5c" stroke-width="6"/><ellipse cx="120" cy="60" rx="96" ry="38" fill="#f5c56b"/></svg>`, 350, 490 - i * 34, 340, 170));
        items.push(obj('🍓', 300, 400, 80, 80)); items.push(obj('🍓', 400, 404, 80, 80));
        items.slice(-2).forEach(o => { o.el.style.fontSize = '64em'; });
      } else if (R.id === 'muffin') {
        [[230, 470], [350, 470], [470, 470], [290, 400], [410, 400], [350, 330]].reverse().forEach(([u, v], i) => items.unshift(obj(muffin(i, R.dots), u, v, 140, 140)));
      } else if (R.id === 'kager') {
        const pos = [[220, 500], [350, 510], [480, 500], [270, 430], [430, 430], [350, 370]];
        pos.forEach(([u, v], i) => items.push(obj(cookie(lastShapes[i] || CUTTERS[i % 4], '#e3a35a', true), u, v, 130, 130)));
      } else {
        // smoothie: four sips
        const fillR = glassObj.el.querySelector('.fill');
        items = [0, 1, 2, 3].map(() => ({ sip: true, fillR, el: null }));
      }
      items.forEach(o => { if (o.el) { o.el.classList.add('bg-pop'); o.el.style.pointerEvents = 'none'; } });
      const hint = obj('', 350, 450, 560, 400);
      hint.el.style.zIndex = 6;
      later(() => { kit.say('Spis!', { pitch: 1.25 }); }, 300);
      let left = items.length;
      hint.el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (left <= 0) return;
        const it = items[--left];
        if (it.sip) {
          it.fillR.style.transition = 'y .4s ease';
          // sips are taken from the end of the list, so count down from the top: 115, 160, 205, then empty
          it.fillR.setAttribute('y', left === 0 ? 260 : 70 + (items.length - left) * 45);
          glassObj.el.querySelector('.froth').setAttribute('opacity', 0);
          kit.sfx.squeak(); kit.tone(500, { dur: 0.25, vol: 0.1, slide: 900, type: 'triangle' });
        } else {
          nom();
          const [x, y] = stagePt(it.u, it.v);
          kit.burst(x, y, 10, 0.35);
          it.el.classList.add('mv', 'gone');
          it.el.style.transform = 'scale(.3)';
        }
        if (left === 0) {
          phase = 'done';
          later(() => {
            kit.sfx.fanfare(); kit.say('Mmm!', { pitch: 1.3 });
            const [x, y] = stagePt(350, 400);
            kit.burst(x, y, 90, 1.1);
          }, 450);
          later(() => begin(), 3600);
        }
      });
    }

    function mixCol(a, b, k) {
      const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
      const A = p(a), B = p(b);
      return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * k).toString(16).padStart(2, '0')).join('');
    }

    const offResize = kit.onResize(root, layout);
    layout();
    begin();
    return () => { cancelAnimationFrame(raf); t.clear(); offResize(); };
  },
};
