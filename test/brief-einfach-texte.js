// Sammelt die sichtbaren festen deutschen Texte von „Brief prüfen“ (erweiterungen/vorschau.html, vorschau.js, brief-lesen.js).
// Gemeinsam genutzt von test/test-brief-einfach.js (Prüfung) – eine Stelle, damit Test und Wörterbuch dieselben Texte meinen.
// Statisch: Textknoten, placeholder und aria-label der App-Abschnitte (scripts/build.js PP_ABSCHNITTE); ohne textarea (Schreiben an Ämter)
// und ohne Elemente mit data-t (übersetzt die App selbst). Skript: Zeichenketten und Vorlagen (${…} → {1}, {2} …) aus vorschau.js.
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const espree = require('espree');
const ROOT = path.join(__dirname, '..');
const ABSCHNITTE = ['p-pflege', 'p-bescheid', 'p-gsa', 'p-wg', 'p-kiz', 'p-nk', 'p-andere'];
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
// sichtbarer Text: enthält ein Wort mit Buchstaben; keine reinen Zahlen, Zeichen oder Kennungen
const textig = (s) => /[A-Za-zÄÖÜäöüß]{2,}/.test(s) && !/^[a-z0-9_.#-]+$/.test(s);

function statisch() {
  const html = fs.readFileSync(path.join(ROOT, 'erweiterungen', 'vorschau.html'), 'utf8');
  const d = new JSDOM(html).window.document, out = new Set();
  for (const id of ABSCHNITTE) {
    const sec = d.getElementById(id);
    const w = d.createTreeWalker(sec, 4 /* Text */);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (el.closest('textarea, script, style, [data-t]')) continue;
      const s = norm(n.nodeValue); if (s && textig(s)) out.add(s);
    }
    for (const el of sec.querySelectorAll('[placeholder], [aria-label]')) for (const a of ['placeholder', 'aria-label']) { const s = norm(el.getAttribute(a) || ''); if (s && textig(s)) out.add(s); }
  }
  return [...out];
}

// Zeichenketten aus vorschau.js, die als Text erscheinen. Ausgenommen sind Stellen, die kein Text sind (Kennungen, Klassen,
// Selektoren, Attributnamen) und die Werte für die Schreiben an Ämter (förmlich, bleiben unverändert).
const KEIN_TEXT_ATTR = new Set(['class', 'id', 'type', 'for', 'role', 'inputmode', 'min', 'max', 'step', 'value', 'style', 'rows', 'tabindex', 'name', 'autocomplete', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-hidden', 'aria-live', 'data-id', 'data-auto', 'data-typ', 'data-titel', 'data-ist', 'data-soll', 'data-t', 'art', 'stelle', 'quelle', 'feld', 'bis']);
const KEIN_TEXT_AUFRUF = /^(\$|querySelector|querySelectorAll|getElementById|addEventListener|setAttribute|getAttribute|removeAttribute|add|remove|toggle|contains|startsWith|endsWith|test|replace|split|includes|matches|closest|padStart|slice|insertAdjacentElement|observe|getItem|setItem|createElement|createTextNode)$/;
function skript(datei, ohne) {
  const src = fs.readFileSync(path.join(ROOT, 'erweiterungen', datei), 'utf8');
  const ast = espree.parse(src, { ecmaVersion: 2022, range: true });
  const out = new Map(); // Text → Stelle
  const vorlage = (q) => { let i = 0; return norm(q.quasis.map((x, k) => x.value.cooked + (k < q.expressions.length ? '{' + (++i) + '}' : '')).join('')); };
  const nimm = (s, node) => { if (s && textig(s) && !KEINE.has(s) && !out.has(s)) out.set(s, src.slice(0, node.range[0]).split('\n').length); };
  (function geh(n, eltern) {
    if (!n || typeof n.type !== 'string') return;
    if (ohne && ohne(n)) return;
    const p = eltern[eltern.length - 1];
    const keinText = p && ((p.type === 'Property' && p.key === n && !p.computed) ||
      (p.type === 'Property' && p.value === n && KEIN_TEXT_ATTR.has(p.key.name || p.key.value)) ||
      (p.type === 'CallExpression' && n !== p.callee && (KEIN_TEXT_AUFRUF.test((p.callee.property && p.callee.property.name) || p.callee.name || '') || (p.callee.name === 'h' && p.arguments[0] === n))) ||
      (p.type === 'MemberExpression' && p.computed) || p.type === 'BinaryExpression' && /^[=!]==?$/.test(p.operator) || p.type === 'ImportDeclaration' || p.type === 'SwitchCase');
    if (!keinText) {
      if (n.type === 'Literal' && typeof n.value === 'string') nimm(norm(n.value), n);
      if (n.type === 'TemplateLiteral' && !(p && p.type === 'TaggedTemplateExpression')) nimm(vorlage(n), n);
    }
    for (const k of Object.keys(n)) { if (k === 'range' || k === 'parent') continue; const v = n[k]; const e = eltern.concat([n]); if (Array.isArray(v)) v.forEach((x) => geh(x, e)); else if (v && typeof v.type === 'string') geh(v, e); }
  })(ast, []);
  return out;
}
// Teile von vorschau.js, die nicht in der App erscheinen oder Schreiben an Ämter bilden: Beispiel-Gutachten, Lizenz und Fristen (nur Vorschau),
// Aufrufe von Widerspruch.* und Nebenkosten.einwendungen/antragUebernahme (förmliche Schreiben) und die Zusätze dafür (zusatz).
function ohneVorschau(n) {
  if (n.type === 'ExpressionStatement' && n.directive) return true; // 'use strict'
  if (n.type === 'VariableDeclarator' && n.id && ['BEISPIEL_GUTACHTEN', 'zusatz', 'NKW'].includes(n.id.name)) return n.id.name !== 'NKW' ? true : false;
  if (n.type === 'FunctionDeclaration' && n.id && ['zeigeLizenz', 'zeigeFristen'].includes(n.id.name)) return true;
  if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && ['Widerspruch', 'Nebenkosten', 'Lizenz'].includes(n.callee.object.name) && ['text', 'hoeherstufung', 'einwendungen', 'antragUebernahme'].includes(n.callee.property.name)) return true;
  // Beispiel-Posten der Nebenkosten (nur „Beispiel laden“ in der Vorschau, Eingabewerte)
  if (n.type === 'Property' && n.key && n.key.name === 'bez') return true;
  return false;
}
// Kennungen und Werte, die keine Texte sind (Element-IDs, Klassen-Werte)
const KEINE = new Set(['pf-zeile-5K', 'zuWenig', 'pruefen', 'passt']);
function alle() {
  const st = statisch();
  const js = skript('vorschau.js', ohneVorschau);
  const BL = require(path.join(ROOT, 'erweiterungen', 'brief-lesen.js'));
  const bl = Object.values(BL.ARTEN).map((a) => a.titel).concat(Object.values(BL.ERKLAERUNG), ['1 Monat', '1 Woche']);
  return { statisch: st, skript: [...js.keys()], zeilen: js, briefLesen: bl };
}
module.exports = { alle, norm };
if (require.main === module) { const a = alle(); console.log(JSON.stringify({ statisch: a.statisch.length, skript: a.skript.length, bl: a.briefLesen.length })); for (const s of a.skript) console.log(a.zeilen.get(s) + '\t' + s); }
