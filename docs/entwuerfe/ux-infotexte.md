# SoLo – Prüfung der Infotexte (Bedienbarkeit)

Stand: 20.11.2026 · geprüft: `origin/main` (f28dc1a), Web-Build, Deutsch, Handygröße 390×844 · nur Prüfung, kein Code geändert
Bildschirmfotos: `/home/claude/ux-fotos/` (134 Dateien, Name = Ansicht, `-s2`/`-s3` = weiter unten) · Messskripte: `/home/claude/ux-tools/`

**Kurz gesagt:** Beim Durchgehen aller Ansichten stehen rund **160 Infofelder** auf dem Bildschirm. Nötig sind sichtbar etwa **45**. Rund 55 können ganz weg, rund 60 gehören hinter „Mehr dazu“ oder ein ⓘ am Feld. Die drei größten Störer: der Werbesatz im Kopf auf fast jeder Seite, der Doppel-Hinweis (Datenschutz + keine Rechtsberatung) vor jeder Brief-Prüfung, und ein Hinweis unter fast jedem Feld im Leistungs-Check.

Wie gezählt wurde: „Infofeld“ = sichtbarer Hinweis in kleiner/grauer Schrift oder im Kasten (`small`, `muted`, `hint`, `notice`, `warn`, `hinweis-koralle`, `pp-hinweis`, `legende`, `foot`, `feld-hilfe`, `karte-hinweis`). Einleitungs-Absätze ohne eigene Klasse sind nicht mitgezählt, sie stecken in „Wörter vor der ersten Handlung“. Zurück-Knöpfe zählen nicht als Handlung.

Schon beschlossene Umbauten (Geld und Schulden, Pflege-Ergebnisseite, Mein Ordner, Ergebnisliste ohne Schritte/Unterlagen, Zurück-Knopf, Careleaver) sind berücksichtigt und nicht noch einmal bewertet. Wo sie Infofelder mit erledigen, steht „(erledigt sich mit Umbau)“.

---

## (a) Übersicht je Ansicht

„Wörter vor Handlung“ = Wörter im Inhaltsbereich, bevor der erste Knopf oder das erste Feld kommt. **Dazu kommen auf jeder Seite außer Start und Brief-Unterseiten 16 Wörter Kopfzeile** (`lead`), die den Inhalt rund 60 px nach unten schieben.

| Ansicht | Infofelder heute → Vorschlag | Wörter vor Handlung | Hauptproblem |
|---|---|---|---|
| Kopfzeile (alle Seiten) | 11 → 0 | +16 je Seite | Satz „Prüfe in etwa 5 Minuten …“ steht auch über Pfändung, Pflege, Haushaltsplan, Einstellungen. Passt dort nicht und kostet Platz |
| Startseite | 2 → 1 | 13 | In Ordnung. Unterzeile unter der Begrüßung ist entbehrlich |
| Leistungs-Check: Formular (Paar, 2 Kinder) | 30 → 8 | 2 (Erstbesuch: 33) | Unter fast jedem Feld ein grauer Satz. Formular ist 8.000 px lang. Erster Knopf ist „Kurzer Check für Menschen mit Behinderung“, dann „Beispiel laden“ und „Alle Angaben löschen“ mit 34 Wörtern Erklärung – alles vor der ersten Frage |
| Leistungs-Check: Ergebnis | 7 → 3 | 17 (Legende) | Vor der ersten Karte steht ein Kasten „Zwei Wege“ mit 150 Wörtern. Offene Karte: 4 Hinweise (erledigt sich zum Teil mit Umbau) |
| Antragsmappe | 18 → 4 | 55 | Zwei graue Kästen vor „Drucken“. Derselbe Hinweis 4-mal (Empfänger) und 8-mal (Haken) |
| Ergebnisblatt | 1 → 1 | 23 | In Ordnung |
| Brief: Absender wählen | 1 → 0 | 18 | Überschrift fragt schon „Von wem ist der Brief?“, der Satz darunter wiederholt das |
| Brief: Absender-Seiten (8 Stück) | 17 → 8 | 48–74 | Erst Datenschutz + Rechtsberatung, dann Erklär-Absatz, dann erst „Brief scannen“. Knopf liegt bei 450–620 px, also fast unten am Bildschirm |
| Brief: „Werte selbst eingeben“ (Jobcenter) | 10 → 1 | – | Unter jedem der 9 Felder ein grauer Absatz („Im Berechnungsbogen bei …“). Inhalt ist gut, aber alles gleichzeitig offen |
| Brief: nach dem Lesen (anderer Brief) | 2 → 2 | – | In Ordnung. Anzeigefehler: „Frist im Brief: Monats“ (siehe Nebenbefunde) |
| Pflege: Auswahl | 0 → 0 | 5 | Gut |
| Pflege: Unterstützung (Pflegegrad 2) | 9 → 3 | 72 | 34 Wörter Erklärung „Konto oder Budget“ vor der ersten Karte; „Budget: Die Pflegekasse bezahlt“ 4-mal als grauer Satz |
| Pflege: selbst einschätzen (Vorab) | 1 → 0 | 72 | Kasten „So geht es“ (3 Punkte + Kleintext) steht vor der ersten Frage |
| Geld sparen: Übersicht und Themen | 7 → 0 | 8 / 85–169 | Themen sind reine Textlisten (bis 169 Wörter) ohne Gliederung. Datenschutz-Satz auf einer Seite ohne Eingaben |
| Pfändung (Start, Schritte, Ergebnis) | 8 → 4 | 7 / 14–28 / 92–110 | Start: Stand-Zeile und Datenschutz ohne Nutzen an dieser Stelle. Ergebnis gut aufgebaut (Zahl zuerst) |
| Haushaltsplan (3 Reiter) | 9 → 2 | 3 | „Gilt auch im Leistungs-Check“ bis zu 4-mal untereinander. Oben zwei Einleitungen hintereinander |
| Schulden-Liste | 5 → 1 | 25 | Quellen-Absatz (32 Wörter) und Datenschutz (27 Wörter) offen am Seitenende |
| Ich ziehe aus (Übersicht + 6 Bereiche) | 10 → 1 | 14 / 10–212 | „Finger weg!“: 212 Wörter Fließtext vor der ersten Handlung. „Stand der Rechtslage“ auf jeder Unterseite |
| Mein Ordner | 0 → 0 | 5 | Gut (Umbau beschlossen) |
| Mein Ordner: Alle Vorgänge | 3 → 1 | 37 | 27 Wörter Einleitung vor dem Namensfeld (erledigt sich mit Umbau) |
| Einstellungen (4 Unterseiten) | 8 → 4 | 1–9 | „Sicherheit“: 43 Wörter PIN-Erklärung vor dem Knopf |
| Rechtliches | – | 506 | Bleibt. Ist der richtige Ort für alles Ausführliche |
| **Summe** | **rund 160 → rund 45** | | |

**Gesamtziel: von rund 160 auf rund 45 sichtbare Infofelder.** Davon etwa 55 streichen, etwa 60 einklappen (ⓘ am Feld oder „Mehr dazu“). Kein rechtlich nötiger Hinweis fällt weg, sie werden gebündelt.

Wiederholungen im Textbestand (`src/lang/de.json` und Unterordner, 2.254 Texte, rund 27.000 Wörter):
- „bleibt auf diesem Gerät / nichts wird gesendet“: **20 verschiedene Texte**, 9 verschiedene Formulierungen.
- „keine Rechtsberatung / ersetzt keine Beratung“: **12 verschiedene Texte**.
- `home.privat` steht auf 4 Ansichten, `briefe.hinweis` und `el.privat` auf allen 8 Absender-Seiten, `haken.hint` je Leistung einmal (8-mal in einer Mappe), `hb.geteilt` bis 4-mal auf einer Seite, `az.stand` auf 6 Unterseiten.

---

## (b) Konkrete Liste je Text

Prüffrage bei jedem Feld: **Würde ein Laie ohne diesen Hinweis etwas falsch machen, Geld verlieren oder eine Frist verpassen?** Nein → streichen. Ja, aber nur manchmal → einklappen. Ja, immer → bleibt, kurz.

Zeichen: ⚖ = rechtlich nötig, nur bündeln oder verlegen · ⓘ = hinter Info-Symbol am Feld · ▸ = aufklappbar „Mehr dazu“

### Überall
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `lead` (Kopf) | Nein. Auf der Startseite sagt die Hauptkachel dasselbe | **Streichen** auf allen Unterseiten. Kopf auf Unterseiten nur noch „← Zurück“ + Seitentitel (passt zum beschlossenen Zurück-Knopf) |
| `home.privat` (Sparen, Pfändung, Ausziehen, Ausgaben) | Nein, steht zentral | **Streichen** an allen 4 Stellen |
| `first.text` ⚖ | Ja, einmal | Bleibt, aber **beim ersten App-Start** zeigen statt nur im Leistungs-Check. Heute sieht ihn niemand, der zuerst „Brief“ oder „Pfändung“ öffnet. Kürzen auf: „SoLo gibt eine erste Orientierung. Keine Rechtsberatung. Über deinen Anspruch entscheidet das Amt. Deine Angaben bleiben auf diesem Gerät.“ (damit ist auch der Datenschutz einmal zentral gesagt) |

### Startseite
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `home.gruss.t` | Nein | Streichen |
| `home.sicher` ⚖ | Ja, einmal | Bleibt. Das ist die **eine** Datenschutz-Stelle. Antippbar machen → Einstellungen › Sicherheit und Daten |

### Leistungs-Check: Formular
Reihenfolge oben ändern: erste Frage zuerst. „Beispiel laden“, „Kurzer Check“ und „Alle Angaben löschen“ ans Ende des Formulars oder in ein Menü „⋯“.

| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `clear.was` + `clear.teil.*` (34 Wörter) | Ja, aber erst beim Löschen | **Verschieben** in die Rückfrage nach dem Tippen auf „Alle Angaben löschen“ |
| `sample` | Ja, kurz | Kürzen: „Das ist ein Beispiel. Trag deine eigenen Werte ein.“ (Datenschutz-Satz raus) |
| `geb.hint` | Nein | Kürzen auf Platzhalter im Feld: „z. B. 1962“ |
| `aufenthalt.hint` | Nein (erklärt nur, warum gefragt wird) | ⓘ |
| `lg.gesund.hint` | Nein | Streichen |
| `bh.person.hint` | Manchmal | ⓘ. Besser: Auswahl selbst klarer benennen („Kind ab 18, Behinderung schon vor 25“) |
| `ausb.hint` | Manchmal | In die Auswahl ziehen: „Schule (ab Klasse 10) oder Studium“ |
| `miete.hint` | Ja | In die Beschriftung ziehen: „Miete im Monat (mit Nebenkosten und Heizung)“, Hinweis streichen |
| `heiz.hint` | Nein (Feld ist freiwillig) | ⓘ, sichtbar nur: „Steht im Mietvertrag.“ |
| `hh.hint` | Manchmal | Erst zeigen, wenn „Ja, Mitbewohner“ oder „Ja, Verwandte“ gewählt ist |
| `plz.hint` | Nein | Streichen. Nach Eingabe reicht „Gefunden: Nürnberg“ |
| `wgmax.d.stufe` (Quelle Mietenstufe) ⚖ | Quelle ja, hier nein | Hinter ⓘ an „Gefunden: …“ (Quelle bleibt abrufbar) |
| `bl.hint` | Nein | ⓘ |
| `stufe.hint` + Bundesland + Mietenstufe | Nein, wenn PLZ erkannt | Felder nur zeigen, wenn die PLZ nichts findet. Sonst 2 Felder und 2 Hinweise weniger |
| `ek.intro` | Ja (sonst zählt jemand Kindergeld doppelt) | Bleibt, kürzen: „Was bekommt jede erwachsene Person im Monat? Kindergeld und Wohngeld nicht mitzählen.“ |
| `ek.art.hint` (bis 27 Wörter, je Person) | Selten | ⓘ |
| `ek.brutto.hint.*` | Ja, kurz | Bleibt, kürzen: „Steht oben auf der Lohnabrechnung.“ / „Steht im Rentenbescheid.“ |
| `ek.netto.hint` | Ja, kurz | Kürzen: „Weißt du es nicht? Leer lassen.“ |
| `ek.zusatzRente.hint` (30 Wörter) | Selten | ⓘ, sichtbar: „Nur ausfüllen, wenn in der Rente oben enthalten.“ (Freibetrag-Zahlen hinter ⓘ) |
| `unterh.hint` (36 Wörter) | Ja, kurz | Kürzen: „Für alle Kinder zusammen. Unterhaltsvorschuss nicht eintragen.“ Rest ⓘ |
| `waisen.hint`, `kindEink.hint`, `egVor.hint` | Selten | ⓘ, sichtbar je ein Halbsatz |
| `uz.hint` (26 Wörter) | Ja, kurz | Kürzen: „Was du wirklich überweist. Sonst leer lassen.“ Rest ⓘ |
| `verm.hint` | Ja | Kürzen: „Konten und Sparbücher zusammen. Ohne eigenes Haus und Auto.“ |
| `auto.hint` | Nein | In die Beschriftung: „Wert deines Autos (ungefähr, sonst leer)“ |
| `vg.name.hint` | Ja (Datenschutz-Schutz) | Kürzen: „Kurz, kein voller Name. Zum Beispiel ‚Familie M.‘“ |

### Leistungs-Check: Ergebnis
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `legende` | Ja | Bleibt, kürzen: „Beträge sind geschätzt. Genau rechnet das Amt.“ Die Wörter „Wahrscheinlich/Möglich“ erklären sich an den Karten |
| Kasten „Zwei Wege“ (`ww.*`, 150 Wörter vor der ersten Karte) | Ja, verhindert Geldverlust | Bleibt, aber **zugeklappt**: sichtbar nur Titel + `ww.tipp` („Stelle beide Anträge gleichzeitig …“). Wege 1/2 und „So entscheiden die Ämter“ ▸. Oder unter die ersten drei Karten setzen |
| `karte-hinweis` (ⓘ-Kasten in Koralle) | Ja | Bleibt, höchstens einer je Karte. Farbe: Koralle wirkt wie Warnung, ist aber ein Tipp → Tipp-Muster (siehe c) |
| `beh.pruefen` ⚖ (Quelle der Anschrift, 22 Wörter je Karte) | Quelle ja | ⓘ an der Anschrift: „Quelle und Stand“. Sichtbar nur: „Bitte vor dem Absenden prüfen.“ |
| `haken.hint`, `steps.note` | – | Erledigt sich mit Umbau (Schritte/Unterlagen wandern in die Mappe) |
| `res.beratung` + `foot.2` | Ja | Bleibt, einmal am Ende der Liste. `foot.2` (Namen der Verbände) ▸ |
| `foot.1` ⚖ („keine Rechtsberatung“) | Ja, am Ergebnis | Heute nur in Einstellungen › Über die App. **Verlegen** als eine graue Zeile unter das Ergebnis: „Erste Einschätzung, keine Rechtsberatung. Es entscheidet das Amt.“ |
| `f.intro` (46 Wörter vor den Namensfeldern) | Zum Teil | Kürzen: „Trag deinen Namen und deine Anschrift ein. Du bekommst fertige Antragsbriefe.“ Erklärung „formloser Antrag“ ▸ |

### Antragsmappe
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `f.deNote` | Nur bei anderer Sprache | Nur zeigen, wenn die App-Sprache nicht Deutsch ist |
| `f.stichtag` ⚖ (Antrag sichert den Monat) | Ja, Frist | Bleibt, **unter** die Knöpfe, kürzen: „Der Brief gilt als Antrag. Er sichert den Monat, in dem er ankommt.“ |
| `f.adrFehlt` | Ja, wenn Anschrift fehlt | Bleibt (Warnung, ändert etwas) |
| `f.empfHinweis` + `f.empfSuche` (42 Wörter, je Brief) | Nur wenn Anschrift fehlt | Nur zeigen, wenn die App keine Anschrift einsetzen konnte. Sonst hinter Knopf „Empfänger ändern“ |
| `haken.hint` (8-mal) | Nein | Einmal über der ersten Liste: „Hake ab, was du schon hast.“ Datenschutz-Halbsatz streichen |

### Brief prüfen
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `briefe.t` | Nein | Streichen |
| `briefe.hinweis` ⚖ (Datenschutz + Rechtsberatung, vor allem anderen) | Rechtsberatung: ja, am Prüfergebnis. Datenschutz: zentral | **Verlegen**: „Keine Rechtsberatung. Im Zweifel eine Beratungsstelle fragen.“ unter das Prüfergebnis und in den Widerspruchs-Entwurf. Auf der Eingabeseite streichen |
| Einleitungs-Absatz je Absender (fest im Code der Prüfpakete, z. B. „Trage die Personen der Bedarfsgemeinschaft …“, 40–50 Wörter) | Zum Teil | Ein Satz sichtbar („Scanne den Bescheid. SoLo rechnet nach.“), Rest ▸. Die Erklärung der Bedarfsgemeinschaft gehört zu „Personen“, nicht an den Seitenanfang |
| `el.privat` ⚖ (Foto wird gelöscht + Werte vergleichen) | Ja, hier wird ein Foto gemacht | Bleibt direkt unter den Scan-Knöpfen, kürzen: „Das Foto bleibt auf dem Gerät und wird danach gelöscht.“ Den Satz „Jeden Wert mit dem Brief vergleichen“ erst **nach** dem Lesen zeigen (dort steht er sinngemäß schon) |
| `sc.intro` (Antragsformular) | Ja, kurz | Kürzen: „SoLo erklärt jedes Feld. Ausfüllen musst du selbst.“ |
| `sc.localNote` ⚖ (lädt Programm aus dem Internet, nur Web) | Ja, nur Web-Version | Bleibt nur in der Web-Version, Wort „Standard:“ streichen. In der App: wie `el.privat` |
| `sc.check` ⚖ | Ja, am Ergebnis | Bleibt beim Ergebnis |
| `briefe.nurDeutsch`, `pu.nurDe` | Ja, nur bei anderer Sprache | Bleibt, unverändert |
| Feld-Hilfen „Im Berechnungsbogen bei …“ (9 Stück, fest in `erweiterungen/bescheid-*.js`) | Ja, aber je Feld | Hinter „Wo steht das?“ am Feld (ⓘ). Sichtbar wird nur die Hilfe des angetippten Feldes |
| „Erst wenn diese Angaben eingetragen sind …“ (`erweiterungen/vorschau.js:368`) | Ja | Bleibt, als Text am gesperrten Knopf |
| „Bitte die Frist im Brief selbst nachlesen …“ (`vorschau.js:801`) ⚖ | Ja, Frist | Bleibt |
| `el.ks.hinweis` ⚖ | Ja, am Ergebnis | Bleibt, ein Satz |

### Pflege
| Schlüssel / Stelle | Braucht es ihn? | Vorschlag |
|---|---|---|
| `pu.pg.hint` | Ja, kurz | Bleibt (6 Wörter) |
| Einleitung „Aufs Konto kommen nur …“ (`src/app.js:3294`, 34 Wörter) | Ja, wichtig („wer nicht nutzt, verschenkt Hilfe“) | Kürzen: „Nur das Pflegegeld kommt aufs Konto. Alles andere sind Budgets: nutzen oder verschenken.“ |
| `PU_ART` „Budget: Die Pflegekasse bezahlt“ (grauer Satz je Karte) | Ja, als Merkmal | Als kleines Etikett neben dem Betrag („Budget“ / „aufs Konto“), nicht als Satz |
| „Hilfe bei allen Fragen …“ (`app.js:3327`) | Ja | Bleibt, einmal am Ende |
| „Stand der Beträge …“ ⚖ (`app.js:3190`/Ende der Liste) | Ja, Quelle | Bleibt als Quellen-Zeile am Ende, zugeklappt (siehe c) |
| Kasten „So geht es“ (`erweiterungen/pflege-assistent.js:116–121`, 72 Wörter vor der ersten Frage) | Zum Teil | Erste Frage zuerst. „So geht es“ ▸ unter dem Weiter-Knopf. Der Satz „Es zählt nur Hilfe durch andere Menschen“ gehört an die erste Bereichsfrage. „Antworten bleiben auf dem Gerät“ streichen |

### Geld sparen, Pfändung, Haushaltsplan, Schulden
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `sp.quellen`, `sp.schulden.quellen` ⚖ (bis 32 Wörter) | Quelle ja | Als zugeklappte Zeile „Quellen und Stand ▸“ am Seitenende. „Keine Rechtsberatung“ daraus streichen (zentral) |
| Themen-Listen (`sp.strom.*` usw., 85–169 Wörter) | Inhalt ja | Die 3 wirksamsten Tipps sichtbar, Rest ▸ „Mehr Tipps“. Erledigt sich teils mit Umbau „Geld und Schulden“ |
| `sp.rezepte.t` | Nein | Kürzen: „Je 4 Portionen.“ |
| `pf.stand` ⚖ (Startseite Pfändung) | Quelle ja, aber am Ergebnis | **Verschieben** unter das Ergebnis als „Quellen und Stand ▸“. Auf der Auswahlseite streichen |
| `pf.pers.hint` (18 Wörter, vor der Auswahl) | Ja | Kürzen: „Zum Beispiel Kinder oder Ehepartner. Unsicher? 0 wählen.“ und **unter** die Zahlenknöpfe |
| `pf.kg.hint`, `pf.netto.hint` | Ja, kurz | Bleiben |
| „Geschützt sind mindestens …“ + `pf.tipp.unterhalt` ⚖ | Ja, ändert das Ergebnis | Bleiben. `pf.tipp.unterhalt` als Warnung gestalten (ist heute grau wie ein Feldhinweis) |
| `pf.alt` ⚖ (Werte abgelaufen) | Ja | Bleibt (Warnung) |
| `hb.plan.lead` + `hb.rest.leer` (zwei Einleitungen) | Eine reicht | `hb.plan.lead` streichen |
| `hb.geteilt` („Gilt auch im Leistungs-Check“, bis 4-mal) | Einmal | Einmal oben am Block „Einnahmen“, an den Feldern streichen |
| `hb.uebernommen` | Ja, kurz | Kürzen auf Etikett am Feld: „übernommen“ |
| `hb.aus.t` | Nein | Streichen (Kacheln erklären sich) |
| `hb.scan.t` ⚖ | Ja, Foto | Bleibt, direkt am Knopf |
| „Bewilligt bis (freiwillig, für eine Erinnerung)“ | – | Gut so (zugeklappt) |
| `sl.lead` (25 Wörter vor dem Knopf) | Zum Teil | Kürzen: „Schreib alle Schulden auf. Die Liste zeigt, was zuerst wichtig ist.“ |
| `sl.privat` (27 Wörter) | Nein, zentral | Streichen. PIN-Tipp gehört in Einstellungen |
| `sl.f.glaeubiger.h`, `sl.f.stand.h` | Ja, kurz | Bleiben, zweiten kürzen: „Mit Zinsen. Unsicher? Leer lassen.“ |
| `sl.druck.hinweis` ⚖ | Ja, auf dem Ausdruck | Bleibt |

### Ich ziehe aus
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `az.lead` | Nein | Streichen |
| `az.stand` ⚖ (auf 6 Unterseiten) | Stand ja, „ersetzt keine Beratung“ zentral | Zeile „Quellen und Stand ▸“ am Seitenende, einheitlich. Halbsatz „ersetzen keine Beratung“ streichen |
| Warnkasten „Unter 25 und Grundsicherungsgeld?“ ⚖ | Ja, kostet sonst Miete | Bleibt sichtbar. Text nach der Überschrift kürzen auf 2 Sätze, Paragraf ▸ |
| Quellenzeile je Karte („Quelle: Verbraucherzentrale … abgerufen am …“) ⚖ | Quelle ja | Aus jeder Karte heraus in „Quellen und Stand ▸“ am Seitenende |
| „Finger weg!“ (212 Wörter offen) | Inhalt ja | Je Karte nur Titel + ein Satz, Rest ▸ (wie in den anderen Bereichen schon gemacht) |
| `az.notiz.t` | Nein | Als Platzhalter ins Notizfeld: „Termine, Namen, Fragen …“ |
| `az.vers.tipp` | Ja | Kürzen: „Vergleiche selbst. Unabhängig berät die Verbraucherzentrale.“ |

### Mein Ordner, Einstellungen
| Schlüssel | Braucht es ihn? | Vorschlag |
|---|---|---|
| `vg.t` | – | Erledigt sich mit Umbau. Im neuen Feld „Neuen Vorgang speichern“ keinen Einleitungssatz |
| `fri.lead` | Nein | Streichen |
| `fri.merken.t` | Nein | Kürzen: „Die Frist steht dann in ‚Mein Ordner‘.“ |
| `set.es.t` | Nein | Streichen |
| `vg.auto.t` | Nein | ⓘ |
| `vg.pin.t` (43 Wörter vor dem Knopf) | Zum Teil | Sichtbar: „Mit PIN sieht niemand deine Angaben, der dein Handy in die Hand bekommt.“ Rest ▸ |
| `vg.pin.vergessen` ⚖ | Ja, Datenverlust | Bleibt als Warnung, zusätzlich in der Rückfrage beim Festlegen |
| `fri.set.t` | Nein | Kürzen: „Höchstens einmal am Tag.“ |
| `set.beratung.t` | Ja | Kürzen: „Zeigt Paragrafen bei den Ergebnissen.“ |
| `foot.1`, `foot.3`, `rules.*` ⚖ | Ja | Bleiben hier. Das ist die zentrale Stelle |

---

## (c) Einheitliche Regeln (Gestaltungsregel für alle Seiten)

**Reihenfolge auf jeder Seite:** Zurück + Titel → höchstens ein Satz (max. 12 Wörter) → Handlung → Ergebnis → Hinweise → „Quellen und Stand“.

| Art | Wann | Aussehen | Wo | Wie oft |
|---|---|---|---|---|
| **Feld-Hilfe** | sagt, *was* einzutragen ist | graue Zeile, max. 8 Wörter | direkt unter dem Feld | höchstens 1 je Feld. Besser: in Beschriftung oder Platzhalter |
| **Info ⓘ** | erklärt *warum* oder Sonderfälle | rundes ⓘ rechts neben der Beschriftung, öffnet Text an Ort und Stelle | am Feld | beliebig, da zugeklappt |
| **Mehr dazu ▸** | längere Erklärung zu einer Karte | Textlink „Mehr dazu“, überall gleich benannt | unten in der Karte | 1 je Karte |
| **Tipp** | spart Geld oder Zeit | grüner Kasten (`--ok-bg`), ein Satz, Wort „Tipp:“ | nach dem Ergebnis | höchstens 1 je Bildschirm |
| **Warnung** | nur wenn sonst Geld, Frist oder Daten verloren gehen | Bernstein (`--warn-bg`), Wort „Wichtig:“, ein bis zwei Sätze | direkt vor der Handlung, die sie betrifft | höchstens 1 je Bildschirm |
| **Datenschutz** | zentral | Koralle-Zeile mit Schild (wie `home.sicher`) | Startseite + Erststart + Einstellungen | 1-mal. Zusätzlich nur dort, wo Kamera oder Datei gewählt wird (ein Satz am Knopf) |
| **Keine Rechtsberatung** ⚖ | zentral + an Ergebnissen | graue Zeile, immer derselbe Satz: „Erste Einschätzung, keine Rechtsberatung. Es entscheidet das Amt.“ | Erststart, Einstellungen › Über die App, unter jedem Ergebnis (Check, Brief-Prüfung, Pfändung), auf jedem Ausdruck | nie auf Eingabe- oder Auswahlseiten |
| **Quelle und Stand** ⚖ | bei Zahlen, Grenzen, Anschriften | zugeklappte Zeile „Quellen und Stand ▸“ | immer letzte Zeile der Seite bzw. ⓘ an der Anschrift | 1 je Seite |

Weitere Regeln:
- Kein Datenschutz-Satz in Feld-Hilfen (`plz.hint`, `haken.hint`, `az.notiz.t`, `fri.*`).
- Derselbe Hinweis nie zweimal auf einem Bildschirm. In Listen einmal über der Liste.
- Koralle (`hinweis-koralle`, `karte-hinweis`) nur für Datenschutz und persönliche Hinweise, nicht für Tipps. Heute sieht der Tipp in der Karte aus wie eine Warnung.
- Hinweise, die nur in einem Fall gelten, erst zeigen, wenn der Fall gewählt ist (`hh.hint`, `f.deNote`, `f.empfHinweis`, Bundesland/Mietenstufe).
- Ein Wort für eine Sache: überall „Mehr dazu“ (heute auch „Mehr anzeigen“, „Gut zu wissen“, „Weitere Angaben“, „Wörter im Bescheid erklärt“ – die letzten zwei sind als eigene Titel in Ordnung).

Hinweis zur Rechtslage: Wo „keine Rechtsberatung“ stehen **muss**, ist eine juristische Frage. Der Vorschlag hält den Satz an jedem Ergebnis und auf jedem Ausdruck und nimmt ihn nur von Eingabeseiten. Vor dem Umsetzen bitte einmal rechtlich gegenlesen lassen.

---

## (d) Die 10 wirkungsvollsten Änderungen

| Nr. | Änderung | Wirkung |
|---|---|---|
| 1 | Kopf-Satz `lead` auf allen Unterseiten streichen; Kopf = „← Zurück“ + Titel | 11 Infofelder weg, Inhalt rückt auf jeder Seite rund 60 px hoch |
| 2 | Datenschutz einmal zentral (`home.sicher` + Erststart). `home.privat`, `sl.privat` und die Halbsätze in `plz.hint`, `haken.hint`, `az.notiz.t`, `fri.lead`, `vg.t`, `sample`, `f.intro` streichen | aus 20 Texten werden 4 (Start, Erststart, Kamera, PIN) |
| 3 | „Keine Rechtsberatung“ ⚖: ein fester Satz, nur am Erststart, an Ergebnissen, auf Ausdrucken, in „Über die App“. `briefe.hinweis` von den 8 Absender-Seiten nehmen. `first.text` beim ersten App-Start zeigen, nicht nur im Leistungs-Check | 8 Infofelder vor der Handlung weg, Hinweis erreicht erstmals alle Nutzer |
| 4 | Brief-Seiten: Scan-Knöpfe direkt unter den Titel, ein Satz Erklärung, Rest ▸ | von 48–74 auf rund 10 Wörter vor der Handlung, Knopf bei 200 statt 450–620 px |
| 5 | Leistungs-Check: Feld-Hinweise nach der Liste oben kürzen oder hinter ⓘ; Bundesland und Mietenstufe nur zeigen, wenn die PLZ nichts findet | 30 → 8 Infofelder, Formular deutlich kürzer |
| 6 | Leistungs-Check: erste Frage zuerst. „Beispiel laden“, „Kurzer Check“, „Alle Angaben löschen“ ans Ende; Lösch-Erklärung in die Rückfrage | kein Lösch-Knopf mit 34 Wörtern vor der ersten Frage |
| 7 | Ergebnis: Kasten „Zwei Wege“ zuklappen (nur Titel + Tipp); `beh.pruefen` hinter ⓘ; `foot.1` als eine Zeile unter die Liste | erste Karte ohne langes Scrollen sichtbar |
| 8 | Antragsmappe: `f.deNote` nur bei Fremdsprache, `f.stichtag` unter die Knöpfe, `f.empfHinweis` nur bei fehlender Anschrift, `haken.hint` einmal | 18 → 4 Infofelder, „Drucken“ ganz oben |
| 9 | „Quellen und Stand ▸“ als eine zugeklappte Zeile am Seitenende (Sparen, Pfändung, Pflege, Ich ziehe aus, Schulden) statt offener Absätze und Quellen in jeder Karte | rund 15 offene Quellen-Absätze weg, Quellen bleiben vollständig ⚖ |
| 10 | Lange Fließtexte kürzen: Pflege-Vorab „So geht es“ hinter die erste Frage, „Finger weg!“ und Spar-Themen auf Titel + ein Satz + ▸, Brief-Feldhilfen hinter „Wo steht das?“ | bis zu 212 Wörter vor der Handlung werden zu unter 15 |

Reihenfolge der Umsetzung: 1–4 sind klein (Vorlage und wenige Stellen in `src/app.js`). 5–8 betreffen `src/template.html`, `src/app.js` und alle Sprachdateien. 9–10 brauchen ein gemeinsames Bauteil für ⓘ und „Quellen und Stand“.

Zu beachten beim Umsetzen: gekürzte Texte in allen 13 Sprachen und in `src/lang/einfach/` angleichen; `docs/PRUEFLISTE.md` und Faktenblatt anpassen (Vorgabe aus CLAUDE.md); Tests, die auf Hinweistexte prüfen (`test/dom-test.js`, `test/test-anzeige.js`, `test/e2e-*.js`), laufen lassen.

---

## Nebenbefunde (nicht Teil des Auftrags, beim Prüfen aufgefallen)

| Befund | Stelle |
|---|---|
| Nach dem Einfügen eines Bescheid-Textes mit „innerhalb eines Monats“ zeigt die App „Frist im Brief: **Monats**“ (abgeschnittenes Wort statt „1 Monat“) | Brief › Anderer Brief › Text einfügen, Foto `11-brief-an-gelesen.png` |
| `first.text` (Erstbesuch-Hinweis) liegt im Bereich Leistungs-Check. Wer zuerst eine andere Kachel öffnet, sieht ihn nie | `src/template.html` Zeile 1111 |
| `home.sicher` (die zentrale Datenschutz-Zeile) liegt bei 1.045 px, also unter dem ersten Bildschirm. Ohne Scrollen sieht man sie nicht | Startseite, Foto `01-start.png` (Zeile ist dort nicht zu sehen) |
| Der Tipp in der Ergebniskarte (`karte-hinweis`) nutzt die Koralle-Farbe für persönliche Hinweise und wirkt wie eine Warnung | `docs/FARBEN.md`, Abschnitt Zustände |

Arbeitskopie der Prüfung liegt noch unter `/home/claude/wt-uxpruef` (git worktree, keine Änderungen, kann weg mit `git worktree remove /home/claude/wt-uxpruef`).
