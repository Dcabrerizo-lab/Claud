#!/usr/bin/env bash
# Startet die echte Debug-APK im Android-Emulator und prüft: installiert, startet, stürzt nicht ab, Oberfläche erscheint.
# Wird von .github/workflows/schwer.yml im Emulator aufgerufen. Bildschirmfoto: emulator-<API>.png
set -u
APK=app/android/app/build/outputs/apk/debug/app-debug.apk
PKG=com.sozialleistungslotse.apk
API=$(adb shell getprop ro.build.version.sdk | tr -d '\r')
echo "Android-API $API"
adb install -r "$APK" || { echo "::error::Installation fehlgeschlagen (API $API)"; exit 1; }
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
echo "Emulator-Test bestanden (API $API)"
