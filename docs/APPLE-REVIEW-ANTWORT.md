# Antwort an Apple App Review (zum Kopieren)

Den Text zwischen den Linien in App Store Connect einfügen:
App → Version → Abschnitt „App-Review-Informationen“ → Feld „Notizen“. Höchstens 4.000 Zeichen (dieser Text hat etwa 3.300).

---

1. SCREEN RECORDING
A screen recording from a physical iPhone (latest iOS) is attached to our reply in App Review. It starts with launching the app and shows the typical flow: questionnaire, results, application folder (PDF share, print, save to Files) and the optional photo scan. The app has no account, no login, no user-generated content and no in-app purchases.

2. PURPOSE AND TARGET AUDIENCE
SoLo – Sozialleistungslotse ("social benefits guide") helps people in Germany find out which state benefits they may be entitled to (e.g. housing benefit, child benefit, child supplement, basic income support, parental allowance, benefits for people with disabilities). Many eligible people never apply because the rules are complex. The user answers simple questions about household, income and rent; the app shows which benefits are likely, possible or unlikely, with an estimated amount, the responsible office and the documents needed. It can create an application folder (cover letters and a data sheet) as a PDF.
Target audience: residents of Germany, including low-income families, single parents, pensioners, people with disabilities and their caregivers. 8 languages (German, English, Turkish, Arabic, Ukrainian, Russian, Polish, Romanian) and an easy-language mode.

3. HOW TO USE / ACCESS
No login, no setup, no sample files needed. Open the app, tap one of the example households under "Beispiel laden" (e.g. "Alleinerziehend, 2 Kinder") or answer the questions; results update immediately below. Tap "Antragsmappe erstellen" to create the application folder, then "Als PDF teilen" (share sheet with Print / Save to Files). The optional photo scan of a paper form uses the camera or photo library; text recognition runs on the device (Apple Vision).

4. EXTERNAL SERVICES
None. The app works completely offline. All calculations run on the device. No server, no analytics, no tracking, no ads, no AI services, no payment processor (paid upfront via the App Store, no in-app purchases). Links to official government websites (forms, information) open in the browser only when the user taps them.

5. REGIONAL DIFFERENCES
The app functions identically in all regions. Its content concerns German social law, so it is useful for people living in Germany. Within Germany it uses the postal code to apply the correct state-specific rules and responsible offices.

6. REGULATED AREA / THIRD-PARTY MATERIAL
The app provides general information and estimates, not legal advice; this is stated in the app ("no legal advice, the authority decides"). All rules and amounts are taken from public sources: German federal and state laws, official tables and the public instructions of the Federal Employment Agency. The included forms are official public forms of German authorities, which are not protected by copyright in Germany (§ 5 German Copyright Act, official works); protected forms are not included, the app only links to the official download page. Calculations were checked against the official online calculators of the German government (11,800 test cases). The seller on the App Store is the account holder, Natascha Cabrerizo y Polo (individual). She is named as the provider in the app's imprint on iOS and as the controller in the iOS privacy policy (https://dcabrerizo-lab.github.io/Claud/datenschutz-ios.html). David Cabrerizo (same address) is the technical contact.

---

## Was Apple verlangt hat und wo es erledigt wird

| Apple-Punkt | Erledigt durch |
|---|---|
| 1. Bildschirmvideo vom echten iPhone, beginnt mit App-Start | dein Video, Schritt 6 |
| 2. Zweck und Zielgruppe | Notizen, Abschnitt 2 |
| 3. Bedienung, Zugangsdaten, Beispieldateien | Notizen, Abschnitt 3 (kein Login nötig) |
| 4. Externe Dienste | Notizen, Abschnitt 4 (keine) |
| 5. Regionale Unterschiede | Notizen, Abschnitt 5 |
| 6. Regulierter Bereich, fremdes Material | Notizen, Abschnitt 6 |
| Guideline 2.1 Fehler/Abstürze | Build 137, auf echtem Gerät per TestFlight geprüft (Schritt 1) |
| Guideline 2.1 Zugang | „Anmeldung erforderlich“ aus (Schritt 5) |
| Guideline 2.3.3 Bildschirmfotos | echte App-Bildschirme aus `store-bilder/ios-6.9` und `ios-6.5` (Schritt 4) |
| Guideline 3.1.1 In-App-Käufe | keine; Preis 1,49 € einmalig (Schritt 3) |
| Guideline 3.2 andere Geschäftsmodelle | nicht betroffen (öffentliche App für alle) |
| Name Verkäufer ≠ Anbieter | Build 137 + Datenschutz-iOS + Copyright (Schritte 2, 4, 7) |

## Schritt für Schritt (App Store Connect am PC, Konto von Natascha)

**1. Build 137 auf dem iPhone testen**
- TestFlight-App öffnen → SoLo → Build 137 installieren → einmal durchtippen.
- Impressum (unten „Impressum, Datenschutz, Lizenzen“): Anbieter muss „Natascha Cabrerizo y Polo“ sein.

**2. Datenschutz**
- Links „App-Datenschutz“ → bei „Datenschutzrichtlinie“ auf „Bearbeiten“ →
  `https://dcabrerizo-lab.github.io/Claud/datenschutz-ios.html` → „Sichern“.
- Datenerfassung: „Nein, wir erfassen keine Daten“ → falls geändert „Veröffentlichen“.
- Vorher die Adresse im Browser öffnen und prüfen, dass „Verantwortlich: Natascha Cabrerizo y Polo“ dasteht.

**3. Preis**
- Links „Preise und Verfügbarkeit“ → 1,49 € (bzw. die passende Preisstufe) → Verfügbarkeit: Deutschland (oder alle Länder) → „Sichern“.
- „Business“ (Startseite) → Vertrag „Kostenpflichtige Apps“ muss „Aktiv“ sein, sonst Bank und Steuer ergänzen.

**4. Version 1.2.0: Texte und Bilder**
- Links unter „iOS-App“ auf „1.2.0“.
- Bildschirmfotos: 6,9-Zoll-Fotos aus `SoLo-iOS/…/store-bilder/ios-6.9` (oder aus dem Projekt `store-bilder/ios-6.9`), 6,5 Zoll aus `ios-6.5`.
- Beschreibung, Stichwörter, Werbetext aus `Store-Texte.md` (ohne Kalender/Fristen).
- Support-URL: `https://dcabrerizo-lab.github.io/Claud/`
- Copyright: `2026 Natascha Cabrerizo y Polo`

**5. App-Review-Informationen (gleiche Seite, weiter unten)**
- „Anmeldung erforderlich“: Häkchen entfernen.
- Kontakt: Natascha (oder David als technischer Kontakt), Telefon, E-Mail.
- „Notizen“: den englischen Text oben (zwischen den ersten beiden Linien) einfügen.

**6. Video**
- „Anhang“ in den App-Review-Informationen: Video hochladen.
- Klappt das nicht: in Schritt 9 an die Antwort anhängen (App „App Store Connect“ auf dem iPhone).

**7. Build**
- Abschnitt „Build“: alten Build (134/135/136) mit dem Minus entfernen → „+“ → **137** → „Fertig“.
- Exportkonformität: „Keine / nur Standardverschlüsselung“.

**8. Altersfreigabe** (falls noch offen)
- „Altersfreigabe“ → alle Fragen „Keine“ → ergibt 4+.

**9. Antworten und einreichen**
- Oben „Sichern“.
- Meldung „App Review“ öffnen → „Antworten“ → Video anhängen (falls nicht in Schritt 6) →
  „Thank you. The requested information has been added to the App Review notes, and the screen recording is attached. The seller (account holder) is now named as the provider in the app's imprint and in the privacy policy (build 137).“ → „Senden“.
- Version 1.2.0 → „Zur Prüfung hinzufügen“ / „Zur Prüfung einreichen“.
