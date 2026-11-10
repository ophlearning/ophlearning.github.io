// ============================================================================
// Footage clips of video ② (case A, OD, surgeon at 12; videos/src/cataract-series/footage-sources.js). Source times in seconds, read on
// 2026-11-10 from contact sheets at 0.25–3 s and gridded full-resolution frames (script-draft.md 「案例 A 的錄影事件」 has the table).
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-2-hydro-dc → footage/frames/<clip>/ (gitignored).
// Crops: centre from the limbus circle fits (footage-sources.js landmarks; median over ±5 s), kept ≥ 4 px from the burned-in overlays
// (w 500 → cx ≥ 388, cy ≤ 463; w 540 → cx ≥ 408, cy ≤ 450; w 560 → cx ≥ 418, cy ≤ 443). After 6:40 the eye sits low in the frame, so the
// crop cannot follow it all the way down: the 12 o'clock side of the pupil is cut by up to ~60 px there.
// Points (label anchors) are measured on the frozen frame only (source px).
// Event names used by draw.js and check.js:
//   hydro<n>-in / -out       cannula in / out through the main incision (3 passes); ring-start / ring-full: the golden ring lights up
//   phaco-in / phaco-out     the phaco handpiece through the main incision;  chopper-in / chopper-out  the chopper through the side port
//   sculpt-start / -end      the first groove;  crack-start / gap-open  the first crack (the halves part)
//   turn-start / -end, groove2-start / -end, crack2-start / -end   after the first crack (the nucleus turned, sculpted and parted again; the
//                            second groove itself is not clearly visible: the narration says so and the model shows the standard steps)
//   piece<n>                 a piece of nucleus is pulled to the centre and emulsified (start), reflex-<n> red reflex shows where it was
//                            (the model's piece n is gone by then: draw.js PIECES, check.js)
// ============================================================================
const FOOTAGE_DEF = {
  sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../../cataract-series/footage-sources.js'),   // eslint-disable-line no-undef
  clips: {
    // 5:15–5:26.5 hydrodissection pass 1 (0.5×): cannula through the main incision, tip under the rhexis rim upper right (≈ 7.9 o'clock);
    // the golden ring lights up 322.75 → 323.75 s. Freezes: the tip under the rim (320.5 s), the full ring (323.9 s)
    'hydro1': {
      src: 'case-a', in: 315.0, out: 326.5, rate: 0.5,
      freeze: [{ at: 320.5, dur: 2 }, { at: 323.9, dur: 5.5 }],
      crop: [{ t: 315.0, cx: 420, cy: 325, w: 560 }, { t: 319.0, cx: 422, cy: 325, w: 560 }, { t: 323.0, cx: 422, cy: 330, w: 560 }, { t: 326.5, cx: 430, cy: 320, w: 560 }],
      events: { 'hydro1-in': 315.5, 'tip-under-rim': 319.5, 'ring-start': 322.75, 'ring-full': 323.75, 'hydro1-out': 326.0, 'freeze-tip': 320.5, 'freeze-ring': 323.9 },
      points: { 'cannula-tip': [{ t: 320.5, p: [520, 245] }], 'ring': [{ t: 323.9, p: [234, 400] }] },
    },
    // 5:27–5:43 passes 2 and 3 (2×): tip lower left (≈ 1.6 o'clock), then right (≈ 8.3 o'clock)
    'hydro23': {
      src: 'case-a', in: 327.0, out: 343.0, rate: 2,
      crop: [{ t: 327.0, cx: 430, cy: 320, w: 560 }, { t: 333.0, cx: 420, cy: 315, w: 560 }, { t: 338.0, cx: 440, cy: 300, w: 560 }, { t: 343.0, cx: 470, cy: 310, w: 560 }],
      events: { 'hydro2-in': 328.0, 'hydro2-out': 335.5, 'hydro3-in': 337.5, 'hydro3-out': 342.5 },
      points: { 'pass2-tip': [{ t: 331.5, p: [275, 430] }], 'pass3-tip': [{ t: 340.0, p: [705, 180] }] },   // measured, not labelled (check.js: the model's injection hour)
    },
    // 5:51.5–6:06 the phaco comes in (352.5 s) and starts the groove from below the incision toward 6 o'clock (354 s) (1×); frozen at 6:06
    // where the groove floor shows as a redder channel (points measured on that frame)
    'groove-a': {
      src: 'case-a', in: 351.5, out: 366.0, rate: 1,
      freeze: [{ at: 366.0, dur: 5 }],
      crop: [{ t: 351.5, cx: 420, cy: 320, w: 540 }, { t: 360.0, cx: 430, cy: 325, w: 540 }, { t: 366.0, cx: 466, cy: 320, w: 540 }],
      events: { 'phaco-in': 352.5, 'sculpt-start': 354.0, 'freeze': 366.0 },
      points: { 'groove-floor': [{ t: 366.0, p: [455, 244] }], 'groove-wall': [{ t: 366.0, p: [418, 249] }], 'phaco-tip': [{ t: 366.0, p: [513, 460] }] },
    },
    // 6:06–6:39 the rest of the groove (to 398 s) (3×)
    'groove-b': {
      src: 'case-a', in: 366.0, out: 399.0, rate: 3,
      crop: [{ t: 366.0, cx: 466, cy: 320, w: 540 }, { t: 372.0, cx: 495, cy: 330, w: 540 }, { t: 380.0, cx: 490, cy: 320, w: 540 }, { t: 388.0, cx: 460, cy: 320, w: 540 },
        { t: 394.0, cx: 455, cy: 380, w: 540 }, { t: 399.0, cx: 480, cy: 440, w: 540 }],
      events: { 'sculpt-end': 398.0 },
    },
    // 6:38.5–6:59 the chopper comes in through the side port (399.3 s); phaco and chopper in the groove push apart; the halves part (417.5 s) (1.5×)
    'crack1': {
      src: 'case-a', in: 398.5, out: 419.0, rate: 1.5,
      freeze: [{ at: 418.0, dur: 5 }],
      crop: [{ t: 398.5, cx: 465, cy: 460, w: 500 }, { t: 402.5, cx: 502, cy: 463, w: 500 }, { t: 406.5, cx: 503, cy: 463, w: 500 }, { t: 410.5, cx: 518, cy: 463, w: 500 },
        { t: 414.5, cx: 560, cy: 463, w: 500 }, { t: 419.0, cx: 568, cy: 463, w: 500 }],
      events: { 'chopper-in': 399.3, 'crack-start': 401.0, 'gap-open': 417.5, 'freeze': 418.0 },
      points: { 'gap': [{ t: 418.0, p: [505, 520] }], 'chopper-tip': [{ t: 418.0, p: [452, 582] }], 'phaco-tip': [{ t: 418.0, p: [615, 575] }] },
    },
    // 6:59–7:46 the chopper reaches the periphery and turns the nucleus (424–431 s; the crack line turns from 12–6 toward upper left), the phaco
    // advances along a new line (440–455 s), the two instruments part the nucleus again (458–464 s) (2×)
    'divide': {
      src: 'case-a', in: 419.0, out: 466.0, rate: 2,
      crop: [{ t: 419.0, cx: 568, cy: 463, w: 500 }, { t: 423.0, cx: 582, cy: 456, w: 500 }, { t: 427.0, cx: 586, cy: 450, w: 500 }, { t: 431.0, cx: 583, cy: 463, w: 500 },
        { t: 435.0, cx: 560, cy: 463, w: 500 }, { t: 443.0, cx: 540, cy: 463, w: 500 }, { t: 451.0, cx: 555, cy: 463, w: 500 }, { t: 459.0, cx: 547, cy: 463, w: 500 },
        { t: 463.0, cx: 525, cy: 430, w: 500 }, { t: 466.0, cx: 527, cy: 430, w: 500 }],
      events: { 'turn-start': 424.0, 'turn-end': 431.0, 'groove2-start': 440.0, 'groove2-end': 455.0, 'crack2-start': 458.0, 'crack2-end': 464.0 },
    },
    // 7:32.5–9:48.5 the second division ends (the same frames as the end of 'divide'), then the pieces are pulled to the centre and emulsified, the
    // chopper helping (5×); frozen at 7:56 where the red reflex shows above. Where each piece was (2026-11-10, read on gridded full-resolution
    // frames; the cornea centre from a limbus-circle fit on the same frame, overlaid and checked): piece 1 from the 6 o'clock side (reflex 7:54–7:56,
    // ≈ 6.4 o'clock), piece 2 from the temporal side next to the phaco (reflex by 8:36, ≈ 10.7 o'clock), piece 3 not readable (it is already at the
    // phaco tip when it can be seen), piece 4 the large piece pushed in by the chopper (9:06–9:24; reflex by 9:26 at ≈ 4.7 o'clock, upper left).
    // m-* points are measurements only (check.js reads them), not labels.
    'quads': {
      src: 'case-a', in: 452.5, out: 588.5, rate: 5,
      freeze: [{ at: 476.0, dur: 5 }],
      crop: [{ t: 452.5, cx: 553, cy: 463, w: 500 }, { t: 459.0, cx: 547, cy: 463, w: 500 }, { t: 463.0, cx: 525, cy: 430, w: 500 }, { t: 464.0, cx: 525, cy: 425, w: 500 }, { t: 468.0, cx: 551, cy: 419, w: 500 }, { t: 472.0, cx: 517, cy: 259, w: 500 }, { t: 476.0, cx: 500, cy: 262, w: 500 },
        { t: 480.0, cx: 498, cy: 272, w: 500 }, { t: 484.0, cx: 522, cy: 300, w: 500 }, { t: 490.0, cx: 540, cy: 310, w: 500 }, { t: 496.0, cx: 528, cy: 260, w: 500 },
        { t: 504.0, cx: 523, cy: 276, w: 500 }, { t: 512.0, cx: 551, cy: 298, w: 500 }, { t: 520.0, cx: 595, cy: 352, w: 500 }, { t: 528.0, cx: 590, cy: 379, w: 500 },
        { t: 536.0, cx: 579, cy: 329, w: 500 }, { t: 544.0, cx: 600, cy: 329, w: 500 }, { t: 552.0, cx: 534, cy: 288, w: 500 }, { t: 560.0, cx: 554, cy: 281, w: 500 },
        { t: 568.0, cx: 530, cy: 274, w: 500 }, { t: 576.0, cx: 508, cy: 315, w: 500 }, { t: 584.0, cx: 510, cy: 301, w: 500 }, { t: 588.5, cx: 512, cy: 297, w: 500 }],
      events: { 'piece1': 465.0, 'reflex-1': 474.0, 'freeze': 476.0, 'piece2': 494.0, 'reflex-2': 516.0, 'piece3': 524.0, 'piece4': 546.0, 'reflex-4': 566.0, 'chopper-out': 587.7 },
      points: { 'reflex': [{ t: 476.0, p: [505, 225] }], 'chopper-tip': [{ t: 476.0, p: [432, 298] }],
        'm-piece1': [{ t: 476.0, p: [505, 225] }], 'm-centre1': [{ t: 476.0, p: [497, 267] }], 'm-piece2': [{ t: 516.0, p: [595, 390] }], 'm-centre2': [{ t: 516.0, p: [557, 343] }],
        'm-piece4': [{ t: 566.0, p: [490, 195] }], 'm-centre4': [{ t: 566.0, p: [536, 253] }] },
    },
    // 9:47–10:42 the chopper is out; the phaco alone aspirates the remaining pieces and leaves (640.5 s) (4×)
    'cleanup': {
      src: 'case-a', in: 587.0, out: 642.0, rate: 4,
      crop: [{ t: 587.0, cx: 510, cy: 301, w: 500 }, { t: 595.0, cx: 518, cy: 360, w: 500 }, { t: 603.0, cx: 548, cy: 358, w: 500 }, { t: 611.0, cx: 560, cy: 360, w: 500 },
        { t: 619.0, cx: 528, cy: 360, w: 500 }, { t: 627.0, cx: 550, cy: 375, w: 500 }, { t: 635.0, cx: 553, cy: 360, w: 500 }, { t: 642.0, cx: 560, cy: 365, w: 500 }],
      events: { 'chopper-out': 587.7, 'phaco-out': 640.5 },
    },
    // title still: the groove at 6:06
    'title': {
      src: 'case-a', in: 366.0, out: 366.2, rate: 1,
      crop: [{ t: 366.0, cx: 466, cy: 320, w: 540 }],
    },
  },
};
if (typeof module !== 'undefined') module.exports = FOOTAGE_DEF;
