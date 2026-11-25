// Klicktest im Browser: „SoLo Pflege & Rente“ (VARIANTE=pflege), Frage „Leben Kinder unter 25 Jahren in Ihrem Haushalt?“ (Auftrag David 25.11.2026)
// - Fragepfad: Ja → Zahl unter 18, davon unter 6 / 14 bis 17, 18 bis 24, Sammelfrage zu den Kindern; Nein → weiter mit dem Geburtsjahr
// - Fall „EM-Rente mit 2 Kindern“ bis zum Ergebnis: Wohngeld wie in SoLo (etwa 620–670 €), keine Kindergeld-Karte, dafür Hinweis auf die App SoLo
// - Vorlesen-Leiste unter der Frage, Sie-Form in Französisch und Polnisch, kein seitliches Scrollen bei 320 px
// Baut die Variante selbst in einen temporären Ordner (dist/ bleibt unberührt). Aufruf: node test/e2e-variante-kinder.js
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { render } = require(path.join(__dirname, '..', 'scripts', 'build.js'));

const gebaut = render({ variante: 'pflege' });
const ordner = fs.mkdtempSync(path.join(os.tmpdir(), 'solo-pflege-e2e-'));
const datei = path.join(ordner, 'solo-pflege.html');
fs.writeFileSync(datei, '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n' + gebaut.html + '\n</body>\n</html>\n');
const I18N = new Function(gebaut.i18n.replace('if (typeof module !== "undefined") module.exports = I18N;', '') + '; return I18N;')();
const de = I18N.de;

let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } else console.log('ok  ', name); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' });
  const p = await ctx.newPage();
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message));
  const frage = () => p.textContent('#sfFrage').catch(() => '');
  const warteFrage = (txt) => p.waitForFunction((t) => { const e = document.getElementById('sfFrage'); return e && e.textContent === t; }, txt, { timeout: 5000 }).catch(() => {});
  const waehle = async (txt) => { await p.click(`#schritte [data-i] >> text="${txt}"`); };
  const weiter = async () => { await p.click('#sfWeiter'); };
  const zahl = async (v) => { await p.fill('#sfIn', String(v)); await p.click('#sfWeiter'); };
  const breit = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  await p.goto('file://' + datei);
  await p.click('#goSelbst'); await p.click('#sen-selbst-check');
  await p.click('.sen-inhalt [data-sen-ziel="check"]');
  await warteFrage(de['sf.q.adults']);
  ok('Check startet mit der Haushaltsfrage', await frage() === de['sf.q.adults'], await frage());
  await waehle(de['sux.a.allein']);
  await warteFrage(de['sux.q.kinder']);
  ok('Danach: „Leben Kinder unter 25 Jahren in Ihrem Haushalt?“', await frage() === de['sux.q.kinder'], await frage());
  ok('Vorlesen-Leiste unter der Kinder-Frage', await p.isVisible('#schritte .vl-leiste'));
  ok('Hinweis „Warum fragen wir?“ mit Erklärung', (await p.textContent('#schritte')).includes(de['sux.h.kinder']));
  ok('Kein seitliches Scrollen (360 px)', await breit());

  await waehle(de['sf.a.ja']);
  await warteFrage(de['sf.q.kids']);
  ok('Ja → Wie viele Kinder unter 18', await frage() === de['sf.q.kids'], await frage());
  await p.click('#sfPlus'); await p.click('#sfPlus'); await weiter();
  await warteFrage(de['sf.q.kidsU6']); await weiter();
  await warteFrage(de['sf.q.kids14']); await p.click('#sfPlus'); await weiter();
  await warteFrage(de['sf.q.young']);
  ok('Alter grob: unter 6, 14 bis 17, dann 18 bis 24', await frage() === de['sf.q.young'], await frage());
  await weiter();
  await warteFrage(de['sux.q.kindLage']);
  ok('Sammelfrage zu den Kindern', await frage() === de['sux.q.kindLage'], await frage());
  await p.click('#sfNichts');
  await warteFrage(de['sf.q.geb']);
  ok('„Nichts davon“ → Geburtsjahr', await frage() === de['sf.q.geb'], await frage());
  await zahl(1980);
  // Rest des Fragepfads: EM-Rente (voll, Wartezeit erfüllt), 1.100 € brutto / 970 € netto, Miete 750 €, Heizung 90 €, Mietenstufe III
  const antworten = {
    [de['sux.q.lage']]: async () => p.click('#sfNichts'),
    [de['sf.q.pflege']]: async () => p.click('#schritte [data-i="0"]'),
    [de['sf.q.bhPerson']]: async () => p.click('#schritte [data-i="0"]'),
    [de['sf.q.emStd']]: async () => p.click('#schritte [data-i="1"]'),
    [de['sf.q.em5']]: async () => waehle(de['sf.a.ja']),
    [de['sf.q.miete']]: async () => zahl(750),
    [de['sf.q.heiz']]: async () => zahl(90),
    [de['sf.q.plz']]: async () => p.click('#sfSkip'),
    [de['sf.q.bundesland']]: async () => p.click('#schritte [data-i="0"]'),
    [de['sf.q.mietstufe']]: async () => p.click('#schritte [data-i="3"]'),
    [de['sf.q.ekArt']]: async () => waehle(de['ek.art.rente']),
    [de['sf.q.brutto.rente']]: async () => zahl(1100),
    [de['sf.q.netto']]: async () => zahl(970),
    [de['sux.q.geld']]: async () => p.click('#sfNichts'),
    [de['sf.q.zusatzRente']]: async () => p.click('#sfSkip'),
    [de['sf.q.vermoegen']]: async () => zahl(1000),
    [de['sf.q.bezug']]: async () => p.click('#sfNichts')
  };
  const gesehen = [];
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(80);
    if (await p.isVisible('#sfErgebnis')) { await p.click('#sfErgebnis'); break; }
    const q = await frage();
    if (gesehen[gesehen.length - 1] === q) continue;
    gesehen.push(q);
    if (antworten[q]) await antworten[q]();
    else if (await p.isVisible('#sfNichts')) await p.click('#sfNichts');
    else if (await p.isVisible('#sfSkip')) await p.click('#sfSkip');
    else await p.click('#schritte [data-i="0"]');
  }
  ok('Fragen zu Waisenrente/Einkommen der Kinder nicht gestellt (nichts angekreuzt)', !gesehen.includes(de['sf.q.waisen']) && !gesehen.includes(de['sf.q.kindEink']), gesehen);
  await p.waitForSelector('#cards article[data-id="wohngeld"]', { timeout: 8000 }).catch(() => {});
  const wg = await p.textContent('#cards article[data-id="wohngeld"]').catch(() => '');
  ok('Ergebnis: Wohngeld-Karte da', !!wg, wg.slice(0, 120));
  ok('EM-Rente mit 2 Kindern: Wohngeld etwa 620–670 € (nicht 180–240 €)', /6[2-6]\d\s*€|670\s*€/.test(wg), wg.replace(/\s+/g, ' ').slice(0, 300));
  ok('Hinweis auf die App SoLo unter den Karten', await p.isVisible('#varKinderHinweis') && (await p.textContent('#varKinderHinweis')) === de['sux.kinder.solo']);
  ok('Keine Kindergeld-, Kinderzuschlag- oder Bildungspaket-Karte (Fokus Rente und Pflege)', !(await p.$('#cards article[data-id="kindergeld"], #cards article[data-id="kiz"], #cards article[data-id="but"]')));
  ok('Keine Unterhaltsvorschuss-Karte (nicht in der Variante)', !(await p.$('#cards article[data-id="uvg"]')));
  ok('Ergebnis ohne seitliches Scrollen', await breit());

  // Sie-Form in anderen Sprachen und schmaler Bildschirm (320 px)
  for (const [l, re] of [['fr', /votre foyer/], ['pl', /Pana\/Pani/]]) {
    const c2 = await b.newContext({ viewport: { width: 320, height: 700 }, locale: l });
    const q = await c2.newPage(); q.on('pageerror', (e) => fehler.push(l + ': ' + e.message));
    await q.goto('file://' + datei);
    await q.evaluate((lang) => { const s = document.getElementById('langSel') || document.querySelector('select[id*="lang" i]'); if (s) { s.value = lang; s.dispatchEvent(new Event('change', { bubbles: true })); } }, l);
    await q.waitForTimeout(300);
    await q.click('#goSelbst'); await q.click('#sen-selbst-check'); await q.click('.sen-inhalt [data-sen-ziel="check"]');
    await q.waitForSelector('#schritte [data-i]');
    await q.click('#schritte [data-i="0"]');
    await q.waitForFunction((t) => { const e = document.getElementById('sfFrage'); return e && e.textContent === t; }, I18N[l]['sux.q.kinder'], { timeout: 5000 }).catch(() => {});
    const t = await q.textContent('#sfFrage');
    ok(l + ': Kinder-Frage in Sie-Form', t === I18N[l]['sux.q.kinder'] && re.test(t), t);
    ok(l + ': kein seitliches Scrollen bei 320 px', await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await c2.close();
  }
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  fs.rmSync(ordner, { recursive: true, force: true });
  console.log(f ? f + ' von ' + n + ' Prüfungen fehlgeschlagen' : 'Variante Pflege, Kinder im Browser: ' + n + ' Prüfungen ok');
  process.exit(f ? 1 : 0);
})();
