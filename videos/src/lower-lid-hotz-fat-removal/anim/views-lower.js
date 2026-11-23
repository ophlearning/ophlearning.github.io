// View wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the upper-lid views only; these follow the same
// camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }). Kept in this video
// folder so kit.js stays unchanged (copied from ../../lower-lid-entropion-revision/anim/views-lower.js and ../../lateral-canthotomy-ocs/anim/views-orbit.js).
//   VL.lsag(state, W, H, win, id)              lower-lid sagittal section (LOWER.draw, upper lid unchanged)
//   VL.lcor(state, W, H, win, id, { windows }) coronal, skin side, with the lower lid (CORONAL.draw({ lower: state }))
//   VO.ax(state, W, H, win, id)                axial orbit section, seen from below like CT (ORBIT.axial): retrobulbar haemorrhage
//   VO.fr(state, W, H, win, id)                lateral canthus from the front (ORBIT.front)
// The axial and front orbit views share x (temporal −): give both panels the same win.x and their x positions line up.
const VL = (() => {
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  const wrap = (c, r) => ({ svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r });
  const lsag = (state, W, H, win, id) => wrap(VIEWS.cam(win, W, H), LOWER.draw({ variant: 'asian', state, upper: {}, id }));
  const lcor = (state, W, H, win, id, opt = {}) => wrap(VIEWS.cam(win, W, H), CORONAL.draw({ variant: 'asian', state: {}, lower: state, id, windows: opt.windows || [], section: false }));
  return { lsag, lcor, wrap };
})();
const VO = (() => {
  const ax = (state, W, H, win, id) => VL.wrap(VIEWS.cam(win, W, H), ORBIT.axial({ state, id }));
  const fr = (state, W, H, win, id) => VL.wrap(VIEWS.cam(win, W, H), ORBIT.front({ state, lower: state.lower || {}, id }));
  return { ax, fr };
})();
if (typeof module !== 'undefined') module.exports = { VL, VO };
