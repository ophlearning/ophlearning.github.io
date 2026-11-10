// 關鍵解剖與數字速查: three figures — the 12–6 section through the main incision with the cortex left after the nucleus (1-1: under the rim, at
// the equator and on the peripheral posterior capsule; thicker under the incision, 示意), the same section with the IOL in the bag at the end
// (4-4 / 5-1: the bag closed on the optic), and the surgeon's view of the target (4-4: centred, the rhexis edge on the optic all round) — and two
// tables. Every table row names the ledger segment of ../check.js its numbers come from (third element); the layout takes the source from that
// ledger entry and stops with an error when a number of the row is not in that segment.
{
  const Ls = { side: 'L' }, Rs = { side: 'R' };
  const SA = { cat: { ...BASE, bag: { cortex: FULL(), sub: 1 } } }, SB = FIN({}), SC = FIN({});
  const frontOptic = (st, r, h) => V => { const IO = K.iolOf(K.norm(st)), d = G.clockDir(h); return P3(V, [IO.O[0] + r * d[0], IO.O[1] + r * d[1], IO.O[2] + K.optHalf(r) + 0.03]); };   // the rhexis edge lying on the optic (the bag closed)
  const behindOptic = (st, r) => V => { const IO = K.iolOf(K.norm(st)), d = G.clockDir(HP); return P3(V, [IO.O[0] + r * d[0], IO.O[1] + r * d[1], IO.O[2] - K.optHalf(r) - 0.08]); };
  const hapLeft = st => V => { const IO = K.iolOf(K.norm(st)); let b = null; for (const H of IO.haps) for (const p of H) { const q = P3(V, p); if (q[0] > 3 && q[1] > 3 && q[1] < V.h - 3 && (!b || q[0] < b[0])) b = q; } return b; };
  // where a haptic crosses the 12–6 plane (the projection's tip lies off the plane), as draw.js hapCross
  const hapCross = st => V => { const IO = K.iolOf(K.norm(st)), n = G.clockDir(HP + 3); let b = null; for (const H of IO.haps) for (const p of H) { const d = Math.abs(p[0] * n[0] + p[1] * n[1]), q = P3(V, p); if (q[0] > 1 && q[0] < V.w / 2 && (!b || d < b[0])) b = [d, q]; } return b[1]; };
  const optEdge = (st, h) => V => { const IO = K.iolOf(K.norm(st)); let b = null; for (const p of IO.ring) { const q = P3(V, p), d = G.clockDir(h), t = P3(V, [IO.O[0] + 3 * d[0], IO.O[1] + 3 * d[1], p[2]]); if (!b || Math.hypot(q[0] - t[0], q[1] - t[1]) < b[0]) b = [Math.hypot(q[0] - t[0], q[1] - t[1]), q]; } return b[1]; };
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；IOL、器械與收尾的做法依院內常規',
    sources: ['Suryawanshi 2016', 'Miyoshi 2022', 'Osawa 2021', 'Vass 1999', 'Chang 2009', 'Biro 2006', 'Liu 2023', 'Dooley 2006', 'Hollick 1999', 'Haripriya 2025'],
    ledger: { '12': '結構', '6': '結構' },
    figH: 80,
    figures: [
      { w: 100, kind: 'csec', hp: HP, state: SA, win: { x: -6.6, y: -13.4, w: 13.2 }, scale: { mm: 2, x: 16 },
        draw: all(lb('角膜', 'cornea', 'R', 5, V => P3(V, [0, 0, G.keyPoints({}).apexZ - 0.25])), lb('主切口', '', 'L', 21, 'mainPivot'), lb('虹膜', 'iris', 'L', 28, 'pm-'),
          lb('赤道', 'equator', 'L', 46, 'eq-'), lb('主切口下方較厚（示意）', '', 'L', V => V.h - 9, V => capP(V, SA, 3.4, CASE.main.h, -0.3)),
          lb('前囊邊緣下的皮質', '', 'R', 14, V => capP(V, SA, 3.5, HP, -0.12)), lb('周邊後囊上的皮質', '', 'R', V => V.h - 13, V => P3(V, (() => { const d = G.clockDir(HP); return [3.6 * d[0], 3.6 * d[1], L0.zPost(3.6) + 0.12]; })())),
          lb('後囊', 'posterior capsule', 'R', V => V.h - 6, 'postPole')) },
      { w: 92, kind: 'csec', hp: HP, state: SB, win: { x: -5.3, y: -12.4, w: 10.6, h: 8.0 }, scale: { mm: 2 },
        draw: all(lb('CCC 邊緣蓋在 optic 上', 'rhexis', 'L', 6, frontOptic(SB, CN.cccD / 2, CASE.main.h)), lb('optic 在囊袋裡', 'optic', 'R', 13, 'iolC'),
          lb('haptic（投影）', '', 'L', V => V.h - 12, hapCross(SB)), lb('後囊貼回 optic', 'bag', 'R', V => V.h - 12, behindOptic(SB, 1.8))) },
      { w: 80, kind: 'cscope', state: SC, win: { x: -4.4, y: -4.4, w: 8.8, h: 8.8 },
        labelOpts: { sides: true, gap: 5.0, y0: 1 },
        labels: [['CCC 邊緣', 'rhexis', V => P3(V, under(4.6, CN.cccD / 2, 0)), Ls], ['optic 邊緣 6.0 mm', '', optEdge(SC, 7.4), Rs], ['置中', 'centred', 'iolC', Rs], ['haptic', '', hapLeft(SC), Ls]] },
    ],
    bottom: '80mm 1fr 46mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['IOL 型號', '依院內（模型：一款 one-piece）', '4-2'], ['I/A tip', '依院內（本例：彎頭 coaxial tip）', '1-3'],
        ['Injector、OVD', '依院內常規', '4-1'], ['收尾', 'stromal hydration 或 swab pressing', '5-3'], ['收尾前', '確認前房深、切口不漏', '5-4']] },
      { head: '文獻的數字', src: true, rows: [
        ['訓練中 PCR', '吸皮質時 2.8%；移除核塊 1.7%', '1-1'],
        ['Hydro-dispersion（60 眼）', '56/60 眼成功', '2-2'],
        ['一款 one-piece IOL', 'optic 6.0、全長 13.0 mm', '4-2'],
        ['囊袋直徑（in vivo）', '約 10.4 mm', '4-2'],
        ['One-piece 放 sulcus（30 人）', '93% 要再手術', '4-5'],
        ['只清前房 vs 連後面一起清', '118 眼：只清前房的術後眼壓較高', '5-1'],
        ['Swab vs hydration（126 眼）', '閉合 96.8% vs 93.7%；前房塌陷 0 vs 35 眼', '5-3'],
        ['I/A 的自評難度', '2.80／5；完成率 78.4%', '7']] },
    ],
    legend: { rows: [], orient: ['<b>左、中圖</b>：經主切口的 12–6 切面，左＝主切口　上＝前', '<b>右圖 術者視角</b>：下＝12 點　右＝temporal', '皮質的分布與厚度、囊袋貼回的樣子：示意'] },
  });
}
