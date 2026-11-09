// Screenshot chosen moments of one segment of a video page:
//   node seg-stills.js <video page.html> <segment id> <output prefix> <i:f> [<i:f> …] [--dpr 2]
// i:f = narration line i of the segment, fraction f of that line (0 = when it starts, 1 = when it ends).
// Times are given by line, not by seconds, so they stay valid when the narration is re-synthesised.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2), di = args.indexOf('--dpr'), dpr = di >= 0 ? Number(args.splice(di, 2)[1]) : 2;
  const [page_, id, out, ...specs] = args;
  if (!specs.length) { console.error('usage: node seg-stills.js page.html segId outPrefix i:f [...] [--dpr 2]'); process.exit(2); }
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.resolve(page_)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const tl = (await p.evaluate(() => window.TL_EXPORT)).find(s => s.id === id);
  if (!tl) { console.error('no segment ' + id); process.exit(2); }
  for (const sp of specs) {
    const [i, f] = sp.split(':').map(Number), [a, e] = tl.lines[i], t = a + (e - a) * f;
    const t0 = Date.now(), miss = await p.evaluate(async tt => { window.renderAt(tt); return window.KIT_READY ? await window.KIT_READY : []; }, t), ms = Date.now() - t0;   // footage: wait for its frames
    const file = `${out}-${id}-L${i}-${f}.png`; await p.screenshot({ path: file }); console.log(file, `t=${t.toFixed(2)}s render ${ms}ms`, miss.length ? `WARNING ${miss.length} footage frame(s) missing (${miss[0]})` : '');
  }
  await b.close();
  if (errs.length) { console.error('PAGE ERRORS: ' + errs.join(' | ')); process.exit(1); }
})();
