// Printable OR-wall sheets of this video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files (checklist.js, steps.js, anatomy.js) draw. States, windows and the two drawing helpers (ROT: the coronal lid-crease
// approach; EPI: the upper-lid margin zoom) are copied from anim/draw.js with the same names, so every figure is a state the video shows.
PRINT.video({
  id: 'upper-lid-levator-rotation-brow',
  title: '上眼瞼三合一：marginal rotation＋levator resection＋internal brow fixation',
  surgery: ['上眼瞼三合一', 'marginal rotation＋levator resection＋internal brow fixation', '同一個 lid crease 切口；再加 electric epilation　右眼 OD 示意圖'],
  steps: 8,                                                  // segment 7: 跟刀時看這八件事
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const PRE = { mrd1: LRP.mrdPre };
    const ROT0 = { ...PRE, curl: MRP.entr, creaseH: LRP.incH[1] };
    const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 }, OPEN = { ...EXC, septOpen: 1, fatUp: 1 }, RES = { ...OPEN, dis: 1, resect: 1 };
    const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
    const BROW = { ...ADV, browSut: 1, browTie: 1 };          // 3-2 after the tie (brow back to 0, plane no longer highlighted)
    const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };
    const MIS_X = [-3.2, -1.2];
    const mixP = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    // windows for the step figures (model mm)
    const WIN = { rotSag: { x: -21.5, y: -10.4, w: 14, h: 13.5 }, lidSag: { x: -21, y: -9.2, w: 14, h: 13.5 }, sagLid: { x: -22.5, y: -19.5, w: 22 }, sagBrow: { x: -27.5, y: -31.5, w: 36 },
      rotCor: { x: -12.5, y: -15, w: 23 }, corLid: { x: -14, y: -16.5, w: 27 }, corFace: { x: -21, y: -29.5, w: 41 }, czWin: { x: -8.6, y: -9.6, w: 12.5 } };
    // the coronal lid-crease approach (draw.js ROT): incision = levator lower line carried with the in-turned lash line; flap window;
    // tarsotomy at the sagittal height of the cut (the coronal cutY profile scaled to it)
    const ROT = (() => {
      const XS = []; for (let x = -12.4; x <= 9.8 + 1e-9; x += 0.2) XS.push(+x.toFixed(2));
      const fns = st => { const c = CORONAL.draw({ variant: 'asian', state: { ...st, excMark: 1e-6 } }); return { inc: x => c.excLoY(x) + c.rollY(x), lash: x => c.lashY(x) + c.rollY(x), cutY: c.cutY, Uy: c.Uy }; };
      const cutH = m => (d => d.at(LID.S_CUT, 0)[1] - d.at(0, 0)[1])(LID.draw({ state: { mrd1: m } }).DP);
      function cor(st, flap) { const s = { ...INC, ...st }, f = fns(s), k = cutH(s.mrd1) / (f.cutY(0) - f.Uy(0));
        return { state: s, f, tarsoY: x => f.Uy(x) + (f.cutY(x) - f.Uy(x)) * k,
          windows: flap ? [{ poly: [...XS.map(x => [x, f.inc(x)]), ...XS.slice().reverse().map(x => [x, f.lash(x) - 0.35])], depth: 1 }] : [] }; }
      // the reflected skin–muscle flap, drawn light like the tissue
      const flapSvg = (V, f) => { const top = x => f.lash(x) - 0.35, bot = x => top(x) + 1.6;
        return `<g opacity="0.5"><path d="${PRINT.pth([...XS.map(x => V.P([x, top(x)])), ...XS.slice().reverse().map(x => V.P([x, bot(x)]))])}Z" fill="#e9b89c" stroke="#b07a5e" stroke-width="0.3"/></g>`; };
      return { XS, cor, flapSvg };
    })();
    // sagittal rotation overlays (the model's red is hidden and redrawn by meaning): crease skin incision dashed, tarsotomy solid
    const creaseInc = V => { const a = V.M.creaseSkin, c = V.M.creaseCut; return [V.P(a), V.P([a[0] + (c[0] - a[0]) / 0.35, a[1] + (c[1] - a[1]) / 0.35])]; };
    const tarsotomy = V => [V.P(V.r.DP.at(LID.S_CUT, 0)), V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR))];
    const levAt = V => V.P(V.r.LV.off(V.r.LV.near([1, -17.6]), 0.5));
    // the upper-lid margin zoom (draw.js EPI): the treated lash borrows the follicle of the first lash in this plane (示意)
    const EPI = (() => {
      const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));
      const ZST = { mrd1: LRP.mrdPost, misdirected: 1 }, r = LID.draw({ state: ZST });
      const E = r.DA.at(marginS(1.70), 1.70), B = r.DA.at(2.05, 1.56), L = Math.hypot(B[0] - E[0], B[1] - E[1]), d = [(B[0] - E[0]) / L, (B[1] - E[1]) / L];
      const needle = (a, b) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#fff" stroke-width="0.7" stroke-linecap="round"/>`;
      const coag = (c, rr) => `<circle cx="${c[0]}" cy="${c[1]}" r="${rr}" fill="#bbb" fill-opacity="0.45" stroke="#000" stroke-width="0.3"/>`;
      return { ZST, F: { E, B, d, L }, win: (w, h) => ({ x: E[0] - 2.2, y: E[1] - 2.6, w, h }), needle, coag };
    })();
    return { PRE, ROT0, EXC, OPEN, RES, ADV, BROW, NERVE_WIN, MIS_X, mixP, WIN, ROT, creaseInc, tarsotomy, levAt, EPI };
  },
});
