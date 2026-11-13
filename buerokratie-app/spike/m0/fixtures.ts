// Synthetic test forms for the M0 spike. NOT official forms: they only reproduce the field
// constructions that occur in official German application PDFs (comb date fields, checkboxes
// with "Ja" export value, radio groups, combo boxes, date format scripts, hierarchical names,
// XFA layer). The real official forms are run through the same pipeline once they are available.
import { PDFDocument, PDFName, PDFString, PDFDict, StandardFonts, PDFField, PDFHexString } from 'pdf-lib';

function tooltip(f: PDFField, text: string) {
  f.acroField.dict.set(PDFName.of('TU'), PDFHexString.fromText(text));
}

function dateFormat(f: PDFField, fmt: string) {
  const ctx = f.doc.context;
  const action = (js: string) => ctx.obj({ S: 'JavaScript', JS: PDFString.of(js) });
  f.acroField.dict.set(PDFName.of('AA'), ctx.obj({
    F: action(`AFDate_FormatEx("${fmt}");`),
    K: action(`AFDate_KeystrokeEx("${fmt}");`),
  }));
}

async function base(title: string) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 40, y: 800, size: 14, font });
  page.drawText('Synthetisches Testformular – kein amtliches Dokument', { x: 40, y: 782, size: 8, font });
  return { doc, page, font, form: doc.getForm() };
}

function label(page: any, font: any, text: string, y: number) {
  page.drawText(text, { x: 40, y: y + 6, size: 9, font });
}

/** A: housing-allowance-like form: person, address, comb date, rent, checkboxes, radio. */
export async function formWohnen(): Promise<Uint8Array> {
  const { doc, page, font, form } = await base('Test A – Antrag Mietzuschuss (nachgebaut)');
  let y = 740;
  const text = (name: string, cap: string, w = 300, setup?: (f: any) => void) => {
    label(page, font, cap, y);
    const f = form.createTextField(name);
    tooltip(f, cap);
    setup?.(f);
    f.addToPage(page, { x: 220, y, width: w, height: 20, font });
    y -= 32;
    return f;
  };
  text('Antragsteller.Name', 'Familienname');
  text('Antragsteller.Vorname', 'Vorname(n)');
  text('Antragsteller.Geburtsdatum', 'Geburtsdatum (TTMMJJJJ)', 160, (f) => { f.setMaxLength(8); f.enableCombing(); });
  text('Straße_Hausnummer', 'Straße, Hausnummer');
  text('PLZ', 'Postleitzahl', 80, (f) => { f.setMaxLength(5); f.enableCombing(); });
  text('Ort', 'Wohnort');
  text('Kaltmiete', 'Miete ohne Heiz- und Nebenkosten in EUR', 100);
  text('Bemerkungen', 'Bemerkungen', 300, (f) => f.enableMultiline());

  label(page, font, 'Ich bin Mieter/in der Wohnung', y);
  const cb = form.createCheckBox('Mieter');
  tooltip(cb, 'Ich bin Mieter/in der Wohnung');
  cb.addToPage(page, { x: 220, y, width: 14, height: 14 });
  // Official forms often use "Ja" instead of the default "Yes"/"On" export value
  const ap = cb.acroField.getWidgets()[0].getAppearances();
  if (ap?.normal instanceof PDFDict) {
    const on = ap.normal.get(PDFName.of('Yes'));
    ap.normal.delete(PDFName.of('Yes'));
    ap.normal.set(PDFName.of('Ja'), on!);
  }
  y -= 32;

  label(page, font, 'Familienstand', y);
  const rg = form.createRadioGroup('Familienstand');
  tooltip(rg, 'Familienstand');
  ['ledig', 'verheiratet', 'geschieden', 'verwitwet'].forEach((v, i) =>
    rg.addOptionToPage(v, page, { x: 220 + i * 80, y, width: 14, height: 14 }));
  y -= 32;

  const ro = form.createTextField('Aktenzeichen');
  tooltip(ro, 'Aktenzeichen (wird von der Behörde ausgefüllt)');
  ro.addToPage(page, { x: 220, y, width: 200, height: 20, font });
  ro.enableReadOnly();
  label(page, font, 'Aktenzeichen (Behörde)', y);
  return doc.save();
}

/** B: child-supplement-like form: children table, dropdown, date with format script, IBAN. */
export async function formFamilie(): Promise<Uint8Array> {
  const { doc, page, font, form } = await base('Test B – Antrag Familienleistung (nachgebaut)');
  let y = 740;
  const add = (name: string, cap: string, w = 260) => {
    label(page, font, cap, y);
    const f = form.createTextField(name);
    tooltip(f, cap);
    f.addToPage(page, { x: 220, y, width: w, height: 20, font });
    y -= 30;
    return f;
  };
  add('txtName', 'Name, Vorname der antragstellenden Person');
  const gd = add('txtGebDat', 'Geburtsdatum', 120);
  dateFormat(gd, 'dd.mm.yyyy');
  label(page, font, 'Staatsangehörigkeit', y);
  const sa = form.createDropdown('Staatsangehörigkeit');
  tooltip(sa, 'Staatsangehörigkeit');
  sa.addOptions(['deutsch', 'türkisch', 'syrisch', 'ukrainisch', 'afghanisch', 'andere']);
  sa.addToPage(page, { x: 220, y, width: 160, height: 20, font });
  y -= 30;
  label(page, font, 'Beruf (Auswahl oder freie Eingabe)', y);
  const be = form.createDropdown('Beruf');
  be.addOptions(['angestellt', 'selbstständig', 'arbeitsuchend']);
  be.enableEditing();
  be.addToPage(page, { x: 220, y, width: 160, height: 20, font });
  y -= 30;
  add('IBAN', 'IBAN', 300);
  for (let i = 1; i <= 3; i++) {
    add(`Kind${i}_Name`, `Kind ${i}: Name, Vorname`);
    const d = add(`Kind${i}_GebDat`, `Kind ${i}: Geburtsdatum`, 120);
    dateFormat(d, 'dd.mm.yyyy');
  }
  return doc.save();
}

/** C: education-and-participation-like form with an XFA layer next to the AcroForm. */
export async function formBildung(): Promise<Uint8Array> {
  const { doc, page, font, form } = await base('Test C – Antrag Bildung und Teilhabe (nachgebaut)');
  let y = 740;
  for (const [n, c] of [['Name', 'Name des Kindes'], ['Schule', 'Schule / Kita'], ['Klasse', 'Klasse']] as const) {
    label(page, font, c, y);
    const f = form.createTextField(n);
    tooltip(f, c);
    f.addToPage(page, { x: 220, y, width: 260, height: 20, font });
    y -= 30;
  }
  for (const [n, c] of [['Mittagessen', 'Gemeinschaftliche Mittagsverpflegung'], ['Ausflug', 'Ausflüge und Klassenfahrten'], ['Nachhilfe', 'Lernförderung']] as const) {
    label(page, font, c, y);
    const cb = form.createCheckBox(n);
    tooltip(cb, c);
    cb.addToPage(page, { x: 220, y, width: 14, height: 14 });
    y -= 26;
  }
  // Minimal XFA packet: many official forms ship AcroForm + XFA ("hybrid" forms)
  const acro = doc.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
  const xdp = doc.context.flateStream('<?xml version="1.0"?><xdp:xdp xmlns:xdp="http://ns.adobe.com/xdp/"><template/></xdp:xdp>');
  acro.set(PDFName.of('XFA'), doc.context.register(xdp));
  // updateFieldAppearances:false – otherwise save() calls getForm(), which deletes the XFA again
  return doc.save({ updateFieldAppearances: false });
}

export const FIXTURES = { 'test-a-wohnen.pdf': formWohnen, 'test-b-familie.pdf': formFamilie, 'test-c-bildung.pdf': formBildung };
