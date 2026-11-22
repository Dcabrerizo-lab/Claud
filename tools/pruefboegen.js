#!/usr/bin/env node
// Prüfbögen für ehrenamtliche Muttersprachler (nur Node-Bordmittel).
// Wählt kritische Texte nach festen, nachvollziehbaren Regeln aus src/lang/de.json und allen
// src/lang/<ordner>/de.json und schreibt je Sprache eine druckbare HTML-Datei plus eine
// Zuordnungsliste (CSV: Nr. -> Datei/Schlüssel) nach docs/entwuerfe/sprachen/pruefboegen/.
// Zusätzlich: Bögen der Pflege-Einschätzung für so und ps aus docs/entwuerfe/sprachen/pflege-wartet/.
// Aufruf: node tools/pruefboegen.js   (ändert nichts an src/)
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LANG = path.join(ROOT, 'src/lang');
const OUT = path.join(ROOT, 'docs/entwuerfe/sprachen/pruefboegen');
const WARTET = path.join(ROOT, 'docs/entwuerfe/sprachen/pflege-wartet');

// Reihenfolge der Dringlichkeit (KI am schwächsten zuerst, siehe verfahren-fehlerfrei.md)
const SPRACHEN = ['ps', 'so', 'fa-AF', 'ar', 'fa', 'uk', 'tr', 'ru', 'pl', 'ro', 'fr', 'en'];
const RTL = new Set(['ar', 'fa', 'fa-AF', 'ps']);

// ---------- Auswahlregeln (auf den DEUTSCHEN Text) ----------
// Teil A: Zahlen, Geld, Daten, Gesetze, Fristen, Warnungen, Rechtsfolgen -> besonders wichtig
// Teil B: Anträge, Handlungsanweisungen -> wichtig
const REGELN = [
  { id: 'geld', teil: 'A', name: 'Betrag (€)', re: /€|\bEuro\b|\{eur:|\{(betrag|geld|grenze|u|g|kalt|zuschlag|abschlag|hoechst|deckel|verm|bedarf)\}/ },
  { id: 'datum', teil: 'A', name: 'Datum', re: /\b\d{1,2}\.\d{1,2}\.(\d{2,4})?|\b(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b|\{(datum|stand|d)\}/ },
  { id: 'gesetz', teil: 'A', name: 'Gesetz (§)', re: /§|\bSGB\b|\bArt\.\s*\d|Gesetz|\bBGB\b|\bZPO\b/ },
  { id: 'frist', teil: 'A', name: 'Frist', re: /Frist|spätestens|innerhalb|rückwirkend|Rückwirkend|\bab sofort\b|\bbis zum\b|abgelaufen|verfällt|verfallen|\{(frist|tage|wochen|monate)\}/ },
  { id: 'zeitangabe', teil: 'A', name: 'Zahl mit Zeitraum/Prozent', re: /(\d|\})\s*(-\s*)?(Tage?n?|Wochen?|Monate?n?|Jahre?n?|%|Prozent)\b|(\d|\})\s*%/ },
  { id: 'warnung', teil: 'A', name: 'Warnung', re: /Warnung|Achtung|Vorsicht|Wichtig|\bdroht|drohen|Gefahr|Risiko/ },
  { id: 'folge', teil: 'A', name: 'Rechtsfolge', re: /Sperre|gesperrt|Sanktion|Kürzung|gekürzt|Pfändung|pfänd|P-Konto|Kündigung|kündig|Räumung|Rückforderung|zurückzahlen|zurückfordern|Strafe|strafbar|Bußgeld|Mahnung|Inkasso|Vollstreck|Gerichtsvollzieher|Insolvenz|Abschiebung/ },
  { id: 'rechtsbehelf', teil: 'A', name: 'Widerspruch/Bescheid', re: /Widerspruch|Klage|Sozialgericht|Bescheid|Anhörung|Überprüfungsantrag|Rechtsberatung|Beratungshilfe/ },
  { id: 'ausschluss', teil: 'A', name: 'Ausschluss/Verneinung', re: /\b(kein|keine|keinen)\s+(Anspruch|Geld|Leistung)|gibt es (kein|keine|keinen|nicht|nur)\b|bekommst du (kein|keine|keinen|nicht)\b|\bnur,? wenn\b|ausgeschlossen|angerechnet/ },
  { id: 'zahl', teil: 'B', name: 'Zahl', re: /\d/ },
  { id: 'zeitraum', teil: 'B', name: 'Zeitraum', re: /\bMonat|monatlich|\bTage?n?\b|\bWoche|\bJahr/ },
  { id: 'schulden', teil: 'B', name: 'Schulden', re: /Schulden|Aufenthalt/ },
  { id: 'antrag', teil: 'B', name: 'Antrag', re: /Antrag|beantrag|Anspruch|Nachweis|Mitwirkung|Unterlagen|Formular/ },
  { id: 'handeln', teil: 'B', name: 'Handlungsanweisung', re: /\bmuss\b|\bmusst\b|\bmüssen\b|\bsofort\b|unbedingt|nicht vergessen|\bmelde|\bmelden\b|reich\w* .*\bein\b|\bschick|\bruf\b.*\ban\b|Termin/ }
];

// Zusätzlich die zentrale Liste der App (src/lang/denetz/wichtig.json): Textmuster und Schlüssel,
// die schon heute als "wichtig" gelten (Fristen, Warnungen, Rechtshinweise).
const WICHTIG = JSON.parse(fs.readFileSync(path.join(LANG, 'denetz/wichtig.json'), 'utf8'));
const W_TEXT = new RegExp(WICHTIG.textmuster);
const W_KEY = (WICHTIG.schluessel || []).map((s) => new RegExp(s));
const W_NIE = (WICHTIG.nie || []).map((s) => new RegExp(s));

function regelnFuer(key, text) {
  const treffer = REGELN.filter((r) => r.re.test(text)).map((r) => r);
  const ids = treffer.map((r) => r.id);
  if (W_TEXT.test(text) || W_KEY.some((r) => r.test(key))) ids.push('wichtig');
  if (!ids.length) return null;
  // Überschriften, Knöpfe, Beschriftungen (Liste "nie" der App) nur, wenn Zahl/Geld/Datum/Gesetz drin ist
  const hart = ids.some((i) => ['zahl', 'geld', 'datum', 'gesetz', 'zeitangabe'].includes(i));
  if (!hart && W_NIE.some((r) => r.test(key))) return null;
  const teilA = ids.includes('wichtig') || treffer.some((r) => r.teil === 'A');
  return { ids, teil: teilA ? 'A' : 'B' };
}

// ---------- Texte laden ----------
function ladeJson(p) { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; }
function ordner() {
  const dirs = [''];
  for (const d of fs.readdirSync(LANG).sort()) {
    const p = path.join(LANG, d);
    if (fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'de.json'))) dirs.push(d);
  }
  return dirs;
}
function datei(dir, lang) { return path.join(LANG, dir, lang + '.json'); }
function rel(p) { return path.relative(ROOT, p).split(path.sep).join('/'); }

function kritischeTexte() {
  const liste = [];
  for (const dir of ordner()) {
    const de = ladeJson(datei(dir, 'de'));
    for (const [key, text] of Object.entries(de)) {
      if (typeof text !== 'string' || key.startsWith('_') || /^meta\./.test(key)) continue;
      if (text.trim().length < 3) continue;
      const r = regelnFuer(key, text);
      if (r) liste.push({ dir, key, de: text, regeln: r.ids, teil: r.teil });
    }
  }
  // Teil A zuerst, innerhalb in Datei-Reihenfolge
  return liste.filter((x) => x.teil === 'A').concat(liste.filter((x) => x.teil === 'B'));
}

// ---------- Kurzbogen (ca. 15 Seiten): nur das Allerwichtigste ----------
// Frist/Datum, Betrag, Warnung, Rechtsfolge, Verneinung in Handlungsanweisungen, plus ALLES aus wichtig.json.
// Gleicher deutscher Text nur einmal (weitere Schlüssel stehen in der CSV).
const KURZ = [
  { id: 'frist', re: /Frist(?!en\b)|spätestens|innerhalb (von|eines|der)|rückwirkend|Rückwirkend|bis zum \d|abgelaufen|verfällt|verfallen|\{frist\}/ },
  { id: 'datum', re: /\b\d{1,2}\.\d{1,2}\.(\d{2,4})?|\b(Januar|Februar|März|April|Juni|Juli|August|September|Oktober|November|Dezember)\b|\{datum\}/ },
  { id: 'geld', re: /€|\bEuro\b|\{eur:/ },
  { id: 'warnung', re: /Warnung|Achtung|Vorsicht|\bdroht|drohen|Gefahr/ },
  { id: 'folge', re: /Sperre|gesperrt|Sanktion|Kürzung|gekürzt|kürz|Pfändung|pfänd|Kündigung|kündig|Räumung|Rückforderung|zurückzahlen/ },
  { id: 'verneinung', re: /^(Nicht|Keine?n?|Nie)\s+(?!mehr zeigen|alles|angehakt)\S+(\s+\S+){3,}|\b(nichts|nicht|nie|keine?n?)\s+(\w+\s+){0,2}(unterschreib|zahl|überweis|ignorier|wegwerf|umzieh|kündig|abheb|zusag|aufnehm|verpass|liegen lassen)|\b(unterschreib|ignorier|überweis|kündig|wirf|zieh)\w*\s+(\w+\s+){0,3}(nicht|nichts|nie)\b|\b[Vv]ergiss\b/ }
];
function kurzTexte() {
  const liste = [];
  const nachText = new Map();
  for (const dir of ordner()) {
    const de = ladeJson(datei(dir, 'de'));
    for (const [key, text] of Object.entries(de)) {
      if (typeof text !== 'string' || key.startsWith('_') || /^meta\./.test(key)) continue;
      const ids = KURZ.filter((r) => r.re.test(text)).map((r) => r.id);
      const wichtig = W_TEXT.test(text) || W_KEY.some((r) => r.test(key));
      if (wichtig) ids.push('wichtig');
      if (!ids.length) continue;
      const hart = ids.some((i) => ['geld', 'datum', 'frist'].includes(i));
      if (!hart && W_NIE.some((r) => r.test(key))) continue; // Überschriften, Knöpfe
      // ohne wichtig.json: keine App-Sperre (PIN/Vorgang) und keine kurzen Beschriftungen ohne Zahl
      if (!wichtig && (/^(vg|vgp|clear)\./.test(key) || (text.trim().split(/\s+/).length < 4 && !/\d|€|\{eur:/.test(text)))) continue;
      const norm = text.trim();
      if (nachText.has(norm)) { nachText.get(norm).weitere.push({ dir, key }); continue; }
      const x = { dir, key, de: text, regeln: ids, weitere: [] };
      nachText.set(norm, x);
      liste.push(x);
    }
  }
  return liste;
}

// ---------- Platzhalter mit Beispielwerten ----------
const BEISPIEL_NAME = {
  n: '3', datum: '15.03.2027', stand: '01.01.2027', d: '15.03.2027', tage: '14', monate: '6', wochen: '2', monat: 'März',
  jahr: '2027', betrag: '250 €', geld: '347 €', grenze: '1.200 €', kalt: '480 €', heiz: '90 €', zuschlag: '60 €', abschlag: '50 €',
  hoechst: '520 €', deckel: '520 €', bedarf: '563 €', verm: '15.000 €', u: '200 €', g: '1.560 €', prozent: '60', p: '60', pg: '3',
  stufe: '2', punkte: '47,5', name: 'Wohngeld', titel: 'Wohngeld', stelle: 'Jobcenter', label: 'Wohngeld', kreis: 'Landkreis Erlangen-Höchstadt',
  k: 'III', personen: '4', kind: 'Lena', land: 'Bayern', frist: '1 Monat', rest: 'noch 3 Tage', von: '01.01.2027', bis: '31.12.2027',
  min: '100 €', max: '500 €', lo: '100 €', hi: '500 €', limit: '520 €', kwh: '2.500', ct: '35', pin: '1234', tel: '09131 0000000',
  m: '6', a: '250 €', b: '300 €', c: '350 €', jetzt: '15.03.2027', dauer: '6 Monate', alt: '450 €', neu: '480 €', zeit: '10:00 Uhr', ort: 'Erlangen'
};
function beispiel(ph, text) {
  const m = /^\{eur:(\d+(?:\.\d+)?)\}$/.exec(ph);
  if (m) return Number(m[1]).toLocaleString('de-DE') + ' €';
  const name = ph.slice(1, -1);
  if (name.length > 1 && BEISPIEL_NAME[name]) return BEISPIEL_NAME[name]; // sprechende Namen: fester Beispielwert
  const i = text.indexOf(ph);
  const vor = text.slice(Math.max(0, i - 25), i);
  const nach = text.slice(i + ph.length, i + ph.length + 20);
  if (/^\s*%/.test(nach)) return '60';
  if (/Pflegegrad\s*$/.test(vor)) return '3';
  if (/Steuerklasse\s*$/.test(vor)) return 'III';
  if (/^\s*(Monat|Tag|Woche|Jahr|Punkt|Treffer|Feld|Person|Kind|Seite|Stunde|Mal|kWh)/.test(nach)) return '3';
  if (/(Seite|von)\s*$/.test(vor) && /^[nm]$/.test(name)) return '2';
  if (/(am|vom|bis zum|seit dem|Stand)\s*$/.test(vor) && /^(d|datum|stand|jetzt)$/.test(name)) return '15.03.2027';
  if (/(etwa|rund|von|bis|auf|höchstens|mindestens|maximal)\s*$/.test(vor) || /^\s*(im Monat|im Jahr|pro|monatlich|Unterhalt|€)/.test(nach)) return BEISPIEL_NAME[name] && /€/.test(BEISPIEL_NAME[name]) ? BEISPIEL_NAME[name] : '250 €';
  if (BEISPIEL_NAME[name]) return BEISPIEL_NAME[name];
  return null; // unbekannt: Wort oder Zahl aus der App
}
function platzhalter(text) {
  return Array.from(new Set(text.match(/\{[^{}\s]+\}/g) || []));
}

// ---------- Anleitung je Sprache ----------
const DE = {
  anleitung: 'Links steht der deutsche Text, rechts die Übersetzung in Ihrer Sprache. Kreuzen Sie bei jeder Zeile an: „stimmt“ oder „stimmt nicht“ – achten Sie besonders auf Zahlen, Beträge, Daten und Fristen. Wenn etwas falsch oder schwer verständlich ist, schreiben Sie den besseren Text in die Spalte „besser so“; Stellen in geschweiften Klammern wie {n} bitte unverändert lassen.',
  pflege: 'Antwortstufen (★, grau hinterlegt) bitte besonders genau prüfen: Die Stufen müssen klar von „leicht“ nach „schwer“ gehen.',
  stimmt: 'stimmt', nicht: 'stimmt nicht', besser: 'besser so', nr: 'Nr.', deutsch: 'Deutsch', uebers: 'Übersetzung'
};
const T = {
  en: { sprache: 'English', anleitung: 'On the left is the German text, on the right the translation into your language. For each line, tick “correct” or “not correct” – pay special attention to numbers, amounts, dates and deadlines. If something is wrong or hard to understand, write the better text in the column “better like this”; please leave parts in curly brackets such as {n} unchanged.', stimmt: 'correct', nicht: 'not correct', besser: 'better like this', uebers: 'Translation' },
  fr: { sprache: 'Français', anleitung: 'À gauche se trouve le texte allemand, à droite la traduction dans votre langue. Pour chaque ligne, cochez « correct » ou « pas correct » – faites particulièrement attention aux chiffres, aux montants, aux dates et aux délais. Si quelque chose est faux ou difficile à comprendre, écrivez un meilleur texte dans la colonne « mieux ainsi » ; merci de laisser inchangées les parties entre accolades comme {n}.', stimmt: 'correct', nicht: 'pas correct', besser: 'mieux ainsi', uebers: 'Traduction' },
  pl: { sprache: 'Polski', anleitung: 'Po lewej stronie jest tekst niemiecki, po prawej tłumaczenie na język polski. Przy każdym wierszu proszę zaznaczyć „zgadza się” lub „nie zgadza się” – szczególnie proszę zwrócić uwagę na liczby, kwoty, daty i terminy. Jeśli coś jest błędne lub trudne do zrozumienia, proszę wpisać lepszy tekst w kolumnie „lepiej tak”; fragmenty w nawiasach klamrowych, np. {n}, proszę pozostawić bez zmian.', stimmt: 'zgadza się', nicht: 'nie zgadza się', besser: 'lepiej tak', uebers: 'Tłumaczenie' },
  ro: { sprache: 'Română', anleitung: 'În stânga este textul german, în dreapta traducerea în limba română. La fiecare rând bifați „corect” sau „incorect” – fiți atenți mai ales la cifre, sume, date și termene. Dacă ceva este greșit sau greu de înțeles, scrieți textul mai bun în coloana „mai bine așa”; vă rugăm să lăsați neschimbate părțile dintre acolade, de exemplu {n}.', stimmt: 'corect', nicht: 'incorect', besser: 'mai bine așa', uebers: 'Traducere' },
  ru: { sprache: 'Русский', anleitung: 'Слева — текст на немецком, справа — перевод на русский язык. В каждой строке отметьте «верно» или «неверно» — особенно внимательно проверяйте числа, суммы, даты и сроки. Если что-то неправильно или трудно понять, напишите лучший вариант в столбце «лучше так»; части в фигурных скобках, например {n}, оставьте без изменений.', stimmt: 'верно', nicht: 'неверно', besser: 'лучше так', uebers: 'Перевод' },
  uk: { sprache: 'Українська', anleitung: 'Ліворуч — текст німецькою, праворуч — переклад українською мовою. У кожному рядку позначте «правильно» або «неправильно» — особливо уважно перевіряйте числа, суми, дати та строки. Якщо щось неправильно або важко зрозуміти, напишіть кращий варіант у стовпці «краще так»; частини у фігурних дужках, наприклад {n}, залиште без змін.', stimmt: 'правильно', nicht: 'неправильно', besser: 'краще так', uebers: 'Переклад' },
  tr: { sprache: 'Türkçe', anleitung: 'Solda Almanca metin, sağda Türkçe çevirisi yer alıyor. Her satırda “doğru” ya da “doğru değil” seçeneğini işaretleyin – özellikle sayılara, tutarlara, tarihlere ve sürelere dikkat edin. Bir şey yanlışsa veya anlaşılması zorsa, daha iyi metni “böyle daha iyi” sütununa yazın; {n} gibi süslü parantez içindeki kısımları lütfen değiştirmeyin.', stimmt: 'doğru', nicht: 'doğru değil', besser: 'böyle daha iyi', uebers: 'Çeviri' },
  ar: { sprache: 'العربية', anleitung: 'على اليسار النص الألماني، وعلى اليمين الترجمة إلى اللغة العربية. ضع علامة في كل سطر: «صحيح» أو «غير صحيح» – وانتبه بشكل خاص إلى الأرقام والمبالغ والتواريخ والمهل. إذا كان هناك خطأ أو كان النص صعب الفهم، فاكتب نصًا أفضل في عمود «الأفضل هكذا»؛ ويرجى عدم تغيير الأجزاء الموجودة بين الأقواس المعقوفة مثل {n}.', stimmt: 'صحيح', nicht: 'غير صحيح', besser: 'الأفضل هكذا', uebers: 'الترجمة' },
  fa: { sprache: 'فارسی', anleitung: 'در سمت چپ متن آلمانی و در سمت راست ترجمه به زبان فارسی آمده است. در هر سطر علامت بزنید: «درست است» یا «درست نیست» – به‌ویژه به اعداد، مبلغ‌ها، تاریخ‌ها و مهلت‌ها دقت کنید. اگر چیزی نادرست است یا فهمیدنش دشوار است، متن بهتر را در ستون «بهتر این‌طور» بنویسید؛ لطفاً بخش‌های داخل آکولاد مانند {n} را تغییر ندهید.', stimmt: 'درست است', nicht: 'درست نیست', besser: 'بهتر این‌طور', uebers: 'ترجمه' },
  'fa-AF': { sprache: 'دری', anleitung: 'در طرف چپ متن آلمانی و در طرف راست ترجمه به زبان دری است. در هر سطر نشانی بگذارید: «درست است» یا «درست نیست» – مخصوصاً به عددها، مبلغ‌ها، تاریخ‌ها و میعادها دقت کنید. اگر چیزی غلط است یا فهمیدنش مشکل است، متن بهتر را در ستون «بهتر این طور» بنویسید؛ لطفاً قسمت‌های داخل قوس‌ها مانند {n} را تغییر ندهید.', stimmt: 'درست است', nicht: 'درست نیست', besser: 'بهتر این طور', uebers: 'ترجمه' },
  ps: { sprache: 'پښتو', anleitung: 'کیڼ اړخ ته الماني متن دی، ښي اړخ ته یې پښتو ژباړه ده. په هره کرښه کې نښه ولګوئ: «سم دی» یا «سم نه دی» – په ځانګړي ډول شمېرو، مبلغونو، نېټو او مودو ته پام وکړئ. که څه غلط وي یا پوهېدل یې ګران وي، ښه متن د «داسې ښه دی» په ستون کې ولیکئ؛ مهرباني وکړئ د قوسونو دننه برخې لکه {n} مه بدلوئ.', stimmt: 'سم دی', nicht: 'سم نه دی', besser: 'داسې ښه دی', uebers: 'ژباړه', pflege: 'د ځواب درجې (★، خړ رنګ) په ځانګړي ډول وګورئ: درجې باید په روښانه ډول له «اسانه» تر «سخته» پورې وي.' },
  so: { sprache: 'Soomaali', anleitung: 'Dhinaca bidix waa qoraalka Jarmalka, dhinaca midigna waa turjumaadda af-Soomaaliga. Saf kasta calaamadee: «sax» ama «sax ma aha» – si gaar ah u fiiri tirooyinka, lacagaha, taariikhaha iyo waqtiyada kama dambaysta ah. Haddii wax khaldan yihiin ama ay adag tahay in la fahmo, ku qor qoraal ka wanaagsan tiirka «sidan ayaa ka wanaagsan»; fadlan ha beddelin qaybaha ku jira qawsaha sida {n}.', stimmt: 'sax', nicht: 'sax ma aha', besser: 'sidan ayaa ka wanaagsan', uebers: 'Turjumaad', pflege: 'Heerarka jawaabaha (★, midab cawl) si gaar ah u hubi: heerarku waa inay si cad uga socdaan «fudud» ilaa «adag».' }
};
const SPRACHNAME_DE = { ps: 'Paschtu', so: 'Somali', 'fa-AF': 'Dari', ar: 'Arabisch', fa: 'Persisch (Farsi)', uk: 'Ukrainisch', tr: 'Türkisch', ru: 'Russisch', pl: 'Polnisch', ro: 'Rumänisch', fr: 'Französisch', en: 'Englisch' };

// ---------- HTML ----------
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function markiere(s) { return esc(s).replace(/\{[^{}\s]+\}/g, (m) => '<span class="ph" dir="ltr">' + m + '</span>'); }

const CSS = `
@page { size: A4 portrait; margin: 12mm 10mm 14mm 10mm; }
* { box-sizing: border-box; }
body { font-family: "Noto Sans", "DejaVu Sans", Arial, sans-serif; font-size: 13.5pt; line-height: 1.4; color: #000; margin: 0 auto; max-width: 190mm; }
.rtl, [dir=rtl] { font-family: "Noto Naskh Arabic", "Noto Sans Arabic", "Scheherazade New", Tahoma, Arial, sans-serif; font-size: 15pt; line-height: 1.6; }
h1 { font-size: 19pt; margin: 0 0 4mm; }
h2 { font-size: 15pt; margin: 6mm 0 2mm; }
.kopf { display: flex; gap: 6mm; flex-wrap: wrap; font-size: 12pt; margin-bottom: 3mm; }
.kopf span { border-bottom: 1px solid #000; min-width: 55mm; display: inline-block; }
.anl { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; border: 2px solid #000; padding: 3mm 4mm; margin-bottom: 4mm; }
.anl p { margin: 0 0 2mm; }
.anl .ziel { border-left: 1px solid #888; padding-left: 4mm; }
.anl .ziel[dir=rtl] { border-left: 0; border-right: 1px solid #888; padding-left: 0; padding-right: 4mm; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
thead { display: table-header-group; }
th, td { border: 1px solid #000; padding: 2mm; vertical-align: top; overflow-wrap: anywhere; }
th { background: #e6e6e6; font-size: 12pt; text-align: start; }
tr { break-inside: avoid; page-break-inside: avoid; }
col.nr { width: 9mm; } col.de { width: 30%; } col.ue { width: 30%; } col.ok { width: 27mm; } col.bs { width: auto; }
td.nr { text-align: center; font-weight: bold; }
td.ok { font-size: 12pt; white-space: nowrap; }
td.ok div { margin-bottom: 2mm; }
.box { display: inline-block; width: 5mm; height: 5mm; border: 1.5px solid #000; vertical-align: middle; margin-inline-end: 1.5mm; }
.bsp { display: block; font-size: 11pt; color: #333; margin-top: 1.5mm; border-top: 1px dotted #888; padding-top: 1mm; }
.ph { background: #fff3a8; border: 1px solid #c9b200; border-radius: 1mm; padding: 0 0.5mm; font-family: "DejaVu Sans Mono", monospace; font-size: 0.85em; unicode-bidi: isolate; }
tr.stufe td { background: #eeeeee; }
.stern { font-weight: bold; }
.leer { color: #a00; font-style: italic; }
.teil { background: #000; color: #fff; font-weight: bold; font-size: 13pt; }
.fuss { font-size: 10.5pt; color: #333; margin-top: 4mm; }
@media print { .noprint { display: none; } a { color: #000; text-decoration: none; } }
`;

function anleitungHtml(lang, mitPflege) {
  const t = T[lang];
  const dir = RTL.has(lang) ? 'rtl' : 'ltr';
  const z = (s) => markiere(s);
  return `<div class="anl">
<div class="de" lang="de" dir="ltr"><p><b>So geht es</b></p><p>${z(DE.anleitung)}</p>${mitPflege ? `<p>${esc(DE.pflege)}</p>` : ''}</div>
<div class="ziel" lang="${lang}" dir="${dir}"><p><b>${esc(t.sprache)}</b></p><p>${z(t.anleitung)}</p>${mitPflege && t.pflege ? `<p>${esc(t.pflege)}</p>` : ''}</div>
</div>`;
}

function zelleBeispiel(de) {
  const phs = platzhalter(de);
  if (!phs.length) return '';
  const teile = phs.map((p) => {
    const b = beispiel(p, de);
    return '<span class="ph" dir="ltr">' + esc(p) + '</span> = ' + (b ? esc(b) : '<i>Wort/Zahl aus der App</i>');
  });
  return '<span class="bsp">Beispiel: ' + teile.join(' · ') + '</span>';
}

function seite({ lang, titel, untertitel, zeilen, mitPflege, stufeMarke, kurz }) {
  const t = T[lang];
  const dir = RTL.has(lang) ? 'rtl' : 'ltr';
  let teil = null;
  if (kurz) return seiteKurz({ lang, titel, untertitel, zeilen });
  const rows = zeilen.map((z) => {
    let kopf = '';
    if (z.teil && z.teil !== teil) {
      teil = z.teil;
      kopf = `<tr><td class="teil" colspan="5">${teil === 'A' ? 'Teil A – besonders wichtig (Zahlen, Beträge, Daten, Fristen, Warnungen, Rechtsfolgen)' : 'Teil B – wichtig (Anträge, Handlungsanweisungen)'}</td></tr>\n`;
    }
    const stufe = stufeMarke && stufeMarke(z.key);
    const ue = z.ue == null ? '<span class="leer">(fehlt)</span>' : markiere(z.ue);
    return kopf + `<tr${stufe ? ' class="stufe"' : ''}><td class="nr">${stufe ? '<span class="stern">★</span><br>' : ''}${z.nr}</td>` +
      `<td lang="de" dir="ltr">${markiere(z.de)}${zelleBeispiel(z.de)}</td>` +
      `<td lang="${lang}" dir="${dir}">${ue}</td>` +
      `<td class="ok"><div><span class="box"></span>${esc(DE.stimmt)}</div><div><span class="box"></span>${esc(DE.nicht)}</div>` +
      `<div lang="${lang}" dir="${dir}" style="font-size:11pt;color:#333">${esc(t.stimmt)} / ${esc(t.nicht)}</div></td>` +
      `<td></td></tr>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<style>${CSS}</style>
</head>
<body>
<h1>${esc(titel)}</h1>
<div class="kopf">Name (freiwillig): <span>&nbsp;</span> Datum: <span>&nbsp;</span></div>
<p style="font-size:11.5pt;margin:0 0 3mm">${esc(untertitel)}</p>
${anleitungHtml(lang, mitPflege)}
<table>
<colgroup><col class="nr"><col class="de"><col class="ue"><col class="ok"><col class="bs"></colgroup>
<thead><tr><th>${DE.nr}</th><th>${DE.deutsch}</th><th>${DE.uebers} / <span lang="${lang}" dir="${dir}">${esc(t.uebers)}</span></th><th>${esc(DE.stimmt)}?</th><th>${esc(DE.besser)} / <span lang="${lang}" dir="${dir}">${esc(t.besser)}</span></th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p class="fuss">Die Nummern gehören zur Liste ${mitPflege ? 'pflege-' : ''}${esc(lang)}${kurz ? '-kurz' : ''}.csv im selben Ordner. Bitte den ausgefüllten Bogen (Papier, Foto oder Scan) zurückgeben.</p>
</body>
</html>
`;
}

// Kurzbogen: platzsparend. Deutsch und Übersetzung nebeneinander über die volle Breite,
// darunter eine Zeile mit den Kästchen und Platz für „besser so“.
const CSS_KURZ = `
body { font-size: 12.5pt; line-height: 1.35; }
.rtl, [dir=rtl] { font-size: 14pt; line-height: 1.5; }
table.k col.nr { width: 9mm; } table.k col.de, table.k col.ue { width: auto; }
table.k tbody { break-inside: avoid; page-break-inside: avoid; }
table.k td { padding: 1.5mm 2mm; }
table.k tr.pruef td { border-top: 1px dashed #777; font-size: 11.5pt; padding-top: 1mm; padding-bottom: 5mm; }
table.k tr.pruef .bl { display: inline-block; margin-inline-end: 5mm; }
table.k .bsp { font-size: 10.5pt; }
`;
function seiteKurz({ lang, titel, untertitel, zeilen }) {
  const t = T[lang];
  const dir = RTL.has(lang) ? 'rtl' : 'ltr';
  const rows = zeilen.map((z) => `<tbody><tr><td class="nr" rowspan="2">${z.nr}</td>` +
    `<td lang="de" dir="ltr">${markiere(z.de)}${zelleBeispiel(z.de)}</td>` +
    `<td lang="${lang}" dir="${dir}">${markiere(z.ue)}</td></tr>` +
    `<tr class="pruef"><td colspan="2"><span class="bl"><span class="box"></span>${esc(DE.stimmt)} <span lang="${lang}" dir="${dir}">(${esc(t.stimmt)})</span></span>` +
    `<span class="bl"><span class="box"></span>${esc(DE.nicht)} <span lang="${lang}" dir="${dir}">(${esc(t.nicht)})</span></span>` +
    `<span class="bl">${esc(DE.besser)} <span lang="${lang}" dir="${dir}">(${esc(t.besser)})</span>: </span></td></tr></tbody>`).join('\n');
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<style>${CSS}${CSS_KURZ}</style>
</head>
<body>
<h1>${esc(titel)}</h1>
<div class="kopf">Name (freiwillig): <span>&nbsp;</span> Datum: <span>&nbsp;</span></div>
<p style="font-size:11pt;margin:0 0 3mm">${esc(untertitel)} Wenn der Platz für „besser so“ nicht reicht: Nummer und besseren Text auf der Rückseite notieren.</p>
${anleitungHtml(lang, false)}
<table class="k">
<colgroup><col class="nr"><col class="de"><col class="ue"></colgroup>
<thead><tr><th>${DE.nr}</th><th>${DE.deutsch}</th><th>${DE.uebers} / <span lang="${lang}" dir="${dir}">${esc(t.uebers)}</span></th></tr></thead>
${rows}
</table>
<p class="fuss">Die Nummern gehören zur Liste ${esc(lang)}-kurz.csv im selben Ordner. Bitte den ausgefüllten Bogen (Papier, Foto oder Scan) zurückgeben.</p>
</body>
</html>
`;
}

function csvZelle(s) { s = s == null ? '' : String(s); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function schreibeCsv(datei, kopf, zeilen) {
  const txt = '﻿' + [kopf].concat(zeilen).map((r) => r.map(csvZelle).join(';')).join('\r\n') + '\r\n';
  fs.writeFileSync(datei, txt);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const krit = kritischeTexte();
  const stand = new Date().toISOString().slice(0, 10);
  const bericht = [];
  for (const lang of SPRACHEN) {
    const cache = {};
    const zeilen = [];
    let fehlt = 0;
    for (const x of krit) {
      if (!(x.dir in cache)) cache[x.dir] = ladeJson(datei(x.dir, lang)) || {};
      const ue = cache[x.dir][x.key];
      if (typeof ue !== 'string') { fehlt++; continue; } // keine Übersetzung (z. B. Pflege in so/ps: eigener Bogen)
      zeilen.push({ nr: zeilen.length + 1, teil: x.teil, dir: x.dir, key: x.key, de: x.de, ue, regeln: x.regeln });
    }
    const html = seite({
      lang, zeilen,
      titel: `Prüfbogen ${SPRACHNAME_DE[lang]} (${lang}) – SoLo`,
      untertitel: `${zeilen.length} Texte, ausgewählt nach festen Regeln (tools/pruefboegen.js). Stand der Texte: Branch claude/test-update-naechstes, erzeugt am ${stand}.`
    });
    fs.writeFileSync(path.join(OUT, lang + '.html'), html);
    schreibeCsv(path.join(OUT, lang + '.csv'), ['nr', 'teil', 'datei', 'schluessel', 'regeln', 'deutsch', 'uebersetzung', 'ergebnis', 'besser_so'],
      zeilen.map((z) => [z.nr, z.teil, rel(datei(z.dir, lang)), z.key, z.regeln.join(' '), z.de, z.ue, '', '']));
    bericht.push({ lang, n: zeilen.length, a: zeilen.filter((z) => z.teil === 'A').length, fehlt });
  }

  // Kurzbögen
  const kurz = kurzTexte();
  for (const lang of SPRACHEN) {
    const cache = {};
    const lade = (dir) => {
      if (!(dir in cache)) {
        cache[dir] = ladeJson(datei(dir, lang)) || {};
        // Pflege in so/ps ist noch nicht in der App: Übersetzung aus pflege-wartet nehmen
        if (dir === 'pflege' && !fs.existsSync(datei(dir, lang))) cache[dir] = ladeJson(path.join(WARTET, lang + '.json')) || {};
      }
      return cache[dir];
    };
    const quelle = (dir) => (dir === 'pflege' && !fs.existsSync(datei(dir, lang))) ? 'docs/entwuerfe/sprachen/pflege-wartet/' + lang + '.json' : rel(datei(dir, lang));
    const zeilen = [];
    for (const x of kurz) {
      const ue = lade(x.dir)[x.key];
      if (typeof ue !== 'string') continue;
      zeilen.push({ nr: zeilen.length + 1, dir: x.dir, key: x.key, de: x.de, ue, regeln: x.regeln, weitere: x.weitere });
    }
    const html = seite({
      lang, zeilen, kurz: true,
      titel: `Kurzbogen ${SPRACHNAME_DE[lang]} (${lang}) – SoLo`,
      untertitel: `${zeilen.length} besonders wichtige Texte (Fristen, Daten, Beträge, Warnungen, Rechtsfolgen, Verbote). Bitte diesen Bogen zuerst prüfen. Stand der Texte: Branch claude/test-update-naechstes, erzeugt am ${stand}.`
    });
    fs.writeFileSync(path.join(OUT, lang + '-kurz.html'), html);
    schreibeCsv(path.join(OUT, lang + '-kurz.csv'), ['nr', 'datei', 'schluessel', 'weitere_schluessel_gleicher_text', 'regeln', 'deutsch', 'uebersetzung', 'ergebnis', 'besser_so'],
      zeilen.map((z) => [z.nr, quelle(z.dir), z.key, z.weitere.map((w) => quelle(w.dir) + ':' + w.key).join(' | '), z.regeln.join(' '), z.de, z.ue, '', '']));
    bericht.push({ lang: lang + '-kurz', n: zeilen.length, a: zeilen.length, fehlt: kurz.length - zeilen.length });
  }

  // Pflege-Einschätzung so/ps: alle Schlüssel, Antwortstufen markiert
  const pflDe = ladeJson(path.join(LANG, 'pflege/de.json'));
  const istStufe = (k) => /^pfl\.antworten\./.test(k);
  for (const lang of ['so', 'ps']) {
    const ue = ladeJson(path.join(WARTET, lang + '.json')) || {};
    const zeilen = Object.keys(pflDe).filter((k) => typeof pflDe[k] === 'string')
      .map((k, i) => ({ nr: i + 1, key: k, de: pflDe[k], ue: typeof ue[k] === 'string' ? ue[k] : null }));
    // Antwortstufen zuerst (am wichtigsten für das Ergebnis), dann der Rest in Datei-Reihenfolge
    const sortiert = zeilen.filter((z) => istStufe(z.key)).concat(zeilen.filter((z) => !istStufe(z.key)))
      .map((z, i) => Object.assign(z, { nr: i + 1 }));
    const html = seite({
      lang, zeilen: sortiert, mitPflege: true, stufeMarke: istStufe,
      titel: `Prüfbogen Pflege-Einschätzung ${SPRACHNAME_DE[lang]} (${lang}) – SoLo`,
      untertitel: `Alle ${sortiert.length} Texte der Pflege-Einschätzung (src/lang/pflege/de.json gegen docs/entwuerfe/sprachen/pflege-wartet/${lang}.json). Die mit ★ markierten Antwortstufen stehen am Anfang. Erzeugt am ${stand}.`
    });
    fs.writeFileSync(path.join(OUT, 'pflege-' + lang + '.html'), html);
    schreibeCsv(path.join(OUT, 'pflege-' + lang + '.csv'), ['nr', 'antwortstufe', 'datei', 'schluessel', 'deutsch', 'uebersetzung', 'ergebnis', 'besser_so'],
      sortiert.map((z) => [z.nr, istStufe(z.key) ? 'ja' : '', 'docs/entwuerfe/sprachen/pflege-wartet/' + lang + '.json', z.key, z.de, z.ue, '', '']));
    bericht.push({ lang: 'pflege-' + lang, n: sortiert.length, a: sortiert.filter((z) => istStufe(z.key)).length, fehlt: sortiert.filter((z) => z.ue == null).length });
  }

  console.log('Kritische deutsche Texte: ' + krit.length + ' (Teil A ' + krit.filter((x) => x.teil === 'A').length + ', Teil B ' + krit.filter((x) => x.teil === 'B').length + ')');
  for (const b of bericht) console.log(b.lang.padEnd(10) + ' Texte ' + String(b.n).padStart(4) + '  (Teil A/Stufen ' + b.a + ', ohne Übersetzung ' + b.fehlt + ')');
}

main();
