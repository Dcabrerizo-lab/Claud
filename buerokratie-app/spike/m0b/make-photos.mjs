// Creates simulated phone photos of the (empty) synthetic test forms:
// pdf.js renders the page, CSS 3D transforms + filters simulate tilt, perspective, shadow and blur,
// and the result is saved as JPEG. Ground truth (field rectangles in scan coordinates) goes to truth.json.
// Real phone photos replace these once available (spike/m0b/photos/real/).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('.', import.meta.url));
const forms = join(dir, '../m0/forms');
const pdfjs = fileURLToPath(new URL('../../node_modules/pdfjs-dist/build/', import.meta.url));
const SCALE = 3; // 216 dpi ≈ a phone photo of an A4 page (1785 × 2526 px)

const VARIANTS = {
  scan: { css: 'none', filter: 'none', shade: 0, q: 92 },
  leicht: { css: 'perspective(2400px) rotateX(6deg) rotateZ(-2.5deg) scale(0.92)', filter: 'blur(0.4px) brightness(0.97)', shade: 0.18, q: 85 },
  schwer: { css: 'perspective(1600px) rotateX(14deg) rotateY(-6deg) rotateZ(6deg) scale(0.85)', filter: 'blur(1px) brightness(0.9) contrast(0.85)', shade: 0.38, q: 60 },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1785, height: 2526 } });
await page.route('http://local/**', (r) => {
  const p = new URL(r.request().url()).pathname;
  if (p === '/') return r.fulfill({ contentType: 'text/html', body: `<style>body{margin:0;background:#6b5a48;overflow:hidden}
    #w{position:relative;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}
    #p{position:relative;box-shadow:0 10px 40px rgba(0,0,0,.5)} #s{position:absolute;inset:0;pointer-events:none}</style>
    <div id=w><div id=p><img id=i><div id=s></div></div></div>` });
  if (p.startsWith('/pdfjs/')) return r.fulfill({ contentType: 'text/javascript', body: readFileSync(join(pdfjs, p.slice(7))) });
  return r.fulfill({ contentType: 'application/pdf', body: readFileSync(join(forms, decodeURIComponent(p.slice(5)))) });
});
await page.goto('http://local/');

const truth = {};
for (const f of ['test-a-wohnen.pdf', 'test-b-familie.pdf', 'test-c-bildung.pdf']) {
  const { png, fields } = await page.evaluate(async ([file, scale]) => {
    const lib = await import('/pdfjs/pdf.mjs');
    lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
    const doc = await lib.getDocument('/pdf/' + file).promise;
    const pg = await doc.getPage(1);
    const vp = pg.getViewport({ scale });
    const c = document.createElement('canvas');
    c.width = vp.width; c.height = vp.height;
    await pg.render({ canvasContext: c.getContext('2d'), viewport: vp, annotationMode: lib.AnnotationMode.ENABLE }).promise;
    const fields = (await pg.getAnnotations()).filter((a) => a.fieldName).map((a) => {
      const [x1, y1, x2, y2] = vp.convertToViewportRectangle(a.rect);
      return { name: a.fieldName, type: a.fieldType, x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
    });
    return { png: c.toDataURL('image/png'), fields };
  }, [f, SCALE]);
  truth[f.replace('.pdf', '')] = fields;
  for (const [v, cfg] of Object.entries(VARIANTS)) {
    await page.evaluate(([src, cfg]) => new Promise((res) => {
      const i = document.getElementById('i'), p = document.getElementById('p'), s = document.getElementById('s');
      const scan = cfg.css === 'none';
      document.body.style.background = scan ? '#fff' : '#6b5a48';
      p.style.boxShadow = scan ? 'none' : '';
      i.onload = () => res();
      i.style.width = scan ? '100vw' : '88vw';
      p.style.transform = cfg.css; p.style.filter = cfg.filter;
      s.style.background = `linear-gradient(115deg, rgba(0,0,0,0) 35%, rgba(40,30,20,${cfg.shade}) 100%)`;
      i.src = src;
    }), [png, cfg]);
    const out = join(dir, 'photos', `${f.replace('.pdf', '')}-${v}.jpg`);
    await page.screenshot({ path: out, type: 'jpeg', quality: cfg.q });
    console.log('Foto:', out.slice(dir.length));
  }
}
writeFileSync(join(dir, 'photos', 'truth.json'), JSON.stringify({ scale: SCALE, forms: truth }, null, 1));
await browser.close();
