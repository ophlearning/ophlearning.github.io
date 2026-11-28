// Case parameters of the scleral-tunnel video (shared by the print sheets, later the drawing and ../check.js).
// Case (站長 2026-11-26 確認): OS, surgeon at upper-temporal; the globe model is a right eye, but clock hours are the examiner's, so
// the incision at 1:30 sits at the same place on the screen for OS; only the names nasal / temporal differ (OS: 3 o'clock = temporal).
// Scleral tunnel (Goel 2022: external incision 1–2 mm behind the limbus, internal incision 1–2 mm into clear cornea, external depth 0.3–0.5 mm).
const CASE = {
  surgeon: 1.5,                                                    // upper-temporal of OS (約 1–2 點，取 1:30；病例)
  main: { h: 1.5, w: 2.65, s: 1.5, L: 3.0, arch: 'tri' },          // w 2.65 keratome (OP note); s 1.5 behind the limbus (Goel 2022 1–2); L 示意 → inner opening in clear cornea
  side: { h: 3.7, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },        // left-hand side of a surgeon at 1:30 (same 66° as case A); 位置示意（依主刀）
  ccc: { r: 2.625, h0: 4.5, dir: -1 },                              // 5.25 mm (Hollick 1999); start and direction 示意
  peri: 0.4,                                                       // GLOBE peri360 used only in sections: conjunctiva rolled back to ~3 mm (示意)
};
if (typeof module !== 'undefined') module.exports = { CASE };
