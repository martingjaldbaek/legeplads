/* Ansigt: build a silly face. Drag eyes, noses, mouths, hats… from the tray onto the face – anywhere goes.
 * Each part is named as it lands. Drag a part off the face to remove it. Tap the face and it giggles.
 * 🔄 gives a new, blank face.
 */
// emoji, spoken name, size relative to the face radius
const PARTS = [
  ['👀', 'Øjne', 0.42], ['👁️', 'Øje', 0.3], ['👃', 'Næse', 0.32], ['👄', 'Mund', 0.36],
  ['👅', 'Tunge', 0.32], ['👂', 'Øre', 0.34], ['👓', 'Briller', 0.5], ['🎩', 'Hat', 0.6],
  ['👑', 'Krone', 0.55], ['🎀', 'Sløjfe', 0.38], ['🌸', 'Blomst', 0.3], ['🍓', 'Jordbær', 0.3],
];
const SKINS = [['#ffd9b8', '#f7c39b'], ['#f1c08f', '#e3a872'], ['#c98d5e', '#b47848'], ['#8d5a3b', '#784a2f'],
  ['#ffe0ef', '#ffc6df'], ['#d9f0ff', '#b8e2ff'], ['#e5ffd9', '#c4f2b0']];

const CSS = `
.face-wrap { position:absolute; }
.face-head { position:absolute; inset:0; border-radius:50%; transition: background .4s; }
.face-ear { position:absolute; top:38%; width:22%; height:26%; border-radius:50%; }
.face-cheek { position:absolute; top:58%; width:18%; height:12%; border-radius:50%; background:#ff8fab; opacity:.45; }
.face-wrap.giggle { animation: face-giggle .6s ease; }
.face-part { position:absolute; left:0; top:0; line-height:1; touch-action:none; will-change:transform; }
.face-part span { display:inline-block; transition: transform .15s; }
.face-part.lift span { transform: scale(1.15); filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.face-part.poof { transition: transform .3s ease-in, opacity .3s; opacity:0; }
.face-part.land span { animation: face-land .35s ease; }
.face-tray { position:absolute; display:grid; grid-template-columns: 1fr 1fr; gap:1.2vmin; padding:1.6vmin;
  background: rgba(255,255,255,.7); border-radius:3vmin; box-shadow: 0 1vmin 0 rgba(0,0,0,.08); }
.face-src { display:flex; align-items:center; justify-content:center; border-radius:2vmin; background:#fff;
  box-shadow: 0 .5vmin 0 rgba(0,0,0,.08); touch-action:none; line-height:1; }
.face-new { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(34px, 5vmin); }
.face-new:active { transform: scale(.9); }
@keyframes face-giggle { 0%,100%{transform:none} 20%{transform:rotate(-6deg) scale(1.03)} 40%{transform:rotate(5deg)} 60%{transform:rotate(-4deg) scale(1.02)} 80%{transform:rotate(3deg)} }
@keyframes face-land { 0%{transform:scale(1.3)} 60%{transform:scale(.9)} 100%{transform:scale(1)} }
`;

export default {
  id: 'ansigt',
  title: 'Ansigt',
  icon: '😜',
  color: '#ef476f',
  edge: '#d9ecff',

  start(root, kit) {
    root.style.background = 'radial-gradient(circle at 40% 40%, #f4f9ff, #d9ecff)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const wrap = document.createElement('div');
    wrap.className = 'face-wrap';
    wrap.innerHTML = `<div class="face-ear" style="left:-9%"></div><div class="face-ear" style="right:-9%"></div>
      <div class="face-head"></div><div class="face-cheek" style="left:16%"></div><div class="face-cheek" style="right:16%"></div>`;
    const head = wrap.querySelector('.face-head');
    const tray = document.createElement('div');
    tray.className = 'face-tray';
    const newBtn = document.createElement('button');
    newBtn.className = 'face-new';
    newBtn.textContent = '🔄';
    newBtn.setAttribute('aria-label', 'Nyt ansigt');
    root.append(wrap, tray, newBtn);

    let R = 100, cx = 0, cy = 0, z = 10, skin = 0;
    const placed = [];   // { el, part, u, v } – u,v: position relative to the face centre, in face radii

    function setSkin(i) {
      const [a, b] = SKINS[i];
      head.style.background = `radial-gradient(circle at 40% 35%, ${a}, ${b})`;
      wrap.querySelectorAll('.face-ear').forEach(e => { e.style.background = b; });
    }
    setSkin(skin);

    const srcs = PARTS.map(p => {
      const s = document.createElement('div');
      s.className = 'face-src';
      s.textContent = p[0];
      tray.appendChild(s);
      return s;
    });

    function layout() {
      const W = root.clientWidth, H = root.clientHeight, portrait = H > W;
      if (portrait) {
        R = Math.min(W * 0.36, H * 0.24);
        cx = W / 2; cy = H * 0.34;
        Object.assign(tray.style, { left: '4vw', right: '4vw', top: 'auto', bottom: '3vh', width: 'auto', gridTemplateColumns: 'repeat(6, 1fr)' });
      } else {
        R = Math.min(W * 0.27, H * 0.38);
        cx = W * 0.38; cy = H * 0.52;
        Object.assign(tray.style, { left: 'auto', right: '3vw', top: '50%', bottom: 'auto', width: 'auto', gridTemplateColumns: '1fr 1fr' });
        tray.style.transform = 'translateY(-50%)';
      }
      if (portrait) tray.style.transform = 'none';
      const cell = portrait ? Math.min((W * 0.92 - 60) / 6, H * 0.09) : Math.min(H * 0.13, W * 0.09);
      srcs.forEach(s => { s.style.width = s.style.height = cell + 'px'; s.style.fontSize = cell * 0.68 + 'px'; });
      Object.assign(wrap.style, { left: cx - R + 'px', top: cy - R + 'px', width: 2 * R + 'px', height: 2 * R + 'px' });
      placed.forEach(p => positionOnFace(p));
    }

    function sizePart(el, part) { el.style.fontSize = (2 * R * part[2]) + 'px'; }
    const setXY = (el, x, y) => { el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; };
    function positionOnFace(p) {
      sizePart(p.el, p.part);
      setXY(p.el, R + p.u * R, R + p.v * R);   // wrap-local coordinates
    }
    const onFace = (x, y) => Math.hypot(x - cx, y - cy) < R * 1.15;

    function poof(el) {
      el.classList.add('poof');
      el.style.transform += ' scale(0)';
      kit.sfx.whoosh();
      setTimeout(() => el.remove(), 320);
    }

    function land(el, part, x, y) {
      const p = { el, part, u: (x - cx) / R, v: (y - cy) / R };
      wrap.appendChild(el);
      positionOnFace(p);
      el.style.zIndex = ++z;
      kit.replay(el, 'land');
      placed.push(p);
      bindPlaced(p);
      kit.sfx.plop();
      kit.replay(wrap, 'giggle');
      t.later(() => kit.say(part[1] + '!', { pitch: 1.25 }), 120);
      return p;
    }

    // drag a fresh copy out of the tray
    srcs.forEach((s, i) => {
      let el = null;
      kit.draggable(s, {
        start(e) {
          el = document.createElement('div');
          el.className = 'face-part lift';
          el.innerHTML = `<span>${PARTS[i][0]}</span>`;
          sizePart(el, PARTS[i]);
          el.style.zIndex = 50;
          root.appendChild(el);
          setXY(el, e.clientX, e.clientY);
          kit.sfx.pickUp();
        },
        move(e) { setXY(el, e.clientX, e.clientY); },
        end(e) {
          el.classList.remove('lift');
          if (onFace(e.clientX, e.clientY)) land(el, PARTS[i], e.clientX, e.clientY);
          else poof(el);
          el = null;
        },
      });
    });

    // parts already on the face can be moved, or dragged off to remove them
    function bindPlaced(p) {
      kit.draggable(p.el, {
        start() {
          p.el.classList.add('lift');
          p.el.style.zIndex = ++z;
          kit.sfx.pickUp();
        },
        move(e) {
          p.u = (e.clientX - cx) / R; p.v = (e.clientY - cy) / R;
          positionOnFace(p);
        },
        end(e) {
          p.el.classList.remove('lift');
          if (onFace(e.clientX, e.clientY)) { kit.sfx.plop(); kit.replay(p.el, 'land'); return; }
          placed.splice(placed.indexOf(p), 1);
          poof(p.el);
        },
      });
    }

    head.addEventListener('pointerdown', e => {
      e.preventDefault();
      kit.replay(wrap, 'giggle');
      kit.sfx.giggle();
      if (Math.random() < 0.4) kit.say(kit.pick(['Hihi!', 'Det kilder!', 'Hahaha!']), { pitch: 1.5 });
    });

    newBtn.addEventListener('click', () => {
      placed.splice(0).forEach(p => poof(p.el));
      skin = (skin + 1 + Math.floor(Math.random() * (SKINS.length - 1))) % SKINS.length;
      t.later(() => { setSkin(skin); kit.replay(wrap, 'giggle'); kit.sfx.fwip(); }, 250);
    });

    layout();
    addEventListener('resize', layout);
    return () => { t.clear(); removeEventListener('resize', layout); };
  },
};
