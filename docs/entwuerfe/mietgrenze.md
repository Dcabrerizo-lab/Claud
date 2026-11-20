# Entwurf: Höchstbetrag der Miete beim Wohngeld direkt bei der Mieteingabe (b-mietgrenze)

Stand: 20.11.2026. Code gelesen in `/home/claude/s1` (Stand PR #42). Nichts geändert.

---

## 1. Kurzfassung (was der Nutzer sieht)

1. Direkt unter dem Feld „Miete insgesamt im Monat (Warmmiete)“ steht eine Zeile: **„Für Wohngeld zählt höchstens 686,60 € Miete ohne Heizung (Mietenstufe III, 3 Personen).“**
2. Dahinter steht der Vergleich: „Deine Miete ohne Heizung (etwa 779,80 €) liegt darüber. Dann zählen nur 686,60 €. Wohngeld kannst du trotzdem bekommen.“ (oder „liegt darunter, sie zählt ganz“).
3. Kennt die App die Mietenstufe nicht sicher (PLZ fehlt oder hat mehrere Stufen), zeigt sie eine **Spanne** und das Wort „möglich“.
4. Darunter klappt „Was zählt beim Wohngeld als Miete?“ auf: Bruttokaltmiete, fester Heizkosten-Betrag, Klimakomponente, wer im Haushalt zählt, Stand 2027.
5. Ein eigener Absatz sagt deutlich: Beim Grundsicherungsgeld (früher Bürgergeld) gilt eine **andere, örtliche Grenze**, nicht diese Tabelle.

---

## 2. Inhalte und Texte (de + Einfache Sprache)

Die App spricht die Nutzer mit „du“ an (siehe `de.json`, z. B. `plz.label`). Im Auftrag steht „Ihre Miete“. Ich habe das an die App angepasst.
Die Schlüssel folgen dem Stil von `miete.*`, `plz.*` und `stufe.*`. Präfix: `wgmax.`. Platzhalter wie in `plz.found` (`{stufe}` römisch über `Rules.roman`, Beträge über `Fmt.euro`, mit Cent, wenn nötig).

### 2.1 Zeile unter dem Mietfeld

| Schlüssel | Deutsch (de.json) | Einfache Sprache (einfach/e.json) |
|---|---|---|
| `wgmax.p1` | 1 Person | 1 Person |
| `wgmax.pn` | {n} Personen | {n} Personen |
| `wgmax.zeile` | Für Wohngeld zählt höchstens {betrag} Miete ohne Heizung (Mietenstufe {stufe}, {personen}).¹ ² | Beim Wohngeld zählt die Miete ohne Heizung höchstens mit {betrag}. Das gilt für Mietenstufe {stufe} und {personen}. |
| `wgmax.zeileSpanne` | Möglich: Für Wohngeld zählen höchstens {von} bis {bis} Miete ohne Heizung ({personen}). Das hängt davon ab, welche Mietenstufe dein Wohnort hat (Stufe {sv} bis {sb}). Wähle unten deinen Wohnort. | Beim Wohngeld zählt die Miete ohne Heizung höchstens mit {von} bis {bis}. Das hängt von deinem Wohnort ab. Wähle unten deinen Wohnort. Dann wissen wir es genauer. |
| `wgmax.zeileOhne` | Für Wohngeld zählen je nach Wohnort höchstens {von} bis {bis} Miete ohne Heizung ({personen}). Gib unten deine Postleitzahl ein, dann wird es genauer. | Beim Wohngeld zählt die Miete ohne Heizung höchstens mit {von} bis {bis}. Das hängt von deinem Wohnort ab. Gib unten deine Postleitzahl ein. |
| `wgmax.drunter` | Deine Miete ohne Heizung ({kalt}) liegt darunter. Sie zählt ganz. | Deine Miete ohne Heizung ist {kalt}. Das ist weniger. Die ganze Miete zählt. |
| `wgmax.drunterEtwa` | Deine Miete ohne Heizung (geschätzt {kalt}) liegt darunter. Sie zählt wahrscheinlich ganz. | Deine Miete ohne Heizung ist ungefähr {kalt}. Das ist weniger. Die Miete zählt wahrscheinlich ganz. |
| `wgmax.drueber` | Deine Miete ohne Heizung ({kalt}) liegt darüber. Dann zählen nur {betrag}. Wohngeld kannst du trotzdem bekommen.³ | Deine Miete ohne Heizung ist {kalt}. Das ist mehr. Dann zählen nur {betrag}. Du kannst trotzdem Wohngeld bekommen. |
| `wgmax.drueberEtwa` | Deine Miete ohne Heizung (geschätzt {kalt}) liegt wahrscheinlich darüber. Dann zählen nur {betrag}. Wohngeld kannst du trotzdem bekommen. | Deine Miete ohne Heizung ist ungefähr {kalt}. Das ist wahrscheinlich mehr. Dann zählen nur {betrag}. Du kannst trotzdem Wohngeld bekommen. |
| `wgmax.nah` | Deine Miete ohne Heizung liegt geschätzt bei {kalt}, also nahe an der Grenze. Trage unten deine Heizkosten ein, dann wird es genauer. | Deine Miete ohne Heizung ist ungefähr {kalt}. Das ist fast genau die Grenze. Schreib unten deine Heizkosten dazu. Dann wissen wir es genauer. |
| `wgmax.moeglich` | Möglich: Deine Miete ohne Heizung ({kalt}) kann darüber liegen. Das hängt von der Mietenstufe ab. | Vielleicht ist deine Miete ohne Heizung ({kalt}) mehr als die Grenze. Das hängt von der Mietenstufe ab. |
| `wgmax.eigen` | Für den Lastenzuschuss (Wohngeld für Eigentum) zählen höchstens {betrag} im Monat (Mietenstufe {stufe}, {personen}). Was von deinen Kosten zählt, rechnet die Wohngeldstelle selbst aus.⁴ | Wohngeld gibt es auch für eine eigene Wohnung oder ein eigenes Haus. Dann heißt es Lastenzuschuss. Dabei zählen höchstens {betrag} im Monat. Was von deinen Kosten zählt, rechnet die Wohngeldstelle aus. |
| `wgmax.verwandte` | Wohnen Verwandte bei dir (zum Beispiel Eltern oder erwachsene Kinder), zählen sie beim Wohngeld meist mit. Dann ist der Höchstbetrag größer.⁵ | Wohnen Verwandte bei dir? Zum Beispiel deine Eltern oder deine erwachsenen Kinder? Dann zählen sie beim Wohngeld meistens mit. Dann darf die Miete höher sein. |

### 2.2 Zum Aufklappen (`<details>`)

| Schlüssel | Deutsch | Einfache Sprache |
|---|---|---|
| `wgmax.mehr` (summary) | Was zählt beim Wohngeld als Miete? | Was zählt beim Wohngeld als Miete? |
| `wgmax.d.kalt` | Gezählt wird die Bruttokaltmiete: Kaltmiete plus kalte Nebenkosten (zum Beispiel Wasser, Müll, Hausreinigung, Grundsteuer). Nicht dazu gehören Heizung und Warmwasser, Strom, Garage oder Stellplatz und Extras wie Betreuung oder Notruf.¹ | Beim Wohngeld zählt die Kaltmiete. Dazu kommen die Nebenkosten ohne Heizung, zum Beispiel Wasser und Müll. Nicht dazu zählen: Heizung, warmes Wasser, Strom, Garage. |
| `wgmax.d.heiz` | Für die Heizung rechnet die Wohngeldstelle immer einen festen Betrag dazu: {heiz} im Monat bei {personen}. Das gilt, egal wie hoch deine Heizkosten wirklich sind.⁶ | Für die Heizung gibt es einen festen Betrag dazu: {heiz} im Monat. Das ist immer gleich. Egal, wie viel deine Heizung kostet. |
| `wgmax.d.klima` | Im Höchstbetrag ist ein Zuschlag für energiesparende Wohnungen schon drin (Klimakomponente: {klima}).² | Im Höchstbetrag ist schon ein kleiner Zuschlag drin. Er ist für Wohnungen, die Energie sparen. Er heißt Klimakomponente: {klima}. |
| `wgmax.d.drueber` | Ist deine Miete höher, ist das kein Grund für eine Ablehnung. Die Wohngeldstelle rechnet nur mit dem Höchstbetrag. Den Rest zahlst du selbst.³ | Ist deine Miete höher? Dann bekommst du trotzdem Wohngeld, wenn alles andere passt. Es wird aber nur mit dem Höchstbetrag gerechnet. Den Rest zahlst du selbst. |
| `wgmax.d.personen` | Gezählt werden alle, die mit dir zusammen wohnen: Ehe- oder Lebenspartner, Kinder, auch Verwandte wie Eltern oder Geschwister. Mitbewohner in einer WG zählen nicht. Ein Kind, das bei beiden getrennten Eltern lebt (mindestens ein Drittel der Zeit), kann bei beiden zählen.⁵ | Es zählen alle, die mit dir zusammen wohnen: dein Partner oder deine Partnerin, deine Kinder, deine Verwandten. Mitbewohner in einer WG zählen nicht. |
| `wgmax.d.ausgeschlossen` | Bekommt jemand im Haushalt selbst Grundsicherungsgeld oder Sozialhilfe, zählt nur der Anteil der anderen. Dann ist der Höchstbetrag kleiner.⁷ | Bekommt jemand bei dir Grundsicherungsgeld oder Sozialhilfe? Dann zählt nur der Teil für die anderen. Dann ist der Höchstbetrag kleiner. |
| `wgmax.d.stufe` | Die Mietenstufe hängt von deinem Wohnort ab: Stufe I ist günstig, Stufe VII teuer. Quelle: Anlage zur Wohngeldverordnung, Mietenstufen seit 1.1.2023.⁸ Die Wohngeldstelle entscheidet verbindlich. | Die Mietenstufe hängt von deinem Wohnort ab. Stufe I heißt: Die Mieten sind dort niedrig. Stufe VII heißt: Die Mieten sind dort hoch. Die Wohngeldstelle entscheidet. |
| `wgmax.d.2027` | 2027: Der Höchstbetrag soll gleich bleiben (geplant: keine Erhöhung zum 1.1.2027). Geplant ist auch eine neue Zuordnung der Mietenstufen ab 1.1.2027. Deine Stufe kann sich dann ändern. Beides ist noch nicht beschlossen (Stand 20.11.2026).⁹ ¹⁰ | 2027: Der Höchstbetrag soll gleich bleiben. Vielleicht bekommt dein Wohnort ab 2027 eine andere Mietenstufe. Das ist noch nicht sicher (Stand November 2026). |
| `wgmax.d.kdu` | **Nicht verwechseln:** Beim Grundsicherungsgeld (früher Bürgergeld) und bei der Sozialhilfe gilt eine andere Grenze, die „angemessenen Kosten der Unterkunft“. Sie gilt mit Heizung. Jede Stadt oder jeder Landkreis legt sie selbst fest. Sie ist oft anders als beim Wohngeld. Frag dafür das Jobcenter oder das Sozialamt.¹¹ ¹² | **Achtung:** Beim Grundsicherungsgeld (früher Bürgergeld) gilt eine andere Grenze. Jede Stadt legt sie selbst fest. Frag dafür beim Jobcenter oder beim Sozialamt. |

### Fußnoten (Quellen, alle abgerufen am 20.11.2026)

1. § 9 WoGG (Miete): „einschließlich Umlagen, Zuschlägen und Vergütungen“. Außer Betracht bleiben nach Abs. 2 „Heizkosten und Kosten für die Erwärmung von Wasser“, Haushaltsenergie, Garage oder Stellplatz und Leistungen über die Wohnraumüberlassung hinaus. https://www.gesetze-im-internet.de/wogg/__9.html
2. § 12 Abs. 1 WoGG mit Anlage 1 (Höchstbeträge, Fundstelle BGBl. 2024 I Nr. 314) und § 12 Abs. 7 WoGG (Klimakomponente). https://www.gesetze-im-internet.de/wogg/__12.html, https://www.gesetze-im-internet.de/wogg/anlage_1.html
3. § 11 Abs. 1 Satz 1 Nr. 1 WoGG: Die Miete wird berücksichtigt, „jedoch nur bis zur Höhe der Summe, die sich aus dem Höchstbetrag nach § 12 Absatz 1 und der Klimakomponente nach § 12 Absatz 7 ergibt“. Einen Ausschluss bei höherer Miete gibt es nicht. https://www.gesetze-im-internet.de/wogg/__11.html
4. § 12 Abs. 1 WoGG: „Höchstbeträge für Miete und Belastung“. Die Belastung (§ 10 WoGG, Teil 3 WoGV) rechnet die App nicht. https://www.gesetze-im-internet.de/wogg/__12.html
5. § 5 Abs. 1 WoGG (Haushaltsmitglieder: Ehegatte, Lebenspartner, Verantwortungsgemeinschaft, Verwandte in gerader Linie und 2./3. Grades in der Seitenlinie, Pflegekinder), § 5 Abs. 4 WoGG (Wechselmodell, auch bei einer Aufteilung „bis zu einem Verhältnis von mindestens einem Drittel zu zwei Dritteln“), § 6 Abs. 1 WoGG. https://www.gesetze-im-internet.de/wogg/__5.html, https://www.gesetze-im-internet.de/wogg/__6.html
6. § 12 Abs. 6 WoGG, Gesamtbetrag zur Entlastung bei den Heizkosten. § 11 Abs. 1 Satz 1 Nr. 2 WoGG: wird zusätzlich zur Miete berücksichtigt. https://www.gesetze-im-internet.de/wogg/__12.html
7. § 11 Abs. 3 WoGG (anteilige Höchstbeträge bei ausgeschlossenen Haushaltsmitgliedern, z. B. nach § 7 WoGG). https://www.gesetze-im-internet.de/wogg/__11.html
8. § 1 Abs. 3 WoGV mit Anlage „Mietenstufen der Gemeinden nach Ländern ab 1. Januar 2023“ (BGBl. I 2022, 2166–2210; Daten der Wohngeldstatistik 31.12.2019 und 31.12.2020). https://www.gesetze-im-internet.de/wogv/anlage.html
9. Gesetzentwurf der Bundesregierung „Entwurf eines Gesetzes zur Vereinfachung und Fortentwicklung des Wohngeldgesetzes“, BT-Drs. 21/8284 vom 30.09.2026: Art. 1 Nr. 26 g (neuer § 43 Abs. 11 WoGG: „Abweichend von Absatz 1 findet keine Fortschreibung zum 1. Januar 2027 statt.“), Art. 1 Nr. 28 (Anlage 1 mit unveränderten Höchstbeträgen), Art. 2 Nr. 2 (neue WoGV-Anlage „Mietenstufen der Gemeinden nach Ländern ab dem 1. Januar 2027“, Daten 31.12.2023 und 31.12.2024). https://dserver.bundestag.de/btd/21/082/2108284.pdf. Stand des Verfahrens: erste Lesung 8.10.2026, Anhörung 4.11.2026, kein Beschluss (Bundestag, Textarchiv, Seite mit „Stand: 20.11.2026“): https://www.bundestag.de/dokumente/textarchiv/2026/kw45-pa-wohnen-1224418. BMWSB, Gesetzgebungsverfahren: „Die Fortschreibung des Wohngeldes zum 1. Januar 2027 wird ausgesetzt“, „die Mietenstufenzuordnung der Gemeinden und Landkreise aktualisiert“: https://www.bmwsb.bund.de/SharedDocs/gesetzgebungsverfahren/DE/wohngeld-2026/wohngeldreform.html
10. Koalitionseinigung vom 11.11.2026: Halbierung der Heizkostenkomponente und neue Formel sollen entfallen, Aussetzung der Fortschreibung bleibt. Belegt bisher **nur in Fachmedien**, nicht amtlich: buerger-geld.org vom 19.11.2026 (https://www.buerger-geld.org/news/finanzen/wohngeld-2027-kuerzungen-vom-tisch-koalition-einigt-sich-doch-eine-erhoehung-bleibt-aus), gegen-hartz.de vom 20.11.2026. Ob die neue Mietenstufen-Zuordnung bleibt, sagt keine der Quellen. Haushaltsausschuss 16.11.2026 (hib 947/2026) zum Haushaltsbegleitgesetz 2027, BT-Drs. 21/7860: keine Aussage zum Wohngeld. https://www.bundestag.de/presse/hib/kurzmeldungen-1233462
11. § 22 Abs. 1 SGB II (Bedarfe für Unterkunft und Heizung „soweit diese angemessen sind“, Karenzzeit ein Jahr, höchstens das Eineinhalbfache der abstrakt angemessenen Aufwendungen). https://www.gesetze-im-internet.de/sgb_2/__22.html. Für die Sozialhilfe gilt § 35 SGB XII.
12. Ohne schlüssiges Konzept des kommunalen Trägers: Wohngeld-Höchstbeträge plus Sicherheitszuschlag von 10 % als Obergrenze (BSG, Urteil vom 12.12.2013, B 4 AS 87/12 R; so steht es auch im Kommentar in `rules.js` bei `kduGrenze`). Das Aktenzeichen habe ich nur über Sekundärquellen gefunden, nicht auf bsg.bund.de. Vor dem Einbau prüfen.

---

## 3. Zahlen und Regeln

### 3.1 Rechtsstand (Prüfergebnis)

| Frage | Ergebnis | Quelle (Abruf 20.11.2026) |
|---|---|---|
| Gibt es eine beschlossene Fortschreibung zum 1.1.2027 (Verordnung nach § 43 WoGG)? | **Nein.** Es gibt keine Fortschreibungsverordnung 2027. Der Regierungsentwurf setzt sie aus (neuer § 43 Abs. 11). Das Gesetz ist noch **nicht beschlossen**. | BT-Drs. 21/8284; Bundestag kw45 (Stand 20.11.2026); BMWSB |
| Ändern sich die Höchstbeträge (Anlage 1) zum 1.1.2027? | **Nein, nach allen bekannten Plänen nicht.** Die Anlage 1 im Entwurf nennt dieselben Beträge wie seit 1.1.2025. | BT-Drs. 21/8284, Art. 1 Nr. 28 |
| Ändert sich die Klimakomponente? | Nein. Sie bleibt bei 19,20 bis 39,20 € plus 4,80 € (im Entwurf nur nach § 12 Abs. 1 / Anlage 1 verschoben). | BT-Drs. 21/8284 |
| Heizkostenkomponente (§ 12 Abs. 6) | Geltend: 110,40 / 142,60 / 170,20 / 197,80 / 225,40 €, je weitere Person +27,60 €. Entwurf: 62,40 / 80,60 / 96,20 / 111,80 / 127,40 €, je weitere Person +15,60 €. Laut Koalitionseinigung vom 11.11.2026 soll die Halbierung **entfallen** (nicht amtlich belegt). | § 12 Abs. 6 WoGG; BT-Drs. 21/8284 Art. 1 Nr. 8 d; Fußnote 10 |
| Neue Mietenstufen-Zuordnung ab 1.1.2027 | **Nur im Entwurf** (Art. 2 Nr. 2: neue WoGV-Anlage). Ob sie nach der Einigung bleibt, ist **offen**. Beispiele laut Fachpresse: Hamburg VI→V, Tübingen VII→VI, Essen III→IV, Münster IV→V (nicht amtlich gegengeprüft). | BT-Drs. 21/8284; buerger-geld.org 22.10.2026 |
| Mietenstufen in `content/plz-data.json` | Richtig für den geltenden Stand: „Mietenstufen ab 1.1.2023“. Die Fortschreibung 2025 hat die WoGV-Anlage **nicht** neu gefasst. Die Anlage nennt weiter Daten von 2019/2020. | WoGV-Anlage auf gesetze-im-internet.de |
| Werte in `rules.js` (`HOECHST`, `KLIMA`, `HEIZ`, Z. 255–258) | **Stimmen** mit Anlage 1 WoGG, § 12 Abs. 6 und Abs. 7 überein (vollständig verglichen, siehe 3.2). Auch der Kommentar Z. 252–253 stimmt mit dem Stand überein. | wie oben |

### 3.2 Höchstbetrag + Klimakomponente (= das, was die Zeile anzeigt), in Euro

Gültig ab 1.1.2025, bis auf Weiteres. Nach dem Entwurf auch ab 1.1.2027 unverändert. Quelle: Anlage 1 zu § 12 Abs. 1 WoGG (BGBl. 2024 I Nr. 314) plus § 12 Abs. 7 WoGG, https://www.gesetze-im-internet.de/wogg/anlage_1.html, abgerufen 20.11.2026. Die Summen stehen auch in BT-Drs. 21/8284, S. 15 f. So rechnet `Rules.wgCap(stufe, n)`.

| Personen | I | II | III | IV | V | VI | VII | Klima enthalten |
|---|---|---|---|---|---|---|---|---|
| 1 | 380,20 | 427,20 | 475,20 | 530,20 | 581,20 | 634,20 | 696,20 | 19,20 |
| 2 | 461,80 | 517,80 | 575,80 | 643,80 | 704,80 | 769,80 | 844,80 | 24,80 |
| 3 | 550,60 | 616,60 | 686,60 | 766,60 | 838,60 | 916,60 | 1.004,60 | 29,60 |
| 4 | 642,40 | 720,40 | 800,40 | 892,40 | 980,40 | 1.069,40 | 1.173,40 | 34,40 |
| 5 | 733,20 | 821,20 | 914,20 | 1.021,20 | 1.119,20 | 1.222,20 | 1.341,20 | 39,20 |
| je weitere | +86,80 | +98,80 | +110,80 | +123,80 | +133,80 | +153,80 | +167,80 | +4,80 |

### 3.3 Weitere Regeln für die Anzeige

| Regel | Wert / Inhalt | Rechtsgrundlage, Quelle | gültig ab / bis |
|---|---|---|---|
| Was als Miete zählt | Bruttokaltmiete: Kaltmiete und kalte Nebenkosten. Ohne Heizung, Warmwasser, Haushaltsstrom, Garage oder Stellplatz und Betreuung. | § 9 WoGG | seit 1.1.2009 (Fassung), weiter gültig |
| Pauschbeträge, wenn Heizkosten nicht ausgewiesen | Die Wohngeldstelle zieht Pauschbeträge ab (§ 9 Abs. 2 Satz 2 WoGG, Höhe in der WoGV). Die App nimmt **ersatzweise die Heizkostenkomponente** als Schätzung, so wie heute in `wgMiete`, und schreibt dann „geschätzt“. | § 9 Abs. 2 WoGG | weiter gültig |
| Heizkosten-Betrag (fest, kommt zur gekappten Miete dazu) | 1: 110,40 · 2: 142,60 · 3: 170,20 · 4: 197,80 · 5: 225,40 · je weitere +27,60 € | § 12 Abs. 6, § 11 Abs. 1 Nr. 2 WoGG | seit 1.1.2023; für 2027 Halbierung geplant, laut Einigung entfallen (offen) |
| Miete über dem Höchstbetrag | Es zählt nur der Höchstbetrag. Kein Ausschluss. | § 11 Abs. 1 Nr. 1 WoGG | weiter gültig |
| Haushaltsgröße | Alle Haushaltsmitglieder nach § 5, außer ausgeschlossene (§ 6 Abs. 1, §§ 7, 8). Anteilige Kappung nach § 11 Abs. 3. Wechselmodell: § 5 Abs. 4. | §§ 5, 6, 11 Abs. 3 WoGG | weiter gültig |
| In der App: Personenzahl | `adults + kids + young` (wie `derive()` → `persons`, `rules.js` Z. 521), höchstens 12 wie `wgCap`. | Code | — |
| Mietenstufe | Gemeinde ab 10.000 Einwohnern einzeln, sonst die Stufe des Kreises | § 12 Abs. 3 WoGG, § 1 Abs. 3 WoGV + Anlage | Stufen seit 1.1.2023; neue Zuordnung ab 1.1.2027 nur im Entwurf |
| Angemessene KdU (Grundsicherungsgeld, Sozialhilfe) | **kommunal**, mit Heizung, nicht die Wohngeld-Tabelle. Nur ohne schlüssiges Konzept gilt nach der Rechtsprechung die Tabelle plus 10 %. | § 22 SGB II, § 35 SGB XII; BSG B 4 AS 87/12 R (Az. ungeprüft) | weiter gültig |

---

## 4. Bauplan

### 4.1 Grundidee (minimal-invasiv)

- **Keine neue Rechenlogik für Wohngeld.** Die Anzeige nutzt die vorhandenen Funktionen `wgCap` und `wgHeiz` (`rules.js` Z. 263–271) und dieselbe Näherung wie `wgMiete` (Z. 289–294). So können Anzeige und Ergebnis-Karte nicht auseinanderlaufen.
- Eine neue **reine Funktion** in `rules.js` liefert die Werte. `app.js` setzt nur die Texte. Das ist testbar ohne DOM.
- Kein neues Feld, keine Startkachel, keine neue Farbe, keine neuen gespeicherten Daten. Alles wird aus `state` abgeleitet, das schon über `vorgaenge.js` verschlüsselt gespeichert wird.

### 4.2 `src/rules.js`

1. **Neue Funktion `wgHoechst(o)`** direkt nach `wgHeiz` (nach Z. 271), in den Export (letzte `return`-Zeile, Z. 1943) aufnehmen.

```js
// Anzeige „Höchstbetrag der Miete“ unter dem Mietfeld. o: { stufen: [1..7] (eine oder mehrere mögliche), n, warm, heiz, eigentum }
// Rückgabe: { n, von, bis, sv, sb, heizKomp, klima, kalt, geschaetzt, vergleich } – vergleich: 'drunter' | 'drueber' | 'nah' | 'moeglich' | null
function wgHoechst(o) {
  const n = Math.min(Math.max(Math.floor(o.n) || 1, 1), 12);
  const st = (o.stufen && o.stufen.length ? o.stufen : [1, 2, 3, 4, 5, 6, 7]).slice().sort();
  const sv = st[0], sb = st[st.length - 1], von = wgCap(sv, n), bis = wgCap(sb, n), heizKomp = wgHeiz(n);
  const klima = n <= 5 ? KLIMA[n - 1] : KLIMA[4] + (n - 5) * KLIMA_WEITER;
  const warm = Number(o.warm) > 0 ? Number(o.warm) : 0;
  const heiz = Number(o.heiz) > 0 && Number(o.heiz) < warm ? Number(o.heiz) : 0;   // wie derive(): nur gültig, wenn kleiner als die Warmmiete
  if (!warm || o.eigentum) return { n, von, bis, sv, sb, heizKomp, klima, kalt: null, geschaetzt: false, vergleich: null };
  const geschaetzt = !heiz, kalt = Math.max(0, warm - (heiz || heizKomp));        // Näherung wie wgMiete()
  let vergleich;
  if (kalt > bis) vergleich = 'drueber'; else if (kalt <= von) vergleich = 'drunter'; else vergleich = 'moeglich';
  if (sv === sb && geschaetzt && Math.abs(kalt - von) <= 0.1 * von) vergleich = 'nah';   // ±10 % um die Grenze: Heizkosten nachfragen
  return { n, von, bis, sv, sb, heizKomp, klima, kalt, geschaetzt, vergleich };
}
```

2. **Stand-Daten** (nur Kommentar und Merker, keine Rechenänderung) in `R` oder neben `PLAN` (Z. 1844):
   `wgPlan2027: { stand: '20.11.2026', drs: '21/8284', fortschreibung: 'ausgesetzt (Entwurf)', mietenstufen: 'entwurf' }`.
   Der Kommentar Z. 252–253 bekommt den Zusatz: „Neue Mietenstufen-Zuordnung ab 1.1.2027 nur im Entwurf (BT-Drs. 21/8284 Art. 2), Ausgang offen.“

3. **Umstellung nach Datum (für später vorbereiten, jetzt nicht aktiv):**
   - Höchstbeträge: Nach allen Plänen ändern sie sich zum 1.1.2027 nicht. Kommt doch eine Änderung, dann `HOECHST_2027` anlegen und in `wgCap` nach `h.heute >= 2027` wählen. Das Muster gibt es schon bei `minijob2027` (Z. 37 und 646) und `kkg` (Z. 1370). `wgCap` bekommt dafür einen optionalen Parameter `jahr`.
   - Heizkostenkomponente: Falls die Halbierung doch beschlossen wird: `HEIZ_2027` und dieselbe Umschaltung in `wgHeiz`.
   - Mietenstufen: siehe 4.5.

### 4.3 `src/template.html`

Nach Z. 1229 (`<p class="warn" id="mieteWarn" hidden></p>`) und noch im selben `.field` einfügen:

```html
<p class="mietgrenze" id="mieteGrenze" aria-live="polite" hidden></p>
<details class="mietgrenze-mehr" id="mieteGrenzeMehr" hidden>
  <summary data-t="wgmax.mehr"></summary>
  <div class="inner" id="mieteGrenzeInhalt"></div>
</details>
```

CSS im allgemeinen Block (bei `.hint` / `.warn`, Z. 211 und 258). Nur Variablen aus FARBEN.md:

```css
.mietgrenze { font-size: 0.9em; color: var(--ink); background: var(--na-bg); border-inline-start: 4px solid var(--c-wohngeld); border-radius: 6px; padding: 6px 10px; margin: 6px 0 0; }
.mietgrenze.moeglich { color: var(--warn); background: var(--warn-bg); border-inline-start-color: var(--warn); }
.mietgrenze-mehr { margin-top: 4px; }
```

**Farbzuordnung:**

| Zustand | Farben | Wort (Farbe nie allein) |
|---|---|---|
| Normal (Stufe bekannt, darunter oder darüber) | Text `--ink` auf `--na-bg` (geprüftes Paar „Info“), Randstreifen `--c-wohngeld` (Meerblau, schmückend: dieselbe Sache wie die Absender-Kachel „Wohngeldstelle“) | „darunter“ / „darüber“ |
| Spanne / „möglich“ / nahe an der Grenze | `--warn` auf `--warn-bg` (Paar „Möglich“) | „Möglich“ / „nahe an der Grenze“ |

Kein Rot (`--bad`) für „darüber“: Es ist kein Ausschluss.
Keine Kachel- oder Knopfgruppe, also keine Änderung an „Gruppenfarben“ und an `tools/kontrast-pruefen.js`. Alle Paare sind schon geprüft.

Optional, ein Satz: In der Regel-Tabelle (Z. 1504, „Wohngeld“) ergänzen: „Unter dem Mietfeld zeigt die App den Höchstbetrag (Anlage 1 plus Klimakomponente).“ Im Satz zu 2027 ergänzen: „neue Mietenstufen-Zuordnung geplant“.

### 4.4 `src/app.js`

1. **Neue Funktion `mietgrenzeZeile()`** direkt nach `weitereWarnungen()` (Z. 323–328). Aufruf am Ende von `weitereWarnungen()`. Die Funktion läuft so bei jedem `render()` mit (Z. 936). `render()` folgt auf jede Eingabe in Miete, Heizkosten, Mietenstufe, PLZ und Personen (`touched` / `touchedSoon`, Z. 582–590, 618–623).

```js
// Höchstbetrag der Miete beim Wohngeld unter dem Mietfeld (Anlage 1 WoGG + Klimakomponente). Nur Anzeige, rechnet nichts Neues.
function mietgrenzeStufen() {
  if (/^[1-7]$/.test(String(state.mietstufe || ''))) return [Number(state.mietstufe)];
  var r = Plz.available() && /^\d{5}$/.test(String(state.plz || '')) ? Plz.lookup(state.plz) : null;
  if (!r) return [];                                              // unbekannt: ganze Spanne I–VII
  var c = r.candidates.filter(function (x) { return x.label + '|' + x.kreis + '|' + x.stufe === state.plzPick; })[0];
  if (c && c.stufe) return [c.stufe];
  var s = []; r.candidates.forEach(function (x) { if (x.stufe && s.indexOf(x.stufe) < 0) s.push(x.stufe); });
  return s;                                                       // mehrere Stufen unter einer PLZ: Spanne
}
function mietgrenzeZeile() {
  var p = $('mieteGrenze'), d = $('mieteGrenzeMehr'), box = $('mieteGrenzeInhalt');
  var stufen = mietgrenzeStufen(), hatMiete = Number(state.miete) > 0;
  var zeigen = (hatMiete || stufen.length > 0) && !feldUngueltig('miete');
  p.hidden = d.hidden = !zeigen; if (!zeigen) return;
  var n = state.adults + state.kids + state.young, eig = state.wohnart === 'eigentum';
  var w = Rules.wgHoechst({ stufen: stufen, n: n, warm: state.miete, heiz: state.heizkosten, eigentum: eig });
  var E = function (v) { return Fmt.euro(v, lang, rtl()); }, pers = n === 1 ? t('wgmax.p1') : t('wgmax.pn', { n: n });
  var eins = w.sv === w.sb, s = [];
  if (eig) s.push(t('wgmax.eigen', { betrag: E(w.bis), stufe: eins ? Rules.roman(w.sv) : Rules.roman(w.sv) + '–' + Rules.roman(w.sb), personen: pers }));
  else if (eins) s.push(t('wgmax.zeile', { betrag: E(w.von), stufe: Rules.roman(w.sv), personen: pers }));
  else s.push(t(stufen.length ? 'wgmax.zeileSpanne' : 'wgmax.zeileOhne', { von: E(w.von), bis: E(w.bis), sv: Rules.roman(w.sv), sb: Rules.roman(w.sb), personen: pers }));
  var V = { drunter: w.geschaetzt ? 'wgmax.drunterEtwa' : 'wgmax.drunter', drueber: w.geschaetzt ? 'wgmax.drueberEtwa' : 'wgmax.drueber', nah: 'wgmax.nah', moeglich: 'wgmax.moeglich' };
  if (w.vergleich) s.push(t(V[w.vergleich], { kalt: E(w.kalt), betrag: E(w.vergleich === 'drueber' ? w.bis : w.von) }));
  if (state.hhAndere === 'verwandte') s.push(t('wgmax.verwandte'));
  p.textContent = s.join(' ');
  p.classList.toggle('moeglich', !eins || w.vergleich === 'moeglich' || w.vergleich === 'nah');
  box.innerHTML = ['wgmax.d.kalt', 'wgmax.d.heiz', 'wgmax.d.klima', 'wgmax.d.drueber', 'wgmax.d.personen', 'wgmax.d.ausgeschlossen', 'wgmax.d.stufe', 'wgmax.d.2027', 'wgmax.d.kdu']
    .map(function (k) { return '<p>' + esc(t(k, { heiz: E(w.heizKomp), klima: E(w.klima), personen: pers })) + '</p>'; }).join('');
}
```

   Hinweise für den Entwickler:
   - `rtl()` steht hier nur als Platzhalter. Bitte den vorhandenen RTL-Schalter für `Fmt.euro` nehmen (wie bei anderen Beträgen, ar/fa/ps).
   - `wgmax.d.kdu` enthält Fettdruck: entweder `<strong>` außerhalb von `esc` setzen oder den Text ohne Markdown schreiben (wie bei `plz.found` mit `<strong>` in `app.js`).
   - Bei `wohnart = eigentum` werden `wgmax.d.drueber` und `wgmax.d.kalt` ausgelassen. Dafür gibt es den Satz „Was zählt, rechnet die Wohngeldstelle aus“.
   - Die Zeile steht **vor** dem PLZ-Feld. Darum verweisen die Texte auf „unten“. Wird die PLZ eingegeben, aktualisiert sich die Zeile über `touched()` → `render()` (Z. 623).
   - Leeres Formular ohne Miete und ohne Stufe: Zeile ausgeblendet (nicht überladen).
   - Werte aus `state` sind schon Zahlen (`parseAmount`). Ungültige Eingabe: Die Zeile wird ausgeblendet, `mieteWarn` hat Vorrang.

2. **Einfache Version (`ES_FRAGEN`, Z. 1858 ff.):** vorerst **nicht** einbauen. Dort kommt die PLZ erst am Ende (`es.plz`), und es gibt nur eine Person. Sonst stünde dort immer nur die Spanne I–VII, und das wäre verwirrend. Später möglich: Hinweis in der Ergebnisansicht der einfachen Version.

3. **Keine Änderung** an `derive()`, `wohngeld()`, `kduGrenze()`, der Antragsmappe (Z. 1163, 1560) und am Haushaltsplan (Z. 3284).

### 4.5 Mietenstufen nach Datum (erst nach Verkündung des Gesetzes)

Wird die neue WoGV-Anlage beschlossen und im BGBl. verkündet:

1. `tools/build-plz-data.js` liest **zusätzlich** `content/quellen/roh/wogv-anlage-2027.html`. Je PLZ-Eintrag `e` kommt ein 6. Feld `stufe2027` dazu, je Kreis in `k.g` und `k` ebenfalls. `stand.wogv2027` = Fundstelle.
2. `src/plz.js`: `lookup(plz, jahr)`. Bei `jahr >= 2027` und vorhandenem `stufe2027` nimmt es diesen Wert. Ohne `jahr` bleibt es wie heute, also rückwärtskompatibel für alle Aufrufer (`aktAgs`, `esLand`, `aktAgsEs`, Z. 357, 1912, 2099, 2105).
3. Aufrufer mit Mietenstufe (`plzUpdate`, `mietgrenzeStufen`, Einfache Version Z. 1912) geben `heuteJahr()` mit. Muster: `heute` in `derive()` (Z. 613).
4. **Vom Beschluss bis 31.12.2026:** Weicht die Stufe ab, zeigt die Zeile einen zusätzlichen Satz `wgmax.ab2027` („Ab 1.1.2027 gilt für deinen Wohnort Mietenstufe {neu}. Dann zählen höchstens {betrag}.“ / Einfach: „Ab Januar 2027 hat dein Wohnort Mietenstufe {neu}. Dann zählen höchstens {betrag}.“).
5. `state.mietstufe` ist eine Eingabe der Person. Hat sie die Stufe selbst gewählt, überschreibt das neue Jahr sie nicht. Hinweis im Aufklapptext: Stufe nach dem Jahreswechsel prüfen. Wenn gewünscht, im Jahreswechsel-Test prüfen (`test/test-jahreswechsel.js`).
6. Übergangsregel im Entwurf (§ 46-Ergänzung, BT-Drs. 21/8284 S. 14): Für Anträge, über die bis 31.12.2026 noch nicht entschieden ist, gilt bis Dezember altes Recht, ab Januar neues Recht, mit Bestandsschutz für den höheren Betrag. Die App braucht das nicht, aber es sollte in den Aufklapptext, sobald das Gesetz beschlossen ist.

### 4.6 i18n

- Neue Schlüssel (alle in **13 Dateien** `src/lang/*.json`; Einfache Sprache in `src/lang/einfach/e.json`, dort stehen schon `miete.*`/`stufe.*`):
  `wgmax.p1`, `wgmax.pn`, `wgmax.zeile`, `wgmax.zeileSpanne`, `wgmax.zeileOhne`, `wgmax.drunter`, `wgmax.drunterEtwa`, `wgmax.drueber`, `wgmax.drueberEtwa`, `wgmax.nah`, `wgmax.moeglich`, `wgmax.eigen`, `wgmax.verwandte`, `wgmax.mehr`, `wgmax.d.kalt`, `wgmax.d.heiz`, `wgmax.d.klima`, `wgmax.d.drueber`, `wgmax.d.personen`, `wgmax.d.ausgeschlossen`, `wgmax.d.stufe`, `wgmax.d.2027`, `wgmax.d.kdu` (23 Schlüssel). Später `wgmax.ab2027`.
- Die Fußnoten-Ziffern gehören nicht in die Sprachtexte. Paragrafen nennt die App nicht in der Zeile, nur im Aufklapptext, wenn gewünscht (dann `§ 9 WoGG` usw. in allen Sprachen gleich, wegen `test/test-sprachen-zahlen.js`).
- Zahlen in Texten: nur „1.1.2023“, „1.1.2027“ und „20.11.2026“ in `wgmax.d.stufe`/`wgmax.d.2027`. Sie müssen in allen 13 Sprachen gleich vorkommen (`test-sprachen-zahlen.js`, ggf. Ausnahme in `test/sprachen-zahlen-ausnahmen.json`).
- Rechts-nach-links (ar, fa, fa-AF, ps): Beträge über `Fmt.euro(..., rtl)`, römische Stufe in `<bdi>`, wie in `zustHtml`.
- „Grundsicherungsgeld (früher Bürgergeld)“: einheitlich mit `NAMES.ggeld` (Z. 1684).

### 4.7 Tests

| Datei | Testfälle |
|---|---|
| **neu** `test/test-mietgrenze.js` (in `package.json` → `test:rules` aufnehmen) | 1) `wgHoechst({stufen:[3], n:3}).von === 686.6`, `heizKomp === 170.2`, `klima === 29.6`. 2) Ecken der Tabelle 3.2: I/1 = 380,20; VII/5 = 1.341,20; IV/6 = 1.145,00; VII/12 = 2.465,20; n = 13 wird wie 12 behandelt. 3) **Gleichlauf:** für alle Stufen 1–7 und n 1–12 gilt `wgHoechst({stufen:[s],n}).von === wgCap(s,n)`, und es gilt `min(kalt, von) + heizKomp === wgMiete(s, n, warm, 1, heiz)` (Anzeige = Rechnung). 4) warm 950, ohne Heizkosten, n 3, Stufe III → kalt 779,80, `geschaetzt`, `drueber`. 5) warm 800, heiz 150 → kalt 650, nicht geschätzt, `drunter`. 6) warm 850 ohne Heizkosten → kalt 679,80, `nah`. 7) Stufen [3,4], n 1, warm 650, heiz 150 → von 475,20, bis 530,20, `moeglich`. 8) keine Stufen → von 380,20, bis 696,20 (n 1). 9) heiz ≥ warm → ignoriert (wie `derive()`). 10) `eigentum` → `vergleich === null`. 11) warm leer → `vergleich === null`. 12) Vergleich mit `test/referenz.js` (Anlage-1-Tabelle Z. 183 ff.). |
| **neu** `test/test-mietgrenze-dom.js` (in `test:dom`), Aufbau wie `test/test-anzeige.js` | 1) Leeres Formular: `#mieteGrenze` und `#mieteGrenzeMehr` ausgeblendet. 2) 1 Erw., 2 Kinder, Mietenstufe 3, Miete 950 → Text enthält „686,60“, „III“, „3 Personen“, „darüber“, Klasse ohne `moeglich`. 3) Heizkosten 300 eintragen → „650“ und „darunter“, ohne „geschätzt“. 4) Mietenstufe leer, PLZ mit mehreren Stufen (eine aus `test/test-plz.js` nehmen) → „Möglich“, Klasse `moeglich`, Spanne; Wohnort wählen (`#plzPick`) → eine Stufe. 5) `wohnart = eigentum` → „Lastenzuschuss“, kein „darüber“. 6) `hhAndere = verwandte` → Satz `wgmax.verwandte`. 7) Aufklapptext enthält den KdU-Absatz und **keinen** Betrag der KdU-Orientierung (`kduGrenze`), also keine Vermischung. 8) Einfache Sprache an → Text aus `einfach/e.json`. 9) Alle 13 Sprachen: kein roher Schlüssel `wgmax.` sichtbar. 10) Ungültige Miete („abc“) → Zeile weg, `mieteWarn` sichtbar. |
| bestehend | `test/test-anzeige.js` bzw. der Sprach-Vollständigkeitstest: neue Schlüssel in allen Sprachen. `test/a11y.js` (e2e): `aria-live` und `<details>` mit `summary`. `npm test` mit `tools/kontrast-pruefen.js`: keine neuen Farbwerte. |

### 4.8 Dokumentation

`docs/PRUEFLISTE.md` und das Faktenblatt angleichen: Höchstbetrag-Tabelle 3.2, Quelle, Stand 2027 (CLAUDE.md: „Nach Änderungen an … Texten“).

### 4.9 Konfliktrisiko mit anderen Aufgaben

| Aufgabe | Überschneidung | Risiko |
|---|---|---|
| b-kostensenkung (Brief prüfen) | Kostensenkungsaufforderung des Jobcenters = KdU-Thema. Die Texte zur Abgrenzung von KdU und Wohngeld sollten gleich klingen; `kdu.hoch` (de.json) nicht doppelt neu formulieren. | mittel (Texte) |
| b-energie (Haushaltsplan) | nutzt `state.miete`, `state.heizkosten`, `state.mietstufe` (`app.js` Z. 3284). Ich ändere daran nichts. | gering |
| b-paar-einkommen | ändert evtl. `adults`/Personenzählung oder die Eingabe-Felder im selben Formular | gering bis mittel (Personenzahl) |
| b-fristen, b-schuldenliste | keine fachliche Überschneidung | gering |
| alle | gleiche Dateien: `src/app.js` (neue Funktion bei Z. 323, Aufruf in `weitereWarnungen`), `src/rules.js` (nach Z. 271 und Export Z. 1943), `src/template.html` (Z. 1229 und CSS), `src/lang/*.json`, `src/lang/einfach/e.json`, `package.json` (Testliste) | **hoch beim Mergen** (gleiche Dateien, aber andere Stellen). Nach CLAUDE.md vorher fragen; neue Schlüssel am Ende der JSON-Dateien anfügen, um Zeilenkonflikte klein zu halten. |

---

## 5. Offene Fragen und Unsicherheiten

1. **Gesetz 2027 nicht beschlossen (Stand 20.11.2026).** Sicher ist: keine Fortschreibungsverordnung und unveränderte Höchstbeträge in jedem bekannten Szenario. **Offen:** ob die neue Mietenstufen-Zuordnung ab 1.1.2027 nach der Koalitionseinigung bleibt, ob die Halbierung der Heizkostenkomponente wirklich entfällt (bisher nur Fachmedien) und ob das Gesetz rechtzeitig zum 1.1.2027 verkündet wird. Bis dahin nur den Satz `wgmax.d.2027` („geplant, noch nicht beschlossen“) zeigen. Nach Verkündung im BGBl.: 4.5 umsetzen. Sobald es den Beschluss gibt, kurz BGBl. bzw. recht.bund.de prüfen.
2. **Betrifft die Einigung auch die Heizkosten-Zeile in der App?** `HEIZ` in `rules.js` bleibt richtig, solange die Halbierung nicht beschlossen ist. Sonst müssten `HEIZ_2027` und `wgHeiz` mit Datum umgestellt werden. Das betrifft auch die Wohngeld-Karte, nicht nur diese Anzeige.
3. **Schätzung der Bruttokaltmiete ohne Heizkosten-Angabe:** Die Wohngeldstelle zieht Pauschbeträge nach WoGV ab. Die App nimmt (wie bisher in `wgMiete`) die Heizkostenkomponente. Das Ergebnis ist darum als „geschätzt“ markiert. Die Spanne ±10 % für „nah“ ist eine Gestaltungsentscheidung, keine Rechtsregel. Bitte bestätigen.
4. **Warmwasser:** Kommt Warmwasser über die Heizung, steckt es in den angegebenen Heizkosten. Beim Boiler (`cb.warmwasser`) steckt es im Strom. In beiden Fällen ist das für die Bruttokaltmiete richtig. Steht im Heizkosten-Abschlag nur die Heizung und das Warmwasser getrennt, rechnet die App die Bruttokaltmiete etwas zu hoch. Das ist eine Kleinigkeit, sie steht im Aufklapptext nicht.
5. **Haushaltsgröße:** Die App kennt Verwandte (`hhAndere = verwandte`) nur als Ja/Nein ohne Zahl. Darum gibt es nur einen Hinweis, keinen neuen Betrag. Ausgeschlossene Mitglieder (§ 11 Abs. 3) kennt die App nicht. Sie stehen nur im Aufklapptext.
6. **BSG-Aktenzeichen** zur „Wohngeld-Tabelle + 10 %“ (B 4 AS 87/12 R) nur aus Sekundärquellen. Vor Übernahme in Texte auf bsg.bund.de prüfen. Die neue Anzeige nennt das Aktenzeichen nicht, nur der bestehende Code-Kommentar.
7. **Bestehende KdU-Orientierung** (`kduGrenze` = Wohngeld-Tabelle × 1,1 + Heizkostenkomponente) bleibt. Sie ist im Text `kdu.hoch` als Orientierung gekennzeichnet. Die neue Zeile zeigt **nur** den Wohngeld-Wert und sagt ausdrücklich, dass beim Grundsicherungsgeld eine örtliche Grenze gilt. Zu klären: Soll `kdu.hoch` zusätzlich sagen, dass viele Städte eine eigene, oft andere Grenze haben (z. B. „frag beim Jobcenter nach der Richtlinie deiner Stadt“)? Das hängt mit b-kostensenkung zusammen.
8. **Lastenzuschuss (Eigentum):** Gezeigt wird nur der Höchstbetrag, ohne Vergleich. Die eingegebenen „Wohnkosten“ (inkl. Tilgung und Heizung) sind nicht die Belastung nach § 10 WoGG.
9. **Einfache Version (ES-Modus):** bewusst nicht eingebaut (PLZ kommt erst am Ende). Entscheidung des Nutzers nötig, ob dort später ein Hinweis in der Ergebnisansicht kommen soll.
10. **Pflege der PLZ-Daten außerhalb Bayerns:** Laut `plz-data.json` sind sie „automatisch und nur bei eindeutiger Zuordnung“ erstellt. Darum häufiger die Spanne. Das ist richtig so („möglich“ statt falscher Sicherheit).
