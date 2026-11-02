/* Ansigt: build a silly face. Drag eyes, noses, mouths, hats… from the tray onto the face – anywhere goes.
 * The tabs above the tray switch between five drawers of parts. The drop zone reaches a little past the
 * face's edge so hats and ears are easy to place. Each part is named as it lands; drag one off the face to remove it.
 * Ears flip to face the right way on either side. Tap the face and it giggles. 🔄 gives a new, blank face.
 */
// Tabs of parts: [emoji, spoken name, size relative to the face radius, flags].
// Flags: 'm' = mirror on the left half of the face (ears), 't' = take the skin tone of the face.
const TABS = [
  ['👀', [['👀', 'Øjne', .42], ['👁️', 'Øje', .3], ['👓', 'Briller', .5], ['🕶️', 'Solbriller', .5],
    ['🥽', 'Dykkerbriller', .5], ['🧿', 'Øje', .26], ['⭐', 'Stjerne', .26], ['❤️', 'Hjerte', .24],
    ['🌀', 'Spiral', .26], ['✨', 'Glimmer', .26], ['💧', 'Tåre', .2], ['🍩', 'Donut', .28]]],
  ['👃', [['👃', 'Næse', .32, 't'], ['🐽', 'Grisetryne', .34], ['🔴', 'Klovnenæse', .24], ['🥕', 'Gulerod', .36],
    ['🍓', 'Jordbær', .28], ['🍒', 'Kirsebær', .3], ['👂', 'Øre', .38, 'mt'], ['🥨', 'Kringle', .32],
    ['🧀', 'Ost', .3], ['🍪', 'Småkage', .28], ['🫐', 'Blåbær', .26], ['🍋', 'Citron', .3]]],
  ['👄', [['👄', 'Mund', .36], ['👅', 'Tunge', .32], ['💋', 'Kys', .34], ['🦷', 'Tand', .22],
    ['🍌', 'Banan', .44], ['🍉', 'Vandmelon', .44], ['🌙', 'Måne', .4], ['🍕', 'Pizza', .36],
    ['🍔', 'Burger', .38], ['🍭', 'Slikkepind', .36], ['🥒', 'Agurk', .38], ['🫧', 'Bobler', .3]]],
  ['🎩', [['🎩', 'Hat', .6], ['👑', 'Krone', .55], ['🧢', 'Kasket', .6], ['👒', 'Sommerhat', .65],
    ['🎓', 'Studenterhue', .6], ['⛑️', 'Hjelm', .6], ['🎀', 'Sløjfe', .38], ['🍝', 'Spaghetti-hår', .6],
    ['🔥', 'Ild-hår', .55], ['☁️', 'Sky', .55], ['🌈', 'Regnbue', .6], ['🐙', 'Blæksprutte', .55]]],
  ['🦋', [['🦋', 'Sommerfugl', .32], ['🐞', 'Mariehøne', .24], ['🐝', 'Bi', .26], ['🐌', 'Snegl', .3],
    ['🐣', 'Kylling', .32], ['🦜', 'Papegøje', .4], ['🍄', 'Svamp', .34], ['🌸', 'Blomst', .3],
    ['🎈', 'Ballon', .4], ['🧁', 'Kage', .34], ['🦄', 'Enhjørning', .4], ['🐸', 'Frø', .36]]],
];
const TONES = ['🏻', '🏼', '🏽', '🏾'];   // skin-tone modifiers matching the first four SKINS

const SKINS = [['#ffd9b8', '#f7c39b'], ['#f1c08f', '#e3a872'], ['#c98d5e', '#b47848'], ['#8d5a3b', '#784a2f'],
  ['#ffe0ef', '#ffc6df'], ['#d9f0ff', '#b8e2ff'], ['#e5ffd9', '#c4f2b0']];

const CSS = `
.face-wrap { position:absolute; }
.face-head { position:absolute; inset:0; border-radius:50%; transition: background .4s; }
.face-ear { position:absolute; top:38%; width:22%; height:26%; border-radius:50%; }
.face-cheek { position:absolute; top:58%; width:18%; height:12%; border-radius:50%; background:#ff8fab; opacity:.45; }
.face-wrap.giggle { animation: face-giggle .6s ease; }
.face-part { position:absolute; left:0; top:0; line-height:1; touch-action:none; will-change:transform; }
.face-part span { display:inline-block; transition: transform .15s; transform: scaleX(var(--fx, 1)); }
.face-part.lift span { transform: scaleX(var(--fx, 1)) scale(1.15); filter: drop-shadow(0 1.5vmin 1vmin rgba(0,0,0,.25)); }
.face-part.poof { transition: transform .3s ease-in, opacity .3s; opacity:0; }
.face-part.land span { animation: face-land .35s ease; }
.face-panel { position:absolute; display:flex; flex-direction:column; gap:1.2vmin; padding:1.6vmin;
  background: rgba(255,255,255,.7); border-radius:3vmin; box-shadow: 0 1vmin 0 rgba(0,0,0,.08); }
.face-tabs { display:flex; justify-content:space-between; gap:1vmin; }
.face-tab { flex:1; border:none; padding:0; border-radius:1.6vmin; background:rgba(255,255,255,.5); line-height:1;
  opacity:.55; transition: transform .15s, opacity .15s, background .15s; }
.face-tab.on { opacity:1; background:#ffd23f; transform: translateY(-.4vmin); box-shadow: 0 .5vmin 0 rgba(0,0,0,.12); }
.face-tray { display:grid; gap:1.2vmin; }
.face-tray.flip { animation: face-flip .3s ease; }
.face-src { display:flex; align-items:center; justify-content:center; border-radius:2vmin; background:#fff;
  box-shadow: 0 .5vmin 0 rgba(0,0,0,.08); touch-action:none; line-height:1; }
.face-new { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px); right: calc(env(safe-area-inset-right) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(34px, 5vmin); }
.face-new:active { transform: scale(.9); }
@keyframes face-giggle { 0%,100%{transform:none} 20%{transform:rotate(-6deg) scale(1.03)} 40%{transform:rotate(5deg)} 60%{transform:rotate(-4deg) scale(1.02)} 80%{transform:rotate(3deg)} }
@keyframes face-land { 0%{transform:scaleX(var(--fx,1)) scale(1.3)} 60%{transform:scaleX(var(--fx,1)) scale(.9)} 100%{transform:scaleX(var(--fx,1))} }
@keyframes face-flip { 0%{transform:scale(.9); opacity:.3} 100%{transform:none; opacity:1} }
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
    const panel = document.createElement('div');
    panel.className = 'face-panel';
    panel.innerHTML = '<div class="face-tabs"></div><div class="face-tray"></div>';
    const tabsEl = panel.querySelector('.face-tabs'), tray = panel.querySelector('.face-tray');
    const newBtn = document.createElement('button');
    newBtn.className = 'face-new';
    newBtn.textContent = '🔄';
    newBtn.setAttribute('aria-label', 'Nyt ansigt');
    root.append(wrap, panel, newBtn);

    let R = 100, cx = 0, cy = 0, z = 10, skin = 0, tab = 0, cell = 80;
    const placed = [];   // { el, part, u, v } – u,v: position relative to the face centre, in face radii

    function setSkin(i) {
      const [a, b] = SKINS[i];
      head.style.background = `radial-gradient(circle at 40% 35%, ${a}, ${b})`;
      wrap.querySelectorAll('.face-ear').forEach(e => { e.style.background = b; });
    }
    setSkin(skin);
    // skin-toned parts (nose, ear) follow the face when it has a human skin colour
    const glyph = part => (part[3] || '').includes('t') && skin < TONES.length ? part[0] + TONES[skin] : part[0];

    const tabBtns = TABS.map(([icon], i) => {
      const b = document.createElement('button');
      b.className = 'face-tab';
      b.textContent = icon;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (i !== tab) { kit.sfx.blip(); showTab(i); } });
      tabsEl.appendChild(b);
      return b;
    });

    let srcs = [];
    function showTab(i) {
      tab = i;
      tabBtns.forEach((b, j) => b.classList.toggle('on', j === i));
      tray.innerHTML = '';
      srcs = TABS[i][1].map(part => {
        const s = document.createElement('div');
        s.className = 'face-src';
        s.textContent = glyph(part);
        tray.appendChild(s);
        bindSource(s, part);
        return s;
      });
      sizeSources();
      kit.replay(tray, 'flip');
    }
    function sizeSources() {
      srcs.forEach(s => { s.style.width = s.style.height = cell + 'px'; s.style.fontSize = cell * 0.68 + 'px'; });
      tabBtns.forEach(b => { b.style.height = cell * 0.8 + 'px'; b.style.fontSize = cell * 0.5 + 'px'; });
    }

    function layout() {
      const W = root.clientWidth, H = root.clientHeight, portrait = H > W;
      if (portrait) {
        cell = Math.min((W * 0.92 - 70) / 6, H * 0.08);
        R = Math.min(W * 0.34, H * 0.22);
        cx = W / 2; cy = H * 0.36;
        tray.style.gridTemplateColumns = 'repeat(6, 1fr)';
        Object.assign(panel.style, { left: '50%', right: 'auto', top: 'auto', bottom: '3vh', transform: 'translateX(-50%)' });
      } else {
        cell = Math.min(H * 0.15, W * 0.085);
        R = Math.min(W * 0.25, H * 0.36);
        cx = W * 0.36; cy = H * 0.53;
        tray.style.gridTemplateColumns = 'repeat(3, 1fr)';
        Object.assign(panel.style, { left: 'auto', right: '3vw', top: '50%', bottom: 'auto', transform: 'translateY(-50%)' });
      }
      sizeSources();
      Object.assign(wrap.style, { left: cx - R + 'px', top: cy - R + 'px', width: 2 * R + 'px', height: 2 * R + 'px' });
      placed.forEach(p => positionOnFace(p));
    }

    function sizePart(el, part) { el.style.fontSize = (2 * R * part[2]) + 'px'; }
    const setXY = (el, x, y) => { el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; };
    // mirrored parts (ears): the emoji ear has its canal on the left, so it suits the right side of the face
    // as drawn and is flipped on the left half, so both ear canals face inwards
    const setFlip = (el, part, u) => { if ((part[3] || '').includes('m')) el.style.setProperty('--fx', u < 0 ? -1 : 1); };
    function positionOnFace(p) {
      sizePart(p.el, p.part);
      setFlip(p.el, p.part, p.u);
      setXY(p.el, R + p.u * R, R + p.v * R);   // wrap-local coordinates
    }
    // drop zone: a little past the face's edge, so hats, ears and beards are easy to place
    const onFace = (x, y) => Math.hypot(x - cx, y - cy) < R * 1.3;

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
    function bindSource(s, part) {
      let el = null;
      kit.draggable(s, {
        start(e) {
          el = document.createElement('div');
          el.className = 'face-part lift';
          el.innerHTML = `<span>${glyph(part)}</span>`;
          sizePart(el, part);
          el.style.zIndex = 50;
          root.appendChild(el);
          setFlip(el, part, e.clientX - cx);
          setXY(el, e.clientX, e.clientY);
          kit.sfx.pickUp();
        },
        move(e) { setFlip(el, part, e.clientX - cx); setXY(el, e.clientX, e.clientY); },
        end(e) {
          el.classList.remove('lift');
          if (onFace(e.clientX, e.clientY)) land(el, part, e.clientX, e.clientY);
          else poof(el);
          el = null;
        },
      });
    }

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
      t.later(() => { setSkin(skin); kit.replay(wrap, 'giggle'); kit.sfx.fwip(); showTab(tab); }, 250);
    });

    layout();
    showTab(0);
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); };
  },
};
