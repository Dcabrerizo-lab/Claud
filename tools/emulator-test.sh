#!/usr/bin/env bash
# Startet die echte Debug-APK im Android-Emulator und prüft: installiert, startet, stürzt nicht ab, Oberfläche erscheint.
# Wird von .github/workflows/schwer.yml im Emulator aufgerufen. Bildschirmfoto: emulator-<API>.png
set -u
APK=app/android/app/build/outputs/apk/debug/app-debug.apk
ALT=${ALT_APK:-$APK}   # ältere Version (kleinere Versionsnummer) für den Update-Test
PKG=com.Sozialleistungslotse
API=$(adb shell getprop ro.build.version.sdk | tr -d '\r')
echo "Android-API $API"
adb install -r "$ALT" || { echo "::error::Installation fehlgeschlagen (API $API)"; exit 1; }
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 25
adb exec-out screencap -p > "emulator-$API.png" || true
if ! adb shell pidof "$PKG" >/dev/null; then echo "::error::App läuft nach dem Start nicht mehr (API $API)"; adb logcat -d | tail -80; exit 1; fi
if adb logcat -d | grep -E "FATAL EXCEPTION|Process: $PKG" | grep -q .; then echo "::error::Absturz im Log (API $API)"; adb logcat -d | grep -A30 "FATAL EXCEPTION" | head -60; exit 1; fi
adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 && adb pull /sdcard/ui.xml "ui-$API.xml" >/dev/null 2>&1 || true
if grep -q "SoLo" "ui-$API.xml" 2>/dev/null; then echo "Oberfläche mit „SoLo“ sichtbar"; else echo "::warning::„SoLo“ nicht im Bedienbaum gefunden (WebView-Inhalt ggf. nicht ausgelesen); Bildschirmfoto prüfen"; fi
# JavaScript-Fehler der WebView im Log?
if adb logcat -d | grep -E "chromium.*(Uncaught|SyntaxError|TypeError|ReferenceError)" | grep -q .; then echo "::error::JavaScript-Fehler in der App (API $API)"; adb logcat -d | grep -E "chromium.*(Uncaught|Error)" | head -20; exit 1; fi
echo "Start ohne Absturz (API $API)"
# Bedienung: Fragebogen, Karten, Antragsmappe, PDF über das native Teilen.
# Ab Android 10: Das Emulator-Abbild für Android 8 hat eine sehr alte WebView ohne Aktualisierung über den Play Store,
# mit der sich Playwright nicht verbinden kann. Dort bleiben Start-, Absturz- und Update-Prüfung.
BEDIENUNG=1; [ "$API" -lt 29 ] && BEDIENUNG=0 && echo "Bedienungstest übersprungen (WebView im Emulator-Abbild für API $API zu alt)"
[ "$BEDIENUNG" = 0 ] || timeout 300 node tools/emulator-bedienung.js vorher || { echo "::error::Bedienung in der App fehlgeschlagen (API $API)"; exit 1; }
# Update: neue Version über die alte installieren, Angaben müssen erhalten bleiben
VOR=$(adb shell dumpsys package "$PKG" | grep -m1 versionCode | tr -d '\r')
adb install -r "$APK" || { echo "::error::Update über die alte Version fehlgeschlagen (API $API)"; exit 1; }
NACH=$(adb shell dumpsys package "$PKG" | grep -m1 versionCode | tr -d '\r')
echo "Version vorher: $VOR / nachher: $NACH"
if [ "$ALT" != "$APK" ] && [ "$VOR" = "$NACH" ]; then echo "::error::Versionsnummer hat sich beim Update nicht geändert"; exit 1; fi
if [ "$BEDIENUNG" = 0 ]; then
  adb logcat -c; adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null; sleep 15
  adb shell pidof "$PKG" >/dev/null || { echo "::error::App startet nach dem Update nicht (API $API)"; exit 1; }
  if adb logcat -d | grep -E "FATAL EXCEPTION" | grep -q .; then echo "::error::Absturz nach dem Update (API $API)"; exit 1; fi
  echo "Nach dem Update: App startet ohne Absturz (API $API)"
else timeout 300 node tools/emulator-bedienung.js nachher || { echo "::error::Angaben nach dem Update verloren (API $API)"; exit 1; }
fi
echo "Emulator-Test bestanden (API $API)"
