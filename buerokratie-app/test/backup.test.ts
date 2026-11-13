// M3: encrypted backup – export, restore, damaged/foreign files, reminder.
import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { Catalog, type CatalogData } from '../src/core/catalog.js';
import { MemoryStorage, IndexedDbStorage } from '../src/core/storage.js';
import { Vault, parseBackup, BackupError, ReplacedError, MAX_BACKUP_BYTES, UI_MODULE, type ModuleManifest, type Backup } from '../src/core/vault.js';
import { WrongSecretError } from '../src/core/crypto.js';

const catalog = new Catalog(JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData);
const FAST = { argon: { memKiB: 256, iterations: 1, parallelism: 1 } };
const ALL: ModuleManifest = { id: UI_MODULE, reads: ['*'], writes: ['*'] };
const PASS = 'Passphrase-123';
const RUNS = Number(process.env.FC_RUNS ?? 5000);
const inner = (v: Vault) => JSON.parse(JSON.stringify((v as any).data)); // complete plain content, for comparisons only

const CONTENT = {
  'person.vorname': 'Jürgen', 'person.nachname': 'Müller-Lüdenscheidt', 'person.geburtsdatum': '01.02.1985',
  'adresse.plz': '12345', 'bank.iban': 'DE02120300000000202051', 'wohnen.kaltmiete': '512,50',
  'haushalt[0].beziehung': 'kind', 'haushalt[0].vorname': 'Lena', 'einkommen[0].wer': 'haushalt[0]', 'einkommen[0].netto': '255',
};

async function filled(storage = new MemoryStorage()) {
  const { vault, recoveryCode } = await Vault.create(storage, catalog, PASS, FAST);
  await vault.module(ALL).writeMany(CONTENT);
  await vault.module({ id: 'formular-ausfueller', reads: [], writes: [] }).setState({ vorlagen: [{ hash: 'abc' }] });
  return { storage, vault, recoveryCode };
}
const toFile = (b: Backup) => JSON.stringify(b);

describe('Sicherung erstellen und einspielen', () => {
  it('ABNAHME: Export → Löschen → Import ergibt identischen Datenstand', async () => {
    const { storage, vault } = await filled();
    const file = toFile(await vault.exportBackup());
    const before = inner(vault);
    await vault.destroy();
    expect(await Vault.exists(storage)).toBe(false);
    const restored = await Vault.restore(storage, catalog, parseBackup(file), PASS);
    expect(inner(restored)).toEqual(before);
    // and it stays usable after locking
    restored.lock();
    expect(inner(await Vault.unlock(storage, catalog, PASS))).toEqual(before);
  });

  it('auf einem neuen Gerät (leerer Speicher, auch IndexedDB) einspielen', async () => {
    const { vault } = await filled();
    const file = toFile(await vault.exportBackup());
    const device2 = new IndexedDbStorage('geraet2-' + Math.random());
    const v = await Vault.restore(device2, catalog, parseBackup(file), PASS);
    expect(await v.module(ALL).read(['person.vorname', 'haushalt[0].vorname', 'wohnen.kaltmiete'])).toEqual({ 'person.vorname': 'Jürgen', 'haushalt[0].vorname': 'Lena', 'wohnen.kaltmiete': 512.5 });
    expect(await Vault.unlock(device2, catalog, PASS)).toBeInstanceOf(Vault);
  });

  it('Passphrase vergessen und Gerät weg: mit Wiederherstellungscode einspielen, neue Passphrase', async () => {
    const { vault, recoveryCode } = await filled();
    const file = toFile(await vault.exportBackup());
    const s = new MemoryStorage();
    const v = await Vault.restore(s, catalog, parseBackup(file), recoveryCode.toLowerCase().replace(/-/g, ' '), { recoveryCode: true, newPassphrase: 'Ganz neue Phrase' });
    expect((await v.module(ALL).read(['person.vorname']))['person.vorname']).toBe('Jürgen');
    await expect(Vault.unlock(s, catalog, PASS)).rejects.toThrow(WrongSecretError);
    await expect(Vault.unlock(s, catalog, 'Ganz neue Phrase')).resolves.toBeInstanceOf(Vault);
    await expect(Vault.restore(new MemoryStorage(), catalog, parseBackup(file), recoveryCode, { recoveryCode: true, newPassphrase: 'kurz' })).rejects.toThrow(/mindestens 8/);
  });

  it('eine alte Sicherung öffnet mit der Passphrase, die beim Sichern galt', async () => {
    const { vault } = await filled();
    const file = toFile(await vault.exportBackup());
    await vault.changePassphrase('Spätere Passphrase');
    await expect(Vault.restore(new MemoryStorage(), catalog, parseBackup(file), 'Spätere Passphrase')).rejects.toThrow(WrongSecretError);
    await expect(Vault.restore(new MemoryStorage(), catalog, parseBackup(file), PASS)).resolves.toBeInstanceOf(Vault);
  });

  it('falsche Passphrase: der vorhandene Tresor bleibt unangetastet', async () => {
    const { storage, vault } = await filled();
    const file = toFile(await vault.exportBackup());
    const other = await filled(new MemoryStorage());
    const before = [...other.storage.map.entries()];
    await expect(Vault.restore(other.storage, catalog, parseBackup(file), 'falsch falsch')).rejects.toThrow(WrongSecretError);
    expect([...other.storage.map.entries()]).toEqual(before);
    void storage;
  });

  it('Einspielen schlägt mitten drin fehl (Speicher voll): alter Tresor bleibt vollständig erhalten', async () => {
    const { vault } = await filled();
    const file = toFile(await vault.exportBackup());
    const target = await filled(new MemoryStorage());
    const before = [...target.storage.map.entries()];
    target.storage.replaceAll = async () => { throw new Error('QuotaExceededError'); };
    await expect(Vault.restore(target.storage, catalog, parseBackup(file), PASS)).rejects.toThrow(/Quota/);
    expect([...target.storage.map.entries()]).toEqual(before);
  });

  it('die Sicherung enthält keinen Klartext', async () => {
    const { vault } = await filled();
    const file = toFile(await vault.exportBackup());
    for (const plain of ['Jürgen', 'J\\u00fcrgen', 'Müller', 'Lena', '12345', 'DE02', '512', 'vorname', 'haushalt', 'vorlagen', PASS]) expect(file).not.toContain(plain);
  });

  it('Datenteile zweier Sicherungen lassen sich nicht vertauschen', async () => {
    const a = await filled(), b = await filled();
    const fa = await a.vault.exportBackup(), fb = await b.vault.exportBackup();
    const mixed = { ...fa, data: fb.data };
    await expect(Vault.restore(new MemoryStorage(), catalog, parseBackup(toFile(mixed)), PASS)).rejects.toThrow(BackupError);
  });

  it('Sicherung im einen Fenster eingespielt: das andere Fenster meldet das klar statt Daten zu vermischen', async () => {
    const storage = new MemoryStorage();
    const { vault: a } = await Vault.create(storage, catalog, PASS, FAST);
    const b = await Vault.unlock(storage, catalog, PASS);
    const foreign = await filled();
    await Vault.restore(storage, catalog, await foreign.vault.exportBackup(), PASS);
    await expect(b.module(ALL).write('person.vorname', 'X')).rejects.toThrow(ReplacedError);
    await expect(a.refresh()).rejects.toThrow(ReplacedError);
  });
});

describe('Sicherungsdatei prüfen', () => {
  const valid = async () => toFile(await (await filled()).vault.exportBackup());

  it('fremde, kaputte, zu große und neuere Dateien: klare Meldung', async () => {
    const ok = JSON.parse(await valid());
    const code = (t: string) => { try { parseBackup(t); return 'ok'; } catch (e) { return (e as BackupError).code; } };
    expect(code('kein json')).toBe('keine-sicherung');
    expect(code('{}')).toBe('keine-sicherung');
    expect(code('null')).toBe('keine-sicherung');
    expect(code('[]')).toBe('keine-sicherung');
    expect(code(JSON.stringify({ ...ok, format: 'anderes' }))).toBe('keine-sicherung');
    expect(code(JSON.stringify({ ...ok, version: 2 }))).toBe('neuere-version');
    expect(code(JSON.stringify({ ...ok, version: 0 }))).toBe('keine-sicherung');
    expect(code(JSON.stringify({ ...ok, data: { iv: 'x!', data: 'y' } }))).toBe('beschaedigt');
    expect(code(JSON.stringify({ ...ok, meta: { ...ok.meta, recovery: undefined } }))).toBe('beschaedigt');
    expect(code(JSON.stringify({ ...ok, created: 5 }))).toBe('beschaedigt');
    expect(code('x'.repeat(MAX_BACKUP_BYTES + 1))).toBe('zu-gross');
    expect(code(JSON.stringify(ok))).toBe('ok');
  });

  it('manipulierte Schlüsselparameter (z. B. 64 GiB Speicher) werden abgelehnt, bevor gerechnet wird', async () => {
    const ok = JSON.parse(await valid());
    for (const kdf of [
      { ...ok.meta.passphrase.kdf, memKiB: 64 * 1024 * 1024 }, { ...ok.meta.passphrase.kdf, iterations: 10_000 }, { ...ok.meta.passphrase.kdf, parallelism: 0 },
      { alg: 'pbkdf2-sha256', salt: ok.meta.passphrase.kdf.salt, iterations: 1e9 }, { alg: 'pbkdf2-sha256', salt: ok.meta.passphrase.kdf.salt, iterations: 10 },
      { alg: 'scrypt', salt: ok.meta.passphrase.kdf.salt }, { ...ok.meta.passphrase.kdf, memKiB: 1.5 },
    ]) expect(() => parseBackup(JSON.stringify({ ...ok, meta: { ...ok.meta, passphrase: { ...ok.meta.passphrase, kdf } } })), JSON.stringify(kdf)).toThrow(BackupError);
  });

  it('beliebige Dateiinhalte: nie ein anderer Fehler als BackupError', () => {
    fc.assert(fc.property(fc.oneof(fc.string(), fc.json(), fc.anything().map((v) => { try { return JSON.stringify(v) ?? ''; } catch { return ''; } })), (t) => {
      try { parseBackup(t); return false; } catch (e) { return e instanceof BackupError; }
    }), { numRuns: RUNS });
  });

  it('jedes veränderte Zeichen der Datei: Einspielen schlägt fehl oder liefert exakt dieselben Daten – nie andere', async () => {
    const { vault } = await filled();
    const file = toFile(await vault.exportBackup());
    const want = inner(vault);
    await fc.assert(fc.asyncProperty(fc.nat({ max: file.length - 1 }), fc.integer({ min: 32, max: 126 }), async (pos, ch) => {
      const t = file.slice(0, pos) + String.fromCharCode(ch) + file.slice(pos + 1);
      let v: Vault;
      try { v = await Vault.restore(new MemoryStorage(), catalog, parseBackup(t), PASS); }
      catch (e) { expect(e instanceof BackupError || e instanceof WrongSecretError, String(e)).toBe(true); return; }
      const got = inner(v);
      delete got.lastBackup; const w = { ...want }; delete w.lastBackup;
      expect(got).toEqual(w);
    }), { numRuns: Math.ceil(RUNS / 10) });
  }, 600_000);
});

describe('Zufällige Inhalte: Sicherung → neues Gerät → identisch', () => {
  const keys = ['person.vorname', 'person.nachname', 'person.geburtsort', 'adresse.ort', 'kontakt.email', 'wohnen.kaltmiete', 'gesundheit.gdb'];
  it('beliebige Inhalte und Moduldaten kommen unverändert zurück', async () => {
    await fc.assert(fc.asyncProperty(
      fc.dictionary(fc.constantFrom(...keys.slice(0, 4)), fc.string({ unit: 'grapheme', minLength: 1, maxLength: 30 }).filter((s) => s.trim() !== '')),
      fc.integer({ min: 0, max: 5 }), fc.jsonValue({ maxDepth: 3 }),
      async (texts, kids, state) => {
        const s = new MemoryStorage();
        const { vault } = await Vault.create(s, catalog, PASS, FAST);
        const m = vault.module(ALL);
        if (Object.keys(texts).length) await m.writeMany(texts);
        for (let i = 0; i < kids; i++) await m.writeMany({ [`haushalt[${i}].beziehung`]: 'kind', [`haushalt[${i}].vorname`]: `Kind${i}` });
        await vault.module({ id: 'modul-x', reads: [], writes: [] }).setState(state);
        const file = toFile(await vault.exportBackup());
        const v = await Vault.restore(new MemoryStorage(), catalog, parseBackup(file), PASS);
        expect(inner(v)).toEqual(inner(vault));
      }), { numRuns: Math.ceil(RUNS / 25) });
  }, 600_000);
});

describe('Erinnerung an die Sicherung', () => {
  const DAY = 86_400_000;
  it('ohne Inhalt keine Erinnerung; mit Inhalt und ohne Sicherung: „nie“', async () => {
    const s = new MemoryStorage();
    const { vault } = await Vault.create(s, catalog, PASS, FAST);
    await vault.module(ALL).setState({ recoveryConfirmed: true }); // UI settings are not content
    expect(vault.hasContent).toBe(false);
    expect(vault.backupDue()).toBe(false);
    await vault.module(ALL).write('person.vorname', 'Ida');
    expect(vault.backupDue()).toBe('nie');
  });
  it('nach der Sicherung keine Erinnerung; Änderungen erst nach 30 Tagen ohne neue Sicherung', async () => {
    const { vault } = await filled();
    await vault.exportBackup();
    const t0 = Date.parse(vault.lastBackup!);
    expect(vault.backupDue(30, t0 + 40 * DAY)).toBe(false); // nothing changed since
    await vault.module(ALL).write('person.vorname', 'Ida');
    expect(vault.backupDue(30, t0 + 29 * DAY)).toBe(false);
    expect(vault.backupDue(30, t0 + 31 * DAY)).toBe('alt');
    await vault.exportBackup();
    expect(vault.backupDue(30, Date.now() + 31 * DAY)).toBe(false);
  });
  it('Moduldaten zählen als Inhalt, ebenso Entfernen', async () => {
    const s = new MemoryStorage();
    const { vault } = await Vault.create(s, catalog, PASS, FAST);
    await vault.module({ id: 'fristen', reads: [], writes: [] }).setState({ a: 1 });
    expect(vault.backupDue()).toBe('nie');
    await vault.exportBackup();
    const last = vault.lastBackup!;
    await vault.module(ALL).write('haushalt[0].vorname', 'A');
    await vault.exportBackup();
    expect(vault.changedSinceBackup).toBe(false);
    await vault.module(ALL).setState({ recoveryConfirmed: true }); // UI setting: no change of content
    expect(vault.changedSinceBackup).toBe(false);
    await vault.module(ALL).remove('haushalt', 0);
    expect(vault.changedSinceBackup).toBe(true);
    expect(last <= vault.lastBackup!).toBe(true);
  });
});

describe('Dateiprüfung: jede Bedingung einzeln (aus Mutationstests)', () => {
  let ok: any;
  const code = (b: unknown) => { try { parseBackup(typeof b === 'string' ? b : JSON.stringify(b)); return 'ok'; } catch (e) { return (e as BackupError).code; } };
  it('Grundgerüst', async () => {
    ok = JSON.parse(toFile(await (await filled()).vault.exportBackup()));
    expect(code('5')).toBe('keine-sicherung');
    expect(code('"text"')).toBe('keine-sicherung');
    expect(code({ ...ok, version: '1' })).toBe('keine-sicherung');
    expect(code({ ...ok, version: 1.5 })).toBe('neuere-version');
    expect(code({ ...ok, meta: null })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, format: 'x' } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, version: 2 } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, created: 1 } })).toBe('beschaedigt');
    expect(code({ ...ok, data: null })).toBe('beschaedigt');
    expect(code({ ...ok, data: { ...ok.data, iv: '' } })).toBe('beschaedigt');
    expect(code({ ...ok, data: { ...ok.data, iv: 5 } })).toBe('beschaedigt');
    expect(code({ ...ok, data: { ...ok.data, data: 'x' + ok.data.data + '!' } })).toBe('beschaedigt');
    expect(code({ ...ok, data: { ...ok.data, data: '!' + ok.data.data } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, passphrase: { ...ok.meta.passphrase, iv: undefined } } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, recovery: { ...ok.meta.recovery, data: '' } } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, passphrase: { ...ok.meta.passphrase, kdf: { ...ok.meta.passphrase.kdf, salt: undefined } } } })).toBe('beschaedigt');
    expect(code({ ...ok, meta: { ...ok.meta, passphrase: { ...ok.meta.passphrase, kdf: null } } })).toBe('beschaedigt');
    const big = JSON.stringify(ok);
    expect(code(big + ' '.repeat(MAX_BACKUP_BYTES - big.length))).toBe('ok'); // exactly at the limit
  });
  it('Grenzen der Schlüsselparameter exakt', async () => {
    ok ??= JSON.parse(toFile(await (await filled()).vault.exportBackup()));
    const salt = ok.meta.passphrase.kdf.salt;
    const withKdf = (kdf: object) => code({ ...ok, meta: { ...ok.meta, passphrase: { ...ok.meta.passphrase, kdf } } });
    const a = (memKiB: number, iterations: number, parallelism: number) => withKdf({ alg: 'argon2id', salt, memKiB, iterations, parallelism });
    expect(a(8, 1, 1)).toBe('ok'); expect(a(7, 1, 1)).toBe('beschaedigt');
    expect(a(1048576, 50, 16)).toBe('ok'); expect(a(1048577, 1, 1)).toBe('beschaedigt');
    expect(a(8, 0, 1)).toBe('beschaedigt'); expect(a(8, 51, 1)).toBe('beschaedigt');
    expect(a(8, 1, 17)).toBe('beschaedigt');
    const p = (iterations: number) => withKdf({ alg: 'pbkdf2-sha256', salt, iterations });
    expect(p(1000)).toBe('ok'); expect(p(999)).toBe('beschaedigt');
    expect(p(10_000_000)).toBe('ok'); expect(p(10_000_001)).toBe('beschaedigt');
    expect(withKdf({ alg: 'pbkdf2-sha256', salt, iterations: 600000, memKiB: 1e12 })).toBe('ok'); // irrelevant fields are ignored, not used
  });
});

describe('Sicherung: weitere Randfälle (aus Mutationstests)', () => {
  const DAY = 86_400_000;
  it('zu kurze neue Passphrase beim Einspielen mit Code: Gerät bleibt unverändert', async () => {
    const { vault, recoveryCode } = await filled();
    const file = toFile(await vault.exportBackup());
    const target = await filled(new MemoryStorage());
    const before = [...target.storage.map.entries()];
    await expect(Vault.restore(target.storage, catalog, parseBackup(file), 'FALSCH-CODE', { recoveryCode: true, newPassphrase: 'kurz' })).rejects.toThrow(/mindestens 8/);
    await expect(Vault.restore(target.storage, catalog, parseBackup(file), recoveryCode, { recoveryCode: true })).rejects.toThrow(/mindestens 8/);
    expect([...target.storage.map.entries()]).toEqual(before);
  });
  it('Inhalt: geleerte Felder und entfernte Einträge zählen nicht; Moduldaten anderer Module schon', async () => {
    const s = new MemoryStorage();
    const { vault } = await Vault.create(s, catalog, PASS, FAST);
    const m = vault.module(ALL);
    await m.write('person.vorname', 'A'); await m.write('person.vorname', '');
    expect(vault.hasContent).toBe(false);
    await m.write('haushalt[0].vorname', 'B'); await m.remove('haushalt', 0);
    expect(vault.hasContent).toBe(false);
    await m.setState({ recoveryConfirmed: true });
    await vault.module({ id: 'fristen', reads: [], writes: [] }).setState({ x: 1 });
    expect(vault.hasContent).toBe(true);
  });
  it('Moduldaten-Änderung gilt als ungesichert, UI-Einstellung nicht; Grenze genau 30 Tage', async () => {
    const { vault } = await filled();
    await vault.exportBackup();
    expect(vault.changedSinceBackup).toBe(false);
    await vault.module({ id: 'fristen', reads: [], writes: [] }).setState({ x: 2 });
    expect(vault.changedSinceBackup).toBe(true);
    const t0 = Date.parse(vault.lastBackup!);
    expect(vault.backupDue(30, t0 + 30 * DAY)).toBe(false);
    expect(vault.backupDue(30, t0 + 30 * DAY + 1)).toBe('alt');
  });
  it('Sicherung ohne Datensatz auf dem Gerät: klare Meldung', async () => {
    const { storage, vault } = await filled();
    await storage.delete('data');
    await expect(vault.exportBackup()).rejects.toThrow(/fehlen|gelöscht/);
  });
});
