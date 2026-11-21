# Unabhängige Prüfung PR #127 (Kinderzuschlag: Einkommen der Kinder)

Geprüft: Diff `claude/test-update-naechstes...claude/b-kiz-abgleich`, Bericht `kiz.md`. Alle Quellen abgerufen am 21.11.2026.

| Quelle | Fundstelle |
|---|---|
| § 6a BKGG | https://www.gesetze-im-internet.de/bkgg_1996/__6a.html |
| DA-KiZ, Stand 20.02.2026 | https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf |
| § 6 Grundsicherungsgeld-Verordnung (früher Bürgergeld-V) | https://www.gesetze-im-internet.de/algiiv_2008/__6.html |
| § 11b, § 21 SGB II | https://www.gesetze-im-internet.de/sgb_2/__11b.html, `__21.html` |

## Ergebnis

Freigabe: **ja**, mit den Korrekturen unten. Kein Fehler in den Beträgen. Zwei Rechtsfehler am Rand und die Auftragsdatei sind korrigiert.

## Selbst nachgerechnet (eigenes Skript, nicht der Code der App)

| Fall | Erwartet im Test | Eigene Rechnung | Passt |
|---|---|---|---|
| DA-Beispiel Mia (C.2.2.2.3): 297 − 45 % von 400 | 117 € | 117 € | ja |
| DA-Beispiel Frau T. (C.3.2.1.3 Abs. 4): Bedarf 563 + 202,68 + 252 | 1.017,68 €; Minderung 14,54 € | gleich | ja |
| DA-Beispiel Ehepaar X. (Abs. 5): 891 − 38 − 135 | 718 € | 718 € | ja |
| DA-Beispiel Patchwork (Abs. 6): 252 + 297 − 45 | 504 € | 504 € | ja |
| Fälle 60, 145, 153, 157, 221, 248, 251, 258, 271: Bedarf, Kinderzuschlag mit und ohne Unterhalt | siehe `test/test-faelle.js` | alle 9 gleich auf den Cent | ja |
| Fälle 145, 153, 157 mit 30 € Pauschale je Kind | über 0 € | 17,54 €, 37,57 €, 0,67 € | ja |
| Kinder 14 und 15, 36 % Mehrbedarf | 14,71 € | 14,71 € | ja |
| Spanne, Kind 6 oder 12 Jahre | 170 bis 190 € | 174,94 € und 194,85 € | ja |

Formel und Reihenfolge stimmen mit § 6a Abs. 3, 4 und 6 BKGG und DA-KiZ C.2 Satz 4-6 überein. Wohnanteile (77, 63, 53, 46 %) stehen so in DA-KiZ C.3.1.2.
Rundung: Die Familienkasse rundet den Gesamtbetrag auf volle Euro; unter 0,50 € wird abgelehnt (DA-KiZ E.5 Abs. 2, § 11 Abs. 2 BKGG). Der Bescheid-Check rechnet auf den Cent und duldet 1 € Abweichung. Das reicht.

## Befunde

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Auftragsdatei mit Zeile `gegenprobe:` hätte beim Zusammenführen einen Lauf gegen die Familienkasse gestartet (Workflow reagiert auf jede Änderung der Datei, außer auf main). | hoch | Datei auf den Stand der Basis zurückgesetzt. Der Commit trägt `[skip ci]`, damit auch dieser Push keinen Lauf startet. Fallliste steht nur noch in `kiz.md`. Workflow unverändert. | `.github/workflows/amtlich-kiz.yml` |
| Lohn der Kinder (Ausbildung): SoLo zieht nur einmal 603 € ab. Die Familienkasse zieht je Kind 603 € und dazu bis zu 164 € Freibetrag ab. SoLo sagte deshalb „eher nicht“, wo ein Anspruch besteht (Beispiel: Kind 16, Lohn 700 €, Eltern-Netto 2.300 €, Miete 900 €: rund 8 € Kinderzuschlag). | mittel | Reicht es mit diesen Abzügen, zeigt SoLo „möglich“ (Text `kiz.rand`, kein neuer Text). Test `kiz-kindlohn`. Hinweis im Bescheid-Check (bis 73,80 € mehr je Kind). | § 11b Abs. 2b und Abs. 3 Satz 4 SGB II; DA-KiZ C.2.2.1 Abs. 3 Satz 9-11 |
| Die Texte „Unterhalt oder Unterhaltsvorschuss“ und die 30 € Versicherung erschienen auch, wenn das Kind nur Lohn hat. Für Lohn gilt die Pauschale nicht (603 € treten an ihre Stelle). | mittel | Hinweise und Pauschale nur noch bei Unterhalt, Unterhaltsvorschuss, Waisenrente. Bescheid-Check zählt nur Kinder mit Unterhalt. | § 11b Abs. 2b SGB II; DA-KiZ C.2.2.1 Abs. 3 Satz 3 und 9 |
| Falsche Fundstelle „§ 6 Abs. 1 Nr. 1 Bürgergeld-V“. Für Minderjährige gilt Nr. 2 (nur mit eigener Versicherung). Die Verordnung heißt jetzt Grundsicherungsgeld-Verordnung. | niedrig | Kommentare, Prüfliste und Bericht berichtigt. Die DA-KiZ nennt noch den alten Namen. | § 6 Abs. 1 Nr. 1 und 2 der Verordnung |
| Zwei Kinder von 14 bis 17: 36 % Mehrbedarf möglich. | kein Fehler | Geprüft: greift nur bei genau zwei Kindern (24 % unter 36 %). Wirkt beim Kinderzuschlag („möglich“ statt „eher nicht“, Spanne) und beim Grundsicherungsgeld nur als größerer Puffer für „möglich“. Kein Betrag wird höher zugesagt. | § 21 Abs. 3 Nr. 1 SGB II |
| Texte (Deutsch, Einfache Sprache, Stichprobe en, tr, ar, ru, uk, pl) | kein Fehler | Keine Zusage, überall „kann“ und „Beantrage ihn“. Übersetzungen stimmen inhaltlich. | – |
| Sicherheit und Datenschutz | kein Fehler | Keine neue Speicherung, keine neue Kachel, keine Farbe. Hinweise im Bescheid-Check werden als Text eingefügt (`vorschau.js`, `text:`), nicht als HTML. | – |

## Offen (nicht in diesem PR)

| Punkt | Warum |
|---|---|
| Volljährige Kinder (18 bis 24) mit Unterhalt: 30 € Pauschale auch ohne Versicherung (§ 6 Abs. 1 Nr. 1 der Verordnung) | SoLo zieht sie nicht ab: bis 13,50 € zu vorsichtig, durch „möglich“ und den Hinweis gedeckt |
| Unterhalt sehr ungleich verteilt (ein Kind über 660 €) | Hauptrechner kennt nur die Summe und kann zu niedrig schätzen; Bescheid-Check rechnet je Kind |
| Kind deckt seinen Bedarf selbst und zählt nicht mehr mit (DA-KiZ B.3 Abs. 2) | selten; ändert Wohnanteil und Freibeträge |
| Lohn der Kinder genau rechnen (Brutto je Kind abfragen) | eigener Auftrag; bis dahin „möglich“ |
| Wird der PR als Squash zusammengeführt | `[skip ci]` aus der Commit-Nachricht nehmen, sonst laufen die Tests auf der Basis nicht |
