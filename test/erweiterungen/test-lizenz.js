// Tests: Profi-Lizenz (Erweiterung, nicht Teil von npm test der App 1.2.0). Schlüssel werden nur im Speicher erzeugt.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const { subtle } = require('crypto').webcrypto;
const L = require('../../erweiterungen/lizenz.js');
const ROOT = path.join(__dirname, '..', '..');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
(async () => {
  const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const priv = await subtle.exportKey('jwk', kp.privateKey), pub = await subtle.exportKey('jwk', kp.publicKey);
  const fremd = await subtle.exportKey('jwk', (await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])).publicKey);
  const d = { v: 1, id: 'L-1', stelle: 'Sozialberatung Musterstadt', plaetze: 10, ab: '2027-01-01', bis: '2027-12-31', ausgestellt: '2026-11-20' };
  const liz = await L.signiere(d, priv);
  ok('gültig im Zeitraum', (await L.pruefe(liz, pub, '2027-06-01')).gueltig === true);
  ok('erster Tag gültig', (await L.pruefe(liz, pub, '2027-01-01')).gueltig === true);
  ok('letzter Tag gültig', (await L.pruefe(liz, pub, '2027-12-31')).gueltig === true);
  ok('am Tag danach abgelaufen', (await L.pruefe(liz, pub, '2028-01-01')).grund === 'abgelaufen');
  ok('vor Beginn: noch nicht', (await L.pruefe(liz, pub, '2026-12-31')).grund === 'nochNicht');
  ok('bald Ablauf (30 Tage)', (await L.pruefe(liz, pub, '2027-12-05')).baldAblauf === true);
  ok('als Text (Datei-Inhalt) prüfbar', (await L.pruefe(JSON.stringify(liz), pub, '2027-06-01')).gueltig === true);
  const veraendert = JSON.parse(JSON.stringify(liz)); veraendert.daten.stelle = 'Andere Stelle';
  ok('Name geändert → Signatur ungültig', (await L.pruefe(veraendert, pub, '2027-06-01')).grund === 'signatur');
  const verlaengert = JSON.parse(JSON.stringify(liz)); verlaengert.daten.bis = '2099-12-31';
  ok('Datum verlängert → Signatur ungültig', (await L.pruefe(verlaengert, pub, '2027-06-01')).grund === 'signatur');
  const mehr = JSON.parse(JSON.stringify(liz)); mehr.daten.plaetze = 999;
  ok('Plätze erhöht → Signatur ungültig', (await L.pruefe(mehr, pub, '2027-06-01')).grund === 'signatur');
  const demoDazu = JSON.parse(JSON.stringify(liz)); demoDazu.daten.demo = true;
  ok('Feld ergänzt → Signatur ungültig', (await L.pruefe(demoDazu, pub, '2027-06-01')).grund === 'signatur');
  ok('fremder Schlüssel → ungültig', (await L.pruefe(liz, fremd, '2027-06-01')).grund === 'signatur');
  ok('Unsinn → Format', (await L.pruefe('kein json', pub, '2027-06-01')).grund === 'format');
  ok('leeres Objekt → Format', (await L.pruefe({}, pub, '2027-06-01')).grund === 'format');
  ok('kaputte Signatur → ungültig', (await L.pruefe(Object.assign({}, liz, { sig: 'AAAA' }), pub, '2027-06-01')).grund === 'signatur');
  ok('Reihenfolge der Felder egal', (await L.pruefe({ sig: liz.sig, daten: { bis: d.bis, ab: d.ab, stelle: d.stelle, plaetze: d.plaetze, id: d.id, ausgestellt: d.ausgestellt, v: 1 } }, pub, '2027-06-01')).gueltig === true);
  for (const g of ['ok', 'format', 'signatur', 'nochNicht', 'abgelaufen']) ok('Text für ' + g, !!L.TEXT[g]);

  // Demo-Lizenz im Repository passt zum Demo-Schlüssel
  const sch = JSON.parse(fs.readFileSync(path.join(ROOT, 'erweiterungen/lizenz-schluessel.json'), 'utf8'));
  const demo = JSON.parse(fs.readFileSync(path.join(ROOT, 'erweiterungen/demo-lizenz.json'), 'utf8'));
  const pd = await L.pruefe(demo, sch.jwk, '2027-03-01');
  ok('Demo-Lizenz gültig und als Demo markiert', pd.gueltig && pd.demo === true, pd);

  // Kein privater Schlüssel im Repository (JWK mit Feld „d“ oder PEM)
  const dateien = cp.execSync('git ls-files -co --exclude-standard', { cwd: ROOT }).toString().split('\n').filter((x) => x && !x.startsWith('node_modules') && /\.(json|jwk|pem|js|txt|md|key)$/.test(x));
  const treffer = dateien.filter((x) => { try { const t = fs.readFileSync(path.join(ROOT, x), 'utf8'); return /"kty"\s*:\s*"EC"[^}]*"d"\s*:\s*"/.test(t) || /BEGIN (EC |)PRIVATE KEY/.test(t); } catch (e) { return false; } });
  ok('kein privater Schlüssel im Repository', treffer.length === 0, treffer);

  // Werkzeuge: Schlüssel nie im Projektordner, kein Überschreiben; Ausstellen und Prüfen funktioniert
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'solo-liz-'));
  const r1 = cp.spawnSync('node', ['tools/lizenz-schluessel.js', path.join(ROOT, 'erweiterungen', 'x.jwk')], { cwd: ROOT, encoding: 'utf8' });
  ok('Werkzeug verweigert Schlüssel im Projektordner', r1.status === 1 && !fs.existsSync(path.join(ROOT, 'erweiterungen', 'x.jwk')));
  const privPfad = path.join(tmp, 'privat.jwk'); fs.writeFileSync(privPfad, '{}');
  const r2 = cp.spawnSync('node', ['tools/lizenz-schluessel.js', privPfad], { cwd: ROOT, encoding: 'utf8' });
  ok('Werkzeug überschreibt keinen vorhandenen Schlüssel', r2.status === 1 && fs.readFileSync(privPfad, 'utf8') === '{}');
  // Ausstellen mit eigenem Schlüsselpaar in einer Kopie des öffentlichen Schlüssels (Original bleibt unverändert)
  const vorher = fs.readFileSync(path.join(ROOT, 'erweiterungen/lizenz-schluessel.json'), 'utf8');
  fs.writeFileSync(privPfad, JSON.stringify(priv));
  fs.writeFileSync(path.join(ROOT, 'erweiterungen/lizenz-schluessel.json'), JSON.stringify({ demo: false, jwk: pub }));
  const r3 = cp.spawnSync('node', [path.join(ROOT, 'tools/lizenz-erstellen.js'), '--stelle', 'Test-Stelle', '--plaetze', '2', '--bis', '2030-12-31', '--id', 'T-1', '--schluessel', privPfad], { cwd: tmp, encoding: 'utf8' });
  fs.writeFileSync(path.join(ROOT, 'erweiterungen/lizenz-schluessel.json'), vorher);
  ok('Lizenz ausgestellt', r3.status === 0 && fs.existsSync(path.join(tmp, 'SoLo-Lizenz-T-1.json')), r3.stderr);
  if (r3.status === 0) ok('ausgestellte Lizenz gültig', (await L.pruefe(fs.readFileSync(path.join(tmp, 'SoLo-Lizenz-T-1.json'), 'utf8'), pub, '2029-01-01')).gueltig === true);
  fs.rmSync(tmp, { recursive: true, force: true });

  console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Profi-Lizenz: alle ${n} Prüfungen bestanden`);
  process.exit(f ? 1 : 0);
})();
