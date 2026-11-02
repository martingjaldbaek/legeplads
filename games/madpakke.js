/* Madpakken: pack a lunch box, then pack it in the backpack.
 *  1. Drag food from the tray into the box; it drops into the nearest free compartment and is named.
 *     (Dropping on a full box swaps the nearest item.)
 *  2. When all five compartments are full the lid hovers above, glowing – tap it and it clicks shut.
 *  3. A backpack arrives: drag the box into it (or just tap the box).
 *  4. Pull the zip across (or tap the bag and it zips itself). Fanfare, the bag hops off, and a new
 *     box in new colours is ready.
 */
import { BOX, LID, BAG, COMPARTMENTS, ZIP, ART_CSS } from './art/madpakke-art.js';

const FOOD = [
  ['🥪', 'Sandwich'], ['🍎', 'Æble'], ['🍌', 'Banan'], ['🍇', 'Vindruer'], ['🥒', 'Agurk'], ['🥕', 'Gulerod'],
  ['🧀', 'Ost'], ['🥚', 'Æg'], ['🍪', 'Småkage'], ['🍙', 'Risbolle'], ['🥨', 'Kringle'], ['🍐', 'Pære'],
  ['🍊', 'Appelsin'], ['🥝', 'Kiwi'], ['🍓', 'Jordbær'], ['🫐', 'Blåbær'], ['🍅', 'Tomat'], ['🍞', 'Brød'],
];
// [box, lid, bag, bag pocket/straps]
const LOOKS = [['#2ec4b6', '#ff8fab', '#3a86ff', '#7fb2ff'], ['#ffd23f', '#3a86ff', '#ef476f', '#ff8fab'],
  ['#ff8fab', '#8338ec', '#06d6a0', '#7de8c5'], ['#8fd3ff', '#ff8a00', '#8338ec', '#b48cff'], ['#c8f08f', '#ef476f', '#ff8a00', '#ffc078']];

const NS = 'http://www.w3.org/2000/svg';
const CSS = ART_CSS + `
.md-work { position:absolute; display:flex; align-items:center; justify-content:center; gap:5vmin; }
.md-tray { position:absolute; z-index:10; display:grid; gap:1.1vmin; padding:1.5vmin; background:rgba(255,255,255,.72);
  border-radius:3vmin; box-shadow:0 1vmin 0 rgba(0,0,0,.08); transition: opacity .4s, transform .4s; }
.md-tray.away { opacity:0; pointer-events:none; }
.md-src { display:flex; align-items:center; justify-content:center; border-radius:2vmin; background:#fff;
  box-shadow:0 .5vmin 0 rgba(0,0,0,.08); touch-action:none; line-height:1; }
.md-drag { position:absolute; left:0; top:0; z-index:60; line-height:1; pointer-events:none; filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.md-drag.poof { transition: transform .3s ease-in, opacity .3s; opacity:0; }
.md-boxw, .md-bagw { position:relative; flex:none; touch-action:none; }
.md-boxw { transition: transform .6s cubic-bezier(.5,0,.3,1), opacity .5s; }
.md-boxw.lift { transition:none; filter: drop-shadow(0 2vmin 1.5vmin rgba(0,0,0,.25)); }
.md-lid { position:absolute; inset:0; pointer-events:none; opacity:0; transform: translateY(-55%) rotate(-6deg) scale(.7);
  transition: transform .45s cubic-bezier(.6,0,.9,.6), opacity .3s; }
.md-lid.hover { opacity:1; pointer-events:auto; animation: md-hover 1.1s ease-in-out infinite; }
.md-lid.shut { opacity:1; transform:none; animation:none; }
@keyframes md-hover { 0%,100% { transform: translateY(-50%) rotate(-6deg) scale(.7); filter:none }
  50% { transform: translateY(-56%) rotate(-4deg) scale(.7); filter: drop-shadow(0 0 2.5vmin #ffd23f) } }
.md-hint { animation: md-hint 1s ease-in-out infinite; }
@keyframes md-hint { 0%,100% { transform:none; filter:none } 50% { transform: scale(1.05); filter: drop-shadow(0 0 2.5vmin #ffd23f) } }
.md-wiggle { animation: md-wiggle .45s ease; }
@keyframes md-wiggle { 0%,100%{transform:none} 25%{transform:rotate(-3deg) scale(1.03)} 60%{transform:rotate(2deg)} }
.md-food g text { animation: md-pop .35s ease; transform-origin:center; }
@keyframes md-pop { 0% { transform: scale(1.5) } 60% { transform: scale(.9) } 100% { transform:none } }
.md-bagw { transition: transform .8s cubic-bezier(.3,.7,.4,1); }
.md-bagw.off { transform: translateX(150%); }
.md-bagw.offleft { transform: translateX(-150vw); transition-duration: 1.6s; transition-timing-function: ease-in; }
.md-bagw.hop svg { animation: md-hop .4s ease-in-out infinite alternate; }
@keyframes md-hop { from { transform:none } to { transform: translateY(-8%) rotate(-4deg) } }
.md-pull.glow { animation: md-glow .8s ease-in-out infinite alternate; }
@keyframes md-glow { from { filter:none } to { filter: drop-shadow(0 0 6px #ffd23f) drop-shadow(0 0 6px #ffd23f) } }
`;

export default {
  id: 'madpakke',
  title: 'Madpakken',
  icon: '🥪',
  color: '#06a77d',
  edge: '#d9f2e4',

  start(root, kit) {
    root.style.background = 'linear-gradient(#f2fbf6 0 64%, #d9f2e4 64% 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const work = document.createElement('div');
    work.className = 'md-work';
    const boxW = document.createElement('div');
    boxW.className = 'md-boxw';
    boxW.innerHTML = BOX + `<div class="md-lid">${LID}</div>`;
    const bagW = document.createElement('div');
    bagW.className = 'md-bagw off';
    bagW.innerHTML = BAG;
    work.append(boxW, bagW);
    const tray = document.createElement('div');
    tray.className = 'md-tray';
    root.append(work, tray);

    const boxSvg = boxW.querySelector('svg'), foodG = boxSvg.querySelector('.md-food'), lid = boxW.querySelector('.md-lid');
    const bagSvg = bagW.querySelector('svg');
    const hole = bagSvg.querySelector('.md-hole'), zipped = bagSvg.querySelector('.md-zipped'), pull = bagSvg.querySelector('.md-pull');
    pull.style.transformBox = 'view-box';
    // the opening shrinks from the left as the zip closes
    const clip = document.createElementNS(NS, 'clipPath');
    clip.id = 'md-holeclip';
    clip.innerHTML = '<rect x="70" y="0" width="300" height="300"/>';
    bagSvg.prepend(clip);
    hole.setAttribute('clip-path', 'url(#md-holeclip)');
    const clipRect = clip.firstChild;

    let phase = 'fill', look = 0, cell = 70, W = 0, H = 0, zip = 0, lastZipSound = 0;
    const comps = COMPARTMENTS.map(() => null);
    const talk = (el, ms = 700) => { el.classList.add('md-talk'); t.later(() => el.classList.remove('md-talk'), ms); };

    function setLook(i) {
      const [b, l, g, g2] = LOOKS[i];
      root.style.setProperty('--md-box', b); root.style.setProperty('--md-lid', l);
      root.style.setProperty('--md-bag', g); root.style.setProperty('--md-bag2', g2);
    }
    function setZip(p) {
      zip = p;
      const x = ZIP.x0 + (ZIP.x1 - ZIP.x0) * p;
      zipped.setAttribute('width', x - ZIP.x0);
      clipRect.setAttribute('x', x);
      pull.setAttribute('transform', `translate(${x} ${ZIP.y})`);
    }

    /* ---------- tray ---------- */
    const srcs = FOOD.map(item => {
      const s = document.createElement('div');
      s.className = 'md-src';
      s.textContent = item[0];
      tray.appendChild(s);
      let el = null;
      const at = e => { el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -60%)`; };
      kit.draggable(s, {
        start(e) {
          if (phase !== 'fill' && phase !== 'lid') return false;
          el = document.createElement('div');
          el.className = 'md-drag';
          el.textContent = item[0];
          el.style.fontSize = cell * 1.05 + 'px';
          root.appendChild(el);
          at(e);
          kit.sfx.pickUp();
        },
        move: at,
        end(e) {
          if (drop(item, e.clientX, e.clientY)) el.remove();
          else { const d = el; d.classList.add('poof'); d.style.transform += ' scale(0)'; kit.sfx.whoosh(); setTimeout(() => d.remove(), 320); }
          el = null;
        },
      });
      return s;
    });

    function drop(item, x, y) {
      const r = boxW.getBoundingClientRect(), pad = cell * 0.5;
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return false;
      const p = boxSvg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(boxSvg.getScreenCTM().inverse());
      const dist = i => { const [cx, cy, w, h] = COMPARTMENTS[i]; return Math.hypot(q.x - (cx + w / 2), q.y - (cy + h / 2)); };
      const idx = [...comps.keys()];
      const free = idx.filter(i => !comps[i]);
      const i = (free.length ? free : idx).reduce((a, b) => dist(b) < dist(a) ? b : a);
      if (comps[i]) comps[i].remove();
      const [cx, cy, w, h] = COMPARTMENTS[i];
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${cx + w / 2} ${cy + h / 2}) rotate(${kit.rand(-12, 12)})`);
      g.style.transformBox = 'view-box';
      g.innerHTML = `<text font-size="${i === 0 ? 132 : 90}" text-anchor="middle" dominant-baseline="central">${item[0]}</text>`;
      foodG.appendChild(g);
      comps[i] = g;
      kit.sfx.plop();
      kit.replay(boxW, 'md-wiggle');
      t.later(() => kit.say(item[1] + '!', { pitch: 1.25 }), 120);
      if (phase === 'fill' && comps.every(Boolean)) {
        phase = 'lid';
        t.later(() => {
          lid.classList.add('hover');
          kit.sfx.chime();
          kit.say('Låg på!', { pitch: 1.3 });
        }, 900);
      }
      return true;
    }

    /* ---------- lid ---------- */
    function closeLid() {
      phase = 'closing';
      lid.classList.remove('hover');
      lid.classList.add('shut');
      kit.sfx.whoosh();
      t.later(() => {
        kit.noise({ dur: 0.04, vol: 0.4, freq: 2500 });
        kit.noise({ at: 0.09, dur: 0.04, vol: 0.4, freq: 3200 });
        kit.replay(boxW, 'md-wiggle');
        talk(lid, 900);
        kit.say('Klik!', { pitch: 1.4 });
      }, 430);
      t.later(() => {
        phase = 'pack';
        tray.classList.add('away');
        layout();
        void bagW.offsetWidth;
        bagW.classList.remove('off');
        kit.sfx.fwip();
        boxW.classList.add('md-hint');
        t.later(() => kit.say('Ned i tasken!', { pitch: 1.3 }), 500);
      }, 1300);
    }

    /* ---------- box: tap the lid shut, then drag (or tap) it into the bag ---------- */
    let sx = 0, sy = 0, moved = 0;
    kit.draggable(boxW, {
      start(e) {
        if (phase === 'lid') { closeLid(); return false; }
        if (phase !== 'pack') { if (phase === 'fill') { kit.replay(boxW, 'md-wiggle'); kit.sfx.boing(); } return false; }
        sx = e.clientX; sy = e.clientY; moved = 0;
        boxW.classList.remove('md-hint');
        boxW.classList.add('lift');
        kit.sfx.pickUp();
      },
      move(e) {
        moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy));
        boxW.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.04)`;
      },
      end(e) {
        boxW.classList.remove('lift');
        const b = bagW.getBoundingClientRect(), pad = cell;
        const over = e.clientX > b.left - pad && e.clientX < b.right + pad && e.clientY > b.top - pad && e.clientY < b.bottom + pad;
        if (over || moved < 12) intoBag(e.clientX - sx, e.clientY - sy);
        else { boxW.style.transform = ''; boxW.classList.add('md-hint'); kit.sfx.boing(); }
      },
    });

    function intoBag(curX, curY) {
      phase = 'zip';
      const a = boxW.getBoundingClientRect(), b = bagW.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2) + curX, dy = b.top + b.height * 0.24 - (a.top + a.height / 2) + curY;
      boxW.style.transform = `translate(${dx}px, ${dy}px) scale(.22)`;
      boxW.style.opacity = 0;
      t.later(() => {
        kit.sfx.rustle();
        kit.sfx.plop();
        kit.replay(bagW, 'md-wiggle');
        talk(bagSvg, 900);
        pull.classList.add('glow');
        kit.say('Luk tasken!', { pitch: 1.3 });
      }, 550);
    }

    /* ---------- the zip ---------- */
    let zipStartX = 0, zipMoved = 0, autoZip = 0;
    function zipTo(p) {
      if (phase !== 'zip' || p <= zip) return;
      setZip(Math.min(1, p));
      if (zip - lastZipSound > 0.05) {
        lastZipSound = zip;
        kit.noise({ dur: 0.07, vol: 0.18, freq: 2500 + zip * 3000, q: 2 });
      }
      if (zip >= 0.93) finish();
    }
    kit.draggable(bagW, {
      start(e) {
        if (phase !== 'zip') return false;
        zipStartX = e.clientX; zipMoved = 0;
        pull.classList.remove('glow');
        zipAt(e);
      },
      move(e) { zipMoved = Math.max(zipMoved, Math.abs(e.clientX - zipStartX)); zipAt(e); },
      end() {
        if (phase !== 'zip') return;
        if (zipMoved < 12) {   // a tap: the zip closes by itself
          clearInterval(autoZip);
          autoZip = t.every(() => { zipTo(zip + 0.06); if (phase !== 'zip') clearInterval(autoZip); }, 45);
        } else pull.classList.add('glow');
      },
    });
    function zipAt(e) {
      const p = bagSvg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(bagSvg.getScreenCTM().inverse());
      // only counts if the finger is ahead of the pull, but no need to hit the pull itself
      const f = (q.x - ZIP.x0) / (ZIP.x1 - ZIP.x0);
      if (f > zip && f - zip < 0.5) zipTo(f);
    }

    function finish() {
      phase = 'done';
      setZip(1);
      pull.classList.remove('glow');
      kit.noise({ dur: 0.3, vol: 0.2, freq: 5000, q: 2, sweep: 7000 });
      kit.sfx.fanfare();
      kit.bigBurst();
      talk(bagSvg, 2000);
      bagW.classList.add('hop');
      t.later(() => kit.say('Så er madpakken klar!', { pitch: 1.3 }), 300);
      t.later(() => { bagW.classList.add('offleft'); kit.sfx.whoosh(); }, 2600);
      t.later(newRound, 4300);
    }

    function newRound() {
      look = (look + 1) % LOOKS.length;
      setLook(look);
      comps.forEach((g, i) => { if (g) g.remove(); comps[i] = null; });
      lid.classList.remove('hover', 'shut');
      // the box drops in from above
      boxW.style.transition = 'none';
      boxW.style.transform = 'translateY(-120vh)';
      boxW.style.opacity = 1;
      bagW.style.transition = 'none';
      bagW.classList.remove('hop', 'offleft');
      bagW.classList.add('off');
      setZip(0); lastZipSound = 0;
      phase = 'fill';
      tray.classList.remove('away');
      layout();
      void boxW.offsetWidth;
      boxW.style.transition = ''; bagW.style.transition = '';
      boxW.style.transform = '';
      kit.sfx.fwip();
    }

    /* ---------- layout ---------- */
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const portrait = H > W, top = Math.max(64, Math.min(W, H) * 0.09) + 20;
      const packing = phase !== 'fill' && phase !== 'lid';
      let wr;
      if (portrait) {
        cell = Math.min((W * 0.92 - 70) / 6, H * 0.065);
        tray.style.gridTemplateColumns = 'repeat(6, 1fr)';
        Object.assign(tray.style, { left: '50%', right: 'auto', top: 'auto', bottom: '2.5vh', transform: 'translateX(-50%)' });
        const th = packing ? 0 : 3 * cell + Math.min(W, H) * 0.06 + H * 0.025;
        wr = { left: 0, top, width: W, height: H - top - th };
        work.style.flexDirection = 'column';
      } else {
        cell = Math.min(H * 0.115, W * 0.07);
        tray.style.gridTemplateColumns = 'repeat(3, 1fr)';
        Object.assign(tray.style, { left: 'auto', right: '2.5vw', top: '50%', bottom: 'auto', transform: 'translateY(-50%)' });
        const tw = packing ? 0 : 3 * cell + Math.min(W, H) * 0.06 + W * 0.025;
        wr = { left: 0, top: top * 0.5, width: W - tw, height: H - top * 0.5 };
        work.style.flexDirection = 'row';
      }
      tray.style.transform += packing ? (portrait ? ' translateY(120%)' : ' translateX(120%)') : '';
      srcs.forEach(s => { s.style.width = s.style.height = cell + 'px'; s.style.fontSize = cell * 0.72 + 'px'; });
      Object.assign(work.style, { left: wr.left + 'px', top: wr.top + 'px', width: wr.width + 'px', height: wr.height + 'px' });
      let bw, bagw;
      if (!packing) {
        bw = Math.min(wr.width * 0.9, wr.height * 0.66 * 500 / 340);
        bagW.style.display = 'none';
        boxW.style.marginTop = wr.height * 0.14 + 'px';   // room above for the hovering lid
      } else if (portrait) {
        bagw = Math.min(wr.width * 0.6, wr.height * 0.5 * 360 / 440);
        bw = Math.min(wr.width * 0.7, wr.height * 0.32 * 500 / 340);
        bagW.style.display = '';
        boxW.style.marginTop = '0px';
      } else {
        bagw = Math.min(wr.width * 0.36, wr.height * 0.8 * 360 / 440);
        bw = Math.min(wr.width * 0.45, wr.height * 0.6 * 500 / 340);
        bagW.style.display = '';
        boxW.style.marginTop = '0px';
      }
      Object.assign(boxW.style, { width: bw + 'px', height: bw * 340 / 500 + 'px' });
      if (bagw) Object.assign(bagW.style, { width: bagw + 'px', height: bagw * 440 / 360 + 'px' });
    }

    setLook(0);
    setZip(0);
    layout();
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); };
  },
};
