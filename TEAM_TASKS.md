# Team-of-three — Phase 2 testing and launch

Use the same GitHub repository as the original V3 project. Create short feature branches and pull requests rather than uploading divergent ZIPs. No fabricated contributions or timestamps.

| Teammate | Ownership | Before merging |
| --- | --- | --- |
| A · Design and responsive UX | `index.html`, `styles.css`, SVG illustrations, screenshots | Check 320/375/430/768 widths; test contrast and touch targets |
| B · Web Audio and Lantern | relevant parts of `script.js` | Test mute during original/custom playback; 12-note cap; all mood selections; storage denied |
| C · Dream Maker and Delivery | `dream-maker.js`, SVG delivery/route code, `SUBMISSION.md` | Test 27 combinations, clipboard/manual copy, distinct SVG routes, keyboard and mobile |

**Everyone:** review the working site, test the old toybox, story, Pip interactions, Easter egg, and sign off on the public GitHub Pages URL before submission.

## Recommended pull requests

1. `feat/dream-maker` — form, generated cards and copy fallback.
2. `feat/invention-interactions` — melody composer, lantern, three delivery routes.
3. `fix/mobile-accessibility` — keyboard, responsive, reduced-motion and clean QA.
4. `docs/submission` — verified screenshots, README, credits and event submission.

The Phase 2 ZIP includes these changes as a starting point; your team's real updates should be made as reviewable commits.
