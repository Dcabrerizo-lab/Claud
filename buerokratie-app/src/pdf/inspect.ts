// Reads the AcroForm of a PDF and describes every field in a neutral shape.
// This is the basis for M2 (matching field names/labels against the field catalogue).
import {
  PDFDocument, PDFName, PDFDict, PDFString, PDFHexString, PDFTextField, PDFCheckBox,
  PDFRadioGroup, PDFDropdown, PDFOptionList, PDFButton, PDFSignature, PDFField, PDFStream,
} from 'pdf-lib';

export type FieldKind = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'list' | 'button' | 'signature' | 'unknown';

export interface FieldInfo {
  name: string;            // fully qualified name, e.g. "Antragsteller.Name"
  kind: FieldKind;
  label?: string;          // tooltip /TU – often the human-readable caption
  readOnly: boolean;
  required: boolean;
  maxLength?: number;
  comb?: boolean;
  multiline?: boolean;
  options?: string[];      // dropdown/list/radio export values
  onValue?: string;        // checkbox export value ("Ja", "On", "1", ...)
  editable?: boolean;      // editable combo box
  dateFormat?: string;     // from AFDate_FormatEx("dd.mm.yyyy") in the field's JavaScript
  numberFormat?: string;   // raw AFNumber_Format(...) call, if any
  page?: number;           // 0-based page index of the first widget
  rect?: [number, number, number, number];
}

export interface FormInfo {
  pageCount: number;
  encrypted: boolean;
  hasXfa: boolean;
  needAppearances: boolean;
  fields: FieldInfo[];
}

function decodeText(v: unknown): string | undefined {
  if (v instanceof PDFString || v instanceof PDFHexString) return v.decodeText();
  return undefined;
}

/** JavaScript of the field's format action (/AA /F /JS), as text. */
function formatScript(field: PDFField): string | undefined {
  const aa = field.acroField.dict.lookupMaybe(PDFName.of('AA'), PDFDict);
  const f = aa?.lookupMaybe(PDFName.of('F'), PDFDict);
  const js = f?.lookup(PDFName.of('JS'));
  if (!js) return undefined;
  if (js instanceof PDFStream) {
    try { return Buffer.from((js as any).getContents()).toString('latin1'); } catch { return undefined; }
  }
  return decodeText(js);
}

function kindOf(f: PDFField): FieldKind {
  if (f instanceof PDFTextField) return 'text';
  if (f instanceof PDFCheckBox) return 'checkbox';
  if (f instanceof PDFRadioGroup) return 'radio';
  if (f instanceof PDFDropdown) return 'dropdown';
  if (f instanceof PDFOptionList) return 'list';
  if (f instanceof PDFButton) return 'button';
  if (f instanceof PDFSignature) return 'signature';
  return 'unknown';
}

export function hasXfaLayer(doc: PDFDocument): boolean {
  const acro = doc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
  return !!acro?.lookup(PDFName.of('XFA'));
}

export async function loadPdf(bytes: Uint8Array): Promise<{ doc: PDFDocument; encrypted: boolean }> {
  try {
    return { doc: await PDFDocument.load(bytes), encrypted: false };
  } catch (e) {
    if (/encrypted/i.test(String(e))) {
      // pdf-lib cannot decrypt. Loading with ignoreEncryption lets us read the structure,
      // but saved output is not reliable – the caller must treat this as "not fillable".
      return { doc: await PDFDocument.load(bytes, { ignoreEncryption: true }), encrypted: true };
    }
    throw e;
  }
}

export async function inspect(bytes: Uint8Array): Promise<FormInfo> {
  const { doc, encrypted } = await loadPdf(bytes);
  // Check XFA BEFORE doc.getForm(): pdf-lib's getForm() silently deletes the XFA layer.
  const hasXfa = hasXfaLayer(doc);
  const acro = doc.catalog.lookupMaybe(PDFName.of('AcroForm'), PDFDict);
  const form = doc.getForm();
  const pages = doc.getPages();
  const pageIndex = new Map(pages.map((p, i) => [p.ref.toString(), i]));

  const fields: FieldInfo[] = form.getFields().map((f) => {
    const kind = kindOf(f);
    const info: FieldInfo = {
      name: f.getName(),
      kind,
      label: decodeText(f.acroField.dict.lookup(PDFName.of('TU'))),
      readOnly: f.isReadOnly(),
      required: f.isRequired(),
    };
    if (f instanceof PDFTextField) {
      info.maxLength = f.getMaxLength();
      info.comb = f.isCombed();
      info.multiline = f.isMultiline();
      const js = formatScript(f);
      const d = js?.match(/AFDate_Format(?:Ex)?\s*\(\s*["']([^"']+)["']/);
      if (d) info.dateFormat = d[1];
      const n = js?.match(/AFNumber_Format\s*\([^)]*\)/);
      if (n) info.numberFormat = n[0];
    } else if (f instanceof PDFCheckBox) {
      const w = f.acroField.getWidgets()[0];
      info.onValue = w?.getOnValue()?.decodeText();
    } else if (f instanceof PDFRadioGroup) {
      info.options = f.getOptions();
    } else if (f instanceof PDFDropdown) {
      info.options = f.getOptions();
      info.editable = f.isEditable();
    } else if (f instanceof PDFOptionList) {
      info.options = f.getOptions();
    }
    const w = f.acroField.getWidgets()[0];
    if (w) {
      const r = w.getRectangle();
      info.rect = [r.x, r.y, r.width, r.height];
      const p = w.P();
      if (p) info.page = pageIndex.get(p.toString());
      else info.page = pages.findIndex((pg) => pg.node.Annots()?.asArray().some((a) => a === w.dict || doc.context.lookup(a) === w.dict));
    }
    return info;
  });

  return {
    pageCount: doc.getPageCount(),
    encrypted,
    hasXfa,
    needAppearances: acro?.lookup(PDFName.of('NeedAppearances'))?.toString() === 'true',
    fields,
  };
}
