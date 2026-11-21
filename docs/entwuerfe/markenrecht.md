# Markenrecht und ähnliche Rechte – Prüfung für SoLo (Entwurf)

Stand: 21.11.2026, Repo-Stand `origin/main` (e2c3406, Version 1.9 vorbereitet). Erstellt von Claude, **keine Rechtsberatung**. Siehe Abschnitt 6, wann ein Anwalt sinnvoll ist.

## Kurz gesagt

| Nr | Thema | Ampel | Muss vor 1.9 etwas geändert werden? |
|---|---|---|---|
| 1 | Name „SoLo – Sozialleistungslotse“ (Marken, Domains) | 🟡 Gelb | Nein. Aber vor der Vermarktung Register selbst prüfen (Anleitung unten) |
| 2 | Amtliche Namen, Logos, Eindruck „Behörden-App“ | 🟡 Gelb | **Ja, nur Store-Text:** Quellen in die Beschreibung (Google-Play-Regel). Empfohlen: Satz „keine App einer Behörde“ auch in der App |
| 3 | Fremde Inhalte (Schriften, Bibliotheken, Texte) | 🟢 Grün (kleine Lücke) | Nein. Lizenztexte beim nächsten Update vollständig beilegen |
| 4 | RDG, Haftung, Impressum | 🟡 Gelb | Nein. Vor Bezahlversion/Werbung: Impressum und Händlerangaben prüfen |

**Dringendste Empfehlung:** Für die Play-Store-Beschreibung eine Zeile mit amtlichen Quellen ergänzen (z. B. „Quellen: gesetze-im-internet.de, arbeitsagentur.de, familienportal.de“). Google verlangt das für Apps mit Behördeninformationen, die nicht von einer Behörde stammen. Die Beschreibung hat jetzt 3.986 von 4.000 Zeichen, also an anderer Stelle kürzen.

---

## 1. Name: Marken und Domains 🟡

### Was geprüft wurde

- **Amtliche Register:** Das DPMA-Register (register.dpma.de) sperrt automatische Abrufe (robots.txt), TMview/EUIPO hat die automatische Suche abgelehnt. **Eine vollständige Registerrecherche war deshalb nicht möglich.** Das Ergebnis unten beruht auf Websuche, Domain-Abfrage (DNS) und Store-Suche. Die Registerprüfung muss von Hand nachgeholt werden (Anleitung unten, dauert ca. 30 Minuten).
- **Im Repo:** Der alte Name „Leistungs-Lotse“ kommt nirgends mehr vor (ein Test in `test/test.js` sichert das ab). App-Name im Store „SoLo – Sozialleistungslotse“, Paket `com.Sozialleistungslotse`, Test-App „SoLo Test“ (nur für Tester).

### Ergebnisse je Name

| Name | Einschätzung | Ampel |
|---|---|---|
| **„Leistungs-Lotse“ / „LeistungsLotse“** | **Es gibt eine Firma „LeistungsLotse GmbH“** (leistungslotse.de → leistungslotse.com) mit Software genau im selben Feld: Antragsportal für Bürger und Fachsoftware für Ämter zu Wohngeld, Bürgergeld, Grundsicherung, Bildung und Teilhabe. Ein Firmenname ist auch **ohne Eintragung als Marke** geschützt (Unternehmenskennzeichen, § 5 MarkenG). Ein ®-Zeichen steht auf der Seite nicht; ob zusätzlich eine Marke eingetragen ist, war nicht prüfbar. Gut, dass dieser Name aus SoLo entfernt ist. **Nie wieder verwenden** (auch nicht in Werbung, Domains, Social Media). | 🔴 für den alten Namen, erledigt |
| **„Sozialleistungslotse“** | Enthält „Leistungslotse“ vollständig, mit vorangestelltem „Sozial“. Das ist der **wichtigste Restpunkt**: Die LeistungsLotse GmbH könnte Verwechslungsgefahr behaupten (gleiches Themenfeld). Dagegen spricht: „Leistungs-Lotse“ und „Sozialleistungslotse“ sind stark beschreibend (Lotse = jemand, der durch etwas führt), solche Namen haben nur einen engen Schutzumfang; beschreibende Begriffe darf jeder als Beschreibung benutzen (§ 23 MarkenG). Zielgruppe der GmbH sind vor allem Kommunen. Deshalb: Gelb, nicht Rot. Folge: „Sozialleistungslotse“ allein wäre als Marke vermutlich **nicht eintragbar** (beschreibend, § 8 Abs. 2 MarkenG). | 🟡 |
| **„SoLo“** | „Solo“ ist ein häufiges Wort; es gibt viele Marken und Apps mit „Solo“ (Beispiel: „Solo – Tax & Invoice“ der Solo Ltd aus Neuseeland, Steuer-App für Selbstständige, nur NZ). Ein Konflikt entsteht nur bei ähnlichem Zeichen **und** ähnlichen Waren/Dienstleistungen (Software, Finanz-, Rechts-, Sozialberatung). Ob es in DE/EU eine „SOLO“-Marke in Klasse 9/42/36/45 gibt, muss die Registersuche zeigen. Die Schreibweise „SoLo“ zusammen mit „Sozialleistungslotse“ und dem eigenen Sprechblasen-Logo macht SoLo unterscheidbarer. | 🟡 |
| **„SoLo Test“** | Nur Name der internen Test-App, nicht öffentlich beworben. | 🟢 |
| **„Lotse“ allgemein** (KiZ-Lotse, Behördenlotse) | „Lotse“ wird sehr oft benutzt: „KiZ-Lotse“ (Vorab-Check der Familienkasse), „Behördenlotsen“ (z. B. Landkreis Heilbronn), Kita-Lotse u. a. Das Wort allein gehört niemandem. SoLo nennt den KiZ-Lotsen nur als Hinweis auf das amtliche Angebot (`s.kiz.wo`), das ist zulässig. **Nicht** tun: SoLo „KiZ-Lotse“ o. ä. nennen oder einen Rechner so benennen. | 🟢 |
| **Logo** (Sprechblase mit Haken, Grün/Koralle) | Eigene, einfache Gestaltung; keine Ähnlichkeit zu Behördenlogos erkennbar. Häkchen-Sprechblasen sind verbreitet, deshalb schwach unterscheidend, aber unproblematisch. | 🟢 |

### Domains (Abfrage über DNS am 21.11.2026; „frei“ = keine Einträge, endgültig erst bei der Registrierung)

| Domain | Stand |
|---|---|
| sozialleistungslotse.de | vermutlich frei |
| sozialleistungs-lotse.de | vermutlich frei |
| solo-lotse.de | vermutlich frei |
| leistungs-lotse.de | vermutlich frei (wegen LeistungsLotse GmbH **nicht** nehmen) |
| leistungslotse.de | belegt (LeistungsLotse GmbH) |
| solo.de | belegt, geparkt (Sedo, vermutlich zu verkaufen) |
| solo-app.de | belegt (anderes Angebot) |

Die App nutzt derzeit `dcabrerizo-lab.github.io`.

### Empfehlungen zu 1

1. **sozialleistungslotse.de registrieren** (ca. 5–15 € im Jahr). Schützt vor Trittbrettfahrern und wirkt seriöser als github.io.
2. **Registersuche von Hand** (kostenlos):
   - DPMAregister → Marken → Einsteigerrecherche: https://register.dpma.de – Suchbegriffe: `SOLO`, `SoLo`, `*lotse*`, `Leistungslotse`, `Sozialleistungslotse`; Klassen 9, 35, 36, 38, 41, 42, 45.
   - TMview (alle EU-Ämter und EUIPO): https://www.tmdn.org/tmview – gleiche Begriffe, Ämter DE + EM (EU) + WO (international mit Wirkung DE).
   - WIPO Global Brand Database: https://branddb.wipo.int
   - Treffer notieren: Marke, Inhaber, Klassen, Status (angemeldet/eingetragen). Bei einem Treffer „SOLO“ in Klasse 9 oder 42 mit Bezug zu Finanzen/Recht/Soziales: Anwalt fragen (Abschnitt 6).
3. **Eigene Marke?** Vor einer Vermarktung lohnt sich eine Anmeldung der **Wort-Bild-Marke** „SoLo – Sozialleistungslotse“ mit Logo beim DPMA (online ab ca. 290 € für bis zu 3 Klassen, z. B. 9, 42, 45; Schutz 10 Jahre, nur Deutschland). Reine Wortmarke „Sozialleistungslotse“ wird wahrscheinlich abgelehnt (beschreibend). Eine EU-Marke ist deutlich teurer und für eine rein deutsche App nicht nötig.
4. Immer die Kombination „SoLo – Sozialleistungslotse“ verwenden, nicht „Leistungslotse“ abkürzen.

---

## 2. Amtliche Namen, Logos, Eindruck „Behörden-App“ 🟡

### Was erlaubt ist

- **Behördennamen als Information** („Bescheid vom Jobcenter“, „Antrag bei der Familienkasse“, „Elterngeld“, „Bundesagentur für Arbeit“) sind erlaubt. Das sind Bezeichnungen von Stellen und Leistungen; wer sie nur nennt, um zu informieren, verletzt keine Marke (§ 23 MarkenG).
- **Links auf amtliche Formulare** und Hinweise auf amtliche Rechner (KiZ-Lotse) sind erlaubt.
- **Gesetze, Verordnungen, amtliche Bekanntmachungen** sind gemeinfrei (§ 5 UrhG), z. B. die Mietenstufen aus der Wohngeldverordnung.

### Was verboten oder riskant ist

| Was | Warum | Stand SoLo |
|---|---|---|
| Bundesadler, Landeswappen, Dienstsiegel | Ordnungswidrigkeit (§ 124 OWiG), Störung des Vertrauens in Behörden | Nicht verwendet (geprüft: `src/`, `site/`, Icons). STORE.md verbietet Wappen in Store-Bildern. 🟢 |
| Logos von Jobcenter, BA, Familienkasse | Marken- bzw. Namensrecht der Behörden, Irreführung | Nicht verwendet. 🟢 |
| Eindruck, SoLo sei eine amtliche App | Irreführung nach § 5 UWG (sobald geschäftlich, z. B. mit Werbung oder Bezahlversion); Store-Richtlinien | Teilweise abgesichert, siehe unten. 🟡 |
| Amtsanmaßung (§ 132 StGB), Missbrauch von Titeln/Abzeichen (§ 132a StGB) | Nur, wenn sich jemand als Amtsträger ausgibt oder Amtsabzeichen trägt | **Nicht relevant** für SoLo. 🟢 |

### Store-Regeln

- **Google Play, „Requirements for apps that communicate government information“** (support.google.com/googleplay/android-developer/answer/9514050, abgerufen 21.11.2026): Apps, die Informationen von Behörden weitergeben, ohne zu einer Behörde zu gehören, müssen (1) **gut sichtbare Informationsquellen in der App-Beschreibung und im Store-Eintrag** nennen und (2) **klarstellen, dass die App keine Behörde vertritt**. Die Quellen sollen das Nachprüfen ermöglichen (Beispiel: Link auf eine .gov-Domain). Außerdem ist in der Play Console die Erklärung „Government apps“ (App-Inhalte) auszufüllen.
- **Apple:** Richtlinie 5.2.1 verbietet fremde Marken ohne Erlaubnis und „irreführende … Namen oder Metadaten“. Richtlinie 5.1.1(ix): Apps aus stark regulierten Bereichen oder mit **sensiblen Nutzerdaten** „sollten“ von einer juristischen Person eingereicht werden, nicht von Einzelentwicklern. SoLo speichert Gesundheitsangaben nur lokal und ist bereits bei Apple; bei einer Ablehnung wäre das die Stelle, an der man ansetzt.

### Stand in SoLo

| Stelle | „Keine App einer Behörde“ | Quellen genannt |
|---|---|---|
| Play-Beschreibung (`docs/STORE.md`, Abschnitt A) | ✅ letzter Absatz | ❌ **fehlt** |
| Apple-Beschreibung (gleicher Text) | ✅ | ❌ fehlt (bei Apple nicht vorgeschrieben, aber gleicher Text) |
| Hinweise für Apple Review | ✅ | – |
| Play Console „Behörden-App?“ | ✅ „Nein“ vermerkt | – |
| Website `site/index.html` | ✅ | – |
| **In der App** (Bereich „Impressum, Datenschutz, Lizenzen“ → „Hinweis“) | ❌ **fehlt** (nur „keine Rechtsberatung“) | ✅ Startseite „nach amtlichen Quellen“, Quellen je Leistung |

### Empfehlungen zu 2

1. **Vor 1.9 (nur Store-Text, kein Build nötig):** In der Play-Beschreibung eine Quellenzeile einfügen, z. B.
   `Quellen: Gesetze (gesetze-im-internet.de), Bundesagentur für Arbeit (arbeitsagentur.de), Familienportal des Bundes (familienportal.de), BayernPortal.`
   Dafür ca. 140 Zeichen an anderer Stelle kürzen (z. B. in der langen Leistungsliste). Den Satz „SoLo ist keine App einer Behörde“ stehen lassen.
2. **Beim nächsten App-Update:** Im „Hinweis“ der App (`src/template.html`, Abschnitt `#legal`) ergänzen: „SoLo ist keine App einer Behörde und gehört zu keiner Behörde.“ (Diese Datei wird von mehreren Sitzungen bearbeitet; Änderung klein halten.)
3. In Screenshots und Werbung keine Formulierungen wie „offiziell“, „amtlicher Rechner“, „Jobcenter-App“. Der Satz „nach amtlichen Quellen“ ist in Ordnung.

---

## 3. Fremde Inhalte 🟢 (kleine Lücke)

| Bestandteil | Lizenz | Hinweis in der App | Lizenztext beigelegt? |
|---|---|---|---|
| Atkinson Hyperlegible, Nunito (Fontsource) | SIL OFL 1.1 | ✅ | ❌ |
| Noto Sans (PDF) | SIL OFL 1.1 | ✅ | ❌ |
| Capacitor + Plugins, pdf-lib, fontkit | MIT | ✅ (fontkit nicht einzeln genannt) | ❌ (nur Kurzhinweise im gebündelten Code, `legalComments: 'eof'`) |
| qrcode-generator (`src/vendor/qrcode.js`) | MIT | ✅ inkl. Marke „QR Code“ (DENSO WAVE) | ✅ Kopfzeile im Code |
| pdf.js 3.11.174 | Apache 2.0 | ✅ | ✅ `www/pdfjs/LICENSE` wird kopiert |
| Google ML Kit (Texterkennung Android) | Google-Nutzungsbedingungen | ✅ | – (Datenweitergabe an Google ist in STORE.md/Datenschutz berücksichtigt) |
| Tesseract.js (nur Web, von CDN) | Apache 2.0 | ✅ | – (wird nicht mitgeliefert) |
| GeoNames | CC BY 4.0 | ✅ Namensnennung | – |
| Wikidata | CC0 | ✅ | – |
| Anschriften aus Impressen/Wikipedia | Einzelne Fakten (Anschriften) sind nicht urheberrechtlich geschützt | ✅ Quelle je Anschrift | – |

**Bewertung:** Die Namensnennung ist vorbildlich. Formal verlangen OFL, MIT und Apache, dass der **vollständige Lizenztext** mitgeliefert wird. Das ist bei Fonts und MIT-Bibliotheken noch nicht der Fall. Risiko gering (Abmahnungen wegen fehlender MIT/OFL-Texte sind selten), aber einfach zu beheben.

**Texte (Schuldnerberatung, Glossar, Integreat):** Im Repo gibt es keine Übernahme aus Integreat. `docs/quellen/*.md` zeigt, dass Inhalte aus Gesetzen (gemeinfrei) und Fachquellen **in eigenen Worten** geschrieben sind; wörtliche Zitate stehen nur in den Prüfdokumenten, als kurze Belege. Kurze Fakten und Fristen sind nicht geschützt; geschützt wären längere, wörtlich übernommene Formulierungen aus Ratgebern (z. B. Schuldnerberatungs-Broschüren, Verbraucherzentrale). **Regel für künftige Texte:** nie Absätze aus Ratgebern kopieren, nur Inhalt in eigenen Worten mit Quelle.

### Empfehlungen zu 3

1. Beim nächsten Update in `scripts/build-app.js` die Lizenzdateien mitkopieren (OFL.txt der drei Schriften, LICENSE von Capacitor, pdf-lib, fontkit) und im Bereich „Lizenzen“ einen Link „Lizenztexte“ ergänzen. Kein Muss für 1.9.
2. Bei neuen Bibliotheken jeweils Lizenz prüfen; GPL/AGPL-Bibliotheken vermeiden (sie würden verlangen, dass SoLo seinen Quellcode offenlegt).

---

## 4. RDG, Haftung, Impressum 🟡 (nur Kurzhinweis, Details in eigener Prüfung)

- **Rechtsdienstleistungsgesetz (RDG):** Eine Rechtsdienstleistung ist eine rechtliche Prüfung im **konkreten Einzelfall** (§ 2 RDG). Allgemeine Informationen und Rechner sind keine. Grenzfälle in SoLo: Bescheid nachrechnen, Widerspruchs-Briefhilfe, Inkasso-Prüfung. Der BGH hat 2021 einen automatischen Vertragsgenerator nicht als Rechtsdienstleistung eingestuft („Smartlaw“, I ZR 113/20); das spricht für SoLo, solange die App Vorlagen und Rechenwege liefert und nicht wie ein Anwalt „entscheidet“. Der Hinweis „keine Rechtsberatung“ ist vorhanden. **Mit Bezahlfunktion steigt das Risiko**, deshalb vor einer Bezahlversion gezielt prüfen lassen.
- **Haftung:** „Ohne Gewähr“ schützt nicht vollständig, vor allem nicht bei grober Fahrlässigkeit. Gute Quellenarbeit (wie im Repo) ist der beste Schutz. Bei Vermarktung über eine Berufshaftpflicht bzw. IT-Haftpflicht nachdenken.
- **Impressum (§ 5 DDG):** Pflicht für „geschäftsmäßige“ digitale Dienste. Vorhanden in der App (`#legal`, „Impressum (§ 5 DDG)“) mit Name, Anschrift, E-Mail. ✅ Bei Vermarktung prüfen: (a) Die Anschrift muss eine **ladungsfähige** Anschrift sein; wer die Privatanschrift nicht zeigen will, braucht eine echte Geschäftsadresse (reine Postfächer reichen nicht). (b) Umsatzsteuer-ID oder Wirtschafts-ID angeben, falls vorhanden. (c) In den Stores muss bei Einnahmen der **Händlerstatus** (EU-Gesetz über digitale Dienste) angegeben werden; dann zeigen Apple und Google Anschrift, Telefon und E-Mail öffentlich im Store an.

---

## 5. To-do-Liste

| Wann | Was | Aufwand |
|---|---|---|
| **Vor 1.9** | Quellenzeile in die Play-Beschreibung (und gleichen Text bei Apple), dafür kürzen | 10 Min. |
| Vor 1.9 | Play Console: Erklärung „Government apps“ ausgefüllt? (STORE.md: „Nein“) | 2 Min. |
| Bald | Domain sozialleistungslotse.de registrieren | 10 Min., ca. 10 €/Jahr |
| Bald | Registersuche DPMA/TMview von Hand (Abschnitt 1) | 30 Min. |
| Nächstes Update | „Keine App einer Behörde“ auch im Hinweis in der App | klein |
| Nächstes Update | Vollständige Lizenztexte mitliefern | klein |
| Vor Vermarktung | Wort-Bild-Marke beim DPMA anmelden (nach Registersuche) | ca. 290 € |
| Vor Vermarktung | Impressum-Anschrift, Händlerstatus, RDG-Prüfung der Briefhilfe | – |
| Immer | Nie „Leistungslotse“/„Leistungs-Lotse“ verwenden; keine Wappen/Behördenlogos | – |

## 6. Wann ein Markenanwalt sinnvoll ist

Diese Prüfung ersetzt keine anwaltliche Beratung. Einen Fachanwalt für gewerblichen Rechtsschutz oder Patentanwalt (Erstberatung oft 150–300 €; manche IHKs und Patentinformationszentren bieten kostenlose Kurzberatung) sollte man fragen:

- **bevor** Geld in Marke, Werbung oder Bezahlversion fließt (Registerrecherche mit Ähnlichkeitssuche, Wahl der Klassen),
- wenn die eigene Registersuche einen Treffer „SOLO“ oder „…lotse“ in Klasse 9, 36, 42 oder 45 zeigt,
- **sofort**, wenn eine Abmahnung, ein Brief der LeistungsLotse GmbH oder eine Beschwerde im Store kommt: nichts unterschreiben (vor allem keine Unterlassungserklärung) und Fristen notieren,
- wenn SoLo einmal Bescheide im Einzelfall gegen Geld prüfen soll (RDG).

## Quellen (abgerufen 21.11.2026)

- Google Play Console-Hilfe: Requirements for apps that communicate government information – https://support.google.com/googleplay/android-developer/answer/9514050
- Apple App Review Guidelines 5.1.1(ix), 5.2.1 – https://developer.apple.com/app-store/review/guidelines/
- LeistungsLotse GmbH – https://leistungslotse.com (Weiterleitung von leistungslotse.de)
- Solo – Tax & Invoice NZ (Google Play) – https://play.google.com/store/apps/details?id=nz.solo
- Behördenlotsen Landkreis Heilbronn – https://www.landkreis-heilbronn.de/flyer-behoerdenlotsen-pdf.125416.htm
- § 124 OWiG – https://www.gesetze-im-internet.de/owig_1968/__124.html
- Gesetze: MarkenG §§ 5, 8, 14, 15, 23; UWG § 5; UrhG § 5; RDG § 2; DDG § 5; StGB §§ 132, 132a (gesetze-im-internet.de)
- Domainstand: DNS-Abfrage (dns.google) am 21.11.2026
- Nicht automatisch abrufbar: DPMAregister (robots.txt), TMview/EUIPO, WIPO Global Brand Database
