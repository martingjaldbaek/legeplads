/* Face pieces for Fjæs. Canvas 300×400, cut into three bands:
 *   top 0–170 (hair, hats, eyes)   middle 170–250 (nose, cheeks, ears)   bottom 250–400 (mouth, chin, beards)
 * Every head has straight sides at x = 60 and x = 240 across both seams, so any top fits any middle and bottom.
 */
export const BANDS = [[0, 170], [170, 250], [250, 400]];
export const CANVAS = [300, 400];
const INK = '#4a3b5c';
const S = (w = 6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---- head silhouette, one piece per band ---- */
const headT = (c, square) => square
  ? `<path d="M60 174 V78 Q60 64 74 64 H226 Q240 64 240 78 V174" fill="${c}" ${S()}/>`
  : `<path d="M60 174 V128 Q60 56 150 56 Q240 56 240 128 V174" fill="${c}" ${S()}/>`;
const headM = c => `<rect x="60" y="166" width="180" height="88" fill="${c}"/><path d="M60 166 V254 M240 166 V254" ${S()}/>`;
const headB = (c, square) => square
  ? `<path d="M60 246 V336 Q60 350 74 350 H226 Q240 350 240 336 V246" fill="${c}" ${S()}/>`
  : `<path d="M60 246 V288 Q60 366 150 366 Q240 366 240 288 V246" fill="${c}" ${S()}/>`;

/* ---- features ---- */
const eye = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const eyes = (y = 135, r = 12, dx = 36) => `<g class="fb-eyes">${eye(150 - dx, y, r)}${eye(150 + dx, y, r)}</g>`;
const bigEyes = (y = 132, dx = 38, iris = '#4a8fe7') => `<g class="fb-eyes">${[150 - dx, 150 + dx].map(x =>
  `<circle cx="${x}" cy="${y}" r="21" fill="#fff" ${S(5)}/><circle cx="${x + 3}" cy="${y + 2}" r="12" fill="${iris}"/><circle cx="${x + 3}" cy="${y + 2}" r="6" fill="${INK}"/><circle cx="${x + 7}" cy="${y - 3}" r="4" fill="#fff"/>`).join('')}</g>`;
const lashes = (y = 135, dx = 36) => [150 - dx, 150 + dx].map(x => `<path d="M${x - 13} ${y - 9} l-7 -7 M${x - 4} ${y - 14} l-3 -9 M${x + 6} ${y - 14} l2 -9" ${S(4)} fill="none"/>`).join('');
const brows = (y = 108, dx = 36, tilt = 0, c = INK, w = 6) => [-1, 1].map(s =>
  `<path d="M${150 + s * dx - 16} ${y + s * tilt} Q${150 + s * dx} ${y - 8} ${150 + s * dx + 16} ${y - s * tilt}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`).join('');
const cheeks = (c = '#ff8fab', o = 0.55) => `<ellipse cx="92" cy="218" rx="18" ry="11" fill="${c}" opacity="${o}"/><ellipse cx="208" cy="218" rx="18" ry="11" fill="${c}" opacity="${o}"/>`;
const ears = (c, rx = 20, ry = 28) => `<ellipse cx="58" cy="208" rx="${rx}" ry="${ry}" fill="${c}" ${S()}/><ellipse cx="242" cy="208" rx="${rx}" ry="${ry}" fill="${c}" ${S()}/>
  <path d="M52 196 Q46 208 54 220 M248 196 Q254 208 246 220" fill="none" ${S(4)}/>`;
const nose = (c, r = 13) => `<ellipse cx="150" cy="${208}" rx="${r}" ry="${r * 0.85}" fill="${c}" ${S(5)}/><circle cx="${150 - r * 0.35}" cy="${208 - r * 0.35}" r="${r * 0.25}" fill="#fff" opacity=".6"/>`;
const smile = (y = 282, w = 34, open = true) => open
  ? `<path d="M${150 - w} ${y} Q150 ${y + w * 1.4} ${150 + w} ${y} Z" fill="#a8324a" ${S(5)}/><path d="M${150 - w * 0.45} ${y + w * 0.62} Q150 ${y + w * 0.35} ${150 + w * 0.45} ${y + w * 0.62} Q150 ${y + w * 0.75} ${150 - w * 0.45} ${y + w * 0.62}" fill="#ff8fab"/>`
  : `<path d="M${150 - w} ${y} Q150 ${y + w * 0.9} ${150 + w} ${y}" fill="none" ${S(6)}/>`;

const SK = { light: '#ffdcc0', tan: '#f1c08f', brown: '#c98d5e', pale: '#ece6f7', white: '#fff6f2' };

/* ---- the sets: each is [name, top, middle, bottom] ---- */
export const SETS = [
  ['Pige',
    `<circle cx="38" cy="140" r="26" fill="#8b4a2b" ${S()}/><circle cx="262" cy="140" r="26" fill="#8b4a2b" ${S()}/>
     <path d="M44 112 l-26 -14 4 30 Z M256 112 l26 -14 -4 30 Z" fill="#ff4d8d" ${S(5)}/>
     ${headT(SK.light)}
     <path d="M57 130 Q52 50 150 48 Q248 50 243 130 Q228 92 196 96 Q178 80 150 98 Q124 80 104 96 Q72 92 57 130 Z" fill="#8b4a2b" ${S()}/>
     ${eyes(140)}${lashes(140)}`,
    `${ears(SK.light)}${headM(SK.light)}${cheeks()}${nose('#f7b48c', 10)}`,
    `${headB(SK.light)}${smile(284, 32)}`],
  ['Dreng',
    `${headT(SK.tan)}
     <path d="M58 120 L66 70 L82 92 L92 44 L112 82 L130 34 L148 78 L168 34 L184 80 L206 44 L214 90 L232 66 L242 120 Q236 90 150 92 Q64 90 58 120 Z" fill="#ff8a00" ${S()}/>
     ${brows(110, 36, 0, '#c45f00', 7)}${eyes(140)}`,
    `${ears(SK.tan)}${headM(SK.tan)}${[86, 100, 92, 200, 214, 206].map((x, i) => `<circle cx="${x}" cy="${206 + (i % 3) * 9}" r="3.5" fill="#b8702e"/>`).join('')}${nose('#e3a872', 12)}`,
    `${headB(SK.tan)}<path d="M108 278 Q150 336 192 278 Z" fill="#fff" ${S(5)}/><path d="M108 278 H192" ${S(4)}/><path d="M130 300 Q150 316 170 300" fill="#ff8fab"/>`],
  ['Bedstefar',
    `${headT(SK.light)}
     <path d="M60 138 Q44 104 66 92 Q58 116 76 120 Q66 140 60 150 Z M240 138 Q256 104 234 92 Q242 116 224 120 Q234 140 240 150 Z" fill="#fff" ${S(5)}/>
     <path d="M110 70 Q120 56 130 66" fill="none" ${S(4)}/>
     ${brows(104, 38, 4, '#f4f4f4', 12)}${brows(104, 38, 4, INK, 2)}
     ${eyes(138, 9)}
     <circle cx="112" cy="138" r="24" fill="rgba(200,230,255,.35)" ${S(5)}/><circle cx="188" cy="138" r="24" fill="rgba(200,230,255,.35)" ${S(5)}/>
     <path d="M136 136 Q150 128 164 136 M88 134 L60 128 M212 134 L240 128" fill="none" ${S(5)}/>`,
    `${ears(SK.light, 22, 32)}${headM(SK.light)}${cheeks('#ff7f9a', 0.4)}<ellipse cx="150" cy="210" rx="24" ry="22" fill="#ffb08f" ${S(5)}/><circle cx="142" cy="202" r="6" fill="#fff" opacity=".6"/>`,
    `${headB(SK.light)}
     <path d="M66 254 Q60 320 92 360 Q116 394 150 396 Q184 394 208 360 Q240 320 234 254 Q206 270 150 266 Q94 270 66 254 Z" fill="#f4f4f4" ${S()}/>
     <path d="M96 256 Q120 280 150 266 Q180 280 204 256 Q192 296 150 290 Q108 296 96 256 Z" fill="#fff" ${S(5)}/>
     <path d="M136 300 Q150 312 164 300" fill="#a8324a" ${S(4)}/>
     <path d="M110 330 Q118 350 112 370 M150 330 V376 M190 330 Q182 350 188 370" fill="none" stroke="#d9d9d9" stroke-width="4" stroke-linecap="round"/>`],
  ['Klovn',
    `${[44, 70, 230, 256].map((x, i) => `<circle cx="${x}" cy="${[118, 92, 92, 118][i]}" r="28" fill="${['#ff4d6d', '#ffd23f', '#3a86ff', '#2ec4b6'][i]}" ${S(5)}/>`).join('')}
     ${headT(SK.white)}
     <path d="M118 62 L150 6 L182 62 Z" fill="#8338ec" ${S()}/><circle cx="150" cy="8" r="12" fill="#ffd23f" ${S(5)}/>
     <circle cx="134" cy="40" r="6" fill="#ffd23f"/><circle cx="162" cy="30" r="6" fill="#ff4d6d"/>
     <path d="M114 104 L124 122 L114 140 L104 122 Z M186 104 L196 122 L186 140 L176 122 Z" fill="#3a86ff" opacity=".8"/>
     ${eyes(140)}`,
    `${headM(SK.white)}<circle cx="92" cy="216" r="16" fill="#ff4d6d" opacity=".7"/><circle cx="208" cy="216" r="16" fill="#ff4d6d" opacity=".7"/>
     <circle cx="150" cy="208" r="24" fill="#ff1f3d" ${S(5)}/><circle cx="141" cy="199" r="7" fill="#fff" opacity=".7"/>`,
    `${headB(SK.white)}<path d="M84 262 Q150 390 216 262 Q150 300 84 262 Z" fill="#ff4d6d" ${S(5)}/>
     <path d="M100 272 Q150 362 200 272 Q150 300 100 272 Z" fill="#a8324a"/><path d="M128 320 Q150 340 172 320 Q150 312 128 320" fill="#ff8fab"/>`],
  ['Pirat',
    `${headT('#e9b48a')}
     <path d="M54 118 Q54 50 150 48 Q246 50 246 118 Q200 100 150 102 Q100 100 54 118 Z" fill="#e63946" ${S()}/>
     ${[[96, 70], [138, 62], [182, 66], [218, 88], [76, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff"/>`).join('')}
     <path d="M240 92 L282 70 L272 104 L290 120 L244 112" fill="#e63946" ${S(5)}/>
     <path d="M62 110 L188 156" ${S(5)}/><path d="M92 120 Q114 112 136 120 L130 152 Q114 162 98 152 Z" fill="${INK}" ${S(4)}/>
     <g class="fb-eyes">${eye(186, 140, 12)}</g><path d="M168 116 Q186 104 204 112" fill="none" ${S(7)}/>`,
    `${ears('#e9b48a')}<circle cx="246" cy="244" r="10" fill="none" stroke="#ffc83d" stroke-width="5"/>${headM('#e9b48a')}
     <path d="M140 196 Q152 222 166 216 Q160 226 140 222 Z" fill="#d89a6d" ${S(5)}/>
     <path d="M84 186 L104 230 M92 186 L84 196" stroke="#c97a5a" stroke-width="4" stroke-linecap="round"/>`,
    `${headB('#e9b48a')}<path d="M62 260 Q64 340 150 362 Q236 340 238 260 Q236 300 196 318 Q150 336 104 318 Q64 300 62 260 Z" fill="#5a3a2a" opacity=".85"/>
     <path d="M106 276 Q150 308 194 276" fill="none" ${S(6)}/><path d="M104 268 Q130 256 148 268 Q168 256 196 268" fill="none" stroke="#3a2418" stroke-width="10" stroke-linecap="round"/>
     <rect x="156" y="282" width="14" height="14" rx="3" fill="#ffc83d" ${S(3)}/>`],
  ['Robot',
    `<path d="M150 64 V22" ${S(6)}/><circle cx="150" cy="18" r="13" fill="#ff4d6d" ${S(5)}/><circle cx="146" cy="14" r="4" fill="#fff"/>
     ${headT('#b8c4d6', true)}
     <rect x="80" y="104" width="140" height="62" rx="12" fill="#26324a" ${S(5)}/>
     <g class="fb-eyes"><rect x="96" y="118" width="38" height="30" rx="6" fill="#4ef0e0"/><rect x="166" y="118" width="38" height="30" rx="6" fill="#4ef0e0"/></g>
     ${[72, 228].map(x => `<circle cx="${x}" cy="80" r="5" fill="#8794aa"/>`).join('')}`,
    `<rect x="36" y="186" width="26" height="46" rx="6" fill="#ffc83d" ${S(5)}/><rect x="238" y="186" width="26" height="46" rx="6" fill="#ffc83d" ${S(5)}/>
     ${headM('#b8c4d6')}<path d="M150 186 L166 226 H134 Z" fill="#ff8a00" ${S(5)}/>
     ${[86, 214].map(x => `<circle cx="${x}" cy="210" r="9" fill="#d5dce8" ${S(4)}/><path d="M${x - 5} 210 H${x + 5}" ${S(3)}/>`).join('')}`,
    `${headB('#b8c4d6', true)}<rect x="94" y="270" width="112" height="50" rx="10" fill="#26324a" ${S(5)}/>
     ${[114, 136, 158, 180].map(x => `<rect x="${x}" y="278" width="10" height="34" rx="3" fill="#4ef0e0"/>`).join('')}
     ${[76, 224].map(x => `<circle cx="${x}" cy="334" r="5" fill="#8794aa"/>`).join('')}`],
  ['Kat',
    `<path d="M66 110 L72 22 L136 64 Z M234 110 L228 22 L164 64 Z" fill="#ffb347" ${S()}/><path d="M80 84 L84 42 L118 66 Z M220 84 L216 42 L182 66 Z" fill="#ff8fab"/>
     ${headT('#ffb347')}
     <path d="M130 62 L136 92 M150 58 V94 M170 62 L164 92" stroke="#e07b12" stroke-width="7" stroke-linecap="round"/>
     <g class="fb-eyes">${[112, 188].map(x => `<ellipse cx="${x}" cy="136" rx="20" ry="22" fill="#a6e05a" ${S(5)}/><ellipse cx="${x}" cy="136" rx="6" ry="17" fill="${INK}"/><circle cx="${x + 6}" cy="128" r="4" fill="#fff"/>`).join('')}</g>`,
    `${headM('#ffb347')}<path d="M62 190 H84 M62 230 H84 M216 190 H238 M216 230 H238" stroke="#e07b12" stroke-width="7" stroke-linecap="round"/>
     <ellipse cx="150" cy="226" rx="44" ry="30" fill="#fff4e0"/>
     <path d="M136 200 H164 L150 216 Z" fill="#ff6f91" ${S(5)}/>
     <path d="M104 218 L30 204 M104 228 L28 232 M196 218 L270 204 M196 228 L272 232" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    `${headB('#ffb347')}<path d="M108 246 Q100 300 150 306 Q200 300 192 246 Z" fill="#fff4e0"/>
     <path d="M150 246 V262 M122 262 Q136 284 150 262 Q164 284 178 262" fill="none" ${S(5)}/>
     <path d="M140 276 Q150 300 160 276" fill="#ff8fab" ${S(4)}/>`],
  ['Vampyr',
    `${headT(SK.pale)}
     <path d="M54 140 Q44 46 150 44 Q256 46 246 140 Q236 92 200 82 Q176 78 150 112 Q124 78 100 82 Q64 92 54 140 Z" fill="#1d1a2a" ${S()}/>
     <path d="M110 64 Q150 56 196 70" fill="none" stroke="#4b4466" stroke-width="5" stroke-linecap="round"/>
     ${brows(114, 36, -6, INK, 7)}
     <g class="fb-eyes">${[114, 186].map(x => `<circle cx="${x}" cy="140" r="13" fill="#fff" ${S(4)}/><circle cx="${x}" cy="141" r="7" fill="#c1121f"/>`).join('')}</g>`,
    `<path d="M66 190 L20 166 L50 230 Z M234 190 L280 166 L250 230 Z" fill="${SK.pale}" ${S()}/>
     ${headM(SK.pale)}<path d="M150 178 L166 222 Q150 230 134 222 Z" fill="#ddd4ee" ${S(5)}/>${cheeks('#b892d9', 0.35)}`,
    `<path d="M34 400 L60 268 L84 330 Z M266 400 L240 268 L216 330 Z" fill="#c1121f" ${S(5)}/>
     ${headB(SK.pale)}<path d="M112 276 Q150 306 188 276 Q150 290 112 276 Z" fill="#7a1530" ${S(5)}/>
     <path d="M124 281 L130 304 L136 284 Z M164 284 L170 304 L176 281 Z" fill="#fff" ${S(3)}/>`],
  ['Monster',
    `<path d="M82 92 Q60 40 84 14 Q90 52 116 72 Z M218 92 Q240 40 216 14 Q210 52 184 72 Z" fill="#fff1c9" ${S()}/>
     ${headT('#8bd17c')}
     <circle cx="98" cy="88" r="7" fill="#5fa851"/><circle cx="196" cy="76" r="9" fill="#5fa851"/>
     <g class="fb-eyes"><circle cx="150" cy="132" r="34" fill="#fff" ${S(5)}/><circle cx="154" cy="136" r="18" fill="#ff8a00"/><circle cx="154" cy="136" r="9" fill="${INK}"/><circle cx="160" cy="128" r="5" fill="#fff"/></g>
     <path d="M110 96 Q150 74 190 96" fill="none" stroke="#3e7a35" stroke-width="9" stroke-linecap="round"/>`,
    `<path d="M62 180 Q20 170 30 206 Q20 236 62 232" fill="#8bd17c" ${S()}/><path d="M238 180 Q280 170 270 206 Q280 236 238 232" fill="#8bd17c" ${S()}/>
     ${headM('#8bd17c')}<circle cx="138" cy="208" r="7" fill="${INK}"/><circle cx="162" cy="208" r="7" fill="${INK}"/>
     <circle cx="96" cy="222" r="8" fill="#5fa851"/><circle cx="212" cy="196" r="6" fill="#5fa851"/>`,
    `${headB('#8bd17c')}<path d="M80 262 Q150 380 220 262 Z" fill="#3a1630" ${S(5)}/>
     <path d="M82 264 L98 290 L112 266 L128 292 L142 268 L158 292 L172 268 L188 292 L202 266 L218 264 Z" fill="#fff" ${S(3)}/>
     <path d="M118 334 L130 316 L142 336 L158 316 L172 334 Q150 350 118 334 Z" fill="#fff" ${S(3)}/>`],
  ['Konge',
    `${headT(SK.tan)}
     <path d="M58 140 Q52 92 82 84 Q74 118 86 138 Z M242 140 Q248 92 218 84 Q226 118 214 138 Z" fill="#7a4a2a" ${S(5)}/>
     <path d="M78 96 L72 26 L112 62 L150 14 L188 62 L228 26 L222 96 Z" fill="#ffc83d" ${S()}/>
     <rect x="76" y="82" width="148" height="20" rx="6" fill="#ffb703" ${S(5)}/>
     <circle cx="150" cy="60" r="10" fill="#e63946" ${S(4)}/><circle cx="108" cy="78" r="7" fill="#3a86ff" ${S(3)}/><circle cx="192" cy="78" r="7" fill="#2ec4b6" ${S(3)}/>
     ${[72, 150, 228].map((x, i) => `<circle cx="${x}" cy="${[24, 12, 24][i]}" r="8" fill="#ffc83d" ${S(4)}/>`).join('')}
     ${brows(116, 36, 0, '#7a4a2a', 8)}${eyes(142)}`,
    `${ears(SK.tan)}${headM(SK.tan)}${cheeks('#ff7f9a', 0.5)}${nose('#e3a872', 14)}`,
    `${headB(SK.tan)}<path d="M100 300 Q120 330 150 400 Q180 330 200 300 Q150 320 100 300 Z" fill="#7a4a2a" ${S(5)}/>
     <path d="M150 268 Q120 252 100 268 Q86 282 76 266 Q84 296 112 286 Q132 280 150 276 Q168 280 188 286 Q216 296 224 266 Q214 282 200 268 Q180 252 150 268 Z" fill="#7a4a2a" ${S(5)}/>
     <path d="M132 296 Q150 308 168 296" fill="none" ${S(5)}/>`],
  ['Prinsesse',
    `<path d="M40 174 Q28 70 150 46 Q272 70 260 174 Z" fill="#ffd23f" ${S()}/>
     ${headT('#ffe3d3')}
     <path d="M60 130 Q60 60 150 56 Q240 60 240 130 Q220 86 170 86 Q150 104 120 90 Q76 92 60 130 Z" fill="#ffd23f" ${S()}/>
     <path d="M100 74 L112 40 L130 64 L150 30 L170 64 L188 40 L200 74 Z" fill="#e8f4ff" ${S(5)}/><circle cx="150" cy="52" r="7" fill="#ff4d8d" ${S(3)}/>
     ${eyes(142)}${lashes(142)}`,
    `<rect x="38" y="164" width="24" height="92" fill="#ffd23f"/><rect x="238" y="164" width="24" height="92" fill="#ffd23f"/>
     <path d="M40 164 V256 M260 164 V256" ${S()}/>
     ${headM('#ffe3d3')}${[92, 208].map(x => `<path d="M${x} 228 C${x - 22} 212 ${x - 10} 196 ${x} 208 C${x + 10} 196 ${x + 22} 212 ${x} 228 Z" fill="#ff8fab" opacity=".75"/>`).join('')}${nose('#f9c3a8', 8)}`,
    `<path d="M40 246 V310 Q44 340 66 330 Q60 300 62 246 Z M260 246 V310 Q256 340 234 330 Q240 300 238 246 Z" fill="#ffd23f" ${S()}/>
     ${headB('#ffe3d3')}<path d="M122 284 Q136 274 150 282 Q164 274 178 284 Q150 312 122 284 Z" fill="#ff4d8d" ${S(4)}/>`],
  ['Hund',
    `${headT('#d9a066')}
     <ellipse cx="190" cy="120" rx="34" ry="30" fill="#a8693a" opacity=".8"/>
     <path d="M70 70 Q20 70 22 150 Q30 176 56 166 Q66 120 84 92 Z M230 70 Q280 70 278 150 Q270 176 244 166 Q234 120 216 92 Z" fill="#7a4a2a" ${S()}/>
     ${eyes(132, 13)}`,
    `${headM('#d9a066')}<ellipse cx="150" cy="232" rx="52" ry="40" fill="#f5deb8"/>
     <path d="M126 196 Q150 184 174 196 Q174 218 150 222 Q126 218 126 196 Z" fill="${INK}"/><ellipse cx="142" cy="196" rx="8" ry="4" fill="#fff" opacity=".6"/>`,
    `${headB('#d9a066')}<path d="M100 246 Q100 300 150 302 Q200 300 200 246 Z" fill="#f5deb8"/>
     <path d="M150 246 V264 M118 264 Q134 282 150 264 Q166 282 182 264" fill="none" ${S(5)}/>
     <path d="M136 272 Q134 314 150 316 Q166 314 164 272 Z" fill="#ff6f91" ${S(5)}/><path d="M150 280 V304" stroke="#d94a6f" stroke-width="3"/>`],
  ['Rumvæsen',
    `<path d="M104 72 L70 18 M196 72 L230 18" ${S(6)}/><circle cx="68" cy="16" r="12" fill="#ffd23f" ${S(5)}/><circle cx="232" cy="16" r="12" fill="#ffd23f" ${S(5)}/>
     ${headT('#b392f0')}
     <g class="fb-eyes">${[[100, 140, 18], [150, 112, 20], [200, 140, 18]].map(([x, y, r]) =>
       `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S(5)}/><circle cx="${x + 2}" cy="${y + 2}" r="${r * 0.5}" fill="${INK}"/><circle cx="${x + 6}" cy="${y - 3}" r="3.5" fill="#fff"/>`).join('')}</g>`,
    `<path d="M62 180 L28 160 L36 204 L62 214" fill="#b392f0" ${S()}/><path d="M238 180 L272 160 L264 204 L238 214" fill="#b392f0" ${S()}/>
     ${headM('#b392f0')}<circle cx="140" cy="206" r="4" fill="${INK}"/><circle cx="160" cy="206" r="4" fill="${INK}"/>
     ${[[88, 196, 9], [210, 222, 11], [104, 232, 5], [196, 190, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9370db"/>`).join('')}`,
    `${headB('#b392f0')}<ellipse cx="150" cy="292" rx="16" ry="20" fill="#3a1630" ${S(5)}/>`],
  ['Baby',
    `${headT('#ffe0cc')}
     <path d="M150 58 Q170 30 150 20 Q128 22 140 40 Q150 48 158 36" fill="none" stroke="#e0a04a" stroke-width="7" stroke-linecap="round"/>
     ${bigEyes(140, 40, '#4a8fe7')}`,
    `${ears('#ffe0cc', 18, 24)}${headM('#ffe0cc')}${cheeks('#ff8fab', 0.7)}${nose('#ffc8ad', 8)}`,
    `${headB('#ffe0cc')}<ellipse cx="150" cy="292" rx="38" ry="18" fill="#3ec1f3" ${S(5)}/>
     <circle cx="150" cy="292" r="14" fill="#fff" ${S(4)}/><circle cx="150" cy="316" r="12" fill="none" stroke="#3ec1f3" stroke-width="6"/>`],
];
