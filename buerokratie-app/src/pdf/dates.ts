// Dates are stored as ISO "yyyy-mm-dd" in the vault and converted to what a field expects.
import type { FieldInfo } from './inspect.js';

/** Formats an ISO date with an Acrobat-style pattern (dd, d, mm, m, yyyy, yy). */
export function formatDate(iso: string, pattern: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Kein ISO-Datum: ${iso}`);
  const [, y, mo, d] = m;
  return pattern.replace(/yyyy|yy|dd|d|mm|m/g, (t) => ({
    yyyy: y, yy: y.slice(2), dd: d, d: String(+d), mm: mo, m: String(+mo),
  } as Record<string, string>)[t]);
}

/**
 * Best guess for the expected date pattern of a field:
 * 1. format script (AFDate_FormatEx), 2. comb field with 8 cells → ddmmyyyy,
 * 3. hint in the label ("TTMMJJJJ", "TT.MM.JJJJ"), 4. German default dd.mm.yyyy.
 */
export function datePattern(f: FieldInfo): string {
  if (f.dateFormat) return f.dateFormat;
  const label = (f.label ?? '').toUpperCase();
  if (/TT\.MM\.JJJJ/.test(label)) return 'dd.mm.yyyy';
  if (/TTMMJJJJ/.test(label) || (f.comb && f.maxLength === 8)) return 'ddmmyyyy';
  if (/TTMMJJ\b/.test(label) || (f.comb && f.maxLength === 6)) return 'ddmmyy';
  if (f.maxLength === 8) return 'ddmmyyyy';
  return 'dd.mm.yyyy';
}
