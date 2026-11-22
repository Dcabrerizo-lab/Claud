# Rechenplan Wohngeld (WoGG)

Funktionen: `wohngeld` → `wohngeld0` → `wgEinkommen`, `wgMiete`, `wgBetrag`, `wgYmax`, `wgUeber12`, `wgVorsichtig`.

## Eingaben
Personenzahl (`persons` = Erwachsene + Kinder + junge Erwachsene), Warmmiete, Heizkosten (freiwillig, nur gültig wenn kleiner als die Warmmiete), Mietenstufe (oder aus PLZ), Einkommen je Person (Art, Brutto, Netto, „nur Auszahlung bekannt“), Unterhalt und Waisenrente der Kinder (`kindZahl`), eigenes Einkommen der Kinder (`kindEink`), gezahlter Unterhalt (`uzBetrag`, Titel ja/nein), Kapitalerträge, Vermögen, Grad der Behinderung, Pflegegrad, weitere Schwerbehinderte, Grundrentenzeiten, Bezug anderer Leistungen, Aufenthalt, Wohnform.

## Rechenschritte (Reihenfolge wie im Code)
1. Ausschlüsse: ausreisepflichtig ohne Duldung (§ 3 Abs. 5 WoGG) → nein; Asylbewerberleistungen mit Wohnkosten (§ 7 Abs. 1 Satz 1 Nr. 8) → nein; Bezug Grundsicherungsgeld oder Sozialamt (§ 7 Abs. 1) → nein; Wohngeld schon → na; bei den Eltern / im Wohnheim → nein.
2. Vermögen über 60.000 € + 30.000 € je weiterer Person → nein (Regelvermutung WoGVwV zu § 21 Nr. 3; im Gesetz keine Zahl).
3. § 20 Abs. 2: allein, ohne Kinder, eigene BAföG-/BAB-fähige Ausbildung → nein. Keine Miete → nein.
4. `wgEinkommen`:
   - Miete M (`wgMiete`): Bruttokaltmiete = Warmmiete − Heizkosten (ohne Angabe: − Heizkostenkomponente), höchstens Höchstbetrag (Anlage 1 zu § 12 + Klimakomponente § 12 Abs. 7), plus Heizkostenkomponente (§ 12 Abs. 6). Für „wahrscheinlich“ 90 % der Bruttokaltmiete (ohne Heizkosten-Angabe), für „möglich“ 100 %. Ohne Mietenstufe: Stufe I für „wahrscheinlich“, Stufe VII für „möglich“.
   - Grenzwert `wgYmax`: höchstes Einkommen Y mit Wohngeld ≥ 9,50 € ungerundet (§ 21 Nr. 1: unter 10 € kein Wohngeld; Anlage 3 Nr. 3 kaufmännisch).
   - Einkommen je Person: Werbungskosten-Pauschbetrag (§ 14 Abs. 1 i. V. m. § 9a EStG: Lohn/Werkstatt 1.230 €, Renten 102 € im Jahr, einmal je Person), Elterngeld bis 300 € frei (§ 10 Abs. 1 BEEG, je Mehrling), dann Pauschalabzug § 16 je Art: Lohn 10–30 %, Rente/Krankengeld 10–20 %, ALG I/Elterngeld 0 %, Werkstatt 0–10 %, Unterhalt für sich 0–20 % (nur Auszahlung bekannt: eigene, kleinere Sätze). „Wahrscheinlich“ (yPess) mit kleinem, „möglich“ (yOpt) mit größtem Abzug der Person.
   - Freibeträge § 17: 150 €/Monat bei GdB 100 oder GdB ≥ 50 mit Pflegegrad (je weiterer Person ebenso), 110 €/Monat Alleinerziehende (Nr. 3); Grundrentenfreibetrag § 17a (100 € + 30 %, höchstens 50 % RS1, höchstens die gesetzliche Rente).
   - Kinder: Unterhalt/Waisenrente voll (§ 14), eigenes Einkommen minus 1.230 €/12 und Freibetrag 100 €/Monat (§ 17 Nr. 4), Kapitalerträge über 100 €/Jahr (§ 14 Abs. 2 Nr. 15). Gezahlter Unterhalt mindert (§ 18: 250 € je Kind, 500 € Ex-Partner; ohne Titel nur für „möglich“).
5. Einkommen über der oberen Grenze (yOpt > yMaxHi) → nein. yPess ≤ yMaxLo → ja, sonst vielleicht.
6. Betrag (nur mit bekannter Mietenstufe): § 19 Abs. 1 `1,15 × (M − (a + b·M + c·Y)·Y)` mit a, b, c aus Anlage 2, Mindestwerte M/Y aus Anlage 3; mit yPess und yOpt → Spanne; über 12 Personen + 65 € je Person (§ 19 Abs. 3).
7. Plausibilität (Nr. 15.01 WoGVwV, BMI-Hinweise 11.03.2020): Einnahmen + Kindergeld + Kinder-Einkommen − gezahlter Unterhalt + vorsichtiges Wohngeld < Miete + 80 % Regelbedarf → „möglich“ mit Hinweis „Einkommen eher zu niedrig“, Betrag bleibt.
8. Danach (`kartenHinweise`, `besondere`): Hinweis „früh beantragen“ (§ 25 Abs. 2); Eigentum/Verwandte → höchstens möglich; zukünftige Leistung (ALG/Krankengeld/Elterngeld) → zweite Rechnung, bei Unterschied „möglich“.

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Höchstbeträge, Klima-, Heizkostenkomponente | Tabelle `HOECHST`, `KLIMA`, `HEIZ` | Anlage 1 zu § 12, § 12 Abs. 6, 7 WoGG (Fassung 1.1.2025) |
| Formelwerte a, b, c; Mindest-M/Y | `WGF`, `WG_MMIN`, `WG_YMIN` | Anlage 2 und 3 WoGG |
| Mindestbetrag | 10 € (Rechengrenze 9,50 €) | § 21 Nr. 1, Anlage 3 Nr. 3 |
| Vermögen | 60.000 € + 30.000 € je weitere Person | WoGVwV Nr. 21.37 (Sekundärquelle, kein Gesetzeswert) |
| Freibeträge | 1.800 €/Jahr (Behinderung), 1.320 €/Jahr (Alleinerziehende), 1.200 €/Jahr (Kinder-Erwerbseinkommen) | § 17 Nr. 1, 3, 4 WoGG |
| Unterhalt (gezahlt) | 3.000 €/Jahr je Kind, 6.000 €/Jahr Ex-Partner | § 18 WoGG |

## Wo SoLo bewusst „möglich“ sagt
Mietenstufe unbekannt; Einkommen zwischen kleinem und großem Pauschalabzug; Plausibilität unterschritten; Eigentum (Lastenzuschuss § 10), Verwandte im Haushalt; Asylverfahren/Duldung; unterschiedliches Ergebnis mit künftiger Leistung.

## Befunde
- **W1 (gering):** Vermögensgrenze 60.000/30.000 € ist nur die Regelvermutung der Verwaltungsvorschrift; das Gesetz (§ 21 Nr. 3) nennt keinen Betrag. So im Code dokumentiert.
- **W2 (gering):** Nur eine Person mit Behinderung wird beim Freibetrag § 17 Nr. 1 genau erfasst (weitere über `bhWeitere`).
- **W3 (offen):** Die Warmmiete dient als Näherung der Bruttokaltmiete + Heizkosten; ohne Heizkosten-Angabe wird die Heizkostenkomponente abgezogen (kann bei hohen Heizkosten zu niedrig sein, deshalb 90 % für „wahrscheinlich“).
