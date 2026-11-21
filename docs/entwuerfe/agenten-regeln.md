BAU-AUFTRAG fürs nächste Update (verbindlich)
- Lies zuerst CLAUDE.md, docs/FARBEN.md und docs/entwuerfe/naechstes-update.md (Branch origin/claude/b-entwuerfe: `git show origin/claude/b-entwuerfe:docs/entwuerfe/<datei>`). Davids Entscheidungen dort haben Vorrang.
- Arbeitskopie: `cd /home/claude/claud && git fetch -q origin && git worktree add /home/claude/wt-<name> -b claude/b-<name> origin/main`, dann `ln -s /home/claude/wt-build/node_modules /home/claude/wt-<name>/node_modules`. Arbeite NUR dort.
- Nutzer ist Laie, App-Nutzer sind Laien: übersichtlich und intuitiv, erst was jetzt zählt, Details zum Aufklappen. Nicht überladen. Farben nur aus der Palette, keine Farbe doppelt je Gruppe.
- Texte in ALLEN 13 Sprachen (src/lang/*.json und Unterordner: de en ar fa fa-AF fr pl ps ro ru so tr uk) plus Einfache Sprache (src/lang/einfach/), natürliche Übersetzungen, deutsche Amtsbegriffe (Jobcenter, Sozialamt, Wohngeld, Pflegekasse …) in Übersetzungen deutsch erhalten (ggf. in Klammern). Nicht mehr benutzte Schlüssel in allen Sprachen entfernen.
- Nur textContent/esc, kein ungeprüftes innerHTML. Speicherung nur über Vorgaenge.DATEN. Nur geltendes Recht; jede Zahl/Rechtsaussage mit amtlicher Quelle + Abrufdatum im Code-Kommentar.
- Gemeinsame Dateien (src/app.js, src/template.html, src/rules.js, src/lang/*.json, package.json) nur in DEINEM Bereich ändern, Änderungen gebündelt; andere Agenten arbeiten parallel an anderen Bereichen.
- Tests: bestehende Tests anpassen, wo nötig neue Tests (in package.json test:rules eintragen). Lokal NUR: `npm run build:web`, `npm run test:rules`, `npm run test:dom`, `node tools/kontrast-pruefen.js`, `npx eslint <geänderte Dateien>`. KEIN test:e2e / playwright.
- Fertig: `git add -A` (ohne node_modules), commit mit Fuß
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017yK11qBDr2XALSCPVqxTsJ
  dann `bash tools/konflikt-check.sh`, `git push -u origin claude/b-<name>`, PR anlegen mit `gh api -X POST repos/Dcabrerizo-lab/claud/pulls -f title=... -f head=claude/b-<name> -f base=main -f body=...` (Body endet mit: 🤖 Generated with [Claude Code](https://claude.com/claude-code) und der Sitzungs-URL). NICHT mergen. Kein Force-Push, kein Push auf main, keine Builds, keine Store-Aktionen, STATUS.md nicht ändern.
- Antwort (max. 15 Zeilen): PR-Nummer, was gebaut, geänderte Dateien, lokale Tests, Offenes/Abweichungen.

## Neu ab 21.11.2026 (David, gilt für alle Arbeiten)
- Fertige Teile werden GEBÜNDELT zusammengeführt (Koordinator), nicht jeder PR einzeln: Bau-Agenten pushen und legen den PR an; selbst mergen nur, wenn ausdrücklich im Auftrag steht.
- Unabhängige Prüfung (Fable) nur für Beträge, Recht und Sicherheit; reine Optik/Layout ohne Extraprüfung.
- Neue Wünsche während eines laufenden Updates gehen ins übernächste Update, außer David sagt „noch rein“.
