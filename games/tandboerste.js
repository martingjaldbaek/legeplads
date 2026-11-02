/* Tandbørstning: an animal arrives and opens wide. Its teeth are covered in food bits and little smiling bacteria.
 *   1. tap: toothpaste goes on the brush   2. brush: rub the dirt away (foam builds up)
 *   3. rinse: hold the cup over the mouth to pour water and wash the foam out; the animal gargles
 *   4. a big shiny smile, fanfare and confetti, and the next animal walks in.
 * Only one tool is out at a time, glowing. Touching ANYWHERE grabs it, so small fingers can't miss.
 */
import { ANIMALS, head, DIRT, BACT_COLORS, MOUTH, TEETH_X, BRUSH, BRUSH_TIP, TUBE, CUP, CUP_TIP, SPARK, INK } from './art/tand-art.js';

const STEPS = ['paste', 'brush', 'rinse', 'smile'];

const CSS = `
.tb-head { position:absolute; left:0; top:0; will-change:transform; transition: transform 1s cubic-bezier(.3,1.2,.5,1); }
.tb-head.gone-l { transform: translateX(-130vw) !important; transition: none; }
.tb-head.gone-r { transition: transform .9s cubic-bezier(.6,-.3,.8,.6); }
.tb-head-in { width:100%; height:100%; }
.tb-head-in.bob { animation: tb-bob 1.6s ease-in-out infinite; }
.tb-head-in.gargle { animation: tb-gargle .18s ease-in-out infinite; }
.tb-head-in.jump { animation: tb-jump .5s ease; }
.tb-svg { width:100%; height:100%; display:block; overflow:visible; }
.tb-svg * { transform-box: fill-box; }
.tb-open { transform-origin: 50% 50%; transform: scaleY(.04); opacity:0; transition: transform .45s cubic-bezier(.3,1.5,.5,1), opacity .2s; }
.tb-head.open .tb-open { transform:none; opacity:1; }
.tb-head.open .tb-closed { display:none; }
.tb-eyes { transform-origin: center; animation: tb-blink 4s infinite; }
.tb-water { transition: y .3s, height .3s; }
.tb-d { transition: opacity .3s; }
.tb-d > g { transform-origin: center; animation: tb-wob 1.2s ease-in-out infinite; }
.tb-d.bact > g { animation-duration: .7s; }
.tb-d.fly > g { animation: tb-fly .6s ease-in forwards; }
.tb-f > g { transform-origin: center; animation: tb-foam-in .25s ease-out; }
.tb-f.wash > g { transition: opacity .4s, transform .4s; opacity:0; transform: translateY(30px) scale(.4); }
.tb-s > g { transform-origin: center; animation: tb-twinkle 1s ease-in-out infinite; }
.tb-tool { position:absolute; left:0; top:0; z-index:20; pointer-events:none; will-change:transform; }
.tb-tool.rest { transition: transform .45s cubic-bezier(.3,1.3,.5,1); }
.tb-tool-svg { width:100%; height:100%; display:block; overflow:visible; }
.tb-tool .tb-inner { width:100%; height:100%; transition: transform .2s, opacity .3s, filter .3s; transform-origin: 15% 20%; }
.tb-tool.off .tb-inner { opacity:.3; filter: grayscale(.8); }
.tb-tool.on.rest .tb-inner { animation: tb-glow 1.1s ease-in-out infinite; }
.tb-tool.pour .tb-inner { transform: rotate(-55deg); }
.tb-tool .tb-paste { opacity:0; transform-origin: 50% 100%; transform: scale(.2); transition: transform .3s cubic-bezier(.3,1.6,.5,1), opacity .2s; }
.tb-tool.pasted .tb-paste { opacity:1; transform:none; }
.tb-tool .tb-blob { opacity:0; }
.tb-tool.squeeze .tb-tube-body { animation: tb-squeeze .5s ease; transform-origin: 100% 50%; }
.tb-tool.squeeze .tb-blob { animation: tb-blob .5s ease; }
.tb-stream { position:absolute; left:0; top:0; z-index:19; width:28px; border-radius:14px; pointer-events:none; opacity:0;
  background: repeating-linear-gradient(180deg, #7cc8ff 0 18px, #a8dcff 18px 30px); transition: opacity .15s;
  animation: tb-flow .3s linear infinite; }
.tb-stream.on { opacity:.9; }
.tb-steps { position:absolute; z-index:15; left:50%; top: calc(env(safe-area-inset-top) + 16px); transform: translateX(-50%);
  display:flex; gap:1.6vmin; padding:1vmin 2vmin; border-radius:99px; background: rgba(255,255,255,.6); }
.tb-step { width:7vmin; height:7vmin; display:flex; align-items:center; justify-content:center; border-radius:50%;
  background:#fff; opacity:.35; transition: all .3s; font-size:4.4vmin; line-height:1; }
.tb-step svg { width:80%; height:80%; overflow:visible; }
.tb-step.now { opacity:1; transform: scale(1.25); box-shadow: 0 0 0 .6vmin #ffd23f; }
.tb-step.done { opacity:1; background:#b8f2c8; }
@keyframes tb-bob { 0%,100%{transform:none} 50%{transform:translateY(-1.2%) rotate(.6deg)} }
@keyframes tb-gargle { 0%,100%{transform:none} 50%{transform:translateY(-1%) scaleX(1.02) rotate(-1deg)} }
@keyframes tb-jump { 0%,100%{transform:none} 40%{transform:translateY(-8%) scale(1.04)} 70%{transform:translateY(1%) scale(1.02,.97)} }
@keyframes tb-blink { 0%,93%,100%{transform:none} 96%{transform:scaleY(.1)} }
@keyframes tb-wob { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg) scale(1.08)} }
@keyframes tb-fly { to { transform: translate(0,-160px) rotate(540deg) scale(.2); opacity:0 } }
@keyframes tb-foam-in { from { transform: scale(0) } to { transform: none } }
@keyframes tb-twinkle { 0%,100%{transform:scale(.4) rotate(0); opacity:.3} 50%{transform:scale(1.2) rotate(45deg); opacity:1} }
@keyframes tb-glow { 0%,100%{transform:none; filter: drop-shadow(0 0 0 #ffd23f)} 50%{transform: translateY(-6%) scale(1.06); filter: drop-shadow(0 0 2vmin #ffd23f)} }
@keyframes tb-squeeze { 0%,100%{transform:none} 40%{transform:scaleY(.6)} }
@keyframes tb-blob { 0%{opacity:0; transform:scale(.2)} 40%{opacity:1; transform:scale(1.2)} 100%{opacity:0; transform: translateX(-40px)} }
@keyframes tb-flow { from { background-position-y: 0 } to { background-position-y: 30px } }
`;

export default {
  id: 'tandboerste',
  title: 'Tandbørstning',
  icon: '🪥',
  color: '#00b4d8',
  edge: '#bfe9f2',

  start(root, kit) {
    root.style.background = 'linear-gradient(#e6fbff 0 72%, #bfe9f2 72%), #e6fbff';
    root.style.backgroundImage = 'repeating-linear-gradient(90deg, rgba(255,255,255,.55) 0 2px, transparent 2px 9vmin), repeating-linear-gradient(0deg, rgba(255,255,255,.55) 0 2px, transparent 2px 9vmin), linear-gradient(#e6fbff 0 72%, #bfe9f2 72%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    let alive = true;

    // ---------- DOM ----------
    const stepsEl = document.createElement('div');
    stepsEl.className = 'tb-steps';
    const stepIcons = [TUBE, BRUSH, CUP, `<svg viewBox="-20 -20 40 40">${SPARK}</svg>`];
    stepsEl.innerHTML = stepIcons.map(s => `<div class="tb-step">${s}</div>`).join('');
    const stepEls = [...stepsEl.children];
    const stream = document.createElement('div');
    stream.className = 'tb-stream';
    const mkTool = (svg, tip, aspect) => {
      const el = document.createElement('div');
      el.className = 'tb-tool rest off';
      el.innerHTML = `<div class="tb-inner">${svg}</div>`;
      root.appendChild(el);
      return { el, tip, aspect, w: 100, h: 100, slot: [0, 0] };
    };
    root.append(stepsEl, stream);
    const tools = {
      paste: mkTool(TUBE, [0, 0.5], 260 / 110),
      brush: mkTool(BRUSH, BRUSH_TIP, 300 / 104),
      rinse: mkTool(CUP, CUP_TIP, 140 / 160),
    };

    let headEl = null, svg = null, animal = -1, S = 300, hx = 0, hy = 0;
    let step = null, dirt = [], foam = [], held = null, last = null, pourT = 0, lastSound = 0;

    // ---------- layout ----------
    function layout() {
      const W = root.clientWidth, H = root.clientHeight, portrait = H > W;
      let slots;
      if (portrait) {
        S = Math.min(W * 0.9, H * 0.56); hx = W / 2; hy = H * 0.42;
        slots = [[W * 0.2, H * 0.85], [W * 0.5, H * 0.85], [W * 0.8, H * 0.85]];
      } else {
        S = Math.min(W * 0.6, H * 0.8); hx = W * 0.4; hy = H * 0.55;
        slots = [[W * 0.84, H * 0.3], [W * 0.84, H * 0.55], [W * 0.84, H * 0.8]];
      }
      const maxW = portrait ? W * 0.27 : W * 0.24;
      const widths = { paste: Math.min(S * 0.42, maxW), brush: Math.min(S * 0.55, maxW), rinse: Math.min(S * 0.24, maxW * 0.6) };
      ['paste', 'brush', 'rinse'].forEach((k, i) => {
        const tl = tools[k];
        tl.w = widths[k]; tl.h = tl.w / tl.aspect; tl.slot = slots[i];
        Object.assign(tl.el.style, { width: tl.w + 'px', height: tl.h + 'px' });
        if (held?.tool !== tl) restTool(tl);
      });
      stream.style.height = H * 0.3 + 'px';
      if (headEl) placeHead();
    }
    function placeHead() {
      Object.assign(headEl.style, { width: S + 'px', height: S + 'px' });
      if (!headEl.classList.contains('gone-r')) headEl.style.transform = `translate(${hx - S / 2}px, ${hy - S / 2}px)`;
    }
    function restTool(tl) {
      tl.el.classList.add('rest');
      tl.el.style.transform = `translate(${tl.slot[0] - tl.w / 2}px, ${tl.slot[1] - tl.h / 2}px)`;
    }
    function toolAt(tl, x, y) {   // put the tool's working tip at (x, y)
      tl.el.style.transform = `translate(${x - tl.tip[0] * tl.w}px, ${y - tl.tip[1] * tl.h}px)`;
    }

    // screen → head-SVG coordinates
    function svgPt(x, y) {
      const m = svg.getScreenCTM();
      if (!m) return { x: -999, y: -999 };
      const p = new DOMPoint(x, y).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }
    const NS = 'http://www.w3.org/2000/svg';
    const g = (parent, html, cls, x, y) => {
      const el = document.createElementNS(NS, 'g');
      el.setAttribute('class', cls);
      el.setAttribute('transform', `translate(${x} ${y})`);
      el.innerHTML = `<g>${html}</g>`;
      parent.appendChild(el);
      return el;
    };

    // ---------- steps ----------
    function setStep(s) {
      step = s;
      const i = STEPS.indexOf(s);
      stepEls.forEach((el, j) => { el.classList.toggle('now', j === i); el.classList.toggle('done', j < i); });
      Object.entries(tools).forEach(([k, tl]) => {
        tl.el.classList.toggle('on', k === s);
        tl.el.classList.toggle('off', k !== s);
      });
      const words = { paste: 'Tandpasta!', brush: 'Børst!', rinse: 'Skyl!' };
      if (words[s]) t.later(() => kit.say(words[s], { pitch: 1.3 }), 250);
    }

    function nextAnimal() {
      if (!alive) return;
      let i;
      do { i = Math.floor(Math.random() * ANIMALS.length); } while (i === animal && ANIMALS.length > 1);
      animal = i;
      headEl = document.createElement('div');
      headEl.className = 'tb-head gone-l';
      headEl.innerHTML = `<div class="tb-head-in bob">${head(i)}</div>`;
      root.insertBefore(headEl, stepsEl);
      svg = headEl.querySelector('svg');
      placeHead();
      dirt = []; foam = []; pourT = 0;
      tools.brush.el.classList.remove('pasted');
      step = 'arrive';
      stepEls.forEach(el => el.classList.remove('now', 'done'));
      Object.values(tools).forEach(tl => { tl.el.classList.remove('on'); tl.el.classList.add('off'); });
      void headEl.offsetWidth;
      headEl.classList.remove('gone-l');
      placeHead();
      // footsteps
      for (let k = 0; k < 5; k++) kit.tone(k % 2 ? 180 : 220, { at: k * 0.16, dur: 0.1, type: 'triangle', vol: 0.12 });
      t.later(() => kit.say(`${ANIMALS[i][1]}. Gab op!`, { pitch: 1.2 }), 700);
      t.later(openWide, 1700);
    }

    function openWide() {
      if (!alive) return;
      headEl.classList.add('open');
      kit.tone(260, { dur: 0.6, type: 'triangle', vol: 0.15, slide: 420 });
      // dirt on the teeth and in the mouth
      const spots = [];
      TEETH_X.forEach(c => { spots.push([c, 190]); spots.push([c, 316]); });
      spots.push([150, 250], [250, 250], [200, 236]);
      const layer = svg.querySelector('.tb-dirt');
      kit.shuffle(spots).slice(0, 10).forEach(([x, y], k) => {
        const bact = k % 2 === 0;
        const kind = bact ? 'bakterie' : kit.pick(['krumme', 'salat', 'baer', 'ost']);
        const html = bact ? DIRT.bakterie(kit.pick(BACT_COLORS)) : DIRT[kind]();
        const el = g(layer, html, 'tb-d' + (bact ? ' bact' : ''), x + kit.rand(-6, 6), y + kit.rand(-6, 6));
        el.firstChild.style.animationDelay = (-Math.random()).toFixed(2) + 's';
        dirt.push({ el, x: x, y: y, life: 1, bact });
      });
      t.later(() => setStep('paste'), 600);
    }

    // ---------- pointer: tap anywhere / hold to use the current tool ----------
    function down(e) {
      if (held || !step) return;
      if (step === 'paste') { squeeze(); return; }
      if (step === 'smile') { cheer(); return; }
      if (step !== 'brush' && step !== 'rinse') return;
      e.preventDefault();
      const tl = tools[step];
      held = { tool: tl, id: e.pointerId };
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      tl.el.classList.remove('rest');
      kit.sfx.pickUp();
      last = null;
      move(e);
    }
    function move(e) {
      if (!held || e.pointerId !== held.id) return;
      const lift = Math.min(root.clientWidth, root.clientHeight) * 0.05;
      const x = e.clientX, y = e.clientY - lift;
      toolAt(held.tool, x, y);
      const p = svgPt(x, y);
      if (step === 'brush') brushAt(p);
      if (step === 'rinse') pourAt(p, x, y);
    }
    function up(e) {
      if (!held || e.pointerId !== held.id) return;
      const tl = held.tool;
      held = null;
      tl.el.classList.remove('pour');
      stream.classList.remove('on');
      restTool(tl);
    }
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);

    function squeeze() {
      step = 'squeezing';
      kit.replay(tools.paste.el, 'squeeze');
      kit.noise({ dur: 0.35, vol: 0.18, freq: 600, q: 0.8, sweep: 1500 });
      kit.tone(300, { dur: 0.3, type: 'triangle', vol: 0.12, slide: 600 });
      t.later(() => { tools.brush.el.classList.add('pasted'); kit.sfx.plop(); }, 350);
      t.later(() => setStep('brush'), 800);
    }

    const inMouth = p => p.x > MOUTH.x - 40 && p.x < MOUTH.x + MOUTH.w + 40 && p.y > MOUTH.y - 40 && p.y < MOUTH.y + MOUTH.h + 40;

    function brushAt(p) {
      if (!last) { last = p; return; }
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      last = p;
      if (!inMouth(p) || d < 0.5) return;
      const now = performance.now();
      if (now - lastSound > 70) { lastSound = now; kit.noise({ dur: 0.06, vol: 0.09, freq: kit.rand(2800, 4200), q: 1.2 }); }
      // foam
      if (foam.length < 55 && Math.random() < Math.min(1, d / 22)) {
        const r = kit.rand(8, 18);
        const f = g(svg.querySelector('.tb-foam'), `<circle r="${r}" fill="#fff" stroke="#cfeaff" stroke-width="2.5"/><circle cx="${-r / 3}" cy="${-r / 3}" r="${r / 4}" fill="#e8f6ff"/>`,
          'tb-f', p.x + kit.rand(-30, 30), p.y + kit.rand(-24, 24));
        foam.push({ el: f, x: p.x, y: p.y });
      }
      // rub dirt
      dirt.forEach(it => {
        if (it.life <= 0) return;
        if (Math.hypot(p.x - it.x, p.y - it.y) > 60) return;
        it.life -= d / 110;
        it.el.firstChild.style.scale = 0.55 + 0.45 * Math.max(0, it.life);
        if (it.life <= 0) clean(it);
      });
      checkBrushed();
    }
    function clean(it) {
      it.life = 0;
      if (it.bact) { kit.sfx.squeak(); t.later(() => kit.sfx.squeak(), 90); it.el.classList.add('fly'); }
      else { kit.sfx.pop(kit.pick([3, 5, 7, 9])); it.el.style.opacity = 0; }
      const r = svg.getBoundingClientRect();
      kit.burst(r.left + it.x / 400 * r.width, r.top + it.y / 400 * r.height, 8, 0.5);
      t.later(() => it.el.remove(), 700);
    }
    let sweepTimer = null;
    function checkBrushed() {
      const left = dirt.filter(it => it.life > 0);
      if (!left.length) { brushed(); return; }
      // generous: once most of it is gone, the stragglers give up by themselves
      if (left.length <= Math.ceil(dirt.length * 0.25) && !sweepTimer) {
        sweepTimer = t.later(() => { sweepTimer = null; if (step === 'brush') { dirt.filter(it => it.life > 0).forEach(clean); brushed(); } }, 1800);
      }
    }
    function brushed() {
      if (step !== 'brush') return;
      if (sweepTimer) { clearTimeout(sweepTimer); sweepTimer = null; }
      kit.sfx.chime();
      step = 'between';
      if (held) { const tl = held.tool; held = null; restTool(tl); }
      tools.brush.el.classList.remove('pasted');
      t.later(() => setStep('rinse'), 900);
    }

    function pourAt(p, x, y) {
      const over = inMouth(p) || (p.x > MOUTH.x - 60 && p.x < MOUTH.x + MOUTH.w + 60 && p.y < MOUTH.y + 40 && p.y > -80);
      held.tool.el.classList.toggle('pour', over);
      stream.classList.toggle('on', over);
      if (!over) return;
      stream.style.transform = `translate(${x - 14}px, ${y}px)`;
      const now = performance.now();
      const dt = last ? Math.min(100, now - last.t) : 16;
      last = { t: now };
      pourT += dt / 1000;
      if (now - lastSound > 110) { lastSound = now; kit.noise({ dur: 0.18, vol: 0.12, freq: kit.rand(700, 1200), q: 0.7 }); }
      const level = Math.min(1, pourT / 2.2);
      const water = svg.querySelector('.tb-water');
      water.setAttribute('y', MOUTH.y + MOUTH.h * (1 - 0.7 * level));
      water.setAttribute('height', MOUTH.h * 0.7 * level);
      foam.forEach(f => {
        if (f.gone) return;
        if (Math.abs(f.x - p.x) < 90 || Math.random() < 0.02) { f.gone = true; f.el.classList.add('wash'); t.later(() => f.el.remove(), 450); }
      });
      if (pourT > 2.2) rinsed();
    }
    // the stream keeps pouring while the finger is still
    t.every(() => { if (held && step === 'rinse' && stream.classList.contains('on')) pourAt(svgPt(...lastPos()), ...lastPos()); }, 100);
    function lastPos() {
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(stream.style.transform) || [0, 0, 0];
      return [+m[1] + 14, +m[2]];
    }

    function rinsed() {
      step = 'gargle';
      if (held) { const tl = held.tool; held = null; tl.el.classList.remove('pour'); restTool(tl); }
      stream.classList.remove('on');
      foam.forEach(f => f.el.remove()); foam = [];
      headEl.classList.remove('open');
      const inner = headEl.firstChild;
      inner.classList.remove('bob'); inner.classList.add('gargle');
      for (let k = 0; k < 12; k++) kit.noise({ at: k * 0.1, dur: 0.09, vol: 0.14, freq: k % 2 ? 380 : 520, q: 2 });
      kit.tone(160, { dur: 1.2, type: 'triangle', vol: 0.06, slide: 220 });
      t.later(() => {
        inner.classList.remove('gargle'); inner.classList.add('bob');
        kit.sfx.whoosh();   // spit!
        const water = svg.querySelector('.tb-water');
        water.setAttribute('y', MOUTH.y + MOUTH.h); water.setAttribute('height', 0);
        smile();
      }, 1300);
    }

    function smile() {
      setStep('smile');
      headEl.classList.add('open');
      const layer = svg.querySelector('.tb-spark');
      TEETH_X.forEach((c, k) => {
        [[c, 186], [c, 314]].forEach(([x, y], j) => {
          const s = g(layer, SPARK, 'tb-s', x + kit.rand(-8, 8), y + kit.rand(-8, 8));
          s.firstChild.style.animationDelay = ((k * 2 + j) * 0.12).toFixed(2) + 's';
        });
      });
      kit.sfx.fanfare();
      kit.bigBurst();
      t.later(() => kit.say(`${ANIMALS[animal][1]} har skinnende rene tænder!`, { pitch: 1.2 }), 400);
      t.later(leave, 4800);
    }
    function cheer() {
      kit.replay(headEl.firstChild, 'jump');
      kit.sfx.giggle();
      const r = svg.getBoundingClientRect();
      kit.burst(r.left + r.width / 2, r.top + r.height * 0.6, 25, 0.8);
    }
    function leave() {
      if (!alive || step !== 'smile') return;
      step = null;
      const old = headEl;
      old.classList.add('gone-r');
      old.style.transform = `translate(${root.clientWidth + 40}px, ${hy - S / 2}px) rotate(8deg)`;
      for (let k = 0; k < 5; k++) kit.tone(k % 2 ? 180 : 220, { at: k * 0.16, dur: 0.1, type: 'triangle', vol: 0.12 });
      t.later(() => old.remove(), 1000);
      t.later(nextAnimal, 700);
    }

    layout();
    const offResize = kit.onResize(root, layout);
    t.later(nextAnimal, 200);
    return () => {
      alive = false;
      t.clear(); offResize();
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up);
      root.removeEventListener('pointercancel', up);
    };
  },
};
