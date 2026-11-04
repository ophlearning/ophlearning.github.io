// Reference-image check: re-render every approved moment and compare it with its reference image, pixel by pixel.
//   node ref-check.js <manifest.json>            compare; exit 1 if any item differs more than the threshold
//   node ref-check.js <manifest.json> --update   write the current renders as the new references (only after the editor approved them)
//   add --only <segment id> to compare or update just that segment (e.g. a newly added one, without touching approved references)
// manifest.json (paths relative to its folder):
//   { "threshold": 0.001, "tol": 48, "crop": [x, y, w, h],
//     "items": [ { "page": "../anim/video2.html", "seg": "4-4", "at": "2:0.6", "ref": "4-4-L2-0.6.jpg", "approved": "2026-11-04", "note": "…" },
//                { "page": "…/sample.html", "ref": "…/sample-asian.jpg", "dpr": 2, "crop": null } ] }
// threshold = share of pixels allowed to differ; tol = brightness difference (0–255) below which a pixel counts as the same.
// Brightness, not colour, is compared: JPEG halves colour resolution, so thin saturated lines would otherwise always differ. Diff images (changed pixels in red) go to the system temp folder.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const args = process.argv.slice(2), update = args.includes('--update'), oi = args.indexOf('--only'), only = oi >= 0 ? args.splice(oi, 2)[1] : null;
  const mpath = path.resolve(args.find(a => !a.startsWith('--')) || '');
  if (!fs.existsSync(mpath)) { console.error('usage: node ref-check.js <manifest.json> [--update]'); process.exit(2); }
  const M = JSON.parse(fs.readFileSync(mpath, 'utf8')), dir = path.dirname(mpath), outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ref-diff-'));
  const b = await chromium.launch();
  const cmp = await b.newPage();
  let fails = 0;
  const pages = {};
  for (const it of M.items.filter(x => !only || x.seg === only)) {
    const dpr = it.dpr || 1, crop = it.crop === undefined ? M.crop : it.crop, key = it.page + '@' + dpr;
    if (!pages[key]) { const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr }); p._errs = []; p.on('pageerror', e => p._errs.push(String(e)));
      await p.goto('file://' + path.resolve(dir, it.page)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); pages[key] = p; }
    const p = pages[key];
    if (it.seg) { const [i, f] = it.at.split(':').map(Number);
      const t = await p.evaluate(([id, i, f]) => { const s = window.TL_EXPORT.find(x => x.id === id), [a, e] = s.lines[i]; return a + (e - a) * f; }, [it.seg, i, f]);
      await p.evaluate(tt => window.renderAt(tt), t); }
    const refFile = path.resolve(dir, it.ref), name = it.seg ? `${it.seg} ${it.at}` : path.basename(it.page);
    if (update) { await p.screenshot({ path: refFile, type: 'jpeg', quality: 90 }); console.log('UPDATED', name, '→', path.relative(process.cwd(), refFile)); continue; }
    if (!fs.existsSync(refFile)) { console.log('MISSING', name, refFile); fails++; continue; }
    const now = (await p.screenshot({ type: 'png' })).toString('base64'), ref = fs.readFileSync(refFile).toString('base64');
    const r = await cmp.evaluate(async ([a, bb, crop, dpr, tol]) => {
      const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
      const [ia, ib] = await Promise.all([load(a), load(bb)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { size: `${ia.width}×${ia.height} vs ${ib.width}×${ib.height}` };
      const W = ia.width, H = ia.height, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, W, H).data; x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, W, H).data;
      const [cx, cy, cw, ch] = crop ? crop.map(v => Math.round(v * dpr)) : [0, 0, W, H];
      const out = x.createImageData(W, H); let n = 0;
      for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) { const i = (y * W + X) * 4, inC = X >= cx && X < cx + cw && y >= cy && y < cy + ch;
        const Y = (d, j) => 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2], d = Math.abs(Y(da, i) - Y(db, i)), g = Y(da, i);   // brightness: JPEG keeps it at full resolution
        if (inC && d > tol) { n++; out.data[i] = 230; out.data[i + 1] = 30; out.data[i + 2] = 30; } else { out.data[i] = out.data[i + 1] = out.data[i + 2] = 150 + g * 0.4; }
        out.data[i + 3] = 255; }
      x.putImageData(out, 0, 0); return { n, area: cw * ch, diff: n ? c.toDataURL('image/png') : null };
    }, ['data:image/png;base64,' + now, 'data:image/jpeg;base64,' + ref, crop, dpr, M.tol ?? 48]);
    if (r.size) { console.log('FAIL', name, 'size differs', r.size); fails++; continue; }
    const ratio = r.n / r.area, bad = ratio > (M.threshold ?? 0.001) || p._errs.length;
    let msg = `${bad ? 'FAIL' : 'PASS'} ${name}: ${(ratio * 100).toFixed(3)}% of pixels differ` + (it.approved ? '' : '  (reference not yet approved by the editor)');
    if (r.diff) { const f = path.join(outDir, name.replace(/[^\w.-]+/g, '_') + '.png'); fs.writeFileSync(f, Buffer.from(r.diff.split(',')[1], 'base64')); msg += `  diff → ${f}`; }
    if (p._errs.length) msg += '  PAGE ERRORS: ' + p._errs.join(' | ');
    console.log(msg); if (bad) fails++;
  }
  await b.close();
  if (!update) console.log(fails ? `${fails} item(s) differ from their reference — show the editor before updating references` : 'all references match');
  process.exit(fails ? 1 : 0);
})();
