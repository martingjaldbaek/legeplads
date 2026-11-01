# Legeplads

A small suite of touch games for a toddler, built as an offline-capable web app (PWA) for iPad.
It's plain HTML/CSS/JS with no build step and no dependencies.

## Games
- **Bobler** 🫧: bubbles float up and you tap to pop them; each size plays its own note. Tapping empty water blows a new bubble. Animal bubbles say the animal's name and throw confetti.
- **Former** 🔺: a shape sorter. Drag the smiling shapes into their holes, which snap in generously for small fingers. Each shape says its name, and finishing a round plays a fanfare and starts a new round.
- **Xylofon** 🎶: rainbow bars with faces. Tap to play, or slide a finger across for a glissando. Multi-touch, and pentatonic, so nothing sounds wrong.
- **Maling** 🎨: finger painting in shifting rainbow strokes with sparkles. Each finger sings, higher towards the top of the screen. 🧽 wipes the paper.
- **Bøh!** 🙈: animals hide behind bushes and presents and peek out as a hint. Tap the right spot for "Bøh!", the animal's name and confetti.
- **Bondegården** 🐮: tap an animal and it jumps, shows a speech bubble and says "Koen siger muuuh!". Tap the sun too. You can use your own recordings: set `RECORDINGS = true` in `games/bondegaard.js` and add `lyd/dyr/<id>.mp3`.
- **Badetid** 🛁: a muddy animal or vehicle in the tub. Rub it clean, with foam, bubbles and squeaks, and it says thank you. Then the next one gets muddy.
- **Farver** 🪣: drag balls into the bucket of the same colour, which is named as each ball drops in. A ball dropped in the wrong bucket bounces back; anywhere else is fine.
- **Ansigt** 😜: drag eyes, noses, hats, strawberries… onto a face. Every part is named as it lands, and you drag a part off the face to remove it. Tapping the face makes it giggle, and 🔄 gives a new face.
- **Ballon** 🎈: hold a finger down to blow up a balloon, with a rising sound. Let go and it floats away; hold too long and it pops with confetti. Tap a flying balloon to pop it.

## On the iPad
1. Open the site in **Safari**, then tap **Share → Add to Home Screen**.
2. Launch it from the Home Screen icon. It opens full-screen and keeps working **offline**.
3. To lock the iPad to the app, turn on **Settings → Accessibility → Guided Access**, then triple-click the top button inside the app.
4. Tap the 🏠 button in the top-left corner to go back to the menu.

**Updates:** push to `main` and GitHub Actions deploys the site. The next time the iPad opens the app with network, it downloads the new version in the background and switches to it. That happens on the home screen, never in the middle of a game. The version number appears at the bottom of the home screen.

## How offline works
`sw.js` is a service worker. At deploy time the workflow stamps it with the commit hash and a list of every file. When the hash changes, the browser installs the new worker, which precaches all files fresh and deletes the old cache. Locally the hash placeholder is left in, so the worker runs network-first and edits show up immediately.

## Developing
```
python3 -m http.server 8000      # then open http://localhost:8000
```
`?spil=former` (or `?spil=bobler`) opens a game directly.

## Adding a game
Create `games/<name>.js`:

```js
export default {
  id: 'name', title: 'Navn', icon: '🐘', color: '#8338ec',
  edge: '#ccbbff',   // bottom colour of the game's background; iOS paints it behind the home indicator
  start(root, kit) {
    // build the game inside `root` (a full-screen div)
    // kit: sfx.*, tone(), say(), burst(), bigBurst(), rand/pick/shuffle, COLORS
    return () => { /* stop: cancel timers/animation frames, remove window listeners */ };
  },
};
```

Then import it and add it to `GAMES` in `js/app.js`. Prefix any CSS class names with the game id. All sound is synthesized with Web Audio, and speech uses the iPad's Danish voice. For better quality, download it under Settings → Accessibility → Spoken Content → Voices → Dansk.

## Icons
`python3 tools/make_icons.py` regenerates `icons/`.
