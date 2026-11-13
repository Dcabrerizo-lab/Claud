// M0 spike runner: inventories every PDF in spike/m0/forms/ (synthetic fixtures and, once
// available, real official forms in forms/real/), fills those with test data, writes spike/m0/out/.
// Usage: npm run spike:fixtures && npm run spike [-- extra.pdf ...]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from '../../src/pdf/inspect.js';
import { fill, readValues } from '../../src/pdf/fill.js';
import { VALUES, FONTS } from './testdata.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const list = (d: string) => existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.pdf')).map((f) => join(d, f)) : [];
const files = [...list(join(dir, 'forms')), ...list(join(dir, 'forms/real')), ...process.argv.slice(2)];

for (const file of files) {
  const bytes = new Uint8Array(readFileSync(file));
  const name = basename(file);
  const info = await inspect(bytes);
  console.log(`\n## ${name}\nSeiten ${info.pageCount}, Felder ${info.fields.length}, verschlüsselt ${info.encrypted}, XFA ${info.hasXfa}, NeedAppearances ${info.needAppearances}`);
  const kinds: Record<string, number> = {};
  info.fields.forEach((f) => { kinds[f.kind] = (kinds[f.kind] ?? 0) + 1; });
  console.log('Feldtypen', kinds, '| mit Beschriftung (TU):', info.fields.filter((f) => f.label).length,
    '| Datumsformat-Skript:', info.fields.filter((f) => f.dateFormat).length, '| Kammfelder:', info.fields.filter((f) => f.comb).length);
  const values = VALUES[name];
  if (!values) continue;
  const res = await fill(bytes, values, { fonts: FONTS, dropXfa: true });
  if (res.problems.length) console.log('Probleme:', res.problems);
  if (!res.bytes) continue;
  writeFileSync(join(dir, 'out', name), res.bytes);
  const back = await readValues(res.bytes);
  const wrong = Object.entries(values).filter(([k, v]) => back[k] !== v);
  console.log(`befüllt ${res.filled.length}/${Object.keys(values).length}, Rundreise-Abweichungen: ${wrong.length ? JSON.stringify(wrong) : 'keine'}`);
  const flat = await fill(bytes, values, { fonts: FONTS, dropXfa: true, flatten: true });
  if (flat.bytes) writeFileSync(join(dir, 'out', name.replace('.pdf', '-flach.pdf')), flat.bytes);
  else console.log('Flatten fehlgeschlagen:', flat.problems);
}
