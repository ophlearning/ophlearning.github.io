// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, confirmed by
//    站長 2026-11-13; 結構 = clock-hour numbers and list numbers).
// 2. Narration ↔ model (M…): each spatial claim the narration makes is checked on what the video draws (the socket model through
//    anim/views-socket.js), against case or literature numbers written here — never against the model's own parameters.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const { SEGS, REFS } = require('./anim/segments.js');
global.SOCKET = require('../../models/socket/socket.js');
const VS0 = require('./anim/views-socket.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const CLK = { '12': '結構', '3': '結構', '6': '結構', '9': '結構' };
const LEDGER = {
  'title': { ...CLK, '41': '病例' },
  '1-1': { ...CLK, '2009': '病例', '41': '病例', '3.5': 'Gomaa 2017', '5-0': '病例', '2023': '病例' },
  '1-2': { ...CLK, '139': 'Girgis 2012', '14.8': 'Girgis 2012' },
  '2-1': { ...CLK, '102': 'Kazi 2015', '50': 'Zhang 2026', '1': '示意' },   // 1: 1 點半, the exposure's clock hour (示意)
  '2-2': { ...CLK },
  '3-1': { ...CLK, '102': 'Kazi 2015', '84': 'Kazi 2015', '90': 'Kazi 2015' },
  '3-2': { ...CLK },
  '3-3': { ...CLK, '102': 'Kazi 2015', '13.7': 'Kazi 2015', '1': 'Kazi 2015' },
  '4-1': { ...CLK },
  '4-2': { ...CLK },
  '5-1': { ...CLK },
  '5-2': { ...CLK },
  '5-3': { '139': 'Girgis 2012', '81': 'Girgis 2012', '93': 'Girgis 2012', '4': 'Das 2024', '6': 'Das 2024' },
  '6': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '12': '結構' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const FREE = ['病例', '結構', '示意'];

async function screenText() {   // all text drawn on screen per segment, at 60 % and 98 % of every narration line
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.waitForTimeout(200);
  const out = await p.evaluate(() => { const r = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add(t.textContent); }
      r[s.id] = [...set]; }
    return r; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

// ---------------------------------------------------------------- 2. narration ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const CASE = { recti: [12, 3, 6, 9], bandW: 3.5, expose: 1.5 };   // 病例: band under the four recti; Gomaa 2017: #41 3.5 mm wide; exposure 1:30 (示意)
// clock hour of a screen vector in the surgeon's view, surgeon at 12: screen down = 12, screen left = 3 (OS temporal) — written here
const clockSurg = d => { let h = Math.atan2(-d[0], d[1]) / (Math.PI / 6); if (h <= 0) h += 12; return h; };
const hdiff = (a, b) => { let d = a - b; d -= 12 * Math.round(d / 12); return d; };
function modelChecks(ctx) {
  const R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]);
  const MC = ctx.modelChecks || [];
  for (const f of MC) f(ctx, ok);
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(s === '院內常規' || s === '本片各章來源' || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video or 院內常規`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      if (src === '結構' && !found.has(n)) continue;   // clock-hour numbers: listed for every surgical segment, used where the clock face is drawn
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      ok(srcs.includes(src) || FREE.includes(src), `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  // every reference is cited somewhere
  const all = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).join(' ');
  for (const r of REFS) { const who = r.split(' ')[0], yr = (r.match(/ (\d{4});/) || [])[1]; ok(all.includes(`${who} ${yr}`), `reference ${who} ${yr} is cited in some segment`); }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER), VS: VS0, modelChecks: MODEL_CHECKS };
}
const MODEL_CHECKS = [];   // filled below once the socket model's views are wired (views-socket.js)
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in some/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[0] += '7 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-3'].push('拉 25 mm'); }],
      ['ledger entry not used', c => { c.ledger['5-3']['99'] = 'Girgis 2012'; }],
      ['ledger source not cited in the segment', c => { c.ledger['1-1']['3.5'] = 'Kazi 2015'; }],
      ['citation not in REFS', c => { c.screen['1-2'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Girgis 2011'; }],
      ['reference never cited', c => { c.segs.find(s => s.id === '5-2').src[1][1] = ''; }],
      ...MUTATIONS,
    ];
    let bad = 0;
    for (const [name, mut, target] of M) { const c = baseCtx(screen); mut(c); const fails = runAll(c).filter(r => !r[0]), n = fails.length, hit = !target || fails.some(r => r[1].startsWith(target + ' '));
      console.log(`${n && hit ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail${target ? (hit ? `, including ${target}` : `, not ${target}`) : ''}`); if (!n || !hit) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
const MUTATIONS = [];   // model-check mutations, added with the model checks
