// Scleral-tunnel cataract video — video checks run by videos/tools/check-all.js (in this folder; or: node check.js [--list]).
// 1. Number ledger: every number in the narration, key-point boxes, titles and every text drawn on screen (each drawn segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every ledger source must be cited in that segment
//    (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, the OP note confirmed by 站長 2026-11-26; 結構 = clock hours, list
//    numbers, scale bars); every「作者 年份」shown or cited must be in REFS, and every reference cited somewhere; a ledger number that is not
//    used fails too (結構 excepted). The print sheets (print/) read this LEDGER as text (videos/tools/print/numcheck.js).
// 2. Case geometry (C…, on anim/params.js and the globe model): the tunnel the narration describes (outer opening 1–2 mm behind the limbus,
//    lip ≈ 1.5 mm in clear cornea, inside the wall), the 2.65 mm keratome, the surgeon at 1–2 o'clock with the incision in front, the side port
//    on the surgeon's left. Narration ↔ drawing checks (M…) on window.SYNC, added chapter by chapter (spec.md 進度): 片頭 and chapters 1–3 so far
//    (outer / inner opening and lip in the 1-1 section, read back from the drawn panel points; both openings vs the limbus in the microscope;
//    bars in proportion; the microscope's orientation in 2-1 and the orientation map; the radial suture of the title; 2-2 the 15° blade through
//    the side port and the conjunctiva the same in both views; chapter 3 the keratome: in through the outer opening 1.5 mm behind the limbus,
//    partial thickness, flat, only along the tunnel, into the chamber only in 3-3 through the inner opening, the same point in both views; the lip
//    dimension; the pressure arrows; Ernest's incisions in proportion). Blade positions are read from every frame the page drew (SYNC[id].track).
//    Chapters 4–5 (M19–M27): the too-shallow path comes out through the roof between the outer opening and the limbus, the deeper plane is deeper
//    and inside the wall, the buttonhole at the same place in the microscope; the early inner opening near the limbus (not clear cornea), the
//    prolapsed iris through it and out of the outer opening; the percentage bars in proportion; the CCC 5.0–5.5 mm and centred; phaco's path
//    through the scleral tunnel into the lens inside the rhexis; the IOL centred in the bag; the decentred optic 0.75 mm off.
// 3. Self-test (every run): each check is broken once on purpose (a mutation) and must then fail; a mutation not caught fails the run.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const { SEGS, REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const CLK = { '12': '結構', '6': '結構', '3': '結構', '9': '結構', '1': '結構', '2': '結構' };   // clock hours (the microscope panel's 約 1–2 點)
const SB = { '1': '結構' };                                   // the 1 mm scale bar of the sections
const LEDGER = {
  'title': { ...CLK, '2.65': '病例', '10-0': '病例' },
  '1-1': { ...CLK, '1': 'Goel 2022', '2': 'Goel 2022' },
  '1-2': { ...CLK, ...SB, '3.5': 'Olsen 1997', '4.0': 'Olsen 1997', '6': 'Olsen 1997', '0.72': 'Olsen 1997', '0.36': 'Olsen 1997', '3.0': 'Hayashi 2010', '2.0': 'Hayashi 2010', '5.88': 'ESCRS 2007' },
  '2-1': { ...CLK, '1': '病例', '2': '病例' },
  '2-2': { ...CLK, ...SB, '15': '病例' },
  '3-1': { ...CLK, '2.65': '病例', '1': 'Goel 2022', '2': 'Goel 2022', '1.5': '示意' },
  '3-2': { ...CLK, ...SB, '1.5': 'Ernest 1994' },
  '3-3': { ...CLK, ...SB, '3.2': 'Ernest 1994', '1.5': 'Ernest 1994', '525': 'Ernest 1994', '2.0': 'Ernest 1994', '13': 'Ernest 1994' },
  '4-1': { ...CLK, ...SB, '339': 'Subudhi 2021', '12.6': 'Subudhi 2021' },
  '4-2': { ...CLK, '339': 'Subudhi 2021', '10.6': 'Subudhi 2021', '1': 'John 1992', '34': 'John 1992', '6': 'John 1992' },
  '5-1': { ...CLK, ...SB, '5.0': 'Hollick 1999', '5.5': 'Hollick 1999' },
  '5-2': { ...CLK, ...SB, '6.5': '病例', '4.0': 'Ye 2021', '0.75': 'Soda 2012' },
  '6-1': { ...CLK, ...SB },
  '6-2': { ...CLK, '10-0': '病例', '4': 'Azar 1997', '8': 'Azar 1997' },
  '6-3': { ...CLK, '1': 'ESCRS 2007', '0.1': 'ESCRS 2007', '4.92': 'ESCRS 2007' },
  '7': { ...CLK, '1': 'Goel 2022', '2': 'Goel 2022', '1.5': 'Ernest 1994' },
};
const FREE = ['病例', '結構', '示意', '院內常規'];
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who + ' ') && new RegExp('\\b' + c.year + '[;:(]').test(r));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const strip = t => String(t).replace(/<[^>]+>/g, '');

async function fromPage() {   // all text drawn on screen per drawn segment (60 % and 98 % of every line), and window.SYNC
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const out = await p.evaluate(() => { const r = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add([...t.childNodes].map(n => n.textContent).join(' ')); }   // tspans joined with a space (「LI」「7 點」)
      r[s.id] = [...set]; }
    return { screen: r, sync: window.SYNC }; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const L = ctx.ledger[sg.id]; if (!L) { ok(false, `${sg.id}: has a ledger entry`); continue; }
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => strip(k[1])), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1]));
    for (const s of srcs) ok(s === '本片各章來源' || FREE.includes(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 shown is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      if (src === '結構' && !found.has(n)) continue;   // clock hours and list numbers: listed for every segment, used where they are drawn
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      ok(srcs.some(s => s.includes(src)) || FREE.includes(src), `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  const all = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).join(' ');
  for (const r of REFS) { const who = r.split(' ')[0], yr = (r.match(/ (\d{4});/) || [])[1]; ok(all.includes(`${who} ${yr}`), `reference ${who} ${yr} is cited in some segment`); }
  return R;
}

// ---------------------------------------------------------------- 2. case geometry (C) and narration ↔ drawing (M, on window.SYNC)
const tnOf = cfg => K.tunnelOf(cfg);
const CASE_CHECKS = [
  (ctx, ok) => { const tn = tnOf(ctx.case.main); ok('C1', tn.sE >= 1 && tn.sE <= 2, `outer opening ${tn.sE.toFixed(2)} mm behind the limbus (narration 1–2 mm, Goel 2022)`); },
  (ctx, ok) => { const tn = tnOf(ctx.case.main); ok('C2', Math.abs(-tn.sI - 1.5) <= 0.1, `inner opening ${(-tn.sI).toFixed(2)} mm into clear cornea (narration: lip about 1.5 mm, Ernest 1994)`); },
  (ctx, ok) => { const tn = tnOf(ctx.case.main);   // every inner point of the tunnel between the outer and the inner surface at its own s
    const inside = tn.pts.slice(1, -1).every(([rho, z]) => { let best = 1e9, sd = null;
      for (let s = tn.sI - 0.3; s <= tn.sE + 0.3; s += 0.005) { const f = G.surfAt(s), d = (f.rho - rho) * f.nr + (f.z - z) * f.nz, off = Math.hypot(f.rho - f.nr * d - rho, f.z - f.nz * d - z);
        if (off < best) { best = off; sd = [s, d]; } } return sd && sd[1] > 0 && sd[1] < G.T(sd[0]); });
    ok('C3', inside, 'the tunnel runs inside the wall (between the outer and the inner surface)'); },
  (ctx, ok) => ok('C4', ctx.case.main.w === 2.65, `main incision ${ctx.case.main.w} mm = the 2.65 mm keratome (病例)`),
  (ctx, ok) => { const c = ctx.case; ok('C5', c.surgeon >= 1 && c.surgeon <= 2 && Math.abs(c.main.h - c.surgeon) < 1e-9, `surgeon at ${c.surgeon} o'clock (narration 1–2) with the main incision in front of him (upper-temporal of OS)`); },
  (ctx, ok) => { const c = ctx.case, lh = ((c.side.h - c.surgeon) % 12 + 12) % 12; ok('C6', lh > 0 && lh < 6, `side port on the surgeon's left (${lh.toFixed(1)} h clockwise of the surgeon's hour as the examiner sees it)`); },
];
// M…: narration ↔ drawing on window.SYNC (draw.js writes the panel points it drew; added chapter by chapter)
// a panel point of a section back to wall coordinates (s mm from the limbus along the outer surface, d mm deep): px → plane mm → (rho, z)
const sdOfPx = (S, px) => { const u = px[0] / S.k + S.win.x, v = px[1] / S.k + S.win.y, rho = Math.abs(u), z = -v; let best = 1e9, r = null;
  for (let s = -4; s <= 4; s += 0.002) { const f = G.surfAt(s), d = (f.rho - rho) * f.nr + (f.z - z) * f.nz, off = Math.hypot(f.rho - f.nr * d - rho, f.z - f.nz * d - z);
    if (off < best) { best = off; r = [s, d]; } } return r; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const clockOf = (c, p) => { const a = Math.atan2(p[0] - c[0], -(p[1] - c[1])) * 6 / Math.PI; return (a + 12) % 12; };   // examiner's clock hour of p around c (screen: 12 up, 3 right)
const need = (ctx, id) => ctx.sync[id] || (() => { throw new Error(`${id} wrote no window.SYNC`); })();
const MODEL_CHECKS = [
  (ctx, ok) => { const S = need(ctx, '1-1'), e = sdOfPx(S, S.ext), l = sdOfPx(S, S.limbus);
    ok('M1', e[0] >= 1 && e[0] <= 2 && Math.abs(e[1]) < 0.05 && Math.abs(l[0]) < 0.05 && Math.abs(l[1]) < 0.05,
      `1-1 section: outer opening drawn ${e[0].toFixed(2)} mm behind the limbus, on the outer surface (narration 1–2 mm, Goel 2022)`); },
  (ctx, ok) => { const S = need(ctx, '1-1'), i = sdOfPx(S, S.int), a = sdOfPx(S, S.lip[0]);
    ok('M2', i[0] <= -1 && i[0] >= -2 && Math.abs(-i[0] - 1.5) <= 0.1 && Math.abs(i[1] - G.T(i[0])) < 0.05 && Math.abs(a[0]) < 0.05 && dist(S.lip[1], S.int) < 1,
      `1-1 section: inner opening drawn ${(-i[0]).toFixed(2)} mm into clear cornea, on the inner surface; the internal corneal lip drawn from under the limbus (s ${a[0].toFixed(2)}) to it (narration 1–2 mm; lip ≈ 1.5 mm, Ernest 1994)`); },
  (ctx, ok) => { const S = need(ctx, '1-1'), s = p => sdOfPx(S, p)[0], e = s(S.ext), i = s(S.int);
    ok('M3', Math.abs(s(S.dimO[0])) < 0.05 && Math.abs(s(S.dimO[1]) - e) < 0.05 && Math.abs(s(S.dimI[0])) < 0.05 && Math.abs(s(S.dimI[1]) - i) < 0.05,
      `1-1 section: the two 「1–2 mm」 dimension lines span limbus → outer opening (${s(S.dimO[1]).toFixed(2)} mm) and limbus → over the inner opening (${Math.abs(s(S.dimI[1])).toFixed(2)} mm)`); },
  (ctx, ok) => { const S = need(ctx, '1-1').scope, r = p => dist(p, S.centre);
    ok('M4', r(S.scleral) > S.limbusR && r(S.cci) < S.limbusR && [S.scleral, S.cci].every(p => Math.abs(p[0] - S.centre[0]) < 1 && p[1] > S.centre[1]),
      `1-1 microscope: scleral outer opening ${((r(S.scleral) - S.limbusR) / S.k).toFixed(2)} mm outside the limbus circle, clear corneal ${((S.limbusR - r(S.cci)) / S.k).toFixed(2)} mm inside it, both straight below the centre (main incision at the bottom)`); },
  (ctx, ok) => { const S = need(ctx, '1-2'), a = S.bars.corneal / S.bars.scleral, b = S.escrs.corneal / S.escrs.scleral;
    ok('M5', Math.abs(a / (0.72 / 0.36) - 1) < 0.01 && Math.abs(b / 5.88 - 1) < 0.01,
      `1-2: bar lengths in proportion — SIA corneal / scleral ${a.toFixed(3)} (0.72 / 0.36 D, Olsen 1997), endophthalmitis clear corneal / scleral ${b.toFixed(2)} (5.88, ESCRS 2007)`); },
  (ctx, ok) => { const S = need(ctx, '2-1'), d = [S.main[0] - S.centre[0], S.main[1] - S.centre[1]];
    ok('M6', Math.abs(d[0]) < 1 && d[1] > S.limbusR, `2-1 microscope: main incision straight below the centre (${d[0].toFixed(1)} px sideways), ${((d[1] - S.limbusR) / S.k).toFixed(2)} mm outside the limbus circle (narration: 畫面正下方)`); },
  (ctx, ok) => { const S = need(ctx, '2-1'), t = [S.temporal[0] - S.centre[0], S.temporal[1] - S.centre[1]], n = [S.nasal[0] - S.centre[0], S.nasal[1] - S.centre[1]];
    ok('M7', t[0] < 0 && t[1] > 0 && n[0] > 0 && n[1] < 0, `2-1 microscope: 3 o'clock temporal at the lower left, 9 o'clock nasal at the upper right (narration, OS)`); },
  (ctx, ok) => { const S = need(ctx, '2-1');
    ok('M8', S.side[0] < S.centre[0], `2-1 microscope: side port in the left half (${(S.side[0] - S.centre[0]).toFixed(0)} px; narration: 術者左手那側)`); },
  (ctx, ok) => { const m = need(ctx, '2-1').map, hS = clockOf(m.centre, m.surgeon), hM = clockOf(m.centre, m.main), f = [m.centre[0] - m.surgeon[0], m.centre[1] - m.surgeon[1]], left = [f[1], -f[0]];
    const onLeft = (m.side[0] - m.surgeon[0]) * left[0] + (m.side[1] - m.surgeon[1]) * left[1] > 0;
    ok('M9', hS >= 1 && hS <= 2 && Math.abs(hM - hS) < 0.25 && m.temporal[0] > m.centre[0] && m.nasal[0] < m.centre[0] && onLeft,
      `2-1 map (examiner's view of the OS): surgeon at ${hS.toFixed(2)} o'clock (narration 約 1–2 點), main incision at ${hM.toFixed(2)}, temporal on the right (3 點), side port on the surgeon's left`); },
  (ctx, ok) => { const S = need(ctx, 'title'), [a, b] = S.mouth, [p, q] = S.suture, u = [b[0] - a[0], b[1] - a[1]], v = [q[0] - p[0], q[1] - p[1]];
    const ang = Math.acos(Math.abs(u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v)) * 180 / Math.PI;
    const side = (o, x, y) => Math.sign((y[0] - x[0]) * (o[1] - x[1]) - (y[1] - x[1]) * (o[0] - x[0])), crosses = side(p, a, b) !== side(q, a, b) && side(a, p, q) !== side(b, p, q);
    ok('M10', crosses && ang > 87, `片頭 microscope: the 10-0 nylon crosses the outer opening at ${ang.toFixed(1)}° (radial)`); },
  (ctx, ok) => { const S = need(ctx, '2-2'), sd = S.side, tr = Object.values(S.track), on = tr.filter(t => t.op > 0.5), sI = K.tunnelOf(ctx.case.side).sI;
    const inAC = t => { const [s, d] = sdOfPx(sd, t.tip); return s < sI && d > G.T(s) + 0.02; }, ang = (c, p) => Math.atan2(p[0] - c[0], -(p[1] - c[1]));
    const plane = Math.abs(((sd.hp + 6) % 12) - ctx.case.side.h) < 1e-9, via = on.length > 0 && on.every(t => t.via === 'side' && Math.abs(t.h - ctx.case.side.h) < 1e-9);
    const scopeOK = on.every(t => Math.abs(ang(t.cS, t.tipS) - ang(t.cS, t.sideS)) < 0.02), gone = tr.filter(t => t.sw > 0).every(t => t.op === 0);
    ok('M11', plane && via && on.some(inAC) && scopeOK && gone, `2-2: the 15° blade drawn in the section through the side port (left = ${ctx.case.side.h} o'clock), through the side port's tunnel, its tip in the chamber past the inner opening (${on.filter(inAC).length} frames), on the side port's meridian in the microscope, gone before the conjunctiva`); },
  (ctx, ok) => { const S = need(ctx, '2-2'), m = S.main, c = S.conj, sOf = p => sOfRho(dist(p, c.centre) / c.k), a = p => Math.atan2(p[0] - c.centre[0], p[1] - c.centre[1]) * 180 / Math.PI;
    const sCut = sOf(c.cutMid), sBack = sOf(c.backMid), back = 0.25 + (7.2 - 0.25) * m.peri;   // globe.js: st.peri360 ends the conjunctiva at lerp(0.25, 7.2, peri360)
    const caut = c.caut.length > 0 && c.caut.every(p => sOf(p) > sCut && sOf(p) < sBack && Math.abs(a(p)) < 22.5);
    ok('M12', Math.abs(((m.hp + 6) % 12) - ctx.case.main.h) < 1e-9 && Math.abs(sCut - 0.25) < 0.05 && Math.abs(a(c.cutMid)) < 0.5 && Math.abs(sBack - back) < 0.05 && caut,
      `2-2: conjunctiva cut along the limbus (s ${sCut.toFixed(2)}) centred on the main incision, rolled back to ${sBack.toFixed(2)} mm in the microscope = ${back.toFixed(2)} mm in the section through the main incision; cautery points on the bare sclera`); },
  (ctx, ok) => { const S = need(ctx, '3-1'), e = sdOfPx(S, S.ext), l = sdOfPx(S, S.limbus), s = p => sdOfPx(S, p)[0], tr = Object.values(S.track).filter(t => t.op > 0.5 && t.adv >= 0);
    const dep = tr.map(t => { const [ss, dd] = sdOfPx(S, t.tip); return dd / G.T(ss); }), last = tr.reduce((a, t) => t.adv > a.adv ? t : a, tr[0]);
    ok('M13', Math.abs(e[0] - 1.5) < 0.05 && Math.abs(e[1]) < 0.05 && Math.abs(l[0]) < 0.05 && Math.abs(l[1]) < 0.05 && S.dimOn > 0.99 && Math.abs(s(S.dim[0])) < 0.05 && Math.abs(s(S.dim[1]) - e[0]) < 0.05 &&
      Math.max(...dep) > 0.2 && Math.max(...dep) < 0.8 && angSurf(S, last) < 10,
      `3-1 section: outer opening drawn ${e[0].toFixed(2)} mm behind the limbus (narration 1–2, drawn 1.5 示意) with its dimension line; the cut reaches ${(100 * Math.max(...dep)).toFixed(0)} % of the wall (partial thickness); then the blade lies at ${angSurf(S, last).toFixed(1)}° to the surface (flat)`); },
  (ctx, ok) => { const S = need(ctx, '3-2'), s = p => sdOfPx(S, p)[0], len = s(S.dim[0]) - s(S.dim[1]), tr = Object.values(S.track).filter(t => t.op > 0.5), sd = tr.map(t => sdOfPx(S, t.tip));
    const flat = Math.max(...tr.map(t => angSurf(S, t)));
    ok('M14', S.dimOn > 0.99 && Math.abs(s(S.dim[0])) < 0.05 && Math.abs(s(S.dim[1]) - s(S.int)) < 0.05 && Math.abs(len - 1.5) <= 0.1 && flat < 10 &&
      sd.every(([ss, dd]) => dd > 0 && dd < G.T(ss)) && sd.some(x => x[0] > 0) && sd.some(x => x[0] < 0),
      `3-2 section: the blade at most ${flat.toFixed(1)}° to the surface (narration: 平行), inside the wall, past the limbus; the dimension limbus → inner opening ${len.toFixed(2)} mm (narration 約 1.5 mm, Ernest 1994)`); },
  (ctx, ok) => { let n = 0, worst = 0;
    for (const id of ['3-1', '3-2', '3-3']) { const S = need(ctx, id);
      for (const t of Object.values(S.track)) { if (!(t.op > 0.5)) continue; n++; const u = t.tip[0] / S.k + S.win.x, rS = dist(t.tipS, S.scope.centre) / S.scope.k;
        worst = Math.max(worst, Math.abs(rS - Math.abs(u)), Math.abs(t.tipS[0] - S.scope.centre[0]) / S.scope.k + (t.tipS[1] > S.scope.centre[1] ? 0 : 9)); } }
    ok('M15', n >= 6 && worst < 0.02, `chapter 3: the keratome tip at the same place in both views in ${n} frames (worst ${worst.toFixed(3)} mm: distance from the axis, on the main incision's meridian)`); },
  (ctx, ok) => { const tn = K.tunnelOf(ctx.case.main); let bad = [];
    const px = (S, rz) => [(-rz[0] - S.win.x) * S.k, (-rz[1] - S.win.y) * S.k], poly = S => tn.pts.map(p => px(S, p));
    const offPoly = (q, P) => Math.min(...P.slice(1).map((b, i) => { const a = P[i], d = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((q[0] - a[0]) * d[0] + (q[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2))); return dist(q, [a[0] + d[0] * t, a[1] + d[1] * t]); }));
    let inAC = { '3-1': 0, '3-2': 0, '3-3': 0 }, outside = 0;
    for (const id of ['3-1', '3-2', '3-3']) { const S = need(ctx, id), P = poly(S), ext = px(S, tn.ext);
      for (const t of Object.values(S.track)) { if (!(t.op > 0.5)) continue; const [s, d] = sdOfPx(S, t.tip);
        if (t.adv < 0) { outside++; const c = Math.abs((ext[0] - t.tip[0]) * t.ax[1] - (ext[1] - t.tip[1]) * t.ax[0]); if (!(d < 0 && c < 1.5)) bad.push(`${id} coming in`); }
        else if (t.adv <= 1) { if (offPoly(t.tip, P) > 1) bad.push(`${id} off the tunnel (adv ${t.adv.toFixed(2)})`); }
        else { inAC[id]++; if (!(s < tn.sI && d > G.T(s))) bad.push(`${id} past the inner opening but not in the chamber`); } } }
    const S3 = need(ctx, '3-3'), i3 = sdOfPx(S3, S3.int);
    ok('M16', !bad.length && outside > 0 && inAC['3-1'] === 0 && inAC['3-2'] === 0 && inAC['3-3'] > 0 && i3[0] < -1 && Math.abs(i3[1] - G.T(i3[0])) < 0.05,
      `chapter 3: the keratome comes in through the outer opening, its tip only along the tunnel, into the chamber only in 3-3 (${inAC['3-3']} frames) through the inner opening ${(-i3[0]).toFixed(2)} mm into clear cornea${bad.length ? ' — ' + bad.slice(0, 3).join(', ') : ''}`); },
  (ctx, ok) => { const S = need(ctx, '3-3'), tn = K.tunnelOf(ctx.case.main), A = S.iop.map(([a, b]) => [sdOfPx(S, a), sdOfPx(S, b)]);
    ok('M17', A.length > 0 && A.every(([a, b]) => a[1] > G.T(a[0]) && b[0] > tn.sI && b[0] < 0 && Math.abs(b[1] - G.T(b[0])) < 0.1 && b[1] < a[1]),
      `3-3: ${A.length} pressure arrows from the chamber up against the posterior surface under the lip (in clear cornea, between the inner opening and the limbus), toward the roof (示意)`); },
  (ctx, ok) => { const C = need(ctx, '3-3').card, r = (a, b) => Math.abs(a / b - 1) < 0.01;
    ok('M18', !!C && r(C.sc[0] / C.sc[1], 3.2 / 3.2) && r(C.cc[0] / C.cc[1], 3.2 / 2.0) && r(C.lip / C.sc[1], 1.5 / 3.2) && r(C.sc[0] / 3.2, C.px) && r(C.cc[0] / 3.2, C.px),
      `3-3 card: the two incisions in proportion at one scale — scleral 3.2 × 3.2 mm with a 1.5 mm lip, clear corneal 3.2 × 2.0 mm (Ernest 1994)`); },
  (ctx, ok) => { const S = need(ctx, '4-1'), P = S.path.map(p => sdOfPx(S, p)), ex = P[P.length - 1], inner = P.slice(1, -1), D = (S.deeper || []).map(p => sdOfPx(S, p));
    const roof = inner.every(([s, d]) => d > 0 && d < 0.35 * G.T(s)), out = Math.abs(ex[1]) < 0.03 && ex[0] > 0.1 && ex[0] < ctx.case.main.s - 0.3;
    const tipOut = Object.values(S.tips).some(p => { const [s, d] = sdOfPx(S, p); return d < -0.05 && s > 0 && s < ex[0]; });
    const flat = inner.filter(([s]) => s < 1.3 && s > ex[0]), deeper = D.length > 2 && D.slice(1, -1).every(([s, d]) => d > 0 && d < G.T(s)) && flat.length > 3 && flat.every(([s, d]) => depthAt(D, s) > d + 0.05);
    ok('M19', roof && out && tipOut && deeper, `4-1 section: the too-shallow path stays in the roof (≤ ${(100 * Math.max(...inner.map(([s, d]) => d / G.T(s)))).toFixed(0)} % of the wall) and comes out through the outer surface ${ex[0].toFixed(2)} mm behind the limbus (between the limbus and the outer opening), the blade tip drawn above the surface there; the deeper plane inside the wall and deeper than it`); },
  (ctx, ok) => { const S = need(ctx, '4-1'), C = S.scope, h = C.hole, ex = sdOfPx(S, S.path[S.path.length - 1]), sH = h ? sOfRho(dist(h, C.centre) / C.k) : NaN;
    ok('M20', !!h && Math.abs(h[0] - C.centre[0]) < 1 && h[1] > C.centre[1] && Math.abs(sH - ex[0]) < 0.05, `4-1 microscope: the buttonhole drawn on the main incision's meridian ${sH.toFixed(2)} mm behind the limbus = where the path comes out in the section (${ex[0].toFixed(2)})`); },
  (ctx, ok) => { const S = need(ctx, '4-2'), e = sdOfPx(S, S.int), c = sdOfPx(S, S.intOK), ac = Object.values(S.tips).filter(t => t.inAC > 0.5).map(t => sdOfPx(S, t.tip));
    ok('M21', e[0] >= 0 && e[0] < 0.5 && Math.abs(e[1] - G.T(e[0])) < 0.05 && c[0] < -1 && e[0] - c[0] > 1 && ac.length > 0 && ac.every(([s, d]) => d > G.T(s) + 0.02 && s > -0.5),
      `4-2 section: the early inner opening drawn ${e[0].toFixed(2)} mm behind the limbus on the inner surface (narration: 角膜緣附近, not clear cornea), ${(e[0] - c[0]).toFixed(2)} mm more peripheral than the right one (${(-c[0]).toFixed(2)} mm into clear cornea); the keratome tip in the chamber there (${ac.length} frames)`); },
  (ctx, ok) => { const S = need(ctx, '4-2'), R = S.pro, C = S.scope; if (!R) return ok('M22', false, '4-2: the prolapsed iris was drawn');
    const near = (q, p) => Math.min(...q.map(x => dist(x, p))) / S.k, kn = sdOfPx(S, R.knuck), ext = sdOfPx(S, S.ext), b = R.path[0], bz = -(b[1] / S.k + S.win.y), iz = -(S.int[1] / S.k + S.win.y);
    ok('M22', near(R.path, S.int) < 0.05 && near(R.path, S.ext) < 0.05 && dist(b, S.root) / S.k < 1.5 && bz < iz && kn[1] < 0 && Math.abs(kn[0] - ext[0]) < 0.2 && !!C.knuck && Math.abs(C.knuck[0] - C.mouth[0]) < 1 && Math.abs(C.knuck[1] - C.mouth[1]) / C.k < 0.1,
      `4-2: the prolapsed iris (示意) comes from the iris ${(dist(b, S.root) / S.k).toFixed(2)} mm from its root, through the early inner opening and the outer opening, its knuckle outside the surface at the outer opening; in the microscope in the outer opening`); },
  (ctx, ok) => { const a = need(ctx, '4-1').card, b = need(ctx, '4-2').card, r = (x, y) => Math.abs(x / y - 1) < 0.005;
    ok('M23', !!a && !!b && r(a.bar, 12.6 * a.px) && r(b.iris, 10.6 * b.px) && r(b.deep, 34 * b.px) && r(b.shallow, 6 * b.px) && r(b.deep / b.shallow, 34 / 6),
      `chapter 4 cards: bars on one scale — tunnel complications 12.6 %, iris prolapse 10.6 % (Subudhi 2021), hyphema deep 34 % vs shallow 6 % (John 1992)`); },
  (ctx, ok) => { const S = need(ctx, '5-1').ccc; if (!S) return ok('M24', false, '5-1: the CCC dimension was drawn');
    const len = dist(S.dim[0], S.dim[1]) / S.k, m = mid2(S.dim), off = dist(m, S.centre) / S.k, rr = [S.edge3, S.edge9].map(p => dist(p, S.centre) / S.k);
    ok('M24', len >= 5.0 && len <= 5.5 && off < 0.1 && rr.every(x => Math.abs(x - len / 2) < 0.03),
      `5-1 microscope: the CCC drawn ${len.toFixed(2)} mm across (narration 5.0–5.5 mm, Hollick 1999), centred (${off.toFixed(2)} mm off), the dimension on the drawn rim (radius ${rr.map(x => x.toFixed(2)).join(' / ')} mm)`); },
  (ctx, ok) => { const S = need(ctx, '5-1').phaco; if (!S) return ok('M25', false, '5-1: phaco was drawn');
    const e = sdOfPx(S, S.ext), i = sdOfPx(S, S.int), P = S.path, k0 = P.findIndex(p => dist(p, S.int) < 1), wall = P.slice(1, k0).map(p => sdOfPx(S, p));
    const u = S.tip[0] / S.k + S.win.x, z = -(S.tip[1] / S.k + S.win.y), uS = (S.tipS[1] - S.cS[1]) / S.kS;
    ok('M25', S.via === 'main' && dist(P[0], S.ext) < 1 && e[0] >= 1 && e[0] <= 2 && Math.abs(e[1]) < 0.05 && k0 > 0 && i[0] < -1 && Math.abs(i[1] - G.T(i[0])) < 0.05 &&
      wall.every(([s, d]) => d > 0 && d < G.T(s)) && dist(P[P.length - 1], S.tip) < 1 && Math.abs(u) < ctx.case.ccc.r && z < K.LENS.zAnt(Math.abs(u)) && Math.abs(uS + u) < 0.03,
      `5-1: phaco through the main incision — its path starts at the outer opening on the sclera (${e[0].toFixed(2)} mm behind the limbus), runs inside the wall to the inner opening in clear cornea (${(-i[0]).toFixed(2)} mm), ends in the groove ${Math.abs(u).toFixed(2)} mm from the axis (inside the CCC), the same point as the microscope's phaco tip`); },
  (ctx, ok) => { const S = need(ctx, '5-2'), A = S.sec, C = S.scope, u = A.iolC[0] / A.k + A.win.x, off = dist(C.iolC, C.centre) / C.k;
    ok('M26', Math.abs(u) < 0.1 && A.iolC[1] > Math.max(A.pm[1], A.pm2[1]) && A.iolC[1] < A.bagPost[1] && off < 0.1,
      `5-2: the IOL drawn in the bag — its centre ${Math.abs(u).toFixed(2)} mm from the axis in the section, behind the pupil margins and in front of the posterior capsule; ${off.toFixed(2)} mm off centre in the microscope (置中)`); },
  (ctx, ok) => { const M = need(ctx, '5-2').mini; if (!M) return ok('M27', false, '5-2: the two optic positions were drawn');
    const c = dist(M.cen.optic, M.cen.eye) / M.k, d = dist(M.dec.optic, M.dec.eye) / M.k;
    ok('M27', c < 0.1 && Math.abs(d - 0.75) < 0.02 && dist(M.dec.dim[0], M.dec.eye) < 0.5 && dist(M.dec.dim[1], M.dec.optic) < 0.5,
      `5-2: the centred optic ${c.toFixed(2)} mm off the pupil centre, the decentred one ${d.toFixed(2)} mm (narration 0.75 mm, Soda 2012), with its dimension line between the two centres`); },
];
// helpers of M11–M18: s (mm behind the limbus) of a horizontal radius in the microscope; the blade's angle to the outer surface at its tip (section)
const sOfRho = rho => { let a = -3, b = 8; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; G.surfAt(m).rho < rho ? a = m : b = m; } return (a + b) / 2; };
const mid2 = q => [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2];
const depthAt = (D, s) => { const q = D.slice().sort((a, b) => a[0] - b[0]); for (let i = 1; i < q.length; i++) if (q[i][0] >= s) { const k = (s - q[i - 1][0]) / ((q[i][0] - q[i - 1][0]) || 1); return q[i - 1][1] + (q[i][1] - q[i - 1][1]) * k; } return NaN; };   // depth of a (s, d) path at s
const angSurf = (S, t) => { const f = G.surfAt(sdOfPx(S, t.tip)[0]); return Math.asin(Math.min(1, Math.abs(t.ax[0] * f.nr + t.ax[1] * f.nz))) * 180 / Math.PI; };
function modelChecks(ctx) { const R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]); for (const f of [...CASE_CHECKS, ...MODEL_CHECKS]) f(ctx, ok); return R; }
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(pg) { const text = {}; for (const s of SEGS) text[s.id] = clone(s); return { text, segs: clone(SEGS), screen: clone(pg.screen), sync: clone(pg.sync || {}), ledger: clone(LEDGER), case: clone(CASE) }; }

// ---------------------------------------------------------------- 3. mutations: each must make at least one check (the named one) fail
const MUTATIONS = [
  ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[0] += '7 mm'; }],
  ['on-screen number without a source', c => { (c.screen['3-2'] = c.screen['3-2'] || []).push('隧道 4.5 mm'); }],
  ['ledger entry not used', c => { c.ledger['4-1']['99'] = 'Subudhi 2021'; }],
  ['ledger source not cited in the segment', c => { c.ledger['1-2']['0.72'] = 'Ernest 1994'; }],
  ['citation on screen not in REFS', c => { (c.screen['1-2'] = c.screen['1-2'] || []).push('Smith 2020'); }],
  ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Olsen 1998'; }],
  ['reference never cited', c => { c.segs.find(s => s.id === '2-1').src[0][1] = ''; }],
  ['outer opening on clear cornea', c => { c.case.main.s = -0.3; }, 'C1'],
  ['lip 0.6 mm', c => { c.case.main.L = 2.1; }, 'C2'],
  ['3.2 mm keratome', c => { c.case.main.w = 3.2; }, 'C4'],
  ['surgeon at 12 with the incision at 1:30', c => { c.case.surgeon = 12; }, 'C5'],
  ['side port on the surgeon\'s right', c => { c.case.side.h = c.case.surgeon - 2.2; }, 'C6'],
  ['1-1: outer opening drawn at the limbus', c => { const S = c.sync['1-1']; S.ext = S.limbus.slice(); }, 'M1'],
  ['1-1: inner opening drawn under the limbus', c => { const S = c.sync['1-1']; S.int = S.lip[0].slice(); }, 'M2'],
  ['1-1: dimension line stops halfway to the outer opening', c => { const S = c.sync['1-1']; S.dimO[1] = [(S.dimO[0][0] + S.dimO[1][0]) / 2, (S.dimO[0][1] + S.dimO[1][1]) / 2]; }, 'M3'],
  ['1-1 microscope: scleral opening drawn on the cornea', c => { const S = c.sync['1-1'].scope; S.scleral = S.cci.slice(); }, 'M4'],
  ['1-2: scleral bar 40 % too long', c => { c.sync['1-2'].bars.scleral *= 1.4; }, 'M5'],
  ['2-1: main incision drawn off the bottom', c => { c.sync['2-1'].main[0] += 60; }, 'M6'],
  ['2-1: 3 and 9 o\'clock swapped', c => { const S = c.sync['2-1']; [S.temporal, S.nasal] = [S.nasal, S.temporal]; }, 'M7'],
  ['2-1: side port on the right', c => { const S = c.sync['2-1']; S.side[0] = 2 * S.centre[0] - S.side[0]; }, 'M8'],
  ['2-1 map: surgeon at 10:30', c => { const m = c.sync['2-1'].map; m.surgeon[0] = 2 * m.centre[0] - m.surgeon[0]; }, 'M9'],
  ['片頭: suture along the incision', c => { const S = c.sync.title; S.suture = S.mouth.map(p => p.slice()); }, 'M10'],
  ['2-2: the 15° blade shown in the section through the main incision', c => { c.sync['2-2'].side.hp = (c.case.main.h + 6) % 12; }, 'M11'],
  ['2-2: conjunctiva rolled back half as far in the section', c => { c.sync['2-2'].main.peri /= 2; }, 'M12'],
  ['3-1: outer opening drawn at the limbus', c => { const S = c.sync['3-1']; S.ext = S.limbus.slice(); }, 'M13'],
  ['3-2: blade tilted 25° to the surface', c => { for (const t of Object.values(c.sync['3-2'].track)) { const a = 25 * Math.PI / 180, [x, y] = t.ax; t.ax = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; } }, 'M14'],
  ['3-2: microscope tip 1 mm off', c => { const S = c.sync['3-2'], t = Object.values(S.track).find(x => x.op > 0.5); t.tipS[1] -= S.scope.k; }, 'M15'],
  ['3-2: tip drawn 0.8 mm deeper, in the chamber', c => { const S = c.sync['3-2'], t = Object.values(S.track).find(x => x.op > 0.5); t.tip[1] += 0.8 * S.k; }, 'M16'],
  ['3-3: pressure arrows reversed', c => { const S = c.sync['3-3']; S.iop = S.iop.map(([a, b]) => [b, a]); }, 'M17'],
  ['3-3: clear corneal incision drawn square', c => { const C = c.sync['3-3'].card; C.cc[1] = C.cc[0]; }, 'M18'],
  ['4-1: shallow path ends 0.2 mm under the surface', c => { const S = c.sync['4-1'], p = S.path[S.path.length - 1]; p[1] += 0.2 * S.k; }, 'M19'],
  ['4-1 microscope: buttonhole drawn at the outer opening', c => { const S = c.sync['4-1'].scope; S.hole[1] += 0.75 * S.k; }, 'M20'],
  ['4-2: early inner opening drawn in clear cornea', c => { const S = c.sync['4-2']; S.int = S.intOK.slice(); }, 'M21'],
  ['4-2: prolapsed iris stops inside the tunnel', c => { const S = c.sync['4-2']; S.pro.knuck = S.pro.path[Math.round(S.pro.path.length * 0.7)].slice(); }, 'M22'],
  ['4-2 card: deep-tunnel hyphema bar drawn 24 %', c => { c.sync['4-2'].card.deep *= 24 / 34; }, 'M23'],
  ['5-1: CCC drawn 6.0 mm', c => { const S = c.sync['5-1'].ccc, f = 6.0 / 5.25; S.dim = S.dim.map(p => [S.centre[0] + (p[0] - S.centre[0]) * f, S.centre[1] + (p[1] - S.centre[1]) * f]); }, 'M24'],
  ['5-1: phaco path starts at the inner opening (clear corneal)', c => { const S = c.sync['5-1'].phaco, k = S.path.findIndex(p => Math.hypot(p[0] - S.int[0], p[1] - S.int[1]) < 1); S.path = S.path.slice(k); }, 'M25'],
  ['5-2: IOL drawn in front of the iris', c => { const A = c.sync['5-2'].sec; A.iolC[1] = Math.min(A.pm[1], A.pm2[1]) - 0.3 * A.k; }, 'M26'],
  ['5-2: decentred optic drawn 1.0 mm off', c => { const M = c.sync['5-2'].mini; M.dec.optic[0] = M.dec.eye[0] + 1.0 * M.k; }, 'M27'],
];

(async () => {
  const pg = await fromPage();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => strip(k[1])), ...(pg.screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(pg));
  let fail = 0, nl = 0;
  for (const [c, m] of res) { if (!c) { fail++; console.log('FAIL ' + m); } else if (/^[CM]\d/.test(m)) console.log('PASS ' + m); else nl++; }
  console.log(`PASS ledger: ${nl} number / source / citation checks (${SEGS.filter(s => !s.chapterCard && s.layout !== 'refs').length} segments, on-screen text included)`);
  let bad = 0;
  for (const [name, mut, target] of MUTATIONS) { const c = baseCtx(pg); mut(c); const fails = runAll(c).filter(r => !r[0]), hit = !target || fails.some(r => r[1].startsWith(target + ' '));
    if (!fails.length || !hit) { bad++; console.log(`FAIL selftest: breaking 「${name}」 is not caught${target ? ` by ${target}` : ''}`); } }
  console.log(bad ? `selftest: ${bad} of ${MUTATIONS.length} mutations not caught` : `PASS selftest: all ${MUTATIONS.length} mutations caught`);
  fail += bad;
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
