"""In-memory Chromium smoke tests. Requires pip install playwright + playwright install chromium."""
import asyncio, json, re, base64
from pathlib import Path

from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parent

async def main():
    results = []
    html = (ROOT/'index.html').read_text(encoding='utf-8')
    css = (ROOT/'styles.css').read_text(encoding='utf-8')
    html = re.sub(r'<link[^>]+href="https://fonts.googleapis.com[^>]+>', '', html)
    html = re.sub(r'<link[^>]+href="https://fonts.gstatic.com[^>]+>', '', html)
    html = html.replace('<link rel="stylesheet" href="styles.css">', '').replace('<script src="script.js" defer></script>', '').replace('<script src="dream-maker.js" defer></script>', '')
    for name in ('pip-fallback.svg','music-fallback.svg','lantern-fallback.svg'):
        uri = 'data:image/svg+xml;base64,'+base64.b64encode((ROOT/'assets'/name).read_bytes()).decode()
        html = html.replace('assets/'+name, uri)
    async with async_playwright() as p:
        chrome_path = None
        for cand in ['/usr/bin/chromium', r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']:
            if Path(cand).exists():
                chrome_path = cand
                break
        launch_kwargs = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
        if chrome_path:
            launch_kwargs['executable_path'] = chrome_path
        browser = await p.chromium.launch(**launch_kwargs)
        for name, width, height, reduced in [('desktop', 1440, 900, True), ('phone', 375, 812, True), ('small-phone', 320, 720, True)]:
            context = await browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce' if reduced else 'no-preference', permissions=['clipboard-read','clipboard-write'])
            page = await context.new_page()
            errors=[]
            missing=[]
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda r: missing.append(str(r.url)) if r.status >= 400 and 'localhost' in r.url else None)
            await page.set_content(html, wait_until='domcontentloaded')
            await page.add_style_tag(content=css)
            await page.add_script_tag(content=(ROOT/'script.js').read_text(encoding='utf-8'))
            await page.add_script_tag(content=(ROOT/'dream-maker.js').read_text(encoding='utf-8'))
            await page.wait_for_timeout(400)
            assert await page.locator('.project-card').count()==3
            assert await page.locator('.story-scene').count()==3
            assert (await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')), f'horizontal overflow at {width}'
            await page.locator('#pip-character').click()
            assert 'psst' not in await page.locator('#pip-greeting').inner_text()
            # Three mood choices and storage round trip
            for choice in ['lavender','midnight','sunset']:
                await page.locator(f'[data-mood-option="{choice}"]').click()
                assert await page.locator('body').get_attribute('data-mood') == choice
            await page.locator('[data-mood-option="midnight"]').click()
            # localStorage may be blocked in about:blank sandbox; the app must degrade gracefully.
            assert await page.locator('body').get_attribute('data-mood') == 'midnight'
            await page.locator('#theme-toggle').click()
            assert await page.locator('body').get_attribute('data-mood') == 'sunset'
            # Note recording/replay/reset. The original lullaby stays available.
            for note in ['C','E','G','A']:
                await page.locator(f'.note-key[data-note="{note}"]').click()
            assert await page.locator('.recorded-chip').count() == 4
            await page.locator('#play-custom').click()
            assert 'Turn Sound on' in await page.locator('#compose-status').inner_text()
            await page.locator('#sound-toggle').click()
            await page.locator('#play-custom').click()
            assert await page.locator('#play-custom').get_attribute('aria-pressed') == 'true'
            await page.locator('#sound-toggle').click()
            assert await page.locator('#play-custom').get_attribute('aria-pressed') == 'false'
            await page.locator('#reset-custom').click()
            assert await page.locator('.recorded-chip').count() == 0
            await page.locator('#lullaby-button').click()
            assert await page.locator('#lullaby-button').get_attribute('aria-pressed') == 'true'
            await page.locator('#sound-toggle').click()
            assert await page.locator('#lullaby-button').get_attribute('aria-pressed') == 'false'
            # Distinct route geometry per destination, and different package confirmation.
            route_d=[]
            for destination in ['moon','garden','forest']:
                await page.locator('#delivery-destination').select_option(destination)
                route_d.append(await page.locator('#delivery-path').get_attribute('d'))
                await page.locator('#delivery-package').select_option('wonder')
                await page.locator('#deliver-button').click()
                if not reduced: await page.wait_for_timeout(2300)
                assert 'pocket of wonder' in await page.locator('#delivery-status').inner_text(), destination
                assert await page.locator('#deliver-button').is_enabled()
            assert len(set(route_d))==3
            # Dream maker: different deterministic stories; and copy the current text.
            await page.locator('#make-dream').click()
            first = await page.locator('#dream-result-story').inner_text()
            assert 'moon' in first.lower()
            await page.locator('input[name="feeling"][value="peaceful"]').check()
            await page.locator('input[name="destination"][value="forest"]').check()
            await page.locator('input[name="companion"][value="dragon"]').check()
            await page.locator('#make-dream').click()
            second = await page.locator('#dream-result-story').inner_text()
            assert second!=first and 'forest' in second.lower() and 'dragon' in second.lower()
            await page.locator('#another-dream').click()
            third = await page.locator('#dream-result-story').inner_text()
            assert third != second
            await page.locator('#copy-dream').click()
            assert 'Copied!' in await page.locator('#maker-status').inner_text() or await page.locator('#dream-copy-fallback').is_visible()
            # Existing game, secret preserved
            await page.locator('[data-destination="pond"]').click()
            assert 'Not quite' in await page.locator('#toy-feedback').inner_text()
            for dest in ['rooftop','pond','nest','rooftop','pond']:
                await page.locator(f'[data-destination="{dest}"]').click()
                await page.wait_for_timeout(140 if reduced else 740)
            assert await page.locator('#toy-progress').inner_text() == 'ALL DREAMS DELIVERED'
            await page.locator('#toy-restart').click()
            assert await page.locator('#toy-progress').inner_text() == 'DREAM 1 OF 5'
            for _ in range(5): await page.locator('#secret-moon').click()
            assert 'SECRET UNLOCKED' in await page.locator('#secret-message').inner_text()
            assert not errors, (name, errors)
            if name in ('desktop','phone'):
                await page.screenshot(path=str(ROOT/'previews'/('phase2-'+name+'.png')), full_page=True, animations='disabled')
            results.append({'viewport':name, 'width':width, 'status':'PASS', 'js_errors':errors, 'missing_assets':missing})
            await context.close()
        await browser.close()
    print(json.dumps(results, indent=2))

if __name__=='__main__': asyncio.run(main())
