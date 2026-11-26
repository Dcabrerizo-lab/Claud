# Rechtsmatrix Grundsicherung, Wohnen, Ausbildung, Asyl (Stand 24.11.2026)

Bereinigte Matrix aus der Vollprüfung vom 24.11.2026 (Prüfung „grundsicherung-wohnen“ B-01–B-15 und Fable-Blindprüfung, Befunde zu diesem Gebiet).
Grundlage für künftige Aktualitätsprüfungen. Feste Fälle: `test/rechtsmatrix/grusi.json`, Läufer: `test/test-rechtsmatrix-grusi.js` (144 Fälle, Stand 25.11.2026 nach der Gegenprüfung von PR #194).
Abrufdatum aller Quellen: 24.11.2026, wenn nicht anders genannt. gesetze-im-internet.de war am 24.11.2026 aus der Arbeitsumgebung zeitweise nicht erreichbar; dann buzer.de (gleicher Wortlaut, mit Fassungsangabe) oder gesetze-bayern.de.

## Rechtsgrundlagen

| Gebiet | Vorschrift | Quelle |
|---|---|---|
| Grundsicherungsgeld (SGB II) | §§ 7, 9, 11, 11b, 12, 12a, 19–22, 27 SGB II | https://www.buzer.de/7_SGB_II.htm, …/11_SGB_II.htm, …/11b_SGB_II.htm, …/12_SGB_II.htm, https://www.gesetze-im-internet.de/sgb_2/__22.html |
| Grundsicherung im Alter (SGB XII) | §§ 35, 41, 43, 82, 90, 94 SGB XII | https://www.buzer.de/35_SGB_XII.htm |
| AsylbLG | §§ 1–3a, 7 AsylbLG | https://www.buzer.de/7_AsylbLG.htm (Fassung ab 1.1.2026) |
| BAföG / BAB | § 2 BAföG; §§ 56, 60 SGB III | https://www.gesetze-im-internet.de/sgb_3/__60.html (Abruf durch Fable 24.11.2026) |
| Rundfunkbeitrag | § 4 Abs. 1 RBeitrStV | https://www.gesetze-bayern.de/Content/Document/RBeitrStV-4 |
| WBS Bayern | Art. 4 BayWoBindG | https://www.gesetze-bayern.de/Content/Document/BayWoBindG-4 |
| Wohngeld | §§ 3, 7, 12–20 WoGG | unverändert gegenüber der Prüfung 20./21.11.2026 |

## Beträge

| Wert | Betrag | Fundstelle |
|---|---|---|
| Regelbedarfe 2026 (Stufe 1–6) | 563 / 506 / 451 / 471 / 390 / 357 € | RBSFV 2026 (`R.regelbedarf`) |
| Schonvermögen SGB II je Person | 5.000 € (unter 30), 10.000 € (ab 30), 12.500 € (ab 40), 20.000 € (ab 50); höherer Betrag ab dem Monat des Geburtstags | § 12 Abs. 2 Satz 1, 2 SGB II |
| Freibetrag Arbeit | 100 € + 20 % (100–520) + 30 % (520–1.000) + 10 % (1.000–1.200 bzw. 1.500 mit Kind) | § 11b Abs. 2, 3 SGB II |
| Freibetrag unter 25 in Schule/Studium/Ausbildung/Freiwilligendienst | Minijob-Grenze (603 €, ab 2027 633 €) + 30 % (520–1.000) + 10 % (bis 1.200/1.500); 20-%-Stufe entfällt | § 11b Abs. 2b, Abs. 3 Satz 4 SGB II; § 8 Abs. 1a SGB IV |
| Freibetrag Arbeit SGB XII (Grundsicherung im Alter/EM, Hilfe zum Lebensunterhalt; geprüft 26.11.2026) | 30 % des Einkommens aus selbstständiger und nichtselbstständiger Tätigkeit, höchstens 50 % RS1 (281,50 €), je Person, nie mehr als das Netto. Bezugsgröße: **Brutto** (herrschende Verwaltungspraxis), getrennt von den Abzügen nach Abs. 2; „wahrscheinlich“ nur, wenn es auch mit 30 % vom Netto reicht, sonst „möglich“; Betrag als Spanne (unten Netto-, oben Brutto-Lesart). Ohne Brutto (nur Auszahlung) zählt das Netto. Werkstatt: 1/8 RS1 + 50 % des Rests, ohne Deckel (Satz 2, Entgelt = Brutto); Zusatzrente § 82 Abs. 4/5, Grundrente § 82a: 100 € + 30 % des Rests, höchstens 50 % RS1 (unverändert) | § 82 Abs. 3, 4, 5 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__82.html; Fachanweisung Hamburg §§ 82–84 SGB XII (Stand 1.1.2022) Ziff. 5.6 „das unbereinigte Einkommen (das Brutto-Einkommen)“; Verwaltungsanweisung Bremen zu § 82 SGB XII (20.2.2019), Rechenbeispiel 30 % vom Brutto; Kreis Viersen, Richtlinie zu § 82 SGB XII (Stand 1.10.2024), 82.5.3; Gegenlesart angedeutet in WD 6 - 3000 - 018/26 (Bundestag, 16.3.2026: Satz 1 „Einkommen“, Satz 2 „Entgelt“); alle Abruf 26.11.2026 (`gsaEinkommen`, `R.gsaArbeit`) |
| Bescheid-Check Grundsicherung im Alter: Freibetrag für Arbeit (Entscheidung David 26.11.2026) | Freiwilliges Feld „Lohn brutto (falls bekannt)“. Ohne Angabe: 30 % vom Netto wie bisher. Mit Angabe: beide Lesarten. Bescheid passt zur Brutto-Lesart → „passt“; passt er nur zur Netto-Lesart → „prüfen“ (kein Fehler) mit Hinweis und Differenz in € pro Monat (nachfragen oder vorsorglich Widerspruch in der Frist); liegt er darüber → „zu wenig“, gemessen an der Netto-Lesart. Zahlbetrag sicher mit Netto-, zusätzlich mit Brutto-Lesart | § 82 Abs. 3 Satz 1 SGB XII; Fachanweisung Hamburg §§ 82–84 SGB XII (Stand 1.1.2022) Ziff. 5.6; Verwaltungsanweisung Bremen zu § 82 SGB XII (20.2.2019); Kreis Viersen, Richtlinie § 82 (Stand 1.10.2024) 82.5.3; Gegenlesart angedeutet in WD 6 - 3000 - 018/26 (16.3.2026); Abruf 26.11.2026 (`erweiterungen/bescheid-gsa.js`, Test `test/erweiterungen/test-gsa.js` 2b) |
| Versicherungspauschale | 30 € je volljähriger Person (auch auf Kindergeld-Rest beim Elternteil), nur SGB II | § 6 Abs. 1 Nr. 1 GrusiGV; nicht im SGB XII (§ 82 Abs. 2) |
| Unterkunft, Deckel ab 1.7.2026 | höchstens 1,5 × abstrakt angemessene Unterkunftskosten, auch in der Karenzzeit; mit Kindern im Einzelfall mehr | § 22 Abs. 1 Satz 6, 7 SGB II; § 35 Abs. 1 Satz 7, 8 SGB XII |
| Orientierung angemessene Miete in SoLo | Wohngeld-Höchstbetrag (mit Klimakomponente) × 1,1 + Heizkostenkomponente; Deckel: × 1,1 × 1,5 + Heizkostenkomponente | BSG-Rechtsprechung (ohne schlüssiges Konzept), Anlage 1 WoGG |
| AsylbLG Freibeträge | 25 % vom Erwerbseinkommen (höchstens 50 % der Bedarfsstufe), 200 € Vermögen je Person | § 7 Abs. 3, 5 AsylbLG (`R.asylblg`) |
| WBS Bayern | 17.500 / 27.500 € + 5.000 € je weitere Person + 1.300 € je Kind, Schwangerschaft wie ein Kind | Art. 4 Abs. 1 Satz 2–4 BayWoBindG |
| Sofortzuschlag (ergänzt 24.11.2026, Teil `rest`) | 25 € im Monat je Kind/Jugendlichem/jungem Erwachsenen mit Regelbedarfsstufe 3–6; auch, wenn nur das Kindergeld den Anspruch entfallen lässt. Bescheid-Check: Zahlbetrag mit oder ohne Sofortzuschlag gilt als passend | § 72 Abs. 1 SGB II i. d. F. ab 1.7.2026, https://www.buzer.de/72_SGB_II.htm (`R.sofortzuschlag`, `erweiterungen/bescheid-sgb2.js`) |
| Elterngeld beim Wohngeld (Teil `rest`) | 300 € frei, bei ElterngeldPlus 150 €, je Kind der Geburt; keine Bedingung „Einkommen vor der Geburt“. Bescheid-Check ohne Angabe Basis/Plus: vorsichtig 150 €, Bescheid mit 300 € gilt auch als passend | § 14 Abs. 2 Nr. 6 WoGG, § 10 Abs. 1, 3, 4 BEEG, https://www.buzer.de/14_WoGG.htm, https://www.buzer.de/10_BEEG.htm (`erweiterungen/bescheid-wg.js` `egFrei`) |
| Elterngeld beim BAföG (Elterneinkommen, Teil `rest`) | wie Wohngeld (BAföG in § 10 Abs. 5 BEEG nicht ausgenommen); untere Schätzung mit dem höchsten möglichen Freibetrag (300 € je Kind der Geburt), „wahrscheinlich“ weiter mit dem vollen Elterngeld | § 21 Abs. 3 Satz 1 Nr. 4 BAföG, § 1 Nr. 2 Buchst. f BAföG-EinkommensV, https://www.buzer.de/s1.htm?a=1&g=BAf%C3%B6G-EinkommensV (`bafEgFreiMax` in `src/rules.js`) |
| Text `t.kdu.angemessen` bei Grundsicherung im Alter (geprüft, Teil `rest`) | Karenzzeit 1 Jahr, Deckel 1,5-fach, danach Kostensenkung in der Regel höchstens 6 Monate – gilt im SGB XII gleich; Paragraf „§ 22 SGB II, § 35 SGB XII“ korrekt (für die Grundsicherung im Alter über § 42a Abs. 1 SGB XII) | § 35 Abs. 1 Satz 2–8, Abs. 3 Satz 2 SGB XII, § 42a Abs. 1 SGB XII, https://www.buzer.de/35_SGB_XII.htm, https://www.buzer.de/42a_SGB_XII.htm |

## Konstellationen mit Soll-Ergebnis

| Nr | Konstellation | Soll | Rechtsgrundlage |
|---|---|---|---|
| 1 | Studium/Schule, allein, eigene Wohnung, jedes Alter (auch ab 45) | Grundsicherungsgeld „möglich“ ohne Betrag: Studierende ausgeschlossen (dem Grunde nach, auch ab 45), Schüler mit Schüler-BAföG auch mit eigener Wohnung nicht (§ 12 BAföG); die App trennt Schule und Studium nicht (Gegenprüfung 25.11.2026, Befund 3) | § 7 Abs. 5, Abs. 6 Nr. 2 SGB II; BSG 19.08.2010, B 14 AS 24/09 R |
| 2 | Studium mit Partner oder Kind | „möglich“ ohne Betrag: Partner/Kind eigener Anspruch, Mehrbedarfe nach § 27 | § 7 Abs. 3, 5, § 27 SGB II |
| 3 | Studium/Schule bei den Eltern | „möglich“ (nicht ausgeschlossen, wenn BAföG bezogen oder nur wegen Einkommen abgelehnt) | § 7 Abs. 6 Nr. 2 SGB II |
| 4 | Betriebliche Ausbildung, nicht bei den Eltern | BAföG „eher nicht“, BAB „möglich“, Wohngeld ausgeschlossen, Grundsicherungsgeld höchstens „möglich“ (BAB vorrangig, zählt als Einkommen), Rundfunk „möglich“ | § 2 BAföG; §§ 56, 60 SGB III; § 12a SGB II; § 20 Abs. 2 WoGG; § 4 Abs. 1 Nr. 5 b RBeitrStV |
| 5 | Azubi unter 25 mit Vergütung | Freibetrag § 11b Abs. 2b (z. B. 900 € brutto: 717 €; 2.000 €: 767 €) | § 11b Abs. 2b, 3 SGB II |
| 6 | BAB-Haken | nur, wer nicht bei den Eltern wohnt; unter 18 ohne Ehe/Kind zusätzlich Ausbildungsort zu weit | § 60 Abs. 1, 2 SGB III |
| 7 | Volljähriges Kind in Schule/Studium im Haushalt | Grundsicherungsgeld höchstens „möglich“ (BAföG zählt; sonst ggf. Ausschluss des Kindes) | § 7 Abs. 5, 6 SGB II |
| 8 | Kind mit Unterhalt über seinem Bedarf | Unterhalt bis zum Kinderbedarf, Kindergeld-Rest beim Elternteil minus 30 € (Kind 9, Unterhalt 700: ca. 700 €; Kind unter 6, Unterhalt 500, Miete 400: ca. 790 €) | § 11 Abs. 1 Satz 5 SGB II |
| 9 | Kinder ohne Altersangabe | kein „eher nicht“, solange es mit Stufe 4 (471 €) noch reichen kann | § 23 Nr. 1 SGB II |
| 10 | Bei den Eltern (einfache Version), unter 25 ohne Kind | „möglich“, Stufe 3 (451 €), Eltern-Einkommen zählt | § 7 Abs. 3 Nr. 4, § 9 Abs. 2, § 20 Abs. 2 SGB II |
| 11 | Bei den Eltern, ab 25 | „möglich“ (Vermutung der Unterstützung) | § 9 Abs. 5 SGB II |
| 12 | EU-Bürger unter 5 Jahren, früher gearbeitet, jetzt ohne Arbeit | höchstens „möglich“ | § 7 Abs. 1 Satz 2 SGB II; § 2 Abs. 3 FreizügG/EU |
| 13 | Kein Geburtsjahr, Vermögen 5.000–20.000 € je Erwachsenem | höchstens „möglich“; „eher nicht“ erst über 20.000 € (Gegenprüfung 25.11.2026, Befund 12) | § 12 Abs. 2 SGB II |
| 14 | Geburtsjahr = Jahr des 30./40./50. Geburtstags, Vermögen zwischen den Freibeträgen | höchstens „möglich“ | § 12 Abs. 2 Satz 2 SGB II |
| 15 | Miete über 1,5 × Orientierungsgrenze | Betrag mit der 1,5-fachen Grenze (allein, Stufe III, Miete 1.500, kein Einkommen: ca. 1.460 €) | § 22 Abs. 1 Satz 6 SGB II, § 35 Abs. 1 Satz 7 SGB XII |
| 16 | Paar, eine Person im Rentenalter/dauerhaft voll erwerbsgemindert, ohne Kinder | Grundsicherungsgeld „möglich“ (gemischte Bedarfsgemeinschaft; schon auf main mit PR #193) | § 7 Abs. 1, 3, 4 SGB II |
| 17 | dasselbe, zweite Person mit Lohn oder ALG I, oder Kinder ab 14/volljährig | Grundsicherung im Alter höchstens „möglich“ ohne Betrag | § 43 Abs. 1 SGB XII; § 7 Abs. 2, 3 SGB II |
| 18 | Volle Erwerbsminderung befristet, bei den Eltern | Text: Hilfe zum Lebensunterhalt oder Grundsicherungsgeld, Eltern-Einkommen kann zählen | §§ 27, 39, 41 Abs. 3, 43 Abs. 5 SGB XII; § 19 Abs. 1 SGB II |
| 19 | Gestattung/Duldung ohne Bezug, mit Lohn oder Vermögen | AsylbLG „möglich“; „eher nicht“ nur, wenn das Einkommen nach 25 % Freibetrag mehr als 100 € über Regelbedarf + Miete liegt. Vermögen über 200 € je Person: nur „möglich“ (keine gesetzliche Schwelle; Gegenprüfung 25.11.2026, Befund 7) | § 7 Abs. 1, 3, 5 AsylbLG |
| 20 | WBS Bayern, schwanger | Grenze + 1.300 € | Art. 4 Abs. 1 Satz 4 BayWoBindG |
| 22 | Grundsicherung im Alter, Kindergeld-Rest beim Elternteil | ohne 30-€-Pauschale (SGB XII zieht nur tatsächliche Beiträge ab; Gegenprüfung 25.11.2026, Befund 6) | § 82 Abs. 2 Satz 1 Nr. 3 SGB XII |
| 23 | Grundsicherung im Alter mit Lohn 1.000 brutto / 800 netto, allein, Miete 500 | „wahrscheinlich“, Spanne 500–540 € (30 % vom Netto: 240 €; vom Brutto: 281,50 € gedeckelt); vor 26.11.2026: 500 € | § 82 Abs. 3 Satz 1 SGB XII (EX-GSA-AE1, R-GSA-AE1/2) |
| 24 | dasselbe mit Rente 520 + Lohn 900/720, Miete 500 | „möglich“ mit Spanne 40–90 € (nur in der Brutto-Lesart ≥ 50 €) | § 82 Abs. 3 Satz 1 SGB XII (EX-GSA-AE2, R-GSA-AE4) |
| 25 | Rente nur brutto eingegeben, keine Kinder im Haushalt, knapp über der Grenze | „unwahrscheinlich“ erst, wenn es auch mit Kinderlosen-Zuschlag (Netto 0,6 % kleiner) nicht reicht, sonst „möglich“ | § 55 Abs. 3 SGB XI (EX-GSA-PV1, R-PV-01/02) |
| 21 | Wohngeld Studium ab 45 allein | „möglich“ (kein § 20 WoGG ohne BAföG-Anspruch dem Grunde nach wegen Alters) | § 20 Abs. 2 WoGG; WoGVwV 20.21 |

## Offen (nicht in SoLo abgebildet)

- Hilfe zum Lebensunterhalt: längerer Klinik- oder Heimaufenthalt (§ 7 Abs. 4 Satz 1, 3 Nr. 1 SGB II, § 27b SGB XII) und die Dauer der vollen Erwerbsminderung werden nicht abgefragt (Karte seit 25.11.2026, siehe unten).
- Humanitäre Aufenthaltstitel (§ 23 Abs. 1, § 24, § 25 Abs. 4, 5 AufenthG) laufen als „Aufenthaltstitel“, obwohl teils AsylbLG gilt (Z-01 / Z5). Rechtskreiswechsel Ukraine: Verkündung am 24.11.2026 nicht feststellbar.
- Geringfügige Tätigkeit von EU-Bürgern (Z-02), Rundfunk-Härtefall bei Vorrang Wohngeld (Z-03), Werte ab 1.1.2027 (Z-05).

## Hilfe zum Lebensunterhalt (Karte `hlu`, neu seit 25.11.2026)

Rechtsgrundlagen (gesetze-im-internet.de, Abruf 25.11.2026): § 19 Abs. 1, 2 SGB XII (Grundsicherung im Alter geht vor), § 21 SGB XII und § 5 Abs. 2 SGB II (kein Anspruch, wer dem Grunde nach Grundsicherungsgeld bekommt), § 7 Abs. 4 SGB II (Altersrente schließt Grundsicherungsgeld aus), § 18 (Beginn ab Kenntnis, kein Antrag nötig), § 27 Abs. 2 (Einsatzgemeinschaft Partner, minderjährige Kinder mit Eltern), § 27a (Regelsätze wie Grundsicherung), § 30 Abs. 1 (Mehrbedarf G nur ab Altersgrenze oder bei voller Erwerbsminderung), § 35 (Unterkunft, 1,5-Deckel wie § 22 SGB II), § 39 (Vermutung der Bedarfsdeckung bei Verwandten im Haushalt; nicht bei Eingliederungshilfe-/Pflegebedarf, Satz 3 Nr. 2; in der Grundsicherung ausgeschlossen, § 43 Abs. 5), § 41 Abs. 3, 3a (dauerhafte volle Erwerbsminderung, Werkstatt = Grundsicherung), §§ 82, 82a (Einkommen, Freibeträge), § 90 mit Verordnung (10.000 € je volljährige Person, 500 € je überwiegend unterhaltene Person), § 94 Abs. 1a (100.000 € Jahreseinkommen der Eltern bzw. Kinder; **Satz 6: gilt nicht bei Hilfe zum Lebensunterhalt an minderjährige Kinder**), § 94 Abs. 2 (Pauschalen bei volljährigen Kindern mit Eingliederungshilfe/Pflegebedürftigkeit); Rundfunk § 4 Abs. 1 Nr. 1 RBeitrStV; Wohngeld-Ausschluss § 7 Abs. 1 Satz 1 Nr. 6 WoGG.

| Nr | Konstellation | Soll | Test |
|---|---|---|---|
| H1 | Allein, nur Rente, Alter 60 bis unter Regelaltersgrenze oder unbekannt | „möglich“, Betrag wie Grundsicherung im Alter (Rente 614, Miete 500: ca. 450 €) | HLU-01, HLU-02, FA-GG-28 |
| H2 | Dasselbe als Paar oder mit Kind ab 14 bzw. volljährig | „möglich“ ohne Betrag (erwerbsfähige Person -> Jobcenter) | HLU-03, HLU-13 |
| H3 | Erwerbsfähig, jung | „eher nicht“ (§ 21 SGB XII) | HLU-04 |
| H4 | Allein über der Regelaltersgrenze mit Kindern unter 14 | „wahrscheinlich“ für die Kinder, ohne Betrag (in der GSA-Karte enthalten) | HLU-05 |
| H5 | Paar über der Regelaltersgrenze, zweite Person mit Rente | „möglich“ ohne Betrag (Partner evtl. Altersrente vor der Grenze) | HLU-06 |
| H6 | Vermögen über 10.000 € je Person / Einkommen deckt Bedarf | „eher nicht“ | HLU-07, HLU-12 |
| H7 | Vorgezogene Altersrente mit Merkzeichen G | Mehrbedarf G nicht eingerechnet, Hinweis | HLU-08, HLU-P04 |
| H8 | Bezug Grundsicherungsgeld / Asyl / Bezug Sozialamt | „eher nicht“ / „eher nicht“ / „bekommst du schon“ | HLU-09, -10, -11 |
| H9 | Volle Erwerbsminderung (eigene Angabe, nicht Werkstatt) | „möglich“ (nur wenn befristet), ohne doppelten Betrag; GSA-Karte verweist | HLU-P01, FA-GG-18 |
| H10 | Voll erwerbsgemindert bei den Eltern | „möglich“ ohne Betrag, Hinweis § 39 | HLU-P02 |
| H11 | Werkstatt | „eher nicht“ (Grundsicherung, § 41 Abs. 3a) | HLU-P03 |

## Bekanntgabe per Post (Fristtexte)

Ein Bescheid per Post gilt am vierten Tag nach der Aufgabe zur Post als bekannt gegeben (§ 37 Abs. 2 SGB X, § 122 Abs. 2 Nr. 1 AO; buzer.de, Abruf 25.11.2026). Die Texte nennen das seit 25.11.2026 so („meist ist das sein Datum“). Der Fristenrechner rechnet weiter ab dem Datum des Bescheids: Die Aufgabe zur Post ist nie früher als das Datum, die Frist fällt also eher zu früh (sichere Seite).
