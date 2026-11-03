/* Bilvask og værksted: a muddy vehicle drives in. Wash it, then fix it up in the garage:
 *   1. sponge: rub the mud off (foam builds up)   2. hose: spray the foam away   3. towel: wipe off the drops – it sparkles
 *   4. pssst, two flat tyres: drag the new tyres on   5. drag the petrol nozzle to the fuel cap and watch it fill
 *   6. tap: honk honk! It drives off happy and the next vehicle (car, lorry, bus, tractor) arrives.
 * Only one tool is out at a time, glowing. Touching ANYWHERE grabs it, so small fingers can't miss.
 */
import { VEHICLES, wheel, MUD, blob, SPONGE, SPONGE_TIP, HOSE, HOSE_TIP, TOWEL, TOWEL_TIP, NOZZLE, NOZZLE_TIP, NOZZLE_HOSE,
  PUMP, NEW_TYRE, HORN, SPARK, INK } from './art/bil-art.js';

const STEPS = ['soap', 'rinse', 'dry', 'tyre', 'fuel', 'honk'];
const NS = 'http://www.w3.org/2000/svg';

const CSS = `
.bv-ground { position:absolute; left:0; right:0; bottom:0; background: linear-gradient(#8d99ae, #6c7891); border-top: 1vmin solid #4a3b5c; }
.bv-ground::after { content:''; position:absolute; left:0; right:0; top:40%; height:1.2vmin;
  background: repeating-linear-gradient(90deg, #fff 0 8vmin, transparent 8vmin 16vmin); opacity:.8; }
.bv-car { position:absolute; left:0; top:0; z-index:5; will-change:transform; }
.bv-car.drive { transition: transform 1.6s cubic-bezier(.25,.8,.35,1); }
.bv-car.away { transition: transform 1.4s cubic-bezier(.6,0,.9,.6); }
.bv-car-in { width:100%; height:100%; transform-origin: 50% 100%; }
.bv-car-in.bounce { animation: bv-bounce .45s ease; }
.bv-car-in.idle { animation: bv-idle 1.8s ease-in-out infinite; }
.bv-car-in.sag { transform: rotate(-1.5deg) translateY(2%); transition: transform .4s; }
.bv-svg { width:100%; height:100%; display:block; overflow:visible; }
.bv-svg * { transform-box: fill-box; }
.bv-spin { transform-origin: center; }
.bv-car.driving .bv-spin { animation: bv-spin .45s linear infinite; }
.bv-w { transform-origin: 50% 100%; transition: transform .35s cubic-bezier(.3,1.5,.5,1); }
.bv-w.flat { transform: scale(1.2, .68); }
.bv-w.new { animation: bv-pop .45s cubic-bezier(.3,1.6,.5,1); }
.bv-w.roll { transition: transform 1s ease-in, opacity 1s; transform: translate(-260px, 0) rotate(-400deg); opacity:0; }
.bv-eyes { transform-origin: center; animation: bv-blink 4s infinite; }
.bv-svg .m-open { display:none; }
.bv-car.happy .m-open { display:inline; } .bv-car.happy .m-closed { display:none; }
.bv-mud > g, .bv-drop > g { transition: opacity .3s, transform .3s; transform-origin: center; }
.bv-mud.gone > g, .bv-drop.gone > g { opacity:0; transform: scale(.2); }
.bv-foam > g { transform-origin: center; animation: bv-in .25s ease-out; }
.bv-foam.gone > g { transition: opacity .4s, transform .4s; opacity:0; transform: translateY(30px) scale(.3); }
.bv-drop > g { animation: bv-in .3s ease-out; }
.bv-s > g { transform-origin: center; animation: bv-twinkle 1s ease-in-out infinite; }
.bv-cap { transform-origin: center; animation: bv-glowcap 1s ease-in-out infinite; }
.bv-tool { position:absolute; left:0; top:0; z-index:20; pointer-events:none; will-change:transform; transition: opacity .3s; }
.bv-tool.rest { transition: transform .45s cubic-bezier(.3,1.3,.5,1), opacity .3s; }
.bv-tool.hide { opacity:0; }
.bv-tool-svg { width:100%; height:100%; display:block; overflow:visible; }
.bv-tool .bv-inner { width:100%; height:100%; transition: opacity .3s, filter .3s; }
.bv-tool.off .bv-inner { opacity:.3; filter: grayscale(.8); }
.bv-tool.on.rest .bv-inner { animation: bv-glow 1.1s ease-in-out infinite; }
.bv-pump { position:absolute; left:0; top:0; z-index:4; transition: opacity .4s, transform .4s; }
.bv-pump.hide { opacity:0; transform: translateY(20%); pointer-events:none; }
.bv-pump-svg { width:100%; height:100%; display:block; overflow:visible; }
.bv-gauge { transition: width .25s; }
.bv-hose { position:absolute; inset:0; width:100%; height:100%; z-index:19; pointer-events:none; overflow:visible; transition: opacity .4s; }
.bv-drip { position:absolute; left:0; top:0; z-index:21; width:2vmin; height:2.6vmin; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background:#7cc8ff; pointer-events:none; animation: bv-spray .5s ease-in forwards; }
.bv-steps { position:absolute; z-index:15; left:50%; top: calc(env(safe-area-inset-top) + 16px); transform: translateX(-50%);
  display:flex; gap:1.4vmin; padding:1vmin 2vmin; border-radius:99px; background: rgba(255,255,255,.6); }
.bv-step { width:6.6vmin; height:6.6vmin; display:flex; align-items:center; justify-content:center; border-radius:50%;
  background:#fff; opacity:.35; transition: all .3s; }
.bv-step svg { width:78%; height:78%; overflow:visible; }
.bv-step.now { opacity:1; transform: scale(1.25); box-shadow: 0 0 0 .6vmin #ffd23f; }
.bv-step.done { opacity:1; background:#b8f2c8; }
@keyframes bv-spin { to { transform: rotate(360deg) } }
@keyframes bv-bounce { 0%,100%{transform:none} 35%{transform: translateY(-6%) scale(1.02,.98)} 70%{transform: translateY(1%) scale(1.02,.97)} }
@keyframes bv-idle { 0%,100%{transform:none} 50%{transform: translateY(-.6%)} }
@keyframes bv-pop { 0%{transform: scale(.2)} 100%{transform:none} }
@keyframes bv-blink { 0%,93%,100%{transform:none} 96%{transform:scaleY(.1)} }
@keyframes bv-in { from { transform: scale(0) } to { transform:none } }
@keyframes bv-twinkle { 0%,100%{transform:scale(.4) rotate(0); opacity:.3} 50%{transform:scale(1.3) rotate(45deg); opacity:1} }
@keyframes bv-glowcap { 0%,100%{transform:scale(1); opacity:.6} 50%{transform:scale(1.5); opacity:1} }
@keyframes bv-glow { 0%,100%{transform:none; filter: drop-shadow(0 0 0 #ffd23f)} 50%{transform: translateY(-6%) scale(1.06); filter: drop-shadow(0 0 2vmin #ffd23f)} }
@keyframes bv-spray { from { transform: var(--from) scale(1) } to { transform: var(--to) scale(.5); opacity:.2 } }
`;

export default {
  id: 'bilvask',
  title: 'Bilvask',
  icon: '🚗',
  color: '#ff4d6d',
  edge: '#6c7891',

  start(root, kit) {
    root.style.background = 'linear-gradient(#bfe6ff, #eaf7ff)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    let alive = true;

    // ---------- DOM ----------
    const ground = document.createElement('div');
    ground.className = 'bv-ground';
    const stepsEl = document.createElement('div');
    stepsEl.className = 'bv-steps';
    stepsEl.innerHTML = [SPONGE, HOSE, TOWEL, NEW_TYRE(40), NOZZLE, HORN].map(s => `<div class="bv-step">${s}</div>`).join('');
    const stepEls = [...stepsEl.children];
    const pump = document.createElement('div');
    pump.className = 'bv-pump hide';
    pump.innerHTML = PUMP;
    const hoseSvg = document.createElementNS(NS, 'svg');
    hoseSvg.setAttribute('class', 'bv-hose');
    hoseSvg.innerHTML = `<path fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path fill="none" stroke="#3d3550" stroke-width="9" stroke-linecap="round"/>`;
    hoseSvg.style.opacity = 0;
    root.append(ground, pump, hoseSvg, stepsEl);

    const mkTool = (svg, tip, aspect, cls = '') => {
      const el = document.createElement('div');
      el.className = 'bv-tool rest off ' + cls;
      el.innerHTML = `<div class="bv-inner">${svg}</div>`;
      root.appendChild(el);
      return { el, tip, aspect, w: 100, h: 100, slot: [0, 0] };
    };
    const tools = {
      soap: mkTool(SPONGE, SPONGE_TIP, 160 / 110),
      rinse: mkTool(HOSE, HOSE_TIP, 170 / 130),
      dry: mkTool(TOWEL, TOWEL_TIP, 160 / 120),
    };
    const tyres = [mkTool(NEW_TYRE(40), [0.5, 0.5], 1, 'hide'), mkTool(NEW_TYRE(40), [0.5, 0.5], 1, 'hide')];
    const nozzle = mkTool(NOZZLE, NOZZLE_TIP, 150 / 110, 'hide');
    const horn = mkTool(HORN, [0.5, 0.5], 1, 'hide');

    let car = null, svg = null, vi = -1, V = null, k = 1, carX = 0, carY = 0, VW = 500, W = 0, H = 0, portrait = false, groundY = 0;
    let step = null, held = null, last = null, lastSound = 0, sprayT = 0, fuel = 0, inserted = false;
    let mud = [], foam = [], drops = [], wheels = [];

    // ---------- layout ----------
    function layout() {
      W = root.clientWidth; H = root.clientHeight; portrait = H > W;
      let slots;
      if (portrait) {
        VW = W * 0.94; groundY = H * 0.62; carX = W / 2;
        slots = [[W * 0.2, H * 0.82], [W * 0.5, H * 0.82], [W * 0.8, H * 0.82]];
      } else {
        VW = Math.min(W * 0.66, H * 0.6 * 500 / 320); groundY = H * 0.78; carX = W * 0.38;
        slots = [[W * 0.86, H * 0.3], [W * 0.86, H * 0.52], [W * 0.86, H * 0.74]];
      }
      k = VW / 500;
      carY = groundY - 292 * k;
      ground.style.top = groundY - 4 + 'px';
      const T = Math.min(W, H) * (portrait ? 0.22 : 0.19);
      ['soap', 'rinse', 'dry'].forEach((key, i) => sizeTool(tools[key], T, slots[i]));
      sizeTool(tyres[0], T * 0.8, slots[0]); sizeTool(tyres[1], T * 0.8, slots[2]);
      sizeTool(horn, T * 0.9, slots[1]);
      // petrol pump stands on the ground at the side
      const ph = portrait ? H * 0.24 : H * 0.42, pw = ph * 160 / 300;
      const px = portrait ? W * 0.78 : W * 0.84, pBottom = portrait ? H * 0.95 : groundY + H * 0.02;
      Object.assign(pump.style, { width: pw + 'px', height: ph + 'px', left: px - pw / 2 + 'px', top: pBottom - ph + 'px' });
      pump.dataset.box = JSON.stringify([px - pw / 2, pBottom - ph, pw, ph]);
      sizeTool(nozzle, T * 0.75, [px - pw / 2 - T * 0.25, pBottom - ph * 0.5]);
      if (inserted) nozzleToCap();
      if (car) placeCar();
      drawHose();
    }
    function sizeTool(tl, w, slot) {
      tl.w = w; tl.h = w / tl.aspect; tl.slot = slot;
      Object.assign(tl.el.style, { width: tl.w + 'px', height: tl.h + 'px' });
      if (held?.tool !== tl && !tl.used) restTool(tl);
    }
    function restTool(tl) {
      tl.el.classList.add('rest');
      tl.el.style.transform = `translate(${tl.slot[0] - tl.w / 2}px, ${tl.slot[1] - tl.h / 2}px)`;
    }
    function toolAt(tl, x, y) { tl.el.style.transform = `translate(${x - tl.tip[0] * tl.w}px, ${y - tl.tip[1] * tl.h}px)`; }
    function toolTip(tl) {
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(tl.el.style.transform);
      return m ? [+m[1] + tl.tip[0] * tl.w, +m[2] + tl.tip[1] * tl.h] : [0, 0];
    }
    function placeCar(offX = 0) {
      Object.assign(car.style, { width: VW + 'px', height: 320 * k + 'px' });
      car.style.transform = `translate(${carX - VW / 2 + offX}px, ${carY}px)`;
    }
    function drawHose() {
      const box = pump.dataset.box && JSON.parse(pump.dataset.box);
      if (!box) return;
      const [px, py, pw, ph] = box;
      const [nx, ny] = toolTip(nozzle);
      const ax = nx - nozzle.tip[0] * nozzle.w + NOZZLE_HOSE[0] * nozzle.w, ay = ny - nozzle.tip[1] * nozzle.h + NOZZLE_HOSE[1] * nozzle.h;
      const sx = px + pw * 0.92, sy = py + ph * 0.48;
      const sag = Math.min(groundY + H * 0.03, Math.max(ay, sy) + Math.min(H * 0.2, Math.hypot(ax - sx, ay - sy) * 0.4));
      const d = `M${sx} ${sy} C${sx + 30} ${sag} ${ax} ${sag} ${ax} ${ay}`;
      hoseSvg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
    }

    const svgPt = (x, y) => {
      const m = svg && svg.getScreenCTM();
      if (!m) return { x: -999, y: -999 };
      const p = new DOMPoint(x, y).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };
    const toScreen = (x, y) => { const r = svg.getBoundingClientRect(); return [r.left + x / 500 * r.width, r.top + y / 320 * r.height]; };
    const gEl = (parent, html, cls, x, y) => {
      const el = document.createElementNS(NS, 'g');
      el.setAttribute('class', cls);
      el.setAttribute('transform', `translate(${x} ${y})`);
      el.innerHTML = `<g>${html}</g>`;
      parent.appendChild(el);
      return el;
    };
    const onCar = p => p.x > -30 && p.x < 530 && p.y > -30 && p.y < 300;

    // ---------- sounds ----------
    // The engine is a soft "brum-brum" of short rounded pulses, not a held note. A held low sawtooth sounded
    // like a raspy buzz on the iPad speaker (and once leaked and buzzed forever). Pulses can't leak: each one
    // ends by itself, and the pulse timer is in the game's timer set.
    function engine(ms) {
      let n = 0;
      const steps = Math.round(ms / 110);
      const id = t.every(() => {
        const f = 150 + 40 * Math.sin(n / 3);
        kit.tone(f, { dur: 0.09, vol: 0.12, slide: f * 0.8, attack: 0.015 });
        kit.tone(f * 2, { dur: 0.06, vol: 0.04, attack: 0.015 });
        if (++n >= steps) clearInterval(id);
      }, 110);
    }
    function honk() {
      const f = V[6];
      kit.tone(f, { dur: 0.32, type: 'square', vol: 0.08 }); kit.tone(f * 1.26, { dur: 0.32, type: 'square', vol: 0.06 });
      kit.tone(f, { at: 0.4, dur: 0.45, type: 'square', vol: 0.08 }); kit.tone(f * 1.26, { at: 0.4, dur: 0.45, type: 'square', vol: 0.06 });
    }

    // ---------- steps ----------
    function setStep(s) {
      step = s;
      const i = STEPS.indexOf(s);
      stepEls.forEach((el, j) => { el.classList.toggle('now', j === i); el.classList.toggle('done', j < i); });
      Object.entries(tools).forEach(([key, tl]) => { tl.el.classList.toggle('on', key === s); tl.el.classList.toggle('off', key !== s); tl.el.classList.toggle('hide', i > 2); });
      tyres.forEach(tl => { tl.el.classList.toggle('hide', s !== 'tyre' || tl.used); tl.el.classList.add('on'); tl.el.classList.remove('off'); });
      nozzle.el.classList.toggle('hide', s !== 'fuel'); nozzle.el.classList.toggle('on', s === 'fuel'); nozzle.el.classList.remove('off');
      pump.classList.toggle('hide', s !== 'fuel');
      hoseSvg.style.opacity = s === 'fuel' ? 1 : 0;
      horn.el.classList.toggle('hide', s !== 'honk'); horn.el.classList.toggle('on', s === 'honk'); horn.el.classList.remove('off');
      const words = { soap: 'Sæbe!', rinse: 'Skyl!', dry: 'Tør!', tyre: 'Nye dæk!', fuel: 'Benzin!', honk: 'Dyt!' };
      if (words[s]) t.later(() => kit.say(words[s], { pitch: 1.3 }), 250);
    }

    function nextVehicle() {
      if (!alive) return;
      let i;
      do { i = Math.floor(Math.random() * VEHICLES.length); } while (i === vi);
      vi = i; V = VEHICLES[i];
      car = document.createElement('div');
      car.className = 'bv-car';
      car.innerHTML = `<div class="bv-car-in"><svg viewBox="0 0 500 320" class="bv-svg">
        <ellipse cx="250" cy="296" rx="230" ry="10" fill="rgba(0,0,0,.18)"/>
        ${V[2]}<g class="bv-wheels"></g><g class="bv-mudl"></g><g class="bv-dropl"></g><g class="bv-foaml"></g><g class="bv-sparkl"></g><g class="bv-capl"></g></svg></div>`;
      root.insertBefore(car, pump);
      svg = car.querySelector('svg');
      const wl = svg.querySelector('.bv-wheels');
      wheels = V[3].map(([x, y, r]) => {
        const outer = gEl(wl, '', '', x, y);
        outer.innerHTML = `<g class="bv-w">${wheel(r)}</g>`;
        return { outer, x, y, r, flat: false };
      });
      // mud
      mud = []; foam = []; drops = [];
      const ml = svg.querySelector('.bv-mudl');
      V[5].forEach(([x, y, w, h]) => {
        const n = Math.max(2, Math.round(w * h / 3200));
        for (let j = 0; j < n; j++) {
          const r = Math.min(kit.rand(16, 30), h / 2, w / 2);
          const mx = x + r + Math.random() * (w - 2 * r), my = y + r + Math.random() * (h - 2 * r);
          mud.push({ el: gEl(ml, blob(r, kit.pick(MUD)), 'bv-mud', mx, my), x: mx, y: my, life: 1 });
        }
      });
      tyres.forEach(tl => { tl.used = false; restTool(tl); });
      inserted = false; fuel = 0; sprayT = 0;
      pump.querySelector('.bv-gauge').setAttribute('width', 0);
      step = 'arrive';
      stepEls.forEach(el => el.classList.remove('now', 'done'));
      Object.values(tools).forEach(tl => { tl.el.classList.remove('on', 'hide'); tl.el.classList.add('off'); });
      // drive in from the left
      placeCar(-W);
      void car.offsetWidth;
      car.classList.add('drive', 'driving');
      placeCar();
      engine(1500);
      t.later(() => {
        car.classList.remove('driving');
        kit.replay(car.firstChild, 'bounce');
        kit.sfx.splat();
        kit.say(`${V[1]} er helt mudret!`, { pitch: 1.2 });
      }, 1600);
      t.later(() => { car.classList.remove('drive'); car.firstChild.classList.add('idle'); setStep('soap'); }, 2600);
    }

    // ---------- pointer ----------
    function down(e) {
      // a new touch always wins: if iOS swallowed the last finger's pointerup, drop that stale grip
      if (held && held.id === e.pointerId) return;
      if (held) { const old = held.tool; held = null; if (!(step === 'tyre' && old.used)) restTool(old); }
      if (!step) return;
      let tl = null;
      if (step === 'soap' || step === 'rinse' || step === 'dry') tl = tools[step];
      else if (step === 'tyre') tl = tyres.find(x => !x.used);
      else if (step === 'fuel' && !inserted) tl = nozzle;
      else if (step === 'honk') { goodbye(); return; }
      if (!tl) return;
      e.preventDefault();
      held = { tool: tl, id: e.pointerId };
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      tl.el.classList.remove('rest');
      kit.sfx.pickUp();
      last = null;
      move(e);
    }
    function move(e) {
      if (!held || e.pointerId !== held.id) return;
      const lift = Math.min(W, H) * 0.05;
      const x = e.clientX, y = e.clientY - lift;
      toolAt(held.tool, x, y);
      const p = svgPt(x, y);
      if (step === 'soap') rub(p);
      else if (step === 'rinse') { held.x = x; held.y = y; }
      else if (step === 'dry') wipe(p);
      else if (step === 'fuel') { drawHose(); if (Math.hypot(p.x - V[4][0], p.y - V[4][1]) < 70) insertNozzle(); }
    }
    function up(e) {
      if (!held || e.pointerId !== held.id) return;
      const tl = held.tool;
      held = null;
      if (step === 'tyre' && tyres.includes(tl)) {
        const [x, y] = toolTip(tl), p = svgPt(x, y);
        if (onCar(p)) { fitTyre(tl, p); return; }
      }
      restTool(tl);
      if (tl === nozzle) animateHose(500);
    }
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    function animateHose(ms) { const t0 = performance.now(); const f = () => { drawHose(); if (alive && performance.now() - t0 < ms) requestAnimationFrame(f); }; f(); }

    // ---------- 1. soap ----------
    function addFoam(p, spread = 34) {
      if (foam.filter(f => !f.gone).length > 70) return;
      const r = kit.rand(10, 22);
      const x = p.x + kit.rand(-spread, spread), y = p.y + kit.rand(-spread * 0.8, spread * 0.8);
      foam.push({ el: gEl(svg.querySelector('.bv-foaml'), `<circle r="${r}" fill="#fff" stroke="#cfeaff" stroke-width="3"/><circle cx="${-r / 3}" cy="${-r / 3}" r="${r / 4}" fill="#e8f6ff"/>`, 'bv-foam', x, y), x, y });
    }
    function rub(p) {
      if (!last) { last = p; return; }
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      last = p;
      if (!onCar(p) || d < 0.5) return;
      const now = performance.now();
      // soapy bubbles: separate little rising blips (back-to-back noise bursts merged into a buzz)
      if (now - lastSound > 140) { lastSound = now; const f = kit.rand(600, 1000); kit.tone(f, { dur: 0.07, vol: 0.07, slide: f * 1.5 }); if (Math.random() < 0.25) kit.sfx.squeak(); }
      if (Math.random() < Math.min(1, d / 16)) addFoam(p);
      mud.forEach(m => {
        if (m.life <= 0 || Math.hypot(p.x - m.x, p.y - m.y) > 75) return;
        m.life -= d / 120;
        m.el.firstChild.style.opacity = 0.25 + 0.75 * Math.max(0, m.life);
        if (m.life <= 0) { m.el.firstChild.style.opacity = ''; m.el.classList.add('gone'); kit.sfx.pop(kit.pick([3, 5, 7])); }
      });
      const left = mud.filter(m => m.life > 0);
      if (left.length <= mud.length * 0.15) {
        left.forEach(m => { m.life = 0; m.el.firstChild.style.opacity = ''; m.el.classList.add('gone'); });
        stepDone('rinse');
      }
    }
    function stepDone(next) {
      if (held) { const tl = held.tool; held = null; restTool(tl); }
      kit.sfx.chime();
      step = 'between';
      t.later(() => setStep(next), 900);
    }

    // ---------- 2. rinse: the hose sprays while held, even when the finger is still ----------
    let spraySound = 0;
    t.every(() => {
      if (!held || step !== 'rinse' || held.x == null) return;
      const { x, y } = held;
      sprayT += 0.05;
      // water drops flying out of the nozzle
      for (let j = 0; j < 2; j++) {
        const d = document.createElement('div');
        d.className = 'bv-drip';
        const ang = kit.rand(-0.5, 0.5), len = Math.min(W, H) * kit.rand(0.08, 0.16);
        d.style.setProperty('--from', `translate(${x}px, ${y}px)`);
        d.style.setProperty('--to', `translate(${x - Math.cos(ang) * len}px, ${y + Math.sin(ang) * len + len * 0.4}px)`);
        root.appendChild(d);
        setTimeout(() => d.remove(), 520);
      }
      // splashy water: soft, spaced swishes and plinks (back-to-back bright noise sounded like a buzz)
      if (performance.now() - spraySound > 260) {
        spraySound = performance.now();
        kit.noise({ dur: 0.22, vol: 0.05, freq: kit.rand(1200, 1800), q: 0.4, sweep: 700 });
        const f = kit.rand(900, 1400); kit.tone(f, { at: 0.05, dur: 0.08, vol: 0.05, slide: f * 0.6 });
      }
      const p = svgPt(x - Math.min(W, H) * 0.06, y + Math.min(W, H) * 0.03);
      if (!onCar(p)) return;
      foam.forEach(f => {
        if (f.gone || Math.hypot(f.x - p.x, f.y - p.y) > 95) return;
        f.gone = true; f.el.classList.add('gone'); setTimeout(() => f.el.remove(), 450);
      });
      if (drops.length < 12 && Math.random() < 0.25) addDrop(p.x + kit.rand(-60, 60), p.y + kit.rand(-40, 40));
      const left = foam.filter(f => !f.gone).length;
      if (sprayT > 1.2 && left <= Math.max(2, foam.length * 0.15)) {
        foam.forEach(f => { if (!f.gone) { f.gone = true; f.el.classList.add('gone'); } });
        while (drops.length < 8) { const [x0, y0, w0, h0] = kit.pick(V[5]); addDrop(x0 + Math.random() * w0, y0 + Math.random() * h0); }
        stepDone('dry');
      }
    }, 50);
    function addDrop(x, y) {
      const [ax, ay, aw, ah] = V[5][0];
      x = Math.max(ax + 10, Math.min(ax + aw - 10, x)); y = Math.max(V[5].reduce((m, a) => Math.min(m, a[1]), 999) + 10, Math.min(ay + ah - 10, y));
      drops.push({ el: gEl(svg.querySelector('.bv-dropl'), `<path d="M0 -16 Q12 2 0 13 Q-12 2 0 -16 Z" fill="#7cc8ff" stroke="#2b7fc4" stroke-width="2.5"/><circle cx="-3" cy="2" r="3" fill="#fff" opacity=".8"/>`, 'bv-drop', x, y), x, y, life: 1 });
    }

    // ---------- 3. dry ----------
    function wipe(p) {
      if (!last) { last = p; return; }
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      last = p;
      if (!onCar(p) || d < 0.5) return;
      const now = performance.now();
      if (now - lastSound > 110) { lastSound = now; kit.sfx.rustle(); }
      drops.forEach(dr => {
        if (dr.life <= 0 || Math.hypot(p.x - dr.x, p.y - dr.y) > 80) return;
        dr.life -= d / 70;
        if (dr.life <= 0) { dr.el.classList.add('gone'); kit.sfx.squeak(); }
      });
      const left = drops.filter(dr => dr.life > 0);
      if (left.length <= drops.length * 0.3) {
        left.forEach(dr => { dr.life = 0; dr.el.classList.add('gone'); });
        shiny();
      }
    }
    function shiny() {
      if (held) { const tl = held.tool; held = null; restTool(tl); }
      step = 'between';
      stepEls[2].classList.add('done'); stepEls[2].classList.remove('now');
      const sl = svg.querySelector('.bv-sparkl');
      for (let j = 0; j < 9; j++) {
        const [x, y, w, h] = kit.pick(V[5]);
        const s = gEl(sl, SPARK, 'bv-s', x + Math.random() * w, y + Math.random() * h);
        s.firstChild.style.animationDelay = (j * 0.11).toFixed(2) + 's';
      }
      car.classList.add('happy');
      kit.sfx.chime();
      const [cx, cy] = toScreen(250, 150);
      kit.burst(cx, cy, 50, 1);
      kit.say('Skinnende ren!', { pitch: 1.25 });
      t.later(() => { sl.innerHTML = ''; car.classList.remove('happy'); flats(); }, 2600);
    }

    // ---------- 4. tyres ----------
    function flats() {
      const pickW = wheels.length > 2 ? kit.shuffle(wheels.slice()).slice(0, 2) : wheels;
      pickW.forEach(w => { w.flat = true; w.outer.firstChild.classList.add('flat'); });
      kit.noise({ dur: 1.1, vol: 0.18, freq: 4000, q: 0.5, sweep: 900 });
      kit.tone(500, { dur: 1, vol: 0.06, slide: 200, type: 'triangle' });
      car.firstChild.classList.remove('idle');
      t.later(() => kit.say('Åh nej! Punktering!', { pitch: 1.2 }), 600);
      t.later(() => setStep('tyre'), 1700);
    }
    function fitTyre(tl, p) {
      const flatOnes = wheels.filter(w => w.flat);
      if (!flatOnes.length) { restTool(tl); return; }
      const w = flatOnes.reduce((a, b) => (Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? a : b));
      tl.used = true;
      tl.el.classList.add('hide');
      // the flat one rolls away, the new one pops on
      const old = w.outer.firstChild;
      old.classList.add('roll');
      setTimeout(() => old.remove(), 1000);
      const nw = document.createElementNS(NS, 'g');
      nw.setAttribute('class', 'bv-w new');
      nw.innerHTML = wheel(w.r, '#ffd23f');
      w.outer.appendChild(nw);
      w.flat = false;
      kit.sfx.boing(); t.later(() => kit.sfx.snap(), 200);
      const [sx, sy] = toScreen(w.x, w.y);
      kit.burst(sx, sy, 25, 0.7);
      if (!wheels.some(x => x.flat)) {
        t.later(() => { kit.replay(car.firstChild, 'bounce'); kit.sfx.boing(); car.firstChild.classList.add('idle'); }, 500);
        t.later(() => { setStep('fuel'); showCap(); }, 1300);
      }
    }

    // ---------- 5. fuel ----------
    function showCap() {
      gEl(svg.querySelector('.bv-capl'), `<circle r="22" fill="none" stroke="#ffd23f" stroke-width="6"/>`, 'bv-capg', V[4][0], V[4][1]);
      svg.querySelector('.bv-capg > g').classList.add('bv-cap');
      gEl(svg.querySelector('.bv-capl'), `<circle r="12" fill="#8a94a6" stroke="${INK}" stroke-width="4"/>`, '', V[4][0], V[4][1]);
      t.later(animateHose.bind(null, 600), 50);
    }
    function nozzleToCap() {
      const [x, y] = toScreen(V[4][0], V[4][1]);
      toolAt(nozzle, x, y);
    }
    function insertNozzle() {
      inserted = true;
      held = null;
      nozzle.el.classList.remove('on');
      nozzleToCap(); drawHose();
      svg.querySelector('.bv-capg')?.remove();
      kit.sfx.snap();
      const gauge = pump.querySelector('.bv-gauge');
      let n = 0;
      const id = t.every(() => {
        n++;
        fuel = Math.min(1, n / 14);
        gauge.setAttribute('width', 68 * fuel);
        kit.tone(n % 2 ? 330 : 420, { dur: 0.13, vol: 0.14, slide: 200, attack: 0.015 });   // glug
        if (n % 3 === 0) kit.replay(car.firstChild, 'bounce');
        if (fuel >= 1) {
          clearInterval(id);
          kit.sfx.chime();
          kit.say('Fuld tank!', { pitch: 1.25 });
          t.later(() => { inserted = false; nozzle.el.classList.remove('rest'); restTool(nozzle); animateHose(500); }, 700);
          t.later(() => setStep('honk'), 1500);
        }
      }, 230);
    }

    // ---------- 6. honk and drive off ----------
    function goodbye() {
      step = 'leaving';
      honk();
      car.classList.add('happy');
      car.firstChild.classList.remove('idle');
      kit.replay(car.firstChild, 'bounce');
      stepEls.forEach(el => { el.classList.remove('now'); el.classList.add('done'); });
      horn.el.classList.add('hide');
      kit.sfx.fanfare();
      kit.bigBurst();
      t.later(() => kit.say('Dyt dyt! Farvel!', { pitch: 1.25 }), 900);
      t.later(() => {
        const old = car;
        old.classList.add('away', 'driving');
        old.style.transform = `translate(${W + 40}px, ${carY}px)`;
        engine(1300);
        t.later(() => old.remove(), 1400);
        t.later(nextVehicle, 1300);
      }, 1800);
    }

    layout();
    const offResize = kit.onResize(root, layout);
    t.later(nextVehicle, 200);
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
