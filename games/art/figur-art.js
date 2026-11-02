/* Character pieces for Figurer. Canvas 300×600, cut into three bands:
 *   head 0–200 (head, hat, neck)   torso 200–380 (body, arms, hands)   legs 380–600 (legs, feet, tails)
 * Seams: the neck (x 138–162) enters a collar at y = 200; the body is x 104–196 wide at the waist (y = 380),
 * where every legs piece starts at the same width.
 */
export const BANDS = [[0, 200], [200, 380], [380, 600]];
export const CANVAS = [300, 600];
const INK = '#4a3b5c';
const S = (w = 5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const SKIN = '#ffd9b8', TAN = '#e8b58a', BROWN = '#b97a4f';

/* ---- head band ---- */
const neck = c => `<rect x="138" y="160" width="24" height="46" fill="${c}"/><path d="M138 160 V206 M162 160 V206" ${S()}/>`;
const ears = c => `<circle cx="92" cy="118" r="13" fill="${c}" ${S()}/><circle cx="208" cy="118" r="13" fill="${c}" ${S()}/>`;
const skull = c => `<circle cx="150" cy="114" r="58" fill="${c}" ${S()}/>`;
const eyes = (y = 112, dx = 21, r = 7) => `<g class="fb-eyes"><circle cx="${150 - dx}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${150 + dx}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${152 - dx}" cy="${y - 3}" r="2.4" fill="#fff"/><circle cx="${152 + dx}" cy="${y - 3}" r="2.4" fill="#fff"/></g>`;
const smile = (y = 136, w = 16) => `<path d="M${150 - w} ${y} Q150 ${y + w * 1.1} ${150 + w} ${y}" fill="#a8324a" ${S(4)}/>`;
const cheeks = (y = 130) => `<circle cx="116" cy="${y}" r="9" fill="#ff8fab" opacity=".55"/><circle cx="184" cy="${y}" r="9" fill="#ff8fab" opacity=".55"/>`;
const face = (skin = SKIN, extra = '') => `${neck(skin)}${ears(skin)}${skull(skin)}${extra}${eyes()}${cheeks()}${smile()}`;

/* ---- torso band ---- */
const BODY = 'M128 198 H172 L204 212 Q214 216 212 228 L196 300 V386 H104 V300 L88 228 Q86 216 96 212 Z';
const line = (x0, y0, x1, y1, c, w) => `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/><path d="M${x0} ${y0} L${x1} ${y1}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const hand = (x, y, c, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${S()}/>`;
// arms hang from the shoulders; short = short sleeves over a bare arm
const arms = (sleeve, handC = SKIN, { short = false, skin = SKIN, w = 26 } = {}) => [[-1, 98, 70], [1, 202, 230]].map(([s, x0, x1]) =>
  (short ? line(x0, 228, x1, 334, skin, w - 4) + line(x0, 228, (x0 + x1) / 2 + s * -2, 272, sleeve, w + 2) : line(x0, 228, x1, 334, sleeve, w))
  + hand(x1, 340, handC)).join('');
const body = (c, extra = '') => `<path d="${BODY}" fill="${c}" ${S()}/>${extra}`;

/* ---- legs band ---- */
const PANTS = 'M104 374 V432 L110 548 H146 L150 450 L154 548 H190 L196 432 V374 Z';
const pants = c => `<path d="${PANTS}" fill="${c}" ${S()}/>`;
const bareLegs = c => `<path d="M114 420 L116 548 H144 L146 420 Z M154 420 L156 548 H184 L186 420 Z" fill="${c}" ${S()}/>`;
const shorts = c => `<path d="M104 374 V458 H146 L150 436 L154 458 H196 V374 Z" fill="${c}" ${S()}/>`;
const shoes = (c, big = 1) => `<path d="M${146} 540 V558 Q146 572 132 572 H${132 - 42 * big} Q${124 - 42 * big} 572 ${126 - 42 * big} 562 Q${132 - 34 * big} 544 112 540 Z" fill="${c}" ${S()}/>
  <path d="M${154} 540 V558 Q154 572 168 572 H${168 + 42 * big} Q${176 + 42 * big} 572 ${174 + 42 * big} 562 Q${168 + 34 * big} 544 188 540 Z" fill="${c}" ${S()}/>`;
const shadow = (rx = 84) => `<ellipse cx="150" cy="586" rx="${rx}" ry="9" fill="rgba(0,0,0,.12)"/>`;

const dots = (pts, c, r) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');

export const SETS = [
  ['Kongen',
    `${face(TAN, `<path d="M94 128 Q88 80 112 70 Q100 100 104 132 Z M206 128 Q212 80 188 70 Q200 100 196 132 Z" fill="#7a4a2a" ${S(4)}/>`)}
     <path d="M98 70 L92 18 L122 44 L150 6 L178 44 L208 18 L202 70 Z" fill="#ffc83d" ${S()}/><rect x="96" y="60" width="108" height="16" rx="5" fill="#ffb703" ${S(4)}/>
     <circle cx="150" cy="44" r="8" fill="#e63946" ${S(3)}/>
     <path d="M120 140 Q150 200 180 140 Q166 152 150 150 Q134 152 120 140 Z" fill="#7a4a2a" ${S(4)}/>`,
    `${arms('#c1121f', TAN)}${body('#c1121f')}
     <path d="M126 196 H174 L200 210 Q190 236 170 232 L150 262 L130 232 Q110 236 100 210 Z" fill="#fff" ${S(4)}/>
     ${dots([[118, 214], [140, 222], [160, 222], [182, 214], [150, 244]], INK, 3)}
     ${dots([[150, 290], [150, 320], [150, 350]], '#ffc83d', 7)}<path d="M104 362 H196" stroke="#ffc83d" stroke-width="10"/>`,
    `<path d="M104 374 L80 552 Q150 568 220 552 L196 374 Z" fill="#c1121f" ${S()}/>
     <path d="M80 552 Q150 568 220 552 L222 536 Q150 552 78 536 Z" fill="#fff" ${S(4)}/>${dots([[100, 548], [130, 554], [170, 554], [200, 548]], INK, 3)}
     ${shoes('#ffc83d', 0.6)}${shadow()}`],
  ['Robot',
    `<rect x="140" y="160" width="20" height="46" fill="#8d99ae"/><path d="M140 160 V206 M160 160 V206 M140 176 H160 M140 190 H160" ${S(4)}/>
     <path d="M150 58 V24" ${S()}/><circle cx="150" cy="20" r="10" fill="#ff4d6d" ${S(4)}/>
     <rect x="90" y="56" width="120" height="112" rx="16" fill="#b8c4d6" ${S()}/>
     <rect x="74" y="96" width="16" height="34" rx="4" fill="#ffc83d" ${S(4)}/><rect x="210" y="96" width="16" height="34" rx="4" fill="#ffc83d" ${S(4)}/>
     <g class="fb-eyes"><rect x="108" y="88" width="30" height="24" rx="5" fill="#4ef0e0" ${S(4)}/><rect x="162" y="88" width="30" height="24" rx="5" fill="#4ef0e0" ${S(4)}/></g>
     <rect x="118" y="130" width="64" height="22" rx="5" fill="#26324a" ${S(4)}/>${[128, 142, 156, 170].map(x => `<rect x="${x}" y="134" width="6" height="14" fill="#4ef0e0"/>`).join('')}`,
    `${[[-1, 98, 70], [1, 202, 230]].map(([s, x0, x1]) => line(x0, 228, x1, 334, '#8d99ae', 20) + `<circle cx="${(x0 + x1) / 2}" cy="281" r="12" fill="#ffc83d" ${S(4)}/>`
       + `<path d="M${x1 - 14} 334 V356 M${x1 + 14} 334 V356" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${x1 - 14} 334 V356 M${x1 + 14} 334 V356" stroke="#ffc83d" stroke-width="5" stroke-linecap="round"/>`).join('')}
     <path d="M100 206 H200 V386 H100 Z" fill="#b8c4d6" ${S()}/>
     <rect x="118" y="230" width="64" height="64" rx="8" fill="#26324a" ${S(4)}/>
     <circle cx="136" cy="250" r="8" fill="#ff4d6d"/><circle cx="164" cy="250" r="8" fill="#ffd23f"/><rect x="128" y="270" width="44" height="10" rx="5" fill="#4ef0e0"/>
     ${dots([[110, 216], [190, 216], [110, 330], [190, 330]], '#8794aa', 4)}`,
    `<path d="M100 374 H200 V420 H100 Z" fill="#8d99ae" ${S()}/>
     <path d="M118 420 V530 M182 420 V530" stroke="${INK}" stroke-width="32"/><path d="M118 420 V530 M182 420 V530" stroke="#b8c4d6" stroke-width="22"/>
     <circle cx="118" cy="474" r="13" fill="#ffc83d" ${S(4)}/><circle cx="182" cy="474" r="13" fill="#ffc83d" ${S(4)}/>
     <rect x="80" y="528" width="62" height="40" rx="8" fill="#8d99ae" ${S()}/><rect x="158" y="528" width="62" height="40" rx="8" fill="#8d99ae" ${S()}/>${shadow()}`],
  ['Rulleskøjteløber',
    `${face(SKIN)}<path d="M84 104 Q84 46 150 44 Q216 46 216 104 Z" fill="#2ec4b6" ${S()}/><path d="M150 46 V102" stroke="#fff" stroke-width="10"/>
     <path d="M84 104 H216" ${S()}/><path d="M212 96 Q246 110 234 146" fill="none" stroke="#ffb703" stroke-width="14" stroke-linecap="round"/>`,
    `${arms('#ffd23f', SKIN, { short: true })}<circle cx="78" cy="296" r="13" fill="#8338ec" ${S(4)}/><circle cx="222" cy="296" r="13" fill="#8338ec" ${S(4)}/>
     ${body('#ffd23f')}<path d="M150 252 L160 276 L186 278 L166 294 L172 320 L150 306 L128 320 L134 294 L114 278 L140 276 Z" fill="#ff4d6d" ${S(4)}/>`,
    `${bareLegs(SKIN)}${shorts('#3a86ff')}<rect x="110" y="470" width="40" height="26" rx="10" fill="#8338ec" ${S(4)}/><rect x="150" y="470" width="40" height="26" rx="10" fill="#8338ec" ${S(4)}/>
     <path d="M108 528 H148 V556 H96 Q96 536 108 528 Z M152 528 H192 Q204 536 204 556 H152 Z" fill="#fff" ${S()}/>
     ${[100, 120, 140, 160, 180, 200].map((x, i) => `<circle cx="${x}" cy="568" r="9" fill="${['#ff4d6d', '#ffd23f', '#2ec4b6'][i % 3]}" ${S(4)}/>`).join('')}${shadow()}`],
  ['Astronaut',
    `<rect x="122" y="168" width="56" height="40" rx="8" fill="#cfd6e0" ${S()}/>${face(SKIN)}
     <circle cx="150" cy="110" r="80" fill="rgba(170,215,255,.2)" ${S()}/><path d="M104 64 Q120 46 146 42" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".9"/>`,
    `${arms('#f4f6fa', '#9aa5b5', { w: 30 })}${body('#f4f6fa')}
     <rect x="118" y="236" width="64" height="48" rx="8" fill="#cfd6e0" ${S(4)}/><circle cx="134" cy="252" r="6" fill="#ff4d6d"/><circle cx="150" cy="252" r="6" fill="#2ec4b6"/><circle cx="166" cy="252" r="6" fill="#ffd23f"/>
     <rect x="128" y="266" width="44" height="8" rx="4" fill="#3a86ff"/><path d="M130 314 H170 L150 338 Z" fill="#3a86ff" opacity=".6"/>`,
    `${pants('#f4f6fa')}<path d="M110 470 H146 M154 470 H190" stroke="#cfd6e0" stroke-width="8"/>${shoes('#9aa5b5', 0.75)}${shadow()}`],
  ['Havfrue',
    `<path d="M88 110 Q60 200 90 206 L210 206 Q240 200 212 110 Z" fill="#e85d04" ${S()}/>${face(SKIN)}
     <path d="M90 108 Q90 50 150 48 Q210 50 210 108 Q190 72 150 78 Q110 72 90 108 Z" fill="#e85d04" ${S()}/>
     <path d="M196 64 l6 -14 6 14 14 2 -10 10 4 14 -14 -8 -14 8 4 -14 -10 -10 Z" fill="#ffd23f" ${S(3)}/>`,
    `${arms(SKIN, SKIN)}${body(SKIN)}
     <path d="M104 344 Q150 330 196 344 V386 H104 Z" fill="#2ec4b6" ${S()}/>
     <path d="M118 250 Q130 236 146 248 Q140 270 118 266 Z M182 250 Q170 236 154 248 Q160 270 182 266 Z" fill="#c77dff" ${S(4)}/>
     <path d="M100 206 Q92 250 106 270 M200 206 Q208 250 194 270" fill="none" stroke="#e85d04" stroke-width="14" stroke-linecap="round"/>`,
    `<path d="M104 374 V430 Q104 500 140 534 Q150 544 160 534 Q196 500 196 430 V374 Z" fill="#2ec4b6" ${S()}/>
     ${[[118, 404, 4], [118, 436, 4], [126, 468, 3], [134, 500, 2]].map(([x, y, n]) => `<path d="M${x} ${y}${' q8 10 16 0'.repeat(n)}" fill="none" stroke="#1a9e92" stroke-width="4" stroke-linecap="round"/>`).join('')}
     <path d="M150 528 Q110 540 84 576 Q124 572 150 556 Q176 572 216 576 Q190 540 150 528 Z" fill="#c77dff" ${S()}/>${shadow(70)}`],
  ['Ridderen',
    `<rect x="136" y="160" width="28" height="46" fill="#aab4c3"/><path d="M136 160 V206 M164 160 V206" ${S()}/>
     <path d="M150 52 Q170 10 214 18 Q186 30 176 56" fill="#e63946" ${S()}/>
     <path d="M92 168 V110 Q92 52 150 52 Q208 52 208 110 V168 Z" fill="#cfd6e0" ${S()}/>
     <path d="M150 52 V168" stroke="#aab4c3" stroke-width="6"/>
     <rect x="104" y="100" width="92" height="22" rx="6" fill="#26324a" ${S(4)}/><g class="fb-eyes"><circle cx="128" cy="111" r="5" fill="#fff"/><circle cx="172" cy="111" r="5" fill="#fff"/></g>
     ${dots([[116, 140], [132, 140], [168, 140], [184, 140], [116, 152], [132, 152], [168, 152], [184, 152]], '#26324a', 3)}`,
    `${arms('#cfd6e0', '#aab4c3', { w: 28 })}${[[84, 282], [216, 282]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#aab4c3" ${S(4)}/>`).join('')}
     ${body('#cfd6e0')}<path d="M124 236 H176 V284 Q176 312 150 324 Q124 312 124 284 Z" fill="#fff" ${S(4)}/><path d="M150 240 V318 M128 270 H172" stroke="#e63946" stroke-width="10"/>
     <path d="M104 352 H196" stroke="#8d6e4a" stroke-width="12"/>`,
    `${pants('#cfd6e0')}<circle cx="128" cy="472" r="13" fill="#aab4c3" ${S(4)}/><circle cx="172" cy="472" r="13" fill="#aab4c3" ${S(4)}/>
     <path d="M112 420 H146 M154 420 H188 M112 510 H146 M154 510 H190" stroke="#aab4c3" stroke-width="5"/>${shoes('#aab4c3', 0.9)}${shadow()}`],
  ['Ballerina',
    `${face(SKIN)}<circle cx="150" cy="40" r="24" fill="#6b3e26" ${S()}/><path d="M92 102 Q92 54 150 54 Q208 54 208 102 Q190 74 150 76 Q110 74 92 102 Z" fill="#6b3e26" ${S()}/>
     <path d="M130 54 Q150 66 170 54" fill="none" stroke="#ff8fab" stroke-width="8" stroke-linecap="round"/>`,
    `${arms(SKIN, SKIN, { w: 22 })}${body('#ff8fab')}<path d="M126 198 H174 L182 214 Q150 226 118 214 Z" fill="${SKIN}" ${S(4)}/>
     ${dots([[130, 260], [170, 260], [150, 290], [130, 320], [170, 320]], '#fff', 4)}`,
    `${bareLegs('#ffc6d9')}<path d="M104 374 H196 L250 430 Q200 448 150 440 Q100 448 50 430 Z" fill="#ffb3cf" ${S()}/>
     <path d="M60 428 Q80 410 100 432 Q120 414 140 436 Q160 414 180 436 Q200 410 220 432 Q240 412 248 430" fill="none" stroke="#ff8fab" stroke-width="5" stroke-linecap="round"/>
     ${shoes('#ff8fab', 0.6)}<path d="M120 548 L138 520 M180 548 L162 520" stroke="#ff8fab" stroke-width="4"/>${shadow()}`],
  ['Piraten',
    `${face(TAN)}<path d="M66 82 Q100 58 150 60 Q200 58 234 82 Q210 30 150 26 Q90 30 66 82 Z" fill="#26213a" ${S()}/>
     <circle cx="150" cy="50" r="10" fill="#fff"/><path d="M144 64 L156 70 M156 64 L144 70" stroke="#fff" stroke-width="3"/>
     <path d="M96 92 L204 118" ${S(4)}/><path d="M116 102 Q130 98 142 104 L138 124 Q126 128 116 122 Z" fill="${INK}"/>
     <path d="M118 150 Q150 172 182 150 Q182 172 150 176 Q118 172 118 150 Z" fill="#5a3a2a" opacity=".7"/>`,
    `${arms('#fff', TAN)}${body('#fff')}${[232, 262, 292, 322, 352].map(y => `<path d="M100 ${y} H200" stroke="#e63946" stroke-width="12"/>`).join('')}
     <path d="M100 210 L132 206 L136 386 H104 V300 L88 228 Q86 216 100 210 Z M200 210 L168 206 L164 386 H196 V300 L212 228 Q214 216 200 210 Z" fill="#7a4a2a" ${S()}/>
     <path d="M104 352 H196" stroke="#26213a" stroke-width="14"/><rect x="138" y="342" width="24" height="20" rx="3" fill="#ffc83d" ${S(3)}/>`,
    `<path d="M104 374 V432 L110 548 H146 L150 450 L154 500 H190 L196 432 V374 Z" fill="#8d6e4a" ${S()}/>
     <path d="M166 500 L170 572" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M166 500 L170 572" stroke="#c98a4b" stroke-width="13" stroke-linecap="round"/>
     <path d="M146 540 V558 Q146 572 132 572 H92 Q84 572 86 562 Q92 544 112 540 Z" fill="#26213a" ${S()}/>${shadow()}`],
  ['Brandmanden',
    `${face(SKIN)}<path d="M80 104 Q80 40 150 38 Q220 40 220 104 Z" fill="#e63946" ${S()}/>
     <path d="M66 104 H234 Q234 118 220 118 H80 Q66 118 66 104 Z" fill="#c1121f" ${S()}/>
     <path d="M150 46 V100" stroke="#ff7b8a" stroke-width="8"/><path d="M134 64 H166 V86 Q150 96 134 86 Z" fill="#ffc83d" ${S(4)}/>`,
    `${arms('#26324a', '#26213a')}${body('#26324a')}
     <path d="M100 290 H200 M96 252 H204" stroke="#ffd23f" stroke-width="12"/><path d="M150 202 V386" stroke="#0d1424" stroke-width="5"/>
     ${[[-1, 82, 290], [1, 218, 290]].map(([s, x, y]) => `<path d="M${x - 10} ${y - 12} L${x + 10} ${y + 8}" stroke="#ffd23f" stroke-width="10"/>`).join('')}`,
    `${pants('#26324a')}<path d="M110 490 H146 M154 490 H190" stroke="#ffd23f" stroke-width="12"/>
     <path d="M108 516 H146 V572 H90 Q88 540 108 516 Z M154 516 H192 Q212 540 210 572 H154 Z" fill="#26213a" ${S()}/>${shadow()}`],
  ['Dinosauren',
    `<rect x="132" y="150" width="36" height="56" fill="#5fbf5a"/><path d="M132 150 V206 M168 150 V206" ${S()}/>
     ${[[96, 64], [122, 42], [152, 36], [182, 44]].map(([x, y]) => `<path d="M${x - 14} ${y + 16} L${x} ${y - 12} L${x + 14} ${y + 16} Z" fill="#ffb703" ${S(4)}/>`).join('')}
     <path d="M84 140 Q74 56 150 50 Q214 52 222 104 L262 116 Q280 126 270 148 Q256 172 200 172 L120 172 Q90 170 84 140 Z" fill="#5fbf5a" ${S()}/>
     <path d="M150 150 Q210 164 268 140" fill="none" ${S(4)}/>${[170, 196, 222, 246].map(x => `<path d="M${x} ${154 + (x - 170) / 12} l6 10 6 -10" fill="#fff" ${S(2.5)}/>`).join('')}
     <circle cx="256" cy="124" r="4" fill="${INK}"/>
     <g class="fb-eyes"><circle cx="160" cy="98" r="15" fill="#fff" ${S(4)}/><circle cx="165" cy="100" r="7" fill="${INK}"/><circle cx="168" cy="96" r="2.5" fill="#fff"/></g>
     ${dots([[108, 110], [124, 132], [102, 140]], '#3e9a3a', 5)}`,
    `${line(104, 240, 80, 268, '#5fbf5a', 18)}${line(196, 240, 220, 268, '#5fbf5a', 18)}
     <path d="M74 270 l-10 6 M80 276 l-6 10 M226 270 l10 6 M220 276 l6 10" ${S(4)}/>
     ${body('#5fbf5a')}<path d="M126 214 Q150 206 174 214 Q192 300 172 386 H128 Q108 300 126 214 Z" fill="#c9f2a8" ${S(4)}/>
     ${[240, 270, 300, 330, 360].map(y => `<path d="M${130 - (y - 214) / 30} ${y} H${170 + (y - 214) / 30}" stroke="#9fd77f" stroke-width="4"/>`).join('')}`,
    `<path d="M190 420 Q260 430 286 520 Q240 480 196 470 Z" fill="#5fbf5a" ${S()}/>
     <path d="M104 374 V440 Q100 500 108 546 H148 L150 460 L152 546 H192 Q200 500 196 440 V374 Z" fill="#5fbf5a" ${S()}/>
     <path d="M98 546 H152 Q154 572 140 572 H96 Q86 572 98 546 Z M148 546 H202 Q214 572 204 572 H160 Q146 572 148 546 Z" fill="#5fbf5a" ${S()}/>
     ${[100, 116, 132, 164, 180, 196].map(x => `<path d="M${x} 572 l4 -10 4 10" fill="#fff" ${S(2.5)}/>`).join('')}${shadow(96)}`],
  ['Prinsessen',
    `<path d="M88 100 Q66 200 84 206 H216 Q234 200 212 100 Z" fill="#ffd23f" ${S()}/>${face(SKIN)}
     <path d="M90 108 Q88 50 150 48 Q212 50 210 108 Q192 70 168 72 Q150 90 128 74 Q104 74 90 108 Z" fill="#ffd23f" ${S()}/>
     <path d="M116 60 L124 32 L138 52 L150 22 L162 52 L176 32 L184 60 Z" fill="#e8f4ff" ${S(4)}/><circle cx="150" cy="44" r="6" fill="#ff4d8d" ${S(3)}/>`,
    `${arms(SKIN, SKIN, { w: 20 })}<ellipse cx="94" cy="230" rx="24" ry="20" fill="#ff8fc7" ${S()}/><ellipse cx="206" cy="230" rx="24" ry="20" fill="#ff8fc7" ${S()}/>
     ${body('#ff8fc7')}<path d="M126 198 H174 Q170 228 150 230 Q130 228 126 198 Z" fill="${SKIN}" ${S(4)}/>
     <path d="M104 350 Q150 366 196 350" fill="none" stroke="#fff" stroke-width="8"/>${dots([[150, 260], [134, 290], [166, 290], [150, 320]], '#fff', 5)}`,
    `<path d="M104 374 Q90 450 54 556 Q150 580 246 556 Q210 450 196 374 Z" fill="#ff8fc7" ${S()}/>
     <path d="M56 550 Q80 530 102 552 Q126 532 150 554 Q174 532 198 552 Q220 530 244 550" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
     <path d="M104 420 Q150 436 196 420 M96 480 Q150 500 204 480" fill="none" stroke="#ff6fb5" stroke-width="5"/>${shadow(110)}`],
  ['Superhelten',
    `${face(SKIN)}<path d="M90 104 Q86 50 150 46 Q214 50 210 104 Q196 76 168 80 L172 64 Q150 84 120 74 Q100 80 90 104 Z" fill="#1d1a2a" ${S()}/>
     <path d="M98 102 Q124 92 150 104 Q176 92 202 102 Q200 126 176 124 Q160 122 150 114 Q140 122 124 124 Q100 126 98 102 Z" fill="#e63946" ${S(4)}/>`,
    `<path d="M100 210 L58 368 Q78 380 98 370 H202 Q222 380 242 368 L200 210 Z" fill="#e63946" ${S()}/>${arms('#3a86ff', '#e63946')}${body('#3a86ff')}
     <path d="M150 230 L162 258 L192 260 L168 278 L176 308 L150 292 L124 308 L132 278 L108 260 L138 258 Z" fill="#ffd23f" ${S(4)}/>
     <path d="M104 360 H196" stroke="#ffd23f" stroke-width="14"/>`,
    `${pants('#3a86ff')}<path d="M104 374 V420 H146 L150 408 L154 420 H196 V374 Z" fill="#e63946" ${S()}/>
     <path d="M110 500 H146 V572 H90 Q90 552 110 548 Z M154 500 H190 V548 Q210 552 210 572 H154 Z" fill="#e63946" ${S()}/>${shadow()}`],
  ['Kokken',
    `${face(SKIN)}<path d="M100 76 Q70 66 76 36 Q86 10 116 20 Q130 -6 160 6 Q186 -6 200 22 Q226 18 226 46 Q226 70 200 76 Z" fill="#fff" ${S()}/>
     <rect x="100" y="62" width="100" height="22" rx="4" fill="#fff" ${S()}/>
     <path d="M150 128 Q130 116 112 130 Q122 136 136 132 Q144 130 150 134 Q156 130 164 132 Q178 136 188 130 Q170 116 150 128 Z" fill="#5a3a2a" ${S(3)}/>`,
    `${arms('#fff', SKIN)}${body('#fff')}<path d="M126 198 H174 L162 222 L150 214 L138 222 Z" fill="#e63946" ${S(4)}/>
     ${dots([[132, 250], [168, 250], [132, 290], [168, 290], [132, 330], [168, 330]], '#bfc6d1', 6)}`,
    `${pants('#fff')}${[...Array(6)].map((_, r) => [...Array(5)].map((_, c) => (r + c) % 2 ? '' : `<rect x="${104 + c * 18.4}" y="${384 + r * 27}" width="18.4" height="27" fill="#26213a" opacity=".8"/>`).join('')).join('')}
     <path d="${PANTS}" fill="none" ${S()}/>${shoes('#26213a', 0.6)}${shadow()}`],
  ['Fodboldspilleren',
    `${face(TAN)}<path d="M92 100 Q88 50 150 48 Q212 50 208 100 Q190 70 150 72 Q110 70 92 100 Z" fill="#3b2a1a" ${S()}/>
     <path d="M90 92 Q150 72 210 92" fill="none" stroke="#fff" stroke-width="12"/>`,
    `${arms('#2bb24c', TAN, { short: true, skin: TAN })}${body('#2bb24c')}
     ${[118, 150, 182].map(x => `<path d="M${x} 206 V386" stroke="#fff" stroke-width="12"/>`).join('')}<path d="${BODY}" fill="none" ${S()}/>
     <text x="150" y="300" font-size="54" font-weight="900" text-anchor="middle" fill="#ffd23f" stroke="${INK}" stroke-width="3" font-family="ui-rounded, system-ui, sans-serif">10</text>`,
    `${bareLegs(TAN)}${shorts('#1d1a2a')}<path d="M114 490 H146 V540 H114 Z M154 490 H186 V540 H154 Z" fill="#fff" ${S(4)}/>
     <path d="M114 506 H146 M154 506 H186 M114 522 H146 M154 522 H186" stroke="#2bb24c" stroke-width="7"/>${shoes('#ff8a00', 0.75)}
     <circle cx="252" cy="548" r="26" fill="#fff" ${S()}/><path d="M252 536 l11 8 -4 13 h-14 l-4 -13 Z" fill="${INK}"/>${shadow(110)}`],
  ['Klovnen',
    `${face('#fff6f2', `<circle cx="150" cy="126" r="11" fill="#ff1f3d" ${S(3)}/>`)}
     ${[[88, 92, '#ff4d6d'], [96, 64, '#ffd23f'], [204, 64, '#3a86ff'], [212, 92, '#2ec4b6']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="20" fill="${c}" ${S(4)}/>`).join('')}
     <path d="M126 58 L150 10 L174 58 Z" fill="#8338ec" ${S()}/><circle cx="150" cy="10" r="9" fill="#ffd23f" ${S(4)}/>`,
    `${arms('#ff4d6d', '#fff')}${body('#ffd23f')}${dots([[124, 260], [176, 260], [150, 300], [124, 340], [176, 340], [150, 360]], '#ff4d6d', 9)}
     <path d="M110 206 Q118 228 134 214 Q142 236 150 216 Q158 236 166 214 Q182 228 190 206 Q150 190 110 206 Z" fill="#fff" ${S(4)}/>`,
    `<path d="M104 374 L92 470 L100 546 H148 L150 470 L152 546 H200 L208 470 L196 374 Z" fill="#3a86ff" ${S()}/>
     ${dots([[120, 410], [176, 420], [118, 480], [182, 490], [126, 530], [174, 530]], '#ffd23f', 7)}${shoes('#ff1f3d', 1.25)}${shadow(110)}`],
  ['Dykkeren',
    `${face(SKIN)}<path d="M90 96 Q150 80 210 96" fill="none" stroke="#2b3f66" stroke-width="12"/>
     <rect x="102" y="92" width="96" height="40" rx="16" fill="rgba(150,220,255,.55)" stroke="#ffd23f" stroke-width="8"/>
     <path d="M210 150 V60 Q210 44 222 44" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M210 150 V60 Q210 44 222 44" fill="none" stroke="#ff8a00" stroke-width="8" stroke-linecap="round"/>`,
    `<rect x="62" y="226" width="40" height="112" rx="18" fill="#ffd23f" ${S()}/><rect x="198" y="226" width="40" height="112" rx="18" fill="#ffd23f" ${S()}/>
     ${arms('#2b3f66', '#2b3f66')}${body('#2b3f66')}<path d="M98 250 L202 250 M100 300 H200" stroke="#ffd23f" stroke-width="8"/>`,
    `${pants('#2b3f66')}<path d="M110 470 H146 M154 470 H190" stroke="#ffd23f" stroke-width="8"/>
     <path d="M110 536 H146 L132 584 Q104 590 74 576 Z M154 536 H190 L226 576 Q196 590 168 584 Z" fill="#ffd23f" ${S()}/>${shadow()}`],
];
