/* Køkkenet: three kitchen stations, switched with the big buttons at the top.
 *  🍲 Suppe: drag vegetables into the pot (the soup changes colour), then stir round with a finger –
 *     bubbles, blub-blub, and after a few turns the soup is done: steam and confetti.
 *  🍕 Pizza: drag toppings onto the pizza (cheese melts into blobs), then drag the pizza into the oven
 *     (or tap the oven). Tick-tock, ding! – out comes a golden pizza. Tap it to eat it bite by bite.
 *  🎂 Kage: decorate a cake with berries and sweets and put candles on it. Tap a flame to blow it out;
 *     when every candle is out: hurra! Tap a blown-out candle to light it again, tap the cake for new icing.
 *  🔄 starts the current station over.
 */
import { POT, LADLE, PIZZA, OVEN, CAKE, candle, ART_CSS } from './art/koekken-art.js';

// [emoji, spoken name, soup colour]
const STATIONS = [
  { id: 'suppe', icon: '🍲', say: 'Suppe!', items: [
    ['🥕', 'Gulerod', '#ff9a3c'], ['🍅', 'Tomat', '#ff5a3c'], ['🥔', 'Kartoffel', '#e8c27a'], ['🧅', 'Løg', '#f2dcb0'],
    ['🥦', 'Broccoli', '#5fbf4a'], ['🌽', 'Majs', '#ffd23f'], ['🍄', 'Svamp', '#c9a27e'], ['🫑', 'Peberfrugt', '#4fb83a'],
    ['🧄', 'Hvidløg', '#f4ead8'], ['🐟', 'Fisk', '#9ccbe8'], ['🍗', 'Kylling', '#e3a05b'], ['🥬', 'Salat', '#7fd36a']] },
  { id: 'pizza', icon: '🍕', say: 'Pizza!', items: [
    ['🧀', 'Ost'], ['🍅', 'Tomat'], ['🍄', 'Svamp'], ['🫒', 'Oliven'], ['🌶️', 'Chili'], ['🍍', 'Ananas'],
    ['🥓', 'Bacon'], ['🫑', 'Peberfrugt'], ['🍖', 'Kød'], ['🐟', 'Fisk'], ['🌽', 'Majs'], ['🥦', 'Broccoli']] },
  { id: 'kage', icon: '🎂', say: 'Kage!', items: [
    ['🕯️', 'Lys'], ['🍓', 'Jordbær'], ['🍒', 'Kirsebær'], ['🫐', 'Blåbær'], ['🍫', 'Chokolade'], ['🍬', 'Slik'],
    ['🍭', 'Slikkepind'], ['🍪', 'Småkage'], ['🌸', 'Blomst'], ['⭐', 'Stjerne'], ['🥝', 'Kiwi'], ['🍌', 'Banan']] },
];
const FROSTINGS = [['#ff8fc8', '#ffd59e'], ['#8fd3ff', '#fff1c9'], ['#c8a2ff', '#ffd59e'], ['#7a4a2b', '#c98a4b'], ['#ffffff', '#ffb3c7'], ['#9be7a8', '#fff1c9']];
const CANDLE_COLORS = ['#ff4d6d', '#3a86ff', '#ffd23f', '#2ec4b6', '#8338ec', '#ff8a00'];

const CSS = ART_CSS + `
.kk-work { position:absolute; display:flex; align-items:center; justify-content:center; gap:3vmin; }
.kk-tabs { position:absolute; z-index:20; top: calc(env(safe-area-inset-top) + 14px); left:50%; transform:translateX(-50%); display:flex; gap:2vmin; }
.kk-tab { width:max(64px, 9.5vmin); height:max(64px, 9.5vmin); border:none; border-radius:50%; padding:0; line-height:1;
  font-size:max(34px, 5.5vmin); background:rgba(255,255,255,.6); box-shadow:0 4px 0 rgba(0,0,0,.1); opacity:.7; transition: transform .15s, opacity .15s; }
.kk-tab.on { opacity:1; background:#ffd23f; transform: scale(1.1); }
.kk-tab.again { margin-left:3vmin; background:rgba(255,255,255,.85); opacity:1; }
.kk-tab:active { transform: scale(.92); }
.kk-tray { position:absolute; z-index:10; display:grid; gap:1.2vmin; padding:1.6vmin; background:rgba(255,255,255,.72);
  border-radius:3vmin; box-shadow:0 1vmin 0 rgba(0,0,0,.08); }
.kk-src { display:flex; align-items:center; justify-content:center; border-radius:2vmin; background:#fff;
  box-shadow:0 .5vmin 0 rgba(0,0,0,.08); touch-action:none; line-height:1; }
.kk-drag { position:absolute; left:0; top:0; z-index:60; line-height:1; pointer-events:none;
  filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.kk-drag.poof { transition: transform .3s ease-in, opacity .3s; opacity:0; }
.kk-box { position:relative; flex:none; touch-action:none; }
.kk-box.wiggle { animation: kk-wiggle .45s ease; }
@keyframes kk-wiggle { 0%,100%{transform:none} 25%{transform:rotate(-3deg) scale(1.03)} 60%{transform:rotate(2deg)} }
/* soup */
.kk-float { position:absolute; left:14.5%; top:22.8%; width:71%; height:17.8%; border-radius:50%; overflow:hidden; pointer-events:none; }
.kk-in { position:absolute; line-height:1; transform: translate(-50%, -60%); }
.kk-in span { display:inline-block; animation: kk-bob 1.6s ease-in-out infinite alternate; }
.kk-in.drop span { animation: kk-plunge .5s ease-out, kk-bob 1.6s .5s ease-in-out infinite alternate; }
.kk-in.out { transition: opacity .6s, transform .6s; opacity:0; transform: translate(-50%, 20%) scale(.6); }
@keyframes kk-bob { from { transform: translateY(-6%) rotate(-8deg) } to { transform: translateY(6%) rotate(8deg) } }
@keyframes kk-plunge { 0% { transform: translateY(-120%) scale(1.2) } 60% { transform: translateY(15%) } 100% { transform:none } }
.kk-bub { position:absolute; border-radius:50%; border:.5vmin solid rgba(255,255,255,.9); background:rgba(255,255,255,.25);
  transform: translate(-50%, -50%) scale(.2); animation: kk-bub .8s ease-out forwards; }
@keyframes kk-bub { 60% { transform: translate(-50%, -80%) scale(1); opacity:1 } 100% { transform: translate(-50%, -90%) scale(1.3); opacity:0 } }
.kk-ladle { position:absolute; width:15%; height:72.2%; transform-origin:50% 88.5%; pointer-events:none; transition: left .25s, top .25s, transform .25s; }
.kk-box.stirring .kk-ladle { transition:none; }
.kk-steamz { position:absolute; left:20%; width:60%; top:-14%; height:34%; pointer-events:none; opacity:0; transition: opacity .8s; }
.kk-box.hot .kk-steamz, .kk-pizzabox.hot .kk-steamz { opacity:1; }
.kk-wisp { position:absolute; bottom:0; width:22%; height:70%; border-radius:50%;
  background: radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,0)); animation: kk-steam 2.2s ease-in infinite; }
@keyframes kk-steam { 0% { transform: translateY(20%) scale(.5); opacity:0 } 30% { opacity:1 } 100% { transform: translateY(-70%) scale(1.3); opacity:0 } }
/* pizza */
.kk-pizzabox { transition: transform .6s cubic-bezier(.5,0,.3,1), opacity .3s; }
.kk-pizzabox.lift { transition:none; filter: drop-shadow(0 2vmin 1.5vmin rgba(0,0,0,.25)); }
.kk-pizzabox.baked .kk-dough { fill:#e3a253; }
.kk-pizzabox.baked .kk-sauce { fill:#cf3f22; }
.kk-pizzabox.baked .kk-cheese path { fill:#ffc53d; }
.kk-pizzabox.baked .kk-spots { opacity:1; }
.kk-pizzabox .kk-tops text, .kk-cake .kk-deco text { animation: kk-pop .35s ease; transform-origin:center; }
@keyframes kk-pop { 0% { transform: scale(1.5) } 60% { transform: scale(.9) } 100% { transform:none } }
.kk-oven.ready { animation: kk-ready 1s ease-in-out infinite; }
@keyframes kk-ready { 0%,100% { transform:none; filter:none } 50% { transform: scale(1.04); filter: drop-shadow(0 0 2vmin #ffd23f) } }
.kk-oven.on .kk-glow { animation: kk-glow .6s ease-in-out infinite alternate; }
.kk-oven.on .kk-minipz, .kk-oven.on .kk-heat { opacity:1; }
.kk-oven.on .kk-heat { animation: kk-heat .5s ease-in-out infinite alternate; }
@keyframes kk-glow { from { opacity:.35 } to { opacity:.8 } }
@keyframes kk-heat { from { transform: translateY(0) } to { transform: translateY(-6%) } }
/* cake */
.kk-cake .kk-sponge, .kk-cake .kk-frost { transition: fill .4s; }
`;

const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const NS = 'http://www.w3.org/2000/svg';
function svgPoint(svg, x, y) {
  const p = svg.createSVGPoint(); p.x = x; p.y = y;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
function svgEmoji(g, emoji, x, y, size, rot = 0) {
  // the group carries position and tilt (view-box, so the art's fill-box rule doesn't shift it);
  // the text inside gets the pop animation around its own centre
  const w = document.createElementNS(NS, 'g');
  w.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
  w.style.transformBox = 'view-box';
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('font-size', size);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('dominant-baseline', 'central');
  t.textContent = emoji;
  w.appendChild(t);
  g.appendChild(w);
  return w;
}
const inside = (r, x, y, pad = 0) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;

export default {
  id: 'koekken',
  title: 'Køkkenet',
  icon: '🍳',
  color: '#e85d04',
  edge: '#f3e2c7',

  start(root, kit) {
    root.style.background = 'linear-gradient(#fff6e8 0 62%, #f3e2c7 62% 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const work = document.createElement('div');
    work.className = 'kk-work';
    const tabs = document.createElement('div');
    tabs.className = 'kk-tabs';
    const tray = document.createElement('div');
    tray.className = 'kk-tray';
    root.append(work, tray, tabs);

    let st = null, stIdx = 0, cell = 80, W = 0, H = 0;
    const talk = (el, ms = 700) => { el.classList.add('kk-talk'); t.later(() => el.classList.remove('kk-talk'), ms); };

    const tabBtns = STATIONS.map((s, i) => {
      const b = document.createElement('button');
      b.className = 'kk-tab';
      b.textContent = s.icon;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (i !== stIdx) { kit.sfx.blip(); open(i); kit.say(s.say); } });
      tabs.appendChild(b);
      return b;
    });
    const again = document.createElement('button');
    again.className = 'kk-tab again';
    again.textContent = '🔄';
    again.addEventListener('pointerdown', e => { e.preventDefault(); kit.sfx.fwip(); st && st.reset(); });
    tabs.appendChild(again);

    /* ---------- tray: drag a copy of an item out ---------- */
    let srcs = [];
    function fillTray() {
      tray.innerHTML = '';
      srcs = STATIONS[stIdx].items.map(item => {
        const s = document.createElement('div');
        s.className = 'kk-src';
        s.textContent = item[0];
        tray.appendChild(s);
        let el = null;
        const at = e => { el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -60%)`; };
        kit.draggable(s, {
          start(e) {
            el = document.createElement('div');
            el.className = 'kk-drag';
            el.textContent = item[0];
            el.style.fontSize = cell * 0.95 + 'px';
            root.appendChild(el);
            at(e);
            kit.sfx.pickUp();
          },
          move: at,
          end(e) {
            const ok = st && st.drop(item, e.clientX, e.clientY);
            if (ok) el.remove();
            else { const d = el; d.classList.add('poof'); d.style.transform += ' scale(0)'; kit.sfx.whoosh(); setTimeout(() => d.remove(), 320); }
            el = null;
          },
        });
        return s;
      });
      sizeTray();
    }
    function sizeTray() {
      srcs.forEach(s => { s.style.width = s.style.height = cell + 'px'; s.style.fontSize = cell * 0.7 + 'px'; });
    }

    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const portrait = H > W, top = Math.max(64, Math.min(W, H) * 0.095) + 24;
      let wr;
      if (portrait) {
        cell = Math.min((W * 0.92 - 70) / 6, H * 0.075);
        tray.style.gridTemplateColumns = 'repeat(6, 1fr)';
        Object.assign(tray.style, { left: '50%', right: 'auto', top: 'auto', bottom: '2.5vh', transform: 'translateX(-50%)' });
        const th = 2 * cell + Math.min(W, H) * 0.06 + H * 0.025;
        wr = { left: 0, top, width: W, height: H - top - th };
      } else {
        cell = Math.min(H * 0.12, W * 0.075);
        tray.style.gridTemplateColumns = 'repeat(2, 1fr)';
        Object.assign(tray.style, { left: 'auto', right: '2.5vw', top: '55%', bottom: 'auto', transform: 'translateY(-50%)' });
        const tw = 2 * cell + Math.min(W, H) * 0.06 + W * 0.025;
        wr = { left: 0, top: top * 0.6, width: W - tw, height: H - top * 0.6 };
      }
      sizeTray();
      Object.assign(work.style, { left: wr.left + 'px', top: wr.top + 'px', width: wr.width + 'px', height: wr.height + 'px' });
      if (st) st.layout(wr.width, wr.height);
    }

    function open(i) {
      if (st) st.stop();
      t.clear();
      stIdx = i;
      tabBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      work.innerHTML = '';
      st = [soup, pizza, cake][i]();
      fillTray();
      layout();
    }

    /* ---------- 🍲 soup ---------- */
    function soup() {
      const box = document.createElement('div');
      box.className = 'kk-box kk-potbox';
      box.innerHTML = POT + `<div class="kk-float"></div><div class="kk-ladle">${LADLE}</div>
        <div class="kk-steamz">${[0, 1, 2].map(i => `<div class="kk-wisp" style="left:${10 + i * 30}%; animation-delay:${-i * 0.7}s"></div>`).join('')}</div>`;
      work.appendChild(box);
      const float = box.querySelector('.kk-float'), ladle = box.querySelector('.kk-ladle'), soupEl = box.querySelector('.kk-soup');
      const WATER = '#bfe6ff';
      let colour = WATER, ins = [], stir = 0, sinceBlub = 0, done = false, lastA = null, px = 400;

      const placeIn = it => {
        it.el.style.left = 50 + Math.cos(it.a) * it.r * 42 + '%';
        it.el.style.top = 52 + Math.sin(it.a) * it.r * 34 + '%';
      };
      const setLadle = (u, v) => {
        const x = 14.5 + (0.5 + u * 0.5) * 71, y = 22.8 + (0.5 + v * 0.5) * 17.8;
        ladle.style.left = x - 7.5 + '%';
        ladle.style.top = y - 72.2 * 0.885 + '%';
        ladle.style.transform = `rotate(${16 + u * 14}deg)`;
      };
      setLadle(0.62, -0.2);

      function bubble() {
        const b = document.createElement('div');
        b.className = 'kk-bub';
        const s = px * kit.rand(0.025, 0.05);
        Object.assign(b.style, { width: s + 'px', height: s + 'px', left: kit.rand(15, 85) + '%', top: kit.rand(35, 80) + '%' });
        float.appendChild(b);
        setTimeout(() => b.remove(), 850);
      }
      const blub = () => kit.tone(kit.rand(170, 260), { dur: 0.16, vol: 0.22, slide: kit.rand(380, 520) });

      const stirMove = e => {
          const r = float.getBoundingClientRect();
          let u = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), v = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          const d = Math.hypot(u, v);
          if (d > 0.8) { u *= 0.8 / d; v *= 0.8 / d; }
          setLadle(u, v);
          if (d < 0.2) return;
          const a = Math.atan2(v, u);
          if (lastA !== null) {
            let da = a - lastA;
            if (da > Math.PI) da -= 2 * Math.PI;
            if (da < -Math.PI) da += 2 * Math.PI;
            stir += Math.abs(da); sinceBlub += Math.abs(da);
            ins.forEach(it => { it.a += da * 0.8; placeIn(it); });
            if (sinceBlub > 0.9) { sinceBlub = 0; blub(); bubble(); bubble(); }
            if (!done && ins.length >= 3 && stir > 4 * Math.PI) finish();
          }
          lastA = a;
      };
      kit.draggable(box, {
        start(e) { box.classList.add('stirring'); lastA = null; stirMove(e); },
        move: stirMove,
        end() { box.classList.remove('stirring'); setLadle(0.62, -0.2); },
      });

      function finish() {
        done = true;
        box.classList.add('hot');
        kit.sfx.fanfare();
        const r = box.getBoundingClientRect();
        kit.burst(r.left + r.width / 2, r.top + r.height * 0.3, 90, 1.2);
        talk(box, 1600);
        kit.say('Mmm! Suppe!', { pitch: 1.3 });
        t.later(empty, 5000);
      }
      function empty() {
        ins.forEach(it => { it.el.classList.add('out'); setTimeout(() => it.el.remove(), 650); });
        ins = []; stir = 0; done = false; colour = WATER;
        soupEl.setAttribute('fill', WATER);
        box.classList.remove('hot');
      }

      return {
        layout(ww, wh) {
          const w = Math.min(ww * 0.86, wh * 0.86 * 400 / 360);
          px = w;
          Object.assign(box.style, { width: w + 'px', height: w * 360 / 400 + 'px', fontSize: w * 0.085 + 'px' });
        },
        drop(item, x, y) {
          if (!inside(box.getBoundingClientRect(), x, y, cell * 0.4)) return false;
          const it = { a: kit.rand(0, 6.28), r: kit.rand(0.15, 0.85), el: document.createElement('div') };
          it.el.className = 'kk-in drop';
          it.el.innerHTML = `<span style="animation-delay:0s, ${-kit.rand(0, 1.6)}s">${item[0]}</span>`;
          placeIn(it);
          float.appendChild(it.el);
          ins.push(it);
          if (ins.length > 10) { const o = ins.shift(); o.el.classList.add('out'); setTimeout(() => o.el.remove(), 650); }
          colour = mix(colour, item[2], colour === WATER ? 0.6 : 0.35);
          soupEl.setAttribute('fill', colour);
          kit.sfx.plop();
          kit.noise({ dur: 0.25, vol: 0.18, freq: 900, q: 0.6, sweep: 300 });
          for (let i = 0; i < 4; i++) bubble();
          kit.replay(box, 'wiggle');
          talk(box);
          t.later(() => kit.say(item[1] + '!', { pitch: 1.25 }), 150);
          if (done) { t.clear(); empty(); }
          return true;
        },
        reset() { empty(); },
        stop() {},
      };
    }

    /* ---------- 🍕 pizza ---------- */
    function pizza() {
      const pbox = document.createElement('div');
      pbox.className = 'kk-box kk-pizzabox';
      pbox.innerHTML = PIZZA + `<div class="kk-steamz">${[0, 1, 2].map(i => `<div class="kk-wisp" style="left:${10 + i * 30}%; animation-delay:${-i * 0.7}s"></div>`).join('')}</div>`;
      const oven = document.createElement('div');
      oven.className = 'kk-box kk-oven';
      oven.innerHTML = OVEN;
      work.append(pbox, oven);
      const svg = pbox.querySelector('svg'), tops = svg.querySelector('.kk-tops'), cheese = svg.querySelector('.kk-cheese'), bites = svg.querySelector('.kk-bites');
      let state = 'raw', n = 0, nb = 0;

      const ready = () => oven.classList.toggle('ready', state === 'raw' && n >= 2);

      // drag the whole pizza into the oven
      let ox = 0, oy = 0;
      kit.draggable(pbox, {
        start(e) {
          if (state === 'baked') { bite(); return false; }
          if (state !== 'raw') return false;
          if (n === 0) { kit.replay(pbox, 'wiggle'); kit.sfx.boing(); return false; }
          ox = e.clientX; oy = e.clientY;
          pbox.classList.add('lift');
          kit.sfx.pickUp();
        },
        move(e) { pbox.style.transform = `translate(${e.clientX - ox}px, ${e.clientY - oy}px) scale(1.04)`; },
        end(e) {
          pbox.classList.remove('lift');
          if (inside(oven.getBoundingClientRect(), e.clientX, e.clientY, cell * 0.5)) bake();
          else { pbox.style.transform = ''; kit.sfx.boing(); }
        },
      });
      oven.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (state === 'raw' && n > 0) bake();
        else { kit.replay(oven, 'wiggle'); kit.sfx.boing(); }
      });

      function bake() {
        state = 'baking';
        ready();
        const a = pbox.getBoundingClientRect(), b = oven.getBoundingClientRect();
        const cur = new DOMMatrix(getComputedStyle(pbox).transform === 'none' ? undefined : getComputedStyle(pbox).transform);
        const dx = b.left + b.width / 2 - (a.left + a.width / 2) + cur.e, dy = b.top + b.height * 0.6 - (a.top + a.height / 2) + cur.f;
        pbox.style.transform = `translate(${dx}px, ${dy}px) scale(.3)`;
        kit.sfx.whoosh();
        t.later(() => {
          pbox.style.opacity = 0;
          oven.classList.add('on');
          talk(oven, 3000);
          for (let i = 0; i < 6; i++) kit.tone(i % 2 ? 900 : 1200, { at: i * 0.5, dur: 0.05, type: 'square', vol: 0.05 });
        }, 600);
        t.later(() => {
          kit.tone(1568, { dur: 1.4, vol: 0.18, attack: 0.002 });
          kit.tone(2093, { at: 0.02, dur: 1.2, vol: 0.1, attack: 0.002 });
          oven.classList.remove('on');
          pbox.classList.add('baked', 'hot');
          pbox.style.opacity = 1;
          pbox.style.transform = '';
          state = 'baked';
        }, 3700);
        t.later(() => {
          kit.sfx.fanfare();
          const r = pbox.getBoundingClientRect();
          kit.burst(r.left + r.width / 2, r.top + r.height / 2, 90, 1.2);
          kit.say('Pizza! Mmm!', { pitch: 1.3 });
        }, 4300);
      }

      function bite() {
        const ang = kit.rand(0, Math.PI * 2), rad = Math.max(30, 200 - nb * 26);
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', 200 + Math.cos(ang) * rad); c.setAttribute('cy', 200 + Math.sin(ang) * rad);
        c.setAttribute('r', nb >= 6 ? 260 : kit.rand(62, 80)); c.setAttribute('fill', '#000');
        bites.appendChild(c);
        nb++;
        kit.noise({ dur: 0.12, vol: 0.3, freq: 700, q: 0.8 });
        kit.tone(200, { at: 0.05, dur: 0.12, vol: 0.15, slide: 120 });
        kit.replay(pbox, 'wiggle');
        if (nb === 3) kit.say('Nam nam!', { pitch: 1.4 });
        if (nb >= 7) {
          state = 'eaten';
          const r = pbox.getBoundingClientRect();
          kit.burst(r.left + r.width / 2, r.top + r.height / 2, 70, 1);
          kit.sfx.chime();
          t.later(() => kit.say('Mmm, det smagte godt!', { pitch: 1.3 }), 300);
          t.later(fresh, 1800);
        }
      }
      function fresh() {
        tops.innerHTML = ''; cheese.innerHTML = ''; bites.innerHTML = '';
        n = 0; nb = 0; state = 'raw';
        pbox.classList.remove('baked', 'hot');
        pbox.style.transform = 'translateY(-110%) scale(.6)';
        pbox.style.opacity = 0;
        requestAnimationFrame(() => requestAnimationFrame(() => { pbox.style.transform = ''; pbox.style.opacity = 1; kit.sfx.fwip(); }));
        ready();
      }

      return {
        layout(ww, wh) {
          const p = Math.min(ww * 0.92 / 1.8, wh * 0.84);
          Object.assign(pbox.style, { width: p + 'px', height: p + 'px' });
          Object.assign(oven.style, { width: p * 0.72 + 'px', height: p * 0.72 * 330 / 300 + 'px' });
        },
        drop(item, x, y) {
          if (state !== 'raw') return false;
          const q = svgPoint(svg, x, y), dx = q.x - 200, dy = q.y - 200, d = Math.hypot(dx, dy);
          if (d > 230) return false;
          // a little generous: anything dropped near the rim slides onto the pizza
          const k = d > 140 ? 140 / d : 1, px = 200 + dx * k, py = 200 + dy * k;
          if (item[0] === '🧀') {
            const p = document.createElementNS(NS, 'path'), r = kit.rand(34, 46);
            let dd = '';
            for (let i = 0; i <= 10; i++) {
              const a = i / 10 * Math.PI * 2, rr = r * (i % 2 ? 0.78 : 1.08);
              dd += (i ? ' L' : 'M') + (px + Math.cos(a) * rr).toFixed(1) + ' ' + (py + Math.sin(a) * rr).toFixed(1);
            }
            p.setAttribute('d', dd + ' Z');
            p.setAttribute('fill', '#ffe17a');
            p.setAttribute('stroke', '#f2b632'); p.setAttribute('stroke-width', '4'); p.setAttribute('stroke-linejoin', 'round');
            cheese.appendChild(p);
          } else svgEmoji(tops, item[0], px, py, 62, kit.rand(-30, 30));
          n++;
          kit.sfx.plop();
          ready();
          t.later(() => kit.say(item[1] + '!', { pitch: 1.25 }), 120);
          if (tops.children.length + cheese.children.length > 60) (tops.firstChild || cheese.firstChild).remove();
          return true;
        },
        reset() { t.clear(); oven.classList.remove('on'); fresh(); },
        stop() {},
      };
    }

    /* ---------- 🎂 cake ---------- */
    function cake() {
      const box = document.createElement('div');
      box.className = 'kk-box kk-cake';
      box.innerHTML = CAKE;
      work.appendChild(box);
      const svg = box.querySelector('svg'), deco = svg.querySelector('.kk-deco'), candles = svg.querySelector('.kk-candles');
      let fi = 0, celebrated = false;
      const setFrost = i => {
        svg.querySelectorAll('.kk-frost').forEach(p => p.setAttribute('fill', FROSTINGS[i][0]));
        svg.querySelectorAll('.kk-sponge').forEach(p => p.setAttribute('fill', FROSTINGS[i][1]));
      };

      svg.addEventListener('pointerdown', e => {
        e.preventDefault();
        const c = e.target.closest('.kk-candle');
        if (c) {
          if (c.classList.contains('lit')) {
            c.classList.remove('lit');
            kit.replay(c, 'puff');
            kit.noise({ dur: 0.35, vol: 0.3, freq: 600, q: 0.5, sweep: 2500 });
            const all = [...candles.children];
            if (all.length && all.every(x => !x.classList.contains('lit'))) party();
          } else {
            c.classList.add('lit');
            kit.sfx.fwip();
            kit.noise({ dur: 0.15, vol: 0.12, freq: 3000 });
          }
          return;
        }
        fi = (fi + 1) % FROSTINGS.length;
        setFrost(fi);
        kit.sfx.fwip();
        talk(box, 500);
        kit.replay(box, 'wiggle');
      });

      function party() {
        talk(box, 2500);
        kit.sfx.fanfare();
        kit.bigBurst();
        // a happy little tune on top
        [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3].forEach((s, i) => kit.tone(kit.scaleHz(s + 2, 392), { at: 0.9 + i * 0.22, dur: 0.3, type: 'triangle', vol: 0.12 }));
        kit.say(celebrated ? 'Hurra!' : 'Hurra! Tillykke!', { pitch: 1.35 });
        celebrated = true;
      }

      return {
        layout(ww, wh) {
          const w = Math.min(ww * 0.8, wh * 0.92 * 400 / 480);
          Object.assign(box.style, { width: w + 'px', height: w * 480 / 400 + 'px' });
        },
        drop(item, x, y) {
          const q = svgPoint(svg, x, y);
          if (item[0] === '🕯️') {
            if (q.x < 20 || q.x > 380 || q.y < -60 || q.y > 390) return false;
            const xs = [...candles.children].map(c => +c.dataset.x);
            if (xs.length >= 6) return false;
            // the nearest free spot along the top tier
            const spots = [];
            for (let sx = 130; sx <= 270; sx += 28) if (xs.every(v => Math.abs(v - sx) > 20)) spots.push(sx);
            if (!spots.length) return false;
            const sx = spots.reduce((a, b) => Math.abs(b - q.x) < Math.abs(a - q.x) ? b : a);
            candles.insertAdjacentHTML('beforeend', candle(sx, 126, kit.pick(CANDLE_COLORS)));
            [...candles.children].sort((a, b) => a.dataset.x - b.dataset.x).forEach(c => candles.appendChild(c));
            kit.sfx.snap();
            kit.noise({ dur: 0.15, vol: 0.1, freq: 3000 });
          } else {
            const onTop = q.x > 100 && q.x < 300 && q.y > 100 && q.y < 236;
            const onBottom = q.x > 40 && q.x < 360 && q.y > 210 && q.y < 372;
            if (!onTop && !onBottom) {
              if (Math.hypot(q.x - 200, q.y - 250) > 230) return false;
              q.x = Math.max(70, Math.min(330, q.x)); q.y = Math.max(240, Math.min(350, q.y));
            }
            svgEmoji(deco, item[0], q.x, q.y, 50, kit.rand(-20, 20));
            if (deco.children.length > 50) deco.firstChild.remove();
            kit.sfx.plop();
          }
          talk(box, 500);
          t.later(() => kit.say(item[1] + '!', { pitch: 1.25 }), 120);
          return true;
        },
        reset() {
          deco.innerHTML = ''; candles.innerHTML = ''; celebrated = false;
          fi = (fi + 1) % FROSTINGS.length; setFrost(fi);
          kit.replay(box, 'wiggle');
        },
        stop() {},
      };
    }

    open(0);
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); if (st) st.stop(); };
  },
};
