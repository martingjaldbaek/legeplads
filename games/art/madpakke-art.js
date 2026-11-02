/* SVG art for Madpakken: a lunch box with five compartments, its lid, and a backpack with a zip.
 * Same style as instrumenter-art.js: thick ink outlines, soft fills, little faces.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const face = (x, y, k = 1) => `
  <g class="md-face">
    <g class="md-eyes"><circle cx="${x - 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/><circle cx="${x + 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/>
    <circle cx="${x - 16 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/><circle cx="${x + 20 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/></g>
    <circle cx="${x - 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/><circle cx="${x + 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/>
    <path class="md-m-closed" d="M${x - 11 * k} ${y + 13 * k} Q${x} ${y + 23 * k} ${x + 11 * k} ${y + 13 * k}" fill="none" ${ink(4 * k)}/>
    <ellipse class="md-m-open" cx="${x}" cy="${y + 18 * k}" rx="${9 * k}" ry="${11 * k}" fill="#a8324a" ${ink(3 * k)}/>
  </g>`;

/* Lunch box: viewBox 500×340. Compartments as [x, y, w, h]; the game drops food at their centres. */
export const COMPARTMENTS = [[34, 34, 172, 272], [222, 34, 120, 128], [222, 178, 120, 128], [358, 34, 108, 128], [358, 178, 108, 128]];
export const BOX = `<svg viewBox="0 0 500 340" class="md-art">
  <rect x="10" y="12" width="480" height="318" rx="44" fill="var(--md-box)" ${ink(8)}/>
  ${COMPARTMENTS.map(([x, y, w, h], i) => `<rect class="md-comp" data-i="${i}" x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#fff8ee" ${ink(5)}/>`).join('')}
  <g class="md-food"></g>
</svg>`;

/* Lid: same footprint as the box, drawn on top when it closes. */
export const LID = `<svg viewBox="0 0 500 340" class="md-art">
  <rect x="6" y="8" width="488" height="326" rx="46" fill="var(--md-lid)" ${ink(8)}/>
  <rect x="34" y="34" width="432" height="272" rx="30" fill="#fff" opacity=".22"/>
  <path d="M60 70 Q70 50 100 48" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>
  <rect x="200" y="320" width="100" height="26" rx="10" fill="#ffd23f" ${ink(5)}/>
  ${face(250, 160, 2.1)}
</svg>`;

/* Backpack: viewBox 360×440. The zip runs along y 128 from x 70 to 290; the opening is above it. */
export const ZIP = { x0: 70, x1: 290, y: 128 };
export const BAG = `<svg viewBox="0 0 360 440" class="md-art">
  <path d="M120 70 Q120 18 180 18 Q240 18 240 70" fill="none" ${ink(16)}/>
  <path d="M120 70 Q120 18 180 18 Q240 18 240 70" fill="none" stroke="var(--md-bag2)" stroke-width="8"/>
  <rect x="2" y="170" width="44" height="170" rx="20" fill="var(--md-bag2)" ${ink(6)}/>
  <rect x="314" y="170" width="44" height="170" rx="20" fill="var(--md-bag2)" ${ink(6)}/>
  <path d="M40 140 Q40 70 120 64 H240 Q320 70 320 140 V380 Q320 424 276 424 H84 Q40 424 40 380 Z" fill="var(--md-bag)" ${ink(8)}/>
  <path class="md-hole" d="M70 128 Q70 92 120 88 H240 Q290 92 290 128 Q180 150 70 128 Z" fill="#3d2f45"/>
  <rect class="md-zipped" x="70" y="122" width="0" height="12" rx="6" fill="var(--md-bag2)"/>
  <path d="M70 128 H290" stroke="${INK}" stroke-width="4" stroke-dasharray="3 5"/>
  <rect x="86" y="236" width="188" height="150" rx="34" fill="var(--md-bag2)" ${ink(6)}/>
  <path d="M100 262 H260" stroke="${INK}" stroke-width="4" stroke-dasharray="3 5"/>
  ${face(180, 312, 1.25)}
  <path d="M64 170 Q60 120 90 100" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".35"/>
  <g class="md-pull"><circle cx="0" cy="0" r="46" fill="#fff" fill-opacity="0"/>
    <rect x="-11" y="-12" width="22" height="20" rx="5" fill="#b9c4cf" ${ink(4)}/>
    <rect x="-14" y="6" width="28" height="44" rx="12" fill="#ffd23f" ${ink(5)}/>
    <circle cx="0" cy="36" r="5" fill="${INK}"/></g>
</svg>`;

export const ART_CSS = `
.md-art { width:100%; height:100%; display:block; overflow:visible; }
.md-art * { transform-box: fill-box; }
.md-m-open { display:none; }
.md-talk .md-m-open { display:inline; } .md-talk .md-m-closed { display:none; }
.md-eyes { transform-origin:center; animation: md-blink 4.4s infinite; }
@keyframes md-blink { 0%,94%,100% { transform:none } 97% { transform:scaleY(.1) } }
`;
