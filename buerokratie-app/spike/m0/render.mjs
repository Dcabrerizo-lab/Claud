// Renders page 1 of every PDF in spike/m0/out/ (or the folder given as argument) with pdf.js (as the app preview will) into PNGs.
// Shows the field appearance streams, i.e. what a viewer/printer actually displays.
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(dir, 'out');
const pdfjs = fileURLToPath(new URL('../../node_modules/pdfjs-dist/build/', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
// Serve everything from a fake local origin; the page itself makes no real network calls.
await page.route('http://local/**', (r) => {
  const p = new URL(r.request().url()).pathname;
  if (p === '/') return r.fulfill({ contentType: 'text/html', body: '<canvas id=c></canvas>' });
  if (p.startsWith('/pdfjs/')) return r.fulfill({ contentType: 'text/javascript', body: readFileSync(join(pdfjs, p.slice(7))) });
  return r.fulfill({ contentType: 'application/pdf', body: readFileSync(join(out, decodeURIComponent(p.slice(5)))) });
});
await page.goto('http://local/');
for (const f of readdirSync(out).filter((f) => f.endsWith('.pdf'))) {
  await page.evaluate(async (file) => {
    const lib = await import('/pdfjs/pdf.mjs');
    lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
    const doc = await lib.getDocument('/pdf/' + file).promise;
    const pg = await doc.getPage(1);
    const vp = pg.getViewport({ scale: 1.5 });
    const c = document.getElementById('c');
    c.width = vp.width; c.height = vp.height;
    await pg.render({ canvasContext: c.getContext('2d'), viewport: vp, annotationMode: lib.AnnotationMode.ENABLE }).promise;
  }, f);
  await page.locator('#c').screenshot({ path: join(out, f.replace('.pdf', '.png')) });
  console.log('gerendert:', f);
}
await browser.close();
