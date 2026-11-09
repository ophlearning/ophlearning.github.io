// ============================================================================
// Footage sources of the cataract series (registry format: videos/tools/video-kit/footage.js). The mp4 files live in the
// gitignored footage/ folder next to this file; file names, Drive IDs and patient details are never written here (spec.md 錄影清單).
// Each video's anim/footage.js takes its sources from here and declares its own clips:
//   const FOOTAGE_DEF = { sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../../cataract-series/footage-sources.js'), clips: { … } };
// and its video.html loads this file before anim/footage.js.
// ============================================================================
const CATARACT_FOOTAGE = {
  // case A: OD, surgeon superior (12 o'clock at the bottom of the frame, temporal on the right); Zeiss overlay burned in
  'case-a': {
    file: 'videos/src/cataract-series/footage/case-a.mp4', w: 1280, h: 720, fps: 30, eye: 'OD',
    // measured 2026-11-09 (Claude) from the mean of 60 full-resolution frames spread over 0:03–20:42: box edges are where the
    // mean brightness steps (± 1 px). The overlay does not move or change size during the recording.
    overlays: [
      { name: 'ZEISS logo', x: 10, y: 10, w: 50, h: 48 },
      { name: 'left parameter column', x: 10, y: 180, w: 120, h: 360 },
      { name: 'bottom box: Dr. / surgeon field', x: 500, y: 637, w: 280, h: 72 },
      { name: 'bottom box: ---', x: 826, y: 637, w: 444, h: 72 },
      { name: 'left edge line', x: 0, y: 0, w: 2, h: 720 },
    ],
    // cornea centre (limbus) and main incision (where the capsulorhexis forceps cross the limbus), read from gridded
    // full-resolution frames; the incision sits 21–24° temporal of straight down (12 o'clock, slightly temporal)
    landmarks: [
      { t: 66.1, cornea: [408, 345], incision: [494, 536] },
      { t: 70.0, cornea: [437, 348], incision: [520, 535] },
      { t: 78.0, cornea: [445, 335], incision: [524, 536] },
      // 2026-11-09 for video ① (cataract-1-wound-ccc): the limbus circle (centre, radius r) found by a search for the dark iris band
      // inside the bright sclera on 2x-downsampled frames, each overlaid and checked by eye; the incision is placed on the measured
      // bearing (22° temporal of straight down, at 0.95 r). Where the forceps or the keratome cross the limbus (43, 136, 170, 192,
      // 210, 278, 297 s) the computed point falls on them. Before 43 s the main incision is not cut yet: the point is where it will be.
      { t: 7.0, cornea: [468, 284], incision: [543, 469] },     // r 210
      { t: 14.0, cornea: [444, 302], incision: [523, 498] },    // r 222
      { t: 22.0, cornea: [426, 278], incision: [503, 468] },    // r 216
      { t: 43.0, cornea: [384, 296], incision: [457, 476] },    // r 204 (keratome touching the cornea)
      { t: 120.0, cornea: [486, 338], incision: [571, 549] },   // r 240 (the microscope zoomed in after about 88 s)
      { t: 136.0, cornea: [438, 314], incision: [523, 525] },
      { t: 170.0, cornea: [348, 326], incision: [433, 537] },
      { t: 192.0, cornea: [378, 272], incision: [463, 483] },
      { t: 210.0, cornea: [342, 272], incision: [425, 478] },   // r 234
      { t: 240.0, cornea: [438, 242], incision: [523, 453] },
      { t: 270.0, cornea: [414, 296], incision: [499, 507] },
      { t: 278.0, cornea: [438, 290], incision: [526, 507] },   // r 246
      { t: 297.0, cornea: [366, 272], incision: [449, 478] },   // r 234
    ],
  },
};
if (typeof module !== 'undefined') module.exports = CATARACT_FOOTAGE;
