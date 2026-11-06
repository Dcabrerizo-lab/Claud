// Liest Seiten des BayernPortals (www.bayernportal.de), die der Workflow "Quellen abrufen" gespeichert hat.
'use strict';
const fs = require('fs');

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)));

// Textzeilen des Hauptinhalts
function zeilen(datei) {
  let s = fs.readFileSync(datei, 'utf8');
  const m = s.indexOf('<main'); if (m > 0) s = s.slice(m);
  s = s.replace(/<(script|style|nav|footer)[^>]*>[\s\S]*?<\/\1>/g, '');
  return decode(s.replace(/<[^>]+>/g, '\n')).replace(/ /g, ' ').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// Anschriften-Seite (/adressen): erster Eintrag = die Behörde selbst. Liefert { titel, haus: [Straße, PLZ Ort], post: [...] }
// Weitere Einträge (Dienststellen, Datenschutzbeauftragte) unter "Ansprechpartner" bzw. "Organisationseinheiten" werden ignoriert.
function anschrift(datei) {
  const L = zeilen(datei);
  const i = L.indexOf('Hausanschrift');
  if (i < 0) return null;
  const titel = L[L.indexOf('Anschriften') - 1] || '';
  const haus = [L[i + 1], L[i + 2]];
  if (!/^\d{5} /.test(haus[1] || '')) return null;
  let post = null;
  if (L[i + 3] === 'Postanschrift') {
    post = /^\d{5} /.test(L[i + 4]) ? [L[i + 4]] : [L[i + 4], L[i + 5]];
  }
  return { titel, haus, post };
}

// Verweise einer Übersichtsseite: [{ id, name }]
function verweise(datei) {
  const s = fs.readFileSync(datei, 'utf8');
  return [...s.matchAll(/href="(?:https:\/\/www\.(?:bayernportal|freistaat\.bayern)\.de)?\/dokumente\/(?:behoerde|behoerdeordner)\/(\d+)[^"]*"[^>]*aria-label="([^"]+)"/g)]
    .map((m) => ({ id: m[1], name: decode(m[2]).trim() }));
}

module.exports = { zeilen, anschrift, verweise };
