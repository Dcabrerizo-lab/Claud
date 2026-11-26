# Variante „SoLo Pflege & Rente“

Eigene App für Menschen in Rente, dauerhaft Erwerbsgeminderte und pflegende Angehörige, aus demselben Code wie SoLo
(Entscheidung David 24.11.2026). Name: **SoLo Pflege & Rente**, unter dem Symbol auf dem Handy **SoLo Pflege**.

## Kennungen

| | SoLo | SoLo Pflege & Rente |
|---|---|---|
| Web-Datei | `dist/sozialleistungslotse.html` | `dist/solo-pflege.html` |
| Android Paket-ID (Store) | `com.Sozialleistungslotse` | `com.Sozialleistungslotse.pflege` |
| Android Test-App | `com.Sozialleistungslotse.test` („SoLo Test“) | `com.Sozialleistungslotse.pflege.test` („SoLo Pflege Test“) |
| iOS Bundle-ID | `com.Sozialleistungslotse` | `com.Sozialleistungslotse.pflege` |
| Symbol | Petrol, Sprechblase mit Haken | Pflege-Blau, Sprechblase mit Haken und Herz (`tools/mkicon-pflege.js`) |

Name, Kurzname und App-ID stehen in `VARIANTEN` in `scripts/build.js`. Die nativen Dateien (unten) wiederholen sie;
`test/test-variante-nativ.js` prüft, dass alles zusammenpasst und SoLo unverändert bleibt.

## Bauen (nur auf Davids Anweisung)

**Web:** `VARIANTE=pflege node scripts/build.js`

**Android:**
```
VARIANTE=pflege npm run build:app        # schreibt app/www mit variante.json, dann cap sync
cd app/android && ./gradlew assembleDebug   # Test-App „SoLo Pflege Test“
ANDROID_KEYSTORE_FILE=… ./gradlew bundleRelease   # Store-Paket
```
- Keine productFlavors: Die Gradle-Aufgaben heißen wie bei SoLo (CI, `tools/paket-bauen.sh` bleiben gleich).
- `app/android/app/build.gradle` liest `src/main/assets/public/variante.json` (kommt mit `cap sync` aus `app/www`).
  Paket-ID, Name und Symbol folgen also immer dem Web-Inhalt. Ohne die Datei: SoLo.
- Optional `-Pvariante=pflege`: passt es nicht zum Web-Inhalt, bricht der Bau mit Hinweis ab (kein SoLo-Inhalt unter Pflege-ID und umgekehrt).
- Name und Symbol liegen nur in `app/android/app/src/pflege/` (`res-symbol`, `res-name`, `res-name-test`) und kommen nur bei der Variante dazu.
- `tools/paket-bauen.sh` baut vorher selbst SoLo (`npm run build:app` ohne VARIANTE). Für die Variante den Bau von Hand wie oben
  oder das Skript mit `VARIANTE=pflege` erweitern (noch offen, siehe unten).

**iOS:**
```
VARIANTE=pflege npm run build:app
cd app/ios/App && xcodebuild -project App.xcodeproj -scheme App -configuration Release -xcconfig pflege.xcconfig …
```
- `app/ios/App/pflege.xcconfig` überschreibt Bundle-ID, Anzeigename (`SOLO_ANZEIGENAME`) und Symbol (`AppIconPflege`).
- Das Target „App“ bleibt unverändert `com.Sozialleistungslotse`. `ios-testflight.yml` lädt weiter nur SoLo hoch (prüft die Bundle-ID im Projekt).
- `Info.plist`: `CFBundleDisplayName = $(SOLO_ANZEIGENAME)`, im Projekt für SoLo `SOLO_ANZEIGENAME = SoLo` (Debug und Release).

**Symbol neu erzeugen:** `node tools/mkicon-pflege.js [vorschau.png]` (Playwright-Chromium; anderes Chromium mit `CHROME_PFAD=…`).

## Was David vor der ersten Veröffentlichung tun muss
1. **Google Play:** neue App in der Play Console anlegen (Paket `com.Sozialleistungslotse.pflege`), eigener Store-Eintrag,
   Datensicherheit, Inhaltsbewertung. Der Upload-Schlüssel kann derselbe sein (Play App Signing je App).
2. **App Store:** neue App-ID `com.Sozialleistungslotse.pflege` im Apple-Developer-Konto und neue App in App Store Connect.
3. Store-Texte und -Bilder für die Variante (noch nicht erstellt).
4. Datenschutzerklärung: Hinweis zur Sprachausgabe (Vorlesen nutzt die Stimme des Geräts; manche Android-Geräte nutzen Online-Stimmen).

## Offen
- iOS: `-xcconfig` gilt beim Kommandozeilenbau für alle Targets, auch für die Swift-Pakete (Capacitor). Ob das stört, zeigt erst
  ein Bau auf GitHub (macOS). Alternative: eigenes Target/Schema im Projekt.
- Workflows für die Variante (Android-Test-App, TestFlight) fehlen; Workflows werden erst nach Davids Freigabe geändert.
- `tools/paket-bauen.sh` kennt die Variante noch nicht.
- Das Vorlese-Plugin (`@capacitor-community/text-to-speech`) steckt auch in der SoLo-App (gemeinsame `app/package.json`), wird dort aber nie aufgerufen.
- Startbild (Splash) ist das von SoLo (Petrol-Logo).

## Kinder unter 25 im Haushalt (Auftrag David 25.11.2026)
- Frage „Leben Kinder unter 25 Jahren in Ihrem Haushalt?“ direkt nach der Haushaltsfrage (`senKinder` in `varFragen`, `src/app.js`).
- Bei „Ja“: Zahl der Kinder unter 18, davon unter 6 und 14 bis 17, Kinder 18 bis 24 in Schule/Ausbildung/Studium, Sammelfrage
  „Trifft etwas davon auf die Kinder zu?“ (Unterhalt, Waisenrente, eigenes Einkommen; Betrag wird erst bei Haken gefragt).
  „Ein Kind unter 18“ bei der Behinderungsfrage nur mit Kindern unter 18. „Nein“ löscht alle Angaben zu Kindern.
- Die Regeln rechnen die Kinder wie in SoLo (richtige Beträge bei Wohngeld und Grundsicherung). Angezeigt wird dafür nur zusätzlich
  „Kindergeld für erwachsene Kinder mit Behinderung“ (`VAR_KARTEN_KINDER = ['kgBeh']`). Kindergeld, Kinderzuschlag, Bildung und Teilhabe und
  Unterhaltsvorschuss zeigt die Variante nicht, auch nicht die Hinweise dazu (`VAR_HINWEISE_AUS`). Stattdessen steht mit Kindern unter den Karten
  der Hinweis `sux.kinder.solo` („… nutzen Sie bitte die App SoLo“). Entscheidung David 25.11.2026: Fokus auf Rente und Pflege.
- Tests: `test/test-variante-pfad.js` (Fall „EM-Rente mit 2 Kindern“: Wohngeld gleich SoLo, etwa 660 €, keine Kinder-Karten, Hinweis auf SoLo), `test/e2e-variante-kinder.js` (Browser).
