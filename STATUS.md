# STATUS – SoLo (Sozialleistungslotse)

Stand: 19.11.2026. Letzte Store-Version: 1.4.0, Build 145 (Play-Store-AAB gebaut, nicht veröffentlicht). Nächster VersionCode: 146.
Ausführlicher Verlauf (Erledigtes, alte Pläne): `docs/VERLAUF.md`, Abschnitt „Entwicklungsverlauf“.

## 1. Stand

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
- **Werte 2027**: eingebaute Werte 2027 gegen endgültige Beschlüsse prüfen, Programmablaufplan Lohnsteuer 2027 eintragen, Pflege-Kinderlosenzuschlag nach PNOG. Prüfung geplant am 1.12.2026 (geplante Aufgabe).
- Pfändungsfreigrenzen zum 1.7.2027 eintragen (`R.pfaendung`, `gueltigBis`, `test/test-netto.js`).
- pdf.js 4: Umstieg von 3.11.174 (in #28 als offen vermerkt).
- Architektur: Stichtags-Werte bündeln; `src/app.js` und Sprachdateien aufteilen; Prüfsummen/CSP für die Web-Version.
- `wgAbzugAuszahlung` Rente: Werte prüfen ([0, 0.06] → etwa [-0.03, 0.09]).
- Arbeitende Altersrentner (Netto, Anrechnung).
- Pflegereform 2027 einarbeiten, sobald beschlossen.
- Musterfälle-Tabelle (`docs/Musterfaelle-Abgleich.csv`) neu erzeugen.
- Alte Branches auf GitHub löschen (Proxy verbietet Löschen: Nutzer auf github.com) und „Automatically delete head branches“ einschalten.
- Anschriften: WBS in den 32 bayerischen Ausnahme-Landkreisen (Gemeinde nötig), Bremen; Jobcenter/Landesämter außerhalb Bayerns nur mit belegter Quelle. WBS Saarland aus amtlicher Quelle.
- Muttersprachliche Prüfung Dari, Farsi, Paschtu, Somali, Französisch; Übersetzung Prüfpaket, Pflege-Assistent, Rezepte; Expertenprüfung Pflege.
- iOS: TestFlight-Upload klären. Play Store: Build 145 bzw. nächster Build hochladen (nur auf Wunsch).

## 4. Nächste Schritte
1. Erledigt: PRs #27–#30, #32, #33 gemergt. Eigene Branches mit `origin/main` aktualisieren.
2. 1.12.2026: Werte 2027 eintragen, Tests laufen lassen.
3. Danach Build 146 vom gemergten `main` (nur auf ausdrückliche Anweisung), Store-Texte aus `docs/STORE.md`.

## 5. Arbeitsregeln
Siehe `CLAUDE.md` (Branch je Sitzung von `origin/main`, Commit-Fuß, Builds und Store nur auf Anweisung, Schlüssel nie im Repo, Tests).
Artefakte (privat): Faktenblatt https://claude.ai/artifact/8nR97c2tqV6soVJQs3FLLg ; Anschriften-Übersicht https://claude.ai/artifact/XCWJ5EqUuvuHUXNt1bMJEV
