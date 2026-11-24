# Prüfbericht (Stand 11. November 2026)

Gründliche Durchsicht aus zwei Blickwinkeln: fachlich (Sozialrecht) und technisch. Grundlage ist der Code in `src/`.
Eine Prüfung durch eine Sozialberatung oder eine Fachanwältin ersetzt dieser Bericht nicht. Er soll sie erleichtern.

## Fachlich: geprüfte Werte 2026

| Wert | In der App | Rechtsgrundlage |
|---|---|---|
| Regelbedarfe 563 / 506 / 451 / 471 / 390 / 357 € | ✓ | RBSFV 2026, Anlage zu § 28 SGB XII |
| Kindergeld 259 € | ✓ | § 66 EStG |
| Kinderzuschlag höchstens 297 € je Kind, Mindesteinkommen 900 / 600 €, Minderung 45 % | ✓ | § 6a BKGG |
| Vermögen Kinderzuschlag 40.000 € + 15.000 € je weitere Person | ✓ | § 6a Abs. 3 BKGG i. V. m. § 12 SGB II |
| Unterhaltsvorschuss 227 / 299 / 394 € | ✓ | § 2 UVG (Mindestunterhalt minus Kindergeld) |
| BAföG-Freibeträge Eltern 2.540 / 1.690 €, je Kind 770 € | ✓ | § 25 BAföG (Websuche 8.11.2026: mehrere Quellen übereinstimmend) |
| Pflegegeld 347 / 599 / 800 / 990 €, Entlastungsbetrag 131 € | ✓ | §§ 37, 45b SGB XI |
| Behinderten-Pauschbeträge, Fahrtkosten 900 / 4.500 € | ✓ | § 33b Abs. 3 EStG, § 33 Abs. 2a EStG |
| Grundfreibetrag 12.348 € | ✓ | § 32a EStG |
| Minijob-Grenze 603 € | ✓ | § 8 Abs. 1a SGB IV |
| Beitragsbemessungsgrenzen 8.450 € (ALV) / 5.812,50 € (KV) | ✓ | Sozialversicherungs-Rechengrößen 2026 |
| Wohngeld: Höchstbeträge, Klima- und Heizkomponente, Formel a/b/c | ✓ (von unabhängiger Rechnung bestätigt) | §§ 12, 19 WoGG, Anlagen 1 und 2 |
| Regelaltersgrenze je Geburtsjahr | ✓ | § 235 SGB VI |
| Werkstattlohn: 52 € AFöG frei, 1/8 RS1 + 50 % frei | ✓ | § 82 Abs. 2 Nr. 5, Abs. 3 Satz 2 SGB XII |
| Grundrentenfreibetrag 100 € + 30 %, höchstens 281,50 € | ✓ | § 82a SGB XII |
| Mehrbedarf G 17 %, Alleinerziehende 12–60 % | ✓ | § 30 Abs. 1 und 3 SGB XII, § 21 Abs. 3 SGB II |
| ALG I 60 / 67 %, Dauer nach Versicherungszeit und Alter | ✓ | §§ 147, 149 SGB III |
| Krankengeld 70 % brutto, höchstens 90 % netto, 78 Wochen | ✓ | §§ 47, 48 SGB V |

## Fachlich: bei dieser Durchsicht korrigiert

- **Minijob:** kein Krankengeld (nicht krankenversichert über die Arbeit) und keine Anwartschaft auf Arbeitslosengeld (§ 27 Abs. 2 SGB III).
- **Gemischte Bedarfsgemeinschaft:** Ist bei einem Paar mit Kindern eine Person im Rentenalter oder voll erwerbsgemindert, kann die andere Person mit den Kindern zum Jobcenter gehören. Das zeigt die App jetzt als „möglich“, statt pauschal „nur Sozialamt“.
- **Zuzahlungen:** Als schwerwiegend chronisch krank gilt auch, wer Pflegegrad 3 bis 5 hat (Chroniker-Richtlinie § 2).
- **Fahrtkostenpauschale bei Merkzeichen aG:** 4.500 € statt 900 €.
- **Neue Karten:** Elterngeld (Höhe nach § 2 BEEG mit Ersatzrate, 300 bis 1.800 €, ElterngeldPlus), Hilfe zur Pflege (Einkommensgrenze § 85 SGB XII), Blindenhilfe (§ 72 SGB XII, ergänzend zum Landesblindengeld) und Asylbewerberleistungen. Wer im Asylverfahren ist oder eine Duldung hat, bekommt kein Grundsicherungsgeld, keine Grundsicherung im Alter, kein Wohngeld und keinen Kinderzuschlag mehr angezeigt.
- **Veraltete Regeln:** Ab dem 1.1.2027 zeigt die App einen deutlichen Hinweis, bis sie aktualisiert ist.

## Neue Tests 11. November 2026

- **Gleiche Zahlen in allen Sprachen** (`test/test-sprachen-zahlen.js`): Jede Zahl und jeder Paragraf jeder Übersetzung muss wie im Deutschen stehen. So bleibt nach einer Wertänderung kein alter Betrag in einer Übersetzung stehen. Ausgeschriebene Zahlen („sechs Monate“) sind als Ausnahme eingetragen, die wieder anschlägt, sobald sich die deutsche Zahl ändert.
- **Jahreswechsel mit ganzen Seiten:** 4 Haushalte in allen 8 Sprachen am 31.12.2026 und am 1.1.2027 (75 statt 9 Prüfungen). Dazu der Logik-Test mit Datum 2027.
- **Kleine Handys und große Schrift** (`test/e2e-klein.js`): 320 px breit, 8 Sprachen, normal, große Schrift der App und Systemschrift 200 %. Der Test fand 28 Darstellungsfehler, alle behoben: Regeltabelle zu breit, seitliches Scrollen bei großer Schrift, zu breite Auswahlfelder, nicht umbrechende lange Wörter, abgeschnittener Knopf „Ergebnis ansehen“.
- **Echte Bedienung im Android-Emulator** (Android 10 und neuer, getestet mit 11 und 15): Fragebogen ausfüllen, alle Karten, Antragsmappe erzeugen, PDF über den Teilen-Dialog des Systems; Update über eine ältere Version, die Angaben bleiben erhalten. Auf Android 8 werden Start, Absturzfreiheit und Update geprüft (das Emulator-Abbild hat eine zu alte WebView für das Testwerkzeug; echte Geräte aktualisieren sie über den Play Store).
- **Dabei gefunden und behoben:** Die Android-App fragte eine nicht vorhandene Datei an (Seitensymbol, Fehler 404 im Protokoll).
- **Version 96** (App-Datei 95) enthält alle Korrekturen dieses Tages.
- **Nicht umgesetzt:** Abgleich mit den amtlichen Rechnern (Netzfreigabe nötig, siehe ABGLEICH.md) und ein automatischer Wächter für Gesetzesänderungen (automatische Abrufe über GitHub sind bewusst abgeschaltet).

## Änderungen 2027 (Stand 13. November 2026)

**Beschlossen und in der App:** Minijob-Grenze 633 € und Kinderkrankentage 10 / 20 je Kind (die App schaltet am 1.1.2027 selbst um); antragsloses Kindergeld ab 2027 (Bundesrat 25.9.2026) als Hinweis auf der Kindergeld-Karte.

**Nur geplant, deshalb nicht eingerechnet, aber als deutlich markierter Hinweis auf der Karte („Geplant ab 2027 … noch nicht beschlossen“ bzw. „noch nicht endgültig beschlossen“). Stand 19.11.2026:**

| Wert | Stand 19.11.2026 (Quelle) | Was die App rechnet | Hinweis auf der Karte |
|---|---|---|---|
| Regelsätze gleich bis 30.6.2028, Anpassung künftig zum 1. Juli | Haushaltsbegleitgesetz 2027 (BT-Drs. 21/7860), vom Haushaltsausschuss am 16.11.2026 gebilligt; Bundestag und Bundesrat offen (hib 947/2026, bundestag.de, 16.11.2026) | 563 € usw. | Grundsicherungsgeld, Grundsicherung im Alter |
| Sofortzuschlag im Kinderzuschlag (25 €) bleibt | Streichung aus dem Haushaltsbegleitgesetz 2027 herausgenommen (hib 947/2026, 16.11.2026); noch nicht endgültig beschlossen | 297 € | Kinderzuschlag |
| Sofortzuschlag nach dem AsylbLG endet Ende 2026 (Übergang für Bewilligtes bis höchstens Ende Mai 2027) | dasselbe Gesetz, Haushaltsausschuss 16.11.2026 (hib 947/2026) | – (die App rechnet bei Asylbewerberleistungen keine Beträge und nennt keinen Sofortzuschlag) | – |
| Wohngeld: Kürzung (BT-Drs. 21/8284) entfällt, Dynamisierung zum 1.1.2027 ausgesetzt | Koalitionseinigung 11.11.2026 laut Berichten; amtliche Fassung (Beschluss) steht aus – unsicher | Werte 2026 | Wohngeld, dazu bis Jahresende „früh beantragen“ |
| Unterhaltsvorschuss bis 16 statt 18 | vom Tisch (Haushaltsausschuss November 2026); neuer BMFSFJ-Entwurf mit Einkommensgrenze, frühestens 2029 – nur Info, kein amtlicher Entwurf veröffentlicht | bis 18 | Unterhaltsvorschuss |
| Kindergeld 267 € | Einkommensteuerreformgesetz 2027 (BT-Drs. 21/8235), weiter nur Entwurf | 259 € | Kindergeld |
| Grundfreibetrag 12.564 € | dasselbe Gesetz (BT-Drs. 21/8235), Entwurf | 12.348 € | Kindergeld für erwachsene Kinder mit Behinderung |
| Mindestunterhalt / Unterhaltsvorschuss-Beträge 2027 | Verordnung fehlt noch. Achtung: Steigt das Kindergeld auf 267 € ohne neue Mindestunterhaltsverordnung, sinkt der Unterhaltsvorschuss auf 219 / 291 / 386 € (volles Kindergeld wird abgezogen, § 2 Abs. 2 UVG) | 227 / 299 / 394 € | – |
| Pflegegeld 380 / 630 / 890 / 1.080 € | Pflegeneuordnungsgesetz (BT-Drs. 21/8869), 1. Lesung 5.11.2026 (bundestag.de Textarchiv kw45) | 347 / 599 / 800 / 990 € | Pflegegeld (ab Pflegegrad 2) |
| Pflege: Überbrückungsbudget 2.285 € statt Verhinderungs- und Kurzzeitpflege (gemeinsamer Jahresbetrag 3.539 €) | dasselbe Gesetz, Entwurf | 3.539 € (Recht 2026) | – (nicht gesondert, Hinweis „Budget“ im Pflegegeld-Text) |
| Pflege: Entlastungsbetrag entfällt bei Pflegegrad 1, sonst Sozialraumbudget 175 € (unter 25 Jahren 300 €) | dasselbe Gesetz, Entwurf | 131 € (Recht 2026) | Pflegegeld: „Entlastungsbetrag soll in ein neues Budget umgebaut werden“ (nur ab Pflegegrad 2) |
| Pflege: Sachleistungs-Budget statt fester Sachleistungsbeträge | dasselbe Gesetz, Entwurf | Sachleistungen 2026 | – |
| Kinderlosenzuschlag Pflegeversicherung 0,9 % statt 0,6 % | dasselbe Gesetz, Entwurf | – (Beiträge nur im Netto-Rechner; dort 0,6 %, Recht 2026) | – |
| Beitragsbemessungsgrenze KV 6.375 € / Versicherungspflichtgrenze 7.012,50 € im Monat | Sozialversicherungs-Rechengrößenverordnung 2027 (BR-Drs. 576/26), Kabinett 7.10.2026, Bundesrat offen | 5.812,50 € (Krankengeld höchstens 135,63 € je Tag) | Krankengeld bei Lohn über 5.812,50 € |
| Beitragsbemessungsgrenze RV 8.850 €, Bezugsgröße 4.130 € im Monat | dieselbe Verordnung (BR-Drs. 576/26), Bundesrat offen | Netto-Rechner schaltet ab 1.1.2027 schon auf BBG RV 8.850 € / KV 6.375 € um (`R.lohn.bbg2027`); Familienversicherung nutzt Bezugsgröße 4.130 € (`famvers.bezug2027`) – offener Punkt, siehe unten | – |

Ab dem 1.1.2027 zeigt die App zusätzlich ihren Hinweis, dass die Regeln geprüft werden müssen. Am 1. Dezember 2026 ist die nächste Prüfung eingeplant; was dann beschlossen ist, wird eingerechnet. Dabei zu prüfen: Beschluss von Bundestag und Bundesrat zum Haushaltsbegleitgesetz 2027 (Regelsätze, Kinderzuschlag, Wohngeld), Bundesrat zur Rechengrößenverordnung (BR-Drs. 576/26), Stand Pflegeneuordnungsgesetz (BT-Drs. 21/8869) und Einkommensteuerreformgesetz 2027 (BT-Drs. 21/8235), Mindestunterhaltsverordnung 2027. Offener Punkt: Der Netto-Rechner und die Familienversicherung rechnen ab 1.1.2027 schon mit den Rechengrößen 2027, obwohl der Bundesrat noch nicht zugestimmt hat; nach der Bundesratssitzung bestätigen oder zurücknehmen. Werte, die nur aus Berichten stammen (Wohngeld-Einigung vom 11.11.2026, neuer Unterhaltsvorschuss-Entwurf), erst nach amtlicher Veröffentlichung übernehmen.

## Nachtarbeit 10./11. November 2026

- **Werte 2027 mit automatischem Umschalten:** Ab dem 1.1.2027 rechnet die App mit der Minijob-Grenze 633 € (Mindestlohn 14,60 € × 130 / 3, § 8 Abs. 1a SGB IV) und mit den regulären Kinderkrankentagen (10 je Kind und Elternteil, 20 für Alleinerziehende, höchstens 25 / 50, § 45 Abs. 2 SGB V). Die Sonderregel 15 / 30 (35 / 70) gilt nur bis 31.12.2026. Der Hinweis „Regeln veraltet“ nennt diese Werte ab 2027 als schon angepasst.
- **Neue Karte Mutterschaftsgeld:** 13 € je Tag von der Krankenkasse plus Arbeitgeberzuschuss bis zum Nettolohn; privat oder familienversichert höchstens 210 € einmalig vom Bundesamt für Soziale Sicherung; bei Arbeitslosengeld in Höhe des Arbeitslosengeldes; Schutzfristen 6 Wochen vor, 8 (12) Wochen nach der Geburt (§ 19 MuSchG, § 24i SGB V).
- **Neue Karte Kinderkrankengeld:** 90 % des ausgefallenen Nettos, höchstens 135,63 € je Tag (70 % der Beitragsbemessungsgrenze 2026), Tage wie oben (§ 45 SGB V).
- **Bildung und Teilhabe:** Hinweis, dass die Kita bei Grundsicherungsgeld, Wohngeld oder Kinderzuschlag beitragsfrei ist (§ 90 Abs. 4 SGB VIII).
- **Geräte-Tests auf GitHub:** Die echte APK wird im Android-Emulator (Android 8, 11 und 15) installiert, gestartet und auf Abstürze und JavaScript-Fehler geprüft; die iOS-App wird für den Simulator gebaut.
- **Mutationstest:** 39 absichtlich eingebaute Fehler, alle entdeckt. Der zuerst nicht entdeckte Fehler (Kita-Hinweis auch ohne kleine Kinder) hat einen neuen Test bekommen.
- **Noch offen für 2027:** Die Beitragsbemessungsgrenze der Krankenversicherung 2027 (6.375 € im Monat) ist vom Kabinett beschlossen, aber noch nicht vom Bundesrat. Sie ändert nur den Höchstbetrag beim Kranken- und Kinderkrankengeld für hohe Einkommen (2027 dann 148,75 € je Tag). Nach der Verkündung eintragen. Ebenso prüfen, ob der Bundestag die 15 Kinderkrankentage doch verlängert.

## Absicherung gegen fehlende Regeln

Früher prüften die Tests nur, ob die App ihre eigenen Regeln richtig rechnet. Eine Regel, die ganz fehlte, fiel keinem Test auf. Deshalb gibt es jetzt vier Sicherungen, die bei jedem `npm test` laufen:

1. **Prüfliste vom Gesetz her mit Wächter-Test** (`test/test-pruefliste.js`): Jede der 28 Karten braucht einen Abschnitt in `docs/PRUEFLISTE.md`, jede Regel mit ✓ oder ◐ eine Testmarke, und zu jeder Marke muss es einen Test geben. Ein ✗ oder eine Regel ohne Test lässt `npm test` scheitern. Der Wächter selbst wurde mit 8 absichtlich eingebauten Lücken geprüft und hat alle erkannt.
2. **Kartenliste an einer Stelle** (`test/karten.js`): Die Tests leiten die Zahl der Karten daraus ab und prüfen sie gegen die Regel-Engine. Keine festen Zahlen mehr im Testcode.
3. **Unabhängige Referenzrechnung** auch für Elterngeld (jeder Euro von 0 bis 3.000 €), Hilfe zur Pflege, Blindenhilfe und die Ausschlüsse bei Asyl.
4. **Mutationstest** (`npm run test:mutation`): 30 typische Fehler (falscher Prozentsatz, fehlender Freibetrag, fehlender Ausschluss) werden absichtlich eingebaut. Die Tests finden jeden davon.

Bei der Durchsicht vom Gesetz her gefunden und behoben:
- **Wohngeld:** Elterngeld bis 300 € wurde zwar abgezogen, vorher aber mit Pauschalabzug als Einkommen gezählt; dadurch rechnete die App mit zu wenig Einkommen. Jetzt zählt nur der Teil über 300 € (§ 10 Abs. 1 BEEG).
- **Elterngeld:** Die Ersatzrate ändert sich jetzt wie im Gesetz in Schritten je volle 2 € (§ 2 Abs. 2 BEEG), nicht stufenlos.
- **Rundfunkbeitrag:** Befreiung bei Asylbewerberleistungen ergänzt.
- **Arbeitslosengeld I:** Hinweise auf Sperrzeit (§ 159 SGB III) und Nebeneinkommen (§ 155 SGB III) ergänzt.
- **Kindergeld:** Hinweis auf arbeitslose Kinder bis 21, Freiwilligendienst, Übergangszeit und 20-Stunden-Grenze ergänzt.
- 14 Karten hatten noch keinen Abschnitt in der Prüfliste (zum Beispiel Kindergeld, Arbeitslosengeld I, Rundfunkbeitrag). Alle sind ergänzt.

Weitere Tests (laufen ebenfalls bei jedem `npm test`):
- **Eigenschaftstest** (`test/test-eigenschaften.js`, 15.000 Zufallshaushalte): Mehr Einkommen bringt nie mehr Grundsicherungsgeld, Grundsicherung, Wohngeld oder Kinderzuschlag; ein Kind mehr erhöht immer den Bedarf; mehr Miete senkt nie Bedarf oder Wohngeld; mehr Vermögen verbessert nie eine Einstufung; ein höherer GdB oder Pflegegrad bringt nie weniger. Dazu Widerspruchsfreiheit zwischen den Karten (z. B. Grundsicherungsgeld wahrscheinlich, dann auch Bildung und Teilhabe; kein Betrag bei „unwahrscheinlich“). Mit 6 eingebauten Fehlern geprüft, alle erkannt.
- **Ausfüllhilfe** (`test/test-formulare.js`, `test/app-test.js`): Auswahl der amtlichen Formulare in Musterfällen; jede Zuordnung zeigt auf ein vorhandenes Feld mit richtigem Typ; Formulare werden gefüllt und zurückgelesen (191 Felder, Ja/Nein am sichtbaren Knopf geprüft); geschützte Vordrucke bleiben unverändert; in der App werden die Dateien geteilt und danach gelöscht. Neue Formularstände: `python3 tools/formulare-pruefen.py` erzeugt den Katalog neu, der Test zeigt jede Abweichung.
- **Jahreswechsel** (`test/test-jahreswechsel.js`): am 31.12.2026 kein Hinweis, ab 1.1.2027 deutlicher Hinweis auf veraltete Regeln, App läuft weiter; Rentenalter verschiebt sich mit dem Datum.
- **Datenschutz**: Die Web-Version ruft während der ganzen Nutzung keinen Server auf (geprüft im Browser). Dabei gefunden: Sie lud bisher Schriften von Google Fonts (IP-Adresse an Google, vgl. LG München I, Urteil vom 20.1.2022). Behoben: Die Web-Version nutzt jetzt die Schriften des Geräts, die App bringt ihre Schriften als Dateien mit.
- **Sicherheit** (`test/test-sicherheit.js`): Schadcode in Name, Anschrift, Telefon und in manipulierten gespeicherten Angaben (auch der einfachen Version) wird nie als HTML oder Skript ausgeführt. Gegenprobe: Ohne die Maskierung schlägt der Test sofort an.
- **Leichte Sprache**: In der einfachen Version keine Sätze über 15 Wörter, lange Wörter mit Bindestrich gegliedert (z. B. „Eingliederungs-Hilfe“).
- **Musterfälle** für den Abgleich mit den amtlichen Rechnern: `docs/Musterfaelle-Abgleich.csv` mit Anleitung `docs/ABGLEICH.md`.

**Durchsicht aller Zahlenwerte (8. November 2026):** Alle Werte in `src/rules.js` einzeln gegen die Rechtslage 2026 geprüft (Regelbedarfe, Kindergeld 259 €, Kinderzuschlag 297 €, Unterhaltsvorschuss, Minijob-Grenze 603 €, Beitragsbemessungsgrenzen 8.450 € / 5.812,50 €, Pflegeleistungen, Pauschbeträge, Grundfreibetrag 12.348 €, Schonvermögen, Elterngeld). Zwei unsichere Werte wurden per Websuche geklärt (mehrere übereinstimmende Quellen): Die BAföG-Elternfreibeträge 2.540 / 1.690 / 770 € stimmen, der Kinderzuschlag behält die Vermögensgrenze 40.000 € + 15.000 € je weitere Person. **Dabei gefunden und behoben:** Die Altersstufen beim Schonvermögen (Grundsicherungsgeld) und beim BAföG-Vermögen galten ein Jahr zu spät. Richtig ist nach dem Wortlaut („bis zur Vollendung des 30. Lebensjahres“) die höhere Stufe ab dem 30., 40. und 50. Geburtstag; BAföG 45.000 € ab dem 30. Geburtstag. Die BAföG-Altersgrenze 45 wird jetzt genau aus dem Geburtsjahr bestimmt. Die Quellen sind teils widersprüchlich bei den Altersgrenzen; die App folgt dem gesetzlichen Wortlaut, eine Fachperson sollte das bestätigen. Die amtlichen Rechner und Gesetzesseiten lassen sich von hier aus nicht automatisch abfragen; dafür gibt es die Musterfälle.

**Ganz Deutschland (Phase 1 und 2, 10. November 2026):** Landesblindengeld und Wohnberechtigungsschein gelten jetzt in allen Ländern (sichere Einstufung, Spanne statt unsicherer Einzelbeträge), zuständige Stellen je Land ohne Anschrift. Neu: Bayerisches Landespflegegeld (500 € im Jahr ab 2026, vorher 1.000 €), Hinweis auf Familiengeld und Krippengeld (nur noch für Kinder bis Geburtsjahr 2024), Merkzeichen Gl mit Hinweis auf das Gehörlosengeld einiger Länder. Genaue Beträge anderer Länder fehlen bewusst, weil die Quellen sich widersprechen (Prüfliste ○).

**Mietenstufen für ganz Deutschland (Phase 3a):** Jede Postleitzahl bekommt jetzt Kreis und Mietenstufe aus der Anlage zur Wohngeldverordnung, nicht mehr nur in Bayern. Nicht eindeutige Orte (etwa 7 % außerhalb Bayerns) bleiben ohne Stufe, dann fragt die App nach und rechnet vorsichtig. Eine unabhängig geschriebene Gegenprüfung hat alle 13.386 zugeordneten Einträge mit der Verordnung verglichen: 0 Abweichungen. Dabei gefunden und behoben: Landkreis und gleichnamige kreisfreie Stadt (Leipzig) wurden zunächst verwechselt.

**Stellen außerhalb Bayerns (Phase 3b):** Für alle 79 kreisfreien Städte außerhalb Bayerns (ohne Berlin und Hamburg) nennt die App die Stadt mit ihrer offiziellen Website (Wikidata, CC0) bei Wohngeld, Grundsicherung, Unterhaltsvorschuss, Bildung und Teilhabe und Asyl; bei Landkreisen nur für die Grundsicherung im Alter, weil Wohngeld und Jugendamt dort teils bei den Gemeinden liegen. Postanschriften außerhalb Bayerns fehlen noch (Wikidata führt sie nur für 10 von 304 Kreisen).

Was keine Sicherung leisten kann: Die Prüfliste ist nur so vollständig wie das Wissen, mit dem sie geschrieben ist. Eine Fachperson sollte sie vor der Veröffentlichung einmal gegenlesen. Die Punkte mit ○ (zum Beispiel Freibetrag für Azubis über der Minijob-Grenze, Höhe der Blindenhilfe, Zuständigkeit Bezirk) sind dafür markiert.

## Fachlich: bekannte Grenzen (bewusst so gelöst)

- **Wohnkosten:** Angemessene Kosten nach örtlicher Richtlinie kennt die App nicht. Sie rechnet mit der tatsächlichen Miete. Bei den Eltern ohne Mietvertrag und im Wohnheim zeigt sie „mindestens“ bzw. „möglich“.
- **Mittagessen in der Werkstatt (§ 42b Abs. 2 SGB XII):** wird nicht als Zahl gerechnet, sondern verbreitert den Bereich „möglich“.
- **Wohnheim in Bayern:** Für die Grundsicherung zeigt die App den Bezirk als zuständige Stelle (Leistungen aus einer Hand). Bitte fachlich bestätigen lassen.
- **Kinderzuschlag:** Der Wohnkostenanteil der Eltern ist eine Näherung an den Existenzminimumbericht.
- **Wohngeld:** Die Grenze „Einkommen eher zu niedrig“ folgt seit 21.11.2026 der Plausibilitätsprüfung Nr. 15.01 WoGVwV (BMI-Hinweise 11.03.2020): Einnahmen plus geschätztes Wohngeld müssen die Miete und 80 % der Regelbedarfe decken. Sie führt nur zu „möglich“, nie zu einer Absage.
- **Elterngeld Plus:** Für die Hälfte des Freibetrags (150 €) gibt es keine eigene Auswahl.
- **Grundrentenfreibetrag beim Wohngeld (§ 17a WoGG):** in der App (Haken „33 Jahre Grundrentenzeiten“) und seit 21.11.2026 auch im Bescheid-Check eingerechnet.

Ergänzend zeigt `docs/PRUEFLISTE.md` vom Gesetz her für jede Regel, ob die App sie kennt, auch die noch fehlenden.

## Technisch

- **Sicherheit:** Alle Texte aus Eingaben werden vor dem Einfügen ins HTML maskiert (`esc`). Briefe und Angabenblatt stehen nur in `<pre>`/`textarea`. Die App hat eine strenge Content-Security-Policy (`connect-src 'self'`, kein Fremdcode).
- **Datenschutz:** Kein Netzwerkzugriff, keine Konten, keine Analyse. Daten liegen nur auf dem Gerät (Capacitor Preferences bzw. localStorage). Android-Backup ist aus (`allowBackup="false"`). Es gibt keine Kamera-Berechtigung, die App nutzt die System-Kamera.
- **Android:** targetSdk 36, minSdk 24. Debug-APK mit festem Test-Schlüssel, Release mit eigenem Upload-Schlüssel (Play App Signing).
- **Abhängigkeiten:** `npm audit`: 0 bekannte Schwachstellen (App und Werkzeuge).
- **Tests:**
  - Regeln: 6 Testdateien mit rund 680 Einzelprüfungen.
  - Unabhängige Referenzrechnung über rund 144.000 Haushalte, davon vollständige Raster für Werkstatt-Beschäftigte und alle Einkommensgrenzen.
  - Mutationstests zeigen, dass der Test absichtlich eingebaute Fehler findet.
  - Browser: ausführliche Version, einfache Version (49 Prüfungen) und App mit nachgeahmten Plugins.
  - Barrierefreiheit: axe-core, WCAG 2.1 AA, hell und dunkel.
- **Wartbarkeit:** `src/app.js` ist groß (rund 1.400 Zeilen). Eine Aufteilung in Module (Formular, Ergebnis, Mappe, einfache Version, Scan) wäre der nächste Schritt, sobald weitere Funktionen dazukommen.

## Amtliche Rechenbeispiele der Bundesagentur (14.11.2026)

`test/test-ba-beispiele.js` prüft 34 Werte aus den Fachlichen Weisungen §§ 11-11b SGB II (Stand 24.10.2024) und den
Durchführungsanweisungen Kinderzuschlag (DA-KiZ, Stand 20.02.2026): Erwerbstätigenfreibetrag (Beispiele 1.450 €, 250 €, 1.600 €,
alle Stufengrenzen), Wohnanteil der Eltern (ganze Tabelle, Beispiele 800 € und Familie R.), Anrechnung des Kindesunterhalts mit 45 %.
Fund: Der Wohnanteil war bisher eine Näherung (Alleinerziehende bis 1 Prozentpunkt daneben), jetzt exakt die amtliche Tabelle.

Bekannte, bewusst vorsichtige Abweichung: Beim Grundsicherungsgeld lässt SoLo Elterngeld bis 300 € nur frei, wenn das Elterngeld
über 300 € liegt. Das Gesetz (§ 10 Abs. 5 BEEG) lässt auch beim Mindestbetrag so viel frei, wie vor der Geburt verdient wurde
(FW-Beispiel: 250 € frei). SoLo zählt hier also eher zu viel Einkommen und nennt eher zu wenig Grundsicherungsgeld, nie zu viel.

## Abgleich Runde 2 mit amtlichen Rechenbeispielen (21.11.2026)

84 weitere Fälle (Merkblätter, Broschüren, Weisungen, zwei Urteile, Gesetzestexte); 6 Befunde behoben, jede Korrektur am amtlichen Text geprüft (Abruf 21.11.2026). Feste Tests: `test/test-musterbescheide-2.js`; Mutationen für Nr. 10, 12, 14 in `tools/mutationstest.js`.

| Nr. | Korrektur | Quelle |
|---|---|---|
| 10 | BAföG Elterneinkommen: Anrechnung 50 % (plus 5 % je Kind mit Freibetrag) des Betrags über dem Freibetrag; „eher nicht“ erst über dem höchsten Bedarf 1.088 € | § 25 Abs. 4, §§ 13, 13a BAföG; bafög.de |
| 11 | BAföG Vermögen: nur der Betrag über 15.000 / 45.000 €, geteilt durch 12 Monate | §§ 29, 30 BAföG; bafög.de Beispiel „Stefan“ |
| 12 | Blindengeld Bayern Pflegegrad 3 bis 5: einheitlich 33 % des Pflegegeldes von Pflegegrad 3 (197,67 €) | Art. 4 Abs. 1 Satz 2 BayBlindG; ZBFS-Infoblatt 7/2026 |
| 13 | Arbeitslosengeld/Krankengeld: obere Grenze mindestens Netto Steuerklasse III (beim Arbeitslosengeld 20 % Pauschale + Lohnsteuer) | § 153 SGB III; Merkblatt 1 Abschnitt 4; § 47 SGB V |
| 14 | Grundrentenfreibetrag Grundsicherung aus der Bruttorente, App und Bescheid-Check | § 82a Abs. 1 SGB XII; BT-Drs. 19/27495 S. 16 f.; DRV „Die Grundsicherung“ 5/2026 S. 18 |
| 15 | Einkommensgrenze Hilfe zur Pflege/Blindenhilfe: Familienzuschlag aufgerundet (395 €). Unterkunft bleibt mit Heizung (siehe Prüfvermerk) | § 85 Abs. 1 Nr. 2 und 3 SGB XII; BSG 30.04.2020, B 8 SO 1/19 R |
| H3 | Landespflegegeld: Auszahlung in der Regel bis 31. Januar des Folgejahres im Antragshinweis | Art. 2 Abs. 4 Satz 2, Art. 3 Abs. 1 BayLPflGG |

Nicht umgesetzt (im Bericht gelassen): H1 (Unterhaltsvorschuss 12/13 Jahre in der internen Schätzung), H2 (Arbeitnehmer-Pauschbetrag beim WBS, Landesrecht je Land), H4 (Frage nach Geschwisterkind unter 3).

## Prüfvermerk (21.11.2026)

Unabhängige Prüfung von PR #99 (Abgleich 2, Befunde 10 bis 15 und H3). Alle Paragrafen und Zahlen neu am amtlichen Text abgerufen (21.11.2026). Korrekturen sind eingebaut und mit Tests belegt (`test/test-musterbescheide-2.js`).

| Befund | Schwere | Korrektur | Quelle (Abruf 21.11.2026) |
|---|---|---|---|
| Nr. 15 war in einem Teil falsch: Die Einkommensgrenze wurde auf „Unterkunft ohne Heizung“ umgestellt (Beleg nur ein Infoblatt aus Berlin). Das Bundessozialgericht sagt das Gegenteil: Heizkosten gehören dazu. Folge wäre gewesen: Grenze bis über 100 € zu niedrig, Text „über der Grenze“ statt „unter der Grenze“. | mittel | Zurückgenommen: wieder die ganze Warmmiete (App, Referenz, Tests, Prüfliste). Geblieben ist der aufgerundete Familienzuschlag 395 €. Hinweis in der Prüfliste, dass manche Träger ohne Heizung rechnen. | BSG 30.04.2020, B 8 SO 1/19 R, Leitsatz (bsg.bund.de); § 85 Abs. 1 Nr. 2 und 3 SGB XII (gesetze-im-internet.de, Heizung dort nicht genannt) |
| H3: „Das Geld kommt spätestens bis zum 31. Januar“ war eine feste Zusage. Der Antrag ist aber noch bis 3 Monate nach Jahresende möglich; dann kann das Geld später kommen. | niedrig | „in der Regel bis zum 31. Januar“ in 13 Sprachen und in Einfacher Sprache; Test ergänzt. | Art. 2 Abs. 4 Satz 2 und Art. 3 Abs. 1 Satz 1 BayLPflGG, Fassung ab 01.01.2026 (gesetze-bayern.de) |
| Nr. 14: Die Bruttorente war nur mit dem Beispiel der Rentenversicherung belegt. Dort greift der Deckel 281,50 €, es beweist Brutto also nicht. | niedrig (nur Beleg) | Regel stimmt, Beleg ergänzt. | § 82a Abs. 1 SGB XII; Antwort der Bundesregierung BT-Drs. 19/27495 S. 16 f. (dserver.bundestag.de); Meldung der Rentenversicherung vom 03.03.2023 |
| Nr. 13, Referenz: `test/referenz.js` holt die Lohnsteuer Steuerklasse III jetzt aus `src/rules.js`. An dieser Stelle ist die Referenz nicht mehr unabhängig (im Code vermerkt; die Lohnsteuer prüft `test/test-netto.js`). | niedrig | Fester Anker ergänzt, der nicht an der Lohnsteuer hängt: 2.400 € brutto ergibt genau 960 bis 1.290 € (ohne Kind oben 1.150 €), Pauschale 20 %. | § 153 Abs. 1 SGB III (gesetze-im-internet.de) |
| Krankengeld-Test nannte betanet als Quelle (nicht amtlich). | niedrig | Als Rechnung zu Fuß nach dem Gesetz bezeichnet (Test und Prüfliste). | § 47 Abs. 1 SGB V |
| Nr. 10, 11 (BAföG), Nr. 12 (Blindengeld), Nr. 13 (20 % Pauschale), Nr. 15 (Aufrundung), Landespflegegeld 500 € | ohne Befund | keine | § 25 Abs. 1, 3, 4, § 13 Abs. 1 und 2, § 13a Abs. 1 und 2, §§ 29, 30 BAföG; Art. 4 Abs. 1 und 4 BayBlindG; § 37 Abs. 1 SGB XI (347 / 599 / 800 / 990 €); § 153 SGB III; Art. 2 BayLPflGG |

Geänderte Testerwartungen geprüft: Alle Änderungen folgen den Korrekturen (keine Erwartung nur „passend gemacht“). Keine Werte ab 1.1.2027 vorgezogen. Keine Änderung an Speicherung, Farben oder Startkacheln.

Offen (bewusst nicht geändert):
- ~~BAföG: Beträge unter 10 € im Monat werden nicht gezahlt (§ 51 Abs. 4 BAföG).~~ Erledigt 21.11.2026 (Branch claude/b-rest-19): Grenze jetzt Bedarf − 9,50 € (§ 51 Abs. 3 Rundung, Abs. 4).
- ~~BAföG Vermögen: 2.300 € Freibetrag je Ehegatte und Kind (§ 29 Abs. 1 Nr. 2 und 3) fehlte.~~ Erledigt 21.11.2026 (Branch claude/b-rest-19), dazu Kinderbetreuungszuschlag 160 € je Kind beim Bedarf (§ 14b); Ehe und eigene Kinder werden nicht abgefragt -> vorsichtig mitgerechnet.
- Arbeitslosengeld und Krankengeld: Die obere Grenze mit Steuerklasse III gilt auch für Alleinstehende, die diese Klasse fast nie haben. Die Spanne ist dort oben zu weit; die Mitte liegt aber näher am echten Wert als vorher.
- Landespflegegeld: Die Antragsfrist steht jetzt klar im Gesetz (3 Monate nach Ende des Pflegegeldjahres, Art. 3 Abs. 1 Satz 1). Der Text sagt weiter „es gibt eine Frist; welche, sagt dir das Landesamt“. Kann man in einem eigenen Auftrag konkret nennen.
- Die Broschüre der Rentenversicherung (S. 18) war am 21.11.2026 nicht im Volltext abrufbar (nur Stand 01.05.2026, 20. Auflage bestätigt).

## Großer und schwerer Abgleich mit amtlichen Rechnern (14.11.2026)

Auf GitHub automatisch abgefragt, Ergebnisse als feste Testfälle in `test/amtlich-gross-*.json` (geprüft von `test/test-amtlich.js`):

| Rechner | Fälle | Ergebnis |
|---|---|---|
| Wohngeldrechner BMWSB | 7.000 Haushalte (3.000 einfach, 3.000 schwer: bis 8 Personen, Heizkosten, Renten-Paare, Alleinerziehende; 1.000 genau an SoLos Einstufungsgrenzen) | 6.776 auf 10 € gleich, 0 abweichend; 224 knapp an der Grenze „möglich“ ohne Betrag, amtlich 0 € (vorsichtig, nie fälschlich „eher nicht“) |
| KiZ-Lotse Familienkasse | 3.800 Familien (Partner-Einkommen, Unterhalt, Kinder 5/6/7 und 13/14 Jahre, bis 6 Kinder, Grenzfälle) | 0 Widersprüche |
| Elterngeldrechner Familienportal | 1.000 Einkommen (30 % mit Geschwisterbonus) | alle auf den Cent gleich |

Gefundene und behobene Fehler: Kind von 6 Jahren (Mehrbedarf Alleinerziehende 36 % bis unter 7), Wohnanteil der Eltern beim Kinderzuschlag (amtliche Tabelle statt Näherung).
Einschränkung des KiZ-Lotsen: Er berücksichtigt Einkommen der Kinder nicht (2.000 € Unterhalt oder Lohn ohne Wirkung). SoLo rechnet es nach § 6a Abs. 3 BKGG zu 45 % an (DA-KiZ-Beispiele in `test/test-ba-beispiele.js`); im Abgleich wird dafür ohne Unterhalt verglichen. Mit Unterhalt wären es 122 Fälle, in denen SoLo gesetzeskonform vorsichtiger ist als der Lotse.
Statistisch (Dreierregel, 95 %): Fehlerrate beim Wohngeldbetrag unter 0,05 %, beim Elterngeld unter 0,3 %, falsches Ja/Nein beim Kinderzuschlag unter 0,08 %.

**Abgleich mit Musterbescheiden und amtlichen Rechenbeispielen (21. November 2026):** 43 Fälle aus veröffentlichten Bescheiden und Beispielrechnungen (Familienkasse, Bundesagentur, Städte Frankfurt, Hannover, München, Bochum, Bundesbau- und Familienministerium). Kein schwerer Fehler. 9 Befunde behoben: Wohngeld-Mindesteinkommen zählt das Wohngeld mit (Nr. 15.01 WoGVwV); Vermögen bei Paaren je Person (§ 12 Abs. 2 SGB II); Grundrentenfreibetrag im Bescheid-Check (§ 17a WoGG); Kinderzuschlag mit geschätztem Wohngeld und erweitertem Zugang (§ 6a Abs. 1a BKGG), Vermögen knapp über der Grenze (§ 6a Abs. 3 BKGG), Altersrentner mit Kopfteil (DA-KiZ D.2); Wohngeld über 12 Personen (§ 19 Abs. 3 WoGG); Einkommensgrenze bei 10 € Wohngeld (§ 21 Nr. 1 WoGG); Hinweis Merkzeichen G bei Paaren (§ 30 Abs. 1 SGB XII). Feste Tests: `test/test-musterbescheide.js`.

## Prüfvermerk (21.11.2026)

Unabhängige Inhaltsprüfung von PR #96 (Korrekturen nach dem Abgleich mit Musterbescheiden). Alle Fundstellen am 21.11.2026 selbst abgerufen. Es gilt das Recht 2026; nichts aus dem Entwurf für 2027 (BR-Drs. 474/26, BT-Drs. 21/8284, Inkrafttreten laut Entwurf 1.1.2027) ist vorweggenommen.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Wohngeld-Mindesteinkommen zählt das Wohngeld mit; 100 % Miete und 80 % Regelbedarf, ohne Mehrbedarfe; nur „möglich“, nie Absage | stimmt | Quelle ergänzt: Die amtlich veröffentlichte Vorschrift nennt „Einnahmen zuzüglich Wohngeld“ und 80 % des Bedarfs. Die genauere Rechnung (100 % Miete, 80 % Regelbedarf) steht nur in den BMI-Hinweisen vom 11.03.2020. Diese sind nicht amtlich veröffentlicht (nur Kopie). Die App nimmt die strengere Lesart, also die vorsichtige Seite. Test mit dem BMI-Beispiel ergänzt | WoGVwV 28.06.2017 Nr. 15.01 Abs. 1, https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_28062017_SWII4.htm |
| Grenze bei 10 € Wohngeld (ungerundet 9,50 €) | stimmt | keine | § 21 Nr. 1 WoGG, Anlage 3 Nr. 3 WoGG, https://www.gesetze-im-internet.de/wogg/__21.html, https://www.gesetze-im-internet.de/wogg/anlage_3.html |
| 65 € je weitere Person ab der 13., höchstens bis zur Miete; Rechnung mit den Werten für 12 Personen | stimmt | keine | § 19 Abs. 3 WoGG, https://www.gesetze-im-internet.de/wogg/__19.html; WoGVwV Nr. 19.31 |
| Grundrentenfreibetrag im Bescheid-Check: Bei einer Rente unter 100 € war der Freibetrag höher als die Rente (100 €). Das Gesetz zieht ihn „vom Einkommen aus der gesetzlichen Rente“ ab | niedrig | Freibetrag höchstens so hoch wie die Rente, im Bescheid-Check und in der App; 2 Tests | § 17a Abs. 1 Satz 2 WoGG, https://www.gesetze-im-internet.de/wogg/__17a.html |
| Vermögen bei Paaren: Freibetrag je Person nach eigenem Alter, nicht ausgeschöpfte Beträge werden übertragen; über der kleinsten möglichen Summe nur „möglich“ mit Hinweis | stimmt | keine | § 12 Abs. 2 SGB II, https://www.gesetze-im-internet.de/sgb_2/__12.html |
| Kinderzuschlag: geschätztes (fiktives) Wohngeld und erweiterter Zugang (höchstens 100 € fehlen, Freibeträge aus Arbeit mindestens 100 €) | stimmt | keine; beides führt nur zu „möglich“ | § 6a Abs. 1 Satz 2 und 3, Abs. 1a BKGG, https://www.gesetze-im-internet.de/bkgg_1996/__6a.html; DA-KiZ 20.02.2026 C.4.1 Abs. 7, C.4.2 |
| Kinderzuschlag: Vermögen knapp über der Grenze mindert nur den ersten Monat | stimmt | keine | § 6a Abs. 3 Satz 6 und 7, Abs. 6 Satz 5 BKGG; DA-KiZ C.2.2.2.3 |
| Kinderzuschlag, alleinerziehend mit Altersrente: Rente zählt nur über dem eigenen Bedarf mit Kopfteil der Miete, der Rest mindert voll | stimmt | keine | DA-KiZ 20.02.2026 D.2 Abs. 1 Satz 9 bis 11, Beispiel 2, https://www.arbeitsagentur.de/datei/fw-bkgg_ba023130.pdf |
| Geänderte alte Testerwartung: Altersrentner 1.450 € Rente (1.300 € ausgezahlt), Miete 800 €, Kind 16 mit Unterhaltsvorschuss → „eher nicht“ | stimmt | Von Hand nachgerechnet: 1.300 − 30 − (563 + 67,56 + 400) = 239,44 € mindern voll, bleiben 57,56 €; 45 % von 394 € Unterhaltsvorschuss sind 177,30 €, also 0 €. Ohne Unterhaltsvorschuss „möglich“, 60 €. Beide Fälle als feste Tests | DA-KiZ D.2; § 6a Abs. 3 Satz 3, Abs. 6 Satz 4 BKGG |
| Merkzeichen G bei Paaren: Hinweis, 17 % der Regelbedarfsstufe je Person | stimmt | keine | § 30 Abs. 1 SGB XII, https://www.gesetze-im-internet.de/sgb_12/__30.html |
| Neue Hinweise in 13 Sprachen und Einfacher Sprache | stimmt | keine; sinngleich, Platzhalter {betrag} überall vorhanden | Durchsicht |
| Sicherheit und Datenschutz | ohne Befund | keine; keine neue Speicherung, keine neue Ausgabe von Eingaben, neue Auswahl im Bescheid-Check als fester Text | Durchsicht des Diffs |

Offen (nicht in diesem PR gelöst):
- Mehr als 12 Personen und für 12 Personen gerechnetes Wohngeld unter 10 €: Die App zeigt dann kein Wohngeld. Ob der Zuschlag von 65 € trotzdem greift, sagt das Gesetz nicht eindeutig. Sehr seltener Fall.
- Grundsicherungsgeld ohne Altersangabe: Die App rechnet mit 10.000 € je Erwachsenem und sagt darüber „eher nicht“. Bei Personen ab 40 liegt die Grenze höher. Das war schon vor diesem PR so.
- Hinweis „danach gibt es ihn voll“ (Kinderzuschlag, Vermögen knapp): gemeint ist „ohne Kürzung wegen Vermögen“, nicht der Höchstbetrag.
- Wenn das Wohngeld-Gesetz für 2027 verkündet ist: Formel, Heizkostenkomponente und die Grenze bei 10 € neu prüfen.

## Prüfvermerk (21.11.2026)

Unabhängige Prüfung von PR #104 (Branch claude/b-rest-19, nur eigener Anteil gegenüber claude/b-buendel-1): BAföG in `src/rules.js`, gemeinsames Krypto-Modul `src/krypto.js`, Cache-Aufräumen in `src/klient.js`. Alle Paragraphen am 21.11.2026 selbst bei gesetze-im-internet.de abgerufen (BAföG, zuletzt geändert durch Art. 11 Abs. 1 G v. 16.4.2026, BGBl. 2026 I Nr. 107).

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Vermögen: 2.300 € frei für Ehegatte oder Lebenspartner und für jedes Kind, zusätzlich zu 15.000 € (unter 30) oder 45.000 € | stimmt | keine | § 29 Abs. 1 Nr. 1 bis 3 BAföG, https://www.gesetze-im-internet.de/baf_g/__29.html |
| Kinderbetreuungszuschlag 160 € im Monat je eigenem Kind unter 14 im Haushalt erhöht den Bedarf | stimmt | keine; App kennt Alter und Elternschaft nicht und rechnet für jedes Kind (Seite „möglich“) | § 14b Abs. 1 BAföG, https://www.gesetze-im-internet.de/baf_g/__14b.html |
| Keine Zahlung unter 10 € im Monat; Rundung ab 0,50 € nach oben. „Eher nicht“ erst bei Rest unter 9,50 € | stimmt | keine; von Hand nachgerechnet: 1.088 − 9,50 = 1.078,50 €; Grenzen 4.697 € (Paar, 1 Kind), 5.706,67 € (2 Kinder), 27.942 € Vermögen | § 51 Abs. 3 und 4 BAföG, https://www.gesetze-im-internet.de/baf_g/__51.html; § 30 BAföG, https://www.gesetze-im-internet.de/baf_g/__30.html |
| Geänderte Testgrenzen (test-strict, test-musterbescheide-2, test-unterhalt-selbst, test.js) | stimmt | keine; folgen der Korrektur, 4 neue Mutationen im Mutationstest | Nachrechnung |
| Krypto-Modul: PBKDF2-SHA-256 mit 600.000 Durchläufen, Salz 16 Byte, IV 12 Byte, AES-GCM 256, AAD (Kopf) bei der Weitergabe, Schlüssel nicht exportierbar | ohne Befund | keine. Gegenprobe mit dem alten Code (claude/b-buendel-1): alt verschlüsselt, neu gelesen und umgekehrt, für App-PIN und SoLo-Kode. Fehlversuchszähler und Wartezeit unverändert (nach 5 Fehlversuchen 30 Sekunden, richtige PIN in der Wartezeit abgelehnt) | Durchsicht des Diffs, `test/test-krypto.js`, eigene Gegenprobe |
| Reihenfolge im Build: `krypto.js` steht vor Weitergabe und Vorgängen | ohne Befund | keine | `scripts/build.js`, `src/template.html` |
| Cache-Aufräumen: CSV-Dateien aus Haushaltsbuch, Belegen und Schulden-Liste (Geld-Daten) blieben nach einem Abbruch beim Teilen liegen | mittel | Muster ergänzt: nur genau `Haushaltsbuch-JJJJ-MM-TT.csv`, `Schulden-JJJJ-MM-TT.csv`, `Belege-JJJJ.csv`; 2 neue Prüfungen in `test/test-cache-reste.js` | `src/haushalt.js`, `src/schulden.js` |
| Cache-Aufräumen löscht nur im App-eigenen Cache (oberste Ebene, keine Ordner, keine Pfade): dort schreibt nur die App, Nutzer legen dort nichts ab | ohne Befund | keine | `src/klient.js`, `src/app.js`, `PdfAusgabePlugin.java` |

Offen (nicht in diesem PR gelöst):
- Hinweis „Freibetrag von …“ (bafoeg.vermTeil): Bei Paaren und Kindern nennt die App den Freibetrag mit 2.300 € je Person als festen Wert. Er gilt nur bei Ehe oder Lebenspartnerschaft und für eigene Kinder. Ohne diese liegt der echte Freibetrag tiefer und die Kürzung höher. Das Ergebnis bleibt „möglich“. Ein Zusatz im Text (13 Sprachen, Einfache Sprache) wäre ein eigener Auftrag.
- Fotos der Kamera (Brief prüfen) löscht die App direkt nach dem Lesen. Bleibt eines nach einem Abbruch liegen, räumt der Start es nicht auf (Name kommt vom Kamera-Plugin, nicht geprüft).

## Prüfvermerk (21.11.2026) – PR #105 „Richtigkeit“ (Branch `claude/b-richtigkeit-fix`)

Unabhängige Inhaltsprüfung der Korrekturen zu den Befunden 1 bis 8 der Prüfung Richtigkeit. Alle Quellen am 21.11.2026 abgerufen.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Sachsen-Anhalt, Eingliederungshilfe: Als Stelle (und Empfänger im Anschreiben) stand das Landesamt (LAS). Das LAS ist Träger, den Antrag nimmt aber das Sozialamt vor Ort an. | mittel | `ZUST_LAND.eingl.ST`: „Sozialamt deines Landkreises oder deiner kreisfreien Stadt (Träger: LAS)“; Test `zust-land`, Prüfliste angepasst | las.sachsen-anhalt.de/themen/hilfe-fuer-menschen-mit-behinderung („Sprechen Sie dazu bitte mit Ihrem Sozialamt vor Ort“) |
| Hinweis „nichts pfändbar“ (`ra.unpf`): „Biete keine Rate an“ nannte nur Miete und Strom als Ausnahme. Bei einer Geldstrafe droht ohne Ratenabsprache Ersatzfreiheitsstrafe. | mittel | Satz ergänzt (13 Sprachen und Einfache Sprache): Das gilt auch für eine Geldstrafe, Raten bei der Staatsanwaltschaft erfragen; Test `rate-pf` | § 43 StGB, § 459a StPO (gesetze-im-internet.de, Abruf 20.11.2026 laut Prüfliste) |
| „Übernehmen“ setzte 0 € ins Ratenschreiben, wenn der gewählte Gläubiger laut Aufteilung erst „später“ dran ist. | mittel | Dann wird nichts eingesetzt, es erscheint der Hinweis auf den Vorrang; Test `rate-dom` | Code `src/geld.js` |
| Ratenschreiben: Vorbehalt war mit „Soweit ich die Forderung noch nicht prüfen konnte oder sie bestreite“ eingeschränkt. Das lässt den Umkehrschluss zu, der Rest sei anerkannt. | gering | Jetzt: „ohne Anerkennung einer Rechtspflicht. Es ist kein Anerkenntnis der Forderung, insbesondere nicht von Zinsen und Kosten.“ Hinweis `ra.warn` bleibt, weil der Vorbehalt im Einzelfall nicht sicher trägt (vor allem, wenn dann gezahlt wird). | § 212 Abs. 1 Nr. 1 BGB (gesetze-im-internet.de) |
| Antragsmappe: Zeile „nur entweder oder“ konnte so gelesen werden, dass man nur einen Antrag stellen soll. Der Tipp darüber rät zu beiden Anträgen. | gering | Satz ergänzt (13 Sprachen und Einfache Sprache): „Beantragen kannst du trotzdem beides.“ Test `zwei-wege` | § 7 Abs. 1 Satz 1 und 3 WoGG, § 12a Satz 1 und 2 Nr. 2 SGB II (gesetze-im-internet.de) |

Geprüft und in Ordnung:

| Thema | Ergebnis | Quelle |
|---|---|---|
| Pfändungswerte in `Rules.pfaendung` (1.587,40 €, 597,42 €, 332,83 €, Höchstbetrag 4.866,30 €, gültig 1.7.2026 bis 30.6.2027) | stimmen | Pfändungsfreigrenzenbekanntmachung 2026, BGBl. 2026 I Nr. 80 (recht.bund.de); § 850c ZPO |
| Ratenvorschlag erst mit Einnahmen, Miete und Essen; Obergrenze pfändbarer Betrag; Aufteilung nach Stufen | passt zum Code und zu den Texten; bleibt Faustregel ohne Rechtsaussage. Grob: Einnahmen des Plans gelten als Arbeitseinkommen, Unterhaltsgläubiger können mehr pfänden (§ 850d ZPO). | § 850c ZPO |
| Rundfunkbeitrag: Befreiung rückwirkend, höchstens 3 Jahre vor dem Antragsmonat | stimmt | § 4 Abs. 4 Satz 2 RBStV (gesetze-bayern.de, Dokument RBeitrStV-4) |
| Unterhalt beim Wohngeld: ohne Titel bis 3.000 € bzw. 6.000 € im Jahr, mit Titel, Notarvertrag oder Bescheid der festgelegte Betrag | stimmt | § 18 Satz 1 und 2 WoGG |
| Einfache Sprache Miete: mehr als eine Monatsmiete, Nachzahlung bis 2 Monate nach der Räumungsklage, einmal in 2 Jahren | stimmt | § 543 Abs. 2 Satz 1 Nr. 3, § 569 Abs. 3 Nr. 1 und 2 BGB |
| Einfache Sprache Strom: 2 Abschläge und 100 €, 4 Wochen, 8 Werktage | stimmt | § 41f Abs. 1, 3 und 5 EnWG |
| Sachsen-Anhalt: LAS seit 1.4.2026 für Ausweis und Blindengeld | stimmt | las.sachsen-anhalt.de (Startseite, /schwerbehindertenrecht, Blinden- und Gehörlosengeld mit Antragsformularen) |
| Zwei Wege: Wohngeld und Grundsicherungsgeld bzw. Grundsicherung im Alter schließen sich aus; beide Anträge zugleich sind zulässig | stimmt | § 7 Abs. 1 WoGG, § 12a SGB II |
| Anschriften aus Wikipedia werden nicht mehr gezeigt | stimmt (Code `src/behoerden.js`, Test `beh-de`) | Projektregel |
| Übersetzungen (Stichprobe en, tr, ar, uk) | sinngleich; Zahlen und Paragrafen in allen Sprachen gleich (`test-sprachen-zahlen`) | |

Offen: Die neuen Sätze in ar, fa, fa-AF, ps, so sind nicht von Muttersprachlern gelesen. Ob der Vorbehalt im Ratenschreiben im Einzelfall trägt, entscheidet ein Gericht; die App sagt das nicht zu.

## Prüfvermerk (21.11.2026) – PR #110 Wohngeld: Lohn der Kinder

Unabhängige Prüfung. Gesetzestexte am 21.11.2026 direkt abgerufen (gesetze-im-internet.de).

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Freibetrag § 17 Nr. 4 WoGG: Einnahmen aus Erwerbstätigkeit jedes Kindes eines Haushaltsmitglieds, höchstens 1.200 € im Jahr, Kind ist Haushaltsmitglied und unter 25. Keine Ausbildungs-Voraussetzung, kein Mindestalter. Umsetzung „je Kind“ stimmt | in Ordnung | keine | https://www.gesetze-im-internet.de/wogg/__17.html |
| Arbeitnehmer-Pauschbetrag 1.230 € im Jahr (102,50 € im Monat), höchstens bis zur Höhe der Einnahmen; gilt beim Wohngeld über § 14 Abs. 1 WoGG (Einkünfte nach § 2 EStG; Minijob „abzüglich der Aufwendungen“). Stand 2026, nichts für 2027 vorweggenommen | in Ordnung | keine | https://www.gesetze-im-internet.de/estg/__9a.html, https://www.gesetze-im-internet.de/wogg/__14.html |
| Ausbildungsvergütung über der Minijob-Grenze: Die App fragt die Auszahlung ab. Das Wohngeld rechnet vom Brutto (minus Pauschbetrag, dann je 10 % nach § 16 WoGG). Mit vollem Pauschbetrag auf die Auszahlung war die Schätzung „wahrscheinlich“ um etwa 25–35 € Einkommen zu günstig (rund 10 € Wohngeld) | mittel | Vorsichtige Schätzung über der Minijob-Grenze ohne Pauschbetrag (`src/rules.js`, `test/referenz.js`, neue Mutation). Obere Schätzung unverändert | § 16 WoGG, https://www.gesetze-im-internet.de/wogg/__16.html (nicht neu abgerufen: Rechenweg wie im vorhandenen Code) |
| Test `wg-kindeink`: Text „100 € frei“ passte nicht zur neuen Regel, Grenze 202,50 € ungeprüft | gering | Text berichtigt, Prüfung mit 202 € ergänzt | – |
| Differenzlauf Startwert 2611 (400 Haushalte, GitHub-Lauf 44902358680) mit dem korrigierten Stand nachgerechnet: 379 auf den Euro gleich, 21 innerhalb der Grenze (Zahl verdienender Kinder unbekannt), 0 Abweichungen | in Ordnung | keine | Artefakt `amtlich-wohngeld` |
| Der amtliche Rechner zieht den Freibetrag nicht über das Einkommen des Kindes hinaus ab (Fälle mit 90–150 € Kinderlohn stimmen auf den Euro). SoLo rechnet genauso | in Ordnung | keine | Differenzlauf |
| `erweiterungen/bescheid-wg.js`: Pauschbetrag gilt dort schon je Mitglied mit Lohn; Freibetrag für Kinder steht weiter unter „Nicht geprüft“. Kein Widerspruch | in Ordnung | keine | – |
| Offen: Bestätigungslauf Startwert 2612 (GitHub-Lauf 44905512224) lief bei der Prüfung noch. Der Differenztest enthält nur Minijobs bis 600 €, keine Ausbildungsvergütung mit Abzügen | offen | Ergebnis abwarten | – |

## Prüfvermerk (21.11.2026) – PR #110 Nachprüfung: Freibetrag der Kinder und Unterhalt

Unabhängige Nachprüfung der Commits nach 60551af. Gesetzestexte am 21.11.2026 direkt abgerufen (gesetze-im-internet.de).

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Freibetrag § 17 Nr. 4 WoGG mindert auch den Unterhalt desselben Kindes: Der Wortlaut trägt das. Die Freibeträge werden von der Summe der Jahreseinkommen abgezogen (§ 13 Abs. 1), nicht nur vom Lohn. Der Freibetrag bemisst sich an den „Einnahmen“ (vor Pauschbetrag), höchstens 1.200 € im Jahr. Bei 110 € Lohn bleiben 7,50 € Einkünfte, 100 € Freibetrag: 92,50 € mindern den Unterhalt (amtlicher Rechner, Lauf 2612 Nr. 96: 487 €) | in Ordnung | keine | https://www.gesetze-im-internet.de/wogg/__13.html, https://www.gesetze-im-internet.de/wogg/__17.html, https://www.gesetze-im-internet.de/wogg/__14.html |
| Deckel „höchstens bis zum übrigen Einkommen der Kinder“: steht so nicht im Gesetz (§ 13 Abs. 1 kennt keine Grenze je Mitglied). SoLo folgt hier dem amtlichen Rechner (Fälle ohne Unterhalt stimmen nur mit Deckel auf den Euro). Der Deckel ist die vorsichtigere Lesart, also keine zu hohe Zusage | gering, offen | keine; Rechtsfrage bleibt als Hinweis stehen | § 13 Abs. 1, § 17 Nr. 4 WoGG; Differenzlauf 2611 |
| Schätzlogik: vorsichtig = ein verdienendes Kind, Freibetrag nur gegen den Lohn (nie gegen Unterhalt); obere Schätzung = Lohn gleichmäßig auf alle Kinder ab 6 und jungen Erwachsenen. Die Funktion je Kind ist konvex, die gleichmäßige Verteilung ist deshalb wirklich der günstigste Fall. Obere Schätzung nie über der vorsichtigen, führt nur zu „möglich“ | in Ordnung | keine | Nachrechnung |
| Obere Schätzung rechnet den Deckel gegen den Unterhalt aller Kinder zusammen (auch Kinder unter 6) und über der Minijob-Grenze mit der Auszahlung statt dem Brutto. Beides nur günstigster Fall, kein „wahrscheinlich“ | gering | keine | – |
| Mutationstest: `test-amtlich-wohngeld.js` lief im Mutationstest gar nicht mit. Für die neue Regel (Unterhalt-Ausgleich, Deckel, Freibetrag höchstens die Einnahmen) gab es keine Mutation | mittel | Test in die Liste aufgenommen, 3 Mutationen ergänzt (alle entdeckt, einzeln geprüft) | `tools/mutationstest.js` |
| `docs/PRUEFLISTE.md` nannte noch 12 Fälle und nichts zum Unterhalt; Testkopf ohne Nr. 96 | gering | berichtigt (13 Fälle, Unterhalt-Regel) | – |
| Nr. 96 ist der einzige amtliche Fall mit Lohn unter 202,50 € und Unterhalt. Kein amtlicher Fall mit zwei Kindern und Unterhalt, keiner mit Waisenrente | offen | weitere Fälle im nächsten Differenzlauf | – |


## Prüfvermerk (24.11.2026) – Commit c1d71bab „Kind in der Werkstatt“ (Branch `claude/fix-ggeld-werkstatt`)

Unabhängige Prüfung. Quellen am 24.11.2026 abgerufen: gesetze-im-internet.de (§§ 5, 7, 8, 19, 23 SGB II; §§ 41, 43, 45, 94 SGB XII; § 21 WoGG), Fachliche Weisungen der BA zu § 19 SGB II (https://www.arbeitsagentur.de/datei/fw-sgb-ii-19_ba015859.pdf, Stand der Fassung 01.01.2023, Rz. 19.2 bis 19.4). § 4 RBeitrStV (gesetze-bayern.de) war am 24.11.2026 nicht abrufbar (Zugriff nicht freigegeben); Stand dafür: `docs/quellen/wbs-rundfunk.md` (Abruf 05.11.2026).

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Kern des Commits (Elternteil bleibt beim Jobcenter, wenn nur das Kind in der Werkstatt ist; Kind ab 18 höchstens „möglich“ ohne Betrag; Kind unter 18 normal gerechnet) ist richtig | – | keine | § 7 Abs. 1 Satz 1, Abs. 3 Nr. 4, § 5 Abs. 2 Satz 2, § 19 Abs. 1 Satz 2, § 23 SGB II; § 41 Abs. 3, § 45 Satz 3 Nr. 3 SGB XII |
| Text `ggeld.kindGsa` sagte „bekommt eigene Grundsicherung“ (Zusage; hängt von Einkommen und Vermögen des Kindes ab), nannte die Werkstatt nicht und erklärte nicht, warum kein Betrag steht | mittel | Text neu in Deutsch, Einfacher Sprache und 13 Sprachen: „kann … bekommen“, Sozialamt rechnet nur das Kind, Jobcenter die Eltern meist ohne das Kind, darum kein Betrag | § 19 Abs. 1 Satz 2 SGB II („soweit“); FW BA § 19 Rz. 19.4 |
| Bedarfszeile blieb stehen: Betrag mit dem Kind, dazu „Einkommen knapp darunter oder darüber“, auch bei 300 € Einkommen | mittel | Bedarfszeile entfällt im Kind-Fall wie der Betrag | wie oben |
| Bekommt das Kind schon Grundsicherung vom Sozialamt (Haken „Grundsicherung oder Sozialhilfe vom Sozialamt“), sagte die Karte dem Elternteil weiter „nein“ | hoch | Im Kind-Fall kein „nein“, sondern „möglich“ mit Hinweis | § 7 Abs. 1 Satz 1, § 5 Abs. 2 Satz 2 SGB II |
| Grundsicherung bei Erwerbsminderung, Kind unter 18 in der Werkstatt: „wahrscheinlich“ mit Betrag, obwohl es die Leistung erst ab 18 gibt (bestand schon vorher) | hoch | „nein“ (Voraussetzung fehlt) | § 41 Abs. 3 SGB XII |
| Grundsicherung bei Erwerbsminderung, Kind ab 18 in der Werkstatt: Betrag und „nein“ aus Bedarf, Einkommen und Vermögen des ganzen Haushalts (bestand schon vorher) | hoch | „möglich“ ohne Betrag mit Hinweisen `ggeld.kindGsa` und `gsa.eltern`; kein „nein“ wegen Einkommen oder Vermögen der Eltern | § 43 Abs. 1, 5, § 94 Abs. 1a SGB XII |
| Wohngeld-Hinweis bei zu niedrigem Einkommen (`schonGS`) verglich im Kind-Fall mit dem Schonvermögen des Sozialamts; Karte Wohngeld „Grundsicherung eher nicht“, Karte Grundsicherungsgeld „möglich“ | niedrig | `h.emEltern` statt `h.erwerbsgemindert`; betrifft nur die Textwahl, nicht die Prüfung „erhebliches Vermögen“ | § 12 Abs. 2 SGB II; § 21 Nr. 3 WoGG |
| Kommentar nannte für die 100.000-€-Grenze der Eltern nur § 43 Abs. 5 SGB XII | niedrig | Kommentar berichtigt | § 43 Abs. 5, § 94 Abs. 1a SGB XII |
| Geänderte Testerwartungen des Commits (Referenz, `rundfunk` hängt von `bhPerson` ab, Ankertexte der Mutationen) sind Folge der Rechtslage, keine Abschwächung | – | Referenz und Tabelle um die Korrekturen oben ergänzt (`gsa` hängt jetzt auch von `bhPerson` ab) | § 4 Abs. 1 Nr. 2, 3 RBeitrStV (Stand 05.11.2026) |

Offen: (1) Wohngeld und Kinderzuschlag sagen weiter „nein“, wenn der Haken „Grundsicherung vom Sozialamt“ nur die Leistung des Kindes meint; ausgeschlossen ist dann nur das Kind (§ 7 Abs. 1 WoGG). (2) Rundfunkbeitrag zeigt in diesem Fall „bekommst du“; die Befreiung des Kindes erstreckt sich nicht ohne Weiteres auf die Eltern (§ 4 Abs. 3 RBeitrStV). (3) Kind in der Werkstatt, dessen Behinderung erst nach dem 25. Geburtstag eintrat, wird laut Eingabehinweis als „erwachsene Person“ erfasst; die App hält dann den Elternteil für voll erwerbsgemindert. (4) Text `gsa.voraus` passt beim Kind unter 18 nicht genau („Beides hast du nicht angegeben“). (5) Die 13 Übersetzungen des neuen Textes sind nicht von Muttersprachlern geprüft.

## Prüfvermerk (24.11.2026, zweite unabhängige Prüfung) – Branch `claude/fix-ggeld-werkstatt` (c1d71bab, 327be74a)

Frisch geprüft, ohne die Erstprüfung zu übernehmen. Am 24.11.2026 direkt abgerufen (gesetze-im-internet.de): § 5 Abs. 2, § 7 Abs. 1, 3 Nr. 4, § 19 Abs. 1, § 23 SGB II (Fassung „Grundsicherungsgeld“); § 41 Abs. 1, 3, 3a, § 43 Abs. 1, 5, § 45 Satz 3, § 94 Abs. 1a SGB XII; § 21 WoGG. § 4 RBeitrStV (gesetze-bayern.de) war nicht abrufbar (Zugriff nicht freigegeben, nicht umgangen); Stand dafür weiter `docs/quellen/wbs-rundfunk.md` (05.11.2026). Vergleichslauf gegen `origin/main`: je 20.000 zufällige Haushalte ohne Angabe zur Behinderung, mit „erwachsene Person“ und mit Kind ohne Werkstatt-Haken: alle Ergebnisse (Stufe, Texte, Beträge) identisch.

| Befund | Schwere | Korrektur | Quelle |
|---|---|---|---|
| Einfache Version („Arbeitest du?“ – Werkstatt, „Behinderung seit der Kindheit“ – ja, Lohnfrage mit „Weiß nicht“ übersprungen oder nur Rente): Die Person in der Werkstatt wurde für einen Elternteil gehalten. Grundsicherungsgeld „möglich“ mit dem Text über „ein erwachsenes Kind“ statt „nein, Sozialamt zuständig“; in eigener Wohnung Grundsicherung ohne Betrag. Neu durch diesen Branch (auf `main` richtig) | hoch | Angabe `wfbmSelbst` aus der einfachen Version; `emEltern` (Regeln) und `emElternteil` (Referenz) beachten sie. 10.368 Kombinationen der einfachen Version wieder identisch zu `main`; neuer Test Nr. 11 in `test/test-kind-werkstatt.js` | § 7 Abs. 1 Satz 1 Nr. 2, § 8 SGB II; § 41 Abs. 3, § 45 Satz 3 Nr. 3 SGB XII |
| Erwartungen in Referenz und Abhängigkeitstabelle (Elternteil bleibt beim Jobcenter; Kind ab 18 „möglich“ ohne Betrag; Kind unter 18 keine Grundsicherung nach dem SGB XII; Eltern-Einkommen zählt beim Kind nicht) stimmen unabhängig vom Code mit dem Gesetz überein | – | keine | § 7 Abs. 1 Satz 1, Abs. 3 Nr. 4, § 5 Abs. 2 Satz 2, § 19 Abs. 1 Satz 2, § 23 SGB II; § 41 Abs. 3, § 43 Abs. 1, 5, § 94 Abs. 1a SGB XII |
| Keine neue Zusage gefunden: Im Kind-Fall gibt es nur „möglich“ ohne Betrag. „Wahrscheinlich“ mit Betrag entsteht neu nur beim Kind unter 18 (Grundsicherungsgeld für die ganze Bedarfsgemeinschaft), das ist richtig. Ein „nein“ wegen Einkommen bleibt richtig, weil der Bedarf ohne das Kind kleiner wäre | – | keine | § 19 Abs. 1 Satz 2, § 23 SGB II |
| § 21 WoGG: Die Textwahl `schonGS` ist nicht die Missbrauchsprüfung nach Nr. 3; nur der Vergleichswert im Hinweis ändert sich | – | keine | § 21 Nr. 3 WoGG |

Offen (zusätzlich zur Liste oben): (6) Ausführliche Version, eine erwachsene Person allein ohne Kinder wählt „Kind ab 18“ und den Werkstatt-Haken: Die App kann nicht unterscheiden, ob ein Elternteil mit Kind ab 25 oder die Person selbst gemeint ist; sie zeigt dann „möglich“ mit Hinweis (vorsichtig, keine Zusage). (7) Text `gsa.eltern` sagt „erst ab 100.000 €“, das Gesetz „mehr als 100 000 Euro“ und „bekommt“ statt „kann bekommen“ (bestand vorher). (8) § 4 RBeitrStV weiter nicht direkt abgerufen. (9) Hat das Kind eigenes hohes Einkommen (zum Beispiel Rente nach 20 Jahren Werkstatt), das im Haushaltseinkommen steht, kann „nein“ beim Grundsicherungsgeld für die Eltern zu streng sein.
