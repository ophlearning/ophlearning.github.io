// ============================================================================
// Redo: new drawing for each segment, keyed by segment id. Text (lines, keys, src) stays in segments.js and is not touched.
// Each function gets the timing helper T and returns { L, R } (dual) or { F } (full): { svg, extra, P: {title, orient} }.
// Panels are W×H = PW×PH px (see video2.html).
// ============================================================================
const PW = 606, PH = 410;
const SAG_T = { title: '矢狀切面（中央）sagittal', orient: '左＝前　上＝上' };
const COR_T = { title: '正面　右眼 OD　coronal', orient: '檢查者面對病人：左＝temporal　右＝nasal' };
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
