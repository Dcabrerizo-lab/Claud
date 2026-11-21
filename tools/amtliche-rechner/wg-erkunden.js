// Erkundung des amtlichen Wohngeldrechners (BMWSB): speichert alle Formularfelder (id, name, Typ, Beschriftung)
// bei 3 Haushaltsmitgliedern als JSON, damit wg-amtlich.js die Felder sicher findet. Aufruf: node wg-erkunden.js <ausgabe.json>
const { chromium } = require('playwright');
const URL = 'https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_node.html';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(URL, { timeout: 60000 }); await p.waitForTimeout(1500);
  const nur = p.locator('text=Nur technisch notwendige Cookies');
  if (await nur.isVisible().catch(() => false)) { await nur.click(); await p.waitForTimeout(500); }
  await p.click('[name=householdMembers]'); await p.keyboard.type('3'); await p.keyboard.press('Tab'); await p.waitForTimeout(1000);
  // Grundrenten-Haken bei Person 1 setzen, damit ein abhängiges Betragsfeld sichtbar wird
  const felder = async () => p.$$eval('form[name=wohngeldrechner2025] input, form[name=wohngeldrechner2025] select', (els) => els.map((e) => {
    const l = e.id ? document.querySelector('label[for="' + e.id + '"]') : null;
    const r = e.getBoundingClientRect();
    return { id: e.id, name: e.name, type: e.type, value: e.type === 'checkbox' ? e.checked : e.value, label: (l ? l.textContent : '').replace(/\s+/g, ' ').trim(), sichtbar: r.width > 0 && r.height > 0 };
  }));
  const vorher = await felder();
  const gr = vorher.filter((f) => /Grundrent/i.test(f.label) && f.type === 'checkbox');
  for (const g of gr) await p.check('#' + g.id).catch(() => {});
  await p.waitForTimeout(800);
  const nachher = await felder();
  const html = await p.$eval('form[name=wohngeldrechner2025]', (f) => f.outerHTML).catch(() => '');
  require('fs').writeFileSync(process.argv[2] || 'wg-felder.json', JSON.stringify({ vorher, nachher, html }, null, 1));
  console.log(nachher.filter((f) => f.type !== 'hidden').map((f) => [f.id, f.name, f.type, f.sichtbar ? 'sichtbar' : 'versteckt', f.label].join(' | ')).join('\n'));
  await b.close();
})().catch((e) => { console.log('FEHLER', e.message); process.exit(1); });
