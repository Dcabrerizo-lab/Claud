// Energiekosten-Check in der echten Oberfläche (dist, JSDOM): Knopf nur unter „Strom und Gas“, Ergebnis vor den Eingaben,
// Gas-Reiter nur mit eigenem Gasvertrag, Abschlag in den Plan, Warmwasser als gemeinsames Feld mit dem Check (Rückfrage),
// Texte je nach Leistung, Brief, Hinweis im Plan, Fehler, Speichern über den Vorgangswechsel, Sprachen ohne Rohschlüssel.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
const mem = {}; const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
  beforeParse(w) {
    w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
    w.addEventListener('error', (e) => errors.push(e.message));
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const setze = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const haken = (id, an) => { const e = $(id); e.checked = an; e.dispatchEvent(new w.Event('change', { bubbles: true })); };
const klick = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const tx = (e) => e.textContent.replace(/[  ]/g, ' ');
const knopf = (text, wurzel) => [...(wurzel || d).querySelectorAll('button')].find((b) => b.textContent.trim() === text);
const zumPlan = () => { klick($('goSparen')); klick([...d.querySelectorAll('#spInhalt button.weg')].find((b) => /Haushaltsplan|Budget|bütçe|Qorshaha|بودجه|الميزانية/i.test(b.textContent)) || [...d.querySelectorAll('#spInhalt button.weg')].pop()); };
const gespeichert = () => JSON.parse(mem['lotse.haushalt'] || '{}');
const iso = (tageZurueck) => { const x = new Date(); x.setDate(x.getDate() - tageZurueck); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
setTimeout(() => {
  try {
    w.__solo.lang('de');
    w.__solo.set({ adults: 1, kids: 0, miete: 500, heizkosten: 60, plz: '90542', bezug: { grundsicherungsgeld: true } });
    zumPlan();
    check('Kein Energie-Knopf, solange „Strom und Gas“ zu ist', !$('hb-en-knopf'));
    klick($('hb-kat-miete')); check('Kein Energie-Knopf bei anderer Kategorie', !$('hb-en-knopf'));
    klick($('hb-kat-energie'));
    check('Knopf unter „Strom und Gas“', !!$('hb-en-knopf') && $('hb-en-knopf').getAttribute('aria-expanded') === 'false' && /Abschlag prüfen/.test($('hb-en-knopf').textContent));
    check('Keine neue Startkachel', !d.querySelector('.sk-energie'));
    klick($('hb-en-knopf'));
    check('Box offen, Fokus auf Überschrift', !!$('hbEnergie') && d.activeElement === $('hb-en-h') && $('hb-en-knopf').getAttribute('aria-expanded') === 'true');
    check('Ergebnis steht vor den Eingaben (aria-live)', !!($('hbEnErgebnis').compareDocumentPosition($('hb-en-a')) & w.Node.DOCUMENT_POSITION_FOLLOWING) && $('hbEnErgebnis').getAttribute('aria-live') === 'polite');
    check('Ohne Gasvertrag kein Gas-Reiter', !$('hb-en-tab-gas'));
    // Abschlag → Plan (Feld leer: direkt übernommen)
    setze('hb-en-a', '65');
    check('Abschlag in den Plan übernommen', gespeichert().plan.aus.energie === 6500 && gespeichert().energie.strom.a === 6500, gespeichert().plan);
    check('Ohne Verbrauch: „fehlt noch“, keine Nachzahlung', /fehlt noch/.test(tx($('hbEnErgebnis'))) && !/Nachzahlung/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-z1', '10000'); setze('hb-en-d1', iso(100)); setze('hb-en-z2', '10500'); setze('hb-en-d2', iso(10));
    check('Mit Durchschnittspreis: Schätzung direkt unter dem Ergebnis', /Durchschnittspreis 37,97 Cent/.test(tx($('hbEnErgebnis'))) && /2\.028 kWh/.test(tx($('hbEnErgebnis'))), tx($('hbEnErgebnis')));
    check('Schätzung: kein Brief, kein Plan-Hinweis', !$('hb-en-brief') && !$('hb-hw-energie'));
    setze('hb-en-ap', '36,5');
    check('Grundpreis fehlt: Hinweis', /Grundpreis fehlt/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-gp', '12');
    const erg = d.querySelector('.hb-en-erg');
    check('Nachzahlung möglich: ungefähr 104 €', erg.classList.contains('nach') && /Möglich: Nachzahlung von ungefähr 104 €/.test(tx(erg)), tx(erg));
    check('Vorschlag 74 € im Monat', /Passender Abschlag: etwa 74 €/.test(tx($('hbEnErgebnis'))));
    check('Vergleich mit dem Durchschnitt (1 Person), ohne Urteil', /Ein Haushalt mit 1 Person braucht im Schnitt etwa 2\.105 kWh/.test(tx($('hbEnErgebnis'))) && /stromspiegel\.de/.test(tx($('hbEnErgebnis'))));
    check('Plan-Hinweis bei belastbarer Nachzahlung', !!$('hb-hw-energie') && /104 €/.test(tx($('hb-hw-energie'))));
    klick($('hb-en-brief'));
    check('Brief: erhöhen, ohne Paragraf, mit Zählerstand', /erhöhen/.test($('hb-en-briefText').value) && !/§/.test($('hb-en-briefText').value) && /10500 kWh/.test($('hb-en-briefText').value) && d.activeElement === $('hb-en-briefText'));
    // Texte je nach Leistung
    const nz = d.querySelector('.hb-en-nz');
    check('Grundsicherungsgeld: Strom aus dem Regelbedarf, Darlehen erst nach Raten', !!nz && /im Regelbedarf enthalten/.test(nz.textContent) && /Regelbedarf ist für Strom/.test(nz.textContent));
    check('Ohne Paragrafen außerhalb des Beratungsmodus', !/§/.test(nz.textContent));
    check('Sperre-Abschnitt mit Abwendungsvereinbarung', /Abwendungsvereinbarung/.test(d.querySelector('.hb-en-sperre').textContent));
    // Gasvertrag: Reiter, Heizkosten-Text
    setze('hb-en-heiz', 'gas');
    check('Mit Gasvertrag: Reiter Strom | Gas', !!$('hb-en-tab-gas') && $('hb-en-tab-strom').getAttribute('aria-pressed') === 'true');
    check('Heizkosten-Nachzahlung im Fälligkeitsmonat', /im Monat, in dem sie fällig ist/.test(d.querySelector('.hb-en-nz').textContent));
    klick($('hb-en-tab-gas'));
    check('Gas-Reiter: eigene Felder, Fokus bleibt', $('hb-en-tab-gas').getAttribute('aria-pressed') === 'true' && d.activeElement === $('hb-en-tab-gas') && $('hb-en-weg').value === 'rechnung' && !!$('hb-en-m3'));
    check('Gas: kein Stromvergleich', !d.querySelector('.hb-en-dv'));
    klick($('hb-en-tab-strom'));
    setze('hb-en-heiz', 'strom');
    check('Heizung mit Strom: kein Vergleich mit dem Haushaltsstrom', !d.querySelector('.hb-en-dv') && !$('hb-en-tab-gas'));
    check('[en-check] Befund 6: Heizung mit Strom, 90 Tage: ungenau mit Jahreszeit-Hinweis, kein Brief, kein Plan-Hinweis', /Beim Heizen ist der Verbrauch im Winter/.test(tx($('hbEnErgebnis'))) && !$('hb-en-brief') && !$('hb-hw-energie'), tx($('hbEnErgebnis')));
    setze('hb-en-heiz', 'miete');
    // Warmwasser: dasselbe Feld wie im Check
    haken('hb-en-ww', true);
    check('Warmwasser leer im Check → direkt geschrieben', w.__solo.state().warmwasser === true && $('hb-en-ww').checked);
    check('Warmwasser: Mehrbedarf-Hinweis mit Knopf zum Check', /Mehrbedarf/.test(d.querySelector('.hb-en-nz').textContent) && !!knopf('Zum Leistungs-Check', d.querySelector('.hb-en-nz')));
    haken('hb-en-ww', false);
    check('Warmwasser anders im Check → Rückfrage', !!d.querySelector('#hbEnergie .hb-frage') && w.__solo.state().warmwasser === true);
    klick(knopf('Nein, behalten')); check('Nein: bleibt', w.__solo.state().warmwasser === true && $('hb-en-ww').checked);
    haken('hb-en-ww', false); klick(knopf('Ja, ändern')); check('Ja: im Check geändert', w.__solo.state().warmwasser === false);
    // Anderer Abschlag: Plan-Feld nur nach Rückfrage
    setze('hb-en-a', '100');
    check('Plan-Wert vorhanden → Rückfrage', !!d.querySelector('#hbEnergie .hb-frage') && gespeichert().plan.aus.energie === 6500 && /Guthaben/.test(tx($('hbEnErgebnis'))));
    klick(knopf('Ja, ändern'));
    check('Ja: Plan übernimmt 100 €; Guthaben als Info (nicht grün)', gespeichert().plan.aus.energie === 10000 && d.querySelector('.hb-en-erg').classList.contains('gut') && !$('hb-hw-energie'));
    // Eingabefehler
    setze('hb-en-z2', '9000');
    check('Zählerstand rückwärts: Fehler, kein Ergebnis', d.querySelector('.hb-en-erg').classList.contains('fehler') && /kleiner als der alte/.test(tx($('hbEnErgebnis'))));
    setze('hb-en-z2', '10500');
    // Vorgangswechsel: Daten bleiben
    w.Haushalt.neuLaden();
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  setTimeout(teil2, 100);
}, 300);
function teil2() {
  try {
    zumPlan();
    check('Nach neuLaden: Box zu, Daten erhalten', !$('hbEnergie') && gespeichert().energie.strom.z1 === 10000 && gespeichert().energie.strom.ap === 36.5);
    klick($('hb-kat-energie')); klick($('hb-en-knopf'));
    check('Wieder geöffnet: Werte da', $('hb-en-z1').value === '10000' && $('hb-en-ap').value === '36,5');
    // Befund 7: Preis mit 3 Nachkommastellen, sichtbare Fehlermeldung unter dem Feld
    setze('hb-en-ap', '32,87555');
    check('[en-check] Befund 7: 5 Nachkommastellen: Fehlermeldung unter dem Feld, nichts gespeichert', !!$('hb-en-ap-f') && /Diese Zahl passt nicht/.test($('hb-en-ap-f').textContent) && $('hb-en-ap').getAttribute('aria-invalid') === 'true' && /hb-en-ap-f/.test($('hb-en-ap').getAttribute('aria-describedby') || '') && gespeichert().energie.strom.ap === 36.5);
    setze('hb-en-ap', '32,875');
    check('[en-check] Befund 7: 32,875 ct angenommen und angezeigt', gespeichert().energie.strom.ap === 32.875 && $('hb-en-ap').value === '32,875' && !$('hb-en-ap-f'));
    setze('hb-en-ap', '36,5');
    // Befund 12: alte Ablesung → kein Brief, kein Plan-Hinweis, Bitte um neue Ablesung
    setze('hb-en-d2', iso(40));
    check('[en-check] Befund 12: Ablesung 40 Tage alt: „Bitte lies den Zähler neu ab“, kein Brief, kein Plan-Hinweis', /Bitte lies den Zähler neu ab/.test(tx($('hbEnErgebnis'))) && !$('hb-en-brief') && !$('hb-hw-energie'), tx($('hbEnErgebnis')));
    setze('hb-en-d2', iso(10));
    check('[en-check] Befund 12: Aktuelle Ablesung: Brief wieder da', !!$('hb-en-brief') && !/Bitte lies den Zähler neu ab/.test(tx($('hbEnErgebnis'))));
    // Ohne Grundsicherungsgeld, Heizung mit Gas: Antrag im Fälligkeitsmonat
    w.__solo.set({ adults: 2, kids: 1, miete: 600, plz: '90542', bezug: {} }); zumPlan(); if (!$('hb-en-knopf')) klick($('hb-kat-energie'));
    if (!$('hbEnergie')) klick($('hb-en-knopf'));
    setze('hb-en-heiz', 'gas');
    const nz2 = d.querySelector('.hb-en-nz');
    check('Ohne Leistung: Heizkosten-Text „Antrag im Fälligkeitsmonat“, kein Regelbedarf-Text', !!nz2 && /Stell den Antrag noch in dem Monat/.test(nz2.textContent) && !/im Regelbedarf enthalten/.test(nz2.textContent) && !/Regelbedarf ist für Strom/.test(nz2.textContent));
    check('3 Personen: Vergleichswert 3 oder mehr', /3 oder mehr Personen braucht im Schnitt etwa 5\.411 kWh/.test(tx($('hbEnErgebnis'))), tx($('hbEnErgebnis')));
    // Sprachen: keine Rohschlüssel
    ['en', 'ar', 'fa', 'so', 'uk'].forEach((l) => { w.__solo.lang(l); zumPlan(); if (!$('hb-en-knopf')) klick($('hb-kat-energie')); if (!$('hbEnergie')) klick($('hb-en-knopf')); check(l + ': Box ohne Rohschlüssel', !!$('hbEnergie') && !/hb\.en\.|sp\.[a-z]+\.\d/.test($('hbEnergie').textContent)); });
    w.__solo.lang('de');
    check('Keine Skriptfehler', !errors.length, errors);
  } catch (e) { fehler++; console.log('FAIL Ausnahme: ' + e.stack); }
  if (fehler) { console.log('\n' + fehler + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Energie-DOM-Test bestanden: ' + n + ' Prüfungen');
  process.exit(0);
}
