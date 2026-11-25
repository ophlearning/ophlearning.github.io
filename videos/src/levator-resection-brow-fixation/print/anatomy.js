// 關鍵解剖與數字速查: three figures (levator path from the orbital rim to the tarsus, the native Asian single eyelid, surgeon's view) and
// two tables. OS case without the brow fixation (2026-11-23): the brow figure, the supraorbital notch and the brow numbers are left out.
// Every table row names the ledger segment of ../check.js its numbers come from (third element); the layout takes the source from that
// ledger entry and stops with an error when a number of the row is not in that segment.
{
  const L = { side: 'L' }, Rr = { side: 'R' };
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Chen 2016', 'Jeong 1999', 'Eshraghi 2024', 'Takagi 2022', 'Tucker 1999', 'Lee 2024'],
    ledger: { '11': '病例' },
    figH: 73,
    figures: [
      { w: 92, kind: 'sag', state: {}, win: { x: -18, y: -22, w: 34, h: 22 }, labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5, x: 57, y: 4.5 },
        labels: [['眶上緣', 'orbital rim', [-12.4, -18.3], L], ['眶隔', 'septum', 'septum', L], ['睫毛', 'lashes', 'lash', L],
          ['提上瞼肌', 'levator', V => V.P(V.r.LV.off(V.r.LV.near([8, -18]), 0.5)), Rr], ['腱膜', 'aponeurosis', 'apo', Rr], ['瞼板', 'tarsus', 'tarsus', Rr]] },
      { w: 58, kind: 'sag', state: {}, win: { x: -18, y: -21, w: 17, h: 21 }, labelOpts: { gap: 5.2 }, scale: { mm: 2 },
        labels: [['眶隔融合處', 'fusion', 'fusion'], ['腱膜前脂肪', 'fat', 'fat'], ['瞼板', 'tarsus', 'tarsus'], ['眶隔', 'septum', 'septum'], ['腱膜', 'apo', 'apo'], ['穆勒氏肌', 'Müller', 'muller']] },
      { w: 116, kind: 'cor', state: MARK, win: { x: -25, y: -17, w: 38 }, windows: [LAC_WIN],
        labelOpts: { gap: 5.1 }, scale: { mm: 10, x: 62, y: 5 },
        // heights (mm) written beside each dimension, as on the step sheet (leaders to three close dimensions crossed); the strip width on the central one
        draw: V => { const d = (x, y0, y1, t, side) => { const a = V.P([x, y0]), b = V.P([x, y1]);
            return PRINT.dim(a, b, { w: 0.3 }) + PRINT.txt(a[0] + (side === 'L' ? -0.9 : 0.9), (a[1] + b[1]) / 2 + 1.2, t, { bold: true, anchor: side === 'L' ? 'end' : 'start' }); };
          return X.map((x, i) => d(x, V.r.lashY(x), V.r.excLoY(x), `${NM[i]} ${H[i]}`, 'R')).join('') + d(0, V.r.excLoY(0), V.r.excHiY(0), `切除寬 ${LRP.excW} mm`, 'L'); },
        labels: [['上切口線', 'upper line', V => V.P([-11.5, V.r.excHiY(-11.5)]), L], ['下切口線', 'lower line', V => V.P([-12, V.r.excLoY(-12)]), L],
          ['淚腺（開窗示意）', 'lacrimal gland', 'lacrimal']] },
    ],
    bottom: '80mm 1fr 50mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['切口：距睫毛線', '內 2.5／中 4／外 4 mm', '3-1'], ['切除皮膚寬', '5 mm', '3-1'],
        ['Levator → 瞼板', '4-0 vicryl ×3', '4-4'], ['Levator → orbicularis', '6-0 Prolene ×4', '4-7'], ['縫皮', '7-0 ethilone；GM 藥膏', '4-7'],
        ['Levator 切除量', '依院內常規（圖為示意）', '4-3'], ['結膜脫出（發生時）', '縫回穹窿或切除', '4-6']] },
      { head: '文獻的數字', src: true, rows: [
        ['Hering\'s law（單側 ptosis）', '10–20%；術後另一眼往下掉', '1-1'],
        ['單側術後另一眼往下掉', '先等約 2 週再評估', '6'],
        ['Lacrimal gland prolapse', '盛行率 10–60%', '4-2'],
        ['術中高度 vs 術後高度', 'r = 0.55', '4-4'],
        ['術後 1 週', '40% 到最終高度；52% 再升高，平均 1.1 mm', '6'],
        ['Conjunctival prolapse 的原因', 'blepharoptosis 手術占 36.6%', '1-3']] },
    ],
    legend: { rows: ['inc'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '左、中圖是未手術的亞洲人單眼皮：眶隔在瞼板上緣下方和腱膜融合，脂肪垂到瞼板前', '<b>右圖 術者視角</b>（右眼 OD；本台 OS 左右相反）：左＝temporal　右＝nasal'] },
  });
}
