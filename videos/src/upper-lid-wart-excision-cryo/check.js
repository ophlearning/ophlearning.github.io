// 目前只有列印單用的數字帳本；影片的檢查之後補。
// Number ledger of the print sheets (videos/tools/print/numcheck.js reads LEDGER as text, without running this file): key → { number:
// source }. A source is a reference in anim/segments.js REFS (「Author year」), 院內常規, 示意, 結構 or 病例 (the case summary the site
// owner confirmed on 2026-11-23: 「OD 上眼瞼 wart，2 週，…」). A number used for two things lists both sources separated by 「；」.
// The anatomy sheet's table rows name these keys (third column). `node check.js` checks that every source is a REFS citation or one of
// the free sources, and fails otherwise.
const LEDGER = {
  'case': { '2': '病例' },                                                                          // 病程 2 週
  'path': { '692': 'Kersten 1997', '13': 'Kersten 1997', '1.9': 'Kersten 1997', '10': 'Kersten 1997' },   // 臨床良性 692 → 13 個（1.9%）惡性，10 個 BCC
  'margin': { '150': 'Custer 2024' },                                                                // 瞼緣 nevus 150 個：superficial excision＋cauterization
  'lash': { '2': 'Sullivan 1976', '30': 'Sullivan 1976' },                                           // 瞼緣 2 個 freeze–thaw 到 −30 °C 破壞睫毛
  'cryo': { '10': 'Luk 2006', '2': 'Luk 2006' },                                                     // 皮膚 common wart：液態氮 10 秒 × 2 個 freeze–thaw
  'follicle': { '1.8': 'Elder 1997', '95': 'Elder 1997', '2.4': 'Elder 1997' },                     // 上眼瞼毛囊深 1.8 mm；碰到 95% 要 2.4 mm
};

if (require.main === module) {
  global.document = global.document || {};
  const { REFS } = require('./anim/segments.js');
  const CITE = /^([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})$/, FREE = ['院內常規', '示意', '結構', '病例'];
  const bad = [];
  for (const [key, nums] of Object.entries(LEDGER)) for (const [n, src] of Object.entries(nums)) for (const s of src.split('；').map(x => x.trim())) {
    const m = CITE.exec(s), ok = FREE.includes(s) || (m && REFS.some(r => r.startsWith(m[1]) && r.includes(m[2] + ';')));
    if (!ok) bad.push(`${key} ${n}: 「${s}」`); }
  // self-test: a source that is not in REFS must be caught
  const m0 = CITE.exec('Smith 1901'), caught = !(m0 && REFS.some(r => r.startsWith(m0[1]) && r.includes(m0[2] + ';')));
  if (bad.length || !caught) { console.error('FAIL ledger sources: ' + (bad.join(' | ') || 'self-test did not catch a fake source')); process.exit(1); }
  console.log(`PASS ledger: ${Object.values(LEDGER).reduce((a, o) => a + Object.keys(o).length, 0)} numbers, every source in REFS or 院內常規／示意／結構／病例`);
}
if (typeof module !== 'undefined') module.exports = { LEDGER };
