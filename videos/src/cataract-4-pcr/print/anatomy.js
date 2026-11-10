// 關鍵解剖與數字速查: three figures — the 11–5 section through the main incision with the phaco on the last piece (1-1: the posterior
// capsule about 3.5 µm with the anterior hyaloid face right behind it), the pars plana option (5-2 lines 2–3: 3.5 mm behind the limbus, the
// site 示意) and the 11 o'clock periphery with a 3-piece IOL in the sulcus (6-1: sulcus = behind the iris, in front of the anterior capsule;
// 示意) — and two tables. Every table row names the ledger segment of ../check.js its numbers come from (third element); the layout takes the
// source from that ledger entry and stops with an error when a number of the row is not in that segment. Machine settings: no numbers
// (the video gives none; 依院內機器設定).
{
  const Ls = { side: 'L' }, Rs = { side: 'R' }, cv = s => K.norm(s);
  const hapPt = st => V => { const IO = K.iolOf(cv(st)), n = [V.r.pl.U[1], -V.r.pl.U[0], 0]; let best = null;
    for (const H of IO.haps) for (const p of H) { const d = Math.abs((p[0] - V.r.pl.O[0]) * n[0] + (p[1] - V.r.pl.O[1]) * n[1]), q = G.toPlane(V.r.pl, p); if (q[0] < -3.2 && (!best || d < best[0])) best = [d, q]; }
    return best ? V.P(best[1]) : null; };
  const capAt = (st, r) => V => { const c = cv(st), Bb = K.bagOf(c), S = K.lensShift(c), z = Bb.zA(r) + K.liftZ(c, r) + S.LO[2], d = G.clockDir(CASE.main.h);
    return P3(V, [S.LO[0] + d[0] * r, S.LO[1] + d[1] * r, z]); };
  const tool0 = st => V => { const c = cv(st), g = K.instGeom(c, c.inst[0]);
    return g.segs.map(q => { const a = P3(V, q.a), b = P3(V, q.b), w = Math.max(0.35, 2 * q.r * V.k); return `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`; }).join(''); };
  const tip0 = (st, d) => V => { const c = cv(st), g = K.instGeom(c, c.inst[0]); return P3(V, [g.tip[0] + g.axis[0] * d, g.tip[1] + g.axis[1] * d, g.tip[2] + g.axis[2] * d]); };
  const post = (r, dz = 0) => V => { const d = G.clockDir(HP); return P3(V, [r * d[0], r * d[1], L0.zPost(r) + dz]); };
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；機器設定、備品與流程依院內常規',
    sources: ['Barraquer 2006', 'Rajan 2025', 'Suryawanshi 2016', 'Suto 2003', 'Chang 2009', 'Rothman 2026', 'Vanner 2014', 'Ferris 2020'],
    ledger: { '11': '結構', '5': '結構', '3': '結構', '12': '結構' },
    figH: 62,
    figures: [
      { w: 104, kind: 'csec', hp: HP, state: NORM, win: { x: -9.1, y: -14.2, w: 18.2 }, scale: { mm: 2, x: 24 },
        draw: tool0(NORM), labelOpts: { sides: true, gap: 5.0, y0: 1 },
        labels: [['主切口 11 點', 'main', 'mainPivot', Ls], ['phaco', '', tip0(NORM, 3.0), Ls], ['虹膜', 'iris', 'pm-', Ls], ['zonule', '', 'azi-', Ls], ['赤道', 'equator', 'eq-', Ls],
          ['角膜', 'cornea', [2.5, -(G.keyPoints({}).apexZ - 0.25)], Rs], ['最後一塊核', 'last piece', 'frag', Rs], ['前囊', 'anterior capsule', [3.2, -(L0.zAnt(3.2) + 0.02)], Rs],
          ['後囊 約 3.5 µm', 'posterior capsule', 'postPole', Rs], ['前玻璃體面（緊貼後囊）', '', post(2.2, -0.12), Rs]] },
      { w: 86, kind: 'csec', hp: HP, state: PPS, win: { x: -9.6, y: -14.4, w: 17.6 }, cut: true, scale: { mm: 2, x: 16 },
        draw: all(tool0(PPS), lb('角膜緣後 3.5 mm', 'pars plana', 'L', 6, 'sclerotomy')), labelOpts: { sides: true, gap: 5.0, y0: 1 },
        labels: [['23G vitrector', '', 'tip0', Rs], ['玻璃體（TA 染色）', '', 'vitMid', Rs], ['破口', 'rent', 'rentC', Rs]] },
      { w: 78, kind: 'csec', hp: HP, state: SUL3, win: { x: -6.7, y: -11.05, w: 5.4 }, step: 0.01, light: 0.85, scale: { mm: 1 },
        draw: all(lb('虹膜', 'iris', 'R', 6, 'pm-'), lb('optic', '', 'R', 24, 'optEdge-'), lb('haptic 在 sulcus', '', 'L', 40, hapPt(SUL3)), lb('前囊', 'anterior capsule', 'L', 47, capAt(SUL3, 3.9))) },
    ],
    bottom: '78mm 1fr 44mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['Dispersive OVD', '種類依院內常規', '3-1'], ['Backup IOL', '3-piece（PMMA haptic）；型號與度數依院內', '6-2'],
        ['前段玻璃體切除', '切速、吸力、瓶高依院內機器設定', '5-2'], ['TA', '是否常規備、怎麼配依院內', '5-5'], ['轉 VR', '院內流程與聯絡方式', '7-2']] },
      { head: '文獻的數字', src: true, rows: [
        ['後囊中央（後極）', '約 3.5 µm', '1-1'],
        ['PCR 發生在哪一步（綜論）', '乳化核 58–60%；I/A 約 25%', '1-1'],
        ['訓練系列的 PCR', '移除核塊 1.7%；吸皮質 2.8%', '1-1'],
        ['經 pars plana', '角膜緣後 3.5–4 mm；23／25G', '5-2'],
        ['皮質：vitrector 低切速', '400–600 次／分', '5-1'],
        ['Sulcus（正常眼軸）', 'optic 往前 0.62–0.75 mm；度數 −1.00 D', '6-2'],
        ['One-piece 放 sulcus', '轉診 30 人：93% 要再手術', '6-2'],
        ['核碎片留存', '6105 眼：第一週眼壓飆高 12.5%', '7-2'],
        ['玻璃體切除的時機', '當天 vs 3–14 天內沒有明顯差別 → 儘快轉 VR', '7-2'],
        ['模擬器', '第 1–2 年住院醫師 PCR 4.2% → 2.6%（相關）', '8']] },
    ],
    legend: { rows: [], orient: ['<b>三張圖</b>：經主切口的 11–5 切面，左＝11 點（主切口）　上＝前', '<b>左</b>：phaco 吃最後一塊核', '<b>中</b>：經 pars plana（切口鐘點為示意）', '<b>右</b>：放大 11 點周邊，3-piece 在 sulcus（虹膜後、前囊前；位置為示意）', '灰色桿＝器械'] },
  });
}
