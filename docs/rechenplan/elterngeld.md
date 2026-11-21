# Rechenplan Elterngeld (BEEG)

Funktionen: `elterngeld`, `elterngeldBerechnen`.

## Eingaben
Baby (bald / da), Netto vor der Geburt (`egVor`), Netto nach der Geburt in Teilzeit (`egNach`), Zahl der Kinder der Geburt (`egKinder`), Kinder unter 6, Bezug von Elterngeld, Aufenthalt.

## Rechenschritte
1. Kein Baby → nein; Elterngeld schon (Einkommensart „eg“) → na; Asyl → möglich ohne Betrag.
2. Ohne Netto vor der Geburt → möglich, Spanne 300 bis 1.800 € (§ 2 Abs. 4, Abs. 1).
3. `elterngeldBerechnen`:
   - Elterngeld-Netto n = Netto − 102,50 € (1/12 des Arbeitnehmer-Pauschbetrags 1.230 €, § 2c Abs. 1).
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
- **E2 (mittel):** Das Elterngeld-Netto entsteht amtlich aus dem Brutto mit pauschalen Abzügen (Lohnsteuer nach Steuerklasse, Sozialabgaben pauschal 21 %, § 2e, § 2f BEEG). SoLo nimmt das angegebene Netto. Bei hohen tatsächlichen Abzügen (z. B. private KV, Kirchensteuer, Steuerklasse V) weicht der Betrag ab.
- **E3 (gering):** Das Elterngeld-Netto wird nicht auf den Höchstbetrag des Bemessungseinkommens (2.770 € ohne Teilzeit) begrenzt; wirkt nur über den Höchstbetrag 1.800 € (gleiches Ergebnis ab 2.770 € × 0,65 ≈ 1.800 €).
