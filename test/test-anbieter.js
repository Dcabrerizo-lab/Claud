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
  ck(f + ': PIN-Sperre als Sichtschutz, 6-stellige PIN empfohlen', /Sichtschutz/.test(x) && /6-stellige PIN/.test(x));
}
ck('Store-Texte nennen beide Datenschutz-Adressen', /datenschutz-ios\.html/.test(R('docs/STORE.md')) && /Claud\/datenschutz\.html/.test(R('docs/STORE.md')));
console.log(fails ? fails + ' von ' + n + ' Anbieter-Prüfungen FALSCH' : 'Anbieter je Plattform: alle ' + n + ' Prüfungen bestanden');
process.exit(fails ? 1 : 0);
