/* SVG art for Dukkehuset: a cross-section house in a 1400×1000 box (ground at y=880), plus people and pets.
 * Characters are drawn with their feet at (0,0). Tappable things carry data-tap="name"; the game binds them.
 */
export const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- people and pets ---------- */
const HAIR = {
  short: c => `<path d="M-31 -128 Q-34 -168 0 -166 Q34 -168 31 -128 Q24 -150 0 -149 Q-22 -150 -31 -128Z" fill="${c}" ${ink(4)}/>`,
  long: c => `<path d="M-31 -134 Q-44 -100 -36 -84 L-20 -90 Q-26 -112 -22 -136 Z M31 -134 Q44 -100 36 -84 L20 -90 Q26 -112 22 -136 Z" fill="${c}" ${ink(4)}/>
    <path d="M-31 -126 Q-34 -168 0 -166 Q34 -168 31 -126 Q22 -152 0 -150 Q-22 -152 -31 -126Z" fill="${c}" ${ink(4)}/>`,
  bun: c => `<circle cx="0" cy="-168" r="13" fill="${c}" ${ink(4)}/>
    <path d="M-31 -128 Q-34 -166 0 -164 Q34 -166 31 -128 Q24 -150 0 -149 Q-22 -150 -31 -128Z" fill="${c}" ${ink(4)}/>`,
  spiky: c => `<path d="M-31 -126 L-34 -150 L-20 -146 L-16 -168 L-4 -152 L6 -172 L12 -152 L26 -164 L24 -146 L35 -146 L31 -126 Q20 -146 0 -146 Q-20 -146 -31 -126Z" fill="${c}" ${ink(4)}/>`,
  pigtails: c => `<circle cx="-36" cy="-150" r="12" fill="${c}" ${ink(4)}/><circle cx="36" cy="-150" r="12" fill="${c}" ${ink(4)}/>
    <path d="M-31 -128 Q-34 -168 0 -166 Q34 -168 31 -128 Q24 -150 0 -149 Q-22 -150 -31 -128Z" fill="${c}" ${ink(4)}/>`,
};
const eyes = (x, y, r = 4.5) => `<g class="dh-eyes"><circle cx="${x - 10}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + 10}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${x - 8.5}" cy="${y - 1.5}" r="1.5" fill="#fff"/><circle cx="${x + 11.5}" cy="${y - 1.5}" r="1.5" fill="#fff"/></g>
  <g class="dh-shut"><path d="M${x - 15} ${y} Q${x - 10} ${y + 4} ${x - 5} ${y} M${x + 5} ${y} Q${x + 10} ${y + 4} ${x + 15} ${y}" fill="none" ${ink(3)}/></g>`;

export function person({ skin = '#ffd9b8', hair = '#6b3e26', style = 'short', shirt = '#3a86ff', pants = '#2b2d42', shoes = '#4a3b5c', dress = false }) {
  const legs = dress
    ? `<rect x="-17" y="-40" width="12" height="36" rx="6" fill="${skin}" ${ink(4)}/><rect x="5" y="-40" width="12" height="36" rx="6" fill="${skin}" ${ink(4)}/>`
    : `<rect x="-19" y="-54" width="15" height="50" rx="6" fill="${pants}" ${ink(4)}/><rect x="4" y="-54" width="15" height="50" rx="6" fill="${pants}" ${ink(4)}/>`;
  const torso = dress
    ? `<path d="M-24 -104 H24 L38 -40 H-38 Z" fill="${shirt}" ${ink(5)}/>`
    : `<path d="M-30 -96 Q-30 -104 -20 -104 H20 Q30 -104 30 -96 V-50 H-30 Z" fill="${shirt}" ${ink(5)}/>`;
  return `<g class="dh-legs">${legs}
      <ellipse cx="-12" cy="-4" rx="13" ry="7" fill="${shoes}" ${ink(3)}/><ellipse cx="12" cy="-4" rx="13" ry="7" fill="${shoes}" ${ink(3)}/></g>
    <rect x="-43" y="-100" width="14" height="46" rx="7" fill="${shirt}" ${ink(4)}/><rect x="29" y="-100" width="14" height="46" rx="7" fill="${shirt}" ${ink(4)}/>
    <circle cx="-36" cy="-52" r="8" fill="${skin}" ${ink(3)}/><circle cx="36" cy="-52" r="8" fill="${skin}" ${ink(3)}/>
    ${torso}
    <circle cx="0" cy="-130" r="30" fill="${skin}" ${ink(5)}/>
    ${HAIR[style](hair)}
    ${eyes(0, -128)}
    <circle cx="-19" cy="-117" r="5" fill="#ff8fab" opacity=".55"/><circle cx="19" cy="-117" r="5" fill="#ff8fab" opacity=".55"/>
    <path class="dh-mouth" d="M-8 -115 Q0 -107 8 -115" fill="none" ${ink(3.5)}/>`;
}

export function dog() {
  const c = '#d39a5c', d = '#a8693a';
  return `<g class="dh-legs"><rect x="-34" y="-30" width="12" height="30" rx="5" fill="${c}" ${ink(4)}/><rect x="-16" y="-30" width="12" height="30" rx="5" fill="${c}" ${ink(4)}/>
      <rect x="10" y="-30" width="12" height="30" rx="5" fill="${c}" ${ink(4)}/><rect x="26" y="-30" width="12" height="30" rx="5" fill="${c}" ${ink(4)}/></g>
    <g class="dh-tail"><path d="M-42 -42 Q-64 -56 -58 -78" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M-42 -42 Q-64 -56 -58 -78" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/></g>
    <ellipse cx="0" cy="-40" rx="48" ry="25" fill="${c}" ${ink(5)}/>
    <ellipse cx="-8" cy="-46" rx="16" ry="10" fill="${d}" opacity=".6"/>
    <circle cx="42" cy="-70" r="26" fill="${c}" ${ink(5)}/>
    <ellipse cx="62" cy="-60" rx="15" ry="11" fill="#f6dfc2" ${ink(4)}/>
    <circle cx="74" cy="-64" r="5.5" fill="${INK}"/>
    <path d="M24 -88 Q14 -70 22 -52 Q32 -62 30 -86 Z" fill="${d}" ${ink(4)}/>
    <g class="dh-eyes"><circle cx="48" cy="-76" r="4.5" fill="${INK}"/><circle cx="49.5" cy="-77.5" r="1.5" fill="#fff"/></g>
    <g class="dh-shut"><path d="M43 -76 Q48 -72 53 -76" fill="none" ${ink(3)}/></g>
    <path class="dh-mouth" d="M60 -50 Q66 -46 72 -51" fill="none" ${ink(3)}/>`;
}

export function cat() {
  const c = '#ff9f43', d = '#e07b1a';
  return `<g class="dh-legs"><rect x="-28" y="-26" width="11" height="26" rx="5" fill="${c}" ${ink(4)}/><rect x="-12" y="-26" width="11" height="26" rx="5" fill="${c}" ${ink(4)}/>
      <rect x="8" y="-26" width="11" height="26" rx="5" fill="${c}" ${ink(4)}/><rect x="22" y="-26" width="11" height="26" rx="5" fill="${c}" ${ink(4)}/></g>
    <g class="dh-tail"><path d="M-36 -34 Q-62 -50 -48 -86" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M-36 -34 Q-62 -50 -48 -86" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/></g>
    <ellipse cx="0" cy="-34" rx="40" ry="21" fill="${c}" ${ink(5)}/>
    <path d="M-14 -52 L-10 -40 M-2 -54 L0 -42 M10 -53 L9 -41" ${ink(3)} stroke="${d}"/>
    <path d="M20 -72 L22 -98 L40 -80 Z M44 -80 L58 -98 L58 -70 Z" fill="${c}" ${ink(4)}/>
    <circle cx="40" cy="-60" r="23" fill="${c}" ${ink(5)}/>
    <g class="dh-eyes"><circle cx="32" cy="-64" r="4" fill="${INK}"/><circle cx="50" cy="-64" r="4" fill="${INK}"/></g>
    <g class="dh-shut"><path d="M28 -63 Q32 -59 36 -63 M46 -63 Q50 -59 54 -63" fill="none" ${ink(3)}/></g>
    <path d="M38 -55 L44 -55 L41 -51 Z" fill="#ff7b93"/>
    <path class="dh-mouth" d="M36 -48 Q41 -44 46 -48" fill="none" ${ink(2.5)}/>
    <path d="M22 -52 H8 M22 -48 L9 -44 M58 -52 H72 M58 -48 L71 -44" ${ink(2)}/>`;
}

/* ---------- the house ---------- */
const tiles = (x0, y0, x1, y1, s, c) => {
  let out = '';
  for (let x = x0; x < x1; x += s) out += `<path d="M${x} ${y0} V${y1}" stroke="${c}" stroke-width="2"/>`;
  for (let y = y0; y < y1; y += s) out += `<path d="M${x0} ${y} H${x1}" stroke="${c}" stroke-width="2"/>`;
  return out;
};
const stripes = (x0, y0, x1, y1, s, c) => {
  let out = '';
  for (let x = x0 + s / 2; x < x1; x += s) out += `<rect x="${x}" y="${y0}" width="${s / 2}" height="${y1 - y0}" fill="${c}"/>`;
  return out;
};
const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" class="dh-win" ${ink(5)}/>
  <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" ${ink(4)}/>
  <rect x="${x - 8}" y="${y + h}" width="${w + 16}" height="9" rx="4" fill="#fff" ${ink(4)}/>`;
const ceilLamp = (room, x, y0, y1, c) => `<g data-tap="lamp" data-room="${room}">
  <path d="M${x} ${y0} V${y1}" ${ink(3)}/>
  <circle class="dh-glow" cx="${x}" cy="${y1 + 28}" r="70" fill="url(#dh-glow)"/>
  <path d="M${x - 34} ${y1 + 26} Q${x} ${y1 - 14} ${x + 34} ${y1 + 26} Z" fill="${c}" ${ink(4)}/>
  <circle class="dh-bulb" cx="${x}" cy="${y1 + 28}" r="9" ${ink(3)}/>
  <rect x="${x - 50}" y="${y0}" width="100" height="${y1 - y0 + 60}" fill="transparent"/></g>`;

export const ROOMS = {
  // interior rects; floor = y1. Attic is the triangle under the roof.
  attic: { x0: 215, x1: 1045, y0: 90, y1: 300 },
  bedroom: { x0: 196, x1: 622, y0: 308, y1: 572 },
  bathroom: { x0: 638, x1: 1064, y0: 308, y1: 572 },
  kitchen: { x0: 196, x1: 622, y0: 588, y1: 880 },
  living: { x0: 638, x1: 1064, y0: 588, y1: 880 },
};

export function scene() {
  return `
<defs>
  <linearGradient id="dh-day" gradientUnits="userSpaceOnUse" x1="0" y1="-400" x2="0" y2="880">
    <stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient>
  <linearGradient id="dh-nightg" gradientUnits="userSpaceOnUse" x1="0" y1="-400" x2="0" y2="880">
    <stop offset="0" stop-color="#0d1238"/><stop offset="1" stop-color="#3a3f7a"/></linearGradient>
  <radialGradient id="dh-glow"><stop offset="0" stop-color="#fff3a0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a0" stop-opacity="0"/></radialGradient>
  <clipPath id="dh-tvclip"><rect x="915" y="725" width="110" height="76" rx="6"/></clipPath>
</defs>
<!-- sky -->
<rect x="-4000" y="-4000" width="9400" height="4900" fill="url(#dh-day)"/>
<rect class="dh-nightsky" x="-4000" y="-4000" width="9400" height="4900" fill="url(#dh-nightg)"/>
<g class="dh-stars">${Array.from({ length: 40 }, (_, i) => {
    const x = (i * 211) % 2400 - 500, y = ((i * 137) % 900) - 300;
    return `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff8c0"/>`;
  }).join('')}</g>
<g class="dh-cloud dh-c1"><path d="M0 0 a30 30 0 0 1 50 -20 a40 40 0 0 1 70 10 a25 25 0 0 1 10 45 h-120 a25 25 0 0 1 -10 -35Z" fill="#fff" opacity=".9"/></g>
<g class="dh-cloud dh-c2"><path d="M0 0 a30 30 0 0 1 50 -20 a40 40 0 0 1 70 10 a25 25 0 0 1 10 45 h-120 a25 25 0 0 1 -10 -35Z" fill="#fff" opacity=".8"/></g>
<g data-tap="sky" class="dh-skybtn">
  <circle cx="1290" cy="140" r="95" fill="transparent"/>
  <g class="dh-sun">${Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI / 5;
    return `<path d="M${1290 + Math.cos(a) * 66} ${140 + Math.sin(a) * 66} L${1290 + Math.cos(a) * 88} ${140 + Math.sin(a) * 88}" stroke="#ffb703" stroke-width="10" stroke-linecap="round"/>`;
  }).join('')}<circle cx="1290" cy="140" r="52" fill="#ffd23f" ${ink(5)}/>
    <circle cx="1274" cy="134" r="5" fill="${INK}"/><circle cx="1306" cy="134" r="5" fill="${INK}"/>
    <path d="M1276 152 Q1290 164 1304 152" fill="none" ${ink(4)}/></g>
  <g class="dh-moon"><path d="M1310 82 A60 60 0 1 0 1330 190 A48 48 0 1 1 1310 82 Z" fill="#fff3b0" ${ink(5)}/>
    <path d="M1258 150 Q1266 156 1274 150" fill="none" ${ink(4)}/></g>
</g>
<!-- ground -->
<rect x="-4000" y="880" width="9400" height="4000" fill="#8fd16a"/>
<rect x="-4000" y="880" width="9400" height="14" fill="#6fb84a"/>
<rect class="dh-nightground" x="-4000" y="880" width="9400" height="4000" fill="#0d1238"/>
<!-- left garden: bush + mailbox -->
<g data-tap="mailbox"><rect x="112" y="790" width="10" height="90" fill="#a8693a" ${ink(4)}/>
  <path d="M84 760 H150 V800 H84 Z M84 760 Q117 728 150 760" fill="#ff4d6d" ${ink(5)}/>
  <g class="dh-flag"><path d="M150 790 V746 H170 V760 H156" fill="#ffd23f" ${ink(4)}/></g>
  <rect x="70" y="720" width="100" height="170" fill="transparent"/></g>
<g data-tap="bush"><circle cx="40" cy="850" r="44" fill="#4caf50" ${ink(5)}/><circle cx="80" cy="862" r="30" fill="#5cc160" ${ink(5)}/>
  <circle cx="26" cy="836" r="5" fill="#ff4d6d"/><circle cx="58" cy="830" r="5" fill="#ff4d6d"/></g>
<!-- right garden: tree + flowers -->
<g data-tap="tree" class="dh-tree">
  <rect x="1268" y="680" width="44" height="200" rx="10" fill="#a8693a" ${ink(5)}/>
  <circle cx="1230" cy="640" r="70" fill="#5cc160" ${ink(5)}/><circle cx="1350" cy="640" r="70" fill="#5cc160" ${ink(5)}/>
  <circle cx="1290" cy="580" r="90" fill="#6fd16f" ${ink(5)}/>
  <circle cx="1240" cy="600" r="12" fill="#ff4d6d" ${ink(3)}/><circle cx="1330" cy="560" r="12" fill="#ff4d6d" ${ink(3)}/>
  <circle cx="1290" cy="650" r="12" fill="#ff4d6d" ${ink(3)}/><circle cx="1360" cy="640" r="12" fill="#ff4d6d" ${ink(3)}/>
</g>
${[[1150, '#ff4d6d'], [1200, '#ffd23f'], [1385, '#8338ec']].map(([x, c]) => `<g data-tap="flower" class="dh-flower">
  <path d="M${x} 880 V830" stroke="#3a9a3a" stroke-width="7"/><circle cx="${x}" cy="822" r="18" fill="${c}" ${ink(4)}/><circle cx="${x}" cy="822" r="7" fill="#fff6d0"/>
  <rect x="${x - 30}" y="790" width="60" height="90" fill="transparent"/></g>`).join('')}
<g data-tap="door" class="dh-bell"><rect x="1112" y="770" width="12" height="110" fill="#a8693a" ${ink(3)}/>
  <circle cx="1118" cy="776" r="13" fill="#ffd23f" ${ink(4)}/></g>

<!-- house body -->
<rect x="180" y="300" width="900" height="590" fill="#f2d6ae" ${ink(6)}/>
<rect x="850" y="110" width="56" height="120" fill="#c95d4a" ${ink(5)}/>
<path d="M140 312 L630 48 L1120 312 Z" fill="#e85d4a" ${ink(7)}/>
<clipPath id="dh-atticclip"><path d="M215 300 L630 86 L1045 300 Z"/></clipPath>
<path d="M215 300 L630 86 L1045 300 Z" fill="#f6e2c4"/>
<g clip-path="url(#dh-atticclip)">${stripes(215, 86, 1045, 300, 60, 'rgba(160,110,60,.1)')}</g>
<path d="M215 300 L630 86 L1045 300 Z" fill="none" ${ink(4)}/>

<!-- rooms (wallpaper) -->
<rect x="196" y="308" width="426" height="264" fill="#dbe9ff"/>${stripes(196, 308, 622, 572, 44, 'rgba(255,255,255,.5)')}
<rect x="638" y="308" width="426" height="264" fill="#c9f2ec"/>${tiles(638, 440, 1064, 572, 33, 'rgba(255,255,255,.8)')}
<rect x="196" y="588" width="426" height="292" fill="#fff1c4"/>${tiles(196, 588, 622, 760, 34, 'rgba(240,200,120,.35)')}
<rect x="638" y="588" width="426" height="292" fill="#ffd9e2"/>${stripes(638, 588, 1064, 880, 40, 'rgba(255,255,255,.45)')}
<rect x="196" y="308" width="426" height="264" fill="none" ${ink(4)}/><rect x="638" y="308" width="426" height="264" fill="none" ${ink(4)}/>
<rect x="196" y="588" width="426" height="292" fill="none" ${ink(4)}/><rect x="638" y="588" width="426" height="292" fill="none" ${ink(4)}/>
<rect x="180" y="572" width="900" height="16" fill="#c98a4b" ${ink(4)}/>
<rect x="180" y="864" width="900" height="16" fill="#c98a4b" ${ink(4)}/>
<rect x="215" y="292" width="830" height="16" fill="#c98a4b" ${ink(4)}/>

<!-- attic -->
<circle cx="630" cy="190" r="34" class="dh-win" ${ink(5)}/><path d="M596 190 H664 M630 156 V224" ${ink(4)}/>
${ceilLamp('attic', 430, 186, 214, '#ffd23f')}
<g data-tap="trunk" class="dh-trunk">
  <rect x="740" y="240" width="140" height="56" rx="8" fill="#b5713a" ${ink(5)}/>
  <rect x="740" y="258" width="140" height="10" fill="#8a5426"/>
  <g class="dh-lid"><path d="M740 244 Q740 212 810 212 Q880 212 880 244 Z" fill="#c98a4b" ${ink(5)}/></g>
  <rect x="802" y="250" width="16" height="18" rx="3" fill="#ffd23f" ${ink(3)}/>
  <rect x="730" y="200" width="160" height="100" fill="transparent"/></g>
<g data-tap="spider" class="dh-spider"><path class="dh-thread" d="M330 232 V250" stroke="${INK}" stroke-width="2"/>
  <g class="dh-spiderbody"><circle cx="330" cy="262" r="14" fill="${INK}"/>
  <path d="M318 256 L304 248 M318 262 L302 262 M318 268 L304 276 M342 256 L356 248 M342 262 L358 262 M342 268 L356 276" ${ink(3)}/>
  <circle cx="325" cy="259" r="3.5" fill="#fff"/><circle cx="335" cy="259" r="3.5" fill="#fff"/></g>
  <rect x="295" y="226" width="70" height="70" fill="transparent"/></g>

<!-- bedroom -->
${win(500, 335, 96, 84)}
<rect x="210" y="410" width="22" height="162" rx="6" fill="#a8693a" ${ink(5)}/>
<rect x="214" y="530" width="268" height="26" rx="6" fill="#a8693a" ${ink(5)}/>
<rect x="232" y="498" width="246" height="34" rx="10" fill="#fff" ${ink(4)}/>
<ellipse cx="275" cy="490" rx="40" ry="16" fill="#fff6d0" ${ink(4)}/>
<rect x="470" y="545" width="12" height="27" fill="#a8693a" ${ink(3)}/>
<g data-tap="lamp" data-room="bedroom">
  <rect x="496" y="512" width="72" height="60" rx="6" fill="#ffc6df" ${ink(5)}/>
  <circle class="dh-glow" cx="532" cy="470" r="70" fill="url(#dh-glow)"/>
  <rect x="528" y="478" width="8" height="34" fill="${INK}"/>
  <path d="M506 482 L516 448 H548 L558 482 Z" fill="#ffd23f" ${ink(4)}/>
  <rect x="490" y="430" width="84" height="142" fill="transparent"/></g>

<!-- bathroom -->
<g data-tap="mirror"><rect x="996" y="372" width="56" height="72" rx="20" fill="#e9fbff" ${ink(4)}/>
  <path d="M1008 390 L1022 380 M1008 404 L1032 386" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>
<g data-tap="sink"><rect x="1012" y="494" width="24" height="78" fill="#fff" ${ink(4)}/>
  <path d="M990 474 H1058 Q1056 500 1024 500 Q992 500 990 474 Z" fill="#fff" ${ink(4)}/>
  <path d="M1022 474 V458 H1034" fill="none" ${ink(4)}/>
  <rect class="dh-sinkwater" x="1029" y="462" width="6" height="14" rx="3" fill="#6ec6ff"/>
  <rect x="984" y="440" width="80" height="132" fill="transparent"/></g>
<g data-tap="toilet" class="dh-toilet">
  <rect x="932" y="418" width="44" height="62" rx="6" fill="#fff" ${ink(4)}/>
  <rect x="954" y="428" width="16" height="6" rx="3" fill="#bbb" ${ink(2)}/>
  <path d="M884 484 H968 Q966 528 926 530 Q888 528 884 484 Z" fill="#fff" ${ink(4)}/>
  <path d="M906 528 L912 572 H944 L950 528" fill="#fff" ${ink(4)}/>
  <ellipse class="dh-swirl" cx="926" cy="490" rx="30" ry="5" fill="#6ec6ff"/>
  <rect x="876" y="410" width="104" height="162" fill="transparent"/></g>
${ceilLamp('bathroom', 760, 308, 336, '#2ec4b6')}
<g data-tap="bath">
  <ellipse cx="757" cy="472" rx="100" ry="10" fill="#9fd9ef" ${ink(4)}/>
  <path d="M844 472 V424 Q844 410 830 410 H816" fill="none" stroke="#bbb" stroke-width="9" stroke-linecap="round"/>
  <rect class="dh-tapwater" x="811" y="414" width="10" height="58" rx="4" fill="#6ec6ff"/>
</g>

<!-- kitchen -->
${win(470, 625, 120, 90)}
<g data-tap="fridge" class="dh-fridge">
  <rect x="206" y="680" width="96" height="190" rx="10" fill="#f4f7fb" ${ink(5)}/>
  <g class="dh-fridgein"><rect x="214" y="690" width="80" height="170" rx="6" fill="#dff3ff"/>
    <path d="M214 740 H294 M214 795 H294" ${ink(3)}/>
    <text x="236" y="732" font-size="34" text-anchor="middle">🧀</text><text x="272" y="732" font-size="34" text-anchor="middle">🥛</text>
    <text x="236" y="787" font-size="34" text-anchor="middle">🍎</text><text x="272" y="787" font-size="34" text-anchor="middle">🥕</text>
    <text x="254" y="845" font-size="38" text-anchor="middle">🍉</text></g>
  <g class="dh-fridgedoor"><rect x="206" y="680" width="96" height="190" rx="10" fill="#f4f7fb" ${ink(5)}/>
    <path d="M206 740 H302" ${ink(4)}/><rect x="286" y="700" width="8" height="28" rx="4" fill="#bbb" ${ink(2)}/><rect x="286" y="756" width="8" height="40" rx="4" fill="#bbb" ${ink(2)}/>
    <circle cx="230" cy="776" r="10" fill="#ff4d6d" ${ink(2)}/><rect x="244" y="790" width="22" height="16" fill="#ffd23f" ${ink(2)}/></g>
</g>
<g data-tap="oven" class="dh-oven">
  <rect x="318" y="770" width="120" height="100" rx="8" fill="#fff" ${ink(5)}/>
  <rect class="dh-ovenwin" x="334" y="800" width="88" height="54" rx="6" fill="#4a3b5c" ${ink(4)}/>
  <circle cx="346" cy="784" r="6" fill="#bbb" ${ink(2)}/><circle cx="410" cy="784" r="6" fill="#bbb" ${ink(2)}/>
  <rect x="340" y="744" width="76" height="26" rx="6" fill="#ff4d6d" ${ink(4)}/><rect x="330" y="740" width="96" height="8" rx="4" fill="#ff7b93" ${ink(3)}/>
  <g class="dh-steam"><path d="M362 730 q-8 -14 0 -26 q8 -12 0 -24 M394 730 q-8 -14 0 -26 q8 -12 0 -24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>
  <rect x="312" y="680" width="132" height="190" fill="transparent"/></g>
<rect x="452" y="802" width="160" height="14" rx="5" fill="#c98a4b" ${ink(4)}/>
<rect x="464" y="816" width="12" height="54" fill="#a8693a" ${ink(3)}/><rect x="588" y="816" width="12" height="54" fill="#a8693a" ${ink(3)}/>
<rect x="318" y="650" width="110" height="10" rx="4" fill="#c98a4b" ${ink(3)}/>
<g data-tap="radio" class="dh-radio">
  <rect x="334" y="604" width="78" height="46" rx="10" fill="#8338ec" ${ink(4)}/><circle cx="356" cy="627" r="13" fill="#d9c9ff" ${ink(3)}/>
  <rect x="380" y="616" width="22" height="6" rx="3" fill="#ffd23f"/><rect x="380" y="630" width="22" height="6" rx="3" fill="#ffd23f"/>
  <path d="M400 604 L414 584" ${ink(3)}/>
  <rect x="318" y="580" width="110" height="80" fill="transparent"/></g>
${ceilLamp('kitchen', 540, 588, 616, '#ff8a00')}

<!-- living room -->
<g data-tap="picture"><rect x="690" y="630" width="90" height="70" rx="4" fill="#fff" ${ink(5)}/>
  <rect x="700" y="640" width="70" height="50" fill="#bfe6ff"/><path d="M700 690 L726 660 L744 678 L756 666 L770 690 Z" fill="#6fd16f" ${ink(2)}/>
  <circle cx="756" cy="652" r="7" fill="#ffd23f"/></g>
<g class="dh-sofa">
  <rect x="656" y="752" width="220" height="64" rx="20" fill="#ef476f" ${ink(5)}/>
  <rect x="650" y="808" width="232" height="40" rx="12" fill="#ff6b8b" ${ink(5)}/>
  <rect x="644" y="790" width="34" height="62" rx="14" fill="#ef476f" ${ink(5)}/><rect x="854" y="790" width="34" height="62" rx="14" fill="#ef476f" ${ink(5)}/>
  <rect x="664" y="848" width="12" height="22" fill="#a8693a" ${ink(3)}/><rect x="856" y="848" width="12" height="22" fill="#a8693a" ${ink(3)}/></g>
<g data-tap="tv">
  <rect x="930" y="810" width="12" height="60" fill="${INK}"/><rect x="998" y="810" width="12" height="60" fill="${INK}"/>
  <rect x="904" y="714" width="132" height="98" rx="12" fill="#5a4b6c" ${ink(5)}/>
  <rect x="915" y="725" width="110" height="76" rx="6" fill="#1f1a2e"/>
  <g class="dh-tvscreen" clip-path="url(#dh-tvclip)"></g>
  <rect x="896" y="700" width="148" height="170" fill="transparent"/></g>
${ceilLamp('living', 770, 588, 616, '#3a86ff')}
<!-- front door (right wall) -->
<rect x="1056" y="728" width="34" height="140" fill="#3b2a4a"/>
<g class="dh-visitor"></g>
<g data-tap="door"><g class="dh-door"><rect x="1052" y="726" width="44" height="144" rx="4" fill="#06a77d" ${ink(5)}/>
  <circle cx="1062" cy="800" r="5" fill="#ffd23f" ${ink(2)}/><rect x="1060" y="740" width="28" height="36" rx="3" fill="#7fe3c5" ${ink(2)}/></g>
  <rect x="1040" y="720" width="70" height="150" fill="transparent"/></g>
`;
}

/* things drawn IN FRONT of the characters: bath front, duvet, room darkness overlays */
export function fronts() {
  return `
<g data-tap="bath" class="dh-bathfront">
  <g class="dh-bathwater"><rect x="664" y="452" width="186" height="22" rx="10" fill="#8fd8ff" opacity=".85"/>
    ${[680, 712, 744, 780, 812, 836].map((x, i) => `<circle cx="${x}" cy="${452 - (i % 2) * 8}" r="${10 + (i % 3) * 3}" fill="#fff" ${ink(2)} opacity=".95"/>`).join('')}</g>
  <path d="M654 470 H860 Q860 556 790 556 H724 Q654 556 654 470 Z" fill="#fff" ${ink(5)}/>
  <path d="M676 484 Q680 530 720 540" fill="none" stroke="#e5f6ff" stroke-width="8" stroke-linecap="round"/>
  <path d="M690 556 L682 572 M826 556 L834 572" stroke="#ffd23f" stroke-width="10" stroke-linecap="round"/>
</g>
<g class="dh-duvet"><path d="M318 494 Q300 494 300 510 V540 H478 V510 Q478 494 462 494 Z" fill="#8ecae6" ${ink(5)}/>
  ${[330, 370, 410, 450].map(x => `<circle cx="${x}" cy="518" r="7" fill="#fff" opacity=".8"/>`).join('')}</g>
<rect class="dh-dark" data-room="bedroom" x="196" y="308" width="426" height="264"/>
<rect class="dh-dark" data-room="bathroom" x="638" y="308" width="426" height="264"/>
<rect class="dh-dark" data-room="kitchen" x="196" y="588" width="426" height="276"/>
<rect class="dh-dark" data-room="living" x="638" y="588" width="426" height="276"/>
<path class="dh-dark" data-room="attic" d="M215 300 L630 86 L1045 300 Z"/>
`;
}
