// Video-level check for a redo page (video2.html style):  node check-video.js <video page.html> --base <git commit>
// 1. Text: titles, narration lines, key boxes, sources, chapter names and references in segments.js are identical to the
//    version in git commit <base> (the redo changes pictures only).
// 2. For every segment already redrawn (DRAW2), at 60 % of each narration line: no page errors; every visible label
//    (g.lbl, opacity > 0.5) lies inside its panel, its leader ends inside the panel, and labels do not overlap each other.
// 3. Reports the slowest frame.
// Exit code 1 if anything fails.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
(async () => {
  const args = process.argv.slice(2), bi = args.indexOf('--base'), base = bi >= 0 ? args.splice(bi, 2)[1] : null, page_ = path.resolve(args[0] || '');
  if (!fs.existsSync(page_) || !base) { console.error('usage: node check-video.js <video page.html> --base <git commit>'); process.exit(2); }
  let fails = 0; const bad = m => { console.log('FAIL ' + m); fails++; };
  // ---------------- 1. text unchanged
  global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
  const segFile = path.join(path.dirname(page_), 'segments.js'), root = cp.execSync('git rev-parse --show-toplevel', { cwd: path.dirname(page_) }).toString().trim();
  const old = cp.execSync(`git show ${base}:${path.relative(root, segFile).split(path.sep).join('/')}`, { cwd: root, maxBuffer: 1 << 26 }).toString();
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'segs-')), 'segments.js'); fs.writeFileSync(tmp, old);
  const pick = m => ({ CH: m.CHAPTERS, REFS: m.REFS, S: m.SEGS.map(s => ({ id: s.id, title: s.title, lines: s.lines, keys: s.keys, src: s.src, ch: s.ch, card: s.chapterCard })) });
  const A = pick(require(tmp)), B = pick(require(segFile));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (!same(A.CH, B.CH)) bad('chapter names differ from ' + base);
  if (!same(A.REFS, B.REFS)) bad('references differ from ' + base);
  if (A.S.length !== B.S.length) bad(`segment count ${B.S.length} vs ${A.S.length} in ${base}`);
  A.S.forEach((s, i) => { if (!same(s, B.S[i])) bad(`text of segment ${s.id} differs from ${base}`); });
  if (!fails) console.log(`PASS text: ${B.S.length} segments, chapter names and references identical to ${base}`);
  // ---------------- 2. labels in redrawn segments
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + page_); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const ids = await p.evaluate(() => Object.keys(window.DRAW2 || DRAW2));
  let slow = 0, nFrames = 0;
  for (const id of ids) {
    const tl = (await p.evaluate(() => window.TL_EXPORT)).find(s => s.id === id);
    for (let i = 0; i < tl.lines.length; i++) {
      const [a, e] = tl.lines[i], t = a + (e - a) * 0.6, t0 = Date.now();
      await p.evaluate(tt => window.renderAt(tt), t); slow = Math.max(slow, Date.now() - t0); nFrames++;
      const probs = await p.evaluate(() => {
        const op = el => { let o = 1; for (let x = el; x && x.id !== 'stage'; x = x.parentElement) { const v = x.getAttribute('opacity'); if (v !== null) o *= parseFloat(v); } return o; };
        const panel = x => x < 640 ? { x: 25, y: CONTENT_Y, w: 606, h: CONTENT_H } : { x: 649, y: CONTENT_Y, w: 606, h: CONTENT_H };   // content areas of the two panels (video2.html)
        const inside = (r, P) => r.x >= P.x - 1 && r.y >= P.y - 1 && r.x + r.w <= P.x + P.w + 1 && r.y + r.h <= P.y + P.h + 1;
        const L = [...document.querySelectorAll('g.lbl')].filter(g => op(g) > 0.5).map(g => { const t = g.querySelector('text').getBoundingClientRect(), c = g.querySelector('circle');
          return { txt: g.querySelector('text').textContent, r: { x: t.x, y: t.y, w: t.width, h: t.height }, a: c ? (r => [r.x + r.width / 2, r.y + r.height / 2])(c.getBoundingClientRect()) : null }; });
        const out = [];
        for (const l of L) { const P = panel(l.r.x + l.r.w / 2);
          if (!inside(l.r, P)) out.push(`label 「${l.txt}」 outside its panel`);
          if (l.a && !inside({ x: l.a[0], y: l.a[1], w: 0, h: 0 }, P)) out.push(`label 「${l.txt}」 points outside its panel`); }
        for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i].r, c = L[j].r;
          const ov = Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y));
          if (ov > 6) out.push(`labels 「${L[i].txt}」 and 「${L[j].txt}」 overlap`); }
        return out;
      });
      for (const m of probs) bad(`${id} line ${i}: ${m}`);
    }
  }
  if (errs.length) bad('page errors: ' + errs.join(' | '));
  console.log(`checked ${ids.length} redrawn segments (${ids.join(', ')}), ${nFrames} frames; slowest frame ${slow} ms`);
  await b.close();
  console.log(fails ? `${fails} problem(s)` : 'all video checks passed');
  process.exit(fails ? 1 : 0);
})();
