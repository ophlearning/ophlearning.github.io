// 手術步驟圖: one cell per checklist item; each cell = sagittal section (mechanism) + surgeon's view, the same state, as the video shows
// it at the end of that step (anim/draw.js segment in brackets). Anchors: 'name' = the model's anchor, [x, y] = model mm, V => figure mm.
{
  const R2 = ROT.cor({ ...PRE, evert: -MRP.entr }, true), R3 = ROT.cor({ ...PRE, evert: 0, buried: 1 }, false), F = EPI.F;
  const lashRolled = x => V => V.P([x, V.r.lashY(x) + V.r.rollY(x) + 1.2]);
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個狀態',
    sources: ['Cruz 2015a'], grid: [3, 3],
    legend: { rows: ['inc', 'cut', 'sut', 'fix', 'nerve'], orient: [
      '<b>左 矢狀切面</b>（瞳孔中央；第 <span data-struct="step">7</span> 步＝瞼緣放大）：左＝前　上＝上', '<b>右 術者視角</b>：面對病人，左＝temporal　右＝nasal',
      '切口高度、切除寬、縫線與針數：依院內常規', '縫線位置、內翻程度、睫毛根數：示意'] },
    steps: [
      { hd: '術前：每根碰角膜的睫毛是哪一種機轉', views: [                                                       // 1-1
        { kind: 'sag', state: { ...PRE, curl: MRP.entr, misdirected: 1 }, win: WIN.lidSag, red: 'none',
          labels: [['瞼緣內轉', 'entropion', 'lash'], ['角膜', 'cornea', 'cornea'], ['瞼板', 'tarsus', V => V.P(V.r.DP.at(4, 0.5))]] },
        { kind: 'cor', state: { ...PRE, evert: -MRP.entr, misdirected: 1 }, win: WIN.corLid,
          labels: [['歪的睫毛', 'misdirected', 'misLash'], ['睫毛碰角膜', 'entropion', lashRolled(4)]] }] },
      { hd: '畫線 2.5／4／4 mm → 掀瓣到睫毛根', views: [                                                            // 2-1
        { kind: 'sag', state: { ...ROT0, crease: 1, flap: 1 }, win: WIN.rotSag, red: 'none', overlays: [{ inc: creaseInc }],
          labels: [['切口', 'crease incision', 'creaseSkin'], ['皮膚肌肉瓣', 'flap', 'flap'], ['瞼板', 'tarsus', 'exposedTarsus']] },
        { kind: 'cor', state: R2.state, windows: R2.windows, win: WIN.rotCor, overlays: [{ inc: V => ROT.XS.map(x => V.P([x, R2.f.inc(x)])) }],
          draw: V => { const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], nm = ['外', '中', '內'];
            return ROT.flapSvg(V, R2.f) + X.map((x, i) => PRINT.dim(V.P([x, R2.f.lash(x) - 0.4]), V.P([x, R2.f.inc(x)]), { w: 0.3 }) +
              PRINT.txt(V.P([x, 0])[0], V.P([x, R2.f.inc(x)])[1] - 1.4, `${nm[i]} ${H[i]}`, { bold: true, anchor: 'middle' })).join(''); },
          labels: [['翻下的瓣', 'flap', V => V.P([-6, R2.f.lash(-6) + 1.25])], ['窗內瞼板', 'tarsus', V => V.P([3, (R2.f.inc(3) + R2.f.lash(3)) / 2])]] }] },
      { hd: '瞼板全層切開 → 埋線 → 瞼緣外轉（示意）', views: [                                                      // 2-3
        { kind: 'sag', state: { ...ROT0, crease: 1, flap: 0, cut: 1, suture: 1, buried: true, curl: MRP.after }, win: WIN.rotSag, red: 'none',
          overlays: [{ cut: tarsotomy }], marks: [{ at: 'suture', pos: 'br' }],
          labels: [['瞼緣外轉', 'everted', 'lash'], ['埋線', 'buried suture', 'suture'], ['瞼板切開', 'tarsotomy', V => V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR * 0.5))]] },
        { kind: 'cor', state: R3.state, win: WIN.rotCor, overlays: [{ cut: V => ROT.XS.map(x => V.P([x, R3.tarsoY(x)])), w: 0.5 }], marks: [{ at: 'buried', pos: 'br' }],
          labels: [['三針', 'sutures ×3', 'buried'], ['瞼板切開', 'tarsotomy', V => V.P([6.5, R3.tarsoY(6.5)])]] }] },
      { hd: 'Levator：切除 5 mm 皮膚肌肉 → clamp', views: [                                                           // 3-1 (line 3)
        { kind: 'sag', state: { ...RES, clamp: 1 }, win: WIN.sagLid,
          labels: [['提上瞼肌', 'levator', levAt], ['Putterman clamp', '', 'clamp'], ['切除線', 'resection', V => V.P(V.r.LVd.off(V.M.lid.sClamp, 0.3))]] },
        { kind: 'cor', state: { ...RES, clamp: 1 }, win: WIN.corLid, overlays: [{ cut: PRINT.along('excLoY', -12.4, 9.8) }, { cut: PRINT.along('excHiY', -12.4, 9.8) }],
          dims: [{ from: V => V.P([2.5, V.r.excLoY(2.5)]), to: V => V.P([2.5, V.r.excHiY(2.5)]), label: [`寬 ${LRP.excW} mm`] }],
          labels: [['Clamp（皮下虛線）', '', 'clamp']] }] },
      { hd: '4-0 vicryl ×3 固定瞼板；看高度與方向', views: [                                                          // 3-1 end
        { kind: 'sag', state: ADV, win: WIN.sagLid, red: 'none', marks: [{ at: 'tarSut', pos: 'tr' }],
          labels: [['固定到瞼板', 'tarsus', 'tarSut'], ['瞼緣又內翻？', 'margin', V => V.P(V.r.DP.at(0, 0))]] },
        { kind: 'cor', state: ADV, win: WIN.corLid, red: 'none', marks: [{ at: 'tarSutC', pos: [9.5, 3.4] }],
          draw: V => `<path d="${PRINT.pth(ROT.XS.map(x => V.P([x, V.r.Uy(x)])))}" fill="none" stroke="#000" stroke-width="0.35" stroke-dasharray="0.6 0.6"/>`,
          labels: [['三針', 'sutures ×3', 'tarSutC'], ['瞼緣弧度', 'contour', V => V.P([6, V.r.Uy(6)])]] }] },
      { hd: '剝到眉下 → 4-0 vicryl ×1；MRD1', views: [                                                               // 3-2 (line 3)
        { kind: 'sag', state: BROW, win: WIN.sagBrow, red: 'none', marks: [{ at: 'browSutP', pos: [4, -0.6] }],
          labels: [['眉毛', 'eyebrow', 'brow'], ['眉下脂肪', 'ROOF', 'roof'], ['骨膜', 'periosteum', 'periosteum']] },
        { kind: 'cor', state: { ...BROW, notch: 1 }, win: WIN.corFace, windows: [NERVE_WIN], red: 'none', amber: true, marks: [{ at: 'browFix', pos: [8, 9], fix: true }],
          dims: [{ from: [0, 0], to: V => V.P([0, V.r.Uy(0)]), w: 0.4, label: [`MRD1 約 ${LRP.mrdPost} mm`] }],
          labels: [['眶上神經', 'SO nerve', 'notch'], ['固定點', 'fixation', 'browFix']] }] },
      { hd: '還碰角膜的睫毛：沿睫毛幹電解', views: [                                                                   // 4-2 (needle in, before the lash is pulled)
        { kind: 'sag', state: EPI.ZST, win: EPI.win(5, 4.85), red: 'none', scale: { mm: 1, x: 41 },
          draw: V => { const out = V.P([F.E[0] - F.d[0] * 0.9, F.E[1] - F.d[1] * 0.9]), tip = V.P(F.B); return EPI.coag(tip, 0.28 * V.k) + EPI.needle(out, tip); },
          marks: [{ at: [F.B[0], F.B[1]], pos: [4, 4.2] }],
          labels: [['電解針', 'needle', V => mixP(V.P([F.E[0] - F.d[0] * 0.9, F.E[1] - F.d[1] * 0.9]), V.P(F.B), 0.25)], ['毛囊根部', 'follicle', [F.B[0], F.B[1]]], ['歪的睫毛', 'misdirected', V => V.P(mixP(F.E, V.M.misLash, 0.12))]] },
        { kind: 'cor', state: EPI.ZST, win: WIN.czWin, red: 'none',
          draw: V => MIS_X.map(x => { const y = V.r.lashY(x) + V.r.rollY(x) + 0.1; return EPI.coag(V.P([x, y - 0.45]), 0.35 * V.k) + EPI.needle(V.P([x - 0.25, y + 2.6]), V.P([x, y])); }).join(''),
          labels: [['針從根部進', 'at the root', V => V.P([MIS_X[1], V.r.lashY(MIS_X[1])])], ['角膜', 'cornea', [1.2, -1.0]]] }] },
      { hd: '6-0 Prolene ×4；7-0 ethilone；睜閉眼', views: [                                                           // 3-2 end, 5-1
        { kind: 'sag', state: { ...BROW, creaseFix: 1 }, win: WIN.sagLid, red: 'none', marks: [{ at: 'creaseFix', pos: 'tr' }],
          labels: [['縫到 orbicularis', '', 'creaseFix'], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: { ...BROW, creaseFix: 1 }, win: WIN.corLid, red: 'none', marks: [{ at: 'creaseFix', pos: [9, 3.4] }],
          labels: [['四針', 'sutures ×4', 'creaseFix']] }] },
    ],
  });
}
