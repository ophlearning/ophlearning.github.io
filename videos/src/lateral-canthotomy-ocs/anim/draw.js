// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the orbit model (videos/models/orbit): the axial section seen from below like CT
// (left, mechanism) and the lateral canthus from the front (right, surgeon's view); the two share x (lateral canthus, rim, tubercle).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const note = (s, op, y = PH - 14, x = PW - 12, anchor = 'end') => htext(x, y, s, { size: 13, color: COL.sub, anchor, op });
// windows (mm): left, top, width. AXW = whole orbit; AXZ = lateral canthus (axial); FRW = lateral canthus (front, same x span as AXZ? no —
// the front window is narrower; x positions are shared with the model, not with the panel)
const AXW = { x: -48, y: -26, w: 96 }, AXZ = { x: -30, y: -14.5, w: 34 }, AXZ2 = { x: -33, y: -24.5, w: 40 }, FRW = { x: -25.5, y: -7.4, w: 17 }, EYE = { x: -17.5, y: -11, w: 33 };
const AX_P = { title: '眼窩水平切面（從下往上看，同 CT）', orient: '上＝前　左＝temporal' };
const AXZ_P = { title: '水平切面：外眥（從下往上看）', orient: '上＝前　左＝temporal' };
const FR_P = { title: '正面　右眼 OD　術者視角', orient: '面對病人：左＝temporal' };
const FRW_P = { title: '正面：外眥開窗（拿掉皮膚與眼輪匝肌）', orient: '左＝temporal' };
const OCS = { heme: 1 };
const CUT = { ...OCS, canthotomy: 1 };
const INF = { ...CUT, infLysis: 1 };
const SUP = { ...INF, supLysis: 1 };
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const add2 = (a, d, s) => [a[0] + d[0] * s, a[1] + d[1] * s];
// info card inside a panel: rows of [text, options]; o.hl = index of the highlighted row
function infoCard(x, y, w, rows, op, o = {}) {
  const lh = o.lh || 30, h = o.h || 24 + rows.length * lh;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="#d3dae1"/>`;
  rows.forEach(([t, ro = {}], i) => { const yy = y + 30 + i * lh, on = ro.op ?? 1;
    if (o.hl === i) s += `<rect x="${x + 6}" y="${yy - 21}" width="${w - 12}" height="${lh - 2}" rx="6" fill="rgba(14,124,107,0.10)"/>`;
    s += text(x + 16, yy, t, { size: ro.size || 16, bold: ro.bold, color: ro.color || COL.ink, op: on }); });
  return s + `</g>`;
}
// instruments in the front view (mm → panel px through the view's P)
function hemostat(v, op) {   // straight hemostat clamped from the commissure to the rim, handles running out temporally
  const P = v.P, lc = CORONAL.LC, y = lc[1], x0 = lc[0] + 0.4, x1 = ORBIT.LAT_RIM_X - 1.2, a = P([x0, y]), b = P([x1, y]), k = v.k;
  const h1 = P([x1 - 3.5, y - 1.3]), h2 = P([x1 - 3.5, y + 1.3]), r1 = P([x1 - 6, y - 2.0]), r2 = P([x1 - 6, y + 2.0]);
  return `<g opacity="${op}"><path d="M${a[0]} ${a[1] - 0.18 * k}L${b[0]} ${b[1] - 0.3 * k}L${b[0]} ${b[1] + 0.3 * k}L${a[0]} ${a[1] + 0.18 * k}Z" fill="#7b828c" stroke="#3d434b" stroke-width="1.2"/>`
    + `<path d="M${b[0]} ${b[1] - 0.3 * k}L${h1[0]} ${h1[1]}L${r1[0]} ${r1[1]}M${b[0]} ${b[1] + 0.3 * k}L${h2[0]} ${h2[1]}L${r2[0]} ${r2[1]}" stroke="#3d434b" stroke-width="${0.45 * k}" fill="none" stroke-linecap="round"/>`
    + `<circle cx="${r1[0]}" cy="${r1[1]}" r="${0.9 * k}" fill="none" stroke="#3d434b" stroke-width="${0.3 * k}"/><circle cx="${r2[0]}" cy="${r2[1]}" r="${0.9 * k}" fill="none" stroke="#3d434b" stroke-width="${0.3 * k}"/></g>`;
}
function scissors(v, tip, dir, op, open = 0.25, len = 3.2) {   // blades from the tip back along −dir; dir = where the tips point (mm space)
  const P = v.P, n = [-dir[1], dir[0]], back = add2(tip, dir, -len), w = 0.35 + open;
  const b1 = [add2(tip, n, 0.05), add2(back, n, w), add2(back, n, w * 0.3)], b2 = [add2(tip, n, -0.05), add2(back, n, -w), add2(back, n, -w * 0.3)];
  const q = pts => pts.map(P).map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  return `<g opacity="${op}"><path d="M${q(b1)}Z" fill="#9aa3ad" stroke="#3d434b" stroke-width="1.2"/><path d="M${q(b2)}Z" fill="#b6bec7" stroke="#3d434b" stroke-width="1.2"/></g>`;
}
function forceps(v, at, pull, op, side = 1) {   // two tines holding the lid edge; pull = direction drawn as an arrow (mm space); side −1 = upper lid
  const P = v.P, a = P(add2(at, [0.6, -0.5], 1)), b = P(add2(at, [0.6, 0.5], 1)), c = P(add2(at, [4.5, -0.2], 1)), t = P(at);
  return `<g opacity="${op}"><path d="M${t[0]} ${t[1]}L${a[0]} ${a[1]}L${c[0]} ${c[1]}M${t[0]} ${t[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}" stroke="#3d434b" stroke-width="3" fill="none" stroke-linecap="round"/></g>`
    + arrow(P(add2(at, [0, 1.6 * side], 1)), P(add2(add2(at, [0, 1.6 * side], 1), pull, 2.2)), COL.accent, op);
}
const LCF = () => CORONAL.LC;

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const v = VO.ax({ ...OCS }, PW, PH, AXW, 'tR'), A = v.A;
  let ex = lab('球後血腫', 'retrobulbar hemorrhage', 14, 330, A.heme, { color: '#8e2433', bold: true });
  ex += lab('眼瞼被撐緊', 'lids stretched', PW - 12, 40, A.tension, { side: 'R', color: COL.red, bold: true });
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 120, A.tendon, { bold: true });
  ex += note('右眼，水平切面從下往上看（同 CT）；示意', 1);
  return { R: { svg: v.svg, extra: ex, P: AX_P } };
};

// ---------------------------------------------------------------- 1 什麼時候要做
DRAW2['1-1'] = T => {
  const L = VO.ax({}, PW, PH, AXW, 'aL'), a = L.A;
  const h = T.p(2, 0.05, 0.95), R = VO.ax({ heme: h, noTension: h < 0.95 }, PW, PH, AXW, 'aR'), b = R.A, op1 = T.on(1), op2 = T.on(2), op5 = T.on(5);
  let el = lab('骨頭', 'bony walls', 14, 330, a.latWall, { bold: true });
  el += lab('外眥韌帶', 'lateral canthal tendon', 14, 120, a.tendon, { bold: true, op: op1, color: COL.accent, lc: COL.accent });
  el += lab('眼瞼（投影）', 'lids', PW - 12, 40, a.lid, { side: 'R' });
  el += lab('眶尖', 'apex', PW - 12, 380, a.apex, { side: 'R' });
  let er = lab('球後血腫', 'retrobulbar hemorrhage', 14, 330, b.heme, { color: '#8e2433', bold: true, op: op2 });
  er += lab('前門被韌帶拉住', 'tendon holds', 14, 120, b.tendon, { bold: true, op: T.on(2, 0.6, 1.2) });
  er += lab('眼瞼被撐緊', 'lids stretched', PW - 12, 40, b.tension, { side: 'R', color: COL.red, bold: true, op: T.on(3) });
  // proptosis: the corneal apex moved forward 4.5 mm (dashed line = the position at rest)
  const y0 = R.P([0, -13.1]), y1 = R.P([0, -13.1 - ORBIT.PROP_OCS]), xr = R.P([7.5, 0])[0];
  er += `<g opacity="${op5}"><path d="M${R.P([-6, -13.1])[0]} ${y0[1]}H${R.P([6, -13.1])[0]}" stroke="${COL.amber}" stroke-width="2" stroke-dasharray="6 4"/>${VIEWS.dim([xr, y0[1]], [xr, y1[1]], COL.amber, 1)}</g>`;
  er += lab('前凸 4.5 mm', 'proptosis', PW - 12, 120, [xr + 2, (y0[1] + y1[1]) / 2], { side: 'R', color: COL.amber, bold: true, op: op5 });
  return { L: { svg: L.svg, extra: el, P: { ...AX_P, title: '正常（水平切面，同 CT）' } }, R: { svg: R.svg, extra: er, P: { ...AX_P, title: '球後出血（水平切面，同 CT）' } } };
};
DRAW2['1-2'] = T => {
  const rows = [['① 病史：外傷、手術、眼窩周圍注射', { bold: true, op: T.on(0) }], ['　抗凝血劑：可能占一半', { op: T.on(2) }],
    ['② 眼球前凸', { op: T.on(3) }], ['③ 眼瞼繃緊、撐不開', { op: T.on(3, 0.6, 0.6) }], ['④ RAPD', { op: T.on(3, 0.6, 1.2) }],
    ['⑤ IOP：正常 8–21 mmHg', { op: T.on(4) }], ['　> 30 緊急找眼科；> 40 立刻減壓', { bold: true, color: COL.red, op: T.on(4, 0.6, 1.5) }],
    ['⑥ 視力（可能是晚期徵象）', { op: T.on(5) }], ['診斷確定 → 不等 CT', { bold: true, color: COL.accent, op: T.on(6) }]];
  const R = VO.ax({ ...OCS }, PW, PH, AXW, 'bR'), b = R.A;
  let er = lab('球後血腫', 'retrobulbar hemorrhage', 14, 330, b.heme, { color: '#8e2433', bold: true });
  er += lab('眼瞼被撐緊', 'lids stretched', PW - 12, 40, b.tension, { side: 'R', color: COL.red, bold: true, op: T.on(3) });
  return { L: { svg: infoCard(20, 14, PW - 40, rows, 1, { lh: 40 }), extra: '', P: { title: '床邊判斷', orient: '' } }, R: { svg: R.svg, extra: er, P: AX_P } };
};
DRAW2['1-3'] = T => {
  const rows = [['Open globe：唯一的相對禁忌症', { bold: true, color: COL.red, op: T.on(0) }], ['角膜或鞏膜裂傷', { op: T.on(1) }], ['整圈的結膜下出血', { op: T.on(1, 0.6, 0.8) }],
    ['前房太淺或太深', { op: T.on(1, 0.6, 1.6) }], ['眼內容物脫出、Seidel test 陽性', { op: T.on(2) }], ['瞳孔變形', { op: T.on(2, 0.6, 1.2) }],
    ['IOP 偏低 → 懷疑 open globe，不是 OCS', { bold: true, op: T.on(3) }], ['量 IOP 要輕；必要時先 CT', { op: T.on(4) }]];
  const R = VIEWS.cor({}, PW, PH, EYE, 'gR');
  let er = lab('角膜、鞏膜：有沒有裂傷', 'cornea, sclera', 14, 40, R.P([-6.5, -3.5]), { op: T.on(1) });
  er += lab('瞳孔：形狀', 'pupil', PW - 12, 330, R.P([1.2, 0.8]), { side: 'R', op: T.on(2) });
  er += lab('結膜下出血：是否整圈', 'subconjunctival hemorrhage', PW - 12, 380, R.P([9.5, -1.2]), { side: 'R', op: T.on(1, 0.6, 0.8) });
  return { L: { svg: infoCard(20, 14, PW - 40, rows, 1, { lh: 44 }), extra: '', P: { title: '動手之前', orient: '' } }, R: { svg: R.svg, extra: er, P: { title: '正面　右眼 OD', orient: '檢查者面對病人：左＝temporal' } } };
};
DRAW2['1-4'] = T => {
  // time axis 0 → 300 min (bar), zones from Hayreh 2004; 2 h mark from McCallum 2019
  const x0 = 90, x1 = FW - 90, X = m => x0 + (x1 - x0) * m / 300, y = 170, hgt = 46, o = [];
  const z = [[0, 97, '#3c9a6b', '沒有可偵測的損傷', T.on(0)], [97, 240, '#e0a03a', '越久傷得越重', T.on(1)], [240, 300, '#c8423b', '大範圍不可逆', T.on(1, 0.6, 1.2)]];
  for (const [a, b, c, s, op] of z) o.push(`<g opacity="${op}"><rect x="${X(a)}" y="${y}" width="${X(b) - X(a)}" height="${hgt}" fill="${c}" opacity="0.85"/>${text((X(a) + X(b)) / 2, y + 30, s, { size: 17, bold: true, color: '#fff', anchor: 'middle' })}</g>`);
  o.push(`<path d="M${x0} ${y + hgt}H${x1}" stroke="${COL.ink}" stroke-width="2"/>`);
  for (const [m, s, op] of [[0, '0', T.on(0)], [97, '97 分鐘', T.on(0)], [240, '約 240 分鐘', T.on(1)]]) o.push(`<g opacity="${op}"><path d="M${X(m)} ${y + hgt}v10" stroke="${COL.ink}" stroke-width="2"/>${text(X(m), y + hgt + 32, s, { size: 16, bold: true, anchor: 'middle' })}</g>`);
  o.push(text(x0, y - 22, '獼猴 central retinal artery 暫時夾住的時間（Hayreh 2004）', { size: 16, color: COL.sub }));
  const op2 = T.on(2), m2 = X(120);
  o.push(`<g opacity="${op2}"><path d="M${X(0)} ${y + hgt + 70}H${m2}" stroke="${COL.accent}" stroke-width="5"/><path d="M${m2} ${y + hgt + 58}v24" stroke="${COL.accent}" stroke-width="3"/>${text(m2 + 12, y + hgt + 77, '臨床：2 小時內處置，視力結果較好', { size: 16, bold: true, color: COL.accent })}</g>`);
  o.push(`<g opacity="${T.on(3)}">${text(x0, y + hgt + 128, '延遲到院仍要做：有延遲減壓後視力恢復的報告', { size: 16 })}</g>`);
  return { F: { svg: o.join(''), extra: '', P: { title: '視網膜缺血的時間', orient: '' } } };
};

// ---------------------------------------------------------------- 2 準備
DRAW2['2-1'] = T => {
  const cl = T.p(2, 0.3, 1), L = VO.ax({ ...OCS, clamp: cl, noTension: 1 }, PW, PH, AXZ, 'pL'), a = L.A, M = L.M;
  const R = VO.fr({ clamp: T.on(3, 0.6, 0), lower: { rimShow: 1 } }, PW, PH, FRW, 'pR'), b = R.A, lc = LCF();
  // instruments point to the lateral orbital rim, away from the globe
  let el = arrow(L.P(M.lc), L.P([M.rim[0] + 1.2, M.rim[1] - 1.4]), COL.accent, T.on(1));
  el += lab('器械朝外側眶緣、遠離眼球', 'toward the rim', 14, 40, L.P([(M.lc[0] + M.rim[0]) / 2, (M.lc[1] + M.rim[1]) / 2 - 1]), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(1) });
  el += lab('外側眶緣', 'lateral orbital rim', 14, 330, a.rim);
  const lrT = ORBIT.rectus(-1, ORBIT.PROP_OCS).T, lrA = L.P(lrT.off(lrT.near([-13.5, 2]), 0));   // the part of the muscle inside this window
  el += lab('外直肌', 'lateral rectus', PW - 12, 330, lrA, { side: 'R', op: T.on(1) });
  el += lab('hemostat 壓痕', 'crush', PW - 12, 40, a.clamp, { side: 'R', op: T.on(2, 0.6, 0.6) });
  let svgR = R.svg;
  svgR += arrow(R.P([lc[0] + 0.3, lc[1] + 0.9]), R.P([ORBIT.LAT_RIM_X + 0.8, lc[1] + 0.9]), COL.accent, T.on(0) * (1 - T.on(2)));
  svgR += hemostat(R, T.on(2) * (1 - T.on(3, 0.5, 1.4)));
  let er = lab('局麻：外眥', 'local anesthesia', PW - 12, 40, R.P([lc[0], lc[1] - 0.3]), { side: 'R', op: T.on(0) * (1 - T.on(2)) });
  er += lab('直 hemostat：外眥 → 外側眶緣', 'straight hemostat', PW - 12, 40, R.P([lc[0] - 2.5, lc[1]]), { side: 'R', bold: true, op: T.on(2) * (1 - T.on(3, 0.5, 1.4)) });
  er += lab('夾 1 分鐘後的壓痕', 'crushed line', PW - 12, 40, R.P([lc[0] - 2.5, lc[1]]), { side: 'R', bold: true, op: T.on(3, 0.6, 1.4) });
  er += lab('外側眶緣（皮膚下）', 'rim', 14, 360, R.P([ORBIT.LAT_RIM_X + 0.1, 2.2]));
  return { L: { svg: L.svg, extra: el, P: AXZ_P }, R: { svg: svgR, extra: er, P: FR_P } };
};

// ---------------------------------------------------------------- 3 Lateral canthotomy
DRAW2['3-1'] = T => {
  const c = T.p(0, 0.15, 0.95), w = T.on(1, 0.8), L = VO.ax({ ...OCS, clamp: 1, canthotomy: c, noTension: 1 }, PW, PH, AXZ, 'cL'), a = L.A;
  const R = VO.fr({ clamp: 1, canthotomy: c, window: w, lower: { rimShow: 1 } }, PW, PH, FRW, 'cR'), b = R.A, M = R.M, lc = LCF();
  let svgR = R.svg + scissors(R, [lerp(lc[0], ORBIT.LAT_RIM_X + 0.4, c) - 0.6, lc[1]], [-1, 0], (1 - w) * T.on(0, 0.4));
  let el = lab('外眥切開', 'lateral canthotomy', 14, 40, a.canthotomy, { bold: true, color: COL.red, lc: COL.red, op: T.on(0, 0.4) });
  el += lab('外眥韌帶還連著', 'tendon still attached', 14, 330, a.tendon, { bold: true, op: T.on(1) });
  el += lab('眼瞼還被撐緊', 'lids still tight', PW - 12, 40, a.lidLat, { side: 'R', op: T.on(2) });
  let er = lab('Iris scissors：水平剪到外側眶緣', 'canthotomy', PW - 12, 40, R.P([lc[0] - 2.5, lc[1]]), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: (1 - w) * T.on(0, 0.4) });
  er += lab('上支', 'superior crus', 14, 40, b.supCrus, { bold: true, op: w });
  er += lab('下支', 'inferior crus', 14, 360, b.infCrus, { bold: true, op: w });
  return { L: { svg: L.svg, extra: el, P: AXZ_P }, R: { svg: svgR, extra: er, P: w > 0.5 ? FRW_P : FR_P } };
};

// ---------------------------------------------------------------- 4 Inferior cantholysis
DRAW2['4-1'] = T => {
  const L = VO.ax({ ...CUT, noTension: 1 }, PW, PH, AXZ, 'dL'), a = L.A, R = VO.fr({ canthotomy: 1, window: 1 }, PW, PH, FRW, 'dR'), b = R.A;
  let el = lab('外眥韌帶', 'lateral canthal tendon', 14, 330, a.tendon, { bold: true });
  el += lab('Whitnall 結節（眶緣後 1.5 mm）', 'tubercle', 14, 380, a.tubercle, { bold: true, color: COL.accent, lc: COL.accent, op: T.on(1) });
  el += lab('外側眶緣', 'lateral orbital rim', 14, 40, a.rim);
  let er = lab('上支', 'superior crus', 14, 40, b.supCrus, { bold: true, op: T.on(2) });
  er += lab('下支', 'inferior crus', 14, 380, b.infCrus, { bold: true, op: T.on(2) });
  er += lab('Whitnall 結節', 'tubercle', 14, 200, b.tubercle, { bold: true, color: COL.accent, lc: COL.accent });
  er += lab('瞼板', 'tarsus', PW - 12, 40, b.tarsusU, { side: 'R' });
  er += lab('外側眶緣', 'rim', 14, 290, b.rimEdge);
  return { L: { svg: L.svg, extra: el, P: AXZ_P }, R: { svg: R.svg, extra: er, P: FRW_P } };
};
DRAW2['4-2'] = T => {
  const k = T.p(2, 0.25, 0.9), pull = T.p(3, 0.1, 0.7), L = VO.ax({ ...CUT, infLysis: k, pull: k >= 1 ? pull : 0, noTension: 1 }, PW, PH, VIEWS.zwin(AXZ, AXZ2, T.p(3, 0, 0.4)), 'eL'), a = L.A;
  const R = VO.fr({ canthotomy: 1, window: 1, infLysis: k }, PW, PH, FRW, 'eR'), b = R.A, M = R.M, sc = M.scInf;
  const strum = 0.45 * Math.sin(T.p(1, 0, 1) * Math.PI * 6) * (1 - T.on(2, 0.3));   // scissors tips sweep across the crus (strumming)
  let svgR = R.svg + forceps(R, [-13.2, CORONAL.Ly(-13.2) + 0.15], [1, -0.25], T.on(0) * (1 - T.on(4)));
  svgR += scissors(R, add2([sc.tip[0] + strum, sc.tip[1]], sc.dir, 1.0), sc.dir, T.on(1, 0.5) * (1 - T.on(3, 0.5)), 0.25 * (1 - k));
  svgR += arrow(R.P(add2(sc.tip, sc.dir, 1.4)), R.P(add2(sc.tip, sc.dir, 3.0)), COL.ink, T.on(1, 0.5) * (1 - T.on(3, 0.5)), 'arrK');
  let er = lab('鑷子：下眼瞼往內、往前提', 'forceps', PW - 12, 380, R.P([-11.5, CORONAL.Ly(-11.5) + 1.2]), { side: 'R', bold: true, op: T.on(0) * (1 - T.on(4)) });
  er += lab('剪刀尖朝下（朝下巴）', 'tips toward the chin', 14, 380, R.P(add2(sc.tip, sc.dir, 3.0)), { bold: true, op: T.on(1, 0.5) * (1 - T.on(3, 0.5)) });
  er += lab('下支：像弦一樣繃緊', 'inferior crus', 14, 40, b.infCrus, { bold: true, color: COL.accent, lc: COL.accent, op: T.on(1) * (1 - T.on(2, 0.4, 1)) });
  er += lab('下支切斷', 'inferior cantholysis', 14, 40, R.P(sc.tip), { bold: true, color: COL.red, lc: COL.red, op: T.on(2, 0.4, 1) });
  let el = lab('下支切斷：下眼瞼放開', 'lid released', 14, 40, a.cantholysis, { bold: true, color: COL.red, lc: COL.red, op: T.on(2, 0.4, 1) });
  el += lab('下眼瞼整片離開眼球', 'lid comes away', PW - 12, 40, a.pull || a.lidEnd, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(3, 0.6, 0.3) });
  el += note('屍體研究：8 眼中 7 眼 IOP < 20 mmHg', T.on(4));
  return { L: { svg: L.svg, extra: el, P: AXZ_P }, R: { svg: svgR, extra: er, P: FRW_P } };
};

// ---------------------------------------------------------------- 5 重測與 superior cantholysis
DRAW2['5-1'] = T => {
  const k = T.p(2, 0.3, 0.95), L = VO.ax({ ...INF, supLysis: k, noTension: 1 }, PW, PH, AXZ, 'fL'), a = L.A;
  const R = VO.fr({ canthotomy: 1, window: 1, infLysis: 1, supLysis: k }, PW, PH, FRW, 'fR'), b = R.A, sc = R.M.scSup;
  let svgR = R.svg + forceps(R, [-13.2, CORONAL.Uy(-13.2) - 0.15], [0.5, -0.85], T.on(2) * (1 - T.on(4)), -1);
  svgR += scissors(R, add2(sc.tip, sc.dir, 1.0), sc.dir, T.on(2, 0.4) * (1 - T.on(4, 0.5)), 0.25 * (1 - k));
  svgR += arrow(R.P(add2(sc.tip, sc.dir, 1.4)), R.P(add2(sc.tip, sc.dir, 3.0)), COL.ink, T.on(2, 0.4) * (1 - T.on(4, 0.5)), 'arrK');
  // the lacrimal gland and the levator aponeurosis lie superior and lateral, deeper: point the way, do not cut deep
  svgR += arrow(R.P([sc.tip[0] - 0.4, sc.tip[1] - 2.8]), R.P([sc.tip[0] - 1.6, sc.tip[1] - 5.4]), COL.amber, T.on(3), 'arrM');
  let er = lab('剪刀尖朝上、往後', 'tips up and back', PW - 12, 200, R.P(add2(sc.tip, sc.dir, 3.0)), { side: 'R', bold: true, op: T.on(2, 0.4) * (1 - T.on(4, 0.5)) });
  er += lab('上方較深處：淚腺、levator', 'lacrimal gland, levator', 14, 40, R.P([sc.tip[0] - 1.6, sc.tip[1] - 5.2]), { bold: true, color: COL.amber, lc: COL.amber, op: T.on(3) });
  er += lab('上支切斷', 'superior cantholysis', 14, 360, R.P(sc.tip), { bold: true, color: COL.red, lc: COL.red, op: T.on(2, 0.5, 1.2) });
  er += lab('下支已斷', 'inferior crus cut', 14, 300, b.infCut || R.P(R.M.infCut), { op: 1 - T.on(2) });
  let el = lab('重測 IOP、視力', 'recheck', PW - 12, 40, a.lidEnd, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0) * (1 - T.on(2)) });
  el += lab('上支在這個平面上方', 'superior crus, above this plane', 14, 330, a.tendon, { op: T.on(1) });
  el += lab('上支切斷：只剩結節上的殘端', 'stump', 14, 380, a.tubercle, { bold: true, color: COL.red, lc: COL.red, op: T.on(2, 0.5, 1.2) });
  el += note('屍體研究：8 眼中 2 眼要再剪上支', T.on(4));
  return { L: { svg: L.svg, extra: el, P: AXZ_P }, R: { svg: svgR, extra: er, P: FRW_P } };
};
DRAW2['5-2'] = T => {
  const box = (x, y, w, h, t1, t2, col, op, hl) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${hl ? 'rgba(14,124,107,0.08)' : '#fff'}" stroke="${col}" stroke-width="2"/>${text(x + w / 2, y + 34, t1, { size: 18, bold: true, color: col, anchor: 'middle' })}${text(x + w / 2, y + 62, t2, { size: 14.5, color: COL.sub, anchor: 'middle' })}</g>`;
  const W = 260, H = 84, y = 40, xs = [40, 340, 640, 940], o = [];
  o.push(box(xs[0], y, W, H, 'Canthotomy＋下支', '床邊', COL.ink, 1));
  o.push(box(xs[1], y, W, H, '＋上支', '床邊', COL.ink, 1));
  o.push(box(xs[2], y, W, H, '藥物', '效果有限', COL.amber, T.on(0)));
  o.push(box(xs[3], y, W, H, '開刀房', '眼科進一步減壓', COL.red, T.on(1), true));
  for (let i = 0; i < 3; i++) o.push(arrow([xs[i] + W + 6, y + H / 2], [xs[i + 1] - 8, y + H / 2], COL.line, i < 2 ? 1 : T.on(1), 'arrK', 2));
  o.push(`<g opacity="${T.on(2)}">${text(xs[3], y + H + 44, '・擴大切開眶隔', { size: 17, bold: true })}${text(xs[3], y + H + 74, '・Bony orbital decompression', { size: 17, bold: true })}</g>`);
  o.push(`<g opacity="${T.on(3)}">${text(40, y + H + 128, '眶隔加開的屍體研究：一個有額外降壓（Oester 2012a），一個沒有（Haubner 2015）', { size: 16 })}</g>`);
  o.push(`<g opacity="${T.on(4)}">${text(40, y + H + 170, '日本 4 例 bony decompression（LCC 後瞳孔反應沒改善、眼窩仍硬）：', { size: 16, bold: true })}`
    + `${text(60, y + H + 200, '術前數指以上 2 例 → 完全恢復', { size: 16, color: COL.accent, op: T.on(5) })}${text(60, y + H + 228, '無光覺 2 例 → 1 例進步到光覺，1 例沒有改善', { size: 16, color: COL.red, op: T.on(5, 0.6, 1.5) })}</g>`);
  return { F: { svg: o.join(''), extra: '', P: { title: 'IOP 還是高：升級處置', orient: '' } } };
};

// ---------------------------------------------------------------- 6 術後與 CT
DRAW2['6-1'] = T => {
  const L = VO.ax({ ...SUP }, PW, PH, AXW, 'hL'), a = L.A, R = VO.ax({ ...OCS, tentShow: T.on(4) > 0 ? 1 : 0, noTension: 1 }, PW, PH, AXW, 'hR'), b = R.A, N = R.r.N;
  let el = lab('外眥傷口：這個病例不縫', 'wound left open', 14, 40, a.canthotomy, { bold: true, op: T.on(0) });
  el += lab('出血持續 → 壓力再升', 'ongoing bleeding', 14, 330, a.heme, { bold: true, color: '#8e2433', lc: '#8e2433', op: T.on(1) });
  el += note('減壓後反覆重測 IOP、視力、瞳孔', T.on(2));
  let er = lab('放鬆後才排 CT', 'CT after decompression', 14, 40, b.globe, { bold: true, op: T.on(3) });
  er += lab(`globe tenting ${N.angle.toFixed(0)}°（示意）`, '', PW - 12, 220, b.tentArm, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(4) });
  er += `<g opacity="${T.on(4)}">${htext(PW - 12, 260, '< 130°：tenting', { size: 15, anchor: 'end' })}${htext(PW - 12, 286, '< 120°＋急性前凸：外科急症', { size: 15, bold: true, color: COL.red, anchor: 'end', op: T.on(5) })}</g>`;
  er += lab('血腫、骨折', 'hematoma, fracture', 14, 330, b.heme, { op: T.on(3) });
  return { L: { svg: L.svg, extra: el, P: { ...AX_P, title: '減壓之後' } }, R: { svg: R.svg, extra: er, P: { ...AX_P, title: 'CT 上看什麼（示意）' } } };
};

// ---------------------------------------------------------------- 7 值班清單
DRAW2['7'] = T => {
  const items = ['外傷或手術後：前凸、眼瞼繃緊、RAPD → 想到 OCS，量 IOP', '先排除 open globe', '診斷確定就做，不等 CT；同時通知主治', '局麻；hemostat 從外眥夾到眶緣 1 分鐘',
    'Canthotomy 剪到外側眶緣；器械遠離眼球', '剪刀朝下、撥到下支、剪斷；直到下眼瞼整片鬆開', '重測 IOP；還高剪上支，再不行進開刀房', '反覆重測；放鬆之後才排 CT'];
  let hl = -1; for (let i = 0; i < items.length; i++) if (T.on(i + 1, 0.3) > 0.5) hl = i;
  const rows = items.map((s, i) => [`${'一二三四五六七八'[i]}、${s}`, { size: 17, bold: i === hl, op: 0.35 + 0.65 * T.on(i + 1, 0.4) }]);
  return { F: { svg: infoCard(30, 12, FW - 60, rows, 1, { lh: 46, hl }), extra: '', P: { title: '值班清單', orient: '' } } };
};
