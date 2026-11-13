// Model-based, property-based and fault-injection tests for the vault and its crypto.
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { Catalog, ValueError, type CatalogData, type FieldDef, type Value } from '../src/core/catalog.js';
import { MemoryStorage, type VaultStorage } from '../src/core/storage.js';
import { Vault, AccessError, LockedError, type ModuleManifest } from '../src/core/vault.js';
import { seal, open, newDataKey, wrapKey, unwrapKey, newKdf, newRecoveryCode, WrongSecretError } from '../src/core/crypto.js';

const catalog = new Catalog(JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData);
const FAST = { argon: { memKiB: 256, iterations: 1, parallelism: 1 } };
const ALL: ModuleManifest = { id: 'stammdaten', reads: ['*'], writes: ['*'] };
const RUNS = Number(process.env.FC_RUNS ?? 5000);
const pad = (n: number) => String(n).padStart(2, '0');

// ---------- generators: valid raw input + expected stored value, per field type ----------
const mod97 = (s: string) => { let m = 0; for (const ch of s) m = (m * 10 + Number(ch)) % 97; return m; };
const iban = fc.stringMatching(/^\d{18}$/).map((b) => 'DE' + pad(98 - mod97(b + '131400')) + b);

function valid(def: FieldDef, peopleCount: () => number): fc.Arbitrary<[string, Value]> {
  switch (def.typ) {
    case 'text': case 'name':
      return fc.string({ unit: 'grapheme', minLength: 1, maxLength: 40 }).filter((s) => s.trim() !== '')
        .map((s) => [s, s.trim().replace(/\s+/g, ' ')] as [string, Value]).filter(([, v]) => String(v).length <= 200);
    case 'datum':
      return fc.date({ min: new Date('1900-01-01T00:00:00Z'), max: new Date('2100-12-31T00:00:00Z'), noInvalidDate: true }).map((d) => {
        const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
        return [`${day}.${m}.${y}`, `${y}-${pad(m)}-${pad(day)}`];
      });
    case 'betrag': return fc.integer({ min: 0, max: 99_999_999 }).map((c) => [`${Math.floor(c / 100)},${pad(c % 100)}`, c / 100]);
    case 'zahl': return fc.integer({ min: def.min ?? 0, max: def.max ?? 100000 }).map((n) => [String(n), n]);
    case 'auswahl': return fc.constantFrom(...def.optionen!.map((o) => o.wert)).map((v) => [v, v]);
    case 'plz': return fc.stringMatching(/^\d{5}$/).map((v) => [v, v]);
    case 'iban': return iban.map((v) => [v.replace(/(.{4})/g, '$1 ').toLowerCase(), v]);
    case 'email': return fc.tuple(fc.stringMatching(/^[a-z0-9.]{1,10}$/), fc.stringMatching(/^[a-z]{2,8}$/)).map(([a, b]) => [`${a}@${b}.de`, `${a}@${b}.de`]);
    case 'telefon': return fc.stringMatching(/^\d{6,12}$/).map((d) => [`+49 ${d}`, `+49 ${d}`]);
    case 'person': return fc.nat().map((n) => { const c = peopleCount(); const v = c === 0 || n % 3 === 0 ? 'ich' : `haushalt[${n % c}]`; return [v, v]; });
  }
}
const invalid: Partial<Record<FieldDef['typ'], string[]>> = {
  datum: ['31.02.2020', 'gestern', '1.1.85'], betrag: ['-1', 'zehn', '1,234'], plz: ['1234', 'ABCDE'], iban: ['DE00 0000 0000 0000 0000 00'],
  email: ['keine-mail'], telefon: ['abc'], auswahl: ['gibt-es-nicht'], zahl: ['x', '1e999'], person: ['jemand'],
};

// ---------- reference model ----------
interface Model { single: Record<string, Value>; lists: Record<string, Record<string, Value>[]>; state: unknown }
const keysOf = (m: Model): string[] => {
  const out: string[] = [];
  for (const f of catalog.fields) {
    if (!f.key.includes('[]')) out.push(f.key);
    else { const g = f.key.split('[')[0]; for (let i = 0; i < (m.lists[g]?.length ?? 0); i++) out.push(f.key.replace('[]', `[${i}]`)); }
  }
  return out;
};
const modelGet = (m: Model, key: string): Value | undefined => {
  const def = catalog.parse(key).def;
  if (def.abgeleitet) {
    const p = catalog.parse(key);
    let i = 0; const refs = [...def.abgeleitet.matchAll(/\{([^}]+)\}/g)].map((x) => modelGet(m, p.index === undefined ? x[1] : x[1].replace('[]', `[${p.index}]`)));
    if (refs.every((v) => v === undefined)) return undefined;
    return def.abgeleitet.replace(/\{[^}]+\}/g, () => String(refs[i++] ?? '')).replace(/^[\s,]+|[\s,]+$/g, '').replace(/\s+/g, ' ');
  }
  const { group, index, field } = catalog.parse(key);
  return index === undefined ? m.single[`${group}.${field}`] : m.lists[group]?.[index]?.[field];
};

interface Real { vault: Vault; storage: VaultStorage; pass: string }
async function check(m: Model, r: Real) {
  const access = r.vault.module(ALL);
  const keys = keysOf(m);
  const got = await access.read(keys);
  for (const k of keys) expect(got[k], k).toEqual(modelGet(m, k));
  expect(access.count('haushalt')).toBe(m.lists.haushalt?.length ?? 0);
  expect(access.count('einkommen')).toBe(m.lists.einkommen?.length ?? 0);
}

const singleDefs = catalog.fields.filter((f) => !f.abgeleitet && !f.key.includes('[]'));
const listDefs = (g: string) => catalog.fields.filter((f) => f.key.startsWith(g + '[]'));

class WriteSingle implements fc.AsyncCommand<Model, Real> {
  constructor(readonly key: string, readonly input: string, readonly want: Value) {}
  check() { return true; }
  async run(m: Model, r: Real) { await r.vault.module(ALL).write(this.key, this.input); m.single[this.key] = this.want; await check(m, r); }
  toString() { return `write(${this.key}=${JSON.stringify(this.input)})`; }
}
class Clear implements fc.AsyncCommand<Model, Real> {
  constructor(readonly key: string) {}
  check() { return true; }
  async run(m: Model, r: Real) { await r.vault.module(ALL).write(this.key, ''); delete m.single[this.key]; await check(m, r); }
  toString() { return `clear(${this.key})`; }
}
class WriteInvalid implements fc.AsyncCommand<Model, Real> {
  constructor(readonly key: string, readonly input: string) {}
  check() { return true; }
  async run(m: Model, r: Real) { await expect(r.vault.module(ALL).write(this.key, this.input)).rejects.toThrow(ValueError); await check(m, r); }
  toString() { return `invalid(${this.key}=${JSON.stringify(this.input)})`; }
}
class AddEntry implements fc.AsyncCommand<Model, Real> {
  constructor(readonly group: string, readonly field: string, readonly input: string, readonly want: Value) {}
  check(m: Readonly<Model>) { return (m.lists[this.group]?.length ?? 0) < (catalog.group(this.group)!.max ?? 99); }
  async run(m: Model, r: Real) {
    const n = m.lists[this.group]?.length ?? 0;
    await r.vault.module(ALL).write(`${this.group}[${n}].${this.field}`, this.input);
    (m.lists[this.group] ??= []).push({ [this.field]: this.want });
    await check(m, r);
  }
  toString() { return `add(${this.group}.${this.field}=${JSON.stringify(this.input)})`; }
}
class WriteListField implements fc.AsyncCommand<Model, Real> {
  constructor(readonly group: string, readonly ratio: number, readonly field: string, readonly gen: (count: () => number) => [string, Value]) {}
  check(m: Readonly<Model>) { return (m.lists[this.group]?.length ?? 0) > 0; }
  async run(m: Model, r: Real) {
    const list = m.lists[this.group];
    const i = Math.floor(this.ratio * list.length);
    const [input, want] = this.gen(() => m.lists.haushalt?.length ?? 0);
    await r.vault.module(ALL).write(`${this.group}[${i}].${this.field}`, input);
    list[i][this.field] = want;
    await check(m, r);
  }
  toString() { return `setlist(${this.group}[${this.ratio.toFixed(2)}].${this.field})`; }
}
class Remove implements fc.AsyncCommand<Model, Real> {
  constructor(readonly group: string, readonly ratio: number) {}
  check(m: Readonly<Model>) { return (m.lists[this.group]?.length ?? 0) > 0; }
  async run(m: Model, r: Real) {
    const list = m.lists[this.group];
    const i = Math.floor(this.ratio * list.length);
    await r.vault.module(ALL).remove(this.group, i);
    list.splice(i, 1);
    if (this.group === 'haushalt') for (const inc of m.lists.einkommen ?? []) {
      const mm = /^haushalt\[(\d+)\]$/.exec(String(inc.wer ?? ''));
      if (mm) { const n = +mm[1]; if (n === i) delete inc.wer; else if (n > i) inc.wer = `haushalt[${n - 1}]`; }
    }
    await check(m, r);
  }
  toString() { return `remove(${this.group}[${this.ratio.toFixed(2)}])`; }
}
class Relock implements fc.AsyncCommand<Model, Real> {
  check() { return true; }
  async run(m: Model, r: Real) {
    r.vault.lock();
    await expect(r.vault.module(ALL).read(['person.vorname'])).rejects.toThrow(LockedError);
    r.vault = await Vault.unlock(r.storage, catalog, r.pass);
    await check(m, r);
    expect(r.vault.module(ALL).getState()).toEqual(m.state);
  }
  toString() { return 'lock+unlock'; }
}
class ChangePass implements fc.AsyncCommand<Model, Real> {
  constructor(readonly pass: string) {}
  check() { return true; }
  async run(m: Model, r: Real) {
    const old = r.pass;
    await r.vault.changePassphrase(this.pass);
    r.pass = this.pass;
    if (old !== this.pass) await expect(Vault.unlock(r.storage, catalog, old)).rejects.toThrow(WrongSecretError);
    await check(m, r);
  }
  toString() { return `changePass(${JSON.stringify(this.pass)})`; }
}
class SetState implements fc.AsyncCommand<Model, Real> {
  constructor(readonly state: unknown) {}
  check() { return true; }
  async run(m: Model, r: Real) {
    await r.vault.module(ALL).setState(this.state);
    m.state = structuredClone(this.state);
    expect(r.vault.module(ALL).getState()).toEqual(m.state);
  }
  toString() { return `setState(${JSON.stringify(this.state)?.slice(0, 40)})`; }
}

const passphrase = fc.string({ unit: 'grapheme', minLength: 8, maxLength: 30 }).filter((s) => [...s.normalize('NFC')].length >= 8);

function commands(peopleRef: { m?: Model }) {
  const count = () => peopleRef.m?.lists.haushalt?.length ?? 0;
  const singles = fc.constantFrom(...singleDefs).chain((d) => valid(d, count).map(([i, w]) => new WriteSingle(d.key, i, w)));
  const invalids = fc.constantFrom(...singleDefs.filter((d) => invalid[d.typ])).chain((d) => fc.constantFrom(...invalid[d.typ]!).map((s) => new WriteInvalid(d.key, s)));
  const clears = fc.constantFrom(...singleDefs).map((d) => new Clear(d.key));
  const adds = fc.constantFrom('haushalt', 'einkommen').chain((g) => {
    const first = catalog.def(`${g}[].${g === 'haushalt' ? 'beziehung' : 'art'}`)!;
    return valid(first, count).map(([i, w]) => new AddEntry(g, first.key.split('.')[1], i, w));
  });
  const listWrites = fc.constantFrom('haushalt', 'einkommen').chain((g) => fc.tuple(fc.double({ min: 0, max: 0.999, noNaN: true }), fc.constantFrom(...listDefs(g)), fc.integer())
    .map(([ratio, d, seed]) => new WriteListField(g, ratio, d.key.split('.')[1], (c) => fc.sample(valid(d, c), { numRuns: 1, seed })[0])));
  const removes = fc.tuple(fc.constantFrom('haushalt', 'einkommen'), fc.double({ min: 0, max: 0.999, noNaN: true })).map(([g, r]) => new Remove(g, r));
  return [
    singles, singles, singles, invalids, clears, adds, adds, listWrites, listWrites, listWrites, removes,
    fc.constant(new Relock()), passphrase.map((p) => new ChangePass(p)), fc.jsonValue({ maxDepth: 3 }).map((s) => new SetState(s)),
  ];
}

describe('Tresor gegen Referenzmodell (zufällige Bedienfolgen)', () => {
  it('beliebige Folgen von Schreiben, Löschen, Hinzufügen, Entfernen, Sperren, Passphrase-Wechsel', async () => {
    const ref: { m?: Model } = {};
    await fc.assert(fc.asyncProperty(fc.commands(commands(ref), { maxCommands: 60, size: 'max' }), passphrase, async (cmds, pass) => {
      const storage = new MemoryStorage();
      const { vault } = await Vault.create(storage, catalog, pass, FAST);
      const model: Model = { single: {}, lists: {}, state: undefined };
      ref.m = model;
      await fc.asyncModelRun(() => ({ model, real: { vault, storage, pass } }), cmds);
    }), { numRuns: Math.ceil(RUNS / 25) });
  }, 600_000);
});

describe('Ausfälle des Speichers (Gerätespeicher voll, Absturz beim Schreiben)', () => {
  class Flaky extends MemoryStorage {
    failNext = false;
    async set(key: string, value: unknown) { if (this.failNext) { this.failNext = false; throw new Error('QuotaExceededError'); } return super.set(key, value); }
  }
  it('fehlgeschlagenes Speichern ändert weder Anzeige noch Gerät; danach geht es normal weiter', async () => {
    await fc.assert(fc.asyncProperty(fc.array(fc.tuple(fc.boolean(), fc.constantFrom(...singleDefs).chain((d) => valid(d, () => 0).map(([i, w]) => [d.key, i, w] as const))), { minLength: 1, maxLength: 25, size: 'max' }), async (ops) => {
      const storage = new Flaky();
      const { vault } = await Vault.create(storage, catalog, 'Passphrase-123', FAST);
      const s = vault.module(ALL);
      const model: Record<string, Value> = {};
      for (const [fail, [key, input, want]] of ops) {
        storage.failNext = fail;
        if (fail) await expect(s.write(key, input)).rejects.toThrow(/Quota/);
        else { await s.write(key, input); model[key] = want; }
        const now = await s.read(singleDefs.map((d) => d.key));
        for (const d of singleDefs) expect(now[d.key]).toEqual(model[d.key]);
      }
      const again = await Vault.unlock(storage, catalog, 'Passphrase-123');
      const persisted = await again.module(ALL).read(singleDefs.map((d) => d.key));
      for (const d of singleDefs) expect(persisted[d.key]).toEqual(model[d.key]);
    }), { numRuns: Math.ceil(RUNS / 25) });
  }, 600_000);

  it('Absturz mitten im Einrichten hinterlässt keinen halben Tresor', async () => {
    const storage = new Flaky();
    // fails when writing meta (second write) → no meta → no vault, can be set up again
    let n = 0; const orig = storage.set.bind(storage);
    storage.set = async (k, v) => { if (++n === 2) throw new Error('Absturz'); return orig(k, v); };
    await expect(Vault.create(storage, catalog, 'Passphrase-123', FAST)).rejects.toThrow('Absturz');
    expect(await Vault.exists(storage)).toBe(false);
    storage.set = orig;
    await expect(Vault.create(storage, catalog, 'Passphrase-123', FAST)).resolves.toBeTruthy();
  });

  it('Sperren während laufender Speichervorgänge: kein Absturz, nichts Halbes auf dem Gerät', async () => {
    for (let round = 0; round < 50; round++) {
      const storage = new MemoryStorage();
      const { vault } = await Vault.create(storage, catalog, 'Passphrase-123', FAST);
      const s = vault.module(ALL);
      const writes = Array.from({ length: 20 }, (_, i) => s.write('person.vorname', `Name${i}`).catch((e) => e));
      if (round % 2) vault.lock(); else setTimeout(() => vault.lock(), round % 5);
      const results = await Promise.all(writes);
      for (const r of results) if (r) expect(r).toBeInstanceOf(LockedError);
      const again = await Vault.unlock(storage, catalog, 'Passphrase-123');
      const v = (await again.module(ALL).read(['person.vorname']))['person.vorname'];
      expect(v === undefined || /^Name\d+$/.test(String(v))).toBe(true);
    }
  });
});

describe('Gleichzeitige Zugriffe', () => {
  it('300 gleichzeitige Änderungen: Reihenfolge bleibt, Gerät und Anzeige stimmen überein', async () => {
    const storage = new MemoryStorage();
    const { vault } = await Vault.create(storage, catalog, 'Passphrase-123', FAST);
    const s = vault.module(ALL);
    const ops = fc.sample(fc.constantFrom(...singleDefs).chain((d) => valid(d, () => 0).map(([i, w]) => [d.key, i, w] as const)), { numRuns: 300, seed: 42 });
    await Promise.all(ops.map(([k, i]) => s.write(k, i)));
    const last: Record<string, Value> = {};
    for (const [k, , w] of ops) last[k] = w;
    const mem = await s.read(Object.keys(last));
    const disk = await (await Vault.unlock(storage, catalog, 'Passphrase-123')).module(ALL).read(Object.keys(last));
    expect(mem).toEqual(last);
    expect(disk).toEqual(last);
  });
});

describe('Verschlüsselung', () => {
  it('beliebige Daten: verschlüsseln → entschlüsseln ergibt genau die Daten', async () => {
    const dek = await newDataKey();
    await fc.assert(fc.asyncProperty(fc.jsonValue(), fc.string(), async (v, ctx) => {
      const back = await open(dek, await seal(dek, v, ctx), ctx);
      expect(back).toEqual(JSON.parse(JSON.stringify(v)));
    }), { numRuns: RUNS / 2 });
  });
  it('jedes veränderte Bit, falscher Kontext oder falscher Schlüssel wird erkannt', async () => {
    const dek = await newDataKey(), other = await newDataKey();
    await fc.assert(fc.asyncProperty(fc.jsonValue(), fc.nat(), fc.nat({ max: 7 }), async (v, pos, bit) => {
      const s = await seal(dek, v, 'ctx');
      const bytes = Uint8Array.from(atob(s.data), (c) => c.charCodeAt(0));
      bytes[pos % bytes.length] ^= 1 << bit;
      const tampered = { ...s, data: btoa(String.fromCharCode(...bytes)) };
      await expect(open(dek, tampered, 'ctx')).rejects.toThrow();
      await expect(open(dek, s, 'anderer')).rejects.toThrow();
      await expect(open(other, s, 'ctx')).rejects.toThrow();
    }), { numRuns: RUNS / 5 });
  });
  it('gleiche Daten ergeben nie denselben Geheimtext (zufälliger IV)', async () => {
    const dek = await newDataKey();
    const ivs = new Set<string>();
    for (let i = 0; i < 2000; i++) ivs.add((await seal(dek, 'gleich', 'c')).iv);
    expect(ivs.size).toBe(2000);
  });
  it('Passphrasen mit beliebigen Zeichen; gleiche Eingabe auf anderer Tastatur (NFC/NFD) passt', async () => {
    const dek = await newDataKey();
    const kdf = await newKdf('argon2id', FAST.argon);
    await fc.assert(fc.asyncProperty(fc.string({ unit: 'grapheme', minLength: 1, maxLength: 40 }), fc.string({ unit: 'grapheme', minLength: 1, maxLength: 40 }), async (p, q) => {
      const w = await wrapKey(dek, p, kdf);
      await expect(unwrapKey(w, p.normalize('NFD'))).resolves.toBeTruthy();
      if (p.normalize('NFC') !== q.normalize('NFC')) await expect(unwrapKey(w, q)).rejects.toThrow(WrongSecretError);
    }), { numRuns: 300 });
  }, 120_000);
  it('Wiederherstellungscodes: 20 000 Stück, alle verschieden, Zeichen gleichverteilt (Chi-Quadrat)', () => {
    const counts = new Map<string, number>(); const seen = new Set<string>();
    for (let i = 0; i < 20000; i++) {
      const c = newRecoveryCode(); seen.add(c);
      for (const ch of c.replace(/-/g, '')) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
    expect(seen.size).toBe(20000);
    expect(counts.size).toBe(31);
    const exp = 20000 * 20 / 31;
    const chi = [...counts.values()].reduce((a, o) => a + (o - exp) ** 2 / exp, 0);
    expect(chi).toBeLessThan(59.7); // df = 30, p = 0.001
  });
});

describe('Zugriffsrechte der Module', () => {
  const patterns = ['*', ...Object.keys(catalog.data.gruppen).map((g) => catalog.group(g)!.liste ? `${g}[].*` : `${g}.*`), ...catalog.fields.map((f) => f.key)];
  const concrete = catalog.fields.map((f) => f.key.replace('[]', '[0]'));
  const allowedRef = (pats: string[], key: string) => {
    const generic = key.replace(/\[\d+\]/, '[]');
    const group = key.split(/[[.]/)[0];
    return pats.some((p) => p === '*' || p === generic || p === `${group}.*` || p === `${group}[].*`);
  };
  it('ein Modul liest und schreibt genau die angemeldeten Schlüssel – nicht mehr, nicht weniger', async () => {
    const storage = new MemoryStorage();
    const { vault } = await Vault.create(storage, catalog, 'Passphrase-123', FAST);
    await vault.module(ALL).writeMany({ 'haushalt[0].beziehung': 'kind', 'einkommen[0].art': 'rente' });
    await fc.assert(fc.asyncProperty(fc.uniqueArray(fc.constantFrom(...patterns), { maxLength: 6 }), fc.uniqueArray(fc.constantFrom(...patterns), { maxLength: 4 }), fc.constantFrom(...concrete), async (reads, writes, key) => {
      const m = vault.module({ id: 'test', reads, writes });
      const canRead = allowedRef(reads, key);
      if (canRead) await expect(m.read([key])).resolves.toBeDefined();
      else await expect(m.read([key])).rejects.toThrow(AccessError);
      const def = catalog.parse(key).def;
      if (!allowedRef(writes, key)) await expect(m.write(key, 'x')).rejects.toThrow(AccessError);
      else if (def.abgeleitet) await expect(m.write(key, 'x')).rejects.toThrow(ValueError);
    }), { numRuns: RUNS });
  });
});
