/* Legeplads shell: home screen, game switching, home button, touch lockdown, offline/update handling. */
import * as kit from './core.js';
import bobler from '../games/bobler.js';
import former from '../games/former.js';
import xylofon from '../games/xylofon.js';
import maling from '../games/maling.js';
import boh from '../games/boh.js';
import bondegaard from '../games/bondegaard.js';
import badetid from '../games/badetid.js';
import farver from '../games/farver.js';
import ansigt from '../games/ansigt.js';
import ballon from '../games/ballon.js';

// To add a game: create games/<name>.js (see README) and add it here.
const GAMES = [bobler, former, xylofon, maling, boh, bondegaard, badetid, farver, ansigt, ballon];

const $ = s => document.querySelector(s);
let current = null, stopGame = null, reloadWhenHome = false;

/* ---------- touch lockdown: no scrolling, zooming, text selection or long-press menus ---------- */
const block = e => e.preventDefault();
document.addEventListener('touchmove', block, { passive: false });
for (const t of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick', 'contextmenu', 'selectstart', 'dragstart']) {
  document.addEventListener(t, block, { passive: false });
}
// Any touch also (re)unlocks audio – iOS can suspend it after backgrounding.
document.addEventListener('pointerdown', () => kit.unlock(), { capture: true });
document.addEventListener('touchend', () => kit.audio(), { capture: true });

/* ---------- home ---------- */
function renderHome() {
  const tiles = $('#tiles');
  tiles.innerHTML = '';
  for (const g of GAMES) {
    const b = document.createElement('button');
    b.className = 'tile';
    b.style.setProperty('--c', g.color);
    b.innerHTML = `<span class="icon">${g.icon}</span><span class="name">${g.title}</span>`;
    b.addEventListener('click', () => openGame(g));
    tiles.appendChild(b);
  }
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  $('#hint').innerHTML = (standalone ? '' :
    'Til voksne: tryk <b>Del</b> → <b>Føj til hjemmeskærm</b> for at bruge Legeplads som app – også uden net.<br>') +
    'Lås iPad\'en til Legeplads med <b>Guidet adgang</b> (tryk tre gange på topknappen).';
}

function openGame(g) {
  kit.unlock();
  kit.sfx.blip(5);
  current = g;
  const stage = $('#stage');
  stage.innerHTML = '';
  stage.removeAttribute('style');
  // colour iOS uses for any area outside the layout (see css/app.css)
  document.documentElement.style.setProperty('--edge', g.edge || '#ffffff');
  document.body.classList.add('in-game');
  stopGame = g.start(stage, kit) || null;
}

function goHome() {
  if (stopGame) stopGame();
  stopGame = null;
  current = null;
  if (window.speechSynthesis) speechSynthesis.cancel();
  kit.clearConfetti();
  $('#stage').innerHTML = '';
  document.documentElement.style.removeProperty('--edge');
  document.body.classList.remove('in-game');
  if (reloadWhenHome) location.reload();
}

/* ---------- home button: one tap back to the menu ---------- */
$('#homeBtn').addEventListener('click', () => { kit.sfx.blip(3); goHome(); });

/* ---------- offline + updates ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
  let hadController = !!navigator.serviceWorker.controller;
  // A new version took over: reload to use it, but never in the middle of a game.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }
    if (current) reloadWhenHome = true; else location.reload();
  });
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.version) {
      $('#version').textContent = e.data.dev ? 'Udviklingsversion (ingen offline-cache)' : `Version ${e.data.version.slice(0, 7)} · virker offline`;
    }
  });
  navigator.serviceWorker.ready.then(reg => reg.active && reg.active.postMessage('version'));
}

renderHome();

// Testing shortcut: ?spil=former opens a game directly.
const direct = GAMES.find(g => g.id === new URLSearchParams(location.search).get('spil'));
if (direct) openGame(direct);
