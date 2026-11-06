// Surgical parameters of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and
// the number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (listed in overview-notes.md).
// Upper lid: the department template, the same reading as the first video (values copied on 2026-11-06 from
// ../../levator-resection-brow-fixation/anim/params.js; this video keeps its own copy so the two cases can differ after their OP notes).
const LRP = {
  mrdPre: 1.5,                    // 術前 MRD1：示意（畫面標「示意」，旁白不講數字）
  mrdPost: 2.5,                   // 眉毛固定後確認 MRD1 約 2.5 mm：院內常規
  browRaise: 2.87,                // 術前 frontalis 撐高的量＝矯正後的下降量：Kokubo 2019 瞳孔中線平均 2.87 mm（範圍 2.50–2.87）
  incH: [2.5, 4, 4],              // 下切口距睫毛線：內側、中央、外側（mm，沿皮膚量）：院內常規
  excW: 5,                        // 切除皮膚寬度（mm，中央）：院內常規
  incX: [5.75, -5.75],            // 內側、外側那一點的位置＝角膜緣上方（mm，鼻側為正）：示意（範本只給高度）
  tarN: 3,                        // levator 固定到瞼板 4-0 vicryl ×3：院內常規
  creaseN: 4,                     // levator 固定到 orbicularis 6-0 Prolene ×4：院內常規
  browN: 1,                       // 眉下組織固定到骨膜 4-0 vicryl ×1：院內常規
};
const INC = { incH: LRP.incH, excW: LRP.excW, incX: LRP.incX };
// Lower lid: the department template's marginal rotation (院內常規), and the lash anatomy for electrolysis (literature).
const LLP = {
  entr: 1,                        // 術中內翻的程度（模型的完全內翻 80°，睫毛碰到角膜）：示意（類型與程度待刀後確認）
  incH: 2.5,                      // 睫毛下 2.5 mm 切皮（沿皮膚從睫毛線量）：院內常規
  fracS: 2.0, fracDepth: 0.5,     // tarsal fracture：15 號刀切瞼板「一半深度」＝0.5：院內常規；距瞼緣 2.0 mm、從前面切：示意
  blade: 15,                      // 15 號刀：院內常規
  mattN: 2,                       // mattress suture 4-0 vicryl ×2：院內常規
  exitH: 1.2,                     // mattress 出針點在睫毛線下方 1.2 mm：示意
  tarH: 4.12, tarHSay: 4.1,       // 下瞼板高 4.12 mm（亞洲人屍體，Lim 2004）；旁白說「約 4.1 mm」
  follicle: 0.9, follicleUp: 1.8, // 毛囊深度：下眼瞼 0.9、上眼瞼 1.8 mm（Elder 1997）
  reach95: 1.4, reach95Up: 2.4,   // 針要插多深才碰到 95% 的毛囊：下 1.4、上 2.4 mm（Elder 1997）
  rootSingh: 1.8,                 // 下眼瞼睫毛根部深度 1.8 mm（Singh 2024）
  rootAngle: 75,                  // 根部與皮膚（瞼緣表面）夾角 75°（Singh 2024）
};
if (typeof module !== 'undefined') module.exports = { LRP, INC, LLP };
