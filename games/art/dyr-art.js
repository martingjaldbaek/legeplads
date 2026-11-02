/* SVG animals for "Saml dyret". Every animal lives in a 400×300 box with its feet on y≈272.
 * `body` stays on screen; each entry in `parts` is a loose piece the child drags into place.
 *   kind  – pieces of the same kind are interchangeable (any leg fits any leg slot)
 *   layer – 'back' (drawn behind the body) or 'front'
 *   o     – transform-origin for the part's walk animation (default per kind, see the game's CSS)
 * Elements with class "d" are details: they are hidden in the dashed "ghost" outline of a missing part.
 * Elements with class "line" are strokes, so the ghost never fills them.
 */
export const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// eyes (blinking), cheeks and a mouth that opens when the animal talks
function face(x, y, k = 1, { mouth = true, my = 0, mx = 0 } = {}) {
  const mX = x + mx, mY = y + (my || 13 * k);
  return `<g class="d">
    <g class="eyes"><circle cx="${x - 18 * k}" cy="${y}" r="${7 * k}" fill="${INK}"/><circle cx="${x + 18 * k}" cy="${y}" r="${7 * k}" fill="${INK}"/>
      <circle cx="${x - 16 * k}" cy="${y - 2.5 * k}" r="${2.4 * k}" fill="#fff"/><circle cx="${x + 20 * k}" cy="${y - 2.5 * k}" r="${2.4 * k}" fill="#fff"/></g>
    <circle cx="${x - 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".5"/><circle cx="${x + 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".5"/>
    ${mouth ? `<path class="m-closed" d="M${mX - 11 * k} ${mY} Q${mX} ${mY + 10 * k} ${mX + 11 * k} ${mY}" fill="none" ${ink(4 * k)}/>
    <ellipse class="m-open" cx="${mX}" cy="${mY + 5 * k}" rx="${9 * k}" ry="${11 * k}" fill="#a8324a" ${ink(3 * k)}/>` : ''}
  </g>`;
}
// a stroke drawn as ink outline + colour on top
const rope = (d, c, w) => `<path class="line" d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="line" d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- Ko ---------- */
const cowLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="182" width="32" height="90" rx="14" fill="#fff" ${ink(6)}/>
  <rect class="d" x="${x + 3}" y="254" width="26" height="15" rx="6" fill="${INK}"/>` });
const KO = {
  id: 'ko', name: 'Koen', line: 'Koen siger muuuh!',
  body: `<rect x="105" y="105" width="200" height="105" rx="48" fill="#fff" ${ink(6)}/>
    <ellipse cx="170" cy="138" rx="24" ry="17" fill="#3d3550"/><ellipse cx="252" cy="176" rx="26" ry="17" fill="#3d3550"/><ellipse cx="268" cy="128" rx="13" ry="9" fill="#3d3550"/>
    <ellipse cx="232" cy="210" rx="22" ry="11" fill="#ffb3c1" ${ink(4)}/>`,
  parts: [
    cowLeg(120), cowLeg(158), cowLeg(226), cowLeg(262),
    { kind: 'tail', layer: 'back', o: '0% 0%', svg: `${rope('M296 132 Q336 140 338 196', '#fff', 9)}
      <path d="M326 192 Q338 186 350 194 Q352 214 338 222 Q322 212 326 192 Z" fill="${INK}"/>` },
    { kind: 'head', layer: 'front', svg: `<path d="M60 72 Q44 48 58 38 Q64 56 76 64 Z" fill="#fff1c9" ${ink(4)}/><path d="M116 72 Q132 48 118 38 Q112 56 100 64 Z" fill="#fff1c9" ${ink(4)}/>
      <ellipse cx="36" cy="98" rx="24" ry="12" transform="rotate(-20 36 98)" fill="#fff" ${ink(5)}/><ellipse cx="140" cy="98" rx="24" ry="12" transform="rotate(20 140 98)" fill="#fff" ${ink(5)}/>
      <ellipse cx="88" cy="112" rx="50" ry="52" fill="#fff" ${ink(6)}/>
      <ellipse class="d" cx="66" cy="84" rx="15" ry="12" fill="#3d3550"/>
      <ellipse cx="88" cy="146" rx="40" ry="26" fill="#ffc2d1" ${ink(5)}/>
      <g class="d"><ellipse cx="74" cy="140" rx="5" ry="6" fill="${INK}"/><ellipse cx="102" cy="140" rx="5" ry="6" fill="${INK}"/></g>
      ${face(88, 104, 0.8, { my: 50 })}` },
  ],
};

/* ---------- Gris ---------- */
const pigLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="196" width="30" height="74" rx="13" fill="#ffb8cc" ${ink(6)}/>
  <rect class="d" x="${x + 3}" y="254" width="24" height="13" rx="6" fill="#c9607f"/>` });
const GRIS = {
  id: 'gris', name: 'Grisen', line: 'Grisen siger øf øf!',
  body: `<ellipse cx="195" cy="165" rx="108" ry="68" fill="#ffb8cc" ${ink(6)}/>
    <path d="M130 130 Q150 112 180 108" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>`,
  parts: [
    pigLeg(124), pigLeg(160), pigLeg(214), pigLeg(250),
    { kind: 'tail', layer: 'back', o: '100% 50%', svg: rope('M92 152 Q62 150 64 126 Q68 108 84 116 Q94 126 80 134 Q66 140 56 130', '#ff8fab', 8) },
    { kind: 'head', layer: 'front', svg: `<path d="M268 96 L258 50 L298 74 Z" fill="#ff9fb8" ${ink(5)}/><path d="M346 96 L356 50 L316 74 Z" fill="#ff9fb8" ${ink(5)}/>
      <circle cx="307" cy="134" r="56" fill="#ffb8cc" ${ink(6)}/>
      <ellipse cx="318" cy="158" rx="28" ry="20" fill="#ff8fab" ${ink(5)}/>
      <g class="d"><ellipse cx="308" cy="158" rx="5" ry="7" fill="#a8324a"/><ellipse cx="328" cy="158" rx="5" ry="7" fill="#a8324a"/></g>
      ${face(302, 118, 0.8, { mouth: false })}` },
  ],
};

/* ---------- Hund ---------- */
const dogLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="180" width="28" height="84" rx="13" fill="#e0a96d" ${ink(6)}/>
  <ellipse cx="${x + 14}" cy="264" rx="20" ry="11" fill="#f5d3a8" ${ink(5)}/>` });
const HUND = {
  id: 'hund', name: 'Hunden', line: 'Hunden siger vov vov!',
  body: `<rect x="110" y="118" width="190" height="88" rx="44" fill="#e0a96d" ${ink(6)}/>
    <ellipse cx="205" cy="186" rx="58" ry="12" fill="#f5d3a8"/><ellipse cx="160" cy="140" rx="22" ry="14" fill="#c58a52"/>`,
  parts: [
    dogLeg(124), dogLeg(160), dogLeg(232), dogLeg(266),
    { kind: 'tail', layer: 'back', o: '100% 100%', svg: rope('M120 146 Q90 136 82 94', '#e0a96d', 12) },
    { kind: 'head', layer: 'front', svg: `<path d="M280 76 Q248 86 256 146 Q272 152 284 132 Z" fill="#8a5a3b" ${ink(5)}/><path d="M352 76 Q384 86 376 146 Q360 152 348 132 Z" fill="#8a5a3b" ${ink(5)}/>
      <circle cx="316" cy="108" r="50" fill="#e0a96d" ${ink(6)}/>
      <ellipse class="d" cx="298" cy="98" rx="16" ry="15" fill="#c58a52"/>
      <ellipse cx="316" cy="134" rx="28" ry="20" fill="#f5d3a8" ${ink(5)}/>
      <ellipse class="d" cx="316" cy="124" rx="11" ry="8" fill="${INK}"/>
      ${face(316, 98, 0.75, { my: 44 })}` },
  ],
};

/* ---------- Kat ---------- */
const catLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="186" width="27" height="80" rx="12" fill="#ffad5c" ${ink(6)}/>
  <ellipse cx="${x + 13.5}" cy="266" rx="18" ry="9" fill="#fff" ${ink(5)}/>` });
const KAT = {
  id: 'kat', name: 'Katten', line: 'Katten siger miav!',
  body: `<ellipse cx="205" cy="170" rx="100" ry="56" fill="#ffad5c" ${ink(6)}/>
    <path d="M190 116 Q196 132 188 146 M222 116 Q228 132 220 146 M254 122 Q260 136 252 150" fill="none" stroke="#e8822a" stroke-width="7" stroke-linecap="round"/>`,
  parts: [
    catLeg(130), catLeg(163), catLeg(228), catLeg(262),
    { kind: 'tail', layer: 'back', o: '0% 100%', svg: rope('M296 164 Q350 158 346 96 Q344 74 326 78', '#ffad5c', 12) },
    { kind: 'head', layer: 'front', svg: `<path d="M50 96 L54 40 L94 74 Z" fill="#ffad5c" ${ink(5)}/><path d="M130 96 L126 40 L86 74 Z" fill="#ffad5c" ${ink(5)}/>
      <path class="d" d="M58 82 L60 54 L80 72 Z M122 82 L120 54 L100 72 Z" fill="#ff9fb8"/>
      <ellipse cx="90" cy="122" rx="56" ry="48" fill="#ffad5c" ${ink(6)}/>
      <path class="d" d="M84 128 L96 128 L90 136 Z" fill="#ff6f91" ${ink(3)}/>
      <path class="d line" d="M60 134 L24 128 M60 142 L26 148 M120 134 L156 128 M120 142 L154 148" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      ${face(90, 112, 0.8, { my: 34 })}` },
  ],
};

/* ---------- Hest ---------- */
const horseLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="180" width="25" height="92" rx="10" fill="#b97a4c" ${ink(6)}/>
  <rect class="d" x="${x + 2}" y="256" width="21" height="13" rx="4" fill="${INK}"/>` });
const HEST = {
  id: 'hest', name: 'Hesten', line: 'Hesten siger ihihihi!',
  body: `<rect x="112" y="112" width="186" height="86" rx="42" fill="#b97a4c" ${ink(6)}/>
    <ellipse cx="160" cy="135" rx="26" ry="12" fill="#d39565"/>`,
  parts: [
    horseLeg(126), horseLeg(160), horseLeg(240), horseLeg(272),
    { kind: 'tail', layer: 'back', o: '100% 0%', svg: `<path d="M122 132 Q78 140 80 218 Q98 212 104 184 Q110 150 128 144 Z" fill="#5a3a26" ${ink(5)}/>` },
    { kind: 'head', layer: 'front', o: '30% 100%', svg: `<path d="M262 124 Q252 76 290 44 L304 54 Q278 84 286 124 Z" fill="#5a3a26" ${ink(4)}/>
      <rect x="264" y="56" width="46" height="112" rx="22" transform="rotate(24 287 112)" fill="#b97a4c" ${ink(6)}/>
      <path d="M300 48 L298 18 L322 36 Z" fill="#b97a4c" ${ink(5)}/>
      <ellipse cx="326" cy="70" rx="50" ry="30" transform="rotate(22 326 70)" fill="#b97a4c" ${ink(6)}/>
      <ellipse cx="356" cy="86" rx="20" ry="16" fill="#e8b48a" ${ink(5)}/>
      <ellipse class="d" cx="362" cy="82" rx="4" ry="5" fill="${INK}"/>
      ${face(318, 58, 0.6, { my: 44, mx: 34 })}` },
  ],
};

/* ---------- And ---------- */
const duckLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="212" width="15" height="52" rx="6" fill="#ff8a00" ${ink(5)}/>
  <path d="M${x - 18} 270 Q${x + 7.5} 248 ${x + 33} 270 Q${x + 7.5} 278 ${x - 18} 270 Z" fill="#ff8a00" ${ink(5)}/>` });
const AND = {
  id: 'and', name: 'Anden', line: 'Anden siger rap rap!',
  body: `<ellipse cx="195" cy="168" rx="102" ry="62" fill="#ffd23f" ${ink(6)}/>`,
  parts: [
    duckLeg(166), duckLeg(218),
    { kind: 'tail', layer: 'back', o: '100% 100%', svg: `<path d="M104 160 L62 118 L74 176 Z" fill="#ffd23f" ${ink(6)}/>` },
    { kind: 'wing', layer: 'front', o: '85% 20%', svg: `<path d="M140 150 Q196 116 254 148 Q236 206 168 194 Q136 184 140 150 Z" fill="#ffc300" ${ink(6)}/>
      <path class="d line" d="M170 160 Q196 172 224 162 M172 176 Q196 186 220 178" fill="none" stroke="#e0a400" stroke-width="5" stroke-linecap="round"/>` },
    { kind: 'head', layer: 'front', svg: `<circle cx="290" cy="96" r="48" fill="#ffd23f" ${ink(6)}/>
      <path d="M322 100 Q366 92 374 108 Q352 128 322 118 Z" fill="#ff8a00" ${ink(5)}/>
      ${face(284, 88, 0.7, { mouth: false })}` },
  ],
};

/* ---------- Elefant ---------- */
const eleLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="186" width="40" height="84" rx="15" fill="#aab8cc" ${ink(6)}/>
  <g class="d"><circle cx="${x + 10}" cy="262" r="5" fill="#fff"/><circle cx="${x + 20}" cy="264" r="5" fill="#fff"/><circle cx="${x + 30}" cy="262" r="5" fill="#fff"/></g>` });
const ELEFANT = {
  id: 'elefant', name: 'Elefanten', line: 'Elefanten siger truuut!',
  body: `<ellipse cx="225" cy="155" rx="112" ry="76" fill="#aab8cc" ${ink(6)}/>
    <path d="M200 100 Q240 86 280 100" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".5"/>`,
  parts: [
    eleLeg(140), eleLeg(184), eleLeg(244), eleLeg(286),
    { kind: 'tail', layer: 'back', o: '0% 0%', svg: `${rope('M330 150 Q352 166 352 204', '#aab8cc', 7)}<path d="M344 200 Q352 194 362 202 Q360 218 352 222 Q342 214 344 200 Z" fill="${INK}"/>` },
    { kind: 'head', layer: 'front', o: '80% 80%', svg: `<path d="M78 140 Q72 196 40 214 Q24 220 22 206 Q48 190 56 140 Z" fill="#aab8cc" ${ink(6)}/>
      <circle cx="96" cy="116" r="58" fill="#aab8cc" ${ink(6)}/>
      <path class="d line" d="M46 186 L56 190 M50 170 L62 172" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      ${face(94, 104, 0.8, { mouth: false })}` },
    { kind: 'ear', layer: 'front', o: '0% 50%', svg: `<path d="M136 72 Q196 66 192 126 Q190 178 140 168 Q118 120 136 72 Z" fill="#c3cfe0" ${ink(6)}/>
      <path class="d" d="M146 90 Q180 90 178 126 Q176 156 150 152 Q138 120 146 90 Z" fill="#ffc2d1"/>` },
  ],
};

/* ---------- Giraf ---------- */
const girLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="196" width="23" height="76" rx="10" fill="#ffcf5c" ${ink(6)}/>
  <rect class="d" x="${x + 2}" y="258" width="19" height="12" rx="4" fill="#8a5a3b"/>` });
const spot = (x, y, r) => `<path d="M${x - r} ${y} Q${x - r} ${y - r} ${x} ${y - r * 0.9} Q${x + r} ${y - r} ${x + r * 0.9} ${y} Q${x + r} ${y + r} ${x} ${y + r * 0.9} Q${x - r} ${y + r} ${x - r} ${y} Z" fill="#c98a4b"/>`;
const GIRAF = {
  id: 'giraf', name: 'Giraffen', line: 'Giraffen har en laaang hals!',
  body: `<rect x="128" y="142" width="172" height="72" rx="34" fill="#ffcf5c" ${ink(6)}/>
    <path d="M250 176 L274 80 Q296 70 316 84 L296 182 Z" fill="#ffcf5c"/>
    <path d="M254 150 L274 80 Q296 70 316 84 L301 156" fill="none" ${ink(6)}/>
    ${spot(165, 168, 13)}${spot(205, 186, 11)}${spot(240, 162, 12)}${spot(280, 132, 9)}${spot(292, 100, 8)}${spot(150, 196, 8)}`,
  parts: [
    girLeg(140), girLeg(170), girLeg(240), girLeg(268),
    { kind: 'tail', layer: 'back', o: '100% 0%', svg: `${rope('M134 160 Q112 176 108 212', '#ffcf5c', 6)}<path d="M100 208 Q108 202 118 210 Q116 228 108 232 Q98 224 100 208 Z" fill="#8a5a3b"/>` },
    { kind: 'head', layer: 'front', o: '30% 100%', svg: `<rect x="282" y="22" width="9" height="24" rx="4" fill="#ffcf5c" ${ink(4)}/><rect x="306" y="22" width="9" height="24" rx="4" fill="#ffcf5c" ${ink(4)}/>
      <circle cx="286.5" cy="22" r="8" fill="#8a5a3b" ${ink(4)}/><circle cx="310.5" cy="22" r="8" fill="#8a5a3b" ${ink(4)}/>
      <ellipse cx="270" cy="56" rx="16" ry="8" transform="rotate(-20 270 56)" fill="#ffcf5c" ${ink(5)}/>
      <ellipse cx="300" cy="66" rx="40" ry="28" fill="#ffcf5c" ${ink(6)}/>
      <ellipse cx="328" cy="74" rx="22" ry="17" fill="#ffe3a0" ${ink(5)}/>
      ${face(296, 58, 0.6, { my: 26, mx: 30 })}` },
  ],
};

/* ---------- Dinosaur ---------- */
const dinoLeg = x => ({ kind: 'leg', layer: 'back', svg: `<rect x="${x}" y="190" width="42" height="76" rx="18" fill="#6bd17a" ${ink(6)}/>
  <path d="M${x - 4} 266 Q${x + 21} 254 ${x + 46} 266 Q${x + 21} 278 ${x - 4} 266 Z" fill="#6bd17a" ${ink(5)}/>
  <g class="d"><circle cx="${x + 8}" cy="266" r="4" fill="#fff"/><circle cx="${x + 21}" cy="268" r="4" fill="#fff"/><circle cx="${x + 34}" cy="266" r="4" fill="#fff"/></g>` });
const dinoArm = (x, y) => ({ kind: 'arm', layer: 'front', svg: `<rect x="${x}" y="${y}" width="18" height="42" rx="9" transform="rotate(-30 ${x + 9} ${y})" fill="#6bd17a" ${ink(5)}/>` });
const DINO = {
  id: 'dino', name: 'Dinosauren', line: 'Dinosauren siger roooar!',
  body: `<ellipse cx="200" cy="165" rx="96" ry="62" fill="#6bd17a" ${ink(6)}/>
    <ellipse cx="214" cy="190" rx="54" ry="24" fill="#c8f2b0"/>`,
  parts: [
    dinoLeg(140), dinoLeg(214),
    dinoArm(262, 160), dinoArm(242, 172),
    { kind: 'spikes', layer: 'back', o: '50% 100%', svg: `<path d="M124 134 L138 92 L160 114 L180 76 L200 108 L222 74 L242 112 L262 90 L278 134 Z" fill="#ff8a00" ${ink(5)}/>` },
    { kind: 'tail', layer: 'back', o: '100% 30%', svg: `<path d="M120 140 Q60 146 14 196 Q70 194 126 182 Z" fill="#6bd17a" ${ink(6)}/>` },
    { kind: 'head', layer: 'front', svg: `<ellipse cx="306" cy="94" rx="58" ry="44" fill="#6bd17a" ${ink(6)}/>
      <g class="d"><ellipse cx="344" cy="80" rx="4" ry="5" fill="${INK}"/><ellipse cx="356" cy="84" rx="4" ry="5" fill="${INK}"/></g>
      ${face(296, 82, 0.8, { my: 22, mx: 16 })}` },
  ],
};

/* ---------- Sommerfugl ---------- */
const SOMMERFUGL = {
  id: 'sommerfugl', name: 'Sommerfuglen', line: 'Sommerfuglen flyver!', fly: true,
  body: `<ellipse cx="200" cy="170" rx="20" ry="72" fill="#8338ec" ${ink(6)}/>
    <path d="M184 140 H216 M182 170 H218 M186 200 H214" fill="none" stroke="#b388ff" stroke-width="7" stroke-linecap="round"/>`,
  parts: [
    { kind: 'wing', layer: 'back', o: '100% 80%', svg: `<path d="M190 136 Q120 40 46 80 Q30 150 190 160 Z" fill="#ff5d8f" ${ink(6)}/>
      <g class="d"><circle cx="100" cy="104" r="18" fill="#ffd23f"/><circle cx="148" cy="130" r="10" fill="#fff"/></g>` },
    { kind: 'wing', layer: 'back', o: '0% 80%', svg: `<path d="M210 136 Q280 40 354 80 Q370 150 210 160 Z" fill="#ff5d8f" ${ink(6)}/>
      <g class="d"><circle cx="300" cy="104" r="18" fill="#ffd23f"/><circle cx="252" cy="130" r="10" fill="#fff"/></g>` },
    { kind: 'wing2', layer: 'back', o: '100% 10%', svg: `<path d="M192 168 Q100 156 82 216 Q120 268 192 196 Z" fill="#2ec4b6" ${ink(6)}/>
      <circle class="d" cx="128" cy="210" r="13" fill="#fff"/>` },
    { kind: 'wing2', layer: 'back', o: '0% 10%', svg: `<path d="M208 168 Q300 156 318 216 Q280 268 208 196 Z" fill="#2ec4b6" ${ink(6)}/>
      <circle class="d" cx="272" cy="210" r="13" fill="#fff"/>` },
    { kind: 'head', layer: 'front', svg: `${rope('M190 70 Q178 40 158 30', INK, 1)}${rope('M210 70 Q222 40 242 30', INK, 1)}
      <circle cx="156" cy="28" r="9" fill="#ffd23f" ${ink(4)}/><circle cx="244" cy="28" r="9" fill="#ffd23f" ${ink(4)}/>
      <circle cx="200" cy="86" r="32" fill="#c9a7ff" ${ink(6)}/>
      ${face(200, 82, 0.55, { my: 12 })}` },
  ],
};

export const ANIMALS = [KO, GRIS, HUND, KAT, HEST, AND, ELEFANT, GIRAF, DINO, SOMMERFUGL];
