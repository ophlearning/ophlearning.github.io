// 手術步驟圖: one cell per checklist item. Left = the model's meridional section through the incision (mechanism), right = the surgeon's
// view (microscope, OS, surgeon at upper-temporal ≈ 1:30, the main incision at the bottom), the same state. Cell 5 compares the right
// tunnel with the two wrong ones in two sections. Overlays: incisions thick dashed, wrong tunnels / cut conjunctiva thick solid, suture
// dotted; conjunctival extent, instruments, OVD, nucleus and IOL shapes: 示意.
{
  const S = (o = {}) => ({ cat: o });
  const W_TUN = { x: -8.6, y: -13.3, w: 5.4 }, W_HALF = { x: -8.6, y: -14.6, w: 10.8, h: 9.4 }, W_EYE = { x: -8.2, y: -8.2, w: 16.4, h: 16.4 };
  const Ls = { side: 'L' }, Rs = { side: 'R' };
  const sideW = (s, d = 0) => W3(s, d, CASE.side.h);
  // 1 before the incisions; 2 side port blade in the chamber; 3 conjunctiva opened; 4 keratome through the scleral tunnel into the chamber
  const S1 = S({ globe: {} }), S2 = S({ side: SIDE, inst: [{ kind: 'sideblade', adv: 1.15 }] }), S3 = S({ side: SIDE, globe: PERI });
  const S4 = S({ ...BASE, inst: [{ kind: 'keratome', adv: 1.05 }] }), S5 = S({ side: SIDE, globe: PERI });
  // 6 DuoVisc + finished CCC; 7 groove with the phaco tip (② states); 8 IOL in the bag (③ end state); 9 = 8 with the suture
  const S6 = S({ ...BASE, ovd: 1, ccc: CCC });
  const G7 = S({ ...BASE, ccc: CCC, nuc: { groove: { h: MH, dep: 0.9, over: 0 }, rot: 0, quads: [] } });
  const hw7 = K.nucOf(K.norm(G7)).g1.hw, P7 = K.groovePt(G7, 1, -1.0, hw7 - 0.47, 0.45);
  const S7 = S({ ...G7.cat, inst: [{ kind: 'phaco', via: 'main', p: P7, bevel: 'up', occl: 0 }] });
  const S8 = S({ ...BASE, ccc: CCC, bag: { ...CLEAN, collapse: 1 }, ovdBag: 1, ovdOut: { behind: 1, front: 1 }, ovd: 0, iol: { rot: -50 } });
  // the wrong tunnels (wall coordinates s, d at the main incision's hour): too shallow — the roof comes out through the surface (buttonhole);
  // too deep / turned down too early — the inner opening at the limbus, over the iris root (premature entry)
  const SHALLOW = wallPath([[1.5, 0], [1.42, 0.14], [1.05, 0.1], [0.75, 0]]), EARLY = { ...MAIN, L: 1.2 };
  const SUT = wallPath([[2.15, 0], [1.5, 0.3], [0.85, 0]]);
  const e4 = probe(S4, 'p4'), c4 = [(e4.mainExt[0] + e4.mainInt[0]) / 2, (e4.mainExt[1] + e4.mainInt[1]) / 2];
  const W_MOUTH = { x: c4[0] - 3.6, y: c4[1] - 3.6, w: 7.2, h: 7.2 };
  const limbArc = (s, h0, h1) => { const q = []; for (let k = 0; k <= 30; k++) q.push(W3(s, 0, h0 + (h1 - h0) * k / 30)); return q; };
  const periCut = limbArc(0.25, MH - 0.75, MH + 0.75), periBack = [W3(0.25, 0, MH - 0.75), ...limbArc(3.0, MH - 0.75, MH + 0.75), W3(0.25, 0, MH + 0.75)];
  const mid3 = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝模型的切面（機轉）　右＝術者視角（顯微鏡），同一個狀態',
    sources: ['Goel 2022', 'Ernest 1994', 'Subudhi 2021', 'Hollick 1999', 'Azar 1997'], grid: [3, 3],
    ledger: { '360': '結構' },
    legend: { rows: ['inc', 'cut', 'sut'], orient: [
      '<b>左 切面</b>（經切口的子午切面）：上＝前、左＝切口', '<b>右 術者視角</b>：左眼 OS、術者坐 upper-temporal（約 1–2 點）：下＝主切口',
      '粗黑實線＝剪開的結膜、錯誤的隧道；細虛線＝正確的隧道、結膜掀開的範圍', '結膜範圍、器械、OVD、核、IOL 的形狀：示意；side port 位置、縫幾針：依主刀'] },
    steps: [
      { hd: '核對：OS、坐 upper-temporal', views: [
        { kind: 'csec', hp: HP, state: S1, win: W_TUN, labelOpts: { sides: true },
          draw: all(lb('角膜', '', 'R', 8, V => P3(V, W3(-1.8, 0.3))), lb('角膜緣', 'limbus', 'R', 30, V => P3(V, W3(0))),
            lb('結膜', 'conjunctiva', 'L', 13, V => P3(V, W3(1.1, -0.13))), lb('鞏膜', 'sclera', 'L', 36, V => P3(V, W3(2.6, 0.3)))) },
        { kind: 'cscope', surgeon: SG, state: S1, win: W_EYE, labelOpts: { sides: true },
          draw: V => thin(path3([W3(1.5, 0, MH - 0.22), W3(1.5, 0, MH + 0.22)])(V), '0.8 0.6', 0.8),
          labels: [['主切口', 'main', V => P3(V, W3(1.5)), Rs], ['側切口（示意）', '', V => P3(V, sideW(-0.3)), Ls]] }] },
      { hd: 'Side port：15° 刀，術者左手側', views: [
        { kind: 'csec', hp: HP_SIDE, state: S2, win: { x: -8.6, y: -14.4, w: 6.2 }, overlays: [{ inc: tunnel(SIDE) }], labelOpts: { sides: true },
          draw: all(tool(S2), lb('側切口', 'side port', 'L', 6, 'sideExt'), lb('刀尖在前房', 'blade tip', 'R', 33, 'tip0')) },
        { kind: 'cscope', surgeon: SG, state: S2, win: W_EYE, overlays: [{ inc: mouth(SIDE), w: 0.9 }], labelOpts: { sides: true },
          draw: tool(S2), labels: [['側切口', 'side port', 'sideExt', Ls]] }] },
      { hd: '結膜切開、燒灼止血（範圍示意）', views: [
        { kind: 'csec', hp: HP, state: S3, win: W_TUN, labelOpts: { sides: true },
          draw: all(lb('角膜緣', 'limbus', 'R', 6, V => P3(V, W3(0))), lb('鞏膜露出', 'bare sclera', 'L', 12, V => P3(V, W3(1.6, 0.02))), lb('結膜掀開', 'conjunctiva', 'L', 36, V => P3(V, W3(3.0, -0.13)))) },
        { kind: 'cscope', surgeon: SG, state: S3, win: W_EYE, overlays: [{ cut: path3(periCut), w: 0.8 }], labelOpts: { sides: true },
          draw: all(V => thin(path3(periBack)(V)), lb('沿角膜緣剪開', 'peritomy', 'L', 6, V => P3(V, W3(0.25, 0, MH - 0.5))), lb('掀開範圍', '', 'R', 36, V => P3(V, W3(3.0, 0, MH + 0.4)))) }] },
      { hd: '外口 角膜緣後 1–2 mm → 內口 角膜內約 1.5 mm', views: [
        { kind: 'csec', hp: HP, state: S5, win: W_TUN, overlays: [{ inc: tunnel(MAIN) }], scale: { mm: 1 },
          draw: all(lb('內口', 'inner', 'R', 6, V => P3(V, tnM.to3(tnM.int))), lb('角膜緣', 'limbus', 'L', 12, V => P3(V, W3(0))), lb('外口', 'outer', 'L', 36, V => P3(V, tnM.to3(tnM.ext)))) },
        { kind: 'cscope', surgeon: SG, state: S4, win: W_MOUTH, overlays: [{ inc: mouth(MAIN), w: 0.9 }], labelOpts: { sides: true },
          dims: [{ from: V => mouth(MAIN)(V)[0], to: V => mouth(MAIN)(V)[1] }],
          draw: all(tool(S4), V => thin(path3(limbArc(0, MH - 0.5, MH + 0.5))(V), '0.5 0.5', 0.35), lb('寬 2.65 mm', '', 'R', 36, V => mid3(...mouth(MAIN)(V).map(p => [p[0], p[1], 0]))), lb('角膜緣', 'limbus', 'L', 6, V => P3(V, W3(0, 0, MH - 0.4)))) }] },
      { hd: '出錯：太淺 buttonhole｜太深 太早進前房', views: [
        { kind: 'csec', hp: HP, state: S5, win: W_TUN, overlays: [{ cut: path3(SHALLOW) }], labelOpts: { sides: true },
          draw: all(V => thin(tunnel(MAIN)(V), '0.9 0.7', 0.45), lb('太淺：穿破', '', 'R', 6, V => P3(V, SHALLOW[SHALLOW.length - 1])), lb('正確', 'correct', 'L', 36, V => tunnel(MAIN)(V)[34])) },
        { kind: 'csec', hp: HP, state: S5, win: W_TUN, overlays: [{ cut: tunnel(EARLY) }], labelOpts: { sides: true },
          draw: all(V => thin(tunnel(MAIN)(V), '0.9 0.7', 0.45), lb('太早進前房', '', 'R', 36, V => tunnel(EARLY)(V)[40]), lb('正確', 'correct', 'R', 6, V => tunnel(MAIN)(V)[34])) }] },
      { hd: 'DuoVisc → CCC 置中、5.0–5.5 mm → phaco', views: [
        { kind: 'csec', hp: HP, state: S6, win: W_HALF, overlays: [{ inc: tunnel(MAIN) }], labelOpts: { sides: true },
          draw: all(lb('主切口', 'main', 'L', 5, 'mainExt'), lb('DuoVisc', '', 'R', 5, [-2.6, -(L0.za + 1.3)]), lb('撕囊開口', 'CCC', 'R', 36, [-1.2, -(L0.za + 0.02)])) },
        { kind: 'cscope', surgeon: SG, state: S6, win: W_EYE, overlays: [{ cut: V => circle(V, CASE.ccc.r) }, { inc: mouth(MAIN), w: 0.9 }], labelOpts: { sides: true },
          dims: [{ from: V => V.P(V.r.M([-CASE.ccc.r, 0, 0])), to: V => V.P(V.r.M([CASE.ccc.r, 0, 0])) }],
          draw: all(lb('5.0–5.5 mm', '', 'R', 36, V => V.P(V.r.M([0, 0, 0]))), lb('360° 蓋住 optic', '', 'L', 6, V => V.P(V.r.M([0, CASE.ccc.r, 0])))) }] },
      { hd: 'ZMB00 +6.5 D in the bag、置中', views: [
        { kind: 'csec', hp: HP, state: S8, win: W_HALF, overlays: [{ inc: tunnel(MAIN) }], labelOpts: { sides: true },
          draw: all(lb('主切口', 'main', 'L', 5, 'mainExt'), lb('IOL in the bag', '', 'R', 36, [-1.0, -(L0.za - 0.6)])) },
        { kind: 'cscope', surgeon: SG, state: S8, win: W_EYE, overlays: [{ inc: mouth(MAIN), w: 0.9 }], labelOpts: { sides: true },
          draw: lb('optic 置中', '', 'R', 5, V => V.P(V.r.M([0, 0, 0]))) }] },
      { hd: '10-0 nylon（radial）→ 前房 cefuroxime', views: [
        { kind: 'csec', hp: HP, state: S8, win: W_TUN, overlays: [{ inc: tunnel(MAIN) }, { sut: path3(SUT) }], scale: { mm: 1 }, labelOpts: { sides: true },
          draw: all(lb('10-0 nylon', '', 'L', 6, V => P3(V, SUT[12])), lb('外口', 'outer', 'L', 36, V => P3(V, tnM.to3(tnM.ext)))) },
        { kind: 'cscope', surgeon: SG, state: S8, win: W_MOUTH, overlays: [{ inc: mouth(MAIN), w: 0.9 }, { sut: path3([W3(2.15), W3(0.85)]) }], labelOpts: { sides: true },
          draw: lb('radial', '', 'R', 36, V => P3(V, W3(2.15))) }] },
    ],
  });
}
