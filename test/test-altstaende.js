// Alte Speicherstände: Angaben, die eine frühere Version gespeichert hat, müssen nach einem Update richtig geladen werden
// und dasselbe Ergebnis liefern wie dieselben Angaben im heutigen Format. Je Ausbaustufe ein Beispiel (Felder wie damals in
// blankState()). Dazu die einfache Version mit einem älteren Speicherstand.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

function seite(speicher) {
  const errors = [];
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.__SOLO_TEST__ = true; w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
      const mem = Object.assign({}, speicher);
      Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } }, configurable: true });
      w.addEventListener('error', (e) => errors.push(e.message));
    }
  });
  return { w: dom.window, d: dom.window.document, errors };
}
const ergebnis = (w) => JSON.stringify(w.__solo.eval().results.map((r) => [r.id, r.level, r.tx]));
const leer = seite({});
const heute = (s) => { leer.w.__solo.set(s); return ergebnis(leer.w); };

const FAELLE = [
  { name: 'Version vom 5.11.2026 (Summenfelder, Haken „Behinderung“ und „Rentenalter“)', alt: { adults: 2, kids: 1, kidsU6: 1, kids14: 0, young: 0, brutto: 3000, brutto2: 1000, netto: 2300, nichtArbeit: false, nichtArbeit2: true, miete: 900, mietstufe: '4', plz: '', plzPick: '', bundesland: '', vermoegen: 5000, alterGruppe: '30-39', alter: false, ausbildung: '', pflegegrad: '', behinderung: true, erwerbsgemindert: false, bhPerson: '', gdb: '', blind: '', emStd: '', bezug: {} },
    neu: { adults: 2, kids: 1, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: 2000, ek1Netto: 1533, ek2Art: 'rente', ek2Brutto: 1000, ek2Netto: 767, miete: 900, mietstufe: '4', vermoegen: 5000, gdb: '100', bhPerson: 'erwNach25', bezug: {} },
    feld: ['ek1Brutto', '2000'] },
  { name: 'Version vom 7.11.2026 (Einkommen je Person, noch Altersgruppe statt Geburtsjahr)', alt: { adults: 1, kids: 2, kidsU6: 0, kids14: 1, young: 0, ek1Art: 'lohn', ek1Brutto: 1900, ek1Netto: 1450, ek2Art: '', ek2Brutto: '', ek2Netto: '', brutto: '', brutto2: '', netto: '', unterhalt: 150, miete: 780, mietstufe: '3', plz: '', plzPick: '', bundesland: '', vermoegen: 1200, alterGruppe: '40-49', ausbildung: 'kind', pflegegrad: '', bhPerson: '', gdb: '', blind: '', emStd: '', erwerbsgemindert: true, unterhaltFehlt: true, bezug: { kindergeld: true } },
    neu: { adults: 1, kids: 2, kidsU6: 0, kids14: 1, young: 0, ek1Art: 'lohn', ek1Brutto: 1900, ek1Netto: 1450, unterhalt: 150, miete: 780, mietstufe: '3', vermoegen: 1200, ausbildung: 'kind', emStd: 'unter3', unterhaltFehlt: true, bezug: { kindergeld: true } },
    feld: ['emStd', 'unter3'] },
  { name: 'Version vom 12.11.2026 (vor „Unterhalt, den du zahlst“)', alt: { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'kg', ek1Brutto: '', ek1Netto: 1300, ek2Art: '', ek2Brutto: '', ek2Netto: '', unterhalt: '', kindEink: '', ek1bArt: '', ek1bBetrag: '', baby: '', egVor: '', aufenthalt: '', miete: 650, mietstufe: '2', plz: '', plzPick: '', bundesland: 'BY', vermoegen: 3000, gebJahr: 1971, arbeitSit: 'krank', algMonate: '', krankWochen: 'laeuft', lohnVorher: 2600, ausbildung: '', pflegegrad: '', bhPerson: '', gdb: '', blind: '', emStd: 'unklar', bezug: {} },
    neu: null, feld: ['ek1Netto', '1300'] },
  // Paar vor dem zweiten Einkommen für Paare (ohne ek2bArt/ek2bBetrag; ek1b wurde bei Paaren zurückgesetzt): gleiches Ergebnis
  { name: 'Version vom 20.11.2026 (Paar ohne zweites Einkommen)', alt: { adults: 2, kids: 1, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: 2100, ek1Netto: 1560, ek2Art: 'unt', ek2Brutto: '', ek2Netto: 400, unterhalt: '', kindEink: '', ek1bArt: '', ek1bBetrag: '', baby: '', egVor: '', aufenthalt: '', miete: 900, mietstufe: '3', plz: '', plzPick: '', bundesland: 'BY', vermoegen: 2000, gebJahr: 1984, arbeitSit: '', algMonate: '', krankWochen: '', lohnVorher: '', ausbildung: '', pflegegrad: '', bhPerson: '', gdb: '', blind: '', emStd: '', uzBetrag: '', uzAn: '', uzTitel: false, wohnart: '', hhAndere: '', autoWert: '', autoBraucht: false, euArbeit: '', euJahre: '', bezug: {} },
    neu: null, feld: ['ek2Netto', '400'] },
  { name: 'heutiges Format mit zweitem Einkommen der Partnerin', alt: { adults: 2, kids: 1, kidsU6: 1, kids14: 0, young: 0, ek1Art: 'lohn', ek1Brutto: 1800, ek1Netto: 1350, ek1bArt: 'unt', ek1bBetrag: 200, ek2Art: 'alg', ek2Netto: 700, ek2bArt: 'lohn', ek2bBetrag: 300, miete: 950, mietstufe: '4', vermoegen: 1000, gebJahr: 1988, bezug: {} },
    neu: null, feld: ['ek2bBetrag', '300'] },
  { name: 'heutiges Format', alt: { adults: 1, kids: 0, kidsU6: 0, kids14: 0, young: 0, ek1Art: 'rente', ek1Brutto: 1100, ek1Netto: 980, miete: 520, mietstufe: '3', vermoegen: 4000, gebJahr: 1955, uzBetrag: 200, uzAn: 'ex', uzTitel: true, pflegegrad: '2', bezug: {} },
    neu: null, feld: ['uzBetrag', '200'] }
];

FAELLE.forEach((f) => {
  const s = seite({ 'lotse.state': JSON.stringify({ s: f.alt, p: { name: 'Test' }, e: true }), 'lotse.ack': '1' });
  ck('[altstaende] ' + f.name + ': lädt ohne Skriptfehler', s.errors.length === 0, s.errors.join(' | '));
  ck('[altstaende] ' + f.name + ': Karten werden angezeigt', s.d.querySelectorAll('#cards article.card').length > 10);
  ck('[altstaende] ' + f.name + ': Feld „' + f.feld[0] + '“ übernommen', s.d.getElementById(f.feld[0]).value === f.feld[1], s.d.getElementById(f.feld[0]).value);
  ck('[altstaende] ' + f.name + ': dasselbe Ergebnis wie im heutigen Format', ergebnis(s.w) === heute(f.neu || f.alt), ergebnis(s.w).slice(0, 200) + ' <> ' + heute(f.neu || f.alt).slice(0, 200));
  ck('[altstaende] ' + f.name + ': Name in der Antragsmappe übernommen', s.d.getElementById('p-name').value === 'Test');
});

// Leer gespeicherter Stand (App zweimal geöffnet, nichts eingegeben): nicht als bearbeitet werten, kein „4 möglich“
{
  const blank = seite({ 'lotse.ack': '1' }).w.__solo.state();
  const z = seite({ 'lotse.state': JSON.stringify({ s: blank, p: { name: '', geb: '', strasse: '', ort: '', tel: '' }, e: true, big: false }), 'lotse.ack': '1', 'lotse-lang': 'de' });
  const I = require('../dist/i18n.js');
  ck('[altstaende] leer gespeicherter Stand: Check zeigt „noch keine Angaben“, keine Einstufungen', z.d.getElementById('count').textContent === I.de['c.leer'] && z.d.querySelectorAll('#cards .pill').length === 0, z.d.getElementById('count').textContent);
  const bsp = seite({ 'lotse.state': JSON.stringify({ s: Object.assign({}, blank, { ek1Art: 'lohn', ek1Brutto: 2200, ek1Netto: 1750, miete: 950 }), p: {}, e: false }), 'lotse.ack': '1', 'lotse-lang': 'de' });
  ck('[altstaende] gespeichertes Beispiel (e: false) bleibt Beispiel: Hinweis sichtbar, nicht als eigene Angabe', !bsp.d.getElementById('sampleNotice').hidden && bsp.w.__solo.state().ek1Netto === 1750);
  const ordner = z.d.getElementById('v-ordner');
  ck('[altstaende] leer gespeicherter Stand: Ordner ohne Einstufung „möglich“', !ordner || !/\d+ (möglich|wahrscheinlich)/.test(ordner.textContent) && !z.w.__solo.state().ek1Art, ordner && ordner.textContent.slice(0, 200));
}

// Antragsmappe mit jeder Einkommensart (auch später ergänzten wie „selbstständig“): kein „undefined“ im Angabenblatt
{
  const probe = seite({ 'lotse.ack': '1' });
  const arten = [...probe.d.getElementById('ek1Art').options].map((o) => o.value).filter(Boolean);
  ck('[altstaende] Einkommensarten gefunden', arten.length >= 8, arten.join(' '));
  arten.forEach((art) => {
    const m = seite({ 'lotse.state': JSON.stringify({ s: { adults: 2, kids: 1, ek1Art: art, ek1Brutto: 1500, ek1Netto: 1100, ek2Art: art, ek2Brutto: 900, ek2Netto: 700, ek1bArt: art === 'ohne' ? '' : art, ek1bBetrag: 100, ek2bArt: art === 'ohne' ? '' : art, ek2bBetrag: 50, miete: 700, mietstufe: '3', vermoegen: 100, bezug: {} }, p: { name: 'Test' }, e: true }), 'lotse.ack': '1' });
    m.d.querySelectorAll('[data-pick]').forEach((cb) => { cb.checked = true; cb.dispatchEvent(new m.w.Event('change', { bubbles: true })); });
    m.d.getElementById('mappeMake').click();
    const txt = m.d.getElementById('mappeBody').textContent;
    ck('[altstaende] Antragsmappe mit Einkommensart „' + art + '“ ohne kaputte Anzeige', !m.d.getElementById('mappe').hidden && !/\bundefined\b|\bNaN\b|\{[a-z]\w*\}/.test(txt) && m.errors.length === 0, (txt.match(/.{40}undefined.{20}/) || [m.errors.join(' | ')])[0]);
  });
}

// Antragsmappe alter Stände (vor der Aufgabenliste, 21.11.2026): Absender aus lotse.state, Haken je Leistung (id|Schlüssel) und die Schritte
// „Anschreiben“/„Formular“ laden weiter; der Absender ist zentral und erscheint auch im Widerspruch und im Musterschreiben (Geld und Schulden)
{
  const alt = seite({ 'lotse.state': JSON.stringify({ s: { adults: 1, kids: 1, ek1Art: 'lohn', ek1Brutto: 1500, ek1Netto: 1100, miete: 600, mietstufe: '3', vermoegen: 0, unterhaltFehlt: true, plz: '91054', bezug: {} }, p: { name: 'Erika Alt', strasse: 'Altweg 2', ort: '91054 Erlangen', geb: '1980-03-04', tel: '' }, e: true }),
    'lotse.haken': JSON.stringify({ 'uvg|s.uvg.u1': true, 'mappe|brief': true, 'mappe|formular': true, 'mappe|abschicken': true }), 'lotse.ack': '1' });
  const d = alt.d, klick = (el) => el.dispatchEvent(new alt.w.MouseEvent('click', { bubbles: true }));
  d.querySelectorAll('[data-pick]').forEach((cb) => { cb.checked = cb.getAttribute('data-pick') === 'uvg'; cb.dispatchEvent(new alt.w.Event('change', { bubbles: true })); });
  d.querySelectorAll('#pick input[data-weg][value="offen"]').forEach((r) => { r.checked = true; r.dispatchEvent(new alt.w.Event('change', { bubbles: true })); });
  d.getElementById('mappeMake').click();
  const geburt = d.querySelector('#aufUnterlagen input[data-haken="u|geburt"]');
  ck('[altstaende-mappe] Alter Haken „uvg|s.uvg.u1“ (Geburtsurkunde) zählt in der neuen Liste als abgehakt', !!geburt && geburt.checked, geburt && geburt.outerHTML.slice(0, 120));
  ck('[altstaende-mappe] Alte Schritte „Anschreiben“ und „Formular“ erledigt: Schritt „Anträge stellen“ erledigt; „Abschicken“ erledigt', d.querySelector('#aufAntraege input[data-haken="mappe|antraege"]').checked && /^✓/.test(d.getElementById('statAntraege').textContent) && /^✓/.test(d.getElementById('statAbschicken').textContent));
  ck('[altstaende-mappe] Absender aus dem alten Stand: Status „eingetragen“, im Brief', /^✓/.test(d.getElementById('statAngaben').textContent) && /Erika Alt\nAltweg 2\n91054 Erlangen/.test(d.getElementById('mappeBody').textContent));
  geburt.checked = false; geburt.dispatchEvent(new alt.w.Event('change', { bubbles: true }));
  ck('[altstaende-mappe] Abwählen entfernt auch den alten Schlüssel', !d.querySelector('#aufUnterlagen input[data-haken="u|geburt"]').checked && !/uvg\|s\.uvg\.u1/.test(alt.w.localStorage.getItem('lotse.haken') || ''));
  d.getElementById('mappeClose').click();
  // Widerspruch Jobcenter (Brief prüfen): Absender eingesetzt
  klick(d.querySelector('#appnav [data-ansicht="start"]')); klick(d.getElementById('goBriefe')); klick(d.getElementById('brief-jc'));
  ck('[absender] Widerspruch an das Jobcenter: gespeicherter Absender eingesetzt', d.getElementById('bs-name').value === 'Erika Alt' && d.getElementById('bs-anschrift').value === 'Altweg 2' && d.getElementById('bs-ort').value === '91054 Erlangen', d.getElementById('bs-name').value);
  d.getElementById('bs-name').value = 'Erika Neu'; d.getElementById('bs-name').dispatchEvent(new alt.w.Event('input', { bubbles: true }));
  ck('[absender] Änderung im Widerspruch gilt für alle Briefe (Mappe)', d.getElementById('p-name').value === 'Erika Neu');
  // Musterschreiben „Ratenzahlung anbieten“ (Geld und Schulden): Absender statt Lücke, änderbar im Kasten
  klick(d.querySelector('#appnav [data-ansicht="start"]')); klick(d.getElementById('goGeld')); klick(d.querySelector('#spInhalt .gs-inkasso')); klick(d.querySelector('#spInhalt .gs-i-rate'));
  const ms = d.getElementById('ms-text');
  ck('[absender] Musterschreiben an die Inkassofirma: Name und Anschrift oben, Ort beim Datum', !!ms && /^Erika Neu\nAltweg 2\n91054 Erlangen\n/.test(ms.value) && /\nErlangen, /.test(ms.value) && !/\[Dein Name/.test(ms.value), ms && ms.value.slice(0, 120));
  const kasten = d.querySelector('.abs-kasten');
  ck('[absender] Kompakter Absender-Kasten beim Musterschreiben', !!kasten && /Erika Neu, Altweg 2, 91054 Erlangen/.test(kasten.textContent));
  const f = kasten.querySelector('input[data-abs="name"]'); f.value = 'Erika Drei'; f.dispatchEvent(new alt.w.Event('input', { bubbles: true }));
  ck('[absender] Änderung im Kasten schreibt das Schreiben neu und gilt überall', /^Erika Drei\n/.test(d.getElementById('ms-text').value) && d.getElementById('p-name').value === 'Erika Drei' && d.getElementById('bs-name').value === 'Erika Drei');
  ck('[altstaende-mappe] Keine Skriptfehler', alt.errors.length === 0, alt.errors.join(' | '));
}
// Ohne Absender: Lücken zum Ausfüllen von Hand
{
  const o = seite({ 'lotse.ack': '1' });
  const klick = (el) => el.dispatchEvent(new o.w.MouseEvent('click', { bubbles: true }));
  klick(o.d.getElementById('goGeld')); klick(o.d.querySelector('#spInhalt .gs-inkasso')); klick(o.d.querySelector('#spInhalt .gs-i-rate'));
  ck('[absender] Ohne Angaben: Lücke „[Dein Name, deine Anschrift]“ und „[Ort]“', /^\[Dein Name, deine Anschrift\]/.test(o.d.getElementById('ms-text').value) && /\[Ort\], /.test(o.d.getElementById('ms-text').value));
}

// Einfache Version: älterer Speicherstand (ohne die später ergänzten Fragen zu Werkstattjahren und PLZ) öffnet direkt die einfache Version
const esAlt = { schritt: 99, geb: '1985', wohnen: 'allein', mieteJa: '', miete: '450', arbeit: 'werkstatt', lohn: '280', essen: 'ja', em: '', renteJa: 'nein', rente: '', ausweis: 'ja', gdb: '100', mz: { G: true }, kind: 'ja', pflege: 'nein', schon: {}, erspart: 'wenig' };
const e = seite({ 'lotse.einfach': JSON.stringify({ es: esAlt, an: true }), 'lotse.ack': '1' });
ck('[altstaende] Einfache Version, älterer Speicherstand: lädt ohne Skriptfehler', e.errors.length === 0, e.errors.join(' | '));
const esText = [...e.d.querySelectorAll('.es-karte, .es-h, .es-lvl')].map((x) => x.textContent).join('\n');
ck('[altstaende] Einfache Version, älterer Speicherstand: zeigt Ergebnis ohne kaputte Anzeige', e.d.querySelectorAll('.es-karte').length > 0 && !/\bNaN\b|\bundefined\b|\{[a-z]\w*\}/.test(esText), e.d.querySelectorAll('.es-karte').length);

console.log(fails ? '\n' + fails + ' von ' + n + ' FEHLGESCHLAGEN' : '\nAltstand-Test bestanden: ' + n + ' Prüfungen (Speicherstände aus 4 Ausbaustufen und der einfachen Version, Antragsmappe mit jeder Einkommensart)');
process.exit(fails ? 1 : 0);
