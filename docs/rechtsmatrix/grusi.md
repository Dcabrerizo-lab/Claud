# Rechtsmatrix Grundsicherung, Wohnen, Ausbildung, Asyl (Stand 24.11.2026)

Bereinigte Matrix aus der Vollprüfung vom 24.11.2026 (Prüfung „grundsicherung-wohnen“ B-01–B-15 und Fable-Blindprüfung, Befunde zu diesem Gebiet).
Grundlage für künftige Aktualitätsprüfungen. Feste Fälle: `test/rechtsmatrix/grusi.json`, Läufer: `test/test-rechtsmatrix-grusi.js` (138 Fälle).
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
| Versicherungspauschale | 30 € je volljähriger Person (auch auf Kindergeld-Rest beim Elternteil) | § 6 Abs. 1 Nr. 1 GrusiGV |
| Unterkunft, Deckel ab 1.7.2026 | höchstens 1,5 × abstrakt angemessene Unterkunftskosten, auch in der Karenzzeit; mit Kindern im Einzelfall mehr | § 22 Abs. 1 Satz 6, 7 SGB II; § 35 Abs. 1 Satz 7, 8 SGB XII |
| Orientierung angemessene Miete in SoLo | Wohngeld-Höchstbetrag (mit Klimakomponente) × 1,1 + Heizkostenkomponente; Deckel: × 1,1 × 1,5 + Heizkostenkomponente | BSG-Rechtsprechung (ohne schlüssiges Konzept), Anlage 1 WoGG |
| AsylbLG Freibeträge | 25 % vom Erwerbseinkommen (höchstens 50 % der Bedarfsstufe), 200 € Vermögen je Person | § 7 Abs. 3, 5 AsylbLG (`R.asylblg`) |
| WBS Bayern | 17.500 / 27.500 € + 5.000 € je weitere Person + 1.300 € je Kind, Schwangerschaft wie ein Kind | Art. 4 Abs. 1 Satz 2–4 BayWoBindG |

## Konstellationen mit Soll-Ergebnis

| Nr | Konstellation | Soll | Rechtsgrundlage |
|---|---|---|---|
| 1 | Studium/Schule, allein, eigene Wohnung, jedes Alter (auch ab 45) | Grundsicherungsgeld „eher nicht“ (Ausschluss dem Grunde nach) | § 7 Abs. 5 SGB II; BSG 19.08.2010, B 14 AS 24/09 R |
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
| 13 | Kein Geburtsjahr, Vermögen 5.000–10.000 € | höchstens „möglich“ | § 12 Abs. 2 SGB II |
| 14 | Geburtsjahr = Jahr des 30./40./50. Geburtstags, Vermögen zwischen den Freibeträgen | höchstens „möglich“ | § 12 Abs. 2 Satz 2 SGB II |
| 15 | Miete über 1,5 × Orientierungsgrenze | Betrag mit der 1,5-fachen Grenze (allein, Stufe III, Miete 1.500, kein Einkommen: ca. 1.460 €) | § 22 Abs. 1 Satz 6 SGB II, § 35 Abs. 1 Satz 7 SGB XII |
| 16 | Paar, eine Person im Rentenalter/dauerhaft voll erwerbsgemindert, ohne Kinder | Grundsicherungsgeld „möglich“ (gemischte Bedarfsgemeinschaft; schon auf main mit PR #193) | § 7 Abs. 1, 3, 4 SGB II |
| 17 | dasselbe, zweite Person mit Lohn oder ALG I, oder Kinder ab 14/volljährig | Grundsicherung im Alter höchstens „möglich“ ohne Betrag | § 43 Abs. 1 SGB XII; § 7 Abs. 2, 3 SGB II |
| 18 | Volle Erwerbsminderung befristet, bei den Eltern | Text: Hilfe zum Lebensunterhalt oder Sozialgeld, Eltern-Einkommen kann zählen | §§ 27, 39, 41 Abs. 3, 43 Abs. 5 SGB XII |
| 19 | Gestattung/Duldung ohne Bezug, mit Lohn oder Vermögen | AsylbLG „möglich“; klar gedeckt (mehr als 100 € über Regelbedarf + Miete nach 25 % Freibetrag) oder Vermögen > 200 € je Person + 1 Monatsbedarf: „eher nicht“ | § 7 Abs. 1, 3, 5 AsylbLG |
| 20 | WBS Bayern, schwanger | Grenze + 1.300 € | Art. 4 Abs. 1 Satz 4 BayWoBindG |
| 21 | Wohngeld Studium ab 45 allein | „möglich“ (kein § 20 WoGG ohne BAföG-Anspruch dem Grunde nach wegen Alters) | § 20 Abs. 2 WoGG; WoGVwV 20.21 |

## Offen (nicht in SoLo abgebildet)

- Eigene Karte „Hilfe zum Lebensunterhalt“ (SGB XII, 3. Kapitel) für vorgezogene Altersrente, befristete volle Erwerbsminderung und Kinder bei Eltern mit Grundsicherung im Alter fehlt (Fable 14). Heute nur Texte.
- Humanitäre Aufenthaltstitel (§ 23 Abs. 1, § 24, § 25 Abs. 4, 5 AufenthG) laufen als „Aufenthaltstitel“, obwohl teils AsylbLG gilt (Z-01 / Z5). Rechtskreiswechsel Ukraine: Verkündung am 24.11.2026 nicht feststellbar.
- Geringfügige Tätigkeit von EU-Bürgern (Z-02), Rundfunk-Härtefall bei Vorrang Wohngeld (Z-03), Werte ab 1.1.2027 (Z-05).
