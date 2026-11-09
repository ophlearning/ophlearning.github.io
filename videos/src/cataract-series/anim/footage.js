// ============================================================================
// Footage kit demo (test page of videos/tools/video-kit/footage.js; not a video): clips used by anim/footage-demo.html.
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-series → footage/frames/<clip>/ (gitignored).
// ============================================================================
const FOOTAGE_DEF = {
  sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../footage-sources.js'),   // eslint-disable-line no-undef
  clips: {
    // case A 0:58–1:20: the capsulorhexis forceps come in through the main incision and start the CCC (spec 錄影清單 1:00–4:55)
    'ccc-start': {
      src: 'case-a', in: 58, out: 80, rate: 0.5,
      freeze: [{ at: 70, dur: 3 }],
      // the eye drifts temporal-left and up; the crop follows it but never comes nearer than 4 px to the left column (x ≥ 134)
      crop: [{ t: 58, cx: 505, cy: 372, w: 720 }, { t: 63.5, cx: 505, cy: 372, w: 720 }, { t: 66, cx: 496, cy: 368, w: 720 }, { t: 80, cx: 496, cy: 360, w: 720 }],
      events: { 'forceps-at-incision': 65.4, 'forceps-in-ac': 66.1, 'freeze': 70 },
      points: {
        'forceps-tip': [{ t: 70, p: [383, 350] }],
        'incision': [{ t: 66.1, p: [494, 536] }, { t: 70, p: [520, 535] }, { t: 78, p: [524, 536] }],
      },
    },
  },
};
if (typeof module !== 'undefined') module.exports = FOOTAGE_DEF;
