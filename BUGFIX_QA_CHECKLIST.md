# Final bug-fix regression plan

Changes are intentionally scoped to handoff UX, keyboard behavior, motion preferences and Passport reset. This file is not evidence that live-site testing has already passed.

## Passport handoff (critical)
1. Start with empty local Passport storage.
2. Earn the music stamp (3+ notes, playback completes) and lantern stamp (change the mood).
3. Scroll to delivery, send a parcel and wait for delivery confirmation.
4. **Expected:** 3/3, the certificate unlocks above, and a dismissible notice appears in the current viewport. No forced scroll and no focus stolen.
5. Click **View my reward** (also using Tab/Enter): notice disappears, focus reaches the certificate, and the certificate is scrolled into view.
6. Repeat on a narrow phone, including 320px. The notice must remain within the viewport and not block interactions when dismissed.
7. Reload with completed local storage: certificate remains unlocked; stale notice does not reappear automatically.

## Reset behavior
8. Enter a test name and trigger award download. Reset Passport and choose Cancel: all progress and the name remain.
9. Confirm Reset: 0/3 stamps, no award/notice, optional name cleared back to Little Dreamer, previous export status cleared.
10. Earn stamps again; no duplicate stamp counts or unexpected focus changes.

## Keyboard controls
11. Focus a navigation link, Passport link, ordinary button, disabled button, radio choice or certificate-name field; press C, D, E, etc. The music-box note count must not increase.
12. Focus the document body and press C/D/E: keyboard shortcuts should still add notes when the page itself has focus.
13. Test Ctrl/Cmd/Alt+letters and key autorepeat: should not create unintended notes.
14. Check Tab focus visibility in all three lantern moods.

## Reduced motion
15. Mobile Dream Maker: with reduced motion enabled, submitting a dream should scroll to the result without smooth animation.
16. Start with normal motion, then toggle reduced motion mid-session. New pointer sparkles and hero tilt should stop. Re-enable motion and confirm no exception.
17. Reduced-motion users must still be able to complete delivery, earn stamps and export PNGs.

## Deployment / no regression
18. Test at 320, 375, 430, 768, 1024, 1440px: no horizontal overflow, broken SVG assets, console errors or dead controls.
19. Re-test all three invention interactions, Sleepy Mailroom, moon Easter egg, Dream Maker copy/PNG, Passport certificate PNG and reset.
20. Verify publicly deployed GitHub Pages URL and public repo from a private window. Update truthful team names, actual working URLs, and credits in SUBMISSION.md before sending to judges.

When everything above passes, **freeze all features** and submit.
