// 關鍵解剖與數字速查: two sagittal figures (brow-to-margin, the native Asian single eyelid) and the surgeon's view, without the brow
// fixation details (ROOF, supraorbital notch). Every table row names the ledger segment of ../levator-resection-brow-fixation/check.js
// its numbers come from (third element, K() adds the video name the series-style ledger uses).
{
  const L = { side: 'L' }, Rr = { side: 'R' };
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Kokubo 2019a', 'Jeong 1999', 'Eshraghi 2024', 'Takagi 2022', 'Tucker 1999', 'Lee 2024'],
    figH: 92,
    figures: [
      { w: 92, kind: 'sag', state: {}, win: { x: -32, y: -31.5, w: 40, h: 34 }, labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5, x: 57, y: 4.5 },
        labels: [['眉毛', 'eyebrow', 'brow', L], ['眶隔', 'septum', 'septum', L], ['睫毛', 'lashes', 'lash', L],
          ['眶上緣', 'orbital rim', [-12.4, -18.3], Rr], ['提上瞼肌', 'levator', V => V.P(V.r.LV.off(V.r.LV.near([-4, -17]), 0.5)), Rr],
          ['腱膜', 'apo', 'apo', Rr], ['瞼板', 'tarsus', 'tarsus', Rr]] },
      { w: 58, kind: 'sag', state: {}, win: { x: -18, y: -21, w: 17, h: 21 }, labelOpts: { gap: 5.2 }, scale: { mm: 2 },
        labels: [['眶隔融合處', 'fusion', 'fusion'], ['腱膜前脂肪', 'fat', 'fat'], ['瞼板', 'tarsus', 'tarsus'], ['眶隔', 'septum', 'septum'], ['腱膜', 'apo', 'apo'], ['穆勒氏肌', 'Müller', 'muller']] },
      { w: 116, kind: 'cor', state: MARK, win: { x: -23, y: -29.5, w: 44, h: 31 }, windows: [LAC_WIN],
        labelOpts: { gap: 5.1 }, scale: { mm: 10, x: 62, y: 5 },
        dims: [...X.map((x, i) => ({ from: V => V.P([x, V.r.lashY(x)]), to: V => V.P([x, V.r.excLoY(x)]), w: 0.3, label: [`${NM[i]} ${H[i]} mm`] })),
          { from: V => V.P([2.5, V.r.excLoY(2.5)]), to: V => V.P([2.5, V.r.excHiY(2.5)]), label: ['切除寬 5 mm'] }],
        labels: [['眉毛', 'eyebrow', 'brow'], ['上切口線', 'upper line', V => V.P([-9, V.r.excHiY(-9)])], ['下切口線', 'lower line', V => V.P([-10.5, V.r.excLoY(-10.5)])],
          ['淚腺（示意）', 'lacrimal', 'lacrimal']] },
    ],
    bottom: '80mm 1fr 50mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['切口：距睫毛線', '內 2.5／中 4／外 4 mm', K('3-1')], ['切除皮膚寬', '5 mm', K('3-1')],
        ['Levator → 瞼板', '4-0 vicryl ×3', K('4-4')],
        ['Levator → orbicularis', '6-0 Prolene ×4', K('4-7')], ['縫皮', '7-0 ethilone；GM 藥膏', K('4-7')],
        ['Levator 切除量、兩眼順序', '依院內常規（圖為示意）', K('4-3')]] },
      { head: '文獻的數字', src: true, rows: [
        ['Ptosis 矯正後眉毛下降', '80–84%；平均 2.5–2.9 mm', K('1-2')],
        ['Lacrimal gland prolapse', '盛行率 10–60%', K('4-2')],
        ['術中高度 vs 術後高度', 'r = 0.55', K('4-4')],
        ['術後 1 週', '40% 到最終高度；52% 再升高，平均 1.1 mm', K('6')],
        ['Conjunctival prolapse 的原因', 'blepharoptosis 手術占 36.6%', K('1-3')]] },
    ],
    legend: { rows: ['inc'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '左、中圖是未手術的亞洲人單眼皮：眶隔在瞼板上緣下方和腱膜融合，脂肪垂到瞼板前', '<b>右圖 術者視角</b>（右眼 OD；OS 左右相反）：左＝temporal　右＝nasal'] },
  });
}
