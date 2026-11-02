/* Fish for Akvariet, built from parts: body shape, tail, colour, pattern and eyes.
 * fishSVG(cfg) returns an <svg> facing right, viewBox -120 -90 240 180. The tail (.akv-tail) and side fin
 * (.akv-fin) are separate groups so CSS can wag them.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// body path, eye position, mouth tip x, dorsal fin, tail joint x
export const BODIES = {
  oval: { d: 'M-70 0 C-70 -30 -35 -44 0 -44 C40 -44 70 -24 70 0 C70 24 40 44 0 44 C-35 44 -70 30 -70 0Z',
    eye: [36, -12], mouth: 68, fin: 'M-28 -40 Q-2 -80 30 -41 Z', jx: -62 },
  round: { d: 'M-58 0 C-58 -40 -30 -56 2 -56 C40 -56 62 -30 62 0 C62 30 40 56 2 56 C-30 56 -58 40 -58 0Z',
    eye: [28, -16], mouth: 60, fin: 'M-26 -51 Q0 -88 28 -53 Z', jx: -52 },
  long: { d: 'M-88 0 C-88 -18 -52 -30 0 -30 C52 -30 90 -14 90 0 C90 14 52 30 0 30 C-52 30 -88 18 -88 0Z',
    eye: [58, -8], mouth: 88, fin: 'M-48 -27 Q-8 -64 40 -28 Z', jx: -80 },
  tall: { d: 'M-50 0 C-40 -32 -12 -62 10 -62 C42 -50 66 -20 66 0 C66 20 42 50 10 62 C-12 62 -40 32 -50 0Z',
    eye: [32, -12], mouth: 64, fin: 'M-6 -60 Q-30 -100 26 -56 Z', jx: -44 },
};
export const TAILS = {
  fan: jx => `M${jx + 8} 0 L${jx - 44} -38 Q${jx - 32} 0 ${jx - 44} 38 Z`,
  fork: jx => `M${jx + 8} 0 L${jx - 48} -42 L${jx - 28} 0 L${jx - 48} 42 Z`,
  round: jx => `M${jx + 8} -8 C${jx - 18} -44 ${jx - 60} -34 ${jx - 56} 0 C${jx - 60} 34 ${jx - 18} 44 ${jx + 8} 8 Z`,
  flowy: jx => `M${jx + 8} 0 C${jx - 18} -30 ${jx - 46} -66 ${jx - 72} -46 C${jx - 52} -22 ${jx - 56} 12 ${jx - 78} 40 C${jx - 46} 56 ${jx - 18} 26 ${jx + 8} 0 Z`,
};
// main, dark (fins), light (pattern)
export const COLOURS = [
  ['#ff8a00', '#e06a00', '#fff3d6'], ['#ff4d6d', '#d93355', '#ffe0e7'], ['#ffd23f', '#e8a917', '#fff8d6'],
  ['#3a86ff', '#2463cc', '#dcebff'], ['#06d6a0', '#05a57c', '#d8fff3'], ['#9b5de5', '#7a3ec4', '#efe2ff'],
];
export const PATTERNS = ['plain', 'stripes', 'spots', 'belly'];
export const EYES = ['normal', 'big', 'lashes', 'sleepy'];

let uid = 0;
export function fishSVG({ body = 'oval', tail = 'fan', colour = 0, pattern = 'plain', eyes = 'normal' }, extra = '') {
  const B = BODIES[body], [main, dark, light] = COLOURS[colour], id = 'akvc' + (++uid);
  const [ex, ey] = B.eye;
  let pat = '';
  if (pattern === 'stripes') pat = [-30, 0, 30].map(x => `<rect x="${x - 7}" y="-90" width="14" height="180" fill="${light}" ${ink(3)}/>`).join('');
  if (pattern === 'spots') pat = [[-38, -14, 9], [-14, 16, 11], [8, -22, 8], [-52, 18, 7], [14, 24, 7], [-20, -30, 6]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${light}"/>`).join('');
  if (pattern === 'belly') pat = `<path d="M-120 10 Q0 -2 120 10 V90 H-120 Z" fill="${light}"/>`;
  const eyeR = eyes === 'big' ? 16 : 11, pupR = eyes === 'big' ? 9 : 6;
  let eye = `<circle cx="${ex}" cy="${ey}" r="${eyeR}" fill="#fff" ${ink(3.5)}/>
    <circle class="akv-pupil" cx="${ex + 2}" cy="${ey + 1}" r="${pupR}" fill="${INK}"/><circle cx="${ex + 4}" cy="${ey - 2}" r="${pupR * 0.35}" fill="#fff"/>`;
  if (eyes === 'lashes') eye += [-50, -80, -110].map(a => { const r = a * Math.PI / 180;
    return `<path d="M${ex + 11 * Math.cos(r)} ${ey + 11 * Math.sin(r)} l${7 * Math.cos(r)} ${7 * Math.sin(r)}" ${ink(3)}/>`; }).join('');
  if (eyes === 'sleepy') eye = `<circle cx="${ex}" cy="${ey}" r="11" fill="#fff" ${ink(3.5)}/>
    <circle cx="${ex + 2}" cy="${ey + 3}" r="6" fill="${INK}"/>
    <path d="M${ex - 12} ${ey} A12 12 0 0 1 ${ex + 12} ${ey} Z" fill="${main}" ${ink(3.5)}/>`;
  return `<svg viewBox="-120 -90 240 180" class="akv-fishsvg" ${extra}>
    <defs><clipPath id="${id}"><path d="${B.d}"/></clipPath></defs>
    <g class="akv-tail"><path d="${TAILS[tail](B.jx)}" fill="${dark}" ${ink(4.5)}/></g>
    <path d="${B.fin}" fill="${dark}" ${ink(4.5)}/>
    <path d="${B.d}" fill="${main}"/>
    <g clip-path="url(#${id})">${pat}</g>
    <path d="${B.d}" fill="none" ${ink(5)}/>
    <path d="M${ex - 44} ${ey - 12} q10 -12 24 -13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    <g class="akv-fin"><path d="M${ex - 34} 12 q-26 4 -30 22 q20 2 30 -12 z" fill="${dark}" ${ink(3.5)}/></g>
    <circle cx="${ex + 4}" cy="${ey + 22}" r="7" fill="#ff8fab" opacity=".55"/>
    ${eye}
    <path d="M${B.mouth - 12} ${ey + 20} q6 6 10 0" fill="none" ${ink(3.5)}/>
  </svg>`;
}

// small seaweed and decorations, drawn in tank px by the game
export const WEED = (x, y, h, c, w = 26) => `<path class="akv-weed" d="M${x - w / 2} ${y} C${x - w * 1.6} ${y - h * 0.3} ${x + w * 0.6} ${y - h * 0.6} ${x - w * 0.2} ${y - h}
  C${x + w * 1.2} ${y - h * 0.62} ${x - w * 0.1} ${y - h * 0.3} ${x + w / 2} ${y} Z" fill="${c}" ${ink(3.5)} style="transform-origin:${x}px ${y}px"/>`;
export const CHEST = `<svg viewBox="-60 -70 120 80" class="akv-chestsvg">
  <rect x="-50" y="-34" width="100" height="40" rx="6" fill="#b5703c" ${ink(4.5)}/>
  <g class="akv-lid"><path d="M-52 -34 Q0 -66 52 -34 Z" fill="#c98446" ${ink(4.5)}/></g>
  <rect x="-8" y="-38" width="16" height="18" rx="3" fill="#ffd23f" ${ink(3.5)}/>
  <path d="M-50 -14 H50" ${ink(3)}/></svg>`;
