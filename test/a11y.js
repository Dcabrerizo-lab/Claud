// Barrierefreiheit (axe-core, WCAG 2.1 AA): ausführliche Version (leer, mit Beispiel, Arabisch), Antragsmappe, einfache Version
const { chromium } = require('playwright');
const axePfad = require.resolve('axe-core/axe.min.js');
const file = process.argv[2] || (__dirname + '/../dist/leistungs-lotse.html');
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const schema of ['light', 'dark']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', colorScheme: schema })).newPage();
    await p.goto('file://' + file);
    const pruefe = async (name) => {
      await p.addScriptTag({ path: axePfad });
      const r = await p.evaluate(async () => {
        const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
        return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, beispiel: v.nodes.slice(0, 2).map((x) => x.target.join(' ') + ' | ' + (x.failureSummary || '').split('\n').slice(1, 2).join('')) }));
      });
      out.push({ name: schema + ': ' + name, r });
    };
    await pruefe('Start (leer)');
    await p.click('#p1'); await pruefe('Beispiel 1 mit Ergebnis');
    await p.selectOption('#lang', 'ar'); await pruefe('Arabisch'); await p.selectOption('#lang', 'de');
    await p.click('#mappeMake'); await pruefe('Antragsmappe'); await p.click('#mappeClose');
    // Selbsttest: ein Feld ohne Beschriftung muss gemeldet werden (sonst prüft der Test nichts)
    if (schema === 'light') {
      await p.evaluate(() => { const i = document.createElement('input'); i.id = 'a11y-selbsttest'; document.getElementById('form').appendChild(i); });
      await p.addScriptTag({ path: axePfad });
      const gefunden = await p.evaluate(async () => (await window.axe.run(document.getElementById('a11y-selbsttest').parentNode, { runOnly: ['label'] })).violations.length > 0);
      out.push({ name: 'Selbsttest: fehlende Beschriftung wird erkannt', r: gefunden ? [] : [{ id: 'selbsttest', impact: 'kritisch', n: 1, beispiel: ['axe hat das unbeschriftete Feld nicht gemeldet'] }] });
      await p.evaluate(() => document.getElementById('a11y-selbsttest').remove());
    }
    await p.click('#einfachBtn'); await pruefe('Einfache Version: Frage');
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
  console.log(fehler ? '\n' + fehler + ' Barrierefreiheits-Probleme' : '\nBarrierefreiheit (WCAG 2.1 AA, axe-core): keine Probleme gefunden');
  process.exit(fehler ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
