// Screenshot the model inspection page: node shot-model.js "<query>" out.png
// Example (sagittal, entropion vs corrected, 1 mm grid):
//   node shot-model.js 'm=sag&v=-19,-14,12&grid=1&st=[{"curl":1},{"curl":1,"cut":1,"plane":1,"suture":1,"k":1,"over":8,"tuck":1}]' out.png
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [query, out] = process.argv.slice(2);
  if (!out) { console.error('usage: node shot-model.js "<query>" out.png'); process.exit(2); }
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  const qs = query.split('&').map(kv => { const i = kv.indexOf('='); return kv.slice(0, i) + '=' + encodeURIComponent(kv.slice(i + 1)); }).join('&');
  await p.goto('file://' + path.join(__dirname, 'model-view.html') + '?' + qs); await p.waitForTimeout(300);
  await p.screenshot({ path: out }); await b.close();
  if (errs.length) { console.error('PAGE ERRORS: ' + errs.join(' | ')); process.exit(1); }
  console.log('ok →', out);
})();
