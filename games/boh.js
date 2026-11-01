/* Bøh!: animals hide behind bushes and presents. Tap a hiding place – "Bøh!" – and the animal pops out
 * and says its name, then hides somewhere new. Hidden animals peek out now and then as a hint.
 */
const ANIMALS = [
  ['🐶', 'Hund'], ['🐱', 'Kat'], ['🐰', 'Kanin'], ['🐻', 'Bjørn'], ['🐼', 'Panda'], ['🦊', 'Ræv'],
  ['🐸', 'Frø'], ['🐵', 'Abe'], ['🐯', 'Tiger'], ['🐨', 'Koala'], ['🐷', 'Gris'], ['🐮', 'Ko'],
];
const HIDDEN = 2;   // animals hiding at any time

const BUSH = `<svg viewBox="0 0 100 70" preserveAspectRatio="none">
  <ellipse cx="50" cy="66" rx="46" ry="5" fill="rgba(0,0,0,.12)"/>
  <circle cx="26" cy="42" r="24" fill="#3fa34d"/><circle cx="74" cy="42" r="24" fill="#3fa34d"/>
  <circle cx="50" cy="30" r="28" fill="#4cb85a"/><rect x="8" y="40" width="84" height="26" rx="12" fill="#3fa34d"/>
  <circle cx="38" cy="22" r="5" fill="#7fd68a" opacity=".7"/><circle cx="66" cy="34" r="4" fill="#7fd68a" opacity=".7"/>
  <circle cx="24" cy="44" r="3.5" fill="#ff5d8f"/><circle cx="78" cy="48" r="3.5" fill="#ffd23f"/><circle cx="56" cy="52" r="3.5" fill="#ff8fab"/>
</svg>`;
const BOX = c => `<svg viewBox="0 0 100 70" preserveAspectRatio="none">
  <ellipse cx="50" cy="66" rx="44" ry="5" fill="rgba(0,0,0,.12)"/>
  <rect x="10" y="20" width="80" height="46" rx="5" fill="${c}"/>
  <rect x="5" y="10" width="90" height="16" rx="5" fill="${c}" style="filter:brightness(1.1)"/>
  <rect x="44" y="10" width="12" height="56" fill="#ffd23f"/>
  <path d="M50 10 C 36 -4 26 4 38 10 Z M50 10 C 64 -4 74 4 62 10 Z" fill="#ffd23f"/>
</svg>`;

const CSS = `
.boh-spot { position:absolute; }
.boh-animal { position:absolute; left:50%; bottom:22%; z-index:1; line-height:1;
  transform: translate(-50%, 40%) scale(.6); opacity:0;
  transition: transform .45s cubic-bezier(.3,1.6,.5,1), opacity .2s; }
.boh-spot.peek .boh-animal { transform: translate(-50%, 0%) scale(.85); opacity:1; transition-duration:.35s; }
.boh-spot.open .boh-animal { transform: translate(-50%, -45%) scale(1.15); opacity:1; z-index:3; }
.boh-cover { position:absolute; left:0; right:0; bottom:0; height:62%; z-index:2; transform-origin: 50% 100%;
  transition: transform .4s cubic-bezier(.3,1.4,.5,1); }
.boh-cover svg { width:100%; height:100%; display:block; }
.boh-spot.open .boh-cover { transform: translateY(14%) rotate(-7deg) scaleY(.82); }
.boh-spot.shake .boh-cover { animation: boh-shake .45s ease; }
.boh-word { position:absolute; left:50%; top:-8%; z-index:4; transform:translateX(-50%); font-weight:900; color:#fff;
  -webkit-text-stroke: .25vmin #3b2a4a; paint-order: stroke; white-space:nowrap; pointer-events:none;
  animation: boh-word 1.6s ease-out forwards; }
@keyframes boh-shake { 0%,100%{transform:none} 20%{transform:rotate(-5deg)} 40%{transform:rotate(5deg)} 60%{transform:rotate(-3deg)} 80%{transform:rotate(3deg)} }
@keyframes boh-word { 0%{transform:translateX(-50%) scale(.3); opacity:0} 15%{transform:translateX(-50%) scale(1.2); opacity:1}
  70%{opacity:1} 100%{transform:translate(-50%,-6vh) scale(1); opacity:0} }
.boh-sun { position:absolute; right:7vw; top:6vh; width:14vmin; height:14vmin; border-radius:50%;
  background: radial-gradient(circle at 40% 40%, #fff3a0, #ffd23f); box-shadow: 0 0 6vmin #ffe680; }
.boh-cloud { position:absolute; height:7vmin; width:18vmin; border-radius:4vmin; background:#fff; opacity:.9;
  animation: boh-cloud linear infinite; }
.boh-cloud::before, .boh-cloud::after { content:''; position:absolute; background:#fff; border-radius:50%; }
.boh-cloud::before { width:8vmin; height:8vmin; left:3vmin; top:-4vmin; }
.boh-cloud::after { width:6vmin; height:6vmin; left:9vmin; top:-2.5vmin; }
@keyframes boh-cloud { from { transform: translateX(-25vw) } to { transform: translateX(110vw) } }
`;

export default {
  id: 'boh',
  title: 'Bøh!',
  icon: '🙈',
  color: '#06d6a0',
  edge: '#62b85a',

  start(root, kit) {
    root.style.background = 'linear-gradient(#bfe8ff 0%, #e6f7ff 45%, #8fd97f 46%, #62b85a 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const sun = document.createElement('div');
    sun.className = 'boh-sun';
    root.appendChild(sun);
    [[12, 40], [28, 55]].forEach(([top, dur], i) => {
      const c = document.createElement('div');
      c.className = 'boh-cloud';
      c.style.top = top + 'vh';
      c.style.animationDuration = dur + 's';
      c.style.animationDelay = (-i * 20) + 's';
      root.appendChild(c);
    });

    const boxColors = kit.shuffle(['#ff5d8f', '#3a86ff', '#8338ec', '#ff8a00']);
    const spots = Array.from({ length: 6 }, (_, i) => {
      const el = document.createElement('div');
      el.className = 'boh-spot';
      el.innerHTML = `<div class="boh-animal"></div><div class="boh-cover">${i % 3 === 1 ? BOX(boxColors[i % 4]) : BUSH}</div>`;
      root.appendChild(el);
      const s = { el, animalEl: el.querySelector('.boh-animal'), animal: null, busy: false };
      el.addEventListener('pointerdown', e => { e.preventDefault(); tap(s); });
      return s;
    });

    function layout() {
      const W = root.clientWidth, H = root.clientHeight;
      const portrait = H > W, cols = portrait ? 2 : 3, rows = portrait ? 3 : 2;
      const cw = W / cols, ch = (H * 0.62) / rows;
      const w = Math.min(cw * 0.78, ch * 1.25), h = w * 0.8;
      spots.forEach((s, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        s.el.style.width = w + 'px';
        s.el.style.height = h + 'px';
        s.el.style.left = (cw * (c + 0.5) - w / 2 + (r % 2 ? 1 : -1) * cw * 0.05) + 'px';
        s.el.style.top = (H * 0.36 + ch * (r + 0.5) - h / 2) + 'px';
        s.el.style.zIndex = 10 + r;
        s.animalEl.style.fontSize = (w * 0.5) + 'px';
      });
    }
    layout();
    const offResize = kit.onResize(root, layout);

    function hide(s, avoid) {
      const used = new Set(spots.filter(x => x.animal).map(x => x.animal[0]));
      s.animal = kit.pick(ANIMALS.filter(a => !used.has(a[0]) && a !== avoid));
      s.animalEl.textContent = s.animal[0];
    }
    kit.shuffle(spots).slice(0, HIDDEN).forEach(s => hide(s));

    function word(s, text) {
      const w = document.createElement('div');
      w.className = 'boh-word';
      w.textContent = text;
      w.style.fontSize = (s.el.clientWidth * 0.22) + 'px';
      s.el.appendChild(w);
      setTimeout(() => w.remove(), 1700);
    }

    function tap(s) {
      if (s.busy) return;
      if (!s.animal) {
        kit.sfx.rustle();
        kit.replay(s.el, 'shake');
        // nudge: the hidden ones wiggle too
        spots.filter(x => x.animal && !x.busy).forEach(x => t.later(() => kit.replay(x.el, 'shake'), 300));
        return;
      }
      s.busy = true;
      s.el.classList.remove('peek');
      s.el.classList.add('open');
      kit.sfx.pop(8);
      kit.sfx.giggle();
      word(s, 'Bøh!');
      kit.say('Bøh!', { pitch: 1.4, rate: 1 });
      const r = s.animalEl.getBoundingClientRect();
      kit.burst(r.left + r.width / 2, r.top + r.height / 2, 40, 0.8);
      const animal = s.animal;
      t.later(() => kit.say(animal[1] + '!', { pitch: 1.25 }), 900);
      t.later(() => { s.el.classList.remove('open'); kit.sfx.fwip(); }, 2700);
      t.later(() => {
        s.animal = null;
        s.animalEl.textContent = '';
        s.busy = false;
        const free = spots.filter(x => !x.animal && x !== s && !x.busy);
        if (free.length) hide(kit.pick(free), animal);
      }, 3200);
    }

    // hint: a hidden animal peeks out now and then
    t.every(() => {
      const hidden = spots.filter(x => x.animal && !x.busy);
      if (!hidden.length) return;
      const s = kit.pick(hidden);
      s.el.classList.add('peek');
      kit.sfx.blip(12);
      t.later(() => s.el.classList.remove('peek'), 900);
    }, 3800);

    return () => { t.clear(); offResize(); };
  },
};
