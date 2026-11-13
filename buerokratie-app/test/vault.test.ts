// M1: vault, crypto, catalogue, module interface.
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { Catalog, parseAmount, parseDate, ibanValid, ValueError, type CatalogData } from '../src/core/catalog.js';
import { MemoryStorage, IndexedDbStorage } from '../src/core/storage.js';
import { Vault, AccessError, LockedError, type ModuleManifest } from '../src/core/vault.js';
import { WrongSecretError, newRecoveryCode, normalizeRecoveryCode, newKdf } from '../src/core/crypto.js';

const catalog = new Catalog(JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData);
// fast KDF for tests (the real defaults are tested separately)
const FAST = { argon: { memKiB: 1024, iterations: 1, parallelism: 1 } };
const PASS = 'Sonnenblume-42';

const STAMMDATEN: ModuleManifest = { id: 'stammdaten', reads: ['*'], writes: ['*'] };

// Invented test person
const PERSON = {
  'person.vorname': 'Jürgen', 'person.nachname': 'Müller-Lüdenscheidt', 'person.geburtsdatum': '01.02.1985',
  'adresse.strasse': 'Hauptstraße', 'adresse.hausnummer': '12a', 'adresse.plz': '12345', 'adresse.ort': 'Musterstadt',
  'bank.iban': 'DE02 1203 0000 0000 2020 51', 'wohnen.kaltmiete': '512,50',
};

let storage: MemoryStorage;
beforeEach(() => { storage = new MemoryStorage(); });

describe('Feldkatalog', () => {
  it('ist gültig: Schlüssel, Gruppen, Auswahl, Ableitungen', () => {
    expect(catalog.fields.length).toBeGreaterThan(30);
    expect(catalog.parse('haushalt[2].vorname')).toMatchObject({ group: 'haushalt', index: 2, field: 'vorname' });
    expect(() => catalog.parse('haushalt.vorname')).toThrow(/Nummer/);
    expect(() => catalog.parse('person[0].vorname')).toThrow(/keine Liste/);
    expect(() => catalog.parse('person.lieblingsfarbe')).toThrow(/Unbekannt/);
  });
  it('hat für jedes Feld eine deutsche Beschriftung', () => {
    expect(catalog.fields.filter((f) => !f.label.de)).toEqual([]);
  });
  it('normalisiert Eingaben (Datum ISO, Betrag als Zahl, IBAN ohne Leerzeichen)', () => {
    expect(catalog.normalize('person.geburtsdatum', '1.2.1985')).toBe('1985-02-01');
    expect(catalog.normalize('wohnen.kaltmiete', '1.234,56 €')).toBe(1234.56);
    expect(catalog.normalize('bank.iban', 'de02 1203 0000 0000 2020 51')).toBe('DE02120300000000202051');
    expect(catalog.normalize('person.vorname', '  ')).toBeUndefined();
  });
  it('lehnt ungültige Werte mit verständlicher Meldung ab', () => {
    expect(() => catalog.normalize('person.geburtsdatum', '31.02.1985')).toThrow(ValueError);
    expect(() => catalog.normalize('bank.iban', 'DE02 1203 0000 0000 2020 52')).toThrow(/Prüfziffer/);
    expect(() => catalog.normalize('adresse.plz', '1234')).toThrow(/5 Ziffern/);
    expect(() => catalog.normalize('person.familienstand', 'kompliziert')).toThrow(/Auswahl/);
    expect(() => catalog.normalize('person.name_vorname', 'x')).toThrow(/automatisch/);
  });
  it('Hilfsfunktionen', () => {
    expect(parseDate('29.02.2020')).toBe('2020-02-29');
    expect(parseDate('29.02.2021')).toBeUndefined();
    expect(parseAmount('512')).toBe(512);
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount('abc')).toBeUndefined();
    expect(ibanValid('DE02120300000000202051')).toBe(true);
  });
});

describe('Tresor einrichten, sperren, entsperren', () => {
  it('Einrichten → Werte schreiben → Sperren → Entsperren ergibt dieselben Werte', async () => {
    const { vault, recoveryCode } = await Vault.create(storage, catalog, PASS, FAST);
    expect(recoveryCode).toMatch(/^([2-9A-HJKMNP-Z]{4}-){4}[2-9A-HJKMNP-Z]{4}$/);
    await vault.module(STAMMDATEN).writeMany(PERSON);
    vault.lock();
    expect(vault.locked).toBe(true);
    await expect(vault.module(STAMMDATEN).read(['person.vorname'])).rejects.toThrow(LockedError);

    const again = await Vault.unlock(storage, catalog, PASS);
    const v = await again.module(STAMMDATEN).read(Object.keys(PERSON));
    expect(v).toMatchObject({ 'person.vorname': 'Jürgen', 'person.geburtsdatum': '1985-02-01', 'wohnen.kaltmiete': 512.5, 'bank.iban': 'DE02120300000000202051' });
  });

  it('falsche Passphrase: klare Fehlermeldung, kein Zugriff', async () => {
    await Vault.create(storage, catalog, PASS, FAST);
    await expect(Vault.unlock(storage, catalog, 'sonnenblume-42')).rejects.toThrow(WrongSecretError);
  });

  it('ABNAHME: Daten im Speicher sind ohne Passphrase nicht lesbar', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).writeMany(PERSON);
    const everything = [...storage.map.values()].join('\n');
    for (const plain of ['Jürgen', 'J\\u00fcrgen', 'Müller', 'Hauptstraße', 'Musterstadt', '12345', '1985', 'DE02', '512.5', 'vorname', 'person', PASS]) {
      expect(everything).not.toContain(plain);
    }
    // only these two records, both opaque
    expect(Object.keys(JSON.parse(storage.map.get('data')!))).toEqual(['iv', 'data']);
    expect(Object.keys(JSON.parse(storage.map.get('meta')!)).sort()).toEqual(['created', 'format', 'passphrase', 'recovery', 'version']);
  });

  it('manipulierte Daten werden erkannt (AES-GCM)', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    const rec = JSON.parse(storage.map.get('data')!);
    const bytes = Uint8Array.from(atob(rec.data), (c) => c.charCodeAt(0));
    bytes[5] ^= 1;
    rec.data = btoa(String.fromCharCode(...bytes));
    storage.map.set('data', JSON.stringify(rec));
    await expect(Vault.unlock(storage, catalog, PASS)).rejects.toThrow();
  });

  it('Passphrase vergessen: Wiederherstellungscode (auch klein und ohne Striche) + neue Passphrase', async () => {
    const { vault, recoveryCode } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    vault.lock();
    const typed = recoveryCode.toLowerCase().replace(/-/g, ' ');
    const rec = await Vault.recover(storage, catalog, typed, 'Neue-Passphrase-1');
    expect((await rec.module(STAMMDATEN).read(['person.vorname']))['person.vorname']).toBe('Ida');
    await expect(Vault.unlock(storage, catalog, PASS)).rejects.toThrow(WrongSecretError);
    await expect(Vault.unlock(storage, catalog, 'Neue-Passphrase-1')).resolves.toBeInstanceOf(Vault);
    await expect(Vault.recover(storage, catalog, 'AAAA-BBBB-CCCC-DDDD-EEEE', 'egal-egal-1')).rejects.toThrow(WrongSecretError);
  });

  it('Passphrase ändern, ohne die Daten neu zu verschlüsseln', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    const before = storage.map.get('data');
    await vault.changePassphrase('Andere-Passphrase-2');
    expect(storage.map.get('data')).toBe(before);
    await expect(Vault.unlock(storage, catalog, 'Andere-Passphrase-2')).resolves.toBeInstanceOf(Vault);
  });

  it('zu kurze Passphrase wird abgelehnt; zweiter Tresor nicht möglich', async () => {
    await expect(Vault.create(storage, catalog, 'kurz', FAST)).rejects.toThrow(/mindestens 8/);
    await Vault.create(storage, catalog, PASS, FAST);
    await expect(Vault.create(storage, catalog, PASS, FAST)).rejects.toThrow(/schon/);
  });

  it('PBKDF2 als Rückfall funktioniert genauso', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, { kdf: 'pbkdf2-sha256', pbkdf2: { iterations: 1000 } });
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    expect(JSON.parse(storage.map.get('meta')!).passphrase.kdf.alg).toBe('pbkdf2-sha256');
    expect((await (await Vault.unlock(storage, catalog, PASS)).module(STAMMDATEN).read(['person.vorname']))['person.vorname']).toBe('Ida');
  });

  it('Standard-Schlüsselableitung ist Argon2id mit 64 MiB', async () => {
    const kdf = await newKdf();
    expect(kdf).toMatchObject({ alg: 'argon2id', memKiB: 65536, iterations: 3 });
  });

  it('läuft auch auf IndexedDB', async () => {
    const idb = new IndexedDbStorage('test-' + Math.random());
    const { vault } = await Vault.create(idb, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    expect(await Vault.exists(idb)).toBe(true);
    expect((await (await Vault.unlock(idb, catalog, PASS)).module(STAMMDATEN).read(['person.vorname']))['person.vorname']).toBe('Ida');
    await vault.destroy();
    expect(await Vault.exists(idb)).toBe(false);
  });
});

describe('Module: Zugriff nur auf angemeldete Schlüssel', () => {
  const FORMULAR: ModuleManifest = {
    id: 'formular-ausfueller',
    reads: ['person.*', 'adresse.*', 'bank.iban', 'haushalt[].*'],
    writes: ['person.geburtsort'],
  };

  it('liest angemeldete Schlüssel, inkl. abgeleiteter Felder', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).writeMany(PERSON);
    const m = vault.module(FORMULAR);
    expect(await m.read(['person.name_vorname', 'adresse.strasse_hausnr'])).toEqual({
      'person.name_vorname': 'Müller-Lüdenscheidt, Jürgen', 'adresse.strasse_hausnr': 'Hauptstraße 12a',
    });
  });

  it('verweigert nicht angemeldete Schlüssel beim Lesen und Schreiben', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    const m = vault.module(FORMULAR);
    await expect(m.read(['wohnen.kaltmiete'])).rejects.toThrow(AccessError);
    await expect(m.write('person.vorname', 'X')).rejects.toThrow(AccessError);
    await expect(m.write('person.geburtsort', 'Musterdorf')).resolves.toBeUndefined();
  });

  it('fehlende Werte erfragen und einmal zurückschreiben', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    const m = vault.module(FORMULAR);
    expect(await m.missing(['person.geburtsort', 'person.vorname'])).toEqual(['person.geburtsort', 'person.vorname']);
    await m.write('person.geburtsort', 'Musterdorf');
    expect(await m.missing(['person.geburtsort'])).toEqual([]);
  });

  it('schreibt nichts, wenn ein Wert ungültig ist', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    const s = vault.module(STAMMDATEN);
    await expect(s.writeMany({ 'person.vorname': 'Ida', 'adresse.plz': '1' })).rejects.toThrow(ValueError);
    expect(await s.missing(['person.vorname'])).toEqual(['person.vorname']);
  });

  it('ungültiges Manifest fällt sofort auf', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    expect(() => vault.module({ id: 'x', reads: ['person.lieblingsfarbe'], writes: [] })).toThrow(/Unbekannter/);
  });

  it('Haushaltsliste: hinzufügen, entfernen, Verweise rücken nach', async () => {
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    const s = vault.module(STAMMDATEN);
    await s.writeMany({ 'haushalt[0].beziehung': 'partner', 'haushalt[0].vorname': 'Ayşe' });
    await s.writeMany({ 'haushalt[1].beziehung': 'kind', 'haushalt[1].vorname': 'Lena', 'haushalt[1].geburtsdatum': '15.06.2015' });
    await s.writeMany({ 'einkommen[0].wer': 'haushalt[1]', 'einkommen[0].art': 'kindergeld', 'einkommen[0].netto': '255' });
    await expect(s.write('haushalt[5].vorname', 'X')).rejects.toThrow(/gibt es nicht/);
    expect(s.count('haushalt')).toBe(2);
    await s.remove('haushalt', 0);
    expect(s.count('haushalt')).toBe(1);
    expect(await s.read(['haushalt[0].vorname', 'einkommen[0].wer'])).toEqual({ 'haushalt[0].vorname': 'Lena', 'einkommen[0].wer': 'haushalt[0]' });
  });

  it('ABNAHME: ein zweites Modul lässt sich ohne Umbau ergänzen (Dummy „Anspruchs-Check“)', async () => {
    // A Leistungs-Lotse-like module: reads household, rent, income; stores its own result privately.
    const LOTSE: ModuleManifest = {
      id: 'leistungs-lotse',
      reads: ['adresse.plz', 'adresse.bundesland', 'haushalt[].beziehung', 'haushalt[].geburtsdatum', 'wohnen.kaltmiete', 'wohnen.nebenkosten', 'einkommen[].*', 'vermoegen.gesamt'],
      writes: ['adresse.bundesland'],
    };
    const { vault } = await Vault.create(storage, catalog, PASS, FAST);
    await vault.module(STAMMDATEN).writeMany({ ...PERSON, 'haushalt[0].beziehung': 'kind', 'haushalt[0].geburtsdatum': '15.06.2015' });

    const lotse = vault.module(LOTSE);
    const changes: string[] = [];
    lotse.onChange((keys) => changes.push(...keys));

    const v = await lotse.read(['adresse.plz', 'wohnen.kaltmiete', 'haushalt[0].beziehung']);
    const kids = lotse.count('haushalt');
    expect(v['adresse.plz']).toBe('12345');
    expect(kids).toBe(1);
    // asks once for the missing federal state, writes it back for everyone
    expect(await lotse.missing(['adresse.bundesland'])).toEqual(['adresse.bundesland']);
    await lotse.write('adresse.bundesland', 'BY');
    await lotse.setState({ geprueft: '2026-11-13', ergebnis: ['wohngeld'] });
    // the name is not visible to this module
    await expect(lotse.read(['person.nachname'])).rejects.toThrow(AccessError);

    // a change made elsewhere reaches the module, if it may read that key
    await vault.module(STAMMDATEN).write('wohnen.kaltmiete', '530');
    await vault.module(STAMMDATEN).write('person.vorname', 'Ida');
    expect(changes).toEqual(['adresse.bundesland', 'wohnen.kaltmiete']);

    vault.lock();
    const again = await Vault.unlock(storage, catalog, PASS);
    expect(again.module(LOTSE).getState()).toEqual({ geprueft: '2026-11-13', ergebnis: ['wohngeld'] });
    expect((await again.module(STAMMDATEN).read(['adresse.bundesland']))['adresse.bundesland']).toBe('BY');
  });
});

describe('Wiederherstellungscode', () => {
  it('hat 20 Zeichen ohne Verwechsler und wird beim Eintippen tolerant gelesen', () => {
    const codes = new Set(Array.from({ length: 200 }, newRecoveryCode));
    expect(codes.size).toBe(200);
    for (const c of codes) expect(c).not.toMatch(/[01ILO]/);
    expect(normalizeRecoveryCode(' abcd efgh-ijkm nPqr stuv ')).toBe('ABCD-EFGH-IJKM-NPQR-STUV');
  });
});
