# SoLo – Arbeitsanweisung (wird in jeder Claude-Code-Sitzung automatisch geladen)

**Zuerst `STATUS.md` lesen** (Stand, Entscheidungen, offene Punkte, nächste Schritte). Danach dort anknüpfen.

## Grundsätze
- Antworten auf Deutsch, kurz, übersichtlich. Nutzer ist Laie in Technik: einfache Sprache, Tabellen statt langer Texte.
- Korrektheit hat dieselbe Priorität wie Bedienbarkeit. Unsichere Fälle „möglich“, nie falsche Zusagen. Jede Zahl, Grenze und Anschrift braucht eine amtliche Quelle mit Datum.
- Nie einen unsicheren Empfänger einsetzen. Dann nur die Art der Stelle nennen.
- App-Nutzer sind Laien ohne Bürokratiewissen: erst das, was jetzt zählt, Details zum Aufklappen.

## Git
- Eigenen Branch von `main` anlegen. Kein Force-Push. Kein Push auf `main`.
- PRs automatisch anlegen und nach grünen Tests mergen (Genehmigung des Nutzers, 20.11.2026). main wird geschützt (nur PRs mit grünem Pflicht-Check), dann Auto-Merge nutzen.
- Commit-Fuß: `Co-Authored-By: Claude <Modell> <noreply@anthropic.com>` und `Claude-Session: <Sitzungslink>`. Keine Modell-ID im Repo.
- Tag-Push ist blockiert (403): nicht umgehen. Netz- und Rechtegrenzen nie umgehen.

## Mehrere Sitzungen parallel
- Vor dem Start: `git fetch origin`, neuen Branch von der aktuellen `origin/main` anlegen, `git branch -r` ansehen (offene Branches anderer Sitzungen).
- Pro Sitzung ein klar abgegrenzter Bereich. Wird eine Datei geändert, die ein anderer Branch auch ändert (`src/app.js`, `src/rules.js`, `src/template.html`, `src/lang/*.json`), Änderungen klein halten und Konflikte beim Zusammenführen selbst lösen.
- **Nach jedem erledigten Auftrag (auch kleinen) automatisch und ohne Nachfrage: committen, `tools/konflikt-check.sh` ausführen, pushen.** Nie ungepushte Arbeit am Ende einer Antwort liegen lassen, sonst sehen die anderen Sitzungen sie nicht. Der Check läuft vor dem Push (dauert Sekunden, ändert nichts). Meldet es „KONFLIKT“: `git merge origin/main` bzw. den genannten Branch, Konflikte lösen, Tests laufen lassen, erst dann pushen. Ohne Konflikt keine weitere Prüfung.
- `STATUS.md` und den nächsten VersionCode nur auf ausdrücklichen Wunsch ändern. Stand sonst im Commit und in der Antwort nennen.
- Builds und Store-Uploads nur vom gemergten Stand auf `main`.
- Fertige Arbeiten bei grünen Tests ohne Rückfrage zusammenführen und mergen. Nach dem Merge eines anderen Branchs den eigenen Branch mit `origin/main` aktualisieren.

## Builds und Store
- **Builds nur auf ausdrückliche Anweisung starten.** Nie von selbst.
- Keine Store-Aktionen (Play Console, App Store, TestFlight) ohne Freigabe.
- Upload-Schlüssel (`upload.jks`) und Passwort liegen NIE im Repo, nie im Chat, nie in Commits. Nutzer reicht sie bei Bedarf als Zip an. In den Scratchpad entpacken. Signatur-SHA beginnt mit `C8:E4:5D:61`. Nächster VersionCode: 153 (zuletzt gebaut: 1.10.0 / 152 am 22.11.2026).
- Lizenz-Privatschlüssel des Prüfpakets nie ins Repo.
- Build: `tools/paket-bauen.sh <VC> <Ordner> <jks> <pwdatei>` (`OHNE_TESTS=1` überspringt Tests).

## Tests
- `npm test`, `npm run test:erweiterungen`, `npm run test:e2e` (lang, Timeout hoch), `npm run test:app`.
- Nie `npm install --omit=optional` (bricht esbuild).
- Nach Änderungen an Anschriften oder Texten: `docs/PRUEFLISTE.md` und Faktenblatt angleichen.

## Tempo (Vorgabe des Nutzers, 20.11.2026)
- Tempo hat Vorrang; Claude entscheidet selbst den schnellsten Weg zum Ziel. Nur bei echten Weichenstellungen nachfragen.
- Parallel mit mehreren Agenten arbeiten, wo es Sinn macht; Fable für unabhängige Prüfungen von Inhalten und Sicherheit nutzen.
- Lange Tests nur auf GitHub (schwere Tests vor jedem Release und sonntags), lokal nur das Nötigste.
- Nach jedem erledigten Auftrag committen und pushen (siehe „Mehrere Sitzungen parallel“).
- Unverändert: amtliche Quellen, keine Builds und keine Store-Aktionen ohne Anweisung, Schlüssel nie ins Repo.
- E-Mail-Adresse und persönliche Daten des Nutzers privat halten.
