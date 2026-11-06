// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 示意 / 結構 / 病例 (病例 = the case summary in spec.md).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the repair is checked on the globe and hands models
//    as the video page draws them (the facts are read from the page, so they are the drawn ones).
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
const path = require('path');
const { SEGS, REFS } = require('./anim/segments.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '12': '結構', '10': '病例' },
  '1-1': { '5': 'Pieramici 1997', '10': '病例', '4': '病例', '6.2': 'Liu 2014', '6.4': 'Kim 2024', '6.8': 'Kim 2024', '12': '結構' },
  '1-2': { '1': '結構', '12': '結構' },
  '2-1': { '10-0': 'Zhou 2022', '9-0': 'Zhou 2022', '8-0': 'Zhou 2022' },
  '2-2': { '22': 'Li 2021', '12': '結構' },
  '2-3': { '1': '結構' },
  '2-4': { '12': '結構' },
  '3-1': { '24': 'Li 2015', '10': '病例', '12': '結構' },
  '3-2': { '10': '病例', '12': '結構' },
  '4-1': { '9-0': 'Zhou 2022', '10': '病例', '12': '結構' },
  '4-2': { '1': '示意', '80': '示意', '9-0': 'Zhou 2022', '12': '結構' },
  '5-1': { '10-0': 'Zhou 2022', '70': 'Zhou 2022', '90': 'Zhou 2022', '0.5': 'Zheng 2026', '1': 'Zheng 2026', '80': '示意', '0.85': '示意', '12': '結構' },
  '5-2': { '10-0': 'Zhou 2022', '1.0': 'Zhou 2022', '1.5': 'Zhou 2022', '3.5': '病例', '3': '病例', '10': '病例', '12': '結構' },
  '5-3': { '3-1': 'Jones 2023', '2-1': 'Hammond 1996', '1': 'Jones 2023', '12': '結構' },
  '6-1': { '360': 'Zhou 2022', '4': '病例', '10': '病例', '12': '結構' },
  '6-2': { '8-0': 'Zhou 2022', '4': '病例', '3': '示意', '1': '結構', '12': '結構' },
  '7-1': { '10': '病例', '12': '結構' },
  '8': { '1': '結構', '2': '結構', '3': '結構', '4': '結構', '5': '結構', '6': '結構', '7': '結構', '9-0': 'Zhou 2022', '10-0': 'Zhou 2022', '70': 'Zhou 2022', '90': 'Zhou 2022', '360': 'Zhou 2022', '8-0': 'Zhou 2022' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').replace(/zone (I|II|III)/gi, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);

// all text drawn on screen per segment (60 % and 98 % of every narration line), plus the model facts the narration relies on
async function fromPage() {
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.waitForTimeout(300);
  const out = await p.evaluate(() => { const screen = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add(t.textContent); }
      screen[s.id] = [...set]; }
    const M = GLOBE.enfaceMap(12), rigs = {};
    for (const [k, pass] of [['L0', 0.35], ['C2', 0.5], ['S2', 0.5]]) { const r = rig(REP, SU[k], pass), pth = GLOBE.suturePath(REP, SU[k]);
      rigs[k] = { R: r.R, L: r.L, line: [M(pth.entry), M(pth.exit)], needle: r.needle.pts, inside: r.needle.inside }; }
    const fv = HANDS.overview({ R: RIG_FIELD.R, L: RIG_FIELD.L });
    const peak = GLOBE.enface({ st: PRE }).A, rep = GLOBE.enface({ st: REP }).A;
    return { screen, WND, SU, N: GLOBE.N, rhoS0: GLOBE.surfAt(WND.s0).rho, para: REP.para, rigs, field: { R: fv.A.R.dir, L: fv.A.L.dir }, rigField: { R: RIG_FIELD.R.dir, L: RIG_FIELD.L.dir },
      pupilPeak: peak.pupilPeak, woundLimbus: peak.woundLimbus, pupilPeakRep: rep.pupilPeak, centre: peak.centre, pupilR: GLOBE.N.pupil,
      depth: Object.fromEntries(Object.keys(SU).map(k => { const d = GLOBE.suturePath(REP, SU[k]).deep, m = GLOBE.mer(d), w = GLOBE.wallOf(m.z, m.rho); return [k, w.d / GLOBE.T(w.s)]; })) };
  });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

// ---------------------------------------------------------------- 2. narration ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const ang = (a, b) => { let d = Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d) * 180 / Math.PI; };
function modelChecks(ctx) {
  const F = ctx.F, R = [], ok = (c, m) => R.push([!!c, m]), S = F.SU;
  // 1-1: zone II ends 5 mm behind the limbus; this wound stops 4 mm behind it (zone II); ora 6.2 mm; rectus insertions behind zone II
  ok(F.N.zone2 === 5 && line(ctx, '1-1', 1).includes('5 mm'), `1-1 zone II ends at ${F.N.zone2} mm in the model and the narration`);
  ok(F.WND.s1 === 4 && F.WND.s1 < F.N.zone2 && line(ctx, '1-1', 2).includes('4 mm'), `1-1 wound ends ${F.WND.s1} mm behind the limbus (< 5: zone II)`);
  ok(F.N.ora === 6.2 && line(ctx, '1-1', 3).includes('6.2'), `1-1 ora in the model ${F.N.ora} mm = narration`);
  ok(F.WND.h === 10 && line(ctx, '1-1', 2).includes('10 點'), `1-1 wound at ${F.WND.h} o'clock as narrated`);
  // 1-2: the pupil drawn peaks toward the wound; after reposition it is round again (3-2)
  ok(ang(F.pupilPeak, F.woundLimbus) < 2 && Math.hypot(...F.pupilPeak) > F.pupilR + 0.5, `1-2 drawn pupil peaks toward the wound (${f2(Math.hypot(...F.pupilPeak))} mm from the centre)`);
  ok(near(Math.hypot(...F.pupilPeakRep), F.pupilR, 0.02) && line(ctx, '3-2', 4).includes('圓形'), `3-2 after reposition the pupil is round (${f2(Math.hypot(...F.pupilPeakRep))} mm)`);
  // 3-2: paracentesis opposite the wound
  { const d = Math.abs(((F.para[0].h - F.WND.h) % 12 + 12) % 12); ok(d === 6 && line(ctx, '3-2', 0).includes('對側'), `3-2 paracentesis at ${F.para[0].h} o'clock, opposite the ${F.WND.h} o'clock wound`); }
  // 2-4 / field: each instrument points the same way in the field overview and the microscope view; right hand lower right, left lower left
  ok(ang(F.field.R, F.rigField.R) < 0.01 && ang(F.field.L, F.rigField.L) < 0.01, '2-4 instrument directions are the same in the field overview and the microscope');
  ok(F.rigField.R[0] > 0 && F.rigField.R[1] > 0 && F.rigField.L[0] < 0 && F.rigField.L[1] > 0, '2-2 / 2-4 right hand from the lower right, left hand from the lower left (surgeon at 12)');
  // holder at right angles to the needle: from above it runs along the wound, perpendicular to the suture line; grasp 40% from the swage
  for (const [k, r] of Object.entries(F.rigs)) { const t = [r.line[1][0] - r.line[0][0], r.line[1][1] - r.line[0][1]], c = Math.abs(r.R.dir[0] * t[0] + r.R.dir[1] * t[1]) / Math.hypot(...t);
    ok(c < 0.02, `${k}: needle holder at right angles to the suture line in the microscope view (cos ${c.toFixed(3)})`);
    const L = r.needle.reduce((a, q, i) => i ? a + Math.hypot(q[0] - r.needle[i - 1][0], q[1] - r.needle[i - 1][1]) : 0, 0); let acc = 0, at = 0;
    for (let i = 1; i < r.needle.length; i++) { acc += Math.hypot(r.needle[i][0] - r.needle[i - 1][0], r.needle[i][1] - r.needle[i - 1][1]); if (Math.hypot(r.needle[i][0] - r.R.tip[0], r.needle[i][1] - r.R.tip[1]) < 1e-9) { at = acc; break; } }
    ok(at / L > 0.5 && line(ctx, '2-3', 0).includes('稍微靠近針尾'), `${k}: holder grips ${(100 * (1 - at / L)).toFixed(0)}% of the projected needle from the swage (closer to the swage)`); }
  // 4-2: the limbal suture drawn 1 mm each side, 80% deep, not full thickness
  ok(S.L0.b === 1 && near(F.depth.L0, 0.8, 0.02) && F.depth.L0 < 1 && line(ctx, '4-2', 2).includes('1 mm') && line(ctx, '4-2', 2).includes('80%'), `4-2 limbal suture ${S.L0.b} mm each side, ${f2(F.depth.L0)} of the wall (as narrated, not full thickness)`);
  // 5-1: every corneal suture 70–90% deep and 0.5–1 mm from the wound edge; the one shown is 0.85 mm, 80%
  for (const k of ['L0', 'C1', 'C2', 'C3']) ok(F.depth[k] >= 0.7 - 1e-9 && F.depth[k] <= 0.9 && S[k].b >= 0.5 && S[k].b <= 1, `5-1 ${k}: depth ${f2(F.depth[k])} in 70–90%, bite ${S[k].b} mm in 0.5–1 mm`);
  ok(S.C2.b === 0.85 && near(F.depth.C2, 0.8, 0.02) && (ctx.screen['5-1'] || []).some(t => t.includes('0.85 mm')), `5-1 the suture shown is 0.85 mm each side and 80% deep, as labelled`);
  // 5-2: peripheral long and shallow, central short and deep; corneal part 3.5 mm with 3 sutures; stops 3 mm from the visual axis
  ok(S.C1.b > S.C2.b && S.C2.b > S.C3.b && F.depth.C1 < F.depth.C2 && F.depth.C2 < F.depth.C3 && line(ctx, '5-2', 0).includes('周邊的縫線長而淺'), `5-2 peripheral → central: bite ${S.C1.b} > ${S.C2.b} > ${S.C3.b} mm, depth ${f2(F.depth.C1)} < ${f2(F.depth.C2)} < ${f2(F.depth.C3)}`);
  ok(-F.WND.s0 === 3.5 && ['C1', 'C2', 'C3'].every(k => S[k].s < 0 && S[k].s > F.WND.s0) && line(ctx, '5-2', 1).includes('3.5 mm，縫三針'), `5-2 corneal part ${-F.WND.s0} mm, 3 corneal sutures inside it`);
  { const gaps = [0, -0.9, -2.1, -3.0, F.WND.s0].map((v, i, a) => i ? a[i - 1] - v : 0).slice(1); ok(Math.max(...gaps) <= 1.5 + 1e-9, `5-2 each corneal suture covers ≤ 1.5 mm of wound (largest gap ${f2(Math.max(...gaps))} mm)`); }
  ok(near(F.rhoS0, 3, 0.02) && line(ctx, '5-2', 2).includes('3 mm'), `5-2 the wound stops ${f2(F.rhoS0)} mm from the visual axis`);
  // 6-1 / 6-2: wound ends 4 mm behind the limbus; three scleral sutures between the limbus and the end
  ok(F.WND.s1 === 4 && line(ctx, '6-1', 2).includes('4 mm'), `6-1 wound end ${F.WND.s1} mm as narrated`);
  ok(['S1', 'S2', 'S3'].every(k => S[k].s > 0 && S[k].s < F.WND.s1) && line(ctx, '6-2', 2).includes('三針'), '6-2 three scleral sutures inside the scleral part');
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
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意', '病例'].includes(src) || texts.join('').includes(src);
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(page) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { F: clone(page), text, segs: clone(SEGS), screen: clone(page.screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const page = await fromPage(), screen = page.screen;
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(page));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '4-1').lines[1] += '2 mm'; }],
      ['on-screen number without a source', c => { c.screen['6-2'].push('間距 1.2 mm'); }],
      ['ledger entry not used', c => { c.ledger['2-2']['99'] = 'Li 2021'; }],
      ['ledger source not cited in the segment', c => { c.ledger['3-1']['24'] = 'Hammond 1996'; }],
      ['citation not in REFS', c => { c.screen['5-1'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '2-2').src[1][1] = 'Li 2020'; }],
      ['zone II length', c => { c.F.N.zone2 = 6; }],
      ['wound end', c => { c.text['6-1'].lines[2] = c.text['6-1'].lines[2].replace('4 mm', '5 mm'); }],
      ['pupil not peaked', c => { c.F.pupilPeak = [-1, -1]; }],
      ['paracentesis not opposite', c => { c.F.para[0].h = 2; }],
      ['field and microscope disagree', c => { c.F.field.R = [1, 0]; }],
      ['holder not at right angles', c => { c.F.rigs.C2.R.dir = [0, 1]; }],
      ['grip near the tip', c => { c.F.rigs.L0.R.tip = c.F.rigs.L0.needle[3]; }],
      ['corneal suture too shallow', c => { c.F.depth.C1 = 0.6; }],
      ['central suture longer than peripheral', c => { c.F.SU.C3.b = 1.1; }],
      ['visual-axis distance', c => { c.F.rhoS0 = 2.5; }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(page); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
