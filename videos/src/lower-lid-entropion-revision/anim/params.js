// Surgical parameters of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the
// number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (listed in overview-notes.md).
// The department template is not in git: template values are marked 院內常規 and are to be compared with the OP note after surgery.
const LLP = {
  incH: 2.5,                      // 睫毛下切口，從睫毛線沿皮膚量（mm）：院內常規
  fracDepth: 0.5,                 // tarsal fracture 切瞼板「一半深度」：院內常規
  fracS: 2.0,                     // tarsal fracture 離瞼緣（mm）、從前面切：示意（範本沒寫）
  exitH: 1.2,                     // mattress suture 出針點在睫毛線下方（mm）：示意
  mattN: 3,                       // 有做 LTS 時 mattress suture 4-0 vicryl ×3：院內常規
  ltsN: 1,                        // 瞼板條固定到外側眶緣內面骨膜 4-0 vicryl ×1：院內常規
  mild: { entr: 0.95, dehis: 1, override: 0.6, scar: 1 },   // 一年後復發的內翻（睫毛剛好碰到角膜）與前次疤痕：示意（程度與疤痕位置不詳）
  over: 20,                       // 5 章「過度矯正」示意的外轉角度（度）：示意
  distractSig: [6, 8],            // distraction 超過 6–8 mm 算明顯：Pushker 2025
  distractEnt: [7.5, 11],         // 80 位單側內翻病人量到 7.5–11 mm：Beigi 2008（模型的內翻眼瞼拉開 9 mm，在範圍內）
  excursion: [3, 4],              // 往下看時下眼瞼正常移動 3–4 mm：Pushker 2025
  fusionMm: 2.4,                  // 眶隔與 capsulopalpebral fascia 在瞼板下 2.38 mm 融合（19 個中 7 個看得到）：Kakizaki 2006
  tubercleMm: 1.5,                // Whitnall 結節在眶緣後方 1.5 mm：Gioia 1987
};
// states of the lower lid (sagittal LOWER.draw and coronal CORONAL.draw({ lower }), same names), cumulative
const LS = (() => {
  const PRE = { ...LLP.mild }, INC = { ...PRE, subcil: 1, incH: LLP.incH }, PLANE = { ...INC, plane: 1 }, OPEN = { ...PLANE, septOpen: 1, retrOpen: 1 };
  const FRAC = { ...OPEN, frac: 1, fracS: LLP.fracS, fracDepth: LLP.fracDepth }, MATT = { ...FRAC, mattress: 1, exitH: LLP.exitH, lts: 1 }, TIED = { ...MATT, tie: 1, override: 0 };
  return { PRE, INC, PLANE, OPEN, FRAC, MATT, TIED, CLOSED: { ...TIED, skinClose: 1 } };
})();
if (typeof module !== 'undefined') module.exports = { LLP, LS };
