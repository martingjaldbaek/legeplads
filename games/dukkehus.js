/* Dukkehuset: a cross-section house to play in. Drag the family and pets between rooms: into the bed (they sleep,
 * Zzz), onto the sofa or toilet, into the bath. Lots of things react to a tap: lamps (the room goes dark),
 * toilet, bath tap, sink, fridge, oven (bakes a cake), radio, TV channels, front door (a visitor comes in),
 * trunk in the attic (a toy pops out), spider, tree (an apple falls), mailbox, flowers. Sun/moon = day/night.
 * The scene is one SVG in a 1400×1000 box; the viewBox grows to fill any screen shape.
 */
import { scene, fronts, person, dog, cat } from './art/dukkehus-art.js';

const NS = 'http://www.w3.org/2000/svg';
const CHARS = [
  { id: 'mor', kind: 'p', s: 1, x: 445, y: 880, art: person({ style: 'long', hair: '#8a4b2a', shirt: '#ef476f', dress: true }) },
  { id: 'far', kind: 'p', s: 1, spot: 'sofa1', art: person({ style: 'short', hair: '#3b2a1a', shirt: '#2ec4b6', pants: '#3a5a8c', skin: '#e3a872' }) },
  { id: 'pige', kind: 'p', s: 0.72, x: 585, y: 572, art: person({ style: 'pigtails', hair: '#ffcf5a', shirt: '#8338ec', dress: true }) },
  { id: 'dreng', kind: 'p', s: 0.72, x: 1160, y: 880, art: person({ style: 'spiky', hair: '#e85d04', shirt: '#ffd23f', pants: '#06a77d' }) },
  { id: 'baby', kind: 'p', s: 0.55, x: 660, y: 292, art: person({ style: 'bun', hair: '#c98d5e', shirt: '#ffc6df', pants: '#ffc6df', skin: '#c98d5e' }) },
  { id: 'hund', kind: 'dog', s: 1, x: 1300, y: 880, art: dog() },
  { id: 'kat', kind: 'cat', s: 1, x: 500, y: 292, art: cat() },
];
const HEIGHT = { p: 165, dog: 95, cat: 98 };
// pose spots: hit rect [x0, y0, x1, y1], seat/surface y
const SPOTS = [
  // lying spots give the head position on the pillow; the second sleeper lies a little further back
  { id: 'bed1', pose: 'lie', x: 280, y: 487, hit: [200, 395, 490, 570] },
  { id: 'bed2', pose: 'lie', x: 336, y: 470, hit: [200, 395, 490, 570] },
  { id: 'sofa1', pose: 'sit', x: 712, y: 808, hit: [636, 720, 766, 872] },
  { id: 'sofa2', pose: 'sit', x: 822, y: 808, hit: [766, 720, 896, 872] },
  { id: 'toilet', pose: 'sit', x: 926, y: 486, hit: [870, 395, 985, 572] },
  { id: 'bath', pose: 'bath', x: 757, y: 470, hit: [645, 380, 866, 572] },
];
// surfaces things land on: [x0, x1, y]
const FLOORS = [[215, 1045, 292], [180, 1080, 572], [-5000, 6000, 880], [452, 612, 802]];
const ROOM_X = { 292: [[300, 960]], 572: [[230, 590], [670, 1032]], 880: [[230, 590], [670, 1032]] };
const VISITORS = ['🐻', '🦊', '🐧', '🐸', '🐰', '🦁', '🐵', '🐼'];
const TOYS = ['🪀', '⚽', '🧸', '🚂', '🎈', '🪁', '🦖', '🐥'];
const FOODS = ['🧀', '🍎', '🥕', '🍉', '🥛', '🍌'];
const TUNES = [[0, 2, 4, 0, 0, 2, 4, 0, 4, 5, 7], [7, 7, 8, 7, 5, 4, 2, 4, 0], [0, 4, 7, 9, 7, 4, 0, 4, 7, 12]];

const CSS = `
.dh-svg { position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:none; }
.dh-svg text { pointer-events:none; }
.dh-nightsky, .dh-stars, .dh-moon { opacity:0; transition: opacity .8s; }
.dh-nightground { opacity:0; transition: opacity .8s; pointer-events:none; }
.dh-sun, .dh-cloud { transition: opacity .8s; }
.dh-night .dh-nightsky, .dh-night .dh-stars, .dh-night .dh-moon { opacity:1; }
.dh-night .dh-nightground { opacity:.5; }
.dh-night .dh-sun, .dh-night .dh-cloud { opacity:0; }
.dh-win { fill:#bfe6ff; transition: fill .8s; }
.dh-night .dh-win { fill:#1d2560; }
.dh-dark { fill:#120c33; opacity:0; pointer-events:none; transition: opacity .5s; }
.dh-glow { opacity:0; transition: opacity .4s; pointer-events:none; }
.dh-bulb { fill:#ddd; transition: fill .3s; }
.dh-on .dh-bulb { fill:#fff7a0; }
.dh-c1 { animation: dh-drift 70s linear infinite; }
.dh-c2 { animation: dh-drift2 95s linear infinite; }
@keyframes dh-drift { from { transform: translate(-500px, 60px) } to { transform: translate(1900px, 60px) } }
@keyframes dh-drift2 { from { transform: translate(1900px, -40px) scale(.8) } to { transform: translate(-500px, -40px) scale(.8) } }
.dh-shut { display:none; }
.dh-sleep .dh-shut { display:inline; } .dh-sleep .dh-eyes { display:none; }
.dh-eyes { transform-box: fill-box; transform-origin: center; animation: dh-blink 4.5s infinite; }
@keyframes dh-blink { 0%,94%,100% { transform:none } 97% { transform: scaleY(.1) } }
.dh-char, .dh-obj { transition: transform .4s cubic-bezier(.55,0,1,.45); }
.dh-drag { transition: none !important; }
.dh-lift { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .15s; }
.dh-drag .dh-lift { transform: scale(1.1); }
.dh-land .dh-lift { animation: dh-land .3s ease; }
@keyframes dh-land { 0%{transform:scale(1.12,.85)} 60%{transform:scale(.95,1.06)} 100%{transform:none} }
.dh-hop .dh-lift { animation: dh-hop .45s ease; }
@keyframes dh-hop { 0%,100%{transform:none} 40%{transform:translateY(-34px) scale(1.04)} }
.dh-float .dh-lift { animation: dh-bob 1.8s ease-in-out infinite; }
@keyframes dh-bob { 0%,100%{transform:rotate(-6deg)} 50%{transform:translateY(-6px) rotate(6deg)} }
.dh-sit .dh-legs { transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(.35); }
.dh-zzz { opacity:0; font: 800 30px ui-rounded, system-ui, sans-serif; fill:#4a3b5c; }
.dh-sleep .dh-zzz { animation: dh-zzz 2.4s ease-in-out infinite; }
@keyframes dh-zzz { 0% { opacity:0; transform: translate(0,0) } 30% { opacity:1 } 100% { opacity:0; transform: translate(26px,-50px) } }
.dh-tail { transform-box: fill-box; transform-origin: 100% 100%; }
.dh-wag .dh-tail { animation: dh-wag .14s 6 alternate ease-in-out; }
@keyframes dh-wag { from { transform: rotate(-14deg) } to { transform: rotate(14deg) } }
.dh-door { transform-box: fill-box; transform-origin: 0% 50%; transition: transform .35s; }
.dh-dooropen .dh-door { transform: scaleX(.12); }
.dh-lid { transform-box: fill-box; transform-origin: 0% 100%; transition: transform .3s; }
.dh-trunk.dh-open .dh-lid { transform: rotate(-40deg); }
.dh-fridgedoor { transform-box: fill-box; transform-origin: 0% 50%; transition: transform .35s; }
.dh-fridge.dh-open .dh-fridgedoor { transform: scaleX(.1); }
.dh-ovenwin { transition: fill .5s; }
.dh-baking .dh-ovenwin { fill:#ff8a00; }
.dh-steam { opacity:0; transition: opacity .5s; }
.dh-baking .dh-steam { opacity:.9; }
.dh-swirl { transform-box: fill-box; transform-origin: center; opacity:.7; }
.dh-flush .dh-swirl { animation: dh-swirl 1.3s ease; }
@keyframes dh-swirl { 0%,100% { transform:none } 25% { transform: scale(.5, 2.2) } 50% { transform: scale(1.1, .6) } 75% { transform: scale(.3, 1.6) } }
.dh-toilet.dh-flush { animation: dh-wobble .5s ease; transform-box: fill-box; transform-origin: 50% 100%; }
.dh-sinkwater, .dh-tapwater { opacity:0; transition: opacity .2s; }
.dh-run .dh-sinkwater, .dh-run .dh-tapwater { opacity:1; }
.dh-sinkwater { transform-box: fill-box; transform-origin: 50% 0; }
.dh-run .dh-sinkwater { transform: scaleY(2.3); }
.dh-bathwater { opacity:0; transition: opacity .8s; }
.dh-full .dh-bathwater { opacity:1; }
.dh-spiderbody { transition: transform .5s cubic-bezier(.3,1.4,.5,1); }
.dh-thread { transform-box: fill-box; transform-origin: 50% 0; transition: transform .5s cubic-bezier(.3,1.4,.5,1); }
.dh-spider.dh-down .dh-spiderbody { transform: translateY(26px); }
.dh-spider.dh-down .dh-thread { transform: scaleY(2.45); }
.dh-flag { transform-box: fill-box; transform-origin: 0% 100%; transform: scaleY(0); transition: transform .3s cubic-bezier(.3,1.5,.5,1); }
.dh-up .dh-flag { transform: none; }
.dh-shake { transform-box: fill-box; transform-origin: 50% 100%; animation: dh-wobble .45s ease; }
@keyframes dh-wobble { 0%,100%{transform:none} 25%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} 75%{transform:rotate(-2deg)} }
.dh-nod { transform-box: fill-box; transform-origin: 50% 100%; animation: dh-nod .6s ease; }
@keyframes dh-nod { 0%,100%{transform:none} 30%{transform:rotate(-14deg)} 65%{transform:rotate(10deg)} }
.dh-radio.dh-play { transform-box: fill-box; transform-origin: 50% 100%; animation: dh-nod .3s ease-in-out infinite alternate; }
.dh-fx { animation: dh-up 1.6s ease-out forwards; font-size:44px; }
@keyframes dh-up { 0% { opacity:0; transform: translate(0,0) } 20% { opacity:1 } 100% { opacity:0; transform: translate(var(--dx, 20px), -120px) } }
.dh-fly { animation: dh-fly 2.4s ease-in forwards; font-size:56px; }
@keyframes dh-fly { 0% { transform: translate(0,0) } 30% { transform: translate(-40px,-120px) } 60% { transform: translate(60px,-260px) } 100% { transform: translate(-30px,-520px); opacity:0 } }
.dh-tvfish { animation: dh-swim 3s linear infinite; }
@keyframes dh-swim { from { transform: translateX(0) } to { transform: translateX(170px) } }
.dh-tvball { animation: dh-tvbounce .6s ease-in infinite alternate; }
@keyframes dh-tvbounce { from { transform: translateY(0) } to { transform: translateY(34px) } }
.dh-tvspin { transform-box: fill-box; transform-origin: center; animation: dh-spin 2s linear infinite; }
@keyframes dh-spin { to { transform: rotate(360deg) } }
.dh-tvdance { transform-box: fill-box; transform-origin: 50% 100%; animation: dh-nod .4s ease-in-out infinite alternate; }
`;

export default {
  id: 'dukkehus',
  title: 'Dukkehuset',
  icon: '🏠',
  color: '#e85d4a',
  edge: '#8fd16a',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'dh-svg');
    svg.innerHTML = scene() + '<g class="dh-layer"></g>' + fronts();
    root.appendChild(svg);
    const layer = svg.querySelector('.dh-layer');
    const $ = s => svg.querySelector(s);
    const $$ = s => svg.querySelectorAll(s);

    let night = false, tvCh = 0, radioOn = false, ovenBusy = false, fridgeTimer = 0, visitorIdx = 0, toyIdx = 0, lastSay = 0;
    const lights = { attic: true, bedroom: true, bathroom: true, kitchen: true, living: true };
    const things = [];   // characters and objects
    const occ = {};      // spot id → thing

    const sayOnce = (text, opts) => { const n = Date.now(); if (n - lastSay > 2500) { lastSay = n; kit.say(text, opts); } };
    const toSvg = (cx, cy) => { const p = svg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const toClient = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM()); };
    const sparkle = (x, y, n = 24) => { const p = toClient(x, y); kit.burst(p.x, p.y, n, 0.7); };

    /* ---------- sounds ---------- */
    const S = {
      click() { kit.noise({ dur: 0.03, vol: 0.25, freq: 3500 }); kit.tone(1400, { dur: 0.03, vol: 0.05, type: 'square' }); },
      dingdong() { kit.tone(659, { dur: 1.1, vol: 0.25 }); kit.tone(523, { at: 0.45, dur: 1.3, vol: 0.25 }); },
      flush() { kit.noise({ dur: 1.5, vol: 0.4, freq: 1800, q: 0.6, sweep: 220 }); [0.5, 0.75, 1, 1.2].forEach(a => kit.tone(320, { at: a, dur: 0.12, vol: 0.08, slide: 140 })); },
      water(d = 1.4) { kit.noise({ dur: d, vol: 0.18, freq: 2400, q: 0.5 }); },
      woof() { [0, 0.24].forEach(at => { kit.noise({ at, dur: 0.12, vol: 0.35, freq: 600, q: 1.2 }); kit.tone(280, { at, dur: 0.13, vol: 0.2, type: 'sawtooth', slide: 150 }); }); },
      meow() { kit.tone(650, { dur: 0.18, vol: 0.14, type: 'triangle', slide: 1000 }); kit.tone(1000, { at: 0.18, dur: 0.4, vol: 0.14, type: 'triangle', slide: 520 }); },
      snore() { kit.noise({ dur: 0.9, vol: 0.2, freq: 260, q: 2, sweep: 180 }); kit.noise({ at: 1.1, dur: 0.6, vol: 0.08, freq: 900, sweep: 1800 }); },
      ding() { kit.tone(1568, { dur: 1.3, vol: 0.2 }); kit.tone(2093, { at: 0.02, dur: 0.9, vol: 0.07 }); },
      creak() { kit.tone(170, { dur: 0.4, type: 'sawtooth', vol: 0.05, slide: 260 }); },
      stat() { kit.noise({ dur: 0.25, vol: 0.2, freq: 5000, q: 0.3 }); },
      hum() { kit.tone(110, { dur: 0.7, type: 'sawtooth', vol: 0.035 }); },
      thud() { kit.tone(150, { dur: 0.12, vol: 0.22, slide: 70 }); kit.noise({ dur: 0.05, vol: 0.12, freq: 700 }); },
    };

    /* ---------- characters and objects ---------- */
    function el(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
    function place(th) { th.el.style.transform = `translate(${th.x}px, ${th.y}px)`; }
    function applyPose(th) {
      if (!th.char) return;
      const person = th.kind === 'p';
      th.el.querySelector('.dh-pose').setAttribute('transform', th.pose === 'lie' && person ? 'rotate(-90)' : '');
      th.el.classList.toggle('dh-sit', th.pose === 'sit' && person);
      th.el.classList.toggle('dh-sleep', th.pose === 'lie');
      const z = th.el.querySelector('.dh-zzz');
      if (z) {
        const [zx, zy] = person ? (th.pose === 'lie' ? [-130 * th.s + 8, -40] : [10, -175 * th.s]) : [44, -118];
        z.setAttribute('x', zx); z.setAttribute('y', zy);
      }
    }
    function addChar(d) {
      const g = el('g', { class: 'dh-char' });
      const h = HEIGHT[d.kind];
      const hit = d.kind === 'p' ? `<rect x="-52" y="-178" width="104" height="180" fill="transparent"/>` : `<rect x="-70" y="-${h + 10}" width="160" height="${h + 12}" fill="transparent"/>`;
      g.innerHTML = `<g class="dh-lift"><g class="dh-pose"><g transform="scale(${d.s})">${hit}${d.art}</g></g></g><text class="dh-zzz">Zzz</text>`;
      layer.appendChild(g);
      const th = { el: g, kind: d.kind, s: d.s, h: h * d.s, x: d.x || 0, y: d.y || 0, pose: 'stand', spot: null, char: true, id: d.id };
      things.push(th);
      bindDrag(th);
      if (d.spot) toSpot(th, SPOTS.find(s => s.id === d.spot), true);
      else { place(th); applyPose(th); }
      return th;
    }
    function addObj(emoji, x, y, size = 64, fall = true) {
      const g = el('g', { class: 'dh-obj' });
      g.innerHTML = `<g class="dh-lift"><circle cx="0" cy="${-size * 0.5}" r="${size * 0.72}" fill="transparent"/>
        <text x="0" y="${-size * 0.1}" font-size="${size}" text-anchor="middle">${emoji}</text></g>`;
      layer.appendChild(g);
      const th = { el: g, kind: 'obj', emoji, s: 1, h: size, x, y, pose: 'stand', spot: null, char: false };
      things.push(th);
      bindDrag(th);
      place(th);
      // keep the house from filling up: drop the oldest loose object
      const objs = things.filter(o => !o.char);
      if (objs.length > 16) remove(objs[0]);
      if (fall) t.later(() => drop(th, x, y), 30);
      return th;
    }
    function remove(th) {
      things.splice(things.indexOf(th), 1);
      th.el.style.transition = 'opacity .3s'; th.el.style.opacity = 0;
      t.later(() => th.el.remove(), 320);
    }
    function leaveSpot(th) { if (th.spot) { delete occ[th.spot.id]; th.spot = null; } th.el.classList.remove('dh-float'); }

    function floorAt(x, y) {
      let best = 880;
      FLOORS.forEach(([x0, x1, fy]) => { if (x >= x0 && x <= x1 && fy >= y - 6 && fy < best) best = fy; });
      return best;
    }
    function clampX(x, fy) {
      const spans = ROOM_X[fy];
      if (!spans || x < 180 || x > 1080) return x;
      let best = x, bd = Infinity;
      spans.forEach(([a, b]) => { const c = Math.max(a, Math.min(b, x)); if (Math.abs(c - x) < bd) { bd = Math.abs(c - x); best = c; } });
      return best;
    }
    // let a thing fall from (x, y) to whatever is beneath it
    function drop(th, x, y) {
      const fy = floorAt(x, y);
      const nx = fy === 880 && (x < 180 || x > 1080) ? x : clampX(x, fy);
      const d = Math.max(0, fy - y);
      th.el.style.transitionDuration = Math.min(0.6, 0.12 + d / 1400) + 's';
      th.x = nx; th.y = fy;
      th.pose = 'stand'; applyPose(th);
      place(th);
      t.later(() => { kit.replay(th.el, 'dh-land'); S.thud(); }, Math.min(600, 120 + d / 1.4));
    }
    function toSpot(th, sp, quiet) {
      leaveSpot(th);
      th.spot = sp; occ[sp.id] = th;
      const person = th.kind === 'p';
      if (sp.pose === 'lie') { th.x = person ? sp.x + 130 * th.s : sp.x + 140; th.y = person ? sp.y : sp.y + 26; }
      else if (sp.pose === 'sit') { th.x = sp.x; th.y = sp.y + (person ? 54 * th.s : 0); }
      else { th.x = sp.x; th.y = sp.y + th.h * 0.5; }
      th.pose = sp.pose === 'lie' ? 'lie' : sp.pose === 'sit' ? 'sit' : 'stand';
      th.el.style.transitionDuration = '.25s';
      if (sp.id === 'bed2') layer.insertBefore(th.el, layer.firstChild);   // lies behind the first sleeper
      applyPose(th); place(th);
      if (quiet) return;
      t.later(() => kit.replay(th.el, 'dh-land'), 200);
      if (sp.pose === 'lie') { S.snore(); sayOnce('Godnat!', { pitch: 1.1 }); }
      else if (sp.pose === 'bath') {
        if (svg.classList.contains('dh-full')) { kit.sfx.splat(); sparkle(sp.x, 450, 30); th.el.classList.add('dh-float'); }
        else kit.sfx.plop();
      } else kit.sfx.plop();
    }
    function findSpot(th, p) {
      if (!th.char) return null;
      return SPOTS.find(sp => !occ[sp.id] && p.x >= sp.hit[0] - 15 && p.x <= sp.hit[2] + 15 && p.y >= sp.hit[1] - 15 && p.y <= sp.hit[3] + 15);
    }

    function bindDrag(th) {
      let p0 = null, moved = false;
      kit.draggable(th.el, {
        // bring to front here, before the pointer is captured: moving the node later would drop the capture
        start(e) { p0 = toSvg(e.clientX, e.clientY); moved = false; if (th.spot?.id !== 'bed2') layer.appendChild(th.el); },
        move(e) {
          const p = toSvg(e.clientX, e.clientY);
          if (!moved) {
            if (Math.hypot(p.x - p0.x, p.y - p0.y) < 14) return;
            moved = true;
            leaveSpot(th);
            th.pose = 'stand'; applyPose(th);
            th.el.classList.add('dh-drag');
            kit.sfx.pickUp();
          }
          th.x = p.x; th.y = p.y + th.h * 0.45;
          place(th);
        },
        end(e) {
          if (!moved) { tapThing(th); return; }
          th.el.classList.remove('dh-drag');
          const p = toSvg(e.clientX, e.clientY);
          const sp = findSpot(th, p);
          if (sp) { toSpot(th, sp); return; }
          // toys and ducks float in a full bath
          if (!th.char && svg.classList.contains('dh-full') && p.x > 650 && p.x < 865 && p.y > 380 && p.y < 572) {
            th.x = Math.max(685, Math.min(830, p.x)); th.y = 470 + th.h * 0.3;
            place(th); th.el.classList.add('dh-float'); kit.sfx.plop(); return;
          }
          drop(th, th.x, th.y);
        },
      });
    }

    function tapThing(th) {
      kit.replay(th.el, 'dh-hop');
      if (th.pose === 'lie') { S.snore(); return; }
      if (th.kind === 'dog') { S.woof(); kit.replay(th.el, 'dh-wag'); }
      else if (th.kind === 'cat') { S.meow(); kit.replay(th.el, 'dh-wag'); }
      else if (th.kind === 'p') { kit.sfx.giggle(); if (Math.random() < 0.35) sayOnce(kit.pick(['Hej!', 'Hihi!', 'Hallo!']), { pitch: th.s < 0.8 ? 1.6 : 1.15 }); }
      else kit.sfx.boing();
    }

    /* ---------- lights, day and night ---------- */
    function updateLights() {
      $$('.dh-dark').forEach(r => { r.style.opacity = lights[r.dataset.room] ? 0 : night ? 0.66 : 0.42; });
      $$('[data-tap="lamp"]').forEach(l => {
        const on = lights[l.dataset.room];
        l.classList.toggle('dh-on', on);
        l.querySelector('.dh-glow').style.opacity = on ? (night ? 1 : 0.55) : 0;
      });
    }

    /* ---------- tappable things ---------- */
    const fx = (text, x, y, cls = 'dh-fx', dx = 20) => {
      const e = el('text', { x, y, class: cls, 'text-anchor': 'middle' });
      e.style.setProperty('--dx', dx + 'px');
      e.textContent = text;
      layer.appendChild(e);
      t.later(() => e.remove(), 2600);
    };
    const flash = (g, cls, ms) => { g.classList.add(cls); t.later(() => g.classList.remove(cls), ms); };
    const TAP = {
      lamp(g) { const r = g.dataset.room; lights[r] = !lights[r]; S.click(); updateLights(); },
      sky() {
        night = !night;
        svg.classList.toggle('dh-night', night);
        updateLights();
        if (night) { kit.tone(392, { dur: 0.8, vol: 0.12 }); kit.tone(330, { at: 0.3, dur: 1, vol: 0.12 }); sayOnce('Godnat!'); }
        else { kit.sfx.chime(); sayOnce('Godmorgen!'); }
      },
      mailbox(g) {
        g.classList.add('dh-up'); S.click(); kit.sfx.fwip();
        addObj('💌', 117, 740, 52);
        t.later(() => g.classList.remove('dh-up'), 1500);
      },
      bush(g) {
        kit.replay(g, 'dh-shake'); kit.sfx.rustle();
        fx(kit.pick(['🦋', '🐝', '🐞', '🐦']), 50, 820, 'dh-fly');
      },
      tree(g) {
        kit.replay(g, 'dh-shake'); kit.sfx.rustle();
        const [ax, ay] = kit.pick([[1240, 615], [1330, 575], [1290, 665], [1360, 655]]);
        t.later(() => addObj('🍎', ax, ay, 46), 150);
      },
      flower(g) { kit.replay(g, 'dh-nod'); kit.sfx.xylo(kit.scaleHz(Math.floor(Math.random() * 8) + 3)); },
      door() {
        const doorG = $('.dh-door').parentNode;
        if (doorG.classList.contains('dh-dooropen')) return;
        S.dingdong();
        const v = VISITORS[visitorIdx++ % VISITORS.length];
        t.later(() => {
          doorG.classList.add('dh-dooropen');
          $('.dh-visitor').innerHTML = `<text x="1073" y="862" font-size="78" text-anchor="middle">${v}</text>`;
          kit.sfx.fwip();
        }, 700);
        t.later(() => sayOnce('Hej!', { pitch: 1.4 }), 1000);
        t.later(() => { $('.dh-visitor').innerHTML = ''; addObj(v, 1000, 880, 80, false); }, 1900);
        t.later(() => { doorG.classList.remove('dh-dooropen'); S.thud(); }, 2300);
      },
      trunk(g) {
        if (g.classList.contains('dh-open')) return;
        g.classList.add('dh-open'); S.creak();
        t.later(() => { kit.sfx.pop(); addObj(TOYS[toyIdx++ % TOYS.length], 810, 200, 60); sparkle(810, 230, 20); }, 250);
        t.later(() => { g.classList.remove('dh-open'); S.thud(); }, 1100);
      },
      spider(g) { if (g.classList.contains('dh-down')) return; g.classList.add('dh-down'); kit.sfx.boing(); t.later(() => { g.classList.remove('dh-down'); kit.sfx.fwip(); }, 1300); },
      mirror() { kit.sfx.chime(); sparkle(1024, 408, 16); },
      sink(g) { flash(g, 'dh-run', 1400); S.water(1.4); },
      toilet(g) {
        if (g.classList.contains('dh-flush')) return;
        flash(g, 'dh-flush', 1300); S.flush();
      },
      bath() {
        const back = $('[data-tap="bath"]');
        if (back.classList.contains('dh-run')) return;
        if (svg.classList.contains('dh-full')) {
          svg.classList.remove('dh-full');
          [0, 0.3, 0.6, 0.9].forEach(a => kit.tone(300, { at: a, dur: 0.15, vol: 0.1, slide: 120 }));
          things.forEach(th => { if (th.el.classList.contains('dh-float') && !th.char) { th.el.classList.remove('dh-float'); drop(th, th.x, th.y); } else th.el.classList.remove('dh-float'); });
          return;
        }
        flash(back, 'dh-run', 1600); S.water(1.6);
        t.later(() => {
          svg.classList.add('dh-full'); kit.sfx.pop(); sparkle(757, 450, 26);
          const sitter = occ.bath; if (sitter) sitter.el.classList.add('dh-float');
        }, 1400);
      },
      fridge(g) {
        clearTimeout(fridgeTimer);
        if (!g.classList.contains('dh-open')) { g.classList.add('dh-open'); S.hum(); kit.sfx.fwip(); }
        else { kit.sfx.pop(); addObj(kit.pick(FOODS), 254, 760, 48); }
        fridgeTimer = t.later(() => { g.classList.remove('dh-open'); S.thud(); }, 3500);
      },
      oven(g) {
        if (ovenBusy) return;
        ovenBusy = true;
        g.classList.add('dh-baking'); S.click(); S.hum();
        t.later(() => S.hum(), 800); t.later(() => S.hum(), 1600);
        t.later(() => {
          g.classList.remove('dh-baking'); S.ding();
          addObj(kit.pick(['🎂', '🍕', '🧁', '🥐', '🍪']), 532, 760, 62);
          sparkle(532, 760, 30);
          ovenBusy = false;
        }, 2600);
      },
      radio(g) {
        if (radioOn) return;
        radioOn = true; g.classList.add('dh-play');
        const tune = kit.pick(TUNES);
        tune.forEach((s, i) => {
          kit.tone(kit.scaleHz(s, 392), { at: i * 0.22, dur: 0.25, type: 'square', vol: 0.06 });
          kit.tone(kit.scaleHz(s, 392) / 2, { at: i * 0.22, dur: 0.2, type: 'triangle', vol: 0.06 });
          if (i % 2 === 0) t.later(() => fx(kit.pick(['🎵', '🎶']), 372, 600, 'dh-fx', kit.rand(-40, 40)), i * 220);
        });
        t.later(() => { radioOn = false; g.classList.remove('dh-play'); }, tune.length * 220 + 200);
      },
      tv() {
        tvCh = (tvCh + 1) % 5;
        S.stat();
        const scr = $('.dh-tvscreen');
        const C = [
          '',
          `<rect x="915" y="725" width="110" height="76" fill="#6ec6ff"/><text class="dh-tvfish" x="890" y="775" font-size="34">🐠</text><text class="dh-tvfish" x="860" y="795" font-size="22" style="animation-delay:-1.4s">🐟</text>`,
          `<rect x="915" y="725" width="110" height="76" fill="#ffe08a"/><text class="dh-tvball" x="970" y="760" font-size="30" text-anchor="middle">⚽</text>`,
          `<rect x="915" y="725" width="110" height="76" fill="#1d2560"/><text class="dh-tvspin" x="970" y="776" font-size="40" text-anchor="middle">⭐</text>`,
          `<rect x="915" y="725" width="110" height="76" fill="#c4f2b0"/><text class="dh-tvdance" x="970" y="792" font-size="50" text-anchor="middle">🐥</text>`,
        ];
        scr.innerHTML = C[tvCh];
        if (tvCh) t.later(() => [0, 2, 4].forEach((s, i) => kit.tone(kit.scaleHz(s + tvCh), { at: i * 0.09, dur: 0.2, type: 'triangle', vol: 0.1 })), 200);
      },
      picture(g) { kit.replay(g, 'dh-shake'); kit.sfx.chime(); },
    };
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('[data-tap]');
      if (!g) return;
      e.preventDefault();
      TAP[g.dataset.tap]?.(g);
    });

    /* ---------- set up ---------- */
    CHARS.forEach(addChar);
    addObj('🧸', 600, 572, 56, false);
    addObj('⚽', 1180, 880, 54, false);
    addObj('🐥', 990, 572, 50, false);
    updateLights();

    // a little life: now and then an awake pet wags or someone hops
    t.every(() => {
      const awake = things.filter(th => th.char && th.pose !== 'lie' && !th.el.classList.contains('dh-drag'));
      if (!awake.length) return;
      const th = kit.pick(awake);
      kit.replay(th.el, th.kind === 'p' ? 'dh-hop' : 'dh-wag');
    }, 5000);

    function layout() {
      const W = root.clientWidth || 1, H = root.clientHeight || 1;
      const s = Math.min(W / 1400, H / 1000);
      const vw = W / s, vh = H / s;
      svg.setAttribute('viewBox', `${700 - vw / 2} ${500 - vh / 2} ${vw} ${vh}`);
    }
    layout();
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); clearTimeout(fridgeTimer); offResize(); };
  },
};
