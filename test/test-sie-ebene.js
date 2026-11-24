// Tests: Sie-Ebene von „SoLo Pflege & Rente“ (src/lang/sie/*.json, nur VARIANTE=pflege; Entscheidung David 24.11.2026)
// - Kein erreichbarer Text der Pflege-Variante spricht mit Du an: Deutsch und Einfache Sprache (Heuristik aus tools/sie-schluessel.js),
//   tr, ru, uk, pl, ro, fr (eindeutige Du-Pronomen und Du-Imperative, Ausnahmen unten mit Grund).
// - Jeder Schlüssel der Sie-Ebene gibt es in der Grundfassung und er gehört nicht zu den neuen Namensräumen der Variante.
// - Platzhalter und Zahlen sind in Grundtext und Sie-Fassung gleich (nur die Anrede ändert sich).
// - Die Sie-Ebene wirkt nur in der Pflege-Variante: SoLo lädt sie nicht.
'use strict';
const fs = require('fs');
const path = require('path');
const build = require('../scripts/build.js');
const S = require('../tools/sie-schluessel.js');

let n = 0, f = 0;
const ok = (name, c, info) => { n++; if (!c) { f++; console.log('FEHLER', name, info !== undefined ? JSON.stringify(info) : ''); } };
const ORDNER = path.join(__dirname, '..', 'src', 'lang', 'sie');
const SPRACHEN = ['de', 'einfach', 'tr', 'ru', 'uk', 'pl', 'ro', 'fr'];
const lies = (l) => JSON.parse(fs.readFileSync(path.join(ORDNER, l + '.json'), 'utf8'));
const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join();
const zahlen = (s) => (String(s).replace(/\{\w+\}/g, '').match(/\d+(?:[.,]\d+)*/g) || []).sort().join();

// Eindeutige Du-Formen je Sprache
const W = (l) => '(?<![\\p{L}\\p{M}’\'-])(?:' + l + ')(?![\\p{L}\\p{M}’\'])';
const SATZ = '(?:^|[.!?:;,]\\s+)';
const DU = {
  ru: new RegExp(W('ты|тебя|тебе|тобой|твой|твоя|твоё|твое|твои|твоего|твоей|твоих|твоим|твою|твоему|твоими|Выбери|Введи|Подай|Проверь|Подавай|Подожди|Открывай|Собери|Подпиши|Разблокируй|Укажи|Нажми|Спроси|Оставь|Отправь|Обратись|Возьми|Попроси|Узнай|Сохрани|Заполни|Приложи|Подготовь|Запиши|Сообщи|Добавь|Позвони|Посмотри|Иди|Сделай|Получи|Используй|Принеси|Сохраняй|Храни|Обращайся|Приходи|Покажи|Прочитай|Убедись|Удали|Вставь|Сфотографируй|Отсканируй|Впиши|Не забудь'), 'iu'),
  uk: new RegExp(W('ти|тебе|тобі|тобою|твій|твоя|твоє|твої|твого|твоєї|твоїх|твоїм|твою|твоєму|твоїми|Обери|Введи|Подай|Подавай|Зачекай|Відкривай|Збери|Підпиши|Вибери|Розблокуй|Вкажи|Натисни|Запитай|Залиш|Надішли|Звернися|Візьми|Попроси|Дізнайся|Збережи|Заповни|Додай|Перевір|Покажи|Підготуй|Запиши|Іди|Повідом|Зроби|Отримай|Використовуй|Принеси|Зберігай|Прочитай|Переконайся|Видали|Встав|Сфотографуй|Відскануй|Впиши|Не забудь'), 'iu'),
  pl: new RegExp(W('ty|ciebie|cię|tobie|tobą|twój|twoja|twoje|twoi|twojego|twojej|twoich|twoim|twoją|twoimi|masz|możesz|jesteś|musisz|chcesz|dostaniesz|znajdziesz|widzisz|wiesz|płacisz|mieszkasz|potrzebujesz|zobaczysz|otrzymujesz|dostajesz|będziesz|zarabiasz|pracujesz|opiekujesz|pobierasz|złożysz|wpiszesz|zapomnisz|zostaniesz'), 'iu'),
  fr: new RegExp(W('tu|te|toi|ton|ta|tes') + "|(?<![\\p{L}])t['’]|" + SATZ + W('Choisis|Saisis|Indique|Vérifie|Touche|Prends|Fais|Envoie|Remplis|Ouvre|Ajoute|Scanne|Attends|Réessaie|Apporte|Joins|Regarde|Imprime|Partage|Enregistre|Renseigne-toi|Fais-toi|Laisse|Va|Utilise|Appelle|Écris|Donne|Lis|Déverrouille|Note|Pose|Coche|Tape|Écoute|Relis|Montre|Sélectionne|Corrige|Complète|Signe'), 'iu'),
  ro: new RegExp(W('tu|tine|tău|tale|tăi|îți|îţi|ți|ţi|te|poți|poţi|ești|eşti|ai uitat|nu ai|dacă ai|ta'), 'iu'),
  tr: new RegExp(W('sen|seni|sana|senin|sende|senden|hanen|hanende|seninle'), 'iu'),
};
// Satz-Imperative der Du-Form; kurze Schaltflächen und Überschriften sind in pl, ro und tr üblich und bleiben (Ausnahmeliste unten)
const IMP = {
  pl: new RegExp(SATZ + W('Wpisz|Wybierz|Sprawdź|Złóż|Zapytaj|Zostaw|Podaj|Wyślij|Idź|Weź|Poproś|Zapisz|Dodaj|Otwórz|Zeskanuj|Skontaktuj|Przynieś|Dołącz|Zachowaj|Odblokuj|Spróbuj|Poczekaj|Pamiętaj|Zgłoś|Zadzwoń|Napisz|Przeczytaj|Wklej|Uzupełnij|Nie licz|Licz|Zbierz|Podpisz|Pokaż|Zrób|Zleć|Użyj|Daj|Skorzystaj'), 'u'),
  ro: new RegExp(SATZ + W('Introdu|Alege|Verifică|Depune|Depune-o|Întreabă|Trimite|Cere|Adaugă|Deschide|Scanează|Salvează|Păstrează|Adu|Încearcă|Așteaptă|Atinge|Mergi|Ia|Fă|Lasă|Notează|Semnează|Folosește|Copiază|Lipește|Deblochează|Spune|Sună|Citește|Completează|Strânge|Pregătește|Nu uita'), 'u'),
  tr: /(?<![\p{L}])(gir|seç|sor|başvur|bırak|gönder|getir|ekle|yaz|bekle|tara|kaydet|dokun|kontrol et|kontrol ettir|aç|sakla|dene|iste|ara|git|al|ver|yap|topla|imzala|hazırla|sil|bak|söyle|danış|ettir|kullan|unutma|yapıştır|kopyala)(?=\s*(?:[.!:;,(]|$))/u,
};
const kurz = (t) => !/[.!?]/.test(t.replace(/…$/, '')) && t.trim().split(/\s+/).length <= 4;
// Ausnahmen mit Grund
const AUSNAHMEN = {
  // Handlungs-Überschriften und Schaltflächen: Du-Imperativ ist in pl, ro und tr die übliche Form (wie „Usuń“, „Șterge“, „Sil“)
  pl: ['pa.hoeher', 'bp.sa.h', 'bp.nk.h', 'pfl.ui.aktion.antrag.titel', 'pfl.ui.aktion.hoeher.titel', 'pfl.ui.aktion.gutachten.text'],
  ro: ['pa.hoeher', 'bp.sa.h', 'bp.nk.h', 'f.auf.antraegeOffen', 'kw.h', 'pfl.ui.aktion.antrag.titel', 'pfl.ui.aktion.gutachten.text',
    // „Verifică …“ ist hier 3. Person („prüft die Stelle“), keine Anrede
    't.emrente.unklar', 't.verm.lvUnsicher'],
  tr: ['l.alle', 'vg.auto.unter', 'pa.hoeher', 'f.mehrWege', 'fri.art.anh', 'bp.sa.h', 'bp.nk.h', 'f.auf.antraegeOffen', 'pfl.ui.aktion.antrag.titel', 'pfl.ui.aktion.hoeher.titel', 'pfl.ui.aktion.gutachten.text'],
};

// Grundtexte (ohne Sie-Ebene) und fertige Texte der Pflege-Variante
const { I18N: GRUND, EINF: GRUND_EINF } = S.grundtexte();
const vari = build.variante('pflege');
const src = build.i18nSource(vari);
const I18N = new Function('module', src + ';return I18N;')({});
const EINF = new Function('module', src + ';return I18N_EINFACH;')({});
const neu = S.neueNamensraeume();
const erreichbar = Object.keys(I18N.de).filter((k) => !neu.has(k) && S.erreichbar(k) && !S.FALSCH_POSITIV.includes(k));

// 1. Dateien und Schlüssel
SPRACHEN.forEach((l) => {
  ok(`${l}.json vorhanden`, fs.existsSync(path.join(ORDNER, l + '.json')));
  const o = lies(l);
  Object.entries(o).forEach(([k, t]) => {
    ok(`${l} ${k}: Schlüssel in der Grundfassung`, k in GRUND.de);
    ok(`${l} ${k}: kein Schlüssel der neuen Namensräume der Variante (sen-ui, senioren, vorlesen, sen-ux …)`, !neu.has(k));
    const basis = l === 'de' ? GRUND.de[k] : l === 'einfach' ? (GRUND_EINF[k] !== undefined ? GRUND_EINF[k] : GRUND.de[k]) : GRUND[l][k];
    ok(`${l} ${k}: Grundtext vorhanden`, typeof basis === 'string', basis);
    ok(`${l} ${k}: Text nicht leer`, typeof t === 'string' && t.trim() !== '');
    if (typeof basis !== 'string' || typeof t !== 'string') return;
    ok(`${l} ${k}: Platzhalter gleich`, ph(basis) === ph(t), [basis, t]);
    ok(`${l} ${k}: Zahlen gleich`, zahlen(basis) === zahlen(t), [basis, t]);
    ok(`${l} ${k}: ändert etwas`, basis !== t);
  });
});

// 2. Deutsch und Einfache Sprache: keine Du-Anrede in erreichbaren Texten
ok('alle Du-Texte haben eine Sie-Fassung', S.fehlend().length === 0, S.fehlend());
erreichbar.forEach((k) => {
  ok(`de ${k}: keine Du-Anrede`, !S.hatDu(I18N.de[k]), I18N.de[k]);
  if (EINF[k] !== undefined) ok(`einfach ${k}: keine Du-Anrede`, !S.hatDu(EINF[k]), EINF[k]);
});
// Schlüssel der neuen Namensräume (sen-ui, senioren, vorlesen, sen-ux): auch die wirksame Einfache Sprache ohne Du
// (Lücke gefunden: home.gruss war in sen-ui/de.json überschrieben, Einfache Sprache fiel auf „Schön, dass du da bist.“ zurück)
S.neueNamensraeume().forEach((k) => {
  if (typeof I18N.de[k] === 'string') ok(`de (neu) ${k}: keine Du-Anrede`, !S.hatDu(I18N.de[k]), I18N.de[k]);
  if (EINF[k] !== undefined) ok(`einfach (neu) ${k}: keine Du-Anrede`, !S.hatDu(EINF[k]), EINF[k]);
});

// 3. Übersetzungen: keine eindeutigen Du-Formen in erreichbaren Texten
Object.keys(DU).forEach((l) => {
  const aus = AUSNAHMEN[l] || [];
  erreichbar.forEach((k) => {
    const t = I18N[l][k];
    if (typeof t !== 'string' || aus.includes(k)) return;
    const m = t.match(DU[l]) || (IMP[l] && !kurz(t) && t.match(IMP[l]));
    ok(`${l} ${k}: keine Du-Anrede`, !m, m && [m[0], t]);
  });
  aus.forEach((k) => ok(`${l} Ausnahme ${k} ist erreichbar und vorhanden`, erreichbar.includes(k) && typeof I18N[l][k] === 'string'));
});

// 4. Nur in der Pflege-Variante
Object.entries(build.VARIANTEN).forEach(([id, v]) => {
  ok(`Variante ${id}: Sie-Ebene nur bei pflege`, (id === 'pflege') === v.sprachOrdner.includes('sie'));
});
ok('pflege lädt die Sie-Ebene zuletzt', vari.sprachOrdner[vari.sprachOrdner.length - 1] === 'sie');
const soloSrc = build.i18nSource(build.variante('solo'));
const SOLO = new Function('module', soloSrc + ';return I18N;')({});
const sieDe = lies('de');
ok('SoLo behält die Du-Fassung', Object.keys(sieDe).every((k) => SOLO.de[k] !== sieDe[k] || GRUND.de[k] === sieDe[k]));

console.log(`Sie-Ebene: ${n - f}/${n} Prüfungen ok`);
if (f) process.exit(1);
