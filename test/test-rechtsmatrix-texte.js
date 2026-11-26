// Rechtsmatrix Texte und Sprachen: Prüfregeln für Texte in allen 13 Sprachen (Fälle in test/rechtsmatrix/texte.json,
// Matrix in docs/rechtsmatrix/texte.md). Aus der Vollprüfung vom 24.11.2026 (Teil texte-sprachen) übernommen.
// Je Schlüssel: dieselben Ziffern wie erwartet (Zeiträume, Paragrafen), Platzhalter, feste Beträge als {eur:…},
// Gesetzesbezeichnungen und Anrede. Dazu Regeln über alle Schlüssel (Bürgergeld nur als früherer Name, Gesetze wie im
// Deutschen, Rumänisch nur Du, Englisch ohne deutsches Zahlformat, gelöschte Schlüssel, Store-Text zu den Pflege-Sprachen).
// Lädt die Sprachen genau wie der Build (scripts/build.js → i18nSource). Exit 1 bei Fehlern.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const REGELN = require('./rechtsmatrix/texte.json');

const ctx = { module: {} };
vm.createContext(ctx);
vm.runInContext(require('../scripts/build.js').i18nSource() + ';this.__I=I18N;this.__E=I18N_EINFACH;', ctx);
const I18N = ctx.__I, EINFACH = ctx.__E;
const LANGS = Object.keys(I18N);

// Anrede (Wortlisten aus der Vollprüfung): informell / förmlich
const INF = {
  fr: /(^|[^\p{L}])(tu|te|toi|ton|ta|tes|t['’])(?=[^\p{L}]|$)|(^|[^\p{L}])t['’]\p{L}/iu,
  ru: /(^|[^\p{L}])(ты|тебя|тебе|тобой|твой|твоя|твоё|твое|твои|твоего|твоей|твоих|твоим|твоими|твою)(?=[^\p{L}]|$)/iu,
  uk: /(^|[^\p{L}])(ти|тебе|тобі|тобою|твій|твоя|твоє|твої|твого|твоєї|твоїх|твоїм|твоїми|твою)(?=[^\p{L}]|$)/iu,
  pl: /(^|[^\p{L}])(ty|ciebie|cię|tobie|ci|tobą|twój|twoja|twoje|twojego|twojej|twoich|twoim|twoimi|twoją|masz|możesz|musisz|jesteś|chcesz|wiesz|dostajesz|otrzymujesz)(?=[^\p{L}]|$)/iu,
  ro: /(^|[^\p{L}])(tu|ție|ţie|tău|tale|tăi|ai|ești|poți|poţi|primești|îți|te)(?=[^\p{L}]|$)/iu,
  tr: /(^|[^\p{L}])(sen|seni|sana|senin|sende|senden)(?=[^\p{L}]|$)|\p{L}+(?:abilirsin|ebilirsin|malısın|melisin|ıyorsun|iyorsun|uyorsun|üyorsun)(?=[^\p{L}]|$)/iu
};
const FORM = {
  fr: /(^|[^\p{L}])(vous|votre|vos)(?=[^\p{L}]|$)/iu,
  ru: /(^|[^\p{L}])(вы|вас|вам|вами|ваш|ваша|ваше|ваши|вашего|вашей|ваших|вашим)(?=[^\p{L}]|$)/iu,
  uk: /(^|[^\p{L}])(ви|вас|вам|вами|ваш|ваша|ваше|ваші|вашого|вашої|ваших|вашим)(?=[^\p{L}]|$)/iu,
  pl: /(^|[^\p{L}])(pan|pani|państwo|państwa|państwu|proszę)(?=[^\p{L}]|$)/iu,
  ro: /(^|[^\p{L}])(dumneavoastră|dvs\.?|vă|v-|aveți|aveţi|puteți|puteţi|primiți|sunteți|depuneți|completați|veniți)(?=[^\p{L}]|$)/iu,
  tr: /(^|[^\p{L}])(siz|sizi|size|sizin|sizde|sizden)(?=[^\p{L}]|$)|\p{L}+(?:abilirsiniz|ebilirsiniz|malısınız|melisiniz)(?=[^\p{L}]|$)/iu
};
const GESETZ = /\b(SGB\s*[IVX]+|BGB|ZPO|EStG|SGG|VwGO|WoGG|WoFG|BKGG|UVG|BAföG|BEEG|MuSchG|AsylbLG|PflegeZG|FPfZG|RBeitrStV|EnWG|TKG|StGB|StPO|RDG|BMG|ZKG|InsO|AufenthG|FreizügG\/EU|GrusiGV|WoGVwV|BayBlindG|BayLPflGG|DSGVO|VVG|StromGVV|EGStGB|BliHG|LBlGG|RBEG|SvEV|SchwbAwV|BVG|SGB)\b/g;
const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
// Ziffern außerhalb von Platzhaltern, Tausender und Dezimalstellen zusammengefasst („40.000“ → 40000, „12,5“ → 12,5)
const zahlen = (s) => {
  s = String(s).replace(/[٠-٩]/g, (c) => AR.indexOf(c)).replace(/[۰-۹]/g, (c) => FA.indexOf(c)).replace(/\{[^}]*\}/g, ' ');
  return (s.match(/\d+(?:[.,  ٫٬ ]\d{3})*(?:[.,٫]\d{1,2})?/g) || []).map((x) => {
    const d = /[.,٫](\d{1,2})$/.exec(x);
    const ganz = (d ? x.slice(0, -d[0].length) : x).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    return d ? ganz + ',' + d[1] : ganz;
  });
};
const sortiert = (a) => a.slice().sort().join(' ');
const platzhalter = (s) => sortiert((String(s).match(/\{[^}]*\}/g) || []).filter((x) => !/^\{eur:/.test(x)));
const euroFest = (s) => sortiert([...String(s).matchAll(/\{eur:(\d+(?:\.\d+)?)\}/g)].map((m) => m[1]));
const gesetze = (s) => sortiert((String(s).match(GESETZ) || []).map((x) => x.replace(/\s+/g, ' ')));

let fehler = 0, laeufe = 0;
const fail = (t) => { fehler++; console.log('FAIL ' + t); };

for (const r of REGELN) {
  const e = r.erwartet;
  const sprachen = r.sprachen === 'alle' ? LANGS : r.sprachen;
  laeufe++;
  if (r.schluessel === '*' || r.schluessel.includes('/')) {
    if (e.bürgergeldNurAlsAltname) {
      for (const [k, s] of Object.entries(I18N.de).concat(Object.entries(EINFACH))) {
        if (typeof s === 'string' && /Bürgergeld/.test(s) && !/(früher|bis Juni 2026|hieß)[^.]{0,30}Bürgergeld|Bürgergeld[^.]{0,5}\)/.test(s)) fail(`${r.id} ${k}: Bürgergeld als aktueller Name`);
      }
    }
    if (e.gesetzeWieDeutsch) {
      for (const l of sprachen) {
        if (l === 'de') continue;
        for (const k of Object.keys(I18N.de)) {
          const d = I18N.de[k], s = I18N[l][k];
          if (typeof d === 'string' && typeof s === 'string' && gesetze(d) !== gesetze(s)) fail(`${r.id} ${l} ${k}: Gesetze de [${gesetze(d)}] ${l} [${gesetze(s)}]`);
        }
      }
    }
    if (e.fehlendeSchluessel) {
      for (const l of sprachen) for (const k of e.fehlendeSchluessel) if (k in I18N[l]) fail(`${r.id} ${l} ${k}: Schlüssel soll gelöscht sein`);
      for (const k of e.fehlendeSchluessel) if (k in EINFACH) fail(`${r.id} einfach ${k}: Schlüssel soll gelöscht sein`);
    }
    if (e.anredeAlle) {
      for (const l of sprachen) {
        for (const [k, s] of Object.entries(I18N[l])) {
          if (typeof s !== 'string' || (e.ausnahmen || []).includes(k) || s === I18N.de[k]) continue;
          const inf = INF[l].test(s), form = FORM[l].test(s);
          if (e.anredeAlle === 'du' && form && !inf) fail(`${r.id} ${l} ${k}: förmlich statt Du: ${s.slice(0, 90)}`);
        }
      }
    }
    if (e.keinDeutschesZahlformat) {
      for (const l of sprachen) {
        for (const [k, s] of Object.entries(I18N[l])) {
          if (typeof s === 'string' && s !== I18N.de[k] && /\d{1,3}\.\d{3}(?:,\d\d)?\s?€|\d+,\d\d\s?€/.test(s)) fail(`${r.id} ${l} ${k}: deutsches Zahlformat: ${s.slice(0, 90)}`);
        }
      }
    }
    if (e.storePflegeSprachen) {
      const store = fs.readFileSync(path.join(ROOT, 'docs', 'STORE.md'), 'utf8');
      const fehlt = LANGS.filter((l) => l !== 'de' && !fs.existsSync(path.join(ROOT, 'src', 'lang', 'pflege', l + '.json')));
      const behauptet = store.split('\n').filter((z) => /Pflege[^\n.]{0,40}\b(allen )?13 Sprachen/.test(z));
      if (fehlt.length && behauptet.length) fail(`${r.id} docs/STORE.md nennt Pflege in 13 Sprachen, src/lang/pflege/ fehlt aber für ${fehlt.join(', ')}: ${behauptet[0].slice(0, 80)}`);
    }
    continue;
  }
  for (const l of sprachen) {
    const s = I18N[l] && I18N[l][r.schluessel];
    const ausn = r.zahlenAusnahmen && r.zahlenAusnahmen[l];
    if (typeof s !== 'string') { if (ausn === null) continue; fail(`${r.id} ${l} ${r.schluessel}: Schlüssel fehlt`); continue; }
    if (l !== 'de' && s === I18N.de[r.schluessel] && ausn === null) continue; // gewollter deutscher Rückfall (Pflege ps/so)
    if (e.zahlen) {
      const soll = Array.isArray(ausn) ? ausn : e.zahlen;
      if (sortiert(zahlen(s)) !== sortiert(soll)) fail(`${r.id} ${l} ${r.schluessel}: Zahlen [${sortiert(zahlen(s))}] erwartet [${sortiert(soll)}]`);
    }
    if (e.platzhalter !== undefined && platzhalter(s) !== e.platzhalter) fail(`${r.id} ${l} ${r.schluessel}: Platzhalter [${platzhalter(s)}] erwartet [${e.platzhalter}]`);
    if (e.eur && euroFest(s) !== sortiert(e.eur)) fail(`${r.id} ${l} ${r.schluessel}: feste Beträge [${euroFest(s)}] erwartet [${sortiert(e.eur)}]`);
    if (e.gesetze && gesetze(s) !== sortiert(e.gesetze)) fail(`${r.id} ${l} ${r.schluessel}: Gesetze [${gesetze(s)}] erwartet [${sortiert(e.gesetze)}]`);
    if (e.anrede && INF[l]) {
      const inf = INF[l].test(s), form = FORM[l].test(s);
      if (e.anrede === 'sie' && inf && !form) fail(`${r.id} ${l} ${r.schluessel}: informell statt förmlich: ${s.slice(0, 80)}`);
      if (e.anrede === 'du' && form && !inf) fail(`${r.id} ${l} ${r.schluessel}: förmlich statt Du: ${s.slice(0, 80)}`);
    }
  }
}
console.log(`[rechtsmatrix-texte] ${REGELN.length} Regeln, ${laeufe} Läufe, ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
