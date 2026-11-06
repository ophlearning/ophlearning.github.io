// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    source named in a segment (src) must be a reference of this video; every ledger source must be cited in that segment (src) or be
//    示意 / 結構 (structure: list markers, axis zero).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the repair is checked on the eyelid model, with the same
//    states the drawing uses (anim/params.js): gray line suture 2 mm from the wound edge (both views), tarsal sutures upper 3 / lower 2,
//    partial thickness in the anterior tarsus, margin face and coronal agree (< 0.3 mm), closing brings the edges together, pout after tying, …
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models');
global.LID = require(path.join(M, 'eyelid', 'lid.js'));
global.CORONAL = require(path.join(M, 'eyelid', 'coronal.js'));
global.LOWER = require(path.join(M, 'eyelid', 'lower.js'));
global.LOWERC = require(path.join(M, 'eyelid', 'lower-coronal.js'));
global.LAC = require(path.join(M, 'eyelid', 'laceration.js'));
const { LP, ST, LG } = require('./anim/params.js');
const { SEGS, REFS } = require('./anim/segments.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-1': { '1570': 'Anant 2025', '5': 'EyeWiki Ruptured Globe' },   // zone II ends 5 mm behind the limbus (EyeWiki Ruptured Globe; Anant 2025 does not define it)
  '1-2': { '1': 'EyeWiki', '2': 'EyeWiki' },
  '2-1': { '4': 'Schafer 2026', '81': 'Schafer 2026', '31': 'Schafer 2026', '41': 'Schafer 2026', '6': 'Schafer 2026', '24': 'Schafer 2026', '2': 'Schafer 2026' },
  '2-2': { '4': 'Clark 2015', '00': 'Clark 2015', '0': 'Clark 2015', '3': 'Clark 2015', '66': 'Savar 2008', '37': 'Savar 2008' },
  '2-3': { '25': 'Subramanian 2011', '40': 'Subramanian 2011' },
  '2-4': { '12': 'EyeWiki', '24': 'EyeWiki', '334': 'Chu 2017', '48': 'Chu 2017', '7.6': 'Chu 2017', '9.1': 'Chu 2017', '11': 'Wu 2010', '0': '結構' },
  '3-1': { '1': 'Clark 2015', '2': 'Clark 2015', '100': 'Clark 2015', '000': 'Clark 2015', '27': 'Clark 2015', '3': 'Clark 2015', '5': 'Clark 2015', '0.5': 'Clark 2015' },
  '3-2': { '5': 'Clark 2015' },
  '4-2': { '6-0': 'EyeWiki', '2': 'EyeWiki' },
  '4-3': { '5-0': 'EyeWiki', '6-0': 'EyeWiki', '3': 'EyeWiki', '2': 'EyeRounds 影片' },
  '4-4': { '6-0': 'EyeWiki' },
  '4-5': { '6-0': 'EyeWiki', '7-0': 'EyeRounds 影片' },
  '4-7': { '7-0': 'EyeRounds 影片', '6-0': 'Tyers 2005' },
  '5': { '153': 'Schafer 2026', '6.5': 'Schafer 2026', '4': 'Huang 2022', '3': 'EyeWiki', '6': 'EyeWiki', '3.3': 'Schafer 2026', '5.9': 'Schafer 2026' },
  '6': { '4.12': 'Lim 2004', '2': 'EyeWiki', '73': 'Savar 2008' },
  '7': { '875': 'EyeWiki', '125': 'EyeWiki', '10': 'Clark 2015', '4': 'EyeWiki', '7': 'EyeWiki', '5': 'EyeWiki', '6': 'EyeWiki', '12': 'EyeWiki' },
};
// sources named without a year: each must match one reference (by a substring of it)
const KNOWN = { 'EyeWiki': 'Eyelid Laceration. Reviewed', 'EyeWiki Ruptured Globe': 'Ruptured Globe', 'EyeWiki Canalicular trauma': 'Canalicular trauma',
  'EyeRounds 影片': 'in this video: EyeRounds 影片', 'EyeRounds 圖譜': 'in this video: EyeRounds 圖譜' };
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year));
const known = s => KNOWN[s] && REFS.filter(r => r.includes(KNOWN[s])).length === 1;
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
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2), f3 = v => (+v).toFixed(3);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
function modelChecks(ctx) {
  const { LAC: L, LP: P, ST: S, LG: G } = ctx, R = [], ok = (c, m) => R.push([!!c, m]);
  const cor = st => ctx.CORONAL.draw({ state: st, id: 'k', section: false, windows: st.lacWin ? [ctx.CORONAL.strip(st.lacWin[0], st.lacWin[1], 1)] : [] });
  const both = st => { const rc = cor(st); return { m: L.margin({ state: st }).A, M: L.margin({ state: st }).M, rc, c: L.cor(rc, { state: st }).A }; };
  const U = L.U, yGrey = (rc, x) => rc.Uy(x) + (rc.lashY(x) - rc.Uy(x)) * U.grey / U.skin;
  // 4-2: gray line 6-0 silk 2 mm from the wound edge on either side (EyeWiki), in tissue (wound closed) and as drawn while open (< 0.3 mm), both views
  { const t = both({ lac: 0, lacGrey: 1 }), dm = t.m.edgeT[0] - t.m.greyT[0] + 0.004, dmN = t.m.greyN[0] - t.m.edgeN[0] + 0.004, dc = (S.grey.lacX || 0) - t.c.greyT[0];
    ok(line(ctx, '4-2', 1).includes('2 mm') && P.greyD === 2 && near(dm, 2, 0.01) && near(dmN, 2, 0.01) && near(dc, 2, 0.01),
      `4-2 gray line suture 2 mm from the wound edge: margin face ${f3(dm)} / ${f3(dmN)}, coronal ${f3(dc)} mm (narration 2 mm)`);
    const o = both(S.grey), W = o.rc.lacW, eC = W([-0.004, yGrey(o.rc, -0.004)])[0], om = o.m.edgeT[0] - o.m.greyT[0], oc = eC - o.c.greyT[0];
    ok(near(om, 2, 0.3) && near(oc, 2, 0.3), `4-2 as drawn with the wound open (dimension "2 mm" on screen): margin face ${f2(om)}, coronal ${f2(oc)} mm (within 0.3 of 2)`);
    ok(near(t.m.greyT[1], t.m.greyN[1], 1e-6) && near(dm, dmN, 0.01) && near(t.m.greyT[1], -U.grey, 1e-6), '4-2 both bites at the gray line depth and the same distance (narration 兩側同深、同距離)'); }
  // 4-3 / 6: tarsal sutures — upper 3 (EyeWiki; EyeRounds 2), lower 2 (EyeWiki; EyeRounds); the drawing shows exactly that many
  { const sg = L.sag({ state: S.tarPlaced }).A, cc = L.cor(cor(S.tarPlaced), { state: S.tarPlaced }).A, n = o => Object.keys(o).filter(k => /^tar\d$/.test(k)).length;
    ok(line(ctx, '4-3', 3).includes('3 針') && L.TAR.upper.length === 3 && n(sg) === 3 && n(cc) === 3, `4-3 upper lid: ${n(sg)} tarsal sutures on the wound face, ${n(cc)} in the coronal view (narration 3 針)`);
    ok(line(ctx, '6', 2).includes('2 針') && P.tarLower.length === 2 && P.tarLower === L.TAR.lower, `6 lower lid: ${P.tarLower.length} tarsal sutures drawn (narration 2 針)`);
    ok(Math.max(...L.TAR.upper) < (S.tarPlaced.lacS ?? 6), '4-3 every upper tarsal suture lies inside the wound (below its apex)'); }
  // 4-3: partial thickness, anterior part of the tarsus (EyeRounds 影片; Zhao 2021): ≥ 0.3 mm from the conjunctiva and from the anterior surface
  { const u = L.TAR_U, c = ctx.LID.U_CONJ, a = ctx.LID.U_TAR;
    ok(line(ctx, '4-3', 1).includes('partial-thickness') && u - c >= 0.3 && a - u >= 0.3 && u > (c + a) / 2,
      `4-3 upper tarsal bite at u ${u}: ${f2(u - c)} mm from the conjunctiva, ${f2(a - u)} mm from the anterior surface, in the anterior half`);
    const lu = ctx.LOWER.U_CONJ + P.lowerBiteK * ctx.LOWER.TAR_TH, lc = ctx.LOWER.U_CONJ, la = ctx.LOWER.U_CONJ + ctx.LOWER.TAR_TH;
    ok(lu - lc >= 0.3 && la - lu >= 0.3 && lu > (lc + la) / 2 && P.tarLower.every(s => s > 0.3 && s < P.lowerTarH - 0.3),
      `6 lower tarsal bites (示意) partial thickness in the anterior half (u ${f2(lu)}) and inside the ${P.lowerTarH} mm tarsus`); }
  // 4-1 … 4-7: the margin face and the coronal view agree (same stitch, same x, < 0.3 mm) in every state the drawing uses
  for (const [nm, st] of [['open', S.open], ['grey', S.grey], ['margin', S.margin], ['vmTied', S.vmTied], ['pull', { ...S.grey, lac: 0.6 }]]) {
    const t = both(st), d = [];
    for (const k of ['greyT', 'greyN', 'lashT', 'lashN']) if (t.m[k]) d.push(Math.abs(t.m[k][0] - t.c[k][0]));
    if (t.rc.A.lacEdgeT) d.push(Math.abs(t.m.edgeT[0] - t.rc.A.lacEdgeT[0]), Math.abs(t.m.edgeN[0] - t.rc.A.lacEdgeN[0]));
    if (st.lacVM) for (const u of [U.orif, P.vm2U]) { const a = G.vmMargin(t.M, st, u).flat(), b = G.vmCor(t.rc, st, u).flat(); a.forEach((p, i) => d.push(Math.abs(p[0] - b[i][0]))); }
    const worst = Math.max(...d);
    ok(d.length >= 2 && worst < 0.3, `4-x state ${nm}: margin face and coronal agree within ${f3(worst)} mm (${d.length} points)`); }
  // 4-3: a tarsal suture sits at the same height in the coronal view and on the wound face (< 0.3 mm), placed and tied
  for (const [nm, st] of [['placed', S.tarPlaced], ['tied', S.tarTied]]) { const c = L.cor(cor(st), { state: st }).A, s = L.sag({ state: st }).A;
    const worst = Math.max(...[0, 1, 2].map(i => Math.abs((c['tar' + i] || [0, NaN])[1] - (s['tar' + i] || [0, NaN])[1])));
    ok(worst < 0.3 && st.lacWin, `4-3 ${nm}: tarsal sutures at the same height in both views (worst ${f3(worst)} mm); the coronal window shows the tarsus`); }
  // closing the wound brings the edges together (open 2.4 mm → closed 0) in both views
  { const o = both(S.open), c = both(S.margin), E = (A, k) => A[k] || [NaN, NaN], go = E(o.rc.A, 'lacEdgeN')[0] - E(o.rc.A, 'lacEdgeT')[0], gc = E(c.rc.A, 'lacEdgeN')[0] - E(c.rc.A, 'lacEdgeT')[0], mo = o.m.edgeN[0] - o.m.edgeT[0], mc = c.m.edgeN[0] - c.m.edgeT[0];
    ok(go > 2 && mo > 2 && gc < 0.02 && mc < 0.02 && S.tarTied.lac === 0, `closing: gap ${f2(go)} / ${f2(mo)} mm open → ${f3(gc)} / ${f3(mc)} mm after the tarsus is tied (coronal / margin face)`); }
  // 4-2 / 4-4: the gray line suture is tied only after the tarsus (推論), then the lash line suture is added
  ok(S.grey.lacGrey && !S.tarTied.lacGreyTie && S.tarTied.lac === 0 && S.margin.lacGreyTie && S.margin.lacLash && line(ctx, '4-4', 0).includes('Tarsus 綁好之後，綁 gray line'),
    '4-4 order: gray line placed (4-2) → tarsus tied with the gray line still untied (4-3) → gray line tied, lash line added (4-4)');
  // 4-4 / 4-7: the margin pouts (slightly everted) after tying; chapter 5: the notch is the opposite (both 示意 in size)
  { const base = cor({}).Uy(0), y = st => (cor(st).A.lacEdgeT || [0, NaN])[1] - base;
    ok(line(ctx, '4-4', 2).includes('外翻') && y(S.margin) > 0.1 && near(y(S.margin), P.pout, 0.01), `4-4 after tying the margin is everted ${f2(y(S.margin))} mm (pout > 0)`);
    ok(line(ctx, '4-7', 3).includes('外翻') && y(S.vmTied) > 0.1, `4-7 the tied vertical mattress everts the margin ${f2(y(S.vmTied))} mm`);
    ok(y(S.notch) < -0.1, `5 the healed notch: margin ${f2(-y(S.notch))} mm higher than its neighbours`); }
  // 4-7: far–far bites farther from the wound edge than near–near, both at the meibomian orifices and at the same depth on both sides
  { const t = both(S.vm), [f, n] = G.vmMargin(t.M, S.vm, U.orif);
    ok(L.VM_FAR > L.VM_NEAR && near(f[0][1], f[1][1], 1e-6) && near(n[0][1], n[1][1], 1e-6) && near(f[0][1], -U.orif, 1e-6) && line(ctx, '4-7', 2).includes('far–far'),
      `4-7 vertical mattress: far ${L.VM_FAR} mm, near ${L.VM_NEAR} mm from the edge, at the orifices, same depth both sides`); }
  // 4-6: silk tails buried under a skin suture point away from the cornea (EyeWiki), in both views; the loose tail reaches the cornea
  { const rc = cor(S.done), c = L.cor(rc, { state: S.done }).A, q = G.tailTucked(), e = q[q.length - 1], x = G.exitPt, lq = G.tailLoose(), le = lq[lq.length - 1];
    ok(c.tailKnot && c.tailKnot[1] < rc.Uy(0) - 1, `4-6 coronal: tails end ${f2(rc.Uy(0) - c.tailKnot[1])} mm above the margin`);
    ok(e[1] < x[1] - 1 && ctx.LOWER.toGlobe(e) > ctx.LOWER.toGlobe(x) + 1, `4-6 wound face: the tucked tail ends ${f2(x[1] - e[1])} mm above the margin exit and ${f2(ctx.LOWER.toGlobe(e) - ctx.LOWER.toGlobe(x))} mm farther from the globe`);
    ok(Math.abs(ctx.LOWER.toGlobe(le)) < 0.6 && line(ctx, '4-6', 1).includes('刷在角膜上'), `4-6 the loose tail (for comparison) ends ${f2(ctx.LOWER.toGlobe(le))} mm from the cornea`); }
  // 1-1: zone III = more than 5 mm behind the limbus (Anant 2025): the boundary drawn is 5 mm along the sclera from the limbus
  { const a = G.arc(G.phiL, G.phiZ);
    ok(line(ctx, '1-1', 4).includes('5 mm') && P.zone3 === 5 && near(a, 5, 0.02) && G.zone3[1] < G.limbus[1], `1-1 zone II/III boundary drawn ${f3(a)} mm along the sclera behind the limbus (narration 5 mm)`); }
  // 6: the lower tarsus drawn 4.12 mm (Lim 2004), measured along its posterior surface
  { const [a, b] = G.lowerTar(), d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    ok(line(ctx, '6', 1).includes('4.12 mm') && P.lowerTarH === 4.12 && near(d, 4.12, 0.1), `6 lower tarsus dimension ${f2(d)} mm (chord along the posterior surface; narration 4.12 mm)`); }
  // schematic drawing is labelled 示意 on screen
  for (const id of ['title', '2-2', '2-3', '3-2', '4-3', '4-4', '4-6', '4-7', '5', '6']) ok((ctx.screen[id] || []).some(t => t.includes('示意')), `${id}: schematic parts are labelled 示意 on screen`);
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(s === '本片各章來源' || known(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意'].includes(src) || texts.join('').includes(src);
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { LAC, LP: { ...LP }, ST: clone(ST), LG, LID, LOWER, CORONAL, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
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
    const wrap = (o, patch) => Object.assign(Object.create(o), patch);
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '4-4').lines[1] += '3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-3'].push('離結膜 0.64 mm'); }],
      ['ledger entry not used', c => { c.ledger['2-4']['72'] = 'Chu 2017'; }],
      ['ledger source not cited in the segment', c => { c.ledger['6']['4.12'] = 'Kakizaki 2006'; }],
      ['citation not in REFS', c => { c.screen['2-1'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-1').src[0][1] = 'Clark 2016'; }],
      ['unknown source without a year', c => { c.segs.find(s => s.id === '4-5').src[1][1] = 'EyeRounds 講義'; }],
      ['gray line distance (model)', c => { c.LAC = wrap(LAC, { margin: o => { const r = LAC.margin(o); if (r.A.greyT) r.A.greyT = [r.A.greyT[0] - 0.5, r.A.greyT[1]]; return r; } }); }],
      ['gray line distance (narration)', c => { c.text['4-2'].lines[1] = c.text['4-2'].lines[1].replace('2 mm', '3 mm'); }],
      ['gray line in the coronal view moved', c => { c.LAC = wrap(LAC, { cor: (rc, o) => { const r = LAC.cor(rc, o); if (r.A.greyT) r.A.greyT = [r.A.greyT[0] + 0.4, r.A.greyT[1]]; return r; } }); }],
      ['upper tarsal suture count', c => { c.LAC = wrap(LAC, { sag: o => { const r = LAC.sag(o); delete r.A.tar2; return r; } }); }],
      ['lower tarsal suture count', c => { c.LP.tarLower = [1.3, 2.0, 2.8]; }],
      ['full-thickness tarsal bite', c => { c.LAC = wrap(LAC, { TAR_U: 0.3 }); }],
      ['lower bite in the posterior half', c => { c.LP.lowerBiteK = 0.3; }],
      ['tarsal suture heights differ between views', c => { c.LAC = wrap(LAC, { sag: o => { const r = LAC.sag(o); if (r.A.tar1) r.A.tar1 = [r.A.tar1[0], r.A.tar1[1] - 0.5]; return r; } }); }],
      ['wound not closed', c => { c.ST.margin.lac = 0.3; }],
      ['gray line tied before the tarsus', c => { c.ST.tarTied.lacGreyTie = 1; }],
      ['no eversion after tying', c => { c.ST.margin.lacPout = 0; }],
      ['vertical mattress far/near swapped', c => { c.LAC = wrap(LAC, { VM_FAR: 0.5 }); }],
      ['tail toward the cornea', c => { c.LG = wrap(LG, { tailTucked: () => [LG.exitPt, [LG.exitPt[0] + 0.5, LG.exitPt[1] + 1.5]] }); }],
      ['zone III boundary', c => { c.LG = wrap(LG, { phiZ: LG.phiL + 4 / 12 }); }],
      ['lower tarsus height', c => { c.LG = wrap(LG, { lowerTar: () => [LOWER.LF.at(0, 0.16), LOWER.LF.at(3.5, 0.16)] }); }],
      ['schematic not labelled', c => { c.screen['4-7'] = c.screen['4-7'].map(t => t.replace(/示意/g, '')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
