# Phase 2 — Tests and Launch Checklist

## Automated Chromium checks performed in this workspace

The included offline `phase2-smoke-test.py` covers main interactions using an in-memory browser document and embedded SVG assets. It does **not** represent a deployed server test.

- [x] 1440px desktop — no horizontal overflow or uncaught JavaScript errors.
- [x] 375px phone — no horizontal overflow or uncaught JavaScript errors.
- [x] 320px small phone — no horizontal overflow or uncaught JavaScript errors.
- [x] 430px, 768px and 1024px — no horizontal overflow or uncaught JavaScript errors (separate responsive checks).
- [x] Three lantern selections and header switch.
- [x] Music keys, recording, custom replay/mute/reset, original lullaby/mute.
- [x] Three distinct route SVG `d` strings and confirmation messages (reduced-motion instant completion).
- [x] Dream Maker different input combinations, another dream, and clipboard/manual fallback.
- [x] Normal-motion flight completes, and changing the destination mid-flight cancels the old animation.
- [x] Storage writes tested with a stubbed localStorage object; persistence across actual browser reload still requires real-origin testing.
- [x] V3 Pip greeting, five-round toybox and hidden moon Easter egg.

## Final team QA — complete these yourself on deployed site

### Inventions and Dream Maker
- [ ] Turn Sound on, tap all six keys, replay a 12-note tune, stop it and reset it; verify every oscillator stops on mute.
- [ ] While Sound off, note keys should record silently and replay should ask to turn Sound on.
- [ ] Click original lullaby, stop, restart, and mute during playback.
- [ ] Select all three moods, refresh to verify localStorage when available, and test header toggle to sunset and back.
- [ ] Deliver each package to all three destinations; paths and messages must really change. Change destinations mid-flight and verify previous animation cancels.
- [ ] Try several Dream Maker choices; confirm title/story/scene change and the Another Dream button updates radio selection.
- [ ] Test clipboard copy on deployed HTTPS. If permission is denied, select manual-copy text.
- [ ] Finish original Sleepy Mailroom and restart; find secret moon using keyboard as well as pointer.

### Responsive, accessible and resilient
- [ ] Manually check at **320, 375, 430, 768, 1024 and 1440px** without sideways scrolling.
- [ ] Test physical Android and/or iPhone: radio options, buttons, native selects, audio, copy, layout.
- [ ] Keyboard-only: Tab/Shift+Tab, Enter/Space, radio arrow keys, selects, skip link and visual focus ring.
- [ ] Screen-reader spot-check: form legend/label, status announcements, SVG description, Dream Maker result focus.
- [ ] Enable OS reduced motion and verify delivery completes instantly, story remains readable, and sparkles/confetti stop.
- [ ] Test with localStorage denied/private mode; site should still work but mood/visitor welcome cannot persist.
- [ ] Browser dev tools: no 404 images/scripts, no uncaught JS errors; test 3rd-party font failure gracefully.
- [ ] Test normal animated route timing and retrigger after a route change.
- [ ] Lighthouse audit on deployed site if time allows; do not claim score without measurement.

### Publish and submit
- [ ] Root `index.html` present in public repo, with `script.js`, `dream-maker.js`, `styles.css`, and `assets/` committed.
- [ ] Open live GitHub Pages URL in incognito; confirm subpath-relative resources.
- [ ] Optional official PNG artwork committed to assets, or existing local SVG images verified.
- [ ] Correct project credits, truthful team info and disclosure in `SUBMISSION.md`.
- [ ] Public repository has actual hackathon-period commits, without invented timestamps.
- [ ] Check organizer's latest instructions for official bonus side quests; claim only implemented, verified ones.
- [ ] Submit live URL and public repo before deadline.
