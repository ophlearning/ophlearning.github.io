// 目前只有列印單用的數字帳本；影片的檢查之後補。
// Number ledger of this video: segment → { number: source }. The printed sheets (videos/tools/print, numcheck.js) read LEDGER from this
// file as text; a table row of print/anatomy.js names its segment. Sources: a citation in anim/segments.js REFS, or 院內常規 / 示意 /
// 結構 / 病例. Segments '1' … '8' = the checklist items; the others = one paper each (anatomy table).
// `node check.js`: every citation in the ledger is one of REFS (fails otherwise).
const path = require('path');
const { REFS } = require(path.join(__dirname, 'anim', 'segments.js'));

const LEDGER = {
  '1': { '6': 'Pushker 2025', '8': 'Pushker 2025', '7.5': 'Beigi 2008', '11': 'Beigi 2008' },
  '8': { '7': 'Auguste 2023', '4': 'Auguste 2023', '54': 'Auguste 2023', '8': 'Auguste 2023' },
  'Gioia': { '1.5': 'Gioia 1987' },
  'Vahdani': { '641': 'Vahdani 2018', '84': 'Vahdani 2018', '100': 'Vahdani 2018', '0': 'Vahdani 2018', '89.1': 'Vahdani 2018', '9': 'Vahdani 2018' },
  'Poon': { '100': 'Poon 2019', '92': 'Poon 2019', '90': 'Poon 2019', '0': 'Poon 2019', '7': 'Poon 2019', '6.5': 'Poon 2019' },
  'Barrett': { '225': 'Barrett 2012', '54': 'Barrett 2012', '92.4': 'Barrett 2012' },
  'Prendes': { '70': 'Prendes 2020', '1.4': 'Prendes 2020' },
  '院內': {},
};

const FREE = ['院內常規', '示意', '結構', '病例'];
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})([a-z])?/;
const inRefs = s => { const m = CITE.exec(s); return !!m && REFS.some(r => r.startsWith(m[1]) && r.includes(m[2] + ';')); };
let n = 0, bad = [];
for (const [seg, nums] of Object.entries(LEDGER)) for (const [num, src] of Object.entries(nums))
  for (const s of String(src).split('；').map(x => x.trim())) { n++; if (!FREE.includes(s) && !inRefs(s)) bad.push(`${seg} ${num} → ${s}`); }
if (bad.length) { console.log('FAIL ledger sources not in REFS: ' + bad.join(', ')); process.exitCode = 1; }
else console.log(`PASS ledger: ${n} number / source entries, every citation is in REFS`);
if (typeof module !== 'undefined') module.exports = { LEDGER };
