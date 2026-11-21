# Rechenplan Wohnberechtigungsschein (WBS)

Funktionen: `wbs`, `wbsGrenze`. Werte: `R.wbs` (Bayern), `R.wbsLand`, `R.wbsStufen`, `R.wbsBund`; Quellen-Tabelle: [docs/WBS-GRENZEN.md](../WBS-GRENZEN.md).

## Eingaben
Personen (`persons`), Kinder (`children` = Kinder + junge Erwachsene), Brutto des Haushalts im Monat, eigenes Einkommen der Kinder, Bundesland, Grad der Behinderung, Pflegegrad, weitere Schwerbehinderte, gezahlter Unterhalt (nur außerhalb Bayerns), Aufenthalt.

## Rechenschritte
1. Ausreisepflichtig ohne Duldung → nein; Asylverfahren/Duldung → nein mit Hinweis (§ 27 Abs. 2 WoFG, Art. 14 Abs. 2 BayWoFG).
2. Jahreseinkommen = (Brutto + Kinder-Einkommen) × 12.
3. **Bayern:** Grenze = 17.500 € (1 Person) bzw. 27.500 € + 5.000 € je weitere Person, + 1.300 € je Kind (Art. 4 Abs. 1 BayWoBindG). Höchste Grenze = 28.300 / 43.200 / 10.700 / 3.200 € (Art. 11 Abs. 1 BayWoFG, nur per Gemeindeverordnung). Abzug: Jahr × 0,7 − Freibetrag (4.500 € bei GdB 100 oder ≥ 80 mit Pflegegrad, 2.100 € bei GdB ≥ 50 mit Pflegegrad, je weitere Person 2.100 €).
   - Jahr ≤ Grenze → ja; nach Abzug ≤ Grenze → möglich; nach Abzug ≤ höchste Grenze → möglich (Gebiet mit erhöhtem Bedarf); sonst nein.
4. **Andere Länder mit Landeswerten:** Grenze nach Landesrecht (Tabelle), SH +3.000 € (1 Person) / +2.000 € (2 Personen), RP/SH auf volle 100 € aufgerundet. Jahr ≤ Grenze → ja. Nein nur, wenn das Land eine höchste Stufe hat und Jahr × 0,7 − Freibeträge − gezahlter Unterhalt × 12 > Grenze × Stufenfaktor × 1,05. Sonst möglich. Stufen werden genannt (welche das Brutto sicher, welche nach Abzug vielleicht erreicht).
5. **Land ohne Landeswerte (Saarland):** Bundeswerte § 9 Abs. 2 WoFG (12.000 / 18.000 / 4.100 / 500 €): Jahr ≤ Grenze → ja, sonst möglich (nie nein).

## Grenzwerte
Siehe Tabelle in docs/WBS-GRENZEN.md (Stand 14.11.2026, Quellen je Land). Bayern: Art. 4 BayWoBindG (seit 1.8.2024), Art. 11 BayWoFG.

## Bewusst „möglich“
Brutto über der Grenze, aber nach pauschal 30 % Abzug darunter; Gebiete mit erhöhten Grenzen; Länder ohne höchste Stufe nie „unwahrscheinlich“.

## Befunde
- **WBS1 (mittel):** Das Gesamteinkommen nach §§ 20–24 WoFG zieht zuerst die **Werbungskosten** ab (Lohn 1.230 € je Erwerbstätigem, § 21 WoFG i. V. m. § 9a EStG), danach je 10 % (§ 23). Die „Nein“-Schwelle der App (Jahr × 0,7 − Freibeträge) berücksichtigt den Pauschbetrag nicht. Folge: knapp über der Schwelle kann die App „unwahrscheinlich“ sagen, obwohl ein WBS möglich ist. Der andere Zweig claude/b-regeln-h12 ändert das; die neue Referenz markiert den Unterschied als erwartete Abweichung (`wbs-werbungskosten`).
- **WBS2 (mittel):** In **Bayern** wird gezahlter Unterhalt (§ 24 Abs. 2 WoFG bzw. Art. 5 BayWoFG i. V. m. WoFG) bei der „Nein“-Schwelle nicht abgezogen, in den anderen Ländern schon. Referenz-Abweichung `wbs-by-unterhalt`.
- **WBS3 (gering):** Weitere Freibeträge (junge Ehepaare 4.000 €, Kinder unter 12 bei Alleinerziehenden 600 €, § 24 Abs. 1 WoFG) fehlen in der „Nein“-Schwelle. Folge wie WBS1, nur kleiner.
- **WBS4 (gering):** Die bayerischen Freibeträge 4.500 / 2.100 € sind nach dem Muster § 24 WoFG gesetzt; Code-Kommentar verlangt fachliche Prüfung. Sie wirken nur auf „möglich“.
