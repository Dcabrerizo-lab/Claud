// Prüfung mit frischen Augen (20.11.2026): Korrekturen im Test festhalten.
// S1 Widerspruch nur mit vollständigen Angaben (leere Personenzeile zählt nicht), S2 Frist ganz oben und Art des Briefs,
// S3 Vorbefüllung nur mit echten Eingaben (Warmmiete nicht als Miete ohne Heizung), S5 „Zwei Wege“ ohne Kinder,
// Sprachwahl oben, Monatsname im Stand, Haushaltsplan in „Mein Ordner“, alle fehlenden Angaben auf einmal, Mappe.
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const I18N = require('../dist/i18n.js');
const RB1 = require('../src/rules.js').RULES.regelbedarf.alleinstehend;
let fehler = 0, n = 0;
const check = (name, ok, info) => { n++; if (!ok) { fehler++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };
function starte() {
  const errors = [], mem = { 'lotse.ack': '1' };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://solo.test/#start',
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      Object.defineProperty(w.navigator, 'languages', { value: ['de-DE'], configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const klick = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const feuer = (w, el, typ) => el.dispatchEvent(new w.Event(typ, { bubbles: true }));

const A = starte();
setTimeout(() => {
  const { w, d, errors } = A, $ = (id) => d.getElementById(id);
  try {
    w.__solo.lang('de');
    const kachel = (art) => {
      klick(w, $('goBriefe'));
      if ($('checkBox') && !$('checkBox').hidden) klick(w, $('briefZurueck'));
      klick(w, $('brief-' + art));
    };
    const setze = (id, v) => { $(id).value = v; feuer(w, $(id), 'input'); };

    // ---------- S3: Vorbefüllung aus dem Check ----------
    w.__solo.set({ adults: 1, kids: 2, young: 0, ek1Art: 'lohn', ek1Brutto: 1200, ek1Netto: 950, miete: 950, heizkosten: '', vermoegen: 0, bezug: {} });
    kachel('jc'); klick(w, $('elSelbst'));
    let zeilen = [...$('bs-personen').children];
    check('S3: Personen aus dem Check: 1 erwachsene Person, 2 Kinder', zeilen.length === 3 && zeilen.filter((tr) => tr.dataset.rolle === 'kind').length === 2, zeilen.length);
    check('S3: kein erfundenes Alter (Felder leer)', zeilen.every((tr) => tr.querySelector('input').value === ''), zeilen.map((tr) => tr.querySelector('input').value));
    check('S3: Warmmiete 950 € nicht in „Miete ohne Heizung“ (ohne Heizkosten bleibt das Feld leer)', $('bs-miete').value === '' && $('bs-heiz').value === '', [$('bs-miete').value, $('bs-heiz').value]);
    check('S3: Lohn aus dem Check übernommen', zeilen[0].querySelectorAll('input')[1].value === '1200' && zeilen[0].querySelectorAll('input')[2].value === '950');
    check('S1: Kinder ohne Alter: Ergebnis nennt, was fehlt', /Alter jedes Kindes/.test($('bs-erg').textContent), $('bs-erg').textContent.slice(0, 200));
    // ---------- S1: leere Personenzeile zählt nicht; Widerspruch nur mit vollständigen Angaben ----------
    $('bs-personen').replaceChildren();
    klick(w, $('bs-erw')); klick(w, $('bs-erw')); // zwei Zeilen, die zweite bleibt leer
    const z1 = $('bs-personen').children[0].querySelectorAll('input');
    z1[0].value = '40'; feuer(w, z1[0], 'input');
    setze('bs-miete', '500'); setze('bs-heiz', '80');
    setze('bs-b-regel', String(RB1)); setze('bs-b-kdu', '580'); setze('bs-b-zahl', String(RB1 + 580));
    check('S1: leere zweite Zeile: kein Vergleich mit Partner-Regelbedarf, SoLo fragt nach der Zeile', /leeren Personenzeile/.test($('bs-erg').textContent) && !/Stufen 2, 2/.test($('bs-erg').textContent), $('bs-erg').textContent.slice(0, 300));
    setze('bs-datum', '2026-11-12');
    klick(w, $('bs-wid-mach'));
    check('S1: leere Zeile: Widerspruch ohne Zahlen (kein „1.012 €“)', !/1\.012|Regelbedarfe/.test($('bs-wid-text').value) && /Begründung reiche ich nach/.test($('bs-wid-text').value));
    $('bs-personen').children[1].querySelector('button').click();
    check('S1: leere Zeile entfernt: Regelbedarf passt (eine Person, Stufe 1)', /Alles passt|Keine sichere Abweichung/.test($('bs-erg').textContent), $('bs-erg').textContent.slice(0, 300));
    setze('bs-datum', '2026-11-12');
    klick(w, $('bs-wid-mach'));
    check('S1: vollständig, kein Grund: Widerspruch ohne Zahlen-Begründung', !/Regelbedarfe/.test($('bs-wid-text').value) && /Begründung reiche ich nach/.test($('bs-wid-text').value), $('bs-wid-text').value.slice(0, 400));
    // Zu wenig Regelbedarf, aber ein Kind ohne Alter: keine Zahlen-Begründung, klare Liste, was fehlt
    klick(w, $('bs-kind'));
    { const ki = $('bs-personen').children[1].querySelectorAll('input'); ki[3].value = '100'; feuer(w, ki[3], 'input'); } // Kind mit Unterhalt, ohne Alter
    setze('bs-b-regel', '100');
    klick(w, $('bs-wid-mach'));
    const wt = $('bs-wid-text').value;
    check('S1: Angaben unvollständig: keine Begründung mit Zahlen im Widerspruch', !/Regelbedarfe/.test(wt) && !/Insbesondere/.test(wt) && /Begründung reiche ich nach/.test(wt), wt.slice(0, 500));
    check('S1: Angaben unvollständig: SoLo sagt, was fehlt', /Es fehlen noch: Alter jedes Kindes/.test($('bs-frist').textContent), $('bs-frist').textContent);
    // Alter nachgetragen: jetzt mit Zahlen
    const kz = $('bs-personen').children[1].querySelectorAll('input'); kz[0].value = '8'; feuer(w, kz[0], 'input');
    klick(w, $('bs-wid-mach'));
    check('S1: vollständig und zu wenig Regelbedarf: Begründung mit Zahlen', /Regelbedarfe/.test($('bs-wid-text').value) && !/Es fehlen noch/.test($('bs-frist').textContent), $('bs-wid-text').value.slice(0, 300));

    // ---------- S2: Frist ganz oben, vor „Widerspruch erstellen“; Art des Briefs ----------
    const karte = $('p-bescheid').querySelector('.card'), box = $('bs-fristbox');
    check('S2: Frist-Bereich in der ersten Karte, nach dem Einlesen (Scannen zuerst, UX-Audit B)', !!box && karte.contains(box) && karte.contains($('bs-datum')) && !!($('einlesen').compareDocumentPosition(box) & 4));
    check('S2: Datum 12.11.2026 -> „Widerspruch bis 16.12.2026“ im Frist-Muster', !!box.querySelector('.frist .frist-wann') && /16\.12\.2026/.test(box.querySelector('.frist-wann').textContent), box.textContent.slice(0, 200));
    check('S2: Frist steht vor dem Knopf „Widerspruch erstellen“', !!(box.compareDocumentPosition($('bs-wid-mach')) & 4));
    const anh = box.querySelector('input[name="bs-briefart"][value="anh"]');
    check('S2: Art des Briefs wählbar (Bescheid, Einladung, Anhörung, Unterlagen)', box.querySelectorAll('input[name="bs-briefart"]').length === 4);
    anh.checked = true; feuer(w, anh, 'change');
    check('S2: Anhörung: Nachrechnen ausgeblendet, Erklärung und Datumsfeld', $('p-bescheid').classList.contains('pp-anders') && !!$('bs-art-tag') && /äußern/.test(box.textContent));
    setze('bs-art-tag', '2026-12-01');
    check('S2: Anhörung: Tag aus dem Brief im Frist-Muster', /01\.12\.2026/.test(box.querySelector('.pp-art-anders .frist').textContent));
    const bes = box.querySelector('input[name="bs-briefart"][value="bescheid"]'); bes.checked = true; feuer(w, bes, 'change');
    check('S2: zurück zu Bescheid: Prüfung wieder sichtbar', !$('p-bescheid').classList.contains('pp-anders'));

    // ---------- S5: „Zwei Wege“ ohne Kinder ----------
    w.__solo.set({ adults: 1, kids: 0, young: 0, ek1Art: 'lohn', ek1Brutto: 1800, ek1Netto: 1400, miete: 650, mietstufe: '5', vermoegen: 0, bezug: {} });
    let ww = $('zweiWege');
    check('S5: Kasten „Zwei Wege“ erscheint (Grundsicherungsgeld und Wohngeld möglich)', !!ww);
    check('S5: ohne Kinder: kein Kinderzuschlag, nichts „für die Kinder“', !!ww && !/Kinderzuschlag|Kinder/.test(ww.textContent), ww && ww.textContent);
    w.__solo.set({ adults: 1, kids: 1, young: 0, ek1Art: 'lohn', ek1Brutto: 1800, ek1Netto: 1400, miete: 750, mietstufe: '5', vermoegen: 0, bezug: {} });
    ww = $('zweiWege');
    check('S5: mit Kind: Kinderzuschlag genannt', !ww || /Kinderzuschlag/.test(ww.textContent));

    // ---------- Nur Netto: alles Fehlende auf einmal ----------
    w.__solo.set({ adults: 1, kids: 0, young: 0, ek1Art: 'lohn', ek1Brutto: '', ek1Netto: 1400, miete: 650, vermoegen: '', bezug: {} });
    const wg = $('c-wohngeld');
    check('netto: Wohngeld-Karte nennt alle fehlenden Angaben auf einmal (Postleitzahl, Brutto)', !!wg && wg.textContent.indexOf(I18N.de['gn.plz']) >= 0 && wg.textContent.indexOf(I18N.de['gn.brutto']) >= 0, wg && wg.textContent.slice(0, 600));
    check('netto: Vermögen wird nicht doppelt genannt', !!wg && wg.textContent.split(I18N.de['gn.vermoegen']).length - 1 <= 1);

    // ---------- Erkannte Werte aus dem Brief: erst prüfen, dann Ergebnis ----------
    kachel('jc');
    if ($('elText').closest('[hidden]')) klick(w, $('elPaste'));
    $('elText').value = 'Jobcenter Musterstadt\nDatum: 12.03.2026\nGrundsicherungsgeld nach dem SGB II\nRegelbedarf 563,00\nKosten der Unterkunft und Heizung 755,00\nZahlbetrag 1.318,00';
    klick(w, $('elLesen'));
    check('erkannt: Hinweiszeile oben mit „Werte stimmen“', !$('bs-erk').hidden && $('bs-erk').textContent.indexOf(I18N.de['bp.erk.t']) >= 0 && !!$('bs-erk-ok'));
    check('erkannt: Felder markiert', $('bs-b-regel').classList.contains('pp-erkannt') && $('bs-b-zahl').classList.contains('pp-erkannt'));
    check('erkannt: Ergebnis wartet auf Prüfung', $('bs-erg').textContent.indexOf(I18N.de['bp.erk.warte']) >= 0, $('bs-erg').textContent.slice(0, 200));
    check('erkannt: eingefügter Text ohne „schwer zu lesen“', !d.querySelector('#p-bescheid .pp-unsicher'));
    w.__solo.lang('en');
    check('erkannt: Hinweis übersetzt (Englisch)', $('bs-erk-ok').textContent === I18N.en['bp.erk.ok'] && $('bs-erg').textContent.indexOf(I18N.en['bp.erk.warte']) >= 0, [$('bs-erk-ok').textContent, $('bs-erg').textContent.slice(0, 120)]);
    w.__solo.lang('de');
    klick(w, $('bs-erk-ok'));
    check('erkannt: nach „Werte stimmen“ Markierung weg und Ergebnis da', $('bs-erk').hidden && !d.querySelector('#p-bescheid .pp-erkannt') && $('bs-erg').textContent.indexOf(I18N.de['bp.erk.warte']) < 0);
    check('erkannt: „Werte stimmen“ steht unter den Werten (nach dem Formular)', !!$('bs-erk-unten') && $('bs-form').nextElementSibling === $('bs-erk-unten'));
    // ---------- Widerspruchsfrist nach SoLos Rechnung vorbei (rechtsfragen-rot.md, Frage 1) ----------
    const datumSetzen = (id, v) => { $(id).value = v; $(id).dispatchEvent(new w.Event('input', { bubbles: true })); };
    datumSetzen('bs-datum', '2023-02-10');
    check('vorbei: Kasten statt „Widerspruch bis“, kein „Frist merken“', !!$('bs-vorbei-box') && !$('bs-fristbox').querySelector('.fri-merken') && $('bs-vorbei-box').textContent.indexOf(I18N.de['bp.vb.btn']) >= 0, $('bs-fristbox').textContent.slice(0, 300));
    check('vorbei: Jobcenter nur 1 Jahr zurück, Feld für den Zugang sichtbar', /1\. Januar/.test($('bs-vorbei-box').textContent) && !$('bs-zugang-box').hidden);
    check('vorbei: Widerspruch nur als Nebenweg', $('bs-wid-mach').textContent === I18N.de['bp.vb.wid'] && !$('bs-wid-mach').classList.contains('primary'));
    klick(w, $('bs-ue-mach'));
    check('vorbei: Knopf erstellt Antrag auf Überprüfung (§ 44 SGB X)', /Antrag auf Überprüfung nach § 44 SGB X/.test($('bs-wid-text').value) && !/hiermit lege ich Widerspruch/.test($('bs-wid-text').value), $('bs-wid-text').value.slice(0, 300));
    klick(w, $('bs-wid-mach'));
    check('vorbei: Widerspruch trotzdem, hilfsweise § 44 SGB X', /hilfsweise Antrag auf Überprüfung nach § 44 SGB X/.test($('bs-wid-text').value) && !$('bs-merken'));
    const vorKurzem = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
    datumSetzen('bs-zugang', vorKurzem);
    check('vorbei: später zugegangen → Frist läuft noch, Kasten weg', !$('bs-vorbei-box') && !!$('bs-fristbox').querySelector('.frist-wann') && $('bs-wid-mach').classList.contains('primary'));
    datumSetzen('bs-zugang', ''); datumSetzen('bs-datum', '');
    klick(w, $('briefZurueck'));

    // ---------- Stand mit übersetztem Monat ----------
    w.__solo.lang('ar');
    check('S7: Arabisch: Stand ohne deutschen Monatsnamen', !/November/.test($('stand').textContent) && /2026/.test($('stand').textContent), $('stand').textContent);
    check('S7: Arabisch: Überschrift der Brief-Prüfung übersetzt', $('p-bescheid').querySelector('h2').textContent === I18N.ar['bp.jc.h']);
    w.__solo.lang('de');
    check('S7: Deutsch: Stand unverändert', /November 2026/.test($('stand').textContent), $('stand').textContent);

    // ---------- S6: Sprachwahl oben ----------
    const lt = $('langTop');
    check('S6: Sprachwahl oben: 13 Sprachen und Einfache Sprache, Namen in eigener Schrift', !!lt && lt.options.length === 14 && [...lt.options].some((o) => o.textContent === 'العربية' || o.value === 'ar'), lt && lt.options.length);
    lt.value = 'en'; feuer(w, lt, 'change');
    check('S6: Wahl oben wechselt die Sprache', d.documentElement.getAttribute('lang') === 'en' && $('lang').value === 'en');
    lt.value = 'de-einfach'; feuer(w, lt, 'change');
    check('S6: „Deutsch – Einfache Sprache“ oben wählbar', d.documentElement.getAttribute('lang') === 'de' && $('einfacheSpracheBtn').getAttribute('aria-checked') === 'true');
    lt.value = 'de'; feuer(w, lt, 'change');
    check('S6: „Deutsch“ schaltet Einfache Sprache wieder aus', $('einfacheSpracheBtn').getAttribute('aria-checked') === 'false');

    // ---------- Mein Ordner: Haushaltsplan nur, wenn ausgefüllt ----------
    check('ordner: ohne eigene Ausgaben gilt der Plan als nicht ausgefüllt', w.Haushalt && w.Haushalt.rest().ausgefuellt === false);

    // ---------- Sicherheit: Untertitel nennt Löschen ----------
    check('sicher: Kachel nennt „Daten löschen“', $('stSicher').textContent.indexOf(I18N.de['set.sicher.loeschen']) >= 0, $('stSicher').textContent);
    check('sicher: PIN-Text ohne Missverständnis', !/Ohne PIN sieht niemand/.test(html) && I18N.de['vg.pin.unter'].indexOf('Mit PIN') === 0);

    check('keine Skriptfehler', errors.length === 0, errors);
    // Mit Heizkosten: Miete ohne Heizung = Warmmiete minus Heizung (neue App, damit die Felder leer sind)
    const B = starte(), $b = (id) => B.d.getElementById(id);
    B.w.__solo.lang('de');
    B.w.__solo.set({ adults: 1, kids: 0, young: 0, ek1Art: 'ohne', miete: 950, heizkosten: 100, vermoegen: 0, bezug: {} });
    klick(B.w, $b('goBriefe')); klick(B.w, $b('brief-jc')); klick(B.w, $b('elSelbst'));
    check('S3: mit Heizkosten 100 €: Miete ohne Heizung 850 €, Heizung 100 €', $b('bs-miete').value === '850' && $b('bs-heiz').value === '100', [$b('bs-miete').value, $b('bs-heiz').value]);
    check('S3: Alter der ersten Person nur aus dem Geburtsjahr (hier leer)', $b('bs-personen').children[0].querySelector('input').value === '');
  } catch (e) { fehler++; console.log('FAIL Ausnahme', e && e.stack); }
  console.log(fehler ? `\n${fehler} von ${n} Prüfungen fehlgeschlagen` : `[frisch] ${n} Prüfungen bestanden`);
  process.exit(fehler ? 1 : 0);
}, 300);
