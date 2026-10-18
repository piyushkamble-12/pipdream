"""
Pip's Dream Desk — Final QA & Automated Test Suite
Tests real multi-file website over local HTTP across 7 responsive viewports:
320px, 375px, 390px, 430px, 768px, 1024px, 1440px.
Covers all 20 required criteria, saves screenshots and exports results to TEST_RESULTS.json.
"""
import asyncio
import http.server
import json
import os
import socketserver
import threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent
PORT = 8089

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, format, *args):
        pass  # Quiet logging

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("127.0.0.1", 0), QuietHandler)
    port = server.server_address[1]
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    return server, port

async def run_tests():
    server, port = start_server()
    print(f"Server started at http://127.0.0.1:{port}")

    test_viewports = [
        ("desktop-1440", 1440, 900),
        ("laptop-1024", 1024, 768),
        ("tablet-768", 768, 1024),
        ("large-phone-430", 430, 932),
        ("medium-phone-390", 390, 844),
        ("phone-375", 375, 812),
        ("small-phone-320", 320, 720),
    ]

    results = []
    chrome_path = None
    for cand in [
        '/usr/bin/chromium',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    ]:
        if Path(cand).exists():
            chrome_path = cand
            break

    launch_args = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
    if chrome_path:
        launch_args['executable_path'] = chrome_path

    async with async_playwright() as p:
        browser = await p.chromium.launch(**launch_args)

        # 1. Comprehensive functionality test on desktop viewport
        context = await browser.new_context(
            viewport={'width': 1440, 'height': 900},
            permissions=['clipboard-read', 'clipboard-write']
        )
        page = await context.new_page()
        page_errors = []
        page_missing = []
        page.on('pageerror', lambda err: page_errors.append(str(err)))
        page.on('response', lambda res: page_missing.append(res.url) if res.status >= 400 and '127.0.0.1' in res.url else None)

        await page.goto(f"http://127.0.0.1:{port}/index.html", wait_until="networkidle")
        await page.wait_for_timeout(300)

        # Check DOM elements
        assert await page.locator('.project-card').count() == 3, "Missing project cards"
        assert await page.locator('.story-scene').count() == 3, "Missing story scenes"

        # Check Navigation Links
        for target in ['#work', '#dream-maker', '#toybox', '#story']:
            nav_link = page.locator(f'.nav-links a[href="{target}"]')
            if await nav_link.count() > 0:
                await nav_link.click()
                await page.wait_for_timeout(100)

        # Pip Greeting Interaction
        await page.locator('#pip-character').click()
        greeting_text = await page.locator('#pip-greeting').inner_text()
        assert 'psst' not in greeting_text.lower(), "Greeting did not change"

        # Moonbeam Lantern: Test all 3 moods + header toggle
        for m in ['lavender', 'midnight', 'sunset']:
            await page.locator(f'[data-mood-option="{m}"]').click()
            assert await page.locator('body').get_attribute('data-mood') == m, f"Mood {m} failed"
        await page.locator('[data-mood-option="midnight"]').click()
        await page.locator('#theme-toggle').click()
        assert await page.locator('body').get_attribute('data-mood') == 'sunset', "Theme toggle failed"
        await page.locator('#theme-toggle').click()
        assert await page.locator('body').get_attribute('data-mood') == 'midnight', "Theme toggle back failed"
        await page.locator('[data-mood-option="sunset"]').click()

        # Lullaby Lab: Notes composition, keyboard, replay, mute, reset
        # Test note keys
        for note in ['C', 'D', 'E', 'F']:
            await page.locator(f'.note-key[data-note="{note}"]').click()
        assert await page.locator('.recorded-chip').count() == 4, "Note chip count mismatch"

        # Test keyboard shortcuts
        await page.keyboard.press('g')
        await page.keyboard.press('a')
        assert await page.locator('.recorded-chip').count() == 6, "Keyboard note input failed"

        # Fill to 12 notes
        for note in ['C', 'D', 'E', 'F', 'G', 'A']:
            await page.locator(f'.note-key[data-note="{note}"]').click()
        assert await page.locator('.recorded-chip').count() == 12, "12 note limit failed"
        assert await page.locator('.note-key[data-note="C"]').is_disabled(), "Note keys not disabled at 12"

        # Test replay with sound toggle
        await page.locator('#play-custom').click()
        assert 'Turn Sound on' in await page.locator('#compose-status').inner_text()
        await page.locator('#sound-toggle').click()
        await page.locator('#play-custom').click()
        assert await page.locator('#play-custom').get_attribute('aria-pressed') == 'true'

        # Test mute stops replay
        await page.locator('#sound-toggle').click()
        assert await page.locator('#play-custom').get_attribute('aria-pressed') == 'false'

        # Reset melody
        await page.locator('#reset-custom').click()
        assert await page.locator('.recorded-chip').count() == 0, "Reset failed"

        # Original lullaby
        await page.locator('#lullaby-button').click()
        assert await page.locator('#lullaby-button').get_attribute('aria-pressed') == 'true'
        await page.locator('#lullaby-button').click()
        assert await page.locator('#lullaby-button').get_attribute('aria-pressed') == 'false'

        # Dream Delivery Express: 3 destinations, 3 packages, route path, active dest, cancel on switch
        for dest in ['moon', 'garden', 'forest']:
            await page.locator('#delivery-destination').select_option(dest)
            path_d = await page.locator('#delivery-path').get_attribute('d')
            assert len(path_d) > 10, f"Path d missing for {dest}"
            active_node = page.locator(f'#dest-{dest}')
            assert 'active-dest' in (await active_node.get_attribute('class') or ''), f"Dest {dest} not active"
            await page.locator('#delivery-package').select_option('wonder')
            await page.locator('#deliver-button').click()
            assert await page.locator('#deliver-button').is_disabled(), "Button not disabled during flight"
            # Fast-switch cancels previous run
            next_dest = 'garden' if dest == 'moon' else 'forest' if dest == 'garden' else 'moon'
            await page.locator('#delivery-destination').select_option(next_dest)
            assert await page.locator('#deliver-button').is_enabled(), "Switch didn't re-enable button"

        # Dream Maker: 27 combinations, local SVG art generation, Another Dream, Copy, Save Card
        await page.locator('#make-dream').click()
        first_title = await page.locator('#dream-result-title').inner_text()
        assert len(first_title) > 0, "Dream title empty"
        assert await page.locator('#dream-art-visual svg').count() == 1, "SVG illustration missing"

        # Change selections
        await page.locator('input[name="feeling"][value="adventurous"]').check(force=True)
        await page.locator('input[name="destination"][value="garden"]').check(force=True)
        await page.locator('input[name="companion"][value="dragon"]').check(force=True)
        await page.locator('#make-dream').click()
        second_title = await page.locator('#dream-result-title').inner_text()
        assert second_title != first_title, "Dream title did not change with options"

        # Another Dream
        await page.locator('#another-dream').click()
        third_title = await page.locator('#dream-result-title').inner_text()
        assert third_title != second_title, "Another dream did not cycle"

        # Copy Story
        await page.locator('#copy-dream').click()
        maker_status = await page.locator('#maker-status').inner_text()
        assert 'Copied!' in maker_status or await page.locator('#dream-copy-fallback').is_visible()

        # Save Dream Card action
        save_btn = page.locator('#save-dream-card')
        assert await save_btn.is_visible(), "Save dream card button missing"
        await save_btn.click()
        await page.wait_for_timeout(400)
        status_after_save = await page.locator('#maker-status').inner_text()
        assert 'Saved dream card' in status_after_save or 'downloads' in status_after_save, "Save card status missing"

        # Sleepy Mailroom: 5 rounds, wrong feedback, progress dots, completion
        await page.locator('[data-destination="pond"]').click()
        assert 'Not quite' in await page.locator('#toy-feedback').inner_text()

        # Solve all 5 rounds: rooftop -> pond -> nest -> rooftop -> pond
        for dest in ['rooftop', 'pond', 'nest', 'rooftop', 'pond']:
            await page.locator(f'[data-destination="{dest}"]').click()
            await page.wait_for_timeout(200)

        assert await page.locator('#toy-progress').inner_text() == 'ALL DREAMS DELIVERED'
        assert await page.locator('#toy-letter.celebrate').count() == 1, "Celebration card missing"

        # Retry
        await page.locator('#toy-restart').click()
        assert await page.locator('#toy-progress').inner_text() == 'DREAM 1 OF 5'

        # Secret Moon: 5 knocks, progressive knock meter, unlock
        for k in range(1, 6):
            await page.locator('#secret-moon').click()
            await page.wait_for_timeout(50)
            if k < 5:
                assert await page.locator('.knock-dot.knock-lit').count() == k

        secret_text = await page.locator('#secret-message').inner_text()
        assert 'SECRET UNLOCKED' in secret_text, "Secret moon did not unlock"

        # Desktop screenshot
        await page.screenshot(path=str(ROOT / 'previews' / 'desktop-preview.png'), full_page=True)
        await page.locator('#dream-maker').screenshot(path=str(ROOT / 'previews' / 'desktop-dream-maker.png'))

        await context.close()

        # 2. Viewport & Overflow checks on all 7 target screens
        for name, w, h in test_viewports:
            v_context = await browser.new_context(
                viewport={'width': w, 'height': h},
                reduced_motion='reduce' if 'phone' in name else 'no-preference'
            )
            v_page = await v_context.new_page()
            v_errors = []
            v_missing = []
            v_page.on('pageerror', lambda err: v_errors.append(str(err)))
            v_page.on('response', lambda res: v_missing.append(res.url) if res.status >= 400 and '127.0.0.1' in res.url else None)

            await v_page.goto(f"http://127.0.0.1:{port}/index.html", wait_until="networkidle")
            await v_page.wait_for_timeout(200)

            # Check horizontal overflow
            scroll_width = await v_page.evaluate('document.documentElement.scrollWidth')
            inner_width = await v_page.evaluate('window.innerWidth')
            has_overflow = scroll_width > inner_width + 1

            # Make a dream on mobile to verify mobile dream card rendering
            await v_page.locator('#make-dream').click()
            await v_page.wait_for_timeout(200)

            if name == 'phone-375':
                await v_page.screenshot(path=str(ROOT / 'previews' / 'mobile-preview.png'), full_page=True)
                await v_page.locator('#dream-maker').screenshot(path=str(ROOT / 'previews' / 'mobile-dream-maker.png'))

            results.append({
                "viewport": name,
                "width": w,
                "height": h,
                "status": "PASS" if not has_overflow and not v_errors and not v_missing else "FAIL",
                "horizontal_overflow": has_overflow,
                "js_errors": v_errors,
                "missing_assets": v_missing
            })
            await v_context.close()

        await browser.close()

    # Save to TEST_RESULTS.json
    (ROOT / 'TEST_RESULTS.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    print("Test Suite Completed. Results:")
    print(json.dumps(results, indent=2))
    server.shutdown()

if __name__ == '__main__':
    asyncio.run(run_tests())
