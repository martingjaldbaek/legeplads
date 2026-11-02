// Minimal CDP driver: open a page in headless Chrome, run steps (wait / drag / tap / shot), report console errors.
// Usage: node drive.mjs <url> <outPrefix> '<json steps>'
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, stepsJson] = process.argv.slice(2);
const steps = JSON.parse(stepsJson || '[]');
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`,
  '--window-size=1180,820', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank',
], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'log'].includes(m.params.type))
    errors.push(`[console.${m.params.type}] ` + m.params.args.map(a => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(1500);

const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse' });
let shot = 0;
for (const s of steps) {
  if (s.wait) await sleep(s.wait);
  if (s.eval) { const r = await send('Runtime.evaluate', { expression: s.eval, returnByValue: true }); console.log('eval:', JSON.stringify(r.result?.result?.value)); }
  if (s.resizeTo) await send('Emulation.setDeviceMetricsOverride', { width: s.resizeTo[0], height: s.resizeTo[1], deviceScaleFactor: 1, mobile: false });
  if (s.tap) { await mouse('mousePressed', ...s.tap); await sleep(60); await mouse('mouseReleased', ...s.tap); }
  if (s.hold) { await mouse('mousePressed', ...s.hold.at); await sleep(s.hold.ms); await mouse('mouseReleased', ...s.hold.at); }
  if (s.dragEval) {
    const r = await send('Runtime.evaluate', { expression: s.dragEval, returnByValue: true });
    s.drag = r.result?.result?.value;
    console.log('dragEval ->', JSON.stringify(s.drag));
  }
  if (s.drag) {
    const [[x0, y0], [x1, y1]] = s.drag, n = s.n || 20;
    await mouse('mousePressed', x0, y0);
    for (let i = 1; i <= n; i++) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n, button: 'left', buttons: 1 }); await sleep(16); }
    if (!s.noRelease) await mouse('mouseReleased', x1, y1);
  }
  if (s.up) await mouse('mouseReleased', ...s.up);
  // touch input (as on the iPad): touchTap [x,y]; touchDrag [[x0,y0],[x1,y1]] with optional n and holdMs
  if (s.touchTap || s.touchDrag) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  if (s.touchTap) {
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: s.touchTap[0], y: s.touchTap[1] }] });
    await sleep(s.holdMs || 60);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  if (s.touchDrag) {
    const [[x0, y0], [x1, y1]] = s.touchDrag, n = s.n || 20;
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
    for (let i = 1; i <= n; i++) { await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n }] }); await sleep(s.stepMs || 16); }
    if (s.holdMs) await sleep(s.holdMs);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  if (s.shot) {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${out}-${++shot}.png`, Buffer.from(r.result.data, 'base64'));
  }
}
console.log(errors.filter(e => !/AudioContext/.test(e)).join('\n') || 'no errors');
ws.close(); chrome.kill();
