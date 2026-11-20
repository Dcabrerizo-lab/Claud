// Aufforderung zur Senkung der Unterkunfts- oder Heizkosten: Erkennung (BriefLesen.kostensenkung), Anzeige-Regeln und
// Antwort-Entwurf (erweiterungen/kostensenkung.js). Testfälle 1–11 aus docs/entwuerfe/kostensenkung.md (Abschnitt 4.6, Prüfvermerk).
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../../erweiterungen/brief-lesen.js');
const K = require('../../erweiterungen/kostensenkung.js');
let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };

const KS_JC = `Jobcenter Musterstadt
Musterstadt, den 03.11.2026
BG-Nummer: 123A1234567
Aufforderung zur Senkung der Kosten der Unterkunft (§ 22 Abs. 1 SGB II)
Ihre tatsächlichen Aufwendungen für die Unterkunft (Bruttokaltmiete) betragen 690,00 EUR monatlich.
Für einen Haushalt mit 2 Personen ist in Musterstadt eine Bruttokaltmiete von 540,00 EUR angemessen (Angemessenheitsgrenze).
Ihre Kosten sind damit unangemessen. Die Karenzzeit endete am 31.10.2026.
Wir bitten Sie, Ihre Unterkunftskosten bis zum 31.05.2027 zu senken, z. B. durch Umzug, Untervermietung oder Verhandlung mit dem Vermieter.
Ab dem 01.06.2027 werden nur noch die angemessenen Kosten in Höhe von 540,00 EUR berücksichtigt.
Bitte weisen Sie Ihre Bemühungen (Wohnungssuche) monatlich nach.
Grundsicherungsgeld nach dem Zweiten Buch Sozialgesetzbuch`;
const KS_SA = `Landratsamt Musterkreis – Sozialamt
Grundsicherung im Alter und bei Erwerbsminderung nach dem SGB XII
Hinweis zur Angemessenheit Ihrer Unterkunftskosten (§ 35 Abs. 3 SGB XII)
Ihre Bruttokaltmiete von 610,00 € übersteigt die angemessene Miete von 495,00 € für einen Einpersonenhaushalt.
Die Aufwendungen werden längstens für sechs Monate in tatsächlicher Höhe übernommen.
Wir fordern Sie auf, Ihre Kosten zu senken.`;
const KS_HEIZ = `Jobcenter Musterstadt
Ihre Heizkosten sind unangemessen hoch
Nach der Prüfung Ihrer Heizkostenabrechnung liegen Ihre Heizkosten über den angemessenen Heizkosten.
Wir bitten Sie, Ihre Heizkosten zu senken. Nach Ablauf von sechs Monaten werden nur noch die angemessenen Heizkosten anerkannt (§ 22 Abs. 1 SGB II).`;
const BESCHEID_GEKUERZT = `Jobcenter Musterstadt
Datum: 12.06.2027
Bescheid über Grundsicherungsgeld nach dem SGB II
Bewilligungszeitraum 01.06.2027 bis 30.11.2027
Berechnungsbogen
Regelbedarf 563,00
Kosten der Unterkunft und Heizung 610,00
Die Unterkunftskosten werden nach Ablauf der Frist aus unserer Kostensenkungsaufforderung vom 03.11.2026 nur noch in angemessener Höhe berücksichtigt; die tatsächlichen Kosten sind unangemessen.
Zahlbetrag 1.173,00
Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats Widerspruch erhoben werden.`;
const ANH_KS = `Jobcenter Musterstadt
Anhörung nach § 24 SGB X
Ihre Unterkunftskosten sind unangemessen. Wir beabsichtigen, die Kosten zu senken. Sie haben Gelegenheit, sich bis zum 30.04.2027 zu äußern.`;

// 1. Jobcenter
const a = L.kostensenkung(KS_JC);
ok('1 JC erkannt', a.ist, a);
ok('1 JC Träger', a.traeger === 'jc', a.traeger);
ok('1 JC Beträge', a.kostenIst === 690 && a.grenze === 540, [a.kostenIst, a.grenze]);
ok('1 JC Frist mit Beleg', a.frist === '31.05.2027' && /zu senken/.test(a.fristZeile), [a.frist, a.fristZeile]);
ok('1 JC Stichtag', a.stichtag === '01.06.2027', a.stichtag);
ok('1 JC nicht Heizung', a.heiz === false);
ok('1 JC Datum', a.datum === '2026-11-03', a.datum);
ok('1 JC kein Rechtsbehelf, keine Anhörung', !a.rechtsbehelf && !a.anhoerung);
// 2. Sozialamt
const b = L.kostensenkung(KS_SA);
ok('2 SA erkannt', b.ist && b.traeger === 'sa', b);
ok('2 SA Beträge', b.kostenIst === 610 && b.grenze === 495, [b.kostenIst, b.grenze]);
ok('2 SA keine Frist (sechs Monate wird nicht berechnet)', b.frist === null, b.frist);
// 3. Heizkosten
const c = L.kostensenkung(KS_HEIZ);
ok('3 Heizung erkannt', c.ist && c.heiz === true, c);
// 4. Bescheid mit Verweis auf die Aufforderung bleibt Bescheid
ok('4 Bescheid nicht KS', L.kostensenkung(BESCHEID_GEKUERZT).ist === false);
ok('4 Bescheid bleibt jc', L.erkenne(BESCHEID_GEKUERZT).art === 'jc');
// 5. Anhörung mit Kostensenkung
const d = L.kostensenkung(ANH_KS);
ok('5 Anhörung: KS und anhoerung', d.ist && d.anhoerung, d);
ok('5 Anhörung bleibt anh', L.erkenne(ANH_KS).art === 'anh');
// 6. Negativ: vorhandene Testtexte und Mieterhöhung
const quelle = fs.readFileSync(path.join(__dirname, 'test-brief-lesen.js'), 'utf8');
['JC', 'NK', 'WG', 'KIZ', 'GSA'].forEach((name) => {
  const m = quelle.match(new RegExp('const ' + name + ' = `([\\s\\S]*?)`;'));
  ok('6 Text vorhanden: ' + name, !!m);
  if (m) ok('6 kein KS: ' + name, L.kostensenkung(m[1]).ist === false);
});
ok('6 kein KS: Mieterhöhung', !L.kostensenkung('Hausverwaltung Muster\nMieterhöhung zum 01.02.2027\nDie neue Miete von 720,00 EUR ist angemessen und ortsüblich (Mietspiegel).\nBitte stimmen Sie bis zum 31.12.2026 zu.').ist);
// 7. Texterkennung mit Fehlern
const ocr = KS_JC.replace('690,00', '690, 00').replace('Ihre Kosten sind damit unangemessen.', 'Ihre Kosten sind damit\nunangemessen.');
ok('7 OCR-Variante erkannt', L.kostensenkung(ocr).ist);
// 8. Rechtsbehelfsbelehrung → Hinweis „Widerspruch doch möglich“
const e = L.kostensenkung(KS_JC + '\nRechtsbehelfsbelehrung: Gegen diesen Bescheid kann Widerspruch erhoben werden.');
ok('8 mit Rechtsbehelf erkannt', e.ist && e.rechtsbehelf, e);
ok('8 Anzeige wsDoch', K.anzeige(e).ws === 'el.ks.wsDoch');
ok('8 ohne Rechtsbehelf keinWs', K.anzeige(a).ws === 'el.ks.keinWs');
// 9. „kein Verwaltungsakt“ hebt Bescheid-Merkmale auf
const g9 = KS_JC + '\nFür den Bewilligungszeitraum 01.12.2026 bis 31.05.2027 werden Leistungen bewilligt.\nDieses Schreiben ist kein Verwaltungsakt.';
const g9ohne = KS_JC + '\nFür den Bewilligungszeitraum 01.12.2026 bis 31.05.2027 werden Leistungen bewilligt.';
ok('9 kein VA: erkannt', L.kostensenkung(g9).ist && L.kostensenkung(g9).keinVA);
ok('9 ohne Hinweis: nicht erkannt (2 Bescheid-Merkmale)', !L.kostensenkung(g9ohne).ist);
ok('9 kein VA: kein Rechtsbehelf', !L.kostensenkung(g9 + '\nWiderspruch einlegen ist nicht möglich.').rechtsbehelf);
// 10. Jobcenter-Brief, der SGB XII erwähnt
const t10 = KS_JC.replace('Grundsicherungsgeld nach dem Zweiten Buch Sozialgesetzbuch', 'Leistungen nach dem SGB XII erhalten Sie nicht.');
ok('10 Träger jc trotz SGB XII', L.kostensenkung(t10).traeger === 'jc', L.kostensenkung(t10).traeger);
ok('10 ohne Absender: Träger unbekannt', L.kostensenkung('Aufforderung: Ihre Kosten sind unangemessen. Bitte die Unterkunftskosten zu senken. Angemessenheitsgrenze 500,00 EUR. Sechs Monate.').traeger === null);
// 11. Grenze vom 1,5-Fachen
const t11 = L.kostensenkung(KS_JC.replace('690,00', '900,00'));
ok('11 Deckel bei 900 > 810', K.anzeige(t11).deckel === true, [t11.kostenIst, t11.grenze]);
ok('11 kein Deckel bei 690', K.anzeige(a).deckel === false);
ok('11 Deckel nicht bei Heizung', K.anzeige(Object.assign({}, t11, { heiz: true })).deckel === false);
ok('11 Deckel, wenn der Brief das 1,5-Fache nennt', K.anzeige(L.kostensenkung(KS_JC + '\nKosten über dem 1,5-fachen der Grenze werden nicht übernommen.')).deckel === true);
// Anzeige: Zahlen, Details
const az = K.anzeige(a);
ok('Anzeige Unterschied', az.zahlen && az.diff === 150, az);
ok('Anzeige Details ohne Sozialamt', az.details.join() === 'karenz,heiz,wirt,tod,mpb', az.details);
ok('Anzeige Sozialamt-Detail', K.anzeige(b).details.indexOf('sa') >= 0);
ok('Anzeige Heizung zuerst', K.anzeige(c).details[0] === 'heiz' && K.anzeige(c).titel === 'el.ks.titelHeiz');
// Kennungen exportiert
const kn = L.kennungen(KS_JC);
ok('Kennungen: Stelle und BG-Nummer', kn.stelle === 'Jobcenter Musterstadt' && /123A/.test(kn.bg || ''), kn);

// Antwort-Entwurf
const heute = new Date(2026, 10, 20);
const e1 = K.entwurf(a, { name: 'Erika Muster', anschrift: 'Musterweg 1', ort: '12345 Musterstadt', stelle: kn.stelle, bg: kn.bg, heute, gruende: { kinder: true, tod: true, wirt: true } });
ok('Entwurf: Stelle, BG, Datum', /An: Jobcenter Musterstadt/.test(e1) && /BG-Nummer: 123A/.test(e1) && /Musterstadt, den 20\.11\.2026/.test(e1) && /vom 03\.11\.2026/.test(e1), e1);
ok('Entwurf: Kinder', /Kita bzw\. Schule/.test(e1));
ok('Entwurf: jc-Paragrafen, kein SGB XII', /§ 22 Abs\. 1 Satz 11 SGB II/.test(e1) && /§ 22 Abs\. 1 Satz 12 SGB II/.test(e1) && !/SGB XII/.test(e1), e1);
ok('Entwurf: nichts behauptet, was nicht angehakt ist', !/Attest/.test(e1) && !/bemühe mich/.test(e1) && !/schwanger/.test(e1) && !/Anlagen/.test(e1));
const e2 = K.entwurf(b, { heute, gruende: { tod: true, krank: true }, bem: 'drei Wohnungen angefragt' });
ok('Entwurf SA: § 35, kein SGB II', /§ 35 Abs\. 3 Satz 4 SGB XII/.test(e2) && !/SGB II\b/.test(e2), e2);
ok('Entwurf SA: ohne Stelle nur Art', /An das Sozialamt/.test(e2));
ok('Entwurf: Bemühungen und Anlagen nur mit Eingabe', /Bisher habe ich: drei Wohnungen angefragt/.test(e2) && /Anlagen: ärztliches Attest, Nachweise/.test(e2));
const unb = Object.assign({}, a, { traeger: null });
const e3 = K.entwurf(unb, { heute, art: 'an', gruende: { wirt: true } });
ok('Entwurf: Träger unbekannt → beide Paragrafen, kein geratener Empfänger', /Satz 12 SGB II \/ § 35 Abs\. 3 Satz 3 SGB XII/.test(e3) && !/An das Jobcenter|An das Sozialamt/.test(e3), e3);
ok('Entwurf: Kachel jc ohne Träger → Art der Stelle', /An das Jobcenter/.test(K.entwurf(unb, { heute, art: 'jc' })));

console.log(f ? `\n${f} von ${n} Prüfungen fehlgeschlagen` : `Kostensenkung: alle ${n} Prüfungen bestanden`);
process.exit(f ? 1 : 0);
