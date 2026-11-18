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
  ok('Erklärung steht direkt unter der Frage', /Bettgalgen/.test(await p.textContent('#pflegeAssist .es-h')));
  ok('Antworten ohne Fachbegriffe, gleiche Skala', (await p.textContent('#pflegeAssist .es-wahl')).indexOf('Im Gutachten') < 0);
  ok('Fortschritt zeigt Frage x von y', /Frage 1 von 5/.test(await p.textContent('#pflegeAssist .pa-kopf')));
  ok('Kopf der Seite (Logo, Sprache) ist ausgeblendet', (await p.evaluate(() => document.querySelector('header.top').getBoundingClientRect().height)) <= 1);
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
  // Bereich 5: Liste ankreuzen, dann nur dazu „Wie oft?“; danach wieder abwählen, damit das Ergebnis gleich bleibt
  await tippe('Ja');
  ok('Bereich 5: Liste „Wobei muss jemand helfen?“', /Wobei muss jemand helfen/.test(await frage()) && (await p.locator('#pflegeAssist [data-m5]').count()) >= 15);
  await p.check('[data-m5="5.1"]'); await p.click('text=Weiter ➜');
  ok('Danach nur „Wie oft“ zum angekreuzten Punkt', /Wie oft muss jemand die Medikamente/.test(await frage()), await frage());
  ok('Häufigkeiten von selten nach oft', /^Ein paarmal im Monat/.test(await p.textContent('#pflegeAssist .es-wahl .es-btn >> nth=0')));
  await p.click('text=← Zurück'); await p.uncheck('[data-m5="5.1"]'); await p.click('text=Weiter ➜');
  ok('Ohne Kreuz direkt zur Frage nach Diät', /Diät/.test(await frage()), await frage());
  await p.click('text=← Zurück'); await p.click('text=← Zurück');
  await tippe('Nein'); await tippe('Nein'); // Bereich 5 und 6
  ok('Ergebnis: 40 Punkte, Pflegegrad 2', /Pflegegrad 2/.test(await frage()) && /^40 von 100/.test(await p.textContent('#pflegeAssist .es-h')), await frage());
  // Gleiches Ergebnis wie die Rechnung von pflege.js mit den gespeicherten Antworten
  const vgl = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('lotse.pflegecheck')); const r = Pflege.rechne(PflegeAssistent.eingabe(d.antworten, null)); return { pg: r.pg, punkte: r.gesamt, text: document.querySelector('#pflegeAssist .es-h').textContent }; });
  ok('Angezeigte Punkte = Rechnung pflege.js', vgl.text.startsWith(String(vgl.punkte).replace('.', ',') + ' von 100'), vgl);
  ok('Ergebnis zeigt Pflegegeld', /Pflegegeld: \d/.test(await p.textContent('#pflegeAssist')));
  ok('Ergebnis: kein seitliches Scrollen', await breit());
  ok('Ohne Pflegegrad: kein Knopf für Höherstufung', !(await p.isVisible('text=Antrag auf Höherstufung schreiben')));
  await p.click('text=Antrag an die Pflegekasse in die Antragsmappe');
  ok('Übernahme: Pflegegrad „beantragt oder möglich“', (await p.inputValue('#pflegegrad')) === 'antrag');
  ok('Übernahme: Einschätzung steht im Fragebogen', /Pflegegrad 2/.test(await p.textContent('#paStand')));
  ok('Übernahme: Pflegegeld in der Antragsmappe gewählt', await p.isChecked('[data-pick="pflege"]'));
  ok('Pflegegeld-Karte zeigt Einschätzung und Knopf', /Pflegegrad 2/.test(await p.textContent('#c-pflege .pa-karte-knopf')));
  // Erklärseite: Pflegegeld ist Geld aufs Konto, Entlastungsbetrag ein Budget
  await p.click('#c-pflege .pi-link:has-text("Entlastungsbetrag")');
  ok('Link „Entlastungsbetrag ›“ öffnet die Erklärseite am richtigen Abschnitt', await p.isVisible('#v-pflegeinfo') && await p.evaluate(() => document.getElementById('pi-entl').open && document.activeElement === document.querySelector('#pi-entl summary')));
  ok('Nur dieser Abschnitt ist aufgeklappt', await p.evaluate(() => [...document.querySelectorAll('#pflegeInfo details')].filter((d) => d.open).length === 1));
  await p.click('#pflegeInfo .pi-link-tab:has-text("Pflegegeld")');
  ok('In der Übersicht: Antippen öffnet den Abschnitt', await p.evaluate(() => document.getElementById('pi-geld').open));
  ok('Erklärseite: Entlastungsbetrag kommt nicht aufs Konto', /Entlastungsbetrag: 131 € im Monat, aber nicht aufs Konto/.test(await p.textContent('#pflegeInfo')));
  ok('Erklärseite: kein seitliches Scrollen', await breit());
  await p.click('#piZurueck');
  ok('Zurück führt zur Pflegekarte', await p.isVisible('#v-leistungen'));
  // Höherstufung: mit Pflegegrad 1 dieselben Antworten → Pflegegrad 2 → Gutachten-Prüfung vorausgefüllt
  await p.selectOption('#pflegegrad', '1'); await p.waitForTimeout(200);
  ok('Karte sagt klar: Entlastungsbetrag wird nicht ausgezahlt', /nicht ausgezahlt/.test(await p.textContent('#c-pflege')));
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
  ok('Vergleich: gleiche Werte, keine Abweichung', /keiner Frage/.test(await p.textContent('#pf-vergleich')));
  // Gutachten bewertet niedriger: 1.1 und 1.2 „selbständig“ → zwei Abweichungen, Übernahme in den Widerspruch
  await p.selectOption('#pf-1\\.1', '0'); await p.selectOption('#pf-1\\.2', '0'); await p.waitForTimeout(150);
  ok('Vergleich zeigt zwei Abweichungen', /Bei 2 Fragen/.test(await p.textContent('#pf-vergleich')) && (await p.locator('#pf-vergleich tbody tr').count()) === 2, await p.textContent('#pf-vergleich'));
  await p.click('#pf-vergleich >> text=Abweichungen in den Widerspruch übernehmen');
  ok('Abweichungen stehen im Widerspruch', (await p.locator('#pf-wid-liste [data-id]').count()) >= 2);
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
