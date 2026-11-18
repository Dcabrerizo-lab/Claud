// Test-PDFs: ein digitales PDF mit echtem Text und ein „eingescanntes“ PDF, das nur ein Bild enthält (kein Text).
'use strict';
const path = require('path');
const { PDFDocument, StandardFonts } = require(path.join(__dirname, '..', 'app', 'node_modules', 'pdf-lib'));
async function digital(zeilen, seiten = 1) {
  const d = await PDFDocument.create(), f = await d.embedFont(StandardFonts.Helvetica);
  for (let s = 0; s < seiten; s++) {
    const page = d.addPage([595, 842]); let y = 790;
    for (const z of (s === 0 ? zeilen : ['Seite ' + (s + 1) + ' mit weiterem Text, der nichts erkennen lassen soll.'])) { page.drawText(z, { x: 50, y, size: 12, font: f }); y -= 20; }
  }
  return Buffer.from(await d.save());
}
async function gescannt(png) {
  const d = await PDFDocument.create(), img = await d.embedPng(png);
  const page = d.addPage([595, 842]); page.drawImage(img, { x: 0, y: 842 - img.height * 595 / img.width, width: 595, height: img.height * 595 / img.width });
  return Buffer.from(await d.save());
}
module.exports = { digital, gescannt };
