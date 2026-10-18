# Pip's Dream Desk · Phase 2

An interactive character-portfolio website for **Baby's First Website 2026**, **Track 1 — Pip the Skull Baby**. It is an evolution of the existing V3 project, not a framework rewrite. Inspired by handmade personal websites: cozy cream and berry-pink colors, sleepy illustrations, and toys visitors can actually use.

**Technology:** semantic HTML, CSS, vanilla JavaScript, native SVG, Web Audio API, and browser storage. **No API keys, backend, frameworks, build steps, or production dependencies.** Publishes directly to GitHub Pages.

## Quick start on Windows

1. Extract the ZIP. Open the **`pips-dream-desk`** directory in VS Code.
2. Install the **Live Server** extension and right-click `index.html` → **Open with Live Server**. Alternatively, if Python is installed, run `python -m http.server 5500` in the same folder, then visit `http://localhost:5500/`.
3. Click Pip, experiment with the music box, switch lantern moods, send a package, make a dream, and find the moon's secret.
4. Do not upload the ZIP itself to GitHub Pages: upload the **contents of the folder**, with `index.html` at the repository root.

## Main features

| Interaction | What is implemented |
| --- | --- |
| **Lullaby Lab** | Original 13-tone Web Audio melody, plus six notes (C D E F G A) to create up to 12 note sequences; replay, stop, clear. Header sound is the single master control. |
| **Moonbeam Lantern** | Warm Sunset, Moonlit Lavender, Midnight Blue; changes global color palette and miniature lantern preview. Selection persists per browser where localStorage is available. Header Dream mode toggles to/from the last selected nighttime mood. |
| **Dream Delivery Express** | Select one of three destinations and one of three parcels; distinct animated SVG geometry for Moon Nursery, Cloud Garden, Starlit Forest; tailored delivery confirmation. Animation finishes immediately when reduced motion is requested. |
| **Build a Little Dream** | Select one of three feelings, destinations, and companions; 27 reproducible story combinations; decorated result card, Pip's handwritten message, Another Dream, Copy Story. Everything generated locally without an AI API. |
| **Sleepy Mailroom** | Original five-part game from V3 with clues and keyboard/touch controls, score, retry, and completion. |
| **Storybook** | Three origin-story chapters revealed through scrolling; never inaccessible when motion is reduced or JavaScript is disabled. |
| **Pip & extras** | Clickable Pip greeting, keyboard-accessible five-knock moon Easter egg, optional fine-pointer sparkle trail, local browser welcome-back greeting. |

**Sound rules:** Audio never autoplays. Sound is off on the first visit and the original lullaby will ask visitors to turn on the global sound switch before playback. The note keys can still record quietly when muted, but replay requires sound on. Muting stops audio. No microphone permission or recorded audio is used.

**Saving a dream:** Choose **Save Dream Card** to export a high-resolution PNG directly in your browser using Canvas. The Copy button uses the Clipboard API in secure contexts; if blocked, a selectable text field appears for manual copying. Export and story generation are entirely local; no account or backend is needed.

## Assets and offline reliability

The site **ships with its existing local SVG fallback illustrations** and favicon in `assets/`, so all essential character images work offline and on GitHub Pages. The official PNG character art is optional but recommended and **is not bundled** in this archive.

To fetch the official images on a Windows machine that has internet access, from the project folder run:

```powershell
powershell -ExecutionPolicy Bypass -File .\fetch-official-assets.ps1
```

This script downloads the three images from the [official asset host](https://hax.baby/baby/assets/) into `assets/`, then changes only HTML `src` attributes (not `data-fallback` attributes), keeping local SVG fallbacks in case an image fails. Commit these downloaded images with the site. If the host is unavailable, the supplied SVG illustrations are sufficient for the site's functionality.

## Static deployment via GitHub Pages

1. Create a **public** empty GitHub repository.
2. From the extracted project directory:

   ```powershell
   git init
   git add .
   git commit -m "feat: improve Pip's Dream Desk interactions"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

   If updating an existing repository, create a feature branch and a pull request instead of reinitializing Git.
3. In **Settings → Pages** choose **Deploy from a branch → `main` → `/ (root)`**.
4. Visit `https://YOUR-USERNAME.github.io/YOUR-REPO/` and test in a private browsing window and on an actual phone.
5. Replace team placeholders in `SUBMISSION.md` and complete `TEST_CHECKLIST.md`. Do **not** fabricate commits, visitor counts, or points.

## File map

```text
pips-dream-desk/
├─ index.html               # existing hero, inventions, story, toybox + Dream Maker
├─ styles.css               # V3 design system plus Phase 2 design tokens/components
├─ script.js                # V3 interactions plus upgraded notes / moods / routes
├─ dream-maker.js           # independent local story composer + clipboard fallback
├─ assets/                  # bundled SVGs, optional official PNGs
├─ fetch-official-assets.ps1
├─ previews/                # illustrative screenshots
├─ phase2-smoke-test.py     # optional in-memory browser tests (Playwright)
├─ TEST_CHECKLIST.md
├─ SUBMISSION.md
├─ DEMO_SCRIPT.md
├─ TEAM_TASKS.md
└─ CHANGELOG.md
```

## Test and accessibility notes

The interactive controls use buttons, native selects, and labeled radio groups. Statuses are exposed with `role="status"` or polite announcements. The site respects `prefers-reduced-motion` for story reveals, cursor effects, confetti, and flight animations. HTML keyboard focus styles are visible. Audio oscillators and flight animation frames are canceled on interruption or page exit.

An optional Playwright Chromium smoke-test script is included. If you want to run it, install Playwright with `python -m pip install playwright` and `python -m playwright install chromium`, then run `python phase2-smoke-test.py` from the project folder. It runs offline using in-memory HTML and embedded SVGs; it does not assert that a remote deployed URL is live. The tested widths and results are recorded in `TEST_CHECKLIST.md`.

**Manual QA still matters:** test the website on at least one real Android/iPhone and a keyboard, especially Web Audio and clipboard permission behavior. Don't claim Lighthouse 90+ without running a Lighthouse audit on the deployed site.

## Data/privacy and side-quest honesty

There is **no** shared guestbook, global visitor counter, remote AI generation, account system, database, analytics, or tracking cookies. The returning visitor line and lantern mood use only the individual browser's storage; if storage fails the site still works. The toybox and cursor sparkles are interactive website features; **the team must check the organizers' exact side-quest rules before claiming bonus points**.

## Credits

- Pip's original character and canonical world: [haX.baby — Track 1](https://hax.baby/baby-problem).
- Official character PNGs, if downloaded: [haX.baby creator asset pack](https://hax.baby/baby/assets/).
- Starter SVG illustration assets and website implementation: project team (include truthful attribution and AI disclosure where required).
- Typography uses DM Sans, DM Serif Display, and Fredoka from Google Fonts, with local system fallbacks.
- All melodic notes are synthesized by Web Audio; no third-party music recordings are bundled.

**Team:** Fill in your real names and GitHub details before submission. Hackathon entry rules, dates, and side-quest verification should be checked in your event workspace.
