// Barrierefreiheit (axe-core, WCAG 2.2 AA + Best Practice; Tippflächen mind. 44 px nach Apple/Google): Startseite, Brief prüfen, ausführliche Version (leer, mit Beispiel, Arabisch), Antragsmappe, einfache Version
const { chromium } = require('playwright');
// Leistungs-Check: Weg „Alles auf einer Seite“ vorwählen (sonst erscheint zuerst die Auswahl Schritt für Schritt / Alles auf einer Seite)
const SF_ALLES = () => { try { if (!localStorage.getItem('lotse.checkWeg')) { localStorage.setItem('lotse.checkWeg', 'alles'); localStorage.setItem('CapacitorStorage.lotse.checkWeg', 'alles'); } } catch (e) {} };
const axePfad = require.resolve('axe-core/axe.min.js');
const file = process.argv[2] || (__dirname + '/../dist/sozialleistungslotse.html');
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const schema of ['light', 'dark']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', colorScheme: schema })).newPage(); await p.addInitScript(SF_ALLES);
    await p.goto('file://' + file);
    const pruefe = async (name) => {
      await p.addScriptTag({ path: axePfad });
      const r = await p.evaluate(async () => {
        const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, beispiel: v.nodes.slice(0, 2).map((x) => x.target.join(' ') + ' | ' + (x.failureSummary || '').split('\n').slice(1, 2).join('')) }));
      });
      // Tippflächen: jedes Bedienelement mind. 44 x 44 px (Apple HIG 44 pt, Material 48 dp; WCAG 2.5.5); Häkchen zählen mit ihrer Beschriftung, Links im Fließtext sind ausgenommen
      const klein = await p.evaluate(() => [...document.querySelectorAll('button, a[href], input, select, summary')].filter((el) => {
        const cs = getComputedStyle(el); const rc = el.getBoundingClientRect();
        if (!rc.width || !rc.height || cs.visibility === 'hidden' || el.closest('[hidden]')) return false;
        if (el.type === 'checkbox' || el.type === 'radio') { const l = el.closest('label') || (el.id && document.querySelector('label[for="' + el.id + '"]')); if (l && l.getBoundingClientRect().height >= 44) return false; if (el.closest('.seg')) return false; }
        if (el.tagName === 'A' && cs.display === 'inline') return false;
        if (el.closest('#mappeBody')) return false; // Druckseiten
        return rc.height < 43.5;
      }).map((el) => (el.id || el.tagName) + ' ' + Math.round(el.getBoundingClientRect().height) + 'px'));
      if (klein.length) r.push({ id: 'tippflaeche-44', impact: 'serious', n: klein.length, beispiel: klein.slice(0, 5) });
      out.push({ name: schema + ': ' + name, r });
    };
    await pruefe('Startseite');
    await p.click('#goBriefe'); await pruefe('Brief prüfen');
    await p.click('#brief-pk'); await pruefe('Brief prüfen: Wahl scannen, einfügen, selbst eingeben'); await p.click('#elSelbst'); await p.evaluate(() => document.getElementById('pf-beispiel').click()); await pruefe('Brief prüfen: Pflegegutachten');
    await p.click('#briefZurueck'); await p.click('#brief-vm'); await pruefe('Brief prüfen: Nebenkosten'); await p.click('#briefZurueck');
    await p.click('#appnav [data-ansicht=start]'); await p.click('#goLeistungen');
    await pruefe('Leistungen (leer)');
    await p.click('#paStart'); await pruefe('Pflegegrad: Alter');
    await p.fill('#pa-jahre', '80'); await p.click('text=Weiter ➜'); await p.click('#pflegeAssist .es-btn >> nth=0');
    await pruefe('Pflegegrad: Frage mit Erklärung');
    for (let i = 0; i < 6; i++) { const q = await p.textContent('#pa-q'); if (/Wahrscheinlich/.test(q)) break; await p.click(/Probleme|Hilfe|Verhalten|Arme und beide Beine/.test(q) ? '#pflegeAssist .es-btn >> nth=1' : '#pflegeAssist .es-btn >> nth=2'); }
    for (let i = 0; i < 40 && !/Wahrscheinlich/.test(await p.textContent('#pa-q')); i++) await p.click('#pflegeAssist .es-btn >> nth=1');
    await pruefe('Pflegegrad: Ergebnis');
    // Ergebnisseite (#63): Textlink zurück in den Leistungs-Check, dort öffnet sich die Pflege-Karte; Erklärseite über deren Link
    await p.click('#pflegeAssist .pa-links button:has-text("Zurück zum Leistungs-Check")'); await p.evaluate(() => { localStorage.removeItem('lotse.pflegecheck'); });
    await p.evaluate(() => document.querySelector('#c-pflege .pi-link').click()); await pruefe('Erklärseite Pflege'); await p.click('#piZurueck');
    await p.evaluate(() => document.getElementById('p1').click());
    await pruefe('Beispiel 1 mit Ergebnis');
    await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'ar'); await pruefe('Arabisch'); await p.evaluate((x) => { const s = document.getElementById('lang'); s.value = x; s.dispatchEvent(new Event('change', { bubbles: true })); }, 'de');
    await p.click('#mappeMake'); await pruefe('Antragsmappe'); await p.click('#mappeClose');
    await p.click('#appnav [data-ansicht=ordner]'); await pruefe('Mein Ordner');
    await p.click('#vgPlus'); await pruefe('Mein Ordner: + Weiteren Vorgang anlegen');
    await p.click('#appnav [data-ansicht=einst]'); await pruefe('Einstellungen');
    for (const z of ['anzeige', 'sicher', 'fach', 'about']) { await p.click('#einstListe .zeile[data-seite=' + z + ']'); await pruefe('Einstellungen: ' + z); await p.click('#es-' + z + ' .us-zurueck'); }
    await p.click('#appnav [data-ansicht=start]'); await p.click('#goLeistungen');
    // Selbsttest: ein Feld ohne Beschriftung muss gemeldet werden (sonst prüft der Test nichts)
    if (schema === 'light') {
      await p.evaluate(() => { const i = document.createElement('input'); i.id = 'a11y-selbsttest'; document.getElementById('form').appendChild(i); });
      await p.addScriptTag({ path: axePfad });
      const gefunden = await p.evaluate(async () => (await window.axe.run(document.getElementById('a11y-selbsttest').parentNode, { runOnly: ['label'] })).violations.length > 0);
      out.push({ name: 'Selbsttest: fehlende Beschriftung wird erkannt', r: gefunden ? [] : [{ id: 'selbsttest', impact: 'kritisch', n: 1, beispiel: ['axe hat das unbeschriftete Feld nicht gemeldet'] }] });
      await p.evaluate(() => document.getElementById('a11y-selbsttest').remove());
    }
    await p.evaluate(() => document.getElementById('einfachBtn').click()); await pruefe('Einfache Version: Frage');
    await p.fill('#es-in', '1990'); await p.click('#es-weiter'); await pruefe('Einfache Version: Auswahl');
    for (const a of ['eltern', 'nein', 'werkstatt']) { await p.click('[data-es="' + a + '"]'); await p.waitForTimeout(450); }
    await p.fill('#es-in', '250'); await p.click('#es-weiter');
    for (let i = 0; i < 15 && await p.isVisible('#es-q') && !(/bekommen|Passendes/.test(await p.textContent('#es-q'))); i++) {
      if (await p.isVisible('#es-skip')) await p.click('#es-skip');
      else if (await p.isVisible('#es-keine')) await p.click('#es-keine');
      else if (await p.isVisible('#es-nichts')) await p.click('#es-nichts');
      else if (await p.isVisible('[data-es="nein"]')) await p.click('[data-es="nein"]');
      else if (await p.isVisible('[data-es]')) await p.click('[data-es] >> nth=0');
      else if (await p.isVisible('#es-weiter')) await p.click('#es-weiter');
      await p.waitForTimeout(450);
    }
    await pruefe('Einfache Version: Ergebnis');
  }
  await b.close();
  let fehler = 0;
  out.forEach((x) => {
    if (!x.r.length) { console.log('ok   ' + x.name); return; }
    fehler += x.r.length;
    console.log('FAIL ' + x.name); x.r.forEach((v) => console.log('     ' + v.id + ' (' + v.impact + ', ' + v.n + 'x): ' + v.beispiel.join(' || ')));
  });
  console.log(fehler ? '\n' + fehler + ' Barrierefreiheits-Probleme' : '\nBarrierefreiheit (WCAG 2.2 AA, Best Practice, Tippflächen 44 px, axe-core): keine Probleme gefunden');
  process.exit(fehler ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
