// Case parameters of video ④ shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the number the
// model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障 ④).
// Case B (the PCR case): LEFT eye OS, surgeon at 12 (the user confirmed 2026-11-10). Clock hours are the examiner's (the same physical direction in
// both eyes); for OS 9 o'clock is nasal and lies on the right of the microscope picture. The model is never mirrored (CARD.md 白內障 ④ 左眼).
// Main incision about 11 o'clock (the recording: 31° right of straight down, footage-sources.js), side port about 2 o'clock (59–68° left).
// Rent, piece and gel geometry are 示意 (the recording does not show them; the surgeon thinks the capsule broke during sculpting or quadrant removal).
const CASE = {
  eye: 'OS',
  mainDeg: 31,                                                      // main incision, degrees right of straight down on the recording (錄影實測)
  main: { h: 11, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },            // 11 o'clock = 30° right of straight down (model; recording 25–40°)
  side: { h: 2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },          // 2 o'clock (recording 59–68° left of straight down)
  ccc: { r: 2.625, h0: 6, dir: -1 },                                // as ① (5.25 mm, 示意 start)
  rent: { h: 5, r: 1.6, size: 1.4 },                                // rent toward 5 o'clock (示意; the model sample's)
  piece: { h: 8 },                                                  // the remaining piece: its round side toward 8 o'clock (poles at 11 and 5; 示意)
  // what the recording shows and when (source s; footage.js events): read frame by frame, script-draft.md 「本例的錄影事件」
  noInstGap: [778.4, 788.5],                                        // no instrument in the chamber between withdrawal and the side-port cannula (≈ 10 s)
  phacoOut: 1023.8,                                                 // 17:03.8 the phaco leaves after the remaining nucleus (錄影實測; after the emul clip)
  emulMin: 120, emulMax: 180,                                       // the remaining nucleus: phaco in (14:44.5) → out lasted "兩分多鐘"
  iol: { model: 'AAB00', optic: 6, pos: 'sulcus' },                 // the surgeon (2026-11-10): AAB00 in the sulcus; optic 6 mm, C-loop (Wakili 2026), one-piece (Zhao 2018)
};
CASE.HP = (CASE.main.h + 6) % 12;                                  // the section through the main incision: left = 11 o'clock (main), right = 5
if (typeof module !== 'undefined') module.exports = { CASE };
