// Surgical parameters and lower-lid states of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in
// the narration and the number the model draws are the same value. The states are the ones of the printed sheets (../print/video.js):
// the eyelid model's Hotz states (videos/models/eyelid CARD.md: hotzExc → septOpen → hotzFat → hotzFix) on an involutional entropion
// (entr 0.95 so the lashes really touch the cornea; no previous scar: the earlier treatment is unknown). Source of each value in the comment;
// 示意 = schematic, no source (listed in overview-notes.md). The department template is not in git: its values are marked 院內常規.
const HZP = {
  fixN: 5,                       // orbicularis → retractor aponeurosis 6-0 Prolene ×5：院內常規
  fixSuture: '6-0',              // 院內常規
  fusionMm: 2.4,                 // 眶隔與 capsulopalpebral fascia 在瞼板下 2.38 mm 融合（19 眼中 7 眼看得到）：Kakizaki 2006
  pads: 3,                       // 最常見的分型（Type 1）三團：Coban 2023（36%）
  entr: { entr: 0.95, dehis: 1, override: 0.6 },   // 內翻、retractor 鬆脫、preseptal orbicularis 上跨：程度示意
};
// states of the lower lid (sagittal LOWER.draw and coronal CORONAL.draw({ lower }), same names), cumulative
const HS = (() => {
  const PRE = { ...HZP.entr };
  const EXC = { ...PRE, hotzExc: 1 };                          // skin, subcutaneous tissue and orbicularis excised (width 示意: model hotzLo 2.0, hotzW 3.0 mm)
  const SEPT = { ...EXC, septOpen: 1, hotzSept: 1 };           // through the septum to the retractor aponeurosis
  const FAT = { ...SEPT, hotzFat: 1 };                         // partial fat removal (amount 院內常規; the septal bow flattens, 示意)
  const FIX = { ...FAT, hotzFix: 1, tie: 1, override: 0 };     // orbicularis → aponeurosis; margin turned out (借用 tie，示意)
  return { PRE, EXC, SEPT, FAT, FIX };
})();
if (typeof module !== 'undefined') module.exports = { HZP, HS };
