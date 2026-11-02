/* SVG art for Bilvask: side-view vehicles with faces (they face right and drive off to the right), tools and a petrol pump.
 * Every vehicle lives in a 500×320 box with the ground at y = 292. Wheels are drawn separately by the game
 * (wheel(r)) so they can spin, go flat and be swapped.
 */
export const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const GLASS = '#bfe6ff';

const face = (x1, x2, y, mx, my, r = 11) => `
  <g class="bv-eyes">${[x1, x2].map(x => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${ink(3.5)}/><circle cx="${x + 2}" cy="${y + 1}" r="${r * 0.55}" fill="${INK}"/><circle cx="${x + 4}" cy="${y - 2}" r="${r * 0.2}" fill="#fff"/>`).join('')}</g>
  <path class="m-closed" d="M${mx - 20} ${my} Q${mx} ${my + 18} ${mx + 20} ${my}" fill="none" ${ink(5)}/>
  <path class="m-open" d="M${mx - 22} ${my - 2} Q${mx} ${my + 30} ${mx + 22} ${my - 2} Z" fill="#a8324a" ${ink(4)}/>`;

// [id, spoken name, body svg, wheels [x, y, r], fuel cap [x, y], mud areas [x, y, w, h], horn Hz]
export const VEHICLES = [
  ['bil', 'Bilen', `
    <path d="M30 190 Q30 150 70 148 L150 146 L190 86 Q196 78 210 78 H330 Q345 78 352 88 L395 146 L450 150 Q478 154 478 190 V232 Q478 250 460 250 H48 Q30 250 30 232 Z" fill="#ff4d6d" ${ink(6)}/>
    <path d="M168 146 L200 96 H262 V146 Z" fill="${GLASS}" ${ink(5)}/>
    <path d="M276 146 V96 H326 Q334 96 338 102 L372 146 Z" fill="${GLASS}" ${ink(5)}/>
    <path d="M60 165 H440" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>
    <path d="M268 150 V238" ${ink(4)}/><rect x="236" y="168" width="22" height="8" rx="4" fill="${INK}"/>
    <circle cx="466" cy="180" r="11" fill="#ffe17a" ${ink(4)}/>
    <rect x="30" y="168" width="14" height="22" rx="4" fill="#ff8a00" ${ink(4)}/>
    ${face(302, 336, 124, 438, 214)}`,
    [[130, 250, 42], [380, 250, 42]], [78, 172], [[40, 152, 420, 88], [180, 92, 180, 50]], 520],
  ['lastbil', 'Lastbilen', `
    <rect x="20" y="236" width="460" height="22" rx="8" fill="${INK}"/>
    <rect x="20" y="50" width="290" height="190" rx="14" fill="#ffb703" ${ink(6)}/>
    <path d="M40 80 H290 M40 210 H290" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".5"/>
    <path d="M318 240 V90 Q318 70 338 70 H410 Q430 70 440 90 L470 150 Q480 160 480 180 V240 Z" fill="#3a86ff" ${ink(6)}/>
    <path d="M336 150 V92 H405 Q414 92 420 102 L448 150 Z" fill="${GLASS}" ${ink(5)}/>
    <circle cx="470" cy="196" r="10" fill="#ffe17a" ${ink(4)}/>
    ${face(370, 408, 122, 445, 214)}`,
    [[100, 252, 40], [196, 252, 40], [400, 252, 40]], [348, 214], [[25, 58, 280, 175], [322, 160, 150, 75]], 330],
  ['bus', 'Bussen', `
    <rect x="20" y="50" width="460" height="200" rx="30" fill="#ffc83d" ${ink(6)}/>
    <rect x="22" y="172" width="456" height="16" fill="#ff8a00"/>
    ${[48, 128, 208].map(x => `<rect x="${x}" y="74" width="64" height="62" rx="10" fill="${GLASS}" ${ink(5)}/>`).join('')}
    <rect x="296" y="74" width="44" height="166" rx="8" fill="${GLASS}" ${ink(5)}/><path d="M318 74 V240" ${ink(4)}/>
    <rect x="356" y="70" width="110" height="92" rx="14" fill="${GLASS}" ${ink(5)}/>
    <circle cx="468" cy="214" r="10" fill="#ffe17a" ${ink(4)}/>
    ${face(392, 432, 110, 444, 194)}`,
    [[110, 250, 42], [390, 250, 42]], [58, 214], [[26, 140, 450, 105], [26, 56, 260, 18]], 440],
  ['traktor', 'Traktoren', `
    <path d="M220 120 H430 Q462 120 462 152 V215 H220 Z" fill="#43aa50" ${ink(6)}/>
    <path d="M444 140 V200 M432 140 V200" stroke="#2f7d3a" stroke-width="5" stroke-linecap="round"/>
    <rect x="360" y="58" width="16" height="64" rx="4" fill="#8a94a6" ${ink(4)}/>
    <path d="M80 215 V42 Q80 28 94 28 H230 Q244 28 244 42 V215 Z" fill="#43aa50" ${ink(6)}/>
    <rect x="100" y="46" width="126" height="92" rx="12" fill="${GLASS}" ${ink(5)}/>
    <path d="M56 214 Q60 100 150 100 Q240 100 246 214" fill="none" stroke="#2f7d3a" stroke-width="16" stroke-linecap="round"/>
    <circle cx="456" cy="146" r="9" fill="#ffe17a" ${ink(4)}/>
    ${face(146, 186, 88, 420, 186)}`,
    [[150, 207, 85], [390, 250, 42]], [300, 128], [[88, 36, 150, 170], [226, 126, 232, 84]], 260],
];

export function wheel(r, hub = '#cfd6e0') {
  const bolts = [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return `<circle cx="${Math.cos(a) * r * 0.32}" cy="${Math.sin(a) * r * 0.32}" r="${r * 0.07}" fill="${INK}"/>`; }).join('');
  return `<g class="bv-spin"><circle r="${r}" fill="#3d3550" ${ink(5)}/><circle r="${r * 0.8}" fill="none" stroke="#5a5070" stroke-width="${r * 0.08}" stroke-dasharray="${r * 0.15} ${r * 0.12}"/>
    <circle r="${r * 0.52}" fill="${hub}" ${ink(4)}/>${bolts}<circle r="${r * 0.12}" fill="#8a94a6" ${ink(2.5)}/></g>`;
}

export const MUD = ['#7a4a1f', '#8b5a2b', '#6b3f1a', '#94632f'];
export function blob(r, c) {
  const n = 9, pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, rr = r * (0.7 + Math.random() * 0.45);
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[(i + 1) % n], q = pts[i];
    d += ` Q${(q[0] * 1.15).toFixed(1)} ${(q[1] * 1.15).toFixed(1)} ${((p[0] + q[0]) / 2 * 1.1).toFixed(1)} ${((p[1] + q[1]) / 2 * 1.1).toFixed(1)}`;
  }
  return `<path d="${d} Z" fill="${c}"/><circle cx="${r * 0.2}" cy="${r * 0.9}" r="${r * 0.18}" fill="${c}"/>`;
}

// Tools (the game positions them so that TIP – as a fraction of the box – sits under the finger)
export const SPONGE = `<svg viewBox="0 0 160 110" class="bv-tool-svg">
  <rect x="10" y="20" width="140" height="80" rx="24" fill="#ffd23f" ${ink(6)}/>
  ${[[40, 50], [80, 70], [115, 45], [60, 82], [120, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#e6a417"/>`).join('')}
  <path d="M14 34 Q40 4 70 22 Q96 2 120 22 Q148 8 148 36" fill="#fff" ${ink(4)}/>
</svg>`;
export const SPONGE_TIP = [0.5, 0.55];

export const HOSE = `<svg viewBox="0 0 170 130" class="bv-tool-svg">
  <path d="M160 120 Q130 128 112 104" fill="none" stroke="#2ec4b6" stroke-width="16" stroke-linecap="round"/>
  <path d="M90 50 L120 110 Q122 118 112 118 H100 Q94 118 92 112 L70 62 Z" fill="#ff4d6d" ${ink(5)}/>
  <rect x="8" y="34" width="112" height="34" rx="12" fill="#ff8a00" ${ink(5)}/>
  <rect x="0" y="40" width="18" height="22" rx="5" fill="#ffd23f" ${ink(4)}/>
  <path d="M84 70 Q80 90 92 96" fill="none" ${ink(5)}/>
</svg>`;
export const HOSE_TIP = [0.02, 0.4];

export const TOWEL = `<svg viewBox="0 0 160 120" class="bv-tool-svg">
  <path d="M14 18 Q80 4 146 18 L140 104 Q80 118 20 104 Z" fill="#ff8fab" ${ink(6)}/>
  ${[44, 74, 104].map(x => `<path d="M${x} 12 L${x - 2} 110" stroke="#fff" stroke-width="9" opacity=".7"/>`).join('')}
  <path d="M20 90 Q80 102 140 90" fill="none" stroke="#ff4d6d" stroke-width="6"/>
</svg>`;
export const TOWEL_TIP = [0.5, 0.5];

export const NOZZLE = `<svg viewBox="0 0 150 110" class="bv-tool-svg">
  <path d="M60 30 H120 Q140 30 140 50 V96 Q140 104 132 104 H108 Q100 104 100 96 V60 H60 Z" fill="#3a86ff" ${ink(5)}/>
  <path d="M84 60 Q84 86 102 88" fill="none" ${ink(5)}/>
  <rect x="4" y="34" width="66" height="20" rx="6" fill="#8a94a6" ${ink(5)}/>
</svg>`;
export const NOZZLE_TIP = [0.04, 0.4];
export const NOZZLE_HOSE = [0.9, 0.95];   // where the hose attaches

export const PUMP = `<svg viewBox="0 0 160 300" class="bv-pump-svg">
  <rect x="20" y="20" width="120" height="270" rx="18" fill="#ff4d6d" ${ink(6)}/>
  <rect x="10" y="276" width="140" height="18" rx="6" fill="#8a94a6" ${ink(5)}/>
  <rect x="38" y="44" width="84" height="64" rx="10" fill="#fff" ${ink(5)}/>
  <rect class="bv-gauge" x="46" y="52" width="0" height="48" rx="6" fill="#06d6a0"/>
  <path d="M60 140 h40 v40 h-40 z M68 140 v-10 h24 v10" fill="#ffd23f" ${ink(5)}/>
  <circle cx="80" cy="230" r="16" fill="#ffd23f" ${ink(5)}/>
  <rect x="134" y="120" width="22" height="50" rx="6" fill="#3d3550" ${ink(4)}/>
</svg>`;

export const NEW_TYRE = r => `<svg viewBox="${-r - 6} ${-r - 6} ${2 * r + 12} ${2 * r + 12}" class="bv-tool-svg">${wheel(r, '#ffd23f')}</svg>`;

export const HORN = `<svg viewBox="0 0 120 120" class="bv-tool-svg">
  <circle cx="60" cy="60" r="54" fill="#ff4d6d" ${ink(6)}/>
  <circle cx="60" cy="60" r="38" fill="#ff7b93" ${ink(4)}/>
  <path d="M38 52 L52 52 L72 38 V82 L52 68 L38 68 Z" fill="#fff" ${ink(4)}/>
  <path d="M80 48 Q88 60 80 72 M88 40 Q102 60 88 80" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export const SPARK = `<path d="M0 -16 Q3 -3 16 0 Q3 3 0 16 Q-3 3 -16 0 Q-3 -3 0 -16 Z" fill="#fff8b0" stroke="#ffd23f" stroke-width="2.5"/>`;
