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
  function parse(v) {
    var s = String(v == null ? '' : v).replace(/[€\s]/g, '');
    if (!s) return '';
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    else if (!/^\d*\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
    var n = Number(s);
    return isFinite(n) && n >= 0 ? n : '';
  }

  return { euro: euro, parse: parse, LOCALE: LOCALE };
})();
if (typeof module !== 'undefined') module.exports = Fmt;
