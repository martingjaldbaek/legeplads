/* SVG art for Bageriet (games/bageri.js). Thick #4a3b5c outlines, round shapes, faces where it's cute. */
const O = '#4a3b5c';
const face = (x, y, s = 1) => `<g class="eyes"><circle cx="${x - 26 * s}" cy="${y}" r="${7 * s}" fill="${O}"/><circle cx="${x + 26 * s}" cy="${y}" r="${7 * s}" fill="${O}"/></g>
  <path d="M${x - 16 * s} ${y + 14 * s} Q${x} ${y + 30 * s} ${x + 16 * s} ${y + 14 * s}" fill="none" stroke="${O}" stroke-width="${5 * s}" stroke-linecap="round"/>
  <circle cx="${x - 44 * s}" cy="${y + 14 * s}" r="${8 * s}" fill="#ff8fab" opacity=".55"/><circle cx="${x + 44 * s}" cy="${y + 14 * s}" r="${8 * s}" fill="#ff8fab" opacity=".55"/>`;

/** A paper bag with a label (flour, sugar). viewBox 0 0 100 120 */
export const BAG = (col, label) => `<svg viewBox="0 0 100 120"><path d="M20 30 L80 30 L90 112 Q50 120 10 112 Z" fill="${col}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M20 30 L27 8 L73 8 L80 30 Z" fill="${col}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M30 8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8 l5 8 l5 -8" fill="none" stroke="${O}" stroke-width="3"/>
  <rect x="22" y="58" width="56" height="30" rx="8" fill="#fff" stroke="${O}" stroke-width="3"/>
  <text x="50" y="79" font-family="system-ui,sans-serif" font-weight="900" font-size="${label.length > 4 ? 12 : 17}" text-anchor="middle" fill="${O}">${label}</text></svg>`;

/** Mixing bowl with a face. viewBox 0 0 400 250. Batter ellipse .batter, ingredient blobs go in .blobs. */
export const BOWL = `<svg viewBox="0 0 400 250" overflow="visible">
  <defs><clipPath id="bg-rim"><ellipse cx="200" cy="64" rx="162" ry="27"/></clipPath></defs>
  <path d="M18 62 Q200 92 382 62 Q376 205 200 236 Q24 205 18 62 Z" fill="#7cc6fe" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M60 120 Q200 150 340 120" fill="none" stroke="#fff" stroke-width="9" opacity=".35" stroke-linecap="round"/>
  ${face(200, 160, 1.1)}
  <ellipse cx="200" cy="62" rx="182" ry="36" fill="#d4edff" stroke="${O}" stroke-width="7"/>
  <g clip-path="url(#bg-rim)">
    <ellipse class="batter" cx="200" cy="70" rx="165" ry="30" fill="#f6efe3" opacity="0"/>
    <g class="blobs"></g>
    <g class="dots"></g>
    <g class="swirl" opacity="0"><g class="swirl-r"><path d="M0 0 m-10 0 a10 10 0 1 1 20 0 a25 25 0 1 1 -45 0 a42 42 0 1 1 80 0 a60 60 0 1 1 -110 0 a78 78 0 1 1 145 0"
      fill="none" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round" transform="scale(1 .2)"/></g></g>
  </g></svg>`;

/** A whisk, handle at the bottom. viewBox 0 0 70 220 */
export const WHISK = `<svg viewBox="0 0 70 220"><g fill="none" stroke="#9aa3b8" stroke-width="5">
  <path d="M35 120 C0 90 5 15 35 10 C65 15 70 90 35 120"/><path d="M35 120 C15 90 18 20 35 12 C52 20 55 90 35 120"/><path d="M35 120 L35 12"/></g>
  <rect x="25" y="118" width="20" height="96" rx="10" fill="#ff6b8b" stroke="${O}" stroke-width="5"/></svg>`;

/** Blender. viewBox 0 0 240 360. Contents in .jar (bands), the button is a separate element. */
export const BLENDER = `<svg viewBox="0 0 240 360" overflow="visible">
  <defs><clipPath id="bg-jar"><path d="M40 40 L200 40 L184 248 L56 248 Z"/></clipPath></defs>
  <g class="jar-shake">
  <g clip-path="url(#bg-jar)"><g class="jar"></g></g>
  <path d="M34 34 L206 34 L188 252 L52 252 Z" fill="rgba(220,240,255,.35)" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M58 60 L52 200" stroke="#fff" stroke-width="9" opacity=".5" stroke-linecap="round"/>
  <path d="M206 70 Q236 74 234 130 Q232 186 196 190" fill="none" stroke="${O}" stroke-width="7"/>
  <rect x="26" y="14" width="188" height="28" rx="12" fill="#ff8fab" stroke="${O}" stroke-width="7"/>
  <rect x="104" y="0" width="32" height="20" rx="8" fill="#ff8fab" stroke="${O}" stroke-width="6"/>
  </g>
  <path d="M40 252 L200 252 L214 350 L26 350 Z" fill="#ff6b8b" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>
  <g transform="translate(120 278) scale(.5)">${face(0, 0)}</g></svg>`;

/** Frying pan, seen from slightly above; the pan's middle is at (170,110). viewBox 0 0 460 220 */
export const PAN = `<svg viewBox="0 0 460 220" overflow="visible">
  <rect x="318" y="94" width="136" height="32" rx="16" fill="#b5651d" stroke="${O}" stroke-width="7"/>
  <ellipse cx="170" cy="118" rx="166" ry="98" fill="#454a5e" stroke="${O}" stroke-width="7"/>
  <ellipse cx="170" cy="108" rx="140" ry="80" fill="#2f3345"/>
  <path d="M80 70 Q120 50 170 48" fill="none" stroke="#fff" stroke-width="7" opacity=".18" stroke-linecap="round"/></svg>`;

/** Oven with a window (.win) that glows (.glow). viewBox 0 0 360 380 */
export const OVEN = `<svg viewBox="0 0 360 380" overflow="visible">
  <rect x="8" y="8" width="344" height="364" rx="34" fill="#f1f3fa" stroke="${O}" stroke-width="7"/>
  <rect x="8" y="8" width="344" height="78" rx="34" fill="#ffd166" stroke="${O}" stroke-width="7"/>
  <circle cx="70" cy="47" r="20" fill="#fff" stroke="${O}" stroke-width="6"/><circle cx="290" cy="47" r="20" fill="#fff" stroke="${O}" stroke-width="6"/>
  <path d="M70 47 L70 33 M290 47 L302 40" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
  <g transform="translate(180 50) scale(.5)">${face(0, -6)}</g>
  <rect x="40" y="114" width="280" height="228" rx="24" fill="#d9dceb" stroke="${O}" stroke-width="7"/>
  <rect x="66" y="152" width="228" height="150" rx="16" fill="#3b3550" stroke="${O}" stroke-width="6"/>
  <rect class="glow" x="66" y="152" width="228" height="150" rx="16" fill="#ff9f1c" opacity="0"/>
  <rect x="100" y="126" width="160" height="14" rx="7" fill="#b9bdd0" stroke="${O}" stroke-width="5"/></svg>`;

/** Plate. viewBox 0 0 520 140 */
export const PLATE = `<svg viewBox="0 0 520 140"><ellipse cx="260" cy="76" rx="252" ry="58" fill="#fff" stroke="${O}" stroke-width="7"/>
  <ellipse cx="260" cy="72" rx="190" ry="36" fill="none" stroke="#c9e6ff" stroke-width="6"/></svg>`;

/** Glass for the smoothie; contents (.fill) rise via a clip. viewBox 0 0 180 260 */
export const GLASS = col => `<svg viewBox="0 0 180 260" overflow="visible">
  <defs><clipPath id="bg-glass"><path d="M24 24 L156 24 L142 246 L38 246 Z"/></clipPath></defs>
  <g clip-path="url(#bg-glass)"><rect class="fill" x="0" y="250" width="180" height="250" fill="${col}"/>
    <g class="froth" opacity="0"><circle cx="50" cy="0" r="12" fill="#fff" opacity=".6"/><circle cx="110" cy="0" r="10" fill="#fff" opacity=".6"/></g></g>
  <path d="M20 18 L160 18 L144 250 L36 250 Z" fill="rgba(220,240,255,.3)" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M42 40 L52 220" stroke="#fff" stroke-width="8" opacity=".5" stroke-linecap="round"/></svg>`;

/** Bendy straw. viewBox 0 0 80 200 */
export const STRAW = `<svg viewBox="0 0 80 200"><path d="M22 196 L22 60 Q22 30 50 18 L70 8" fill="none" stroke="${O}" stroke-width="22" stroke-linecap="round"/>
  <path d="M22 196 L22 60 Q22 30 50 18 L70 8" fill="none" stroke="#ff4d6d" stroke-width="12" stroke-linecap="round"/>
  <path d="M22 180 L22 160 M22 130 L22 110 M22 82 L24 66" stroke="#fff" stroke-width="12"/></svg>`;

/** Cookie cutter shapes in a 100×100 box. */
export const SHAPES = {
  hjerte: 'M50 88 C10 62 6 30 26 20 C40 13 50 24 50 32 C50 24 60 13 74 20 C94 30 90 62 50 88 Z',
  stjerne: 'M50 6 L62 36 L94 38 L69 58 L78 92 L50 73 L22 92 L31 58 L6 38 L38 36 Z',
  cirkel: 'M50 8 A42 42 0 1 1 49.9 8 Z',
  blomst: 'M50 30 C50 6 80 6 70 34 C94 24 100 56 72 56 C90 76 64 96 52 72 C40 96 10 80 30 60 C2 60 8 26 32 36 C20 8 50 6 50 30 Z',
};
export const cookie = (shape, col, chips) => `<svg viewBox="0 0 100 100" overflow="visible"><path d="${SHAPES[shape]}" fill="${col}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
  ${chips ? '<circle cx="40" cy="44" r="5" fill="#5a3018"/><circle cx="60" cy="56" r="5" fill="#5a3018"/><circle cx="48" cy="64" r="4" fill="#5a3018"/>' : ''}</svg>`;

/** Muffin tin with six cups; cups[i]: 0 empty, 1 batter, 2 baked. viewBox 0 0 520 230 */
export const CUPS = [[100, 72], [260, 72], [420, 72], [100, 165], [260, 165], [420, 165]];
const CUP_COLS = ['#ff8fab', '#8fd3ff', '#ffd166', '#b4f0a8', '#c8a2ff', '#ffb38a'];
export function tin(cups, dots) {
  let s = `<svg viewBox="0 0 520 230" overflow="visible"><rect x="6" y="14" width="508" height="210" rx="36" fill="#c0c6d8" stroke="${O}" stroke-width="7"/>`;
  CUPS.forEach(([x, y], i) => {
    s += `<ellipse cx="${x}" cy="${y}" rx="62" ry="38" fill="${CUP_COLS[i]}" stroke="${O}" stroke-width="5"/>`;
    if (cups[i] === 1) s += `<ellipse cx="${x}" cy="${y + 2}" rx="48" ry="27" fill="#ecc890"/><circle cx="${x - 12}" cy="${y}" r="5" fill="${dots}"/><circle cx="${x + 14}" cy="${y + 6}" r="5" fill="${dots}"/>`;
    if (cups[i] === 2) s += `<path d="M${x - 58} ${y + 4} Q${x - 60} ${y - 66} ${x} ${y - 62} Q${x + 60} ${y - 66} ${x + 58} ${y + 4} Z" fill="#c98a4b" stroke="${O}" stroke-width="5"/>
      <circle cx="${x - 20}" cy="${y - 28}" r="7" fill="${dots}"/><circle cx="${x + 18}" cy="${y - 38}" r="7" fill="${dots}"/><circle cx="${x + 4}" cy="${y - 12}" r="6" fill="${dots}"/>`;
  });
  return s + '</svg>';
}
/** One muffin for the plate. viewBox 0 0 120 120 */
export const muffin = (i, dots) => `<svg viewBox="0 0 120 120" overflow="visible">
  <path d="M18 60 L30 114 L90 114 L102 60 Z" fill="${CUP_COLS[i % 6]}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M42 64 L46 112 M60 64 L60 112 M78 64 L74 112" stroke="${O}" stroke-width="3" opacity=".35"/>
  <path d="M10 64 Q4 16 60 12 Q116 16 110 64 Z" fill="#c98a4b" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="40" cy="38" r="7" fill="${dots}"/><circle cx="74" cy="30" r="7" fill="${dots}"/><circle cx="62" cy="50" r="6" fill="${dots}"/><circle cx="88" cy="50" r="5" fill="${dots}"/></svg>`;

/** Cracked egg halves + yolk. viewBox 0 0 160 160 */
export const EGG_CRACK = `<svg viewBox="0 0 160 160" overflow="visible">
  <g class="shell-l"><path d="M80 30 C40 30 30 90 40 110 L56 96 L64 110 L76 94 L80 104 Z" fill="#fff6e6" stroke="${O}" stroke-width="5" stroke-linejoin="round"/></g>
  <g class="shell-r"><path d="M80 30 C120 30 130 90 120 110 L106 98 L96 110 L86 96 L80 104 Z" fill="#fff6e6" stroke="${O}" stroke-width="5" stroke-linejoin="round"/></g>
  <g class="yolk"><ellipse cx="80" cy="112" rx="26" ry="12" fill="#fff" opacity=".85"/><circle cx="80" cy="110" r="13" fill="#ffc93c" stroke="${O}" stroke-width="3"/></g></svg>`;
