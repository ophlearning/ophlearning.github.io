// 手術步驟圖: one cell per checklist item; each cell = the lower-lid sagittal section (mechanism, lsag) + the surgeon's view (lcor), the
// same model state (video.js). Step 8 (retrobulbar haemorrhage) uses the canthus pair instead: the horizontal section at the canthal level
// (axial, seen from below like CT) + the coronal lateral canthus, same x. What the model does not show is drawn here and marked 示意.
// step 8: the two labels placed by hand (top and bottom of the figure) so that neither leader runs through the other label
const canthLabs = V => PRINT.lab('外眥切開', 'canthotomy', 1.3, 5.2, V.A.canthotomy) + PRINT.lab('剪下支', 'cantholysis', 1.3, V.h - 2.2, V.A.cantholysis);
PRINT.sheet({
  type: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個狀態',
  sources: ['Coban 2023'], grid: [3, 3],
  legend: { rows: ['cut', 'sut'], orient: [
    '<b>左 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '<b>右 術者視角</b>（右眼 OD 示意；本台 OS 左右相反）：面對病人，左＝temporal　右＝nasal',
    '<b>第 <span data-struct="step">8</span> 格左 外眥水平切面</b>（從下往上看，同 CT）：上＝前　左＝temporal',
    '切除寬度、去脂量、縫線位置：依院內常規（圖為示意）；開眶隔後的脂肪範圍：示意'] },
  steps: [
    { hd: '術前：OS 內翻＋眼袋；血小板、凝血', views: [
      { kind: 'lsag', state: PRE, win: WIN.sag, red: 'none',
        labels: [['睫毛碰角膜', 'entropion', 'lashL'], ['眶脂肪前凸', 'lid bag', 'fatL'], ['眶隔', 'septum', 'septumL']] },
      { kind: 'lcor', state: PRE, win: WIN.cor,
        labels: [['睫毛往內', 'entropion', 'lashMidL']] }] },
    { hd: '術前：乾眼 TBUT 3 秒、下方 SPK（病例）', views: [
      { kind: 'lsag', state: PRE, win: WIN.zoom, red: 'none', scale: { mm: 1 },
        labels: [['下方角膜', 'cornea', 'cornea'], ['睫毛', 'lashes', 'lashL']] },
      { kind: 'lcor', state: PRE, win: WIN.cor,
        labels: [['下方角膜 SPK（病例）', '', [-1.5, 3.2]]] }] },
    { hd: '切除皮膚、皮下與 orbicularis（寬度示意）', views: [
      { kind: 'lsag', state: EXC, win: WIN.fix, red: 'none', labelOpts: { y0: 25 }, overlays: [{ cut: V => hzEdge(V, 'hzLo') }, { cut: V => hzEdge(V, 'hzHi') }],
        labels: [['切除', 'skin–muscle', 'hotzWound'], ['眼輪匝肌', 'orbicularis', 'orbPS']] },
      { kind: 'lcor', state: EXC, win: WIN.cor, red: 'none', labelOpts: { y0: 24 }, overlays: [{ cut: PRINT.along('hotzLoY', -12.4, 9.8) }, { cut: PRINT.along('hotzHiY', -12.4, 9.8) }],
        labels: [['切除範圍', 'excision', 'hotzL']] }] },
    { hd: '開眶隔 → retractor；認三團脂肪（示意）', views: [
      { kind: 'lsag', state: SEPT, win: WIN.sag,
        labels: [['開眶隔', 'septum', 'septCutL', { side: 'L' }], ['Retractor', '', 'cpf', { side: 'R' }], ['脂肪', 'fat', 'fatL', { side: 'L' }]] },
      { kind: 'lcor', state: SEPT, win: WIN.cor, windows: FAT_WIN, red: 'none',
        labels: [['外側', 'lateral', 'fatLat', { side: 'L' }], ['中央', 'central', 'fatCen', { side: 'L' }], ['內側', 'medial', 'fatMed', { side: 'R' }], ['下斜肌', 'IO', 'io', { side: 'R' }]] }] },
    { hd: '部分去脂（量依院內常規）：避開 IO', views: [
      { kind: 'lsag', state: FAT, win: WIN.deep, red: 'none',
        labels: [['去脂（示意）', 'fat', 'fatRemoved', { side: 'L' }], ['下斜肌（位置示意）', 'IO', 'io', { side: 'R' }]] },
      { kind: 'lcor', state: FAT, win: WIN.cor, windows: FAT_WIN, red: 'none',
        labels: [['下斜肌：不要夾', 'IO', 'io', { side: 'R' }], ['弓狀擴張', 'arcuate', 'arcuate', { side: 'L' }]] }] },
    { hd: 'Orbicularis → aponeurosis：6-0 Prolene ×5', views: [
      { kind: 'lsag', state: FIX, win: WIN.fix, red: 'none', labelOpts: { y0: 27 }, marks: [{ at: 'hotzFix', pos: [6, -3] }],
        labels: [['眼輪匝肌', 'orbicularis', V => V.P(V.M.hotzFixEnds[0])], ['Aponeurosis', '', V => V.P(V.M.hotzFixEnds[1])]] },
      { kind: 'lcor', state: FIX, win: WIN.cor, red: 'none', labelOpts: { y0: 31 }, marks: [{ at: 'hotzFixL', pos: [-4, 5.5] }],
        labels: [['五針', 'sutures ×5', 'hotzFixL']] }] },
    { hd: '收尾：閉眼、瞼緣方向、止血', views: [
      { kind: 'lsag', state: FIX, win: WIN.sag, red: 'none',
        labels: [['睫毛離開角膜', 'everted', 'lashL'], ['角膜', 'cornea', 'cornea']] },
      { kind: 'lcor', state: FIX, win: WIN.cor, red: 'none',
        labels: [['睫毛線', 'lash line', 'lashLineL']] }] },
    { hd: '術後球後出血 → canthotomy＋cantholysis', views: [
      { kind: 'axial', state: LCC, win: WIN.axc, draw: canthLabs },
      { kind: 'lcor', state: { ...LCC, rimShow: 1 }, win: WIN.canth, draw: canthLabs }] },
  ],
});
