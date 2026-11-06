// Laceration view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the plain eyelid views only; these follow the
// same camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }) for the three views of
// the margin laceration model (videos/models/eyelid/laceration.js; views.js there: mar, lacsag, laccor). Kept here so kit.js stays unchanged.
//   VLAC.margin(state, W, H, win, id)        margin face seen from below (LAC.margin): x = coronal x (temporal −), up = anterior (skin)
//   VLAC.sag(state, W, H, win, id)           wound face = sagittal section through the wound (LID.draw, intact) + suture crossings (LAC.sag)
//                                            S = suture anchors (panel px), MS = the same in mm (the lid's own anchors stay in A / M)
//   VLAC.cor(state, W, H, win, id, opt)      coronal with the laceration (CORONAL.draw, state.lac*) + sutures (LAC.cor); state.lacWin = [x0, x1]
//                                            opens the tarsus window (CORONAL.strip, depth 1); opt.windows = extra windows; S / MS = suture anchors
//   VLAC.lsag(state, W, H, win, id)          lower-lid sagittal section (LOWER.draw), upper lid intact
//   VLAC.lcor(state, W, H, win, id)          coronal with the lower lid (CORONAL.draw({ lower: state }))
// Margin face and coronal share x: give both panels the same win.x and win.w and the same stitch lines up (checked in ../check.js).
const VLAC = (() => {
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A || {})) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  const wrap = (c, r, svg, S) => ({ svg: `<g transform="${c.tf}">${svg}</g>`, A: mapA(r.A, c.P), M: r.A, S: mapA(S, c.P), MS: S || {}, k: c.k, P: c.P, r });
  function margin(state, W, H, win, id) { const c = VIEWS.cam(win, W, H), r = LAC.margin({ state, id }); return wrap(c, r, r.svg); }
  function sag(state, W, H, win, id) { const c = VIEWS.cam(win, W, H), r = LID.draw({ variant: 'asian', state: {}, id }), o = LAC.sag({ state });
    const w = wrap(c, r, r.svg + o.svg, o.A); w.o = o; return w; }
  function cor(state, W, H, win, id, opt = {}) {
    const c = VIEWS.cam(win, W, H), wins = [...(state.lacWin ? [CORONAL.strip(state.lacWin[0], state.lacWin[1], 1)] : []), ...(opt.windows || [])];
    const r = CORONAL.draw({ variant: 'asian', state, id, windows: wins, section: false }), o = LAC.cor(r, { state });
    const w = wrap(c, r, r.svg + o.svg, o.A); w.o = o; return w; }
  const lsag = (state, W, H, win, id) => { const c = VIEWS.cam(win, W, H), r = LOWER.draw({ variant: 'asian', state, upper: {}, id }); return wrap(c, r, r.svg); };
  const lcor = (state, W, H, win, id, opt = {}) => { const c = VIEWS.cam(win, W, H), r = CORONAL.draw({ variant: 'asian', state: {}, lower: state, id, windows: opt.windows || [], section: false }); return wrap(c, r, r.svg); };
  return { margin, sag, cor, lsag, lcor };
})();
if (typeof module !== 'undefined') module.exports = VLAC;
