/* Musikmaskine: pick a song, then light up tiles in a grid. A playhead loops across the columns and
 * plays every lit tile – top rows are melody notes (always in the song's key), bottom rows are drums.
 * Each song has its own tempo, sound and a soft backing track, plus a small starter pattern.
 */
const STEPS = 8;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const SONGS = [
  { name: 'Solskin', icon: '🌞', bpm: 112, root: 60, scale: [0, 2, 4, 7, 9], lead: 'pluck',
    chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]],
    bg: 'linear-gradient(#fff6cf, #ffd98a)', edge: '#ffd98a', tile: '#fff8e6',
    start: { kick: [0, 4], hat: [2, 6], mel: [[0, 4], [2, 2], [4, 3], [6, 2]] } },
  { name: 'Dino-dans', icon: '🦖', bpm: 96, root: 57, scale: [0, 3, 5, 7, 10], lead: 'square',
    chords: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [0, 3, 7]],
    bg: 'linear-gradient(#cdeccf, #6fbf73)', edge: '#6fbf73', tile: '#ecf8ec',
    start: { kick: [0, 3, 4], snare: [2, 6], mel: [[0, 4], [3, 3], [4, 4], [7, 1]] } },
  { name: 'Godnat', icon: '🌙', bpm: 72, root: 65, scale: [0, 2, 4, 7, 9], lead: 'bell',
    chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]],
    bg: 'linear-gradient(#3b3f8f, #1d1f4f)', edge: '#1d1f4f', tile: '#4a4f9f', dark: true,
    start: { kick: [0], mel: [[0, 2], [2, 1], [4, 0], [6, 1]] } },
  { name: 'Rumrejse', icon: '🚀', bpm: 124, root: 62, scale: [0, 2, 5, 7, 9], lead: 'saw',
    chords: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 5]],
    bg: 'linear-gradient(#6a3fbf, #2b1a5a)', edge: '#2b1a5a', tile: '#5a40a0', dark: true,
    start: { kick: [0, 2, 4, 6], hat: [1, 3, 5, 7], mel: [[0, 0], [1, 2], [2, 4], [3, 3]] } },
  { name: 'Regnvejr', icon: '🌧️', bpm: 84, root: 62, scale: [0, 3, 5, 7, 10], lead: 'marimba',
    chords: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]],
    bg: 'linear-gradient(#cfe3f2, #8fb3cf)', edge: '#8fb3cf', tile: '#e6f0f8',
    start: { kick: [0, 5], hat: [0, 1, 2, 3, 4, 5, 6, 7], mel: [[0, 1], [2, 2], [3, 3], [5, 2], [6, 4]] } },
  { name: 'Havet', icon: '🌊', bpm: 66, root: 64, scale: [0, 2, 4, 7, 9], lead: 'flute',
    chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]],
    bg: 'linear-gradient(#b9f0ff, #3fa7d6)', edge: '#3fa7d6', tile: '#e2f8ff',
    start: { kick: [0], snare: [4], mel: [[0, 2], [3, 1], [4, 2], [6, 3]] } },
  { name: 'Rock', icon: '🎸', bpm: 128, root: 52, scale: [0, 3, 5, 7, 10], lead: 'rock',
    chords: [[0, 7, 12], [3, 10, 15], [5, 12, 17], [3, 10, 15]],
    bg: 'linear-gradient(#ff6b6b, #3a0f1f)', edge: '#3a0f1f', tile: '#6b2335', dark: true,
    start: { kick: [0, 3, 4], snare: [2, 6], hat: [0, 1, 2, 3, 4, 5, 6, 7], mel: [[0, 4], [1, 4], [3, 3], [4, 4], [6, 2]] } },
  { name: 'Cirkus', icon: '🎪', bpm: 138, root: 60, scale: [0, 2, 4, 7, 9], lead: 'organ',
    chords: [[0, 4, 7], [-5, -1, 2], [0, 4, 7], [-5, -1, 2]],
    bg: 'linear-gradient(#fff0f0, #ffb3b3)', edge: '#ffb3b3', tile: '#fff8f8',
    start: { kick: [0, 4], snare: [2, 6], mel: [[0, 2], [1, 1], [2, 0], [4, 3], [5, 2], [6, 1]] } },
];
const ROW_COLORS = ['#ff3b6b', '#ff8a00', '#ffc400', '#06d6a0', '#3a86ff'];
const DRUMS = [['hat', '✨', '#c0c6d6'], ['snare', '👏', '#9aa3b8'], ['kick', '🥁', '#6c7690']];

const CSS = `
.mm-picker { position:absolute; inset:0; display:grid; grid-template-columns: repeat(4, auto); align-content:center; justify-content:center; gap:3.5vmin; padding:12vh 4vw 6vh; }
@media (orientation: portrait) { .mm-picker { grid-template-columns: repeat(2, auto); } }
.mm-song { width:min(19vw, 34vh); aspect-ratio:1; border:none; border-radius:22%; color:#fff; font-weight:900;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1vmin;
  box-shadow: 0 1vmin 0 rgba(0,0,0,.18); font-size:min(3vw, 4.5vh); text-shadow: 0 2px 0 rgba(0,0,0,.2); }
.mm-song span { font-size:2.6em; line-height:1; }
.mm-song:active { transform:scale(.93); }
.mm-grid { position:absolute; left:50%; top:52%; transform:translate(-50%,-50%); display:grid; gap:1vmin; }
.mm-label { display:flex; align-items:center; justify-content:center; font-size:4vmin; }
.mm-label i { width:45%; aspect-ratio:1; border-radius:50%; background:var(--c); }
.mm-tile { border-radius:22%; background:var(--off); box-shadow: inset 0 -.5vmin 0 rgba(0,0,0,.08); transition: background .12s, transform .12s; touch-action:none; }
.mm-tile.on { background:var(--c); box-shadow: inset 0 -.6vmin 0 rgba(0,0,0,.18), 0 0 2vmin var(--c); }
.mm-tile.now { filter: brightness(1.12); transform: scale(1.04); }
.mm-tile.on.now { animation: mm-hit .25s ease; }
.mm-tile.beat { outline: .4vmin solid rgba(255,255,255,.55); outline-offset:-.4vmin; }
@keyframes mm-hit { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1.04)} }
.mm-btn { position:absolute; z-index:10; top: calc(env(safe-area-inset-top) + 14px);
  width:max(64px, 9vmin); height:max(64px, 9vmin); border:none; border-radius:50%; padding:0;
  background: rgba(255,255,255,.85); box-shadow: 0 4px 0 rgba(0,0,0,.12); font-size:max(32px, 4.6vmin); }
.mm-btn:active { transform: scale(.9); }
`;

export default {
  id: 'musik',
  title: 'Musikmaskine',
  icon: '🎛️',
  color: '#3a0ca3',
  edge: '#ffd98a',

  start(root, kit) {
    kit.injectCSS(root, CSS);
    const ac = kit.audio();
    let song = null, grid = null, tiles = [], cols = [], step = 0, nextTime = 0, loop = 0, timer = 0, raf = 0;
    const queue = [];                    // { step, time } scheduled but not yet shown

    /* ---------- sounds (scheduled at an absolute audio time) ---------- */
    const at = time => Math.max(0, time - ac.currentTime);
    function lead(m, time) {
      const f = midi(m), a = at(time);
      if (song.lead === 'pluck') { kit.tone(f, { at: a, dur: 0.45, type: 'triangle', vol: 0.22, attack: 0.003 }); kit.tone(f * 2, { at: a, dur: 0.15, vol: 0.05 }); }
      if (song.lead === 'square') kit.tone(f, { at: a, dur: 0.3, type: 'square', vol: 0.07, attack: 0.004 });
      if (song.lead === 'bell') { kit.tone(f, { at: a, dur: 1.4, vol: 0.18, attack: 0.002 }); kit.tone(f * 2.76, { at: a, dur: 0.5, vol: 0.04 }); }
      if (song.lead === 'marimba') { kit.tone(f, { at: a, dur: 0.4, vol: 0.26, attack: 0.002 }); kit.tone(f * 4, { at: a, dur: 0.06, vol: 0.05, attack: 0.001 }); }
      if (song.lead === 'flute') { kit.tone(f, { at: a, dur: 0.6, vol: 0.17, attack: 0.06 }); kit.tone(f * 2, { at: a, dur: 0.5, vol: 0.025, attack: 0.06 }); }
      if (song.lead === 'rock') { kit.tone(f, { at: a, dur: 0.3, type: 'square', vol: 0.06, attack: 0.003 }); kit.tone(f * 0.5, { at: a, dur: 0.3, type: 'sawtooth', vol: 0.05, attack: 0.003 }); kit.tone(f * 0.75, { at: a, dur: 0.3, type: 'sawtooth', vol: 0.03 }); }
      if (song.lead === 'organ') { kit.tone(f, { at: a, dur: 0.28, type: 'square', vol: 0.045, attack: 0.005 }); kit.tone(f * 2, { at: a, dur: 0.28, vol: 0.07, attack: 0.005 }); }
      if (song.lead === 'saw') { kit.tone(f, { at: a, dur: 0.25, type: 'sawtooth', vol: 0.06, attack: 0.004 }); kit.tone(f * 1.005, { at: a, dur: 0.25, type: 'sawtooth', vol: 0.04 }); }
    }
    const drum = {
      kick: time => kit.tone(150, { at: at(time), dur: 0.28, vol: 0.55, slide: 45, attack: 0.002 }),
      snare: time => { kit.noise({ at: at(time), dur: 0.16, vol: 0.32, freq: 1800, q: 0.7 }); kit.tone(190, { at: at(time), dur: 0.08, type: 'triangle', vol: 0.15 }); },
      hat: time => kit.noise({ at: at(time), dur: 0.05, vol: 0.14, freq: 8000, q: 1 }),
    };
    function backing(s, time, stepDur) {
      const chord = song.chords[loop % song.chords.length];
      if (s === 0 || s === 4) kit.tone(midi(song.root - 12 + chord[0]), { at: at(time), dur: stepDur * 3.5, type: 'triangle', vol: 0.12 });
      if (s === 0) chord.forEach(n => kit.tone(midi(song.root + n), { at: at(time), dur: stepDur * STEPS * 0.95, vol: 0.035, attack: 0.08 }));
    }

    /* ---------- scheduler: look ahead 120 ms, tick every 25 ms ---------- */
    function schedule() {
      const stepDur = 60 / song.bpm / 2;          // eighth notes
      while (nextTime < ac.currentTime + 0.12) {
        backing(step, nextTime, stepDur);
        tiles.forEach((row, r) => {
          if (!row[step].on) return;
          if (r < 5) lead(song.root + 12 + song.scale[4 - r], nextTime);
          else drum[DRUMS[r - 5][0]](nextTime);
        });
        queue.push({ step, time: nextTime });
        nextTime += stepDur;
        step = (step + 1) % STEPS;
        if (step === 0) loop++;
      }
    }
    function draw() {
      while (queue.length && queue[0].time <= ac.currentTime) {
        const { step: s } = queue.shift();
        cols.forEach((col, c) => col.forEach(t => t.el.classList.toggle('now', c === s)));
      }
      raf = requestAnimationFrame(draw);
    }

    /* ---------- screens ---------- */
    function stopLoop() { clearInterval(timer); cancelAnimationFrame(raf); queue.length = 0; }

    function showPicker() {
      stopLoop();
      root.querySelectorAll('.mm-picker, .mm-grid, .mm-btn').forEach(e => e.remove());
      root.style.background = 'linear-gradient(#fff4fb, #ffe0f0)';
      document.documentElement.style.setProperty('--edge', '#ffe0f0');
      const p = document.createElement('div');
      p.className = 'mm-picker';
      SONGS.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = 'mm-song';
        b.style.background = ['#ff9f1c', '#2bb24c', '#3d4bb0', '#7b3fd1', '#5b8fb9', '#1fa2d6', '#d62839', '#ff5d8f'][i];
        b.innerHTML = `<span>${s.icon}</span>${s.name}`;
        b.addEventListener('click', () => { kit.sfx.blip(7); openSong(s); });
        p.appendChild(b);
      });
      root.appendChild(p);
    }

    function openSong(s) {
      song = s;
      root.querySelectorAll('.mm-picker').forEach(e => e.remove());
      root.style.background = s.bg;
      document.documentElement.style.setProperty('--edge', s.edge);
      grid = document.createElement('div');
      grid.className = 'mm-grid';
      root.appendChild(grid);
      tiles = []; cols = Array.from({ length: STEPS }, () => []);
      const rows = ROW_COLORS.map((c, i) => ({ c, label: `<i style="--c:${c}"></i>`, kind: 'mel', i }))
        .concat(DRUMS.map(([id, icon, c]) => ({ c: '#ffffff', label: icon, kind: id })));
      rows.forEach((row, r) => {
        const lab = document.createElement('div');
        lab.className = 'mm-label';
        lab.innerHTML = row.label;
        grid.appendChild(lab);
        const line = [];
        for (let c = 0; c < STEPS; c++) {
          const el = document.createElement('div');
          el.className = 'mm-tile' + (c % 4 === 0 ? ' beat' : '');
          el.style.setProperty('--c', r < 5 ? row.c : (s.dark ? '#ffffff' : '#5b6378'));
          el.style.setProperty('--off', s.tile);
          el.dataset.r = r; el.dataset.c = c;
          grid.appendChild(el);
          const t = { el, on: false };
          line.push(t); cols[c].push(t);
        }
        tiles.push(line);
      });
      const set = (r, c, on) => { const t = tiles[r][c]; t.on = on; t.el.classList.toggle('on', on); };
      s.start.kick?.forEach(c => set(7, c, true));
      s.start.snare?.forEach(c => set(6, c, true));
      s.start.hat?.forEach(c => set(5, c, true));
      s.start.mel?.forEach(([c, r]) => set(r, c, true));

      // tap to toggle; drag across to paint the same state onto more tiles
      let paint = null;
      const tileAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.classList.contains('mm-tile') ? el : null; };
      const apply = el => {
        const r = +el.dataset.r, c = +el.dataset.c;
        if (tiles[r][c].on === paint) return;
        set(r, c, paint);
        if (paint) { r < 5 ? lead(song.root + 12 + song.scale[4 - r], ac.currentTime) : drum[DRUMS[r - 5][0]](ac.currentTime); }
        else kit.sfx.blip(2);
      };
      grid.addEventListener('pointerdown', e => {
        const el = tileAt(e.clientX, e.clientY);
        if (!el) return;
        paint = !tiles[+el.dataset.r][+el.dataset.c].on;
        apply(el);
      });
      grid.addEventListener('pointermove', e => { if (paint === null) return; const el = tileAt(e.clientX, e.clientY); if (el) apply(el); });
      const end = () => { paint = null; };
      grid.addEventListener('pointerup', end);
      grid.addEventListener('pointercancel', end);

      const back = document.createElement('button');
      back.className = 'mm-btn'; back.textContent = '🎵'; back.style.right = 'calc(env(safe-area-inset-right) + 14px)';
      back.addEventListener('click', () => { kit.sfx.blip(3); showPicker(); });
      const clear = document.createElement('button');
      clear.className = 'mm-btn'; clear.textContent = '🧽'; clear.style.right = 'calc(env(safe-area-inset-right) + 14px + max(64px, 9vmin) + 14px)';
      clear.addEventListener('click', () => { kit.sfx.whoosh(); tiles.forEach((row, r) => row.forEach((t, c) => set(r, c, false))); });
      root.append(back, clear);

      layout();
      step = 0; loop = 0; nextTime = ac.currentTime + 0.1;
      timer = setInterval(schedule, 25);
      schedule();
      raf = requestAnimationFrame(draw);
    }

    function layout() {
      if (!grid) return;
      const W = root.clientWidth, H = root.clientHeight;
      const size = Math.min((W * 0.86) / (STEPS + 1), (H * 0.78) / 8);
      grid.style.gridTemplateColumns = `${size * 0.8}px repeat(${STEPS}, ${size}px)`;
      grid.style.gridAutoRows = size + 'px';
    }
    const offResize = kit.onResize(root, layout);

    showPicker();
    return () => { stopLoop(); offResize(); };
  },
};
