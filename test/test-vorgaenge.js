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
  ck('[vorgaenge] PIN zum Entsperren: 4 bis 12 Ziffern (auch ältere PINs)', V.PIN_RE.test('1234') && V.PIN_RE.test('123456789012') && !V.PIN_RE.test('123') && !V.PIN_RE.test('12a4'));
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
    ck('[vorgaenge] vorgang: Wechsel ohne PIN schreibt erst lotse.vorgaenge, dann die Klartext-Schlüssel', holen(t, 'lotse.state') === '{"s":{"miete":500}}' && s.mem['lotse.state'] === '{"s":{"miete":700}}');
    await t.fertig(); await null;
    ck('[vorgaenge] vorgang: Wechsel lädt die Angaben des anderen Vorgangs', holen(t, 'lotse.state') === '{"s":{"miete":500}}' && JSON.parse(s.mem['lotse.vorgaenge']).klar.aktiv === id1 && s.mem['lotse.state'] === '{"s":{"miete":500}}' && s.mem['lotse.pfaendung'] === undefined);
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
    ck('[vorgaenge] pin: PIN gesetzt', (await t.pinSetzen('471108')) === true && t.pinAn());
    const roh = JSON.stringify(s.mem);
    ck('[vorgaenge] pin: nichts Lesbares mehr gespeichert', !/Muster|812|miete/.test(roh) && s.mem['lotse.state'] === undefined, roh.slice(0, 200));
    ck('[vorgaenge] pin: PIN nicht gespeichert', !roh.includes('471108'));
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
    const ok = await g.entsperren('471108');
    ck('[vorgaenge] pin: richtige PIN entsperrt', ok.ok && g.bereit() && geladen === '{"s":{"miete":901}}' && g.aktiv().name === 'Akte Muster');
    ck('[vorgaenge] pin: Pfändung usw. bleiben verschlüsselt nach Wechsel', (g.neu('B'), g.set('lotse.pfaendung', '{"art":"konto"}'), await g.fertig(), !JSON.stringify(s.mem).includes('konto')));

    // Durchprobieren: Wartezeit, auch nach Neustart
    const h = oeffne(s);
    for (let i = 0; i < 4; i++) await h.entsperren('1111');
    const r5 = await h.entsperren('1111');
    ck('[falsche PIN] nach 5 Versuchen Wartezeit', !r5.ok && r5.warten === 30000, r5);
    const r6 = await h.entsperren('471108');
    ck('[falsche PIN] während der Wartezeit hilft auch die richtige PIN nicht', !r6.ok && r6.warten > 0);
    const h2 = oeffne(s);
    ck('[falsche PIN] Wartezeit bleibt nach Neustart', h2.sperrRest() > 0);
    let uhr = Date.now() + 31000; const h3 = oeffne(s, { jetzt: () => uhr });
    ck('[falsche PIN] nach Ablauf der Wartezeit entsperrbar', (await h3.entsperren('471108')).ok);
    ck('[vorgaenge] pin: PIN ausschalten: Angaben wieder unter den alten Schlüsseln', (await h3.pinAus()) !== false && !h3.pinAn() && s.mem['lotse.pfaendung'] === '{"art":"konto"}');
    const h4 = oeffne(s);
    ck('[vorgaenge] pin: nach Ausschalten ohne PIN geladen', h4.bereit() && h4.liste().length === 2);

    // PIN vergessen: alles löschen
    await h4.pinSetzen('246813');
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
    let gemeldet = null; const t2 = oeffne(s, { jetzt: () => uhr, geloescht: (n, am) => { gemeldet = [n, am]; } });
    ck('[vorgaenge] ablauf: abgelaufener Vorgang beim Start gelöscht', t2.liste().map((x) => x.name).join() === 'Neu' && holen(t2, 'lotse.state') === 'b');
    ck('[vorgaenge] ablauf: Löschen beim Start wird gemeldet (Anzahl, Datum)', gemeldet && gemeldet[0] === 1 && gemeldet[1] === uhr, gemeldet);
    // mit PIN: alles abgelaufen -> ohne PIN gelöscht
    await t2.pinSetzen('482910');
    uhr += 31 * TAG;
    const t3 = oeffne(s, { jetzt: () => uhr });
    ck('[vorgaenge] ablauf: mit PIN: alles abgelaufen wird auch gesperrt gelöscht', t3.bereit() && !t3.pinAn() && t3.liste().length === 1 && t3.tage() === 30);
  }

  // Uhrsprung: mehr als ein Jahr seit dem letzten Öffnen -> erst nachfragen
  {
    let uhr = Date.UTC(2026, 10, 20);
    const s = speicher({}), t = oeffne(s, { jetzt: () => uhr });
    t.set('lotse.state', 'a'); t.umbenennen(t.aktiv().id, 'A'); t.tage(30); await t.fertig();
    uhr += 400 * TAG;
    let frage = null; const t2 = oeffne(s, { jetzt: () => uhr, sprung: (ja) => { frage = ja; } });
    ck('[vorgaenge] uhr: Sprung über ein Jahr -> Rückfrage, noch nichts gelöscht', typeof frage === 'function' && t2.liste().length === 1 && t2.aktiv().name === 'A');
    frage();
    ck('[vorgaenge] uhr: nach „Ja“ abgelaufene Vorgänge gelöscht', t2.liste().length === 1 && t2.aktiv().name === '' && holen(t2, 'lotse.state') === null);
  }

  // PIN prüfen (für „PIN ändern“ und „ausschalten“); Fehler beim Anzeigen zählt nicht als falsche PIN
  {
    const s = speicher({}), t = oeffne(s);
    t.set('lotse.state', 'x'); await t.pinSetzen('135790');
    ck('[vorgaenge] pinPruefen: richtige PIN ja, falsche nein', (await t.pinPruefen('135790')) === true && (await t.pinPruefen('000000')) === false);
    const t2 = oeffne(s, { bereit: () => { throw new Error('Anzeige'); } });
    let fehler = null; const r = await t2.entsperren('135790').catch((e) => { fehler = e; });
    ck('[vorgaenge] entsperren: Fehler beim Anzeigen ist kein Fehlversuch', fehler && /Anzeige/.test(fehler.message) && t2.bereit() && !JSON.parse(s.mem['lotse.vorgaenge']).fehl, r);
  }

  // Fristen (lotse.fristliste): gehört zum Vorgang, mit PIN verschlüsselt, kopiert und gelöscht; ueberall() liest alle Vorgänge
  {
    const s = speicher({}), t = oeffne(s);
    ck('[vorgaenge] DATEN enthält lotse.fristliste', V.DATEN.indexOf('lotse.fristliste') >= 0);
    t.set('lotse.fristliste', '{"v":1,"e":[{"art":"eigen","titel":"Geheimfrist"}]}'); t.umbenennen(t.aktiv().id, 'A');
    const b = t.kopie(t.aktiv().id, 'B');
    ck('[vorgaenge] fristliste: Kopie kopiert', /Geheimfrist/.test(holen(t, 'lotse.fristliste')) && t.aktiv().id === b);
    t.neu('C');
    const u = t.ueberall('lotse.fristliste');
    ck('[vorgaenge] ueberall: alle Vorgänge, ohne PIN auch die nicht geöffneten', u.length === 3 && u.filter((x) => /Geheimfrist/.test(x.wert || '')).length === 2 && u.filter((x) => x.aktiv).length === 1 && u[2].aktiv && u[2].wert === null, u);
    await t.pinSetzen('246813'); await t.fertig();
    ck('[vorgaenge] fristliste mit PIN nicht im Klartext', !Object.values(s.mem).some((v) => /Geheimfrist/.test(v)));
    ck('[vorgaenge] ueberall mit PIN (entsperrt)', t.ueberall('lotse.fristliste').filter((x) => /Geheimfrist/.test(x.wert || '')).length === 2);
    t.loeschen(b);
    ck('[vorgaenge] fristliste: Löschen löscht', t.ueberall('lotse.fristliste').filter((x) => /Geheimfrist/.test(x.wert || '')).length === 1);
  }

  // Speicherfehler (voll oder gesperrt): Meldung statt Absturz, alte Daten bleiben
  {
    const s = speicher({ 'lotse.state': 'x' }), t = oeffne(s);
    s.voll = true;
    t.set('lotse.state', 'y'); t.umbenennen(t.aktiv().id, 'Z'); await t.fertig();
    ck('[vorgaenge] fehler: Speicherfehler gemeldet', t.opt.fehlerMeldung > 0);
    ck('[vorgaenge] fehler: alter Stand bleibt erhalten', s.mem['lotse.state'] === 'x');
    ck('[vorgaenge] fehler: PIN ohne Speicher: nicht als gesetzt gemeldet', (await t.pinSetzen('482910')) === false && !t.pinAn());
  }

  // Sicherheitspunkte mittel/niedrig (Prüfung 21.11.2026): PIN-Stärke, Fehlversuche nacheinander und im Arbeitsspeicher,
  // Geräteuhr zurückgestellt, Schreibsperre beim Sperren des geöffneten Vorgangs, Lesefehler nicht als „leer“
  {
    const P = V.pinNeuPruefen;
    ck('[pin-staerke] neue PIN: mindestens 6 Ziffern', V.PIN_NEU_MIN === 6 && P('48291') === 'laenge' && P('482910') === '' && P('4829103', 8) === '' && P('482910375', 8) === 'laenge' && P('4829103755123', 12) === 'laenge' && P('48a910') === 'laenge' && P('') === 'laenge' && P(null) === 'laenge');
    ck('[pin-staerke] leicht zu raten wird abgelehnt', ['123456', '654321', '890123', '210987', '111111', '000000', '121212', '123123', '12345678', '98765432', '4747474747'].every((x) => P(x, 12) === 'einfach'), ['123456', '890123', '121212'].map((x) => P(x)));
    ck('[pin-staerke] normale PINs gehen', ['482910', '135792', '246813', '471108', '19072026', '112358'].every((x) => P(x, 8) === ''), ['482910', '135792', '112358'].map((x) => P(x, 8)));
    const s = speicher(), t = oeffne(s); t.set('lotse.state', '{"x":1}'); await t.fertig();
    ck('[pin-staerke] App-PIN: 4 Ziffern und 123456 nicht angenommen', (await t.pinSetzen('4711')) === false && (await t.pinSetzen('123456')) === false && !t.pinAn());
    const id = t.aktiv().id; t.neu('Zweiter'); await t.fertig();
    ck('[pin-staerke] Vorgang-PIN: 4 Ziffern und 111111 nicht angenommen', (await t.gSperren(id, '4711')) === false && (await t.gSperren(id, '111111')) === false && !t.liste().find((v) => v.id === id).gesperrt);
  }
  {
    // Ältere PIN mit 4 Ziffern (vor dieser Änderung festgelegt) entsperrt weiter
    const c = V.leer(Date.now()); c.liste[0].name = 'Alt'; c.liste[0].daten = { 'lotse.state': '{"alt":4}' };
    const salt = new Uint8Array(16).fill(7), key = await V.schluessel('4711', salt, 2000), e = await V.verschluesseln(key, c);
    const s = speicher({ 'lotse.vorgaenge': JSON.stringify({ v: 1, tage: 0, pin: { salt: Buffer.from(salt).toString('base64'), iter: 2000, iv: e.iv, ct: e.ct } }) });
    const t = oeffne(s);
    ck('[pin-staerke] alte PIN mit 4 Ziffern entsperrt weiter, pinPruefen ebenso', t.gesperrt() && (await t.entsperren('4711')).ok && holen(t, 'lotse.state') === '{"alt":4}' && (await t.pinPruefen('4711')) === true);
  }
  {
    const s0 = speicher(), t0 = oeffne(s0); t0.set('lotse.state', '{"x":2}'); await t0.pinSetzen('482910'); await t0.fertig();
    // Gleichzeitig gestartete Versuche laufen nacheinander: ab dem 5. Fehlversuch greift die Wartezeit, auch die richtige PIN hilft dann nicht
    const s = speicher(s0.mem); let mono = 1000, uhr = Date.now(); const t = oeffne(s, { mono: () => mono, jetzt: () => uhr });
    const r = await Promise.all(Array.from({ length: 8 }, (_, i) => t.entsperren(String(100000 + i))));
    const richtig = await t.entsperren('482910');
    ck('[fehlversuche] gleichzeitige Versuche nacheinander: genau 5 Fehlversuche gezählt, Rest wartet', r.slice(0, 4).every((x) => !x.ok && !x.warten) && r[4].warten === 30000 && r.slice(5).every((x) => !x.ok && x.warten > 0) && JSON.parse(s.mem['lotse.vorgaenge']).fehl === 5, r);
    ck('[fehlversuche] in der Wartezeit auch richtige PIN nicht', !richtig.ok && richtig.warten > 0 && !t.bereit());
    // Geräteuhr eine Stunde vorgestellt: im laufenden Betrieb bleibt die Wartezeit (Uhr seit dem Start der App)
    uhr += 3600000;
    ck('[fehlversuche] Geräteuhr vorgestellt: Wartezeit bleibt', t.sperrRest() > 0 && !(await t.entsperren('482910')).ok);
    mono += 31000;
    ck('[fehlversuche] nach Ablauf (Uhr seit dem Start) entsperrbar', (await t.entsperren('482910')).ok && t.bereit());
  }
  {
    // Geräteuhr zurückgestellt: gespeichertes „gesperrt bis“ liegt weit in der Zukunft, gewartet wird höchstens die Wartezeit zum Zähler
    const s0 = speicher(), t0 = oeffne(s0); await t0.pinSetzen('482910'); await t0.fertig();
    const m = JSON.parse(s0.mem['lotse.vorgaenge']); m.fehl = 5; m.sperreBis = Date.now() + 400 * TAG; s0.mem['lotse.vorgaenge'] = JSON.stringify(m);
    const t = oeffne(speicher(s0.mem));
    ck('[fehlversuche] Uhr zurückgestellt: höchstens 30 Sekunden statt Tage', t.sperrRest() > 0 && t.sperrRest() <= 30000, t.sperrRest());
  }
  {
    // Den geöffneten Vorgang sperren: bis das Ergebnis feststeht, nimmt set() nichts an (kein Schreiben in den danach geöffneten Vorgang)
    const s = speicher(), t = oeffne(s);
    t.set('lotse.state', '{"wer":"B"}'); const b = t.aktiv().id; t.neu('A'); t.set('lotse.state', '{"wer":"A"}'); const a = t.aktiv().id; await t.fertig();
    const p = t.gSperren(a, '482910', '');
    const waehrend = t.set('lotse.state', '{"wer":"A","neu":"spät"}');
    ck('[sperren] während des Sperrens: set() abgelehnt', waehrend === false && t.sperrtGerade());
    const ok = await p; await t.fertig();
    ck('[sperren] danach: anderer Vorgang offen, unverändert; set() geht wieder', ok && t.aktiv().id === b && holen(t, 'lotse.state') === '{"wer":"B"}' && !t.sperrtGerade() && t.set('lotse.state', '{"wer":"B2"}') === true);
    const g = await t.oeffneGesperrt(a, '482910');
    ck('[sperren] gesperrter Vorgang ohne die späte Änderung', JSON.parse(g.daten['lotse.state']).wer === 'A' && !/spät/.test(g.daten['lotse.state']) && !JSON.stringify(s.mem).includes('spät'));
    // Einen anderen (nicht geöffneten) Vorgang sperren: der geöffnete nimmt weiter an
    t.neu('C'); await t.fertig(); const cId = t.aktiv().id; t.oeffnen(b); await t.fertig();
    const p2 = t.gSperren(cId, '482910', ''); const w2 = t.set('lotse.state', '{"wer":"B3"}'); await p2; await t.fertig();
    ck('[sperren] anderer Vorgang wird gesperrt: geöffneter speichert weiter', w2 === true && holen(t, 'lotse.state') === '{"wer":"B3"}');
  }
  {
    // Lesefehler (iOS: Datei vor dem ersten Entsperren nicht lesbar): nicht „leer“, nichts überschreiben, später erneut lesen
    const start = { 'lotse.state': '{"echt":1}', 'lotse.vorgaenge': JSON.stringify({ v: 1, tage: 0, klar: { aktiv: 'a1', liste: [{ id: 'a1', name: 'Echt', erstellt: 1, geaendert: 1, daten: null }] } }) };
    const s = speicher(start); let kaputt = 'lotse.vorgaenge', nochmal = null, meldungen = 0;
    s.roh.get = (k, cb, fehler) => { if (k === kaputt || kaputt === '*') { if (fehler) fehler(); else cb(null); return; } cb(k in s.mem ? s.mem[k] : null); };
    const t = oeffne(s, { lesefehler: (n) => { meldungen++; nochmal = n; } });
    const vorher = JSON.stringify(s.mem);
    ck('[lesefehler] Hauptschlüssel nicht lesbar: nicht bereit, gemeldet, set() nimmt nichts an', !t.bereit() && meldungen === 1 && typeof nochmal === 'function' && t.set('lotse.state', '{"leer":1}') === false);
    await t.fertig();
    ck('[lesefehler] nichts überschrieben', JSON.stringify(s.mem) === vorher);
    kaputt = 'lotse.haushalt'; nochmal();
    ck('[lesefehler] Datenschlüssel nicht lesbar: weiter nicht bereit, erneut gemeldet', !t.bereit() && meldungen === 2 && JSON.stringify(s.mem) === vorher);
    kaputt = null; nochmal();
    ck('[lesefehler] wieder lesbar: Angaben vollständig geladen', t.bereit() && holen(t, 'lotse.state') === '{"echt":1}' && t.aktiv().name === 'Echt');
    // Ohne Fehler-Rückruf (z. B. ältere Speicher-Hülle): wie bisher null = leer
    const s2 = speicher({ 'lotse.state': 'z' }); const t2 = oeffne(s2);
    ck('[lesefehler] normaler Speicher unverändert', t2.bereit() && holen(t2, 'lotse.state') === 'z');
  }

  console.log(fails ? `\n${fails} von ${n} Prüfungen fehlgeschlagen` : `Vorgänge-Test bestanden: ${n} Prüfungen`);
  process.exit(fails ? 1 : 0);
})();
