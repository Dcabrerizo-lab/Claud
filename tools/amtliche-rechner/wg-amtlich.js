// Bedient den amtlichen Wohngeldrechner des BMWSB. fall: { miete, stufe, mitglieder: [{ ek, wk, steuer, kv, rv, kind25, grBetrag }], allein, unterhalt, sb }
// kind25: Haken „Erwerbstätiges Kind unter 25 Jahren“ (§ 17 Nr. 4 WoGG); grBetrag > 0: Haken „33 Jahre Grundrentenzeiten“ (§ 17a WoGG;
// der Rechner hat dafür kein eigenes Betragsfeld, Formular erkundet am 21.11.2026 mit wg-erkunden.js).
const { chromium } = require('playwright');
const URL = 'https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_node.html';
const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
async function rechne(p, f) {
  await p.goto(URL, { timeout: 60000 });
  await p.waitForTimeout(800);
  const nur = p.locator('text=Nur technisch notwendige Cookies');
  if (await nur.isVisible().catch(() => false)) { await nur.click(); await p.waitForTimeout(500); }
  await p.fill('[name=rent]', String(Math.round(f.miete * 100) / 100));
  await p.selectOption('[name=rentLevel]', String(f.stufe));
  await p.click('[name=householdMembers]'); await p.keyboard.type(String(f.mitglieder.length)); await p.keyboard.press('Tab');
  await p.waitForTimeout(400);
  for (let i = 0; i < f.mitglieder.length; i++) {
    const m = f.mitglieder[i], k = (i + 1) * 10;
    await p.fill('#f59266d59224' + k, fmt(m.ek || 0));
    await p.fill('#f59266d59246' + (k + 1), fmt(m.wk || 0));
    const cb = ['f59266g59222d59338i1', 'f59266g59222d59346i2', 'f59266g59222d59350i3', 'f59266g59222d59342i4', 'f59266g59222d134730i5'];
    const an = [m.steuer, m.kv, m.rv, m.kind25, m.grBetrag > 0];
    for (let j = 0; j < 5; j++) if (an[j]) await p.check('#' + cb[j] + (k + 2 + j));
  }
  if (f.allein) await p.check('[name=Wohngeldrechner_Alleineinziehend]');
  if (f.unterhalt) await p.fill('[name=childsupport]', fmt(f.unterhalt));
  if (f.sb) await p.fill('[name=disabledHouseholdMembers]', String(f.sb));
  // Kontrolle vor dem Absenden: stehen alle Werte wirklich im Formular? (sonst Ergebnis verwerfen)
  const pruef = [];
  if (Number(await p.inputValue('[name=householdMembers]')) !== f.mitglieder.length) pruef.push('Haushaltsgröße');
  for (let i = 0; i < f.mitglieder.length; i++) {
    const k = (i + 1) * 10, v = await p.inputValue('#f59266d59224' + k).catch(() => 'fehlt');
    if (Math.abs(Number(String(v).replace(/\./g, '').replace(',', '.')) - Math.round((f.mitglieder[i].ek || 0) * 100) / 100) > 0.005) pruef.push('Einkommen ' + (i + 1) + ' (' + v + ')');
  }
  await Promise.all([p.waitForLoadState('load'), p.click('form[name=wohngeldrechner2025] [name=update]')]);
  await p.waitForTimeout(500);
  const r = await p.inputValue('[name=result]').catch(() => '');
  const fehler = await p.$$eval('.c-form__error, .error, [class*=error]', (e) => e.map((x) => x.textContent.trim()).filter(Boolean).join(' | ')).catch(() => '');
  return { r, fehler, pruef };
}
module.exports = { URL, rechne, open: async () => { const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}); return { b, p: await b.newPage() }; } };
if (require.main === module) (async () => {
  const { b, p } = await module.exports.open();
  console.log(JSON.stringify(await rechne(p, { miete: 500, stufe: 3, mitglieder: [{ ek: 1200, wk: 102.5, steuer: true, kv: true, rv: true }] })));
  await p.screenshot({ path: __dirname + '/wg2.png', fullPage: true });
  await b.close();
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });
