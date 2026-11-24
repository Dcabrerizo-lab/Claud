// Native Einstellungen der Variante „SoLo Pflege & Rente“ (docs/VARIANTE-PFLEGE.md) passen zu VARIANTEN in scripts/build.js,
// und SoLo bleibt unverändert: Android (build.gradle ohne productFlavors, Namen/Symbole nur in src/pflege), iOS (Target „App“
// weiter com.Sozialleistungslotse, Anzeigename über SOLO_ANZEIGENAME, pflege.xcconfig). Ohne Android-SDK/Xcode, nur Dateiprüfung.
// Aufruf: node test/test-variante-nativ.js
'use strict';
const fs = require('fs');
const path = require('path');
const { VARIANTEN } = require(path.join(__dirname, '..', 'scripts', 'build.js'));

const R = path.join(__dirname, '..');
const lies = (f) => fs.readFileSync(path.join(R, f), 'utf8');
let fails = 0;
const check = (n, c, x) => { if (!c) { fails++; console.log('FAIL', n, x === undefined ? '' : x); } else console.log('ok  ', n); };
const p = VARIANTEN.pflege, s = VARIANTEN.solo;
const str = (xml, name) => (xml.match(new RegExp('<string name="' + name + '">([^<]*)</string>')) || [])[1];

// Android
const gradle = lies('app/android/app/build.gradle');
check('Android: keine productFlavors (Aufgabennamen assembleDebug/bundleRelease bleiben)', !/productFlavors|flavorDimensions/.test(gradle.replace(/\/\/.*$/gm, '')));
check('Android: Paket-ID je Variante (SoLo zuerst, test/test.js prüft das erste applicationId)', (gradle.match(/applicationId\s+"([^"]+)"/) || [])[1] === s.appId && new RegExp("soloVariante == 'pflege'\\) applicationId \"" + p.appId.replace(/\./g, '\\.') + '"').test(gradle));
check('Android: Variante aus variante.json, Abbruch bei Widerspruch', /assets\/public\/variante\.json/.test(gradle) && /GradleException\("Variante/.test(gradle));
const rel = lies('app/android/app/src/pflege/res-name/values/strings.xml');
const dbg = lies('app/android/app/src/pflege/res-name-test/values/strings.xml');
check('Android: Name auf dem Startbildschirm = Kurzname', str(rel, 'app_name') === p.kurzname && str(rel, 'title_activity_main') === p.kurzname, str(rel, 'app_name'));
check('Android: Test-App „… Test“', str(dbg, 'app_name') === p.kurzname + ' Test');
check('Android: package_name/custom_url_scheme der Variante', [rel, dbg].every((x) => str(x, 'package_name') === p.appId && str(x, 'custom_url_scheme') === p.appId));
check('Android: SoLo-Namen unverändert', str(lies('app/android/app/src/main/res/values/strings.xml'), 'app_name') === 'SoLo' && str(lies('app/android/app/src/debug/res/values/strings.xml'), 'app_name') === 'SoLo Test');
const dichten = ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
const namen = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png', 'ic_launcher_background.png'];
const fehlt = [];
dichten.forEach((d) => namen.forEach((n) => {
  const f = path.join(R, 'app/android/app/src/pflege/res-symbol/mipmap-' + d, n);
  const g = path.join(R, 'app/android/app/src/main/res/mipmap-' + d, n);
  if (!fs.existsSync(f)) { fehlt.push(d + '/' + n); return; }
  const w = (x) => fs.readFileSync(x).readUInt32BE(16);
  if (w(f) !== w(g)) fehlt.push(d + '/' + n + ' (Größe ' + w(f) + ' statt ' + w(g) + ')');
}));
check('Android: alle Symbole der Variante in den Größen von SoLo', fehlt.length === 0, fehlt.join(', '));

// iOS
const pbx = lies('app/ios/App/App.xcodeproj/project.pbxproj');
const ids = [...new Set(pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]*/g))];
check('iOS: Target „App“ bleibt com.Sozialleistungslotse (Prüfung in ios-testflight.yml)', ids.length === 1 && ids[0] === 'PRODUCT_BUNDLE_IDENTIFIER = ' + s.appId, ids.join(' | '));
check('iOS: SOLO_ANZEIGENAME = SoLo in Debug und Release', (pbx.match(/SOLO_ANZEIGENAME = SoLo;/g) || []).length === 2);
check('iOS: Anzeigename aus SOLO_ANZEIGENAME', /<key>CFBundleDisplayName<\/key>\s*<string>\$\(SOLO_ANZEIGENAME\)<\/string>/.test(lies('app/ios/App/App/Info.plist')));
const xc = lies('app/ios/App/pflege.xcconfig');
const xv = (k) => (xc.match(new RegExp('^' + k + ' = (.*)$', 'm')) || [])[1];
check('iOS: pflege.xcconfig Bundle-ID, Name, Symbol', xv('PRODUCT_BUNDLE_IDENTIFIER') === p.appId && xv('SOLO_ANZEIGENAME') === p.kurzname && xv('ASSETCATALOG_COMPILER_APPICON_NAME') === 'AppIconPflege');
const ic = JSON.parse(lies('app/ios/App/App/Assets.xcassets/AppIconPflege.appiconset/Contents.json'));
const icf = path.join(R, 'app/ios/App/App/Assets.xcassets/AppIconPflege.appiconset', ic.images[0].filename);
check('iOS: Symbol 1024 px vorhanden', fs.existsSync(icf) && fs.readFileSync(icf).readUInt32BE(16) === 1024);

console.log(fails ? fails + ' Fehler' : 'Alle Prüfungen bestanden');
process.exit(fails ? 1 : 0);
