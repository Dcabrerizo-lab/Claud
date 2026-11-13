// Large-scale and property-based tests for the field catalogue (input checking and normalisation).
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { Catalog, parseDate, parseAmount, ibanValid, ValueError, type CatalogData } from '../src/core/catalog.js';

const catalog = new Catalog(JSON.parse(readFileSync(new URL('../data/feldkatalog.json', import.meta.url), 'utf8')) as CatalogData);
const RUNS = Number(process.env.FC_RUNS ?? 5000);
const pad = (n: number, l = 2) => String(n).padStart(l, '0');

describe('Datum: vollständig 1900–2100', () => {
  it('jeder existierende Tag wird in allen Schreibweisen erkannt (73 414 Tage × 4)', () => {
    let n = 0;
    for (let t = Date.UTC(1900, 0, 1); t <= Date.UTC(2100, 11, 31); t += 86_400_000) {
      const d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      const iso = `${y}-${pad(m)}-${pad(day)}`;
      for (const s of [`${pad(day)}.${pad(m)}.${y}`, `${day}.${m}.${y}`, `${day}.${pad(m)}.${y}`, iso]) {
        if (parseDate(s) !== iso) throw new Error(`${s} → ${parseDate(s)} statt ${iso}`);
      }
      n++;
    }
    expect(n).toBe(73414);
  });
  it('kein nicht existierender Tag wird angenommen (alle Tag/Monat-Kombinationen 0–39 × 0–19, 8 Jahre)', () => {
    for (const y of [1900, 1999, 2000, 2001, 2004, 2023, 2024, 2100]) for (let m = 0; m < 20; m++) for (let d = 0; d < 40; d++) {
      const exists = m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
      const got = parseDate(`${d}.${m}.${y}`);
      if (exists !== (got !== undefined)) throw new Error(`${d}.${m}.${y}: erwartet ${exists}, bekommen ${got}`);
    }
  });
  it('Jahre außerhalb 1900–2100 und fremde Formate werden abgelehnt', () => {
    for (const s of ['31.12.1899', '01.01.2101', '1.1.85', '01/02/1985', '1985-2-1', '01.02.1985 ', ' 01.02.1985', '01..02.1985', '01.02.19850', '', '.', '1.1.', '٠١.٠٢.١٩٨٥']) {
      expect(parseDate(s), s).toBeUndefined();
    }
  });
  it('Zufallstext: wirft nie, Ergebnis ist immer ein gültiges ISO-Datum oder nichts', () => {
    fc.assert(fc.property(fc.string({ unit: 'grapheme', maxLength: 30 }), (s) => {
      const r = parseDate(s);
      return r === undefined || (/^\d{4}-\d{2}-\d{2}$/.test(r) && parseDate(r) === r);
    }), { numRuns: RUNS * 4 });
  });
});

describe('Betrag', () => {
  it('jede Zahl in deutscher, englischer und Tausender-Schreibweise ergibt denselben Wert', () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 999_999_999 }), (cents) => {
      const eur = Math.floor(cents / 100), ct = cents % 100;
      const de = `${eur},${pad(ct)}`;
      const en = `${eur}.${pad(ct)}`;
      const thousands = eur.toLocaleString('de-DE') + ',' + pad(ct);
      const euro = `${de} €`;
      const spaced = eur.toLocaleString('de-DE').replace(/\./g, ' ') + ',' + pad(ct);
      const english = eur.toLocaleString('en-GB') + '.' + pad(ct);
      const want = cents / 100;
      return [de, en, thousands, euro, spaced, english, `${eur}`.concat(ct ? `,${pad(ct)}` : '')].every((s) => Math.abs(parseAmount(s)! - want) < 1e-9);
    }), { numRuns: RUNS * 4 });
  });
  it('Zufallstext: wirft nie, Ergebnis ist nichts oder eine Zahl ≥ 0 mit höchstens 2 Nachkommastellen', () => {
    fc.assert(fc.property(fc.oneof(fc.string({ maxLength: 20 }), fc.stringMatching(/^[\d.,€ -]{0,14}$/)), (s) => {
      const r = parseAmount(s);
      return r === undefined || (Number.isFinite(r) && r >= 0 && Math.abs(Math.round(r * 100) - r * 100) < 1e-6);
    }), { numRuns: RUNS * 4 });
  });
  it('mehrdeutige oder falsche Schreibweisen werden abgelehnt statt geraten', () => {
    for (const s of ['1,2,3', '12,345', '1.23.4', '-5', '5,', ',5', '12 5', '1 23', '1.234 567', '1,234', '1e3', '0x10', 'NaN', 'Infinity', '12,5,0', '1.234.5', '1..2']) {
      expect(parseAmount(s), s).toBeUndefined();
    }
  });
});

describe('IBAN', () => {
  // build a valid IBAN for any country prefix and BBAN by computing the check digits
  const mod97 = (s: string) => { let m = 0; for (const ch of s) m = (m * 10 + Number(ch)) % 97; return m; };
  const num = (s: string) => s.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  const make = (cc: string, bban: string) => cc + pad(98 - mod97(num(bban + cc + '00'))) + bban;
  const germanBban = fc.stringMatching(/^\d{18}$/);

  it('100 000 erzeugte gültige deutsche IBANs werden alle angenommen', () => {
    fc.assert(fc.property(germanBban, (b) => ibanValid(make('DE', b))), { numRuns: 100_000 });
  });
  it('jeder einzelne Tippfehler (Ziffer ersetzt) wird erkannt', () => {
    fc.assert(fc.property(germanBban, fc.integer({ min: 2, max: 21 }), fc.integer({ min: 1, max: 9 }), (b, pos, delta) => {
      const iban = make('DE', b);
      const wrong = iban.slice(0, pos) + String((Number(iban[pos]) + delta) % 10) + iban.slice(pos + 1);
      return !ibanValid(wrong);
    }), { numRuns: 100_000 });
  });
  it('jeder Zahlendreher benachbarter verschiedener Ziffern wird erkannt', () => {
    fc.assert(fc.property(germanBban, fc.integer({ min: 4, max: 20 }), (b, pos) => {
      const iban = make('DE', b);
      if (iban[pos] === iban[pos + 1]) return true;
      return !ibanValid(iban.slice(0, pos) + iban[pos + 1] + iban[pos] + iban.slice(pos + 2));
    }), { numRuns: 100_000 });
  });
  it('ausländische IBANs (AT, NL, FR, TR) mit gültiger Prüfziffer werden angenommen', () => {
    fc.assert(fc.property(fc.constantFrom(['AT', /^\d{16}$/], ['NL', /^[A-Z]{4}\d{10}$/], ['FR', /^\d{23}$/], ['TR', /^\d{22}$/]).chain(([cc, re]) =>
      fc.stringMatching(re as RegExp).map((b) => make(cc as string, b))), (iban) => ibanValid(iban)), { numRuns: RUNS });
  });
  it('bekannte Beispiel-IBANs aus der Norm bzw. von Banken (öffentliche Test-IBANs)', () => {
    for (const ok of ['DE89370400440532013000', 'DE02120300000000202051', 'GB82WEST12345698765432', 'AT611904300234573201', 'NL91ABNA0417164300'])
      expect(ibanValid(ok), ok).toBe(true);
    for (const bad of ['DE89370400440532013001', 'DE8937040044053201300', 'DE893704004405320130000', 'de89370400440532013000', 'XX00000000000000000000', ''])
      expect(ibanValid(bad), bad).toBe(false);
  });
});

describe('Alle Katalogfelder mit Zufallseingaben', () => {
  const editable = catalog.fields.filter((f) => !f.abgeleitet);
  const concrete = (key: string) => key.replace('[]', '[0]');

  it.each(editable.map((f) => [f.key, f]))('%s: nur gültig, leer oder verständlich abgelehnt; erneutes Normalisieren ändert nichts', (_k, f) => {
    const key = concrete(f.key);
    const anyInput = fc.oneof(
      fc.string({ unit: 'grapheme', maxLength: 260 }),
      fc.string({ unit: 'binary', maxLength: 40 }),
      fc.constantFrom('', ' ', '\n', '\u0000', '‮', '<script>', '0', '-1', '1e309', 'NaN', '12345', '01.02.1985', 'DE02120300000000202051', 'a@b.de', '+49 30 1234567', 'ich', 'haushalt[0]', ...(f.optionen?.map((o) => o.wert) ?? [])),
      fc.double().map(String),
    );
    fc.assert(fc.property(anyInput, (s) => {
      let v;
      try { v = catalog.normalize(key, s); } catch (e) { if (e instanceof ValueError) return true; throw e; }
      if (v === undefined) return s.trim() === '';
      // stored value is valid input again and stable
      expect(catalog.normalize(key, typeof v === 'number' ? String(v) : v)).toEqual(v);
      if (typeof v === 'string') expect(v.length).toBeLessThanOrEqual(200);
      return true;
    }), { numRuns: Math.ceil(RUNS / 2) });
  });

  it('Namen: Mehrfach-Leerzeichen werden vereinheitlicht, Sonderzeichen bleiben erhalten', () => {
    expect(catalog.normalize('person.nachname', '  Müller   Lüdenscheidt ')).toBe('Müller Lüdenscheidt');
    expect(catalog.normalize('person.vorname', "N'Golo-Ştefan Ğ")).toBe("N'Golo-Ştefan Ğ");
    expect(() => catalog.normalize('person.vorname', 'x'.repeat(201))).toThrow(ValueError);
  });
});
