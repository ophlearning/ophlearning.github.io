// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 (structure: list numbers, chapter / segment numbers,
//    scale bars). A number used for two things in one segment lists both sources, separated by 「；」 (each must be cited).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the surgery is checked on the eyelid model
//    (videos/models/eyelid: lid.js, coronal.js, lower.js, lower-coronal.js) with the parameters the drawing uses (anim/params.js).
// 3. Views: every surgical segment states the orientation of both views (sagittal: 左＝前　上＝上; surgeon's view: 面對病人：左＝temporal).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(M, 'lid.js'));
global.LOWER = require(path.join(M, 'lower.js'));
global.LOWERC = require(path.join(M, 'lower-coronal.js'));
const CORONAL = require(path.join(M, 'coronal.js'));
const { SEGS, REFS } = require('./anim/segments.js');
const { LRP, INC, LLP } = require('./anim/params.js');
const MIS_X = [-2.6, -1.7];   // coronal x of the misdirected lashes the needle enters in 4-2 (anim/draw.js)

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-2': { '60': 'Tucker 2000', '33': 'Tucker 2000', '6': 'Tucker 2000', '20': 'Tucker 2000', '9': 'Tucker 2000', '0.6': 'Tucker 2000', '1': 'Tucker 2000' },
  '2-1': { '2.5': '院內常規', '4': '院內常規；結構', '5': '院內常規', '4-0': '院內常規', '3': '院內常規', '4-1': '結構', '4-4': '結構' },
  '2-2': { '2.5': 'Kokubo 2019；院內常規', '2.9': 'Kokubo 2019', '4-0': '院內常規', '1': '院內常規', '6-0': '院內常規', '4': '院內常規', '7-0': '院內常規', '4-5': '結構', '1-2': '結構' },
  '3-1': { '4.1': 'Lim 2004', '2.5': '院內常規' },
  '3-3': { '15': '院內常規' },
  '3-4': { '4-0': '院內常規', '2': '院內常規', '7-0': '院內常規' },
  '4-1': { '0.9': 'Elder 1997', '1.8': 'Elder 1997；Singh 2024', '95': 'Elder 1997', '1.4': 'Elder 1997', '2.4': 'Elder 1997', '75': 'Singh 2024', '1': '結構' },
  '4-2': { '1': '結構' },
  '4-3': { '3': 'Singh 2022', '55': 'Singh 2022', '24': 'Sakarya 2010', '66.6': 'Sakarya 2010', '16.6': 'Sakarya 2010', '8.3': 'Sakarya 2010' },
  '5-2': { '1': 'Yip 2000；結構', '2': '結構', '3': '結構', '12': 'Yip 2000', '41': 'Yip 2000' },
  '6': { '60': 'Tucker 2000', '33': 'Tucker 2000', '9': 'Tucker 2000', '1': 'Tucker 2000', '6': 'Tucker 2000', '20': 'Tucker 2000' },
  '7': { '1': '結構；院內常規', '2': '結構；院內常規', '3': '結構；院內常規', '4': '結構', '5': '結構；院內常規', '6': '結構', '7': '結構', '8': '結構', '2.5': '院內常規', '4-0': '院內常規', '15': '院內常規', '6-0': '院內常規', '7-0': '院內常規' },
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
  const P = ctx.P, Q = ctx.Q, R = [], ok = (c, m) => R.push([!!c, m]);
  // ---- upper lid (chapter 2, the first video's states)
  // 2-1: incision heights 2.5 / 4 / 4 mm from the lash line and a 5 mm strip (院內常規), both views
  { const say = line(ctx, '2-1', 1);
    ok(say.includes(`內側 ${P.incH[0]}、中央 ${P.incH[1]}、外側 ${P.incH[2]} mm`) && say.includes(`切除 ${P.excW} mm 寬`), `2-1 narration states the drawn incision heights ${P.incH.join('/')} mm and strip ${P.excW} mm`);
    const st = { ...P.inc, excCut: 1, excRemove: 1, mrd1: P.mrdPre }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: st }), E = s.A.excQ;
    ok(near(E.qLo - E.qLash, P.incH[1], 0.01) && near(E.qHi - E.qLo, P.excW, 0.01), `2-1 sagittal: lower incision ${f2(E.qLo - E.qLash)} mm from the lash line along the skin, strip ${f2(E.qHi - E.qLo)} mm`);
    const h = x => c.excLoY(x) - c.lashY(x), [xM, xL] = P.inc.incX, r0 = h(xM) / h(0), r2 = h(xL) / h(0);
    ok(near(r0, P.incH[0] / P.incH[1], 0.02) && near(r2, P.incH[2] / P.incH[1], 0.02) && xM > 0 && xL < 0, `2-1 coronal: medial mark (x ${xM}) at ${f2(r0)}, lateral mark (x ${xL}) at ${f2(r2)} of the central height`);
    ok(near(c.excLoY(0) - c.lashY(0), s.A.incLo[1] - s.A.lashSkin[1], 0.3), `2-1 central incision height: coronal ${f2(c.excLoY(0) - c.lashY(0))} vs sagittal ${f2(s.A.incLo[1] - s.A.lashSkin[1])}`); }
  // 2-1: three tarsal sutures (temporal / central / nasal)
  { const c = CORONAL.draw({ state: { ...P.adv } }), X = c.A.tarSutX || [];
    ok(line(ctx, '2-1', 4).includes('三針') && X.length === 3 && P.tarN === 3 && X[0] < 0 && near(X[1], 0, 0.01) && X[2] > 0, `2-1 tarsal sutures: ${X.length} at x ${X.map(f2).join(' / ')} (narration 三針)`); }
  // 2-2: brow descent 2.5–2.9 mm (Kokubo 2019), the same drop in both views
  { const d = P.browRaise, s0 = LID.draw({ state: { ...P.adv, browY: d } }), s1 = LID.draw({ state: { ...P.adv } }), c0 = CORONAL.draw({ state: { ...P.adv, browY: d } }), c1 = CORONAL.draw({ state: { ...P.adv } });
    const dS = s1.A.browLo[1] - s0.A.browLo[1], dC = c1.browLoY(0) - c0.browLoY(0);
    ok(line(ctx, '2-2', 0).includes('2.5 到 2.9 mm') && d >= 2.5 && d <= 2.87 && near(dS, d, 0.05) && near(dC, d, 0.05), `2-2 brow drop drawn ${f2(dS)} (sagittal) / ${f2(dC)} mm (coronal), narration 2.5–2.9 mm (Kokubo 2019: 2.50–2.87)`); }
  // 2-2: one brow suture in the periosteum above the rim; the supraorbital notch is nasal (內側) and the fixation point lateral to it
  { const st = { ...P.adv, browPlane: 1, browSut: 1 }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: { ...st, notch: 1 } });
    let dB = 1e9; for (const q of s.probe.bone) dB = Math.min(dB, hyp(q, s.A.browSutP));
    ok(line(ctx, '2-2', 1).includes('一針固定到骨膜') && P.browN === 1 && dB <= LID.PERI + 0.05 && s.A.browSutP[1] < LID.RIM_Y, `2-2 brow suture: one bite ${f2(dB)} mm from the bone (in the periosteum), above the rim`);
    ok(line(ctx, '2-2', 2).includes('內側') && CORONAL.NOTCH_X > 0 && c.A.browFix[0] < CORONAL.NOTCH_X - CORONAL.NOTCH_W / 2, `2-2 supraorbital notch at x ${f2(CORONAL.NOTCH_X)} (nasal = 內側); fixation point x ${f2(c.A.browFix[0])} lateral to it`); }
  // 2-2: MRD1 about 2.5 mm after the brow fixation (院內常規), both views
  { const m = P.mrdPost, s = LID.draw({ state: { mrd1: m } }), c = CORONAL.draw({ state: { mrd1: m } });
    ok(line(ctx, '2-2', 3).includes(`約 ${m} mm`) && near(-c.Uy(0), m, 0.05) && near(-s.DP.at(0, 0)[1], m, 0.1), `2-2 MRD1 ${m}: coronal ${f2(-c.Uy(0))}, sagittal ${f2(-s.DP.at(0, 0)[1])} mm above the light reflex`); }
  // 2-2: four levator–orbicularis sutures
  { const c = CORONAL.draw({ state: { ...P.adv, creaseFix: 1 } }), n = (c.svg.match(/stroke="#2463eb" stroke-width="1.8" stroke-linecap="round" opacity=/g) || []).length;
    ok(line(ctx, '2-2', 4).includes('四針') && n === 4 && P.creaseN === 4, `2-2 orbicularis sutures drawn ${n} (narration 四針)`); }
  // ---- lower lid (chapters 1, 3, 4)
  // 1-1: entropion puts the lashes on the cornea; once the margin is rotated out the normal lashes leave it, the misdirected one still touches it
  { const e = LOWER.draw({ state: { entr: 1 }, upper: false }), t = LOWER.draw({ state: { entr: 1, tie: Q.rot, misdirected: 1 }, upper: false });
    const dE = Math.min(...e.A.lashPtsL.map(toGlobe)), dT = Math.min(...t.A.lashPtsL.map(toGlobe)), dM = toGlobe(t.A.misLashPts[3]);
    ok(dE < 0.3 && dT > 2 && dM < 0.3 && line(ctx, '1-1', 5).includes('轉正之後還碰到角膜'), `1-1 lashes on the cornea in entropion (${f2(dE)} mm), off it after rotation (${f2(dT)} mm); misdirected lash still on it (${f2(dM)} mm)`); }
  // 1-2: the upper margin rises from the pre-op to the post-op height in both views; the lower margin agrees between the views
  { const ok2 = [Q.mrdPre, P.mrdPost].every(m => { const s = LID.keyPoints({ mrd1: m }), c = CORONAL.draw({ state: { mrd1: m }, lower: { entr: 1, tie: Q.rot } }); return near(-s.margin[1], m, 0.1) && near(-c.Uy(0), m, 0.05); });
    const K = LOWER.keyPoints({ entr: 1, tie: Q.rot }), c = CORONAL.draw({ lower: { entr: 1, tie: Q.rot } }), hS = K.lash[1] - K.margin[1], hC = c.lashLY(0) - CORONAL.Ly(0);
    ok(ok2 && Q.mrdPre < P.mrdPost && near(hS, hC, 0.3) && line(ctx, '1-2', 0).includes('上眼瞼往上拉'), `1-2 upper margin ${Q.mrdPre} → ${P.mrdPost} mm in both views; rotated lower lash line below the margin: sagittal ${f2(hS)} vs coronal ${f2(hC)}`); }
  // 3-1: lower tarsus about 4.1 mm high along its posterior surface (Lim 2004: 4.12)
  { const s = LOWER.draw({ upper: false }), T = []; for (let q = 0; q <= LOWER.S_TARL + 1e-9; q += 0.01) T.push(s.DP.at(q, LOWER.U_CONJ));
    const L = arcLen(T);
    ok(line(ctx, '3-1', 0).includes(`約 ${Q.tarHSay} mm`) && near(L, Q.tarH, 0.15) && near(Q.tarHSay, Q.tarH, 0.05), `3-1 lower tarsus ${f2(L)} mm along its posterior surface (Lim 2004 ${Q.tarH}; narration 約 ${Q.tarHSay})`); }
  // 3-1: retractors in two layers (CPF in front of the inferior tarsal muscle), both below the tarsus; the septum in front of them
  { const s = LOWER.draw({ upper: false }), A = s.A, d = p => toGlobe(p);
    ok(line(ctx, '3-1', 1).includes('分前後兩層') && A.cpf && A.itm && d(A.cpf) > d(A.itm) && LOWER.S_ITM > LOWER.S_TARL && d(A.septumL) > d(A.cpf), `3-1 retractors: CPF ${f2(d(A.cpf))} mm, inferior tarsal muscle ${f2(d(A.itm))} mm from the globe; septum ${f2(d(A.septumL))} mm (in front)`); }
  // 3-1: subciliary incision 2.5 mm below the lash line along the skin (院內常規), the same height in both views
  { const st = { ...Q.pre, subcil: 1, incH: Q.incH }, s = LOWER.draw({ state: st, upper: false }), c = CORONAL.draw({ lower: st }), K = LOWER.keyPoints(st);
    const qd = s.SK.near(s.A.incL) - s.SK.near(s.A.lashSkinL), hC = c.incLY(0) - c.lashLY(0), hS = K.inc[1] - K.lash[1];
    ok(line(ctx, '3-1', 3).includes(`睫毛下 ${Q.incH} mm`) && near(qd, Q.incH, 0.05) && near(hC, hS, 0.3), `3-1 incision ${f2(qd)} mm below the lash line along the skin; height coronal ${f2(hC)} vs sagittal ${f2(hS)}`); }
  // 3-3: tarsal fracture: half the tarsal thickness from the front, the conjunctival half intact; the same height in both views
  { const st = { ...Q.dis, frac: 1, fracS: Q.fracS, fracDepth: Q.fracDepth }, s = LOWER.draw({ state: st, upper: false }), c = CORONAL.draw({ lower: st }), K = LOWER.keyPoints(st);
    const [c0, c1] = s.A.fracPts, cut = hyp(c0, c1), left = hyp(c1, s.DP.at(Q.fracS, LOWER.U_CONJ));
    ok(line(ctx, '3-3', 0).includes('一半深度') && line(ctx, '3-3', 0).includes(`${Q.blade} 號刀`) && near(cut / LOWER.TAR_TH, 0.5, 0.02) && left > 0.3 && near(c.fracLY(0) - CORONAL.Ly(0), K.frac[1] - K.margin[1], 0.3),
      `3-3 fracture ${f2(cut)} of ${f2(LOWER.TAR_TH)} mm from the front, ${f2(left)} mm of tarsus left in front of the conjunctiva; coronal height ${f2(c.fracLY(0) - CORONAL.Ly(0))} vs sagittal ${f2(K.frac[1] - K.margin[1])}`); }
  // 3-4: two mattress sutures; each enters near the fornix, passes the retractors in front of (not through) the tarsus, exits on the skin
  //      between the lash line and the incision, never in the globe; tied, the lashes leave the cornea
  { const st = { ...Q.dis, frac: 1, fracS: Q.fracS, mattress: 1, exitH: Q.exitH }, s = LOWER.draw({ state: st, upper: false }), c = CORONAL.draw({ lower: st }), A = s.A, X = c.mattressX;
    const qE = s.SK.near(A.mattressExit) - s.SK.near(A.lashSkinL), dF = hyp(A.mattressIn, A.fornixPt), mid = (LOWER.U_CONJ + LOWER.U_TARL) / 2;
    let inTar = 1e9; for (const p of A.mattressPts) for (let q = 0.3; q <= LOWER.S_TARL - 0.3; q += 0.05) inTar = Math.min(inTar, hyp(p, s.DP.at(q, mid)));
    ok(line(ctx, '3-4', 0).includes('縫兩針') && X.length === Q.mattN && Q.mattN === 2, `3-4 mattress sutures drawn ${X.length} (narration 兩針)`);
    ok(dF < 1.5 && qE > 0 && qE < Q.incH && inTar > LOWER.TAR_TH / 2 && Math.min(...A.mattressPts.map(toGlobe)) > 0, `3-4 mattress: in ${f2(dF)} mm from the fornix, exit ${f2(qE)} mm below the lashes (incision ${Q.incH}), ≥ ${f2(inTar)} mm from the tarsal mid-plane, outside the globe`);
    const t = LOWER.draw({ state: { ...st, tie: 1 }, upper: false }), dT = Math.min(...t.A.lashPtsL.map(toGlobe)), d0 = Math.min(...s.A.lashPtsL.map(toGlobe));
    ok(line(ctx, '3-4', 2).includes('睫毛離開角膜') && d0 < 0.3 && dT > 2, `3-4 lashes ${f2(d0)} mm from the cornea before tying, ${f2(dT)} mm after`); }
  // 4-1: follicle depth 0.9 mm (Elder 1997) and 1.8 mm (Singh 2024) drawn to scale; 75° between the follicle root and the margin surface
  { const say1 = line(ctx, '4-1', 1), say2 = line(ctx, '4-1', 2), say3 = line(ctx, '4-1', 3), say4 = line(ctx, '4-1', 4);
    const st = { ...Q.evert, pluck: 1 }, a = LOWER.draw({ state: { ...st, follicleDepth: Q.follicle }, upper: false }), b = LOWER.draw({ state: { ...st, follicleDepth: Q.rootSingh }, upper: false });
    const dA = hyp(a.A.lashRootL, a.A.bulbL), dB = hyp(b.A.lashRootL, b.A.bulbL);
    ok(say1.includes(`平均 ${Q.follicle} mm`) && say1.includes(`上眼瞼 ${Q.follicleUp} mm`) && say2.includes(`下眼瞼要插 ${Q.reach95} mm`) && say3.includes(`約 ${Q.rootSingh} mm`) && near(dA, Q.follicle, 0.01) && near(dB, Q.rootSingh, 0.01) && Q.reach95 > Q.follicle,
      `4-1 follicle drawn ${f2(dA)} mm (narration ${Q.follicle}) and ${f2(dB)} mm (narration ${Q.rootSingh}); needle depth ${Q.reach95} beyond the mean follicle`);
    const dir = a.A.follicleDir, n = a.DP.nrm(0.15), ang = Math.acos(Math.abs(dir[0] * n[0] + dir[1] * n[1])) * 180 / Math.PI;
    ok(say4.includes(`約 ${Q.rootAngle} 度`) && near(ang, Q.rootAngle, 1), `4-1 follicle root at ${f2(ang)}° to the margin surface (Singh 2024: ${Q.rootAngle}°)`); }
  // 4-2: the needle runs along the follicle and stops at its root; in the front view it enters at the roots of the misdirected lashes
  { const s = LOWER.draw({ state: { ...Q.evert, pluck: 1, misdirected: 1, needle: 1, follicleDepth: Q.follicle }, upper: false }), A = s.A;
    const v = [A.needleTip[0] - A.needleIn[0], A.needleTip[1] - A.needleIn[1]], L = Math.hypot(...v), cos = (v[0] * A.follicleDir[0] + v[1] * A.follicleDir[1]) / L;
    ok(line(ctx, '4-2', 1).includes('沿著睫毛幹') && cos > 0.999 && hyp(A.needleTip, A.bulbL) < 0.01, `4-2 needle along the follicle (cos ${cos.toFixed(4)}), tip ${f2(hyp(A.needleTip, A.bulbL))} mm from the follicle root`);
    const c = CORONAL.draw({ lower: { ...Q.evert, misdirected: 1 } }), F = p => p[0].toFixed(3) + ' ' + p[1].toFixed(3);
    ok(Q.misX.every(x => c.svg.includes(`M${F([x, c.lashLY(x)])}Q`)) && line(ctx, '4-2', 0).includes('還碰到角膜'), `4-2 coronal needle positions x ${Q.misX.join(' / ')} are the roots of the model's misdirected lashes`); }
  return R;
}
// ---------------------------------------------------------------- 3. orientation of both views in every surgical segment
function viewChecks(ctx) {
  const R = [], SAG = '左＝前　上＝上', SUR = '面對病人：左＝temporal　右＝nasal';
  for (const id of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2']) { const t = ctx.screen[id] || [];
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
  const Q = { ...clone(LLP), misX: [...MIS_X], mrdPre: LRP.mrdPre, rot: 1 };
  Q.pre = { entr: Q.entr }; Q.dis = { ...Q.pre, subcil: 1, incH: Q.incH, plane: 1, septOpen: 1, retrOpen: 1 }; Q.evert = { tie: 1 };
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
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-2').lines[1] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-2'].push('凝固 0.5 mm'); }],
      ['ledger entry not used', c => { c.ledger['3-3']['99'] = '院內常規'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-3']['55'] = 'Sakarya 2010'; }],
      ['one of two ledger sources not cited', c => { c.ledger['4-1']['1.8'] = 'Elder 1997；Kapantais 2022'; }],
      ['citation not in REFS', c => { c.screen['6'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Tucker 1999'; }],
      ['upper incision heights', c => { c.P.incH = [3, 4, 4]; c.P.inc.incH = [3, 4, 4]; }],
      ['upper incision position', c => { c.P.inc.incX = [-5.75, 5.75]; }],
      ['strip width', c => { c.P.inc.excW = 6; c.P.open.excW = 6; }],
      ['tarsal sutures', c => { c.P.tarN = 2; }],
      ['brow drop', c => { c.P.browRaise = 3.2; }],
      ['brow suture', c => { c.text['2-2'].lines[1] = c.text['2-2'].lines[1].replace('一針', '兩針'); }],
      ['notch side', c => { c.text['2-2'].lines[2] = c.text['2-2'].lines[2].replace('內側', '外側'); }],
      ['MRD1 after fixation', c => { c.P.mrdPost = 3; }],
      ['orbicularis sutures', c => { c.P.creaseN = 3; }],
      ['lashes after rotation', c => { c.Q.rot = 0.2; }],
      ['upper margin rises', c => { c.Q.mrdPre = 3.5; }],
      ['lower tarsus height', c => { c.Q.tarH = 4.6; }],
      ['retractors two layers', c => { c.text['3-1'].lines[1] = c.text['3-1'].lines[1].replace('分前後兩層', '只有一層'); }],
      ['subciliary incision', c => { c.Q.incH = 3; c.Q.pre = { ...c.Q.pre }; }],
      ['fracture depth', c => { c.Q.fracDepth = 0.8; }],
      ['fracture blade', c => { c.Q.blade = 11; }],
      ['mattress count', c => { c.Q.mattN = 3; }],
      ['mattress exit', c => { c.Q.exitH = 3.2; }],
      ['lashes leave the cornea', c => { c.text['3-4'].lines[2] = c.text['3-4'].lines[2].replace('睫毛離開角膜', '睫毛碰到角膜'); }],
      ['follicle depth', c => { c.Q.follicle = 1.2; }],
      ['root depth', c => { c.Q.rootSingh = 2.3; }],
      ['root angle', c => { c.Q.rootAngle = 60; }],
      ['needle along the lash', c => { c.text['4-2'].lines[1] = c.text['4-2'].lines[1].replace('沿著睫毛幹', '垂直皮膚'); }],
      ['needle at the misdirected lashes', c => { c.Q.misX = [1.0, 2.4]; }],
      ['view orientation', c => { c.screen['3-3'] = c.screen['3-3'].filter(t => !t.includes('temporal')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MU) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
