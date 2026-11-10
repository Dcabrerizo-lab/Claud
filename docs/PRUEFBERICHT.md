# Prüfbericht (Stand 8. November 2026)

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
- **Wohngeld:** Die Grenze „Einkommen eher zu niedrig“ (80 % des Bedarfs) ist eine Faustregel ohne Rechtsgrundlage und als solche gekennzeichnet.
- **Elterngeld Plus:** Für die Hälfte des Freibetrags (150 €) gibt es keine eigene Auswahl.
- **Grundrentenfreibetrag beim Wohngeld (§ 17a WoGG):** ist nicht eingerechnet. Das Wohngeld kann dadurch etwas höher sein.

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
