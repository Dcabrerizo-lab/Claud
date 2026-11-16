const { chromium } = require('playwright');
async function open() { const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}); const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto('https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner', { timeout: 60000 }); await p.click('text=Alle ablehnen').catch(() => {}); await p.waitForTimeout(500); return { b, p }; }
async function rechne(p, f) {
  await p.goto('https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner', { timeout: 60000 }); await p.click('text=Alle ablehnen', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(300);
  await p.selectOption('#childCounterRow', String(f.kinder || 1));
  await p.click(f.geschwister ? 'label[for=hadChildsYes]' : 'label[for=hadChildsNo]');
  await p.fill('#nettoVorher', String(f.vorher).replace('.', ','));
  await p.fill('#nettoNachher', f.nachher ? String(f.nachher).replace('.', ',') : '');
  await p.click('button:has-text("Schnellberechnung")'); await p.waitForTimeout(800);
  return p.evaluate(() => document.body.innerText.split('\n').filter((l) => /€/.test(l)).join(' || '));
}
module.exports = { open, rechne };
if (require.main === module) (async () => { const { b, p } = await open(); console.log(await rechne(p, { vorher: 1600 })); await b.close(); })();
