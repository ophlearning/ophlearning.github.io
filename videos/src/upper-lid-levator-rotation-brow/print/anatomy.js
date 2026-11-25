// 關鍵解剖與數字速查 of the 2026-11-23 case: three figures (lid sagittal section, the rotation zoom after the tie, surgeon's view of the
// shared incision line) and two tables. Every table row names the ledger segment of ../check.js its numbers come from (third element);
// the layout takes the source from that ledger entry and stops with an error when a number of the row is not in that segment.
{
  const L = { side: 'L' }, Rr = { side: 'R' };
  const cutDim = V => [V.P(V.r.DP.at(0, -0.3)), V.P(V.r.DP.at(LID.S_CUT, -0.3))];
  const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], NM = ['外', '中', '內'];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規，二次手術依主治',
    sources: ['Cruz 2015a', 'Cruz 2023', 'Tucker 2000'],
    figH: 73,
    figures: [
      { w: 92, kind: 'sag', state: { ...INC }, win: { x: -28, y: -25, w: 34, h: 28 }, red: 'none', labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5, x: 57, y: 4.5 },
        dims: [{ from: V => cutDim(V)[0], to: V => cutDim(V)[1], w: 0.4, label: ['瞼板切開：離瞼緣 3 mm（文獻 Cruz 2015a）', '', L] }],
        draw: V => `<circle cx="${V.A.incLo[0]}" cy="${V.A.incLo[1]}" r="1" fill="#fff" stroke="#000" stroke-width="0.5"/>`,
        labels: [['腱膜前脂肪', 'fat', 'fat', L], ['眶隔', 'septum', 'septum', L], ['切口 4 mm（院內常規）', '', 'incLo', L], ['睫毛', 'lashes', 'lash', L],
          ['提上瞼肌', 'levator', levAt, Rr], ['腱膜', 'aponeurosis', 'apo', Rr], ['穆勒氏肌', 'Müller', 'muller', Rr], ['瞼板', 'tarsus', 'tarsus', Rr]] },
      { w: 58, kind: 'sag', state: ROTD, win: WIN.rotSag, red: 'none', labelOpts: { gap: 5.2, y1: 24 }, scale: { mm: 1 }, overlays: [{ cut: tarsotomy }],
        labels: [['瞼板切開', 'tarsotomy', V => V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR * 0.5)), Rr], ['埋線', 'buried suture', 'suture', Rr]] },
      { w: 116, kind: 'cor', state: { ...PRE, ...INC, excMark: 1e-6 }, win: { x: -15, y: -12.5, w: 29, h: 18.2 }, red: 'none',
        labelOpts: { gap: 5.1, y0: 2, y1: 21 }, scale: { mm: 5 }, overlays: [{ inc: PRINT.along('excLoY', -12.4, 9.8) }],
        dims: X.map((x, i) => ({ from: V => V.P([x, V.r.lashY(x)]), to: V => V.P([x, V.r.excLoY(x)]), w: 0.3, label: [`${NM[i]} ${H[i]} mm`] })),
        labels: [['切口線＝rotation 與 levator 共用', 'lid crease incision', V => V.P([-3, V.r.excLoY(-3)])]] },
    ],
    bottom: '86mm 1fr 50mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['切口：rotation 與 levator 共用', '距睫毛線 內 2.5／中 4／外 4 mm', '2-1'], ['二次手術：切口位置、疤痕的剝離', '依主治', '2-1'],
        ['Rotation：瞼板切開位置、針數、縫線', '依院內常規（圖為示意）', '2-3'], ['要不要做 levator advancement', '依術中高度，主治決定', '3-1'],
        ['若做：切口上方切除皮膚肌肉', '寬 5 mm', '3-1'], ['若做：levator → 瞼板', '4-0 vicryl ×3', '3-1'], ['若做：levator → orbicularis', '6-0 Prolene ×4', '3-2'], ['縫皮', '7-0 ethilone', '3-2']] },
      { head: '文獻的數字', src: true, rows: [
        ['Lid crease rotation：瞼板切開', '離瞼緣 3 mm；15 號刀＋Westcott；6-0 vicryl 三針埋線', '2-2；2-3'],
        ['只轉瞼緣', '60 片中 1 片位置正確，內側仍有 2 根碰角膜', '1-1'],
        ['Ptosis 手術後 entropion（10 位）', '瞼板摺在上三分之一 70%；9 位從 lid crease 前路', '1-2'],
        ['Ptosis 修復後閉不緊', '第 1 天 60%、1 週 33%、6–20 週 9%', '6'],
        ['Lid crease rotation 的追蹤', '平均只追蹤 3 個月', '6']] },
    ],
    legend: { rows: ['inc', 'cut'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央；中圖＝瞼緣放大、rotation 綁緊後）：左＝前　上＝上', '<b>右圖 術者視角</b>（正面）：面對病人，左＝temporal　右＝nasal（OD 圖；本台 OS 左右相反）'] },
  });
}
