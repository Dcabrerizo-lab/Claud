# Unabhängige Prüfung PR #126: BAföG-Betrag als Spanne

Geprüft: `src/rules.js` (R.bafoeg, bafBedarf, bafEink, bafAnrEltern, bafSchaetzKind, bafSchaetzIch, bafoeg0), Texte `bafoeg.*` (13 Sprachen, Einfache Sprache), Tests, `docs/PRUEFLISTE.md`.
Alle Quellen amtlich, Abruf 21.11.2026.

## Beträge (alle bestätigt)

| Wert | Fundstelle | Ergebnis |
|---|---|---|
| Freibetrag eigenes Einkommen 389 € | Bekanntmachung vom 18.11.2025, BGBl. 2025 I Nr. 279 (ausgegeben 26.11.2025), recht.bund.de/bgbl/1/2025/279/VO.html: „zum 1. Januar 2026 auf 389 Euro festgesetzt“. § 23 Abs. 1 Satz 1 Nr. 1 nennt 353 € „vorbehaltlich einer Bekanntmachung nach Absatz 6 Satz 3“ | 389 € gilt am 21.11.2026. Eine Bekanntmachung für 2027 ändert erst ab 1.1.2027 |
| 475 €, 59 €, 380 € | § 13 Abs. 1 Nr. 2, Abs. 2 BAföG | stimmt |
| 102 + 35 €, 185 + 48 € | § 13a Abs. 1, 2, Abs. 3 Satz 4 BAföG | stimmt |
| 160 € je Kind unter 14 | § 14b BAföG | stimmt |
| 2.540 €, 1.690 €, 770 €, 850 €, 50 %, 5 % | § 25 Abs. 1, 3, 4 BAföG; § 23 Abs. 1 Nr. 2, 3 | stimmt |
| 22,3 %, höchstens 17.200 €/Jahr | § 21 Abs. 2 Nr. 1 BAföG | stimmt |
| 15.000 / 45.000 €, 2.300 € | § 29 Abs. 1 BAföG | stimmt |
| Teilung, Geschwister in Ausbildung | § 11 Abs. 4, § 25 Abs. 3 Satz 2 BAföG | stimmt |
| Rundung, unter 10 € nichts | § 51 Abs. 3, 4 BAföG | stimmt |

Geplante Änderung, noch nicht beschlossen: Entwurf 30. BAföG-Änderungsgesetz (BT-Drs. 21/8405, 1. Lesung 15.10.2026, Anhörung 11.11.2026; bundestag.de): Wohnpauschale 440 € / 41 € ab Sommersemester 2027, Bedarf 503 € ab Wintersemester 2027/28. Bis zur Verkündung gelten die Werte oben.

## Nachrechnung (eigene Rechnung nach §§ 13, 13a, 21, 23, 25, 29, 30, 51)

| Fall | Eigene Rechnung | SoLo | Ergebnis |
|---|---|---|---|
| Paar, 1 Verdiener 5.000 € brutto, Steuer 700 €, kein Geschwister | Einkommen § 21: 3.105,36 €; Anrechnung 282,68 €; 251 € (bei Eltern, familienversichert) bis 709 € (eigene Wohnung, mit KV) | 183–388 / 504–709 € | enthalten |
| wie oben, 1 Geschwister ohne Ausbildung | Freibetrag 3.310 €: keine Anrechnung, 534 bis 992 € | 358–671 / 679–992 € | enthalten |
| wie oben, Geschwister in Ausbildung | 282,68 / 2 = 141,34 €: 393 bis 851 € | wie Zeile davor | enthalten |
| Paar, Rente 3.400 € | höchstens (3.400 − 2.540) × 50 % = 430 €: ab 104 € | 104–581 / 425–902 € | enthalten |
| Paar, 9.000 € brutto | Anrechnung 1.312 € > 1.088 € | „eher nicht“ | richtig |
| Studierende, 38, Vermögen 46.000 € | 1.000 / 12 = 83,33 €: 588–684 / 909–1.005 € (amtlich Fall 150: 922 €) | gleich | richtig |
| Studierende, 38, Lohn 1.000 € ohne Steuer | (1.000 − 102,50) × 0,777 − 389 = 308,36 € | 684 bis 780 € | richtig |
| Studierende, 36, Lohn 1.500 € | 1.085,86 − 389 = 696,86 €: 295 bis 391 € | vor Korrektur 295–531 €, jetzt „bis etwa“ | enthalten |
| Studierende, 31, ohne Einkommen | Beginn vor 30 möglich: Eltern zählen, 0 € möglich | vor Korrektur „etwa 670 bis 1.090 €“ | Fehler, korrigiert |
| Paar, 1 Geschwister, Grenze „eher nicht“ | (E − 2.540) × 50 % / 2 > 1.078,50 € ab 6.854,01 € | 6.854 „möglich“, 6.855 „eher nicht“ | richtig |

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Untere Grenze für Studierende von 30 bis 36 Jahren zu hoch: § 11 Abs. 3 Nr. 2 stellt auf das Alter bei Beginn des Ausbildungsabschnitts ab, die App kennt nur das Alter heute. Wer mit unter 30 begonnen hat, bekommt wegen des Einkommens der Eltern vielleicht nichts; die App nannte „etwa 670 bis 1.090 €“ | hoch | `bafSchaetzIch`: Spanne mit unterer Grenze erst ab 37 Jahren oder Gruppe 40 bis 49, sonst „bis etwa“. Tests 5, 7, 8 auf Jahrgang 1988, neuer Test 8a | gesetze-im-internet.de/baf_g/__11.html |
| Text `bafoeg.alter`: „höchstens 45 Jahre alt“ ist falsch. Kein BAföG, wer bei Beginn das 45. Lebensjahr vollendet hat, also 45 ist | mittel | „noch nicht 45 Jahre alt“ in 13 Sprachen und Einfacher Sprache, PRUEFLISTE, Test | gesetze-im-internet.de/baf_g/__10.html (Abs. 3) |
| Kind studiert, zwei Erwachsene: Die Spanne setzt voraus, dass beide die Eltern sind (Stiefelternteil zählt nicht, der andere Elternteil schon) und rechnet mit dem Einkommen von heute statt vom vorletzten Jahr. Stand nirgends | mittel | Satz mit beiden Annahmen vor `bafoeg.kindHinweis` (13 Sprachen, Einfache Sprache) | § 11 Abs. 2, § 24 Abs. 1, § 25 Abs. 3 Nr. 1 BAföG |
| Text `bafoeg.ab30` (de, en): „bekommt BAföG ohne das Einkommen der Eltern“ klingt nach Zusage | gering | de, en: „Das Einkommen der Eltern zählt dann nicht“. Übrige Sprachen unverändert | § 11 Abs. 3 Nr. 2 BAföG |
| Freibetrag 389 € und alle anderen Beträge | kein Fehler | – | siehe Tabelle oben |
| „Eher nicht“ nur, wenn es auch mit Geschwistern in förderfähiger Ausbildung nicht reicht | kein Fehler | – | § 11 Abs. 4, § 25 Abs. 3 Satz 2, Abs. 4 BAföG |
| Annahmen 80 % − 80 €, Rente 80 %, sonstiges 50 % gehen nur in die obere Grenze ein. Die untere Grenze rechnet mit dem vollen Netto. Keine zu hohe Zusage | kein Fehler | – | § 21 Abs. 1, 2 BAföG |

## Offen

| Punkt | Schwere | Vorschlag |
|---|---|---|
| Stiefeltern: Die Annahme steht jetzt im Text, die Zahl bleibt aber stehen | mittel | Frage „Sind beide Erwachsenen die Eltern des Kindes?“, bei Nein nur „bis etwa“ |
| Vermögen des studierenden Kindes über 15.000 € fragt die App nicht (nur Hinweis) | gering | Hinweis reicht vorerst |
| Sehr hohe Löhne über der Pauschal-Höchstgrenze 17.200 €/Jahr und Krankenkasse mit hohem Zusatzbeitrag: Einkommen nach § 21 kann rund 20 € über dem Netto liegen (Anrechnung rund 10 € mehr) | gering | durch Abrunden auf 10 € meist gedeckt |
| Studierende mit Lohn ohne Rentenversicherungspflicht (16,5 % statt 22,3 %, § 21 Abs. 2 Nr. 2): Anrechnung bis rund 6 % des Lohns höher | gering | selten; untere Grenze mit 16,5 % rechnen |
| Über 25, allein, ohne eigenen Kassenbeitrag (z. B. familienversichert wegen Behinderung): untere Grenze 137 € zu hoch | gering | selten |
| `bafoeg.ab30` in 11 weiteren Sprachen noch „bekommt BAföG ohne …“ | erledigt | alle 13 Sprachen „Einkommen der Eltern zählt dann nicht“ (Rückübersetzung geprüft), Einfache Sprache war schon so |
| Neue Übersetzungen (ar, fa, fa-AF, ps, so) nicht von Muttersprachlern geprüft | gering | Gegenlesen |
| Amtlicher Abgleich (200 Fälle) nach der Korrektur nicht neu gelaufen; die Spanne ist nur breiter geworden | gering | Workflow bei Gelegenheit neu starten |
