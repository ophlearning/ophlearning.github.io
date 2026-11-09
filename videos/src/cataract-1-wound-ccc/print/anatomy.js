// 關鍵解剖與數字速查: three figures (the 12–6 section through the main incision, the capsule rim at 3 o'clock, the surgeon's view of the
// finished steps; all the end state DONE of 1-1 / 4-1) and two tables. Every table row names the ledger segment of ../check.js its
// numbers come from (third element); the layout takes the source from that ledger entry and stops with an error when a number of the
// row is not in that segment.
{
  const L0 = K.LENS, Ls = { side: 'L' }, Rs = { side: 'R' }, rO = CASE.optic / 2, apexZ = G.keyPoints({}).apexZ;
  const tick = (V, r, up) => [cap(V, DONE, r, 3, 0.1), cap(V, DONE, r, 3, up)];
  const band = V => { const q = []; for (let r = CASE.ccc.r; r <= rO + 1e-9; r += 0.025) q.push(cap(V, DONE, r, 3, 0.06)); return q; };
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Ernest 1995', 'Ernest 1994', 'Masket 2007', 'Sonmez 2020', 'Hollick 1999', 'Fairaq 2025', 'Yaguchi 2017', 'Dooley 2006', 'Ferris 2020'],
    ledger: { '12': '結構', '3': '結構', '360': '結構' },
    figH: 66,
    figures: [
      { w: 104, kind: 'csec', hp: HP, state: DONE, win: { x: -12.4, y: -15.2, w: 24.8 }, overlays: [{ inc: tunnel(MAIN) }], scale: { mm: 5 },
        labelOpts: { sides: true, gap: 5.0, y0: 1 },
        labels: [['主切口', 'main incision', 'mainPivot', Ls], ['前房 OVD', '', [-3.0, -(L0.za + 1.1)], Ls], ['虹膜', 'iris', 'pm-', Ls], ['zonule 附著', '', 'azi-', Ls], ['赤道', 'equator', 'eq-', Ls],
          ['角膜', 'cornea', [1.5, -(apexZ - 0.25)], Rs], ['撕囊後的開口', 'capsulorhexis', [1.0, -(L0.za + 0.02)], Rs], ['前囊', 'anterior capsule', V => cap(V, DONE, 3.4, HP)], ['核（形狀示意）', 'nucleus', [1.2, -L0.zMid], Rs],
          ['皮質', 'cortex', [3.6, -(L0.zMid + 0.2)], Rs], ['後囊', 'posterior capsule', 'postPole', Rs]].map(l => l.length === 3 ? [...l, Rs] : l) },
      { w: 78, kind: 'csec', hp: 3, state: DONE, win: { x: 1.0, y: -12.2, w: 4.6 }, scale: { mm: 1, x: 24 },
        overlays: [{ cut: V => tick(V, CASE.ccc.r, 0.62), w: 0.7 }, { cut: V => tick(V, rO, 0.45), w: 0.4 }, { cut: V => tick(V, K.R_AZI, 0.3), w: 0.4 }],
        draw: all(V => thin(band(V), '', 0.9), lb('撕囊邊緣', 'CCC edge', 'L', 8, V => tick(V, CASE.ccc.r, 0.62)[1]), lb('IOL optic 邊緣（放好後）', '', 'R', 16, V => tick(V, rO, 0.45)[1]),
          lb('zonule 附著', 'insertion', 'R', 24, V => tick(V, K.R_AZI, 0.3)[1]), lb('虹膜（瞳孔緣）', 'iris', 'R', 32, 'pm+'),
          lb('前囊蓋住 optic 邊緣', 'overlap', 'L', 50, V => cap(V, DONE, (CASE.ccc.r + rO) / 2, 3, 0.06)), lb('赤道', 'equator', 'R', 42, 'eq+')) },
      { w: 86, kind: 'cscope', state: DONE, win: { x: -7.4, y: -7.4, w: 14.8, h: 14.8 }, overlays: [{ cut: edge(DONE) }, { inc: mouth(MAIN), w: 0.9 }, { inc: mouth(SIDE), w: 0.9 }],
        draw: V => { const a = V.P(V.r.M([CASE.ccc.r, -0.4, 0])), b = V.P(V.r.M([-CASE.ccc.r, -0.4, 0]));
          return thin(circle(V, rO)) + PRINT.dim(a, b, { w: 0.35 }) + PRINT.txt((a[0] + b[0]) / 2, a[1] - 1.6, 'CCC 5.0–5.5 mm', { bold: true, anchor: 'middle' }) +
            all(lb('IOL optic 6.0 mm', '', 'L', 8, V => V.P(V.r.M([rO * 0.71, -rO * 0.71, 0]))), lb('撕囊邊緣', 'CCC edge', 'R', 8, V => P3(V, K.capPt(K.norm(DONE), CASE.ccc.r, 7.5))),
              lb('側切口', 'side port', 'L', 57, 'sideExt'), lb('主切口（12 點附近）', 'main', 'R', 57, 'mainExt'))(V); } },
    ],
    bottom: '80mm 1fr 46mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['主切口寬', '依院內 keratome（模型 2.4 mm）', '3-1'], ['Superior 隧道長度取捨', '依院內常規', '3-2'],
        ['IOL optic 直徑', '6.0 mm（型號待確認）', '1-1'], ['Side port', '左手側（右眼坐 12 點＝nasal）', '1-1'],
        ['器械、OVD 種類', '依院內常規（圖為示意）', '3-1']] },
      { head: '文獻的數字', src: true, rows: [
        ['隧道長（屍眼）', '1.75–2.0 mm；長≈寬＝方形', '3-1'],
        ['方形 vs 長方形（屍眼）', '2.0×2.0 mm 耐壓 525 psi；3.2×2.0 mm 13 psi 就漏', '3-2'],
        ['方形切口', '60 人：沒有術後低眼壓、沒有漏', '3-2'],
        ['Superior 長隧道', '126 人中 SIA 最大', '3-2'],
        ['CCC 目標（6.0 mm optic 換算）', '5.0–5.5 mm、置中、360° 蓋住 optic', '4-1'],
        ['撕囊大小與 PCO（隨機試驗）', '1 年：4.5–5 mm 32.7%；6–7 mm 66.2%', '4-1'],
        ['Zonule 弱的撕囊大小', '約 5–6 mm（太大易裂、太小易收縮）', '4-3'],
        ['撕囊開始時前囊位移', '402 眼：＜0.2／0.2–0.39／＞0.4 mm', '4-3'],
        ['CCC 自評難度', '3.30／5；完成率 74.4%', '7'],
        ['有 Eyesi 之後（觀察性）', '第 1–2 年 PCR 4.2% → 2.6%', '7']] },
    ],
    legend: { rows: ['inc', 'cut'], orient: ['<b>左圖</b>：經主切口的切面，左＝主切口　上＝前', '<b>中圖</b>：3 點方向的切面，右＝周邊', '<b>右圖 術者視角</b>：下＝12 點　右＝temporal', '細虛線＝IOL optic（放好後的位置）'] },
  });
}
