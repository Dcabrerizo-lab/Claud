# Rechenplan BAföG

Funktionen: `bafoeg` → `bafoeg0`; Betragsschätzung `bafSchaetzKind`, `bafSchaetzIch`, `bafBedarf`, `bafEink`, `bafAnrEltern(Spanne)`.

## Eingaben
Ausbildung (`kind` = Kind in Schule/Studium, `kindBetrieb`, `ich`), Erwachsene, Kinder, Einkommen je Person (Brutto, Netto, Art), Vermögen, Auto, Alter (Geburtsjahr bzw. Gruppe), eigenes Einkommen der Kinder, Aufenthalt.

## Rechenschritte
1. Keine Ausbildung → nein; betriebliche Ausbildung des Kindes → nein (BAB statt BAföG).
2. **Kind studiert/geht zur Schule:** Freibetrag Eltern 2.540 € (Paar) bzw. 1.690 € (allein) + 770 € je weiteres Kind (§ 25 Abs. 1, 3). Einkommen nach § 21 (`bafEink21`, seit 21.11.2026 statt Netto) ≤ Freibetrag → ja. Sonst: angerechnet wird der Teil über dem Freibetrag × (50 % − 5 % je Kind mit Freibetrag) (§ 25 Abs. 4), bei Geschwistern in Ausbildung auch geteilt (§ 11 Abs. 4). Liegt die kleinste Anrechnung unter dem höchsten Bedarf (1.088 €, minus 9,50 €) → möglich; sonst nein. Unterhalt für sich selbst zählt nur versteuert, Elterngeld bis 300 € frei.
3. **Selbst in Ausbildung:** ab 50 → nein; 40–49 ohne Geburtsjahr unter 45 → möglich (Altersgrenze 45, § 10 Abs. 3). Vermögensfreibetrag 15.000 € (bis 29) bzw. 45.000 € (ab 30) + 2.300 € für Partner und je Kind (§ 29 Abs. 1); der Betrag darüber / 12 Monate (§ 30) > Bedarf + 160 € je Kind (§ 14b) → nein, sonst möglich (Elterneinkommen unbekannt → nie „wahrscheinlich“).
4. Betragsschätzung (nur Studium): Bedarf 475 € + Wohnen 59 € (bei den Eltern) / 380 € (auswärts) + Kranken-/Pflegeversicherung 0 / 137 / 233 € + 160 € je Kind unter 14 (§§ 13, 13a, 14b); minus Anrechnung (Eltern § 25, eigenes Einkommen § 23 mit 389 € frei, Ehegatte § 25 Abs. 1 Nr. 2, Vermögen § 30); Einkommen nach § 21 (Brutto − 1.230 €/Jahr − Steuer − 22,3 %, höchstens 17.200 €/Jahr); unter 10 € keine Zahlung (§ 51 Abs. 4). Spanne aus günstigstem/ungünstigstem Fall.
5. Asyl → höchstens möglich; EU-Ausschluss → höchstens möglich.

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Elternfreibeträge | 2.540 / 1.690 / 770 € | § 25 Abs. 1, 3 BAföG |
| Anrechnungsfreiheit | 50 % − 5 % je Kind | § 25 Abs. 4 BAföG |
| Bedarf (höchster) | 1.088 € | §§ 13, 13a Abs. 2 BAföG |
| Vermögen | 15.000 / 45.000 € + 2.300 € | § 29 Abs. 1 BAföG |
| Eigenes Einkommen frei | 389 € | § 23 Abs. 1, Bekanntmachung 18.11.2025 (BGBl. 2025 I Nr. 279) |
| Mindestzahlung | 10 € | § 51 Abs. 4 BAföG |

## Bewusst „möglich“
Eigene Ausbildung (Elterneinkommen unbekannt), Einkommen der Eltern über dem Freibetrag, Geschwister in Ausbildung, Alter 40–49, Vermögen knapp darüber.

## Befunde
- **B1 (mittel, behoben 21.11.2026, claude/b-rechenbefunde):** Einstufung beim Kind jetzt mit dem Einkommen nach § 21 BAföG (`bafEink21`): Lohn mit bekanntem Brutto = (Brutto − 102,50 €) − Sozialpauschale 22,3 % (höchstens 17.200 €/Jahr, § 21 Abs. 2 Satz 1 Nr. 1) − Steuer (Brutto − Netto − geschätzte echte Beiträge). Ohne Brutto (nur Auszahlung) und bei anderen Einkommen: „wahrscheinlich“ weiter mit dem Netto (nie zu günstig), „eher nicht“ mit der vorsichtigen unteren Schätzung. Weiter offen: Einkommen des vorletzten Jahres (§ 24 Abs. 1) kennt die App nicht (wie vorher). Quelle gesetze-im-internet.de/baf_g/__21.html, Abruf 21.11.2026. Beispiele Paar, ein Kind in Ausbildung: 3.800 € brutto / 2.650 € netto → 2.526,66 € ≤ 2.540 €, vorher „möglich“, jetzt „wahrscheinlich“; 7.000 € / 4.800 € → Anrechnung 1.039,70 € < 1.078,50 €, vorher „eher nicht“, jetzt „möglich“. Test `rechenbefunde-b1`.
- **B2 (gering):** Der höchste Bedarf 1.088 € (freiwillig versichert) liegt über dem Höchstsatz laut bafög.de (992 €) – bewusst vorsichtige Seite.
