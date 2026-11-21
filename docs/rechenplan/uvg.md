# Rechenplan Unterhaltsvorschuss (UVG)

Funktionen: `unterhaltsvorschuss` → `uvgKarte`.

## Eingaben
Kinder unter 18 nach Altersgruppe (unter 6, 6–13, 14–17), „Kind ab 12“, Haken „anderer Elternteil zahlt nicht (genug)“, gezahlter Unterhalt (Summe), Waisenrente, zweite erwachsene Person (neuer Partner / Ehe / anderer Elternteil), Wechselmodell, eigenes Einkommen der Kinder, eigenes Brutto des Elternteils, Grundsicherungsgeld-Ergebnis, Aufenthalt.

## Rechenschritte
1. Keine Kinder unter 18 → nein (§ 1 Abs. 1 Nr. 1). Haken fehlt: ohne Waisenrente → nein; mit Waisenrente → wie mit Haken, höchstens möglich.
2. Ehe/Partnerschaft mit neuem Partner → nein (§ 1 Abs. 1 Nr. 2). Zusammenleben mit dem anderen Elternteil, ein Kind → nein (§ 1 Abs. 3); mehrere Kinder → möglich. Wechselmodell ab 40 % (BVerwG 12.12.2023, 5 C 9.22), ein Kind → nein.
3. Höchstmöglicher Betrag = Kinder unter 6 × 227 € + 14–17 × 394 € + 6–13 × 299 € (bzw. 394 €, wenn ein Kind 12 sein kann) (§ 2 Abs. 1, 2: Mindestunterhalt minus Kindergeld 259 €).
4. Anrechnung Unterhalt + Waisenrente (§ 2 Abs. 3): ein Kind und Anrechnung ≥ Höchstbetrag → nein; eigenes Einkommen eines Kindes nach der Schule (− 102,50 €, Azubi − 100 €, davon die Hälfte, § 2 Abs. 4) + Unterhalt ≥ Höchstbetrag → nein.
5. Ab 12 (§ 1 Abs. 1a): kein Grundsicherungsgeld des Kindes (sicher nur, wenn es an Einkommen/Vermögen scheitert) oder eigenes Brutto des Elternteils ≥ 600 € → sonst möglich mit Hinweis.
6. Möglich bei: Zusammenleben mit dem anderen Elternteil (mehrere Kinder), Teilanrechnung, zweite Person ohne Angabe, Wechselmodell bei mehreren Kindern, ab 12 unsicher, Kinder-Einkommen. Sonst ja mit Beträgen je Altersstufe.
7. Asyl/Duldung → höchstens möglich (§ 1 Abs. 2a).

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Beträge 2026 | 227 / 299 / 394 € | § 2 Abs. 1, 2 UVG; Mindestunterhalt 486/558/653 € (Mindestunterhaltsverordnung) − 259 € |
| Ab 12: Einkommen Elternteil | 600 € brutto | § 1 Abs. 1a Nr. 2 UVG |
| Kinder-Einkommen | − 102,50 € (− 100 € Azubi), Hälfte | § 2 Abs. 4 UVG |
| Rückwirkung | 1 Monat | § 4 UVG |

## Bewusst „möglich“
Mehrere Kinder mit Summen-Unterhalt, ab 12, Waisenrente ohne Haken, zweite Person ohne Angabe, Asyl.

## Befunde
- **U1 (mittel, behoben 21.11.2026, claude/b-rechenbefunde):** Erwarteter UVG wurde schon angerechnet (`uvgEst` in `kindZahl`, für Grundsicherungsgeld, KiZ und Wohngeld). Offen war der mögliche, nicht sichere UVG (siehe G2, K1); beim Wohngeld zählt er jetzt in der vorsichtigen Schätzung `yPess` mit (§ 14 Abs. 2 Nr. 21 WoGG, Abruf 21.11.2026). Beispiel Paar, Kind unter 6, 2.800 € brutto, zweite Person ohne Angabe: Wohngeld vorher „wahrscheinlich“, jetzt „möglich“. Test `rechenbefunde-u1`.
- **U2 (gering):** Gezahlter Unterhalt ist nur als Summe bekannt; Anrechnung je Kind (§ 2 Abs. 3) nur für ein Kind genau.
- Hinweis: Änderungen am UVG plant ein anderer Zweig (claude/b-regeln-h12); hier nicht angefasst.
