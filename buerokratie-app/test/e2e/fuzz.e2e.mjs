// Randomised UI test: many sessions fill every field of the master data form with valid, invalid and
// hostile input, add and remove household entries, then reload and unlock. Afterwards every field must
// show exactly what was accepted before – nothing lost, nothing invented, no script injection.
// SESSIONS=n (default 20), SEED=n for reproduction.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { launch, openApp, setupVault, unlock, openAllSections, root, browserName } from './serve.mjs';

const catalog = JSON.parse(readFileSync(root + 'data/feldkatalog.json', 'utf8'));
const typeOf = (key) => catalog.felder.find((f) => f.key === key.replace(/\[\d+\]/, '[]'))?.typ;
const SESSIONS = Number(process.env.SESSIONS ?? 20);
let seed = Number(process.env.SEED ?? 20261113);
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

const NAMES = ['Müller', 'Ayşe Yılmaz', 'Łucja Wójcik', "N'Golo", 'Ștefan', 'Олена', 'محمد', '  viele   Leerzeichen  ', 'x'.repeat(200), 'x'.repeat(201),
  '<img src=x onerror="alert(1)">', '"><script>alert(2)</script>', "'; DROP TABLE x; --", '😀 Emoji', '‮RTL-Trick', 'A&B <C>', ''];
const POOLS = {
  text: NAMES, name: NAMES,
  datum: ['1.2.1985', '01.02.1985', '29.02.2020', '29.02.2021', '31.04.2000', '2000-01-01', '1.1.85', 'gestern', ''],
  betrag: ['512,50', '1.234,56', '1 234,56', '0', '12', '-5', 'abc', '1,234', '10.000.000,01', '99,999', ''],
  zahl: ['54', '54,5', '0', '100', '101', '-1', 'viel', ''],
  plz: ['12345', '90542', '1234', 'abcde', '123456', ''],
  iban: ['DE02 1203 0000 0000 2020 51', 'de89370400440532013000', 'DE02120300000000202052', 'DE00', ''],
  email: ['a@b.de', 'max.muster@beispiel.org', 'keine-mail', 'a@b', ''],
  telefon: ['+49 9126 123456', '0911/123456', '12', 'abc', ''],
};

const browser = await launch();
let fieldOps = 0, accepted = 0, rejected = 0;
const dialogs = [];

for (let s = 0; s < SESSIONS; s++) {
  const { ctx, page, external, problems } = await openApp(browser, { viewport: { width: 412, height: 915 } });
  page.removeAllListeners('dialog');
  page.on('dialog', (d) => { dialogs.push(d.type()); d.accept(); });
  await setupVault(page);
  await openAllSections(page);

  // random list entries
  for (const [group, n] of [['haushalt', Math.floor(rnd() * 4)], ['einkommen', Math.floor(rnd() * 3)]]) {
    for (let i = 0; i < n; i++) {
      await page.locator(`[data-adding="${group}"]`).click();
      const choices = page.locator(`[data-add="${group}"]`);
      await choices.nth(Math.floor(rnd() * await choices.count())).click();
      await page.locator(`#f-${group}-${i}-${group === 'haushalt' ? 'vorname' : 'brutto'}`).waitFor();
    }
  }
  await openAllSections(page);

  // fill every field; expected = last accepted (normalised) display value
  const expected = {};
  const keys = await page.$$eval('[data-key]', (els) => els.map((e) => e.dataset.key));
  for (const key of keys) {
    const el = page.locator(`[data-key="${key}"]`);
    const tag = await el.evaluate((e) => e.tagName);
    const before = await el.inputValue();
    expected[key] ??= before;
    if (rnd() < 0.15) continue; // leave some untouched
    await el.evaluate((e) => { delete e.dataset.state; });
    if (tag === 'SELECT') {
      const opts = await el.evaluate((e) => [...e.options].map((o) => o.value));
      const v = pick(opts);
      if (v === before) continue;
      await el.selectOption(v);
    } else {
      const v = pick(POOLS[typeOf(key)] ?? NAMES);
      if (v === before) continue;
      await el.fill(v);
      await el.press('Tab');
    }
    await page.waitForFunction((k) => document.querySelector(`[data-key="${k}"]`)?.dataset.state, key, { timeout: 15000 });
    const state = await el.evaluate((e) => e.dataset.state);
    fieldOps++;
    if (state === 'saved') { expected[key] = await el.inputValue(); accepted++; }
    else { rejected++; assert.equal(await el.getAttribute('aria-invalid'), 'true', key); }
  }

  // sometimes remove one household entry: later entries move up
  const nH = await page.locator('[data-remove="haushalt"]').count();
  const before0 = { ...expected };
  if (nH > 0 && rnd() < 0.6) {
    const idx = Math.floor(rnd() * nH);
    await page.locator(`[data-remove="haushalt"][data-index="${idx}"]`).click();
    await page.waitForFunction((n) => document.querySelectorAll('[data-remove="haushalt"]').length === n, nH - 1);
    for (const k of Object.keys(expected)) if (k.startsWith('haushalt[')) delete expected[k];
    // the form was re-rendered from the vault: the household fields now show what is stored
    const shiftedOk = Object.entries(before0).filter(([k]) => k.startsWith('haushalt[')).map(([k, v]) => {
      const i = Number(/\[(\d+)\]/.exec(k)[1]);
      return i === idx ? null : [i > idx ? k.replace(`[${i}]`, `[${i - 1}]`) : k, v];
    }).filter(Boolean);
    const snapshotH = await page.$$eval('[data-key^="haushalt["]', (els) => Object.fromEntries(els.map((e) => [e.dataset.key, e.value])));
    for (const [k, v] of shiftedOk) assert.equal(snapshotH[k], v, `Sitzung ${s}: nach Entfernen ${k}`);
    Object.assign(expected, snapshotH);
  }
  for (const k of Object.keys(expected)) if (k.startsWith('einkommen[') && k.endsWith('.wer')) delete expected[k]; // labels depend on names; covered by unit tests

  // reload, unlock, compare
  await page.reload();
  await unlock(page);
  await openAllSections(page);
  const after = await page.$$eval('[data-key]', (els) => Object.fromEntries(els.map((e) => [e.dataset.key, e.value])));
  for (const [k, v] of Object.entries(expected)) assert.equal(after[k], v, `Sitzung ${s}: ${k} erwartet ${JSON.stringify(v)}, angezeigt ${JSON.stringify(after[k])}`);
  for (const k of Object.keys(after)) if (!(k in expected) && !(k.startsWith('einkommen[') && k.endsWith('.wer'))) assert.fail(`Sitzung ${s}: unerwartetes Feld ${k}`);
  // hostile input stays text
  assert.equal(await page.locator('#mask img, #mask script').count(), 0, 'eingeschleustes HTML');
  assert.deepEqual(external, [], 'Netzaufrufe');
  assert.deepEqual(problems, [], 'Fehler: ' + problems.join(' | '));
  await ctx.close();
}
await browser.close();
assert.ok(!dialogs.includes('alert'), 'Skript wurde ausgeführt (alert)');
console.log(`${browserName}: ${SESSIONS} Sitzungen, ${fieldOps} Feldeingaben (${accepted} angenommen, ${rejected} abgelehnt) – nach Neuladen alles exakt wie angenommen, keine Skript-Einschleusung, kein Netzaufruf.`);
