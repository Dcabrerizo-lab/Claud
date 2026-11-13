// M0 spike: each finding in docs/spike-m0.md is backed by one of these tests.
import { describe, it, expect, beforeAll } from 'vitest';
import { PDFDocument, PDFName } from 'pdf-lib';
import { formWohnen, formFamilie, formBildung } from '../spike/m0/fixtures.js';
import { VALUES, FONTS } from '../spike/m0/testdata.js';
import { inspect, hasXfaLayer } from '../src/pdf/inspect.js';
import { fill, readValues } from '../src/pdf/fill.js';
import { formatDate, datePattern } from '../src/pdf/dates.js';

let A: Uint8Array, B: Uint8Array, C: Uint8Array;
beforeAll(async () => { [A, B, C] = await Promise.all([formWohnen(), formFamilie(), formBildung()]); });

describe('Felder auslesen', () => {
  it('liefert Name, Typ, Beschriftung (TU), Kammfeld, Länge', async () => {
    const info = await inspect(A);
    const gd = info.fields.find((f) => f.name === 'Antragsteller.Geburtsdatum')!;
    expect(gd).toMatchObject({ kind: 'text', label: 'Geburtsdatum (TTMMJJJJ)', comb: true, maxLength: 8, page: 0 });
    expect(info.fields.find((f) => f.name === 'Straße_Hausnummer')?.label).toBe('Straße, Hausnummer');
  });
  it('erkennt Häkchen-Exportwert, Optionsfelder, Schreibschutz', async () => {
    const info = await inspect(A);
    expect(info.fields.find((f) => f.name === 'Mieter')?.onValue).toBe('Ja');
    expect(info.fields.find((f) => f.name === 'Familienstand')?.options).toEqual(['ledig', 'verheiratet', 'geschieden', 'verwitwet']);
    expect(info.fields.find((f) => f.name === 'Aktenzeichen')?.readOnly).toBe(true);
  });
  it('liest das Datumsformat aus dem Formatskript', async () => {
    const info = await inspect(B);
    expect(info.fields.filter((f) => f.dateFormat === 'dd.mm.yyyy').map((f) => f.name))
      .toEqual(['txtGebDat', 'Kind1_GebDat', 'Kind2_GebDat', 'Kind3_GebDat']);
    expect(info.fields.find((f) => f.name === 'Beruf')).toMatchObject({ kind: 'dropdown', editable: true });
  });
  it('erkennt XFA, obwohl pdf-lib es beim Öffnen des Formulars löscht', async () => {
    expect((await inspect(C)).hasXfa).toBe(true);
    const doc = await PDFDocument.load(C);
    expect(hasXfaLayer(doc)).toBe(true);
    doc.getForm(); // pdf-lib: removes XFA silently (console warning only)
    expect(hasXfaLayer(doc)).toBe(false);
  });
});

describe('Schrift und Zeichen', () => {
  const name = 'Antragsteller.Name';
  it('Standardschrift (Helvetica/WinAnsi): deutsche Umlaute und ß gehen', async () => {
    const r = await fill(A, { [name]: 'Müller-Lüdenscheidt', 'Straße_Hausnummer': 'Hauptstraße 1' });
    expect(r.problems).toEqual([]);
    expect((await readValues(r.bytes!))[name]).toBe('Müller-Lüdenscheidt');
  });
  it.each(['Şahin', 'Yılmaz', 'Łukasz', 'Ștefan', 'Коваленко', 'محمد'])('Standardschrift scheitert an "%s" (erst beim Speichern)', async (v) => {
    const r = await fill(A, { [name]: v });
    expect(r.filled).toEqual([name]); // setText itself does not complain …
    expect(r.bytes).toBeUndefined(); // … saving does
    expect(r.problems[0].reason).toMatch(/WinAnsi cannot encode/);
  });
  it('eingebettete Noto Sans: Türkisch, Polnisch, Rumänisch, Kyrillisch gehen in die Rundreise', async () => {
    const values = { [name]: 'Şahin Yılmaz', 'Antragsteller.Vorname': 'Łucja Ștefănescu', Ort: 'Коваленко' };
    const r = await fill(A, values, { fonts: FONTS });
    expect(r.problems).toEqual([]);
    expect(await readValues(r.bytes!)).toMatchObject(values);
  });
  it('wählt je Wert eine Schrift mit allen Zeichen, sonst klare Meldung', async () => {
    const latinOnly = await fill(A, { [name]: 'محمد' }, { fonts: [FONTS[0]] });
    expect(latinOnly.problems[0].reason).toMatch(/Keine eingebettete Schrift/);
    const withArabic = await fill(A, { [name]: 'محمد' }, { fonts: FONTS });
    expect(withArabic.problems).toEqual([]);
    const doc = await PDFDocument.load(withArabic.bytes!);
    expect(doc.getForm().getTextField(name).getAlignment()).toBe(2); // right-aligned (TextAlignment.Right)
  });
});

describe('Feldarten und Schutzregeln', () => {
  it('Kammfeld Datum: TTMMJJJJ passt, TT.MM.JJJJ ist zu lang', async () => {
    expect((await fill(A, { 'Antragsteller.Geburtsdatum': '01021985' })).problems).toEqual([]);
    const r = await fill(A, { 'Antragsteller.Geburtsdatum': '01.02.1985', PLZ: '123456' });
    expect(r.problems.map((p) => p.field)).toEqual(['Antragsteller.Geburtsdatum', 'PLZ']);
  });
  it('Häkchen schreibt den Exportwert des Formulars (/Ja)', async () => {
    const r = await fill(A, { Mieter: true });
    const doc = await PDFDocument.load(r.bytes!);
    expect(String(doc.getForm().getCheckBox('Mieter').acroField.dict.get(PDFName.of('V')))).toBe('/Ja');
  });
  it('schreibgeschützte Felder werden nicht befüllt (pdf-lib würde es tun)', async () => {
    const r = await fill(A, { Aktenzeichen: 'X' });
    expect(r.problems[0].reason).toMatch(/schreibgeschützt/);
    expect((await fill(A, { Aktenzeichen: 'X' }, { allowReadOnly: true })).problems).toEqual([]);
  });
  it('Auswahlliste: ungültige Werte werden abgelehnt (pdf-lib würde sie speichern), freie Eingabe nur bei editierbaren', async () => {
    const r = await fill(B, { 'Staatsangehörigkeit': 'eritreisch', Beruf: 'Pflegehelferin', Familienstand: 'x' });
    expect(r.problems.map((p) => p.field)).toEqual(['Staatsangehörigkeit', 'Familienstand']);
    expect(r.filled).toEqual(['Beruf']);
  });
  it('XFA-Formulare: ohne Zustimmung abgelehnt, mit dropXfa befüllt und XFA entfernt', async () => {
    expect((await fill(C, { Name: 'Test' })).problems[0].reason).toMatch(/XFA/);
    const r = await fill(C, { Name: 'Test', Mittagessen: true }, { dropXfa: true });
    expect(r.problems).toEqual([]);
    expect((await inspect(r.bytes!)).hasXfa).toBe(false);
  });
  it('Glätten (flatten) entfernt alle Felder', async () => {
    const r = await fill(A, VALUES['test-a-wohnen.pdf'], { fonts: FONTS, flatten: true });
    expect(r.problems).toEqual([]);
    expect((await inspect(r.bytes!)).fields).toHaveLength(0);
  });
});

describe('Alle drei Testformulare vollständig', () => {
  it.each([['test-a-wohnen.pdf', () => A], ['test-b-familie.pdf', () => B], ['test-c-bildung.pdf', () => C]] as const)(
    '%s: alle Werte befüllt und nach dem Speichern identisch', async (name, pdf) => {
      const values = VALUES[name];
      const r = await fill(pdf(), values, { fonts: FONTS, dropXfa: true });
      expect(r.problems).toEqual([]);
      expect(await readValues(r.bytes!)).toMatchObject(values);
    });
});

describe('Datumsformate', () => {
  it('formatiert ISO-Datum nach Feldmuster', () => {
    expect(formatDate('1985-02-01', 'dd.mm.yyyy')).toBe('01.02.1985');
    expect(formatDate('1985-02-01', 'ddmmyyyy')).toBe('01021985');
    expect(formatDate('1985-02-01', 'd.m.yy')).toBe('1.2.85');
    expect(() => formatDate('01.02.1985', 'dd.mm.yyyy')).toThrow();
  });
  it('leitet das Muster aus Skript, Kammfeld oder Beschriftung ab', async () => {
    const a = await inspect(A), b = await inspect(B);
    expect(datePattern(a.fields.find((f) => f.name === 'Antragsteller.Geburtsdatum')!)).toBe('ddmmyyyy');
    expect(datePattern(b.fields.find((f) => f.name === 'txtGebDat')!)).toBe('dd.mm.yyyy');
    expect(datePattern({ name: 'x', kind: 'text', readOnly: false, required: false, label: 'Geburtsdatum (TT.MM.JJJJ)' })).toBe('dd.mm.yyyy');
  });
});
