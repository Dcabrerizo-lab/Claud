# Veröffentlichung: Checkliste

Reihenfolge so, wie Profis es machen: erst geschlossen testen, dann schrittweise öffentlich.

## 0. Einmalig vorbereiten

- [ ] **App-ID festlegen.** Sie kann nach der ersten Veröffentlichung nicht mehr geändert werden. Derzeit `de.leistungslotse.app`. Falls du eine eigene Domain hast, eher `de.<deine-domain>.leistungslotse`. Ändern in `app/capacitor.config.json`, `app/android/app/build.gradle` (`namespace`, `applicationId`, Java-Paket `de/leistungslotse/app`) und in Xcode (Bundle Identifier).
- [ ] **Impressum prüfen.** Die App und `datenschutz.html` zeigen Name und Privatanschrift. Für Apps mit Impressumspflicht ist eine ladungsfähige Anschrift nötig. Wer die Privatadresse nicht zeigen will, nutzt eine Geschäfts- oder Impressumsadresse (Dienstleister).
- [ ] **Datenschutz-URL online.** Den Branch in `main` zusammenführen. GitHub Pages veröffentlicht dann `https://dcabrerizo-lab.github.io/Claud/datenschutz.html` (Einstellungen → Pages → Quelle: `main`, Ordner `/`). Im Browser prüfen, ob die Seite erreichbar ist.
- [ ] **Konten anlegen:** Google Play Console (einmalig 25 US-$, Identitätsprüfung dauert einige Tage), Apple Developer Program (99 US-$ pro Jahr).

## 1. Android: Signierschlüssel (einmalig)

Google empfiehlt **Play App Signing**: Google verwahrt den eigentlichen App-Schlüssel, du hast nur einen *Upload-Schlüssel*. Geht er verloren, kann Google ihn ersetzen.

```bash
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 upload.jks > upload.jks.b64     # macOS: base64 -i upload.jks -o upload.jks.b64
```

- [ ] `upload.jks` und die Passwörter **sicher aufbewahren** (Passwortmanager plus Kopie offline). Niemals ins Repo, `.gitignore` schließt `*.jks` aus.
- [ ] In GitHub unter Settings → Secrets and variables → Actions vier Secrets anlegen:
  `ANDROID_KEYSTORE_BASE64` (Inhalt von `upload.jks.b64`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`upload`), `ANDROID_KEY_PASSWORD`

## 2. Version erhöhen und Release bauen

1. In `package.json` die `version` erhöhen (z. B. `1.0.0` → `1.0.1`). Das ist der sichtbare `versionName`.
2. Committen, nach `main` zusammenführen und einen Tag setzen: `git tag v1.0.1 && git push origin v1.0.1`
3. Die CI baut alles, testet alles und erzeugt bei vorhandenen Secrets das signierte **App-Bundle (AAB)** als Artefakt `android-release-aab`. Die `versionCode` ist die CI-Laufnummer und steigt damit automatisch.

## 3. Android testen und veröffentlichen

- [ ] Debug-APK aus der CI (Artefakt `android-debug-apk`) auf mindestens **zwei echten Geräten** installieren, eins davon älter (Android 8–10):
  - App startet ohne weißen Bildschirm
  - Beispiel laden, Felder ändern, App schließen und wieder öffnen: Angaben sind noch da
  - „Formular fotografieren“: Kamera öffnet, Felder werden erkannt
  - Antragsmappe → „Als PDF teilen“: PDF öffnet sich, Umlaute stimmen, Drucken und E-Mail funktionieren
  - Zurück-Taste: schließt Mappe und Impressum, beendet am Ende die App
  - Arabisch: Schreibrichtung rechts nach links
- [ ] Play Console: App anlegen, Store-Eintrag aus `docs/STORE.md`, Datensicherheit, Inhaltsbewertung, Zielgruppe ausfüllen
- [ ] AAB in **Interner Test** hochladen (bis 100 Tester, sofort verfügbar)
- [ ] **Geschlossener Test:** Neue private Entwicklerkonten müssen vor der Produktion mindestens **12 Tester über 14 Tage** im geschlossenen Test haben. Gute Tester sind Menschen aus Sozialberatung, Familie und Bekanntenkreis.
- [ ] Danach Produktion mit **gestaffeltem Rollout** (z. B. 20 % → 50 % → 100 %)

## 4. iOS (braucht einen Mac mit Xcode)

```bash
npm ci && (cd app && npm ci) && npm run build:app
cd app && npx cap open ios
```

- [ ] In Xcode: Target *App* → Signing & Capabilities → Team wählen, Bundle Identifier prüfen
- [ ] Version: *General* → Version (`1.0.1`) und Build (fortlaufend)
- [ ] Auf einem echten iPhone testen (dieselbe Liste wie bei Android, zusätzlich: Teilen-Dialog, Kamera-Erlaubnis-Text)
- [ ] Product → Archive → Distribute App → App Store Connect
- [ ] App Store Connect: Store-Eintrag, App-Datenschutz, Review-Hinweis aus `docs/STORE.md`
- [ ] **TestFlight** mit externen Testern (kurze Beta-Prüfung durch Apple), danach zur Prüfung einreichen

Später automatisierbar mit fastlane und App-Store-Connect-API-Schlüssel in der CI. Das lohnt sich ab regelmäßigen Releases.

## 5. Vor jedem Release

- [ ] `npm test`, `npm run test:e2e`, `npm run test:app` grün (macht die CI)
- [ ] Rechtsstand prüfen: Regelsätze, Wohngeld, Kindergeld zum 1. Januar, siehe `docs/QUELLEN.md` und `src/rules.js` (`stand`)
- [ ] Datenschutzerklärung passt noch zu dem, was die App tut
- [ ] Übersetzungen neuer Texte von Muttersprachlern gegenlesen lassen

## Bekannte offene Punkte

- **Echte Geräte:** Kamera, Texterkennung, PDF-Teilen und Speichern sind im Browser mit nachgeahmten Plugins getestet, nicht auf echten Geräten. Das Kompilieren prüft die CI.
- **PLZ-Suche:** Code ist vorhanden (`src/plz.js`), die Daten (`content/plz-data.json`) fehlen. Das Feld bleibt bis dahin ausgeblendet, die Mietenstufe wird von Hand gewählt.
- **Übersetzungen** sind maschinell und sollten von Muttersprachlern geprüft werden.
- **Fachliche Prüfung:** 10–20 echte Fälle mit einer Sozialberatung durchgehen.
- **Wohngeld-Reform 1.1.2027:** Sobald sie beschlossen ist, Tabellen in `src/rules.js` aktualisieren. Die Tests in `test/test.js` rechnen die Grenzen unabhängig nach.
