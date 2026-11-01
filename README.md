# Legeplads

A small suite of touch games for a toddler, built as an offline-capable web app (PWA) for iPad.
It's plain HTML/CSS/JS with no build step and no dependencies.

## Games
- **Bobler** 🫧: bubbles float up and you tap to pop them; each size plays its own note. Tapping empty water blows a new bubble. Animal bubbles say the animal's name and throw confetti.
- **Former** 🔺: a shape sorter. Drag the smiling shapes into their holes, which snap in generously for small fingers. Each shape says its name, and finishing a round plays a fanfare and starts a new round.

## On the iPad
1. Open the site in **Safari**, then tap **Share → Add to Home Screen**.
2. Launch it from the Home Screen icon. It opens full-screen and keeps working **offline**.
3. To lock the iPad to the app, turn on **Settings → Accessibility → Guided Access**, then triple-click the top button inside the app.
4. To leave a game, **hold** the 🏠 button in the top-left corner for 1.5 s.

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
