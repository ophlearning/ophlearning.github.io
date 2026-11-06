// Pre-op briefing pack (術前速讀包) of a kit video, for when the operation is sooner than the mp4:
//   node videos/tools/video-kit/brief.js videos/src/<video> [out dir, default <video>/out/brief]
// Writes 旁白.md (chapters, narration, key points and sources of every segment) and one 1920×1080 still per drawn segment at 90 %
// of its length, named in video order. Works before TTS (estimated timeline) and takes about a minute, so it can go to the
// owner as soon as segments.js and draw.js pass check-all; the mp4 follows.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const vdir = path.resolve(process.argv[2] || ''), out = path.resolve(process.argv[3] || path.join(vdir, 'out/brief'));
  const page_ = path.join(vdir, 'anim/video.html');
  if (!process.argv[2] || !fs.existsSync(page_)) { console.error('usage: node brief.js videos/src/<video> [out dir]'); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\n/g, '');
  const { VIDEO, SEGS, CHAPTERS } = require(path.join(vdir, 'anim/segments.js'));
  const md = [`# ${(VIDEO.title || []).join('')}（術前速讀）`, '', VIDEO.subtitle || '', ''];
  for (const s of SEGS) {
    if (s.chapterCard) { md.push(`## ${CHAPTERS[s.chapterCard]}`, ''); continue; }
    if (s.layout === 'refs') continue;
    md.push(`### ${strip(s.title || s.id)}`, ...(s.lines || []).map(l => '- ' + strip(l)), ...(s.keys || []).map(k => '> 重點：' + strip(k[1])));
    const src = (s.src || []).map(x => x[1]).filter(Boolean); if (src.length) md.push(`> 來源：${src.join('；')}`);
    md.push('');
  }
  fs.writeFileSync(path.join(out, '旁白.md'), md.join('\n'));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + page_); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  const tl = await page.evaluate(() => window.TL_EXPORT), src = await page.evaluate(() => window.TIMELINE_SOURCE);
  const byId = Object.fromEntries(SEGS.filter(s => s.id).map(s => [s.id, s]));
  let k = 0;
  for (const x of tl) {
    const s = byId[x.id]; if (!s || s.chapterCard || s.layout === 'refs' || !x.lines.length) continue;
    const name = `${String(++k).padStart(2, '0')}-${strip(s.title || s.id).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40)}.jpg`;
    await page.evaluate(t => window.renderAt(t), x.t0 + (x.t1 - x.t0) * 0.9);
    await page.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 85 });
  }
  await browser.close();
  console.log(`brief: ${out} — 旁白.md + ${k} stills (timeline: ${src})`, errs.length ? 'ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  if (errs.length) process.exit(1);
})();
