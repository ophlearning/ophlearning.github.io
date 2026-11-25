// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of
//    REFS; every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 病例 (病例 = the case summary the
//    site owner confirmed on 2026-11-23: 「OD 上眼瞼 wart，2 週，…」). A number used for two things lists both sources, 「；」-separated.
//    LEDGER also keeps the print sheets' keys (case, path, margin, lash, cryo, follicle: videos/tools/print reads LEDGER as text, without
//    running this file; the anatomy sheet's table rows name these keys). Every source in LEDGER must be a REFS citation or a free source.
// 2. Narration ↔ model: each number or spatial claim the narration makes is checked on the eyelid model (videos/models/eyelid) with the
//    geometry the drawing uses (anim/geo.js, sizes in anim/params.js).
// 3. Views: every surgical segment states the orientation of both views (sagittal: 左＝前　上＝上; surgeon's view: 右眼 OD, 面對病人).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
const LEDGER = {
  // ---- print sheets (keys named by print/anatomy.js; numbers on the sheets)
  'case': { '2': '病例' },                                                                          // 病程 2 週
  'path': { '692': 'Kersten 1997', '13': 'Kersten 1997', '1.9': 'Kersten 1997', '10': 'Kersten 1997' },   // 臨床良性 692 → 13 個（1.9%）惡性，10 個 BCC
  'margin': { '150': 'Custer 2024' },                                                                // 瞼緣 nevus 150 個：superficial excision＋cauterization
  'lash': { '2': 'Sullivan 1976', '30': 'Sullivan 1976' },                                           // 瞼緣 2 個 freeze–thaw 到 −30 °C 破壞睫毛
  'cryo': { '10': 'Luk 2006', '2': 'Luk 2006' },                                                     // 皮膚 common wart：液態氮 10 秒 × 2 個 freeze–thaw（影片不講數字）
  'follicle': { '1.8': 'Elder 1997', '95': 'Elder 1997', '2.4': 'Elder 1997' },                     // 上眼瞼毛囊深 1.8 mm；碰到 95% 要 2.4 mm
  // ---- video segments
  '1-1': { '692': 'Kersten 1997', '13': 'Kersten 1997', '1.9': 'Kersten 1997', '10': 'Kersten 1997', '2': '病例' },
  '1-2': { '150': 'Custer 2024', '4': '結構' },
  '2-1': { '2': '病例' },
  '4-1': { '1.8': 'Elder 1997', '95': 'Elder 1997', '2.4': 'Elder 1997', '1': '結構' },
  '4-2': { '2': 'Sullivan 1976', '30': 'Sullivan 1976', '1': '結構' },
  '6': { '1': '結構', '2': '結構；病例', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '7': '結構', '8': '結構', '1.8': 'Elder 1997' },
};

if (require.main === module) {
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'eyelid');
global.LID = require(path.join(MD, 'lid.js'));
global.CORONAL = require(path.join(MD, 'coronal.js'));
const { SEGS, REFS } = require('./anim/segments.js');
const { WART, EP, NX } = require('./anim/params.js');
const { makeGeo } = require('./anim/geo.js');

const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const FREE = ['院內常規', '示意', '結構', '病例'], LOCAL = ['院內常規', '本片各章來源'];
const SEG_IDS = new Set(SEGS.map(s => s.id));

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

// ---------------------------------------------------------------- 1. ledger
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  // every source anywhere in LEDGER (print keys included) is a REFS citation or a free source
  for (const [key, nums] of Object.entries(ctx.ledger)) for (const [n, src] of Object.entries(nums)) for (const s of plainSrc(src)) {
    const c = cites(s); ok(FREE.includes(s) || (c.length === 1 && c[0].all === s && inRefs(c[0])), `ledger ${key} ${n}: source 「${s}」 is a reference or 院內常規／示意／結構／病例`); }
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
      const cited = plainSrc(src).every(x => srcs.includes(x) || ['結構', '示意', '病例'].includes(x) || (x === '院內常規' && texts.join('').includes('院內常規')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  for (const k of Object.keys(ctx.ledger)) if (/^\d/.test(k)) ok(SEG_IDS.has(k), `ledger key ${k} is a segment of this video`);
  return R;
}

// ---------------------------------------------------------------- 2. narration ↔ model
const f2 = v => (+v).toFixed(2), hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const pip = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j];
  if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const segDist = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return hyp(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]); };
const minDistPoly = (P, Q) => { let d = 1e9; for (const p of P) for (let i = 1; i < Q.length; i++) d = Math.min(d, segDist(p, Q[i - 1], Q[i])); return d; };
function modelChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), G = ctx.G, W = ctx.W, K = ctx.NX.kersten, C = G.COR, F = G.F;
  const pr = G.R0.probe, at = (L, q) => L[Math.max(0, Math.min(L.length - 1, Math.round(q / 0.05)))];
  const skinT = q => hyp(G.S(q), at(pr.skinB, q)), orbD = q => hyp(G.S(q), at(pr.subqB, q));   // skin thickness; depth of the orbicularis' front
  const follicle = []; for (let k = 0.05; k <= 1 + 1e-9; k += 0.05)   // inside the lid (k 0 is the lash exit on its surface)
    follicle.push([F.E[0] + (F.B[0] - F.E[0]) * k, F.E[1] + (F.B[1] - F.E[1]) * k]);
  const domeS = G.dome(G.qc, W.iceR), domeM = G.dome(G.qcM, W.iceRM);
  // ---- 1-1: Kersten 1997 (692 clinically benign → 13 malignant, 1.9 %; 10 BCC)
  { const l1 = line(ctx, '1-1', 1), l2 = line(ctx, '1-1', 2), pct = Math.round(K.malig / K.benign * 1000) / 10;
    ok(l1.includes(`${K.benign} 個`) && l1.includes(`${K.malig} 個`) && l1.includes(`${K.pct}%`) && l2.includes(`${K.bcc} 個`) && pct === K.pct && K.benign === 692 && K.malig === 13 && K.bcc === 10,
      `1-1 Kersten 1997: ${K.benign} benign-looking → ${K.malig} malignant (${pct} %, narration ${K.pct} %), ${K.bcc} BCC`);
    ok(line(ctx, '1-1', 4).includes(`病程 ${ctx.NX.weeks} 週`) && ctx.NX.weeks === 2, `1-1 case: 病程 ${ctx.NX.weeks} 週`); }
  // ---- 1-2: skin-surface lesion on the skin above the lash line, its base above the orbicularis; the follicle runs from the lash line
  //      obliquely up and deeper; margin lesion right over the follicle (lash exit)
  { const base = Math.max(...G.lesion.slice(49).map(p => hyp(p, G.S(G.R0.qOf(p))))), oD = G.orbD(G.qc), dM = hyp(G.S(G.qcM), F.E);
    const qE = G.R0.qOf(F.E) - G.qL, qB = G.R0.qOf(F.B) - G.qL, dB = hyp(F.B, G.S(G.R0.qOf(F.B))), low = G.qc - W.w / 2 - G.qL;
    ok(base < oD && low > 0.3 && line(ctx, '1-2', 1).includes('再下面才是 orbicularis'), `1-2 skin-surface lesion ${f2(low)} mm above the lash line at its lower edge; base ${f2(base)} mm deep, the orbicularis starts ${f2(oD)} mm under the skin`);
    ok(qE < 0.3 && qB > 1 && dB > G.orbD(G.R0.qOf(F.B)) && dB > base && line(ctx, '1-2', 1).includes('從睫毛線斜斜往上長，在更深的地方'), `1-2 follicle from ${f2(qE)} to ${f2(qB)} mm above the lash line (along the skin); bulb ${f2(dB)} mm deep, behind the orbicularis' front`);
    ok(dM < 0.5 && line(ctx, '1-2', 2).includes('正下方就是睫毛的毛囊'), `1-2 margin lesion centre ${f2(dM)} mm from the lash exit of the follicle`);
    ok(line(ctx, '1-2', 3).includes(`${ctx.NX.custer} 個`) && ctx.NX.custer === 150, `1-2 Custer 2024: ${ctx.NX.custer} margin nevi`); }
  // ---- 2-1: local anaesthetic needle tip in the subcutis under the lesion; outside the skin it stays outside the lid
  { const tip = G.needle[1], qT = G.R0.qOf(tip), dT = hyp(tip, G.S(qT)), out = [], inn = [];
    for (let k = 0.02; k <= 0.98; k += 0.02) { const p = [G.needleEntry[0] + (G.needle[0][0] - G.needleEntry[0]) * k, G.needleEntry[1] + (G.needle[0][1] - G.needleEntry[1]) * k]; out.push(G.inLid(p));
      const r = [G.needleEntry[0] + (tip[0] - G.needleEntry[0]) * k, G.needleEntry[1] + (tip[1] - G.needleEntry[1]) * k]; inn.push(G.inLid(r)); }
    ok(dT > skinT(qT) && dT < orbD(qT) && Math.abs(qT - G.qc) < W.w / 2 && line(ctx, '2-1', 3).includes('病灶下方的皮下'), `2-1 needle tip ${f2(dT)} mm deep (skin ${f2(skinT(qT))}, orbicularis from ${f2(orbD(qT))}), ${f2(qT - G.qc)} mm from the lesion centre`);
    ok(!out.some(Boolean) && inn.every(Boolean) && Math.abs(G.R0.qOf(G.needleEntry) - G.qc) > W.w / 2, `2-1 needle: outside part never inside the lid, inner part inside it, entry beside the lesion`);
    ok(line(ctx, '2-1', 0).includes(`病程 ${ctx.NX.weeks} 週`), `2-1 narration 病程 ${ctx.NX.weeks} 週`); }
  // ---- 2-2: the excision above the orbicularis and around the whole lesion, deeper than the lesion's base
  { const D = G.cut.slice(1, -1).map(p => { const q = G.R0.qOf(p); return [hyp(p, G.S(q)), G.orbD(q)]; }), worst = Math.min(...D.map(([d, o]) => o - d)), shallow = Math.min(...D.map(([d]) => d));
    ok(worst > 0 && line(ctx, '2-2', 1).includes('orbicularis 之上'), `2-2 the cut is at least ${f2(worst)} mm above the orbicularis along its whole length`);
    ok(G.cutA < G.qc - W.w / 2 && G.cutB > G.qc + W.w / 2 && shallow > 0.1 && line(ctx, '2-2', 1).includes('整顆病灶完整拿下'), `2-2 cut ${f2(G.cutA - G.qc)}…${f2(G.cutB - G.qc)} mm around a lesion of ±${W.w / 2} mm, at least ${f2(shallow)} mm deep (lesion base 0.1)`); }
  // ---- 3-1: the shield is behind the lid, off the globe, and behind every ice ball; the ice balls stay in the lid (off the globe)
  { const g = G.shield.map(G.toGlobe), ang = p => { const a = Math.atan2(p[1], p[0]); return a > 0 ? a - 2 * Math.PI : a; }, A = G.shield.map(ang), lo = Math.min(...A), hi = Math.max(...A);   // the lid is on the left (x < 0): angles unwrapped around −π
    const ice = [...domeS, ...domeM], near = ice.filter(p => G.toGlobe(p) < 1.5), behind = near.length > 0 && near.every(p => ang(p) >= lo && ang(p) <= hi), inside = ice.every(p => G.inLid(p) || hyp(p, G.onLid(p)) < 1e-6);
    ok(Math.min(...g) > 0.2 && Math.max(...g) < 0.4, `3-1 shield ${f2(Math.min(...g))}–${f2(Math.max(...g))} mm off the globe`);
    ok(behind && line(ctx, '3-1', 2).includes('只隔著一層眼瞼'), `3-1 the shield (angles ${f2(lo)}…${f2(hi)} rad) lies behind every part of both ice balls within 1.5 mm of the globe (${near.length} points)`);
    ok(inside && Math.min(...ice.map(G.toGlobe)) > -0.05 && line(ctx, '3-1', 2).includes('不要碰到眼球的結膜和角膜'), `3-1 every point of both ice balls is in the lid (closest ${f2(Math.min(...ice.map(G.toGlobe)))} mm to the globe)`); }
  // ---- 3-2: the ice ball covers the whole base (sagittal: every point of the cut; surgeon's view: the excision circle), both views agree
  { const cov = G.cut.slice(1, -1).every(p => pip(p, [...domeS, domeS[0]]) || hyp(p, G.S(G.qc)) < W.iceR * 0.999);
    ok(cov && W.iceR >= C.r + W.margin && line(ctx, '3-2', 1).includes('冰球要蓋過整個基底'), `3-2 ice ball (r ${W.iceR}) covers every point of the base; front view: r ${W.iceR} ≥ excision ${f2(C.r + W.margin)} mm`);
    const dyS = G.S(G.qc)[1] - G.S(G.qL)[1], dyC = C.c[1] - G.C0.lashY(0), dL = Math.abs(G.C0.lashY(0) - G.S(G.qL)[1]);
    ok(Math.abs(dyS - dyC) < 1e-9 && dL < 0.3, `3-2 base ${f2(-dyS)} mm above the lash line in both views; lash line height sagittal vs front ${f2(dL)} mm apart`); }
  // ---- 4-1: Elder 1997 numbers; the follicle the video draws is the model's; the margin ice ball reaches the whole follicle
  { const svg = G.R0.svg, LF = LID.F;
    ok(svg.includes(`M${LF(F.B)}L${LF(F.E)}`), `4-1 the follicle shown (lash exit ${F.E.map(f2).join(', ')} → bulb ${F.B.map(f2).join(', ')}) is drawn by the model`);
    ok(F.L >= ctx.EP.follicleUp && F.L <= ctx.EP.reach95Up && ctx.EP.follicleUp === 1.8 && ctx.EP.reach95Up === 2.4 && ctx.EP.pct === 95 && line(ctx, '4-1', 1).includes(`平均 ${ctx.EP.follicleUp} mm`) && line(ctx, '4-1', 2).includes(`${ctx.EP.pct}%`) && line(ctx, '4-1', 2).includes(`${ctx.EP.reach95Up} mm`),
      `4-1 drawn follicle ${f2(F.L)} mm, between the mean ${ctx.EP.follicleUp} and the 95 % reach ${ctx.EP.reach95Up} mm (Elder 1997)`);
    const inM = follicle.filter(p => pip(p, [...domeM, domeM[0]])).length;
    ok(inM === follicle.length && line(ctx, '4-1', 3).includes('就會凍到毛囊'), `4-1 margin ice ball (r ${W.iceRM}) holds ${inM}/${follicle.length} points of the follicle`); }
  // ---- 4-2: Sullivan 1976; skin-surface ice ball away from the follicle; the front view's margin ice ball covers the lash line there
  { const S2 = ctx.NX.sullivan, l1 = line(ctx, '4-2', 1);
    ok(l1.includes(`${S2.cycles} 個 freeze–thaw`) && l1.includes(`−${-S2.temp} °C`) && S2.cycles === 2 && S2.temp === -30, `4-2 Sullivan 1976: ${S2.cycles} freeze–thaw cycles to ${S2.temp} °C`);
    const far = G.dome(G.qc + 2, W.iceR), inN = follicle.filter(p => pip(p, [...domeS, domeS[0]])).length, inF = follicle.filter(p => pip(p, [...far, far[0]])).length;
    const dN = minDistPoly(follicle, [...domeS, domeS[0]]), dF = minDistPoly(follicle, [...far, far[0]]);
    ok(inN > 0 && inF === 0 && dF > dN + 0.3 && line(ctx, '4-2', 3).includes('離睫毛線越遠，冰球離毛囊越遠') && line(ctx, '4-2', 3).includes('可能碰到毛囊根部'),
      `4-2 skin-surface ice ball: at the drawn lesion it holds ${inN} follicle points (bulb end); 2 mm higher up none, ${f2(dF)} mm away`);
    const lashIn = [-1, 0, 1].every(x => hyp([x, G.C0.lashY(x)], C.cM) < W.iceRM && G.C0.lashY(x) <= G.C0.Uy(x));
    ok(lashIn && line(ctx, '4-2', 2).includes('睫毛可能會掉'), `4-2 front view: the margin ice ball (r ${W.iceRM}) covers the lash line at x −1…1 mm`); }
  // ---- 6: checklist numbers are the chapters' numbers
  ok(line(ctx, '6', 7).includes(`${ctx.EP.follicleUp} mm`) && line(ctx, '6', 1).includes(`病程 ${ctx.NX.weeks} 週`) && line(ctx, '6', 4).includes(`病程 ${ctx.NX.weeks} 週`), `6 checklist: follicle ${ctx.EP.follicleUp} mm, 病程 ${ctx.NX.weeks} 週`);
  return R;
}
// ---------------------------------------------------------------- 3. orientation of both views in every surgical segment
function viewChecks(ctx) {
  const R = [], SAG = '左＝前　上＝上', SUR = '面對病人：左＝temporal　右＝nasal';
  for (const id of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', '5']) { const t = ctx.screen[id] || [];
    R.push([t.includes(SAG) && t.includes(SUR) && t.some(x => /右眼 OD/.test(x)), `${id}: both views state their orientation (sagittal ${SAG}; surgeon's view 右眼 OD, ${SUR})`]); }
  return R;
}

// ---------------------------------------------------------------- run
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { W: clone(WART), EP: clone(EP), NX: clone(NX), opt: {}, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => { ctx.G = ctx.G || makeGeo(ctx.W, ctx.opt); return [...ledgerChecks(ctx), ...modelChecks(ctx), ...viewChecks(ctx)]; };
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const geo = (c, f) => { c.G = makeGeo(c.W, c.opt); f(c.G); };
    const MU = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '2-2').lines[3] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-2'].push('冰球 1.6 mm'); }],
      ['ledger entry not used', c => { c.ledger['1-2']['99'] = '院內常規'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-1']['95'] = 'Sullivan 1976'; }],
      ['one of two ledger sources not cited', c => { c.ledger['6']['2'] = '結構；Kersten 1997'; }],
      ['citation not in REFS', c => { c.screen['5'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '5').src[1][1] = 'Wingfield 1980'; }],
      ['print-key source not a reference', c => { c.ledger['lash']['30'] = 'Sullivan 1977'; }],
      ['Kersten counts', c => { c.NX.kersten.malig = 14; }],
      ['Kersten percent', c => { c.NX.kersten.pct = 2.1; }],
      ['Custer count', c => { c.NX.custer = 120; }],
      ['case weeks', c => { c.NX.weeks = 3; }],
      ['skin lesion on the lash line', c => { c.W.dq = 0.9; }],
      ['margin lesion off the follicle', c => { c.W.dqM = 2; }],
      ['lesion into the orbicularis', c => { c.text['1-2'].lines[1] = c.text['1-2'].lines[1].replace('再下面才是', '旁邊就是'); }],
      ['needle tip in the orbicularis', c => geo(c, G => { G.needle[1] = G.S(G.qc - 0.3, 0.9); })],
      ['follicle claim', c => { c.text['1-2'].lines[1] = c.text['1-2'].lines[1].replace('在更深的地方', '在病灶旁邊'); }],
      ['needle outside part through the lid', c => geo(c, G => { G.needle[0] = G.add(G.needleEntry, G.nrm(G.qc), -1.5); })],
      ['excision into the orbicularis', c => geo(c, G => { G.cut = G.cut.map((p, i) => i === 0 || i === G.cut.length - 1 ? p : G.S(G.R0.qOf(p), 0.6)); })],
      ['excision narrower than the lesion', c => { c.W.margin = -0.3; }],
      ['shield too short', c => geo(c, G => { G.shield = G.shield.slice(0, 8); })],
      ['ice ball not kept in the lid', c => { c.opt = { noClip: true }; }],
      ['ice ball smaller than the base', c => { c.W.iceR = 1.0; }],
      ['margin ice ball short of the follicle', c => { c.W.iceRM = 1.2; }],
      ['skin ice ball never near the follicle', c => { c.W.dq = 5; }],
      ['skin ice ball reaching the follicle from higher up', c => { c.W.iceR = 3.2; }],
      ['Elder depth', c => { c.EP.follicleUp = 2.0; }],
      ['Elder 95 % reach', c => { c.EP.reach95Up = 2.2; }],
      ['Sullivan temperature', c => { c.NX.sullivan.temp = -20; }],
      ['view orientation', c => { c.screen['3-1'] = c.screen['3-1'].filter(t => !t.includes('temporal')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MU) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
}
if (typeof module !== 'undefined') module.exports = { LEDGER };
