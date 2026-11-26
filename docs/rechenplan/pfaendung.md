# Rechenplan Pfändung (Lohn und P-Konto)

Funktionen: `pfaendFreibetrag`, `pfaendung`, `pkonto` (Werte `R.pfaendung`).

## Eingaben
Nettolohn im Monat, Zahl der Personen, denen Unterhalt gezahlt wird (0–5, mehr zählt wie 5); P-Konto: zusätzlich Kinder mit Kindergeld und – nur wenn Kindergeld-Kinder angegeben sind – der Kinderzuschlag im Monat (Feld, leer = 0; seit 24.11.2026 abgefragt).

## Rechenschritte Lohn (§ 850c ZPO)
1. Freibetrag = 1.587,40 € + 597,42 € (erste unterhaltsberechtigte Person) + 332,83 € je zweite bis fünfte Person (§ 850c Abs. 1, 2; Pfändungsfreigrenzenbekanntmachung 2026).
2. Netto (höchstens 4.866,30 €) auf volle 10 € abrunden (Stufen der amtlichen Tabelle).
3. Liegt die Stufe über dem Freibetrag: pfändbar = (Stufe − Freibetrag) × Quote, auf Cent gerundet. Quote = 7/10 ohne Unterhalt, 5/10 bei 1, 4/10 bei 2, 3/10 bei 3, 2/10 bei 4, 1/10 bei 5 Personen (§ 850c Abs. 3).
4. Netto über 4.866,30 €: der Teil darüber ist voll pfändbar (§ 850c Abs. 3 Satz 2).
5. Ergebnis: pfändbar, bleibt (= Netto − pfändbar), Freibetrag, Hinweis „über Höchstgrenze“.

## Rechenschritte P-Konto (§§ 899, 902 ZPO)
- Sockel = Grundfreibetrag auf volle 10 € aufgerundet (1.590 €, § 899 Abs. 1).
- Erhöhung mit Bescheinigung: 597,42 € + 332,83 € je weitere Person (wie § 850c), + 259 € Kindergeld je Kind, + Kinderzuschlag (§ 902 Satz 1 Nr. 1, 5).
- Gesamt = Sockel + Unterhalt + Kindergeld + Kinderzuschlag.

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Grundfreibetrag | 1.587,40 € | § 850c Abs. 1 ZPO, Bekanntmachung vom 19.3.2026 (BGBl. 2026 I Nr. 80), gültig 1.7.2026–30.6.2027 |
| Erhöhung 1. / 2.–5. Person | 597,42 / 332,83 € | § 850c Abs. 2 ZPO, ebd. |
| Höchstgrenze | 4.866,30 € | § 850c Abs. 3 ZPO, ebd. |
| P-Konto-Sockel | 1.590 € | § 899 Abs. 1 ZPO (aufgerundet auf 10 €) |

## Bewusst „möglich“ / Hinweise
Keine Einstufung, nur Beträge. Pfändung wegen Unterhalt (§ 850d), unpfändbare Bezüge (§ 850a) und Erhöhung durch das Gericht (§ 850f) nur als Hinweise.

## Befunde
- Keine Abweichung gefunden. Die neue unabhängige Referenz (`test/referenz.js`, `pfaendung`, `pkonto`) rechnet nach dem Gesetzestext und stimmt in allen Zufallsfällen auf den Cent überein.
- **P1 (Hinweis):** Werte gelten bis 30.6.2027 (`gueltigBis`); die neue Bekanntmachung zum 1.7.2027 muss rechtzeitig eingetragen werden.
