// Printable OR-wall sheets for the 2026-11-24 OU case: levator resection only (no internal brow fixation). No video of its own yet: the
// figures, states and numbers come from the published video levator-resection-brow-fixation (scripts and ledger loaded from that folder;
// print/sources.json makes this a series-style folder so its check.js ledger is read with keys 「levator-resection-brow-fixation <segment>」).
// States and windows are copied from that video's print/video.js with the same names; the figures are the right eye (OD).
PRINT.video({
  id: 'levator-resection-brow-fixation',                    // the website video that teaches this levator resection (its chapters 1–4)
  title: '上眼瞼 levator resection（影片另含 brow fixation）',
  surgery: ['OU 上眼瞼 levator resection', 'lid crease 前路；這台不做眉毛固定', '圖為右眼 OD 示意'],
  steps: 7,
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],
  scripts: ['../levator-resection-brow-fixation/anim/segments.js', '../levator-resection-brow-fixation/anim/params.js'],
  setup() {
    const PRE = { mrd1: LRP.mrdPre };
    const MARK = { ...PRE, ...INC, excMark: 1 };              // 3-1 end
    const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
    const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
    const RES = { ...OPEN, dis: 1, resect: 1 };
    const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
    const LAC_WIN = { poly: [[-19.2, -16.0], [-10.8, -16.0], [-10.8, -11.4], [-19.2, -11.4]], depth: 3 };   // lateral window: lacrimal gland (示意)
    const levAt = V => V.P(V.r.LV.off(V.r.LV.near([1, -17.6]), 0.5));
    const K = s => s.split('；').map(x => 'levator-resection-brow-fixation ' + x).join('；');   // ledger key of the source video
    // windows for the step figures (model mm)
    const WIN = { sagLid: { x: -22.5, y: -19.5, w: 22 }, sagFx: { x: -21, y: -15, w: 22 }, sagOpen: { x: -24.5, y: -19.5, w: 22 },
      corLid: { x: -14, y: -16.5, w: 27 }, corLat: { x: -24, y: -21, w: 28 }, corMark: { x: -9.5, y: -13.5, w: 22 }, corFace: { x: -21, y: -29.5, w: 41 } };
    return { PRE, MARK, EXC, OPEN, RES, ADV, LAC_WIN, levAt, K, WIN };
  },
});
