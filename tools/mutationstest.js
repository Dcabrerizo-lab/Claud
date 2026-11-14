// Mutationstest: baut absichtlich Fehler in die Regeln ein (src/rules.js) und prüft, dass die Tests jeden davon finden.
// Ein Fehler, den kein Test bemerkt, zeigt eine Lücke in den Tests. Aufruf: npm run test:mutation
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
// [Beschreibung, Original, Fehler]
const M = [
  ['Wohngeld: ausgezahlte Beträge der ausführlichen Version wie Brutto behandelt', 'const AUSZ = { alg: 1, kg: 1, eg: 1, wfbm: 1 };', 'const AUSZ = {};'],
  ['2027: Wohngeld-Tipp auch nach dem Jahreswechsel', "h.heute < 2027 && r.level !== 'na' ? [['plan.wgDez']]", "r.level !== 'na' ? [['plan.wgDez']]"],
  ['2027: Pflegegeld-Hinweis auch ohne Pflegegrad', "offen(r) && (h.pflegegrad >= 2 || h.pflegeAntrag)) add([['plan.pflege'", "offen(r)) add([['plan.pflege'"],
  ['Künftige Leistung: keine zweite Rechnung', '    if (zk) { wg = mitZukunft(', '    if (false) { wg = mitZukunft('],
  ['Künftige Leistung: Elterngeld auch bei Paaren', "h.baby === 'bald' && h.adults === 1 && h.egVor != null", "h.baby === 'bald' && h.egVor != null"],
  ['Künftige Leistung: Lohn bleibt zusätzlich', 'netto: Math.max(0, h.netto - netto1) + betrag, aus1: true', 'netto: h.netto + betrag, aus1: true'],
  ['Unterhalt: Abzug SGB II auch ohne Titel', 'uzSGB: uzTitel ? uzBetrag : 0,', 'uzSGB: uzBetrag,'],
  ['Unterhalt: kein Abzug SGB II', "- (h.vPausch || 0) - (h.uzSGB || 0));", "- (h.vPausch || 0));"],
  ['Unterhalt: Wohngeld-Höchstbetrag je Kind 300 €', 'uzWG: { kind: 250, ex: 500 },', 'uzWG: { kind: 300, ex: 500 },'],
  ['Unterhalt: Wohngeld ohne Titel schon vorsichtig abgezogen', 'const uzWGpess = uzTitel ? Math.min(uzBetrag, uzCap) : 0,', 'const uzWGpess = Math.min(uzBetrag, uzCap),'],
  ['Elterngeld: Untergrenze 65 % fehlt', 'q = Math.max(E.satzHoch, E.satz - Math.floor', 'q = Math.max(0, E.satz - Math.floor'],
  ['Elterngeld: 0,1 Punkte je 4 statt 2 €', 'Math.floor((E.grenzeUnten - n) / 2)', 'Math.floor((E.grenzeUnten - n) / 4)'],
  ['Elterngeld: Mindestbetrag 300 € fehlt', 'return Math.min(E.max, Math.max(E.min, n * q));', 'return Math.min(E.max, n * q);'],
  ['Elterngeld: 12 statt 14 Monate', 'const monate = R.eg.monate + R.eg.partner;', 'const monate = R.eg.monate;'],
  ['Hilfe zur Pflege: Grenze 1,5 statt 2 Regelsätze', 'hzp: { grund: 2, familie: 0.7 }', 'hzp: { grund: 1.5, familie: 0.7 }'],
  ['Hilfe zur Pflege: Familienzuschlag 80 %', 'hzp: { grund: 2, familie: 0.7 }', 'hzp: { grund: 2, familie: 0.8 }'],
  ['Blindenhilfe auch bei Sehbehinderung', "if (h.blind !== 'blind') return mk(id, 'nein'", "if (!h.blind) return mk(id, 'nein'"],
  ['Blindenhilfe: 60 % statt 40 %', 'blh: { einsatzUeber: 0.4 }', 'blh: { einsatzUeber: 0.6 }'],
  ['Blindenhilfe: Asyl ohne Hinweis', "if (h.asyl) return mk(id, 'vielleicht', 'vielleicht', [['blh.asyl']]);", ''],
  ['Asyl: Grundsicherungsgeld nicht ausgeschlossen', "    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);\n    if (h.alter || h.erwerbsgemindert) {", '    if (h.alter || h.erwerbsgemindert) {'],
  ['Asyl: Grundsicherung im Alter nicht ausgeschlossen', "    if (h.asyl) return mk(id, 'nein', 'ausschluss', [['ggeld.asyl']]);\n    if (!h.alter && !h.erwerbsgemindert && !h.alterGrenz)", '    if (!h.alter && !h.erwerbsgemindert && !h.alterGrenz)'],
  ['Asyl: Wohngeld nicht ausgeschlossen', "if (h.asyl) return mk(id, 'nein', 'ausschluss', [['wohngeld.asyl']]);", ''],
  ['Asyl: Kinderzuschlag nicht ausgeschlossen', "if (h.asyl) return mk(id, 'nein', 'ausschluss', [['kiz.asyl']]);", ''],
  ['Asyl: Rundfunk-Befreiung fehlt', "if (h.asyl) return mk(id, 'vielleicht', 'butMoeglich', [['rundfunk.asyl']]);", ''],
  ['Asyl: Kindergeld sicher statt möglich', "if (h.asyl) return mk(id, 'vielleicht', 'vielleicht', [['kindergeld.asyl']]);", ''],
  ['Landespflegegeld: noch 1.000 € statt 500 €', "lpg: { betrag: 500, stand: '2026' }", "lpg: { betrag: 1000, stand: '2026' }"],
  ['Landespflegegeld auch außerhalb Bayerns', "if (h.land && h.land !== 'BY') return mk(id, 'nein', 'land', [['lpg.land']]);", ''],
  ['Familiengeld-Hinweis auch außerhalb Bayerns', "const bay = !h.land || h.land === 'BY';", 'const bay = true;'],
  ['Landesblindengeld außerhalb Bayerns wieder „schon vorhanden“', "if (h.blind !== 'blind') return mk(id, 'vielleicht', 'vielleicht', [['blindengeld.hochLand']]);", "return mk(id, 'na', 'land', [['land.blindengeld']]);"],
  ['Minijob-Grenze 2027 nicht umgestellt', 'minijob: heute >= 2027 ? R.minijob2027 : R.minijob,', 'minijob: R.minijob,'],
  ['Kinderkrankentage 2027 nicht umgestellt', 'const T = h.heute >= 2027 ? R.kkg[2027] : R.kkg[2026];', 'const T = R.kkg[2026];'],
  ['Mutterschaftsgeld 14 statt 13 € je Tag', 'mutter: { tag: 13,', 'mutter: { tag: 14,'],
  ['Mutterschaftsgeld auch ohne Arbeit', "if (!lohn.length && !alg) return mk(id, 'nein', 'vorausFehlt', [['mu.ohne']]);", ''],
  ['Landesblindengeld Hessen 800 statt 818,65 €', 'HE: 818.65,', 'HE: 800,'],
  ['Blindenhilfe 900 statt 951,92 €', 'blhBetrag: { erw: 951.92,', 'blhBetrag: { erw: 900,'],
  ['WBS NRW Grenze 25.000 statt 23.540 €', 'NW: { ein: 23540,', 'NW: { ein: 25000,'],
  ['WBS: falsches „nein“ ohne Reserve', 'grenze * L.hoch * 1.05)', 'grenze * L.hoch)'],
  ['Kita-Hinweis auch ohne kleine Kinder', 'const kita = h.kidsU6 > 0 ?', 'const kita = true ?'],
  ['ALG I: Sperrzeit 8 statt 12 Wochen', 'sperrWochen: 12', 'sperrWochen: 8'],
  ['ALG I: Nebeneinkommen 100 statt 165 €', 'nebenFrei: 165', 'nebenFrei: 100'],
  ['Kindergeld: Hinweis 21/25 fehlt', "[['kindergeld.ja', { kg: eur(R.kindergeld) }], ['kindergeld.mehr']]", "[['kindergeld.ja', { kg: eur(R.kindergeld) }]]"],
  ['Wohngeld: Elterngeld 300 € zählt doch', "const zaehlt = x[0] === 'eg' ? Math.max(0, x[1] - R.elterngeldFrei) : x[1];", 'const zaehlt = x[1];'],
  ['Wohngeld: Freibetrag Alleinerziehende fehlt', 'if (h.alleinerz) freib += R.wohngeld.freibetragAlleinerzMonat;', ''],
  ['Wohngeld: Freibetrag Kindereinkommen fehlt', 'wgKindFrei: 100', 'wgKindFrei: 0'],
  ['Grundsicherung: Grundrentenfreibetrag ohne Deckel', 'R.grundrente.max * rs1);', 'R.grundrente.max * rs1 * 2);'],
  ['Grundsicherungsgeld: Elterngeld 300 € nicht frei', "egFreiSGB: sumIf((a, b) => a === 'eg' && b > R.elterngeldFrei ? R.elterngeldFrei : 0)", "egFreiSGB: sumIf(() => 0)"],
  ['Grundsicherungsgeld: Unterhalt ohne Deckel', 'return Math.min(eink, Math.max(0, kinderBedarf - h.children * R.kindergeld));', 'return eink;'],
  ['Blindengeld: Pflegegrad 2 mit 33 %', '(h.pflegegrad === 2 ? 0.46 : 0.33)', '(h.pflegegrad === 2 ? 0.33 : 0.33)'],
  ['Zuzahlung: chronisch schon ab GdB 50', 'if (gdbNum(h) >= 60 || h.pflegegrad >= 3)', 'if (gdbNum(h) >= 50 || h.pflegegrad >= 3)'],
  ['Ausweis: Gleichstellung erst ab 40', "if (gdbEff(h) && g >= 30) return", "if (gdbEff(h) && g >= 40) return"],
  ['Grundsicherungsgeld: Freibetrag 30 % statt 20 %', 'if (b > 100) f += 0.2 * (Math.min(b, 520) - 100);', 'if (b > 100) f += 0.3 * (Math.min(b, 520) - 100);'],
  ['Grundsicherungsgeld: Grenze 1.500 € auch ohne Kind', 'const cap = mitKindern ? 1500 : 1200;', 'const cap = 1500;'],
  ['UVG: Grenze ab 12 Jahren fehlt', 'if (h.kinder12 && h.brutto < R.uvg.min12)', 'if (false)'],
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
for (const d of ['src', 'test', 'docs', 'dist']) fs.cpSync(path.join(ROOT, d), path.join(tmp, d), { recursive: true });
// Einzelne Dateien, die die Tests zusätzlich lesen (Name der App, Webseite)
for (const f of ['site', 'datenschutz.html', 'README.md', 'app/capacitor.config.json', 'app/android/app/src/main/res/values/strings.xml', 'app/android/app/build.gradle', 'app/ios/App/App/Info.plist', 'app/ios/App/App.xcodeproj/project.pbxproj']) {
  fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
  fs.cpSync(path.join(ROOT, f), path.join(tmp, f), { recursive: true });
}
const orig = fs.readFileSync(path.join(ROOT, 'src', 'rules.js'), 'utf8');
const TESTS = ['test.js', 'test-strict.js', 'test-beh.js', 'test-faelle.js', 'test-raster.js ' + (process.env.MUT_RASTER || 8000), 'test-pruefliste.js', 'test-einfach-gleich.js 3000', 'test-eigenschaften.js ' + (process.env.MUT_EIGEN || 3000)];
const laeuft = () => { try { for (const t of TESTS) execSync('node test/' + t, { cwd: tmp, stdio: 'ignore' }); return true; } catch (e) { return false; } };

let unentdeckt = 0, geprueft = 0;
for (const [name, alt, neu] of M) {
  if (orig.split(alt).length !== 2) { console.log('UNGÜLTIG (Stelle nicht genau einmal gefunden): ' + name); unentdeckt++; continue; }
  fs.writeFileSync(path.join(tmp, 'src', 'rules.js'), orig.replace(alt, neu));
  geprueft++;
  if (laeuft()) { unentdeckt++; console.log('NICHT ENTDECKT: ' + name); } else console.log('entdeckt: ' + name);
}
fs.writeFileSync(path.join(tmp, 'src', 'rules.js'), orig);
const sauber = laeuft();
fs.rmSync(tmp, { recursive: true, force: true });
if (!sauber) { console.log('Ohne Fehler laufen die Tests nicht durch – erst npm test reparieren.'); process.exit(1); }
console.log(unentdeckt ? '\n' + unentdeckt + ' von ' + geprueft + ' eingebauten Fehlern NICHT entdeckt' : '\nMutationstest bestanden: alle ' + geprueft + ' eingebauten Fehler wurden von den Tests entdeckt');
process.exit(unentdeckt ? 1 : 0);
