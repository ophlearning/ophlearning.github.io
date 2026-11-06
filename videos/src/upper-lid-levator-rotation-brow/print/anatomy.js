// 關鍵解剖與數字速查: three figures (brow-to-margin sagittal section, margin zoom, surgeon's view) and two tables. Every table row names
// the ledger segment of ../check.js its numbers come from (third element); the layout takes the source from that ledger entry and stops
// with an error when a number of the row is not in that segment.
{
  const F = EPI.F, L = { side: 'L' }, Rr = { side: 'R' };
  const cutDim = V => [V.P(V.r.DP.at(0, -0.3)), V.P(V.r.DP.at(LID.S_CUT, -0.3))];
  // follicle depth along the follicle (Elder 1997: 1.8 mm) and the depth that reaches 95 % of follicles (2.4 mm)
  const n = [F.d[1], -F.d[0]], o = n[0] < 0 ? n : [-n[0], -n[1]], fa = [F.E[0] + o[0] * 0.25, F.E[1] + o[1] * 0.25], fb = [fa[0] + F.d[0] * EP.follicleUp, fa[1] + F.d[1] * EP.follicleUp];
  const q = [F.E[0] + F.d[0] * EP.reach95Up, F.E[1] + F.d[1] * EP.reach95Up], qa = [q[0] + n[0] * 0.5, q[1] + n[1] * 0.5], qb = [q[0] - n[0] * 0.5, q[1] - n[1] * 0.5];
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Cruz 2015a', 'Cruz 2023', 'Tucker 2000', 'Kokubo 2019', 'Elder 1997', 'Singh 2022', 'Sakarya 2010'],
    figH: 73,
    figures: [
      { w: 92, kind: 'sag', state: { ...INC }, win: { x: -32, y: -31.5, w: 40, h: 34 }, red: 'none', labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5, x: 57, y: 4.5 },
        dims: [{ from: V => cutDim(V)[0], to: V => cutDim(V)[1], w: 0.4, label: ['瞼板切開：離瞼緣 3 mm', '', L] }],
        draw: V => `<circle cx="${V.A.incLo[0]}" cy="${V.A.incLo[1]}" r="1" fill="#fff" stroke="#000" stroke-width="0.5"/>`,
        labels: [['眉毛', 'eyebrow', 'brow', L], ['眉下脂肪', 'ROOF', 'roof', L], ['眶隔', 'septum', 'septum', L], ['切口 4 mm（院內常規）', '', 'incLo', L], ['睫毛', 'lashes', 'lash', L],
          ['骨膜', 'periosteum', 'periosteum', Rr], ['眶上緣', 'orbital rim', [-12.4, -18.3], Rr], ['提上瞼肌', 'levator', levAt, Rr], ['腱膜前脂肪', 'fat', 'fat', Rr],
          ['腱膜', 'aponeurosis', 'apo', Rr], ['穆勒氏肌', 'Müller', 'muller', Rr], ['瞼板', 'tarsus', 'tarsus', Rr]] },
      { w: 58, kind: 'sag', state: EPI.ZST, win: EPI.win(5, 7.2), red: 'none', labelOpts: { gap: 5.2, y1: 66 }, scale: { mm: 1 },
        dims: [{ from: fa, to: fb, w: 0.4, label: [`毛囊深 ${EP.follicleUp} mm`, `（下眼瞼 ${EP.follicleLo}）`] }, { from: qa, to: qb, w: 0.6, label: [`插 ${EP.reach95Up} mm：碰到 95%`] }],
        labels: [['歪的睫毛', 'misdirected', V => V.P(mixP(F.E, V.M.misLash, 0.12))], ['瞼板', 'tarsus', V => V.A.tarsusZ || V.A.tarsus]] },
      { w: 116, kind: 'cor', state: { ...PRE, ...INC, excMark: 1, notch: 1 }, win: { x: -23, y: -29.5, w: 44, h: 31 }, windows: [NERVE_WIN], amber: true, red: 'none',
        labelOpts: { gap: 5.1 }, scale: { mm: 10, x: 62, y: 5 },
        dims: [...X.map((x, i) => ({ from: V => V.P([x, V.r.lashY(x)]), to: V => V.P([x, V.r.excLoY(x)]), w: 0.3, label: [`${NM[i]} ${H[i]} mm`] })),
          { from: V => V.P([2.5, V.r.excLoY(2.5)]), to: V => V.P([2.5, V.r.excHiY(2.5)]) }],
        labels: [['眉毛', 'eyebrow', 'brow'], ['上切口線：切除寬 5 mm', 'upper line', V => V.P([-9, V.r.excHiY(-9)])], ['下切口線＝rotation 與 levator 共用', 'lower line', V => V.P([-10.5, V.r.excLoY(-10.5)])],
          ['眶上切跡與神經（開窗示意）', 'SO notch', 'notch']] },
    ],
    bottom: '86mm 1fr 50mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['切口：rotation 與 levator 共用', '距睫毛線 內 2.5／中 4／外 4 mm', '2-1'], ['切除皮膚寬', '5 mm', '3-1'],
        ['Levator → 瞼板', '4-0 vicryl ×3', '3-1'], ['眉下組織 → 骨膜', '4-0 vicryl ×1', '3-2'], ['眉毛固定後 MRD1', '約 2.5 mm', '3-2'],
        ['Levator → orbicularis；縫皮', '6-0 Prolene ×4；7-0 ethilone', '3-2'],
        ['Rotation：瞼板切開位置、針數、縫線', '依院內常規（圖為示意）', '2-3'], ['電解：機器、能量、時間、根數', '依院內常規', '4-2']] },
      { head: '文獻的數字', src: true, rows: [
        ['Lid crease rotation：瞼板切開', '離瞼緣 3 mm；15 號刀＋Westcott；6-0 vicryl 三針埋線', '2-2；2-3'],
        ['只轉瞼緣', '60 片中 1 片位置正確，內側仍有 2 根碰角膜', '1-1'],
        ['Ptosis 手術後 entropion（10 位）', '瞼板摺在上三分之一 70%；9 位從 lid crease 前路', '1-2'],
        ['Ptosis 修復後閉不緊', '第 1 天 60%、1 週 33%、6–20 週 9%', '6'],
        ['矯正後眉毛下降', '平均 2.5–2.9 mm', '3-2'],
        ['上眼瞼毛囊（下眼瞼）', '深 1.8（0.9）mm；碰到 95%：插 2.4（1.4）mm', '4-1'],
        ['電解一次不一定好', 'RF 3 mm 深：55% 只破壞部分毛囊根部', '4-3'],
        ['超細針電解（24 眼瞼）', '一次成功 66.6%；瞼緣缺口 16.6%、色素變淡 8.3%', '4-3']] },
    ],
    legend: { rows: ['inc', 'nerve'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央；中圖＝瞼緣放大）：左＝前　上＝上', '<b>右圖 術者視角</b>（正面）：面對病人，左＝temporal　右＝nasal'] },
  });
}
