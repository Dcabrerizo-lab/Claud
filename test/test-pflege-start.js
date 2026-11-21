// Pflege-Startkachel in der Oberfläche: Auswahl mit zwei großen Knöpfen, Pflegegrad-Frage, Übersicht nur mit dem,
// was beim Pflegegrad gilt (wichtigste offen, Rest unter „Weitere“), „Zurück“-Wege und Sprung aus der Einschätzung.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const I18N = require('../dist/i18n.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sozialleistungslotse.html'), 'utf8');
const errors = [], store = {};
const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(w) {
    w.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
    w.HTMLElement.prototype.scrollIntoView = function () {}; w.scrollTo = function () {};
    Object.defineProperty(w.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true });
    Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } }, configurable: true });
  }
});
const w = dom.window, d = w.document;
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else console.log('ok  ', n); };
const ansicht = () => d.getElementById('app').getAttribute('data-ansicht');
const box = () => d.getElementById('puInhalt');
const knopf = (txt) => [...box().querySelectorAll('button')].find((b) => b.textContent.trim() === txt);
// gemeinsamer Zurück-Knopf oben (src/navigation.js); die Navigation gleicht den Verlauf danach ab
const oben = () => d.querySelector('#v-pflegestart [data-nav-zurueck]');
const offen = () => [...box().querySelectorAll(':scope > .pu-l, :scope > .pu-gruppe > .pu-l')].map((s) => s.id.replace('pu-l-', ''));
const weitere = () => [...box().querySelectorAll('#pu-weitere .pu-l')].map((s) => s.id.replace('pu-l-', ''));
const de = I18N.de;

setTimeout(() => {
  check('Keine Skriptfehler beim Laden', errors.length === 0, errors.join('; '));
  d.getElementById('goPflege').click();
  check('Kachel „Pflege“ öffnet die Auswahl', ansicht() === 'pflegestart' && !d.getElementById('v-pflegestart').hidden);
  const wege = [...box().querySelectorAll('.weg-liste .weg')];
  check('Auswahl: zwei große Knöpfe, zuerst Unterstützung, dann Einschätzung', wege.length === 2 && wege[0].id === 'pu-hilfe' && wege[1].id === 'pu-schaetzen' && wege[0].textContent.indexOf(de['pu.hilfe']) >= 0 && wege[1].textContent.indexOf(de['pu.schaetzen']) >= 0);
  check('Kein zweiter Zurück-Knopf unten', !knopf(de['pf.zurueck']));
  oben().click();
  check('Zurück in der Auswahl führt zum Start', ansicht() === 'start');
  d.getElementById('goPflege').click();
  d.getElementById('pu-hilfe').click();
  const pgs = [...box().querySelectorAll('.wahl-raster .wahl')].map((b) => b.getAttribute('data-pg'));
  check('Unterstützung fragt zuerst den Pflegegrad (1–5, noch keiner)', pgs.join() === '1,2,3,4,5,0' && box().textContent.indexOf(de['pu.pg.keiner']) >= 0, pgs);
  oben().click();
  check('Zurück bei der Pflegegrad-Frage führt zur Auswahl', !!d.getElementById('pu-hilfe'));
  d.getElementById('pu-hilfe').click();
  box().querySelector('.wahl[data-pg="3"]').click();
  const t3 = box().textContent;
  check('Pflegegrad 3: Überschrift', /Das gibt es bei Pflegegrad 3/.test(t3));
  check('Pflegegrad 3: sechs wichtigste Leistungen offen', offen().join() === 'geld,dienst,kombi,entl,verh,tages', offen());
  check('[rot-d] Pflegegrad 3: erst „Wer pflegt?“ (Pflegegeld, Pflegedienst, gemischt), dann „Zusätzlich (kein Geld aufs Konto …)“', [...d.querySelectorAll('#pu-wer > .pu-l')].map((x) => x.id).join() === 'pu-l-geld,pu-l-dienst,pu-l-kombi' && /^Zusätzlich \(kein Geld aufs Konto/.test(d.querySelector('#pu-zusatz .pu-gruppe-h').textContent) && [...d.querySelectorAll('#pu-zusatz > .pu-l')].length === 3);
  check('[rot-d] Kombination: 6 Monate Bindung sichtbar; Pflicht-Beratung sichtbar unter Pflegegeld', /An die Aufteilung bist du 6 Monate gebunden/.test(d.querySelector('#pu-l-kombi .pu-wichtig').textContent) && /kann die Pflegekasse das Pflegegeld kürzen/.test(d.querySelector('#pu-l-geld .pu-wichtig').textContent));
  check('Pflegegrad 3: Rest unter „Weitere“, zugeklappt', weitere().length === 8 && d.getElementById('pu-weitere').open === false && /Weitere Leistungen \(8\)/.test(t3));
  check('Pflegegrad 3: Pflegegeld 599 € pro Monat', /599 €\s*pro Monat/.test(d.getElementById('pu-l-geld').textContent));
  check('Pflegegrad 3: Pflegedienst bis 1.497 € pro Monat', /bis 1\.497 €\s*pro Monat/.test(d.getElementById('pu-l-dienst').textContent));
  check('[pu-ansicht] Jahresbudget als „pro Jahr“ (3.539 €) markiert', /bis 3\.539 €\s*pro Jahr/.test(d.getElementById('pu-l-verh').textContent) && !!d.querySelector('#pu-l-verh .pu-jahr'));
  check('Alltagswort vorn, Amtswort in Klammern', d.querySelector('#pu-l-geld h3').textContent === 'Geld für die Pflege zu Hause (Pflegegeld)' && /\(Verhinderungs- und Kurzzeitpflege\)$/.test(d.querySelector('#pu-l-verh h3').textContent));
  check('[pu-fed] Verhinderungspflege: stundenweise und Familienentlastender Dienst erklärt', /stundenweise/.test(d.getElementById('pu-l-verh').textContent) && /Familienentlastende Dienste/.test(d.getElementById('pu-l-verh').textContent));
  check('Entlastungsbetrag: Familienentlastender Dienst bezahlbar, wenn anerkannt', /Familienentlastender Dienst \(FED\) kann so bezahlt werden, wenn er in deinem Bundesland anerkannt ist/.test(d.getElementById('pu-l-entl').textContent));
  check('Kombination mit Rechenbeispiel aus den Regeln (PG 3: 299,50 €)', /Beispiel Pflegegrad 3: Der Pflegedienst nutzt die Hälfte \(748,50 €\)\. Dann kommen noch 299,50 € Pflegegeld/.test(d.getElementById('pu-l-kombi').textContent), d.getElementById('pu-l-kombi').textContent);
  check('[recht-geltend] Kein Satz zu einer geplanten Pflegereform (nur geltendes Recht)', !/Pflegereform|geplant|nicht beschlossen|Entwurf/.test(t3));
  check('[pu-korr] Beratungsbesuch nach § 37 Abs. 3 SGB XI: Pflicht halbjährlich ab PG 2, PG 4/5 auf Wunsch vierteljährlich', /Mit Pflegegeld kommt einmal im halben Jahr eine kostenlose Pflicht-Beratung/.test(d.getElementById('pu-l-geld').textContent) && /Pflegegrad 4 und 5 geht das auf Wunsch auch jedes Vierteljahr/.test(d.getElementById('pu-l-geld').textContent) && !/4 und 5 einmal im Vierteljahr/.test(t3));
  check('[pu-korr] Verhinderungspflege durch Angehörige: Doppeltes Pflegegeld plus nachgewiesene Kosten', /Personen aus demselben Haushalt \(nicht beruflich\).*Doppelte des monatlichen Pflegegeldes\. Nachgewiesene Kosten wie Fahrt oder Verdienstausfall/.test(d.getElementById('pu-l-verh').textContent));
  check('[pu-korr] Aufs Konto: Pflegegeld und Wohngruppenzuschlag', /Aufs Konto kommen nur das Pflegegeld und, wer in einer ambulant betreuten Wohngruppe lebt, der Wohngruppenzuschlag/.test(t3));
  check('Stand und Quelle genannt', /Stand der Beträge: 14\.9\.2026 \(Bundesministerium für Gesundheit/.test(t3));
  check('Stellen nur als Art (Pflegekasse, Pflegestützpunkt), keine Anschrift', /Pflegestützpunkt/.test(t3) && !/\b\d{5}\b/.test(t3));
  check('[rot-d] „Mehr dazu“ mit eindeutigem aria-label, ohne Beratungsmodus keine Paragrafen', d.querySelector('#pu-l-geld summary').getAttribute('aria-label') === 'Mehr dazu: Geld für die Pflege zu Hause (Pflegegeld)' && !/Rechtsgrundlage/.test(t3));
  const einl = box().querySelector('.pu-einl');
  check('[pu-aufr] Einleitung: ein Satz sichtbar, Rest zum Aufklappen (zu)', einl && einl.textContent.split(/[.!?](\s|$)/).filter((x) => x && x.trim()).length === 1 && box().querySelector('.pu-einl-mehr') && !box().querySelector('.pu-einl-mehr').open, einl && einl.textContent);
  const tipp = box().querySelector('details.tipp[data-tipp="pu.tipp.beratung"]');
  check('[pu-aufr] Hinweis Pflegekasse/Pflegestützpunkt als Tipp mit Symbol', tipp && tipp.querySelector('.tipp-sym svg') && tipp.querySelector('.tipp-kurz').textContent === de['pu.tipp.beratung.kurz']);
  const hk = d.getElementById('pu-schaetzen-knopf');
  check('[pu-aufr] Mit Pflegegrad: Nebenknopf „Höherstufung prüfen“ direkt unter den Leistungen', hk && hk.className === 'btn ghost' && hk.textContent === de['pa.hoeher'] && (hk.parentElement.previousElementSibling.classList.contains('pu-l') || hk.parentElement.previousElementSibling.classList.contains('pu-gruppe')) && hk.parentElement.nextElementSibling.id === 'pu-weitere');
  oben().click();
  box().querySelector('.wahl[data-pg="1"]').click();
  const t1 = box().textContent;
  check('Pflegegrad 1: kein Pflegegeld, keine Verhinderungspflege', !d.getElementById('pu-l-geld') && !d.getElementById('pu-l-verh') && !d.getElementById('pu-l-rente') && /noch kein Pflegegeld/.test(t1));
  check('Pflegegrad 1: Entlastungsbetrag, Hilfsmittel, Umbau, Beratung offen', offen().join() === 'entl,hilfs,umbau,beratung', offen());
  check('Pflegegrad 1: Entlastungsbetrag auch für Pflegedienst bei der Körperpflege', /Pflegegrad 1 darf damit auch ein Pflegedienst/.test(d.getElementById('pu-l-entl').textContent));
  oben().click();
  box().querySelector('.wahl[data-pg="0"]').click();
  check('Ohne Pflegegrad: Beratung und Kurse, Hinweis auf den Antrag', offen().join() === 'beratung,kurs' && /Den Antrag stellst du bei der Pflegekasse/.test(box().textContent) && !d.getElementById('pu-weitere'));
  check('[pu-korr] Ohne Pflegegrad: 10 Arbeitstage kurzzeitige Arbeitsverhinderung (§ 2 PflegeZG), auch bei voraussichtlicher Pflegebedürftigkeit', /bis zu 10 Arbeitstage/.test(box().textContent) && /voraussichtlich/.test(box().textContent));
  // Einschätzung aus der Auswahl: Zurück führt zur Auswahl
  if (typeof w.PflegeAssistent !== 'undefined' || d.getElementById('pu-schaetzen')) {
    d.getElementById('goPflege').click();
    const s = d.getElementById('pu-schaetzen');
    if (s && !s.hidden) {
      s.click();
      check('„Pflegegrad selbst einschätzen“ öffnet die Einschätzung', ansicht() === 'pflege' && d.getElementById('pflegeAssist').children.length > 0);
      const zur = [...d.querySelectorAll('#pflegeAssist button')].find((b) => /Zurück|Abbrechen/.test(b.textContent));
      if (zur) { zur.click(); check('Zurück aus der Einschätzung führt zur Auswahl', ansicht() === 'pflegestart' && !!d.getElementById('pu-hilfe')); }
    }
  }
  // [pflege-ergebnis] Ergebnisseite der Einschätzung: groß der Pflegegrad, Bedeutung, höchstens 3 Kacheln, gespeichert, Zurück-Wege
  const pa = () => d.getElementById('pflegeAssist');
  const titel = () => (d.getElementById('pa-q') || {}).textContent || '';
  d.getElementById('goPflege').click(); d.getElementById('pu-schaetzen').click();
  for (let i = 0; i < 120 && !/^Wahrscheinlich/.test(titel()); i++) {
    const inp = d.getElementById('pa-jahre');
    if (inp) { inp.value = '84'; [...pa().querySelectorAll('button')].find((b) => /Weiter/.test(b.textContent)).click(); continue; }
    if (pa().querySelector('[data-m5]')) { pa().querySelector('[data-m5="5.1"]').click(); [...pa().querySelectorAll('button')].find((b) => /Weiter/.test(b.textContent)).click(); continue; }
    const k = [...pa().querySelectorAll('.es-wahl .es-btn')];
    if (/^Ja$/.test((k[0] || {}).textContent || '')) k[0].click(); else k[k.length - 1].click();
  }
  const pgE = (titel().match(/Pflegegrad (\d)/) || [])[1];
  check('[pflege-ergebnis] Nach der letzten Frage: Ergebnisseite „Wahrscheinlich Pflegegrad X“', ansicht() === 'pflege' && !!pgE, titel());
  check('[pflege-ergebnis] Hinweis: nur Einschätzung, Pflegekasse entscheidet', /Das ist eine Einschätzung\. Entscheiden tut die Pflegekasse\./.test(pa().textContent));
  check('[pflege-ergebnis] Bedeutung mit Beträgen aus den Regeln (Pflegegeld, Pflegedienst)', new RegExp('Pflegegeld: ' + require('../src/rules.js').RULES.pflege.geld[pgE] + ' €').test(pa().querySelector('.pa-bedeutung').textContent) && /Pflegedienst: bis/.test(pa().querySelector('.pa-bedeutung').textContent), pa().querySelector('.pa-bedeutung').textContent);
  const kach = [...pa().querySelectorAll('.pa-kacheln > .uk-karte')];
  check('[pflege-ergebnis] Drei Kacheln in Reihenfolge: Pflegegrad beantragen, Mit dem Gutachten vergleichen, Was steht mir zu?', kach.length === 3 && kach[0].classList.contains('pa-k-antrag') && kach[1].classList.contains('pa-k-gutachten') && kach[2].classList.contains('pa-k-hilfen') && /Pflegegrad beantragen/.test(kach[0].textContent), kach.map((x) => x.textContent));
  check('[pflege-ergebnis] Kachel „Mit dem Gutachten vergleichen“ mit Untertitel', /Mit dem Gutachten vergleichen/.test(kach[1].textContent) && /Gutachten vom Medizinischen Dienst scannen oder einfügen/.test(kach[1].textContent), kach[1].textContent);
  const reihe = [...pa().children].map((x) => x.className);
  check('[pflege-ergebnis] Reihenfolge: erst Ergebnis und Bedeutung, dann Kacheln', reihe.findIndex((c) => /pa-bedeutung/.test(c)) < reihe.findIndex((c) => /pa-kacheln/.test(c)) && reihe.findIndex((c) => /pa-kacheln/.test(c)) < reihe.findIndex((c) => /pa-punkte-box/.test(c)), reihe);
  check('[pflege-ergebnis] Keine großen Knöpfe mehr, nur Textlinks', pa().querySelectorAll('.btn').length === 0 && !!pa().querySelector('.pa-aendern'));
  check('[pflege-ergebnis] Aus der Pflege-Startseite: kein Sprung in den Leistungs-Check', !/Leistungs-Check/.test(pa().textContent));
  check('[pflege-ergebnis] Punkte je Bereich zum Aufklappen', !!pa().querySelector('details.pa-punkte-box') && !pa().querySelector('details.pa-punkte-box').open);
  const gesp = JSON.parse(store['lotse.pflegecheck'] || '{}');
  check('[pflege-ergebnis] Ergebnis automatisch gespeichert', gesp.schaetzung && String(gesp.schaetzung.pg) === pgE, gesp.schaetzung);
  pa().querySelector('.pa-k-hilfen').click();
  check('[pflege-ergebnis] „Was steht mir zu?“ zeigt die Unterstützung beim Pflegegrad', ansicht() === 'pflegestart' && new RegExp('Das gibt es bei Pflegegrad ' + pgE).test(box().textContent));
  d.querySelector('#v-pflegestart [data-nav-zurueck]').click();
  check('[pflege-ergebnis] „← Zurück“ führt zur Ergebnisseite zurück', ansicht() === 'pflege' && /^Wahrscheinlich/.test(titel()));
  pa().querySelector('.pa-k-gutachten').click();
  check('[pflege-ergebnis] Gutachten vergleichen öffnet den Brief der Pflegekasse, Knopf heißt „← Zurück“', ansicht() === 'briefe' && /^← Zurück$/.test(d.getElementById('briefZurueck').textContent.trim()) && !d.getElementById('briefKachelKopf').hidden);
  check('[pflege-vergleich] Gutachten-Prüfung offen, Selbsteinschätzung übergeben (noch ohne Gutachten-Werte keine Tabelle)', !d.getElementById('p-pflege').hidden && !d.getElementById('pf-vgl') && /Deine Einschätzung: Pflegegrad/.test((d.getElementById('pf-vergleich') || {}).textContent || ''), (d.getElementById('pf-vergleich') || {}).textContent);
  d.getElementById('pf-1.1').value = '0'; d.getElementById('pf-form2').dispatchEvent(new w.Event('input', { bubbles: true }));
  const vgl = d.getElementById('pf-vgl'), vz = vgl ? [...vgl.querySelectorAll('tbody tr')] : [];
  check('[pflege-vergleich] Vergleichstabelle: 6 Bereiche und Summe, Spalten Bereich, Deine Punkte, Gutachten, Unterschied', vz.length === 7 && /Bereich.*Deine Punkte.*Gutachten.*Unterschied/.test(vgl.querySelector('thead').textContent), vgl && vgl.textContent);
  const z1 = vz[0];
  check('[pflege-vergleich] Unterschied hervorgehoben, wo das Gutachten weniger Punkte gibt', !!z1 && z1.classList.contains('pv-mehr') && /^\+/.test(z1.querySelector('strong').textContent) && /Pflegegrad|kein Pflegegrad/.test(d.getElementById('pf-vgl-satz').textContent), z1 && z1.textContent);
  check('[pflege-vergleich] Tabelle steht im Ergebnis des Gutachtens', !!d.querySelector('#pf-erg #pf-vgl'));
  d.getElementById('briefZurueck').click();
  check('[pflege-ergebnis] Aus dem Brief zurück zur Ergebnisseite', ansicht() === 'pflege' && /^Wahrscheinlich/.test(titel()));
  pa().querySelector('.pa-k-antrag').click();
  check('[pflege-ergebnis] Antrag: Antragsmappe mit Pflegegeld, oben „← Zurück“', ansicht() === 'leistungen' && !d.getElementById('leistungenKopf').hidden && d.getElementById('pflegegrad').value === 'antrag');
  d.querySelector('#leistungenKopf [data-nav-zurueck]').click();
  check('[pflege-ergebnis] Aus der Antragsmappe zurück zur Ergebnisseite', ansicht() === 'pflege' && /^Wahrscheinlich/.test(titel()));
  pa().querySelector('.pa-zur').click();
  const le = d.getElementById('pu-letzte');
  check('[pflege-ergebnis] Pflege-Startseite: „Deine letzte Einschätzung: Pflegegrad X (Datum)“', ansicht() === 'pflegestart' && !!le && new RegExp('Deine letzte Einschätzung: Pflegegrad ' + pgE + ' \\(').test(le.textContent), le && le.textContent);
  check('[pflege-ergebnis] Pflege-Startseite: weiter genau zwei Kacheln', box().querySelectorAll('.weg-liste .weg').length === 2);
  le.querySelector('button').click();
  check('[pflege-ergebnis] „Ergebnis ansehen“ öffnet direkt die Ergebnisseite', ansicht() === 'pflege' && /^Wahrscheinlich/.test(titel()));
  pa().querySelector('.pa-zur').click(); d.querySelector('#v-pflegestart [data-nav-zurueck]').click();
  // Aus dem Leistungs-Check: dort gibt es den Weg zurück zur Karte
  d.getElementById('goLeistungen').click(); d.getElementById('paStart').click();
  check('[pflege-ergebnis] Aus dem Leistungs-Check: Link „Zurück zum Leistungs-Check“', ansicht() === 'pflege' && /Zurück zum Leistungs-Check/.test(pa().textContent));
  [...pa().querySelectorAll('.pa-links button')].find((b) => /Leistungs-Check/.test(b.textContent)).click();
  check('[pflege-ergebnis] Link führt zur Pflegekarte im Leistungs-Check', ansicht() === 'leistungen');
  // Englisch: Auswahl übersetzt, Übersicht mit Hinweis „nur Deutsch“
  const sel = d.getElementById('lang'); sel.value = 'en'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  d.getElementById('goPflege').click();
  check('Englisch: Auswahl übersetzt', d.getElementById('pu-hilfe').textContent.indexOf(I18N.en['pu.hilfe']) >= 0);
  d.getElementById('pu-hilfe').click(); box().querySelector('.wahl[data-pg="2"]').click();
  check('Englisch: Hinweis „nur Deutsch“ sichtbar', d.getElementById('puNurDe').hidden === false && d.getElementById('puNurDe').textContent === I18N.en['pu.nurDe']);
  check('[rot-d] Englisch: deutsche Übersicht als lang=de dir=ltr ausgezeichnet', box().getAttribute('lang') === 'de' && box().getAttribute('dir') === 'ltr');
  // Arabisch: Einschätzung bleibt Deutsch, aber als lang=de dir=ltr; „Zurück“ arabisch in RTL
  sel.value = 'ar'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  d.getElementById('goPflege').click(); d.getElementById('pu-schaetzen').click();
  const zk = pa().querySelector('.pa-zur');
  check('[rot-d] Arabisch: Einschätzung lang=de dir=ltr, Zurück arabisch und rtl', pa().getAttribute('lang') === 'de' && pa().getAttribute('dir') === 'ltr' && zk.getAttribute('lang') === 'ar' && zk.getAttribute('dir') === 'rtl' && zk.textContent.indexOf(I18N.ar['nav.zurueck']) >= 0, zk && zk.outerHTML);
  // Gutachten vergleichen (UX-Audit D #3): Bereiche zugeklappt mit Zähler, eigene Einschätzung oben, Alter übernommen
  const ber = [...d.querySelectorAll('#pf-module details.pf-bereich')];
  check('[rot-d] Gutachten: 6 Bereiche zugeklappt mit „x von n eingetragen“', ber.length === 6 && ber.every((x) => !x.open && /· \d+ von \d+ eingetragen$/.test(x.querySelector('summary').textContent)));
  d.getElementById('pf-alter').value = '1'; d.getElementById('pf-monate').value = '10'; d.getElementById('pf-alter').dispatchEvent(new w.Event('input', { bubbles: true }));
  check('[rot-d] Gutachten: Kind unter 18 Monaten – Bereich 5 klappt mit der neuen Frage auf', !d.getElementById('pf-zeile-5K').hidden && d.getElementById('pf-bereich-5').open);
  d.getElementById('pf-monate').value = '';
  d.getElementById('pf-alter').value = '';
  w.PruefpaketPflege.eigene({ stufen: { '1.1': 2 }, m5: {}, inkontinenz: { harn: false, stuhl: false }, alterJahre: '82' });
  check('[rot-d] Gutachten: eigene Einschätzung oben, Alter 82 übernommen, „Alles leeren“ nicht mehr oben', !d.getElementById('pf-eigen-oben').hidden && /^Deine Einschätzung in SoLo/.test(d.getElementById('pf-eigen-oben').textContent) && d.getElementById('pf-eigen-oben').nextElementSibling.id === 'pf-form2' && d.getElementById('pf-alter').value === '82' && !!d.getElementById('pf-leeren').closest('.pf-leeren-zeile'));
  check('Keine Skriptfehler im Test', errors.length === 0, errors.join('; '));
  console.log(fails ? fails + ' FEHLER (Pflege-Start)' : '[pflege-start] Pflege-Startkachel: Auswahl, Pflegegrad, Übersicht und Zurück-Wege stimmen');
  process.exit(fails ? 1 : 0);
}, 50);
