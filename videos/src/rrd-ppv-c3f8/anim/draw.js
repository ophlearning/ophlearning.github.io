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
  sec2: { title: '水平切面：trocar 與 ora 的距離', orient: VP.OR.sec2 },
  port: { title: 'trocar 隧道的橫切面（灌注孔）', orient: VP.OR.port },
  ext: { title: '顯微鏡：三個 trocar', orient: VP.OR.ext },
  extZ: { title: '顯微鏡：灌注孔放大', orient: VP.OR.ext },
  inf: { title: '經灌注孔（4 點半）的子午切面', orient: VP.OR.inf },
  wide: { title: '廣角：看向灌注', orient: VP.OR.wide },
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

// ---------------------------------------------------------------- 2 架設
// Chapter 2 (set-up): 2-1 trocars (horizontal 9–3 section with the distances, then the tunnel cross-section; microscope view of the three
// ports, then zoomed on the infusion port); 2-2 infusion (section through the 4:30 infusion port; microscope view, then the wide-angle view
// looking toward the cannula, 示意). The trocar clock hours, the cotton tip, the flow arrows and the air under the choroid are 示意.
// a wall point (clock h, s mm from the limbus, depth d below the outer surface; d < 0 outside) in panel px of a section / of the microscope view
// the demonstrated port (the infusion port) with the blade path: Lt = tunnel length through the sclera (model: wall thickness / sin of the tunnel angle)
const TR21 = POSTERIOR.troc(POSTERIOR.geom(VP.ST.portIn)).find(t => t.id === VP.PORT), LT21 = TR21.Tw / Math.sin(TR21.ang * VP.D2R);
const wallPx = (S, h, s, d) => S.P(GLOBE.toPlane(S.r.plane, POSTERIOR.P3(h, s, d)));
const extPx = (E, p3) => E.P(E.r.M(p3));
// dimension along the wall: from s0 to s1 mm from the limbus, d mm outside the outer surface (d < 0), with end ticks across it
function arcDim(S, h, s0, s1, d, col, op) {
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(wallPx(S, h, s0 + (s1 - s0) * i / 24, d));
  const tk = s => { const a = wallPx(S, h, s, d - 0.32), b = wallPx(S, h, s, d + 0.32); return `M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}`; };
  return `<path d="${pth(pts)}${tk(s0)}${tk(s1)}" stroke="${col}" stroke-width="2.2" fill="none" opacity="${op}"/>`;
}
// inner surface of the ciliary body (pars plana) at s on clock h (depth below the outer surface)
const cilD = (h, s) => POSTERIOR.Tp(s) + POSTERIOR.cilTh(s - GLOBE.N.spur, POSTERIOR.oraAt(h, 1) - GLOBE.N.spur);
// a ring on the outer surface at s(h) mm from the limbus, seen from above
const extRing = (E, sOf, n = 144) => { const pts = []; for (let i = 0; i <= n; i++) { const h = 12 * i / n; pts.push(extPx(E, POSTERIOR.P3(h, sOf(h), 0))); } return pts; };
const badge = (x, y, s, col, op = 1) => { const w = measure(s, 15, true) + 22; return `<g opacity="${op}"><rect x="${x}" y="${y}" width="${F1(w)}" height="28" rx="6" fill="${col}"/>${text(x + 11, y + 19.5, s, { size: 15, bold: true, color: '#fff' })}</g>`; };
// the trocar (blade and handle, 23G: 0.64 mm like the model's blade) along the tunnel line of a port view: tip u mm along the tunnel from the entry
function trocarRod(V, u, op, len = 4.6) {
  const k = V.k, e = V.M.entry, td = V.tdir, a = V.P([e[0] + td[0] * u, e[1] + td[1] * u]), b = V.P([e[0] + td[0] * (u - len), e[1] + td[1] * (u - len)]), c = V.P([e[0] + td[0] * (u - len + 0.7), e[1] + td[1] * (u - len + 0.7)]);
  return `<g opacity="${op}"><path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="#4f5b66" stroke-width="${F1(0.64 * k + 2)}" stroke-linecap="round"/>` +
    `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="#a9b3bd" stroke-width="${F1(0.64 * k - 1)}" stroke-linecap="round"/>` +
    `<path d="M${F1(c[0])} ${F1(c[1])}L${F1(b[0])} ${F1(b[1])}" stroke="#3a6db3" stroke-width="${F1(1.4 * k)}" stroke-linecap="round"/></g>`;
}
// two bars: open external wounds, straight vs angled 23G incisions in rabbit eyes (Singh 2008: 83% vs 39%)
function woundBars(x, y, op) {
  const W = 230, rows = [['直插 straight', 83, COL.red], ['斜插 angled', 39, COL.accent]];
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${W + 120}" height="96" rx="9" fill="#fff" stroke="#d3dae1"/>` + text(x + 12, y + 22, '兔眼 23G：拔掉後外口張開', { size: 14, bold: true });
  rows.forEach(([t, v, c], i) => { const yy = y + 40 + i * 26; s += text(x + 12, yy + 13, t, { size: 13, color: COL.sub }) + `<rect x="${x + 104}" y="${yy}" width="${F1(W * v / 100)}" height="17" rx="3" fill="${c}" opacity="0.85"/>` + text(x + 110 + W * v / 100, yy + 14, v + '%', { size: 14, bold: true, color: c }); });
  return s + '</g>';
}

DRAW2['2-1'] = T => {
  const P = POSTERIOR, zB = T.p(4, 0, 0.1), zA = 1 - zB;
  // ---------------- left, lines 0–3: horizontal section (right = 9 nasal, left = 3 temporal, seen from 12 like the surgeon); lines 4–5: the tunnel
  let sl = '', el = '', PL = PT.sec2;
  if (zA > 0) {
    const S = VP.sec(VP.ST.setup, PW, PH, VP.WIN.sec2, 's21', { h: VP.SEC2_H, tw: VP.WIN.sec2T, step: 0.05 }), op0 = T.on(0) * zA, op1 = T.on(1) * zA, op2 = T.on(2) * zA, op3 = T.on(3) * zA;
    let g = '';
    for (const h of [VP.SEC2_H, VP.SEC2_H - 6]) {
      const ora = P.oraAt(h, 1), band = []; for (let x = P.PLICATA_END; x <= ora + 1e-9; x += 0.1) band.push(wallPx(S, h, x, cilD(h, x) - 0.08));
      g += `<path d="${pth(band)}" stroke="${COL.accent}" stroke-width="10" stroke-linecap="round" fill="none" opacity="${(0.5 * op0).toFixed(3)}"/>`;
      g += arcDim(S, h, VP.TROC_RANGE[0], VP.TROC_RANGE[1], -0.7, COL.amber, op0 * (1 - T.on(1)));
      g += arcDim(S, h, 0, VP.TROC_RANGE[1], -0.7, COL.ink, op1);
      g += arrowP([wallPx(S, h, VP.TROC_RANGE[1], -0.7), wallPx(S, h, VP.TROC_RANGE[1], cilD(h, VP.TROC_RANGE[1]) + 1.2)], COL.ink, op1, 'arrK', 4);
      g += arcDim(S, h, 0, ora, -1.7, RDC, op2);
      const q = wallPx(S, h, ora, P.Tp(ora) + 0.15); g += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="7" fill="none" stroke="${RDC}" stroke-width="2.4" opacity="${op2}"/>`;
    }
    sl += `<g opacity="${zA}">${S.svg}</g>` + g;
    // distance values beside the dimension lines (outside the wall): temporal on the left (anchor end), nasal on the right
    const hR = VP.SEC2_H, hL = hR - 6, side = (h, s, d, t, o) => { const q = wallPx(S, h, s, d); return htext(q[0] + (h === hL ? -4 : 4), q[1] + 5, t, Object.assign({ size: 14, bold: true, anchor: h === hL ? 'end' : 'start' }, o)); };
    for (const h of [hL, hR]) {
      sl += side(h, 3.5, -1.3, '3–4 mm', { color: COL.amber, op: op0 * (1 - T.on(1)) });
      sl += side(h, 1.6, -1.25, '4 mm', { op: op1 });
      sl += side(h, P.oraAt(h, 1) * 0.62, -2.3, VP.ORA_LBL[h] + ' mm', { size: 15, color: RDC, op: op2 }); }
    el += lab('顳側', 'temporal', 14, 40, null, { bold: true, color: COL.accent, op: T.on(0) * zA }) + lab('鼻側', 'nasal', PW - 12, 40, null, { side: 'R', bold: true, color: COL.accent, op: T.on(0) * zA });
    el += lab('pars plana', '', 14, 396, wallPx(S, hL, 6.0, cilD(hL, 6.0)), { bold: true, color: COL.accent, lc: COL.accent, op: op0 });
    el += lab('pars plana', '', PW - 12, 396, wallPx(S, hR, 5.8, cilD(hR, 5.8)), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: op0 });
    el += lab('trocar', '', 200, 296, wallPx(S, hL, 4, cilD(hL, 4) + 0.9), { bold: true, op: op1 }) + lab('trocar', '', PW - 200, 296, wallPx(S, hR, 4, cilD(hR, 4) + 0.9), { side: 'R', bold: true, op: op1 });
    el += lab('有水晶體', 'phakic', PW / 2 - 60, 352, S.A.lens, { op: op1 });
    { const oL = wallPx(S, hL, P.oraAt(hL, 1), P.Tp(7.6)), oR = wallPx(S, hR, P.oraAt(hR, 1), P.Tp(7));   // next to the rings, no leader
      el += lab('ora', 'serrata', oL[0] + 26, oL[1] + 22, null, { bold: true, color: RDC, op: op2 }) + lab('ora', 'serrata', oR[0] - 26, oR[1] + 22, null, { side: 'R', bold: true, color: RDC, op: op2 }); }
    sl += htext(PW / 2, PH - 20, '4 mm 在 ora 前面：trocar 不穿過視網膜', { size: 16, bold: true, anchor: 'middle', op: op3 });
  }
  if (zB > 0) {
    const kP = T.p(4, 0.08, 0.36), uIn = T.p(4, 0.42, 0.9), kOut = T.p(5, 0, 0.14), back = Math.round(T.p(5, 0.08, 0.4) * 24) / 24, Lt = LT21;   // back in 24 steps: each step is a new section
    const u = -1.15 + (1.15 + Lt + 0.45) * uIn - 4 * kOut;   // the blade's tip along the tunnel line (mm from the scleral entry)
    const st = kOut > 0 ? VP.portSt(1, 1, -VP.CJ_PUSH * back) : VP.portSt(0, 0, u > 0.4 ? 0 : undefined);   // the opening appears once the blade has passed the conjunctiva
    const V = VP.port(st, PW, PH, VP.WIN.port, 'p21'), a = V.A, opB = zB;
    sl += `<g opacity="${opB}">${V.svg}</g>`;
    // the conjunctiva pushed toward the tunnel (distance 示意: Warrier 2008's 「about 2 mm」 describes 25G, so no number is shown for 23G)
    const opP = T.on(4, 0.4) * opB * (1 - kOut), xm = -VP.CJ_PUSH + VP.CJ_PUSH * kP, m = V.P([xm, -0.12]);
    if (uIn <= 0 || u <= 0.4) { const m0 = V.P([-VP.CJ_PUSH, -0.12]); sl += `<circle cx="${F1(m0[0])}" cy="${F1(m0[1])}" r="6" fill="none" stroke="#b2434d" stroke-width="1.5" stroke-dasharray="3 2" opacity="${opP * kP}"/><circle cx="${F1(m[0])}" cy="${F1(m[1])}" r="6.5" fill="#b2434d" stroke="#fff" stroke-width="1.5" opacity="${opP}"/>`; }
    const ar = [V.P([-VP.CJ_PUSH, -1.05]), V.P([0, -1.05])]; sl += arrowP(ar, COL.amber, opP * (1 - uIn), 'arrM', 4);
    sl += htext((ar[0][0] + ar[1][0]) / 2, ar[0][1] - 10, '推開（示意）', { size: 14, bold: true, color: COL.amber, anchor: 'middle', op: opP * (1 - uIn) });
    if (uIn > 0 && kOut < 1) sl += trocarRod(V, u, opB * (1 - kOut));
    const opL = opB * (1 - T.on(5, 0.4));   // the layers are named while the trocar goes in
    el += lab('結膜', 'conjunctiva', PW - 12, 40, a.conjL, { side: 'R', op: opL });
    el += lab('鞏膜', 'sclera', PW - 12, 252, a.sclL, { side: 'R', op: opL });
    el += lab('pars plana', '', PW - 12, 296, a.planaL, { side: 'R', color: COL.accent, lc: COL.accent, op: opL });
    el += lab('玻璃體腔', 'vitreous', PW - 12, 340, a.vitL, { side: 'R', op: opL });
    el += lab('先推開結膜', 'displace', 14, 40, V.P([-1.2, -1.05]), { bold: true, color: COL.amber, lc: COL.amber, op: opP * (1 - uIn) });
    el += lab('斜著插', 'oblique', 14, 300, V.P([-1.3, -0.62]), { bold: true, op: T.on(4, 0.6, (T.en(4) - T.st(4)) * 0.45) * opB * (1 - kOut) });
    el += lab('結膜的開口', 'conjunctiva', 14, 200, a.cj || a.entry, { bold: true, color: '#9c2a1a', lc: '#9c2a1a', op: T.on(5, 0.6, (T.en(5) - T.st(5)) * 0.2) * opB });
    el += lab('鞏膜的開口（被結膜蓋住）', 'sclera', 14, 40, a.entry, { bold: true, op: T.on(5, 0.6, (T.en(5) - T.st(5)) * 0.3) * opB });
    el += lab('隧道合起來', 'self-sealing', PW - 12, 120, [(a.entry[0] + a.tunnelEnd[0]) / 2, (a.entry[1] + a.tunnelEnd[1]) / 2], { side: 'R', bold: true, op: T.on(5, 0.6, (T.en(5) - T.st(5)) * 0.38) * opB });
    sl += woundBars(150, PH - 108, T.p(5, 0.5, 0.62) * opB);
    if (zB > 0.5) PL = PT.port;
  }
  // ---------------- right, lines 0–3: microscope view of the three ports with the pars plana band and the ora ring (seen through, 示意); lines 4–5: zoomed on the infusion port
  const win = VIEWS.zwin(VP.WIN.extF, VP.WIN.extZ, zB), kIn = T.p(4, 0.42, 0.9), kO = T.on(5, 0.5, 0);
  const stR = zB <= 0 ? VP.ST.setup : kO > 0 ? VP.portSt(1, 1, -VP.CJ_PUSH * T.p(5, 0.08, 0.4)) : Object.assign({}, VP.ST.setup, { troc: POSTERIOR.trocarsFor('OS').filter(t => t.id !== VP.PORT) });
  const E = VP.ext(stR, PW, PH, win, 'e21'), b = E.A;
  let sr = E.svg;
  const opPP = T.on(0, 0.8, 0.5) * zA, opO = T.on(2) * zA;
  sr += `<path d="${pth(extRing(E, () => POSTERIOR.PLICATA_END), true)}${pth(extRing(E, h => POSTERIOR.oraAt(h, 1)), true)}" fill="${COL.accent}" fill-opacity="0.16" fill-rule="evenodd" opacity="${opPP}"/>`;
  sr += `<path d="${pth(extRing(E, h => POSTERIOR.oraAt(h, 1)), true)}" fill="none" stroke="${RDC}" stroke-width="2.4" stroke-dasharray="8 5" opacity="${opO}"/>`;
  // 4 mm from the limbus to the superotemporal port (along its meridian)
  { const tr = POSTERIOR.trocarsFor('OS').find(t => t.id === 'st'), d0 = extPx(E, POSTERIOR.P3(tr.h - 0.25, 0, 0)), d1 = extPx(E, POSTERIOR.P3(tr.h - 0.25, VP.TROC_RANGE[1], 0));
    sr += VIEWS.dim(d0, d1, COL.ink, T.on(1) * zA); }
  let er = '';
  if (zA > 0) {
    er += lab('灌注', 'inferotemporal', 14, 40, b.troc_it, { bold: true, color: '#24527d', lc: '#24527d', op: T.on(0) * zA });
    er += lab('器械孔', 'superotemporal', 14, 380, b.troc_st, { bold: true, op: T.on(0) * zA });
    er += lab('器械孔', 'superonasal', PW - 12, 380, b.troc_sn, { side: 'R', bold: true, op: T.on(0) * zA });
    er += lab('角膜緣後 4 mm', '', 14, 300, extPx(E, POSTERIOR.P3(1.25, 2, 0)), { bold: true, op: T.on(1) * zA });
    er += lab('pars plana（看不到，示意）', '', PW - 12, 40, extPx(E, POSTERIOR.P3(10.2, 5.2, 0)), { side: 'R', color: COL.accent, lc: COL.accent, op: opPP });
    er += lab('ora（看不到，示意）', '', PW - 12, 300, extPx(E, POSTERIOR.P3(8.2, POSTERIOR.oraAt(8.2, 1), 0)), { side: 'R', bold: true, color: RDC, lc: RDC, op: opO });
    er += lab('trocar 都在 ora 前面', '', PW - 12, 120, null, { side: 'R', bold: true, op: T.on(3) * zA });
    sr += note('trocar 鐘點依主刀決定（示意）', zA);
  }
  if (zB > 0) {
    // zoomed on the infusion port: conjunctiva pushed along the limbus (示意 direction = the tunnel's), the trocar going in obliquely along the limbus
    const tr = TR21, opP = T.on(4, 0.4) * zB * (1 - T.on(5, 0.3)), e0 = tr.entry;
    const along = mm => GLOBE.add(e0, tr.ec.map(v => v * mm)), ar = [extPx(E, along(-VP.CJ_PUSH - 0.4)), extPx(E, along(-0.4))];
    sr += arrowP(ar, COL.amber, opP * (1 - kIn), 'arrM', 4);
    const xm = -VP.CJ_PUSH + VP.CJ_PUSH * T.p(4, 0.08, 0.36), mk = extPx(E, GLOBE.add(e0, tr.ec.map(v => v * xm))), mk0 = extPx(E, along(-VP.CJ_PUSH));
    if (kIn <= 0.3) sr += `<circle cx="${F1(mk0[0])}" cy="${F1(mk0[1])}" r="6" fill="none" stroke="#b2434d" stroke-width="1.5" stroke-dasharray="3 2" opacity="${opP * T.p(4, 0.08, 0.36)}"/><circle cx="${F1(mk[0])}" cy="${F1(mk[1])}" r="6.5" fill="#b2434d" stroke="#fff" stroke-width="1.5" opacity="${opP}"/>`;
    // the trocar seen from above: only the part outside the eye (the blade inside the wall is hidden by the sclera)
    if (kIn > 0 && kO <= 0) { const u = Math.min(0, -1.15 + (1.15 + LT21 + 0.45) * kIn), p0 = extPx(E, GLOBE.add(e0, tr.tdir.map(v => v * u))), p1 = extPx(E, GLOBE.add(e0, tr.tdir.map(v => v * (u - 4.6)))), w = 0.64 * E.k;
      sr += `<path d="M${F1(p0[0])} ${F1(p0[1])}L${F1(p1[0])} ${F1(p1[1])}" stroke="#4f5b66" stroke-width="${F1(w + 2)}" stroke-linecap="round"/><path d="M${F1(p0[0])} ${F1(p0[1])}L${F1(p1[0])} ${F1(p1[1])}" stroke="#a9b3bd" stroke-width="${F1(w - 1)}" stroke-linecap="round"/>`; }
    const opC = T.on(5, 0.6, (T.en(5) - T.st(5)) * 0.2) * zB;
    if (kO > 0) { const q = b.troc_it, c = b.cj_it || q; sr += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(0.42 * E.k)}" fill="none" stroke="${COL.ink}" stroke-width="2" stroke-dasharray="4 3" opacity="${opC}"/>` +
      `<circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(0.375 * E.k)}" fill="#7d2a20" fill-opacity="0.35" stroke="#9c2a1a" stroke-width="2.4" opacity="${opC}"/>`; }
    er += lab('先推開結膜', 'displace', 14, 40, ar[0], { bold: true, color: COL.amber, lc: COL.amber, op: opP * (1 - kIn) });
    er += lab('沿著角膜緣斜插', 'oblique', 14, 380, extPx(E, GLOBE.add(e0, tr.tdir.map(v => v * -2.4))), { bold: true, op: T.on(4, 0.6, (T.en(4) - T.st(4)) * 0.45) * zB * (1 - kO) });
    er += lab('結膜的開口', 'conjunctiva', 14, 40, b.cj_it || b.troc_it, { bold: true, color: '#9c2a1a', lc: '#9c2a1a', op: opC });
    er += lab('鞏膜的開口（被結膜蓋住）', 'sclera', 14, 380, b.troc_it, { bold: true, op: T.on(5, 0.6, (T.en(5) - T.st(5)) * 0.3) * zB });
    er += lab('灌注孔', 'inferotemporal', PW - 12, 40, null, { side: 'R', bold: true, color: '#24527d', op: zB });
  }
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: zB > 0.5 ? PT.extZ : PT.ext } };
};

DRAW2['2-2'] = T => {
  const P = POSTERIOR, G = GLOBE, z = T.p(2, 0.05, 0.4), win = VIEWS.zwin(VP.WIN.inf, VP.WIN.infZ, z);
  const kSub = T.on(3, 0.6) * (1 - T.on(4, 0.6)), kAir = T.on(5, 0.6), kOk = 1 - Math.max(kSub, kAir);
  // ---------------- left: section through the infusion port (right = 4:30 inferotemporal, left = 10:30 superonasal); whole eye, then zoomed on the port
  const secOf = (st, id) => { const C = VP.sec(st, PW, PH, win, id, { h: VP.INF_H, tw: VP.WIN.infT, step: 0.06 });
    if (z <= 0.4) return C; const F = VP.sec(st, PW, PH, win, id + 'z', { h: VP.INF_H, tw: VP.WIN.infZT, step: 0.02 });
    return Object.assign({}, C, { svg: C.svg + `<g opacity="${ss(0.4, 0.9, z).toFixed(3)}">${F.svg.replace(/^<rect[^>]*\/>/, '')}</g>` }); };
  const S0 = secOf(VP.ST.setup, 's22'), a = S0.A, toPx = p3 => S0.P(G.toPlane(S0.r.plane, p3));
  let sl = S0.svg;
  if (kSub > 0) sl += `<g opacity="${kSub.toFixed(3)}">${secOf(VP.ST.infSub, 's22s').svg}</g>`;
  if (kAir > 0) sl += `<g opacity="${kAir.toFixed(3)}">${secOf(VP.ST.infAir, 's22a').svg}</g>`;
  const it = st => P.troc(P.geom(st)).find(t => t.inf), t0 = it(VP.ST.setup), tS = it(VP.ST.infSub), tA = it(VP.ST.infAir);
  // water out of the tip (示意 arrows): into the vitreous cavity (correct), into the subretinal space (錯誤示範)
  const fan = (t, op) => { let s = ''; for (const r of [-0.45, 0, 0.45]) { const ax = t.axis, side = G.unit(G.cross(ax, G.unit(G.cross(S0.r.plane.U, S0.r.plane.V)))), d = G.unit(G.add(ax, side.map(v => v * r)));
      s += arrowP([toPx(G.add(t.tip, d.map(v => v * 0.35))), toPx(G.add(t.tip, d.map(v => v * lerp(3.6, 2.1, z))))], COL.suture, op, 'arrB', 3.5); } return s; };
  sl += fan(t0, (T.on(0, 0.8) * (1 - T.on(1)) + T.on(4, 0.6) * (1 - T.on(5))) * kOk);
  { const s0 = P.wallOf(tS.tip[2], Math.hypot(tS.tip[0], tS.tip[1])).s, Gm = P.geom(VP.ST.infSub), mid = s => toPx(P.P3(VP.INF_H, s, P.Tp(s) + P.chorAt(s) + Gm.H(s, VP.INF_H) * 0.5)), pts = [];
    for (let s = s0 + 0.4; s <= s0 + 4.4; s += 0.25) pts.push(mid(s));
    sl += arrowP(pts.slice(0, Math.max(2, Math.round(pts.length * T.p(3, 0.25, 0.85)))), COL.red, kSub * T.on(3, 0.6, 0.6), 'arrR', 4, '8 5'); }
  // 示意: air through the slipped cannula into the suprachoroidal space, lifting the ciliary body and choroid behind the tip
  if (kAir > 0) { const s0 = P.wallOf(tA.tip[2], Math.hypot(tA.tip[0], tA.tip[1])).s, out = [], inn = [];
    for (let s = s0 - 0.3; s <= s0 + 3.2; s += 0.1) { const b = 0.75 * Math.sin(Math.PI * (s - s0 + 0.3) / 3.5) ** 0.8, d = P.Tp(s); out.push(toPx(P.P3(VP.INF_H, s, d))); inn.push(toPx(P.P3(VP.INF_H, s, d + b))); }
    sl += `<path d="${pth([...out, ...inn.reverse()], true)}" fill="#ffffff" stroke="${COL.suture}" stroke-width="2" opacity="${(kAir * T.on(5, 0.6, 0.8)).toFixed(3)}"/>`; }
  let el = '';
  const opW = 1 - z;   // labels of the whole-eye view
  el += lab('灌注', 'inferotemporal', PW - 12, 40, a.troc_it, { side: 'R', bold: true, color: '#24527d', lc: '#24527d', op: T.on(0) * opW });
  el += lab('器械孔', 'superonasal', 14, 40, a.troc_sn, { bold: true, op: T.on(1) * opW });
  el += lab('尖端', 'tip', PW - 12, 120, toPx(t0.tip), { side: 'R', bold: true, op: T.on(0) * opW });
  if (z > 0) {
    const opZ = ss(0.6, 1, z), Gm = P.geom(VP.ST.setup), ora = P.oraAt(VP.INF_H, 1);
    el += lab('灌注套管', 'cannula', PW - 12, 40, toPx(G.add(t0.base, G.sub(t0.tip, t0.base).map(v => v * 0.3))), { side: 'R', bold: true, color: '#24527d', lc: '#24527d', op: opZ * kOk });
    el += lab('尖端在玻璃體腔', 'in the vitreous', 14, 300, toPx(t0.tip), { bold: true, color: COL.accent, lc: COL.accent, op: opZ * kOk });
    el += lab('ora', '', PW - 12, 160, toPx(Gm.ret0(VP.INF_H, ora, 0.5)), { side: 'R', op: opZ * (1 - kAir) });
    el += lab('剝離的視網膜', 'detached retina', PW - 12, 232, toPx(Gm.ret(VP.INF_H, ora + 3.5, 1)), { side: 'R', bold: true, color: RDC, lc: RDC, op: opZ * (1 - kAir) });
    el += lab('視網膜下液', 'SRF', PW - 12, 300, toPx(P.P3(VP.INF_H, ora + 4.5, P.Tp(ora + 4.5) + P.chorAt(ora + 4.5) + Gm.H(ora + 4.5, VP.INF_H) * 0.5)), { side: 'R', op: opZ * (1 - kAir) });
    // 錯誤示範
    el += lab('尖端在視網膜下', 'subretinal', 14, 300, toPx(tS.tip), { bold: true, color: COL.red, lc: COL.red, op: kSub });
    el += lab('水灌進視網膜下（示意）', '', 14, 340, null, { bold: true, color: COL.red, op: kSub * T.on(3, 0.6, 0.6) });
    // 示意: air under the choroid
    el += lab('空氣', 'air', 14, 120, S0.P([6.2, -8.2]), { bold: true, op: kAir });
    el += lab('套管滑出：尖端在脈絡膜下', 'slipped', 14, 300, toPx(tA.tip), { bold: true, color: COL.red, lc: COL.red, op: kAir });
    el += lab('空氣跑到脈絡膜下（示意）', '', PW - 12, 232, toPx(P.P3(VP.INF_H, P.wallOf(tA.tip[2], Math.hypot(tA.tip[0], tA.tip[1])).s + 1.6, P.Tp(7) + 0.35)), { side: 'R', bold: true, color: COL.suture, lc: COL.suture, op: kAir * T.on(5, 0.6, 0.8) });
    el += lab('立刻停止灌氣', 'stop air', PW - 12, 300, null, { side: 'R', bold: true, color: COL.red, op: kAir * T.on(5, 0.6, 1.4) });
  }
  sl += badge(14, PH - 44, '錯誤示範', COL.red, kSub) + badge(14, PH - 44, '示意', COL.sub, kAir);
  sl += note('trocar 鐘點依主刀決定（示意）', T.on(1) * opW);
  // ---------------- right: microscope view of the three ports (lines 0–1), then the wide-angle view looking toward the infusion (示意)
  const kW = T.on(2, 0.8);
  let sr = '', er = '';
  if (kW < 1) { const E = VP.ext(VP.ST.setup, PW, PH, VP.WIN.extF, 'e22'), b = E.A, o = 1 - kW;
    sr += E.svg;
    er += lab('灌注', 'inferotemporal', 14, 230, b.troc_it, { bold: true, color: '#24527d', lc: '#24527d', op: T.on(1) * o });
    er += lab('器械孔', 'superotemporal', 14, 380, b.troc_st, { bold: true, op: T.on(1, 0.6, 0.8) * o });
    er += lab('器械孔', 'superonasal', PW - 12, 380, b.troc_sn, { side: 'R', bold: true, op: T.on(1, 0.6, 0.8) * o });
    er += lab('灌注管', 'infusion line', 14, 40, extPx(E, P.P3(VP.INF_H, 8.4, -1.6)), { op: T.on(0) * o });
    sr += note('trocar 鐘點依主刀決定（示意）', T.on(1) * o); }
  if (kW > 0) { const Wv = VP.wide(Object.assign({}, VP.ST.setup, { look: VP.LOOK_INF }), PW, PH, VP.WIN.wide, 'w22'), c = Wv.A;
    sr += `<g opacity="${kW.toFixed(3)}">${Wv.svg}</g>`;
    er += lab('灌注套管的尖端', 'cannula tip', PW - 12, 40, c.cannula_it, { side: 'R', bold: true, color: '#24527d', lc: '#24527d', op: kW });
    er += lab('剝離的視網膜', 'RD', 14, 380, c.rdInf, { bold: true, op: kW * T.on(2, 0.6, 0.8) });
    er += lab('要看到尖端在玻璃體腔', '', PW - 12, 120, null, { side: 'R', bold: true, color: COL.accent, op: kW * T.on(4) * (1 - kAir) });
    er += lab('術中也要不時再看', '', PW - 12, 154, null, { side: 'R', color: COL.accent, op: kW * T.on(4, 0.6, 1.2) * (1 - kAir) });
    sr += `<g opacity="${kAir.toFixed(3)}"><rect x="${PW / 2 - 190}" y="${PH / 2 - 52}" width="380" height="104" rx="10" fill="#fff" stroke="${COL.red}" stroke-width="2.5"/>` +
      text(PW / 2, PH / 2 - 14, '氣液交換中：空氣跑到脈絡膜下', { size: 18, bold: true, anchor: 'middle' }) + text(PW / 2, PH / 2 + 24, '→ 立刻停止灌氣', { size: 22, bold: true, color: COL.red, anchor: 'middle' }) + '</g>'; }
  return { L: { svg: sl, extra: el, P: PT.inf }, R: { svg: sr, extra: er, P: kW > 0.5 ? PT.wide : PT.ext } };
};

// ---------------------------------------------------------------- 3 看懂畫面
// Chapter 3 (reading the picture): 3-1 the light path of the wide-angle system (示意: the eye of the case in the 11–5 section, the lens, the real
// image above it, the inverter) + the surgeon's wide-angle view turning by 180° without the inverter, then inverter off and on side by side;
// contact and non-contact lenses (示意); 3-2 the 11–5 section with the depressor at 11 o'clock + the wide-angle view looking toward 11 (the mound,
// then the same mound with the inverter off). Both views of a pressing frame are drawn from the same state (VP.depStep with the same k).
const CLK = [[12, '12'], [3, '3 T'], [6, '6'], [9, '9 N']];       // clock numbers round the surgeon's field (left eye: 3 temporal, 9 nasal)
const CLK_C = '#dbe6f0', CLK_HI = '#7fe0c8', TEAR_C = '#ff8f7a';   // their colours on the dark field; highlighted; the 11 o'clock mark
const rotP = (p, a, c) => { const r = a * Math.PI / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)]; };
// the surgeon's field turned by a degrees (0 = inverter on, 180 = inverter off): below 90° the inverter-on picture turned by a, from 90° the model's
// inverter-off picture turned back by a − 180, so both ends are the model's own pictures. A: anchors in panel px (turned); c, r: field centre, radius (px)
function wideTurn(stOn, stOff, a, W, H, win, id) {
  const off = a >= 90, V = VP.wide(off ? stOff : stOn, W, H, win, id + (off ? 'b' : 'a')), c = V.P([0, 0]), r = V.M.R * V.k, b = off ? a - 180 : a, A = {};
  for (const [k, p] of Object.entries(V.A)) A[k] = rotP(p, b, c);
  return { svg: Math.abs(b) > 1e-6 ? `<g transform="rotate(${b.toFixed(3)} ${F1(c[0])} ${F1(c[1])})">${V.svg}</g>` : V.svg, A, c, r, off };
}
// one of two fields side by side: VP.wide in a W px wide half shifted by dx (clipped to it)
function wideAt(st, id, dx, W = 290) {
  const V = VP.wide(st, W, PH, VP.WIN.wideS, id), sh = p => [p[0] + dx, p[1]], A = {}; for (const [k, p] of Object.entries(V.A)) A[k] = sh(p);
  return { svg: `<clipPath id="${id}_h"><rect x="${dx}" y="0" width="${W}" height="${PH}"/></clipPath><g clip-path="url(#${id}_h)"><g transform="translate(${dx} 0)">${V.svg}</g></g>`, A, c: sh(V.P([0, 0])), r: V.M.R * V.k };
}
// a point gap px outside the rim of a field in the direction of its anchor clock<h> (turned with the field)
const rimPt = (Wt, h, gap) => { const p = Wt.A['clock' + h], d = Math.hypot(p[0] - Wt.c[0], p[1] - Wt.c[1]); return [Wt.c[0] + (p[0] - Wt.c[0]) / d * (Wt.r + gap), Wt.c[1] + (p[1] - Wt.c[1]) / d * (Wt.r + gap)]; };
// clock numbers outside the field, upright; hi = { hour: colour }
function clockNums(Wt, op, o = {}) {
  const z = o.size || 15; let s = '';
  for (const [h, t] of CLK) { const q = rimPt(Wt, h, o.gap || 18); s += text(F1(q[0]), F1(q[1] + z * 0.36), t, { size: z, bold: true, color: (o.hi || {})[h] || CLK_C, anchor: 'middle', op }); }
  return s;
}
// the 11 o'clock mark on the rim of a field (tick and number, turned with the field)
function mark11(Wt, op) {
  const a = rimPt(Wt, 11, -8), b = rimPt(Wt, 11, 6), q = rimPt(Wt, 11, 18);
  return `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="${TEAR_C}" stroke-width="3" stroke-linecap="round" opacity="${op}"/>` + text(F1(q[0]), F1(q[1] + 5.4), '11', { size: 15, bold: true, color: TEAR_C, anchor: 'middle', op });
}
// a ring round a field (highlight)
const ringF = (Wt, col, op) => `<circle cx="${F1(Wt.c[0])}" cy="${F1(Wt.c[1])}" r="${F1(Wt.r + 4)}" fill="none" stroke="${col}" stroke-width="4" opacity="${op}"/>`;
// top view of the patient lying face up with the surgeon at the head (示意, not to scale): the surgeon at the bottom, where the picture's 12 o'clock is;
// the patient's left eye (OS) on the left, where the picture's temporal side is. x, y: top-left corner (px), 128 × 118
function seatInset(x, y, op, tx) {
  const X = v => F1(x + v), Y = v => F1(y + v);
  return `<g opacity="${op}"><rect x="${x}" y="${y}" width="128" height="118" rx="8" fill="#fff" stroke="#c9d1d9"/>` +
    `<path d="M${X(34)} ${Y(6)}L${X(34)} ${Y(44)}Q${X(34)} ${Y(56)} ${X(46)} ${Y(57)}L${X(82)} ${Y(57)}Q${X(94)} ${Y(56)} ${X(94)} ${Y(44)}L${X(94)} ${Y(6)}Z" fill="#d5e4f1" stroke="#7d93a8"/>` +
    `<circle cx="${X(64)}" cy="${Y(72)}" r="15" fill="#f1dccb" stroke="#8a6a55"/><circle cx="${X(58)}" cy="${Y(75)}" r="2.6" fill="#2b3a4a"/><circle cx="${X(70)}" cy="${Y(75)}" r="2.6" fill="#2b3a4a"/>` +
    `<circle cx="${X(58)}" cy="${Y(75)}" r="6" fill="none" stroke="#c8361f" stroke-width="2"/>` +
    `<circle cx="${X(64)}" cy="${Y(103)}" r="8" fill="#9aa5b1" stroke="#56636f"/><path d="M${X(44)} ${Y(118)}Q${X(64)} ${Y(104)} ${X(84)} ${Y(118)}" fill="#9aa5b1" stroke="#56636f"/>` +
    text(x + 64, y + 30, tx.pt, { size: 12, color: '#3b4752', anchor: 'middle' }) + text(x + 7, y + 79, tx.os, { size: 12, bold: true, color: '#c8361f' }) + text(x + 79, y + 108, tx.su, { size: 12, bold: true }) + text(x + 122, y + 18, tx.note, { size: 11, color: COL.sub, anchor: 'end' }) + '</g>';
}
// the assistant cannot see the surgeon's picture (示意): the surgeon at the eyepieces, the assistant holding the depressor, the surgeon's command
function cantSee(cx, cy, op, tx) {
  const x = cx - 190, y = cy - 85, X = v => F1(x + v), Y = v => F1(y + v);
  const person = (px, py) => `<circle cx="${X(px)}" cy="${Y(py)}" r="13" fill="#9aa5b1" stroke="#56636f"/><path d="M${X(px - 26)} ${Y(py + 44)}Q${X(px)} ${Y(py + 8)} ${X(px + 26)} ${Y(py + 44)}Z" fill="#9aa5b1" stroke="#56636f"/>`;
  return `<g opacity="${op}"><rect x="${x}" y="${y}" width="380" height="170" rx="10" fill="#fff" stroke="#c9d1d9"/>` + text(cx, y + 27, tx.title, { size: 17, bold: true, anchor: 'middle' }) +
    person(70, 78) + `<path d="M${X(62)} ${Y(52)}L${X(62)} ${Y(66)}M${X(78)} ${Y(52)}L${X(78)} ${Y(66)}" stroke="#3b4752" stroke-width="5"/><rect x="${X(48)}" y="${Y(40)}" width="44" height="14" rx="3" fill="#3b4752"/>` +
    person(310, 78) + `<path d="M${X(318)} ${Y(108)}L${X(344)} ${Y(86)}" stroke="#6b737c" stroke-width="5" stroke-linecap="round"/>` +
    `<rect x="${X(118)}" y="${Y(62)}" width="132" height="34" rx="9" fill="#e7f3ef" stroke="${COL.accent}" stroke-width="1.5"/><path d="M${X(118)} ${Y(82)}L${X(102)} ${Y(88)}L${X(118)} ${Y(88)}Z" fill="#e7f3ef" stroke="${COL.accent}" stroke-width="1.5"/>` +
    text(x + 184, y + 84, tx.cmd, { size: 15, bold: true, color: COL.accent, anchor: 'middle' }) + arrowP([[x + 252, y + 79], [x + 280, y + 79]], COL.accent, 1, 'arrA', 3) +
    text(x + 70, y + 142, tx.su, { size: 14, bold: true, anchor: 'middle' }) + text(x + 70, y + 160, tx.su2, { size: 12.5, color: COL.sub, anchor: 'middle' }) +
    text(x + 310, y + 142, tx.as, { size: 14, bold: true, anchor: 'middle' }) + text(x + 310, y + 160, tx.as2, { size: 12.5, color: COL.sub, anchor: 'middle' }) + '</g>';
}
// a biconvex lens (half width hw, half thickness ht, mm) centred at (0, y) of a section view S
function lensPath(S, y, hw, ht) { const a = S.P([-hw, y]), b = S.P([hw, y]), t = S.P([0, y - 2 * ht]), u = S.P([0, y + 2 * ht]);
  return `M${F1(a[0])} ${F1(a[1])}Q${F1(t[0])} ${F1(t[1])} ${F1(b[0])} ${F1(b[1])}Q${F1(u[0])} ${F1(u[1])} ${F1(a[0])} ${F1(a[1])}Z`; }
// a polyline cut at the fraction k of its length
function cutPts(pts, k) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { L.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); tot += L[i - 1]; }
  let rem = tot * k; const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (rem >= L[i - 1]) { out.push(pts[i]); rem -= L[i - 1]; } else { const f = rem / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; } }
  return out; }
const TX3 = {   // texts drawn by the helpers above (listed for the font preload)
  seat: { pt: '病人', os: 'OS', su: '術者', note: '示意' },
  see: { title: '助手看不到主刀的畫面（示意）', cmd: '主刀的口令', su: '主刀', su2: '看著廣角畫面', as: '助手', as2: '看不到 → 照口令調整' },
};
Object.assign(PT, {
  opt: { title: '廣角系統的光路（示意，不按比例）', orient: VP.OR.sec },
  w3on: { title: '術者的廣角畫面', orient: VP.OR.wideOn.replace('：下＝12 點　', '：下＝12 點、') },
  w3off: { title: '術者的廣角畫面', orient: VP.OR.wideOff.replace('：下＝6 點　', '：下＝6 點、') },
  w3two: { title: '廣角畫面：inverter 關與開', orient: '左眼 OS　術者坐 12 點　左：inverter 關　右：inverter 開' },
  w3look: { title: '術者的廣角畫面', orient: '左眼 OS　inverter 開：下＝12 點、temporal 在左　看向 11 點（示意）' },
  w3dep: { title: '廣角：壓 11 點', orient: '左眼 OS　inverter 開：下＝12 點、temporal 在左　看向 11 點（示意）' },
  w3depOff: { title: '廣角：壓 11 點', orient: '左眼 OS　inverter 關（倒像）：下＝6 點、temporal 在右　看向 11 點（示意）' },
  sec3: { title: '經 11 點的子午切面', orient: VP.OR.sec },
  sec3z: { title: '經 11 點的子午切面：壓鞏膜（放大）', orient: VP.OR.sec },
});
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3);

DRAW2['3-1'] = T => {
  // ---------------- left: the light path (示意) above the 11–5 section of the case: rays from a retinal point on each side cross in the pupil, the
  // lens makes the real image above it on the other side (line 1: inverted); the inverter turns it back (line 2; off again at the end of the line);
  // line 3 the lens moved onto the cornea (contact, held by the assistant), line 4 back off the cornea with the depressor at 11 o'clock
  const O = VP.optics(), S0 = VP.sec(VP.ST.rrd, PW, PH, VP.WIN.opt, 's31', { tw: VP.WIN.secT }), kDep = T.p(4, 0.2, 0.45);
  const S = kDep > 0 ? VP.sec(VP.depStep(VP.ST.dep, kDep), PW, PH, VP.WIN.opt, 's31d', { tw: VP.WIN.secD }) : S0, a = S.A, h5 = ((VP.SEC_H + 5) % 12) + 1;
  const dim = 1 - 0.88 * T.on(3, 0.6), dimL = 1 - T.on(3, 0.5), opR = T.on(1, 0.5), kRay = T.p(1, 0.08, 0.5), opI = T.p(1, 0.48, 0.58), opInv = T.on(2, 0.5);
  const kOff = T.p(2, 0.66, 0.78) * (1 - T.on(3, 0.6)), kErect = T.p(2, 0.08, 0.3) * (1 - kOff);
  const kC = T.p(3, 0.45, 0.6) * (1 - T.p(4, 0, 0.15)), opF = T.p(3, 0.5, 0.62) * (1 - T.p(4, 0, 0.12)), ht = 1.3, lensY = lerp(O.lensY, O.apex[1] - ht - 0.05, kC);
  const yInv = O.imgY - 6.4, yE = O.imgY - 11.6, xs = VP.SEC_H, C11 = '#c8361f', C5 = COL.suture, col = h => h === xs ? C11 : C5;
  let sl = S.svg;
  // rays: retina → pupil → lens → real image (each side its colour)
  if (opR > 0) for (const h of [xs, h5]) for (const ray of O.rays[h]) { const pts = cutPts(ray.map(p => S.P(p)), kRay);
    sl += `<path d="${pth(pts)}" stroke="${col(h)}" stroke-width="1.6" fill="none" stroke-linejoin="round" opacity="${(0.85 * opR * dim * (1 - T.on(3, 0.6))).toFixed(3)}"/>`; }
  // the lens (non-contact above the cornea; contact on it)
  sl += `<path d="${lensPath(S, lensY, VP.OPT.lensR, ht)}" fill="#d7ecf7" fill-opacity="0.85" stroke="#4f86b0" stroke-width="2"/>`;
  // the assistant's finger holding the contact lens (示意)
  { const f0 = S.P([-VP.OPT.lensR - 0.4, lensY - 0.3]), f1 = S.P([-VP.OPT.lensR - 7.5, lensY - 6.5]);
    sl += `<g opacity="${opF}"><path d="M${F1(f0[0])} ${F1(f0[1])}L${F1(f1[0])} ${F1(f1[1])}" stroke="#8a6a55" stroke-width="20" stroke-linecap="round"/><path d="M${F1(f0[0])} ${F1(f0[1])}L${F1(f1[0])} ${F1(f1[1])}" stroke="#f1dccb" stroke-width="17" stroke-linecap="round"/></g>`; }
  // the retinal points, the real image above the lens, the inverter and what the surgeon sees
  const dot = (p, c, op, r = 6) => `<circle cx="${F1(p[0])}" cy="${F1(p[1])}" r="${r}" fill="${c}" stroke="#fff" stroke-width="2" opacity="${op}"/>`;
  const num = (p, t, c, op) => htext(F1(p[0]), F1(p[1] - 11), t, { size: 14, bold: true, color: c, anchor: 'middle', op });
  for (const h of [xs, h5]) { sl += dot(S.P(O.R[h]), col(h), opR); const q = S.P(O.I[h]); sl += dot(q, col(h), opI * dim) + num(q, String(h), col(h), opI * dim); }
  { const a0 = S.P([-9, O.imgY]), b0 = S.P([9, O.imgY]); sl += `<path d="M${F1(a0[0])} ${F1(a0[1])}L${F1(b0[0])} ${F1(b0[1])}" stroke="#6b737c" stroke-width="1.5" stroke-dasharray="5 4" opacity="${opI * dim}"/>`; }
  const bx0 = S.P([-11, yInv - 2.3]), bx1 = S.P([11, yInv + 2.3]), on = kOff < 0.5, bc = on ? COL.accent : COL.red;
  sl += `<g opacity="${(opInv * dim).toFixed(3)}"><rect x="${F1(bx0[0])}" y="${F1(bx0[1])}" width="${F1(bx1[0] - bx0[0])}" height="${F1(bx1[1] - bx0[1])}" rx="7" fill="#fff" stroke="${bc}" stroke-width="2.5"/>` +
    text(F1((bx0[0] + bx1[0]) / 2), F1((bx0[1] + bx1[1]) / 2 + 5.5), on ? 'inverter 開：轉 180°' : 'inverter 關：不轉', { size: 15, bold: true, color: bc, anchor: 'middle' }) + '</g>';
  for (const h of [xs, h5]) { const x = lerp(O.I[h][0], O.E[h][0], kErect), q = S.P([x, yE]); sl += dot(q, col(h), opInv * dim) + num(q, String(h), col(h), opInv * dim); }
  { const a0 = S.P([-9, yE]), b0 = S.P([9, yE]); sl += `<path d="M${F1(a0[0])} ${F1(a0[1])}L${F1(b0[0])} ${F1(b0[1])}" stroke="#6b737c" stroke-width="1.5" opacity="${opInv * dim}"/>`; }
  sl += note('光路示意，不按比例', 1, PH - 14, 14, 'start');
  const xR = S.P([O.I[h5][0], O.imgY]), xE = S.P([lerp(O.I[xs][0], O.E[xs][0], kErect), yE]), pup = S.P([0, O.pupY]);
  let el = lab('11 點側的視網膜', 'retina', PW - 12, 362, S.P(O.R[xs]), { side: 'R', bold: true, color: C11, lc: C11, op: opR });
  el += lab('5 點側', 'retina', 14, 362, S.P(O.R[h5]), { bold: true, color: C5, lc: C5, op: opR });
  el += lab('光線在瞳孔交叉', '', 14, 270, pup, { op: T.on(1, 0.6, (T.en(1) - T.st(1)) * 0.3) * dimL });
  el += lab('廣角鏡', 'wide-angle lens', PW - 12, 196, S.P([VP.OPT.lensR, lensY]), { side: 'R', bold: true, color: '#2f6690', lc: '#2f6690' });
  el += lab('倒像（鏡片上方的實像）', 'inverted', PW - 12, 124, xR, { side: 'R', bold: true, color: COL.red, lc: COL.red, op: opI * dimL });
  el += lab('inverter', '接在顯微鏡上', PW - 12, 82, S.P([11, yInv]), { side: 'R', bold: true, op: opInv * dimL });
  el += lab('術者看到：正像', 'erect', 14, 30, xE, { bold: true, color: COL.accent, lc: COL.accent, op: T.p(2, 0.25, 0.35) * (1 - T.p(2, 0.62, 0.66)) * dimL });
  el += lab('inverter 關：看到倒像', 'inverted', 14, 30, xE, { bold: true, color: COL.red, lc: COL.red, op: T.p(2, 0.72, 0.8) * (1 - T.on(3, 0.4)) });
  // line 3: non-contact (not touching the cornea) → contact (on the cornea, held by the assistant); line 4: non-contact with the depressor at 11
  const opNC = Math.max(T.on(3, 0.5) * (1 - T.p(3, 0.42, 0.46)), T.p(4, 0.1, 0.2)), gapPt = S.P([0, (O.lensY + ht + O.apex[1]) / 2]);
  el += lab('non-contact：不碰角膜', '', PW - 12, 250, gapPt, { side: 'R', bold: true, color: '#2f6690', lc: '#2f6690', op: opNC });
  el += lab('contact：放在角膜上', '', 14, 200, S.P([-VP.OPT.lensR + 1.5, lensY]), { bold: true, color: '#2f6690', lc: '#2f6690', op: T.p(3, 0.5, 0.56) * (1 - T.p(4, 0, 0.1)) });
  el += lab('助手扶著（示意）', 'contact lens', 14, 120, S.P([-VP.OPT.lensR - 5, lensY - 4.3]), { bold: true, op: opF });
  if (kDep > 0) el += lab('壓鞏膜器', 'depressor', PW - 12, 300, a.depressor, { side: 'R', bold: true, op: T.p(4, 0.3, 0.4) });
  el += lab('non-contact 也能壓鞏膜看周邊', '', 14, 120, null, { bold: true, color: COL.accent, op: T.p(4, 0.45, 0.55) });
  // ---------------- right: the surgeon's field of the case — line 0 inverter on; line 1 turned by 180° (no inverter: the inverted image);
  // lines 2–3 inverter off and on side by side; line 4 looking toward 11 with the depressor in (the same press as on the left)
  const rot = 180 * T.p(1, 0.12, 0.42), kTwo = T.on(2, 0.6) * (1 - T.on(4, 0.6)), kD4 = T.on(4, 0.6);
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>`, er = '', PR = rot >= 90 ? PT.w3off : PT.w3on;
  if (kTwo < 1 && kD4 < 1) {
    const Wt = wideTurn(VP.ST.view3, VP.ST.view3Off, rot, PW, PH, VP.WIN.wide3, 'w31'), o1 = (1 - kTwo) * (1 - kD4), still = 1 - T.p(1, 0.08, 0.14) * (1 - T.p(1, 0.42, 0.5));
    sr += `<g opacity="${o1.toFixed(3)}">${Wt.svg}${clockNums(Wt, 1)}</g>`;
    sr += badge(12, 10, 'inverter 開：正像', COL.accent, o1 * (1 - T.p(1, 0.05, 0.12))) + badge(12, 10, '沒有 inverter：倒像', COL.red, o1 * T.p(1, 0.42, 0.5));
    er += lab('視盤', 'optic disc', rot >= 90 ? 14 : PW - 12, 160, Wt.A.disc, { side: rot >= 90 ? 'L' : 'R', bold: true, op: o1 * still });
    er += lab('剝離的視網膜', 'RD', rot >= 90 ? PW - 12 : 14, 300, Wt.A.rd, { side: rot >= 90 ? 'R' : 'L', bold: true, color: RDC, lc: RDC, op: o1 * still });
    er += lab('上下顛倒＋左右相反', '', 14, 358, null, { bold: true, color: COL.red, op: o1 * T.p(1, 0.5, 0.6) });
    er += lab('＝整張轉 180°', '', 14, 392, null, { bold: true, color: COL.red, op: o1 * T.p(1, 0.56, 0.66) });
  }
  if (kTwo > 0) {
    const L = wideAt(VP.ST.view3Off, 'w31L', 5), R = wideAt(VP.ST.view3, 'w31R', 311), hiOn = T.on(2, 0.5, 0.5) * (1 - T.p(2, 0.62, 0.7)), hiOff = T.p(2, 0.7, 0.78);
    sr += `<g opacity="${kTwo.toFixed(3)}">${L.svg}${R.svg}${clockNums(L, 1, { size: 14, gap: 22, hi: { 12: CLK_HI } })}${clockNums(R, 1, { size: 14, gap: 22, hi: { 12: CLK_HI } })}` +
      ringF(R, COL.accent, hiOn) + ringF(L, COL.red, hiOff) +
      text(L.c[0], 44, 'inverter 關：倒像', { size: 16, bold: true, color: '#ff9b9b', anchor: 'middle' }) + text(R.c[0], 44, 'inverter 開：正像', { size: 16, bold: true, color: CLK_HI, anchor: 'middle' }) +
      arrowP([[L.c[0] + 60, 372], [R.c[0] - 60, 372]], COL.accent, 1, 'arrA', 3) + text(PW / 2, 400, 'inverter 把倒像整張轉 180°', { size: 15, bold: true, color: '#fff', anchor: 'middle' }) + '</g>';
    if (kTwo > 0.5) PR = PT.w3two;
  }
  if (kD4 > 0) {
    const Wv = VP.wide(VP.depStep(VP.ST.depOn, kDep), PW, PH, VP.WIN.wide3, 'w31d'), Wt = { A: Wv.A, c: Wv.P([0, 0]), r: Wv.M.R * Wv.k };
    sr += `<g opacity="${kD4.toFixed(3)}">${Wv.svg}${clockNums(Wt, 1)}${mark11(Wt, 1)}</g>` + badge(12, 10, 'inverter 開', COL.accent, kD4);
    if (Wv.A.dep) er += lab('壓 11 點的隆起（示意）', 'mound', PW - 12, 300, Wv.A.dep, { side: 'R', bold: true, op: T.p(4, 0.35, 0.45) });
    if (kD4 > 0.5) PR = PT.w3dep;
  }
  return { L: { svg: sl, extra: el, P: PT.opt }, R: { svg: sr, extra: er, P: PR } };
};

DRAW2['3-2'] = T => {
  // ---------------- left: the 11–5 section of the case; line 3 zooms on the 11 o'clock periphery and the depressor goes in (6 steps)
  const z = T.p(3, 0, 0.3), kD = T.p(3, 0.32, 0.62), win = VIEWS.zwin(VP.WIN.sec, VP.WIN.depZ, z), stS = VP.depStep(VP.ST.dep, kD);
  const C = VP.sec(VP.ST.rrd, PW, PH, win, 's32', { tw: VP.WIN.secT });
  let sl = C.svg, a = C.A;
  let Fz = null;
  if (z > 0.4) { Fz = VP.sec(stS, PW, PH, win, 's32z', { tw: VP.WIN.depZT, step: 0.025 }); sl += `<g opacity="${ss(0.4, 0.9, z).toFixed(3)}">${Fz.svg.replace(/^<rect[^>]*\/>/, '')}</g>`; if (z > 0.9) a = Fz.A; }
  const opW = 1 - ss(0, 0.5, z), opZ = ss(0.6, 1, z), hiR = T.p(2, 0.5, 0.6);
  let el = lab('11 點：上方略偏鼻側', 'superonasal', PW - 12, 40, a.wallR, { side: 'R', bold: true, color: hiR > 0.5 ? COL.accent : COL.ink, lc: hiR > 0.5 ? COL.accent : undefined, op: T.on(0) * opW });
  el += lab('5 點：下方偏顳側', 'inferotemporal', 14, 40, a.wallL, { bold: true, op: T.on(0) * opW });
  el += lab('11 點裂孔', 'HST', PW - 12, 150, a.tearMid, Object.assign({ side: 'R', op: T.on(0, 0.6, 0.6) * opW }, HST));
  if (z > 0.9) {
    el += lab('11 點裂孔', 'HST', 14, 330, a.tearMid, Object.assign({ op: opZ }, HST));
    if (a.depressor) { el += lab('壓鞏膜器', 'depressor', PW - 12, 330, a.depressor, { side: 'R', bold: true, op: opZ * T.p(3, 0.4, 0.5) });
      el += lab('凹陷：從外面往內壓', 'indentation', 14, 380, wallPx(Fz, stS.dep.h, stS.dep.s, stS.dep.depth), { bold: true, op: opZ * T.p(3, 0.55, 0.65) }); }
    el += lab('11 點：上方略偏鼻側', 'superonasal', PW - 12, 40, null, { side: 'R', bold: true, op: opZ });
  }
  // line 4: what to check when the mound is somewhere else
  const opK = T.on(4, 0.5);
  sl += `<g opacity="${opK}">` + infoCard(14, 56, 232, [['隆起不在 11 點時', { bold: true, size: 15 }], ['① 先確認：壓的位置', { color: COL.accent, bold: true, size: 15, op: T.on(4, 0.5, 0.4) }], ['② 再確認：inverter 開了沒', { color: COL.accent, bold: true, size: 15, op: T.p(4, 0.5, 0.6) }]], { lh: 32 }) + '</g>';
  // ---------------- right: the surgeon's field (inverter on): lines 0–1 straight, the clock numbers and the 11 o'clock mark; line 1 the surgeon at the
  // head (示意); line 2 the view turns toward 11 (示意) and the tear comes in, low and a little to the right; line 3 the mound of the same press;
  // line 4 the same mound with the inverter off (turned 180°: up and a little to the left), then on again; line 5 the assistant cannot see it
  const LK = VP.ST.depOn.look, kL = T.p(2, 0.05, 0.35), a4 = 180 * T.p(4, 0.05, 0.28) * (1 - T.p(4, 0.66, 0.88));
  const stOn = kD > 0 ? VP.depStep(VP.ST.depOn, kD) : VP.lookStep(VP.ST.view3, LK, kL), stOff = kD > 0 ? VP.depStep(VP.ST.depOff, kD) : Object.assign({}, stOn, { inverter: false });
  const Wt = wideTurn(stOn, stOff, a4, PW, PH, VP.WIN.wide3, 'w32'), off = a4 >= 90, opSeat = T.on(1, 0.6) * (1 - T.on(3, 0.5));
  const hi1 = T.p(1, 0.3, 0.4) * (1 - T.on(3, 0.5)) > 0.5 ? { 12: CLK_HI, 3: CLK_HI } : {};
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + Wt.svg + clockNums(Wt, 1, { hi: hi1 }) + mark11(Wt, T.on(0, 0.6, 0.6));
  sr += seatInset(10, 10, opSeat, TX3.seat);
  let er = lab('本片假設術者坐病人頭側', '', 14, 358, null, { bold: true, color: COL.accent, op: opSeat });
  er += lab('下＝12 點、左眼 temporal 在左', '', 14, 392, null, { bold: true, color: COL.accent, op: opSeat * T.p(1, 0.3, 0.4) });
  // line 2: the 11 o'clock direction from the middle of the picture, and the tear seen there
  const opT = T.p(2, 0.3, 0.4) * (1 - T.on(3, 0.5)); { const c = Wt.c, q = rimPt(Wt, 11, -4);
    sr += arrowP([[c[0], c[1]], q], TEAR_C, opT, 'arrR', 3, '8 6'); }
  er += lab('11 點裂孔：畫面下方略偏右', 'HST', PW - 12, 300, Wt.A.tear, Object.assign({ side: 'R', op: opT }, HST));
  // line 3: the mound (same press as the section); line 4: inverter off → the same mound up and a little to the left; on again → back at 11
  const opM = T.p(3, 0.4, 0.5) * (1 - T.p(4, 0.05, 0.12)), opOff = T.p(4, 0.26, 0.32) * (1 - T.p(4, 0.66, 0.72)), opBack = T.p(4, 0.86, 0.92);
  if (Wt.A.dep) { er += lab('11 點的隆起', 'mound', PW - 12, 300, Wt.A.dep, { side: 'R', bold: true, op: opM });
    er += lab('同一個隆起', '', 14, 64, null, { bold: true, color: COL.red, op: opOff });
    er += lab('跑到上方略偏左', '（推論）', 14, 98, Wt.A.dep, { bold: true, color: COL.red, lc: COL.red, op: opOff });   // research/intraop.md 題 3: no source says this directly; inferred from 倒像 = 180°
    er += lab('inverter 開：回到 11 點', 'mound', PW - 12, 300, Wt.A.dep, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: opBack * (1 - T.on(5, 0.5)) }); }
  if (opOff > 0 && Wt.A.dep) { const q = rotP(Wt.A.dep, -a4, Wt.c);   // where the mound is with the inverter on (every point is turned by a4)
    { sr += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="26" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 5" opacity="${opOff}"/>`;
      er += lab('inverter 開時在這裡', '', PW - 12, 352, [q[0] + 18, q[1] + 18], { side: 'R', op: opOff }); } }
  sr += badge(PW - 132, 10, 'inverter 開', COL.accent, T.on(3, 0.5) * (off ? 0 : 1) * (1 - T.on(5, 0.5))) + badge(PW - 172, 10, 'inverter 關（倒像）', COL.red, off ? 1 : 0);
  // line 5: the assistant cannot see this picture (示意)
  const opV = T.on(5, 0.6);
  sr += `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f" opacity="${(0.6 * opV).toFixed(3)}"/>` + cantSee(PW / 2, PH / 2 + 10, opV, TX3.see);
  return { L: { svg: sl, extra: el, P: z > 0.5 ? PT.sec3z : PT.sec3 }, R: { svg: sr, extra: er, P: off ? PT.w3depOff : kD > 0 ? PT.w3dep : kL > 0.5 ? PT.w3look : PT.w3on } };
};
