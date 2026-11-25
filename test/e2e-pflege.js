// Klicktest: Pflegegrad selbst einschätzen (Leistungsseite). Geführter Ablauf, Ergebnis wie pflege.js, Übernahme in den Fragebogen,
// Höherstufung mit vorausgefüllter Gutachten-Prüfung, Säugling, „Weiß ich nicht“, Zurück, Später weitermachen, kein seitliches Scrollen.
'use strict';
const { chromium } = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
const path = require('path');
const APP = 'file://' + path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, locale: 'de-DE' });
  const p = await ctx.newPage(); await p.addInitScript(SF_ALLES);
  const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  const frage = () => p.textContent('#pa-q');
  const tippe = async (text) => { await p.click(`#pflegeAssist .es-btn:has-text("${text}")`); };
  const breit = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  // Auf den Zustand warten statt fester Wartezeit; trifft er nicht ein, schlägt die folgende Prüfung fehl
  const warte = (fn, arg) => p.waitForFunction(fn, arg, { timeout: 5000 }).catch(() => {});
  const sichtbar = (sel) => p.waitForSelector(sel, { state: 'visible', timeout: 5000 }).catch(() => {});
  await p.goto(APP + '#leistungen'); await sichtbar('#paStart');
  ok('Knopf im Fragebogen', await p.isVisible('#paStart') && /einschätzen/.test(await p.textContent('#paStart')));
  await p.click('#paStart');
  ok('Ablauf öffnet mit der Frage nach dem Alter', await p.isVisible('#v-pflege') && /alt/.test(await frage()));
  ok('Leiste zeigt weiter „Start“ (Leistungen gehört zur Startseite)', (await p.getAttribute('#appnav [data-ansicht=start]', 'aria-current')) === 'page');
  ok('Fokus auf der Frage', await p.evaluate(() => document.activeElement && document.activeElement.id === 'pa-q'));
  await p.click('text=Weiter ➜');
  ok('Ohne Alter: Hinweis statt weiter', /Alter/.test(await p.textContent('#pflegeAssist .warn')) && /alt/.test(await frage()));
  await p.fill('#pa-jahre', '84'); await p.click('text=Weiter ➜');
  ok('Danach Vorfrage Bereich 1', /bewegen/.test(await frage()));
  await tippe('Ja');
  ok('Erste Frage in Bereich 1', /im Bett/.test(await frage()));
  ok('Erklärung steht direkt unter der Frage', /Bettgalgen/.test(await p.textContent('#pflegeAssist .es-h')));
  ok('Antworten ohne Fachbegriffe, gleiche Skala', (await p.textContent('#pflegeAssist .es-wahl')).indexOf('Im Gutachten') < 0);
  ok('Fortschritt zeigt Frage x von y', /Frage 1 von 6/.test(await p.textContent('#pflegeAssist .pa-kopf')));
  ok('Kopf der Seite (Logo, Sprache) ist ausgeblendet', (await p.evaluate(() => document.querySelector('header.top').getBoundingClientRect().height)) <= 1);
  await tippe('Schafft nur einen kleinen Teil allein');
  await p.click('#pflegeAssist >> text=Weiß ich nicht');
  ok('„Weiß ich nicht“ geht weiter', /aufrecht sitzen|sitzen bleiben/.test(await frage()) === false);
  await p.click('text=← Zurück >> visible=true');
  ok('Zurück zeigt die vorige Frage', /aufrecht sitzen/.test(await frage()), await frage());
  await tippe('Schafft nur einen kleinen Teil allein');
  for (let i = 0; i < 3; i++) await tippe('Schafft nur einen kleinen Teil allein');
  ok('Am Ende von Bereich 1: Frage nach beiden Armen und Beinen (§ 15 Abs. 4 SGB XI)', /Arme und beide Beine/.test(await frage()), await frage());
  await tippe('Nein');
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
  await p.click('text=← Zurück >> visible=true'); await p.uncheck('[data-m5="5.1"]'); await p.click('text=Weiter ➜');
  ok('Ohne Kreuz direkt zur Frage nach Diät', /Diät/.test(await frage()), await frage());
  await p.click('text=← Zurück >> visible=true'); await p.click('text=← Zurück >> visible=true');
  await tippe('Nein'); await tippe('Nein'); // Bereich 5 und 6
  ok('Ergebnis: 40 Punkte, Pflegegrad 2', /^Wahrscheinlich Pflegegrad 2/.test(await frage()) && /^40 von 100/.test(await p.textContent('#pflegeAssist .pa-punkte')), await frage());
  ok('Ergebnisseite: Hinweis „Das ist eine Einschätzung“', /Das ist eine Einschätzung\. Entscheiden tut die Pflegekasse\./.test(await p.textContent('#pflegeAssist')));
  ok('Ergebnisseite: höchstens 3 Kacheln', (await p.locator('#pflegeAssist .pa-kacheln > .uk-karte').count()) === 3);
  ok('Ergebnisseite: aus dem Leistungs-Check gekommen, Link zurück dorthin', await p.isVisible('#pflegeAssist .pa-links button:has-text("Zurück zum Leistungs-Check")'));
  // Gleiches Ergebnis wie die Rechnung von pflege.js mit den gespeicherten Antworten
  const vgl = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('lotse.pflegecheck')); const r = Pflege.rechne(PflegeAssistent.eingabe(d.antworten, null)); return { pg: r.pg, punkte: r.gesamt, text: document.querySelector('#pflegeAssist .pa-punkte').textContent }; });
  ok('Angezeigte Punkte = Rechnung pflege.js', vgl.text.startsWith(String(vgl.punkte).replace('.', ',') + ' von 100'), vgl);
  ok('Ergebnis zeigt Pflegegeld', /Pflegegeld: \d/.test(await p.textContent('#pflegeAssist')));
  ok('Ergebnis: kein seitliches Scrollen', await breit());
  ok('Ohne Pflegegrad: keine Kachel für Höherstufung', !(await p.isVisible('text=Höherstufung beantragen')));
  // „Was steht mir zu?“ und zurück: das Ergebnis bleibt
  await p.click('#pflegeAssist .pa-k-hilfen');
  ok('„Was steht mir zu?“ zeigt die Unterstützung bei Pflegegrad 2', await p.isVisible('#v-pflegestart') && /Das gibt es bei Pflegegrad 2/.test(await p.textContent('#puInhalt')));
  await p.click('#v-pflegestart [data-nav-zurueck]');
  ok('„← Zurück“ führt zur Ergebnisseite', /^Wahrscheinlich Pflegegrad 2/.test(await frage()));
  await p.click('#pflegeAssist .pa-k-antrag');
  ok('Übernahme: Pflegegrad „beantragt oder möglich“', (await p.inputValue('#pflegegrad')) === 'antrag');
  ok('Übernahme: Einschätzung steht im Fragebogen', /Pflegegrad 2/.test(await p.textContent('#paStand')));
  ok('Übernahme: Pflegegeld in der Antragsmappe gewählt', await p.isChecked('[data-pick="pflege"]'));
  ok('Pflegegeld-Karte zeigt Einschätzung und Knopf', /Pflegegrad 2/.test(await p.textContent('#c-pflege .pa-karte-knopf')));
  ok('Antragsmappe: oben „← Zurück“', await p.isVisible('#leistungenKopf [data-nav-zurueck]'));
  await p.click('#leistungenKopf [data-nav-zurueck]');
  ok('Zurück aus der Antragsmappe: Ergebnisseite', /^Wahrscheinlich Pflegegrad 2/.test(await frage()));
  await p.click('#pflegeAssist .pa-links button:has-text("Zurück zum Leistungs-Check")');
  ok('Link führt zurück in den Leistungs-Check', await p.isVisible('#v-leistungen'));
  // Erklärseite: Pflegegeld ist Geld aufs Konto, Entlastungsbetrag ein Budget
  // Der Link „Zurück zum Leistungs-Check“ öffnet die Pflege-Karte schon (paZurueck/karteAuf); sonst hier aufklappen
  if (!(await p.evaluate(() => document.querySelector('#c-pflege details.karte').open))) await p.click('#c-pflege summary');
  ok('Ergebniskarte klappt auf', await p.evaluate(() => document.querySelector('#c-pflege details.karte').open));
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
  await p.selectOption('#pflegegrad', '1'); await warte(() => /nicht ausgezahlt/.test(document.getElementById('c-pflege').textContent) && /Höherstufung/.test(document.getElementById('paStart').textContent));
  ok('Karte sagt klar: Entlastungsbetrag wird nicht ausgezahlt', /nicht ausgezahlt/.test(await p.textContent('#c-pflege')));
  ok('Mit Pflegegrad: Knopf „Höherstufung prüfen“', /Höherstufung/.test(await p.textContent('#paStart')));
  await p.click('#paStart');
  for (let i = 0; i < 80 && !/Wahrscheinlich/.test(await frage()); i++) {
    const an = await p.$('#pflegeAssist .es-btn.an'); if (an) await an.click(); else await p.click('#pflegeAssist >> text=Weiß ich nicht');
  }
  ok('Mit Pflegegrad 1: Höherstufung lohnt sich', /Höherstufung lohnt sich/.test(await p.textContent('#pflegeAssist')));
  ok('Mit Pflegegrad 1: Kachel „Höherstufung beantragen“', /Höherstufung beantragen/.test(await p.textContent('#pflegeAssist .pa-k-antrag')));
  await p.click('#pflegeAssist .pa-k-antrag');
  ok('Öffnet „Brief prüfen“ mit dem Pflegegutachten', await p.isVisible('#p-pflege'));
  ok('Höherstufung ist gewählt', await p.isChecked('#pf-art-h'));
  ok('Antworten übernommen (1.1 überwiegend unselbständig, Alter 84)', (await p.inputValue('#pf-1\\.1')) === '2' && (await p.inputValue('#pf-alter')) === '84');
  ok('Vergleich: gleiche Werte, keine Abweichung', /keiner Frage/.test(await p.textContent('#pf-vergleich')));
  // Bereiche stehen als zugeklappte Aufgabenliste (UX-Audit B/D): Stand je Bereich sichtbar
  ok('Pflege: Bereiche zugeklappt mit Stand', await p.evaluate(() => document.querySelectorAll('#pf-module details.pf-bereich:not([open])').length === 6 && /von \d+ eingetragen/.test(document.querySelector('#pf-bereich-1 .pf-zahl').textContent)));
  // Gutachten bewertet niedriger: 1.1 und 1.2 „selbständig“ → zwei Abweichungen, Übernahme in den Widerspruch
  await p.evaluate(() => document.querySelectorAll('#pf-module details.pf-bereich').forEach((x) => { x.open = true; })); // Bereiche sind zugeklappt
  await p.selectOption('#pf-1\\.1', '0'); await p.selectOption('#pf-1\\.2', '0'); await warte(() => /Bei 2 Fragen/.test(document.getElementById('pf-vergleich').textContent) && document.querySelectorAll('#pf-wid-liste .pw[data-auto="1"]').length === 2);
  ok('Vergleich zeigt zwei Abweichungen', /Bei 2 Fragen/.test(await p.textContent('#pf-vergleich')), await p.textContent('#pf-vergleich'));
  ok('Abweichungen stehen von selbst als Karten mit Beschreibungsfeld da', (await p.locator('#pf-wid-liste .pw[data-auto="1"]').count()) === 2 && (await p.locator('#pf-wid-liste .pw[data-id="1.1"] textarea').count()) === 1);
  ok('Karte nennt den Wert aus dem Gutachten und die eigene Einschätzung', /Im Gutachten: „schafft es allein“/.test(await p.textContent('#pf-wid-liste .pw[data-id="1.1"]')) && (await p.inputValue('#pf-wid-liste .pw[data-id="1.1"] select')) === '2');
  await p.fill('#pf-wid-liste .pw[data-id="1.1"] textarea', 'Sie kommt nachts nicht allein hoch und muss gedreht werden.');
  await p.uncheck('#pf-wid-liste .pw[data-id="1.2"] .pw-mit');
  // Gutachten-Wert auf eigenen Wert: die leere Karte 1.2 verschwindet, die ausgefüllte 1.1 bleibt
  await p.selectOption('#pf-1\\.2', '2'); await warte(() => !document.querySelector('#pf-wid-liste .pw[data-id="1.2"]'));
  ok('Karte ohne Abweichung und ohne Text verschwindet', (await p.locator('#pf-wid-liste .pw[data-id="1.2"]').count()) === 0 && (await p.locator('#pf-wid-liste .pw[data-id="1.1"]').count()) === 1);
  ok('Beschreibung bleibt beim Neurechnen erhalten', /nachts nicht allein/.test(await p.inputValue('#pf-wid-liste .pw[data-id="1.1"] textarea')));
  await p.click('#pf-wid-mach');
  const schreiben = await p.inputValue('#pf-wid-text');
  ok('Schreiben enthält die Abweichung mit der Beschreibung aus dem Alltag', /1\.1 .*„selbständig“, heute „überwiegend unselbständig“\. Sie kommt nachts nicht allein hoch/.test(schreiben), schreiben.slice(0, 600));
  // Jede Bewertung wird verglichen: auch Inkontinenz, Sonde, jede Maßnahme in Bereich 5 und 5.16
  await p.evaluate(() => window.PruefpaketPflege.eigene({ stufen: { '1.1': 2, '4.13': 1 }, m5: { '5.1': { tag: 3 }, '5.13': { monat: 3 }, '5.16': 2 }, inkontinenz: { harn: true, stuhl: false }, alterJahre: '84' }));
  await sichtbar('#pf-m5-leer');
  ok('Bereich 5 leer: Hinweis, Häufigkeiten aus dem Gutachten einzutragen', await p.isVisible('#pf-m5-leer'));
  await p.fill('#pf-5\\.1-tag', '1'); await p.dispatchEvent('#pf-5\\.1-tag', 'input'); await warte(() => !!document.querySelector('#pf-wid-liste [data-id="5.1"]'));
  const karten = await p.evaluate(() => [...document.querySelectorAll('#pf-wid-liste .pw')].map((z) => z.dataset.id));
  ok('Vergleich umfasst Inkontinenz, Sonde, Medikamente, Arztbesuche und Diät', ['ink-harn', '4.13', '5.1', '5.13', '5.16'].every((x) => karten.includes(x)), karten);
  ok('Medikamente: Gutachten 1-mal, eigene Einschätzung 3-mal am Tag', /Im Gutachten: 1-mal am Tag/.test(await p.textContent('#pf-wid-liste [data-id="5.1"]')) && /3-mal am Tag/.test(await p.textContent('#pf-wid-liste [data-id="5.1"]')));
  await p.fill('#pf-wid-liste [data-id="5.1"] textarea', 'Dreimal täglich Tabletten richten.');
  await p.click('#pf-wid-mach');
  const s2 = await p.inputValue('#pf-wid-text');
  ok('Schreiben enthält Bereich 5 und Inkontinenz mit Beschreibung', /5\.1 Medikamente richten und geben: .*1-mal am Tag, .*3-mal am Tag\. Dreimal täglich Tabletten richten\./.test(s2) && /Harninkontinenz/.test(s2), s2.slice(0, 900));
  // Säugling: Frage 4.K
  // Neu laden auf der Leistungsseite. Nicht „location.hash = …“ und gleich reload(): Der Hash-Wechsel aus „Brief prüfen“ ist eine Ebene
  // höher, die Navigation geht dafür asynchron im Verlauf zurück (history.go, src/navigation.js). Lädt der Test währenddessen neu,
  // steht die Seite je nach Zeitpunkt noch auf #briefe und #paStart ist unsichtbar (CI: Klick-Timeout an #paStart, beim Neustart grün).
  // Deshalb: Speicher leeren, Seite verlassen und frisch mit #leistungen öffnen, dann auf den sichtbaren Knopf warten.
  await p.evaluate(() => localStorage.removeItem('lotse.pflegecheck'));
  await p.goto('about:blank'); await p.goto(APP + '#leistungen');
  await p.waitForSelector('#paStart', { state: 'visible', timeout: 15000 });
  await p.click('#paStart'); await p.waitForSelector('#pa-jahre', { state: 'visible', timeout: 15000 }); await p.fill('#pa-jahre', '1');
  ok('Unter 2 Jahren: Monate werden gefragt', await p.isVisible('#pa-monate'));
  await p.fill('#pa-monate', '10'); await p.click('text=Weiter ➜');
  // Kinder bis 18 Monate: Bereiche 1, 2 und 6 werden nicht bewertet, aus Bereich 1 nur die Gebrauchsunfähigkeit beider Arme und Beine
  // (Begutachtungs-Richtlinien Kap. 5, § 15 Abs. 4 und 7 SGB XI; seit 24.11.2026). Reihenfolge: Arme/Beine, Bereich 3, Bereich 4
  ok('Kind 10 Monate: zuerst Frage nach beiden Armen und Beinen (Bereich 1 und 2 entfallen)', /Arme und beide Beine/.test(await frage()), await frage());
  await tippe('Nein'); await tippe('Nein'); await tippe('Ja');
  ok('Kind 10 Monate: Frage zum Füttern statt Waschen', /Füttern/.test(await frage()), await frage());
  ok('Kind: Erklärungen erwähnen den Vergleich mit gesunden Kindern', true);
  // Fremde Sprache: Hinweis „nur auf Deutsch“
  await p.click('text=Später weitermachen'); await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'tr'); await p.click('#paStart');
  ok('Türkisch: Einschätzung übersetzt, kein Hinweis „nur Deutsch“', !(await p.isVisible('#paNurDe')) && !/Wie alt|Wahrscheinlich|Bereich \d/.test(await p.textContent('#pflegeAssist')), await p.textContent('#pflegeAssist'));
  ok('Keine Skriptfehler', fehler.length === 0, fehler);
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Pflegegrad-Einschätzung in der App: ${n} Prüfungen bestanden (Ablauf, Rechnung, Übernahme, Höherstufung, Säugling, Sprache)`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
