// Surgical parameters of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and
// the number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (listed in overview-notes.md).
// Levator resection and brow: the department template, the same reading as the first video (values copied on 2026-11-06 from
// ../../levator-resection-brow-fixation/anim/params.js; this video keeps its own copy so the two cases can differ after their OP notes).
const LRP = {
  mrdPre: 1.5,                    // 術前 MRD1：示意（畫面標「示意」，旁白不講數字）
  mrdPost: 2.5,                   // 眉毛固定後確認 MRD1 約 2.5 mm：院內常規
  browRaise: 2.87,                // 術前 frontalis 撐高的量＝矯正後的下降量：Kokubo 2019 瞳孔中線平均 2.87 mm（範圍 2.50–2.87）
  incH: [2.5, 4, 4],              // 下切口距睫毛線：內側、中央、外側（mm，沿皮膚量）：院內常規；marginal rotation 也從這條切口進去
  excW: 5,                        // 切除皮膚寬度（mm，中央）：院內常規
  incX: [5.75, -5.75],            // 內側、外側那一點的位置＝角膜緣上方（mm，鼻側為正）：示意（範本只給高度）
  tarN: 3,                        // levator 固定到瞼板 4-0 vicryl ×3：院內常規
  creaseN: 4,                     // levator 固定到 orbicularis 6-0 Prolene ×4：院內常規
  browN: 1,                       // 眉下組織固定到骨膜 4-0 vicryl ×1：院內常規
};
const INC = { incH: LRP.incH, excW: LRP.excW, incX: LRP.incX };
// Upper-lid marginal rotation through the lid-crease incision: the steps follow Cruz 2015a/b; this case's specifics are in no template
// we have, so the drawn positions and the suture path are 示意 (依院內常規).
const MRP = {
  entr: 1,                        // 術前瞼緣內轉（模型的 curl 1）：示意（內翻的類型與程度待刀後確認）
  after: 0.25,                    // 綁緊後的 curl（同 PLTR 影片 6-2 的畫法）：示意
  cutMm: 3,                       // Cruz 2015a：離瞼緣 3 mm 全層切開瞼板（圖說 3–4 mm）；模型 S_CUT＝3；這台的位置示意
  sutN: 3,                        // Cruz 2015a：三針雙針 6-0 polyglactin（內、中、外）；這台的針數與路徑：院內常規／示意
  blade: 15,                      // Cruz 2015a：15 號刀＋Westcott 剪
  lids: 60, lashes: 2,            // Cruz 2015a：60 片眼瞼；1 片瞼緣位置正確但內側 2 根睫毛碰角膜
};
// Electrolysis of the upper lid (Elder 1997)
const EP = {
  follicleUp: 1.8, follicleLo: 0.9,   // 毛囊深度：上眼瞼 1.8、下眼瞼 0.9 mm（Elder 1997）
  reach95Up: 2.4, reach95Lo: 1.4,     // 碰到 95% 的毛囊要插多深：上 2.4、下 1.4 mm（Elder 1997）
};
// Ptosis surgery → upper-lid entropion (Cruz 2022) and lagophthalmos (Tucker 2000)
const IX = { buckleN: 10, upperThird: 70, anteriorN: 9, lago: [60, 33, 9] };
if (typeof module !== 'undefined') module.exports = { LRP, INC, MRP, EP, IX };
