// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list] [--ledger]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 病例 (病例 = spec.md「病例情境」, confirmed
//    by 站長 2026-11-23; 結構 = list numbers).
//    The printed OR sheets (videos/tools/print, numcheck.js) read LEDGER from this file as text: the entries '1', '8' (checklist items) and
//    'Gioia' … '院內' (the anatomy tables' rows) belong to the sheets and are not segments of the video; keep their keys.
// 2. Narration ↔ model (M1–M10): each spatial claim the narration makes is checked on the eyelid model (lower lid: LOWER sagittal,
//    CORONAL with { lower }, CANTHUS axial) and on the wedge this video draws (anim/params.js WEDGE), against literature numbers.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger). --ledger only checks that every ledger citation is in REFS (no browser).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(M, 'lid.js'));
global.CORONAL = require(path.join(M, 'coronal.js'));
global.LOWER = require(path.join(M, 'lower.js'));
global.LOWERC = require(path.join(M, 'lower-coronal.js'));
global.CANTHUS = require(path.join(M, 'canthus.js'));
const { SEGS, REFS } = require(path.join(__dirname, 'anim', 'segments.js'));
const { BP, BS, WEDGE } = require(path.join(__dirname, 'anim', 'params.js'));

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const STEPS = { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '7': '結構', '8': '結構' };
const LEDGER = {
  // printed sheets (print/checklist.js, print/anatomy.js): checklist items '1', '8' and the anatomy tables' rows
  '1': { '6': 'Pushker 2025', '8': 'Pushker 2025', '7.5': 'Beigi 2008', '11': 'Beigi 2008' },
  '8': { '7': 'Auguste 2023', '4': 'Auguste 2023', '54': 'Auguste 2023', '8': 'Auguste 2023' },
  'Gioia': { '1.5': 'Gioia 1987' },
  'Vahdani': { '641': 'Vahdani 2018', '84': 'Vahdani 2018', '100': 'Vahdani 2018', '0': 'Vahdani 2018', '89.1': 'Vahdani 2018', '9': 'Vahdani 2018' },
  'Poon': { '100': 'Poon 2019', '92': 'Poon 2019', '90': 'Poon 2019', '0': 'Poon 2019', '7': 'Poon 2019', '6.5': 'Poon 2019' },
  'Barrett': { '225': 'Barrett 2012', '54': 'Barrett 2012', '92.4': 'Barrett 2012' },
  'Prendes': { '70': 'Prendes 2020', '1.4': 'Prendes 2020' },
  '院內': {},
  // video segments
  'title': {},
  '1-1': {},
  '1-2': { '54': 'Auguste 2023', '4': 'Auguste 2023', '7': 'Auguste 2023', '8': 'Auguste 2023' },
  '1-3': { '641': 'Vahdani 2018', '84': 'Vahdani 2018', '100': 'Vahdani 2018；Poon 2019', '0': 'Vahdani 2018；Poon 2019', '89.1': 'Vahdani 2018', '9': 'Vahdani 2018',
           '92': 'Poon 2019', '90': 'Poon 2019', '7': 'Poon 2019', '6.5': 'Poon 2019' },
  '2': { '6': 'Pushker 2025', '8': 'Pushker 2025', '80': 'Beigi 2008', '7.5': 'Beigi 2008', '11': 'Beigi 2008' },
  '3-1': {}, '3-2': {}, '3-3': {}, '3-4': {},
  '3-5': { '1.5': 'Gioia 1987' },
  '3-6': {}, '4': {},
  '5': { '225': 'Barrett 2012', '92.4': 'Barrett 2012', '70': 'Prendes 2020', '46.9': 'Prendes 2020', '1.4': 'Prendes 2020' },
  '6': { ...STEPS },
};
const SEG_IDS = new Set(SEGS.map(s => s.id));
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const FREE = ['院內常規', '示意', '結構', '病例'];

async function screenText() {   // all text drawn on screen per segment, at 60 % and 98 % of every narration line
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
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

function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const [seg, nums] of Object.entries(ctx.ledger)) for (const [n, src] of Object.entries(nums))
    for (const s of plainSrc(String(src))) ok(FREE.includes(s) || cites(s).length === 1 && inRefs(cites(s)[0]), `ledger ${seg} ${n}: source 「${s}」 is a reference of this video or ${FREE.join(' / ')}`);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(s === '院內常規' || s === '病例' || s === '本片各章來源' || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video, 院內常規 or 病例`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      for (const s of plainSrc(src)) { const cited = srcs.includes(s) || ['結構', '示意'].includes(s) || (s === '院內常規' && texts.join('').includes('院內常規'));
        ok(cited, `${sg.id}: ledger source of ${n} (${s}) is cited in the segment`); } }
  }
  for (const seg of Object.keys(ctx.ledger)) if (!SEG_IDS.has(seg)) ok(['1', '8', 'Gioia', 'Vahdani', 'Poon', 'Barrett', 'Prendes', '院內'].includes(seg), `ledger key ${seg} is a segment or a printed-sheet entry`);
  return R;
}

// ---------------------------------------------------------------- 2. narration ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2), hyp = p => Math.hypot(p[0], p[1]), sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const lerp = (a, b, k) => a + (b - a) * k;
const dotp = (a, b) => a[0] * b[0] + a[1] * b[1], unit = v => { const d = hyp(v) || 1; return [v[0] / d, v[1] / d]; };
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const lashMin = r => Math.min(...r.A.lashPtsL.map(p => LOWER.toGlobe(p)));
function modelChecks(ctx) {
  const P = ctx.P, S = ctx.S, W = ctx.W, R = [], ok = (c, m) => R.push([!!c, m]);
  // M1 title / 1-1 / 2: the entropion puts the lashes on the cornea; 4: at the end check they are off it (normal lid)
  { const pre = LOWER.draw({ state: P.pre }), post = LOWER.draw({ state: {} });
    ok(line(ctx, 'title', 0).includes('睫毛往內刷到角膜') && lashMin(pre) < 0.6, `M1 entropion (entr ${P.pre.entr}): lash ${f2(lashMin(pre))} mm from the cornea (touching; title 「睫毛往內刷到角膜」)`);
    ok(line(ctx, '4', 0).includes('睫毛離開角膜') && lashMin(post) > 2, `M1 end check: lash ${f2(lashMin(post))} mm from the cornea (4 「睫毛離開角膜」)`); }
  // M2 2: distraction — the lax lid distracts within 7.5–11 mm (Beigi 2008) and beyond 6–8 mm (Pushker 2025)
  { const lax = CANTHUS.state(S.LAX).D;
    ok(line(ctx, '2', 1).includes(`${P.distractSig[0]} 到 ${P.distractSig[1]} mm`) && line(ctx, '2', 1).includes(`${P.distractEnt[0]} 到 ${P.distractEnt[1]} mm`) && lax >= P.distractEnt[0] && lax <= P.distractEnt[1] && lax > P.distractSig[1],
      `M2 lax lid distracts ${f2(lax)} mm (narration: > ${P.distractSig.join('–')} significant; entropion ${P.distractEnt.join('–')} mm)`); }
  // M3 1-2 / 3-5: after the tarsal end is fixed (stripFix, 示意) the lid no longer distracts beyond 6 mm (「拉不開」「眼瞼變緊」)
  { const fx = CANTHUS.state({ ...S.LAX, ...S.FIXED }).D;
    ok(line(ctx, '3-5', 2).includes('眼瞼變緊') && fx < P.distractSig[0], `M3 after fixation the lid distracts ${f2(fx)} mm (< ${P.distractSig[0]} mm; 3-5 「眼瞼變緊」, 1-2 「拉不開」)`); }
  // M4 3-2: canthotomy horizontal from the canthus toward the rim; cantholysis cuts the inferior crus (below the canthal level)
  { const c = CORONAL.draw({ lower: S.CUTS }), A = c.A, LC = CORONAL.LC;
    ok(line(ctx, '3-2', 0).includes('水平剪開') && near(A.canthotomy[1], LC[1], 1e-6) && A.canthotomy[0] < LC[0], `M4 canthotomy horizontal (y ${f2(A.canthotomy[1])} = canthus ${f2(LC[1])}), temporal to the canthus`);
    ok(line(ctx, '3-2', 1).includes('下支') && A.cantholysis[1] > LC[1] + 0.5, `M4 cantholysis ${f2(A.cantholysis[1] - LC[1])} mm below the canthal level (narration 下支)`); }
  // M5 3-1: the wedge's base is on the lash line, its apex below the inferior tarsal border (coronal)
  { const c = CORONAL.draw({ lower: { rimShow: 1 } }), q = W.cor(c, P.wedge), xm = (q[0][0] + q[2][0]) / 2;
    const base = Math.max(Math.abs(q[0][1] - c.lashLY(q[0][0])), Math.abs(q[2][1] - c.lashLY(q[2][0]))), below = q[1][1] - c.tarBotLY(xm);
    ok(line(ctx, '3-1', 2).includes('底邊在睫毛線') && base < 1e-6, `M5 wedge base on the lash line (off by ${f2(base)} mm)`);
    ok(line(ctx, '3-1', 2).includes('瞼板下緣下方') && below > 0.5, `M5 wedge apex ${f2(below)} mm below the inferior tarsal border`); }
  // M6 3-4: the cut is full thickness — each axial cut line crosses the whole lid band (conjunctiva 0 … skin 2.36 mm) and beyond
  { const ax = CANTHUS.draw({ state: { ...S.LAX, ...S.CUTS } }), T = LID.track(ax.lidPts); let worst = 1e9;
    for (const x of [P.wedge.xa, P.wedge.xb]) { const [a, b] = W.axLine(ax.lidPts, x), q = WEDGE.qAt(T, x), p0 = T.off(q, 0), n1 = T.off(q, 1), s = n1[1] < p0[1] ? 1 : -1, n = unit(sub(T.off(q, s), p0));
      const da = dotp(sub(a, p0), n), db = dotp(sub(b, p0), n); worst = Math.min(worst, -Math.min(da, db), Math.max(da, db) - 2.36); }
    ok(line(ctx, '3-4', 0).includes('全層') && ['皮膚', 'orbicularis', '瞼板', '結膜'].every(w => line(ctx, '3-4', 0).includes(w)) && worst > 0.1, `M6 axial cuts cross the lid band from the conjunctiva to the skin, ${f2(worst)} mm beyond (narration 全層：皮膚、orbicularis、瞼板、結膜)`); }
  // M7 3-1 / 3-4 / 3-3: both views draw the same wedge — the axial cuts sit at the coronal wedge's x (lateral and medial edge)
  { const ax = CANTHUS.draw({ state: { ...S.LAX, ...S.CUTS } }); let d = 0;
    for (const x of [P.wedge.xa, P.wedge.xb]) { const [a, b] = W.axLine(ax.lidPts, x), T = LID.track(ax.lidPts), p0 = T.off(WEDGE.qAt(T, x), 0); const ab = sub(b, a), t = Math.max(0, Math.min(1, dotp(sub(p0, a), ab) / dotp(ab, ab))), off = hyp(sub(p0, [a[0] + ab[0] * t, a[1] + ab[1] * t]));
      d = Math.max(d, Math.abs(p0[0] - x), off); }
    ok(d < 0.05, `M7 axial cut lines at the coronal wedge's x (${P.wedge.xa}, ${P.wedge.xb}; off by ${f2(d)} mm)`); }
  // M8 3-4 / 4: the wedge is at the lateral canthus, not in the middle of the lid (「在外眥附近」「瞼緣不留 notch」): it starts within
  //    1.5 mm of the commissure and stays in the lateral quarter of the palpebral fissure
  { const LC = CORONAL.LC, MC = CORONAL.MC, d0 = P.wedge.xa - LC[0], fr = (P.wedge.xb - LC[0]) / (MC[0] - LC[0]);
    ok(line(ctx, '3-4', 0).includes('在外眥附近') && d0 >= 0 && d0 <= 1.5 && fr < 0.25, `M8 wedge from ${f2(d0)} mm medial to the canthus to ${f2(fr * 100)} % of the fissure (lateral quarter)`); }
  // M9 3-5: Whitnall tubercle 1.5 mm behind the rim (Gioia 1987); the tarsal end is fixed on the periosteum behind the rim; same x in both views
  { const ax = CANTHUS.draw({ state: { ...S.LAX, ...ctx.FIX } }), co = CORONAL.draw({ lower: ctx.FIX }), F = ax.A.stripFix || [NaN, NaN], FC = co.A.stripFix || [NaN, NaN];
    const tub = hyp(sub(CANTHUS.TUB, CANTHUS.RIM_E)), wall = Math.min(...ax.inner.map(q => hyp(sub(q, F))));
    ok(line(ctx, '3-5', 1).includes(`約 ${P.tubercleMm} mm`) && near(tub, P.tubercleMm, 0.01), `M9 Whitnall tubercle ${f2(tub)} mm behind the rim (narration 約 ${P.tubercleMm} mm, Gioia 1987)`);
    ok(line(ctx, '3-5', 0).includes('外側眶緣的骨膜') && F[1] > CANTHUS.RIM_E[1] && wall <= LID.PERI + 0.3, `M9 tarsal end fixed ${f2(F[1] - CANTHUS.RIM_E[1])} mm behind the rim, ${f2(wall)} mm from the bone (in the periosteum)`);
    ok(near(FC[0], F[0], 0.3), `M9 fixation point: axial x ${f2(F[0])} vs coronal x ${f2(FC[0])} (same x in both views)`); }
  // M10 orientation: every step segment shows the axial section seen from below (temporal left) next to the surgeon's view; every
  //     panel of the right eye says the case is OS (mirror image)
  for (const sg of ctx.segs.filter(s => s.ch === 3 && !s.chapterCard)) { const t = (ctx.screen[sg.id] || []).join('｜');
    ok(t.includes('外眥水平切面 axial（從下往上看，同 CT）') && t.includes('上＝前　左＝temporal') && t.includes('術者視角：左＝temporal'), `M10 ${sg.id}: axial (from below, anterior up, temporal left) + surgeon's view, orientation written`);
    ok(t.includes('右眼 OD（本台 OS 左右相反）'), `M10 ${sg.id}: the OD drawing says the case is OS (左右相反)`); }
  for (const id of ['title', '1-1', '1-2', '2', '4']) ok((ctx.screen[id] || []).join('｜').includes('右眼 OD（本台 OS 左右相反）'), `M10 ${id}: the OD drawing says the case is OS (左右相反)`);
  return R;
}

// ---------------------------------------------------------------- run
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P: clone(BP), S: clone(BS), FIX: clone(BS.FIXED), W: { ...WEDGE }, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
if (require.main === module) (async () => {
  if (process.argv.includes('--ledger')) { const r = ledgerChecks({ ...baseCtx({}), segs: [] }), bad = r.filter(x => !x[0]); bad.forEach(x => console.log('FAIL ' + x[1]));
    console.log(bad.length ? `${bad.length} ledger source(s) not in REFS` : `PASS ledger: ${r.length} number / source entries, every citation is in REFS`); process.exit(bad.length ? 1 : 0); }
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|printed-sheet/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-4').lines[2] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-5'].push('眶緣後方 2.5 mm'); }],
      ['ledger entry not used', c => { c.ledger['1-3']['99'] = 'Vahdani 2018'; }],
      ['ledger source not cited in the segment', c => { c.ledger['5']['92.4'] = 'Poon 2019'; }],
      ['citation not in REFS', c => { c.screen['1-3'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '2').src[0][1] = 'Pushker 2024'; }],
      ['ledger key that is neither a segment nor a sheet entry', c => { c.ledger['9-9'] = {}; }],
      ['lashes not on the cornea before', c => { c.P.pre.entr = 0.8; }],
      ['distraction outside the reported range', c => { c.P.distractEnt = [10, 12]; }],
      ['lid still lax after fixation', c => { c.S.FIXED.stripFix = 0; }],
      ['canthotomy not horizontal', c => { c.text['3-2'].lines[0] = c.text['3-2'].lines[0].replace('水平剪開', '垂直剪開'); }],
      ['cantholysis not the inferior crus', c => { c.text['3-2'].lines[1] = c.text['3-2'].lines[1].replace('下支', '上支'); }],
      ['wedge apex above the tarsal border', c => { c.P.wedge.below = -1.5; }],
      ['wedge base off the lash line', c => { const f = c.W.cor; c.W.cor = (r, w) => f(r, w).map((p, i) => i === 1 ? p : [p[0], p[1] + 0.8]); }],
      ['cut not through the conjunctiva', c => { const f = c.W.axLine; c.W.axLine = (pts, x) => { const [a, b] = f(pts, x); return [a, [lerp(a[0], b[0], 0.7), lerp(a[1], b[1], 0.7)]]; }; }],
      ['axial cut not at the coronal wedge', c => { const f = c.W.axLine; c.W.axLine = (pts, x) => f(pts, x).map(p => [p[0] + 1, p[1]]); }],
      ['wedge in the middle of the lid', c => { c.P.wedge.xa = -2; c.P.wedge.xb = 1.2; }],
      ['tubercle distance', c => { c.P.tubercleMm = 2; }],
      ['tarsal end not on the periosteum', c => { c.FIX.stripFix = 0.5; }],
      ['orientation not written', c => { c.screen['3-4'] = c.screen['3-4'].filter(t => !t.includes('從下往上看')); }],
      ['OS not said', c => { c.screen['3-5'] = c.screen['3-5'].map(t => t.replace('（本台 OS 左右相反）', '')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
if (typeof module !== 'undefined') module.exports = { LEDGER };
