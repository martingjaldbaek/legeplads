/* SVG art for Byggepladsen: a digger, a tipper truck, a tower crane with building floors, and a cement mixer.
 * All in the same outlined style as instrumenter-art.js. Scenes use a 1400×1000 box with the ground at y = 860.
 */
export const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// a face for a cab window, centred on (x, y)
export const face = (x, y, k = 1) => `
  <g class="bp-eyes"><circle cx="${x - 16 * k}" cy="${y}" r="${6 * k}" fill="${INK}"/><circle cx="${x + 16 * k}" cy="${y}" r="${6 * k}" fill="${INK}"/>
  <circle cx="${x - 14 * k}" cy="${y - 2 * k}" r="${2 * k}" fill="#fff"/><circle cx="${x + 18 * k}" cy="${y - 2 * k}" r="${2 * k}" fill="#fff"/></g>
  <circle cx="${x - 28 * k}" cy="${y + 12 * k}" r="${6 * k}" fill="#ff8fab" opacity=".55"/><circle cx="${x + 28 * k}" cy="${y + 12 * k}" r="${6 * k}" fill="#ff8fab" opacity=".55"/>
  <path class="bp-smile" d="M${x - 10 * k} ${y + 12 * k} Q${x} ${y + 21 * k} ${x + 10 * k} ${y + 12 * k}" fill="none" ${ink(4 * k)}/>
  <ellipse class="bp-oh" cx="${x}" cy="${y + 16 * k}" rx="${8 * k}" ry="${10 * k}" fill="#a8324a" ${ink(3 * k)}/>`;

export const SKY = `
  <rect x="-3000" y="-3000" width="7400" height="3860" fill="url(#bp-sky)"/>
  <rect x="-3000" y="860" width="7400" height="3000" fill="#c9a26b"/>
  <rect x="-3000" y="860" width="7400" height="16" fill="#b48a55"/>
  <circle cx="110" cy="110" r="60" fill="#ffd23f" opacity=".9"/>`;
export const DEFS = `<defs>
  <linearGradient id="bp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#e3f5ff"/></linearGradient>
  <pattern id="bp-stripes" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
    <rect width="80" height="80" fill="#ff8a00"/><rect width="40" height="80" fill="#ffffff"/></pattern>
</defs>`;

/* ---------- digger (static part), boom pivot at (620, 690) ---------- */
export const DIGGER_BASE = `
  <ellipse cx="560" cy="866" rx="170" ry="14" fill="rgba(0,0,0,.15)"/>
  <rect x="400" y="790" width="320" height="72" rx="36" fill="#5b5b6e" ${ink(6)}/>
  ${[440, 505, 570, 635, 690].map(x => `<circle cx="${x === 690 ? 682 : x}" cy="826" r="20" fill="#9a9ab0" ${ink(5)}/>`).join('')}
  <rect x="420" y="720" width="290" height="80" rx="14" fill="#ffc400" ${ink(6)}/>
  <rect x="404" y="700" width="60" height="70" rx="12" fill="#e6a417" ${ink(6)}/>
  <rect x="455" y="560" width="160" height="175" rx="22" fill="#ffc400" ${ink(6)}/>
  <rect x="475" y="580" width="120" height="95" rx="14" fill="#bfe6ff" ${ink(5)}/>
  ${face(535, 620, 1.05)}
  <path d="M482 588 L500 588 L484 640" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>
  <rect x="630" y="660" width="28" height="70" rx="8" fill="#e6a417" ${ink(5)}/>`;
export const BOOM = L => `
  <path d="M-26 -26 L${L} -18 Q${L + 26} 0 ${L} 18 L-26 26 Q-44 0 -26 -26 Z" fill="#ffb703" ${ink(6)}/>
  <path d="M30 -8 L${L - 40} -6" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".5"/>
  <circle cx="0" cy="0" r="14" fill="#9a9ab0" ${ink(5)}/>`;
export const STICK = L => `
  <path d="M-18 -18 L${L} -12 Q${L + 18} 0 ${L} 12 L-18 18 Q-32 0 -18 -18 Z" fill="#ffc400" ${ink(6)}/>
  <circle cx="0" cy="0" r="12" fill="#9a9ab0" ${ink(5)}/>`;
// the bucket hangs from its pivot (0,0); opening faces up-right before rotation; teeth at (78, 88)
export const BUCKET = `
  <path d="M-6 -14 L70 4 L84 86 L30 104 Q-30 108 -34 60 Z" fill="#9a9ab0" ${ink(6)}/>
  <g class="bp-load"><path d="M-2 -10 Q30 -40 72 6 Z" fill="#e0b46a" ${ink(4)}/>
    <circle cx="20" cy="-14" r="10" fill="#d9a65a"/><circle cx="44" cy="-10" r="8" fill="#d9a65a"/></g>
  <path d="M70 4 L84 86" ${ink(6)}/>
  <path d="M84 86 l14 -6 l-6 14 l14 -4 l-8 14" fill="#cfcfe0" ${ink(4)}/>
  <circle cx="0" cy="0" r="12" fill="#9a9ab0" ${ink(5)}/>`;

/* ---------- tipper truck, local coordinates: ground at y = 0, box from x 0 to 290 ---------- */
export const TRUCK = color => `
  <ellipse cx="220" cy="6" rx="240" ry="12" fill="rgba(0,0,0,.15)"/>
  <rect x="-10" y="-110" width="460" height="40" rx="12" fill="#5b5b6e" ${ink(6)}/>
  <g class="bp-box">
    <path d="M0 -200 L290 -200 L280 -100 L10 -100 Z" fill="${color}" ${ink(6)}/>
    <g class="bp-heap"><path d="M14 -200 Q140 -300 276 -200 Z" fill="#e0b46a" ${ink(5)}/></g>
    <path d="M0 -200 L290 -200" ${ink(8)}/>
    <path d="M40 -180 L50 -118 M110 -180 L114 -118 M180 -180 L176 -118 M250 -180 L240 -118" stroke="rgba(0,0,0,.18)" stroke-width="7" stroke-linecap="round"/>
  </g>
  <path d="M300 -100 L300 -210 Q300 -230 320 -230 L390 -230 Q420 -230 432 -190 L446 -130 L446 -100 Z" fill="${color}" ${ink(6)}/>
  <path d="M318 -212 L386 -212 Q404 -212 412 -186 L420 -150 L318 -150 Z" fill="#bfe6ff" ${ink(5)}/>
  ${face(370, -186, 0.85)}
  <rect x="430" y="-130" width="22" height="18" rx="5" fill="#ffd23f" ${ink(4)}/>
  ${[70, 210, 380].map(x => `<g class="bp-wheel" transform="translate(${x} -38)"><circle r="38" fill="#3d3a4a" ${ink(6)}/><circle r="16" fill="#cfcfe0" ${ink(4)}/>
    <path d="M0 -16 V16 M-16 0 H16" stroke="${INK}" stroke-width="3"/></g>`).join('')}`;

/* ---------- tower crane: mast at x 1180–1240, jib at y 130–170 ---------- */
const lattice = (x1, y1, x2, y2, n, vertical) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    if (vertical) { const a = y1 + (y2 - y1) * i / n, b = y1 + (y2 - y1) * (i + 1) / n; d += `M${x1} ${a} L${x2} ${b} `; }
    else { const a = x1 + (x2 - x1) * i / n, b = x1 + (x2 - x1) * (i + 1) / n; d += `M${a} ${y2} L${b} ${y1} `; }
  }
  return `<path d="${d}" stroke="${INK}" stroke-width="5" fill="none"/>`;
};
export const CRANE = `
  <rect x="1150" y="830" width="120" height="34" rx="6" fill="#9a9ab0" ${ink(6)}/>
  <rect x="1180" y="170" width="60" height="665" fill="#ffc400" ${ink(6)}/>
  ${lattice(1180, 170, 1240, 835, 14, true)}
  <rect x="270" y="130" width="1110" height="40" fill="#ffc400" ${ink(6)}/>
  ${lattice(270, 130, 1380, 170, 28, false)}
  <path d="M1210 130 L1210 40 L1215 40 L300 130 M1215 40 L1370 130" fill="none" ${ink(5)}/>
  <rect x="1300" y="170" width="80" height="90" rx="8" fill="#9a9ab0" ${ink(6)}/>
  <rect x="1236" y="175" width="100" height="85" rx="14" fill="#ff4d6d" ${ink(6)}/>
  <rect x="1250" y="186" width="72" height="44" rx="10" fill="#bfe6ff" ${ink(5)}/>
  ${face(1286, 204, 0.7)}`;
export const TROLLEY = `<rect x="-34" y="-6" width="68" height="28" rx="6" fill="#5b5b6e" ${ink(5)}/>
  <circle cx="-18" cy="-6" r="8" fill="#cfcfe0" ${ink(4)}/><circle cx="18" cy="-6" r="8" fill="#cfcfe0" ${ink(4)}/>`;
// hook block: (0,0) is where the cable attaches, the hook's catch point is at (0, 70)
export const HOOK = `<rect x="-26" y="0" width="52" height="40" rx="10" fill="#ffd23f" ${ink(5)}/>
  <path d="M0 40 V58 Q0 82 -18 76 Q-30 70 -24 60" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <path d="M0 40 V58 Q0 82 -18 76 Q-30 70 -24 60" fill="none" stroke="#9a9ab0" stroke-width="4" stroke-linecap="round"/>`;
// a building floor: 260 wide, 80 tall, bottom centre at (0, 0); chains meet at (0, -70)
export const FLOOR = (color, people) => `
  <rect x="-130" y="-80" width="260" height="80" rx="8" fill="${color}" ${ink(6)}/>
  ${[-80, 0, 80].map((x, i) => `<rect x="${x - 26}" y="-62" width="52" height="44" rx="6" fill="#bfe6ff" ${ink(4)}/>
    ${people ? `<g class="bp-person" style="animation-delay:${i * 0.25}s"><circle cx="${x}" cy="-32" r="12" fill="${['#ffd9b8', '#c98d5e', '#f1c08f'][i]}" ${ink(3)}/>
    <circle cx="${x - 4}" cy="-34" r="2" fill="${INK}"/><circle cx="${x + 4}" cy="-34" r="2" fill="${INK}"/></g>` : ''}`).join('')}
  <path d="M-120 -76 H120" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>`;
export const CHAINS = `<path d="M-110 -80 L0 -150 L110 -80" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="10 6"/>`;
export const ROOF = `<path d="M-160 0 L0 -120 L160 0 Z" fill="#ff4d6d" ${ink(6)}/>
  <rect x="60" y="-100" width="34" height="60" fill="#c98d5e" ${ink(5)}/>
  <path d="M0 -120 V-200" ${ink(5)}/><path class="bp-flag" d="M0 -200 L60 -186 L0 -170 Z" fill="#06d6a0" ${ink(4)}/>`;

/* ---------- cement mixer truck, local: ground y = 0, chute end at (-70, -96) ---------- */
export const MIXER = `
  <ellipse cx="300" cy="6" rx="330" ry="14" fill="rgba(0,0,0,.15)"/>
  <rect x="-10" y="-120" width="640" height="44" rx="12" fill="#5b5b6e" ${ink(6)}/>
  <path d="M120 -120 L150 -160 L330 -160 L360 -120" fill="#9a9ab0" ${ink(5)}/>
  <g class="bp-drum">
    <clipPath id="bp-drumclip"><path d="M40 -170 C40 -310 380 -350 440 -240 C470 -180 420 -120 300 -118 C180 -116 40 -110 40 -170 Z"/></clipPath>
    <g clip-path="url(#bp-drumclip)"><rect class="bp-drumstripes" x="-200" y="-400" width="900" height="400" fill="url(#bp-stripes)"/></g>
    <path d="M40 -170 C40 -310 380 -350 440 -240 C470 -180 420 -120 300 -118 C180 -116 40 -110 40 -170 Z" fill="none" ${ink(7)}/>
    <ellipse cx="44" cy="-176" rx="20" ry="46" fill="#9a9ab0" ${ink(6)}/>
  </g>
  <path d="M30 -150 L-70 -110 L-64 -92 L36 -128 Z" fill="#cfcfe0" ${ink(5)}/>
  <path d="M470 -76 L470 -250 Q470 -270 490 -270 L560 -270 Q600 -270 612 -220 L626 -150 L626 -76 Z" fill="#3a86ff" ${ink(6)}/>
  <path d="M488 -252 L556 -252 Q580 -252 590 -220 L598 -180 L488 -180 Z" fill="#bfe6ff" ${ink(5)}/>
  ${face(540, -222, 0.85)}
  <rect x="610" y="-120" width="22" height="18" rx="5" fill="#ffd23f" ${ink(4)}/>
  ${[70, 200, 520].map(x => `<g class="bp-wheel" transform="translate(${x} -38)"><circle r="38" fill="#3d3a4a" ${ink(6)}/><circle r="16" fill="#cfcfe0" ${ink(4)}/>
    <path d="M0 -16 V16 M-16 0 H16" stroke="${INK}" stroke-width="3"/></g>`).join('')}`;

/* ---------- small icons for the station buttons ---------- */
export const ICONS = [
  `<svg viewBox="380 520 560 360">${DIGGER_BASE}<g transform="translate(620 690) rotate(-35)">${BOOM(230)}</g></svg>`,
  `<svg viewBox="250 0 1150 900"><g>${CRANE}</g><g transform="translate(700 860)">${FLOOR('#3a86ff')}</g></svg>`,
  `<svg viewBox="-90 -360 740 380">${MIXER.replace('bp-drumclip', 'bp-drumclip-i').replace('url(#bp-drumclip)', 'url(#bp-drumclip-i)')}</svg>`,
];
