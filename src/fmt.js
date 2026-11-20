// Betragsformat je Sprache und Betragseingabe. Läuft in der App und in Node (Tests).
const Fmt = (function () {
  var LOCALE = { de: 'de-DE', en: 'en-IE', tr: 'tr-TR', ar: 'ar-EG-u-nu-latn', ru: 'ru-RU', uk: 'uk-UA', pl: 'pl-PL', ro: 'ro-RO',
    // Dari (fa-AF), Farsi (fa) und Paschtu: gregorianischer Kalender und lateinische Ziffern erzwingen (sonst persischer Kalender und persische Ziffern)
    fr: 'fr-FR', 'fa-AF': 'fa-AF-u-ca-gregory-nu-latn', fa: 'fa-IR-u-ca-gregory-nu-latn', ps: 'ps-AF-u-ca-gregory-nu-latn', so: 'so-SO' };
  // Datum: wie in deutschen Bescheiden (TT.MM.JJJJ), wo das Landesformat missverständlich wäre (Dari: MM/TT/JJJJ; Farsi sonst persischer Kalender)
  var DATUM = { 'fa-AF': 'de-DE', fa: 'de-DE', ps: 'de-DE' };
  function datum(d, lang) {
    try { return d.toLocaleDateString(DATUM[lang] || LOCALE[lang] || 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/[\u200e\u200f\u061c]/g, ''); } catch (e) { return d.toLocaleDateString('de-DE'); }
  }
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
    // Minus in allen Schreibweisen (auch typografisch, wie manche Handy-Tastaturen es setzen): negativ = ungültig
    if (/[-\u2212\u2013\u2012]\s*\d/.test(raw)) return '';
    var s = raw.replace(/[^\d.,]/g, '');
    if (!s) return '';
    // Englisch „2,050.50“: Komma als Tausender, Punkt als Dezimalzeichen
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0 && s.lastIndexOf('.') > s.lastIndexOf(',')) { if (!/^\d{1,3}(,\d{3})*\.\d{1,2}$/.test(s)) return ''; s = s.replace(/,/g, ''); }
    // Deutsch „1.234,56“: Punkte nur als Tausendergruppen vor dem Komma, höchstens zwei Nachkommastellen
    else if (s.indexOf(',') >= 0) { if (!/^(\d+|\d{1,3}(\.\d{3})+),\d{0,2}$/.test(s)) return ''; s = s.replace(/\./g, '').replace(',', '.'); }
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    // Sonst ein Punkt als Dezimalzeichen („950.50“); alles andere (z. B. ein Datum „12.5.2026“) ist kein Betrag
    else if (s.indexOf('.') >= 0 && !/^\d*\.\d{1,2}$/.test(s)) return '';
    var n = Number(s);
    return isFinite(n) && n >= 0 ? n : '';
  }

  // Laienansicht (Beratungsmodus aus): Paragrafen in Klammern ausblenden, z. B. „… Überprüfungsantrag (§ 44 SGB X); …“ -> „… Überprüfungsantrag; …“.
  // Steht vor dem Paragrafen ein Begriff („(Nahtlosigkeit, § 145 SGB III)“), bleibt der Begriff stehen. Texte ohne § bleiben unverändert.
  function ohnePara(s) {
    return String(s).replace(/\s*\(([^()]*)\)/g, function (m, inh) {
      var i = inh.search(/§|Art\.\s*\d/);
      if (i < 0) return m;
      var vor = inh.slice(0, i).replace(/[\s,;،؛]+$/, '');
      return vor ? ' (' + vor + ')' : '';
    });
  }
  // Geburtsdatum einheitlich als TT.MM.JJJJ: „1.2.1985“, „01021985“, „1985-02-01“, „1/2/1985“. Unklares (z. B. zweistellige Jahre) bleibt wie eingegeben.
  function gebDatum(v) {
    var s = String(v == null ? '' : v).trim(), m, t, mo, j;
    if ((m = s.match(/^(\d{1,2})[./ -](\d{1,2})[./ -](\d{4})$/))) { t = +m[1]; mo = +m[2]; j = +m[3]; }
    else if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { j = +m[1]; mo = +m[2]; t = +m[3]; }
    else if ((m = s.match(/^(\d{2})(\d{2})(\d{4})$/))) { t = +m[1]; mo = +m[2]; j = +m[3]; }
    else return s;
    var d = new Date(Date.UTC(j, mo - 1, t));
    if (j < 1900 || j > 2100 || d.getUTCFullYear() !== j || d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== t) return s;
    return (t < 10 ? '0' : '') + t + '.' + (mo < 10 ? '0' : '') + mo + '.' + j;
  }

  return { euro: euro, parse: parse, datum: datum, ohnePara: ohnePara, gebDatum: gebDatum, LOCALE: LOCALE };
})();
if (typeof module !== 'undefined') module.exports = Fmt;
