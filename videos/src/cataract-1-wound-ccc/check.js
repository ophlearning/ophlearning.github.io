// Video-level checks for video ① (run by videos/tools/check-all.js; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be in REFS;
//    every ledger source must be cited in that segment (src) or be 院內常規 / 示意 / 結構 / 錄影 (case A recording, measured).
// 2. Narration ↔ model ↔ footage: each number or spatial claim the narration makes is checked on the globe model with the case
//    parameters the drawing uses (anim/params.js) or on the footage registry (anim/footage.js: events, rates, measured points).
// --selftest breaks each check once on purpose and fails unless every check then reports the error. --list prints the numbers per segment.
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const F = require(path.join(__dirname, '..', '..', 'tools', 'video-kit', 'footage.js'));
const FOOT = require('./anim/footage.js');
const { SEGS, REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '3': '錄影', '12': '錄影' },
  '1-1': { '12': '結構', '11': '結構', '5.0': 'Hollick 1999', '5.5': 'Hollick 1999', '360': '結構', '6.0': '院內常規' },
  '1-2': { '12': '結構', '22': '錄影', '11': '錄影', '1': '錄影', '06': '錄影' },
  '2-1': { '2': '錄影', '90': '錄影', '12': '結構', '0.5': '錄影' },
  '2-2': { '3': '錄影', '2': '錄影', '12': '結構' },
  '3-1': { '2': 'Ernest 1995', '1.75': 'Ernest 1995', '2.0': 'Ernest 1995', '2.4': '院內常規', '12': '結構', '0.5': '錄影', '1': '結構' },
  '3-2': { '2.0': 'Ernest 1994', '525': 'Ernest 1994', '3.2': 'Ernest 1994', '13': 'Ernest 1994', '60': 'Masket 2007', '126': 'Sonmez 2020', '2.4': '院內常規', '12': '結構', '1': '結構' },
  '3-3': { '1': '結構' },
  '4-1': { '5.5': 'Hollick 1999', '4.5': 'Hollick 1999', '5': 'Hollick 1999', '32.7': 'Hollick 1999', '6': 'Hollick 1999', '7': 'Hollick 1999', '66.2': 'Hollick 1999', '1': '結構',
           '6.0': '院內常規', '5.0': 'Hollick 1999', '5.25': 'Hollick 1999', '360': '結構', '12': '結構', '3': '結構' },
  '4-2': { '12': '結構', '1': '結構' },
  '4-3': { '402': 'Yaguchi 2017', '0.2': 'Yaguchi 2017', '0.39': 'Yaguchi 2017', '0.4': 'Yaguchi 2017', '5': 'Fairaq 2025', '6': 'Fairaq 2025', '12': '結構' },
  '5-1': { '0.5': '錄影', '12': '結構' },
  '5-2': { '3': '錄影', '12': '結構', '1': '結構' },
  '5-3': { '4': '錄影', '12': '結構', '2': '錄影' },
  '5-4': { '12': '結構', '1': '結構' },
  '5-5': { '5': '錄影', '4': '錄影', '12': '結構', '1': '結構' },
  '5-6': { '6': '錄影', '3': '錄影', '4': '錄影', '8': '錄影', '0.5': '錄影', '12': '結構', '1': '結構' },
  '5-7': { '1': '結構', '2': '結構', '4': '結構', '5': '結構', '00': '結構', '3': '錄影', '8': '錄影' },
  '6-1': { '12': '結構', '1': '結構' },
  '6-2': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '12': '結構' },
  '6-3': { '1': '錄影', '12': '錄影' },
  '7': { '3.30': 'Dooley 2006', '5': 'Dooley 2006', '74.4': 'Dooley 2006', '4.2': 'Ferris 2020', '2.6': 'Ferris 2020', '1': 'Ferris 2020', '2': 'Ferris 2020' },
};
const SPECIAL = ['院內常規', '示意', '結構', '錄影'];
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const isSpecialSrc = s => s === '院內常規' || s === '本片各章來源' || s === '案例 A 錄影';

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
  // chapter 5: the right panel's state at every tear keyframe (and at the moments another instrument is in the eye), as the page draws it
  const sync = await p.evaluate(() => { const r = [], segOf = { pass2: '5-4', pass3: '5-5', pass4: '5-6' };
    for (const [id, c] of Object.entries(FOOTAGE_DEF.clips)) for (const q of ((c.points || {}).grasp || [])) r.push({ seg: segOf[id], s: q.t });
    for (const [seg, s] of [['5-1', 68], ['5-1', 70], ['5-3', 121], ['5-3', 124], ['5-6', 242], ['5-6', 248], ['5-6', 298], ['5-6', 299]]) r.push({ seg, s, other: 1 });
    return r.map(q => { const z = SYNC_AT(q.seg, q.s), i = (z.st.cat.inst || [])[0]; return { ...q, view: z.view, hp: z.hp, frontH: z.frontH, prog: z.prog, secSt: z.secSt, inst: i ? { kind: i.kind, via: i.via || 'main', h: i.at && i.at.h } : null }; }); });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return { out, sync };
}

// ---------------------------------------------------------------- 2. narration ↔ model ↔ footage
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const evs = D => { const o = {}; for (const c of Object.values(D.clips)) Object.assign(o, c.events || {}); return o; };
function modelChecks(ctx) {
  const P = ctx.P, D = ctx.foot, E = evs(D), R = [], ok = (c, m) => R.push([!!c, m]);
  const st = o => ({ cat: { main: { ...P.main, cut: 1 }, side: { ...P.side, cut: 1 }, ovd: 1, ...o } });
  // CCC 5.0–5.5 mm, 360° on a 6.0 mm optic by ≥ 0.25 mm (Hollick 1999 overlap, 院內 optic); the narration says the same range
  { const d = 2 * P.ccc.r;
    ok(d >= 5.0 && d <= 5.5 && P.optic / 2 - P.ccc.r >= 0.25 && line(ctx, '1-1', 4).includes('5.0 到 5.5 mm') && line(ctx, '4-1', 6).includes('5.0 到 5.5 mm') && line(ctx, '4-1', 6).includes(`${P.optic.toFixed(1)} mm`),
      `CCC ${f2(d)} mm within 5.0–5.5 and ${f2(P.optic / 2 - P.ccc.r)} mm on the ${P.optic} mm optic (narration 5.0 到 5.5 mm)`);
    // the finished rhexis edge in the microscope view lies at the same radius as in the 3 o'clock section (both views of one eye)
    const done = st({ ccc: { ...P.ccc, cut: 1, prog: 1, fold: 1, out: 1 } }), e = K.enface({ st: done, id: 'x' }), c = e.A.centre;
    const rs = [12, 6, 3, 9].map(h => e.A['edge' + h]).filter(Boolean).map(q => Math.hypot(q[0] - c[0], q[1] - c[1]));
    ok(rs.length === 4 && rs.every(r => near(r, P.ccc.r, 0.02)), `finished CCC edge in the microscope view at ${rs.map(f2).join('/')} mm from the centre (= ${P.ccc.r})`); }
  // main incision: tunnel ≈ width (square incision), chord 1.75–2.0 (Ernest 1995), 2.4 mm wide (院內常規); narration says 約 2 mm and 2.4 mm
  { const tn = K.tunnelOf(P.main);
    ok(tn.chord >= 1.75 && tn.chord <= 2.0 + 1e-9 && near(P.main.L, P.main.w, 0.5) && line(ctx, '3-1', 3).includes('隧道長約 2 mm') && line(ctx, '3-1', 3).includes(`模型用 ${P.main.w} mm`) && line(ctx, '1-1', 2).includes('長度大約等於寬度'),
      `main tunnel ${f2(tn.chord)} mm (1.75–2.0), width ${P.main.w} mm: length ≈ width (narration 約 2 mm, 2.4 mm, 長度大約等於寬度)`); }
  // main incision 22° temporal of 12: params, narration, footage landmarks (measured bearing) and the model's microscope view agree
  { const lms = D.sources['case-a'].landmarks, deg = l => Math.atan2(l.incision[0] - l.cornea[0], l.incision[1] - l.cornea[1]) * 180 / Math.PI;
    const mean = lms.reduce((a, l) => a + deg(l), 0) / lms.length, e = K.enface({ st: st({}), id: 'x' }), m = e.A.mainExt, c = e.A.centre, mdeg = Math.atan2(m[0] - c[0], m[1] - c[1]) * 180 / Math.PI;
    ok(near(mean, P.mainDeg, 2) && near(P.main.h, 12 - P.mainDeg / 30, 1e-9) && near(mdeg, P.mainDeg, 1) && line(ctx, '1-2', 1).includes(`約 ${P.mainDeg} 度`) && line(ctx, '1-2', 1).includes('11 點多'),
      `main incision: footage bearing ${f2(mean)}° (${lms.length} landmarks), model ${f2(mdeg)}° temporal (right of straight down), narration 約 ${P.mainDeg} 度 / 11 點多`); }
  // side port: nasal (left of the screen for OD, surgeon at 12), about 2 o'clock, about 90° from the main incision; footage blade on the left too
  { const e = K.enface({ st: st({}), id: 'x' }), s = e.A.sideExt, c = e.A.centre, gap = (((P.side.h - P.main.h) % 12) + 12) % 12 * 30;
    const clip = D.clips.sideport, lm = D.sources['case-a'].landmarks.find(l => l.t >= clip.in && l.t <= clip.out), tip = clip.points['blade-tip'][0].p;
    ok(P.side.h > 1 && P.side.h < 3 && Math.round(P.side.h) === 2 && s[0] < c[0] && near(gap, 90, 10) && tip[0] < lm.cornea[0] &&
      line(ctx, '2-1', 1).includes('約在 2 點') && line(ctx, '2-1', 1).includes('差 90 度') && line(ctx, '1-1', 1).includes('左手那側') && line(ctx, '1-1', 1).includes('nasal'),
      `side port at ${f2(P.side.h)} o'clock, left of the centre in the model (x ${f2(s[0])}) and in the footage (blade tip x ${tip[0]} < cornea ${lm.cornea[0]}), ${f2(gap)}° from the main incision (narration 約在 2 點, 差 90 度, 左手, nasal)`); }
  // CCC direction: counter-clockwise as the surgeon sees it (dir −1): the tear front moves counter-clockwise on the microscope view
  { const at = p => { const e = K.enface({ st: st({ ccc: { ...P.ccc, cut: 1, prog: p, fold: 1 } }), id: 'x' }); return [e.A.front[0] - e.A.centre[0], e.A.front[1] - e.A.centre[1]]; };
    const a = at(0.30), b = at(0.36), cr = a[0] * b[1] - a[1] * b[0];   // screen y down: counter-clockwise ⇔ cross < 0
    ok(P.ccc.dir === -1 && cr < 0 && line(ctx, '5-4', 1).includes('逆時針'), `tear front turns ${cr < 0 ? 'counter-clockwise' : 'clockwise'} on the microscope view (dir ${P.ccc.dir}; narration 逆時針)`); }
  // the section of the synced panels passes through the main incision (the drawing uses plane h = main.h + 6)
  { const hp = (P.main.h + 6) % 12, r = K.section({ st: st({}), h: hp, win: { x: -8.6, y: -14.5, w: 17.2, h: 11.6 }, step: 0.2, id: 'x' });
    ok(!!r.A.mainExt && r.A.mainExt[0] < 0, `section at ${f2(hp)} o'clock contains the main incision, on the left (u ${r.A.mainExt ? f2(r.A.mainExt[0]) : '—'})`); }
  // footage counts said in the narration: 4 passes, 8 grasps (3 + 4 within pass 3 …), 3 OVD refills, about 4 minutes
  { const passes = Object.keys(E).filter(n => /^pass\d-in$/.test(n)).length, grasps = Object.keys(E).filter(n => /^grasp-\d+$/.test(n)).length, ovds = Object.keys(E).filter(n => /^ovd-refill-\d+$/.test(n)).length;
    const g3 = Object.keys(E).filter(n => /^grasp-\d+$/.test(n) && E[n] >= E['pass3-in'] && E[n] <= E['pass3-out']).length, mins = (E['flap-out-end'] - E['pinch']) / 60;
    const s6 = line(ctx, '5-6', 3);
    ok(passes === 4 && s6.includes(`鉗子進出 ${passes} 次`) && s6.includes(`夾瓣 ${grasps} 次`) && s6.includes(`補 OVD ${ovds} 次`) && line(ctx, '2-2', 3).includes(`補了 ${ovds} 次`) && s6.includes(`約 ${Math.round(mins)} 分鐘`),
      `footage: ${passes} passes, ${grasps} grasps, ${ovds} OVD refills, ${f2(mins)} min from the pinch to the flap out (narration 5-6, 2-2)`);
    ok(line(ctx, '5-5', 1).includes(`重新夾了 ${g3} 次`), `pass 3 has ${g3} grasps (narration 重新夾了 4 次)`);
    // every pass starts with a grasp, the pinch comes before the first grasp, refills fall between passes (the forceps are out)
    const P4 = [1, 2, 3, 4].map(i => [E[`pass${i}-in`], E[`pass${i}-out`]]), inside = t => P4.some(([a, b]) => t > a && t < b);
    ok(P4.every(([a, b], i) => b > a && (i === 0 || a > P4[i - 1][1])) && Object.keys(E).filter(n => /^ovd-refill-\d+$/.test(n)).every(n => !inside(E[n])) && E.pinch < E['grasp-1'],
      'passes in order, OVD refills only while the forceps are out, the pinch before the first grasp'); }
  // speeds said in the narration = clip rates
  { const say = [['2-1', 0, 'sideport', '放慢一半', 0.5], ['3-1', 0, 'keratome', '放慢一半', 0.5], ['5-1', 1, 'pinch', '放慢一半', 0.5], ['5-2', 0, 'pass1', '加速 3 倍', 3], ['5-3', 0, 'gap1', '加速 4 倍', 4],
      ['5-5', 1, 'pass3', '加速 5 倍', 5], ['5-6', 1, 'gap3', '加速 6 倍', 6], ['5-6', 1, 'pass4', '加速 6 倍', 6], ['5-6', 2, 'flap', '放慢一半', 0.5]];
    const bad = say.filter(([id, i, c, w, r]) => !(line(ctx, id, i).includes(w) && (D.clips[c].rate || 1) === r));
    ok(!bad.length, `narrated speeds match the clip rates (${say.length} statements${bad.length ? '; wrong: ' + bad.map(b => b[0] + ' ' + b[2]).join(', ') : ''})`); }
  // the wrinkle cue is labelled only on a frame inside the wrinkle window (measured), the regrasp label on the frozen regrasp frame
  { const pc = D.clips.pinch, w = pc.points.wrinkle[0].t, pr = D.clips.pass2;
    ok(w >= E.wrinkles && w <= E['wrinkles-gone'] && pc.freeze[0].at === w && pr.freeze[0].at === E['grasp-3'] && pr.points['regrasp-tips'][0].t === E['grasp-3'],
      `wrinkle label measured at ${w} s inside ${E.wrinkles}–${E['wrinkles-gone']} s (frozen); regrasp label on the frozen ${E['grasp-3']} s frame`); }
  // chapter 5 sync (2026-11-09): the footage keyframes (forceps jaws and cornea centre, source px) → clock hour of the forceps; the tear front
  // reconstructed from them (the forceps hold the folded flap = the torn arc mirrored about the front, so front φ ≥ ½ grasp φ; front at that
  // bound, never back; pass1End before pass 2; complete at pass4-out). Re-implemented here and compared with what the page draws (SYNC_AT).
  { const cc = P.ccc, m12 = v => ((v % 12) + 12) % 12, dH = (a, b) => Math.abs(m12(a - b + 6) - 6);
    const hourPx = (p, c) => m12(12 - Math.atan2(p[0] - c[0], p[1] - c[1]) * 180 / Math.PI / 30);
    const keys = []; for (const c of Object.values(D.clips)) { const g = (c.points || {}).grasp, k = (c.points || {}).cornea; if (g) g.forEach((q, i) => keys.push({ s: q.t, h: hourPx(q.p, k[i].p) })); }
    keys.sort((a, b) => a.s - b.s); let prev = null, M = 0;
    for (const q of keys) { const r = m12(cc.dir * (q.h - cc.h0)); q.g = prev === null ? r : prev + (m12(r - prev + 6) - 6); prev = q.g; M = Math.max(M, q.g); q.f = Math.max(P.pass1End, M / 2); q.fh = m12(cc.h0 + cc.dir * q.f); }
    const page = s => ctx.sync.find(z => z.s === s && !z.other), bad = [], badF = [], badV = [], badFold = [];
    for (const q of keys) { const z = page(q.s);
      if (!z || !z.inst || z.inst.kind !== 'forceps' || dH(z.inst.h, q.h) > 0.5) bad.push(`${q.s}s footage ${q.h.toFixed(1)} h, model ${z && z.inst ? (+z.inst.h).toFixed(1) : '—'}`);
      if (!z || z.frontH === null || dH(z.frontH, q.fh) > 0.5) badF.push(`${q.s}s expected ${q.fh.toFixed(1)} h, model ${z && z.frontH !== null ? z.frontH.toFixed(1) : '—'}`);
      if (!z || z.view !== 'tear' || dH(z.hp, z.frontH) > 0.5 || (z.secSt.cat.inst || []).length) badV.push(`${q.s}s ${z ? z.view : '—'}`);
      if (!(q.f <= q.g + 0.3 && q.g <= 2 * q.f + 0.3)) badFold.push(`${q.s}s grasp φ ${q.g.toFixed(1)}, front φ ${q.f.toFixed(1)}`); }
    ok(keys.length >= 40 && !bad.length, `chapter 5: at all ${keys.length} tear keyframes the model's forceps sit at the footage's clock hour (±0.5 h)${bad.length ? '; off: ' + bad.slice(0, 4).join(', ') : ''}`);
    ok(!badF.length, `chapter 5: the model's tear front at every keyframe is the front reconstructed from the footage (±0.5 h)${badF.length ? '; off: ' + badF.slice(0, 4).join(', ') : ''}`);
    ok(!badV.length, `chapter 5: while the forceps tear the right panel is the section through the front (±0.5 h) and draws no instrument${badV.length ? '; wrong: ' + badV.slice(0, 4).join(', ') : ''}`);
    ok(!badFold.length, `chapter 5: every grasp lies on the folded flap (front φ ≤ grasp φ ≤ 2 × front φ)${badFold.length ? '; off: ' + badFold.slice(0, 3).join(', ') : ''}`);
    // narration: pass 2 tears to the right (temporal, 9 o'clock side); pass 3 goes on; pass 4 finishes and the front meets the start
    const at = s => { const r = keys.filter(q => q.s <= s); return r.length ? r[r.length - 1] : null; }, e2 = at(E['pass2-out']), e3 = at(E['pass3-out']);
    const end = ctx.sync.filter(z => !z.other && z.s >= E['pass4-in']).slice(-1)[0];
    ok(e2 && e2.fh >= 8 && e2.fh <= 10.5 && e3 && e3.f >= e2.f + 1 && e3.f < 11.5 && line(ctx, '5-4', 0).includes('撕到右側') && line(ctx, '5-6', 1).includes('接回起點'),
      `chapter 5: front at the end of pass 2 at ${e2 ? e2.fh.toFixed(1) : '—'} h (temporal, narration 撕到右側), end of pass 3 ${e3 ? e3.fh.toFixed(1) : '—'} h (not complete; pass 4 接回起點)`);
    // other instruments: OVD through the side port → side-port section, through the main incision / flap out / pinch → main-incision section,
    // and the section contains the tunnel the instrument goes through (it enters through its incision in the drawing)
    const oth = ctx.sync.filter(z => z.other), badI = [];
    for (const z of oth) { if (!z.inst) { badI.push(`${z.seg} ${z.s}s no instrument`); continue; }
      const want = z.inst.via === 'side' ? 'side' : 'main', r = z.view === want ? K.section({ st: z.secSt, h: z.hp, win: { x: -8.6, y: -14.5, w: 17.2, h: 11.6 }, step: 0.25, id: 'x' }) : null;
      if (!r || !r.A[want + 'Pivot'] || !r.A.tip0) badI.push(`${z.seg} ${z.s}s ${z.inst.kind} via ${z.inst.via} in the ${z.view} section`); }
    ok(oth.length >= 8 && !badI.length, `chapter 5: ${oth.length} moments with the pinching forceps, the cannula or the flap out: each section passes through the incision that instrument uses${badI.length ? '; wrong: ' + badI.join(', ') : ''}`);
    // the freeze-frame regrasp label points at the measured jaws (the grasp keyframe on that frame)
    const rg = D.clips.pass2.points['regrasp-tips'][0], gk = D.clips.pass2.points.grasp.find(q => q.t === rg.t);
    ok(gk && Math.hypot(gk.p[0] - rg.p[0], gk.p[1] - rg.p[1]) <= 3 && rg.t === E['grasp-3'], `regrasp label at the jaws measured on the frozen ${rg.t} s frame (grasp keyframe ${gk ? gk.p.join(', ') : '—'})`); }
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
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[1] += '3.3 mm'; }],
      ['on-screen number without a source', c => { c.screen['4-2'].push('前緣 1.7 mm'); }],
      ['ledger entry not used', c => { c.ledger['3-2']['99'] = 'Ernest 1994'; }],
      ['ledger source not cited in the segment', c => { c.ledger['3-2']['60'] = 'Hollick 1999'; }],
      ['citation not in REFS', c => { c.screen['4-1'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '3-2').src[0][1] = 'Ernest 1996'; }],
      ['CCC 6 mm', c => { c.P.ccc.r = 3.0; }],
      ['tunnel 2.6 mm', c => { c.P.main.L = 2.6; }],
      ['main incision at 12', c => { c.P.main.h = 12; }],
      ['side port temporal', c => { c.P.side.h = 10; }],
      ['clockwise CCC', c => { c.P.ccc.dir = 1; }],
      ['one grasp fewer', c => { delete c.foot.clips.pass3.events['grasp-7']; }],
      ['OVD refill during a pass', c => { c.foot.clips.pass3.events['ovd-refill-2'] = 200; }],
      ['narrated speed wrong', c => { c.foot.clips.pass1.rate = 2; }],
      ['wrinkle label outside the window', c => { c.foot.clips.pinch.points.wrinkle[0].t = 76; }],
      ['narration count wrong', c => { c.text['5-6'].lines[3] = c.text['5-6'].lines[3].replace('夾瓣 8 次', '夾瓣 6 次'); }],
      ['a grasp keyframe on the other side of the pupil', c => { const q = c.foot.clips.pass3.points.grasp[8], k = c.foot.clips.pass3.points.cornea[8]; q.p = [2 * k.p[0] - q.p[0], 2 * k.p[1] - q.p[1]]; }],
      ['tear progress spread over the passes by time (the old drawing)', c => { const old = [[74.3, 0], [107.5, 0.06], [134, 0.06], [160.5, 0.5], [184, 0.5], [231.5, 0.88], [273.5, 0.88], [295, 1]];
        const pw = s => { for (let i = 1; i < old.length; i++) if (s <= old[i][0]) { const [a, va] = old[i - 1], [b, vb] = old[i]; return va + (vb - va) * Math.max(0, Math.min(1, (s - a) / (b - a))); } return 1; };
        for (const z of c.sync) if (!z.other) z.frontH = (((c.P.ccc.h0 + c.P.ccc.dir * 12 * pw(z.s)) % 12) + 12) % 12; }],
      ['the OVD through the side port drawn in the main-incision section', c => { for (const z of c.sync) if (z.seg === '5-3') { z.view = 'main'; z.hp = (c.P.main.h + 6) % 12; } }],
      ['regrasp label off the jaws', c => { c.foot.clips.pass2.points['regrasp-tips'][0].p = [510, 448]; }],
    ];
    let bad = 0;
    for (const [name, mut] of M) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
