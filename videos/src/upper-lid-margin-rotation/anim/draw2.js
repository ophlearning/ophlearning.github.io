// ============================================================================
// Redo: new drawing for each segment, keyed by segment id. Text (lines, keys, src) stays in segments.js and is not touched.
// Each function gets the timing helper T and returns { L, R } (dual) or { F } (full): { svg, extra, P: {title, orient} }.
// Panels are W×H = PW×PH px (see video2.html).
// ============================================================================
const PW = 606, PH = 410;
const SAG_T = { title: '矢狀切面（中央）sagittal', orient: '左＝前　上＝上' };
const COR_T = { title: '正面　右眼 OD　coronal', orient: '檢查者面對病人：左＝temporal　右＝nasal' };
const EV_T = { title: '翻開上眼瞼　右眼 OD　everted', orient: '瞼緣翻到上方　左＝temporal　右＝nasal' };
const SAG_WIN = { x: -20.2, y: -12.3, w: 16.4 }, EV_WIN = { x: -17.5, y: -15.9, w: 33 };
const DRAW2 = {};
// text with a white halo, readable over the drawing
const htext = (x, y, s, o = {}) => text(x, y, s, o).replace('<text ', '<text stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round" ');

DRAW2['4-4'] = T => {
  const k1 = ss(T.st(0) + 0.6, T.en(1) - 0.4, T.u), k2 = ss(T.st(3) + 0.4, T.en(3) + 0.6, T.u);
  const S = { curl: 1, cut: 1, plane: 1, suture: 1, k: k1, over: 8 * k2, tuck: 0.7 * k1 + 0.3 * k2, scar: 0.6 };
  const C = { evert: -1 + k1 + 0.45 * k2, incision: 1, sutures: 1, tight: k1 };
  const sv = VIEWS.sag(S, PW, PH, { x: -20.2, y: -12.3, w: 16.4 }, 'sL'), A = sv.A;
  const cv = VIEWS.cor(C, PW, PH, { x: -17.5, y: -13.2, w: 33 }, 'cR'), B = cv.A;
  const lab = VIEWS.lab2;
  const away = T.on(1) * (1 - T.on(2)), wedge = T.on(2) * (1 - T.on(3)), over = ss(T.en(3) - 0.2, T.en(3) + 0.6, T.u);
  let ex = '';
  ex += lab('上方那片瞼板', 'upper tarsus', PW - 12, 44, A.upper, { side: 'R', bold: true });
  ex += lab('瞼緣側那片瞼板', 'marginal strip', PW - 12, 300, A.strip, { side: 'R', bold: true });
  ex += lab('縫線', 'suture', 14, 200, A.suture, { color: COL.suture, bold: true });
  ex += lab('睫毛', 'eyelashes', 14, 330, A.lash);
  ex += lab('角膜', 'cornea', PW - 12, 392, sv.P([-12.75, -2.2]), { side: 'R' });
  ex += `<g opacity="${wedge}"><circle cx="${A.wedge[0]}" cy="${A.wedge[1]}" r="26" fill="none" stroke="${COL.accent}" stroke-width="2.6" stroke-dasharray="6 5"/></g>`;
  ex += lab('楔子：持續往外推', 'wedge', PW - 12, 120, [A.wedge[0] + 18, A.wedge[1] - 18], { side: 'R', color: COL.accent, bold: true, op: wedge });
  ex += htext(PW / 2, 34, '睫毛離開角膜', { size: 18, bold: true, color: COL.accent, anchor: 'middle', op: away }) + htext(PW / 2, 34, '輕微過度矯正', { size: 18, bold: true, color: COL.accent, anchor: 'middle', op: over });
  let rx = lab('三組縫線', 'sutures', 14, 34, B.suture, { color: COL.suture, bold: true });
  rx += lab('切口（結膜面）', 'incision', PW - 12, 34, B.incision, { side: 'R', color: COL.red, bold: true });
  const b1 = ss(T.st(5) + 0.3, T.st(5) + 1.5, T.u), b2 = ss(T.st(6), T.st(6) + 1.0, T.u), bo = T.on(5);
  rx += `<g opacity="${bo}" transform="translate(12 ${PH - 128})"><rect width="300" height="116" rx="8" fill="#fff" stroke="#d3dae1"/>${text(16, 26, '術後倒睫 trichiasis（PLTR）', { size: 14.5, bold: true, color: COL.sub })}
    ${text(16, 62, '中央矯正不足', { size: 14.5 })}<rect x="120" y="50" width="${120 * b1}" height="16" rx="3" fill="#d9645f"/>${text(290, 64, '36.4%', { size: 14.5, bold: true, anchor: 'end', op: b1 })}
    ${text(16, 98, '矯正足夠', { size: 14.5 })}<rect x="120" y="86" width="${41 * b2}" height="16" rx="3" fill="${COL.accent}"/>${text(290, 100, '12.5%', { size: 14.5, bold: true, anchor: 'end', op: b2 })}</g>`;
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: cv.svg, extra: rx, P: COR_T } };
};

DRAW2['4-1'] = T => {
  const cut = T.p(0, 0.4, 1) * 0.5 + T.p(1, 0, 0.8) * 0.5;
  const sv = VIEWS.sag({ curl: 1, cut, scar: 0.6 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const evv = VIEWS.ev({ scar: 0.35, incision: cut, ends: T.on(3) * (1 - T.on(4)), lenArrow: T.on(4) }, PW, PH, EV_WIN, 'eR'), B = evv.A;
  const lab = VIEWS.lab2;
  let ex = lab('切口：離瞼緣 3 mm，只切後層', 'incision', PW - 12, 44, A.cut, { side: 'R', color: COL.red, bold: true, op: T.on(0) });
  ex += lab('瞼板', 'tarsus', PW - 12, 300, A.strip, { side: 'R', bold: true });
  ex += lab('睫毛', 'eyelashes', 14, 330, A.lash) + lab('角膜', 'cornea', PW - 12, 392, sv.P([-12.75, -2.2]), { side: 'R' });
  let rx = lab('瞼緣', 'lid margin', 14, 34, B.evMargin, { bold: true });
  rx += lab('瞼板結膜', 'tarsal conjunctiva', 14, 250, B.evConj);
  rx += lab('切口：離瞼緣 3 mm，平行', 'incision', PW - 12, 34, B.evIncTip || B.evEndL, { side: 'R', color: COL.red, bold: true, op: T.on(0) * (1 - T.on(3)) });
  rx += lab('內外兩端用剪刀補完', 'scissors', PW - 12, 34, B.evEndR, { side: 'R', color: COL.amber, bold: true, op: T.on(3) * (1 - T.on(4)) });
  rx += lab('總長 ≥ 20 mm（建議）', 'length', PW - 12, PH - 20, B.evLen, { side: 'R', color: COL.accent, bold: true, op: T.on(4) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: evv.svg, extra: rx, P: EV_T } };
};

DRAW2['4-2'] = T => {
  const sv = VIEWS.sag({ curl: 1, cut: 1, plane: T.p(0, 0.3, 1), scar: 0.6 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const evv = VIEWS.ev({ scar: 0.35, incision: 1, ends: T.on(2) }, PW, PH, EV_WIN, 'eR'), B = evv.A;
  const lab = VIEWS.lab2;
  let ex = lab('分離出的空間', 'dissection plane', 14, 56, A.plane, { color: COL.accent, bold: true, op: T.on(0, 0.6, 1.5) });
  ex += lab('上方那片瞼板', 'upper tarsus', PW - 12, 44, A.upper, { side: 'R', bold: true }) + lab('瞼緣側那片瞼板', 'marginal strip', PW - 12, 300, A.strip, { side: 'R', bold: true });
  ex += lab('前層', 'anterior lamella', 14, 110, sv.P(LID.draw({ state: { curl: 1, cut: 1 } }).DA.at(2.6, 1.8)), { op: T.on(0, 0.6, 1.5) });
  let rx = lab('周邊做到位', 'periphery', 14, 34, B.evEndL, { color: COL.amber, bold: true, op: T.on(2) }) + lab('周邊做到位', 'periphery', PW - 12, 34, B.evEndR, { side: 'R', color: COL.amber, bold: true, op: T.on(2) });
  rx += lab('切口', 'incision', PW - 12, PH - 20, B.evCentre, { side: 'R', color: COL.red, bold: true });
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: evv.svg, extra: rx, P: EV_T } };
};

DRAW2['4-3'] = T => {
  const sp = T.p(1, 0.1, 0.9);
  const sv = VIEWS.sag({ curl: 1, cut: 1, plane: 1, suture: sp, scar: 0.6 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ evert: -1, tarsus: 1, incision: 1, sutures: T.on(1, 0.8, 0.4), spacing: T.on(4) }, PW, PH, { x: -17.5, y: -13.2, w: 33 }, 'cR'), B = cv.A;
  const lab = VIEWS.lab2;
  let ex = lab('上方那片瞼板（切緣進針）', 'upper tarsus', PW - 12, 44, A.upper, { side: 'R', bold: true });
  ex += lab('瞼緣側那片瞼板', 'marginal strip', PW - 12, 300, A.strip, { side: 'R', bold: true });
  if (A.suture) ex += lab('縫線', 'suture', 14, 200, A.suture, { color: COL.suture, bold: true, op: T.on(1) });
  if (A.sutureExit) ex += lab('睫毛線正上方出針', 'exit', 14, 250, A.sutureExit, { color: COL.suture, op: ss(T.en(1) - 0.6, T.en(1), T.u) });
  ex += htext(PW - 12, PH - 34, '縫線中段走法為示意', { size: 13, color: COL.sub, anchor: 'end', op: T.on(1) }) + htext(PW - 12, PH - 16, '（文獻只寫起點與出口）', { size: 13, color: COL.sub, anchor: 'end', op: T.on(1) });
  let rx = lab('三組縫線', 'sutures', 14, 34, B.suture, { color: COL.suture, bold: true, op: T.on(1) });
  rx += lab('切口（結膜面）', 'incision', PW - 12, 34, B.incision, { side: 'R', color: COL.red, bold: true });
  rx += lab('瞼板範圍', 'tarsus', PW - 12, 72, B.tarsusOutline, { side: 'R', op: 1 - T.on(4) });
  rx += lab('間距對稱：差 ≤ 2 mm', 'symmetric spacing', 14, PH - 20, B.spacing, { color: COL.accent, bold: true, op: T.on(4) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: cv.svg, extra: rx, P: COR_T } };
};

DRAW2['6-1'] = T => {
  const sv = VIEWS.sag({ curl: 1, bltr: T.p(0, 0.3, 1), scar: 0.6 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ evert: -1, skinCut: T.p(0, 0.3, 1), skinBleed: T.on(2) }, PW, PH, { x: -17.5, y: -13.2, w: 33 }, 'cR'), B = cv.A;
  const lab = VIEWS.lab2;
  let ex = lab('BLTR：全層切開，皮膚 → 結膜', 'full thickness', PW - 12, 44, A.bltrMid, { side: 'R', color: COL.red, bold: true, op: T.on(0) });
  ex += lab('PLTR 只切這一段（結膜＋瞼板）', 'PLTR', PW - 12, 300, A.postCut, { side: 'R', color: COL.sub, bold: true, op: T.on(0, 0.6, 0.8) });
  ex += lab('兩層之間不分離', 'no dissection', 14, 200, A.strip, { color: COL.red, bold: true, op: T.on(1) });
  ex += lab('睫毛', 'eyelashes', 14, 330, A.lash) + lab('角膜', 'cornea', PW - 12, 392, sv.P([-12.75, -2.2]), { side: 'R' });
  let rx = lab('皮膚切口：離瞼緣 3 mm', 'skin incision', PW - 12, 34, B.skinCut, { side: 'R', color: COL.red, bold: true, op: T.on(0) });
  rx += lab('出血較多', 'more bleeding', 14, PH - 20, B.skinBleed, { color: '#a1271b', bold: true, op: T.on(2) });
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: cv.svg, extra: rx, P: COR_T } };
};

DRAW2['6-2'] = T => {
  const crease = T.p(0, 0.5, 1), flap = T.on(1, 1.2) * (1 - T.on(4, 1.2)), cut = T.p(2, 0.2, 0.9), sut = T.p(3, 0.1, 0.5), fix = T.on(3, 1.5);   // flap laid back during line 4
  const sv = VIEWS.sag({ curl: lerp(1, 0.25, fix), crease, flap, cut, suture: sut, buried: true, scar: 0.6 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ evert: lerp(-1, 0, fix), crease, flap, incision: cut * flap, buried: T.on(3) * flap }, PW, PH, { x: -17.5, y: -13.2, w: 33 }, 'cR'), B = cv.A;
  const lab = VIEWS.lab2;
  let ex = '';
  if (A.creaseCut) ex += lab('lid crease 切口（單眼皮：高度依術者設計，示意）', 'crease', PW - 12, 44, A.creaseCut, { side: 'R', color: COL.red, bold: true, size: 14, op: T.on(0) * (1 - T.on(2)) });
  ex += lab('皮膚肌肉瓣', 'skin–muscle flap', 14, 120, A.flap, { color: COL.accent, bold: true, op: T.on(1) * (1 - T.on(3)) });
  if (A.exposedTarsus) ex += lab('露出瞼板', 'tarsus exposed', PW - 12, 300, A.exposedTarsus, { side: 'R', bold: true, op: T.on(1) * (1 - T.on(2)) });
  if (A.cut) ex += lab('結膜面切穿瞼板（離瞼緣 3 mm）', 'incision', PW - 12, 300, A.cut, { side: 'R', color: COL.red, bold: true, op: T.on(2) * (1 - T.on(3)) });
  if (A.suture) ex += lab('6-0 Vicryl 埋線', 'buried suture', PW - 12, 300, A.suture, { side: 'R', color: COL.suture, bold: true, op: T.on(3) });
  let rx = '';
  if (B.crease) rx += lab('預定雙眼皮線（示意）', 'planned crease', 14, 34, B.crease, { color: COL.red, bold: true, op: T.on(0) * (1 - T.on(2)) });
  if (B.flapEdge) rx += lab('往下翻的皮膚肌肉瓣', 'flap', 14, PH - 20, B.flapEdge, { color: COL.accent, bold: true, op: T.on(1) * (1 - T.on(4)) });
  if (B.exposed) rx += lab('露出瞼板', 'tarsus exposed', PW - 12, 34, B.exposed, { side: 'R', bold: true, op: T.on(1) * (1 - T.on(3)) });
  if (B.buried) rx += lab('埋線：不出皮膚、不必拆線', 'buried', PW - 12, 34, B.buried, { side: 'R', color: COL.suture, bold: true, op: T.on(3) * (1 - T.on(4)) });
  const o4 = T.on(4) * (1 - T.on(5)), o5 = T.on(5);
  rx += `<g opacity="${o4}" transform="translate(12 10)"><rect width="330" height="74" rx="8" fill="#fff" stroke="#d3dae1"/>${text(16, 28, '同一個切口還可以順便處理', { size: 15, bold: true, color: COL.accent })}${text(16, 56, 'ptosis、眼瞼退縮、皮膚鬆弛', { size: 15 })}</g>`;
  rx += `<g opacity="${o5}" transform="translate(12 ${PH - 66})"><rect width="${PW - 24}" height="54" rx="8" fill="#fff4e5" stroke="${COL.amber}"/>${text(16, 34, '60 片眼瞼、平均追蹤 3 個月：1 片內側睫毛碰角膜', { size: 16, bold: true, color: COL.amber })}</g>`;
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: cv.svg, extra: rx, P: COR_T } };
};

// ---------------------------------------------------------------- chapter 1 (clinical decision)
const COR_WIN = { x: -17.5, y: -13.2, w: 33 };
// margin close-ups (5 mm wide): entropion lid and normal lid; centres from the model (lash base → posterior corner)
const EZ_WIN = { x: -15.3, y: -6.0, w: 5 }, NZ_WIN = { x: -15.3, y: -6.3, w: 5 };
// camera between two windows: width zooms geometrically, centre moves linearly
const zwin = (a, b, z) => { const r = PH / PW, w = Math.exp(lerp(Math.log(a.w), Math.log(b.w), z)), cx = lerp(a.x + a.w / 2, b.x + b.w / 2, z), cy = lerp(a.y + a.w * r / 2, b.y + b.w * r / 2, z);
  return { x: cx - w / 2, y: cy - w * r / 2, w }; };
// dashed box showing where the close-up is, drawn through the current camera (it grows into the panel as the camera zooms)
const zbox = (sv, b, op) => { const p = sv.P([b.x, b.y]), q = sv.P([b.x + b.w, b.y + b.w * PH / PW]);
  return `<rect x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" width="${(q[0] - p[0]).toFixed(1)}" height="${(q[1] - p[1]).toFixed(1)}" fill="none" stroke="${COL.accent}" stroke-width="2.4" stroke-dasharray="7 5" opacity="${op}"/>`; };
// 1 mm scale bar (bottom left)
const sbar = (k, op) => `<g opacity="${op}"><rect x="14" y="${PH - 46}" width="${(k + 12).toFixed(1)}" height="34" rx="5" fill="#fff" opacity="0.85"/><path d="M20 ${PH - 20}h${k.toFixed(1)}" stroke="${COL.ink}" stroke-width="3"/>${text(20 + k / 2, PH - 27, '1 mm', { size: 13, bold: true, anchor: 'middle' })}</g>`;
const amberTag = (s, op, col = COL.amber) => htext(PW / 2, 34, s, { size: 18, bold: true, color: col, anchor: 'middle', op });

DRAW2['1-1'] = T => {
  const ent = T.on(1) * (1 - T.on(2)) + T.on(4) * (1 - T.on(5));
  const mis = T.on(2) * (1 - T.on(3)) + T.on(5), meta = T.on(3) * (1 - T.on(4));
  const sv = VIEWS.sag({ curl: ent, misdirected: mis, metaplastic: meta }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const cv = VIEWS.cor({ evert: -ent, misdirected: mis, metaplastic: meta }, PW, PH, COR_WIN, 'cR'), B = cv.A;
  const lab = VIEWS.lab2;
  let ex = amberTag('睫毛碰到眼睛：三種機轉', 1 - T.on(1), COL.accent);
  ex += amberTag('① 瞼內翻 entropion：整個瞼緣往內轉', T.on(1) * (1 - T.on(2)));
  ex += amberTag('② 方向歪的睫毛 misdirected lashes', T.on(2) * (1 - T.on(3)));
  ex += amberTag('③ 化生睫毛 metaplastic lashes', T.on(3) * (1 - T.on(4)));
  ex += amberTag('margin rotation 只處理 ① entropion', T.on(4) * (1 - T.on(5)), COL.accent);
  ex += amberTag('瞼緣正常、幾根歪睫毛 → 破壞毛囊', T.on(5), COL.accent);
  ex += lab('睫毛', 'eyelashes', 14, 330, A.lash, { op: Math.max(0, 1 - mis - meta) });
  ex += lab('角膜', 'cornea', PW - 12, 392, sv.P([-12.75, -2.2]), { side: 'R' });
  if (A.misLash) ex += lab('睫毛線正常、方向往後', 'misdirected', 14, 250, A.misLash, { color: COL.amber, bold: true, op: mis });
  if (A.metaLash) ex += lab('從瞼板腺開口長出', 'metaplastic', 14, 250, A.metaLash, { color: COL.amber, bold: true, op: meta });
  let rx = lab('睫毛被帶進去、碰到角膜', 'entropion', 14, 34, B.lashMid, { color: COL.amber, bold: true, op: ent });
  if (B.misLash) rx += lab('方向歪的睫毛', 'misdirected', 14, 34, B.misLash, { color: COL.amber, bold: true, op: mis });
  if (B.metaLash) rx += lab('化生睫毛：從後瞼緣長出', 'metaplastic', PW - 12, 34, B.metaLash, { side: 'R', color: COL.amber, bold: true, op: meta });
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: cv.svg, extra: rx, P: COR_T } };
};

DRAW2['1-2'] = T => {
  const zoom = T.on(1, 1.0, 0.6) * (1 - T.on(7, 1.0));
  const round = T.on(1, 1.0, 1.6), scar = lerp(0.15, 1, T.p(3, 0.3, 0.9));
  const sv = VIEWS.sag({ curl: 1, round, scar, mcj: T.on(4), mcjShift: T.on(6, 1.2) }, PW, PH, zwin(SAG_WIN, EZ_WIN, zoom), 'sL'), A = sv.A;
  const lab = VIEWS.lab2, zin = ss(0.85, 1, zoom), zout = 1 - zin;
  let ex = zbox(sv, EZ_WIN, (1 - ss(0.75, 1, zoom)) * (T.on(1, 0.4) * (1 - T.on(2)) + T.on(7, 0.3) * (1 - T.on(7, 0.5, 1.6))));
  ex += sbar(sv.k, ss(0.6, 1, zoom));
  ex += lab('瞼緣內轉', 'entropion', 14, 330, A.lash, { color: COL.amber, bold: true, op: zout * (1 - T.on(1)) });
  ex += lab('角膜', 'cornea', PW - 12, 392, sv.P([-12.75, -2.2]), { side: 'R', op: zout * (1 - T.on(1)) });
  ex += lab('後瞼緣邊角變圓', 'rounded posterior margin', PW - 12, 60, A.postMargin, { side: 'R', color: COL.amber, bold: true, op: zin * T.on(1, 0.6, 1.8) * (1 - T.on(2, 0.4)) });
  const scarP = sv.P(LID.draw({ state: { curl: 1 } }).DP.at(1.42, 0.03));
  ex += lab('結膜疤痕', 'conjunctival scar', PW - 12, 60, scarP, { side: 'R', color: COL.red, bold: true, op: zin * T.on(2) * (1 - T.on(4)) });
  ex += lab('皮膚結膜交界', 'MCJ', PW - 12, 60, A.mcj, { side: 'R', color: COL.accent, bold: true, op: zin * T.on(4) });
  ex += lab('瞼板腺開口', 'meibomian orifice', PW - 12, PH - 64, A.orifice, { side: 'R', color: '#9c7a20', bold: true, op: zin * T.on(5) });
  ex += amberTag('交界線被拉到開口前面', zin * T.on(6, 0.6, 1.2), COL.accent);
  ex += lab('瞼緣內轉', 'entropion', 14, 330, A.lash, { color: COL.amber, bold: true, op: zout * T.on(7) });
  ex += lab('邊角變圓', 'rounding', PW - 12, 300, A.postMargin, { side: 'R', color: COL.amber, bold: true, op: zout * T.on(8) });   // recap of the three checks
  ex += lab('交界線前移', 'MCJ shift', PW - 12, 340, A.mcj, { side: 'R', color: COL.accent, bold: true, op: zout * T.on(8) });
  // right: skin side → everted lid (scar) → normal margin close-up for comparison → skin side
  const ev = T.on(2, 0.8) * (1 - T.on(4, 0.8)), nz = T.on(4, 0.8) * (1 - T.on(7, 0.8)), co = Math.max(0, 1 - ev - nz);
  let rsvg = '', rx = '';
  if (co > 0.01) { const cv = VIEWS.cor({ evert: -1 }, PW, PH, COR_WIN, 'cR'), B = cv.A; rsvg += `<g opacity="${co}">${cv.svg}</g>`;
    rx += lab('睫毛碰到角膜', 'lashes on cornea', 14, 34, B.lashMid, { color: COL.amber, bold: true, op: co * (1 - T.on(7)) });
    rx += lab('常被當成單純倒睫', 'trichiasis', 14, 34, B.lashMid, { color: COL.amber, bold: true, op: co * T.on(7) }); }
  if (ev > 0.01) { const evv = VIEWS.ev({ scar }, PW, PH, EV_WIN, 'eR'), B = evv.A; rsvg += `<g opacity="${ev}">${evv.svg}</g>`;
    rx += lab('瞼緣', 'lid margin', 14, 34, B.evMargin, { op: ev }) + lab('瞼板結膜的疤痕', 'tarsal conjunctival scar', PW - 12, 300, B.evConj, { side: 'R', color: COL.red, bold: true, op: ev }); }
  if (nz > 0.01) { const nv = VIEWS.sag({ mcj: 1 }, PW, PH, NZ_WIN, 'nR'), B = nv.A; rsvg += `<g opacity="${nz}">${nv.svg}</g>`;
    rx += lab('皮膚結膜交界', 'MCJ', PW - 12, 60, B.mcj, { side: 'R', color: COL.accent, bold: true, op: nz });
    rx += lab('瞼板腺開口', 'meibomian orifice', 14, PH - 64, B.orifice, { color: '#9c7a20', bold: true, op: nz * T.on(5) }) + sbar(nv.k, nz); }
  const RP = nz > 0.5 ? { title: '對照：正常瞼緣（放大）normal', orient: '左＝前　上＝上' } : ev > 0.5 ? EV_T : COR_T;
  const LP = zoom > 0.5 ? { title: '矢狀切面　放大：瞼緣 sagittal', orient: '左＝前　上＝上' } : SAG_T;
  return { L: { svg: sv.svg, extra: ex, P: LP }, R: { svg: rsvg, extra: rx, P: RP } };
};

DRAW2['1-3'] = T => {
  const c01 = T.on(0) * (1 - T.on(2)), curl = lerp(0.15, 1, T.p(0, 0.2, 1) * 0.5 + T.p(1, 0, 0.9) * 0.5);
  const sv = VIEWS.sag({ curl, contract: c01, scar: 0.3 + 0.5 * c01 }, PW, PH, SAG_WIN, 'sL'), A = sv.A;
  const lab = VIEWS.lab2;
  let ex = lab('結膜＋瞼板結疤收縮', 'cicatricial contraction', PW - 12, 120, A.contract, { side: 'R', color: COL.red, bold: true, op: c01 });
  ex += lab('瞼緣被拉向眼球', 'pulled in', 14, 330, A.lash, { color: COL.amber, bold: true, op: T.on(1) * (1 - T.on(2)) });
  ex += lab('睫毛', 'eyelashes', 14, 330, A.lash, { op: T.on(2) });
  // right: skin side in sync with the left while the mechanism is told, then the causes card (same text as the published version)
  const co = 1 - T.on(2, 0.8), cv = co > 0.01 ? VIEWS.cor({ evert: -curl }, PW, PH, COR_WIN, 'cR') : null;
  const old = SEGS.find(s => s.id === '1-3').draw(T);
  const rsvg = (cv ? `<g opacity="${co}">${cv.svg}</g>` : '') + old.R.svg;
  const rx = cv ? lab('瞼緣往內轉', 'entropion', 14, 34, cv.A.lashMid, { color: COL.amber, bold: true, op: co * T.on(1) }) : '';
  return { L: { svg: sv.svg, extra: ex, P: SAG_T }, R: { svg: rsvg, extra: rx, P: co > 0.5 ? COR_T : { title: '病因 causes', orient: '' } } };
};

// ---------------------------------------------------------------- chapter 3 (preop)
DRAW2['3-1'] = T => {
  const C = { evert: -1, marks: T.on(0, 0.6, 0.6), spacing: T.on(1), tarsus: 0.5 };
  const cv = VIEWS.cor(C, PW, PH, COR_WIN, 'cL'), A = cv.A;
  const lab = VIEWS.lab2;
  let ex = '';
  if (A.mark) ex += lab('三個標記：外側、中央、內側', 'marks', 14, 34, A.mark, { color: '#5b3fa0', bold: true, op: T.on(0, 0.6, 0.6) });
  let svg = ''; const b1 = ss(T.st(2), T.st(2) + 1.2, T.u), op = T.on(1);
  svg += tblock(30, 40, ['眼瞼輪廓異常比例'], { size: 17, bold: true, op });
  for (const [i, lbl, v, c] of [[0, '間距差 > 2 mm', 52.2, COL.red], [1, '間距對稱', 23.1, COL.accent]]) {
    const y = 80 + i * 90; svg += text(30, y + 22, lbl, { size: 16, op }) + `<rect x="170" y="${y}" width="340" height="34" rx="6" fill="#e6ebef" opacity="${op}"/><rect x="170" y="${y}" width="${340 * v / 100 * b1}" height="34" rx="6" fill="${c}" opacity="${op}"/>` +
      text(520, y + 24, v + '%', { size: 18, bold: true, op: op * b1 }); }
  const o3 = T.on(3); svg += card(30, 268, 546, 60, { op: o3, hl: o3 }) + text(50, 304, '打麻藥前先標記 → 縫線位置不容易跑掉', { size: 17, bold: true, color: COL.accent, op: o3 });
  return { L: { svg: cv.svg, extra: ex, P: COR_T }, R: { svg, P: { title: '縫線間距與眼瞼輪廓異常', orient: 'Habtamu 2017（PLTR）' } } };
};

DRAW2['3-2'] = T => {
  const C = { evert: -1, marks: 1, inject: T.on(0) * (1 - T.on(2)), tarsus: 0.4 };
  const cv = VIEWS.cor(C, PW, PH, COR_WIN, 'cL'), A = cv.A;
  const lab = VIEWS.lab2;
  let ex = '';
  if (A.skinLid) ex += lab('上眼瞼皮下', 'subcutaneous', 14, 34, A.skinLid, { color: '#2a7fb8', bold: true, op: T.on(0) * (1 - T.on(2)) });
  let svg = ''; const o1 = T.on(0), o2 = T.on(1), o3 = T.on(2);
  svg += card(24, 22, 558, 132, { op: o1, hl: o1 * (1 - o3) }) + text(44, 56, '局部麻醉', { size: 18, bold: true, color: COL.accent, op: o1 }) +
    tblock(44, 90, ['lidocaine with adrenaline，上眼瞼皮下 2–3 mL'], { size: 17, op: o1 }) + tblock(44, 124, ['濃度：trial 用過 1% 與 2%，依院內常規'], { size: 16, color: COL.sub, op: o2 });
  svg += card(24, 176, 558, 150, { op: o3, hl: o3 }) + text(44, 210, 'Trabut plate', { size: 18, bold: true, color: COL.accent, op: o3 }) +
    tblock(44, 244, ['PLTR 的特殊器械，trial 裡每一台都用', '（放法以 WHO 手冊為準，本片不圖示）'], { size: 16.5, op: o3 });
  return { L: { svg: cv.svg, extra: ex, P: COR_T }, R: { svg, P: { title: '準備', orient: '' } } };
};

// ---------------------------------------------------------------- chapter 5 (intraop complications)
DRAW2['5'] = T => {
  const E = { scar: 0.35, incision: 1, bleed: T.on(1) * (1 - T.on(2)), notch: T.on(2) * (1 - T.on(3)), incWavy: T.on(3) * (1 - T.on(5)),
    nasalShort: T.on(6) * (1 - T.on(7)), incShort: T.on(7, 0.8), ends: T.on(5) * (1 - T.on(6)) };
  const evv = VIEWS.ev(E, PW, PH, EV_WIN, 'eL'), A = evv.A;
  const lab = VIEWS.lab2;
  let ex = '';
  if (A.evBleed) ex += lab('出血：壓住', 'bleeding', PW - 12, 300, A.evBleed, { side: 'R', color: '#b3122b', bold: true, op: E.bleed });
  if (A.evNotch) ex += lab('切斷瞼緣', 'margin notch', 14, 34, A.evNotch, { color: COL.amber, bold: true, op: E.notch });
  if (A.evCentre) ex += lab('中央切口不規則', 'irregular incision', PW - 12, 300, A.evCentre, { side: 'R', color: COL.red, bold: true, op: E.incWavy });
  if (A.evEndL) ex += lab('周邊睫毛', 'peripheral lashes', 14, 34, A.evEndL, { color: COL.amber, bold: true, op: E.ends });
  if (A.evNasal) ex += lab('鼻側 tarsus 較短', 'nasal tarsus shorter', PW - 12, 34, A.evNasal, { side: 'R', color: COL.amber, bold: true, op: E.nasalShort });
  if (A.evEndR) ex += lab('切口太短：周邊轉不出來', 'too short', PW - 12, 300, A.evEndR, { side: 'R', color: '#5b6878', bold: true, op: E.incShort });
  const items = [['出血', '用力壓住眼瞼幾分鐘', 1], ['切斷瞼緣', '一針 4-0 silk 修補', 2], ['中央切口不規則', 'granuloma OR 6.72', 3], ['周邊睫毛／鼻側', '倒睫 36.4% vs 10%', 5], ['切口太短', '周邊轉不出來', 7]];
  let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
  let svg = '';
  items.forEach(([h, d, li], i) => { const y = 14 + i * 64, op = T.on(li, 0.4) * 0.6 + 0.4 * T.on(0), hl = cur === i ? 1 : 0;
    svg += card(20, y, 566, 56, { op, hl }) + text(40, y + 34, `${i + 1}`, { size: 22, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) + text(76, y + 25, h, { size: 17, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(76, y + 47, d, { size: 14.5, color: COL.sub, op }); });
  return { L: { svg: evv.svg, extra: ex, P: EV_T }, R: { svg, P: { title: '五個狀況', orient: '' } } };
};
