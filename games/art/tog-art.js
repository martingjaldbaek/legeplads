/* SVG art for Togbanen. Train parts are drawn facing right, in local units, with the wheels resting on y≈0
 * (the track's centre line). The game positions, rotates and scales them along the track.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const wheel = (x, r = 13) => `<g class="tog-wheel" style="transform-origin:${x}px ${-r + 2}px">
  <circle cx="${x}" cy="${-r + 2}" r="${r}" fill="#ffd23f" ${ink(4)}/><circle cx="${x}" cy="${-r + 2}" r="4" fill="${INK}"/>
  <path d="M${x - r + 4} ${-r + 2} H${x + r - 4}" ${ink(3)}/></g>`;

// The loco: blue cab at the back, red boiler with a smiling face, chimney at the front.
// CHIMNEY is the local point steam puffs come from; CAB is where a passenger sits.
export const CHIMNEY = [44, -96];
export const CAB = [-43, -46];
export const LOCO_LEN = 140;
export const LOCO = `
  <rect x="-70" y="-24" width="134" height="12" rx="5" fill="${INK}"/>
  <rect x="-66" y="-84" width="48" height="64" rx="7" fill="#3a86ff" ${ink(4.5)}/>
  <rect x="-58" y="-74" width="31" height="26" rx="6" fill="#dff1ff" ${ink(3.5)}/>
  <g class="tog-seat" data-seat="loco"></g>
  <rect x="-58" y="-74" width="31" height="26" rx="6" fill="none" ${ink(3.5)}/>
  <rect x="-74" y="-94" width="62" height="13" rx="6" fill="#ff4d6d" ${ink(4.5)}/>
  <path d="M34 -62 L37 -82 L30 -92 H58 L51 -82 L54 -62 Z" fill="#5b4a70" ${ink(4)}/>
  <rect x="-22" y="-66" width="82" height="48" rx="22" fill="#ff4d6d" ${ink(4.5)}/>
  <rect x="-4" y="-66" width="7" height="48" fill="#ffd23f" ${ink(2.5)}/>
  <circle cx="14" cy="-66" r="10" fill="#ffd23f" ${ink(4)}/>
  <path d="M-12 -56 H28" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <g class="tog-eyes"><circle cx="34" cy="-46" r="5" fill="${INK}"/><circle cx="50" cy="-46" r="5" fill="${INK}"/>
    <circle cx="35.5" cy="-48" r="1.8" fill="#fff"/><circle cx="51.5" cy="-48" r="1.8" fill="#fff"/></g>
  <circle cx="28" cy="-35" r="5" fill="#ff8fab" opacity=".6"/><circle cx="57" cy="-35" r="4.5" fill="#ff8fab" opacity=".6"/>
  <path d="M36 -36 Q42 -29 48 -36" fill="none" ${ink(3.5)}/>
  <path d="M60 -22 L76 -4 H52 Z" fill="#ffd23f" ${ink(4)}/>
  <circle cx="64" cy="-58" r="6" fill="#fff6a8" ${ink(3)}/>
  ${wheel(-44, 15)}${wheel(-8, 13)}${wheel(26, 13)}
`;

// An open wagon: the passenger stands inside (drawn before the front wall, so they peek out of it).
export const CAR_LEN = 112;
export const CAR = color => `
  <rect x="-60" y="-26" width="8" height="8" rx="2" fill="${INK}"/><rect x="52" y="-26" width="8" height="8" rx="2" fill="${INK}"/>
  <rect x="-54" y="-24" width="108" height="11" rx="5" fill="${INK}"/>
  <g class="tog-seat"></g>
  <rect x="-52" y="-62" width="104" height="42" rx="9" fill="${color}" ${ink(4.5)}/>
  <rect x="-52" y="-52" width="104" height="7" fill="#fff" opacity=".45"/>
  <path d="M-40 -34 H40" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
  ${wheel(-30, 12)}${wheel(30, 12)}
`;

// small icons for the tray (track pieces), drawn in a 100×100 box
const woodStroke = d => `<path d="${d}" fill="none" stroke="#b8894f" stroke-width="38" stroke-linecap="butt"/>
  <path d="${d}" fill="none" stroke="#f0cf96" stroke-width="32" stroke-linecap="butt"/>
  <path d="${d}" fill="none" stroke="#c99a5e" stroke-width="20" stroke-linecap="butt"/>
  <path d="${d}" fill="none" stroke="#f0cf96" stroke-width="13" stroke-linecap="butt"/>`;
export const PIECE_ICON = {
  line: `<svg viewBox="0 0 100 100">${woodStroke('M50 8 V92')}</svg>`,
  arc: `<svg viewBox="0 0 100 100">${woodStroke('M18 92 A74 74 0 0 1 92 18')}</svg>`,
};
export const CAR_ICON = color => `<svg viewBox="-66 -100 132 110">${CAR(color)}</svg>`;

export const TREE = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="4" rx="34" ry="9" fill="rgba(0,0,0,.12)"/>
  <rect x="-7" y="-30" width="14" height="34" rx="4" fill="#b07a45" ${ink(4)}/>
  <circle cx="0" cy="-58" r="36" fill="#3fbf5f" ${ink(4.5)}/>
  <circle cx="-12" cy="-70" r="9" fill="#fff" opacity=".3"/></g>`;

export const HOUSE = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-46" y="-60" width="92" height="60" rx="6" fill="#ffe1a8" ${ink(4.5)}/>
  <path d="M-58 -58 L0 -100 L58 -58 Z" fill="#ff4d6d" ${ink(4.5)}/>
  <rect x="-12" y="-36" width="24" height="36" rx="4" fill="#8a5a3b" ${ink(4)}/>
  <rect x="-38" y="-46" width="18" height="16" rx="3" fill="#bde3ff" ${ink(3)}/><rect x="20" y="-46" width="18" height="16" rx="3" fill="#bde3ff" ${ink(3)}/>
  <circle cx="0" cy="-70" r="11" fill="#fff" ${ink(3.5)}/><path d="M0 -77 V-70 H5" ${ink(2.5)} fill="none"/></g>`;
