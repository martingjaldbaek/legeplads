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
import musik from '../games/musik.js';
import instrumenter from '../games/instrumenter.js';
import tryllemaling from '../games/tryllemaling.js';

// To add a game: create games/<name>.js (see README) and add it here.
const GAMES = [bobler, former, xylofon, maling, tryllemaling, boh, bondegaard, badetid,
  farver, ansigt, ballon, instrumenter, musik];

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

/* ---------- iOS 26 standalone bottom gap ---------- */
// See css/app.css. Only in Home Screen mode, only when we fill the whole screen width (not split view),
// and capped, so nothing changes in Safari tabs or on iPadOS versions without the bug.
function fixViewportGap() {
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  const land = innerWidth > innerHeight;
  const sw = land ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const sh = land ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height);
  let gap = 0;
  if (standalone && Math.abs(innerWidth - sw) <= 2) gap = Math.max(0, Math.min(120, sh - innerHeight));
  document.documentElement.style.setProperty('--vp-gap', gap + 'px');
  $('#dims').textContent = `Skærm ${sw}×${sh} · vindue ${innerWidth}×${innerHeight} · udfyldt ${gap}px`;
}
fixViewportGap();
addEventListener('resize', () => { fixViewportGap(); setTimeout(fixViewportGap, 400); });
addEventListener('orientationchange', () => setTimeout(fixViewportGap, 400));

/* ---------- voice check for grown-ups ---------- */
function showVoice() {
  const name = kit.voiceName(), all = kit.danishVoices();
  $('#voiceInfo').textContent = !window.speechSynthesis ? 'Tale understøttes ikke her'
    : name ? `Stemme: ${name}${kit.voiceQuality()}`
    : kit.voiceCount() ? `Ingen dansk stemme fundet (${kit.voiceCount()} andre stemmer)` : 'Stemmer indlæses…';
  // more than one Danish voice exposed: let the grown-up choose
  let sel = $('#voiceSelect');
  if (all.length > 1) {
    if (!sel) { sel = document.createElement('select'); sel.id = 'voiceSelect'; $('#voiceInfo').after(sel); sel.addEventListener('change', () => { kit.chooseVoice(sel.value); kit.say('Hej! Koen siger muh!'); showVoice(); }); }
    sel.innerHTML = all.map(v => `<option value="${v.voiceURI}" ${v.name === name ? 'selected' : ''}>${v.name} – ${v.voiceURI.split('.').slice(-3).join('.')}</option>`).join('');
  }
}
$('#voiceTest').addEventListener('click', () => {
  kit.unlock();
  kit.say('Hej! Koen siger muh!', { pitch: 1.1 });
  showVoice();
});
if (window.speechSynthesis) speechSynthesis.addEventListener?.('voiceschanged', showVoice);
setTimeout(showVoice, 500);

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
