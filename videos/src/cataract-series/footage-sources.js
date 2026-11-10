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
      // 2026-11-10 for video ② (cataract-2-hydro-dc), 5:18–10:20: the limbus circle from a ray search (the strongest iris → sclera step on 240 rays,
      // RANSAC circle fit) or, where that fit locked onto the golden ring or an instrument (318–390 s), read by eye on gridded frames; every circle
      // overlaid and checked. The incision is put on the measured bearing (22° temporal of straight down, at 0.95 r); on these frames the
      // hydrodissection cannula (318, 332 s) and the phaco (352–620 s) cross the limbus at or within ~30 px of that point.
      { t: 318, cornea: [405, 295], incision: [499, 528] },   // r 265
      { t: 323.9, cornea: [424, 312], incision: [519, 548] },   // r 268
      { t: 332, cornea: [400, 300], incision: [495, 536] },   // r 268
      { t: 340, cornea: [390, 285], incision: [483, 516] },   // r 262
      { t: 352, cornea: [410, 310], incision: [503, 539] },   // r 260
      { t: 360, cornea: [414, 325], incision: [505, 550] },   // r 255
      { t: 366.1, cornea: [450, 330], incision: [543, 559] },   // r 260
      { t: 372, cornea: [506, 345], incision: [597, 570] },   // r 255
      { t: 390, cornea: [445, 320], incision: [534, 540] },   // r 250
      { t: 404, cornea: [498, 483], incision: [591, 714] },   // r 262
      { t: 418, cornea: [565, 523], incision: [650, 733] },   // r 238
      { t: 430, cornea: [534, 443], incision: [625, 668] },   // r 256
      { t: 450, cornea: [552, 458], incision: [646, 691] },   // r 264
      { t: 476, cornea: [497, 267], incision: [589, 495] },   // r 259
      { t: 500, cornea: [531, 248], incision: [621, 472] },   // r 254
      { t: 530, cornea: [602, 308], incision: [694, 536] },   // r 259
      { t: 560, cornea: [565, 276], incision: [656, 501] },   // r 256
      { t: 590, cornea: [543, 327], incision: [632, 548] },   // r 251
      { t: 620, cornea: [458, 356], incision: [545, 571] },   // r 244
      // 2026-11-10 for video ③ (cataract-3-ia-iol), 11:03–19:36: the same ray search + RANSAC circle, each fit overlaid and checked by eye (fits that
      // locked onto the pupil or the optic were dropped); 1176 s read by eye on a gridded frame (the microscope zoomed out, a swab covers the lower
      // limbus). The incision is put on the measured bearing (22° temporal of straight down, at 0.95 r); on these frames the I/A handpiece (663–812 s,
      // 1140–1150 s), the OVD cannula (878 s) and the injector (998 s) cross the limbus at or within ~30 px of that point.
      { t: 663, cornea: [404, 393], incision: [488, 601] },   // r 236
      { t: 704, cornea: [424, 366], incision: [509, 577] },   // r 239
      { t: 748, cornea: [548, 393], incision: [632, 602] },   // r 237
      { t: 790, cornea: [506, 336], incision: [596, 558] },   // r 252
      { t: 812, cornea: [581, 426], incision: [661, 624] },   // r 225
      { t: 826, cornea: [433, 435], incision: [521, 653] },   // r 248
      { t: 830, cornea: [525, 468], incision: [613, 686] },   // r 247
      { t: 878, cornea: [371, 307], incision: [462, 533] },   // r 257
      { t: 998, cornea: [400, 411], incision: [491, 636] },   // r 255
      { t: 1004, cornea: [424, 440], incision: [521, 681] },  // r 273
      { t: 1118, cornea: [522, 384], incision: [618, 621] },  // r 269
      { t: 1140, cornea: [515, 394], incision: [610, 629] },  // r 267
      { t: 1150, cornea: [556, 416], incision: [648, 644] },  // r 259
      { t: 1176, cornea: [505, 428], incision: [551, 541] },  // r 128 (zoomed out)
    ],
  },
  // case B (PCR, video ④): LEFT eye OS (the user confirmed 2026-11-10), surgeon superior: 12 o'clock at the bottom of the frame, 9 o'clock (nasal for OS)
  // on the right; main incision about 11 o'clock (bottom right), side port about 2 o'clock (bottom left). Another recording system: no burned-in text,
  // logo or parameter column (videos/src/cataract-4-pcr/footage-notes.md §1), only two encoding edge lines, registered as overlays.
  'case-pcr': {
    file: 'videos/src/cataract-series/footage/case-pcr.mp4', w: 1280, h: 720, fps: 30, eye: 'OS',
    tag: { title: '術者視角　左眼 OS　手術錄影', orient: '下＝12 點　右＝9 點 nasal' },
    // measured 2026-11-10 (footage-notes §1): mean of 60 full-resolution frames over 0:01–50:11; the top row is bright, the right column dark
    overlays: [
      { name: 'top edge bright line', x: 0, y: 0, w: 1280, h: 2 },
      { name: 'right edge dark column', x: 1279, y: 0, w: 1, h: 720 },
    ],
    // 2026-11-10 for video ④ (cataract-4-pcr): the limbus circle from a coarse ring search on 4x-downsampled frames refined by a ray search
    // (strongest iris → sclera step on 240 rays, RANSAC circle fit), each fit overlaid and checked by eye. The main incision is put on the measured
    // bearing, 31° right of straight down at 0.95 r: where the phaco, I/A, injector, hook, vitrector and cannulas cross the limbus (760.5–2722 s) read
    // 25–40° (footage-notes §2.2: 31–38°). Clips turn the picture 8° clockwise (crop rot) so the incision falls 23° from straight down.
    landmarks: [
      { t: 760.5, cornea: [709, 175], incision: [800, 326] },    // r 185
      { t: 776.0, cornea: [727, 193], incision: [822, 352] },    // r 195
      { t: 778.0, cornea: [729, 183], incision: [823, 340] },    // r 193
      { t: 791.0, cornea: [725, 251], incision: [823, 414] },    // r 200
      { t: 830.0, cornea: [745, 227], incision: [841, 387] },    // r 197
      { t: 952.0, cornea: [724, 280], incision: [819, 439] },    // r 195
      { t: 1192.0, cornea: [782, 242], incision: [877, 400] },   // r 194
      { t: 1464.0, cornea: [767, 354], incision: [864, 516] },   // r 199
      { t: 1465.0, cornea: [768, 356], incision: [865, 517] },   // r 198
      { t: 2604.0, cornea: [713, 256], incision: [796, 394] },   // r 169 (microscope zoomed out a little)
      { t: 2633.0, cornea: [702, 299], incision: [785, 437] },   // r 170
      { t: 2701.0, cornea: [660, 257], incision: [740, 390] },   // r 163
      { t: 2731.0, cornea: [658, 253], incision: [742, 392] },   // r 171
    ],
  },
};
if (typeof module !== 'undefined') module.exports = CATARACT_FOOTAGE;
