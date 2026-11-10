// 手術步驟圖: one cell per checklist item; left = the model's section (mechanism: the 12–6 section through the main incision, or the incision
// tunnel), right = the surgeon's view (microscope, right eye, surgeon at 12), the same state, as the video shows it on the model (anim/draw.js
// segment in brackets). Anchors: 'name' = the model's anchor, [x, y] = model mm, V => figure mm. The model's own colours are drawn light;
// instruments (grey rods; the I/A port a black dot), pulls and presses (arrows) are the print overlays.
{
  const cv = s => K.norm(s);
  // windows (model mm; section: y = −depth): the 6 o'clock half (1, 2), the caught capsule (4), the subincisional half (3), the whole lens (5–7),
  // the tunnel (8); microscope — the pupil, a wider view, the main incision
  const W_R = { x: 0.2, y: -12.2, w: 6.4, h: 6.8 }, W_R2 = { x: -0.9, y: -12.2, w: 6.4, h: 6.8 }, W_C4 = { x: 0.6, y: -11.6, w: 6.4, h: 6.8 }, W_SUB = { x: -6.6, y: -12.2, w: 7.0, h: 7.4 };
  const W_X = { x: -6.6, y: -13.6, w: 13.2, h: 9.0 }, W_L = { x: -5.8, y: -12.9, w: 11.6, h: 8.0 }, W_TN = { x: -7.3, y: -12.9, w: 4.6, h: 4.9 };
  const W_SC = { x: -4.4, y: -4.7, w: 8.8, h: 9.4 }, W_SCW = { x: -5.6, y: -5.6, w: 11.2, h: 11.6 }, W_INC = { x: -1.2, y: 1.5, w: 6.0, h: 6.4 };
  // 1 the tip under the 6 o'clock rim, port up, occluding the cortex (1-2 line 2)
  const S1a = { cat: { ...BASE, bag: { cortex: FULL(), sub: 1, strip: { h: HP, prog: 0.05 } }, inst: [IA(P_RIM6, { occl: 1 })] } };
  // 2 the sheet pulled to the centre (1-2 line 3), the sectors around already cleared (line 4); the arrow = the pull
  const S2a = { cat: { ...BASE, bag: { cortex: K.cortexSweep(4 / 12, 2, 1), sub: 1, strip: { h: HP, prog: 0.85 } }, inst: [IA(mix3(P_RIM6, P_C12, 0.85), { occl: 1 })] } };
  const pull = V => arw(P3(V, mix3(P_RIM6, P_C12, 0.3)), P3(V, mix3(P_RIM6, P_C12, 1.05)));
  // 3 bimanual I/A: aspirator through the side port under the subincisional rim, irrigation through the main incision (2-2 lines 0–1)
  const S3a = { cat: { ...BASE, bag: { cortex: FULL(), sub: 1 }, inst: [BIM, IRR] } };
  // 4 the posterior capsule caught in a port turned down: tent and radial striae (3-1; 動畫示意)
  const S4a = CAUGHT(1);
  // 5 OVD in the bag, injector through the main incision, the leading haptic in the bag (4-2 line 0–1)
  const S5a = S1;
  // 6 the trailing haptic pressed into the bag with a hook through the side port (4-2 line 2)
  const S6a = S3(0.5);
  // 7 OVD removal: behind the optic first (5-1 line 0; order 示意); the bag not yet closed
  const S7a = FIN({ behind: 0.45, front: 0, collapse: 0.45, ovd: 1, inst: [IA(P_O1)] });
  // 8 stromal hydration of the closed incision (5-3 line 1); swab pressing is the other way (the header)
  const S8a = FIN({ inst: [{ kind: 'hcan', side: 1, f: 0.3 }] }); S8a.cat.seal = { gape: 1, hydr: 1 };
  const hap1 = st => V => { const IO = K.iolOf(cv(st)), h = IO.haps[1].find(p => { const r = Math.hypot(p[0], p[1]); return r > 3.1 && r < 3.4; }) || IO.haps[1][6]; return P3(V, h); };
  const hap0 = st => V => { const IO = K.iolOf(cv(st)); let b = null; for (const p of IO.haps[0]) { const q = P3(V, p); if (q[0] > 2 && q[0] < V.w - 2 && q[1] > 2 && q[1] < V.h - 2 && (!b || q[1] < b[1])) b = q; } return b; };
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝模型的切面（機轉）　右＝術者視角（顯微鏡），同一個狀態',
    sources: ['Colvard 1997', 'Mifflin 2012'], grid: [3, 3],
    ledger: { '1': '結構', '12': '結構', '6': '結構' },
    legend: { rows: [], orient: [
      '<b>左 切面</b>：經主切口的 12–6 切面（上＝前、左＝主切口）；最後一格是主切口隧道放大（左＝周邊）', '<b>右 術者視角</b>：右眼 OD、術者坐 12 點；下＝12 點　右＝temporal',
      '灰色桿＝器械；黑點＝I/A 吸口；箭頭＝拉、壓的方向', '吸口方向、皮質、皺褶、IOL 姿勢、OVD 的量：示意；IOL 與器械型號依院內'] },
    steps: [
      { hd: 'I/A：吸口朝上，在 6 點那一側的邊緣下夾住', views: [                                                     // 1-2 line 2
        { kind: 'csec', hp: HP, state: S1a, win: W_R,
          draw: all(tool(S1a), port(S1a), lb('吸口朝上', 'port up', 'L', 5, portP(S1a)), lb('前囊邊緣', 'rim', 'R', 11, V => capP(V, S1a, CN.cccD / 2 + 0.02, HP)), lb('後囊', 'capsule', 'L', V => V.h - 3, V => postP(V, 2.6, HP))) },
        { kind: 'cscope', state: S1a, win: W_SC,
          draw: all(tool(S1a), port(S1a), lb('看得到吸口', '', 'R', 5, portP(S1a)), lb('I/A 經主切口', '', 'L', V => V.h - 3, shaftP(S1a, 0, 5))) }] },
      { hd: '往中央拉、剝下來 → 到中央再吸；一區接一區', views: [                                                       // 1-2 lines 3–4
        { kind: 'csec', hp: HP, state: S2a, win: W_R2,
          draw: all(tool(S2a), port(S2a), pull, lb('皮質剝向中央', 'cortex', 'L', V => V.h - 9, V => { const S = V.r.A.strand; return V.P([(S.att[0] + S.end[0]) / 2, (S.att[1] + S.end[1]) / 2]); }), lb('拉向中央', '', 'L', 5, V => P3(V, mix3(P_RIM6, P_C12, 0.55)))) },
        { kind: 'cscope', state: S2a, win: W_SC,
          draw: all(tool(S2a), port(S2a), lb('已吸乾淨', 'clear', 'L', 5, V => P3(V, under(4.6, 3.3, 0))), lb('剝下的皮質', '', 'R', 11, 'strandAtt')) }] },
      { hd: '主切口下方：換角度（雙手 I/A：吸的經側切口）', views: [                                                    // 2-2 lines 0–1
        { kind: 'csec', hp: HP, state: S3a, win: W_SUB,
          draw: all(tool(S3a), lb('吸的那支（投影）', '', 'R', 5, 'tip0'), lb('主切口下方的皮質', '', 'R', V => V.h - 3, V => capP(V, S3a, 3.4, CASE.main.h, -0.3))) },
        { kind: 'cscope', state: S3a, win: W_SCW,
          draw: all(tool(S3a), lb('吸的那支（側切口）', '', 'L', 5, shaftP(S3a, 0, 2.5)), lb('灌流（主切口）', '', 'R', V => V.h - 3, shaftP(S3a, 1, 1.5))) }] },
      { hd: '吸到後囊：放射狀皺褶 → 腳退回 1 段（動畫示意）', views: [                                                   // 3-1
        { kind: 'csec', hp: HP, state: S4a, win: W_C4,
          draw: all(tool(S4a), port(S4a), lb('吸口朝下', 'port down', 'L', 5, portP(S4a)), lb('後囊被吸起', 'capsule', 'L', V => V.h - 3, V => [V.A.caughtPort[0] - 1.2, V.A.caughtPort[1] + 2.2])) },
        { kind: 'cscope', state: S4a, win: W_SC,
          draw: all(tool(S4a), lb('放射狀皺褶', 'striae', 'R', 5, V => { const L = V.r.A.striaeLines; let b = null; for (const [, q0] of L) { const q = V.P(q0); if (!b || q[0] > b[0]) b = q; } return b; })) }] },
      { hd: 'OVD 撐開囊袋 → 前導 haptic 先進囊袋', views: [                                                            // 4-2 line 1
        { kind: 'csec', hp: HP, state: S5a, win: W_X,
          draw: all(tool(S5a), lb('斜面朝下（示意）', 'bevel', 'L', 5, 'tip0'), lb('OVD 撐開囊袋', 'OVD', 'R', V => V.h - 4, V => V.P([1.6, -(L0.zc - 1.0)]))) },
        { kind: 'cscope', state: S5a, win: W_SCW,
          draw: all(tool(S5a), lb('前導 haptic', 'leading', 'R', 5, hap0(S5a)), lb('injector', '', 'L', V => V.h - 3, shaftP(S5a, 0, 2))) }] },
      { hd: '後 haptic：hook 經側切口壓進 → 置中', views: [                                                             // 4-2 line 2
        { kind: 'csec', hp: HP, state: S6a, win: W_X,
          draw: all(tool(S6a), lb('hook（側切口）', '', 'L', 5, 'tip0'), lb('optic 在囊袋裡', 'optic', 'R', V => V.h - 4, 'iolC')) },
        { kind: 'cscope', state: S6a, win: W_SCW,
          draw: all(tool(S6a), lb('hook', '', 'R', 5, 'tip0'), lb('後 haptic', 'trailing', 'R', V => V.h - 3, hap1(S6a))) }] },
      { hd: '清 OVD：連 optic 後面一起清（順序示意）', views: [                                                         // 5-1 line 0
        { kind: 'csec', hp: HP, state: S7a, win: W_L,
          draw: all(tool(S7a), port(S7a), lb('前房的 OVD', 'in front', 'L', 5, V => V.P([4.3, -10.4])), lb('I/A', '', 'R', V => V.h - 12, 'tip0'), lb('optic 後面的 OVD', '', 'L', V => V.h - 4, V => V.P([-2.3, -(L0.zc - 0.55)]))) },
        { kind: 'cscope', state: S7a, win: W_SC,
          draw: all(tool(S7a), lb('optic 邊緣', 'optic', 'R', 5, V => { const IO = K.iolOf(cv(S7a)); let b = null; for (const p of IO.ring) { const q = P3(V, p); if (!b || q[0] > b[0]) b = q; } return b; }), lb('I/A 經主切口', '', 'L', V => V.h - 3, shaftP(S7a, 0, 4))) }] },
      { hd: '密閉：基質打水或棉棒壓住（依院內常規）', views: [                                                         // 5-3 line 1
        { kind: 'csec', hp: HP, state: S8a, win: W_TN, step: 0.012,
          draw: all(tool(S8a), lb('cannula', '', 'L', 5, 'tip0'), lb('基質變白、腫', 'hydration', 'R', V => V.h - 4, 'sealWhite')) },
        { kind: 'cscope', state: S8a, win: W_INC,
          draw: all(tool(S8a), lb('切口兩側變白', '', 'L', 5, V => V.P(V.r.A.sealBlobs[1]))) }] },
    ],
  });
}
