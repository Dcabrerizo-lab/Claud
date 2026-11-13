// Adapter from tesseract.js results to neutral OCR words (the Android app will feed ML Kit results instead).
import type { OcrWord } from './labels.js';

/** tesseract.js `recognize(..., { blocks: true })` → words; the line baseline is copied to each word. */
export function wordsFromTesseract(data: any): OcrWord[] {
  const out: OcrWord[] = [];
  for (const b of data?.blocks ?? []) for (const p of b.paragraphs ?? []) for (const l of p.lines ?? []) {
    for (const w of l.words ?? []) out.push({ text: w.text, confidence: w.confidence, bbox: w.bbox, baseline: w.baseline ?? l.baseline });
  }
  return out;
}

/**
 * Areas that are certainly text (used to keep letters from being mistaken for box edges).
 * OCR also "reads" box borders as garbage words ("L", "1]", "|"), so only plausible words count:
 * at least two letters, decent confidence, normal text height.
 */
export function textBoxes(words: OcrWord[]): OcrWord['bbox'][] {
  const hs = words.map((w) => w.bbox.y1 - w.bbox.y0).sort((a, b) => a - b);
  const medH = hs[Math.floor(hs.length / 2)] ?? 0;
  return words
    .filter((w) => w.confidence > 60 && (w.text.match(/\p{L}/gu)?.length ?? 0) >= 2 && w.bbox.y1 - w.bbox.y0 < medH * 1.6)
    .map((w) => w.bbox);
}
