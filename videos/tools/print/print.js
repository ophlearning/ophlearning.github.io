#!/usr/bin/env node
// Render the printable OR-wall sheets of one video and check them.
//   node videos/tools/print/print.js videos/src/<video> [--only <name>] [--no-png] [--gray]
// For every videos/src/<video>/print/*.html (one A4 landscape sheet each): vector PDF → out/print/<name>.pdf, 300 dpi PNG (3508 × 2480,
// rasterised from that PDF with pdftoppm) → out/print/<name>.png (--gray also writes <name>-gray.png for the B/W self-check).
// Checks per sheet (all must pass, exit 1 otherwise):
//   · no page errors; the PDF is one page of exactly A4 landscape;
//   · numbers: numcheck.js (every number registered in the video ledger or the sheet's print ledger, cited in the footer);
//   · layout: nothing within the 10 mm margins, no box overflowing, labels inside their figure and not overlapping each other;
//   · type sizes: title 22–26 pt, checklist items ≥ 14 pt, figure text ≥ 9 pt, footer 7–8 pt.
// One browser, one page at a time (keeps Playwright light when another job is rendering video).
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const NC = require('./numcheck.js');
const dir = path.resolve(process.argv[2] || '.'), only = (process.argv.indexOf('--only') > 0) ? process.argv[process.argv.indexOf('--only') + 1] : null;
const noPng = process.argv.includes('--no-png'), gray = process.argv.includes('--gray');
const MM = 96 / 25.4;   // CSS px per mm

async function measure(page) {
  return page.evaluate(({ MM }) => {
    const mm = r => ({ x0: r.left / MM, y0: r.top / MM, x1: r.right / MM, y1: r.bottom / MM });
    const out = { texts: [], boxes: [], sizes: [], overflow: [], labels: [] };
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) { const n = tw.currentNode, el = n.parentElement, t = n.textContent.trim();
      if (!t || ['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
      const st = el.closest('[data-struct]'); out.texts.push({ t, struct: st ? st.getAttribute('data-struct') : null });
      const svgText = el.closest('text');
      let pt;
      if (svgText) { const fs = parseFloat(svgText.getAttribute('font-size')), m = svgText.getScreenCTM(); pt = fs * m.a * 0.75; }
      else pt = parseFloat(getComputedStyle(el).fontSize) * 0.75;
      const cls = el.closest('.footer') ? 'footer' : el.closest('.hd-title') ? 'title' : el.closest('.ck-item') ? 'item' : 'other';
      const range = document.createRange(); range.selectNodeContents(n); const rs = [...range.getClientRects()];
      for (const r of rs) if (r.width > 0) out.boxes.push({ ...mm(r), t: t.slice(0, 30) });
      out.sizes.push({ t: t.slice(0, 30), pt: +pt.toFixed(2), cls }); }
    for (const el of document.querySelectorAll('svg.fig, .ck-box, .ck-no, .cell, .legend svg')) out.boxes.push({ ...mm(el.getBoundingClientRect()), t: el.className.baseVal ?? el.className });
    for (const el of document.querySelectorAll('.body, .cell, .ck-col, .footer, .hd-left, .hd-right'))
      if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) out.overflow.push(`${el.className} ${el.scrollWidth}×${el.scrollHeight} > ${el.clientWidth}×${el.clientHeight}`);
    document.querySelectorAll('svg.fig').forEach((svg, i) => { const fr = svg.getBoundingClientRect();
      for (const g of svg.querySelectorAll('g.lbl text')) { const r = g.getBoundingClientRect();
        out.labels.push({ fig: i, t: g.textContent, ...mm(r), in: r.left >= fr.left - 0.5 && r.right <= fr.right + 0.5 && r.top >= fr.top - 0.5 && r.bottom <= fr.bottom + 0.5 }); } });
    return out;
  }, { MM });
}

function layoutChecks(m, R) {
  const ok = (c, s) => R.push([!!c, s]);
  const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const outM = m.boxes.filter(b => b.y0 < 10 - 0.05 || b.x0 < 10 - 0.05 || b.x1 > 287 + 0.05 || b.y1 > 200 + 0.05);
  ok(!outM.length, `margins (10 mm all round) clear${outM.length ? ': ' + outM.slice(0, 3).map(b => `${b.t} (${b.x0.toFixed(1)},${b.y0.toFixed(1)})–(${b.x1.toFixed(1)},${b.y1.toFixed(1)})`).join(' | ') : ''}`);
  ok(!m.overflow.length, `no box overflows${m.overflow.length ? ': ' + m.overflow.join(' | ') : ''}`);
  const outL = m.labels.filter(l => !l.in); ok(!outL.length, `labels inside their figure${outL.length ? ': ' + outL.map(l => l.t).join(' | ') : ''}`);
  const ov = []; for (let i = 0; i < m.labels.length; i++) for (let j = i + 1; j < m.labels.length; j++) { const a = m.labels[i], b = m.labels[j];
    if (a.fig === b.fig && hit({ x0: a.x0 + 0.3, x1: a.x1 - 0.3, y0: a.y0 + 0.3, y1: a.y1 - 0.3 }, b)) ov.push(`${a.t} ↔ ${b.t}`); }
  ok(!ov.length, `labels do not overlap${ov.length ? ': ' + ov.join(' | ') : ''}`);
  const lim = { title: [22, 26], item: [14, 99], footer: [7, 8], other: [9, 99] }, bad = m.sizes.filter(s => s.pt < lim[s.cls][0] - 0.01 || s.pt > lim[s.cls][1] + 0.01);
  ok(!bad.length, `type sizes (title 22–26, checklist ≥ 14, figures ≥ 9, footer 7–8 pt)${bad.length ? ': ' + bad.slice(0, 6).map(s => `${s.t} ${s.pt} pt (${s.cls})`).join(' | ') : ''}`);
}

(async () => {
  const pdir = path.join(dir, 'print'), odir = path.join(dir, 'out', 'print');
  const pages = fs.readdirSync(pdir).filter(f => f.endsWith('.html') && (!only || f === only || f === only + '.html')).sort();
  if (!pages.length) throw new Error('no sheets in ' + pdir);
  fs.mkdirSync(odir, { recursive: true });
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1123, height: 794 } });
  let fail = 0;
  for (const f of pages) {
    const name = f.replace(/\.html$/, ''), errs = [], R = [];
    page.removeAllListeners('pageerror'); page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + path.join(pdir, f));
    await page.waitForFunction(() => window.SHEET_META, null, { timeout: 30000 }).catch(() => {}); await page.evaluate(() => document.fonts.ready);
    R.push([!errs.length, `no page errors${errs.length ? ': ' + errs.join(' | ') : ''}`]);
    const meta = await page.evaluate(() => window.SHEET_META || null);
    if (!meta) { R.push([false, 'the sheet did not call PRINT.render']); }
    else {
      const m = await measure(page);
      for (const r of NC.check(dir, m.texts, meta)) R.push(r);
      layoutChecks(m, R);
      const pdf = path.join(odir, name + '.pdf');
      await page.pdf({ path: pdf, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
      // Chrome rounds the page box (841.92 × 594.96 pt); set it to A4 exactly (same byte length, padded with spaces, so offsets stay valid)
      { const buf = fs.readFileSync(pdf), s = buf.toString('latin1'), A4 = '0 0 841.89 595.28';
        const out = s.replace(/\/MediaBox \[([^\]]*)\]/g, (m0, inner) => { const v = inner.trim().split(/\s+/).map(Number);
          if (v.length !== 4 || Math.abs(v[2] - 841.89) > 1.2 || Math.abs(v[3] - 595.28) > 1.2 || A4.length > inner.length) return m0;
          return '/MediaBox [' + A4 + ' '.repeat(inner.length - A4.length) + ']'; });
        if (out.length === s.length) fs.writeFileSync(pdf, Buffer.from(out, 'latin1')); }
      const info = execFileSync('pdfinfo', [pdf]).toString(), pg = +(/Pages:\s+(\d+)/.exec(info) || [])[1], sz = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info);
      R.push([pg === 1 && sz && Math.abs(sz[1] - 841.89) < 0.6 && Math.abs(sz[2] - 595.28) < 0.6, `PDF: ${pg} page, ${sz ? sz[1] + ' × ' + sz[2] : '?'} pt (A4 landscape 841.89 × 595.28)`]);
      if (!noPng) { const png = path.join(odir, name + '.png');
        execFileSync('pdftoppm', ['-r', '300', '-scale-to-x', '3508', '-scale-to-y', '2480', '-png', '-singlefile', pdf, png.replace(/\.png$/, '')]);
        const dims = execFileSync('identify', ['-format', '%w×%h', png]).toString();
        R.push([dims === '3508×2480', `PNG ${dims} (300 dpi A4 = 3508×2480)`]);
        if (gray) execFileSync('convert', [png, '-colorspace', 'Gray', png.replace(/\.png$/, '-gray.png')]); }
    }
    const nf = R.filter(r => !r[0]).length; fail += nf;
    console.log(`\n== ${name} ${nf ? `FAIL (${nf})` : 'PASS'}`);
    for (const [c, s] of R) if (!c || /^(PDF|PNG|WARN|margins|type)/.test(s) || process.argv.includes('-v')) console.log(`${c ? (s.startsWith('WARN') ? '' : 'PASS ') : 'FAIL '}${s}`);
    console.log(`(${R.length} checks; numbers on the sheet: ${R.filter(r => /^[\d.\-]+: /.test(r[1])).map(r => r[1].split(':')[0]).join(' ')})`);
  }
  await b.close();
  console.log(fail ? `\n${fail} check(s) failed` : `\nall ${pages.length} sheet(s) passed → ${path.relative(process.cwd(), odir)}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
