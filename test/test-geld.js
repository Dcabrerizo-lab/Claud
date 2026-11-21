// Geld und Schulden, neue Teile (src/geld.js): Krisen-Check (alle 128 Antwort-Kombinationen), Prüfliste § 13a RDG, Musterschreiben
// (keine erfundene Anschrift, Pflicht-Hinweis, keine Wertung des Einzelfalls, Eingaben nur als Text), Haken je Vorgang.
// Aufruf: node test/test-geld.js
'use strict';
const G = require('../src/geld.js');
const V = require('../src/vorgaenge.js');
const fs = require('fs'), path = require('path');
let n = 0, f = 0;
const ck = (name, ok, info) => { n++; if (!ok) { f++; console.log('FAIL ' + name + (info !== undefined ? ' -> ' + JSON.stringify(info) : '')); } };

// 1. Krisen-Check: Reihenfolge fest (= Reihenfolge der Fragen), höchstens 3 „zuerst“, ohne Ja die Schulden-Liste, immer „finden“ am Ende
ck('[kc] 7 Fragen in fester Reihenfolge', G.KC.join() === 'mahn,geld,miete,strom,konto,essen,inkasso');
let alleOk = true;
for (let m = 0; m < 128; m++) {
  const a = {}; G.KC.forEach((k, i) => { if (m & (1 << i)) a[k] = true; else if (m % 3) a[k] = false; });
  const e = G.krisenErgebnis(a), ja = G.KC.filter((k, i) => m & (1 << i));
  const liste = e.zuerst.concat(e.danach);
  const ok = e.ende === 'finden' && e.zuerst.length <= 3 && (ja.length ? liste.join() === ja.join() : e.zuerst.join() === 'liste' && !e.danach.length) &&
    liste.every((z, i) => i === 0 || G.KC.indexOf(liste[i - 1]) < G.KC.indexOf(z)) && e.zuerst.length === Math.min(3, Math.max(1, ja.length));
  if (!ok) { alleOk = false; ck('[kc] Kombination ' + m, false, e); break; }
}
ck('[kc] alle 128 Kombinationen: Reihenfolge fest, höchstens 3 zuerst, Rest danach, Beratung am Ende', alleOk);
ck('[kc] ohne Antwort: Schulden-Liste', G.krisenErgebnis({}).zuerst.join() === 'liste' && G.krisenErgebnis(null).zuerst.join() === 'liste');
ck('[kc] nur true zählt als Ja', G.krisenErgebnis({ mahn: 'ja', geld: 1 }).zuerst.join() === 'liste');

// 2. Prüfliste: 6 Punkte, fehlende in Reihenfolge
ck('[ip] 6 Punkte', G.IP.join() === '1,2,3,4,5,6');
ck('[ip] fehlend: nur nicht abgehakte', G.ipFehlend({ 1: true, 3: true, 6: true }).join() === '2,4,5' && G.ipFehlend({}).length === 6 && G.ipFehlend({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }).length === 0);
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'geld.js'), 'utf8');
ck('[ip] Fundstellen § 13a Abs. 1 Nr. 1–8 RDG vollständig zugeordnet (Nr. 1, 2, 3+4, 5+6, 8, 7)', ['Abs. 1 Nr. 1\'', 'Abs. 1 Nr. 2\'', 'Abs. 1 Nr. 3 und 4', 'Abs. 1 Nr. 5 und 6', 'Abs. 1 Nr. 8', 'Abs. 1 Nr. 7'].every((x) => src.includes(x)));
ck('[quellen] Rechtsaussagen mit Fundstelle und Abrufdatum im Code', ['§ 43 StGB', '§ 459a StPO', '§ 451 StPO', 'Art. 293 EGStGB', '§ 903 Abs. 1 und 3 ZPO', 'rdg/__13a.html'].every((x) => src.includes(x)) && (src.match(/abgerufen 20\.11\.2026/g) || []).length >= 4);

// 3. Musterschreiben
const leer = G.MUSTER.map((a) => G.schreiben(a, {}));
ck('[ms] 4 Muster', G.MUSTER.join() === 'geduld,aufst,wider,pkonto');
ck('[ms] ohne Eingaben: Lücken zum Ausfüllen, keine erfundene Anschrift', leer.every((t) => t.includes(G.LUECKE.adr) && t.includes(G.LUECKE.g) && t.includes(G.LUECKE.name) && !/\d{5}\s+[A-ZÄÖÜ]/.test(t)));
ck('[ms] keine offenen Platzhalter in geschweiften Klammern', leer.every((t) => !/\{[a-z]+\}/i.test(t)));
const voll = G.schreiben('aufst', { g: 'Muster Inkasso GmbH', adr: 'Musterweg 1\n12345 Musterstadt', az: 'AZ-1', datum: '20.11.2026' });
ck('[ms] Eingaben eingesetzt, Anschrift nur aus der Eingabe', voll.includes('Muster Inkasso GmbH\nMusterweg 1\n12345 Musterstadt') && voll.includes('Aktenzeichen: AZ-1') && !voll.includes(G.LUECKE.adr) && voll.includes('[Ort], 20.11.2026'));
ck('[ms] Forderungsaufstellung nennt § 13a Abs. 1 und 2 RDG und ist kein Anerkenntnis', /§ 13a Abs\. 1 und 2/.test(voll) && /kein Anerkenntnis/.test(voll));
ck('[ms] Forderungsaufstellung: auch § 43d BRAO (Rechtsanwälte), keine Zahlungsverweigerung im Muster (Prüfung 20.11.2026)', /§ 43d der Bundesrechtsanwaltsordnung/.test(G.schreiben('aufst', {})) && !/zahle ich nicht/.test(G.MUSTER.map((m) => G.schreiben(m, {})).join('\n')));
ck('[ms] P-Konto: § 903 ZPO, Angaben nach Abs. 3 (Höhe, Art, Zeitraum, Unterhaltsberechtigte, Geburtsdatum)', /§ 903 ZPO/.test(leer[3]) && /Höhe und Art der Leistungen/.test(leer[3]) && /Zeitraum/.test(leer[3]) && /Geburtsdatum minderjähriger/.test(leer[3]));
ck('[ms] keine Wertung des Einzelfalls (verjährt, unberechtigt, unwirksam, rechtswidrig)', leer.every((t) => !/verjährt|unberechtigt|unwirksam|rechtswidrig|sittenwidrig/i.test(t)));
const boese = G.schreiben('geduld', { g: '<script>x</script>\u0007Firma', adr: 'a\r\nb\u0000', az: 'x'.repeat(500) });
ck('[ms] Steuerzeichen entfernt, Länge begrenzt, Text bleibt Text', !/[\u0000-\u0008\u000b-\u001f]/.test(boese) && boese.includes('<script>x</script> Firma') && !boese.includes('x'.repeat(61)));
ck('[ms] Absender-Zusatz nur, wenn angegeben', !leer[0].includes('vertreten') && G.schreiben('geduld', { absender: 'vertreten durch Beratungsstelle X' }).includes('vertreten durch Beratungsstelle X'));
ck('[ms] Pflicht-Hinweis „keine Rechtsberatung“ und Frist bei Gerichtspost (Sprachdatei)', /keine Rechtsberatung/.test(require('../src/lang/schulden/de.json')['ms.hinweis']) && /Frist/.test(require('../src/lang/schulden/de.json')['ms.hinweis']));

// 3b. Ratenempfehlung (SoLo-Faustregel): frei = Einnahmen − Ausgaben, Puffer 10 % der Einnahmen (mind. 50 €), abgerundet auf 5 €; alles in Cent
// RE: reine Rechnung ohne Pfändungsgrenze (pfaendbar sehr hoch); RP: mit Pfändungstabelle (§ 850c ZPO, Werte 2026 aus src/rules.js)
const RE = (ein, aus, liste, wesentlich) => G.rateEmpfehlung({ ein, aus, wesentlich: wesentlich !== false, pfaendbar: 1e9 }, liste);
const RP = (ein, aus, o, liste) => G.rateEmpfehlung(Object.assign({ ein, aus, wesentlich: true }, o || {}), liste);
ck('[rate] kein Plan: null, leer, keine Einnahmen oder ohne Miete und Essen → Vermerk', G.rateEmpfehlung(null).art === 'ohnePlan' && G.rateEmpfehlung({}).art === 'ohnePlan' &&
  RE(0, 50000).art === 'ohnePlan' && RE(200000, 50000, [], false).art === 'ohnePlan' && G.rateEmpfehlung({ ein: 120000, aus: 52000, ausgefuellt: true }).art === 'ohnePlan');
let r1 = RE(200000, 150000); // frei 500,00; Puffer max(200,00; 50,00) = 200,00; 300,00 → 300 €
ck('[rate] Grundfall cent-genau: 2000 − 1500 = 500, Puffer 200, Rate 300 €', r1.art === 'rate' && r1.frei === 50000 && r1.puffer === 20000 && r1.rate === 30000 && r1.teile.length === 0, r1);
r1 = RE(123456, 100000); // frei 234,56; Puffer max(ceil(12345,6)=12346; 5000) = 123,46 → 111,10 → 110 €
ck('[rate] Puffer auf den Cent aufgerundet, Rate auf 5 € abgerundet', r1.puffer === 12346 && r1.rate === 11000, r1);
r1 = RE(40000, 30000); // frei 100; 10 % = 40 < 50 → Puffer 50; Rate 50
ck('[rate] Mindestpuffer 50 € bei kleinen Einnahmen', r1.puffer === 5000 && r1.rate === 5000, r1);
r1 = RE(100000, 120000);
ck('[rate] negativ (mehr Ausgaben als Einnahmen): keine Rate', r1.art === 'keine' && r1.rate === 0 && r1.frei === -20000, r1);
r1 = RE(100000, 90000); // frei 100, Puffer 100 → 0
ck('[rate] frei genau gleich Puffer: keine Rate', r1.art === 'keine' && r1.rate === 0);
r1 = RE(100000, 89500); // frei 105, Puffer 100 → genau 5 €
ck('[rate] genau 5 €: Rate wird empfohlen', r1.art === 'rate' && r1.rate === 500, r1);
r1 = RE(100000, 89501); // 4,99 € → keine
ck('[rate] 4,99 €: keine Rate', r1.art === 'keine' && r1.rate === 0, r1);
r1 = RE(100000, 89001); // 9,99 € → 5 €
ck('[rate] 9,99 € → abgerundet 5 €', r1.rate === 500, r1);
const L3 = [{ id: 'a00001', g: 'A', stand: 60000, st: 'inkasso' }, { id: 'a00002', g: 'B', anfang: 30000, stand: null, st: 'offen' }, { id: 'a00003', g: 'C', stand: 10000, st: 'mahnung' },
  { id: 'a00004', g: 'D', stand: 99999, st: 'erledigt' }, { id: 'a00005', g: 'E', stand: null, anfang: null, st: 'offen' }];
r1 = RE(200000, 150000, L3); // Rate 300 €, Forderungen 600/300/100 (gesamt 1000) → 180/90/30
ck('[rate] mehrere Schulden: anteilig nach Forderung, erledigte und ohne Betrag nicht', r1.teile.map((x) => x.id + ':' + x.rate).join() === 'a00001:18000,a00002:9000,a00003:3000' && r1.gesamt === 100000, r1.teile);
r1 = RE(200000, 155000, [{ id: 'b1', g: 'X', stand: 10000 }, { id: 'b2', g: 'Y', stand: 10000 }, { id: 'b3', g: 'Z', stand: 10000 }]); // Rate 250 € / 3 → je 83 €
ck('[rate] Aufteilung auf ganze Euro abgerundet, Summe nie über der Rate', r1.rate === 25000 && r1.teile.every((x) => x.rate === 8300) && r1.teile.reduce((a, x) => a + x.rate, 0) <= r1.rate, r1.teile);
ck('[rate] nur eine Schuld mit Betrag: keine Aufteilung', RE(200000, 150000, [L3[0], L3[3], L3[4]]).teile.length === 0);
ck('[rate] keine Rate: auch keine Aufteilung', RE(100000, 120000, L3).teile.length === 0);
let alleRate = true;
for (let i = 0; i < 2000 && alleRate; i++) {
  const ein = 1 + Math.floor(Math.random() * 600000), aus = Math.floor(Math.random() * 600000), x = RE(ein, aus);
  const soll = Math.floor((ein - aus - Math.max(Math.ceil(ein / 10), 5000)) / 500) * 500;
  if (x.rate % 500 || x.rate < 0 || (soll >= 500 ? x.rate !== soll : x.rate !== 0 || x.art !== 'keine') || x.rate + x.puffer > ein - aus + (x.rate ? 0 : Infinity)) { alleRate = false; ck('[rate] Zufall', false, { ein, aus, x }); }
}
ck('[rate] 2000 Zufallsfälle: Vielfaches von 5 €, Rate + Puffer nie über frei', alleRate);
// Pfändungsgrenze (Prüfung Richtigkeit 21.11.2026): Rate nie über dem pfändbaren Betrag; 2.000 € netto, keine Unterhaltspflicht:
// (2.000 − 1.587,40) × 0,7 = 288,82 € pfändbar → 285 € statt 300 €
let rp = RP(200000, 150000, { personen: 0 });
ck('[rate-pf] Rate gedeckelt auf den pfändbaren Betrag (abgerundet auf 5 €)', rp.art === 'rate' && rp.pfaendbar === 28882 && rp.rate === 28500 && rp.gedeckelt === true, rp);
rp = RP(220000, 150000, { personen: 0, kindergeld: 25500 }); // Kindergeld unpfändbar: 1.945 → Stufe 1.940 → 246,82 € → 245 €
ck('[rate-pf] Kindergeld zählt nicht zum pfändbaren Einkommen', rp.pfaendbar === 24682 && rp.rate === 24500, rp);
rp = RP(200000, 150000, { personen: 1 }); // Freibetrag 2.184,82 € > 2.000 € → nichts pfändbar
ck('[rate-pf] nichts pfändbar: kein Vorschlag, eigener Hinweis', rp.art === 'unpfaendbar' && rp.rate === 0 && rp.teile.length === 0, rp);
ck('[rate-pf] kein Spielraum bei pfändbarem Einkommen bleibt „keine“', RP(300000, 300000, { personen: 0 }).art === 'keine');
ck('[rate-pf] pfaendbarCent nutzt Rules.pfaendung (cent-genau)', G.pfaendbarCent(200000, 0) === Math.round(require('../src/rules.js').pfaendung(2000, 0).pfaendbar * 100) && G.pfaendbarCent(100000, 0) === 0);
// Vorrang (sl.kopf.1–3): Miete, Strom, Unterhalt, Geldstrafe, Krankenversicherung zuerst, dann Bußgeld/Amt, zum Schluss Inkasso
const LV = [{ id: 'v1', g: 'Inkasso', art: 'inkasso', stand: 60000 }, { id: 'v2', g: 'Strom', art: 'energie', stand: 10000 }, { id: 'v3', g: 'Versand', art: 'sonst', stand: 30000 }];
rp = RE(200000, 150000, LV); // Rate 300: Strom 100 voll, Rest 200 auf 600/300 → 133/66
ck('[rate-vor] vorrangige Schuld zuerst voll, Rest anteilig auf die übrigen', rp.teile.map((x) => x.id + ':' + x.rate).join() === 'v2:10000,v1:13300,v3:6600' && rp.vorrang === true && rp.teile.reduce((a, x) => a + x.rate, 0) <= rp.rate, rp.teile);
rp = RE(200000, 150000, [{ id: 'm', g: 'Vermieter', art: 'miete', stand: 90000 }, { id: 'g', g: 'Staatsanwaltschaft', art: 'geldstrafe', stand: 30000 }, { id: 'i', g: 'Inkasso', art: 'inkasso', stand: 50000 }]);
ck('[rate-vor] reicht die Rate nicht für die vorrangigen Schulden, bekommt Inkasso nichts', rp.teile.map((x) => x.id + ':' + x.rate).join() === 'm:22500,g:7500,i:0', rp.teile);
rp = RE(200000, 150000, [{ id: 'b', g: 'Amt', art: 'behoerde', stand: 5000 }, { id: 'i', g: 'Inkasso', art: 'inkasso', stand: 50000 }, { id: 'u', g: 'Unterhalt', art: 'unterhalt', stand: 5000 }]);
ck('[rate-vor] Reihenfolge Stufe 1, 2, 3', rp.teile.map((x) => x.id + ':' + x.rate).join() === 'u:5000,b:5000,i:20000', rp.teile);
const rs = G.schreiben('rate', { g: 'Muster Inkasso', az: 'K-1', rate: '125' });
ck('[rate] Schreiben: Vorbehalt ohne Anerkennung einer Rechtspflicht, kein Anerkenntnis von Zinsen und Kosten', /ohne Anerkennung einer Rechtspflicht/.test(rs) && /kein Anerkenntnis, insbesondere nicht von Zinsen und Kosten/.test(rs));
ck('[rate] Schreiben: Rate eingesetzt, ohne Rate Lücke, Kostenfrage, keine Wertung', /monatlich 125 € zu zahlen/.test(rs) && /monatlich \[Betrag\] €/.test(G.schreiben('rate', {})) && /Kosten entstehen/.test(rs) && !/verjährt|unberechtigt/.test(rs) && G.schreiben('rate', { rate: '12<b>x' }).includes('monatlich 12 €'));
ck('[rate] Rechenweg und Quelle Anerkenntnis im Code', /SoLo-Faustregel/.test(src) && /§ 212 Abs\. 1 Nr\. 1 BGB/.test(src) && /§ 13a Abs\. 3 RDG/.test(src));

// 4. Haken je Vorgang
ck('[haken] Normierung: nur bekannte Schlüssel und true', JSON.stringify(G.hakenNormiere({ w: { 1: true, 7: true, 2: 'ja' }, u: { 8: true, 9: true }, x: 1 })) === '{"v":1,"w":{"1":true},"u":{"8":true}}' && JSON.stringify(G.hakenNormiere('kaputt')) === '{"v":1,"w":{},"u":{}}');
ck('[haken] lotse.beratung-haken gehört zu den Daten eines Vorgangs (PIN, Kopie, Löschen)', V.DATEN.indexOf('lotse.beratung-haken') >= 0);

if (f) { console.log(f + ' von ' + n + ' FEHLGESCHLAGEN'); process.exit(1); }
console.log('Geld-Test bestanden: ' + n + ' Prüfungen');
