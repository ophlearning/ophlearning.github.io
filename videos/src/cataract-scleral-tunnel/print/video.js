// Printable OR-wall sheets of the scleral-tunnel cataract video (videos/tools/print, README there). Made 2026-11-26 before the video,
// two hours before the surgery (spec.md 進度). The globe model is a right eye; clock hours are the examiner's, so placing the surgeon and
// the main incision at 1:30 draws the OS case at its true place; only the names nasal / temporal differ, and the sheets name them for OS.
PRINT.video({
  id: 'cataract-scleral-tunnel',
  title: '白內障：scleral tunnel 主切口與縫合',
  surgery: ['白內障　scleral tunnel 主切口', 'side port → 結膜切開 → 2.65 mm 鞏膜隧道 → … → 10-0 nylon', '左眼 OS、術者坐 upper-temporal　模型示意圖'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const K = CATARACT, G = GLOBE, L0 = K.LENS, SG = CASE.surgeon, MH = CASE.main.h;
    const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
    const HP = (MH + 6) % 12, HP_SIDE = (CASE.side.h + 6) % 12;      // sections: left = main incision / side port
    const PERI = { peri360: CASE.peri };                              // conjunctiva rolled back (sections only; 示意)
    const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
    const BASE = { main: MAIN, side: SIDE, globe: PERI };
    const CLEAN = { cortex: new Array(12).fill(0), sub: 0 };
    const tnM = K.tunnelOf(MAIN);
    // a wall point (clock h, s mm behind the limbus, d mm deep) as 3D, and any 3D point in a view of either kind (section plane / microscope map)
    const W3 = (s, d = 0, h = MH) => { const f = G.surfAt(s), t = h === MH ? tnM : K.tunnelOf({ ...MAIN, h }); return t.to3([f.rho - f.nr * d, f.z - f.nz * d]); };
    const P3 = (V, p) => V.P(V.r.pl ? G.toPlane(V.r.pl, p) : V.r.M(p));
    const path3 = pts => V => pts.map(p => P3(V, p));
    const wallPath = (sd, h = MH) => { const q = []; for (let k = 1; k < sd.length; k++) for (let j = k === 1 ? 0 : 1; j <= 12; j++) { const t = j / 12;
      q.push(W3(sd[k - 1][0] + (sd[k][0] - sd[k - 1][0]) * t, sd[k - 1][1] + (sd[k][1] - sd[k - 1][1]) * t, h)); } return q; };
    const tunnel = cfg => V => { const tn = K.tunnelOf(cfg), q = []; for (let k = 0; k <= 40; k++) q.push(P3(V, tn.to3(tn.at(k / 40)))); return q; };
    const mouth = cfg => V => { const ext = K.tunnelOf(cfg).ext, d = G.clockDir(cfg.h), lat = [d[1], -d[0]];
      return [-1, 1].map(sg => P3(V, [ext[0] * d[0] + sg * cfg.w / 2 * lat[0], ext[0] * d[1] + sg * cfg.w / 2 * lat[1], ext[1]])); };
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    const tool = st => V => { const c = K.norm(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
      return (c.inst || []).map(i => { const g = K.instGeom(c, i), s = g.segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join('');
        return s + (g.blade ? rod(P3(V, g.tip), P3(V, [g.tip[0] + g.axis[0] * g.blade.L, g.tip[1] + g.axis[1] * g.blade.L, g.tip[2] + g.axis[2] * g.blade.L]), 0.5) : ''); }).join(''); };
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a), { side, ...o });
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    const circle = (V, r, n = 96) => { const q = []; for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; q.push(V.P(V.r.M([r * Math.sin(a), r * Math.cos(a), 0]))); } return q; };
    // microscope-view probe of a state (anchor positions in figure-independent model-screen mm), surgeon at SG
    const probe = (st, id) => K.enface({ st, id, surgeon: SG }).A;
    return { K, G, L0, SG, MH, MAIN, SIDE, HP, HP_SIDE, PERI, CCC, BASE, CLEAN, tnM, W3, P3, path3, wallPath, tunnel, mouth, thin, tool, lb, all, circle, probe };
  },
});
