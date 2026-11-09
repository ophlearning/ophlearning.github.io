// Printable OR-wall sheets of video ① (videos/tools/print, README there): which video, which model files, and the states the sheet data
// files (checklist.js, steps.js, anatomy.js) draw. States, windows and section planes are copied from anim/draw.js with the same names
// (MAIN, SIDE, HP, HP_SIDE, BASE, cccS, DONE, MIDc, RUN_AT, runC, W_*), so every figure is a state the video shows; the case parameters
// (incision 22° temporal of 12, side port, rhexis start and direction) come from anim/params.js (CASE) like in the video.
PRINT.video({
  id: 'cataract-1-wound-ccc',
  title: '白內障 ①：主切口、side port、OVD 與 CCC',
  surgery: ['白內障 ①　切口、OVD 與 CCC', 'superior clear corneal 主切口＋side port → OVD → CCC', '右眼 OD、術者坐 12 點　模型示意圖'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const K = CATARACT, G = GLOBE, lerp = (a, b, k) => a + (b - a) * k;
    const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
    const HP = (CASE.main.h + 6) % 12, HP_SIDE = (CASE.side.h + 6) % 12;        // section planes: left = main incision / side port
    const BASE = { main: MAIN, side: SIDE, ovd: 1 };
    const cccS = o => ({ ...CASE.ccc, cut: 1, ...o });
    const DONE = { cat: { ...BASE, ccc: cccS({ prog: 1, fold: 1, out: 1 }) } };
    const MIDc = { ...BASE, ccc: cccS({ prog: 0.3, fold: 1 }) };
    const RUN_AT = 0.26, runC = (k, o = {}) => ({ ...BASE, ccc: cccS({ prog: lerp(0.27, 0.42, k), fold: 1, run: 1, runAt: RUN_AT, ...o }) });
    const hAt = t => (((CASE.ccc.h0 + CASE.ccc.dir * t) % 12) + 12) % 12;
    const tAtR = (X, r) => { let a = 12 * RUN_AT, b = 12 * RUN_AT + 2.3; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; X.R(m) < r ? a = m : b = m; } return (a + b) / 2; };
    const dirsAt = h => { const d = G.clockDir(h); return { d: [d[0], d[1], 0], tg: [CASE.ccc.dir * d[1], -CASE.ccc.dir * d[0], 0] }; };
    const add3 = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + (v[2] || 0) * s];
    // model windows (mm): draw.js W_CAT, W_TUN, W_RIM, W_RIM41, W_42, W_62 (the print figures are taller, so heights are given)
    const WIN = { cat: { x: -8.6, y: -14.5, w: 17.2 }, tun: { x: -8.3, y: -13.3, w: 6.2 }, rim: { x: 0.8, y: -10.95, w: 5.6 }, rim41: { x: 1.0, y: -10.75, w: 4.2 },
      eye: { x: -7.2, y: -7.2, w: 14.4, h: 14.4 }, mid: { x: -3.0, y: -2.6, w: 8.6, h: 8.6 }, run: { x: -1.3, y: -1.4, w: 7.0, h: 7.0 } };
    // a 3D point (examiner X, Y, z) in a view of either kind, figure mm: section → its plane, scope → the microscope map
    const P3 = (V, p) => V.P(V.r.pl ? G.toPlane(V.r.pl, p) : V.r.M(p));
    const cap = (V, st, r, h, lift = 0) => P3(V, K.capPt(K.norm(st), r, h, lift));
    // incisions: the tunnel in a section (outer → inner opening), the outer opening (width) in the microscope view
    const tunnel = cfg => V => { const tn = K.tunnelOf(cfg), q = []; for (let k = 0; k <= 40; k++) q.push(P3(V, tn.to3(tn.at(k / 40)))); return q; };
    const mouth = cfg => V => { const ext = K.tunnelOf(cfg).ext, d = G.clockDir(cfg.h), lat = [d[1], -d[0]];
      return [-1, 1].map(sg => P3(V, [ext[0] * d[0] + sg * cfg.w / 2 * lat[0], ext[0] * d[1] + sg * cfg.w / 2 * lat[1], ext[1]])); };
    // the torn edge of the capsulorhexis in the microscope view (t = clock hours travelled), up to tMax
    const edge = (st, tMax) => V => { const c = K.norm(st), X = K.rhex(c.ccc), T1 = Math.min(tMax ?? X.span, X.span), q = [];
      for (let k = 0; k <= 72; k++) { const t = T1 * k / 72; q.push(cap(V, st, X.R(t), hAt(t))); } return q; };
    const circle = (V, r, n = 96) => { const q = []; for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; q.push(V.P(V.r.M([r * Math.sin(a), r * Math.cos(a), 0]))); } return q; };
    // thin dashed path (planned circle, the capsule of a full chamber, a path under the iris)
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    // the instruments of a state promoted over the light tissue: grey rods with a black rim (the model's own geometry, projected like the model)
    const tool = st => V => { const c = K.norm(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
      return (c.inst || []).map(i => { const g = K.instGeom(c, i), s = g.segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join('');
        return s + (g.blade ? rod(P3(V, g.tip), P3(V, add3(g.tip, g.axis, g.blade.L)), 0.5) : ''); }).join(''); };
    // a 「中文 English」 label at an explicit place of a figure: side 'L' (text from the left edge) or 'R' (text ends at the right edge),
    // y = baseline (figure mm), a = anchor ('name' | [model mm] | V => figure mm)
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a), { side, ...o });
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    return { K, G, lerp, MAIN, SIDE, HP, HP_SIDE, BASE, cccS, DONE, MIDc, RUN_AT, runC, hAt, tAtR, dirsAt, add3, WIN, P3, cap, tunnel, mouth, edge, circle, thin, tool, lb, all };
  },
});
