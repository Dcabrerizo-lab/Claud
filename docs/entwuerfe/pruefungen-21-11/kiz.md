# Prüfung Kinderzuschlag: SoLo gegen KiZ-Lotse (21.11.2026)

Zweig `claude/b-kiz-abgleich`. Quellen (abgerufen 21.11.2026): § 6a BKGG (gesetze-im-internet.de), Durchführungsanweisung Kinderzuschlag
DA-KiZ Stand 20.02.2026 (arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf).

## Kurz

| Frage | Antwort |
|---|---|
| Wer hat recht bei den 9 Widersprüchen? | **SoLo.** Die Familienkasse rechnet Unterhalt und Unterhaltsvorschuss der Kinder zu 45 % an. |
| Warum sagt der KiZ-Lotse „Aussicht auf Erfolg“? | Er rechnet das Einkommen der Kinder **gar nicht** ein (Gegenprobe unten). |
| Was ist geändert? | Knappe Fälle jetzt „möglich“ mit Hinweis, sonst „eher nicht“ mit Erklärung; Betrag als Spanne, wenn das Alter der Kinder nur grob bekannt ist; ein Fehler beim Mehrbedarf behoben. |

## 1. Rechtslage

| Punkt | Regel | Fundstelle |
|---|---|---|
| Einkommen des Kindes | mindert nur den Kinderzuschlag **dieses** Kindes, um 45 % | § 6a Abs. 3 BKGG; DA-KiZ C.2.2.1 Abs. 1 und 5 |
| Abzüge davon | „in der Regel ohne Abzüge oder Absetzbeträge“, Ausnahme 30 € Versicherungspauschale, wenn das Kind versichert ist | DA-KiZ C.2.2.1 Abs. 3 Satz 3; § 6 Abs. 1 Nr. 2 Grundsicherungsgeld-Verordnung (früher Bürgergeld-V) |
| Kindergeld, Wohngeld | zählen nicht als Einkommen des Kindes | DA-KiZ C.2.2.1 Abs. 2 |
| Reihenfolge | erst jedes Kind (höchstens bis 0), dann Summe minus 45 % des Elterneinkommens über dem Bedarf | DA-KiZ C.2 Satz 4-6 |
| Bedarf der Eltern | Regelbedarf + Mehrbedarf Alleinerziehende + Wohnanteil nach Tabelle (z. B. 63 % bei 2 Kindern) | DA-KiZ C.3.1.1 und C.3.1.2 |

Beispiele der DA-KiZ nachgerechnet (jetzt als Tests): Mia (400 € Unterhalt → 297 − 180 = 117 €), Frau T. (Minderung 14,54 €),
Ehepaar X. (718 €), Patchwork (504 €). SoLo trifft alle auf den Cent.

## 2. Gegenprobe beim KiZ-Lotsen (Lauf auf GitHub, 27 Abfragen)

Dieselbe Familie mit Unterhalt, ohne Unterhalt und mit 1.000 € je Kind:

| Fall | Lotse mit | Lotse ohne | Lotse 1.000 € | SoLo mit | SoLo ohne |
|---|---|---|---|---|---|
| 60, 145, 153, 157, 221, 248, 251, 258, 271 | ja | ja | ja | 0 € | 4 bis 579 € |

Der Lotse ändert sein Ergebnis in **keinem** Fall. Das passt zu früheren Läufen (888 Familien mit Unterhalt: ohne Unterhalt gerechnet
0 Widersprüche, mit Unterhalt 99).

## 3. Beispielrechnung Fall 60

Alleinerziehend, Kinder 12 und 14, Netto 2.988 €, Unterhalt 350 € je Kind, Warmmiete 1.060 €.

| Schritt | Betrag |
|---|---|
| Bedarf Eltern: 563 + 36 % Mehrbedarf 202,68 + 63 % von 1.060 = 667,80 | 1.433,48 € |
| Einkommen Eltern: 2.988 − Freibetrag 378 | 2.610,00 € |
| Kinderzuschlag je Kind: 297 − 45 % von 350 (157,50) | 2 × 139,50 = 279,00 € |
| Minderung Eltern: 45 % von 1.176,52 | 529,43 € |
| **Kinderzuschlag** | **0 €** (ohne Unterhalt wären es 64,57 €) |

## 4. Was SoLo jetzt zeigt

| Fall | vorher | jetzt |
|---|---|---|
| 145, 153, 157 (reicht mit 30 € Versicherungspauschale je Kind) | eher nicht | **möglich**, Hinweis auf die Pauschale |
| 60, 221, 248, 251, 258, 271 | eher nicht | eher nicht, **mit Erklärung**: ohne Unterhalt gäbe es etwas; Online-Rechner ohne dieses Einkommen zeigen eher einen Anspruch |

Grenze „knapp“: 45 % von 30 € = 13,50 € je Kind mit Einkommen (Versicherungspauschale, die SoLo nicht abfragt). Gesetzlich begründet,
keine geschätzte Toleranz.

## 5. Die 7 „intern“-Fälle (Hauptrechner gegen Bescheid-Check)

| Ursache | Richtig | Angleichung |
|---|---|---|
| Hauptrechner kennt das Alter nur grob (unter 6 / 14-17). Ein Kind von 6 oder zwei Kinder unter 16 geben 36 % Mehrbedarf statt 12 % oder 24 %. | Bescheid-Check (genaues Alter) | Hauptrechner zeigt jetzt eine **Spanne** (Fall 30: 170 bis 190 €, Bescheid-Check 194,85 €, gerundet 190 €). Nach Änderung: 0 Fälle. |

Dabei gefunden und behoben: Bei **zwei Kindern von 14 bis 17** (beide vielleicht unter 16) rechnete SoLo nur mit 24 % und konnte
fälschlich „eher nicht“ sagen (Kinderzuschlag und Grundsicherungsgeld). Test `kiz-ae16`.

## 6. Ergebnis neu gegen Lauf 1 (300 Familien)

| | vorher | jetzt |
|---|---|---|
| gleich | 163 | 163 |
| SoLo „möglich“ | 128 | 131 |
| Widerspruch | 9 | **0** (6 als „erklärt durch Einkommen der Kinder“ gezählt) |
| intern > 10 € | 7 | **0** |

## 7. Werkzeug und Workflow

- Gegenproben kommen direkt nach ihrer Familie; das Werkzeug hört nach 105 min geordnet auf (Workflow-Zeitlimit 120 min bleibt; Vorgabe:
  Workflow nicht ändern). Damit passen etwa 260 Abfragen, Paare sind immer vollständig.
- Eine Zeile `gegenprobe: 60,145,…` in der Auftragsdatei bewirkt: ein push-Lauf fragt nur diese Familien ab (je 3 Abfragen, höchstens 13 Familien).
  Die Auftragsdatei steht im PR wieder auf dem Stand der Basis (Prüfung 21.11.2026), damit beim Zusammenführen kein Lauf startet.
  Fallliste von Lauf 2 nur hier: `60,145,153,157,221,248,251,258,271`.
- Widersprüche, die nur am Einkommen der Kinder liegen, zählt die Auswertung getrennt.

## Offen

| Punkt | Warum offen |
|---|---|
| Ausbildungsvergütung der Kinder: SoLo zieht nur 603 € ab, nicht den Erwerbstätigenfreibetrag darüber (DA-KiZ C.2.2.1 Abs. 3 Satz 9-11) | seit der Prüfung (kiz-pr127.md): reicht es mit dem Freibetrag (höchstens 164 € je Kind), „möglich“ statt „eher nicht“; genaue Rechnung bleibt eigener Auftrag |
| Kind deckt mit 45 % seines Einkommens und Kindergeld den eigenen Bedarf → zählt nicht mehr mit (DA-KiZ B.3 Abs. 2) | seltener Fall, Wohnanteil ändert sich |
| Unterhalt sehr ungleich verteilt (ein Kind über 660 €) | Hauptrechner kennt nur die Summe; Bescheid-Check rechnet je Kind |
| Auftragsdatei | erledigt: im PR auf den Stand der Basis zurückgesetzt (Commit mit `[skip ci]`, damit auch dieser Push keinen Lauf startet) |
