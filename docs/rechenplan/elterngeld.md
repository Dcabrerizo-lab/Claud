# Rechenplan Elterngeld (BEEG)

Funktionen: `elterngeld`, `elterngeldBerechnen`.

## Eingaben
Baby (bald / da), Netto vor der Geburt (`egVor`), Netto nach der Geburt in Teilzeit (`egNach`), Zahl der Kinder der Geburt (`egKinder`), Kinder unter 6, Bezug von Elterngeld, Aufenthalt.

## Rechenschritte
1. Kein Baby → nein; Elterngeld schon (Einkommensart „eg“) → na; Asyl → möglich ohne Betrag.
2. Ohne Netto vor der Geburt → möglich, Spanne 300 bis 1.800 € (§ 2 Abs. 4, Abs. 1).
3. `elterngeldBerechnen`:
   - Elterngeld-Netto: seit 21.11.2026 erst `egNettoAmtlich` (Netto + echte Beiträge − 21 % des zurückgerechneten Bruttos, § 2f; Befund E2), dann n = Elterngeld-Netto − 102,50 € (1/12 des Arbeitnehmer-Pauschbetrags 1.230 €, § 2c Abs. 1).
   - Satz 67 %; unter 1.000 € +0,1 Prozentpunkte je volle 2 € (bis 100 %); über 1.200 € −0,1 je volle 2 € (bis 65 %) (§ 2 Abs. 2).
   - Ohne Einkommen danach: min(1.800 €, n × Satz). Mit Teilzeit: Satz × (min(n, 2.770 €) − (Netto danach − 102,50 €)) (§ 2 Abs. 3).
   - Mindestens 300 € (§ 2 Abs. 4). ElterngeldPlus: halbe Werte, höchstens die Hälfte des Basiselterngelds ohne Einnahmen (§ 4a Abs. 2).
   - Geschwisterbonus 10 %, mindestens 75 € (§ 2a Abs. 1), nur bei zwei Kindern unter 6 sicher; Mehrlingszuschlag 300 € je weiteres Kind (§ 2a Abs. 4).
4. Ergebnis: ja mit Basis- und Plus-Betrag, Bezugsmonate 12 + 2 (§ 4 Abs. 4, 6); Hinweise Teilzeit (höchstens 32 Std., § 1 Abs. 6), Mutterschaftsgeld, Einkommensgrenze 175.000 € (§ 1 Abs. 8).

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Satz | 67 %, 65–100 % | § 2 Abs. 1, 2 BEEG |
| Mindest-/Höchstbetrag | 300 / 1.800 € | § 2 Abs. 1, 4 BEEG |
| Deckel Teilzeit | 2.770 € | § 2 Abs. 3 BEEG |
| Pauschbetrag | 102,50 € (1.230 € / 12) | § 2c Abs. 1, § 9a EStG; Richtlinien BEEG 07/2026 Nr. 2c.1.4.0 |
| Geschwisterbonus / Mehrlinge | 10 % (≥ 75 €) / 300 € | § 2a Abs. 1, 4 BEEG |
| Einkommensgrenze | 175.000 € | § 1 Abs. 8 BEEG (Geburten ab 1.4.2025) |

## Bewusst „möglich“
Ohne Netto vor der Geburt; Asylverfahren; Geschwisterbonus bei nur einem Kind unter 6 als Hinweis.

## Befunde
- **E1 (gering, Entscheidung David 21.11.2026):** Der Schnellrechner des Bundes zieht 83,33 € statt 102,50 € ab und zeigt bis etwa 13 € mehr. SoLo rechnet nach dem Gesetz; `test/referenz.js` (`egAbgleich`) erklärt den Unterschied.
- **E2 (mittel, behoben soweit möglich 21.11.2026, claude/b-rechenbefunde):** SoLo fragt nur das Netto. `egNettoAmtlich` rechnet daraus das Brutto zurück (Steuerklasse wie `lohnAnnahmen`, Kinder vor der Geburt für die Pflegeversicherung) und ersetzt die echten Beiträge durch die Pauschalen 9 + 10 + 2 % (§ 2f Abs. 1 BEEG); die Steuer bleibt die im Netto enthaltene (gleiche Annahmen hin und zurück, § 2e). Pauschbetrag § 2c bleibt 1.230 €/12 (Entscheidung David). Beispiel allein, erstes Kind, 2.000 € netto: Brutto 2.904 €, echte Beiträge 21,75 % = 631,62 €, Pauschale 609,84 € → Elterngeld-Netto 2.021,78 €, Elterngeld 1.248 € statt 1.233 €. Minijob und Übergangsbereich bis 2.000 € brutto unverändert (§ 2f Abs. 2 Satz 2, 3 mit § 344 Abs. 4 SGB III nicht nachgebaut). **Offen** (nicht ohne neue Fragen lösbar): private KV/Beamte (keine Pauschale für KV/RV), Kirchensteuer 8 % statt 9 %, Steuerjahr nach § 2e Abs. 1 (Programmablaufplan vom 1.1. des Vorjahres; für Geburten 2026 fehlt der PAP 2025 in SoLo). Der Betrag bleibt „etwa“. Quellen gesetze-im-internet.de/beeg/__2e.html, __2f.html, Abruf 21.11.2026. Test `rechenbefunde-e2`; `egAbgleich` erklärt den Unterschied zum Schnellrechner jetzt aus Pauschbetrag und Sozialabgaben-Pauschale.
- **E3 (gering):** Das Elterngeld-Netto wird nicht auf den Höchstbetrag des Bemessungseinkommens (2.770 € ohne Teilzeit) begrenzt; wirkt nur über den Höchstbetrag 1.800 € (gleiches Ergebnis ab 2.770 € × 0,65 ≈ 1.800 €).
