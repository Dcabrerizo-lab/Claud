# SoLo – Arbeitsanweisung (wird in jeder Claude-Code-Sitzung automatisch geladen)

**Zuerst `STATUS.md` lesen** (Stand, Entscheidungen, offene Punkte, nächste Schritte). Danach dort anknüpfen.

## Grundsätze
- Antworten auf Deutsch, kurz, übersichtlich. Nutzer ist Laie in Technik: einfache Sprache, Tabellen statt langer Texte.
- Korrektheit hat dieselbe Priorität wie Bedienbarkeit. Unsichere Fälle „möglich“, nie falsche Zusagen. Jede Zahl, Grenze und Anschrift braucht eine amtliche Quelle mit Datum.
- Nie einen unsicheren Empfänger einsetzen. Dann nur die Art der Stelle nennen.
- App-Nutzer sind Laien ohne Bürokratiewissen: erst das, was jetzt zählt, Details zum Aufklappen.

## Git
- Eigenen Branch von `main` anlegen. Kein Force-Push. Kein Push auf `main`.
- Pull Request nur auf ausdrücklichen Wunsch. Nach dem PR fragen, ob er gemergt werden soll.
- Commit-Fuß: `Co-Authored-By: Claude <Modell> <noreply@anthropic.com>` und `Claude-Session: <Sitzungslink>`. Keine Modell-ID im Repo.
- Tag-Push ist blockiert (403): nicht umgehen. Netz- und Rechtegrenzen nie umgehen.

## Mehrere Sitzungen parallel
- Vor dem Start: `git fetch origin`, neuen Branch von der aktuellen `origin/main` anlegen, `git branch -r` ansehen (offene Branches anderer Sitzungen).
- Pro Sitzung ein klar abgegrenzter Bereich. Wird eine Datei geändert, die ein anderer Branch auch ändert (`src/app.js`, `src/rules.js`, `src/template.html`, `src/lang/*.json`), vorher nachfragen.
- **Nach jeder Etappe vor dem Push `tools/konflikt-check.sh` ausführen** (dauert Sekunden, ändert nichts). Meldet es „KONFLIKT“: `git merge origin/main` bzw. den genannten Branch, Konflikte lösen, Tests laufen lassen, erst dann pushen. Ohne Konflikt keine weitere Prüfung.
- `STATUS.md` und den nächsten VersionCode nur auf ausdrücklichen Wunsch ändern. Stand sonst im Commit und in der Antwort nennen.
- Builds und Store-Uploads nur vom gemergten Stand auf `main`.
- Keine Merges und keine PRs ohne Auftrag. Nach dem Merge eines anderen Branchs den eigenen Branch mit `origin/main` aktualisieren.

## Builds und Store
- **Builds nur auf ausdrückliche Anweisung starten.** Nie von selbst.
- Keine Store-Aktionen (Play Console, App Store, TestFlight) ohne Freigabe.
- Upload-Schlüssel (`upload.jks`) und Passwort liegen NIE im Repo, nie im Chat, nie in Commits. Nutzer reicht sie bei Bedarf als Zip an. In den Scratchpad entpacken. Signatur-SHA beginnt mit `C8:E4:5D:61`. Nächster VersionCode: 146.
- Lizenz-Privatschlüssel des Prüfpakets nie ins Repo.
- Build: `tools/paket-bauen.sh <VC> <Ordner> <jks> <pwdatei>` (`OHNE_TESTS=1` überspringt Tests).

## Tests
- `npm test`, `npm run test:erweiterungen`, `npm run test:e2e` (lang, Timeout hoch), `npm run test:app`.
- Nie `npm install --omit=optional` (bricht esbuild).
- Nach Änderungen an Anschriften oder Texten: `docs/PRUEFLISTE.md` und Faktenblatt angleichen.

## Sparsam arbeiten (Guthaben des Nutzers ist knapp)
- Kleine Etappen. Nach jeder Etappe committen und pushen. Nur lesen, was nötig ist.
- Keine Agenten und Subagenten ohne Auftrag. Nichts doppelt prüfen.
- E-Mail-Adresse und persönliche Daten des Nutzers privat halten.
