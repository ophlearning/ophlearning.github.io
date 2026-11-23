// 關鍵解剖與數字速查: three figures (sagittal layers with the lesion and the excision depth, the margin zoom with the follicle depth of
// Elder 1997, the surgeon's view with the two possible positions) and three tables. Rows of the literature table name the ../check.js
// LEDGER key their numbers come from (third element); the layout takes the source from it and stops when a number is not there.
{
  const W = WART, F = EPI, L = { side: 'L' }, Rr = { side: 'R' };
  // follicle depth along the follicle from the lash exit (Elder 1997: 1.8 mm) and the depth that reaches 95 % of follicles (2.4 mm)
  const n = [F.d[1], -F.d[0]], o = n[0] < 0 ? n : [-n[0], -n[1]], fa = [F.E[0] + o[0] * 0.25, F.E[1] + o[1] * 0.25], fb = [fa[0] + F.d[0] * EP.follicleUp, fa[1] + F.d[1] * EP.follicleUp];
  const q = [F.E[0] + F.d[0] * EP.reach95Up, F.E[1] + F.d[1] * EP.reach95Up], qa = [q[0] + n[0] * 0.5, q[1] + n[1] * 0.5], qb = [q[0] - n[0] * 0.5, q[1] - n[1] * 0.5];
  const top = SAG.S(SAG.qc).map((v, i) => v + SAG.nrm(SAG.qc)[i] * W.h);
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規；病灶位置與大小為示意',
    sources: ['Kersten 1997', 'Elder 1997', 'Sullivan 1976', 'Custer 2024', 'Wingfield 1979'],
    figH: 73,
    figures: [
      { w: 92, kind: 'sag', state: ST, win: { x: -19.5, y: -14, w: 15, h: 13.5 }, red: 'none', labelOpts: { sides: true, gap: 5.1 }, scale: { mm: 5 },
        overlays: [{ inc: V => SAG.cut.map(V.P), w: 0.5, dash: '1.0 0.6' }],
        draw: V => DR.lesion(V, SAG.lesion),
        labels: [['病灶在皮膚面（示意）', '', V => V.P(top), L], ['切除深度：orbicularis 之上（示意）', '', V => V.P(SAG.S(SAG.qc + W.w / 2 + 0.25, W.dEx)), L], ['睫毛', 'lashes', 'lash', L],
          ['眼輪匝肌', 'orbicularis', V => V.P(SAG.S(SAG.qc + 3.2, 0.62)), Rr], ['眶隔', 'septum', 'septum', Rr], ['瞼板', 'tarsus', 'tarsus', Rr], ['毛囊', 'follicle', 'follicle', Rr], ['角膜', 'cornea', 'cornea', Rr]] },
      { w: 58, kind: 'sag', state: ST, win: { x: F.E[0] - 2.2, y: F.E[1] - 2.6, w: 5, h: 7.2 }, red: 'none', labelOpts: { gap: 5.2, y1: 66 }, scale: { mm: 1 },
        dims: [{ from: fa, to: fb, w: 0.4, label: [`毛囊深 ${EP.follicleUp} mm`, ''] }, { from: qa, to: qb, w: 0.6, label: [`插 ${EP.reach95Up} mm：碰到 95%`, ''] }],
        labels: [['睫毛出口', 'lash exit', V => V.P(F.E)], ['瞼板', 'tarsus', V => V.A.tarsusZ || V.A.tarsus]] },
      { w: 116, kind: 'cor', state: ST, win: { x: -15, y: -13.5, w: 30, h: 20 }, red: 'none', labelOpts: { gap: 5.1 }, scale: { mm: 5 },
        draw: V => DR.lesion(V, COR.blob(COR.c, COR.r)) + `<path d="${PRINT.pth(COR.circ(COR.cM, COR.rM + 0.2).map(V.P))}Z" fill="none" stroke="#000" stroke-width="0.4" stroke-dasharray="0.9 0.6"/>`,
        labels: [['皮膚面病灶（示意）', 'skin surface', V => V.P([COR.c[0] + COR.r, COR.c[1]])], ['或在瞼緣（示意）', 'lid margin', V => V.P([COR.cM[0] + COR.rM + 0.2, COR.cM[1]])],
          ['睫毛線', 'lash line', V => V.P([-8, V.r.lashY(-8)])], ['後瞼緣', 'posterior margin', V => V.P([-6, V.r.Uy(-6)])], ['角膜', 'cornea', [5.2, 2.5]]] },
    ],
    bottom: '52mm 1fr 56mm 40mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['位置／大小', '[瞼緣／皮膚面]、[　] mm（手寫）', 'case'], ['局麻', '藥物、劑量', 'case'], ['切除', 'shave 或 excision', 'case'],
        ['冷凍', '機器、freeze–thaw 次數與時間', 'case'], ['保護眼球', '保護片等', 'case'], ['傷口', '止血、縫或不縫、藥膏', 'case']] },
      { head: '文獻的數字', src: true, rows: [
        ['臨床看似良性的眼瞼病灶', '692 個中 13 個（1.9%）是惡性，10 個是 BCC', 'path'],
        ['上眼瞼睫毛毛囊', '深 1.8 mm；碰到 95% 要插 2.4 mm', 'follicle'],
        ['瞼緣冷凍破壞睫毛（trichiasis）', '2 個 freeze–thaw 到 −30 °C', 'lash'],
        ['瞼緣 nevus', '150 個：superficial excision＋cauterization；術後可見 trichiasis', 'margin']] },
      { head: '冷凍的副作用（Wingfield 1979）', rows: [
        ['早期', '充血、紅、水泡、水腫', 'case'], ['晚期', '色素脫失、睫毛與瞼板腺流失、眼瞼變形、疤痕', 'case'], ['眼球', '傷害見於治療結膜、角膜病灶時', 'case']] },
    ],
    legend: { rows: ['inc'], orient: ['<b>左、中圖 矢狀切面</b>（瞳孔中央；中圖＝瞼緣放大）：左＝前　上＝上', '<b>右圖 術者視角</b>：面對病人，左＝temporal　右＝nasal', '虛線＝切除深度或位置（示意）'] },
  });
}
