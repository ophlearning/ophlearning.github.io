// 手術步驟圖 (assistant's version): one cell per checklist item (numbers = checklist numbers); left = the model's section (mechanism), right =
// the surgeon's view (wide-angle system or microscope, left eye OS, surgeon at 12), the same state, as the video shows it (draw.js segment in
// brackets). States are the video's own (VP.ST …, print/video.js). Cell 8 (preparing the gas) has no eye: the 50 mL syringe in three steps as
// in 7-2 (C3F8: no scale and no mL amount, 依院內常規). Cell 10 is after the operation: the head view (gravity down) and the tear close up.
// 示意 as in spec.md「進度」: trocar clock hours, looking toward 11 / 4:30, where and how deep the press goes, the cutter's place, the sucked retina,
// the bead's place and size, the bubble size, the head icon.
{
  const SEC_W = { x: -13.6, y: -13.6, w: 27.2, h: 27.33 };              // VP.WIN.secT: whole eye, 11–5 section
  const WIDE_N = { x: -21, y: -26, w: 42, h: 52 };                      // whole wide-angle field (radius 19 mm) with room for the clock numbers
  const WIDE_W = { x: -21, y: -22, w: 42, h: 44 };                      // whole wide-angle field, no clock numbers
  const PORT_W = { x: -3.2, y: -1.95, w: 6.4 };                         // VP.WIN.port: a trocar's tunnel, across its meridian
  const IT = P.troc(P.geom(ST.setup)).find(t => t.inf), PORT_PL = G.planes.across(IT.h, IT.s);   // the infusion port (4:30) and its tunnel plane (VP.port)
  // layer points of the tunnel cross-section 1.9 mm right of the port (as VP.port: conjL, sclL, planaL, vitL)
  const dh = 1.9 / (P.surfAt(IT.s).rho * 30 * VP.D2R), cil = P.cilTh(IT.s - G.N.spur, P.oraAt(IT.h, 1) - G.N.spur);
  const layer = d => V => W3(V, IT.h + dh, IT.s, d);
  // 2: the trocar (23G blade 0.64 mm, handle) all the way in along the tunnel line, as draw.js trocarRod at the end of 2-1 line 4 (u = Lt + 0.45)
  const TR = P.troc(P.geom(ST.portIn)).find(t => t.id === VP.PORT), LT = TR.Tw / Math.sin(TR.ang * VP.D2R), U_IN = LT + 0.45;
  const along = L => G.add(TR.entry, TR.tdir.map(v => v * L));
  const blade = V => { const a = P3(V, along(U_IN)), b = P3(V, along(U_IN - 4.6)), c = P3(V, along(U_IN - 3.9)), w = 0.64 * V.k;
    return rod([a, b], w) + `<path d="${PRINT.pth([c, b])}" stroke="#000" stroke-width="${(1.4 * V.k + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth([c, b])}" stroke="#8a8a8a" stroke-width="${(1.4 * V.k).toFixed(2)}" stroke-linecap="round"/>`; };
  const bladeTop = V => rod([P3(V, TR.entry), P3(V, along(-4.6))], Math.max(0.5, 0.64 * V.k));   // seen from above: the part outside the eye
  // 9: the closed tunnel (the model draws it through the sclera) carried on through the pars plana (VP.tunnelIn, as 7-3 line 3)
  const IC = P.troc(P.geom(ST.closed)).find(t => t.inf), TIN = VP.tunnelIn(P.geom(ST.closed), IC);
  const tunnel = V => `<path d="${PRINT.pth([P3(V, G.add(IC.entry, IC.tdir.map(v => v * IC.Tw / Math.sin(IC.ang * VP.D2R)))), P3(V, TIN)])}" stroke="#000" stroke-width="0.4"/>`;
  // 6: the cutter's port and the sucked retina's apex (4-2)
  const S42 = ST.suck42, G42 = P.geom(S42), PORT42 = P.instGeom(G42, S42.inst[0]).portAt, SUCK42 = G42.ret(G42.suck.h, G42.suck.s, 1);
  // 4: where the same mound is with the inverter off (the picture turned 180° about the field's centre; 推論 as in 3-2 line 4)
  const off180 = V => { const c = V.A.centre, d = V.A.dep; return [2 * c[0] - d[0], 2 * c[1] - d[1]]; };
  // 8: the 50 mL syringe (7-2), lying left (nozzle) to right; pure gas = hatched; the needed amount ends somewhere in the band VP.SYR.c3f8.range
  // (fractions of the barrel, 依院內常規: no scale, no mL); o.total = the plunger's face (fraction), o.pure = pure gas to the face
  const syr = (x0, x1, y, o = {}) => { const h = 4.2, L = x1 - x0, xb = f => x0 + L * f, [r0, r1] = VP.SYR.c3f8.range, end = xb(o.total ?? 1), id = 'sy' + Math.round(x0 * 7 + y * 100);
    let s = `<defs><pattern id="${id}" width="0.9" height="0.9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="0.4" height="0.9" fill="#000"/></pattern></defs>`;
    s += `<rect x="${x0 - 2.2}" y="${y + h / 2 - 0.5}" width="2.2" height="1" fill="#fff" stroke="#000" stroke-width="0.3"/>`;                          // nozzle
    s += o.pure ? `<rect x="${x0}" y="${y}" width="${end - x0}" height="${h}" fill="url(#${id})"/>`
      : `<rect x="${x0}" y="${y}" width="${xb(r0) - x0}" height="${h}" fill="url(#${id})"/><rect x="${xb(r0)}" y="${y}" width="${xb(r1) - xb(r0)}" height="${h}" fill="url(#${id})" opacity="0.4"/>` +
        `<path d="M${xb(r0)} ${y - 0.8}V${y + h + 0.8}M${xb(r1)} ${y - 0.8}V${y + h + 0.8}" stroke="#000" stroke-width="0.3" stroke-dasharray="0.7 0.4"/>`;
    s += `<rect x="${x0}" y="${y}" width="${L}" height="${h}" fill="none" stroke="#000" stroke-width="0.45"/>`;                                          // barrel
    s += `<rect x="${end - 0.5}" y="${y + 0.3}" width="1" height="${h - 0.6}" fill="#000"/><path d="M${end} ${y + h / 2}H${end + 6}M${end + 6} ${y + 0.4}V${y + h - 0.4}" stroke="#000" stroke-width="0.8"/>`;   // plunger
    return s; };
  const t95 = (x, y, s, o = {}) => PRINT.txt(x, y, s, { pt: 9.5, ...o });
  // a 1 mm scale bar bottom right (text 9.5 pt; data-struct scale)
  const bar1 = V => { const x1 = V.w - 2, x0 = x1 - V.k, y = V.h - 2;
    return `<path d="M${x0.toFixed(2)} ${y}H${x1.toFixed(2)}M${x0.toFixed(2)} ${y - 0.8}v1.6M${x1.toFixed(2)} ${y - 0.8}v1.6" stroke="#000" stroke-width="0.5"/>` + PRINT.txt((x0 + x1) / 2, y - 1.2, '1 mm', { pt: 9.5, anchor: 'middle', struct: 'scale' }); };
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖（助手）', sub: '左＝切面（機轉）　右＝術者視角，同一個狀態；號碼＝跟刀清單',
    sources: ['Duker 2021', 'Kanclerz 2018b', 'Vaziri 2016'], grid: [3, 4],
    ledger: { '2': '結構', '3': '結構', '6': '結構', '9': '結構' },
    legend: { rows: [], orient: [
      '<b>左 切面</b>：上＝前、右＝11 點；3 經 4 點半，6 經切割頭；2、9 trocar 隧道（上＝外）；10 下＝重力',
      '<b>右 術者視角</b>：左眼 OS、術者坐 12 點；inverter 開：下＝12 點、temporal 在左',
      '灰色桿＝器械；黑＝裂孔、傷口；虛線圈＝看這裡',
      '示意：trocar 鐘點、看向、壓法、器械位置、吸起、小珠子、氣泡、頭'] },
    steps: [
      { hd: '方位：左眼 11 點在畫面下方略偏右', views: [                                                              // 1-1, 3-2 line 2
        { kind: 'psec', hp: 11, state: ST.rrd, win: SEC_W,
          draw: all(tag('11 點', 'R'), tag('5 點', 'L', 26.8)), labelOpts: { y0: 4.6, y1: 23.6 },
          labels: [['裂孔', 'HST', 'tearMid'], ['剝離', 'RD', 'srf'], ['fovea', '', 'fovea']] },
        { kind: 'pwide', state: VIEW3_11, win: WIDE_N,
          draw: all(clocks(), tick11, tag(['inverter', '開']), V => ring(V.A.tear, 1.4, { w: 0.6 }), lb('11 點裂孔', '', 'R', 9.6, 'tear')) }] },
      { hd: 'Trocar：pars plana、角膜緣後 4 mm、斜插', views: [                                                      // 2-1 line 4
        { kind: 'psec', plane: PORT_PL, state: ST.portIn, win: PORT_W,
          draw: blade, labelOpts: { y0: 7 },
          labels: [['結膜', 'conj', layer(-G.N.conj * 0.5)], ['鞏膜', 'sclera', layer(IT.Tw * 0.5)], ['pars plana', '', layer(IT.Tw + cil * 0.5)],
            ['斜插', 'oblique', V => P3(V, along(LT * 0.5))]] },
        { kind: 'pscope', state: PORT_IN_R, win: { x: -12.5, y: -10, w: 25, h: 20 },
          draw: all(tag('顯微鏡'), bladeTop, V => PRINT.dim(W3(V, 4.9, 0, 0), W3(V, 4.9, 4, 0)), lb('4 mm', '', 'R', 4.4, V => W3(V, 4.9, 2.2, 0)),
            lb('infusion', '4 點半', 'R', 9.6, V => P3(V, TR.entry)), lb('器械', '1 點半', 'R', 18, 'troc_st'), lb('器械', '10 點半', 'L', 26.8, 'troc_sn')) }] },
      { hd: '開 infusion 前：看到尖端在玻璃體腔', views: [                                                            // 2-2 lines 2–4
        { kind: 'psec', hp: VP.INF_H, state: ST.setup, win: { x: 3.0, y: -10.0, w: 12.5 },
          draw: all(V => ring(P3(V, IT.tip), 1.2, { w: 0.6 }), lb('尖端', 'tip', 'L', 26.8, V => P3(V, IT.tip)),
            lb('剝離的視網膜', '', 'R', 17.4, V => R3(V, ST.setup, VP.INF_H, P.oraAt(VP.INF_H, 1) + 3))) },
        { kind: 'pwide', state: SETUP_INF, win: WIDE_W,
          draw: all(cannulas(SETUP_INF), tag('inverter 開'), tag(['看向', '4 點半'], 'R'), V => ring(P3(V, IT.tip), 1.2, { w: 0.6 }), lb('套管尖端', 'tip', 'L', 26.8, V => P3(V, IT.tip))) }] },
      { hd: '壓的鐘點＝畫面上的隆起（inverter 開）', views: [                                                          // 3-2 lines 3–4
        { kind: 'psec', hp: 11, state: ST.dep, win: { x: 3.2, y: -8.6, w: 14 },
          draw: lb('壓鞏膜器', 'depressor', 'R', 4.4, 'depressor'), labelOpts: { y0: 8 },
          labels: [['隆起', 'mound', 'dep'], ['裂孔', 'HST', 'tearMid']] },
        { kind: 'pwide', state: ST.depOn, win: WIDE_N,
          draw: all(clocks([12, 3, 9]), tick11, tag(['inverter', '開'], 'L', 22.8), V => ring(off180(V), 1.5, { w: 0.5, dash: '0.8 0.6' }),
            lb('inverter 關', '', 'L', 4.4, off180), tag('（推論）', 'L', 8.0), lb('隆起', '11 點', 'R', 9.6, 'dep')) }] },
      { hd: '壓鞏膜：幾點壓幾點；深度、時間聽口令', views: [                                                          // 5-2
        { kind: 'psec', hp: 11, state: ST.dep52, win: { x: 3.2, y: -8.6, w: 14 },
          labels: [['切割頭（切面）', '', 'inst0'], ['助手壓', '', 'depressor'], ['裂孔', 'HST', 'tearMid']] },
        { kind: 'pwide', state: ST.dep52On, win: { x: 5.2 - 13, y: 9.4 - 9.4, w: 26, h: 18.8 },
          draw: tag('inverter 開'), labelOpts: { y0: 5 },
          labels: [['隆起', 'mound', 'dep'], ['切割頭', '', 'inst0'], ['裂孔', '', 'tear']] }] },
      { hd: '馬上說：視網膜被吸起、新裂孔、器械近水晶體', views: [                                                    // 4-2 lines 0, 3
        { kind: 'psec', plane: VP.PLANE42, state: S42, win: { x: -7.0, y: -5.0, w: 14 },
          draw: tag('錯誤示範', 'L', 26.8), labelOpts: { y1: 23 },
          labels: [['切割口', 'port', V => P3(V, PORT42)], ['被吸起的視網膜', '', V => P3(V, SUCK42)]] },
        { kind: 'pwide', state: S42, win: WIDE_W,
          draw: all(tag('inverter 開'), V => ring(P3(V, SUCK42), 1.6, { w: 0.6 })),
          labels: [['吸起（示意）', '', V => P3(V, SUCK42)], ['切割頭', '', 'inst0']], labelOpts: { y0: 8 } }] },
      { hd: 'PFCL 吸乾淨；視網膜下可疑小珠子要提出', views: [                                                        // 6-2 lines 2–4
        { kind: 'psec', hp: 11, state: ST.bead62, win: { x: -3.05, y: 8.98, w: 4.5 },
          draw: all(bar1, V => ring(V.A.bead, (VP.BEAD.r * V.k * 1.6).toFixed(2), { w: 0.6 }), lb('PFCL 小珠子', '視網膜下', 'L', 4.4, 'bead'), lb('fovea', '', 'L', 26.6, 'fovea')) },
        { kind: 'pwide', state: W62B, win: { x: -2.75 - 4.5, y: -4.75 - 3.25, w: 9, h: 6.5 },
          draw: all(tag('inverter 開'), V => ring(V.A.bead, 1.4, { w: 0.6 }), lb('小珠子', 'bead', 'L', 26.8, 'bead'), lb('fovea', '', 'R', 26.8, 'fovea')) }] },
      { hd: '備氣：50 mL 針筒三步（量依院內常規）', views: [                                                          // 7-2 lines 2, 5
        { kind: 'none', win: { x: 0, y: 0, w: 1 },
          draw: V => t95(1.3, 4.4, '① 抽純氣 C3F8', { bold: true }) + syr(4, 29, 6.4, { pure: true }) +
            t95(1.3, 17.2, '② 排到需要的量', { bold: true }) + syr(4, 29, 19.2, { total: VP.SYR.c3f8.range[1] }) },
        { kind: 'none', win: { x: 0, y: 0, w: 1 },
          draw: V => t95(1.3, 4.4, '③ 無菌空氣補到 50 mL', { bold: true }) + syr(4, 29, 6.4) +
            t95(1.3, 14.6, '斜線帶：量依院內常規') + t95(1.3, 18.4, '常用 14%') + t95(1.3, 22.2, '→ 和主刀確認', { bold: true }) + t95(4.6, 25.9, '氣體與濃度', { bold: true }) }] },
      { hd: '拔 cannula：檢查每個傷口、量眼壓', views: [                                                              // 7-3 lines 2–3
        { kind: 'psec', plane: PORT_PL, state: ST.closed, win: PORT_W,
          draw: tunnel, labelOpts: { y0: 4.6 },
          labels: [['斜的隧道合起來', '', V => P3(V, G.add(IC.entry, IC.tdir.map(v => v * 0.6)))], ['氣體', 'gas', layer(IC.Tw + cil + 1.2)]] },
        { kind: 'pscope', state: ST.closed, win: { x: -13, y: -10.5, w: 26, h: 21 },
          draw: all(tag('顯微鏡'), tag(['每個傷口漏不漏', '量眼壓', '一直漏 → 縫'], 'R'),
            V => ['it', 'st', 'sn'].map(id => ring(V.A['cj_' + id] || V.A['troc_' + id], 1.5, { w: 0.5, dash: '0.8 0.6' })).join('')) }] },
      { hd: '術後（例：坐正）：氣泡蓋住 11 點裂孔', views: [                                                          // 8-1 lines 0–1
        { kind: 'phead', state: ST.sit81, win: { x: -13.5, y: -13.5, w: 27, h: 27 },
          draw: all(V => P.headIcon(ST.sit81, 0.8, V.h - 8.6, 8), V => thin([V.A.gasLineA, V.A.gasLineB], '1.2 0.6', 0.45),
            lb('氣體', 'gas', 'L', 9.0, V => V.P([-4, -6])), lb('液面', '', 'L', 18.6, V => V.P([-8, 0])), V => t95(V.A.gArrow[0] - 1.6, V.A.gArrow[1] + 1.2, '重力', { bold: true, anchor: 'end' })),
          labels: [['11 點裂孔', '', 'tearMid']] },
        { kind: 'psec', plane: P.headPlane(ST.sit81), state: ST.sit81, win: { x: -2.0, y: -13.24, w: 9.6 },
          draw: lb('雷射的疤', '示意', 'R', 4.4, V => { const pl = V.r.plane, n = G.unit(G.cross(pl.U, pl.V)), q = P.laserSpots(P.geom(ST.sit81)).find(sp => Math.abs(G.dot(G.sub(sp.p, pl.O), n)) < 0.25); return q ? P3(V, q.p) : null; }),
          labels: [['11 點裂孔', '', 'tearMid'], ['氣體蓋住裂孔', '', V => V.P([1.6, -10.1])]], labelOpts: { y0: 12 } }] },
    ],
  });
}
