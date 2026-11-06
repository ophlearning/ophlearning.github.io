// Frame-exact render of a kit video page (videos/tools/video-kit):
//   node render.js <page.html> <out.mp4> [fps] [--from F --to F]     frames F..F of the video → mp4 (no audio)
//   node render.js <page.html> <out-prefix> --stills t1,t2,…           jpg stills at the given seconds
//   node render.js <page.html> <out-prefix> --seg-stills               two stills per segment (35 % and 90 %)
// Rendered at deviceScaleFactor 1.5 (1920×1080 frames from the 1280×720 page).
// Speed (2026-11-06): a frame whose markup equals the previous frame's (kit.js sets window.FRAME_CHANGED = false) reuses the
// previous image, and frames are captured through a CDP session with the same device metrics — byte-identical to
// page.screenshot (checked with --verify), without Playwright's per-shot overhead.
//   node render.js <page.html> - --verify --from F --to F    compares the fast path with page.screenshot on every frame F..F
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const args = process.argv.slice(2); const [page_, out] = args; const fps = Number(args[2] && !args[2].startsWith('--') ? args[2] : 30);
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  if (!page_ || !out) { console.error('usage: node render.js page.html out.mp4 [fps] [--from F --to F] | --stills t1,t2 | --seg-stills'); process.exit(2); }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.resolve(page_));
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  const dur = await page.evaluate(() => window.SCENE_DURATION), src = await page.evaluate(() => window.TIMELINE_SOURCE);
  const T0 = Date.now(), cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1.5, mobile: false });   // CDP emulation is per session
  // after a change, wait for two animation frames so the new markup is painted before the CDP capture (without this, a capture
  // under load sometimes caught a partly repainted frame: a few dozen pixels off)
  const settle = async tt => { window.renderAt(tt); const ch = window.FRAME_CHANGED !== false; if (ch) await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return ch; };
  const grab = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93 })).data, 'base64');
  if (args.includes('--verify')) {   // fast path (reuse + CDP) against a fresh page.screenshot of every frame
    const from = Number(opt('--from') ?? 0), to = Number(opt('--to') ?? from + 300); let last = null, bad = 0, reused = 0, fresh = 0, lsb = 0, maxLsb = 0;
    for (let i = from; i < to; i++) {
      const changed = await page.evaluate(settle, i / 30);
      if (changed || !last || fresh < 2) { last = await grab(); fresh = changed ? 1 : fresh + 1; } else reused++;
      await page.evaluate(tt => { window.KIT_NO_REUSE = true; window.renderAt(tt); window.KIT_NO_REUSE = false; }, i / 30);   // the old path: markup set afresh
      const ref = await page.screenshot({ type: 'jpeg', quality: 93 });
      if (ref.equals(last)) continue;
      // Chrome's raster can differ in the lowest bits depending on the previous frame (the old path does too), so a byte
      // difference only counts when some pixel differs visibly: any channel more than 8/255 apart.
      const vis = await page.evaluate(async ([a, b]) => {
        const im = async s => { const bm = await createImageBitmap(await (await fetch('data:image/jpeg;base64,' + s)).blob()); const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d'); x.drawImage(bm, 0, 0); return x.getImageData(0, 0, bm.width, bm.height).data; };
        const A = await im(a), B = await im(b); let n = 0, mx = 0;
        for (let i = 0; i < A.length; i++) { const d = Math.abs(A[i] - B[i]); if (d > mx) mx = d; if (d > 8) n++; }
        return { n, mx };
      }, [last.toString('base64'), ref.toString('base64')]);
      lsb++; if (vis.mx > maxLsb) maxLsb = vis.mx;
      if (vis.n) { bad++; if (bad <= 3) { console.log('VISIBLE DIFF at frame', i, changed ? '(captured)' : '(reused)', vis.n, 'px'); if (opt('--dump')) { require('fs').writeFileSync(`${opt('--dump')}/f${i}-fast.jpg`, last); require('fs').writeFileSync(`${opt('--dump')}/f${i}-ref.jpg`, ref); } } }
    }
    console.log(`verify frames ${from}-${to}: ${to - from - lsb} byte-identical, ${lsb - bad} differ only in the lowest bits (max ${maxLsb}/255), ${bad} visibly different; ${reused} reused`); await browser.close(); process.exit(bad ? 1 : 0);
  }
  const shot = async (t, file) => { await page.evaluate(tt => window.renderAt(tt), t); return page.screenshot(file ? { path: file, type: 'jpeg', quality: 88 } : { type: 'jpeg', quality: 93 }); };
  if (args.includes('--seg-stills') || opt('--stills')) {
    let ts = opt('--stills') ? opt('--stills').split(',').map(Number) : [];
    if (args.includes('--seg-stills')) { const tl = await page.evaluate(() => window.TL_EXPORT); for (const s of tl) if (s.lines.length) ts.push(+(s.t0 + (s.t1 - s.t0) * 0.35).toFixed(2), +(s.t0 + (s.t1 - s.t0) * 0.9).toFixed(2)); }
    for (const t of ts) await shot(t, `${out}-${String(t.toFixed(2)).padStart(7, '0')}.jpg`);
    console.log('stills', ts.length, 'duration', dur.toFixed(1), 'timeline', src, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
    await browser.close(); return;
  }
  if (src !== 'timeline.js') console.warn('WARNING: no timeline.js — rendering with the estimated timeline (run the TTS steps first)');
  const n = Math.ceil(dur * fps), from = Number(opt('--from') ?? 0), to = Math.min(n, Number(opt('--to') ?? n));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  // fresh: frames since the last capture. The first unchanged frame after a change is captured again before anything is reused,
  // so a capture that raced the paint can never be copied across a whole still stretch.
  let last = null, reused = 0, fresh = 0;
  for (let i = from; i < to; i++) {
    const changed = await page.evaluate(settle, i / fps);
    if (changed || !last || fresh < 2) { last = await grab(); fresh = changed ? 1 : fresh + 1; } else reused++;
    if (!ff.stdin.write(last)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
  console.log(`frames ${from}-${to} of ${n} → ${out} (${reused} reused, ${((Date.now() - T0) / 1000).toFixed(0)} s)`, errs.length ? 'ERRORS: ' + errs.slice(0, 3).join(' | ') : '');
  if (errs.length) process.exit(1);
})();
