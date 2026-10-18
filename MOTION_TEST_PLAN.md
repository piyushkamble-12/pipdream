# Living Motion QA — interactive polish

This is a **visual-only** progressive enhancement. Tests below must pass before merging.

## Cross-browser and device smoke tests

1. Open at 320, 375, 430, 768 and 1440px. No unexpected horizontal scroll or obscured controls.
2. Hero: Pip floats subtly; star movement follows nearby pointer movement only with a precise mouse/trackpad. No text or buttons drift.
3. Music keys: click/tap notes several times. Tiny musical symbols rise, vanish within ~1s, and never block the buttons. Global mute remains authoritative.
4. Lantern: switch moods and verify the original global color palette, text contrast and saved setting still work.
5. Dream Maker: change ingredient options and build a dream. Decorative reveal appears and existing copy/PNG save actions remain reliable.
6. Passport (after merging PR #3): earn each stamp and see a short bounce. Each stamp counts exactly once; certificate still exports correctly.
7. Keyboard: use Tab, Enter, Space, radio navigation. All features remain usable without hover or pointer effects.
8. Set OS/browser **Reduce motion** and reload. No float, twinkle, note-motes, reveal, lantern bounce or stamp animation. Native interactions stay available.
9. In the devtools console/network tab, verify no JS exceptions, 404s or accumulating elements after clicking notes repeatedly.
10. Confirm actual published URL and real phone behavior, not only local browser simulation.

**No new dependencies, accounts, tracking, external APIs, guestbook or visitor counts.**

## Merge order

PR #3 'feature/interactive-dream-passport' and this motion PR were developed independently from the same base. Merge #3 first, then update/merge this PR if GitHub reports no conflicts. The standalone motion scripts do not require passport features to load; stamp-specific polish activates only when the Passport exists.


## Custom cursor checks (all three lighting moods)

1. Desktop with a mouse or trackpad: ordinary page shows a tiny themed arrow with star accent.
2. Links, buttons, radio labels and selects have a clearly clickable variant with a larger star.
3. Warm Sunset uses berry pink, Moonlit Lavender uses soft lavender, Midnight Blue uses pale blue; switching moods changes cursors automatically.
4. Text fields (especially certificate name), textarea fallbacks and disabled controls retain native text/not-allowed cursors.
5. Browser without SVG cursor support still has normal pointer/arrow fallbacks, and all click targets still work.
6. Touch-only device retains the usual touch behavior; no forced mouse overlay.
7. When forced/high-contrast accessibility modes are enabled, native cursors take precedence.
8. Confirm GitHub Pages publishes all six SVG files with correct relative paths (no 404s).
9. Double-check that the pre-existing sparkle trail and reduced-motion opt-out remain intact.
