# Verfahren für möglichst fehlerfreie Übersetzungen

Stand: Recherche vom 21.11.2026 (Abrufdatum aller Links). Entwurf, nichts an der App geändert.
Kennzeichnung: **[Fakt]** = mit Quelle belegt · **[Schätzung]** = eigene Rechnung/Annahme, keine amtliche Zahl.

## Kurzfassung

| Frage | Antwort |
|---|---|
| Was findet Fehler am sichersten? | 1. Feste Regeln (Zahlen, Beträge, Daten, §, Verneinung, Glossar) – findet diese Fehler zu 100 %. 2. Zweite KI eines anderen Herstellers prüft nach Fehlerliste (MQM). 3. Muttersprachler prüft die kritischen Texte. Rückübersetzung allein ist **kein** Nachweis. |
| Wo ist die KI am schwächsten? | Paschtu, Somali, danach Dari (Studien unten). Diese drei zuerst von Menschen prüfen lassen. |
| Was kostet Menschenprüfung? | Kritische Texte (ca. 8 750 Wörter) je Sprache: ca. 150–250 € (Studierende/Sprachmittler auf Stundenbasis) bzw. ca. 450–1 250 € (Übersetzungsbüro). Alle 12 Sprachen über Büro: ca. 7 000–11 000 €. **[Schätzung]** |
| Erste Anlaufstellen in der Region | AWO-Sprachmittlerpool Erlangen/ERH, ZAB-Sprachvermittler Nürnberg (Dari, Paschtu), Migrationsberatungen; für Büroqualität ein ISO-17100-Büro mit Paschtu/Dari/Somali. |

## 0. Mengengerüst (aus dem Repo gezählt, `origin/main`, 21.11.2026)

| Größe | Wert |
|---|---|
| Deutsche Texte (alle `src/lang/**/de.json`) | 3 146 Texte, **31 313 Wörter** (Ø 10 Wörter/Text) |
| Texte mit Signalwort (Frist, €, Zahl, Widerspruch, Sperre, Rückforderung, muss …) | 831 Texte, 16 426 Wörter (grobe Obergrenze) |
| Kritische Texte laut Auftrag | ca. 350 × 25 Wörter = **ca. 8 750 Wörter** (Rechengrundlage unten) |

Hinweis: Die Annahme „2 800 Texte × 25 Wörter“ wäre 70 000 Wörter; tatsächlich sind es ca. 31 300 Wörter. Alle Kosten unten rechnen mit 8 750 (kritisch) und 31 300 (alle).

## 1. Menschliche Prüfung – Anbieter und Kosten

### 1.1 Preisanker (Fakten)

| Quelle | Preis | Bemerkung |
|---|---|---|
| JVEG § 11 (Gerichtsübersetzer) [Fakt] | 1,95 € je angefangene 55 Anschläge (Grundhonorar); erschwert (u. a. „selten verwendete Fremdsprache“) 2,15 € | Gesetzlicher Satz für Übersetzung (nicht Revision), gilt nur für Justiz – taugt als Obergrenze. Quelle: [gesetze-im-internet.de/jveg/__11](https://www.gesetze-im-internet.de/jveg/__11.html) |
| Fachübersetzungsdienst (ISO 17100, Reg. 7U517) [Fakt] | Paschtu „ab 1,09 € / Normzeile“ (55 Zeichen), Sprachgruppe 3 | Übersetzung; Lektorat nur auf Anfrage. [fachuebersetzungsdienst.com – Paschtu](https://www.fachuebersetzungsdienst.com/en/translate/pashto-english.html), [Dari](https://fachuebersetzungsdienst.com/en/translate/dari-english.html) |
| tolingo [Fakt] | ab 0,06 €/Wort; Pakete 0,09 (KI) / 0,11 / 0,23 €/Wort (Premium); ISO 17100 „auf Anfrage“ | Dari/Paschtu/Somali nicht genannt, „220+ Sprachen“. [tolingo.com/en/prices](https://www.tolingo.com/en/prices) |
| Integreat (Tür an Tür) [Fakt] | Menschliche Übersetzung „ca. 0,10 €/Wort“ (Vergleichswert auf deren Seite) | [integreat-app.de – Übersetzungspaket](https://integreat-app.de/en/?p=14434) |
| Translated (Preisbericht 2026) [Fakt] | keine Zahlen, nur Stufen: Arabisch/Russisch Stufe 3 (teurer, wenige Übersetzer) | [translated.com – pricing trends 2026](https://translated.com/resources/translation-pricing-trends-2026) |

Umrechnung **[Schätzung]**: deutscher Text ≈ 6,5 Zeichen je Wort inkl. Leerzeichen → 1 Normzeile ≈ 8,5 Wörter. JVEG 1,95 € ≈ 0,23 €/Wort; Paschtu ab 1,09 € ≈ 0,13 €/Wort. **Revision** (Prüfung einer vorhandenen Übersetzung, ISO 17100) kostet marktüblich etwa 30–50 % des Übersetzungspreises oder wird nach Stunde abgerechnet (ca. 40–70 €/h, ca. 800–1 200 Wörter/h) – **nicht belegt, Branchenerfahrung**. Mindestauftrag je Sprache häufig 30–80 € **[Schätzung]**.

### 1.2 Anbieter-Übersicht

| Weg | Was | Für SoLo nutzbar? | Quelle |
|---|---|---|---|
| **AWO-Sprachmittlerpool Stadt Erlangen + Landkreis ERH** | Ehrenamtliche Sprachmittler, koordiniert von der AWO Erlangen; kostenlos für Nutzer, Ehrenamtliche erhalten Aufwandsentschädigung; auch per Video | Nur **mündlich** für Menschen ohne Geld für Dolmetscher. Für Textprüfung nicht vorgesehen – aber guter Weg, **Kontakt zu Muttersprachlern** zu bekommen (Anfrage, ob einzelne gegen Honorar privat prüfen). Kontakt: dolmetscherpool@awo-erlangen.de, 09131 7153-86 | [erlangen.de](https://erlangen.de/en/aktuelles/sprachmittlerpool-von-landkreis-und-stadt-685f5e), [erlangen-hoechstadt.de](https://erlangen-hoechstadt.de/leben-in-erh/fluechtlinge/dolmetscher) |
| **ZAB-Sprach- und Kulturvermittler Nürnberg** (Zentrum Aktiver Bürger, gefördert vom Jugendamt) | 36 Sprachen, darunter **Dari und Paschtu** (kein Somali); mündlich in der Kinder-/Jugendhilfe | Wie oben: nur Kontaktweg, kein Textauftrag | [nuernberg.de/sprachvermittlung](https://www.nuernberg.de/internet/integration/sprachvermittlung.html), [iska-nuernberg.de/zab](https://www.iska-nuernberg.de/zab/sprachvermittler.html) |
| Fürth | Kein Dolmetscher-/Übersetzungsdienst im Sprachwegweiser der Stadt gefunden | – | [fuerth.de – Sprachwegweiser](https://www.fuerth.de/fileadmin/redaktion/04-Bildung-Soziales/02-Dokumente-Allgemein/Sprachwegweiser.pdf) |
| **Integreat Nürnberg / ERH** | Nürnberg: 8 Sprachen (de, en, fr, ar, fa, ru, uk, am); Übersetzung im System per DeepL/Google, Paket 1 000 €/Jahr für Kommunen | **Nein** (nur für Kommunen mit Vertrag, maschinell). Brauchbar als **Terminologie-Vergleich** | [nuernberg.de/integreat](https://www.nuernberg.de/internet/integration/integreat.html), [integreat-app.de](https://integreat-app.de/en/?p=14434) |
| **Translators without Borders / CLEAR Global** | Ehrenamtliche Übersetzer für humanitäre Inhalte | **Nein**: nur gemeinnützige NGOs mit Vorstand, geprüften Abschlüssen und Registernummer; keine Rechtstexte | [TWB – Eligibility](https://translatorswithoutborders.org/partners/Eligibility/) |
| **Hochschulen** | Uni Mainz/Germersheim (Translation): Arabisch, Türkisch, Polnisch, Russisch u. a.; **kein Persisch, Ukrainisch, Paschtu, Somali** | Nur für ar/tr/pl/ru/fr/en – als Praxis-/Abschlussarbeit anfragen (Vorlauf ein Semester) **[Vermutung]** | [DAAD – Translation Mainz](https://www.daad.de/de/in-deutschland-studieren/hochschulen/alle-studiengaenge/detail/johannes-gutenberg-universitaet-mainz-translation-g2755709/?hec-id=g2755709) |
| FAU Erlangen | Kein Übersetzer-Studiengang bekannt; Studierende mit Muttersprache fa/ar/uk/ru/tr über Jobbörse/Aushang als Werkstudent (Stundenlohn) **[Vermutung]** | Ja, günstigster bezahlter Weg | – |
| Migrationsberatung (MBE/JMD bei AWO, Caritas, Diakonie in Erlangen/Nürnberg) | Fachkräfte mit Sozialrechtswissen, oft mehrsprachig | Bester Weg für **fachliche** Prüfung (Sozialrecht + Sprache), z. B. gegen Spende/Honorar oder als Kooperation **[Vermutung]** | – |
| **ISO-17100-Büros** (z. B. Fachübersetzungsdienst, tolingo, lokale Büros in Nürnberg) | Revision durch zweite qualifizierte Person, dokumentiert | Ja, teuerster, aber nachweisbarer Weg; Paschtu/Dari/Somali vorher anfragen | siehe 1.1 |
| Freelancer-Plattformen (ProZ, Translated, Gengo, Upwork) | Translated listet Paschtu/Dari-Übersetzer; Gengo nennt auf der Preisseite weder Sprachen noch Preise | Möglich, aber Qualifikation selbst prüfen (Probetext) | [translated.net – Paschtu](https://translated.net/translators/Pashto/Dari.html), [gengo.com](https://gengo.com/pricing-languages/) |

### 1.3 Kosten je Sprache [Schätzung]

Annahmen: Revision durch Büro je Wort – Gruppe A (en, fr, pl, ro) 0,05–0,08 €; Gruppe B (ar, fa, tr, ru, uk) 0,07–0,10 €; Gruppe C (fa-AF, ps, so) 0,09–0,14 €. Stundenweg (Studierende/Sprachmittler, 15–25 €/h, ca. 1 000 Wörter/h inkl. Rückfragen).

| Sprache | Gruppe | Kritisch (8 750 W.) Büro | Alle (31 300 W.) Büro | Kritisch Stundenweg | Alle Stundenweg |
|---|---|---|---|---|---|
| en | A | 440–700 € | 1 570–2 500 € | 130–220 € | 470–780 € |
| fr | A | 440–700 € | 1 570–2 500 € | 130–220 € | 470–780 € |
| pl | A | 440–700 € | 1 570–2 500 € | 130–220 € | 470–780 € |
| ro | A | 440–700 € | 1 570–2 500 € | 130–220 € | 470–780 € |
| tr | B | 610–880 € | 2 190–3 130 € | 130–220 € | 470–780 € |
| ru | B | 610–880 € | 2 190–3 130 € | 130–220 € | 470–780 € |
| uk | B | 610–880 € | 2 190–3 130 € | 130–220 € | 470–780 € |
| ar | B | 610–880 € | 2 190–3 130 € | 130–220 € | 470–780 € |
| fa | B | 610–880 € | 2 190–3 130 € | 130–220 € | 470–780 € |
| fa-AF (Dari) | C | 790–1 230 € | 2 820–4 380 € | 150–250 € | 550–900 € |
| ps (Paschtu) | C | 790–1 230 € | 2 820–4 380 € | 150–250 € | 550–900 € |
| so (Somali) | C | 790–1 230 € | 2 820–4 380 € | 150–250 € | 550–900 € |
| **Summe 12 Sprachen** | | **ca. 7 200–10 900 €** | **ca. 25 700–39 000 €** | **ca. 1 650–2 750 €** | **ca. 5 900–9 700 €** |
| Einfache Sprache (de) | – | Prüfgruppe/Lektorat Leichte bzw. Einfache Sprache, Angebot einholen | | | |

Für Gruppe C kann es nötig sein, einen Aufschlag für Seltenheit zu zahlen oder länger zu suchen (JVEG nennt „selten verwendete Fremdsprache“ ausdrücklich als Erschwernis [Fakt, § 11 JVEG]).

## 2. Maschinelle Qualitätssicherung – was belegt ist

| Verfahren | Beleg | Bewertung für SoLo |
|---|---|---|
| **Feste Regeln** (Zahlen, €, Daten, §, Platzhalter, Verneinung, Glossarwort vorhanden) | Kein Studienbedarf: deterministisch. xCOMET-Stresstest zeigt, dass gerade Zahlen-/Verneinungsfehler die wichtigsten kritischen Fehler sind [Fakt, Guerreiro u. a. 2024] | **Pflicht, zuerst.** Fängt die gefährlichsten Fehler (falscher Betrag, falsche Frist) sicher. Glossar (`glossar.json`) als Prüfliste nutzen. |
| **LLM-as-judge mit MQM-Fehlerliste** (GEMBA-MQM) | GPT-4 mit festem 3-Beispiel-Prompt erkennt Fehlerspannen ohne Referenz; „state-of-the-art“ bei Systemrangfolge, aber vorläufig, Black-Box [Fakt, [Kocmi/Federmann 2023](https://arxiv.org/abs/2310.13988v1)] | **Ja**, mit einem Modell eines **anderen Herstellers** als dem Übersetzer; Fehlerklassen: Genauigkeit (Auslassung, Hinzufügung, Fehlübersetzung), Terminologie, Zahl, Register; Schwere minor/major/critical. |
| **Multi-Modell-Konsens** | Ableitung aus GEMBA/xCOMET: Fehlerspannen-Erkennung einzeln nur mäßig (F1 ≈ 0,27; GPT-4 ≈ 0,26) [Fakt, xCOMET] → ein Prüfer allein übersieht viel | Zwei unabhängige Prüfer (z. B. zwei Hersteller), nur Texte mit Uneinigkeit oder „major/critical“ an Menschen **[Schätzung]** |
| **xCOMET / CometKiwi** (Qualitätsschätzung) | Fehlerspannen mit MQM-Schwere; deckt Paschtu, Persisch, Somali ab; aber nur an Hochressourcen-Paaren getestet [Fakt, [xCOMET-Paper](https://arxiv.org/pdf/2310.10482)]. **Lizenz CC BY-NC-SA 4.0, kommerzielle Nutzung nur mit Genehmigung von Unbabel** [Fakt, [HF XCOMET-XL](https://huggingface.co/Unbabel/XCOMET-XL), [CometKiwi](https://huggingface.co/Unbabel/wmt22-cometkiwi-da)] | **Nicht ohne Genehmigung** (SoLo ist Nebenerwerb = kommerziell). Außerdem 3,5 Mrd. Parameter, GPU nötig. |
| **Rückübersetzung** | Fachliteratur kritisiert sie als Prüfmethode: Behr, „Assessing the use of back translation: the shortcomings of back translation as a quality testing method“ (Int. J. Social Research Methodology 2017) [Fakt, [DDB-Eintrag](https://www.deutsche-digitale-bibliothek.de/item/D6UKLJMIWFCJ424E3QGMLWSQL3HHDNSY)]; ebenso [Kritik in der Gesundheitsforschung](https://researchers.westernsydney.edu.au/en/publications/translation-and-back-translation-methodology-in-health-research-a/) | Nur als **Lesehilfe** für den Inhaber (er versteht die Zielsprache nicht). Eine KI kann Fehler beim Zurückübersetzen „heilen“ → kein Nachweis. |
| **Terminologieprüfung gegen Termbank** | IATE: Download als TBX/CSV für angemeldete Nutzer, Sprachen = EU-Sprachen [Fakt, [IATE-Download](https://online-help.iate.europa.eu/technical-info/iate-download/)] | Nur für en, fr, pl, ro nutzbar. Für die übrigen: eigenes Glossar aus amtlichen Merkblättern (Abschnitt 3). |
| **Rechtschreibprüfung** | siehe 2.2 | Fängt Tippfehler, nicht Sinnfehler. Billig, offline. |

### 2.1 Wie gut sind KI-Übersetzer für Dari, Paschtu, Somali?

| Sprache | ChatGPT 0-shot | GPT-4 5-shot | NLLB | Google |
|---|---|---|---|---|
| Paschtu | 19,7 | 26,7 | 39,4 | – |
| Somali | 29,4 | – | 43,0 | 43,7 |
| Dari | 44,8 | – | 53,6 | – |
| Persisch (Iran) | 48,6 | – | 51,3 | 54,3 |

chrF2++ auf FLORES-200, höher = besser [Fakt, [Robinson u. a. 2023, „ChatGPT MT: Competitive for High- (but not Low-) Resource Languages“](https://ar5iv.labs.arxiv.org/html/2309.07423)]. Kernaussage: Die Ressourcenlage einer Sprache sagt die Qualität am stärksten voraus; bei Niedrigressourcen-Sprachen schlug ChatGPT NLLB nur in 6 % der Fälle (5-shot).

Einschränkung: Die Studie ist von 2023; neuere Modelle sind besser. WMT25 (vorläufig, automatisch) zeigt, dass auch 2025 die Messverfahren bei Niedrigressourcen-Sprachen unzuverlässig sind und dort nur chrF++ genutzt wurde [Fakt, [WMT25 Preliminary Ranking](https://arxiv.org/html/2508.14909v2)]. Paschtu, Dari, Somali waren bei WMT25 nicht dabei; Persisch schon. **Folgerung [Schätzung]:** Reihenfolge des Risikos bleibt ps > so > fa-AF > fa/ar > Rest – passt zum eigenen Glossar-Abgleich (fa-AF nur 20, ps 24, so 35 von 65 Glossarbegriffen belegt; so: „dacwad“ für Widerspruch fraglich).

### 2.2 Offline-Rechtschreibprüfung je Sprache

| Sprache | npm (Hunspell, `dictionary-xx`) | LanguageTool (offline, Java; pip `language-tool-python` 3.4.0) | Sonstiges |
|---|---|---|---|
| en | dictionary-en 4.0.0 (MIT/BSD) | ja, 6 074 Regeln, aktiv gepflegt | – |
| fr | dictionary-fr 3.0.0 (MPL-2.0) | ja, 6 984 Regeln | – |
| pl | dictionary-pl 2.0.0 (GPL/LGPL/MPL) | ja, 1 747 Regeln | – |
| ro | dictionary-ro 3.0.0 (GPL/LGPL/MPL) | ja, 457 Regeln (keine Pflege in 6 Mon.) | – |
| ru | dictionary-ru 3.0.0 (BSD-3) | ja, 892 Regeln | – |
| uk | dictionary-uk 4.0.0 (GPL-3.0) | ja, 1 186 Regeln, aktiv | – |
| tr | dictionary-tr 2.0.0 (MIT) | **nein** | – |
| fa | dictionary-fa 2.0.0 (Apache-2.0) | Grammatik 283 Regeln, **ohne** Rechtschreibung | – |
| fa-AF | wie fa (iranisches Wörterbuch, meldet Dari-Wörter fälschlich) **[Vermutung]** | wie fa | – |
| ar | kein npm-Paket | ja, 450 Regeln + Rechtschreibung | Hunspell **Ayaspell** (`hunspell-ar`, Debian/Fedora) |
| so | kein npm-Paket | **nein** | Hunspell **hunspell-so** 1.0.2 (GPL-2.0+, Open Source Somalia; Fedora/Debian) |
| ps | kein npm-Paket | **nein** | kein gepflegtes Offline-Wörterbuch gefunden |

Quellen: `npm view dictionary-<xx>` am 21.11.2026; [LanguageTool – Sprachen](https://dev.languagetool.org/languages); [Fedora hunspell-so](https://packages.fedoraproject.org/pkgs/hunspell-so/hunspell-so/index.html); [Ayaspell](https://github.com/munzirtaha/ayaspell). Hunspell-Dateien lassen sich mit `nspell` (npm) laden. Lizenz GPL nur im Prüfwerkzeug nutzen, nicht in die App einbauen.

## 3. Amtliche Terminologie-Quellen

| Quelle | Sprachen (laut Seite) | Link |
|---|---|---|
| Familienkasse: Merkblatt Kindergeld (KG2) | en, fr, pl, ro, tr u. a. (EU-Sprachen) | [Downloads Familienkasse](https://www.arbeitsagentur.de/familie-und-kinder/downloads-familie-und-kinder) |
| Familienkasse: Flyer für Asylberechtigte/Flüchtlinge | en, ar, fr, fa | ebd. |
| Familienkasse: Kurzmerkblatt Ukraine | ru, uk | ebd. |
| Kinderzuschlag: Merkblatt KiZ 2 / Flyer | Merkblatt en, ar, tr; Flyer en, ar, fa, fr | ebd. |
| BA: Grundsicherung – Informationen für Menschen aus dem Ausland | Merkblatt in „anderen Sprachen“ (Liste nicht im Text) | [arbeitsagentur.de/grundsicherung](https://www.arbeitsagentur.de/grundsicherung/infos-fuer-menschen-aus-dem-ausland) |
| BA: Infomaterial Ukraine | uk, ru | [arbeitsagentur.de/ukraine](https://arbeitsagentur.de/ukraine/ukraine-infomaterial) |
| Deutsche Rentenversicherung: fremdsprachige Seiten/Broschüren | u. a. tr, pl, ru | [DRV – Broschüren Ausland](https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Mediathek/Broschueren/Broschueren_Ausland/broschueren_international_node.html) |
| BMG: Ratgeber Gesundheit für Asylsuchende | u. a. ar | [BMG – Ratgeber (ar)](https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/A/Asylsuchende/Ratgeber_Asylsuchende_ARAB_web.pdf) |
| Portal Migration und Gesundheit (BMG) | über 40 Sprachen | [KBV-Meldung](https://www.kbv.de/praxis/tools-und-services/praxisnachrichten/2025/04-24/Online-Portal%20bietet%20Publikationen%20in%20%C3%BCber%2040%20Sprachen) |
| IATE (EU-Termbank) | nur EU-Sprachen → en, fr, pl, ro | [iate.europa.eu](https://online-help.iate.europa.eu/technical-info/iate-download/) |
| Integreat Nürnberg (Inhalte der Kommune) | de, en, fr, ar, fa, ru, uk, am | [nuernberg.de/integreat](https://www.nuernberg.de/internet/integration/integreat.html) |
| Handbook Germany (nicht amtlich, öffentlich gefördert **[Vermutung]**) | laut Bericht 2019: de, ar, en, fa, tr, fr, ps | [tuenews.de](https://tuenews.de/handbook-germany-2/) |

**Lücke [Fakt]:** Für **Dari, Paschtu, Somali** bietet die Familienkasse kein Merkblatt an; für Somali fand sich keine amtliche Sozialrechtsquelle. Diese Begriffe können nur Muttersprachler mit Sozialrechtswissen festlegen.

## 4. Empfehlung

### Grundverfahren (gilt für alle Budgets, in dieser Reihenfolge)

| Schritt | Was | Parallel? | Dauer [Schätzung] |
|---|---|---|---|
| 1 | Kritische Texte markieren (Liste der ca. 350 Schlüssel, z. B. Feld „kritisch“ in einer Prüfliste, nicht im App-Code) | – | 1 Tag |
| 2 | **Regelprüfung** aller Sprachen: Zahlen, €, Daten, §, Platzhalter, Verneinung, Glossarwort (aus `glossar.json`), Länge | alle Sprachen parallel | 1–2 Tage Aufbau, danach Sekunden |
| 3 | **Zwei KI-Prüfer verschiedener Hersteller** bewerten jeden kritischen Text nach MQM (Fehlerart, Schwere, Begründung auf Deutsch) | parallel je Sprache | 1–2 Tage |
| 4 | Rechtschreibprüfung (Tabelle 2.2) | parallel | 1 Tag |
| 5 | Fundstellen korrigieren; Rückübersetzung nur als Lesehilfe | – | 2–3 Tage |
| 6 | **Muttersprachler** prüft die kritischen Texte (Reihenfolge siehe unten), Fragen gesammelt per Tabelle (Deutsch / Übersetzung / Rückübersetzung / Kommentar) | Sprachen parallel an verschiedene Personen | 1–3 Wochen je Sprache (Suche dauert länger als Prüfung) |
| 7 | Ergebnis ins Glossar übernehmen, Regelprüfung erneut laufen lassen | – | 1 Tag |

### (a) Ohne Budget

1. Schritte 2–5 vollständig (eigene Arbeit + vorhandene KI-Zugänge).
2. Muttersprachler über Netzwerke: AWO-Sprachmittlerpool Erlangen/ERH und ZAB Nürnberg anschreiben (Bitte um Weitervermittlung an Ehrenamtliche, die freiwillig Texte lesen), Migrationsberatungen (Caritas/Diakonie/AWO), Kolleginnen/Kollegen aus der Jugendhilfe, Elternschaft. Gegenleistung: Nennung in der App („geprüft von …“) **[Vermutung: realistisch für 2–4 Sprachen]**.
3. In der App weiter offen sagen: „Übersetzung maschinell erstellt und geprüft; im Zweifel gilt der deutsche Text“.

### (b) Kleines Budget (bis ca. 1 000 €)

1. Schritte 2–5 wie (a).
2. Bezahlte Prüfung der **kritischen Texte** auf Stundenbasis (Studierende/Sprachmittler, ca. 150–250 € je Sprache) für **Paschtu, Somali, Dari, Arabisch** (ca. 600–1 000 €).
3. Wenn Geld übrig: Ukrainisch oder Türkisch.
4. Je Sprache möglichst eine Person mit Sozialrechts-/Beratungsbezug.

### (c) Beste Qualität

1. Schritte 2–5 wie (a).
2. ISO-17100-Büro: **Revision aller Texte** in ps, so, fa-AF, ar, uk, tr (ca. 15 000–21 000 € **[Schätzung]**), kritische Texte in den übrigen 6 Sprachen (ca. 3 000–4 600 €).
3. Zusätzlich fachliche Gegenlesung der kritischen Texte durch je eine Migrationsberaterin/einen Migrationsberater pro Sprache (Sprache + Sozialrecht).
4. Nach jedem Update nur geänderte Texte nachprüfen lassen (Translation Memory beim Büro senkt Folgekosten).
5. Dauer: ca. 4–8 Wochen bis alle Sprachen fertig.

### Reihenfolge der Menschenprüfung (Risiko × Nutzerzahl)

| Rang | Sprache | Risiko KI | Nutzerzahl | Begründung |
|---|---|---|---|---|
| 1 | ps (Paschtu) | sehr hoch | mittel | schwächste KI-Werte, kein amtliches Merkblatt, kein Wörterbuch |
| 2 | so (Somali) | sehr hoch | klein–mittel | schwache KI-Werte, „Widerspruch“ uneinheitlich (fraglich „dacwad“), keine amtliche Quelle |
| 3 | fa-AF (Dari) | hoch | mittel | nur 20/65 Glossarbegriffe belegt, kein amtliches Merkblatt |
| 4 | ar (Arabisch) | mittel | groß (Syrien 9 % der Bürgergeld-Beziehenden) | „Frist“ uneinheitlich (مهلة/موعد) |
| 5 | uk (Ukrainisch) | niedrig | sehr groß (Ukraine 13 % der Bürgergeld-Beziehenden) | viel genutzt, gute KI |
| 6 | tr (Türkisch) | niedrig | groß | keine LanguageTool-Prüfung |
| 7–12 | fa, ru, ro, pl, fr, en | niedrig | unterschiedlich | KI gut, amtliche Merkblätter vorhanden |

Nutzerzahlen: Migrationsmonitor der BA, Stand Mai 2025, laut [Correctiv-Faktencheck vom 24.07.2025](https://correctiv.org/faktencheck/gesellschaft/2025/07/24/buergergeld-erneut-fuehren-grafiken-zum-bezug-von-gefluechteten-in-die-irre/) (Ukraine 13 %, Syrien 9 % von ca. 5,4 Mio. Leistungsberechtigten). Für Afghanistan/Türkei nannte die Quelle keine Werte.

## Offene Punkte

- Konkrete Angebote einholen: 2 ISO-17100-Büros (ps, fa-AF, so, ar) mit Testtext von 500 Wörtern.
- Bei AWO Erlangen und ZAB Nürnberg nachfragen, ob schriftliche Kurzprüfungen über Ehrenamtliche möglich sind (laut Seiten nur mündlich).
- xCOMET/CometKiwi nur nach schriftlicher Genehmigung von Unbabel einsetzen.
- Einfache Sprache: Angebot einer Prüfgruppe einholen (nicht recherchiert).
