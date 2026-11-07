const { chromium } = require('playwright');
const out = []; const ok = (n, c, x) => out.push((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : ' ' + (x || '')));
const file = process.argv[2] || (__dirname + '/../dist/leistungs-lotse.html');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, locale: 'de-DE', deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|ERR_INTERNET|fonts.g/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + file);
  const card = (name) => p.evaluate((nm) => { const c = [...document.querySelectorAll('#cards .card')].find((x) => x.querySelector('h3').textContent === nm); return c ? { pill: c.querySelector('.pill').className.replace('pill ', ''), text: c.querySelector('.body').textContent.replace(/\u00a0/g, ' '), zust: c.querySelector('.zust').textContent } : null; }, name);
  const sel = (id, v) => p.selectOption('#' + id, v);
  const fillNum = async (id, v) => { await p.fill('#' + id, v); await p.press('#' + id, 'Tab'); };
  await p.evaluate(() => document.getElementById('p2').click());
  await p.click('#p2');
  // Übersicht und Bedienung
  ok('GdB-Frage erst sichtbar, wenn eine Behinderung angegeben ist', !(await p.isVisible('#gdb')) && await p.isVisible('#bhPerson'));
  ok('Wartezeit-Frage erst bei eingeschränkter Arbeitsfähigkeit sichtbar', !(await p.isVisible('#em5')));
  ok('BAB-Fragen erst bei eigener Ausbildung sichtbar', !(await p.isVisible('#babBetrieb')));
  await sel('bhPerson', 'erwNach25');
  ok('Nach Auswahl: GdB sichtbar, Kindergeld-Frage (vor 25) nicht', await p.isVisible('#gdb') && !(await p.isVisible('#bhSelbst')));
  await sel('bhPerson', 'erwVor25');
  ok('Erwachsenes Kind: Frage zur eigenen Lebensführung sichtbar', await p.isVisible('#bhSelbst'));
  await sel('gdb', '50'); await sel('bhPerson', '');
  ok('Ausgeblendete Angaben werden zurückgesetzt', (await p.inputValue('#gdb')) === '');
  const ov = await p.evaluate(() => { const o = document.getElementById('overview'); const links = [...o.querySelectorAll('a')]; return { hidden: o.hidden, n: links.length, ziele: links.every((a) => document.querySelector(a.getAttribute('href'))) }; });
  ok('Schnellübersicht zeigt Treffer und jeder Link hat ein Ziel', !ov.hidden && ov.n >= 3 && ov.ziele, JSON.stringify(ov));
  const ordnung = await p.evaluate(() => { const t = document.getElementById('together'); const c = document.getElementById('cards'); return !t.innerHTML || (t.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING) > 0; });
  ok('Hinweise ("Beachten") stehen vor den Karten', ordnung);
  // neue Felder vorhanden und befüllt
  const opts = (id) => p.evaluate((i) => [...document.getElementById(i).options].map((o) => o.value + '|' + o.textContent), id);
  ok('GdB-Auswahl hat 11 Einträge', (await opts('gdb')).length === 11);
  ok('Person-Auswahl hat 4 Einträge', (await opts('bhPerson')).length === 4);
  ok('Alle Karten (21) da', (await p.locator('#cards .card').count()) === 21);

  // Fall 1: volljähriges Kind, Behinderung vor 25, GdB 100
  await sel('bhPerson', 'erwVor25'); await p.check('#bhSelbst'); await sel('gdb', '100');
  let c = await card('Kindergeld für erwachsene Kinder mit Behinderung');
  ok('Kindergeld-Beh: wahrscheinlich, 259 €', c && c.pill === 'ja' && /259 €/.test(c.text), JSON.stringify(c));
  c = await card('Behinderten-Pauschbetrag'); ok('Pauschbetrag 2.840 €', c && c.pill === 'ja' && /2\.840 €/.test(c.text), JSON.stringify(c));
  c = await card('Schwerbehindertenausweis und Nachteilsausgleiche'); ok('Ausweis wahrscheinlich, 5 Tage', c && c.pill === 'ja' && /5 Tage/.test(c.text), JSON.stringify(c));
  c = await card('Eingliederungshilfe'); ok('Eingliederungshilfe möglich', c && c.pill === 'vielleicht');
  ok('Kein Wert "undefined" auf der Seite', !(await p.evaluate(() => /undefined|NaN|\{\w+\}/.test(document.getElementById('cards').textContent))));

  // Fall 2: blind
  await sel('blind', 'blind');
  c = await card('Blindengeld (Bayern)'); ok('Blindengeld 809 €', c && c.pill === 'ja' && /809 €/.test(c.text), JSON.stringify(c));
  await sel('pflegegrad', '2'); c = await card('Blindengeld (Bayern)'); ok('Anrechnung 159,62 € bei Pflegegrad 2 (ZBFS)', /159,62 €/.test(c.text) && /649,38 €/.test(c.text), c.text);
  await sel('pflegegrad', '3'); c = await card('Blindengeld (Bayern)'); ok('Pflegegrad 3: 33 % von 599 € = 197,67 € (Art. 4 BayBlindG)', /197,67 €/.test(c.text), c.text);
  await sel('pflegegrad', '2');
  c = await card('Verhinderungspflege und Pflegehilfsmittel'); ok('Pflegehilfsmittel 42 € / 4.180 €', c.pill === 'ja' && /42 €/.test(c.text) && /4\.180 €/.test(c.text), c.text);
  await sel('blind', 'hoch'); c = await card('Blindengeld (Bayern)'); ok('Sehbehindertengeld 242,70 €, bei Pflegegrad 2 bleiben 83,08 €', /242,70 €/.test(c.text) && /83,08 €/.test(c.text), c.text); await sel('pflegegrad', '3');

  // Fall 3: Erwerbsminderungsrente
  await p.uncheck('#alter'); await sel('emStd', 'unter3');
  c = await card('Erwerbsminderungsrente'); ok('EM-Rente zunächst nur möglich (Wartezeit offen)', c.pill === 'vielleicht');
  await p.check('#em5'); c = await card('Erwerbsminderungsrente'); ok('EM-Rente mit Wartezeit wahrscheinlich', c.pill === 'ja');
  await p.check('#alter'); c = await card('Erwerbsminderungsrente'); ok('Regelaltersgrenze: keine EM-Rente', c.pill === 'nein'); await p.uncheck('#alter');

  // Fall 4: BAB
  await sel('ausbildung', 'ich'); await p.check('#babBetrieb'); c = await card('Berufsausbildungsbeihilfe'); ok('BAB ohne Wohn-Haken: unwahrscheinlich', c.pill === 'nein');
  await p.check('#babWohnt'); c = await card('Berufsausbildungsbeihilfe'); ok('BAB mit Wohn-Haken: möglich', c.pill === 'vielleicht');

  // Fall 5: WBS
  await fillNum('ek1Brutto', '1400'); c = await card('Wohnberechtigungsschein (Bayern)'); ok('WBS 1.400 € brutto allein (16.800 € im Jahr): wahrscheinlich, Grenze 17.500 €', c.pill === 'ja' && /17\.500 €/.test(c.text), c.text);
  await fillNum('ek1Brutto', '2000'); c = await card('Wohnberechtigungsschein (Bayern)'); ok('WBS 2.000 € brutto allein: möglich (nach Abzügen unter 17.500 €)', c.pill === 'vielleicht', c.text);
  await fillNum('ek1Brutto', '3000'); c = await card('Wohnberechtigungsschein (Bayern)'); ok('WBS 3.000 € brutto allein: möglich (nur mit Gebietsverordnung, bis 28.300 €)', c.pill === 'vielleicht' && /28\.300 €/.test(c.text), c.text);
  await fillNum('ek1Brutto', '5000'); c = await card('Wohnberechtigungsschein (Bayern)'); ok('WBS 5.000 € brutto allein: unwahrscheinlich', c.pill === 'nein');
  await fillNum('ek1Brutto', '2000');

  await p.click('#p1');
  ok('Beispiel 1: keine Gesundheits-Unterfragen offen', !(await p.isVisible('#gdb')) && !(await p.isVisible('#em5')));
  await p.click('#p2'); await sel('bhPerson', 'erwVor25'); await p.check('#bhSelbst'); await sel('gdb', '100'); await sel('blind', 'hoch'); await sel('emStd', 'unter3'); await p.check('#em5'); await sel('pflegegrad', '3');
  await sel('ausbildung', 'ich'); await p.check('#babBetrieb'); await p.check('#babWohnt'); await fillNum('ek1Brutto', '2000'); await p.uncheck('#alter');
    // Rundfunk
  await p.check('#b-sozialamt'); c = await card('Befreiung vom Rundfunkbeitrag'); ok('Rundfunk: Sozialamt bezogen => wahrscheinlich', c.pill === 'ja'); await p.uncheck('#b-sozialamt');

  // Mappe
  await p.fill('#p-name', 'Maria Muster'); await p.fill('#p-strasse', 'Hauptstr. 1'); await p.fill('#p-ort', '91054 Erlangen');
  const picks = await p.evaluate(() => [...document.querySelectorAll('[data-pick]')].map((x) => x.getAttribute('data-pick')));
  ok('Pauschbetrag erscheint nicht in der Mappenauswahl, Blindengeld schon', !picks.includes('pausch') && picks.includes('blindengeld') && picks.includes('kgBeh'), picks.join());
  await p.evaluate(() => document.querySelectorAll('[data-pick]').forEach((x) => { if (!x.checked) x.click(); }));
  await p.click('#mappeMake');
  const txt = await p.inputValue('#mappeText');
  ['Antrag auf Kindergeld für ein volljähriges Kind mit Behinderung', 'Rente wegen Erwerbsminderung', 'Blindengeld nach dem Bayerischen Blindengeldgesetz', 'Wohnberechtigungsschein', 'Berufsausbildungsbeihilfe', 'Eingliederungshilfe', 'Feststellung der Behinderung'].forEach((s) => ok('Mappe enthält "' + s + '"', txt.includes(s)));
  ok('Mappe ohne "undefined"', !/undefined|NaN/.test(txt));
  ok('Angabenblatt nennt GdB und Sehbehinderung', /Grad der Behinderung 100/.test(txt) && /hochgradig sehbehindert/.test(txt) && /weniger als 3 Stunden/.test(txt), txt.slice(-700));
  await p.screenshot({ path: require('os').tmpdir() + '/shot-beh-mappe.png' });
  await p.click('#mappeClose');

  // Sprachen: Felder und Karten ohne Rohschlüssel; RTL
  for (const l of ['en', 'tr', 'ar', 'ru', 'uk', 'pl', 'ro', 'de']) {
    await p.selectOption('#lang', l);
    const bad = await p.evaluate(() => {
      const t = document.body.innerText; const m = t.match(/\b(bh|cb|lg|t|s|u|zu|n|h)\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?\b/g) || [];
      return [...new Set(m.filter((x) => !/^(bzfs|www)/.test(x)))].slice(0, 8);
    });
    ok('Sprache ' + l + ': keine Rohschlüssel sichtbar', bad.length === 0, bad.join(','));
    const labs = await p.evaluate(() => ['bhPerson', 'gdb', 'blind', 'emStd'].every((i) => [...document.getElementById(i).options].every((o) => o.textContent.trim().length > 0)));
    ok('Sprache ' + l + ': alle Auswahlfelder beschriftet', labs);
    const cut = await p.evaluate(() => { const out = []; const sp = document.createElement('span'); sp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; document.body.appendChild(sp);
      document.querySelectorAll('select').forEach((s) => { if (s.id === 'lang' || !s.clientWidth) return; const cs = getComputedStyle(s); sp.style.font = cs.font; const avail = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 4;
        [...s.options].forEach((o) => { sp.textContent = o.textContent; if (sp.offsetWidth > avail) out.push(s.id + ': ' + o.textContent); }); }); sp.remove(); return out; });
    ok('Sprache ' + l + ': keine abgeschnittenen Auswahl-Einträge (390 px)', cut.length === 0, cut.join(' | '));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok('Sprache ' + l + ': kein seitliches Scrollen bei 390 px', ov <= 1, ov);
    if (l === 'ar') {
      const dir = await p.evaluate(() => document.getElementById('app').getAttribute('dir'));
      ok('Arabisch: Richtung rtl', dir === 'rtl');
      const euro = await p.evaluate(() => { const t = document.getElementById('cards').textContent; return /⁦[\d.,]+[\s\u00a0]€⁩/.test(t); });
      ok('Arabisch: Beträge sind als Einheit isoliert', euro);
      await p.screenshot({ path: require('os').tmpdir() + '/shot-beh-ar.png', fullPage: false });
    }
  }
  ok('Keine Konsolen- oder Skriptfehler', errs.length === 0, errs.join(' | '));
  await b.close(); console.log(out.join('\n')); process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
})().catch((e) => { console.log(out.join('\n')); console.log('ABSTURZ', e.message); process.exit(1); });
