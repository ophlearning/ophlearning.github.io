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
