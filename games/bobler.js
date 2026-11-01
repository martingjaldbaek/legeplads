/* Bobler: bubbles float up – tap to pop them. Tapping empty water blows a new bubble.
 * Some bubbles carry an animal; popping one names it and throws confetti.
 */
const ANIMALS = [
  ['🐶', 'Hund'], ['🐱', 'Kat'], ['🐸', 'Frø'], ['🦆', 'And'], ['🐷', 'Gris'],
  ['🐮', 'Ko'], ['🐵', 'Abe'], ['🐥', 'Kylling'], ['🐰', 'Kanin'], ['🐟', 'Fisk'],
];
const MAX_BUBBLES = 26;
const AUTO_BUBBLES = 12;

export default {
  id: 'bobler',
  title: 'Bobler',
  icon: '🫧',
  color: '#3a86ff',
  edge: '#4fb0f0',          // bottom colour of the background (fills any gap iOS leaves)

  start(root, kit) {
    root.style.background = 'linear-gradient(#c9ecff, #84cdfa 55%, #4fb0f0)';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none';
    root.appendChild(cv);
    const cx = cv.getContext('2d');
    let W = 0, H = 0;
    const S = () => Math.min(W, H);
    function resize() {
      const d = Math.min(2, window.devicePixelRatio || 1);
      W = root.clientWidth; H = root.clientHeight;
      cv.width = W * d; cv.height = H * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    }
    resize();
    addEventListener('resize', resize);

    const bubbles = [], drops = [], rings = [], floaters = [];
    let spawnIn = 0, last = performance.now(), raf = 0;

    function spawn(x, y, grow = false) {
      bubbles.push({
        x: x ?? kit.rand(0.08, 0.92) * W,
        y: y ?? H + S() * 0.15,
        r: S() * kit.rand(0.055, 0.12),
        vy: -S() * kit.rand(0.06, 0.13),
        ph: Math.random() * 6.28,
        hue: kit.rand(0, 360),
        animal: Math.random() < 0.18 ? kit.pick(ANIMALS) : null,
        born: grow ? 0 : 1,
      });
    }
    for (let i = 0; i < 7; i++) spawn(undefined, kit.rand(0.25, 1) * H);

    function pop(i) {
      const b = bubbles.splice(i, 1)[0];
      const bx = b.x + Math.sin(b.ph) * b.r * 0.15;
      // smaller bubble -> higher note
      const size = (b.r / S() - 0.055) / 0.065;            // 0..1
      kit.sfx.pop(Math.round((1 - size) * 6) + 3);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * 6.28 + Math.random() * 0.3, s = S() * kit.rand(0.25, 0.6);
        drops.push({ x: bx + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hue: b.hue });
      }
      rings.push({ x: bx, y: b.y, r: b.r, life: 1, hue: b.hue });
      if (b.animal) {
        kit.sfx.chime();
        kit.burst(bx, b.y, 50, 0.9);
        floaters.push({ x: bx, y: b.y, e: b.animal[0], size: b.r * 1.2, life: 1 });
        setTimeout(() => kit.say(b.animal[1] + '!'), 250);
      }
    }

    function onDown(e) {
      e.preventDefault();
      const x = e.clientX, y = e.clientY;
      for (let i = bubbles.length - 1; i >= 0; i--) {   // topmost first
        const b = bubbles[i], bx = b.x + Math.sin(b.ph) * b.r * 0.15;
        if (Math.hypot(x - bx, y - b.y) < b.r * 1.25 + 12) { pop(i); return; }
      }
      if (bubbles.length < MAX_BUBBLES) {
        spawn(x, y, true);
        kit.sfx.blip(Math.floor(kit.rand(5, 12)));
      }
    }
    cv.addEventListener('pointerdown', onDown);

    function drawBubble(b) {
      const grow = b.born < 1 ? 1 + 2.2 * Math.pow(b.born - 1, 3) + 1.2 * Math.pow(b.born - 1, 2) : 1; // ease-out-back
      const R = b.r * Math.max(0.01, grow), x = b.x + Math.sin(b.ph) * b.r * 0.15, y = b.y;
      const g = cx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
      g.addColorStop(0, `hsla(${b.hue},90%,92%,.15)`);
      g.addColorStop(0.8, `hsla(${b.hue},90%,75%,.28)`);
      g.addColorStop(1, `hsla(${b.hue},90%,65%,.55)`);
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(x, y, R, 0, 6.283); cx.fill();
      cx.lineWidth = Math.max(2, R * 0.05);
      cx.strokeStyle = `hsla(${b.hue},85%,60%,.7)`;
      cx.stroke();
      if (b.animal) {
        cx.font = `${R * 1.05}px system-ui, "Apple Color Emoji", sans-serif`;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(b.animal[0], x, y + R * 0.06);
      }
      cx.fillStyle = 'rgba(255,255,255,.85)';
      cx.beginPath(); cx.ellipse(x - R * 0.38, y - R * 0.42, R * 0.22, R * 0.12, -0.7, 0, 6.283); cx.fill();
      cx.beginPath(); cx.arc(x - R * 0.12, y - R * 0.62, R * 0.06, 0, 6.283); cx.fill();
    }

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnIn -= dt;
      if (spawnIn <= 0 && bubbles.length < AUTO_BUBBLES) { spawn(); spawnIn = kit.rand(0.4, 1.0); }

      cx.clearRect(0, 0, W, H);
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.born = Math.min(1, b.born + dt * 3);
        b.ph += dt * 1.8;
        b.y += b.vy * dt * (b.born < 1 ? 0.2 : 1);
        if (b.y < -b.r * 2) bubbles.splice(i, 1);
      }
      for (const b of bubbles) drawBubble(b);

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life -= dt * 3; r.r += S() * dt * 0.4;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        cx.strokeStyle = `hsla(${r.hue},90%,97%,${r.life})`;
        cx.lineWidth = 4 * r.life;
        cx.beginPath(); cx.arc(r.x, r.y, r.r, 0, 6.283); cx.stroke();
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life -= dt * 2.2; d.vy += S() * dt * 1.2;
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.life <= 0) { drops.splice(i, 1); continue; }
        cx.fillStyle = `hsla(${d.hue},90%,85%,${d.life})`;
        cx.beginPath(); cx.arc(d.x, d.y, S() * 0.008 * (0.5 + d.life), 0, 6.283); cx.fill();
      }
      for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i];
        f.life -= dt * 0.6; f.y -= S() * dt * 0.15;
        if (f.life <= 0) { floaters.splice(i, 1); continue; }
        const scale = 1 + (1 - f.life) * 0.8;
        cx.globalAlpha = Math.min(1, f.life * 2);
        cx.font = `${f.size * scale}px system-ui, "Apple Color Emoji", sans-serif`;
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(f.e, f.x, f.y);
        cx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
    };
  },
};
