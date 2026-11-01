/* Badetid: a muddy animal (or car) sits in the tub. Rub it clean – foam, bubbles and squeaks.
 * When it's clean it sparkles and says thank you, then the next one gets muddy.
 */
const SUBJECTS = [
  ['🐷', 'grisen'], ['🐶', 'hunden'], ['🚗', 'bilen'], ['🐘', 'elefanten'],
  ['🦖', 'dinoen'], ['🐻', 'bamsen'], ['🐴', 'hesten'], ['🚜', 'traktoren'],
];
const MUD = ['#7a4a1f', '#8b5a2b', '#6b3f1a', '#94632f'];
const CLEAN_AT = 0.12;   // fraction of the mud left when it counts as clean

const CSS = `
.bad-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.bad-tub { position:absolute; left:50%; transform:translateX(-50%); pointer-events:none; z-index:3; }
.bad-tub svg { width:100%; height:100%; display:block; overflow:visible; }
.bad-subject { position:absolute; z-index:2; pointer-events:none; transition: transform .6s cubic-bezier(.4,1.3,.5,1); }
.bad-subject.happy { animation: bad-happy .8s ease 2; }
.bad-subject canvas { position:absolute; inset:0; width:100%; height:100%; }
.bad-mud { transition: opacity .5s; }
@keyframes bad-happy { 0%,100%{transform:none} 30%{transform:translateY(-10%) rotate(-6deg)} 60%{transform:translateY(-4%) rotate(6deg)} }
`;
const TUB = `<svg viewBox="0 0 200 90" preserveAspectRatio="none">
  <ellipse cx="100" cy="12" rx="98" ry="12" fill="#e2f3ff"/>
  ${Array.from({ length: 13 }, (_, i) => `<circle cx="${10 + i * 15}" cy="${8 + (i % 3) * 3}" r="${9 + (i % 4) * 2}" fill="#fff"/>`).join('')}
  <path d="M2 12 Q6 78 40 80 L160 80 Q194 78 198 12 Z" fill="#fff"/>
  <path d="M2 12 Q6 78 40 80 L160 80 Q194 78 198 12" fill="none" stroke="#c9e4f5" stroke-width="3"/>
  <rect x="30" y="78" width="14" height="12" rx="5" fill="#f4c542"/><rect x="156" y="78" width="14" height="12" rx="5" fill="#f4c542"/>
</svg>`;

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
    const bodyCv = document.createElement('canvas');
    const mudCv = document.createElement('canvas');
    mudCv.className = 'bad-mud';
    subj.append(bodyCv, mudCv);
    const tub = document.createElement('div');
    tub.className = 'bad-tub';
    tub.innerHTML = TUB;
    const fx = document.createElement('canvas');
    fx.className = 'bad-cv';
    root.append(floor, subj, tub, fx);
    const bc = bodyCv.getContext('2d'), mc = mudCv.getContext('2d', { willReadFrequently: true }), fc = fx.getContext('2d');

    let W = 0, H = 0, box = 0, bx = 0, by = 0, dpr = 1, mudStart = 1, state = 'dirtying', subject = SUBJECTS[0], order = kit.shuffle(SUBJECTS), idx = 0;
    const bubbles = [];
    let raf = 0;

    function drawSubject(ctx) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${box * 0.86}px system-ui, "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(subject[0], box / 2, box * 0.54);
      ctx.restore();
    }

    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      box = Math.min(W * 0.55, H * 0.6);
      bx = (W - box) / 2;
      by = H * 0.72 - box * 0.85;
      Object.assign(subj.style, { left: bx + 'px', top: by + 'px', width: box + 'px', height: box + 'px' });
      tub.style.width = Math.min(W * 0.8, box * 1.45) + 'px';
      tub.style.height = box * 0.5 + 'px';
      tub.style.top = (by + box * 0.62) + 'px';
      fx.width = W * dpr; fx.height = H * dpr;
      fc.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function sizeCanvases() {
      for (const c of [bodyCv, mudCv]) { c.width = box * dpr; c.height = box * dpr; }
      bc.clearRect(0, 0, bodyCv.width, bodyCv.height);
      drawSubject(bc);
    }

    function countMud() {
      const d = mc.getImageData(0, 0, mudCv.width, mudCv.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] > 60) n++;   // every 16th pixel is plenty
      return n;
    }

    // splat mud on, one blob at a time, then mask it to the subject's shape
    function dirty() {
      state = 'dirtying';
      mudCv.style.opacity = '1';
      mc.setTransform(1, 0, 0, 1, 0, 0);
      mc.clearRect(0, 0, mudCv.width, mudCv.height);
      const blobs = 11;
      for (let k = 0; k < blobs; k++) {
        t.later(() => {
          mc.save();
          mc.setTransform(dpr, 0, 0, dpr, 0, 0);
          const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * box * 0.33;
          const x = box / 2 + Math.cos(a) * r, y = box * 0.4 + Math.sin(a) * r * 0.7;
          mc.fillStyle = kit.pick(MUD);
          for (let j = 0; j < 7; j++) {
            mc.beginPath();
            mc.arc(x + kit.rand(-1, 1) * box * 0.07, y + kit.rand(-1, 1) * box * 0.07, box * kit.rand(0.03, 0.08), 0, 6.283);
            mc.fill();
          }
          mc.globalCompositeOperation = 'destination-in';
          drawSubject(mc);
          mc.restore();
          // no mud below the tub's rim, where it couldn't be seen or scrubbed
          mc.clearRect(0, box * 0.6 * dpr, mudCv.width, mudCv.height);
          kit.sfx.splat();
          if (k === blobs - 1) { mudStart = Math.max(1, countMud()); state = 'washing'; }
        }, 400 + k * 140);
      }
    }

    function nextSubject(first) {
      subject = order[idx++ % order.length];
      if (idx % order.length === 0) order = kit.shuffle(SUBJECTS);
      if (first) { sizeCanvases(); dirty(); return; }
      subj.style.transform = 'translateX(120vw)';
      t.later(() => {
        subj.style.transition = 'none';
        subj.style.transform = 'translateX(-120vw)';
        sizeCanvases();
        mc.clearRect(0, 0, mudCv.width, mudCv.height);
        void subj.offsetWidth;
        subj.style.transition = '';
        subj.style.transform = 'none';
        t.later(dirty, 500);
      }, 600);
    }

    layout();
    nextSubject(true);
    const onResize = () => { layout(); sizeCanvases(); if (state === 'washing') dirty(); };
    addEventListener('resize', onResize);

    const last = new Map();
    let lastSqueak = 0, lastCheck = 0;
    function scrub(id, x, y) {
      for (let k = 0; k < 2; k++) {
        bubbles.push({ x: x + kit.rand(-1, 1) * box * 0.06, y: y + kit.rand(-1, 1) * box * 0.06,
          r: box * kit.rand(0.012, 0.035), vy: -box * kit.rand(0.05, 0.2), life: 1 });
      }
      if (state !== 'washing') return;
      const p = last.get(id) || { x, y };
      mc.save();
      mc.setTransform(dpr, 0, 0, dpr, 0, 0);
      mc.globalCompositeOperation = 'destination-out';
      mc.lineCap = 'round';
      mc.lineWidth = box * 0.14;
      mc.beginPath();
      mc.moveTo(p.x - bx, p.y - by);
      mc.lineTo(x - bx, y - by);
      mc.stroke();
      mc.restore();
      last.set(id, { x, y });
      const now = performance.now();
      if (now - lastSqueak > 110) { lastSqueak = now; kit.sfx.squeak(); }
      if (now - lastCheck > 300) {
        lastCheck = now;
        if (countMud() / mudStart < CLEAN_AT) clean();
      }
    }

    function clean() {
      state = 'clean';
      mudCv.style.opacity = '0';
      kit.sfx.fanfare();
      kit.burst(bx + box / 2, by + box * 0.4, 90, 1.1);
      kit.replay(subj, 'happy');
      t.later(() => kit.say(`Tak! Nu er ${subject[1]} ren!`, { pitch: 1.3 }), 500);
      for (let k = 0; k < 14; k++) {
        t.later(() => bubbles.push({ x: bx + kit.rand(0.15, 0.85) * box, y: by + kit.rand(0.2, 0.8) * box,
          r: box * 0.04, vy: -box * 0.1, life: 1, sparkle: true }), k * 70);
      }
      t.later(() => nextSubject(false), 4200);
    }

    fx.addEventListener('pointerdown', e => { last.set(e.pointerId, { x: e.clientX, y: e.clientY }); scrub(e.pointerId, e.clientX, e.clientY); });
    fx.addEventListener('pointermove', e => { if (last.has(e.pointerId)) scrub(e.pointerId, e.clientX, e.clientY); });
    const up = e => last.delete(e.pointerId);
    fx.addEventListener('pointerup', up);
    fx.addEventListener('pointercancel', up);

    let prev = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      fc.clearRect(0, 0, W, H);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life -= dt * (b.sparkle ? 0.9 : 0.7);
        b.y += b.vy * dt;
        if (b.life <= 0) { bubbles.splice(i, 1); continue; }
        if (b.sparkle) {
          fc.fillStyle = `rgba(255, 230, 90, ${b.life})`;
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

    return () => { t.clear(); cancelAnimationFrame(raf); removeEventListener('resize', onResize); };
  },
};
