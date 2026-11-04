// node render.js page.html out.mp4 [fps] [--from F --to F] | --stills t1,t2 | --seg-stills
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const args = process.argv.slice(2); const [page_, out] = args; const fps = Number(args[2] && !args[2].startsWith('--') ? args[2] : 30);
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.resolve(page_));
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  const dur = await page.evaluate(() => window.SCENE_DURATION);
  const shot = async (t, file) => { await page.evaluate(tt => window.renderAt(tt), t); return page.screenshot(file ? { path: file, type: 'jpeg', quality: 88 } : { type: 'jpeg', quality: 93 }); };
  if (args.includes('--seg-stills') || opt('--stills')) {
    let ts = opt('--stills') ? opt('--stills').split(',').map(Number) : [];
    if (args.includes('--seg-stills')) { const tl = await page.evaluate(() => window.TL_EXPORT); for (const s of tl) if (!/^c\d$/.test(s.id)) ts.push(+(s.t0 + (s.t1 - s.t0) * 0.35).toFixed(2), +(s.t0 + (s.t1 - s.t0) * 0.9).toFixed(2)); }
    for (const t of ts) await shot(t, `${out}-${String(t.toFixed(2)).padStart(7, '0')}.jpg`);
    console.log('stills', ts.length, 'duration', dur.toFixed(1), errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
    await browser.close(); return;
  }
  const n = Math.ceil(dur * fps), from = Number(opt('--from') ?? 0), to = Math.min(n, Number(opt('--to') ?? n));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = from; i < to; i++) { const buf = await shot(i / fps); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
  console.log(`frames ${from}-${to} of ${n} → ${out}`, errs.length ? 'ERRORS: ' + errs.slice(0, 3).join(' | ') : '');
})();
