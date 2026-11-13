// End-to-end test of the built single-file app (dist/index.html) in Chromium, phone-sized.
// Network: only the app file itself is served; every other request is blocked and fails the test.
import * as pw from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const html = readFileSync(root + 'dist/index.html');
const shots = root + 'docs/img/';
mkdirSync(shots, { recursive: true });
const SHOT = process.env.SHOTS === '1';

const browserName = process.env.BROWSER ?? 'chromium';
const browser = await pw[browserName].launch();
// phone emulation (touch, mobile viewport) where the engine supports it; Firefox has no mobile mode
const phone = browserName === 'firefox' ? { viewport: { width: 412, height: 915 } } : pw.devices['Pixel 7'];
const ctx = await browser.newContext({ ...phone, locale: 'de-DE' });
const external = [], problems = [];
await ctx.route('**/*', (r) => {
  const u = new URL(r.request().url());
  if (u.origin === 'https://local' && u.pathname === '/') return r.fulfill({ contentType: 'text/html', body: html });
  external.push(u.href); return r.abort();
});
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problems.push(m.text()); });
page.on('pageerror', (e) => problems.push(String(e)));
page.on('dialog', (d) => d.accept());
let step = 0;
const ok = (name) => console.log(`ok ${++step} ${name}`);
const shot = async (n) => { if (SHOT) await page.screenshot({ path: shots + `m1-${n}.png` }); };

const PASS = 'Sonne Fahrrad Küche 7';
await page.goto('https://local/');

// 1 welcome → setup
await page.getByRole('heading', { name: 'Willkommen' }).waitFor();
await shot('1-willkommen');
await page.getByRole('button', { name: 'Tresor einrichten' }).click();
ok('Willkommen → Einrichten');

// 2 passphrase rules
await page.getByLabel('Passphrase', { exact: true }).fill('kurz');
await page.getByRole('button', { name: 'Weiter' }).click();
await page.getByRole('alert').filter({ hasText: 'mindestens 8' }).waitFor();
await page.getByLabel('Passphrase', { exact: true }).fill(PASS);
await page.getByLabel('Passphrase wiederholen').fill(PASS + 'x');
await page.getByRole('button', { name: 'Weiter' }).click();
await page.getByText('nicht gleich').waitFor();
await page.getByLabel('Passphrase wiederholen').fill(PASS);
await shot('2-passphrase');
await page.getByRole('button', { name: 'Weiter' }).click();
ok('Passphrase: zu kurz und ungleich werden abgelehnt');

// 3 recovery code must be confirmed
await page.getByRole('heading', { name: 'Ihr Wiederherstellungscode' }).waitFor({ timeout: 20000 });
const code = (await page.locator('#code').textContent()).trim();
assert.match(code, /^([2-9A-HJKMNP-Z]{4}-){4}[2-9A-HJKMNP-Z]{4}$/);
await shot('3-code');
const done = page.getByRole('button', { name: 'Fertig' });
assert.equal(await done.isDisabled(), true);
await page.getByLabel('Ich habe den Code aufgeschrieben.').check();
await page.getByLabel('Zur Kontrolle: die letzten 4 Zeichen').fill('ZZZZ' === code.slice(-4) ? 'YYYY' : 'ZZZZ');
await done.click();
await page.getByText('Das passt nicht').waitFor();
await page.getByLabel('Zur Kontrolle: die letzten 4 Zeichen').fill(code.slice(-4).toLowerCase());
await done.click();
ok('Wiederherstellungscode: Bestätigung nötig');

// 4 master data
await page.getByRole('heading', { name: 'Daten-Tresor', level: 1 }).waitFor();
await page.getByLabel('Vorname(n)').first().fill('Jürgen');
await page.getByLabel('Familienname').first().fill('Müller-Lüdenscheidt');
const geb = page.getByLabel('Geburtsdatum').first();
await geb.fill('1.2.1985'); await geb.press('Tab');
await page.waitForFunction(() => document.getElementById('f-person-geburtsdatum').value === '01.02.1985');
await page.getByLabel('Familienstand').selectOption('verheiratet');
await page.getByText('Anschrift').click();
const plz = page.getByLabel('Postleitzahl');
await plz.fill('123'); await plz.press('Tab');
await page.getByText('Die Postleitzahl hat 5 Ziffern.').waitFor();
assert.equal(await plz.getAttribute('aria-invalid'), 'true');
await plz.fill('12345'); await plz.press('Tab');
await page.waitForFunction(() => !document.getElementById('f-adresse-plz').hasAttribute('aria-invalid'));
await page.getByLabel('Straße', { exact: true }).fill('Hauptstraße');
await page.getByLabel('Wohnort').fill('Musterstadt');
await page.getByLabel('Wohnort').press('Tab');
ok('Stammdaten: speichern, Datum normalisiert, Fehler bei PLZ verständlich');

// 5 household list
await page.getByText('Weitere Personen im Haushalt').click();
await page.getByRole('button', { name: '+ Person hinzufügen' }).click();
await page.getByRole('button', { name: 'Kind' }).click();
await page.locator('#f-haushalt-0-vorname').fill('Lena');
await page.locator('#f-haushalt-0-vorname').press('Tab');
await page.locator('#f-haushalt-0-geburtsdatum').fill('15.06.2015');
await page.locator('#f-haushalt-0-geburtsdatum').press('Tab');
await page.getByText('Wohnung').first().click();
await page.getByLabel('Kaltmiete im Monat').fill('512,50');
await page.getByLabel('Kaltmiete im Monat').press('Tab');
await page.waitForFunction(() => document.getElementById('f-wohnen-kaltmiete').value === '512,50');
await shot('4-maske');
ok('Haushalt: Kind hinzugefügt; Betrag gespeichert');

// 6 storage contains no plain data
const raw = await page.evaluate(() => new Promise((res, rej) => {
  const r = indexedDB.open('stammdaten-tresor');
  r.onsuccess = () => { const tx = r.result.transaction('records'); const g = tx.objectStore('records').getAll(); g.onsuccess = () => res(JSON.stringify(g.result)); };
  r.onerror = () => rej(r.error);
}));
for (const s of ['Jürgen', 'J\\u00fcrgen', 'Müller', 'Lena', 'Hauptstraße', 'Musterstadt', '12345', '1985', '512', 'vorname', PASS]) assert.ok(!raw.includes(s), 'Klartext im Speicher: ' + s);
const ls = await page.evaluate(() => JSON.stringify(localStorage));
assert.ok(!/Jürgen|Müller|12345/.test(ls), 'Klartext in localStorage');
ok('ABNAHME: Speicher enthält keinen Klartext (IndexedDB, localStorage)');

// 7 reload → locked; wrong passphrase; unlock
await page.reload();
await page.getByRole('heading', { name: 'Tresor öffnen' }).waitFor();
await page.getByLabel('Passphrase', { exact: true }).fill('falsch falsch');
await page.getByRole('button', { name: 'Öffnen' }).click();
await page.getByText('Die Passphrase stimmt nicht').waitFor({ timeout: 20000 });
await shot('5-entsperren');
await page.getByLabel('Passphrase', { exact: true }).fill(PASS);
await page.getByRole('button', { name: 'Öffnen' }).click();
await page.locator('#f-person-vorname').waitFor({ timeout: 20000 });
assert.equal(await page.locator('#f-person-vorname').inputValue(), 'Jürgen');
await page.getByText('Weitere Personen im Haushalt').click();
assert.equal(await page.locator('#f-haushalt-0-vorname').inputValue(), 'Lena');
ok('Neu laden: gesperrt; falsche Passphrase klar gemeldet; Daten nach Entsperren da');

// 8 lock button
await page.getByRole('button', { name: /Sperren/ }).click();
await page.getByText('Tresor gesperrt.').waitFor();
ok('Sperren-Knopf');

// 9 forgot passphrase → recovery code
await page.getByRole('button', { name: 'Passphrase vergessen?' }).click();
await page.getByLabel('Wiederherstellungscode').fill(code.replace(/-/g, ' ').toLowerCase());
await page.getByLabel('Neue Passphrase').fill('Neue Passphrase 2026');
await page.getByLabel('Passphrase wiederholen').fill('Neue Passphrase 2026');
await page.getByRole('button', { name: 'Öffnen und Passphrase ändern' }).click();
await page.locator('#f-person-vorname').waitFor({ timeout: 20000 });
assert.equal(await page.locator('#f-person-vorname').inputValue(), 'Jürgen');
ok('Passphrase vergessen: mit Code geöffnet, neue Passphrase gesetzt');

// 10 language + large text
await page.locator('#lang').selectOption('en');
await page.getByRole('heading', { name: 'Data Vault', level: 1 }).waitFor();
await page.getByLabel('First name(s)').first().waitFor();
await page.getByRole('button', { name: 'Large text' }).click();
assert.ok(await page.locator('#app.big').count());
await page.locator('#lang').selectOption('de');
ok('Sprache wechseln, große Schrift');

// 11 every form control has a label
const unlabeled = await page.evaluate(() => [...document.querySelectorAll('input, select')].filter((el) => !el.labels?.length && !el.getAttribute('aria-label')).map((el) => el.id));
assert.deepEqual(unlabeled, []);
ok('Alle Eingabefelder haben eine Beschriftung');

await browser.close();
assert.deepEqual(external, [], 'Netzaufrufe nach außen: ' + external.join(', '));
assert.deepEqual(problems, [], 'Fehler/CSP-Verstöße: ' + problems.join(' | '));
ok('ABNAHME: kein Netzaufruf nach außen, keine Fehler, keine CSP-Verstöße');
console.log(`\n${browserName}: alle ${step} Schritte bestanden.`);
