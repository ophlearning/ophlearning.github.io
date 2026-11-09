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
    ],
  },
};
if (typeof module !== 'undefined') module.exports = CATARACT_FOOTAGE;
