// Surgical parameters of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration
// and the number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (listed in overview-notes.md).
const LRP = {
  mrdPre: 1.5,                    // 術前 MRD1：示意（畫面標「示意」，旁白不講數字）
  mrdPost: 2.5,                   // 眉毛固定後確認 MRD1 約 2.5 mm：院內常規
  browRaise: 2.87,                // 術前 frontalis 撐高的量＝矯正後的下降量：Kokubo 2019a 瞳孔中線平均 2.87 mm（範圍 2.50–2.87）
  incH: [2.5, 4, 4],              // 下切口距睫毛線：內側、中央、外側（mm，沿皮膚量）：院內常規
  excW: 5,                        // 切除皮膚寬度（mm，中央）：院內常規
  incX: [5.75, -5.75],            // 內側、外側那一點的位置＝角膜緣上方（mm，鼻側為正）：示意（範本只給高度）
  tarN: 3,                        // levator 固定到瞼板 4-0 vicryl ×3（內、中、外）：院內常規
  creaseN: 4,                     // orbicularis 固定到 levator 6-0 Prolene ×4：院內常規
  browN: 1,                       // 眉下組織固定到骨膜 4-0 vicryl ×1：院內常規
  roofBelow: 5, roofTh: 1.8,      // 眶上緣下 5 mm 的 ROOF 約 1.8 mm：Manta 2025
  notchMid: [22, 24],             // 眶上切跡距中線約 22–24 mm：Pruksapong 2022（泰國屍體 男 22.34、女 23.58）
};
const INC = { incH: LRP.incH, excW: LRP.excW, incX: LRP.incX };
if (typeof module !== 'undefined') module.exports = { LRP, INC };
