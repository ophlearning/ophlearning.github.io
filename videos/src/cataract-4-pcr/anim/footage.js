// ============================================================================
// Footage clips of video ④ (case B, the PCR case: LEFT eye OS, surgeon at 12; videos/src/cataract-series/footage-sources.js 'case-pcr').
// Source times in seconds, read on 2026-11-10 from contact sheets at 0.25–5 s and gridded full-resolution frames (script-draft.md 「本例的錄影事件」
// has the table; footage-notes.md the whole-film reading). No audio is ever used.
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-4-pcr → footage/frames/<clip>/ (gitignored).
// Crops: centre = the limbus circle fitted every 2–6 s (scratch tracking, each fit overlaid and checked), clamped so the turned crop stays ≥ 4 px off
// the two edge lines; every crop is turned 8° clockwise (rot) so the main incision (31° right of straight down on the recording) falls 23° from
// straight down, as the kit's orientation check asks (≤ 30°). The eye sits high in the frame before 14:08 (the top of the cornea is cut).
// Points (label anchors) are measured on the frozen frame only (source px).
// Not used on purpose (the user did not answer what they were, 2026-11-10): the injections at 29:40–31:45 and 41:10; nothing is said about lens
// fragments in the vitreous or a VR referral for this case. Unclear and not shown: the knife at 23:05–23:20 (the globe is rotated), the sutures
// from 46:35 (the globe is rotated; the narration only says the case was sutured).
// Event names used by draw.js and check.js:
//   orange                     12:54: an orange-red reflex appears in the lower left of the pupil (not seen before)
//   phaco-out / out            12:57.0 the phaco starts to leave; 12:58.4 phaco and chopper are both out (a large piece of nucleus is left)
//   can-in / can-out           a thin cannula through the side port (bottom left) pushes something into the chamber (looks like OVD)
//   lev-in / lev-out           a curved cannula through the main incision under and beside the large piece; the piece moves to the pupil centre
//   ph-in / ph-out             the phaco through the main incision with a STRAIGHT thin instrument through the side port (the left hand held a curved
//                              chopper before 12:58); the remaining nucleus is emulsified
//   ia                         a coaxial I/A (yellow sleeve) through the main incision (cortex)
//   two-in                     two instruments: through the left incision (irrigation, looks like) and the main incision (vitrector, looks like)
//   unfold / inj-out           the folded IOL opens in the chamber; the injector leaves the main incision
//   hook-in                    a hook through the main incision adjusts the IOL
//   ta-in / ta-white / ta-out  a cannula through the left incision; white particles (triamcinolone, the surgeon thinks) gather in front of the pupil
//   clear                      instruments have cleared the white particles; the pupil is clear again
//   m-frz, lev-frz, vit-frz, ta-frz, ta2-in   the freezes (and the clearing clip's start) the narration's 「停格」 lines are anchored to
// ============================================================================
const FOOTAGE_DEF = {
  sources: typeof CATARACT_FOOTAGE !== 'undefined' ? CATARACT_FOOTAGE : require('../../cataract-series/footage-sources.js'),   // eslint-disable-line no-undef
  clips: {
    // title still: bimanual limbal anterior vitrectomy, both instruments in (24:25)
    'title': {
      src: 'case-pcr', in: 1465.0, out: 1465.2, rate: 1,
      crop: [{ t: 1465.0, cx: 768, cy: 356, w: 640, rot: 8 }, { t: 1465.2, cx: 768, cy: 355, w: 640, rot: 8 }],
    },
    // 12:40.5: phaco and chopper on the hard nucleus (dark green), the red reflex weak
    'case': {
      src: 'case-pcr', in: 760.4, out: 760.6, rate: 1,
      crop: [{ t: 760.4, cx: 709, cy: 250, w: 600, rot: 8 }, { t: 760.6, cx: 709, cy: 250, w: 600, rot: 8 }],
    },
    // 12:50–12:59.4 (0.5×): phaco + chopper on the remaining nucleus; from 12:54 an orange-red reflex in the lower left of the pupil; 12:57.0–12:58.4 phaco
    // and chopper leave together with a large piece left. Freeze 12:59 (no instrument, the orange reflex)
    'moment': {
      src: 'case-pcr', in: 770.0, out: 779.4, rate: 0.5,
      freeze: [{ at: 779.0, dur: 4 }],
      crop: [{ t: 770.0, cx: 710, cy: 250, w: 600, rot: 8 }, { t: 774.0, cx: 722, cy: 250, w: 600, rot: 8 }, { t: 778.0, cx: 729, cy: 250, w: 600, rot: 8 },
        { t: 779.0, cx: 728, cy: 250, w: 600, rot: 8 }, { t: 779.4, cx: 727, cy: 250, w: 600, rot: 8 }],
      events: { 'orange': 774.0, 'phaco-out': 777.0, 'out': 778.4, 'm-frz': 779.0 },
      points: { 'orange': [{ t: 779.0, p: [602, 257] }] },
    },
    // 12:55–12:59.4 (0.5×): the same withdrawal, without the freeze (first step, 3-3)
    'withdraw': {
      src: 'case-pcr', in: 775.0, out: 779.4, rate: 0.5,
      crop: [{ t: 775.0, cx: 724, cy: 250, w: 600, rot: 8 }, { t: 778.0, cx: 729, cy: 250, w: 600, rot: 8 }, { t: 779.4, cx: 727, cy: 250, w: 600, rot: 8 }],
      events: { 'phaco-out': 777.0, 'out': 778.4 },
    },
    // 12:59.4–13:23 (2×): no instrument for about 10 s (13:03.5–13:04.5 something wipes the corneal surface); 13:08.5 a thin cannula through the side
    // port, moving in the chamber (pushing something: looks like OVD); out 13:21.5. Freeze 13:15 (the cannula in the chamber)
    'ovd1': {
      src: 'case-pcr', in: 779.4, out: 803.0, rate: 2,
      freeze: [{ at: 795.0, dur: 3 }],
      crop: [{ t: 779.4, cx: 727, cy: 250, w: 600, rot: 8 }, { t: 782.0, cx: 733, cy: 250, w: 600, rot: 8 }, { t: 785.0, cx: 735, cy: 250, w: 600, rot: 8 },
        { t: 788.0, cx: 699, cy: 250, w: 600, rot: 8 }, { t: 791.0, cx: 725, cy: 251, w: 600, rot: 8 }, { t: 794.0, cx: 756, cy: 250, w: 600, rot: 8 },
        { t: 795.0, cx: 758, cy: 250, w: 600, rot: 8 }, { t: 800.0, cx: 768, cy: 250, w: 600, rot: 8 }, { t: 803.0, cx: 736, cy: 250, w: 600, rot: 8 }],
      events: { 'can-in': 788.5, 'can-out': 801.5 },
      points: { 'cannula': [{ t: 795.0, p: [625, 325] }] },
    },
    // 13:26–14:03 (2×): 13:29 a curved cannula through the main incision under and beside the large piece; the piece ends up in the pupil centre;
    // out 14:01.5. Freeze 13:50 (the piece in the centre, the cannula beside it). The microscope pans at 14:08.2 (after the clip)
    'lev': {
      src: 'case-pcr', in: 806.0, out: 843.0, rate: 2,
      freeze: [{ at: 830.0, dur: 3 }],
      crop: [{ t: 806.0, cx: 725, cy: 252, w: 600, rot: 8 }, { t: 809.0, cx: 728, cy: 250, w: 600, rot: 8 }, { t: 812.0, cx: 740, cy: 250, w: 600, rot: 8 },
        { t: 815.0, cx: 749, cy: 250, w: 600, rot: 8 }, { t: 818.0, cx: 756, cy: 250, w: 600, rot: 8 }, { t: 821.0, cx: 766, cy: 250, w: 600, rot: 8 },
        { t: 824.0, cx: 755, cy: 250, w: 600, rot: 8 }, { t: 827.0, cx: 741, cy: 250, w: 600, rot: 8 }, { t: 830.0, cx: 745, cy: 250, w: 600, rot: 8 },
        { t: 833.0, cx: 727, cy: 250, w: 600, rot: 8 }, { t: 836.0, cx: 708, cy: 250, w: 600, rot: 8 }, { t: 839.0, cx: 745, cy: 250, w: 600, rot: 8 },
        { t: 842.0, cx: 726, cy: 250, w: 600, rot: 8 }, { t: 843.0, cx: 726, cy: 250, w: 600, rot: 8 }],
      events: { 'lev-in': 809.0, 'lev-out': 841.5, 'lev-frz': 830.0 },
      points: { 'piece': [{ t: 830.0, p: [705, 215] }], 'lev-can': [{ t: 830.0, p: [820, 315] }] },
    },
    // 14:44–17:02.5 (6×): 14:44.5 the phaco through the main incision and a straight thin instrument through the side port beside the piece; the piece
    // is emulsified; the phaco leaves 17:02. Freeze 14:52 (both instruments at the piece)
    'emul': {
      src: 'case-pcr', in: 884.0, out: 1022.5, rate: 6,
      freeze: [{ at: 892.0, dur: 3.5 }],
      crop: [{ t: 884.0, cx: 684, cy: 294, w: 640, rot: 8 }, { t: 892.0, cx: 674, cy: 266, w: 640, rot: 8 }, { t: 898.0, cx: 696, cy: 291, w: 640, rot: 8 },
        { t: 904.0, cx: 714, cy: 266, w: 640, rot: 8 }, { t: 910.0, cx: 713, cy: 271, w: 640, rot: 8 }, { t: 916.0, cx: 756, cy: 303, w: 640, rot: 8 },
        { t: 922.0, cx: 725, cy: 266, w: 640, rot: 8 }, { t: 928.0, cx: 756, cy: 270, w: 640, rot: 8 }, { t: 934.0, cx: 767, cy: 266, w: 640, rot: 8 },
        { t: 940.0, cx: 768, cy: 266, w: 640, rot: 8 }, { t: 946.0, cx: 752, cy: 273, w: 640, rot: 8 }, { t: 952.0, cx: 724, cy: 280, w: 640, rot: 8 },
        { t: 958.0, cx: 763, cy: 296, w: 640, rot: 8 }, { t: 964.0, cx: 748, cy: 290, w: 640, rot: 8 }, { t: 970.0, cx: 763, cy: 322, w: 640, rot: 8 },
        { t: 976.0, cx: 752, cy: 317, w: 640, rot: 8 }, { t: 982.0, cx: 731, cy: 331, w: 640, rot: 8 }, { t: 988.0, cx: 724, cy: 326, w: 640, rot: 8 },
        { t: 994.0, cx: 771, cy: 325, w: 640, rot: 8 }, { t: 1000.0, cx: 794, cy: 317, w: 640, rot: 8 }, { t: 1006.0, cx: 812, cy: 302, w: 640, rot: 8 },
        { t: 1012.0, cx: 751, cy: 334, w: 640, rot: 8 }, { t: 1018.0, cx: 720, cy: 339, w: 640, rot: 8 }, { t: 1022.0, cx: 670, cy: 281, w: 640, rot: 8 },
        { t: 1022.5, cx: 670, cy: 281, w: 640, rot: 8 }],
      events: { 'ph-in': 884.5, 'ph-out': 1022.0 },
      points: { 'phaco': [{ t: 892.0, p: [690, 330] }], 'straight': [{ t: 892.0, p: [561, 317] }] },
    },
    // 19:20–20:06 (4×): coaxial I/A (yellow sleeve) through the main incision, cortex; contrast is poor
    'ia': {
      src: 'case-pcr', in: 1160.0, out: 1206.0, rate: 4,
      crop: [{ t: 1160.0, cx: 675, cy: 266, w: 640, rot: 8 }, { t: 1168.0, cx: 725, cy: 266, w: 640, rot: 8 }, { t: 1174.0, cx: 755, cy: 269, w: 640, rot: 8 },
        { t: 1180.0, cx: 792, cy: 300, w: 640, rot: 8 }, { t: 1186.0, cx: 751, cy: 274, w: 640, rot: 8 }, { t: 1192.0, cx: 782, cy: 266, w: 640, rot: 8 },
        { t: 1198.0, cx: 807, cy: 270, w: 640, rot: 8 }, { t: 1204.0, cx: 778, cy: 266, w: 640, rot: 8 }, { t: 1206.0, cx: 788, cy: 266, w: 640, rot: 8 }],
      events: { 'ia': 1160.0 },
    },
    // 23:58–24:40 (2×): two instruments come in (24:02): through the left incision (green hub, sleeve, open end: irrigation, looks like) and through
    // the main incision (metal tube with a port beside the tip: vitrector, looks like). Freeze 24:25 (both in)
    'vit': {
      src: 'case-pcr', in: 1438.0, out: 1480.0, rate: 2,
      freeze: [{ at: 1465.0, dur: 4 }],
      crop: [{ t: 1438.0, cx: 711, cy: 406, w: 640, rot: 8 }, { t: 1444.0, cx: 705, cy: 371, w: 640, rot: 8 }, { t: 1448.0, cx: 738, cy: 360, w: 640, rot: 8 },
        { t: 1452.0, cx: 748, cy: 372, w: 640, rot: 8 }, { t: 1456.0, cx: 742, cy: 357, w: 640, rot: 8 }, { t: 1460.0, cx: 755, cy: 348, w: 640, rot: 8 },
        { t: 1464.0, cx: 767, cy: 354, w: 640, rot: 8 }, { t: 1465.0, cx: 768, cy: 356, w: 640, rot: 8 }, { t: 1468.0, cx: 769, cy: 345, w: 640, rot: 8 },
        { t: 1472.0, cx: 769, cy: 352, w: 640, rot: 8 }, { t: 1476.0, cx: 779, cy: 349, w: 640, rot: 8 }, { t: 1480.0, cx: 759, cy: 339, w: 640, rot: 8 }],
      events: { 'two-in': 1442.0, 'vit-frz': 1465.0 },
      points: { 'irr': [{ t: 1465.0, p: [735, 392] }], 'cutter': [{ t: 1465.0, p: [790, 330] }] },
    },
    // 43:21–43:35 (2×): the injector in the main incision, the folded IOL coming out; it opens 43:29.5; the injector leaves 43:32.5. Freeze 43:31
    'iol': {
      src: 'case-pcr', in: 2601.0, out: 2615.0, rate: 2,
      freeze: [{ at: 2611.0, dur: 3 }],
      crop: [{ t: 2601.0, cx: 688, cy: 250, w: 600, rot: 8 }, { t: 2604.0, cx: 713, cy: 256, w: 600, rot: 8 }, { t: 2607.0, cx: 713, cy: 254, w: 600, rot: 8 },
        { t: 2610.0, cx: 717, cy: 281, w: 600, rot: 8 }, { t: 2611.0, cx: 728, cy: 287, w: 600, rot: 8 }, { t: 2615.0, cx: 679, cy: 301, w: 600, rot: 8 }],
      events: { 'unfold': 2609.5, 'inj-out': 2612.5 },
      points: { 'iol': [{ t: 2611.0, p: [660, 265] }] },
    },
    // 43:36–44:36 (6×): a hook through the main incision adjusts the IOL; the final plane (bag / sulcus / capture) cannot be read. Freeze 44:20
    'iol2': {
      src: 'case-pcr', in: 2616.0, out: 2676.0, rate: 6,
      freeze: [{ at: 2660.0, dur: 3 }],
      crop: [{ t: 2616.0, cx: 680, cy: 298, w: 600, rot: 8 }, { t: 2621.0, cx: 685, cy: 286, w: 600, rot: 8 }, { t: 2627.0, cx: 694, cy: 290, w: 600, rot: 8 },
        { t: 2633.0, cx: 702, cy: 299, w: 600, rot: 8 }, { t: 2639.0, cx: 692, cy: 291, w: 600, rot: 8 }, { t: 2645.0, cx: 704, cy: 275, w: 600, rot: 8 },
        { t: 2651.0, cx: 674, cy: 313, w: 600, rot: 8 }, { t: 2657.0, cx: 689, cy: 303, w: 600, rot: 8 }, { t: 2660.0, cx: 680, cy: 292, w: 600, rot: 8 },
        { t: 2663.0, cx: 672, cy: 282, w: 600, rot: 8 }, { t: 2669.0, cx: 657, cy: 268, w: 600, rot: 8 }, { t: 2675.0, cx: 677, cy: 270, w: 600, rot: 8 },
        { t: 2676.0, cx: 672, cy: 271, w: 600, rot: 8 }],
      events: { 'hook-in': 2616.5 },
      points: { 'iol2': [{ t: 2660.0, p: [650, 270] }] },
    },
    // 44:47–45:12 (2×): 44:48.5 a cannula through the left incision; 44:50 white particles gather in front of the pupil; the cannula leaves 44:57.5;
    // wisps of white drawn out toward the left (the left incision side). Freeze 45:06
    'ta': {
      src: 'case-pcr', in: 2687.0, out: 2712.0, rate: 2,
      freeze: [{ at: 2706.0, dur: 4 }],
      crop: [{ t: 2687.0, cx: 662, cy: 266, w: 600, rot: 8 }, { t: 2692.0, cx: 717, cy: 268, w: 600, rot: 8 }, { t: 2695.0, cx: 709, cy: 261, w: 600, rot: 8 },
        { t: 2698.0, cx: 709, cy: 253, w: 600, rot: 8 }, { t: 2701.0, cx: 660, cy: 257, w: 600, rot: 8 }, { t: 2704.0, cx: 673, cy: 251, w: 600, rot: 8 },
        { t: 2706.0, cx: 656, cy: 250, w: 600, rot: 8 }, { t: 2710.0, cx: 653, cy: 250, w: 600, rot: 8 }, { t: 2712.0, cx: 649, cy: 252, w: 600, rot: 8 }],
      events: { 'ta-in': 2688.5, 'ta-white': 2690.0, 'ta-out': 2697.5, 'ta-frz': 2706.0 },
      points: { 'clump': [{ t: 2706.0, p: [640, 250] }], 'streak': [{ t: 2706.0, p: [515, 255] }] },
    },
    // 45:13–45:31 (4×): instruments through the main incision clear the white particles; the pupil is clear from 45:29.5
    'ta2': {
      src: 'case-pcr', in: 2713.0, out: 2731.0, rate: 4,
      crop: [{ t: 2713.0, cx: 647, cy: 253, w: 600, rot: 8 }, { t: 2716.0, cx: 641, cy: 265, w: 600, rot: 8 }, { t: 2719.0, cx: 650, cy: 265, w: 600, rot: 8 },
        { t: 2722.0, cx: 653, cy: 250, w: 600, rot: 8 }, { t: 2725.0, cx: 639, cy: 267, w: 600, rot: 8 }, { t: 2728.0, cx: 657, cy: 250, w: 600, rot: 8 },
        { t: 2731.0, cx: 658, cy: 253, w: 600, rot: 8 }],
      events: { 'ta2-in': 2713.0, 'clear': 2729.5 },
    },
  },
};
if (typeof module !== 'undefined') module.exports = FOOTAGE_DEF;
