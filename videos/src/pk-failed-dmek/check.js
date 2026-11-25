// PK after a failed DMEK (assistant's version) — video checks run by videos/tools/check-all.js (in this folder; or: node check.js [--list]).
// 1. Number ledger: every number in the narration, key-point boxes, titles and every text drawn on screen (each drawn segment rendered at 60 % and
//    98 % of every narration line: labels, cards, panel titles) must be listed for that segment in LEDGER with its source; every ledger source
//    must be cited in that segment (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, confirmed by 站長 2026-11-23; 結構 = clock
//    hours, list numbers, scale bars; 院內常規 = the hospital's PK operation-record template, 站長 2026-11-23); every「作者 年份」shown or cited
//    must be in REFS, and every reference cited somewhere; a ledger number that is not used fails too (結構 excepted).
// 2. Narration ↔ model (M…, on what draw.js drew: window.SYNC, and globe/pk.js loaded here), against case numbers written here:
//    M1 surgeon at 12, OS: on the microscope view 12 o'clock is down and 3 o'clock (temporal) is left; the panel says so; the narration says so.
//    M2 the LI at 7 o'clock in both views (1-1, 3-2): the microscope view at 7 o'clock, the 1–7 section on its 7 o'clock (right) side.
//    M3 the hyphema below the clear aqueous along gravity (the patient supine: gravity points posteriorly), labelled 平躺.
//    M4 cardinal sutures numbered 1–4 at 12 → 6 → 3 → 9 in the microscope view, 12 on the left and 6 on the right of the 12–6 section.
//    M5 16 sutures drawn at the end of 4-1, as the narration says (院內常規).
// 3. Self-test (every run): each check is broken once on purpose (a mutation) and must then fail; a mutation not caught fails the run.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const PK = require(path.join(MD, 'pk.js'))(G);
const { SEGS, REFS } = require('./anim/segments.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const CLK = { '12': '結構', '6': '結構', '3': '結構', '9': '結構' };
const SB = { '2': '結構' };                                   // the 2 mm scale bar of the sections
const LEDGER = {
  'title': { ...CLK, '7': '病例' },
  '1-1': { ...CLK, ...SB, '7': '病例', '1': '結構' },          // 1: the 1–7 section (line 3)
  '1-2': { ...CLK, ...SB, '64.1': 'Gómez-Benlloch 2021', '55': 'Price 2015' },
  '2-1': { ...CLK, ...SB, '830': 'Ingraham 1989', '9': 'Ingraham 1989', '8': 'Ingraham 1989', '33': 'Lee 2012' },
  '3-1': { ...CLK, ...SB },
  '3-2': { ...CLK, ...SB, '368': 'Gonzalez 2016', '1': 'Gonzalez 2016', '22': 'Gonzalez 2016', '23': 'Gonzalez 2016', '6.6': 'Gonzalez 2016', '7': '病例' },   // 1: 1 小時 (Gonzalez) and the 1–7 section
  '4-1': { ...CLK, ...SB, '1': '結構', '4': '結構', '16': '院內常規', '10-0': '院內常規' },   // 1–4: the cardinal sutures' order badges
  '5-1': { ...CLK, ...SB, '24': 'Figueiredo 2013', '5': 'Thompson 2003', '53': 'Thompson 2003', '90': 'Thompson 2003' },
  '6': { ...CLK, '7': '病例' },
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

// ---------------------------------------------------------------- 2. narration ↔ model
const CASE = { li: 7, cardinal: [12, 6, 3, 9], nSut: 16 };   // 病例 (LI at 7, spec.md); Lee 2012 + 常規 (order); 院內常規 (16 sutures)
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
// clock hour of a screen vector in the surgeon's view of an OS eye, surgeon at 12: screen down = 12, screen left = 3 (temporal) — written here
const clockSurg = d => { let h = Math.atan2(-d[0], d[1]) / (Math.PI / 6); if (h <= 0) h += 12; return h; };
const hdiff = (a, b) => { let d = a - b; d -= 12 * Math.round(d / 12); return d; };
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const MODEL_CHECKS = [
  // M1 6 line 1 (and every microscope panel's header): surgeon at 12 — 12 o'clock down, 3 o'clock (OS temporal) left
  (ctx, ok) => { const o = ctx.sync['1-1'].orient, h12 = clockSurg(vsub(o.p12, o.c)), h3 = clockSurg(vsub(o.p3, o.c)), OR = PK.orient({ eye: 'OS', surgeon: 12 });
    ok('M1', line(ctx, '6', 1).includes('下方是 12 點') && line(ctx, '6', 1).includes('temporal 在左') && o.p12[1] - o.c[1] > 50 && o.c[0] - o.p3[0] > 50
      && near(hdiff(h12, 12), 0, 0.05) && near(hdiff(h3, 3), 0, 0.05) && OR.left === 3 && OR.leftSide === 'temporal' && o.title.includes('下＝12 點') && o.title.includes('左＝3 點 temporal'),
      `microscope: 12 o'clock at ${f2(h12)} (${f2(o.p12[1] - o.c[1])} px below centre), 3 o'clock at ${f2(h3)} (${f2(o.c[0] - o.p3[0])} px left), panel 「${o.title}」`); },
  // M2 1-1 line 3, 3-2 line 2: the LI at 7 o'clock, the same clock hour in both views
  (ctx, ok) => { for (const id of ['1-1', '3-2']) { const L = ctx.sync[id].li, h = clockSurg(vsub(L.scope, L.c)), right = PK.orient({ eye: 'OS', view: 'section', h: L.secH }).right;
    ok('M2', near(hdiff(h, CASE.li), 0, 0.1) && L.secH === CASE.li && right === CASE.li && L.sec && L.sec[0] > L.axis[0] + 20,
      `${id}: LI on the microscope view at ${f2(h)} o'clock; section through ${L.secH} (right = ${right}), LI ${L.sec ? f2(L.sec[0] - L.axis[0]) : 'not drawn'} px right of the axis`); }
    ok('M2', line(ctx, '1-1', 3).includes('7 點鐘') && line(ctx, '3-2', 2).includes('7 點鐘的 LI'), 'narration: the LI at 7 o\'clock (1-1 line 3, 3-2 line 2)'); },
  // M3 1-1 line 2: hyphema — the patient lies supine, gravity points posteriorly (−z): every blood point lies below every clear-aqueous point of the
  //    anterior chamber (each vertical column from the cornea down to the first tissue), sampled on the drawn state in the 12–6 plane
  (ctx, ok) => { const H = ctx.sync['1-1'].hy, f = PK.layersFn(H.st); let bmax = -1e9, cmin = 1e9, nb = 0, nc = 0;
    for (let y = -6; y <= 6.001; y += 0.05) { let run = false; for (let z = 14; z >= 7; z -= 0.02) { const o = f([0, y, z]); if (o.ac < 0) { run = true;
      if (o.hy < -0.03) { nb++; bmax = Math.max(bmax, z); } else if (o.ac < -0.03 && o.hy > 0.03) { nc++; cmin = Math.min(cmin, z); } } else if (run) break; } }
    ok('M3', H.st.pk.hy && H.st.pk.hy.pos === 'supine' && H.label === '平躺' && line(ctx, '1-1', 2).includes('hyphema') && nb > 100 && nc > 100 && bmax < cmin,
      `hyphema (${H.label}): ${nb} blood points up to z ${f2(bmax)}, ${nc} clear points from z ${f2(cmin)} (blood must be lower)`); },
  // M4 4-1 line 1: cardinal sutures 1–4 at 12 → 6 → 3 → 9 (microscope), 12 left and 6 right on the 12–6 section
  (ctx, ok) => { const C = ctx.sync['4-1'].card, hs = C.scope.map(q => q ? clockSurg(vsub(q, C.c)) : NaN), order = PK.sutOrder(CASE.nSut).slice(0, 4).map(o => o.h);
    ok('M4', line(ctx, '4-1', 1).includes('第一針在 12 點，接著 6、3、9 點') && JSON.stringify(C.hours) === JSON.stringify(CASE.cardinal) && JSON.stringify(order) === JSON.stringify(CASE.cardinal)
      && hs.every((h, i) => near(hdiff(h, CASE.cardinal[i]), 0, 0.1)) && C.sec12 && C.sec6 && C.sec12[0] < C.axis[0] - 20 && C.sec6[0] > C.axis[0] + 20,
      `badges 1–4 at ${hs.map(f2).join(' → ')} o'clock (model order ${order.join(' → ')}); section: 12 at ${C.sec12 ? f2(C.sec12[0] - C.axis[0]) : '-'} px, 6 at ${C.sec6 ? f2(C.sec6[0] - C.axis[0]) : '-'} px from the axis`); },
  // M5 4-1 line 2: 16 interrupted sutures drawn (院內常規)
  (ctx, ok) => ok('M5', line(ctx, '4-1', 2).includes('16 針') && ctx.sync['4-1'].nSut === CASE.nSut, `sutures drawn at the end of 4-1: ${ctx.sync['4-1'].nSut} (narration: 16 針)`),
];
function modelChecks(ctx) { const R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]); for (const f of MODEL_CHECKS) f(ctx, ok); return R; }
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(pg) { const text = {}; for (const s of SEGS) text[s.id] = clone(s); return { text, segs: clone(SEGS), screen: clone(pg.screen), sync: clone(pg.sync), ledger: clone(LEDGER) }; }

// ---------------------------------------------------------------- 3. mutations: each must make at least one check (the named one) fail
const mirror = (q, c) => q ? [2 * c[0] - q[0], q[1]] : q;
const MUTATIONS = [
  ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[0] += '7 mm'; }],
  ['on-screen number without a source', c => { c.screen['2-1'].push('trephine 8.25 mm'); }],
  ['ledger entry not used', c => { c.ledger['5-1']['99'] = 'Thompson 2003'; }],
  ['ledger source not cited in the segment', c => { c.ledger['1-2']['55'] = 'Lee 2012'; }],
  ['citation on screen not in REFS', c => { c.screen['1-2'].push('Smith 2020'); }],
  ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Gómez-Benlloch 2020'; }],
  ['reference never cited', c => { c.segs.find(s => s.id === '5-1').src.find(x => x[1] === 'Thompson 2003')[1] = ''; }],
  ['microscope view mirrored (temporal on the right)', c => { const o = c.sync['1-1'].orient; o.p3 = mirror(o.p3, o.c); o.p12 = mirror(o.p12, o.c); }, 'M1'],
  ['narration: temporal on the right', c => { c.text['6'].lines[1] = c.text['6'].lines[1].replace('temporal 在左', 'temporal 在右'); }, 'M1'],
  ['LI drawn at 5 o\'clock on the microscope view', c => { const L = c.sync['3-2'].li; L.scope = mirror(L.scope, L.c); }, 'M2'],
  ['LI on the 1 o\'clock side of the section', c => { const L = c.sync['1-1'].li; L.sec = [2 * L.axis[0] - L.sec[0], L.sec[1]]; }, 'M2'],
  ['hyphema with the patient upright', c => { c.sync['1-1'].hy.st.pk.hy.pos = 'upright'; }, 'M3'],
  ['cardinal order 12 → 6 → 9 → 3', c => { const s = c.sync['4-1'].card.scope; [s[2], s[3]] = [s[3], s[2]]; }, 'M4'],
  ['section: 12 o\'clock suture on the right', c => { const C = c.sync['4-1'].card; [C.sec12, C.sec6] = [C.sec6, C.sec12]; }, 'M4'],
  ['15 sutures drawn', c => { c.sync['4-1'].nSut = 15; }, 'M5'],
];

(async () => {
  const pg = await fromPage();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => strip(k[1])), ...(pg.screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(pg));
  let fail = 0, nl = 0;
  for (const [c, m] of res) { if (!c) { fail++; console.log('FAIL ' + m); } else if (/^M\d/.test(m)) console.log('PASS ' + m); else nl++; }
  console.log(`PASS ledger: ${nl} number / source / citation checks (${SEGS.filter(s => !s.chapterCard && s.layout !== 'refs').length} segments, on-screen text included)`);
  let bad = 0;
  for (const [name, mut, target] of MUTATIONS) { const c = baseCtx(pg); mut(c); const fails = runAll(c).filter(r => !r[0]), hit = !target || fails.some(r => r[1].startsWith(target + ' '));
    if (!fails.length || !hit) { bad++; console.log(`FAIL selftest: breaking 「${name}」 is not caught${target ? ` by ${target}` : ''}`); } }
  console.log(bad ? `selftest: ${bad} of ${MUTATIONS.length} mutations not caught` : `PASS selftest: all ${MUTATIONS.length} mutations caught`);
  fail += bad;
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
