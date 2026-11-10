/* Hand-drawn SVG page for Tryllemaling: the jungle. Same format as gaarden.js / havet.js. */
export const W = 1600, H = 1000;
const PAPER = '#fffaf0', INK = '#4a3b5c';

export const hidden = [
  { x: 300, y: 300, r: 95 },    // monkey in the palm
  { x: 1450, y: 300, r: 85 },   // parrot in the tree
  { x: 790, y: 915, r: 120 },   // snake
  { x: 1340, y: 430, r: 70 },   // bananas
  { x: 760, y: 290, r: 85 },    // butterfly
  { x: 1490, y: 890, r: 80 },   // frog
];

export function svg(line, pxW, pxH, vb = '0 0 1600 1000') {
  const f = c => (line ? PAPER : c);
  const ink = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const only = s => (line ? '' : s);
  const eye = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  const cheek = (x, y) => only(`<circle cx="${x}" cy="${y}" r="14" fill="#ff8fab" opacity=".55"/>`);
  const frond = (a, len) => {
    const c = Math.cos(a), s = Math.sin(a), ex = 200 + c * len, ey = 190 + s * len, nx = -s * 70, ny = c * 70;
    return `<path d="M200 190 Q ${200 + c * len * 0.5 + nx} ${190 + s * len * 0.5 + ny} ${ex} ${ey} Q ${200 + c * len * 0.5 - nx * 0.6} ${190 + s * len * 0.5 - ny * 0.6} 200 190 Z" fill="${f('#3fae4a')}" ${ink}/>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-500" x2="0" y2="600"><stop offset="0" stop-color="#9fe3b4"/><stop offset="1" stop-color="#f0fff4"/></linearGradient>
    <linearGradient id="grass" gradientUnits="userSpaceOnUse" x1="0" y1="700" x2="0" y2="1300"><stop offset="0" stop-color="#6fcf5a"/><stop offset="1" stop-color="#2f8f3d"/></linearGradient>
  </defs>
  <rect x="-1000" y="-1500" width="3600" height="4200" fill="${line ? PAPER : 'url(#sky)'}"/>
  ${only(`<g fill="#ffffff" opacity=".9"><circle cx="560" cy="90" r="40"/><circle cx="615" cy="65" r="52"/><circle cx="675" cy="90" r="40"/><rect x="560" y="90" width="115" height="40"/>
    <circle cx="1000" cy="150" r="30"/><circle cx="1040" cy="132" r="38"/><circle cx="1085" cy="150" r="30"/><rect x="1000" y="150" width="85" height="30"/></g>`)}

  <!-- far bushes and ground -->
  <path d="M-1000 560 Q -600 470 -300 540 Q -100 460 100 540 Q 300 470 500 545 Q 700 480 900 540 Q 1100 470 1300 545 Q 1500 470 1700 540 Q 2100 470 2600 540 V2700 H-1000 Z" fill="${f('#a6e08f')}" ${ink}/>
  <path d="M-1000 720 Q 400 650 900 710 T 2600 700 V2700 H-1000 Z" fill="${line ? PAPER : 'url(#grass)'}" ${ink}/>

  <!-- palm tree -->
  <g>
    <path d="M175 760 Q 150 500 190 190 L222 192 Q 200 500 240 760 Z" fill="${f('#c08a50')}" ${ink}/>
    <path d="M168 640 H232 M172 520 H226 M180 400 H222 M188 290 H222" fill="none" ${thin}/>
    ${frond(-2.9, 230)}${frond(-2.2, 200)}${frond(-1.2, 210)}${frond(-0.3, 230)}${frond(0.45, 200)}${frond(2.6, 210)}
    ${[[185, 215], [222, 222], [205, 240]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${f('#8d5524')}" ${thin}/>`).join('')}
  </g>

  <!-- big tree on the right -->
  <g>
    <path d="M1380 760 Q 1400 560 1385 430 L1470 430 Q 1455 560 1480 760 Z" fill="${f('#9c6b3f')}" ${ink}/>
    <path d="M1240 400 C 1170 360 1200 250 1280 245 C 1300 160 1420 140 1460 200 C 1520 150 1630 190 1610 280 C 1680 320 1660 430 1590 445 C 1555 490 1290 490 1240 400 Z" fill="${f('#3fae4a')}" ${ink}/>
    <path d="M1300 330 Q 1320 300 1350 305 M1470 250 Q 1500 235 1525 250 M1520 380 Q 1545 360 1570 372" fill="none" ${thin}/>
    <path d="M1300 440 Q 1295 560 1320 640" fill="none" stroke="${f('#2f8f3d')}" stroke-width="10" stroke-linecap="round"/>
  </g>

  <!-- lion -->
  <g>
    <path d="M700 760 Q 790 720 790 650" fill="none" stroke="${f('#ffc145')}" stroke-width="16" stroke-linecap="round"/>
    <path d="M700 760 Q 790 720 790 650" fill="none" ${thin}/>
    <circle cx="792" cy="640" r="24" fill="${f('#c45f12')}" ${thin}/>
    ${[505, 560, 655, 710].map(x => `<rect x="${x}" y="780" width="46" height="110" rx="20" fill="${f('#f0ad35')}" ${ink}/>`).join('')}
    <ellipse cx="610" cy="770" rx="160" ry="85" fill="${f('#ffc145')}" ${ink}/>
    ${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<circle cx="${(440 + Math.cos(a) * 100).toFixed(1)}" cy="${(620 + Math.sin(a) * 100).toFixed(1)}" r="48" fill="${f('#e07a1f')}" ${ink}/>`; }).join('')}
    <circle cx="440" cy="620" r="100" fill="${f('#e07a1f')}"/>
    <circle cx="380" cy="545" r="26" fill="${f('#ffc145')}" ${thin}/><circle cx="500" cy="545" r="26" fill="${f('#ffc145')}" ${thin}/>
    <circle cx="440" cy="625" r="92" fill="${f('#ffc145')}" ${ink}/>
    <ellipse cx="440" cy="668" rx="44" ry="32" fill="${f('#fff0d0')}" ${thin}/>
    <path d="M422 648 H458 L440 668 Z" fill="${INK}"/>
    ${eye(408, 610, 12)}${eye(472, 610, 12)}${cheek(388, 650)}${cheek(492, 650)}
    <path d="M440 668 V680 M420 682 Q 440 698 460 682" fill="none" ${thin}/>
  </g>

  <!-- elephant -->
  <g>
    ${[1035, 1105, 1215, 1285].map(x => `<rect x="${x}" y="740" width="62" height="140" rx="24" fill="${f('#97a6be')}" ${ink}/>`).join('')}
    <path d="M1360 680 Q 1395 700 1390 740" fill="none" ${ink}/>
    <ellipse cx="1180" cy="700" rx="190" ry="125" fill="${f('#a7b4c9')}" ${ink}/>
    <path d="M945 615 Q 890 700 895 790 Q 900 830 940 822 Q 932 760 980 680 Z" fill="${f('#a7b4c9')}" ${ink}/>
    <path d="M906 790 H932 M902 760 H936 M906 730 H944" fill="none" ${thin}/>
    <circle cx="1000" cy="590" r="105" fill="${f('#a7b4c9')}" ${ink}/>
    <path d="M985 660 Q 1000 700 1030 690 Q 1010 680 1005 650 Z" fill="${f('#fffaf0')}" ${thin}/>
    <ellipse cx="1090" cy="590" rx="80" ry="105" fill="${f('#c3cbe0')}" ${ink}/>
    <ellipse cx="1090" cy="590" rx="48" ry="68" fill="${f('#ffc2d1')}" ${thin}/>
    ${eye(975, 565, 12)}${cheek(990, 610)}
    <path d="M945 610 Q 965 628 985 612" fill="none" ${thin}/>
  </g>

  ${only(`
  <!-- hidden: monkey -->
  <g>
    <path d="M330 330 Q 380 360 360 410 Q 340 430 330 410" fill="none" stroke="#8d5524" stroke-width="10" stroke-linecap="round"/>
    <path d="M280 300 Q 240 260 230 210" fill="none" stroke="#9c6b3f" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="305" cy="345" rx="34" ry="40" fill="#9c6b3f" ${thin}/>
    <circle cx="270" cy="290" r="16" fill="#f2c79b" ${thin}/><circle cx="330" cy="290" r="16" fill="#f2c79b" ${thin}/>
    <circle cx="300" cy="290" r="36" fill="#9c6b3f" ${thin}/>
    <ellipse cx="300" cy="298" rx="26" ry="22" fill="#f2c79b" ${thin}/>
    ${eye(290, 288, 6)}${eye(310, 288, 6)}<path d="M292 306 Q 300 312 308 306" fill="none" ${thin}/></g>
  <!-- hidden: parrot -->
  <g>
    <path d="M1440 340 L1425 410 L1455 400 Z" fill="#3a86ff" ${thin}/>
    <ellipse cx="1452" cy="315" rx="32" ry="45" fill="#ff3b4e" ${thin}/>
    <path d="M1435 310 Q 1420 350 1450 360 Q 1460 330 1435 310 Z" fill="#ffd23f" ${thin}/>
    <circle cx="1460" cy="270" r="26" fill="#ff3b4e" ${thin}/>
    <path d="M1482 268 Q 1505 275 1490 295 Q 1482 285 1478 280 Z" fill="#ffd23f" ${thin}/>
    ${eye(1465, 263, 6)}</g>
  <!-- hidden: snake -->
  <g>
    <path d="M680 930 C 700 880 740 880 760 920 S 820 960 840 915 S 890 870 910 905" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/>
    <path d="M680 930 C 700 880 740 880 760 920 S 820 960 840 915 S 890 870 910 905" fill="none" stroke="#8ac926" stroke-width="28" stroke-linecap="round"/>
    <path d="M680 930 C 700 880 740 880 760 920 S 820 960 840 915 S 890 870 910 905" fill="none" stroke="#ffd23f" stroke-width="8" stroke-dasharray="6 22" stroke-linecap="round"/>
    <ellipse cx="925" cy="895" rx="30" ry="22" fill="#8ac926" ${thin}/>
    <path d="M953 900 l 20 4 m -20 -4 l 18 -8" stroke="#ff3b4e" stroke-width="4" stroke-linecap="round"/>
    ${eye(930, 886, 6)}</g>
  <!-- hidden: bananas -->
  <g>${[[-22, -20], [0, -10], [22, -2]].map(([dx, r]) => `<path transform="rotate(${r} ${1340 + dx} 420)" d="M${1330 + dx} 400 Q ${1310 + dx} 450 ${1345 + dx} 470 Q ${1330 + dx} 440 ${1345 + dx} 405 Z" fill="#ffd23f" ${thin}/>`).join('')}
    <path d="M1335 400 V385" ${thin}/></g>
  <!-- hidden: butterfly -->
  <g transform="rotate(10 760 290)">
    <ellipse cx="720" cy="270" rx="42" ry="32" fill="#4cc9f0" ${thin}/><ellipse cx="800" cy="270" rx="42" ry="32" fill="#4cc9f0" ${thin}/>
    <ellipse cx="730" cy="318" rx="30" ry="23" fill="#ff8fc7" ${thin}/><ellipse cx="790" cy="318" rx="30" ry="23" fill="#ff8fc7" ${thin}/>
    <ellipse cx="760" cy="295" rx="10" ry="44" fill="${INK}"/>
    <path d="M754 254 Q 742 228 728 226 M766 254 Q 778 228 792 226" fill="none" ${thin}/></g>
  <!-- hidden: frog -->
  <g>
    <ellipse cx="1490" cy="905" rx="60" ry="40" fill="#5fd35f" ${thin}/>
    <ellipse cx="1440" cy="935" rx="28" ry="12" fill="#5fd35f" ${thin}/><ellipse cx="1540" cy="935" rx="28" ry="12" fill="#5fd35f" ${thin}/>
    <circle cx="1468" cy="860" r="20" fill="#5fd35f" ${thin}/><circle cx="1512" cy="860" r="20" fill="#5fd35f" ${thin}/>
    ${eye(1468, 860, 9)}${eye(1512, 860, 9)}
    <path d="M1465 905 Q 1490 925 1515 905" fill="none" ${thin}/></g>
  `)}
</svg>`;
}
