// Einzelne Vorgänge mit eigener PIN sperren (src/vorgaenge.js, gSperren/gOeffnen/gAufheben): Ver- und Entschlüsseln,
// falsche PIN mit Wartezeit, zufälliges Salz und neuer IV, nach dem Sperren nichts im Klartext im Gerätespeicher,
// wieder gesperrt nach Wechsel und Neustart, Löschen ohne PIN, keine Kopie, Fristen nicht sichtbar, mit und ohne App-PIN.
'use strict';
const V = require('../src/vorgaenge.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };

function speicher(start) {
  const mem = Object.assign({}, start), s = { mem, voll: false };
  s.roh = {
    get: (k, cb) => cb(k in mem ? mem[k] : null),
    set: (k, v, fehler, ok) => { if (s.voll) { if (fehler) fehler(); return; } mem[k] = String(v); if (ok) ok(); },
    remove: (k) => { delete mem[k]; }
  };
  return s;
}
const oeffne = (s, extra) => V.tresor(s.roh, Object.assign({ iter: 2000 }, extra || {}));
const holen = (t, k) => { let r; t.get(k, (v) => { r = v; }); return r; };
const alles = (s) => Object.values(s.mem).join('\n');
const GEHEIM = 'Geheimstrasse 7', NAME = 'Familie Geheim';

(async () => {
  ck('[vorgang-pin] PIN für einen Vorgang: 4 bis 8 Ziffern', V.VPIN_RE.test('1234') && V.VPIN_RE.test('12345678') && !V.VPIN_RE.test('123') && !V.VPIN_RE.test('123456789') && !V.VPIN_RE.test('12a4'));
  ck('[vorgang-pin] PBKDF2 mindestens 210.000 Durchläufe', V.ITER >= 210000);

  // Ohne App-PIN: Vorgang sperren, öffnen, schließen, Sperre aufheben
  {
    const s = speicher({}), t = oeffne(s);
    t.umbenennen(t.aktiv().id, NAME);
    t.set('lotse.state', JSON.stringify({ p: { strasse: GEHEIM } })); t.set('lotse.fristliste', '[{"d":"2027-01-10"}]');
    const id = t.aktiv().id;
    const id2 = t.neu('Zweiter'); t.set('lotse.state', '{"s":{"miete":400}}');
    t.oeffnen(id); await t.fertig();
    ck('[vorgang-pin] vorher: Angaben im Klartext gespeichert', alles(s).includes(GEHEIM));
    ck('[vorgang-pin] falsches Format wird abgelehnt', (await t.gSperren(id, '12')) === false && (await t.gSperren(id, '123456789')) === false);
    ck('[vorgang-pin] sperren klappt', await t.gSperren(id, '4711'));
    await t.fertig();
    ck('[vorgang-pin] nach dem Sperren: Name und Angaben nirgends im Klartext', !alles(s).includes(GEHEIM) && !alles(s).includes(NAME) && !alles(s).includes('2027-01-10'), alles(s));
    ck('[vorgang-pin] PIN nicht gespeichert', !alles(s).includes('4711'));
    ck('[vorgang-pin] gesperrter Vorgang war offen: jetzt ist ein anderer geöffnet', t.aktiv().id === id2 && holen(t, 'lotse.state') === '{"s":{"miete":400}}' && s.mem['lotse.state'] === '{"s":{"miete":400}}');
    const g = t.liste().find((v) => v.id === id);
    ck('[vorgang-pin] Liste: gesperrt, neutral (kein Name)', g.gesperrt && !g.offen && g.name === '');
    ck('[vorgang-pin] Fristen aus gesperrten Vorgängen nicht lesbar', t.ueberall('lotse.fristliste').find((v) => v.id === id).wert === null);
    ck('[vorgang-pin] ohne PIN nicht zu öffnen, nicht zu kopieren, nicht umzubenennen', t.oeffnen(id) === false && t.kopie(id, 'x') === null && t.umbenennen(id, 'x') === false);
    const sp1 = JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.find((v) => v.id === id).sperre;
    ck('[vorgang-pin] gespeichert: Salz, IV, Chiffrat, Durchläufe, keine Angaben', sp1.salt && sp1.iv && sp1.ct && sp1.iter === 2000 && JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.find((v) => v.id === id).daten === null);

    // falsche PIN
    let r = await t.gOeffnen(id, '0000');
    ck('[vorgang-pin] falsche PIN: nicht geöffnet', !r.ok && r.falsch && t.aktiv().id === id2);
    for (let i = 0; i < 3; i++) await t.gOeffnen(id, '0000');
    r = await t.gOeffnen(id, '0000');
    ck('[vorgang-pin] 5 Fehlversuche: Wartezeit', !r.ok && r.warten === 30000 && t.gWarten(id) > 0);
    r = await t.gOeffnen(id, '4711');
    ck('[vorgang-pin] während der Wartezeit auch die richtige PIN nicht', !r.ok && r.warten > 0);
    JSON.parse(s.mem['lotse.vorgaenge']); // Fehlversuche stehen mit im Speicher
    ck('[vorgang-pin] Fehlversuche gespeichert', JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.find((v) => v.id === id).sperre.fehl === 5);
  }

  // Öffnen, ändern, wechseln (wieder gesperrt), Neustart (wieder gesperrt), Aufheben
  {
    const s = speicher({}), t = oeffne(s);
    t.umbenennen(t.aktiv().id, NAME); t.set('lotse.state', JSON.stringify({ p: { strasse: GEHEIM } }));
    const id = t.aktiv().id, id2 = t.neu('Zweiter'); t.oeffnen(id);
    await t.gSperren(id, '246810', 'Kurz'); await t.fertig();
    ck('[vorgang-pin] freiwilliger Kurzname sichtbar, richtiger Name nicht', t.liste().find((v) => v.id === id).name === 'Kurz' && !alles(s).includes(NAME));
    const ct1 = JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.find((v) => v.id === id).sperre;
    let r = await t.gOeffnen(id, '246810');
    ck('[vorgang-pin] richtige PIN: geöffnet mit Namen und Angaben', r.ok && t.aktiv().id === id && t.aktiv().name === NAME && JSON.parse(holen(t, 'lotse.state')).p.strasse === GEHEIM);
    ck('[vorgang-pin] geöffnet: Angaben nicht unter den Klartext-Schlüsseln', s.mem['lotse.state'] === undefined && !alles(s).includes(GEHEIM));
    t.set('lotse.state', JSON.stringify({ p: { strasse: GEHEIM + 'X' } })); await t.fertig();
    const ct2 = JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.find((v) => v.id === id).sperre;
    ck('[vorgang-pin] Änderung verschlüsselt gespeichert, neuer IV, gleiches Salz', ct2.iv !== ct1.iv && ct2.ct !== ct1.ct && ct2.salt === ct1.salt && !alles(s).includes(GEHEIM));
    ck('[vorgang-pin] Fehlversuche nach richtiger PIN zurückgesetzt', !ct2.fehl);
    t.oeffnen(id2); await t.fertig(); await t.fertig();
    ck('[vorgang-pin] nach dem Wechsel wieder gesperrt', t.liste().find((v) => v.id === id).offen === false && t.liste().find((v) => v.id === id).name === 'Kurz' && t.ueberall('lotse.state').find((v) => v.id === id).wert === null);
    r = await t.gOeffnen(id, '246810');
    ck('[vorgang-pin] Änderung vor dem Wechsel blieb erhalten', r.ok && JSON.parse(holen(t, 'lotse.state')).p.strasse === GEHEIM + 'X');
    await t.fertig();
    const t2 = oeffne(s); await t2.fertig();
    ck('[vorgang-pin] Neustart: gesperrter Vorgang wieder zu, ein anderer geöffnet', t2.bereit() && t2.aktiv().id === id2 && t2.liste().find((v) => v.id === id).gesperrt && !t2.liste().find((v) => v.id === id).offen);
    r = await t2.gAufheben(id, '1111');
    ck('[vorgang-pin] Aufheben mit falscher PIN: bleibt gesperrt', !r.ok && t2.liste().find((v) => v.id === id).gesperrt);
    r = await t2.gAufheben(id, '246810'); await t2.fertig();
    ck('[vorgang-pin] Aufheben: wieder normaler Vorgang mit Namen', r.ok && !t2.liste().find((v) => v.id === id).gesperrt && t2.liste().find((v) => v.id === id).name === NAME && t2.oeffnen(id) && JSON.parse(holen(t2, 'lotse.state')).p.strasse === GEHEIM + 'X');
  }

  // Schnittstelle für „Für Klient zusammenstellen“: Vorgaenge.oeffneGesperrt(id, pin) liest nur, schreibt nichts zurück
  {
    const s = speicher({}), t = oeffne(s);
    t.umbenennen(t.aktiv().id, NAME); t.set('lotse.state', JSON.stringify({ p: { strasse: GEHEIM } }));
    const id = t.aktiv().id, id2 = t.neu('Zweiter'); t.oeffnen(id);
    await t.gSperren(id, '13579'); await t.fertig();
    const vorher = s.mem['lotse.vorgaenge'];
    const r = await V.oeffneGesperrt(id, '13579'); await t.fertig();
    ck('[vorgang-pin] oeffneGesperrt: Name und Daten', r.id === id && r.name === NAME && JSON.parse(r.daten['lotse.state']).p.strasse === GEHEIM);
    ck('[vorgang-pin] oeffneGesperrt: nichts zurückgeschrieben, nicht geöffnet', s.mem['lotse.vorgaenge'] === vorher && !alles(s).includes(GEHEIM) && t.aktiv().id === id2 && !t.liste().find((v) => v.id === id).offen);
    r.daten['lotse.state'] = 'x';
    ck('[vorgang-pin] oeffneGesperrt: Kopie, Änderung wirkt nicht', (await t.oeffneGesperrt(id, '13579')).daten['lotse.state'] !== 'x');
    let fehl = null; try { await V.oeffneGesperrt(id, '0000'); } catch (e) { fehl = e; }
    ck('[vorgang-pin] oeffneGesperrt: falsche PIN -> reject', fehl && fehl.falsch === true);
    let fehl2 = null; try { await V.oeffneGesperrt(id2, '13579'); } catch (e) { fehl2 = e; }
    ck('[vorgang-pin] oeffneGesperrt: nicht gesperrter Vorgang -> reject', !!fehl2);
  }

  // Salz und IV zufällig: zwei Sperren mit derselben PIN und denselben Angaben
  {
    const s = speicher({}), t = oeffne(s);
    t.set('lotse.state', '{"x":1}'); const a = t.aktiv().id;
    const b = t.kopie(a, 'B');
    await t.gSperren(a, '1234'); await t.gSperren(b, '1234'); await t.fertig();
    const l = JSON.parse(s.mem['lotse.vorgaenge']).klar.liste.filter((v) => v.sperre).map((v) => v.sperre);
    ck('[vorgang-pin] zwei gesperrte Vorgänge: verschiedenes Salz, verschiedener IV', l.length === 2 && l[0].salt !== l[1].salt && l[0].iv !== l[1].iv && l[0].ct !== l[1].ct);
    ck('[vorgang-pin] alle gesperrt: neuer leerer Vorgang geöffnet', !t.aktiv().gesperrt && t.liste().length === 3 && s.mem['lotse.state'] === undefined);
    // Löschen ohne PIN
    ck('[vorgang-pin] Löschen ohne PIN', t.loeschen(a) && t.liste().length === 2);
    // Rückgängig nach Löschen: wieder gesperrt, ohne Angaben im Speicher
    const sich = t.sicherung(); t.loeschen(b); t.zurueck(sich); await t.fertig();
    ck('[vorgang-pin] Rückgängig: wieder gesperrt', t.liste().find((v) => v.id === b).gesperrt && (await t.gOeffnen(b, '1234')).ok && holen(t, 'lotse.state') === '{"x":1}');
  }

  // Mit App-PIN: gesperrter Vorgang zusätzlich mit eigener PIN, App-PIN aus: bleibt gesperrt
  {
    const s = speicher({}), t = oeffne(s);
    t.umbenennen(t.aktiv().id, NAME); t.set('lotse.state', JSON.stringify({ p: { strasse: GEHEIM } }));
    const id = t.aktiv().id; t.neu('Zweiter');
    await t.pinSetzen('999999');
    await t.gSperren(id, '4321'); await t.fertig();
    const t2 = oeffne(s);
    await t2.entsperren('999999');
    ck('[vorgang-pin] App-PIN entsperrt: Vorgang bleibt einzeln gesperrt', t2.bereit() && t2.liste().find((v) => v.id === id).gesperrt && t2.ueberall('lotse.state').find((v) => v.id === id).wert === null);
    await t2.pinAus(); await t2.fertig();
    ck('[vorgang-pin] App-PIN aus: gesperrter Vorgang weiter verschlüsselt', !alles(s).includes(GEHEIM) && !alles(s).includes(NAME) && t2.liste().find((v) => v.id === id).gesperrt);
    const r = await t2.gOeffnen(id, '4321'); await t2.fertig();
    ck('[vorgang-pin] danach mit Vorgangs-PIN zu öffnen, nichts im Klartext', r.ok && JSON.parse(holen(t2, 'lotse.state')).p.strasse === GEHEIM && !alles(s).includes(GEHEIM));
  }

  // Speicher voll: Sperren schlägt fehl, Angaben bleiben ungesperrt erhalten
  {
    const s = speicher({}), t = oeffne(s, { fehler: () => {} });
    t.umbenennen(t.aktiv().id, NAME); t.set('lotse.state', '{"y":2}'); await t.fertig();
    const id = t.aktiv().id; s.voll = true;
    const ok = await t.gSperren(id, '1234');
    ck('[vorgang-pin] Speicher voll: nicht gesperrt, Angaben bleiben', ok === false && !t.liste()[0].gesperrt && t.aktiv().id === id && holen(t, 'lotse.state') === '{"y":2}' && t.liste().length === 1);
  }

  if (fails) { console.log(fails + ' von ' + n + ' Prüfungen fehlgeschlagen'); process.exit(1); }
  console.log('Vorgang-PIN-Test bestanden: ' + n + ' Prüfungen');
})();
