// Video-level checks for video ④ (run by videos/tools/check-all.js; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be in REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 錄影 (the case recording, read frame by frame) /
//    術者 (what the surgeon said, 2026-11-10).
// 2. Narration ↔ footage ↔ model: each statement about the recording is checked on the footage registry (anim/footage.js: events, rates,
//    measured points) and on the page: at the start and end of every narration line of a footage segment the source time on screen
//    (window.FOOT_AT, the drawing's own footage clock) must show what the line says, in the order it says it (e.g. the instruments are still in when
//    「一起退出」 starts and out before 「停格」). The right panel's model state is sampled every 0.5 s of source time (window.CASE_AT, the same
//    functions the drawing uses): instruments only while the recording shows them, through the incision the recording shows, never touching
//    iris, cornea or a capsule (the posterior capsule only inside the rent). Model claims of the narration are checked on the globe model.
// 3. Wording rules of this case (the user's answers, 2026-11-10): the PCR moment is never stated as seen; triamcinolone is 「看起來是…（術者推測）」;
//    the IOL position comes from the surgeon; nothing is said about lens fragments in the vitreous, a VR referral or the 29:40–31:45 injections
//    for this case; no line about this case judges it.
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
  'title': { '24': '錄影', '25': '錄影', '12': '結構', '9': '結構' },
  '1-1': { '3.5': 'Barraquer 2006', '58': 'Rajan 2025', '60': 'Rajan 2025', '25': 'Rajan 2025', '1.7': 'Suryawanshi 2016', '2.8': 'Suryawanshi 2016', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '1-2': { '11': '結構', '1': '結構' },
  '1-3': { '11': '錄影', '12': '結構', '9': '結構', '2': '錄影', '40': '錄影' },
  '2-1': { '11': '結構', '1': '結構' },
  '2-2': {},
  '2-3': { '11': '結構', '1': '結構' },
  '2-4': { '5': '結構', '11': '結構', '1': '結構' },
  '2-5': { '3': '結構', '11': '結構', '1': '結構' },
  '2-6': { '12': '錄影', '58': '錄影', '9': '結構', '0.5': '錄影' },
  '2-7': {},
  '3-1': { '11': '結構', '1': '結構' },
  '3-2': { '11': '結構', '1': '結構' },
  '3-3': { '10': '錄影', '2': '錄影', '0.5': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '3-4': { '5': '結構', '11': '結構', '1': '結構' },
  '3-5': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '11': '結構' },
  '4-1': { '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '4-2': { '2': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '4-3': { '6': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '4-4': { '11': '結構', '1': '結構' },
  '5-1': { '400': 'Rajan 2025', '600': 'Rajan 2025', '4': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '5-2': { '3.5': 'Rajan 2025', '4': 'Rajan 2025', '23': 'Rajan 2025', '2': '結構', '11': '結構', '12': '結構', '9': '結構', '1': '結構' },
  '5-4': { '2': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '5-5': { '2': '錄影', '4': '錄影', '12': '結構', '9': '結構' },
  '6-1': { '3': '結構', '11': '結構' },
  '6-2': { '30': 'Chang 2009', '93': 'Chang 2009', '0.6': 'Suto 2003', '0.62': 'Suto 2003', '0.75': 'Suto 2003', '1.00': 'Suto 2003', '3': '結構', '11': '結構', '1': '結構' },
  '6-3': { '6': 'Wakili 2026', '2': '錄影', '12': '結構', '9': '結構', '11': '結構', '1': '結構' },
  '7-1': { '11': '結構', '1': '結構' },
  '7-2': { '6105': 'Rothman 2026', '12.5': 'Rothman 2026', '3': 'Vanner 2014', '14': 'Vanner 2014' },
  '8': { '1': 'Ferris 2020', '2': 'Ferris 2020', '4.2': 'Ferris 2020', '2.6': 'Ferris 2020' },
};
const CITE = /([A-Z][A-Za-zÀ-žş'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').replace(/AAB00|23G|25G|27G/g, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && (r.includes(c.year + ';') || r.includes(c.year + '.')));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const isSpecialSrc = s => s === '院內常規' || s === '本片各章來源' || s === '本例錄影' || s === '術者說明';

async function screenText() {   // all text drawn on screen per segment (60 % and 98 % of every line), the footage on screen at line starts / ends, model states
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
  // footage on screen: every narration line of the footage segments, at its start (+0.05 s), every 0.1 s and at its end
  const foot = await p.evaluate(() => { const r = {};
    for (const id of window.FOOT_SEGS) { const s = TL_EXPORT.find(x => x.id === id), L = [];
      for (const [a, e] of s.lines) { const smp = []; for (let t = a + 0.05; t <= e + 1e-9; t += 0.05) smp.push(window.FOOT_AT(id, t)); L.push(smp); }
      r[id] = L; }
    return r; });
  // the right panel's model state every 0.5 s of source time in each footage clip the right panel follows
  const sync = await p.evaluate(() => { const r = {}, C = FOOTAGE_DEF.clips, A = window.CASE_AT;
    const runs = { firstAt: ['withdraw', 'ovd1'], levAt: ['lev'], emulAt: ['emul'], iaAt: ['ia'], vitAt: ['vit'] };
    for (const [fn, clips] of Object.entries(runs)) { r[fn] = [];
      for (const id of clips) for (let s = C[id].in; s <= C[id].out + 1e-9; s += 0.5) r[fn].push({ s, cat: JSON.parse(JSON.stringify(A[fn](s).cat)) }); }
    return r; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return { out, foot, sync };
}

// ---------------------------------------------------------------- geometry: instrument clearance (as globe/check.js; the posterior capsule may be crossed only inside the rent)
function shaft(st, i) {
  const c = K.norm(st), g = K.instGeom(c, c.inst[i]), f = K.layersFn({ ...st, cat: { ...st.cat, inst: [] } }), Bb = K.bagOf(c), PC = K.pcrOf(c);
  const piv = g.pivot || g.tn.to3(g.tn.pivot), segs = g.bend ? [[g.tip, g.bend], [g.bend, piv]] : [[g.tip, piv]], R = { iris: 0, cornea: 0, antCap: 0, postCap: 0, g };
  for (const [a, b] of segs) { const L3 = G.len(G.sub(b, a)), ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let t = 0; t <= L3; t += 0.05) { const q = G.add(a, ax, t), rr = (g.kind === 'ia' && a === g.tip && t > CN.ia.sleeveBack ? g.rs : (g.rn || g.ro || g.rr || 0.2)); let above = 0, below = 0;
      for (let k = 0; k < 12; k++) { const an = 2 * Math.PI * k / 12, p = G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), rr - 0.01), o = f(p), w = G.wallOf(G.mer(p).z, G.mer(p).rho);
        if (o.iris < 0) R.iris++; if (w.d < G.T(w.s) && w.d > -0.01 && g.tn && w.s < g.tn.sI - 0.3) R.cornea++;
        const r = Math.hypot(p[0], p[1]); if (Bb && r < L.Req) { if (!K.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { if (p[2] > Bb.zA(r)) above++; else below++; }
          const l = PC ? PC.toL(p) : p; if (p[2] < Bb.zP(r, p[0], p[1]) && !(PC && PC.R && PC.R.f(l[0], l[1]) < 0)) R.postCap++; } }
      if (above && below) R.antCap++; } }
  R.axisOK = G.len(G.cross(G.sub(piv, g.bend || g.tip), g.axis)) < 1e-9; R.n = R.iris + R.cornea + R.antCap + R.postCap; return R; }

// ---------------------------------------------------------------- 2. narration ↔ footage ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const evs = D => { const o = {}; for (const c of Object.values(D.clips)) Object.assign(o, c.events || {}); return o; };
const lines = ctx => SEGS.filter(s => s.lines).flatMap(s => ctx.text[s.id].lines.map((l, i) => ({ id: s.id, i, t: l.replace(/\n/g, '') })));
function modelChecks(ctx) {
  const P = ctx.P, D = ctx.foot, E = evs(D), R = [], ok = (c, m) => R.push([!!c, m]), F = ctx.footOn, S = ctx.sync;
  // narrated speeds = clip rates (the badge shows the others)
  { const say = [['2-6', 0, 'moment', '放慢一半', 0.5], ['3-3', 0, 'withdraw', '放慢一半', 0.5], ['3-3', 2, 'ovd1', '加速 2 倍', 2]];
    const bad = say.filter(([id, i, c, w, r]) => !(line(ctx, id, i).includes(w) && (D.clips[c].rate || 1) === r));
    ok(!bad.length, `narrated speeds match the clip rates (${say.length} statements${bad.length ? '; wrong: ' + bad.map(b => b[0] + ' ' + b[2]).join(', ') : ''})`); }
  // durations said in the narration
  { const gap = E['can-in'] - E['out'], em = E['ph-out'] - E['ph-in'];
    ok(near(gap, 10, 2) && line(ctx, '3-3', 1).includes('約 10 秒') && near(P.noInstGap[1] - P.noInstGap[0], gap, 0.01), `no instrument from withdrawal to the side-port cannula: ${f2(gap)} s (narration 約 10 秒)`);
    ok(em >= P.emulMin && em <= P.emulMax && line(ctx, '4-3', 1).includes('兩分多鐘'), `remaining nucleus: phaco in → out ${f2(em)} s (narration 兩分多鐘: ${P.emulMin}–${P.emulMax} s)`); }
  // order of the events of the recording
  { const order = ['orange', 'phaco-out', 'out', 'can-in', 'can-out', 'lev-in', 'lev-out', 'ph-in', 'ph-out', 'ia', 'two-in', 'unfold', 'inj-out', 'hook-in', 'ta-in', 'ta-white', 'ta-out', 'clear'];
    const bad = order.filter((n, i) => i > 0 && !(E[n] > E[order[i - 1]]));
    ok(!bad.length && D.clips.moment.freeze[0].at > E['out'], `footage events in the recording's order (${order.length}; the 12:59 freeze after both instruments are out)${bad.length ? '; out of order: ' + bad.join(', ') : ''}`); }
  // every label on the footage is measured on a frozen frame of its clip
  { const bad = []; for (const [id, c] of Object.entries(D.clips)) for (const [n, ks] of Object.entries(c.points || {})) for (const q of ks) if (!(c.freeze || []).some(f => f.at === q.t)) bad.push(`${id}.${n}@${q.t}`);
    ok(!bad.length, `footage labels only on frozen frames where their points were measured${bad.length ? '; not frozen: ' + bad.join(', ') : ''}`); }
  // what is on screen while each line is said (start = first sample, end = last sample of the line)
  { const st = (id, i) => F[id][i][0], en = (id, i) => F[id][i][F[id][i].length - 1], during = (id, i, f) => F[id][i].some(f), all = (id, i, f) => F[id][i].every(f);
    const T = [
      ['2-6 line 1 starts after the orange reflex appears (瞳孔左下方，出現之前沒有的橘紅色反光)', () => st('2-6', 1).s >= E.orange],
      ['2-6 line 2 starts while phaco and chopper are still in and they are both out by its end (一起退出)', () => st('2-6', 2).s <= E['phaco-out'] + 0.3 && en('2-6', 2).s >= E.out],
      ['2-6 line 3 (停格) shows the frozen 12:59 frame', () => during('2-6', 3, z => z.frozen && z.s === 779.0)],
      ['3-3 line 0 starts with the instruments in (withdraw clip) and they are out by its end', () => st('3-3', 0).clip === 'withdraw' && st('3-3', 0).s < E['phaco-out'] && en('3-3', 0).s >= E.out],
      ['3-3 line 1 (約 10 秒沒有器械): no instrument on screen', () => all('3-3', 1, z => z.s >= E.out && z.s < E['can-in'])],
      ['3-3 line 2 starts as the cannula enters through the side port', () => st('3-3', 2).clip === 'ovd1' && near(st('3-3', 2).s, E['can-in'], 0.6)],
      ['4-2 line 0 starts as the cannula comes in through the main incision', () => st('4-2', 0).s <= E['lev-in'] + 0.8 && en('4-2', 0).s >= E['lev-in']],
      ['4-2 line 1 (伸到核塊下方和旁邊) while the cannula is in', () => all('4-2', 1, z => z.s >= E['lev-in'] && z.s <= E['lev-out'])],
      ['4-2 line 2 (停格) shows the frozen 13:50 frame', () => during('4-2', 2, z => z.frozen && z.s === 830.0)],
      ['4-3 line 0 starts as the phaco and the straight instrument come in', () => st('4-3', 0).s <= E['ph-in'] + 0.8 && en('4-3', 0).s >= E['ph-in']],
      ['5-1 line 1 (錄影：coaxial I/A) shows the I/A clip', () => all('5-1', 1, z => z.clip === 'ia')],
      ['5-4 line 0 starts as the two instruments come in', () => st('5-4', 0).s <= E['two-in'] + 0.8 && en('5-4', 0).s >= E['two-in']],
      ['5-4 line 1 (停格) shows the frozen 24:25 frame', () => during('5-4', 1, z => z.frozen && z.s === 1465.0)],
      ['5-5 line 1 (打入白色顆粒) shows the TA clip from the white particles on', () => all('5-5', 1, z => z.clip === 'ta') && during('5-5', 1, z => z.s >= E['ta-white'] && z.s < E['ta-out'])],
      ['5-5 line 2 (停格) shows the frozen 45:06 frame', () => during('5-5', 2, z => z.frozen && z.s === 2706.0)],
      ['5-5 line 3 (清掉，瞳孔回到清澈) shows the clearing clip and the clear pupil by its end', () => during('5-5', 3, z => z.clip === 'ta2') && en('5-5', 3).clip === 'ta2' && en('5-5', 3).s >= E.clear],
      ['6-3 line 0 (IOL 在前房打開) shows the IOL opening', () => all('6-3', 0, z => z.clip === 'iol') && during('6-3', 0, z => z.s >= E.unfold)],
      ['6-3 line 1 (用鉤子調整) shows the hook clip', () => during('6-3', 1, z => z.clip === 'iol2' && z.s >= E['hook-in'])],
    ];
    const bad = T.filter(([, f]) => { try { return !f(); } catch (e) { return true; } }).map(t => t[0]);
    ok(!bad.length, `footage on screen matches every narrated action and its order (${T.length} line checks)${bad.length ? '; wrong: ' + bad.join(' | ') : ''}`); }
  // where things are on the recording, as narrated: the orange reflex in the lower left of the pupil, the white particles' wisps toward the left
  { const lm = t => D.sources['case-pcr'].landmarks.reduce((a, b) => Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a);
    const o = D.clips.moment.points.orange[0], c0 = lm(o.t).cornea, w = D.clips.ta.points.streak[0], k = D.clips.ta.points.clump[0];
    ok(o.p[0] < c0[0] && o.p[1] > c0[1] - 60 && line(ctx, '2-6', 1).includes('左下方'), `orange reflex at (${o.p}) left of and around/below the cornea centre (${c0}) (narration 瞳孔左下方)`);
    ok(w.p[0] < k.p[0] - 60 && line(ctx, '5-5', 2).includes('左側切口'), `white wisps (${w.p}) left of the clump (${k.p}), toward the left incision (narration 往左側切口那一邊)`); }
  // incisions: model 11 / 2 o'clock vs the recording's bearings (OS, surgeon at 12: right = 9 o'clock = nasal; never mirrored)
  { const OR = K.orient({ eye: 'OS', surgeon: 12 }), bear = h => { const d = G.clockDir(h), M = G.enfaceMap(12)([d[0], d[1], 0]), c = G.enfaceMap(12)([0, 0, 0]); return Math.atan2(M[0] - c[0], M[1] - c[1]) * 180 / Math.PI; };
    ok(OR.bottom === 12 && OR.right === 9 && OR.rightAnat.en === 'nasal' && near(bear(P.main.h), P.mainDeg, 10) && bear(P.side.h) < -50 && line(ctx, '1-3', 0).includes('右邊是 9 點') && line(ctx, '1-3', 1).includes('主切口約 11 點'),
      `OS microscope: bottom ${OR.bottom}, right ${OR.right} (${OR.rightAnat.en}); model main incision ${f2(bear(P.main.h))}° right of straight down (recording ${P.mainDeg}°), side port ${f2(bear(P.side.h))}°`); }
  // the right panel follows the recording (sampled every 0.5 s): instruments only while shown, through the incision the recording shows
  { const bad = [], kinds = (z, k) => (z.cat.inst || []).filter(i => i.kind === k), via = i => i.via || 'main';
    for (const z of S.firstAt) { const s = z.s, ph = kinds(z, 'phaco').length, ch = kinds(z, 'chopper'), ca = kinds(z, 'cannula');
      if (!!ph !== (s < E['phaco-out'])) bad.push(`${s}s phaco`); if (!!ch.length !== (s < E.out)) bad.push(`${s}s chopper`); if (!!ca.length !== (s >= E['can-in'] && s <= E['can-out'])) bad.push(`${s}s cannula`);
      if (ch.some(i => via(i) !== 'side') || ca.some(i => via(i) !== 'side')) bad.push(`${s}s via`); if (z.cat.pcr.collapse || z.cat.pcr.deep) bad.push(`${s}s chamber change drawn (the recording cannot show it)`);
      if (s < E['can-in'] && z.cat.pcr.ovdD.tamp > 0) bad.push(`${s}s OVD before the cannula`); }
    for (const z of S.levAt) { const s = z.s, ca = kinds(z, 'cannula'); if (!!ca.length !== (s >= E['lev-in'] && s <= E['lev-out']) || ca.some(i => via(i) !== 'main')) bad.push(`${s}s lev cannula`); if (s < E['lev-in'] && z.cat.pcr.frag.float > 0) bad.push(`${s}s floated before the cannula`); }
    for (const z of S.emulAt) { const s = z.s, ph = kinds(z, 'phaco'), sp = kinds(z, 'spatula'); if ((!!ph.length !== (s >= E['ph-in'] && s < E['ph-out'])) || (!!sp.length !== !!ph.length) || sp.some(i => via(i) !== 'side')) bad.push(`${s}s emul instruments`);
      if (s >= E['ph-out'] && z.cat.pcr.frag) bad.push(`${s}s piece left after the phaco leaves`); }
    for (const z of S.iaAt) if (kinds(z, 'ia').length !== 1 || kinds(z, 'ia').some(i => via(i) !== 'main')) bad.push(`${z.s}s I/A`);
    for (const z of S.vitAt) { const s = z.s, v = kinds(z, 'vitrector'), ir = kinds(z, 'irrig'); if ((!!v.length !== (s >= E['two-in'])) || (!!ir.length !== !!v.length) || v.some(i => via(i) !== 'main') || ir.some(i => via(i) !== 'side')) bad.push(`${s}s vit instruments`); }
    const n = Object.values(S).reduce((a, v) => a + v.length, 0);
    ok(!bad.length && line(ctx, '5-4', 0).includes('左邊那支經左側的切口') && line(ctx, '5-4', 0).includes('右邊那支經主切口'), `right panel follows the footage at ${n} sampled moments (instruments only while shown; phaco, I/A, vitrector, cannula via the main incision; chopper, straight instrument, irrigation, OVD cannula via the side port)${bad.length ? '; ' + bad.slice(0, 4).join(', ') : ''}`);
    // every instrument pose of the synced model clears iris, cornea (outside its tunnel), anterior capsule, posterior capsule (rent excepted)
    const seen = new Map(); for (const arr of Object.values(S)) for (const z of arr) (z.cat.inst || []).forEach((ins, i) => { const k = JSON.stringify([ins, z.cat.pcr && z.cat.pcr.frag, z.cat.bag]); if (!seen.has(k)) seen.set(k, { st: { eye: 'OS', cat: z.cat }, i, s: z.s }); });
    const hits = []; let n2 = 0; for (const [k, { st, i, s }] of seen) { if (n2++ % 3) continue; const r = shaft(st, i); if (r.n || !r.axisOK) hits.push(`${s}s ${st.cat.inst[i].kind} (iris ${r.iris}, cornea ${r.cornea}, capsule ${r.antCap}/${r.postCap})`); }
    ok(seen.size > 10 && !hits.length, `${seen.size} instrument poses of the synced model (every third checked): axis through the tunnel pivot, nothing touched${hits.length ? '; ' + hits.slice(0, 3).join(', ') : ''}`); }
  // model claims of the narration
  { ok(CN.cap.postPole === 0.0035 && line(ctx, '1-1', 0).includes('3.5 µm'), `posterior capsule at the pole ${CN.cap.postPole * 1000} µm in the model (Barraquer 2006; narration 約 3.5 µm)`);
    const pp = CN.pcr.pp.s; ok(pp >= 3.5 && pp <= 4 && line(ctx, '5-2', 2).includes('3.5–4 mm') && near(CN.pcr.vitrector.od, 0.64, 0.01), `pars plana sclerotomy ${pp} mm behind the limbus (Rajan 2025: 3.5–4 mm), 23G ${CN.pcr.vitrector.od} mm`);
    const S1 = K.iolOf(K.norm({ eye: 'OS', cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 }, bag: { cortex: new Array(12).fill(0), sub: 0, collapse: 1 }, pcr: { rent: P.rent, vit: { cut: 1 } }, iol: { pos: 'sulcus', rot: -35 } } }));
    const B1 = K.iolOf(K.norm({ eye: 'OS', cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 }, bag: { cortex: new Array(12).fill(0), sub: 0, collapse: 1 }, ovdBag: 1, ovdOut: { behind: 1, front: 1 }, iol: { rot: -35 } } }));
    const dz = S1.O[2] - B1.O[2]; ok(dz >= CN.pcr.elp[0] && dz <= CN.pcr.elp[1] && CN.pcr.dD === -1.0 && line(ctx, '6-2', 2).includes('1.00 D'), `sulcus optic ${f2(dz)} mm in front of the in-the-bag optic (Suto 2003: 0.62–0.75), power −1.00 D`);
    ok(CN.iol.optic === P.iol.optic && line(ctx, '6-3', 2).includes('optic 6 mm') && line(ctx, '6-3', 2).includes('AAB00') && line(ctx, '6-3', 2).includes('sulcus'), `IOL: AAB00, optic ${P.iol.optic} mm (Wakili 2026), in the sulcus (the surgeon); the model optic ${CN.iol.optic} mm`); }
  return R;
}
// ---------------------------------------------------------------- 3. wording rules of this case
function wordingChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), A = lines(ctx), all = A.map(x => x.t).join('|');
  ok(/錄影看不出後囊確切在什麼時候破/.test(all) && /術者推測是在刻槽或移除核塊/.test(all) && !A.some(x => /本例/.test(x.t) && /(這時|此時|那一刻)後囊破/.test(x.t)), 'PCR moment: 「錄影看不出…；術者推測在刻槽或移除核塊」, never stated as seen');
  ok(/看起來是 triamcinolone（術者推測）/.test(all), 'triamcinolone: 「看起來是 triamcinolone（術者推測）」');
  ok(/術者說明：AAB00/.test(all), 'IOL position from the surgeon (術者說明：AAB00 … sulcus)');
  const caseLines = A.filter(x => /本例|錄影：|術者/.test(x.t));
  const unanswered = caseLines.filter(x => /玻璃體腔|轉給|轉 VR|VR 醫師|29:40|注射/.test(x.t));
  ok(!unanswered.length, `nothing said about this case's dropped fragments, VR referral or the 29:40–31:45 injections${unanswered.length ? ': ' + unanswered.map(x => x.id + ':' + x.i).join(', ') : ''}`);
  const judge = caseLines.filter(x => /錯|不對|應該|不應|太慢|太晚|不好|失誤/.test(x.t));
  ok(!judge.length, `no line about this case judges it${judge.length ? ': ' + judge.map(x => x.id + ':' + x.i).join(', ') : ''}`);
  ok(/本例的順序是先退出、再補 OVD；綜論建議/.test(all), "the case's order and the recommended order are both stated (3-3)");
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), Lg = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(isSpecialSrc(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video, 院內常規, 本例錄影 or 術者說明`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(Lg[n], `${sg.id}: number ${n} has a source in the ledger${Lg[n] ? ` (${Lg[n]})` : ''}`);
    for (const [n, src] of Object.entries(Lg)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意'].includes(src) || texts.join('').includes(src) || (src === '錄影' && (srcs.includes('本例錄影') || texts.join('').includes('錄影'))) ||
        (src === '術者' && (srcs.includes('術者說明') || texts.join('').includes('術者')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  const used = new Set(SEGS.flatMap(s => (s.src || []).flatMap(x => cites(x[1]).map(c => c.who + ' ' + c.year))));
  for (const r of REFS) { const m = r.match(/^([A-Z][A-Za-zÀ-žş'\-]+)/), y = r.match(/ (\d{4})[;.]/); ok(m && y && used.has(m[1] + ' ' + y[1]), `reference 「${r.slice(0, 40)}…」 is cited in a segment`); }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
let SCREEN = null, FOOTON = null, SYNC = null;
function baseCtx() {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P: clone(CASE), foot: { sources: FOOT.sources, clips: clone(FOOT.clips) }, text, segs: clone(SEGS), screen: clone(SCREEN), ledger: clone(LEDGER), footOn: clone(FOOTON), sync: clone(SYNC) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx), ...wordingChecks(ctx)];
(async () => {
  const { out, foot, sync } = await screenText(); SCREEN = out; FOOTON = foot; SYNC = sync;
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(out[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx());
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in a segment/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '2-1').lines[1] += '0.45 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-1'].push('OVD 0.5 mL'); }],
      ['ledger entry not used', c => { c.ledger['7-2']['99'] = 'Vanner 2011'; }],
      ['ledger source not cited in the segment', c => { c.ledger['6-2']['93'] = 'Vanner 2011'; }],
      ['citation not in REFS', c => { c.screen['5-2'].push('Smith 2020'); }],
      ['narrated speed wrong', c => { c.foot.clips.ovd1.rate = 4; }],
      ['10 s said but 15 s on the recording', c => { c.foot.clips.ovd1.events['can-in'] = 793.5; }],
      ['the remaining nucleus said 兩分多鐘 but 4 minutes', c => { c.foot.clips.emul.events['ph-out'] = 1124; }],
      ['events out of order (withdrawal before the orange reflex)', c => { c.foot.clips.moment.events.orange = 777.5; }],
      ['a footage label on a moving frame', c => { c.foot.clips.ta.points.clump[0].t = 2700; }],
      ['「一起退出」 said before the instruments move', c => { c.footOn['2-6'][2] = c.footOn['2-6'][2].map(z => ({ ...z, s: 775 })); }],
      ['「停格」 said on a moving frame', c => { c.footOn['5-4'][1] = c.footOn['5-4'][1].map(z => ({ ...z, frozen: false })); }],
      ['the orange reflex put on the right', c => { c.foot.clips.moment.points.orange[0].p = [900, 245]; }],
      ['OS drawn mirrored (main incision on the left)', c => { c.P.main.h = 1; }],
      ['the chopper drawn after the withdrawal', c => { const z = c.sync.firstAt.find(q => q.s > 779); z.cat.inst = [{ kind: 'chopper', via: 'side', p: [0, -1, 9.5] }]; }],
      ['the chamber drawn collapsing in the case', c => { c.sync.firstAt[3].cat.pcr.collapse = 1; }],
      ['the vitrector through the side port', c => { for (const z of c.sync.vitAt) for (const i of z.cat.inst || []) if (i.kind === 'vitrector') i.via = 'side'; }],
      ['an instrument pose through the iris', c => { const z = c.sync.iaAt[0]; z.cat.inst[0].p = [0, 3.6, 9.6]; for (const zz of c.sync.iaAt) zz.cat.inst[0].p = [0, 3.6, 9.6]; }],
      ['pars plana said 3.0 mm', c => { c.text['5-2'].lines[2] = c.text['5-2'].lines[2].replace('3.5–4', '3.0'); }],
      ['TA stated as certain', c => { c.text['5-5'].lines[1] = c.text['5-5'].lines[1].replace('看起來是 triamcinolone（術者推測）', '這是 triamcinolone'); }],
      ['the case judged', c => { c.text['3-3'].lines[3] += '本例應該先打 OVD。'; }],
      ['the case\'s dropped fragment narrated', c => { c.text['4-4'].lines[2] = '本例的核塊掉進玻璃體腔，轉給 VR。'; }],
    ];
    let bad = 0;
    for (const [name, mut] of M) { const c = baseCtx(); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
