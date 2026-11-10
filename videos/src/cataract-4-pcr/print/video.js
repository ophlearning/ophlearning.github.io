// Printable OR-wall sheets of video ④ (videos/tools/print, README there): which video, which model files, and the states the sheet data
// files (checklist.js, steps.js, anatomy.js) draw. States and helpers are copied from anim/draw.js with the same names (MAIN, SIDE, CCC,
// BASE, cat, RENT, PIECE, frag, onTop, REST, PHC, CHOP, NORM, pcrSt, OC, OVDCAN, FIRST, WITH, FLOAT, phacoAt, spatAt, FLT, CLEAN, BAGC, PV,
// CUT, IRR, VIT, P0, PPT, PPS, BAGIOL, SUL1, SUL3, CAPT, under, IA, P_RIM5), so every figure is a state the video shows on the model; the case
// parameters (LEFT eye OS, surgeon at 12, main incision 11 o'clock, side port 2 o'clock, rent toward 5 o'clock) come from anim/params.js
// (CASE) like in the video. The sheets are the PCR drill the video teaches on the model (2-1, 2-5, 3-1, 3-4, 3-5, 4-1, 5-2, 6-1), not case
// B's footage; rent, gel, piece and OVD shapes and amounts are 示意 as in the video.
PRINT.video({
  id: 'cataract-4-pcr',
  title: '白內障 ④：後囊破裂（PCR）——認出與第一步',
  surgery: ['白內障 ④　後囊破裂 PCR', '認出 → 第一步 → 評估 → 玻璃體 → IOL', '左眼 OS、術者坐 12 點　模型示意圖'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const K = CATARACT, G = GLOBE, L0 = K.LENS, CN = K.CN, lerp = (a, b, k) => a + (b - a) * k;
    // ---- states (anim/draw.js, same names)
    const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 }, HP = CASE.HP;     // 11–5 section: left = 11 o'clock (main incision)
    const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
    const BASE = { main: MAIN, side: SIDE, ccc: CCC };
    const cat = x => ({ eye: CASE.eye, cat: Object.assign({}, BASE, x) });
    const RENT = CASE.rent, PIECE = CASE.piece;
    const frag = st => K.pcrOf(st).FR;
    const onTop = (FR, a, b) => { let n = 0; while (FR.fld(FR.at3(a, b, n)) < 0 && n < 2) n += 0.005; const q = FR.at3(a, b, n); return [q[0], q[1], q[2] + 0.47]; };
    const REST = cat({ bag: {}, pcr: { rent: RENT, frag: PIECE } }), PHC = { kind: 'phaco', p: onTop(frag(REST), 0.4, 0.1), bevel: 'up' };
    const CHOP = { kind: 'chopper', via: 'side', p: onTop(frag(REST), -1.4, 1.2) };
    const NORM = cat({ bag: {}, pcr: { frag: PIECE }, inst: [PHC] });
    const pcrSt = (o = {}) => cat({ bag: {}, pcr: { rent: RENT, deep: o.deep ?? 1, vit: o.vit || { bulge: 1 }, frag: { ...PIECE, sink: o.sink ?? 1 } }, inst: o.inst || [PHC] });
    const REC = pcrSt();
    const OC = (() => { const P = K.pcrOf(REC), R0 = K.pcrOf(REST); return [P.R.c3[0] * 0.6, P.R.c3[1] * 0.6, R0.zRim3 - 0.6]; })();
    const OVDCAN = { kind: 'cannula', via: 'side', p: OC };
    const FIRST = (k, o = {}) => cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 1 }, ovdD: { tamp: k }, frag: { ...PIECE, sink: 1 } }, inst: o.inst || [PHC, OVDCAN] });
    const WITH = k => cat({ bag: {}, pcr: { rent: { ...RENT, ext: 0.6 * k }, collapse: k, frag: { ...PIECE, sink: 1 } } });
    const FLOAT = (fl, eat) => cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: 1, coat: fl, fill: fl * (CN.pcr.frag.cushion + 0.25) }, frag: { h: 5, float: fl, eat } } });
    const phacoAt = st => { const F = frag(st); return { kind: 'phaco', p: F.at3(0, F.bE - 0.42, -0.6), bevel: 'down', occl: 1 }; };
    const spatAt = st => { const F = frag(st); return { kind: 'spatula', via: 'side', p: F.at3(0.3, (F.bE + CN.pcr.frag.rb) / 2, -CN.pcr.frag.rn - 0.55) }; };
    const FLT = (eat = 0.25) => { const s0 = FLOAT(1, eat); return cat({ ...s0.cat, inst: [phacoAt(s0), spatAt(s0)] }); };
    const CLEAN = { cortex: new Array(12).fill(0), sub: 0 }, BAGC = { ...CLEAN, collapse: 1 };
    const PV = K.pcrOf(cat({ bag: BAGC, pcr: { rent: RENT } })), CUT = { kind: 'vitrector', p: [PV.R.c3[0], PV.R.c3[1], PV.R.c3[2] - 0.25], port: 'up' };
    const IRR = { kind: 'irrig', via: 'side', p: (() => { const d = G.clockDir(CASE.side.h); return [d[0] * 3.0, d[1] * 3.0, 9.9]; })() };
    const VIT = (cut, ta = 0, inst = [CUT, IRR], to = 'main') => cat({ bag: BAGC, pcr: { rent: RENT, vit: { prolapse: 1, to, cut, ta } }, inst });
    const P0 = K.pcrOf(cat({ bag: {}, pcr: { rent: RENT } })), PPT = [P0.R.c3[0], P0.R.c3[1], P0.zHy3(P0.R.c0[0], P0.R.c0[1]) - 2.4];
    const PPS = cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 0.55, to: 'main', cut: 0.2, ta: 1 }, pp: { h: CASE.main.h, s: CN.pcr.pp.s } }, inst: [{ kind: 'vitrector', via: 'pp', p: PPT, port: 'up' }, IRR] });
    const BAGIOL = cat({ bag: BAGC, ovdBag: 1, ovdOut: { behind: 1, front: 1 }, pcr: { rent: { ...RENT, size: 0.6 } }, iol: { rot: -35 } });
    const SUL1 = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', rot: -35, chafe: 1 } });
    const SUL3 = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', kind: '3pc', rot: -35, chafe: 1 } });
    const CAPT = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', kind: '3pc', capture: 1, rot: -35, chafe: 1 } });
    const under = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L0.zAnt(r) - dep]; };
    const IA = (p, o = {}) => ({ kind: 'ia', p, port: o.port || 'up', occl: o.occl || 0 });
    const P_RIM5 = under(HP, 3.0, 0.55);
    // ---- print helpers (as ②'s print/video.js)
    // a 3D point (examiner X, Y, z) in a view of either kind, figure mm: section → its plane, scope → the microscope map
    const P3 = (V, p) => V.P(V.r.pl ? G.toPlane(V.r.pl, p) : V.r.M(p));
    // the instruments of a state promoted over the light tissue: grey rods with a black rim (the model's own geometry, projected like the model)
    const tool = st => V => { const c = K.norm(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
      return (c.inst || []).map(i => { const g = K.instGeom(c, i); return g.segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join(''); }).join(''); };
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    const arw = (a, b) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w: 0.6, head: 1.8 });
    // a 「中文 English」 label at an explicit place of a figure: side 'L' (text from the left edge) or 'R' (text ends at the right edge),
    // y = baseline (figure mm), a = anchor ('name' | [model mm] | V => figure mm)
    const lb = (zh, en, side, y, a, o = {}) => V => { const q = typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a); return q ? PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, q, { side, ...o }) : ''; };
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    return { K, G, L0, CN, lerp, MAIN, SIDE, HP, CCC, BASE, cat, RENT, PIECE, frag, onTop, REST, PHC, CHOP, NORM, pcrSt, REC, OC, OVDCAN, FIRST, WITH, FLOAT,
      phacoAt, spatAt, FLT, CLEAN, BAGC, PV, CUT, IRR, VIT, P0, PPT, PPS, BAGIOL, SUL1, SUL3, CAPT, under, IA, P_RIM5, P3, tool, thin, arw, lb, all };
  },
});
