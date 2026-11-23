// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Two synced views of the eyelid model (videos/models/eyelid), both from the same state:
//   · the surgical steps: the axial section at the canthal level (seen from below like CT: anterior up, temporal left) + the coronal
//     lateral canthus (surgeon's view, facing the patient: temporal left); both panels use the same x window, so the canthus, the rim,
//     the wedge and the fixation point line up;
//   · the mechanism and the end check: the lower-lid sagittal section + the coronal skin side.
// The model has no Bick wedge: the wedge (coronal triangle) and the full-thickness cut (axial lines across the lid) are drawn here from
// params.js (WEDGE), schematic, the same as the printed sheets. The tarsal end sutured to the periosteum borrows the model's stripFix (示意).
// Right eye (OD); the case is OS: every panel title says so.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34, W = PW) => htext(W / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width. AXC and CANTH share x (the axial and the coronal canthus side by side line up)
const SAG = { x: -19.2, y: 1.2, w: 24 }, COR = { x: -21, y: -7.5, w: 38 };
const AX = { x: -29, y: -24, w: 38 }, AXC = { x: -25.6, y: -9.2, w: 18 }, CANTH = { x: -25.6, y: -6.6, w: 18 };
const SAG_P = { title: '下眼瞼矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD（本台 OS 左右相反）', orient: '術者視角：左＝temporal　右＝nasal' };
const AX_P = { title: '外眥水平切面 axial（從下往上看，同 CT）', orient: '上＝前　左＝temporal' };
const CANTH_P = { title: '正面外眥　右眼 OD（本台 OS 左右相反）', orient: '術者視角：左＝temporal' };
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, COR_P, AX_P, CANTH_P]);
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const shape = (q, fill, stroke, op = 1, w = 2.4, dash = '') => `<path d="${pathOf(q)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1) => p ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>` : '';
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const fade = (a, b, k) => `<g opacity="${(1 - k).toFixed(3)}">${a}</g><g opacity="${k.toFixed(3)}">${b}</g>`;
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}
// a point on the projected lower lid in the axial view at fraction f of its length (or at coronal x when x is given), d mm toward the front
function lidOff(av, f, d, x) {
  const T = LID.track(av.r.lidPts), q = x === undefined ? T.L * f : WEDGE.qAt(T, x), p = T.off(q, 0), n = T.off(q, 1), s = n[1] < p[1] ? 1 : -1;
  return av.P(T.off(q, s * d));
}
// the wedge in both views (panel px): coronal triangle; axial cut lines at the wedge's two x; the axial excised piece
const corWedge = cv => WEDGE.cor(cv.r).map(cv.P);
const axCuts = av => [BP.wedge.xa, BP.wedge.xb].map(x => WEDGE.axLine(av.r.lidPts, x).map(av.P));
const axPiece = av => WEDGE.axPiece(av.r.lidPts).map(av.P);
// part of a polyline (0–1 of its length), for lines drawn progressively
function partial(q, k) {
  if (k >= 1) return q; if (k <= 0) return [q[0], q[0]];
  let L = 0; for (let i = 1; i < q.length; i++) L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
  let need = L * k; const out = [q[0]];
  for (let i = 1; i < q.length; i++) { const d = Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
    if (need <= d) { out.push([lerp(q[i - 1][0], q[i][0], need / d), lerp(q[i - 1][1], q[i][1], need / d)]); return out; } need -= d; out.push(q[i]); }
  return out;
}
// coronal: the suture from the lateral end of the lower tarsus (at the canthus) to the periosteum inside the rim (under the skin: dashed; 示意)
const corFixSut = (cv, k, op = 1) => { const a = cv.P([cv.M.lcL[0] + 0.8, cv.M.lcL[1] + 1.0]), b = cv.P(cv.r.tubercle), c = [lerp(a[0], b[0], 0.5), Math.max(a[1], b[1]) + 18];
  const q = []; for (let i = 0; i <= 16; i++) { const t = i / 16; q.push([(1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]]); }
  return curve(partial(q, k), COL.suture, 2.4, op, '6 4'); };
const canthLine = cv => [cv.A.lcL, cv.P([cv.r.latRimX + 0.4, cv.M.lcL[1]])];   // coronal: the canthotomy line from the canthus to the rim
const RIM_C = cv => cv.P([cv.r.latRimX + 0.1, 3.0]), RIM_Y = PH - 28;                              // coronal: a point on the rim (dashed, under the skin)

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VL.lcor(BP.pre, PW, PH, COR, 'tR'), B = cv.A;
  let ex = lab('睫毛往內刷到角膜（示意）', 'inturned lashes', 14, 64, B.lashMidL, { color: COL.red, bold: true });
  ex += lab('外眥', 'lateral canthus', 14, 150, B.lcL, { bold: true });
  const wc = corWedge(cv), ow = T.on(1, 0.6, 0.6);
  ex += shape(wc, 'rgba(210,60,60,0.22)', COL.red, ow, 2.2, '6 4');
  ex += lab('楔形切除的位置（示意）', 'wedge', 14, PH - 74, wc[1], { color: COL.red, bold: true, op: ow });
  ex += note('內翻與鬆弛的程度：示意', 1, PH - 14);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1-1'] = T => {
  const k1 = T.p(1, 0.1, 0.8), k2 = T.p(2, 0.1, 0.8), ax = T.on(3, 0.6) * (1 - T.on(4, 0.6)), fin = T.on(4, 0.6);
  const base = 0.3 * k1 + 0.35 * k2 + 0.15 * T.on(3, 0.6), st = { dehis: k1 * (1 - fin), override: k2 * (1 - fin), entr: lerp(base, BP.pre.entr, fin) };
  const sv = VL.lsag(st, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor(st, PW, PH, COR, 'cR'), B = cv.A;
  let svg = sv.svg, ex = '', P = SAG_P;
  const s0 = 1 - ax;
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R', bold: true, op: s0 });
  ex += lab('囊瞼筋膜（retractor）', 'capsulopalpebral fascia', PW - 12, 250, A.cpfEnd, { side: 'R', bold: true, color: k1 > 0.3 ? COL.red : COL.ink, op: s0 * T.on(1, 0.6) * (1 - fin) });
  if (A.dehisGap) ex += lab('從瞼板下緣鬆脫', 'retractor dehiscence', PW - 12, 300, A.dehisGap, { side: 'R', color: COL.red, bold: true, op: s0 * ss(0.4, 0.8, k1) * (1 - fin) });
  ex += lab('瞼板前 orbicularis', 'pretarsal', 14, 150, A.orbPT, { op: s0 * T.on(2, 0.6) * (1 - fin) });
  if (A.override) ex += lab('眶隔前 orbicularis 往上跨', 'preseptal override', 14, 196, A.override, { color: COL.red, bold: true, op: s0 * ss(0.3, 0.7, k2) * (1 - fin) });
  ex += lab('角膜', 'cornea', 14, 64, A.cornea, { op: s0 * (1 - fin) });
  ex += lab('睫毛刷到角膜', 'lashes on the cornea', 14, 64, A.lashL, { color: COL.red, bold: true, op: fin });
  if (ax > 0.01) {   // line 3: horizontal laxity in the axial section — the lax lid can be pulled far off the globe
    const av = VL.axial({ lax: 1, distract: T.p(3, 0.3, 0.75) }, PW, PH, AX, 'aL'), X = av.A;
    svg = fade(sv.svg, av.svg, ax); P = ax > 0.5 ? AX_P : SAG_P;
    ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 236, X.tendon, { op: ax });
    ex += lab('整片眼瞼變鬆：拉得離眼球很遠', 'horizontal laxity', PW - 12, 64, X.distract, { side: 'R', color: COL.red, bold: true, op: ax * T.on(3, 0.6, 1.0) });
    ex += lab('下眼瞼（投影）', 'lower lid, projected', 14, 150, lidOff(av, 0.82, 1.2), { op: ax });
  }
  let rx = lab('下瞼緣往內翻', 'margin turns in', 14, 64, B.lashMidL, { color: COL.red, bold: true, op: ss(0.45, 0.75, st.entr) });
  rx += infoCard(12, 262, 582, [['這位病人（門診記錄）', { bold: true, color: COL.accent }], ['Horizontal laxity；睫毛刷到角膜（trichiasis）', {}], ['角膜下方點狀上皮病變（inferior SPK）', {}]], fin, { h: 104 });
  rx += tag('Retractors 鬆脫：被認為是最主要的原因', T.on(1, 0.6) * (1 - T.on(2)), COL.accent, PH - 20);
  return { L: { svg, extra: ex, P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  // left: the lax lid pulled far off the globe; line 3: after the shortening (model: the tarsal end fixed, stripFix) it stays close (示意)
  const aft = T.on(3, 0.8), pull = T.p(0, 0.2, 0.7);
  const a0 = VL.axial({ lax: 1, distract: pull }, PW, PH, AX, 'aL'), a1 = VL.axial({ lax: 1, ...BS.FIXED, distract: 1 }, PW, PH, AX, 'aL2');
  let ex = lab('水平鬆弛：拉得離眼球很遠', 'horizontal laxity', PW - 12, 64, a0.A.distract, { side: 'R', color: COL.red, bold: true, op: T.on(0, 0.6, 1.0) * (1 - aft) });
  ex += lab('縮短之後：拉不開、貼住眼球（示意）', 'after shortening', PW - 12, 64, a1.A.distract, { side: 'R', color: COL.accent, bold: true, op: aft });
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 290, a0.A.tendon, { op: 1 - aft });
  ex += lab('眼球', 'globe', PW - 12, 340, a0.P([4, 0]), { side: 'R' });
  const cv = VL.lcor(BP.pre, PW, PH, COR, 'cR');
  let rx = '';
  rx += infoCard(12, 262, 582, [['Horizontal laxity 明顯 → 水平縮短', { bold: true, color: COL.accent }], ['垂直與水平兩個成分都處理，長期效果最好', {}]], T.on(0, 0.6) * (1 - T.on(1)), { h: 78 });
  rx += infoCard(12, 262, 582, [['同時有水平與垂直鬆弛的內翻（一個系列）', { bold: true, color: COL.accent }], ['只做水平縮短：復發 7%（54 個裡 4 個）', {}], ['合併其他術式：8%　→ 依主要的致病因素選術式', { color: T.on(2, 0.6) > 0.5 ? COL.ink : COL.sub }]],
    T.on(1, 0.6) * (1 - T.on(3)), { h: 104 });
  rx += infoCard(12, 262, 582, [['本台', { bold: true, color: COL.accent }], ['門診記錄：horizontal laxity', {}], ['Modified Bick；附加術式：無', { bold: true }]], T.on(3, 0.6), { h: 104 });
  rx += lab('睫毛刷到角膜', 'trichiasis', 14, 64, cv.A.lashMidL, { color: COL.red, bold: true });
  return { L: { svg: fade(a0.svg, a1.svg, aft), extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-3'] = T => {
  let s = '';
  // left: the two techniques as cards with a thumbnail of the model (LTS: axial; Bick: coronal canthus with the wedge)
  const cw = 290, chh = 388, Y0 = 8, xs = [14, 316];
  const cards = [
    { li: 0, name: 'Lateral tarsal strip', kind: 'ax', steps: ['外眥切開＋剪斷下支', '外側瞼板做成一條', '縫到外側眶緣的骨膜'], cap: '外眥水平切面（示意）' },
    { li: 1, name: 'Bick', kind: 'cor', steps: ['外眥附近全層切掉三角形', '切多少依鬆弛程度', '瞼板斷端縫到眶緣骨膜'], cap: '正面外眥（示意）' }];
  cards.forEach((c, i) => { const x = xs[i], op = Math.max(0.3 * T.on(0, 0.6, i * 0.2), T.on(c.li, 0.6)), hl = i === 1 ? T.on(1, 0.6) : 0;
    s += card(x, Y0, cw, chh, { op, hl }) + `<g opacity="${op}">${text(x + 16, Y0 + 32, c.name, { size: 18, bold: true })}`;
    const bw = cw - 24, bh = 150, bx = x + 12, by = Y0 + 46, cid = 'th' + i;
    let body = '';
    if (c.kind === 'ax') { const win = { x: -25.5, y: -7.4, w: 17 }, cm = VIEWS.cam(win, bw, bh); body = `<g transform="${cm.tf}">${CANTHUS.draw({ state: { lax: 1, canthotomy: 1, cantholysis: 1, strip: 1, stripFix: 1 }, id: cid }).svg}</g>`; }
    else { const win = { x: -21, y: -4.6, w: 14 }, cm = VIEWS.cam(win, bw, bh), r = CORONAL.draw({ variant: 'asian', state: {}, lower: { rimShow: 1 }, id: cid, windows: [], section: false });
      body = `<g transform="${cm.tf}">${r.svg}</g>` + shape(WEDGE.cor(r).map(cm.P), 'rgba(210,60,60,0.25)', COL.red, 1, 2.2); }
    s += `<clipPath id="${cid}C"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6"/></clipPath><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fff" stroke="#d3dae1"/><g clip-path="url(#${cid}C)"><g transform="translate(${bx} ${by})">${body}</g></g>`;
    s += htext(bx + bw - 8, by + bh - 8, c.cap, { size: 12, color: COL.sub, anchor: 'end' });
    c.steps.forEach((t2, j) => { s += text(x + 16, by + bh + 28 + j * 26, '· ' + t2, { size: 14.5 }); });
    s += `</g>`; });
  const pill = (x, y, t, col, op, fill) => { const w = measure(t, 14, true) + 22; return `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="${fill}" stroke="${col}"/>${text(x + w / 2, y + 19, t, { size: 14, bold: true, color: col, anchor: 'middle' })}</g>`; };
  s += pill(xs[1] + 14, Y0 + 300, '外眥處縮短：瞼緣不留 notch', COL.accent, T.on(2, 0.6), 'rgba(14,124,107,0.10)');
  s += pill(xs[1] + 14, Y0 + 340, '缺點：外眥角變圓、往內移', COL.amber, T.on(5, 0.6), 'rgba(184,110,0,0.10)');
  // right: results (two retrospective series)
  const x0 = 790, K = 330 / 100, X1 = 624;
  s += `<g opacity="${T.on(3, 0.5)}">${text(X1, 30, '結果（回溯性研究，病人不是隨機分組）', { size: 16, bold: true })}<path d="M${x0} 44V398" stroke="#7d8a97" stroke-width="1.4"/></g>`;
  const G = [
    [3, 62, 'Vahdani 2018　641 次手術（Bick 84 次）', [['Bick 解剖成功', 100, '100%', COL.accent], ['LTS 解剖成功', 89.1, '89.1%', '#7d8a97']], '再手術：Bick 0、LTS 9%'],
    [4, 214, 'Poon 2019　內翻（各合併 ES 或 LLRP）', [['Bick 治癒', 100, '100%', COL.accent], ['LTS＋ES 治癒', 92, '92%', '#7d8a97'], ['LTS＋LLRP 治癒', 90, '90%', '#7d8a97']], '再手術：Bick 0、LTS 7%／6.5%']];
  G.forEach(([li, y, h1, bars, foot]) => { const op = T.on(li, 0.5), g = ss(T.st(li) + 0.3, T.st(li) + 1.4, T.u);
    s += `<g opacity="${op}">${text(X1, y, h1, { size: 15, bold: true })}`;
    bars.forEach(([nm, v, lbl, col], j) => { const by = y + 12 + j * 30, w = v * K * g;
      s += text(x0 - 10, by + 17, nm, { size: 14, anchor: 'end' }) + `<rect x="${x0}" y="${by}" width="${w.toFixed(1)}" height="22" rx="4" fill="${col}"/>` + text(x0 + w + 8, by + 17, lbl, { size: 15, bold: true, color: col === COL.accent ? COL.accent : COL.ink, op: g }); });
    s += text(x0 + 10, y + 12 + bars.length * 30 + 20, foot, { size: 14.5, color: COL.sub }) + `</g>`; });
  s += htext(1000, 392, '兩個研究都是回溯性的', { size: 15, bold: true, color: COL.amber, anchor: 'middle', op: T.on(5, 0.6) });
  return { F: { svg: s, P: { title: 'Bick 與 lateral tarsal strip（LTS）', orient: 'ES＝everting sutures　LLRP＝retractor plication' } } };
};

// ---------------------------------------------------------------- 2 術前評估
DRAW2['2'] = T => {
  // lines 0–2 (axial): distraction test on the lax lid, then the lid is let go and comes back only partly (snap-back, schematic)
  const pull = T.p(0, 0.25, 0.85) * (1 - 0.75 * T.p(2, 0.1, 0.9));
  const av = VL.axial({ lax: 1, distract: pull }, PW, PH, AX, 'aL'), X = av.A, S = av.M.state, P0 = CANTHUS.marginAt(0);
  let ex = '';
  { const a = av.P([1.6, P0[1]]), b = av.P([1.6, P0[1] - S.Dnow]), o = T.on(0, 0.6, 0.8) * (1 - T.on(2, 0.6));
    const t0 = av.P([-5.5, P0[1] - BP.distractSig[0]]), t1 = av.P([5.5, P0[1] - BP.distractSig[1]]), ob = T.on(1, 0.6) * (1 - T.on(2, 0.6));
    ex += `<g opacity="${ob.toFixed(3)}"><rect x="${t0[0].toFixed(1)}" y="${t1[1].toFixed(1)}" width="${(t1[0] - t0[0]).toFixed(1)}" height="${(t0[1] - t1[1]).toFixed(1)}" fill="${COL.amber}" opacity="0.18"/>` +
      `<path d="M${t0[0].toFixed(1)} ${t0[1].toFixed(1)}H${t1[0].toFixed(1)}M${t0[0].toFixed(1)} ${t1[1].toFixed(1)}H${t1[0].toFixed(1)}" stroke="${COL.amber}" stroke-width="1.6" stroke-dasharray="5 4"/></g>`;
    ex += `<g opacity="${o.toFixed(3)}">${VIEWS.dim(a, b, COL.accent)}</g>`;
    ex += lab('拉開的距離', 'distraction', PW - 12, 106, [a[0] + 2, (a[1] + b[1]) / 2], { side: 'R', color: COL.accent, bold: true, op: o * (1 - T.on(2)) });
    ex += lab('6–8 mm：算明顯', 'significant laxity', 14, 64, [t0[0], (t0[1] + t1[1]) / 2], { color: COL.amber, bold: true, op: ob });
    ex += lab('放開：眨好幾次眼還貼不回（示意）', 'poor snap-back', PW - 12, 106, X.distract, { side: 'R', color: COL.red, bold: true, op: T.on(2, 0.6, 1.2) }); }
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 290, X.tendon);
  ex += lab('眼球', 'globe', PW - 12, 340, av.P([4, 0]), { side: 'R' });
  const cv = VL.lcor(BP.pre, PW, PH, COR, 'cR');
  let rx = '';
  rx += infoCard(12, 262, 582, [['Distraction test（horizontal laxity）', { bold: true, color: COL.accent }], ['往前看，把下眼瞼往前拉離眼球：> 6–8 mm 算明顯', {}], ['80 位單側內翻病人：7.5–11 mm（Beigi 2008）', { color: COL.sub }]], T.on(0, 0.6) * (1 - T.on(2)), { h: 104 });
  rx += infoCard(12, 262, 582, [['Snap-back（orbicularis 張力）', { bold: true, color: COL.accent }], ['放開後眨好幾次眼還貼不回眼球 → 張力明顯變差', {}]], T.on(2, 0.6) * (1 - T.on(3)), { h: 78 });
  rx += infoCard(12, 262, 582, [['術前記下（門診記錄）', { bold: true, color: COL.accent }], ['睫毛碰到角膜的位置；角膜下方點狀 SPK', {}], ['糖尿病（口服藥）、抽菸', {}]], T.on(3, 0.6), { h: 104 });
  rx += lab('睫毛碰到角膜', 'trichiasis', 14, 64, cv.A.lashMidL, { color: COL.red, bold: true });
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 3 手術步驟 (axial + coronal lateral canthus, same x window)
DRAW2['3-1'] = T => {
  const o1 = T.on(1, 0.6, 0.3), o2 = T.on(2, 0.6, 0.3);
  const av = VL.axial({ lax: 1 }, PW, PH, AXC, 'aL'), X = av.A, cv = VL.lcor({ rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  const aLine = [av.P(av.M.lc), av.P(av.M.rimEdge)], cuts = axCuts(av), wc = corWedge(cv), cl = canthLine(cv);
  let ex = curve(aLine, COL.purple, 2.6, o1, '7 5') + cuts.map(c => curve(c, COL.purple, 2.6, o2, '7 5')).join('');
  ex += lab('外眥', 'lateral canthus', 14, 106, X.lc, { bold: true });
  ex += lab('切開線（示意）', 'canthotomy line', 14, 196, mid(...aLine), { color: COL.purple, bold: true, op: o1 });
  ex += lab('楔形的兩邊（全層，示意）', 'wedge', PW - 12, 64, lidOff(av, 0, 1.2, (BP.wedge.xa + BP.wedge.xb) / 2), { side: 'R', color: COL.purple, bold: true, op: o2 });
  ex += lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim);
  ex += lab('眼球', 'globe', PW - 12, 290, av.P([-10, 0.5]), { side: 'R' });
  let rx = curve(cl, COL.purple, 2.6, o1, '7 5') + shape(wc, 'none', COL.purple, o2, 2.6, '7 5');
  rx += lab('外眥切開線（位置示意）', 'canthotomy line', 14, 150, mid(...cl), { color: COL.purple, bold: true, op: o1 });
  rx += lab('楔形：底邊在睫毛線（示意）', 'wedge', PW - 12, 64, mid(wc[0], wc[2]), { side: 'R', color: COL.purple, bold: true, op: o2 });
  rx += lab('尖端：瞼板下緣下方', 'apex', PW - 12, PH - 28, wc[1], { side: 'R', color: COL.purple, op: o2 });
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, RIM_Y, RIM_C(cv));
  rx += tag('局部麻醉：依院內常規', T.on(0, 0.6) * (1 - o1), COL.accent, PH - 70);
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['3-2'] = T => {
  const c1 = T.p(0, 0.1, 0.8), c2 = T.p(1, 0.1, 0.7);
  const av = VL.axial({ lax: 1, canthotomy: c1, cantholysis: c2 > 0.5 ? 1 : 0 }, PW, PH, AXC, 'aL'), X = av.A;
  const cv = VL.lcor({ canthotomy: c1, cantholysis: c2, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim, { bold: true });
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 196, X.tendon, { bold: true, op: 1 - ss(0.5, 1, c2) });
  ex += lab('外眥', 'lateral canthus', 14, 106, av.P(av.M.lc), { op: 1 - T.on(0, 0.6, 0.4) });
  if (X.canthotomy) ex += lab('外眥切開', 'canthotomy', 14, 106, X.canthotomy, { color: COL.red, bold: true, op: T.on(0, 0.6, 0.4) });
  if (X.cantholysis) ex += lab('剪斷外眥韌帶下支', 'cantholysis', 14, 196, X.cantholysis, { color: COL.red, bold: true, op: ss(0.5, 1, c2) });
  ex += lab('下眼瞼（投影）', 'lower lid, projected', PW - 12, 64, lidOff(av, 0.93, 1.2), { side: 'R' });
  ex += lab('眼球', 'globe', PW - 12, 290, av.P([-10, 0.5]), { side: 'R' });
  let rx = lab('外眥', 'lateral canthus', PW - 12, 64, B.lcL, { side: 'R', bold: true });
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, RIM_Y, RIM_C(cv));
  if (B.canthotomy) rx += lab('外眥切開：水平剪開', 'canthotomy', 14, 150, B.canthotomy, { color: COL.red, bold: true, op: T.on(0, 0.6) });
  if (B.cantholysis) rx += lab('下支切斷', 'inferior cantholysis', 14, 236, B.cantholysis, { color: COL.red, bold: true, op: T.on(1, 0.6) });
  rx += note('有的改良不切外眥（Rubino 2024）；這台依院內常規', T.on(2, 0.6), PH - 74);
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['3-3'] = T => {
  const pl = T.p(0, 0.05, 0.5), ow = T.on(0, 0.6, 1.4);
  const av = VL.axial({ lax: 1, ...BS.CUTS }, PW, PH, AXC, 'aL'), X = av.A, cv = VL.lcor({ ...BS.CUTS, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  const e = X.lidEnd, wc = corWedge(cv);
  let ex = `<g opacity="${T.on(0, 0.4)}">${arrow([e[0] + 10, e[1] + 34], [e[0] + 10 - 120 * pl, e[1] + 34], COL.accent, 1, 'arrA', 3)}</g>`;
  ex += shape(axPiece(av), 'rgba(210,60,60,0.18)', COL.red, ow, 2.2, '6 4');
  ex += lab('往外拉', 'pull laterally', PW - 12, 150, [e[0] + 10 - 60 * pl, e[1] + 34], { side: 'R', color: COL.accent, bold: true, op: T.on(0, 0.6) });
  ex += lab('多出來的部分（示意）', 'excess', PW - 12, 64, lidOff(av, 0, 1.2, (BP.wedge.xa + BP.wedge.xb) / 2), { side: 'R', color: COL.red, bold: true, op: ow });
  ex += lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim);
  let rx = `<g opacity="${T.on(0, 0.4)}">${arrow([B.lcL[0] + 100, B.lcL[1] + 90], [B.lcL[0] + 100 - 150 * pl, B.lcL[1] + 90], COL.accent, 1, 'arrA', 3)}</g>`;
  rx += shape(wc, 'rgba(210,60,60,0.18)', COL.red, ow, 2.4, '6 4');
  rx += lab('多出來的寬度＝要切的楔形', 'excess', PW - 12, PH - 28, wc[1], { side: 'R', color: COL.red, bold: true, op: ow });
  rx += lab('往外拉', 'pull laterally', 14, PH - 74, [B.lcL[0] + 100 - 75 * pl, B.lcL[1] + 90], { color: COL.accent, bold: true, op: T.on(0, 0.6) });
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, RIM_Y, RIM_C(cv));
  rx += tag('切多少：依鬆弛程度；這台依院內常規', T.on(1, 0.6), COL.accent, 34);
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['3-4'] = T => {
  const c = T.p(0, 0.05, 0.6), fill = T.on(0, 0.6, 1.6);
  const av = VL.axial({ lax: 1, ...BS.CUTS }, PW, PH, AXC, 'aL'), X = av.A, cv = VL.lcor({ ...BS.CUTS, rimShow: 1 }, PW, PH, CANTH, 'cR');
  const cuts = axCuts(av), wc = corWedge(cv), xm = (BP.wedge.xa + BP.wedge.xb) / 2;
  let ex = shape(axPiece(av), 'rgba(210,60,60,0.30)', 'none', fill, 0) + cuts.map(q => curve(partial(q, c), COL.red, 3, 1)).join('');
  ex += lab('皮膚', 'skin', PW - 12, 64, lidOff(av, 0, 2.31, xm + 1.1), { side: 'R', bold: true, op: T.on(0, 0.6) * (1 - T.on(1)) });
  ex += lab('瞼板', 'tarsus', PW - 12, 106, lidOff(av, 0, 0.85, xm + 1.3), { side: 'R', bold: true, op: T.on(0, 0.6) * (1 - T.on(1)) });
  ex += lab('結膜（貼著眼球）', 'conjunctiva', PW - 12, 150, lidOff(av, 0, 0.05, xm + 1.5), { side: 'R', bold: true, op: T.on(0, 0.6) * (1 - T.on(1)) });
  ex += lab('全層切除（示意）', 'full thickness', 14, 196, lidOff(av, 0, 1.2, xm), { color: COL.red, bold: true, op: fill });
  ex += lab('外眥', 'lateral canthus', 14, 106, X.lc);
  let rx = shape(wc, 'rgba(210,60,60,0.30)', 'none', fill, 0) + curve(partial([...wc, wc[0]], c), COL.red, 3, 1);
  rx += lab('楔形切除：一塊三角形（示意）', 'wedge resection', PW - 12, PH - 28, wc[1], { side: 'R', color: COL.red, bold: true, op: T.on(0, 0.6) });
  rx += lab('外眥', 'lateral canthus', PW - 12, 64, cv.A.lcL, { side: 'R' });
  rx += tag('在外眥處縮短：瞼緣不留 notch', T.on(2, 0.6), COL.accent, PH - 74);
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['3-5'] = T => {
  const f = T.p(0, 0.15, 0.85);
  const a0 = VL.axial({ lax: 1, ...BS.CUTS }, PW, PH, AXC, 'aL'), a1 = VL.axial({ lax: 1, ...BS.FIXED }, PW, PH, AXC, 'aL2'), X = a1.A, M = a1.M;
  const cv = VL.lcor({ stripFix: f, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim, { bold: true });
  ex += lab('瞼板斷端', 'tarsal end', PW - 12, 106, X.stripBand, { side: 'R', bold: true, color: '#9b6a2a', op: ss(0.4, 1, f) });
  ex += lab('縫到骨膜（縫線依院內常規）', 'to the periosteum', 14, 196, X.stripFix, { color: COL.suture, bold: true, op: ss(0.6, 1, f) * (1 - T.on(1)) });
  { const o = T.on(1, 0.6) * (1 - T.on(2, 0.6)), a = a1.P(M.rimEdge), b = a1.P(M.tubercle);
    ex += `<g opacity="${o}">${VIEWS.dim(a, b, COL.accent)}</g>` + lab('Whitnall 結節：眶緣後方約 1.5 mm', 'lateral orbital tubercle', 14, 64, b, { color: COL.accent, bold: true, op: o }); }
  ex += lab('眼瞼變緊、貼回眼球（示意）', 'tightened', PW - 12, 64, lidOff(a1, 0.92, 1.2), { side: 'R', color: COL.accent, bold: true, op: T.on(2, 0.6) });
  let rx = corFixSut(cv, f) + lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, RIM_Y, RIM_C(cv));
  if (B.stripFix) rx += lab('固定點：眶緣內面（皮膚下，虛線）', 'fixation inside the rim', 14, 290, B.stripFix, { color: COL.suture, bold: true, op: ss(0.5, 1, f) });
  rx += lab('外眥', 'lateral canthus', PW - 12, 64, B.lcL, { side: 'R' });
  rx += tag('骨膜或外眥韌帶殘端：依院內常規', T.on(3, 0.6), COL.accent, 34);
  return { L: { svg: fade(a0.svg, a1.svg, f), extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['3-6'] = T => {
  const s1 = T.p(1, 0.05, 0.7);
  const av = VL.axial({ lax: 1, ...BS.FIXED }, PW, PH, AXC, 'aL'), X = av.A, cv = VL.lcor({ ...BS.FIXED, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('眼瞼貼回眼球', 'tightened', PW - 12, 64, lidOff(av, 0.92, 1.2), { side: 'R', color: COL.accent, bold: true });
  ex += lab('外眥', 'lateral canthus', 14, 106, X.lc, { bold: true });
  ex += lab('瞼板斷端已固定', 'tarsal end fixed', 14, 290, X.stripFix, { color: COL.suture });
  const cl = canthLine(cv), n = 5, st = partial(cl, s1);
  let rx = `<circle cx="${B.lcL[0].toFixed(1)}" cy="${B.lcL[1].toFixed(1)}" r="26" fill="none" stroke="${COL.accent}" stroke-width="2.4" opacity="${T.on(0, 0.6) * (1 - T.on(1)) + T.on(2, 0.6)}"/>`;
  rx += corFixSut(cv, 1, 0.6) + curve(st, COL.suture, 2, 1, '2 5');
  for (let i = 0; i < n; i++) { const k = (i + 0.5) / n; if (k <= s1) { const p = [lerp(cl[0][0], cl[1][0], k), lerp(cl[0][1], cl[1][1], k)]; rx += `<path d="M${p[0].toFixed(1)} ${(p[1] - 9).toFixed(1)}V${(p[1] + 9).toFixed(1)}" stroke="${COL.suture}" stroke-width="2.4" stroke-linecap="round"/>`; } }
  rx += lab('外眥角：瞼緣對齊', 'canthal angle', PW - 12, 64, B.lcL, { side: 'R', bold: true, color: COL.accent });
  rx += lab('縫 orbicularis 與皮膚（示意）', 'skin closure', 14, PH - 74, mid(...cl), { color: COL.suture, bold: true, op: T.on(1, 0.6) });
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, RIM_Y, RIM_C(cv));
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

// ---------------------------------------------------------------- 4 術中狀況與收尾
DRAW2['4'] = T => {
  const k = T.p(0, 0.05, 0.4);
  const s0 = VL.lsag(BP.pre, PW, PH, SAG, 'sL'), s1 = VL.lsag({}, PW, PH, SAG, 'sL2'), A = s1.A;
  const cv = VL.lcor({}, PW, PH, COR, 'cR'), B = cv.A;
  let ex = lab('睫毛碰到角膜（術前）', 'before', 14, 64, s0.A.lashL, { color: COL.red, bold: true, op: 1 - k });
  ex += lab('睫毛離開角膜', 'lashes off the cornea', 14, 64, A.lashL, { color: COL.accent, bold: true, op: k });
  ex += lab('眼瞼貼住眼球', 'apposed to the globe', PW - 12, 106, A.marginL, { side: 'R', color: COL.accent, bold: true, op: T.on(0, 0.6, 1.2) });
  ex += lab('角膜', 'cornea', 14, 150, A.cornea);
  let rx = `<circle cx="${B.lcL[0].toFixed(1)}" cy="${B.lcL[1].toFixed(1)}" r="22" fill="none" stroke="${COL.amber}" stroke-width="2.4" stroke-dasharray="6 4" opacity="${T.on(2, 0.6)}"/>`;
  rx += lab('瞼緣平順：沒有 notch', 'no notch', PW - 12, PH - 28, B.marginL, { side: 'R', color: COL.accent, bold: true, op: T.on(0, 0.6, 2.0) });
  rx += lab('外眥角：形狀與位置', 'lateral canthal angle', 14, 64, B.lcL, { bold: true, op: T.on(0, 0.6, 3.0) * (1 - T.on(2)) });
  rx += lab('看有沒有變圓、往內移', 'rounding, medial shift', 14, 64, B.lcL, { color: COL.amber, bold: true, op: T.on(2, 0.6) });
  rx += tag('不滿意時的調整：依院內常規', T.on(3, 0.6), COL.accent, PH - 74);
  return { L: { svg: fade(s0.svg, s1.svg, k), extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 5 術後 (full panel)
DRAW2['5'] = T => {
  let s = '';
  const chips = ['睫毛不再碰到角膜', '眼瞼貼住眼球', '外眥角的位置與形狀'];
  let x = 24; chips.forEach((c, i) => { const w = measure(c, 16, true) + 34, op = T.on(0, 0.5, i * 0.35);
    s += `<g opacity="${op}"><rect x="${x}" y="16" width="${w}" height="38" rx="19" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + w / 2, 41, c, { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; x += w + 14; });
  s += infoCard(24, 80, 1180, [['Quick strip（Bick 與 lateral tarsal strip 的混合）：225 個眼瞼', { bold: true, color: COL.accent }], ['完全矯正 92.4%；沒有一例外眥角變圓（Barrett 2012）', {}]], T.on(1, 0.6), { h: 78 });
  s += infoCard(24, 176, 1180, [['Modified Bick＋切除 orbicularis 與脫出的眶脂肪：70 個眼瞼', { bold: true, color: COL.accent }], ['平均追蹤 46.9 個月，復發 1.4%（Prendes 2020）', {}]], T.on(2, 0.6), { h: 78 });
  s += infoCard(24, 272, 1180, [['拆線時間、用藥、角膜 SPK 的追蹤', { bold: true }], ['依院內常規', { color: COL.accent, bold: true }]], T.on(3, 0.6), { h: 78 });
  return { F: { svg: s, P: { title: '術後追蹤', orient: '各研究的術式與追蹤時間不同' } } };
};

// ---------------------------------------------------------------- 6 跟刀清單 (full panel; numbers = the printed step sheet)
DRAW2['6'] = T => {
  const items = ['術前：distraction、snap-back；倒睫、角膜下方 SPK；DM、抽菸', '局麻；畫外眥切開線與楔形（依院內常規）', 'Lateral canthotomy＋inferior cantholysis', '往外拉，看多出來多少 → 決定楔形寬度',
    '外眥處全層楔形切除（皮膚到結膜）', '瞼板斷端直接縫到外側眶緣骨膜', '重建外眥角、對齊；縫 orbicularis 與皮膚', '收尾：睫毛離開角膜、貼住眼球、沒有 notch、外眥角'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '藥物、寬度與縫線依院內常規' } } };
};
