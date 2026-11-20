# STATUS – SoLo (Sozialleistungslotse)

Stand: 20.11.2026. Letzte gebaute Version: **1.5.0, VersionCode/Build 147** (Play-Store-AAB gebaut, nicht veröffentlicht; iOS zu TestFlight hochgeladen (Build 147, Lauf 44729530498 erfolgreich)). **Nächster VersionCode: 148.**
Übergabe für neue Sitzungen: zuerst diese Datei, dann `CLAUDE.md` (verbindliche Arbeitsregeln).
Ausführlicher Verlauf (Erledigtes, alte Pläne): `docs/VERLAUF.md`, Abschnitt „Entwicklungsverlauf“.

## 1. Stand

### Version 1.5.0 (Build 147, 20.11.2026)
| Bereich | Inhalt |
|---|---|
| Bedienung | Leiste Start \| Mein Ordner \| Einstellungen; Einstellungen als Liste mit Unterseiten; einheitliches Farbkonzept (Palette an einer Stelle) |
| Mein Ordner | Vorgänge speichern (z. B. je Haushalt), PIN-Sperre (Sichtschutz), automatisches Löschen; Unterlagen-Checkliste, Ergebnisblatt, Antragsmappe mit Übersicht |
| Beratung | Beratungsmodus (Rechtsgrundlagen mit Paragrafen) |
| Pflege | Startkachel: Unterstützung oder Einschätzung, Leistungen je Pflegegrad, Beratungsbesuch, Verhinderungspflege durch Angehörige, Wohngruppenzuschlag, 10 Tage Arbeitsverhinderung |
| Geld | Schulden-Tipps, Haushaltsplan und Haushaltsbuch mit Kassenzettel-Scan und CSV; Einkommensart „Unterhalt für sich selbst“ |
| Ich ziehe aus | Bereich für junge Menschen inkl. Careleaver (13 Sprachen + Einfache Sprache) |
| Nutzerprüfung | Verbesserungen und Korrekturen aus der Nutzerprüfung (PR #42) |
| Store | Texte in `docs/STORE.md` (Stand 147), Änderungen in `docs/AENDERUNGEN.md`; Store-Bilder neu mit `tools/store-bilder.js` |
| PRs 20.11.2026 | #40, #41, #42 (alle neuen Funktionen), #43, #44, #46 (Release 147) |

### In `main` (bis PR #26; neuere PRs siehe unten)
| Bereich | Inhalt |
|---|---|
| Leistungen | 32 Karten (`test/karten.js`), neu u. a. Kostenlose Familienversicherung (§ 10 SGB V). Werte 2027 mit Umschalten zum 1.1.2027. Landesleistungen und WBS-Grenzen aller 16 Länder (Saarland: nur Bundeswerte). |
| Neue Bereiche | Netto aus Brutto (Programmablaufplan 2026), Pfändung/P-Konto (Tabelle 2026, gilt bis 30.6.2027), Ersparnisse/Kapitalerträge, Geld sparen im Alltag, einmalige Hilfen (Hinweise in den Karten) |
| Sprachen | 13 Sprachen + Einfache Sprache. Dari, Farsi, Paschtu, Somali, Französisch nicht muttersprachlich geprüft. Prüfpaket, Pflege-Assistent, Rezepte nur Deutsch. |
| Anschriften | Bayern vollständig; 302 Kreise/Städte bundesweit mit Anschrift (Quelle, Abrufdatum); Familienkassen in Ländern mit einer Familienkasse; Rundfunk fest |
| Oberfläche | Reiter „Einstellungen“ (Einstellungen, Informationen); Antragsmappe mit bearbeitbarem Empfänger und Link „Zuständige Stelle suchen“ |
| Tests/CI | Inhaltliche Prüfung (Fable) behoben (#25); Schwere Tests sonntags; Abhängigkeiten gebündelt (#26) |

### Am 19.11.2026 gemergt
| PR | Inhalt |
|---|---|
| #27 | Renten-Netto nach KV/PV statt 89 %; KV-Satz Arbeitnehmer 7,3 % |
| #28 | npm-Sicherheit in `app/` (tar, uuid); pdf.js offen |
| #29 | Prüfbericht: Pläne 2027 auf Stand 19.11.2026 |
| #30 | Unterhaltsvorschuss vollständig nach UVG (13 Sprachen + Einfache Sprache) |
| #32 | CI-Lücken: ESLint und Erweiterungstests in der CI, Speicherleck im Jahreswechsel-Test |
| #33 | Workflow `android-play.yml` (Play-Upload, nur von Hand) |
| Dependabot | überholte PRs geschlossen; #8 (google-services 4.5.0) offen (Gradle 9 siehe Entscheidungen) |

## 2. Entscheidungen
- Korrektheit zuerst: unsichere Fälle „möglich“; nie unsicheren Empfänger einsetzen, dann nur Art der Stelle. Jede Zahl, Grenze und Anschrift mit amtlicher Quelle und Datum.
- Anschrift nur bei bekannter PLZ. Außerhalb Bayerns nur Kreis/Stadt mit Anschrift; Wohngeld: Kreisanschrift + Weiterleitung (§ 16 SGB I). WBS: Gemeinde zuständig. Kranken-, Pflege-, Rentenversicherung: keine Anschrift (Träger hängt von der Person ab).
- Kein Vorlesen, keine Fristen-Kalender, keine mitgelieferten Formulare (nur geprüfte amtliche Links).
- Mietobergrenze nur als Orientierung (§ 12 WoGG +10 % + Heizung).
- Netto: Steuerklasse III für Paar mit einem Einkommen (vorsichtige Annahme).
- Elterngeld: Pauschale 1.000 €/12 wie der amtliche Rechner.
- Lange Tests (e2e, App) laufen nur auf GitHub. Schwere Tests jeden Sonntag automatisch (`schwer.yml`).
- Teststufen (Entscheidung 20.11.2026): Bei jedem PR nur die normale CI (Regeln, Oberfläche, Browser, App, Android-Bau). Die schweren Tests (`schwer.yml`: Safari, Firefox, Emulator, Mutationstest, Raster) laufen **einmal vor jedem Release auf dem fertigen Stand von `main`** und sonntags automatisch – nicht mehr für jeden einzelnen PR. Ausnahme: PRs, die die Testumgebung selbst ändern (Workflows, Testskripte). Erst bauen, wenn der Lauf auf `main` grün ist.
- Gradle 9 zurückgestellt: nicht kompatibel mit AGP 8.13 (Build fand Abhängigkeiten nicht).
- iOS-Upload: Standard-Rechner `macos-15-intel` (macos-26 bekam keinen Rechner).
- Erweiterungen (Prüfpaket) per signierter Lizenzdatei; privater Lizenzschlüssel nie im Repo.

## 3. Offene Punkte
- **Parallele Sitzung B** arbeitet auf `claude/b-*`-Branches an den ersten sechs Punkten der Liste unten (Fristen-Übersicht bis zweites Einkommensfeld). Diese Punkte nicht doppelt anfangen; vor Änderungen an `src/app.js`, `src/rules.js`, `src/template.html`, `src/lang/*.json` die `claude/b-*`-Branches ansehen.
- **Werte 2027**: Prüfung geplant am **1.12.2026** (geplante Aufgabe): eingebaute Werte 2027 gegen endgültige Beschlüsse, Programmablaufplan Lohnsteuer 2027, Pflege-Kinderlosenzuschlag nach PNOG.
- Pfändungsfreigrenzen zum 1.7.2027 eintragen (`R.pfaendung`, `gueltigBis`, `test/test-netto.js`).
- pdf.js 4: Umstieg von 3.11.174.
- `src/lang/de.json` „lead“ sagt noch „in zwei Minuten“ (Startseite und Store sagen „etwa 5 Minuten“), in allen Sprachen angleichen.
- `CLAUDE.md` nennt noch „Nächster VersionCode: 147“ → auf 148 setzen (Nutzer entscheidet).
- Muttersprachliche Prüfung Dari, Farsi, Paschtu, Somali, Französisch; Expertenprüfung Pflege.
- Play Store: AAB 147 hochladen (nur auf Wunsch). Alte Branches auf github.com löschen.

## 4. Nächste Schritte
1. Fristen-Übersicht (Sitzung B)
2. Schuldenübersicht (Sitzung B)
3. Energiekosten-Check (Sitzung B)
4. Mietgrenze Wohngeld (Sitzung B)
5. Hilfe bei Kostensenkung (Sitzung B)
6. Zweites Einkommensfeld für Paare (Sitzung B)
7. Hinweise im Haushaltsbuch zu Mehrbedarfen, Vermögen, Pflege- und Steuer-Belegen
8. `main` schützen (nur PRs mit grünem Pflicht-Check) und Auto-Merge einschalten – **nicht erledigt**
9. Stichtagswerte bündeln
10. `src/app.js` aufteilen
11. 1.12.2026: geplante Prüfung der Werte 2027, danach Build 148 nur auf ausdrückliche Anweisung

## 5. Arbeitsregeln
Siehe `CLAUDE.md` (Branch je Sitzung von `origin/main`, Commit-Fuß, Builds und Store nur auf Anweisung, Schlüssel nie im Repo, Tests).
Artefakte (privat): Faktenblatt https://claude.ai/artifact/8nR97c2tqV6soVJQs3FLLg ; Anschriften-Übersicht https://claude.ai/artifact/XCWJ5EqUuvuHUXNt1bMJEV
