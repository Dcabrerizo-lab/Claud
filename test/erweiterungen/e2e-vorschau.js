// Browser-Test der Vorschau (dist/solo-pruefpaket-vorschau.html). Nicht Teil von npm test der App 1.2.0.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');
const axePfad = require.resolve('axe-core/axe.min.js');
const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'dist', 'sozialleistungslotse.html');
let n = 0, f = 0;
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
    ok(`${schema}: Kind: Frühförderung sichtbar`, await p.isVisible('#pf-zeile-5K'));
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
    await p.fill('#pf-datum', '2026-11-16');
    await p.locator('#pf-wid-liste textarea').first().fill('Sie braucht jeden Tag Hilfe.').catch(() => {});
    await p.click('#pf-wid-mach');
    const wt = await p.inputValue('#pf-wid-text');
    ok(`${schema}: Pflege-Widerspruch erstellt`, /Widerspruch gegen den Bescheid über die Feststellung des Pflegegrades vom 16\.11\.2026/.test(wt));
    ok(`${schema}: eingeschleuster Code nur als Text`, wt.includes('<img src=x') && !(await p.evaluate(() => window.__x)));
    ok(`${schema}: Frist angezeigt`, /21\.12\.2026/.test(await p.textContent('#pf-frist')));
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
    await p.fill('#bs-datum', '2026-11-16');
    await p.click('#bs-wid-mach');
    const bt = await p.inputValue('#bs-wid-text');
    ok(`${schema}: Bescheid-Widerspruch mit beiden Gründen`, /Mehrbedarf für Alleinerziehende/.test(bt) && /Angerechnetes Einkommen/.test(bt));
    await p.click('[aria-label="Person 2 entfernen"], #bs-personen tr:nth-child(2) button');
    ok(`${schema}: Person entfernen rechnet neu`, !(await p.textContent('#bs-erg')).includes('163,12'));
    // Fristen
    await p.click('#tab-fristen');
    await p.fill('#fr-datum', '2026-11-16');
    ok(`${schema}: Frist 21.12.2026`, (await p.textContent('#fr-erg')).includes('21.12.2026'));
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
