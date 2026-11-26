// Browser-Test der Vorschau (dist/solo-pruefpaket-vorschau.html). Nicht Teil von npm test der App 1.2.0.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');
const axePfad = require.resolve('axe-core/axe.min.js');
const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'dist', 'sozialleistungslotse.html');
let n = 0, f = 0;
// Feste Daten kippen mit der Zeit (Frist vorbei): Bescheid immer vor 5 Tagen, erwartetes Fristende aus erweiterungen/fristen.js
const FR = require('../../erweiterungen/fristen.js');
const vorTagen = (t) => new Date(Date.now() - t * 864e5).toISOString().slice(0, 10);
const deD = (s) => s.split('-').reverse().join('.'), reD = (s) => deD(s).replace(/\./g, '\\.');
const BESCHEID = vorTagen(5), BIS = deD(FR.widerspruch({ datum: BESCHEID }).fristende);
const ok = (name, c, info) => { n++; console.log((c ? 'ok   ' : 'FEHLER ') + name + (c || info === undefined ? '' : ' ' + JSON.stringify(info))); if (!c) f++; };
(async () => {
  const appVorher = fs.existsSync(APP) ? fs.statSync(APP).mtimeMs : null;
  cp.execSync('node scripts/build-erweiterungen.js', { cwd: ROOT, stdio: 'inherit' });
  ok('App-Datei vom Vorschau-Build nicht verändert', (fs.existsSync(APP) ? fs.statSync(APP).mtimeMs : null) === appVorher);
  const datei = 'file://' + path.join(ROOT, 'dist', 'solo-pruefpaket-vorschau.html');
  const b = await chromium.launch();
  for (const schema of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', colorScheme: schema });
    const p = await ctx.newPage();
    const fehler = []; p.on('pageerror', (e) => fehler.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    await p.goto(datei);
    const axe = async (name) => {
      await p.addScriptTag({ path: axePfad });
      const v = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations.map((x) => x.id + ' x' + x.nodes.length + ' ' + x.nodes.slice(0, 2).map((y) => y.target.join(' ')).join(' ; ')));
      ok(`${schema}: axe ${name}`, v.length === 0, v);
      const klein = await p.evaluate(() => [...document.querySelectorAll('button, select, input, summary, textarea')].filter((el) => { const t = (el.type === 'checkbox' || el.type === 'radio') && el.closest('label') ? el.closest('label') : el; const r = t.getBoundingClientRect(); return r.width && r.height && !el.closest('[hidden]') && r.height < 43.5; }).map((el) => el.id || el.tagName));
      ok(`${schema}: Tippflächen ${name} mind. 44 px`, klein.length === 0, klein.slice(0, 5));
      const breit = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      ok(`${schema}: ${name} ohne seitliches Scrollen`, breit);
    };
    await axe('Pflege leer');
    // Pflege: Beispiel lesen, Anzeige = Rechnung
    await p.click('#pf-beispiel');
    const { anzeige, erwartet } = await p.evaluate(() => {
      const im = PflegeImport.lies(document.getElementById('pf-text').value, Pflege);
      const r = Pflege.rechne({ stufen: im.stufen, m5: { '5.16': 0 }, inkontinenz: { harn: false, stuhl: false }, pgBescheid: im.pgBescheid, alterJahre: 82 });
      return { anzeige: document.querySelector('#pf-erg .big').textContent + document.querySelector('#pf-erg .big + .muted').textContent, erwartet: `${r.pg ? 'Pflegegrad ' + r.pg : 'Kein Pflegegrad'} · ${String(r.gesamt).replace('.', ',')} von 100 Punkten` };
    });
    ok(`${schema}: Pflege-Anzeige = Rechnung (${anzeige})`, anzeige === erwartet, { anzeige, erwartet });
    ok(`${schema}: Erklärung sichtbar mit Alltagsbedeutung`, await p.isVisible('#pf-erkl') && /schafft die Person/.test(await p.textContent('#pf-erkl')));
    ok(`${schema}: Auswahl zeigt Alltagssprache`, /\(schafft es meistens allein\)/.test(await p.textContent('#pf-1\\.1')));
    ok(`${schema}: Erwachsene ohne Kinder-Hinweis`, !/gesunden Kindern/.test(await p.textContent('#pf-erg')));
    await p.fill('#pf-alter', '1');
    ok(`${schema}: unter 2 Jahren erscheint Monatsfeld`, await p.isVisible('#pf-monate'));
    await p.fill('#pf-monate', '10');
    ok(`${schema}: Säugling: Sonderregel erklärt`, /eine Stufe höher/.test(await p.textContent('#pf-erg')));
    ok(`${schema}: Kind: Frühförderung sichtbar`, await p.evaluate(() => !document.getElementById('pf-zeile-5K').hidden)); // Bereich 5 ist zugeklappt
    await p.fill('#pf-monate', ''); await p.fill('#pf-alter', '9');
    ok(`${schema}: Kind 9 Jahre: Vergleich mit gesunden Kindern`, /gesunden Kindern/.test(await p.textContent('#pf-erg')) && !(await p.isVisible('#pf-monate')));
    await p.fill('#pf-alter', '');
    ok(`${schema}: ohne Alter Hinweis`, /Alter der gepflegten Person eintragen/.test(await p.textContent('#pf-erg')));
    await p.fill('#pf-alter', '82');
    ok(`${schema}: Meldung über erkannte Bewertungen`, /von \d+ Bewertungen erkannt/.test(await p.textContent('#pf-msg')));
    ok(`${schema}: Bescheid-Vergleich angezeigt`, /Pflegegrad im Bescheid/.test(await p.textContent('#pf-erg')));
    await axe('Pflege mit Ergebnis');
    const uebern = p.locator('#pf-erg .opt button').first();
    if (await uebern.count()) { await uebern.click(); ok(`${schema}: Kombination in Widerspruch übernommen`, (await p.locator('#pf-wid-liste .opt').count()) >= 1); }
    await p.fill('#pf-name', '<img src=x onerror="window.__x=1">Erika');
    await p.fill('#pf-datum', BESCHEID);
    await p.locator('#pf-wid-liste textarea').first().fill('Sie braucht jeden Tag Hilfe.').catch(() => {});
    await p.click('#pf-wid-mach');
    const wt = await p.inputValue('#pf-wid-text');
    ok(`${schema}: Pflege-Widerspruch erstellt`, new RegExp('Widerspruch gegen den Bescheid über die Feststellung des Pflegegrades vom ' + reD(BESCHEID)).test(wt));
    ok(`${schema}: eingeschleuster Code nur als Text`, wt.includes('<img src=x') && !(await p.evaluate(() => window.__x)));
    ok(`${schema}: Frist angezeigt`, (await p.textContent('#pf-frist')).includes(BIS));
    await p.check('#pf-art-h');
    ok(`${schema}: Höherstufung: Datumsfeld heißt jetzt letzte Begutachtung`, /letzten Begutachtung/.test(await p.textContent('#pf-datum-label')));
    await p.click('#pf-wid-mach');
    const ht = await p.inputValue('#pf-wid-text');
    ok(`${schema}: Höherstufungsantrag erstellt`, /Antrag auf Höherstufung des Pflegegrades/.test(ht) && !/Widerspruch/.test(ht));
    ok(`${schema}: Höherstufung: Hinweis keine Frist`, /Keine Frist/.test(await p.textContent('#pf-frist')));
    await p.check('#pf-art-w');
    // Bescheid
    await p.click('#tab-bescheid');
    ok(`${schema}: Reiter wechselt`, await p.isVisible('#p-bescheid') && !(await p.isVisible('#p-pflege')));
    await p.click('#bs-beispiel');
    ok(`${schema}: Bescheid-Beispiel 163,12 € zu wenig`, (await p.textContent('#bs-erg .big')).includes('163,12 €'), await p.textContent('#bs-erg .big'));
    await axe('Bescheid mit Ergebnis');
    await p.fill('#bs-datum', BESCHEID);
    await p.click('#bs-wid-mach');
    const bt = await p.inputValue('#bs-wid-text');
    ok(`${schema}: Bescheid-Widerspruch mit beiden Gründen`, /Mehrbedarf für Alleinerziehende/.test(bt) && /Angerechnetes Einkommen/.test(bt));
    await p.click('[aria-label="Person 2 entfernen"], #bs-personen tr:nth-child(2) button');
    ok(`${schema}: Person entfernen rechnet neu`, !(await p.textContent('#bs-erg')).includes('163,12'));
    // Erkannte Werte (Scan/PDF/Text): markiert, Ergebnis erst nach „Werte stimmen“ oder eigener Änderung
    const bsFrei = async () => { const t = await p.textContent('#bs-erg'); return /^Ergebnis/.test(t) && !/Bitte zuerst/.test(t); }; // Vergleich oder „Es fehlen noch“
    const heuteIso = new Date().toISOString().slice(0, 10);
    const fuelle = (felder, quelle) => p.evaluate(([f, d, q]) => window.PruefpaketLesen.fuelle('jc', { felder: f, datum: d, posten: [] }, null, q), [felder, heuteIso, quelle]);
    await fuelle({ 'bs-b-regel': 1310, 'bs-b-kdu': 800, 'bs-b-eink': 500, 'bs-b-kg': 518, 'bs-b-zahl': 1092 }, { foto: true, unsicher: ['1.092'] });
    ok(`${schema}: Erkannt: Hinweiszeile oben sichtbar`, await p.isVisible('#bs-erk') && /aus dem Brief gelesen/.test(await p.textContent('#bs-erk')));
    ok(`${schema}: Erkannt: Felder markiert`, await p.evaluate(() => ['bs-b-regel', 'bs-b-kdu', 'bs-b-zahl', 'bs-datum'].every((id) => document.getElementById(id).classList.contains('pp-erkannt'))));
    ok(`${schema}: Erkannt: Ergebnis wartet`, /Bitte zuerst die erkannten Werte prüfen/.test(await p.textContent('#bs-erg')) && !(await p.$('#bs-erg .big')));
    ok(`${schema}: Foto: unsicheres Wort (Konfidenz) nur am Zahlbetrag farbig`, await p.evaluate(() => document.getElementById('bs-b-zahl').classList.contains('pp-unsicher') && !!document.getElementById('bs-b-zahl-unsicher') && !document.getElementById('bs-b-regel').classList.contains('pp-unsicher')));
    ok(`${schema}: Foto: unsicher hebt sich farbig ab`, await p.evaluate(() => getComputedStyle(document.getElementById('bs-b-zahl')).borderTopWidth !== getComputedStyle(document.getElementById('bs-b-regel')).borderTopWidth));
    await axe('Bescheid mit erkannten Werten');
    await p.click('#bs-wid-mach');
    ok(`${schema}: Erkannt: kein Widerspruch vor der Prüfung`, /Bitte zuerst die erkannten Werte prüfen/.test(await p.textContent('#bs-frist')));
    await p.fill('#bs-b-regel', '1310');
    ok(`${schema}: Erkannt: geändertes Feld ohne Markierung, Rest bleibt`, await p.evaluate(() => !document.getElementById('bs-b-regel').classList.contains('pp-erkannt') && document.getElementById('bs-b-kdu').classList.contains('pp-erkannt')) && /Bitte zuerst/.test(await p.textContent('#bs-erg')));
    await p.click('#bs-erk-ok');
    ok(`${schema}: Werte stimmen: Markierung weg, Ergebnis da`, !(await p.isVisible('#bs-erk')) && await p.evaluate(() => !document.querySelector('#p-bescheid .pp-erkannt, #p-bescheid .pp-unsicher-t')) && await bsFrei(), (await p.textContent('#bs-erg')).slice(0, 200));
    // Summe passt nicht (Foto, ohne Konfidenz): beteiligte Werte farbig; Text eingefügt: keine Plausibilitätsmarkierung
    await fuelle({ 'bs-b-regel': 1310, 'bs-b-kdu': 800, 'bs-b-eink': 500, 'bs-b-kg': 518, 'bs-b-zahl': 1579 }, { foto: true, unsicher: [] });
    ok(`${schema}: Foto: Summe passt nicht → beteiligte Werte unsicher`, await p.evaluate(() => ['bs-b-regel', 'bs-b-kdu', 'bs-b-zahl'].every((id) => document.getElementById(id).classList.contains('pp-unsicher'))));
    await fuelle({ 'bs-b-regel': 1310, 'bs-b-kdu': 800, 'bs-b-zahl': 1579 }, { foto: false, unsicher: [] });
    ok(`${schema}: Text: nur „erkannt“, nicht „unsicher“`, await p.evaluate(() => !document.querySelector('#p-bescheid .pp-unsicher') && document.getElementById('bs-b-zahl').classList.contains('pp-erkannt')));
    await p.fill('#bs-b-regel', '1310'); await p.fill('#bs-b-kdu', '800'); await p.fill('#bs-b-zahl', '1092'); await p.fill('#bs-datum', heuteIso);
    ok(`${schema}: Alle erkannten Felder selbst geändert: Ergebnis da`, !(await p.isVisible('#bs-erk')) && await bsFrei());
    // Pflegegutachten aus Text: Bewertungen markiert, Ergebnis nach Bestätigung
    await p.click('#tab-pflege');
    await p.click('#pf-lesen');
    ok(`${schema}: Gutachten gelesen: Hinweis und Markierung`, await p.isVisible('#pf-erk') && (await p.locator('#p-pflege .pp-erkannt').count()) > 5);
    ok(`${schema}: Gutachten: Ergebnis wartet`, /Bitte zuerst die erkannten Werte prüfen/.test(await p.textContent('#pf-erg')) && !(await p.$('#pf-erg .big')));
    await p.click('#pf-erk-ok');
    ok(`${schema}: Gutachten: nach „Werte stimmen“ Pflegegrad sichtbar`, !!(await p.$('#pf-erg .big')) && (await p.locator('#p-pflege .pp-erkannt').count()) === 0);
    await p.click('#tab-bescheid');
    // Grundsicherung im Alter
    await p.click('#tab-gsa');
    await p.click('#ga-beispiel');
    ok(`${schema}: Grundsicherung im Alter: 492,21 € zu wenig`, (await p.textContent('#ga-erg .big')).includes('492,21 €'), await p.textContent('#ga-erg .big'));
    ok(`${schema}: Grundsicherung im Alter: Betriebsrenten-Freibetrag als Grund`, /Betriebs-, Riester- oder private Rente/.test(await p.textContent('#ga-erg')));
    await axe('Grundsicherung im Alter mit Ergebnis');
    await p.selectOption('#ga-zahl', '2');
    ok(`${schema}: Paar zeigt Person 2`, await p.isVisible('#ga-rente2'));
    await p.selectOption('#ga-zahl', '1');
    // Bruttolohn freiwillig (§ 82 Abs. 3 SGB XII): Bescheid passt nur zur Netto-Lesart -> „prüfen“ mit Hinweis und Differenz, kein „zu wenig“
    await p.click('#ga-beispiel');
    await p.fill('#ga-zus1', ''); await p.uncheck('#ga-gr1'); await p.uncheck('#ga-g1');
    await p.fill('#ga-rente1', '600'); await p.fill('#ga-lohn1', '800'); await p.fill('#ga-b-g', ''); await p.fill('#ga-b-zahl', ''); await p.fill('#ga-b-eink', '1160');
    ok(`${schema}: Ohne Bruttolohn: Einkommen passt`, !/vom Netto berechnet/.test(await p.textContent('#ga-erg')), await p.textContent('#ga-erg'));
    await p.fill('#ga-lohnb1', '1000');
    const gaT = await p.textContent('#ga-erg');
    ok(`${schema}: Mit Bruttolohn: Hinweis Netto-Freibetrag mit 41,50 €`, /vom Netto berechnet/.test(gaT) && gaT.includes('41,50 €') && !/zu wenig/i.test(await p.textContent('#ga-erg .big')), gaT);
    await p.fill('#ga-b-eink', '1118.5');
    ok(`${schema}: Bescheid nach Brutto-Lesart: kein Hinweis`, !/vom Netto berechnet/.test(await p.textContent('#ga-erg')));
    await p.click('#ga-beispiel');
    await p.fill('#ga-datum', BESCHEID);
    await p.click('#ga-wid-mach');
    ok(`${schema}: Widerspruch Grundsicherung im Alter`, new RegExp('Grundsicherung im Alter und bei Erwerbsminderung vom ' + reD(BESCHEID)).test(await p.inputValue('#ga-wid-text')));
    // Wohngeld
    await p.click('#tab-wg');
    await p.click('#wg-beispiel');
    const wgBig = await p.textContent('#wg-erg .big');
    const wgSoll = await p.evaluate(() => { const r = BescheidWG.pruefe({ personen: 4, stufe: 4, bruttokalt: 800, mitglieder: [{ art: 'lohn', brutto: 2600, abzug: 30 }], bescheid: { miete: 800, einkommen: 1748.25, wohngeld: BescheidWG.ausBescheid(4, 800, 1748.25, Rules) } }, Rules); return r.zuWenigImMonat; });
    ok(`${schema}: Wohngeld-Beispiel: Anzeige = Rechnung (${wgBig})`, wgSoll > 0 && wgBig.includes(String(wgSoll).replace('.', ',')), { wgBig, wgSoll });
    ok(`${schema}: Wohngeld: Heizkostenkomponente als Grund`, /Heizkostenkomponente/.test(await p.textContent('#wg-erg')));
    await axe('Wohngeld mit Ergebnis');
    // Elterngeld-Zeile: Basiselterngeld oder ElterngeldPlus und Kinder dieser Geburt statt Pauschalabzug (Freibetrag § 10 BEEG)
    {
      await p.click('#wg-plus');
      const nr = await p.evaluate(() => { const t = [...document.querySelectorAll('#wg-mitglieder select[id^="wm-art-"]')].pop(); return t.id.slice(7); });
      await p.selectOption('#wm-art-' + nr, 'eg'); await p.fill('#wm-b-' + nr, '300');
      ok(`${schema}: Wohngeld: Elterngeld-Zeile zeigt Art und Kinder, kein Pauschalabzug`, await p.isVisible('#wm-eg-' + nr) && await p.isVisible('#wm-egk-' + nr) && !(await p.isVisible('#wm-abz-' + nr)));
      await p.selectOption('#wm-eg-' + nr, 'plus');
      const ein = await p.textContent('#wg-erg');
      const soll = await p.evaluate(() => BescheidWG.rechne({ personen: 4, stufe: 4, bruttokalt: 800, mitglieder: [{ art: 'lohn', brutto: 2600, abzug: 30 }, { art: 'eg', brutto: 300, egPlus: true, egKinder: 1 }] }, Rules).einkommen);
      ok(`${schema}: Wohngeld: ElterngeldPlus 300 € → 150 € Einkommen gerechnet`, ein.includes(String(soll.toFixed(2)).replace('.', ',')) || ein.includes(Number(soll).toLocaleString('de-DE', { minimumFractionDigits: 2 })), { soll });
      await p.click(`#wg-mitglieder tr:last-child button`);
    }
    await p.fill('#wg-datum', BESCHEID);
    await p.click('#wg-wid-mach');
    ok(`${schema}: Wohngeld-Widerspruch`, new RegExp('Widerspruch gegen den Wohngeldbescheid vom ' + reD(BESCHEID)).test(await p.inputValue('#wg-wid-text')));
    // Kinderzuschlag
    await p.click('#tab-kiz');
    ok(`${schema}: Kinderzuschlag ohne Kinder: Hinweis`, /Kinder eintragen/.test(await p.textContent('#kz-erg')));
    await p.click('#kz-beispiel');
    ok(`${schema}: Kinderzuschlag-Beispiel 112,05 € zu wenig`, (await p.textContent('#kz-erg .big')).includes('112,05 €'), await p.textContent('#kz-erg .big'));
    ok(`${schema}: Kinderzuschlag: Freibetrag als Grund`, /Freibetrag/.test(await p.textContent('#kz-erg')));
    await axe('Kinderzuschlag mit Ergebnis');
    await p.selectOption('#kz-zahl', '1');
    ok(`${schema}: ein Elternteil blendet Felder für Elternteil 2 aus`, !(await p.isVisible('#kz-b2')));
    await p.selectOption('#kz-zahl', '2');
    await p.fill('#kz-datum', BESCHEID);
    await p.click('#kz-wid-mach');
    ok(`${schema}: Kinderzuschlag-Widerspruch`, new RegExp('Widerspruch gegen den Bescheid über den Kinderzuschlag vom ' + reD(BESCHEID)).test(await p.inputValue('#kz-wid-text')) && /Familienkasse/.test(await p.inputValue('#kz-wid-text')));
    // Nebenkosten
    await p.click('#tab-nk');
    await p.click('#nk-beispiel');
    const nkT = await p.textContent('#nk-erg');
    ok(`${schema}: Nebenkosten: Nachzahlung 135, strittig 343, Guthaben 208`, /135,00 € Nachzahlung/.test(nkT) && /343,00 € sind strittig/.test(nkT) && /208,00 € Guthaben/.test(nkT), nkT.slice(0, 300));
    ok(`${schema}: Nebenkosten: Verwaltung und CO₂ beanstandet, Jobcenter-Hinweis`, /Verwaltungskosten/.test(nkT) && /CO₂/.test(nkT) && /Jobcenter übernehmen/.test(nkT));
    await axe('Nebenkosten mit Ergebnis');
    await p.click('#nk-ew-mach');
    ok(`${schema}: Einwände an den Vermieter`, /Betriebskostenabrechnung für den Zeitraum 01\.01\.2025 bis 31\.12\.2025/.test(await p.inputValue('#nk-text')) && /30\.06\.2027/.test(await p.textContent('#nk-info')));
    await p.click('#nk-au-mach');
    ok(`${schema}: Antrag an das Jobcenter`, /§ 22 Abs\. 1 SGB II/.test(await p.inputValue('#nk-text')));
    // Fristen
    await p.click('#tab-fristen');
    await p.fill('#fr-datum', BESCHEID);
    ok(`${schema}: Frist ${BIS}`, (await p.textContent('#fr-erg')).includes(BIS));
    await p.fill('#er-ende', '2027-06-30');
    ok(`${schema}: Erinnerung 19.05.2027`, (await p.textContent('#er-erg')).includes('19.05.2027'));
    await axe('Fristen');
    // Lizenz
    await p.click('#tab-lizenz');
    await p.click('#li-demo');
    await p.waitForFunction(() => document.querySelector('#li-erg .pill'));
    ok(`${schema}: Demo-Lizenz gültig`, (await p.textContent('#li-erg')).includes('Lizenz gültig'));
    const demo = JSON.parse(fs.readFileSync(path.join(ROOT, 'erweiterungen/demo-lizenz.json'), 'utf8')); demo.daten.bis = '2099-12-31';
    await p.setInputFiles('#li-datei', { name: 'lizenz.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(demo)) });
    await p.waitForFunction(() => /beschädigt/.test(document.getElementById('li-erg').textContent));
    ok(`${schema}: veränderte Lizenz abgelehnt`, true);
    await axe('Lizenz');
    // Tastatur: Pfeiltasten wechseln Reiter
    await p.focus('#tab-lizenz'); await p.keyboard.press('ArrowRight');
    ok(`${schema}: Pfeiltaste führt zum ersten Reiter`, await p.isVisible('#p-pflege'));
    // 320 px
    await p.setViewportSize({ width: 320, height: 640 });
    ok(`${schema}: 320 px ohne seitliches Scrollen`, await p.evaluate(() => document.documentElement.scrollWidth <= 320));
    ok(`${schema}: keine Skriptfehler`, fehler.length === 0, fehler);
    await ctx.close();
  }
  await b.close();
  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `\nVorschau Prüfpaket: alle ${n} Prüfungen bestanden`);
  process.exit(f ? 1 : 0);
})();
