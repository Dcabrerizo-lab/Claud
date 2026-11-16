// PDF der Antragsmappe (nur Store-App). Wird mit esbuild zu app/www/pdf.js gebündelt und erst beim Klick auf
// „Als PDF teilen“ nachgeladen. Schnittstelle (siehe src/app.js, sharePdf):
//   window.LotsePdf.buildPdf({ pages, title, loadFont }) -> Promise<Uint8Array>
//   pages:    [{ blocks: [{ t: 'pre' | 'h' | 'p' | 'li' | 'small', text }] }]
//   loadFont: (dateiname) -> Promise<Uint8Array>, Dateien liegen in www/fonts/pdf/
// Schrift: Noto Sans (Latein, Kyrillisch, Griechisch). Arabisch setzt die App nicht ins PDF (src/app.js, pdfPages).
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const A4 = [595.28, 841.89];
const MARGIN = 56; // ca. 2 cm
const STYLE = {
  pre: { size: 11, lead: 15.5, bold: false, before: 0, after: 0 },
  h: { size: 13, lead: 18, bold: true, before: 10, after: 4 },
  p: { size: 11, lead: 15.5, bold: false, before: 2, after: 4 },
  li: { size: 11, lead: 15.5, bold: false, before: 0, after: 2, indent: 14, bullet: '•' },
  small: { size: 9.5, lead: 13.5, bold: false, before: 2, after: 6, gray: true }
};

// Zeichen, die Noto Sans nicht hat (z. B. Steuerzeichen für Schreibrichtung), entfernen
function clean(s, font) {
  const chars = font.getCharacterSet ? new Set(font.getCharacterSet()) : null;
  let out = '';
  for (const ch of String(s).replace(/\r/g, '').replace(/[‎‏⁦-⁩؜]/g, '').replace(/\t/g, '    ')) {
    const cp = ch.codePointAt(0);
    if (ch === '\n' || !chars || chars.has(cp)) out += ch;
    else if (cp === 0x202f || cp === 0xa0) out += ' ';
    else out += '?';
  }
  return out;
}

// Zeilenumbruch nach Wörtern; überlange Wörter werden hart getrennt
function wrap(text, font, size, width) {
  const lines = [];
  text.split('\n').forEach((para) => {
    if (para.trim() === '') { lines.push(''); return; }
    let line = '';
    para.split(/(\s+)/).forEach((part) => {
      if (part === '') return;
      const test = line + part;
      if (font.widthOfTextAtSize(test.trimEnd(), size) <= width) { line = test; return; }
      if (line.trim()) lines.push(line.trimEnd());
      line = /^\s+$/.test(part) ? '' : part;
      while (font.widthOfTextAtSize(line, size) > width) {
        let i = line.length - 1;
        while (i > 1 && font.widthOfTextAtSize(line.slice(0, i), size) > width) i--;
        lines.push(line.slice(0, i));
        line = line.slice(i);
      }
    });
    lines.push(line.trimEnd());
  });
  return lines;
}

async function buildPdf({ pages, title, loadFont }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(title || 'Antragsmappe');
  doc.setCreator('SoLo – Sozialleistungslotse');
  doc.setProducer('SoLo – Sozialleistungslotse');
  doc.setLanguage('de-DE');
  const [regBytes, boldBytes] = await Promise.all([loadFont('NotoSans-Regular.ttf'), loadFont('NotoSans-Bold.ttf')]);
  const reg = await doc.embedFont(regBytes, { subset: false });
  const bold = await doc.embedFont(boldBytes, { subset: false });
  const width = A4[0] - 2 * MARGIN;

  (pages || []).forEach((pg) => {
    let page = doc.addPage(A4);
    let y = A4[1] - MARGIN;
    const newPage = () => { page = doc.addPage(A4); y = A4[1] - MARGIN; };
    (pg.blocks || []).forEach((b) => {
      const st = STYLE[b.t] || STYLE.p;
      const font = st.bold ? bold : reg;
      const indent = st.indent || 0;
      const lines = wrap(clean(b.text, font), font, st.size, width - indent);
      y -= st.before;
      lines.forEach((ln, i) => {
        if (y - st.lead < MARGIN) newPage();
        y -= st.lead;
        if (st.bullet && i === 0) page.drawText(st.bullet, { x: MARGIN, y, size: st.size, font: reg });
        if (ln) page.drawText(ln, { x: MARGIN + indent, y, size: st.size, font, color: st.gray ? rgb(0.25, 0.25, 0.25) : rgb(0, 0, 0) });
      });
      y -= st.after;
    });
  });
  if (doc.getPageCount() === 0) doc.addPage(A4);
  return doc.save();
}

const api = { buildPdf };
if (typeof window !== 'undefined') window.LotsePdf = api;
export default api;
