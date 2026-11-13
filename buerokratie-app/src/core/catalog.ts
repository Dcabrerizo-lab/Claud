// Field catalogue: stable keys, types, labels, synonyms. The single vocabulary shared by the vault,
// all modules (form filler, Leistungs-Lotse, later deadlines …) and saved form templates.

export type FieldType = 'text' | 'name' | 'datum' | 'betrag' | 'zahl' | 'auswahl' | 'plz' | 'iban' | 'email' | 'telefon' | 'person';
export type Labels = Partial<Record<string, string>>; // language code → text

export interface FieldDef {
  key: string;             // "person.vorname" or list field "haushalt[].vorname"
  typ: FieldType;
  label: Labels;
  hilfe?: Labels;
  optionen?: { wert: string; label: Labels }[];
  synonyme?: Record<string, string[]>;
  abgeleitet?: string;     // template from other keys; read-only
  einheit?: string;
  min?: number; max?: number;
}
export interface GroupDef { label: Labels; liste?: boolean; max?: number }
export interface CatalogData { version: number; stand: string; gruppen: Record<string, GroupDef>; felder: FieldDef[] }

/** A concrete key: "person.vorname" or "haushalt[2].vorname". */
export interface ParsedKey { group: string; index?: number; field: string; def: FieldDef; groupDef: GroupDef }

export type Value = string | number;

export class CatalogError extends Error { constructor(msg: string) { super(msg); this.name = 'CatalogError'; } }
export class ValueError extends Error {
  constructor(readonly key: string, readonly reason: string) { super(`${key}: ${reason}`); this.name = 'ValueError'; }
}

const KEY = /^([a-z_]+)(?:\[(\d+)\])?\.([a-z_]+)$/;

export class Catalog {
  private readonly byKey = new Map<string, FieldDef>();
  constructor(readonly data: CatalogData) {
    for (const f of data.felder) {
      const m = /^([a-z_]+)(\[\])?\.([a-z_]+)$/.exec(f.key);
      if (!m) throw new CatalogError(`Ungültiger Katalogschlüssel ${f.key}`);
      const g = data.gruppen[m[1]];
      if (!g) throw new CatalogError(`Gruppe fehlt für ${f.key}`);
      if (!!m[2] !== !!g.liste) throw new CatalogError(`${f.key}: Listenschreibweise passt nicht zur Gruppe`);
      if (this.byKey.has(f.key)) throw new CatalogError(`Doppelter Schlüssel ${f.key}`);
      if (f.typ === 'auswahl' && !f.optionen?.length) throw new CatalogError(`${f.key}: Auswahl ohne Optionen`);
      this.byKey.set(f.key, f);
    }
    for (const f of data.felder) for (const ref of refs(f.abgeleitet)) {
      if (!this.byKey.has(ref)) throw new CatalogError(`${f.key}: abgeleitet von unbekanntem ${ref}`);
    }
  }

  get fields(): FieldDef[] { return this.data.felder; }
  group(name: string): GroupDef | undefined { return this.data.gruppen[name]; }
  fieldsOf(group: string): FieldDef[] { return this.data.felder.filter((f) => f.key.split(/[[.]/)[0] === group); }
  def(key: string): FieldDef | undefined { return this.byKey.get(key); }

  parse(key: string): ParsedKey {
    const m = KEY.exec(key);
    if (!m) throw new CatalogError(`Ungültiger Schlüssel ${key}`);
    const [, group, idx, field] = m;
    const groupDef = this.data.gruppen[group];
    if (!groupDef) throw new CatalogError(`Unbekannte Gruppe in ${key}`);
    const generic = groupDef.liste ? `${group}[].${field}` : `${group}.${field}`;
    const def = this.byKey.get(generic);
    if (!def) throw new CatalogError(`Unbekannter Schlüssel ${key}`);
    if (groupDef.liste && idx === undefined) throw new CatalogError(`${key}: Listenfeld braucht eine Nummer, z. B. ${group}[0].${field}`);
    if (!groupDef.liste && idx !== undefined) throw new CatalogError(`${key}: ${group} ist keine Liste`);
    const index = idx === undefined ? undefined : Number(idx);
    if (index !== undefined && groupDef.max !== undefined && index >= groupDef.max) throw new CatalogError(`${key}: höchstens ${groupDef.max} Einträge`);
    return { group, index, field, def, groupDef };
  }

  label(key: string, lang: string): string {
    const def = this.def(key) ?? this.parse(key).def;
    return def.label[lang] ?? def.label.de ?? key;
  }

  /**
   * Checks and normalises a value for storage. Empty string = delete.
   * Dates are stored as ISO yyyy-mm-dd, amounts as number of euros, IBAN without spaces.
   */
  normalize(key: string, input: Value): Value | undefined {
    const { def } = this.parse(key);
    if (def.abgeleitet) throw new ValueError(key, 'wird automatisch berechnet');
    if (typeof input === 'string' && input.trim() === '') return undefined;
    const s = String(input).trim();
    switch (def.typ) {
      case 'text': case 'name':
        if (s.length > 200) throw new ValueError(key, 'zu lang');
        return s.replace(/\s+/g, ' ');
      case 'datum': {
        const iso = parseDate(s);
        if (!iso) throw new ValueError(key, 'Datum bitte als TT.MM.JJJJ');
        return iso;
      }
      case 'betrag': {
        const n = parseAmount(s);
        if (n === undefined || n < 0 || n > 10_000_000) throw new ValueError(key, 'Betrag bitte als Zahl, z. B. 512,50');
        return n;
      }
      case 'zahl': {
        const n = Number(s.replace(',', '.'));
        if (!Number.isFinite(n) || (def.min !== undefined && n < def.min) || (def.max !== undefined && n > def.max)) throw new ValueError(key, 'ungültige Zahl');
        return n;
      }
      case 'auswahl':
        if (!def.optionen!.some((o) => o.wert === s)) throw new ValueError(key, 'keine gültige Auswahl');
        return s;
      case 'plz':
        if (!/^\d{5}$/.test(s)) throw new ValueError(key, 'Postleitzahl hat 5 Ziffern');
        return s;
      case 'iban': {
        const iban = s.replace(/\s+/g, '').toUpperCase();
        if (!ibanValid(iban)) throw new ValueError(key, 'IBAN ist nicht gültig (Prüfziffer)');
        return iban;
      }
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new ValueError(key, 'E-Mail-Adresse ist nicht gültig');
        return s;
      case 'telefon':
        if (!/^\+?[\d\s/()-]{5,25}$/.test(s)) throw new ValueError(key, 'Telefonnummer ist nicht gültig');
        return s;
      case 'person':
        // "ich" or a household entry "haushalt[2]"
        if (s !== 'ich' && !/^haushalt\[\d+\]$/.test(s)) throw new ValueError(key, 'ungültige Person');
        return s;
    }
  }
}

export function refs(template?: string): string[] {
  return template ? [...template.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]) : [];
}

/** Accepts 1.2.1985, 01.02.1985, 1985-02-01; checks that the day exists. */
export function parseDate(s: string): string | undefined {
  let y: number, m: number, d: number;
  let r = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s);
  if (r) { d = +r[1]; m = +r[2]; y = +r[3]; }
  else if ((r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s))) { y = +r[1]; m = +r[2]; d = +r[3]; }
  else return undefined;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d || y < 1900 || y > 2100) return undefined;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** German amounts: "512,50", "1.234,56", "1234.5", "512 €". Returns euros as number with 2 decimals. */
export function parseAmount(s: string): number | undefined {
  let t = s.replace(/[€\s]/g, '').replace(/eur$/i, '');
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return undefined;
  return Math.round(Number(t) * 100) / 100;
}

/** ISO 13616 check digits (mod 97). */
export function ibanValid(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  if (iban.startsWith('DE') && iban.length !== 22) return false;
  const r = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let mod = 0;
  for (const ch of r) mod = (mod * 10 + Number(ch)) % 97;
  return mod === 1;
}
