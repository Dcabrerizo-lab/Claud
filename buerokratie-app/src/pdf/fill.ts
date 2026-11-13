// Fills AcroForm fields with confirmed values and reports per-field problems instead of throwing.
// Guards added on top of pdf-lib (see docs/spike-m0.md for why each one is needed).
import {
  PDFDocument, PDFFont, PDFTextField, TextAlignment, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList, PDFField,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { loadPdf, hasXfaLayer } from './inspect.js';

/** Value per field: string for text/choice, boolean for checkbox. */
export type FillValues = Record<string, string | boolean>;

export interface FillProblem { field: string; reason: string }

export interface FillOptions {
  /**
   * TTF/OTF fonts, tried in order; for every value the first font that has all glyphs is used.
   * Without fonts pdf-lib uses Helvetica (WinAnsi: German umlauts work, ş/ł/ș/Cyrillic/Arabic do not).
   */
  fonts?: FontSpec[];
  /** Remove an XFA layer so viewers show the AcroForm values. Without it, XFA forms are refused. */
  dropXfa?: boolean;
  /** Turn fields into plain page content (not editable afterwards). */
  flatten?: boolean;
  /** Allow writing into read-only fields (pdf-lib itself does not prevent it). Default false. */
  allowReadOnly?: boolean;
}

/**
 * subset:false embeds the whole font once (needed for Noto Sans: pdf-lib's subsetter drops most
 * Latin glyphs). subset:true embeds a fresh subset per field (needed for Arabic: only the subset
 * path renders Arabic in the right order). See docs/spike-m0.md.
 */
export interface FontSpec { bytes: Uint8Array; subset: boolean }

export interface FillResult { bytes?: Uint8Array; problems: FillProblem[]; filled: string[] }

interface FontEntry extends FontSpec { covers: (s: string) => boolean; full?: Promise<PDFFont> }

function prepareFonts(doc: PDFDocument, fonts: FontSpec[]): FontEntry[] {
  if (!fonts.length) return [];
  doc.registerFontkit(fontkit);
  return fonts.map((spec) => {
    const fk = fontkit.create(spec.bytes as any);
    return { ...spec, covers: (s: string) => [...s].every((ch) => /\s/.test(ch) || fk.hasGlyphForCodePoint(ch.codePointAt(0)!)) };
  });
}

/** undefined = use the standard font, null = no font covers the text. */
async function fontFor(doc: PDFDocument, fonts: FontEntry[], text: string): Promise<PDFFont | undefined | null> {
  if (!fonts.length) return undefined;
  const e = fonts.find((f) => f.covers(text));
  if (!e) return null;
  if (e.subset) return doc.embedFont(e.bytes, { subset: true }); // one subset per field
  return (e.full ??= doc.embedFont(e.bytes, { subset: false })); // whole font, embedded once
}

async function setText(doc: PDFDocument, f: PDFTextField, text: string, fonts: FontEntry[]) {
  const font = await fontFor(doc, fonts, text);
  if (font === null) throw new Error('Keine eingebettete Schrift enthält alle Zeichen');
  f.setText(text);
  if (font) {
    // pdf-lib's auto size (0) uses the font's full ascender+descender box. With Noto Sans this places
    // the baseline so low that descenders and cedillas (g, j, Ş, Ș) are clipped. A fixed size relative
    // to the widget height avoids that (also for comb fields and multi-line fields).
    f.setFontSize(f.isMultiline() ? 9 : autoSize(f));
    if (!f.isCombed() && RTL.test(text)) f.setAlignment(TextAlignment.Right);
    f.updateAppearances(font);
  }
}

/** Arabic, Hebrew, Syriac, Thaana … (strong right-to-left characters). */
const RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

function autoSize(f: PDFTextField | PDFDropdown): number {
  const h = f.acroField.getWidgets()[0]?.getRectangle().height ?? 20;
  return Math.max(6, Math.min(11, Math.round(h * 0.5 * 2) / 2));
}

function checkChoice(f: PDFDropdown | PDFOptionList | PDFRadioGroup, v: string) {
  const editable = f instanceof PDFDropdown && f.isEditable();
  // pdf-lib accepts any value for non-editable dropdowns and lists – that would produce invalid forms
  if (!editable && !f.getOptions().includes(v)) {
    throw new Error(`Wert "${v}" ist keine Auswahlmöglichkeit (${f.getOptions().join(', ')})`);
  }
}

export async function fill(pdf: Uint8Array, values: FillValues, opts: FillOptions = {}): Promise<FillResult> {
  const { doc, encrypted } = await loadPdf(pdf);
  if (encrypted) return { problems: [{ field: '*', reason: 'PDF ist verschlüsselt – pdf-lib kann es nicht ausfüllen' }], filled: [] };
  if (hasXfaLayer(doc) && !opts.dropXfa) {
    return { problems: [{ field: '*', reason: 'PDF enthält XFA – erst nach Entfernen der XFA-Schicht befüllbar (dropXfa)' }], filled: [] };
  }

  const form = doc.getForm(); // removes XFA (pdf-lib behaviour)
  const fonts = prepareFonts(doc, opts.fonts ?? []);

  const problems: FillProblem[] = [];
  const filled: string[] = [];
  for (const [name, value] of Object.entries(values)) {
    try {
      const f: PDFField = form.getField(name);
      if (f.isReadOnly() && !opts.allowReadOnly) throw new Error('Feld ist schreibgeschützt');
      if (f instanceof PDFTextField) {
        await setText(doc, f, String(value), fonts);
      } else if (f instanceof PDFCheckBox) {
        value === true || value === 'true' ? f.check() : f.uncheck();
      } else if (f instanceof PDFRadioGroup) {
        checkChoice(f, String(value));
        f.select(String(value));
      } else if (f instanceof PDFDropdown || f instanceof PDFOptionList) {
        const v = String(value);
        checkChoice(f, v);
        const font = await fontFor(doc, fonts, v);
        if (font === null) throw new Error('Keine eingebettete Schrift enthält alle Zeichen');
        f.select(v);
        if (font) {
          if (f instanceof PDFDropdown) f.setFontSize(autoSize(f));
          f.updateAppearances(font);
        }
      } else {
        throw new Error('Feldtyp wird nicht befüllt');
      }
      filled.push(name);
    } catch (e) {
      problems.push({ field: name, reason: e instanceof Error ? e.message : String(e) });
    }
  }

  // With embedded fonts the appearances are already built per field; regenerating them
  // with Helvetica would fail for non-WinAnsi text.
  const regen = fonts.length === 0;
  try {
    if (opts.flatten) form.flatten({ updateFieldAppearances: regen });
    const bytes = await doc.save({ updateFieldAppearances: regen });
    return { bytes, problems, filled };
  } catch (e) {
    // Typical case: a value the standard font cannot encode (raised while saving, not while setting)
    problems.push({ field: '*', reason: 'Speichern fehlgeschlagen: ' + (e instanceof Error ? e.message : String(e)) });
    return { problems, filled };
  }
}

/** Reads back field values from a saved PDF (for round-trip checks). */
export async function readValues(pdf: Uint8Array): Promise<Record<string, string | boolean | undefined>> {
  const doc = await PDFDocument.load(pdf);
  const out: Record<string, string | boolean | undefined> = {};
  for (const f of doc.getForm().getFields()) {
    const n = f.getName();
    if (f instanceof PDFTextField) out[n] = f.getText();
    else if (f instanceof PDFCheckBox) out[n] = f.isChecked();
    else if (f instanceof PDFRadioGroup) out[n] = f.getSelected();
    else if (f instanceof PDFDropdown) out[n] = f.getSelected()[0];
    else if (f instanceof PDFOptionList) out[n] = f.getSelected()[0];
  }
  return out;
}
