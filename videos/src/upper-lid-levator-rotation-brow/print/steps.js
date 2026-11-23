// 手術步驟圖: one cell per checklist item; each cell = sagittal section (mechanism) + surgeon's view, the same state, as the video shows
// it at the end of that step (anim/draw.js segment in brackets). Anchors: 'name' = the model's anchor, [x, y] = model mm, V => figure mm.
// 2026-11-23 case: no brow fixation, no intra-operative epilation; steps 6–7 are drawn as if the levator advancement is done.
{
  const R2 = ROT.cor({ ...PRE, evert: -MRP.entr }, true), R3 = ROT.cor({ ...PRE, evert: 0, buried: 1 }, false);
  const lashRolled = x => V => V.P([x, V.r.lashY(x) + V.r.rollY(x) + 1.2]);
  const contour = V => `<path d="${PRINT.pth(ROT.XS.map(x => V.P([x, V.r.Uy(x)])))}" fill="none" stroke="#000" stroke-width="0.35" stroke-dasharray="0.6 0.6"/>`;
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個狀態',
    sources: ['Cruz 2015a'], grid: [3, 3],
    legend: { rows: ['inc', 'cut', 'sut'], orient: [
      '<b>左 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '<b>右 術者視角</b>：面對病人，左＝temporal　右＝nasal（OD 圖；本台 OS 左右相反）',
      '切口高度、切除寬、縫線與針數：依院內常規', '二次手術的切口位置與剝離：依主治', '縫線位置、內翻程度、睫毛根數：示意'] },
    steps: [
      { hd: '術前：二次手術；下垂＋瞼緣內轉（示意）', views: [                                                    // title / 1-1
        { kind: 'sag', state: { ...PRE, curl: MRP.entr }, win: WIN.sagLid, red: 'none',
          labels: [['提上瞼肌', 'levator', levAt], ['瞼緣內轉', 'entropion', 'lash'], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: { ...PRE, evert: -MRP.entr }, win: WIN.corLid,
          labels: [['睫毛碰角膜', 'entropion', lashRolled(4)], ['上瞼緣', 'lid margin', V => V.P([-6, V.r.Uy(-6)])]] }] },
      { hd: '每根碰角膜的睫毛是哪一種機轉', views: [                                                              // 1-1
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
        { kind: 'sag', state: ROTD, win: WIN.rotSag, red: 'none',
          overlays: [{ cut: tarsotomy }], marks: [{ at: 'suture', pos: 'br' }],
          labels: [['瞼緣外轉', 'everted', 'lash'], ['埋線', 'buried suture', 'suture'], ['瞼板切開', 'tarsotomy', V => V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR * 0.5))]] },
        { kind: 'cor', state: R3.state, win: WIN.rotCor, overlays: [{ cut: V => ROT.XS.map(x => V.P([x, R3.tarsoY(x)])), w: 0.5 }], marks: [{ at: 'buried', pos: 'br' }],
          labels: [['三針', 'sutures ×3', 'buried'], ['瞼板切開', 'tarsotomy', V => V.P([6.5, R3.tarsoY(6.5)])]] }] },
      { hd: '轉正後睜眼看高度 → 主治決定', views: [                                                                 // 2-3 end, 5-1
        { kind: 'sag', state: ROTD, win: WIN.sagLid, red: 'none', overlays: [{ cut: tarsotomy }],
          labels: [['提上瞼肌', 'levator', levAt], ['瞼緣已轉正', 'everted', 'lash'], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: R3.state, win: WIN.corLid, draw: contour,
          labels: [['高度、弧度', 'contour', V => V.P([6, V.r.Uy(6)])]] }] },
      { hd: '若做：4-0 vicryl ×3 固定瞼板；再看方向', views: [                                                       // 3-1 end
        { kind: 'sag', state: ADV, win: WIN.sagLid, red: 'none', marks: [{ at: 'tarSut', pos: 'tr' }],
          labels: [['固定到瞼板', 'tarsus', 'tarSut'], ['瞼緣又內翻？', 'margin', V => V.P(V.r.DP.at(0, 0))]] },
        { kind: 'cor', state: ADV, win: WIN.corLid, red: 'none', marks: [{ at: 'tarSutC', pos: [9.5, 3.4] }], draw: contour,
          labels: [['三針', 'sutures ×3', 'tarSutC'], ['瞼緣弧度', 'contour', V => V.P([6, V.r.Uy(6)])]] }] },
      { hd: '睜閉眼 → 6-0 Prolene ×4（有做 levator）', views: [                                                 // 3-2 end, 5-1
        { kind: 'sag', state: { ...ADV, creaseFix: 1 }, win: WIN.sagLid, red: 'none', marks: [{ at: 'creaseFix', pos: 'tr' }],
          labels: [['縫到 orbicularis', '', 'creaseFix'], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: { ...ADV, creaseFix: 1 }, win: WIN.corLid, red: 'none', marks: [{ at: 'creaseFix', pos: [9, 3.4] }],
          labels: [['四針', 'sutures ×4', 'creaseFix']] }] },
    ],
  });
}
