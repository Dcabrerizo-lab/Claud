// Browsertest der einfachen Version (Leichte Sprache): Durchlauf, Ergebnisse, Sprachen, Speichern, Zurück, Antragsmappe
const { chromium } = require('playwright');
const out = []; const ok = (n, c, x) => out.push((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : ' ' + (x || '')));
const file = process.argv[2] || (__dirname + '/../dist/leistungs-lotse.html');

// Antworten nacheinander geben: Zahl (string mit #) oder Knopf (data-es) oder Buchstaben-Liste (mz:...)
async function durchlauf(p, antworten) {
  for (const a of antworten) {
    if (a.startsWith('#')) { await p.fill('#es-in', a.slice(1)); await p.click('#es-weiter'); }
    else if (a === 'skip') await p.click('#es-skip');
    else if (a.startsWith('mz:')) { const l = a.slice(3).split(',').filter(Boolean); for (const m of l) await p.click('[data-mz="' + m + '"]'); await p.click(l.length ? '#es-weiter' : '#es-keine'); }
    else if (a.startsWith('schon:')) { const l = a.slice(6).split(',').filter(Boolean); for (const m of l) await p.click('[data-schon="' + m + '"]'); await p.click(l.length ? '#es-weiter' : '#es-nichts'); }
    else { await p.click('[data-es="' + a + '"]'); await p.waitForTimeout(450); } // Auswahl wird kurz gezeigt, dann geht es weiter
  }
}
const ergebnis = (p) => p.evaluate(() => {
  const k = [...document.querySelectorAll('#einfach .es-karte')].map((c) => ({ name: c.querySelector('h3').textContent.trim(), lvl: c.className.replace('es-karte ', ''), geld: (c.querySelector('.es-geld') || {}).textContent || '' }));
  return { k, text: document.getElementById('einfach').innerText };
});

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + file);

  ok('Knopf „Einfache Sprache“ sichtbar', await p.isVisible('#einfachBtn'));
  await p.click('#einfachBtn');
  ok('Einfache Version zeigt eine Frage, ausführliches Formular ausgeblendet', await p.isVisible('#es-q') && !(await p.isVisible('#form')));
  ok('Erste Frage: Geburtsjahr', /geboren/.test(await p.textContent('#es-q')));
  // Ungültige Eingabe
  await p.fill('#es-in', '19'); await p.click('#es-weiter');
  ok('Ungültiges Geburtsjahr: Hinweis, bleibt auf der Frage', await p.isVisible('#es-warn') && /geboren/.test(await p.textContent('#es-q')));

  // Fall A: 36 Jahre, bei den Eltern ohne Miete, Werkstatt 250 €, Mittagessen, keine Rente, Ausweis 80 + G, seit Kindheit, Pflegegrad 2, wenig Erspartes, PLZ Regensburg
  await durchlauf(p, ['#1990', 'eltern', 'nein', 'werkstatt', '#250', 'ja', 'unter20', 'nein', 'ja', '80', 'mz:G', 'ja', '2', 'schon:', 'wenig', '#93047']);
  let e = await ergebnis(p);
  const karte = (n) => e.k.find((x) => x.name.includes(n));
  ok('A: Grundsicherung „Gute Chance“, mindestens 590 €', karte('Grundsicherung') && karte('Grundsicherung').lvl === 'ja' && /mindestens 590/.test(karte('Grundsicherung').geld), JSON.stringify(e.k));
  ok('A: Pflegegeld 347 €', karte('Pflegegeld') && /347/.test(karte('Pflegegeld').geld));
  ok('A: Kindergeld für die Eltern 259 €', karte('Kindergeld') && /259/.test(karte('Kindergeld').geld));
  ok('A: Ausweis steht unter „Das hast du schon“', /Das hast du schon[\s\S]*Ausweis/.test(e.text) && !karte('Ausweis'));
  ok('A: kein Steuer-Freibetrag (keine Steuern)', !karte('Steuer'));
  ok('A: kein Wohngeld und kein Jobcenter', !karte('Wohngeld') && !karte('Jobcenter'));
  ok('A: Sozialamt Regensburg mit Anschrift', /Stadt Regensburg[\s\S]*Rathausplatz/.test(e.text));
  ok('A: Hinweis auf Hilfe durch Betreuer', /Betreuer/.test(e.text));
  ok('A: Tipp Wohnkosten bei den Eltern und Mittagessen', /Teil der Wohnkosten/.test(e.text) && /Mittag/.test(e.text));
  ok('A: Tipp Wertmarke (G, mit Grundsicherung kostenlos) und Kindergeld-Antrag durch die Eltern', /Wertmarke/.test(e.text) && /Antrag auf Kindergeld stellen deine Eltern/.test(e.text));
  // Antragsmappe: nur passende Briefe vorausgewählt, ausführliche Angaben bleiben unverändert
  await p.click('#es-mappe');
  const picks = await p.evaluate(() => [...document.querySelectorAll('[data-pick]')].filter((x) => x.checked).map((x) => x.getAttribute('data-pick')));
  ok('A: Mappe wählt Grundsicherung und Kindergeld vor, keinen Wohnberechtigungsschein', picks.includes('gsa') && picks.includes('kgBeh') && !picks.includes('wbs'), picks.join());
  const txt = await p.inputValue('#mappeText');
  ok('A: Brief an das Sozialamt mit Werkstatt und Eltern im Angabenblatt', /Grundsicherung im Alter und bei Erwerbsminderung/.test(txt) && /Werkstatt/.test(txt) && /Wohnt bei den Eltern/.test(txt));
  await p.click('#mappeClose');
  ok('A: Zurück in der einfachen Version', await p.isVisible('#einfach'));
  // Mappe ist sichtbar (nicht unter dem Ergebnis versteckt)
  await p.click('#es-mappe');
  ok('A: Mappe sichtbar, Ergebnis der einfachen Version ausgeblendet', await p.isVisible('#h-mappe') && !(await p.isVisible('#einfach')));
  await p.click('#mappeClose');

  // Speichern: nach Neuladen weiter in der einfachen Version beim Ergebnis
  await p.reload(); await p.waitForTimeout(300);
  ok('Nach Neuladen: einfache Version und Ergebnis noch da', await p.isVisible('#einfach') && /Das kannst du bekommen/.test(await p.textContent('#einfach')));

  // Plausibilität: Werkstattlohn 810 € wird einmal nachgefragt
  await p.click('#es-neu');
  await durchlauf(p, ['#1990', 'eltern', 'nein', 'werkstatt']);
  await p.fill('#es-in', '810'); await p.click('#es-weiter');
  ok('810 € Werkstattlohn: Rückfrage, bleibt auf der Frage', /Stimmt das/.test(await p.textContent('#es-warn')) && /Geld/.test(await p.textContent('#es-q')));
  await p.click('#es-weiter');
  ok('Zweites Weiter übernimmt die Zahl', !/Wie viel Geld/.test(await p.textContent('#es-q')));
  await p.click('#es-zurueck'); await p.fill('#es-in', '250'); await p.click('#es-weiter');
  await durchlauf(p, ['ja', 'unter20', 'nein', 'ja', '80']);
  await p.click('#es-weiter');
  ok('Buchstaben: Weiter ohne Auswahl fragt nach „Keine Buchstaben“', await p.isVisible('.es-frag'));
  await p.click('#es-keine');
  await durchlauf(p, ['ja', '2', 'schon:', 'wenig', '#93047']);
  // Zurück-Knopf
  await p.click('#es-zurueck');
  ok('Zurück vom Ergebnis: letzte Frage (Postleitzahl)', /Postleitzahl/.test(await p.textContent('#es-q')));

  // Fall B: 30 Jahre, eigene Wohnung 500 €, Lohn 2.500 € auf dem allgemeinen Arbeitsmarkt, kann viel arbeiten, kein Ausweis
  await p.click('#es-neu').catch(() => {});
  await p.click('#es-weiter').catch(() => {});
  await p.evaluate(() => { localStorage.clear(); });
  await p.click('#es-raus'); await p.click('#einfachBtn');
  // „Neu anfangen“ gibt es auf dem Ergebnis; hier frisch über Zurück bis zur ersten Frage
  for (let i = 0; i < 20 && !(await p.isVisible('#es-in') && /geboren/.test(await p.textContent('#es-q'))); i++) { if (await p.isVisible('#es-zurueck')) await p.click('#es-zurueck'); else break; }
  await durchlauf(p, ['#1996', 'allein', '#500', 'job', '#2500', 'nein', 'nein', 'nein', 'nein', 'schon:', 'wenig', 'skip']);
  e = await ergebnis(p);
  ok('B: Gutes Einkommen ohne Behinderung: keine Grundsicherung als „Gute Chance“', !e.k.some((x) => /Grundsicherung/.test(x.name) && x.lvl === 'ja'), JSON.stringify(e.k));
  await p.click('#es-neu');
  ok('Neu anfangen: erste Frage', /geboren/.test(await p.textContent('#es-q')));

  // Fall C: Rentenalter (1950), Wohnheim, Rente 600 €, Ausweis 100 + H
  await durchlauf(p, ['#1950', 'heim', 'nein', 'ja', '#600', 'ja', '100', 'mz:H', 'nein', '3', 'schon:', 'wenig', 'skip']);
  e = await ergebnis(p);
  // 600 € liegen über dem Regelsatz im Wohnheim (Stufe 2: 506 €); die Wohnkosten des Heims kennt die App nicht -> „Vielleicht“
  ok('C: Wohnheim, Rente 600 €: Grundsicherung „Vielleicht“ (Wohnkosten des Heims offen)', karte('Grundsicherung') && karte('Grundsicherung').lvl === 'vielleicht', JSON.stringify(e.k));
  ok('C: Pflegegrad 3: Pflegegeld 599 €', karte('Pflegegeld') && /599/.test(karte('Pflegegeld').geld));
  await p.click('#es-neu');
  await durchlauf(p, ['#1950', 'heim', 'nein', 'ja', '#400', 'ja', '100', 'mz:', 'nein', '3', 'schon:', 'wenig', 'skip']);
  e = await ergebnis(p);
  ok('C2: Wohnheim, Rente 400 €: Grundsicherung „Gute Chance“, mindestens 110 €', karte('Grundsicherung') && karte('Grundsicherung').lvl === 'ja' && /mindestens 110/.test(karte('Grundsicherung').geld), JSON.stringify(e.k));
  ok('C: keine Frage nach eingeschränkter Arbeit im Rentenalter, keine Erwerbsminderungsrente', !karte('Erwerbsminderung'));

  // Sprachen: kein Rohschlüssel, alle Knöpfe beschriftet, Arabisch rechts nach links
  await p.click('#es-neu');
  for (const l of ['en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'de']) {
    await p.click('#es-raus'); await p.selectOption('#lang', l); await p.click('#einfachBtn');
    const t = await p.textContent('#einfach');
    ok('Sprache ' + l + ': keine Rohschlüssel in der einfachen Version', !/\b(es|einfach)\.[a-zA-Z]+/.test(t), t.slice(0, 120));
    if (l === 'ar') ok('Arabisch: rtl', (await p.evaluate(() => document.getElementById('app').getAttribute('dir'))) === 'rtl');
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok('Sprache ' + l + ': kein seitliches Scrollen', ov <= 1, ov);
  }
  // Große Knöpfe (mindestens 56 px hoch) bei einer Auswahlfrage
  await durchlauf(p, ['#1980']);
  const hoehe = await p.evaluate(() => Math.min(...[...document.querySelectorAll('.es-btn')].map((x) => x.getBoundingClientRect().height)));
  ok('Antwort-Knöpfe sind groß (mindestens 56 px)', hoehe >= 56, hoehe);
  await p.screenshot({ path: require('os').tmpdir() + '/shot-einfach.png' });
  // Veraltete Regeln: ab dem nächsten Stichtag (1.1.2027) ein deutlicher Hinweis
  const c2 = await b.newContext({ locale: 'de-DE' });
  await c2.addInitScript(() => { const D = Date; const fest = new D('2027-02-01T10:00:00').getTime(); window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [fest])); } static now() { return fest; } }; });
  const p2 = await c2.newPage(); await p2.goto('file://' + file);
  ok('Ab 2027: Hinweis „Regeln veraltet“ sichtbar', await p2.isVisible('#altNotice') && /aktualisieren/.test(await p2.textContent('#altNotice')));
  await c2.close();
  ok('Keine Skriptfehler', errs.length === 0, errs.join(' | '));
  await b.close();
  console.log(out.join('\n'));
  const f = out.filter((x) => x.startsWith('FAIL')).length;
  console.log(f ? '\n' + f + ' FEHLER' : '\nEinfache Version: alle ' + out.length + ' Prüfungen bestanden');
  process.exit(f ? 1 : 0);
})().catch((e) => { console.log('ABSTURZ', e.message); process.exit(1); });
