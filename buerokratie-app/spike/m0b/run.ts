// M0b spike: paper form photo → OCR (offline, tesseract.js + German data from npm) → labels matched
// against the field catalogue → empty box next to each label → stage 1 (copy aid list) and
// stage 2 (values written into the photo as PDF). Evaluated against the known field positions.
// Usage: npm run spike:photos && npm run spike:scan [-- foto.jpg ...]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { createWorker, PSM } from 'tesseract.js';
import { groupPhrases, matchLabel, type CatalogField, type OcrWord } from '../../src/scan/labels.js';
import { toGray, inkMask } from '../../src/scan/image.js';
import { findBoxRightOf, type FieldBox } from '../../src/scan/boxes.js';
import { overlayPdf } from '../../src/scan/overlay.js';
import { wordsFromTesseract, textBoxes } from '../../src/scan/ocr.js';
import { formatDate, datePattern } from '../../src/pdf/dates.js';
import { FONTS } from '../m0/testdata.js';
import { VAULT, valueFor, EXPECTED } from './vault.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const catalog: CatalogField[] = JSON.parse(readFileSync(new URL('../../data/feldkatalog.json', import.meta.url), 'utf8')).felder;
const truth = JSON.parse(readFileSync(join(dir, 'photos/truth.json'), 'utf8'));
const list = (d: string) => existsSync(d) ? readdirSync(d).filter((f) => /\.jpe?g$/i.test(f)).map((f) => join(d, f)) : [];
const files = [...list(join(dir, 'photos')), ...list(join(dir, 'photos/real')), ...process.argv.slice(2)];

// OCR_MODEL=4.0.0 → fast model (1.3 MB), default 4.0.0_best_int (7.1 MB)
const langPath = fileURLToPath(new URL('../../node_modules/@tesseract.js-data/deu/' + (process.env.OCR_MODEL ?? '4.0.0_best_int'), import.meta.url));
const worker = await createWorker('deu', 1, { langPath, cacheMethod: 'none', gzip: true });
await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT }); // PSM 11: boxes confuse the layout analysis

const iou = (q: [number, number][], r: { x: number; y: number; w: number; h: number }) => {
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  const a = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  const ix = Math.max(0, Math.min(a.x1, r.x + r.w) - Math.max(a.x0, r.x)), iy = Math.max(0, Math.min(a.y1, r.y + r.h) - Math.max(a.y0, r.y));
  const inter = ix * iy;
  return inter / ((a.x1 - a.x0) * (a.y1 - a.y0) + r.w * r.h - inter);
};

const summary: string[] = [];
for (const file of files) {
  const name = basename(file).replace(/\.jpe?g$/i, '');
  const form = name.replace(/-(scan|leicht|schwer)$/, '');
  const bytes = new Uint8Array(readFileSync(file));
  const raw = jpeg.decode(bytes, { useTArray: true });
  const mask = inkMask(toGray(raw));
  const t0 = Date.now();
  const r: any = await worker.recognize(Buffer.from(bytes), {}, { blocks: true });
  const ms = Date.now() - t0;
  const words: OcrWord[] = wordsFromTesseract(r.data);
  const phrases = groupPhrases(words);
  const texts = textBoxes(words);
  const matches = phrases.map((p) => matchLabel(p, catalog)).filter((m) => !!m);

  const rows: { key: string; label: string; value: string; box: FieldBox; iou?: number }[] = [];
  for (const m of matches) {
    const box = findBoxRightOf(m.phrase, mask, raw.width, raw.height, texts);
    let value = valueFor(m.key, m.index);
    if (value === undefined) continue;
    if (/geburtsdatum/.test(m.key)) value = formatDate(value, datePattern({ name: '', kind: 'text', readOnly: false, required: false, label: m.phrase.text, comb: box.width / box.height > 4 && /TTMM/i.test(m.phrase.text) }));
    const k = m.key + (m.index ? '#' + m.index : '');
    const tf = EXPECTED[form]?.[k];
    const tr = tf && name.endsWith('-scan') ? truth.forms[form]?.find((f: any) => f.name === tf) : undefined;
    rows.push({ key: k, label: m.phrase.text, value, box, iou: tr ? iou(box.quad, tr) : undefined });
  }
  const expected = Object.keys(EXPECTED[form] ?? {});
  const found = expected.filter((k) => rows.some((r) => r.key === k));
  const wrong = rows.filter((r) => !expected.includes(r.key));
  const boxes = rows.filter((r) => r.box.kind !== 'guess').length;
  const ious = rows.filter((r) => r.iou !== undefined).map((r) => r.iou!);
  const line = `${name}: OCR ${ms} ms | Beschriftungen erkannt ${found.length}/${expected.length} | falsch ${wrong.length} | Kästchen gefunden ${boxes}/${rows.length}` +
    (ious.length ? ` | Lage (IoU) min ${Math.min(...ious).toFixed(2)} Ø ${(ious.reduce((a, b) => a + b, 0) / ious.length).toFixed(2)}` : '');
  console.log(line); summary.push(line);
  if (process.env.DEBUG) rows.forEach((r) => console.log('   ', r.key, r.box.kind, 'h', Math.round(r.box.height), 'w', Math.round(r.box.width), 'Label-h', Math.round(matches.find((m) => m.phrase.text === r.label)!.phrase.height), JSON.stringify(r.label), JSON.stringify(r.box.quad.map((p) => p.map(Math.round)))));
  const missing = expected.filter((k) => !found.includes(k));
  if (missing.length) console.log('  fehlt:', missing.join(', '));
  const low = rows.filter((r) => r.iou !== undefined && r.iou < 0.7);
  if (low.length) console.log('  Lage ungenau:', low.map((r) => `${r.key} (${r.iou!.toFixed(2)}, ${r.box.kind}, quad ${JSON.stringify(r.box.quad.map((p) => p.map(Math.round)))}, Label ${JSON.stringify(matches.find((m) => m.phrase.text === r.label)?.phrase.bbox)})`).join('; '));
  if (wrong.length) console.log('  falsch:', wrong.map((w) => `${w.key} ← "${w.label}"`).join('; '));

  // Stage 1: copy aid (what to write where), stage 2: overlay PDF
  writeFileSync(join(dir, 'out', name + '-abschreibhilfe.md'),
    `# Abschreibhilfe ${name}\n\n| # | Auf dem Formular steht | Schreiben Sie |\n|---|---|---|\n` +
    rows.map((r, i) => `| ${i + 1} | ${r.label} | **${r.value}** |`).join('\n') + '\n');
  writeFileSync(join(dir, 'out', name + '-ausgefuellt.pdf'),
    await overlayPdf(bytes, raw.width, raw.height, rows.map((r) => ({ box: r.box, value: r.value })), FONTS[0].bytes));
}
await worker.terminate();
writeFileSync(join(dir, 'out', 'ergebnis.txt'), summary.join('\n') + '\n');
