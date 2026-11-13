// Robustness in real use: two windows at once, double taps, locking/closing right after typing,
// recovery code never confirmed, changing the passphrase, renewing the recovery code.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { launch, setupVault, unlock, openAllSections, root, browserName } from './serve.mjs';

const html = readFileSync(root + 'dist/index.html');
const PASS = 'Sonne Fahrrad Küche 7';
const browser = await launch();
let step = 0;
const ok = (n) => console.log(`ok ${++step} ${n}`);
const problems = [];

async function context() {
  const ctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 412, height: 915 } });
  await ctx.route('**/*', (r) => new URL(r.request().url()).origin === 'https://local' ? r.fulfill({ contentType: 'text/html', body: html }) : (problems.push('extern ' + r.request().url()), r.abort()));
  return ctx;
}
async function page(ctx) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  p.on('dialog', (d) => d.accept());
  await p.goto('https://local/');
  return p;
}
const field = (p, key) => p.locator(`[data-key="${key}"]`);
async function type(p, key, value) { const el = field(p, key); await el.evaluate((e) => { delete e.dataset.state; }); await el.fill(value); await el.press('Tab'); await p.waitForFunction((k) => document.querySelector(`[data-key="${k}"]`)?.dataset.state, key); }

// 1–2 two windows
{
  const ctx = await context();
  const a = await page(ctx);
  const code = await setupVault(a, PASS);
  const b = await page(ctx);
  await unlock(b, PASS);
  await type(a, 'person.vorname', 'Ida');
  await b.waitForFunction(() => document.querySelector('[data-key="person.vorname"]')?.value === 'Ida', null, { timeout: 10000 });
  ok('Änderung im Fenster A erscheint in Fenster B ohne Neuladen');

  // B is typing in a field while A saves something else: B's field is not disturbed
  const bOrt = field(b, 'person.geburtsort');
  await bOrt.focus(); await bOrt.pressSequentially('Muster');
  await type(a, 'person.nachname', 'Kaya');
  await b.waitForTimeout(400);
  assert.equal(await bOrt.inputValue(), 'Muster', 'Eingabe in B wurde überschrieben');
  await bOrt.pressSequentially('dorf'); await bOrt.press('Tab');
  await b.waitForFunction(() => document.querySelector('[data-key="person.nachname"]')?.value === 'Kaya', null, { timeout: 10000 });
  await a.waitForFunction(() => document.querySelector('[data-key="person.geburtsort"]')?.value === 'Musterdorf', null, { timeout: 10000 });
  const c = await page(ctx); await unlock(c, PASS);
  assert.deepEqual(await c.$$eval('[data-key^="person."]', (els) => Object.fromEntries(els.map((e) => [e.dataset.key, e.value])).valueOf()).then((v) => [v['person.vorname'], v['person.nachname'], v['person.geburtsort']]), ['Ida', 'Kaya', 'Musterdorf']);
  ok('Tippen in B wird nicht gestört; beide Fenster speichern, nichts geht verloren');
  await ctx.close();
  void code;
}

// 3 double taps
{
  const ctx = await context();
  const p = await page(ctx);
  await setupVault(p, PASS);
  await openAllSections(p);
  await p.locator('[data-adding="haushalt"]').click();
  await p.locator('[data-add="haushalt"]').first().dblclick();
  await p.locator('#f-haushalt-0-vorname').waitFor();
  await p.waitForTimeout(300);
  assert.equal(await p.locator('[data-remove="haushalt"]').count(), 1, 'Doppeltippen legte zwei Einträge an');
  for (let i = 1; i <= 2; i++) { await p.locator('[data-adding="haushalt"]').click(); await p.locator('[data-add="haushalt"]').nth(1).click(); await p.locator(`#f-haushalt-${i}-vorname`).waitFor(); }
  await type(p, 'haushalt[0].vorname', 'Erste'); await type(p, 'haushalt[1].vorname', 'Zweite'); await type(p, 'haushalt[2].vorname', 'Dritte');
  await p.locator('[data-remove="haushalt"][data-index="0"]').dblclick();
  await p.waitForTimeout(500);
  const names = await p.$$eval('[data-key$=".vorname"][data-key^="haushalt"]', (els) => els.map((e) => e.value));
  assert.deepEqual(names, ['Zweite', 'Dritte'], 'Doppeltippen auf Entfernen entfernte mehr als einen Eintrag: ' + names);
  ok('Doppeltippen auf Hinzufügen/Entfernen wirkt genau einmal');

  // 4 type and lock immediately (no Tab)
  await field(p, 'person.vorname').fill('Sofort');
  await p.locator('#lock').click();
  await p.locator('#p').waitFor();
  await unlock(p, PASS);
  assert.equal(await field(p, 'person.vorname').inputValue(), 'Sofort');
  ok('Tippen und sofort sperren: Eingabe ist gespeichert');

  // 5 type and close without leaving the field
  await field(p, 'person.nachname').fill('Ohneblur');
  await p.waitForTimeout(2200); // pause in typing → quiet save
  await p.reload();
  await unlock(p, PASS);
  assert.equal(await field(p, 'person.nachname').inputValue(), 'Ohneblur');
  ok('Tippen und App schließen ohne Feldwechsel: Eingabe ist gespeichert');

  // 7 change passphrase in the security section
  await p.locator('#chpass').click();
  await p.locator('#p1').fill('Ganz neue Passphrase'); await p.locator('#p2').fill('Ganz neue Passphrase');
  await p.locator('#go').click();
  await p.getByText('Die Passphrase wurde geändert.').waitFor({ timeout: 30000 });
  await p.locator('#lock').click();
  await p.locator('#p').fill(PASS); await p.locator('#go').click();
  await p.getByText('Die Passphrase stimmt nicht').waitFor({ timeout: 30000 });
  await p.locator('#p').fill('Ganz neue Passphrase'); await p.locator('#go').click();
  await p.locator('#mask details').first().waitFor({ timeout: 30000 });
  ok('Passphrase ändern: alte gilt nicht mehr, neue schon');

  // 8 renew recovery code from the security section
  await p.locator('#newcode').click();
  await p.locator('#code').waitFor();
  const code2 = (await p.locator('#code').textContent()).trim();
  await p.locator('#ok').check(); await p.locator('#last').fill(code2.slice(-4)); await p.locator('#done').click();
  await p.locator('#mask details').first().waitFor();
  await p.locator('#lock').click();
  await p.locator('#forgot').click();
  await p.locator('#code').fill(code2); await p.locator('#p1').fill('Wieder neue Phrase'); await p.locator('#p2').fill('Wieder neue Phrase');
  await p.locator('#go').click();
  await p.locator('#mask details').first().waitFor({ timeout: 30000 });
  assert.equal(await field(p, 'person.vorname').inputValue(), 'Sofort');
  ok('Neuer Wiederherstellungscode funktioniert');
  await ctx.close();
}

// 6 recovery code never confirmed (app closed on the code screen)
{
  const ctx = await context();
  const p = await page(ctx);
  await p.locator('#start').click();
  await p.locator('#p1').fill(PASS); await p.locator('#p2').fill(PASS); await p.locator('#go').click();
  await p.locator('#code').waitFor({ timeout: 30000 });
  const first = (await p.locator('#code').textContent()).trim();
  await p.reload(); // closed without confirming
  await p.locator('#p').fill(PASS); await p.locator('#go').click();
  await p.getByText('noch nicht bestätigt').waitFor({ timeout: 30000 });
  const second = (await p.locator('#code').textContent()).trim();
  assert.notEqual(second, first);
  await p.locator('#ok').check(); await p.locator('#last').fill(second.slice(-4)); await p.locator('#done').click();
  await p.locator('#mask details').first().waitFor();
  await p.locator('#lock').click();
  await p.locator('#forgot').click();
  await p.locator('#code').fill(first); await p.locator('#p1').fill('Egal egal 123'); await p.locator('#p2').fill('Egal egal 123'); await p.locator('#go').click();
  await p.getByText('Der Code stimmt nicht.').waitFor({ timeout: 30000 });
  ok('Code nicht bestätigt: beim nächsten Öffnen neuer Code, alter ungültig');
  await ctx.close();
}

await browser.close();
assert.deepEqual(problems, [], problems.join(' | '));
console.log(`\n${browserName}: alle ${step} Robustheitsprüfungen bestanden.`);
