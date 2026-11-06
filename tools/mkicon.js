const { chromium } = require('playwright');
(async () => {
  const svg = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${bg}"/>
  <g fill="none" stroke="#fff" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"><circle cx="512" cy="512" r="300"/><path d="M512 212v70M512 742v70M212 512h70M742 512h70" stroke-width="40"/></g>
  <path d="M512 330l78 182-78 182-78-182z" fill="#fff" opacity=".0"/><path d="M400 520l82 82 150-176" fill="none" stroke="#9fe3b8" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><g transform="translate(512 512) scale(.62) translate(-512 -512)"><g fill="none" stroke="#fff" stroke-width="56" stroke-linecap="round" stroke-linejoin="round"><circle cx="512" cy="512" r="300"/><path d="M512 212v70M512 742v70M212 512h70M742 512h70" stroke-width="40"/></g><path d="M400 520l82 82 150-176" fill="none" stroke="#9fe3b8" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  for (const [name, content, omit] of [['icon-only.png', svg('#2b4a9b'), false], ['icon-foreground.png', fg, true], ['icon-background.png', `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#2b4a9b"/></svg>`, false]]) {
    await p.setContent('<body style="margin:0;background:transparent">' + content + '</body>');
    await p.screenshot({ path: __dirname + '/app/assets/' + name, omitBackground: omit });
  }
  await b.close();
})();
