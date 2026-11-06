// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 (structure: list numbers, axis zero).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the surgery is checked on the eyelid model
//    (lower lid: LOWER sagittal, CORONAL with { lower }, CANTHUS axial) with the parameters the drawing uses (anim/params.js).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(M, 'lid.js'));
global.CORONAL = require(path.join(M, 'coronal.js'));
global.LOWER = require(path.join(M, 'lower.js'));
global.LOWERC = require(path.join(M, 'lower-coronal.js'));
global.CANTHUS = require(path.join(M, 'canthus.js'));
const { SEGS, REFS } = require('./anim/segments.js');
const { LLP, LS } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-1': {},
  '1-2': { '6': 'Pushker 2025', '8': 'Pushker 2025', '80': 'Beigi 2008', '7.5': 'Beigi 2008', '11': 'Beigi 2008', '3': 'Pushker 2025', '4': 'Pushker 2025' },
  '1-3': { '12': 'Nakos 2019', '42.9': 'Nakos 2019', '11.5': 'Nakos 2019', '29': 'Scheepers 2010', '6': 'Scheepers 2010', '26': 'Scheepers 2010', '0': 'Scheepers 2010', '18': 'Scheepers 2010',
           '151': 'Erb 2006', '3.3': 'Erb 2006', '7': 'Auguste 2023', '8': 'Auguste 2023', '15.7': 'Auguste 2023' },
  '2': { '2.5': '院內常規', '4-0': '院內常規', '2': '院內常規', '1': '院內常規', '3': '院內常規', '6-0': '院內常規', '5': '院內常規' },
  '3': { '2.5': '院內常規' },
  '4-1': { '1979': 'Anderson 1979' },
  '4-3': { '4-0': '院內常規', '1': '院內常規', '1.5': 'Gioia 1987' },
  '4-4': { '2.5': '院內常規' },
  '4-5': { '2.4': 'Kakizaki 2006', '19': 'Kakizaki 2006', '7': 'Kakizaki 2006' },
  '4-6': { '15': '院內常規', '2': '示意', '1': '結構' },
  '4-7': { '4-0': '院內常規', '3': '院內常規' },
  '4-8': { '7-0': '院內常規', '4-0': '院內常規' },
  '5': { '41': 'Yip 2000', '12': 'Yip 2000', '1': 'Yip 2000' },
  '6': { '6': 'Nakos 2019', '8': 'Nakos 2019', '12': 'Nakos 2019', '151': 'Erb 2006', '2': 'Erb 2006', '96': 'Dunbar 2017', '1': 'Dunbar 2017' },
  '7': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '7': '結構', '8': '結構', '2.5': '院內常規', '4-0': '院內常規', '15': '院內常規', '7-0': '院內常規' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);

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
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2), hyp = p => Math.hypot(p[0], p[1]), sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const tg = p => LOWER.toGlobe(p);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const lashMin = r => Math.min(...r.A.lashPtsL.map(tg));
function modelChecks(ctx) {
  const P = ctx.P, S = ctx.S, R = [], ok = (c, m) => R.push([!!c, m]);
  // title / 1-1 / 4-7: the recurrent entropion puts the lashes on the cornea; tying the everting sutures takes them off it
  { const pre = LOWER.draw({ state: S.PRE }), tied = LOWER.draw({ state: S.TIED });
    ok(lashMin(pre) < 0.6 && Math.min(...pre.probe.skin.map(tg)) >= 0, `recurrence (PRE): lash ${f2(lashMin(pre))} mm from the cornea (touching, title 「睫毛往內碰到角膜」); lid outside the globe`);
    ok(line(ctx, '4-7', 2).includes('睫毛離開角膜') && lashMin(tied) > 2 && tg(tied.A.lashTipL) > 3, `4-7 tied: lash ${f2(lashMin(tied))} mm (tip ${f2(tg(tied.A.lashTipL))} mm) from the cornea (narration 睫毛離開角膜)`); }
  // 3 / 4-4: subciliary incision 2.5 mm below the lash line, measured along the skin (院內常規); both views at the same height
  { const st = { ...S.PRE, subcil: 1, incH: P.incH }, s = LOWER.draw({ state: st }), arc = s.SK.near(s.A.incL) - s.SK.near(s.A.lashSkinL);
    const c = CORONAL.draw({ lower: st }), dC = c.incLY(0) - c.lashLY(0), dS = s.A.incL[1] - s.A.lashSkinL[1];
    ok(line(ctx, '3', 0).includes(`睫毛下 ${P.incH} mm`) && line(ctx, '4-4', 0).includes(`睫毛下 ${P.incH} mm`) && near(arc, 2.5, 0.05), `3 / 4-4 incision ${f2(arc)} mm below the lash line along the skin (narration ${P.incH} mm, 院內常規)`);
    ok(near(dC, dS, 0.3), `incision below the lash line: coronal ${f2(dC)} vs sagittal ${f2(dS)} mm (same height in both views)`); }
  // 4-4: the skin–muscle flap is lifted in front of the septum
  { const s = LOWER.draw({ state: { ...S.PLANE, incH: P.incH } }), pl = s.A.planeL, sp = s.SEPT.pts.reduce((b, q) => Math.abs(q[1] - pl[1]) < Math.abs(b[1] - pl[1]) ? q : b);
    ok(line(ctx, '4-4', 2).includes('在眶隔前面') && pl[0] < sp[0] - 0.5, `4-4 dissection plane ${f2(sp[0] - pl[0])} mm in front of the septum at the same height (narration 在眶隔前面)`); }
  // 4-5: retractors opened down to the conjunctiva; the septum joins the CPF 2.4 mm below the tarsus along the CPF (Kakizaki 2006: 2.38)
  { const s = LOWER.draw({ state: S.OPEN }), [c0, c1] = s.A.retrCutPts, conj = s.DP.at(s.A.lower.cpfTop + 0.7, 0);
    ok(line(ctx, '4-5', 0).includes('一直到結膜') && hyp(sub(c1, conj)) < 0.05, `4-5 retractor cut ends ${f2(hyp(sub(c1, conj)))} mm from the conjunctiva (narration 一直到結膜)`);
    let L = 0, p = LOWER.LF.at(LOWER.S_TARL, LOWER.U_CPF); for (let q = LOWER.S_TARL + 0.01; q <= LOWER.S_FUSL + 1e-9; q += 0.01) { const n = LOWER.LF.at(q, LOWER.U_CPF); L += hyp(sub(n, p)); p = n; }
    const nat = LOWER.draw({});
    ok(line(ctx, '4-5', 2).includes(`${P.fusionMm} mm`) && near(L, P.fusionMm, 0.05) && hyp(sub(p, nat.A.fusionL)) < 0.05, `4-5 fusion ${f2(L)} mm below the tarsus along the CPF (narration 約 ${P.fusionMm} mm; Kakizaki 2006 2.38)`); }
  // 4-6: tarsal fracture to half the tarsal thickness, not through the conjunctiva (院內常規); drawn from the front 2 mm from the margin (示意)
  { const s = LOWER.draw({ state: S.FRAC }), [a, b] = s.A.fracPts, d = hyp(sub(a, b)), post = s.DP.at(P.fracS, LOWER.U_CONJ);
    ok(line(ctx, '4-6', 0).includes('一半深度') && near(d / LOWER.TAR_TH, P.fracDepth, 0.02) && P.fracDepth === 0.5, `4-6 fracture ${f2(d)} mm = ${f2(d / LOWER.TAR_TH)} of the tarsal thickness (narration 一半深度)`);
    ok(line(ctx, '4-6', 1).includes('不切穿到結膜') && hyp(sub(b, post)) > 0.5, `4-6 the cut stops ${f2(hyp(sub(b, post)))} mm short of the conjunctival surface (narration 不切穿)`);
    ok(line(ctx, '4-6', 2).includes(`離瞼緣 ${P.fracS} mm`) && near(s.A.lower.fracS, P.fracS, 1e-9), `4-6 fracture drawn ${P.fracS} mm from the margin (narration states the schematic value)`); }
  // 4-7: everting mattress sutures ×3 with the strip (×2 without: chapter 2 card); in at the conjunctiva near the fornix, out through the skin
  //      between the lash line and the incision, never in the globe
  { const c3 = CORONAL.draw({ lower: S.MATT }), c2 = CORONAL.draw({ lower: { ...S.MATT, lts: 0 } }), s = LOWER.draw({ state: S.MATT });
    ok(line(ctx, '4-7', 0).includes('縫三針') && P.mattN === 3 && c3.mattressX.length === P.mattN && c2.mattressX.length === 2, `4-7 mattress sutures drawn ${c3.mattressX.length} with the strip (narration 三針), ${c2.mattressX.length} without (chapter 2 card ×2)`);
    const qL = s.SK.near(s.A.lashSkinL), qE = s.SK.near(s.A.mattressExit), qI = s.SK.near(s.A.incL), inC = hyp(sub(s.A.mattressIn, s.DP.at(LOWER.S_FORNIXL - 1.0, 0)));
    ok(line(ctx, '4-7', 1).includes('結膜面進針') && inC < 0.05 && qE > qL && qE < qI && tg(s.A.mattressExit) > 0 && Math.min(...s.sutPts.map(tg)) > 0,
      `4-7 suture enters the conjunctiva 1 mm from the fornix, exits the skin ${f2(qE - qL)} mm below the lash line (incision at ${f2(qI - qL)}), never inside the globe`);
    const thr = s.sutPts.some(q => { for (let u = LOWER.U_ITM; u <= LOWER.U_CPF; u += 0.05) for (let t = LOWER.S_TARL; t < LOWER.S_FORNIXL; t += 0.1) if (hyp(sub(q, s.DP.at(t, u))) < 0.12) return true; return false; });
    ok(line(ctx, '4-7', 1).includes('穿過 retractors') && thr, `4-7 the suture passes through the retractors (CPF layer)`); }
  // 4-8 / 6: the corrected lid: tying rotates the margin out; 5 overcorrection (示意) lifts the margin off the globe
  { const t = LOWER.draw({ state: S.TIED }), o = LOWER.draw({ state: { ...S.TIED, over: P.over } });
    ok(line(ctx, '5', 2).includes('ectropion') && tg(o.A.marginL) > 1 && tg(o.A.marginL) > tg(t.A.marginL) + 0.5, `5 overcorrection (示意 ${P.over}°): margin ${f2(tg(o.A.marginL))} mm off the globe vs ${f2(tg(t.A.marginL))} mm after a normal tie`); }
  // 1-2: distraction test — the lax (entropion) lid distracts within 7.5–11 mm (Beigi 2008) and beyond the 6–8 mm threshold (Pushker 2025);
  //      a normal lid and the lid after the strip stay below 6 mm
  { const lax = CANTHUS.state({ lax: 1 }).D, nrm = CANTHUS.state({}).D, lts = CANTHUS.state({ lax: 1, ...ctx.LTSFIX }).D;
    ok(line(ctx, '1-2', 1).includes(`${P.distractSig[0]} 到 ${P.distractSig[1]} mm`) && line(ctx, '1-2', 1).includes(`${P.distractEnt[0]} 到 ${P.distractEnt[1]} mm`) && lax >= P.distractEnt[0] && lax <= P.distractEnt[1] && lax > P.distractSig[1],
      `1-2 lax lid distracts ${f2(lax)} mm (narration: > ${P.distractSig.join('–')} significant; entropion 7.5–11 mm)`);
    ok(nrm < P.distractSig[0] && lts < P.distractSig[0], `normal lid ${f2(nrm)} mm, after the strip ${f2(lts)} mm (< ${P.distractSig[0]} mm; 4-3 「眼瞼變緊」)`);
    ok(line(ctx, '1-2', 3).includes(`${P.excursion[0]} 到 ${P.excursion[1]} mm`), `1-2 downgaze excursion ${P.excursion.join('–')} mm stated as in Pushker 2025`); }
  // 4-1: canthotomy runs horizontally from the lateral canthus toward the rim; cantholysis cuts the inferior crus (downward from the canthus);
  //      the axial cut crosses the tendon between the commissure and the tubercle
  { const c = CORONAL.draw({ lower: { canthotomy: 1, cantholysis: 1 } }), A = c.A, LC = CORONAL.LC;
    ok(line(ctx, '4-1', 1).includes('水平剪開') && near(A.canthotomy[1], LC[1], 1e-6) && A.canthotomy[0] < LC[0], `4-1 canthotomy horizontal (y ${f2(A.canthotomy[1])} = canthus ${f2(LC[1])}), temporal to the canthus`);
    ok(line(ctx, '4-1', 2).includes('下支') && A.cantholysis[1] > LC[1] + 0.5, `4-1 cantholysis ${f2(A.cantholysis[1] - LC[1])} mm below the canthal level (narration 下支)`); }
  // 4-3: the strip goes to the periosteum on the inner side of the lateral rim, at the Whitnall tubercle 1.5 mm behind the rim (Gioia 1987);
  //      one suture; the fixation point is at the same x in the axial and the coronal view
  { const ax = CANTHUS.draw({ state: { lax: 1, ...ctx.LTSFIX } }), co = CORONAL.draw({ lower: ctx.LTSFIX }), F = ax.A.stripFix || [NaN, NaN], FC = co.A.stripFix || [NaN, NaN];
    const tub = hyp(sub(CANTHUS.TUB, CANTHUS.RIM_E)), wall = Math.min(...ax.inner.map(q => hyp(sub(q, F))));
    ok(line(ctx, '4-3', 1).includes(`約 ${P.tubercleMm} mm`) && near(tub, P.tubercleMm, 0.01), `4-3 Whitnall tubercle ${f2(tub)} mm behind the rim (narration 約 ${P.tubercleMm} mm, Gioia 1987)`);
    ok(line(ctx, '4-3', 0).includes('外側眶緣內面的骨膜') && F[1] > CANTHUS.RIM_E[1] && wall <= LID.PERI + 0.3, `4-3 strip fixed ${f2(F[1] - CANTHUS.RIM_E[1])} mm behind the rim, ${f2(wall)} mm from the bone (in the periosteum)`);
    ok(line(ctx, '4-3', 0).includes('一針') && P.ltsN === 1 && near(FC[0], F[0], 0.3), `4-3 one fixation point, axial x ${f2(F[0])} vs coronal x ${f2(FC[0])} (same x in both views)`); }
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
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意'].includes(src) || (src === '院內常規' && (srcs.includes(src) || texts.join('').includes('院內常規')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P: clone(LLP), S: clone(LS), LTSFIX: { canthotomy: 1, cantholysis: 1, strip: 1, stripFix: 1 }, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '4-7').lines[2] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-3'].push('眶緣後方 2.5 mm'); }],
      ['ledger entry not used', c => { c.ledger['1-3']['99'] = 'Nakos 2019'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-5']['2.4'] = 'Lin 2019'; }],
      ['citation not in REFS', c => { c.screen['1-3'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Pushker 2024'; }],
      ['lashes not on the cornea before', c => { c.S.PRE.entr = 0.8; }],
      ['lashes still on the cornea after tying', c => { c.S.TIED.tie = 0.3; }],
      ['incision height', c => { c.P.incH = 3; }],
      ['plane behind the septum', c => { c.text['4-4'].lines[2] = c.text['4-4'].lines[2].replace('在眶隔前面', '在眶隔後面'); }],
      ['retractors not opened to the conjunctiva', c => { c.text['4-5'].lines[0] = c.text['4-5'].lines[0].replace('一直到結膜', '一直到脂肪'); }],
      ['fusion distance', c => { c.P.fusionMm = 3; }],
      ['fracture depth', c => { c.S.FRAC.fracDepth = 0.8; }],
      ['fracture through the conjunctiva', c => { c.S.FRAC.fracDepth = 0.9; c.P.fracDepth = 0.9; }],
      ['fracture height', c => { c.P.fracS = 2.5; }],
      ['mattress count', c => { c.P.mattN = 2; }],
      ['suture exit above the lash line', c => { c.S.MATT.exitH = -0.5; }],
      ['suture not through the retractors', c => { c.text['4-7'].lines[1] = c.text['4-7'].lines[1].replace('穿過 retractors', '繞過 retractors'); }],
      ['overcorrection not shown', c => { c.P.over = 6; }],
      ['distraction outside the reported range', c => { c.P.distractEnt = [10, 12]; }],
      ['strip not fixed (lid stays lax)', c => { c.LTSFIX.stripFix = 0; }],
      ['downgaze excursion', c => { c.P.excursion = [2, 5]; }],
      ['canthotomy not horizontal', c => { c.text['4-1'].lines[1] = c.text['4-1'].lines[1].replace('水平剪開', '垂直剪開'); }],
      ['cantholysis not the inferior crus', c => { c.text['4-1'].lines[2] = c.text['4-1'].lines[2].replace('下支', '上支'); }],
      ['tubercle distance', c => { c.P.tubercleMm = 2; }],
      ['strip not on the inner rim', c => { c.text['4-3'].lines[0] = c.text['4-3'].lines[0].replace('外側眶緣內面的骨膜', '外側眶緣前面的骨膜'); }],
      ['strip sutures', c => { c.P.ltsN = 2; }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
