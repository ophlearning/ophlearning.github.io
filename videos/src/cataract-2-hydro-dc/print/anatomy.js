// 關鍵解剖與數字速查: three figures — the 12–6 section through the main incision with the needle at the deepest point of a finished groove
// (3-3 line 4: the ramp under the incision), the cross-section across the groove with the plate under the floor (3-1, 3-3; 示意), and the
// surgeon's view of the nucleus in four pieces (4-3 end) — and two tables. Every table row names the ledger segment of ../check.js its
// numbers come from (third element); the layout takes the source from that ledger entry and stops with an error when a number of the row is
// not in that segment. Machine numbers: only the published ones (Quesada 2022, Soule 2026); the rest 示意，依院內機器設定.
{
  const Ls = { side: 'L' }, Rs = { side: 'R' }, apexZ = G.keyPoints({}).apexZ;
  const stA = GROOVED(CASE.groove.dep), SA = { cat: { ...stA.cat, inst: [PHACO(K.grooveTip(stA))] } };
  const SB = GROOVED(depFor(1.0)), SC = { cat: { ...BASE, nuc: DIVIDED({ rot: 90, quads: [] }) } };
  const shaftA = V => { const c = K.norm(SA), g = K.instGeom(c, c.inst[0]); return P3(V, [g.tip[0] + g.axis[0] * 4.5, g.tip[1] + g.axis[1] * 4.5, g.tip[2] + g.axis[2] * 4.5]); };
  const X = V => V.r.A.grooveX, fl = V => V.P(X(V).floor), po = V => V.P(X(V).post);
  const plate = V => { const a = fl(V), b = po(V), x = a[0] - 6;
    return thin([[a[0], a[1]], [x - 0.8, a[1]]], '0.8 0.6', 0.25) + thin([[b[0], b[1]], [x - 0.8, b[1]]], '0.8 0.6', 0.25) + PRINT.dim([x, a[1]], [x, b[1]], { w: 0.35 }); };
  const width = V => { const x = X(V), a = V.P([x.floor[0] - x.hw, x.floor[1] - 0.3]), b = V.P([x.floor[0] + x.hw, x.floor[1] - 0.3]); return [a, b]; };
  const pairUp = (V, n) => { const q = (V.r.A[n] || []).map(V.P); return q.length ? (q[0][1] < q[1][1] ? q[0] : q[1]) : null; };
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；機器設定與這台的做法依院內常規',
    sources: ['Quesada 2022', 'Soule 2026', 'Wong 2000', 'Sugar 1999', 'Dooley 2006', 'Suryawanshi 2016', 'Gimbel 1991'],
    ledger: { '12': '結構', '6': '結構', '3': 'Sugar 1999' },
    figH: 82,
    figures: [
      { w: 104, kind: 'csec', hp: HP, state: SA, win: { x: -12.4, y: -15.6, w: 24.8 }, scale: { mm: 5 },
        draw: tool(SA), labelOpts: { sides: true, gap: 5.0, y0: 1 },
        labels: [['主切口', 'main incision', 'mainPivot', Ls], ['phaco', '', shaftA, Ls], ['虹膜', 'iris', 'pm-', Ls], ['zonule', '', 'azi-', Ls], ['近切口：斜坡', 'ramp', [-1.7, -(L0.zMid + 0.7)], Ls],
          ['赤道', 'equator', 'eq-', Ls], ['角膜', 'cornea', [1.5, -(apexZ - 0.25)], Rs], ['核（形狀示意）', 'nucleus', [2.6, -L0.zMid], Rs], ['槽底（最深在對側）', 'floor', 'grooveFloor', Rs],
          ['皮質', 'cortex', [4.2, -(L0.zMid + 0.2)], Rs], ['後囊', 'posterior capsule', 'postPole', Rs]] },
      { w: 78, kind: 'csec', hp: XH, off: OFFX, cut: true, state: SB, win: { x: -4.5, y: -11.6, w: 9.0 }, step: 0.02, scale: { mm: 1, x: 14 },
        draw: all(plate, V => PRINT.dim(...width(V), { w: 0.35 }), lb('寬：約 sleeve 寬', '', 'L', 8, V => width(V)[0]), lb('槽底', 'floor', 'R', 36, fl),
          lb('後板 約 1 mm', '', 'L', 44, V => [fl(V)[0] - 6, (fl(V)[1] + po(V)[1]) / 2]), lb('後囊', 'posterior capsule', 'R', 58, V => [po(V)[0] + 4, po(V)[1] - 0.3]), lb('核', 'nucleus', 'R', 8, [2.6, -L0.zMid])) },
      { w: 86, kind: 'cscope', state: SC, win: { x: -7.4, y: -7.4, w: 14.8, h: 14.8 },
        draw: all(lb('第一道裂縫', 'crack 1', 'R', 8, V => pairUp(V, 'crackEnds')), lb('第二道裂縫', 'crack 2', 'L', 8, V => pairUp(V, 'crackEnds2')),
          lb('側切口：chopper', '', 'L', 50, 'sideExt'), lb('主切口：phaco', '12 點附近', 'R', 57, 'mainExt')) },
    ],
    bottom: '80mm 1fr 46mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['機器設定', '依院內 Veritas 設定（面板為示意）', '2-1'], ['刻槽的 vacuum', '低（模型 80 mmHg，示意）', '2-1'],
        ['槽寬、槽深', '約 sleeve 寬；後板剩約 1 mm（示意）', '3-3'], ['Phaco tip、sleeve、chopper', '依院內常規（圖為示意）', '3-1'],
        ['主切口、側切口', '同 ①：12 點附近；側切口在左手側', '1-1']] },
      { head: '文獻的數字', src: true, rows: [
        ['Advanced Infusion（Veritas）', '瓶高之外再加壓 22 mmHg', '2-1'],
        ['移除核塊的 vacuum（實驗台）', '450 mmHg', '5-1'],
        ['Surge 持續（實驗台，450 mmHg）', '1.6–2.9 秒', '5-3'],
        ['Chop vs D&C（隨機試驗 117 人）', 'phaco 時間 1.2 vs 2.4 分鐘', '6-3'],
        ['Wound burn 後散光（3 例）', '+7 到 +15 D', '6-2'],
        ['Phaco 的自評難度', '3.32／5；完成率 66.7%', '7'],
        ['訓練中移除核塊時 PCR', '1.7%', '7']] },
    ],
    legend: { rows: [], orient: ['<b>左圖</b>：經主切口的 12–6 切面，左＝主切口　上＝前', '<b>中圖</b>：垂直槽的橫切面，從切口看　右＝temporal', '<b>右圖 術者視角</b>：下＝12 點　右＝temporal', '灰色桿＝器械；細虛線＝槽底與後囊的高度'] },
  });
}
