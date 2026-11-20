// Vorgänge (Haushalte): Speichern/Laden, Kopie, Umbenennen, Löschen, Verschlüsselung mit PIN, falsche PIN mit Wartezeit,
// automatisches Löschen, Übernahme alter Speicherstände (Migration) und Speicherfehler. Ohne Browser, mit WebCrypto aus Node.
'use strict';
const V = require('../src/vorgaenge.js');
let n = 0, fails = 0;
const ck = (name, c, x) => { n++; if (!c) { fails++; console.log('FAIL', name, x === undefined ? '' : x); } };
const TAG = 86400000;

// Gerätespeicher wie localStorage (synchron), mit Schalter für „Speicher voll“
function speicher(start) {
  const mem = Object.assign({}, start), s = { mem, voll: false, fehler: 0 };
  s.roh = {
    get: (k, cb) => cb(k in mem ? mem[k] : null),
    set: (k, v, fehler, ok) => { if (s.voll) { s.fehler++; if (fehler) fehler(); return; } mem[k] = String(v); if (ok) ok(); },
    remove: (k) => { delete mem[k]; }
  };
  return s;
}
function oeffne(s, extra) {
  const o = Object.assign({ iter: 2000, gesperrt: () => { o.warGesperrt = true; }, fehler: () => { o.fehlerMeldung = (o.fehlerMeldung || 0) + 1; } }, extra || {});
  const t = V.tresor(s.roh, o); t.opt = o; return t;
}
const holen = (t, k) => { let r; t.get(k, (v) => { r = v; }); return r; };

(async () => {
  // Grundwerte
  ck('[vorgaenge] PBKDF2 mit mindestens 600.000 Durchläufen', V.ITER >= 600000, V.ITER);
  ck('[vorgaenge] PIN: 4 bis 12 Ziffern', V.PIN_RE.test('1234') && V.PIN_RE.test('123456789012') && !V.PIN_RE.test('123') && !V.PIN_RE.test('12a4'));
  ck('[vorgaenge] Name wird gekürzt und gesäubert', V.nameSauber('  Familie\u0000  M.  ') === 'Familie M.' && V.nameSauber('x'.repeat(40)).length === V.NAME_MAX);
  ck('[vorgaenge] Wartezeit: erst nach 5 Fehlversuchen, höchstens 15 Minuten', V.wartezeit(4) === 0 && V.wartezeit(5) === 30000 && V.wartezeit(6) === 60000 && V.wartezeit(50) === 900000);

  // Migration: alter Speicherstand ohne Vorgänge -> wird der geöffnete Vorgang, bleibt unter den alten Schlüsseln
  {
    const alt = { 'lotse.state': '{"s":{"adults":2},"p":{"name":"A"}}', 'lotse.pflegecheck': '{"antworten":null}', 'lotse.ack': '1' };
    const s = speicher(alt), t = oeffne(s);
    ck('[vorgaenge] migration: sofort bereit, ohne PIN', t.bereit() && !t.pinAn());
    ck('[vorgaenge] migration: alte Angaben übernommen', holen(t, 'lotse.state') === alt['lotse.state'] && holen(t, 'lotse.pflegecheck') === alt['lotse.pflegecheck']);
    ck('[vorgaenge] migration: ein Vorgang ohne Namen', t.liste().length === 1 && t.aktiv().name === '');
    ck('[vorgaenge] migration: alte Schlüssel bleiben unverändert', s.mem['lotse.state'] === alt['lotse.state'] && s.mem['lotse.ack'] === '1');
    t.umbenennen(t.aktiv().id, 'Familie M.'); await t.fertig();
    const t2 = oeffne(s);
    ck('[vorgaenge] migration: nach Neustart: Name und Angaben da', t2.aktiv().name === 'Familie M.' && holen(t2, 'lotse.state') === alt['lotse.state']);
    ck('[vorgaenge] migration: Angaben des geöffneten Vorgangs nicht doppelt gespeichert', !s.mem['lotse.vorgaenge'].includes('adults'));
  }

  // Speichern, neuer Vorgang, Wechseln, Kopie, Löschen
  {
    const s = speicher({}), t = oeffne(s);
    t.set('lotse.state', '{"s":{"miete":500}}'); t.umbenennen(t.aktiv().id, 'Haushalt 1');
    const id1 = t.aktiv().id;
    const id2 = t.neu('');
    ck('[vorgaenge] vorgang: neuer Vorgang ist leer', holen(t, 'lotse.state') === null && s.mem['lotse.state'] === undefined);
    t.set('lotse.state', '{"s":{"miete":700}}'); t.set('lotse.pfaendung', '{"art":"lohn"}');
    ck('[vorgaenge] vorgang: zwei Vorgänge', t.liste().length === 2);
    t.oeffnen(id1);
    ck('[vorgaenge] vorgang: Wechsel lädt die Angaben des anderen Vorgangs', holen(t, 'lotse.state') === '{"s":{"miete":500}}' && s.mem['lotse.state'] === '{"s":{"miete":500}}' && s.mem['lotse.pfaendung'] === undefined);
    t.oeffnen(id2);
    ck('[vorgaenge] vorgang: Pfändung gehört zum Vorgang', holen(t, 'lotse.pfaendung') === '{"art":"lohn"}');
    const k = t.kopie(id1, 'Haushalt 1 (Kopie)');
    ck('[vorgaenge] kopie: Kopie geöffnet, gleiche Angaben', t.aktiv().id === k && holen(t, 'lotse.state') === '{"s":{"miete":500}}');
    t.set('lotse.state', '{"s":{"miete":999}}');
    t.oeffnen(id1);
    ck('[vorgaenge] kopie: Änderung an der Kopie ändert das Original nicht', holen(t, 'lotse.state') === '{"s":{"miete":500}}');
    ck('[vorgaenge] umbenennen: leerer Name abgelehnt', t.umbenennen(id1, '   ') === false && t.aktiv().name === 'Haushalt 1');
    t.loeschen(id1);
    ck('[vorgaenge] löschen: geöffneter Vorgang gelöscht, anderer geöffnet', t.liste().length === 2 && t.aktiv().id !== id1);
    await t.fertig();
    const t2 = oeffne(s);
    ck('[vorgaenge] laden: nach Neustart dieselben Vorgänge', t2.liste().map((v) => v.name).join('|') === t.liste().map((v) => v.name).join('|') && t2.aktiv().id === t.aktiv().id);
    t2.loeschen(t2.liste()[0].id); t2.loeschen(t2.liste()[0].id);
    ck('[vorgaenge] löschen: letzter Vorgang gelöscht: leerer Vorgang bleibt', t2.liste().length === 1 && holen(t2, 'lotse.state') === null);
  }

  // Verschlüsselung mit PIN
  {
    const s = speicher({}), t = oeffne(s);
    t.set('lotse.state', '{"s":{"miete":812},"p":{"name":"Erika Muster"}}'); t.umbenennen(t.aktiv().id, 'Akte Muster');
    ck('[vorgaenge] pin: zu kurze PIN abgelehnt', (await t.pinSetzen('12')) === false && !t.pinAn());
    ck('[vorgaenge] pin: PIN gesetzt', (await t.pinSetzen('4711')) === true && t.pinAn());
    const roh = JSON.stringify(s.mem);
    ck('[vorgaenge] pin: nichts Lesbares mehr gespeichert', !/Muster|812|miete/.test(roh) && s.mem['lotse.state'] === undefined, roh.slice(0, 200));
    ck('[vorgaenge] pin: PIN nicht gespeichert', !roh.includes('4711'));
    const m = JSON.parse(s.mem['lotse.vorgaenge']);
    ck('[vorgaenge] pin: Salt (16 Byte), IV (12 Byte), Durchläufe gespeichert', atob(m.pin.salt).length === 16 && atob(m.pin.iv).length === 12 && m.pin.iter === 2000);
    t.set('lotse.state', '{"s":{"miete":900}}'); await t.fertig();
    const iv1 = JSON.parse(s.mem['lotse.vorgaenge']).pin.iv;
    t.set('lotse.state', '{"s":{"miete":901}}'); await t.fertig();
    ck('[vorgaenge] pin: jedes Speichern mit neuem IV', JSON.parse(s.mem['lotse.vorgaenge']).pin.iv !== iv1);

    const g = oeffne(s);
    ck('[vorgaenge] pin: Neustart: gesperrt, keine Angaben', g.opt.warGesperrt && !g.bereit() && g.liste().length === 0);
    let geladen = 'nichts'; g.get('lotse.state', (v) => { geladen = v; });
    g.set('lotse.state', '{"s":{}}');
    ck('[vorgaenge] pin: gesperrt: Lesen wartet, Schreiben überschreibt nichts', geladen === 'nichts');
    const f = await g.entsperren('0000');
    ck('[falsche PIN] abgelehnt, bleibt gesperrt', !f.ok && !g.bereit() && geladen === 'nichts');
    const ok = await g.entsperren('4711');
    ck('[vorgaenge] pin: richtige PIN entsperrt', ok.ok && g.bereit() && geladen === '{"s":{"miete":901}}' && g.aktiv().name === 'Akte Muster');
    ck('[vorgaenge] pin: Pfändung usw. bleiben verschlüsselt nach Wechsel', (g.neu('B'), g.set('lotse.pfaendung', '{"art":"konto"}'), await g.fertig(), !JSON.stringify(s.mem).includes('konto')));

    // Durchprobieren: Wartezeit, auch nach Neustart
    const h = oeffne(s);
    for (let i = 0; i < 4; i++) await h.entsperren('1111');
    const r5 = await h.entsperren('1111');
    ck('[falsche PIN] nach 5 Versuchen Wartezeit', !r5.ok && r5.warten === 30000, r5);
    const r6 = await h.entsperren('4711');
    ck('[falsche PIN] während der Wartezeit hilft auch die richtige PIN nicht', !r6.ok && r6.warten > 0);
    const h2 = oeffne(s);
    ck('[falsche PIN] Wartezeit bleibt nach Neustart', h2.sperrRest() > 0);
    let uhr = Date.now() + 31000; const h3 = oeffne(s, { jetzt: () => uhr });
    ck('[falsche PIN] nach Ablauf der Wartezeit entsperrbar', (await h3.entsperren('4711')).ok);
    ck('[vorgaenge] pin: PIN ausschalten: Angaben wieder unter den alten Schlüsseln', (await h3.pinAus()) !== false && !h3.pinAn() && s.mem['lotse.pfaendung'] === '{"art":"konto"}');
    const h4 = oeffne(s);
    ck('[vorgaenge] pin: nach Ausschalten ohne PIN geladen', h4.bereit() && h4.liste().length === 2);

    // PIN vergessen: alles löschen
    await h4.pinSetzen('2468');
    const v = oeffne(s); await v.allesLoeschen();
    ck('[vorgaenge] vergessen: alles gelöscht, leer und bereit', v.bereit() && !v.pinAn() && v.liste().length === 1 && s.mem['lotse.vorgaenge'] === undefined && holen(v, 'lotse.state') === null);
  }

  // Automatisches Löschen
  {
    let uhr = Date.UTC(2026, 10, 20);
    const s = speicher({}), t = oeffne(s, { jetzt: () => uhr });
    t.set('lotse.state', 'a'); t.umbenennen(t.aktiv().id, 'Alt');
    uhr += 20 * TAG; t.neu('Neu'); t.set('lotse.state', 'b');
    ck('[vorgaenge] ablauf: ohne Einstellung kein Löschdatum', t.liste().every((x) => x.ablauf === null));
    t.tage(30);
    ck('[vorgaenge] ablauf: Löschdatum = zuletzt geändert + 30 Tage', t.liste()[0].ablauf === Date.UTC(2026, 10, 20) + 30 * TAG);
    ck('[vorgaenge] ablauf: nur 0, 30, 90 erlaubt', t.tage(45) === 0 && t.tage(90) === 90 && t.tage(30) === 30);
    await t.fertig();
    uhr += 15 * TAG; // „Alt“ jetzt 35 Tage unverändert, „Neu“ 15 Tage
    const t2 = oeffne(s, { jetzt: () => uhr });
    ck('[vorgaenge] ablauf: abgelaufener Vorgang beim Start gelöscht', t2.liste().map((x) => x.name).join() === 'Neu' && holen(t2, 'lotse.state') === 'b');
    // mit PIN: alles abgelaufen -> ohne PIN gelöscht
    await t2.pinSetzen('1234');
    uhr += 31 * TAG;
    const t3 = oeffne(s, { jetzt: () => uhr });
    ck('[vorgaenge] ablauf: mit PIN: alles abgelaufen wird auch gesperrt gelöscht', t3.bereit() && !t3.pinAn() && t3.liste().length === 1 && t3.tage() === 30);
  }

  // Speicherfehler (voll oder gesperrt): Meldung statt Absturz, alte Daten bleiben
  {
    const s = speicher({ 'lotse.state': 'x' }), t = oeffne(s);
    s.voll = true;
    t.set('lotse.state', 'y'); t.umbenennen(t.aktiv().id, 'Z'); await t.fertig();
    ck('[vorgaenge] fehler: Speicherfehler gemeldet', t.opt.fehlerMeldung > 0);
    ck('[vorgaenge] fehler: alter Stand bleibt erhalten', s.mem['lotse.state'] === 'x');
    ck('[vorgaenge] fehler: PIN ohne Speicher: nicht als gesetzt gemeldet', (await t.pinSetzen('1234')) === false && !t.pinAn());
  }

  console.log(fails ? `\n${fails} von ${n} Prüfungen fehlgeschlagen` : `Vorgänge-Test bestanden: ${n} Prüfungen`);
  process.exit(fails ? 1 : 0);
})();
