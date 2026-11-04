// Run every check for one video in one go:  node videos/tools/check-all.js videos/src/<video>
// 1. every model's self-check (videos/models/*/check.js — new models are picked up automatically)
// 2. video-level check (page and text base read from <video>/ref/manifest.json: "page", "textBase")
// 3. reference images (<video>/ref/manifest.json)
// Exit code 1 if anything fails. Run it before every commit that touches a model or a video's drawing.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const vdir = path.resolve(process.argv[2] || ''), mpath = path.join(vdir, 'ref', 'manifest.json');
if (!fs.existsSync(mpath)) { console.error('usage: node check-all.js videos/src/<video>   (needs <video>/ref/manifest.json)'); process.exit(2); }
const run = (title, file, args, cwd) => { console.log(`\n=== ${title}`); return cp.spawnSync('node', [file, ...args], { cwd, stdio: 'inherit' }).status === 0; };
const results = [];
const modelsDir = path.join(__dirname, '..', 'models');
for (const d of fs.readdirSync(modelsDir).sort()) { const c = path.join(modelsDir, d, 'check.js');
  if (fs.existsSync(c)) results.push([`model ${d}`, run(`model ${d}: check.js`, c, [], path.dirname(c))]); }
const M = JSON.parse(fs.readFileSync(mpath, 'utf8'));
if (!M.page || !M.textBase) { console.log('FAIL manifest.json needs "page" and "textBase"'); results.push(['manifest', false]); }
else results.push(['video', run('video: check-video.js', path.join(__dirname, 'check-video.js'), [path.resolve(path.dirname(mpath), M.page), '--base', M.textBase], process.cwd())]);
results.push(['references', run('references: ref-check.js', path.join(__dirname, 'ref-check.js'), [mpath], process.cwd())]);
console.log('\n=== summary'); for (const [n, ok] of results) console.log(`${ok ? 'PASS' : 'FAIL'} ${n}`);
process.exit(results.every(r => r[1]) ? 0 : 1);
