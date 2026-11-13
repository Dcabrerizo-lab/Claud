// Betragsformat je Sprache und Betragseingabe. Läuft in der App und in Node (Tests).
const Fmt = (function () {
  var LOCALE = { de: 'de-DE', en: 'en-IE', tr: 'tr-TR', ar: 'ar-EG-u-nu-latn', ru: 'ru-RU', uk: 'uk-UA', pl: 'pl-PL', ro: 'ro-RO' };
  var NF = {};

  // Ein Betrag als Text, z. B. euro(1674, 'en') -> „€1,674“, euro(242.7, 'de') -> „242,70 €“. Cent nur, wenn nötig.
  // rtl: Betrag als Einheit isolieren (U+2066 ... U+2069), damit das Eurozeichen in rechts-nach-links-Text beim Betrag bleibt.
  function euro(v, lang, rtl) {
    var cents = Math.round(v * 100) % 100 !== 0;
    var k = lang + (cents ? '2' : '0');
    if (!NF[k]) NF[k] = new Intl.NumberFormat(LOCALE[lang] || 'de-DE', { style: 'currency', currency: 'EUR', currencyDisplay: 'narrowSymbol', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
    var out = NF[k].format(v).replace(/[‎‏؜]/g, '');
    return rtl ? '⁦' + out + '⁩' : out;
  }

  // Betragseingabe: „1.200,50“, „1200“, „1,5“, „950.50“ -> Zahl; leer oder ungültig -> ''
  // Betrag aus einer Eingabe lesen: „1.234,50“, „1234,5“, „780 €“, „780 warm“, „2,050.50“ (englisch). Ungültig oder negativ: ''.
  function parse(v) {
    var raw = String(v == null ? '' : v);
    if (/-\s*\d/.test(raw)) return '';
    var s = raw.replace(/[^\d.,]/g, '');
    if (!s) return '';
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0 && s.lastIndexOf('.') > s.lastIndexOf(',')) s = s.replace(/,/g, '');
    else if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.').replace(/,/g, '');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    else if (!/^\d*\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
    var n = Number(s);
    return isFinite(n) && n >= 0 ? n : '';
  }

  return { euro: euro, parse: parse, LOCALE: LOCALE };
})();
if (typeof module !== 'undefined') module.exports = Fmt;
