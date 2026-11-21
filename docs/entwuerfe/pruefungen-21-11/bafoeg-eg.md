# Abgleich mit amtlichen Rechnern: BAföG, Elterngeld, Pfändung

Stand 21.11.2026. Workflow `amtlich-bafoeg-eg.yml`, Lauf 44903641222 (alle 5 Jobs grün), PR #106 (gegen `claude/test-update-1.9`, nicht gemergt).
Rohdaten: `/home/claude/ausgabe/amtlich/roh/` (Artefakte des Laufs).

## Kurz

| Rechner (amtlich) | Fälle | Ergebnis (SoLo-Stand mit #99 / b-abgleich-2) |
|---|---|---|
| BAföG-Rechner „BAföG Digital“ (vom BMFTR verlinkt) | 200 | **0 Widersprüche**; 13 Vermögensminderungen auf den Euro gleich |
| Elterngeld-Schnellrechner (Familienportal, BMBFSFJ) | 300 | **180 von 180** einfachen Fällen auf den Euro gleich (auch mit Geschwisterbonus) |
| – davon Teilzeit nach der Geburt | 85 | SoLo fragt Teilzeit nicht ab (nur Hinweis „anteilig weniger“) |
| – davon Mehrlinge | 35 | SoLo kennt den Mehrlingszuschlag nicht (zeigt 300 € je weiteres Kind zu wenig) |
| Freibetragsrechner Pfändung (Justiz NRW, Freigrenzen ab 1.7.2026) | 300 | **300 von 300 auf den Cent gleich** |

Unterhaltsvorschuss und Kindergeld weggelassen (feste Beträge).

## Welcher SoLo-Stand verglichen wurde

| Stand | Commit | BAföG-Widersprüche |
|---|---|---|
| `origin/claude/test-update-1.9` (ohne #99) | adae98d | **31** |
| `origin/claude/b-abgleich-2` (enthält test-update-1.9 und die BAföG-Korrekturen aus #99) | 5ae88c5 | **0** |
| `origin/claude/b-rest-19` (enthält b-abgleich-2; Vermögensfreibeträge je Partner/Kind, § 14b, § 51) | c3663d3 | **0** |

Lokal zusammengeführt nur zum Vergleichen (Merges waren Vorspulen), nichts davon gepusht. Elterngeld und Pfändung: in allen drei Ständen gleich.

## BAföG – Einordnung

SoLo nennt beim BAföG keinen Betrag, sondern eine Einschätzung. Geprüft: „wahrscheinlich“ ⇒ amtlich mind. 10 €; „eher nicht“ ⇒ amtlich 0 €;
„möglich“ ist immer vereinbar. Wo SoLo die Minderung durch Vermögen in € nennt, muss Bedarf − Minderung = amtlicher Anspruch sein (± 1 €).

Fälle: 140 aus Elternsicht („Kind in Schule oder Studium“: Paar/getrennt, Brutto 800–7.500 €/Monat, 0–3 Geschwister, 12 % mit Geschwister in
förderfähiger Ausbildung, bei Eltern/eigene Wohnung, Familien-/studentische KV) und 60 aus Sicht der Studierenden (unter/über 30, Vermögen um
15.000/45.000 €, teils Nebenjob). Netto und Lohnsteuer der Eltern mit SoLos Lohnrechner; dieselbe Steuer ging in den amtlichen Rechner.

| Stand mit #99 | Anzahl |
|---|---|
| SoLo „wahrscheinlich“, amtlich Anspruch (kleinster: 534 €) | 62 |
| SoLo „eher nicht“, amtlich 0 € | 25 |
| SoLo „möglich“, amtlich Anspruch | 104 |
| SoLo „möglich“, amtlich 0 € | 9 |

- Die 31 Widersprüche im alten Stand (13 × Eltern „eher nicht“ trotz Anspruch, 18 × „Vermögen zu hoch“ trotz Anspruch) sind genau die Fehler,
  die #99 / b-abgleich-2 behebt (§ 25 Abs. 4: nur 50 % minus 5 % je Kind über dem Freibetrag; § 30: Vermögen nur anteilig je Monat). Bestätigt.
- „Möglich“ ist häufig (113 von 200). Das ist vorsichtig, aber wenig aussagekräftig; SoLo rechnet beim BAföG keinen Betrag.
- Auffällig, kein SoLo-Fehler: Der amtliche Rechner setzt für über 30-Jährige mit studentischer KV einen Bedarf von 1.005 € statt 992 € an
  (vermutlich PV-Zuschlag 48 €). SoLos Obergrenze 1.088 € deckt das ab.
- Hinweis zum Rechner: Ohne Angabe der Lohnsteuer zieht er 0 € Steuer ab (rechnet zu ungünstig). Im Test wurde die Steuer immer angegeben.

## Elterngeld – Einordnung

- Ohne Teilzeit/Mehrlinge: 180 von 180 gleich (SoLo zeigt volle Euro).
- Teilzeit und Mehrlinge: Die amtlichen Werte folgen in 120 von 120 Fällen exakt der Formel § 2 Abs. 3 (Differenz vor/nach, beide minus 1.000 €/12,
  Satz nach dem Einkommen vorher), § 2a Abs. 1 (Geschwisterbonus 10 %, mind. 75 €) und § 2a Abs. 4 BEEG (Mehrlingszuschlag 300 € je weiteres Kind).
  SoLo hat dafür keine Eingabe. Folgen (nur dokumentiert, nicht korrigiert):
  - **Teilzeit**: SoLo zeigt den vollen Betrag (im Test bis 1.389 € zu viel) mit dem Satz „Wer in Teilzeit arbeitet, bekommt anteilig weniger.“ Vorschlag: Netto nach der Geburt abfragen oder „bis zu“ schreiben.
  - **Mehrlinge**: SoLo zeigt je weiteres Kind 300 € zu wenig und erwähnt den Zuschlag nicht. Vorschlag: Frage „Zwillinge/Mehrlinge?“ oder Hinweis.
- ElterngeldPlus: nicht online geprüft. Der Schnellrechner rechnet nur Basiselterngeld; der „Elterngeldrechner mit Planer“ ist eine lange
  Planungsstrecke. SoLo zeigt Plus = Basis/2; das entspricht § 4a Abs. 2 BEEG, solange nach der Geburt kein Einkommen da ist.

## Pfändung – Einordnung

300 von 300 auf den Cent gleich (0 bis 6 Unterhaltspflichten, gehäuft an den Freibeträgen und über dem Höchstbetrag 4.866,30 €).
Nebenbefund Quelle: Die Justiz NRW nennt als Fundstelle „Bekanntmachung vom 19. März 2026 (BGBl. I Nr. 160)“, SoLos Kommentar in `src/rules.js`
„BGBl. 2026 I Nr. 80 vom 26.3.2026“. Die Beträge stimmen; die Fundstelle sollte jemand im BGBl. prüfen.

## Recherche und Höflichkeit

| Rechner | Amtlich? | robots.txt / Bedingungen | Abfrage |
|---|---|---|---|
| bafoeg-digital.de/rechner | ja, BAföG Digital, verlinkt von bmftr.bund.de/bafoeg | keine robots.txt; Nutzungsbedingungen gelten nur für die Registrierung | Oberfläche (8 Schritte), 2 Läufer à 100 Fälle |
| familienportal.de (Schnellrechner) | ja, BMBFSFJ | robots.txt erlaubt alles | Oberfläche, 300 Fälle |
| freibetragsrechner.justiz.nrw.de | ja, Ministerium der Justiz NRW | keine robots.txt | Formular, 300 Fälle |

Pause ≥ 2,2 s nach jedem Fall, höchstens 300 Fälle je Rechner, keine direkten Schnittstellen-Aufrufe (nur die normale Bedienung).

## Dateien (PR #106)

- `.github/workflows/amtlich-bafoeg-eg.yml` – startet von Hand oder bei Änderung von `tools/amtliche-rechner/auftrag-bafoeg-eg.txt`
- `tools/amtliche-rechner/bafoeg-eg-abfrage.js` – bedient die drei Rechner
- `tools/amtlich-vergleich-bafoeg-eg.js` – Fälle (fester Startwert) und Vergleich mit SoLo (`auswerten <Ordner> --md <Datei>`)

## Anhang: Widersprüche im alten Stand (test-update-1.9, ohne #99)

| Nr. | Fall | SoLo | amtlich | Befund |
|---|---|---|---|---|
| 17 | Elternteil allein, Brutto 7250 €/Monat, Geschwister 2, wohnt bei Eltern | nein (bafoeg.kindNein) | 97,00 € (Bedarf 534,00 €) | SoLo „eher nicht“, amtlich 97,00 € |
| 33 | Studierende selbst, unter 30, Vermögen 19700 €, eigene Wohnung | nein (bafoeg.vermHoch) | 463,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 463,00 € |
| 37 | Studierende selbst, unter 30, Vermögen 19500 €, eigene Wohnung | nein (bafoeg.vermHoch) | 617,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 617,00 € |
| 38 | Studierende selbst, unter 30, Vermögen 21100 €, eigene Wohnung | nein (bafoeg.vermHoch) | 347,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 347,00 € |
| 44 | Studierende selbst, unter 30, Vermögen 19300 €, eigene Wohnung | nein (bafoeg.vermHoch) | 634,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 634,00 € |
| 52 | Eltern Paar, Brutto 3850 + 4300 €/Monat, Geschwister 1, eigene Wohnung | nein (bafoeg.kindNein) | 63,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 63,00 € |
| 74 | Eltern Paar, Brutto 3600 + 4350 €/Monat, Geschwister 1, eigene Wohnung | nein (bafoeg.kindNein) | 248,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 248,00 € |
| 81 | Elternteil allein, Brutto 5150 €/Monat, Geschwister 0, eigene Wohnung | nein (bafoeg.kindNein) | 96,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 96,00 € |
| 89 | Eltern Paar, Brutto 7300 + 1650 €/Monat, Geschwister 2, eigene Wohnung | nein (bafoeg.kindNein) | 336,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 336,00 € |
| 93 | Studierende selbst, unter 30, Vermögen 15200 €, bei Eltern | nein (bafoeg.vermHoch) | 654,00 € (Bedarf 671,00 €) | SoLo „eher nicht“, amtlich 654,00 € |
| 100 | Studierende selbst, über 30, Vermögen 47800 €, Nebenjob 7700 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 742,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 742,00 € |
| 102 | Studierende selbst, über 30, Vermögen 52100 €, Nebenjob 6100 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 413,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 413,00 € |
| 104 | Elternteil allein, Brutto 7200 €/Monat, Geschwister 0 + 1 in Ausbildung, eigene Wohnung | nein (bafoeg.kindNein) | 342,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 342,00 € |
| 108 | Elternteil allein, Brutto 4350 €/Monat, Geschwister 0, wohnt bei Eltern | nein (bafoeg.kindNein) | 121,00 € (Bedarf 671,00 €) | SoLo „eher nicht“, amtlich 121,00 € |
| 109 | Studierende selbst, unter 30, Vermögen 15600 €, Nebenjob 12900 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 438,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 438,00 € |
| 112 | Elternteil allein, Brutto 6600 €/Monat, Geschwister 1, eigene Wohnung | nein (bafoeg.kindNein) | 205,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 205,00 € |
| 118 | Eltern Paar, Brutto 5550 €/Monat, Geschwister 0, wohnt bei Eltern | nein (bafoeg.kindNein) | 88,00 € (Bedarf 671,00 €) | SoLo „eher nicht“, amtlich 88,00 € |
| 122 | Studierende selbst, unter 30, Vermögen 16300 €, eigene Wohnung | nein (bafoeg.vermHoch) | 884,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 884,00 € |
| 123 | Studierende selbst, über 30, Vermögen 52900 €, eigene Wohnung | nein (bafoeg.vermHoch) | 347,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 347,00 € |
| 126 | Studierende selbst, unter 30, Vermögen 19200 €, Nebenjob 8700 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 547,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 547,00 € |
| 143 | Studierende selbst, unter 30, Vermögen 19300 €, eigene Wohnung | nein (bafoeg.vermHoch) | 497,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 497,00 € |
| 147 | Eltern Paar, Brutto 2250 + 6450 €/Monat, Geschwister 1, eigene Wohnung | nein (bafoeg.kindNein) | 134,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 134,00 € |
| 150 | Studierende selbst, über 30, Vermögen 46000 €, eigene Wohnung | nein (bafoeg.vermHoch) | 922,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 922,00 € |
| 151 | Studierende selbst, unter 30, Vermögen 24600 €, eigene Wohnung | nein (bafoeg.vermHoch) | 55,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 55,00 € |
| 159 | Studierende selbst, unter 30, Vermögen 21500 €, Nebenjob 3700 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 313,00 € (Bedarf 855,00 €) | SoLo „eher nicht“, amtlich 313,00 € |
| 162 | Eltern Paar, Brutto 7500 + 2300 €/Monat, Geschwister 3, wohnt bei Eltern | nein (bafoeg.kindNein) | 171,00 € (Bedarf 534,00 €) | SoLo „eher nicht“, amtlich 171,00 € |
| 166 | Eltern Paar, Brutto 3350 + 2000 €/Monat, Geschwister 0, eigene Wohnung | nein (bafoeg.kindNein) | 497,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 497,00 € |
| 168 | Eltern Paar, Brutto 1500 + 6450 €/Monat, Geschwister 1, eigene Wohnung | nein (bafoeg.kindNein) | 338,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 338,00 € |
| 180 | Studierende selbst, unter 30, Vermögen 22100 €, Nebenjob 5700 €/Jahr, eigene Wohnung | nein (bafoeg.vermHoch) | 400,00 € (Bedarf 992,00 €) | SoLo „eher nicht“, amtlich 400,00 € |
| 181 | Studierende selbst, über 30, Vermögen 47300 €, eigene Wohnung | nein (bafoeg.vermHoch) | 813,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 813,00 € |
| 197 | Studierende selbst, über 30, Vermögen 53900 €, eigene Wohnung | nein (bafoeg.vermHoch) | 263,00 € (Bedarf 1.005,00 €) | SoLo „eher nicht“, amtlich 263,00 € |

## Elterngeld (Basiselterngeld, Schnellrechner)
