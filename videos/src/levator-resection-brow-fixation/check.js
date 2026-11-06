// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 (structure: list numbers, axis zero).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the surgery is checked on the eyelid model with the
//    parameters the drawing uses (anim/params.js).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path'), fs = require('fs');
const M = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(M, 'lid.js'));
const CORONAL = require(path.join(M, 'coronal.js'));
const { SEGS, REFS } = require('./anim/segments.js');
const { LRP, INC } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-1': { '4': 'Dagi Glass 2026', '10': 'Chen 2016', '20': 'Chen 2016' },
  '1-2': { '100': 'Kokubo 2019a', '80': 'Kokubo 2019a', '84': 'Kokubo 2019a', '2.5': 'Kokubo 2019a', '2.9': 'Kokubo 2019a', '0.24': 'Kokubo 2019b', '0.51': 'Kokubo 2019b' },
  '1-3': { '24': 'Lee 2024', '88': 'Lee 2024', '36.6': 'Lee 2024', '54.8': 'Lee 2024', '45.2': 'Lee 2024' },
  '2': { '1990': 'McCord 1990', '1.7': 'Baker 2016', '1': 'Baker 2016', '1.3': 'Baker 2016', '0.9': 'Baker 2016', '2': 'Mokhtarzadeh 2017', '3': 'Kaderli 2020',
         '2.29': 'Mokhtarzadeh 2017', '4': 'Mokhtarzadeh 2017', '5': 'Mokhtarzadeh 2017', '2.54': 'Nemet 2019', '3.19': 'Kaderli 2020', '24': 'Kaderli 2020', '0': '結構' },
  '3-1': { '2.5': '院內常規', '4': '院內常規', '5': '院內常規' },
  '4-1': { '20': 'Rojanasakul 2026' },
  '4-2': { '10': 'Eshraghi 2024', '60': 'Eshraghi 2024' },
  '4-4': { '4-0': '院內常規', '3': '院內常規', '0.55': 'Takagi 2022' },
  '4-5': { '4-0': '院內常規', '1': '院內常規', '5': 'Manta 2025', '1.8': 'Manta 2025', '13': 'Manta 2025', '12': 'Manta 2025', '22': 'Pruksapong 2022', '24': 'Pruksapong 2022', '2.5': '院內常規' },
  '4-7': { '6-0': '院內常規', '4': '院內常規', '7-0': '院內常規' },
  '5': { '1': '結構', '2': '結構', '3': '結構', '476': 'Pupić-Bakrač 2024', '1.2': 'Pupić-Bakrač 2024', '4-6': '結構' },
  '6': { '40': 'Tucker 1999', '52': 'Tucker 1999', '1.1': 'Tucker 1999', '6': 'Tucker 1999', '1': 'Tucker 1999', '0.5': 'Tucker 1999', '2': 'Chen 2016' },
  '7': { '1': '結構', '2': '結構', '3': '結構', '4': '院內常規', '5': '院內常規', '6': '結構', '7': '結構', '8': '結構', '2.5': '院內常規', '4-0': '院內常規', '6-0': '院內常規', '7-0': '院內常規' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
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
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const toGlobe = p => Math.hypot(p[0], p[1]) - Math.hypot(...LID.gp(Math.atan2(p[1], p[0])));
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
function modelChecks(ctx) {
  const P = ctx.P, R = [], ok = (c, m) => R.push([!!c, m]);
  // 3-1: incision heights 2.5 / 4 / 4 mm from the lash line and a 5 mm strip (院內常規); the narration says the parameter values
  { const say = line(ctx, '3-1', 1), say2 = line(ctx, '3-1', 2);
    ok(say.includes(`內側 ${P.incH[0]} mm、中央 ${P.incH[1]} mm、外側 ${P.incH[2]} mm`) && say2.includes(`寬 ${P.excW} mm`), `3-1 narration states the drawn incision heights ${P.incH.join('/')} mm and strip ${P.excW} mm`);
    const st = { ...P.inc, excCut: 1, excRemove: 1, mrd1: P.mrdPre }, s = LID.draw({ variant: ctx.variant, state: st }), c = CORONAL.draw({ variant: ctx.variant, state: st }), E = s.A.excQ;
    ok(near(E.qLo - E.qLash, 4, 0.01) && near(E.qHi - E.qLo, 5, 0.01), `sagittal: lower incision ${f2(E.qLo - E.qLash)} mm from the lash line along the skin (narration 4), strip ${f2(E.qHi - E.qLo)} mm (narration 5)`);
    const h = x => c.excLoY(x) - c.lashY(x), [xM, xL] = P.inc.incX, r0 = h(xM) / h(0), r2 = h(xL) / h(0);
    ok(near(r0, 2.5 / 4, 0.02) && near(r2, 4 / 4, 0.02) && xM > 0 && xL < 0, `coronal: medial mark (x ${xM}, nasal) at ${f2(r0)} and lateral mark (x ${xL}, temporal) at ${f2(r2)} of the central height (narration 2.5/4 and 4/4)`);
    ok(near(c.excLoY(0) - c.lashY(0), s.A.incLo[1] - s.A.lashSkin[1], 0.3), `central incision height above the lash line: coronal ${f2(c.excLoY(0) - c.lashY(0))} vs sagittal ${f2(s.A.incLo[1] - s.A.lashSkin[1])}`); }
  // 1-2: brow descent after ptosis repair 2.5–2.9 mm (Kokubo 2019a): the drawn drop lies in that range, the same in both views
  { const say = line(ctx, '1-2', 3), d = P.browRaise, s0 = LID.draw({ variant: ctx.variant, state: { mrd1: P.mrdPre, browY: d } }), s1 = LID.draw({ variant: ctx.variant, state: { mrd1: P.mrdPost } });
    const c0 = CORONAL.draw({ variant: ctx.variant, state: { mrd1: P.mrdPre, browY: d } }), c1 = CORONAL.draw({ variant: ctx.variant, state: { mrd1: P.mrdPost } });
    const dS = s1.A.browLo[1] - s0.A.browLo[1], dC = c1.browLoY(0) - c0.browLoY(0);
    ok(say.includes('2.5 到 2.9 mm') && d >= 2.5 && d <= 2.87 && near(dS, d, 0.05) && near(dC, d, 0.05), `1-2 brow drop drawn ${f2(dS)} (sagittal) / ${f2(dC)} mm (coronal), narration 2.5–2.9 mm (Kokubo 2019a: 2.50–2.87)`); }
  // 4-5: MRD1 about 2.5 mm after the brow fixation (院內常規), both views
  { const say = line(ctx, '4-5', 6), m = P.mrdPost, s = LID.draw({ variant: ctx.variant, state: { mrd1: m } }), c = CORONAL.draw({ variant: ctx.variant, state: { mrd1: m } });
    ok(say.includes(`約 ${m} mm`) && m === 2.5 && near(-c.Uy(0), m, 0.05) && near(-s.DP.at(0, 0)[1], m, 0.1), `MRD1 ${m}: coronal margin ${f2(-c.Uy(0))}, sagittal ${f2(-s.DP.at(0, 0)[1])} mm above the light reflex (narration 約 2.5 mm)`); }
  // 4-4: three tarsal sutures, temporal / central / nasal; partial-thickness bite in the tarsus
  { const st = { ...P.adv }, c = CORONAL.draw({ variant: ctx.variant, state: st }), X = c.A.tarSutX || [];
    ok(line(ctx, '4-4', 0).includes('縫三針') && X.length === 3 && P.tarN === 3 && X[0] < 0 && near(X[1], 0, 0.01) && X[2] > 0, `4-4 tarsal sutures: ${X.length} at x ${X.map(f2).join(' / ')} (narration 三針：內、中、外)`); }
  // 4-7: four orbicularis–levator sutures
  { const c = CORONAL.draw({ variant: ctx.variant, state: { ...P.adv, creaseFix: 1 } }), n = (c.svg.match(/stroke="#2463eb" stroke-width="1.8" stroke-linecap="round" opacity=/g) || []).length;
    ok(line(ctx, '4-7', 0).includes('縫四針') && n === 4 && P.creaseN === 4, `4-7 crease sutures drawn ${n} (narration 四針)`); }
  // 4-5: one brow fixation suture into the periosteum above the rim, lateral to the supraorbital notch
  { const st = { ...P.adv, browPlane: 1, browSut: 1 }, s = LID.draw({ variant: ctx.variant, state: st }), c = CORONAL.draw({ variant: ctx.variant, state: { ...st, notch: 1 } });
    const bone = s.probe.bone; let dB = 1e9; for (const q of bone) dB = Math.min(dB, Math.hypot(q[0] - s.A.browSutP[0], q[1] - s.A.browSutP[1]));
    ok(line(ctx, '4-5', 0).includes('固定一針') && P.browN === 1 && dB <= LID.PERI + 0.05 && s.A.browSutP[1] < LID.RIM_Y, `4-5 brow suture: one bite ${f2(dB)} mm from the bone (in the periosteum), above the rim`);
    const mid = 31.84 - CORONAL.NOTCH_X;
    ok(line(ctx, '4-5', 5).includes(`約 ${P.notchMid[0]} 到 ${P.notchMid[1]} mm`) && mid >= P.notchMid[0] && mid <= P.notchMid[1] && CORONAL.NOTCH_X > 0 && c.A.browFix[0] < CORONAL.NOTCH_X - CORONAL.NOTCH_W / 2,
      `4-5 supraorbital notch ${f2(mid)} mm from the midline (narration 22–24), on the nasal side (內側, x ${f2(CORONAL.NOTCH_X)}); fixation point lateral to it`); }
  // 4-5: ROOF about 1.8 mm, 5 mm below the rim (Manta 2025), horizontal thickness as in the paper
  { const s = LID.draw({ variant: ctx.variant }), y = LID.RIM_Y + P.roofBelow, X = k => s.crossX(s.probe[k], y), roof = X('pb') - X('musB');
    ok(line(ctx, '4-5', 2).includes(`${P.roofBelow} mm 還有約 ${P.roofTh} mm`) && near(roof, P.roofTh, 0.4), `4-5 ROOF ${f2(roof)} mm at ${P.roofBelow} mm below the rim (narration 約 ${P.roofTh} mm)`); }
  // 4-2: Asian single eyelid — the septum fuses below the superior tarsal border, so the preaponeurotic fat reaches in front of the tarsus;
  //      the lacrimal gland is on the lateral (temporal) side
  { const s = LID.draw({ variant: ctx.variant }), tt = s.DP.at(10, 0.6), c = CORONAL.draw({ variant: ctx.variant });
    ok(s.A.fusion[1] > tt[1] + 0.5, `4-2 fusion ${f2(s.A.fusion[1] - tt[1])} mm below the superior tarsal border (narration 瞼板上緣的下方融合)`);
    ok(c.A.lacrimal[0] < -10, `4-2 / 5 lacrimal gland at x ${f2(c.A.lacrimal[0])} (temporal = 外側)`); }
  // 4-3: the clamp sits above the resection line (narration 把 clamp 下方多出來的那一段切掉)
  { const st = { ...P.open, dis: 1, clamp: 1, resect: 1 }, s = LID.draw({ variant: ctx.variant, state: st }), cut = s.LVd.off(s.A.lid.sClamp, 0.3);
    ok(line(ctx, '4-3', 2).includes('clamp 下方') && s.A.clamp[1] < cut[1] - 0.3, `4-3 clamp ${f2(cut[1] - s.A.clamp[1])} mm above the resection line`); }
  // 4-6: the fornix suture starts in the fornix (above the tarsus) and comes out on the skin below the lower incision, never in the globe
  { const st = { ...P.adv, prolapse: 1, fornixSut: 1 }, s = LID.draw({ variant: ctx.variant, state: st }), F = s.A.fornixSutPts, tt = s.DP.at(10, 0.6);
    ok(line(ctx, '4-6', 1).includes('固定回穹窿') && F[0][1] < tt[1] && F[F.length - 1][1] > s.A.incLo[1] && Math.min(...F.map(toGlobe)) > 0, `4-6 fornix suture from ${f2(tt[1] - F[0][1])} mm above the tarsus to the skin ${f2(F[F.length - 1][1] - s.A.incLo[1])} mm below the incision`); }
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
  const P = { ...clone(LRP), inc: clone(INC) };
  P.open = { ...P.inc, mrd1: P.mrdPre, excCut: 1, excRemove: 1, septOpen: 1, fatUp: 1 };
  P.adv = { ...P.open, dis: 1, resect: 1, advance: 1, tarSut: 1, mrd1: P.mrdPost };
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER), variant: 'asian' };
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
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '4-4').lines[2] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-5'].push('上提 1.7 mm'); }],
      ['ledger entry not used', c => { c.ledger['1-3']['99'] = 'Lee 2024'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-1']['20'] = 'Lee 2024'; }],
      ['citation not in REFS', c => { c.screen['2'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Kokubo 2018'; }],
      ['incision heights', c => { c.P.incH = [3, 4, 4]; c.P.inc.incH = [3, 4, 4]; }],
      ['incision position', c => { c.P.inc.incX = [-5.75, 5.75]; }],
      ['strip width', c => { c.P.inc.excW = 6; c.P.open.excW = 6; }],
      ['brow drop', c => { c.P.browRaise = 3.2; }],
      ['MRD1 after fixation', c => { c.P.mrdPost = 3; }],
      ['tarsal sutures', c => { c.P.tarN = 2; }],
      ['crease sutures', c => { c.text['4-7'].lines[0] = c.text['4-7'].lines[0].replace('四針', '三針'); }],
      ['brow suture', c => { c.text['4-5'].lines[0] = c.text['4-5'].lines[0].replace('一針', '兩針'); }],
      ['notch distance', c => { c.P.notchMid = [24, 26]; }],
      ['ROOF', c => { c.P.roofTh = 3; }],
      ['Asian fusion / lacrimal gland', c => { c.variant = 'caucasian'; }],
      ['clamp above the cut', c => { c.text['4-3'].lines[2] = c.text['4-3'].lines[2].replace('clamp 下方', 'clamp 上方'); }],
      ['fornix suture', c => { c.text['4-6'].lines[1] = c.text['4-6'].lines[1].replace('固定回穹窿', '固定到瞼板'); }],
    ];
    let bad = 0;
    for (const [name, mut] of M) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
