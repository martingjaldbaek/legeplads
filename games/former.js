/* Former: a shape sorter. Drag each smiling shape into its matching hole.
 * Very forgiving for small fingers: a shape snaps in as soon as it gets near its own hole.
 */
function starPath() {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 21 : 48, a = i * Math.PI / 5 - Math.PI / 2;
    d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r).toFixed(1) + ' ' + (54 + Math.sin(a) * r).toFixed(1) + ' ';
  }
  return d + 'Z';
}
// name (spoken), svg shape in a 100×100 box, y of the face
const SHAPES = [
  { name: 'Cirkel',  svg: '<circle cx="50" cy="50" r="46"/>', faceY: 48 },
  { name: 'Firkant', svg: '<rect x="7" y="7" width="86" height="86" rx="12"/>', faceY: 48 },
  { name: 'Trekant', svg: '<path d="M50 6 Q54 6 56 10 L95 86 Q97 94 89 94 L11 94 Q3 94 5 86 L44 10 Q46 6 50 6 Z"/>', faceY: 66 },
  { name: 'Stjerne', svg: `<path d="${starPath()}" stroke-linejoin="round"/>`, faceY: 56 },
  { name: 'Hjerte',  svg: '<path d="M50 90 C 22 70 4 52 4 31 C 4 15 16 5 30 5 C 40 5 47 11 50 19 C 53 11 60 5 70 5 C 84 5 96 15 96 31 C 96 52 78 70 50 90 Z"/>', faceY: 38 },
];
const PER_ROUND = 3;

const CSS = `
.former-board { position:absolute; left:4%; right:4%; top:8%; height:44%; border-radius:4vmin;
  background: linear-gradient(#f6c983, #e9ad5f); box-shadow: inset 0 -1.2vmin 0 rgba(0,0,0,.12), 0 1.5vmin 3vmin rgba(120,70,20,.25); }
.former-item { position:absolute; left:0; top:0; touch-action:none; will-change:transform; }
.former-item svg { width:100%; height:100%; display:block; overflow:visible; transition: transform .15s, filter .15s; }
.former-hole svg { filter: drop-shadow(0 .4vmin 0 rgba(255,255,255,.35)); }
.former-hole svg .shape { fill: rgba(70,40,20,.38); stroke: rgba(70,40,20,.25); stroke-width: 3; }
.former-hole.filled svg { animation: former-glow .6s ease; }
.former-piece svg .shape { stroke: rgba(0,0,0,.18); stroke-width: 4; }
.former-piece.lift svg { transform: scale(1.12); filter: drop-shadow(0 2vmin 1.5vmin rgba(0,0,0,.25)); }
.former-piece.anim { transition: transform .45s cubic-bezier(.3,1.4,.5,1); }
.former-piece.placed svg { animation: former-pop .45s ease; }
.former-piece.wobble svg { animation: former-wobble .45s ease; }
.former-piece.out { transition: transform .5s ease-in, opacity .5s; opacity: 0; }
@keyframes former-pop { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 100%{transform:scale(1)} }
@keyframes former-wobble { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
@keyframes former-glow { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
`;

export default {
  id: 'former',
  title: 'Former',
  icon: '🔺',
  color: '#ff8a00',
  edge: '#ffe1b8',          // bottom colour of the background (fills any gap iOS leaves)

  start(root, kit) {
    root.style.background = 'linear-gradient(#fff6d8, #ffe1b8)';
    const style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    const board = document.createElement('div');
    board.className = 'former-board';
    root.appendChild(board);

    let holes = [], pieces = [], round = 0, z = 10, sz = 100;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
    const place = it => { it.el.style.transform = `translate(${it.x - sz / 2}px, ${it.y - sz / 2}px)`; };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    function makeEl(kind, shape, color) {
      const el = document.createElement('div');
      el.className = `former-item former-${kind}`;
      const eyes = kind === 'piece'
        ? `<g fill="#3b2a4a"><circle cx="38" cy="${shape.faceY}" r="5"/><circle cx="62" cy="${shape.faceY}" r="5"/></g>
           <g fill="#fff"><circle cx="39.5" cy="${shape.faceY - 1.5}" r="1.7"/><circle cx="63.5" cy="${shape.faceY - 1.5}" r="1.7"/></g>
           <path d="M40 ${shape.faceY + 10} Q50 ${shape.faceY + 19} 60 ${shape.faceY + 10}" fill="none" stroke="#3b2a4a" stroke-width="4" stroke-linecap="round"/>`
        : '';
      el.innerHTML = `<svg viewBox="0 0 100 100"><g class="shape" fill="${color || 'none'}">${shape.svg}</g>${eyes}</svg>`;
      root.appendChild(el);
      return el;
    }

    function layout() {
      const W = root.clientWidth, H = root.clientHeight, n = holes.length;
      sz = Math.min(W / (n + 1) * 0.9, H * 0.27);
      holes.forEach((h, i) => { h.x = W * (i + 1) / (n + 1); h.y = H * 0.30; });
      pieces.forEach(p => {
        p.homeX = W * (p.slot + 1) / (n + 1); p.homeY = H * 0.76;
        if (p.placed) { p.x = p.hole.x; p.y = p.hole.y; }
        else if (p.dragId == null) { p.x = p.homeX; p.y = p.homeY; }
      });
      for (const it of holes.concat(pieces)) { it.el.style.width = it.el.style.height = sz + 'px'; place(it); }
    }

    function newRound() {
      holes.concat(pieces).forEach(it => it.el.remove());
      const shapes = round === 0 ? SHAPES.slice(0, PER_ROUND) : kit.shuffle(SHAPES).slice(0, PER_ROUND);
      const colors = kit.shuffle(kit.COLORS);
      holes = shapes.map(s => ({ shape: s, filled: false, el: makeEl('hole', s) }));
      const slots = kit.shuffle(shapes.map((_, i) => i));
      pieces = shapes.map((s, i) => {
        const p = { shape: s, hole: holes[i], slot: slots[i], placed: false, dragId: null, el: makeEl('piece', s, colors[i]) };
        bindDrag(p);
        return p;
      });
      round++;
      layout();
      // pieces drop in from below
      pieces.forEach((p, i) => {
        p.el.style.transform = `translate(${p.x - sz / 2}px, ${root.clientHeight + sz}px)`;
        void p.el.offsetWidth;            // commit the start position before enabling the transition
        p.el.classList.add('anim');
        later(() => place(p), 80 + i * 120);
      });
    }

    function snap(p) {
      const h = p.hole;
      p.placed = true;
      p.dragId = null;
      h.filled = true;
      p.x = h.x; p.y = h.y;
      p.el.classList.remove('lift');
      p.el.classList.add('anim', 'placed');
      place(p);
      h.el.classList.add('filled');
      kit.sfx.snap();
      kit.burst(h.x, h.y, 35, 0.8);
      later(() => kit.say(p.shape.name + '!'), 200);
      if (pieces.every(q => q.placed)) {
        later(() => { kit.sfx.fanfare(); kit.bigBurst(); kit.say('Hurra! Flot klaret!', { pitch: 1.3 }); }, 1100);
        later(() => {
          pieces.concat(holes).forEach(it => it.el.classList.add('anim', 'out'));
          pieces.forEach(p2 => { p2.el.style.transform = `translate(${p2.x - sz / 2}px, ${-sz * 2}px)`; });
        }, 3600);
        later(newRound, 4200);
      }
    }

    function sendHome(p, wobble) {
      p.x = p.homeX; p.y = p.homeY;
      p.el.classList.add('anim');
      place(p);
      if (wobble) { p.el.classList.remove('wobble'); void p.el.offsetWidth; p.el.classList.add('wobble'); }
    }

    function bindDrag(p) {
      let offX = 0, offY = 0;
      p.el.addEventListener('pointerdown', e => {
        if (p.placed || p.dragId != null) return;
        e.preventDefault();
        p.el.setPointerCapture(e.pointerId);
        p.dragId = e.pointerId;
        offX = p.x - e.clientX; offY = p.y - e.clientY;
        p.el.classList.remove('anim', 'wobble');
        p.el.classList.add('lift');
        p.el.style.zIndex = ++z;
        kit.sfx.pickUp();
      });
      p.el.addEventListener('pointermove', e => {
        if (e.pointerId !== p.dragId) return;
        p.x = e.clientX + offX; p.y = e.clientY + offY;
        place(p);
        if (dist(p, p.hole) < sz * 0.4) snap(p);       // close enough: it just drops in
      });
      const end = e => {
        if (e.pointerId !== p.dragId) return;
        p.dragId = null;
        p.el.classList.remove('lift');
        if (dist(p, p.hole) < sz * 0.85) return snap(p);
        const wrongHole = holes.find(h => h !== p.hole && dist(p, h) < sz * 0.7);
        if (wrongHole) kit.sfx.boing();
        sendHome(p, !!wrongHole);
      };
      p.el.addEventListener('pointerup', end);
      p.el.addEventListener('pointercancel', end);
    }

    const offResize = kit.onResize(root, layout);
    newRound();

    return () => {
      timers.forEach(clearTimeout);
      offResize();
    };
  },
};
