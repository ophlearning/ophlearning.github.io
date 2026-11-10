// Printable OR-wall sheets of video ② (videos/tools/print, README there): which video, which model files, and the states the sheet data
// files (checklist.js, steps.js, anatomy.js) draw. States, windows and section planes are copied from anim/draw.js with the same names
// (MAIN, SIDE, HP, XH, BASE, nucS, DIVIDED, PHACO, CHOP, gPt, crackTools, withTools, CRACKED, GROOVED, OFFX, depFor, hyDemo, QSTATE, X2OFF;
// the view windows are in the sheet files), so every figure is a state the video shows; the case parameters (incision 22° temporal of 12, side port, rhexis, groove along the
// main-incision meridian, injection sites) come from anim/params.js (CASE) like in the video. The sheets show the routine steps the video
// demonstrates on the model (1-1, 1-3, 3-1, 3-3, 4-1, 4-3, 5-1, 6-1), not case A's footage.
PRINT.video({
  id: 'cataract-2-hydro-dc',
  title: '白內障 ②：Hydrodissection 與 divide and conquer',
  surgery: ['白內障 ②　Hydrodissection 與 D&C', 'hydrodissection → 刻槽 → 分核 → 移除核塊', '右眼 OD、術者坐 12 點　模型示意圖'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js', 'globe/fluidics.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const K = CATARACT, G = GLOBE, L0 = K.LENS, lerp = (a, b, k) => a + (b - a) * k;
    const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
    const HP = (CASE.main.h + 6) % 12;                       // 12–6 section through the main incision: left = main incision (11 o'clock-ish)
    const XH = ((CASE.grooveH - 3) % 12 + 12) % 12;          // cross-section across the groove, seen from the incision: right = temporal
    const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
    const BASE = { main: MAIN, side: SIDE, ccc: CCC };
    // nucleus states (draw.js)
    const nucS = o => ({ groove: { h: CASE.grooveH, dep: o.dep ?? CASE.groove.dep, over: o.over || 0 }, ...(o.crack ? { crack: o.crack } : {}), rot: o.rot || 0,
      ...(o.dep2 !== undefined ? { groove2: { dep: o.dep2 } } : {}), ...(o.crack2 ? { crack2: o.crack2 } : {}), quads: o.quads || [] });
    const DIVIDED = q => nucS({ crack: { prog: 1, sep: 0.5 }, dep2: CASE.groove.dep, crack2: { prog: 1, sep: 0.5 }, rot: q.rot, quads: q.quads });
    const gPt = (st, a, b = 0, hz = 0, k = 1) => K.groovePt(st, k, a, b, hz);
    const crackTools = (st, k = 1) => { const N = K.nucOf(K.norm(st)), G0 = k === 2 ? N.g2 : N.g1; return [gPt(st, -1.0, G0.hw - 0.47, 0.45, k), gPt(st, -1.0, -(G0.hw - 0.2), 0.4, k)]; };
    const PHACO = (p, o = {}) => ({ kind: 'phaco', via: 'main', p, bevel: o.bevel || 'up', occl: o.occl || 0 });
    const CHOP = p => ({ kind: 'chopper', via: 'side', p });
    // hydrodissection demonstration (1-1, 1-3): injected opposite the main incision, so the cannula lies in the main-incision section
    const hyDemo = (prog, o = {}) => { const h = o.h ?? CASE.hydroDemo; return { cat: { ...BASE, ovd: 1, hydro: { h, prog, press: o.press || 0, block: o.block || 0 },
      inst: o.noInst ? [] : [{ kind: 'cannula', via: 'main', at: o.at || { h, r: 2.95, lift: -0.03 }, bend: true }] } }; };
    // groove (3-1, 3-3): depth share for a plate of rem mm under the floor, at the cross-section just proximal to the deepest stroke point
    const GROOVED = dep => ({ cat: { ...BASE, nuc: nucS({ dep }) } });
    const OFFX = (() => { const N = K.nucOf(K.norm(GROOVED(CASE.groove.dep))); return N.g1.tipA + 0.15; })();
    const depFor = rem => { let a = 0, b = 1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2, r = K.nucOf(K.norm(GROOVED(m))).g1.remAt(OFFX); r > rem ? a = m : b = m; } return (a + b) / 2; };
    // cracking (4-1): phaco and chopper on opposite walls at the far end of the groove (示意); second groove (4-3): plane 1.6 mm toward the far end
    const CRACKED = (prog, sep = 0) => ({ cat: { ...BASE, nuc: nucS({ dep: CASE.groove.dep, crack: { prog, sep } }) } });
    const withTools = st => { const N = K.nucOf(K.norm(st)), hw = N.g1.hw; return { cat: { ...st.cat, inst: [PHACO(gPt(st, -1.0, hw - 0.47, 0.45)), CHOP(gPt(st, -1.0, -(hw - 0.2), 0.4))] } }; };
    const X2OFF = -1.6;
    // one quadrant pulled to the centre (5-1, 6-1): model q 0 turned to the far side of the main-incision section
    const QSTATE = (pull, eat, o = {}) => { const nuc = DIVIDED({ rot: 135, quads: [{ q: 0, pull, eat }] }), st = { cat: { ...BASE, nuc, surge: o.surge || 0 } };
      return o.noTip ? st : { cat: { ...st.cat, inst: [PHACO(o.tip || K.quadTip(st, 0), { bevel: 'down', occl: 1 })] } }; };
    // a 3D point (examiner X, Y, z) in a view of either kind, figure mm: section → its plane, scope → the microscope map
    const P3 = (V, p) => V.P(V.r.pl ? G.toPlane(V.r.pl, p) : V.r.M(p));
    // the instruments of a state promoted over the light tissue: grey rods with a black rim (the model's own geometry, projected like the model)
    const tool = st => V => { const c = K.norm(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
      return (c.inst || []).map(i => { const g = K.instGeom(c, i); return g.segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join(''); }).join(''); };
    // thin dashed path; an arrow with a white halo; a circular arc arrow round the centre of the microscope view (clock hours h0 → h1, radius r mm)
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    const arw = (a, b) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w: 0.6, head: 1.8 });
    const arc = (V, h0, h1, r) => { const q = []; for (let k = 0; k <= 30; k++) { const d = G.clockDir(lerp(h0, h1, k / 30)); q.push(V.P(V.r.M([d[0] * r, d[1] * r, 0]))); }
      return `<path d="${PRINT.pth(q)}" fill="none" stroke="#fff" stroke-width="1.8"/><path d="${PRINT.pth(q.slice(0, -2))}" fill="none" stroke="#000" stroke-width="0.6"/>` + PRINT.arrow(q[q.length - 3], q[q.length - 1], { w: 0.6, head: 1.8 }); };
    // a 「中文 English」 label at an explicit place of a figure: side 'L' (text from the left edge) or 'R' (text ends at the right edge),
    // y = baseline (figure mm), a = anchor ('name' | [model mm] | V => figure mm)
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a), { side, ...o });
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    return { K, G, L0, lerp, MAIN, SIDE, HP, XH, CCC, BASE, nucS, DIVIDED, gPt, crackTools, PHACO, CHOP, hyDemo, GROOVED, OFFX, depFor, CRACKED, withTools, X2OFF, QSTATE,
      P3, tool, thin, arw, arc, lb, all };
  },
});
