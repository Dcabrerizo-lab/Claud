#!/usr/bin/env node
// Erzeugt das Schlüsselpaar für SoLo-Profi-Lizenzen. EINMAL auf dem eigenen Rechner ausführen.
//   node tools/lizenz-schluessel.js [Pfad für den privaten Schlüssel]
// Der private Schlüssel kommt standardmäßig nach ~/.solo-lizenz/privat.jwk (außerhalb des Repositorys) und darf NIE
// ins Repository, in eine E-Mail oder in einen Chat. Wer ihn hat, kann beliebig Lizenzen ausstellen. Sicherung z. B. auf einem USB-Stick.
// Der öffentliche Schlüssel wird nach erweiterungen/lizenz-schluessel.json geschrieben (der ersetzt dann den Demo-Schlüssel).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { subtle } = require('crypto').webcrypto;
(async () => {
  const ziel = process.argv[2] || path.join(os.homedir(), '.solo-lizenz', 'privat.jwk');
  if (path.resolve(ziel).startsWith(path.resolve(__dirname, '..'))) { console.error('Der private Schlüssel darf nicht im Projektordner liegen.'); process.exit(1); }
  if (fs.existsSync(ziel)) { console.error('Es gibt schon einen privaten Schlüssel: ' + ziel + '\nNicht überschreiben, sonst werden alle ausgestellten Lizenzen ungültig.'); process.exit(1); }
  const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const priv = await subtle.exportKey('jwk', kp.privateKey), pub = await subtle.exportKey('jwk', kp.publicKey);
  fs.mkdirSync(path.dirname(ziel), { recursive: true, mode: 0o700 });
  fs.writeFileSync(ziel, JSON.stringify(priv), { mode: 0o600 });
  fs.writeFileSync(path.join(__dirname, '..', 'erweiterungen', 'lizenz-schluessel.json'), JSON.stringify({ demo: false, jwk: { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y } }, null, 1) + '\n');
  console.log('Privater Schlüssel: ' + ziel + ' (geheim halten, sichern)');
  console.log('Öffentlicher Schlüssel: erweiterungen/lizenz-schluessel.json (darf ins Repository)');
})();
