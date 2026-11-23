// Printable OR-wall sheets (videos/tools/print, README there) for the 2026-11-23 OS case: modified Bick (full-thickness wedge at the lateral
// canthus, tarsal end reattached at the canthus), no adjunct. No video yet: the states and windows below follow
// ../../lower-lid-entropion-revision/anim/draw.js (same model views: lower-lid sagittal, coronal skin side, axial at the canthal level).
// The figures are the right eye (OD). The wedge (its place and width), the excised length and the fixation are schematic (示意); the
// model has no wedge, so steps.js / anatomy.js draw it as an overlay (WEDGE, axCut).
PRINT.video({
  id: 'lower-lid-modified-bick',
  title: '下眼瞼 modified Bick',
  surgery: ['OS 下眼瞼 modified Bick', 'Involutional entropion（horizontal laxity、trichiasis）；附加：無', '右眼 OD 示意圖；本台 OS，左右相反'],
  steps: 8,
  models: ['eyelid/lid.js', 'eyelid/coronal.js', 'eyelid/lower.js', 'eyelid/lower-coronal.js', 'eyelid/canthus.js'],
  scripts: ['anim/segments.js'],
  setup() {
    // states (names as in the revision video where the same): PRE = involutional entropion, lashes on the cornea (entr ≥ 0.95, CARD.md)
    const PRE = { entr: 0.95 }, LAX = { lax: 1 }, CUTS = { canthotomy: 1, cantholysis: 1 }, FIXED = { stripFix: 1 };
    // model windows (mm): AXC (axial) and CANTH (coronal) share x, so the canthus, rim and fixation point line up; AX = distraction
    const WIN = { AX: { x: -27, y: -23, w: 34 }, AXC: { x: -24.6, y: -11, w: 16, h: 15 }, CANTH: { x: -24.6, y: -7.5, w: 16, h: 13 },
      COR: { x: -21, y: -5, w: 34, h: 14 }, SAG: { x: -17, y: -3, w: 18, h: 16 } };
    // coronal wedge (示意): base on the lash line between xa (near the canthus) and xb, apex below the tarsus
    const WEDGE = { xa: -14.1, xb: -10.9, below: 1.4 };
    const wedgePts = V => { const r = V.r, xm = (WEDGE.xa + WEDGE.xb) / 2;
      return [V.P([WEDGE.xa, r.lashLY(WEDGE.xa)]), V.P([xm, r.tarBotLY(xm) + WEDGE.below]), V.P([WEDGE.xb, r.lashLY(WEDGE.xb)])]; };
    // axial: a line across the whole lid band (skin to conjunctiva) d mm from the lateral end of the lid (示意)
    const axCut = (V, d) => { const T = LID.track(V.r.lidPts), q = T.L - d, p = T.off(q, 0), n = T.off(q, 1), s = n[1] < p[1] ? 1 : -1;
      return [V.P(T.off(q, -0.25 * s)), V.P(T.off(q, 2.6 * s))]; };
    const axMid = (V, d) => { const T = LID.track(V.r.lidPts), q = T.L - d, p = T.off(q, 0), n = T.off(q, 1), s = n[1] < p[1] ? 1 : -1;
      return V.P(T.off(q, 1.2 * s)); };
    return { PRE, LAX, CUTS, FIXED, WIN, WEDGE, wedgePts, axCut, axMid };
  },
});
