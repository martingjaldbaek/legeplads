# Legeplads: notes for coding agents

An offline PWA suite of touch games for one specific child (2 years 4 months, Danish-speaking), played on an iPad
from a Home Screen icon. Plain HTML/CSS/JS ES modules, **no build step and no dependencies**. All text the child hears
or sees is **Danish**; code, comments and docs are English. README.md lists the games and the grown-up instructions.

## Deploying: read this first
- Repo `martingjaldbaek/legeplads` (public). Live at https://martingjaldbaek.github.io/legeplads/
- **Every push to `main` deploys immediately** (`.github/workflows/pages.yml`). Only push when the user asks for it in
  the current turn. Commit locally freely.
- The workflow copies everything except `tools/`, `README.md`, `.github` and the agent docs, then stamps `sw.js`:
  `VERSION` becomes the commit SHA and `ASSETS` the list of every file. **New files are precached automatically**;
  never maintain an asset list by hand.
- The iPad picks up a new version the next time the app opens online, and reloads only on the home screen, never
  mid-game. The commit hash shows at the bottom of the home screen, so you can tell the user which version to look for.

## Layout
- `index.html`: `#home` (tile grid plus a grown-up info block: voice test and picker, version, screen dims), `#stage`
  (the running game's root), `#homeBtn` (🏠, one tap back).
- `js/app.js`: the `GAMES` list (imports plus array order = tile order), adaptive tile grid (`layoutTiles` picks the column
  count that gives the biggest tiles that fit), touch lockdown, `openGame`/`goHome`, the per-game `--edge` colour and
  theme-color, the iOS 26 bottom-gap workaround, the voice picker, `?spil=<id>` deep links, and service worker updates.
- `js/core.js`: the shared **kit** passed to every game (below).
- `css/app.css`: shell styles only. Games inject their own CSS.
- `games/<id>.js`: one file per game. `games/art/*.js`: SVG art as template strings, plus `flipbog.js` (the shared
  swipe-strip engine used by Fjæs and Figurer).
- `sw.js`: cache-first when deployed; network-first locally (`VERSION` is still the `__VERSION__` placeholder).
- `tools/make_icons.py` regenerates `icons/`; `tools/drive.mjs` is the headless test driver (see Testing).

## Writing a game
```js
export default {
  id: 'navn', title: 'Navn', icon: '🐘', color: '#8338ec',
  edge: '#ccbbff',            // colour at the bottom of the game's background (iOS paints it behind the home bar)
  start(root, kit) {          // root: full-screen div; build everything inside it
    kit.injectCSS(root, CSS); // prefix every class with the game id
    const t = kit.timers();
    const off = kit.onResize(root, layout);   // ALWAYS lay out from root.clientWidth/Height here
    return () => { t.clear(); off(); /* cancel rAF, remove window listeners, stop sustained sounds */ };
  },
};
```
Then import it in `js/app.js`, add it to `GAMES`, and add a line to README.md.

### The kit (`js/core.js`)
- **Random helpers:** `rand(a,b)`, `pick(arr)`, `shuffle(arr)`, `COLORS`.
- **Sound** (all synthesized with Web Audio, no audio files):
  - Tones and noise: `tone(freq,{at,dur,type,vol,slide})`, `noise({dur,vol,freq,q,sweep})`.
  - Held notes: `sustain({type,freq,vol})` → `{set, stop}`.
  - Scales and output: `scaleHz(step)` (pentatonic, so anything sounds nice together), `output()` (the master node).
  - `sfx.*` presets: pop, blip, pickUp, snap, boing, chime, fanfare, xylo, squeak, splat, bang, whoosh, plop, rustle,
    fwip, giggle.
- **Speech:** `say(text,{pitch,rate})` uses the iPad's Danish voice. Keep speech sparse: name the thing, say a short
  cheer. Never long sentences.
- **Interaction:** `draggable(el,{start,move,end})` (pointer capture, one finger per element), `replay(el, cls)`
  (restart a CSS animation), `timers()` (`later`, `every`, `clear`), `onResize`.
- **Confetti:** `burst(x,y,n,power)`, `bigBurst()`, `clearConfetti()`.

## Design rules (what works for this child)
- **More is better.** The user reports he responds best to lots to do and a big, inspiring palette of choices: many
  parts, many items, many tappable things that react. Prefer adding options over minimalism.
- **Toddler hands:**
  - Big targets and generous snapping, e.g. "drop anywhere near → flies to the nearest free slot".
  - Touching anywhere grabs the current tool.
  - Never a "wrong" state or failure sound; wrong drops just hop back or poof.
  - Generous progress thresholds, and a hint (glow/bounce) on whatever to do next.
- **Feedback on everything:** a sound plus a small animation on every touch; a fanfare plus confetti on milestones.
  Then loop: a new animal, car or round arrives automatically.
- **Art:**
  - Cute SVG in the established style: thick `#4a3b5c` outlines, round shapes, faces with blinking eyes.
    `games/art/instrumenter-art.js` is the reference.
  - Emoji are fine for small items, but **render-check them** in Apple's font. For example, 🫗 is a wine glass, and the
    👂 ear has its canal on the left, so it is mirrored on the face's left half.
- **Both orientations** must work: rotate during play and nothing may be stuck at the old size.
- **No surprises for the grown-up:** no permission prompts (motion, mic, camera), no external network requests, no
  analytics.

## iPad / Safari gotchas (learned the hard way)
- **Audio** only starts after a user gesture. app.js re-unlocks on every pointerdown, and `unlock()` sets
  `navigator.audioSession.type = 'playback'` so sound plays with the mute switch on.
- **Speech:** Safari drops an utterance queued right after `cancel()`. `say()` handles this, so don't call
  speechSynthesis directly. Enhanced or premium voices are often not exposed to web pages at all.
- **Layout:** window `resize` can fire before the new size is known. Use `kit.onResize` (a ResizeObserver plus a late
  re-check) for layout, never the window event.
- **Bottom strip:** iOS 26 Home Screen apps can lay out shorter than the screen, leaving a strip at the bottom.
  - app.js stretches the body by the measured gap (`--vp-gap`), and the `#dims` line on the home screen shows the
    numbers.
  - A fixed extra overdraw was tried and **did not help**, and it hid the bottom of games. Don't reintroduce it.
- **Lost fingers (the most common iPad bug here):** iOS sometimes never delivers `pointerup`, for example near
  the screen edges (swipe-home), with Guided Access, or with a second finger. Every input path must survive that:
  - **A new touch always wins.** Never write `if (finger) return` locks. `kit.draggable` already finishes a stale
    drag when the next touch arrives anywhere.
  - **Handle `pointercancel`** like `pointerup`. For drags that start on a small source, listen for move, up and
    cancel on `window`, not only on the element.
  - **In-flight copies** (the floating copy you drag out of a tray) get `pointer-events: none`. Otherwise a
    stranded copy sits on top of its source and swallows every later touch.
  - **Keep things clear of the bottom edge:** don't park important draggables in the bottom ~70 px.
- **Held sounds** (`kit.sustain`): give every instance its own handle and stop exactly that one. Never share
  one variable across overlapping uses; that leaked a forever-buzzing engine in Bilvask. Stop them all in `stop()`,
  and give long-running ones a safety timeout.
- **Engines and rumbles:** don't use a held low sawtooth or square (below ~100 Hz). The iPad speaker can't play
  the fundamental, so it comes out as a raspy buzz. Use short rounded pulses (`tone` every ~110 ms around
  120–180 Hz) instead; they also can't leak. Likewise, don't fire noise bursts back-to-back (scrub, spray):
  space them out, or they merge into a buzz.
- **SVG input:** don't rely on `getScreenCTM()`. Compute the scene↔screen mapping from your own viewBox, and take
  pointer events on the game's root div rather than on SVG children.
- **SVG:**
  - With `transform-box: fill-box`, SVG `rotate(a x y)` attributes shift. Put such groups in
    `transform-box: view-box`.
  - Moving or re-parenting an element mid-drag can drop pointer capture. Reorder on pointerdown instead.

## Testing
No test suite. Run a local server and drive headless Chrome with `tools/drive.mjs`:
```
python3 -m http.server 8765 --bind 127.0.0.1        # from the repo root (in the Claude sandbox: needs sandbox bypass, ~/git is deny-read)
node tools/drive.mjs "http://127.0.0.1:8765/?spil=<id>" /path/to/out/prefix '[{"wait":1000},{"shot":1}]'
```
- **Driver steps:** `wait` (ms), `eval` (JS expression), `tap [x,y]`, `hold {at:[x,y], ms}`, `drag [[x0,y0],[x1,y1]]`
  (with optional `n` and `noRelease`), `up [x,y]`, `dragEval` (an expression returning the drag pair; wrap it in an
  IIFE), `resizeTo [w,h]`, `shot`.
- **Output:** it prints console errors (or "no errors") and writes `<prefix>-N.png`. Look at the screenshots.
- **Viewport:** the default is 1180×820 (iPad landscape); use `resizeTo [820,1180]` for portrait.
- **Limits:** headless Chrome can't tell you how sounds or speech come out, or how touch feels on the device. Say so
  when reporting, and ask the user to check those on the iPad.

## Related
`~/Dropbox/Adam-spil/bogstavleg` is a separate keyboard letter game for the PC (Chrome, keyboard lock).
`games/bogstaver.js` is its iPad port with an on-screen Danish keyboard. The recordings in `games/bogstav-lyd/`
are copies of Bogstavleg's `lyd/` (letters only, no digits); if new takes are recorded there, copy them over.
