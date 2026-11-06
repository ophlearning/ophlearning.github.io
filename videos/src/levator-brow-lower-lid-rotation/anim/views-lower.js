// ============================================================================
// Lower-lid views for this video (the kit's VIEWS in videos/tools/video-kit/kit.js wraps only the upper-lid views). Same contract as
// VIEWS.sag / VIEWS.cor: win = { x, y, w } (mm, top-left and width); returns svg, panel anchors A, raw mm anchors M, P([x, y]) → px, k, r.
// Model: videos/models/eyelid (lower.js, lower-coronal.js). The id must be unique per panel (clip / mask names are prefixed with it).
//   VL.lsag(lower, upper, W, H, win, id)   lower-lid sagittal section (LOWER.draw; the upper lid drawn by LID.draw with `upper`)
//   VL.lcor(upper, lower, W, H, win, id, { windows })   coronal (skin side) with the lower lid (CORONAL.draw({ state: upper, lower }))
//   VL.upper(upper, P)   upper-lid anchors (margin, lash line) in a lower-lid sagittal panel
// ============================================================================
const VL = (() => {
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  function lsag(lower, upper, W, H, win, id) {
    const c = VIEWS.cam(win, W, H), r = LOWER.draw({ variant: 'asian', state: lower, upper, id });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r };
  }
  function lcor(upper, lower, W, H, win, id, opt = {}) {
    const c = VIEWS.cam(win, W, H), r = CORONAL.draw({ variant: 'asian', state: upper, lower, id, windows: opt.windows || [], section: false });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r };
  }
  const upper = (st, P) => { const K = LID.keyPoints(st || {}, 'asian'); return { margin: P(K.margin), lash: P(K.lash) }; };
  return { lsag, lcor, upper };
})();
if (typeof module !== 'undefined') module.exports = VL;
