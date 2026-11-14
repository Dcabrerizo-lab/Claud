# Abgleich mit der Sozialplattform (sozialplattform.de)

Stand 14.11.2026. 120 Seiten der staatlichen Sozialplattform (BMAS) gelesen und mit den Werten in `src/rules.js` verglichen.

| Thema | Sozialplattform | SoLo | Ergebnis |
|---|---|---|---|
| Kindergeld | 259 € je Kind; bis 6 Monate rückwirkend; ab 18 nur mit Schule/Ausbildung/Studium (bis 25), arbeitssuchend (bis 21), Behinderung; nach erster Ausbildung höchstens 20 Std./Woche, Minijob 603 € erlaubt | 259 €, gleiche Regeln (§ 32 Abs. 4 EStG) | stimmt |
| Kinderzuschlag | höchstens 297 € je Kind; Mindesteinkommen 600 € (allein) / 900 € (Paar) brutto; Kind unter 25 | 297 €, 600 / 900 € | stimmt |
| Unterhaltsvorschuss | ab 12 Jahren: kein Bürgergeld/Grundsicherungsgeld oder mind. 600 € eigenes Einkommen | `uvg.min12` 600 € | stimmt |
| Regelbedarfe | 563 / 506 / 451 / 471 / 390 / 357 € | gleich | stimmt |
| Schulbedarf (BuT) | 2026: 65 € + 130 € | 195 € im Jahr | stimmt |
| Grundsicherung im Alter | ab Rentenalter oder ab 18 dauerhaft voll erwerbsgemindert; Schonvermögen 10.000 € / Paar 20.000 €; Unterhalt erst ab 100.000 € Einkommen der Kinder/Eltern | gleich | stimmt |
| Hilfe zur Pflege | Einkommensgrenze 2 × Regelbedarf 1 + Kosten der Unterkunft + Familienzuschlag 70 % | `hzp` grund 2, familie 0,7 | stimmt |
| Entlastungsbetrag | 125 € (Stand 2024 auf der Plattform) | 131 € | **Plattform veraltet**: 131 € seit 1.1.2025 (§ 45b SGB XI, Bekanntmachung 2025, BMG-Übersicht 2026) |
| Blindenhilfe | Beispiel 806,40 € | 951,92 € ab 1.7.2026 | **Plattform-Beispiel veraltet** (Rentenanpassung 7/2026) |
| Arbeitslosengeld | 60 % / 67 % mit Kind, 20 % SV-Pauschale, Nebeneinkommen 165 € frei | gleich | stimmt |
| Grundsicherungsgeld | ab 15 bis Rentenalter, erwerbsfähig | gleich | stimmt |
| Wertmarke | 104 € / Jahr, 53 € / halbes Jahr (2026) | Hinweis ohne Betrag | stimmt (kein Betrag in SoLo) |

**Leistungen auf der Plattform, die SoLo nicht als eigene Karte hat** (möglicher Ausbau): Pflegewohngeld NRW,
Bestattungskostenhilfe, Übernahme von Mietrückständen, einmalige Bedarfe (Erstausstattung), Hilfe zur Weiterführung des Haushalts,
Eingliederungshilfe, Leistungen zur Eingliederung in Arbeit (Einstiegsgeld, Vermittlungsbudget).
