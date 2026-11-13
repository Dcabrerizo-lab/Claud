// Storage backends for the vault. They only ever see encrypted records (see vault.ts):
// nothing in here knows about keys, passphrases or plain data.

export interface VaultStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  /**
   * Atomic compare-and-set: writes `value` only if `matches(current)` holds at the moment of writing.
   * Lets several open windows/tabs share one vault without overwriting each other's changes.
   */
  setIf(key: string, matches: (current: unknown) => boolean, value: unknown): Promise<boolean>;
}

/** For tests and for "try without saving". */
export class MemoryStorage implements VaultStorage {
  readonly map = new Map<string, string>(); // stored as JSON text, like a real backend
  async get<T>(key: string) { const v = this.map.get(key); return v === undefined ? undefined : JSON.parse(v) as T; }
  async set(key: string, value: unknown) { this.map.set(key, JSON.stringify(value)); }
  async delete(key: string) { this.map.delete(key); }
  async keys() { return [...this.map.keys()]; }
  async setIf(key: string, matches: (current: unknown) => boolean, value: unknown) {
    // check and write without any await in between = atomic, like the IndexedDB transaction
    const cur = this.map.get(key);
    if (!matches(cur === undefined ? undefined : JSON.parse(cur))) return false;
    this.map.set(key, JSON.stringify(value));
    return true;
  }
}

/**
 * IndexedDB: works in browsers, the installed web app (PWA) and the Android/iOS WebView (Capacitor).
 * The Leistungs-Lotse uses Capacitor Preferences/localStorage for small plain settings; the vault needs
 * more space and only stores ciphertext, so IndexedDB fits better.
 */
export class IndexedDbStorage implements VaultStorage {
  private db?: Promise<IDBDatabase>;
  constructor(private readonly name = 'stammdaten-tresor', private readonly idb: IDBFactory = globalThis.indexedDB) {}

  private open(): Promise<IDBDatabase> {
    return this.db ??= new Promise((resolve, reject) => {
      const req = this.idb.open(this.name, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('records');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const t = db.transaction('records', mode);
      const req = fn(t.objectStore('records'));
      t.oncomplete = () => resolve(req.result as T);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  get<T>(key: string) { return this.tx<T | undefined>('readonly', (s) => s.get(key)); }
  async set(key: string, value: unknown) { await this.tx('readwrite', (s) => s.put(value, key)); }
  async delete(key: string) { await this.tx('readwrite', (s) => s.delete(key)); }
  async keys() { return (await this.tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys())).map(String); }

  /** Read and conditional write inside ONE readwrite transaction, so no other tab can write in between. */
  async setIf(key: string, matches: (current: unknown) => boolean, value: unknown): Promise<boolean> {
    const db = await this.open();
    return new Promise<boolean>((resolve, reject) => {
      const t = db.transaction('records', 'readwrite');
      const store = t.objectStore('records');
      let ok = false;
      const get = store.get(key);
      get.onsuccess = () => { if (matches(get.result)) { ok = true; store.put(value, key); } };
      t.oncomplete = () => resolve(ok);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  /** Ask the browser not to evict the data under storage pressure (best effort, may be refused). */
  static async persist(): Promise<boolean> {
    try { return (await navigator.storage?.persist?.()) ?? false; } catch { return false; }
  }
}
