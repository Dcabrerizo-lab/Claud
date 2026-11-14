// Bedient den KiZ-Lotsen der Familienkasse. f: { alter: [Jahre je Kind], partner, brutto, netto, pBrutto, pNetto, miete }
const { chromium } = require('playwright');
async function open() { const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}); return { b, p: await b.newPage({ viewport: { width: 1280, height: 1000 } }) }; }
async function rechne(p, f) {
  await p.goto('https://web.arbeitsagentur.de/kiz/lotse', { timeout: 60000 }); await p.waitForTimeout(2000);
  await p.click('#btn-start'); await p.waitForTimeout(1200);
  let kindIdx = 0, partnerEk = false;
  for (let i = 0; i < 30; i++) {
    const txt = await p.evaluate(() => (document.querySelector('main') || document.body).innerText);
    if (/\bErgebnis\b/.test(txt) && !/Wie hoch|Beziehen Sie|Haben Sie/.test(txt.split('Ergebnis')[1] || '')) {
      const t = txt.split('Ergebnis')[1].split('Hinweis')[0].replace(/\s+/g, ' ').trim(); return t;
    }
    const ids = await p.$$eval('input', (e) => e.filter((x) => x.offsetParent !== null).map((x) => x.id));
    const fill = async (id, v) => { if (ids.includes(id)) { await p.fill('#' + id, String(v)); } };
    const box = async (id, on) => { if (ids.includes(id)) { const c = await p.isChecked('#' + id); if (c !== !!on) await p.click('label[for="' + id + '"]').catch(() => p.click('#' + id)); } };
    await fill('kinderAnzahlInBG', f.alter.length); await fill('kinderAnzahlErhaltenKG', f.alter.length);
    for (let k = 0; k < f.alter.length; k++) await fill('kindAlter_' + k, f.alter[k]);
    await box('grundsicherung', false); await box('partnerVorhanden', f.partner); await box('wohngeldBezug', false);
    if (ids.includes('antragstellerEinkommen_brutto')) { await fill('antragstellerEinkommen_brutto', f.brutto); await fill('antragstellerEinkommen_netto', f.netto); await fill('antragstellerEinkommen_sonstiges', 0); }
    if (ids.includes('partnerEinkommen_brutto')) { await fill('partnerEinkommen_brutto', f.pBrutto || 0); await fill('partnerEinkommen_netto', f.pNetto || 0); await fill('partnerEinkommen_sonstiges', 0); }
    if (ids.includes('kindEinkommen_brutto')) { await fill('kindEinkommen_brutto', 0); await fill('kindEinkommen_netto', 0); await fill('kindEinkommen_sonstiges', 0); await box('kindbeziehtKG', true); }
    await fill('antragstellerAusgaben_miete', f.miete);
    const unbekannt = ids.filter((x) => !/^(kinderAnzahl|kindAlter_|grundsicherung|partnerVorhanden|wohngeldBezug|antragsteller|partnerEinkommen|kindEinkommen|kindbeziehtKG|star-rating)/.test(x));
    if (unbekannt.length) return 'UNBEKANNTE FELDER: ' + unbekannt.join(',') + ' | ' + txt.replace(/\s+/g, ' ').slice(0, 300);
    await p.click('#btn-next'); await p.waitForTimeout(1100);
  }
  return 'KEIN ERGEBNIS';
}
module.exports = { open, rechne };
if (require.main === module) (async () => { const { b, p } = await open(); console.log(await rechne(p, { alter: [5, 8], partner: true, brutto: 2400, netto: 1800, pBrutto: 0, pNetto: 0, miete: 800 })); await b.close(); })();
