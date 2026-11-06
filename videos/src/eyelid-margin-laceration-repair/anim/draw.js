// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Suturing segments show two synced views of the margin laceration model (videos/models/eyelid/laceration.js), from the same state (params.js):
// the mechanism view (margin face seen from below, or the wound face = sagittal section through the wound) and the coronal view.
// Margin face and coronal share x (same window x and width), so the same stitch sits at the same x in both panels (checked in ../check.js).
// Schematic drawing (no source) is labelled 示意 on screen and listed in ../overview-notes.md.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const note = (s, op, y = PH - 14, x = PW - 12, anchor = 'end') => htext(x, y, s, { size: 13, color: COL.sub, anchor, op });
const tag = (s, op, col = COL.accent, y = 30, x = PW / 2, size = 17) => htext(x, y, s, { size, bold: true, color: col, anchor: 'middle', op });
// panel titles state the orientation of each view
const MAR_P = { title: '瞼緣面：從下方看（上＝前、皮膚；下＝後、結膜）', orient: '左＝temporal' };
const WF_P = { title: '傷口面＝經傷口的矢狀切面（左＝前）', orient: '上＝上' };
const COR_P = { title: '正面（左＝temporal）', orient: '右眼 OD　檢查者面對病人' };
const SAG_P = { title: '矢狀切面（瞳孔中央，左＝前）', orient: '上＝上　右眼 OD' };
const LSAG_P = { title: '下眼瞼：經傷口的矢狀切面（左＝前）', orient: '上＝上' };
const LCOR_P = { title: '正面：下眼瞼內側（左＝temporal）', orient: '右眼 OD' };
window.PRELOAD_EXTRA = JSON.stringify([MAR_P, WF_P, COR_P, SAG_P, LSAG_P, LCOR_P]) + '×✓①②③×示意推論';
// model windows (mm): left, top, width. Margin face and coronal share x and width (MW, CW).
const MW = { x: -7, y: -7.0, w: 14 }, CW = { x: -7, y: -11.0, w: 14 }, WFW = { x: -16.8, y: -10.3, w: 10.2 };
const EYE = { x: -17.5, y: -12.5, w: 33 }, MED = { x: -1, y: -6, w: 19 }, SAGW = { x: -21, y: -16.5, w: 36 };
const pathOf = (q, close) => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (close ? 'Z' : '');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1, stroke = '#fff') => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="${stroke}" stroke-width="1.2" opacity="${op}"/>`;
const ring = (p, col, r = 10, op = 1) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="none" stroke="${col}" stroke-width="2.2" opacity="${op}"/>`;
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const mid = (a, b, k = 0.5) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const step = v => v > 0.5 ? 1 : 0;
// info card inside a panel: rows of [text, options]; o.hl = index of the highlighted row
function infoCard(x, y, w, rows, op, o = {}) {
  const lh = o.lh || 30, h = o.h || 24 + rows.length * lh;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="${o.stroke || '#d3dae1'}" stroke-width="${o.stroke ? 2 : 1}"/>`;
  rows.forEach(([t, ro = {}], i) => { const yy = y + 30 + i * lh, on = ro.op ?? 1;
    if (o.hl === i) s += `<rect x="${x + 6}" y="${yy - 21}" width="${w - 12}" height="${lh - 2}" rx="6" fill="rgba(14,124,107,0.10)"/>`;
    s += text(x + 16 + (ro.indent || 0), yy, t, { size: ro.size || 16, bold: ro.bold, color: ro.color || COL.ink, op: on }); });
  return s + `</g>`;
}
// a model sub-view placed inside a wider panel (chapter 5): svg of a view made for w × h px, translated and clipped
const sub = (v, x, y, w, h, id) => `<clipPath id="sc_${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath><g clip-path="url(#sc_${id})"><g transform="translate(${x} ${y})">${v.svg}</g></g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="#d3dae1"/>`;
const off = (p, x, y) => [p[0] + x, p[1] + y];

// ---------------------------------------------------------------- overlays drawn from the model geometry (mm → panel px through the view's P)
// margin face: a point on the margin at depth u (both sides follow the wound warp)
const mPt = (v, x, u) => v.P(v.r.M([x, -u]));
// margin face: the same landmark highlighted on both sides of the wound (x0 ± 0.004 … ± 6)
function mLine(v, u, col, op, w = 3.2) { const L = [], R = [];
  for (let x = -6.5; x <= -0.004; x += 0.1) L.push(mPt(v, x, u)); L.push(mPt(v, -0.004, u));
  R.push(mPt(v, 0.004, u)); for (let x = 0.1; x <= 6.5; x += 0.1) R.push(mPt(v, x, u));
  return curve(L, col, w, op) + curve(R, col, w, op); }
// coronal: the canaliculus behind a punctum (示意): 1 mm perpendicular to the margin, then medially along the lid to the medial canthus
function canal(v, which, op, col = COL.amber) {
  const [pu, pl] = LG.puncta(), mc = CORONAL.MC[0], W = v.r.lacW || (p => p), sg = which === 'upper' ? -1 : 1, p = which === 'upper' ? pu : pl;
  const f = x => (which === 'upper' ? CORONAL.Uy(Math.min(x, mc)) : CORONAL.Ly(Math.min(x, mc))) + sg * 1.0;
  const q = [p, [p[0], f(p[0])]]; for (let x = p[0] + 0.25; x <= mc + 0.6; x += 0.25) q.push([x, f(x)]);
  return curve(q.map(W).map(v.P), col, 2.4, op, '6 4'); }
function punctaSvg(v, op, which = ['upper', 'lower']) {
  const [pu, pl] = LG.puncta(), W = v.r.lacW || (p => p); let s = '';
  for (const [n, p] of [['upper', pu], ['lower', pl]]) if (which.includes(n)) s += `<circle cx="${v.P(W(p))[0].toFixed(1)}" cy="${v.P(W(p))[1].toFixed(1)}" r="5" fill="#fff" stroke="#3d434b" stroke-width="2.2" opacity="${op}"/>`;
  return s; }
// coronal: the area medial to a punctum (to probe), shaded
function medialZone(v, which, op) {
  const [pu, pl] = LG.puncta(), mc = CORONAL.MC[0], p = which === 'upper' ? pu : pl, q = [];
  const f = x => which === 'upper' ? CORONAL.Uy(x) : CORONAL.Ly(x), sg = which === 'upper' ? -1 : 1;
  for (let x = p[0]; x <= mc; x += 0.25) q.push([x, f(x)]); for (let x = mc; x >= p[0]; x -= 0.25) q.push([x, f(x) + sg * 3.2]);
  return `<path d="${pathOf(q.map(v.P), true)}" fill="${COL.amber}" opacity="${0.22 * op}" stroke="${COL.amber}" stroke-width="2" stroke-dasharray="5 4"/>`; }
// vertical mattress drawn from its four points (far pair, near pair; px): placed = far–far and near–near strands under the margin, tied = knot
function vmSvg(fp, np, col, placed, tied, op = 1) {
  if (!placed) return '';
  let s = [...fp, ...np].map(p => dot(p, col, 3.4, op)).join('');
  if (!tied) s += curve(fp, col, 1.8, 0.8 * op, '5 3') + curve(np, col, 1.8, 0.8 * op, '2 3') + curve([fp[1], np[1]], col, 1.8, op);
  else { const m = mid(np[0], np[1]); s += curve([fp[0], np[0]], col, 2.2, op) + curve([fp[1], np[1]], col, 2.2, op) + dot(m, col, 4.2, op); }
  return s; }
// sagittal: scleral shell in front of the globe (示意): a thin band 0.15–0.45 mm off the globe surface, dashed where the lids cover it
function shellSag(v, op) {
  const gp = LID.gp, a0 = Math.PI * 0.80, a1 = Math.PI * 1.22, q = (o, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const ph = a0 + (a1 - a0) * i / n, p = gp(ph), r = Math.hypot(p[0], p[1]); return [p[0] * (r + o) / r, p[1] * (r + o) / r]; });
  const band = [...q(0.15), ...q(0.45).reverse()].map(v.P);
  return `<g opacity="${op}"><path d="${pathOf(band, true)}" fill="#9cc7e6" opacity="0.55" stroke="#2f6f9f" stroke-width="1.6"/></g>`; }
// coronal: scleral shell seen through the palpebral fissure (示意)
function shellCor(v, op, id) {
  const lc = CORONAL.LC[0] + 0.3, mc = CORONAL.MC[0] - 0.3, f = [];
  for (let x = lc; x <= mc; x += 0.25) f.push([x, CORONAL.Uy(x)]); for (let x = mc; x >= lc; x -= 0.25) f.push([x, CORONAL.Ly(x)]);
  const c = v.P([0, 0.2]), r = 9.3 * v.k;
  return `<clipPath id="shc_${id}"><path d="${pathOf(f.map(v.P), true)}"/></clipPath><g clip-path="url(#shc_${id})" opacity="${op}"><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.92).toFixed(1)}" fill="#cfe6f6" opacity="0.55" stroke="#2f6f9f" stroke-width="2"/></g>`; }

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const v = VLAC.cor(ST.open, PW, PH, EYE, 'tR'), A = v.A;
  let ex = lab('全層、垂直的瞼緣裂傷', 'full-thickness margin laceration', PW - 12, 50, A.lacApex, { side: 'R', bold: true, color: COL.red, lc: COL.red });
  ex += lab('瞼緣分開', 'gap', 14, 330, A.lacEdgeT, { bold: true });
  ex += note('右眼上眼瞼中央；缺口寬度與傷口長度為示意', 1);
  return { R: { svg: v.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 先排除什麼
DRAW2['1-1'] = T => {
  const L = VIEWS.sag({}, PW, PH, SAGW, 'aL'), A = L.A, R = VLAC.cor(ST.open, PW, PH, EYE, 'aR'), B = R.A;
  // left: the eye behind the lid; zone III = the wound reaches more than 5 mm behind the limbus (Anant 2025)
  const z = T.on(3, 0.8), arc5 = LG.scleraArc(LG.phiL, LG.phiZ).map(L.P), arc3 = LG.scleraArc(LG.phiZ, LG.phiZ + 0.5).map(L.P);
  let sl = L.svg + `<g opacity="${z}">${curve(arc5, COL.amber, 5)}${curve(arc3, COL.red, 5)}${dot(L.P(LG.limbus), COL.ink, 5)}${dot(L.P(LG.zone3), COL.red, 5)}</g>`;
  let el = lab('眼瞼', 'eyelid', 14, 40, A.tarsus, { bold: true });
  el += lab('眼球：先查', 'globe first', PW - 12, 330, L.P([-3, -2]), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0) * (1 - T.on(3)) });
  el += lab('角膜緣', 'limbus', PW - 12, 330, L.P(LG.limbus), { side: 'R', op: z });
  el += lab('角膜緣後 5 mm', 'limbus + 5 mm', PW - 12, 92, L.P(LG.zone3), { side: 'R', color: COL.red, op: z });
  el += lab('Zone III：5 mm 以外', 'zone III', PW - 12, 40, arc3[Math.round(arc3.length * 0.7)], { side: 'R', bold: true, color: COL.red, lc: COL.red, op: z });
  el += lab('也要排除：眼眶軟組織、視神經、顱內', 'orbit, optic nerve, brain', 14, PH - 20, null, { op: T.on(5) * (1 - T.on(6)) });
  // right: where to look for signs of a ruptured globe; then what not to do
  const sg = T.on(6) * (1 - T.on(8, 0.4)), sg2 = T.on(7) * (1 - T.on(8, 0.4));
  let er = lab('先看眼球', 'check the globe first', PW - 12, 40, R.P([1.5, -1.2]), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0) * (1 - T.on(6)) });
  er += lab('瞳孔：變尖或不規則', 'peaked pupil', PW - 12, 40, R.P([0.9, 0.6]), { side: 'R', bold: true, op: sg });
  er += lab('前房深度異常', 'AC depth', 14, 40, R.P([-3.2, 2.2]), { op: sg });
  er += lab('結膜下出血：濃密或一整圈', 'SCH', 14, 330, R.P([-10.5, 1.4]), { op: sg2 });
  er += lab('眼球輪廓、眼內組織脫出', 'globe contour, prolapse', PW - 12, 380, R.P([7, 2.6]), { side: 'R', op: sg2 });
  const rows = [['懷疑破裂：停止進一步檢查', { bold: true, color: COL.red }], ['不量眼壓・不壓眼球・不硬撐眼瞼', { op: T.on(8, 0.6, 0.6) }],
    ['硬 shield 靠在眶骨上、不碰眼球', { op: T.on(9) }], ['不用壓迫性眼罩；緊急找眼科', { op: T.on(9, 0.6, 1) }]];
  let sr = R.svg + infoCard(70, 170, PW - 140, rows, T.on(8) * (1 - T.on(10, 0.4)), { lh: 44, stroke: COL.red });
  er += tag('破裂的眼球：先修眼球，再修眼瞼', T.on(10), COL.red, PH - 18);
  return { L: { svg: sl, extra: el, P: SAG_P }, R: { svg: sr, extra: er, P: COR_P } };
};
DRAW2['1-2'] = T => {
  const W2 = (FW - 90) / 2;
  const ask = [['要問的事（病史）', { bold: true, color: COL.accent }], ['① 年齡', { op: T.on(0) }], ['② 受傷的機轉：什麼東西造成的', { op: T.on(0, 0.6, 0.6) }],
    ['③ 受傷多久了', { op: T.on(0, 0.6, 1.2) }], ['④ 最後一次進食', { op: T.on(0, 0.6, 1.8) }], ['⑤ tetanus 接種狀況', { op: T.on(0, 0.6, 2.4) }],
    ['咬傷：抗生素、評估 rabies', { bold: true, op: T.on(1) }], ['異物？金屬還是有機物', { bold: true, op: T.on(2) }]];
  const ct = [['要排 CT 的情況', { bold: true, color: COL.accent }], ['懷疑異物、穿入傷、嚴重鈍傷 → 先照影像', { op: T.on(3) }],
    ['外傷第一個做 CT，不是 MRI', { bold: true, color: COL.red, op: T.on(4) }], ['brain、orbits、midface', { op: T.on(4, 0.6, 1) }],
    ['axial、coronal、parasagittal；1–2 mm 切片', { op: T.on(5) }], ['木頭、塑膠、某些玻璃：CT 可能看不到', { op: T.on(6) }],
    ['懷疑傷得更深：影像在縫眼瞼之前做', { bold: true, op: T.on(7) }]];
  const o = infoCard(30, 14, W2, ask, 1, { lh: 44 }) + infoCard(60 + W2, 14, W2, ct, T.on(3, 0.5), { lh: 44 });
  return { F: { svg: o, extra: '', P: { title: '病史與影像', orient: '' } } };
};

// ---------------------------------------------------------------- 2 能不能在治療室縫
DRAW2['2-1'] = T => {
  const W2 = (FW - 90) / 2, me = T.on(6, 0.6), hl = { bold: true, color: COL.accent };
  const ew = [['EyeWiki：complicated → 建議在 OR 由眼科醫師修補', { bold: true }], ['Full-thickness（本片）', { op: T.on(1), ...(me > 0.5 ? hl : {}) }], ['傷到瞼緣（本片）', { op: T.on(1, 0.6, 0.5), ...(me > 0.5 ? hl : {}) }],
    ['淚道、levator、orbital fat 脫出', { op: T.on(1, 0.6, 1.2) }], ['Medial canthal tendon 斷裂、大範圍組織缺損', { op: T.on(2) }]];
  const cl = [['急診指南（Clark 2015）：找 oculoplastic 的紅旗', { bold: true }], ['看得到 orbital fat', { op: T.on(5) }], ['傷到瞼緣（本片）', { op: T.on(5, 0.6, 0.6), ...(me > 0.5 ? hl : {}) }], ['傷到淚道', { op: T.on(5, 0.6, 1.2) }]];
  let o = infoCard(30, 10, W2, ew, T.on(1, 0.5), { lh: 34 }) + infoCard(60 + W2, 10, W2, cl, T.on(4, 0.5), { lh: 34 });
  // complication rates (Schafer 2026): bars on a 0–50 % scale
  const x0 = 330, sc = (FW - x0 - 120) / 50, y0 = 250, bar = (y, a, b, col, txt, op, lbl) => `<g opacity="${op}">${text(x0 - 14, y + 19, lbl, { size: 15.5, anchor: 'end', bold: true })}<rect x="${x0 + a * sc}" y="${y}" width="${(b - a) * sc}" height="26" rx="4" fill="${col}"/>${text(x0 + b * sc + 10, y + 19, txt, { size: 16, bold: true, color: col })}</g>`;
  o += `<g opacity="${T.on(7, 0.5)}">${text(30, y0 - 18, '美國 4 家教學醫院：住院醫師在急診床邊修補的併發症（Schafer 2026）', { size: 16, color: COL.sub })}<path d="M${x0} ${y0 - 4}V${y0 + 118}" stroke="${COL.line}" stroke-width="1.5"/></g>`;
  o += bar(y0, 0, 31, COL.amber, '31%', T.on(8), '急診床邊、有回診 81 位');
  o += bar(y0 + 40, 0, 41, COL.red, '41%', T.on(9), '第二年住院醫師單獨');
  o += bar(y0 + 80, 6, 24, COL.line, '6–24%', T.on(9, 0.6, 1.2), '以前的文獻');
  o += `<g opacity="${T.on(10)}">${text(FW / 2, PH - 16, '所以：第一次縫，一定要有 senior 在旁邊（推論）', { size: 19, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  return { F: { svg: o, extra: '', P: { title: '指引的立場與急診床邊修補的結果', orient: '' } } };
};
DRAW2['2-2'] = T => {
  // left: the puncta, the zone medial to them and the canaliculi (示意); a wound across the lower canaliculus with the probe showing in it (示意)
  const L = VLAC.lcor({}, PW, PH, MED, 'bL'), [pu, pl] = LG.puncta(), mc = CORONAL.MC[0], zone = T.on(0, 0.8), pr = T.on(4, 0.8);
  const fl = x => CORONAL.Ly(Math.min(x, mc)) + 1.0, wx = pl[0] + 2.6;                         // lower canaliculus path, wound 2.6 mm medial to the punctum
  let sl = L.svg + medialZone(L, 'upper', zone) + medialZone(L, 'lower', zone) + canal(L, 'upper', T.on(1)) + canal(L, 'lower', T.on(1)) + punctaSvg(L, 1);
  const wd = [[wx - 0.5, CORONAL.Ly(wx) - 0.05], [wx + 0.3, CORONAL.Ly(wx) + 1.6], [wx + 0.9, CORONAL.Ly(wx) + 3.0]].map(L.P);
  sl += curve(wd, '#8e3b3f', 5, pr) + curve(wd, '#d98a8a', 2, pr);
  { const e = [wx + 0.25, fl(wx)], d = [e[0] - pl[0], e[1] - pl[1]], q = [[pl[0] - d[0] * 0.9, pl[1] - d[1] * 0.9], e].map(L.P); sl += `<g opacity="${pr}">${curve(q, '#3d434b', 5.5)}${curve(q, '#b6bec7', 3)}</g>`; }
  let el = lab('上淚小點', 'upper punctum', 14, 40, L.P(pu), { bold: true });
  el += lab('淚小管（示意）', 'canaliculus', PW - 12, 40, L.P([12.4, CORONAL.Uy(12.4) - 1.0]), { side: 'R', op: T.on(1) });
  el += lab('punctum 內側：要探查', 'medial to the punctum', PW - 12, 92, L.P([11.2, CORONAL.Uy(11.2) - 2.2]), { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: zone });
  el += lab('下淚小點', 'lower punctum', 14, 280, L.P(pl), { bold: true });
  el += lab('傷口裡看到 Bowman probe（示意）', 'probe in the wound', PW - 12, 330, L.P([wx + 0.25, fl(wx)]), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: pr });
  el += note('淚小點位置、淚小管走向、傷口：示意', 1, PH - 14, 14, 'start');
  // right: equipment (Clark 2015) → dog bites (Savar 2008) and risk factors (Huang 2022) → stent repair
  const e = T.on(2, 0.5) * (1 - T.on(6, 0.4)), d = T.on(6, 0.5) * (1 - T.on(8, 0.4)), s = T.on(8, 0.5);
  const eq = [['探查用的器材（Clark 2015）', { bold: true, color: COL.accent }], ['4% 表面 lidocaine、棉棒', {}], ['punctal dilator', {}], ['Bowman probe：00 或 0 號', {}],
    ['23G 彎頭淚道針＋3 cc 針筒', { op: T.on(3) }], ['fluorescein 生理食鹽水', { op: T.on(3, 0.6, 0.6) }]];
  let sr = infoCard(20, 14, PW - 40, eq, e, { lh: 40 });
  sr += infoCard(20, 270, PW - 40, [['確認：直接看到裂傷、probe 或沖水針探查', { bold: true }], ['年紀小的孩子：可能要麻醉下檢查', {}]], T.on(4, 0.5) * (1 - T.on(6, 0.4)), { lh: 36 });
  const bx = 190, bs = (PW - bx - 90) / 100, br = (y, v, col, l, op) => `<g opacity="${op}">${text(bx - 12, y + 20, l, { size: 16, bold: true, anchor: 'end' })}<rect x="${bx}" y="${y}" width="${v * bs}" height="28" rx="4" fill="${col}"/>${text(bx + v * bs + 10, y + 20, v + '%', { size: 17, bold: true, color: col })}</g>`;
  sr += `<g opacity="${d}">${text(24, 40, '眼瞼裂傷傷到 canaliculus 的比例（Savar 2008）', { size: 16, bold: true, color: COL.accent })}${br(64, 66, COL.red, '狗咬傷', 1)}${br(108, 37, COL.line, '其他原因', T.on(6, 0.6, 1.2))}`
    + `${infoCard(20, 172, PW - 40, [['兒童的危險因子（Huang 2022）', { bold: true }], ['傷到瞼緣', {}], ['傷在下眼瞼', {}], ['被鉤子勾到', {}]], T.on(7), { lh: 36 })}</g>`;
  sr += infoCard(20, 60, PW - 40, [['Canalicular laceration', { bold: true }], ['放 stent 修補；有經驗的醫師可在床邊做', {}], ['第一次自己縫：不在範圍內', { bold: true, color: COL.red, op: T.on(9) }],
    ['→ 找 oculoplastic（推論）', { bold: true, color: COL.accent, op: T.on(9, 0.6, 0.6) }]], s, { lh: 44 });
  return { L: { svg: sl, extra: el, P: { ...COR_P, title: '正面：內側的上下眼瞼（左＝temporal）' } }, R: { svg: sr, extra: '', P: { title: '探查淚道', orient: '' } } };
};
DRAW2['2-3'] = T => {
  // left: a wound through the orbital septum above the tarsus, preaponeurotic fat bulging out (示意)
  const L = VIEWS.sag({ septOpen: 1 }, PW, PH, { x: -23, y: -21, w: 22 }, 'cL'), A = L.A, M = L.M, f = T.on(0, 0.8);
  const sk = [-16.55, -12.6], sc = M.septCut || [-11.68, -11.99], wd = [sk, mid(sk, sc, 0.5), sc].map(L.P);
  const blob = [[-11.2, -12.5], [-12.6, -12.9], [-14.4, -12.8], [-15.9, -12.5], [-16.3, -12.05], [-15.7, -11.75], [-14.2, -11.6], [-12.6, -11.5], [-11.3, -11.5]].map(L.P);
  let sl = L.svg + curve(wd, COL.red, 3, f) + `<path d="${pathOf(blob, true)}" fill="#f3d27a" stroke="#b8902a" stroke-width="1.8" opacity="${T.on(0, 0.8, 0.6)}"/>`;
  let el = lab('脂肪從傷口鼓出（示意）', 'fat in the wound', 14, 330, L.P([-15.6, -12.2]), { bold: true, color: COL.red, lc: COL.red, op: T.on(0, 0.8, 0.6) });
  el += lab('眶隔', 'orbital septum', 14, 40, A.septum, { bold: true });
  el += lab('腱膜前脂肪', 'preaponeurotic fat', PW - 12, 40, A.fat, { side: 'R' });
  el += lab('不要縫 septum', "don't suture", 14, 92, A.septum, { bold: true, color: COL.red, lc: COL.red, op: T.on(2) * (1 - T.on(3)) });
  el += lab('提上瞼肌腱膜', 'levator aponeurosis', PW - 12, 92, A.apo, { bold: true, color: T.on(3) > 0.5 ? COL.red : COL.ink, lc: T.on(3) > 0.5 ? COL.red : undefined, side: 'R' });
  el += lab('瞼板', 'tarsus', PW - 12, 380, A.tarsus, { side: 'R' });
  // right: coronal, a wound above the tarsus exposing the fat (window to the fat layer, 示意); then the other reasons to go to the OR
  const win = { poly: [[-4.5, -11.0], [-1.5, -11.8], [1.5, -11.9], [3.5, -11.2], [1.5, -10.6], [-1.5, -10.5]], depth: 3 };
  const R = VIEWS.cor({}, PW, PH, { x: -17.5, y: -15.5, w: 33 }, 'cR', { windows: [win] }), info = T.on(4, 0.5);
  let er = lab('傷口中的黃色脂肪（示意）', 'orbital fat', PW - 12, 40, R.P([0.5, -11.2]), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: f * (1 - info) });
  er += lab('不切、不縫眼眶組織', 'no orbital tissue', 14, 92, R.P([-2.5, -10.9]), { bold: true, op: T.on(1) * (1 - info) });
  er += lab('levator、superior rectus、medial canthal tendon：轉', 'to the OR', 14, 380, R.P([12.5, 0.6]), { bold: true, op: T.on(3) * (1 - info) });
  const rows = [['組織缺損：幾乎都還在，多半是被拉開', { bold: true }], ['真的缺損（上眼瞼）可直接拉攏縫合：', { op: T.on(5) }], ['年輕人 25% 以內、年長者 40% 以內', { bold: true, color: COL.accent, op: T.on(5, 0.6, 0.6) }],
    ['超過就要重建', { op: T.on(5, 0.6, 1.4) }], ['不能配合（小孩、失智）：鎮靜，不在治療室縫', { bold: true, color: COL.red, op: T.on(6) }]];
  const sr = R.svg + infoCard(20, 150, PW - 40, rows, info, { lh: 44 });
  return { L: { svg: sl, extra: el, P: SAG_P }, R: { svg: sr, extra: er, P: COR_P } };
};
DRAW2['2-4'] = T => {
  // time axis (piecewise: 0–48 h linear, then a break to 11 days)
  const X = h => h <= 48 ? 110 + h * 13.5 : 110 + 48 * 13.5 + 150 + (h - 48) / (264 - 48) * 260, y = 84, o = [];
  o.push(`<rect x="${X(0)}" y="${y - 30}" width="${X(24) - X(0)}" height="30" rx="5" fill="${COL.accent}" opacity="${0.85 * T.on(0)}"/>`, `<g opacity="${T.on(0)}">${text((X(0) + X(24)) / 2, y - 9, 'EyeWiki：一期修補 12–24 小時內', { size: 16, bold: true, color: '#fff', anchor: 'middle' })}</g>`);
  o.push(`<path d="M${X(0)} ${y}H${X(48) + 60}M${X(48) + 90} ${y}H${X(264) + 30}" stroke="${COL.ink}" stroke-width="2.4"/><path d="M${X(48) + 64} ${y + 10}l12 -20M${X(48) + 76} ${y + 10}l12 -20" stroke="${COL.ink}" stroke-width="2"/>`);
  for (const [h, s, op] of [[0, '受傷 0', 1], [12, '12 小時', T.on(0)], [24, '24 小時', T.on(0)], [48, '48 小時', T.on(3)], [264, '11 天', T.on(5)]])
    o.push(`<g opacity="${op}"><path d="M${X(h)} ${y}v10" stroke="${COL.ink}" stroke-width="2"/>${text(X(h), y + 32, s, { size: 15.5, bold: true, anchor: 'middle' })}</g>`);
  const row = (i, h0, h1, col, s, op) => { const yy = y + 76 + i * 50; return `<g opacity="${op}">${text(X(h0), yy, s, { size: 15.5, color: COL.ink })}<rect x="${X(h0)}" y="${yy + 7}" width="${Math.max(8, X(h1) - X(h0))}" height="12" rx="4" fill="${col}" opacity="0.8"/></g>`; };
  o.push(row(0, 0, 48, COL.line, '兒童眼瞼裂傷：併發症和延後修補無關（Huang 2022）', T.on(1)));
  o.push(row(1, 12, 14, COL.line, '兒童狗咬傷：超過 12 小時也不是感染的預測因子（Truong 2025）', T.on(2)));
  o.push(row(2, 0, 48, COL.accent, 'Canalicular：48 小時內 7.6%  vs  超過 9.1%，沒有差別（Chu 2017）', T.on(3)));
  o.push(row(3, 48, 264, COL.accent, '有經驗的團隊：可延到 11 天內（Wu 2010）', T.on(5)));
  o.push(row(4, 24, 26, COL.red, '小型研究：超過 24 小時修補，結果較差（Raj 2020）', T.on(6)));
  o.push(`<g opacity="${T.on(7)}">${text(FW / 2, PH - 16, '能在 12–24 小時內縫就不要拖；為了等有經驗的人或開刀房延後一點，通常不會變差', { size: 18, bold: true, color: COL.accent, anchor: 'middle' })}</g>`);
  return { F: { svg: o.join(''), extra: '', P: { title: '受傷到修補的時間', orient: '時間軸在 48 小時後縮短' } } };
};

// ---------------------------------------------------------------- 3 術前準備
DRAW2['3-1'] = T => {
  // instruments laid out on a sterile drape (icons 示意), labels appear with the narration (Clark 2015)
  const o = [`<rect x="20" y="10" width="${FW - 40}" height="${PH - 20}" rx="12" fill="#d9ecef"/>`], ex = [];
  const S = '#3d434b', icon = {
    form: (x, y) => `<rect x="${x - 26}" y="${y - 34}" width="40" height="52" rx="3" fill="#fff" stroke="${S}" stroke-width="2"/><path d="M${x - 19} ${y - 22}h26M${x - 19} ${y - 12}h26M${x - 19} ${y - 2}h18" stroke="${COL.line}" stroke-width="2"/><rect x="${x + 2}" y="${y - 14}" width="34" height="26" rx="5" fill="#5b6878"/><circle cx="${x + 19}" cy="${y - 1}" r="8" fill="#cfd6dd" stroke="#fff" stroke-width="2"/>`,
    vial: (x, y) => `<rect x="${x - 13}" y="${y - 30}" width="26" height="46" rx="4" fill="#f4f8fb" stroke="${S}" stroke-width="2"/><rect x="${x - 9}" y="${y - 40}" width="18" height="11" rx="2" fill="#c8423b"/><rect x="${x - 13}" y="${y - 12}" width="26" height="14" fill="#ffd34d" opacity="0.8"/>`,
    needle: (x, y) => `<path d="M${x - 40} ${y - 18}h60" stroke="#9aa3ad" stroke-width="2"/><rect x="${x + 20}" y="${y - 22}" width="16" height="8" rx="2" fill="#f2c94c"/><path d="M${x - 40} ${y + 6}h60" stroke="#9aa3ad" stroke-width="1.4"/><rect x="${x + 20}" y="${y + 2}" width="16" height="8" rx="2" fill="#7b9fd4"/>`,
    syringe: (x, y) => `<rect x="${x - 34}" y="${y - 12}" width="54" height="18" rx="3" fill="#f4f8fb" stroke="${S}" stroke-width="2"/><path d="M${x + 20} ${y - 3}h22M${x - 34} ${y - 3}h-12M${x - 46} ${y - 12}v18" stroke="${S}" stroke-width="2.4"/>`,
    bottle: (x, y, c) => `<rect x="${x - 16}" y="${y - 30}" width="32" height="48" rx="6" fill="${c}" stroke="${S}" stroke-width="2"/><rect x="${x - 7}" y="${y - 40}" width="14" height="11" rx="2" fill="${S}"/>`,
    holder: (x, y) => `<path d="M${x - 44} ${y + 10}L${x + 34} ${y - 6}M${x - 44} ${y - 6}L${x + 34} ${y - 6}" stroke="${S}" stroke-width="3" stroke-linecap="round"/><circle cx="${x - 50}" cy="${y + 12}" r="6" fill="none" stroke="${S}" stroke-width="2.4"/><circle cx="${x - 50}" cy="${y - 8}" r="6" fill="none" stroke="${S}" stroke-width="2.4"/>`,
    forceps: (x, y) => `<path d="M${x - 44} ${y - 2}L${x + 36} ${y - 10}M${x - 44} ${y - 2}L${x + 36} ${y + 6}" stroke="${S}" stroke-width="3" stroke-linecap="round"/>`,
    scissors: (x, y) => `<path d="M${x - 30} ${y + 6}L${x + 36} ${y - 8}M${x - 30} ${y - 8}L${x + 36} ${y + 2}" stroke="${S}" stroke-width="3" stroke-linecap="round"/><circle cx="${x - 38}" cy="${y + 8}" r="7" fill="none" stroke="${S}" stroke-width="2.4"/><circle cx="${x - 38}" cy="${y - 10}" r="7" fill="none" stroke="${S}" stroke-width="2.4"/>`,
    suture: (x, y) => `<rect x="${x - 28}" y="${y - 24}" width="56" height="40" rx="4" fill="#fff" stroke="${S}" stroke-width="2"/><path d="M${x - 14} ${y + 4}a14 14 0 0 1 28 0" fill="none" stroke="${S}" stroke-width="2.4"/><path d="M${x + 14} ${y + 4}q10 -2 8 -14" fill="none" stroke="#7b3fa0" stroke-width="1.6"/>`,
    tube: (x, y) => `<path d="M${x - 34} ${y - 10}h52l10 6v6l-10 6h-52z" fill="#fff" stroke="${S}" stroke-width="2"/><rect x="${x + 28}" y="${y - 6}" width="10" height="10" fill="${S}"/><rect x="${x - 26}" y="${y - 8}" width="26" height="14" fill="#f2c94c"/>`,
    glove: (x, y) => `<path d="M${x - 20} ${y + 18}v-26q0 -6 5 -6t5 6v-10q0 -6 5 -6t5 6v8q0 -6 5 -6t5 6v8q0 -5 5 -5t4 5v22q0 6 -8 6h-23q-8 0 -8 -6z" fill="#f4f8fb" stroke="${S}" stroke-width="2"/><rect x="${x + 22}" y="${y - 6}" width="30" height="20" rx="4" fill="#9cc7e6" stroke="${S}" stroke-width="1.6"/>`,
  };
  const items = [[0, 'form', '同意書＋拍照', 'consent, photos'], [1, 'vial', '1–2% lidocaine', 'with epi 1:100,000'], [1, 'needle', '20G 抽、27–30G 打', 'needles'],
    [2, 'syringe', '3 或 5 cc 針筒', 'syringe'], [2, 'bottle', '生理食鹽水、5% Betadine', 'saline, povidone-iodine'], [2, 'bottle2', '0.5% proparacaine', 'topical drops'],
    [3, 'holder', 'Castroviejo needle holder', ''], [3, 'forceps', 'Paufique forceps', ''], [3, 'scissors', '剪刀', 'scissors'], [3, 'suture', '縫線', 'sutures'],
    [4, 'tube', 'erythromycin 眼藥膏', 'ointment'], [4, 'glove', '無菌手套、口罩、洞巾', 'gloves, mask, drape']];
  items.forEach(([li, ic, zh, en], i) => { const col = i < 6 ? i : i - 6, row = i < 6 ? 0 : 1, x = 120 + col * 198, y = 100 + row * 180, op = T.on(li, 0.6, (i % 6) * 0.25);
    const g = ic === 'bottle' ? icon.bottle(x - 20, y, '#f4f8fb') + icon.bottle(x + 22, y, '#c99a4a') : ic === 'bottle2' ? icon.bottle(x, y, '#e7f0fa') : icon[ic](x, y);
    o.push(`<g opacity="${op}">${g}${text(x, y + 52, zh, { size: 15.5, bold: true, anchor: 'middle' })}${en ? text(x, y + 72, en, { size: 13.5, color: COL.sub, anchor: 'middle' }) : ''}</g>`); });
  o.push(htext(FW - 34, PH - 22, '器材依 Clark 2015；圖示為示意', { size: 13, color: COL.sub, anchor: 'end' }));
  return { F: { svg: o.join(''), extra: '', P: { title: '器材（排在無菌治療巾上）', orient: '' } } };
};
DRAW2['3-2'] = T => {
  const L = VIEWS.sag({}, PW, PH, { x: -23, y: -10.5, w: 22 }, 'dL'), A = L.A, R = VLAC.cor(ST.open, PW, PH, { x: -12, y: -12.5, w: 24 }, 'dR'), B = R.A;
  const sh = T.on(0, 0.8, 1.0);
  let sl = L.svg + shellSag(L, sh);
  let el = lab('scleral shell（示意）', 'protective shell', PW - 12, 380, L.P([-12.6, 1.8]), { side: 'R', bold: true, color: '#2f6f9f', lc: '#2f6f9f', op: sh });
  el += lab('角膜', 'cornea', PW - 12, 310, A.cornea, { side: 'R', op: sh });
  el += lab('上眼瞼', 'upper lid', 14, 40, A.tarsus, { bold: true });
  el += lab('翻開眼瞼看傷口深度', 'evert, look at depth', 14, 92, A.conj, { bold: true, color: COL.accent, lc: COL.accent, op: T.on(2) * (1 - T.on(4)) });
  el += note('必要時沖洗穹窿', T.on(2, 0.6, 1) * (1 - T.on(3)), 26);
  el += tag('前提：已排除眼球破裂；懷疑時不硬撐眼瞼', T.on(3) * (1 - T.on(4)), COL.red, PH - 50);
  // right: drops, shell, minimal local anaesthetic along the wound edge, irrigation, povidone-iodine (instruments 示意)
  const lc = R.M.lacEdgeT, ap = R.M.lacApex, drops = T.on(0) * (1 - T.on(1, 0.4)), ndl = T.on(1) * (1 - T.on(2, 0.4)), irr = T.on(4) * (1 - T.on(5, 0.4)), bt = T.on(5, 0.8);
  let sr = R.svg + shellCor(R, sh, 'dR');
  for (const [dx, dy] of [[-2, -5], [0.4, -6.2], [2.6, -5.2]]) sr += `<path d="M${R.P([dx, dy])[0].toFixed(1)} ${(R.P([dx, dy])[1] - 12).toFixed(1)}q-7 11 0 15q7 -4 0 -15z" fill="#4a90c2" opacity="${drops}"/>`;
  { const a = R.P([lc[0] - 2.6, lc[1] - 5.2]), b = R.P(mid([lc[0] - 0.4, lc[1] - 0.6], ap, 0.4)); sr += `<g opacity="${ndl}"><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#7b828c" stroke-width="2.4"/><rect x="${a[0] - 9}" y="${a[1] - 9}" width="18" height="18" rx="3" transform="rotate(35 ${a[0]} ${a[1]})" fill="#f2c94c" stroke="#3d434b"/></g>`; }
  { const a = R.P([6.5, -9.0]), b = R.P(mid(ap, [0, -4.3], 0.5)); sr += `<g opacity="${irr}">${arrow(a, b, '#4a90c2', 1, 'arrB', 4)}</g>`;
    for (const k of [0.2, 0.45, 0.7]) { const p = R.P(mid([lc[0], lc[1]], ap, k)); sr += dot([p[0] - 3, p[1]], '#7a1f2a', 3.4, irr * 0.9); } }
  { const c = R.P([0, -4]); sr += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${12 * R.k}" ry="${8 * R.k}" fill="#a0522d" opacity="${0.18 * bt}"/>`; }
  let er = lab('表面麻醉（雙眼）', 'topical drops', PW - 12, 40, R.P([2.6, -5.4]), { side: 'R', bold: true, op: drops });
  er += lab('scleral shell（示意）', 'protective shell', PW - 12, 380, R.P([-8.5, 1.5]), { side: 'R', bold: true, color: '#2f6f9f', lc: '#2f6f9f', op: sh });
  er += lab('局麻：最少量', 'minimal local', PW - 12, 92, R.P(mid([lc[0] - 0.4, lc[1] - 0.6], ap, 0.4)), { side: 'R', bold: true, op: ndl });
  er += lab('大量生理食鹽水沖洗', 'irrigate', PW - 12, 40, R.P([6.6, -9.1]), { side: 'R', bold: true, color: '#2f6f9f', lc: '#2f6f9f', op: irr });
  er += lab('清掉 fibrin 血塊、異物', 'fibrin, debris', 14, 40, R.P(mid(lc, ap, 0.45)), { bold: true, op: irr });
  er += lab('5% Betadine 消毒、鋪單', 'prep, drape', PW - 12, 40, R.P([7, -9]), { side: 'R', bold: true, color: '#8a4b20', lc: '#8a4b20', op: bt });
  return { L: { svg: sl, extra: el, P: SAG_P }, R: { svg: sr, extra: er, P: COR_P } };
};

// ---------------------------------------------------------------- 4 縫合步驟（上眼瞼）
// right-side coronal labels shared by the margin steps
DRAW2['4-1'] = T => {
  const L = VLAC.margin(ST.open, PW, PH, MW, 'eL'), R = VLAC.cor(ST.open, PW, PH, CW, 'eR'), B = R.A, U = LAC.U;
  const h1 = T.on(1, 0.5), h2 = T.on(1, 0.5, 0.6), h3 = T.on(1, 0.5, 1.2), h4 = T.on(1, 0.5, 1.8), g = T.on(2, 0.6);
  let sl = L.svg + mLine(L, U.grey, COL.accent, Math.max(h2 * 0.9, g)) + mLine(L, U.lash, COL.amber, h3 * 0.9) + mLine(L, U.mcj, COL.purple, h4 * 0.9);
  // tarsus: the cut face of the tarsal plate on each wound edge (conjunctiva-side edge to the anterior tarsal surface)
  for (const s of [-1, 1]) { const x = s * 0.004, a = mPt(L, x, LID.U_CONJ), b = mPt(L, x, U.tar); sl += `<path d="M${(a[0] + s * 6).toFixed(1)} ${a[1].toFixed(1)}V${b[1].toFixed(1)}" stroke="${COL.suture}" stroke-width="6" opacity="${h1 * 0.85}"/>`; }
  let el = lab('皮膚', 'skin', 14, 40, mPt(L, -5.2, U.skin + 0.9));
  el += lab('前睫毛線', 'anterior lash line', PW - 12, 40, mPt(L, 4.8, U.lash), { side: 'R', bold: h3 > 0.5, color: h3 > 0.5 ? COL.amber : COL.ink, lc: h3 > 0.5 ? COL.amber : undefined });
  el += lab('灰線', 'gray line', 14, 92, mPt(L, -4.4, U.grey), { bold: h2 > 0.5, color: h2 > 0.5 ? COL.accent : COL.ink, lc: h2 > 0.5 ? COL.accent : undefined });
  el += lab('瞼板腺開口', 'meibomian orifices', PW - 12, 92, mPt(L, 3.6, U.orif), { side: 'R' });
  el += lab('MCJ', 'mucocutaneous junction', 14, 380, mPt(L, -3.4, U.mcj), { bold: h4 > 0.5, color: h4 > 0.5 ? COL.purple : COL.ink, lc: h4 > 0.5 ? COL.purple : undefined });
  el += lab('結膜', 'conjunctiva', PW - 12, 380, mPt(L, 4.2, -0.7), { side: 'R' });
  el += lab('瞼板（傷口切面）', 'tarsus', PW - 12, 330, off(mPt(L, 0.004, (LID.U_CONJ + U.tar) / 2), 6, 0), { side: 'R', bold: true, color: COL.suture, lc: COL.suture, op: h1 });
  el += lab('傷口', 'wound', 14, 330, mPt(L, -0.6, -1.0), { op: 1 - h1 });
  let er = lab('前睫毛線', 'lash line', PW - 12, 40, B.lacLash, { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: h3 });
  er += lab('後瞼緣', 'posterior lid margin', 14, 380, B.lacEdgeT, { op: 1 });
  er += lab('裂傷尖端', 'apex', 14, 40, B.lacApex, {});
  return { L: { svg: sl, extra: el, P: MAR_P }, R: { svg: R.svg, extra: er, P: COR_P } };
};
DRAW2['4-2'] = T => {
  const g = T.p(0, 0.25, 0.9), lac = 1 - 0.4 * T.p(4, 0.1, 0.8), st = { lac, lacGrey: g > 0.02 ? g : 0 };
  const L = VLAC.margin(st, PW, PH, MW, 'fL'), A = L.A, R = VLAC.cor(st, PW, PH, CW, 'fR'), S = R.S, B = R.A, U = LAC.U, d = T.on(1, 0.6) * (1 - T.on(2, 0.4)), same = T.on(2) * (1 - T.on(3, 0.4));
  let sl = L.svg, sr = R.svg;
  if (A.greyT) { const yl = A.greyT[1] - 0.45 * L.k; sl += VIEWS.dim([A.greyT[0], yl], [A.edgeT[0], yl], COL.accent, d) + VIEWS.dim([A.edgeN[0], yl], [A.greyN[0], yl], COL.accent, d);
    sl += ring(A.greyT, COL.accent, 11, same) + ring(A.greyN, COL.accent, 11, same); }
  if (S.greyT) { const e = R.P(R.r.lacW([-0.004, R.r.Uy(0) + (R.r.lashY(0) - R.r.Uy(0)) * U.grey / U.skin])), yl = S.greyT[1] - 0.5 * R.k;
    sr += VIEWS.dim([S.greyT[0], yl], [e[0], yl], COL.accent, d) + ring(S.greyT, COL.accent, 11, same) + ring(S.greyN, COL.accent, 11, same); }
  let el = lab('6-0 silk：穿過灰線', 'gray line suture', 14, 40, A.greyT || mPt(L, -2, U.grey), { bold: true, op: T.on(0, 0.6, 0.6) });
  el += lab('離傷口邊緣 2 mm', 'from the wound edge', PW - 12, 40, A.greyN ? [mid(A.edgeN, A.greyN)[0], A.greyN[1] - 0.45 * L.k] : A.edgeN, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: d });
  el += lab('兩側同深、同距離', 'same depth, same distance', PW - 12, 92, A.greyN || A.edgeN, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: same });
  el += lab('線尾留長', 'long tails', 14, 380, mPt(L, -2.3, U.skin + 1.2), { op: T.on(1) });
  el += lab('先不綁，拉著當對位（推論）', 'not tied yet', 14, 92, A.edgeT, { bold: true, color: COL.amber, lc: COL.amber, op: T.on(4) });
  let er = lab('離傷口邊緣 2 mm', 'from the wound edge', 14, 40, S.greyT ? [S.greyT[0] + 20, S.greyT[1] - 0.5 * R.k] : B.lacEdgeT, { bold: true, color: COL.accent, lc: COL.accent, op: d });
  er += lab('silk 線尾', 'tails', PW - 12, 40, S.greyN ? [S.greyN[0] + 10, S.greyN[1] - 2.0 * R.k] : B.lacEdgeN, { side: 'R', op: T.on(1) });
  er += lab('張力：交給下一步的 tarsal sutures', 'tension → tarsus', 14, 380, R.P([0, -6.5]), { bold: true, op: T.on(3) });
  return { L: { svg: sl, extra: el, P: MAR_P }, R: { svg: sr, extra: er, P: COR_P } };
};
DRAW2['4-3'] = T => {
  // bites appear one (line 1) then three (line 3); the gap closes 0.6 → 0.4 as they are placed, → 0 when they are tied (line 4)
  const n = T.on(1, 0.6, 0.6) > 0.5 ? (T.on(3, 0.6, 0.6) > 0.5 ? 3 : 1) : 0, tie = T.p(4, 0.1, 0.8), lac = tie > 0 ? 0.4 * (1 - tie) : lerp(0.6, 0.4, T.p(1, 0.1, 1) * 0.5 + T.p(3, 0, 1) * 0.5);
  const st = { lac, lacGrey: 1, lacTar: n / 3, lacWin: LP.win };
  const L = VLAC.sag(st, PW, PH, WFW, 'gL'), A = L.A, S = L.S, R = VLAC.cor(st, PW, PH, CW, 'gR'), C = R.S;
  const wrong = T.on(2, 0.5) * (1 - T.on(3, 0.4)), fb = LG.fullBite(3.5);
  let sl = L.svg + `<g opacity="${wrong}">${curve([L.P(fb.a), L.P(fb.knot)], COL.red, 3, 1, '6 4')}${dot(L.P(fb.knot), COL.red, 6)}</g>`;
  let el = lab('瞼板', 'tarsus', 14, 40, A.tarsus, { bold: true });
  el += lab('結膜面（後表面）', 'posterior surface', PW - 12, 300, L.P(LID.UF.at(3.2, 0.02)), { side: 'R' });
  el += lab('前表面：從這裡咬進去', 'anterior surface', 14, 380, L.P(LID.UF.at(1.4, LAC.U.tar)), { bold: true, op: T.on(1) * (1 - T.on(3, 0.4)) });
  el += lab('partial-thickness：只咬前半部', 'anterior tarsus', 14, 380, S.tar1 || L.P(LID.UF.at(3.5, LAC.TAR_U)), { bold: true, color: '#5b2a7a', lc: '#5b2a7a', op: T.on(3, 0.6, 0.6) });
  el += lab('× 穿到後表面：線結磨角膜', 'full-thickness', PW - 12, 330, L.P(fb.knot), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: wrong });
  el += lab('5-0／6-0 Vicryl', 'tarsal suture', 14, 300, S.tar0 || L.P(LID.UF.at(2, LAC.TAR_U)), { bold: true, color: '#5b2a7a', lc: '#5b2a7a', op: T.on(1, 0.6, 0.6) });
  el += note('咬的高度為示意', T.on(1));
  let er = lab('開窗：瞼板層', 'window to the tarsus', 14, 40, R.P([-2.8, -9.2]), { bold: true });
  er += lab('上眼瞼 3 針', '3 tarsal sutures', PW - 12, 40, C.tar2 || R.P([1.5, -8.2]), { side: 'R', bold: true, color: '#5b2a7a', lc: '#5b2a7a', op: T.on(3, 0.6, 0.6) });
  er += lab('綁好、剪短、埋結', 'tie, cut, bury', PW - 12, 92, C.tar1 || R.P([1.5, -7]), { side: 'R', bold: true, op: T.on(4) });
  er += lab('張力由 tarsus 承擔', 'tension on the tarsus', 14, 380, R.P([0.6, -5.2]), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(5) });
  er += lab('gray line 那一針：還沒綁', 'gray line, untied', PW - 12, 380, R.S.greyN || R.A.lacEdgeN, { side: 'R', op: T.on(0) * (1 - T.on(5, 0.4)) });
  return { L: { svg: sl, extra: el, P: WF_P }, R: { svg: R.svg, extra: er, P: { ...COR_P, title: '正面：開窗到瞼板層（左＝temporal）' } } };
};
DRAW2['4-4'] = T => {
  const gt = step(T.on(0, 0.6, 0.6)), la = T.on(1, 0.5, 0.3) > 0.5 ? 1 : 0, lt = step(T.on(1, 0.6, 1.8)), pout = LP.pout * T.p(2, 0.1, 0.9);
  const st = { lac: 0, lacTar: 1, lacGrey: 1, lacGreyTie: gt, lacLash: la, lacLashTie: lt, lacPout: pout };
  const L = VLAC.margin(st, PW, PH, MW, 'hL'), A = L.A, R = VLAC.cor(st, PW, PH, CW, 'hR'), B = R.A, S = R.S, U = LAC.U, mcj = T.on(1, 0.6, 2.4);
  let sl = L.svg + `<g opacity="${mcj}">${curve([mPt(L, -2, U.mcj), mPt(L, 2, U.mcj)], LAC.C.silk, 1.6, 0.55, '3 4')}${dot(mPt(L, -2, U.mcj), '#6b6b6b', 3.2)}${dot(mPt(L, 2, U.mcj), '#6b6b6b', 3.2)}</g>`;
  let el = lab('灰線那一針：綁好', 'gray line tied', 14, 40, A.greyT, { bold: true, op: gt });
  el += lab('前睫毛線：6-0 silk', 'lash line suture', PW - 12, 40, A.lashN || mPt(L, 2, U.lash), { side: 'R', bold: true, op: T.on(1, 0.5, 0.3) });
  el += lab('MCJ：必要時再一針', 'optional', PW - 12, 380, mPt(L, 2, U.mcj), { side: 'R', op: mcj });
  el += lab('兩側對齊', 'aligned', 14, 380, mPt(L, -0.6, U.grey), { bold: true, color: COL.accent, lc: COL.accent, op: gt });
  let sr = R.svg;
  const e = B.lacEdgeT || R.P([0, R.r.Uy(0)]), po = T.on(2, 0.6);
  if (B.lacEdgeT) sr += `<g opacity="${po}">${arrow([e[0] + 2, e[1] - 26], [e[0] + 2, e[1] + 4], COL.accent, 1, 'arrA', 2.6)}</g>`;
  let er = lab('瞼緣稍微外翻（程度示意）', 'slight eversion', 14, 380, e, { bold: true, color: COL.accent, lc: COL.accent, op: po });
  er += lab('癒合後才不會凹下去', 'avoids a notch', PW - 12, 92, [e[0] + 6, e[1] - 4], { side: 'R', op: T.on(3) });
  er += lab('tarsal sutures：在皮膚下', 'under the skin', PW - 12, 40, S.tar2 || R.P([1.5, -8.2]), { side: 'R', op: 1 - T.on(2) });
  return { L: { svg: sl, extra: el, P: MAR_P }, R: { svg: sr, extra: er, P: COR_P } };
};
DRAW2['4-5'] = T => {
  const sk = T.p(0, 0.1, 0.9), st = { ...ST.margin, lacSkin: sk > 0.02 ? sk : 0 };
  const L = VLAC.sag(st, PW, PH, WFW, 'iL'), A = L.A, S = L.S, R = VLAC.cor(st, PW, PH, CW, 'iR'), C = R.S;
  let el = lab('皮膚縫線：只在皮膚層', 'skin sutures', PW - 12, 40, S.skin1 || S.skin0 || A.skin, { side: 'R', bold: true, color: '#7a5a2a', lc: '#7a5a2a', op: T.on(0, 0.6, 0.4) });
  el += lab('tarsal sutures', 'Vicryl', PW - 12, 200, S.tar1, { side: 'R', color: '#5b2a7a', lc: '#5b2a7a' });
  el += lab('瞼緣的 silk', 'gray line, lash line', 14, 380, S.lash || S.grey, {});
  el += lab('眼輪匝肌', 'orbicularis', PW - 12, 380, A.orb && A.orb[1] > 0 && A.orb[1] < PH ? A.orb : L.P(LID.UF.at(2.4, LID.uSkin(LID.VARIANTS.asian, 2.4) - 0.6)), { side: 'R' });
  el += note('縫線高度為示意', T.on(0));
  let er = lab('6-0 plain gut 或 7-0 Vicryl', 'skin', PW - 12, 40, C.skin2 || C.skin0 || R.P([1, -6]), { side: 'R', bold: true, op: T.on(0, 0.6, 0.4) });
  er += lab('挑出壓在線下的睫毛', 'free trapped lashes', 14, 380, R.P([-0.8, R.r.Uy(-0.8) - 1.6]), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(2) });
  return { L: { svg: L.svg, extra: el, P: WF_P }, R: { svg: R.svg, extra: er, P: COR_P } };
};
DRAW2['4-6'] = T => {
  const tk = T.p(0, 0.15, 0.85), st = { ...ST.skin, lacTails: tk > 0.5 ? 1 : 0 };
  const L = VLAC.sag(st, PW, PH, { x: -17.6, y: -9.2, w: 10.2 }, 'jL'), A = L.A, S = L.S, R = VLAC.cor(st, PW, PH, CW, 'jR'), C = R.S;
  // left: the tucked tail (round the anterior lid edge, up under the lowest skin suture) and, for comparison, a loose tail on the cornea (示意)
  const q = LG.tailTucked().map(L.P), n = Math.max(2, Math.round(1 + tk * (q.length - 1))), lq = LG.tailLoose().map(L.P), lo = T.on(1, 0.5) * (1 - T.on(2, 0.4));
  let sl = L.svg + curve(q.slice(0, n), LAC.C.silk, 2.4, T.on(0, 0.4)) + `<g opacity="${lo}">${curve(lq, COL.red, 2.6, 1, '6 4')}</g>`;
  let el = lab('線尾朝外、往上，離開角膜', 'tails up, away from the cornea', 14, 40, q[q.length - 1], { bold: true, color: COL.accent, lc: COL.accent, op: T.on(0, 0.6, 1.2) });
  el += lab('× 線尾沒埋：一眨眼就刷到角膜', 'loose tail', PW - 12, 380, lq[lq.length - 1], { side: 'R', bold: true, color: COL.red, lc: COL.red, op: lo });
  el += lab('最下面那針皮膚縫線', 'lowest skin suture', 14, 380, S.skin0, {});
  el += note('線尾的走法為示意', T.on(0));
  let er = lab('silk 線尾壓進皮膚縫線的結', 'tails under the skin knot', PW - 12, 40, C.tailKnot || C.skin0, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0, 0.6, 1.2) });
  er += lab('傷口塗 erythromycin 藥膏', 'ointment', 14, 380, R.P([-0.5, -6.5]), { bold: true, op: T.on(2) });
  return { L: { svg: sl, extra: el, P: WF_P }, R: { svg: R.svg, extra: er, P: COR_P } };
};
DRAW2['4-7'] = T => {
  const lac = 1 - T.p(0, 0.2, 0.9), vm = T.on(1, 0.6, 0.6) > 0.5 ? 1 : 0, tie = step(T.on(3, 0.6, 0.2)), pout = LP.pout * T.p(3, 0.1, 0.6), vm2 = T.on(3, 0.6, 1.6);
  const st = { lac, lacTar: 1, lacVM: vm, lacVMTie: tie, lacPout: pout };
  const L = VLAC.margin(st, PW, PH, MW, 'kL'), A = L.A, R = VLAC.cor(st, PW, PH, CW, 'kR'), B = R.A, U = LAC.U, far = T.on(2) * (1 - T.on(2, 0.5, 1.4)), nr = T.on(2, 0.5, 1.4) * (1 - T.on(3, 0.4));
  let sl = L.svg, sr = R.svg;
  // second mattress at the lash follicles (示意) in the margin face; both mattresses in the coronal view (same points, same warp)
  { const [f, nn] = LG.vmMargin(L.r.M, st, LP.vm2U); sl += vmSvg(f.map(L.P), nn.map(L.P), LAC.C.vic, vm2 > 0.02, 1, vm2); }
  { const [f, nn] = LG.vmCor(R.r, st, U.orif); sr += vmSvg(f.map(R.P), nn.map(R.P), LAC.C.vic, vm, tie); }
  { const [f, nn] = LG.vmCor(R.r, st, LP.vm2U); sr += vmSvg(f.map(R.P), nn.map(R.P), LAC.C.vic, vm2 > 0.02, 1, vm2); }
  if (A.vmFarT) { const [f, nn] = LG.vmMargin(L.r.M, st, U.orif).map(q => q.map(L.P)); sl += ring(f[0], COL.accent, 11, far) + ring(f[1], COL.accent, 11, far) + ring(nn[0], COL.amber, 9, nr) + ring(nn[1], COL.amber, 9, nr); }
  let el = lab('7-0 Vicryl：在瞼板腺開口', 'vertical mattress', 14, 380, A.vmFarT || mPt(L, -2, U.orif), { bold: true, color: '#5b2a7a', lc: '#5b2a7a', op: T.on(1, 0.6, 0.6) });
  el += lab('far–far：離邊緣較遠', 'far bites', 14, 40, A.vmFarT || mPt(L, -2, U.orif), { bold: true, color: COL.accent, lc: COL.accent, op: far });
  el += lab('near–near：離邊緣較近', 'near bites', 14, 40, A.vmNearT || mPt(L, -1, U.orif), { bold: true, color: COL.amber, lc: COL.amber, op: nr });
  el += lab('毛囊高度再一針（位置示意）', 'second at the follicles', PW - 12, 40, mPt(L, 2.6, LP.vm2U), { side: 'R', bold: true, op: vm2 });
  el += lab('先縫 tarsus：卸掉張力', 'tarsus first', PW - 12, 380, mPt(L, 0.3, 0.4), { side: 'R', bold: true, op: T.on(0) * (1 - T.on(1, 0.4)) });
  el += note('進出針的距離與深度為示意', T.on(1));
  let er = lab('綁緊 → 瞼緣外翻（程度示意）', 'eversion', 14, 380, B.lacEdgeT || R.P([0, R.r.Uy(0)]), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(3, 0.6, 0.4) });
  er += lab('Vicryl：不用拆線', 'absorbable', PW - 12, 40, R.P([1.6, R.r.Uy(1.6) - 0.6]), { side: 'R', bold: true, op: T.on(4) });
  const rows = [['共同原則', { bold: true, color: COL.accent }], ['① 對齊 gray line', {}], ['② 張力交給 tarsus', {}], ['③ 瞼緣微微外翻', {}]];
  sr += infoCard(PW - 250, 150, 230, rows, T.on(6), { lh: 40 });
  er += tag('Tyers 2005：7-0 Vicryl 埋結 ≈ 6-0 silk（非隨機）', T.on(5) * (1 - T.on(6, 0.4)), COL.ink, 30, PW / 2, 15);
  return { L: { svg: sl, extra: el, P: MAR_P }, R: { svg: sr, extra: er, P: COR_P } };
};

// ---------------------------------------------------------------- 5 常見的錯
DRAW2['5'] = T => {
  const cw = 386, ch = 300, xs = [16, 16 + cw + 14, 16 + 2 * (cw + 14)], y0 = 46;
  const a1 = T.on(0, 0.5) * (1 - T.on(4, 0.4)) > 0.5, a2 = (T.on(4, 0.5) * (1 - T.on(6, 0.4)) > 0.5) || T.on(7, 0.5) > 0.5, a3 = T.on(6, 0.5) * (1 - T.on(7, 0.4)) > 0.5;
  const head = (i, s, act) => `<rect x="${xs[i] - 4}" y="${y0 - 40}" width="${cw + 8}" height="${ch + 104}" rx="12" fill="${act ? 'rgba(14,124,107,0.07)' : 'none'}" stroke="${act ? COL.accent : 'none'}" stroke-width="2"/>${text(xs[i] + 8, y0 - 14, s, { size: 18, bold: true, color: act ? COL.accent : COL.ink })}`;
  let o = head(0, '① Notching（凹口）', a1) + head(1, '② 縫線刺激角膜', a2) + head(2, '③ 漏掉淚道', a3), ex = '';
  // ① coronal close-up of a healed notch (示意)
  const v1 = VLAC.cor(ST.notch, cw, ch, { x: -5, y: -8.5, w: 10 }, 'n1'), e1 = v1.A.lacEdgeT;
  o += sub(v1, xs[0], y0, cw, ch, 'n1');
  ex += lab('凹口（示意）', 'notch', xs[0] + cw - 8, y0 + 40, off(v1.P([0, CORONAL.Uy(0) + LP.notch]), xs[0], y0), { side: 'R', bold: true, color: COL.red, lc: COL.red });
  o += `<g opacity="${T.on(1)}">${text(xs[0] + 8, y0 + ch + 26, '最常見：6.5%（Schafer 2026）；兒童 4%', { size: 15, bold: true })}</g>`;
  o += `<g opacity="${T.on(2)}">${text(xs[0] + 8, y0 + ch + 50, '預防：張力交給 tarsus、瞼緣外翻', { size: 15, color: COL.accent, bold: true })}</g>`;
  o += `<g opacity="${T.on(3)}">${htext(xs[0] + 10, y0 + ch - 12, '小的凹口：追蹤 3–6 個月', { size: 15, bold: true })}</g>`;
  // ② wound face: a full-thickness tarsal bite with the knot against the eye, a loose silk tail (示意); then zoom out: do not suture the septum
  const z = T.p(7, 0, 0.7), w2 = VIEWS.zwin({ x: -17.8, y: -9.6, w: 9.5 }, { x: -22, y: -19.5, w: 15 }, z, cw, ch), v2 = VIEWS.sag({}, cw, ch, w2, 'n2'), fb = LG.fullBite(3.5);
  const s2 = v2.svg + `<g opacity="${1 - z}">${curve([v2.P(fb.a), v2.P(fb.knot)], COL.red, 3, 1, '6 4')}${dot(v2.P(fb.knot), COL.red, 6)}${curve(LG.tailLoose().map(v2.P), COL.red, 2.4, T.on(4, 0.6, 1), '5 4')}</g>`
    + `<g opacity="${T.on(8, 0.6)}">${curve([v2.P(LID.UF.at(9.4, LAC.U.tar + 0.2)), v2.P(v2.M.septum)], COL.red, 3, 1, '7 5')}</g>`;
  o += sub({ svg: s2 }, xs[1], y0, cw, ch, 'n2');
  ex += lab('× 穿到後表面，線結對著角膜', 'full-thickness bite', xs[1] + cw - 8, y0 + 40, off(v2.P(fb.knot), xs[1], y0), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: (1 - z) * T.on(4) });
  ex += lab('× silk 線尾沒埋', 'loose tail', xs[1] + cw - 8, y0 + ch - 14, off(v2.P(LG.tailLoose()[3]), xs[1], y0), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: (1 - z) * T.on(4, 0.6, 1) });
  ex += lab('不要縫 septum', "don't suture the septum", xs[1] + 12, y0 + 40, off(v2.P(v2.M.septum), xs[1], y0), { bold: true, color: COL.red, lc: COL.red, op: T.on(7, 0.6, 0.6) });
  ex += lab('× tarsus 與眶緣之間的深層線（示意）', 'deep suture', xs[1] + 12, y0 + ch - 14, off(v2.P(mid(LID.UF.at(9.4, LAC.U.tar + 0.2), v2.M.septum)), xs[1], y0), { bold: true, color: COL.red, lc: COL.red, op: T.on(8, 0.6) });
  o += `<g opacity="${T.on(5)}">${text(xs[1] + 8, y0 + ch + 26, '縫線刺激角膜：3.3%（Schafer 2026）', { size: 15, bold: true })}</g>`;
  // ③ coronal, medial lids: the zone medial to the puncta (示意)
  const v3 = VLAC.cor({}, cw, ch, { x: 1, y: -6, w: 16 }, 'n3');
  const s3 = v3.svg + medialZone(v3, 'upper', 1) + medialZone(v3, 'lower', 1) + punctaSvg(v3, 1);
  o += sub({ svg: s3 }, xs[2], y0, cw, ch, 'n3');
  ex += lab('punctum 內側：一定先探查', 'probe first', xs[2] + cw - 8, y0 + ch - 14, off(v3.P([11.4, CORONAL.Ly(11.4) + 1.5]), xs[2], y0), { side: 'R', bold: true, color: COL.amber, lc: COL.amber });
  ex += lab('淚小點（示意）', 'puncta', xs[2] + 12, y0 + 40, off(v3.P(LG.puncta()[0]), xs[2], y0), {});
  o += `<g opacity="${T.on(6)}">${text(xs[2] + 8, y0 + ch + 26, '術後流淚：5.9%（Schafer 2026）', { size: 15, bold: true })}</g>`;
  return { F: { svg: o, extra: ex, P: { title: '三個常見的錯（畫面為示意）', orient: '' } } };
};

// ---------------------------------------------------------------- 6 下眼瞼哪裡不同
DRAW2['6'] = T => {
  const L = VLAC.lsag({}, PW, PH, { x: -16.2, y: 2.4, w: 12 }, 'lL'), A = L.A, [t0, t1] = LG.lowerTar().map(L.P);
  const dm = T.on(1, 0.6), b = LP.tarLower.map(s => L.P(LG.lowerBite(s))), n1 = T.on(2, 0.5), n2 = T.on(3, 0.5, 0.8), tied = T.on(3, 0.6, 2.2);
  let sl = L.svg + `<g opacity="${dm}">${VIEWS.dim(t0, t1, COL.accent, 1)}</g>`;   // along the posterior (conjunctival) surface of the tarsus
  sl += dot(b[0], LAC.C.vic, 6, n1, '#4a2063') + dot(b[1], LAC.C.vic, 6, n2, '#4a2063') + ring(b[0], COL.amber, 12, n2 * (1 - tied));
  const up = T.on(6, 0.6) * (1 - T.on(8, 0.4));
  sl += `<g opacity="${up}">${arrow(L.P([-13.6, 9.0]), L.P([-13.7, 6.4]), COL.accent, 1, 'arrA', 4)}</g>`;
  let el = lab('下瞼板 4.12 mm', 'lower tarsus', PW - 12, 40, mid(t0, t1), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: dm });
  el += lab('tarsal sutures ×2（高度示意）', 'two bites', 14, 380, b[1], { bold: true, color: '#5b2a7a', lc: '#5b2a7a', op: n2 });
  el += lab('第一針先不綁（EyeRounds）', 'first left untied', 14, 40, b[0], { bold: true, color: COL.amber, lc: COL.amber, op: n2 * (1 - tied) });
  el += lab('綁好兩針：瞼緣回到原位', 'both tied', 14, 40, b[0], { bold: true, color: COL.accent, lc: COL.accent, op: tied * (1 - T.on(4, 0.4)) });
  el += lab('下瞼緣', 'lower lid margin', 14, 92, A.marginL, { op: 1 - dm * 0.0 });
  el += lab('縫時往上提', 'lift the lid while suturing', PW - 12, 380, L.P([-13.65, 8.0]), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: up });
  // right: medial lower lid, the lower punctum and canaliculus (示意); the lid lifted while suturing
  const R = VLAC.lcor({}, PW, PH, { x: 0, y: -3.5, w: 17 }, 'lR'), c = T.on(4, 0.6);
  let sr = R.svg + medialZone(R, 'lower', c) + canal(R, 'lower', c) + punctaSvg(R, 1, ['upper', 'lower']);
  sr += `<g opacity="${up}">${arrow(R.P([5, CORONAL.Ly(5) + 2.4]), R.P([5, CORONAL.Ly(5) + 0.6]), COL.accent, 1, 'arrA', 4)}${arrow(R.P([9, CORONAL.Ly(9) + 2.4]), R.P([9, CORONAL.Ly(9) + 0.6]), COL.accent, 1, 'arrA', 4)}</g>`;
  let er = lab('下淚小點（示意）', 'lower punctum', 14, 250, R.P(LG.puncta()[1]), { bold: true });
  er += lab('下淚小管：比較常受傷', 'lower canaliculus', PW - 12, 380, R.P([12.2, CORONAL.Ly(12.2) + 1.0]), { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: c });
  er += lab('疤痕往下拉 → 縫時往上提', 'scar pulls down', 14, 380, R.P([5, CORONAL.Ly(5) + 2.0]), { bold: true, color: COL.accent, lc: COL.accent, op: up });
  er += tag('垂直張力：frost suture 或暫時 tarsorrhaphy', T.on(7) * (1 - T.on(8, 0.4)), COL.ink, 30, PW / 2, 15.5);
  er += tag('levator：下眼瞼不用評估', T.on(8), COL.ink, 30, PW / 2, 15.5);
  return { L: { svg: sl, extra: el, P: LSAG_P }, R: { svg: sr, extra: er, P: LCOR_P } };
};

// ---------------------------------------------------------------- 7 術後
DRAW2['7'] = T => {
  // time axis in days (0–14 linear), then a break to months
  const X = d => 120 + d * 56, y = 150, o = [];
  o.push(`<path d="M${X(0)} ${y}H${X(14)}M${X(14) + 30} ${y}H${FW - 60}" stroke="${COL.ink}" stroke-width="2.4"/><path d="M${X(14) + 6} ${y + 10}l12 -20M${X(14) + 18} ${y + 10}l12 -20" stroke="${COL.ink}" stroke-width="2"/>`);
  for (const [d, s, op] of [[0, '今天', 1], [7, '一週', T.on(3)], [10, '10 天', T.on(4)]]) o.push(`<g opacity="${op}"><path d="M${X(d)} ${y}v10" stroke="${COL.ink}" stroke-width="2"/>${text(X(d), y + 32, s, { size: 15.5, bold: true, anchor: 'middle' })}</g>`);
  o.push(`<g opacity="${T.on(0)}">${text(X(0) - 10, y - 92, '傷口塗 erythromycin 眼藥膏，一天三次', { size: 16.5, bold: true })}</g>`);
  o.push(`<g opacity="${T.on(1)}">${text(X(0) - 10, y - 64, '污染、咬傷、異物：口服抗生素（例 amoxicillin/clavulanate 875/125 mg 一天兩次）', { size: 15.5 })}</g>`);
  o.push(`<g opacity="${T.on(2)}">${text(X(0) - 10, y - 38, '依情況：tetanus、評估 rabies', { size: 15.5 })}</g>`);
  o.push(`<g opacity="${T.on(3)}">${dot([X(7), y], COL.accent, 8)}${text(X(7), y + 58, '回診（EyeRounds 示範）', { size: 14.5, anchor: 'middle', color: COL.accent, bold: true })}</g>`);
  o.push(`<g opacity="${T.on(4)}"><rect x="${X(0)}" y="${y - 7}" width="${X(10) - X(0)}" height="14" rx="5" fill="${COL.accent}" opacity="0.25"/>${text(X(10), y + 80, '10 天內回 oculoplastic 門診（急診指南）', { size: 14.5, anchor: 'middle', color: COL.accent })}</g>`);
  const bar = (i, a, b, col, s, op) => { const yy = y + 116 + i * 38; return `<g opacity="${op}"><rect x="${X(a)}" y="${yy - 16}" width="${X(b) - X(a)}" height="22" rx="5" fill="${col}" opacity="0.85"/>${text(X(b) + 12, yy + 1, s, { size: 15.5, bold: true })}</g>`; };
  o.push(bar(0, 4, 7, COL.amber, '拆線：眼瞼皮膚 4–7 天', T.on(5)));
  o.push(bar(1, 5, 10, COL.red, '眼周皮膚、瞼緣 5–10 天', T.on(5, 0.6, 1.2)));
  o.push(`<g opacity="${T.on(6)}">${text(X(0) - 10, y + 116 + 2 * 38 + 1, '吸收線：不用拆', { size: 15.5, bold: true, color: COL.sub })}</g>`);
  const mx = X(14) + 50, mw = FW - 60 - mx;
  o.push(`<g opacity="${T.on(7)}"><rect x="${mx}" y="${y - 12}" width="${mw}" height="24" rx="6" fill="${COL.purple}" opacity="0.8"/>${text(mx + mw / 2, y + 5, '6–12 個月：疤痕成熟', { size: 15.5, bold: true, color: '#fff', anchor: 'middle' })}</g>`);
  o.push(`<g opacity="${T.on(8)}">${text(mx + mw / 2, y + 44, '避免直接日曬；癒合後按摩', { size: 15, anchor: 'middle' })}</g>`);
  return { F: { svg: o.join(''), extra: '', P: { title: '術後（時間軸在兩週後縮短）', orient: '' } } };
};

// ---------------------------------------------------------------- 8 值班清單
DRAW2['8'] = T => {
  const items = [['先查眼球；問機轉、時間、tetanus；懷疑穿入傷或異物 → 先照 CT', 1], ['看到脂肪、punctum 內側的傷、levator 或 canthal tendon 受傷、不能配合 → 轉', 2],
    ['先對齊 gray line', 3], ['張力交給 partial-thickness 的 tarsal sutures', 3], ['瞼緣縫完微微外翻', 4], ['silk 線尾埋進皮膚縫線', 4], ['術後：藥膏、約一週回診、照縫線種類拆線', 5]];
  let hl = -1; items.forEach(([, li], i) => { if (T.on(li, 0.3) > 0.5) hl = i; });
  const rows = items.map(([s, li], i) => [`${'①②③④⑤⑥⑦'[i]} ${s}`, { size: 17.5, bold: i === hl, op: 0.3 + 0.7 * T.on(li, 0.4) }]);
  return { F: { svg: infoCard(30, 14, FW - 60, rows, 1, { lh: 50, hl }), extra: '', P: { title: '值班清單', orient: '' } } };
};
