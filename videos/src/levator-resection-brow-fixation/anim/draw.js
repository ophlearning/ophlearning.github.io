// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the eyelid model (videos/models/eyelid): the sagittal mechanism section (left) and the
// surgeon's coronal view (right); both come from the same state, so heights agree (checked in ../check.js and eyelid/check.js).
// Surgical parameters: params.js (LRP, INC).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width
const SAG_LID = { x: -24, y: -21, w: 30 }, SAG_BROW = { x: -28.5, y: -31, w: 44 }, SAG_FX = { x: -19.5, y: -15.5, w: 25 };
const COR_LID = { x: -17.5, y: -15, w: 33 }, COR_EYE = { x: -17.5, y: -11, w: 33 }, COR_BROW = { x: -23.5, y: -29, w: 47 }, COR_FACE = { x: -26, y: -27.5, w: 52 }, COR_LAT = { x: -22.5, y: -18.5, w: 33 };
const SAG_P = { title: '矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD　術者視角', orient: '面對病人：左＝temporal　右＝nasal' };
// surgical states (cumulative); INC = incision heights and strip width (院內常規)
const PRE = { mrd1: LRP.mrdPre };
const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
const RES = { ...OPEN, dis: 1, resect: 1 };
const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
const BROWFIX = { ...ADV, browSut: 1, browTie: 1 };   // after the fixation (the dissection plane is no longer highlighted)
const LAC_WIN = { poly: [[-19.2, -16.0], [-10.8, -16.0], [-10.8, -11.4], [-19.2, -11.4]], depth: 3 };   // lateral window: lacrimal gland (示意)
const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };          // nasal window: supraorbital notch and nerve (示意)
const pts = (P, f, x0, x1, st = 0.25) => { const r = []; for (let x = x0; x <= x1 + 1e-9; x += st) r.push(P([x, f(x)])); return r; };
// a point on the levator muscle belly (the levator track nearest to x mm, slightly inside the muscle), for labels
const levAt = (sv, x) => { const LV = sv.r.LV, q = LV.near([x, -17.6]); return sv.P(LV.off(q, 0.5)); };
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>`;
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.4) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
// MRD1: arrow from the corneal light reflex (origin) to the upper lid margin, in a coronal view
const mrdArrow = (cv, op) => { const a = cv.P([0, 0]), b = cv.P([0, cv.r.Uy(0)]);
  return `<g opacity="${op}"><circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="3.2" fill="#fff"/>${VIEWS.dim(a, b, '#ffd34d', 1)}</g>`; };
const contour = (cv, op) => curve(pts(cv.P, cv.r.Uy, CORONAL.LC[0] + 0.5, CORONAL.MC[0] - 0.5), '#ffd34d', 3, op);
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VIEWS.cor({ ...PRE, browY: LRP.browRaise }, PW, PH, COR_FACE, 'tR'), B = cv.A;
  let ex = lab('眉毛靠 frontalis 撐高', 'brow raised', 14, 60, B.brow, { color: COL.amber, bold: true });
  ex += lab('上眼瞼下垂', 'ptosis', PW - 12, PH - 24, cv.P([3, cv.r.Uy(3)]), { side: 'R', color: COL.amber, bold: true });
  ex += note('術前高度為示意', 1, PH - 52);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1-1'] = T => {
  const sv = VIEWS.sag(PRE, PW, PH, SAG_LID, 'sL'), A = sv.A;
  const cv = VIEWS.cor(PRE, PW, PH, COR_EYE, 'cR'), B = cv.A;
  let ex = lab('提上瞼肌', 'levator', PW - 12, 64, levAt(sv, 1), { side: 'R', bold: true });
  ex += lab('腱膜', 'aponeurosis', PW - 12, 150, A.apo, { side: 'R', bold: true, op: T.on(2) });
  ex += lab('穆勒氏肌', "Müller", PW - 12, 196, A.muller, { side: 'R', op: T.on(2) });
  ex += lab('瞼板', 'tarsus', PW - 12, 262, A.tarsus, { side: 'R' });
  ex += lab('眶隔', 'orbital septum', 14, 150, A.septum);
  ex += lab('上瞼緣', 'lid margin', 14, PH - 40, sv.P(sv.r.DP.at(0, 0)), { bold: true });
  ex += tag('Levator function 決定能不能靠 levator 拉起眼瞼', T.on(2) * (1 - T.on(3)));
  ex += tag('後天 aponeurotic ptosis、LF 良好 → 前路 levator 手術', T.on(5) * (1 - T.on(6)));
  // right: MRD1, then levator function (schematic), the AAO comparison, the scenario, Hering's law
  const m = T.on(0, 0.8, 0.8);
  let rx = mrdArrow(cv, m) + lab('MRD1（術前高度為示意）', 'margin reflex distance', 14, 64, cv.P([0, cv.r.Uy(0) * 0.5]), { color: COL.accent, bold: true, op: m * (1 - T.on(1)) });
  rx += lab('角膜反光點', 'light reflex', PW - 12, 64, cv.P([0, 0]), { side: 'R', op: m * (1 - T.on(1)) });
  const lf = T.on(1) * (1 - T.on(3));
  { // levator function: lid margin in down gaze vs up gaze (schematic eyes)
    const eye = (cx, cy, g, lidY) => `<path d="M${cx - 44} ${cy}Q${cx} ${cy - 30} ${cx + 44} ${cy}Q${cx} ${cy + 26} ${cx - 44} ${cy}Z" fill="#f7f4ef" stroke="#9b6450" stroke-width="1.4"/>` +
      `<clipPath id="lfE${cx}"><path d="M${cx - 44} ${cy}Q${cx} ${cy - 30} ${cx + 44} ${cy}Q${cx} ${cy + 26} ${cx - 44} ${cy}Z"/></clipPath><g clip-path="url(#lfE${cx})"><circle cx="${cx}" cy="${cy + g}" r="13" fill="#4a2a17"/>` +
      `<rect x="${cx - 46}" y="${cy - 34}" width="92" height="${lidY - cy + 34}" fill="#efcfb6"/></g><path d="M${cx - 44} ${lidY}Q${cx} ${lidY - 3} ${cx + 44} ${lidY}" stroke="#7a4f45" stroke-width="1.8" fill="none"/>`;
    const y0 = 300, dn = y0 + 2, up = y0 - 13;
    rx += `<g opacity="${lf}"><rect x="12" y="270" width="420" height="128" rx="8" fill="#fff" stroke="#d3dae1"/>` + eye(80, y0 + 18, 9, dn) + eye(206, y0 + 18, -9, up) +
      text(80, 384, '往下看 down', { size: 13.5, anchor: 'middle' }) + text(206, 384, '往上看 up', { size: 13.5, anchor: 'middle' }) +
      `<path d="M128 ${dn}H262M250 ${up}H262" stroke="${COL.accent}" stroke-width="1.4" stroke-dasharray="4 3"/>` + VIEWS.dim([262, dn], [262, up], COL.accent) +
      text(276, y0 - 8, 'levator function', { size: 15, bold: true, color: COL.accent }) + text(276, y0 + 14, '＝上瞼緣移動的距離', { size: 14 }) + text(276, y0 + 36, '（示意圖）', { size: 13, color: COL.sub }) + `</g>`;
  }
  rx += infoCard(12, 270, 582, [['LF ≤ 4 mm 的重度先天性 ptosis（美國眼科醫學會整理）', { bold: true, color: COL.accent }],
    ['frontalis flap　≈　frontalis suspension　≈　maximal levator resection', {}], ['成功率、exposure 的比例互相重疊', { color: COL.sub }]], T.on(3) * (1 - T.on(5)), { h: 104 });
  rx += infoCard(12, 290, 582, [['本片情境：成人後天 aponeurotic ptosis', { bold: true }], ['levator function 良好 → 前路 levator 手術', { color: COL.accent, bold: true }]], T.on(5) * (1 - T.on(6)), { h: 80 });
  rx += infoCard(12, 270, 582, [["Hering's law：單側 ptosis 有 10–20% 出現", { bold: true, color: COL.accent }], ['術後另一眼往下掉（後天比先天常見）', {}],
    ['術前：lifting · covering · phenylephrine test', { color: COL.sub }]], T.on(6), { h: 104 });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  const k = T.p(1, 0.05, 0.95), st = { mrd1: lerp(LRP.mrdPre, LRP.mrdPost, k), browY: lerp(LRP.browRaise, 0, k) };
  const sv = VIEWS.sag(st, PW, PH, SAG_BROW, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_FACE, 'cR'), B = cv.A;
  const pre = LID.draw({ state: { ...PRE, browY: LRP.browRaise } }).A.browLo, ghost = T.on(1, 0.4) * (1 - T.on(5, 0.6));
  const preC = CORONAL.draw({ state: { ...PRE, browY: LRP.browRaise } }).browLoY;
  let ex = lab('額肌', 'frontalis', 14, 64, A.frontalis, { bold: true });
  ex += lab('眉毛', 'eyebrow', 14, 150, A.brow, { bold: true });
  ex += lab('上瞼緣', 'lid margin', 14, PH - 40, sv.P(sv.r.DP.at(0, 0)));
  { const f = sv.M.frontalis, o = T.on(0) * (1 - T.on(1));   // frontalis contracts and lifts the brow (compensation)
    ex += `<g opacity="${o}">${arrow(sv.P([f[0] + 0.3, f[1] + 2.4]), sv.P([f[0] + 0.3, f[1] - 1.6]), COL.amber, 1, 'arrM', 3)}${arrow(sv.P([f[0] + 1.6, f[1] + 5.6]), sv.P([f[0] + 1.6, f[1] + 2.2]), COL.amber, 1, 'arrM', 3)}</g>`;
    ex += lab('frontalis 收縮，撐高眉毛', 'compensation', PW - 12, 106, sv.P([f[0] + 1.6, f[1] + 3.6]), { side: 'R', color: COL.amber, bold: true, op: o }); }
  const gp = sv.P(pre), cp = A.browLo;
  ex += `<g opacity="${ghost}"><path d="M${(gp[0] - 46).toFixed(1)} ${gp[1].toFixed(1)}H${(gp[0] + 30).toFixed(1)}" stroke="${COL.sub}" stroke-width="1.6" stroke-dasharray="5 4"/>${arrow([gp[0] - 34, gp[1] + 2], [gp[0] - 34, Math.max(gp[1] + 4, cp[1] - 2)], COL.red, 1, 'arrR', 2.6)}</g>`;
  ex += lab('眉毛下降 平均 2.5–2.9 mm', 'brow descent', PW - 12, 150, [gp[0] - 34, (gp[1] + cp[1]) / 2], { side: 'R', color: COL.red, bold: true, op: T.on(2) * (1 - T.on(4)) });
  ex += tag('只動 Müller 的術式：平均 0.24–0.51 mm', T.on(4) * (1 - T.on(5)), COL.sub);
  ex += tag('加做 internal brow fixation：防止下降', T.on(5));
  let rx = lab('眉毛', 'eyebrow', 14, 64, B.brow, { bold: true });
  rx += lab(k < 0.5 ? '上眼瞼下垂（示意）' : '矯正後', k < 0.5 ? 'ptosis' : 'after repair', PW - 12, PH - 24, cv.P([3, cv.r.Uy(3)]), { side: 'R', color: k < 0.5 ? COL.amber : COL.accent, bold: true });
  rx += `<g opacity="${ghost}">${curve(pts(cv.P, preC, -18, 14), COL.sub, 1.6, 1, '5 4')}</g>`;
  rx += lab('矯正前的眉毛下緣', 'before', PW - 12, 64, cv.P([12, preC(12)]), { side: 'R', color: COL.sub, op: ghost });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-3'] = T => {
  const p = T.p(0, 0.15, 0.9), st = { mrd1: LRP.mrdPost, prolapse: p };
  const sv = VIEWS.sag(st, PW, PH, SAG_FX, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_EYE, 'cR'), B = cv.A;
  let ex = lab('上穹窿', 'superior fornix', PW - 12, 64, A.fornix, { side: 'R', bold: true });
  ex += lab('瞼板', 'tarsus', 14, 120, A.tarsus);
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, A.cornea, { side: 'R' });
  if (A.prolapse) ex += lab('脫出的結膜', 'prolapsed conjunctiva', 14, PH - 30, A.prolapse, { color: '#b3122b', bold: true, op: ss(0.3, 0.6, p) });
  ex += note('脫出的長度與厚度為示意', T.on(0), 26);
  let rx = '';
  if (B.prolapse) rx += lab('脫出的結膜（示意）', 'conjunctival prolapse', PW - 12, 64, B.prolapse, { side: 'R', color: '#b3122b', bold: true, op: ss(0.3, 0.6, p) });
  const b1 = ss(T.st(2) + 0.6, T.st(2) + 1.8, T.u), b2 = ss(T.st(4) + 0.3, T.st(4) + 1.5, T.u), o2 = T.on(2), o4 = T.on(4);
  rx += `<g opacity="${o2}"><rect x="12" y="270" width="582" height="128" rx="8" fill="#fff" stroke="#d3dae1"/>${text(26, 296, '系統性回顧：24 篇、88 位病人', { size: 15, bold: true, color: COL.accent })}
    ${text(26, 326, '原因是 blepharoptosis 手術', { size: 14.5 })}<rect x="250" y="313" width="${260 * 0.366 * b1}" height="16" rx="3" fill="#b3122b"/>${text(580, 326, '36.6%', { size: 15, bold: true, anchor: 'end', op: b1 })}
    <g opacity="${o4}">${text(26, 356, '手術處理：緩解', { size: 14.5 })}<rect x="250" y="343" width="${260 * 0.548 * b2}" height="16" rx="3" fill="${COL.accent}"/>${text(580, 356, '54.8%', { size: 15, bold: true, anchor: 'end', op: b2 })}
    ${text(26, 386, '保守治療：緩解', { size: 14.5 })}<rect x="250" y="373" width="${260 * 0.452 * b2}" height="16" rx="3" fill="#9aa7b4"/>${text(580, 386, '45.2%', { size: 15, bold: true, anchor: 'end', op: b2 })}</g></g>`;
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 2 證據 (full panel)
DRAW2['2'] = T => {
  let s = '';
  const x0 = 470, k = 92, rows = [
    ['只做 blepharoplasty', '全部位置平均', -1.7, null, 'Baker 2016', 3, COL.red],
    ['＋internal browpexy', '外側（兩眼）', 1.3, 0.9, 'Baker 2016', 4, COL.accent],
    ['＋internal browpexy', '外側，4–5 個月', 2.29, null, 'Mokhtarzadeh 2017', 5, COL.accent],
    ['＋internal browpexy', '外側', 2.54, null, 'Nemet 2019', 5, COL.accent],
    ['＋internal browpexy', '外側，24 個月', 3.19, null, 'Kaderli 2020', 5, COL.accent]];
  const oc = T.on(3, 0.5);
  s += `<g opacity="${oc}">${text(24, 34, '眉毛高度的變化（mm；＋＝上提，−＝下降）', { size: 17, bold: true })}<path d="M${x0} 52V${60 + rows.length * 54}" stroke="#7d8a97" stroke-width="1.6"/>${text(x0, 46, '0', { size: 13, color: COL.sub, anchor: 'middle' })}</g>`;
  rows.forEach(([a, b, v, v2, src, li, col], i) => {
    const y = 70 + i * 54, op = T.on(li, 0.5, (i >= 2 ? (i - 2) * 0.35 : 0)), g = ss(T.st(li) + 0.2 + (i >= 2 ? (i - 2) * 0.35 : 0), T.st(li) + 1.2 + (i >= 2 ? (i - 2) * 0.35 : 0), T.u);
    const w = Math.abs(v) * k * g, bx = v < 0 ? x0 - w : x0;
    s += `<g opacity="${op}">${text(24, y + 16, a, { size: 15.5, bold: true })}${text(24, y + 36, b, { size: 13.5, color: COL.sub })}
      <rect x="${bx.toFixed(1)}" y="${y + 6}" width="${w.toFixed(1)}" height="24" rx="4" fill="${col}"/>${v2 != null ? `<rect x="${x0}" y="${y + 6}" width="${(v2 * k * g).toFixed(1)}" height="24" rx="4" fill="#0a5c50"/>` : ''}
      ${text(v < 0 ? bx - 8 : x0 + w + 8, y + 24, (v > 0 ? '+' : '−') + (v2 != null ? v2 + ' / +' : '') + Math.abs(v) + ' mm', { size: 15, bold: true, anchor: v < 0 ? 'end' : 'start', color: col, op: g })}
      ${text(v < 0 ? x0 + 12 : x0 - 12, y + 24, src, { size: 12.5, color: COL.sub, anchor: v < 0 ? 'start' : 'end' })}</g>`;
  });
  // right column: what the procedure is, where it lifts, who may not suit it
  const c0 = T.on(0) * (1 - T.on(3)), c6 = T.on(6), c7 = T.on(7);
  s += infoCard(24, 70, 760, [['McCord 1990：internal browpexy', { bold: true, color: COL.accent, size: 17 }], ['從 eyelid crease 切口往上 → 找到眉下脂肪 → 用內部縫線把眉毛固定上去', { size: 16 }],
    ['效果：主要是防止下降，上提有限', { size: 16, bold: true }]], c0 * (T.on(0, 0.5)), { h: 110 });
  const bx = 880, by = 60;
  s += `<g opacity="${c6}"><rect x="${bx}" y="${by}" width="330" height="170" rx="8" fill="#fff" stroke="#d3dae1"/>${text(bx + 14, by + 26, '抬高的位置（Huang 2023）', { size: 15, bold: true, color: COL.accent })}`;
  const brow = (y, lift) => { const q = []; for (let i = 0; i <= 20; i++) { const t = i / 20, x = bx + 40 + t * 230, yy = y - 18 * Math.sin(Math.PI * Math.min(1, t * 1.25)) + 6 * t - lift(t); q.push([x, yy]); } return q; };
  s += curve(brow(by + 92, () => 0), '#b9a99b', 7, 1) + curve(brow(by + 92, t => 9 * ss(0.45, 1, t)), '#3a2b20', 7, 1) + text(bx + 40, by + 112, 'internal：主要抬外側', { size: 13.5 });
  s += curve(brow(by + 150, () => 0), '#b9a99b', 7, 1) + curve(brow(by + 150, () => 7), '#3a2b20', 7, 1) + text(bx + 40, by + 166, 'external：整條眉毛', { size: 13.5 });
  s += text(bx + 316, by + 44, '外側 →', { size: 12, color: COL.sub, anchor: 'end' }) + `</g>`;
  s += infoCard(bx, 250, 330, [['可能不適合（Nemet 2019）', { bold: true, color: COL.amber }], ['眉毛很重', {}], ['內側比外側垂', {}], ['顏面神經麻痺後', {}]], c7, { h: 130, stroke: COL.amber });
  s += htext(FW - 12, PH - 12, '外側眉毛：注意 Baker 2016 量的是兩眼各自的外側（+1.3、+0.9 mm）', { size: 12.5, color: COL.sub, anchor: 'end', op: T.on(4) });
  return { F: { svg: s, P: { title: 'Internal browpexy 合併眼瞼手術：眉毛高度', orient: '各研究追蹤時間不同' } } };
};

// ---------------------------------------------------------------- 3 術前準備
DRAW2['3-1'] = T => {
  const st = { ...PRE, ...INC, excMark: T.on(1, 0.8) };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  const o1 = T.on(1, 0.6, 0.4), o2 = T.on(2, 0.6, 0.3);
  let ex = `<g>${dot(A.lashSkin, COL.ink, 4)}${dot(A.incLo, COL.purple, 5, o1)}${dot(A.incHi, COL.purple, 5, o2)}</g>`;
  ex += lab('睫毛線', 'lash line', 14, PH - 40, A.lashSkin, { bold: true });
  ex += lab('下切口線：距睫毛線 4 mm（中央，沿皮膚量）', 'lower line', 14, 236, A.incLo, { color: COL.purple, bold: true, size: 14, op: o1 });
  ex += lab('上切口線：再往上 5 mm', 'upper line', 14, 150, A.incHi, { color: COL.purple, bold: true, size: 14, op: o2 });
  ex += tag('病人坐著畫線', T.on(0) * (1 - T.on(1)));
  const lash = x => cv.r.lashY(x), X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]];
  let rx = '';
  X.forEach((x, i) => { const a = cv.P([x, lash(x)]), b = cv.P([x, cv.r.excLoY(x)]); rx += `<g opacity="${o1}">${VIEWS.dim(a, b, COL.purple)}${dot(b, COL.purple, 4.5)}</g>`; });
  rx += lab(`外側 ${H[0]} mm`, 'lateral', 14, 64, cv.P([X[0], cv.r.excLoY(X[0])]), { color: COL.purple, bold: true, op: o1 });
  rx += lab(`中央 ${H[1]} mm`, 'central', PW / 2 - 60, 64, cv.P([X[1], cv.r.excLoY(X[1])]), { color: COL.purple, bold: true, op: o1 });
  rx += lab(`內側 ${H[2]} mm`, 'medial', PW - 12, 64, cv.P([X[2], cv.r.excLoY(X[2])]), { side: 'R', color: COL.purple, bold: true, op: o1 });
  { const a = cv.P([2.5, cv.r.excLoY(2.5)]), b = cv.P([2.5, cv.r.excHiY(2.5)]); rx += `<g opacity="${o2}">${VIEWS.dim(a, b, COL.red)}</g>`;
    rx += lab(`切除寬 ${LRP.excW} mm（中央）`, 'skin strip', PW - 12, 126, [a[0], (a[1] + b[1]) / 2], { side: 'R', color: COL.red, bold: true, op: o2 }); }
  rx += note('內外兩點的位置為示意', o1, PH - 52);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-2'] = T => {
  const inj = T.on(0, 0.8, 0.6);
  const st = { ...PRE, ...INC, excMark: 1, inject: inj };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  const tip = A.subq || A.incLo, nd = [Math.max(110, tip[0] - 120), tip[1] - 64];
  let ex = `<g opacity="${T.on(0) * (1 - T.on(1, 0.6, 0.8))}"><path d="M${nd[0]} ${nd[1]}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}" stroke="#7d8a97" stroke-width="3" stroke-linecap="round"/><rect x="${nd[0] - 66}" y="${nd[1] - 9}" width="68" height="18" rx="4" fill="#cfd8e0" stroke="#7d8a97" transform="rotate(${(Math.atan2(tip[1] - nd[1], tip[0] - nd[0]) * 180 / Math.PI).toFixed(1)} ${nd[0]} ${nd[1]})"/></g>`;
  ex += lab('皮下局部麻醉（依院內常規）', 'local anaesthesia', 14, 236, tip, { color: '#2a7fb8', bold: true, op: T.on(0) });
  ex += lab('上瞼緣', 'lid margin', 14, PH - 40, sv.P(sv.r.DP.at(0, 0)));
  ex += note('針的位置為示意', T.on(0));
  let rx = '';
  if (B.skinLid) rx += lab('上眼瞼皮下', 'subcutaneous', 14, 64, B.skinLid, { color: '#2a7fb8', bold: true, op: inj });
  rx += tag('病人醒著 → 術中可以睜眼看高度', T.on(1), COL.accent, PH - 20);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 4 手術步驟
DRAW2['4-1'] = T => {
  const cut = T.p(0, 0.1, 0.9), rem = T.on(1, 1.2, 0.8);
  const st = { ...PRE, ...INC, excMark: 1 - cut, excCut: cut, excRemove: rem };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  let ex = lab('上切口', 'upper incision', 14, 150, A.incHi, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(1)) });
  ex += lab('下切口', 'lower incision', 14, 236, A.incLo, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(1)) });
  if (A.wound) ex += lab('切除：皮膚＋皮下＋眼輪匝肌', 'skin–muscle strip', 14, 200, A.wound, { color: COL.red, bold: true, size: 14, op: T.on(1) });
  ex += lab('眼輪匝肌', 'orbicularis', 14, 106, A.orb);
  ex += lab('眶隔', 'orbital septum', PW - 12, 150, A.septum, { side: 'R', bold: true, op: T.on(2) });
  ex += tag('隨機試驗（泰國 20 人）：切不切 orbicularis，dry eye 指標沒有差異', T.on(3), COL.accent, PH - 18);
  let rx = lab('上下切口', 'incisions', 14, 64, B.excHi, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(1)) });
  if (B.wound) rx += lab('窗內露出眶隔', 'septum exposed', PW - 12, 64, B.wound, { side: 'R', bold: true, op: T.on(2) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-2'] = T => {
  const so = T.on(0, 0.8, 0.4), fu = T.p(1, 0.05, 0.7), anat = T.on(2, 0.8) * (1 - T.on(4, 0.8)), lac = T.on(4, 0.8);
  const st = { ...EXC, septOpen: so, fatUp: so >= 1 ? fu : 0 };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, VIEWS.zwin(COR_LID, COR_LAT, lac), 'cR', { windows: lac > 0.01 ? [LAC_WIN] : [] }), B = cv.A;
  // lines 2–3: the native Asian single-eyelid anatomy beside it (septum fuses below the superior tarsal border, fat hangs in front of the tarsus)
  let svg = sv.svg, ex = '';
  if (anat > 0.01) { const nv = VIEWS.sag({}, PW, PH, SAG_LID, 'nL'), N = nv.A, tt = nv.P(nv.r.DP.at(10, 0.6));
    svg = `<g opacity="${1 - anat}">${sv.svg}</g><g opacity="${anat}">${nv.svg}</g>`;
    ex += lab('融合處（瞼板上緣下方）', 'septum–aponeurosis fusion', PW - 12, 236, N.fusion, { side: 'R', color: COL.accent, bold: true, op: anat });
    ex += lab('瞼板上緣', 'superior tarsal border', PW - 12, 290, tt, { side: 'R', op: anat });
    ex += lab('腱膜前脂肪垂到瞼板前面', 'preaponeurotic fat', 14, 196, N.fat, { color: '#9c7a20', bold: true, op: anat * T.on(3) });
    ex += lab('眶隔', 'orbital septum', 14, 106, N.septum, { op: anat }); }
  const op = 1 - anat;
  ex += lab('眶隔切開處', 'septum opened', 14, 150, A.septCut, { color: COL.red, bold: true, op: op * T.on(0) * (1 - T.on(1)) });
  ex += lab(fu > 0.3 ? '腱膜前脂肪（往上撥開）' : '腱膜前脂肪', 'preaponeurotic fat', PW - 12, 106, A.fatUp || A.fat, { side: 'R', color: '#9c7a20', bold: true, op: op * T.on(0, 0.6, 0.8) });
  ex += lab('腱膜', 'aponeurosis', PW - 12, 236, A.apo, { side: 'R', bold: true, op: op * T.on(1, 0.6, 0.8) });
  let rx = lab('腱膜前脂肪', 'preaponeurotic fat', PW - 12, 64, B.fatUp || B.fat, { side: 'R', color: '#9c7a20', bold: true, op: T.on(0, 0.6, 0.8) * (1 - lac) });
  rx += lab('窗內：腱膜', 'aponeurosis', PW - 12, 106, B.wound, { side: 'R', bold: true, op: T.on(1, 0.6, 0.8) * (1 - lac) });
  rx += lab('淚腺（外側，開窗示意）', 'lacrimal gland', 14, 64, B.lacrimal, { color: '#a0523a', bold: true, op: lac });
  rx += tag('盛行率 10–60%：不要把 lacrimal gland 當成脂肪', T.on(5), COL.amber, PH - 18);
  const LP = anat > 0.5 ? { title: '對照：未手術的亞洲人單眼皮 sagittal', orient: '左＝前　上＝上' } : SAG_P;
  return { L: { svg, extra: ex, P: LP }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-3'] = T => {
  const dis = T.p(0, 0.1, 0.9), clamp = T.on(1, 0.8, 0.3), res = T.p(2, 0.2, 0.8);
  const st = { ...OPEN, dis, clamp, resect: res };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  const L = sv.M.lid, cutP = sv.P(sv.r.LVd.off(L.sClamp, 0.3));
  let ex = lab('提上瞼肌', 'levator', PW - 12, 64, levAt(sv, 1), { side: 'R', bold: true });
  if (A.disSpace) ex += lab('從瞼板分開、往上分離', 'disinserted', PW - 12, 290, A.disSpace, { side: 'R', color: COL.accent, bold: true, op: T.on(0, 0.6, 0.6) * (1 - T.on(1)) });
  if (A.clamp) ex += lab('Putterman clamp', '', 14, 106, A.clamp, { color: '#2f3a44', bold: true, op: clamp });
  ex += lab('切除線', 'resection line', 14, 196, cutP, { color: COL.red, bold: true, op: T.on(2, 0.6, 0.4) });
  ex += lab('結膜', 'conjunctiva', PW - 12, 340, A.conj, { side: 'R', op: 1 - T.on(1) });
  ex += note('切除量為示意（依院內常規）', T.on(3), PH - 14);
  let rx = '';
  if (B.clamp) rx += lab('Putterman clamp（皮膚下的部分畫虛線）', '', 14, 64, B.clamp, { color: '#2f3a44', bold: true, op: clamp });
  rx += lab('窗內：提上瞼肌', 'levator', PW - 12, 106, B.wound, { side: 'R', bold: true, op: T.on(0, 0.6, 0.6) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-4'] = T => {
  const adv = T.p(0, 0.05, 0.55), ts = T.p(0, 0.5, 1), lift = T.p(1, 0.0, 0.7);
  const st = { ...RES, clamp: 1 - T.on(0, 0.6), advance: adv, tarSut: ts, mrd1: lerp(LRP.mrdPre, LRP.mrdPost, lift) };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  let ex = lab('前徙的提上瞼肌', 'advanced levator', PW - 12, 106, sv.P(sv.r.LV.off(1.6, -0.05)), { side: 'R', bold: true, op: T.on(0, 0.6, 0.8) });
  if (A.tarSut) ex += lab('固定到瞼板前面（4-0 vicryl）', 'tarsal suture', PW - 12, 290, A.tarSut, { side: 'R', color: COL.suture, bold: true, op: ss(0.6, 1, ts) });
  ex += lab('瞼板', 'tarsus', 14, 290, A.tarsus);
  ex += tag('綁好：請病人睜眼，看高度和 contour', T.on(1) * (1 - T.on(2)));
  ex += tag('術後高度和術中高度相關（r = 0.55）', T.on(2));
  let rx = '';
  if (B.tarSutC) { rx += lab('三針（位置示意）', 'tarsal sutures ×3', 14, 64, B.tarSutC, { color: COL.suture, bold: true, op: ss(0.6, 1, ts) });
    for (const x of [-CORONAL.LIMB, CORONAL.LIMB]) rx += dot(cv.P([x, cv.r.fixY(x)]), COL.suture, 3.5, ss(0.6, 1, ts)); }
  if (B.advLev) rx += lab('前徙的提上瞼肌', 'advanced levator', PW - 12, 64, B.advLev, { side: 'R', bold: true, op: T.on(0, 0.6, 0.8) * (1 - T.on(1)) });
  rx += contour(cv, T.on(1, 0.6, 0.6)) + lab('contour：瞼緣弧度', 'contour', PW - 12, PH - 24, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: T.on(1, 0.6, 0.6) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-5'] = T => {
  const pl = T.p(0, 0.05, 0.5), su = T.p(0, 0.5, 1), tie = T.on(1, 1.2), nv = T.on(4, 0.8);
  const st = { ...ADV, browPlane: pl, browSut: su, browTie: tie };
  const sv = VIEWS.sag(st, PW, PH, SAG_BROW, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ ...st, notch: nv }, PW, PH, COR_FACE, 'cR', { windows: nv > 0.01 ? [NERVE_WIN] : [] }), B = cv.A;
  let ex = '';
  if (A.browPlane) ex += lab('剝離平面', 'dissection plane', PW - 12, 150, A.browPlane, { side: 'R', color: COL.accent, bold: true, op: ss(0.3, 0.8, pl) * (1 - T.on(2)) });
  if (A.browSutP) ex += lab('縫到骨膜（4-0 vicryl ×1）', 'brow fixation', PW - 12, 64, A.browSutP, { side: 'R', color: COL.suture, bold: true, op: ss(0.6, 1, su) });
  ex += lab('骨膜', 'periosteum', PW - 12, 106, A.periosteum, { side: 'R', op: T.on(0, 0.6, 1.2) });
  ex += lab('眉下脂肪', 'ROOF', 14, 150, A.roof, { color: COL.roof, bold: true, op: T.on(1) });
  ex += lab('眶上緣', 'superior orbital rim', PW - 12, 196, sv.P([-12.4, -18.3]), { side: 'R' });
  ex += lab('眉毛', 'eyebrow', 14, 64, A.brow, { bold: true });
  { // ROOF thickness 5 mm below the rim (Manta 2025), measured horizontally as in the paper
    const y = LID.RIM_Y + LRP.roofBelow, xm = sv.r.crossX(sv.r.probe.musB, y), xb = sv.r.crossX(sv.r.probe.pb, y), a = sv.P([xm, y]), b = sv.P([xb, y]), o = T.on(2, 0.6, 0.8) * (1 - T.on(4));
    ex += `<g opacity="${o}">${VIEWS.dim(a, b, COL.roof)}</g>` + lab('眶上緣下 5 mm：ROOF 約 1.8 mm', 'East Asian', 14, 290, [(a[0] + b[0]) / 2, a[1]], { color: COL.roof, bold: true, op: o }); }
  ex += tag('白人：13 人中 12 人在這裡量不到 ROOF', T.on(3) * (1 - T.on(4)), COL.sub, PH - 18);
  let rx = '';
  if (B.browPlane) rx += lab('剝離範圍', 'dissection pocket', 14, 64, B.browPlane, { color: COL.accent, bold: true, op: ss(0.3, 0.8, pl) * (1 - nv) });
  if (B.browFix) rx += lab('眉毛固定點（位置示意）', 'fixation point', 14, 150, B.browFix, { color: COL.suture, bold: true, op: ss(0.6, 1, su) });
  rx += lab('眶上切跡', 'supraorbital notch', PW - 12, 150, B.notch, { side: 'R', bold: true, op: nv });
  rx += lab('眶上神經（開窗示意）', 'supraorbital nerve', PW - 12, 64, cv.P([CORONAL.NOTCH_X - 1.3, -24]), { side: 'R', color: '#8a6d00', bold: true, op: nv });
  rx += tag('距中線約 22–24 mm（泰國屍體研究）', T.on(5) * (1 - T.on(6)), COL.ink, PH - 18);
  const m = T.on(6, 0.8);
  rx += mrdArrow(cv, m) + lab(`MRD1 約 ${LRP.mrdPost} mm`, 'check', PW - 12, PH - 50, cv.P([0, cv.r.Uy(0) * 0.5]), { side: 'R', color: '#b58a00', bold: true, op: m });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-6'] = T => {
  const p0 = T.p(0, 0.1, 0.8), fs = T.p(1, 0.1, 0.55), back = T.p(1, 0.6, 1), reset = T.on(2, 0.5), exc = T.p(2, 0.45, 1);
  const optA = T.u < T.st(2), p = optA ? p0 * (1 - back) : reset * (1 - exc);
  const st = { ...BROWFIX, prolapse: p, fornixSut: optA ? fs : 0 };
  const sv = VIEWS.sag(st, PW, PH, SAG_FX, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  let ex = lab('上穹窿', 'superior fornix', PW - 12, 64, A.fornix, { side: 'R', bold: true });
  if (A.prolapse) ex += lab('脫出的結膜', 'prolapsed conjunctiva', 14, PH - 30, A.prolapse, { color: '#b3122b', bold: true, op: ss(0.2, 0.5, p) });
  if (A.fornixSut) ex += lab('① 縫線固定回穹窿（路徑示意）', 'fornix suture', 14, 106, A.fornixSut, { color: COL.suture, bold: true, op: optA ? T.on(1) : 0 });
  if (!optA && A.prolapse) { const c = A.prolapse; ex += `<g opacity="${(1 - exc) * T.on(2)}"><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="30" fill="none" stroke="${COL.red}" stroke-width="2.4" stroke-dasharray="6 5"/></g>`; }
  ex += lab('② 直接切除（示意）', 'excision', 14, 196, A.prolapse || sv.P(sv.r.DP.at(0, 0)), { color: COL.red, bold: true, op: optA ? 0 : T.on(2) * (1 - T.on(4)) });
  ex += tag('用哪一種、什麼時候做：依院內常規', T.on(4));
  let rx = '';
  if (B.prolapse) rx += lab('脫出的結膜（示意）', 'conjunctival prolapse', PW - 12, PH - 24, B.prolapse, { side: 'R', color: '#b3122b', bold: true, op: ss(0.2, 0.5, p) });
  if (optA && fs > 0.5) { const xs = [-3.2, 1.8]; let s = ''; for (const x of xs) { const y = cv.r.excLoY(x) + 0.75, a = cv.P([x - 0.7, y]), b = cv.P([x + 0.7, y]); s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.suture}" stroke-width="2.6" stroke-linecap="round"/>${dot(a, COL.suture, 3)}${dot(b, COL.suture, 3)}`; }
    rx += `<g opacity="${ss(0.5, 0.8, fs)}">${s}</g>` + lab('縫線從下切口下方出皮膚（示意）', 'exit', 14, 64, cv.P([-3.2, cv.r.excLoY(-3.2) + 0.75]), { color: COL.suture, bold: true, op: ss(0.5, 0.8, fs) * (1 - T.on(2)) }); }
  rx += tag('不用縫線的直接切除：長期追蹤沒有復發', T.on(3) * (1 - T.on(4)), COL.accent, 34);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-7'] = T => {
  const cf = T.p(0, 0.1, 0.8), close = T.p(3, 0.05, 0.6);
  const st = { ...BROWFIX, creaseFix: cf };
  const sv = VIEWS.sag(st, PW, PH, SAG_LID, 'sL'), A = sv.A, cv = VIEWS.cor(st, PW, PH, COR_LID, 'cR'), B = cv.A;
  let ex = '';
  if (A.creaseFix) ex += lab('levator → orbicularis（6-0 Prolene）', 'crease fixation', 14, 150, A.creaseFix, { color: COL.suture, bold: true, size: 14, op: ss(0.5, 1, cf) });
  ex += tag('單眼皮：levator 往皮膚的止點靠近瞼緣', T.on(1) * (1 - T.on(2)), COL.sub);
  ex += tag('切開法：aponeurosis 固定到下方切口 → 雙眼皮線', T.on(2) * (1 - T.on(3)));
  { // skin closure (schematic: the pull of the closure on the tissues is not modelled): skin bridge over the wound + one stitch
    const lo = sv.M.incLo, hi = sv.M.incHi, d = [hi[0] - lo[0], hi[1] - lo[1]], L = Math.hypot(...d), n = [d[1] / L, -d[0] / L], nn = n[0] < 0 ? [-n[0], -n[1]] : n;
    const q = [lo, hi, [hi[0] + nn[0] * 0.5, hi[1] + nn[1] * 0.5], [lo[0] + nn[0] * 0.5, lo[1] + nn[1] * 0.5]].map(sv.P), m1 = sv.P([(lo[0] + hi[0]) / 2 - nn[0] * 0.25, (lo[1] + hi[1]) / 2 - nn[1] * 0.25]);
    ex += `<g opacity="${close}"><path d="M${q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}Z" fill="#eec7a8" stroke="#c58c6c" stroke-width="1.2"/><ellipse cx="${m1[0].toFixed(1)}" cy="${m1[1].toFixed(1)}" rx="7" ry="${(L * sv.k * 0.45).toFixed(1)}" fill="none" stroke="${COL.suture}" stroke-width="2" transform="rotate(${(Math.atan2(d[1], d[0]) * 180 / Math.PI - 90).toFixed(1)} ${m1[0].toFixed(1)} ${m1[1].toFixed(1)})"/></g>`;
    ex += lab('縫皮 7-0 ethilone（拉攏為示意）', 'skin closure', 14, 236, sv.P(lo), { color: COL.suture, bold: true, size: 14, op: close }); }
  let rx = '';
  if (B.creaseFix) rx += lab('4 針固定（雙眼皮線）', 'lid crease', 14, 64, B.creaseFix, { color: COL.suture, bold: true, op: ss(0.5, 1, cf) * (1 - close) });
  { const XS = []; for (let x = -12.4; x <= 9.8; x += 0.25) XS.push(x); const lo = XS.map(x => cv.P([x, cv.r.excLoY(x)])), hi = XS.map(x => cv.P([x, cv.r.excHiY(x)]));
    let s = `<path d="${pathOf([...lo, ...hi.reverse()])}Z" fill="#efcfb6" stroke="#c99476" stroke-width="1.2"/>`;
    for (let x = -10; x <= 8; x += 2) { const a = cv.P([x, cv.r.excLoY(x) + 0.5]), b = cv.P([x, cv.r.excLoY(x) - 0.6]); s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.suture}" stroke-width="1.8" stroke-linecap="round"/>`; }
    s += curve(lo, '#9b6450', 1.6, 1);
    rx += `<g opacity="${close}">${s}</g>` + lab('縫合線＝雙眼皮線', 'closure / crease', 14, 64, cv.P([-6, cv.r.excLoY(-6)]), { color: COL.suture, bold: true, op: close });
    rx += note('縫合後皮膚拉攏為示意（模型不表現組織位移）', close, PH - 14); }
  rx += tag('GM 藥膏（依院內常規）', T.on(3, 0.6, 1.5), COL.accent, PH - 40);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 5 術中狀況 (left: the three situations; right: coronal)
DRAW2['5'] = T => {
  const lac = T.on(2, 0.8) * (1 - T.on(4, 0.6)), pro = T.on(4, 0.8);
  const st = { ...ADV, prolapse: pro };
  const cv = VIEWS.cor(st, PW, PH, VIEWS.zwin(COR_LID, COR_LAT, lac), 'cR', { windows: lac > 0.01 ? [LAC_WIN] : [] }), B = cv.A;
  const items = [['高度或 contour 不對', '當下調整（怎麼調依院內常規）', 1], ['外側鼓起：lacrimal gland', '不要切掉 → dacryoadenopexy（復發 1.2%）', 2], ['結膜脫出', '縫回穹窿或切除（見 4-6）', 4]];
  let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
  let svg = '';
  items.forEach(([h, d, li], i) => { const y = 24 + i * 96, op = 0.35 + 0.65 * T.on(li, 0.4), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 80, { op: op * T.on(0, 0.5), hl }) + text(46, y + 48, `${i + 1}`, { size: 26, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) +
      text(84, y + 34, h, { size: 18, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(84, y + 62, d, { size: 15.5, color: COL.sub, op }); });
  let rx = contour(cv, T.on(1, 0.6) * (1 - T.on(2))) + lab('高度與 contour', 'height / contour', PW - 12, PH - 24, cv.P([6, cv.r.Uy(6)]), { side: 'R', color: '#b58a00', bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  rx += lab('淚腺（開窗示意）', 'lacrimal gland', 14, 64, B.lacrimal, { color: '#a0523a', bold: true, op: lac });
  if (B.prolapse) rx += lab('脫出的結膜（示意）', 'conjunctival prolapse', PW - 12, PH - 24, B.prolapse, { side: 'R', color: '#b3122b', bold: true, op: pro });
  return { L: { svg, P: { title: '三個狀況', orient: '' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 6 術後 (full panel)
DRAW2['6'] = T => {
  let s = '';
  const chips = [['高度與 contour', 0], ['閉眼：lagophthalmos', 0], ['角膜 exposure', 0], ['眉毛位置', 1], ['結膜有沒有再脫出', 1]];
  let x = 24; chips.forEach(([c, li], i) => { const w = measure(c, 16, true) + 34, op = T.on(li, 0.5, (i % 3) * 0.3);
    s += `<g opacity="${op}"><rect x="${x}" y="18" width="${w}" height="38" rx="19" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + w / 2, 43, c, { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; x += w + 14; });
  // time axis
  const ax0 = 60, ax1 = 1170, y = 120, X = d => ax0 + (ax1 - ax0) * d / 49;
  const oa = T.on(2, 0.5);
  s += `<g opacity="${oa}"><path d="M${ax0} ${y}H${ax1}" stroke="#aab6c2" stroke-width="3"/>${text(ax0, y - 14, '手術', { size: 15, bold: true, anchor: 'middle' })}<circle cx="${ax0}" cy="${y}" r="8" fill="${COL.ink}"/></g>`;
  const pts6 = [[7, '1 週', ['只有 40% 到最終高度', '52% 再升高，平均 1.1 mm'], 2, 56, 146], [14, '2 週', ['單側術後另一眼往下掉：', '先等約 2 週再評估'], 5, 300, 250], [42, '6 週', ['最高的高度', '幾乎都在 6 週內出現'], 3, 870, 146]];
  pts6.forEach(([d, h, ls, li, cx, cy]) => { const xx = X(d), op = T.on(li, 0.5);
    s += `<g opacity="${op}"><circle cx="${xx}" cy="${y}" r="10" fill="${COL.accent}"/>${text(xx, y - 18, h, { size: 18, bold: true, anchor: 'middle' })}<path d="M${xx} ${y + 12}V${cy}" stroke="${COL.accent}" stroke-width="1.4" stroke-dasharray="4 3"/></g>` + card(cx, cy, 300, 78, { op }) + tblock(cx + 14, cy + 30, ls, { size: 15.5, op, lh: 26 }); });
  s += infoCard(650, 250, 560, [['1 週時腫得不嚴重，以下情況可考慮早期修正（Tucker 1999）', { bold: true, color: COL.amber }], ['contour 異常', {}], ['高度比目標高 ≥ 0.5 mm，或低 > 1 mm', {}]], T.on(4), { h: 110, stroke: COL.amber });
  s += infoCard(24, 250, 256, [['拆線時間、用藥', { bold: true }], ['依院內常規', { color: COL.accent, bold: true }]], T.on(6), { h: 84 });
  return { F: { svg: s, P: { title: '術後追蹤', orient: '時間軸依週數等比例' } } };
};

// ---------------------------------------------------------------- 7 跟刀清單 (full panel)
DRAW2['7'] = T => {
  const items = ['術前：MRD1、levator function；單側做 Hering 測試', '坐著畫線：2.5／4／4 mm，切除寬 5 mm', '切皮與 orbicularis → 開眶隔 → 以脂肪找 aponeurosis', '外側分清楚 lacrimal gland 和脂肪',
    'Putterman clamp 切除；4-0 vicryl ×3 固定瞼板', '剝到眉下、避開眶上神經；4-0 vicryl ×1；量 MRD1', '結膜脫出？縫回穹窿或切除', '6-0 Prolene ×4 雙眼皮線；7-0 ethilone；GM 藥膏'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16.5, op }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '數值與縫線依院內常規' } } };
};
