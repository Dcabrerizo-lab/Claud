// Accessibility (axe-core, WCAG 2.1 A/AA + best practices) on every screen, in light/dark, normal/large text,
// German/English, plus layout at phone/tablet/desktop width (no horizontal scrolling) and keyboard-only setup.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { launch, openApp, setupVault, openAllSections, root, browserName } from './serve.mjs';

const axe = readFileSync(root + 'node_modules/axe-core/axe.min.js', 'utf8');
const browser = await launch();
let checks = 0;
const failures = [];

async function audit(page, label) {
  await page.locator('h1').first().waitFor();
  await page.evaluate(axe); // evaluate is not subject to the page CSP
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
  for (const v of r.violations) failures.push(`${label}: ${v.id} (${v.impact}) – ${v.help} – ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) failures.push(`${label}: seitliches Scrollen um ${overflow}px`);
  checks++;
}

const VARIANTS = [];
for (const scheme of ['light', 'dark']) for (const big of [false, true]) for (const lang of ['de', 'en']) for (const vp of [{ width: 320, height: 640 }, { width: 412, height: 915 }, { width: 1280, height: 800 }]) VARIANTS.push({ scheme, big, lang, vp });

for (const v of VARIANTS) {
  const label = `${v.scheme}/${v.big ? 'groß' : 'normal'}/${v.lang}/${v.vp.width}px`;
  const { ctx, page, problems, external } = await openApp(browser, { colorScheme: v.scheme, viewport: v.vp, locale: v.lang === 'de' ? 'de-DE' : 'en-GB' });
  if (v.big) { await page.locator('#big').click(); }
  await audit(page, label + ' Willkommen');
  await page.locator('#start').click();
  await audit(page, label + ' Passphrase');
  await page.locator('#p1').fill('kurz'); await page.locator('#go').click();
  await audit(page, label + ' Passphrase mit Fehler');
  await page.locator('#p1').fill('Sonne Fahrrad Küche 7'); await page.locator('#p2').fill('Sonne Fahrrad Küche 7'); await page.locator('#go').click();
  await page.locator('#code').waitFor({ timeout: 30000 });
  await audit(page, label + ' Code');
  const code = (await page.locator('#code').textContent()).trim();
  await page.locator('#ok').check(); await page.locator('#last').fill(code.slice(-4)); await page.locator('#done').click();
  await page.locator('#mask details').first().waitFor();
  await openAllSections(page);
  await page.locator('[data-adding="haushalt"]').click(); await page.locator('[data-add="haushalt"]').first().click();
  await page.locator('#f-haushalt-0-vorname').waitFor();
  await page.locator('[data-adding="einkommen"]').click(); await page.locator('[data-add="einkommen"]').first().click();
  await page.locator('#f-einkommen-0-brutto').waitFor();
  await openAllSections(page);
  const plz = page.locator('#f-adresse-plz'); await plz.fill('1'); await plz.press('Tab');
  await page.locator('#f-adresse-plz-e').filter({ hasText: /./ }).waitFor();
  await audit(page, label + ' Maske (alle Bereiche offen, mit Fehler)');
  await page.locator('#lock').click();
  await audit(page, label + ' Entsperren');
  await page.locator('#forgot').click();
  await audit(page, label + ' Passphrase vergessen');
  if (external.length) failures.push(`${label}: Netzaufrufe ${external.join(', ')}`);
  if (problems.length) failures.push(`${label}: Fehler ${problems.join(' | ')}`);
  await ctx.close();
}

// keyboard only: set up the vault without touching the mouse
{
  const { ctx, page } = await openApp(browser);
  const tabTo = async (sel, max = 15) => { for (let i = 0; i < max; i++) { await page.keyboard.press('Tab'); if (await page.evaluate((s) => document.activeElement?.matches(s), sel)) return; } throw new Error('Tastatur erreicht ' + sel + ' nicht'); };
  await tabTo('#start'); await page.keyboard.press('Enter');
  await tabTo('#p1'); await page.keyboard.type('Sonne Fahrrad Küche 7');
  await tabTo('#p2'); await page.keyboard.type('Sonne Fahrrad Küche 7'); await page.keyboard.press('Enter');
  await page.locator('#code').waitFor({ timeout: 30000 });
  const code = (await page.locator('#code').textContent()).trim();
  await tabTo('#ok'); await page.keyboard.press('Space');
  await tabTo('#last'); await page.keyboard.type(code.slice(-4));
  await tabTo('#done'); await page.keyboard.press('Enter');
  await page.locator('#mask details').first().waitFor();
  await tabTo('#mask summary'); await page.keyboard.press('Enter');
  checks++;
  await ctx.close();
}

await browser.close();
console.log(`${browserName}: ${checks} Prüfungen (${VARIANTS.length} Varianten × 7 Bildschirme + Tastatur)`);
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exit(1); }
console.log('Barrierefreiheit, Layout und Tastaturbedienung: keine Beanstandungen.');
