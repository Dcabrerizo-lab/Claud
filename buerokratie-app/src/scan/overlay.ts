// Stage 2: writes confirmed values into the photo and returns a printable PDF (photo as page background).
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { FieldBox } from './boxes.js';

export interface Placement { box: FieldBox; value: string | boolean }

export async function overlayPdf(jpeg: Uint8Array, imgW: number, imgH: number, items: Placement[], fontBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: false }); // see spike-m0.md: subsetting breaks Noto Sans
  const img = await doc.embedJpg(jpeg);
  const k = 595 / imgW; // page width A4 in pt; photo keeps its aspect ratio
  const page = doc.addPage([595, imgH * k]);
  page.drawImage(img, { x: 0, y: 0, width: 595, height: imgH * k });
  const P = ([x, y]: [number, number]) => ({ x: x * k, y: (imgH - y) * k }); // image px → PDF pt (y up)

  for (const { box, value } of items) {
    const [tl, , , bl] = box.quad;
    if (box.kind === 'checkbox') {
      if (value !== true) continue;
      // an "X" across the box
      const [, tr, br] = box.quad;
      for (const [p, q] of [[tl, br], [tr, bl]] as const) page.drawLine({ start: P(p), end: P(q), thickness: Math.max(1, box.height * k * 0.12), color: rgb(0.05, 0.1, 0.45) });
      continue;
    }
    const text = String(value);
    const hPt = box.height * k;
    let size = Math.min(hPt * 0.62, 14);
    const maxW = box.width * k * 0.94;
    while (size > 5 && font.widthOfTextAtSize(text, size) > maxW) size -= 0.5;
    // baseline: a bit above the bottom edge, small inset from the left edge, rotated like the photo
    const a = box.angle; // image coords (y down): positive = clockwise
    const d = { x: Math.cos(a), y: -Math.sin(a) };  // text direction in PDF coords (y up)
    const n = { x: Math.sin(a), y: Math.cos(a) };   // "up" across the line in PDF coords
    const inset = hPt * 0.18;
    const lift = (hPt - size) * 0.42 + size * 0.05; // roughly centred, descenders stay inside
    const o = P(bl);
    page.drawText(text, {
      x: o.x + d.x * inset + n.x * lift,
      y: o.y + d.y * inset + n.y * lift,
      size, font, color: rgb(0.05, 0.1, 0.45), rotate: degrees((-a * 180) / Math.PI),
    });
  }
  return doc.save();
}
