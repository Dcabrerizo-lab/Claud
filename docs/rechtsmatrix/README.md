# Rechtsmatrix SoLo – feste Grundlage für Vollprüfungen

Stand: 24.11.2026 (erste Vollprüfung). Geltendes Recht an diesem Tag; Werte ab 1.1.2027 erscheinen erst ab 1.1.2027.

## Wozu
Die Matrix hält für jede Haushalts-/Familienkonstellation × Leistung fest: Anspruch (ja / möglich / nein), Rechtsgrundlage mit Paragraf, Betrag mit amtlicher Quelle und Abrufdatum, Vorrang/Nachrang und Anrechnung. Jede Aktualitätsprüfung (1.12.2026, 20.12.2026, jedes Release) schreibt diese Dateien fort, statt neu zu suchen.

## Teile
| Gebiet | Matrix | Dauerhafte Tests |
|---|---|---|
| Familienleistungen (Kindergeld, Kinderzuschlag, Elterngeld, Mutterschaftsgeld, UVG, Bildung und Teilhabe) | `familie.md` | `test/test-rechtsmatrix-familie.js` |
| Grundsicherungsgeld, Sozialhilfe, Wohngeld, WBS, Rundfunk, BAföG/BAB, AsylbLG | `grusi.md` | `test/test-rechtsmatrix-grusi.js` |
| Pflege (SGB XI), Hilfe zur Pflege, Grundsicherung im Alter, Rente, Schwerbehinderung | `pflege.md` | `test/test-rechtsmatrix-pflege.js` |
| Pfändung, P-Konto, Schulden, Fristen, Briefe, Bescheid-Prüfer, Antragsmappe | `schulden.md` | `test/test-rechtsmatrix-schulden.js` |
| Texte und 13 Sprachen (Zahlen, Paragrafen, Anrede) | `texte.md` | `test/test-rechtsmatrix-texte.js` |

Die Tests laufen in jeder CI (`test/listen/regeln.txt`). Ändert sich Recht, wird zuerst die Matrix mit Quelle angepasst, dann Code und Testfälle (`test/rechtsmatrix/*.json`).

## Ablauf einer Vollprüfung
Prüfauftrag im Projekt: `claude/pruefprompt-vollpruefung.md`. Kurzfassung:
1. Je Gebiet ein Prüfer, parallel eine unabhängige Blindprüfung (Fable), die die anderen Ergebnisse nicht sieht.
2. Soll aus Gesetz und amtlicher Quelle ableiten, dann die Regeln (`src/rules.js`) ausführen und vergleichen.
3. Befunde zusammenführen, jeden Befund vor der Korrektur an der Quelle verifizieren.
4. Korrigieren, Matrix und Testfälle fortschreiben, CI grün, gebündelt mergen.

## Status-Werte der App
`ja` = wahrscheinlich · `vielleicht` = möglich · `nein` = eher nicht · `na` = nicht zutreffend (siehe `ORDER` in `src/rules.js`).
