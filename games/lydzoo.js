/* Lyd-zoo: a long landscape to swipe through – farm, pond, town, station, beach and zoo – full of things to tap.
 * Every thing has its own synthesized sound, an animation and a little word bubble ("Muh!", "Ba-bu!").
 * The first tap on a thing also says its name; later taps only sometimes. ◀ ▶ glide a screen at a time.
 */
import { WORLD, backdrop, hills } from './art/lydzoo-art.js';

const CSS = `
.lz-world, .lz-hills { position:absolute; left:0; will-change:transform; }
.lz-world svg, .lz-hills svg { position:absolute; left:0; top:0; pointer-events:none; }
.lz-thing { position:absolute; line-height:1; transform: translate(-50%, -100%); padding:.12em; touch-action:none; }
.lz-thing.deco { pointer-events:none; }
.lz-m, .lz-g { display:inline-block; transform-origin: 50% 100%; }
.lz-hop .lz-g { animation: lz-hop .55s ease; }
.lz-wiggle .lz-g { animation: lz-wiggle .6s ease; }
.lz-swing .lz-g { transform-origin: 50% 0; animation: lz-swing 1.6s ease; }
.lz-pulse .lz-g { animation: lz-pulse .8s ease; }
.lz-spin .lz-g { transform-origin: 50% 50%; animation: lz-spin 1.2s ease; }
.lz-shake .lz-g { animation: lz-shake .5s linear 2; }
.lz-drive .lz-m { animation: lz-drive var(--t, 3.6s) ease-in-out; }
.lz-drive .lz-g { animation: lz-bump .25s linear infinite; }
.lz-jump .lz-m { animation: lz-jump 1s ease-in-out; }
.lz-buzz .lz-m { animation: lz-buzz 1.6s ease-in-out; }
.lz-gone .lz-g { animation: lz-gone 2.4s ease; }
.lz-word { position:absolute; transform: translate(-50%, -100%); pointer-events:none; white-space:nowrap; font-weight:900;
  color:#4a3b5c; background:#fff; border:.12em solid #4a3b5c; border-radius:1em; padding:.15em .55em; animation: lz-word 1.5s ease forwards; z-index:5; }
.lz-drop { position:absolute; pointer-events:none; animation: lz-fall var(--t, .9s) linear forwards; }
.lz-up { position:absolute; pointer-events:none; animation: lz-rise 1s ease-out forwards; }
.lz-flash { position:absolute; inset:0; background:#fff; pointer-events:none; animation: lz-flash .9s ease forwards; z-index:20; }
.lz-arrow { position:absolute; top:50%; z-index:10; width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%;
  background:rgba(255,255,255,.7); box-shadow:0 4px 0 rgba(0,0,0,.12); font-size:max(30px, 4.4vmin); transform: translateY(-50%);
  transition: opacity .3s; touch-action:manipulation; }
.lz-arrow.l { left: calc(env(safe-area-inset-left) + 14px); } .lz-arrow.r { right: calc(env(safe-area-inset-right) + 14px); }
.lz-arrow:active { transform: translateY(-50%) scale(.9); }
.lz-arrow.off { opacity:0; pointer-events:none; }
@keyframes lz-hop { 0%,100%{transform:none} 30%{transform:translateY(-28%) scale(.95,1.08)} 55%{transform:none} 70%{transform:scale(1.1,.9)} }
@keyframes lz-wiggle { 0%,100%{transform:none} 20%{transform:rotate(-10deg)} 40%{transform:rotate(9deg)} 60%{transform:rotate(-6deg)} 80%{transform:rotate(4deg)} }
@keyframes lz-swing { 0%,100%{transform:none} 15%{transform:rotate(18deg)} 35%{transform:rotate(-16deg)} 55%{transform:rotate(12deg)} 75%{transform:rotate(-7deg)} }
@keyframes lz-pulse { 0%,100%{transform:none} 30%{transform:scale(1.25)} 60%{transform:scale(.92)} }
@keyframes lz-spin { from{transform:none} to{transform:rotate(360deg)} }
@keyframes lz-shake { 0%,100%{transform:none} 25%{transform:translateX(-6%)} 75%{transform:translateX(6%)} }
@keyframes lz-bump { 0%,100%{transform:none} 50%{transform:translateY(-3%)} }
@keyframes lz-drive { 0%{transform:none} 46%{transform:translateX(var(--d)); opacity:1} 47%{transform:translateX(var(--d)); opacity:0}
  48%{transform:translateX(calc(-1 * var(--d))); opacity:0} 49%{transform:translateX(calc(-1 * var(--d))); opacity:1} 100%{transform:none} }
@keyframes lz-jump { 0%,100%{transform:none} 50%{transform:translateY(-180%) rotate(-30deg)} }
@keyframes lz-buzz { 0%,100%{transform:none} 20%{transform:translate(60%,-40%)} 40%{transform:translate(0,-90%)} 60%{transform:translate(-60%,-40%)} 80%{transform:translate(-20%,10%)} }
@keyframes lz-gone { 0%{transform:none; opacity:1} 10%{transform:scale(1.3); opacity:0} 80%{transform:scale(0); opacity:0} 100%{transform:none; opacity:1} }
@keyframes lz-word { 0%{transform:translate(-50%,-60%) scale(.3); opacity:0} 15%{transform:translate(-50%,-100%) scale(1.1); opacity:1}
  25%{transform:translate(-50%,-100%) scale(1)} 80%{opacity:1} 100%{transform:translate(-50%,-150%); opacity:0} }
@keyframes lz-fall { from{transform:translateY(0)} to{transform:translateY(var(--fall)); opacity:.4} }
@keyframes lz-rise { from{transform:none; opacity:1} to{transform:translate(var(--dx), -160%) scale(.6); opacity:0} }
@keyframes lz-flash { 0%{opacity:0} 10%{opacity:.9} 20%{opacity:.1} 30%{opacity:.8} 100%{opacity:0} }
`;

export default {
  id: 'lydzoo',
  title: 'Lyd-zoo',
  icon: '🦁',
  color: '#f77f00',
  edge: '#7cc35e',

  start(root, kit) {
    root.style.background = 'linear-gradient(#7cc8ff 0%, #bfe6ff 60%, #e6f6ff 100%)';
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const A = kit.audio(), OUT = kit.output();

    // ---------- sound helpers ----------
    // param: number or [[time, value], ...] (linear ramps)
    function curve(param, v, t0) {
      if (typeof v === 'number') { param.setValueAtTime(v, t0); return; }
      param.setValueAtTime(v[0][1], t0 + v[0][0]);
      for (const [tt, val] of v.slice(1)) param.linearRampToValueAtTime(val, t0 + tt);
    }
    function voice({ type = 'sawtooth', at = 0, dur = .4, f = 440, vol = .2, attack = .02, lp = null, bp = null, q = 1, vib = null, trem = null }) {
      const t0 = A.currentTime + at;
      const osc = A.createOscillator(), g = A.createGain();
      osc.type = type;
      curve(osc.frequency, f, t0);
      let node = osc;
      if (lp || bp) {
        const fl = A.createBiquadFilter();
        fl.type = lp ? 'lowpass' : 'bandpass';
        fl.Q.value = q;
        curve(fl.frequency, lp || bp, t0);
        node.connect(fl); node = fl;
      }
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
      g.gain.setValueAtTime(vol, t0 + Math.max(attack, dur - .08));
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      const extra = [];
      if (vib) {
        const l = A.createOscillator(), lg = A.createGain();
        l.frequency.value = vib[0]; lg.gain.value = vib[1];
        l.connect(lg).connect(osc.frequency); extra.push(l);
      }
      let out = g;
      if (trem) {
        const tg = A.createGain(), l = A.createOscillator(), lg = A.createGain();
        tg.gain.value = 1 - trem[1] / 2;
        l.frequency.value = trem[0]; lg.gain.value = trem[1] / 2;
        l.connect(lg).connect(tg.gain); extra.push(l);
        g.connect(tg); out = tg;
      }
      node.connect(g);
      out.connect(OUT);
      [osc, ...extra].forEach(o => { o.start(t0); o.stop(t0 + dur + .05); });
    }
    const N = (o) => kit.noise(o);
    const bell = (f, at, vol = .2, dur = 2.2, parts = [[1, 1], [2, .45], [2.4, .35], [3, .2], [4.2, .12]]) =>
      parts.forEach(([m, v]) => kit.tone(f * m, { at, dur: dur / Math.sqrt(m), vol: vol * v, attack: .003 }));

    const SOUNDS = {
      cow() { voice({ f: [[0, 150], [.3, 142], [1.2, 112]], dur: 1.3, lp: [[0, 300], [.35, 1000], [1.3, 320]], vol: .4, vib: [5, 3], attack: .08 }); },
      sheep() { voice({ f: [[0, 340], [.8, 300]], dur: .9, lp: 1800, vol: .25, vib: [15, 9], trem: [15, .9], attack: .04 }); },
      pig() { [0, .28].forEach(at => { voice({ type: 'square', at, f: [[0, 190], [.12, 130]], dur: .15, lp: 650, vol: .3 }); N({ at, dur: .12, freq: 450, vol: .18 }); }); },
      rooster() {
        voice({ at: 0, f: [[0, 520], [.12, 700]], dur: .14, lp: 2600, vol: .22 });
        voice({ at: .17, f: 720, dur: .12, lp: 2600, vol: .22 });
        voice({ at: .32, f: [[0, 760], [.1, 860]], dur: .13, lp: 2600, vol: .22 });
        voice({ at: .48, f: [[0, 900], [.35, 880], [.8, 560]], dur: .85, lp: 2600, vol: .24, vib: [7, 15] });
      },
      horse() { voice({ f: [[0, 950], [.7, 480], [1.1, 330]], dur: 1.15, lp: 2400, vol: .2, vib: [13, 70], attack: .05 }); },
      tractor() { voice({ type: 'square', f: 52, dur: 1.8, lp: 380, vol: .45, trem: [9, 1] }); N({ dur: 1.6, freq: 160, q: .5, vol: .15 }); },
      chick() { [0, .16, .32].forEach(at => kit.tone(3000, { at, dur: .1, vol: .1, slide: 3700 })); },
      duck() { [0, .2, .4].forEach(at => voice({ at, f: [[0, 520], [.13, 420]], dur: .15, bp: 1150, q: 4, vol: .55 })); },
      frog() { [0, .34].forEach(at => voice({ type: 'square', at, f: [[0, 170], [.22, 230]], dur: .24, lp: 900, vol: .3, trem: [38, 1] })); },
      fish() { kit.tone(300, { dur: .15, vol: .2, slide: 750 }); N({ at: .55, dur: .35, freq: 900, q: .6, vol: .35, sweep: 300 }); },
      splash() { N({ dur: .45, freq: 1100, q: .5, vol: .4, sweep: 300 }); [.1, .2, .32].forEach(at => kit.tone(kit.rand(500, 900), { at, dur: .12, vol: .1, slide: 1300 })); },
      bee() { voice({ f: 230, dur: 1.6, lp: 1000, vol: .14, vib: [28, 10], trem: [10, .5] }); },
      door() { bell(659, 0, .22, 1.3, [[1, 1], [2, .3]]); bell(523, .55, .22, 1.8, [[1, 1], [2, .3]]); },
      dog() { [0, .26].forEach(at => { voice({ at, f: [[0, 400], [.05, 320], [.15, 210]], dur: .17, lp: 1300, vol: .4 }); N({ at, dur: .09, freq: 800, vol: .2 }); }); },
      cat() { voice({ f: [[0, 430], [.28, 720], [.75, 470]], dur: .8, bp: [[0, 900], [.3, 1800], [.8, 900]], q: 2, vol: .5, vib: [6, 10], attack: .06 }); },
      car() { [0, .3].forEach(at => { voice({ type: 'square', at, f: 392, dur: .24, lp: 1800, vol: .14 }); voice({ type: 'square', at, f: 494, dur: .24, lp: 1800, vol: .14 }); }); },
      bike() { [0, .25].forEach(at => { kit.tone(2637, { at, dur: .55, vol: .12, attack: .002 }); kit.tone(3951, { at, dur: .3, vol: .06, attack: .002 }); }); },
      church() { [0, .9, 1.8].forEach((at, i) => bell(i === 1 ? 165 : 196, at, .3, 2.8)); },
      clock() {
        for (let i = 0; i < 4; i++) N({ at: i * .26, dur: .03, freq: i % 2 ? 2000 : 3200, q: 3, vol: .3 });
        [1.15, 1.6].forEach(at => { kit.tone(784, { at, dur: .22, vol: .2 }); kit.tone(659, { at: at + .24, dur: .3, vol: .2 }); });
      },
      icecream() { [7, 9, 7, 5, 4, 5, 7, 4, 7].forEach((s, i) => { const f = kit.scaleHz(s, 523.25); kit.tone(f, { at: i * .17, dur: .2, type: 'triangle', vol: .16 }); kit.tone(f * 2, { at: i * .17, dur: .1, vol: .04 }); }); },
      fire() {
        const s = kit.sustain({ type: 'triangle', freq: 620, vol: .22 });
        for (let i = 1; i < 8; i++) t.later(() => s.set(i % 2 ? 830 : 620, .02), i * 430);
        t.later(() => s.stop(.3), 3400);
      },
      train() {
        voice({ type: 'sine', f: 523, dur: .9, vol: .18, vib: [6, 4] }); voice({ type: 'sine', f: 659, dur: .9, vol: .14, vib: [6, 5] });
        for (let i = 0; i < 12; i++) N({ at: .9 + i * (.28 - i * .012), dur: .12, freq: 600, q: .7, vol: .3 });
      },
      hedgehog() { [0, .14, .28, .42].forEach(at => N({ at, dur: .07, freq: 4500, q: 1, vol: .25 })); },
      crab() { [0, .12, .24, .5, .62].forEach(at => N({ at, dur: .03, freq: 3800, q: 4, vol: .45 })); },
      seal() { [0, .3, .6].forEach(at => voice({ at, f: [[0, 430], [.2, 300]], dur: .22, bp: 800, q: 2, vol: .55 })); },
      waves() { N({ dur: 1.3, freq: 300, q: .5, vol: .35, sweep: 1600 }); N({ at: 1.1, dur: 1.5, freq: 1600, q: .5, vol: .3, sweep: 250 }); },
      sailboat() { N({ dur: 1.8, freq: 700, q: .4, vol: .15, sweep: 1500 }); bell(1318, .2, .1, 1, [[1, 1]]); },
      ship() { voice({ f: 98, dur: 1.7, lp: 520, vol: .4, attack: .1 }); voice({ f: 147, dur: 1.7, lp: 520, vol: .3, attack: .1 }); },
      whale() { N({ dur: .9, freq: 2500, q: .5, vol: .3, sweep: 5000 }); voice({ type: 'sine', at: .5, f: [[0, 230], [1, 160], [1.6, 210]], dur: 1.7, vol: .25, vib: [3, 6], attack: .2 }); },
      lion() {
        voice({ f: [[0, 105], [.3, 165], [1.3, 75]], dur: 1.4, lp: [[0, 400], [.3, 1500], [1.4, 300]], vol: .45, vib: [22, 6], attack: .05 });
        N({ dur: 1.3, freq: 350, q: .4, vol: .3, sweep: 200 });
      },
      elephant() { voice({ f: [[0, 520], [.15, 820], [.9, 720]], dur: 1, lp: 3200, vol: .25, vib: [8, 25] }); voice({ type: 'square', f: [[0, 260], [.15, 410], [.9, 360]], dur: 1, lp: 2000, vol: .1 }); },
      monkey() { [0, .17, .34, .51].forEach((at, i) => voice({ type: 'square', at, f: [[0, 380 + i * 60], [.12, 700 + i * 80]], dur: .14, lp: 1600, vol: .22 })); },
      parrot() { [0, .35].forEach(at => voice({ at, f: [[0, 1200], [.1, 1900], [.3, 900]], dur: .32, bp: 2000, q: 2, vol: .5 })); },
      snake() { N({ dur: 1.5, freq: 6500, q: .6, vol: .22 }); },
      sun() { kit.sfx.chime(); },
      rain() { for (let i = 0; i < 45; i++) N({ at: kit.rand(0, 2.4), dur: .03, freq: kit.rand(3500, 7500), q: 2, vol: .12 }); },
      thunder() { kit.sfx.bang(); N({ at: .1, dur: 2.6, freq: 110, q: .3, vol: .9, sweep: 60 }); },
      bird() { [0, .14, .28, .5].forEach(at => kit.tone(2500, { at, dur: .1, vol: .1, slide: 4300 })); },
      plane() { N({ dur: 3.2, freq: 450, q: .5, vol: .3, sweep: 1500 }); voice({ f: [[0, 110], [3, 140]], dur: 3.2, lp: 500, vol: .12, attack: .5 }); },
      rainbow() { for (let i = 0; i < 11; i++) kit.tone(kit.scaleHz(i, 523.25), { at: i * .06, dur: .6, type: 'triangle', vol: .12 }); },
      balloon() { kit.sfx.pop(9); },
      butterfly() { for (let i = 0; i < 6; i++) kit.tone(kit.scaleHz(8 + i % 3, 523.25), { at: i * .09, dur: .25, vol: .06 }); },
    };

    // ---------- the things ----------
    // [emoji, x, y (bottom), size, sound, animation, word, name, options]
    // animation: hop | wiggle | swing | pulse | spin | shake | drive | jump | buzz | gone; options: dir (drive direction), rot, deco
    const THINGS = [
      ['☀️', 520, 300, 200, 'sun', 'spin', 'Hej sol!', 'Solen'],
      ['🐄', 560, 860, 230, 'cow', 'hop', 'Muh!', 'Koen'],
      ['🐑', 880, 870, 170, 'sheep', 'hop', 'Mæh!', 'Fåret'],
      ['🌳', 1000, 760, 300, null, null, null, null, { deco: true }],
      ['🐥', 1080, 900, 90, 'chick', 'hop', 'Pip pip!', 'Kyllingen'],
      ['🐖', 1300, 900, 160, 'pig', 'wiggle', 'Øf øf!', 'Grisen'],
      ['🐓', 1230, 700, 140, 'rooster', 'pulse', 'Kykeliky!', 'Hanen'],
      ['🐎', 1600, 870, 230, 'horse', 'hop', 'Vrinsk!', 'Hesten'],
      ['🚜', 1880, 880, 200, 'tractor', 'shake', 'Brum brum!', 'Traktoren'],
      ['🌧️', 2300, 260, 210, 'rain', 'wiggle', 'Drip drop!', 'Regnskyen', { rain: true }],
      ['🦆', 2400, 885, 150, 'duck', 'wiggle', 'Rap rap!', 'Anden'],
      ['🐟', 2520, 930, 100, 'fish', 'jump', 'Plask!', 'Fisken'],
      ['🐸', 2660, 900, 120, 'frog', 'hop', 'Kvæk!', 'Frøen'],
      ['🐝', 2850, 620, 90, 'bee', 'buzz', 'Bzzz!', 'Bien'],
      ['🦋', 1900, 560, 90, 'butterfly', 'buzz', 'Flagre flagre!', 'Sommerfuglen'],
      ['🚪', 3170, 845, 150, 'door', 'pulse', 'Ding dong!', 'Dørklokken'],
      ['🐕', 3440, 900, 160, 'dog', 'hop', 'Vov vov!', 'Hunden'],
      ['🐈', 3690, 770, 130, 'cat', 'wiggle', 'Mjav!', 'Katten'],
      ['🕊️', 3800, 330, 130, 'bird', 'buzz', 'Pip pip!', 'Fuglen'],
      ['🚗', 3950, 985, 190, 'car', 'drive', 'Båt båt!', 'Bilen', { dir: 1 }],
      ['🚲', 4380, 985, 170, 'bike', 'drive', 'Kling kling!', 'Cyklen', { dir: 1, t: '4.4s' }],
      ['✈️', 4500, 210, 150, 'plane', 'drive', 'Vrooom!', 'Flyveren', { dir: 1, rot: 45, t: '4.4s' }],
      ['⛪', 4560, 840, 330, 'church', 'swing', 'Bim bam!', 'Kirkeklokken'],
      ['🕰️', 4800, 700, 130, 'clock', 'wiggle', 'Tik tak, kuk-kuk!', 'Uret'],
      ['🚐', 5130, 985, 210, 'icecream', 'hop', 'Is! Is!', 'Isbilen', { cone: true }],
      ['🚒', 5420, 985, 230, 'fire', 'drive', 'Ba-bu ba-bu!', 'Brandbilen', { dir: -1 }],
      ['⛈️', 5900, 230, 220, 'thunder', 'shake', 'BUM!', 'Tordenskyen', { flash: true, rain: true }],
      ['🚂', 6180, 940, 230, 'train', 'drive', 'Tøf tøf!', 'Toget', { dir: -1, t: '4.4s', cars: true }],
      ['🦔', 6650, 870, 110, 'hedgehog', 'wiggle', 'Snøf snøf!', 'Pindsvinet'],
      ['🌈', 6950, 420, 280, 'rainbow', 'pulse', 'Åh!', 'Regnbuen'],
      ['🦀', 7090, 950, 120, 'crab', 'shake', 'Klik klik!', 'Krabben'],
      ['🦭', 7230, 900, 150, 'seal', 'hop', 'Ork ork!', 'Sælen'],
      ['🌊', 7480, 960, 200, 'waves', 'pulse', 'Svusj!', 'Bølgerne'],
      ['⛵', 7720, 830, 170, 'sailboat', 'wiggle', 'Plisk plask!', 'Sejlbåden'],
      ['🐳', 7900, 990, 190, 'whale', 'hop', 'Pfff!', 'Hvalen', { spout: true }],
      ['🛳️', 8080, 820, 200, 'ship', 'shake', 'Tuuut!', 'Skibet'],
      ['🎈', 8150, 330, 130, 'balloon', 'gone', 'Bang!', 'Ballonen', { confetti: true }],
      ['🌴', 8330, 780, 340, null, null, null, null, { deco: true }],
      ['🦁', 8500, 880, 230, 'lion', 'pulse', 'Rrraaah!', 'Løven'],
      ['🐘', 8850, 880, 260, 'elephant', 'hop', 'Trut!', 'Elefanten'],
      ['🌴', 9100, 780, 360, null, null, null, null, { deco: true }],
      ['🐒', 9060, 560, 150, 'monkey', 'hop', 'Uh uh ah ah!', 'Aben'],
      ['🦜', 9230, 500, 130, 'parrot', 'wiggle', 'Hej hej!', 'Papegøjen'],
      ['🐍', 9450, 900, 140, 'snake', 'wiggle', 'Sssss!', 'Slangen'],
    ];

    // ---------- build ----------
    const hillsEl = document.createElement('div');
    hillsEl.className = 'lz-hills';
    const world = document.createElement('div');
    world.className = 'lz-world';
    const HW = Math.round(WORLD * .5 + 2400);
    hillsEl.innerHTML = `<svg viewBox="0 0 ${HW} 1000" preserveAspectRatio="none">${hills(HW)}</svg>`;
    world.innerHTML = `<svg viewBox="0 0 ${WORLD} 1000" preserveAspectRatio="none">${backdrop()}</svg>`;
    const left = document.createElement('button'), right = document.createElement('button');
    left.className = 'lz-arrow l'; right.className = 'lz-arrow r';
    left.textContent = '◀️'; right.textContent = '▶️';
    root.append(hillsEl, world, left, right);

    const things = THINGS.map(([emoji, x, y, size, sound, anim, word, name, opt = {}]) => {
      const el = document.createElement('div');
      el.className = 'lz-thing' + (opt.deco ? ' deco' : '');
      let glyph = emoji;
      if (opt.cars) glyph = '🚂🚃🚃';
      el.innerHTML = `<span class="lz-m"><span class="lz-g">${glyph}</span></span>`;
      if (opt.cone) el.querySelector('.lz-g').insertAdjacentHTML('beforeend', '<span style="position:absolute;left:30%;top:-45%;font-size:.5em">🍦</span>');
      if (opt.cone) el.querySelector('.lz-g').style.position = 'relative';
      if (opt.rot) el.querySelector('.lz-g').style.rotate = opt.rot + 'deg';
      if (opt.t) el.style.setProperty('--t', opt.t);
      world.appendChild(el);
      const th = { el, emoji, x, y, size, sound, anim, word, name, opt, taps: 0, busy: 0 };
      el._lz = th;
      return th;
    });

    let W = 0, H = 0, s = 1, top = 0, scroll = 0, maxScroll = 0;
    function layout() {
      W = root.clientWidth; H = root.clientHeight;
      const frac = scroll / Math.max(1, maxScroll);
      s = Math.min(H, W * 1.25) / 1000;
      top = H - 1000 * s;
      maxScroll = Math.max(0, WORLD * s - W);
      Object.assign(world.style, { top: top + 'px', width: WORLD * s + 'px', height: 1000 * s + 'px' });
      Object.assign(world.firstElementChild.style, { width: WORLD * s + 'px', height: 1000 * s + 'px' });
      Object.assign(hillsEl.style, { top: top + 'px', width: HW * s + 'px', height: 1000 * s + 'px' });
      Object.assign(hillsEl.firstElementChild.style, { width: HW * s + 'px', height: 1000 * s + 'px' });
      for (const th of things) {
        Object.assign(th.el.style, { left: th.x * s + 'px', top: th.y * s + 'px', fontSize: th.size * s + 'px' });
        if (th.opt.dir) th.el.style.setProperty('--d', th.opt.dir * W * 1.25 + 'px');
      }
      setScroll(frac * maxScroll);
    }
    function setScroll(v) {
      scroll = v;
      world.style.transform = `translateX(${-scroll}px)`;
      hillsEl.style.transform = `translateX(${-scroll * .5}px)`;
      left.classList.toggle('off', scroll < 10);
      right.classList.toggle('off', scroll > maxScroll - 10);
    }

    // ---------- tapping ----------
    function word(th, text) {
      const w = document.createElement('div');
      w.className = 'lz-word';
      w.textContent = text;
      w.style.fontSize = Math.max(22, 46 * s) + 'px';
      w.style.left = th.x * s + 'px';
      w.style.top = (th.y - th.size * 1.05) * s + 'px';
      world.appendChild(w);
      t.later(() => w.remove(), 1600);
    }
    function drops(th, n, glyph, fallTo) {
      for (let i = 0; i < n; i++) {
        t.later(() => {
          const d = document.createElement('div');
          d.className = 'lz-drop';
          d.textContent = glyph;
          d.style.fontSize = 40 * s + 'px';
          d.style.left = (th.x + kit.rand(-.4, .4) * th.size) * s + 'px';
          d.style.top = (th.y - th.size * .3) * s + 'px';
          d.style.setProperty('--fall', (fallTo - th.y) * s + 'px');
          d.style.setProperty('--t', kit.rand(.7, 1.1) + 's');
          world.appendChild(d);
          t.later(() => d.remove(), 1200);
        }, i * 110 + kit.rand(0, 80));
      }
    }
    function spout(th) {
      for (let i = 0; i < 7; i++) {
        const d = document.createElement('div');
        d.className = 'lz-up';
        d.textContent = '💦';
        d.style.fontSize = 50 * s + 'px';
        d.style.left = (th.x - 20) * s + 'px';
        d.style.top = (th.y - th.size * 1.1) * s + 'px';
        d.style.setProperty('--dx', kit.rand(-120, 120) + '%');
        d.style.animationDelay = i * 60 + 'ms';
        world.appendChild(d);
        t.later(() => d.remove(), 1500);
      }
    }

    function trigger(th) {
      const now = performance.now();
      SOUNDS[th.sound]();
      word(th, th.word);
      if (now > th.busy) {
        const cls = 'lz-' + th.anim;
        kit.replay(th.el, cls);
        const dur = { drive: 4400, swing: 1600, buzz: 1600, gone: 2400, jump: 1000 }[th.anim] || 700;
        th.busy = th.anim === 'drive' || th.anim === 'gone' ? now + dur : 0;
        t.later(() => th.el.classList.remove(cls), dur + 50);
      }
      if (th.opt.rain) drops(th, 16, '💧', 900);
      if (th.opt.flash) { const f = document.createElement('div'); f.className = 'lz-flash'; root.appendChild(f); t.later(() => f.remove(), 950); }
      if (th.opt.spout) spout(th);
      if (th.opt.confetti || th.sound === 'sun' || th.sound === 'rainbow') {
        const r = th.el.getBoundingClientRect();
        kit.burst(r.left + r.width / 2, r.top + r.height / 2, 40, .8);
      }
      // name it the first time, then only now and then
      th.taps++;
      if (th.taps === 1 || Math.random() < .25) t.later(() => kit.say(th.name + '!', { pitch: 1.2 }), 1100);
    }

    // ---------- scrolling (one finger pans; other fingers can tap meanwhile) ----------
    let pan = null, vel = 0, raf = 0, tween = null;
    const rubber = v => v < 0 ? v * .35 : v > maxScroll ? maxScroll + (v - maxScroll) * .35 : v;
    function loop(now) {
      raf = 0;
      if (tween) {
        const k = Math.min(1, (now - tween.t0) / 650), e = 1 - Math.pow(1 - k, 3);
        setScroll(tween.from + (tween.to - tween.from) * e);
        if (k < 1) raf = requestAnimationFrame(loop); else tween = null;
        return;
      }
      if (pan) return;
      let v = scroll + vel * 16;
      vel *= .94;
      if (v < 0 || v > maxScroll) { const target = v < 0 ? 0 : maxScroll; v += (target - v) * .2; vel *= .6; }
      setScroll(v);
      if (Math.abs(vel) > .02 || scroll < -.5 || scroll > maxScroll + .5) raf = requestAnimationFrame(loop);
      else setScroll(Math.max(0, Math.min(maxScroll, scroll)));
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    function glide(by) {
      tween = { from: scroll, to: Math.max(0, Math.min(maxScroll, scroll + by)), t0: performance.now() };
      vel = 0; kit.sfx.whoosh(); kick();
    }
    left.addEventListener('click', () => glide(-W * .8));
    right.addEventListener('click', () => glide(W * .8));

    root.addEventListener('pointerdown', e => {
      if (e.target.closest('.lz-arrow')) return;
      e.preventDefault();
      const thing = e.target.closest('.lz-thing');
      if (pan) { if (thing) trigger(thing._lz); return; }   // extra fingers tap straight away
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      tween = null; vel = 0;
      pan = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s0: scroll, moved: false, thing, hist: [[performance.now(), e.clientX]] };
    });
    root.addEventListener('pointermove', e => {
      if (!pan || e.pointerId !== pan.id) return;
      const dx = e.clientX - pan.x0;
      if (!pan.moved && Math.hypot(dx, e.clientY - pan.y0) > 12) pan.moved = true;
      if (!pan.moved) return;
      setScroll(rubber(pan.s0 - dx));
      pan.hist.push([performance.now(), e.clientX]);
      if (pan.hist.length > 6) pan.hist.shift();
    });
    const end = e => {
      if (!pan || e.pointerId !== pan.id) return;
      if (!pan.moved) { if (pan.thing) trigger(pan.thing._lz); }
      else {
        const h = pan.hist, a = h[0], b = h[h.length - 1];
        vel = b[0] - a[0] > 0 && performance.now() - b[0] < 80 ? -(b[1] - a[1]) / (b[0] - a[0]) : 0;
      }
      pan = null;
      kick();
    };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);

    layout();
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); cancelAnimationFrame(raf); };
  },
};
