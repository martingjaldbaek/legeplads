/* Lege-butik: play shop. Drag things from the shelves into the basket (each is named), then onto the scanner at
 * the till (beep! the price is added on the display, the thing drops into the paper bag). Pay by dragging the
 * big krone coins into the shopkeeper's hand. When everything is paid the receipt prints, the bag gets handles
 * and is carried off, and the shelves are restocked. Everything is generous: drop anywhere near the target.
 */
import { shelf, BASKET_BACK, BASKET_FRONT, COUNTER, KEEPER, SCANNER, BAG, BAG_HANDLES, TILL, COIN } from './art/butik-art.js';

const NS = 'http://www.w3.org/2000/svg';
const ITEMS = [
  ['🍎', 'Æble', 1], ['🍌', 'Banan', 1], ['🥕', 'Gulerod', 1], ['🧀', 'Ost', 2], ['🥛', 'Mælk', 2], ['🍞', 'Brød', 2],
  ['🥚', 'Æg', 1], ['🍇', 'Vindruer', 2], ['🍉', 'Vandmelon', 2], ['🍓', 'Jordbær', 2], ['🥦', 'Broccoli', 1], ['🍪', 'Småkage', 1],
  ['🧃', 'Juice', 1], ['🍫', 'Chokolade', 2], ['🍦', 'Is', 2], ['🐟', 'Fisk', 2], ['🍕', 'Pizza', 2], ['🧸', 'Bamse', 2],
  ['🎈', 'Ballon', 1], ['🥒', 'Agurk', 1], ['🍐', 'Pære', 1], ['🍊', 'Appelsin', 1], ['🍋', 'Citron', 1], ['🍅', 'Tomat', 1],
  ['🌽', 'Majs', 1], ['🥐', 'Croissant', 2], ['🧁', 'Kage', 2], ['🍬', 'Slik', 1], ['🥑', 'Avocado', 2],
];
const LAYOUTS = {
  land: {
    W: 1400, H: 1000, floor: 860, shelf: { x: 30, y: 70, w: 590, h: 760, rows: 3, cols: 4 }, size: 112,
    basket: [760, 860], counter: { x: 890, w: 500, top: 620, h: 240 }, keeper: [1215, 620],
    scanner: [975, 620], bag: [1102, 620], till: [1322, 620], coins: [[990, 935], [1120, 935], [1250, 935]],
  },
  port: {
    W: 1000, H: 1400, floor: 1240, shelf: { x: 30, y: 50, w: 940, h: 620, rows: 3, cols: 4 }, size: 118,
    basket: [150, 1000], counter: { x: 20, w: 970, top: 1000, h: 240 }, keeper: [770, 1000],
    scanner: [380, 1000], bag: [515, 1000], till: [905, 1000], coins: [[300, 1320], [500, 1320], [700, 1320]],
  },
};
const BASKET_SPOTS = [[-62, -112], [0, -118], [62, -112], [-32, -142], [32, -142], [-80, -138], [80, -138], [0, -160]];

const CSS = `
.bk-svg { position:absolute; inset:0; width:100%; height:100%; display:block; touch-action:none; }
.bk-svg text { pointer-events:none; user-select:none; }
.bk-item, .bk-coin { transition: transform .35s cubic-bezier(.3,1.3,.5,1); }
.bk-drag { transition: none !important; }
.bk-lift { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .15s; }
.bk-drag .bk-lift { transform: scale(1.15); filter: drop-shadow(0 12px 8px rgba(0,0,0,.25)); }
.bk-wig .bk-lift { animation: bk-wig .45s ease; }
@keyframes bk-wig { 0%,100%{transform:none} 25%{transform:rotate(-12deg) scale(1.1)} 60%{transform:rotate(10deg)} }
.bk-inbasket .bk-tag { display:none; }
.bk-gone { opacity:0; transition: transform .45s ease-in, opacity .45s ease-in !important; }
.bk-new .bk-lift { animation: bk-new .45s cubic-bezier(.3,1.6,.5,1); }
@keyframes bk-new { from { transform: scale(0) } to { transform: none } }
.bk-laser { opacity:0; }
.bk-beep .bk-laser { animation: bk-laser .35s ease; }
@keyframes bk-laser { 0%,100%{opacity:0} 20%,70%{opacity:1} }
.bk-beep .bk-led { fill:#3ddc84; }
.bk-hintscan .bk-scanner { animation: bk-pulse 1.2s ease-in-out infinite; }
.bk-hintpay .bk-coin .bk-lift { animation: bk-hop 1.4s ease-in-out infinite; }
.bk-hintpay .bk-arm { animation: bk-reach 1.4s ease-in-out infinite; }
.bk-scanner, .bk-arm, .bk-keeper, .bk-baskethop, .bk-bagin { transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes bk-pulse { 0%,100%{transform:none} 50%{transform:scale(1.08)} }
@keyframes bk-hop { 0%,70%,100%{transform:none} 82%{transform:translateY(-18px)} }
@keyframes bk-reach { 0%,100%{transform:none} 50%{transform:translate(-6px,-6px)} }
.bk-open { display:none; }
.bk-talk .bk-open { display:inline; } .bk-talk .bk-smile { display:none; }
.bk-happy .bk-keeper { animation: bk-wobble .5s ease; }
@keyframes bk-wobble { 0%,100%{transform:none} 30%{transform:rotate(-3deg) translateY(-6px)} 65%{transform:rotate(3deg)} }
.bk-eyes { transform-box: fill-box; transform-origin: center; animation: bk-blink 4s infinite; }
@keyframes bk-blink { 0%,94%,100%{transform:none} 97%{transform:scaleY(.1)} }
.bk-receipt { transform: translateY(150px); }
.bk-print .bk-receipt { transform: none; transition: transform 1.2s steps(8); }
.bk-handles { opacity:0; }
.bk-bagdone .bk-handles { opacity:1; }
.bk-bagwrap { transition: transform .7s cubic-bezier(.5,-0.3,.7,1); }
.bk-wiggle { transform-box: fill-box; transform-origin: 50% 100%; animation: bk-wig .45s ease; }
.bk-fx { font: 800 54px ui-rounded, system-ui, sans-serif; fill:#ff4d6d; stroke:#fff; stroke-width:6px; paint-order:stroke;
  animation: bk-up 1.1s ease-out forwards; }
@keyframes bk-up { from { transform: translateY(0); opacity:1 } to { transform: translateY(-90px); opacity:0 } }
`;

export default {
  id: 'butik',
  title: 'Butik',
  icon: '🛒',
  color: '#06a77d',
  edge: '#e8c9a0',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const t = kit.timers();
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'bk-svg');
    svg.innerHTML = `
      <rect x="-5000" y="-5000" width="11000" height="11000" fill="#fff4e0"/>
      <rect class="bk-floor" x="-5000" y="860" width="11000" height="6000" fill="#e8c9a0"/>
      <g class="bk-awning"></g>
      <g class="bk-shelf"></g>
      <g class="bk-keeperpos">${KEEPER}</g>
      <g class="bk-counter"></g>
      <g class="bk-scannerpos"><g class="bk-scanner" data-tap="scanner">${SCANNER}</g></g>
      <g class="bk-bagwrap"><g class="bk-bagin" data-tap="bag"><g class="bk-peek"></g>${BAG}<g class="bk-handles">${BAG_HANDLES}</g></g></g>
      <g class="bk-tillpos" data-tap="till">${TILL}</g>
      <g class="bk-basketpos"><g class="bk-baskethop" data-tap="basket">${BASKET_BACK}</g></g>
      <g class="bk-items"></g>
      <g class="bk-basketfront" style="pointer-events:none">${BASKET_FRONT}</g>
      <g class="bk-coins"></g>
      <g class="bk-fxl"></g>`;
    root.appendChild(svg);
    const $ = s => svg.querySelector(s);
    const itemsL = $('.bk-items'), coinsL = $('.bk-coins');

    let L = LAYOUTS.land, owed = 0, inBag = 0, busy = false, lastSay = 0;
    const slots = [];      // shelf slot → item or null
    const basket = [];     // items in the basket
    const coins = [];
    const sayOnce = (text, opts) => { const n = Date.now(); if (n - lastSay > 1800) { lastSay = n; kit.say(text, opts); } };
    const toSvg = (cx, cy) => { const p = svg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const toClient = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM()); };
    const el = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const pos = (e, x, y, k = 1) => { e.style.transform = `translate(${x}px, ${y}px) scale(${k})`; };

    /* ---------- geometry ---------- */
    function slotXY(i) {
      const s = L.shelf, r = Math.floor(i / s.cols), c = i % s.cols;
      return [s.x + (s.w * (c + 0.5)) / s.cols, s.y + (s.h * (r + 1)) / s.rows - 22];
    }
    const basketXY = j => [L.basket[0] + BASKET_SPOTS[j % BASKET_SPOTS.length][0], L.basket[1] + BASKET_SPOTS[j % BASKET_SPOTS.length][1] + 4];
    const handXY = () => [L.keeper[0] - 162, L.keeper[1] - 168];
    const inScan = p => p.x > L.scanner[0] - 130 && p.x < L.bag[0] + 100 && p.y > L.counter.top - 300 && p.y < L.counter.top + 80;
    const inBasket = p => Math.abs(p.x - L.basket[0]) < 170 && p.y > L.basket[1] - 280 && p.y < L.basket[1] + 40;
    const inHand = p => { const [hx, hy] = handXY(); return Math.hypot(p.x - hx, p.y - hy) < 170 || (Math.abs(p.x - L.keeper[0]) < 120 && p.y > L.keeper[1] - 340 && p.y < L.keeper[1]); };

    /* ---------- items ---------- */
    function makeItem(def) {
      const [emoji, name, price] = def;
      const g = el('g', { class: 'bk-item' });
      const sz = L.size;
      g.innerHTML = `<g class="bk-lift"><circle cx="0" cy="${-sz * 0.48}" r="${sz * 0.62}" fill="transparent"/>
        <text x="0" y="${-sz * 0.12}" font-size="${sz}" text-anchor="middle">${emoji}</text>
        <g class="bk-tag"><circle cx="${sz * 0.42}" cy="-6" r="20" fill="#ffd23f" stroke="#4a3b5c" stroke-width="4"/>
          <text x="${sz * 0.42}" y="5" font-size="30" font-weight="800" text-anchor="middle" fill="#4a3b5c" font-family="ui-rounded, system-ui, sans-serif">${price}</text></g></g>`;
      itemsL.appendChild(g);
      const it = { el: g, emoji, name, price, where: 'shelf', slot: -1 };
      bindItem(it);
      return it;
    }
    function placeItem(it) {
      if (it.where === 'shelf') { const [x, y] = slotXY(it.slot); pos(it.el, x, y); }
      else if (it.where === 'basket') { const [x, y] = basketXY(basket.indexOf(it)); pos(it.el, x, y, 0.62); }
      it.el.classList.toggle('bk-inbasket', it.where === 'basket');
    }
    function stock(i, delay = 0) {
      const used = new Set(slots.filter(Boolean).map(s => s.emoji).concat(basket.map(b => b.emoji)));
      const pool = ITEMS.filter(d => !used.has(d[0]));
      const it = makeItem(kit.pick(pool.length ? pool : ITEMS));
      it.slot = i; slots[i] = it;
      it.el.style.opacity = 0;
      placeItem(it);
      t.later(() => { it.el.style.opacity = ''; kit.replay(it.el, 'bk-new'); if (delay) kit.sfx.pop(4 + (i % 5)); }, delay);
    }
    function bindItem(it) {
      let moved = false, p0 = null;
      kit.draggable(it.el, {
        start(e) {
          if (it.where === 'gone') return false;
          p0 = toSvg(e.clientX, e.clientY); moved = false;
          itemsL.appendChild(it.el);   // on top (before pointer capture is taken)
        },
        move(e) {
          const p = toSvg(e.clientX, e.clientY);
          if (!moved) {
            if (Math.hypot(p.x - p0.x, p.y - p0.y) < 12) return;
            moved = true; it.el.classList.add('bk-drag'); it.el.classList.remove('bk-inbasket'); kit.sfx.pickUp();
          }
          pos(it.el, p.x, p.y + L.size * 0.45);
        },
        end(e) {
          if (!moved) { kit.replay(it.el, 'bk-wig'); kit.sfx.blip(5 + it.price); sayOnce(it.name + '!'); return; }
          it.el.classList.remove('bk-drag');
          const p = toSvg(e.clientX, e.clientY);
          if (inScan(p) && !busy) return scan(it, p);
          if (it.where === 'shelf' && inBasket(p) && basket.length < BASKET_SPOTS.length) return toBasket(it);
          kit.sfx.boing();
          placeItem(it);
        },
      });
    }
    function fromWherever(it) {
      if (it.where === 'shelf') { slots[it.slot] = null; it.slot = -1; }
      else if (it.where === 'basket') { basket.splice(basket.indexOf(it), 1); basket.forEach(placeItem); }
    }
    function toBasket(it) {
      fromWherever(it);
      it.where = 'basket'; basket.push(it);
      placeItem(it);
      kit.sfx.plop(); kit.replay($('.bk-baskethop'), 'bk-wiggle');
      sayOnce(it.name + '!');
      hints();
      if (slots.every(s => !s)) t.later(restock, 900);
    }
    function scan(it, p) {
      fromWherever(it);
      it.where = 'gone';
      const [sx, sy] = L.scanner;
      it.el.style.transitionDuration = '.18s';
      pos(it.el, sx, sy - 66);
      t.later(() => {
        // beep!
        kit.tone(1760, { dur: 0.13, type: 'square', vol: 0.08 });
        const sc = $('.bk-scanner'); sc.classList.remove('bk-beep'); void sc.getBBox(); sc.classList.add('bk-beep');
        t.later(() => sc.classList.remove('bk-beep'), 400);
        const f = el('text', { x: sx, y: sy - 150, class: 'bk-fx', 'text-anchor': 'middle' });
        f.textContent = '+' + it.price;
        $('.bk-fxl').appendChild(f);
        t.later(() => f.remove(), 1200);
        owed += it.price; inBag++;
        updateTotal();
        // into the bag
        it.el.style.transitionDuration = '.4s';
        const [bx, by] = L.bag;
        pos(it.el, bx, by - 90, 0.4);
        it.el.classList.add('bk-gone');
        t.later(() => {
          it.el.remove(); kit.sfx.rustle();
          const peek = $('.bk-peek');
          const n = peek.childNodes.length;
          const tx = el('text', { x: [-30, 22, -4, 34, -40][n % 5], y: -118 - (n % 3) * 6, 'font-size': 64, 'text-anchor': 'middle', transform: `rotate(${[-14, 12, -4, 18, -20][n % 5]})` });
          tx.textContent = it.emoji;
          peek.appendChild(tx);
          if (peek.childNodes.length > 5) peek.firstChild.remove();
          kit.replay($('.bk-bagin'), 'bk-wiggle');
        }, 420);
        hints();
        if (slots.every(s => !s) && !basket.length) t.later(restock, 900);
      }, 200);
    }
    function updateTotal() {
      $('.bk-total').textContent = owed;
    }
    function hints() {
      svg.classList.toggle('bk-hintscan', basket.length > 0 && owed === 0);
      svg.classList.toggle('bk-hintpay', owed > 0);
    }
    function restock() {
      let d = 0;
      slots.forEach((s, i) => { if (!s) { stock(i, d); d += 90; } });
    }

    /* ---------- coins ---------- */
    function makeCoin(i) {
      const g = el('g', { class: 'bk-coin' });
      g.innerHTML = `<g class="bk-lift">${COIN}</g>`;
      coinsL.appendChild(g);
      const c = { el: g, i };
      coins[i] = c;
      const [x, y] = L.coins[i];
      pos(g, x, y);
      kit.replay(g, 'bk-new');
      let moved = false, p0 = null;
      kit.draggable(g, {
        start(e) { if (c.used) return false; p0 = toSvg(e.clientX, e.clientY); moved = false; coinsL.appendChild(g); },
        move(e) {
          const p = toSvg(e.clientX, e.clientY);
          if (!moved) { if (Math.hypot(p.x - p0.x, p.y - p0.y) < 12) return; moved = true; g.classList.add('bk-drag'); kit.sfx.pickUp(); }
          pos(g, p.x, p.y);
        },
        end(e) {
          g.classList.remove('bk-drag');
          const p = toSvg(e.clientX, e.clientY);
          if (!moved) { kit.replay(g, 'bk-wig'); kit.tone(2093, { dur: 0.25, type: 'triangle', vol: 0.12 }); return; }
          if (inHand(p) && owed > 0 && !busy) return pay(c);
          kit.sfx.boing();
          const [x, y] = L.coins[c.i]; pos(g, x, y);
        },
      });
    }
    function pay(c) {
      c.used = true;
      const [hx, hy] = handXY();
      c.el.style.transitionDuration = '.25s';
      pos(c.el, hx, hy - 30, 0.7);
      t.later(() => {
        kit.tone(2093, { dur: 0.3, type: 'triangle', vol: 0.15 }); kit.tone(2637, { at: 0.07, dur: 0.4, type: 'triangle', vol: 0.12 });
        c.el.classList.add('bk-gone'); pos(c.el, hx, hy - 30, 0.2);
        const kp = $('.bk-keeperpos'); kp.classList.remove('bk-happy'); void kp.getBBox(); kp.classList.add('bk-happy');
        owed = Math.max(0, owed - 1);
        updateTotal(); hints();
        t.later(() => { c.el.remove(); makeCoin(c.i); }, 450);
        if (owed === 0) checkout();
      }, 260);
    }
    function talk(ms = 1400) { const kp = $('.bk-keeperpos'); kp.classList.add('bk-talk'); t.later(() => kp.classList.remove('bk-talk'), ms); }
    function checkout() {
      busy = true;
      const till = $('.bk-tillpos');
      t.later(() => {
        till.classList.add('bk-print');
        for (let i = 0; i < 8; i++) kit.noise({ at: i * 0.15, dur: 0.06, vol: 0.12, freq: 4000 });
      }, 200);
      t.later(() => {
        kit.sfx.fanfare(); kit.bigBurst(); talk(1600);
        kit.say('Tak for det! Hej hej!', { pitch: 1.2 });
        $('.bk-bagwrap').classList.add('bk-bagdone');
        kit.replay($('.bk-bagin'), 'bk-wiggle');
      }, 1500);
      t.later(() => { $('.bk-bagwrap').style.transform = `translate(${L.bag[0]}px, ${L.bag[1] - 160}px)`; kit.sfx.fwip(); }, 2600);
      t.later(() => { $('.bk-bagwrap').style.transform = `translate(${L.bag[0] + 1600}px, ${L.bag[1] - 260}px)`; kit.sfx.whoosh(); }, 3000);
      t.later(() => {
        till.classList.remove('bk-print');
        const bw = $('.bk-bagwrap');
        bw.classList.remove('bk-bagdone');
        $('.bk-peek').innerHTML = '';
        bw.style.transition = 'none';
        bw.style.transform = `translate(${L.bag[0] - 1400}px, ${L.bag[1]}px)`;
        void bw.getBBox();
        bw.style.transition = '';
        bw.style.transform = `translate(${L.bag[0]}px, ${L.bag[1]}px)`;
        inBag = 0; busy = false;
        restock();
        hints();
      }, 3900);
    }

    /* ---------- taps on fixed things ---------- */
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('[data-tap]');
      if (!g) return;
      e.preventDefault();
      ({
        scanner() { kit.tone(1760, { dur: 0.1, type: 'square', vol: 0.06 }); },
        till() { kit.tone(1568, { dur: 0.6, vol: 0.15 }); kit.tone(2093, { at: 0.08, dur: 0.8, vol: 0.12 }); kit.replay($('.bk-tillpos'), 'bk-wiggle'); },
        bag() { kit.sfx.rustle(); kit.replay($('.bk-bagin'), 'bk-wiggle'); },
        basket() { kit.sfx.rustle(); kit.replay($('.bk-baskethop'), 'bk-wiggle'); },
      })[g.dataset.tap]?.();
    });
    $('.bk-keeperpos').addEventListener('pointerdown', e => {
      e.preventDefault();
      kit.replay($('.bk-keeperpos'), 'bk-happy'); talk();
      sayOnce(owed > 0 ? 'Du skal betale!' : kit.pick(['Hej! Velkommen!', 'Hvad skal du købe?', 'Hej hej!']), { pitch: 1.2 });
    });

    /* ---------- layout ---------- */
    function layout() {
      const W = root.clientWidth || 1, H = root.clientHeight || 1;
      L = H > W ? LAYOUTS.port : LAYOUTS.land;
      const s = Math.min(W / L.W, H / L.H), vw = W / s, vh = H / s;
      svg.setAttribute('viewBox', `${L.W / 2 - vw / 2} ${L.H / 2 - vh / 2} ${vw} ${vh}`);
      $('.bk-floor').setAttribute('y', L.floor);
      const sh = L.shelf;
      $('.bk-shelf').innerHTML = shelf(sh.w, sh.h, sh.rows);
      $('.bk-shelf').setAttribute('transform', `translate(${sh.x} ${sh.y})`);
      $('.bk-counter').innerHTML = COUNTER(L.counter.w, L.counter.h);
      $('.bk-counter').setAttribute('transform', `translate(${L.counter.x} ${L.counter.top})`);
      $('.bk-keeperpos').setAttribute('transform', `translate(${L.keeper[0]} ${L.keeper[1]})`);
      $('.bk-scannerpos').setAttribute('transform', `translate(${L.scanner[0]} ${L.scanner[1] - 12})`);
      $('.bk-tillpos').setAttribute('transform', `translate(${L.till[0]} ${L.till[1] - 12})`);
      const bw = $('.bk-bagwrap');
      bw.style.transition = 'none'; bw.style.transform = `translate(${L.bag[0]}px, ${L.bag[1] - 12}px)`; void bw.getBBox(); bw.style.transition = '';
      $('.bk-basketpos').setAttribute('transform', `translate(${L.basket[0]} ${L.basket[1]})`);
      $('.bk-basketfront').setAttribute('transform', `translate(${L.basket[0]} ${L.basket[1]})`);
      // awning across the top of the shop
      const top = L.H / 2 - vh / 2, x0 = L.W / 2 - vw / 2;
      let aw = '';
      for (let x = x0 - 80, i = 0; x < x0 + vw + 80; x += 80, i++) {
        aw += `<path d="M${x} ${top} V${top + 40} Q${x + 40} ${top + 84} ${x + 80} ${top + 40} V${top} Z" fill="${i % 2 ? '#fff' : '#ff4d6d'}" stroke="#4a3b5c" stroke-width="5"/>`;
      }
      $('.bk-awning').innerHTML = aw;
      [...slots, ...basket].forEach(it => {
        if (!it) return;
        it.el.style.transition = 'none'; placeItem(it); void it.el.getBBox(); it.el.style.transition = '';
        it.el.querySelector('text').setAttribute('font-size', L.size);
      });
      coins.forEach((c, i) => { if (c && !c.used) pos(c.el, ...L.coins[i]); });
    }

    layout();
    for (let i = 0; i < L.shelf.rows * L.shelf.cols; i++) stock(i);
    for (let i = 0; i < 3; i++) makeCoin(i);
    hints();
    t.later(() => { talk(); sayOnce('Hej! Velkommen i butikken!', { pitch: 1.2 }); }, 600);
    const offResize = kit.onResize(root, layout);
    return () => { t.clear(); offResize(); };
  },
};
