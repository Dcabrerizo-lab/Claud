// Anbieter je Plattform: Android und Web David Cabrerizo, Apple (iPhone) Natascha Cabrerizo y Polo.
// Prüft beide Datenschutzerklärungen (Hauptordner, site/, docs/ für GitHub Pages) und die Store-Texte.
const fs = require('fs'), path = require('path'); const R = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let n = 0, fails = 0; const ck = (name, c) => { n++; if (!c) { fails++; console.log('FAIL [anbieter] ' + name); } };
for (const d of ['', 'site/', 'docs/']) {
  const a = R(d + 'datenschutz.html'), i = R(d + 'datenschutz-ios.html');
  ck(d + 'datenschutz.html: Verantwortlich David Cabrerizo, nicht Natascha', /<h2>Verantwortlich<\/h2>\s*<p>David Cabrerizo<br>/.test(a) && !/Natascha/.test(a));
  ck(d + 'datenschutz-ios.html: Verantwortlich Natascha Cabrerizo y Polo, nicht David', /<h2>Verantwortlich<\/h2>\s*<p>Natascha Cabrerizo y Polo<br>/.test(i) && !/David/.test(i));
  ck(d + 'beide Fassungen sonst gleich (nur Name und Geltungsbereich verschieden)', a.replace(/David Cabrerizo/g, 'X').replace(/<p class="stand">.*<\/p>/, '') === i.replace(/Natascha Cabrerizo y Polo/g, 'X').replace(/<p class="stand">.*<\/p>/, ''));
}
for (const f of ['datenschutz.html', 'site/datenschutz.html', 'docs/datenschutz.html', 'datenschutz-ios.html', 'site/datenschutz-ios.html', 'docs/datenschutz-ios.html']) {
  const x = R(f);
  ck(f + ': Haushaltsbuch nur auf dem Gerät, CSV nur auf Wunsch und dann unverschlüsselt, Kassenzettel wie Formularfoto', /Haushaltsplan und Haushaltsbuch<\/strong>/.test(x) && /CSV-Datei entsteht nur, wenn du sie selbst teilst; sie ist dann unverschlüsselt/.test(x) && /Kassenzettels wird wie das Foto eines Formulars/.test(x));
  ck(f + ': „Alle Angaben löschen“ löscht den geöffneten Vorgang, alle Vorgänge in den Einstellungen, Löschen beim nächsten Öffnen', /„Alle Angaben löschen“ löscht den geöffneten Vorgang/.test(x) && /Alle Vorgänge löschen/.test(x) && /beim nächsten Öffnen der App/.test(x));
  // Unabhängige Prüfung 21.11.2026: nichts versprechen, was nicht gilt
  ck(f + ': iOS-Sicherung ohne Garantie (nur Hinweis an iOS), Rückfall genannt', /Hinweis an iOS/.test(x) && /Apple garantiert nicht/.test(x) && !/von der iCloud- und der Finder-Sicherung ausgenommen ist/.test(x) && !/are not included in cloud backups/.test(x));
  ck(f + ': ML Kit mit Quelle und Abrufdatum, Gerätetest offen', /developers\.google\.com\/ml-kit\/android-data-disclosure/.test(x) && /abgerufen am 21\.11\.2026/.test(x) && /prüfen wir noch auf einem Testgerät/.test(x));
  ck(f + ': Suchlink (DuckDuckGo mit Ort) und Dateien nach dem Deinstallieren genannt', /DuckDuckGo/.test(x) && /bleiben dort, bis du sie selbst löschst/.test(x) && !/werden alle Daten gelöscht/.test(x));
  ck(f + ': alte iOS-Sicherungen können die Angaben noch enthalten', /Sicherungen, die du mit einer älteren Version der App angelegt hast, können deine Angaben noch enthalten/.test(x));
  ck(f + ': PIN-Sperre als Sichtschutz, 6-stellige PIN empfohlen', /Sichtschutz/.test(x) && /6-stellige PIN/.test(x));
}
// Sicherheit 1.9, zweite unabhängige Prüfung (21.11.2026): die nativen Teile so, wie die Datenschutzerklärung sie beschreibt (Textprüfung; kompiliert wird im Workflow ios-build-check.yml)
{
  const sw = R('app/ios/App/App/SoloSpeicherPlugin.swift'), pb = R('app/ios/App/App.xcodeproj/project.pbxproj'), mv = R('app/ios/App/App/MainViewController.swift'), sd = R('app/ios/App/App/SceneDelegate.swift');
  ck('iOS-Speicher: Ordner und Datei von der Sicherung ausgenommen, nach jedem Schreiben neu gesetzt', /isExcludedFromBackup = true/.test(sw) && /ausSicherung\(ordner\)/.test(sw) && /try data\.write\(to: url, options: \[\.atomic, \.completeFileProtectionUntilFirstUserAuthentication\]\)\s*\n\s*try SoloSpeicherPlugin\.ausSicherung\(url\)/.test(sw));
  ck('iOS-Speicher: alte Werte erst nach geprüftem Schreiben aus UserDefaults gelöscht', sw.indexOf('guard pruef == werte') > 0 && sw.indexOf('guard pruef == werte') < sw.indexOf('ud.removeObject(forKey: k) } // erst nach geprüftem Schreiben'));
  ck('iOS-Speicher: mit vorhandener Datei nie auf UserDefaults ausweichen, Datei gewinnt bei der Übernahme', /if gab \{ return \}/.test(sw) && /if !gab \{ ausweich = true; return \}/.test(sw) && /if geladen\[kurz\] == nil \{ geladen\[kurz\] = s \}/.test(sw) && !/\n\s*ausweich = true\n\s*return\n\s*\}\n\s*var geladen/.test(sw));
  ck('iOS-Speicher: nicht lesbare Datei wird nie überschrieben', /do \{ data = try Data\(contentsOf: url\) \} catch \{ return \}/.test(sw) && /if !self\.bereit \{ return false \}/.test(sw));
  ck('iOS: Swift-Datei im Xcode-Projekt (Verweis, Gruppe, Sources) und beide Plugins registriert', (pb.match(/SoloSpeicherPlugin\.swift/g) || []).length === 6 && /SoloSpeicherPlugin\.swift in Sources \*\/,/.test(pb) && /registerPluginInstance\(SoloSpeicherPlugin\(\)\)/.test(mv) && /registerPluginInstance\(SoloSchutzPlugin\(\)\)/.test(mv));
  ck('iOS: Abdeckung im App-Wechsler hängt an SoloSchutzPlugin.aktiv', /func sceneWillResignActive[\s\S]*guard SoloSchutzPlugin\.aktiv/.test(sd) && /func sceneDidBecomeActive[\s\S]*removeFromSuperview/.test(sd));
  const ma = R('app/android/app/src/main/java/de/sozialleistungslotse/app/MainActivity.java'), sp = R('app/android/app/src/main/java/de/sozialleistungslotse/app/SoloSchutzPlugin.java'), mf = R('app/android/app/src/main/AndroidManifest.xml');
  ck('Android: FLAG_SECURE-Plugin registriert, Sicherung der App aus', /registerPlugin\(SoloSchutzPlugin\.class\)/.test(ma) && /addFlags\(WindowManager\.LayoutParams\.FLAG_SECURE\)/.test(sp) && /clearFlags\(WindowManager\.LayoutParams\.FLAG_SECURE\)/.test(sp) && /android:allowBackup="false"/.test(mf));
  const wf = R('.github/workflows/ios-build-check.yml');
  ck('iOS-Kompilierprüfung: nur lesen, ohne Signatur, ohne Geheimnisse, ohne Upload', /permissions:\s*\n\s*contents: read/.test(wf) && /CODE_SIGNING_ALLOWED=NO/.test(wf) && /-sdk iphonesimulator/.test(wf) && !/secrets\./.test(wf) && !/upload|altool|testflight|fastlane/i.test(wf.replace(/^#.*$/gm, '')));
  ck('App nimmt auf iOS den eigenen Speicher statt Preferences', /if \(name === 'Preferences' && P\.SoloSpeicher\) return P\.SoloSpeicher;/.test(R('src/app.js')));
}
ck('Store-Texte nennen beide Datenschutz-Adressen', /datenschutz-ios\.html/.test(R('docs/STORE.md')) && /Claud\/datenschutz\.html/.test(R('docs/STORE.md')));
console.log(fails ? fails + ' von ' + n + ' Anbieter-Prüfungen FALSCH' : 'Anbieter je Plattform: alle ' + n + ' Prüfungen bestanden');
process.exit(fails ? 1 : 0);
