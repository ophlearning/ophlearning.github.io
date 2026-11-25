// 手術步驟圖: one cell per checklist item. Left = mechanism (axial section at the canthal level, seen from below like CT; step 8 = lower-lid
// sagittal section), right = surgeon's view (coronal, lateral canthus or the whole lower lid), the same state. The model has no wedge
// resection: the wedge (coronal triangle) and the full-thickness cut (axial lines across the lid) are print overlays, schematic.
// Anchors: 'name' = the model's anchor, [x, y] = model mm, V => figure mm.
PRINT.sheet({
  type: 'steps', title: '手術步驟圖', sub: '左＝外眥水平切面（機轉）　右＝術者視角（正面），同一個狀態',
  sources: ['Hurwitz 1987', 'Tao 2025'], grid: [3, 3],
  legend: { rows: ['inc', 'cut', 'sut', 'fix'], orient: [
    '<b>左 外眥水平切面</b> axial（從下往上看，同 CT）：上＝前　左＝temporal；第 <span data-struct="step">8</span> 步＝矢狀切面：左＝前　上＝上',
    '<b>右 術者視角</b>：面對病人，左＝temporal　右＝nasal',
    '楔形的位置與寬度、切除長度：示意；縫線與針數：依院內常規'] },
  steps: [
    { hd: '術前：distraction、睫毛碰角膜', views: [                                                         // 1
      { kind: 'axial', state: { ...LAX, distract: 1 }, win: WIN.AX,
        labels: [['往前拉', 'distraction', 'distract'], ['外側眶緣', 'rim', 'rim']] },
      { kind: 'lcor', state: PRE, win: WIN.COR,
        labels: [['睫毛碰角膜', 'trichiasis', 'lashMidL']] }] },
    { hd: '局麻；畫外眥線與楔形（示意）', views: [                                                           // 2
      { kind: 'axial', state: LAX, win: WIN.AXC, overlays: [{ inc: ['lc', 'rimEdge'] }],
        labels: [['外眥', 'canthus', 'lc'], ['外側眶緣', 'rim', 'rim']] },
      { kind: 'lcor', state: { rimShow: 1 }, win: WIN.CANTH, overlays: [{ inc: V => [V.A.lcL, V.P([V.r.latRimX + 0.4, V.M.lcL[1]])] }, { inc: wedgePts }],
        labels: [['外眥切開線', 'canthotomy', V => V.P([(V.M.lcL[0] + V.r.latRimX) / 2, V.M.lcL[1]])], ['楔形', 'wedge', V => wedgePts(V)[1]]] }] },
    { hd: 'Canthotomy＋inferior cantholysis', views: [                                                     // 3
      { kind: 'axial', state: { ...LAX, ...CUTS }, win: WIN.AXC, red: 'cut',
        labels: [['外眥切開', 'canthotomy', 'canthotomy'], ['剪斷下支', 'cantholysis', 'cantholysis']] },
      { kind: 'lcor', state: CUTS, win: WIN.CANTH, red: 'cut',
        labels: [['外眥切開', 'canthotomy', 'canthotomy'], ['下支', 'cantholysis', 'cantholysis']] }] },
    { hd: '往外拉：多出來的就是要切的', views: [                                                             // 4
      { kind: 'axial', state: { ...LAX, ...CUTS }, win: WIN.AXC, red: 'none',
        draw: V => PRINT.arrow(V.P([V.M.lidEnd[0], V.M.lidEnd[1] + 1.8]), V.P([V.M.lidEnd[0] - 3.2, V.M.lidEnd[1] + 1.8]), { w: 0.6 }),
        labels: [['往外拉', 'pull', 'lidEnd', { side: 'R' }], ['外側眶緣', 'rim', 'rim']] },
      { kind: 'lcor', state: CUTS, win: WIN.CANTH, red: 'none', overlays: [{ inc: wedgePts }],
        draw: V => PRINT.arrow(V.P([V.M.lcL[0] + 2.5, V.M.lcL[1] + 2.4]), V.P([V.M.lcL[0] - 1.5, V.M.lcL[1] + 2.4]), { w: 0.6 }),
        labels: [['多出來的寬度', 'excess', V => wedgePts(V)[1]]] }] },
    { hd: '全層楔形切除（示意）', views: [                                                                   // 5
      { kind: 'axial', state: { ...LAX, ...CUTS }, win: WIN.AXC, red: 'none', overlays: [{ cut: V => axCut(V, 1.9) }, { cut: V => axCut(V, 5.1) }],
        labels: [['全層', 'full thickness', V => axMid(V, 3.5)], ['外眥', 'canthus', 'lc']] },
      { kind: 'lcor', state: CUTS, win: WIN.CANTH, red: 'none', overlays: [{ cut: V => [...wedgePts(V), wedgePts(V)[0]] }],
        labels: [['楔形切除', 'wedge', V => wedgePts(V)[1]]] }] },
    { hd: '瞼板斷端 → 外側眶緣骨膜', views: [                                                               // 6
      { kind: 'axial', state: { ...LAX, ...FIXED }, win: WIN.AXC, marks: [{ at: 'stripFix', pos: 'bl', fix: true }],
        labels: [['瞼板斷端', 'tarsal end', 'stripBand'], ['骨膜', 'periosteum', 'stripFix', { side: 'R' }]] },
      { kind: 'lcor', state: { ...FIXED, rimShow: 1 }, win: WIN.CANTH, marks: [{ at: 'stripFix', pos: 'bl', fix: true }],
        labels: [['固定點', 'fixation', 'stripFix'], ['外眥', 'canthus', 'lcL']] }] },
    { hd: '重建外眥角、對齊；縫皮', views: [                                                                 // 7
      { kind: 'axial', state: { ...LAX, ...FIXED }, win: WIN.AXC,
        labels: [['眼瞼貼回眼球', 'tightened', 'lidLat'], ['外眥', 'canthus', 'lc']] },
      { kind: 'lcor', state: { ...FIXED, rimShow: 1 }, win: WIN.CANTH, overlays: [{ sut: V => [V.A.lcL, V.P([V.r.latRimX + 0.4, V.M.lcL[1]])] }],
        marks: [{ at: V => V.P([(V.M.lcL[0] + V.r.latRimX) / 2, V.M.lcL[1]]), pos: [-4, 4.5] }],
        // labels placed by hand, away from the canthal line, so the suture along it stays visible
        draw: V => PRINT.lab('外眥角', 'canthal angle', V.w - 1.3, 8, V.A.lcL, { side: 'R' }) +
          PRINT.lab('縫皮', 'skin', 1.3, V.h - 4, V.P([(V.M.lcL[0] + V.r.latRimX) / 2 + 1.5, V.M.lcL[1]])) }] },
    { hd: '收尾：睫毛離開角膜、沒有 notch', views: [                                                         // 8
      { kind: 'lsag', state: {}, win: WIN.SAG,
        labels: [['睫毛離開角膜', 'lashes', 'lashL'], ['角膜', 'cornea', 'cornea']] },
      { kind: 'lcor', state: {}, win: WIN.COR,
        labels: [['瞼緣平順', 'no notch', 'marginL'], ['外眥角', 'canthus', 'lcL']] }] },
  ],
});
