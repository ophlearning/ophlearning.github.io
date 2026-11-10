// 手術步驟圖: one cell per checklist item; left = the model's 11–5 section through the main incision (mechanism; left = 11 o'clock), right =
// the surgeon's view (microscope, LEFT eye OS, surgeon at 12: 下＝12 點、右＝9 點 nasal, never mirrored), the same state, as the video shows
// it on the model (anim/draw.js segment in brackets). Cell 8 shows two zoomed sections (6-1). Anchors: 'name' = the model's anchor, [x, y] =
// model mm, V => figure mm. The model's own colours are drawn light; instruments (grey rods) and the normal chamber level (thin dashed) are
// the print overlays. Rent, gel, piece and OVD shapes and amounts are 示意, as in the video (動畫示意).
{
  const cv = s => K.norm(s);
  // label anchors ported from anim/draw.js (figure mm): the rent's far edge in the microscope (the clear area), a point inside it, the
  // piece's pole nearest the rent, a point on instrument i, where instrument i crosses the section, the rent's end in the section,
  // a haptic where it crosses the section on the 11 o'clock side, a point of the anterior capsule at lens radius r (11 o'clock side)
  const clearPt = V => { const E = V.r.A.rentEdge, F = V.r.A.frag; if (!E) return null; const f = F || E[0]; let b = E[0];
    for (const q of E) if (Math.hypot(q[0] - f[0], q[1] - f[1]) > Math.hypot(b[0] - f[0], b[1] - f[1])) b = q; return V.P(b); };
  const clearIn = V => { const c = clearPt(V), rc = V.A.rentC; return c && rc ? [lerp(c[0], rc[0], 0.3), lerp(c[1], rc[1], 0.3)] : c; };
  const pole = st => V => { const P = K.pcrOf(cv(st)), F = P.FR; let best = null; const tgt = P.R.c3;
    for (const q of F.pts) { const d = Math.hypot(q[0] - tgt[0], q[1] - tgt[1]); if (!best || d < best[0]) best = [d, q]; } return P3(V, best[1]); };
  const instPt = (st, i, d = 0.6) => V => { const c = cv(st), g = K.instGeom(c, c.inst[i]), o = g.bend && d > G.len(G.sub(g.bend, g.tip)) ? g.bend : g.tip, ax = g.bend && o === g.tip ? G.unit(G.sub(g.bend, g.tip)) : g.axis;
    return P3(V, [o[0] + ax[0] * d, o[1] + ax[1] * d, o[2] + ax[2] * d]); };
  const crossPt = i => V => { const g = V.r.A['inst' + i], pl = V.r.pl, n = [pl.U[1], -pl.U[0], 0], d = G.dot(G.sub(g.tip, pl.O), n), k = G.dot(g.axis, n); return P3(V, G.add(g.tip, g.axis, -d / k)); };
  const rentEnd = V => { const E = V.r.A.rentEnds || []; return E.length ? V.P(E[E.length - 1]) : null; };
  const hapPt = st => V => { const IO = K.iolOf(cv(st)), n = [V.r.pl.U[1], -V.r.pl.U[0], 0]; let best = null;
    for (const H of IO.haps) for (const p of H) { const d = Math.abs((p[0] - V.r.pl.O[0]) * n[0] + (p[1] - V.r.pl.O[1]) * n[1]), q = G.toPlane(V.r.pl, p); if (q[0] < -3.2 && (!best || d < best[0])) best = [d, q]; }
    return best ? V.P(best[1]) : null; };
  const capAt = (st, r) => V => { const c = cv(st), Bb = K.bagOf(c), S = K.lensShift(c), z = Bb.zA(r) + K.liftZ(c, r) + S.LO[2], d = G.clockDir(CASE.main.h);
    return P3(V, [S.LO[0] + d[0] * r, S.LO[1] + d[1] * r, z]); };
  const toolI = (st, idx) => V => { const c = cv(st), rod = (a, b, w) => `<path d="${PRINT.pth([a, b])}" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([a, b])}" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
    return idx.map(i => K.instGeom(c, c.inst[i]).segs.map(q => rod(P3(V, q.a), P3(V, q.b), Math.max(0.35, 2 * q.r * V.k))).join('')).join(''); };
  // windows (model mm; section: x = toward 5 o'clock, y = −depth; scope: the microscope map), cell figures are about 38 × 41 mm on LSs
  const W_S = { x: -4.4, y: -13.3, w: 8.8, h: 8.6 }, W_SD = { x: -4.6, y: -13.4, w: 9.2, h: 8.8 }, W_O = { x: -4.8, y: -4.9, w: 9.6, h: 9.8 };
  const W_Z = { x: -6.4, y: -10.4, w: 4.0, h: 3.0 };
  // 1 a sudden deep chamber and a wide pupil (2-1 line 2, 動畫示意); the dashed line = the normal lens front (NORM, the same plane)
  const S1 = pcrSt({ deep: 1, sink: 0, vit: { bulge: 1 } });
  const ant0 = V => V.P(K.section({ st: NORM, h: HP, win: { x: -6, y: -13, w: 12, h: 10 }, step: 0.2, id: 'pn0' }).A.antPole);
  const level = V => { const a = ant0(V), b = V.A.antPole; return thin([[a[0] - 9, a[1]], [a[0] + 9, a[1]]], '1.1 0.7', 0.35) + arw([a[0] + 7.5, a[1] + 0.3], [a[0] + 7.5, Math.max(a[1] + 2.4, b[1])]); };
  // 2 the piece off the tip, one pole into the rent; the clear area of the rent (2-5)
  const S2 = pcrSt({ vit: { prolapse: 0.6, to: 'tip' } });
  // 3 first step: the phaco stays, dispersive OVD through the side port over the rent (3-1 end)
  const S3 = FIRST(1);
  // 4 the same at I/A: the I/A stays, OVD through the side port (3-4 end)
  const S4 = cat({ bag: { cortex: K.cortexSweep(0.5, HP, 1), sub: 1 }, pcr: { rent: RENT, ovdD: { tamp: 1 } }, inst: [IA(P_RIM5), OVDCAN] });
  // 5 assess: the rent, the piece, the gel (3-5)
  const S5 = cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 1 }, ovdD: { tamp: 1 }, frag: { ...PIECE, sink: 1 } } });
  // 6 the piece on dispersive OVD, a blunt instrument under it, low-energy phaco on its edge (4-1)
  const S6 = FLT(0.25);
  // 7 bimanual limbal anterior vitrectomy: cutter at the rent (main incision), irrigation high in the chamber (side port) (5-2 line 1)
  const S7 = VIT(0.45, 0);
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖：PCR', sub: '左＝切面（機轉）　右＝術者視角，同一個狀態；形狀與量為示意',
    sources: ['Rajan 2025', 'Suto 2003'], grid: [3, 3],
    ledger: { '11': '結構', '5': '結構', '12': '結構', '9': '結構', '3': '結構' },
    legend: { rows: [], orient: [
      '<b>左 切面</b>：經主切口的 11–5 切面，左＝11 點（主切口）　上＝前', '<b>右 術者視角</b>：<b>左眼 OS</b>、術者坐 12 點；下＝12 點　右＝9 點 nasal（不鏡像）',
      '最後一格：兩張都是切面，放大 11 點周邊', '灰色桿＝器械；細虛線＋箭頭＝正常的水晶體前面 → PCR 後', '破口、玻璃體、核塊、OVD 的形狀與量：示意（動畫示意）'] },
    steps: [
      { hd: '前房突然變深、瞳孔一下子變大', views: [                                                                         // 2-1
        { kind: 'csec', hp: HP, state: S1, win: W_S,
          draw: all(level, lb('前房變深', 'deeper', 'R', 4.5, V => { const a = ant0(V), b = V.A.antPole; return [a[0] + 7.5, (a[1] + Math.max(a[1] + 2.4, b[1])) / 2]; }), lb('破口', 'rent', 'R', 39.5, rentEnd)) },
        { kind: 'cscope', state: S1, win: W_O,
          labels: [['瞳孔變大', 'wider', V => P3(V, under(9.5, cv(S1).pupil / 2, 0))]] }] },
      { hd: '核塊不跟 tip、一端歪；清亮的紅光', views: [                                                                     // 2-5
        { kind: 'csec', hp: HP, state: S2, win: W_S,
          draw: toolI(S2, [0]), labels: [['tip 還在原處', '', 'tip0'], ['一端歪進破口', '', 'frag']] },
        { kind: 'cscope', state: S2, win: W_O,
          draw: toolI(S2, [0]), labels: [['清亮區', 'rent', clearIn], ['核塊歪', 'tilt', pole(S2)]] }] },
      { hd: '第一步：phaco 留著＋side port 打 OVD', views: [                                                                  // 3-1
        { kind: 'csec', hp: HP, state: S3, win: W_S, cut: true,
          draw: toolI(S3, [0]), labels: [['phaco 留在原位', '', 'tip0'], ['dispersive OVD', '', 'ovdd']] },
        { kind: 'cscope', state: S3, win: W_O,
          draw: toolI(S3, [0, 1]), labels: [['side port 的 cannula', '', instPt(S3, 1, 1.2)], ['phaco', '', instPt(S3, 0, 1.4)]] }] },
      { hd: 'I/A 時破了：I/A 留著、先打大量 OVD', views: [                                                                   // 3-4
        { kind: 'csec', hp: HP, state: S4, win: W_S, cut: true,
          draw: toolI(S4, [0]), labels: [['I/A 留著', 'stay', 'tip0'], ['大量 OVD', '', 'ovdd']] },
        { kind: 'cscope', state: S4, win: W_O,
          draw: toolI(S4, [0, 1]), labels: [['cannula（side port）', '', instPt(S4, 1, 1.2)], ['I/A', '', instPt(S4, 0, 1.4)]] }] },
      { hd: '評估：破口、剩下的核、玻璃體', views: [                                                                         // 3-5
        { kind: 'csec', hp: HP, state: S5, win: W_S,
          draw: all(lb('還剩多少核', 'piece', 'L', 4.5, 'frag'), lb('破口多大', 'rent', 'R', 33.5, rentEnd), lb('玻璃體', 'vitreous', 'L', 39.5, V => [V.A.rentC[0] - 2, V.A.rentC[1] + 4])) },
        { kind: 'cscope', state: S5, win: W_O,
          labels: [['核塊', 'piece', 'frag'], ['破口', 'rent', clearIn]] }] },
      { hd: '剩下的核：OVD 墊著、鈍器械在下、低能量', views: [                                                               // 4-1
        { kind: 'csec', hp: HP, state: S6, win: W_S, cut: true,
          draw: all(toolI(S6, [0]), lb('核塊', 'piece', 'R', 4.5, 'frag'), lb('鈍器械在下', '示意', 'R', 39.5, crossPt(1))) },
        { kind: 'cscope', state: S6, win: W_O,
          draw: toolI(S6, [0]), labels: [['核塊在前房', '', 'frag'], ['鈍器械（核塊下）', '', instPt(S6, 1, 3.4)]] }] },
      { hd: '雙手前段玻璃體切除：灌流與切割分開', views: [                                                                   // 5-2
        { kind: 'csec', hp: HP, state: S7, win: W_SD, cut: true,
          draw: all(toolI(S7, [0]), lb('玻璃體', 'vitreous', 'R', 4.5, 'vitMid'), lb('切割在破口', 'vitrector', 'R', 39.5, 'tip0')) },
        { kind: 'cscope', state: S7, win: W_O,
          draw: toolI(S7, [0, 1]), labels: [['vitrector（主切口）', '', instPt(S7, 0, 1.6)], ['灌流（side port）', '', instPt(S7, 1, 1.6)]] }] },
      { hd: '前囊完整：sulcus（3-piece）或 optic capture', views: [                                                          // 6-1
        { kind: 'csec', hp: HP, state: SUL3, win: W_Z, step: 0.01, scale: { mm: 1 }, light: 0.85,
          draw: all(lb('optic', '', 'R', 4.5, 'optEdge-'), lb('前囊', '', 'R', 30, capAt(SUL3, 3.9)), lb('haptic 在 sulcus', '', 'L', 34, hapPt(SUL3))) },
        { kind: 'csec', hp: HP, state: CAPT, win: W_Z, step: 0.01, scale: { mm: 1 }, light: 0.85,
          draw: all(lb('haptic', '', 'L', 4.5, hapPt(CAPT)), lb('撕囊口', 'rim', 'R', 4.5, V => capAt(CAPT, K.rcOf(cv(CAPT)) + 0.05)(V)), lb('optic 在撕囊口後', '', 'R', 30, 'optEdge-')) }] },
    ],
  });
}
