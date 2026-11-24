// Tests: SoLo für Rente & Pflege, Seiten src/senioren.js (sen-antrag, sen-angehoerige, sen-selbst)
// - Werte in SENIOREN.WERTE stimmen mit der Quelltabelle überein (Soll aus docs/entwuerfe/senioren-quellen.md) und haben Recht + amtliche Quelle
// - Beträge aus den Rechenregeln werden übernommen (keine doppelte Wahrheit)
// - Jeder benutzte Schlüssel steht in src/lang/senioren/de.json und hat eine einfache Fassung; kein Platzhalter bleibt offen
// Eigenständig: node test/test-senioren.js
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.join(__dirname, '..');
const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lang/senioren/de.json'), 'utf8'));
const ein = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lang/einfach/senioren.json'), 'utf8'));
const fehler = [];
const ok = (b, m) => { if (!b) fehler.push(m); };

// Soll-Werte (Quelltabelle): bei einer Gesetzesänderung hier UND in senioren.js und der Quellen-Datei ändern
const SOLL = { beratungTage: 14, bescheidArbeitstage: 25, verzugJeWoche: 70, widerspruchMonate: 1, akutTage: 10, pugProzent: 90,
  pflegezeitMonate: 6, pflegezeitBeschaeftigte: 15, pflegezeitAnkuendigung: 10, letzteLebensphaseMonate: 3, fpzMonate: 24,
  fpzBeschaeftigte: 25, fpzStunden: 15, rvStunden: 10, rvTage: 2, rvArbeitMax: 30 };
const AMTLICH = /^https:\/\/www\.(gesetze-im-internet\.de|bundesgesundheitsministerium\.de)\//;

const dom = new JSDOM('<!doctype html><body><div id="b"></div></body>', { runScripts: 'outside-only' });
const w = dom.window;
w.I18N = { de };
w.eval(fs.readFileSync(path.join(ROOT, 'src/rules.js'), 'utf8') + '\nwindow.Rules = Rules;');
w.eval(fs.readFileSync(path.join(ROOT, 'src/senioren.js'), 'utf8'));
const S = w.SENIOREN;
ok(S && typeof S.render === 'function', 'window.SENIOREN.render fehlt');

// Werte
Object.keys(SOLL).forEach((k) => ok(S.WERTE[k] && S.WERTE[k].wert === SOLL[k], 'Wert ' + k + ': ' + (S.WERTE[k] && S.WERTE[k].wert) + ' statt ' + SOLL[k]));
Object.keys(S.WERTE).forEach((k) => {
  ok(k in SOLL, 'Wert ohne Soll in der Quelltabelle: ' + k);
  ok(/^§/.test(S.WERTE[k].recht), 'Rechtsgrundlage fehlt: ' + k);
  ok(AMTLICH.test(S.WERTE[k].quelle), 'keine amtliche Quelle: ' + k);
});
ok(/^\+49\d+$/.test(S.BMG_TEL.tel) && AMTLICH.test(S.BMG_TEL.quelle), 'Bürgertelefon: Nummer oder Quelle ungültig');
const karten = require(path.join(ROOT, 'test/karten.js'));
S.KARTEN_SELBST.forEach((id) => { ok(karten.indexOf(id) >= 0, 'unbekannte Karte: ' + id); ok(('sen.selbst.' + id) in de, 'Text fehlt: sen.selbst.' + id); });

// Seiten bauen
const box = w.document.getElementById('b');
const R = w.Rules.RULES;
const eur = (x) => Number(x).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
S.seiten.forEach((id) => {
  ok(S.render(id, box) === true, 'render ' + id + ' liefert nicht true');
  const txt = box.textContent;
  ok(!/\bsen\.[a-z]/.test(txt), id + ': Schlüssel ohne Text: ' + (txt.match(/\bsen\.[\w.]+/) || [''])[0]);
  ok(!/\{\w+\}/.test(txt), id + ': offener Platzhalter: ' + (txt.match(/\{\w+\}/) || [''])[0]);
  ok(box.querySelector('h2'), id + ': Überschrift fehlt');
  if (id === 'sen-angehoerige') {
    [R.entlastungsbudget, R.pflege.entlastung, R.beh.verbrauch, R.beh.wohnumfeld, R.pflegePausch[2], R.pflegePausch[3], R.pflegePausch[4]].forEach((b) =>
      ok(txt.indexOf(eur(b)) >= 0, id + ': Betrag aus den Rechenregeln fehlt: ' + eur(b)));
    const a = box.querySelector('a[href^="tel:"]');
    ok(a && a.getAttribute('href') === 'tel:' + S.BMG_TEL.tel, id + ': tel-Link fehlt');
  }
  if (id === 'sen-antrag') ok(txt.indexOf(eur(70)) >= 0 && txt.indexOf('25 Arbeitstage') >= 0, id + ': Frist/Betrag § 18c fehlt');
});
ok(S.render('gibtsnicht', box) === false, 'unbekannte Seite muss false liefern');

// Navigation: ohne opt.navigiere ein Ereignis
let ziel = null;
S.render('sen-antrag', box);
box.addEventListener('sen-navigiere', (e) => { ziel = e.detail.ziel; });
box.querySelector('[data-sen-ziel]').click();
ok(ziel === 'pflege-einschaetzen', 'Ereignis sen-navigiere fehlt');

// Schlüssel: alle in senioren.js benutzten gibt es, und jede einfache Fassung gehört zu einem deutschen Schlüssel
const code = fs.readFileSync(path.join(ROOT, 'src/senioren.js'), 'utf8');
(code.match(/'sen\.[\w.]+'/g) || []).map((s) => s.slice(1, -1)).forEach((k) => {
  if (/\.$/.test(k)) return; // Präfix wie 'sen.antrag.liste.'
  ok(k in de, 'Schlüssel fehlt in de.json: ' + k);
});
Object.keys(de).forEach((k) => ok(k in ein, 'einfache Fassung fehlt: ' + k));
Object.keys(ein).forEach((k) => ok(k in de, 'einfach ohne deutschen Schlüssel: ' + k));
Object.keys(ein).forEach((k) => { if (ein[k] !== '=' && k in de) ok(ein[k].match(/\{\w+\}/g) === null || (ein[k].match(/\{\w+\}/g) || []).every((p) => de[k].indexOf(p) >= 0), 'neuer Platzhalter einfach: ' + k); });

if (fehler.length) { console.log('FEHLER Senioren:\n- ' + fehler.join('\n- ')); process.exit(1); }
console.log('Senioren-Seiten: ' + S.seiten.length + ' Seiten, ' + Object.keys(S.WERTE).length + ' eigene Werte, ' + Object.keys(de).length + ' Texte: OK');
