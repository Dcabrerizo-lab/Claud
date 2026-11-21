# Schlussprüfung Update 1.9: Beträge und Recht

Geprüft: alle inhaltlichen Änderungen zwischen `origin/main` und `origin/claude/test-update-1.9` in `src/rules.js`, die davon abhängigen Texte (`src/lang/de.json`, `src/lang/zusatz/de.json`, `src/lang/schulden/de.json`, `src/lang/ausziehen/de.json`, `src/lang/einfach/`) und die Anschriften in `content/behoerden-deutschland.json`.
Stand der Rechtslage: 21.11.2026. Alle Quellen am 21.11.2026 selbst abgerufen.

## Ergebnis

Kein schwerer und kein mittlerer Fehler. Ein geringer Fehler korrigiert (Text `t.gsa.mzGBeide`). Kein Wert für 2027 erscheint vor dem 1.1.2027 (`svrg2027.verkuendet = false`, keine neuen 2027-Werte im Diff).

## Geprüft und bestätigt

| Stelle in der App | Wert / Aussage | Amtliche Quelle (Abruf 21.11.2026) | Ergebnis |
|---|---|---|---|
| Kinderzuschlag, erweiterter Zugang (`kiz.erweitert`) | höchstens 100 € fehlen; Absetzbeträge aus Arbeit mind. 100 €; kein Antrag SGB II/XII | § 6a Abs. 1a BKGG, gesetze-im-internet.de/bkgg_1996/__6a.html; DA-KiZ Stand 20.02.2026 C.4.2 | stimmt |
| Kinderzuschlag, Wohngeld (auch fiktiv) bei Hilfebedürftigkeit | Wohngeld in voraussichtlicher Höhe ansetzen | § 6a Abs. 1 Nr. 3 Satz 2 und 3 BKGG | stimmt |
| Kinderzuschlag, Vermögen knapp über der Grenze | 40.000 € + 15.000 € je weiteres Mitglied; darüber nur 1. Monat gemindert, sonst Wegfall | § 6a Abs. 3 Satz 5 bis 7, Abs. 6 Satz 5 BKGG; DA-KiZ C.2.2.2.3 | stimmt |
| Kinderzuschlag, alleinerziehend mit Altersrente | Rente zählt nur über dem eigenen Bedarf (Kopfteil der Miete), Beispiel 238 € | DA-KiZ Stand 20.02.2026 D.2 Abs. 1 Satz 9 bis 11, Beispiel 2, arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf | stimmt; Ausschluss ohne Kind ab 15 (D.2 Abs. 1 Satz 5) ist im Code beachtet |
| Wohngeld, Mindestbetrag und Rundung | unter 10 € kein Anspruch; ab 0,50 € aufrunden | § 21 Nr. 1 WoGG; Anlage 3 Nr. 3 WoGG | stimmt (Grenze 9,50 € ungerundet) |
| Wohngeld, mehr als 12 Personen | 65 € je weiteres Mitglied, höchstens Miete | § 19 Abs. 3 WoGG | stimmt |
| Wohngeld, Freibetrag Kinder (Stichprobe, #110) | Einnahmen aus Erwerbstätigkeit, höchstens 1.200 € im Jahr, Kind unter 25 | § 17 Nr. 4 WoGG | stimmt |
| Wohngeld, Grundrentenfreibetrag höchstens die Rente | 1.200 € + 30 % „vom Einkommen aus der gesetzlichen Rente“ | § 17a Abs. 1 WoGG | stimmt |
| Wohngeld, Unterhalt (`t.uz.wg`) | 3.000 € / 6.000 € im Jahr (250 / 500 € im Monat); mit Titel, Notarvertrag oder Bescheid der festgelegte Betrag | § 18 Satz 1 und 2 WoGG | stimmt |
| Wohngeld, Plausibilitätsprüfung | Einnahmen plus Wohngeld mind. 80 % des Bedarfs nach SGB XII | Nr. 15.01 Abs. 1 Satz 3 WoGVwV vom 28.06.2017, verwaltungsvorschriften-im-internet.de | stimmt; die App rechnet strenger (ganze Miete + 80 % Regelbedarf), Folge nur Hinweis „möglich“, keine Zusage |
| Arbeitslosengeld, obere Grenze | Sozialversicherungspauschale 20 %, Lohnsteuer nach Steuerklasse, Soli | § 153 Abs. 1 SGB III | stimmt (Beispiel 2.400 €, Steuerklasse III, Kind: 1.920 € × 67 % = 1.286,40 €) |
| Grundsicherungsgeld, Vermögen Paar | 5.000 / 10.000 / 12.500 / 20.000 € je Person nach Alter | § 12 Abs. 2 SGB II | stimmt |
| Grundsicherung im Alter, Grundrentenfreibetrag | 100 € + 30 %, höchstens 50 % der Regelbedarfsstufe 1, aus der Bruttorente | § 82a Abs. 1 SGB XII; Deutsche Rentenversicherung, Meldung „Zusätzlicher Freibetrag“ (Bruttorente) | stimmt |
| Grundsicherung im Alter, Merkzeichen G | 17 % der maßgebenden Regelbedarfsstufe je Person | § 30 Abs. 1 SGB XII | Betrag stimmt; Text korrigiert (siehe unten) |
| Hilfe zur Pflege / Blindenhilfe, Einkommensgrenze | 2 × 563 € + Unterkunft + 395 € je weitere Person (70 %, aufgerundet); Heizung zählt mit | § 85 Abs. 1 SGB XII; BSG 30.04.2020, B 8 SO 1/19 R (Leitsatz), bsg.bund.de | stimmt |
| BAföG (Stichprobe, #99/#104) | 2.540 / 1.690 / 770 €; 50 % + 5 % je Kind; 475 + 380 + 185 + 48 €; 15.000 / 45.000 / 2.300 €; 160 €; unter 10 € keine Zahlung | §§ 13, 13a, 14b, 25, 29, 30, 51 BAföG | stimmt |
| Landespflegegeld Bayern (`t.lpg.antrag`) | 500 € je Pflegegeldjahr; Auszahlung bis 31. Januar des Folgejahres; Antrag bis 3 Monate nach Jahresende | Art. 2 Abs. 4, Art. 3 Abs. 1 BayLPflGG (Text gilt ab 01.01.2026), gesetze-bayern.de | stimmt |
| Blindengeld Bayern, Anrechnung Pflegegeld | Pflegegrad 2: 46 % von 347 €; Pflegegrad 3 bis 5: 33 % von 599 € = 197,67 €; mindestens 20 € | Art. 4 Abs. 1 und 4 BayBlindG; § 37 Abs. 1 SGB XI | stimmt |
| Rundfunkbeitrag (`s.rundfunk.tip`) | ab Beginn des Nachweises, höchstens 3 Jahre vor dem Antragsmonat | § 4 Abs. 4 Satz 2 RBStV, gesetze-bayern.de (RBeitrStV-4) | stimmt |
| Strom- und Gassperre (`gs.d.strom.grenze`) | Rückstand in Höhe von 2 Abschlägen und mindestens 100 € | § 41f Abs. 3 EnWG | stimmt |
| P-Konto (`gs.d.konto.schritt`) | ab dem 4. Geschäftstag; nur ein P-Konto | § 850k Abs. 2 und 3 ZPO | stimmt |
| Sachsen-Anhalt (`ZUST_LAND`) | Landesamt für Soziales, Jugend und Gesundheit seit 01.04.2026; Antrag Eingliederungshilfe beim Sozialamt vor Ort | las.sachsen-anhalt.de (Startseite, Schwerbehindertenrecht) | stimmt; keine Anschrift in der App |
| Anschriften außerhalb Bayerns (47 Einträge, Stand 21.11.2026) | Straße, PLZ, Ort | jeweils die im Eintrag genannte Impressum- oder Kontaktseite der Behörde | alle 47 stimmen wörtlich mit der Quelle überein |

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| `t.gsa.mzGBeide`: „gibt es für jede Person einen Mehrbedarf“ war eine Zusage. Der Mehrbedarf gilt nur für Personen, die selbst die Altersgrenze erreicht haben oder voll erwerbsgemindert sind. Die App kennt das beim Partner nicht. | gering | In allen 13 Sprachen und in Einfacher Sprache auf „kann es … geben. Das Sozialamt prüft das.“ geändert. Betrag unverändert. | § 30 Abs. 1 SGB XII, gesetze-im-internet.de/sgb_12/__30.html, Abruf 21.11.2026 |
| `t.kiz.vermKnapp`: „danach gibt es ihn voll“ kann als „voller Höchstbetrag“ gelesen werden. Gemeint ist: ohne Kürzung wegen Vermögen. | gering | Nicht geändert (rechtlich richtig, geschätzter Betrag steht daneben). Vorschlag für später: „danach ohne diese Kürzung“. | § 6a Abs. 3 Satz 7 BKGG, Abruf 21.11.2026 |
| Kinderzuschlag, Sonderfall: Vermögen über der Grenze und Kinderzuschlag nur mit hohem Alleinerziehenden-Mehrbedarf möglich. Die App zeigt „Vermögen zu hoch“ statt „möglich“. | gering | Nicht geändert (sehr seltener Fall, vorsichtige Seite, keine Zusage). | § 6a Abs. 3 Satz 6 und 7 BKGG |
| Strengere Lesart der Plausibilitätsprüfung (ganze Miete + 80 % Regelbedarf) stützt sich auf BMI-Hinweise vom 11.03.2020, die nur als nicht-amtliche Kopie abrufbar sind. | gering | Nicht geändert. Die amtliche Grundlage (WoGVwV Nr. 15.01) ist im Code genannt und bestätigt. Die strengere Rechnung führt nur zu einem Hinweis. | verwaltungsvorschriften-im-internet.de/bsvwvbund_28062017_SWII4.htm, Abruf 21.11.2026 |
| Beispiel zu § 19 Abs. 3 WoGG (BMWSB-Hinweise 02.12.2024, 1.205 + 130 €) und Abgleichswerte München/Hannover sind nicht amtlich im Netz abrufbar. | gering | Nicht nötig: Die Regel selbst steht wörtlich im Gesetz und ist bestätigt. | § 19 Abs. 3 WoGG, Abruf 21.11.2026 |
| Anschrift Neckar-Odenwald-Kreis: Seite verbietet automatische Abrufe (robots.txt). Der direkte Abruf zeigte „Neckarelzer Straße 7, 74821 Mosbach“. | gering | Keine Änderung. Bitte einmal von Hand im Browser gegenlesen. | neckar-odenwald-kreis.de/Impressum.html, Abruf 21.11.2026 |

## Offen (kein Fehler in 1.9)

- Wohngeld ab 1.1.2027: Der Gesetzentwurf „Vereinfachung und Fortentwicklung des Wohngeldgesetzes“ (BT-Drs. 21/8284, 1. Lesung 08.10.2026, Anhörung 04.11.2026) ist am 21.11.2026 noch nicht beschlossen. Geplant: halbe Heizkostenkomponente, geänderte Formel, keine Fortschreibung 2027. Bis zur Verkündung gilt das Recht in der App. Vor dem Jahreswechsel-Update erneut prüfen (bundestag.de, Textarchiv 2026 kw41; bmwsb.bund.de, Abruf 21.11.2026).
- SV-Rechengrößen 2027: weiter nur nach Verkündung freischalten (`svrg2027`). Am 21.11.2026 nicht neu geprüft, weil nicht Teil des Diffs.
- Nur gelesen, nicht gegengerechnet: Lohnsteuer-Tabellen für die obere Grenze bei Arbeitslosengeld und Krankengeld (Steuerklasse III).
