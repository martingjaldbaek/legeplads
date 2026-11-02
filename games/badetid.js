/* Badetid: a whole bath, one step at a time. A muddy animal (or car) waits beside the tub.
 *   1. drag it into the tub (or just tap it)   2. pour water with the jug   3. squirt soap
 *   4. scrub the mud off with the sponge        5. rinse the foam off with the shower   6. dry it with the towel
 * Only one tool is out at a time, glowing and bouncing. Touching ANYWHERE grabs it, so small fingers
 * don't have to hit it, and each step moves on by itself when it's "done enough".
 */
const SUBJECTS = [
  ['🐷', 'grisen'], ['🐶', 'hunden'], ['🚗', 'bilen'], ['🐘', 'elefanten'],
  ['🦖', 'dinoen'], ['🐻', 'bamsen'], ['🐴', 'hesten'], ['🚜', 'traktoren'],
];
const MUD = ['#7a4a1f', '#8b5a2b', '#6b3f1a', '#94632f'];
const JUG = `<svg viewBox="0 0 100 100" style="width:1em;height:1em;display:block;overflow:visible">
  <path d="M70 34 Q92 34 92 52 Q92 70 72 72" fill="none" stroke="#2b7fc4" stroke-width="9" stroke-linecap="round"/>
  <path d="M14 20 L30 26 H74 L70 88 Q69 94 63 94 H33 Q27 94 26 88 L22 36 Z" fill="#4fb3ec" stroke="#2b7fc4" stroke-width="5" stroke-linejoin="round"/>
  <path d="M14 20 L30 26 H74" fill="none" stroke="#2b7fc4" stroke-width="6" stroke-linecap="round"/>
  <path d="M34 40 Q32 64 36 82" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
const RIM = 0.6;   // tub rim, as a fraction of the subject box: nothing is painted below it
const STEPS = [
  ['arrive', '🛁', 'Op i badet!'], ['water', JUG, 'Vand!'], ['soap', '🧴', 'Sæbe!'],
  ['scrub', '🧽', 'Skrub!'], ['rinse', '🚿', 'Skyl!'], ['dry', '', 'Tør!'],
];

const CSS = `
.bad-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; z-index:5; }
.bad-tub { position:absolute; left:50%; transform:translateX(-50%); pointer-events:none; z-index:3; }
.bad-tub svg { width:100%; height:100%; display:block; overflow:visible; }
.bad-suds { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); transition: transform .5s cubic-bezier(.4,1.5,.5,1); }
.bad-suds.on { transform: none; }
.bad-subject { position:absolute; z-index:4; pointer-events:none; transition: transform .6s cubic-bezier(.4,1.3,.5,1); }
.bad-subject.intub { z-index:2; }
.bad-inner { position:absolute; inset:0; }
.bad-subject.wait .bad-inner { animation: bad-bob 1.1s ease-in-out infinite; }
.bad-subject.happy .bad-inner { animation: bad-happy .8s ease 2; }
.bad-subject canvas { position:absolute; inset:0; width:100%; height:100%; transition: opacity .6s; }
@keyframes bad-happy { 0%,100%{transform:none} 30%{transform:translateY(-10%) rotate(-6deg)} 60%{transform:translateY(-4%) rotate(6deg)} }
@keyframes bad-bob { 0%,100%{transform:none} 50%{transform:translateY(-8%) rotate(-4deg)} }
.bad-tool { position:absolute; left:0; top:0; z-index:6; pointer-events:none; line-height:1; transition: transform .45s cubic-bezier(.4,1.3,.5,1); }
.bad-tool > div { transition: transform .2s; }
.bad-tool.idle > div { animation: bad-hop 1s ease-in-out infinite; filter: drop-shadow(0 0 .12em #fff) drop-shadow(0 0 .2em #fff6a8); }
.bad-tool.held { transition: none; }
.bad-tool.held > div { filter: drop-shadow(0 .1em .08em rgba(0,0,0,.25)); }
.bad-tool.gone > div { transform: scale(0) !important; transition: transform .3s ease-in; }
.bad-towel { width:1.15em; height:.8em; border-radius:.14em; box-shadow: inset 0 -.08em 0 rgba(0,0,0,.08);
  background: repeating-linear-gradient(90deg, #ff8fab 0 .16em, #ffc2d4 .16em .32em); }
@keyframes bad-hop { 0%,100%{transform:none} 50%{transform:translateY(-14%) scale(1.06)} }
.bad-steps { position:absolute; z-index:6; left:50%; top: calc(env(safe-area-inset-top) + 16px); transform:translateX(-50%);
  display:flex; gap:1.4vmin; pointer-events:none; }
.bad-steps span { display:flex; align-items:center; justify-content:center; width:7vmin; height:7vmin; border-radius:50%;
  background: rgba(255,255,255,.6); font-size:4.2vmin; opacity:.45; transition: all .3s; }
.bad-steps span.done { opacity:.9; background:#c9f7d4; }
.bad-steps span.now { opacity:1; background:#fff; transform: scale(1.3); box-shadow: 0 .6vmin 0 rgba(0,0,0,.08); }
.bad-steps .bad-towel { font-size:4.2vmin; }
`;
const TUB = `<svg viewBox="0 0 200 90" preserveAspectRatio="none">
  <ellipse cx="100" cy="12" rx="98" ry="12" fill="#cfe2ee"/>
  <ellipse class="bad-water" cx="100" cy="12" rx="96" ry="11" fill="#6cc4f0" opacity="0"/>
  <g class="bad-suds">${Array.from({ length: 13 }, (_, i) => `<circle cx="${10 + i * 15}" cy="${8 + (i % 3) * 3}" r="${9 + (i % 4) * 2}" fill="#fff"/>`).join('')}</g>
  <path d="M2 12 Q6 78 40 80 L160 80 Q194 78 198 12 Z" fill="#fff"/>
  <path d="M2 12 Q6 78 40 80 L160 80 Q194 78 198 12" fill="none" stroke="#c9e4f5" stroke-width="3"/>
  <rect x="30" y="78" width="14" height="12" rx="5" fill="#f4c542"/><rect x="156" y="78" width="14" height="12" rx="5" fill="#f4c542"/>
</svg>`;
const TOWEL = '<div class="bad-towel"></div>';

export default {
  id: 'badetid',
  title: 'Badetid',
  icon: '🛁',
  color: '#00a6fb',
  edge: '#9fd8f5',

  start(root, kit) {
    root.style.background = 'repeating-linear-gradient(90deg, #dff3ff 0 9vmin, #d3eefc 9vmin 18vmin)';
    root.style.backgroundColor = '#dff3ff';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const floor = document.createElement('div');
    floor.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(#bfe6fb,#9fd8f5)';
    const subj = document.createElement('div');
    subj.className = 'bad-subject';
    const inner = document.createElement('div');
    inner.className = 'bad-inner';
    subj.appendChild(inner);
    // layers on top of the subject: mud, foam, wet sheen. Each is a canvas we paint on and rub away.
    const mkLayer = () => { const cv = document.createElement('canvas'); inner.appendChild(cv); return { cv, ctx: cv.getContext('2d', { willReadFrequently: true }), start: 1 }; };
    const body = mkLayer(), mud = mkLayer(), foam = mkLayer(), wet = mkLayer();
    const tub = document.createElement('div');
    tub.className = 'bad-tub';
    tub.innerHTML = TUB;
    const waterEl = tub.querySelector('.bad-water'), suds = tub.querySelector('.bad-suds');
    const fx = document.createElement('canvas');
    fx.className = 'bad-cv';
    const bar = document.createElement('div');
    bar.className = 'bad-steps';
    bar.innerHTML = STEPS.map(s => `<span>${s[1] || TOWEL}</span>`).join('');
    const dots = [...bar.children];
    const tool = document.createElement('div');
    tool.className = 'bad-tool gone';
    root.append(floor, subj, tub, fx, tool, bar);
    const fc = fx.getContext('2d');

    let W = 0, H = 0, box = 0, bx = 0, by = 0, tubW = 0, tubTop = 0, dpr = 1, toolSize = 0;
    let restX = 0, restY = 0, waitX = 0, waitY = 0;
    let step = 'busy', subject = SUBJECTS[0], order = kit.shuffle(SUBJECTS), idx = 0;
    let level = 0, squirts = 0, lastSquirt = 0, lastNoise = 0, lastCheck = 0, lastSqueak = 0;
    let finger = null;           // { id, x, y, px, py, x0, y0, moved }
    let toolX = 0, toolY = 0, toolRot = 0;
    const parts = [];            // bubbles, sparkles, drops
    let raf = 0;

    /* ---------- drawing helpers ---------- */
    function drawSubject(ctx) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${box * 0.86}px system-ui, "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(subject[0], box / 2, box * 0.54);
      ctx.restore();
    }
    // keep a layer to the subject's shape and above the rim
    function trim(L, clip = true) {
      const c = L.ctx;
      c.save(); c.globalCompositeOperation = 'destination-in'; drawSubject(c); c.restore();
      if (clip) c.clearRect(0, box * RIM * dpr, L.cv.width, L.cv.height);
    }
    function count(L) {
      // only above the rim: that's all that can be reached once it's in the tub
      const d = L.ctx.getImageData(0, 0, L.cv.width, Math.max(1, Math.round(box * RIM * dpr))).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] > 60) n++;
      return n;
    }
    const frac = L => count(L) / L.start;
    function clearLayer(L) { L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.clearRect(0, 0, L.cv.width, L.cv.height); L.cv.style.opacity = '1'; }
    function fadeLayer(L) { L.cv.style.opacity = '0'; t.later(() => clearLayer(L), 650); }
    function rub(L, x0, y0, x1, y1, w) {
      const c = L.ctx;
      c.save();
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = 'destination-out';
      c.lineCap = 'round'; c.lineWidth = w;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 + 0.01, y1); c.stroke();
      c.restore();
    }
    function foamBlob(x, y, r) {
      const c = foam.ctx;
      c.save();
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let j = 0; j < 6; j++) {
        const rr = r * kit.rand(0.35, 0.7);
        c.beginPath();
        c.arc(x + kit.rand(-1, 1) * r * 0.7, y + kit.rand(-1, 1) * r * 0.5, rr, 0, 6.283);
        c.fillStyle = 'rgba(255,255,255,.96)'; c.fill();
        c.strokeStyle = 'rgba(160,205,240,.9)'; c.lineWidth = 1.5; c.stroke();
      }
      c.restore();
      trim(foam);
    }

    /* ---------- layout ---------- */
    const floatY = () => -level * box * 0.07;
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      box = Math.min(W * 0.55, H * 0.6);
      bx = (W - box) / 2;
      by = H * 0.72 - box * 0.85;
      tubW = Math.min(W * 0.8, box * 1.45);
      tubTop = by + box * 0.62;
      Object.assign(subj.style, { left: bx + 'px', top: by + 'px', width: box + 'px', height: box + 'px' });
      tub.style.width = tubW + 'px';
      tub.style.height = box * 0.5 + 'px';
      tub.style.top = tubTop + 'px';
      fx.width = W * dpr; fx.height = H * dpr;
      fc.setTransform(dpr, 0, 0, dpr, 0, 0);
      toolSize = Math.max(70, box * 0.34);
      tool.style.fontSize = toolSize + 'px';
      const side = (W - tubW) / 2;
      if (side > toolSize * 1.1) { restX = W - side / 2; restY = H * 0.42; }
      else { restX = W * 0.8; restY = Math.max(toolSize * 0.9 + 40, by * 0.6); }
      // waiting spot: on the floor in front of the tub's left end
      const s = 0.45;
      waitX = Math.max(s * box * 0.55 + 8, side / 2);
      // well clear of the bottom edge: iPadOS holds back touches there for its swipe-home gesture
      waitY = H - s * box * 0.5 - Math.max(70, H * 0.1);
      // resize the layers, keeping what's painted on them
      for (const L of [body, mud, foam, wet]) {
        const old = document.createElement('canvas');
        old.width = L.cv.width; old.height = L.cv.height;
        if (old.width) old.getContext('2d').drawImage(L.cv, 0, 0);
        L.cv.width = L.cv.height = Math.round(box * dpr);
        if (old.width && L !== body) L.ctx.drawImage(old, 0, 0, L.cv.width, L.cv.height);
      }
      drawSubject(body.ctx);
      if (!(finger && step === 'arrive')) placeSubject();
      if (!finger) restTool();
    }

    /* ---------- the subject ---------- */
    let subjAt = 'off';   // off | wait | tub
    function moveSubject(x, y, s) {
      subj.style.transform = `translate(${x - (bx + box / 2)}px, ${y - (by + box / 2)}px) scale(${s})`;
    }
    function placeSubject() {
      if (subjAt === 'wait') moveSubject(waitX, waitY, 0.45);
      else if (subjAt === 'tub') subj.style.transform = `translateY(${floatY()}px)`;
    }

    function dirty() {
      clearLayer(mud); clearLayer(foam); clearLayer(wet);
      const blobs = 11;
      for (let k = 0; k < blobs; k++) {
        t.later(() => {
          const c = mud.ctx;
          c.save();
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * box * 0.33;
          const x = box / 2 + Math.cos(a) * r, y = box * 0.4 + Math.sin(a) * r * 0.7;
          c.fillStyle = kit.pick(MUD);
          for (let j = 0; j < 7; j++) {
            c.beginPath();
            c.arc(x + kit.rand(-1, 1) * box * 0.07, y + kit.rand(-1, 1) * box * 0.07, box * kit.rand(0.03, 0.08), 0, 6.283);
            c.fill();
          }
          c.restore();
          trim(mud, false);   // mud below the rim is hidden by the tub, but shows while it waits on the floor
          kit.sfx.splat();
          if (k === blobs - 1) { mud.start = Math.max(1, count(mud)); t.later(() => setStep('arrive'), 400); }
        }, 200 + k * 130);
      }
    }

    function nextSubject() {
      subject = order[idx++ % order.length];
      if (idx % order.length === 0) order = kit.shuffle(SUBJECTS);
      level = 0; waterEl.setAttribute('opacity', 0);
      subj.classList.remove('intub', 'happy');
      subj.style.transition = 'none';
      moveSubject(-box, waitY, 0.45);
      clearLayer(body); drawSubject(body.ctx);
      clearLayer(mud); clearLayer(foam); clearLayer(wet);
      void subj.offsetWidth;
      subj.style.transition = 'transform .9s cubic-bezier(.4,1.2,.5,1)';
      subjAt = 'wait';
      placeSubject();
      kit.sfx.boing();
      t.later(() => { subj.style.transition = ''; dirty(); }, 900);
    }

    function intoTub() {
      step = 'busy';
      subj.classList.remove('wait');
      subj.style.transition = '';
      subjAt = 'tub';
      subj.style.transform = `translate(0px, ${-box * 0.35}px)`;   // hop up over the rim…
      t.later(() => { subj.classList.add('intub'); subj.style.transform = 'none'; }, 280);   // …and down in
      t.later(() => {
        kit.sfx.plop();
        for (let k = 0; k < 10; k++) addBubble(bx + box * kit.rand(0.2, 0.8), tubTop + 4);
        setStep('water');
      }, 750);
    }

    /* ---------- steps and the tool ---------- */
    function setStep(s) {
      step = s;
      const i = STEPS.findIndex(x => x[0] === s);
      dots.forEach((d, j) => { d.classList.toggle('done', j < i); d.classList.toggle('now', j === i); });
      kit.say(STEPS[i][2], { pitch: 1.3 });
      if (s === 'arrive') { subj.classList.add('wait'); hideTool(); return; }
      if (s === 'dry') paintWet();
      if (s === 'rinse') foam.start = Math.max(1, count(foam));
      if (s === 'soap') squirts = 0;
      showTool(STEPS[i][1] || TOWEL);
    }
    function done(next, ms = 700) {
      step = 'busy';
      finger = null;
      kit.sfx.chime();
      kit.burst(bx + box / 2, by + box * 0.3, 30, 0.7);
      hideTool();
      t.later(next, ms);
    }
    function showTool(html) {
      tool.innerHTML = `<div>${html}</div>`;
      tool.className = 'bad-tool gone';
      toolRot = 0;
      restTool();
      void tool.offsetWidth;
      tool.className = 'bad-tool idle';
      kit.sfx.fwip();
    }
    function hideTool() { tool.className = 'bad-tool gone'; }
    function restTool() { toolX = restX; toolY = restY; toolRot = 0; drawTool(); }
    function drawTool() { tool.style.transform = `translate(${toolX}px, ${toolY}px) translate(-50%, -50%) rotate(${toolRot}deg)`; }

    function paintWet() {
      const c = wet.ctx;
      clearLayer(wet);
      c.save();
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = 'rgba(90,170,240,.32)';
      c.fillRect(0, 0, box, box);
      for (let k = 0; k < 26; k++) {
        const x = kit.rand(0.15, 0.85) * box, y = kit.rand(0.1, RIM) * box, r = box * kit.rand(0.015, 0.03);
        c.fillStyle = 'rgba(60,150,235,.85)';
        c.beginPath(); c.moveTo(x, y - r * 2); c.quadraticCurveTo(x + r * 1.3, y, x, y + r); c.quadraticCurveTo(x - r * 1.3, y, x, y - r * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)';
        c.beginPath(); c.arc(x - r * 0.3, y - r * 0.1, r * 0.3, 0, 6.283); c.fill();
      }
      c.restore();
      trim(wet);
      wet.start = Math.max(1, count(wet));
      // let the water out
      const from = level, t0 = performance.now();
      kit.noise({ dur: 1.2, vol: 0.15, freq: 300, q: 0.7, sweep: 120 });
      const drain = () => {
        const k = Math.min(1, (performance.now() - t0) / 1200);
        level = from * (1 - k);
        waterEl.setAttribute('opacity', level);
        placeSubject();
        if (k < 1) t.later(drain, 30);
      };
      drain();
    }

    function finish() {
      step = 'busy';
      hideTool();
      dots.forEach(d => { d.classList.add('done'); d.classList.remove('now'); });
      kit.sfx.fanfare();
      kit.burst(bx + box / 2, by + box * 0.4, 110, 1.2);
      kit.replay(subj, 'happy');
      t.later(() => kit.say(`Tak! Nu er ${subject[1]} ren og tør!`, { pitch: 1.3 }), 500);
      for (let k = 0; k < 16; k++) {
        t.later(() => parts.push({ x: bx + kit.rand(0.15, 0.85) * box, y: by + kit.rand(0.15, 0.6) * box,
          r: box * 0.04, vy: -box * 0.1, life: 1, sparkle: true }), k * 70);
      }
      t.later(() => {   // hop out and away to the right
        subj.classList.remove('intub', 'happy');
        subj.style.transition = 'transform .9s ease-in';
        subjAt = 'off';
        subj.style.transform = `translate(${W}px, ${-box * 0.1}px)`;
        kit.sfx.whoosh();
      }, 4000);
      t.later(nextSubject, 5000);
    }

    /* ---------- particles ---------- */
    function addBubble(x, y, big = 1) {
      parts.push({ x: x + kit.rand(-1, 1) * box * 0.05, y: y + kit.rand(-1, 1) * box * 0.05,
        r: box * kit.rand(0.012, 0.035) * big, vy: -box * kit.rand(0.05, 0.2), life: 1 });
    }

    /* ---------- input: touching anywhere grabs the current tool ---------- */
    const overTub = x => Math.abs(x - W / 2) < tubW * 0.6;
    const local = (x, y) => [x - bx, y - by - floatY()];
    const overSubject = (x, y) => { const [lx, ly] = local(x, y); return lx > 0 && lx < box && ly > 0 && ly < box * RIM + box * 0.05; };

    function grab(x, y) {
      // the tool sits just above the finger so it isn't hidden under it
      toolX = x; toolY = y - toolSize * 0.3;
      if (step === 'water') toolX = x + toolSize * 0.25;
      drawTool();
    }

    fx.addEventListener('pointerdown', e => {
      // one finger at a time, but a new touch always wins: if iOS swallowed the last finger's pointerup
      // (e.g. to its edge gestures), a stale finger must never lock the game
      if (finger && finger.id === e.pointerId) return;
      const x = e.clientX, y = e.clientY;
      finger = { id: e.pointerId, x, y, px: x, py: y, x0: x, y0: y, moved: 0 };
      try { fx.setPointerCapture(e.pointerId); } catch (err) {}
      if (step === 'arrive') {
        subj.classList.remove('wait');
        subj.style.transition = 'none';
        moveSubject(x, y - box * 0.12, 0.55);
        kit.sfx.pickUp();
        return;
      }
      if (step === 'busy') return;
      tool.className = 'bad-tool held';
      kit.sfx.pickUp();
      grab(x, y);
      act();
    });
    fx.addEventListener('pointermove', e => {
      if (!finger || e.pointerId !== finger.id) return;
      finger.px = finger.x; finger.py = finger.y;
      finger.x = e.clientX; finger.y = e.clientY;
      finger.moved = Math.max(finger.moved, Math.hypot(finger.x - finger.x0, finger.y - finger.y0));
      if (step === 'arrive') { moveSubject(finger.x, finger.y - box * 0.12, 0.55); return; }
      if (step === 'busy') return;
      grab(finger.x, finger.y);
      act();
    });
    const up = e => {
      if (!finger || e.pointerId !== finger.id) return;
      const f = finger;
      finger = null;
      if (step === 'arrive') {
        // a tap, or letting go anywhere over the tub (or just above it), puts it in the bath
        if (f.moved < 20 || (overTub(f.x) && f.y > tubTop - box * 0.6)) intoTub();
        else { subj.style.transition = ''; placeSubject(); subj.classList.add('wait'); kit.sfx.boing(); }
        return;
      }
      if (step === 'busy') return;
      tool.className = 'bad-tool idle';
      restTool();
    };
    fx.addEventListener('pointerup', up);
    fx.addEventListener('pointercancel', up);

    // per-move actions (rubbing steps)
    function act() {
      const f = finger;
      const [lx0, ly0] = local(f.px, f.py), [lx, ly] = local(f.x, f.y);
      const now = performance.now();
      if (step === 'scrub') {
        addBubble(f.x, f.y); addBubble(f.x, f.y);
        rub(mud, lx0, ly0, lx, ly, box * 0.15);
        if (overSubject(f.x, f.y) && Math.random() < 0.5) foamBlob(lx, ly, box * 0.045);
        if (now - lastSqueak > 110) { lastSqueak = now; kit.sfx.squeak(); }
        if (now - lastCheck > 300) {
          lastCheck = now;
          if (frac(mud) < 0.15) { fadeLayer(mud); done(() => setStep('rinse')); }
        }
      } else if (step === 'dry') {
        rub(wet, lx0, ly0, lx, ly, box * 0.2);
        toolRot = Math.sin(now / 60) * 10; drawTool();
        if (now - lastSqueak > 160) { lastSqueak = now; kit.sfx.rustle(); }
        if (now - lastCheck > 300) {
          lastCheck = now;
          if (frac(wet) < 0.18) { fadeLayer(wet); done(finish, 300); }
        }
      }
    }

    // per-frame actions (holding steps): pouring, squirting, showering
    function holdActions(dt, now) {
      const f = finger;
      if (!f || step === 'busy' || step === 'arrive') return;
      if (step === 'water') {
        const pouring = overTub(f.x);
        toolRot = pouring ? -40 : 0; drawTool();
        if (!pouring) return;
        level = Math.min(1, level + dt / 2.6);
        waterEl.setAttribute('opacity', 0.25 + level * 0.75);
        placeSubject();
        const sx = toolX - toolSize * 0.47, sy = toolY, ey = tubTop + 6;
        for (let k = 0; k < 3; k++) parts.push({ x: sx + kit.rand(-4, 4), y: sy, vx: 0, vy: box * 2.2, life: 1, drop: true, endY: ey, col: '#4fb3ec' });
        if (Math.random() < 0.3) addBubble(sx, ey);
        if (now - lastNoise > 110) { lastNoise = now; kit.noise({ dur: 0.18, vol: 0.1, freq: 700, q: 0.5 }); }
        if (level >= 1) done(() => setStep('soap'));
      } else if (step === 'soap') {
        if (!overSubject(f.x, f.y) || now - lastSquirt < 220) return;
        lastSquirt = now;
        toolRot = -25; drawTool();
        t.later(() => { if (finger) { toolRot = 0; drawTool(); } }, 120);
        const [lx, ly] = local(f.x, f.y);
        foamBlob(lx, ly, box * 0.08);
        kit.tone(kit.rand(500, 700), { dur: 0.12, vol: 0.12, slide: 250 });
        for (let k = 0; k < 4; k++) addBubble(f.x, f.y, 1.4);
        if (++squirts === 2) suds.classList.add('on');
        if (squirts >= 7) done(() => setStep('scrub'));
      } else if (step === 'rinse') {
        const sx = toolX - toolSize * 0.2, sy = toolY + toolSize * 0.2;
        for (let k = 0; k < 4; k++) parts.push({ x: sx + kit.rand(-1, 1) * toolSize * 0.25, y: sy, vx: kit.rand(-0.6, 0.2) * box * 0.3,
          vy: box * kit.rand(1.4, 2), life: 1, drop: true, endY: tubTop + 6, col: '#7cc8f2' });
        const [lx, ly] = local(f.x, f.y + box * 0.04);
        rub(foam, lx, ly - box * 0.08, lx, ly + box * 0.08, box * 0.22);
        if (now - lastNoise > 110) { lastNoise = now; kit.noise({ dur: 0.18, vol: 0.07, freq: 3200, q: 0.4 }); }
        if (now - lastCheck > 300) {
          lastCheck = now;
          if (frac(foam) < 0.2) { fadeLayer(foam); suds.classList.remove('on'); done(() => setStep('dry')); }
        }
      }
    }

    let prev = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      holdActions(dt, now);
      fc.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const b = parts[i];
        if (b.drop) {
          b.x += (b.vx || 0) * dt; b.y += b.vy * dt;
          if (b.y >= b.endY) { parts.splice(i, 1); continue; }
          fc.strokeStyle = b.col; fc.lineWidth = Math.max(3, box * 0.012); fc.lineCap = 'round';
          fc.beginPath(); fc.moveTo(b.x, b.y - box * 0.03); fc.lineTo(b.x, b.y); fc.stroke();
          continue;
        }
        b.life -= dt * (b.sparkle ? 0.9 : 0.7);
        b.y += b.vy * dt;
        if (b.life <= 0) { parts.splice(i, 1); continue; }
        if (b.sparkle) {
          fc.font = `${b.r * 2.5}px system-ui, "Apple Color Emoji", sans-serif`;
          fc.globalAlpha = b.life;
          fc.fillText('✨', b.x, b.y);
          fc.globalAlpha = 1;
          continue;
        }
        fc.fillStyle = `rgba(255,255,255,${0.75 * b.life})`;
        fc.strokeStyle = `rgba(150,200,240,${0.8 * b.life})`;
        fc.lineWidth = 1.5;
        fc.beginPath(); fc.arc(b.x, b.y, b.r, 0, 6.283); fc.fill(); fc.stroke();
        fc.fillStyle = `rgba(255,255,255,${b.life})`;
        fc.beginPath(); fc.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, 6.283); fc.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    layout();
    nextSubject();
    const offResize = kit.onResize(root, layout);

    return () => { t.clear(); cancelAnimationFrame(raf); offResize(); };
  },
};
