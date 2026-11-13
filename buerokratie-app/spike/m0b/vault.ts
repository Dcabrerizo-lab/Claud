// Invented vault content for the photo spike (no real persons) and expected matches per test form.
export const VAULT = {
  person: { nachname: 'Müller-Lüdenscheidt', vorname: 'Jürgen', geburtsdatum: '1985-02-01', staatsangehoerigkeit: 'türkisch' },
  adresse: { strasse_hausnr: 'Hauptstraße 12a', plz: '12345', ort: 'Musterstadt-Süd' },
  wohnen: { kaltmiete: '512,50' },
  bank: { iban: 'DE02 1203 0000 0000 2020 51' },
  kinder: [
    { name_vorname: 'Müller, Lena', geburtsdatum: '2015-06-15', schule: 'Grundschule Am Weiher', klasse: '3b' },
    { name_vorname: 'Müller, Can', geburtsdatum: '2018-09-03', schule: 'Kita Sonnenblume', klasse: '' },
    { name_vorname: 'Müller, Ida', geburtsdatum: '2020-02-29', schule: '', klasse: '' },
  ],
};

export function valueFor(key: string, index?: number): string | undefined {
  const [grp, field] = key.split('.');
  if (key === 'person.name_vorname') return `${VAULT.person.nachname}, ${VAULT.person.vorname}`;
  if (grp === 'kind') return (VAULT.kinder[(index ?? 1) - 1] as any)?.[field] || undefined;
  return (VAULT as any)[grp]?.[field];
}

/** form → catalogue key (#index) → field name in the synthetic PDF (ground truth). */
export const EXPECTED: Record<string, Record<string, string>> = {
  'test-a-wohnen': {
    'person.nachname': 'Antragsteller.Name', 'person.vorname': 'Antragsteller.Vorname', 'person.geburtsdatum': 'Antragsteller.Geburtsdatum',
    'adresse.strasse_hausnr': 'Straße_Hausnummer', 'adresse.plz': 'PLZ', 'adresse.ort': 'Ort', 'wohnen.kaltmiete': 'Kaltmiete',
  },
  'test-b-familie': {
    'person.name_vorname': 'txtName', 'person.geburtsdatum': 'txtGebDat', 'person.staatsangehoerigkeit': 'Staatsangehörigkeit', 'bank.iban': 'IBAN',
    'kind.name_vorname#1': 'Kind1_Name', 'kind.geburtsdatum#1': 'Kind1_GebDat', 'kind.name_vorname#2': 'Kind2_Name',
    'kind.geburtsdatum#2': 'Kind2_GebDat', 'kind.name_vorname#3': 'Kind3_Name', 'kind.geburtsdatum#3': 'Kind3_GebDat',
  },
  'test-c-bildung': { 'kind.name_vorname#1': 'Name', 'kind.schule#1': 'Schule', 'kind.klasse#1': 'Klasse' },
};
