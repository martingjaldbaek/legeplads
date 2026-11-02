/* Backdrop for Lyd-zoo: one long SVG landscape in a 1000-unit-high box, plus a far-hills layer for parallax.
 * Sections (x in units): farm 0–2000, pond 2000–3000, town 3000–5600, station 5600–6800, beach 6800–8200, zoo 8200–WORLD.
 */
export const WORLD = 9700;
const INK = '#4a3b5c';
const o = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function house(x, w, h, wall, roof, door = true) {
  const top = 840 - h;
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${wall}" ${o(6)}/>
    <path d="M${x - 24} ${top + 4} L${x + w / 2} ${top - h * .55} L${x + w + 24} ${top + 4} Z" fill="${roof}" ${o(6)}/>`;
  const win = (wx, wy) => `<rect x="${wx}" y="${wy}" width="56" height="56" rx="6" fill="#bfe8ff" ${o(5)}/>
    <path d="M${wx + 28} ${wy} V${wy + 56} M${wx} ${wy + 28} H${wx + 56}" ${o(4)}/>`;
  s += win(x + 26, top + 34) + win(x + w - 82, top + 34);
  if (!door) s += win(x + w / 2 - 28, top + h - 100);
  return s;
}

export function backdrop() {
  let s = '';
  // ground: grass for farm, pond and town; sand for the beach; jungle green for the zoo
  s += `<rect x="0" y="740" width="6800" height="260" fill="#8fd16a"/>
    <rect x="6800" y="740" width="1400" height="260" fill="#f6dc9a"/>
    <rect x="8200" y="740" width="${WORLD - 8200}" height="260" fill="#7cc35e"/>
    <path d="M0 742 ${Array.from({ length: 68 }, (_, i) => `Q${i * 100 + 50} 728 ${i * 100 + 100} 742`).join(' ')}" fill="none" stroke="#6fb34c" stroke-width="8"/>`;
  // farm: barn, fence, hay, flowers
  s += `<g><rect x="80" y="520" width="300" height="320" fill="#d64545" ${o(7)}/>
    <path d="M60 530 L230 380 L400 530 Z" fill="#a83232" ${o(7)}/>
    <rect x="170" y="640" width="120" height="200" fill="#fff3d6" ${o(6)}/>
    <path d="M170 640 L290 840 M290 640 L170 840" ${o(6)}/>
    <circle cx="230" cy="470" r="30" fill="#fff3d6" ${o(5)}/></g>`;
  for (let x = 1120; x <= 1480; x += 60) s += `<rect x="${x}" y="660" width="22" height="130" rx="5" fill="#e0a96d" ${o(4)}/>`;
  s += `<rect x="1100" y="690" width="400" height="18" rx="6" fill="#e0a96d" ${o(4)}/><rect x="1100" y="740" width="400" height="18" rx="6" fill="#e0a96d" ${o(4)}/>`;
  s += `<ellipse cx="1700" cy="830" rx="70" ry="45" fill="#ffd166" ${o(5)}/>`;
  for (let i = 0; i < 26; i++) {
    const x = 60 + i * 110 + (i * 37) % 50, y = 900 + (i * 53) % 70, c = ['#ff4d6d', '#ffd23f', '#ffffff', '#c77dff'][i % 4];
    if (x > 2080 && x < 2920) continue;
    s += `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/><circle cx="${x}" cy="${y}" r="4" fill="#ffb703"/>`;
  }
  // pond with reeds and lily pads
  s += `<ellipse cx="2500" cy="880" rx="420" ry="90" fill="#4cc9f0" ${o(6)}/>
    <ellipse cx="2440" cy="870" rx="300" ry="50" fill="none" stroke="#9be7ff" stroke-width="6" opacity=".7"/>
    <ellipse cx="2660" cy="895" rx="60" ry="18" fill="#5cb85c" ${o(4)}/>
    <ellipse cx="2280" cy="905" rx="45" ry="14" fill="#5cb85c" ${o(4)}/>`;
  for (const x of [2100, 2125, 2880, 2905]) s += `<path d="M${x} 870 Q${x - 10} 760 ${x + 6} 700" fill="none" stroke="#3f8f3a" stroke-width="9" stroke-linecap="round"/><ellipse cx="${x + 6}" cy="715" rx="9" ry="28" fill="#8b5a2b"/>`;
  // town: houses, sidewalk, road
  s += house(3020, 300, 300, '#ffd6a5', '#e76f51') + house(3560, 260, 260, '#bde0fe', '#457b9d', false)
    + house(4880, 260, 250, '#ffc8dd', '#9d4edd', false);
  s += `<rect x="4060" y="560" width="200" height="280" fill="#ffe8a3" ${o(6)}/><path d="M4040 566 L4160 470 L4280 566 Z" fill="#06a77d" ${o(6)}/>
    <rect x="4100" y="700" width="120" height="140" fill="#bfe8ff" ${o(5)}/><text x="4160" y="650" font-size="56" text-anchor="middle" font-weight="800" fill="${INK}">BAGER</text>`;
  s += `<rect x="3000" y="840" width="2600" height="40" fill="#e3dccf"/><rect x="3000" y="880" width="2600" height="110" fill="#6b6f80"/>`;
  for (let x = 3020; x < 5600; x += 140) s += `<rect x="${x}" y="930" width="80" height="12" rx="6" fill="#fff" opacity=".85"/>`;
  // clock post
  s += `<rect x="4793" y="690" width="14" height="150" fill="#555" ${o(3)}/>`;
  // station: platform, rails, little station house
  s += `<rect x="5640" y="580" width="320" height="260" fill="#f4a261" ${o(6)}/><path d="M5610 590 L5800 470 L5990 590 Z" fill="#7b2cbf" ${o(6)}/>
    <rect x="5750" y="720" width="100" height="120" fill="#fff3d6" ${o(5)}/><circle cx="5800" cy="650" r="34" fill="#fff" ${o(5)}/><path d="M5800 650 V628 M5800 650 H5818" ${o(4)}/>
    <rect x="5600" y="840" width="1200" height="40" fill="#c9b79c" ${o(4)}/>`;
  for (let x = 5600; x < 6800; x += 50) s += `<rect x="${x}" y="895" width="24" height="60" fill="#8b5a2b"/>`;
  s += `<rect x="5600" y="902" width="1200" height="10" fill="#777"/><rect x="5600" y="940" width="1200" height="10" fill="#777"/>`;
  // beach and sea
  s += `<path d="M7300 740 H8200 V1000 H7300 Z" fill="#3aa6e0"/>
    <path d="M7300 760 ${Array.from({ length: 9 }, (_, i) => `q50 -24 100 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="8" opacity=".8"/>
    <path d="M7300 850 ${Array.from({ length: 9 }, (_, i) => `q50 -20 100 0`).join(' ')}" fill="none" stroke="#bfe8ff" stroke-width="6" opacity=".7"/>
    <ellipse cx="6990" cy="850" rx="70" ry="20" fill="#ff8fab" ${o(4)}/><path d="M6990 850 V700" ${o(6)}/><path d="M6900 720 Q6990 640 7080 720 Z" fill="#ff4d6d" ${o(5)}/>`;
  // zoo fence
  for (let x = 8240; x < WORLD; x += 70) s += `<rect x="${x}" y="760" width="16" height="90" rx="4" fill="#b08968"/>`;
  s += `<rect x="8220" y="780" width="${WORLD - 8220}" height="14" fill="#b08968"/>`;
  return s;
}

// far hills, drawn wider than needed; scrolled at half speed
export function hills(width) {
  let d = `M0 760 `;
  for (let x = 0; x < width; x += 500) d += `Q${x + 125} ${560 + (x * 7) % 90} ${x + 250} 640 Q${x + 375} ${600 + (x * 3) % 70} ${x + 500} 700 `;
  d += `V1000 H0 Z`;
  let s = `<path d="${d}" fill="#b6e3a0"/>`;
  for (let x = 300; x < width; x += 900) s += `<g opacity=".9"><ellipse cx="${x}" cy="${180 + (x * 13) % 120}" rx="110" ry="40" fill="#fff"/><ellipse cx="${x + 60}" cy="${160 + (x * 13) % 120}" rx="70" ry="45" fill="#fff"/></g>`;
  return s;
}
