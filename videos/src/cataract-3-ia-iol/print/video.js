// Printable OR-wall sheets of video ③ (videos/tools/print, README there): which video, which model files, and the states the sheet data
// files (checklist.js, steps.js, anatomy.js) draw. States, instrument positions and windows are copied from anim/draw.js with the same names
// (MAIN, SIDE, HP, CCC, BASE, FULL, CLEAN, under, IA, P_RIM6, P_C12, BIM, IRR, OVDB, S1, S3o, HOOK, S3, FIN, CAUGHT, P_O1), so every figure is a
// state the video shows on the model; the case parameters (incisions, rhexis, bimanual reach) come from anim/params.js (CASE) like in the video.
// The sheets show the routine steps the video demonstrates on the model (1-2, 2-2, 3-1, 4-1, 4-2, 5-1, 5-3), not case A's footage: case A used
// one angled coaxial tip through the main incision for all of the I/A, had a capsular tension ring and a sutured incision (zonular weakness).
PRINT.video({
  id: 'cataract-3-ia-iol',
  title: '白內障 ③：I/A、IOL 植入與收尾',
  surgery: ['白內障 ③　I/A、放 IOL 與收尾', 'I/A → 撐開囊袋 → IOL → 清 OVD → 密閉', '右眼 OD、術者坐 12 點　模型示意圖'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const K = CATARACT, G = GLOBE, L0 = K.LENS, CN = K.CN, lerp = (a, b, k) => a + (b - a) * k;
    // case states (draw.js)
    const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 }, HP = (CASE.main.h + 6) % 12;   // 12–6 section through the main incision: left = main incision
    const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
    const BASE = { main: MAIN, side: SIDE, ccc: CCC };
    const FULL = () => new Array(12).fill(1), CLEAN = { cortex: new Array(12).fill(0), sub: 0 };
    const under = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L0.zAnt(r) - dep]; };
    const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    const IA = (p, o = {}) => ({ kind: 'ia', p, port: o.port || 'up', occl: o.occl || 0 });
    const P_RIM6 = under(HP, 3.0, 0.55), P_C12 = under(HP, 1.2, 0.5);
    // bimanual I/A (2-2): aspirator through the side port under the subincisional rim, irrigation through the main incision (Colvard 1997 technique)
    const BM = CASE.bimanual, BIM = (() => { const d = G.clockDir(CASE.main.h), l = G.clockDir(CASE.main.h + 3), a = BM.az * Math.PI / 180, e = BM.el * Math.PI / 180,
      hd = [d[0] * Math.cos(a) + l[0] * Math.sin(a), d[1] * Math.cos(a) + l[1] * Math.sin(a)];
      return { kind: 'iaAsp', via: 'side', p: under(CASE.main.h, BM.r, BM.dep), tipDir: [hd[0] * Math.cos(e), hd[1] * Math.cos(e), -Math.sin(e)], port: 'up', occl: 1 }; })();
    const IRR = (() => { const d = G.clockDir(CASE.main.h), q = G.clockDir(CASE.main.h + 3); return { kind: 'iaIrr', p: [2.4 * d[0] + 2.2 * q[0], 2.4 * d[1] + 2.2 * q[1], 10.2] }; })();
    // the posterior capsule caught in a port turned down (3-1, 動畫示意)
    const CAUGHT = (k, port = 'down') => ({ cat: { ...BASE, bag: { ...CLEAN, caught: k }, inst: [IA(under(HP, 3.8, 0.9), { port, occl: 1 })] } });
    // IOL (4-2): 1 the leading haptic in the bag (out 0.3), 3 the trailing haptic outside the bag, a hook through the side port pressing it in
    const INJ = (() => { const d = G.clockDir(CASE.main.h); return { kind: 'injector', p: [3.5 * d[0], 3.5 * d[1], 10.6] }; })();
    const OVDB = { bag: CLEAN, ovdBag: 1, ovd: 1 };
    const S1 = { cat: { ...BASE, ...OVDB, inst: [INJ], iol: { out: 0.3, unfold: 0.15, lead: 1, trail: 0 } } };
    const S3o = { cat: { ...BASE, ...OVDB, iol: { out: 1, unfold: 1, lead: 1, trail: 0 } } };
    const HOOK = (() => { const R = K.iolOf(K.norm(S3o)).roots[1]; return { kind: 'chopper', via: 'side', p: [R[0] + 0.3, R[1], R[2] + 0.3] }; })();
    const S3 = k => ({ cat: { ...BASE, ...OVDB, iol: { out: 1, unfold: 1, lead: 1, trail: k }, inst: k < 1 ? [HOOK] : [] } });
    // the IOL in the bag (4-4, 4-5, 5-1): OVD behind / in front removed 0→1, the bag closing on the optic
    const FIN = o => ({ cat: { ...BASE, bag: { ...CLEAN, collapse: o.collapse ?? 1 }, ovdBag: 1, ovdOut: { behind: o.behind ?? 1, front: o.front ?? 1 }, ovd: o.ovd ?? 0, iol: { rot: CASE.iolRot, ...(o.iol || {}) }, inst: o.inst || [] } });
    const P_O1 = under(HP, 2.0, 0.6);   // I/A over the optic (OVD removal)
    // a 3D point (examiner X, Y, z) in a view of either kind, figure mm: section → its plane, scope → the microscope map
    const P3 = (V, p) => V.P(V.r.pl ? G.toPlane(V.r.pl, p) : V.r.M(p));
    const capP = (V, st, r, h, dz = 0) => P3(V, K.capPt(K.norm(st), r, h, dz));
    const postP = (V, r, h) => { const d = G.clockDir(h); return P3(V, [r * d[0], r * d[1], L0.zPost(r)]); };
    const portP = st => V => { const c = K.norm(st); return P3(V, K.instGeom(c, c.inst[0]).port); };
    const shaftP = (st, i, d) => V => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]); return P3(V, [g.tip[0] + g.axis[0] * d, g.tip[1] + g.axis[1] * d, g.tip[2] + g.axis[2] * d]); };
    // the instruments of a state promoted over the light tissue: grey rods with a black rim (the model's own geometry, projected like the model)
    const tool = st => V => { const c = K.norm(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
      return (c.inst || []).map(i => { const g = K.instGeom(c, i); return g.segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join(''); }).join(''); };
    // the port of the I/A: a black dot on the rod (where the model puts it)
    const port = st => V => { const p = portP(st)(V); return `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="0.55" fill="#000" stroke="#fff" stroke-width="0.25"/>`; };
    // thin dashed path; an arrow with a white halo
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    const arw = (a, b) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w: 0.6, head: 1.8 });
    // a 「中文 English」 label at an explicit place of a figure: side 'L' (text from the left edge) or 'R' (text ends at the right edge),
    // y = baseline (figure mm, or V => mm), a = anchor ('name' | [model mm] | V => figure mm)
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, typeof y === 'function' ? y(V) : y, typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a), { side, ...o });
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    return { K, G, L0, CN, lerp, MAIN, SIDE, HP, CCC, BASE, FULL, CLEAN, under, mix3, IA, P_RIM6, P_C12, BIM, IRR, CAUGHT, INJ, OVDB, S1, S3o, HOOK, S3, FIN, P_O1,
      P3, capP, postP, portP, shaftP, tool, port, thin, arw, lb, all };
  },
});
