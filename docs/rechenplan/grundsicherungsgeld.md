# Rechenplan Grundsicherungsgeld (SGB II, bis 30.6.2026 Bürgergeld)

Funktionen: `grundsicherungsgeld` → `ggeldRechnung` → `ggeldRechnung0`; Hilfen `elternEinkSGB2`, `haushaltsFreibetrag`, `sgb2Freibetrag`, `mehrBehSGB2`, `mehrAllg`, `unterhaltAnrechenbar`; danach `mitKdu`, `mitZukunft`, `besondere`.

## Eingaben
Erwachsene, Kinder nach Altersgruppe, junge Erwachsene, Einkommen je Person (Art, Brutto, Netto), Miete (warm), Mietenstufe (für die Angemessenheit), Vermögen, Alter der ältesten Person, Erwerbsminderung, Behinderung/Teilhabe, Schwangerschaft, Warmwasser, Ernährung, Unterhalt/Kinder-Einkommen, gezahlter Unterhalt, Ausbildung, EU/Asyl, Bezug.

## Rechenschritte
1. Asyl → nein (§ 7 Abs. 1 Satz 2 Nr. 3). EU-Ausschluss (§ 7 Abs. 1 Satz 2 Nr. 2, Rückausnahmen Arbeit/5 Jahre) → nein.
2. Rentenalter oder voll erwerbsgemindert: Paar mit Kindern → möglich (gemischte Bedarfsgemeinschaft), sonst nein (Sozialamt zuständig, § 7 Abs. 4, § 8).
3. Bezug Grundsicherungsgeld → na; Bezug Sozialamt → nein. BAföG-fähige eigene Ausbildung → nein (§ 7 Abs. 5).
4. Vermögen über Schonvermögen je Person nach Alter (§ 12 Abs. 2: 5.000 € bis 30, 10.000 € ab 30, 12.500 € ab 40, 20.000 € ab 50; Kinder 5.000 €) → nein. Paar: Alter der zweiten Person unbekannt → über der kleinsten Grenze höchstens möglich.
5. `ggeldRechnung0`:
   - Einkommen = Netto − Freibetrag aus Arbeit je Person (§ 11b Abs. 3: 100 € frei, 20 % 100–520 €, 30 % 520–1.000 €, 10 % 1.000–1.200 € bzw. 1.500 € mit Kind) − Elterngeld-Freibetrag − Versicherungspauschale 30 € (nicht bei Lohn) − titulierter gezahlter Unterhalt + Kindergeld + Unterhalt/Einkommen der Kinder nur bis zu ihrem Bedarf (§ 11 Abs. 1).
   - Bedarf = Regelbedarfe (563 / 506 / 471 / 390 / 357 / 451 €) + Miete + Mehrbedarf Alleinerziehende + feste Mehrbedarfe (Teilhabe 35 %, Schwangerschaft 17 %, Warmwasser).
   - Lücke ≥ 50 € → ja mit Betrag; Lücke > −(100 € + offene Mehrbedarfe) → möglich; sonst nein.
6. Miete über der Angemessenheitsgrenze (Höchstbetrag WoGG × 1,1 + Heizkostenkomponente, § 22 SGB II, BSG-Rechtsprechung ohne schlüssiges Konzept) → zweite Rechnung; unterschiedlich → möglich mit Hinweis.
7. Künftige vorrangige Leistung (ALG I, Krankengeld, Elterngeld) → zweite Rechnung (§ 12a).
8. Allein, nur Rente, ab 60 oder Alter unbekannt → höchstens möglich (vorgezogene Altersrente schließt aus, § 7 Abs. 4).

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Regelbedarfe 2026 | 563 / 506 / 451 / 471 / 390 / 357 € | RBSFV 2026, § 20, § 23 SGB II |
| Freibetrag Arbeit | 100 € + 20/30/10 %, Obergrenze 1.200 / 1.500 € | § 11b Abs. 2, 3 SGB II |
| Schonvermögen | 5.000 / 10.000 / 12.500 / 20.000 € je Person | § 12 Abs. 2 SGB II (Fassung 1.7.2026) |
| Mehrbedarf Alleinerziehende | 36 % bzw. 12 % je Kind, höchstens 60 % | § 21 Abs. 3 SGB II |
| Versicherungspauschale | 30 € | § 6 Abs. 1 Nr. 1 Grundsicherungsgeld-V |

## Bewusst „möglich“
Lücke klein oder knapp negativ; Ernährung (Krankheit) offen; Miete über Angemessenheit; vorgezogene Altersrente möglich; Paar-Vermögen nach Alter; gemischte Bedarfsgemeinschaft; Eigentum, Verwandte, teures Auto.

## Befunde
- **G1 (hoch, behoben in PR #160 / claude/b-ux-ergebnis):** Auf diesem Stand kennt `ggeldRechnung0` vorrangiges Wohngeld und Kinderzuschlag nicht (§ 12a SGB II). Folge: Grundsicherungsgeld „wahrscheinlich“ mit Betrag, obwohl Wohngeld + KiZ die Lücke decken (Beispiel Paar, 2 Kinder, 2.800 € brutto, Miete 800 €). Korrektur liegt im PR #160, hier nicht geändert.
- **G2 (mittel):** Erwarteter Unterhaltsvorschuss wird nicht als Einkommen der Kinder eingerechnet (nur gezahlter Unterhalt). UVG ist vorrangig (§ 12a; FW Rz. 12a.8).
- **G3 (gering):** Alter der zweiten erwachsenen Person unbekannt; Schonvermögen deshalb mit der ältesten Person, darüber nur „möglich“.
