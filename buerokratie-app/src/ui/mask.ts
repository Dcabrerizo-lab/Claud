// Master data form, generated from the field catalogue. Saves each field when it is changed.
import { ValueError, type Catalog, type FieldDef, type Value } from '../core/catalog.js';
import type { ModuleAccess } from '../core/vault.js';
import { t, getLang } from './i18n.js';

/** The core UI is itself a module: it may read and write everything. */
export const STAMMDATEN_MODULE = { id: 'stammdaten', name: 'Stammdaten', reads: ['*'], writes: ['*'] };

export const SECTIONS = ['person', 'adresse', 'kontakt', 'haushalt', 'wohnen', 'einkommen', 'vermoegen', 'gesundheit', 'bank'];
/** Field that is asked first when adding a list entry (as big buttons). */
const FIRST: Record<string, string> = { haushalt: 'beziehung', einkommen: 'art' };

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const idOf = (key: string) => 'f-' + key.replace(/[[\].]+/g, '-');

function lab(l: Partial<Record<string, string>> | undefined): string { return (l && (l[getLang()] ?? l.de)) ?? ''; }

export function display(def: FieldDef, v: Value | undefined): string {
  if (v === undefined) return '';
  if (def.typ === 'datum') { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v)); return m ? `${m[3]}.${m[2]}.${m[1]}` : String(v); }
  if (def.typ === 'betrag') return Number(v).toLocaleString(getLang() === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: Number(v) % 1 ? 2 : 0, maximumFractionDigits: 2 });
  if (def.typ === 'iban') return String(v).replace(/(.{4})/g, '$1 ').trim();
  return String(v);
}

const INPUT: Partial<Record<FieldDef['typ'], string>> = {
  datum: 'inputmode="numeric" placeholder="TT.MM.JJJJ"', betrag: 'inputmode="decimal"', zahl: 'inputmode="numeric"',
  plz: 'inputmode="numeric" maxlength="5"', iban: 'autocapitalize="characters" spellcheck="false"',
  email: 'type="email" inputmode="email" spellcheck="false"', telefon: 'type="tel" inputmode="tel"',
};

export class Mask {
  private open = new Set<string>(['person']);
  private adding: string | null = null;
  private values: Record<string, Value | undefined> = {};
  private busy = false;           // ignores double taps on add/remove while one is running
  private pendingExternal = false;
  private typing = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

  constructor(private readonly root: HTMLElement, private readonly access: ModuleAccess, private readonly catalog: Catalog, private readonly onSaved: () => void) {}

  private fieldsOf(group: string) { return this.catalog.fieldsOf(group).filter((f) => !f.abgeleitet); }

  private keysOf(group: string): string[] {
    const fs = this.fieldsOf(group);
    if (!this.catalog.group(group)?.liste) return fs.map((f) => f.key);
    const n = this.access.count(group);
    return Array.from({ length: n }, (_, i) => fs.map((f) => f.key.replace('[]', `[${i}]`))).flat();
  }

  /** The focused field, if it holds input that is not saved yet (the user is in the middle of typing). */
  private dirtyField(): HTMLInputElement | HTMLSelectElement | null {
    const a = document.activeElement;
    if (!(a instanceof HTMLInputElement || a instanceof HTMLSelectElement) || !this.root.contains(a) || !a.dataset.key) return null;
    const def = this.catalog.parse(a.dataset.key).def;
    const stored = this.values[a.dataset.key];
    const shown = a instanceof HTMLSelectElement ? String(stored ?? '') : display(def, stored);
    return a.value !== shown ? a : null;
  }

  /**
   * Another window saved: redraw with its state, keeping the focus where it is. Only a field with unsaved
   * typing blocks this; the redraw then follows as soon as that field is saved or left.
   */
  external() {
    if (this.dirtyField()) { this.pendingExternal = true; return; }
    this.pendingExternal = false;
    const a = document.activeElement as HTMLElement | null;
    this.render(a && this.root.contains(a) ? a.dataset?.key : undefined);
  }

  async render(focusKey?: string) {
    const all = SECTIONS.flatMap((g) => this.keysOf(g));
    this.values = await this.access.read(all);
    this.root.innerHTML = SECTIONS.map((g) => this.section(g)).join('');
    this.bind();
    if (focusKey) (document.getElementById(idOf(focusKey)) as HTMLElement | null)?.focus();
  }

  private section(group: string): string {
    const g = this.catalog.group(group)!;
    const keys = this.keysOf(group);
    const filled = keys.filter((k) => this.values[k] !== undefined).length;
    const count = g.liste ? t('main.entries', { n: this.access.count(group) }) : t('main.filled', { n: filled, m: keys.length });
    let body: string;
    if (g.liste) {
      const n = this.access.count(group);
      const entries = Array.from({ length: n }, (_, i) => this.entry(group, i)).join('');
      const first = this.catalog.def(`${group}[].${FIRST[group]}`)!;
      const add = this.adding === group
        ? `<p id="add-q-${group}"><strong>${esc(t('main.add.which'))}</strong></p><div class="choices" role="group" aria-labelledby="add-q-${group}">${first.optionen!.map((o) =>
          `<button type="button" class="btn secondary" data-add="${group}" data-val="${esc(o.wert)}">${esc(lab(o.label))}</button>`).join('')}</div>`
        : `<button type="button" class="btn secondary" data-adding="${group}">+ ${esc(t('main.add.' + group))}</button>`;
      body = (n ? entries : `<p class="lead">${esc(t('main.empty.' + group))}</p>`) + add;
    } else {
      body = this.fieldsOf(group).map((f) => this.field(f, f.key)).join('');
    }
    return `<details class="section" data-group="${group}"${this.open.has(group) ? ' open' : ''}>
      <summary><span class="sumrow"><h2>${esc(lab(g.label))}</h2><span class="count">${esc(count)}</span></span></summary>
      <div class="body">${body}</div></details>`;
  }

  private entry(group: string, i: number): string {
    const fs = this.fieldsOf(group);
    const firstKey = `${group}[${i}].${FIRST[group]}`;
    const firstDef = this.catalog.def(`${group}[].${FIRST[group]}`)!;
    const kind = lab(firstDef.optionen!.find((o) => o.wert === this.values[firstKey])?.label);
    const name = group === 'haushalt' ? [this.values[`haushalt[${i}].vorname`], this.values[`haushalt[${i}].nachname`]].filter(Boolean).join(' ') : '';
    const title = [kind, name].filter(Boolean).join(': ') || t('main.entry', { n: i + 1 });
    return `<div class="entry"><div class="entry-head"><h3>${esc(title)}</h3>
      <button type="button" class="btn danger small" data-remove="${group}" data-index="${i}">${esc(t('main.remove'))}</button></div>
      ${fs.map((f) => this.field(f, f.key.replace('[]', `[${i}]`))).join('')}</div>`;
  }

  private field(def: FieldDef, key: string): string {
    const id = idOf(key);
    const v = this.values[key];
    const help = def.hilfe ? `<span class="hint" id="${id}-h">${esc(lab(def.hilfe))}</span>` : '';
    const described = `${def.hilfe ? id + '-h ' : ''}${id}-e`;
    let control: string;
    if (def.typ === 'auswahl' || def.typ === 'person') {
      const opts = def.typ === 'person' ? this.people() : def.optionen!.map((o) => ({ wert: o.wert, label: lab(o.label) }));
      control = `<select id="${id}" data-key="${esc(key)}" aria-describedby="${described}"><option value="">${esc(t('main.choose'))}</option>${opts.map((o) =>
        `<option value="${esc(o.wert)}"${o.wert === v ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    } else {
      // autocomplete off: browser autofill would store the data unencrypted outside the vault
      const input = `<input id="${id}" data-key="${esc(key)}" value="${esc(display(def, v))}" autocomplete="off" ${INPUT[def.typ] ?? ''} aria-describedby="${described}">`;
      control = def.typ === 'betrag' ? `<div class="withunit">${input}<span>€</span></div>` : def.einheit ? `<div class="withunit">${input}<span>${esc(def.einheit)}</span></div>` : input;
    }
    return `<div class="field"><label for="${id}">${esc(lab(def.label))}</label>${help}${control}<span class="err" id="${id}-e" role="alert"></span></div>`;
  }

  private people(): { wert: string; label: string }[] {
    const n = this.access.count('haushalt');
    return [{ wert: 'ich', label: t('main.me') }, ...Array.from({ length: n }, (_, i) => ({
      wert: `haushalt[${i}]`, label: String(this.values[`haushalt[${i}].vorname`] ?? t('main.entry', { n: i + 1 })),
    }))];
  }

  private bind() {
    this.root.querySelectorAll<HTMLDetailsElement>('details.section').forEach((d) =>
      d.addEventListener('toggle', () => { const g = d.dataset.group!; d.open ? this.open.add(g) : this.open.delete(g); }));
    this.root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-key]').forEach((el) => {
      el.addEventListener('change', () => { clearTimeout(this.typing.get(el)); this.save(el); });
      // while typing: save quietly after a pause (only valid values, no error messages yet),
      // so nothing is lost if the app is closed without leaving the field
      if (el instanceof HTMLInputElement) el.addEventListener('input', () => {
        clearTimeout(this.typing.get(el));
        this.typing.set(el, setTimeout(() => this.access.write(el.dataset.key!, el.value).catch(() => undefined), 1500));
      });
      el.addEventListener('blur', () => { if (this.pendingExternal) setTimeout(() => this.flushExternal(), 0); });
    });
    this.root.querySelectorAll<HTMLButtonElement>('[data-adding]').forEach((b) =>
      b.addEventListener('click', () => this.once(async () => { this.adding = b.dataset.adding!; this.open.add(this.adding); await this.render(); (this.root.querySelector(`[data-add="${this.adding}"]`) as HTMLElement | null)?.focus(); })));
    this.root.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((b) => b.addEventListener('click', () => this.once(async () => {
      const g = b.dataset.add!, n = this.access.count(g);
      await this.access.write(`${g}[${n}].${FIRST[g]}`, b.dataset.val!);
      this.adding = null;
      this.onSaved();
      const next = this.fieldsOf(g).find((f) => !f.key.endsWith('.' + FIRST[g]));
      await this.render(next ? next.key.replace('[]', `[${n}]`) : undefined);
    })));
    this.root.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((b) => b.addEventListener('click', () => this.once(async () => {
      if (!confirm(t('main.remove.confirm'))) return;
      await this.access.remove(b.dataset.remove!, Number(b.dataset.index));
      this.onSaved();
      await this.render();
    })));
  }

  /** Runs one add/remove action at a time; further taps until the form is redrawn are ignored. */
  private async once(fn: () => Promise<void>) {
    if (this.busy) return;
    this.busy = true;
    this.root.querySelectorAll<HTMLButtonElement>('[data-add],[data-adding],[data-remove]').forEach((x) => { x.disabled = true; });
    try { await fn(); }
    finally {
      this.busy = false;
      // e.g. "remove" cancelled: the old buttons are still there and must work again
      this.root.querySelectorAll<HTMLButtonElement>('[data-add],[data-adding],[data-remove]').forEach((x) => { x.disabled = false; });
    }
  }

  private flushExternal() {
    if (this.pendingExternal) this.external();
  }

  private async save(el: HTMLInputElement | HTMLSelectElement) {
    const key = el.dataset.key!;
    const def = this.catalog.parse(key).def;
    const err = document.getElementById(el.id + '-e')!;
    try {
      await this.access.write(key, el.value);
      el.removeAttribute('aria-invalid');
      err.textContent = '';
      const stored = (await this.access.read([key]))[key];
      this.values[key] = stored;
      if (el instanceof HTMLInputElement) el.value = display(def, stored); // show normalised form (e.g. 1.2.1985 → 01.02.1985)
      el.dataset.state = 'saved'; // marker for automated tests
      this.onSaved();
      // titles and counters depend on some fields
      this.updateCount(key.split(/[[.]/)[0]);
    } catch (e) {
      el.setAttribute('aria-invalid', 'true');
      err.textContent = e instanceof ValueError ? t('err.' + def.typ) : t('err.storage');
      el.dataset.state = 'error';
    }
    if (this.pendingExternal) setTimeout(() => this.flushExternal(), 0);
  }

  private updateCount(group: string) {
    const d = this.root.querySelector<HTMLElement>(`details[data-group="${group}"] .count`);
    if (!d || this.catalog.group(group)?.liste) return;
    const keys = this.keysOf(group);
    d.textContent = t('main.filled', { n: keys.filter((k) => this.values[k] !== undefined).length, m: keys.length });
  }
}
