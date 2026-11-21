// Reste vom Teilen (src/klient.js cacheAufraeumen): beim App-Start .solo- und PDF-Dateien und Seitenbilder aus dem eigenen
// App-Cache (Capacitor Filesystem, Directory.Cache) löschen – nur diese, keine Ordner, nichts anderes. Attrappe statt echtem Plugin.
// Aufruf: node test/test-cache-reste.js
'use strict';
const fs = require('fs');
const path = require('path');
const Klient = require('../src/klient.js');
let fails = 0, n = 0;
const ok = (name, c, info) => { n++; if (!c) { fails++; console.log('FAIL ' + name, info === undefined ? '' : JSON.stringify(info)); } else console.log('ok   ' + name); };

function attrappe(files, opt = {}) {
  const geloescht = [], gelesen = [];
  return {
    geloescht, gelesen,
    readdir: (o) => { gelesen.push(o); return opt.leseFehler ? Promise.reject(new Error('kein Zugriff')) : Promise.resolve({ files }); },
    deleteFile: (o) => { if (opt.loeschFehler && o.path === opt.loeschFehler) return Promise.reject(new Error('gesperrt')); geloescht.push(o); return Promise.resolve(); }
  };
}

(async () => {
  // Filesystem ab Version 5: Einträge { name, type }
  const f = attrappe([
    { name: 'SoLo-Vorgang.solo', type: 'file' }, { name: 'SoLo-Unterlagen.SOLO', type: 'file' }, { name: 'Antragsmappe.pdf', type: 'file' },
    { name: 'Widerspruch-Jobcenter.pdf', type: 'file' }, { name: 'solo-pdfseite-1732190000000.jpg', type: 'file' },
    { name: 'foto.jpg', type: 'file' }, { name: 'Haushaltsbuch-2026-11-21.csv', type: 'file' }, { name: 'WebView', type: 'directory' },
    { name: 'alt.pdf', type: 'directory' }, { name: 'solo.txt', type: 'file' }, { name: 'x.solo.bak', type: 'file' }
  ]);
  const anzahl = await Klient.cacheAufraeumen(f);
  const weg = f.geloescht.map((o) => o.path).sort();
  ok('liest nur den App-Cache (CACHE, oberste Ebene)', f.gelesen.length === 1 && f.gelesen[0].directory === 'CACHE' && f.gelesen[0].path === '', f.gelesen);
  ok('löscht .solo, .pdf und Seitenbilder', JSON.stringify(weg) === JSON.stringify(['Antragsmappe.pdf', 'SoLo-Unterlagen.SOLO', 'SoLo-Vorgang.solo', 'Widerspruch-Jobcenter.pdf', 'solo-pdfseite-1732190000000.jpg']), weg);
  ok('alle Löschungen im CACHE', f.geloescht.every((o) => o.directory === 'CACHE'));
  ok('Anzahl gelöschter Dateien = 5', anzahl === 5, anzahl);
  ok('keine Ordner, keine fremden Dateien (Foto, CSV, .txt, .bak)', !weg.some((p) => /foto|csv|WebView|alt\.pdf|txt|bak/.test(p)));

  // Ältere Filesystem-Versionen: nur Namen
  const g = attrappe(['a.solo', 'b.pdf', 'c.png']);
  ok('ältere Version (nur Namen)', (await Klient.cacheAufraeumen(g)) === 2 && g.geloescht.map((o) => o.path).join() === 'a.solo,b.pdf');

  // Fehler bremsen den Start nicht
  ok('Lesefehler -> 0, kein Abbruch', (await Klient.cacheAufraeumen(attrappe([], { leseFehler: true }))) === 0);
  const h = attrappe(['a.solo', 'b.pdf'], { loeschFehler: 'a.solo' });
  ok('eine Datei gesperrt -> die anderen trotzdem gelöscht', (await Klient.cacheAufraeumen(h)) === 1 && h.geloescht[0].path === 'b.pdf');
  ok('ohne Plugin (Browser) -> nichts', (await Klient.cacheAufraeumen(null)) === 0 && (await Klient.cacheAufraeumen({})) === 0);
  ok('leerer Cache', (await Klient.cacheAufraeumen(attrappe([]))) === 0);

  // App: Aufruf beim Start nur in der Store-App
  const app = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  ok('src/app.js ruft das Aufräumen beim Start nur in der App auf', /if \(NATIVE && window\.Klient\) Klient\.cacheAufraeumen\(plug\('Filesystem'\)\)/.test(app));

  console.log(fails ? fails + ' von ' + n + ' Prüfungen fehlgeschlagen (Cache-Reste)' : 'Cache-Reste: ' + n + ' Prüfungen bestanden');
  if (fails) process.exit(1);
})();
