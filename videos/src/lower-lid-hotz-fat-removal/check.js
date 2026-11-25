// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 病例 (named in the segment), 示意 or 結構 (list numbers,
//    scale bars). 病例 = the case summary and clinic notes the site owner confirmed on 2026-11-23 (spec.md「病例情境」).
//    The printed sheets (print/, videos/tools/print/numcheck.js) read this LEDGER too, without running this file: it must stay a plain
//    object literal (the LEDGER declaration below, no spread, no braces in its comments). The keys case / tmpl / plt / rbh / ocs / fat / dip / dry / fus are the sheets' table rows
//    (print/anatomy.js); the other keys are the video's segments.
// 2. Every ledger source is in REFS or is 院內常規 / 示意 / 結構 / 病例 (the sheets' own check; runs first, without a browser).
// 3. Narration ↔ model: each number or spatial claim the narration makes about the surgery is checked on the eyelid model (LOWER sagittal,
//    CORONAL with { lower }) and the orbit model (ORBIT axial) with the states the drawing uses (anim/params.js); the orientation of the
//    figures (right eye OD, this case OS) is checked on the rendered panel titles.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
const path = require('path');
const { REFS, SEGS } = require('./anim/segments.js');

const LEDGER = {
  // ---- rows of the printed sheets (print/anatomy.js third column); keep the keys and their content
  'case': { '3': '病例' },                                                                         // TBUT 3 秒
  'tmpl': { '6-0': '院內常規', '5': '院內常規' },                                                     // orbicularis → retractor aponeurosis 6-0 Prolene ×5
  'plt': { '50': 'Kaufman 2015', '10': 'Kaufman 2015' },                                           // major elective nonneuraxial surgery < 50 × 10⁹/L
  'rbh': { '0.055': 'Hass 2004', '0.0045': 'Hass 2004', '3': 'Hass 2004', '24': 'Hass 2004' },      // 眶內出血 0.055%、永久視力喪失 0.0045%；多在 3 小時內、24 小時後下降
  'ocs': { '15': 'Murali 2021', '8': 'Murali 2021', '21': 'Murali 2021', '30': 'Murali 2021', '40': 'Murali 2021', '2': 'McCallum 2019' },
  'fat': { '36': 'Coban 2023', '50': 'Coban 2023' },                                               // 50 具屍體；三團型（Type 1）36%
  'dip': { '12': 'Syniuta 2003', '7': 'Syniuta 2003', '5': 'Syniuta 2003' },                         // 持續複視 12 位：inferior rectus 7、superior oblique 5
  'dry': { '26.5': 'Prischmann 2013', '892': 'Prischmann 2013' },                                  // 術後乾眼症狀 26.5%（892 例）
  'fus': { '2.4': 'Kakizaki 2006', '19': 'Kakizaki 2006', '7': 'Kakizaki 2006' },                   // 眶隔與囊瞼筋膜在瞼板下 2.38 mm 融合，19 眼中 7 眼看得到
  // ---- video segments
  '1': { '5': '院內常規' },                                                                         // 五針（sutures ×5）
  '2-1': { '50': 'Kaufman 2015', '10': 'Kaufman 2015' },
  '2-2': { '3': '病例', '892': 'Prischmann 2013', '26.5': 'Prischmann 2013', '1': '結構' },         // 1 = scale bar
  '3-1': { '1': '結構' },                                                                           // scale bar
  '3-2': { '2.4': 'Kakizaki 2006', '19': 'Kakizaki 2006', '7': 'Kakizaki 2006' },
  '3-3': { '50': 'Coban 2023', '36': 'Coban 2023' },
  '3-4': { '12': 'Syniuta 2003', '7': 'Syniuta 2003', '5': 'Syniuta 2003' },
  '3-5': { '6-0': '院內常規', '5': '院內常規' },
  '4': { '3': '病例' },
  '5-1': { '0.055': 'Hass 2004', '0.0045': 'Hass 2004', '3': 'Hass 2004', '24': 'Hass 2004', '15': 'Murali 2021', '8': 'Murali 2021', '21': 'Murali 2021', '30': 'Murali 2021', '40': 'Murali 2021' },
  '5-2': { '2': 'McCallum 2019' },
  '6': { '1': '結構', '2': '結構', '3': '結構；病例', '4': '結構', '5': '結構；院內常規', '6': '結構', '7': '結構', '8': '結構', '6-0': '院內常規' },
};

const FREE = ['院內常規', '示意', '結構', '病例'];
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(/https?:\/\/\S+/g, ' ').replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => String(s).split('；').map(x => x.trim()).filter(Boolean);

// ---------------------------------------------------------------- 2. the ledger's own sources (the printed sheets rely on this)
function ledgerSources(ledger) {
  const R = [];
  for (const [seg, nums] of Object.entries(ledger)) for (const [n, src] of Object.entries(nums)) for (const s of plainSrc(src)) {
    const c = cites(s), ok = FREE.includes(s) || (c.length === 1 && c[0].all === s && inRefs(c[0]));
    R.push([ok, `ledger ${seg} ${n}: source 「${s}」 is in REFS or ${FREE.join(' / ')}`]); }
  return R;
}

// ---------------------------------------------------------------- 1. ledger against the narration and the screen
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {}, all = texts.join('');
    for (const s of srcs) ok(FREE.includes(s) || s === '本片各章來源' || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video or ${FREE.join(' / ')}`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      for (const s of plainSrc(src)) {
        const named = (s === '院內常規' || s === '病例') && (srcs.includes(s) || srcs.includes('本片各章來源') || all.includes(s));
        ok(srcs.includes(s) || ['結構', '示意'].includes(s) || named, `${sg.id}: ledger source of ${n} (${s}) is cited in the segment`); } }
  }
  return R;
}

// ---------------------------------------------------------------- 3. narration ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2), hyp = p => Math.hypot(p[0], p[1]), sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const ZH = '零一二三四五六七八九';
function modelChecks(ctx) {
  const P = ctx.P, S = ctx.S, R = [], ok = (c, m) => R.push([!!c, m]);
  const tg = p => LOWER.toGlobe(p), lashMin = r => Math.min(...r.A.lashPtsL.map(tg));
  // title / 2-2: the entropion puts the lower lashes on the cornea; 3-5 / 4: after the Hotz they are off it (turned out: 示意, the model's tie)
  { const pre = LOWER.draw({ state: S.PRE }), fix = LOWER.draw({ state: S.FIX });
    ok(line(ctx, 'title', 0).includes('睫毛碰到角膜') && line(ctx, '2-2', 1).includes('碰到下方角膜') && lashMin(pre) < 0.6 && Math.min(...pre.probe.skin.map(tg)) >= 0,
      `entropion (PRE): lash ${f2(lashMin(pre))} mm from the cornea (narration 睫毛碰到角膜); lid outside the globe`);
    ok(line(ctx, '3-5', 1).includes('下睫毛離開角膜') && lashMin(fix) > 2 && tg(fix.A.lashTipL) > 3, `3-5 after fixation: lash ${f2(lashMin(fix))} mm (tip ${f2(tg(fix.A.lashTipL))} mm) from the cornea (narration 下睫毛離開角膜)`); }
  // 3-1: the excision takes skin, subcutaneous tissue and orbicularis (the wound reaches the depth of the muscle, not deeper); both views
  //      put the excised strip at the same height
  { const s = LOWER.draw({ state: S.EXC }), L = s.A.lower, q = (L.hzLo + L.hzHi) / 2, d = s.deepAt(q), wound = s.A.hotzWound;
    const depth = hyp(sub(wound, s.SK.off(q, 0)));
    ok(line(ctx, '3-1', 0).includes('皮膚、皮下組織與 orbicularis') && near(depth, d / 2, 0.05) && d > s.skT(q) + 0.5, `3-1 excision to the depth of the orbicularis (${f2(d)} mm at mid-strip; skin ${f2(s.skT(q))} mm), wound marker at half depth (${f2(depth)})`);
    const c = CORONAL.draw({ lower: S.EXC }), hiS = s.SK.off(L.hzHi, 0)[1], loS = s.SK.off(L.hzLo, 0)[1];
    ok(near(c.hotzLoY(0), loS, 0.3) && near(c.hotzHiY(0), hiS, 0.3), `3-1 excision edges: coronal ${f2(c.hotzLoY(0))} / ${f2(c.hotzHiY(0))} vs sagittal ${f2(loS)} / ${f2(hiS)} mm (same height in both views)`); }
  // 3-2: through the septum (the cut lies on the septum); the septum joins the CPF 2.4 mm below the tarsus along the CPF (Kakizaki 2006: 2.38)
  { const s = LOWER.draw({ state: S.SEPT }), c = s.A.septCutL, dS = c ? Math.min(...s.SEPT.pts.map(p => hyp(sub(p, c)))) : 99;
    ok(line(ctx, '3-2', 0).includes('穿過肌肉層與眶隔') && S.SEPT.septOpen >= 1 && dS < 0.05, `3-2 septum opened: the cut is ${f2(dS)} mm from the septum (narration 穿過眶隔)`);
    let L = 0, p = LOWER.LF.at(LOWER.S_TARL, LOWER.U_CPF); for (let q = LOWER.S_TARL + 0.01; q <= LOWER.S_FUSL + 1e-9; q += 0.01) { const n = LOWER.LF.at(q, LOWER.U_CPF); L += hyp(sub(n, p)); p = n; }
    const nat = LOWER.draw({});
    ok(line(ctx, '3-2', 1).includes(`瞼板下 ${P.fusionMm} mm`) && near(L, P.fusionMm, 0.05) && hyp(sub(p, nat.A.fusionL)) < 0.05, `3-2 fusion ${f2(L)} mm below the tarsus along the CPF (narration 約 ${P.fusionMm} mm; Kakizaki 2006 2.38)`); }
  // 3-3: three pads; the inferior oblique runs between the medial and central pads, the arcuate expansion between the central and lateral
  //      (Coban 2023); right eye seen from the front: temporal (lateral) is left (−x), nasal (medial) right
  { const A = CORONAL.draw({ lower: S.SEPT }).A, xs = [A.fatLat[0], A.arcuate[0], A.fatCen[0], A.io[0], A.fatMed[0]];
    ok(line(ctx, '3-3', 0).includes('三團') && P.pads === 3 && ['fatLat', 'fatCen', 'fatMed'].every(k => A[k]), `3-3 three fat pads drawn (narration 三團; HZP.pads ${P.pads})`);
    ok(line(ctx, '3-3', 1).includes('內側和中央之間隔著 inferior oblique') && line(ctx, '3-3', 1).includes('中央和外側之間是 arcuate expansion') && xs.every((x, i) => !i || x > xs[i - 1]),
      `3-3 temporal → nasal: lateral ${f2(xs[0])} < arcuate ${f2(xs[1])} < central ${f2(xs[2])} < inferior oblique ${f2(xs[3])} < medial ${f2(xs[4])} mm`); }
  // 3-4: partial fat removal flattens the septal bow (the fat in front of the globe moves back)
  { const front = st => Math.min(...LOWER.draw({ state: st }).SEPT.pts.map(p => p[0])), a = front(S.SEPT), b = front(S.FAT);
    ok(line(ctx, '3-4', 0).includes('部分去脂') && b - a > 1, `3-4 fat removal: the septal bow moves back ${f2(b - a)} mm (schematic)`); }
  // 3-5: orbicularis → retractor aponeurosis with 6-0 Prolene ×5 (院內常規): five sutures in the coronal view; the suture runs from the
  //      orbicularis (below the skin, above the muscle's depth) to the capsulopalpebral fascia (the retractor's anterior layer)
  { const c = CORONAL.draw({ lower: S.FIX }), s = LOWER.draw({ state: S.FIX }), [P0, P2] = s.A.hotzFixEnds, L = s.A.lower, q0 = L.hzLo - 0.1;
    const d0 = hyp(sub(P0, s.SK.off(q0, 0))), cpf = LOWER.LF && s.DP.at(LOWER.S_TARL + 0.9, (LOWER.U_ITM + LOWER.U_CPF) / 2), dC = hyp(sub(P2, cpf));
    ok(line(ctx, '3-5', 0).includes(`${P.fixSuture} Prolene ${ZH[P.fixN]}針`) && P.fixN === 5 && c.A.hotzX && c.A.hotzX.length === P.fixN, `3-5 ${c.A.hotzX ? c.A.hotzX.length : 0} sutures drawn in the coronal view (narration ${P.fixSuture} Prolene ${ZH[P.fixN]}針, 院內常規)`);
    ok(line(ctx, '3-5', 0).includes('orbicularis 固定到 retractor aponeurosis') && d0 > s.skT(q0) && d0 < s.deepAt(q0) && dC < (LOWER.U_CPF - LOWER.U_ITM) / 2 + 0.06,
      `3-5 suture from the orbicularis (${f2(d0)} mm under the skin; muscle ${f2(s.skT(q0))}–${f2(s.deepAt(q0))}) to the CPF (${f2(dC)} mm from its mid-layer)`); }
  // 5-1: the retrobulbar haemorrhage pushes the globe forward and stretches the lids; 5-2: canthotomy + inferior cantholysis releases the lid
  { const h0 = ORBIT.axial({ state: {} }), h1 = ORBIT.axial({ state: ctx.OCS }), rel = ORBIT.axial({ state: ctx.REL });
    ok(line(ctx, '5-1', 3).includes('眼球突出') && line(ctx, '5-1', 3).includes('眼瞼繃緊') && h1.prop > 1 && h1.prop > h0.prop + 1 && h1.tension > 0,
      `5-1 haemorrhage: globe forward ${f2(h1.prop - h0.prop)} mm, lid tension ${f2(h1.tension)} mm (narration 眼球突出、眼瞼繃緊)`);
    ok(line(ctx, '5-2', 1).includes('眼瞼就鬆開了') && rel.tension === 0 && h1.tension > 0, `5-2 after canthotomy + inferior cantholysis: lid tension ${f2(rel.tension)} (before ${f2(h1.tension)})`); }
  // 5-2: canthotomy runs horizontally from the lateral canthus toward the rim; the cantholysis cuts the inferior crus (below the canthus)
  { const c = CORONAL.draw({ lower: { canthotomy: 1, cantholysis: 1 } }), A = c.A, LC = CORONAL.LC;
    ok(line(ctx, '5-2', 1).includes('從外眥水平剪到外側眶緣') && near(A.canthotomy[1], LC[1], 1e-6) && A.canthotomy[0] < LC[0], `5-2 canthotomy horizontal (y ${f2(A.canthotomy[1])} = canthus ${f2(LC[1])}), temporal to the canthus`);
    ok(line(ctx, '5-2', 1).includes('下支') && A.cantholysis[1] > LC[1] + 0.5, `5-2 cantholysis ${f2(A.cantholysis[1] - LC[1])} mm below the canthal level (narration 下支)`); }
  // orientation: every two-panel segment (and the title figure) names the right eye and says this case is OS, on screen
  { const ids = ctx.segs.filter(s => s.layout === 'dual' || s.layout === 'title').map(s => s.id);
    const bad = ids.filter(id => { const t = (ctx.screen[id] || []).join(''); return !(t.includes('右眼') && t.includes('本台 OS')); });
    ok(ids.length > 8 && !bad.length, `orientation: ${ids.length} segments show 「右眼 … 本台 OS」 on screen${bad.length ? ` (missing: ${bad.join(', ')})` : ''}`); }
  return R;
}

// ---------------------------------------------------------------- run
const clone = o => JSON.parse(JSON.stringify(o));
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
function loadModels() {
  global.document = global.document || { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
  const M = path.join(__dirname, '..', '..', 'models');
  global.LID = require(path.join(M, 'eyelid', 'lid.js'));
  global.CORONAL = require(path.join(M, 'eyelid', 'coronal.js'));
  global.LOWER = require(path.join(M, 'eyelid', 'lower.js'));
  global.LOWERC = require(path.join(M, 'eyelid', 'lower-coronal.js'));
  global.CANTHUS = require(path.join(M, 'eyelid', 'canthus.js'));
  global.ORBIT = require(path.join(M, 'orbit', 'orbit.js'));
  return require('./anim/params.js');
}
if (require.main === module) (async () => {
  let fail = 0;
  const src = ledgerSources(LEDGER);
  for (const [c, m] of src) if (!c) { console.log('FAIL ' + m); fail++; }
  console.log(`${src.every(r => r[0]) ? 'PASS' : 'FAIL'} ledger sources: ${src.length} entries, every source in REFS or ${FREE.join(' / ')}`);
  console.assert(!inRefs({ who: 'Smith', year: '1901' }) && inRefs({ who: 'Hass', year: '2004' }), 'inRefs self-check');
  const { HZP, HS } = loadModels();
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const baseCtx = () => { const text = {}; for (const s of SEGS) text[s.id] = clone(s);
    return { P: clone(HZP), S: clone(HS), OCS: { heme: 1 }, REL: { heme: 1, canthotomy: 1, infLysis: 1 }, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) }; };
  const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
  const res = runAll(baseCtx()), shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log((c ? 'PASS ' : 'FAIL ') + m); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const rep = (c, id, i, a, b) => { c.text[id].lines[i] = c.text[id].lines[i].replace(a, b); };
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-5').lines[2] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-2'].push('瞼板下 3.5 mm'); }],
      ['ledger entry not used', c => { c.ledger['3-3']['99'] = 'Coban 2023'; }],
      ['ledger source not cited in the segment', c => { c.ledger['3-2']['2.4'] = 'Coban 2023'; }],
      ['citation not in REFS', c => { c.screen['5-1'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '2-1').src[1][1] = 'Kaufman 2016'; }],
      ['病例 source in a segment that never names the case', c => { c.ledger['3-2']['19'] = '病例'; }],
      ['lashes not on the cornea before', c => { c.S.PRE.entr = 0.5; }],
      ['lashes still on the cornea after the fixation', c => { c.S.FIX.tie = 0.2; }],
      ['excision without the orbicularis', c => { rep(c, '3-1', 0, '皮下組織與 orbicularis', '皮下組織'); }],
      ['septum not opened', c => { c.S.SEPT.septOpen = 0; }],
      ['fusion distance', c => { c.P.fusionMm = 3; }],
      ['pad count', c => { c.P.pads = 2; }],
      ['inferior oblique between the wrong pads', c => { rep(c, '3-3', 1, '內側和中央之間隔著 inferior oblique', '中央和外側之間隔著 inferior oblique'); }],
      ['fat not removed', c => { c.S.FAT.hotzFat = 0; }],
      ['suture count', c => { c.P.fixN = 4; }],
      ['suture not to the aponeurosis', c => { rep(c, '3-5', 0, 'orbicularis 固定到 retractor aponeurosis', 'orbicularis 固定到 tarsus'); }],
      ['no proptosis', c => { c.OCS.heme = 0; }],
      ['lid not released', c => { c.REL.infLysis = 0; }],
      ['canthotomy not horizontal', c => { rep(c, '5-2', 1, '水平剪到', '垂直剪到'); }],
      ['cantholysis not the inferior crus', c => { rep(c, '5-2', 1, '下支', '上支'); }],
      ['orientation missing on a panel', c => { c.screen['3-1'] = c.screen['3-1'].filter(t => !t.includes('本台 OS')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    const badSrc = ledgerSources({ x: { '1': 'Smith 1901' } }).filter(r => !r[0]).length;
    console.log(`${badSrc ? 'PASS' : 'FAIL'} selftest: a ledger source not in REFS → ${badSrc} check(s) fail`); if (!badSrc) bad++;
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
if (typeof module !== 'undefined') module.exports = { LEDGER };
