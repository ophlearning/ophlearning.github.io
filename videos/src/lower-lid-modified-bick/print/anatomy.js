// 關鍵解剖與數字速查: three figures (axial section of the lateral canthus with the Whitnall tubercle; axial distraction test; the lower lid
// from the front with the wedge's place, 示意) and two tables. Every table row names the ledger segment of ../check.js its numbers come
// from (third element); the layout takes the source from that ledger entry and stops when a number of the row is not in it.
{
  const P0 = CANTHUS.marginAt(0);
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Gioia 1987', 'Pushker 2025', 'Beigi 2008', 'Vahdani 2018', 'Poon 2019', 'Barrett 2012', 'Prendes 2020', 'Auguste 2023', 'Tao 2025'],
    figH: 73,
    figures: [
      { w: 92, kind: 'axial', state: LAX, win: { x: -27, y: -10, w: 22, h: 16 }, labelOpts: { y1: 58 }, scale: { mm: 5 },
        dims: [{ from: 'rimEdge', to: 'tubercle', w: 0.4, label: ['Whitnall 結節：眶緣後 1.5 mm', ''] }],
        labels: [['外側眶緣', 'lateral orbital rim', 'rim'], ['外眥韌帶', 'lateral canthal tendon', 'tendon'], ['外眥', 'lateral canthus', 'lc'],
          ['下眼瞼（投影）', 'lower lid', 'lidLat']] },
      { w: 84, kind: 'axial', state: { ...LAX, distract: 1 }, win: { x: -24, y: -24, w: 30, h: 26 }, labelOpts: { y1: 62 },
        dims: [{ from: V => V.P([1.6, P0[1]]), to: V => V.P([1.6, P0[1] - V.M.state.Dnow]), w: 0.4, label: ['拉開的距離', 'distraction'] }],
        labels: [['外眥韌帶', 'tendon', 'tendon'], ['眼球', 'globe', V => V.P([-4, -3])]] },
      { w: 96, kind: 'lcor', state: { rimShow: 1 }, win: { x: -26, y: -7, w: 34, h: 20 }, labelOpts: { y1: 58 }, scale: { mm: 5 },
        overlays: [{ inc: V => [...wedgePts(V), wedgePts(V)[0]] }],
        labels: [['外眥', 'canthus', 'lcL'], ['楔形（示意）', 'wedge', V => wedgePts(V)[1]], ['下瞼板', 'tarsus', 'tarsusL']] },
    ],
    bottom: '1fr 1.45fr 46mm',
    tables: [
      { head: '這台的做法（依院內常規；刀後依 OP note 確認）', rows: [
        ['局部麻醉', '藥物、劑量依院內常規', '院內'], ['外眥切開＋下支切斷', '做法依院內常規', '院內'],
        ['楔形寬度', '依 laxity 決定；量依院內常規', '院內'], ['瞼板斷端 → 眶緣骨膜', '縫線、針數依院內常規', '院內'],
        ['外眥角、orbicularis、皮膚', '縫法依院內常規', '院內'], ['附加術式', '本台：無', '院內']] },
      { head: '文獻的數字', src: true, rows: [
        ['Distraction test', '> 6–8 mm 算明顯；內翻病人 7.5–11 mm', '1'],
        ['Whitnall 結節', '外側眶緣後方 1.5 mm', 'Gioia'],
        ['Bick vs LTS（641 次，非隨機）', 'Bick 84 次：解剖成功 100%、再手術 0；LTS 89.1%、9%', 'Vahdani'],
        ['內翻：Bick vs LTS（各加 ES 或 LLRP）', '治癒 100% vs 92%／90%；再手術 0 vs 7%／6.5%', 'Poon'],
        ['Quick strip（Bick＋LTS 混合）', '225 個眼瞼（內翻 54）：完全矯正 92.4%', 'Barrett'],
        ['Modified Bick＋眼輪匝肌與脂肪切除', '70 個眼瞼：復發 1.4%', 'Prendes'],
        ['內翻：只做水平縮短 vs 合併術式', '復發 7%（4/54）vs 8%', '8']] },
    ],
    legend: { rows: ['inc'], orient: ['<b>左、中圖 外眥水平切面</b> axial（從下往上看，同 CT）：上＝前　左＝temporal', '<b>右圖 術者視角</b>（正面）：面對病人，左＝temporal　右＝nasal',
      'ES＝everting sutures；LLRP＝retractor plication', 'Bick 的缺點：外眥角變圓、往內移（Tao 2025）'] },
  });
}
