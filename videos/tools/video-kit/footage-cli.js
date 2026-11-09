// Footage of a kit video (registry: <video>/anim/footage.js; timing and geometry: footage.js next to this file).
//   node videos/tools/video-kit/footage-cli.js extract videos/src/<video> [--clip <id>] [--force]
//     ffmpeg decodes the clip's source frames (no audio: -an), each frame is cropped through its crop (keyframes, rotation),
//     resampled (bicubic) to the panel size × render scale (606 × 410 × 1.5 = 909 × 615) and written as
//     <video>/footage/frames/<clip>/<source frame number>.jpg (gitignored). A clip whose meta.json matches its definition, its
//     source file and its frame list is skipped, so re-running is cheap.
//   node videos/tools/video-kit/footage-cli.js check videos/src/<video>
//     overlays (no crop within 4 px of a burned-in overlay, none leaves the frame), orientation (main incision within ±30° of
//     straight down), events / freezes / tracked points inside their clips, frame files present and up to date.
//     Exit 0 = all pass, 1 = a failure, 3 = only skips (the footage is not on this machine: fresh checkout) — check-all.js
//     reports 3 as SKIP, never PASS.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const F = require('./footage.js');
const ROOT = path.resolve(__dirname, '../../..');
const VERSION = 1, QUALITY = 2;   // bump VERSION when the resampling changes (forces re-extraction)

function load(vdir) {
  const file = path.join(vdir, 'anim', 'footage.js');
  if (!fs.existsSync(file)) { console.error(`no ${path.relative(process.cwd(), file)}`); process.exit(2); }
  const D = require(file); F.use(D); return D;
}
const framesDir = (vdir, id) => path.join(vdir, 'footage', 'frames', id);
function sourceStat(src) { const f = path.join(ROOT, src.file); try { const s = fs.statSync(f); return { file: src.file, size: s.size, mtime: Math.round(s.mtimeMs) }; } catch { return null; } }
// what the frames of a clip depend on: its definition, the source's geometry, the output size and the extractor version
function metaOf(D, id, withSource = true) {
  const c = D.clips[id], s = D.sources[c.src];
  return { version: VERSION, quality: QUALITY, clip: c, source: { w: s.w, h: s.h, fps: s.fps, ...(withSource ? { stat: sourceStat(s) } : {}) }, out: F.outPx(c), frames: F.frames(c) };
}
const sameMeta = (a, b, withSource) => { const strip = m => withSource ? m : { ...m, source: { ...m.source, stat: undefined } }; return JSON.stringify(strip(a)) === JSON.stringify(strip(b)); };
function missingFrames(dir, c) { const [a, b] = F.frames(c), miss = []; for (let n = a; n <= b; n++) if (!fs.existsSync(path.join(dir, F.pad(n) + '.jpg'))) miss.push(n); return miss; }
// the source file must be what the registry says (size and frame rate drive every crop and every frame number)
function probe(src) {
  const r = cp.spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', path.join(ROOT, src.file)]).stdout.toString().trim().split(',');
  const [a, b] = r[2].split('/').map(Number), w = +r[0], h = +r[1], fps = a / b;
  return w === src.w && h === src.h && Math.abs(fps - src.fps) < 1e-6 ? null : `declared ${src.w}×${src.h} @ ${src.fps} fps, file is ${w}×${h} @ ${fps.toFixed(3)} fps`;
}
function readMeta(dir) { try { return JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch { return null; } }

// ---------------------------------------------------------------- resampling (Catmull-Rom bicubic; supersampled when shrinking)
function cubicW(t) { const t2 = t * t, t3 = t2 * t; return [(-t3 + 2 * t2 - t) / 2, (3 * t3 - 5 * t2 + 2) / 2, (-3 * t3 + 4 * t2 + t) / 2, (t3 - t2) / 2]; }
function resample(srcBuf, SW, SH, out, OW, OH, c, cr) {
  // output pixel centre (ox + .5, oy + .5) / DPR = panel px → source px (pixel centres at +.5): affine, so step it
  const p0 = F.unmapCrop(c, cr, [0.5 / F.DPR, 0.5 / F.DPR]), px = F.unmapCrop(c, cr, [1.5 / F.DPR, 0.5 / F.DPR]), py = F.unmapCrop(c, cr, [0.5 / F.DPR, 1.5 / F.DPR]);
  const dxx = px[0] - p0[0], dxy = px[1] - p0[1], dyx = py[0] - p0[0], dyy = py[1] - p0[1];
  const scale = Math.hypot(dxx, dxy), ss = Math.max(1, Math.ceil(scale - 1e-6)), offs = [];
  for (let i = 0; i < ss; i++) for (let j = 0; j < ss; j++) { const a = (i + 0.5) / ss - 0.5, b = (j + 0.5) / ss - 0.5; offs.push([a * dxx + b * dyx, a * dxy + b * dyy]); }
  const xmax = SW - 1, ymax = SH - 1, inv = 1 / offs.length;
  let o = 0;
  for (let oy = 0; oy < OH; oy++) {
    const rx = p0[0] + oy * dyx - 0.5, ry = p0[1] + oy * dyy - 0.5;   // -0.5: pixel centres → array indices
    for (let ox = 0; ox < OW; ox++) {
      let r = 0, g = 0, b = 0;
      for (const [ax, ay] of offs) {
        const sx = rx + ox * dxx + ax, sy = ry + ox * dxy + ay, ix = Math.floor(sx), iy = Math.floor(sy), wx = cubicW(sx - ix), wy = cubicW(sy - iy);
        for (let m = 0; m < 4; m++) {
          const yy = Math.min(ymax, Math.max(0, iy - 1 + m)) * SW, w = wy[m];
          for (let n = 0; n < 4; n++) {
            const q = (yy + Math.min(xmax, Math.max(0, ix - 1 + n))) * 3, ww = w * wx[n];
            r += srcBuf[q] * ww; g += srcBuf[q + 1] * ww; b += srcBuf[q + 2] * ww;
          }
        }
      }
      out[o++] = Math.max(0, Math.min(255, Math.round(r * inv))); out[o++] = Math.max(0, Math.min(255, Math.round(g * inv))); out[o++] = Math.max(0, Math.min(255, Math.round(b * inv)));
    }
  }
}

async function extractClip(vdir, D, id, force) {
  const c = D.clips[id], s = D.sources[c.src], file = path.join(ROOT, s.file), dir = framesDir(vdir, id);
  const meta = metaOf(D, id), old = readMeta(dir);
  if (!force && old && sameMeta(old, meta, true) && !missingFrames(dir, c).length) { console.log(`UP-TO-DATE ${id}: ${meta.frames[1] - meta.frames[0] + 1} frames in ${path.relative(process.cwd(), dir)}`); return true; }
  if (!fs.existsSync(file)) { console.log(`SKIP ${id}: source ${s.file} is not on this machine (footage/ is gitignored)`); return null; }
  const pb = probe(s); if (pb) { console.log(`FAIL ${id}: source ${s.file}: ${pb}`); return false; }
  const pr = F.check(D); const bad = [...pr.overlay, ...pr.orientation, ...pr.events].filter(m => m.startsWith(id + ':'));
  if (bad.length) { console.log(`REFUSED ${id}: fix the clip first —\n  ` + bad.join('\n  ')); return false; }   // never write frames that show an overlay
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (/^\d{6}\.jpg$/.test(f) || f === 'meta.json') fs.unlinkSync(path.join(dir, f));
  const [f0, f1] = F.frames(c), N = f1 - f0 + 1, [OW, OH] = F.outPx(c), SW = s.w, SH = s.h, T0 = Date.now();
  // seek half a frame early: the first frame decoded is frame f0 (accurate seek drops everything before the seek point)
  const dec = cp.spawn('ffmpeg', ['-v', 'error', '-ss', Math.max(0, (f0 - 0.5) / s.fps).toFixed(6), '-i', file, '-an', '-sn', '-dn', '-frames:v', String(N), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { stdio: ['ignore', 'pipe', 'inherit'] });
  const enc = cp.spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${OW}x${OH}`, '-r', String(s.fps), '-i', '-', '-start_number', String(f0), '-q:v', String(QUALITY), path.join(dir, '%06d.jpg')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = [dec, enc].map(pr => new Promise(r => pr.on('close', r)));   // listen now: a process can close before the loop ends
  const FS = SW * SH * 3, frame = Buffer.alloc(FS), out = Buffer.alloc(OW * OH * 3);
  let fill = 0, n = 0;
  for await (const chunk of dec.stdout) {
    let i = 0;
    while (i < chunk.length) {
      const k = Math.min(FS - fill, chunk.length - i); chunk.copy(frame, fill, i, i + k); fill += k; i += k;
      if (fill === FS) {
        resample(frame, SW, SH, out, OW, OH, c, F.cropAt(c, (f0 + n) / s.fps)); n++; fill = 0;
        if (!enc.stdin.write(Buffer.from(out))) await new Promise(r => enc.stdin.once('drain', r));
      }
    }
  }
  enc.stdin.end();
  const [dc, ec] = await Promise.all(closed);
  if (dc !== 0 || ec !== 0 || n !== N) { console.log(`FAIL ${id}: decoded ${n} of ${N} frames (ffmpeg exit ${dc}/${ec})`); return false; }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
  const sec = (Date.now() - T0) / 1000;
  console.log(`EXTRACTED ${id}: frames ${f0}–${f1} (${N}) → ${path.relative(process.cwd(), dir)} ${OW}×${OH}, ${sec.toFixed(1)} s (${(sec * 1000 / N).toFixed(0)} ms/frame)`);
  return true;
}

function checkFrames(vdir, D) {
  const lines = []; let fail = false, skip = false, total = 0;
  for (const [id, c] of Object.entries(D.clips)) {
    const s = D.sources[c.src]; if (!s) continue;
    const dir = framesDir(vdir, id), have = fs.existsSync(dir), stat = sourceStat(s), meta = readMeta(dir), N = F.frames(c)[1] - F.frames(c)[0] + 1;
    if (stat) { const pb = probe(s); if (pb) { fail = true; lines.push(`FAIL frames ${id}: source ${s.file}: ${pb}`); continue; } }
    if (!have && !stat) { skip = true; lines.push(`SKIP frames ${id}: footage not on this machine (${s.file} and ${path.relative(ROOT, dir)} are gitignored) — nothing to check`); continue; }
    if (!have || !meta) { fail = true; lines.push(`FAIL frames ${id}: not extracted — run node videos/tools/video-kit/footage-cli.js extract ${path.relative(ROOT, vdir)}`); continue; }
    if (!sameMeta(meta, metaOf(D, id, !!stat), !!stat)) { fail = true; lines.push(`FAIL frames ${id}: stale (the clip, its source or the extractor changed since extraction) — re-run extract`); continue; }
    const miss = missingFrames(dir, c);
    if (miss.length) { fail = true; lines.push(`FAIL frames ${id}: ${miss.length} of ${N} frame files missing (first ${F.pad(miss[0])}.jpg) — re-run extract`); continue; }
    total += N; lines.push(`PASS frames ${id}: ${N} frames up to date${stat ? '' : ' (source not on this machine; frames from an earlier extraction)'}`);
  }
  return { lines, fail, skip, total };
}

(async () => {
  const [cmd, v, ...rest] = process.argv.slice(2);
  if (!['extract', 'check'].includes(cmd) || !v) { console.error('usage: node footage-cli.js extract|check videos/src/<video> [--clip id] [--force]'); process.exit(2); }
  const vdir = path.resolve(v), D = load(vdir), ci = rest.indexOf('--clip'), only = ci >= 0 ? rest[ci + 1] : null;
  if (cmd === 'extract') {
    let ok = true;
    for (const id of Object.keys(D.clips)) if (!only || id === only) { const r = await extractClip(vdir, D, id, rest.includes('--force')); if (r === false) ok = false; }
    process.exitCode = ok ? 0 : 1; return;
  }
  const r = F.check(D), nClips = Object.keys(D.clips).length, nOv = Object.values(D.sources).reduce((a, s) => a + (s.overlays || []).length, 0);
  console.log(`footage of ${path.relative(ROOT, vdir)}: ${Object.keys(D.sources).length} source(s), ${nClips} clip(s)`);
  const rep = (name, probs, okMsg) => { if (probs.length) probs.forEach(m => console.log(`FAIL ${name} ${m}`)); else console.log(`PASS ${name}: ${okMsg}`); return !probs.length; };
  let ok = rep('overlay', r.overlay, `${r.info.crops} crops (every source frame and keyframe) stay ≥ ${F.OVERLAY_PAD} px from ${nOv} overlay rect(s) and inside the frame`);
  ok = rep('orientation', r.orientation, `${r.info.landmarks.length} landmark(s), main incision from straight down: ${r.info.landmarks.join(', ')} (limit ±${F.ORIENT_TOL}°)`) && ok;
  ok = rep('events', r.events, `${r.info.events} event(s), freezes, tracked points and crop keyframes inside their clips`) && ok;
  const fr = checkFrames(vdir, D); fr.lines.forEach(l => console.log(l)); if (fr.fail) ok = false;
  console.log(!ok ? 'footage: FAIL' : fr.skip ? 'footage: SKIP (geometry and timing pass; frame files not checked)' : 'footage: all checks passed');
  process.exitCode = !ok ? 1 : fr.skip ? 3 : 0;   // exitCode, not exit(): let piped stdout flush
})();
