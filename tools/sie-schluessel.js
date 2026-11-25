// Sie-Ebene für „SoLo Pflege & Rente“ (Entscheidung David 24.11.2026: die Pflege-Variante siezt, SoLo duzt).
// Ermittelt reproduzierbar die übernommenen SoLo-Texte, die in der Pflege-Variante erreichbar sind und eine Du-Anrede enthalten.
// Aufruf: node tools/sie-schluessel.js [--json] [--fehlend]
//   ohne Option: Übersicht je Namensraum; --json: Liste der Schlüssel (für Übersetzungsarbeit);
//   --fehlend: erreichbare Du-Texte ohne Eintrag in src/lang/sie/de.json (Exit-Code 1, wenn welche fehlen)
// Nicht erfasst: Texte der neuen Namensräume der Variante (sen-ui, senioren, vorlesen – die sind selbst in Sie geschrieben)
// und Bereiche, die es in der Variante nicht gibt (Liste UNERREICHBAR unten; Quelle: Variantenblock in src/app.js).
'use strict';
const fs = require('fs');
const path = require('path');
const build = require('../scripts/build.js');

const ROOT = path.join(__dirname, '..');
// Leistungen, die es in der Pflege-Variante nicht gibt (Gegenstück zu VAR_KARTEN in src/app.js; alle Karten: test/karten.js)
const KARTEN = require('../test/karten.js');
const appJs = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
// Mit Kindern unter 25 im Haushalt kommen VAR_KARTEN_KINDER dazu (Frage „Kinder unter 25“, Auftrag David 25.11.2026)
const VAR_KARTEN = ['VAR_KARTEN', 'VAR_KARTEN_KINDER'].flatMap((n) => JSON.parse(appJs.match(new RegExp('var ' + n + ' = (\\[[^\\]]*\\])'))[1].replace(/'/g, '"')));
const KARTEN_AUS = KARTEN.filter((k) => !VAR_KARTEN.includes(k));
// Fragen und Felder, die die Variante ausblendet (VAR_FRAGEN_AUS, VAR_FELDER_AUS in src/app.js): Schlüssel mit gleichem ersten Segment
const liste = (name) => JSON.parse(appJs.match(new RegExp('var ' + name + ' = (\\[[^\\]]*\\])'))[1].replace(/'/g, '"').replace(/\s+/g, ' '));
const FRAGEN_AUS = [...new Set(liste('VAR_FRAGEN_AUS').concat(liste('VAR_FELDER_AUS')))];
// Namensräume, die in der Variante nicht erreichbar sind: Haushaltsplan, Schulden-Liste, Pfändung, „Geld und Schulden“ (Krisen-Check,
// Musterschreiben, Raten, Sparen im Alltag, Tarife, Inkasso-Prüfung), „Ich ziehe aus“
const UNERREICHBAR = ['hb', 'sl', 'pf', 'gs', 'kc', 'ms', 'ra', 'sp', 'tv', 'ip', 'az'];
// Aus „Schuldnerberatung“ ist in der Variante nur der Link zur Suche sichtbar (Ansicht „Geld im Alter“)
const SB_SICHTBAR = ['sb.finden.link', 'sb.finden.link.t'];
// Schlüssel zu weggefallenen Leistungen: zweites Segment ist eine Karten-ID (t.kindergeld.x, s.kiz.wo, fw.ggeld, f.uvg.hinweis …)
const KARTEN_PRAEFIXE = ['t', 's', 'fw', 'f', 'n', 'zu', 'd', 'w', 'card', 'unterlagen', 'u', 'nh'];
// Bescheid prüfen: Jobcenter und Familienkasse gibt es in der Variante nicht (brief-jc, brief-fk)
const BRIEF_AUS = /^bp\.(jc|fk)\b/;
// Texte zu weggefallenen Leistungen mit Kürzeln statt Karten-ID (Asylbewerberleistungen, Elterngeld, Kindergeld, Krankengeld, Mutterschaft,
// Hinweise für die Zukunft zu Arbeitslosengeld/Elterngeld, Kombinationen mit Grundsicherungsgeld/Kinderzuschlag)
// Kindergeld-Kürzel (t.kg, z.kgZuerst, z.wgKiz) sind mit Kindern unter 25 erreichbar.
const KUERZEL_AUS = /^(t\.(asyl|eg|krank|mu|zuk)|z\.(ggBezug|ggVsWg|zuk))\b/;

// Du-Anrede im Deutschen: Pronomen und Imperative (Liste aus allen Satzanfängen der App, von Hand ausgewählt)
const DU = /(^|[^\wäöüßÄÖÜ])(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|Du|Dich|Dir|Dein|Deine|Deinen|Deinem|Deiner|Deines|euch|euer|eure|euren|eurem|eurer)(?![\wäöüß])/;
const IMPERATIVE = ['Frag', 'Frage', 'Lass', 'Prüfe', 'Prüf', 'Trag', 'Trage', 'Melde', 'Schreib', 'Schreibe', 'Beantrage', 'Gib', 'Sag', 'Hol', 'Hole',
  'Wähle', 'Wähl', 'Stell', 'Tippe', 'Tipp', 'Nimm', 'Schick', 'Schicke', 'Lege', 'Leg', 'Sprich', 'Lies', 'Hake', 'Scanne', 'Versuche', 'Versuch', 'Unterschreibe',
  'Biete', 'Geh', 'Führe', 'Sammle', 'Bring', 'Bringe', 'Plane', 'Erkläre', 'Warte', 'Rechne', 'Vergleiche', 'Reich', 'Reiche', 'Lösche', 'Markiere', 'Markier',
  'Füge', 'Merke', 'Setze', 'Achte', 'Ergänze', 'Antworte', 'Bewahre', 'Mach', 'Mache', 'Nutze', 'Kündige', 'Zeig', 'Zeige', 'Heb', 'Hebe', 'Widersprich',
  'Handle', 'Speichere', 'Reagiere', 'Kümmere', 'Denk', 'Denke', 'Fang', 'Erledige', 'Entsperre', 'Ruf', 'Rufe', 'Erzähl', 'Erzähle', 'Tu', 'Behalte', 'Halte',
  'Schau', 'Such', 'Suche', 'Öffne', 'Kopiere', 'Klicke', 'Klick', 'Lade', 'Gehe', 'Sieh', 'Iss', 'Komm', 'Bleib', 'Bleibe', 'Ändere', 'Notiere', 'Wende',
  'Informiere', 'Beachte', 'Fülle', 'Füll', 'Bitte', 'Stelle'];
// „Stelle“, „Frage“, „Suche“, „Tipp“ und „Bitte“ sind auch Nomen/Höflichkeitswort: nur als Imperativ zählen, wenn klein geschrieben mitten im Satz
// oder am Satzanfang direkt gefolgt von einem Kleinwort, das kein Artikel ist (heuristisch).
const MEHRDEUTIG = ['Frage', 'Suche', 'Tipp', 'Bitte', 'Plane', 'Reich', 'Hebe', 'Versuche', 'Ruf', 'Lade', 'Wende'];
function hatImperativ(s) {
  const woerter = s.split(/[\s„“"(),:;.!?–]+/).filter(Boolean);
  for (let i = 0; i < woerter.length; i++) {
    const w = woerter[i], gross = w[0].toUpperCase() + w.slice(1);
    if (!IMPERATIVE.includes(gross)) continue;
    if (gross === 'Bitte') continue; // „Bitte“ allein ist neutral; der folgende Imperativ wird selbst erkannt
    const klein = w[0] === w[0].toLowerCase();
    const vorher = woerter[i - 1] || '';
    // klein geschriebener Imperativ nach „bitte“/„dann“/„und“/„oder“ (z. B. „Bitte prüfe …“, „dann frag …“)
    if (klein && /^(bitte|Bitte|dann|Dann|und|oder|Oder|sonst|Sonst|danach|Danach|zuerst|Zuerst|einfach)$/.test(vorher)) return true;
    // klein geschriebener Imperativ direkt nach einem Komma (z. B. „Wenn es stimmt, tippe nochmal …“), nicht nach „ich“
    if (klein && !MEHRDEUTIG.includes(gross) && vorher.toLowerCase() !== 'ich') {
      const re = new RegExp(',\\s*' + w + '(?=[\\s.,!?;:]|$)');
      if (re.test(s)) return true;
    }
    if (klein) continue;
    // groß: nur am Satzanfang
    const pos = s.indexOf(w);
    const davor = s.slice(0, pos).trimEnd();
    if (davor && !/[.!?:;„"(–]$/.test(davor)) continue;
    if (gross === 'Stelle' && !/^(den|die|das|ihn|sie|es|einen|eine|deinen|deine|dein|noch|sofort|früh|jetzt|rechtzeitig|bald|gleich)$/.test(woerter[i + 1] || '')) continue;
    if (MEHRDEUTIG.includes(gross)) { const n = woerter[i + 1] || ''; if (!n || /^(der|die|das|den|dem|des|ein|eine|einen|einem|nach|zu|zum|zur|von|vom|mit|an|für|bei|im|in|auf)$/i.test(n) || /^[A-ZÄÖÜ0-9{]/.test(n)) continue; }
    return true;
  }
  return false;
}
// „ihr“ als Anrede an mehrere (nicht „Ihr“ als Sie-Possessiv): nur mit Verbform der 2. Person Plural
const IHR = /(^|[^A-Za-zÄÖÜäöüß])(ihr|Ihr)\s+(seid|habt|könnt|müsst|dürft|wollt|bekommt|lebt|wohnt|zahlt|braucht|geht|kriegt)\b|\b(bekommt|habt|seid|könnt|müsst|wohnt|lebt|zahlt|braucht)\s+ihr\b/;
function hatDu(s) { return typeof s === 'string' && (DU.test(s) || IHR.test(s) || hatImperativ(s)); }

function neueNamensraeume() {
  const v = build.variante('pflege'), keys = new Set();
  v.sprachOrdner.filter((o) => o !== 'sie').forEach((o) => {
    const f = path.join(ROOT, 'src', 'lang', o, 'de.json');
    if (fs.existsSync(f)) Object.keys(JSON.parse(fs.readFileSync(f, 'utf8'))).forEach((k) => keys.add(k));
  });
  return keys;
}
function erreichbar(k) {
  const teile = k.split('.');
  if (UNERREICHBAR.includes(teile[0])) return false;
  if (FRAGEN_AUS.includes(teile[0])) return false;
  // Schritt-für-Schritt-Fragen zu ausgeblendeten Feldern (sf.q.egArt, sf.q.egArt2 …)
  if (teile[0] === 'sf' && teile[1] === 'q' && teile[2] && FRAGEN_AUS.includes(teile[2].replace(/\d+$/, ''))) return false;
  if (teile[0] === 'sb' && !SB_SICHTBAR.includes(k)) return false;
  if (KARTEN_PRAEFIXE.includes(teile[0]) && KARTEN_AUS.includes(teile[1])) return false;
  if (BRIEF_AUS.test(k) || KUERZEL_AUS.test(k)) return false;
  return true;
}
// Grundtexte (ohne Sie-Ebene) aller Sprachen der Pflege-Variante
function grundtexte() {
  const v = build.variante('pflege');
  v.sprachOrdner = v.sprachOrdner.filter((o) => o !== 'sie');
  const src = build.i18nSource(v);
  const I18N = new Function('module', src + ';return I18N;')({});
  const EINF = new Function('module', src + ';return I18N_EINFACH;')({});
  return { I18N, EINF };
}
// Fehltreffer der Heuristik: „Suche“ ist hier Hauptwort, keine Du-Anrede
const FALSCH_POSITIV = ['su.leeren'];

function schluessel() {
  const { I18N, EINF } = grundtexte(), neu = neueNamensraeume();
  return Object.keys(I18N.de).filter((k) => !neu.has(k) && !FALSCH_POSITIV.includes(k) && erreichbar(k) && (hatDu(I18N.de[k]) || hatDu(EINF[k]))).sort();
}

// Abgedeckt: Grundtext ohne Du oder Sie-Fassung in src/lang/sie/de.json, und Einfache Sprache ohne Du oder Sie-Fassung in src/lang/sie/einfach.json
function fehlend(liste) {
  const lies = (n) => { const f = path.join(ROOT, 'src', 'lang', 'sie', n); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
  const sieDe = lies('de.json'), sieEi = lies('einfach.json'), { I18N, EINF } = grundtexte();
  return (liste || schluessel()).filter((k) => (hatDu(I18N.de[k]) && !(k in sieDe)) || (hatDu(EINF[k]) && !(k in sieEi)));
}

if (require.main === module) {
  const arg = process.argv[2];
  const liste = schluessel();
  if (arg === '--json') { process.stdout.write(JSON.stringify(liste, null, 1) + '\n'); }
  else if (arg === '--fehlend') {
    const fehlt = fehlend(liste);
    fehlt.forEach((k) => console.log(k));
    console.log(fehlt.length + ' von ' + liste.length + ' erreichbaren Du-Texten ohne Sie-Fassung');
    process.exitCode = fehlt.length ? 1 : 0;
  } else {
    const nr = {}; liste.forEach((k) => { const p = k.split('.')[0]; nr[p] = (nr[p] || 0) + 1; });
    console.log(Object.entries(nr).sort((a, b) => b[1] - a[1]).map(([p, n]) => p + ': ' + n).join(', '));
    console.log(liste.length + ' erreichbare Texte mit Du-Anrede (ohne neue Namensräume der Variante)');
  }
}
module.exports = { FALSCH_POSITIV, FRAGEN_AUS, fehlend, schluessel, hatDu, hatImperativ, erreichbar, grundtexte, neueNamensraeume, UNERREICHBAR, KARTEN_AUS };
