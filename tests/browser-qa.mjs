import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const results = [];
const failures = [];
const reportDir = resolve('qa-results');
mkdirSync(reportDir, { recursive: true });
const base = 'http://127.0.0.1:8765/pipdream/';
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], {
  cwd: resolve('..'), stdio: 'ignore'
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (name, condition, detail = '') => {
  const pass = Boolean(condition);
  results.push({ name, pass, detail });
  if (!pass) failures.push(name + (detail ? ': ' + detail : ''));
  process.stdout.write((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' :: ' + detail : '') + '\n');
};
async function pollServer() {
  for (let i = 0; i < 60; i++) {
    try { const resp = await fetch(base + 'index.html'); if (resp.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('Local static server never became ready');
}
const browser = await chromium.launch({ headless: true });
try {
  await pollServer();
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
    const errors = [];
    const missing = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url() + ' ' + response.status());
    });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.locator('#pip-image').waitFor();
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      noCoreImagesBroken: [...document.querySelectorAll('img.official-asset')].every(img => !!img.getAttribute('src')),
      passportPresent: !!document.querySelector('#passport'),
      makerPresent: !!document.querySelector('#dream-maker'),
      nav: getComputedStyle(document.querySelector('.nav-links')).display
    }));
    check('No horizontal page overflow @' + width, layout.scrollWidth <= width + 2, JSON.stringify(layout));
    check('Core sections present @' + width, layout.passportPresent && layout.makerPresent);
    check('No page JavaScript exceptions @' + width, errors.length === 0, errors.join('; '));
    check('No local HTTP 404 @' + width, missing.length === 0, missing.join('; '));
    if (width === 375 || width === 1440) {
      await page.screenshot({ path: resolve(reportDir, 'pip-' + width + '.png'), fullPage: true });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 375, height: 850 }, reducedMotion: 'reduce', acceptDownloads: true });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  check('Passport begins at 0/3', (await page.locator('#passport-progress').innerText()).includes('0 of 3'));
  check('Certificate initially hidden', await page.locator('#passport-award').isHidden());
  await page.locator('#sound-toggle').click();
  for (const note of ['C', 'D', 'E']) await page.locator('.note-key[data-note="' + note + '"]').click();
  await page.locator('#play-custom').click();
  await page.waitForFunction(() => document.querySelector('#passport-progress')?.textContent?.includes('1 of 3'), null, { timeout: 6000 });
  check('Completed 3-note lullaby stamps Passport', (await page.locator('#passport-progress').innerText()).includes('1 of 3'));
  const activeMood = await page.locator('body').getAttribute('data-mood');
  await page.locator('[data-mood-option="' + (activeMood === 'lavender' ? 'midnight' : 'lavender') + '"]').click();
  check('Lantern change earns second stamp', (await page.locator('#passport-progress').innerText()).includes('2 of 3'));
  await page.locator('#delivery-destination').selectOption('forest');
  await page.locator('#deliver-button').click();
  await page.waitForFunction(() => document.querySelector('#passport-progress')?.textContent?.includes('3 of 3'), null, { timeout: 4500 });
  check('Delivery completes third stamp', (await page.locator('#passport-progress').innerText()).includes('3 of 3'));
  check('Reward banner shown', await page.locator('#passport-reward-notice').isVisible());
  await page.locator('#passport-reward-link').click();
  check('Reward link focuses award', await page.evaluate(() => document.activeElement?.id === 'passport-award'));
  await page.locator('#passport-name').fill('QA Dreamer');
  const [certificate] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }),
    page.locator('#passport-save').click()
  ]);
  check('Certificate PNG downloadable', certificate.suggestedFilename().endsWith('.png'));
  await page.screenshot({ path: resolve(reportDir, 'passport-complete.png'), fullPage: true });
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#passport-reset').click();
  check('Passport can reset to 0', (await page.locator('#passport-progress').innerText()).includes('0 of 3'));

  // Keyboard shortcut should not intercept another focused control.
  const before = await page.locator('.recorded-chip').count();
  await page.locator('#theme-toggle').focus();
  await page.keyboard.press('C');
  check('Focused control blocks music shortcut', (await page.locator('.recorded-chip').count()) === before);

  await page.locator('#make-dream').click();
  check('Dream Maker generates result', await page.locator('#dream-result').isVisible());
  const [dreamPNG] = await Promise.all([
    page.waitForEvent('download', { timeout: 8000 }),
    page.locator('#save-dream-card').click()
  ]);
  check('Dream Maker PNG downloadable', dreamPNG.suggestedFilename().endsWith('.png'));
  await page.locator('#copy-dream').click();
  check('Dream Maker copy action produces status', ((await page.locator('#maker-status').innerText()).length > 8));
  check('No errors through full journey', errors.length === 0, errors.join('; '));
  await page.close();
} catch (error) {
  check('Browser test run completed', false, String(error.stack || error));
} finally {
  await browser.close();
  server.kill('SIGTERM');
  writeFileSync(resolve(reportDir, 'results.json'), JSON.stringify({
    checkedAt: new Date().toISOString(), commit: process.env.GITHUB_SHA || null,
    passed: results.filter(r => r.pass).length, total: results.length, failures, checks: results
  }, null, 2));
}
process.stdout.write('\n' + results.filter(r => r.pass).length + '/' + results.length + ' checks passed\n');
if (failures.length) process.exitCode = 1;
