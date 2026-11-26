// Scleral-tunnel cataract video — video checks run by videos/tools/check-all.js (in this folder; or: node check.js [--list]).
// 1. Number ledger: every number in the narration, key-point boxes, titles and every text drawn on screen (each drawn segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every ledger source must be cited in that segment
//    (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, the OP note confirmed by 站長 2026-11-26; 結構 = clock hours, list
//    numbers, scale bars); every「作者 年份」shown or cited must be in REFS, and every reference cited somewhere; a ledger number that is not
//    used fails too (結構 excepted). The print sheets (print/) read this LEDGER as text (videos/tools/print/numcheck.js).
// 2. Case geometry (C…, on anim/params.js and the globe model): the tunnel the narration describes (outer opening 1–2 mm behind the limbus,
//    lip ≈ 1.5 mm in clear cornea, inside the wall), the 2.65 mm keratome, the surgeon at 1–2 o'clock with the incision in front, the side port
//    on the surgeon's left. Narration ↔ drawing checks (M…) on window.SYNC are added chapter by chapter (spec.md 進度).
// 3. Self-test (every run): each check is broken once on purpose (a mutation) and must then fail; a mutation not caught fails the run.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const { SEGS, REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const CLK = { '12': '結構', '6': '結構', '3': '結構', '9': '結構', '1': '結構', '2': '結構' };   // clock hours (the microscope panel's 約 1–2 點)
const SB = { '1': '結構' };                                   // the 1 mm scale bar of the sections
const LEDGER = {
  'title': { ...CLK, '2.65': '病例', '10-0': '病例' },
  '1-1': { ...CLK, '1': 'Goel 2022', '2': 'Goel 2022' },
  '1-2': { ...CLK, ...SB, '3.5': 'Olsen 1997', '4.0': 'Olsen 1997', '6': 'Olsen 1997', '0.72': 'Olsen 1997', '0.36': 'Olsen 1997', '3.0': 'Hayashi 2010', '2.0': 'Hayashi 2010', '5.88': 'ESCRS 2007' },
  '2-1': { ...CLK, '1': '病例', '2': '病例' },
  '2-2': { ...CLK, ...SB, '15': '病例' },
  '3-1': { ...CLK, '2.65': '病例', '1': 'Goel 2022', '2': 'Goel 2022', '1.5': '示意' },
  '3-2': { ...CLK, ...SB, '1.5': 'Ernest 1994' },
  '3-3': { ...CLK, ...SB, '3.2': 'Ernest 1994', '1.5': 'Ernest 1994', '525': 'Ernest 1994', '2.0': 'Ernest 1994', '13': 'Ernest 1994' },
  '4-1': { ...CLK, ...SB, '339': 'Subudhi 2021', '12.6': 'Subudhi 2021' },
  '4-2': { ...CLK, '339': 'Subudhi 2021', '10.6': 'Subudhi 2021', '1': 'John 1992', '34': 'John 1992', '6': 'John 1992' },
  '5-1': { ...CLK, ...SB, '5.0': 'Hollick 1999', '5.5': 'Hollick 1999' },
  '5-2': { ...CLK, ...SB, '6.5': '病例', '4.0': 'Ye 2021', '0.75': 'Soda 2012' },
  '6-1': { ...CLK, ...SB },
  '6-2': { ...CLK, '10-0': '病例', '4': 'Azar 1997', '8': 'Azar 1997' },
  '6-3': { ...CLK, '1': 'ESCRS 2007', '0.1': 'ESCRS 2007', '4.92': 'ESCRS 2007' },
  '7': { ...CLK, '1': 'Goel 2022', '2': 'Goel 2022', '1.5': 'Ernest 1994' },
};
const FREE = ['病例', '結構', '示意', '院內常規'];
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who + ' ') && new RegExp('\\b' + c.year + '[;:(]').test(r));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const strip = t => String(t).replace(/<[^>]+>/g, '');

async function fromPage() {   // all text drawn on screen per drawn segment (60 % and 98 % of every line), and window.SYNC
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const out = await p.evaluate(() => { const r = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add([...t.childNodes].map(n => n.textContent).join(' ')); }   // tspans joined with a space (「LI」「7 點」)
      r[s.id] = [...set]; }
    return { screen: r, sync: window.SYNC }; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const L = ctx.ledger[sg.id]; if (!L) { ok(false, `${sg.id}: has a ledger entry`); continue; }
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => strip(k[1])), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1]));
    for (const s of srcs) ok(s === '本片各章來源' || FREE.includes(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 shown is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      if (src === '結構' && !found.has(n)) continue;   // clock hours and list numbers: listed for every segment, used where they are drawn
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      ok(srcs.some(s => s.includes(src)) || FREE.includes(src), `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  const all = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).join(' ');
  for (const r of REFS) { const who = r.split(' ')[0], yr = (r.match(/ (\d{4});/) || [])[1]; ok(all.includes(`${who} ${yr}`), `reference ${who} ${yr} is cited in some segment`); }
  return R;
}

// ---------------------------------------------------------------- 2. case geometry (C) and narration ↔ drawing (M, on window.SYNC)
const tnOf = cfg => K.tunnelOf(cfg);
const CASE_CHECKS = [
  (ctx, ok) => { const tn = tnOf(ctx.case.main); ok('C1', tn.sE >= 1 && tn.sE <= 2, `outer opening ${tn.sE.toFixed(2)} mm behind the limbus (narration 1–2 mm, Goel 2022)`); },
  (ctx, ok) => { const tn = tnOf(ctx.case.main); ok('C2', Math.abs(-tn.sI - 1.5) <= 0.1, `inner opening ${(-tn.sI).toFixed(2)} mm into clear cornea (narration: lip about 1.5 mm, Ernest 1994)`); },
  (ctx, ok) => { const tn = tnOf(ctx.case.main);   // every inner point of the tunnel between the outer and the inner surface at its own s
    const inside = tn.pts.slice(1, -1).every(([rho, z]) => { let best = 1e9, sd = null;
      for (let s = tn.sI - 0.3; s <= tn.sE + 0.3; s += 0.005) { const f = G.surfAt(s), d = (f.rho - rho) * f.nr + (f.z - z) * f.nz, off = Math.hypot(f.rho - f.nr * d - rho, f.z - f.nz * d - z);
        if (off < best) { best = off; sd = [s, d]; } } return sd && sd[1] > 0 && sd[1] < G.T(sd[0]); });
    ok('C3', inside, 'the tunnel runs inside the wall (between the outer and the inner surface)'); },
  (ctx, ok) => ok('C4', ctx.case.main.w === 2.65, `main incision ${ctx.case.main.w} mm = the 2.65 mm keratome (病例)`),
  (ctx, ok) => { const c = ctx.case; ok('C5', c.surgeon >= 1 && c.surgeon <= 2 && Math.abs(c.main.h - c.surgeon) < 1e-9, `surgeon at ${c.surgeon} o'clock (narration 1–2) with the main incision in front of him (upper-temporal of OS)`); },
  (ctx, ok) => { const c = ctx.case, lh = ((c.side.h - c.surgeon) % 12 + 12) % 12; ok('C6', lh > 0 && lh < 6, `side port on the surgeon's left (${lh.toFixed(1)} h clockwise of the surgeon's hour as the examiner sees it)`); },
];
const MODEL_CHECKS = [];   // M…: narration ↔ drawing on window.SYNC (added with the chapters' drawings)
function modelChecks(ctx) { const R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]); for (const f of [...CASE_CHECKS, ...MODEL_CHECKS]) f(ctx, ok); return R; }
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(pg) { const text = {}; for (const s of SEGS) text[s.id] = clone(s); return { text, segs: clone(SEGS), screen: clone(pg.screen), sync: clone(pg.sync || {}), ledger: clone(LEDGER), case: clone(CASE) }; }

// ---------------------------------------------------------------- 3. mutations: each must make at least one check (the named one) fail
const MUTATIONS = [
  ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[0] += '7 mm'; }],
  ['on-screen number without a source', c => { (c.screen['3-2'] = c.screen['3-2'] || []).push('隧道 4.5 mm'); }],
  ['ledger entry not used', c => { c.ledger['4-1']['99'] = 'Subudhi 2021'; }],
  ['ledger source not cited in the segment', c => { c.ledger['1-2']['0.72'] = 'Ernest 1994'; }],
  ['citation on screen not in REFS', c => { (c.screen['1-2'] = c.screen['1-2'] || []).push('Smith 2020'); }],
  ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Olsen 1998'; }],
  ['reference never cited', c => { c.segs.find(s => s.id === '2-1').src[0][1] = ''; }],
  ['outer opening on clear cornea', c => { c.case.main.s = -0.3; }, 'C1'],
  ['lip 0.6 mm', c => { c.case.main.L = 2.1; }, 'C2'],
  ['3.2 mm keratome', c => { c.case.main.w = 3.2; }, 'C4'],
  ['surgeon at 12 with the incision at 1:30', c => { c.case.surgeon = 12; }, 'C5'],
  ['side port on the surgeon\'s right', c => { c.case.side.h = c.case.surgeon - 2.2; }, 'C6'],
];

(async () => {
  const pg = await fromPage();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => strip(k[1])), ...(pg.screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(pg));
  let fail = 0, nl = 0;
  for (const [c, m] of res) { if (!c) { fail++; console.log('FAIL ' + m); } else if (/^[CM]\d/.test(m)) console.log('PASS ' + m); else nl++; }
  console.log(`PASS ledger: ${nl} number / source / citation checks (${SEGS.filter(s => !s.chapterCard && s.layout !== 'refs').length} segments, on-screen text included)`);
  let bad = 0;
  for (const [name, mut, target] of MUTATIONS) { const c = baseCtx(pg); mut(c); const fails = runAll(c).filter(r => !r[0]), hit = !target || fails.some(r => r[1].startsWith(target + ' '));
    if (!fails.length || !hit) { bad++; console.log(`FAIL selftest: breaking 「${name}」 is not caught${target ? ` by ${target}` : ''}`); } }
  console.log(bad ? `selftest: ${bad} of ${MUTATIONS.length} mutations not caught` : `PASS selftest: all ${MUTATIONS.length} mutations caught`);
  fail += bad;
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
