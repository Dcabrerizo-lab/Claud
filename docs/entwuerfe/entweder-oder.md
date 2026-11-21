# Entweder-oder: Welche Leistungen schließen sich aus, was geht vor, was passt zusammen

Stand: 21.11.2026. Fachliche Vorarbeit (Recht) für die Ergebnisliste und die Antragsmappe. Kein Code geändert.
Alle Fundstellen am 21.11.2026 abgerufen. Verglichen mit `origin/main:src/rules.js`, `src/app.js`, `src/lang/de.json`.

## 1. Kurzfassung

| Was | Ergebnis |
|---|---|
| Grundsicherungsgeld und Wohngeld | Nie gleichzeitig (§ 7 Abs. 1 Satz 1 Nr. 1 WoGG). |
| Grundsicherungsgeld und Kinderzuschlag | Kinderzuschlag nur, wenn die Familie damit (auch zusammen mit Wohngeld) **kein** Grundsicherungsgeld mehr braucht (§ 6a Abs. 1 Nr. 3 BKGG). |
| Wer geht vor? | Reichen Wohngeld und Kinderzuschlag für den ganzen Haushalt für mindestens 3 Monate, **gehen sie vor**. Dann gibt es keine freie Wahl (§ 12a SGB II; FW § 12a Rz. 12a.11 bis 12a.13). |
| Wann gibt es eine echte Wahl? | Nur wenn Wohngeld (und Kinderzuschlag) den Bedarf **nicht** ganz decken. Dann darf man auf Grundsicherungsgeld verzichten und das (niedrigere) Wohngeld nehmen (§ 8 Abs. 2 WoGG), oder beim Kinderzuschlag den „erweiterten Zugang“ nutzen (höchstens 100 € Lücke, § 6a Abs. 1a BKGG). |
| Wohngeld und Kinderzuschlag | Kombinierbar. Die Familienkasse rechnet Wohngeld sogar mit ein, auch wenn es noch nicht beantragt ist. |
| Wichtigster Fehleindruck heute | Familien sehen Wohngeld, Kinderzuschlag **und** Grundsicherungsgeld mit je einem Betrag, teils alle drei als „Wahrscheinlich“. Die App rechnet aber schon alles Nötige, um zu sagen, welcher Weg voraussichtlich gilt. |
| Riskanter Tipp heute | „Stelle beide Anträge gleichzeitig“ (`ww.tipp`). Ein Antrag auf Grundsicherungsgeld sperrt den erweiterten Zugang zum Kinderzuschlag (§ 6a Abs. 1a Nr. 3 BKGG) und schließt für die Dauer des Verfahrens vom Wohngeld aus (§ 8 Abs. 1 WoGG, mit Ausnahme § 7 Abs. 1 Satz 3 Nr. 2). |

Zwei Annahmen aus dem Auftrag stimmen so nicht (siehe Prüfvermerk):
- „Kindergeld ist überall Einkommen“: **nein**. Beim Wohngeld zählt Kindergeld nicht zum Einkommen.
- „Wahlrecht § 6a Abs. 1a BKGG“: Das Gesetz nennt es nicht Wahlrecht. Es ist der **erweiterte Zugang**. Er wirkt wie eine Wahl, aber nur, solange niemand im Haushalt Leistungen nach SGB II oder SGB XII bekommt oder beantragt hat.

## 2. Quellen (alle Abruf 21.11.2026)

| Kürzel | Quelle | Stand / Hinweis |
|---|---|---|
| WoGG | https://www.gesetze-im-internet.de/wogg/__7.html, `__8.html`, `__14.html`, `__20.html`, `__25.html`, `__28.html` | Text nennt schon „Grundsicherungsgeld“ |
| SGB II | https://www.gesetze-im-internet.de/sgb_2/__5.html, `__7.html`, `__11.html`, `__11a.html`, `__12a.html`, `__19.html`, `__27.html`, `__28.html`, `__37.html`, `__40.html` | § 12a Satz 3 gilt nur bis 31.12.2026 |
| BKGG | https://www.gesetze-im-internet.de/bkgg_1996/__6a.html, `__6b.html`, `__1.html` | |
| SGB XII | https://www.gesetze-im-internet.de/sgb_12/__2.html, `__21.html`, `__22.html`, `__23.html`, `__34.html`, `__43.html`, `__63b.html`, `__82.html` | |
| SGB XI | https://www.gesetze-im-internet.de/sgb_11/__13.html | |
| SGB X | https://www.gesetze-im-internet.de/sgb_10/__28.html | |
| SGB VIII | https://www.gesetze-im-internet.de/sgb_8/__90.html | |
| BEEG | https://www.gesetze-im-internet.de/beeg/__10.html | |
| UVG | https://www.gesetze-im-internet.de/uhvorschg/__1.html, `__2.html` | |
| AsylbLG | https://www.gesetze-im-internet.de/asylblg/__1.html, `__2.html`, `__3.html`, `__9.html` | |
| EStG | https://www.gesetze-im-internet.de/estg/__62.html | |
| RBStV | https://www.gesetze-bayern.de/Content/Document/RBeitrStV-4 | Wortlaut nennt noch „Arbeitslosengeld II“ (Staatsvertrag, Fassung ab 07.11.2020) |
| FW § 12a | Fachliche Weisungen der BA zu § 12a SGB II, https://www.arbeitsagentur.de/datei/dok_ba029240.pdf | Stand 01.07.2026 (redaktionell an Grundsicherungsgeld angepasst, BGBl. 2026 I Nr. 107) |
| DA-KiZ | Durchführungsanweisung Kinderzuschlag, https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf | Stand 20.02.2026 |
| WoGVwV | Wohngeld-Verwaltungsvorschrift, https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_28062017_SWII4.htm | vom 28.06.2017 (BAnz AT 10.07.2017 B5). **Nur der Anfang gelesen** (Nr. 7.11, 7.16, 8.21); der direkte Abruf ist zweimal abgebrochen. Nr. 14 und 15.01 nicht selbst gelesen. |

## 3. Regeltabelle

Spalte „Verhältnis“ nutzt nur vier Werte: **schließt aus** / **vorrangig** (muss zuerst beantragt werden) / **kombinierbar** / **Wahl** (hängt von der Höhe ab).
Die Sätze in der letzten Spalte sind Vorschläge in einfacher Sprache. Sie sagen nie zu, dass es Geld gibt.

### 3.1 Die Kerngruppe: Grundsicherungsgeld, Wohngeld, Kinderzuschlag

| Nr. | Kombination | Verhältnis | Fundstelle | Satz für die App |
|---|---|---|---|---|
| 1 | Grundsicherungsgeld + Wohngeld gleichzeitig | **schließt aus** | § 7 Abs. 1 Satz 1 Nr. 1 WoGG (wenn Kosten der Unterkunft berücksichtigt sind); Haushaltsmitglieder der Bedarfsgemeinschaft: § 7 Abs. 2 WoGG; laufendes Wohngeld endet mit der Bewilligung: § 28 Abs. 3 WoGG | „Grundsicherungsgeld und Wohngeld gibt es nicht gleichzeitig. Im Grundsicherungsgeld ist die Miete schon enthalten.“ |
| 2 | Wohngeld (mit Kinderzuschlag) deckt den ganzen Bedarf, mindestens 3 Monate | **vorrangig** vor Grundsicherungsgeld, keine Wahl | § 12a Satz 1 und Satz 2 Nr. 2 SGB II; § 5 Abs. 3 SGB II (Jobcenter darf den Antrag selbst stellen); FW § 12a Rz. 12a.11, 12a.12, 12a.13 Beispiel 1 | „Reichen Wohngeld und Kinderzuschlag zusammen mit deinem Einkommen, gehen sie vor. Das Jobcenter schickt dich dann zur Wohngeldstelle und zur Familienkasse. Die Stellen prüfen, was vorgeht.“ |
| 3 | Wohngeld (mit Kinderzuschlag) deckt den Bedarf **nicht** | **Wahl**: Grundsicherungsgeld, oder Verzicht darauf und Wohngeld | § 12a Satz 2 Nr. 2 SGB II (keine Pflicht); § 8 Abs. 2 WoGG (Verzicht); FW § 12a Rz. 12a.9, 12a.13 Beispiel 2; WoGVwV Nr. 7.16 Abs. 1 | „Wohngeld allein reicht für euch voraussichtlich nicht. Dann ist Grundsicherungsgeld der übliche Weg. Du darfst stattdessen Wohngeld nehmen, bekommst dann aber meist weniger Geld.“ |
| 4 | Grundsicherungsgeld + Kinderzuschlag gleichzeitig | **schließt aus** (praktisch) | § 6a Abs. 1 Nr. 3 BKGG: Kinderzuschlag nur, wenn damit keine Hilfebedürftigkeit nach § 9 SGB II besteht; Kinderzuschlag ist im SGB II Einkommen des Kindes (§ 11 Abs. 1 Satz 4 SGB II). Ausnahme: ergänzendes Grundsicherungsgeld, wenn sich **im laufenden** Bewilligungszeitraum etwas ändert (DA-KiZ C.4.3) | „Kinderzuschlag gibt es nur, wenn ihr damit kein Grundsicherungsgeld mehr braucht.“ |
| 5 | Kinderzuschlag (mit Wohngeld) deckt den ganzen Bedarf, mindestens 3 Monate | **vorrangig** vor Grundsicherungsgeld | § 12a SGB II; FW § 12a Rz. 12a.20 (Jobcenter zahlt zunächst weiter und holt sich das Geld von der Familienkasse zurück) | wie Nr. 2 |
| 6 | Es fehlen mit Einkommen, Kinderzuschlag und Wohngeld höchstens 100 € | **Wahl** (erweiterter Zugang): Kinderzuschlag statt Grundsicherungsgeld | § 6a Abs. 1a BKGG. Bedingungen: Freibeträge aus Arbeit mindestens 100 €; **niemand** in der Bedarfsgemeinschaft bekommt oder **hat beantragt** Leistungen nach SGB II oder SGB XII. DA-KiZ C.4.2 Abs. 1 bis 5 (kein Verzicht nötig) | „Euch fehlt nur wenig. Dann könnt ihr wählen: Kinderzuschlag und Wohngeld, oder Grundsicherungsgeld. Achtung: Wer schon Grundsicherungsgeld beantragt hat, kann diesen Weg nicht mehr nutzen. Frag vorher die Familienkasse.“ |
| 7 | Wohngeld + Kinderzuschlag | **kombinierbar** | § 6a Abs. 1 Nr. 3 Satz 2 und 3 BKGG (bewilligtes oder voraussichtliches Wohngeld wird mitgerechnet); DA-KiZ C.4.1 Abs. 7 (fiktives Wohngeld, tatsächlicher Bezug nicht nötig); Wohngeld und Kinderzuschlag mindern den Kinderzuschlag nicht (§ 6a Abs. 3 Satz 2, Abs. 5 BKGG) | „Wohngeld und Kinderzuschlag passen zusammen. Beantrage beides.“ |
| 8 | Nur ein Kind soll Wohngeld bekommen („Kinderwohngeld“) | **Wahl**, keine Pflicht | FW § 12a Rz. 12a.10: Jobcenter darf nicht dazu auffordern; freiwillig möglich | Nicht in der App zeigen (Sonderfall für die Beratung). |
| 9 | Vorgezogene Altersrente statt Grundsicherungsgeld | bis 31.12.2026 **keine Pflicht** | § 12a Satz 2 Nr. 1 und Satz 3 SGB II | Nicht ändern. **Für die Prüfung am 20.12.2026 vormerken:** Satz 3 läuft am 31.12.2026 aus; ab 1.1.2027 gilt nur noch Satz 2 Nr. 1 (bis 63). Erst ab 1.1.2027 in der App zeigen. |

Nebenfolgen, die für die Wahl zählen (FW § 12a Rz. 12a.10, 12a.25): Mit Wohngeld und Kinderzuschlag fällt die Krankenversicherung über das Jobcenter weg. Wer nicht anders versichert ist (zum Beispiel unverheiratete Partner ohne eigene Arbeit), braucht eine eigene Versicherung.

### 3.2 Was man zuerst oder später beantragen kann (Fristen ohne Verlust)

| Nr. | Lage | Regel | Fundstelle | Satz für die App |
|---|---|---|---|---|
| 10 | Wohngeld oder Kinderzuschlag wird abgelehnt, danach Antrag auf Grundsicherungsgeld | Der spätere Antrag wirkt zurück (bis zu einem Jahr), wenn er **unverzüglich** nach dem Monat gestellt wird, in dem die Ablehnung bindend wurde | § 28 SGB X mit § 40 Abs. 7 SGB II | „Wird Wohngeld oder Kinderzuschlag abgelehnt: Stelle sofort den Antrag auf Grundsicherungsgeld. Dann kann es Geld auch für die Zeit davor geben.“ |
| 11 | Grundsicherungsgeld wird abgelehnt, danach Wohngeld | Wohngeld ab dem Monat der Ablehnung, wenn der Antrag bis Ende des Folgemonats nach Kenntnis gestellt wird | § 25 Abs. 3 WoGG | „Wird Grundsicherungsgeld abgelehnt: Stelle bis Ende des nächsten Monats den Wohngeldantrag.“ |
| 12 | Es fehlt jetzt Geld zum Leben | Grundsicherungsgeld wirkt auf den Monatsersten zurück; das Jobcenter zahlt zunächst und klärt den Vorrang mit den anderen Stellen | § 37 Abs. 2 SGB II; FW § 12a Rz. 12a.12, 12a.20 | „Fehlt dir jetzt Geld für Essen oder Miete: Geh zum Jobcenter. Es zahlt zuerst und klärt mit den anderen Stellen, was vorgeht.“ |

### 3.3 Grundsicherung im Alter und bei Erwerbsminderung (Sozialamt)

| Nr. | Kombination | Verhältnis | Fundstelle | Satz für die App |
|---|---|---|---|---|
| 13 | Grundsicherung im Alter/EM oder Hilfe zum Lebensunterhalt + Wohngeld | **schließt aus** | § 7 Abs. 1 Satz 1 Nr. 5 und 6 WoGG | „Grundsicherung vom Sozialamt und Wohngeld gibt es nicht gleichzeitig.“ |
| 14 | Wohngeld reicht zusammen mit der Rente | **Wahl** (kein Vorrang, der den Anspruch nimmt). Der Nachrang der Sozialhilfe ist keine Ausschlussnorm; Wohngeld, das man bekommen könnte, aber nicht bekommt, ist kein Einkommen. Im SGB XII gibt es keine Pflicht wie § 12a SGB II. Das Sozialamt darf die Grundsicherung deshalb nicht ablehnen; es kann Wohngeld selbst betreiben (§ 95 SGB XII) | § 2 Abs. 1 SGB XII; BSG, Urteil vom 23.03.2021, B 8 SO 2/20 R (https://www.bsg.bund.de/SharedDocs/Entscheidungen/DE/2021/2021_03_23_B_08_SO_02_20_R.html, Abruf 21.11.2026); § 7 Abs. 1 Satz 1 Nr. 5 WoGG | „Grundsicherung im Alter und Wohngeld gibt es nicht gleichzeitig. Lass beides prüfen und frage, welcher Weg dir mehr bringt.“ (Karte Grundsicherung im Alter bleibt mit Stufe und Betrag) |
| 15 | Wohngeld bringt deutlich weniger als die Grundsicherung | **Wahl**: Grundsicherung, oder Verzicht und Wohngeld | § 8 Abs. 2 WoGG; WoGVwV Nr. 8.21 | „Reicht es mit Wohngeld nicht, ist Grundsicherung der übliche Weg. Lass beides ausrechnen.“ (Wohngeld nur „möglich“) |
| 16 | Grundsicherung im Alter/EM + Grundsicherungsgeld (dieselbe Person) | **schließt aus**; Zuständigkeit nach Alter und Erwerbsfähigkeit | § 7 Abs. 1 Satz 1 Nr. 1, Abs. 4 SGB II; § 5 Abs. 2 SGB II; § 21 SGB XII | „Kannst du arbeiten und bist noch nicht im Rentenalter, ist das Jobcenter zuständig. Sonst das Sozialamt.“ |
| 17 | Paar: eine Person im Rentenalter oder dauerhaft voll erwerbsgemindert, die andere erwerbsfähig | **kombinierbar im Haushalt** (je Person eine Stelle); Grundsicherung im Alter/EM geht für die eine Person vor | § 5 Abs. 2 Satz 2, § 19 Abs. 1 Satz 2 SGB II | „In einem Haushalt können zwei Stellen zuständig sein: das Sozialamt für die eine Person, das Jobcenter für die andere.“ |
| 18 | Grundsicherung vom Sozialamt + Kinderzuschlag | Kinderzuschlag wird nach SGB II geprüft; erweiterter Zugang gesperrt, wenn jemand SGB XII bekommt oder beantragt hat | § 6a Abs. 1 Nr. 3, Abs. 1a Nr. 3 BKGG | „Die Familienkasse prüft, ob Kinderzuschlag neben der Grundsicherung möglich ist.“ (nur Beratungsmodus; nicht pauschal „schließt aus“) |

### 3.4 Leistungen, die als Einkommen zählen (kombinierbar, aber sie mindern andere)

| Nr. | Leistung | Grundsicherungsgeld / Sozialamt | Kinderzuschlag | Wohngeld | Fundstelle | Satz für die App |
|---|---|---|---|---|---|---|
| 19 | Kindergeld | Einkommen des Kindes | mindert den Kinderzuschlag nicht, ist aber Voraussetzung; zählt bei der Prüfung, ob es reicht | **kein Einkommen** | § 11 Abs. 1 Satz 5 SGB II; § 82 Abs. 1 SGB XII; § 6a Abs. 1 Nr. 1, Abs. 3 Satz 2 BKGG; § 14 WoGG (nicht im Katalog) | „Kindergeld gibt es zusätzlich. Beim Grundsicherungsgeld wird es angerechnet, beim Wohngeld nicht.“ |
| 20 | Unterhaltsvorschuss | Einkommen des Kindes, **vorrangig** zu beantragen | mindert den Kinderzuschlag um 45 %; muss beantragt sein | Einkommen | § 12a SGB II, FW § 12a Rz. 12a.8; § 6a Abs. 3 Satz 3 und 4 BKGG, DA-KiZ C.2.2.1 Abs. 8; § 14 Abs. 2 Nr. 21 WoGG | „Unterhaltsvorschuss musst du zuerst beantragen. Er wird bei den anderen Leistungen angerechnet. Die Beträge kann man nicht einfach zusammenzählen.“ |
| 21 | Unterhaltsvorschuss ab 12 Jahren | nur, wenn das Kind kein SGB II bezieht oder der Elternteil mindestens 600 € brutto verdient | | | § 1 Abs. 1a UVG | schon in der App (`uvg.ab12`) |
| 22 | Unterhaltsvorschuss und Kindergeld | Unterhaltsvorschuss ist um das Kindergeld für ein erstes Kind gekürzt | | | § 2 Abs. 2 UVG | Beträge der App sind schon die gekürzten: prüfen, nicht doppelt abziehen. |
| 23 | Elterngeld | voll Einkommen; **bis 300 € frei nur**, wenn vor der Geburt gearbeitet wurde (Elterngeld Plus: die Hälfte) | wie SGB II | bis 300 € frei | § 10 Abs. 1, 3, 5 BEEG; § 14 Abs. 2 Nr. 6 WoGG | „Elterngeld wird beim Grundsicherungsgeld und beim Kinderzuschlag angerechnet. Hast du vor der Geburt gearbeitet, bleiben bis zu 300 € frei.“ |
| 24 | Mutterschaftsgeld | kein Einkommen | kein Einkommen | (nicht geprüft) | § 11a Abs. 1 Nr. 6 SGB II; § 10 Abs. 5 Satz 4 BEEG; DA-KiZ C.3.2.1.1 Abs. 8 | „Mutterschaftsgeld wird beim Grundsicherungsgeld nicht angerechnet.“ |
| 25 | Leistungen der Pflegeversicherung (Pflegegeld, Entlastungsbetrag) | **kein Einkommen** bei allen einkommensabhängigen Sozialleistungen und beim AsylbLG; Ausnahme Pflegeunterstützungsgeld | | | § 13 Abs. 5 SGB XI | „Pflegegeld bekommst du zusätzlich. Es wird bei anderen Leistungen nicht angerechnet.“ |
| 26 | Arbeitslosengeld I, Krankengeld, Rente | **vorrangig**; Grundsicherungsgeld, Wohngeld oder Kinderzuschlag aufstockend **kombinierbar** | | | § 12a Satz 1 SGB II; FW § 12a Rz. 12a.4, 12a.39, 12a.40 | „Arbeitslosengeld, Krankengeld und Rente gehen vor. Reicht das Geld nicht, kann es dazu Wohngeld oder Grundsicherungsgeld geben.“ |

### 3.5 Bildung und Teilhabe, Kita, Rundfunk (Folgen eines Bezugs)

| Nr. | Kombination | Verhältnis | Fundstelle | Satz für die App |
|---|---|---|---|---|
| 27 | Bildung und Teilhabe + Wohngeld oder Kinderzuschlag | **kombinierbar** (Folge des Bezugs; Kindergeld nötig) | § 6b Abs. 1 BKGG | „Das Bildungspaket gibt es auf beiden Wegen.“ |
| 28 | Bildung und Teilhabe + Grundsicherungsgeld / Sozialamt / AsylbLG | **kombinierbar** (Teil der Leistung) | § 19 Abs. 2, § 28 SGB II; § 34 SGB XII; § 3 Abs. 4 AsylbLG | wie Nr. 27 |
| 29 | Bildung und Teilhabe nach § 6b BKGG und nach SGB II für dasselbe | § 6b BKGG **vorrangig**, nie doppelt | § 19 Abs. 2 Satz 2 SGB II; FW § 12a Rz. 12a.21 | Nicht zeigen (Sache der Ämter). |
| 30 | Nur das Bildungspaket fehlt (Einkommen sonst knapp ausreichend) | eigener Anspruch möglich | § 7 Abs. 2 Satz 3 SGB II | Nur Beratungsmodus. |
| 31 | Kita ohne Kostenbeitrag | Folge von Grundsicherungsgeld, Sozialamt, AsylbLG (§§ 2, 3), Kinderzuschlag **oder** Wohngeld | § 90 Abs. 4 SGB VIII | „Auf beiden Wegen kostet die Kita keinen Elternbeitrag. Dafür ist ein Antrag beim Jugendamt nötig.“ |
| 32 | Befreiung vom Rundfunkbeitrag | Folge von Grundsicherungsgeld, Sozialamt, AsylbLG, BAföG/BAB (nicht bei den Eltern), Hilfe zur Pflege. **Nicht** bei Wohngeld oder Kinderzuschlag; dort nur Härtefall | § 4 Abs. 1 Nr. 1 bis 5, 7, Abs. 6 RBStV | „Mit Grundsicherungsgeld kannst du dich vom Rundfunkbeitrag befreien lassen. Mit Wohngeld und Kinderzuschlag in der Regel nicht.“ |

### 3.6 Ausbildung, Asyl, Pflege

| Nr. | Kombination | Verhältnis | Fundstelle | Satz für die App |
|---|---|---|---|---|
| 33 | BAföG-fähige Ausbildung + Grundsicherungsgeld | **schließt aus** (auch wenn kein BAföG gezahlt wird); übrig bleiben Mehrbedarfe und Härtefall-Darlehen. Ausnahmen § 7 Abs. 6 (vor allem Schüler und Auszubildende, die bei den Eltern wohnen oder BAföG bekommen bzw. nur wegen Einkommen nicht bekommen) | § 7 Abs. 5 und 6, § 27 SGB II | schon in der App (`ggeld.ausbildung`) |
| 34 | Betriebliche Ausbildung mit Berufsausbildungsbeihilfe + Grundsicherungsgeld | **kombinierbar** (aufstockend); ausgeschlossen nur bei Wohnheim/Internat mit voller Verpflegung | § 7 Abs. 5 Satz 2 SGB II; BAB ist Einkommen (§ 11a Abs. 3 Satz 2 Nr. 4) | „In einer Ausbildung im Betrieb kann es Grundsicherungsgeld dazu geben. Berufsausbildungsbeihilfe geht vor.“ |
| 35 | BAföG/BAB + Grundsicherung vom Sozialamt | **schließt aus** (Härtefall möglich) | § 22 SGB XII | Nur Beratungsmodus. |
| 36 | BAföG/BAB + Wohngeld | **schließt aus**, wenn **allen** Haushaltsmitgliedern BAföG/BAB dem Grunde nach zusteht; sonst kombinierbar (BAföG-Zuschuss zählt zur Hälfte als Einkommen) | § 20 Abs. 2 WoGG; § 14 Abs. 2 Nr. 27 WoGG | schon in der App (`wohngeld.ausbildung`) |
| 37 | Asylbewerberleistungen + Grundsicherungsgeld | **schließt aus** | § 7 Abs. 1 Satz 2 Nr. 3 SGB II | schon in der App (`ggeld.asyl`) |
| 38 | Asylbewerberleistungen + Sozialhilfe | **schließt aus**; nach 36 Monaten SGB XII entsprechend | § 9 Abs. 1 AsylbLG; § 23 Abs. 2 SGB XII; § 2 Abs. 1 AsylbLG | schon in der App |
| 39 | Asylbewerberleistungen + Wohngeld | **schließt aus**, wenn bei der Leistung Wohnkosten berücksichtigt sind | § 7 Abs. 1 Satz 1 Nr. 8 WoGG | schon in der App (`wohngeld.asylBezug`) |
| 40 | Asylverfahren/Duldung + Kindergeld, Kinderzuschlag | meist kein Kindergeld, darum kein Kinderzuschlag | § 62 Abs. 2 EStG; § 1 Abs. 3 BKGG; § 6a Abs. 1 Nr. 1 BKGG | schon in der App (`kiz.asyl`) |
| 41 | Pflegeversicherung + alles andere | **kombinierbar**, keine Anrechnung | § 13 Abs. 5 SGB XI | siehe Nr. 25 |
| 42 | Hilfe zur Pflege (Sozialamt) | **nachrangig**: erst Pflegekasse, eigenes Einkommen und Vermögen | § 13 Abs. 3 SGB XI; § 2, § 63b Abs. 1 SGB XII | „Zuerst zahlt die Pflegekasse. Reicht das nicht, kann das Sozialamt den Rest übernehmen.“ |
| 43 | Hilfe zur Pflege + Wohngeld | **kombinierbar** (Hilfe zur Pflege steht nicht in § 7 Abs. 1 WoGG); im Heim mit Hilfe zum Lebensunterhalt gilt Nr. 13 | § 7 Abs. 1 WoGG | Nur Beratungsmodus. |

## 4. Wie die App den Weg bestimmen kann (Vorschlag, passt zum heutigen Code)

Die App rechnet schon alle Größen. `kizRechnung0` vergleicht bereits `mitKiz + wgVorsichtig(h) + erweitert` mit `gesamtBedarf`. Dieselbe Rechnung entscheidet den Weg:

- **Lücke** = geschätztes Grundsicherungsgeld (`luecke` in `ggeldRechnung0`).
- **Weg A bringt** = vorsichtiges Wohngeld (`wgVorsichtig`) + geschätzter Kinderzuschlag (`est`).

| Lage | Bedingung (grob) | Verhältnis | Anzeige |
|---|---|---|---|
| A geht vor | Weg A ≥ Lücke | vorrangig, keine Wahl | Wohngeld und Kinderzuschlag oben. Grundsicherungsgeld höchstens „Möglich“, **ohne Betrag**, mit Satz Nr. 2. |
| Kleine Lücke | Lücke − Weg A ≤ 100 € und Freibetrag aus Arbeit ≥ 100 € und Kinder | Wahl (erweiterter Zugang) | Beide Wege zeigen, Beträge je Weg als **Summe**, Warnsatz Nr. 6. |
| B ist üblich | Weg A < Lücke (ohne kleine Lücke) | Wahl nur durch Verzicht | Grundsicherungsgeld oben. Wohngeld höchstens „Möglich“, Satz Nr. 3. Kinderzuschlag „Unwahrscheinlich“ wie heute (`kiz.zuNiedrig`). |
| Unklar | Schätzung nahe an der Grenze, Mietenstufe unbekannt, Angaben fehlen | offen | Beide Wege „Möglich“, Satz: „Die Stelle prüft, was vorgeht.“ |

Wichtig:
- Die Beträge sind Schätzungen. Nahe an einer Grenze (Vorschlag: weniger als 50 € Abstand) immer „Unklar“. Die Breite dieses Puffers ist eine Produkt-Entscheidung.
- Die 3-Monats-Prognose (§ 12a Satz 2 Nr. 2 SGB II) kann die App nicht rechnen. Darum nie „du musst“, sondern „geht voraussichtlich vor“.
- Erwarteter, noch nicht bezogener Unterhaltsvorschuss sollte die Lücke und den Kinderzuschlag mindern (heute nicht der Fall, siehe Befund 5).

## 5. Was die App heute macht und wo falsche Eindrücke entstehen

Probeläufe mit `Rules.evaluate` auf `origin/main` (Mietenstufe III, kein Vermögen, Stand 2026):

| Haushalt | Wohngeld | Kinderzuschlag | Grundsicherungsgeld | Rechtlich |
|---|---|---|---|---|
| Paar, 2 Kinder, 2.800 € brutto, Miete 800 € | Wahrscheinlich, 290 bis 450 € | Wahrscheinlich, 510 € | **Wahrscheinlich, 300 €** | Weg A (mind. 800 €) deckt die Lücke (300 €): A geht vor, Grundsicherungsgeld entfällt. |
| Paar, 2 Kinder, 2.200 € brutto, Miete 800 € | Wahrscheinlich, 450 bis 570 € | Möglich, 590 € | **Wahrscheinlich, 700 €** | Weg A (mind. 1.040 €) deckt die Lücke: A geht vor. Die Plaketten zeigen das Gegenteil. |
| Paar, 2 Kinder, 1.500 € brutto, Miete 800 € | Wahrscheinlich, 620 bis 660 € | Möglich, 590 € | Wahrscheinlich, 1.250 € | Lücke rund 40 €: erweiterter Zugang, echte Wahl. Der Tipp „beide gleichzeitig“ würde sie zerstören. |
| Alleinerziehend, 1 Kind, 1.400 € brutto, Unterhalt fehlt | Wahrscheinlich, 240 bis 340 € | Möglich, 160 € | Wahrscheinlich, 310 € | Dazu Unterhaltsvorschuss „Wahrscheinlich“, der in keiner der drei Rechnungen steckt. |
| Allein, 1.300 € brutto, Miete 500 € | **Wahrscheinlich, 170 bis 270 €** | – | Wahrscheinlich, 360 € | Wohngeld deckt die Lücke nicht: Wohngeld nur durch Verzicht, mit weniger Geld. |
| Rentner allein, 900 € Rente, Miete 450 € | Wahrscheinlich, 250 bis 280 € | – | Grundsicherung im Alter: Wahrscheinlich, 210 € | Echte Wahl: Wohngeld nimmt den Anspruch auf Grundsicherung im Alter nicht (BSG 23.03.2021, B 8 SO 2/20 R). „Frage, was mehr bringt“ ist hier richtig. |

| Nr. | Befund | Stelle im Code | Schwere |
|---|---|---|---|
| 1 | Drei Karten mit je einem Betrag, teils alle „Wahrscheinlich“. Laien zählen die Beträge zusammen. Die Kachel „Zwei Wege“ ist zugeklappt und steht getrennt von den Karten. | `evaluateKern`, `wohngeld0`, `kizRechnung0`, `ggeldRechnung0`; `zweiWege` in `app.js` | hoch |
| 2 | `ggeldRechnung0` kennt Wohngeld und Kinderzuschlag nicht. Grundsicherungsgeld bleibt „Wahrscheinlich“ mit Betrag, auch wenn Weg A rechnerisch vorgeht. | `ggeldRechnung0`, `bedarfJa` | hoch |
| 3 | Tipp „Stelle beide Anträge gleichzeitig. Dann geht kein Monat verloren“ (`ww.tipp`). Ein SGB-II-Antrag sperrt den erweiterten Zugang (§ 6a Abs. 1a Nr. 3 BKGG) und schließt während des Verfahrens vom Wohngeld aus (§ 8 Abs. 1 WoGG; Ausnahme § 7 Abs. 1 Satz 3 Nr. 2). Der Schutz vor Monatsverlust besteht auch ohne Doppelantrag (Regeln Nr. 10 bis 12). | `de.json` `ww.tipp`; ähnlich `kiz.zuNiedrig` („Ein Antrag ist trotzdem möglich“) | hoch |
| 4 | „Frage, welcher Weg dir mehr bringt“ (`z.ggVsWg`, `z.gsaWg`, `eo.tipp`) klingt nach freier Wahl. Deckt Wohngeld (mit Kinderzuschlag) den Bedarf, gibt es beim Grundsicherungsgeld keine Wahl. Bei Rente (`z.gsaWg`, `eo.tipp`) ist der Satz richtig (Nr. 14). | `zusammenspiel`, `de.json` | mittel |
| 5 | Unterhaltsvorschuss „Wahrscheinlich“ wird nicht in Grundsicherungsgeld, Kinderzuschlag und Wohngeld eingerechnet (nur schon gezahlter Unterhalt, `h.kindZahl`). Kein Satz zum Vorrang oder zur Anrechnung. | `unterhaltAnrechenbar`, `kizRechnung0`, `uvgKarte` | mittel |
| 6 | Wohngeld „Wahrscheinlich“ mit Betrag, obwohl Grundsicherungsgeld höher ist (Wohngeld nur durch Verzicht). Die Plausibilitätsprüfung fängt nur sehr niedrige Einkommen ab. | `wohngeld0` | mittel |
| 7 | Wer schon Grundsicherungsgeld bezieht, sieht Wohngeld und Kinderzuschlag als „Nein, Ausschluss“. Die App prüft nicht, ob Weg A inzwischen reichen würde (dann wäre der Wechsel sogar Pflicht). `kiz.ausschluss` behauptet pauschal „schließen sich aus“, auch bei Bezug vom Sozialamt. | `wohngeld0` Zeile 1024, `kinderzuschlag` Zeile 1094, `z.ggBezug` | mittel |
| 8 | Bildung und Teilhabe zeigt „Wahrscheinlich“, sobald **eine** der drei Karten „Wahrscheinlich“ ist. Das ist richtig (auf beiden Wegen), wird aber nicht gesagt; die zuständige Stelle hängt vom Weg ab. | `bildungTeilhabe` (`but.folgt`) | gering |
| 9 | Rundfunkbefreiung „Möglich“ (`rundfunk.folgt`) gilt nur auf Weg B. Auf Weg A gibt es sie nicht. Kein Hinweis. | `rundfunk0` | gering |
| 10 | Antragsmappe: Bei zwei Wegen ist nichts angehakt, darunter ein kleiner Satz (`f.pickWege`: „Beantragen kannst du trotzdem beides“). Keine geführte Wahl; „beides“ hat die Risiken aus Befund 3. | `wegeIds`, `renderPick` | mittel |
| 11 | Namen: App sagt „Weg 1: Grundsicherungsgeld“, „Weg 2: Wohngeld und Kinderzuschlag“. Der Auftrag nennt es umgekehrt (A = Wohngeld + Kinderzuschlag). Vor der Umsetzung eine Benennung festlegen. | `ww.a.h`, `ww.b.h` | gering |
| 12 | Kindergeld-Reihenfolge (`z.kgZuerst`) ist richtig (§ 6a Abs. 1 Nr. 1 BKGG; DA-KiZ B.1.1: es zählt der **Bezug**). | – | kein Fehler |

Richtig ist heute schon: Kein Gesamtbetrag im Kopf (`kopfErgebnis`), `z.wgKiz`, `kiz.mitWg`, die Ausschlüsse bei Ausbildung und Asyl, `ww.regel` im Kern.

## 6. Vorschlag für die Anzeige

### 6.1 Ergebnisliste
- Die drei Karten Wohngeld, Kinderzuschlag, Grundsicherungsgeld (und bei Rente: Grundsicherung im Alter, Wohngeld) in **einen Rahmen** „Entweder oder“ stellen, statt drei lose Karten und eine zugeklappte Tipp-Kachel.
- Je Weg **eine Summe** („Weg A: zusammen etwa 800 bis 960 € im Monat“, „Weg B: etwa 300 € im Monat“), darunter ein Satz zum Verhältnis aus Abschnitt 4.
- Unter jeder Karte außerhalb des Rahmens eine Zeile „Passt zu beiden Wegen“ (Kindergeld, Unterhaltsvorschuss, Pflegegeld, Elterngeld, Bildung und Teilhabe) oder „Nur mit Weg B“ (Rundfunkbefreiung).
- Darstellung nur mit vorhandenen Mitteln: Plaketten `--ok`, `--warn`, `--na`; Rahmen und Tipp `--hint`. Keine neue Farbe, keine Bereichsfarbe, keine neue Startkachel (docs/FARBEN.md auf `origin/main`).

Sätze (Entwurf, Einfache Sprache):

| Schlüssel (Vorschlag) | Text |
|---|---|
| `eo.kopf` | „Diese Hilfen gibt es nicht alle zusammen. Es gibt zwei Wege.“ |
| `eo.aVor` | „Für euch passt voraussichtlich Weg A: Wohngeld und Kinderzuschlag. Sie gehen vor. Grundsicherungsgeld gibt es dann nicht. Die Stellen prüfen, was vorgeht.“ |
| `eo.bUeblich` | „Wohngeld und Kinderzuschlag reichen für euch voraussichtlich nicht. Dann ist Grundsicherungsgeld der übliche Weg. Die Stelle prüft das.“ |
| `eo.wahl` | „Bei euch ist es knapp. Ihr könnt voraussichtlich wählen. Wichtig: Wer Grundsicherungsgeld schon beantragt hat, kann den Kinderzuschlag auf diesem Weg nicht mehr bekommen. Lasst euch vorher beraten.“ |
| `eo.unklar` | „Welcher Weg für euch gilt, kann die App nicht sicher sagen. Die Stelle prüft, was vorgeht.“ |
| `eo.nichtZaehlen` | „Bitte die Beträge der zwei Wege nicht zusammenzählen.“ |
| `eo.kv` | „Mit Grundsicherungsgeld bist du über das Jobcenter krankenversichert. Mit Wohngeld und Kinderzuschlag brauchst du eine eigene Versicherung, zum Beispiel über deine Arbeit.“ |
| `eo.dringend` | „Fehlt dir jetzt Geld für Essen oder Miete? Geh zum Jobcenter. Es zahlt zuerst und klärt den Rest mit den anderen Stellen.“ |
| `eo.abgelehnt` | „Wird ein Antrag abgelehnt: Stelle sofort den Antrag für den anderen Weg. Dann kann es Geld auch für die Zeit davor geben.“ |
| `eo.beide` | „Das Bildungspaket und die Kita ohne Elternbeitrag gibt es auf beiden Wegen.“ |

`ww.tipp` ersetzen durch `eo.dringend` und `eo.abgelehnt`. Den Satz `z.ggVsWg` durch die Lage-Sätze ersetzen. `z.gsaWg` und `eo.tipp` („welcher Weg dir mehr bringt“) bleiben für Rente (Nr. 14).

### 6.2 Antragsmappe
Statt leerer Haken eine Wahl mit einem Knopf je Weg (Optionsfelder, nur einer wählbar):

| Auswahl | Hakt an | Vorbelegt, wenn |
|---|---|---|
| „Weg A: Wohngeld und Kinderzuschlag“ | Wohngeld, Kinderzuschlag, Bildung und Teilhabe | Lage „A geht vor“ |
| „Weg B: Grundsicherungsgeld“ | Grundsicherungsgeld (Bildung und Teilhabe ist dort enthalten) | Lage „B ist üblich“ |
| „Ich weiß es noch nicht“ | nichts aus der Gruppe; Hinweis auf Beratung und `eo.dringend` | Lage „Kleine Lücke“ und „Unklar“ |

- Für Rente: „Wohngeld“ und „Grundsicherung im Alter“ im selben Rahmen, aber ohne die Lagen „A geht vor“ und „Unklar“: nur „Wahl“ (beide Karten unverändert) oder „B ist üblich“ (Wohngeld bringt deutlich weniger: Wohngeld „möglich“ mit Verzicht-Hinweis). Die Karte Grundsicherung im Alter wird nie herabgestuft (Nr. 14).
- Alle anderen Leistungen bleiben Haken wie heute.
- Die Wahl ist ein Zustand wie `pickedUser`: nur im Arbeitsspeicher bzw. über die vorhandene Speicherung des Vorgangs, kein neuer Speicherort. Texte wie bisher über `esc(t(...))` einsetzen. Auf den Briefen erscheint die Wahl nicht (keine zusätzlichen persönlichen Daten).
- Eine Vorbelegung ist eine Empfehlung der App. Ob das gewünscht ist oder immer „Ich weiß es noch nicht“ vorbelegt wird, ist eine Entscheidung des Nutzers.

## 7. Offen

| Punkt | Warum offen |
|---|---|
| WoGVwV Nr. 14 (Einkommen) und Nr. 15.01 | Nicht selbst gelesen (Abruf abgebrochen, Seite sehr lang). Die Aussagen zu Kindergeld und Elterngeld beim Wohngeld stützen sich auf § 14 WoGG. |
| Sozialamt verweist auf Wohngeld (Nr. 14, 15) | Nur aus § 2 SGB XII, §§ 7, 8 WoGG abgeleitet; keine eigene Weisung dazu gelesen. In der App darum nur „Das Sozialamt prüft das“. |
| RBStV | Wortlaut nennt „Arbeitslosengeld II“. Dass Grundsicherungsgeld darunter fällt, ist die bisherige Linie der App; eine amtliche Aussage des Beitragsservice dazu wurde hier nicht geprüft. |
| Ab 1.1.2027 | § 12a Satz 3 SGB II läuft aus (Regel Nr. 9). Weitere Änderungen zum 1.1.2027 nicht geprüft; gehört in die Prüfung am 20.12.2026. |
| Puffer und Vorbelegung | Produkt-Entscheidungen (Abschnitte 4 und 6.2). |

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Annahme im Auftrag „Kindergeld überall Einkommen“ ist falsch: beim Wohngeld kein Einkommen | mittel | Regel Nr. 19 getrennt nach Leistung | § 14 WoGG; § 11 Abs. 1 Satz 5 SGB II |
| Annahme „Wahlrecht § 6a Abs. 1a BKGG“: Das Gesetz regelt einen erweiterten Zugang (höchstens 100 €), kein allgemeines Wahlrecht; gesperrt nach SGB-II-Antrag | hoch | Regel Nr. 6, Satz `eo.wahl` | § 6a Abs. 1a BKGG; DA-KiZ C.4.2 |
| „Wahl hängt davon ab, wer mehr bekommt“ gilt nicht allgemein: Deckt Wohngeld (mit Kinderzuschlag) den Bedarf, besteht kein Wahlrecht | hoch | Regeln Nr. 2, 3, 5; Abschnitt 4 | § 12a SGB II; FW § 12a Rz. 12a.12, 12a.13 |
| Tipp der App „beide Anträge gleichzeitig“ kann den Kinderzuschlag kosten | hoch | Befund 3, Ersatztexte `eo.dringend`, `eo.abgelehnt` | § 6a Abs. 1a Nr. 3 BKGG; § 8 Abs. 1 WoGG; § 28 SGB X, § 40 Abs. 7 SGB II; § 25 Abs. 3 WoGG |
| Elterngeld-Freibetrag 300 € gilt bei SGB II, SGB XII, Kinderzuschlag, AsylbLG nur mit Arbeit vor der Geburt | mittel | Regel Nr. 23 | § 10 Abs. 5 BEEG |
| Rundfunkbefreiung folgt nicht aus Wohngeld oder Kinderzuschlag | gering | Regel Nr. 32, Befund 9 | § 4 Abs. 1, 6 RBStV |
| `docs/FARBEN.md` fehlt auf `origin/claude/b-entwuerfe` | gering | aus `origin/main` gelesen; Vorschlag nutzt nur vorhandene Zustandsfarben | docs/FARBEN.md (`origin/main`) |
| WoGVwV nur teilweise gelesen | mittel | als offen gekennzeichnet (Abschnitt 7) | – |

## Prüfvermerk (21.11.2026, zweite Prüfung: Rechenregeln PR #160)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Nr. 14 nannte Wohngeld bei Rente „vorrangig“ mit dem Satz „geht Wohngeld vor“. Das stimmt für das Sozialamt nicht: Der Nachrang ist keine Ausschlussnorm, mögliches, nicht bezogenes Wohngeld ist kein Einkommen, eine Pflicht wie § 12a SGB II fehlt | hoch | Nr. 14 auf „Wahl“ geändert, Nr. 15, Probelauf Rentner, Befund 4, Abschnitt 6 (Texte und Rente) angepasst; im Code umgesetzt auf `claude/b-ux-ergebnis` (wegeLage: bei Rente nur „wahl“ oder „bUeblich“) | BSG, Urteil vom 23.03.2021, B 8 SO 2/20 R (bsg.bund.de, Abruf 21.11.2026); § 2 Abs. 1 SGB XII, § 7 Abs. 1 Satz 1 Nr. 5, § 8 Abs. 2 WoGG (gesetze-im-internet.de, Abruf 21.11.2026) |
| Lage „Wahl“ beim Kinderzuschlag: Der Not-Hinweis `eo.dringend` („Geh zum Jobcenter“) nannte die Folge nicht | mittel | Im Code eigener Text `weg.dringendWahl` mit dem Zusatz „Nach dem Antrag dort gibt es den Kinderzuschlag auf diesem Weg nicht mehr“ | § 6a Abs. 1a Nr. 3 BKGG (Abruf 21.11.2026) |
