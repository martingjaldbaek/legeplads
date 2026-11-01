/* Maling: finger painting in rainbow strokes with sparkles. Every finger paints and sings –
 * higher up the screen = higher note. The sponge button wipes the paper clean.
 */
const MAX_VOICES = 4;

const CSS = `
.maling-cv { position:absolute; inset:0; width:100%; height:100%; touch-action:none; }
.maling-paper { transition: opacity .35s; }
.maling-clear { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(34px, 5vmin); }
.maling-clear:active { transform: scale(.9); }
`;

export default {
  id: 'maling',
  title: 'Maling',
  icon: '🎨',
  color: '#f15bb5',
  edge: '#fffdf6',

  start(root, kit) {
    root.style.background = '#fffdf6';
    kit.injectCSS(root, CSS);
    const paper = document.createElement('canvas');
    paper.className = 'maling-cv maling-paper';
    const fx = document.createElement('canvas');
    fx.className = 'maling-cv';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'maling-clear';
    clearBtn.textContent = '🧽';
    clearBtn.setAttribute('aria-label', 'Nyt papir');
    root.append(paper, fx, clearBtn);
    const pc = paper.getContext('2d'), fc = fx.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const S = () => Math.min(W, H);

    function resize() {
      // keep the painting when the iPad rotates
      const old = document.createElement('canvas');
      old.width = paper.width; old.height = paper.height;
      if (paper.width) old.getContext('2d').drawImage(paper, 0, 0);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = root.clientWidth; H = root.clientHeight;
      for (const c of [paper, fx]) { c.width = W * dpr; c.height = H * dpr; }
      pc.setTransform(1, 0, 0, 1, 0, 0);
      if (old.width) pc.drawImage(old, 0, 0, old.width, old.height, 0, 0, paper.width, paper.height);
      pc.setTransform(dpr, 0, 0, dpr, 0, 0);
      fc.setTransform(dpr, 0, 0, dpr, 0, 0);
      pc.lineCap = pc.lineJoin = 'round';
    }
    resize();
    const offResize = kit.onResize(root, resize);

    const strokes = new Map();   // pointerId -> { x, y, hue, voice }
    const sparkles = [];
    let baseHue = kit.rand(0, 360), raf = 0;
    const pitch = y => kit.scaleHz(Math.round((1 - y / H) * 12), 196);

    function dab(s, x, y) {
      pc.strokeStyle = `hsl(${s.hue}, 90%, 55%)`;
      pc.lineWidth = S() * 0.04;
      pc.beginPath();
      pc.moveTo(s.x, s.y);
      pc.lineTo(x, y);
      pc.stroke();
      s.x = x; s.y = y;
      s.hue = (s.hue + 2) % 360;
      if (Math.random() < 0.35) {
        sparkles.push({ x: x + kit.rand(-1, 1) * S() * 0.03, y: y + kit.rand(-1, 1) * S() * 0.03,
          r: S() * kit.rand(0.008, 0.018), life: 1, hue: s.hue });
      }
    }

    fx.addEventListener('pointerdown', e => {
      const voice = strokes.size < MAX_VOICES ? kit.sustain({ type: 'triangle', freq: pitch(e.clientY), vol: 0.07 }) : null;
      const s = { x: e.clientX, y: e.clientY, hue: baseHue, voice };
      baseHue = (baseHue + 67) % 360;
      strokes.set(e.pointerId, s);
      dab(s, e.clientX + 0.1, e.clientY);
    });
    fx.addEventListener('pointermove', e => {
      const s = strokes.get(e.pointerId);
      if (!s) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of (evs.length ? evs : [e])) dab(s, ev.clientX, ev.clientY);
      if (s.voice) s.voice.set(pitch(e.clientY), 0.02);
    });
    const up = e => {
      const s = strokes.get(e.pointerId);
      if (!s) return;
      if (s.voice) s.voice.stop();
      strokes.delete(e.pointerId);
    };
    fx.addEventListener('pointerup', up);
    fx.addEventListener('pointercancel', up);

    clearBtn.addEventListener('click', () => {
      kit.sfx.whoosh();
      paper.style.opacity = '0';
      setTimeout(() => { pc.clearRect(0, 0, W, H); paper.style.opacity = '1'; }, 380);
    });

    function star(x, y, r) {
      fc.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.4 : r, a = i * Math.PI / 4;
        fc.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      fc.closePath();
      fc.fill();
    }
    function frame() {
      fc.clearRect(0, 0, W, H);
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.life -= 0.025;
        if (p.life <= 0) { sparkles.splice(i, 1); continue; }
        fc.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life})`;
        star(p.x, p.y - (1 - p.life) * S() * 0.03, p.r * (0.6 + p.life * 0.6));
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      offResize();
      strokes.forEach(s => s.voice && s.voice.stop());
    };
  },
};
