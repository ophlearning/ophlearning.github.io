// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual), { F } (full) or { R } (title):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// All pictures come from the posterior-segment model (videos/models/posterior, CARD.md) through anim/views-posterior.js (VP): the same
// 3D left eye OS of the case, seen as a fundus chart (examiner's drawing: 12 up, 3 = temporal on the right), a meridional section through the
// 11 o'clock tear (anterior up, right = 11), a head-position section (gravity down) or the microscope view from above (surgeon at 12).
// Chapter 1 (the map of this operation): 1-1 fundus chart + 11–5 section; 1-2 Lincoff on the chart + the detachment sitting upright;
// 1-3 macula close-up on the chart + section at the fovea (zoom boxes and 1 mm scale bars); 1-4 PVR B (示意) + this case's operation.
// Things without a source in the model (PVR folds, fluid path, gravity-driven spread, trocar clock hours) are labelled 示意 on screen.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const F1 = v => v.toFixed(1);
const pth = (pts, close) => 'M' + pts.map(p => F1(p[0]) + ' ' + F1(p[1])).join('L') + (close ? 'Z' : '');
const note = (s, op, y = PH - 14, x = PW - 12, anchor = 'end') => htext(x, y, s, { size: 13, color: COL.sub, anchor, op });
const arrowP = (pts, col, op, mk = 'arrM', w = 3, dash) => `<path d="${pth(pts)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#${mk})" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const HST = { bold: true, color: '#9c2a1a', lc: '#9c2a1a' };   // label style of the tear
const RDC = COL.suture;                                          // colour of the detachment's annotations (blue arrow marker arrB)

// ---------------------------------------------------------------- fundus chart helpers (v = VP.fundus(...); chart mm → panel px through v.P)
const cpt = (v, h, r) => v.P(VP.chart(h, r));
const arcPts = (v, h0, h1, r, n = 60) => { const out = []; for (let i = 0; i <= n; i++) out.push(cpt(v, h0 + (h1 - h0) * i / n, r)); return out; };
// annular sector between clock hours h0 → h1 (clockwise) and radii r0 < r1 (chart mm)
const annSector = (v, h0, h1, r0, r1) => pth([...arcPts(v, h0, h1, r1), ...arcPts(v, h1, h0, r0)], true);
// hour ticks round the chart and the clock numbers 12, 3 T, 6, N 9 (left eye: 3 temporal, 9 nasal)
function clockRing(v, op = 1) {
  const R = v.M.rEdge; let s = `<g opacity="${op}">`;
  for (let h = 1; h <= 12; h++) { const a = cpt(v, h, R + 0.25), b = cpt(v, h, R + (h % 3 ? 1.0 : 1.6)); s += `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="#24425f" stroke-width="${h % 3 ? 1.2 : 2}"/>`; }
  for (const [h, t] of [[12, '12'], [3, '3 T'], [6, '6'], [9, 'N 9']]) { const q = cpt(v, h, R + 3.1); s += htext(q[0], q[1] + 5, t, { size: 14, bold: true, color: '#24425f', anchor: 'middle' }); }
  return s + '</g>';
}
// the 11–5 section line through the foveola (the section drawn in the other panel)
const secLine = (v, op, R = v.M.rEdge) => { const a = cpt(v, VP.SEC_H, R), b = cpt(v, VP.SEC_H + 6, R); return `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="#1d2733" stroke-width="1.6" stroke-dasharray="7 5" opacity="${op}"/>`; };
// a small whole chart in a box (x, y, size px) with the zoomed window marked; same drawing, ids renamed
function insetChart(v, id, id2, x, y, size, win, op) {
  const R = v.M.rEdge + 0.6, k = size / (2 * R), cx = x + size / 2, cy = y + size / 2, svg = v.r.svg.split(id + '_').join(id2 + '_'), q = p => [cx + p[0] * k, cy + p[1] * k];
  const a = q([win.x, win.y]), b = q([win.x + win.w, win.y + (win.h || win.w * PH / PW)]);
  return `<g opacity="${op}"><rect x="${x - 4}" y="${y - 4}" width="${size + 8}" height="${size + 8}" rx="6" fill="#fff" stroke="#c9d1d9"/><g transform="translate(${cx} ${cy}) scale(${k})">${svg}</g>` +
    `<rect x="${F1(a[0])}" y="${F1(a[1])}" width="${F1(Math.max(4, b[0] - a[0]))}" height="${F1(Math.max(4, b[1] - a[1]))}" fill="none" stroke="${COL.accent}" stroke-width="2.2"/></g>`;
}
// a small whole section (the cached 11–5 section of 1-1) in a box with the zoomed window marked
function insetSec(s, x, y, w, win, op) {
  const tw = VP.WIN.secT, k = w / tw.w, h = tw.h * k, q = p => [x + (p[0] - tw.x) * k, y + (p[1] - tw.y) * k], a = q([win.x, win.y]), b = q([win.x + win.w, win.y + win.h]);
  return `<g opacity="${op}"><rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${F1(h + 8)}" rx="6" fill="#fff" stroke="#c9d1d9"/><g transform="translate(${x} ${y}) scale(${k}) translate(${-tw.x} ${-tw.y})">${s.r.svg}</g>` +
    `<rect x="${F1(a[0])}" y="${F1(a[1])}" width="${F1(b[0] - a[0])}" height="${F1(b[1] - a[1])}" fill="none" stroke="${COL.accent}" stroke-width="2.2"/></g>`;
}
function infoCard(x, y, w, rows, o = {}) {
  const lh = o.lh || 38, h = o.h || 22 + rows.length * lh;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="#d3dae1"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 32 + i * lh, t, { size: ro.size || 16, bold: ro.bold, color: ro.color || COL.ink, op: ro.op ?? 1 }); });
  return s;
}

// panel titles and orientation lines (top-level strings: listed for the font preload below)
const PT = {
  chart: { title: '眼底圖（檢查者畫法）', orient: VP.OR.chart },
  sec: { title: '經 11 點的子午切面', orient: VP.OR.sec },
  head: { title: '坐著時：經 11 點裂孔的切面', orient: VP.OR.head },
  mac: { title: '眼底圖：黃斑放大', orient: VP.OR.chart },
  fov: { title: '子午切面：fovea 附近放大', orient: VP.OR.sec },
  pvr: { title: 'PVR B：11 點裂孔附近（示意）', orient: '左眼 OS　12 點在上、3 點 temporal 在右' },
  plan: { title: '本例的術式', orient: '俯視：左眼 OS　術者坐 12 點　下＝12 點、右＝9 點 nasal' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT);

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const v = VP.fundus(VP.ST.rrd, PW, PH, VP.WIN.chart, 'ft'), A = v.A;
  let ex = lab('11 點裂孔', 'horseshoe tear', 14, 42, A.tear, HST);
  ex += lab('視網膜剝離', 'RRD', PW - 12, 60, A.rd, { side: 'R', bold: true, color: RDC, lc: RDC });
  ex += lab('fovea 還貼著', 'fovea on', PW - 12, 250, A.fovea, { side: 'R', bold: true });
  ex += lab('視盤', 'optic disc', 14, 250, A.disc);
  return { R: { svg: v.svg + clockRing(v), extra: ex, P: { title: '本例的眼底圖', orient: VP.OR.chart } } };
};

// ---------------------------------------------------------------- 1 這台刀的地圖
DRAW2['1-1'] = T => {
  // left: fundus chart — clock hours (line 0) → the detachment (1) → macula (2) → the tear (3)
  const k1 = T.p(1, 0.05, 0.5), k3 = T.on(3, 0.8);
  const L0 = VP.fundus(k1 > 0 ? Object.assign({}, VP.ST.rdOnly, { rd: { amt: k1 } }) : VP.ST.normal, PW, PH, VP.WIN.chart, 'f1a'), a = L0.A;
  let sl = L0.svg, aT = cpt(L0, 11, 19.3);
  if (k3 > 0) { const L1 = VP.fundus(VP.ST.rrd, PW, PH, VP.WIN.chart, 'f1b'); sl += `<g opacity="${k3.toFixed(3)}">${L1.svg}</g>`; aT = L1.A.tear; }
  const R = L0.M.rEdge, op1 = T.on(1, 0.6, 0.6), op2 = T.on(2), op3 = T.on(3);
  sl += clockRing(L0) + secLine(L0, 0.55);
  // the detachment's extent round the chart: 11:30 → 12 → 3 → 5 o'clock (clockwise)
  const [h0, h1] = VP.RD_ARC, arc = arcPts(L0, h0, h0 + (h1 - h0) * T.p(1, 0.2, 0.75), R + 0.75);
  if (op1 > 0) { sl += arrowP(arc, RDC, op1, 'arrB', 4);
    const s0 = cpt(L0, h0, R + 0.75), s1 = cpt(L0, h1, R + 0.75);
    sl += htext(s0[0] - 9, s0[1] + 2, '11 點半', { size: 14, bold: true, color: RDC, anchor: 'end', op: op1 }) + htext(s1[0] + 10, s1[1] + 12, '5 點', { size: 14, bold: true, color: RDC, op: op1 * T.p(1, 0.7, 0.8) }); }
  // macula outline (5.5 mm, Köksaldı 2025 via the model) when the macula is named
  const mc = L0.P([0, 0]), mr = 2.75 * L0.k;
  sl += `<circle cx="${F1(mc[0])}" cy="${F1(mc[1])}" r="${F1(mr)}" fill="none" stroke="${COL.accent}" stroke-width="2" stroke-dasharray="4 3" opacity="${op2}"/>`;
  if (op3 > 0) { const t = aT; sl += `<circle cx="${F1(t[0])}" cy="${F1(t[1])}" r="${F1(16 + 10 * (1 - op3))}" fill="none" stroke="#c8361f" stroke-width="2.5" opacity="${op3}"/>`; }
  let el = lab('顳側', 'temporal', PW - 12, 160, cpt(L0, 3, R - 1.5), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0) });
  el += lab('鼻側', 'nasal', 14, 160, cpt(L0, 9, R - 1.5), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(0) });
  el += lab('視網膜剝離', 'RRD', PW - 12, 70, a.rd || cpt(L0, 1.5, 17), { side: 'R', bold: true, color: RDC, lc: RDC, op: op1 });
  el += lab('視盤', 'optic disc', 14, 252, a.disc, { op: op2 });
  el += lab('黃斑', 'macula', 14, 300, L0.P([-1.9, 2.0]), { op: op2, color: COL.accent, lc: COL.accent });
  el += lab('fovea 還貼著', 'fovea on', PW - 12, 250, a.fovea, { side: 'R', bold: true, op: op2 });
  el += lab('下半部黃斑剝離', 'inferior macula off', PW - 12, 300, L0.P([0.4, 1.9]), { side: 'R', op: T.on(2, 0.6, 0.8) });
  el += lab('11 點裂孔', 'horseshoe tear', 14, 42, aT, Object.assign({ op: op3 }, HST));
  // right: 11–5 section — normal (line 0) → detachment (1) → the tear (3), cross-faded (each state's section is computed once)
  const w = VP.WIN.sec, o = { tw: VP.WIN.secT }, S0 = VP.sec(VP.ST.normal, PW, PH, w, 's1a', o);
  let sr = S0.svg, b = S0.A;
  if (k1 > 0) { const S1 = VP.sec(VP.ST.rdOnly, PW, PH, w, 's1b', o); sr += `<g opacity="${k1.toFixed(3)}">${S1.svg}</g>`; if (k1 > 0.5) b = S1.A; }
  if (k3 > 0) { const S2 = VP.sec(VP.ST.rrd, PW, PH, w, 's1c', o); sr += `<g opacity="${k3.toFixed(3)}">${S2.svg}</g>`; if (k3 > 0.5) b = S2.A; }
  let er = lab('11 點：上方偏鼻側', 'superonasal', PW - 12, 40, b.wallR, { side: 'R', bold: true, op: T.on(0) });
  er += lab('5 點：下方偏顳側', 'inferotemporal', 14, 40, b.wallL, { bold: true, op: T.on(0) });
  er += lab('剝離的視網膜', 'detached retina', PW - 12, 300, b.retDet, { side: 'R', bold: true, color: RDC, lc: RDC, op: op1 });
  er += lab('視網膜下液', 'SRF', PW - 12, 340, b.srfR, { side: 'R', op: op1 });
  er += lab('fovea 還貼著', 'fovea on', PW - 12, 392, b.fovea, { side: 'R', bold: true, op: op2 });
  er += lab('下半部黃斑剝離', 'inferior macula off', 14, 392, b.macOff, { op: T.on(2, 0.6, 0.8) });
  er += lab('11 點裂孔', 'horseshoe tear', PW - 12, 150, b.tearMid || b.wallR, Object.assign({ side: 'R', op: op3 }, HST));
  return { L: { svg: sl, extra: el, P: PT.chart }, R: { svg: sr, extra: er, P: PT.sec } };
};

DRAW2['1-2'] = T => {
  // left: the case on the fundus chart; Lincoff's sector 12 ± 1.5 h (line 1), the 11 o'clock tear in it (2), the whole periphery (4)
  const v = VP.fundus(VP.ST.rrd, PW, PH, VP.WIN.chart, 'f2'), a = v.A, R = v.M.rEdge, L = VP.LINCOFF, op1 = T.on(1), op2 = T.on(2), sw = T.p(4, 0.05, 0.85);
  let sl = v.svg;
  sl += `<path d="${annSector(v, L.c - L.half, L.c + L.half, 9, R + 0.6)}" fill="${COL.accent}" fill-opacity="0.2" stroke="${COL.accent}" stroke-width="2.4" stroke-dasharray="7 4" opacity="${op1}"/>`;
  // the periphery (equator → ora band), looked at all round, starting from the tear (示意 of 「看完整圈」)
  if (sw > 0) { const r0 = 16.2, r1 = 22.6, h0 = 11;
    sl += sw < 0.999 ? `<path d="${annSector(v, h0, h0 + 12 * sw, r0, r1)}" fill="#ffe08a" fill-opacity="0.42" stroke="#b88a00" stroke-width="1.5"/>`
      : `<path d="${pth(arcPts(v, 0, 12, r1, 120), true)}${pth(arcPts(v, 12, 0, r0, 120), true)}" fill="#ffe08a" fill-opacity="0.42" fill-rule="evenodd" stroke="#b88a00" stroke-width="1.5"/>`; }
  sl += clockRing(v);
  if (op2 > 0) { const t = a.tear; sl += `<circle cx="${F1(t[0])}" cy="${F1(t[1])}" r="16" fill="none" stroke="#c8361f" stroke-width="2.5" opacity="${op2}"/>`; }
  // gravity while sitting: down on the chart (12 up)
  const gx = PW - 46; sl += `<g opacity="${T.on(0)}">${arrowP([[gx, 112], [gx, 196]], COL.ink, 1, 'arrK', 5)}</g>`;
  let el = lab('坐著時的重力', 'gravity', PW - 12, 96, null, { side: 'R', bold: true, color: '#2b5a8a', op: T.on(0) });
  el += lab('剝離的形狀', 'RD configuration', PW - 12, 250, cpt(v, 2.5, 15), { side: 'R', bold: true, color: RDC, lc: RDC, op: T.on(0, 0.6, 0.6) });
  el += lab('12 點左右一個半鐘點', 'Lincoff', 14, 40, cpt(v, 11.6, 13), { bold: true, color: COL.accent, lc: COL.accent, op: op1 });
  el += lab('本例 11 點裂孔', 'HST', 14, 120, a.tear, Object.assign({ op: op2 }, HST));
  el += lab('裂孔常常不只一個', 'multiple breaks', 14, 396, null, { bold: true, op: T.on(3) });
  el += lab('整圈周邊都要看', 'whole periphery', PW - 12, 396, cpt(v, 4.6, 19.4), { side: 'R', bold: true, color: '#8a6400', lc: '#8a6400', op: T.on(4) });
  // right: sitting upright, the section through the 11 o'clock tear with gravity straight down: the fluid under the retina runs down (示意)
  const H = VP.head(VP.ST.sit, PW, PH, VP.WIN.head, 'h2'), b = H.A, fl = H.flow, opf = T.on(0, 0.8, 0.8);
  let sr = H.svg + `<g opacity="0.95">${POSTERIOR.headIcon(VP.ST.sit, 16, 10, 58)}</g>` + text(45, 84, '示意', { size: 12.5, color: COL.sub, anchor: 'middle' });
  sr += arrowP(fl.slice(0, Math.max(2, Math.round(fl.length * T.p(0, 0.3, 0.95)))), COL.amber, opf, 'arrM', 4, '9 6');
  let er = lab('重力', 'gravity', PW - 12, 40, b.gArrow, { side: 'R', bold: true, color: '#2b5a8a', lc: '#2b5a8a', op: T.on(0) });
  er += lab('11 點裂孔', 'tear', PW - 12, 120, b.tearMid, Object.assign({ side: 'R', op: T.on(0) }, HST));
  er += lab('視網膜下液順著重力往下', 'SRF（示意）', 14, 180, fl[Math.round(fl.length * 0.5)], { bold: true, color: COL.amber, lc: COL.amber, op: opf });
  er += lab('fovea', 'fovea', 14, 330, b.fovea, { op: T.on(0) });
  return { L: { svg: sl, extra: el, P: { title: '剝離的形狀與 Lincoff 規則', orient: VP.OR.chart } }, R: { svg: sr, extra: er, P: PT.head } };
};

DRAW2['1-3'] = T => {
  // left: fundus chart around the macula (zoom box in the whole chart, 1 mm bar); line 3 zooms out to the superotemporal detachment
  const z = T.p(3, 0.0, 0.4), win = VIEWS.zwin(VP.WIN.mac, VP.WIN.chart, z), v = VP.fundus(VP.ST.rrd, PW, PH, win, 'f3'), a = v.A, opM = 1 - T.on(3, 0.5);
  let sl = v.svg + secLine(v, 0.55 * opM, 7) + clockRing(v, z);
  const mc = v.P([0, 0]), mr = 2.75 * v.k;
  sl += `<circle cx="${F1(mc[0])}" cy="${F1(mc[1])}" r="${F1(mr)}" fill="none" stroke="${COL.accent}" stroke-width="2" stroke-dasharray="5 4" opacity="${opM}"/>`;
  // the border would only have to rise a little to reach the fovea (示意 arrow, lines 1–2)
  const opA = T.on(1) * opM; sl += arrowP([v.P([0.25, 2.3]), v.P([0.25, 0.55])], COL.red, opA, 'arrR', 3.5);
  sl += insetChart(v, 'f3', 'f3i', PW - 136, 14, 120, VP.WIN.mac, opM);
  sl += VIEWS.sbar(v.k, opM);
  let el = lab('fovea 還貼著', 'fovea on', PW - 160, 70, a.fovea, { side: 'R', bold: true, op: T.on(0) * opM });
  el += lab('視盤', 'optic disc', 14, 70, a.disc, { op: T.on(0) * opM });
  el += lab('黃斑', 'macula', 14, 140, v.P([-2.3, -1.6]), { color: COL.accent, lc: COL.accent, op: T.on(0) * opM });
  el += lab('剝離的邊界', 'RD border', 14, 196, v.P([-1.6, 0.85]), { bold: true, color: RDC, lc: RDC, op: T.on(0, 0.6, 0.6) * opM });
  el += lab('下半部黃斑剝離', 'inferior macula off', PW - 12, 330, v.P([1.6, 2.2]), { side: 'R', bold: true, color: RDC, lc: RDC, op: T.on(0, 0.6, 1.2) * opM });
  el += lab('再往上就蓋到 fovea', 'fovea off（示意）', PW - 12, 220, v.P([0.25, 1.5]), { side: 'R', bold: true, color: COL.red, lc: COL.red, op: opA });
  // zoomed out (line 3): the superotemporal detachment reaching the arcade (vessels 示意)
  const opZ = T.on(3, 0.6, 2.0);
  el += lab('上方偏顳側', 'superotemporal', PW - 12, 40, cpt(v, VP.ST_H, 14), { side: 'R', bold: true, color: RDC, lc: RDC, op: opZ });
  el += lab('血管弓（示意）', 'vascular arcade', PW - 12, 110, v.P([7.6, -4.9]), { side: 'R', op: opZ });
  el += lab('fovea', 'fovea', 14, 300, a.fovea, { op: opZ });
  // right: section at the fovea (11–5 meridian), zoom box in the whole section of 1-1, 1 mm bar
  const S = VP.sec(VP.ST.rrd, PW, PH, VP.WIN.fov, 's3', { tw: VP.WIN.fovT, step: 0.015 }), b = S.A, Sw = VP.sec(VP.ST.rrd, PW, PH, VP.WIN.sec, 's1c', { tw: VP.WIN.secT });
  let sr = S.svg + insetSec(Sw, PW - 128, 14, 112, VP.WIN.fovT, 1) + VIEWS.sbar(S.k, 1);
  let er = lab('fovea 還貼著', 'fovea on', PW - 140, 46, b.fovea, { side: 'R', bold: true, op: T.on(0) });
  er += lab('下半部黃斑剝離', 'inferior macula off', 14, 46, b.macOff, { bold: true, color: RDC, lc: RDC, op: T.on(0, 0.6, 0.6) });
  er += lab('視網膜下液', 'SRF', 14, 330, b.srfMac, { op: T.on(0, 0.6, 1.2) });
  er += lab('上半部黃斑貼著', 'superior macula on', PW - 12, 330, b.macOn, { side: 'R', op: T.on(0, 0.6, 1.2) });
  er += lab('脈絡膜', 'choroid', PW - 12, 380, b.chorR, { side: 'R', op: T.on(0, 0.6, 1.2) });
  return { L: { svg: sl, extra: el, P: z > 0.5 ? PT.chart : PT.mac }, R: { svg: sr, extra: er, P: PT.fov } };
};

DRAW2['1-4'] = T => {
  // left: PVR grade B near the 11 o'clock tear on the fundus chart (示意: folds of the inner surface, the rolled edge of the break)
  const st = VP.ST.rrd, v = VP.fundus(st, PW, PH, VP.WIN.tear, 'f4'), a = v.A, Gm = POSTERIOR.geom(st), Tr = Gm.tear, opW = T.on(0, 0.8, 1.6), opE = T.on(0, 0.8, 3.0);
  let sl = v.svg;
  // folds: wavy lines fanning out behind the tear (tangent frame of the tear: u posterior from the hinge, c across)
  let folds = '';
  for (const c0 of [-1.9, -1.15, -0.4, 0.4, 1.15, 1.9]) { const pts = []; for (let u = Tr.L + 0.3; u <= Tr.L + 3.2; u += 0.05) pts.push([u, c0 * (1 + 0.3 * (u - Tr.L)) + 0.06 * Math.sin(u * 5 + c0 * 3)]);
    folds += `<path d="${pth(VP.tearChart(st, pts).map(v.P))}" fill="none" stroke="#fff4e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`; }
  sl += `<g opacity="${opW}">${folds}</g>`;
  // rolled edge: a thick pale rim round the hole (sides and posterior arc), shadowed on the inside
  const rim = VP.tearChart(st, POSTERIOR.uOutline(Tr.w + 0.26, Tr.L + 0.13).map(([u, c]) => [u, c])).map(v.P), rim2 = VP.tearChart(st, POSTERIOR.uOutline(Tr.w + 0.05, Tr.L + 0.025)).map(v.P);
  sl += `<g opacity="${opE}"><path d="${pth(rim2)}" fill="none" stroke="#6a1a10" stroke-width="3" stroke-linecap="round"/><path d="${pth(rim)}" fill="none" stroke="#f6eadb" stroke-width="7" stroke-linecap="round"/><path d="${pth(rim)}" fill="none" stroke="#a89280" stroke-width="1.2" stroke-linecap="round"/></g>`;
  // no scale bar here: the fundus chart stretches the periphery round the circle (CARD.md), so the size is 示意
  sl += insetChart(v, 'f4', 'f4i', PW - 136, 14, 120, VP.WIN.tear, 1) + note('周邊在眼底圖上沿圓周被拉寬，大小為示意', 1, PH - 14, 14, 'start');
  let el = lab('11 點裂孔', 'horseshoe tear', 14, 40, a.tear, HST);
  el += lab('瓣', 'flap', 14, 100, a.flapEdge, { op: 1 });
  el += lab('表面起皺（示意）', 'surface wrinkling', PW - 12, 230, VP.tearChart(st, [[Tr.L + 2.2, 1.15 * (1 + 0.3 * 2.2)]]).map(v.P)[0], { side: 'R', bold: true, op: opW });
  el += lab('裂孔邊緣捲起（示意）', 'rolled edge', 14, 330, VP.tearChart(st, [[Tr.L + 0.13, 0]]).map(v.P)[0], { bold: true, op: opE });
  // right: this case's operation (lines 2–4) and the three ports seen from above (port clock hours 示意)
  const X0 = 300, E = VP.ext(VP.ST.setup, PW - X0, PH, VP.WIN.ext, 'e4'), b = E.A, sh = p => [p[0] + X0, p[1]];
  const rows = [['23G 三孔 PPV', { bold: true, op: T.on(2) }], ['不合併白內障手術（phaco）', { op: T.on(2, 0.6, 1.2) }], ['不加 scleral buckle', { op: T.on(2, 0.6, 2.4) }],
    ['最後打 C3F8', { bold: true, color: COL.accent, op: T.on(2, 0.6, 3.6) }], ['有 PVR：C3F8 或矽油都合理', { op: T.on(3) }], ['中間的步驟：依主刀決定', { bold: true, op: T.on(4) }]];
  let sr = `<clipPath id="c4e"><rect x="0" y="0" width="${PW - X0}" height="${PH}"/></clipPath><g transform="translate(${X0} 0)" clip-path="url(#c4e)">${E.svg}</g>` + infoCard(14, 18, X0 - 22, rows, { lh: 44 });
  sr += note('trocar 位置依主刀決定（示意）', 1, PH - 12, PW - 12);
  let er = lab('灌注', 'infusion', PW - 12, 40, sh(b.troc_it), { side: 'R', bold: true, color: '#24527d', lc: '#24527d' });
  er += lab('器械孔', 'port', X0 + 8, 330, sh(b.troc_st), { bold: true });
  er += lab('器械孔', 'port', PW - 12, 330, sh(b.troc_sn), { side: 'R', bold: true });
  er += lab('保留水晶體', 'phakic', PW - 12, 120, sh(b.centre), { side: 'R', op: T.on(2, 0.6, 1.2) });
  return { L: { svg: sl, extra: el, P: PT.pvr }, R: { svg: sr, extra: er, P: PT.plan } };
};
