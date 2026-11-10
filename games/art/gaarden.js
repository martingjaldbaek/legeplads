/* Hand-drawn SVG page for Tryllemaling: the farm.
 * svg(line) returns the page either as a colouring-book outline (line = true: paper-filled shapes, hidden
 * things left out) or in full colour (line = false). Both share the same ink lines, so the painted
 * result looks like a printed picture. Coordinates are in a 1600×1000 box; vb is the viewBox to show (sky and
 * ground reach far beyond the box, so portrait screens can show more above and below).
 * hidden: surprises with no outline – x, y, radius in the same box.
 */
export const W = 1600, H = 1000;
const PAPER = '#fffaf0', INK = '#4a3b5c';

export const hidden = [
  { x: 230, y: 890, r: 150 },   // flowers
  { x: 650, y: 340, r: 90 },    // butterfly
  { x: 560, y: 120, r: 80 },    // bird
  { x: 1430, y: 905, r: 70 },   // ladybug
  { x: 1290, y: 340, r: 150 },  // apples in the tree
  { x: 560, y: 905, r: 70 },    // snail
];

export function svg(line, pxW, pxH, vb = '0 0 1600 1000') {
  const f = c => (line ? PAPER : c);
  const ink = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const only = s => (line ? '' : s);          // colour-only (no outline in the book)

  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a), p = Math.cos(a + 0.18), q = Math.sin(a + 0.18), m = Math.cos(a - 0.18), n = Math.sin(a - 0.18);
    return `<path d="M${820 + m * 100} ${150 + n * 100} L${820 + c * 150} ${150 + s * 150} L${820 + p * 100} ${150 + q * 100} Z" fill="${f('#ffb703')}" ${thin}/>`;
  }).join('');
  const cloud = (x, y, k) => `<g fill="#ffffff" opacity=".95">
    <circle cx="${x}" cy="${y}" r="${45 * k}"/><circle cx="${x + 55 * k}" cy="${y - 25 * k}" r="${55 * k}"/>
    <circle cx="${x + 115 * k}" cy="${y}" r="${45 * k}"/><rect x="${x}" y="${y}" width="${115 * k}" height="${45 * k}"/></g>`;
  const flower = (x, y, c) => `<g>
    <path d="M${x} ${y} Q ${x - 10} ${y + 50} ${x} ${y + 90}" fill="none" stroke="#3f9a3c" stroke-width="8" stroke-linecap="round"/>
    <path d="M${x} ${y + 55} Q ${x + 35} ${y + 30} ${x + 45} ${y + 50} Q ${x + 25} ${y + 70} ${x} ${y + 60} Z" fill="#5fbf4a" ${thin}/>
    ${[0, 72, 144, 216, 288].map(d => { const a = d * Math.PI / 180; return `<circle cx="${x + Math.cos(a) * 24}" cy="${y + Math.sin(a) * 24}" r="20" fill="${c}" ${thin}/>`; }).join('')}
    <circle cx="${x}" cy="${y}" r="15" fill="#ffd23f" ${thin}/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-500" x2="0" y2="660"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>
    <linearGradient id="grass" gradientUnits="userSpaceOnUse" x1="0" y1="620" x2="0" y2="1100"><stop offset="0" stop-color="#9be071"/><stop offset="1" stop-color="#57b043"/></linearGradient>
  </defs>
  <rect x="-1000" y="-1500" width="3600" height="4200" fill="${line ? PAPER : 'url(#sky)'}"/>
  ${only(cloud(200, 140, 1.1) + cloud(1080, 60, 0.8) + cloud(420, 50, 0.6))}

  <!-- sun -->
  <g>${rays}
    <circle cx="820" cy="150" r="95" fill="${f('#ffd93f')}" ${ink}/>
    <circle cx="788" cy="135" r="10" fill="${INK}"/><circle cx="852" cy="135" r="10" fill="${INK}"/>
    ${only('<circle cx="770" cy="172" r="14" fill="#ffa07a" opacity=".7"/><circle cx="870" cy="172" r="14" fill="#ffa07a" opacity=".7"/>')}
    <path d="M788 175 Q820 205 852 175" fill="none" ${ink}/></g>

  <!-- hills -->
  <path d="M-50 560 Q 300 470 650 540 T 1650 520 Q 2100 480 2600 520 V2700 H-1000 V560 Q -500 500 -50 560 Z" fill="${f('#b7e88f')}" ${ink}/>
  <path d="M-50 660 Q 450 590 900 655 T 1650 640 Q 2100 610 2600 640 V2700 H-1000 V660 Q -500 620 -50 660 Z" fill="${line ? PAPER : 'url(#grass)'}" ${ink}/>

  <!-- fence -->
  <g>
    <rect x="600" y="585" width="500" height="18" rx="6" fill="${f('#f2d7a8')}" ${thin}/>
    <rect x="600" y="625" width="500" height="18" rx="6" fill="${f('#f2d7a8')}" ${thin}/>
    ${[620, 700, 780, 860, 940, 1020, 1080].map(x => `<path d="M${x} 660 V570 L${x + 12} 552 L${x + 24} 570 V660 Z" fill="${f('#f6e2bd')}" ${thin}/>`).join('')}
  </g>

  <!-- house -->
  <g>
    <rect x="440" y="250" width="54" height="120" fill="${f('#b5523b')}" ${ink}/>
    <rect x="170" y="400" width="380" height="290" fill="${f('#ff9b71')}" ${ink}/>
    <path d="M125 415 L360 225 L595 415 Z" fill="${f('#d64541')}" ${ink}/>
    <circle cx="360" cy="335" r="34" fill="${f('#ffe08a')}" ${ink}/>
    <path d="M326 335 H394 M360 301 V369" ${thin} fill="none"/>
    <path d="M315 690 V585 Q 315 540 360 540 Q 405 540 405 585 V690 Z" fill="${f('#8d5524')}" ${ink}/>
    <circle cx="390" cy="620" r="7" fill="${INK}"/>
    ${[205, 435].map(x => `<rect x="${x}" y="460" width="85" height="75" rx="8" fill="${f('#bde8ff')}" ${ink}/>
      <path d="M${x + 42} 460 V535 M${x} 497 H${x + 85}" ${thin} fill="none"/>
      <rect x="${x - 8}" y="535" width="101" height="16" rx="5" fill="${f('#ffffff')}" ${thin}/>`).join('')}
  </g>

  <!-- tree -->
  <g>
    <path d="M1225 690 Q 1235 560 1215 440 L1300 440 Q 1285 560 1305 690 Z" fill="${f('#9c6b3f')}" ${ink}/>
    <path d="M1255 520 Q 1230 500 1225 470" fill="none" ${thin}/>
    <path d="M1080 420 C 1010 380 1030 270 1110 265 C 1120 175 1245 145 1290 205 C 1350 150 1465 195 1450 285
             C 1525 320 1515 425 1440 445 C 1410 490 1120 490 1080 420 Z" fill="${f('#5fbf4a')}" ${ink}/>
    <path d="M1150 330 Q 1170 300 1200 305 M1320 250 Q 1350 235 1375 250 M1360 380 Q 1385 360 1410 372" fill="none" ${thin}/>
  </g>

  <!-- dog -->
  <g>
    <path d="M700 770 Q 625 725 645 655 Q 668 645 680 662 Q 678 720 725 748 Z" fill="${f('#e8b878')}" ${ink}/>
    ${[715, 770, 875, 930].map(x => `<rect x="${x}" y="790" width="42" height="105" rx="18" fill="${f('#dfa86a')}" ${ink}/>`).join('')}
    <ellipse cx="820" cy="780" rx="150" ry="82" fill="${f('#e8b878')}" ${ink}/>
    <ellipse cx="770" cy="755" rx="50" ry="32" fill="${f('#a8673a')}" ${thin}/>
    <path d="M895 735 Q 940 765 985 742" fill="none" stroke="${f('#3a86ff')}" stroke-width="20" stroke-linecap="round"/>
    <circle cx="960" cy="680" r="80" fill="${f('#e8b878')}" ${ink}/>
    <ellipse cx="895" cy="690" rx="30" ry="62" transform="rotate(22 895 690)" fill="${f('#a8673a')}" ${ink}/>
    <ellipse cx="1025" cy="690" rx="30" ry="62" transform="rotate(-22 1025 690)" fill="${f('#a8673a')}" ${ink}/>
    <ellipse cx="962" cy="718" rx="40" ry="28" fill="${f('#fff0d8')}" ${thin}/>
    <ellipse cx="962" cy="702" rx="15" ry="11" fill="${INK}"/>
    <circle cx="932" cy="664" r="10" fill="${INK}"/><circle cx="990" cy="664" r="10" fill="${INK}"/>
    <circle cx="935" cy="660" r="3.5" fill="#fff"/><circle cx="993" cy="660" r="3.5" fill="#fff"/>
    <path d="M946 730 Q 962 744 978 730" fill="none" ${thin}/>
    <path d="M955 738 Q 962 765 970 738 Z" fill="${f('#ff7b9c')}" ${thin}/>
  </g>

  ${only(`
  <!-- hidden: flowers -->
  ${flower(120, 860, '#ff5d8f')}${flower(230, 905, '#8338ec')}${flower(340, 860, '#ff8a00')}
  <!-- hidden: butterfly -->
  <g transform="translate(10 40) rotate(-12 640 300)">
    <ellipse cx="600" cy="280" rx="45" ry="35" fill="#ff8fc7" ${thin}/><ellipse cx="680" cy="280" rx="45" ry="35" fill="#ff8fc7" ${thin}/>
    <ellipse cx="610" cy="330" rx="32" ry="25" fill="#c77dff" ${thin}/><ellipse cx="670" cy="330" rx="32" ry="25" fill="#c77dff" ${thin}/>
    <circle cx="600" cy="280" r="12" fill="#ffd23f"/><circle cx="680" cy="280" r="12" fill="#ffd23f"/>
    <ellipse cx="640" cy="305" rx="11" ry="48" fill="${INK}"/>
    <path d="M634 260 Q 620 230 605 228 M646 260 Q 660 230 675 228" fill="none" ${thin}/></g>
  <!-- hidden: bird -->
  <g transform="translate(-340 -45)">
    <ellipse cx="900" cy="165" rx="60" ry="40" fill="#3a86ff" ${thin}/>
    <path d="M880 160 Q 900 115 935 150 Z" fill="#74b0ff" ${thin}/>
    <path d="M955 158 L995 168 L955 178 Z" fill="#ff9f1c" ${thin}/>
    <circle cx="935" cy="152" r="7" fill="${INK}"/>
    <path d="M845 165 L815 145 L820 185 Z" fill="#3a86ff" ${thin}/></g>
  <!-- hidden: ladybug -->
  <g>
    <circle cx="1475" cy="905" r="22" fill="${INK}"/>
    <path d="M1380 925 A 50 50 0 0 1 1480 925 Z" fill="#ff3b4e" ${thin}/>
    <path d="M1430 875 V925" ${thin}/>
    <circle cx="1405" cy="905" r="8" fill="${INK}"/><circle cx="1455" cy="905" r="8" fill="${INK}"/><circle cx="1430" cy="890" r="6" fill="${INK}"/></g>
  <!-- hidden: apples -->
  ${[[1180, 330], [1330, 275], [1400, 390], [1245, 410], [1150, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#ff3b4e" ${thin}/><path d="M${x} ${y - 20} q 4 -12 12 -14" fill="none" ${thin}/>`).join('')}
  <!-- hidden: snail -->
  <g>
    <path d="M500 930 Q 500 905 530 905 H600 Q 625 905 625 930 Z" fill="#ffd6a5" ${thin}/>
    <circle cx="560" cy="890" r="38" fill="#c77d3a" ${thin}/>
    <path d="M560 890 m -22 0 a 22 22 0 1 0 22 -22 a 14 14 0 1 0 14 14" fill="none" ${thin}/>
    <path d="M612 905 L625 870 M598 905 L605 872" ${thin}/>
    <circle cx="625" cy="868" r="6" fill="${INK}"/><circle cx="605" cy="870" r="6" fill="${INK}"/></g>
  `)}
</svg>`;
}
