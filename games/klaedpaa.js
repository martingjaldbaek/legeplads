import { CHAR, CHAR_VIEWBOX, ITEMS, WARDROBE, SLOTS, weatherSVG, WEATHER_CSS } from './art/klaedpaa-art.js';

/* Klæd på: dress a child for the weather in the window. Drag clothes from the wardrobe onto the child; each
 * snaps to its body slot (a new hat replaces the old one) and is named. Weather-right clothes make the child
 * happy; winter clothes in the sun make it sweat and summer clothes in the snow make it shiver – a gentle joke,
 * never a "wrong". Four weather-right things and the child says "Nu er jeg klar!", the window opens up to the
 * whole screen and the child plays outside, then comes back in for a new weather. Tap the window to change the
 * weather. Drag a piece of clothing off the child to take it off.
 */
const WEATHERS = ['sol', 'regn', 'sne', 'blæst'];
const WNAME = { sol: 'Solskin!', regn: 'Regnvejr!', sne: 'Sne!', 'blæst': 'Blæsevejr!' };
const READY = 4;

const CSS = `
.kp-room { position:absolute; inset:0; background: repeating-linear-gradient(90deg, #fff4e0 0 6vmin, #ffecd0 6vmin 12vmin); }
.kp-floor { position:absolute; left:0; right:0; bottom:0; height:16%; background:#e6b98a; border-top:1vmin solid #d39f6d; }
.kp-win { position:absolute; z-index:1; border-radius:2vmin; overflow:hidden; transition: left .8s ease, top .8s ease, width .8s ease, height .8s ease, border-radius .8s;
  box-shadow: 0 1vmin 0 rgba(0,0,0,.1); touch-action:none; }
.kp-win svg { position:absolute; inset:0; width:100%; height:100%; }
.kp-frame { position:absolute; inset:0; border:1.6vmin solid #c98a4b; border-radius:2vmin; transition: opacity .5s; pointer-events:none; }
.kp-frame::before { content:''; position:absolute; left:50%; top:0; bottom:0; width:1.2vmin; margin-left:-.6vmin; background:#c98a4b; }
.kp-frame::after { content:''; position:absolute; top:50%; left:0; right:0; height:1.2vmin; margin-top:-.6vmin; background:#c98a4b; }
.kp-out .kp-win { left:0 !important; top:0 !important; width:100% !important; height:100% !important; border-radius:0; }
.kp-out .kp-frame { opacity:0; }
.kp-win.kp-wiggle { animation: kp-wiggle .4s ease; }
.kp-ward { position:absolute; z-index:4; display:grid; gap:8px; padding:12px; background: rgba(255,255,255,.75); border-radius:3vmin;
  box-shadow: 0 1vmin 0 rgba(0,0,0,.08); transition: opacity .5s; }
.kp-out .kp-ward { opacity:0; pointer-events:none; }
.kp-tile { background:#fff; border-radius:2vmin; display:flex; align-items:center; justify-content:center; touch-action:none;
  box-shadow: 0 .5vmin 0 rgba(0,0,0,.08); }
.kp-tile svg { width:84%; height:84%; pointer-events:none; overflow:visible; }
.kp-char { position:absolute; z-index:3; touch-action:none; }
.kp-char svg { width:100%; height:100%; overflow:visible; }
.kp-out .kp-char { animation: kp-walk 3.2s ease-in-out infinite; pointer-events:none; }
.kp-float { position:absolute; left:0; top:0; z-index:50; pointer-events:none; filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.kp-float svg { width:100%; height:100%; overflow:visible; }
.kp-float.kp-poof { transition: transform .3s ease-in, opacity .3s; opacity:0; }
.kp-char * { transform-box: fill-box; }
.kp-figure { transform-origin: 50% 100%; }
.kp-eyes { transform-origin: center; animation: kp-blink 4s infinite; }
.kp-slot.kp-on { transform-origin: center; animation: kp-on .4s ease; }
.kp-m-open, .kp-m-wave, .kp-sweat { display:none; }
.kp-happy .kp-m-open, .kp-hot .kp-m-open { display:inline; }
.kp-happy .kp-m-smile, .kp-hot .kp-m-smile, .kp-cold .kp-m-smile { display:none; }
.kp-cold .kp-m-wave, .kp-hot .kp-sweat { display:inline; }
.kp-cold .kp-cheek { fill:#7fb8ff; }
.kp-hot .kp-cheek { fill:#ff4d6d; opacity:.8; }
.kp-cold .kp-figure { animation: kp-shiver .09s linear infinite; }
.kp-hot .kp-figure { animation: kp-pant .5s ease-in-out infinite alternate; }
.kp-hop .kp-figure { animation: kp-hop .5s ease; }
.kp-out .kp-kite { transform-origin: 50% 100%; animation: kp-kite .6s ease-in-out infinite alternate; }
@keyframes kp-walk { 0%{transform:translateX(0)} 12%{transform:translate(8%,-5%)} 25%{transform:translateX(16%)} 37%{transform:translate(8%,-5%)}
  50%{transform:translateX(0)} 62%{transform:translate(-8%,-5%)} 75%{transform:translateX(-16%)} 87%{transform:translate(-8%,-5%)} 100%{transform:translateX(0)} }
@keyframes kp-blink { 0%,94%,100% { transform:none } 97% { transform: scaleY(.1) } }
@keyframes kp-on { 0%{transform:scale(1.25)} 60%{transform:scale(.94)} 100%{transform:none} }
@keyframes kp-shiver { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-1.5%)} }
@keyframes kp-pant { from{transform:none} to{transform:scale(1.02,.98)} }
@keyframes kp-hop { 0%,100%{transform:none} 30%{transform:translateY(-8%) scale(.97,1.04)} 60%{transform:translateY(0) scale(1.05,.95)} }
@keyframes kp-wiggle { 0%,100%{transform:none} 30%{transform:rotate(-3deg)} 65%{transform:rotate(3deg)} }
@keyframes kp-kite { from{transform:rotate(-8deg)} to{transform:rotate(8deg) translateY(-6%)} }
${WEATHER_CSS}`;

export default {
  id: 'klaedpaa',
  title: 'Klæd på',
  icon: '🧥',
  color: '#118ab2',
  edge: '#e6b98a',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    root.insertAdjacentHTML('beforeend', `<div class="kp-room"></div><div class="kp-floor"></div>
      <div class="kp-win"><div class="kp-sky"></div><div class="kp-frame"></div></div>
      <div class="kp-char"><svg viewBox="${CHAR_VIEWBOX}">${CHAR}</svg></div><div class="kp-ward"></div>`);
    const win = root.querySelector('.kp-win'), sky = root.querySelector('.kp-sky');
    const charEl = root.querySelector('.kp-char'), ward = root.querySelector('.kp-ward');
    const slotEl = {};
    charEl.querySelectorAll('.kp-slot').forEach(g => { slotEl[g.dataset.slot] = g; });

    // measure each item once so tiles and dragged copies can be cropped to it
    const meas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    meas.setAttribute('viewBox', CHAR_VIEWBOX);
    meas.style.cssText = 'position:absolute;visibility:hidden;width:100px;height:100px;left:0;top:0';
    root.appendChild(meas);
    const measure = svg => {
      meas.innerHTML = `<g>${svg}</g>`;
      const b = meas.firstChild.getBBox(), p = 8;
      return { x: b.x - p, y: b.y - p, w: b.width + 2 * p, h: b.height + 2 * p };
    };
    const box = {}, tileBox = {};
    for (const id of WARDROBE) {
      box[id] = measure(ITEMS[id].svg);
      tileBox[id] = ITEMS[id].icon ? measure(ITEMS[id].icon) : box[id];
    }
    meas.remove();
    const icon = id => { const b = box[id]; return `<svg viewBox="${b.x} ${b.y} ${b.w} ${b.h}">${ITEMS[id].svg}</svg>`; };
    const tileIcon = id => { const b = tileBox[id]; return `<svg viewBox="${b.x} ${b.y} ${b.w} ${b.h}">${ITEMS[id].icon || ITEMS[id].svg}</svg>`; };

    let weather = 'sol', busy = false, unit = 1;   // unit: screen px per character unit
    const worn = {};
    sky.innerHTML = weatherSVG(weather);

    function setMood(cls, ms) {
      charEl.classList.remove('kp-happy', 'kp-hot', 'kp-cold');
      if (cls) charEl.classList.add(cls);
      if (ms) t.later(() => charEl.classList.remove(cls), ms);
    }

    // ---- dragging: a floating copy drawn at the child's scale ----
    function floatFor(id, x, y) {
      const f = document.createElement('div');
      f.className = 'kp-float';
      f.innerHTML = icon(id);
      const b = box[id];
      f.style.width = b.w * unit + 'px'; f.style.height = b.h * unit + 'px';
      root.appendChild(f);
      moveFloat(f, x, y);
      return f;
    }
    const moveFloat = (f, x, y) => { f.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; };
    function poof(f) { f.classList.add('kp-poof'); f.style.transform += ' scale(0)'; kit.sfx.whoosh(); setTimeout(() => f.remove(), 320); }
    function overChild(x, y) {
      const r = charEl.getBoundingClientRect();
      return x > r.left + r.width * 0.08 && x < r.right - r.width * 0.05 && y > r.top - r.height * 0.05 && y < r.bottom + r.height * 0.04;
    }

    // Every drag in progress, so the outing (and a new touch) can cancel it. iOS sometimes swallows a pointerup
    // (edge gestures, a second finger); without this a float copy stayed frozen on screen while the child danced,
    // a worn item stayed hidden, and kit.draggable ignored that tile or slot for good.
    const drags = new Map();   // element -> { pid, f, g, h }
    function cancelDrag(el) {
      const d = drags.get(el);
      if (!d) return;
      drags.delete(el);
      if (d.f) d.f.remove();
      if (d.g) d.g.style.opacity = '';
      d.h.release();
    }
    const cancelAllDrags = () => [...drags.keys()].forEach(cancelDrag);
    // a new touch always wins over a stale one (must be registered before kit.draggable's own listener)
    const staleGuard = el => el.addEventListener('pointerdown', e => {
      const d = drags.get(el);
      if (d && d.pid !== e.pointerId) cancelDrag(el);
    });

    WARDROBE.forEach(id => {
      const tile = document.createElement('div');
      tile.className = 'kp-tile';
      tile.innerHTML = tileIcon(id);
      ward.appendChild(tile);
      staleGuard(tile);
      const h = kit.draggable(tile, {
        start(e) {
          if (busy) return false;
          drags.set(tile, { pid: e.pointerId, f: floatFor(id, e.clientX, e.clientY), h });
          kit.sfx.pickUp();
        },
        move(e) { const d = drags.get(tile); if (d) moveFloat(d.f, e.clientX, e.clientY); },
        end(e) {
          const d = drags.get(tile);
          if (!d) return;
          drags.delete(tile);
          // no dressing once the child is getting ready to go out
          if (!busy && overChild(e.clientX, e.clientY)) { d.f.remove(); wear(id); } else poof(d.f);
        },
      });
    });

    // clothes already on the child can be dragged off (or dropped back on)
    SLOTS.forEach(slot => {
      const g = slotEl[slot];
      staleGuard(g);
      const h = kit.draggable(g, {
        start(e) {
          if (busy || !worn[slot]) return false;
          drags.set(g, { pid: e.pointerId, f: floatFor(worn[slot], e.clientX, e.clientY), g, h });
          g.style.opacity = '0';   // not visibility:hidden – a hidden slot can't be touched, so a stale drag couldn't be undone
          kit.sfx.pickUp();
        },
        move(e) { const d = drags.get(g); if (d) moveFloat(d.f, e.clientX, e.clientY); },
        end(e) {
          const d = drags.get(g);
          if (!d) return;
          drags.delete(g);
          g.style.opacity = '';
          if (busy || overChild(e.clientX, e.clientY)) { d.f.remove(); kit.sfx.plop(); kit.replay(g, 'kp-on'); }
          else { worn[slot] = null; g.innerHTML = ''; poof(d.f); }
        },
      });
    });

    function wear(id) {
      const it = ITEMS[id], g = slotEl[it.slot];
      worn[it.slot] = id;
      g.innerHTML = it.svg;
      kit.replay(g, 'kp-on');
      kit.sfx.plop();
      const r = charEl.getBoundingClientRect();
      kit.burst(r.left + r.width / 2, r.top + r.height * 0.45, 14, 0.5);
      t.later(() => kit.say(it.name + '!', { pitch: 1.3 }), 100);
      if (it.w.includes(weather)) {
        setMood('kp-happy', 1300);
        t.later(() => kit.sfx.blip(9), 250);
      } else if (it.warm && weather === 'sol') {
        setMood('kp-hot', 2400);
        t.later(() => { kit.say('Puha, det er varmt!', { pitch: 1.3 }); kit.tone(700, { dur: 0.5, slide: 350, type: 'triangle', vol: 0.12 }); }, 1000);
      } else if (it.cool && weather === 'sne') {
        setMood('kp-cold', 2000);
        t.later(() => { kit.say('Brrr! Jeg fryser!', { pitch: 1.3 }); for (let i = 0; i < 6; i++) kit.tone(180 + (i % 2) * 30, { at: i * 0.06, dur: 0.07, type: 'square', vol: 0.04 }); }, 1000);
      }
      checkReady();
    }

    const fitting = () => Object.values(worn).filter(id => id && ITEMS[id].w.includes(weather)).length;
    function checkReady() {
      if (busy || fitting() < READY) return;
      busy = true;
      cancelAllDrags();
      t.later(() => { setMood('kp-happy'); kit.say('Nu er jeg klar!', { pitch: 1.3 }); kit.sfx.chime(); }, 1500);
      t.later(goOut, 2700);
    }

    let loop = null;
    function goOut() {
      cancelAllDrags();
      root.classList.add('kp-out');
      kit.sfx.fanfare();
      kit.bigBurst();
      let n = 0;
      loop = t.every(() => {
        n++;
        if (weather === 'regn') { kit.sfx.splat(); kit.noise({ dur: 0.6, vol: 0.06, freq: 4000, q: 0.5 }); }
        else if (weather === 'sne') kit.tone(kit.scaleHz(7 + (n % 3) * 2), { dur: 0.6, vol: 0.08 });
        else if (weather === 'blæst') kit.sfx.whoosh();
        else kit.sfx.blip(5 + (n % 4) * 2);
        if (n % 2 === 0) kit.sfx.giggle();
      }, 800);
      t.later(comeIn, 7000);
    }
    function comeIn() {
      clearInterval(loop);
      cancelAllDrags();
      root.classList.remove('kp-out');
      setMood(null);
      kit.say('Det var sjovt!', { pitch: 1.3 });
      t.later(() => {
        cancelAllDrags();
        SLOTS.forEach((s, i) => t.later(() => {
          const had = worn[s];
          worn[s] = null;
          slotEl[s].innerHTML = ''; slotEl[s].style.opacity = '';
          if (had) kit.sfx.fwip();
        }, i * 90));
      }, 1000);
      t.later(() => {
        // belt and braces: nothing worn, no stray floating copies
        SLOTS.forEach(s => { worn[s] = null; slotEl[s].innerHTML = ''; slotEl[s].style.opacity = ''; });
        root.querySelectorAll('.kp-float').forEach(f => f.remove());
        setWeather(); busy = false;
      }, 2200);
    }

    function setWeather(w) {
      weather = w || kit.pick(WEATHERS.filter(x => x !== weather));
      sky.innerHTML = weatherSVG(weather);
      kit.replay(win, 'kp-wiggle');
      kit.sfx.whoosh();
      t.later(() => kit.say(WNAME[weather], { pitch: 1.2 }), 200);
    }
    win.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (busy) return;
      setWeather();
      checkReady();
    });
    charEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (busy) return;
      kit.replay(charEl, 'kp-hop');
      kit.sfx.giggle();
    });

    function layout() {
      const W = root.clientWidth, H = root.clientHeight, portrait = H > W, gap = 8, pad = 12, n = WARDROBE.length;
      let cols, cell;
      if (portrait) {
        cols = 7;
        cell = Math.min((W * 0.94 - 2 * pad - (cols - 1) * gap) / cols, H * 0.085);
      } else {
        cols = 4;
        cell = Math.min((H * 0.9 - 2 * pad) / 6 - gap, (W * 0.36 - 2 * pad) / cols - gap);
      }
      const rows = Math.ceil(n / cols), pw = cols * cell + (cols - 1) * gap + 2 * pad, ph = rows * cell + (rows - 1) * gap + 2 * pad;
      ward.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;
      ward.querySelectorAll('.kp-tile').forEach(el => { el.style.width = el.style.height = cell + 'px'; });
      let ch, cxp, ctop, wx, wy, ww;
      if (portrait) {
        Object.assign(ward.style, { left: (W - pw) / 2 + 'px', top: H - ph - H * 0.02 + 'px' });
        ctop = H * 0.03; ch = (H - ph - H * 0.02 - ctop) * 0.97; cxp = W * 0.42;
        ww = W * 0.34; wx = W * 0.62; wy = H * 0.05;
      } else {
        Object.assign(ward.style, { left: W - pw - W * 0.02 + 'px', top: (H - ph) / 2 + 'px' });
        const A = W - pw - W * 0.02;
        ctop = H * 0.03; ch = H * 0.94; cxp = A * 0.6;
        ww = Math.min(A * 0.34, H * 0.4); wx = A * 0.04; wy = H * 0.15;
      }
      const cw = ch * 390 / 660;
      unit = ch / 660;
      Object.assign(charEl.style, { left: cxp - cw / 2 + 'px', top: ctop + 'px', width: cw + 'px', height: ch + 'px' });
      Object.assign(win.style, { left: wx + 'px', top: wy + 'px', width: ww + 'px', height: ww * 0.75 + 'px' });
    }
    layout();
    const offResize = kit.onResize(root, layout);
    t.later(() => kit.say(WNAME[weather], { pitch: 1.2 }), 400);
    return () => { cancelAllDrags(); t.clear(); offResize(); root.classList.remove('kp-out'); };
  },
};
