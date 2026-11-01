/* Bondegården: a farm. Tap an animal – it jumps, a speech bubble shows its sound, and the voice says
 * "Koen siger muh!". Tap the sun for a surprise.
 *
 * Own recordings: set RECORDINGS = true and add lyd/dyr/<id>.mp3 (e.g. lyd/dyr/ko.mp3).
 * Animals without a file fall back to the computer voice.
 */
const RECORDINGS = false;

// id, emoji, definite name, sound, voice pitch, position (x, y as fraction of the screen)
const ANIMALS = [
  ['ko',   '🐮', 'Koen',   'muuuh',    0.7, 0.42, 0.60],
  ['gris', '🐷', 'Grisen', 'øf øf',    1.0, 0.62, 0.62],
  ['faar', '🐑', 'Fåret',  'mææææh',   1.2, 0.84, 0.58],
  ['hest', '🐴', 'Hesten', 'ihihihi',  1.1, 0.14, 0.84],
  ['hone', '🐔', 'Hønen',  'klukkluk', 1.45, 0.33, 0.86],
  ['hund', '🐶', 'Hunden', 'vov vov',  1.0, 0.52, 0.88],
  ['kat',  '🐱', 'Katten', 'miav',     1.45, 0.70, 0.86],
  ['and',  '🦆', 'Anden',  'rap rap',  1.3, 0.89, 0.84],
];

const CSS = `
.farm-hill { position:absolute; left:-10%; right:-10%; border-radius:50% 50% 0 0; }
.farm-barn { position:absolute; left:3vw; width:24vmin; }
.farm-sun { position:absolute; right:6vw; top:5vh; width:15vmin; height:15vmin; }
.farm-sun svg { width:100%; height:100%; overflow:visible; }
.farm-sun .rays { transform-origin: 50px 50px; animation: farm-spin 20s linear infinite; }
.farm-sun.happy { animation: farm-wiggle .7s ease; }
.farm-animal { position:absolute; line-height:1; transform: translate(-50%, -100%); }
.farm-animal .body { display:inline-block; transform-origin: 50% 100%; animation: farm-idle 2.6s ease-in-out infinite; }
.farm-animal.jump .body { animation: farm-jump .7s cubic-bezier(.3,.6,.4,1); }
.farm-animal::after { content:''; position:absolute; left:15%; right:15%; bottom:-.08em; height:.14em; border-radius:50%;
  background: rgba(0,0,0,.15); z-index:-1; }
.farm-bubble { position:absolute; left:50%; bottom:105%; transform:translateX(-50%); background:#fff; color:#3b2a4a;
  font-weight:900; font-size:.32em; padding:.25em .55em; border-radius:1em; white-space:nowrap; pointer-events:none;
  box-shadow: 0 .08em 0 rgba(0,0,0,.12); animation: farm-bubble 1.8s ease-out forwards; }
.farm-bubble::after { content:''; position:absolute; left:50%; top:100%; margin-left:-.25em; border:.25em solid transparent; border-top-color:#fff; }
@keyframes farm-idle { 0%,100%{transform:none} 50%{transform: translateY(-3%) rotate(2deg)} }
@keyframes farm-jump { 0%{transform:none} 25%{transform:scale(1.1,.88)} 55%{transform:translateY(-35%) scale(.95,1.08)} 80%{transform:scale(1.06,.94)} 100%{transform:none} }
@keyframes farm-bubble { 0%{transform:translateX(-50%) scale(.2); opacity:0} 12%{transform:translateX(-50%) scale(1.1); opacity:1}
  80%{opacity:1} 100%{transform:translate(-50%,-.3em); opacity:0} }
@keyframes farm-spin { to { transform: rotate(360deg) } }
@keyframes farm-wiggle { 0%,100%{transform:none} 25%{transform:rotate(-15deg) scale(1.15)} 60%{transform:rotate(12deg) scale(1.1)} }
`;

const BARN = `<svg viewBox="0 0 120 110">
  <path d="M8 46 L60 8 L112 46 Z" fill="#b8312f"/><path d="M4 48 L60 6 L116 48" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <rect x="16" y="44" width="88" height="64" fill="#d64541"/>
  <rect x="42" y="64" width="36" height="44" fill="#fff"/><rect x="45" y="67" width="30" height="41" fill="#b8312f"/>
  <path d="M45 67 L75 108 M75 67 L45 108" stroke="#fff" stroke-width="4"/>
  <rect x="50" y="26" width="20" height="16" rx="2" fill="#fff"/><rect x="53" y="29" width="14" height="10" fill="#6b3f1a"/>
</svg>`;
const SUN = `<svg viewBox="0 0 100 100">
  <g class="rays" stroke="#ffcf3f" stroke-width="6" stroke-linecap="round">
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${50 + Math.cos(a) * 40}" y1="${50 + Math.sin(a) * 40}" x2="${50 + Math.cos(a) * 52}" y2="${50 + Math.sin(a) * 52}"/>`; }).join('')}
  </g>
  <circle cx="50" cy="50" r="32" fill="#ffd93f"/>
  <circle cx="40" cy="45" r="4" fill="#3b2a4a"/><circle cx="60" cy="45" r="4" fill="#3b2a4a"/>
  <circle cx="33" cy="56" r="5" fill="#ff9f6b" opacity=".6"/><circle cx="67" cy="56" r="5" fill="#ff9f6b" opacity=".6"/>
  <path d="M40 58 Q50 67 60 58" fill="none" stroke="#3b2a4a" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

export default {
  id: 'bondegaard',
  title: 'Bondegården',
  icon: '🐮',
  color: '#2bb24c',
  edge: '#4fa83f',

  start(root, kit) {
    root.style.background = 'linear-gradient(#9fdcff, #dff4ff 60%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();

    const barn = document.createElement('div');
    barn.className = 'farm-barn';
    barn.innerHTML = BARN;
    barn.style.top = '27vh';
    root.appendChild(barn);
    const hills = [['#8fd36a', '38%', '120%'], ['#6fc24f', '50%', '140%'], ['#4fa83f', '66%', '160%']];
    hills.forEach(([c, top, w], i) => {
      const h = document.createElement('div');
      h.className = 'farm-hill';
      h.style.cssText = `top:${top}; bottom:0; background:${c}; left:${i % 2 ? '-30%' : '-10%'}; width:${w}`;
      root.appendChild(h);
    });
    const sun = document.createElement('div');
    sun.className = 'farm-sun';
    sun.innerHTML = SUN;
    root.appendChild(sun);
    sun.addEventListener('pointerdown', e => {
      e.preventDefault();
      kit.replay(sun, 'happy');
      kit.sfx.chime();
      kit.say(kit.pick(['Godmorgen!', 'Hej med dig!', 'Solen skinner!']), { pitch: 1.3 });
    });

    let size = 100;
    const els = ANIMALS.map(([id, emoji, name, sound, vpitch, fx, fy]) => {
      const el = document.createElement('div');
      el.className = 'farm-animal';
      el.innerHTML = `<span class="body">${emoji}</span>`;
      el.querySelector('.body').style.animationDelay = kit.rand(-2.6, 0) + 's';
      root.appendChild(el);
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        kit.replay(el, 'jump');
        const b = document.createElement('div');
        b.className = 'farm-bubble';
        b.textContent = sound[0].toUpperCase() + sound.slice(1) + '!';
        el.appendChild(b);
        setTimeout(() => b.remove(), 1900);
        kit.sfx.blip(Math.round(vpitch * 6));
        speak(id, `${name} siger ${sound}!`, vpitch);
      });
      return { el, fx, fy };
    });

    let clip = null;
    function speak(id, text, pitch) {
      if (clip) { clip.pause(); clip = null; }
      if (!RECORDINGS) return kit.say(text, { pitch, rate: 0.95 });
      clip = new Audio(`lyd/dyr/${id}.mp3`);
      clip.onerror = () => kit.say(text, { pitch, rate: 0.95 });
      clip.play().catch(() => kit.say(text, { pitch, rate: 0.95 }));
    }

    function layout() {
      const W = root.clientWidth, H = root.clientHeight;
      size = Math.min(W * 0.13, H * 0.17);
      els.forEach(({ el, fx, fy }) => {
        el.style.left = fx * W + 'px';
        el.style.top = fy * H + 'px';
        el.style.fontSize = size * (0.85 + fy * 0.3) + 'px';  // nearer = bigger
        el.style.zIndex = Math.round(fy * 100);
      });
    }
    layout();
    const offResize = kit.onResize(root, layout);

    return () => { t.clear(); offResize(); if (clip) clip.pause(); };
  },
};
