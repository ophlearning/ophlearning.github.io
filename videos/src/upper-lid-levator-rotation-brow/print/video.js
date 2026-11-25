// Printable OR-wall sheets of this video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files (checklist.js, steps.js, anatomy.js) draw. States, windows and the drawing helper ROT (the coronal lid-crease
// approach) are copied from anim/draw.js with the same names, so every figure is a state the video shows.
// 2026-11-23 remade in place for another case (the 2026-11-06 version is in git history): OS upper lid, second operation, lid-crease
// marginal rotation ± levator advancement (decided on the intra-operative height); no brow fixation, no intra-operative epilation.
// The figures are the right eye (OD).
PRINT.video({
  id: 'upper-lid-levator-rotation-brow',
  title: '上眼瞼三合一：marginal rotation＋levator resection＋internal brow fixation',
  surgery: ['上眼瞼 marginal rotation', '± levator advancement（依術中高度）；二次手術；brow fixation 這次不做', '右眼 OD 示意圖；本台 OS，左右相反'],
  steps: 7,                                                  // checklist items (this case: 術前 2、rotation 2、高度與 levator 2、收尾 1)
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const PRE = { mrd1: LRP.mrdPre };
    const ROT0 = { ...PRE, curl: MRP.entr, creaseH: LRP.incH[1] };
    const ROTD = { ...ROT0, crease: 1, flap: 0, cut: 1, suture: 1, buried: true, curl: MRP.after };   // 2-3 end: tied, margin turned out
    const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 }, OPEN = { ...EXC, septOpen: 1, fatUp: 1 }, RES = { ...OPEN, dis: 1, resect: 1 };
    const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
    // windows for the step figures (model mm)
    const WIN = { rotSag: { x: -21.5, y: -10.4, w: 14, h: 13.5 }, lidSag: { x: -21, y: -9.2, w: 14, h: 13.5 }, sagLid: { x: -22.5, y: -19.5, w: 22 },
      rotCor: { x: -12.5, y: -15, w: 23 }, corLid: { x: -14, y: -16.5, w: 27 } };
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
    return { PRE, ROT0, ROTD, EXC, OPEN, RES, ADV, WIN, ROT, creaseInc, tarsotomy, levAt };
  },
});
