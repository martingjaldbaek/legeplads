/* SVG art for Klæd på: a child in underwear, clothes drawn in the child's own coordinates (so wearing an
 * item is just dropping its markup into the matching slot), and the weather seen through the window.
 * Character box: viewBox -30 -115 390 660. Head centre (150,95), hands (68,330) and (232,330), feet y≈510.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const SKIN = '#ffd9b8';
export const CHAR_VIEWBOX = '-30 -115 390 660';

// two-tone thick stroke (outline + fill colour) along a path: arms, legs and sleeves
const limb = (d, col, w) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 8}" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
const ARM_L = 'M110 190 Q82 250 72 318', ARM_R = 'M190 190 Q218 250 228 318';
const sleeves = (col, w = 34) => limb(ARM_L, col, w) + limb(ARM_R, col, w);

// Slots are drawn in this order (later = on top). The body parts are interleaved in CHAR below.
export const SLOTS = ['legs', 'feet', 'torso', 'neck', 'eyes', 'head', 'held', 'hands'];

export const CHAR = `
<g class="kp-figure">
  ${limb('M128 340 V496', SKIN, 30)}${limb('M172 340 V496', SKIN, 30)}
  <ellipse cx="120" cy="506" rx="26" ry="14" fill="${SKIN}" ${ink(4)}/><ellipse cx="180" cy="506" rx="26" ry="14" fill="${SKIN}" ${ink(4)}/>
  <path d="M104 178 Q150 162 196 178 L200 330 Q150 344 100 330 Z" fill="${SKIN}" ${ink(5)}/>
  <path d="M114 184 Q150 204 186 184 L193 322 Q150 334 107 322 Z" fill="#fff" ${ink(4)}/>
  <path d="M100 318 Q150 332 200 318 L202 360 Q186 372 168 362 L150 350 L132 362 Q114 372 98 360 Z" fill="#7ecbff" ${ink(4)}/>
  <g class="kp-slot" data-slot="legs"></g>
  <g class="kp-slot" data-slot="feet"></g>
  ${limb(ARM_L, SKIN, 26)}${limb(ARM_R, SKIN, 26)}
  <circle cx="70" cy="330" r="17" fill="${SKIN}" ${ink(4)}/><circle cx="230" cy="330" r="17" fill="${SKIN}" ${ink(4)}/>
  <g class="kp-slot" data-slot="torso"></g>
  <rect x="137" y="140" width="26" height="40" fill="${SKIN}" ${ink(4)}/>
  <circle cx="88" cy="100" r="14" fill="${SKIN}" ${ink(4)}/><circle cx="212" cy="100" r="14" fill="${SKIN}" ${ink(4)}/>
  <circle cx="150" cy="95" r="62" fill="${SKIN}" ${ink(5)}/>
  <path d="M94 82 Q100 30 150 32 Q200 30 206 84 Q188 58 162 64 Q152 48 134 64 Q112 58 94 82 Z" fill="#8a5a3b" ${ink(4)}/>
  <g class="kp-face">
    <g class="kp-eyes"><circle cx="128" cy="96" r="7" fill="${INK}"/><circle cx="172" cy="96" r="7" fill="${INK}"/>
      <circle cx="130" cy="93" r="2.4" fill="#fff"/><circle cx="174" cy="93" r="2.4" fill="#fff"/></g>
    <circle class="kp-cheek" cx="112" cy="116" r="9" fill="#ff8fab" opacity=".5"/><circle class="kp-cheek" cx="188" cy="116" r="9" fill="#ff8fab" opacity=".5"/>
    <path class="kp-m-smile" d="M136 120 Q150 134 164 120" fill="none" ${ink(4)}/>
    <path class="kp-m-open" d="M134 118 Q150 146 166 118 Z" fill="#a8324a" ${ink(4)}/>
    <path class="kp-m-wave" d="M134 126 Q140 120 146 126 Q152 132 158 126 Q164 120 168 126" fill="none" ${ink(4)}/>
    <g class="kp-sweat"><path d="M206 50 Q214 64 206 70 Q198 64 206 50 Z" fill="#8fd3ff" ${ink(3)}/>
      <path d="M92 58 Q99 70 92 76 Q85 70 92 58 Z" fill="#8fd3ff" ${ink(3)}/></g>
  </g>
  <g class="kp-slot" data-slot="neck"></g>
  <g class="kp-slot" data-slot="eyes"></g>
  <g class="kp-slot" data-slot="head"></g>
  <g class="kp-slot" data-slot="held"></g>
  <g class="kp-slot" data-slot="hands"></g>
</g>`;

/* Clothes. w = the weathers it suits; warm/cool drive the "too hot"/"freezing" reactions in the wrong weather. */
const jacketBody = (col, long = 340) => `<path d="M100 172 Q150 158 200 172 L204 ${long} Q150 ${long + 12} 96 ${long} Z" fill="${col}" ${ink(5)}/>`;
const bootPair = (col, cuff) => `
  <path d="M106 446 H150 V524 H92 Q88 506 106 498 Z" fill="${col}" ${ink(4)}/>
  <path d="M150 446 H194 V498 Q212 506 208 524 H150 Z" fill="${col}" ${ink(4)}/>
  ${cuff ? `<rect x="102" y="440" width="52" height="18" rx="8" fill="${cuff}" ${ink(4)}/><rect x="146" y="440" width="52" height="18" rx="8" fill="${cuff}" ${ink(4)}/>` : ''}`;

export const ITEMS = {
  solhat: { slot: 'head', name: 'Solhat', w: ['sol'], cool: true, svg: `
    <ellipse cx="150" cy="62" rx="112" ry="22" fill="#f4d58d" ${ink(5)}/>
    <path d="M102 62 Q104 12 150 12 Q196 12 198 62 Z" fill="#f4d58d" ${ink(5)}/>
    <path d="M103 50 Q150 60 197 50" fill="none" stroke="#ff6fa0" stroke-width="10"/>` },
  kasket: { slot: 'head', name: 'Kasket', w: ['sol'], svg: `
    <path d="M150 66 Q196 58 240 74 Q206 88 150 78 Z" fill="#e63946" ${ink(4)}/>
    <path d="M92 72 Q94 22 150 22 Q206 22 208 72 Z" fill="#ff4d6d" ${ink(5)}/>
    <circle cx="150" cy="24" r="6" fill="#ffd23f" ${ink(3)}/>` },
  sydvest: { slot: 'head', name: 'Regnhat', w: ['regn'], svg: `
    <path d="M60 82 Q150 50 240 82 Q246 96 232 98 Q150 74 68 98 Q54 96 60 82 Z" fill="#ffd23f" ${ink(5)}/>
    <path d="M94 76 Q96 20 150 20 Q204 20 206 76 Z" fill="#ffd23f" ${ink(5)}/>
    <path d="M110 40 Q150 28 190 40" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>` },
  hue: { slot: 'head', name: 'Hue', w: ['sne', 'blæst'], warm: true, svg: `
    <path d="M90 82 Q86 20 150 18 Q214 20 210 82 Z" fill="#8338ec" ${ink(5)}/>
    <rect x="86" y="66" width="128" height="26" rx="12" fill="#a66bff" ${ink(4)}/>
    <path d="M110 70 V88 M130 70 V88 M150 70 V88 M170 70 V88 M190 70 V88" stroke="#7a2fd6" stroke-width="3"/>
    <circle cx="150" cy="14" r="18" fill="#fff" ${ink(4)}/>` },
  solbriller: { slot: 'eyes', name: 'Solbriller', w: ['sol'], svg: `
    <rect x="108" y="82" width="38" height="28" rx="10" fill="#26232e" ${ink(4)}/>
    <rect x="154" y="82" width="38" height="28" rx="10" fill="#26232e" ${ink(4)}/>
    <path d="M146 92 H154 M108 90 L92 86 M192 90 L208 86" ${ink(4)}/>
    <path d="M116 88 L124 96 M162 88 L170 96" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>` },
  halstorklaede: { slot: 'neck', name: 'Halstørklæde', w: ['sne', 'blæst'], warm: true, svg: `
    <path d="M160 176 L176 252 L154 256 L144 182 Z" fill="#ff4d6d" ${ink(4)}/>
    <path d="M160 214 L170 212 M165 236 L174 234" stroke="#fff" stroke-width="6"/>
    <path d="M112 156 Q150 180 188 156 L192 178 Q150 204 108 178 Z" fill="#ff4d6d" ${ink(5)}/>
    <path d="M130 172 L132 192 M150 176 V198 M170 172 L168 192" stroke="#fff" stroke-width="6"/>` },
  vanter: { slot: 'hands', name: 'Vanter', w: ['sne'], warm: true, svg: `
    <path d="M52 316 Q52 300 70 300 Q88 300 88 318 V346 Q70 360 52 346 Z" fill="#2ec4b6" ${ink(4)}/>
    <ellipse cx="90" cy="326" rx="7" ry="11" fill="#2ec4b6" ${ink(4)}/>
    <rect x="50" y="300" width="40" height="12" rx="5" fill="#fff" ${ink(3)}/>
    <path d="M212 316 Q212 300 230 300 Q248 300 248 318 V346 Q230 360 212 346 Z" fill="#2ec4b6" ${ink(4)}/>
    <ellipse cx="210" cy="326" rx="7" ry="11" fill="#2ec4b6" ${ink(4)}/>
    <rect x="210" y="300" width="40" height="12" rx="5" fill="#fff" ${ink(3)}/>` },
  tshirt: { slot: 'torso', name: 'T-shirt', w: ['sol'], cool: true, svg: `
    <path d="M104 176 Q150 162 196 176 L234 214 L214 240 L198 224 L200 330 Q150 344 100 330 L102 224 L86 240 L66 214 Z" fill="#ffb703" ${ink(5)}/>
    <path d="M150 230 l9 18 20 3 -14 14 3 20 -18 -9 -18 9 3 -20 -14 -14 20 -3 Z" fill="#fff" ${ink(3)}/>` },
  jakke: { slot: 'torso', name: 'Jakke', w: ['blæst', 'regn'], svg: `
    ${sleeves('#06a77d')}${jacketBody('#06a77d')}
    <path d="M150 168 V350" ${ink(3)}/><path d="M120 170 L150 200 L180 170" fill="none" ${ink(4)}/>
    <rect x="112" y="270" width="26" height="22" rx="4" fill="#058a67" ${ink(3)}/><rect x="162" y="270" width="26" height="22" rx="4" fill="#058a67" ${ink(3)}/>` },
  vinterjakke: { slot: 'torso', name: 'Vinterjakke', w: ['sne'], warm: true, svg: `
    ${sleeves('#3a86ff', 44)}${jacketBody('#3a86ff', 346)}
    <path d="M100 222 H200 M98 272 H202 M97 318 H203" stroke="#2a6ad8" stroke-width="4"/>
    <path d="M150 168 V356" ${ink(3)}/>
    <path d="M108 172 Q150 204 192 172" fill="none" stroke="#fff5e0" stroke-width="20" stroke-linecap="round"/>` },
  regnfrakke: { slot: 'torso', name: 'Regnfrakke', w: ['regn'], svg: `
    ${sleeves('#ffd23f', 38)}
    <path d="M100 172 Q150 158 200 172 L216 386 Q150 398 84 386 Z" fill="#ffd23f" ${ink(5)}/>
    ${[214, 254, 294, 334].map(y => `<circle cx="164" cy="${y}" r="6" fill="${INK}"/>`).join('')}
    <path d="M118 170 L150 196 L182 170" fill="none" ${ink(4)}/>` },
  shorts: { slot: 'legs', name: 'Shorts', w: ['sol'], cool: true, svg: `
    <path d="M98 314 Q150 330 202 314 L208 394 L158 398 L150 362 L142 398 L92 394 Z" fill="#ff8a00" ${ink(5)}/>
    <path d="M150 330 V356" ${ink(3)}/>` },
  badebukser: { slot: 'legs', name: 'Badebukser', w: ['sol'], cool: true, svg: `
    <path d="M98 316 Q150 332 202 316 L205 370 L156 372 L150 352 L144 372 L95 370 Z" fill="#00a6fb" ${ink(5)}/>
    <circle cx="118" cy="340" r="7" fill="#ffd23f"/><circle cx="180" cy="346" r="7" fill="#ff6fa0"/><circle cx="150" cy="334" r="5" fill="#fff"/>` },
  bukser: { slot: 'legs', name: 'Bukser', w: ['blæst', 'regn'], svg: `
    <path d="M98 314 Q150 330 202 314 L198 496 L154 496 L150 376 L146 496 L102 496 Z" fill="#4f7cd1" ${ink(5)}/>
    <path d="M150 330 V360 M112 340 Q120 352 132 344" fill="none" ${ink(3)}/>` },
  snebukser: { slot: 'legs', name: 'Flyverdragt', w: ['sne'], warm: true, svg: `
    <path d="M120 318 L116 184 M180 318 L184 184" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M120 318 L116 184 M180 318 L184 184" stroke="#e63946" stroke-width="9" stroke-linecap="round"/>
    <path d="M92 310 Q150 326 208 310 L204 498 L154 498 L150 384 L146 498 L96 498 Z" fill="#e63946" ${ink(5)}/>
    <path d="M100 420 H146 M154 420 H200" stroke="#ffd23f" stroke-width="8"/>` },
  sandaler: { slot: 'feet', name: 'Sandaler', w: ['sol'], cool: true, svg: `
    <ellipse cx="120" cy="516" rx="30" ry="9" fill="#c98a4b" ${ink(3)}/><ellipse cx="180" cy="516" rx="30" ry="9" fill="#c98a4b" ${ink(3)}/>
    <path d="M102 506 Q120 494 138 506 M162 506 Q180 494 198 506" fill="none" stroke="#ff4d6d" stroke-width="8" stroke-linecap="round"/>` },
  gummistovler: { slot: 'feet', name: 'Gummistøvler', w: ['regn'], svg: bootPair('#2ec4b6') },
  vinterstovler: { slot: 'feet', name: 'Vinterstøvler', w: ['sne'], warm: true, svg: bootPair('#8d5a3b', '#fff5e0') },
  paraply: { slot: 'held', name: 'Paraply', w: ['regn'], svg: `
    <path d="M230 340 V-14" ${ink(7)}/><path d="M230 340 Q230 362 248 360" fill="none" ${ink(7)}/>
    <path d="M118 -12 Q230 -120 342 -12 Q314 -28 286 -12 Q258 -28 230 -12 Q202 -28 174 -12 Q146 -28 118 -12 Z" fill="#ff4d6d" ${ink(5)}/>
    <path d="M174 -12 Q190 -70 230 -88 M286 -12 Q270 -70 230 -88" fill="none" ${ink(3)}/>
    <path d="M140 -30 Q160 -70 200 -84" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>` },
  drage: { slot: 'held', name: 'Drage', w: ['blæst'], svg: `
    <path class="kp-kite-string" d="M230 330 Q306 160 312 -40" fill="none" ${ink(2.5)}/>
    <g class="kp-kite"><path d="M312 -104 L346 -62 L312 -14 L278 -62 Z" fill="#ffd23f" ${ink(4)}/>
      <path d="M312 -104 L312 -14 M278 -62 L346 -62" ${ink(3)}/><path d="M312 -104 L346 -62 L312 -62 Z" fill="#ff4d6d"/><path d="M312 -62 L278 -62 L312 -14 Z" fill="#3a86ff"/>
      <path d="M312 -14 Q300 10 316 30 Q330 50 314 70" fill="none" ${ink(2.5)}/>
      <path d="M302 8 l12 6 -12 6 Z M316 40 l12 6 -12 6 Z" fill="#8338ec" ${ink(2)}/></g>` },
  is: { slot: 'held', name: 'Is', w: ['sol'], cool: true, svg: `
    <path d="M214 304 L246 304 L230 354 Z" fill="#e0a96d" ${ink(4)}/>
    <path d="M220 316 L240 316 M224 330 L236 330" stroke="#b9824c" stroke-width="3"/>
    <circle cx="230" cy="290" r="19" fill="#ffafcc" ${ink(4)}/><circle cx="230" cy="262" r="15" fill="#fff5e0" ${ink(4)}/>
    <circle cx="232" cy="248" r="6" fill="#e63946" ${ink(3)}/>` },
};
// tighter pictures for the wardrobe tiles where the worn item is mostly empty space
const MITT = c => `<path d="M52 316 Q52 300 70 300 Q88 300 88 318 V346 Q70 360 52 346 Z" fill="${c}" ${ink(4)}/>
  <ellipse cx="90" cy="326" rx="7" ry="11" fill="${c}" ${ink(4)}/><rect x="50" y="300" width="40" height="12" rx="5" fill="#fff" ${ink(3)}/>`;
ITEMS.vanter.icon = MITT('#2ec4b6') + `<g transform="translate(150 0) scale(-1 1) translate(-150 0) translate(108 0)">${MITT('#2ec4b6')}</g>`;
ITEMS.paraply.icon = ITEMS.paraply.svg.replace('M230 340 V-14', 'M230 60 V-14').replace('M230 340 Q230 362 248 360', 'M230 60 Q230 82 248 80');
ITEMS.drage.icon = ITEMS.drage.svg.replace(/<path class="kp-kite-string"[^>]*\/>/, '');

// order in the wardrobe: grouped by weather so the tray reads as sun / rain / snow / wind
export const WARDROBE = ['solhat', 'kasket', 'solbriller', 'tshirt', 'shorts', 'badebukser', 'sandaler', 'is',
  'sydvest', 'regnfrakke', 'gummistovler', 'paraply', 'hue', 'halstorklaede', 'vanter', 'vinterjakke',
  'snebukser', 'vinterstovler', 'jakke', 'bukser', 'drage'];

/* The weather outside the window: viewBox 0 0 400 300, drawn with slice so it can grow to fill the screen. */
const rnd = (a, b) => a + Math.random() * (b - a);
export function weatherSVG(w) {
  const sky = { sol: '#8fd3ff', regn: '#93a3b8', sne: '#c4d3e6', 'blæst': '#a9d8f2' }[w];
  const ground = w === 'sne' ? '#f4f8ff' : '#8bd16a';
  const cloud = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 10 Q-44 -14 -20 -14 Q-12 -34 10 -28 Q30 -36 38 -12 Q56 -8 50 10 Z" fill="${c}" ${ink(3)}/></g>`;
  let fx = '';
  if (w === 'sol') {
    fx = `<g class="kp-sun" transform="translate(320 70)"><g class="kp-rays">${Array.from({ length: 10 }, (_, i) =>
      `<path d="M0 -52 V-70" stroke="#ffb703" stroke-width="8" stroke-linecap="round" transform="rotate(${i * 36})"/>`).join('')}</g>
      <circle r="38" fill="#ffd23f" ${ink(4)}/><circle cx="-12" cy="-6" r="4" fill="${INK}"/><circle cx="12" cy="-6" r="4" fill="${INK}"/>
      <path d="M-12 10 Q0 20 12 10" fill="none" ${ink(3)}/></g>${cloud(90, 70, 1, '#fff')}`;
  } else if (w === 'regn') {
    fx = cloud(80, 50, 1.6, '#e3e8ef') + cloud(220, 40, 1.9, '#d4dbe5') + cloud(340, 60, 1.5, '#e3e8ef') +
      Array.from({ length: 46 }, () => `<path class="kp-drop" d="M${rnd(-20, 420)} ${rnd(-300, 0)} l-4 14" stroke="#3a86ff" stroke-width="3" stroke-linecap="round"
        style="animation-delay:-${rnd(0, 1).toFixed(2)}s; animation-duration:${rnd(.6, .9).toFixed(2)}s"/>`).join('');
  } else if (w === 'sne') {
    fx = cloud(100, 46, 1.5, '#fff') + cloud(290, 50, 1.7, '#f4f6fb') +
      Array.from({ length: 50 }, () => `<circle class="kp-flake" cx="${rnd(-10, 410)}" cy="${rnd(-300, 0)}" r="${rnd(3, 6).toFixed(1)}" fill="#fff"
        style="animation-delay:-${rnd(0, 4).toFixed(2)}s; animation-duration:${rnd(3, 5).toFixed(2)}s"/>`).join('') +
      `<g transform="translate(330 220)"><circle cy="20" r="26" fill="#fff" ${ink(3)}/><circle cy="-14" r="18" fill="#fff" ${ink(3)}/>
        <path d="M-2 -14 l14 3 -14 3 Z" fill="#ff8a00"/><circle cx="-6" cy="-20" r="2.5" fill="${INK}"/><circle cx="6" cy="-20" r="2.5" fill="${INK}"/></g>`;
  } else {
    fx = `<g class="kp-cloudrun">${cloud(60, 60, 1.2, '#fff')}${cloud(260, 40, 1, '#fff')}${cloud(460, 70, 1.3, '#fff')}</g>` +
      Array.from({ length: 10 }, () => `<path class="kp-gust" d="M${rnd(-200, 0)} ${rnd(40, 240)} q40 -10 80 0 t80 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"
        style="animation-delay:-${rnd(0, 2).toFixed(2)}s"/>`).join('') +
      Array.from({ length: 8 }, () => `<path class="kp-leaf" d="M${rnd(-150, 0)} ${rnd(60, 260)} q10 -12 20 0 q-10 12 -20 0 Z" fill="${['#ff8a00', '#e63946', '#ffb703'][Math.floor(rnd(0, 3))]}"
        style="animation-delay:-${rnd(0, 3).toFixed(2)}s"/>`).join('') +
      `<g transform="translate(340 250)"><g class="kp-tree"><rect x="-6" y="-40" width="12" height="40" fill="#8d5a3b"/><circle cy="-60" r="34" fill="#4caf50" ${ink(3)}/></g></g>`;
  }
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
    <rect width="400" height="300" fill="${sky}"/>
    <path d="M-20 300 V230 Q100 200 210 226 Q320 250 420 222 V300 Z" fill="${ground}"/>
    ${w === 'regn' ? '<ellipse class="kp-puddle" cx="200" cy="268" rx="70" ry="10" fill="#6d90c9" opacity=".7"/>' : ''}
    ${fx}</svg>`;
}
export const WEATHER_CSS = `
.kp-rays { animation: kp-spin 12s linear infinite; }
.kp-drop { animation: kp-fall linear infinite; }
.kp-flake { animation: kp-snow linear infinite; }
.kp-gust { animation: kp-gust 2s linear infinite; }
.kp-leaf { animation: kp-leaf 3s linear infinite; transform-box: fill-box; }
.kp-cloudrun { animation: kp-cloudrun 9s linear infinite; }
.kp-tree { transform-box: fill-box; transform-origin: 50% 100%; animation: kp-sway 1s ease-in-out infinite alternate; }
@keyframes kp-spin { to { transform: rotate(360deg) } }
@keyframes kp-fall { to { transform: translate(-20px, 340px) } }
@keyframes kp-snow { 0% { transform: translate(0, 0) } 50% { transform: translate(14px, 170px) } 100% { transform: translate(-6px, 340px) } }
@keyframes kp-gust { from { transform: translateX(0) } to { transform: translateX(640px) } }
@keyframes kp-leaf { from { transform: translateX(0) rotate(0) } to { transform: translate(600px, -60px) rotate(720deg) } }
@keyframes kp-cloudrun { from { transform: translateX(-60px) } to { transform: translateX(120px) } }
@keyframes kp-sway { from { transform: rotate(-4deg) } to { transform: rotate(6deg) } }
`;
