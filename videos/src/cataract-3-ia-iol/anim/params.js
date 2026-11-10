// Case parameters of video ③ shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the number
// the model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障 ③).
// Case A (OD, surgeon at 12): incisions and capsulorhexis as in videos ① and ② (measured there on the recording).
// Video ③ read on the recording 2026-11-10 (script-draft.md 「案例 A 的錄影事件」): one angled coaxial I/A tip through the MAIN incision for all of the
// cortex (no hand switch, no bimanual I/A, no side-port aspiration), an OVD cannula and the injector through the main incision.
// Instrument positions below are model positions that clear the iris, the cornea outside the tunnel and the anterior capsule (check.js checks
// every sampled moment): the model's straight coaxial tip reaches under the rim only at 4–7 o'clock (the tunnel rises 18° toward the centre); the
// case's angled tip (globe/cataract.js inst.ang, 2026-11-10) reaches under the rim all round except within about 1.2 h of the incision (0.5–10 o'clock
// here) with a rigid 90° bend, never directly under the incision — see CARD.md 白內障 ③.
const CASE = {
  mainDeg: 22,                                                      // main incision, degrees temporal of 12 o'clock (錄影實測，同 ①、②)
  main: { h: 12 - 22 / 30, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },  // as ①
  side: { h: 2.2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },         // as ①、②
  ccc: { r: 2.625, h0: 3, dir: -1 },                                // as ① (5.25 mm, 示意 start)
  // the cortex sectors (index = clock hour mod 12) the model clears in each phase of the recording; the phases follow where the I/A tip is
  // on the recording (錄影), which sectors are cleared inside a phase is 示意
  phases: [
    { from: 'ia-in', to: 'centre', hours: [0, 1], to01: 0.5, where: '主切口這一側（3 點那邊）和中央' },
    { from: 'centre', to: 'sheet-start', hours: [7, 8, 9, 10], to01: 0, where: '中央（看不清楚吸哪一區，示意）' },
    { from: 'sheet-freeze', to: 'sheet-end', hours: [4, 5, 6], to01: 0, where: '6 點那一側：整片皮質剝向中央' },
    { from: 'nasal-start', to: 'nasal-end', hours: [1, 2, 3], to01: 0, where: '3 點那一側（左半邊）' },
    { from: 'sub-start', to: 'sub-end', hours: [11, 0, 1], to01: 0, sub: true, where: '彎頭轉向側邊：主切口這一側' },
  ],
  bimanual: { r: 3.3, dep: 0.8, az: -20, el: 30 },                  // aspirator tip under the subincisional rim (Colvard 1997 technique; reach found on the model)
  // the case's angled coaxial tip (globe/cataract.js inst.ang; CN.iaAng: bend 90°, bent part 1.8 mm — 示意, read on the 13:34.5 freeze), held with the bend
  // to the surgeon's left as on the recording (both freezes). Under the rim at clock h: rimR mm beyond the rim, dep mm under the capsule, the handpiece
  // turned roll0 + rollK·h degrees (the port then faces the cornea; the model clears these at 1.5–5.5 h)
  ia: { rimR: 0.35, dep: 0.55, roll0: 50, rollK: 10 },
  // where the tip is on the recording (錄影實測 2026-11-10, gridded full-resolution frames: clock hour from the limbus centre; c = within about 1.5 mm of
  // the centre). footage.js adds the measured points 'strip-tip' (748 s, near the centre) and 'bent-tip' (814.5 s, 1.6 h)
  tipSeen: [{ t: 664, c: 1 }, { t: 772, h: 4.3 }, { t: 784, c: 1 }, { t: 790, h: 4.0 }, { t: 798, h: 3.0 }],
  // the model tip, keyframes [source s, clock h ('HP' = the section's 6 o'clock side), r mm from the axis ('rim' = rim + rimR), mm under the anterior
  // capsule, turn ° ('f' = roll0 + rollK·h)], linear in between: through the measured moments (tipSeen, footage points); between them 示意. Poses away
  // from the rim keep the bend level (the rigid 90° tip clears only so) and everything stays on the 3 o'clock half, where the case worked.
  iaPath: [[660.3, 2.0, 1.3, 0.3, 85], [664, 'HP', 0.6, 0.4, 90], [669, 2.0, 1.3, 0.3, 85], [674, 'HP', 0.6, 0.4, 90], [680, 2.0, 1.3, 0.3, 85], [685.5, 'HP', 0.6, 0.4, 90],
    [697, 4.5, 1.2, 0.4, 90], [709, 'HP', 0.6, 0.4, 90], [721, 4.5, 1.2, 0.4, 90], [735.5, 'HP', 'rim', 0.55, 'f'], [748, 'HP', 1.2, 0.5, 90], [766, 4.3, 0.9, 0.4, 90],
    [772, 4.3, 'rim', 0.55, 'f'], [778, 3.6, 'rim', 0.55, 'f'], [784, 3.8, 0.9, 0.4, 90], [790, 4.0, 'rim', 0.55, 'f'], [798, 3.0, 'rim', 0.55, 'f'], [800.5, 2.6, 'rim', 0.55, 'f'],
    [805, 1.7, 'rim', 0.55, 'f'], [809.5, 2.4, 'rim', 0.55, 'f'], [814.5, 1.6, 'rim', 0.55, 'f'], [816, 1.6, 'rim', 0.55, 'f'], [821, 4.0, 0.9, 0.4, 90], [827, 2.5, 1.2, 0.4, 90],
    [833, 4.0, 0.9, 0.4, 90], [839, 2.5, 1.2, 0.4, 90], [845, 4.0, 0.9, 0.4, 90], [848.2, 4.0, 0.9, 0.4, 90]],
  // the same tip removing the OVD (錄影 18:57.5–19:30.5: the curved tip again, over the optic and at its edge): back and forth between these two poses, 0.35 mm
  // under the old anterior-capsule level so it stays above the optic (check.js: clear of the IOL by ≥ 0.1 mm)
  iaOvd: [['HP', 1.5, 0.35, 90], [2.5, 1.5, 0.35, 85]],
  // parts of the recording the video skips (source s, read on the recording): the capsular tension ring (package shown, then the ring through the
  // main incision), the IOL adjustment with instruments whose details cannot be read, the suturing of the main incision
  skipped: { ctr: [889.5, 988.0], adjust: [1014.0, 1108.0], suture: 1180.0 },
  iolRot: -50,                                                      // haptics turned to cross the 12–6 plane at the equator (示意; as the globe sample)
  // 4-4: one common way to finish (常用做法, 示意; the case's own 1½ minutes cannot be read): a hook through the side port on the optic near haptic j's
  // junction (r mm from the optic centre, lift mm above its front) dials the IOL from rot° ahead back to iolRot — the way the haptic tips trail in the
  // model — and slides it from off [dx, dy] mm (toward 6 o'clock, where 4-3 shows the IOL going) to the centre
  dial: { rot: 60, off: [0, -0.5], j: 1, r: 2.0, lift: 0.2 },
};
CASE.HP = (CASE.main.h + 6) % 12;                                  // the section through the main incision: left = main incision, right = the 6 o'clock side
if (typeof module !== 'undefined') module.exports = { CASE };
