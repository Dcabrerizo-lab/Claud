# Farbkonzept (Design „Warm und menschlich“)

Alle Farben stehen als CSS-Variablen an **einer** Stelle: ganz oben in `src/template.html` (`:root`, Dunkelmodus in `@media (prefers-color-scheme: dark)` und `:root[data-theme="dark"]`).
Im übrigen CSS stehen nur Variablen. Ausnahme: Druckstile (`@media print`, Schwarz auf Weiß) und das Logo-SVG.
`npm test` prüft beides mit `tools/kontrast-pruefen.js` (Kontrast aller Paare in hell und dunkel, keine verstreuten Farbwerte). Tabelle: `node tools/kontrast-pruefen.js --tabelle`.

## Regeln
- Dieselbe Sache hat überall dieselbe Farbe (Startkachel, Symbole im Bereich, passende Absender-Kachel).
- Bereichsfarben sind Flächen mit weißer Schrift (`--on-c`), in hell und dunkel gleich. Kontrast mind. 4,5:1.
- Wird eine Bereichsfarbe als Schrift, Rand oder Häkchen auf einer Karte gebraucht: `--c-<bereich>-t` (im Dunkelmodus aufgehellt).
- Farbe ist nie die einzige Information: Jede Kachel hat Symbol und Text, jedes Ergebnis ein Wort („Wahrscheinlich“, „Möglich“ …).
- Petrol (`--accent`) ist zugleich die Bedienfarbe (Knöpfe, Reiter, Auswahl, Vorgänge, Einstellungen).
- Kein Ocker als Bereichsfarbe. Bernstein (`--warn`) nur für „Möglich“ und Warnungen.

## Bereiche
| Bereich | Variable | Fläche (weiße Schrift) | Schrift auf Karte hell / dunkel |
|---|---|---|---|
| Leistungen (Startkarte, Bedienfarbe) | `--c-leistungen` | #0f6b5c Petrol | #0f6b5c / #6fd3bd |
| Ich habe einen Brief bekommen | `--c-briefe` | #a14a2f Ziegel | #a14a2f / #ffb398 |
| Schulden / Pfändung (Mein Lohn, Mein Konto) | `--c-pfaendung` | #7a3b69 Pflaume | #7a3b69 / #f0b4dd |
| Geld sparen (Themen, Schulden, Haushaltsplan) | `--c-sparen` | #2f6b3a Grün | #2f6b3a / #9fdba8 |
| Pflege (Auswahl, Unterstützung) | `--c-pflege` | #23507f Blau | #23507f / #a9cbf3 |
| Ich ziehe aus (neu, Kachel `.sk-ausziehen`, Ansicht `ausziehen`) | `--c-ausziehen` | #5b3f8f Violett (wie Branch claude/ausziehen) | #5b3f8f / #cdb8f0 |

## Absender in „Ich habe einen Brief bekommen“
| Absender | Variable | Farbe | Warum |
|---|---|---|---|
| Jobcenter | `--c-jobcenter` | = Leistungen (Petrol) | Bürgergeld ist eine Leistung |
| Sozialamt | `--c-sozialamt` | #4a47a3 Indigo | eigene Farbe |
| Wohngeldstelle | `--c-wohngeld` | #0e6178 Meerblau | eigene Farbe |
| Familienkasse | `--c-familienkasse` | #a2365e Beere | eigene Farbe (Familie) |
| Pflegekasse | `--c-pflegekasse` | = Pflege (Blau) | gleiche Sache |
| Vermieter | `--c-vermieter` | = Ich ziehe aus (Violett) | Wohnung |
| Anderer Brief / weiß nicht | `--c-anderer` | = Brief bekommen (Ziegel) | allgemeiner Brief |
| Antragsformular | `--c-formular` | #52606d Schiefer | neutral |

## Zustände und Hinweise
| Zweck | Variablen |
|---|---|
| Wahrscheinlich | `--ok` / `--ok-bg` |
| Möglich, Warnung | `--warn` / `--warn-bg` |
| Nicht, Fehler, „fehlt“ | `--bad` / `--bad-bg`, Schrift auf `--bad`: `--bad-on` |
| Keine Angabe, Info | `--na` / `--na-bg` |
| Persönlicher Hinweis, Beratungsmodus (Koralle) | `--hint` / `--hint-bg` |
| Vom Brief erkanntes Feld | `--mark-bg`, `--mark-line`, `--mark-ink` |
| Antragsmappe (Papier bleibt weiß) | `--papier`, `--papier-ink`, `--papier-ink2`, `--papier-link` |
| Fokusrahmen, Feldrand, Kante, Dialog-Hintergrund | `--focus`, `--field`, `--kante`, `--overlay` |
