// Bedient den amtlichen Wohngeldrechner des BMWSB. fall: { miete, stufe, mitglieder: [{ ek, wk, steuer, kv, rv }], allein, unterhalt, sb }
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
    const cb = ['f59266g59222d59338i1', 'f59266g59222d59346i2', 'f59266g59222d59350i3'];
    const an = [m.steuer, m.kv, m.rv];
    for (let j = 0; j < 3; j++) if (an[j]) await p.check('#' + cb[j] + (k + 2 + j));
  }
  if (f.allein) await p.check('[name=Wohngeldrechner_Alleineinziehend]');
  if (f.unterhalt) await p.fill('[name=childsupport]', fmt(f.unterhalt));
  if (f.sb) await p.fill('[name=disabledHouseholdMembers]', String(f.sb));
  await Promise.all([p.waitForLoadState('load'), p.click('form[name=wohngeldrechner2025] [name=update]')]);
  await p.waitForTimeout(500);
  const r = await p.inputValue('[name=result]').catch(() => '');
  const fehler = await p.$$eval('.c-form__error, .error, [class*=error]', (e) => e.map((x) => x.textContent.trim()).filter(Boolean).join(' | ')).catch(() => '');
  return { r, fehler };
}
module.exports = { rechne, open: async () => { const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } }); return { b, p: await b.newPage() }; } };
if (require.main === module) (async () => {
  const { b, p } = await module.exports.open();
  console.log(JSON.stringify(await rechne(p, { miete: 500, stufe: 3, mitglieder: [{ ek: 1200, wk: 102.5, steuer: true, kv: true, rv: true }] })));
  await p.screenshot({ path: __dirname + '/wg2.png', fullPage: true });
  await b.close();
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });
