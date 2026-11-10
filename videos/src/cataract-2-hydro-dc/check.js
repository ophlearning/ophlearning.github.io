// Video-level checks for video ② (run by videos/tools/check-all.js; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be in REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 錄影 (case A recording, read frame by frame).
// 2. Narration ↔ model ↔ footage: each number or claim the narration makes about the recording is checked on the footage registry
//    (anim/footage.js: events, rates, measured points), each model number on the globe model / fluidics, and the right panel's model state is
//    sampled on the page (window.CASE_AT, the same function the drawing uses) and compared with the footage events: the model follows the
//    recording (same clock hour of the hydrodissection, instruments only while they are in the eye and only through their own incision, the
//    groove deepening only while the phaco sculpts, the crack done when the halves part, every piece gone before the chopper leaves).
// --selftest breaks each check once on purpose and fails unless every check then reports the error. --list prints the numbers per segment.
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const FL = require(path.join(MD, 'fluidics.js'));
const FOOT = require('./anim/footage.js');
const { SEGS, REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const PED = { '0': '結構', '1': '結構', '2': '結構', '3': '結構' };   // the pedal positions drawn in the machine panel
const LEDGER = {
  'title': { '12': '結構', '6': '錄影', '06': '錄影' },
  '1-1': { '12': '結構', '11': '結構', '1': '結構', '0.15': '示意' },
  '1-2': { '1': '錄影', '12': '結構', '0.5': '錄影', '8': '錄影' },
  '1-3': { '2': '錄影', '3': '錄影', '12': '結構', '1': '結構', '8': '錄影', '11': '結構' },
  '1-4': { '11': '結構', '1': '結構' },
  '2-1': { ...PED, '22': 'Quesada 2022', '11': '結構', '80': '示意', '450': 'Soule 2026' },
  '3-1': { '3': '結構', '12': '結構', '1': '結構' },
  '3-2': { ...PED, '12': '錄影', '6': '錄影', '2': '錄影', '45': '錄影' },
  '3-3': { '3': '示意', '2': '示意', '1': '示意', '12': '結構', '11': '結構', '6': '錄影', '06': '錄影', '31': '錄影' },
  '3-4': { '3': '結構', '12': '結構', '1': '結構' },
  '4-1': { '12': '結構', '1': '結構' },
  '4-2': { '20': '錄影', '1.5': '錄影', '12': '結構', '1': '結構' },
  '4-3': { '90': '結構', '12': '結構', '6': '結構', '2': '錄影', '1': '結構' },
  '5-1': { ...PED, '450': 'Soule 2026', '11': '結構', '80': '示意' },
  '5-2': { '5': '錄影', '2': '錄影', '6': '錄影', '12': '結構', '1': '結構', '3': '結構', '4': '結構', '11': '錄影', '30': '錄影' },
  '5-3': { '450': 'Soule 2026', '1.6': 'Soule 2026', '2.9': 'Soule 2026', '11': '結構', '1': '結構' },
  '5-4': { '4': '錄影', '50': '錄影', '12': '結構' },
  '6-1': { ...PED, '11': '結構' },
  '6-2': { '3': '結構', '7': 'Sugar 1999', '15': 'Sugar 1999', '12': '結構', '1': '結構' },
  '6-3': { '1.2': 'Wong 2000', '2.4': 'Wong 2000', '117': 'Wong 2000', '12': '結構', '3': '錄影', '5': '錄影', '24': '錄影' },
  '7': { '3.32': 'Dooley 2006', '5': 'Dooley 2006', '66.7': 'Dooley 2006', '1.7': 'Suryawanshi 2016', '1': '結構' },
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
  // the right panel's model state every 0.5 s of source time over 5:14–10:43 (what the page draws at that moment of the recording)
  const sync = await p.evaluate(() => { const r = [];
    for (let s = 314; s <= 643.001; s += 0.5) { const z = CASE_AT(s), c = z.st.cat, n = c.nuc;
      r.push({ s, hy: z.hy ? { h: z.hy.h, prog: c.hydro ? c.hydro.prog : 0, pass: z.hy.pass } : null, inst: (c.inst || []).map(i => ({ kind: i.kind, via: i.via || 'main', h: i.at ? i.at.h : null })),
        dep: n && n.groove ? n.groove.dep : 0, crack: n && n.crack ? { prog: n.crack.prog, sep: n.crack.sep } : null, rot: n ? n.rot || 0 : 0,
        dep2: n && n.groove2 ? n.groove2.dep : 0, crack2: n && n.crack2 ? n.crack2.prog : 0, quads: n && n.quads ? n.quads.map(q => ({ q: q.q, pull: q.pull, eat: q.eat })) : [] }); }
    return r; });
  // the footage frames on screen at 10–90 % of every line of the segments whose narration says what the recording shows at that moment
  // (draw.js records every footage frame it draws in window.FOOT_SEEN; no reuse of an earlier drawing while sampling)
  const seen = await p.evaluate(ids => { window.KIT_NO_REUSE = true; const r = {};
    for (const s of TL_EXPORT) { if (!ids.includes(s.id)) continue;
      r[s.id] = s.lines.map(([a, e]) => [0.1, 0.3, 0.5, 0.7, 0.9].map(f => { window.FOOT_SEEN = []; renderAt(a + (e - a) * f); const z = window.FOOT_SEEN; window.FOOT_SEEN = null; return z; })); }
    window.KIT_NO_REUSE = false; return { seen: r, skip: window.FOOT_SKIP || {} }; }, ['3-3', '5-2']);
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return { out, sync, seen };
}

// ---------------------------------------------------------------- 2. narration ↔ model ↔ footage
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const evs = D => { const o = {}; for (const c of Object.values(D.clips)) Object.assign(o, c.events || {}); return o; };
const m12 = v => ((v % 12) + 12) % 12, dH = (a, b) => Math.abs(m12(a - b + 6) - 6);
const hourPx = (p, c) => m12(12 - Math.atan2(p[0] - c[0], p[1] - c[1]) * 180 / Math.PI / 30);
function modelChecks(ctx) {
  const P = ctx.P, D = ctx.foot, E = evs(D), R = [], ok = (c, m) => R.push([!!c, m]), S = ctx.sync;
  const lmAt = t => { const L = D.sources['case-a'].landmarks; return L.reduce((a, b) => Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a); };
  // narrated speeds = clip rates
  { const say = [['1-2', 0, 'hydro1', '放慢一半', 0.5], ['1-3', 0, 'hydro23', '加速 2 倍', 2], ['3-2', 4, 'groove-b', '加速 3 倍', 3], ['4-2', 1, 'crack1', '加速 1.5 倍', 1.5], ['4-3', 2, 'divide', '加速 2 倍', 2],
      ['5-2', 0, 'quads', '加速 5 倍', 5], ['5-4', 0, 'cleanup', '加速 4 倍', 4]];
    const bad = say.filter(([id, i, c, w, r]) => !(line(ctx, id, i).includes(w) && (D.clips[c].rate || 1) === r));
    ok(!bad.length, `narrated speeds match the clip rates (${say.length} statements${bad.length ? '; wrong: ' + bad.map(b => b[0] + ' ' + b[2]).join(', ') : ''})`); }
  // footage durations and counts said in the narration
  { const passes = Object.keys(E).filter(n => /^hydro\d-in$/.test(n)).length, ring = E['ring-full'] - E['ring-start'], sculpt = E['sculpt-end'] - E['sculpt-start'];
    const crack = E['gap-open'] - E['chopper-in'], pieces = (E['chopper-out'] - E.piece1) / 60, phaco = E['phaco-out'] - E['phaco-in'];
    ok(passes === 3 && P.hydro.length === 3 && line(ctx, '1-3', 0).includes('再進兩次') && ctx.text['1-3'].keys.some(k => k[1].includes(`<b>${passes} 次</b>`)), `hydrodissection: ${passes} cannula passes in the footage and params (narration 再進兩次 after the first, key 3 次)`);
    ok(near(ring, 1, 0.3) && line(ctx, '1-2', 1).includes('約 1 秒'), `golden ring lights up over ${f2(ring)} s (narration 約 1 秒)`);
    ok(near(sculpt, 45, 3) && line(ctx, '3-2', 2).includes('約 45 秒'), `first groove sculpted over ${f2(sculpt)} s (narration 約 45 秒)`);
    ok(near(crack, 20, 3) && line(ctx, '4-2', 1).includes('約 20 秒'), `chopper in → halves part ${f2(crack)} s (narration 約 20 秒)`);
    ok(near(pieces, 2, 0.25) && line(ctx, '5-2', 5).includes('約 2 分鐘'), `first piece → chopper out ${f2(pieces)} min (narration 約 2 分鐘)`);
    ok(near(phaco, 290, 10) && line(ctx, '5-4', 1).includes('約 4 分 50 秒'), `phaco in → out ${f2(phaco)} s (narration 約 4 分 50 秒)`);
    // order of the events of the recording
    const order = ['hydro1-in', 'tip-under-rim', 'ring-start', 'ring-full', 'hydro1-out', 'hydro2-in', 'hydro2-out', 'hydro3-in', 'hydro3-out', 'phaco-in', 'sculpt-start', 'sculpt-end', 'chopper-in', 'crack-start', 'gap-open',
      'turn-start', 'turn-end', 'groove2-start', 'groove2-end', 'crack2-start', 'crack2-end', 'piece1', 'piece2', 'piece3', 'piece4', 'chopper-out', 'phaco-out'];
    const bad = order.filter((n, i) => i > 0 && !(E[n] > E[order[i - 1]]));
    ok(!bad.length, `footage events in the order the narration tells them (${order.length})${bad.length ? '; out of order: ' + bad.join(', ') : ''}`); }
  // the hydrodissection sites: params (model) clock hour = the bearing of the cannula tip measured on the footage
  { const pts = [['hydro1', 'cannula-tip', 1], ['hydro23', 'pass2-tip', 2], ['hydro23', 'pass3-tip', 3]], bad = [];
    for (const [c, n, pass] of pts) { const q = D.clips[c].points[n][0], lm = lmAt(q.t), h = hourPx(q.p, lm.cornea), mh = P.hydro.find(x => x.pass === pass).h;
      if (dH(h, mh) > 0.6) bad.push(`pass ${pass}: footage ${h.toFixed(1)} h, model ${mh}`); }
    ok(!bad.length, `hydrodissection: the model injects at the clock hour the footage shows for all 3 passes (±0.6 h)${bad.length ? '; ' + bad.join(', ') : ''}`);
    // narration: pass 1 upper right of the picture (6–9 o'clock: 下＝12、右＝temporal 9), pass 2 lower left (12–3), pass 3 right (7.5–10.5)
    const h1 = P.hydro[0].h, h2 = P.hydro[1].h, h3 = P.hydro[2].h;
    ok(h1 > 6 && h1 < 9 && h2 > 0 && h2 < 3 && h3 > 7.5 && h3 < 10.5 && line(ctx, '1-2', 0).includes('右上方') && line(ctx, '1-3', 0).includes('左下方') && line(ctx, '1-3', 0).includes('右側'),
      `hydrodissection sites ${h1}/${h2}/${h3} o'clock = 右上方 / 左下方 / 右側 of the picture (narration)`); }
  // every label on the footage is measured on a frozen frame of its clip
  { const bad = []; for (const [id, c] of Object.entries(D.clips)) for (const [n, ks] of Object.entries(c.points || {})) for (const q of ks) {
      const frozen = (c.freeze || []).some(f => f.at === q.t), labelled = !/^(pass\d-tip|m-.+)$/.test(n); if (labelled && !frozen) bad.push(`${id}.${n}@${q.t}`); }
    ok(!bad.length, `footage labels only on frozen frames where their points were measured${bad.length ? '; not frozen: ' + bad.join(', ') : ''}`); }
  // instruments enter through their own incision: the cannula and the phaco through the main incision (bottom of the picture, 22° temporal),
  // the chopper through the side port (left of the picture: nasal); in the model, via 'main' / 'side' and the side port left of the centre
  { const e = K.enface({ st: { cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 } } }, id: 'x' }), sx = e.A.sideExt[0] - e.A.centre[0];
    const lm = lmAt(418), ch = D.clips.crack1.points['chopper-tip'][0].p, kinds = new Set(), badVia = [];
    for (const z of S) for (const i of z.inst) { kinds.add(i.kind); if ((i.kind === 'chopper') !== (i.via === 'side')) badVia.push(`${z.s}s ${i.kind} via ${i.via}`); }
    ok(sx < 0 && ch[0] < lm.cornea[0] && !badVia.length && kinds.has('cannula') && kinds.has('phaco') && kinds.has('chopper'),
      `instruments: cannula and phaco via the main incision, chopper via the side port (left in the model x ${f2(sx)} mm and in the footage, tip x ${ch[0]} < cornea ${lm.cornea[0]})${badVia.length ? '; wrong: ' + badVia.slice(0, 3).join(', ') : ''}`); }
  // the model follows the recording (sampled every 0.5 s of source time; the page's own state function)
  { const at = s => S.find(z => Math.abs(z.s - s) < 0.26), has = (z, k) => z.inst.some(i => i.kind === k), bad = [];
    for (const z of S) {
      const inPass = [1, 2, 3].find(i => z.s >= E[`hydro${i}-in`] && z.s <= E[`hydro${i}-out`]);
      if (has(z, 'cannula') !== !!inPass) bad.push(`${z.s}s cannula ${has(z, 'cannula') ? 'drawn' : 'missing'}`);
      if (inPass && (!z.hy || dH(z.hy.h, P.hydro[inPass - 1].h) > 0.01)) bad.push(`${z.s}s injection meridian`);
      if (has(z, 'phaco') !== (z.s >= E['phaco-in'] && z.s <= E['phaco-out'])) bad.push(`${z.s}s phaco ${has(z, 'phaco') ? 'drawn' : 'missing'}`);
      if (has(z, 'chopper') && !(z.s >= E['chopper-in'] && z.s <= E['chopper-out'])) bad.push(`${z.s}s chopper outside the eye`);
      if (z.s < E['sculpt-start'] && z.dep > 0) bad.push(`${z.s}s groove before sculpting`);
      if (z.crack && z.crack.sep > 0 && z.s < E['gap-open']) bad.push(`${z.s}s halves parted early`);
      if (z.quads.some(q => q.pull > 0) && z.s < E.piece1) bad.push(`${z.s}s piece moved before the footage`); }
    const r1 = at(E['ring-full']), g1 = at(E['sculpt-end'] + 1), c1 = at(E['gap-open'] + 0.5), end = at(E['chopper-out']), mono = S.every((z, i) => i === 0 || z.dep >= S[i - 1].dep - 1e-9 || z.s >= E.piece1 - 1);
    ok(!bad.length && mono, `model follows the footage at ${S.length} sampled moments: cannula only in passes, at the measured meridian; phaco and chopper only while in the eye; groove only while sculpting (monotonic); halves part after the footage's gap${bad.length ? '; ' + bad.slice(0, 4).join(', ') : ''}`);
    ok(r1 && r1.hy && near(r1.hy.prog, 1, 0.02) && g1 && near(g1.dep, P.groove.dep, 1e-6) && c1 && c1.crack && c1.crack.prog >= 0.999,
      `model at the footage's key frames: the wave complete when the golden ring is (${r1 && r1.hy ? f2(r1.hy.prog) : '—'}), groove at full depth after sculpting (${g1 ? f2(g1.dep) : '—'}), crack through when the halves part (${c1 && c1.crack ? f2(c1.crack.prog) : '—'})`);
    ok(end && end.quads.length === 4 && end.quads.every(q => q.eat >= 0.999) && new Set(end.quads.map(q => q.q)).size === 4, `every model quadrant is removed before the chopper leaves (${end ? end.quads.map(q => q.q + ':' + f2(q.eat)).join(' ') : '—'})`); }
  // the pieces (5-2): the model takes each piece out when and where the footage shows it. Which model quadrant moves at each footage piece<n>
  // event (sampled page state), that it is gone when the footage shows the red reflex where the piece was (reflex-<n>; piece 3: when piece 4
  // starts), and, where the footage position was measured (m-piece<n> against m-centre<n> on the same frame: pieces 1, 2, 4), that the measured
  // clock hour lies inside that quadrant (±1.5 h of its centre). Narration: the first piece from the 6 o'clock side.
  { const fq = D.clips.quads, at = s => S.reduce((a, b) => Math.abs(b.s - s) < Math.abs(a.s - s) ? b : a), bad = [], seen = [];
    const st0 = { cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 },
      nuc: { groove: { h: P.grooveH, dep: P.groove.dep }, crack: { prog: 1, sep: 0.5 }, groove2: { dep: P.groove.dep }, crack2: { prog: 1, sep: 0.5 }, rot: 0, quads: [] } } };
    const QD = K.nucOf(K.norm(st0)).QD, eyeH = (q, rot) => m12(QD.find(e => e.q === q).hq + rot / 30);
    const hrs = {}; for (const n of [1, 2, 4]) { const pc = fq.points[`m-piece${n}`], cc = fq.points[`m-centre${n}`]; if (pc && cc) hrs[n] = hourPx(pc[0].p, cc[0].p); }
    for (const n of [1, 2, 3, 4]) { const t0 = E[`piece${n}`], a = at(t0 - 0.5), b = at(t0 + 2), was = new Set(a.quads.filter(q => q.pull > 0 || q.eat > 0).map(q => q.q));
      const now = b.quads.filter(q => q.pull > 0 && !was.has(q.q)); if (now.length !== 1) { bad.push(`piece ${n}: ${now.length} model quadrants start at ${t0} s`); continue; }
      const q = now[0].q, tg = E[`reflex-${n}`] ?? E[`piece${n + 1}`], g = at(tg).quads.find(e => e.q === q), h = eyeH(q, b.rot); seen.push(`${n}→q${q} ${h.toFixed(1)} h${hrs[n] !== undefined ? ' (footage ' + hrs[n].toFixed(1) + ')' : ''}`);
      if (!g || g.eat < 0.999) bad.push(`piece ${n}: model quadrant ${q} not gone at ${tg} s`);
      if (hrs[n] !== undefined && dH(hrs[n], h) > 1.5) bad.push(`piece ${n}: footage ${hrs[n].toFixed(1)} h, model quadrant at ${h.toFixed(1)} h`); }
    ok(!bad.length && Object.keys(hrs).length === 3 && dH(hrs[1], 6) <= 1 && line(ctx, '5-2', 2).includes('6 點那一側'),
      `pieces: the model takes each out at the footage's piece event, gone by its reflex, inside the measured clock position (${seen.join('; ')})${bad.length ? '; ' + bad.join(', ') : ''}`); }
  // what the recording shows while the narration says it (footage frames on screen at 10–90 % of each line, sampled on the page). 5-2 plays the
  // 'quads' clip at 5× with one jump (draw.js Q_SKIP) so that the large piece is on screen while line 4 says it is pushed to the centre:
  // line 1 「停格」 = the freeze where the reflex label was measured; line 2 (the first piece, from the 6 o'clock side) = after piece 1's reflex,
  // before piece 2 starts (the caption cannot say 第 2 塊); line 3 (每拿走一塊，紅光就多露出一片) = piece 2 being taken out, up to its reflex (shown
  // at the end of the line);
  // line 4 (大塊的核由 chopper 推到中央) = piece 4 (the large piece pushed in by the chopper) up to its reflex. The jump skips only piece 3 (not
  // readable) and the note on screen gives its length. The right panel's title gives the clock hour read on the footage (pieces 1, 2, 4; piece 1 =
  // the narration's 6 o'clock). 3-3 line 2 (刻到後面，槽底那條紅色的溝越來越清楚) = the 6:06 freeze next to a frame from the last quarter of the groove.
  { const fq = D.clips.quads, Lq = i => (ctx.seen['5-2'] || [])[i] || [], sq = i => Lq(i).map(z => z.find(e => e.clip === 'quads')), bad = [];
    const all = (i, f, what) => { const z = sq(i); if (!z.length || z.some(e => !e || !f(e))) bad.push(`line ${i}: ${what} (shown ${z.map(e => e ? f2(e.s) + (e.frozen ? 'f' : '') : '—').join(' ')})`); };
    const fr = (fq.freeze || [])[0];
    all(1, e => e.frozen && fr && e.s === fr.at && fq.points.reflex[0].t === fr.at, 'frozen where the reflex label was measured');
    all(2, e => e.s >= E['reflex-1'] && e.s < E.piece2, 'after piece 1 is out, before piece 2');
    all(3, e => e.s >= E.piece2 - 1 && e.s <= E['reflex-2'] + 1, 'piece 2 being taken out (from 1 s of source before it starts)');
    all(4, e => e.s >= E.piece4 && e.s <= E['reflex-4'], 'the large piece (piece 4) pushed in and eaten');
    const k = (ctx.skip || {})['5-2'], scr = (ctx.screen['5-2'] || []).join('|'), nm = scr.match(/略過約 (\d+) 秒/);
    if (k && !(k.from >= E['reflex-2'] && k.from < E.piece3 && k.to > E.piece3 && k.to <= E.piece4)) bad.push(`the jump ${k.from}→${k.to} s is not a jump over piece 3 alone`);
    if (k && !(nm && Math.abs(+nm[1] - (k.to - k.from)) <= 2.5 && scr.includes('第 3 塊'))) bad.push(`no note giving the jump (${k ? f2(k.to - k.from) : '—'} s): ${nm ? nm[0] : 'none'}`);
    const hrs = {}; for (const n of [1, 2, 4]) hrs[n] = hourPx(fq.points[`m-piece${n}`][0].p, fq.points[`m-centre${n}`][0].p);
    const tt = [...scr.matchAll(/第 (\d) 塊原本的位置（約 (\d+) 點）/g)].map(m => [+m[1], +m[2]]);
    for (const [n, h] of tt) if (hrs[n] !== undefined && dH(h, hrs[n]) > 0.5) bad.push(`title: piece ${n} at ${h} o'clock, footage ${hrs[n].toFixed(1)}`);
    if (!tt.some(([n, h]) => n === 1 && h === 6) || !line(ctx, '5-2', 2).includes('6 點那一側')) bad.push('title of piece 1 is not 約 6 點 (narration 6 點那一側)');
    const s3 = ((ctx.seen['3-3'] || [])[2] || []), late = E['sculpt-start'] + 0.75 * (E['sculpt-end'] - E['sculpt-start']);
    if (!s3.length || s3.some(z => !z.some(e => e.clip === 'groove-a' && e.s <= 366.5) || !z.some(e => e.s >= late && e.s <= E['sculpt-end']))) bad.push(`3-3 line 2: not the 6:06 frame next to one after ${f2(late)} s`);
    ok(!bad.length && line(ctx, '5-2', 1).startsWith('停格') && line(ctx, '5-2', 4).includes('大塊的核由 chopper 推到中央') && line(ctx, '3-3', 2).includes('越來越清楚'),
      `footage on screen = narration: 5-2 lines 1–4 (freeze, after piece 1, piece 2, the large piece; one jump over piece 3 with a note), panel titles at the footage's clock hours (${tt.map(([n, h]) => n + ':' + h).join(' ')}), 3-3 line 2 early + late groove${bad.length ? '; ' + bad.slice(0, 4).join('; ') : ''}`); }
  // machine and model numbers said in the narration
  { const d41 = FL.NUM.surgeDur.venturi[0][1], d81 = FL.NUM.surgeDur.peri[1][1];
    ok(FL.NUM.advInf === 22 && line(ctx, '2-1', 4).includes('再加壓') && ctx.text['2-1'].keys.some(k => k[1].includes('22 mmHg')), `Advanced Infusion ${FL.NUM.advInf} mmHg (Quesada 2022; key 22 mmHg)`);
    ok(FL.PRESET.quad.vac === 450 && FL.NUM.vacRef === 450 && line(ctx, '5-1', 5).includes('450 mmHg') && line(ctx, '5-3', 3).includes('450 mmHg') && FL.PRESET.sculpt.vac < FL.PRESET.quad.vac,
      `quadrant vacuum ${FL.PRESET.quad.vac} mmHg (Soule 2026), above the sculpt preset ${FL.PRESET.sculpt.vac} (narration 比刻槽高得多)`);
    ok(d41.toFixed(1) === '1.6' && d81.toFixed(1) === '2.9' && line(ctx, '5-3', 3).includes('1.6 到 2.9 秒'), `surge duration ${d41}–${d81} s (Soule 2026; narration 1.6 到 2.9 秒)`);
    const s1 = FL.state({ pedal: 1, set: 'sculpt' }), s2 = FL.state({ pedal: 2, set: 'sculpt' }), s3 = FL.state({ pedal: 3, set: 'sculpt' });
    ok(s1.irr && !s1.asp && !s2.us && s2.asp && s3.us > 0 && line(ctx, '2-1', 1).includes('1 段只灌流') && line(ctx, '2-1', 2).includes('3 段再加上超音波'), 'pedal: 1 irrigation only, 2 + aspiration, 3 + ultrasound (fluidics.js = narration)');
    // groove: the plate under the floor at the three depths said (3, 2, 1 mm) exists on the model, and the full groove leaves a plate
    const GS = dep => ({ cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 }, nuc: { groove: { h: P.grooveH, dep } } } });
    const N = d => K.nucOf(K.norm(GS(d))).g1, off = N(P.groove.dep).tipA + 0.15, remAt = d => N(d).remAt(off);
    const r0 = remAt(0.0001), rf = remAt(P.groove.dep), rm = N(P.groove.dep).rem;
    ok(r0 > 3 && rf < 1.5 && rm >= 0.9 * K.CN.groove.plate && line(ctx, '3-3', 3).includes('3 mm、2 mm') && line(ctx, '3-3', 3).includes('約 1 mm'),
      `groove plate at the cross-section ${f2(r0)} → ${f2(rf)} mm (passes 3, 2, ~1 mm as narrated); thinnest plate ${f2(rm)} mm, not breached`);
    // the groove points at the main incision (sculpted from it: the ramp under the incision) and stays inside the rhexis
    const g = N(P.groove.dep);
    ok(dH(P.grooveH, P.main.h) < 1e-9 && g.prox !== 0 && g.Lh <= P.ccc.r - K.CN.groove.margin + 1e-9 && line(ctx, '3-1', 1).includes('撕囊邊緣內側'),
      `groove along the main-incision meridian (${f2(P.grooveH)} h, ramp side ${g.prox}), half-length ${f2(g.Lh)} mm inside the rhexis (${P.ccc.r} − ${K.CN.groove.margin})`); }
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(isSpecialSrc(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video, 院內常規 or 案例 A 錄影`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意'].includes(src) || (src === '院內常規' && (srcs.includes(src) || texts.join('').includes('院內常規'))) ||
        (src === '錄影' && (srcs.includes('案例 A 錄影') || texts.join('').includes('錄影')));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  // every reference is cited somewhere
  const used = new Set(SEGS.flatMap(s => (s.src || []).flatMap(x => cites(x[1]).map(c => c.who + ' ' + c.year))));
  for (const r of REFS) { const m = r.match(/^([A-Z][A-Za-zÀ-žş'\-]+)/), y = r.match(/ (\d{4});/); ok(m && y && used.has(m[1] + ' ' + y[1]), `reference 「${r.slice(0, 40)}…」 is cited in a segment`); }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { P: clone(CASE), foot: { sources: FOOT.sources, clips: clone(FOOT.clips) }, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER), sync: clone(SYNC),
    seen: clone(SEEN.seen), skip: clone(SEEN.skip) };
}
let SYNC = null, SEEN = null;
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const { out: screen, sync, seen } = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  SYNC = sync; SEEN = seen;
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in a segment/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[1] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-1'].push('裂縫 1.7 mm'); }],
      ['ledger entry not used', c => { c.ledger['5-3']['99'] = 'Soule 2026'; }],
      ['ledger source not cited in the segment', c => { c.ledger['6-2']['7'] = 'Wong 2000'; }],
      ['citation not in REFS', c => { c.screen['5-1'].push('Smith 2020'); }],
      ['narrated speed wrong', c => { c.foot.clips.quads.rate = 3; }],
      ['golden ring over 3 s', c => { c.foot.clips.hydro1.events['ring-start'] = 320.75; }],
      ['groove sculpted over 30 s', c => { c.foot.clips['groove-b'].events['sculpt-end'] = 384; }],
      ['events out of order (chopper in after the halves part)', c => { c.foot.clips.crack1.events['chopper-in'] = 418.5; }],
      ['first injection put at 2 o\'clock', c => { c.P.hydro[0].h = 2; }],
      ['a footage label on a moving frame', c => { c.foot.clips['groove-a'].points['groove-floor'][0].t = 360; }],
      ['chopper through the main incision', c => { for (const z of c.sync) for (const i of z.inst) if (i.kind === 'chopper') i.via = 'main'; }],
      ['phaco still drawn after it left', c => { const z = c.sync.find(q => q.s === 642); z.inst.push({ kind: 'phaco', via: 'main' }); }],
      ['the halves parted before the footage shows it', c => { for (const z of c.sync) if (z.s >= 410 && z.s < 417.5) z.crack = { prog: 1, sep: 0.3 }; }],
      ['a quadrant left at the end', c => { const z = c.sync.find(q => Math.abs(q.s - 587.5) < 0.26); if (z && z.quads[3]) z.quads[3].eat = 0.5; }],
      ['surge duration said 3.9 s', c => { c.text['5-3'].lines[3] = c.text['5-3'].lines[3].replace('2.9', '3.9'); }],
      ['groove not on the incision meridian', c => { c.P.grooveH = 9; }],
      ['piece 1 taken from the temporal quadrant (pieces 1 and 2 swapped)', c => { for (const z of c.sync) for (const q of z.quads) q.q = q.q === 1 ? 2 : q.q === 2 ? 1 : q.q; }],
      ['5-2 line 4 shows piece 3 again (the large piece a line late, no jump)', c => { for (const z of c.seen['5-2'][4]) for (const e of z) if (e.clip === 'quads') e.s -= 25; }],
      ['5-2 panel title says piece 1 is at 7 o\'clock', c => { c.screen['5-2'] = c.screen['5-2'].map(t => t.replace('第 1 塊原本的位置（約 6 點）', '第 1 塊原本的位置（約 7 點）')); }],
      ['3-3 line 2 shows only the 6:06 frame', c => { c.seen['3-3'][2] = c.seen['3-3'][2].map(z => z.filter(e => e.clip !== 'groove-late')); }],
      ['the jump also skips piece 4\'s start', c => { c.skip['5-2'].to = 552; }],
      ['piece 2 still there when the footage shows its reflex', c => { for (const z of c.sync) if (z.s >= 500 && z.s <= 523) { const q = z.quads.find(e => e.q === 2); if (q) q.eat = Math.min(q.eat, 0.6); } }],
    ];
    let bad = 0;
    for (const [name, mut] of M) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
