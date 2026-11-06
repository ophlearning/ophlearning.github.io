// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 示意 / 結構 / 病例 (structure: list numbers, axis zero; 病例 = the case summary).
// 2. Narration ↔ model: each number or spatial claim the narration makes about the procedure is checked on the orbit model.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const M = path.join(__dirname, '..', '..', 'models');
global.LID = require(path.join(M, 'eyelid', 'lid.js'));
global.CORONAL = require(path.join(M, 'eyelid', 'coronal.js'));
global.LOWER = require(path.join(M, 'eyelid', 'lower.js'));
global.LOWERC = require(path.join(M, 'eyelid', 'lower-coronal.js'));
global.CANTHUS = require(path.join(M, 'eyelid', 'canthus.js'));
const ORBIT = require(path.join(M, 'orbit', 'orbit.js'));
const { SEGS, REFS } = require('./anim/segments.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  '1-1': { '4.5': 'Oester 2012b' },
  '1-2': { '8': 'Murali 2021', '21': 'Murali 2021', '30': 'Murali 2021', '40': 'Murali 2021' },
  '1-4': { '97': 'Hayreh 2004', '240': 'Hayreh 2004', '2': 'McCallum 2019', '0': '結構' },
  '2-1': { '1': 'Murali 2021' },
  '4-1': { '1.5': 'Gioia 1987', '9.7': 'Gioia 1987' },
  '4-2': { '8': 'Haubner 2015', '7': 'Haubner 2015', '20': 'Haubner 2015', '14': 'Blandford 2018' },
  '5-1': { '8': 'Haubner 2015', '2': 'Haubner 2015' },
  '5-2': { '4': 'Kitaguchi 2019', '2': 'Kitaguchi 2019', '1': 'Kitaguchi 2019' },
  '6-1': { '10': 'Zoumalan 2008', '130': 'Dalley 1989', '120': 'Dalley 1989', '113': '示意' },
  '7': { '1': 'Murali 2021' },
};
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);

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
function modelChecks(ctx) {
  const O = ctx.O, R = [], ok = (c, m) => R.push([!!c, m]);
  // 1-1: the drawn proptosis is the number said (4.5 mm, Oester 2012b): the corneal apex moves forward that much
  { const ap = pr => Math.min(...O.globeOutline(pr).pts.map(p => p[1])), pr = O.axial({ state: { heme: 1 } }).prop, d = ap(0) - ap(pr);
    ok(line(ctx, '1-1', 5).includes('4.5 mm') && near(d, 4.5, 0.05) && near(ctx.PROP, 4.5, 1e-9), `1-1 drawn proptosis ${f2(d)} mm (narration 4.5 mm)`); }
  // 4-1: Whitnall's tubercle 1.5 mm behind the rim (Gioia 1987)
  { const d = Math.hypot(CANTHUS.TUB[0] - CANTHUS.RIM_E[0], CANTHUS.TUB[1] - CANTHUS.RIM_E[1]);
    ok(line(ctx, '4-1', 1).includes('1.5 mm') && near(d, 1.5, 0.02), `4-1 tubercle ${f2(d)} mm inside the rim (narration 1.5 mm)`); }
  // 2-1 / 3-1: the hemostat and the canthotomy run from the commissure horizontally to the lateral rim, at the same x in both views
  { const fr = O.front({ state: { canthotomy: 1 } }), ax = O.axial({ state: { heme: 1, canthotomy: 1 } });
    ok(line(ctx, '3-1', 0).includes('水平剪到外側眶緣') && near(fr.A.canthotomy[1], CORONAL.LC[1], 1e-6) && fr.A.canthotomy[0] < CORONAL.LC[0] && near(ax.A.lc[0], CORONAL.LC[0], 0.3),
      `3-1 canthotomy horizontal from the commissure (y ${f2(CORONAL.LC[1])}) toward the rim; commissure x axial ${f2(ax.A.lc[0])} = front ${f2(CORONAL.LC[0])}`); }
  // 4-2: scissors point down (toward the chin) for the inferior crus; 5-1: up for the superior crus
  { const A = O.front({ state: { window: 1 } }).A;
    ok(line(ctx, '4-2', 1).includes('剪刀尖朝下') && A.scInf.dir[1] > 0.9, `4-2 inferior cantholysis: scissors direction y ${f2(A.scInf.dir[1])} (down; narration 朝下)`);
    ok(line(ctx, '5-1', 2).includes('剪刀朝上') && A.scSup.dir[1] < -0.9, `5-1 superior cantholysis: scissors direction y ${f2(A.scSup.dir[1])} (up; narration 朝上)`);
    ok(A.infO[1] > CORONAL.LC[1] && A.supO[1] < CORONAL.LC[1], '4-1 the inferior crus is below, the superior crus above the commissure (narration 連下眼瞼／連上眼瞼)'); }
  // 4-2: after the inferior crus is cut the lid is free (no tension) and can be pulled off the globe (narration 整片鬆開、離開眼球)
  { const r0 = O.axial({ state: { heme: 1, canthotomy: 1 } }), r1 = O.axial({ state: { heme: 1, canthotomy: 1, infLysis: 1, pull: 1 } });
    ok(line(ctx, '4-2', 3).includes('整片鬆開') && r0.tension > 1 && r1.tension === 0 && r1.A.pull, `4-2 lid tension before ${f2(r0.tension)} → after ${f2(r1.tension)}; the released lid is pulled off the globe`);
    ok(line(ctx, '3-1', 1).includes('眼瞼還沒鬆') && r0.tension > 1, `3-1 after canthotomy alone the lid is still stretched (${f2(r0.tension)} mm)`); }
  // 6-1: the angle shown is the model's posterior globe angle and below the 120° threshold said in the narration (picture marked 示意)
  { const n = O.nerve(O.axial({ state: { heme: 1 } }).prop), shown = (ctx.screen['6-1'] || []).find(t => /globe tenting \d+°/.test(t)) || '';
    ok(shown.includes(`${n.angle.toFixed(0)}°`) && shown.includes('示意') && n.angle < 120 && line(ctx, '6-1', 5).includes('小於 120°'), `6-1 angle on screen 「${shown}」 = model ${n.angle.toFixed(1)}° < 120°, marked 示意`); }
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
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { O: ORBIT, PROP: ORBIT.PROP_OCS, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const wrap = (o, patch) => Object.assign(Object.create(o), patch);
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '4-2').lines[2] += '3 mm'; }],
      ['on-screen number without a source', c => { c.screen['5-1'].push('上提 1.7 mm'); }],
      ['ledger entry not used', c => { c.ledger['1-2']['99'] = 'Murali 2021'; }],
      ['ledger source not cited in the segment', c => { c.ledger['4-1']['1.5'] = 'Haubner 2015'; }],
      ['citation not in REFS', c => { c.screen['1-4'].push('Smith 2020'); }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Murali 2020'; }],
      ['proptosis', c => { c.PROP = 4.0; }],
      ['proptosis narration', c => { c.text['1-1'].lines[5] = c.text['1-1'].lines[5].replace('4.5', '5'); }],
      ['tubercle depth', c => { c.text['4-1'].lines[1] = c.text['4-1'].lines[1].replace('1.5', '2'); }],
      ['canthotomy direction', c => { c.text['3-1'].lines[0] = c.text['3-1'].lines[0].replace('水平剪到', '往下剪到'); }],
      ['inferior scissors', c => { c.O = wrap(ORBIT, { front: o => { const r = ORBIT.front(o); r.A.scInf = { ...r.A.scInf, dir: [0, -1] }; return r; } }); }],
      ['superior scissors', c => { c.text['5-1'].lines[2] = c.text['5-1'].lines[2].replace('剪刀朝上', '剪刀朝下'); }],
      ['released lid', c => { c.O = wrap(ORBIT, { axial: o => { const r = ORBIT.axial(o); if ((o.state || {}).infLysis) r.tension = 2; return r; } }); }],
      ['tenting angle on screen', c => { c.screen['6-1'] = c.screen['6-1'].map(t => t.replace(/\d+°（示意）/, '125°（示意）')); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
