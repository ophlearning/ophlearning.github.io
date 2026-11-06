// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the eyelid model (videos/models/eyelid): the sagittal mechanism section (left) and the
// surgeon's coronal view (right); both come from the same state, so heights agree (checked in ../check.js and eyelid/check.js).
// Upper lid (chapter 2): the same states, windows and calls as the first video (levator-resection-brow-fixation/anim/draw.js).
// Lower lid: views-lower.js (VL.lsag, VL.lcor). Surgical parameters: params.js (LRP, INC, LLP).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width
const SAG_LID = { x: -24, y: -21, w: 30 }, SAG_BROW = { x: -28.5, y: -31, w: 44 };
const COR_LID = { x: -17.5, y: -15, w: 33 }, COR_FACE = { x: -26, y: -27.5, w: 52 };
const LS_WIN = { x: -18.6, y: 2.0, w: 17 }, LS_TOP = { x: -19.4, y: 0.0, w: 14.5 }, LS_FR = { x: -17.2, y: 2.4, w: 8.5 }, BOTH_WIN = { x: -22, y: -10.5, w: 34 };
const LC_WIN = { x: -18, y: -5, w: 34 }, LC_FACE = { x: -22, y: -9, w: 44 }, LC_TITLE = { x: -26, y: -26, w: 52 };
const LZ_WIN = { x: -15.3, y: 5.3, w: 5.0 }, CZ_WIN = { x: -6.6, y: 2.4, w: 9 };
const SAG_P = { title: '矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const LSAG_P = { title: '下眼瞼矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const BOTH_P = { title: '上下眼瞼矢狀切面 sagittal', orient: '左＝前　上＝上' };
const LZ_P = { title: '下瞼緣放大（矢狀切面）lower lid margin', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD　術者視角', orient: '面對病人：左＝temporal　右＝nasal' };
const CZ_P = { title: '正面：下瞼緣特寫　右眼 OD', orient: '面對病人：左＝temporal　右＝nasal' };
// upper-lid surgical states (cumulative; as in the first video); INC = incision heights and strip width (院內常規)
const PRE = { mrd1: LRP.mrdPre };
const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
const RES = { ...OPEN, dis: 1, resect: 1 };
const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
const BROWFIX = { ...ADV, browSut: 1, browTie: 1 };
const UP_DONE = { mrd1: LRP.mrdPost };   // the upper lid after its part of the operation, as seen while the lower lid is operated (wound closed)
const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };   // nasal window: supraorbital notch and nerve (示意)
// lower-lid surgical states (cumulative; department template, 院內常規; positions 示意)
const L_PRE = { entr: LLP.entr };
const L_INC = { ...L_PRE, subcil: 1, incH: LLP.incH };
const L_DIS = { ...L_INC, plane: 1, septOpen: 1, retrOpen: 1 };
const L_FR = { ...L_DIS, frac: 1, fracS: LLP.fracS, fracDepth: LLP.fracDepth };
const L_MAT = { ...L_FR, mattress: 1, exitH: LLP.exitH };
const L_DONE = { ...L_MAT, tie: 1, skinClose: 1 };
const L_EVERT = { tie: 1 };              // the margin turned out (rotation result) without the suture overlays, for the lash views

const pts = (P, f, x0, x1, st = 0.25) => { const r = []; for (let x = x0; x <= x1 + 1e-9; x += st) r.push(P([x, f(x)])); return r; };
const levAt = (sv, x) => { const LV = sv.r.LV, q = LV.near([x, -17.6]); return sv.P(LV.off(q, 0.5)); };
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>`;
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.4) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const mrdArrow = (cv, op) => { const a = cv.P([0, 0]), b = cv.P([0, cv.r.Uy(0)]);
  return `<g opacity="${op}"><circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="3.2" fill="#fff"/>${VIEWS.dim(a, b, '#ffd34d', 1)}</g>`; };
const contour = (cv, op) => curve(pts(cv.P, cv.r.Uy, CORONAL.LC[0] + 0.5, CORONAL.MC[0] - 0.5), '#ffd34d', 3, op);
const lowerContour = (cv, op, col = '#ffd34d') => curve(pts(cv.P, CORONAL.Ly, CORONAL.LC[0] + 0.5, CORONAL.MC[0] - 0.5), col, 3, op);
const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const cubic = (P, t) => [0, 1].map(i => (1 - t) ** 3 * P[0][i] + 3 * (1 - t) ** 2 * t * P[1][i] + 3 * (1 - t) * t * t * P[2][i] + t ** 3 * P[3][i]);
// two drawings of one panel cross-faded (k = weight of b)
const xfade = (a, b, k) => k <= 0.001 ? a : k >= 0.999 ? b : `<g opacity="${(1 - k).toFixed(3)}">${a}</g><g opacity="${k.toFixed(3)}">${b}</g>`;
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}
// horizontal bar row: label, value (%), bar scale
const barRow = (x, y, label, v, k, col, op, w = 250, lw = 190) => `<g opacity="${op}">${text(x, y + 13, label, { size: 14.5 })}<rect x="${x + lw}" y="${y}" width="${(w * v / 100 * k).toFixed(1)}" height="16" rx="3" fill="${col}"/>${text(x + lw + w + 52, y + 13, v + '%', { size: 15, bold: true, anchor: 'end', op: k })}</g>`;
// electrolysis needle seen from the front, entering at the root of a lash at x (coronal mm), as in lower-coronal.js (along the shaft, short)
function needleC(cv, x, k, op) { const y = cv.r.lashLY(x), top = [x - 0.15, y - 2.4], tip = mixP(top, [x, y], k), P = cv.P;
  return `<g opacity="${op}"><path d="M${P(top).map(v => v.toFixed(1)).join(' ')}L${P(tip).map(v => v.toFixed(1)).join(' ')}" stroke="#2f3a44" stroke-width="5" stroke-linecap="round"/><path d="M${P(top).map(v => v.toFixed(1)).join(' ')}L${P(tip).map(v => v.toFixed(1)).join(' ')}" stroke="#aeb8c2" stroke-width="2.6"/></g>`; }
const coagC = (cv, x, k) => { const y = cv.r.lashLY(x), c = cv.P([x, y + 0.35]); return k > 0 ? `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(0.35 * k * cv.k).toFixed(1)}" fill="#c98a4b" opacity="0.5" stroke="#7a4a2a" stroke-width="1.5" stroke-dasharray="4 3"/>` : ''; };
const MIS_X = [-2.6, -1.7];   // the two misdirected lashes of the coronal model (lower-coronal.js; positions 示意)
// panel titles live outside the drawing functions: hand their characters to the kit's font preload
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, LSAG_P, BOTH_P, LZ_P, COR_P, CZ_P]);

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VL.lcor({ ...PRE, browY: LRP.browRaise }, { entr: 1, misdirected: 1 }, PW, PH, LC_TITLE, 'tR'), B = cv.A;
  let ex = lab('眉毛靠 frontalis 撐高', 'brow raised', 14, 52, B.brow, { color: COL.amber, bold: true });
  ex += lab('上眼瞼下垂', 'ptosis', PW - 12, 52, cv.P([3, cv.r.Uy(3)]), { side: 'R', color: COL.amber, bold: true });
  ex += lab('下眼瞼內翻：睫毛碰到角膜', 'entropion', PW - 12, PH - 60, B.lashMidL, { side: 'R', color: COL.red, bold: true });
  ex += note('術前高度與內翻程度為示意', 1, PH - 18);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1-1'] = T => {
  const ent1 = T.p(1, 0.05, 0.45) * (1 - T.on(2, 0.5)), mis = T.on(2, 0.6, 0.4), met = T.on(3, 0.6, 0.4), ent4 = T.p(4, 0.0, 0.3), tie = T.p(4, 0.35, 0.9);
  const four = T.u >= T.st(4), low = { entr: four ? ent4 : ent1, misdirected: mis, metaplastic: met, tie };
  const sv = VL.lsag(low, PRE, PW, PH, LS_TOP, 'sL'), A = sv.A, cv = VL.lcor(PRE, low, PW, PH, LC_WIN, 'cR'), B = cv.A;
  const o1 = T.on(1, 0.6, 0.6) * (1 - T.on(2, 0.4)), o2 = T.on(2, 0.6, 0.6) * (1 - T.on(4)), o3 = T.on(3, 0.6, 0.6) * (1 - T.on(4)), o5 = T.on(4, 0.6, 1.4);
  let ex = lab('睫毛線', 'lash line', 14, PH - 30, A.lashSkinL, { bold: true, op: 1 - T.on(1) });
  ex += lab('角膜', 'cornea', PW - 12, 52, sv.P([-12.75, 1.2]), { side: 'R' });
  ex += lab('瞼板', 'tarsus', PW - 12, PH - 30, A.tarsusL, { side: 'R' });
  ex += lab('① entropion：瞼緣往內轉', 'margin turned in', 14, 52, A.lashL, { color: COL.red, bold: true, op: o1 });
  if (A.misLashL) ex += lab('② misdirected：位置對、方向歪', 'misdirected', 14, 52, A.misLashL, { color: COL.amber, bold: true, op: o2 });
  if (A.metaLashL) ex += lab('③ metaplastic：位置錯（示意）', 'metaplastic', 14, 92, A.metaLashL, { color: COL.amber, bold: true, op: o3 });
  if (A.misLashL) ex += lab('轉正後還碰到角膜', 'still touching', 14, 52, A.misLashL, { color: COL.amber, bold: true, op: o5 });
  ex += lab('瞼緣轉正', 'rotated out', 14, 150, A.lashL, { color: COL.accent, bold: true, op: o5 });
  ex += tag('三種機轉常常同時存在', T.on(0) * (1 - T.on(1)));
  let rx = lab('下眼瞼睫毛線', 'lower lash line', 14, PH - 30, B.lashLineL, { op: 1 - T.on(1) });
  if (B.lashMidL) rx += lab('睫毛往上碰到角膜', 'lashes on the cornea', PW - 12, 52, B.lashMidL, { side: 'R', color: COL.red, bold: true, op: o1 });
  if (B.misLashL) rx += lab('方向歪的睫毛', 'misdirected', 14, 52, B.misLashL, { color: COL.amber, bold: true, op: Math.max(o2, o5) });
  if (B.metaLashL) rx += lab('化生睫毛（位置示意）', 'metaplastic', PW - 12, 52, B.metaLashL, { side: 'R', color: COL.amber, bold: true, op: Math.max(o3, o5) });
  rx += tag('rotation → entropion；剩下的睫毛 → electrolysis', T.on(5), COL.accent, PH - 20);
  rx += note('根數與位置為示意', T.on(2), PH - 50);
  return { L: { svg: sv.svg, extra: ex, P: LSAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  const k = T.p(0, 0.05, 0.45), tie = T.p(0, 0.5, 0.95), up = { mrd1: lerp(LRP.mrdPre, LRP.mrdPost, k) }, low = { entr: 1, tie };
  const sv = VL.lsag(low, up, PW, PH, BOTH_WIN, 'sL'), A = sv.A, U = VL.upper(up, sv.P), cv = VL.lcor(up, low, PW, PH, LC_FACE, 'cR'), B = cv.A;
  let ex = lab('上瞼緣：往上拉', 'upper lid raised', 14, 52, U.margin, { color: COL.accent, bold: true });
  ex += lab('下瞼緣：往外轉', 'lower lid rotated out', 14, PH - 30, A.marginL, { color: COL.accent, bold: true });
  ex += lab('角膜', 'cornea', PW - 12, 200, sv.P([-12.95, 0]), { side: 'R' });
  ex += note('高度與轉動角度為示意', 1, 26);
  // right: lagophthalmos after aponeurotic ptosis repair (Tucker 2000), then the two predictors
  const b1 = ss(T.st(1) + 0.4, T.st(1) + 1.4, T.u), b2 = ss(T.st(1) + 2.0, T.st(1) + 3.0, T.u), b3 = ss(T.st(2) + 0.2, T.st(2) + 1.2, T.u), oc = T.on(1) * (1 - T.on(3, 0.6));
  let rx = `<g opacity="${oc}"><rect x="12" y="250" width="582" height="148" rx="8" fill="#fff" stroke="#d3dae1"/>${text(26, 276, '閉不緊（lagophthalmos）的眼瞼比例', { size: 15, bold: true, color: COL.accent })}` +
    barRow(26, 290, '術後第 1 天', 60, b1, '#b3122b', 1) + barRow(26, 320, '術後 1 週', 33, b2, COL.amber, ss(T.st(1) + 1.6, T.st(1) + 2.2, T.u)) +
    barRow(26, 350, '術後 6–20 週', 9, b3, COL.accent, T.on(2, 0.5)) + text(580, 390, '持續者平均 0.6 mm', { size: 13, color: COL.sub, anchor: 'end', op: T.on(2, 0.5, 0.8) }) + `</g>`;
  const o3 = T.on(3, 0.6, 0.4);
  rx += mrdArrow(cv, o3) + lab('① 術後的眼瞼高度', 'final lid height', 14, 52, cv.P([0, cv.r.Uy(0) * 0.5]), { color: '#b58a00', bold: true, op: o3 });
  rx += lowerContour(cv, T.on(3, 0.6, 1.8)) + lab('② 下方鞏膜露出：看下瞼緣', 'inferior scleral show', 14, PH - 64, cv.P([-6, CORONAL.Ly(-6)]), { color: '#b58a00', bold: true, op: T.on(3, 0.6, 1.8) });
  rx += tag('閉眼：上下一起看', T.on(4), COL.accent, PH - 20);
  return { L: { svg: sv.svg, extra: ex, P: BOTH_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 2 上眼瞼：快速重述（同第一部的狀態、視窗與畫法）
DRAW2['2-1'] = T => {
  const cut = T.p(1, 0.5, 0.7), rem = T.p(1, 0.72, 0.98), so = T.p(2, 0.05, 0.4), fu = T.p(2, 0.45, 0.95);
  const dis = T.p(3, 0.0, 0.3), clamp = T.p(3, 0.3, 0.55) * (1 - T.p(4, 0.0, 0.25)), res = T.p(3, 0.6, 0.95), adv = T.p(4, 0.05, 0.4), ts = T.p(4, 0.3, 0.6), lift = T.p(4, 0.55, 0.95);
  const st = { ...PRE, ...INC, excMark: (T.u < T.st(1) ? 0 : 1) * (1 - cut), excCut: cut, excRemove: rem, septOpen: so, fatUp: so >= 1 ? fu : 0, dis, clamp, resect: res, advance: adv, tarSut: ts, mrd1: lerp(LRP.mrdPre, LRP.mrdPost, lift) };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  const o1 = T.on(1) * (1 - T.on(2)), o2 = T.on(2) * (1 - T.on(3)), o3 = T.on(3) * (1 - T.on(4)), o4 = T.on(4, 0.6, 0.6);
  let ex = lab('上瞼緣', 'lid margin', 14, PH - 30, sv.P(sv.r.DP.at(0, 0)));
  ex += lab('提上瞼肌', 'levator', PW - 12, 64, levAt(sv, 1), { side: 'R', bold: true, op: 1 - o1 });
  if (A.wound) ex += lab('切除：皮膚＋皮下＋眼輪匝肌', 'skin–muscle strip', 14, 200, A.wound, { color: COL.red, bold: true, size: 14, op: o1 * ss(0.5, 0.9, rem) });
  ex += lab(fu > 0.3 ? '腱膜前脂肪（往上撥開）' : '腱膜前脂肪', 'preaponeurotic fat', PW - 12, 150, A.fatUp || A.fat, { side: 'R', color: '#9c7a20', bold: true, op: o2 });
  ex += lab('腱膜', 'aponeurosis', PW - 12, 236, A.apo, { side: 'R', bold: true, op: o2 * ss(0.3, 0.8, fu) });
  if (A.clamp) ex += lab('Putterman clamp', '', 14, 106, A.clamp, { color: '#2f3a44', bold: true, op: o3 * ss(0.3, 1, clamp) });
  if (A.tarSut) ex += lab('固定到瞼板（4-0 vicryl）', 'tarsal suture', PW - 12, 290, A.tarSut, { side: 'R', color: COL.suture, bold: true, op: o4 * ss(0.6, 1, ts) });
  ex += tag('詳見第一部第 4 章', T.on(0) * (1 - T.on(1)));
  let rx = '';
  { const lash = x => cv.r.lashY(x), X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], om = o1 * (1 - ss(0.2, 0.6, rem));
    X.forEach(x => { const a = cv.P([x, lash(x)]), b = cv.P([x, cv.r.excLoY(x)]); rx += `<g opacity="${om}">${VIEWS.dim(a, b, COL.purple)}${dot(b, COL.purple, 4.5)}</g>`; });
    rx += lab(`外側 ${H[0]} mm`, 'lateral', 14, 64, cv.P([X[0], cv.r.excLoY(X[0])]), { color: COL.purple, bold: true, op: om });
    rx += lab(`中央 ${H[1]} mm`, 'central', PW / 2 - 60, 64, cv.P([X[1], cv.r.excLoY(X[1])]), { color: COL.purple, bold: true, op: om });
    rx += lab(`內側 ${H[2]} mm`, 'medial', PW - 12, 64, cv.P([X[2], cv.r.excLoY(X[2])]), { side: 'R', color: COL.purple, bold: true, op: om });
    const a = cv.P([2.5, cv.r.excLoY(2.5)]), b = cv.P([2.5, cv.r.excHiY(2.5)]); rx += `<g opacity="${om}">${VIEWS.dim(a, b, COL.red)}</g>`;
    rx += lab(`切除寬 ${LRP.excW} mm`, 'skin strip', PW - 12, 126, [a[0], (a[1] + b[1]) / 2], { side: 'R', color: COL.red, bold: true, op: om }); }
  if (B.wound) rx += lab('窗內：腱膜', 'aponeurosis', PW - 12, 64, B.wound, { side: 'R', bold: true, op: o2 * ss(0.3, 0.8, fu) });
  if (B.clamp) rx += lab('Putterman clamp（皮膚下的部分畫虛線）', '', 14, 64, B.clamp, { color: '#2f3a44', bold: true, op: o3 * ss(0.3, 1, clamp) });
  if (B.tarSutC) { rx += lab('三針（位置示意）', 'tarsal sutures ×3', 14, 64, B.tarSutC, { color: COL.suture, bold: true, op: o4 * ss(0.6, 1, ts) });
    for (const x of [-CORONAL.LIMB, CORONAL.LIMB]) rx += dot(cv.P([x, cv.r.fixY(x)]), COL.suture, 3.5, o4 * ss(0.6, 1, ts)); }
  rx += contour(cv, ss(0.4, 1, lift) * o4) + lab('高度與 contour', 'height / contour', PW - 12, PH - 24, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: ss(0.4, 1, lift) * o4 });
  rx += note('內外兩點的位置為示意', o1, PH - 52);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['2-2'] = T => {
  const drop = T.p(0, 0.15, 0.85), pl = T.p(1, 0.05, 0.45), su = T.p(1, 0.45, 0.95), tie = T.on(2, 1.0), nv = T.on(2, 0.8) * (1 - T.on(3, 0.6)), cf = T.p(4, 0.05, 0.6);
  const st = { ...ADV, browY: lerp(LRP.browRaise, 0, drop), browPlane: pl * (1 - tie), browSut: su, browTie: tie, creaseFix: cf };
  const sv = VIEWS.sag(st, PW, PH, SAG_BROW, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ ...st, notch: nv }, PW, PH, COR_FACE, 'cR', { windows: nv > 0.01 ? [NERVE_WIN] : [] }), B = cv.A;
  const ghost = T.on(0, 0.4) * (1 - T.on(1, 0.6)), pre = LID.draw({ state: { ...ADV, browY: LRP.browRaise } }).A.browLo, gp = sv.P(pre), cp = A.browLo;
  let ex = lab('眉毛', 'eyebrow', 14, 64, A.brow, { bold: true });
  ex += `<g opacity="${ghost}"><path d="M${(gp[0] - 46).toFixed(1)} ${gp[1].toFixed(1)}H${(gp[0] + 30).toFixed(1)}" stroke="${COL.sub}" stroke-width="1.6" stroke-dasharray="5 4"/>${arrow([gp[0] - 34, gp[1] + 2], [gp[0] - 34, Math.max(gp[1] + 4, cp[1] - 2)], COL.red, 1, 'arrR', 2.6)}</g>`;
  ex += lab('眉毛下降 平均 2.5–2.9 mm', 'brow descent', PW - 12, 150, [gp[0] - 34, (gp[1] + cp[1]) / 2], { side: 'R', color: COL.red, bold: true, op: ghost });
  if (A.browPlane) ex += lab('剝離平面', 'dissection plane', PW - 12, 150, A.browPlane, { side: 'R', color: COL.accent, bold: true, op: ss(0.3, 0.8, pl) * (1 - T.on(2)) * T.on(1) });
  if (A.browSutP) ex += lab('眉下組織縫到骨膜（4-0 vicryl ×1）', 'brow fixation', PW - 12, 64, A.browSutP, { side: 'R', color: COL.suture, bold: true, size: 14, op: ss(0.6, 1, su) * (1 - T.on(4)) });
  ex += lab('骨膜', 'periosteum', PW - 12, 106, A.periosteum, { side: 'R', op: T.on(1, 0.6, 1.0) * (1 - T.on(4)) });
  ex += lab('眶上緣', 'superior orbital rim', PW - 12, 196, sv.P([-12.4, -18.3]), { side: 'R', op: 1 - T.on(4) });
  if (A.creaseFix) ex += lab('levator → orbicularis（6-0 Prolene）', 'crease fixation', 14, 290, A.creaseFix, { color: COL.suture, bold: true, size: 14, op: ss(0.5, 1, cf) });
  let rx = lab('眉毛', 'eyebrow', 14, 64, B.brow, { bold: true, op: 1 - nv });
  if (B.browFix) rx += lab('眉毛固定點（位置示意）', 'fixation point', 14, 150, B.browFix, { color: COL.suture, bold: true, op: ss(0.6, 1, su) * (1 - T.on(3)) });
  rx += lab('眶上切跡', 'supraorbital notch', PW - 12, 150, B.notch, { side: 'R', bold: true, op: nv });
  rx += lab('眶上神經（開窗示意）', 'supraorbital nerve', PW - 12, 64, cv.P([CORONAL.NOTCH_X - 1.3, -24]), { side: 'R', color: '#8a6d00', bold: true, op: nv });
  const m = T.on(3, 0.8) * (1 - T.on(4, 0.6, 1.0));
  rx += mrdArrow(cv, m) + lab(`MRD1 約 ${LRP.mrdPost} mm`, 'check', PW - 12, PH - 50, cv.P([0, cv.r.Uy(0) * 0.5]), { side: 'R', color: '#b58a00', bold: true, op: m });
  if (B.creaseFix) rx += lab('4 針（位置示意）', 'orbicularis fixation ×4', 14, 270, B.creaseFix, { color: COL.suture, bold: true, op: ss(0.5, 1, cf) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 3 下眼瞼 marginal rotation
DRAW2['3-1'] = T => {
  // lines 0–2: the lower-lid layers on a normal lid (coronal: layer windows); line 3: the operated lid (in-turned, 示意) and the incision
  const x3 = T.on(3, 0.8), inc = T.p(3, 0.25, 0.95);
  const strips = { lstrips: [[-14, -7.5, 4], [-7.5, -0.5, 2], [-0.5, 6.5, 1]] };
  const s0 = VL.lsag({}, UP_DONE, PW, PH, LS_WIN, 'sL'), s1 = VL.lsag({ ...L_PRE, subcil: inc, incH: LLP.incH }, UP_DONE, PW, PH, LS_WIN, 'sM');
  const c0 = VL.lcor(UP_DONE, strips, PW, PH, LC_WIN, 'cR'), c1 = VL.lcor(UP_DONE, { ...L_PRE, subcil: inc, incH: LLP.incH }, PW, PH, LC_WIN, 'cS');
  const A = s0.A, A1 = s1.A, B = c0.A, B1 = c1.A, oa = 1 - x3;
  // tarsal height (Lim 2004) as a dimension along the anterior tarsal surface
  const DP = s0.r.DP, ta = s0.P(DP.at(0.05, LOWER.U_TARL + 0.25)), tb = s0.P(DP.at(LOWER.S_TARL, LOWER.U_TARL + 0.25)), od = T.on(0, 0.6, 1.0) * (1 - T.on(1));
  let ex = `<g opacity="${od * oa}">${VIEWS.dim(ta, tb, COL.accent)}</g>` + lab(`下瞼板 約 ${LLP.tarHSay} mm`, 'lower tarsus', 14, 150, mixP(ta, tb, 0.5), { color: COL.accent, bold: true, op: od * oa });
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R', bold: true, op: oa * (1 - od) });
  ex += lab('囊瞼筋膜', 'capsulopalpebral fascia', PW - 12, 236, A.cpf, { side: 'R', bold: true, color: '#7b6a3a', op: oa * T.on(1, 0.6) });
  ex += lab('下瞼板肌', 'inferior tarsal muscle', PW - 12, 290, A.itm, { side: 'R', bold: true, color: '#9b4a55', op: oa * T.on(1, 0.6, 0.8) });
  ex += lab('眶隔', 'orbital septum', 14, 236, A.septumL, { bold: true, op: oa * T.on(2, 0.6) });
  ex += lab('融合處（常不明確）', 'fusion, often absent', 14, 290, A.fusionL, { color: COL.accent, op: oa * T.on(2, 0.6, 0.8) });
  ex += lab('睫毛下切口', 'subciliary incision', 14, 236, A1.incL, { color: COL.red, bold: true, op: x3 });
  ex += lab('睫毛線', 'lash line', 14, 52, A1.lashSkinL, { op: x3 });
  ex += note('內翻程度為示意', x3, 26);
  let rx = lab('眶隔', 'orbital septum', 14, PH - 30, c0.P([-11, c0.r.rimLY(-11) - 1.4]), { bold: true, op: oa * T.on(2, 0.6) });
  rx += lab('囊瞼筋膜', 'capsulopalpebral fascia', 14, 300, c0.P([-4, c0.r.fornixLY(-4) - 0.6]), { bold: true, color: '#7b6a3a', op: oa * T.on(1, 0.6) });
  rx += lab('瞼板', 'tarsus', PW - 12, 200, c0.P([3, (CORONAL.Ly(3) + c0.r.tarBotLY(3)) / 2 + 0.2]), { side: 'R', bold: true, op: oa });
  rx += lab('下瞼板肌', 'inferior tarsal muscle', PW - 12, 300, c0.P([4.5, c0.r.fornixLY(4.5) - 0.7]), { side: 'R', bold: true, color: '#9b4a55', op: oa * T.on(1, 0.6, 0.8) });
  const ie = c1.P([-9, c1.r.incLY(-9)]), xi = -1;
  rx += `<g opacity="${x3}">${VIEWS.dim(c1.P([xi, c1.r.lashLY(xi)]), c1.P([xi, c1.r.incLY(xi)]), COL.red)}</g>` + lab(`睫毛下 ${LLP.incH} mm`, 'below the lashes', PW - 12, PH - 30, c1.P([xi + 0.2, (c1.r.lashLY(xi) + c1.r.incLY(xi)) / 2]), { side: 'R', color: COL.red, bold: true, op: x3 * ss(0.5, 1, inc) });
  rx += lab('切口沿著睫毛線', 'incision', 14, PH - 30, ie, { color: COL.red, bold: true, op: x3 * ss(0.35, 0.6, inc) });
  rx += note('正常解剖；逐層開窗', oa * T.on(0), 26);
  return { L: { svg: xfade(s0.svg, s1.svg, x3), extra: ex, P: LSAG_P }, R: { svg: xfade(c0.svg, c1.svg, x3), extra: rx, P: COR_P } };
};

DRAW2['3-2'] = T => {
  const pl = T.p(0, 0.05, 0.5), so = T.p(0, 0.55, 0.95), ro = T.p(1, 0.1, 0.8);
  const low = { ...L_INC, plane: pl, septOpen: so, retrOpen: ro };
  const sv = VL.lsag(low, UP_DONE, PW, PH, LS_WIN, 'sL'), A = sv.A, cv = VL.lcor(UP_DONE, low, PW, PH, LC_WIN, 'cR'), B = cv.A;
  let ex = '';
  if (A.planeL) ex += lab('皮膚＋眼輪匝肌往下分開', 'skin–muscle flap', 14, 52, A.planeL, { color: COL.accent, bold: true, op: ss(0.3, 0.8, pl) });
  if (A.septCutL) ex += lab('打開眶隔', 'septum opened', 14, PH - 30, A.septCutL, { color: COL.red, bold: true, op: ss(0.2, 0.7, so) });
  if (A.retrCut) ex += lab('剝開 retractors 到結膜', 'retractors opened', PW - 12, PH - 30, A.retrCut, { side: 'R', color: COL.red, bold: true, op: ss(0.2, 0.7, ro) });
  ex += lab('結膜', 'conjunctiva', PW - 12, 52, A.conjL, { side: 'R', op: T.on(1, 0.6, 0.6) });
  ex += note('分離的層次與範圍為示意', T.on(2), 26);
  let rx = '';
  if (B.flapL) rx += lab('皮瓣往下翻、窗內逐層打開', 'flap reflected', 14, PH - 30, B.flapL, { color: COL.accent, bold: true, op: ss(0.3, 0.8, pl) });
  rx += lab('窗內：眶隔後方', 'behind the septum', PW - 12, PH - 30, cv.P([3, cv.r.fusLY(3) + 2.0]), { side: 'R', bold: true, op: ss(0.3, 1, so) * (1 - T.on(1)) });
  rx += lab('窗內：結膜面', 'down to the conjunctiva', PW - 12, PH - 30, cv.P([3, cv.r.incLY(3) + 2.2]), { side: 'R', bold: true, op: T.on(1, 0.6, 0.8) });
  return { L: { svg: sv.svg, extra: ex, P: LSAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-3'] = T => {
  const fr = T.p(0, 0.2, 0.9);
  const low = { ...L_DIS, frac: fr, fracS: LLP.fracS, fracDepth: LLP.fracDepth };
  const sv = VL.lsag(low, UP_DONE, PW, PH, LS_FR, 'sL'), A = sv.A, cv = VL.lcor(UP_DONE, low, PW, PH, LC_WIN, 'cR'), B = cv.A;
  const P = sv.P, DP = sv.r.DP, U = LOWER.U_TARL, TH = LOWER.TAR_TH, s = LLP.fracS;
  let ex = lab('瞼板', 'tarsus', 14, PH - 70, A.tarsusL, { bold: true });
  if (A.fracL) ex += lab('切一半深度（15 號刀）', 'tarsal fracture', 14, 64, A.fracL, { color: COL.red, bold: true, op: ss(0.2, 0.6, fr) });
  { const a = P(DP.at(s - 0.35, U)), b = P(DP.at(s - 0.35, U - TH)), m = P(DP.at(s - 0.35, U - TH * LLP.fracDepth)), o = T.on(2, 0.6);
    ex += `<g opacity="${o}">${VIEWS.dim(a, m, COL.red)}${VIEWS.dim(m, b, COL.accent)}</g>`;
    ex += lab('切開的一半', 'cut half', PW - 12, 236, mixP(a, m, 0.5), { side: 'R', color: COL.red, bold: true, op: o });
    ex += lab('保持完整的一半（含結膜面）', 'intact half', PW - 12, 290, mixP(m, b, 0.5), { side: 'R', color: COL.accent, bold: true, op: o }); }
  ex += lab('結膜', 'conjunctiva', PW - 12, PH - 30, P(DP.at(3.0, LOWER.U_CONJ / 2)), { side: 'R', op: T.on(2, 0.6) });
  ex += note('從前面切、距瞼緣的位置為示意', T.on(1), 26);
  let rx = '';
  if (B.fracL) rx += lab('瞼板切線（在組織下，畫虛線）', 'fracture line', PW - 12, PH - 30, B.fracL, { side: 'R', color: COL.red, bold: true, op: ss(0.2, 0.6, fr) });
  return { L: { svg: sv.svg, extra: ex, P: LSAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-4'] = T => {
  const ma = T.p(0, 0.3, 0.95), tie = T.p(2, 0.05, 0.7), sc = T.p(3, 0.1, 0.7);
  const low = { ...L_FR, mattress: ma, exitH: LLP.exitH, tie, skinClose: sc };
  const sv = VL.lsag(low, UP_DONE, PW, PH, LS_WIN, 'sL'), A = sv.A, cv = VL.lcor(UP_DONE, low, PW, PH, LC_WIN, 'cR'), B = cv.A;
  const om = T.on(0, 0.6, 0.8) * (1 - T.on(3));
  let ex = '';
  if (A.mattress) ex += lab('mattress suture（4-0 vicryl，路徑示意）', 'everting suture', PW - 12, PH - 30, A.mattress, { side: 'R', color: COL.suture, bold: true, size: 14, op: om });
  if (A.mattressIn) ex += lab('進針：下穹窿附近的結膜面', 'in', PW - 12, 236, A.mattressIn, { side: 'R', color: COL.suture, op: T.on(1, 0.6) * (1 - T.on(2)) });
  if (A.mattressExit) ex += lab('出針：睫毛線下方的皮膚', 'out', 14, 236, A.mattressExit, { color: COL.suture, op: T.on(1, 0.6, 1.0) * (1 - T.on(2)) });
  ex += lab('瞼緣往外轉、睫毛離開角膜', 'margin everted', 14, 52, A.lashL, { color: COL.accent, bold: true, op: ss(0.5, 1, tie) * (1 - T.on(3)) });
  if (A.skinClose) ex += lab('縫皮（7-0 ethilone）', 'skin closure', 14, 236, A.skinClose, { color: COL.ink, bold: true, op: ss(0.4, 1, sc) });
  ex += lab('角膜', 'cornea', PW - 12, 52, sv.P([-12.2, 2.9]), { side: 'R' });
  let rx = '';
  if (B.mattressL) { const X = cv.M.mattressX; rx += lab(`${X.length} 針（位置示意）`, 'mattress ×2', 14, PH - 30, B.mattressL, { color: COL.suture, bold: true, op: om });
    rx += lab('出針點', 'exit', PW - 12, PH - 30, cv.P([X[1], cv.r.exitLY(X[1])]), { side: 'R', color: COL.suture, op: om }); }
  rx += lab('瞼緣往外轉', 'everted margin', PW - 12, 52, cv.P([6, CORONAL.Ly(6)]), { side: 'R', color: COL.accent, bold: true, op: ss(0.5, 1, tie) * (1 - T.on(3)) });
  if (B.skinCloseL) rx += lab('縫皮', 'skin sutures', 14, PH - 30, B.skinCloseL, { bold: true, op: ss(0.4, 1, sc) });
  return { L: { svg: sv.svg, extra: ex, P: LSAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 4 Electric epilation
// the electrolysis views: the lid after the rotation (margin turned out, L_EVERT); the treated lash is a misdirected one (amber). In the
// sagittal zoom its follicle is the model's follicle in this plane (the normal lash shaft there is hidden: pluck 1)
function zoomViews(st, id1, id2, fd) {
  const low = { ...L_EVERT, pluck: 1, follicleDepth: fd, ...st };
  const sv = VL.lsag(low, UP_DONE, PW, PH, LZ_WIN, id1), cv = VL.lcor(UP_DONE, { ...L_EVERT, misdirected: st.misdirectedC ?? 1 }, PW, PH, CZ_WIN, id2);
  return { sv, cv };
}
// follicle axis dimension (sagittal zoom): from the root at the margin E along the follicle to depth d, offset to the anterior side
function follicleDim(sv, d, col, off = 0.22) {
  const M = sv.M, E = M.lashRootL, dir = M.follicleDir, n = [dir[1], -dir[0]], o = n[0] < 0 ? n : [-n[0], -n[1]];   // offset toward anterior (−x)
  const a = [E[0] + o[0] * off, E[1] + o[1] * off], b = [a[0] + dir[0] * d, a[1] + dir[1] * d];
  return { svg: VIEWS.dim(sv.P(a), sv.P(b), col), mid: sv.P(mixP(a, b, 0.5)), end: sv.P(b) };
}
DRAW2['4-1'] = T => {
  const x18 = T.on(3, 0.8), Z0 = zoomViews({ misdirected: 1 }, 'sL', 'cR', LLP.follicle), Z1 = zoomViews({ misdirected: 1 }, 'sM', 'cS', LLP.rootSingh);
  const sv = Z0.sv, A = sv.A, cv = Z0.cv, B = cv.A, M = sv.M;
  const d09 = follicleDim(sv, LLP.follicle, '#7a4a2a'), d18 = follicleDim(Z1.sv, LLP.rootSingh, '#7a4a2a');
  const o1 = T.on(1, 0.6, 0.6) * (1 - x18), o2 = T.on(2, 0.6, 0.6) * (1 - x18);
  let ex = `<g opacity="${o1}">${d09.svg}</g><g opacity="${x18}">${d18.svg}</g>`;
  ex += lab(`毛囊深 ${LLP.follicle} mm（上眼瞼 ${LLP.follicleUp} mm）`, 'follicle depth', 14, 200, d09.mid, { color: '#7a4a2a', bold: true, op: o1 });
  // 95 % reach: a tick on the follicle axis at 1.4 mm
  { const E = M.lashRootL, dir = M.follicleDir, q = sv.P([E[0] + dir[0] * LLP.reach95, E[1] + dir[1] * LLP.reach95]), n = [dir[1], -dir[0]], a = [q[0] + n[0] * 14, q[1] + n[1] * 14], b = [q[0] - n[0] * 14, q[1] - n[1] * 14];
    ex += `<g opacity="${o2}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.suture}" stroke-width="3"/></g>`;
    ex += lab(`插 ${LLP.reach95} mm：碰到 95% 的毛囊`, 'needle depth', 14, 336, q, { color: COL.suture, bold: true, op: o2 }); }
  ex += lab(`根部約 ${LLP.rootSingh} mm`, 'root depth', 14, 200, d18.mid, { color: '#7a4a2a', bold: true, op: x18 });
  // 75° between the follicle root and the margin surface (Singh 2024): arc at the root, between the margin surface (toward the globe) and the follicle
  { const Mz = Z1.sv.M, E = Mz.lashRootL, dir = Mz.follicleDir, nrm = Z1.sv.r.DP.nrm(0.15), sfc = [-nrm[0], -nrm[1]], o = T.on(4, 0.6, 0.4), R = 0.42, a0 = Math.atan2(sfc[1], sfc[0]), a1 = Math.atan2(dir[1], dir[0]);
    let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const arc = []; for (let i = 0; i <= 16; i++) { const a = a0 + d * i / 16; arc.push(Z1.sv.P([E[0] + R * Math.cos(a), E[1] + R * Math.sin(a)])); }
    const s0 = Z1.sv.P(E), s1 = Z1.sv.P([E[0] + sfc[0] * 0.8, E[1] + sfc[1] * 0.8]);
    ex += `<g opacity="${o}">${curve([s0, s1], COL.amber, 2, 1, '5 4')}${curve(arc, COL.amber, 2.6)}</g>` + lab(`約 ${LLP.rootAngle}°`, 'root angle', 14, 250, arc[8], { color: COL.amber, bold: true, op: o }); }
  ex += lab('瞼板與 meibomian gland', 'tarsus, gland', PW - 12, PH - 30, A.glandL, { side: 'R', bold: true, op: T.on(4, 0.6, 1.0) });
  ex += lab('方向歪的睫毛', 'misdirected lash', 14, 52, sv.P(cubic(M.misLashPts, 0.3)), { color: COL.amber, bold: true, op: 1 - T.on(1) });
  ex += lab('角膜', 'cornea', PW - 12, 52, sv.P([-10.6, 5.6]), { side: 'R' });
  ex += VIEWS.sbar(sv.k, 1, 1);
  let rx = '';
  if (B.misLashL) rx += lab('要處理的睫毛（示意）', 'lashes to treat', 14, 52, B.misLashL, { color: COL.amber, bold: true });
  rx += lab('睫毛線', 'lash line', PW - 12, PH - 30, cv.P([2.0, cv.r.lashLY(2.0)]), { side: 'R' });
  rx += tag('順著睫毛的方向斜著進去', T.on(4, 0.6, 1.4), COL.accent, PH - 70);
  return { L: { svg: xfade(sv.svg, Z1.sv.svg, x18), extra: ex, P: LZ_P }, R: { svg: cv.svg, extra: rx, P: CZ_P } };
};

DRAW2['4-2'] = T => {
  const nd = T.p(1, 0.1, 0.8), tr = T.p(2, 0.0, 0.45), pl = T.p(2, 0.55, 0.95);
  const Z = zoomViews({ misdirected: 1 - pl, needle: nd * (1 - pl), treated: tr, misdirectedC: 1 - pl }, 'sL', 'cR', LLP.follicle), sv = Z.sv, A = sv.A, cv = Z.cv, B = cv.A;
  let ex = '';
  if (sv.M.misLashPts) ex += lab('轉正後還碰到角膜的睫毛', 'still touching', 14, 52, sv.P(cubic(sv.M.misLashPts, 0.3)), { color: COL.amber, bold: true, op: (1 - T.on(1)) * (1 - pl) });
  if (A.needleBack) ex += lab('細針沿睫毛幹進到毛囊', 'electrolysis needle', 14, 52, sv.P([sv.M.needleIn[0] - sv.M.follicleDir[0] * 0.7, sv.M.needleIn[1] - sv.M.follicleDir[1] * 0.7]), { bold: true, op: T.on(1, 0.6) * (1 - pl) });
  ex += lab('毛囊根部：通電產熱', 'follicle destroyed', 14, 290, A.bulbL, { color: '#7a4a2a', bold: true, op: ss(0.3, 0.8, tr) });
  ex += lab('睫毛拔掉', 'lash removed', PW - 12, 52, A.lashRootL, { side: 'R', color: COL.accent, bold: true, op: ss(0.4, 1, pl) * (1 - T.on(3)) });
  ex += note('凝固範圍為示意', ss(0.3, 0.8, tr), 26);
  ex += VIEWS.sbar(sv.k, 1, 1);
  // coronal: the needle at each misdirected lash in turn (first half of line 1, second half), coagulation, then the lashes removed
  const n1 = T.p(1, 0.05, 0.45), n2 = T.p(1, 0.5, 0.9), on1 = T.on(1) * (1 - T.p(1, 0.45, 0.5)) * (1 - pl), on2 = T.p(1, 0.48, 0.52) * (1 - pl);
  let rx = needleC(cv, MIS_X[0], n1, on1) + needleC(cv, MIS_X[1], n2, on2) + coagC(cv, MIS_X[0], tr) + coagC(cv, MIS_X[1], tr);
  if (B.misLashL) rx += lab('方向歪的睫毛', 'misdirected lashes', 14, 52, B.misLashL, { color: COL.amber, bold: true, op: (1 - T.on(1)) * (1 - pl) });
  rx += lab('針從睫毛根部進', 'needle at the root', PW - 12, 52, cv.P([MIS_X[1], cv.r.lashLY(MIS_X[1])]), { side: 'R', bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  rx += lab('處理過的毛囊（示意）', 'treated follicles', 14, PH - 30, cv.P([MIS_X[0], cv.r.lashLY(MIS_X[0]) + 0.35]), { color: '#7a4a2a', bold: true, op: ss(0.3, 0.8, tr) });
  rx += tag('機器、能量、時間、根數：依院內常規', T.on(3), COL.accent, PH - 70);
  return { L: { svg: sv.svg, extra: ex, P: LZ_P }, R: { svg: cv.svg, extra: rx, P: CZ_P } };
};

// ---------------------------------------------------------------- 4-3 evidence (full panel)
DRAW2['4-3'] = T => {
  let s = '';
  const cardH = (x, y, w, h, op, stroke) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="${stroke || '#d3dae1'}"/></g>`;
  // 1. histology after RF at 3 mm (Singh 2022)
  const o1 = T.on(1, 0.5), b1 = ss(T.st(1) + 0.6, T.st(1) + 1.6, T.u);
  s += cardH(24, 18, 580, 150, o1) + text(42, 48, '組織學：RF 在 3 mm 深度電解（Singh 2022）', { size: 17, bold: true, color: COL.accent, op: o1 });
  s += `<g opacity="${o1}">${text(42, 86, '只破壞部分毛囊根部的眼瞼', { size: 15.5 })}<rect x="42" y="100" width="520" height="22" rx="4" fill="#e6eaee"/><rect x="42" y="100" width="${(520 * 0.55 * b1).toFixed(1)}" height="22" rx="4" fill="#b3122b"/>${text(562, 150, '55%', { size: 18, bold: true, anchor: 'end', op: b1 })}</g>`;
  // 2. ultra-fine needle series (Sakarya 2010)
  const o2 = T.on(2, 0.5), b2 = ss(T.st(2) + 0.6, T.st(2) + 1.6, T.u), o3 = T.on(3, 0.5), b3 = ss(T.st(3) + 0.3, T.st(3) + 1.3, T.u);
  s += cardH(626, 18, 580, 260, o2) + text(644, 48, '超細針電解，24 個眼瞼（Sakarya 2010）', { size: 17, bold: true, color: COL.accent, op: o2 });
  s += `<g opacity="${o2}">${text(644, 86, '一次就成功', { size: 15.5 })}<rect x="644" y="100" width="520" height="22" rx="4" fill="#e6eaee"/><rect x="644" y="100" width="${(520 * 0.666 * b2).toFixed(1)}" height="22" rx="4" fill="${COL.accent}"/>${text(1164, 150, '66.6%', { size: 18, bold: true, anchor: 'end', op: b2 })}${text(644, 150, '其餘再做一到兩次', { size: 14, color: COL.sub })}</g>`;
  s += `<g opacity="${o3}">${text(644, 190, '輕微的瞼緣缺口', { size: 15.5 })}<rect x="830" y="176" width="${(300 * 0.166 * b3).toFixed(1)}" height="18" rx="3" fill="${COL.amber}"/>${text(1188, 190, '16.6%', { size: 16, bold: true, anchor: 'end', op: b3 })}
    ${text(644, 228, '色素變淡', { size: 15.5 })}<rect x="830" y="214" width="${(300 * 0.083 * b3).toFixed(1)}" height="18" rx="3" fill="${COL.amber}"/>${text(1188, 228, '8.3%', { size: 16, bold: true, anchor: 'end', op: b3 })}</g>`;
  // 3. which lid, who (Kapantais 2022)
  const o4 = T.on(4, 0.5);
  s += infoCard(24, 190, 580, [['成功率比較（Kapantais 2022）', { bold: true, color: COL.accent, size: 17 }], ['只處理下眼瞼 ＞ 上眼瞼（或上下一起）', { size: 15.5 }], ['主治醫師第一次 ＞ 住院醫師第一次', { size: 15.5 }]], o4, { h: 110 });
  // 4. take-home
  const o5 = T.on(5, 0.5);
  s += infoCard(24, 320, 1182, [['術後追蹤；事先告訴病人：可能要再處理', { bold: true, size: 18, color: COL.ink }]], o5, { h: 56, stroke: COL.accent });
  s += htext(FW - 12, PH - 12, '研究族群與術式各不相同，數字不能直接比較', { size: 12.5, color: COL.sub, anchor: 'end', op: T.on(1) });
  return { F: { svg: s, P: { title: '電解的效果：不一定一次就好', orient: '各研究的病人與機器不同' } } };
};

// ---------------------------------------------------------------- 5 順序與術中狀況
DRAW2['5-1'] = T => {
  // left: the order told in this video; right: the face through the same order (pre-op → upper lid → lower lid → electrolysis)
  const steps = [['① 上眼瞼', 'levator resection＋brow fixation', 1], ['② 下眼瞼', 'marginal rotation', 1], ['③ 電解', '轉正後還碰到角膜的睫毛', 2], ['④ 睜眼、閉眼', '上下眼瞼一起看', 3]];
  const k1 = T.p(1, 0.05, 0.5), k2 = T.p(1, 0.5, 0.95), k3 = T.p(2, 0.3, 0.9);
  let cur = -1; if (T.u >= T.st(1)) cur = k2 > 0.02 ? 1 : 0; if (T.u >= T.st(2)) cur = 2; if (T.u >= T.st(3)) cur = 3;
  let svg = '';
  steps.forEach(([h, d, li], i) => { const y = 22 + i * 92, op = 0.35 + 0.65 * T.on(li, 0.4, i === 1 ? T.en(1) - T.st(1) - 2.2 : 0), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 78, { op: op * T.on(0, 0.5), hl }) + text(42, y + 34, h, { size: 19, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(42, y + 62, d, { size: 15.5, color: COL.sub, op }); });
  svg += text(303, 398, '先做哪一邊、消毒與麻醉：依院內常規', { size: 15, bold: true, color: COL.amber, anchor: 'middle', op: T.on(0, 0.6) });
  const up = { mrd1: lerp(LRP.mrdPre, LRP.mrdPost, k1), browY: lerp(LRP.browRaise, 0, k1) }, low = { entr: 1 - k2, tie: k2, misdirected: 1 - k3 };
  const cv = VL.lcor(up, low, PW, PH, LC_FACE, 'cR'), B = cv.A;
  let rx = lab('上眼瞼', 'upper lid', PW - 12, 52, cv.P([5, cv.r.Uy(5)]), { side: 'R', color: COL.accent, bold: true, op: cur === 0 ? 1 : 0 });
  rx += lab('下眼瞼', 'lower lid', PW - 12, PH - 30, cv.P([5, CORONAL.Ly(5)]), { side: 'R', color: COL.accent, bold: true, op: cur === 1 ? 1 : 0 });
  if (B.misLashL) rx += lab('還碰到角膜的睫毛', 'remaining lashes', 14, 52, B.misLashL, { color: COL.amber, bold: true, op: cur === 2 ? 1 - k3 : 0 });
  rx += contour(cv, cur === 3 ? T.on(3, 0.6) : 0) + lowerContour(cv, cur === 3 ? T.on(3, 0.6) : 0);
  rx += tag('本片的講法；實際順序依院內常規', T.on(1, 0.6), COL.sub, PH - 20);
  return { L: { svg, P: { title: '順序（本片的講法）', orient: '' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['5-2'] = T => {
  const items = [['轉完還有睫毛碰角膜', '電解那幾根', 1], ['下眼瞼轉太多：ectropion', '早期過度矯正 12／41，多數自己恢復（retractor 修補＋LTS）', 2], ['高度、contour、閉眼', '睜眼、閉眼上下一起看；調整依院內常規', 4]];
  let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
  let svg = '';
  items.forEach(([h, d, li], i) => { const y = 24 + i * 112, op = 0.35 + 0.65 * T.on(li, 0.4), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 96, { op: op * T.on(0, 0.5), hl }) + text(46, y + 54, `${i + 1}`, { size: 26, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) +
      text(84, y + 38, h, { size: 18, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(84, y + 68, d, { size: 14.5, color: COL.sub, op }); });
  const zl = cur === 0 ? T.on(1, 0.8) : 0, win = VIEWS.zwin(LC_FACE, { x: -9.5, y: -3.0, w: 17 }, zl);
  const cv = VL.lcor(UP_DONE, { ...L_EVERT, misdirected: cur <= 0 ? 1 : 1 - T.on(2, 0.6) }, PW, PH, win, 'cR'), B = cv.A;
  let rx = '';
  if (B.misLashL) rx += lab('還碰到角膜的睫毛', 'remaining lashes', 14, 52, B.misLashL, { color: COL.amber, bold: true, op: zl });
  const o2 = cur === 1 ? T.on(2, 0.6) : 0, o3 = cur === 2 ? T.on(4, 0.6) : 0;
  rx += lowerContour(cv, o2, '#d23c3c') + lab('下瞼緣：有沒有外翻', 'ectropion?', PW - 12, PH - 30, cv.P([5, CORONAL.Ly(5)]), { side: 'R', color: COL.red, bold: true, op: o2 });
  rx += mrdArrow(cv, o3) + contour(cv, o3) + lowerContour(cv, o3) + lab('高度與 contour', 'height / contour', PW - 12, 52, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: o3 });
  rx += lab('閉眼時兩個瞼緣', 'closure', 14, PH - 30, cv.P([-6, CORONAL.Ly(-6)]), { color: '#b58a00', bold: true, op: o3 });
  return { L: { svg, P: { title: '三個狀況', orient: '' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 6 術後 (full panel)
DRAW2['6'] = T => {
  let s = '';
  const chips = [['上眼瞼高度與閉眼', 0], ['下眼瞼位置', 0], ['殘留睫毛', 0], ['眉毛', 0]];
  let x = 24; chips.forEach(([c, li], i) => { const w = measure(c, 16, true) + 34, op = T.on(li, 0.5, i * 0.3);
    s += `<g opacity="${op}"><rect x="${x}" y="18" width="${w}" height="38" rx="19" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + w / 2, 43, c, { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; x += w + 14; });
  // lagophthalmos over time (Tucker 2000): bars at day 1, week 1, weeks 6–20
  const oa = T.on(1, 0.5), bars = [['第 1 天', 60, 0], ['1 週', 33, 0.6], ['6–20 週', 9, 1.2]];
  s += `<g opacity="${oa}"><rect x="24" y="80" width="580" height="250" rx="9" fill="#fff" stroke="#d3dae1"/>${text(42, 110, '閉不緊的眼瞼比例（Tucker 2000）', { size: 17, bold: true, color: COL.accent })}<path d="M60 300H580" stroke="#aab6c2" stroke-width="2"/></g>`;
  bars.forEach(([lb, v, d], i) => { const g = ss(T.st(1) + 0.3 + d, T.st(1) + 1.1 + d, T.u), bx = 100 + i * 170, h = 160 * v / 60 * g;
    s += `<g opacity="${oa}"><rect x="${bx}" y="${(300 - h).toFixed(1)}" width="90" height="${h.toFixed(1)}" rx="4" fill="${i === 2 ? COL.accent : i === 1 ? COL.amber : '#b3122b'}"/>${text(bx + 45, 322, lb, { size: 15, anchor: 'middle' })}${text(bx + 45, 292 - h, v + '%', { size: 17, bold: true, anchor: 'middle', op: g })}</g>`; });
  s += infoCard(626, 80, 580, [['下眼瞼（Yip 2000）', { bold: true, color: COL.accent, size: 17 }], ['再內翻？', { size: 16 }], ['轉太多變成 ectropion？早期過度矯正多數自己恢復', { size: 15.5 }]], T.on(2, 0.5), { h: 110 });
  s += infoCard(626, 206, 580, [['殘留或再長的睫毛（Rajak 2012、Sakarya 2010）', { bold: true, color: COL.accent, size: 17 }], ['電解後復發不少 → 需要時再處理', { size: 16 }]], T.on(3, 0.5), { h: 84 });
  s += infoCard(626, 306, 580, [['拆線時間、用藥：依院內常規', { bold: true, size: 16 }]], T.on(4, 0.5), { h: 48 });
  return { F: { svg: s, P: { title: '術後追蹤', orient: '各研究的病人與術式不同' } } };
};

// ---------------------------------------------------------------- 7 跟刀清單 (full panel)
DRAW2['7'] = T => {
  const items = ['術前：每根碰角膜的睫毛是哪一種機轉', '上眼瞼畫線 2.5／4／4 mm，切除寬 5 mm', 'Putterman clamp 切除；4-0 vicryl ×3 固定瞼板', '剝到眉下、避開眶上神經；4-0 vicryl ×1；量 MRD1',
    '下眼瞼睫毛下 2.5 mm 切皮；剝開眶隔與 retractors', '15 號刀切瞼板一半；4-0 vicryl ×2 mattress', '轉正後還碰到角膜的睫毛：沿睫毛幹電解', '睜眼、閉眼上下一起看；6-0 Prolene、7-0 ethilone'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '數值與縫線依院內常規' } } };
};
