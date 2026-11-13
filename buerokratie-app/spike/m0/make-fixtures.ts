import { writeFileSync } from 'node:fs';
import { FIXTURES } from './fixtures.js';
for (const [name, make] of Object.entries(FIXTURES)) {
  writeFileSync(new URL('forms/' + name, import.meta.url), await make());
  console.log('geschrieben: spike/m0/forms/' + name);
}
