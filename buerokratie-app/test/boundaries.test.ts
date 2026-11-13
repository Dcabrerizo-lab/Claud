// Exact boundaries, error paths and known-answer tests (closes gaps found by mutation testing).
import { describe, it, expect, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { Catalog, CatalogError, ValueError, type CatalogData } from '../src/core/catalog.js';
import { MemoryStorage, IndexedDbStorage } from '../src/core/storage.js';
import { Vault, AccessError, LockedError, type ModuleManifest } from '../src/core/vault.js';
import { deriveRaw, newKdf, codeChars, newRecoveryCode, b64, unb64, PBKDF2_DEFAULT, ARGON2_DEFAULT } from '../src/core/crypto.js';

const data = JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData;
const catalog = new Catalog(data);
const FAST = { argon: { memKiB: 256, iterations: 1, parallelism: 1 } };
const ALL: ModuleManifest = { id: 'stammdaten', reads: ['*'], writes: ['*'] };
const hex = (b: Uint8Array) => Buffer.from(b).toString('hex');
const SALT = 'AAECAwQFBgcICQoLDA0ODw=='; // bytes 0..15

describe('Schlüsselableitung: Referenzwerte aus unabhängigen Implementierungen', () => {
  // expected values computed with argon2-cffi (reference C implementation) and Python hashlib
  it('Argon2id stimmt mit der Referenzimplementierung überein', async () => {
    expect(hex(await deriveRaw('Sonnenblume-42', { alg: 'argon2id', salt: SALT, memKiB: 256, iterations: 1, parallelism: 1 })))
      .toBe('ff29324878be8f6915484cfc3689aa9b688d3edf7e2b5acffd8c0a27e1799cde');
    expect(hex(await deriveRaw('Küche Fahrrad', { alg: 'argon2id', salt: SALT, memKiB: 1024, iterations: 2, parallelism: 1 })))
      .toBe('797446e5996f3b72fa51fed5cd44880788e8a12664abf5fa422e9240430bb36c');
    // NFD input (decomposed ü) must give the same key as NFC
    expect(hex(await deriveRaw('Küche Fahrrad'.normalize('NFD'), { alg: 'argon2id', salt: SALT, memKiB: 1024, iterations: 2, parallelism: 1 })))
      .toBe('797446e5996f3b72fa51fed5cd44880788e8a12664abf5fa422e9240430bb36c');
  });
  it('PBKDF2-SHA256 stimmt mit der Referenz überein', async () => {
    expect(hex(await deriveRaw('Sonnenblume-42', { alg: 'pbkdf2-sha256', salt: SALT, iterations: 1000 })))
      .toBe('a16a84d7e702ba1c024b1ebb10070833feb3c3c9e00c184f8995d43a06a0e1cd');
  });
  it('Standardstärken: Argon2id 64 MiB/3, PBKDF2 600 000; Salz 16 Byte, jedes Mal neu', async () => {
    expect(ARGON2_DEFAULT).toEqual({ memKiB: 65536, iterations: 3, parallelism: 1 });
    expect(PBKDF2_DEFAULT).toEqual({ iterations: 600000 });
    const p = await newKdf('pbkdf2-sha256');
    expect(p).toMatchObject({ alg: 'pbkdf2-sha256', iterations: 600000 });
    expect(unb64(p.salt)).toHaveLength(16);
    expect((await newKdf('pbkdf2-sha256')).salt).not.toBe(p.salt);
  });
  it('fehlt WebAssembly, wird PBKDF2 genommen', async () => {
    const huge = await newKdf('argon2id', { memKiB: 2 ** 31, iterations: 1, parallelism: 1 }); // impossible memory → fallback
    expect(huge.alg).toBe('pbkdf2-sha256');
  });
});

describe('Kodierung und Wiederherstellungscode', () => {
  it('base64 hin und zurück für alle Längen 0–70 000 (Blockgrenzen)', () => {
    for (const n of [0, 1, 2, 3, 0x7fff, 0x8000, 0x8001, 70000]) {
      const b = new Uint8Array(n).map((_, i) => (i * 31 + 7) & 255);
      expect(unb64(b64(b))).toEqual(b);
      expect(b64(b)).toBe(Buffer.from(b).toString('base64'));
    }
  });
  it('Byte 247 wird verwendet, 248–255 werden verworfen (keine Bevorzugung einzelner Zeichen)', () => {
    expect(codeChars(Uint8Array.from([0, 30, 31, 247]))).toEqual(['2', 'Z', '2', 'Z']);
    expect(codeChars(Uint8Array.from([248, 249, 255]))).toEqual([]);
  });
  it('Code hat immer genau 20 Zeichen in 5 Gruppen', () => {
    for (let i = 0; i < 2000; i++) expect(newRecoveryCode()).toMatch(/^([2-9A-HJKMNP-Z]{4}-){4}[2-9A-HJKMNP-Z]{4}$/);
  });
});

describe('Feldkatalog: Grenzen und Fehlerwege', () => {
  it('ungültige Schlüssel', () => {
    for (const k of ['', 'person', 'person.', '.vorname', 'Person.vorname', 'person.Vorname', 'person..vorname', 'haushalt[-1].vorname', 'haushalt[a].vorname', 'haushalt[0]', 'person.vorname ', 'x.y'])
      expect(() => catalog.parse(k), k).toThrow(CatalogError);
  });
  it('Listenlänge: haushalt höchstens 15, einkommen höchstens 20', () => {
    expect(catalog.parse('haushalt[14].vorname').index).toBe(14);
    expect(() => catalog.parse('haushalt[15].vorname')).toThrow(/höchstens 15/);
    expect(catalog.parse('einkommen[19].art').index).toBe(19);
    expect(() => catalog.parse('einkommen[20].art')).toThrow(/höchstens 20/);
  });
  it('Beschriftung je Sprache mit Rückfall auf Deutsch; Felder je Gruppe', () => {
    expect(catalog.label('person.vorname', 'en')).toBe('First name(s)');
    expect(catalog.label('person.vorname', 'tr')).toBe('Vorname(n)');
    expect(catalog.label('haushalt[3].vorname', 'de')).toBe('Vorname(n)');
    expect(catalog.fieldsOf('bank').map((f) => f.key)).toEqual(['bank.iban', 'bank.kontoinhaber']);
    expect(catalog.fieldsOf('haushalt').every((f) => f.key.startsWith('haushalt[].'))).toBe(true);
    expect(catalog.fieldsOf('gibtsnicht')).toEqual([]);
  });
  it('Text: 200 Zeichen gehen, 201 nicht', () => {
    expect(catalog.normalize('person.geburtsort', 'a'.repeat(200))).toHaveLength(200);
    expect(() => catalog.normalize('person.geburtsort', 'a'.repeat(201))).toThrow(ValueError);
  });
  it('Betrag: 0 und 10 000 000 gehen, darüber nicht', () => {
    expect(catalog.normalize('wohnen.kaltmiete', '0')).toBe(0);
    expect(catalog.normalize('wohnen.kaltmiete', '10.000.000,00')).toBe(10_000_000);
    expect(() => catalog.normalize('wohnen.kaltmiete', '10.000.000,01')).toThrow(ValueError);
  });
  it('Zahl: GdB 0–100, Wohnfläche ohne Obergrenze; Zahlen dürfen auch als Zahl kommen', () => {
    expect(catalog.normalize('gesundheit.gdb', '0')).toBe(0);
    expect(catalog.normalize('gesundheit.gdb', '100')).toBe(100);
    expect(catalog.normalize('gesundheit.gdb', 50)).toBe(50);
    expect(() => catalog.normalize('gesundheit.gdb', '-1')).toThrow(ValueError);
    expect(() => catalog.normalize('gesundheit.gdb', '101')).toThrow(ValueError);
    expect(catalog.normalize('wohnen.wohnflaeche', '54,5')).toBe(54.5);
    expect(catalog.normalize('wohnen.wohnflaeche', '123456')).toBe(123456);
    expect(catalog.normalize('person.vorname', 0 as unknown as string)).toBe('0');
  });
  it('PLZ, E-Mail, Telefon, Person, Datum: nur der ganze Text zählt', () => {
    for (const bad of ['a12345', '12345a', '123456', ' 1234']) expect(() => catalog.normalize('adresse.plz', bad), bad).toThrow(ValueError);
    for (const bad of ['a@b.de x', 'x a@b.de', 'a@b', '@b.de', 'a b@c.de']) expect(() => catalog.normalize('kontakt.email', bad), bad).toThrow(ValueError);
    expect(catalog.normalize('kontakt.telefon', '09126 12345')).toBe('09126 12345');
    expect(catalog.normalize('kontakt.telefon', '12345')).toBe('12345');
    expect(catalog.normalize('kontakt.telefon', '1'.repeat(25))).toHaveLength(25);
    for (const bad of ['1234', '1'.repeat(26), 'abc+49 1234567', '+49 1234567x', '++49 123456']) expect(() => catalog.normalize('kontakt.telefon', bad), bad).toThrow(ValueError);
    expect(catalog.normalize('einkommen[0].wer', 'haushalt[12]')).toBe('haushalt[12]');
    for (const bad of ['xhaushalt[0]', 'haushalt[0]x', 'haushalt[]', 'Ich']) expect(() => catalog.normalize('einkommen[0].wer', bad), bad).toThrow(ValueError);
    for (const bad of ['x2020-01-01', '2020-01-01x']) expect(() => catalog.normalize('person.geburtsdatum', bad), bad).toThrow(ValueError);
    expect(catalog.normalize('bank.iban', 'DE02\t1203  0000\n0000 2020 51')).toBe('DE02120300000000202051');
  });
  it('fehlerhafte Kataloge werden beim Laden abgelehnt', () => {
    const base = (): CatalogData => JSON.parse(JSON.stringify(data));
    const bad = (mut: (c: CatalogData) => void, msg: RegExp) => { const c = base(); mut(c); expect(() => new Catalog(c)).toThrow(msg); };
    bad((c) => c.felder.push({ ...c.felder[0] }), /Doppelt/);
    bad((c) => c.felder.push({ key: 'nirgends.x', typ: 'text', label: { de: 'x' } }), /Gruppe fehlt/);
    bad((c) => c.felder.push({ key: 'person[].x', typ: 'text', label: { de: 'x' } }), /Listenschreibweise/);
    bad((c) => c.felder.push({ key: 'haushalt.x', typ: 'text', label: { de: 'x' } }), /Listenschreibweise/);
    bad((c) => c.felder.push({ key: 'person.x', typ: 'auswahl', label: { de: 'x' } }), /ohne Optionen/);
    bad((c) => c.felder.push({ key: 'person.x', typ: 'text', label: { de: 'x' }, abgeleitet: '{person.gibtsnicht}' }), /unbekanntem/);
    bad((c) => c.felder.push({ key: 'Person.X', typ: 'text', label: { de: 'x' } }), /Ungültiger/);
  });
});

describe('Tresor: Fehlerwege und Randfälle', () => {
  const make = async (s = new MemoryStorage()) => ({ storage: s, ...(await Vault.create(s, catalog, 'Passphrase-123', FAST)) });

  it('frisch eingerichtet, sofort gesperrt: lässt sich öffnen und ist leer', async () => {
    const { storage, vault } = await make();
    expect(vault.locked).toBe(false);
    vault.lock();
    const v = await Vault.unlock(storage, catalog, 'Passphrase-123');
    expect(v.locked).toBe(false);
    expect(await v.module(ALL).missing(['person.vorname'])).toEqual(['person.vorname']);
  });
  it('neue Passphrase muss die Regeln erfüllen; Stärke der Ableitung bleibt erhalten', async () => {
    const { storage, vault } = await make();
    await expect(vault.changePassphrase('kurz')).rejects.toThrow(/mindestens 8/);
    await vault.changePassphrase('Ganz-Neue-Passphrase');
    expect((await storage.get<any>('meta')).passphrase.kdf).toMatchObject({ alg: 'argon2id', memKiB: 256, iterations: 1, parallelism: 1 });
    const s2 = new MemoryStorage();
    const { vault: p } = await Vault.create(s2, catalog, 'Passphrase-123', { kdf: 'pbkdf2-sha256', pbkdf2: { iterations: 1234 } });
    await p.changePassphrase('Ganz-Neue-Passphrase');
    expect((await s2.get<any>('meta')).passphrase.kdf).toMatchObject({ alg: 'pbkdf2-sha256', iterations: 1234 });
    await expect(Vault.recover(storage, catalog, 'egal', 'kurz')).rejects.toThrow(/mindestens 8/);
  });
  it('Löschen entfernt alles, auch im Arbeitsspeicher-Speicher', async () => {
    const { storage, vault } = await make();
    await vault.destroy();
    expect(vault.locked).toBe(true);
    expect(await storage.keys()).toEqual([]);
    expect(await Vault.exists(storage)).toBe(false);
  });
  it('kein Tresor, fremdes Format, neuere Version, fehlende Daten: klare Meldungen', async () => {
    const s = new MemoryStorage();
    await expect(Vault.unlock(s, catalog, 'x')).rejects.toThrow('Kein Tresor gefunden');
    await s.set('meta', { format: 'anderes' });
    await expect(Vault.unlock(s, catalog, 'x')).rejects.toThrow('Kein Tresor gefunden');
    const { storage } = await make();
    const meta = await storage.get<any>('meta');
    await storage.set('meta', { ...meta, version: 2 });
    await expect(Vault.unlock(storage, catalog, 'Passphrase-123')).rejects.toThrow(/neueren App-Version/);
    await storage.set('meta', meta);
    await storage.delete('data');
    await expect(Vault.unlock(storage, catalog, 'Passphrase-123')).rejects.toThrow('Tresordaten fehlen');
  });
  it('Feld leeren legt keinen leeren Listeneintrag an', async () => {
    const { vault } = await make();
    const s = vault.module(ALL);
    await s.write('haushalt[0].vorname', '');
    expect(s.count('haushalt')).toBe(0);
    await s.writeMany({ 'haushalt[1].vorname': 'B', 'haushalt[0].vorname': 'A' }); // any key order in one batch
    expect(await s.read(['haushalt[0].vorname', 'haushalt[1].vorname'])).toEqual({ 'haushalt[0].vorname': 'A', 'haushalt[1].vorname': 'B' });
    await s.remove('haushalt', 7); await s.remove('haushalt', -1); await s.remove('haushalt', 0.5);
    expect(s.count('haushalt')).toBe(2);
  });
  it('Entfernen nur mit Schreibrecht auf die ganze Liste; zählen nur mit Leserecht', async () => {
    const { vault } = await make();
    await vault.module(ALL).write('haushalt[0].vorname', 'A');
    await expect(vault.module({ id: 'a', reads: [], writes: ['haushalt[].vorname'] }).remove('haushalt', 0)).rejects.toThrow(AccessError);
    await vault.module({ id: 'b', reads: [], writes: ['haushalt[].*'] }).remove('haushalt', 0);
    expect(vault.module(ALL).count('haushalt')).toBe(0);
    expect(() => vault.module({ id: 'c', reads: ['person.*'], writes: [] }).count('haushalt')).toThrow(AccessError);
    expect(vault.module({ id: 'd', reads: ['haushalt[].vorname'], writes: [] }).count('haushalt')).toBe(0);
    expect(vault.module({ id: 'e', reads: ['haushalt.*'], writes: [] }).count('haushalt')).toBe(0);
  });
  it('Änderungsmeldungen: nur sichtbare Schlüssel, auch beim Entfernen; Abmelden wirkt', async () => {
    const { vault } = await make();
    const kids: string[][] = [], names: string[][] = [];
    const offKids = vault.module({ id: 'k', reads: ['haushalt[].vorname'], writes: [] }).onChange((k) => kids.push(k));
    vault.module({ id: 'n', reads: ['person.nachname'], writes: [] }).onChange((k) => names.push(k));
    const s = vault.module(ALL);
    await s.write('haushalt[0].vorname', 'A');
    await s.write('person.vorname', 'X');
    await s.remove('haushalt', 0);
    expect(kids).toEqual([['haushalt[0].vorname'], ['haushalt[0]']]);
    expect(names).toEqual([]);
    offKids();
    await s.write('haushalt[0].vorname', 'B');
    expect(kids).toHaveLength(2);
    const off = vault.onChange(() => { throw new Error('kaputter Zuhörer'); });
    await expect(s.write('person.vorname', 'Y')).resolves.toBeUndefined(); // a broken listener must not break saving
    off();
  });
  it('abgeleitete Felder auch in Listen', async () => {
    const c = JSON.parse(JSON.stringify(data)) as CatalogData;
    c.felder.push({ key: 'haushalt[].name_vorname', typ: 'name', label: { de: 'Name, Vorname' }, abgeleitet: '{haushalt[].nachname}, {haushalt[].vorname}' });
    const cat = new Catalog(c);
    const st = new MemoryStorage();
    const { vault } = await Vault.create(st, cat, 'Passphrase-123', FAST);
    const s = vault.module(ALL);
    await s.writeMany({ 'haushalt[0].vorname': 'Lena', 'haushalt[1].nachname': 'Kaya' });
    expect(await s.read(['haushalt[0].name_vorname', 'haushalt[1].name_vorname'])).toEqual({ 'haushalt[0].name_vorname': 'Lena', 'haushalt[1].name_vorname': 'Kaya' });
    await s.write('haushalt[0].nachname', 'Müller');
    expect((await s.read(['haushalt[0].name_vorname']))['haushalt[0].name_vorname']).toBe('Müller, Lena');
    expect((await s.read(['person.name_vorname']))['person.name_vorname']).toBeUndefined();
  });
  it('Backup-Zeitpunkt wird verschlüsselt gemerkt', async () => {
    const { storage, vault } = await make();
    expect(vault.lastBackup).toBeUndefined();
    await vault.markBackup('2026-11-13T10:00:00.000Z');
    await vault.markBackup();
    const again = await Vault.unlock(storage, catalog, 'Passphrase-123');
    expect(Date.parse(again.lastBackup!)).toBeGreaterThan(Date.parse('2026-11-13T10:00:00.000Z'));
    vault.lock();
    expect(() => vault.lastBackup).toThrow(LockedError);
  });
  it('Moduldaten sind Kopien: spätere Änderungen am Objekt wirken nicht heimlich', async () => {
    const { vault } = await make();
    const m = vault.module(ALL);
    const st = { a: [1] };
    await m.setState(st);
    st.a.push(2);
    const got = m.getState<{ a: number[] }>()!;
    expect(got).toEqual({ a: [1] });
    got.a.push(3);
    expect(m.getState()).toEqual({ a: [1] });
  });
  it('Manifest-Muster werden geprüft', async () => {
    const { vault } = await make();
    for (const p of ['person', 'person.*.x', 'gibtsnicht.*', '*.vorname', 'haushalt[0].vorname']) expect(() => vault.module({ id: 'x', reads: [p], writes: [] }), p).toThrow(/Ungültiges Muster|Unbekannter/);
    expect(() => vault.module({ id: 'x', reads: [], writes: ['person.gibtsnicht'] })).toThrow(/Unbekannter/);
  });
});

describe('Speicher-Backends', () => {
  it('Arbeitsspeicher: setzen, lesen, löschen, Schlüssel', async () => {
    const m = new MemoryStorage();
    await m.set('a', { x: 1 }); await m.set('b', 2);
    expect(await m.get('a')).toEqual({ x: 1 });
    expect((await m.keys()).sort()).toEqual(['a', 'b']);
    await m.delete('a');
    expect(await m.get('a')).toBeUndefined();
    expect(await m.keys()).toEqual(['b']);
  });
  it('IndexedDB: Fehler beim Öffnen und beim Schreiben kommen als Fehler an (nicht hängen bleiben)', async () => {
    const broken = { open: () => { const req: any = {}; setTimeout(() => { req.error = new Error('kaputt'); req.onerror?.(); }); return req; } } as unknown as IDBFactory;
    await expect(new IndexedDbStorage('x', broken).get('a')).rejects.toThrow('kaputt');
    const idb = new IndexedDbStorage('cyclic-' + Math.random());
    const cyclic: any = {}; cyclic.self = cyclic; cyclic.f = () => 1; // functions cannot be stored → DataCloneError
    await expect(idb.set('k', cyclic)).rejects.toThrow();
    await idb.set('k', 'ok');
    expect(await idb.get('k')).toBe('ok');
  });
  it('dauerhafte Speicherung anfragen: Ergebnis des Browsers, sonst false', async () => {
    vi.stubGlobal('navigator', { storage: { persist: async () => true } });
    expect(await IndexedDbStorage.persist()).toBe(true);
    vi.stubGlobal('navigator', { storage: { persist: async () => { throw new Error('nein'); } } });
    expect(await IndexedDbStorage.persist()).toBe(false);
    vi.stubGlobal('navigator', {});
    expect(await IndexedDbStorage.persist()).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('Update-Sicherheit: eingefrorener Tresor aus Version 1', () => {
  const fx = JSON.parse(readFileSync(new URL('./fixtures/vault-v1.json', import.meta.url), 'utf8'));
  const load = () => { const s = new MemoryStorage(); for (const [k, v] of Object.entries(fx.records)) s.map.set(k, v as string); return s; };
  it('öffnet mit Passphrase und liefert alle Werte unverändert', async () => {
    const v = await Vault.unlock(load(), catalog, fx.passphrase);
    const m = v.module(ALL);
    expect(await m.read(['person.vorname', 'person.nachname', 'person.geburtsdatum', 'person.familienstand', 'person.name_vorname', 'adresse.strasse_hausnr',
      'adresse.plz', 'adresse.bundesland', 'bank.iban', 'wohnen.kaltmiete', 'gesundheit.gdb', 'haushalt[0].vorname', 'haushalt[0].geburtsdatum', 'einkommen[0].wer', 'einkommen[0].netto'])).toEqual({
      'person.vorname': 'Jürgen', 'person.nachname': 'Müller-Lüdenscheidt', 'person.geburtsdatum': '1985-02-01', 'person.familienstand': 'verheiratet',
      'person.name_vorname': 'Müller-Lüdenscheidt, Jürgen', 'adresse.strasse_hausnr': 'Hauptstraße 12a', 'adresse.plz': '12345', 'adresse.bundesland': 'BY',
      'bank.iban': 'DE02120300000000202051', 'wohnen.kaltmiete': 512.5, 'gesundheit.gdb': 50, 'haushalt[0].vorname': 'Lena', 'haushalt[0].geburtsdatum': '2015-06-15',
      'einkommen[0].wer': 'haushalt[0]', 'einkommen[0].netto': 255 });
    expect(m.count('haushalt')).toBe(1);
    expect(v.module({ id: 'formular-ausfueller', reads: [], writes: [] }).getState()).toEqual({ vorlagen: [{ hash: 'abc', name: 'Test' }] });
    expect(v.lastBackup).toBe('2026-11-13T12:00:00.000Z');
  });
  it('öffnet mit dem Wiederherstellungscode', async () => {
    const v = await Vault.recover(load(), catalog, fx.recoveryCode, 'Neue Passphrase 2027');
    expect((await v.module(ALL).read(['person.vorname']))['person.vorname']).toBe('Jürgen');
  });
  it('lässt sich nach dem Öffnen weiter bearbeiten', async () => {
    const st = load();
    const v = await Vault.unlock(st, catalog, fx.passphrase);
    await v.module(ALL).write('person.vorname', 'Ida');
    expect((await (await Vault.unlock(st, catalog, fx.passphrase)).module(ALL).read(['person.vorname']))['person.vorname']).toBe('Ida');
  });
});

describe('Weitere Randfälle (aus Mutationstests)', () => {
  const make = async () => { const s = new MemoryStorage(); return { storage: s, ...(await Vault.create(s, catalog, 'Passphrase-123', FAST)) }; };
  it('Person mit eigenem Einkommen entfernen: Zuordnung wird gelöscht; ab der 11. Person rücken Verweise richtig nach', async () => {
    const { vault } = await make();
    const s = vault.module(ALL);
    const many: Record<string, string> = {};
    for (let i = 0; i < 13; i++) many[`haushalt[${i}].vorname`] = `P${i}`;
    await s.writeMany({ ...many, 'einkommen[0].wer': 'haushalt[3]', 'einkommen[1].wer': 'haushalt[12]', 'einkommen[2].wer': 'haushalt[10]', 'einkommen[3].wer': 'ich', 'einkommen[4].wer': 'haushalt[2]' });
    await s.remove('haushalt', 3);
    expect(await s.read(['einkommen[0].wer', 'einkommen[1].wer', 'einkommen[2].wer', 'einkommen[3].wer', 'einkommen[4].wer', 'haushalt[3].vorname', 'haushalt[11].vorname'])).toEqual({
      'einkommen[0].wer': undefined, 'einkommen[1].wer': 'haushalt[11]', 'einkommen[2].wer': 'haushalt[9]', 'einkommen[3].wer': 'ich', 'einkommen[4].wer': 'haushalt[2]',
      'haushalt[3].vorname': 'P4', 'haushalt[11].vorname': 'P12' });
    await s.remove('einkommen', 0); // removing income does not touch any references
    expect(await s.read(['einkommen[0].wer', 'einkommen[1].wer'])).toEqual({ 'einkommen[0].wer': 'haushalt[11]', 'einkommen[1].wer': 'haushalt[9]' });
  });
  it('Entfernen außerhalb der Liste: keine Änderung, keine Meldung', async () => {
    const { vault } = await make();
    const s = vault.module(ALL);
    await s.write('haushalt[0].vorname', 'A');
    const events: string[][] = [];
    s.onChange((k) => events.push(k));
    await s.remove('haushalt', 1);
    expect(events).toEqual([]);
    for (let i = 0; i < 12; i++) await s.write(`haushalt[${i}].vorname`, `P${i}`);
    events.length = 0;
    await s.remove('haushalt', 11);
    expect(events).toEqual([['haushalt[11]']]);
  });
  it('Sperren während Speichervorgängen: danach ist im alten Objekt nichts mehr lesbar', async () => {
    const { vault } = await make();
    const s = vault.module(ALL);
    const pending = [s.write('person.vorname', 'A'), s.write('person.nachname', 'B')].map((p) => p.catch(() => undefined));
    await Promise.resolve();
    vault.lock();
    await Promise.all(pending);
    expect(vault.locked).toBe(true);
    await expect(s.read(['person.vorname'])).rejects.toThrow(LockedError);
    expect(() => s.count('haushalt')).toThrow(LockedError);
  });
  it('Entfernen erlaubt, wenn irgendein Schreibrecht die ganze Liste umfasst', async () => {
    const { vault } = await make();
    await vault.module(ALL).write('haushalt[0].vorname', 'A');
    await vault.module({ id: 'x', reads: [], writes: ['person.vorname', 'haushalt[].*'] }).remove('haushalt', 0);
    expect(vault.module(ALL).count('haushalt')).toBe(0);
  });
  it('Muster und Schlüssel müssen ganz passen', async () => {
    const { vault } = await make();
    expect(() => vault.module({ id: 'x', reads: ['1person.*'], writes: [] })).toThrow(/Ungültiges Muster/);
    expect(() => catalog.parse('1person.vorname')).toThrow(CatalogError);
    const base = (): CatalogData => JSON.parse(JSON.stringify(data));
    for (const key of ['1person.x', 'person.x1']) { const c = base(); c.felder.push({ key, typ: 'text', label: { de: 'x' } }); expect(() => new Catalog(c), key).toThrow(/Ungültiger/); }
    const c = base(); delete c.gruppen.haushalt.max; expect(() => new Catalog(c)).toThrow(/Höchstzahl/);
  });
  it('Betrag: Euro-Zeichen nur hinten, Leerzeichen außen egal, gemischte Trenner abgelehnt', async () => {
    const { parseAmount } = await import('../src/core/catalog.js');
    expect(parseAmount(' 512,50 ')).toBe(512.5);
    expect(parseAmount('512€')).toBe(512);
    expect(parseAmount('512 EUR')).toBe(512);
    expect(parseAmount('512 Euro')).toBe(512);
    for (const bad of ['€ 512', '€512', 'EUR 512', '512 € 3', '1 234.567', 'x1,234.56', '1,234.56x', '1,234.5.6']) expect(parseAmount(bad), bad).toBeUndefined();
    expect(parseAmount('1,234.56')).toBe(1234.56);
  });
  it('IBAN: Prüfung über den ganzen Text, Länge in Deutschland 22, Prüfziffern nur Ziffern', async () => {
    const { ibanValid } = await import('../src/core/catalog.js');
    const mod97 = (s: string) => { let m = 0; for (const ch of s.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55))) m = (m * 10 + Number(ch)) % 97; return m; };
    const valid = (s: string) => mod97(s.slice(4) + s.slice(0, 4)) === 1;
    expect(ibanValid('xDE89370400440532013000')).toBe(false);
    expect(ibanValid('DE89370400440532013000!')).toBe(false);
    expect(ibanValid('DE89 3704 0044 0532 0130 00')).toBe(false); // spaces are removed before, not here
    // German IBAN with 21 characters but valid check digits
    const de21 = (() => { for (let i = 0; i < 1e6; i++) { const b = String(i).padStart(17, '0'); const c = String(98 - mod97(b + '131400')).padStart(2, '0'); const x = 'DE' + c + b; if (valid(x)) return x; } })()!;
    expect(valid(de21)).toBe(true);
    expect(ibanValid(de21)).toBe(false);
    // letter in the check digits but mod 97 passes
    const letter = (() => { for (let i = 0; i < 1e6; i++) { const x = 'DE1' + 'ABCDEFGHIJ'[i % 10] + String(i).padStart(18, '0'); if (valid(x)) return x; } })()!;
    expect(ibanValid(letter)).toBe(false);
  });
});
