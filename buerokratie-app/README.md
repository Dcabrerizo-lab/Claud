# Bürokratie-App (Arbeitsname)

Offline-App mit verschlüsseltem Stammdatentresor, die hochgeladene PDF-Formulare ausfüllt. Auftrag: siehe CLAUDE.md von David Cabrerizo.

**Stand: M0 (Spike) fertig.** Der Code liegt vorerst in diesem Unterordner des Leistungs-Lotse-Repos und ist unabhängig davon (eigene `package.json`).

| Pfad | Inhalt |
|---|---|
| `src/pdf/inspect.ts` | Formularfelder auslesen (Name, Typ, Beschriftung, Datumsformat, XFA, Verschlüsselung) |
| `src/pdf/fill.ts` | Felder befüllen mit Schutzregeln (Schriftwahl je Wert, Schreibschutz, gültige Listenwerte, XFA) |
| `src/pdf/dates.ts` | ISO-Datum → Format des Feldes |
| `spike/m0/` | Testformulare (synthetisch), Testdaten (erfunden), Spike-Lauf, Vorschau mit pdf.js |
| `test/` | Vitest |
| `docs/spike-m0.md` | **Ergebnis M0**: was pdf-lib kann und wo es scheitert |
| `docs/pruefung-auftrag.md` | Prüfung des Auftrags, Stack-Vergleich, Widersprüche |

```bash
npm ci
npm test
npm run typecheck
npm run spike:fixtures && npm run spike && npm run spike:render
```

**Hinweis:** Hilfe beim Ausfüllen, keine Rechtsberatung.
