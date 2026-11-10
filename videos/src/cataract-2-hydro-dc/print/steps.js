// 手術步驟圖: one cell per checklist item; left = the model's section (mechanism: the 12–6 section through the main incision, or a
// cross-section across the groove seen from the incision), right = the surgeon's view (microscope, right eye, surgeon at 12), the same
// state, as the video shows it on the model (anim/draw.js segment in brackets). Anchors: 'name' = the model's anchor, [x, y] = model mm,
// V => figure mm. The model's own colours are drawn light; instruments (grey rods), pushes and pressure (arrows), the plate under the
// groove floor (dimension) and the chamber level before a surge (thin dashed) are the print overlays.
{
  const cv = s => K.norm(s), pair = (V, n) => (V.r.A[n] || []).map(V.P), up = q => q[0][1] < q[1][1] ? q[0] : q[1];
  const W_SC = { x: -4.4, y: -4.6, w: 9.2, h: 9.8 }, W_SCH = { x: -6.9, y: -4.2, w: 13.8, h: 13.8 };
  // section windows (model mm, plane coordinates: y = −depth): the injection side (1), the centre (2, 3, 7, 8), the groove floor across (4–6)
  const W_INJ = { x: -2.6, y: -13.4, w: 8.6, h: 9.2 }, W_MID = { x: -4.3, y: -13.4, w: 8.6, h: 9.2 }, W_C = { x: -4.6, y: -13.5, w: 9.2, h: 9.8 }, W_XG = { x: -3.6, y: -11.45, w: 7.2, h: 7.7 }, W_XC = { x: -3.4, y: -11.2, w: 6.8, h: 7.3 };
  // 1 the cannula under the rim, BSS slow and continuous, the wave crossing the red reflex (1-1)
  const S1 = hyDemo(0.55);
  // 2 press the centre: fluid out over the rim; then another site, then push the nucleus round (1-3 lines 1–2)
  const S2 = hyDemo(1, { press: 1, at: { h: CASE.hydroDemo, r: 0.15, lift: 0 } });
  // 3 sculpting from below the incision toward the far side: the needle at the start of a stroke (3-2: each stroke from the proximal end to
  // the deepest point, 示意), the arrow = the stroke; groove half-way
  const st3 = { cat: { ...BASE, nuc: nucS({ dep: 0.5 }) } }, S3 = { cat: { ...st3.cat, inst: [PHACO(gPt(st3, 1.2, 0, 0.9))] } }, T3 = K.grooveTip(st3);
  const stroke = V => arw(V.A.tip0, P3(V, T3));
  const offDim = (a, b, d) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, n = [-(b[1] - a[1]) / l * d, (b[0] - a[0]) / l * d]; return [[a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]]]; };
  const gLen = V => { const e = pair(V, 'grooveEnd'); return e.length ? offDim(e[0], e[1], -4.2) : null; };
  // 4 the groove deep enough: plate ≈ 1 mm under the floor (示意), the floor's red reflex brighter (3-3)
  const S4 = GROOVED(depFor(1.0));
  // 5 phaco and chopper on the floor, pushing apart; the crack through the plate (4-1 line 2)
  const S5 = withTools(CRACKED(1, 0));
  // 6 turned 90°, the second groove along 12–6 again, cracked (4-3 lines 0–1)
  const st6 = { cat: { ...BASE, nuc: nucS({ crack: { prog: 1, sep: 0.5 }, rot: 90, dep2: CASE.groove.dep, crack2: { prog: 1, sep: 0 } }) } };
  const t6 = crackTools(st6, 2), S6 = { cat: { ...st6.cat, inst: [PHACO(t6[0]), CHOP(t6[1])] } };
  // 7 a quadrant occluded, pulled to the centre and emulsified there (5-1 line 3)
  const S7 = QSTATE(1, 0.3);
  // 8 a surge: the chamber shallows at the occlusion break (6-1; the amount 示意); the dashed line = the anterior capsule level before it
  const S8 = QSTATE(1, 0.6, { surge: FLUIDICS.surge(0.15, 'quad') }), C8 = cv(QSTATE(1, 0.6, { noTip: true }));
  const level = V => { const a = P3(V, K.capPt(C8, 0, 0)); return thin([[24, a[1]], [V.w - 1.5, a[1]]], '1.2 0.8', 0.35); };
  const lift8 = V => [P3(V, K.capPt(C8, 3.1, HP)), P3(V, K.capPt(cv(S8), 3.1, HP))], up8 = V => { const [a, b] = lift8(V); return arw([a[0], a[1] + 1.2], b); };
  const press = V => { const t = V.A.tip0; return arw([t[0], t[1] - 9], [t[0], t[1] - 1.6]); };
  const apart = V => { const a = V.A.tip0, b = V.A.tip1, s = a[0] < b[0] ? -1 : 1; return arw(a, [a[0] + 6 * s, a[1]]) + arw(b, [b[0] - 6 * s, b[1]]); };
  const plate = V => { const X = V.r.A.grooveX; if (!X) return ''; const a = V.P(X.floor), b = V.P(X.post), x = a[0] + 6.5;
    return thin([[a[0], a[1]], [x + 0.8, a[1]]], '0.8 0.6', 0.25) + thin([[b[0], b[1]], [x + 0.8, b[1]]], '0.8 0.6', 0.25) + PRINT.dim([x, a[1]], [x, b[1]], { w: 0.35 }); };
  const plateMid = V => { const X = V.r.A.grooveX, a = V.P(X.floor), b = V.P(X.post); return [a[0] + 6.5, (a[1] + b[1]) / 2]; };
  const shaft = (st, i, d) => V => { const c = cv(st), g = K.instGeom(c, c.inst[i]); return P3(V, [g.tip[0] + g.axis[0] * d, g.tip[1] + g.axis[1] * d, g.tip[2] + g.axis[2] * d]); };
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左＝模型的切面（機轉）　右＝術者視角（顯微鏡），同一個狀態',
    sources: ['Taş 2017', 'Gimbel 1991'], grid: [3, 3],
    ledger: { '3': '結構', '1': '結構', '90': '結構', '12': '結構', '6': '結構' },
    legend: { rows: [], orient: [
      '<b>左 切面</b>：經主切口的 12–6 切面（上＝前、左＝主切口），或垂直槽的橫切面（從切口看，右＝temporal）', '<b>右 術者視角</b>：右眼 OD、術者坐 12 點；下＝12 點　右＝temporal',
      '灰色桿＝器械；箭頭＝推、壓的方向；細虛線＝surge 前的前囊高度', '液體層、槽寬與槽深、器械位置、核塊的角度：示意；機器設定依院內'] },
    steps: [
      { hd: 'Hydrodissection：撕囊邊緣下、慢而連續', views: [                                                       // 1-1
        { kind: 'csec', hp: HP, state: S1, win: W_INJ,
          draw: tool(S1), labels: [['cannula', '', V => V.A.tip0], ['BSS 在囊與皮質間', '', V => V.A.fluidEq], ['後囊', 'capsule', 'postPole']] },
        { kind: 'cscope', state: S1, win: W_SCH,
          draw: tool(S1), labels: [['波前', 'wave', V => V.A.waveFront], ['cannula 經主切口', '', V => V.A.mainInt]] }] },
      { hd: '每打一處：壓中央排液 → 換一處 → 推核轉動', views: [                                                   // 1-3 lines 1–2
        { kind: 'csec', hp: HP, state: S2, win: W_MID,
          draw: all(tool(S2), press, lb('輕壓中央', 'press', 'L', 6, V => [V.A.tip0[0], V.A.tip0[1] - 9]), lb('液體排出', '', 'L', 30, V => P3(V, K.capPt(cv(S2), 2.75, (HP + 6) % 12, 0.12)))) },
        { kind: 'cscope', state: S2, win: W_SC,
          draw: all(tool(S2), V => arc(V, 7.6, 9.6, 2.8)), labels: [['輕壓中央', '', V => V.A.tip0], ['最後推核：轉得動', '', V => { const d = G.clockDir(8.4); return V.P(V.r.M([d[0] * 2.8, d[1] * 2.8, 0])); }]] }] },
      { hd: '刻槽：先有水流再踩 3；切口下方往對側', views: [                                                        // 3-1, 3-2
        { kind: 'csec', hp: HP, state: S3, win: W_C,
          draw: all(tool(S3), stroke), labels: [['phaco 經主切口', '', shaft(S3, 0, 2.5)], ['往對側刻', '', V => P3(V, T3)]] },
        { kind: 'cscope', state: S3, win: W_SC,
          draw: all(tool(S3), stroke, V => { const d = gLen(V); return d ? PRINT.dim(d[0], d[1], { w: 0.35 }) : ''; }),
          labels: [['長：到撕囊邊緣內', '', V => up(gLen(V))], ['phaco', '', V => V.A.tip0]] }] },
      { hd: '深度：槽底紅光變亮＝後板變薄（示意）', views: [                                                         // 3-3
        { kind: 'csec', hp: XH, off: OFFX, cut: true, state: S4, win: W_XG, step: 0.02,
          draw: all(plate, lb('槽底', 'floor', 'L', 21, V => V.P(V.r.A.grooveX.floor)), lb('後板 約 1 mm', '', 'R', 34.2, plateMid), lb('後囊', 'capsule', 'L', 40.2, V => { const q = V.P(V.r.A.grooveX.post); return [q[0] - 3, q[1] - 0.2]; })) },
        { kind: 'cscope', state: S4, win: W_SC,
          labels: [['槽底變亮', 'reflex', V => V.A.grooveC]] }] },
      { hd: '分核：兩支器械在槽底、往兩側推', views: [                                                              // 4-1
        { kind: 'csec', hp: XH, off: -0.85, cut: true, state: S5, win: W_XC, step: 0.02,
          draw: all(apart, lb('phaco', '', 'L', 25, 'tip0'), lb('chopper', '', 'R', 25, 'tip1'), lb('裂縫貫穿後板', '', 'R', 38, V => V.P(V.r.A.crack[1]))) },
        { kind: 'cscope', state: S5, win: W_SC,
          draw: tool(S5), labels: [['chopper 經側切口', '', V => V.A.tip1], ['phaco', '', V => V.A.tip0], ['裂縫到周邊', 'crack', V => up(pair(V, 'crackEnds'))]] }] },
      { hd: '轉 90°，第二道槽又在 12→6 點，再分 → 四塊', views: [                                                   // 4-3 lines 0–1
        { kind: 'csec', hp: XH, off: X2OFF, cut: true, state: S6, win: W_XC, step: 0.02,
          draw: all(apart, lb('chopper', '', 'L', 19, 'tip1'), lb('phaco', '', 'R', 19, 'tip0'), lb('第二道裂縫', '', 'L', 38, V => V.P(V.r.A.crack2[1]))) },
        { kind: 'cscope', state: S6, win: W_SC,
          draw: all(tool(S6), V => arc(V, 4.0, 7.0, 3.6)), labels: [['轉 90°', 'rotate', V => { const d = G.clockDir(5.5); return V.P(V.r.M([d[0] * 3.6, d[1] * 3.6, 0])); }], ['第二道槽', '', V => V.A.grooveC2]] }] },
      { hd: '移除核塊：吸住 → 拉到中央 → 再乳化', views: [                                                           // 5-1
        { kind: 'csec', hp: HP, state: S7, win: W_C,
          draw: all(tool(S7), lb('口吸住核塊', '', 'R', 8, 'tip0'), lb('拉到中央', '', 'R', 28, [0.5, -8.3]), lb('後囊', 'capsule', 'R', 39.5, 'postPole')) },
        { kind: 'cscope', state: S7, win: W_SC,
          draw: tool(S7), labels: [['核塊', 'quadrant', V => V.A.quadApex0], ['phaco', '', V => V.A.tip0]] }] },
      { hd: 'Surge：前房一淺 → 腳退回 1 段（只灌流）', views: [                                                       // 6-1
        { kind: 'csec', hp: HP, state: S8, win: W_C,
          draw: all(level, up8, tool(S8), lb('往前移、前房變淺', '', 'L', 6, V => lift8(V)[1]), lb('原本的前囊高度', '', 'L', 22, V => [27, P3(V, K.capPt(C8, 0, 0))[1]])) },
        { kind: 'cscope', state: S8, win: W_SC,
          draw: tool(S8), labels: [['phaco', '', V => V.A.tip0]] }] },
    ],
  });
}
