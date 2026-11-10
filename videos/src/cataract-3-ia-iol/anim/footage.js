// ============================================================================
// Footage clips of video ③ (case A, OD, surgeon at 12; videos/src/cataract-series/footage-sources.js). Source times in seconds, read on
// 2026-11-10 from contact sheets at 0.5–5 s and gridded full-resolution frames (script-draft.md 「案例 A 的錄影事件」 has the table).
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-3-ia-iol → footage/frames/<clip>/ (gitignored).
// Skipped on purpose (the user chose case A without them, 2026-11-09): the capsular tension ring 14:49.5–16:28 (889.5–988 s: the package, the
// ring through the main incision) and the suturing from 19:40 (1180 s). Also skipped: 16:54–18:28 (1014–1108 s), instruments adjusting the IOL
// whose details cannot be read (the narration says so), and 18:40–18:56 (a side-port cannula; the pupil constricts; not identified).
// Crops: centre from the limbus fits and contact sheets (w 520 → cx ≥ 398, cy ≤ 457 to stay ≥ 4 px off the burned-in overlays; w 440 → cx ≥ 358,
// cy ≤ 484). Points (label anchors) are measured on the frozen frame only (source px).
// Event names used by draw.js and check.js:
//   ia-in / ia-out             the coaxial I/A tip in / out through the main incision (cortex);  ia2-in / ia2-out  the I/A again (OVD removal)
//   centre, sheet-start/-end, nasal-start/-end, sub-start/-end   where the tip works (params.js CASE.phases): near the incision and the centre,
//                              a whole sheet peeled from the 6 o'clock side, the 3 o'clock side (left of the picture), the angled tip turned
//                              sideways near the incision; sub-end: the red reflex even
//   ovd-in / ovd-pause / ovd-in2 / ovd-inject / ovd-out   the OVD cannula through the main incision (out of the eye between ovd-pause and
//                              ovd-in2), OVD fronts spreading in the rhexis
//   inj-in, iol-out, unfold-start / -end, inj-out   the injector at the main incision, the folded IOL out of the nozzle, the optic opening
//   swab-on / swab-off         a cotton swab pressed on the cornea over the main incision right after the I/A leaves
// ============================================================================
const FOOTAGE_DEF = {
  sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../../cataract-series/footage-sources.js'),   // eslint-disable-line no-undef
  clips: {
    // 10:59.5–11:26 the I/A comes in through the main incision (660.3 s) with an angled tip; it works near the incision and in the centre (4×).
    // Freeze 11:04: the angled tip in the pupil. 11:26–12:15 (the centre; the microscope moves, a sponge at 12:12) is not shown
    'ia-in': {
      src: 'case-a', in: 659.5, out: 686.0, rate: 4,
      freeze: [{ at: 664.0, dur: 3 }],
      crop: [{ t: 659.5, cx: 410, cy: 385, w: 520 }, { t: 680, cx: 405, cy: 390, w: 520 }, { t: 686.0, cx: 405, cy: 392, w: 520 }],
      events: { 'ia-in': 660.3, 'freeze-in': 664.0, 'centre': 685.5 },
      points: { 'ia-tip': [{ t: 664.0, p: [395, 410] }] },
    },
    // 12:15–12:40 (2×): 12:14–12:32 a whole sheet of cortex is drawn from under the 6 o'clock rim (top of the picture) to the tip in the centre;
    // freeze 12:28 (the sheet arcs over the upper pupil, the tip holding it), held over narration lines 3–4 (line 4 points at the section's same moment)
    'ia-strip': {
      src: 'case-a', in: 735.0, out: 760.0, rate: 2,
      freeze: [{ at: 748.0, dur: 10.3 }],
      crop: [{ t: 735.0, cx: 495, cy: 372, w: 520 }, { t: 740, cx: 540, cy: 395, w: 520 }, { t: 760.0, cx: 545, cy: 400, w: 520 }],
      events: { 'sheet-start': 735.5, 'sheet-freeze': 748.0, 'sheet-end': 752.0 },
      points: { 'sheet': [{ t: 748.0, p: [590, 290] }], 'strip-tip': [{ t: 748.0, p: [505, 360] }] },
    },
    // 12:40–13:20 (3×): the tip works on the 3 o'clock side (left half of the picture)
    'ia-mid': {
      src: 'case-a', in: 760.0, out: 800.0, rate: 3,
      crop: [{ t: 760.0, cx: 545, cy: 400, w: 520 }, { t: 780, cx: 535, cy: 420, w: 520 }, { t: 800.0, cx: 510, cy: 430, w: 520 }],
      events: { 'nasal-start': 766.0, 'nasal-end': 799.5 },
    },
    // 13:20–13:36 (2×): the angled tip turned sideways in the lower half (the incision side). Freeze 13:34.5 (the angled end, dark, pointing left)
    'ia-sub': {
      src: 'case-a', in: 800.0, out: 816.0, rate: 2,
      freeze: [{ at: 814.5, dur: 3 }],
      crop: [{ t: 800.0, cx: 510, cy: 430, w: 520 }, { t: 814.5, cx: 525, cy: 440, w: 520 }, { t: 816.0, cx: 514, cy: 440, w: 520 }],
      events: { 'sub-start': 800.5, 'freeze-sub': 814.5, 'sub-end': 816.0 },
      points: { 'bent-tip': [{ t: 814.5, p: [493, 503] }] },
    },
    // 13:50–14:08.25 (6×): the tip goes back and forth in the centre over an even red reflex; the I/A leaves at 14:08.2. Freeze 14:05 (even red
    // reflex, the tip at the lower edge), held over narration lines 3–4 (the model's tip at the same moment). 13:36–13:50 (the same) is not shown
    'ia-end': {
      src: 'case-a', in: 830.0, out: 848.25, rate: 6,
      freeze: [{ at: 845.0, dur: 11.7 }],
      crop: [{ t: 830.0, cx: 470, cy: 445, w: 520 }, { t: 848.25, cx: 470, cy: 455, w: 520 }],
      events: { 'freeze-clear': 845.0, 'ia-out': 848.2 },
      points: { 'reflex': [{ t: 845.0, p: [470, 440] }] },
    },
    // 14:26–14:47.5 (2×): a cannula through the main incision (868 s) reaches the centre, is withdrawn (873.0 s, out of the eye on 873–877.5 s),
    // comes back (877.8 s) and injects OVD inside the rhexis; the OVD fronts spread (878.3–885 s); out 886.5 s. Read at 0.5 s 2026-11-10.
    // Freeze 14:40 (a rounded OVD front, the cannula tip)
    'ovd': {
      src: 'case-a', in: 866.0, out: 887.5, rate: 2,
      freeze: [{ at: 880.0, dur: 3 }],
      crop: [{ t: 866.0, cx: 400, cy: 330, w: 520 }, { t: 878, cx: 398, cy: 310, w: 520 }, { t: 887.5, cx: 400, cy: 320, w: 520 }],
      events: { 'ovd-in': 868.0, 'ovd-pause': 873.0, 'ovd-in2': 877.8, 'ovd-inject': 878.3, 'ovd-freeze': 880.0, 'ovd-out': 886.5 },
      points: { 'ovd-front': [{ t: 880.0, p: [430, 215] }], 'ovd-cannula': [{ t: 880.0, p: [328, 322] }] },
    },
    // 16:32–16:39.5 (0.5×): the injector at the main incision (993 s); the folded IOL comes out (994.5 s) and advances toward 6 o'clock (top).
    // Freeze 16:38.5 (folded IOL in the pupil)
    'iol': {
      src: 'case-a', in: 992.0, out: 999.5, rate: 0.5,
      freeze: [{ at: 998.5, dur: 2.5 }],
      crop: [{ t: 992.0, cx: 420, cy: 380, w: 520 }, { t: 993.0, cx: 400, cy: 330, w: 520 }, { t: 994.5, cx: 400, cy: 360, w: 520 }, { t: 996, cx: 400, cy: 400, w: 520 },
        { t: 999.5, cx: 408, cy: 418, w: 520 }],
      events: { 'inj-in': 993.0, 'iol-out': 994.5, 'iol-freeze1': 998.5 },
      points: { 'iol-folded': [{ t: 998.5, p: [425, 370] }] },
    },
    // 16:39.5–16:46 (1×): the optic opens 999.5–1002.5 s; the injector leaves 1003.8 s. Freeze 16:44.5 (optic open)
    'iol-b': {
      src: 'case-a', in: 999.5, out: 1006.0, rate: 1,
      freeze: [{ at: 1004.5, dur: 4 }],
      crop: [{ t: 999.5, cx: 408, cy: 418, w: 520 }, { t: 1004, cx: 424, cy: 440, w: 520 }, { t: 1006.0, cx: 424, cy: 440, w: 520 }],
      events: { 'unfold-start': 999.5, 'unfold-end': 1002.5, 'inj-out': 1003.8, 'iol-freeze2': 1004.5 },
      points: { 'optic-open': [{ t: 1004.5, p: [430, 400] }] },
    },
    // 18:36–18:38.4: after the skipped adjustment, the IOL centred in the pupil (the optic edge is the circle round the centre); frozen at 18:38
    'iol-final': {
      src: 'case-a', in: 1116.0, out: 1118.4, rate: 1,
      freeze: [{ at: 1118.0, dur: 4 }],
      crop: [{ t: 1116.0, cx: 522, cy: 384, w: 520 }, { t: 1118.4, cx: 522, cy: 384, w: 520 }],
      events: { 'iol-centred': 1118.0 },
      points: { 'optic-edge': [{ t: 1118.0, p: [400, 380] }] },
    },
    // 18:57–19:25.5 (2×): the I/A again through the main incision (1137.5 s) over the optic and at its edge; the pupil is already small. It leaves
    // at 1170.5 s (start of 'swab'); 19:26–19:30 not shown (a swab already coming in)
    'ovdout': {
      src: 'case-a', in: 1137.0, out: 1165.5, rate: 2,
      crop: [{ t: 1137.0, cx: 500, cy: 390, w: 520 }, { t: 1140, cx: 515, cy: 394, w: 520 }, { t: 1150, cx: 545, cy: 410, w: 520 }, { t: 1160, cx: 520, cy: 400, w: 520 },
        { t: 1165.5, cx: 510, cy: 400, w: 520 }],
      events: { 'ia2-in': 1137.5 },
    },
    // 19:30.5–19:40 (1×; the microscope zoomed out): a cotton swab pressed on the cornea over the main incision (1171.5–1179.5 s); freeze 19:36
    'swab': {
      src: 'case-a', in: 1170.5, out: 1180.0, rate: 1,
      freeze: [{ at: 1176.0, dur: 2 }],
      crop: [{ t: 1170.5, cx: 480, cy: 420, w: 440 }, { t: 1180.0, cx: 505, cy: 430, w: 440 }],
      events: { 'ia2-out': 1170.5, 'swab-on': 1171.5, 'swab-freeze': 1176.0, 'swab-off': 1179.5 },
      points: { 'swab': [{ t: 1176.0, p: [589, 519] }] },   // on the cotton tip (re-read 2026-11-10; 520, 495 was the pupil just above it)
    },
    // title still: the optic just opened (16:44)
    'title': {
      src: 'case-a', in: 1004.0, out: 1004.2, rate: 1,
      crop: [{ t: 1004.0, cx: 424, cy: 440, w: 520 }],
    },
  },
};
if (typeof module !== 'undefined') module.exports = FOOTAGE_DEF;
