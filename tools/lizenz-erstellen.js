#!/usr/bin/env node
// Stellt eine SoLo-Profi-Lizenz aus.
//   node tools/lizenz-erstellen.js --stelle "Caritas Sozialberatung Erlangen" --plaetze 10 --bis 2027-12-31 [--ab 2027-01-01] [--id L-2027-0001] [--schluessel ~/.solo-lizenz/privat.jwk]
// Ergebnis: Datei SoLo-Lizenz-<id>.json im aktuellen Ordner. Die schickt man der Beratungsstelle; sie öffnet sie in SoLo Profi.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const Lizenz = require('../erweiterungen/lizenz.js');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
(async () => {
  const stelle = arg('stelle'), bis = arg('bis');
  if (!stelle || !/^\d{4}-\d{2}-\d{2}$/.test(bis || '')) { console.error('Bitte --stelle "Name" und --bis JJJJ-MM-TT angeben.'); process.exit(1); }
  const heute = new Date().toISOString().slice(0, 10);
  const daten = { v: 1, id: arg('id', 'L-' + heute.replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()), stelle, plaetze: +arg('plaetze', 1), ab: arg('ab', heute), bis, ausgestellt: heute };
  const sPfad = arg('schluessel', path.join(os.homedir(), '.solo-lizenz', 'privat.jwk'));
  const priv = JSON.parse(fs.readFileSync(sPfad, 'utf8'));
  const liz = await Lizenz.signiere(daten, priv);
  const pub = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'erweiterungen', 'lizenz-schluessel.json'), 'utf8'));
  const p = await Lizenz.pruefe(liz, pub.jwk, daten.ab);
  if (!p.gueltig) { console.error('Prüfung mit dem öffentlichen Schlüssel fehlgeschlagen (' + p.grund + '). Passt erweiterungen/lizenz-schluessel.json zum privaten Schlüssel?'); process.exit(1); }
  const datei = 'SoLo-Lizenz-' + daten.id + '.json';
  fs.writeFileSync(datei, JSON.stringify(liz, null, 1) + '\n');
  console.log('Lizenz erstellt: ' + datei + ' für „' + stelle + '“, ' + daten.plaetze + ' Plätze, gültig bis ' + bis);
})();
