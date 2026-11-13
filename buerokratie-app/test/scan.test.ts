// M0b: paper form photo → labels → boxes → copy aid / overlay PDF.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { PDFDocument } from 'pdf-lib';
import { createWorker, PSM } from 'tesseract.js';
import { groupPhrases, matchLabel, prefixScore, type OcrWord, type CatalogField } from '../src/scan/labels.js';
import { findBoxRightOf } from '../src/scan/boxes.js';
import { toGray, inkMask } from '../src/scan/image.js';
import { overlayPdf } from '../src/scan/overlay.js';
import { wordsFromTesseract, textBoxes } from '../src/scan/ocr.js';
import { FONTS } from '../spike/m0/testdata.js';

const catalog: CatalogField[] = JSON.parse(readFileSync(new URL('../spike/m0b/feldkatalog-spike.json', import.meta.url), 'utf8')).felder;
const word = (text: string, x0: number, y0: number, x1: number, y1: number, conf = 90): OcrWord =>
  ({ text, confidence: conf, bbox: { x0, y0, x1, y1 }, baseline: { x0, y0: y1 - 3, x1, y1: y1 - 3 } });

describe('Beschriftungen zuordnen', () => {
  const match = (text: string) => {
    const ws = text.split(' ').map((t, i) => word(t, 100 + i * 80, 100, 170 + i * 80, 120));
    return matchLabel(groupPhrases(ws)[0], catalog);
  };
  it('exakte und typische Beschriftungen', () => {
    expect(match('Familienname')?.key).toBe('person.nachname');
    expect(match('Geburtsdatum (TT.MM.JJJJ)')?.key).toBe('person.geburtsdatum');
    expect(match('Straße, Hausnummer')?.key).toBe('adresse.strasse_hausnr');
  });
  it('längeres Synonym gewinnt: "Name, Vorname" ist nicht nur "Name"', () => {
    expect(match('Name, Vorname der antragstellenden Person')?.key).toBe('person.name_vorname');
  });
  it('"Kind 2:" setzt Liste und Index', () => {
    expect(match('Kind 2: Geburtsdatum')).toMatchObject({ key: 'kind.geburtsdatum', index: 2 });
    expect(match('Name des Kindes')).toMatchObject({ key: 'kind.name_vorname', index: 1 });
  });
  it('verträgt OCR-Fehler und abgeschnittene lange Beschriftungen', () => {
    expect(match('Geburtsdatnm')?.key).toBe('person.geburtsdatum');
    expect(match('Miete ohne Hei:')?.key).toBe('wohnen.kaltmiete');
  });
  it('keine Zuordnung für fremde Beschriftungen und Wortanfänge', () => {
    expect(match('Bemerkungen')).toBeUndefined();
    expect(match('Aktenzeichen (Behörde)')).toBeUndefined();
    expect(prefixScore('Namensänderung', 'Name')).toBeLessThan(0.8);
  });
  it('trennt Beschriftung und Feldinhalt bei großer Lücke', () => {
    const ps = groupPhrases([word('Wohnort', 100, 100, 180, 120), word('Musterstadt', 500, 100, 620, 120)]);
    expect(ps.map((p) => p.text)).toEqual(['Wohnort', 'Musterstadt']);
  });
});

describe('Kästchen finden', () => {
  // synthetic ink mask: label at y 100–120, box 300..700 × 88..132, optionally tilted
  function scene(angleDeg: number) {
    const w = 900, h = 300, mask = new Uint8Array(w * h);
    const a = (angleDeg * Math.PI) / 180, rot = (x: number, y: number): [number, number] => [x * Math.cos(a) - (y - 110) * Math.sin(a), x * Math.sin(a) + (y - 110) * Math.cos(a) + 110];
    const dot = (x: number, y: number) => { const [rx, ry] = rot(x, y); for (let o = 0; o < 2; o++) { const i = Math.round(ry + o) * w + Math.round(rx); if (i >= 0 && i < mask.length) mask[i] = 1; } };
    for (let x = 300; x <= 700; x++) { dot(x, 88); dot(x, 132); }
    for (let y = 88; y <= 132; y++) { dot(300, y); dot(301, y); dot(700, y); dot(701, y); }
    const [lx0, ly0] = rot(100, 100), [lx1, ly1] = rot(180, 120);
    const label = groupPhrases([{ text: 'Wohnort', confidence: 95, bbox: { x0: lx0, y0: Math.min(ly0, ly1), x1: lx1, y1: Math.max(ly0, ly1) }, baseline: { x0: lx0, y0: ly1, x1: lx1, y1: ly1 + 80 * Math.tan(a) } }])[0];
    return { w, h, mask, label };
  }
  it.each([0, 4, -6])('findet Lage und Größe auch bei %s° Neigung', (deg) => {
    const s = scene(deg);
    const box = findBoxRightOf(s.label, s.mask, s.w, s.h);
    expect(box.kind).toBe('box');
    expect(box.width).toBeGreaterThan(380);
    expect(box.width).toBeLessThan(420);
    expect(box.height).toBeGreaterThan(38);
    expect(box.height).toBeLessThan(46);
    expect((box.angle * 180) / Math.PI).toBeCloseTo(deg, 0);
  });
  it('schlägt ohne Kästchen eine Fläche vor (zum Verschieben durch den Nutzer)', () => {
    const s = scene(0);
    s.mask.fill(0);
    expect(findBoxRightOf(s.label, s.mask, s.w, s.h).kind).toBe('guess');
  });
});

describe('Stufe 2: Werte ins Foto schreiben', () => {
  it('erzeugt ein PDF mit Foto und Text', async () => {
    const jpg = new Uint8Array(readFileSync(new URL('../spike/m0b/photos/test-a-wohnen-leicht.jpg', import.meta.url)));
    const box = { quad: [[690, 922], [927, 912], [929, 957], [691, 967]] as [number, number][], angle: -0.04, height: 45, width: 239, kind: 'box' as const };
    const pdf = await overlayPdf(jpg, 1785, 2526, [{ box, value: 'Müller-Lüdenscheidt' }], FONTS[0].bytes);
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getWidth()).toBe(595);
  });
});

describe('Ganze Strecke mit Offline-Texterkennung', () => {
  it('Foto "leicht": alle 7 Beschriftungen, alle Kästchen gefunden', async () => {
    const file = new URL('../spike/m0b/photos/test-a-wohnen-leicht.jpg', import.meta.url);
    const bytes = readFileSync(file);
    const langPath = fileURLToPath(new URL('../node_modules/@tesseract.js-data/deu/4.0.0_best_int', import.meta.url));
    const worker = await createWorker('deu', 1, { langPath, cacheMethod: 'none', gzip: true });
    try {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const r: any = await worker.recognize(bytes, {}, { blocks: true });
      const words = wordsFromTesseract(r.data);
      const raw = jpeg.decode(bytes, { useTArray: true });
      const mask = inkMask(toGray(raw));
      const found = groupPhrases(words).map((p) => matchLabel(p, catalog)).filter((m) => !!m);
      expect(found.map((m) => m.key).sort()).toEqual(['adresse.ort', 'adresse.plz', 'adresse.strasse_hausnr', 'person.geburtsdatum', 'person.nachname', 'person.vorname', 'wohnen.kaltmiete']);
      const boxes = found.map((m) => findBoxRightOf(m.phrase, mask, raw.width, raw.height, textBoxes(words)));
      expect(boxes.every((b) => b.kind === 'box')).toBe(true);
    } finally {
      await worker.terminate();
    }
  }, 60_000);
});
