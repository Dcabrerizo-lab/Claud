# Rechenplan Kinderzuschlag (§ 6a BKGG)

Funktionen: `kinderzuschlag` → `kizRechnung` → `kizRechnung0`, `kizMinderungEltern`, `kizWohnanteil`, `wgVorsichtig`.

## Eingaben
Erwachsene, Kinder (unter 6 / 6–13 / 14–17, junge Erwachsene), Brutto und Netto je Person mit Art, Unterhalt/Waisenrente der Kinder, eigenes Einkommen der Kinder, Miete, Vermögen, Alter (Rente/Erwerbsminderung), Mehrbedarfe, Bezug anderer Leistungen, Aufenthalt.

## Rechenschritte
1. Keine Kinder → nein. Bezug Grundsicherungsgeld oder Sozialamt → nein (`kiz.ausschluss`). KiZ schon → na. Asylverfahren/Duldung → nein (kein Kindergeld, § 6a Abs. 1 Nr. 1).
2. Niemand im Haushalt gehört dem Grunde nach zum SGB II (allein, Altersrente oder voll erwerbsgemindert, kein Kind ab 15) → nein; unsichere Fälle (vorgezogene Altersrente, Alter der Kinder offen, Paar mit zwei Rentnern) → höchstens möglich mit Hinweis (§ 6a Abs. 1 Nr. 3 BKGG i. V. m. § 7 SGB II; DA-KiZ D.2, B.1).
3. `kizRechnung`: Vermögensgrenze 55.000 € (bis 2 Personen) bzw. 70.000 € + 15.000 € je weitere Person (Merkblatt KiZ 7/2026); Mindesteinkommen brutto 900 € (Paar) / 600 € (allein) (§ 6a Abs. 1 Nr. 2) → sonst nein.
4. `kizRechnung0`:
   - Bemessungsgrenze der Eltern = Regelbedarf der Eltern + Mehrbedarf Alleinerziehende + Mehrbedarfe der Eltern + Wohnanteil × Miete (Tabelle DA-KiZ C.3.1.2 nach Kinderzahl; allein mit Altersrente: Kopfteil).
   - Höchstbetrag 297 € je Kind (§ 6a Abs. 2) minus Minderung aus Elterneinkommen (`kizMinderungEltern`: Einkommen nach § 11b SGB II über der Bemessungsgrenze, aus Arbeit zu 45 %, anderes Einkommen voll, § 6a Abs. 6) minus 45 % des Kinder-Einkommens (Unterhalt voll, Lohn über Minijob-Grenze; § 6a Abs. 3).
   - Spanne: zweite Rechnung mit dem höheren Mehrbedarf Alleinerziehende (36 % statt 12 %, Alter der Kinder nur grob bekannt).
   - Schätzung ≤ 0: Sonderfälle „möglich“ (Kind evtl. erst 6, Versicherungspauschale 30 € beim Kinder-Einkommen, Lohn der Kinder mit Freibeträgen), sonst nein.
   - Hilfebedürftigkeit muss enden (§ 6a Abs. 1 Nr. 3): bereinigtes Elterneinkommen + Kindergeld + Kinder-Einkommen + KiZ + vorsichtiges Wohngeld (`wgVorsichtig`, auch fiktiv, DA-KiZ C.4.1 Abs. 7) + erweiterter Zugang 100 € (§ 6a Abs. 1a, nur wenn Freibetrag aus Arbeit ≥ 100 €) < Gesamtbedarf → möglich mit „Einkommen eher zu niedrig“.
   - Reicht es nur mit Wohngeld → möglich (`kiz.mitWg`); Schätzung ≥ 60 € → ja; darunter → möglich (`kiz.rand`).
5. Vermögen knapp über der Grenze (§ 6a Abs. 3 Satz 5–7: nur der erste Monat gemindert) → höchstens möglich, sonst nein.

## Grenzwerte
| Wert | Betrag | Fundstelle |
|---|---|---|
| Höchstbetrag | 297 € je Kind | § 6a Abs. 2 BKGG (2026) |
| Anrechnung | 45 % (Arbeit, Kinder-Einkommen), sonst 100 % | § 6a Abs. 3, 6 BKGG |
| Mindesteinkommen | 900 € / 600 € brutto | § 6a Abs. 1 Nr. 2 BKGG |
| Erweiterter Zugang | 100 € | § 6a Abs. 1a BKGG |
| Wohnanteil Eltern | Tabelle 1 Kind 0,77 / 0,83 … | DA-KiZ C.3.1.2, Stand 20.02.2026 |
| Vermögen | 55.000 / 70.000 / +15.000 € | Merkblatt KiZ 7/2026, § 6a Abs. 3 Satz 5–7 |

## Bewusst „möglich“
Wohngeld nötig, kleine Schätzung, Alter der Kinder offen, Kinder-Einkommen knapp, vorgezogene Altersrente, Vermögen knapp, Hilfebedürftigkeit nicht sicher beendet.

## Befunde
- **K1 (mittel):** Erwarteter, noch nicht gezahlter Unterhaltsvorschuss wird nicht als Kinder-Einkommen eingerechnet (nur gezahlter Unterhalt `kindZahl`). Die Familienkasse rechnet einen beantragten UVG ein (§ 6a Abs. 3 BKGG; docs/entwuerfe/entweder-oder.md Befund 5). Folge: KiZ-Schätzung bei Alleinerziehenden mit UVG-Anspruch zu hoch.
- **K2 (gering):** Wohnanteil bei Paaren mit einer Person in Altersrente nach Tabelle statt Kopfteil (im Code begründet: Abweichung unter 1 %).
