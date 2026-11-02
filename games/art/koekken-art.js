/* SVG art for Køkkenet: a soup pot on a stove, a pizza on a board, an oven and a birthday cake.
 * Same style as instrumenter-art.js: thick ink outlines, soft fills, little faces.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
export const face = (x, y, k = 1) => `
  <g class="kk-face">
    <g class="kk-eyes"><circle cx="${x - 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/><circle cx="${x + 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/>
    <circle cx="${x - 16 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/><circle cx="${x + 20 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/></g>
    <circle cx="${x - 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/><circle cx="${x + 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/>
    <path class="kk-m-closed" d="M${x - 11 * k} ${y + 13 * k} Q${x} ${y + 23 * k} ${x + 11 * k} ${y + 13 * k}" fill="none" ${ink(4 * k)}/>
    <ellipse class="kk-m-open" cx="${x}" cy="${y + 18 * k}" rx="${9 * k}" ry="${11 * k}" fill="#a8324a" ${ink(3 * k)}/>
  </g>`;

const flame = (x, y, s = 1, cls = '') => `<path class="${cls}" d="M${x} ${y - 30 * s} Q${x + 14 * s} ${y - 12 * s} ${x + 9 * s} ${y - 2 * s} Q${x} ${y + 4 * s} ${x - 9 * s} ${y - 2 * s} Q${x - 14 * s} ${y - 12 * s} ${x} ${y - 30 * s} Z" fill="#ff9f1c"/>
  <path class="${cls}" d="M${x} ${y - 16 * s} Q${x + 7 * s} ${y - 7 * s} ${x + 4 * s} ${y - 2 * s} Q${x} ${y + 1 * s} ${x - 4 * s} ${y - 2 * s} Q${x - 7 * s} ${y - 7 * s} ${x} ${y - 16 * s} Z" fill="#ffe066"/>`;

/* Pot: viewBox 400×360. The soup surface is the ellipse cx 200, cy 114, rx 142, ry 32
 * (14.5% / 22.8% / 71% / 17.8% of the box) – the game overlays floating ingredients there. */
export const POT = `<svg viewBox="0 0 400 360" class="kk-art">
  <rect x="70" y="318" width="260" height="26" rx="10" fill="#6b6f7a" ${ink(5)}/>
  <g class="kk-flames">${[110, 155, 200, 245, 290].map((x, i) => `<g class="kk-fl" style="animation-delay:${-i * 0.13}s">${flame(x, 322, 0.9)}</g>`).join('')}</g>
  <path d="M28 132 Q8 132 8 150 Q8 168 28 168 H54 V132 Z" fill="#c43d1c" ${ink(6)}/>
  <path d="M372 132 Q392 132 392 150 Q392 168 372 168 H346 V132 Z" fill="#c43d1c" ${ink(6)}/>
  <path d="M50 112 V268 Q50 306 92 306 H308 Q350 306 350 268 V112 Z" fill="#ef5a3c" ${ink(7)}/>
  <path d="M72 150 Q70 220 82 270" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".45"/>
  <g class="kk-dots" fill="#fff" opacity=".85"><circle cx="300" cy="170" r="9"/><circle cx="318" cy="230" r="7"/><circle cx="110" cy="250" r="7"/><circle cx="286" cy="275" r="6"/></g>
  ${face(200, 212, 1.4)}
  <ellipse cx="200" cy="112" rx="160" ry="42" fill="#c43d1c" ${ink(7)}/>
  <ellipse class="kk-soup" cx="200" cy="114" rx="142" ry="32" fill="#bfe6ff" ${ink(4)}/>
</svg>`;

/* Ladle: viewBox 60×260, the bowl centre at (30, 230) = 50% / 88.5%. */
export const LADLE = `<svg viewBox="0 0 60 260" class="kk-art">
  <rect x="22" y="4" width="16" height="214" rx="8" fill="#ffd23f" ${ink(5)}/>
  <circle cx="30" cy="20" r="6" fill="${INK}"/>
  <path d="M4 222 Q4 256 30 256 Q56 256 56 222 Z" fill="#b9c4cf" ${ink(5)}/>
</svg>`;

/* Pizza on a wooden board: viewBox 400×400, pizza centred at 200,200, dough r 176. */
export const PIZZA = `<svg viewBox="0 0 400 400" class="kk-art">
  <defs><mask id="kk-bitemask" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
    <rect width="400" height="400" fill="#fff"/><g class="kk-bites"></g></mask></defs>
  <circle cx="200" cy="200" r="196" fill="#d9a066" ${ink(6)}/>
  <path d="M60 120 Q90 80 130 70 M300 330 Q330 310 345 280" fill="none" stroke="#b97d45" stroke-width="6" stroke-linecap="round"/>
  <g class="kk-pz" mask="url(#kk-bitemask)">
    <circle class="kk-dough" cx="200" cy="200" r="176" fill="#f6d28b" ${ink(7)}/>
    <circle class="kk-sauce" cx="200" cy="200" r="146" fill="#e5482f"/>
    <g class="kk-cheese"></g>
    <g class="kk-tops"></g>
    <g class="kk-spots" opacity="0">${[[110, 70], [300, 90], [350, 220], [280, 340], [120, 330], [55, 200]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="#a8622b" opacity=".6"/>`).join('')}</g>
  </g>
</svg>`;

/* Oven: viewBox 300×330. The window (55,120)–(245,230). */
export const OVEN = `<svg viewBox="0 0 300 330" class="kk-art">
  <rect x="34" y="306" width="36" height="20" rx="6" fill="${INK}"/><rect x="230" y="306" width="36" height="20" rx="6" fill="${INK}"/>
  <rect x="10" y="16" width="280" height="296" rx="26" fill="#f7f2e7" ${ink(7)}/>
  <path d="M10 82 H290" ${ink(6)}/>
  <circle cx="44" cy="49" r="15" fill="#ffd23f" ${ink(5)}/><path d="M44 49 L44 38" ${ink(4)}/>
  <circle cx="256" cy="49" r="15" fill="#ffd23f" ${ink(5)}/><path d="M256 49 L265 42" ${ink(4)}/>
  ${face(150, 42, 0.9)}
  <rect x="34" y="104" width="232" height="186" rx="20" fill="#e2dccf" ${ink(6)}/>
  <rect x="72" y="92" width="156" height="14" rx="7" fill="#b9c4cf" ${ink(5)}/>
  <rect class="kk-glass" x="56" y="122" width="188" height="140" rx="16" fill="#3d2f45" ${ink(5)}/>
  <rect class="kk-glow" x="60" y="126" width="180" height="132" rx="13" fill="#ff9f1c" opacity="0"/>
  <g class="kk-minipz" opacity="0"><ellipse cx="150" cy="226" rx="66" ry="18" fill="#f6d28b" ${ink(4)}/><ellipse cx="150" cy="223" rx="52" ry="12" fill="#e5482f"/></g>
  <path d="M70 140 L100 140 M70 152 L84 152" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".35"/>
  <g class="kk-heat" opacity="0">${[100, 150, 200].map(x => `<path d="M${x - 10} 246 Q${x - 4} 234 ${x - 10} 222 Q${x - 16} 210 ${x - 10} 198" fill="none" stroke="#ffe066" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>
</svg>`;

/* Birthday cake on a stand: viewBox 400×420. Top tier 110–290 wide, its top at y 124 (candles stand there). */
function drips(x0, x1, y, depth) {
  let d = `M${x0 - 6} ${y + 10} Q${x0 - 6} ${y - 6} ${x0 + 10} ${y - 6} H${x1 - 10} Q${x1 + 6} ${y - 6} ${x1 + 6} ${y + 10} V${y + 16}`;
  const n = Math.round((x1 - x0) / 34), w = (x1 - x0 + 12) / n;
  for (let i = 0; i < n; i++) {
    const xa = x1 + 6 - i * w, xm = xa - w / 2, xb = xa - w, dd = depth * (i % 2 ? 0.55 : 1) + (i % 3) * 4;
    d += ` Q${xa} ${y + 16 + dd} ${xm} ${y + 16 + dd} Q${xb} ${y + 16 + dd} ${xb} ${y + 16}`;
  }
  return d + ' Z';
}
export const CAKE = `<svg viewBox="0 -60 400 480" class="kk-art">
  <ellipse cx="200" cy="410" rx="74" ry="10" fill="#e9e3f2" ${ink(5)}/>
  <rect x="178" y="378" width="44" height="32" fill="#f6f2fb" ${ink(5)}/>
  <ellipse cx="200" cy="374" rx="186" ry="22" fill="#f6f2fb" ${ink(6)}/>
  <path class="kk-sponge" d="M50 236 V348 Q50 368 72 368 H328 Q350 368 350 348 V236 Z" fill="#ffd59e" ${ink(7)}/>
  <path class="kk-frost" d="${drips(50, 350, 230, 22)}" fill="#ff8fc8" ${ink(6)}/>
  ${face(200, 302, 1.5)}
  <path class="kk-sponge" d="M110 136 V214 Q110 230 126 230 H274 Q290 230 290 214 V136 Z" fill="#ffd59e" ${ink(7)}/>
  <path class="kk-frost" d="${drips(110, 290, 128, 18)}" fill="#ff8fc8" ${ink(6)}/>
  <g class="kk-deco"></g>
  <g class="kk-candles"></g>
</svg>`;

/* One candle, its foot at (x, y). Tap target is the whole group. */
export const candle = (x, y, color) => `<g class="kk-candle lit" data-x="${x}">
  <rect x="${x - 26}" y="${y - 130}" width="52" height="134" fill="#fff" fill-opacity="0"/>
  <rect x="${x - 9}" y="${y - 66}" width="18" height="68" rx="5" fill="${color}" ${ink(4)}/>
  <path d="M${x - 9} ${y - 50} L${x + 9} ${y - 58} M${x - 9} ${y - 30} L${x + 9} ${y - 38} M${x - 9} ${y - 10} L${x + 9} ${y - 18}" stroke="#fff" stroke-width="4" opacity=".8"/>
  <path d="M${x} ${y - 66} V${y - 74}" ${ink(3)}/>
  <g class="kk-flame">${flame(x, y - 72, 1.1)}</g>
  <g class="kk-smoke"><circle cx="${x}" cy="${y - 84}" r="7" fill="#c9c3d6"/><circle cx="${x + 5}" cy="${y - 98}" r="9" fill="#d9d4e3"/><circle cx="${x - 3}" cy="${y - 114}" r="11" fill="#e9e5f0"/></g>
</g>`;

export const ART_CSS = `
.kk-art { width:100%; height:100%; display:block; overflow:visible; }
.kk-art * { transform-box: fill-box; }
.kk-m-open { display:none; }
.kk-talk .kk-m-open { display:inline; } .kk-talk .kk-m-closed { display:none; }
.kk-eyes { transform-origin:center; animation: kk-blink 4.4s infinite; }
@keyframes kk-blink { 0%,94%,100% { transform:none } 97% { transform:scaleY(.1) } }
.kk-fl { transform-origin: 50% 100%; animation: kk-flick .5s ease-in-out infinite alternate; }
@keyframes kk-flick { from { transform: scale(1, .85) } to { transform: scale(.9, 1.12) } }
.kk-flame { transform-origin: 50% 100%; animation: kk-flick .35s ease-in-out infinite alternate; }
.kk-candle .kk-smoke { opacity:0; }
.kk-candle:not(.lit) .kk-flame { display:none; }
.kk-candle.puff .kk-smoke { animation: kk-smoke 1.1s ease-out; }
@keyframes kk-smoke { 0% { opacity:.9; transform:none } 100% { opacity:0; transform: translateY(-40%) scale(1.6) } }
`;
