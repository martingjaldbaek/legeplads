/* SVG characters for Instrumenter: a drum, a bell, maracas and a trumpet, each with a face and moving parts.
 * The game toggles classes on the container (.hit, .swing, .shake/.shake2, .blow); the CSS below animates the parts.
 */
const INK = '#4a3b5c';
const ink = w => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const face = (x, y, k = 1, mouth = 'smile') => `
  <g class="face">
    <g class="eyes"><circle cx="${x - 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/><circle cx="${x + 18 * k}" cy="${y}" r="${6.5 * k}" fill="${INK}"/>
    <circle cx="${x - 16 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/><circle cx="${x + 20 * k}" cy="${y - 2.5 * k}" r="${2.2 * k}" fill="#fff"/></g>
    <circle cx="${x - 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/><circle cx="${x + 31 * k}" cy="${y + 12 * k}" r="${7 * k}" fill="#ff8fab" opacity=".55"/>
    <path class="m-closed" d="M${x - 11 * k} ${y + 13 * k} Q${x} ${y + 23 * k} ${x + 11 * k} ${y + 13 * k}" fill="none" ${ink(4 * k)}/>
    <ellipse class="m-open" cx="${x}" cy="${y + 18 * k}" rx="${9 * k}" ry="${11 * k}" fill="#a8324a" ${ink(3 * k)}/>
  </g>`;

export const DRUM = `<svg viewBox="0 0 220 220" class="art art-drum">
  <ellipse cx="110" cy="200" rx="80" ry="10" fill="rgba(0,0,0,.12)"/>
  <g class="body">
    <path d="M38 92 V160 Q110 205 182 160 V92 Z" fill="#ff4d6d" ${ink(5)}/>
    <path d="M38 98 L58 158 L80 104 L100 168 L120 104 L140 168 L162 104 L182 158" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
    <path d="M38 160 Q110 205 182 160" fill="none" stroke="#ffd23f" stroke-width="11" stroke-linecap="round"/>
    <path d="M38 160 Q110 205 182 160" fill="none" ${ink(4)}/>
    ${face(110, 128, 1)}
    <ellipse class="skin" cx="110" cy="92" rx="72" ry="24" fill="#fff6e6" ${ink(5)}/>
    <ellipse cx="110" cy="92" rx="72" ry="24" fill="none" stroke="#ffd23f" stroke-width="7" opacity=".9"/>
    <ellipse class="ripple" cx="110" cy="92" rx="30" ry="10" fill="none" stroke="#ffb3c1" stroke-width="4"/>
  </g>
  <g class="stick stick-l">
    <path d="M24 22 L84 60" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M24 22 L84 60" stroke="#e0a96d" stroke-width="9" stroke-linecap="round"/>
    <circle cx="86" cy="61" r="11" fill="#ffd6a5" ${ink(4)}/></g>
  <g class="stick stick-r">
    <path d="M196 22 L136 60" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M196 22 L136 60" stroke="#e0a96d" stroke-width="9" stroke-linecap="round"/>
    <circle cx="134" cy="61" r="11" fill="#ffd6a5" ${ink(4)}/></g>
</svg>`;

export const BELL = `<svg viewBox="0 0 220 230" class="art art-bell">
  <defs><linearGradient id="gold" x1="0" x2="1"><stop offset="0" stop-color="#ffe17a"/><stop offset=".55" stop-color="#ffc83d"/><stop offset="1" stop-color="#e6a417"/></linearGradient></defs>
  <g class="bell">
    <path d="M110 18 Q 92 0 82 14 Q 90 30 110 26 Q 130 30 138 14 Q 128 0 110 18 Z" fill="#ff4d6d" ${ink(4)}/>
    <circle cx="110" cy="24" r="9" fill="#ff7b93" ${ink(4)}/>
    <g class="clapper"><path d="M110 170 V196" ${ink(5)}/><circle cx="110" cy="200" r="15" fill="#ffc83d" ${ink(4)}/></g>
    <path d="M110 32 C 62 32 54 80 54 122 C 54 150 38 160 30 176 H190 C 182 160 166 150 166 122 C 166 80 158 32 110 32 Z" fill="url(#gold)" ${ink(5)}/>
    <rect x="24" y="170" width="172" height="16" rx="8" fill="#ffb703" ${ink(5)}/>
    <path d="M76 70 Q 70 100 72 130" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
    ${face(110, 112, 1.05)}
  </g>
</svg>`;

const maraca = (cls, x, c1, c2) => `<g class="maraca ${cls}">
    <rect x="${x - 9}" y="110" width="18" height="86" rx="9" fill="#c98a4b" ${ink(4)}/>
    <rect x="${x - 12}" y="104" width="24" height="12" rx="5" fill="${c2}" ${ink(4)}/>
    <ellipse cx="${x}" cy="66" rx="44" ry="50" fill="${c1}" ${ink(5)}/>
    <path d="M${x - 40} 58 L${x - 26} 46 L${x - 12} 58 L${x + 2} 46 L${x + 16} 58 L${x + 30} 46 L${x + 42} 56" fill="none" stroke="${c2}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${x - 38} 88 Q${x} 100 ${x + 38} 88" fill="none" stroke="${c2}" stroke-width="6" stroke-linecap="round"/>
    <path d="M${x - 24} 30 Q${x - 30} 44 ${x - 28} 52" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
    ${face(x, 70, 0.75)}
  </g>`;
export const MARACAS = `<svg viewBox="0 0 240 220" class="art art-maracas">
  <ellipse cx="120" cy="206" rx="80" ry="9" fill="rgba(0,0,0,.12)"/>
  ${maraca('mar-l', 78, '#2ec4b6', '#ffd23f')}
  ${maraca('mar-r', 162, '#ff8a00', '#8338ec')}
</svg>`;

export const HORN = `<svg viewBox="0 0 260 180" class="art art-horn">
  <ellipse cx="130" cy="170" rx="95" ry="8" fill="rgba(0,0,0,.12)"/>
  <g class="horn">
    <path d="M50 120 H150 Q175 120 175 100 V96 H160 V100 Q160 106 150 106 H50 Z" fill="#ffc83d" ${ink(4)}/>
    <rect x="14" y="80" width="26" height="16" rx="5" fill="#ffd96b" ${ink(4)}/>
    <rect x="36" y="76" width="150" height="24" rx="10" fill="#ffc83d" ${ink(5)}/>
    <path d="M40 100 V120 M60 100 V120" ${ink(4)}/>
    ${[80, 108, 136].map((x, i) => `<g class="valve v${i}"><rect x="${x}" y="46" width="18" height="34" rx="5" fill="#ffd96b" ${ink(4)}/>
      <rect x="${x - 5}" y="38" width="28" height="12" rx="6" fill="#fff1b8" ${ink(4)}/></g>`).join('')}
    <g class="flare"><path d="M180 78 L238 28 Q258 90 238 152 L180 100 Z" fill="#ffc83d" ${ink(5)}/>
      <ellipse cx="238" cy="90" rx="14" ry="62" fill="#ffb703" ${ink(5)}/>
      ${face(206, 88, 0.8)}</g>
    <path d="M60 84 H170" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  </g>
</svg>`;

export const ART_CSS = `
.ins .art { width: 88%; height: 88%; overflow: visible; pointer-events: none; }
.ins .art * { transform-box: fill-box; }
.ins .m-open { display: none; }
.ins.sing .m-open { display: inline; } .ins.sing .m-closed { display: none; }
.ins .eyes { transform-origin: center; animation: art-blink 4.2s infinite; }
@keyframes art-blink { 0%,94%,100% { transform: none } 97% { transform: scaleY(.1) } }

/* drum */
.art-drum .body { transform-origin: 50% 100%; }
.ins.hit .art-drum .body { animation: art-squash .32s ease; }
.art-drum .stick { transform-box: view-box; } .art-drum .stick-l { transform-origin: 24px 22px; } .art-drum .stick-r { transform-origin: 196px 22px; }
.ins.hit .art-drum .stick-l { animation: art-stick-l .3s ease; }
.ins.hit2 .art-drum .stick-r { animation: art-stick-r .3s ease; }
.art-drum .ripple { opacity: 0; transform-origin: center; }
.ins.hit .art-drum .ripple, .ins.hit2 .art-drum .ripple { animation: art-ripple .5s ease-out; }
.ins.hit2 .art-drum .body { animation: art-squash .32s ease; }
@keyframes art-squash { 0%{transform:none} 35%{transform:scale(1.08,.86)} 70%{transform:scale(.97,1.05)} 100%{transform:none} }
@keyframes art-stick-l { 0%,100%{transform:none} 25%{transform: rotate(-10deg)} 55%{transform: rotate(9deg)} }
@keyframes art-stick-r { 0%,100%{transform:none} 25%{transform: rotate(10deg)} 55%{transform: rotate(-9deg)} }
@keyframes art-ripple { from { opacity: 1; transform: scale(.4) } to { opacity: 0; transform: scale(2.2) } }

/* bell */
.art-bell .bell { transform-origin: 50% 4%; }
.ins.swing .art-bell .bell { animation: art-bell 1s ease; }
.art-bell .clapper { transform-origin: 50% 0%; }
.ins.swing .art-bell .clapper { animation: art-clapper 1s ease; }
@keyframes art-bell { 0%,100%{transform:none} 15%{transform:rotate(16deg)} 38%{transform:rotate(-13deg)} 60%{transform:rotate(8deg)} 80%{transform:rotate(-4deg)} }
@keyframes art-clapper { 0%,100%{transform:none} 15%{transform:rotate(-24deg)} 38%{transform:rotate(20deg)} 60%{transform:rotate(-12deg)} 80%{transform:rotate(6deg)} }

/* maracas */
.art-maracas .maraca { transform-origin: 50% 100%; }
.art-maracas .mar-l { transform: rotate(-18deg); } .art-maracas .mar-r { transform: rotate(18deg); }
.ins.shake .art-maracas .mar-l { animation: art-shake-l .2s ease; }
.ins.shake2 .art-maracas .mar-r { animation: art-shake-r .2s ease; }
@keyframes art-shake-l { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(-36deg) translateY(-4%)} }
@keyframes art-shake-r { 0%,100%{transform:rotate(18deg)} 50%{transform:rotate(36deg) translateY(-4%)} }

/* trumpet */
.art-horn .horn { transform-origin: 10% 50%; }
.ins.blow .art-horn .horn { animation: art-blow .45s ease-in-out infinite alternate; }
.art-horn .flare { transform-origin: 0% 50%; }
.ins.blow .art-horn .flare { animation: art-flare .22s ease-in-out infinite alternate; }
.ins.blow .art-horn .v0 { animation: art-valve .3s ease-in-out infinite alternate; }
.ins.blow .art-horn .v1 { animation: art-valve .3s .1s ease-in-out infinite alternate; }
.ins.blow .art-horn .v2 { animation: art-valve .3s .2s ease-in-out infinite alternate; }
@keyframes art-blow { from { transform: none } to { transform: rotate(-4deg) scale(1.04) } }
@keyframes art-flare { from { transform: none } to { transform: scale(1.12) } }
@keyframes art-valve { from { transform: none } to { transform: translateY(22%) } }
`;
