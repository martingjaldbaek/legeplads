/* Xylofon: rainbow bars with faces. Tap to play, slide a finger across for a glissando.
 * Pentatonic, so any combination sounds nice. Multi-touch.
 */
const COLORS = ['#ff3b6b', '#ff8a00', '#ffc400', '#06d6a0', '#2ec4b6', '#3a86ff', '#8338ec', '#f15bb5'];

const CSS = `
.xylo-wrap { position:absolute; left:5vw; right:5vw; top:14vh; bottom:9vh;
  display:flex; align-items:center; justify-content:center; gap:1.6vw; }
.xylo-rail { position:absolute; left:-1vw; right:-1vw; height:3vh; border-radius:2vh; background:#c08552;
  box-shadow: 0 .6vh 0 #93603a; }
.xylo-bar { position:relative; z-index:1; flex:1; max-width:11vw; border-radius:2.5vmin;
  background: linear-gradient(to right, rgba(255,255,255,.35), rgba(255,255,255,0) 45%, rgba(0,0,0,.1)), var(--c);
  box-shadow: 0 1vmin 0 rgba(0,0,0,.18); display:flex; align-items:center; justify-content:center; }
.xylo-bar.hit { animation: xylo-hit .35s ease; }
.xylo-bar svg { width:72%; overflow:visible; }
.xylo-bar .open { display:none; }
.xylo-bar.sing .open { display:inline; }
.xylo-bar.sing .closed { display:none; }
.xylo-peg { position:absolute; left:50%; width:2.2vmin; height:2.2vmin; margin-left:-1.1vmin; border-radius:50%;
  background: rgba(255,255,255,.75); box-shadow: inset 0 -.3vmin 0 rgba(0,0,0,.15); }
.xylo-note { position:absolute; z-index:5; font-size:7vmin; font-weight:900; pointer-events:none;
  text-shadow: 0 .3vmin 0 rgba(0,0,0,.12); animation: xylo-note 1.3s ease-out forwards; }
@keyframes xylo-hit { 0%{transform:none} 30%{transform:scale(1.07,.93) translateY(1vh)} 100%{transform:none} }
@keyframes xylo-note { from { transform: translate(-50%,0) scale(.6); opacity:1 }
  to { transform: translate(calc(-50% + var(--dx)), -20vh) rotate(var(--rot)) scale(1.25); opacity:0 } }
`;

export default {
  id: 'xylofon',
  title: 'Xylofon',
  icon: '🎶',
  color: '#8338ec',
  edge: '#ffe6f2',

  start(root, kit) {
    root.style.background = 'linear-gradient(#fff7fb, #ffe6f2)';
    kit.injectCSS(root, CSS);
    const wrap = document.createElement('div');
    wrap.className = 'xylo-wrap';
    root.appendChild(wrap);
    for (const top of ['32%', '68%']) {
      const rail = document.createElement('div');
      rail.className = 'xylo-rail';
      rail.style.top = `calc(${top} - 1.5vh)`;
      wrap.appendChild(rail);
    }
    const bars = COLORS.map((c, i) => {
      const b = document.createElement('div');
      b.className = 'xylo-bar';
      b.style.setProperty('--c', c);
      b.style.height = (96 - i * 6) + '%';
      b.innerHTML = `
        <div class="xylo-peg" style="top:7%"></div><div class="xylo-peg" style="bottom:7%"></div>
        <svg viewBox="0 0 60 44">
          <circle cx="19" cy="14" r="5" fill="#3b2a4a"/><circle cx="41" cy="14" r="5" fill="#3b2a4a"/>
          <circle cx="20.5" cy="12.5" r="1.8" fill="#fff"/><circle cx="42.5" cy="12.5" r="1.8" fill="#fff"/>
          <circle cx="11" cy="24" r="4" fill="#fff" opacity=".35"/><circle cx="49" cy="24" r="4" fill="#fff" opacity=".35"/>
          <path class="closed" d="M22 26 Q30 33 38 26" fill="none" stroke="#3b2a4a" stroke-width="3.5" stroke-linecap="round"/>
          <ellipse class="open" cx="30" cy="30" rx="6.5" ry="8" fill="#3b2a4a"/>
        </svg>`;
      wrap.appendChild(b);
      return b;
    });

    const singTimers = new Map();
    function play(i) {
      const b = bars[i];
      kit.sfx.xylo(kit.scaleHz(i, 523.25));   // left (longest) = lowest
      kit.replay(b, 'hit');
      b.classList.add('sing');
      clearTimeout(singTimers.get(i));
      singTimers.set(i, setTimeout(() => b.classList.remove('sing'), 320));
      const r = b.getBoundingClientRect();
      const n = document.createElement('div');
      n.className = 'xylo-note';
      n.textContent = kit.pick(['♪', '♫', '♩', '♬']);
      n.style.color = COLORS[i];
      n.style.left = (r.left + r.width / 2) + 'px';
      n.style.top = (r.top - 4) + 'px';
      n.style.setProperty('--dx', kit.rand(-6, 6) + 'vw');
      n.style.setProperty('--rot', kit.rand(-30, 30) + 'deg');
      root.appendChild(n);
      setTimeout(() => n.remove(), 1400);
    }

    // which bar is under x (nearest bar if between bars; y doesn't matter – generous for small hands)
    function barAt(x) {
      let best = 0, bestD = Infinity;
      bars.forEach((b, i) => {
        const r = b.getBoundingClientRect(), d = Math.abs(x - (r.left + r.width / 2));
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    const fingers = new Map();   // pointerId -> bar index
    root.addEventListener('pointerdown', e => {
      if (e.target.closest('#homeBtn')) return;
      const i = barAt(e.clientX);
      fingers.set(e.pointerId, i);
      play(i);
    });
    root.addEventListener('pointermove', e => {
      if (!fingers.has(e.pointerId)) return;
      const i = barAt(e.clientX);
      if (i !== fingers.get(e.pointerId)) { fingers.set(e.pointerId, i); play(i); }
    });
    const up = e => fingers.delete(e.pointerId);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);

    return () => singTimers.forEach(clearTimeout);
  },
};
