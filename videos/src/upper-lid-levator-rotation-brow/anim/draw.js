// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the upper-lid model (videos/models/eyelid: lid.js, coronal.js): the sagittal mechanism
// section (left) and the surgeon's coronal view (right); both come from the same state, so heights agree (checked in ../check.js).
// Chapter 2 (marginal rotation through the lid crease): LID.draw's crease / flap / cut / suture (buried) states with the opt-in
// `creaseH` = the levator incision height, so the rotation goes through the same incision. The coronal flap window, the reflected flap
// and the incision line are drawn here (ROT below), from the coronal model's own height functions.
// Chapter 3 (levator, brow): the same states, windows and calls as the first video. Chapter 4: the upper-lid margin zoom and the
// electrolysis needle (EPI below; the needle is this video's overlay, along the model's follicle).
// Surgical parameters: params.js (LRP, INC, MRP, EP, IX).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width
const SAG_LID = { x: -24, y: -21, w: 30 }, LID_SAG = { x: -21, y: -6.5, w: 14 }, SAG_BROW = { x: -28.5, y: -31, w: 44 }, ROT_SAG = { x: -21.5, y: -8.6, w: 14 };
const COR_LID = { x: -17.5, y: -15, w: 33 }, COR_FACE = { x: -26, y: -27.5, w: 52 }, ROT_COR = { x: -14, y: -9.5, w: 26 };
const SAG_P = { title: '矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const ZS_P = { title: '上瞼緣放大（矢狀切面）upper lid margin', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD　術者視角', orient: '面對病人：左＝temporal　右＝nasal' };
const CZ_P = { title: '正面：上瞼緣特寫　右眼 OD', orient: '面對病人：左＝temporal　右＝nasal' };
// upper-lid surgical states (cumulative). Rotation first (MRP, pre-op height), then the levator states of the first video (INC: 院內常規)
const PRE = { mrd1: LRP.mrdPre };
const ROT0 = { ...PRE, curl: MRP.entr, creaseH: LRP.incH[1] };              // the in-turned margin, the incision on the levator line
const ROT1 = { ...ROT0, crease: 1, flap: 1, cut: 1, suture: 1, buried: true, curl: MRP.after };
const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
const RES = { ...OPEN, dis: 1, resect: 1 };
const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };   // nasal window: supraorbital notch and nerve (示意)
const MIS_X = [-3.2, -1.2];   // coronal x of two of the model's misdirected lashes (coronal.js), where the needle enters in 4-2

const pts = (P, f, x0, x1, st = 0.25) => { const r = []; for (let x = x0; x <= x1 + 1e-9; x += st) r.push(P([x, f(x)])); return r; };
const levAt = (sv, x) => { const LV = sv.r.LV, q = LV.near([x, -17.6]); return sv.P(LV.off(q, 0.5)); };
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>`;
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.4) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const mrdArrow = (cv, op) => { const a = cv.P([0, 0]), b = cv.P([0, cv.r.Uy(0)]);
  return `<g opacity="${op}"><circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="3.2" fill="#fff"/>${VIEWS.dim(a, b, '#ffd34d', 1)}</g>`; };
const contour = (cv, op) => curve(pts(cv.P, cv.r.Uy, CORONAL.LC[0] + 0.5, CORONAL.MC[0] - 0.5), '#ffd34d', 3, op);
const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const unitV = v => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}
// horizontal bar row: label, value (%), bar scale
const barRow = (x, y, label, v, k, col, op, w = 250, lw = 190) => `<g opacity="${op}">${text(x, y + 13, label, { size: 14.5 })}<rect x="${x + lw}" y="${y}" width="${(w * v / 100 * k).toFixed(1)}" height="16" rx="3" fill="${col}"/>${text(x + lw + w + 52, y + 13, v + '%', { size: 15, bold: true, anchor: 'end', op: k })}</g>`;

// ---------------------------------------------------------------- ROT: the lid-crease approach in the coronal view
// The incision is the levator-resection lower line (excLoY, through 2.5 / 4 / 4 mm with incX), carried down with the in-turned lash line
// (rollY) as the sagittal skin is; the flap window runs from the incision to just above the lash line (depth 1: tarsus exposed).
const ROT = (() => {
  const XS = []; for (let x = -12.4; x <= 9.8 + 1e-9; x += 0.2) XS.push(+x.toFixed(2));
  // excMark 1e-6 (invisible) switches on the levator incision heights in the coronal model
  const fns = st => { const c = CORONAL.draw({ variant: 'asian', state: { ...st, excMark: 1e-6 } }); return { inc: x => c.excLoY(x) + c.rollY(x), lash: x => c.lashY(x) + c.rollY(x), cutY: c.cutY, Uy: c.Uy }; };
  const win = f => ({ poly: [...XS.map(x => [x, f.inc(x)]), ...XS.slice().reverse().map(x => [x, f.lash(x) - 0.35])], depth: 1 });
  // coronal view: st = model state (evert, mrd1, incision, buried …); inc 0–1 incision drawn; flap 0–1 window open and flap reflected
  // the tarsotomy (tc 0–1, dashed: it is behind the skin side) at the sagittal height of the cut above the margin for this lid height: the coronal
  // model's cutY profile is scaled so its centre matches the sagittal section (the coronal model keeps the MRD1-4 height when the lid slides)
  const CUTH = {}, cutH = m => CUTH[m] ?? (CUTH[m] = (d => d.at(LID.S_CUT, 0)[1] - d.at(0, 0)[1])(LID.draw({ state: { mrd1: m } }).DP));
  function view(st, inc, flap, W, H, w, id, tc = 0) {
    const s = { ...INC, ...st }, f = fns(s), cv = VIEWS.cor(s, W, H, w, id, { windows: flap > 0.05 ? [win(f)] : [] }), P = cv.P;
    let svg = cv.svg;
    if (tc > 0) { const k = cutH(s.mrd1 ?? 4) / (f.cutY(0) - f.Uy(0)), y = x => f.Uy(x) + (f.cutY(x) - f.Uy(x)) * k, n = Math.max(2, Math.round(XS.length * Math.min(1, tc)));
      svg += curve(XS.slice(0, n).map(x => P([x, y(x)])), '#d23c3c', 2.8, 1, '7 5'); cv.A.tarsotomy = P([6.5, y(6.5)]); }
    if (flap > 0.05) { const top = x => f.lash(x) - 0.35, bot = x => top(x) + 1.6 * flap;
      svg += `<path d="${pathOf([...XS.map(x => P([x, top(x)])), ...XS.slice().reverse().map(x => P([x, bot(x)]))])}Z" fill="#e9b89c" stroke="#b07a5e" stroke-width="1.4" opacity="0.96"/>`; }
    if (inc > 0) { const n = Math.max(2, Math.round(XS.length * Math.min(1, inc))); svg += curve(XS.slice(0, n).map(x => P([x, f.inc(x)])), '#d23c3c', 3); }
    return { ...cv, svg, f, flapEdge: P([-6, f.lash(-6) + 1.25 * flap]) };
  }
  return { view, fns, XS };
})();

// ---------------------------------------------------------------- EPI: upper-lid margin zoom and the electrolysis needle
// The treated (misdirected) lash borrows the follicle of the model's first lash in this plane (lid.js: root at u 1.70, bulb at s 2.05,
// u 1.56; 示意). The needle runs along that follicle from outside the margin to the bulb.
const EPI = (() => {
  const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));   // lid.js: rounded anterior margin
  const fol = r => { const E = r.DA.at(marginS(1.70), 1.70), B = r.DA.at(2.05, 1.56), d = unitV([B[0] - E[0], B[1] - E[1]]); return { E, B, d, L: Math.hypot(B[0] - E[0], B[1] - E[1]) }; };
  const ZST = { mrd1: LRP.mrdPost, misdirected: 1 };                          // the lid after the rotation and the levator (margin turned out; 示意)
  function zoom(st, W, H, id) { const r0 = LID.draw({ state: { ...ZST, ...st } }), F0 = fol(r0), win = { x: F0.E[0] - 2.2, y: F0.E[1] - 2.9, w: 5 };
    const sv = VIEWS.sag({ ...ZST, ...st }, W, H, win, id); return { sv, F: F0 }; }
  function needle(sv, F, k, op) { const out = [F.E[0] - F.d[0] * 0.9, F.E[1] - F.d[1] * 0.9], tip = [F.E[0] + F.d[0] * F.L * k, F.E[1] + F.d[1] * F.L * k];
    const a = sv.P(out), b = sv.P(mixP(out, tip, 1));
    return { svg: `<g opacity="${op}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#2f3a44" stroke-width="7" stroke-linecap="round"/><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#aeb8c2" stroke-width="3.6"/></g>`, out: a, tip: b, mm: { out, tip } }; }
  // dimension along the follicle axis from the root, offset to the anterior side
  function dim(sv, F, d, col, off = 0.2) { const n = [F.d[1], -F.d[0]], o = n[0] < 0 ? n : [-n[0], -n[1]], a = [F.E[0] + o[0] * off, F.E[1] + o[1] * off], b = [a[0] + F.d[0] * d, a[1] + F.d[1] * d];
    return { svg: VIEWS.dim(sv.P(a), sv.P(b), col), mid: sv.P(mixP(a, b, 0.5)), end: sv.P(b) }; }
  const coag = (sv, F, k) => { if (k <= 0) return ''; const c = sv.P(F.B); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(0.28 * k * sv.k).toFixed(1)}" fill="#c98a4b" opacity="0.5" stroke="#7a4a2a" stroke-width="1.5" stroke-dasharray="4 3"/>`; };
  // the coronal close-up of the margin and the needle entering at the root of a misdirected lash (projected short: it comes along the shaft)
  const CZ_WIN = { x: -9.2, y: -8.6, w: 14 };
  function cor(st, W, H, id) { return VIEWS.cor({ ...ZST, ...st }, W, H, CZ_WIN, id); }
  function needleC(cv, x, k, op) { const y = cv.r.lashY(x) + cv.r.rollY(x) + 0.1, top = [x - 0.25, y + 2.6], tip = mixP(top, [x, y], k), P = cv.P;
    return `<g opacity="${op}"><path d="M${P(top).map(v => v.toFixed(1)).join(' ')}L${P(tip).map(v => v.toFixed(1)).join(' ')}" stroke="#2f3a44" stroke-width="5" stroke-linecap="round"/><path d="M${P(top).map(v => v.toFixed(1)).join(' ')}L${P(tip).map(v => v.toFixed(1)).join(' ')}" stroke="#aeb8c2" stroke-width="2.6"/></g>`; }
  const coagC = (cv, x, k) => { const y = cv.r.lashY(x) + cv.r.rollY(x), c = cv.P([x, y - 0.35]); return k > 0 ? `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(0.35 * k * cv.k).toFixed(1)}" fill="#c98a4b" opacity="0.5" stroke="#7a4a2a" stroke-width="1.5" stroke-dasharray="4 3"/>` : ''; };
  return { zoom, needle, dim, coag, cor, needleC, coagC, fol, ZST, CZ_WIN };
})();
// panel titles live outside the drawing functions: hand their characters to the kit's font preload
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, ZS_P, COR_P, CZ_P]);

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VIEWS.cor({ ...PRE, browY: LRP.browRaise, evert: -1, misdirected: 1 }, PW, PH, { x: -26, y: -26, w: 52 }, 'tR'), B = cv.A;
  let ex = lab('眉毛靠 frontalis 撐高', 'brow raised', 14, 52, B.brow, { color: COL.amber, bold: true });
  ex += lab('上眼瞼下垂', 'ptosis', PW - 12, 52, cv.P([3, cv.r.Uy(3)]), { side: 'R', color: COL.amber, bold: true });
  ex += lab('上瞼緣內翻：睫毛碰到角膜', 'entropion', PW - 12, PH - 60, cv.P([-4, cv.r.lashY(-4) + cv.r.rollY(-4) + 1.2]), { side: 'R', color: COL.red, bold: true });
  ex += note('術前高度與內翻程度為示意', 1, PH - 18);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1-1'] = T => {
  const ent = T.p(1, 0.05, 0.45) * (1 - T.on(2, 0.5)), mis = T.on(2, 0.6, 0.4), met = T.on(3, 0.6, 0.4) * (1 - T.on(4, 0.6)), four = T.u >= T.st(4);
  const rot = T.p(4, 0.05, 0.5), entN = four ? 1 - rot : ent;
  const sv = VIEWS.sag({ ...PRE, curl: entN, misdirected: mis, metaplastic: met }, PW, PH, LID_SAG, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ ...PRE, evert: -entN, misdirected: mis, metaplastic: met }, PW, PH, COR_LID, 'cR'), B = cv.A;
  const o1 = T.on(1, 0.6, 0.6) * (1 - T.on(2, 0.4)), o2 = T.on(2, 0.6, 0.6) * (1 - T.on(4)), o3 = T.on(3, 0.6, 0.6) * (1 - T.on(4)), o5 = T.on(4, 0.6, 1.4);
  let ex = lab('睫毛', 'lashes', 14, PH - 30, A.lash, { bold: true, op: 1 - T.on(1) });
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, A.cornea, { side: 'R' });
  ex += lab('瞼板', 'tarsus', PW - 12, 52, sv.P(sv.r.DP.at(4, 0.5)), { side: 'R' });
  ex += lab('① entropion：瞼緣往內轉', 'margin turned in', 14, 52, A.lash, { color: COL.red, bold: true, op: o1 });
  if (A.misLash) ex += lab('② misdirected：位置對、方向歪', 'misdirected', 14, 52, A.misLash, { color: COL.amber, bold: true, op: o2 });
  if (A.metaLash) ex += lab('③ metaplastic：位置錯（示意）', 'metaplastic', 14, 106, A.metaLash, { color: COL.amber, bold: true, op: o3 });
  if (A.misLash) ex += lab('轉正後還碰到角膜', 'still touching', 14, 52, A.misLash, { color: COL.amber, bold: true, op: o5 });
  ex += lab('瞼緣轉正', 'rotated out', 14, PH - 30, A.lash, { color: COL.accent, bold: true, op: o5 });
  ex += tag('三種機轉常常同時存在', T.on(0) * (1 - T.on(1)));
  let rx = lab('上眼瞼睫毛線', 'upper lash line', 14, 52, cv.P([-8, cv.r.lashY(-8) + cv.r.rollY(-8)]), { op: 1 - T.on(1) });
  rx += lab('睫毛往下碰到角膜', 'lashes on the cornea', PW - 12, PH - 64, cv.P([-4, cv.r.lashY(-4) + cv.r.rollY(-4) + 1.2]), { side: 'R', color: COL.red, bold: true, op: o1 });
  if (B.misLash) rx += lab('方向歪的睫毛', 'misdirected', 14, PH - 64, B.misLash, { color: COL.amber, bold: true, op: Math.max(o2, o5) });
  if (B.metaLash) rx += lab('化生睫毛（位置示意）', 'metaplastic', PW - 12, PH - 64, B.metaLash, { side: 'R', color: COL.amber, bold: true, op: o3 });
  { const o6 = T.on(5, 0.6) * (1 - T.on(6, 0.4));
    rx += infoCard(150, 12, 444, [['60 片眼瞼（Cruz 2015a）', { bold: true, color: COL.accent }], ['1 片：瞼緣位置正確，內側仍有 2 根碰角膜', { size: 14.5 }]], o6, { h: 72 }); }
  rx += tag('rotation → entropion；剩下的睫毛 → electrolysis', T.on(6), COL.accent, PH - 20);
  rx += note('根數與位置為示意', T.on(2) * (1 - T.on(6)), PH - 20);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  // left: the same margin turned out (rotation) and raised (levator); right: the three interactions as cards
  const k = T.p(0, 0.05, 0.45), h = T.p(0, 0.5, 0.95);
  const sv = VIEWS.sag({ mrd1: lerp(LRP.mrdPre, LRP.mrdPost, h), curl: 1 - k }, PW, PH, LID_SAG, 'sL'), A = sv.A;
  let ex = lab('瞼緣方向：rotation', 'margin direction', 14, PH - 30, A.lash, { color: COL.accent, bold: true, op: T.on(0, 0.4) });
  ex += lab('眼瞼高度：levator', 'lid height', 14, 52, sv.P(sv.r.DP.at(0, 0)), { color: COL.accent, bold: true, op: T.on(0, 2.0) });
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, A.cornea, { side: 'R' });
  ex += note('角度與高度為示意', 1, 26);
  const o1 = T.on(1, 0.5), o2 = T.on(2, 0.5), o4 = T.on(4, 0.5), o5 = T.on(5, 0.5);
  let rx = infoCard(12, 10, 582, [['同一個 lid crease 切口（Cruz 2015a、2015b）', { bold: true, color: COL.accent, size: 16 }], ['可一起處理 ptosis、眼瞼退縮、皮膚鬆弛', { size: 15 }]], o1, { h: 74 });
  rx += infoCard(12, 94, 582, [['Ptosis 手術後的 entropion（Cruz 2023）', { bold: true, color: COL.accent, size: 16 }], [`${IX.buckleN} 位：瞼板摺在上三分之一 ${IX.upperThird}%`, { size: 15 }], [`margin rotation 矯正：${IX.anteriorN}／${IX.buckleN} 從 lid crease 前路`, { size: 15, }]], o2, { h: 98 });
  const b1 = ss(T.st(4) + 0.4, T.st(4) + 1.4, T.u), b2 = ss(T.st(4) + 1.6, T.st(4) + 2.6, T.u), b3 = ss(T.st(4) + 2.8, T.st(4) + 3.8, T.u);
  rx += `<g opacity="${o4}"><rect x="12" y="202" width="582" height="128" rx="8" fill="#fff" stroke="#d3dae1"/>${text(26, 228, '閉不緊的比例（Tucker 2000，aponeurotic ptosis 修復）', { size: 15, bold: true, color: COL.accent })}` +
    barRow(26, 242, '術後第 1 天', IX.lago[0], b1, '#b3122b', 1) + barRow(26, 270, '術後 1 週', IX.lago[1], b2, COL.amber, 1) + barRow(26, 298, '術後 6–20 週', IX.lago[2], b3, COL.accent, 1) + `</g>`;
  rx += infoCard(12, 340, 582, [['高度、contour、瞼緣方向、閉眼：一起看', { bold: true, size: 16, color: COL.ink }]], o5, { h: 48, stroke: COL.accent });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: rx, P: { title: '彼此的影響', orient: '各研究的病人與術式不同' } } };
};

// ---------------------------------------------------------------- 2 Marginal rotation（lid crease 前路）
DRAW2['2-1'] = T => {
  const ci = T.p(1, 0.15, 0.9), cr = T.p(2, 0.0, 0.3), fl = T.p(2, 0.3, 0.9);
  const sv = VIEWS.sag({ ...ROT0, crease: cr, flap: fl }, PW, PH, ROT_SAG, 'sL'), A = sv.A;
  const cv = ROT.view({ ...PRE, evert: -MRP.entr }, ci, fl, PW, PH, ROT_COR, 'cR'), B = cv.A, f = cv.f;
  let ex = lab('睫毛線', 'lash line', 14, PH - 30, A.lashSkin, { op: 1 - T.on(2) });
  ex += lab('預定的 levator 切口（同一條）', 'lid-crease incision', 14, 52, A.incLo, { color: COL.red, bold: true, op: T.on(0, 0.6) * (1 - T.on(2)) });
  if (A.creaseCut) ex += lab('切開皮膚＋眼輪匝肌', 'skin + orbicularis', 14, 52, A.creaseCut, { color: COL.red, bold: true, op: ss(0.2, 0.8, cr) * (1 - T.on(3)) });
  ex += lab('皮膚肌肉瓣往下掀', 'skin–muscle flap', 14, PH - 30, A.flap, { color: COL.accent, bold: true, op: ss(0.3, 0.8, fl) });
  if (A.exposedTarsus) ex += lab('露出瞼板到睫毛根', 'tarsus exposed', PW - 12, 52, A.exposedTarsus, { side: 'R', bold: true, op: ss(0.4, 0.9, fl) * (1 - T.on(3)) });
  ex += lab('睫毛根附近的眼輪匝肌：縫線要縫的地方', 'marginal orbicularis', PW - 12, 52, sv.P(sv.r.DA.at(0.9, LID.U_TAR + 0.5)), { side: 'R', color: COL.suture, bold: true, size: 14, op: T.on(3, 0.6) });
  ex += note('內翻程度與切口高度：示意／依院內常規', 1, 26);
  let rx = '';
  { const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], om = T.on(1, 0.8) * (1 - T.on(2, 0.6));
    X.forEach(x => { const a = cv.P([x, f.lash(x)]), b = cv.P([x, f.inc(x)]); rx += `<g opacity="${om}">${VIEWS.dim(a, b, COL.purple)}${dot(b, COL.purple, 4.5)}</g>`; });
    rx += lab(`外側 ${H[0]} mm`, 'lateral', 14, 52, cv.P([X[0], f.inc(X[0])]), { color: COL.purple, bold: true, op: om });
    rx += lab(`中央 ${H[1]} mm`, 'central', PW / 2 - 60, 52, cv.P([X[1], f.inc(X[1])]), { color: COL.purple, bold: true, op: om });
    rx += lab(`內側 ${H[2]} mm`, 'medial', PW - 12, 52, cv.P([X[2], f.inc(X[2])]), { side: 'R', color: COL.purple, bold: true, op: om }); }
  rx += lab('窗內：瞼板', 'tarsus', PW - 12, 52, cv.P([3, (f.inc(3) + f.lash(3)) / 2]), { side: 'R', bold: true, op: ss(0.4, 0.9, fl) });
  rx += lab('往下翻的皮膚肌肉瓣', 'flap', 14, PH - 30, cv.flapEdge, { color: COL.accent, bold: true, op: ss(0.4, 0.9, fl) });
  rx += note('內外兩點的位置為示意', T.on(1, 0.8) * (1 - T.on(2, 0.6)), PH - 14);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['2-2'] = T => {
  const ct = T.p(0, 0.45, 0.95);
  const sv = VIEWS.sag({ ...ROT0, crease: 1, flap: 1, cut: ct }, PW, PH, ROT_SAG, 'sL'), A = sv.A;
  const cv = ROT.view({ ...PRE, evert: -MRP.entr }, 1, 1, PW, PH, ROT_COR, 'cR', ct), B = cv.A;
  let ex = '';
  if (A.cut) ex += lab('瞼板全層切開（從結膜面）', 'tarsotomy', PW - 12, PH - 30, A.cut, { side: 'R', color: COL.red, bold: true, op: ss(0.2, 0.6, ct) });
  { const DP = sv.r.DP, a = sv.P(DP.at(0, -0.25)), b = sv.P(DP.at(LID.S_CUT, -0.25)), o = T.on(1, 0.6) * (1 - T.on(3));
    ex += `<g opacity="${o}">${VIEWS.dim(a, b, COL.red)}</g>` + lab(`離瞼緣 ${MRP.cutMm} mm（Cruz 2015a）`, 'from the margin', PW - 12, 236, mixP(a, b, 0.5), { side: 'R', color: COL.red, bold: true, op: o }); }
  ex += lab('結膜', 'conjunctiva', PW - 12, 52, sv.P(sv.r.DP.at(5, -0.05)), { side: 'R', op: T.on(0, 0.6) * (1 - T.on(1)) });
  { const o4 = T.on(3, 0.6);
    if (A.creaseSkin) ex += lab(`皮膚切口：距睫毛線 ${LRP.incH[1]} mm`, 'skin incision', 14, 52, A.creaseSkin, { color: COL.red, bold: true, op: o4 });
    if (A.cut) ex += lab(`瞼板切口：距瞼緣 ${MRP.cutMm} mm`, 'tarsotomy', 14, PH - 30, A.cut, { color: COL.red, bold: true, op: o4 }); }
  ex += note('這台的切法與位置：依院內常規（示意）', T.on(2), 26);
  let rx = '';
  if (B.tarsotomy) rx += lab('瞼板切口（從結膜面切，畫虛線）', 'tarsotomy', PW - 12, PH - 30, B.tarsotomy, { side: 'R', color: COL.red, bold: true, op: ss(0.2, 0.6, ct) });
  rx += lab('窗內：瞼板', 'tarsus', PW - 12, 52, cv.P([3, (cv.f.inc(3) + cv.f.lash(3)) / 2]), { side: 'R', bold: true });
  rx += tag('Cruz：翻在棉棒上，從結膜面切', T.on(0, 0.6) * (1 - T.on(2)), COL.accent, PH - 52);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['2-3'] = T => {
  const su = T.p(0, 0.3, 0.95), tie = T.p(2, 0.05, 0.75), back = tie;   // the flap is laid back as the sutures are tied (both views)
  const sv = VIEWS.sag({ ...ROT0, crease: 1, flap: 1 - back, cut: 1, suture: su, buried: true, curl: lerp(MRP.entr, MRP.after, tie) }, PW, PH, ROT_SAG, 'sL'), A = sv.A;
  const cv = ROT.view({ ...PRE, evert: lerp(-MRP.entr, 0, tie), buried: su }, 1 - back, 1 - back, PW, PH, ROT_COR, 'cR', 1), B = cv.A;
  let ex = '';
  if (A.suture) ex += lab('6-0 vicryl：遠端瞼板 → 眼輪匝肌（路徑示意）', 'buried suture', PW - 12, 52, A.suture, { side: 'R', color: COL.suture, bold: true, size: 14, op: ss(0.4, 0.9, su) * (1 - T.on(4)) });
  if (A.sutureExit) ex += lab('睫毛根附近的眼輪匝肌', 'marginal orbicularis', 14, PH - 30, A.sutureExit, { color: COL.suture, op: T.on(1, 0.4) * (1 - T.on(2)) });
  ex += lab('瞼緣往外轉、睫毛離開角膜', 'margin rotated out', 14, PH - 30, A.lash, { color: COL.accent, bold: true, op: ss(0.5, 1, tie) * (1 - T.on(4)) });
  ex += lab('皮膚肌肉瓣蓋回：縫線留在裡面', 'flap back, suture buried', 14, 120, A.flap, { color: COL.accent, bold: true, op: T.on(3, 0.4) * (1 - T.on(4)) });
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, A.cornea, { side: 'R', op: 1 - T.on(2) });
  ex += note('縫線路徑為示意', 1, 26);
  let rx = '';
  if (B.buried) rx += lab(`${MRP.sutN} 針：內、中、外（位置示意）`, 'sutures ×3', 14, 52, B.buried, { color: COL.suture, bold: true, op: ss(0.4, 0.9, su) * (1 - T.on(4)) });
  rx += lab('內外兩針放射狀（示意）', 'radial', PW - 12, 52, cv.P([7, (cv.f.inc(7) + cv.f.lash(7)) / 2]), { side: 'R', color: COL.suture, bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  rx += lab('瞼緣往外轉', 'margin rotated out', PW - 12, PH - 30, cv.P([5, cv.r.lashY(5) + cv.r.rollY(5)]), { side: 'R', color: COL.accent, bold: true, op: ss(0.5, 1, tie) * (1 - T.on(4)) });
  rx += tag('不用 bolster，不必拆線', T.on(3, 0.6) * (1 - T.on(4)), COL.accent, PH - 52);
  rx += tag('這台的針數、縫線、路徑：依院內常規', T.on(4), COL.accent, PH - 52);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 3 Levator resection 與眉毛固定（同第一部的狀態、視窗與畫法；瞼緣已轉正）
DRAW2['3-1'] = T => {
  const rem = T.p(1, 0.2, 0.9), so = T.p(2, 0.05, 0.4), fu = T.p(2, 0.45, 0.95);
  const dis = T.p(3, 0.0, 0.3), clamp = T.p(3, 0.3, 0.55) * (1 - T.p(4, 0.0, 0.25)), res = T.p(3, 0.6, 0.95), adv = T.p(4, 0.05, 0.4), ts = T.p(4, 0.3, 0.6), lift = T.p(4, 0.55, 0.95);
  const st = { ...PRE, ...INC, excCut: T.u < T.st(1) ? 0 : 1, excRemove: rem, septOpen: so, fatUp: so >= 1 ? fu : 0, dis, clamp, resect: res, advance: adv, tarSut: ts, mrd1: lerp(LRP.mrdPre, LRP.mrdPost, lift) };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  const o1 = T.on(1) * (1 - T.on(2)), o2 = T.on(2) * (1 - T.on(3)), o3 = T.on(3) * (1 - T.on(4)), o4 = T.on(4, 0.6, 0.6) * (1 - T.on(5)), o5 = T.on(5, 0.6);
  let ex = lab('上瞼緣（已轉正）', 'lid margin', 14, PH - 30, sv.P(sv.r.DP.at(0, 0)), { op: 1 - o5 });
  ex += lab('提上瞼肌', 'levator', PW - 12, 64, levAt(sv, 1), { side: 'R', bold: true, op: 1 - o1 });
  if (A.wound) ex += lab('切除：皮膚＋皮下＋眼輪匝肌', 'skin–muscle strip', 14, 200, A.wound, { color: COL.red, bold: true, size: 14, op: o1 * ss(0.5, 0.9, rem) });
  ex += lab(fu > 0.3 ? '腱膜前脂肪（往上撥開）' : '腱膜前脂肪', 'preaponeurotic fat', PW - 12, 150, A.fatUp || A.fat, { side: 'R', color: '#9c7a20', bold: true, op: o2 });
  ex += lab('腱膜', 'aponeurosis', PW - 12, 236, A.apo, { side: 'R', bold: true, op: o2 * ss(0.3, 0.8, fu) });
  if (A.clamp) ex += lab('Putterman clamp', '', 14, 106, A.clamp, { color: '#2f3a44', bold: true, op: o3 * ss(0.3, 1, clamp) });
  if (A.tarSut) ex += lab('固定到瞼板（4-0 vicryl）', 'tarsal suture', PW - 12, 290, A.tarSut, { side: 'R', color: COL.suture, bold: true, op: o4 * ss(0.6, 1, ts) });
  ex += lab('瞼緣：有沒有又往內翻？', 'margin direction', 14, PH - 30, sv.P(sv.r.DP.at(0, 0)), { color: COL.red, bold: true, op: o5 });
  ex += tag('詳見第一部第 4 章', T.on(0) * (1 - T.on(1)));
  ex += note('瞼緣畫成轉正後的位置（rotation 的縫線省略，示意）', 1, 26);
  let rx = '';
  { const a = cv.P([2.5, cv.r.excLoY(2.5)]), b = cv.P([2.5, cv.r.excHiY(2.5)]), om = o1 * ss(0.0, 0.4, rem);
    rx += `<g opacity="${om}">${VIEWS.dim(a, b, COL.red)}</g>` + lab(`切除寬 ${LRP.excW} mm`, 'skin strip', PW - 12, 126, [a[0], (a[1] + b[1]) / 2], { side: 'R', color: COL.red, bold: true, op: om });
    rx += lab('下緣＝rotation 用的切口', 'same incision', 14, PH - 30, cv.P([-6, cv.r.excLoY(-6)]), { color: COL.red, bold: true, op: om }); }
  if (B.wound) rx += lab('窗內：腱膜', 'aponeurosis', PW - 12, 64, B.wound, { side: 'R', bold: true, op: o2 * ss(0.3, 0.8, fu) });
  if (B.clamp) rx += lab('Putterman clamp（皮膚下的部分畫虛線）', '', 14, 64, B.clamp, { color: '#2f3a44', bold: true, op: o3 * ss(0.3, 1, clamp) });
  if (B.tarSutC) { rx += lab('三針（位置示意）', 'tarsal sutures ×3', 14, 64, B.tarSutC, { color: COL.suture, bold: true, op: o4 * ss(0.6, 1, ts) });
    for (const x of [-CORONAL.LIMB, CORONAL.LIMB]) rx += dot(cv.P([x, cv.r.fixY(x)]), COL.suture, 3.5, o4 * ss(0.6, 1, ts)); }
  const oc = Math.max(ss(0.4, 1, lift) * o4, o5);
  rx += contour(cv, oc) + lab('高度與 contour', 'height / contour', PW - 12, PH - 24, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: oc });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-2'] = T => {
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

// ---------------------------------------------------------------- 4 Electric epilation（上眼瞼）
DRAW2['4-1'] = T => {
  const Z = EPI.zoom({}, PW, PH, 'sL'), sv = Z.sv, F = Z.F, A = sv.A, cv = EPI.cor({}, PW, PH, 'cR'), B = cv.A;
  const o1 = T.on(1, 0.6, 0.6), o2 = T.on(2, 0.6, 0.6);
  const d18 = EPI.dim(sv, F, EP.follicleUp, '#7a4a2a');
  let ex = `<g opacity="${o1}">${d18.svg}</g>` + lab(`毛囊深 ${EP.follicleUp} mm（下眼瞼 ${EP.follicleLo} mm）`, 'follicle depth', 14, 290, d18.mid, { color: '#7a4a2a', bold: true, op: o1 });
  { const q = sv.P([F.E[0] + F.d[0] * EP.reach95Up, F.E[1] + F.d[1] * EP.reach95Up]), n = [F.d[1], -F.d[0]], a = [q[0] + n[0] * 14, q[1] + n[1] * 14], b = [q[0] - n[0] * 14, q[1] - n[1] * 14];
    ex += `<g opacity="${o2}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.suture}" stroke-width="3"/></g>`;
    ex += lab(`插 ${EP.reach95Up} mm：碰到 95% 的毛囊`, 'needle depth', PW - 12, 52, q, { side: 'R', color: COL.suture, bold: true, op: o2 }); }
  ex += lab('毛囊', 'follicle', 14, 52, sv.P(mixP(F.E, F.B, 0.7)), { bold: true, op: 1 - o1 });
  ex += lab('方向歪的睫毛', 'misdirected lash', 14, PH - 30, sv.P(mixP(F.E, sv.M.misLash, 0.2)), { color: COL.amber, bold: true, op: 1 - T.on(1) });
  ex += lab('瞼板', 'tarsus', PW - 12, PH - 30, A.tarsusZ || A.tarsus, { side: 'R', op: T.on(3, 0.6) });
  ex += lab('順著睫毛的方向', 'along the lash', 14, PH - 64, sv.P([F.E[0] - F.d[0] * 1.2, F.E[1] - F.d[1] * 1.2]), { color: COL.accent, bold: true, op: T.on(3, 0.6) });
  ex += `<g opacity="${T.on(3, 0.6)}">${curve([sv.P([F.E[0] - F.d[0] * 1.6, F.E[1] - F.d[1] * 1.6]), sv.P(F.B)], COL.accent, 2.4, 1, '6 5')}</g>`;
  ex += VIEWS.sbar(sv.k, 1, 1);
  let rx = '';
  if (B.misLash) rx += lab('要處理的睫毛（示意）', 'lashes to treat', 14, PH - 30, B.misLash, { color: COL.amber, bold: true });
  rx += lab('睫毛線', 'lash line', PW - 12, 52, cv.P([1.6, cv.r.lashY(1.6)]), { side: 'R' });
  rx += lab('角膜', 'cornea', PW - 12, PH - 30, cv.P([1.2, -1.0]), { side: 'R' });
  rx += tag('順著睫毛的方向斜著進去', T.on(3, 0.6, 1.4), COL.accent, 34);
  return { L: { svg: sv.svg, extra: ex, P: ZS_P }, R: { svg: cv.svg, extra: rx, P: CZ_P } };
};

DRAW2['4-2'] = T => {
  const nd = T.p(1, 0.1, 0.8), tr = T.p(2, 0.0, 0.45), pl = T.p(2, 0.55, 0.95);
  const Z = EPI.zoom({ misdirected: 1 - pl }, PW, PH, 'sL'), sv = Z.sv, F = Z.F, A = sv.A, cv = EPI.cor({ misdirected: 1 - pl }, PW, PH, 'cR'), B = cv.A;
  const N = EPI.needle(sv, F, nd, T.on(1) * (1 - pl));
  let ex = N.svg + EPI.coag(sv, F, tr);
  if (sv.M.misLash) ex += lab('轉正後還碰到角膜的睫毛', 'still touching', 14, PH - 30, sv.P(mixP(F.E, sv.M.misLash, 0.2)), { color: COL.amber, bold: true, op: (1 - T.on(1)) * (1 - pl) });
  ex += lab('細針沿睫毛幹進到毛囊', 'electrolysis needle', 14, 52, N.out, { bold: true, op: T.on(1, 0.6) * (1 - pl) });
  ex += lab('毛囊根部：通電產熱', 'follicle destroyed', PW - 12, PH - 30, sv.P(F.B), { side: 'R', color: '#7a4a2a', bold: true, op: ss(0.3, 0.8, tr) });
  ex += lab('睫毛拔掉', 'lash removed', 14, PH - 30, sv.P(F.E), { color: COL.accent, bold: true, op: ss(0.4, 1, pl) * (1 - T.on(3)) });
  ex += note('凝固範圍為示意', ss(0.3, 0.8, tr), 26);
  ex += VIEWS.sbar(sv.k, 1, 1);
  const n1 = T.p(1, 0.05, 0.45), n2 = T.p(1, 0.5, 0.9), on1 = T.on(1) * (1 - T.p(1, 0.45, 0.5)) * (1 - pl), on2 = T.p(1, 0.48, 0.52) * (1 - pl);
  let rx = EPI.needleC(cv, MIS_X[0], n1, on1) + EPI.needleC(cv, MIS_X[1], n2, on2) + EPI.coagC(cv, MIS_X[0], tr) + EPI.coagC(cv, MIS_X[1], tr);
  if (B.misLash) rx += lab('方向歪的睫毛', 'misdirected lashes', 14, PH - 30, B.misLash, { color: COL.amber, bold: true, op: (1 - T.on(1)) * (1 - pl) });
  rx += lab('針從睫毛根部進', 'needle at the root', PW - 12, 52, cv.P([MIS_X[1], cv.r.lashY(MIS_X[1])]), { side: 'R', bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  rx += lab('處理過的毛囊（示意）', 'treated follicles', 14, 52, cv.P([MIS_X[0], cv.r.lashY(MIS_X[0]) - 0.35]), { color: '#7a4a2a', bold: true, op: ss(0.3, 0.8, tr) });
  rx += tag('機器、能量、時間、根數：依院內常規', T.on(3), COL.accent, PH - 20);
  return { L: { svg: sv.svg, extra: ex, P: ZS_P }, R: { svg: cv.svg, extra: rx, P: CZ_P } };
};

// ---------------------------------------------------------------- 4-3 evidence (full panel)
DRAW2['4-3'] = T => {
  let s = '';
  const cardH = (x, y, w, h, op, stroke) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="${stroke || '#d3dae1'}"/></g>`;
  const o1 = T.on(1, 0.5), b1 = ss(T.st(1) + 0.6, T.st(1) + 1.6, T.u);
  s += cardH(24, 18, 580, 150, o1) + text(42, 48, '組織學：RF 在 3 mm 深度電解（Singh 2022）', { size: 17, bold: true, color: COL.accent, op: o1 });
  s += `<g opacity="${o1}">${text(42, 86, '只破壞部分毛囊根部的眼瞼', { size: 15.5 })}<rect x="42" y="100" width="520" height="22" rx="4" fill="#e6eaee"/><rect x="42" y="100" width="${(520 * 0.55 * b1).toFixed(1)}" height="22" rx="4" fill="#b3122b"/>${text(562, 150, '55%', { size: 18, bold: true, anchor: 'end', op: b1 })}</g>`;
  const o2 = T.on(2, 0.5), b2 = ss(T.st(2) + 0.6, T.st(2) + 1.6, T.u), o3 = T.on(3, 0.5), b3 = ss(T.st(3) + 0.3, T.st(3) + 1.3, T.u);
  s += cardH(626, 18, 580, 260, o2) + text(644, 48, '超細針電解，24 個眼瞼（Sakarya 2010）', { size: 17, bold: true, color: COL.accent, op: o2 });
  s += `<g opacity="${o2}">${text(644, 86, '一次就成功', { size: 15.5 })}<rect x="644" y="100" width="520" height="22" rx="4" fill="#e6eaee"/><rect x="644" y="100" width="${(520 * 0.666 * b2).toFixed(1)}" height="22" rx="4" fill="${COL.accent}"/>${text(1164, 150, '66.6%', { size: 18, bold: true, anchor: 'end', op: b2 })}${text(644, 150, '其餘再做一到兩次', { size: 14, color: COL.sub })}</g>`;
  s += `<g opacity="${o3}">${text(644, 190, '輕微的瞼緣缺口', { size: 15.5 })}<rect x="830" y="176" width="${(300 * 0.166 * b3).toFixed(1)}" height="18" rx="3" fill="${COL.amber}"/>${text(1188, 190, '16.6%', { size: 16, bold: true, anchor: 'end', op: b3 })}
    ${text(644, 228, '色素變淡', { size: 15.5 })}<rect x="830" y="214" width="${(300 * 0.083 * b3).toFixed(1)}" height="18" rx="3" fill="${COL.amber}"/>${text(1188, 228, '8.3%', { size: 16, bold: true, anchor: 'end', op: b3 })}</g>`;
  const o4 = T.on(4, 0.5);
  s += infoCard(24, 190, 580, [['成功率比較（Kapantais 2022）', { bold: true, color: COL.accent, size: 17 }], ['處理上眼瞼 ＜ 只處理下眼瞼', { size: 15.5 }], ['住院醫師第一次 ＜ 主治醫師第一次', { size: 15.5 }]], o4, { h: 110 });
  const o5 = T.on(5, 0.5);
  s += infoCard(24, 320, 1182, [['術後追蹤；事先告訴病人：可能要再處理', { bold: true, size: 18, color: COL.ink }]], o5, { h: 56, stroke: COL.accent });
  s += htext(FW - 12, PH - 12, '研究族群與術式各不相同，數字不能直接比較', { size: 12.5, color: COL.sub, anchor: 'end', op: T.on(1) });
  return { F: { svg: s, P: { title: '電解的效果：不一定一次就好', orient: '各研究的病人與機器不同' } } };
};

// ---------------------------------------------------------------- 5 順序與術中狀況
DRAW2['5-1'] = T => {
  const steps = [['① Marginal rotation', '同一個 lid crease 切口；轉正瞼緣', 0], ['② Levator resection', '切除皮膚肌肉；Putterman clamp；固定瞼板', 0], ['③ Internal brow fixation', '眉下組織固定到骨膜；量 MRD1', 0], ['電解、睜眼閉眼', '還碰到角膜的睫毛；高度、contour、方向、閉眼', 3]];
  const k1 = T.p(0, 0.1, 0.4), k2 = T.p(0, 0.45, 0.7), k3 = T.p(0, 0.75, 0.95), k4 = T.p(3, 0.3, 0.9);
  let cur = -1; if (T.u >= T.st(0)) cur = k3 > 0.02 ? 2 : k2 > 0.02 ? 1 : 0; if (T.u >= T.st(1)) cur = 0; if (T.u >= T.st(2)) cur = -1; if (T.u >= T.st(3)) cur = 3;
  let svg = '';
  steps.forEach(([h, d, li], i) => { const y = 16 + i * 86, op = 0.35 + 0.65 * (i < 3 ? T.on(0, 0.4, i * 1.2) : T.on(3, 0.4)), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 74, { op: op * T.on(0, 0.5), hl }) + text(42, y + 32, h, { size: 18.5, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(42, y + 58, d, { size: 15, color: COL.sub, op }); });
  svg += text(303, 382, '為什麼這樣排、消毒與麻醉、電解的時機：依院內常規', { size: 14.5, bold: true, color: COL.amber, anchor: 'middle', op: T.on(2, 0.6) });
  const up = { mrd1: lerp(LRP.mrdPre, LRP.mrdPost, k2), browY: lerp(LRP.browRaise, 0, k3), evert: -(1 - k1), misdirected: 1 - k4 };
  const cv = VIEWS.cor(up, PW, PH, COR_FACE, 'cR'), B = cv.A;
  let rx = lab('瞼緣轉正', 'margin rotated out', 14, PH - 30, cv.P([-6, cv.r.lashY(-6) + cv.r.rollY(-6)]), { color: COL.accent, bold: true, op: cur === 0 ? 1 : 0 });
  rx += lab('眼瞼拉高', 'lid raised', PW - 12, PH - 30, cv.P([5, cv.r.Uy(5)]), { side: 'R', color: COL.accent, bold: true, op: cur === 1 ? 1 : 0 });
  rx += lab('眉毛固定', 'brow fixed', 14, 52, B.brow, { color: COL.accent, bold: true, op: cur === 2 ? 1 : 0 });
  if (B.misLash) rx += lab('還碰到角膜的睫毛', 'remaining lashes', 14, PH - 30, B.misLash, { color: COL.amber, bold: true, op: cur === 3 ? 1 - k4 : 0 });
  const o1 = T.on(1, 0.6) * (1 - T.on(2, 0.4));
  rx += infoCard(12, 10, 582, [['Cruz 2015a', { bold: true, color: COL.accent }], ['先轉瞼緣 → 坐起來看位置 → 需要時調 aponeurosis', { size: 14.5 }]], o1, { h: 72 });
  rx += contour(cv, cur === 3 ? T.on(4, 0.6) : 0);
  return { L: { svg, P: { title: '這台刀的順序', orient: '' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['5-2'] = T => {
  const items = [['轉完還有睫毛碰角膜', '電解那幾根', 1], ['levator 固定後又內翻', 'ptosis 手術後的 entropion：瞼板上段摺起來（處理依院內常規）', 2], ['contour 不平順', 'margin rotation 最常見的併發症之一；縫線分散，睜眼閉眼一起看', 3]];
  let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
  let svg = '';
  items.forEach(([h, d, li], i) => { const y = 24 + i * 112, op = 0.35 + 0.65 * T.on(li, 0.4), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 96, { op: op * T.on(0, 0.5), hl }) + text(46, y + 54, `${i + 1}`, { size: 26, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) +
      text(84, y + 38, h, { size: 18, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(84, y + 68, d, { size: 13.5, color: COL.sub, op }); });
  const zl = cur === 0 ? T.on(1, 0.8) : 0, win = VIEWS.zwin(COR_FACE, { x: -9.5, y: -9.5, w: 17 }, zl);
  const inT = cur === 1 ? T.on(2, 0.6) * 0.6 : 0;
  const cv = VIEWS.cor({ mrd1: LRP.mrdPost, misdirected: cur <= 0 ? 1 : 0, evert: -inT }, PW, PH, win, 'cR'), B = cv.A;
  let rx = '';
  if (B.misLash) rx += lab('還碰到角膜的睫毛', 'remaining lashes', 14, PH - 30, B.misLash, { color: COL.amber, bold: true, op: zl });
  const o2 = cur === 1 ? T.on(2, 0.6) : 0, o3 = cur === 2 ? T.on(3, 0.6) : 0;
  rx += lab('瞼緣又往內翻（示意）', 'in-turned again?', PW - 12, PH - 30, cv.P([-4, cv.r.lashY(-4) + cv.r.rollY(-4)]), { side: 'R', color: COL.red, bold: true, op: o2 });
  rx += mrdArrow(cv, o3) + contour(cv, o3) + lab('高度與 contour', 'height / contour', PW - 12, 52, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: o3 });
  return { L: { svg, P: { title: '三個狀況', orient: '' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 6 術後 (full panel)
DRAW2['6'] = T => {
  let s = '';
  const chips = [['高度與閉眼', 0], ['瞼緣方向', 0], ['殘留睫毛', 0], ['眉毛', 0]];
  let x = 24; chips.forEach(([c, li], i) => { const w = measure(c, 16, true) + 34, op = T.on(li, 0.5, i * 0.3);
    s += `<g opacity="${op}"><rect x="${x}" y="18" width="${w}" height="38" rx="19" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + w / 2, 43, c, { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; x += w + 14; });
  const oa = T.on(1, 0.5), bars = [['第 1 天', IX.lago[0], 0], ['1 週', IX.lago[1], 0.6], ['6–20 週', IX.lago[2], 1.2]];
  s += `<g opacity="${oa}"><rect x="24" y="80" width="580" height="250" rx="9" fill="#fff" stroke="#d3dae1"/>${text(42, 110, '閉不緊的眼瞼比例（Tucker 2000）', { size: 17, bold: true, color: COL.accent })}<path d="M60 300H580" stroke="#aab6c2" stroke-width="2"/></g>`;
  bars.forEach(([lb, v, d], i) => { const g = ss(T.st(1) + 0.3 + d, T.st(1) + 1.1 + d, T.u), bx = 100 + i * 170, h = 160 * v / 60 * g;
    s += `<g opacity="${oa}"><rect x="${bx}" y="${(300 - h).toFixed(1)}" width="90" height="${h.toFixed(1)}" rx="4" fill="${i === 2 ? COL.accent : i === 1 ? COL.amber : '#b3122b'}"/>${text(bx + 45, 322, lb, { size: 15, anchor: 'middle' })}${text(bx + 45, 292 - h, v + '%', { size: 17, bold: true, anchor: 'middle', op: g })}</g>`; });
  s += infoCard(626, 80, 580, [['瞼緣方向（Cruz 2015a）', { bold: true, color: COL.accent, size: 17 }], ['再內翻？', { size: 16 }], ['lid crease rotation 的系列平均只追蹤 3 個月', { size: 15.5 }]], T.on(2, 0.5), { h: 110 });
  s += infoCard(626, 206, 580, [['殘留或再長的睫毛（Rajak 2012、Sakarya 2010）', { bold: true, color: COL.accent, size: 17 }], ['電解後復發不少 → 需要時再處理', { size: 16 }]], T.on(3, 0.5), { h: 84 });
  s += infoCard(626, 306, 580, [['拆線時間、用藥：依院內常規', { bold: true, size: 16 }]], T.on(4, 0.5), { h: 48 });
  return { F: { svg: s, P: { title: '術後追蹤', orient: '各研究的病人與術式不同' } } };
};

// ---------------------------------------------------------------- 7 跟刀清單 (full panel)
DRAW2['7'] = T => {
  const items = ['術前：每根碰角膜的睫毛是哪一種機轉', '畫線 2.5／4／4 mm；掀皮膚肌肉瓣到睫毛根', '瞼板全層切開；縫線讓瞼緣外轉', '轉正後再做 levator：切除 5 mm、Putterman clamp',
    '4-0 vicryl ×3 固定瞼板；看高度、contour、方向', '剝到眉下、避開眶上神經；4-0 vicryl ×1；量 MRD1', '還碰到角膜的睫毛：沿睫毛幹電解', '睜眼、閉眼一起看；6-0 Prolene、7-0 ethilone'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '數值與縫線依院內常規' } } };
};
