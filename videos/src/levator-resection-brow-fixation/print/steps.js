// 手術步驟圖: one cell per checklist item; each cell = sagittal section (mechanism) + surgeon's view, the same state, as the video shows
// it at the end of that step (anim/draw.js segment in brackets). Anchors: 'name' = the model's anchor, [x, y] = model mm, V => figure mm.
{
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個狀態；OU 兩眼都做',
    sources: ['Wang 2019', 'Lee 2024'], grid: [3, 3],
    legend: { rows: ['inc', 'cut', 'sut', 'fix', 'nerve'], orient: [
      '<b>左 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '<b>右 術者視角</b>（右眼 OD；OS 左右相反）：左＝temporal　右＝nasal',
      '切口、切除寬、縫線與針數：依院內常規', '術前高度、切除量、縫線與淚腺、結膜脫出：示意'] },
    steps: [
      { hd: '術前：MRD1；眉毛被 frontalis 撐高（示意）', views: [                                                // 1-1, 1-2 (before)
        { kind: 'sag', state: RAISED, win: WIN.sagBrow,
          labels: [['額肌', 'frontalis', 'frontalis'], ['眉毛', 'eyebrow', 'brow'], ['上瞼緣', 'lid margin', V => V.P(V.r.DP.at(0, 0))]] },
        { kind: 'cor', state: RAISED, win: WIN.corFace,
          dims: [{ from: [0, 0], to: V => V.P([0, V.r.Uy(0)]), w: 0.4, label: ['術前（示意）', 'MRD1'] }],
          labels: [['眉毛撐高', 'brow raised', 'brow']] }] },
      { hd: '坐著畫線 2.5／4／4 mm；切除寬 5 mm', views: [                                                         // 3-1 end
        { kind: 'sag', state: MARK, win: WIN.sagLid,
          labels: [['上切口線', 'upper line', 'incHi'], ['下切口線', 'lower line', 'incLo'], ['睫毛線', 'lash line', 'lashSkin']] },
        // heights written beside each dimension (no leaders: three leaders to three close dimensions crossed); 內 on the nasal (right)
        // side of its dimension, the strip width (上切口線 − 下切口線) on the central one
        { kind: 'cor', state: MARK, win: WIN.corMark,
          draw: V => { const d = (x, y0, y1, t, side) => { const a = V.P([x, y0]), b = V.P([x, y1]);
              return PRINT.dim(a, b, { w: 0.3 }) + PRINT.txt(a[0] + (side === 'L' ? -0.9 : 0.9), (a[1] + b[1]) / 2 + 1.2, t, { bold: true, anchor: side === 'L' ? 'end' : 'start' }); };
            return X.map((x, i) => d(x, V.r.lashY(x), V.r.excLoY(x), `${NM[i]} ${H[i]}`, 'R')).join('') + d(0, V.r.excLoY(0), V.r.excHiY(0), `寬 ${LRP.excW}`, 'L'); } }] },
      { hd: '開眶隔：脂肪往上撥見腱膜；外側認淚腺', views: [                                                       // 4-2
        { kind: 'sag', state: OPEN, win: WIN.sagOpen,
          labels: [['腱膜前脂肪', 'fat', 'fatUp'], ['腱膜', 'aponeurosis', 'apo'], ['眶隔', 'septum', 'septCut']] },
        { kind: 'cor', state: OPEN, windows: [LAC_WIN], win: WIN.corLat,
          labels: [['淚腺', 'lacrimal', 'lacrimal', { side: 'R' }], ['腱膜', 'aponeurosis', 'wound']] }] },
      { hd: 'Levator 分離 → Putterman clamp 切除', views: [                                                        // 4-3
        { kind: 'sag', state: { ...RES, clamp: 1 }, win: WIN.sagLid,
          labels: [['提上瞼肌', 'levator', levAt], ['Putterman clamp', '', 'clamp'], ['切除線', 'resection', V => V.P(V.r.LVd.off(V.M.lid.sClamp, 0.3))]] },
        { kind: 'cor', state: { ...RES, clamp: 1 }, win: WIN.corLid, overlays: [{ cut: PRINT.along('excLoY', -12.4, 9.8) }, { cut: PRINT.along('excHiY', -12.4, 9.8) }],
          labels: [['Clamp（皮下虛線）', '', 'clamp'], ['提上瞼肌', 'levator', 'wound']] }] },
      { hd: '4-0 vicryl ×3 固定瞼板；睜眼看高度、contour', views: [                                                 // 4-4
        { kind: 'sag', state: ADV, win: WIN.sagLid, red: 'none', marks: [{ at: 'tarSut', pos: 'tr' }],
          labels: [['固定到瞼板', 'tarsus', 'tarSut'], ['前徙', 'advanced', V => V.P(V.r.LV.off(1.6, -0.05))]] },
        { kind: 'cor', state: ADV, win: WIN.corLid, red: 'none', marks: [{ at: 'tarSutC', pos: [9.5, 3.4] }],
          draw: V => { const q = []; for (let x = -12.4; x <= 9.8 + 1e-9; x += 0.2) q.push(V.P([x, V.r.Uy(x)]));
            return `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="0.35" stroke-dasharray="0.6 0.6"/>`; },
          labels: [['三針', 'sutures ×3', 'tarSutC'], ['瞼緣弧度', 'contour', V => V.P([6, V.r.Uy(6)])]] }] },
      { hd: '剝到眉下 → 4-0 vicryl ×1 到骨膜；MRD1', views: [                                                       // 4-5 end
        { kind: 'sag', state: BROWFIX, win: WIN.sagBrow, red: 'none', marks: [{ at: 'browSutP', pos: [4, -0.6] }],
          labels: [['眉毛', 'eyebrow', 'brow'], ['眉下脂肪', 'ROOF', 'roof'], ['骨膜', 'periosteum', 'periosteum']] },
        { kind: 'cor', state: { ...BROWFIX, notch: 1 }, win: WIN.corFace, windows: [NERVE_WIN], red: 'none', amber: true, marks: [{ at: 'browFix', pos: [8, 9], fix: true }],
          dims: [{ from: [0, 0], to: V => V.P([0, V.r.Uy(0)]), w: 0.4, label: [`MRD1 約 ${LRP.mrdPost} mm`] }],
          labels: [['眶上神經', 'SO nerve', 'notch'], ['固定點', 'fixation', 'browFix']] }] },
      { hd: '結膜脫出？縫回穹窿或切除（示意）', views: [                                                            // 1-3, 4-6
        { kind: 'sag', state: { ...BROWFIX, prolapse: 1 }, win: WIN.sagFx,
          labels: [['上穹窿', 'superior fornix', 'fornix'], ['脫出', 'prolapse', 'prolapse', { side: 'R' }]] },
        { kind: 'cor', state: { ...BROWFIX, prolapse: 1 }, win: WIN.corLid, red: 'none',
          labels: [['脫出的結膜', 'prolapse', 'prolapse']] }] },
      { hd: '6-0 Prolene ×4 雙眼皮線；7-0 ethilone 縫皮', views: [                                                  // 4-7
        { kind: 'sag', state: { ...BROWFIX, creaseFix: 1 }, win: WIN.sagLid, red: 'none', marks: [{ at: 'creaseFix', pos: 'tr' }],
          labels: [['縫到 orbicularis', '', 'creaseFix'], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: { ...BROWFIX, creaseFix: 1 }, win: WIN.corLid, red: 'none', marks: [{ at: 'creaseFix', pos: [9, 3.4] }],
          labels: [['四針', 'sutures ×4', 'creaseFix']] }] },
    ],
  });
}
