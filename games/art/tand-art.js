/* SVG art for Tandbørstning: animal heads with a big open mouth, dirt (food bits and cute bacteria),
 * and the tools (toothpaste tube, toothbrush, cup). Heads share one mouth geometry in a 400×400 box:
 * the cavity is the rounded rect x 70–330, y 165–335; upper teeth hang from y 165, lower teeth stand on y 335.
 */
export const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const MOUTH = { x: 70, y: 165, w: 260, h: 170, cx: 200, cy: 250 };
export const TEETH_X = [120, 160, 200, 240, 280];

const eyes = (x1, x2, y, r = 24, white = '#fff') => `<g class="tb-eyes">
  ${[x1, x2].map(x => `<circle cx="${x}" cy="${y}" r="${r}" fill="${white}" ${ink(5)}/>
  <circle cx="${x + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.5}" fill="${INK}"/>
  <circle cx="${x + r * 0.32}" cy="${y - r * 0.12}" r="${r * 0.18}" fill="#fff"/>`).join('')}</g>`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="20" fill="#ff8fab" opacity=".45"/><circle cx="${x2}" cy="${y}" r="20" fill="#ff8fab" opacity=".45"/>`;

function teeth(pointy) {
  const up = TEETH_X.map(c => pointy
    ? `<path d="M${c - 19} 168 L${c + 19} 168 L${c} 214 Z" fill="#fff" ${ink(4)}/>`
    : `<rect x="${c - 19}" y="160" width="38" height="46" rx="11" fill="#fff" ${ink(4)}/>`).join('');
  const lo = TEETH_X.map(c => pointy
    ? `<path d="M${c - 19} 332 L${c + 19} 332 L${c} 286 Z" fill="#fff" ${ink(4)}/>`
    : `<rect x="${c - 19}" y="294" width="38" height="46" rx="11" fill="#fff" ${ink(4)}/>`).join('');
  return `<g class="tb-teeth">${up}${lo}</g>`;
}

// The open mouth: cavity, tongue, teeth, and empty layers the game fills (water, dirt, foam, sparkles).
function mouth(pointy, lip) {
  const { x, y, w, h } = MOUTH;
  return `<g class="tb-closed"><path d="M95 245 Q200 330 305 245" fill="none" ${ink(8)}/>
      <path d="M86 238 Q80 250 92 256 M314 238 Q320 250 308 256" fill="none" ${ink(6)}/></g>
    <g class="tb-open">
      <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="76" fill="${lip}" ${ink(5)}/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="70" fill="#7a1f3d"/>
      <g clip-path="url(#tb-cav)">
        <ellipse cx="200" cy="335" rx="105" ry="62" fill="#ff7a9a" ${ink(4)}/>
        <path d="M200 290 V330" ${ink(3)} opacity=".4"/>
        <rect class="tb-water" x="${x}" y="${y + h}" width="${w}" height="0" fill="#7cc8ff" opacity=".8"/>
        <rect x="${x}" y="${y - 4}" width="${w}" height="16" fill="#ff8fab"/>
        <rect x="${x}" y="${y + h - 12}" width="${w}" height="16" fill="#ff8fab"/>
      </g>
      ${teeth(pointy)}
      <g class="tb-foam" clip-path="url(#tb-cav2)"></g>
      <g class="tb-dirt"></g>
      <g class="tb-spark"></g>
    </g>`;
}

const DEFS = `<defs>
  <clipPath id="tb-cav"><rect x="${MOUTH.x}" y="${MOUTH.y}" width="${MOUTH.w}" height="${MOUTH.h}" rx="70"/></clipPath>
  <clipPath id="tb-cav2"><ellipse cx="${MOUTH.cx}" cy="${MOUTH.cy}" rx="${MOUTH.w / 2 + 45}" ry="${MOUTH.h / 2 + 50}"/></clipPath>
</defs>`;

// [id, spoken name (definite form), svg]
export const ANIMALS = [
  ['krokodille', 'Krokodillen', `
    <circle cx="125" cy="92" r="55" fill="#5cb85c" ${ink(6)}/><circle cx="275" cy="92" r="55" fill="#5cb85c" ${ink(6)}/>
    <rect x="22" y="105" width="356" height="285" rx="100" fill="#5cb85c" ${ink(6)}/>
    <path d="M30 230 Q20 160 70 130" fill="none" stroke="#7fd07f" stroke-width="10" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="175" cy="138" rx="9" ry="6" fill="${INK}"/><ellipse cx="225" cy="138" rx="9" ry="6" fill="${INK}"/>
    ${[[60, 300], [340, 300], [55, 200], [345, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#3e8e41"/>`).join('')}
    ${eyes(125, 275, 85, 30, '#fff7a8')}
    ${mouth(true, '#3e8e41')}`],
  ['flodhest', 'Flodhesten', `
    <ellipse cx="85" cy="70" rx="32" ry="28" fill="#a99bd6" ${ink(6)}/><ellipse cx="315" cy="70" rx="32" ry="28" fill="#a99bd6" ${ink(6)}/>
    <ellipse cx="85" cy="72" rx="14" ry="12" fill="#ff9fbd"/><ellipse cx="315" cy="72" rx="14" ry="12" fill="#ff9fbd"/>
    <ellipse cx="200" cy="240" rx="192" ry="160" fill="#a99bd6" ${ink(6)}/>
    <ellipse cx="200" cy="130" rx="120" ry="40" fill="#bcb0e3"/>
    <ellipse cx="165" cy="132" rx="11" ry="8" fill="${INK}"/><ellipse cx="235" cy="132" rx="11" ry="8" fill="${INK}"/>
    ${eyes(130, 270, 95, 24)}
    ${cheeks(45, 355, 250)}
    ${mouth(false, '#8a7bc0')}`],
  ['loeve', 'Løven', `
    ${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `<circle cx="${200 + Math.cos(a) * 165}" cy="${225 + Math.sin(a) * 165}" r="50" fill="#e07b22" ${ink(6)}/>`; }).join('')}
    <circle cx="200" cy="225" r="168" fill="#e07b22"/>
    <circle cx="95" cy="85" r="32" fill="#ffc75f" ${ink(6)}/><circle cx="305" cy="85" r="32" fill="#ffc75f" ${ink(6)}/>
    <circle cx="200" cy="230" r="150" fill="#ffc75f" ${ink(6)}/>
    <path d="M182 140 H218 L200 156 Z" fill="${INK}" ${ink(4)}/>
    ${eyes(145, 255, 112, 22)}
    ${cheeks(75, 325, 220)}
    ${mouth(false, '#e9a23b')}`],
  ['haj', 'Hajen', `
    <path d="M200 8 L262 110 H138 Z" fill="#7fa7c9" ${ink(6)}/>
    <ellipse cx="200" cy="245" rx="190" ry="150" fill="#7fa7c9" ${ink(6)}/>
    <path d="M60 330 Q200 410 340 330 Q300 380 200 392 Q100 380 60 330 Z" fill="#e8f2fb"/>
    <path d="M30 200 Q40 220 30 240 M44 196 Q54 220 44 246 M370 200 Q360 220 370 240 M356 196 Q346 220 356 246" fill="none" ${ink(4)}/>
    ${eyes(110, 290, 135, 22)}
    ${cheeks(80, 320, 175)}
    ${mouth(true, '#5f88ad')}`],
  ['hund', 'Hunden', `
    <path d="M70 70 Q20 80 18 180 Q20 250 60 250 Q90 240 95 150 Z" fill="#8b5a2b" ${ink(6)}/>
    <path d="M330 70 Q380 80 382 180 Q380 250 340 250 Q310 240 305 150 Z" fill="#8b5a2b" ${ink(6)}/>
    <ellipse cx="200" cy="225" rx="165" ry="170" fill="#e0a96d" ${ink(6)}/>
    <ellipse cx="200" cy="270" rx="150" ry="110" fill="#f6dcb5"/>
    <ellipse cx="200" cy="138" rx="30" ry="20" fill="${INK}"/><ellipse cx="192" cy="132" rx="8" ry="5" fill="#fff" opacity=".6"/>
    ${eyes(140, 260, 100, 22)}
    ${cheeks(80, 320, 200)}
    ${mouth(false, '#c98a4b')}`],
];

export function head(i) {
  return `<svg viewBox="0 0 400 400" class="tb-svg">${DEFS}${ANIMALS[i][2]}</svg>`;
}

// Dirt: food bits and smiling bacteria, drawn around (0,0).
export const DIRT = {
  bakterie: c => `<circle r="17" fill="${c}" ${ink(3.5)}/>
    <circle cx="-14" cy="-12" r="4" fill="${c}" ${ink(2.5)}/><circle cx="15" cy="-11" r="4" fill="${c}" ${ink(2.5)}/>
    <circle cx="-6" cy="-3" r="3.2" fill="${INK}"/><circle cx="6" cy="-3" r="3.2" fill="${INK}"/>
    <path d="M-6 6 Q0 11 6 6" fill="none" ${ink(2.5)}/>`,
  krumme: () => `<path d="M-14 -8 L-2 -15 L13 -9 L15 6 L3 14 L-12 10 Z" fill="#c98a4b" ${ink(3)}/><circle cx="-3" cy="-2" r="2.5" fill="#8b5a2b"/>`,
  salat: () => `<path d="M-16 6 Q-14 -14 4 -16 Q16 -12 16 2 Q8 16 -16 6 Z" fill="#7ed957" ${ink(3)}/><path d="M-12 4 Q0 -2 10 -10" fill="none" stroke="#4a9e2f" stroke-width="2.5"/>`,
  baer: () => `<circle r="13" fill="#ff4d6d" ${ink(3)}/><circle cx="-4" cy="-3" r="1.8" fill="#ffe17a"/><circle cx="4" cy="2" r="1.8" fill="#ffe17a"/><circle cx="-1" cy="5" r="1.8" fill="#ffe17a"/>`,
  ost: () => `<path d="M-15 10 L15 10 L15 -4 L-15 -12 Z" fill="#ffd23f" ${ink(3)}/><circle cx="2" cy="2" r="3" fill="#e6a417"/>`,
};
export const BACT_COLORS = ['#7ed957', '#a78bfa', '#5ad1c6', '#ffb347'];

// Tools. Each: [svg, tip as fraction of the box (where it works), aspect w/h]
export const BRUSH = `<svg viewBox="0 -24 300 104" class="tb-tool-svg">
  <rect x="90" y="30" width="205" height="24" rx="12" fill="#3a86ff" ${ink(5)}/>
  <rect x="200" y="36" width="70" height="10" rx="5" fill="#fff" opacity=".45"/>
  <rect x="12" y="28" width="96" height="28" rx="12" fill="#3a86ff" ${ink(5)}/>
  <rect x="18" y="2" width="84" height="28" rx="5" fill="#e8fbff" ${ink(4)}/>
  <path d="M32 4 V28 M46 4 V28 M60 4 V28 M74 4 V28 M88 4 V28" stroke="#9be7ff" stroke-width="5"/>
  <g class="tb-paste"><path d="M14 2 Q20 -22 36 -8 Q46 -24 60 -8 Q74 -24 86 -8 Q98 -20 104 2 Z" fill="#fff" ${ink(4)}/>
    <path d="M26 -4 Q44 -14 60 -6 Q78 -14 96 -4" fill="none" stroke="#7cc8ff" stroke-width="5" stroke-linecap="round"/></g>
</svg>`;
export const BRUSH_TIP = [60 / 300, (16 + 24) / 104];

export const TUBE = `<svg viewBox="-30 0 260 110" class="tb-tool-svg">
  <g class="tb-tube-body">
    <path d="M40 22 H190 L214 14 V96 L190 88 H40 Q28 88 28 76 V34 Q28 22 40 22 Z" fill="#fff" ${ink(5)}/>
    <path d="M70 22 V88 M150 22 V88" stroke="#ff4d6d" stroke-width="12"/>
    <path d="M110 22 V88" stroke="#7cc8ff" stroke-width="12"/>
    <path d="M190 22 V88" ${ink(4)}/>
  </g>
  <rect x="-2" y="34" width="32" height="42" rx="8" fill="#ff4d6d" ${ink(5)}/>
  <g class="tb-blob"><path d="M-6 55 Q-30 30 -26 55 Q-30 80 -6 55 Z" fill="#fff" ${ink(3)}/></g>
</svg>`;

export const CUP = `<svg viewBox="0 0 140 160" class="tb-tool-svg">
  <path d="M100 52 Q134 52 134 82 Q134 112 100 112" fill="none" ${ink(14)}/>
  <path d="M100 52 Q134 52 134 82 Q134 112 100 112" fill="none" stroke="#ffd23f" stroke-width="6"/>
  <path d="M10 20 H118 L106 146 Q105 154 96 154 H32 Q23 154 22 146 Z" fill="#ffd23f" ${ink(6)}/>
  <path d="M16 46 H112 L106 120 H22 Z" fill="#7cc8ff" opacity=".85"/>
  <path d="M34 34 Q30 90 38 136" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
</svg>`;
export const CUP_TIP = [12 / 140, 22 / 160];

export const SPARK = `<path d="M0 -16 Q3 -3 16 0 Q3 3 0 16 Q-3 3 -16 0 Q-3 -3 0 -16 Z" fill="#fff8b0" stroke="#ffd23f" stroke-width="2.5"/>`;
