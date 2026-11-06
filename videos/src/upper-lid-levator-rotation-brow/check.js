// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 (structure: list numbers, chapter / segment numbers,
//    scale bars). A number used for two things in one segment lists both sources, separated by 「；」 (each must be cited).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the surgery is checked on the eyelid model
//    (videos/models/eyelid: lid.js, coronal.js) with the parameters the drawing uses (anim/params.js).
// 3. Views: every surgical segment states the orientation of both views (sagittal: 左＝前　上＝上; surgeon's view: 面對病人：左＝temporal).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(M, 'lid.js'));
const CORONAL = require(path.join(M, 'coronal.js'));
const { SEGS, REFS } = require('./anim/segments.js');
const { LRP, INC, MRP, EP, IX } = require('./anim/params.js');
const MIS_X = [-3.2, -1.2];   // coronal x of the misdirected lashes the needle enters in 4-2 (anim/draw.js)

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-1': { '60': 'Cruz 2015a', '2': 'Cruz 2015a', '1': 'Cruz 2015a' },
  '1-2': { '10': 'Cruz 2023', '70': 'Cruz 2023', '9': 'Cruz 2023；Tucker 2000', '60': 'Tucker 2000', '33': 'Tucker 2000', '6': 'Tucker 2000', '20': 'Tucker 2000', '1': 'Tucker 2000' },
  '2-1': { '2.5': '院內常規', '4': '院內常規' },
  '2-2': { '3': 'Cruz 2015a', '15': 'Cruz 2015a', '4': '院內常規' },
  '2-3': { '6-0': 'Cruz 2015a', '3': 'Cruz 2015a' },
  '3-1': { '5': '院內常規', '4-0': '院內常規', '3': '院內常規', '4': '結構', '4-1': '結構', '4-4': '結構' },
  '3-2': { '2.5': 'Kokubo 2019；院內常規', '2.9': 'Kokubo 2019', '4-0': '院內常規', '1': '院內常規', '6-0': '院內常規', '4': '院內常規', '7-0': '院內常規', '4-5': '結構', '1-2': '結構' },
  '4-1': { '1.8': 'Elder 1997', '0.9': 'Elder 1997', '95': 'Elder 1997', '2.4': 'Elder 1997', '1.4': 'Elder 1997', '1': '結構' },
  '4-2': { '1': '結構' },
  '4-3': { '3': 'Singh 2022', '55': 'Singh 2022', '24': 'Sakarya 2010', '66.6': 'Sakarya 2010', '16.6': 'Sakarya 2010', '8.3': 'Sakarya 2010' },
  '5-2': { '1': '結構', '2': '結構', '3': '結構' },
  '6': { '60': 'Tucker 2000', '33': 'Tucker 2000', '9': 'Tucker 2000', '1': 'Tucker 2000', '6': 'Tucker 2000', '20': 'Tucker 2000', '3': 'Cruz 2015a' },
  '7': { '1': '結構', '2': '結構；院內常規', '3': '結構', '4': '結構；院內常規', '5': '結構；院內常規', '6': '結構', '7': '結構', '8': '結構', '2.5': '院內常規', '4-0': '院內常規', '6-0': '院內常規', '7-0': '院內常規' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const LOCAL = ['院內常規', '本片各章來源'];

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
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const toGlobe = p => Math.hypot(p[0], p[1]) - Math.hypot(...LID.gp(Math.atan2(p[1], p[0])));
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const arcLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += hyp(P[i - 1], P[i]); return L; };
function modelChecks(ctx) {
  const P = ctx.P, Q = ctx.Q, R = [], ok = (c, m) => R.push([!!c, m]), F = LID.F;
  // ---- 1-1: in-turned margin puts the lashes on the cornea; turned out they leave it; the misdirected lash still touches it
  { const e = LID.draw({ state: { mrd1: P.mrdPre, curl: Q.entr } }), t = LID.draw({ state: { mrd1: P.mrdPre, curl: 0, misdirected: 1 } });
    const lg = r => Math.min(toGlobe(r.A.lash), toGlobe(r.A.lashTip)), dE = lg(e), dT = lg(t), dM = toGlobe(t.A.misLash);
    ok(dE < 0.4 && dT > 1.5 && dM < 0.3 && line(ctx, '1-1', 6).includes('轉正之後還碰到角膜'), `1-1 lash ${f2(dE)} mm from the globe when in-turned, ${f2(dT)} mm when turned out; misdirected lash ${f2(dM)} mm`);
    ok(line(ctx, '1-1', 5).includes(`${Q.lids} 片眼瞼`) && line(ctx, '1-1', 5).includes(`${Q.lashes} 根`) && Q.lids === 60 && Q.lashes === 2, `1-1 Cruz 2015a: ${Q.lids} lids, one with ${Q.lashes} medial lashes on the cornea`); }
  // ---- 1-2: interaction numbers (Cruz 2023, Tucker 2000)
  { const l2 = line(ctx, '1-2', 2), l3 = line(ctx, '1-2', 3), l4 = line(ctx, '1-2', 4);
    ok(l2.includes(`${Q.ix.buckleN} 位`) && l2.includes(`${Q.ix.upperThird}%`) && l3.includes(`${Q.ix.anteriorN} 位`) && Q.ix.buckleN === 10 && Q.ix.upperThird === 70 && Q.ix.anteriorN === 9,
      `1-2 Cruz 2023: ${Q.ix.buckleN} patients, folds in the upper third ${Q.ix.upperThird}%, ${Q.ix.anteriorN} through the lid crease`);
    ok(Q.ix.lago.every(v => l4.includes(v + '%')) && Q.ix.lago.join('/') === '60/33/9', `1-2 Tucker 2000 lagophthalmos ${Q.ix.lago.join(' / ')} %`); }
  // ---- 2-1: the rotation goes through the levator incision: the crease cut (creaseH) is the levator lower incision, 4 mm from the lash line
  { const st = { mrd1: P.mrdPre, curl: Q.entr, creaseH: Q.creaseH, crease: 1, flap: 1, ...P.inc }, s = LID.draw({ state: st });
    const dq = s.qOf(s.A.creaseSkin) - s.qOf(s.A.lashSkin), same = hyp(s.A.creaseSkin, s.A.incLo);
    ok(same < 0.01 && near(dq, P.incH[1], 0.1) && line(ctx, '2-1', 0).includes('同一條切口'), `2-1 crease incision ${f2(same)} mm from the levator lower incision, ${f2(dq)} mm from the lash line along the skin (narration 中央 ${P.incH[1]})`);
    ok(line(ctx, '2-1', 1).includes(`內側 ${P.incH[0]}、中央 ${P.incH[1]}、外側 ${P.incH[2]} mm`), `2-1 narration states the incision heights ${P.incH.join('/')} mm`);
    const c = CORONAL.draw({ state: { ...P.inc, mrd1: P.mrdPre, excMark: 1e-6 } }), h = x => c.excLoY(x) - c.lashY(x), [xM, xL] = P.inc.incX;
    ok(near(h(xM) / h(0), P.incH[0] / P.incH[1], 0.02) && near(h(xL) / h(0), P.incH[2] / P.incH[1], 0.02) && xM > 0 && xL < 0, `2-1 coronal: medial mark at ${f2(h(xM) / h(0))}, lateral at ${f2(h(xL) / h(0))} of the central height`);
    const s0 = LID.draw({ state: { ...st, curl: 0, flap: 0 } }), hS = s0.A.creaseSkin[1] - s0.A.lashSkin[1];
    ok(near(h(0), hS, 0.3), `2-1 incision height above the lash line (lid not in-turned): coronal ${f2(-h(0))} vs sagittal ${f2(-hS)} mm`);
    ok(s.A.exposedTarsus && line(ctx, '2-1', 2).includes('一直到睫毛根部'), `2-1 the flap exposes the tarsus (hinge 0.7 mm from the margin, at the lash roots)`); }
  // ---- 2-2: full-thickness tarsotomy 3 mm from the margin (Cruz 2015a; the model's S_CUT), at another level than the skin incision
  { const s = LID.draw({ state: { mrd1: P.mrdPre, creaseH: Q.creaseH, crease: 1, flap: 1, cut: 1 } }), DP = s.DP, c = CORONAL.draw({ state: { mrd1: P.mrdPre, incision: 1 } });
    const ant = DP.at(LID.S_CUT, LID.U_TAR), gap = hyp(ant, s.A.creaseSkin);
    ok(LID.S_CUT === Q.cutMm && line(ctx, '2-2', 1).includes(`離瞼緣 ${Q.cutMm} mm`) && line(ctx, '2-2', 1).includes(`${Q.blade} 號刀`), `2-2 tarsotomy at s = ${LID.S_CUT} mm (narration ${Q.cutMm} mm, ${Q.blade} 號刀)`);
    ok(gap > 1 && line(ctx, '2-2', 3).includes(`距睫毛線 ${P.incH[1]} mm`) && line(ctx, '2-2', 3).includes(`距瞼緣 ${Q.cutMm} mm`) && line(ctx, '2-2', 3).includes('不在同一處'), `2-2 skin incision ${f2(gap)} mm from the front of the tarsotomy (different levels)`);
    // the coronal tarsotomy line of this video (anim/draw.js ROT.view) scales the coronal model's cutY profile to the sagittal height
    const hS = DP.at(LID.S_CUT, 0)[1] - DP.at(0, 0)[1], hM = c.cutY(0) - c.Uy(0), hC = hM * (hS / hM);
    ok(near(hC, hS, 0.3) && Math.abs(hM - hS) < 0.6, `2-2 tarsotomy height above the margin: coronal ${f2(-hC)} (model profile ${f2(-hM)}, scaled) vs sagittal ${f2(-hS)} mm`); }
  // ---- 2-3: three buried sutures (Cruz 2015a); in the sagittal section the suture ends in the orbicularis near the lash line, under the skin;
  //      tied, the lashes leave the cornea
  { const c = CORONAL.draw({ state: { mrd1: P.mrdPre, incision: 1, buried: 1 } }), n = (c.svg.match(/stroke="#2463eb" stroke-width="1.8" stroke-dasharray="3 3"/g) || []).length;
    ok(line(ctx, '2-3', 0).includes('三針') && n === Q.sutN && c.SX.length === Q.sutN, `2-3 buried sutures drawn ${n} (narration 三針)`);
    const st = { mrd1: P.mrdPre, creaseH: Q.creaseH, crease: 1, flap: 0, cut: 1, suture: 1, buried: true, curl: Q.after }, s = LID.draw({ state: st }), E = s.A.sutureExit;
    const dSkin = hyp(E, s.skinAt(s.qOf(E), 0)), dLash = hyp(E, s.A.lashSkin);
    ok(dSkin > 0.2 && dLash < 1.6 && line(ctx, '2-3', 1).includes('睫毛根附近的 orbicularis'), `2-3 suture ends ${f2(dSkin)} mm under the skin, ${f2(dLash)} mm from the lash line (buried, near the lash roots)`);
    const lg = r => Math.min(toGlobe(r.A.lash), toGlobe(r.A.lashTip)), d0 = lg(LID.draw({ state: { ...st, curl: Q.entr, suture: 0 } })), d1 = lg(s);
    ok(d0 < 0.4 && d1 > 1.5 && line(ctx, '2-3', 2).includes('瞼緣就往外轉'), `2-3 lash ${f2(d0)} mm from the globe before tying, ${f2(d1)} mm after`); }
  // ---- 3-1: 5 mm strip above the incision (院內常規), three tarsal sutures
  { const s = LID.draw({ state: { ...P.inc, excCut: 1, excRemove: 1, mrd1: P.mrdPre } }), E = s.A.excQ;
    ok(near(E.qHi - E.qLo, P.excW, 0.01) && line(ctx, '3-1', 1).includes(`切除 ${P.excW} mm 寬`), `3-1 strip ${f2(E.qHi - E.qLo)} mm above the incision (narration ${P.excW} mm)`);
    const c = CORONAL.draw({ state: { ...P.adv } }), X = c.A.tarSutX || [];
    ok(line(ctx, '3-1', 4).includes('三針') && X.length === 3 && P.tarN === 3 && X[0] < 0 && near(X[1], 0, 0.01) && X[2] > 0, `3-1 tarsal sutures: ${X.length} at x ${X.map(f2).join(' / ')} (narration 三針)`); }
  // ---- 3-2: brow descent 2.5–2.9 mm (Kokubo 2019), the same drop in both views
  { const d = P.browRaise, s0 = LID.draw({ state: { ...P.adv, browY: d } }), s1 = LID.draw({ state: { ...P.adv } }), c0 = CORONAL.draw({ state: { ...P.adv, browY: d } }), c1 = CORONAL.draw({ state: { ...P.adv } });
    const dS = s1.A.browLo[1] - s0.A.browLo[1], dC = c1.browLoY(0) - c0.browLoY(0);
    ok(line(ctx, '3-2', 0).includes('2.5 到 2.9 mm') && d >= 2.5 && d <= 2.87 && near(dS, d, 0.05) && near(dC, d, 0.05), `3-2 brow drop drawn ${f2(dS)} (sagittal) / ${f2(dC)} mm (coronal), narration 2.5–2.9 mm (Kokubo 2019: 2.50–2.87)`); }
  { const st = { ...P.adv, browPlane: 1, browSut: 1 }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: { ...st, notch: 1 } });
    let dB = 1e9; for (const q of s.probe.bone) dB = Math.min(dB, hyp(q, s.A.browSutP));
    ok(line(ctx, '3-2', 1).includes('一針固定到骨膜') && P.browN === 1 && dB <= LID.PERI + 0.05 && s.A.browSutP[1] < LID.RIM_Y, `3-2 brow suture: one bite ${f2(dB)} mm from the bone (in the periosteum), above the rim`);
    ok(line(ctx, '3-2', 2).includes('內側') && CORONAL.NOTCH_X > 0 && c.A.browFix[0] < CORONAL.NOTCH_X - CORONAL.NOTCH_W / 2, `3-2 supraorbital notch at x ${f2(CORONAL.NOTCH_X)} (nasal = 內側); fixation point x ${f2(c.A.browFix[0])} lateral to it`); }
  { const m = P.mrdPost, s = LID.draw({ state: { mrd1: m } }), c = CORONAL.draw({ state: { mrd1: m } });
    ok(line(ctx, '3-2', 3).includes(`約 ${m} mm`) && near(-c.Uy(0), m, 0.05) && near(-s.DP.at(0, 0)[1], m, 0.1), `3-2 MRD1 ${m}: coronal ${f2(-c.Uy(0))}, sagittal ${f2(-s.DP.at(0, 0)[1])} mm above the light reflex`); }
  { const c = CORONAL.draw({ state: { ...P.adv, creaseFix: 1 } }), n = (c.svg.match(/stroke="#2463eb" stroke-width="1.8" stroke-linecap="round" opacity=/g) || []).length;
    ok(line(ctx, '3-2', 4).includes('四針') && n === 4 && P.creaseN === 4, `3-2 orbicularis sutures drawn ${n} (narration 四針)`); }
  // ---- 4-1: the follicle the needle follows is the model's follicle (lid.js), drawn between the mean depth 1.8 mm and the 95 % reach 2.4 mm
  { const st = { mrd1: P.mrdPost, misdirected: 1 }, s = LID.draw({ state: st }), ms = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));
    const E = s.DA.at(ms(1.70), 1.70), B = s.DA.at(2.05, 1.56), L = hyp(E, B);
    ok(s.svg.includes(`M${F(B)}L${F(E)}`), `4-1 the needle's follicle (root ${E.map(f2).join(', ')} → bulb ${B.map(f2).join(', ')}) is a follicle the model draws`);
    ok(L >= Q.ep.follicleUp && L <= Q.ep.reach95Up && line(ctx, '4-1', 1).includes(`上眼瞼的毛囊平均 ${Q.ep.follicleUp} mm`) && line(ctx, '4-1', 1).includes(`${Q.ep.follicleLo} mm`) && line(ctx, '4-1', 2).includes(`上眼瞼要插 ${Q.ep.reach95Up} mm`) && line(ctx, '4-1', 2).includes(`${Q.ep.reach95Lo} mm`),
      `4-1 drawn follicle ${f2(L)} mm, between the mean ${Q.ep.follicleUp} and the 95 % reach ${Q.ep.reach95Up} mm (Elder 1997)`); }
  // ---- 4-2: in the front view the needle enters at the roots of the model's misdirected lashes
  { const c = CORONAL.draw({ state: { mrd1: P.mrdPost, misdirected: 1 } });
    ok(Q.misX.every(x => c.svg.includes(`M${F([x, c.lashY(x) + c.rollY(x) + 0.1])}Q`)) && line(ctx, '4-2', 1).includes('沿著睫毛幹'), `4-2 coronal needle positions x ${Q.misX.join(' / ')} are the roots of the model's misdirected lashes`); }
  return R;
}
// ---------------------------------------------------------------- 3. orientation of both views in every surgical segment
function viewChecks(ctx) {
  const R = [], SAG = '左＝前　上＝上', SUR = '面對病人：左＝temporal　右＝nasal';
  for (const id of ['1-1', '2-1', '2-2', '2-3', '3-1', '3-2', '4-1', '4-2']) { const t = ctx.screen[id] || [];
    R.push([t.includes(SAG) && t.includes(SUR) && t.some(x => /右眼 OD/.test(x)), `${id}: both views state their orientation (sagittal ${SAG}; surgeon's view 右眼 OD, ${SUR})`]); }
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(LOCAL.includes(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video or 院內常規`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = plainSrc(src).every(x => srcs.includes(x) || ['結構', '示意'].includes(x) || (x === '院內常規' && texts.join('').includes('院內常規')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const P = { ...clone(LRP), inc: clone(INC) };
  P.open = { ...P.inc, mrd1: P.mrdPre, excCut: 1, excRemove: 1, septOpen: 1, fatUp: 1 };
  P.adv = { ...P.open, dis: 1, resect: 1, advance: 1, tarSut: 1, mrd1: P.mrdPost };
  const Q = { ...clone(MRP), creaseH: LRP.incH[1], misX: [...MIS_X], ep: clone(EP), ix: clone(IX) };
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P, Q, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx), ...viewChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MU = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '2-1').lines[3] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-2'].push('凝固 0.5 mm'); }],
      ['ledger entry not used', c => { c.ledger['2-2']['99'] = '院內常規'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-3']['55'] = 'Elder 1997'; }],
      ['one of two ledger sources not cited', c => { c.ledger['1-2']['9'] = 'Cruz 2023；Kapantais 2022'; }],
      ['citation not in REFS', c => { c.screen['6'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[2][1] = 'Tucker 1999'; }],
      ['lashes after rotation', c => { c.Q.entr = 0.3; }],
      ['Cruz 2015a counts', c => { c.Q.lashes = 3; }],
      ['Cruz 2023 counts', c => { c.Q.ix.upperThird = 60; }],
      ['Tucker numbers', c => { c.Q.ix.lago = [60, 30, 9]; }],
      ['same incision', c => { c.Q.creaseH = 6; }],
      ['incision heights', c => { c.P.incH = [3, 4, 4]; c.P.inc.incH = [3, 4, 4]; }],
      ['incision position', c => { c.P.inc.incX = [-5.75, 5.75]; }],
      ['tarsotomy distance', c => { c.Q.cutMm = 4; }],
      ['tarsotomy blade', c => { c.Q.blade = 11; }],
      ['different levels', c => { c.text['2-2'].lines[3] = c.text['2-2'].lines[3].replace('不在同一處', '在同一處'); }],
      ['suture count', c => { c.Q.sutN = 2; }],
      ['suture end', c => { c.text['2-3'].lines[1] = c.text['2-3'].lines[1].replace('睫毛根附近的 orbicularis', '瞼板'); }],
      ['margin turned out', c => { c.Q.after = 1; }],
      ['strip width', c => { c.P.inc.excW = 6; }],
      ['tarsal sutures', c => { c.P.tarN = 2; }],
      ['brow drop', c => { c.P.browRaise = 3.2; }],
      ['brow suture', c => { c.text['3-2'].lines[1] = c.text['3-2'].lines[1].replace('一針', '兩針'); }],
      ['notch side', c => { c.text['3-2'].lines[2] = c.text['3-2'].lines[2].replace('內側', '外側'); }],
      ['MRD1 after fixation', c => { c.P.mrdPost = 3; }],
      ['orbicularis sutures', c => { c.P.creaseN = 3; }],
      ['follicle depth', c => { c.Q.ep.follicleUp = 2.5; }],
      ['95 % reach', c => { c.Q.ep.reach95Up = 2.0; }],
      ['needle at the misdirected lashes', c => { c.Q.misX = [1.0, 2.4]; }],
      ['view orientation', c => { c.screen['2-2'] = c.screen['2-2'].filter(t => !t.includes('temporal')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MU) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
