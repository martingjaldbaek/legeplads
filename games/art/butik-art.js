/* SVG art for Lege-butik. Every piece is drawn around a local origin (mostly bottom-centre) so the game can
 * place it for landscape or portrait.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export function shelf(w, h, rows) {
  let s = `<rect x="0" y="0" width="${w}" height="${h}" rx="14" fill="#f7d9a8" ${ink(6)}/>
    <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="8" fill="#fbe6c2"/>`;
  for (let r = 0; r < rows; r++) {
    const y = (h * (r + 1)) / rows - 22;
    s += `<rect x="6" y="${y}" width="${w - 12}" height="22" rx="6" fill="#c98a4b" ${ink(5)}/>`;
  }
  return s;
}

export const BASKET_BACK = `<path d="M-100 -118 Q0 -230 100 -118" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M-100 -118 Q0 -230 100 -118" fill="none" stroke="#ff4d6d" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="0" cy="-118" rx="120" ry="16" fill="#8a5426" ${ink(5)}/>`;
export const BASKET_FRONT = `<path d="M-122 -118 H122 L102 -4 Q100 0 94 0 H-94 Q-100 0 -102 -4 Z" fill="#e0a96d" ${ink(6)}/>
  ${[-80, -40, 0, 40, 80].map(x => `<path d="M${x} -112 L${x * 0.83} -6" stroke="#c98a4b" stroke-width="7"/>`).join('')}
  <path d="M-116 -78 H116 M-110 -40 H110" stroke="#c98a4b" stroke-width="7"/>
  <rect x="-128" y="-128" width="256" height="20" rx="10" fill="#ff4d6d" ${ink(5)}/>`;

export const COUNTER = (w, h) => `<rect x="0" y="0" width="${w}" height="${h}" fill="#3a86ff" ${ink(6)}/>
  ${Array.from({ length: Math.floor(w / 60) }, (_, i) => `<rect x="${20 + i * 60}" y="22" width="30" height="${h - 22}" fill="#5c9dff"/>`).join('')}
  <rect x="-10" y="-14" width="${w + 20}" height="26" rx="8" fill="#ffd23f" ${ink(6)}/>`;

// shopkeeper, origin at the counter top, centre; hand reaching left, palm up
export const KEEPER = `<g class="bk-keeper">
  <path d="M-80 0 V-140 Q-80 -178 -40 -178 H40 Q80 -178 80 -140 V0 Z" fill="#06a77d" ${ink(6)}/>
  <path d="M-46 0 V-120 H46 V0 Z" fill="#fff" ${ink(5)}/>
  <circle cx="0" cy="-100" r="6" fill="#ff4d6d"/>
  <path d="M60 -150 Q100 -100 82 -40" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
  <path d="M60 -150 Q100 -100 82 -40" fill="none" stroke="#06a77d" stroke-width="20" stroke-linecap="round"/>
  <g class="bk-arm"><path d="M-62 -150 Q-110 -176 -150 -172" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
    <path d="M-62 -150 Q-110 -176 -150 -172" fill="none" stroke="#06a77d" stroke-width="20" stroke-linecap="round"/>
    <path d="M-196 -176 Q-196 -150 -160 -150 Q-130 -150 -128 -176 Z" fill="#ffd9b8" ${ink(5)}/>
    <path d="M-196 -176 Q-204 -190 -196 -196" fill="none" ${ink(5)}/>
    <g class="bk-handcoins"></g></g>
  <rect x="-16" y="-200" width="32" height="26" fill="#ffd9b8" ${ink(4)}/>
  <circle cx="0" cy="-250" r="58" fill="#ffd9b8" ${ink(6)}/>
  <path d="M-60 -258 Q-62 -320 0 -318 Q62 -320 60 -258 Q50 -290 0 -290 Q-50 -290 -60 -258 Z" fill="#6b3e26" ${ink(5)}/>
  <path d="M-64 -286 Q0 -340 64 -286 L70 -276 H-70 Z" fill="#06a77d" ${ink(5)}/>
  <path d="M-70 -276 H-104 Q-104 -268 -70 -266 Z" fill="#06a77d" ${ink(4)}/>
  <g class="bk-eyes"><circle cx="-20" cy="-252" r="7" fill="${INK}"/><circle cx="20" cy="-252" r="7" fill="${INK}"/>
    <circle cx="-18" cy="-255" r="2.4" fill="#fff"/><circle cx="22" cy="-255" r="2.4" fill="#fff"/></g>
  <circle cx="-36" cy="-232" r="9" fill="#ff8fab" opacity=".55"/><circle cx="36" cy="-232" r="9" fill="#ff8fab" opacity=".55"/>
  <path class="bk-smile" d="M-16 -228 Q0 -214 16 -228" fill="none" ${ink(5)}/>
  <ellipse class="bk-open" cx="0" cy="-222" rx="12" ry="14" fill="#a8324a" ${ink(4)}/>
</g>`;

export const SCANNER = `<rect x="-70" y="-46" width="140" height="46" rx="10" fill="#5a4b6c" ${ink(5)}/>
  <rect x="-50" y="-58" width="100" height="18" rx="6" fill="#ff4d6d" ${ink(4)}/>
  <rect class="bk-laser" x="-60" y="-66" width="120" height="8" rx="4" fill="#ff1f4b"/>
  <circle class="bk-led" cx="50" cy="-22" r="8" fill="#555" ${ink(3)}/>`;

export const BAG = `<path d="M-62 -128 H62 L70 0 H-70 Z" fill="#d9a36a" ${ink(6)}/>
  <path d="M-62 -128 L-50 -112 L-38 -128 L-26 -112 L-14 -128 L-2 -112 L10 -128 L22 -112 L34 -128 L46 -112 L62 -128" fill="#c98a4b" ${ink(4)}/>
  <circle cx="0" cy="-60" r="22" fill="#ffd23f" ${ink(4)}/><path d="M-10 -60 Q0 -48 10 -60" fill="none" ${ink(3)}/>
  <circle cx="-7" cy="-66" r="3" fill="${INK}"/><circle cx="7" cy="-66" r="3" fill="${INK}"/>`;
export const BAG_HANDLES = `<path d="M-36 -126 Q-36 -176 0 -176 Q36 -176 36 -126" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <path d="M-36 -126 Q-36 -176 0 -176 Q36 -176 36 -126" fill="none" stroke="#c98a4b" stroke-width="5" stroke-linecap="round"/>`;

export const TILL = `<g class="bk-receipt"><path d="M-36 -150 V-290 L-28 -298 L-20 -290 L-12 -298 L-4 -290 L4 -298 L12 -290 L20 -298 L28 -290 L36 -298 V-150 Z" fill="#fff" ${ink(4)}/>
    <path d="M-24 -270 H24 M-24 -252 H16 M-24 -234 H24 M-24 -216 H10 M-24 -196 H24" stroke="#bbb" stroke-width="5" stroke-linecap="round"/></g>
  <rect x="-80" y="-150" width="160" height="150" rx="14" fill="#ff8a00" ${ink(6)}/>
  <rect x="-46" y="-158" width="92" height="14" rx="5" fill="${INK}"/>
  <rect x="-66" y="-130" width="132" height="70" rx="10" fill="#1d3b2a" ${ink(4)}/>
  <text class="bk-total" x="0" y="-74" font-size="58" text-anchor="middle" fill="#7dff9a" font-weight="800" font-family="ui-rounded, system-ui, sans-serif">0</text>
  ${[-44, -16, 12, 40].map(x => `<rect x="${x}" y="-46" width="20" height="14" rx="4" fill="#fff" ${ink(3)}/>`).join('')}
  <rect x="-44" y="-26" width="88" height="14" rx="4" fill="#ffd23f" ${ink(3)}/>`;

// a Danish krone: a gold ring with a hole
export const COIN = `<circle cx="0" cy="0" r="62" fill="transparent"/>
  <path d="M0 -48 A48 48 0 1 1 0 48 A48 48 0 1 1 0 -48 Z M0 -13 A13 13 0 1 0 0 13 A13 13 0 1 0 0 -13 Z" fill="#ffc83d" fill-rule="evenodd" ${ink(5)}/>
  <circle cx="0" cy="0" r="34" fill="none" stroke="#e6a417" stroke-width="5"/>
  <path d="M-30 -24 Q-22 -34 -10 -38" fill="none" stroke="#fff6c0" stroke-width="6" stroke-linecap="round"/>`;
