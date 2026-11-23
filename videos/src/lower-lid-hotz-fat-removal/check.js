// 下眼瞼 Hotz＋去眼袋：目前只有列印單用的數字帳本；影片的檢查之後補。
// LEDGER：段落 → { 數字: 出處 }。出處只能是 REFS 裡的文獻（作者 年份）、院內常規、示意、結構或病例（病例＝站長 2026-11-23 確認的病例摘要
// 與門診紀錄重點）。列印單（print/）每個數字都由 videos/tools/print/numcheck.js 對這本帳檢查；anatomy.js 表格的第三欄就是這裡的段落名稱。
// 這個檔案用 node 執行時只檢查帳本本身：每個出處都在 REFS 裡，或是上面五種之一。
const { REFS } = require('./anim/segments.js');

const LEDGER = {
  'case': { '3': '病例' },                                                                         // TBUT 3 秒
  'tmpl': { '6-0': '院內常規', '5': '院內常規' },                                                     // orbicularis → retractor aponeurosis 6-0 Prolene ×5
  'plt': { '50': 'Kaufman 2015', '10': 'Kaufman 2015' },                                           // major elective nonneuraxial surgery < 50 × 10⁹/L
  'rbh': { '0.055': 'Hass 2004', '0.0045': 'Hass 2004', '3': 'Hass 2004', '24': 'Hass 2004' },      // 眶內出血 0.055%、永久視力喪失 0.0045%；多在 3 小時內、24 小時後下降
  'ocs': { '15': 'Murali 2021', '8': 'Murali 2021', '21': 'Murali 2021', '30': 'Murali 2021', '40': 'Murali 2021', '2': 'McCallum 2019' },
  'fat': { '36': 'Coban 2023', '50': 'Coban 2023' },                                               // 50 具屍體；三團型（Type 1）36%
  'dip': { '12': 'Syniuta 2003', '7': 'Syniuta 2003', '5': 'Syniuta 2003' },                         // 持續複視 12 位：inferior rectus 7、superior oblique 5
  'dry': { '26.5': 'Prischmann 2013', '892': 'Prischmann 2013' },                                  // 術後乾眼症狀 26.5%（892 例）
  'fus': { '2.4': 'Kakizaki 2006', '19': 'Kakizaki 2006', '7': 'Kakizaki 2006' },                   // 眶隔與囊瞼筋膜在瞼板下 2.38 mm 融合，19 眼中 7 眼看得到
};

const FREE = ['院內常規', '示意', '結構', '病例'];
const inRefs = s => { const m = s.match(/^([A-Z][A-Za-zÀ-ž'\-]+) (\d{4})[a-z]?$/); return !!m && REFS.some(r => r.startsWith(m[1]) && r.includes(m[2] + ';')); };
let fail = 0;
for (const [seg, nums] of Object.entries(LEDGER)) for (const [n, src] of Object.entries(nums)) for (const s of src.split('；').map(x => x.trim())) {
  const ok = FREE.includes(s) || inRefs(s); if (!ok) fail++;
  if (!ok) console.log(`FAIL ${seg} ${n}: 「${s}」 is not in REFS nor ${FREE.join(' / ')}`);
}
// self-check: a source that is not in REFS must fail
console.assert(!inRefs('Smith 1901') && inRefs('Hass 2004'), 'inRefs self-check');
console.log(fail ? `${fail} ledger source(s) failed` : `PASS ledger: ${Object.values(LEDGER).reduce((a, o) => a + Object.keys(o).length, 0)} numbers, every source in REFS or ${FREE.join(' / ')}`);
if (typeof module !== 'undefined') module.exports = { LEDGER };
process.exitCode = fail ? 1 : 0;
