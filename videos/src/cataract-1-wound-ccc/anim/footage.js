// ============================================================================
// Footage clips of video ① (case A, OD, surgeon at 12; videos/src/cataract-series/footage-sources.js). Source times in seconds,
// read frame by frame on 2026-11-09 (contact sheets at 0.5–4 fps, full-resolution crops where needed; spec.md 進度 has the table).
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-1-wound-ccc → footage/frames/<clip>/ (gitignored).
// Crops stay ≥ 4 px from the burned-in overlays (checked): w 600 → centre x ≥ 438, centre y 203–430; w 640 → x ≥ 458, y 217–416.
// Event names used by draw.js and check.js:
//   pass<n>-in / -out   the capsulorhexis forceps in / out of the eye through the main incision (4 passes)
//   grasp-<n>           the forceps close on the flap after being opened (n = 1…8, every grasp seen at 2–4 fps; brief ones may be missed)
//   ovd-refill-<n>      OVD added during the capsulorhexis (3); wipe-<n> the incision wiped with a sponge (blood)
// ============================================================================
const FOOTAGE_DEF = {
  sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../../cataract-series/footage-sources.js'),   // eslint-disable-line no-undef
  clips: {
    // 0:04.5–0:10 side port: the blade enters at the left (nasal, about 2 o'clock), tip in the anterior chamber 7.5–8.5 s
    'sideport': {
      src: 'case-a', in: 4.5, out: 10.0, rate: 0.5,
      freeze: [{ at: 7.75, dur: 2.5 }],
      crop: [{ t: 4.5, cx: 470, cy: 330, w: 640 }],
      events: { 'blade-limbus': 6.4, 'blade-ac': 7.5, 'blade-out': 9.0, 'freeze': 7.75 },
      points: { 'blade-tip': [{ t: 7.75, p: [328, 372] }] },
    },
    // 0:13–0:28.5 OVD through the side port (two fills, 13.8–18.5 and 22.0–27.5 s); the cannula tip measured at the freeze
    'ovd': {
      src: 'case-a', in: 13.0, out: 28.5, rate: 1,
      freeze: [{ at: 16.5, dur: 2 }],
      crop: [{ t: 13.0, cx: 470, cy: 300, w: 640 }],
      events: { 'cannula-in': 13.8, 'fill-1-end': 18.5, 'cannula-2-in': 22.0, 'ovd-end': 27.5, 'freeze': 16.5 },
      points: { 'cannula-tip': [{ t: 16.5, p: [553, 328] }] },
    },
    // 0:41–0:49 keratome: touches the cornea 43.0 s, tip in the anterior chamber 45.5 s, out 47.5 s
    'keratome': {
      src: 'case-a', in: 41.0, out: 49.0, rate: 0.5,
      crop: [{ t: 41.0, cx: 458, cy: 330, w: 640 }],
      events: { 'k-touch': 43.0, 'k-ac': 45.5, 'k-out': 47.5 },
    },
    // 1:04–1:20 the forceps come in (65.4 / 66.1 s), pinch the anterior capsule at the centre (69.5 s): radial wrinkles 70.0–74.3 s
    // (zonules weak), the forceps open and grasp the flap (75.0 s). Points measured on the frozen frame (72.0 s).
    'pinch': {
      src: 'case-a', in: 64.0, out: 80.0, rate: 0.5,
      freeze: [{ at: 72.0, dur: 3 }],
      crop: [{ t: 64.0, cx: 450, cy: 375, w: 600 }],
      events: { 'forceps-at-incision': 65.4, 'pass1-in': 66.1, 'pinch': 69.5, 'wrinkles': 70.0, 'freeze': 72.0, 'wrinkles-gone': 74.3, 'grasp-1': 75.0 },
      points: {
        'forceps-tip': [{ t: 72.0, p: [375, 345] }],
        'wrinkle': [{ t: 72.0, p: [330, 305] }],
        'incision': [{ t: 66.1, p: [494, 536] }, { t: 70.0, p: [520, 535] }, { t: 78.0, p: [524, 536] }],
      },
    },
    // 1:16–1:48 pass 1: the forceps stay near the centre and raise the flap; out at 107.5 s (3× in the video)
    'pass1': {
      src: 'case-a', in: 76.0, out: 108.0, rate: 3,
      crop: [{ t: 76.0, cx: 450, cy: 370, w: 600 }, { t: 88.0, cx: 445, cy: 350, w: 600 }, { t: 100.0, cx: 438, cy: 345, w: 600 }, { t: 108.0, cx: 438, cy: 320, w: 600 }],
      events: { 'pass1-out': 107.5 },
    },
    // 1:48–2:14 the incision is wiped (109–117 s), OVD through the side port (120–126 s) (4× in the video)
    'gap1': {
      src: 'case-a', in: 108.0, out: 134.0, rate: 4,
      crop: [{ t: 108.0, cx: 460, cy: 320, w: 640 }, { t: 118.0, cx: 470, cy: 340, w: 640 }, { t: 134.0, cx: 465, cy: 340, w: 640 }],
      events: { 'wipe-1': 109.0, 'ovd-refill-1': 120.0, 'ovd-refill-1-end': 126.0 },
    },
    // 2:14–2:41 pass 2: the tip goes from the lower left of the pupil, past the bottom (12 o'clock), to the right: counter-clockwise
    // as the surgeon sees it. Grasp 135.5 s; open and re-grasp 150.5 s (frozen; tips measured on that frame)
    'pass2': {
      src: 'case-a', in: 134.0, out: 161.0, rate: 1,
      freeze: [{ at: 150.5, dur: 2.5 }],
      crop: [{ t: 134.0, cx: 450, cy: 355, w: 600 }, { t: 146.0, cx: 440, cy: 340, w: 600 }, { t: 152.0, cx: 438, cy: 340, w: 600 }, { t: 161.0, cx: 438, cy: 320, w: 600 }],
      events: { 'pass2-in': 134.0, 'grasp-2': 135.5, 'grasp-3': 150.5, 'freeze': 150.5, 'pass2-out': 160.5 },
      points: { 'regrasp-tips': [{ t: 150.5, p: [510, 448] }] },
    },
    // 2:41–3:52 wipe (165–175 s), OVD (180.5 s), pass 3 184–231.5 s with four grasps (5× in the video)
    'pass3': {
      src: 'case-a', in: 161.0, out: 232.0, rate: 5,
      crop: [{ t: 161.0, cx: 438, cy: 330, w: 600 }],
      events: { 'wipe-2': 165.0, 'ovd-refill-2': 180.5, 'pass3-in': 184.0, 'grasp-4': 186.0, 'grasp-5': 196.0, 'grasp-6': 206.0, 'grasp-7': 229.0, 'pass3-out': 231.5 },
    },
    // 3:52–4:33 reflux at the incision, OVD through the main incision (241–252 s), wipe (254–265 s) (6× in the video)
    'gap3': {
      src: 'case-a', in: 232.0, out: 273.0, rate: 6,
      crop: [{ t: 232.0, cx: 460, cy: 300, w: 640 }],
      events: { 'ovd-refill-3': 241.0, 'ovd-refill-3-end': 252.0, 'wipe-3': 254.0 },
    },
    // 4:33–4:56 pass 4: grasp 277.0 s, the last part torn at the temporal side; out 295.0 s (6× in the video)
    'pass4': {
      src: 'case-a', in: 273.0, out: 296.0, rate: 6,
      crop: [{ t: 273.0, cx: 445, cy: 340, w: 600 }, { t: 282.0, cx: 445, cy: 320, w: 600 }, { t: 290.0, cx: 438, cy: 300, w: 600 }, { t: 296.0, cx: 438, cy: 310, w: 600 }],
      events: { 'pass4-in': 273.5, 'grasp-8': 277.0, 'pass4-out': 295.0 },
    },
    // 4:56–5:00.5 the free flap is taken out through the main incision (297.5–299.5 s) (0.5×)
    'flap': {
      src: 'case-a', in: 296.0, out: 300.5, rate: 0.5,
      crop: [{ t: 296.0, cx: 438, cy: 320, w: 600 }],
      events: { 'flap-out': 297.5, 'flap-out-end': 299.5 },
    },
    // title still: pass 3, the forceps on the flap (3:12)
    'title': {
      src: 'case-a', in: 192.0, out: 192.2, rate: 1,
      crop: [{ t: 192.0, cx: 438, cy: 320, w: 600 }],
    },
  },
};
if (typeof module !== 'undefined') module.exports = FOOTAGE_DEF;
