// Several windows/tabs open on the same vault: no change may be lost.
import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { Catalog, type CatalogData } from '../src/core/catalog.js';
import { MemoryStorage, IndexedDbStorage, type VaultStorage } from '../src/core/storage.js';
import { Vault, type ModuleManifest } from '../src/core/vault.js';

const catalog = new Catalog(JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData);
const FAST = { argon: { memKiB: 256, iterations: 1, parallelism: 1 } };
const ALL: ModuleManifest = { id: 'stammdaten', reads: ['*'], writes: ['*'] };
const PASS = 'Passphrase-123';
const RUNS = Number(process.env.FC_RUNS ?? 5000);
const TEXT_KEYS = ['person.vorname', 'person.nachname', 'person.geburtsort', 'person.staatsangehoerigkeit', 'adresse.strasse', 'adresse.ort', 'bank.kontoinhaber'];

async function tabs(storage: VaultStorage, n: number) {
  const first = (await Vault.create(storage, catalog, PASS, FAST)).vault;
  const others = await Promise.all(Array.from({ length: n - 1 }, () => Vault.unlock(storage, catalog, PASS)));
  return [first, ...others];
}

describe.each([['Arbeitsspeicher', () => new MemoryStorage()], ['IndexedDB', () => new IndexedDbStorage('tabs-' + Math.random())]] as const)('mehrere Fenster (%s)', (_n, mk) => {
  it('zwei Fenster schreiben verschiedene Felder gleichzeitig: beide Änderungen bleiben', async () => {
    const storage = mk();
    const [a, b] = await tabs(storage, 2);
    await Promise.all([a.module(ALL).write('person.vorname', 'Ida'), b.module(ALL).write('person.nachname', 'Kaya')]);
    const fresh = await Vault.unlock(storage, catalog, PASS);
    expect(await fresh.module(ALL).read(['person.vorname', 'person.nachname'])).toEqual({ 'person.vorname': 'Ida', 'person.nachname': 'Kaya' });
  });

  it('Fenster sieht Änderungen des anderen nach refresh() und wird benachrichtigt', async () => {
    const storage = mk();
    const [a, b] = await tabs(storage, 2);
    const seen: string[][] = [];
    b.module({ id: 'x', reads: ['person.*'], writes: [] }).onChange((k) => seen.push(k));
    await a.module(ALL).write('person.vorname', 'Ida');
    expect(await b.refresh()).toBe(true);
    expect(await b.refresh()).toBe(false);
    expect((await b.module(ALL).read(['person.vorname']))['person.vorname']).toBe('Ida');
    expect(seen).toEqual([['*']]);
  });

  it('200 gleichzeitige Änderungen aus 3 Fenstern: keine geht verloren', async () => {
    const storage = mk();
    const ts = await tabs(storage, 3);
    const writes: Promise<void>[] = [];
    for (let i = 0; i < 200; i++) writes.push(ts[i % 3].module(ALL).write(`haushalt[0].vorname`, 'x').then(() => undefined).catch(() => undefined));
    await Promise.all(writes);
    // now each tab adds its own distinct entries in parallel
    await Promise.all(ts.map((t, i) => t.module(ALL).write(TEXT_KEYS[i], `Fenster${i}`)));
    const fresh = await Vault.unlock(storage, catalog, PASS);
    expect(await fresh.module(ALL).read(TEXT_KEYS.slice(0, 3))).toEqual({ [TEXT_KEYS[0]]: 'Fenster0', [TEXT_KEYS[1]]: 'Fenster1', [TEXT_KEYS[2]]: 'Fenster2' });
  });

  it('Passphrase-Wechsel im einen und neuer Wiederherstellungscode im anderen Fenster: beides gilt', async () => {
    const storage = mk();
    const [a, b] = await tabs(storage, 2);
    await a.changePassphrase('Neue-Passphrase-A');
    const code = await b.renewRecoveryCode();
    await expect(Vault.unlock(storage, catalog, 'Neue-Passphrase-A')).resolves.toBeInstanceOf(Vault);
    await expect(Vault.recover(storage, catalog, code, 'Wieder-Neu-123')).resolves.toBeInstanceOf(Vault);
  });

  it('in einem Fenster gelöscht: das andere meldet das beim Speichern klar', async () => {
    const storage = mk();
    const [a, b] = await tabs(storage, 2);
    await a.destroy();
    await expect(b.module(ALL).write('person.vorname', 'X')).rejects.toThrow(/anderen Fenster gelöscht/);
  });
});

describe('Zufällige Abläufe in 2–4 Fenstern', () => {
  it('jedes Feld hat am Ende einen der dafür geschriebenen Werte; was nur ein Fenster schrieb, ist exakt da', async () => {
    await fc.assert(fc.asyncProperty(
      fc.integer({ min: 2, max: 4 }),
      fc.array(fc.tuple(fc.nat(), fc.constantFrom(...TEXT_KEYS), fc.stringMatching(/^[A-Za-zÄÖÜäöüß]{1,12}$/), fc.boolean()), { minLength: 1, maxLength: 40, size: 'max' }),
      async (n, ops) => {
        const storage = new MemoryStorage();
        const ts = await tabs(storage, n);
        const writtenBy = new Map<string, Map<number, string>>(); // key → tab → last value written by that tab
        const all = new Map<string, Set<string>>();
        const pending: Promise<unknown>[] = [];
        for (const [t, key, value, wait] of ops) {
          const tab = t % n;
          const p = ts[tab].module(ALL).write(key, value);
          if (!writtenBy.has(key)) writtenBy.set(key, new Map());
          writtenBy.get(key)!.set(tab, value);
          if (!all.has(key)) all.set(key, new Set());
          all.get(key)!.add(value);
          if (wait) await p; else pending.push(p);
          if (wait && t % 5 === 0) await ts[(tab + 1) % n].refresh();
        }
        await Promise.all(pending);
        const final = await (await Vault.unlock(storage, catalog, PASS)).module(ALL).read(TEXT_KEYS);
        for (const [key, byTab] of writtenBy) {
          expect(final[key]).toBeDefined();
          expect(all.get(key)!.has(String(final[key]))).toBe(true);
          if (byTab.size === 1) expect(final[key]).toBe([...byTab.values()][0]);
        }
        // after refresh every tab shows exactly what is stored
        for (const t of ts) { await t.refresh(); expect(await t.module(ALL).read(TEXT_KEYS)).toEqual(final); }
      }), { numRuns: Math.ceil(RUNS / 25) });
  }, 600_000);
});
