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
- **Badetid** 🛁: a whole bath in six steps, shown as a row of icons at the top. A muddy animal or vehicle waits by the tub: drag it in (or just tap it), pour water with the jug, squirt soap, scrub the mud off with the sponge, rinse the foam away with the shower, then rub it dry with the towel. Only one tool is out at a time, glowing and bouncing, and touching anywhere grabs it. Each step moves on by itself once it's done enough. At the end the animal says thank you and the next one arrives.
- **Farver** 🪣: drag balls into the bucket of the same colour, which is named as each ball drops in. A ball dropped in the wrong bucket bounces back; anywhere else is fine.
- **Ansigt** 😜: drag parts onto a face from five drawers (eyes, nose and ears, mouths, hats and hair, fun things), 60 in all. Every part is named as it lands; the drop zone reaches past the face's edge, ears flip to face the right way on either side, and you drag a part off to remove it. Tapping the face makes it giggle, and 🔄 gives a new face.
- **Fjæs** 🤪: a three-part flip book face (hair and eyes / nose and ears / mouth and chin). Swipe each strip sideways, tap a strip to spin it, or 🎲 to spin all three. 14 sets drawn in SVG (`games/art/fjaes-art.js`); a full set gets a fanfare.
- **Figurer** 🦸: the same for whole characters: head / body / legs from 16 sets such as king, robot, rollerskater, mermaid and dinosaur (`games/art/figur-art.js`). Tap the character to make it dance. Both flip books share `games/art/flipbog.js`.
- **Saml dyret** 🦒: put an SVG animal together. Drag its head, legs, tail and wings onto the dashed outlines; any leg fits any leg slot. When it's whole, it says its sound and walks off. Tap an animal in the row at the top to build that one; otherwise they come at random. Ten animals in `games/art/dyr-art.js`.
- **Tryllemaling** 🪄: a "paint with water" book with no voice, just chimes and sparkles. The main characters start as outlines, and brushing a finger brings out the colours plus hidden surprises with no outline. Page 1 (the farm) is hand-drawn SVG in `games/art/gaarden.js`; the sea, space and jungle pages are traced from emoji. ➡️ turns the page.
- **Instrumenter** 🥁: SVG characters (in `games/art/instrumenter-art.js`): a drum whose sticks strike, a swinging bell, maracas and a trumpet (hold to blow), plus a rainbow harp to strum.
- **Musikmaskine** 🎛️: pick one of eight songs (Solskin, Dino-dans, Godnat, Rumrejse, Regnvejr, Havet, Rock, Cirkus), then light up tiles. A playhead loops across them: the top rows are melody notes in the song's key, the bottom rows are drums, and a soft backing track plays underneath. Drag across tiles to paint them. 🧽 clears the grid and 🎵 goes back to the song list.
- **Ballon** 🎈: hold a finger down to blow up a balloon, with a rising sound. Let go and it floats away; hold too long and it pops with confetti. Tap a flying balloon to pop it.
- **Køkkenet** 🍳: three stations. Soup (drop ingredients in, stir in circles), pizza (toppings, into the oven, ding, eat it bite by bite) and cake (decorate, light candles, tap the flames to blow them out).
- **Madpakken** 🥪: fill the lunch box compartments, put the lid on, put it in the backpack and zip it up.
- **Butik** 🛒: take items off the shelves, scan them at the till with a beep, pay with big coins, and the bag flies home.
- **Dukkehuset** 🏠: a dollhouse cross-section with seven characters to drag about. Almost everything reacts: lamps, toilet, bath, fridge, oven, TV, radio, doorbell (visitors), day and night.
- **Klæd på** 🧥: dress a child for the weather in the window (sun, rain, snow, wind) from 24 clothes and toys. Each hand can hold something (ice cream, umbrella, kite, balloon, teddy, snowball). When dressed for it, the child goes out to play.
- **Tandbørstning** 🪥: toothpaste, brush away food and bacteria, rinse with a cup, and five animals get sparkling teeth.
- **Bilvask** 🚗: wash a muddy car, lorry, bus or tractor (sponge, hose, towel), change flat tyres, fill up with petrol, honk goodbye.
- **Tårnet** 🧱: stack blocks with real wobbly physics; 🚜 bulldozes the tower and 🧹 clears up.
- **Byggeplads** 🏗️: a digger loads sand into a truck, a crane builds a house floor by floor, and a cement mixer pours cement for hand prints.
- **Togbanen** 🚂: fill the gaps in the track, couple on wagons, let animals board, and tap the train for a lap round to the station.
- **Haven** 🌻: plant seeds, water them and tap the sun so they grow. Bees arrive, and you harvest into the basket.
- **Akvariet** 🐠: build fish from body, tail, colour, pattern and eyes, then drop them in the tank. Tap the water to feed them; crabs, octopus, turtle and whale join as friends.
- **Snekugle** ⛄: put figures into a snow globe and swipe to shake it. Themes are snow, glitter, hearts, stars and bubbles, and tapping the base winds a music box.
- **Lyd-zoo** 🦁: a long street to swipe along, past farm, pond, town, station, beach and zoo, with 41 things that make sounds when tapped.
- **Bogstaver** 🔤: the iPad version of Bogstavleg. A Danish keyboard on screen; the letter to find glows on it. 🔤 Find bogstavet (a random letter) or 🎵 ABC-sangen (A to Å in song order, ending with "28 skal der stå på min lærers storetå"). Uses our own recordings in `games/bogstav-lyd/` (copied from Bogstavleg's `lyd/`, letters only), with the iPad voice as a fallback.
- **Papirflyver** ✈️: fold a paper plane in six folds (tap, or drag the flap along), choosing from ten patterned sheets. Then flick it to throw (a hard upward flick loops) or just tap. It glides past stars, balloons and birds; tap the sky for a gust of wind. It lands, says something nice and flies back. Old planes wait in the hangar at the top; 📄 folds a new one.

## On the iPad
1. Open the site in **Safari**, then tap **Share → Add to Home Screen**.
2. Launch it from the Home Screen icon. It opens full-screen and keeps working **offline**.
3. To lock the iPad to the app, turn on **Settings → Accessibility → Guided Access**, then triple-click the top button inside the app.
4. Tap the 🏠 button in the top-left corner to go back to the menu.

**Updates:** push to `main` and GitHub Actions deploys the site. The next time the iPad opens the app with network, it downloads the new version in the background and switches to it. That happens on the home screen, never in the middle of a game. The version number appears at the bottom of the home screen.

## Grown-up info on the home screen
- **🔊 Test stemmen** speaks a test line and shows which voice is in use. If Safari exposes more than one Danish voice, a menu appears so you can choose.
- **The last line** shows screen size, window size and how many pixels were added at the bottom to work around the iPadOS 26 short-layout bug.

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
