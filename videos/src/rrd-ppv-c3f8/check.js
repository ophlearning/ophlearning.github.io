// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 示意 / 結構 / 病例 (結構 = clock-hour names, list numbers; 病例 = the case
//    summary confirmed by 站長 2026-11-12, spec.md「病例情境」).
// 2. Narration ↔ model: added once the posterior-segment model (videos/models/posterior/) exists; text stage (2026-11-12) has none.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error.
// --list prints the numbers found per segment (to fill the ledger).
const path = require('path');
const { SEGS, REFS } = require('./anim/segments.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '11': '病例' },
  '1-1': { '3': '結構', '9': '結構', '11': '病例', '12': '病例', '5': '病例', '1': '病例' },
  '1-2': { '12': 'Yoshida 2018', '747': 'Yoshida 2018', '89': 'Yoshida 2018', '11': '病例', '844': 'Shunmugam 2014', '38.9': 'Shunmugam 2014' },
  '1-3': { '930': 'Kontos 2017b', '1.1': 'Kontos 2017b', '1.8': 'Callizo 2017', '19.8': 'Callizo 2017', '24': 'Sothivannan 2022' },
  '2-1': { '3': 'EyeWiki 2026a', '4': 'Duker 2021', '7.6': 'Li 2025', '7.0': 'Li 2025', '83': 'Singh 2008', '39': 'Singh 2008' },
  '3-2': { '11': '病例', '12': '結構' },
  '4-1': { '110': 'Lai 2019' },
  '5-1': { '106': 'Govetto 2024', '11': '病例', '1.2': 'Jackson 2013', '1.6': 'Jackson 2013' },
  '5-2': { '1.9': 'Neffendorf 2017', '5.8': 'Neffendorf 2017' },
  '6-1': { '11': '病例' },
  '6-2': { '4.5': 'Figueroa 2013', '10.3': 'Garg 2012' },
  '7-1': { '360': 'Wang 2020' },
  '7-2': { '4': 'Vaziri 2016', '3': 'Vaziri 2016', '14': 'Vaziri 2016', '12': 'Brosh 2014', '16': 'Foulsham 2021',
           '50': 'Kanclerz 2018b', '10': 'Kanclerz 2018b', '20': 'Kanclerz 2018b', '40': 'Kanclerz 2018b' },
  '7-3': { '25': 'Williams 1990', '35': 'Shunmugam 2011', '50': 'Shunmugam 2011', '11.2': 'Woo 2009', '38.5': 'Duval 2014' },
  '8-1': { '11': '病例' },
  '8-2': { '24': 'Casswell 2020', '42': 'Casswell 2020', '56': 'Casswell 2020' },
  '8-3': { '37': 'Lee 2004', '3': 'Silvanus 2008', '109': 'Mills 2001', '15': 'Kontos 2017a', '67.7': 'Kontos 2017a' },
  '8-4': { '43': 'Chen 1997', '25': 'Chen 1997', '88': 'Chen 1997', '24': 'Chen 1997', '8': 'Muether 2011', '12': 'Muether 2011',
           '72.9': 'Lee 2014', '50.2': 'Jackson 2013', '68.7': 'Jackson 2013' },
  '9': { '11': '病例', '50': 'Kanclerz 2018b' },
};
// citations: 「Author 2018」; two-word surnames used in this video are listed explicitly (Ferro Desideri)
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Desideri)?) (\d{4})([a-z])?/g;
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

// ---------------------------------------------------------------- 2. narration ↔ model (none yet: the panels are not drawn)
function modelChecks() { return []; }

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const r of REFS) ok(/\d{4};/.test(r), `reference has 「year;」: ${r.slice(0, 50)}`);
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
  // every reference is cited somewhere (a reference nobody cites is a leftover)
  const allSrc = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).flatMap(cites);
  for (const r of REFS) ok(allSrc.some(c => r.startsWith(c.who) && r.includes(c.year + ';')), `reference is cited in a segment: ${r.slice(0, 50)}`);
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|reference/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '2-1').lines[3] += '，約 5 mm'; }],
      ['key-box number without a source', c => { c.segs.find(s => s.id === '7-2').keys[0][1] += '（18%）'; }],
      ['on-screen number without a source', c => { c.screen['8-1'] = ['氣泡 60%']; }],
      ['ledger entry not used', c => { c.ledger['1-3']['99'] = 'Callizo 2017'; }],
      ['ledger source not cited in the segment', c => { c.ledger['5-2']['1.9'] = 'Jackson 2013'; }],
      ['citation not in REFS', c => { c.screen['4-2'] = ['Smith 2020']; }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Yoshida 2019'; }],
      ['two-word surname not in REFS', c => { c.segs.find(s => s.id === '1-4').src[0][1] = 'Ferro Desideri 2023'; }],
      ['reference cited nowhere', c => { const s = c.segs.find(x => x.id === '2-2'); s.src = s.src.filter(x => x[1] !== 'Tei 2005'); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(screen); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
