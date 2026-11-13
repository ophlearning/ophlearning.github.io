// 關鍵解剖與數字速查: three figures (brow-to-margin sagittal section, the native Asian single eyelid, surgeon's view) and two tables. Every
// table row names the ledger segment of ../check.js its numbers come from (third element); the layout takes the source from that ledger
// entry and stops with an error when a number of the row is not in that segment.
{
  const L = { side: 'L' }, Rr = { side: 'R' };
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  // ROOF thickness measured horizontally 5 mm below the orbital rim on the unoperated lid (Manta 2025), as in draw.js 4-5
  const roofY = LID.RIM_Y + LRP.roofBelow, roof = V => [V.P([V.r.crossX(V.r.probe.musB, roofY), roofY]), V.P([V.r.crossX(V.r.probe.pb, roofY), roofY])];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Kokubo 2019a', 'Baker 2016', 'Jeong 1999', 'Manta 2025', 'Pruksapong 2022', 'Eshraghi 2024', 'Takagi 2022', 'Tucker 1999', 'Lee 2024'],
    figH: 73,
    figures: [
      { w: 92, kind: 'sag', state: {}, win: { x: -32, y: -31.5, w: 40, h: 34 }, labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5, x: 57, y: 4.5 },
        dims: [{ from: V => roof(V)[0], to: V => roof(V)[1], w: 0.4, label: ['ROOF 約 1.8 mm', 'East Asian', L] }],
        labels: [['眉毛', 'eyebrow', 'brow', L], ['眶隔', 'septum', 'septum', L], ['睫毛', 'lashes', 'lash', L],
          ['骨膜', 'periosteum', 'periosteum', Rr], ['眶上緣', 'orbital rim', [-12.4, -18.3], Rr], ['提上瞼肌', 'levator', V => V.P(V.r.LV.off(V.r.LV.near([-4, -17]), 0.5)), Rr],
          ['腱膜', 'aponeurosis', 'apo', Rr], ['瞼板', 'tarsus', 'tarsus', Rr]] },
      { w: 58, kind: 'sag', state: {}, win: { x: -18, y: -21, w: 17, h: 21 }, labelOpts: { gap: 5.2 }, scale: { mm: 2 },
        labels: [['眶隔融合處', 'fusion', 'fusion'], ['腱膜前脂肪', 'fat', 'fat'], ['瞼板', 'tarsus', 'tarsus'], ['眶隔', 'septum', 'septum'], ['腱膜', 'apo', 'apo'], ['穆勒氏肌', 'Müller', 'muller']] },
      { w: 116, kind: 'cor', state: { ...MARK, notch: 1 }, win: { x: -23, y: -29.5, w: 44, h: 31 }, windows: [NERVE_WIN, LAC_WIN], amber: true,
        labelOpts: { gap: 5.1 }, scale: { mm: 10, x: 62, y: 5 },
        dims: [...X.map((x, i) => ({ from: V => V.P([x, V.r.lashY(x)]), to: V => V.P([x, V.r.excLoY(x)]), w: 0.3, label: [`${NM[i]} ${H[i]} mm`] })),
          { from: V => V.P([2.5, V.r.excLoY(2.5)]), to: V => V.P([2.5, V.r.excHiY(2.5)]) }],
        labels: [['眉毛', 'eyebrow', 'brow'], ['上切口線：切除寬 5 mm', 'upper line', V => V.P([-9, V.r.excHiY(-9)])], ['下切口線', 'lower line', V => V.P([-10.5, V.r.excLoY(-10.5)])],
          ['眶上切跡與神經（開窗示意）', 'SO notch', 'notch'], ['淚腺（開窗示意）', 'lacrimal gland', 'lacrimal']] },
    ],
    bottom: '80mm 1fr 50mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['切口：距睫毛線', '內 2.5／中 4／外 4 mm', '3-1'], ['切除皮膚寬', '5 mm', '3-1'],
        ['Levator → 瞼板', '4-0 vicryl ×3', '4-4'], ['眉下組織 → 骨膜', '4-0 vicryl ×1', '4-5'], ['眉毛固定後 MRD1', '約 2.5 mm', '4-5'],
        ['Levator → orbicularis', '6-0 Prolene ×4', '4-7'], ['縫皮', '7-0 ethilone；GM 藥膏', '4-7'],
        ['Levator 切除量、兩眼順序', '依院內常規（圖為示意）', '4-3']] },
      { head: '文獻的數字', src: true, rows: [
        ['矯正後眉毛下降', '80–84%；平均 2.5–2.9 mm', '1-2'],
        ['只做 blepharoplasty ／加 internal browpexy', '眉毛 −1.7 mm ／外側約 +1 mm', '2'],
        ['ROOF（東亞人）', '眶上緣下 5 mm 仍約 1.8 mm 厚', '4-5'],
        ['眶上切跡距中線', '約 22–24 mm（泰國屍體）', '4-5'],
        ['Lacrimal gland prolapse', '盛行率 10–60%', '4-2'],
        ['術中高度 vs 術後高度', 'r = 0.55', '4-4'],
        ['術後 1 週', '40% 到最終高度；52% 再升高，平均 1.1 mm', '6'],
        ['Conjunctival prolapse 的原因', 'blepharoptosis 手術占 36.6%', '1-3']] },
    ],
    legend: { rows: ['inc', 'nerve'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '左、中圖是未手術的亞洲人單眼皮：眶隔在瞼板上緣下方和腱膜融合，脂肪垂到瞼板前', '<b>右圖 術者視角</b>（右眼 OD）：左＝temporal　右＝nasal'] },
  });
}
