/* Hand-drawn SVG page for Tryllemaling: the street, with a bus, a car and a traffic light.
 * Same format as gaarden.js / havet.js. */
export const W = 1600, H = 1000;
const PAPER = '#fffaf0', INK = '#4a3b5c';

export const hidden = [
  { x: 740, y: 255, r: 80 },    // cat on the roof
  { x: 1010, y: 170, r: 85 },   // balloon
  { x: 540, y: 110, r: 70 },    // bird
  { x: 240, y: 100, r: 90 },    // aeroplane
  { x: 790, y: 670, r: 70 },    // dog on the pavement
  { x: 1258, y: 485, r: 80 },   // flowers in the window box
];

export function svg(line, pxW, pxH, vb = '0 0 1600 1000') {
  const f = c => (line ? PAPER : c);
  const ink = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const only = s => (line ? '' : s);
  const eye = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  const cheek = (x, y) => only(`<circle cx="${x}" cy="${y}" r="12" fill="#ff8fab" opacity=".55"/>`);
  const win = (x, y, w = 70, h = 70) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${f('#bde8ff')}" ${thin}/>
    <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" fill="none" ${thin}/>`;
  const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="44" fill="${f('#3d3d4a')}" ${ink}/><circle cx="${x}" cy="${y}" r="18" fill="${f('#cfd3dc')}" ${thin}/>`;
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI / 5, c = Math.cos(a), s = Math.sin(a), p = Math.cos(a + 0.2), q = Math.sin(a + 0.2), m = Math.cos(a - 0.2), n = Math.sin(a - 0.2);
    return `<path d="M${1440 + m * 72} ${110 + n * 72} L${1440 + c * 104} ${110 + s * 104} L${1440 + p * 72} ${110 + q * 72} Z" fill="${f('#ffb703')}" ${thin}/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="-500" x2="0" y2="650"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient>
  </defs>
  <rect x="-1000" y="-1500" width="3600" height="2200" fill="${line ? PAPER : 'url(#sky)'}"/>
  ${only(`<g fill="#ffffff" opacity=".95"><circle cx="760" cy="80" r="34"/><circle cx="805" cy="60" r="44"/><circle cx="855" cy="80" r="34"/><rect x="760" y="80" width="95" height="34"/>
    <circle cx="1180" cy="60" r="26"/><circle cx="1212" cy="44" r="34"/><circle cx="1250" cy="60" r="26"/><rect x="1180" y="60" width="70" height="26"/></g>`)}

  <!-- sun -->
  <g>${rays}<circle cx="1440" cy="110" r="66" fill="${f('#ffd93f')}" ${ink}/>
    ${eye(1418, 100, 9)}${eye(1462, 100, 9)}<path d="M1420 126 Q1440 144 1460 126" fill="none" ${ink}/></g>

  <!-- houses -->
  <g>
    <rect x="120" y="370" width="400" height="290" fill="${f('#ffb4a2')}" ${ink}/>
    <path d="M90 385 L320 225 L550 385 Z" fill="${f('#d64541')}" ${ink}/>
    ${win(165, 420)}${win(395, 420)}
    <path d="M280 660 V560 Q 280 520 320 520 Q 360 520 360 560 V660 Z" fill="${f('#3a86ff')}" ${ink}/>
    <circle cx="345" cy="600" r="6" fill="${INK}"/>

    <rect x="560" y="300" width="360" height="360" fill="${f('#8fb8ff')}" ${ink}/>
    <rect x="545" y="290" width="390" height="24" rx="8" fill="${f('#5b7fd6')}" ${ink}/>
    ${win(600, 350, 80, 75)}${win(800, 350, 80, 75)}${win(600, 470, 80, 75)}${win(800, 470, 80, 75)}
    <rect x="700" y="560" width="80" height="100" rx="6" fill="${f('#ffd23f')}" ${ink}/>

    <rect x="960" y="390" width="380" height="270" fill="${f('#b8e986')}" ${ink}/>
    <path d="M930 400 L1150 255 L1370 400 Z" fill="${f('#8d5524')}" ${ink}/>
    ${win(1000, 440, 90, 70)}${win(1210, 440, 90, 70)}
    <rect x="1195" y="510" width="120" height="22" rx="6" fill="${f('#c08a50')}" ${thin}/>
    <path d="M1110 660 V570 H1180 V660 Z" fill="${f('#ff6b6b')}" ${ink}/>
  </g>

  <!-- pavement and road -->
  <rect x="-1000" y="660" width="3600" height="60" fill="${f('#e2ddd5')}" ${ink}/>
  <rect x="-1000" y="720" width="3600" height="2000" fill="${f('#6b6f7a')}" ${ink}/>
  ${[-180, 120, 420, 720, 1020, 1320, 1620].map(x => `<rect x="${x}" y="955" width="150" height="18" rx="6" fill="${f('#ffffff')}" ${thin}/>`).join('')}

  <!-- traffic light -->
  <g>
    <rect x="1438" y="440" width="24" height="250" fill="${f('#7a7f8c')}" ${ink}/>
    <rect x="1400" y="270" width="100" height="200" rx="22" fill="${f('#3d3d4a')}" ${ink}/>
    <circle cx="1450" cy="312" r="24" fill="${f('#ff3b4e')}" ${thin}/>
    <circle cx="1450" cy="370" r="24" fill="${f('#ffd23f')}" ${thin}/>
    <circle cx="1450" cy="428" r="24" fill="${f('#3fcf6a')}" ${thin}/>
  </g>

  <!-- bus -->
  <g>
    <rect x="110" y="590" width="510" height="230" rx="34" fill="${f('#ffc93c')}" ${ink}/>
    <rect x="110" y="745" width="510" height="26" fill="${f('#ff8a00')}" ${thin}/>
    ${[145, 255, 365].map(x => `<rect x="${x}" y="625" width="90" height="80" rx="12" fill="${f('#bde8ff')}" ${thin}/>`).join('')}
    <rect x="480" y="620" width="115" height="110" rx="16" fill="${f('#bde8ff')}" ${ink}/>
    ${eye(515, 665, 11)}${eye(560, 665, 11)}${cheek(502, 695)}${cheek(574, 695)}
    <path d="M520 695 Q 538 710 556 695" fill="none" ${thin}/>
    <circle cx="610" cy="790" r="14" fill="${f('#fff1a8')}" ${thin}/>
    ${wheel(220, 830)}${wheel(510, 830)}
  </g>

  <!-- car -->
  <g>
    <path d="M870 860 V800 Q 870 768 910 762 L960 758 Q 1000 696 1070 692 L1135 692 Q 1195 696 1228 758 L1250 762 Q 1282 768 1282 806 V860 Z" fill="${f('#3a86ff')}" ${ink}/>
    <path d="M985 760 Q 1012 718 1068 715 L1128 715 Q 1176 718 1202 760 Z" fill="${f('#bde8ff')}" ${ink}/>
    ${eye(1065, 742, 10)}${eye(1125, 742, 10)}
    <path d="M1080 760 Q 1095 770 1110 760" fill="none" ${thin}/>
    <circle cx="1266" cy="800" r="13" fill="${f('#fff1a8')}" ${thin}/>
    <rect x="1240" y="830" width="50" height="16" rx="6" fill="${f('#cfd3dc')}" ${thin}/>
    ${wheel(960, 862)}${wheel(1190, 862)}
  </g>

  ${only(`
  <!-- hidden: cat on the roof -->
  <g>
    <path d="M770 280 Q 815 270 800 225" fill="none" stroke="#ff9f43" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="745" cy="262" rx="38" ry="28" fill="#ff9f43" ${thin}/>
    <path d="M700 225 L705 195 L725 215 Z M740 215 L760 195 L765 225 Z" fill="#ff9f43" ${thin}/>
    <circle cx="732" cy="235" r="30" fill="#ff9f43" ${thin}/>
    ${eye(722, 232, 5)}${eye(742, 232, 5)}<path d="M726 248 Q 732 253 738 248" fill="none" ${thin}/></g>
  <!-- hidden: balloon -->
  <g>
    <path d="M1010 230 Q 1000 270 1015 300 Q 1025 330 1010 360" fill="none" ${thin}/>
    <ellipse cx="1010" cy="160" rx="55" ry="68" fill="#ff3b6b" ${thin}/>
    <path d="M1000 226 L1020 226 L1010 238 Z" fill="#ff3b6b" ${thin}/>
    <ellipse cx="990" cy="135" rx="12" ry="20" fill="#ffffff" opacity=".6"/></g>
  <!-- hidden: bird -->
  <g>
    <ellipse cx="540" cy="112" rx="45" ry="30" fill="#3a86ff" ${thin}/>
    <path d="M525 108 Q 540 72 565 100 Z" fill="#74b0ff" ${thin}/>
    <path d="M582 104 L610 112 L582 120 Z" fill="#ff9f1c" ${thin}/>
    ${eye(563, 102, 5)}
    <path d="M498 112 L472 96 L476 130 Z" fill="#3a86ff" ${thin}/></g>
  <!-- hidden: aeroplane -->
  <g transform="rotate(-8 240 100)">
    <path d="M150 100 Q 150 80 175 78 H320 Q 345 82 345 100 Q 345 118 320 122 H175 Q 150 120 150 100 Z" fill="#ffffff" ${thin}/>
    <path d="M230 98 L200 40 H225 L275 98 Z M230 104 L205 160 H230 L275 104 Z" fill="#ff3b6b" ${thin}/>
    <path d="M160 92 L140 60 H160 L185 88 Z" fill="#ff3b6b" ${thin}/>
    ${[260, 285, 310].map(x => `<circle cx="${x}" cy="98" r="7" fill="#bde8ff" ${thin}/>`).join('')}</g>
  <!-- hidden: dog -->
  <g>
    <path d="M745 660 Q 725 640 735 625" fill="none" stroke="#c98b4f" stroke-width="10" stroke-linecap="round"/>
    ${[755, 775, 805, 825].map(x => `<rect x="${x}" y="670" width="14" height="32" rx="6" fill="#c98b4f" ${thin}/>`).join('')}
    <ellipse cx="790" cy="668" rx="50" ry="26" fill="#e8b878" ${thin}/>
    <circle cx="840" cy="640" r="26" fill="#e8b878" ${thin}/>
    <ellipse cx="822" cy="645" rx="10" ry="20" fill="#a8673a" ${thin}/>
    ${eye(846, 634, 5)}<circle cx="864" cy="646" r="5" fill="${INK}"/></g>
  <!-- hidden: flowers in the window box -->
  ${[[1215, '#ff5d8f'], [1245, '#ffd23f'], [1275, '#8338ec'], [1300, '#ff8a00']].map(([x, c]) => `<path d="M${x} 510 V485" stroke="#3f9a3c" stroke-width="6"/>
    <circle cx="${x}" cy="478" r="13" fill="${c}" ${thin}/><circle cx="${x}" cy="478" r="5" fill="#ffd23f"/>`).join('')}
  `)}
</svg>`;
}
