// Case parameters of video ② shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the number
// the model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障 ②); fluidics: globe/fluidics.js.
// Case A (OD, surgeon at 12): the incisions and the capsulorhexis are those of video ① (cataract-1-wound-ccc/anim/params.js), measured there.
// Video ② measured on the recording 2026-11-10 (spec.md 進度; script-draft.md 錄影事件): the hydrodissection cannula goes in through the MAIN
// incision three times; its tip sits under the rhexis rim at the clock hours below (bearing of the measured tip from the cornea centre).
const CASE = {
  mainDeg: 22,                                                      // main incision, degrees temporal of 12 o'clock (錄影實測，同 ①)
  main: { h: 12 - 22 / 30, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },  // as ①
  side: { h: 2.2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },         // as ① (錄影：chopper 從畫面左邊進來)
  ccc: { r: 2.625, h0: 3, dir: -1 },                                // as ① (5.25 mm, 示意 start)
  // hydrodissection: where the cannula tip was (clock hour, 錄影實測 on frames 320.5 / 331.5 / 340 s)
  hydro: [{ pass: 1, h: 7.9 }, { pass: 2, h: 1.65 }, { pass: 3, h: 8.3 }],
  hydroDemo: 12 - 22 / 30 + 6,                                      // model-only demonstration: injected opposite the main incision (in its section)
  // the groove is sculpted from the main incision toward the opposite side: its axis is the main-incision meridian (錄影：沿 12→6 點)
  groove: { dep: 0.9 },                                             // final depth as a share of the way to the planned plate (示意)
  // the four pieces of the footage (anim/footage.js 'quads', piece1–piece4) → model quadrants (quadrant q is centred at grooveH + 1.5 + 3q o'clock
  // in the nucleus frame, + 3 h after the 90° turn: q0 ≈ 3.8, q1 ≈ 6.8, q2 ≈ 9.8, q3 ≈ 0.8 o'clock). Pieces 1, 2, 4: the quadrant that holds the red
  // reflex measured where the piece was (≈ 6.4, 10.7, 4.7 o'clock); piece 3: not readable on the footage → the remaining quadrant (示意).
  pieceQ: [1, 2, 3, 0],
};
CASE.grooveH = CASE.main.h;
if (typeof module !== 'undefined') module.exports = { CASE };
