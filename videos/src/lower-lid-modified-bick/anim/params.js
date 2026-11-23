// Surgical parameters of this video, shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the
// number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (listed in overview-notes.md).
// No department template for this procedure: what the surgeon decides is said as 「依院內常規」 and has no number here.
// The model (videos/models/eyelid) has no Bick wedge: the wedge and the full-thickness cut lines are drawn by draw.js from these values,
// the same wedge as the printed sheets (print/video.js WEDGE).
const BP = {
  wedge: { xa: -14.1, xb: -10.9, below: 1.4 },   // coronal wedge: base on the lash line from x −14.1 (0.9 mm medial to the canthus) to −10.9 (3.2 mm wide), apex 1.4 mm below the tarsus: 示意 (as the sheets)
  distractSig: [6, 8],            // distraction over 6–8 mm is significant: Pushker 2025
  distractEnt: [7.5, 11],         // 80 patients with unilateral entropion measured 7.5–11 mm: Beigi 2008 (the model's lax lid distracts 9 mm)
  tubercleMm: 1.5,                // Whitnall tubercle 1.5 mm behind the rim: Gioia 1987
  pre: { entr: 0.95 },            // involutional entropion, lashes on the cornea (entr ≥ 0.95, eyelid CARD.md): 示意 (degree unknown)
};
// states (axial CANTHUS.draw and coronal CORONAL.draw({ lower }), same names): LAX = horizontal laxity, CUTS = canthotomy + inferior
// cantholysis, FIXED = the tarsal end sutured to the periosteum inside the lateral rim (the model's stripFix: 示意, as the sheets)
const BS = { LAX: { lax: 1 }, CUTS: { canthotomy: 1, cantholysis: 1 }, FIXED: { stripFix: 1 } };
// wedge geometry, shared by both views. Coronal: the triangle (lash line at xa, apex below the tarsus at the middle, lash line at xb).
// Axial: the lid band crossed at the same two x (skin to conjunctiva), found along the projected lower lid.
const WEDGE = {
  cor: (r, w = BP.wedge) => { const xm = (w.xa + w.xb) / 2; return [[w.xa, r.lashLY(w.xa)], [xm, r.tarBotLY(xm) + w.below], [w.xb, r.lashLY(w.xb)]]; },
  // arc position q on the projected lid (LID.track of the axial lidPts) whose x is x
  qAt: (T, x) => { let a = 0, b = T.L; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; (T.off(m, 0)[0] > x) ? a = m : b = m; } return (a + b) / 2; },
  // the cut across the lid band at x: [anterior end beyond the skin, posterior end beyond the conjunctiva] (mm); s = sign toward the front
  axLine: (lidPts, x) => { const T = LID.track(lidPts), q = WEDGE.qAt(T, x), p = T.off(q, 0), n = T.off(q, 1), s = n[1] < p[1] ? 1 : -1;
    return [T.off(q, -0.25 * s), T.off(q, 2.6 * s)]; },
  // the excised piece in the axial view: the band between the two cuts (polygon, mm)
  axPiece: (lidPts, w = BP.wedge) => { const T = LID.track(lidPts), q0 = WEDGE.qAt(T, w.xb), q1 = WEDGE.qAt(T, w.xa), p = T.off(q0, 0), n = T.off(q0, 1), s = n[1] < p[1] ? 1 : -1, A = [], B = [];
    for (let k = 0; k <= 12; k++) { const q = q0 + (q1 - q0) * k / 12; A.push(T.off(q, -0.1 * s)); B.push(T.off(q, 2.45 * s)); } return [...A, ...B.reverse()]; },
};
if (typeof module !== 'undefined') module.exports = { BP, BS, WEDGE };
