// The vault: one encrypted record of master data, accessed only through module handles.
// Storage sees ciphertext only. A module sees only the keys it declared in its manifest.
import { Catalog, refs, type Value, type ParsedKey } from './catalog.js';
import {
  newDataKey, newKdf, freshSalt, wrapKey, unwrapKey, seal, open, newRecoveryCode, normalizeRecoveryCode,
  type Wrapped, type Sealed, ARGON2_DEFAULT, PBKDF2_DEFAULT,
} from './crypto.js';
import type { VaultStorage } from './storage.js';

export const FORMAT = 'stammdaten-tresor';
const DATA_CONTEXT = 'stammdaten-tresor/data/v1';

export interface Meta {
  format: typeof FORMAT;
  version: 1;
  created: string;
  passphrase: Wrapped;
  recovery: Wrapped;
}

/** Plain content (exists only in memory while unlocked). */
export interface VaultData {
  single: Record<string, Record<string, Value>>;       // group → field → value
  lists: Record<string, Record<string, Value>[]>;      // group → entries → field → value
  lastBackup?: string;
  /** Extension point for later modules (saved form templates, deadlines …), keyed by module id. */
  moduleData: Record<string, unknown>;
}

export interface ModuleManifest {
  id: string;            // e.g. "formular-ausfueller", "leistungs-lotse"
  name?: string;
  /** Catalogue keys the module may read: "person.vorname", list fields "haushalt[].vorname", "person.*", "*". */
  reads: string[];
  /** Keys the module may write (same patterns). */
  writes: string[];
}

export class LockedError extends Error { constructor() { super('Tresor ist gesperrt'); this.name = 'LockedError'; } }
export class AccessError extends Error {
  constructor(readonly module: string, readonly key: string, mode: 'lesen' | 'schreiben') {
    super(`Modul ${module} darf ${key} nicht ${mode}`); this.name = 'AccessError';
  }
}

export interface CreateOptions { kdf?: 'argon2id' | 'pbkdf2-sha256'; argon?: typeof ARGON2_DEFAULT; pbkdf2?: typeof PBKDF2_DEFAULT }

export type ChangeListener = (keys: string[], by: string) => void;

export class Vault {
  private dek: CryptoKey | null;
  private data: VaultData | null;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<ChangeListener>();

  private constructor(private readonly storage: VaultStorage, readonly catalog: Catalog, private meta: Meta, dek: CryptoKey, data: VaultData) {
    this.dek = dek; this.data = data;
  }

  // ---------- lifecycle ----------
  static async exists(storage: VaultStorage): Promise<boolean> { return (await storage.get('meta')) !== undefined; }

  /** Creates a new vault. Returns the recovery code, which must be shown to the user exactly once. */
  static async create(storage: VaultStorage, catalog: Catalog, passphrase: string, opts: CreateOptions = {}): Promise<{ vault: Vault; recoveryCode: string }> {
    if (await Vault.exists(storage)) throw new Error('Es gibt schon einen Tresor');
    checkPassphrase(passphrase);
    const dek = await newDataKey();
    const recoveryCode = newRecoveryCode();
    const kdf = () => newKdf(opts.kdf, opts.argon, opts.pbkdf2);
    const meta: Meta = {
      format: FORMAT, version: 1, created: new Date().toISOString(),
      passphrase: await wrapKey(dek, passphrase, await kdf()),
      recovery: await wrapKey(dek, recoveryCode, await kdf()),
    };
    const data: VaultData = { single: {}, lists: {}, moduleData: {} };
    const vault = new Vault(storage, catalog, meta, dek, data);
    await vault.persist();
    await storage.set('meta', meta); // meta last: a half-created vault has no meta and counts as "none"
    return { vault, recoveryCode };
  }

  static async unlock(storage: VaultStorage, catalog: Catalog, passphrase: string): Promise<Vault> {
    const meta = await loadMeta(storage);
    const dek = await unwrapKey(meta.passphrase, passphrase);
    return new Vault(storage, catalog, meta, dek, await loadData(storage, dek));
  }

  /** Forgotten passphrase: unlock with the recovery code and set a new passphrase. */
  static async recover(storage: VaultStorage, catalog: Catalog, recoveryCode: string, newPassphrase: string): Promise<Vault> {
    checkPassphrase(newPassphrase);
    const meta = await loadMeta(storage);
    const dek = await unwrapKey(meta.recovery, normalizeRecoveryCode(recoveryCode));
    const vault = new Vault(storage, catalog, meta, dek, await loadData(storage, dek));
    await vault.changePassphrase(newPassphrase);
    return vault;
  }

  get locked(): boolean { return this.dek === null; }

  /** Forgets key and plain data. The object is unusable afterwards; unlock again with Vault.unlock. */
  lock(): void {
    this.dek = null; this.data = null; this.listeners.clear();
  }

  async changePassphrase(newPassphrase: string): Promise<void> {
    checkPassphrase(newPassphrase);
    const wrapped = await wrapKey(this.key(), newPassphrase, freshSalt(this.meta.passphrase.kdf));
    this.meta = { ...this.meta, passphrase: wrapped };
    await this.serial(() => this.storage.set('meta', this.meta));
  }

  /** Deletes everything. Cannot be undone. */
  async destroy(): Promise<void> {
    for (const k of await this.storage.keys()) await this.storage.delete(k);
    this.lock();
  }

  onChange(fn: ChangeListener): () => void { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  // ---------- module access ----------
  module(manifest: ModuleManifest): ModuleAccess {
    for (const p of [...manifest.reads, ...manifest.writes]) validatePattern(this.catalog, p);
    return new ModuleAccess(this, manifest);
  }

  // ---------- internal (used by ModuleAccess) ----------
  /** @internal */ readRaw(p: ParsedKey): Value | undefined {
    const d = this.content();
    if (p.def.abgeleitet) return this.derive(p);
    if (p.index === undefined) return d.single[p.group]?.[p.field];
    return d.lists[p.group]?.[p.index]?.[p.field];
  }

  private derive(p: ParsedKey): Value | undefined {
    const parts = refs(p.def.abgeleitet);
    const vals = parts.map((r) => this.readRaw(this.catalog.parse(r.replace('[]', `[${p.index}]`)))); // '[]' only occurs in list fields
    if (vals.every((v) => v === undefined)) return undefined; // empty strings are never stored
    let i = 0;
    return p.def.abgeleitet!.replace(/\{[^}]+\}/g, () => String(vals[i++] ?? '')).replace(/^[\s,]+|[\s,]+$/g, '').replace(/\s+/g, ' ');
  }

  /** @internal */ async writeRaw(entries: [ParsedKey, string, Value | undefined][], by: string): Promise<void> {
    // apply list entries in index order, so a batch may create entries 0, 1, 2 … in any key order
    const sorted = [...entries].sort((x, y) => (x[0].index ?? 0) - (y[0].index ?? 0));
    await this.commit((d) => {
      for (const [p, key, v] of sorted) {
        if (p.index === undefined) {
          const g = (d.single[p.group] ??= {});
          if (v === undefined) delete g[p.field]; else g[p.field] = v;
        } else {
          const list = (d.lists[p.group] ??= []);
          if (p.index > list.length) throw new Error(`${key}: Eintrag ${p.index} gibt es nicht (erst ${list.length} Einträge)`);
          if (v === undefined && !list[p.index]) continue; // clearing a field must not create an entry
          const row = (list[p.index] ??= {});
          if (v === undefined) delete row[p.field]; else row[p.field] = v;
        }
      }
    });
    this.emit(entries.map((e) => e[1]), by);
  }

  /** @internal */ listLength(group: string): number { return this.content().lists[group]?.length ?? 0; }

  /** @internal */ async removeListEntry(group: string, index: number, by: string): Promise<void> {
    if (!Number.isInteger(index) || index < 0 || index >= this.listLength(group)) return;
    await this.commit((d) => {
      d.lists[group].splice(index, 1);
      // references to later household entries (e.g. income "wer") shift down
      if (group === 'haushalt') for (const inc of d.lists.einkommen ?? []) {
        const m = /^haushalt\[(\d+)\]$/.exec(String(inc.wer ?? ''));
        if (m) { const n = +m[1]; if (n === index) delete inc.wer; else if (n > index) inc.wer = `haushalt[${n - 1}]`; }
      }
    });
    this.emit([`${group}[${index}]`], by);
  }

  /** @internal */ moduleState(id: string): unknown { return structuredClone(this.content().moduleData[id]); }
  /** @internal */ async setModuleState(id: string, v: unknown): Promise<void> { await this.commit((d) => { d.moduleData[id] = structuredClone(v); }); }

  get lastBackup(): string | undefined { return this.content().lastBackup; }
  async markBackup(at = new Date().toISOString()): Promise<void> { await this.commit((d) => { d.lastBackup = at; }); }

  private key(): CryptoKey { if (!this.dek) throw new LockedError(); return this.dek; }
  private content(): VaultData { if (!this.data) throw new LockedError(); return this.data; }

  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const p = this.queue.then(fn, fn);
    this.queue = p.catch(() => undefined);
    return p;
  }

  /**
   * All-or-nothing change: the mutation is applied to a copy, the copy is encrypted and stored, and only
   * then does it become the current state. If anything fails (invalid entry, storage full, vault locked
   * meanwhile), memory and storage both keep the previous state. Changes run strictly one after another.
   */
  private commit(mutate: (d: VaultData) => void): Promise<void> {
    return this.serial(async () => {
      const dek = this.key();
      const next = structuredClone(this.content());
      mutate(next);
      const sealed = await seal(dek, next, DATA_CONTEXT);
      await this.storage.set('data', sealed);
      if (this.data) this.data = next; // still unlocked: publish the committed state
    });
  }

  private persist(): Promise<void> { return this.commit(() => {}); }

  private emit(keys: string[], by: string) { for (const l of this.listeners) { try { l(keys, by); } catch { /* listener errors must not break saving */ } } }
}

/** The only way for a module to touch master data. */
export class ModuleAccess {
  constructor(private readonly vault: Vault, readonly manifest: ModuleManifest) {}

  private parse(key: string, mode: 'lesen' | 'schreiben'): ParsedKey {
    const p = this.vault.catalog.parse(key);
    const allowed = mode === 'lesen' ? this.manifest.reads : this.manifest.writes;
    if (!allowed.some((pat) => matches(pat, p))) throw new AccessError(this.manifest.id, key, mode);
    return p;
  }

  async read(keys: string[]): Promise<Record<string, Value | undefined>> {
    const out: Record<string, Value | undefined> = {};
    for (const k of keys) out[k] = this.vault.readRaw(this.parse(k, 'lesen'));
    return out;
  }

  /** Keys that have no value yet: the module asks for these once and writes them back. */
  async missing(keys: string[]): Promise<string[]> {
    const vals = await this.read(keys);
    return keys.filter((k) => vals[k] === undefined); // empty input is stored as "no value"
  }

  async write(key: string, value: Value): Promise<void> { await this.writeMany({ [key]: value }); }

  /** Validates all values first; writes nothing if one is invalid. */
  async writeMany(values: Record<string, Value>): Promise<void> {
    const entries: [ParsedKey, string, Value | undefined][] = Object.entries(values).map(([k, v]) => {
      const p = this.parse(k, 'schreiben');
      return [p, k, this.vault.catalog.normalize(k, v)];
    });
    await this.vault.writeRaw(entries, this.manifest.id);
  }

  count(group: string): number {
    if (!this.manifest.reads.some((pat) => pat === '*' || patternGroup(pat) === group)) throw new AccessError(this.manifest.id, group, 'lesen');
    return this.vault.listLength(group);
  }

  async remove(group: string, index: number): Promise<void> {
    if (!this.manifest.writes.some((pat) => pat === '*' || pat === `${group}[].*`)) throw new AccessError(this.manifest.id, `${group}[${index}]`, 'schreiben');
    await this.vault.removeListEntry(group, index, this.manifest.id);
  }

  /** Private storage of the module inside the vault (encrypted like everything else). */
  getState<T>(): T | undefined { return this.vault.moduleState(this.manifest.id) as T | undefined; }
  setState(v: unknown): Promise<void> { return this.vault.setModuleState(this.manifest.id, v); }

  onChange(fn: (keys: string[], by: string) => void): () => void {
    return this.vault.onChange((keys, by) => {
      const visible = keys.filter((k) => {
        const removed = /^([a-z_]+)\[\d+\]$/.exec(k); // "haushalt[3]": a whole list entry was removed
        if (removed) return this.manifest.reads.some((p) => p === '*' || patternGroup(p) === removed[1]);
        try { this.parse(k, 'lesen'); return true; } catch { return false; }
      });
      if (visible.length) fn(visible, by);
    });
  }
}

// ---------- helpers ----------
const patternGroup = (pattern: string) => pattern.split(/[[.]/)[0];

function matches(pattern: string, p: ParsedKey): boolean {
  if (pattern === '*') return true;
  const generic = p.index === undefined ? `${p.group}.${p.field}` : `${p.group}[].${p.field}`;
  if (pattern === generic) return true;
  if (pattern === `${p.group}.*` || pattern === `${p.group}[].*`) return true;
  return false;
}

function validatePattern(c: Catalog, pattern: string) {
  if (pattern === '*') return;
  const m = /^([a-z_]+)(\[\])?\.(\*|[a-z_]+)$/.exec(pattern);
  if (!m || !c.group(m[1])) throw new Error(`Ungültiges Muster im Modul-Manifest: ${pattern}`);
  if (m[3] !== '*' && !c.def(pattern)) throw new Error(`Unbekannter Schlüssel im Modul-Manifest: ${pattern}`);
}

export const MIN_PASSPHRASE = 8;
function checkPassphrase(p: string) {
  if ([...p.normalize('NFC')].length < MIN_PASSPHRASE) throw new Error(`Die Passphrase braucht mindestens ${MIN_PASSPHRASE} Zeichen`);
}

async function loadMeta(storage: VaultStorage): Promise<Meta> {
  const meta = await storage.get<Meta>('meta');
  if (!meta || meta.format !== FORMAT) throw new Error('Kein Tresor gefunden');
  if (meta.version !== 1) throw new Error('Tresor stammt aus einer neueren App-Version');
  return meta;
}

async function loadData(storage: VaultStorage, dek: CryptoKey): Promise<VaultData> {
  const sealed = await storage.get<Sealed>('data');
  if (!sealed) throw new Error('Tresordaten fehlen');
  return open<VaultData>(dek, sealed, DATA_CONTEXT);
}
