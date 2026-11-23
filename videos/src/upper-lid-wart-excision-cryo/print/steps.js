// 手術步驟圖: one cell per checklist item; left = sagittal section through the pupil centre (mechanism), right = surgeon's view, the
// same moment. The lesion, excision line, needle, shield, probe and ice ball are drawn on the eyelid model at rest (video.js; all 示意).
{
  const W = WART, top = q => SAG.S(q).map((v, i) => v + SAG.nrm(q)[i] * W.h), mid = P => P[Math.floor(P.length / 2)];
  const lesS = V => DR.lesion(V, SAG.lesion), lesC = V => DR.lesion(V, COR.blob(COR.c, COR.r));
  const woundS = V => DR.wound(V, SAG.wound), woundC = V => DR.wound(V, COR.circ(COR.c, COR.r + W.margin));
  const cutS = { cut: V => SAG.cut.map(V.P) }, cutC = { cut: V => COR.circ(COR.c, COR.r + W.margin).map(V.P), w: 0.6 };
  const orbAt = [SAG.S(SAG.qc + 3.2, 0.62)], frozen = SAG.dome(SAG.qc, W.iceR);
  const needleC = [[COR.c[0] - 5.2, COR.c[1] - 4.6], [COR.c[0] - COR.r * 0.6, COR.c[1] - COR.r * 0.7]];
  const probeTip = (V, c) => `<circle cx="${V.P(c)[0]}" cy="${V.P(c)[1]}" r="${0.55 * V.k}" fill="#9a9a9a" stroke="#000" stroke-width="0.3"/>`;
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個時刻；病灶與器械為示意',
    sources: ['Sullivan 1976', 'Wingfield 1979'], grid: [3, 3],
    legend: { rows: ['inc', 'cut'], orient: [
      '<b>左 矢狀切面</b>（瞳孔中央；第 <span data-struct="step">7</span> 步＝瞼緣放大）：左＝前　上＝上', '<b>右 術者視角</b>：面對病人，左＝temporal　右＝nasal',
      '深灰＝病灶；淡粉紅＝傷口；灰色虛線＝冰球；灰帶＝保護片', '病灶位置與大小、切除深度、冰球大小：示意'] },
    steps: [
      { hd: '核對 OD、位置、大小；畫切除範圍', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', draw: lesS,
          labels: [['病灶（示意）', 'wart', V => V.P(top(SAG.qc))], ['眼輪匝肌', 'orbicularis', orbAt[0]], ['瞼板', 'tarsus', 'tarsus'], ['睫毛', 'lashes', 'lash']] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: lesC, overlays: [{ inc: V => COR.circ(COR.c, COR.r + W.margin).map(V.P), w: 0.6 }],
          labels: [['畫切除範圍', 'mark', V => V.P([COR.c[0] + COR.r + W.margin, COR.c[1]])], ['睫毛線', 'lash line', V => V.P([4.5, V.r.lashY(4.5)])]] }] },
      { hd: '局麻：病灶下方的皮下', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', draw: V => lesS(V) + DR.needle(V, SAG.needle[0], SAG.needle[1]),
          labels: [['局麻針', 'needle', V => V.P([0, 1].map(i => SAG.needle[0][i] * 0.45 + SAG.needle[1][i] * 0.55))], ['皮下', 'subcutis', V => V.P(SAG.needle[1])]] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: V => lesC(V) + DR.needle(V, needleC[0], needleC[1]),
          labels: [['局麻針', 'needle', V => V.P([0, 1].map(i => needleC[0][i] * 0.5 + needleC[1][i] * 0.5))]] }] },
      { hd: 'Shave／excision：orbicularis 之上', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', draw: lesS, overlays: [cutS],
          labels: [['切除線', 'excision', V => V.P(SAG.S(SAG.qc + W.w / 2 + 0.2, W.dEx))], ['眼輪匝肌', 'orbicularis', orbAt[0]]] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: lesC, overlays: [cutC],
          labels: [['切除範圍', 'excision', V => V.P([COR.c[0] + COR.r + W.margin, COR.c[1]])]] }] },
      { hd: '標本全部送病理', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', overlays: [cutS],
          draw: V => { const n = SAG.nrm(SAG.qc), sp = SAG.lesion.map(p => [p[0] + n[0] * 2.6, p[1] + n[1] * 2.6]);
            return woundS(V) + DR.lesion(V, sp) + PRINT.arrow(V.P(SAG.S(SAG.qc, -0.15)), V.P([SAG.S(SAG.qc)[0] + n[0] * 2.4, SAG.S(SAG.qc)[1] + n[1] * 2.4]), { w: 0.4, head: 1.2 }); },
          labels: [['標本 → 病理', 'specimen', V => { const n = SAG.nrm(SAG.qc), t = top(SAG.qc); return V.P([t[0] + n[0] * 2.6, t[1] + n[1] * 2.6]); }], ['基底', 'base', V => V.P(SAG.S(SAG.qc - 0.6, W.dEx))]] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: woundC, overlays: [cutC],
          labels: [['基底', 'base', V => V.P(COR.c)]] }] },
      { hd: '保護眼球：保護片放在眼瞼後（示意）', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', overlays: [cutS], draw: V => woundS(V) + DR.shield(V, SAG.shield),
          labels: [['保護片', 'shield', V => V.P(SAG.shield[3])], ['角膜', 'cornea', 'cornea']] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', overlays: [cutC],
          draw: V => woundC(V) + `<path d="${PRINT.pth(COR.circ([0, 0.4], 6.6).map(V.P))}Z" fill="#b8b8b8" fill-opacity="0.35" stroke="#000" stroke-width="0.4" stroke-dasharray="1.2 0.6"/>`,
          labels: [['保護片', 'shield', V => V.P([5.2, 4.4])]] }] },
      { hd: '基底 cryotherapy：冰球蓋過基底', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', draw: V => woundS(V) + DR.ice(V, frozen) + DR.probe(V, SAG.probe(SAG.qc)),
          labels: [['冷凍探頭', 'cryoprobe', V => V.P(mid(SAG.probe(SAG.qc, 4.5)))], ['冰球', 'ice ball', V => V.P(frozen[26])]] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: V => woundC(V) + DR.ice(V, COR.circ(COR.c, W.iceR)) + probeTip(V, COR.c),
          labels: [['冰球', 'ice ball', V => V.P([COR.c[0] + W.iceR, COR.c[1] + 0.3])], ['探頭', 'probe', V => V.P(COR.c)]] }] },
      { hd: '靠近瞼緣：冰球蓋到毛囊 → 睫毛掉', views: [
        { kind: 'sag', state: ST, win: WIN.sagM, red: 'none', scale: { mm: 1 },
          draw: V => DR.ice(V, SAG.dome(SAG.qcM, W.iceRM)) + DR.probe(V, SAG.probe(SAG.qcM, 6, 0.9)),
          labels: [['毛囊', 'follicle', 'follicle'], ['冰球', 'ice ball', V => V.P(SAG.dome(SAG.qcM, W.iceRM)[28])], ['探頭', 'probe', V => V.P(mid(SAG.probe(SAG.qcM, 2.5, 0.9)))]] },
        { kind: 'cor', state: ST, win: WIN.corM, red: 'none', draw: V => DR.ice(V, COR.circ(COR.cM, W.iceRM)) + probeTip(V, COR.cM),
          labels: [['睫毛會掉', 'lash loss', V => V.P([COR.cM[0] + 1.2, COR.cM[1] + 1.4])], ['瞼緣', 'lid margin', V => V.P([4.2, V.r.Uy(4.2)])]] }] },
      { hd: '收尾：傷口照護；告知可能的副作用', views: [
        { kind: 'sag', state: ST, win: WIN.sag, red: 'none', draw: V => woundS(V) + DR.dotted(V, frozen),
          labels: [['冷凍過的範圍', 'frozen', V => V.P(frozen[26])], ['傷口', 'wound', V => V.P(SAG.S(SAG.qc - 0.6, W.dEx * 0.5))]] },
        { kind: 'cor', state: ST, win: WIN.cor, red: 'none', draw: V => woundC(V) + DR.dotted(V, COR.circ(COR.c, W.iceR)),
          labels: [['色素脫失', 'depigment', V => V.P([COR.c[0] + W.iceR, COR.c[1]])]] }] },
    ],
  });
}
