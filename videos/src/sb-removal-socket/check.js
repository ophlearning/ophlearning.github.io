// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」, confirmed by
//    站長 2026-11-13; 結構 = clock-hour numbers and list numbers).
// 2. Narration ↔ model (M…): each spatial claim the narration makes is checked on what the video draws (the socket model through
//    anim/views-socket.js), against case or literature numbers written here — never against the model's own parameters.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const { SEGS, REFS } = require('./anim/segments.js');
global.SOCKET = require('../../models/socket/socket.js');
const VS0 = require('./anim/views-socket.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const CLK = { '12': '結構', '3': '結構', '6': '結構', '9': '結構' };
// '1' in the sections' title 「切面經 1 點半」: the exposure's clock hour (示意)
const LEDGER = {
  'title': { ...CLK, '41': '病例' },
  '1-1': { ...CLK, '2009': '病例', '41': '病例', '3.5': 'Gomaa 2017', '5-0': '病例', '2023': '病例' },
  '1-2': { ...CLK, '1': '示意', '139': 'Girgis 2012', '14.8': 'Girgis 2012' },
  '2-1': { ...CLK, '102': 'Kazi 2015', '50': 'Zhang 2026', '1': '示意' },   // 1: 1 點半, the exposure's clock hour (示意)
  '2-2': { ...CLK, '1': '示意' },
  '3-1': { ...CLK, '1': '示意', '102': 'Kazi 2015', '84': 'Kazi 2015', '90': 'Kazi 2015' },
  '3-2': { ...CLK, '1': '示意' },
  '3-3': { ...CLK, '102': 'Kazi 2015', '13.7': 'Kazi 2015', '1': 'Kazi 2015', '7': '示意' },   // 1: 1 眼 (Kazi) and 切面經 1 點半 (示意); 7: the 示範's 7 點半 suture
  '4-1': { ...CLK, '1': '示意' },
  '4-2': { ...CLK, '1': '示意' },
  '5-1': { ...CLK, '1': '示意' },
  '5-2': { ...CLK },
  '5-3': { '139': 'Girgis 2012', '81': 'Girgis 2012', '93': 'Girgis 2012', '4': 'Das 2024', '6': 'Das 2024' },
  '6': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '12': '結構' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const FREE = ['病例', '結構', '示意'];

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
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const CASE = { recti: [12, 3, 6, 9], bandW: 3.5, expose: 1.5 };   // 病例: band under the four recti; Gomaa 2017: #41 3.5 mm wide; exposure 1:30 (示意)
// clock hour of a screen vector in the surgeon's view, surgeon at 12: screen down = 12, screen left = 3 (OS temporal) — written here
const clockSurg = d => { let h = Math.atan2(-d[0], d[1]) / (Math.PI / 6); if (h <= 0) h += 12; return h; };
const hdiff = (a, b) => { let d = a - b; d -= 12 * Math.round(d / 12); return d; };
function modelChecks(ctx) {
  const R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]);
  const MC = ctx.modelChecks || [];
  for (const f of MC) f(ctx, ok);
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(s === '院內常規' || s === '本片各章來源' || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video or 院內常規`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      if (src === '結構' && !found.has(n)) continue;   // clock-hour numbers: listed for every surgical segment, used where the clock face is drawn
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      ok(srcs.includes(src) || FREE.includes(src), `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  // every reference is cited somewhere
  const all = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).join(' ');
  for (const r of REFS) { const who = r.split(' ')[0], yr = (r.match(/ (\d{4});/) || [])[1]; ok(all.includes(`${who} ${yr}`), `reference ${who} ${yr} is cited in some segment`); }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER), VS: VS0, modelChecks: MODEL_CHECKS };
}
// each takes (ctx, ok); ctx.VS is the video's view wrapper (a mutation may replace it), SOCKET the model
const W_ = 606, H_ = 410;   // dual panel drawing area (video-kit PW × PH)
const MODEL_CHECKS = [
  // M1 2-1 line 1: surgeon at 12 — on the drawn front view, 12 o'clock is down and 3 o'clock (OS temporal) is left; clock read with clockSurg (written here)
  (ctx, ok) => { const VS = ctx.VS, v = VS.front(VS.ST.expo, W_, H_, VS.WIN.front, 'm1'), c = v.P([0, 0]), A = v.A.rect;
    const hSR = clockSurg([A.SR[0] - c[0], A.SR[1] - c[1]]), hLR = clockSurg([A.LR[0] - c[0], A.LR[1] - c[1]]);
    ok('M1', line(ctx, '2-1', 1).includes('畫面下方是 12 點，temporal 在左') && A.SR[1] > c[1] + 50 && A.LR[0] < c[0] - 50 && near(hSR % 12, 0, 0.05) && near(hLR, 3, 0.05)
      && /temporal/.test(SOCKET.hourName(3)) && VS.ORIENT.front.orient.includes('下＝12 點') && VS.ORIENT.front.orient.includes('左＝3 點 temporal'),
      `2-1 front view: superior rectus at ${f2(hSR)} o'clock (${f2(A.SR[1] - c[1])} px below centre), lateral rectus at ${f2(hLR)} (${f2(c[0] - A.LR[0])} px left); 3 = ${SOCKET.hourName(3)}`); },
  // M2 1-1 line 1, 2-1 line 2: four recti at 12/3/6/9, the band under each (deeper than the muscle at the band), in the section through it
  (ctx, ok) => { const hs = SOCKET.muscles().map(m => m[0]).sort((a, b) => a - b), pr = SOCKET.profile();
    const under = CASE.recti.map(h => { const sd = ctx.VS.sec({}, W_, H_, ctx.VS.WIN.sec, 'm2', h).r.sides[1]; return sd.muscle && sd.hasBand && sd.bandOut <= sd.musIn(pr.sEq) + 1e-6 ? sd.bandOut - sd.musIn(pr.sEq) : null; });
    ok('M2', line(ctx, '2-1', 2).includes('四條直肌在 12、3、6、9 點') && line(ctx, '1-1', 1).includes('從四條直肌的底下穿過') && JSON.stringify(hs) === JSON.stringify([3, 6, 9, 12]) && under.every(x => x !== null),
      `recti at ${hs.join('/')} o'clock; band outer surface vs muscle inner surface at the band: ${under.map(x => x === null ? 'NOT under' : f2(x)).join(', ')} mm`); },
  // M3 2-1 line 4: the exposure drawn at 1:30 (上方偏顳側) in both views
  (ctx, ok) => { const VS = ctx.VS, v = VS.front(VS.ST.expo, W_, H_, VS.WIN.front, 'm3'), c = v.P([0, 0]), h = clockSurg([v.A.expose[0] - c[0], v.A.expose[1] - c[1]]);
    const sd = VS.sec(VS.ST.expo, W_, H_, VS.WIN.secR, 'm3s', VS.EXPO_H).r.sides[1];
    ok('M3', line(ctx, '2-1', 4).includes('本片畫在 1 點半，上方偏顳側') && VS.EXPO_H === CASE.expose && near(h, CASE.expose, 0.05) && SOCKET.hourName(CASE.expose) === '上顳側 superotemporal' && sd.expo,
      `exposure: front at ${f2(h)} o'clock (${SOCKET.hourName(h)}), section through ${VS.EXPO_H} shows it: ${sd.expo}`); },
  // M4 3-1 line 3: one Dacron suture per quadrant
  (ctx, ok) => { const q = ctx.VS.SUT.map(h => Math.floor((h % 12) / 3)), v = ctx.VS.front(ctx.VS.ST.open, W_, H_, ctx.VS.WIN.front, 'm4');
    ok('M4', line(ctx, '3-1', 3).includes('每個象限一條') && ctx.VS.SUT.length === 4 && new Set(q).size === 4 && Object.keys(v.A.sut).length === 4,
      `sutures at ${ctx.VS.SUT.join(', ')} o'clock: quadrants ${q.join(', ')}`); },
  // M5 1-1 line 0: band 3.5 mm wide (Gomaa 2017), drawn that wide along the shell in the section
  (ctx, ok) => { const sd = ctx.VS.sec({}, W_, H_, ctx.VS.WIN.sec, 'm5', 3).r.sides[1];
    ok('M5', line(ctx, '1-1', 0).includes('寬 3.5 mm') && near(sd.s1 - sd.s0, CASE.bandW, 0.01), `section: band ${f2(sd.s1 - sd.s0)} mm wide along the shell (Gomaa 2017: 3.5)`); },
  // M6 3-3 lines 0–2: the band comes out along its own track (length kept); the free end passes 12, 9, 6, 3 in turn and the rectus hooked
  //    is the next one it reaches; one uncut suture holds the whole band (the 示範 of line 2)
  (ctx, ok) => { const VS = ctx.VS, L = SOCKET.band(VS.ST.cut).L; let keep = true, seq = [], prev = null;
    for (let p = 0; p <= 1.0001; p += 0.01) { const st = { ...VS.ST.cut, pull: p }, B = SOCKET.band(st), inside = B.span / 12 * L, out = B.p * L;
      if (!near(inside + out, L, 1e-6)) keep = false; const nx = VS.nextRectus(st); if (nx != null && nx !== prev) { seq.push(nx); prev = nx; } }
    ok('M6', line(ctx, '3-3', 0).includes('沿著原本的路線') && keep && JSON.stringify(seq) === JSON.stringify([12, 9, 6, 3]), `pull 0 → 1: length kept ${keep}; recti hooked in order ${seq.join(' → ')}`);
    const sb = SOCKET.stuckBy(VS.ST.stuckDemo), B = SOCKET.band(VS.ST.stuckDemo);
    ok('M6', line(ctx, '3-3', 2).includes('多半還有縫線') && sb.length === 1 && B.p === 0 && VS.ST.stuckDemo.pull > 0, `示範: uncut suture at ${sb.join(', ')} o'clock holds the band (pulled ${B.p})`); },
];
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in some/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const M = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '3-1').lines[0] += '7 mm'; }],
      ['on-screen number without a source', c => { c.screen['3-3'].push('拉 25 mm'); }],
      ['ledger entry not used', c => { c.ledger['5-3']['99'] = 'Girgis 2012'; }],
      ['ledger source not cited in the segment', c => { c.ledger['1-1']['3.5'] = 'Kazi 2015'; }],
      ['citation not in REFS', c => { c.screen['1-2'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Girgis 2011'; }],
      ['reference never cited', c => { c.segs.find(s => s.id === '5-2').src[1][1] = ''; }],
      ...MUTATIONS,
    ];
    let bad = 0;
    for (const [name, mut, target] of M) { const c = baseCtx(screen); mut(c); const fails = runAll(c).filter(r => !r[0]), n = fails.length, hit = !target || fails.some(r => r[1].startsWith(target + ' '));
      console.log(`${n && hit ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail${target ? (hit ? `, including ${target}` : `, not ${target}`) : ''}`); if (!n || !hit) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
const mirrorFront = VS => ({ ...VS, front: (...a) => { const r = VS.front(...a), c = r.P([0, 0]); const A = { ...r.A, rect: {} };
  for (const [k, p] of Object.entries(r.A.rect)) A.rect[k] = [2 * c[0] - p[0], p[1]]; if (r.A.expose) A.expose = [2 * c[0] - r.A.expose[0], r.A.expose[1]]; return { ...r, A }; } });
const MUTATIONS = [   // model-check mutations: each must make the named check fail
  ['front view mirrored (temporal on the right)', c => { c.VS = mirrorFront(c.VS); }, 'M1'],
  ['narration: temporal on the right', c => { c.text['2-1'].lines[1] = c.text['2-1'].lines[1].replace('temporal 在左', 'temporal 在右'); }, 'M1'],
  ['band drawn over a muscle', c => { const V = c.VS; c.VS = { ...V, sec: (...a) => { const r = V.sec(...a), sd = { ...r.r.sides[1], bandOut: 9 }; return { ...r, r: { ...r.r, sides: { ...r.r.sides, 1: sd } } }; } }; }, 'M2'],
  ['exposure moved to 4:30', c => { c.VS = { ...c.VS, EXPO_H: 4.5, ST: { ...c.VS.ST, expo: { expose: { h: 4.5, len: 6 } } } }; }, 'M3'],
  ['three sutures', c => { c.VS = { ...c.VS, SUT: [1.5, 4.5, 7.5] }; }, 'M4'],
  ['narration: band 4 mm wide', c => { c.text['1-1'].lines[0] = c.text['1-1'].lines[0].replace('寬 3.5 mm', '寬 4 mm'); }, 'M5'],
  ['hook order reversed', c => { const V = c.VS; c.VS = { ...V, nextRectus: st => { const h = V.nextRectus(st); return h == null ? null : (12 - h) % 12 || 12; } }; }, 'M6'],
  ['demo with every suture cut', c => { c.VS = { ...c.VS, ST: { ...c.VS.ST, stuckDemo: { ...c.VS.ST.cut, pull: 0.4 } } }; }, 'M6'],
];
