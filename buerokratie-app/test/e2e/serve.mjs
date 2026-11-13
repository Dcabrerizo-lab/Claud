// Shared test harness: serves the built single-file app on https://local/ (secure context, like the
// real deployment) and blocks + records every other request. BROWSER=chromium|firefox|webkit.
import * as pw from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const browserName = process.env.BROWSER ?? 'chromium';

export async function launch() { return pw[browserName].launch(); }

export async function openApp(browser, ctxOptions = {}) {
  const html = readFileSync(root + 'dist/index.html');
  const ctx = await browser.newContext({ locale: 'de-DE', ...ctxOptions });
  const external = [], problems = [];
  await ctx.route('**/*', (r) => {
    const u = new URL(r.request().url());
    if (u.origin === 'https://local' && u.pathname === '/') return r.fulfill({ contentType: 'text/html', body: html });
    external.push(u.href); return r.abort();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || /Content.Security.Policy/i.test(m.text())) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => d.accept());
  await page.goto('https://local/');
  return { ctx, page, external, problems };
}

/** Sets up a vault through the UI and lands on the master data form. */
export async function setupVault(page, pass = 'Sonne Fahrrad Küche 7') {
  await page.locator('#start').click();
  await page.locator('#p1').fill(pass);
  await page.locator('#p2').fill(pass);
  await page.locator('#go').click();
  await page.locator('#code').waitFor({ timeout: 30000 });
  const code = (await page.locator('#code').textContent()).trim();
  await page.locator('#ok').check();
  await page.locator('#last').fill(code.slice(-4));
  await page.locator('#done').click();
  await page.locator('#mask details').first().waitFor();
  return code;
}

export async function unlock(page, pass = 'Sonne Fahrrad Küche 7') {
  await page.locator('#p').fill(pass);
  await page.locator('#go').click();
  await page.locator('#mask details').first().waitFor({ timeout: 30000 });
}

export async function openAllSections(page) {
  await page.evaluate(() => document.querySelectorAll('details.section').forEach((d) => { d.open = true; d.dispatchEvent(new Event('toggle')); }));
}
