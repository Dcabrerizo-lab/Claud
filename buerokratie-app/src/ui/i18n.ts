// Same text format as the Leistungs-Lotse: one flat JSON file per language, "meta.dir" for writing direction.
import de from '../lang/de.json';
import en from '../lang/en.json';

type Dict = Record<string, string>;
// The other Lotse languages (tr, ar, ru, uk, pl, ro) follow in M4; they are only offered once translated.
export const DICTS: Record<string, Dict> = { de, en };
export const LANGS = Object.keys(DICTS);

let lang = 'de';
const KEY = 'tresor-lang'; // UI preference only, never personal data

export function detectLang(): string {
  try { const s = localStorage.getItem(KEY); if (s && DICTS[s]) return s; } catch { /* storage blocked */ }
  for (const l of navigator.languages ?? [navigator.language]) { const c = String(l).slice(0, 2).toLowerCase(); if (DICTS[c]) return c; }
  return 'de';
}

export function setLang(l: string) {
  lang = DICTS[l] ? l : 'de';
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
  document.documentElement.dir = t('meta.dir') === 'rtl' ? 'rtl' : 'ltr';
}
export const getLang = () => lang;

export function t(key: string, p?: Record<string, string | number>): string {
  let s = DICTS[lang]?.[key] ?? DICTS.de[key] ?? key;
  if (p) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in p ? String(p[k]) : m));
  return s;
}
