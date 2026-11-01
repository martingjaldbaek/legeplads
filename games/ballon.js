/* Ballon: press and hold anywhere to blow up a balloon (the sound rises as it grows).
 * Let go and it floats away – hold too long and it POPS with confetti. Tap a flying balloon to pop it.
 */
const COLORS = ['#ff3b6b', '#ff8a00', '#ffc400', '#06d6a0', '#3a86ff', '#8338ec', '#f15bb5', '#00a6fb'];

export default {
  id: 'ballon',
  title: 'Ballon',
  icon: '🎈',
  color: '#ff3b6b',
  edge: '#bfe6ff',

  start(root, kit) {
    root.style.background = 'linear-gradient(#7ec8ff, #bfe6ff)';
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
    const offResize = kit.onResize(root, resize);

    const balloons = [], shreds = [], clouds = [];
    const holding = new Map();   // pointerId -> balloon
    for (let i = 0; i < 4; i++) clouds.push({ x: Math.random() * W, y: kit.rand(0.08, 0.6) * H, s: kit.rand(0.6, 1.2), v: kit.rand(8, 20) });

    const minR = () => S() * 0.035, maxR = () => S() * 0.17;
    const growRate = () => S() * 0.06;   // px per second → ~2.2 s to bursting
    const pitch = b => 180 + (b.r / maxR()) * 700;

    function pop(b) {
      const i = balloons.indexOf(b);
      if (i >= 0) balloons.splice(i, 1);
      if (b.voice) b.voice.stop(0.03);
      kit.sfx.bang();
      kit.burst(b.x, b.y - b.r, 70, 1.1);
      for (let k = 0; k < 10; k++) {
        const a = Math.random() * 6.28, s = S() * kit.rand(0.3, 0.8);
        shreds.push({ x: b.x, y: b.y - b.r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: Math.random() * 6, life: 1, c: b.c });
      }
      setTimeout(() => kit.sfx.giggle(), 250);
      if (Math.random() < 0.5) setTimeout(() => kit.say(kit.pick(['Bang!', 'Pang!', 'Hov!']), { pitch: 1.4 }), 350);
    }

    function release(b) {
      if (b.voice) { b.voice.stop(); b.voice = null; }
      b.state = 'fly';
      b.vy = -S() * kit.rand(0.12, 0.2);
      kit.sfx.fwip();
    }

    cv.addEventListener('pointerdown', e => {
      e.preventDefault();
      const x = e.clientX, y = e.clientY;
      // tapping a flying balloon pops it
      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        if (b.state === 'fly' && Math.hypot(x - b.x, y - (b.y - b.r)) < b.r * 1.15 + 10) { pop(b); return; }
      }
      const b = {
        x, y, r: minR(), c: kit.pick(COLORS), state: 'grow', ph: Math.random() * 6.28, vy: 0,
        face: Math.random() < 0.4, voice: holding.size < 4 ? kit.sustain({ type: 'triangle', freq: 180, vol: 0.06 }) : null,
      };
      balloons.push(b);
      holding.set(e.pointerId, b);
    });
    cv.addEventListener('pointermove', e => {
      const b = holding.get(e.pointerId);
      if (b && b.state === 'grow') { b.x = e.clientX; b.y = e.clientY; }
    });
    const up = e => {
      const b = holding.get(e.pointerId);
      holding.delete(e.pointerId);
      if (b && b.state === 'grow') release(b);
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    function drawCloud(c) {
      cx.fillStyle = 'rgba(255,255,255,.85)';
      const s = S() * 0.07 * c.s;
      for (const [dx, dy, r] of [[0, 0, 1], [1.1, -0.3, 0.8], [-1, 0.1, 0.7], [0.4, 0.3, 0.9]]) {
        cx.beginPath(); cx.arc(c.x + dx * s, c.y + dy * s, r * s, 0, 6.283); cx.fill();
      }
    }

    function drawBalloon(b) {
      const sway = b.state === 'fly' ? Math.sin(b.ph) * b.r * 0.15 : 0;
      const x = b.x + sway, knotY = b.y, cyy = knotY - b.r * 1.05, rx = b.r * 0.86, ry = b.r;
      // string
      cx.strokeStyle = 'rgba(80,80,90,.6)';
      cx.lineWidth = 2;
      cx.beginPath();
      cx.moveTo(x, knotY);
      const L = b.r * 1.8;
      cx.bezierCurveTo(x - b.r * 0.25 - sway, knotY + L * 0.33, x + b.r * 0.25 - sway, knotY + L * 0.66, x - sway * 2, knotY + L);
      cx.stroke();
      // body
      const g = cx.createRadialGradient(x - rx * 0.35, cyy - ry * 0.4, ry * 0.1, x, cyy, ry * 1.1);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.18, b.c);
      g.addColorStop(1, b.c);
      cx.fillStyle = g;
      cx.beginPath(); cx.ellipse(x, cyy, rx, ry, 0, 0, 6.283); cx.fill();
      cx.fillStyle = 'rgba(0,0,0,.12)';
      cx.beginPath(); cx.ellipse(x + rx * 0.2, cyy + ry * 0.15, rx * 0.75, ry * 0.8, 0, 0.2, 2.2); cx.fill();
      // knot
      cx.fillStyle = b.c;
      cx.beginPath();
      cx.moveTo(x, knotY - b.r * 0.08);
      cx.lineTo(x - b.r * 0.1, knotY + b.r * 0.06);
      cx.lineTo(x + b.r * 0.1, knotY + b.r * 0.06);
      cx.closePath(); cx.fill();
      if (b.face) {
        cx.fillStyle = '#3b2a4a';
        cx.beginPath(); cx.arc(x - rx * 0.3, cyy - ry * 0.05, ry * 0.08, 0, 6.283); cx.fill();
        cx.beginPath(); cx.arc(x + rx * 0.3, cyy - ry * 0.05, ry * 0.08, 0, 6.283); cx.fill();
        cx.strokeStyle = '#3b2a4a'; cx.lineWidth = Math.max(2, ry * 0.05); cx.lineCap = 'round';
        cx.beginPath();
        if (b.state === 'grow' && b.r > maxR() * 0.8) cx.ellipse(x, cyy + ry * 0.25, rx * 0.12, ry * 0.12, 0, 0, 6.283);  // "oh!"
        else cx.arc(x, cyy + ry * 0.12, rx * 0.25, 0.2, Math.PI - 0.2);
        cx.stroke();
      }
    }

    let last = performance.now(), raf = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      cx.clearRect(0, 0, W, H);
      for (const c of clouds) {
        c.x += c.v * dt;
        if (c.x > W + S() * 0.2) c.x = -S() * 0.2;
        drawCloud(c);
      }
      for (const b of balloons.slice()) {
        if (b.state === 'grow') {
          b.r += growRate() * dt;
          if (b.voice) b.voice.set(pitch(b), 0.05);
          if (b.r >= maxR()) {
            for (const [id, hb] of holding) if (hb === b) holding.delete(id);
            pop(b);
            continue;
          }
          // trembles as it gets close to bursting
          if (b.r > maxR() * 0.8) b.x += kit.rand(-1, 1) * S() * 0.003;
        } else {
          b.ph += dt * 2;
          b.y += b.vy * dt;
          if (b.y < -b.r * 3) balloons.splice(balloons.indexOf(b), 1);
        }
      }
      for (const b of balloons) drawBalloon(b);
      for (let i = shreds.length - 1; i >= 0; i--) {
        const s = shreds[i];
        s.life -= dt * 1.5; s.vy += S() * dt * 1.5;
        s.x += s.vx * dt; s.y += s.vy * dt; s.r += dt * 8;
        if (s.life <= 0) { shreds.splice(i, 1); continue; }
        cx.save();
        cx.globalAlpha = s.life;
        cx.translate(s.x, s.y); cx.rotate(s.r);
        cx.fillStyle = s.c;
        cx.fillRect(-S() * 0.012, -S() * 0.005, S() * 0.024, S() * 0.01);
        cx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      offResize();
      balloons.forEach(b => b.voice && b.voice.stop());
    };
  },
};
