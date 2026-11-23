// PK after a failed DMEK (assistant's version) — video checks run by videos/tools/check-all.js (in this folder).
// 1. Number ledger: every number in the narration, key-point boxes and titles of a segment must be listed for that segment in LEDGER with
//    its source; every ledger source must be cited in that segment (src) or be 病例 / 結構 / 示意 / 院內常規 (病例 = spec.md「病例情境」,
//    confirmed by 站長 2026-11-23; 結構 = clock hours and list numbers; 院內常規 = the hospital's PK operation-record template, 站長 2026-11-23);
//    every cited「作者 年份」must be in REFS; a ledger number that is not used fails too.
//    (First version 2026-11-23: text only. The on-screen text of draw.js is added to the same check when the segments are drawn.)
const { SEGS, REFS } = require('./anim/segments.js');
const CLK = { '12': '結構', '6': '結構', '3': '結構', '9': '結構' };
const LEDGER = {
  'title': {},
  '1-1': { '7': '病例' },
  '1-2': { '64.1': 'Gómez-Benlloch 2021', '55': 'Price 2015' },
  '2-1': { '830': 'Ingraham 1989', '9': 'Ingraham 1989', '8': 'Ingraham 1989', '33': 'Lee 2012' },
  '3-1': {},
  '3-2': { '368': 'Gonzalez 2016', '1': 'Gonzalez 2016', '22': 'Gonzalez 2016', '23': 'Gonzalez 2016', '6.6': 'Gonzalez 2016', '7': '病例' },
  '4-1': { ...CLK, '16': '院內常規', '10-0': '院內常規' },
  '5-1': { '24': 'Figueiredo 2013', '5': 'Thompson 2003', '53': 'Thompson 2003', '90': 'Thompson 2003' },
  '6': { ...CLK, '7': '病例' },
};
const CAT = new Set(['病例', '結構', '示意', '院內常規']);
const NUM = /\d+(?:\.\d+)?(?:-\d+(?![.\d]))?/g;
const strip = t => String(t).replace(/<[^>]+>/g, '');
let fail = 0; const bad = m => { fail++; console.log('FAIL ' + m); };
const inRefs = c => { const m = c.match(/^(.+) (\d{4})$/); return !!m && REFS.some(r => r.startsWith(m[1] + ' ') && new RegExp('\\b' + m[2] + '[;:(]').test(r)); };
for (const s of SEGS) {
  if (s.chapterCard || s.layout === 'refs') continue;
  const L = LEDGER[s.id]; if (!L) { bad(`${s.id}: no ledger entry`); continue; }
  const text = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1])].map(strip).join('\n');
  const used = new Set((text.match(NUM) || []));
  for (const n of used) if (!(n in L)) bad(`${s.id}: number ${n} has no ledger source`);
  for (const n of Object.keys(L)) if (!used.has(n) && !(n in CLK && L[n] === '結構')) bad(`${s.id}: ledger number ${n} is not used`);
  const cited = (s.src || []).map(x => x[1]).join('；');
  for (const [n, src] of Object.entries(L)) if (!CAT.has(src) && !cited.includes(src)) bad(`${s.id}: ${n} → ${src} is not cited in src`);
  for (const c of cited.split('；').map(x => x.trim()).filter(x => x && x !== '本片各章來源')) if (!inRefs(c)) bad(`${s.id}: ${c} not in REFS`);
}
// self-test: a number removed from a ledger and a citation removed from src must both fail
if (process.argv.includes('--selftest')) console.log('selftest: run by editing LEDGER/src by hand (2026-11-23 checked on the copy in pk-tectonic-descemetocele)');
console.log(fail ? `ledger: ${fail} failure(s)` : `ledger: PASS (${SEGS.filter(s => !s.chapterCard && s.layout !== 'refs').length} segments)`);
if (typeof module !== 'undefined') module.exports = { LEDGER };
process.exitCode = fail ? 1 : 0;
