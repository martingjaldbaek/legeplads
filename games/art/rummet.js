/* Hand-drawn SVG page for Tryllemaling: space. Same format as gaarden.js / havet.js. */
export const W = 1600, H = 1000;
const PAPER = '#fffaf0', INK = '#4a3b5c';

export const hidden = [
  { x: 1230, y: 770, r: 100 },  // alien
  { x: 330, y: 560, r: 120 },   // UFO
  { x: 1080, y: 120, r: 105 },  // shooting star
  { x: 560, y: 150, r: 75 },    // small blue planet
  { x: 160, y: 420, r: 85 },    // three stars
  { x: 1480, y: 540, r: 75 },   // satellite
];

export function svg(line, pxW, pxH, vb = '0 0 1600 1000') {
  const f = c => (line ? PAPER : c);
  const ink = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const only = s => (line ? '' : s);
  const eye = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  const cheek = (x, y) => only(`<circle cx="${x}" cy="${y}" r="13" fill="#ff8fab" opacity=".55"/>`);
  const BG = line ? PAPER : 'url(#space)';
  const star = (x, y, R, c) => `<path d="${Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? R * 0.45 : R, a = i * Math.PI / 5 - Math.PI / 2; return (i ? 'L' : 'M') + (x + Math.cos(a) * r).toFixed(1) + ' ' + (y + Math.sin(a) * r).toFixed(1); }).join(' ')} Z" fill="${c}" ${thin}/>`;
  // twinkly background dots (colour only), spread far so portrait screens are covered too
  let dots = '';
  for (let i = 0; i < 160; i++) {
    const x = -600 + ((i * 977) % 2800), y = -700 + ((i * 613) % 1500), r = 2 + (i % 3) * 1.6;
    dots += `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  }
  const ring = `<path fill-rule="evenodd" d="M1110 260 a190 48 0 1 0 380 0 a190 48 0 1 0 -380 0 Z M1150 260 a150 30 0 1 0 300 0 a150 30 0 1 0 -300 0 Z" fill="${f('#ffd166')}" ${thin}/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="space" gradientUnits="userSpaceOnUse" x1="0" y1="-600" x2="0" y2="850"><stop offset="0" stop-color="#0f0d33"/><stop offset="1" stop-color="#3b2a7a"/></linearGradient>
    <clipPath id="moonC"><circle cx="240" cy="200" r="100"/></clipPath>
    <clipPath id="ringFront"><rect x="1050" y="260" width="500" height="120"/></clipPath>
  </defs>
  <rect x="-1000" y="-1500" width="3600" height="4200" fill="${BG}"/>
  ${only(`<g fill="#fff8c4">${dots}</g>`)}

  <!-- moon surface -->
  <path d="M-1000 820 Q 300 760 700 800 T 1500 790 T 2600 800 V2700 H-1000 Z" fill="${f('#cfc8ec')}" ${ink}/>
  <ellipse cx="300" cy="880" rx="80" ry="20" fill="${f('#b0a8d8')}" ${thin}/>
  <ellipse cx="900" cy="915" rx="100" ry="24" fill="${f('#b0a8d8')}" ${thin}/>
  <ellipse cx="1460" cy="870" rx="60" ry="15" fill="${f('#b0a8d8')}" ${thin}/>
  <ellipse cx="640" cy="965" rx="45" ry="11" fill="${f('#b0a8d8')}" ${thin}/>

  <!-- crescent moon with a sleepy face -->
  <g>
    <circle cx="240" cy="200" r="100" fill="${f('#ffe066')}" ${ink}/>
    <g clip-path="url(#moonC)"><circle cx="292" cy="168" r="84" fill="${BG}" ${ink}/></g>
    <path d="M165 175 Q 180 188 195 175" fill="none" ${ink}/>
    ${cheek(178, 212)}
    <path d="M170 232 Q 190 248 210 230" fill="none" ${ink}/>
  </g>

  <!-- ringed planet -->
  <g transform="rotate(-14 1300 260)">
    ${ring}
    <circle cx="1300" cy="260" r="110" fill="${f('#ff9f6b')}" ${ink}/>
    <path d="M1198 220 Q1300 240 1402 220 M1198 300 Q1300 320 1402 300" fill="none" ${thin}/>
    ${eye(1265, 255, 12)}${eye(1335, 255, 12)}${cheek(1245, 285)}${cheek(1355, 285)}
    <path d="M1280 285 Q1300 302 1320 285" fill="none" ${ink}/>
    <g clip-path="url(#ringFront)">${ring}</g>
  </g>

  <!-- rocket -->
  <g transform="rotate(18 800 470)">
    <path d="M762 628 Q 800 790 838 628 Q 818 660 800 715 Q 782 660 762 628 Z" fill="${f('#ffb703')}" ${ink}/>
    ${only('<path d="M780 632 Q 800 700 820 632 Z" fill="#ff6b35"/>')}
    <path d="M736 520 L668 650 L740 615 Z" fill="${f('#ff3b6b')}" ${ink}/>
    <path d="M864 520 L932 650 L860 615 Z" fill="${f('#ff3b6b')}" ${ink}/>
    <rect x="752" y="600" width="96" height="32" rx="8" fill="${f('#9aa0b5')}" ${ink}/>
    <path d="M800 228 C 885 300 892 455 868 604 H732 C 708 455 715 300 800 228 Z" fill="${f('#f3f1fb')}" ${ink}/>
    <path d="M800 228 C 838 262 856 296 864 330 H736 C 744 296 762 262 800 228 Z" fill="${f('#ff3b6b')}" ${ink}/>
    <circle cx="800" cy="415" r="50" fill="${f('#8fd3ff')}" ${ink}/>
    ${eye(782, 410, 9)}${eye(818, 410, 9)}<path d="M786 432 Q 800 444 814 432" fill="none" ${thin}/>
    <path d="M790 600 V520 M810 600 V520" fill="none" ${thin}/>
  </g>

  ${only(`
  <!-- hidden: alien -->
  <g>
    <path d="M1205 712 L1180 660 M1255 712 L1280 660" ${thin}/>
    <circle cx="1180" cy="655" r="11" fill="#ffd23f" ${thin}/><circle cx="1280" cy="655" r="11" fill="#ffd23f" ${thin}/>
    <path d="M1185 790 Q 1150 760 1140 735" fill="none" stroke="#7ae582" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="1230" cy="815" rx="40" ry="42" fill="#7ae582" ${thin}/>
    <ellipse cx="1230" cy="745" rx="55" ry="45" fill="#7ae582" ${thin}/>
    ${eye(1208, 740, 11)}${eye(1252, 740, 11)}<path d="M1215 765 Q 1230 778 1245 765" fill="none" ${thin}/></g>
  <!-- hidden: UFO -->
  <g>
    <path d="M290 590 L230 760 H430 L370 590 Z" fill="#ffe066" opacity=".3"/>
    <ellipse cx="330" cy="545" rx="55" ry="45" fill="#bde8ff" ${thin}/>
    <ellipse cx="330" cy="575" rx="115" ry="32" fill="#c77dff" ${thin}/>
    ${[250, 300, 360, 410].map(x => `<circle cx="${x}" cy="578" r="9" fill="#ffd23f" ${thin}/>`).join('')}
    ${eye(315, 540, 7)}${eye(345, 540, 7)}</g>
  <!-- hidden: shooting star -->
  <g>
    <path d="M1100 125 L980 175" stroke="#ff9de2" stroke-width="12" stroke-linecap="round"/>
    <path d="M1105 112 L975 140" stroke="#8be9ff" stroke-width="10" stroke-linecap="round"/>
    ${star(1120, 110, 42, '#ffd23f')}</g>
  <!-- hidden: small planet -->
  <g><circle cx="560" cy="150" r="48" fill="#4cc9f0" ${thin}/>
    <circle cx="545" cy="135" r="10" fill="#3aa0d0"/><circle cx="578" cy="168" r="8" fill="#3aa0d0"/><circle cx="572" cy="128" r="5" fill="#3aa0d0"/></g>
  <!-- hidden: three stars -->
  ${star(130, 400, 30, '#fff1a8')}${star(195, 445, 22, '#ffd23f')}${star(175, 365, 16, '#ffb703')}
  <!-- hidden: satellite -->
  <g transform="rotate(-20 1480 540)">
    <rect x="1385" y="525" width="60" height="30" fill="#4cc9f0" ${thin}/><rect x="1515" y="525" width="60" height="30" fill="#4cc9f0" ${thin}/>
    <rect x="1450" y="515" width="60" height="50" rx="8" fill="#d0d4e0" ${thin}/>
    <path d="M1480 515 V490" ${thin}/><circle cx="1480" cy="485" r="8" fill="#ff3b6b" ${thin}/></g>
  `)}
</svg>`;
}
