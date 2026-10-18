# Final hackathon review — actual-device signoff

These are **manual release checks**, not claims of completed live-site testing.

## Judges' 90-second route

1. **0:00–0:12 — Meet Pip:** open the homepage and point out the visitor pass. Pip is a junior dream engineer at Midnight Nursery.
2. **0:12–0:30 — Lullaby Lab:** turn Sound on, tap three notes, replay your tune, then mute. No autoplay.
3. **0:30–0:43 — Lantern:** switch through sunset, lavender and midnight; refresh to show the locally saved mood.
4. **0:43–0:56 — Delivery:** choose the forest and a parcel of courage; show the envelope following its distinct SVG route.
5. **0:56–1:16 — Dream Maker:** select a feeling, destination and friend, generate a story, then save the PNG or copy the text.
6. **1:16–1:30 — Story and surprise:** show the three chapters, briefly play the toybox, and knock on the moon for a hidden Easter egg.

## Must-pass checks on the *published* website

- [ ] GitHub repo publicly accessible to an incognito visitor; source and asset credits included.
- [ ] GitHub Pages URL responds successfully and opens from a fresh private browser window.
- [ ] Inspect the network tab: no 404s for `index.html`, `styles.css`, `script.js`, `dream-maker.js`, or `assets/*.svg`.
- [ ] On real Android/iOS, test 320px/375px/430px widths and a tablet width; no horizontal overflow or clipped buttons.
- [ ] All visitor-pass links land on working sections; keyboard Tab/Enter and visible focus work, including Dream Maker radio fields and selectors.
- [ ] No accidental sound before enabling Sound. Mute stops playing audio. Replay and reset work.
- [ ] Change all three lantern moods, including contrast and refresh persistence where storage is allowed.
- [ ] Send dream packages on all three routes. In reduced-motion mode confirm delivery occurs without forced animation.
- [ ] Generate two different dreams; confirm Copy works and PNG export produces an actual image on the target device.
- [ ] Five dream-sorting rounds and moon Easter egg still work with keyboard and touch.
- [ ] Browser console: no uncaught errors. Test on both Chrome and one second browser if possible.
- [ ] Verify team names, links, AI/tool disclosure, character credit and submission copy are accurate.

## Important scope notes

The visitor pass is only a set of section links, **not** a tracked visitor identity or a hit counter. There is no guestbook, backend or live visitor data. Do not claim such bonus side quests. Public visibility and GitHub Pages settings must be changed by the repository owner; they cannot be activated from this site patch.
