// M3 in the browser: reminder, saving the backup file, restoring on a new device (passphrase or recovery code),
// replacing the data with two windows open, foreign and newer files.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launch, setupVault, unlock, openAllSections, root, browserName } from './serve.mjs';

const html = readFileSync(root + 'dist/index.html');
const dir = join(tmpdir(), 'tresor-backup-e2e-' + process.pid);
mkdirSync(dir, { recursive: true });
const PASS = 'Sonne Fahrrad Küche 7';
const browser = await launch();
const problems = [];
let step = 0;
const ok = (n) => console.log(`ok ${++step} ${n}`);

async function device() { // a fresh browser profile = a new device
  const ctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 412, height: 915 }, acceptDownloads: true });
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
async function allValues(p) { await openAllSections(p); return p.$$eval('[data-key]', (els) => Object.fromEntries(els.map((e) => [e.dataset.key, e.value]))); }
async function saveBackup(p) {
  const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('#backup-save').click()]);
  const file = join(dir, dl.suggestedFilename());
  await dl.saveAs(file);
  return file;
}

// 1–3 reminder and saving
const devA = await device();
const a = await page(devA);
const code = await setupVault(a, PASS);
assert.equal(await a.locator('#due').count(), 0, 'Erinnerung ohne Inhalt');
await type(a, 'person.vorname', 'Jürgen'); await type(a, 'person.nachname', 'Müller-Lüdenscheidt'); await type(a, 'person.geburtsdatum', '1.2.1985');
await openAllSections(a);
await a.locator('[data-adding="haushalt"]').click(); await a.locator('[data-add="haushalt"]').nth(1).click(); await a.locator('#f-haushalt-0-vorname').waitFor();
await type(a, 'haushalt[0].vorname', 'Lena'); await type(a, 'wohnen.kaltmiete', '512,50'); await type(a, 'bank.iban', 'DE02 1203 0000 0000 2020 51');
await a.locator('#due').getByText('noch keine Sicherung').waitFor(); // appears right after saving values
await a.locator('#lock').click(); await unlock(a, PASS);
await a.locator('#due').getByText('noch keine Sicherung').waitFor(); // and after opening again
ok('Erinnerung erscheint, sobald Angaben da sind und keine Sicherung existiert');

const file = await saveBackup(a);
assert.match(file, /Daten-Tresor-Sicherung-\d{4}-\d{2}-\d{2}\.json$/);
await a.locator('#notice').getByText('Die Sicherung wurde gespeichert').waitFor();
assert.equal(await a.locator('#due').count(), 0, 'Erinnerung nach dem Sichern noch da');
assert.match(await a.locator('#backup-last').textContent(), /Letzte Sicherung: \d{2}\.\d{2}\.\d{4}/);
const text = readFileSync(file, 'utf8');
assert.equal(JSON.parse(text).format, 'stammdaten-tresor-sicherung');
for (const plain of ['Jürgen', 'Müller', 'Lena', '512', 'DE02', 'vorname', PASS]) assert.ok(!text.includes(plain), 'Klartext in der Sicherung: ' + plain);
ok('Sicherung speichern: Datei heruntergeladen, Erinnerung weg, kein Klartext in der Datei');
const original = await allValues(a);

// 4 new device with passphrase
{
  const dev = await device();
  const p = await page(dev);
  await p.locator('#have-backup').click();
  await p.locator('#go').click();
  await p.getByText('Bitte wählen Sie zuerst die Sicherungsdatei aus.').waitFor();
  await p.setInputFiles('#file', file);
  await p.locator('#file-info').getByText(/Sicherung vom \d{2}\.\d{2}\.\d{4}/).waitFor();
  await p.locator('#p').fill('falsche Passphrase'); await p.locator('#go').click();
  await p.getByText('Die Passphrase passt nicht zu dieser Sicherung').waitFor({ timeout: 30000 });
  await p.locator('#p').fill(PASS); await p.locator('#go').click();
  await p.getByText('Die Sicherung wurde eingespielt.').waitFor({ timeout: 30000 });
  assert.deepEqual(await allValues(p), original);
  assert.equal(await p.locator('#due').count(), 0, 'nach dem Einspielen sollte keine Erinnerung kommen');
  await p.reload(); await unlock(p, PASS);
  assert.deepEqual(await allValues(p), original);
  ok('ABNAHME im Browser: neues Gerät, Sicherung eingespielt – alle Felder identisch, auch nach Neuladen');
  await dev.close();
}

// 5 new device with recovery code
{
  const dev = await device();
  const p = await page(dev);
  await p.locator('#have-backup').click();
  await p.setInputFiles('#file', file);
  await p.locator('#mode').click();
  await p.locator('#code').fill(code.toLowerCase());
  await p.locator('#p1').fill('Neue Phrase für hier'); await p.locator('#p2').fill('Neue Phrase für hier');
  await p.locator('#go').click();
  await p.getByText('Die Sicherung wurde eingespielt.').waitFor({ timeout: 30000 });
  assert.deepEqual(await allValues(p), original);
  await p.locator('#lock').click(); await unlock(p, 'Neue Phrase für hier');
  ok('Passphrase vergessen: mit Wiederherstellungscode eingespielt, neue Passphrase gilt');
  await dev.close();
}

// 6 replace with two windows open (device B has other data)
{
  const dev = await device();
  const b1 = await page(dev);
  await setupVault(b1, 'Andere Phrase 123');
  await type(b1, 'person.vorname', 'Ida');
  const b2 = await page(dev); await unlock(b2, 'Andere Phrase 123');
  await b1.locator('#backup-restore').click(); // confirm is accepted
  await b1.setInputFiles('#file', file);
  await b1.locator('#p').fill('Andere Phrase 123'); await b1.locator('#go').click(); // wrong: backup has the old passphrase
  await b1.getByText('Die Passphrase passt nicht zu dieser Sicherung').waitFor({ timeout: 30000 });
  await b1.locator('#back').click();
  assert.equal(await field(b1, 'person.vorname').inputValue(), 'Ida', 'nach falscher Passphrase muss der alte Tresor offen und unverändert sein');
  await b1.locator('#backup-restore').click();
  await b1.setInputFiles('#file', file);
  await b1.locator('#p').fill(PASS); await b1.locator('#go').click();
  await b1.getByText('Die Sicherung wurde eingespielt.').waitFor({ timeout: 30000 });
  assert.equal(await field(b1, 'person.vorname').inputValue(), 'Jürgen');
  await b2.getByText('In einem anderen Fenster wurde eine Sicherung eingespielt').waitFor({ timeout: 10000 });
  await unlock(b2, PASS);
  assert.deepEqual(await allValues(b2), original);
  ok('Ersetzen: falsche Passphrase lässt alles unverändert; danach ersetzt, zweites Fenster wird gesperrt und zeigt den neuen Stand');
  await dev.close();
}

// 7 foreign and newer files
{
  const dev = await device();
  const p = await page(dev);
  await p.locator('#have-backup').click();
  const foreign = join(dir, 'fremd.json'); writeFileSync(foreign, JSON.stringify({ hallo: 'welt' }));
  await p.setInputFiles('#file', foreign);
  await p.getByText('Das ist keine Sicherungsdatei dieser App.').waitFor();
  const newer = join(dir, 'neuer.json'); writeFileSync(newer, JSON.stringify({ ...JSON.parse(text), version: 2 }));
  await p.setInputFiles('#file', newer);
  await p.getByText('neueren Version der App').waitFor();
  const broken = join(dir, 'kaputt.json'); writeFileSync(broken, text.slice(0, text.length / 2));
  await p.setInputFiles('#file', broken);
  await p.getByText('Das ist keine Sicherungsdatei dieser App.').waitFor();
  ok('Fremde, neuere und abgeschnittene Dateien: verständliche Meldung');
  await dev.close();
}

await devA.close();
await browser.close();
assert.deepEqual(problems, [], problems.join(' | '));
console.log(`\n${browserName}: alle ${step} Sicherungsprüfungen bestanden.`);
