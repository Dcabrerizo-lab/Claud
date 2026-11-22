# Unabhängige Prüfung PR #124: Elterngeld mit Mehrlingen und Teilzeit

Geprüft: Branch `claude/b-elterngeld-mehrlinge-teilzeit` gegen `claude/test-update-naechstes` (Stand 9de55f6), Beträge, Recht, Texte, Tests.

## Quellen (alle abgerufen am 21.11.2026)

| Quelle | Fundstelle |
|---|---|
| BEEG § 1 Abs. 6, § 2, § 2a, § 2c, § 4a, § 10 (Wortlaut) | gesetze-im-internet.de/beeg/__1.html, __2.html, __2a.html, __2c.html, __4a.html, __10.html |
| Richtlinien zum BEEG, BMBFSFJ/211, Stand 07/2026 (Nr. 2.3.2, 2.3.3, 2.4, 2a.1.1, 2a.1.2, 2a.4, 2c.1.4.0, 4a.2.1 Beispiele 1–5, 10.4, 10.5.2) | bmbfsfj.bund.de/resource/blob/243236/24cf08eceb753c1e8e847848b57dfda7/richtlinien-zum-beeg-data.pdf |
| Elterngeld-Schnellrechner des Familienportals (nur Fälle ohne Teilzeit und Mehrlinge) | Referenzfälle im Repo: `test/amtlich-elterngeld.json`, `test/amtlich-gross-elterngeld.json` |

Der Schnellrechner ließ sich für Teilzeit und Mehrlinge nicht automatisch abfragen. Ersatz: die Rechenbeispiele der amtlichen Richtlinien.

## Ergebnis der Rechtsprüfung (ohne Befund)

| Punkt | Ergebnis | Quelle |
|---|---|---|
| Teilzeit: Prozentsatz allein nach dem Einkommen vor der Geburt, auf den Unterschied; vorher höchstens 2.770 € | richtig | § 2 Abs. 3; Richtlinien 2.3.2, 2.3.4 |
| Netto nach ≥ vorher oder nach ≥ 2.770 €: Mindestbetrag 300 € plus Zuschläge | richtig | Richtlinien 2.3.3, 2.4 |
| Geschwisterbonus: 10 % vom Elterngeld nach § 2 (nach Mindestbetrag, höchstens 1.800 €), ohne Mehrlingszuschlag; mindestens 75 € | richtig | Richtlinien 2a.1.1 |
| Höchstbetrag 1.800 € vor den Zuschlägen (Drillinge 3.000 € netto: 2.400 €) | richtig | Richtlinien 2a.4 (Beispiel 1.800 + 300) |
| Mehrlinge zählen nicht als Geschwister, das erste Kind der Geburt schon | richtig | § 2a Abs. 1 Satz 2; Richtlinien 2a.1.2 |
| ElterngeldPlus: eigene Rechnung mit halbem Mindestbetrag, halbem Mindest-Bonus, halbem Mehrlingszuschlag; Deckel = halbes Basiselterngeld ohne Einkommen einschließlich Bonus und Zuschlag | richtig (Deckel am Kern ist rechnerisch dasselbe) | § 4a Abs. 2; Richtlinien 4a.2.1 Beispiele 4 und 5 |
| Kein „künftiges Einkommen“ bei Teilzeit und Mehrlingen | vorsichtig, in Ordnung | § 10 Abs. 4 |
| Neue Felder: Speicherung über den bestehenden Zustand, kein neues innerHTML, keine neue Kachel, keine neuen Farben | in Ordnung | Code |
| Übersetzungen (Stichprobe en, tr, ru, ar, fr, pl): Sinn und Platzhalter stimmen | in Ordnung | `src/lang/*.json` |

## Nachgerechnete Fälle (eigene Dezimalrechnung aus dem Gesetz, nicht aus rules.js)

Netto vorher / nachher, Kinder der Geburt, Geschwisterbonus: Basis / Plus. Alle 16 Fälle stimmen mit der App überein (auf den Euro).

| Fall | Basis | Plus |
|---|---|---|
| 1.500 / –, Zwillinge | 1.220,83 | 610,42 |
| 1.500 / –, Drillinge | 1.520,83 | 760,42 |
| 0 / –, Zwillinge | 600,00 | 300,00 |
| 3.000 / –, Drillinge | 2.400,00 | 1.200,00 |
| 2.000 / 800 | 780,00 | 622,92 |
| 1.200 / 500 | 469,00 | 374,08 |
| 2.000 / 2.500 | 300,00 | 150,00 |
| 4.000 / 1.000 | 1.204,67 | 900,00 |
| 4.000 / 2.900 | 300,00 | 150,00 |
| 2.500 / 1.000, Zwillinge, Bonus | 1.372,50 | 1.013,96 |
| 1.100 / 700, Zwillinge, Bonus | 675,00 | 455,50 |
| 900 / 300, Bonus | 531,60 | 348,24 |
| 800 / –, Drillinge, Bonus | 1.256,22 | 628,11 |
| 3.500 / 1.500, Drillinge, Bonus | 1.567,63 | 1.267,63 |
| 600 / 400 | 300,00 | 182,20 |
| 1.000 / 60, Zwillinge | 951,75 | 475,88 |

Zusätzlich die Beispiele der Richtlinien (Elterngeld-Netto, also ohne Pauschbetrag): 4a.2.1 Beispiel 1 (715 / 650), 2 (325 / 325), 3 (300 / 166,08), 4 (1.051,05 / 990), 5 (950 / 637,50), 2.3.2 (5.000 / 2.570: 300), 2a.4 (3.000, Zwillinge: 2.100). Alle gleich.

## Prüfvermerk (21.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Schon laufendes Elterngeld bei Mehrlingen, Grundsicherungsgeld / Sozialhilfe / Kinderzuschlag: Die App nahm ab 300,01 € Elterngeld „Einkommen vor der Geburt“ an und ließ 300 € frei. Zwillinge ohne früheres Einkommen bekommen aber 600 € (Drillinge 900 €). Folge: 300 € zu viel Leistung angezeigt (falsche Zusage). | hoch | Schwelle = Mindestbetrag plus Mehrlingszuschlag (`egOhneArbeit`), Freibetrag bleibt 300 € (nicht vervielfacht). `src/rules.js`, `test/referenz.js`, Test `[eg-mehrlinge-frei]`, 1 Mutation. | § 10 Abs. 5 BEEG; Richtlinien 10.5.2 |
| Schon laufendes Elterngeld bei Mehrlingen, Wohngeld: Freibetrag blieb bei 300 € statt 300 € je Kind der Geburt. Folge: Wohngeld zu niedrig. | mittel | Freibetrag × Kinder der Geburt (nur wenn das Baby da ist, höchstens 3). `src/rules.js`, `test/referenz.js`, Test `[eg-mehrlinge-frei]`, 1 Mutation. | § 10 Abs. 1 und 4 BEEG; Richtlinien 10.4 (Drillinge 900 €) |
| Teilzeit: Kein Hinweis auf die Grenze von 32 Wochenstunden. Wer ein Netto wie vorher einträgt (Vollzeit), bekam 300 € zugesagt. | mittel | Neuer Text `t.eg.teilzeitStunden` in allen 13 Sprachen und in Einfacher Sprache, erscheint bei Netto nach der Geburt. Test `[eg-teilzeit]`. | § 1 Abs. 1 Nr. 4, Abs. 6 Nr. 1 BEEG; Richtlinien 2.4 |
| Pauschbetrag: Der Kommentar sagte, der Wortlaut „lege 1.230 € nahe“. Amtlich gilt für Geburten ab 1.1.2025 ein Zwölftel von 1.230 € = 102,50 €. Die App rechnete mit 83,33 € wie der Schnellrechner des Bundes und lag bis etwa 13 € im Monat zu hoch. | mittel, ERLEDIGT (siehe Prüfvermerk unten) | Zuerst nur Kommentar berichtigt. Nach der Entscheidung des Nutzers (21.11.2026) auf 1.230 € / 12 umgestellt. | § 2c Abs. 1 Satz 4 BEEG; Richtlinien 2c.1.4.0 |
| Mutationsliste: zwei Stellen passten nicht mehr zum Code. | niedrig | `tools/mutationstest.js` angepasst. | – |

## Offen

| Punkt | Warum offen |
|---|---|
| Pauschbetrag 83,33 € oder 102,50 € | entschieden am 21.11.2026: Gesetz (102,50 €), siehe Prüfvermerk unten |
| Schon laufendes ElterngeldPlus: Freibetrag nur zur Hälfte (§ 10 Abs. 3, Abs. 5 Satz 3) | App weiß nicht, ob Basis oder Plus bezogen wird (schon vor PR #124 so) |
| Geschwisterbonus ohne früheres Einkommen (375 €) gilt bei Grundsicherung weiter als „mit Einkommen vor der Geburt“ | schon vor PR #124 so; bräuchte die Frage nach dem Bonus |
| Vierlinge und mehr werden wie Drillinge gerechnet | vorsichtig, Text weist darauf hin |
| Neuer Satz zu 32 Stunden in ps, so, fa, fa-AF | bitte von Muttersprachlern gegenlesen |
| Amtlicher Rechner für Teilzeit und Mehrlinge | nicht automatisch abfragbar; durch Richtlinien-Beispiele ersetzt |

## Tests

`npm run build:web` und `npm run test:rules` grün. Einzeln grün: `dom-test.js`, `test-schritte.js`, `test-sicherheit.js`, `test-anzeige.js`. Die drei neuen Prüfungen schlagen auf dem alten Stand fehl (geprüft).

## Prüfvermerk (21.11.2026): Pauschbetrag nach dem Gesetz

Entscheidung des Nutzers David vom 21.11.2026: Beim Elterngeld gilt das Gesetz, nicht der Schnellrechner des Bundes.
SoLo zieht jetzt 1.230 € / 12 = 102,50 € vom Netto ab (vorher 1.000 € / 12 = 83,33 €). `STATUS.md` ist nicht geändert, die Entscheidung steht hier.

Quellen (alle abgerufen am 21.11.2026):

| Quelle | Aussage |
|---|---|
| § 2c Abs. 1 BEEG, gesetze-im-internet.de/beeg/__2c.html | Abzug „ein Zwölftel des Arbeitnehmer-Pauschbetrags“; maßgeblich ist § 9a Satz 1 Nr. 1 Buchst. a EStG „in der am 1. Januar des Kalenderjahres vor der Geburt des Kindes für dieses Jahr geltenden Fassung“ |
| § 9a Satz 1 Nr. 1 Buchst. a EStG, gesetze-im-internet.de/estg/__9a.html | „ein Arbeitnehmer-Pauschbetrag von 1 230 Euro“ |
| Richtlinien zum BEEG (BMBFSFJ/211, 07/2026), Nr. 2c.1.4.0, bmbfsfj.bund.de | „ein Zwölftel von 1.230 Euro ab 01.01.2023“, das sind 102,50 € im Monat; angewandt für Geburten ab 01.01.2025 (Geburten 2024: 1.200 €) |
| Elterngeld-Schnellrechner, familienportal.de (1.039 gespeicherte Fälle vom 14.11.2026) | rechnet auf den Cent mit 83,33 € Abzug |

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| `R.eg.pausch` stand auf 1.000 € / 12. Das Elterngeld war bis etwa 13 € im Monat zu hoch (mit Geschwisterbonus bis etwa 14 €). | mittel | `src/rules.js`: 1.230 / 12, Kommentar mit Wortlaut, Fundstelle und Hinweis auf den Schnellrechner. | § 2c Abs. 1 BEEG; § 9a EStG; Richtlinien 2c.1.4.0 |
| Stichtag: Nach dem Wortlaut allein läge 1.230 € schon für Geburten 2024 nahe. Die Richtlinien wenden 102,50 € erst für Geburten ab 01.01.2025 an (Geburten 2024: 1.200 €). | niedrig | Kommentar in `src/rules.js` nennt den Stichtag 01.01.2025. Für SoLo ohne Folge (nur laufende und baldige Geburten). | Richtlinien 2c.1.4.0 |
| Unabhängige Referenz rechnete ebenfalls mit 83,33 €. | mittel | `test/referenz.js`: 102,50 €; neuer Abgleich `egAbgleich`. | wie oben |
| Tests gegen den Schnellrechner (39 + 1.000 Fälle) verlangten Gleichheit auf den Euro. | mittel | Keine weitere Toleranz. Geprüft wird: 1. amtlich = Formel mit 83,33 € auf den Cent, 2. SoLo = dieselbe Formel mit 102,50 € auf den Euro, 3. bei festem Satz Differenz = −Satz × 19,17 € (65 %: −12,46 €; 67 %: −12,84 €; mit Geschwisterbonus × 1,1), bei Mindest- und Höchstbetrag 0 €, SoLo nie über dem Schnellrechner. Ergebnis: 720 Fälle fester Satz, 182 Mindest-/Höchstbetrag, 137 gleitender Satz (dort nur 1. und 2.), 0 Abweichungen. `test/test-amtlich.js`, `tools/amtliche-rechner/gross-auswerten.js`, `tools/amtlich-vergleich-bafoeg-eg.js`. | gespeicherte Rechner-Fälle |
| Erwartungen in `test/test-faelle.js` stammten aus dem Schnellrechner. | mittel | Von Hand aus dem Gesetz neu gerechnet (Rechenweg im Kommentar). Broschüren-Beispiele (Elterngeld-Netto 700 / 1.000 / 2.000 / 2.500 €) unverändert richtig, Eingabe jetzt plus 102,50 €. | § 2, § 2c BEEG; Broschüre „Elterngeld und Elternzeit“ 10/2025 |
| Mutationsliste kannte den Wert des Pauschbetrags nicht. | niedrig | 2 neue Mutationen (1.000 statt 1.230 €; Abzug beim Netto nach der Geburt fehlt), beide entdeckt. | – |

Beispiele (ein Kind, Basiselterngeld, volle Euro):

| Netto vorher | alt (83,33 €) | neu (102,50 €) | Rechenweg neu |
|---|---|---|---|
| 500 € | 400 € | 386 € | 397,50 × 97,1 % |
| 1.100 € | 681 € | 669 € | 997,50 × 67,1 % |
| 1.500 € | 921 € | 908 € | 1.397,50 × 65 % |
| 2.000 € | 1.246 € | 1.233 € | 1.897,50 × 65 % |
| 0 € / 3.000 € | 300 € / 1.800 € | 300 € / 1.800 € | Mindest- und Höchstbetrag |

Offen:

| Punkt | Warum offen |
|---|---|
| `docs/PRUEFLISTE.md`, Abschnitt Elterngeld, Zeile `amtlich-elterngeld`: dort steht noch „83,33 €“ und „gleich wie der Elterngeldrechner des Bundes“ | Datei war in diesem Auftrag gesperrt. Richtig wäre: „102,50 € (1.230 € / 12); Unterschied zum Schnellrechner des Bundes (83,33 €) genau erklärt“. |
| `STATUS.md` | ändert nur der Nutzer; Entscheidung dort nachtragen |
| Kein Hinweis in der App, dass der Schnellrechner des Bundes etwas mehr zeigt | bräuchte einen neuen Text in 13 Sprachen; Vorschlag: ein Satz „Der Rechner des Bundes zeigt bis etwa 13 € mehr. Die Elterngeldstelle rechnet wie SoLo.“ |
| Gesetzentwurf der Bundesregierung zur Änderung des BEEG (bmbfsfj.bund.de, Datei vom 13.11.2026): andere Ersatzraten, Mindestbetrag 330 €, Höchstbetrag 1.900 €, Geschwisterbonus 5 % | noch nicht beschlossen; soll für Geburten ab 1.11.2027 gelten. Bis dahin unverändert. Beobachten. |
| Tests | lokal: `build:web`, `test:rules`, Musterbescheide 1 und 2, fünf DOM-Tests grün; der volle Mutationstest und die Abfrage des Schnellrechners laufen nur auf GitHub |
