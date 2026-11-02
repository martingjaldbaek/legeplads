/* Figurer: a flip-book character in three strips (head / body / legs). Swipe a strip sideways to change it, roll 🎲
 * to spin all three, tap the character to make it dance. A whole character from one set gives a fanfare.
 * Art: games/art/figur-art.js. Engine: games/art/flipbog.js.
 */
import { flipbog } from './art/flipbog.js';
import { SETS, BANDS, CANVAS } from './art/figur-art.js';

const CSS = `
.figur-wrap { animation: figur-bob 2.4s ease-in-out infinite; }
@keyframes figur-bob { 0%,100%{transform:none} 50%{transform:translateY(-.8%)} }
.figur-wrap .fb-strip { transform-origin: 50% 100%; }
.figur-wrap.dance { animation: figur-jump .9s ease; }
.figur-wrap.dance .fb-strip:nth-child(1) { animation: figur-head .9s ease; }
.figur-wrap.dance .fb-strip:nth-child(2) { animation: figur-body .9s ease; }
.figur-wrap.dance .fb-strip:nth-child(3) { animation: figur-legs .9s ease; }
@keyframes figur-jump { 0%,100%{transform:none} 20%{transform:translateY(2%)} 45%{transform:translateY(-9%)} 70%{transform:translateY(1%)} }
@keyframes figur-head { 0%,100%{transform:none} 25%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} 75%{transform:rotate(-2deg)} }
@keyframes figur-body { 0%,100%{transform:none} 25%{transform:translateX(1.5%) rotate(2deg)} 50%{transform:translateX(-1.5%) rotate(-2deg)} 75%{transform:translateX(.6%)} }
@keyframes figur-legs { 0%,100%{transform:none} 20%{transform:scaleY(.92)} 45%{transform:scaleY(1.04)} 70%{transform:scaleY(.96)} }
`;

export default {
  id: 'blandefigur',
  title: 'Figurer',
  icon: '🦸',
  color: '#3a86ff',
  edge: '#cfe6ff',

  start(root, kit) {
    root.style.background = 'linear-gradient(#f2f8ff 0%, #dcecff 70%, #cfe6ff 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    let dancing = false;
    const fb = flipbog(root, kit, {
      canvas: CANVAS, bands: BANDS, count: SETS.length,
      art: (set, b) => SETS[set][1 + b],
      fit: (w, h) => {
        const ph = Math.min(h * 0.9, w * 0.42 * CANVAS[1] / CANVAS[0]);
        return { h: ph, cx: w / 2, top: (h - ph) / 2 + h * 0.01 };
      },
      gap: 1.45,
      onTap: () => dance(),
      onMatch(set) {
        dance(true);
        kit.sfx.fanfare();
        kit.bigBurst();
        t.later(() => kit.say(SETS[set][0] + '!', { pitch: 1.3 }), 500);
      },
    });
    fb.wrap.classList.add('figur-wrap');

    function dance(quiet) {
      if (dancing) return;
      dancing = true;
      kit.replay(fb.wrap, 'dance');
      if (!quiet) [0, 4, 2, 7].forEach((s, i) => kit.tone(kit.scaleHz(s + 5), { at: i * 0.18, dur: 0.2, type: 'triangle', vol: 0.15 }));
      t.later(() => { dancing = false; fb.wrap.classList.remove('dance'); }, 950);
    }
    return () => { t.clear(); fb.stop(); };
  },
};
