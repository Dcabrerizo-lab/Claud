# Farbkonzept (Design „Warm und menschlich“)

Alle Farben stehen als CSS-Variablen an **einer** Stelle: ganz oben in `src/template.html` (`:root`, Dunkelmodus in `@media (prefers-color-scheme: dark)` und `:root[data-theme="dark"]`).
Im übrigen CSS stehen nur Variablen. Ausnahme: Druckstile (`@media print`, Schwarz auf Weiß) und das Logo-SVG.
`npm test` prüft beides mit `tools/kontrast-pruefen.js` (Kontrast aller Paare in hell und dunkel, keine verstreuten Farbwerte). Tabelle: `node tools/kontrast-pruefen.js --tabelle`.

## Regeln
- Dieselbe Sache hat überall dieselbe Farbe (Startkachel, Symbole im Bereich, passende Absender-Kachel).
- Bereichsfarben sind Flächen mit weißer Schrift (`--on-c`), in hell und dunkel gleich. Kontrast mind. 4,5:1.
- Wird eine Bereichsfarbe als Schrift, Rand oder Häkchen auf einer Karte gebraucht: `--c-<bereich>-t` (im Dunkelmodus aufgehellt).
- Farbe ist nie die einzige Information: Jede Kachel hat Symbol und Text, jedes Ergebnis ein Wort („Wahrscheinlich“, „Möglich“ …).
- Petrol (`--accent`) ist die Bedienfarbe (Knöpfe, Reiter, Auswahl, Links) und heißt nur noch „hier kannst du tippen“. Plaketten und Hinweise sind nie Petrol.
- **Farbige Kacheln gibt es nur auf der Startseite. Dort kommt keine Farbe doppelt vor** (Regel des Nutzers, 20.11.2026; seit der Design-Prüfung vom 20.11.2026 nur noch für die Startseite). `tools/kontrast-pruefen.js` liest die Startkacheln (`class="sk sk-<name>"`) und ihre Farbe (`.sk-<name> { --c: var(--…); }`), prüft „keine Farbe doppelt“ und den Abstand bei Rot- und Grünschwäche (siehe unten).
- **Unterseiten** (alles unter einer Startkachel) haben weiße Karten `.uk-karte` in Form und Größe der Startkacheln; das Linien-Symbol trägt die Farbe des Bereichs (`--uk`), es gibt keine Farbfläche. Unterschieden wird über Symbol und Text. Details: Abschnitt „Unterkacheln“.
- Kein Ocker als Bereichsfarbe. Bernstein (`--warn`) nur für „Möglich“ und Warnungen.

## Bereiche
| Bereich | Variable | Fläche (weiße Schrift) | Schrift auf Karte hell / dunkel |
|---|---|---|---|
| Leistungen (Startkarte) | `--c-leistungen` | #13735f Petrol | #0f6b5c / #6fd3bd |
| Ich habe einen Brief bekommen | `--c-briefe` | #b25224 Ziegel | #a14a2f / #ffb398 |
| Pfändung (Mein Lohn, Mein Konto; Symbolfarbe der Unterseite) | `--c-pfaendung` | #924e81 Pflaume | #7a3b69 / #f0b4dd |
| Geld und Schulden (Startkachel, Unterseiten-Symbole) | `--c-sparen` | #3e7141 Grün | #2f6b3a / #9fdba8 |
| Pflege (Auswahl, Unterstützung) | `--c-pflege` | #3d67a3 Blau | #23507f / #a9cbf3 |
| Ich ziehe aus (neu, Kachel `.sk-ausziehen`, Ansicht `ausziehen`) | `--c-ausziehen` | #6856bb Violett | #5b3f8f / #cdb8f0 |

Die Flächen wurden am 20.11.2026 leicht aufgehellt (Design-Prüfung L4): Jede Kachel-Fläche hat jetzt auch im Dunkelmodus mind. 3:1 zum Hintergrund, weiße Schrift bleibt über 5:1, und alle Startkacheln bleiben bei Rot- und Grünschwäche unterscheidbar (kleinster Abstand ΔE 13, Simulation nach Machado 2009). Die Schriftfarben `-t` bleiben die alten, dunkleren Töne.

## Absender in „Ich habe einen Brief bekommen“
Die Absender-Kacheln sind seit 20.11.2026 weiße Unterkacheln mit Ziegel-Symbol (Bereich Brief). Die Variablen bleiben für Ränder und Symbole an anderen Stellen (z. B. Kostensenkung).
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
| Wahrscheinlich (Grün, nicht Petrol; Plakette eckig) | `--ok` / `--ok-bg` |
| Möglich, Warnung | `--warn` / `--warn-bg` |
| Frist, Nicht, Fehler, „fehlt“, Löschen (einzige Verwendung von Rot) | `--bad` / `--bad-bg`, Schrift auf `--bad`: `--bad-on` |
| Keine Angabe, Info | `--na` / `--na-bg` |
| Tipp, persönlicher Hinweis, Beratungsmodus (ruhiges Schiefer-Blau, kein Rot) | `--hint` / `--hint-bg`, Randbalken `--hint-rand` |
| Vom Brief erkanntes Feld | `--mark-bg`, `--mark-line`, `--mark-ink` |
| Antragsmappe (Papier bleibt weiß) | `--papier`, `--papier-ink`, `--papier-ink2`, `--papier-link` |
| Fokusrahmen (Tiefblau #16224f, dunkel Weiß; nur für den Fokus) | `--focus` |
| Feldrand, Kante, Dialog-Hintergrund | `--field`, `--kante`, `--overlay` |

## Startseite (keine Farbe doppelt)
| Kachel | Farbe |
|---|---|
| Leistungen (Hauptkarte) | Petrol `--c-leistungen` |
| Ich habe einen Brief bekommen | Ziegel `--c-briefe` |
| Geld und Schulden (`.sk-geld`, Symbol Geldbörse) | Grün `--c-sparen` |
| Pflege | Blau `--c-pflege` |
| Ich ziehe aus | Violett `--c-ausziehen` |

Prüfung im Skript: keine Farbe doppelt; jedes Paar mit ΔE76 ≥ 12 bei normaler Sicht, Protanopie und Deuteranopie (Machado, Oliveira, Fernandes 2009, volle Ausprägung). Neue Startkachel: Regel `.sk-<name> { --c: var(--c-…); }` anlegen, der Test findet sie selbst.

Symbole in Mein Ordner und im Energie-Check haben weiter eigene Farben (Block „Symbolfarben“ im CSS); sie werden nicht mehr auf „doppelt“ geprüft.

## Unterkacheln `.uk-karte` (alle Unterseiten)
| Teil | Regel |
|---|---|
| Raster | `.uk-raster` (wie `.start-raster`: zwei Spalten, bei großer Schrift eine) |
| Karte | `<button class="uk-karte">`: weiß (`--surface`), Rand `--line`, Kante `--kante`, Radius `--r-kachel` (26 px), mind. 150 px hoch |
| Inhalt | Symbol (`.sk-sym`, `.kachel-sym` oder `.weg-sym` mit Linien-SVG), Titel `<b>`, Zusatz `<span>` (oder `.sk-txt` mit `b` und `span` wie auf der Startseite) |
| Farbe | nur das Symbol, in der Bereichsfarbe `--uk` (auf der Ansicht gesetzt: Brief Ziegel, Geld Grün, Pfändung Pflaume, Pflege Blau, Ich ziehe aus Violett; sonst Petrol). Immer die `-t`-Töne, damit der Dunkelmodus stimmt |
| Übergang | Jede `.sk` außerhalb von `.start-raster` wird automatisch als weiße Unterkachel gezeigt; dazu die Themen-Listen in Geld sparen, Pfändung und Pflege. Neue Seiten bitte direkt mit `.uk-karte` bauen |

## Bausteine (Gestaltungs-System, Block am Ende des CSS in `src/template.html`)
| Baustein | Regel |
|---|---|
| Frist | `.frist` (Fläche `--bad-bg`, Balken 6 px `--bad`, Kalender-Symbol, Titel `.frist-wann` in `--fs-l`). Steht immer ganz oben im Ergebnis. Genutzt in Brief prüfen (erkannte Frist, Mahn- und Vollstreckungsbescheid, Widerspruchsfrist bei Bescheiden), Fristen-Hinweis auf der Startseite (`.fri-start`), Mein Ordner (`.fri-bis`). Unsichere Erkennung bleibt im Text gekennzeichnet, in normaler Größe |
| Hinweis-Kästen | drei Sorten: Tipp (`--hint`), Achtung (`--warn`), Frist/Fehler (`--bad`) |
| Plaketten | `.pill`: eckig (`--r-tag` 6 px), ohne Rand, Wort plus Zeichen; nie in Petrol |
| Eingabefelder | überall derselbe Stil: Rand 2 px `--field`, Radius `--r-feld` (12 px), mind. 48 px hoch, im Fokus Rand `--accent` und Fokusrahmen `--focus` |
| Knöpfe | drei Ränge: Hauptknopf `.btn` (Fläche `--accent`, im Prüfpaket `.btn.primary`), Zweitknopf `.btn.ghost` (Rand 2 px `--accent`), Textlink `.linkbtn`. Chips (`.chip`) nur für Auswahl. Symbole in Knöpfen als Linien-SVG `.knopf-sym`, keine Emoji |
| Schrift | sechs Stufen: `--fs-xs` .875 rem (nur Zusatzangaben: Datum, Plakette, Status) · `--fs-s` 1 rem (Fließtext, alle Hinweise) · `--fs-m` 1,125 · `--fs-l` 1,25 · `--fs-xl` 1,5 · `--fs-xxl` 1,75 rem. Keine automatische Worttrennung in Überschriften, Plaketten und Knöpfen (`hyphens: none`); Kachel-Titel trennen mit Trennstrich statt ohne |
| Vertrauen | `.vertrauen` am Ergebnis: „Stand: <Monat Jahr> · nach amtlichen Quellen“ (Schlüssel `vertrauen`) |
| Ergebnisblatt | bis 640 px Breite je Leistung eine Karte (Spaltenname aus `data-l`), im Druck Tabelle |
