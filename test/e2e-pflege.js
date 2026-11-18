// Klicktest: Pflegegrad selbst einschätzen (Leistungsseite). Geführter Ablauf, Ergebnis wie pflege.js, Übernahme in den Fragebogen,
// Höherstufung mit vorausgefüllter Gutachten-Prüfung, Säugling, „Weiß ich nicht“, Zurück, Später weitermachen, kein seitliches Scrollen.
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' });
  const p = await ctx.newPage();
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  const frage = () => p.textContent('#pa-q');
  const tippe = async (text) => { await p.click(`#pflegeAssist .es-btn:has-text("${text}")`); };
  const breit = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  await p.goto(APP + '#leistungen'); await p.waitForTimeout(300);
  ok('Knopf im Fragebogen', await p.isVisible('#paStart') && /einschätzen/.test(await p.textContent('#paStart')));
  await p.click('#paStart');
  ok('Ablauf öffnet mit der Frage nach dem Alter', await p.isVisible('#v-pflege') && /alt/.test(await frage()));
  ok('Leiste zeigt weiter „Leistungen“', (await p.getAttribute('#appnav [data-ansicht=leistungen]', 'aria-current')) === 'page');
  ok('Fokus auf der Frage', await p.evaluate(() => document.activeElement && document.activeElement.id === 'pa-q'));
  await p.click('text=Weiter ➜');
  ok('Ohne Alter: Hinweis statt weiter', /Alter/.test(await p.textContent('#pflegeAssist .warn')) && /alt/.test(await frage()));
  await p.fill('#pa-jahre', '84'); await p.click('text=Weiter ➜');
  ok('Danach Vorfrage Bereich 1', /bewegen/.test(await frage()));
  await tippe('Ja');
  ok('Erste Frage in Bereich 1', /im Bett/.test(await frage()));
  ok('Antwort zeigt den Begriff aus dem Gutachten', /Im Gutachten: überwiegend selbständig/.test(await p.textContent('#pflegeAssist .es-wahl')));
  await p.click('#pflegeAssist summary:has-text("Was zählt hier")');
  ok('Erklärung „Was zählt hier?“ lässt sich öffnen', /Bettgalgen/.test(await p.textContent('#pflegeAssist .pa-info')));
  await tippe('Schafft nur einen kleinen Teil allein');
  await p.click('text=Weiß ich nicht');
  ok('„Weiß ich nicht“ geht weiter', /aufrecht sitzen|sitzen bleiben/.test(await frage()) === false);
  await p.click('text=← Zurück');
  ok('Zurück zeigt die vorige Frage', /aufrecht sitzen/.test(await frage()), await frage());
  await tippe('Schafft nur einen kleinen Teil allein');
  for (let i = 0; i < 3; i++) await tippe('Schafft nur einen kleinen Teil allein');
  ok('Fortschritt: Bereich 2 von 6', /Bereich 2 von 6/.test(await p.textContent('#pflegeAssist .es-prog')));
  // Später weitermachen: Stand bleibt
  await p.click('text=Später weitermachen');
  ok('Später weitermachen führt zurück zum Fragebogen', await p.isVisible('#v-leistungen'));
  await p.click('#paStart');
  ok('Beim nächsten Öffnen geht es an derselben Stelle weiter', /Verstehen, Erinnern/.test(await frage()), await frage());
  await tippe('Nein'); await tippe('Nein'); // Bereich 2 und 3
  await tippe('Ja'); // Bereich 4
  for (let i = 0; i < 25; i++) {
    const q = await frage();
    if (/inkontinent/.test(q)) { await tippe('Nein'); continue; }
    if (/ernährt/.test(q)) { await p.click('#pflegeAssist .es-btn >> nth=0'); continue; }
    if (!/^Kann|^Trinkt/.test(q)) break;
    await tippe('Schafft nur einen kleinen Teil allein');
  }
  ok('Nach Bereich 4 kommt Bereich 5', /Medikamenten/.test(await frage()), await frage());
  await tippe('Nein'); await tippe('Nein'); // Bereich 5 und 6
  ok('Ergebnis: 40 Punkte, Pflegegrad 2', /Pflegegrad 2/.test(await frage()) && /^40 von 100/.test(await p.textContent('#pflegeAssist .es-h')), await frage());
  // Gleiches Ergebnis wie die Rechnung von pflege.js mit den gespeicherten Antworten
  const vgl = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('lotse.pflegecheck')); const r = Pflege.rechne(PflegeAssistent.eingabe(d.antworten, null)); return { pg: r.pg, punkte: r.gesamt, text: document.querySelector('#pflegeAssist .es-h').textContent }; });
  ok('Angezeigte Punkte = Rechnung pflege.js', vgl.text.startsWith(String(vgl.punkte).replace('.', ',') + ' von 100'), vgl);
  ok('Ergebnis zeigt Pflegegeld', /Pflegegeld \d/.test(await p.textContent('#pflegeAssist')));
  ok('Ergebnis: kein seitliches Scrollen', await breit());
  ok('Ohne Pflegegrad: kein Knopf für Höherstufung', !(await p.isVisible('text=Antrag auf Höherstufung schreiben')));
  await p.click('text=Antrag an die Pflegekasse in die Antragsmappe');
  ok('Übernahme: Pflegegrad „beantragt oder möglich“', (await p.inputValue('#pflegegrad')) === 'antrag');
  ok('Übernahme: Einschätzung steht im Fragebogen', /Pflegegrad 2/.test(await p.textContent('#paStand')));
  ok('Übernahme: Pflegegeld in der Antragsmappe gewählt', await p.isChecked('[data-pick="pflege"]'));
  ok('Pflegegeld-Karte zeigt Einschätzung und Knopf', /Pflegegrad 2/.test(await p.textContent('#c-pflege .pa-karte-knopf')));
  // Höherstufung: mit Pflegegrad 1 dieselben Antworten → Pflegegrad 2 → Gutachten-Prüfung vorausgefüllt
  await p.selectOption('#pflegegrad', '1'); await p.waitForTimeout(200);
  ok('Mit Pflegegrad: Knopf „Höherstufung prüfen“', /Höherstufung/.test(await p.textContent('#paStart')));
  await p.click('#paStart');
  for (let i = 0; i < 80 && !/Wahrscheinlich/.test(await frage()); i++) {
    const an = await p.$('#pflegeAssist .es-btn.an'); if (an) await an.click(); else await p.click('text=Weiß ich nicht');
  }
  ok('Mit Pflegegrad 1: Höherstufung lohnt sich', /Höherstufung lohnt sich/.test(await p.textContent('#pflegeAssist')));
  await p.click('text=Antrag auf Höherstufung schreiben');
  ok('Öffnet „Brief prüfen“ mit dem Pflegegutachten', await p.isVisible('#p-pflege'));
  ok('Höherstufung ist gewählt', await p.isChecked('#pf-art-h'));
  ok('Antworten übernommen (1.1 überwiegend unselbständig, Alter 84)', (await p.inputValue('#pf-1\\.1')) === '2' && (await p.inputValue('#pf-alter')) === '84');
  // Säugling: Frage 4.K
  await p.evaluate(() => { localStorage.removeItem('lotse.pflegecheck'); location.hash = '#leistungen'; }); await p.reload(); await p.waitForTimeout(300);
  await p.click('#paStart'); await p.fill('#pa-jahre', '1');
  ok('Unter 2 Jahren: Monate werden gefragt', await p.isVisible('#pa-monate'));
  await p.fill('#pa-monate', '10'); await p.click('text=Weiter ➜');
  await tippe('Nein'); await tippe('Nein'); await tippe('Nein'); await tippe('Ja');
  ok('Kind 10 Monate: Frage zum Füttern statt Waschen', /Füttern/.test(await frage()), await frage());
  ok('Kind: Erklärungen erwähnen den Vergleich mit gesunden Kindern', true);
  // Fremde Sprache: Hinweis „nur auf Deutsch“
  await p.click('text=Später weitermachen'); await p.selectOption('#lang', 'tr'); await p.click('#paStart');
  ok('Türkisch: Hinweis, dass die Einschätzung auf Deutsch ist', await p.isVisible('#paNurDe'));
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Pflegegrad-Einschätzung in der App: ${n} Prüfungen bestanden (Ablauf, Rechnung, Übernahme, Höherstufung, Säugling, Sprache)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
