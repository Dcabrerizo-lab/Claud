// Fragt die amtlichen Rechner für die Fälle aus tools/amtlich-vergleich-bafoeg-eg.js ab – über die normale Bedienoberfläche
// (Playwright, wie ein Mensch), mit Pausen von mindestens 2 Sekunden zwischen den Fällen und höchstens ~300 Fällen je Rechner.
// Aufruf: node tools/amtliche-rechner/bafoeg-eg-abfrage.js <bafoeg|elterngeld|pfaendung> <Teil> <Teile> <Ausgabedatei> [Anzahl]
// Schreibt [{ i, f, amtlich }]. BAföG: amtlich = { anspruch, bedarf } (Bedarf aus der Antwort, die die Seite selbst lädt).
// Abruf und Prüfung der Seiten: 21.11.2026 (BAföG Digital: keine robots.txt, Nutzungsbedingungen betreffen nur die Registrierung;
// familienportal.de/robots.txt erlaubt alles; freibetragsrechner.justiz.nrw.de: keine robots.txt).
const fs = require('fs');
const { chromium } = require('playwright');
const V = require('../amtlich-vergleich-bafoeg-eg.js');
const EG = require('./eg-amtlich.js');
const PAUSE = 2200;
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

async function browser() {
  const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  return { b, p: await b.newPage({ viewport: { width: 1280, height: 1000 } }) };
}

// ---------- BAföG Digital ----------
async function radio(p, frage, antwort) {
  const q = p.locator('main').getByText(frage).filter({ visible: true });
  const n = await q.count();
  for (let j = 0; j < n; j++) {
    const g = q.nth(j).locator('xpath=ancestor::*[.//*[@role="radiogroup"]][1]').locator('[role=radiogroup]').first();
    await g.getByText(antwort, { exact: false }).first().click({ timeout: 2500 }).catch(() => {});
  }
  await p.waitForTimeout(150);
}
async function feld(p, label, nth, wert) {
  const el = p.locator('main input[aria-label^="' + label + '"]:visible');
  if ((await el.count()) > nth) await el.nth(nth).fill(String(wert));
  else throw new Error('Feld fehlt: ' + label + ' #' + nth);
}
async function auswahl(p, enthaelt, nth, wert) {
  const el = p.locator('main select:visible').filter({ hasText: enthaelt });
  if ((await el.count()) > nth) await el.nth(nth).selectOption(wert);
  else throw new Error('Auswahl fehlt: ' + enthaelt + ' #' + nth);
}
async function seite(p, teil) {
  for (let k = 0; k < 40; k++) { if (p.url().includes('/rechner/' + teil)) { await p.waitForTimeout(500); return; } await p.waitForTimeout(250); }
  throw new Error('Seite ' + teil + ' nicht erreicht (' + p.url() + ')');
}
async function weiter(p) { await p.locator('main').getByText('Nächster Schritt', { exact: true }).filter({ visible: true }).first().click(); await p.waitForTimeout(700); }

async function bafoeg(p, f) {
  await p.goto('https://bafoeg-digital.de/rechner/landing', { timeout: 60000, waitUntil: 'networkidle' });
  await p.getByText('Nur notwendige akzeptieren').click({ timeout: 2000 }).catch(() => {});
  await p.getByText('BAföG berechnen', { exact: true }).click();
  await seite(p, 'antragstellende-person');
  const ue30 = f.typ === 'ich' && f.ue30;
  await radio(p, 'Wie alt sind Sie', ue30 ? 'über 30' : 'unter 30');
  await radio(p, 'Sind Sie verheiratet', 'Nein, ich bin nicht');
  if (!ue30) await radio(p, 'Art des BAföG', 'elternabhängiges');
  await radio(p, 'Wo wohnen Sie', f.beiEltern ? 'bei den Eltern (oder' : 'nicht bei den Eltern');
  await radio(p, 'krankenversichert', f.kv === '0' ? 'Familienversicherung' : 'Gesetzliche studentische');
  await radio(p, 'pflegeversichert', f.kv === '0' ? 'nein (weil' : 'ja');
  await auswahl(p, 'Hochschule', 0, '35');
  await weiter(p);
  await seite(p, 'kinder');
  await radio(p, 'Kinder, die in Ihrem Haushalt', 'nein');
  await weiter(p);
  if (!ue30) {
    await seite(p, 'eltern');
    // Eltern: Paar (verheiratet, zusammen) oder getrennt; beim getrennten Fall hat Elternteil 2 kein Einkommen.
    // Für „ich“-Fälle (unter 30): Eltern ohne Einkommen, damit nur das eigene Vermögen zählt.
    const l = f.typ === 'kind' ? V.elternLohn(f) : { ek1: 0, ek2: 0, st1: 0, st2: 0 };
    const paar = f.typ === 'kind' && f.paar;
    await radio(p, 'Eltern miteinander', paar ? 'Ja, Sie sind' : 'Nein, Sie sind');
    await p.waitForTimeout(400);
    await feld(p, 'Jahreseinkommen (brutto)', 0, l.ek1);
    await feld(p, 'Jahreseinkommen (brutto)', 1, l.ek2);
    if (paar) await feld(p, 'Gezahlte Lohnsteuer', 0, l.st1 + l.st2);
    else { await feld(p, 'Gezahlte Lohnsteuer', 0, l.st1); await feld(p, 'Gezahlte Lohnsteuer', 1, l.st2); }
    await auswahl(p, 'Verbeamtet', 0, l.ek1 > 0 ? '1' : '-1');
    await auswahl(p, 'Verbeamtet', 1, l.ek2 > 0 ? '1' : '-1');
    await weiter(p);
    await seite(p, 'weitere-kinder-der-eltern');
    const jahre = f.typ === 'kind' ? f.jahre : [], ausb = f.typ === 'kind' ? f.geschwAusb : 0;
    await radio(p, 'nicht in einer förderungsfähigen', jahre.length ? 'ja' : 'nein');
    await radio(p, 'sich in einer förderungsfähigen', ausb ? 'ja' : 'nein');
    await p.waitForTimeout(300);
    for (let k = 1; k < jahre.length; k++) { await p.locator('main').getByText('Weiteres Geschwisterkind hinzufügen').filter({ visible: true }).first().click(); await p.waitForTimeout(300); }
    for (let k = 0; k < jahre.length; k++) await auswahl(p, '2026', k, String(jahre[k]));
    await radio(p, 'Wer ist dem Kind', 'Beide');
    await weiter(p);
  }
  await seite(p, 'eigenes-einkommen');
  if (f.eigenEk) { await p.locator('main').getByText('Ich erhalte Sonstige Einkommen').filter({ visible: true }).first().click(); await p.waitForTimeout(300); await feld(p, 'Höhe der Sonstigen', 0, f.eigenEk); }
  await radio(p, 'Werbungskosten über der Pauschale', 'nein');
  await weiter(p);
  await seite(p, 'eigenes-vermoegen');
  const grenze = ue30 ? 45000 : 15000, verm = f.typ === 'ich' ? f.verm : 0;
  await radio(p, 'Gesamtvermögen von über', verm > grenze ? 'ja' : 'nein');
  if (verm > grenze) { await p.waitForTimeout(300); await feld(p, 'Höhe des Gesamtverm', 0, verm); }
  await weiter(p);
  await seite(p, 'prufen');
  const txt = await p.evaluate(() => document.querySelector('main').innerText);
  if (/Fehlerhaft/.test(txt)) throw new Error('Angaben unvollständig: ' + txt.replace(/\s+/g, ' ').slice(0, 300));
  const antwort = p.waitForResponse((r) => /BerechneAnspruch/.test(r.url()), { timeout: 30000 });
  await p.locator('main').getByText('Berechnen', { exact: true }).filter({ visible: true }).first().click();
  const j = await (await antwort).json().catch(() => ({}));
  await seite(p, 'berechnetes-ergebnis');
  const t = await p.evaluate(() => document.querySelector('main').innerText);
  const m = t.match(/BAföG-Anspruch\s*([\d.]+)\s*€/);
  const angezeigt = m ? Number(m[1].replace(/\./g, '')) : null;
  return { anspruch: angezeigt != null ? angezeigt : j.anspruch != null ? j.anspruch : null, bedarf: j.bedarf != null ? j.bedarf : null, text: m ? undefined : t.replace(/\s+/g, ' ').slice(0, 200) };
}

// ---------- Pfändung (Justiz NRW) ----------
async function pfaendung(p, f) {
  await p.goto('https://freibetragsrechner.justiz.nrw.de/', { timeout: 60000 });
  await p.selectOption('select[name=recht]', '2026');
  await p.selectOption('select[name=zeitraum]', 'monatlich');
  await p.fill('input[name=ek_netto]', String(f.netto.toFixed(2)).replace('.', ','));
  const weitere = f.personen - (f.ehegatte ? 1 : 0);
  if (f.ehegatte) await p.locator('input[name=uh_pflicht1]').first().check();
  if (weitere > 0) await p.fill('input[name=uh_pflicht5]', String(weitere));
  await Promise.all([p.waitForLoadState('load'), p.click('input[type=submit][value*="Berechnen"]')]);
  const t = (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  const m = t.match(/Pfändbar sind ([\d.]+,\d\d) €/), k = t.match(/Anzahl der Unterhaltsberechtigten (\d+)/);
  if (k && Number(k[1]) !== f.personen) throw new Error('Unterhaltsberechtigte falsch übernommen: ' + k[1]);
  return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : null;
}

// ---------- Elterngeld (Schnellrechner, wie eg-amtlich.js) ----------
async function elterngeld(p, f) {
  const t = await EG.rechne(p, f);
  const m = String(t).split('||').pop().match(/([\d.]+,\d\d) €/);
  return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : null;
}

if (require.main === module) (async () => {
  const [art, TS, TT, OUT, NS] = process.argv.slice(2);
  const teil = Number(TS) || 0, teile = Number(TT) || 1;
  const alle = V.faelle(art).slice(0, Number(NS) || 1000);
  const fn = { bafoeg, elterngeld, pfaendung }[art];
  if (!fn) { console.log('Art unbekannt: ' + art); process.exit(2); }
  let { b, p } = await browser();
  if (art === 'elterngeld') { await b.close(); ({ b, p } = await EG.open()); }
  const out = [];
  for (let i = teil; i < alle.length; i += teile) {
    const f = alle[i]; let amtlich = null, fehler = null;
    for (let v = 0; v < 3 && amtlich === null; v++) {
      try { amtlich = await fn(p, f); if (amtlich && amtlich.anspruch === null) { fehler = amtlich.text; amtlich = null; } }
      catch (e) { fehler = String(e.message).slice(0, 300); try { await b.close(); } catch (x) { /* egal */ } ({ b, p } = art === 'elterngeld' ? await EG.open() : await browser()); }
      await warte(PAUSE);
    }
    out.push(fehler && amtlich === null ? { i, f, amtlich, fehler } : { i, f, amtlich });
    console.log(i + ': ' + JSON.stringify(amtlich) + (amtlich === null ? ' FEHLER ' + fehler : ''));
    if (out.length % 5 === 0) fs.writeFileSync(OUT, JSON.stringify(out));
  }
  fs.writeFileSync(OUT, JSON.stringify(out));
  await b.close();
  console.log('fertig: ' + out.length + ' Fälle, ohne Ergebnis: ' + out.filter((x) => x.amtlich === null).length);
})();
