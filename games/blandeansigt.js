/* Fjæs: a flip-book face in three strips (hair + eyes / nose + ears / mouth + chin). Swipe a strip sideways to
 * change it, tap it to spin it, or roll 🎲 to spin all three. A whole face from one set gives a fanfare.
 * Art: games/art/fjaes-art.js. Engine: games/art/flipbog.js.
 */
import { flipbog } from './art/flipbog.js';
import { SETS, BANDS, CANVAS } from './art/fjaes-art.js';

const CSS = `
.fjaes-wrap.giggle .fb-strip:nth-child(1) { animation: fjaes-wob .5s ease; }
.fjaes-wrap.giggle .fb-strip:nth-child(2) { animation: fjaes-wob .5s .05s ease; }
.fjaes-wrap.giggle .fb-strip:nth-child(3) { animation: fjaes-wob .5s .1s ease; }
@keyframes fjaes-wob { 0%,100%{transform:none} 30%{transform:translateY(-3%) rotate(-2deg)} 65%{transform:translateY(1%) rotate(2deg)} }
`;

export default {
  id: 'blandeansigt',
  title: 'Fjæs',
  icon: '🤪',
  color: '#ff7b00',
  edge: '#ffe3c2',

  start(root, kit) {
    root.style.background = 'radial-gradient(circle at 50% 40%, #fffaf0, #ffe3c2)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const fb = flipbog(root, kit, {
      canvas: CANVAS, bands: BANDS, count: SETS.length,
      art: (set, b) => SETS[set][1 + b],
      fit: (w, h) => {
        const ph = Math.min(h * 0.86, w * 0.62 * CANVAS[1] / CANVAS[0]);
        return { h: ph, cx: w / 2, top: (h - ph) / 2 + h * 0.02 };
      },
      gap: 1.25,
      onMatch(set) {
        kit.replay(fb.wrap, 'giggle');
        kit.sfx.fanfare();
        kit.bigBurst();
        t.later(() => kit.say(SETS[set][0] + '!', { pitch: 1.3 }), 500);
      },
      onSettle() { kit.replay(fb.wrap, 'giggle'); },
    });
    fb.wrap.classList.add('fjaes-wrap');
    return () => { t.clear(); fb.stop(); };
  },
};
