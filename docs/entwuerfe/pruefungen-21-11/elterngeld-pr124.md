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
| Pauschbetrag: Der Kommentar sagte, der Wortlaut „lege 1.230 € nahe“. Amtlich gilt für Geburten ab 1.1.2025 ein Zwölftel von 1.230 € = 102,50 €. Die App rechnet mit 83,33 € wie der Schnellrechner des Bundes und liegt bis etwa 13 € im Monat zu hoch. | mittel, OFFEN | Nur Kommentar berichtigt. Der Wert bleibt, weil 1.039 amtliche Rechner-Fälle sonst abweichen. Entscheidung nötig: Richtlinie oder Schnellrechner. | § 2c Abs. 1 Satz 4 BEEG; Richtlinien 2c.1.4.0 |
| Mutationsliste: zwei Stellen passten nicht mehr zum Code. | niedrig | `tools/mutationstest.js` angepasst. | – |

## Offen

| Punkt | Warum offen |
|---|---|
| Pauschbetrag 83,33 € oder 102,50 € | siehe oben, Entscheidung des Nutzers |
| Schon laufendes ElterngeldPlus: Freibetrag nur zur Hälfte (§ 10 Abs. 3, Abs. 5 Satz 3) | App weiß nicht, ob Basis oder Plus bezogen wird (schon vor PR #124 so) |
| Geschwisterbonus ohne früheres Einkommen (375 €) gilt bei Grundsicherung weiter als „mit Einkommen vor der Geburt“ | schon vor PR #124 so; bräuchte die Frage nach dem Bonus |
| Vierlinge und mehr werden wie Drillinge gerechnet | vorsichtig, Text weist darauf hin |
| Neuer Satz zu 32 Stunden in ps, so, fa, fa-AF | bitte von Muttersprachlern gegenlesen |
| Amtlicher Rechner für Teilzeit und Mehrlinge | nicht automatisch abfragbar; durch Richtlinien-Beispiele ersetzt |

## Tests

`npm run build:web` und `npm run test:rules` grün. Einzeln grün: `dom-test.js`, `test-schritte.js`, `test-sicherheit.js`, `test-anzeige.js`. Die drei neuen Prüfungen schlagen auf dem alten Stand fehl (geprüft).
