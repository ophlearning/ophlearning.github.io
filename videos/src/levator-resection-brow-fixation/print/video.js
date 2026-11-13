// Printable OR-wall sheets of this video (videos/tools/print, README there): which video, which model files, and the states the sheet
// data files (checklist.js, steps.js, anatomy.js) draw. States and windows are copied from anim/draw.js with the same names, so every
// figure is a state the video shows. Made 2026-11-13 for an OU case (both upper lids, same template); the figures are the right eye (OD).
PRINT.video({
  id: 'levator-resection-brow-fixation',
  title: '上眼瞼 levator resection＋internal brow fixation',
  surgery: ['OU 上眼瞼兩合一', 'levator resection＋internal brow fixation', '同一個 lid crease 切口；圖為右眼 OD 示意'],
  steps: 8,                                                  // segment 7: 跟刀時看這八件事
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const PRE = { mrd1: LRP.mrdPre };
    const RAISED = { ...PRE, browY: LRP.browRaise };          // title / 1-2: brow held up by the frontalis before the repair
    const MARK = { ...PRE, ...INC, excMark: 1 };              // 3-1 end
    const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
    const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
    const RES = { ...OPEN, dis: 1, resect: 1 };
    const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
    const BROWFIX = { ...ADV, browSut: 1, browTie: 1 };      // after the fixation (the dissection plane is no longer highlighted)
    const LAC_WIN = { poly: [[-19.2, -16.0], [-10.8, -16.0], [-10.8, -11.4], [-19.2, -11.4]], depth: 3 };   // lateral window: lacrimal gland (示意)
    const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };          // nasal window: supraorbital notch and nerve (示意)
    const mixP = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    const levAt = V => V.P(V.r.LV.off(V.r.LV.near([1, -17.6]), 0.5));
    // windows for the step figures (model mm)
    const WIN = { sagLid: { x: -22.5, y: -19.5, w: 22 }, sagBrow: { x: -27.5, y: -31.5, w: 36 }, sagFx: { x: -21, y: -15, w: 22 }, sagOpen: { x: -24.5, y: -19.5, w: 22 },
      corLid: { x: -14, y: -16.5, w: 27 }, corLat: { x: -24, y: -21, w: 28 }, corMark: { x: -9.5, y: -13.5, w: 22 }, corFace: { x: -21, y: -29.5, w: 41 } };
    return { PRE, RAISED, MARK, EXC, OPEN, RES, ADV, BROWFIX, LAC_WIN, NERVE_WIN, mixP, levAt, WIN };
  },
});
