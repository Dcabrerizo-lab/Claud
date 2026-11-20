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
  ck(f + ': PIN-Sperre als Sichtschutz, 6-stellige PIN empfohlen', /Sichtschutz/.test(x) && /6-stellige PIN/.test(x));
}
ck('Store-Texte nennen beide Datenschutz-Adressen', /datenschutz-ios\.html/.test(R('docs/STORE.md')) && /Claud\/datenschutz\.html/.test(R('docs/STORE.md')));
console.log(fails ? fails + ' von ' + n + ' Anbieter-Prüfungen FALSCH' : 'Anbieter je Plattform: alle ' + n + ' Prüfungen bestanden');
process.exit(fails ? 1 : 0);
