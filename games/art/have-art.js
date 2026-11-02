/* SVG art for Plant en have. Every plant is drawn standing on the soil at (0,0) and growing upwards,
 * in five stages: 0 seed mound, 1 sprout, 2 young plant, 3 bud / green fruit, 4 ready to pick.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const LEAF = '#6cc04a';

const leaf = (x, y, rot, s = 40, c = LEAF) =>
  `<path d="M0 0 Q${s * 0.5} ${-s * 0.38} ${s} 0 Q${s * 0.5} ${s * 0.38} 0 0 Z" transform="translate(${x} ${y}) rotate(${rot})" fill="${c}" ${ink(3)}/>`;
const stem = (h, w = 7) => `<path d="M0 0 Q4 ${-h / 2} 0 ${-h}" fill="none" stroke="${INK}" stroke-width="${w + 6}" stroke-linecap="round"/>
  <path d="M0 0 Q4 ${-h / 2} 0 ${-h}" fill="none" stroke="#4caf50" stroke-width="${w}" stroke-linecap="round"/>`;
const mound = `<path d="M-46 6 Q0 -34 46 6 Z" fill="#b97a4c" ${ink(4)}/><circle cx="-14" cy="-6" r="3" fill="#8d5a3b"/><circle cx="10" cy="-10" r="3" fill="#8d5a3b"/>`;
// little stake with the seed picture, shown while the plant is small
export const sign = emoji => `<g transform="translate(52 0)"><path d="M0 4 V-56" stroke="#c98a4b" stroke-width="7" stroke-linecap="round"/>
  <rect x="-24" y="-96" width="48" height="42" rx="8" fill="#fff8ec" ${ink(3)}/><text x="0" y="-62" font-size="30" text-anchor="middle">${emoji}</text></g>`;
const face = (x, y, k = 1) => `<g class="hv-eyes"><circle cx="${x - 9 * k}" cy="${y}" r="${3.6 * k}" fill="${INK}"/><circle cx="${x + 9 * k}" cy="${y}" r="${3.6 * k}" fill="${INK}"/></g>
  <path d="M${x - 7 * k} ${y + 8 * k} Q${x} ${y + 14 * k} ${x + 7 * k} ${y + 8 * k}" fill="none" ${ink(2.5 * k)}/>`;
const sprout = h => stem(h, 6) + leaf(0, -h, -150, 30) + leaf(0, -h, -30, 30);

function flowerHead(x, y, col, r = 18) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = i * Math.PI / 3;
    return `<circle cx="${x + Math.cos(a) * r * 1.25}" cy="${y + Math.sin(a) * r * 1.25}" r="${r}" fill="${col}" ${ink(3)}/>`;
  }).join('') + `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd23f" ${ink(3)}/>` + face(x, y - 2, 0.9);
}
const strawberry = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 30 Q-22 10 -18 -6 Q-10 -16 0 -10 Q10 -16 18 -6 Q22 10 0 30 Z" fill="#ff3b5c" ${ink(3)}/>
  <path d="M-10 -12 L0 -4 L10 -12 L4 -14 L0 -20 L-4 -14 Z" fill="${LEAF}" ${ink(2.5)}/>
  <circle cx="-7" cy="2" r="1.6" fill="#ffe6a6"/><circle cx="6" cy="4" r="1.6" fill="#ffe6a6"/><circle cx="0" cy="14" r="1.6" fill="#ffe6a6"/></g>`;
const clover = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${leaf(0, 0, -90, 34)}${leaf(0, 0, -160, 34)}${leaf(0, 0, -20, 34)}</g>`;
const pumpkin = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -58 Q-4 -76 8 -84" fill="none" stroke="#6b8e23" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="-30" cy="-28" rx="36" ry="30" fill="${col}" ${ink(4)}/><ellipse cx="30" cy="-28" rx="36" ry="30" fill="${col}" ${ink(4)}/>
  <ellipse cx="0" cy="-30" rx="34" ry="32" fill="${col}" ${ink(4)}/></g>`;

export const PLANTS = {
  blomst: { name: 'Blomst', emoji: '🌷', critter: true, head: 170, draw(stage, col) {
    if (stage === 0) return mound;
    if (stage === 1) return mound + sprout(36);
    if (stage === 2) return mound + stem(100) + leaf(0, -40, -150) + leaf(0, -60, -30) + leaf(0, -100, -120, 26) + leaf(0, -100, -60, 26);
    const top = stem(170) + leaf(0, -50, -150, 46) + leaf(0, -80, -30, 46);
    if (stage === 3) return mound + top + `<ellipse cx="0" cy="-182" rx="16" ry="24" fill="#8ed16a" ${ink(3)}/><path d="M-8 -200 Q0 -214 8 -200" fill="${col}" ${ink(2.5)}/>`;
    return mound + top + flowerHead(0, -180, col, 20);
  } },
  solsikke: { name: 'Solsikke', emoji: '🌻', critter: true, head: 290, draw(stage) {
    if (stage === 0) return mound;
    if (stage === 1) return mound + sprout(44);
    if (stage === 2) return mound + stem(130, 9) + leaf(0, -50, -155, 52) + leaf(0, -80, -25, 52) + leaf(0, -130, -130, 34) + leaf(0, -130, -50, 34);
    const top = stem(280, 11) + leaf(0, -70, -160, 70) + leaf(0, -120, -20, 70) + leaf(0, -190, -150, 56) + leaf(0, -220, -30, 50);
    if (stage === 3) return mound + top + `<circle cx="0" cy="-290" r="30" fill="#8ed16a" ${ink(4)}/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M0 -290 l0 -36" stroke="#8ed16a" stroke-width="12" stroke-linecap="round" transform="rotate(${i * 45} 0 -290)"/>`).join('');
    return mound + top + Array.from({ length: 14 }, (_, i) =>
      `<ellipse cx="0" cy="-350" rx="16" ry="30" fill="#ffd23f" ${ink(3)} transform="rotate(${i * 360 / 14} 0 -290)"/>`).join('') +
      `<circle cx="0" cy="-290" r="40" fill="#8a5a3b" ${ink(4)}/>` +
      Array.from({ length: 10 }, (_, i) => `<circle cx="${Math.cos(i * 2.4) * (8 + i * 2.6)}" cy="${-290 + Math.sin(i * 2.4) * (8 + i * 2.6)}" r="2.5" fill="#5a3a22"/>`).join('') +
      `<g transform="translate(0 -6)">${face(0, -290, 1.4)}</g>`;
  } },
  gulerod: { name: 'Gulerod', emoji: '🥕', head: 90, draw(stage) {
    if (stage === 0) return mound;
    const fronds = (h, n) => Array.from({ length: n }, (_, i) => {
      const a = -90 + (i - (n - 1) / 2) * 22;
      return leaf(0, -4, a, h, '#5bb043');
    }).join('');
    if (stage === 1) return mound + fronds(34, 3);
    if (stage === 2) return mound + fronds(60, 5);
    const top = `<ellipse cx="0" cy="0" rx="${stage === 3 ? 16 : 26}" ry="${stage === 3 ? 9 : 14}" fill="#ff8a00" ${ink(4)}/>`;
    return mound + fronds(stage === 3 ? 80 : 100, 7) + top + (stage === 4 ? face(0, -2, 0.8) : '');
  } },
  jordbaer: { name: 'Jordbær', emoji: '🍓', critter: true, head: 90, draw(stage) {
    if (stage === 0) return mound;
    if (stage === 1) return mound + sprout(30);
    const bush = clover(-30, -30, 1.1) + clover(30, -34, 1.1) + clover(0, -60, 1.2) + clover(-14, -14, .9) + clover(16, -12, .9);
    if (stage === 2) return mound + clover(-20, -20) + clover(20, -24) + clover(0, -40);
    if (stage === 3) return mound + bush + [[-40, -70], [36, -76], [0, -96]].map(([x, y]) =>
      Array.from({ length: 5 }, (_, i) => `<circle cx="${x + Math.cos(i * 1.256) * 9}" cy="${y + Math.sin(i * 1.256) * 9}" r="7" fill="#fff" ${ink(2)}/>`).join('') +
      `<circle cx="${x}" cy="${y}" r="5" fill="#ffd23f"/>`).join('');
    return mound + bush + strawberry(-42, -40, 1.2) + strawberry(40, -46, 1.3) + strawberry(2, -16, 1.4) + `<g transform="translate(2 -14)">${face(0, 0, 0.6)}</g>`;
  } },
  graeskar: { name: 'Græskar', emoji: '🎃', head: 110, draw(stage) {
    if (stage === 0) return mound;
    if (stage === 1) return mound + sprout(30);
    const vine = `<path d="M-90 -6 Q-40 -30 0 -10 Q40 6 90 -10" fill="none" stroke="#4caf50" stroke-width="7" stroke-linecap="round"/>` +
      leaf(-80, -8, -120, 46) + leaf(-30, -20, -70, 50) + leaf(40, -6, -60, 46) + leaf(84, -12, -30, 40);
    if (stage === 2) return mound + vine;
    if (stage === 3) return mound + vine + pumpkin(0, 0, 0.45, '#8ed16a');
    return mound + vine + pumpkin(0, 4, 1.15, '#ff8a00') + `<g transform="translate(0 -40)">${face(0, 0, 1.5)}</g>`;
  } },
};
export const SEEDS = ['blomst', 'solsikke', 'gulerod', 'jordbaer', 'graeskar'];
export const FLOWER_COLS = ['#ff4d6d', '#ff8fab', '#8338ec', '#3a86ff', '#ff8a00', '#f15bb5'];

export const packet = (type, col) => `<g class="hv-packet-in">
  <rect x="-62" y="-80" width="124" height="160" rx="14" fill="#fff8ec" ${ink(5)}/>
  <rect x="-62" y="-80" width="124" height="40" rx="14" fill="${col}" ${ink(5)}/>
  <path d="M-50 -80 l8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10" fill="none" ${ink(3)}/>
  <text x="0" y="40" font-size="76" text-anchor="middle">${PLANTS[type].emoji}</text>
  <circle cx="-36" cy="-60" r="4" fill="#fff"/><circle cx="-22" cy="-56" r="4" fill="#fff"/><circle cx="36" cy="-60" r="4" fill="#fff"/></g>`;
export const SEED_COLS = { blomst: '#ff8fab', solsikke: '#ffb703', gulerod: '#ff8a00', jordbaer: '#e63946', graeskar: '#06a77d' };

// watering can facing left; spout tip at about (-132,-52)
export const CAN = `<g class="hv-can-in">
  <path d="M-120 -54 L-52 -10 L-52 18 L-132 -36 Z" fill="#3a86ff" ${ink(4)}/>
  <ellipse cx="-128" cy="-48" rx="11" ry="20" transform="rotate(-35 -128 -48)" fill="#6aa8ff" ${ink(4)}/>
  <path d="M-40 -52 Q0 -124 40 -52" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M-40 -52 Q0 -124 40 -52" fill="none" stroke="#3a86ff" stroke-width="11" stroke-linecap="round"/>
  <path d="M-62 -52 H62 V50 Q62 68 44 68 H-44 Q-62 68 -62 50 Z" fill="#3a86ff" ${ink(5)}/>
  <ellipse cx="0" cy="-52" rx="62" ry="12" fill="#2a6ad8" ${ink(4)}/>
  ${Array.from({ length: 5 }, (_, i) => `<circle cx="${Math.cos(i * 1.256) * 13}" cy="${10 + Math.sin(i * 1.256) * 13}" r="9" fill="#fff"/>`).join('')}
  <circle cx="0" cy="10" r="7" fill="#ffd23f"/></g>`;
export const CAN_TIP = [-134, -54];

export const BASKET_BACK = `<path d="M-96 -40 Q0 -180 96 -40" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="M-96 -40 Q0 -180 96 -40" fill="none" stroke="#c98a4b" stroke-width="13" stroke-linecap="round"/>`;
export const BASKET_FRONT = `<path d="M-118 -44 H118 L96 66 Q0 80 -96 66 Z" fill="#d9a066" ${ink(5)}/>
  <path d="M-112 -10 Q0 4 112 -10 M-104 26 Q0 40 104 26" fill="none" stroke="#b9824c" stroke-width="5"/>
  ${[-70, -35, 0, 35, 70].map(x => `<path d="M${x} -40 L${x * 0.85} 70" stroke="#b9824c" stroke-width="5"/>`).join('')}
  <rect x="-124" y="-54" width="248" height="22" rx="11" fill="#c98a4b" ${ink(4)}/>`;

export const SUN = `<g class="hv-rays">${Array.from({ length: 12 }, (_, i) =>
  `<path d="M0 -88 V-118" stroke="#ffb703" stroke-width="12" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join('')}</g>
  <circle r="66" fill="#ffd23f" ${ink(5)}/>
  <circle cx="-38" cy="14" r="10" fill="#ff8fab" opacity=".6"/><circle cx="38" cy="14" r="10" fill="#ff8fab" opacity=".6"/>
  <g class="hv-eyes"><circle cx="-20" cy="-10" r="7" fill="${INK}"/><circle cx="20" cy="-10" r="7" fill="${INK}"/></g>
  <path d="M-22 14 Q0 34 22 14" fill="none" ${ink(5)}/>`;

export const BEE = `<g class="hv-wings"><ellipse cx="-6" cy="-20" rx="12" ry="18" fill="#e8f6ff" opacity=".9" ${ink(2.5)}/>
  <ellipse cx="8" cy="-18" rx="10" ry="15" fill="#e8f6ff" opacity=".9" ${ink(2.5)}/></g>
  <ellipse cx="0" cy="0" rx="26" ry="18" fill="#ffd23f" ${ink(3.5)}/>
  <path d="M-8 -16 V16 M6 -17 V17" stroke="${INK}" stroke-width="7"/>
  <circle cx="-18" cy="-3" r="3.5" fill="${INK}"/><path d="M26 0 l9 0" ${ink(3)}/>`;
export const BUTTERFLY = col => `<g class="hv-wings">
  <path d="M0 0 Q-30 -40 -38 -14 Q-40 6 0 0 Z" fill="${col}" ${ink(3)}/><path d="M0 0 Q30 -40 38 -14 Q40 6 0 0 Z" fill="${col}" ${ink(3)}/>
  <path d="M0 0 Q-28 26 -16 30 Q-4 30 0 0 Z" fill="${col}" ${ink(3)}/><path d="M0 0 Q28 26 16 30 Q4 30 0 0 Z" fill="${col}" ${ink(3)}/>
  <circle cx="-22" cy="-14" r="5" fill="#fff"/><circle cx="22" cy="-14" r="5" fill="#fff"/></g>
  <ellipse cx="0" cy="4" rx="5" ry="18" fill="${INK}"/><path d="M-2 -12 Q-8 -26 -14 -28 M2 -12 Q8 -26 14 -28" fill="none" ${ink(2.5)}/>`;
