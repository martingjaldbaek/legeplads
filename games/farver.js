/* Farver: drag the balls into the bucket of the same colour; the colour is named on the way in.
 * Balls stay wherever they're dropped (free play) – only the wrong bucket bounces them back.
 */
const COLORS = [
  ['Rød', '#ff3b4e'], ['Blå', '#3a86ff'], ['Gul', '#ffcc00'],
  ['Grøn', '#2bb24c'], ['Lilla', '#8f4dff'], ['Orange', '#ff8a00'],
];
const PER_COLOR = 2;

const CSS = `
.farve-ball, .farve-bucket { position:absolute; left:0; top:0; touch-action:none; }
.farve-ball { border-radius:50%; will-change:transform; z-index:5;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.85) 0 12%, rgba(255,255,255,0) 30%), var(--c);
  box-shadow: inset -.6vmin -1vmin 0 rgba(0,0,0,.15), 0 .8vmin 1.2vmin rgba(0,0,0,.18); transition: box-shadow .15s; }
.farve-ball.lift { box-shadow: inset -.6vmin -1vmin 0 rgba(0,0,0,.15), 0 2.5vmin 2.5vmin rgba(0,0,0,.25); }
.farve-ball.anim { transition: transform .45s cubic-bezier(.3,1.3,.5,1), opacity .3s; }
.farve-ball.in { transition: transform .35s ease-in, opacity .35s ease-in; opacity:0; }
.farve-bucket svg { width:100%; height:100%; display:block; overflow:visible; }
.farve-bucket.happy svg { animation: farve-happy .5s ease; transform-origin: 50% 100%; }
.farve-bucket.no svg { animation: farve-no .4s ease; transform-origin: 50% 100%; }
.farve-count { position:absolute; left:0; right:0; top:21%; display:flex; justify-content:center; gap:3%; pointer-events:none; }
.farve-count i { width:16%; aspect-ratio:1; border-radius:50%; background:var(--c); box-shadow: inset -.3vmin -.4vmin 0 rgba(0,0,0,.18);
  animation: farve-pop .35s cubic-bezier(.3,1.6,.5,1); }
@keyframes farve-happy { 0%,100%{transform:none} 35%{transform:scale(1.12,.9)} 65%{transform:scale(.95,1.08)} }
@keyframes farve-no { 0%,100%{transform:none} 25%{transform:rotate(-7deg)} 75%{transform:rotate(7deg)} }
@keyframes farve-pop { from { transform: scale(0) } to { transform: scale(1) } }
`;
const BUCKET = c => `<svg viewBox="0 0 100 100">
  <path d="M14 30 Q50 -18 86 30" fill="none" stroke="#7d8597" stroke-width="5" stroke-linecap="round"/>
  <path d="M8 30 L92 30 L82 94 Q81 99 75 99 L25 99 Q19 99 18 94 Z" fill="${c}"/>
  <path d="M8 30 L92 30 L82 94 Q81 99 75 99 L25 99 Q19 99 18 94 Z" fill="url(#shade)"/>
  <defs><linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
  <ellipse cx="50" cy="30" rx="44" ry="9" fill="${c}" style="filter:brightness(.8)"/>
  <ellipse cx="50" cy="30" rx="39" ry="6" fill="rgba(0,0,0,.4)"/>
</svg>`;

export default {
  id: 'farver',
  title: 'Farver',
  icon: '🪣',
  color: '#ffb400',
  edge: '#ffe5b8',

  start(root, kit) {
    root.style.background = 'linear-gradient(#fff9ec, #ffe5b8)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    let buckets = [], balls = [], round = 0, W = 0, H = 0, d = 80, z = 10;
    const place = b => { b.el.style.transform = `translate(${b.x - d / 2}px, ${b.y - d / 2}px)`; };

    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const n = buckets.length;
      const bw = Math.min(W / (n + 1) * 0.95, H * 0.3);
      d = Math.min(W, H) * 0.13;
      buckets.forEach((b, i) => {
        b.w = bw;
        b.x = W * (i + 1) / (n + 1);
        b.y = H - bw * 0.15 - (bw) / 2;          // centre of the bucket box
        Object.assign(b.el.style, { width: bw + 'px', height: bw + 'px', transform: `translate(${b.x - bw / 2}px, ${b.y - bw / 2}px)` });
      });
      balls.forEach(b => {
        b.el.style.width = b.el.style.height = d + 'px';
        b.x = Math.min(W - d / 2, Math.max(d / 2, b.fx * W));
        b.y = Math.min(H * 0.55, Math.max(d, b.fy * H));
        if (!b.done) place(b);
      });
    }

    // the bucket opening: a generous zone above and around the rim
    const opening = b => ({ x: b.x, y: b.y - b.w * 0.2 });
    const near = (ball, bk, f) => Math.hypot(ball.x - opening(bk).x, ball.y - opening(bk).y) < bk.w * f;

    function newRound() {
      root.querySelectorAll('.farve-ball, .farve-bucket').forEach(e => e.remove());
      const colors = round === 0 ? COLORS.slice(0, 3) : kit.shuffle(COLORS).slice(0, 3);
      round++;
      buckets = colors.map(([name, c]) => {
        const el = document.createElement('div');
        el.className = 'farve-bucket';
        el.style.setProperty('--c', c);
        el.innerHTML = BUCKET(c) + '<div class="farve-count"></div>';
        root.appendChild(el);
        return { el, name, c, got: 0 };
      });
      // balls on a jittered grid in the upper half so they don't overlap
      const spots = kit.shuffle(Array.from({ length: 8 }, (_, i) => [(i % 4 + 0.5) / 4, 0.18 + Math.floor(i / 4) * 0.22]));
      balls = [];
      colors.forEach(([name, c], ci) => {
        for (let k = 0; k < PER_COLOR; k++) {
          const [fx, fy] = spots.pop();
          const el = document.createElement('div');
          el.className = 'farve-ball';
          el.style.setProperty('--c', c);
          root.appendChild(el);
          const ball = { el, bucket: buckets[ci], fx: fx + kit.rand(-0.06, 0.06), fy: fy + kit.rand(-0.04, 0.04), done: false };
          bindDrag(ball);
          balls.push(ball);
        }
      });
      layout();
      balls.forEach((b, i) => {
        b.el.style.transform = `translate(${b.x - d / 2}px, ${-d * 2}px)`;
        void b.el.offsetWidth;
        b.el.classList.add('anim');
        t.later(() => place(b), 100 + i * 90);
      });
    }

    function drop(ball) {
      const bk = ball.bucket;
      ball.done = true;
      ball.el.classList.remove('lift', 'anim');
      ball.el.classList.add('in');
      const o = opening(bk);
      ball.el.style.transform = `translate(${o.x - d / 2}px, ${o.y - d / 2 + bk.w * 0.15}px) scale(.4)`;
      kit.sfx.plop();
      kit.replay(bk.el, 'happy');
      kit.burst(o.x, o.y, 25, 0.7);
      t.later(() => kit.say(bk.name + '!', { pitch: 1.25 }), 150);
      t.later(() => { ball.el.remove(); const dot = document.createElement('i'); bk.el.querySelector('.farve-count').appendChild(dot); }, 350);
      if (balls.every(b => b.done)) {
        t.later(() => { kit.sfx.fanfare(); kit.bigBurst(); kit.say('Hurra! Alle farverne!', { pitch: 1.3 }); }, 900);
        t.later(newRound, 4000);
      }
    }

    function bindDrag(ball) {
      let ox = 0, oy = 0;
      kit.draggable(ball.el, {
        start(e) {
          if (ball.done) return false;
          ox = ball.x - e.clientX; oy = ball.y - e.clientY;
          ball.el.classList.remove('anim');
          ball.el.classList.add('lift');
          ball.el.style.zIndex = ++z;
          kit.sfx.pickUp();
        },
        move(e) {
          if (ball.done) return;
          ball.x = e.clientX + ox; ball.y = e.clientY + oy;
          place(ball);
          if (near(ball, ball.bucket, 0.32)) drop(ball);   // close enough: in it goes
        },
        end() {
          if (ball.done) return;
          ball.el.classList.remove('lift');
          if (near(ball, ball.bucket, 0.6)) return drop(ball);
          const wrong = buckets.find(bk => bk !== ball.bucket && near(ball, bk, 0.55));
          ball.el.classList.add('anim');
          if (wrong) {
            kit.sfx.boing();
            kit.replay(wrong.el, 'no');
            ball.x = ball.fx * W; ball.y = ball.fy * H;    // back where it came from
          } else {
            ball.x = Math.min(W - d / 2, Math.max(d / 2, ball.x));
            ball.y = Math.min(H - d / 2, Math.max(d / 2, ball.y));
          }
          ball.fx = ball.x / W; ball.fy = ball.y / H;
          place(ball);
        },
      });
    }

    addEventListener('resize', layout);
    newRound();
    return () => { t.clear(); removeEventListener('resize', layout); };
  },
};
