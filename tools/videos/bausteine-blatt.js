#!/usr/bin/env node
'use strict';
// Übersichtsblatt aller Figuren, Posen und Gegenstände → PNG (zum Auswählen beim Drehbuchschreiben).
// Aufruf: node bausteine-blatt.js [ziel.png]
const path = require('path');
const F = require('./bausteine/figuren.js');
const kand = [process.env.PLAYWRIGHT_PFAD, 'playwright', path.join(process.cwd(), 'node_modules/playwright'), path.join(__dirname, '../../node_modules/playwright')].filter(Boolean);
let pw; for (const k of kand) { try { pw = require(require.resolve(k)); break; } catch (e) { /* weiter */ } }
if (!pw) throw new Error('Playwright nicht gefunden (PLAYWRIGHT_PFAD setzen)');
const ziel = process.argv[2] || 'bausteine.png';
const items = [
  ...Object.keys(F.POSEN).map((p) => ['lotsin', { pose: p }, `lotsin ${p}`]),
  ['mutter-kind', { mimik: 'sorge' }, 'mutter-kind (sorge)'], ['mutter', {}, 'mutter'], ['kind', {}, 'kind'], ['rentnerin', {}, 'rentnerin'],
  ['student', { pose: 'handy' }, 'student handy'], ['vater', { pose: 'halten', haelt: 'brief' }, 'vater halten+brief'], ['pflegerin', {}, 'pflegerin'], ['rollstuhl', {}, 'rollstuhl'], ['rollstuhl-pflege', {}, 'rollstuhl-pflege'],
  ...Object.keys(F.DINGE).map((n) => [n, {}, n]),
];
let html = '<style>body{margin:0;background:#f2f5f9;display:flex;flex-wrap:wrap;width:1080px;font:16px sans-serif}.o{stroke:#111;stroke-width:7;stroke-linejoin:round;stroke-linecap:round}figure{margin:4px;text-align:center}</style>';
for (const [n, o, l] of items) { const b = F.baustein(n, o); const h = b.h > 300 ? 300 : 120; html += `<figure><svg viewBox="-60 -20 ${b.w + 120} ${b.h + 40}" height="${h}" width="${h * (b.w + 120) / (b.h + 40)}">${b.svg}</svg><figcaption>${l}</figcaption></figure>`; }
(async () => { const br = await pw.chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1000 } }); await p.setContent(html); await p.screenshot({ path: ziel, fullPage: true }); await br.close(); console.log(ziel); })();
