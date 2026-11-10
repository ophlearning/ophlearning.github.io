// Video-level checks for video ③ (run by videos/tools/check-all.js; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be in REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 錄影 (case A recording, read frame by frame).
// 2. Narration ↔ model ↔ footage: each number or claim the narration makes about the recording is checked on the footage registry
//    (anim/footage.js: events, rates, measured points; params.js: the skipped parts), each model claim on the globe model, and the right
//    panel's model state is sampled on the page (window.CASE_AT, the same function the drawing uses) every 0.5 s of source time and compared
//    with the footage events: instruments only while they are in the eye, only through the main incision, never touching iris, cornea or the
//    anterior capsule; cortex cleared only in the recording's phases; OVD in the bag only after the cannula; the IOL never drawn in the stretch the
//    model cannot show (out 0.3–0.8); OVD behind the optic cleared first; the wound closing only after the swab.
// --selftest breaks each check once on purpose and fails unless every check then reports the error. --list prints the numbers per segment.
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const FOOT = require('./anim/footage.js');
const { SEGS, REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');
const L = K.LENS, CN = K.CN;

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '12': '結構', '16': '錄影', '44': '錄影' },
  '1-1': { '2.8': 'Suryawanshi 2016', '1.7': 'Suryawanshi 2016', '12': '結構', '11': '結構', '1': '結構' },
  '1-2': { '1': '結構', '2': '結構', '12': '結構', '11': '結構' },
  '1-3': { '4': '錄影', '2': '錄影', '6': '錄影', '12': '結構', '1': '結構' },
  '1-4': { '3': '錄影', '12': '結構' },
  '2-1': { '6': '結構', '11': '結構', '1': '結構', '18': '示意' },
  '2-2': { '227': 'Sakamoto 2002', '60': 'Miyoshi 2022', '56': 'Miyoshi 2022', '12': '結構', '1': '結構' },
  '2-3': { '2': '錄影', '6': '錄影', '3': '錄影', '12': '結構', '1': '結構' },
  '3-1': { '1': '結構', '12': '結構', '11': '結構' },
  '3-2': { '1': '結構', '3': '錄影', '12': '結構' },
  '4-1': { '2': '錄影', '12': '結構', '1': '結構' },
  '4-2': { '6.0': 'Osawa 2021', '13.0': 'Osawa 2021', '10.4': 'Vass 1999', '9.6': '示意', '12': '結構', '1': '結構' },
  '4-3': { '6': '錄影', '0.5': '錄影', '12': '結構', '1': '結構' },
  '4-4': { '1': '錄影', '360': '結構', '6.0': '示意', '5.25': '示意', '12': '結構' },
  '4-5': { '30': 'Chang 2009', '93': 'Chang 2009', '0.8': '示意', '12': '結構', '1': '結構' },
  '5-1': { '118': 'Biro 2006', '2': 'Biro 2006', '3': 'Biro 2006', '6': 'Biro 2006', '8': 'Biro 2006', '22': 'Biro 2006', '24': 'Biro 2006', '11': '結構', '1': '結構' },
  '5-2': { '2': '錄影', '12': '結構', '1': '結構' },
  '5-3': { '126': 'Liu 2023', '96.8': 'Liu 2023', '93.7': 'Liu 2023', '0': 'Liu 2023', '35': 'Liu 2023', '1': '結構' },
  '5-4': { '12': '結構', '1': '結構' },
  '7': { '2.80': 'Dooley 2006', '78.4': 'Dooley 2006', '2.58': 'Dooley 2006', '83.1': 'Dooley 2006', '5': 'Dooley 2006', '2.8': 'Suryawanshi 2016', '1': '結構' },
};
const CITE = /([A-Z][A-Za-zÀ-žş'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const isSpecialSrc = s => s === '院內常規' || s === '本片各章來源' || s === '案例 A 錄影';

async function screenText() {   // all text drawn on screen per segment (60 % and 98 % of every line) + the model state table for section 2
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
  // the right panel's model state every 0.5 s of source time over 10:55–19:41 (what the page draws at that moment of the recording)
  const sync = await p.evaluate(() => { const r = [];
    for (let s = 655; s <= 1181.001; s += 0.5) { const z = CASE_AT(s), c = z.cat;
      r.push({ s, phase: z.phase, hold: !!z.hold, cat: JSON.parse(JSON.stringify(c)) }); }
    return r; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return { out, sync };
}

// ---------------------------------------------------------------- geometry helpers (as globe/check.js 13: instrument clearance, IOL clash)
const RIM = CN.cccD / 2;
const under = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L.zAnt(r) - dep]; };
function shaft(st, i) {
  const c = K.norm(st), g = K.instGeom(c, c.inst[i]), f = K.layersFn({ cat: { ...st.cat, inst: [] } }), Bb = K.bagOf(c);
  const piv = g.pivot || g.tn.to3(g.tn.pivot), segs = g.bend ? [[g.tip, g.bend], [g.bend, piv]] : [[g.tip, piv]], R = { iris: 0, cornea: 0, antCap: 0, postCap: 0, g };
  for (const [a, b] of segs) { const L3 = G.len(G.sub(b, a)), ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let t = 0; t <= L3; t += 0.05) { const q = G.add(a, ax, t), rr = g.kind === 'ia' && a === g.tip && t > CN.ia.sleeveBack ? g.rs : (g.rn || g.ro || g.rr || 0.2); let above = 0, below = 0;
      for (let k = 0; k < 12; k++) { const an = 2 * Math.PI * k / 12, p = G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), rr - 0.01), o = f(p), w = G.wallOf(G.mer(p).z, G.mer(p).rho);
        if (o.iris < 0) R.iris++; if (w.d < G.T(w.s) && w.d > -0.01 && w.s < g.tn.sI - 0.3) R.cornea++;
        const r = Math.hypot(p[0], p[1]); if (Bb && r < L.Req) { if (!K.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { if (p[2] > Bb.zA(r)) above++; else below++; } if (p[2] < Bb.zP(r, p[0], p[1])) R.postCap++; } }
      if (above && below) R.antCap++; } }
  R.axisOK = G.len(G.cross(G.sub(piv, g.bend || g.tip), g.axis)) < 1e-9; R.n = R.iris + R.cornea + R.antCap + R.postCap; return R; }
function iolClash(st) {
  const c = K.norm(st), IO = K.iolOf(c), Bb = K.bagOf(c), f = K.layersFn(st), Lf = K.liftZ(c, 0), RO = CN.iol.optic / 2; let iris = 0, cornea = 0, post = 0, straddle = 0;
  const pts = []; for (let u = -RO; u <= RO + 1e-9; u += 0.3) for (let v = -RO; v <= RO + 1e-9; v += 0.3) { const rho = Math.hypot(u, v); if (rho > RO) continue; for (const sg of [1, -1]) pts.push(IO.toEye(u, v, sg * K.optHalf(rho) * 0.98)); }
  for (const H of IO.haps) for (const p of H) pts.push(p);
  for (const p of pts) { if (IO.hid(p) > 0) continue; const o = f(p), r = Math.hypot(p[0], p[1]), z = p[2] - Lf; if (o.iris < 0) iris++; if (o.cornea < 0) cornea++; if (r < L.Req && z < Bb.zP(r, p[0], p[1])) post++; }
  for (const H of IO.haps) { let prev = null; for (let i = 1; i < H.length; i++) for (let t = 0; t < 1; t += 0.05) { const p = H[i - 1].map((v, j) => v + (H[i][j] - v) * t);
    if (IO.hid(p) > 0) { prev = null; continue; } const r = Math.hypot(p[0], p[1]); if (!(r > RIM + 0.02 && r < L.Req - 0.05) || K.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { prev = null; continue; }
    const sg = p[2] - Lf > Bb.zA(r); if (prev !== null && prev !== sg) straddle++; prev = sg; } }
  return { iris, cornea, post, straddle, n: iris + cornea + post + straddle }; }

// ---------------------------------------------------------------- 2. narration ↔ model ↔ footage
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const evs = D => { const o = {}; for (const c of Object.values(D.clips)) Object.assign(o, c.events || {}); return o; };
const m12 = v => ((v % 12) + 12) % 12, dH = (a, b) => Math.abs(m12(a - b + 6) - 6);
const hourPx = (p, c) => m12(12 - Math.atan2(p[0] - c[0], p[1] - c[1]) * 180 / Math.PI / 30);
function modelChecks(ctx) {
  const P = ctx.P, D = ctx.foot, E = evs(D), R = [], ok = (c, m) => R.push([!!c, m]), S = ctx.sync;
  const lmAt = t => { const Lm = D.sources['case-a'].landmarks; return Lm.reduce((a, b) => Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a); };
  // narrated speeds = clip rates
  { const say = [['1-3', 1, 'ia-in', '加速 4 倍', 4], ['1-3', 2, 'ia-strip', '加速 2 倍', 2], ['1-4', 0, 'ia-mid', '加速 3 倍', 3], ['2-3', 0, 'ia-sub', '加速 2 倍', 2], ['2-3', 2, 'ia-end', '加速 6 倍', 6],
      ['4-1', 1, 'ovd', '加速 2 倍', 2], ['4-3', 0, 'iol', '放慢一半', 0.5], ['4-3', 3, 'iol-b', '原速', 1], ['5-2', 0, 'ovdout', '加速 2 倍', 2]];
    const bad = say.filter(([id, i, c, w, r]) => !(line(ctx, id, i).includes(w) && (D.clips[c].rate || 1) === r));
    ok(!bad.length, `narrated speeds match the clip rates (${say.length} statements${bad.length ? '; wrong: ' + bad.map(b => b[0] + ' ' + b[2]).join(', ') : ''})`); }
  // durations said in the narration
  { const ia = E['ia-out'] - E['ia-in'], ovd2 = E['ia2-out'] - E['ia2-in'], adj = P.skipped.adjust[1] - P.skipped.adjust[0];
    ok(near(ia, 180, 15) && line(ctx, '2-3', 3).includes('約 3 分鐘') && line(ctx, '3-2', 3).includes('3 分鐘'), `I/A of the cortex in → out ${f2(ia)} s (narration 約 3 分鐘)`);
    ok(near(ovd2, 30, 6) && line(ctx, '5-2', 1).includes('約半分鐘'), `OVD removal in → out ${f2(ovd2)} s (narration 約半分鐘)`);
    ok(near(adj, 90, 10) && line(ctx, '4-4', 0).includes('約 1 分半'), `skipped IOL adjustment ${f2(adj)} s (narration 約 1 分半)`); }
  // the skipped parts are skipped: no clip overlaps the capsular tension ring, the adjustment or the suturing; the narration says so
  { const cl = Object.entries(D.clips).filter(([id]) => id !== 'title'), ov = (a, b) => cl.filter(([, c]) => c.in < b && c.out > a).map(([id]) => id);
    const ctr = ov(...P.skipped.ctr), adj = ov(...P.skipped.adjust), sut = ov(P.skipped.suture, 1e9);
    ok(!ctr.length && !adj.length && !sut.length && E['ovd-out'] < P.skipped.ctr[0] && P.skipped.ctr[1] < E['inj-in'] && E['swab-off'] <= P.skipped.suture &&
      line(ctx, '4-1', 3).includes('capsular tension ring') && line(ctx, '4-1', 3).includes('routine 不需要') && line(ctx, '5-4', 1).includes('縫合') && line(ctx, '5-4', 1).includes('routine 不需要'),
      `CTR ${P.skipped.ctr.join('–')} s, adjustment ${P.skipped.adjust.join('–')} s and suturing from ${P.skipped.suture} s are in no clip${ctr.length + adj.length + sut.length ? ' (overlap: ' + [...ctr, ...adj, ...sut].join(', ') + ')' : ''}; the narration says the case had a CTR and sutures that routine cases do not need`); }
  // order of the events of the recording
  { const order = ['ia-in', 'freeze-in', 'centre', 'sheet-start', 'sheet-freeze', 'sheet-end', 'nasal-start', 'nasal-end', 'sub-start', 'freeze-sub', 'sub-end', 'freeze-clear', 'ia-out',
      'ovd-in', 'ovd-inject', 'ovd-freeze', 'ovd-out', 'inj-in', 'iol-out', 'iol-freeze1', 'unfold-start', 'unfold-end', 'inj-out', 'iol-freeze2', 'iol-centred', 'ia2-in', 'ia2-out', 'swab-on', 'swab-freeze', 'swab-off'];
    const bad = order.filter((n, i) => i > 0 && !(E[n] > E[order[i - 1]]));
    ok(!bad.length && E['unfold-end'] < E['inj-out'] && line(ctx, '4-3', 3).indexOf('打開') < line(ctx, '4-3', 3).indexOf('injector 退出'),
      `footage events in the order the narration tells them (${order.length}; the optic opens before the injector leaves)${bad.length ? '; out of order: ' + bad.join(', ') : ''}`); }
  // every label on the footage is measured on a frozen frame of its clip
  { const bad = []; for (const [id, c] of Object.entries(D.clips)) for (const [n, ks] of Object.entries(c.points || {})) for (const q of ks) if (!(c.freeze || []).some(f => f.at === q.t)) bad.push(`${id}.${n}@${q.t}`);
    ok(!bad.length, `footage labels only on frozen frames where their points were measured${bad.length ? '; not frozen: ' + bad.join(', ') : ''}`); }
  // where things are on the recording, as narrated: the stripped sheet on the 6 o'clock side (top of the picture), the angled tip turned
  // toward the incision side (lower half), the folded IOL travelling toward 6 o'clock from the incision; the model uses the same clock hours
  { const sh = D.clips['ia-strip'].points.sheet[0], hs = hourPx(sh.p, lmAt(sh.t).cornea), bt = D.clips['ia-sub'].points['bent-tip'][0], hb = hourPx(bt.p, lmAt(bt.t).cornea);
    const fo = D.clips.iol.points['iol-folded'][0], hf = hourPx(fo.p, lmAt(fo.t).cornea);
    ok(dH(hs, 6) < 1.5 && dH(CASE.HP, 6) < 1 && line(ctx, '1-3', 3).includes('6 點那一側'), `stripped sheet at ${hs.toFixed(1)} o'clock on the recording, the model strips it at ${f2(CASE.HP)} h (narration 6 點那一側)`);
    ok(dH(hb, P.bentSub.h) < 0.8 && dH(hb, P.main.h) < 3 && line(ctx, '2-3', 1).includes('主切口這一側'), `angled tip at ${hb.toFixed(1)} o'clock on the recording (model ${P.bentSub.h} h; within 3 h of the main incision ${f2(P.main.h)} h)`);
    ok(dH(hf, 6) < 2.5 && line(ctx, '4-3', 1).includes('往 6 點'), `folded IOL at ${hf.toFixed(1)} o'clock of the cornea centre when frozen (narration 往 6 點那一側)`); }
  // instruments enter through the main incision only (the narration: 同一支彎頭 tip，從頭到尾走主切口；沒有換手，也沒有用雙手 I/A)
  { const vias = new Set(), kinds = new Set(); for (const z of S) for (const i of z.cat.inst || []) { vias.add(i.via || 'main'); kinds.add(i.kind); }
    ok(vias.size === 1 && vias.has('main') && kinds.has('ia') && kinds.has('injector') && kinds.has('cannula') && line(ctx, '2-3', 0).includes('沒有換手'), `every instrument of the recording-synced model goes through the main incision (${[...kinds].join(', ')})`); }
  // the model follows the recording (sampled every 0.5 s of source time; the page's own state function)
  { const has = (z, k) => (z.cat.inst || []).some(i => i.kind === k), bad = []; let prev = null;
    for (const z of S) { const s = z.s, c = z.cat, ia = (s >= E['ia-in'] && s <= E['ia-out']) || (s >= E['ia2-in'] && s <= E['ia2-out']);
      if ((has(z, 'ia') || has(z, 'iaAsp')) !== ia) bad.push(`${s}s I/A ${ia ? 'missing' : 'drawn'}`);
      if (has(z, 'iaAsp') !== (s >= E['sub-start'] && s < E['sub-end'])) bad.push(`${s}s angled tip outside its phase`);
      if (has(z, 'cannula') !== (s >= E['ovd-in'] && s <= E['ovd-out'])) bad.push(`${s}s OVD cannula`);
      if (has(z, 'injector') !== (s >= E['inj-in'] && s <= E['inj-out'])) bad.push(`${s}s injector`);
      if (c.bag && c.bag.strip && (s < E['sheet-start'] || s >= E['sheet-end'] || dH(c.bag.strip.h, 6) > 1)) bad.push(`${s}s strip`);
      if (z.phase === 'ia') { const cx = c.bag.cortex;
        if (s < E['ia-in'] && cx.some(v => v < 1)) bad.push(`${s}s cortex gone before the I/A`);
        if (s < E['sheet-freeze'] && [4, 5, 6].some(h => cx[h] < 1)) bad.push(`${s}s 6 o'clock cortex gone before the sheet`);
        if (s < E['nasal-start'] && [2, 3].some(h => cx[h] < 1)) bad.push(`${s}s nasal cortex gone early`);
        if (s < E['sub-start'] && c.bag.sub < 1) bad.push(`${s}s subincisional cortex gone early`);
        if (s >= E['sub-end'] && (cx.some(v => v > 1e-9) || c.bag.sub > 1e-9)) bad.push(`${s}s cortex left after the reflex is even`);
        if (prev && prev.phase === 'ia' && cx.some((v, h) => v > prev.cat.bag.cortex[h] + 1e-9)) bad.push(`${s}s cortex grows`); }
      if (z.phase === 'ovd' && (s < E['ovd-inject'] && c.ovdBag > 0)) bad.push(`${s}s OVD in the bag before the cannula injects`);
      if (c.iol && c.iol.out !== undefined && c.iol.out > 0.3 + 1e-9 && c.iol.out < 0.8 - 1e-9) bad.push(`${s}s IOL drawn at out ${f2(c.iol.out)} (the model cannot show 0.3–0.8)`);
      if (c.iol && s < E['iol-out']) bad.push(`${s}s IOL before it leaves the nozzle`);
      if (c.ovdOut && (c.ovdOut.front > c.ovdOut.behind + 1e-9 || (c.bag && c.bag.collapse > c.ovdOut.behind + 1e-9))) bad.push(`${s}s OVD in front cleared before the OVD behind / bag closed early`);
      if (c.seal && s < E['ia2-out']) bad.push(`${s}s wound gape while the I/A is in`);
      if (c.seal && s > E['swab-on'] + 3.5 && c.seal.gape > 1e-6) bad.push(`${s}s wound still open after the swab`);
      prev = z; }
    const at = s => S.find(z => Math.abs(z.s - s) < 0.26), sEnd = at(E['ia-out'] - 0.5), iolEnd = at(E['inj-out'] + 0.5), oEnd = at(E['ia2-out'] + 0.5);
    ok(!bad.length, `model follows the footage at ${S.length} sampled moments (instruments only while in the eye; cortex by the recording's phases; OVD; IOL never at out 0.3–0.8; OVD behind first; wound shut after the swab)${bad.length ? '; ' + bad.slice(0, 4).join(', ') : ''}`);
    ok(sEnd && sEnd.cat.bag.cortex.every(v => v === 0) && iolEnd && iolEnd.cat.iol.unfold === 1 && oEnd && oEnd.cat.ovdOut.behind === 1 && oEnd.cat.ovdOut.front === 1,
      `model at the footage's key moments: no cortex before the I/A leaves, the optic open when the injector leaves, all OVD out when the I/A leaves again`);
    // every instrument drawn by the synced model clears iris, cornea (outside its tunnel), anterior capsule and posterior capsule
    const seen = new Map(); for (const z of S) for (const [i, ins] of (z.cat.inst || []).entries()) { const k = JSON.stringify([ins, z.cat.bag && z.cat.bag.caught, !!z.cat.iol]); if (!seen.has(k)) seen.set(k, { st: { cat: z.cat }, i, s: z.s }); }
    const hits = []; for (const { st, i, s } of seen.values()) { const r = shaft(st, i); if (r.n || !r.axisOK) hits.push(`${s}s ${st.cat.inst[i].kind} (iris ${r.iris}, cornea ${r.cornea}, capsule ${r.antCap}/${r.postCap})`); }
    ok(seen.size > 20 && !hits.length, `${seen.size} instrument poses of the synced model: axis through the tunnel pivot, nothing touched${hits.length ? '; ' + hits.slice(0, 3).join(', ') : ''}`);
    // the IOL of the synced model and of the demonstration never touches iris or cornea, never crosses a capsule, never goes behind the posterior capsule
    const iols = new Map(); for (const z of S) if (z.cat.iol) { const k = JSON.stringify(z.cat.iol) + JSON.stringify(z.cat.ovdOut || {}); if (!iols.has(k)) iols.set(k, z); }
    const bad2 = []; for (const z of [...iols.values()].filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 25)) === 0)) { const x = iolClash({ cat: z.cat }); if (x.n) bad2.push(`${z.s}s ${JSON.stringify(x)}`); }
    ok(iols.size > 5 && !bad2.length, `IOL of the synced model (${iols.size} poses, sampled): no contact with iris or cornea, no capsule crossing${bad2.length ? '; ' + bad2.slice(0, 2).join(', ') : ''}`); }
  // model claims of the narration
  { const BASE = { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 } }, st = inst => ({ cat: { ...BASE, bag: { cortex: new Array(12).fill(1) }, inst: [inst] } });
    const bad = shaft(st({ kind: 'ia', p: under(P.main.h, 3.3, 0.7), port: 'up' }), 0), good = shaft(st({ kind: 'ia', p: under(P.HP, 3.0, 0.55), port: 'up' }), 0);
    ok(bad.iris > 0 && good.n === 0 && line(ctx, '2-1', 1).includes('撞到虹膜') && line(ctx, '2-1', 2).includes('伸得到'), `straight coaxial tip: under the subincisional rim → iris hit (${bad.iris}); under the 6 o'clock rim → clear (${good.n})`);
    const d = G.clockDir(P.main.h), l = G.clockDir(P.main.h + 3), a = P.bimanual.az * Math.PI / 180, e = P.bimanual.el * Math.PI / 180, hd = [d[0] * Math.cos(a) + l[0] * Math.sin(a), d[1] * Math.cos(a) + l[1] * Math.sin(a)];
    const asp = { kind: 'iaAsp', via: 'side', p: under(P.main.h, P.bimanual.r, P.bimanual.dep), tipDir: [hd[0] * Math.cos(e), hd[1] * Math.cos(e), -Math.sin(e)], port: 'up' }, B = shaft(st(asp), 0);
    const irr = shaft(st({ kind: 'iaIrr', p: [2.4 * d[0] + 2.2 * l[0], 2.4 * d[1] + 2.2 * l[1], 10.2] }), 0), hdc = shaft(st({ kind: 'cannula', via: 'side', p: [2.2 * d[0], 2.2 * d[1], L.zAnt(2.2) + 0.05] }), 0);
    ok(B.n === 0 && B.g.via === 'side' && P.bimanual.r > RIM + 0.3 && B.g.pdir[2] > 0.5 && irr.n === 0 && hdc.n === 0 && line(ctx, '2-2', 0).includes('側切口') && line(ctx, '2-2', 3).includes('側切口'),
      `bimanual aspirator via the side port reaches under the subincisional rim (r ${P.bimanual.r}, port up, clear), irrigation via the main incision clear; hydro-dispersion cannula via the side port clear`);
    const bent = { kind: 'iaAsp', via: 'main', p: under(P.bentSub.h, P.bentSub.r, P.bentSub.dep), tipDir: (() => { const q = G.clockDir(P.bentSub.toward), ee = P.bentSub.el * Math.PI / 180; return [q[0] * Math.cos(ee), q[1] * Math.cos(ee), -Math.sin(ee)]; })(), port: 'up' };
    ok(shaft(st(bent), 0).n === 0 && P.bentSub.r > RIM, `angled tip (示意) via the main incision under the rim at ${P.bentSub.h} o'clock: clear`);
    // IOL numbers: optic 6.0, overall 13.0 (Osawa 2021), the bag 10.37 (Vass 1999) shorter than the IOL; the model bag 9.6 as drawn
    ok(CN.iol.optic === 6.0 && CN.iol.overall === 13.0 && line(ctx, '4-2', 3).includes('6.0 mm') && line(ctx, '4-2', 3).includes('13.0 mm') && line(ctx, '4-2', 4).includes('10.4 mm') && 10.37 < CN.iol.overall && L.LED.toFixed(1) === '9.6',
      `IOL optic ${CN.iol.optic} / overall ${CN.iol.overall} mm (Osawa 2021) > bag 10.37 mm (Vass 1999; model ${L.LED.toFixed(2)})`);
    // caught capsule: port down; the tent exists only when caught
    const cap = k => K.bagOf(K.norm({ cat: { ...BASE, bag: { cortex: new Array(12).fill(0), sub: 0, caught: k }, inst: [{ kind: 'ia', p: under(P.HP, 3.8, 0.9), port: 'down', occl: 1 }] } }));
    ok(cap(1).amp > 0.5 && cap(0).amp === 0, `caught posterior capsule (動畫示意): tent ${f2(cap(1).amp)} mm when caught, none otherwise`);
    // the decentred IOL of 4-5 leaves the optic edge uncovered; the final IOL is covered all round (CCC 5.25 on a 6.0 optic: Hollick 1999)
    const cover = dx => { let m = 1e9; for (let h = 0; h < 12; h += 0.1) { const p = under(h, RIM, 0); m = Math.min(m, CN.iol.optic / 2 - Math.hypot(p[0] - dx, p[1])); } return m; };
    ok(cover(0) >= 0.25 && cover(0.8) < 0 && CN.cccD === 5.25, `CCC ${CN.cccD} on optic ${CN.iol.optic}: covered by ${f2(cover(0))} mm all round; decentred 0.8 mm → ${f2(cover(0.8))} (edge exposed)`); }
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), Lg = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(isSpecialSrc(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video, 院內常規 or 案例 A 錄影`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(Lg[n], `${sg.id}: number ${n} has a source in the ledger${Lg[n] ? ` (${Lg[n]})` : ''}`);
    for (const [n, src] of Object.entries(Lg)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意'].includes(src) || texts.join('').includes(src) || (src === '院內常規' && (srcs.includes(src) || texts.join('').includes('院內常規'))) ||
        (src === '錄影' && (srcs.includes('案例 A 錄影') || texts.join('').includes('錄影')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  const used = new Set(SEGS.flatMap(s => (s.src || []).flatMap(x => cites(x[1]).map(c => c.who + ' ' + c.year))));
  for (const r of REFS) { const m = r.match(/^([A-Z][A-Za-zÀ-žş'\-]+)/), y = r.match(/ (\d{4});/); ok(m && y && used.has(m[1] + ' ' + y[1]), `reference 「${r.slice(0, 40)}…」 is cited in a segment`); }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P: clone(CASE), foot: { sources: FOOT.sources, clips: clone(FOOT.clips) }, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER), sync: clone(SYNC) };
}
let SYNC = null;
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const { out: screen, sync } = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  SYNC = sync;
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in a segment/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '1-2').lines[1] += '0.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-2'].push('haptic 0.4 mm'); }],
      ['ledger entry not used', c => { c.ledger['5-3']['99'] = 'Liu 2023'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-5']['93'] = 'Biro 2006'; }],
      ['citation not in REFS', c => { c.screen['5-1'].push('Smith 2020'); }],
      ['narrated speed wrong', c => { c.foot.clips['ia-end'].rate = 4; }],
      ['I/A said 3 minutes but lasted 4', c => { c.foot.clips['ia-end'].events['ia-out'] = 900; }],
      ['a clip overlapping the CTR', c => { c.foot.clips.ovd.out = 895; }],
      ['events out of order (injector out before the optic opens)', c => { c.foot.clips.iol.events['inj-out'] = 1001; }],
      ['a footage label on a moving frame', c => { c.foot.clips['ia-strip'].points.sheet[0].t = 745; }],
      ['the sheet put at 12 o\'clock', c => { c.foot.clips['ia-strip'].points.sheet[0].p = [560, 600]; }],
      ['an instrument through the side port in the synced model', c => { for (const z of c.sync) for (const i of z.cat.inst || []) if (i.kind === 'cannula') i.via = 'side'; }],
      ['I/A still drawn after it left', c => { const z = c.sync.find(q => Math.abs(q.s - 849) < 0.1); z.cat.inst = [{ kind: 'ia', p: [0, -1, 9.5], port: 'up' }]; }],
      ['the IOL drawn half out (out 0.5)', c => { for (const z of c.sync) if (z.cat.iol && z.cat.iol.out === 0.3) z.cat.iol.out = 0.5; }],
      ['cortex cleared before the I/A', c => { c.sync[0].cat.bag.cortex[5] = 0.5; }],
      ['OVD in front cleared first', c => { for (const z of c.sync) if (z.cat.ovdOut) { const b = z.cat.ovdOut.behind; z.cat.ovdOut.behind = z.cat.ovdOut.front; z.cat.ovdOut.front = b; } }],
      ['an I/A pose that hits the iris', c => { const z = c.sync.find(q => (q.cat.inst || []).some(i => i.kind === 'ia')); z.cat.inst[0].p = under(CASE.main.h, 3.3, 0.7); }],
      ['the bimanual tip moved over the rim', c => { c.P.bimanual.r = 2.4; }],
      ['IOL said 12.5 mm', c => { c.text['4-2'].lines[3] = c.text['4-2'].lines[3].replace('13.0', '12.5'); }],
    ];
    let bad = 0;
    for (const [name, mut] of M) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
