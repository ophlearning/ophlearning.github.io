// Scleral-tunnel cataract video — video checks run by videos/tools/check-all.js (in this folder; or: node check.js [--list]).
// 1. Number ledger: every number in the narration, key-point boxes, titles and every text drawn on screen (each drawn segment rendered at 60 % and
//    98 % of every narration line) must be listed for that segment in LEDGER with its source; every ledger source must be cited in that segment
//    (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, the OP note confirmed by 站長 2026-11-26; 結構 = clock hours, list
//    numbers, scale bars); every「作者 年份」shown or cited must be in REFS, and every reference cited somewhere; a ledger number that is not
//    used fails too (結構 excepted). The print sheets (print/) read this LEDGER as text (videos/tools/print/numcheck.js).
// 2. Case geometry (C…, on anim/params.js and the globe model): the tunnel the narration describes (outer opening 1–2 mm behind the limbus,
//    lip ≈ 1.5 mm in clear cornea, inside the wall), the 2.65 mm keratome, the surgeon at 1–2 o'clock with the incision in front, the side port
//    on the surgeon's left. Narration ↔ drawing checks (M…) on window.SYNC, added chapter by chapter (spec.md 進度): 片頭 and chapters 1–2 so far
//    (outer / inner opening and lip in the 1-1 section, read back from the drawn panel points; both openings vs the limbus in the microscope;
//    bars in proportion; the microscope's orientation in 2-1 and the orientation map; the radial suture of the title).
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
];
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
