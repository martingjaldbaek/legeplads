/* Hand-drawn SVG page for Tryllemaling: the sea. Same format as gaarden.js:
 * svg(line, pxW, pxH, vb) returns the page as a colouring-book outline (line = true) or in full colour;
 * vb is the viewBox to show (the page is drawn in a 1600×1000 box, with sky and sea reaching far beyond it
 * so portrait screens can show more above and below). hidden: surprises with no outline (x, y, radius).
 */
export const W = 1600, H = 1000;
const PAPER = '#fffaf0', INK = '#4a3b5c';

export const hidden = [
  { x: 320, y: 410, r: 120 },   // three fish
  { x: 1010, y: 390, r: 95 },   // jellyfish
  { x: 900, y: 900, r: 85 },    // crab
  { x: 1400, y: 915, r: 75 },   // starfish
  { x: 190, y: 690, r: 95 },    // turtle
  { x: 610, y: 925, r: 60 },    // shell
];

export function svg(line, pxW, pxH, vb = '0 0 1600 1000') {
  const f = c => (line ? PAPER : c);
  const ink = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const only = s => (line ? '' : s);
  const eye = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  const cheek = (x, y) => only(`<circle cx="${x}" cy="${y}" r="13" fill="#ff8fab" opacity=".55"/>`);

  let waves = 'M-1000 230';
  for (let x = -1000; x < 2600; x += 100) waves += ` q 25 -16 50 0 q 25 16 50 0`;
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI / 5, c = Math.cos(a), s = Math.sin(a), p = Math.cos(a + 0.2), q = Math.sin(a + 0.2), m = Math.cos(a - 0.2), n = Math.sin(a - 0.2);
    return `<path d="M${260 + m * 78} ${110 + n * 78} L${260 + c * 112} ${110 + s * 112} L${260 + p * 78} ${110 + q * 78} Z" fill="${f('#ffb703')}" ${thin}/>`;
  }).join('');
  const fish = (x, y, c) => `<g>
    <path d="M${x - 36} ${y} L${x - 72} ${y - 24} L${x - 66} ${y} L${x - 72} ${y + 24} Z" fill="${c}" ${thin}/>
    <ellipse cx="${x}" cy="${y}" rx="44" ry="28" fill="${c}" ${thin}/>
    <path d="M${x - 8} ${y - 26} Q ${x + 2} ${y} ${x - 8} ${y + 26}" fill="none" ${thin}/>
    ${eye(x + 22, y - 7, 7)}</g>`;
  const weed = (x, k) => `<path transform="translate(${x} 0) scale(${k} 1)" d="M0 900 C -45 800 40 740 0 640 C -20 585 25 540 10 470 Q 60 560 45 630 C 85 730 20 800 50 900 Z" fill="${f('#3fbf6a')}" ${ink}/>`;
  const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f('#e6f7ff')}" ${thin}/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-500" x2="0" y2="230"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>
    <linearGradient id="sea" gradientUnits="userSpaceOnUse" x1="0" y1="230" x2="0" y2="1100"><stop offset="0" stop-color="#5ecbf5"/><stop offset="1" stop-color="#1c64b8"/></linearGradient>
  </defs>
  <rect x="-1000" y="-1500" width="3600" height="1730" fill="${line ? PAPER : 'url(#sky)'}"/>
  <rect x="-1000" y="230" width="3600" height="2500" fill="${line ? PAPER : 'url(#sea)'}"/>
  ${only(`<g fill="#ffffff" opacity=".13">
    <path d="M300 230 L420 230 L250 900 L80 900 Z"/><path d="M800 230 L880 230 L820 900 L640 900 Z"/><path d="M1300 230 L1400 230 L1500 900 L1320 900 Z"/></g>
    <g fill="#ffffff" opacity=".95"><circle cx="560" cy="110" r="38"/><circle cx="610" cy="88" r="48"/><circle cx="665" cy="110" r="38"/><rect x="560" y="110" width="105" height="38"/></g>`)}
  <path d="${waves}" fill="none" ${thin}/>

  <!-- sand -->
  <path d="M-1000 870 Q 0 820 400 860 T 1200 850 T 2600 860 V2700 H-1000 Z" fill="${f('#ffe2a8')}" ${ink}/>
  ${only('<g fill="#f2c879"><circle cx="300" cy="950" r="6"/><circle cx="760" cy="980" r="5"/><circle cx="1130" cy="930" r="6"/><circle cx="1500" cy="990" r="5"/><circle cx="60" cy="920" r="5"/></g>')}

  <!-- seaweed -->
  ${weed(95, 1)}${weed(1505, -1)}

  <!-- sun -->
  <g>${rays}<circle cx="260" cy="110" r="72" fill="${f('#ffd93f')}" ${ink}/>
    ${eye(236, 100, 10)}${eye(284, 100, 10)}${cheek(222, 128)}${cheek(298, 128)}
    <path d="M238 128 Q260 150 282 128" fill="none" ${ink}/></g>

  <!-- boat -->
  <g>
    <rect x="1146" y="30" width="14" height="165" rx="5" fill="${f('#9c6b3f')}" ${thin}/>
    <path d="M1163 45 L1163 182 L1285 182 Z" fill="${f('#fff4d6')}" ${ink}/>
    <path d="M1142 70 L1142 182 L1050 182 Z" fill="${f('#ffd23f')}" ${ink}/>
    <path d="M1160 30 L1205 44 L1160 58 Z" fill="${f('#ff3b6b')}" ${thin}/>
    <path d="M990 190 H1330 L1285 252 Q1160 270 1035 252 Z" fill="${f('#ff6b6b')}" ${ink}/>
    <path d="M1005 210 H1315" fill="none" stroke="${f('#ffffff')}" stroke-width="10"/>
    ${[1085, 1160, 1235].map(x => `<circle cx="${x}" cy="232" r="12" fill="${f('#bde8ff')}" ${thin}/>`).join('')}
  </g>

  <!-- whale -->
  <g>
    ${bubble(535, 375, 17)}${bubble(560, 325, 12)}${bubble(540, 285, 9)}
    <path d="M860 585 Q 925 555 955 490 Q 990 535 972 578 Q 1012 590 1035 645 Q 985 655 942 628 Q 900 632 862 622 Z" fill="${f('#5b8def')}" ${ink}/>
    <path d="M380 600 C 380 455 560 405 705 422 C 845 440 905 520 885 600 C 865 690 720 720 560 712 C 450 706 380 680 380 600 Z" fill="${f('#5b8def')}" ${ink}/>
    <path d="M395 632 Q 520 712 710 702 Q 600 668 400 612 Z" fill="${f('#cfe8ff')}" ${thin}/>
    <path d="M600 662 Q 615 735 690 748 Q 670 695 645 662 Z" fill="${f('#4a78d6')}" ${thin}/>
    ${eye(470, 560, 13)}${cheek(452, 600)}
    <path d="M398 612 Q 440 642 486 630" fill="none" ${ink}/>
  </g>

  <!-- octopus -->
  <g>
    ${[[1150, 35], [1190, 15], [1230, 0], [1270, -8], [1310, -20], [1350, -38]].map(([x, r]) =>
      `<ellipse cx="${x}" cy="735" rx="24" ry="78" transform="rotate(${r} ${x} 680)" fill="${f('#ff8fab')}" ${ink}/>`).join('')}
    <ellipse cx="1250" cy="615" rx="115" ry="105" fill="${f('#ff8fab')}" ${ink}/>
    ${only('<circle cx="1205" cy="560" r="14" fill="#ffc2d1"/><circle cx="1300" cy="548" r="10" fill="#ffc2d1"/><circle cx="1255" cy="530" r="8" fill="#ffc2d1"/>')}
    ${eye(1213, 610, 14)}${eye(1287, 610, 14)}${cheek(1190, 645)}${cheek(1310, 645)}
    <path d="M1222 650 Q1250 676 1278 650" fill="none" ${ink}/>
  </g>

  ${only(`
  <!-- hidden: three fish -->
  ${fish(250, 375, '#ffd23f')}${fish(380, 420, '#ff8a00')}${fish(290, 470, '#ff5d8f')}
  <!-- hidden: jellyfish -->
  <g>
    ${[965, 995, 1025, 1055].map((x, i) => `<path d="M${x} 400 q ${i % 2 ? 14 : -14} 30 0 58 q ${i % 2 ? -14 : 14} 28 0 56" fill="none" stroke="#c77dff" stroke-width="8" stroke-linecap="round"/>`).join('')}
    <path d="M945 405 Q 945 320 1010 318 Q 1075 320 1075 405 Q 1043 392 1010 405 Q 977 392 945 405 Z" fill="#d6a4ff" ${thin}/>
    ${eye(990, 370, 7)}${eye(1030, 370, 7)}<path d="M998 385 Q 1010 395 1022 385" fill="none" ${thin}/></g>
  <!-- hidden: crab -->
  <g>
    ${[-1, 1].map(s => `<path d="M${900 + s * 40} 905 l ${s * 40} 22 M${900 + s * 45} 890 l ${s * 45} 8" ${thin}/>
      <path d="M${900 + s * 38} 880 L${900 + s * 62} 858" ${thin}/>
      <circle cx="${900 + s * 70}" cy="850" r="22" fill="#ff5a4e" ${thin}/>
      <path d="M${900 + s * 70} 850 l ${s * 22} -12" ${thin}/>`).join('')}
    <path d="M888 862 V840 M912 862 V840" ${thin}/>
    <ellipse cx="900" cy="895" rx="52" ry="34" fill="#ff5a4e" ${thin}/>
    ${eye(888, 836, 8)}${eye(912, 836, 8)}<path d="M888 905 Q 900 915 912 905" fill="none" ${thin}/></g>
  <!-- hidden: starfish -->
  <g>
    <path d="${Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 24 : 58, a = i * Math.PI / 5 - Math.PI / 2; return (i ? 'L' : 'M') + (1400 + Math.cos(a) * r).toFixed(1) + ' ' + (918 + Math.sin(a) * r).toFixed(1); }).join(' ')} Z" fill="#ffa94d" ${thin}/>
    ${eye(1388, 912, 6)}${eye(1412, 912, 6)}<path d="M1390 928 Q 1400 936 1410 928" fill="none" ${thin}/></g>
  <!-- hidden: turtle -->
  <g>
    <ellipse cx="150" cy="740" rx="22" ry="14" fill="#9be071" ${thin}/><ellipse cx="240" cy="742" rx="22" ry="14" fill="#9be071" ${thin}/>
    <ellipse cx="135" cy="645" rx="24" ry="14" fill="#9be071" ${thin}/><ellipse cx="245" cy="640" rx="24" ry="14" fill="#9be071" ${thin}/>
    <circle cx="275" cy="685" r="26" fill="#9be071" ${thin}/>
    <ellipse cx="190" cy="690" rx="75" ry="50" fill="#3aa35a" ${thin}/>
    <path d="M160 655 L190 640 L220 655 L220 690 L190 705 L160 690 Z" fill="#62c370" ${thin}/>
    ${eye(283, 678, 6)}<path d="M276 694 Q 285 700 293 692" fill="none" ${thin}/></g>
  <!-- hidden: shell -->
  <g>
    <path d="M565 950 Q 560 890 610 882 Q 660 890 655 950 Z" fill="#ffc2d1" ${thin}/>
    <path d="M590 948 L605 892 M610 948 V888 M630 948 L615 892" fill="none" ${thin}/></g>
  `)}
</svg>`;
}
