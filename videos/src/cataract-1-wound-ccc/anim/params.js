// Case parameters of video ① shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the
// number the model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障).
// Case A (OD, surgeon at 12) measured on the recording 2026-11-09 (spec.md 進度): main incision 22° temporal of 12 o'clock,
// side port about 2 o'clock; the capsulorhexis start and direction are reconstructed from the forceps track (示意).
const CASE = {
  mainDeg: 22,                                                      // main incision, degrees temporal of 12 o'clock (錄影實測 21–24°)
  main: { h: 12 - 22 / 30, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },  // h from mainDeg; w 院內常規待確認; L Ernest 1995; s 示意
  side: { h: 2.2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },         // h 錄影實測（56–68° nasal of 12）; w, L 示意
  // capsulorhexis: radius 2.625 (5.25 mm; Hollick 1999 換算); h0 3 o'clock and dir −1 (counter-clockwise as the surgeon sees it):
  // the flap is first raised nasal of the centre (1:16–1:24) and pass 2 sweeps from about 1–2 o'clock past 12 to 9 (2:20–2:36)
  ccc: { r: 2.625, h0: 3, dir: -1 },
  optic: 6.0,                                                       // IOL optic diameter: 院內常規（型號待確認）
  // model progress of the tear per pass (示意: the tear front itself is not readable on the recording)
  prog: [[74.3, 0], [107.5, 0.06], [134.0, 0.06], [160.5, 0.5], [184.0, 0.5], [231.5, 0.88], [273.5, 0.88], [295.0, 1]],
};
if (typeof module !== 'undefined') module.exports = { CASE };
