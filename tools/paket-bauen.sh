#!/usr/bin/env bash
# Baut ein komplettes SoLo-Update mit einem Befehl:
#   tools/paket-bauen.sh <Versionsnummer> <Zielordner> <Pfad zum Upload-Schlüssel upload.jks> <Datei mit dem Passwort>
# Ablauf: alle Tests -> Web- und App-Build -> Android-App (APK) und signiertes Play-Bundle (AAB) -> Prüfung von Paketname,
# Versionsnummer und Signatur -> Ordner SoLo/ und SoLo-iOS/ mit LIESMICH, Unterlagen und Code -> ZIP-Dateien.
# Bricht bei jedem Fehler ab. Das Passwort wird nie in einen Ordner oder ein ZIP geschrieben.
set -euo pipefail
VC="${1:?Versionsnummer fehlt (größer als die letzte, z. B. 134)}"; ZIEL="${2:?Zielordner fehlt}"
JKS="${3:?Pfad zu upload.jks fehlt}"; PWDATEI="${4:?Datei mit dem Passwort fehlt}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
VN=$(node -p "require('./package.json').version")
PW=$(grep -m1 '^Passwort' "$PWDATEI" | sed 's/^Passwort[^:]*: *//')
SHA_SOLL="C8:E4:5D:61"   # Anfang des SHA-256-Fingerabdrucks des Upload-Schlüssels (Play Console)
HEUTE=$(date +%-d.%-m.%Y)
echo "== SoLo $VN, Versionsnummer $VC =="

echo "== 1. Tests =="
if [ "${OHNE_TESTS:-}" != 1 ]; then npm test >/tmp/solo-test.log 2>&1 || { tail -30 /tmp/solo-test.log; echo "TESTS FEHLGESCHLAGEN"; exit 1; }; fi
grep -E "bestanden" /tmp/solo-test.log | cut -c1-110 || true

echo "== 2. Builds =="
npm run build:web >/dev/null && npm run build:app >/dev/null
node test/app-test.js >/tmp/solo-app.log 2>&1 || { tail -20 /tmp/solo-app.log; echo "APP-TEST FEHLGESCHLAGEN"; exit 1; }
tail -1 /tmp/solo-app.log

echo "== 3. Android =="
( cd app/android && VERSION_CODE="$VC" ./gradlew -q assembleDebug >/dev/null \
  && ANDROID_KEYSTORE_FILE="$JKS" ANDROID_KEYSTORE_PASSWORD="$PW" ANDROID_KEY_ALIAS=upload ANDROID_KEY_PASSWORD="$PW" VERSION_CODE="$VC" ./gradlew -q bundleRelease >/dev/null )
APK=app/android/app/build/outputs/apk/debug/app-debug.apk
AAB=app/android/app/build/outputs/bundle/release/app-release.aab
SHA=$(keytool -printcert -jarfile "$AAB" 2>/dev/null | awk '/SHA256:/ && !f {print $2; f=1}')
[[ "$SHA" == "$SHA_SOLL"* ]] || { echo "FALSCHE SIGNATUR: $SHA"; exit 1; }
SDK=$(grep -m1 "^sdk.dir=" app/android/local.properties 2>/dev/null | cut -d= -f2 || true); SDK="${ANDROID_HOME:-${SDK:-/opt/android-sdk}}"
AAPT=$(ls -d "$SDK"/build-tools/*/aapt2 2>/dev/null | sort -V | tail -1 || true)
if [ -n "$AAPT" ]; then
  INFO=$("$AAPT" dump badging "$APK" 2>/dev/null | awk 'NR==1')
  echo "$INFO" | grep -q "name='com.Sozialleistungslotse'" || { echo "FALSCHER PAKETNAME: $INFO"; exit 1; }
  echo "$INFO" | grep -q "versionCode='$VC'" || { echo "FALSCHE VERSIONSNUMMER: $INFO"; exit 1; }
  echo "$INFO" | grep -q "versionName='$VN'" || { echo "FALSCHER VERSIONSNAME: $INFO"; exit 1; }
fi
echo "Signatur $SHA, Paket com.Sozialleistungslotse, Version $VN ($VC)"

echo "== 4. Pakete =="
mkdir -p "$ZIEL"; P="$ZIEL/SoLo"; I="$ZIEL/SoLo-iOS"
mkdir -p "$P/1-App-zum-Installieren" "$P/2-Google-Play" "$P/3-Projekt-Sicherung" "$P/4-Unterlagen" "$I/1-Xcode-Projekt" "$I/3-Texte"
cp "$APK" "$P/1-App-zum-Installieren/SoLo-Android.apk"
cp dist/sozialleistungslotse.html "$P/1-App-zum-Installieren/SoLo-Web.html"
cp "$AAB" "$P/2-Google-Play/SoLo-PlayStore.aab"
cp "$AAB" "$ROOT/SoLo-PlayStore-$VC.aab"
cp datenschutz.html "$P/2-Google-Play/datenschutz.html"; cp datenschutz.html "$I/3-Texte/datenschutz.html"
[ -f docs/STORE.md ] && cp docs/STORE.md "$P/2-Google-Play/Store-Texte.md" && cp docs/STORE.md "$I/3-Texte/Store-Texte.md"
for d in AENDERUNGEN PRUEFUNG-ANWALT WBS-GRENZEN ABGLEICH-SOZIALPLATTFORM BESCHEID-VERGLEICH PRUEFLISTE PRUEFBERICHT; do
  [ -f "docs/$d.md" ] && cp "docs/$d.md" "$P/4-Unterlagen/$d.md"; done
git archive --format=zip -o "$P/3-Projekt-Sicherung/SoLo-Code.zip" HEAD
git bundle create "$P/3-Projekt-Sicherung/SoLo-mit-Verlauf.bundle" --all 2>/dev/null
rm -rf "$I/1-Xcode-Projekt/ios"; cp -r app/ios "$I/1-Xcode-Projekt/ios"; cp app/capacitor.config.json app/package.json "$I/1-Xcode-Projekt/"
cp dist/sozialleistungslotse.html "$I/SoLo-Web-fuer-iPhone-Safari.html"
# Stand in den LIESMICH-Dateien (2. Zeile)
[ -f "$P/LIESMICH.txt" ] && sed -i "2s/.*/Stand: $HEUTE (Version $VN: App-Datei und Play-Store-Datei $VC)/" "$P/LIESMICH.txt"
[ -f "$I/LIESMICH-iOS.txt" ] && sed -i "2s/.*/Stand: $HEUTE (gleicher Inhalt wie Android-Version $VN, Versionsnummer $VC)/" "$I/LIESMICH-iOS.txt"
# Sicherheit: kein Passwort und keine Schlüsseldatei mit Passwort in den Paketen
if grep -rIl --exclude='*.aab' --exclude='*.apk' --exclude='*.bundle' --exclude='*.zip' -F "$PW" "$P" "$I" >/dev/null 2>&1; then echo "PASSWORT IN DEN PAKETEN GEFUNDEN"; exit 1; fi
find "$P" "$I" -name 'upload-schluessel*' -delete
( cd "$ZIEL" && rm -f SoLo-Komplett.zip SoLo-iOS.zip && zip -qr SoLo-Komplett.zip SoLo && zip -qr SoLo-iOS.zip SoLo-iOS )
ls -la "$ZIEL"/SoLo-Komplett.zip "$ZIEL"/SoLo-iOS.zip "$ROOT/SoLo-PlayStore-$VC.aab" | awk '{print $5, $9}'
echo "== FERTIG: Version $VN ($VC) =="
