// Render a model page to an image: node shot.js <page.html> <out.png|out.jpg> [deviceScaleFactor]
// Exits with code 1 if the page throws a JavaScript error.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [page_, out, dpr] = process.argv.slice(2);
  if (!page_ || !out) { console.error('usage: node shot.js page.html out.png [dpr]'); process.exit(2); }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: Number(dpr || 1) });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(page_));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot(/\.jpe?g$/i.test(out) ? { path: out, type: 'jpeg', quality: 86 } : { path: out });
  await b.close();
  if (errs.length) { console.error('PAGE ERRORS: ' + errs.join(' | ')); process.exit(1); }
  console.log('ok →', out);
})();
