// Orbit view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the eyelid views only; these follow the same
// camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }) for the orbit model
// (videos/models/orbit: views oax, ofront). Kept in this video folder so kit.js stays unchanged.
//   VO.ax(state, W, H, win, id)   axial orbit section, seen from below like CT (ORBIT.axial)
//   VO.fr(state, W, H, win, id)   lateral canthus from the front, optional tendon window (ORBIT.front)
// The two share x (temporal −): give both panels the same win.x and win.w and their x positions line up.
const VO = (() => {
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  const wrap = (c, r) => ({ svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r });
  const ax = (state, W, H, win, id) => wrap(VIEWS.cam(win, W, H), ORBIT.axial({ state, id }));
  const fr = (state, W, H, win, id) => wrap(VIEWS.cam(win, W, H), ORBIT.front({ state, lower: state.lower || {}, id }));
  return { ax, fr };
})();
if (typeof module !== 'undefined') module.exports = VO;
