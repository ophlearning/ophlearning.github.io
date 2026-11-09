// Run every check for one video in one go:  node videos/tools/check-all.js videos/src/<video>
// 1. every model's self-check (videos/models/*/check.js — new models are picked up automatically)
// 1b. the video's own check.js, if present (numbers said in that video ↔ the model; number ledger)
// 1c. footage (video-kit/footage-cli.js check), if the video has anim/footage.js: overlays, orientation, events, frame files
// 2. video-level check (page and text base read from <video>/ref/manifest.json: "page", "textBase"; "page": null = no video page yet, skipped)
// 3. reference images (<video>/ref/manifest.json)
// Exit code 1 if anything fails. Run it before every commit that touches a model or a video's drawing.
// A step that exits with 3 is reported as SKIP (footage not on this machine), never PASS; SKIP does not fail the run.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const vdir = path.resolve(process.argv[2] || ''), mpath = path.join(vdir, 'ref', 'manifest.json');
if (!fs.existsSync(mpath)) { console.error('usage: node check-all.js videos/src/<video>   (needs <video>/ref/manifest.json)'); process.exit(2); }
const run = (title, file, args, cwd) => { console.log(`\n=== ${title}`); const st = cp.spawnSync('node', [file, ...args], { cwd, stdio: 'inherit' }).status; return st === 0 ? true : st === 3 ? null : false; };
const results = [];
const modelsDir = path.join(__dirname, '..', 'models');
for (const d of fs.readdirSync(modelsDir).sort()) { const c = path.join(modelsDir, d, 'check.js');
  if (fs.existsSync(c)) results.push([`model ${d}`, run(`model ${d}: check.js`, c, [], path.dirname(c))]); }
// 1b. the video's own checks, if it has them (<video>/check.js: narrated numbers ↔ model, number ledger); run from the video folder
const vcheck = path.join(vdir, 'check.js');
if (fs.existsSync(vcheck)) results.push(['video numbers (check.js)', run('video: check.js (narration ↔ model, number ledger)', vcheck, [], vdir)]);
// 1c. real surgical footage: crops avoid the burned-in overlays, main incision at the bottom, events inside clips, frames extracted
if (fs.existsSync(path.join(vdir, 'anim', 'footage.js'))) results.push(['footage', run('footage: footage-cli.js check (overlays, orientation, events, frames)', path.join(__dirname, 'video-kit', 'footage-cli.js'), ['check', vdir], process.cwd())]);
const M = JSON.parse(fs.readFileSync(mpath, 'utf8'));
// a video still at the model stage has no video page yet: "page": null skips the video-level check (reported as SKIP, not PASS)
if (M.page === null) { console.log('\n=== video: check-video.js\nSKIP no video page yet (manifest "page": null) — the video-level check starts once the page exists'); results.push(['video (no page yet)', null]); }
else if (!M.page || !M.textBase) { console.log('FAIL manifest.json needs "page" and "textBase"'); results.push(['manifest', false]); }
else results.push(['video', run('video: check-video.js', path.join(__dirname, 'check-video.js'), [path.resolve(path.dirname(mpath), M.page), '--base', M.textBase], process.cwd())]);
results.push(['references', run('references: ref-check.js', path.join(__dirname, 'ref-check.js'), [mpath], process.cwd())]);
console.log('\n=== summary'); for (const [n, ok] of results) console.log(`${ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL'} ${n}`);
process.exit(results.every(r => r[1] !== false) ? 0 : 1);
