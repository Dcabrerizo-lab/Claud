// Pflege-Variante: kurzer Fragepfad im Leistungs-Check (Senioren-Prüfung 24.11.2026, Punkt 1) und weitere UX-Punkte.
// 1. Musterfälle (Rentnerinnen, Rentner, Paare, dauerhaft Erwerbsgeminderte): Jede Angabe des Falls ist im kurzen Pfad erreichbar
//    (direkte Frage, Folgefrage nach einem Haken in den Sammelfragen oder Haken selbst). Das Ergebnis der Regeln mit NUR diesen Angaben
//    ist gleich dem Ergebnis mit allen Angaben (Karten der Variante: Stufe und Texte).
// 2. Typische Rentnerin allein: höchstens 15 Fragen. Sammelfrage „Trifft etwas davon zu?“ öffnet die Folgefrage, „Nichts davon“ nicht.
// 3. Plausibilitätshinweis (netto 0 bei brutto > 0) erscheint einmal, beim zweiten „Weiter“ geht es weiter.
// 4. Telefon-Karte „Lieber mit jemandem sprechen?“ (Folgeseite), Brief prüfen mit Rentenversicherung/Versorgungsamt/Krankenkasse, Löschen ohne Schulden-Liste,
//    „Für Fachkräfte“ am Ende der Einstellungen, Rückgängig 30 s.
// Aufruf: node test/test-variante-pfad.js
'use strict';
const { JSDOM } = require('jsdom');
const path = require('path');
const { render } = require(path.join(__dirname, '..', 'scripts', 'build.js'));

let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', n); };
const gebaut = render({ variante: 'pflege' });
const store = {};
const errors = [];
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + gebaut.html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.org/',
  beforeParse(w) {
    w.__SOLO_TEST__ = true;
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, configurable: true });
  }
});
const w = dom.window, d = w.document, $ = (id) => d.getElementById(id);
const warte = (ms) => new Promise((r) => setTimeout(r, ms || 5));

(async () => {
  await warte(30);
  check('Keine Skriptfehler beim Laden', errors.length === 0, errors);
  const V = w.__soloVariante;
  const FR = V.fragen(w.Schritte.FRAGEN.slice());
  // Seit 25.11.2026 fragt die Variante nach Kindern unter 25 (senKinder); weg bleiben Schwangerschaft, Elterngeld, Arbeit, Ausbildung
  const AUS = new Set(['kinderMehr', 'schwanger', 'baby', 'egVor', 'egKinder', 'egNach', 'arbeitSit', 'algZeit', 'algMonate', 'krankWochen', 'lohnVorher', 'ausbildung', 'babMehr']);
  const GATE_FELD = { eigentum: 'wohnart', warmwasser: 'warmwasser', ernaehrung: 'ernaehrung', grundrente: 'grundrente33', unterhaltFehlt: 'unterhaltFehlt', kinder12: 'kinder12' };
  // Aktive Fragen für einen fertigen Fall (Merker aus den Werten abgeleitet, wie nach dem Laden eines gespeicherten Falls)
  const aktiv = (s) => FR.filter((f) => !AUS.has(f.id) && (!f.wenn || f.wenn(s)));
  const erreichbar = (s) => {
    const out = new Set();
    aktiv(s).forEach((f) => {
      if (f.bezug) out.add('bezug');
      else if (f.art === 'mehr') f.felder.filter((x) => !x[2] || x[2](s)).forEach((x) => out.add(f.get ? GATE_FELD[x[0]] || '' : x[0]));
      else out.add(f.id);
      if (f.id === 'plzOrt' || f.id === 'plzPick') out.add('mietstufe');
    });
    out.add('plz'); out.add('bundesland'); out.add('mietstufe'); // Wohnort: PLZ → Ort/Stufe bestätigen oder Bundesland/Stufe wählen
    if (out.has('bezug')) out.add('bezug');
    return out;
  };
  w.__solo.set({}); const leer = JSON.parse(JSON.stringify(w.__solo.state()));
  const FAELLE = [
    ['Rentnerin allein, kleine Rente, Miete', { gebJahr: 1952, ek1Art: 'rente', ek1Brutto: 980, ek1Netto: 870, miete: 480, heizkosten: 70, plz: '91207', plzOrt: 'ja', mietstufe: '3', vermoegen: 2000 }],
    ['Rentner allein, Pflegegrad 3, GdB 80 G, Betriebsrente', { gebJahr: 1948, pflegegrad: '3', bhPerson: 'erwNach25', gdb: '80', mzG: true, ek1Art: 'rente', ek1Brutto: 1350, ek1Netto: 1200, zusatzRente: 180, grundrente33: true, miete: 620, heizkosten: 90, mietstufe: '4', vermoegen: 6000 }],
    ['Rentnerpaar, Witwenrente als zweites Einkommen, Auto, Eigentum', { adults: 2, gebJahr: 1950, ek1Art: 'rente', ek1Brutto: 1100, ek1Netto: 980, ek1bArt: 'rente', ek1bBetrag: 400, ek2Art: 'rente', ek2Brutto: 700, ek2Netto: 620, wohnart: 'eigentum', miete: 350, heizkosten: 120, mietstufe: '2', autoWert: 6000, autoBraucht: true, vermoegen: 12000 }],
    ['Dauerhaft voll erwerbsgemindert, 52 Jahre, Werkstatt, Grundsicherung', { gebJahr: 1974, emStd: 'unter3', em5: true, bhPerson: 'erwVor25', gdb: '100', mzG: true, wfbm: true, ek1Art: 'wfbm', ek1Netto: 260, ek1bArt: 'rente', ek1bBetrag: 650, wfbmEssen: true, miete: 420, heizkosten: 60, mietstufe: '3', vermoegen: 1500, bezug: { sozialamt: true } }],
    ['Rentnerin, blind, Boiler, teure Ernährung, zahlt Unterhalt, Mitbewohner', { gebJahr: 1945, bhPerson: 'erwNach25', gdb: '100', blind: 'blind', ek1Art: 'rente', ek1Brutto: 900, ek1Netto: 800, warmwasser: true, ernaehrung: true, uzBetrag: 150, uzAn: 'ex', hhAndere: 'verwandte', miete: 500, heizkosten: 80, mietstufe: '3', vermoegen: 500 }],
    ['EM-Rente mit 2 Kindern (eins 14 bis 17), Waisenrente', { gebJahr: 1980, senKinder: 'ja', kids: 2, kids14: 1, emStd: 'unter3', em5: true, ek1Art: 'rente', ek1Brutto: 1100, ek1Netto: 970, waisen: 180, miete: 750, heizkosten: 90, mietstufe: '3', vermoegen: 1000 }],
    ['Rentner-Paar mit Kind 19 in Ausbildung, eigenes Einkommen', { adults: 2, gebJahr: 1958, senKinder: 'ja', young: 1, kindEink: 700, ek1Art: 'rente', ek1Brutto: 1400, ek1Netto: 1230, ek2Art: 'ohne', miete: 700, heizkosten: 100, mietstufe: '4', vermoegen: 5000 }],
    ['Alleinerziehend, EM-Rente, Kind 8 mit Behinderung', { gebJahr: 1984, senKinder: 'ja', kids: 1, bhPerson: 'minder', gdb: '50', emStd: 'unter3', em5: true, ek1Art: 'rente', ek1Brutto: 900, ek1Netto: 790, miete: 600, heizkosten: 80, mietstufe: '3', vermoegen: 500 }],
    ['Rentnerin ohne deutschen Pass (EU)', { gebJahr: 1955, aufenthalt: 'eu', euArbeit: 'nein', euJahre: 'ab5', ek1Art: 'rente', ek1Brutto: 600, ek1Netto: 530, miete: 450, heizkosten: 60, mietstufe: '3', vermoegen: 300 }]
  ];
  const KARTEN = V.karten.concat(V.kartenKinder);
  const kurz = (r) => r.results.filter((x) => KARTEN.includes(x.id)).map((x) => x.id + ':' + x.level + ':' + JSON.stringify(x.tx)).sort().join('|');
  FAELLE.forEach(([name, f]) => {
    const voll = Object.assign(JSON.parse(JSON.stringify(leer)), f);
    const er = erreichbar(voll);
    const fehlt = Object.keys(f).filter((k) => !er.has(k));
    check(name + ': alle Angaben im kurzen Pfad erreichbar', fehlt.length === 0, fehlt);
    const nur = JSON.parse(JSON.stringify(leer)); Object.keys(voll).forEach((k) => { if (er.has(k)) nur[k] = voll[k]; });
    w.__solo.set(voll); const a = kurz(w.__solo.eval());
    w.__solo.set(nur); const b = kurz(w.__solo.eval());
    check(name + ': Ergebnis gleich wie mit allen Angaben', a === b && a.length > 0);
  });

  // Typischer Fall: Zahl der Fragen
  const typ = Object.assign(JSON.parse(JSON.stringify(leer)), FAELLE[0][1]);
  const n = aktiv(typ).length;
  // 16 seit der Frage nach Kindern unter 25 (Auftrag David 25.11.2026); ohne Kinder nur diese eine Frage mehr
  check('Rentnerin allein: höchstens 16 Fragen (vorher etwa 25)', n <= 16, n + ': ' + aktiv(typ).map((x) => x.id).join(','));
  check('Ohne Kinder: keine Folgefragen zu Kindern', !aktiv(typ).some((x) => ['kids', 'kidsU6', 'kids14', 'young', 'senKindLage', 'unterhalt', 'waisen', 'kindEink', 'uvgWechsel'].includes(x.id)));

  // EM-Rente mit 2 Kindern: Wohngeld wie in SoLo (Rechnung mit den Kindern), nicht wie für eine Person allein
  const emKinder = Object.assign(JSON.parse(JSON.stringify(leer)), FAELLE.find((x) => /^EM-Rente mit 2 Kindern/.test(x[0]))[1], { waisen: '' });
  w.__solo.set(emKinder);
  const rohK = w.__solo.eval(), gefK = V.filter(rohK);
  const wgK = gefK.results.find((r) => r.id === 'wohngeld'), wgRoh = rohK.results.find((r) => r.id === 'wohngeld');
  const wgEur = (r) => { const x = r && r.tx.find((t) => /^schaetz\./.test(t[0])); return x ? Number(x[1].a && x[1].a.eur != null ? x[1].a.eur : String(x[1].a).replace(/\D/g, '')) : NaN; };
  check('EM-Rente mit 2 Kindern: Wohngeld in der Variante gleich wie in SoLo', !!wgK && JSON.stringify(wgK.tx) === JSON.stringify(wgRoh.tx));
  check('EM-Rente mit 2 Kindern: Wohngeld etwa 620–670 € (nicht 180–240 €)', wgEur(wgK) >= 620 && wgEur(wgK) <= 670, wgK && wgK.tx);
  check('EM-Rente mit 2 Kindern: Kindergeld-Karte erscheint', gefK.results.some((r) => r.id === 'kindergeld' && r.level === 'ja'));
  check('EM-Rente mit 2 Kindern: Grundsicherung rechnet mit den Kindern', JSON.stringify(gefK.results.find((r) => r.id === 'gsa').tx) === JSON.stringify(rohK.results.find((r) => r.id === 'gsa').tx));
  check('EM-Rente mit 2 Kindern: zwei Wege (Wohngeld oder Grundsicherung) bleiben sichtbar', !!gefK.wege === !!rohK.wege);
  w.__solo.set(Object.assign({}, emKinder, { kids: 0, kids14: 0 }));
  check('Ohne Kinder: keine Kinder-Karten', !V.filter(w.__solo.eval()).results.some((r) => V.kartenKinder.includes(r.id)));

  // Ablauf in der Oberfläche: Sammelfrage
  w.__solo.set({}); store['lotse.state'] = undefined;
  $('goSelbst').click(); await warte(10); $('sen-selbst-check').click(); await warte(10);
  d.querySelector('.sen-inhalt [data-sen-ziel="check"]').click(); await warte(30);
  const frage = () => ($('sfFrage') || {}).textContent;
  const de = new Function(gebaut.i18n.replace('if (typeof module !== "undefined") module.exports = I18N;', '') + '; return I18N;')().de;
  [...$('schritte').querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === de['sux.a.allein']).click(); await warte(20);
  check('Nach „Allein“: Frage nach Kindern unter 25', frage() === de['sux.q.kinder'], frage());
  check('Kinder-Frage: Vorlesen-Knopf unter der Frage', !!$('schritte').querySelector('.vl-leiste'));
  const wahl = (txt) => [...$('schritte').querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === txt).click();
  wahl(de['sf.a.ja']); await warte(20);
  check('„Ja“ → Wie viele Kinder unter 18', frage() === de['sf.q.kids'], frage());
  $('sfPlus').click(); $('sfPlus').click(); $('sfWeiter').click(); await warte(20);
  check('Zwei Kinder → davon unter 6', frage() === de['sf.q.kidsU6'] && w.__solo.state().kids === 2, frage());
  $('sfWeiter').click(); await warte(20);
  check('… dann 14 bis 17', frage() === de['sf.q.kids14'], frage());
  $('sfPlus').click(); $('sfWeiter').click(); await warte(20);
  check('… dann 18 bis 24 mit Hinweis', frage() === de['sf.q.young'] && $('schritte').textContent.includes(de['sux.h.young']), frage());
  $('sfWeiter').click(); await warte(20);
  check('… dann Sammelfrage zu den Kindern', frage() === de['sux.q.kindLage'], frage());
  [...$('schritte').querySelectorAll('[data-k]')].find((b) => b.getAttribute('data-k') === 'kWaisen').click(); await warte(5);
  $('sfWeiter').click(); await warte(20);
  check('Haken „Waisenrente“ → Frage kommt später bei den Einkommen (nächste Frage: Geburtsjahr)', frage() === de['sf.q.geb'], frage());
  check('Waisenrente-Frage im Pfad aktiv', FR.some((f) => f.id === 'waisen' && f.wenn(w.__solo.state())));
  check('Kind unter 18 mit Behinderung wählbar', (() => { const f = FR.find((x) => x.id === 'bhPerson'); return f.opts(w.__solo.state()).some((o) => o[0] === 'minder'); })());
  // Zurück zur Kinder-Frage, „Nein“ löscht alle Angaben zu Kindern
  for (let i = 0; i < 8 && frage() !== de['sux.q.kinder']; i++) { $('sfZurueck').click(); await warte(20); }
  wahl(de['sf.a.nein']); await warte(30);
  const sk = w.__solo.state();
  check('„Nein“ → Kinder gelöscht, weiter mit dem Geburtsjahr', frage() === de['sf.q.geb'] && sk.kids === 0 && sk.kids14 === 0 && sk.young === 0 && !(Number(sk.waisen) > 0), [frage(), sk.kids, sk.waisen]);
  check('Ohne Kinder: „Kind unter 18“ nicht wählbar', !FR.find((x) => x.id === 'bhPerson').opts(sk).some((o) => o[0] === 'minder'));
  $('sfIn').value = '1950'; $('sfWeiter').click(); await warte(20);
  check('Danach Sammelfrage „Trifft etwas davon zu?“', frage() === de['sux.q.lage'], frage());
  check('Sammelfrage: Vorlesen-Knopf unter der Frage', !!$('schritte').querySelector('.vl-leiste'));
  const haken = (k) => [...$('schritte').querySelectorAll('[data-k]')].find((b) => b.getAttribute('data-k') === k);
  haken('pass').click(); await warte(5);
  $('sfWeiter').click(); await warte(20);
  check('Haken „kein deutscher Pass“ → Frage zum Aufenthalt', frage() === de['sf.q.aufenthalt'], frage());
  $('sfZurueck').click(); await warte(20);
  $('sfNichts').click(); await warte(30);
  check('„Nichts davon“ → keine Frage zum Aufenthalt, Aufenthalt leer', frage() !== de['sf.q.aufenthalt'] && w.__solo.state().aufenthalt === '', frage());
  // Plausibilität: bis zur Netto-Frage antworten
  let schutz = 0;
  while (frage() !== de['sf.q.netto'] && schutz++ < 30) {
    const q = frage();
    if (q === de['sf.q.ekArt']) { [...$('schritte').querySelectorAll('[data-i]')].find((x) => x.textContent.trim() === de['ek.art.rente']).click(); await warte(20); continue; }
    if ($('sfIn')) { $('sfIn').value = /Postleitzahl|PLZ/i.test(q) ? '91207' : '1000'; $('sfWeiter').click(); await warte(20); continue; }
    if ($('sfNichts')) { $('sfNichts').click(); await warte(20); continue; }
    const b = $('schritte').querySelector('[data-i]'); if (b) { b.click(); await warte(20); continue; }
    $('sfWeiter').click(); await warte(20);
  }
  check('Netto-Frage erreicht', frage() === de['sf.q.netto'], frage());
  $('sfIn').value = '0'; $('sfWeiter').click(); await warte(10);
  check('Netto 0 € bei Brutto > 0: freundlicher Hinweis, kein Fehler', !$('sfWarn').hidden && $('sfWarn').textContent === de['sux.p.netto0'] && !$('sfWarn').classList.contains('fehler'));
  $('sfWeiter').click(); await warte(20);
  check('Zweites „Weiter“: Eingabe gilt, nächste Frage', frage() !== de['sf.q.netto'], frage());

  // Weitere Punkte
  d.querySelector('#appnav button[data-ansicht="start"]').click(); await warte(20);
  // Startseite zeigt nur die zwei Einstiege (Wunsch David, 24.11.2026); die Telefon-Karte steht auf beiden Folgeseiten
  check('Start: keine Telefon-Karte mehr (nur zwei Einstiege)', !d.querySelector('#v-start #varSprechen'));
  $('goSelbst').click(); await warte(20);
  check('„Selbst“: Karte „Lieber mit jemandem sprechen?“ mit Bürgertelefon', !!$('varSprechen') && /tel:\+4930340606602/.test($('varSprechen').innerHTML) && $('varSprechenH').textContent === de['sux.sprechen.h']);
  d.querySelector('#appnav button[data-ansicht="start"]').click(); await warte(20);
  check('Start: Lupe mit Wort „Suchen“', ($('suLupeStart').textContent || '').trim() === de['su.suchen']);
  $('goBriefe').click(); await warte(20);
  check('Brief prüfen: Rentenversicherung, Versorgungsamt, Krankenkasse', ['brief-rv', 'brief-va', 'brief-kk'].every((id) => !!$(id)) && $('brief-rv').textContent.includes(de['sux.briefe.rv']));
  $('brief-rv').click(); await warte(20);
  check('… öffnet die allgemeine Brief-Hilfe', !$('checkBox').hidden && /Rentenversicherung/.test($('h-briefe').textContent));
  const zeilen = [...d.querySelectorAll('#einstListe .zeile')].map((b) => b.getAttribute('data-seite'));
  check('Einstellungen: „Für Fachkräfte“ am Ende', zeilen[zeilen.length - 1] === 'fach', zeilen);
  check('Löschen: ohne Schulden-Liste und Pfändungsrechner', !/Schulden|Pfändung/.test(de['clear.teil.mehr'] + de['l.einsKurz']) && !gebaut.html.includes("window.Schulden ? ['sl.ordner']"));
  check('Rückgängig in der Variante 30 Sekunden', /VAR_PFLEGE \? 30000 : 10000/.test(gebaut.html));
  check('Keine Skriptfehler im Ablauf', errors.length === 0, errors);
  console.log(fails ? fails + ' Fehler' : 'Variante Pflege, kurzer Pfad: alles ok');
  process.exit(fails ? 1 : 0);
})();
