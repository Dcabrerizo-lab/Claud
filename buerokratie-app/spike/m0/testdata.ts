// Invented test data only – no real persons.
import { readFileSync } from 'node:fs';
import type { FillValues, FontSpec } from '../../src/pdf/fill.js';

const font = (p: string) => new Uint8Array(readFileSync(new URL('../../node_modules/' + p, import.meta.url)));
/** Noto Sans (Latin, Latin Extended, Cyrillic, Greek) first, then Noto Sans Arabic. SIL OFL 1.1. */
export const FONTS: FontSpec[] = [
  { bytes: font('@expo-google-fonts/noto-sans/400Regular/NotoSans_400Regular.ttf'), subset: false },
  { bytes: font('@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf'), subset: true },
];

export const VALUES: Record<string, FillValues> = {
  'test-a-wohnen.pdf': {
    'Antragsteller.Name': 'Müller-Lüdenscheidt',
    'Antragsteller.Vorname': 'Jürgen Özgür',
    'Antragsteller.Geburtsdatum': '01021985', // comb field TTMMJJJJ: digits only
    'Straße_Hausnummer': 'Hauptstraße 12a',
    PLZ: '12345',
    Ort: 'Musterstadt-Süd',
    Kaltmiete: '512,50',
    Bemerkungen: 'Umzug am 01.03.2026 – Wohnfläche 54 m²',
    Mieter: true,
    Familienstand: 'verheiratet',
  },
  'test-b-familie.pdf': {
    txtName: 'Şahin, Ayşe Yıldız',
    txtGebDat: '07.11.1990', // format script AFDate_FormatEx("dd.mm.yyyy")
    'Staatsangehörigkeit': 'türkisch',
    Beruf: 'Pflegehelferin', // free text in editable combo
    IBAN: 'DE02 1203 0000 0000 2020 51', // public test IBAN pattern
    Kind1_Name: 'Коваленко, Олена',
    Kind1_GebDat: '15.06.2015',
    Kind2_Name: 'محمد الأحمد',
    Kind2_GebDat: '03.09.2018',
    Kind3_Name: 'Wójcik, Łucja Ștefănescu',
    Kind3_GebDat: '29.02.2020',
  },
  'test-c-bildung.pdf': {
    Name: 'Lüttge, Sören',
    Schule: 'Grundschule Am Weiher',
    Klasse: '3b',
    Mittagessen: true,
    Ausflug: false,
    Nachhilfe: true,
  },
};
