// Case parameters of video ③ shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the number
// the model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障 ③).
// Case A (OD, surgeon at 12): incisions and capsulorhexis as in videos ① and ② (measured there on the recording).
// Video ③ read on the recording 2026-11-10 (script-draft.md 「案例 A 的錄影事件」): one angled coaxial I/A tip through the MAIN incision for all of the
// cortex (no hand switch, no bimanual I/A, no side-port aspiration), an OVD cannula and the injector through the main incision.
// Instrument positions below are model positions that clear the iris, the cornea outside the tunnel and the anterior capsule (check.js checks
// every sampled moment): the model's straight coaxial tip reaches under the rim only at 4–7 o'clock (the tunnel rises 18° toward the centre);
// near the incision the drawing uses a bent tip (示意, the case's angled tip) — see CARD.md 白內障 ③ 已知的坑.
const CASE = {
  mainDeg: 22,                                                      // main incision, degrees temporal of 12 o'clock (錄影實測，同 ①、②)
  main: { h: 12 - 22 / 30, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },  // as ①
  side: { h: 2.2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },         // as ①、②
  ccc: { r: 2.625, h0: 3, dir: -1 },                                // as ① (5.25 mm, 示意 start)
  // the cortex sectors (index = clock hour mod 12) the model clears in each phase of the recording; the phases follow where the I/A tip is
  // on the recording (錄影), which sectors are cleared inside a phase is 示意
  phases: [
    { from: 'ia-in', to: 'centre', hours: [10, 11, 0], to01: 0.5, where: '主切口這一側和中央' },
    { from: 'centre', to: 'sheet-start', hours: [7, 8, 9], to01: 0, where: '中央（看不清楚吸哪一區，示意）' },
    { from: 'sheet-freeze', to: 'sheet-end', hours: [4, 5, 6], to01: 0, where: '6 點那一側：整片皮質剝向中央' },
    { from: 'nasal-start', to: 'nasal-end', hours: [1, 2, 3], to01: 0, where: '3 點那一側（左半邊）' },
    { from: 'sub-start', to: 'sub-end', hours: [10, 11, 0, 1], to01: 0, sub: true, where: '彎頭轉向側邊：主切口這一側' },
  ],
  bimanual: { r: 3.3, dep: 0.8, az: -20, el: 30 },                  // aspirator tip under the subincisional rim (Colvard 1997 technique; reach found on the model)
  bentSub: { h: 1.6, r: 2.9, dep: 0.6, toward: 1, el: 30 },         // the case's angled tip turned sideways near the incision (錄影 814.5 s: h ≈ 1.6; 示意 depth)
  // parts of the recording the video skips (source s, read on the recording): the capsular tension ring (package shown, then the ring through the
  // main incision), the IOL adjustment with instruments whose details cannot be read, the suturing of the main incision
  skipped: { ctr: [889.5, 988.0], adjust: [1014.0, 1108.0], suture: 1180.0 },
  iolRot: -50,                                                      // haptics turned to cross the 12–6 plane at the equator (示意; as the globe sample)
};
CASE.HP = (CASE.main.h + 6) % 12;                                  // the section through the main incision: left = main incision, right = the 6 o'clock side
if (typeof module !== 'undefined') module.exports = { CASE };
