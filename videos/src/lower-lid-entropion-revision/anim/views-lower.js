// Lower-lid view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the upper-lid views only; these follow the
// same camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return}) for the lower-lid
// views of videos/models/eyelid (views.js there: lsag, lcor, axial). Kept in this video folder so kit.js stays unchanged.
//   VL.lsag(state, W, H, win, id, { upper })      lower-lid sagittal section (LOWER.draw; upper = upper-lid state, default {})
//   VL.lcor(state, W, H, win, id, { windows })    coronal, skin side, with the lower lid (CORONAL.draw({ lower: state }))
//   VL.axial(state, W, H, win, id)                horizontal section at the canthal level, seen from below like CT (CANTHUS.draw)
// The coronal and axial views share x (temporal −): give both panels the same win.x and win.w and their x positions line up.
const VL = (() => {
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  const wrap = (c, r) => ({ svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r });
  const lsag = (state, W, H, win, id, opt = {}) => wrap(VIEWS.cam(win, W, H), LOWER.draw({ variant: 'asian', state, upper: opt.upper ?? {}, id }));
  const lcor = (state, W, H, win, id, opt = {}) => wrap(VIEWS.cam(win, W, H), CORONAL.draw({ variant: 'asian', state: opt.upper || {}, lower: state, id, windows: opt.windows || [], section: false }));
  const axial = (state, W, H, win, id) => wrap(VIEWS.cam(win, W, H), CANTHUS.draw({ state, id }));
  return { lsag, lcor, axial };
})();
if (typeof module !== 'undefined') module.exports = VL;
