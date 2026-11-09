// ============================================================================
// Footage clips of video ① (case A, OD, surgeon at 12; videos/src/cataract-series/footage-sources.js). Source times in seconds,
// read frame by frame on 2026-11-09 (contact sheets at 0.5–4 fps, full-resolution crops where needed; spec.md 進度 has the table).
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-1-wound-ccc → footage/frames/<clip>/ (gitignored).
// Crops stay ≥ 4 px from the burned-in overlays (checked): w 600 → centre x ≥ 438, centre y 203–430; w 640 → x ≥ 458, y 217–416.
// Event names used by draw.js and check.js:
//   pass<n>-in / -out   the capsulorhexis forceps in / out of the eye through the main incision (4 passes)
//   grasp-<n>           the forceps close on the flap after being opened (n = 1…8, every grasp seen at 2–4 fps; brief ones may be missed)
//   ovd-refill-<n>      OVD added during the capsulorhexis (3); wipe-<n> the incision wiped with a sponge (blood)
// Tear keyframes (points of pass2–pass4, 2026-11-09 re-annotated): `grasp` = where the closed forceps jaws hold the flap and `cornea` = the
// limbus centre (circle search on every frame at 1–4 fps, median over ±1.25 s, each checked on a gridded zoom), both source px at the same
// source times. Clock hour of the grasp = its bearing from the cornea centre (下＝12 點、右＝temporal 9 點). params.js turns them into the
// model's forceps clock and the reconstructed tear front (依鉗子位置重建（示意）: the forceps hold the folded flap, often near its far end, so
// they go round about twice while the front goes round once); check.js compares the drawing with these keyframes.
// Crops follow the eye (same limbus track, mean over ±1–2.5 s): cy follows it; cx stops at 438 (the parameter column blocks x < 134), so
// when the eye drifts left (2:34–2:41, 4:51–5:00) the cornea sits up to ~150 px left of the panel centre with the pupil still in view.
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
        'wrinkle': [{ t: 72.0, p: [350, 312] }],   // on the darkest radial fold, between the forceps tip and the fan's end (checked at 8× zoom)
        'incision': [{ t: 66.1, p: [494, 536] }, { t: 70.0, p: [520, 535] }, { t: 78.0, p: [524, 536] }],
      },
    },
    // 1:16–1:48 pass 1: the forceps stay near the centre and raise the flap; out at 107.5 s (3× in the video)
    'pass1': {
      src: 'case-a', in: 76.0, out: 108.0, rate: 3,
      crop: [{ t: 76.0, cx: 446, cy: 341, w: 600 }, { t: 80.0, cx: 441, cy: 337, w: 600 }, { t: 84.0, cx: 450, cy: 308, w: 600 }, { t: 88.0, cx: 438, cy: 301, w: 600 },
        { t: 92.0, cx: 438, cy: 317, w: 600 }, { t: 98.0, cx: 438, cy: 327, w: 600 }, { t: 104.0, cx: 438, cy: 296, w: 600 }, { t: 108.0, cx: 438, cy: 263, w: 600 }],
      events: { 'pass1-out': 107.5 },
    },
    // 1:48–2:14 the incision is wiped (109–117 s), OVD through the side port (120–126 s) (4× in the video)
    'gap1': {
      src: 'case-a', in: 108.0, out: 134.0, rate: 4,
      crop: [{ t: 108.0, cx: 438, cy: 263, w: 600 }, { t: 112.0, cx: 438, cy: 304, w: 600 }, { t: 116.0, cx: 438, cy: 322, w: 600 }, { t: 119.0, cx: 460, cy: 334, w: 600 },
        { t: 122.0, cx: 475, cy: 334, w: 600 }, { t: 128.0, cx: 475, cy: 330, w: 600 }, { t: 132.0, cx: 460, cy: 337, w: 600 }, { t: 134.0, cx: 442, cy: 310, w: 600 }],
      events: { 'wipe-1': 109.0, 'ovd-refill-1': 120.0, 'ovd-refill-1-end': 126.0 },
    },
    // 2:14–2:41 pass 2: the tip goes from the lower left of the pupil, past the bottom (12 o'clock), to the right: counter-clockwise
    // as the surgeon sees it. Grasp 135.5 s; open and re-grasp 150.5 s (frozen; tips measured on that frame)
    'pass2': {
      src: 'case-a', in: 134.0, out: 161.0, rate: 1,
      freeze: [{ at: 150.5, dur: 2.5 }],
      crop: [{ t: 134.0, cx: 442, cy: 310, w: 600 }, { t: 138.0, cx: 444, cy: 323, w: 600 }, { t: 141.0, cx: 453, cy: 313, w: 600 }, { t: 144.0, cx: 438, cy: 310, w: 600 },
        { t: 146.0, cx: 438, cy: 314, w: 600 }, { t: 148.0, cx: 438, cy: 271, w: 600 }, { t: 149.0, cx: 438, cy: 275, w: 600 }, { t: 151.0, cx: 438, cy: 321, w: 600 },
        { t: 152.0, cx: 438, cy: 283, w: 600 }, { t: 153.0, cx: 438, cy: 237, w: 600 }, { t: 154.0, cx: 438, cy: 222, w: 600 }, { t: 155.0, cx: 438, cy: 228, w: 600 },
        { t: 156.0, cx: 438, cy: 251, w: 600 }, { t: 157.0, cx: 438, cy: 273, w: 600 }, { t: 159.0, cx: 438, cy: 281, w: 600 }, { t: 161.0, cx: 438, cy: 304, w: 600 }],
      events: { 'pass2-in': 134.0, 'grasp-2': 135.5, 'grasp-3': 150.5, 'freeze': 150.5, 'pass2-out': 160.5 },
      points: {
        'regrasp-tips': [{ t: 150.5, p: [413, 393] }],   // between the two open jaw tips on the frozen frame (4515; checked at 1.5× on the full-resolution frame)
        'grasp': [{ t: 140, p: [404, 368] }, { t: 142, p: [437, 414] }, { t: 144, p: [476, 375] }, { t: 146, p: [472, 404] }, { t: 147, p: [527, 359] }, { t: 148, p: [545, 270] },
          { t: 149, p: [531, 223] }, { t: 150.5, p: [413, 393] }, { t: 152, p: [489, 353] }, { t: 153, p: [533, 165] }, { t: 154, p: [452, 157] }, { t: 155, p: [439, 146] },
          { t: 156, p: [360, 128] }, { t: 157, p: [304, 157] }, { t: 158, p: [248, 156] }, { t: 159, p: [187, 180] }, { t: 160, p: [190, 222] }],
        'cornea': [{ t: 140, p: [454, 314] }, { t: 142, p: [450, 310] }, { t: 144, p: [440, 308] }, { t: 146, p: [412, 316] }, { t: 147, p: [420, 310] }, { t: 148, p: [436, 258] },
          { t: 149, p: [424, 262] }, { t: 150.5, p: [358, 314] }, { t: 152, p: [382, 326] }, { t: 153, p: [404, 222] }, { t: 154, p: [358, 222] }, { t: 155, p: [338, 224] },
          { t: 156, p: [308, 260] }, { t: 157, p: [300, 276] }, { t: 158, p: [294, 276] }, { t: 159, p: [274, 276] }, { t: 160, p: [274, 293] }],
      },
    },
    // 2:41–3:52 wipe (165–175 s), OVD (180.5 s), pass 3 184–231.5 s with four grasps (5× in the video)
    'pass3': {
      src: 'case-a', in: 161.0, out: 232.0, rate: 5,
      crop: [{ t: 161.0, cx: 438, cy: 299, w: 600 }, { t: 164.0, cx: 438, cy: 328, w: 600 }, { t: 176.0, cx: 438, cy: 334, w: 600 }, { t: 182.0, cx: 438, cy: 305, w: 600 },
        { t: 185.0, cx: 438, cy: 255, w: 600 }, { t: 191.0, cx: 438, cy: 270, w: 600 }, { t: 197.0, cx: 438, cy: 222, w: 600 }, { t: 200.0, cx: 438, cy: 227, w: 600 },
        { t: 203.0, cx: 438, cy: 255, w: 600 }, { t: 206.0, cx: 438, cy: 220, w: 600 }, { t: 209.0, cx: 438, cy: 240, w: 600 }, { t: 212.0, cx: 438, cy: 295, w: 600 },
        { t: 218.0, cx: 438, cy: 282, w: 600 }, { t: 221.0, cx: 438, cy: 304, w: 600 }, { t: 224.0, cx: 438, cy: 288, w: 600 }, { t: 227.0, cx: 438, cy: 260, w: 600 },
        { t: 232.0, cx: 438, cy: 262, w: 600 }],
      events: { 'wipe-2': 165.0, 'ovd-refill-2': 180.5, 'pass3-in': 184.0, 'grasp-4': 186.0, 'grasp-5': 196.0, 'grasp-6': 206.0, 'grasp-7': 229.0, 'pass3-out': 231.5 },
      points: {
        'grasp': [{ t: 186, p: [259, 185] }, { t: 188, p: [343, 188] }, { t: 190, p: [260, 228] }, { t: 192, p: [270, 243] }, { t: 194, p: [237, 248] }, { t: 196, p: [416, 159] },
          { t: 198, p: [417, 122] }, { t: 200, p: [330, 178] }, { t: 202, p: [245, 253] }, { t: 204, p: [190, 321] }, { t: 206, p: [344, 132] }, { t: 207, p: [367, 149] },
          { t: 209, p: [283, 189] }, { t: 211, p: [198, 347] }, { t: 213, p: [307, 377] }, { t: 215, p: [333, 396] }, { t: 219, p: [260, 342] }, { t: 221, p: [317, 404] },
          { t: 223, p: [421, 386] }, { t: 225, p: [477, 329] }, { t: 227, p: [535, 296] }, { t: 229, p: [441, 365] }],
        'cornea': [{ t: 186, p: [364, 230] }, { t: 188, p: [416, 272] }, { t: 190, p: [374, 276] }, { t: 192, p: [370, 274] }, { t: 194, p: [370, 248] }, { t: 196, p: [436, 228] },
          { t: 198, p: [432, 206] }, { t: 200, p: [414, 224] }, { t: 202, p: [360, 268] }, { t: 204, p: [350, 268] }, { t: 206, p: [412, 206] }, { t: 207, p: [440, 190] },
          { t: 209, p: [390, 216] }, { t: 211, p: [332, 300] }, { t: 213, p: [378, 298] }, { t: 215, p: [374, 296] }, { t: 219, p: [366, 302] }, { t: 221, p: [384, 304] },
          { t: 223, p: [434, 308] }, { t: 225, p: [436, 268] }, { t: 227, p: [436, 256] }, { t: 229, p: [388, 254] }],
      },
    },
    // 3:52–4:33 reflux at the incision, OVD through the main incision (241–252 s), wipe (254–265 s) (6× in the video)
    'gap3': {
      src: 'case-a', in: 232.0, out: 273.0, rate: 6,
      crop: [{ t: 232.0, cx: 438, cy: 261, w: 600 }, { t: 236.0, cx: 438, cy: 278, w: 600 }, { t: 240.0, cx: 438, cy: 254, w: 600 }, { t: 248.0, cx: 438, cy: 278, w: 600 },
        { t: 256.0, cx: 438, cy: 222, w: 600 }, { t: 260.0, cx: 438, cy: 240, w: 600 }, { t: 264.0, cx: 438, cy: 296, w: 600 }, { t: 273.0, cx: 438, cy: 295, w: 600 }],
      events: { 'ovd-refill-3': 241.0, 'ovd-refill-3-end': 252.0, 'wipe-3': 254.0 },
    },
    // 4:33–4:56 pass 4: grasp 277.0 s, the last part torn at the temporal side; out 295.0 s (6× in the video)
    'pass4': {
      src: 'case-a', in: 273.0, out: 296.0, rate: 6,
      crop: [{ t: 273.0, cx: 438, cy: 290, w: 600 }, { t: 275.0, cx: 438, cy: 299, w: 600 }, { t: 277.0, cx: 439, cy: 282, w: 600 }, { t: 279.0, cx: 448, cy: 260, w: 600 },
        { t: 283.0, cx: 440, cy: 254, w: 600 }, { t: 285.0, cx: 460, cy: 224, w: 600 }, { t: 287.0, cx: 438, cy: 212, w: 600 }, { t: 288.0, cx: 438, cy: 207, w: 600 },
        { t: 293.0, cx: 438, cy: 210, w: 600 }, { t: 295.0, cx: 438, cy: 261, w: 600 }, { t: 296.0, cx: 438, cy: 278, w: 600 }],
      events: { 'pass4-in': 273.5, 'grasp-8': 277.0, 'pass4-out': 295.0 },
      points: {
        'grasp': [{ t: 278, p: [434, 368] }, { t: 280, p: [475, 328] }, { t: 282, p: [506, 342] }, { t: 284, p: [498, 343] }, { t: 286, p: [599, 213] }, { t: 288, p: [529, 151] },
          { t: 290, p: [552, 157] }, { t: 292, p: [335, 112] }],
        'cornea': [{ t: 278, p: [448, 276] }, { t: 280, p: [448, 254] }, { t: 282, p: [452, 252] }, { t: 284, p: [448, 248] }, { t: 286, p: [466, 214] }, { t: 288, p: [420, 196] },
          { t: 290, p: [400, 170] }, { t: 292, p: [274, 200] }],
      },
    },
    // 4:56–5:00.5 the free flap is taken out through the main incision (297.5–299.5 s) (0.5×)
    'flap': {
      src: 'case-a', in: 296.0, out: 300.5, rate: 0.5,
      crop: [{ t: 296.0, cx: 438, cy: 278, w: 600 }, { t: 297.5, cx: 438, cy: 216, w: 600 }, { t: 299.0, cx: 438, cy: 207, w: 600 }, { t: 300.5, cx: 438, cy: 238, w: 600 }],
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
