# Abhängigkeiten der 32 Karten: Prüfung gegen das geltende Recht

Stand der Prüfung: 20.11.2026. Alle Fundstellen am 20.11.2026 direkt abgerufen.
Geprüft: `test/abhaengigkeiten.json`, `test/test-abhaengigkeiten.js`, `src/rules.js` (Branch `claude/b-abhaengigkeiten`).
Nicht geändert: App-Code und `test/abhaengigkeiten.json` (Auftrag).

Abkürzung der Quellen (GiI = gesetze-im-internet.de, amtliche Seite des Bundes; BY = gesetze-bayern.de, amtliche Seite des Freistaats):

| Kürzel | Link |
|---|---|
| § 8 BAföG | https://www.gesetze-im-internet.de/baf_g/__8.html |
| § 10 BAföG | https://www.gesetze-im-internet.de/baf_g/__10.html |
| § 60 SGB III | https://www.gesetze-im-internet.de/sgb_3/__60.html |
| § 136, § 138 SGB III | https://www.gesetze-im-internet.de/sgb_3/__136.html · https://www.gesetze-im-internet.de/sgb_3/__138.html |
| § 100 SGB IX | https://www.gesetze-im-internet.de/sgb_9_2018/__100.html |
| § 2, § 58, § 61 SGB IX | https://www.gesetze-im-internet.de/sgb_9_2018/__2.html · https://www.gesetze-im-internet.de/sgb_9_2018/__58.html · https://www.gesetze-im-internet.de/sgb_9_2018/__61.html |
| § 6 SGB VIII | https://www.gesetze-im-internet.de/sgb_8/__6.html |
| § 23, § 72 SGB XII | https://www.gesetze-im-internet.de/sgb_12/__23.html · https://www.gesetze-im-internet.de/sgb_12/__72.html |
| § 1, § 2, § 3, § 6, § 9 AsylbLG | https://www.gesetze-im-internet.de/asylblg/__1.html · https://www.gesetze-im-internet.de/asylblg/__2.html · https://www.gesetze-im-internet.de/asylblg/__3.html · https://www.gesetze-im-internet.de/asylblg/__6.html · https://www.gesetze-im-internet.de/asylblg/__9.html |
| § 7 SGB II | https://www.gesetze-im-internet.de/sgb_2/__7.html |
| § 3, § 7 WoGG | https://www.gesetze-im-internet.de/wogg/__3.html · https://www.gesetze-im-internet.de/wogg/__7.html |
| § 27 WoFG | https://www.gesetze-im-internet.de/wofg/__27.html |
| Art. 14 BayWoFG, Art. 4 BayWoBindG | https://www.gesetze-bayern.de/Content/Document/BayWoFG-14 · https://www.gesetze-bayern.de/Content/Document/BayWoBindG-4 |
| § 62 EStG | https://www.gesetze-im-internet.de/estg/__62.html |
| § 6a BKGG | https://www.gesetze-im-internet.de/bkgg_1996/__6a.html |
| § 1 UVG | https://www.gesetze-im-internet.de/uhvorschg/__1.html |
| § 1 BEEG | https://www.gesetze-im-internet.de/beeg/__1.html |
| § 10, § 45, § 50, § 62, § 264 SGB V | https://www.gesetze-im-internet.de/sgb_5/__10.html · https://www.gesetze-im-internet.de/sgb_5/__45.html · https://www.gesetze-im-internet.de/sgb_5/__50.html · https://www.gesetze-im-internet.de/sgb_5/__62.html · https://www.gesetze-im-internet.de/sgb_5/__264.html |
| § 33 SGB XI | https://www.gesetze-im-internet.de/sgb_11/__33.html |
| § 43 SGB VI | https://www.gesetze-im-internet.de/sgb_6/__43.html |
| Art. 1 BayBlindG | https://www.gesetze-bayern.de/Content/Document/BayBlindG-1 |
| Art. 2 BayLPflGG | https://www.gesetze-bayern.de/Content/Document/BayLPflGG-2 |
| § 4 RBStV | https://www.gesetze-bayern.de/Content/Document/RBeitrStV-4 |

Wichtig für alle Zeilen zu „asyl“: Der Wert bündelt Aufenthaltsgestattung, Duldung und Ausreisepflicht. Alle drei sind leistungsberechtigt nach § 1 Abs. 1 AsylbLG (Nr. 1, 4, 5). Mehrere Gesetze behandeln Gestattung und Duldung aber unterschiedlich (BAföG, BAB, Wohngeld). Deshalb ist oft nur „möglich“ richtig, nicht „nein“.

## 1. Ergebnis je Karte

| Karte | Angabe | Befund | Rechtsgrundlage (Abruf 20.11.2026) | Vorschlag |
|---|---|---|---|---|
| kindergeld | aufenthalt | ok | § 62 Abs. 2 EStG: nur mit bestimmten Titeln, mit Gestattung nie, mit Beschäftigungsduldung ja (Nr. 5). EU: § 62 Abs. 1a EStG | „möglich“ bei asyl bleibt. Kein Änderungsbedarf |
| kindergeld | kinder | ok | §§ 62, 63 EStG | – |
| kgBeh | aufenthalt | **Lücke (sicher)** | Gleiche Voraussetzung wie Kindergeld: § 62 Abs. 2 EStG | Bei asyl denselben Hinweis wie bei kindergeld zeigen (Stufe ist ohnehin höchstens „möglich“, außer bei `bhSelbst`: dort „ja“ auf „möglich“ senken). In Tabelle `aufenthalt` ergänzen |
| kgBeh | (Testlücke) | unklar | § 32 Abs. 4 Satz 1 Nr. 3 EStG | Karte hängt nur von `bhPerson`, `bhSelbst`, `bhEinkHoch` ab. Der Test verändert diese Angaben nicht, deshalb `haengtAb: []`. Test um Merkmal `bhPerson` erweitern |
| wohngeld | aufenthalt=asyl | **rechtlich nicht plausibel (sicher)** | § 3 Abs. 5 Nr. 2 und 4 WoGG: Duldung und Aufenthaltsgestattung SIND wohngeldberechtigt. Ausgeschlossen sind nur EMPFÄNGER von Leistungen nach AsylbLG (§ 7 Abs. 1 Nr. 8 WoGG) | Ausschluss „höchstens nein“ ist zu streng: Wer arbeitet und keine AsylbLG-Leistungen bezieht, kann Wohngeld bekommen. Vorschlag: „höchstens möglich“ mit Text „nur ohne Bezug von Asylbewerberleistungen“. Fundstelle in Tabelle und Code-Kommentar ist falsch: richtig **Nr. 8**, nicht Nr. 9 (Nr. 9 = SGB VIII) |
| wohngeld | übrige | ok | WoGG | – |
| kiz | aufenthalt=asyl | unklar | § 6a Abs. 1 Nr. 1 und 3 BKGG (Kindergeldanspruch; Vermeidung von Hilfebedürftigkeit nach § 9 SGB II), § 7 Abs. 1 Satz 2 Nr. 3 SGB II | „nein“ ist vertretbar, weil Leistungsberechtigte nach AsylbLG vom SGB II ausgenommen sind. Nicht aus dem Gesetzeswortlaut allein belegbar. Ergänzend BSG 15.12.2010, B 14 KG 1/09 R (hier NICHT amtlich abgerufen). In gemischten Haushalten (ein Elternteil deutsch) ist „nein“ falsch: Text entsprechend einschränken oder „möglich“ |
| kiz | alter, arbeit, baby, übrige | ok | § 6a BKGG | – |
| ggeld | aufenthalt | ok | § 7 Abs. 1 Satz 2 Nr. 1–3 SGB II | Vermerk „vor Übernahme prüfen“ kann entfallen |
| ggeld | übrige | ok | SGB II | – |
| but | aufenthalt=asyl | **Lücke (sicher)** | § 3 Abs. 4 AsylbLG: Bildung und Teilhabe entsprechend §§ 34, 34a, 34b SGB XII. Nach 36 Monaten § 2 Abs. 1 AsylbLG | Karte zeigt bei asyl „nein“ (Text `but.fehlt`), obwohl die Karte asylblg zugleich „auch Bildung und Teilhabe“ sagt. Bei asyl und Kindern: mindestens „möglich“, besser „ja“ bei Bezug von Asylbewerberleistungen |
| uvg | aufenthalt | ok | § 1 Abs. 2a UVG | – |
| uvg | einkommen | unklar | § 1 Abs. 1a UVG (Kinder ab 12: kein Grundsicherungsgeld oder mindestens 600 € brutto) | Code berücksichtigt das (`uvg.ab12`), aber nur als Hinweistext. Stufe ändert sich nicht, daher fehlt `einkommen` in der Tabelle. Vertretbar, da das Alter der Kinder unbekannt ist |
| gsa | aufenthalt | ok | § 23 Abs. 2 und 3 SGB XII | Vermerk „vor Übernahme prüfen“ kann entfallen. Text nennt bei asyl den Schlüssel `ggeld.asyl` (passt inhaltlich) |
| bafoeg | aufenthalt=asyl | **Lücke (sicher)** | § 8 BAföG: Gestattung nicht genannt (nur über Abs. 3: 5 Jahre eigene oder 3 Jahre Erwerbstätigkeit eines Elternteils). Duldung erst nach 15 Monaten Aufenthalt (Abs. 2a) | Karte zeigt bei „Kind in Ausbildung“ und kleinem Einkommen „ja“, auch bei asyl. Bei asyl höchstens „möglich“ mit Hinweis auf 15 Monate (Duldung). Ausschluss-Regel „höchstens möglich“ in die Tabelle |
| bafoeg | aufenthalt=eu | Lücke (möglich) | § 8 Abs. 1 Nr. 2–4 BAföG: Unionsbürger nur mit Daueraufenthalt, als Arbeitnehmer/Selbständige, als deren Familienangehörige oder nach passender Vorbeschäftigung | Bei `eu` ohne Arbeit und unter 5 Jahren (`euAusschluss`) „ja“ auf „möglich“ senken |
| bafoeg | alter | ok | § 10 Abs. 3 BAföG (45 Jahre bei Beginn, Ausnahmen) | – |
| pflege, pflegeplus | aufenthalt=asyl | Lücke (möglich) | § 33 Abs. 1 und 2 SGB XI: nur Versicherte, Vorversicherungszeit 2 Jahre in 10 Jahren. Kein Aufenthaltskriterium | Wer nur Grundleistungen nach AsylbLG bezieht und nicht arbeitet, ist in der Regel nicht pflegeversichert. Stufe „ja“ setzt aber einen Pflegegrad voraus (also meist Versicherung). Hinweistext „nur mit Pflegeversicherung“ bei asyl genügt |
| emrente, srente | aufenthalt | ok | § 43 SGB VI: Versicherungsleistung, kein Aufenthaltskriterium | – |
| emrente | alter | ok | § 43 Abs. 1 SGB VI („bis zum Erreichen der Regelaltersgrenze“) | – |
| eingl | aufenthalt=asyl | **Lücke (sicher)** | § 100 Abs. 2 SGB IX: Leistungsberechtigte nach § 1 AsylbLG erhalten keine Eingliederungshilfe. Ausnahmen: nach 36 Monaten § 2 Abs. 1 AsylbLG (Teil 2 SGB IX entsprechend); davor Ermessen § 6 AsylbLG; Kinder mit seelischer Behinderung mit Duldung oder rechtmäßigem Aufenthalt § 6 Abs. 2 SGB VIII | Stufe „möglich“ kann bleiben, aber eigener Text bei asyl: „meist erst nach 36 Monaten; vorher nur im Einzelfall“. Sonst falsche Erwartung. `aufenthalt` in Tabelle erst nach Stufenänderung |
| eingl | aufenthalt=eu | ok | § 100 Abs. 1 SGB IX (Ermessen, Anspruch bei voraussichtlich dauerhaftem Aufenthalt) | – |
| eingl | alter, pflegegrad | ok (Heuristik) | § 99 SGB IX kennt keine Altersgrenze | Abhängigkeit kommt nur daher, dass reine Pflege im Rentenalter nicht vorgeschlagen wird. Kein Rechtsfehler |
| arbeit | aufenthalt=asyl | Lücke (möglich) | § 61 Abs. 1 SGB IX setzt Anspruch nach § 58 voraus; ist die Eingliederungshilfe Träger, gilt § 100 Abs. 2 SGB IX | Selten. Hinweis bei asyl genügt |
| arbeit | alter | ok | § 58 Abs. 1 Satz 3 SGB IX (in der Regel bis Regelaltersgrenze) | – |
| arbeit | (Testlücke) | unklar | – | Karte hängt von `wfbm` ab; der Test setzt `wfbm` nie. Deshalb `haengtAb: []`. Merkmal ergänzen |
| pausch | aufenthalt | ok | § 33b EStG (Steuerrecht, kein Aufenthaltstitel nötig) | – |
| ausweis | aufenthalt=asyl | unklar | § 2 Abs. 2 SGB IX: Wohnsitz, gewöhnlicher Aufenthalt oder Beschäftigung „rechtmäßig“ im Inland | Bei Gestattung und Duldung nicht eindeutig aus dem Wortlaut. Rechtsprechung des BSG lässt die Feststellung bei längerem Aufenthalt zu (hier nicht amtlich abgerufen). Vorschlag: bei asyl „ja“ auf „möglich“ |
| blindengeld | aufenthalt=asyl | unklar | Art. 1 Abs. 1 BayBlindG (Wohnsitz oder gewöhnlicher Aufenthalt in Bayern). § 9 Abs. 1 AsylbLG: keine Leistungen nach SGB XII „oder vergleichbaren Landesgesetzen“ | Ob das Landesblindengeld „vergleichbar“ ist, steht nicht im Gesetz. Karte zeigt bei asyl „ja“: auf „möglich“ senken (keine falsche Zusage). Für andere Länder gilt das jeweilige Landesgesetz |
| blindengeld | bundesland, blind | ok | Art. 1 BayBlindG | – |
| blh | aufenthalt=asyl | ok | § 23 Abs. 2 SGB XII, § 2 Abs. 1 AsylbLG (36 Monate) | Text `blh.asyl` stimmt |
| blh | aufenthalt=eu | **Lücke (sicher)** | § 23 Abs. 3 Satz 1 SGB XII gilt für alle Leistungen nach Abs. 1 (auch Blindenhilfe) | `euAusschluss` wie bei gsa anwenden |
| hzp | aufenthalt=asyl | **Lücke (sicher)** | § 23 Abs. 2 SGB XII: keine Sozialhilfe für Leistungsberechtigte nach § 1 AsylbLG. Nach 36 Monaten § 2 Abs. 1 AsylbLG; davor § 6 AsylbLG (Ermessen) | Wie bei blh: bei asyl „möglich“ mit eigenem Text (analog `blh.asyl`). Heute erscheint der normale Text „zahlt der Sozialhilfeträger den Rest“ |
| hzp | aufenthalt=eu | **Lücke (sicher)** | § 23 Abs. 1 Satz 1 und Abs. 3 Satz 1 SGB XII (Hilfe zur Pflege ausdrücklich erfasst) | `euAusschluss` wie bei gsa anwenden |
| hzp | einkommen | unklar | §§ 85 ff. SGB XII | Einkommen ändert nur den Text, nicht die Stufe. Vertretbar |
| rundfunk | aufenthalt=asyl | ok | § 4 Abs. 1 Nr. 4 RBStV (Empfänger von Leistungen nach AsylbLG) | – |
| zuzahl | aufenthalt=asyl | unklar | § 62 Abs. 1 SGB V gilt für Versicherte; Empfänger nach § 2 AsylbLG werden über § 264 Abs. 2 SGB V von der Krankenkasse betreut | Stufe ist „möglich“. Hinweis bei asyl sinnvoll, kein Muss |
| zuzahl | behinderung als einzige Voraussetzung | unklar | § 62 Abs. 1 SGB V: Belastungsgrenze gilt für ALLE Versicherten (2 %, chronisch Kranke 1 %) | Karte erscheint nur bei Behinderung/Pflegegrad. Rechtlich zu eng, aber als Auswahl vertretbar. Kein Fehler in der Tabelle |
| famvers | aufenthalt | ok | § 10 Abs. 1 Nr. 1 SGB V: Wohnsitz oder gewöhnlicher Aufenthalt im Inland, kein Aufenthaltstitel | Voraussetzung ist ein Mitglied der Kasse. Bei asyl ohne Arbeit meist kein Mitglied: Hinweis möglich |
| famvers | einkommen | Testlücke | § 10 Abs. 1 Nr. 5 SGB V | Der Test setzt das Einkommen der 2. Person immer auf 0. Die Einkommensgrenze wird daher nie geprüft. Merkmal „Einkommen Person 2“ ergänzen |
| bab | aufenthalt=asyl | **Lücke (sicher)** | § 60 Abs. 3 SGB III: mit Aufenthaltsgestattung KEINE Berufsausbildungsbeihilfe; mit Duldung erst nach 15 Monaten Aufenthalt. (§ 59 SGB III ist weggefallen) | Bei asyl: Text „mit Gestattung nicht, mit Duldung nach 15 Monaten“; Stufe „möglich“ kann bleiben. `aufenthalt` wird erst testbar, wenn die Stufe reagiert |
| bab | ausbildung (Testlücke) | **Testlücke (sicher)** | § 57, § 60 Abs. 1 und 2 SGB III | Karte reagiert nur auf `ausbildung = 'kindBetrieb'` oder `'ich'` zusammen mit `babBetrieb` und `babWohnt`. Der Test kennt nur `'' / 'ich' / 'kind'` und setzt `babBetrieb` nie. Deshalb `haengtAb: []`. Test erweitern: Wert `kindBetrieb` und Haushalte mit `babBetrieb/babWohnt`; dann `ausbildung` in die Tabelle |
| bab | alter | ok | § 60 Abs. 2 Nr. 1 SGB III (ab 18 entfällt nur die Erreichbarkeits-Prüfung) | Keine Altersgrenze nötig |
| wbs | aufenthalt | bekannt | § 27 Abs. 2 Satz 2 WoFG; Bayern: Art. 14 Abs. 2 BayWoFG i. V. m. Art. 4 Abs. 1 BayWoBindG | Fundstelle stimmt. Der Wortlaut nennt keinen Aufenthaltstitel („nicht nur vorübergehend“, „rechtlich und tatsächlich in der Lage“). „Höchstens nein“ ist daher nur „möglich“ belegt; die Tabelle nennt selbst Ausnahmen. Vorschlag: „höchstens möglich“ oder eine amtliche Vollzugsvorschrift als Beleg ergänzen. Der genannte Entwurf `docs/entwuerfe/wbs-aufenthalt.md` fehlt in dieser Repo-Kopie |
| alg1 | aufenthalt=asyl | Lücke (möglich) | § 138 Abs. 1 Nr. 3 und Abs. 5 Nr. 1 SGB III: Verfügbarkeit verlangt, dass die Person arbeiten „kann und darf“ | Ohne Arbeitserlaubnis fehlt die Verfügbarkeit. Karte zeigt bei asyl „ja“: Hinweis ergänzen oder „möglich“ |
| alg1 | alter | ok | § 136 Abs. 2 SGB III | – |
| krankengeld | aufenthalt | ok | §§ 44 ff. SGB V (Versicherung) | – |
| krankengeld | alter | Lücke (möglich) | § 50 Abs. 1 Nr. 1 SGB V: kein Krankengeld bei Vollrente wegen Alters oder voller Erwerbsminderungsrente | Karte reagiert nicht auf Alter/Rente. Hinweis bei Rentenbezug sinnvoll |
| elterngeld | aufenthalt | ok | § 1 Abs. 7 BEEG (Gestattung nie; Beschäftigungsduldung Nr. 5) | Text `eg.asyl` stimmt |
| lpg | aufenthalt | ok | Art. 2 Abs. 1 BayLPflGG: gemeldete Haupt- oder alleinige Wohnung in Bayern, Pflegegrad 2. Kein Aufenthaltstitel. Betrag 500 € je Jahr (Abs. 4) stimmt mit `R.lpg.betrag` | Abs. 3: Pflegegrad muss von Pflegekasse, privater Versicherung oder Sozialhilfeträger festgestellt sein. Bei asyl ohne Versicherung: Hinweis möglich |
| mutter | aufenthalt | ok | § 24i SGB V, § 19 MuSchG (Mitgliedschaft oder Arbeitsverhältnis) | – |
| kkg | aufenthalt | ok | § 45 SGB V (Versicherte) | – |
| kkg | kinder, einkommen (Testlücke) | Testlücke | § 45 Abs. 1 SGB V (Kind unter 12 oder behindert) | Karte hängt von `kindKrank` ab; der Test setzt es nie. Deshalb `haengtAb: []`. Merkmal ergänzen |
| asylblg | aufenthalt | ok | § 1 Abs. 1 AsylbLG; 36 Monate: § 2 Abs. 1 AsylbLG | – |

## 2. Punkte außerhalb der Aufenthaltsfrage

| Thema | Befund | Beleg | Vorschlag |
|---|---|---|---|
| Karten mit `haengtAb: []` (kgBeh, arbeit, bab, kkg) | Kein Rechtsbefund, sondern Lücke im Test: Die auslösenden Angaben werden nie verändert | `test/test-abhaengigkeiten.js`, `zufall()` und `MERKMALE` | Merkmale `bhPerson`, `wfbm`, `kindKrank`, `babBetrieb/babWohnt` und Wert `kindBetrieb` aufnehmen. Sonst prüft der Test diese vier Karten gar nicht |
| Test ist bei kleiner Stichprobe nicht stabil | `node test/test-abhaengigkeiten.js 400` schlägt fehl („rundfunk muss von arbeit abhängen“), mit 1500 besteht er | eigener Lauf 20.11.2026 | Mindestzahl festlegen oder seltene Abhängigkeiten gezielt erzeugen |
| Verweis in `_info` | Die Tabelle verweist auf `docs/entwuerfe/abhaengigkeiten-pruefung.md`; diese Datei liegt laut Auftrag unter `/home/claude/abhaengigkeiten-pruefung.md` | – | Beim Übernehmen in den Ordner `docs/entwuerfe/` legen |
| Fundstelle Wohngeld | „§ 7 Abs. 1 Nr. 9 WoGG“ in `abhaengigkeiten.json` und in `src/rules.js` (Kommentar bei `wohngeld.asyl`) | § 7 Abs. 1 Nr. 8 WoGG | Auf Nr. 8 ändern |

## 3. Vorgeschlagene neue Ausschluss-Regeln für die Soll-Tabelle (erst nach Code-Änderung grün)

| Merkmal = Wert | Karte | höchstens | Quelle |
|---|---|---|---|
| aufenthalt = asyl | bafoeg | möglich | § 8 Abs. 2a, Abs. 3 BAföG |
| aufenthalt = asyl | kgBeh | möglich | § 62 Abs. 2 EStG |
| aufenthalt = asyl | blindengeld, ausweis | möglich | § 9 Abs. 1 AsylbLG; § 2 Abs. 2 SGB IX (unklar, daher nicht „ja“) |
| aufenthalt = asyl | alg1 | möglich | § 138 Abs. 5 Nr. 1 SGB III |
| aufenthalt = asyl | wohngeld | möglich (statt nein) | § 3 Abs. 5, § 7 Abs. 1 Nr. 8 WoGG |
| aufenthalt = asyl | but | mindestens möglich (Mindest-Regel neu) | § 3 Abs. 4 AsylbLG |

## Prüfvermerk (20.11.2026)

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| but zeigt bei asyl „nein“, obwohl Bildung und Teilhabe nach AsylbLG zusteht | hoch (falsche Absage) | nicht korrigiert (kein App-Code laut Auftrag), Vorschlag oben | § 3 Abs. 4 AsylbLG |
| bafoeg zeigt bei asyl „ja“ (Kind in Ausbildung) | hoch (falsche Zusage) | Vorschlag oben | § 8 BAföG |
| hzp, eingl, bab ohne Hinweis bei asyl; hzp und blh ohne EU-Ausschluss | mittel (Stufe „möglich“, aber irreführender Text) | Vorschlag oben | § 23 Abs. 2, 3 SGB XII; § 100 Abs. 2 SGB IX; § 60 Abs. 3 SGB III |
| wohngeld bei asyl pauschal „nein“ | mittel (falsche Absage für Erwerbstätige mit Duldung/Gestattung) | Vorschlag oben | § 3 Abs. 5, § 7 Abs. 1 Nr. 8 WoGG |
| Falsche Fundstelle „§ 7 Abs. 1 Nr. 9 WoGG“ | gering | nicht korrigiert (Datei gesperrt laut Auftrag) | § 7 Abs. 1 Nr. 8 WoGG |
| Vier Karten werden vom Test nicht erfasst (bab, kgBeh, arbeit, kkg) | mittel (Test täuscht Abdeckung vor) | Vorschlag oben | Testcode |
| Nicht amtlich belegt: BSG-Rechtsprechung zu kiz und ausweis; Vergleichbarkeit des Landesblindengelds nach § 9 Abs. 1 AsylbLG; Vollzug WBS in Bayern | offen | als „unklar“ gekennzeichnet | – |
