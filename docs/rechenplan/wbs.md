# Rechenplan Wohnberechtigungsschein (WBS)

Funktionen: `wbs`, `wbsGrenze`. Werte: `R.wbs` (Bayern), `R.wbsLand`, `R.wbsStufen`, `R.wbsBund`; Quellen-Tabelle: [docs/WBS-GRENZEN.md](../WBS-GRENZEN.md).

## Eingaben
Personen (`persons`), Kinder (`children` = Kinder + junge Erwachsene), Brutto des Haushalts im Monat, eigenes Einkommen der Kinder, Bundesland, Grad der Behinderung, Pflegegrad, weitere Schwerbehinderte, gezahlter Unterhalt (nur außerhalb Bayerns), Aufenthalt.

## Rechenschritte
1. Ausreisepflichtig ohne Duldung → nein; Asylverfahren/Duldung → nein mit Hinweis (§ 27 Abs. 2 WoFG, Art. 14 Abs. 2 BayWoFG).
2. Jahreseinkommen = (Brutto + Kinder-Einkommen) × 12.
3. **Bayern:** Grenze = 17.500 € (1 Person) bzw. 27.500 € + 5.000 € je weitere Person, + 1.300 € je Kind (Art. 4 Abs. 1 BayWoBindG). Höchste Grenze = 28.300 / 43.200 / 10.700 / 3.200 € (Art. 11 Abs. 1 BayWoFG, nur per Gemeindeverordnung). Abzug: Jahr × 0,7 − Freibetrag (4.500 € bei GdB 100 oder ≥ 80 mit Pflegegrad, 2.100 € bei GdB ≥ 50 mit Pflegegrad, je weitere Person 2.100 €).
   - Seit 21.11.2026: Abzug = (Jahr − Arbeitnehmer-Pauschbetrag) × 0,7 − 4.000 € je Person mit GdB ab 50 − gezahlter Unterhalt (Art. 5 Abs. 2, 3 BayWoFG).
   - Jahr ≤ Grenze → ja; nach Abzug ≤ Grenze → möglich; nach Abzug ≤ höchste Grenze → möglich (Gebiet mit erhöhtem Bedarf); sonst nein.
4. **Andere Länder mit Landeswerten:** Grenze nach Landesrecht (Tabelle), SH +3.000 € (1 Person) / +2.000 € (2 Personen), RP/SH auf volle 100 € aufgerundet. Jahr ≤ Grenze → ja. Nein nur, wenn das Land eine höchste Stufe hat und Jahr × 0,7 − Freibeträge − gezahlter Unterhalt × 12 > Grenze × Stufenfaktor × 1,05. Sonst möglich. Stufen werden genannt (welche das Brutto sicher, welche nach Abzug vielleicht erreicht).
5. **Land ohne Landeswerte (Saarland):** Bundeswerte § 9 Abs. 2 WoFG (12.000 / 18.000 / 4.100 / 500 €): Jahr ≤ Grenze → ja, sonst möglich (nie nein).

## Grenzwerte
Siehe Tabelle in docs/WBS-GRENZEN.md (Stand 14.11.2026, Quellen je Land). Bayern: Art. 4 BayWoBindG (seit 1.8.2024), Art. 11 BayWoFG.

## Bewusst „möglich“
Brutto über der Grenze, aber nach pauschal 30 % Abzug darunter; Gebiete mit erhöhten Grenzen; Länder ohne höchste Stufe nie „unwahrscheinlich“.

## Befunde
- **WBS1 (mittel, behoben in claude/b-regeln-h12, hier zusammengeführt):** Das Gesamteinkommen nach §§ 20–24 WoFG zieht zuerst die **Werbungskosten** ab (Lohn 1.230 € je Erwerbstätigem, § 21 WoFG i. V. m. § 9a EStG), danach je 10 % (§ 23). Die „Nein“-Schwelle der App (Jahr × 0,7 − Freibeträge) berücksichtigt den Pauschbetrag nicht. Folge: knapp über der Schwelle kann die App „unwahrscheinlich“ sagen, obwohl ein WBS möglich ist. Der andere Zweig claude/b-regeln-h12 ändert das; die neue Referenz markiert den Unterschied als erwartete Abweichung (`wbs-werbungskosten`).
- **WBS2 (mittel, behoben 21.11.2026, claude/b-rechenbefunde):** Bayern zieht gezahlten Unterhalt jetzt ab: Art. 4 Abs. 1 Satz 1 BayWoBindG verweist auf Art. 4 bis 7 BayWoFG; Art. 5 Abs. 3 BayWoFG: mit Titel, Bescheid oder notarieller Vereinbarung der festgelegte Betrag, sonst höchstens 4.000 € je Person außerhalb des Haushalts bzw. 6.000 € für den früheren oder dauernd getrennt lebenden Ehegatten (gesetze-bayern.de BayWoBindG-4, BayWoFG-5, Abruf 21.11.2026). An wen unbekannt: ganz (vorsichtige Seite). Beispiel allein, 3.500 € Lohn: (42.000 − 1.230) × 0,7 = 28.539 € > 28.300 € „eher nicht“; mit 200 € tituliertem Unterhalt 26.139 € „möglich“. Test `rechenbefunde-wbs2`; Referenz ohne erwartete Abweichungen.
- **WBS3 (gering):** Weitere Freibeträge (junge Ehepaare 4.000 €, Kinder unter 12 bei Alleinerziehenden 600 €, § 24 Abs. 1 WoFG) fehlen in der „Nein“-Schwelle. Folge wie WBS1, nur kleiner.
- **WBS4 (gering, behoben 21.11.2026, claude/b-rechenbefunde; Zusatzbefund aus PR #162):** Bayern: 4.000 € je Person mit GdB ab 50, ohne Pflegegrad (Art. 5 Abs. 2 Nr. 1 BayWoFG, gesetze-bayern.de, Abruf 21.11.2026) statt 4.500 / 2.100 € nach § 24 WoFG. Beispiel allein, 3.500 € Lohn, GdB 50 ohne Pflegegrad: vorher „eher nicht“, jetzt „möglich“. Andere Länder unverändert (Muster § 24 WoFG). Tests `rechenbefunde-wbs4`, test-beh.
- **WBS3** bleibt offen: Der bayerische Freibetrag 5.000 € für junge Ehepaare (Art. 5 Abs. 2 Nr. 2 BayWoFG) und die Freibeträge nach § 24 Abs. 1 WoFG fehlen, weil die App Ehe und Ehejahre nicht kennt.
