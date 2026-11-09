// 手術步驟圖: one cell per checklist item; left = the model's meridional section (mechanism), right = the surgeon's view (microscope,
// right eye, surgeon at 12), the same state, as the video shows it (anim/draw.js segment in brackets). Anchors: 'name' = the model's
// anchor, [x, y] = model mm, V => figure mm. The model's own colours are drawn light; incisions (thick dashed), the torn capsule edge
// (thick solid), pulls (arrows) and planned / hidden / 示意 positions (thin dashed) are the print overlays.
{
  const L0 = K.LENS, cv = s => K.norm(s);
  const cannulaSide = { kind: 'cannula', via: 'side', at: { h: CASE.side.h, r: 1.2, lift: 0.9 } };
  // section windows (model mm): the incision side of the 12–6 section (draw.js W_MID), the tunnel (W_TUN), the capsule rim (W_RIM, W_RIM41)
  const W_HALF = { x: -8.4, y: -14.6, w: 10.4, h: 9.4 }, W_PUP = { x: -4.4, y: -4.6, w: 8.8, h: 9.4 }, W_TUNA = { x: -8.6, y: -14.4, w: 6.2 }, W_RIMC = { x: 0.6, y: -12.5, w: 5.6 }, W_EYE = { x: -6.6, y: -6.6, w: 13.2, h: 13.2 };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  // 1 side port blade in the chamber (2-1); 2 OVD through the side port (2-2); 3 the finished main incision (3-2)
  const S1 = { cat: { side: SIDE, inst: [{ kind: 'sideblade', adv: 1.15 }] } };
  const S2 = { cat: { side: SIDE, ovd: 1, inst: [cannulaSide] } };
  const S3 = { cat: BASE };
  const e3 = K.enface({ st: S3, id: 'probe3' }).A, c3 = [(e3.mainExt[0] + e3.mainInt[0]) / 2, (e3.mainExt[1] + e3.mainInt[1]) / 2];
  // 4 the flap raised at the start of the tear (5-2; routine zonules); 5 the tear at 110° with the forceps on the flap near the front (4-2)
  const C4 = { ...BASE, ccc: cccS({ prog: 0.08, fold: 1 }) }, S4 = { cat: { ...C4, inst: [{ kind: 'forceps', at: K.graspAt(cv({ cat: C4 })) }] } };
  const g5 = K.graspAt(cv({ cat: MIDc })), S5 = { cat: { ...MIDc, inst: [{ kind: 'forceps', at: g5 }] } }, hp5 = K.tearPlane(cv({ cat: MIDc }));
  const G5 = K.capPt(cv(S5), g5.r, g5.h, g5.lift), tg5 = dirsAt(K.rhex(cv(S5).ccc).hf).tg;
  // 6 OVD topped up through the side port mid-tear (5-3); thin dashed = the capsule pushed forward when the chamber is shallow (2-2, push 示意)
  const S6 = { cat: { ...MIDc, inst: [cannulaSide] } }, PUSH = cv({ cat: { ...MIDc, push: 1 } });
  const capZ = (c, u) => -(L0.zAnt(Math.abs(u)) + K.liftZ(c, Math.abs(u)));
  const bulge = V => { const q = []; for (let u = -3.4; u <= 3.4001; u += 0.1) q.push(V.P([u, capZ(PUSH, u)])); return q; };
  // 7 run-out → Little: the flap pressed flat, regrasped near the front, pulled back then toward the centre (6-2 line 2)
  const X7 = K.rhex(cv({ cat: runC(1) }).ccc), hg = hAt(X7.span - 0.5), g7 = { h: hg, r: 3.2, lift: 0.03 };
  const S7 = { cat: { ...runC(1, { fold: 0 }), inst: [{ kind: 'forceps', at: g7 }] } }, c7 = cv(S7), pr = c7.pupil / 2, d7 = dirsAt(hg);
  const G7 = K.capPt(c7, g7.r, g7.h, g7.lift), P1 = add3(G7, d7.tg, -1.4), P2 = add3(P1, d7.d, -1.0);
  const seen7 = edge(S7, tAtR(X7, pr)), hid7 = V => { const q = []; for (let t = tAtR(X7, pr); t <= X7.span + 1e-9; t += 0.04) q.push(cap(V, S7, X7.R(t), hAt(t))); return q; };
  // 8 done (1-1, 4-1): the rim at 3 o'clock — rhexis edge, optic edge (院內 IOL), zonule insertion
  const rO = CASE.optic / 2, tick = (V, r, up) => [cap(V, DONE, r, 3, 0.1), cap(V, DONE, r, 3, up)];
  const arw = (a, b) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w: 0.6, head: 1.8 });
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝模型的切面（機轉）　右＝術者視角（顯微鏡），同一個狀態',
    sources: ['Ernest 1995', 'Hollick 1999'], grid: [3, 3],
    ledger: { '12': '結構' },
    legend: { rows: ['inc', 'cut'], orient: [
      '<b>左 切面</b>（子午切面）：上＝前；經切口時 左＝切口；撕囊時經撕囊前緣，右＝周邊', '<b>右 術者視角</b>：右眼 OD、術者坐 12 點；下＝12 點　右＝temporal',
      '粗黑實線＝撕開的前囊邊緣；箭頭＝拉的方向；細虛線＝預定的圓、虹膜下看不到的邊緣、示意的位置', '器械、OVD、瓣的形狀、箭頭長短：示意；切口寬、IOL optic 大小：依院內常規'] },
    steps: [
      { hd: 'Side port：左手側（右眼坐 12 點＝nasal）', views: [                                                  // 2-1
        { kind: 'csec', hp: HP_SIDE, state: S1, win: W_TUNA, overlays: [{ inc: tunnel(SIDE) }],
          draw: all(tool(S1), lb('側切口', 'side port', 'L', 6, 'sideExt'), lb('刀尖在前房', 'blade tip', 'R', 31, 'tip0')) },
        { kind: 'cscope', state: S1, win: W_EYE, overlays: [{ inc: mouth(SIDE), w: 0.9 }],
          draw: all(tool(S1), lb('側切口', 'side port', 'L', 38, 'sideExt')) }] },
      { hd: '經 side port 打 OVD：撐滿前房、壓平前囊', views: [                                                    // 2-2
        { kind: 'csec', hp: HP_SIDE, state: S2, win: W_HALF, overlays: [{ inc: tunnel(SIDE) }],
          draw: all(tool(S2), lb('cannula', '', 'L', 5, V => P3(V, add3(K.instGeom(cv(S2), cv(S2).inst[0]).tip, K.instGeom(cv(S2), cv(S2).inst[0]).axis, 2.2))),
            lb('前房 OVD', '', 'R', 5, [0.4, -(L0.za + 1.3)]), lb('前囊壓平', 'flat', 'R', 37, V => V.P([1.4, capZ(cv(S2), 1.4)]))) },
        { kind: 'cscope', state: S2, win: W_EYE, overlays: [{ inc: mouth(SIDE), w: 0.9 }],
          draw: all(tool(S2), lb('cannula', '', 'L', 38, 'tip0')) }] },
      { hd: 'Keratome 三平面隧道：長≈寬（約 2 mm）', views: [                                                       // 3-1, 3-2
        { kind: 'csec', hp: HP, state: S3, win: W_TUNA, overlays: [{ inc: tunnel(MAIN) }], scale: { mm: 1 },
          draw: all(lb('隧道 約 2 mm', '', 'L', 6, V => mid(V.A.mainExt, V.A.mainInt)), lb('內口', 'inner', 'R', 25, 'mainInt'), lb('外口', 'outer', 'L', 31, 'mainExt')) },
        { kind: 'cscope', state: S3, win: { x: c3[0] - 3.4, y: c3[1] - 3.6, w: 6.8, h: 7.2 }, overlays: [{ inc: mouth(MAIN), w: 0.9 }],
          dims: [{ from: V => mouth(MAIN)(V)[0], to: V => mouth(MAIN)(V)[1] }, { from: 'mainExt', to: 'mainInt' }],
          draw: all(lb('長', 'length', 'L', 6, V => mid(V.A.mainExt, V.A.mainInt)), lb('寬 2.4 mm', '', 'R', 38, V => mid(...mouth(MAIN)(V)))) }] },
      { hd: '中央破開前囊，把瓣翻起來', views: [                                                                     // 5-1, 5-2
        { kind: 'csec', hp: HP, state: S4, win: W_HALF, overlays: [{ inc: tunnel(MAIN) }],
          draw: all(tool(S4), lb('主切口', 'main incision', 'L', 5, 'mainExt'), lb('撕囊鉗', 'forceps', 'R', 37, 'tip0')) },
        { kind: 'cscope', state: S4, win: W_PUP, overlays: [{ cut: edge(S4) }],
          draw: all(tool(S4), lb('瓣翻起來', 'flap', 'L', 5, 'flapEdge'), lb('撕囊鉗', 'forceps', 'R', 38, 'tip0')) }] },
      { hd: '沿切線拉；夾在瓣上、靠近撕開的前緣', views: [                                                             // 4-2 lines 1–2
        { kind: 'csec', hp: hp5, state: S5, win: W_RIMC, scale: { mm: 1 },
          draw: all(tool(S5), lb('夾點（瓣上）', 'grasp', 'R', 6, V => P3(V, G5)), lb('撕開的前緣', 'front', 'L', 31, 'front')) },
        { kind: 'cscope', state: S5, win: WIN.mid, overlays: [{ cut: edge(S5) }],
          draw: all(V => thin(circle(V, CASE.ccc.r)), tool(S5), V => arw(P3(V, G5), P3(V, add3(G5, tg5, 1.8))),
            lb('沿切線拉', 'tangent', 'R', 5, V => P3(V, add3(G5, tg5, 1.5))), lb('夾點', 'grasp', 'R', 38, V => P3(V, G5))) }] },
      { hd: '前房一淺：先補 OVD 再撕', views: [                                                                      // 5-3, 2-2
        { kind: 'csec', hp: HP_SIDE, state: S6, win: W_HALF, overlays: [{ inc: tunnel(SIDE) }],
          draw: all(V => thin(bulge(V), '1.0 0.7', 0.4), tool(S6), lb('cannula', '', 'L', 5, V => P3(V, add3(K.instGeom(cv(S6), cv(S6).inst[0]).tip, K.instGeom(cv(S6), cv(S6).inst[0]).axis, 2.2))),
            lb('補 OVD', '', 'R', 5, [0.4, -(L0.za + 1.3)]), lb('前房淺時（示意）', '', 'R', 37, V => V.P([0.6, capZ(PUSH, 0.6)]))) },
        { kind: 'cscope', state: S6, win: W_EYE, overlays: [{ cut: edge(S6) }, { inc: mouth(SIDE), w: 0.9 }],
          draw: all(tool(S6), lb('cannula', '', 'L', 38, 'tip0')) }] },
      { hd: 'Run-out：停 → 補 OVD → 往反方向、再往中央', views: [                                                    // 6-2 line 2
        { kind: 'csec', hp: hg, state: S7, win: W_RIMC, scale: { mm: 1 },
          draw: all(tool(S7), V => arw(P3(V, G7), P3(V, add3(G7, d7.d, -1.0))), lb('再往中央', 'centripetal', 'L', 6, V => P3(V, add3(G7, d7.d, -0.8))),
            lb('前緣在虹膜下', 'edge', 'L', 33, V => cap(V, S7, X7.R(X7.span - 0.5), hg))) },
        { kind: 'cscope', state: S7, win: { x: -1.0, y: -0.4, w: 5.2, h: 5.2 }, overlays: [{ cut: seen7 }],
          draw: all(V => thin(hid7(V), '0.3 0.7', 0.45), tool(S7), V => arw(P3(V, G7), P3(V, P1)) + arw(P3(V, P1), P3(V, P2)),
            lb('先往反方向拉', 'backward', 'L', 38, V => P3(V, add3(G7, d7.tg, -0.7))), lb('再往中央', 'centripetal', 'L', 5, V => P3(V, add3(P1, d7.d, -0.6)))) }] },
      { hd: '完成：連續、圓、置中、5.0–5.5 mm', views: [                                                            // 4-1, 1-1
        { kind: 'csec', hp: 3, state: DONE, win: { x: 1.0, y: -12.0, w: 4.4 }, scale: { mm: 1 },
          overlays: [{ cut: V => tick(V, CASE.ccc.r, 0.62), w: 0.6 }, { cut: V => tick(V, rO, 0.45), w: 0.35 }, { cut: V => tick(V, K.R_AZI, 0.3), w: 0.35 }],
          draw: all(lb('撕囊邊緣', 'CCC', 'L', 5, V => tick(V, CASE.ccc.r, 0.62)[1]), lb('optic 邊緣', '', 'R', 10, V => tick(V, rO, 0.45)[1]),
            lb('zonule 附著', '', 'R', 27, V => tick(V, K.R_AZI, 0.3)[1]), lb('赤道', 'equator', 'L', 36, 'eq+')) },
        { kind: 'cscope', state: DONE, win: W_EYE, overlays: [{ cut: edge(DONE) }, { inc: mouth(MAIN), w: 0.9 }, { inc: mouth(SIDE), w: 0.9 }],
          draw: V => { const a = V.P(V.r.M([CASE.ccc.r, -0.4, 0])), b = V.P(V.r.M([-CASE.ccc.r, -0.4, 0]));
            return thin(circle(V, rO)) + PRINT.dim(a, b, { w: 0.35 }) + PRINT.txt((a[0] + b[0]) / 2, a[1] - 1.6, '5.0–5.5 mm', { bold: true, anchor: 'middle' }) +
              lb('optic 6.0 mm', '', 'L', 38, V => V.P(V.r.M([rO * 0.71, rO * 0.71, 0])))(V); } }] },
    ],
  });
}
