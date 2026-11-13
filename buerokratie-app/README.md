# Bürokratie-App (Arbeitsname)

Offline-App mit verschlüsseltem Stammdatentresor, die PDF-Formulare und fotografierte Papierformulare ausfüllt. Auftrag: siehe CLAUDE.md von David Cabrerizo.

**Stand: M0 (PDF-Spike) und M0b (Foto-Spike) fertig.** Der Code liegt vorerst in diesem Unterordner des Leistungs-Lotse-Repos und ist unabhängig davon (eigene `package.json`).

| Pfad | Inhalt |
|---|---|
| `src/pdf/inspect.ts` | Formularfelder auslesen (Name, Typ, Beschriftung, Datumsformat, XFA, Verschlüsselung) |
| `src/pdf/fill.ts` | Felder befüllen mit Schutzregeln (Schriftwahl je Wert, Schreibschutz, gültige Listenwerte, XFA) |
| `src/pdf/dates.ts` | ISO-Datum → Format des Feldes |
| `src/scan/` | Papierformulare: Texterkennung-Adapter, Beschriftungen zuordnen, Kästchen finden, Werte ins Foto schreiben |
| `data/feldkatalog.json` | Feldkatalog (Spike-Ausschnitt) mit Synonymen |
| `spike/m0/`, `spike/m0b/` | Testformulare und simulierte Fotos (synthetisch), Testdaten (erfunden), Spike-Läufe |
| `test/` | Vitest |
| `docs/spike-m0.md` | **Ergebnis M0**: was pdf-lib kann und wo es scheitert |
| `docs/spike-m0b.md` | **Ergebnis M0b**: Papierformulare per Foto (Abschreibhilfe und ausgefülltes PDF) |
| `docs/plan.md` | fortgeschriebener Plan mit Davids Entscheidungen |
| `docs/pruefung-auftrag.md` | Prüfung des Auftrags, Stack-Vergleich, Widersprüche |

```bash
npm ci
npm test
npm run typecheck
npm run spike:fixtures && npm run spike && npm run spike:render   # PDF-Weg
npm run spike:photos && npm run spike:scan                         # Foto-Weg
```

**Hinweis:** Hilfe beim Ausfüllen, keine Rechtsberatung.
