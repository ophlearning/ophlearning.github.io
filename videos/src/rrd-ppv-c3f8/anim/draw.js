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
    el += lab('先推開結膜', 'displace', 14, 40, V.P([-1.2, -1.05]), { bold: true, color: COL.amber, lc: COL.amber, op: opP * (1 - T.p(4, 0.34, 0.42)) });   // gone before the trocar (its handle sweeps the top left) comes in at 0.42
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

// ---------------------------------------------------------------- 4 Core vitrectomy 與 PVD
// Chapter 4: 4-1 the section through the vitrector's 10:30 port (the infusion at 4:30 in the same plane; the light pipe comes in from the viewer's
// side, 1:30, so only its tip is cut) + the surgeon's wide-angle view (inverter on): core vitrectomy → TA specks on the gel → PVD (示意: an eye
// whose posterior hyaloid is still attached; the case itself has a PVD, P.CASE.pvd = 1) → the TA-coated hyaloid off the retina. 4-2 the plane
// through the cutter's shaft near mobile detached retina (superotemporal, bullous): the retina sucked into the port (錯誤示範), the pull as an
// arrow (示意 of the direction in porcine eyes, no values), high cut rate and low vacuum; the same states in the wide-angle view (示意).
Object.assign(PT, {
  sec4: { title: '經 10 點半（器械孔）的子午切面', orient: VP.OR.sec4 },
  w4: { title: '術者的廣角畫面', orient: VP.OR.wideOn.replace('：下＝12 點　', '：下＝12 點、') },
  z42: { title: '切割頭靠近剝離的視網膜（放大）', orient: VP.OR.z42 },
});
const TX4 = {   // texts drawn by helpers (listed for the font preload)
  card: { title: '拉力的方向（示意，豬眼實驗）', vac: '吸力 vacuum', dist: '離視網膜 distance', cut: '切速 cut rate', up: '大', down: '小' },
  say: { a: '助手看到視網膜被吸起', b: '→ 馬上說出來' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4);
const C_TA = '#7a8792';                                            // TA labels
// a wide view of a state (inverter on, surgeon at 12) with the clock numbers round it; Wt-like { A, c, r } for the chapter 3 helpers
function wide4(st, id, o) { const V = VP.wide(st, PW, PH, VP.WIN.wide3, id, o), Wt = { A: V.A, c: V.P([0, 0]), r: V.M.R * V.k }; return { V, Wt, svg: V.svg + clockNums(Wt, 1) }; }
// the three settings of 4-2 line 1 as bars (no values: 示意 of the direction only) and the pull they give (VP.traction)
function tractionCard(x, y, s, op) {
  const W = 268, bar = (row, v, col) => { const yy = y + 46 + row * 30; return text(x + 12, yy + 12, [TX4.card.vac, TX4.card.dist, TX4.card.cut][row], { size: 13.5, color: COL.ink }) +
    `<rect x="${x + 140}" y="${yy}" width="112" height="13" rx="3" fill="#e6ebef"/><rect x="${x + 140}" y="${yy}" width="${F1(112 * v)}" height="13" rx="3" fill="${col}"/>`; };
  return `<g opacity="${op}"><rect x="${x}" y="${y}" width="${W}" height="140" rx="9" fill="#fff" stroke="#d3dae1"/>` + text(x + 12, y + 24, TX4.card.title, { size: 14, bold: true }) +
    bar(0, s.vac, COL.red) + bar(1, VP.distOf(s.e), COL.sub) + bar(2, s.cut, COL.accent) + '</g>';
}
const mixS = (a, b, k) => ({ vac: lerp(a.vac, b.vac, k), e: lerp(a.e, b.e, k), cut: lerp(a.cut, b.cut, k) });

DRAW2['4-1'] = T => {
  const P = POSTERIOR;
  // ---------------- the state of this frame (both panels): line 0 core vitrectomy in the case; line 1 TA; line 3 the PVD demonstration (示意)
  const kC = T.p(0, 0.12, 0.85), kT = T.on(1, 0.8, 0.6), kP = T.p(3, 0.25, 0.9), kD = T.on(3, 0.6, 0.15);   // kD: switch to the demonstration
  const stA = VP.coreStep(kC, 0), stB = VP.ST.ta4, stP = VP.pvdStep(kP);
  // ---------------- left: the section through the 10:30 port (right = 10:30 superonasal, left = 4:30 inferotemporal)
  const o = { h: VP.SEC4_H, tw: VP.WIN.secT }, win = VP.WIN.sec;
  const SA = VP.sec(stA, PW, PH, win, 's41a', o);
  let sl = SA.svg, a = SA.A;
  if (kT > 0 && kD < 1) { const SB = VP.sec(stB, PW, PH, win, 's41b', o); sl += `<g opacity="${(kT * (1 - kD)).toFixed(3)}">${SB.svg}</g>`; if (kT > 0.5) a = SB.A; }
  if (kD > 0) { const SP = VP.sec(stP, PW, PH, win, 's41p', o); sl += `<g opacity="${kD.toFixed(3)}">${SP.svg}</g>`; if (kD > 0.5) a = SP.A; }
  const toS = p3 => SA.P(GLOBE.toPlane(SA.r.plane, p3)), opDemo = kD * (1 - T.on(4, 0.6, 0.4));
  // 示意: the hyaloid comes off from the pole outward (arrows along both sides while it separates)
  { const pts = (h, s0, s1) => { const r = []; for (let s = s0; s >= s1; s -= 0.5) r.push(toS(P.P3(h, s, P.Tp(s) + P.chorAt(s) + 2.2))); return r; }, op = T.p(3, 0.25, 0.4) * (1 - T.p(3, 0.9, 1));
    sl += arrowP(pts(VP.SEC4_H, P.S_POLE - 2, P.S_POLE - 9), COL.amber, op, 'arrM', 3.5, '7 5') + arrowP(pts(VP.SEC4_H - 6, P.S_POLE - 2, P.S_POLE - 9), COL.amber, op, 'arrM', 3.5, '7 5'); }
  sl += badge(14, PH - 44, '示意：後玻璃體還沒分開時', COL.sub, opDemo);
  const opC = 1 - T.on(1, 0.6, 1.2);
  let el = lab('切割頭', 'vitrector', PW - 12, 330, a.inst0, { side: 'R', bold: true, op: T.on(0) * (1 - T.on(3, 0.6)) + T.on(3, 0.6) * (1 - T.on(4, 0.6)) });
  el += lab('光導管', 'light pipe（從 1 點半）', 14, 330, a.inst1, { bold: true, color: '#8a6d00', lc: '#8a6d00', op: T.on(0, 0.6, 0.6) * opC });
  el += lab('器械孔', '10 點半 superonasal', PW - 12, 40, a.troc_sn, { side: 'R', bold: true, op: T.on(0) * opC });
  el += lab('灌注', '4 點半 infusion', 14, 40, a.troc_it, { bold: true, color: '#24527d', lc: '#24527d', op: T.on(0) * opC });
  el += lab('先切中央', 'core vitrectomy', 14, 120, toS(VP.inPl4(0, -3)), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(0, 0.6, 0.6) * (1 - T.on(1, 0.6)) });
  // line 1: TA on the gel; the cut centre has none
  const gelPt = toS(P.P3(VP.SEC4_H, 20, P.Tp(20) + P.chorAt(20) + 5.2)), opTA = T.on(1, 0.6, 1.4) * (1 - T.on(3, 0.5));
  el += lab('TA 白色顆粒附在玻璃體上', '', PW - 12, 120, gelPt, { side: 'R', bold: true, color: C_TA, lc: C_TA, op: opTA });
  el += lab('切掉的中央：沒有顆粒', '', 14, 120, toS(VP.inPl4(0, -3)), { bold: true, color: COL.accent, lc: COL.accent, op: T.on(1, 0.6, 2.2) * (1 - T.on(3, 0.5)) });
  // lines 3–4: the posterior hyaloid (TA-coated) off the retina; still attached at the vitreous base
  el += lab('後玻璃體', 'posterior hyaloid', 14, 230, a.hyaloidL, { bold: true, color: C_TA, lc: C_TA, op: T.on(3, 0.6, 0.6) });
  el += lab('主刀把它分開', 'PVD', 14, 120, a.inst0, { bold: true, color: COL.amber, lc: COL.amber, op: T.p(3, 0.3, 0.4) * (1 - T.on(4, 0.5)) });
  el += lab('已經和視網膜分開', '（沾了 TA 才看得見）', 14, 276, null, { bold: true, color: COL.accent, op: T.on(4, 0.6, 0.6) });
  el += lab('vitreous base 仍黏著', '', PW - 12, 40, a.vbR, { side: 'R', bold: true, color: '#4f6d3a', lc: '#4f6d3a', op: T.on(4, 0.6, 1.2) });
  el += lab('vitreous base 仍黏著', '', 14, 40, a.vbL, { bold: true, color: '#4f6d3a', lc: '#4f6d3a', op: T.on(4, 0.6, 1.2) });
  // ---------------- right: the surgeon's wide-angle view of the same state (inverter on, surgeon at 12)
  const tn = [-6, -4];   // the TA speck labelled: one near the upper left of the centre (field mm)
  const WA = wide4(stA, 'w41a', {});
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + WA.svg, b = WA.V.A, Wt = WA.Wt;
  if (kT > 0 && kD < 1) { const WB = wide4(stB, 'w41b', { taNear: tn }); sr += `<g opacity="${(kT * (1 - kD)).toFixed(3)}">${WB.svg}</g>`; if (kT > 0.5) b = WB.V.A; }
  if (kD > 0) { const WP = wide4(stP, 'w41p', { taNear: tn, pvdRing: true }); sr += `<g opacity="${kD.toFixed(3)}">${WP.svg}</g>`; if (kD > 0.5) b = WP.V.A; }
  sr += badge(12, 10, 'inverter 開', COL.accent) + badge(PW - 236, 10, '示意：後玻璃體還沒分開時', COL.sub, opDemo);
  let er = lab('切割頭', 'vitrector（10 點半）', PW - 12, 300, b.inst0, { side: 'R', bold: true, op: T.on(0) * (1 - T.on(3, 0.5)) });
  er += lab('光導管', 'light pipe（1 點半）', 14, 352, b.inst1, { bold: true, color: '#8a6d00', lc: '#e8c95a', op: T.on(0, 0.6, 0.6) * (1 - T.on(3, 0.5)) });
  er += lab('玻璃體是透明的', '看不出切了哪裡', 14, 64, null, { bold: true, op: T.on(0, 0.6, 1.6) * (1 - T.on(1, 0.6, 0.6)) });
  er += lab('TA 白色顆粒', 'triamcinolone', 14, 64, b.taSpeck, { bold: true, color: C_TA, lc: '#ffffff', op: T.on(1, 0.6, 1.2) * (1 - T.on(3, 0.5)) });
  er += lab('後玻璃體分開的範圍（示意）', '', PW - 12, 64, b.pvdRing, { side: 'R', bold: true, lc: '#ffffff', op: T.p(3, 0.5, 0.6) * (1 - T.on(4, 0.5)) });
  er += lab('沾了 TA 的後玻璃體', 'posterior hyaloid', PW - 12, 64, b.pvdRing, { side: 'R', bold: true, color: C_TA, lc: '#ffffff', op: T.on(4, 0.6, 0.5) });
  return { L: { svg: sl, extra: el, P: PT.sec4 }, R: { svg: sr, extra: er, P: PT.w4 } };
};

DRAW2['4-2'] = T => {
  // ---------------- the state of this frame (both panels): line 0 the cutter comes near (3 steps), then the retina is sucked in (錯誤示範);
  // line 1 the retina lets go (3 steps), then the pull as an arrow while the settings change; line 2 high cut rate, low vacuum; line 3 sucked again
  const kA = T.p(0, 0.05, 0.4), kS = T.p(0, 0.5, 0.85) * (1 - T.on(1, 0.4)) + T.on(3, 0.6, 0.3), R4 = VP.TR42;
  const in1 = T.on(1, 0.01) > 0, in2 = T.on(2, 0.01) > 0, cardOp = T.on(1, 0.4) * (1 - T.on(3, 0.5)), on1 = T.on(1, 0.4) * (1 - T.on(2, 0.5)), on2 = T.on(2, 0.5, 0.5) * (1 - T.on(3, 0.5));   // on2 after on1 is gone (both labels sit at the same place)
  const p1a = T.p(1, 0.05, 0.3), p1b = T.p(1, 0.35, 0.6), p1c = T.p(1, 0.65, 0.95);
  const set = !in1 || !(cardOp > 0) ? null : in2 ? R4.low : p1c > 0 ? mixS(R4.s2, R4.s3, p1c) : p1b > 0 ? mixS(R4.s1, R4.s2, p1b) : mixS(R4.s0, R4.s1, p1a);
  const e = kS > 0 || T.on(3, 0.01) > 0 ? VP.E42[2] : set ? (set.e > (VP.E42[1] + VP.E42[2]) / 2 ? VP.E42[1] : VP.E42[2]) : VP.E42[Math.round(kA * 2)];
  const st = VP.st42(e, kS);
  // ---------------- left: the plane through the cutter's shaft (up = the vitreous cavity, down = the wall), 1 mm bar
  const S = VP.instSec(st, PW, PH, VP.WIN.z42, 's42', { tw: VP.WIN.z42T }), a = S.A, sucked = !!st.suck;
  let sl = S.svg + VIEWS.sbar(S.k, 1);
  // the pull (示意): an arrow from the retina under the port up toward it, its length from VP.traction of the settings shown
  if (set) { const tr = VP.traction(set.vac, VP.distOf(set.e), set.cut), q = S.P([S.M.port[0], 0.02]), L = 14 + 70 * tr;
    sl += arrowP([q, [q[0], q[1] - L]], COL.red, cardOp * (sucked ? 0 : 1), 'arrR', 5) + tractionCard(14, 14, set, cardOp); }
  sl += badge(PW - 120, PH - 44, '錯誤示範', COL.red, sucked && cardOp < 0.5 ? 1 : 0);
  // line 0: the detached retina moves (示意: a double arrow beside it)
  if (a.retF) { const q = a.retF, opF = T.on(0, 0.6) * (1 - T.on(1, 0.4)); sl += arrowP([[q[0], q[1] - 6], [q[0], q[1] - 34]], COL.amber, opF, 'arrM', 3.5) + arrowP([[q[0], q[1] + 6], [q[0], q[1] + 34]], COL.amber, opF, 'arrM', 3.5); }
  let el = lab('剝離、會飄的視網膜', 'detached retina', 14, 260, a.retL, { bold: true, color: RDC, lc: RDC, op: T.on(0) });
  el += lab('視網膜下液', 'SRF', 14, 330, a.srfL, { op: T.on(0, 0.6, 0.6) });
  el += lab('切割頭', 'vitrector', PW - 12, 200, a.tip, { side: 'R', bold: true, op: T.on(0) * (1 - cardOp) });
  el += lab('切割口', 'port', PW - 12, 252, a.port, { side: 'R', op: T.on(0, 0.6, 0.6) * (1 - cardOp) });
  el += lab('視網膜被吸進切割口', '', PW - 12, 340, a.suck, { side: 'R', bold: true, color: COL.red, lc: COL.red, op: sucked ? 1 : 0 });
  if (set) { const q = S.P([S.M.port[0], 0.02]), tr = VP.traction(set.vac, VP.distOf(set.e), set.cut);
    el += lab('拉力（示意）', 'traction', PW - 12, 296, [q[0] + 4, q[1] - 10 - 35 * tr], { side: 'R', bold: true, color: COL.red, lc: COL.red, op: on1 * (sucked ? 0 : 1) }); }
  el += lab('高切速、低吸力：', '視網膜不被吸起', PW - 12, 290, null, { side: 'R', bold: true, color: COL.accent, op: on2 });
  // ---------------- right: the surgeon's wide-angle view of the same state (示意 of the sucked retina)
  const Wv = wide4(st, 'w42', {}), b = Wv.V.A, Wt = Wv.Wt;
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + Wv.svg + badge(12, 10, 'inverter 開', COL.accent);
  if (sucked && b.suck) sr += `<circle cx="${F1(b.suck[0])}" cy="${F1(b.suck[1])}" r="${F1(20 + 6 * (1 - T.on(3, 0.6, 0.5)))}" fill="none" stroke="${COL.red}" stroke-width="3" opacity="${T.on(3, 0.6) > 0 ? 1 : 0.8}"/>`;
  let er = lab('切割頭', 'vitrector', PW - 12, 300, b.inst0, { side: 'R', bold: true, op: T.on(0) });
  er += lab('剝離的視網膜', 'RD', 14, 64, b.rd, { bold: true, color: RDC, lc: '#ffffff', op: T.on(0) });
  er += lab('視網膜被吸起（示意）', '', 14, 120, b.suck, { bold: true, color: COL.red, lc: '#ff8f7a', op: sucked ? 1 : 0 });
  // line 3: say it at once
  const opSay = T.on(3, 0.6, 0.4);
  const bx = PW - 352;   // top right, clear of the sucked retina (lower middle of the field) and the labels on the left
  sr += `<g opacity="${opSay}"><rect x="${bx}" y="44" width="340" height="88" rx="10" fill="#fff" stroke="${COL.red}" stroke-width="3"/>` +
    text(bx + 170, 78, TX4.say.a, { size: 19, bold: true, anchor: 'middle' }) + text(bx + 170, 112, TX4.say.b, { size: 24, bold: true, color: COL.red, anchor: 'middle' }) + '</g>';
  return { L: { svg: sl, extra: el, P: PT.z42 }, R: { svg: sr, extra: er, P: PT.w4 } };
};

// ---------------------------------------------------------------- 5 周邊 shaving 與壓鞏膜
// Chapter 5 (after the core vitrectomy; the vitrector in the 10:30 port, the light pipe in the 1:30 port). 5-1: the 11–5 section zoomed on the 11
// o'clock periphery — the two principles (the tear; the gel pulling its flap), the vitreous base straddling the ora with the tear on its posterior
// border (bracket outside the wall), the flap pulled forward by the gel (Govetto 2024), shaving in VP.SHAVE_STEPS steps (the gel at the vitreous
// base thinned, the strand on the flap cut: the pull released); line 4 (示意) the 10:30 section with the cutter reaching the far periphery behind the
// lens. Right: the surgeon's wide-angle view (inverter on, looking toward 11; line 4 toward 4:30) of the same states. 5-2: the assistant presses at
// 11 (chapter 3's place and depth, 示意): the section with the depressor, the retina before the press (dashed) and the cutter it is pushed toward,
// the mound in the wide-angle view (both views take the same VP.depStep), the iatrogenic break numbers (Neffendorf 2017) and the call-out.
Object.assign(PT, {
  sec5: { title: '經 11 點的子午切面：周邊放大', orient: VP.OR.sec },
  sec5far: { title: '經 10 點半（器械孔）的子午切面', orient: VP.OR.sec4 },
  w5: { title: '術者的廣角畫面', orient: VP.OR.w5 },
  w5far: { title: '術者的廣角畫面', orient: VP.OR.w5far },
  sec52: { title: '經 11 點的子午切面：助手壓鞏膜', orient: VP.OR.sec },
  w52: { title: '廣角：壓 11 點', orient: VP.OR.w5 },
});
const TX5 = {   // texts drawn by helpers (listed for the font preload)
  rule: { title: '修 RRD 的兩個原則', a: '① 處理所有的裂孔', b: '② 解除玻璃體的拉力' },
  brk: { title: '清周邊時造成新的裂孔（修 RRD）', a: '23G', b: '20G' },
  say: { a: '看到新的裂孔或出血', b: '→ 說出來，讓主刀標記' },
  lens: { title: '有水晶體的眼：清周邊比較難', a: '碰到水晶體：約 1.2–1.6%', b: '（英國全國資料）' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4) + JSON.stringify(TX5);
const C_VB = '#4f6d3a', C_PULL = COL.amber;                      // vitreous base annotations; the pull on the flap
// iatrogenic breaks in RRD repair by gauge (Neffendorf 2017: 23G 1.9%, 20G 5.8%) as two bars
function breakBars(x, y, op) {
  const W = 190, rows = [[TX5.brk.a, 1.9, COL.accent], [TX5.brk.b, 5.8, COL.red]];
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${W + 130}" height="98" rx="9" fill="#fff" stroke="#d3dae1"/>` + text(x + 12, y + 24, TX5.brk.title, { size: 14, bold: true });
  rows.forEach(([t, v, c], i) => { const yy = y + 42 + i * 28, w = W * v / 6; s += text(x + 12, yy + 13, t, { size: 14, bold: true, color: COL.sub }) +
    `<rect x="${x + 56}" y="${yy}" width="${F1(w)}" height="17" rx="3" fill="${c}" opacity="0.85"/>` + text(F1(x + 62 + w), yy + 14, v + '%', { size: 14, bold: true, color: c }); });
  return s + '</g>';
}
// a call-out box (top of a panel): two lines, the second in red
const callout = (x, y, w, a, b, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="88" rx="10" fill="#fff" stroke="${COL.red}" stroke-width="3"/>` +
  text(x + w / 2, y + 34, a, { size: 19, bold: true, anchor: 'middle' }) + text(x + w / 2, y + 68, b, { size: 22, bold: true, color: COL.red, anchor: 'middle' }) + '</g>';
// the strand of gel on the flap (the model's cord) as an arrow from the flap's free edge, L mm long, in a view's coordinates (to: 3D → panel px)
function pullArrow(st, to, L, op) { const c = POSTERIOR.makeCtx(POSTERIOR.geom(st)).cord, d = GLOBE.unit(GLOBE.sub(c.b, c.a)); if (!(GLOBE.len(GLOBE.sub(c.b, c.a)) > 0.05)) return '';
  return arrowP([to(c.a), to(GLOBE.add(c.a, d.map(v => v * L)))], C_PULL, op, 'arrM', 4); }
const wpx = (V, p3) => V.P(V.r.map.proj(p3));                     // a 3D point in panel px of a VP.wide view

DRAW2['5-1'] = T => {
  const P = POSTERIOR, G = GLOBE, h = VP.SEC_H;
  // ---------------- the state of this frame (both panels): lines 0–2 before shaving; line 3 shaving (steps); line 4 the far reach (示意)
  const kS = T.p(3, 0.12, 0.75), kF = T.on(4, 0.8, 0.2), st = VP.shaveStep(kS), done = kS >= 1;
  const op0 = T.on(0) * (1 - T.on(1, 0.6)), op1 = T.on(1, 0.6) * (1 - T.on(3, 0.6)), op2 = T.on(2, 0.6) * (1 - T.p(3, 0.1, 0.2)), op3 = T.on(3, 0.6) * (1 - kF);
  // ---------------- left: the 11 o'clock periphery of the 11–5 section (zoomed), then (line 4) the 10:30 section with the far reach
  const S = VP.sec(st, PW, PH, VP.WIN.depZ, 's51', { tw: VP.WIN.depZT, step: 0.025 }), a = S.A, toS = p3 => S.P(G.toPlane(S.r.plane, p3)), ora = P.oraAt(h, 1);
  let sl = S.svg, el = '';
  // line 0: the two principles; ① the tear, ② the gel pulling its flap
  sl += `<g opacity="${op0}">` + infoCard(14, 14, 240, [[TX5.rule.title, { bold: true, size: 15 }], [TX5.rule.a, { color: COL.accent, bold: true, size: 15, op: T.on(0, 0.5, 0.4) }], [TX5.rule.b, { color: C_PULL, bold: true, size: 15, op: T.p(0, 0.5, 0.6) }]], { lh: 32 }) + '</g>';
  el += lab('① 裂孔', 'tear', 14, 330, a.tearMid, { bold: true, color: '#9c2a1a', lc: '#9c2a1a', op: op0 * T.on(0, 0.5, 0.4) });
  el += lab('② 拉著瓣的玻璃體', 'traction', PW - 12, 160, a.flapEdge, { side: 'R', bold: true, color: C_PULL, lc: C_PULL, op: op0 * T.p(0, 0.5, 0.6) });
  // line 1: the vitreous base straddles the ora (bracket outside the wall from its front to its back border, a tick at the ora); the tear on its back border
  const vbA = P.vbAntAt(h, 1), vbP = P.vbPostAt(h, 1), oraT = [wallPx(S, h, ora, -0.45), wallPx(S, h, ora, -1.15)];
  sl += arcDim(S, h, vbA, vbP, -0.8, C_VB, op1) + `<path d="M${F1(oraT[0][0])} ${F1(oraT[0][1])}L${F1(oraT[1][0])} ${F1(oraT[1][1])}" stroke="${RDC}" stroke-width="3" opacity="${op1}"/>`;
  el += lab('vitreous base：跨在 ora 上', '', PW - 12, 40, wallPx(S, h, (vbA + vbP) / 2 - 0.9, -0.8), { side: 'R', bold: true, color: C_VB, lc: C_VB, op: op1 });
  el += lab('ora', 'serrata', PW - 12, 92, oraT[1], { side: 'R', bold: true, color: RDC, lc: RDC, op: op1 });
  el += lab('裂孔就在它的後緣', 'HST', 14, 330, a.hinge, Object.assign({ op: op1 * (1 - T.on(2, 0.5)) }, HST));
  // line 2: the flap pulled forward by the gel (the strand on its free edge); Govetto 2024: traction at the anterior edge of all 106 tears
  sl += pullArrow(st, toS, 2.6, op2);
  el += lab('瓣', 'flap', 14, 260, a.flapEdge, { bold: true, op: op2 });
  el += lab('玻璃體把瓣往前拉', 'traction', 14, 40, toS(P.makeCtx(P.geom(st)).cord.b), { bold: true, color: C_PULL, lc: C_PULL, op: op2 });
  sl += `<g opacity="${op2}">` + infoCard(14, PH - 84, 300, [['widefield OCT：106 個裂孔', { bold: true, size: 15 }], ['前緣全都有玻璃體牽拉', { color: C_PULL, bold: true, size: 15 }]], { lh: 26, h: 70 }) + '</g>';
  // line 3: shaving round the tear; the strand on the flap cut at the last step
  el += lab('切割頭（切面）', 'vitrector', PW - 12, 330, a.inst0, { side: 'R', bold: true, op: T.on(3, 0.6) * (1 - kF) });
  el += lab('shaving：切掉周邊的玻璃體', '', 14, 40, a.vbR, { bold: true, color: COL.accent, lc: COL.accent, op: op3 * (done ? 1 - T.p(3, 0.8, 0.86) : 1) });
  el += lab('拉力解除：瓣不再被拉', 'released', 14, 40, a.flapEdge, { bold: true, color: COL.accent, lc: COL.accent, op: op3 * T.p(3, 0.8, 0.86) });
  // line 4 (示意): the 10:30 section, the cutter reaching the far periphery behind the lens
  let PL = PT.sec5;
  if (kF > 0) { const F = VP.sec(VP.ST.far5, PW, PH, VP.WIN.sec, 's51f', { h: VP.SEC4_H, tw: VP.WIN.secT }), b = F.A, near = VP.lensNear(VP.ST.far5), q = F.P(G.toPlane(F.r.plane, near.p));
    sl += `<g opacity="${kF.toFixed(3)}">${F.svg}<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="13" fill="none" stroke="${COL.red}" stroke-width="2.5"/></g>` + badge(14, PH - 44, '示意：清對側的周邊', COL.sub, kF);
    sl += `<g opacity="${kF * T.on(4, 0.6, 1.2)}">` + infoCard(PW - 286, PH - 116, 272, [[TX5.lens.title, { bold: true, size: 15 }], [TX5.lens.a, { color: COL.red, bold: true, size: 15 }], [TX5.lens.b, { color: COL.sub, size: 13 }]], { lh: 26, h: 100 }) + '</g>';
    el += lab('水晶體', 'lens', 14, 40, b.lensBack, { bold: true, op: kF });
    el += lab('器械從水晶體後方經過', '', PW - 12, 40, q, { side: 'R', bold: true, color: COL.red, lc: COL.red, op: kF * T.on(4, 0.6, 0.6) });
    el += lab('切割頭', 'vitrector', 14, 260, b.inst0, { bold: true, op: kF });
    if (kF > 0.5) PL = PT.sec5far; }
  // ---------------- right: the surgeon's wide-angle view of the same state (inverter on, looking toward 11; line 4 toward 4:30)
  const Wv = wide4(VP.on11(st), 'w51', {}), Wt = Wv.Wt, A = Wv.V.A, Gm = P.geom(st);
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + Wv.svg + mark11(Wt, 1) + badge(12, 10, 'inverter 開', COL.accent), er = '';
  er += lab('11 點裂孔', 'HST', PW - 12, 300, A.tear, Object.assign({ side: 'R', op: (1 - kF) * (1 - op1) }, HST));
  // line 1: the vitreous base on the wide view (the model's tinted band; its back border dashed) beside the tear
  const hb = h + 0.45, pB = wpx(Wv.V, Gm.ret(hb, vbP, 1)), pO = wpx(Wv.V, Gm.ret0(hb, ora, 0.5));
  er += lab('vitreous base 後緣（虛線）', '', PW - 12, 64, pB, { side: 'R', bold: true, color: C_VB, lc: '#ffffff', op: op1 });
  er += lab('ora', 'serrata', PW - 12, 120, pO, { side: 'R', bold: true, color: RDC, lc: '#ffffff', op: op1 });
  er += lab('裂孔在後緣', 'HST', PW - 12, 300, A.tear, Object.assign({ side: 'R', op: op1 }, HST));
  // line 2: the pull on the flap (示意 arrow along the strand); line 3: the TA specks on the gel go with the shaving
  sr += pullArrow(st, p3 => wpx(Wv.V, p3), 2.6, op2);
  er += lab('瓣被玻璃體往前拉', 'traction', 14, 64, A.flapEdge, { bold: true, color: C_PULL, lc: '#ffffff', op: op2 });
  er += lab('切割頭', 'vitrector', 14, 352, A.inst0, { bold: true, op: T.on(3, 0.6) * (1 - kF) });
  er += lab('沾了 TA 的周邊玻璃體被切掉', '', 14, 64, null, { bold: true, color: COL.accent, op: op3 * (done ? 1 - T.p(3, 0.8, 0.86) : 1) });
  er += lab('拉力解除', 'released', 14, 64, A.flapEdge, { bold: true, color: COL.accent, lc: '#ffffff', op: op3 * T.p(3, 0.8, 0.86) });
  let PR = PT.w5;
  if (kF > 0) { const Wf = wide4(VP.ST.far5On, 'w51f', {});
    sr += `<g opacity="${kF.toFixed(3)}"><rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>${Wf.svg}</g>` + badge(12, 10, 'inverter 開', COL.accent, kF) + badge(PW - 214, 10, '示意：清對側的周邊', COL.sub, kF);
    er += lab('切割頭伸到對側周邊', 'vitrector', PW - 12, 352, Wf.V.A.inst0, { side: 'R', bold: true, op: kF });
    er += lab('水晶體後方那段桿離焦，沒畫', '', 14, 396, null, { color: COL.sub, op: kF });
    if (kF > 0.5) PR = PT.w5far; }
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: PR } };
};

DRAW2['5-2'] = T => {
  const P = POSTERIOR, G = GLOBE, h = VP.DEP_H;
  // ---------------- the state of this frame (both panels): line 1 the depressor goes in (VP.depStep, the same step in both views)
  const kD = T.p(1, 0.15, 0.6), stS = VP.depStep(VP.ST.dep52, kD), stW = VP.depStep(VP.ST.dep52On, kD), dp = VP.ST.dep52.dep;
  const op2 = T.on(2, 0.6) * (1 - T.on(3, 0.5)), op3 = T.on(3, 0.6), op4 = T.on(4, 0.6) * (1 - T.on(5, 0.5)), op5 = T.on(5, 0.6);
  // ---------------- left: the 11 o'clock periphery (zoomed 11–5 section) with the depressor, the cutter, and (line 3) the retina before the press
  const S = VP.sec(stS, PW, PH, VP.WIN.depZ, 's52', { tw: VP.WIN.depZT, step: 0.025 }), a = S.A, toS = p3 => S.P(G.toPlane(S.r.plane, p3));
  let sl = S.svg, el = '';
  const G0 = P.geom(VP.depStep(VP.ST.dep52, 0)), ghost = []; for (let s = dp.s - 3.2; s <= dp.s + 3.2; s += 0.1) ghost.push(toS(G0.ret(h, s, 1)));
  sl += `<path d="${pth(ghost)}" fill="none" stroke="${COL.ink}" stroke-width="2" stroke-dasharray="6 5" opacity="${op3 * 0.85}"/>`;
  const g0 = toS(G0.ret(h, dp.s, 1)), g1 = toS(P.geom(stS).ret(h, dp.s, 1));
  sl += arrowP([g0, [lerp(g0[0], g1[0], 0.85), lerp(g0[1], g1[1], 0.85)]], COL.accent, op3 * (kD > 0.9 ? 1 : 0), 'arrA', 3.5);
  el += lab('切割頭（切面）', 'vitrector', PW - 12, 40, a.inst0, { side: 'R', bold: true, op: T.on(0) });
  el += lab('11 點裂孔', 'HST', 14, 330, a.tearMid, Object.assign({ op: T.on(0) * (1 - op3) }, HST));
  el += lab('助手壓鞏膜', 'depressor', PW - 12, 330, a.depressor, { side: 'R', bold: true, op: T.p(1, 0.3, 0.4) * (1 - op2) });
  el += lab('壓哪裡、多深、多久：聽口令', '（示意）', PW - 12, 330, a.depressor, { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: op2 });
  el += lab('也有主刀用 chandelier 自己壓', '', 14, 40, null, { color: COL.sub, op: T.on(1, 0.6, 1.2) * (1 - T.on(2, 0.5)) });
  el += lab('文獻沒有統一的做法', '', 14, 40, null, { bold: true, color: COL.amber, op: op2 * T.on(2, 0.6, 1.0) });
  el += lab('壓之前的視網膜', 'before', 14, 330, ghost[Math.round(ghost.length * 0.2)], { op: op3 });
  el += lab('周邊被推向切割頭', '', 14, 40, g1, { bold: true, color: COL.accent, lc: COL.accent, op: op3 * (1 - op4) * (1 - op5) });
  sl += badge(14, PH - 44, '示意', COL.sub, op2) + breakBars(14, 14, op4);
  // ---------------- right: the surgeon's wide-angle view of the same press (inverter on, looking toward 11): the mound; line 5 the call-out
  const Wv = wide4(stW, 'w52', {}), Wt = Wv.Wt, A = Wv.V.A;
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + Wv.svg + mark11(Wt, 1) + badge(12, 10, 'inverter 開', COL.accent), er = '';
  er += lab('切割頭', 'vitrector', PW - 12, 352, A.inst0, { side: 'R', bold: true, op: T.on(0) * (1 - op5) });
  if (A.dep) { er += lab('11 點的隆起', 'mound', 14, 300, A.dep, { bold: true, op: T.p(1, 0.5, 0.6) * (1 - op5) });
    er += lab('周邊被推進視野', '', 14, 352, A.dep, { bold: true, color: COL.accent, lc: '#ffffff', op: op3 * (1 - op5) }); }
  sr += callout(PW - 352, 44, 340, TX5.say.a, TX5.say.b, op5);
  return { L: { svg: sl, extra: el, P: PT.sec52 }, R: { svg: sr, extra: er, P: PT.w52 } };
};

// ---------------------------------------------------------------- 6 讓視網膜貼回
// Chapter 6 (the patient supine: gravity toward the posterior pole = down in the 11–5 section, anterior up). 6-1: PFCL through a needle (示意) at the
// pole in VP.PFCL_STEPS steps — its surface (a plane perpendicular to gravity) rises, the retina below it is flattened from behind forward, the surface
// always below the 11 o'clock tear; the subretinal fluid pushed forward and out of the tear (arrows, 示意); line 3 a drainage retinotomy instead
// (位置示意); line 4 the surgeon's choice. 6-2: air from the 4:30 infusion fills the top (anterior) and its surface goes down to the PFCL (VP.AIR_STEPS;
// the detachment left above the PFCL comes down with it, 示意: the order is the surgeon's), then the PFCL out (VP.OUT_STEPS): the retina all flat;
// lines 2–4 the macula zoomed: a PFCL bead left under the retina (place and size 示意), the outer retina over it gone (示意), only a subfoveal one
// treated (Sigler 2013), the call-out. Right: the surgeon's wide view of the same state (inverter on, turned 16° toward 11, 示意).
Object.assign(PT, {
  sec61: { title: '經 11 點的子午切面（仰躺）', orient: VP.OR.sec },
  w6: { title: '術者的廣角畫面', orient: VP.OR.w6 },
  sec62z: { title: '子午切面：黃斑附近放大', orient: VP.OR.sec },
  w62z: { title: '廣角：黃斑附近放大', orient: VP.OR.w6 },
});
const TX6 = {   // texts drawn by helpers (listed for the font preload)
  dr: { title: '另一種做法：drainage retinotomy', a: '日本全國登錄的比較', b: '結果沒有變差' },
  pick: { title: '用哪一種：依主刀決定', a: '① PFCL：經原本的裂孔排出', b: '② 另開 drainage retinotomy 排液' },
  ret: { title: '視網膜下殘留 PFCL（23G 的系列）', a: '約 4.5%–10.3%', b: '作者：和 23G 套管水流較快有關' },
  say: { a: '看到視網膜下可疑的小珠子', b: '→ 提出來讓主刀確認' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4) + JSON.stringify(TX5) + JSON.stringify(TX6);
const C_PF = '#5b4596';                                            // PFCL labels (the model draws PFCL lavender)
const inField = (V, p3) => p3 && Math.hypot(...V.r.map.proj(p3)) < V.M.R * 0.97;   // a 3D point inside the wide view's field
// a wide view (inverter on) in a window, with the clock numbers (op) round it; Wt-like { A, c, r } for the chapter 3 helpers
function wide6(st, id, win, o, opC = 1) { const V = VP.wide(st, PW, PH, win, id, o), Wt = { A: V.A, c: V.P([0, 0]), r: V.M.R * V.k }; return { V, Wt, svg: V.svg + clockNums(Wt, opC) }; }

DRAW2['6-1'] = T => {
  const P = POSTERIOR, G = GLOBE;
  // ---------------- the state of this frame (both panels): line 0 detached; line 1 the needle in, then PFCL in steps; line 3 the drainage retinotomy instead (no PFCL)
  const kN = T.on(1, 0.01), kP = T.p(1, 0.15, 0.85), kR = T.on(3, 0.8), stP = kN > 0 ? VP.pfclStep(kP) : VP.ST.pre61, stR = VP.ST.pre61;
  const op1 = T.on(1, 0.6) * (1 - kR), op2 = T.on(2, 0.6) * (1 - kR), kF = T.p(2, 0.1, 0.6), F = VP.flow61(stP), Rt = VP.rtomy(stR);
  // ---------------- left: the 11–5 section (right = 11, left = 5; supine: gravity down)
  const o = { tw: VP.WIN.secT }, S = VP.sec(stP, PW, PH, VP.WIN.sec, 's61', o), a = S.A, toS = p3 => S.P(G.toPlane(S.r.plane, p3));
  let sl = S.svg, el = '';
  if (kR > 0) sl += `<g opacity="${kR.toFixed(3)}">${VP.sec(stR, PW, PH, VP.WIN.sec, 's61r', o).svg}</g>`;
  sl += arrowP([[40, 58], [40, 126]], COL.ink, op1, 'arrK', 5);                                     // gravity (supine): toward the posterior pole
  // line 2: the fluid pushed forward under the retina and out of the 11 o'clock tear (示意)
  sl += arrowP(cutPts(F.tear.map(toS), kF), C_PULL, op2, 'arrM', 3.5) + arrowP(cutPts(F.five.map(toS), kF), C_PULL, op2, 'arrM', 3.5);
  // line 3: the drainage retinotomy (位置示意): a gap across the retina and the fluid out of it
  if (kR > 0) { const q = toS(Rt.mid); sl += `<g opacity="${kR.toFixed(3)}"><path d="${pth(Rt.gap.map(toS), true)}" fill="${P.C.bss}"/><circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="9" fill="none" stroke="${COL.red}" stroke-width="2.2"/></g>`;
    sl += arrowP(cutPts(Rt.path.map(toS), T.p(3, 0.3, 0.8)), C_PULL, kR, 'arrM', 3.5); }
  sl += note('PFCL 的量為示意', T.on(1, 0.6) * (1 - kR), PH - 14, 14, 'start') + badge(14, PH - 44, '另一種做法（示意）', COL.sub, kR);
  sl += `<g opacity="${(kR * T.on(3, 0.6, 1.0)).toFixed(3)}">` + infoCard(14, 14, 290, [[TX6.dr.title, { bold: true, size: 15 }], [TX6.dr.a, { size: 15 }], [TX6.dr.b, { bold: true, size: 15, color: COL.accent }]], { lh: 28, h: 104 }) + '</g>';
  sl += `<g opacity="${T.on(4, 0.6).toFixed(3)}">` + infoCard(PW - 318, PH - 122, 304, [[TX6.pick.title, { bold: true, size: 15, color: COL.accent }], [TX6.pick.a, { size: 15 }], [TX6.pick.b, { size: 15 }]], { lh: 28, h: 104 }) + '</g>';
  const pfL = a.pfclLineA && a.pfclLineB ? (a.pfclLineA[0] < a.pfclLineB[0] ? [a.pfclLineA, a.pfclLineB] : [a.pfclLineB, a.pfclLineA]) : null;
  el += lab('11 點裂孔', 'HST', PW - 12, 40, a.tearMid, Object.assign({ side: 'R', op: T.on(0) * (1 - kR) }, HST));
  el += lab('視網膜下液：要先排出去', 'SRF', 14, 160, toS(F.five[Math.round(F.five.length * 0.5)]), { bold: true, op: T.on(0) * (1 - T.on(1, 0.5)) });
  el += lab('仰躺：重力朝後極', 'gravity', 14, 40, null, { bold: true, color: '#2b5a8a', op: op1 });
  el += lab('PFCL 注射針（示意）', 'needle', PW - 12, 392, a.inst0, { side: 'R', bold: true, op: kN * (1 - kR) });
  el += lab('PFCL', '', 14, 300, toS(VP.inPl(VP.SEC_H, -1.5, -9.6)), { bold: true, color: C_PF, lc: C_PF, op: T.p(1, 0.2, 0.3) * (1 - kR) });
  if (pfL) el += lab('液面：垂直重力', 'interface', 14, 230, pfL[0], { bold: true, color: C_PF, lc: C_PF, op: T.p(1, 0.3, 0.4) * (1 - kR) });
  el += lab('液面以下：視網膜壓平', 'flattened', 14, 350, a.macOff, { bold: true, color: COL.accent, lc: COL.accent, op: T.p(1, 0.45, 0.55) * (1 - kR) });
  if (pfL) el += lab('液面低於 11 點裂孔', '', PW - 12, 200, pfL[1], { side: 'R', bold: true, color: C_PF, lc: C_PF, op: op2 });
  el += lab('從 11 點裂孔排出', 'drainage', PW - 12, 120, toS(F.out), { side: 'R', bold: true, color: C_PULL, lc: C_PULL, op: op2 * T.p(2, 0.4, 0.5) });
  el += lab('視網膜下液往前推', 'SRF', 14, 160, toS(F.five[Math.round(F.five.length * 0.5)]), { bold: true, color: C_PULL, lc: C_PULL, op: op2 });
  el += lab('drainage retinotomy', '（位置示意）', 14, 230, toS(Rt.mid), { bold: true, color: COL.red, lc: COL.red, op: kR * T.on(3, 0.6, 0.4) });
  // ---------------- right: the surgeon's wide view of the same state (inverter on, turned 16° toward 11, 示意); inside the PFCL's edge the retina is drawn flat
  const WP = wide6(VP.w6(stP), 'w61', VP.WIN.wide3, { pfclFlat: true }), b = WP.V.A;
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + WP.svg, er = '';
  if (kR > 0) sr += `<g opacity="${kR.toFixed(3)}">${wide6(VP.w6(stR), 'w61r', VP.WIN.wide3, {}).svg}</g>`;
  sr += mark11(WP.Wt, 1) + badge(12, 10, 'inverter 開', COL.accent);
  // line 2: the same 3D paths of the fluid, the parts inside the field
  { const inF = pts => pts.filter(p => inField(WP.V, p)).map(p => wpx(WP.V, p)); sr += arrowP(cutPts(inF(F.st), kF), C_PULL, op2, 'arrM', 3.5) + arrowP(cutPts(inF(F.tear), kF), C_PULL, op2, 'arrM', 3.5); }
  if (kR > 0) { const q = wpx(WP.V, Rt.top); sr += `<g opacity="${kR.toFixed(3)}"><circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="3.5" fill="#7e1c10"/><circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="11" fill="none" stroke="${COL.red}" stroke-width="2.4"/></g>`; }
  er += lab('11 點裂孔', 'HST', PW - 12, 352, b.tear, Object.assign({ side: 'R', op: 1 - kR }, HST));
  er += lab('光導管', 'light pipe（1 點半）', 14, 352, b.inst1, { bold: true, color: '#8a6d00', lc: '#e8c95a', op: T.on(0) * (1 - kR) });
  er += lab('PFCL 注射針（示意）', 'needle（10 點半）', PW - 12, 64, b.inst0, { side: 'R', bold: true, lc: '#ffffff', op: kN * (1 - T.on(2, 0.5)) * (1 - kR) });
  er += lab('PFCL 液面', 'interface', PW - 12, 300, b.pfclEdge, { side: 'R', bold: true, color: C_PF, lc: '#e6dcff', op: T.p(1, 0.4, 0.5) * (1 - kR) });
  er += lab('液面以內：視網膜貼平', '', 14, 64, b.fovea, { bold: true, color: COL.accent, lc: '#ffffff', op: T.p(1, 0.5, 0.6) * (1 - T.on(2, 0.5)) * (1 - kR) });
  er += lab('視網膜下液從裂孔排出', '', PW - 12, 64, wpx(WP.V, F.out), { side: 'R', bold: true, color: C_PULL, lc: '#ffd27a', op: op2 * T.p(2, 0.4, 0.5) });
  er += lab('drainage retinotomy', '（位置示意）', 14, 130, wpx(WP.V, Rt.top), { bold: true, color: COL.red, lc: '#ff8f7a', op: kR * T.on(3, 0.6, 0.4) });
  return { L: { svg: sl, extra: el, P: PT.sec61 }, R: { svg: sr, extra: er, P: PT.w6 } };
};

DRAW2['6-2'] = T => {
  const P = POSTERIOR, G = GLOBE;
  // ---------------- the state of this frame (both panels): line 0 air down to the PFCL (steps); line 1 the PFCL out (steps); line 2 on the macula, the bead fades in
  const kA = T.p(0, 0.08, 0.85), kO = T.p(1, 0.1, 0.85), in1 = T.on(1, 0.01) > 0, stX = in1 ? VP.outStep(kO) : VP.airStep(kA);
  const z = T.p(2, 0, 0.3), kB = T.p(2, 0.3, 0.45), opX = 1 - ss(0, 0.5, z), op3 = T.on(3, 0.6), op4 = T.on(4, 0.6), Gx = P.geom(stX);
  const stZ = z > 0 ? VP.ST.done62 : stX;
  // ---------------- left: the 11–5 section, whole eye; line 2 zoomed on the macula (finer section crossfaded in)
  const win = VIEWS.zwin(VP.WIN.sec, VP.WIN.fov, z);
  const secOf = (st, id) => { const C = VP.sec(st, PW, PH, win, id, { tw: VP.WIN.secT }); if (z <= 0.4) return C;
    const Fz = VP.sec(st, PW, PH, win, id + 'z', { tw: VP.WIN.fovT, step: 0.015 }); return Object.assign({}, C, { svg: C.svg + `<g opacity="${ss(0.4, 0.9, z).toFixed(3)}">${Fz.svg.replace(/^<rect[^>]*\/>/, '')}</g>`, A: z > 0.9 ? Fz.A : C.A }); };
  const S = secOf(stZ, 's62'), toS = p3 => S.P(G.toPlane(S.r.plane, p3));
  let sl = S.svg, el = '', a = S.A;
  if (kB > 0) { const SB = secOf(VP.ST.bead62, 's62b'); sl += `<g opacity="${kB.toFixed(3)}">${SB.svg.replace(/^<rect[^>]*\/>/, '')}</g>`; if (kB > 0.5) a = SB.A; }
  // lines 0–1: the infusion (4:30, off the section: dashed where it projects onto it) and the air rising from it
  const inf = P.troc(Gx).find(t => t.inf), qi = toS(inf.tip), opI = T.on(0) * (1 - T.on(1, 0.5)) * opX;
  sl += `<circle cx="${F1(qi[0])}" cy="${F1(qi[1])}" r="8" fill="none" stroke="#24527d" stroke-width="2" stroke-dasharray="4 3" opacity="${opI}"/>` + arrowP([[qi[0] + 6, qi[1] - 8], [qi[0] + 24, qi[1] - 34]], COL.suture, opI, 'arrB', 3);
  // a point in the air (scanning down the 11 o'clock side 6 mm from the axis) and in the PFCL
  const f = P.makeCtx(Gx); let air = null; if (stX.gas > 0) for (let zz = 7.6; zz > Gx.lev.gas; zz -= 0.1) { const p = VP.inPl(VP.SEC_H, 6, zz); if (f.gas(f.at(p)) < 0) { air = VP.inPl(VP.SEC_H, 6, Math.max(Gx.lev.gas + 0.4, zz - 0.5)); break; } }
  const gl = a.gasLineA && a.gasLineB ? (a.gasLineA[0] > a.gasLineB[0] ? a.gasLineA : a.gasLineB) : null;
  sl += badge(14, PH - 44, '順序依主刀（示意）', COL.sub, opX * T.on(0, 0.6));
  el += lab('infusion', '4 點半，在切面外', 14, 40, qi, { bold: true, color: '#24527d', lc: '#24527d', op: opI });
  el += lab('空氣', 'air', PW - 12, 40, air && toS(air), { side: 'R', bold: true, op: (air ? 1 : 0) * T.on(0, 0.6, 0.6) * opX });
  el += lab('氣液界面：垂直重力', '往後極下降', PW - 12, 160, gl, { side: 'R', bold: true, color: '#2b5a8a', lc: '#2b5a8a', op: (gl ? 1 : 0) * T.on(0, 0.6, 1.2) * opX });
  el += lab(in1 ? '吸 PFCL（示意）' : '主刀在後面吸液體（示意）', 'needle', PW - 12, 300, a.inst0, { side: 'R', bold: true, op: opX * (stX.inst.length ? 1 : 0) * T.on(0, 0.6, 1.6) });
  el += lab('PFCL', '', 14, 300, toS(VP.inPl(VP.SEC_H, -1.5, -9.6)), { bold: true, color: C_PF, lc: C_PF, op: (stX.pfcl > 0.06 ? 1 : 0) * opX });
  el += lab('PFCL 也要吸乾淨', '', 14, 230, null, { bold: true, color: C_PF, op: T.on(1, 0.6) * (1 - T.p(1, 0.85, 0.95)) * opX });
  el += lab('交換結束：視網膜全部貼平', '', 14, 230, null, { bold: true, color: COL.accent, op: T.p(1, 0.85, 0.95) * opX });
  // lines 2–4 (zoomed): the bead under the retina, the outer retina over it gone (示意), the fovea (1.5 mm) and the card
  if (z > 0.9) { const Gb = P.geom(VP.ST.bead62), B = VP.BEAD, band = [];
    for (let i = 0; i <= 16; i++) band.push(toS(Gb.ret(B.h, B.s - 0.8 * B.r + 1.6 * B.r * i / 16, 0.03)));
    for (let i = 16; i >= 0; i--) band.push(toS(Gb.ret(B.h, B.s - 0.8 * B.r + 1.6 * B.r * i / 16, 0.45)));
    sl += `<path d="${pth(band, true)}" fill="#fff6f2" stroke="${COL.red}" stroke-width="1.4" stroke-dasharray="4 3" opacity="${op3}"/>`;
    const fv = a.fovea, k = S.k, yb = fv[1] - 0.45 * k, x0 = fv[0] - 0.75 * k, x1 = fv[0] + 0.75 * k;
    sl += `<path d="M${F1(x0)} ${F1(yb + 7)}L${F1(x0)} ${F1(yb)}L${F1(x1)} ${F1(yb)}L${F1(x1)} ${F1(yb + 7)}" stroke="${COL.accent}" stroke-width="2.2" fill="none" stroke-dasharray="5 3" opacity="${T.on(3, 0.6, 1.2)}"/>`;
    sl += VIEWS.sbar(k, 1);
    el += lab('殘留的 PFCL：在視網膜下', 'retained PFCL', 14, 300, a.bead, { bold: true, color: C_PF, lc: C_PF, op: kB });
    el += lab('fovea', '', PW - 12, 300, fv, { side: 'R', bold: true, op: 1 });
    el += lab('外層視網膜消失（示意）', 'outer retina', 14, 60, band[8], { bold: true, color: COL.red, lc: COL.red, op: op3 });
    el += lab('在 fovea 下的，作者才建議處理', '', PW - 12, 350, [fv[0], yb], { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(3, 0.6, 1.2) });
    if (a.bead) sl += `<circle cx="${F1(a.bead[0])}" cy="${F1(a.bead[1] - 0.1 * k)}" r="${F1(VP.BEAD.r * k * 1.9)}" fill="none" stroke="${COL.red}" stroke-width="3" opacity="${op4}"/>`; }
  sl += `<g opacity="${(T.on(2, 0.6, 1.0) * (z > 0.9 ? 1 : 0)).toFixed(3)}">` + infoCard(PW - 306, 14, 292, [[TX6.ret.title, { bold: true, size: 15 }], [TX6.ret.a, { bold: true, size: 15, color: C_PF }], [TX6.ret.b, { size: 14 }]], { lh: 28, h: 104 }) + '</g>';
  sl += note('小珠子的位置與大小為示意', kB, PH - 14, PW - 12);
  // ---------------- right: the surgeon's wide view of the same state (inverter on, turned 16° toward 11, 示意); line 2 zoomed on the macula
  const winW = VIEWS.zwin(VP.WIN.wide3, VP.WIN.w62z, z), WV = wide6(VP.w6(stZ), 'w62', winW, { pfclFlat: true }, opX), b = WV.V.A;
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + WV.svg, er = '', bb = b;
  if (kB > 0) { const WB = wide6(VP.w6(VP.ST.bead62), 'w62b', winW, {}, opX); sr += `<g opacity="${kB.toFixed(3)}">${WB.svg}</g>`; bb = WB.V.A; }
  sr += mark11(WV.Wt, opX) + badge(12, 10, 'inverter 開', COL.accent);
  // line 0: the air comes in from the 4:30 infusion (an arrow at the rim of the field)
  { const c = WV.Wt.c, d = [0, 1].map(i => (b.clock4[i] - c[i]) / Math.hypot(b.clock4[0] - c[0], b.clock4[1] - c[1]) + (b.clock5[i] - c[i]) / Math.hypot(b.clock5[0] - c[0], b.clock5[1] - c[1])), l = Math.hypot(...d), u = d.map(v => v / l), r = WV.Wt.r;
    const p0 = [c[0] + u[0] * (r + 30), c[1] + u[1] * (r + 30)], p1 = [c[0] + u[0] * (r - 14), c[1] + u[1] * (r - 14)];
    sr += arrowP([p0, p1], COL.suture, opI, 'arrB', 4); er += lab('空氣從 infusion 進來', '4 點半', 14, 64, p0, { bold: true, color: '#9ec5e8', lc: '#9ec5e8', op: opI }); }
  const ge = stX.gas > 0 && stX.gas < 1 ? VP.edgeAt(stX, Gx.lev.gas, VP.SEC_H) : null, pe = stX.pfcl > 0 ? VP.edgeAt(stX, Gx.lev.pfcl, VP.SEC_H) : null;
  er += lab('氣液界面', 'air–fluid', PW - 12, 64, inField(WV.V, ge) ? wpx(WV.V, ge) : null, { side: 'R', bold: true, color: '#24425f', lc: '#ffffff', op: (inField(WV.V, ge) ? 1 : 0) * opX * (1 - T.on(1, 0.5)) });
  er += lab('PFCL 液面', 'interface', PW - 12, 300, inField(WV.V, pe) ? wpx(WV.V, pe) : null, { side: 'R', bold: true, color: C_PF, lc: '#e6dcff', op: (inField(WV.V, pe) ? 1 : 0) * opX });
  er += lab(in1 ? '吸 PFCL（示意）' : '吸液體（示意）', 'needle', 14, 352, b.inst0, { bold: true, lc: '#ffffff', op: opX * (stX.inst.length ? 1 : 0) * T.on(0, 0.6, 1.6) });
  if (z > 0.9) { const q = bb.bead; er += lab('可疑的小珠子', '視網膜下', PW - 12, 300, q, { side: 'R', bold: true, color: C_PF, lc: '#e6dcff', op: kB });
    er += lab('fovea', '', 14, 300, b.fovea, { bold: true, lc: '#ffffff', op: 1 });
    if (q) sr += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(VP.BEAD.r * WV.V.k * 2.2)}" fill="none" stroke="${COL.red}" stroke-width="3" opacity="${op4}"/>`; }
  sr += callout(PW - 352, 44, 340, TX6.say.a, TX6.say.b, op4);
  return { L: { svg: sl, extra: el, P: z > 0.5 ? PT.sec62z : PT.sec61 }, R: { svg: sr, extra: er, P: z > 0.5 ? PT.w62z : PT.w6 } };
};

// ---------------------------------------------------------------- 7 雷射、C3F8 與關傷口
// Chapter 7 (after chapter 6: the retina flat, the eye full of air, the patient supine). 7-1: the 11–5 section zoomed on the 11 o'clock tear + the
// surgeon's wide view looking toward 11 (示意): the endolaser probe from the 10:30 port lays the model's two rings round the tear (rows and spacing 示意)
// in VP.LASER_STEPS steps, both views drawing the same state; line 1 the spots turn into scars (示意) and an inset after the operation, sitting: the
// bubble at the top covers the tear (bubble size 示意; chapter 8); line 2 the fundus chart with the band where a 360° laser would go (示意) and the
// studies; line 3 (另一種做法, 示意) a cryo probe pressed on the sclera over the tear from outside (Lai 2019), away from the lens. 7-2: no eye — the
// expansion of pure C3F8 (curve shape 示意) and its bubble, the mixture, the 50 mL syringe in three steps (C3F8: no scale, the amount 依院內常規), the SF6
// example and its error (Kanclerz 2018b), the two other errors, the call-out. 7-3: the 4:30–10:30 section (the infusion and the 10:30 port in the plane)
// + the microscope view: the mixed gas flushed through the eye (colour 示意: one uniform mixture going from air to the mix; the vent 示意), the volumes,
// every cannula out at once (the order 依主刀), each wound checked; line 3 the tunnel cross-section of the infusion port with the gas against its inner end.
Object.assign(PT, {
  sec71: { title: '經 11 點的子午切面：裂孔周圍放大', orient: VP.OR.sec },
  ch71: { title: '眼底圖：360 度雷射的位置（示意）', orient: VP.OR.chart },
  sec71c: { title: '經 11 點的子午切面：冷凍（示意）', orient: VP.OR.sec },
  w71: { title: '術者的廣角畫面', orient: VP.OR.w7 },
  g72a: { title: '純 C3F8 在眼內會膨脹', orient: '縱軸＝氣泡體積（倍）　橫軸＝術後天數' },
  g72b: { title: '混成不會膨脹的濃度', orient: '和空氣混合' },
  s72: { title: '50 mL 針筒備氣', orient: '針筒不畫刻度：量依院內常規' },
  s72l: { title: '備氣的三個步驟', orient: '' },
  s72ok: { title: 'SF6 的例子：正確', orient: '病例系列' },
  s72bad: { title: 'SF6 的例子：算錯量', orient: '病例系列' },
  e72a: { title: '其他錯誤（一）', orient: '病例系列' },
  e72b: { title: '其他錯誤（二）', orient: '病例系列' },
  s72c: { title: 'C3F8：留多少依院內常規', orient: '針筒不畫刻度' },
  c72: { title: '備好之後', orient: '' },
  sec73: { title: '經灌注孔（4 點半）的子午切面', orient: VP.OR.inf },
  ext73: { title: '顯微鏡：三個 trocar', orient: VP.OR.ext },
  port73: { title: 'trocar 隧道的橫切面（灌注孔）', orient: VP.OR.port },
});
const TX7 = {   // texts drawn by helpers (listed for the font preload)
  inset: { title: '術後坐正（示意）', a: '氣泡浮到最高處', b: '蓋住 11 點裂孔' },
  s360: { title: '要不要整圈 360 度？研究不一致', a: '統合分析（Yaldo 2026）：較好', b: '大型世代（Wang 2020）：沒有好處', c: '→ 依主刀決定' },
  cryo: { title: '台灣的系列（Lai 2019）', a: '太周邊的裂孔：改用冷凍', b: '避免雷射探頭碰到水晶體' },
  steps: { a: '① 抽純氣', b: '② 排到需要的量', c: '③ 用無菌空氣補到 50 mL', note: '需要的量：依院內常規' },
  sup: { title: '換了供應商', a: '新的一批是純氣，', b: '被當成稀釋過的來用', bot1: '原本：稀釋過的', bot2: '新的一批：純氣' },
  tank: { title: '從高壓鋼瓶直接抽', a: '針筒裡的壓力不準，', b: '最後的濃度無法確定', t: '高壓鋼瓶' },
  say: { a: 'C3F8 要留多少：依院內常規', b: '備好之後 → 和主刀確認', c: '氣體和濃度' },
  vol: { title: '沖多少', a: '實驗', b: '電腦模擬', c: '眼軸較長：兩支', a2: '幾乎換完全' },
  close: { a: '① 每個傷口漏不漏', b: '② 量眼壓', c: '③ 一直漏 → 縫一針' },
  sut: { title: '23G 需要縫的比例', a: '各研究 11.2%（Woo 2009）', b: '到 38.5%（Duval 2014）' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4) + JSON.stringify(TX5) + JSON.stringify(TX6) + JSON.stringify(TX7);
const C_LAS = '#d23c3c', C_SCAR = '#6b4423', C_ICE = '#2f86c8', C_MIX = '#2c6fa3', C_PURE = '#e8a33a', C_AIR = '#eef3f7';
const nLaid = st => Math.round(VP.SPOTS7.length * Math.min(1, st.laser || 0));   // spots the model draws for a state (posterior.js laserSpots)
const offPl = (S, p3) => Math.abs(GLOBE.dot(GLOBE.sub(p3, S.r.plane.O), GLOBE.unit(GLOBE.cross(S.r.plane.U, S.r.plane.V))));
// the spots drawn in a section (the model draws those within 0.25 mm of the plane): rings over them (scar, 示意) in panel px
function scarSec(S, st, op) { if (!(op > 0)) return ''; const k = S.k; let s = '';
  for (const sp of VP.SPOTS7.slice(0, nLaid(st))) if (offPl(S, sp.p) < 0.25) { const q = S.P(GLOBE.toPlane(S.r.plane, sp.p)); s += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(0.13 * k)}" fill="${C_SCAR}" stroke="#2e1a0c" stroke-width="1.5" opacity="${op}"/>`; }
  return s; }
// the same spots in a wide view (all of them, projected): scars
function scarWide(V, st, op) { if (!(op > 0)) return ''; let s = '';
  for (const sp of VP.SPOTS7.slice(0, nLaid(st))) { const q = wpx(V, sp.p); s += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(Math.max(2.6, 0.2 * V.k))}" fill="${C_SCAR}" stroke="#2e1a0c" stroke-width="1" opacity="${op}"/>`; }
  return s; }
// the field circle of a wide view as a clip path (overlays drawn outside the model's own clip)
const fieldClip = (V, id) => { const c = V.P([0, 0]); return `<clipPath id="${id}"><circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(V.M.R * V.k)}"/></clipPath>`; };
// a band on the retina between s0(h) and s1(h) mm from the limbus all round (attached retina), as an even-odd path through proj (3D → px)
function bandPath(Gm, proj, sOf) { const a = [], b = []; for (let i = 0; i <= 144; i++) { const h = 12 * i / 144, [s0, s1] = sOf(h); a.push(proj(Gm.ret0(h, s0, 1))); b.push(proj(Gm.ret0(h, s1, 1))); }
  return pth(a, true) + pth(b, true); }
// a syringe lying left (nozzle, 0 mL) to right (50 mL at x1): pure gas from 0 to keep (or a hatched band when keep is null: o.range, fractions), air from there to
// total (the plunger's face); ticks with numbers only when o.ticks
function syringe(x0, x1, y, o) {
  const H = 46, top = y - H / 2, X = v => VP.syrX(x0, x1, v), face = X(o.total), rod = 0.95 * (x1 - x0), id = o.id;
  let s = `<g opacity="${o.op ?? 1}">`;
  s += `<rect x="${F1(x0 - 26)}" y="${F1(y - 6)}" width="26" height="12" rx="3" fill="#dfe5ea" stroke="#7d8a96" stroke-width="1.5"/>`;                    // nozzle
  if (o.keep != null) { s += `<rect x="${F1(x0)}" y="${F1(top)}" width="${F1(Math.max(0, Math.min(X(o.keep), face) - x0))}" height="${H}" fill="${C_PURE}" opacity="0.85"/>`;
    if (face > X(o.keep)) s += `<rect x="${F1(X(o.keep))}" y="${F1(top)}" width="${F1(face - X(o.keep))}" height="${H}" fill="${C_AIR}"/>`; }
  else { const r0 = x0 + (x1 - x0) * o.range[0], r1 = x0 + (x1 - x0) * o.range[1], e = Math.min(face, r1);
    s += `<defs><linearGradient id="${id}_g" x1="${F1(x0)}" x2="${F1(r1)}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C_PURE}" stop-opacity="0.9"/><stop offset="${F1((r0 - x0) / (r1 - x0))}" stop-color="${C_PURE}" stop-opacity="0.85"/><stop offset="1" stop-color="${C_PURE}" stop-opacity="0"/></linearGradient>` +
      `<pattern id="${id}_h" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="#9a6412" stroke-width="2.2"/></pattern></defs>`;
    if (o.pureAll) s += `<rect x="${F1(x0)}" y="${F1(top)}" width="${F1(face - x0)}" height="${H}" fill="${C_PURE}" opacity="0.85"/>`;
    else { if (face > r1) s += `<rect x="${F1(x0)}" y="${F1(top)}" width="${F1(face - x0)}" height="${H}" fill="${C_AIR}"/>`;
      s += `<rect x="${F1(x0)}" y="${F1(top)}" width="${F1(e - x0)}" height="${H}" fill="url(#${id}_g)"/><rect x="${F1(r0)}" y="${F1(top)}" width="${F1(e - r0)}" height="${H}" fill="url(#${id}_h)" opacity="${o.hatch ?? 0.6}"/>`; } }
  s += `<rect x="${F1(x0)}" y="${F1(top)}" width="${F1(x1 - x0 + 8)}" height="${H}" rx="4" fill="none" stroke="#5b6878" stroke-width="2.2"/>` +                       // barrel
    `<rect x="${F1(x1 + 8)}" y="${F1(top - 12)}" width="7" height="${H + 24}" rx="2" fill="#c3ccd4" stroke="#5b6878" stroke-width="1.5"/>` +                         // flange
    `<rect x="${F1(face - 5)}" y="${F1(top + 2)}" width="10" height="${H - 4}" rx="2" fill="#2b3036"/>` +                                                            // plunger face
    `<rect x="${F1(face + 5)}" y="${F1(y - 4)}" width="${F1(rod)}" height="8" fill="#a9b3bd" stroke="#5b6878" stroke-width="1"/>` +
    `<rect x="${F1(face + 5 + rod)}" y="${F1(top - 4)}" width="8" height="${H + 8}" rx="2" fill="#a9b3bd" stroke="#5b6878" stroke-width="1.2"/>`;                   // thumb plate
  if (o.ticks) for (const v of VP.SYR.ticks) { const x = X(v); s += `<path d="M${F1(x)} ${F1(top)}v10" stroke="#3b4752" stroke-width="1.6"/>` + (v === VP.SYR.full ? '' : text(F1(x), F1(top - 16), String(v), { size: 13, anchor: 'middle', color: '#3b4752' })); }
  if (o.label !== false) s += text(F1(X(VP.SYR.full) - 8), F1(top - 16), VP.SYR.full + ' mL', { size: 13, bold: true, color: '#3b4752' });   // the 50 mL line is the barrel's end (chapter 9 draws it scaled down and writes its own)
  return s + '</g>';
}
// a bracket under a syringe from px a to b with a text below it
const braceU = (a, b, y, t, col, op) => `<g opacity="${op}"><path d="M${F1(a)} ${F1(y)}v8H${F1(b)}v-8" fill="none" stroke="${col}" stroke-width="2"/>${text(F1((a + b) / 2), F1(y + 30), t, { size: 15, bold: true, color: col, anchor: 'middle' })}</g>`;
const stLRet = (st, s) => POSTERIOR.geom(st).ret(VP.SEC_H, s, 1);   // the retina's inner surface on the 11 o'clock meridian, s mm from the limbus
const bigCard = (x, y, w, h, rows, o = {}) => `<g opacity="${o.op ?? 1}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${o.stroke || '#d3dae1'}" stroke-width="${o.sw || 1}"/>` +
  rows.map(([t, ro = {}], i) => text(o.center ? x + w / 2 : x + 16, y + (o.y0 || 34) + i * (o.lh || 32), t, { size: ro.size || 17, bold: ro.bold, color: ro.color || COL.ink, anchor: o.center ? 'middle' : 'start', op: ro.op ?? 1 })).join('') + '</g>';

DRAW2['7-1'] = T => {
  const P = POSTERIOR, G = GLOBE;
  // ---------------- the state of this frame (both panels): line 0 the laser round the tear in steps; lines 1–2 the laser done; line 3 cryo instead (示意)
  const kL = T.p(0, 0.1, 0.85), in1 = T.on(1, 0.01) > 0, stL = in1 ? VP.ST.las1 : VP.laserStep(kL), nL = nLaid(stL), firing = !in1 && T.on(0, 0.01) > 0;
  const kC = T.on(2, 0.6) * (1 - T.on(3, 0.6)), kY = T.on(3, 0.6), opZ = 1 - Math.max(kC, kY), scar = T.on(1, 0.8, 0.3), opIn = T.on(1, 0.6, 1.2) * opZ;
  const aim = VP.SPOTS7[Math.max(0, nL - 1)];   // the spot the probe aims at
  // ---------------- left, lines 0–1: the 11–5 section zoomed on the 11 o'clock tear (supine, the eye full of air)
  let sl = '', el = '', PL = PT.sec71;
  if (opZ > 0) {
    const S = VP.sec(stL, PW, PH, VP.WIN.l71, 's71', { tw: VP.WIN.l71T, step: 0.02 }), a = S.A, toS = p3 => S.P(G.toPlane(S.r.plane, p3));
    // line 1: the gas lying on the retina over the tear (a glow along its inner surface from in front of the hinge to behind the apex; 示意), under the scars
    let glow = ''; if (opIn > 0) { const T0 = P.geom(stL).tear, gl = []; for (let s = T0.sh - 1.2; s <= T0.sh + T0.L * 1.06 + 1.2; s += 0.1) gl.push(toS(stLRet(stL, s)));
      glow = `<path d="${pth(gl)}" fill="none" stroke="#7fb4e3" stroke-width="12" stroke-linecap="round" opacity="${(0.45 * opIn).toFixed(3)}"/>`; }
    sl += `<g opacity="${opZ.toFixed(3)}">${S.svg}${glow}${scarSec(S, stL, scar)}`;
    // the probe (off the plane, on the far side): its projection as a ghost, the aiming beam to the spot (projection)
    if (firing) { const I = P.instGeom(P.geom(stL), stL.inst[0]), c0 = toS(I.port.tip), c1 = toS(I.tip), q = toS(aim.p), d = [c1[0] - c0[0], c1[1] - c0[1]], l = Math.hypot(...d) || 1, w = P.N.shaft * S.k / 2, nx = -d[1] / l * w, ny = d[0] / l * w;
      sl += `<path d="M${F1(c0[0] + nx)} ${F1(c0[1] + ny)}L${F1(c1[0] + nx)} ${F1(c1[1] + ny)}L${F1(c1[0] - nx)} ${F1(c1[1] - ny)}L${F1(c0[0] - nx)} ${F1(c0[1] - ny)}Z" fill="#a6aeb6" fill-opacity="0.35" stroke="#59626b" stroke-width="1.5" stroke-dasharray="5 4"/>` +
        `<path d="M${F1(c1[0])} ${F1(c1[1])}L${F1(q[0])} ${F1(q[1])}" stroke="${C_LAS}" stroke-width="2" stroke-dasharray="3 3"/><circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="9" fill="none" stroke="${C_LAS}" stroke-width="2"/>`;
      el += lab('雷射探頭（虛線：在切面外）', 'endolaser', 14, 40, [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2], { bold: true, op: T.on(0, 0.6) * (1 - T.on(1, 0.4)) }); }
    sl += '</g>';
    const spIn = VP.SPOTS7.slice(0, nL).filter(sp => offPl(S, sp.p) < 0.25), spA = spIn.find(sp => sp.u < 0), spP = spIn.find(sp => sp.u > 1.8), tm = S.M.tearMid_3;
    const gasPt = toS(G.add(tm, P.N3(VP.SEC_H, P.wallOf(tm[2], Math.hypot(tm[0], tm[1])).s).map(v => -0.35 * v)));
    el += lab('11 點裂孔', 'HST', 14, 290, a.tearMid, Object.assign({ op: T.on(0) * opZ * (1 - opIn) }, HST));
    el += lab('雷射點：圍著裂孔打', 'laser', 14, 200, spA ? toS(spA.p) : null, { bold: true, color: C_LAS, lc: C_LAS, op: (spA ? 1 : 0) * T.p(0, 0.3, 0.4) * (1 - T.on(1, 0.4)) });
    el += lab('雷射點', 'laser', PW - 12, 290, spP ? toS(spP.p) : null, { side: 'R', bold: true, color: C_LAS, lc: C_LAS, op: (spP ? 1 : 0) * T.p(0, 0.3, 0.4) * (1 - T.on(1, 0.4)) });
    el += lab('視網膜已貼平', 'attached', PW - 12, 350, toS(stLRet(stL, 12.2)), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(0, 0.6, 0.6) * (1 - T.on(1, 0.4)) * opZ });
    el += lab('眼內充滿空氣', 'air', 14, 120, toS(VP.inPl(VP.SEC_H, 8.2, 4.2)), { bold: true, color: '#2b5a8a', lc: '#2b5a8a', op: T.on(0, 0.6, 1.2) * (1 - T.on(1, 0.4)) * opZ });
    el += lab('長出疤，把視網膜黏住（示意）', 'scar', PW - 12, 290, spP ? toS(spP.p) : null, { side: 'R', bold: true, color: C_SCAR, lc: C_SCAR, op: (spP ? 1 : 0) * scar * opZ });
    el += lab('疤長牢之前：氣體蓋住裂孔', '', 14, 40, gasPt, { bold: true, color: '#2b5a8a', lc: '#2b5a8a', op: opIn });
    sl += note('雷射的排數、間距沒有術中出處（示意）', T.on(0, 0.6) * opZ * (1 - opIn), PH - 14, 14, 'start');
    // line 1 inset: after the operation, sitting upright — the bubble at the top covers the 11 o'clock tear (bubble size 示意)
    if (opIn > 0) { const x = 14, y = PH - 236, z = 150, Hd = VP.head(VP.ST.sit7, z, z, VP.WIN.headT, 'h71'), t = [x + 26 + Hd.A.tearMid[0], y + 32 + Hd.A.tearMid[1]];
      sl += `<g opacity="${opIn.toFixed(3)}"><rect x="${x}" y="${y}" width="${z + 52}" height="226" rx="8" fill="#fff" stroke="#c9d1d9"/>` + text(x + 12, y + 22, TX7.inset.title, { size: 14, bold: true }) +
        `<g transform="translate(${x + 26} ${y + 32})">${Hd.svg}</g>` + POSTERIOR.headIcon(VP.ST.sit7, x + 6, y + z - 2, 34) + `<circle cx="${F1(t[0])}" cy="${F1(t[1])}" r="9" fill="none" stroke="#c8361f" stroke-width="2.2"/>` +
        text(x + 12, y + 198, TX7.inset.a, { size: 14, bold: true, color: '#2b5a8a' }) + text(x + 12, y + 218, TX7.inset.b, { size: 14, bold: true, color: '#2b5a8a' }) + '</g>'; }
  }
  // ---------------- left, line 2: the fundus chart, the rings round the tear and the band where a 360° laser would go (示意)
  if (kC > 0) { const v = VP.fundus(VP.ST.las1, PW, PH, VP.WIN.chart, 'f71'), Gm = P.geom(VP.ST.las1), pr = p3 => v.P(VP.chartXY(p3));
    sl += `<g opacity="${kC.toFixed(3)}">${v.svg}${clockRing(v)}<path d="${bandPath(Gm, pr, VP.band360)}" fill="#fff" fill-opacity="0.35" fill-rule="evenodd" stroke="#fff" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      `<circle cx="${F1(v.A.tear[0])}" cy="${F1(v.A.tear[1])}" r="15" fill="none" stroke="${C_LAS}" stroke-width="2.5"/></g>`;
    el += lab('雷射圍住 11 點裂孔', 'laser', 14, 42, v.A.tear, { bold: true, color: C_LAS, lc: C_LAS, op: kC });
    el += lab('360 度：整圈打在周邊（示意）', '360° laser', PW - 12, 60, pr(Gm.ret0(1.5, VP.band360(1.5)[1], 1)), { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: kC });
    if (kC > 0.5) PL = PT.ch71; }
  // ---------------- left, line 3 (另一種做法, 示意): the cryo probe pressed on the sclera over the tear, from outside the eye; the lens
  if (kY > 0) { const S = VP.sec(VP.ST.cryo7, PW, PH, VP.WIN.c71, 's71c', { tw: VP.WIN.c71T, step: 0.04 }), a = S.A, toS = p3 => S.P(G.toPlane(S.r.plane, p3)), cr = VP.CRYO;
    const c = toS(P.P3(cr.h, cr.s, cr.depth)), r = 1.3 * S.k;
    sl += `<g opacity="${kY.toFixed(3)}">${S.svg}<circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(r)}" fill="#d9f0ff" fill-opacity="0.6" stroke="${C_ICE}" stroke-width="2" stroke-dasharray="5 3"/></g>`;
    sl += badge(14, 14, '另一種做法（示意）', COL.sub, kY);
    sl += `<g opacity="${(kY * T.on(3, 0.6, 0.8)).toFixed(3)}">` + bigCard(14, PH - 118, 268, 104, [[TX7.cryo.title, { bold: true, size: 15 }], [TX7.cryo.a, { size: 15, bold: true, color: C_ICE }], [TX7.cryo.b, { size: 15 }]], { lh: 28, y0: 30 }) + '</g>';
    el += lab('冷凍探頭在眼外（示意）', 'cryo probe', PW - 12, 40, a.depressor, { side: 'R', bold: true, color: C_ICE, lc: C_ICE, op: kY });
    el += lab('和裂孔同一個鐘點', '11 點', PW - 12, 300, toS(P.P3(cr.h, cr.s, cr.depth + 0.6)), { side: 'R', bold: true, op: kY * T.on(3, 0.6, 0.4) });
    el += lab('水晶體', 'lens', 14, 200, a.lens, { bold: true, op: kY });
    if (kY > 0.5) PL = PT.sec71c; }
  // ---------------- right: the surgeon's wide view of the same state (inverter on, looking toward 11, 示意); zoomed on the tear, out for the 360° band
  const zW = Math.max(1 - T.p(2, 0, 0.3), T.p(3, 0, 0.3)), win = VIEWS.zwin(VP.WIN.wide3, VP.WIN.w71z, zW);
  const W0 = VP.wide(VP.on11(stL), PW, PH, win, 'w71', {}), Wt = { A: W0.A, c: W0.P([0, 0]), r: W0.M.R * W0.k }, A = W0.A, Gm = P.geom(stL);
  let sr = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>` + W0.svg + clockNums(Wt, 1 - zW), er = '';
  sr += `<defs>${fieldClip(W0, 'w71_fc')}</defs><g clip-path="url(#w71_fc)">${scarWide(W0, stL, scar * (1 - kY))}`;
  if (firing) { const q = wpx(W0, aim.p); sr += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(Math.max(7, 0.4 * W0.k))}" fill="none" stroke="#ff5a4f" stroke-width="2.5"/>`; }
  if (kC > 0) sr += `<path d="${bandPath(Gm, p3 => wpx(W0, p3), VP.band360)}" fill="#fff" fill-opacity="${(0.3 * kC).toFixed(3)}" fill-rule="evenodd" stroke="#fff" stroke-width="1.8" stroke-dasharray="5 4" opacity="${kC}"/>`;
  sr += '</g>';
  let cryoAt = null;
  if (kY > 0) { const W2 = VP.wide(VP.on11(VP.ST.cryo7), PW, PH, win, 'w71c', {}), Gc = P.geom(VP.ST.cryo7), cr = VP.CRYO, rr = P.surfAt(cr.s).rho * 30 * VP.D2R, ring = [];
    for (let i = 0; i <= 48; i++) { const t = 2 * Math.PI * i / 48; ring.push(wpx(W2, Gc.ret(cr.h + 1.3 * Math.cos(t) / rr, cr.s + 1.3 * Math.sin(t), 1))); }
    sr += `<g opacity="${kY.toFixed(3)}"><rect x="0" y="0" width="${PW}" height="${PH}" fill="#0c0d0f"/>${W2.svg}<path d="${pth(ring, true)}" fill="#f4fbff" fill-opacity="0.5" stroke="#ffffff" stroke-width="2" stroke-dasharray="5 3"/></g>`;
    cryoAt = ring[36]; }
  sr += mark11(Wt, 1 - zW) + badge(12, 10, 'inverter 開', COL.accent);
  er += lab('雷射探頭', 'endolaser（10 點半）', PW - 12, 380, A.inst0, { side: 'R', bold: true, lc: '#ffffff', op: (firing ? 1 : 0) * T.on(0, 0.6) });
  er += lab('11 點裂孔', 'HST', 14, 380, A.tear, Object.assign({ op: (1 - kY) * (1 - kC) }, HST));
  er += lab('雷射點圍住裂孔', 'laser', 14, 64, nL > 8 ? wpx(W0, VP.SPOTS7[8].p) : null, { bold: true, color: C_LAS, lc: '#ff8f7a', op: (nL > 8 ? 1 : 0) * T.p(0, 0.5, 0.6) * (1 - T.on(1, 0.4)) });
  er += lab('疤（示意）', 'scar', 14, 64, wpx(W0, VP.SPOTS7[8].p), { bold: true, color: '#e0b58a', lc: '#e0b58a', op: scar * (1 - kC) * (1 - kY) });
  er += lab('360 度的位置（示意）', '', 14, 300, wpx(W0, Gm.ret0(1.8, VP.band360(1.8)[0], 1)), { bold: true, color: COL.amber, lc: '#ffd27a', op: kC });
  er += lab('冷凍處：從外面壓的隆起（示意）', 'cryo', 14, 64, cryoAt, { bold: true, color: '#9fd4ff', lc: '#ffffff', op: kY });
  sr += `<g opacity="${kC.toFixed(3)}">` + bigCard(PW - 330, 14, 316, 136, [[TX7.s360.title, { bold: true, size: 15 }], [TX7.s360.a, { size: 15 }], [TX7.s360.b, { size: 15 }], [TX7.s360.c, { bold: true, size: 16, color: COL.accent }]], { lh: 28, y0: 30 }) + '</g>';
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: PT.w71 } };
};

DRAW2['7-2'] = T => {
  const SY = VP.SYR, F50 = SY.full, on = i => T.on(i, 0.5) * (i < 5 ? 1 - T.on(i + 1, 0.5) : 1);   // the content of line i, faded out as line i + 1 comes in
  const kG = 1 - T.on(2, 0.5), tN = VP.EXPAND.end * T.p(0, 0.1, 0.85), op1 = T.on(1, 0.6) * kG;
  let sl = '', sr = '', PL = PT.g72a, PR = PT.g72b;
  // ---------------- lines 0–1, left: the bubble volume of pure C3F8 over the days (largest about 4 times at 3–4 days; curve shape 示意); the mixture stays at 1
  if (kG > 0) { const X0 = 92, X1 = 566, Y0 = 64, Y1 = 330, VM = 4.6, gx = t => X0 + (X1 - X0) * t / VP.EXPAND.end, gy = v => Y1 - (Y1 - Y0) * v / VM, [d0, d1] = VP.EXPAND.days;
    let g = `<rect x="${F1(gx(d0))}" y="${Y0}" width="${F1(gx(d1) - gx(d0))}" height="${Y1 - Y0}" fill="${C_PURE}" opacity="0.16"/>` +
      `<path d="M${X0} ${Y0 - 14}V${Y1}H${X1 + 14}" fill="none" stroke="${COL.ink}" stroke-width="2"/>` +
      `<path d="M${X0} ${F1(gy(1))}H${X1}M${X0} ${F1(gy(VP.EXPAND.peak))}H${X1}" stroke="#9aa5b1" stroke-width="1.2" stroke-dasharray="5 4"/>` +
      text(X0 - 10, F1(gy(1) + 5), '1 倍', { size: 14, bold: true, anchor: 'end' }) + text(X0 - 10, F1(gy(VP.EXPAND.peak) + 5), '約 4 倍', { size: 14, bold: true, anchor: 'end', color: '#9a6412' }) +
      text(F1((gx(d0) + gx(d1)) / 2), Y0 - 18, '3 到 4 天最大', { size: 14, bold: true, anchor: 'middle', color: '#9a6412' }) + text(X1 + 10, Y1 + 30, '術後天數', { size: 14, anchor: 'end', color: COL.sub }) +
      text(X0 + 8, Y0 - 18, '氣泡體積', { size: 14, color: COL.sub });
    const pts = []; for (let t = 0; t <= tN + 1e-9; t += 0.05) pts.push([gx(t), gy(VP.expand(t))]);
    if (pts.length > 1) g += `<path d="${pth(pts)}" fill="none" stroke="${C_PURE}" stroke-width="4.5" stroke-linecap="round"/>`;
    const tM = Math.min(tN, VP.EXPAND.at), m = [gx(tM), gy(VP.expand(tM))]; g += `<circle cx="${F1(m[0])}" cy="${F1(m[1])}" r="7" fill="#fff" stroke="#9a6412" stroke-width="3"/>`;
    g += htext(F1(gx(5.6)), F1(gy(VP.expand(5.6)) + 30), '純 C3F8', { size: 15, bold: true, color: '#9a6412', op: T.p(0, 0.6, 0.7) });
    g += `<path d="M${X0} ${F1(gy(1))}H${X1}" stroke="${C_MIX}" stroke-width="4.5" opacity="${op1}"/>` + htext(X1, F1(gy(1) - 12), `混成 ${VP.C3F8_MIX.use}%：不膨脹`, { size: 15, bold: true, anchor: 'end', color: C_MIX, op: op1 });
    sl += `<g opacity="${kG.toFixed(3)}">${g}</g>` + note('曲線形狀為示意', kG, PH - 14, PW - 12);
    // right: the bubble of pure C3F8 growing with the same day (volume ∝ radius³), the mixed bubble staying; the mixture bar (14 %, 12–16 % in studies)
    const bub = (cx, cy, r, col, op) => `<g opacity="${op}"><defs><radialGradient id="b72${cx}" cx="${F1(cx - r * 0.35)}" cy="${F1(cy - r * 0.35)}" r="${F1(r * 1.3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${col}"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${F1(r)}" fill="url(#b72${cx})" stroke="${col}" stroke-width="2"/></g>`;
    const r0 = 30, rP = r0 * Math.cbrt(VP.expand(Math.min(tN, VP.EXPAND.at)));   // the bubble of the marked day (the marker stops at the peak)
    let h = `<circle cx="160" cy="180" r="${r0}" fill="none" stroke="#9a6412" stroke-width="1.5" stroke-dasharray="4 3"/>` + bub(160, 180, rP, C_PURE, 1) + `<circle cx="160" cy="180" r="${r0}" fill="none" stroke="#9a6412" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>` + text(160, 92, '純 C3F8', { size: 17, bold: true, anchor: 'middle', color: '#9a6412' }) + text(160, 268, '體積變大約 4 倍', { size: 15, bold: true, anchor: 'middle', op: T.p(0, 0.45, 0.6) });
    h += bub(440, 180, r0, C_MIX, op1 / kG) + text(440, 92, `混成 ${VP.C3F8_MIX.use}%`, { size: 17, bold: true, anchor: 'middle', color: C_MIX, op: op1 / kG }) + text(440, 268, '大小不變', { size: 15, bold: true, anchor: 'middle', op: op1 / kG });
    const bx = 70, bw = 466, by = 318, f = VP.C3F8_MIX.use / 100;
    h += `<g opacity="${(op1 / kG).toFixed(3)}"><rect x="${bx}" y="${by}" width="${F1(bw * f)}" height="26" fill="${C_PURE}"/><rect x="${F1(bx + bw * f)}" y="${by}" width="${F1(bw * (1 - f))}" height="26" fill="${C_AIR}"/><rect x="${bx}" y="${by}" width="${bw}" height="26" fill="none" stroke="#5b6878" stroke-width="1.5"/>` +
      text(bx, by + 50, `C3F8 ${VP.C3F8_MIX.use}%`, { size: 15, bold: true, color: '#9a6412' }) + text(bx + bw, by + 50, '空氣', { size: 15, bold: true, anchor: 'end', color: COL.sub }) + text(bx + bw / 2, by + 50, `各研究用過 ${VP.C3F8_MIX.range[0]} 到 ${VP.C3F8_MIX.range[1]}%`, { size: 14, anchor: 'middle', color: COL.sub }) + '</g>';
    sr += `<g opacity="${kG.toFixed(3)}">${h}</g>`; }
  // ---------------- line 2: the 50 mL syringe, C3F8, in three steps (no scale: the amount kept is 依院內常規); right: the steps
  const x0 = 70, x1 = 320, yS = 200, rg = SY.c3f8.range, vEnd = rg[1] * F50;
  if (on(2) > 0) { const p1 = T.p(2, 0.05, 0.28), p2 = T.p(2, 0.36, 0.6), p3 = T.p(2, 0.7, 0.94), o = on(2), ph = p3 > 0 ? 3 : p2 > 0 ? 2 : 1;
    const S = p3 > 0 || p2 >= 1 ? { total: lerp(vEnd, F50, p3), keep: null, range: rg } : { total: p2 > 0 ? lerp(F50, vEnd, p2) : F50 * p1, keep: null, range: rg, pureAll: true };
    sl += syringe(x0, x1, yS, Object.assign({ id: 'sy72a', op: o }, S));
    sl += text(F1((x0 + x1) / 2), yS - 64, '純 C3F8', { size: 16, bold: true, anchor: 'middle', color: '#9a6412', op: o * (ph < 3 ? 1 : 0) });
    if (ph === 2 && p2 < 1) sl += arrowP([[x0 - 30, yS], [x0 - 62, yS]], COL.amber, o, 'arrM', 4);                                                       // the extra gas pushed out
    if (ph === 3) sl += arrowP([[x0 - 62, yS], [x0 - 32, yS]], COL.sub, o, 'arrK', 4) + text(x0 - 62, yS + 36, '無菌空氣', { size: 14, bold: true, color: COL.sub, op: o });
    if (ph >= 2 && (p2 >= 1 || p3 > 0)) sl += braceU(x0 + (x1 - x0) * 0.0, x0 + (x1 - x0) * rg[1], yS + 34, TX7.steps.note, '#9a6412', o);
    if (p3 > 0) sl += braceU(x0 + (x1 - x0) * rg[1] + 4, VP.syrX(x0, x1, F50), yS - 66, '', COL.sub, o * p3) + text(F1((x0 + (x1 - x0) * rg[1] + x1) / 2), yS - 70, '無菌空氣補到 50 mL', { size: 15, bold: true, anchor: 'middle', color: COL.sub, op: o * p3 });
    const rows = [TX7.steps.a, TX7.steps.b, TX7.steps.c];
    sr += `<g opacity="${o.toFixed(3)}"><rect x="40" y="40" width="526" height="250" rx="10" fill="#fff" stroke="#d3dae1"/>` +
      rows.map((t, i) => `<rect x="56" y="${62 + i * 66}" width="494" height="50" rx="8" fill="${i + 1 === ph ? '#e7f3ef' : '#f7f9fa'}" stroke="${i + 1 === ph ? COL.accent : '#e1e6ea'}" stroke-width="${i + 1 === ph ? 2 : 1}"/>` +
        text(74, 94 + i * 66, t, { size: 19, bold: i + 1 === ph, color: i + 1 === ph ? COL.accent : COL.sub })).join('') + text(56, 322, TX7.steps.note, { size: 15, bold: true, color: '#9a6412' }) + '</g>';
    if (o > 0.5) { PL = PT.s72; PR = PT.s72l; } }
  // ---------------- line 3: the SF6 example (Kanclerz 2018b): keep 10 mL, air up to 50 mL = 20 %; the case report's error: kept 20 mL = 40 %
  if (on(3) > 0) { const o = on(3), pa = T.p(3, 0.08, 0.35), pb = T.p(3, 0.55, 0.8), ob = T.on(3, 0.5, (T.en(3) - T.st(3)) * 0.48);
    const one = (keep, p, id, col, op, lbl) => { const X = v => VP.syrX(x0, x1, v);
      return syringe(x0, x1, yS, { id, op, keep, total: lerp(keep, F50, p), ticks: true }) + braceU(X(0), X(keep), yS + 34, lbl, '#9a6412', op) +
        braceU(X(keep) + 4, X(F50), yS + 34, '', COL.sub, op * p) + text(F1((X(keep) + X(F50)) / 2), yS + 64, '空氣補到 50 mL', { size: 15, bold: true, anchor: 'middle', color: COL.sub, op: op * p }) +
        text(F1(x0), yS + 136, `濃度 ${VP.conc(keep)}%`, { size: 30, bold: true, color: col, op: op * p }); };
    sl += one(SY.sf6.ok, pa, 'sy72b', COL.accent, o, `SF6 留 ${SY.sf6.ok} mL`) + text(F1(x0), 92, '正確', { size: 18, bold: true, color: COL.accent, op: o });
    sr += one(SY.sf6.bad, pb, 'sy72c', COL.red, o * ob, `誤留 ${SY.sf6.bad} mL`) + badge(PW - 176, PH - 44, '錯誤的病例', COL.red, o * ob) + text(F1(x0), 92, '算錯量', { size: 18, bold: true, color: COL.red, op: o * ob });
    if (o > 0.5) { PL = PT.s72ok; PR = PT.s72bad; } }
  // ---------------- line 4: two other errors (Kanclerz 2018b): a new supplier's pure gas taken as diluted; drawing straight from a high-pressure tank
  if (on(4) > 0) { const o = on(4), ob = T.on(4, 0.5, (T.en(4) - T.st(4)) * 0.45);
    const bottle = (x, y, lab_, col) => `<rect x="${x}" y="${y}" width="54" height="96" rx="12" fill="${col}" stroke="#5b6878" stroke-width="2"/><rect x="${x + 16}" y="${y - 16}" width="22" height="18" rx="3" fill="#a9b3bd" stroke="#5b6878" stroke-width="1.5"/>` +
      text(x + 27, y + 124, lab_, { size: 14, bold: true, anchor: 'middle' });
    sl += `<g opacity="${o.toFixed(3)}">` + bottle(130, 110, TX7.sup.bot1, C_AIR) + bottle(390, 110, TX7.sup.bot2, C_PURE) + arrowP([[214, 158], [370, 158]], COL.red, 1, 'arrR', 4) +
      text(PW / 2, 60, TX7.sup.title, { size: 20, bold: true, anchor: 'middle' }) + text(PW / 2, 300, TX7.sup.a, { size: 18, bold: true, anchor: 'middle', color: COL.red }) + text(PW / 2, 332, TX7.sup.b, { size: 18, bold: true, anchor: 'middle', color: COL.red }) + '</g>';
    sr += `<g opacity="${(o * ob).toFixed(3)}"><rect x="96" y="96" width="92" height="170" rx="40" fill="#c7cfd6" stroke="#5b6878" stroke-width="2"/><rect x="126" y="72" width="32" height="26" rx="4" fill="#a9b3bd" stroke="#5b6878" stroke-width="1.5"/>` +
      `<circle cx="142" cy="60" r="16" fill="#fff" stroke="#5b6878" stroke-width="2"/><path d="M142 60l9 -8" stroke="${COL.red}" stroke-width="2.5"/>` + text(142, 300, TX7.tank.t, { size: 14, bold: true, anchor: 'middle' }) +
      arrowP([[160, 72], [250, 72], [250, 150]], COL.red, 1, 'arrR', 3.5) + '</g>' + syringe(290, 480, 196, { id: 'sy72d', op: o * ob, keep: null, range: [0, 0], total: 26, pureAll: true }) +
      `<g opacity="${(o * ob).toFixed(3)}">` + text(PW / 2, 60, TX7.tank.title, { size: 20, bold: true, anchor: 'middle' }) + text(PW / 2 + 60, 300, TX7.tank.a, { size: 18, bold: true, anchor: 'middle', color: COL.red }) + text(PW / 2 + 60, 332, TX7.tank.b, { size: 18, bold: true, anchor: 'middle', color: COL.red }) + '</g>';
    if (o > 0.5) { PL = PT.e72a; PR = PT.e72b; } }
  // ---------------- line 5: the C3F8 syringe — how much to keep: the hospital's routine (no scale, no number); the call-out
  if (on(5) > 0) { const o = on(5);
    sl += syringe(x0, x1, yS, { id: 'sy72e', op: o, keep: null, range: rg, total: F50, hatch: 0.75 }) + braceU(x0, x0 + (x1 - x0) * rg[1], yS + 34, TX7.steps.note, '#9a6412', o) +
      text(F1((x0 + x1) / 2), yS - 64, '純 C3F8＋無菌空氣補到 50 mL', { size: 16, bold: true, anchor: 'middle', color: '#9a6412', op: o });
    sr += bigCard(40, 70, 526, 250, [[TX7.say.a, { size: 24, bold: true }], [TX7.say.b, { size: 24, bold: true, color: COL.red }], [TX7.say.c, { size: 24, bold: true, color: COL.red }]], { op: o, stroke: COL.red, sw: 4, center: true, y0: 104, lh: 56 });
    if (o > 0.5) { PL = PT.s72c; PR = PT.c72; } }
  return { L: { svg: sl, extra: '', P: PL }, R: { svg: sr, extra: '', P: PR } };
};

DRAW2['7-3'] = T => {
  const P = POSTERIOR, G = GLOBE;
  // ---------------- the state of this frame (both panels): line 0 the mixed gas flushed through the eye in steps; line 2 every cannula out at once; line 3 the wound
  const kF = Math.max(T.p(0, 0.15, 0.85), T.on(1, 0.01)), stIn = VP.flushStep(kF), kO = T.on(2, 0.6), kP = T.on(3, 0.6);
  const opFlow = T.on(0, 0.6) * (1 - T.on(1, 0.5));
  // ---------------- left: the section through the 4:30 infusion (right = 4:30, left = 10:30: both ports in the plane)
  const secOf = (st, id) => VP.sec(st, PW, PH, VP.WIN.inf, id, { h: VP.INF_H, tw: VP.WIN.infT, step: 0.06 });
  const S0 = secOf(stIn, 's73'), a = S0.A, toS = p3 => S0.P(G.toPlane(S0.r.plane, p3));
  let sl = S0.svg, el = '', b = a;
  if (kO > 0) { const S1 = secOf(VP.ST.closed, 's73c'); sl += `<g opacity="${kO.toFixed(3)}">${S1.svg.replace(/^<rect[^>]*\/>/, '')}</g>`; if (kO > 0.5) b = S1.A; }
  // line 0 (示意): the mixed gas out of the infusion, across the eye, out through the open 10:30 cannula
  const FL = VP.flush73(stIn), fk = T.p(0, 0.15, 0.85);
  sl += arrowP(cutPts(FL.inn.map(toS), Math.max(0.05, fk)), C_MIX, opFlow, 'arrB', 4) + arrowP(FL.out.map(toS), COL.amber, opFlow * T.p(0, 0.5, 0.6), 'arrM', 4);
  const cav = toS(VP.inPl(VP.INF_H, 0.5, -4.5));
  el += lab('先完成氣液交換：眼內是空氣', '', 14, 352, cav, { bold: true, op: T.on(0) * (1 - T.p(0, 0.3, 0.4)) });
  el += lab('眼內換成混合氣體（顏色示意）', 'C3F8＋空氣', 14, 352, cav, { bold: true, color: C_MIX, lc: C_MIX, op: T.p(0, 0.4, 0.5) * (1 - kP) });
  el += lab('混好的氣體從 infusion 進來', '4 點半', PW - 12, 40, a.troc_it, { side: 'R', bold: true, color: C_MIX, lc: C_MIX, op: T.on(0, 0.6, 0.4) * (1 - kO) });
  el += lab('空氣從套管排出（示意）', '10 點半', 14, 40, a.troc_sn, { bold: true, color: COL.amber, lc: COL.amber, op: opFlow * T.p(0, 0.5, 0.6) });
  el += lab('拔掉 cannula 之後', '', 14, 40, b.troc_sn, { bold: true, op: kO * (1 - kP) });
  sl += note('沖洗的路徑與排氣處為示意', opFlow, PH - 14, PW - 12);
  { const t = P.troc(P.geom(VP.modelSt(VP.ST.closed))).find(x => x.inf), cil = P.cilTh(t.s - G.N.spur, P.oraAt(t.h, 1) - G.N.spur);   // the gas just inside the 4:30 wound
    el += lab('眼內的氣體貼著傷口的內口', '（示意）', PW - 12, 120, toS(P.P3(t.h, t.s, t.Tw + cil + 0.5)), { side: 'R', bold: true, color: C_MIX, lc: C_MIX, op: kP }); }
  // ---------------- right, lines 0–2: the microscope view (the mixed gas on the infusion line, the vent 示意; the volumes; the cannulas out, each wound checked)
  let sr = '', er = '', PR = PT.ext73;
  if (kP < 1) { const E0 = VP.ext(stIn, PW, PH, VP.WIN.extF, 'e73'), e = E0.A, o = 1 - kP;
    sr += `<g opacity="${o.toFixed(3)}">${E0.svg}`;
    { const t = P.troc(P.geom(VP.modelSt(stIn))).find(x => x.inf), top = extPx(E0, t.hubTop), mid = extPx(E0, G.add(t.entry, P.N3(t.h, t.s).map(v => v * 1.5))), far = extPx(E0, P.P3(t.h, t.s + 9, -3));   // the model's infusion line, in the mix colour
      sr += `<path d="M${F1(top[0])} ${F1(top[1])}Q${F1(mid[0])} ${F1(mid[1])} ${F1(far[0])} ${F1(far[1])}" fill="none" stroke="${C_MIX}" stroke-width="5" stroke-linecap="round" opacity="${(T.on(0, 0.6) * (1 - kO)).toFixed(3)}"/>`; }
    sr += '</g>';
    // the closed state crossfaded in at line 2
    if (kO > 0) { const E1 = VP.ext(VP.ST.closed, PW, PH, VP.WIN.extF, 'e73c'), c = E1.A; sr += `<g opacity="${(kO * o).toFixed(3)}">${E1.svg}</g>`;
      for (const id of ['it', 'st', 'sn']) { const q = c['cj_' + id] || c['troc_' + id]; sr += `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="16" fill="none" stroke="${COL.accent}" stroke-width="2.5" stroke-dasharray="5 3" opacity="${(kO * o).toFixed(3)}"/>`; }
      const qs = c.cj_sn || c.troc_sn, ks = T.p(2, 0.6, 0.75) * o;   // 示意: one stitch over a wound that keeps leaking
      sr += `<path d="M${F1(qs[0] - 9)} ${F1(qs[1] - 9)}L${F1(qs[0] + 9)} ${F1(qs[1] + 9)}" stroke="#2463eb" stroke-width="3" stroke-linecap="round" opacity="${ks}"/>`;
      er += lab('檢查每個傷口', 'leak?', 14, 380, c.cj_st || c.troc_st, { bold: true, color: COL.accent, lc: COL.accent, op: kO * o });
      er += lab('若一直漏：縫一針（示意）', 'suture', PW - 12, 380, qs, { side: 'R', bold: true, color: '#2463eb', lc: '#2463eb', op: ks });
      sr += bigCard(PW - 252, 14, 238, 118, [[TX7.close.a, { size: 15, bold: true }], [TX7.close.b, { size: 15, bold: true }], [TX7.close.c, { size: 15, bold: true }]], { op: kO * o, lh: 30, y0: 32 });
      sr += note('拔的順序：依主刀', kO * o, 40, 14, 'start'); }
    er += lab('infusion 接上混好的氣體（示意）', '', 14, 40, e.troc_it, { bold: true, color: C_MIX, lc: C_MIX, op: T.on(0, 0.6) * (1 - kO) * o });
    const vh = e.troc_sn, vc = E0.P([0, 0]), vd = [vh[0] - vc[0], vh[1] - vc[1]], vl = Math.hypot(...vd);
    sr += arrowP([[vh[0] + vd[0] / vl * 14, vh[1] + vd[1] / vl * 14], [vh[0] + vd[0] / vl * 64, vh[1] + vd[1] / vl * 64]], COL.amber, opFlow * T.p(0, 0.5, 0.6), 'arrM', 4);
    er += lab('排氣（示意）', 'vent', PW - 12, 380, [vh[0] + vd[0] / vl * 40, vh[1] + vd[1] / vl * 40], { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: opFlow * T.p(0, 0.5, 0.6) });
    // line 1: how much to flush (Williams 1990: 25 mL; Shunmugam 2011: 35 mL, two 50 mL syringes for a long eye)
    const ov = T.on(1, 0.6) * (1 - kO), V = VP.SYR.full, bw = VP.volBar, FV = VP.FLUSH_VOL;
    if (ov > 0) { const x = PW - 330, y = 14, rows = [[`實驗（${FV[0].who}）`, FV[0].v, `${FV[0].v} mL 幾乎換完全`], [`電腦模擬（${FV[1].who}）`, FV[1].v, `${FV[1].v} mL`], [`眼軸較長：兩支 ${V} mL`, FV[2].v, '']];
      let s = `<g opacity="${ov.toFixed(3)}"><rect x="${x}" y="${y}" width="316" height="188" rx="10" fill="#fff" stroke="#d3dae1"/>` + text(x + 14, y + 28, TX7.vol.title, { size: 16, bold: true });
      rows.forEach(([t, v, t2], i) => { const yy = y + 58 + i * 44; s += text(x + 14, yy, t, { size: 14, color: COL.sub });
        if (i < 2) s += `<rect x="${x + 14}" y="${yy + 8}" width="${F1(bw(v))}" height="14" rx="3" fill="${C_MIX}"/>` + text(F1(x + 22 + bw(v)), yy + 20, t2, { size: 14, bold: true, color: C_MIX });
        else s += `<rect x="${x + 14}" y="${yy + 8}" width="${F1(bw(V))}" height="14" rx="3" fill="${C_MIX}"/><rect x="${F1(x + 16 + bw(V))}" y="${yy + 8}" width="${F1(bw(V))}" height="14" rx="3" fill="${C_MIX}"/>`; });
      sr += s + '</g>'; } }
  // ---------------- right, line 3: the tunnel cross-section of the infusion port, closed: the oblique tunnel, the gas against its inner end (Warrier 2008)
  if (kP > 0) { const V = VP.port(VP.ST.closed, PW, PH, VP.WIN.port, 'p73', 'it'), c = V.A, ti = c.tunnelIn, en = c.entry, te = c.tunnelEnd;
    sr += `<g opacity="${kP.toFixed(3)}">${V.svg}<path d="M${F1(te[0])} ${F1(te[1])}L${F1(ti[0])} ${F1(ti[1])}" stroke="#7d6a5a" stroke-width="1.4"/></g>`;   // the tunnel on through the pars plana
    sr += arrowP([[ti[0] - 26, ti[1] + 46], [ti[0] - 5, ti[1] + 10]], C_MIX, kP * T.on(3, 0.6, 0.6), 'arrB', 3.5) + arrowP([[ti[0] + 26, ti[1] + 46], [ti[0] + 5, ti[1] + 10]], C_MIX, kP * T.on(3, 0.6, 0.6), 'arrB', 3.5);
    er += lab('斜的隧道', 'oblique tunnel', PW - 12, 40, [(en[0] + ti[0]) / 2, (en[1] + ti[1]) / 2], { side: 'R', bold: true, op: kP });
    er += lab('氣體貼住內口，幫傷口封住（示意）', 'gas', 14, 290, [ti[0] - 20, ti[1] + 36], { bold: true, color: C_MIX, lc: C_MIX, op: kP * T.on(3, 0.6, 0.6) });
    sr += bigCard(14, PH - 102, 286, 92, [[TX7.sut.title, { size: 15, bold: true }], [TX7.sut.a, { size: 15 }], [TX7.sut.b, { size: 15 }]], { op: kP * T.on(3, 0.6, 0.2), lh: 24, y0: 26 });
    if (kP > 0.5) PR = PT.port73; }
  return { L: { svg: sl, extra: el, P: PT.sec73 }, R: { svg: sr, extra: er, P: PR } };
};

// ---------------------------------------------------------------- 8 術後
// Chapter 8 (after the operation; no instruments). Head pictures: the model's head view (VP.head: the section through the 11 o'clock tear, turned so that
// gravity points straight down the screen, the fluid surface a horizontal line) and the model's head icon (the same turn, 示意); both panels of a frame
// draw the same state; every bubble size is 示意. 8-1: the physics — the gas at the top covers the tear by surface tension (no arrow pushing the retina),
// sitting or the head raised (示意, no angle) keeps the 11 o'clock tear above the gas surface (the same state as 7-1's inset), supine puts the gas onto
// the back of the lens (Kanclerz 2018a, the only consequence drawn); no hours or days. 8-2: the case's macula on the chart, the retina sliding down
// (示意: direction as the narration, no amount), PostRD's two positions (face-down: gravity forward, the bubble over the posterior pole) with bars 42 %
// vs 56 % to scale, the same vision, a different population. 8-3 (no eye step): N2O and the growing bubble (示意: no factor, no pressure), the chain to
// CRAO, the time line to scale (37 days, ≥ 3 months, 67.7 days), the warning card, flying and mountains (+109 %, bars to scale). 8-4: IOP (43 %, 88 %
// within 24 h; the 8–12 h band on a 24 h axis), the four things to look at (icons 示意), redetachment among failures (72.9 %), cataract (UK, to scale).
const POSE8 = { sit: '坐正', supine: '仰躺', facedown: '臉朝下', raised: '頭抬高（示意）' };
const C_G8 = '#2b5a8a';                                             // gas and gravity labels (as 7-1)
// where the front of the eye (anterior) lies on a head view's screen, from the model's plane for that state
const frontOf = st => { const pl = POSTERIOR.headPlane(st), x = pl.U[2], y = pl.V[2];
  return (Math.abs(x) > 0.38 ? (x > 0 ? '右' : '左') : '') + (Math.abs(y) > 0.38 ? (y < 0 ? '上' : '下') : ''); };
const orH = st => `左眼 OS　${POSE8[st.head.pose]}　下＝重力　${frontOf(st)}＝前`;
Object.assign(PT, {
  h81: { title: '病人的頭位與眼睛（示意）', orient: '畫面下＝重力' },
  s81: { title: '眼球切面：經 11 點裂孔', orient: orH(VP.ST.sit81) },
  s81z: { title: '眼球切面：11 點裂孔放大', orient: orH(VP.ST.sit81) },
  s81s: { title: '眼球切面：經 11 點裂孔', orient: orH(VP.ST.sup81) },
  o81: { title: '術後的頭位', orient: '' },
  c82: { title: '術前：黃斑放大（眼底圖）', orient: VP.OR.chart },
  c82b: { title: '術後：視網膜往下滑（示意）', orient: VP.OR.chart },
  c82c: { title: '試驗的病人和本例', orient: VP.OR.chart },
  f82: { title: '術前：fovea 附近的切面', orient: VP.OR.sec },
  h82: { title: 'PostRD 隨機試驗：術後 24 小時的頭位', orient: '氣泡量示意　下＝重力' },
  n83: { title: '全身麻醉時平躺（示意）', orient: orH(VP.ST.sup81) },
  k83: { title: '警示手環或卡片', orient: '' },
  a83: { title: '搭飛機、上高山', orient: '' },
  g83: { title: '氣體慢慢被吸收（示意）', orient: orH(VP.ST.sit81) },
  c83: { title: 'N2O 的連鎖反應', orient: '' },
  t83: { title: '術後的時間軸（依比例）', orient: '' },
  i84: { title: '有氣體的眼：術後眼壓', orient: '回溯研究' },
  t84: { title: '術後 24 小時的時間軸（依比例）', orient: '' },
  l84: { title: '術後第一週要看的四件事（圖示為示意）', orient: '' },
  r84: { title: '再剝離：多半在兩個月內', orient: '' },
  e84: { title: '有晶體的眼：之後的白內障（示意）', orient: '' },
  j84: { title: '做了白內障手術的比例', orient: '英國資料' },
});
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4) + JSON.stringify(TX5) + JSON.stringify(TX6) + JSON.stringify(TX7) + JSON.stringify(POSE8);
// the head icon (the model's, 示意) in a k px box at (x, y), and the eye of the same state enlarged in a circle (centre c, radius r px): the model's head
// view of that state (the same turn, gravity down) clipped to the eye; a ring at the icon's eye and dashed callout lines to the circle.
// Returns { svg, m: mm of the head view → px, M: its anchors (mm) }
function headFig(st, id, x, y, k, c, r, op = 1, icon = true) {
  const rot = POSTERIOR.headPlane(st).rotDeg * Math.PI / 180, ex = 0.24, ey = -0.06;   // the icon's eye at (0.74, 0.44) of its box, from the box centre
  const q = [x + k * (0.5 + ex * Math.cos(rot) - ey * Math.sin(rot)), y + k * (0.5 + ex * Math.sin(rot) + ey * Math.cos(rot))];
  const Z = VP.headZ(st, 100, 100, VP.WIN.headT, id, { tw: VP.WIN.headT, step: 0.06 }), s = r / 13.0, m = p => [c[0] + s * p[0], c[1] + s * p[1]];
  const d = Math.hypot(c[0] - q[0], c[1] - q[1]) || 1, n = [-(c[1] - q[1]) / d * r, (c[0] - q[0]) / d * r];
  let o = `<g opacity="${F1(op)}">`;
  if (icon) o += POSTERIOR.headIcon(st, x, y, k) + `<path d="M${F1(q[0])} ${F1(q[1])}L${F1(c[0] + n[0])} ${F1(c[1] + n[1])}M${F1(q[0])} ${F1(q[1])}L${F1(c[0] - n[0])} ${F1(c[1] - n[1])}" stroke="#8a97a3" stroke-width="1.4" stroke-dasharray="5 4" fill="none"/>` +
    `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(Math.max(6, k * 0.06))}" fill="none" stroke="#5b6878" stroke-width="1.6"/>`;
  o += `<clipPath id="${id}_ec"><circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(r)}"/></clipPath><circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(r)}" fill="#fff"/>` +
    `<g clip-path="url(#${id}_ec)"><g transform="translate(${F1(c[0])} ${F1(c[1])}) scale(${s.toFixed(4)})">${Z.r.svg}</g></g><circle cx="${F1(c[0])}" cy="${F1(c[1])}" r="${F1(r)}" fill="none" stroke="#8a97a3" stroke-width="2"/></g>`;
  return { svg: o, m, M: Z.M, q };
}
const gravArrow = (x, y0, y1, op) => arrowP([[x, y0], [x, y1]], COL.ink, op, 'arrK', 5);
const ring8 = (p, r, col, op, dash) => p ? `<circle cx="${F1(p[0])}" cy="${F1(p[1])}" r="${r}" fill="none" stroke="${col}" stroke-width="2.4"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${F1(op)}"/>` : '';
const cross8 = (x, y, r, op) => `<g opacity="${F1(op)}"><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${COL.red}" stroke-width="4"/><path d="M${F1(x - r * 0.7)} ${F1(y - r * 0.7)}L${F1(x + r * 0.7)} ${F1(y + r * 0.7)}" stroke="${COL.red}" stroke-width="4"/></g>`;
// the weight of narration line i's picture in a segment of n lines (crossfades over 0.6 s at each line's start)
const wLine = (T, i, n) => (i ? T.on(i, 0.6) : 1) * (i < n - 1 ? 1 - T.on(i + 1, 0.6) : 1);

DRAW2['8-1'] = T => {
  const ST = VP.ST, G = GLOBE, w = [0, 1, 2, 3, 4].map(i => wLine(T, i, 5));
  // ---------------- left: the head and its eye (示意). Lines 0–1 sitting and line 3 supine (one head), line 2 sitting and the head raised, line 4 all three
  let sl = '', el = '';
  const C1 = [400, 205], R1 = 118, ONE = st => headFig(st, 'e81' + st.head.pose, 36, 92, 200, C1, R1);
  for (const [i, op] of [[0, w[0] + w[1]], [3, w[3]]]) { if (!(op > 0)) continue; const st = VP.st81(i), F = ONE(st); sl += `<g opacity="${F1(op)}">${F.svg}</g>`;
    if (i === 0) { el += lab('氣體：浮到最高處', 'gas', 14, 52, F.m([1.5, -6.5]), { bold: true, color: C_G8, lc: C_G8, op: op * T.on(0, 0.6, 0.6) });
      el += lab('液體', 'fluid', PW - 12, 394, F.m([1.5, 6.5]), { side: 'R', op: w[0] * T.on(0, 0.6, 0.6) });
      el += lab('坐正', 'sitting', 40, 328, null, { bold: true, op });
      const zw = VP.WIN.z81, a = F.m([zw.x, zw.y]), b = F.m([zw.x + zw.w, zw.y + zw.w * PH / PW]);   // line 1: where the right panel zooms
      sl += `<rect x="${F1(a[0])}" y="${F1(a[1])}" width="${F1(b[0] - a[0])}" height="${F1(b[1] - a[1])}" fill="none" stroke="${COL.accent}" stroke-width="2.2" opacity="${F1(w[1])}"/>`; }
    else { el += lab('氣泡浮到前方', 'gas', 14, 52, F.m([3.5, -3]), { bold: true, color: C_G8, lc: C_G8, op });
      el += lab('仰躺', 'supine', 40, 328, null, { bold: true, op });
      sl += cross8(176, 320, 18, op); } }
  if (w[1] > 0) sl += bigCard(14, 342, 578, 62, [['不是把視網膜推回去', { size: 15, bold: true, color: COL.red }], ['用表面張力蓋住裂孔，撐到雷射的疤長牢', { size: 16, bold: true, color: C_G8 }]], { op: w[1], lh: 24, y0: 24 });
  if (w[2] > 0) { const A = headFig(ST.sit81, 'e81a', 20, 50, 118, [222, 222], 76, w[2]), B = headFig(ST.up81, 'e81b', 318, 50, 118, [522, 236], 72, w[2]);
    sl += A.svg + B.svg + ring8(A.m(A.M.tearMid), 8, '#c8361f', w[2]) + ring8(B.m(B.M.tearMid), 8, '#c8361f', w[2]);
    el += lab('坐正', 'sitting', 20, 342, null, { bold: true, op: w[2] }) + lab('頭抬高（示意）', 'head up', 318, 342, null, { bold: true, op: w[2] });
    el += lab('11 點裂孔（紅圈）在氣面以上', '', 20, 378, null, { bold: true, color: '#9c2a1a', op: w[2] });
    el += lab('裂孔也在氣面以上', '', 318, 378, null, { bold: true, color: '#9c2a1a', op: w[2] }); }
  if (w[4] > 0) { const xs = [101, 303, 505], sts = [ST.sit81, ST.up81, ST.sup81];
    sts.forEach((st, j) => { const F = headFig(st, 'e81c' + j, xs[j] - 96, 40, 76, [xs[j] + 22, 228], 64, w[4]); sl += F.svg; });
    sl += cross8(xs[2] + 70, 300, 18, w[4]);
    el += lab('坐正', '', 20, 352, null, { bold: true, op: w[4] }) + lab('頭抬高（示意）', '', 222, 352, null, { bold: true, op: w[4] }) + lab('避免平躺', '', 424, 352, null, { bold: true, color: COL.red, op: w[4] }); }
  sl += gravArrow(588, 16, 84, 1);
  el += lab('重力', 'gravity', PW - 28, 56, null, { side: 'R', bold: true });
  // ---------------- right: the model's head view of the same state (gravity down): sitting (lines 0, 2), the tear close up (line 1), supine (line 3), the card (line 4)
  let sr = '', er = '', PR = PT.s81;
  const sitOp = w[0] + w[2];
  if (sitOp > 0) { const S = VP.head(ST.sit81, PW, PH, VP.WIN.h81, 'h81'), a = S.A, o0 = w[0], o2 = w[2];
    sr += `<g opacity="${F1(sitOp)}">${S.svg}`;
    if (o2 > 0) { const gA = a.gasLineA, gB = a.gasLineB; sr += `<path d="M${F1(gB[0] - 30)} ${F1(gB[1])}H${F1(gA[0] + 30)}" stroke="${C_G8}" stroke-width="2" stroke-dasharray="7 5" opacity="${F1(o2)}"/>` + ring8(a.tearMid, 13, '#c8361f', o2); }
    sr += '</g>';
    er += lab('氣體：浮到最高處', 'gas', 14, 40, S.P([-4, -7]), { bold: true, color: C_G8, lc: C_G8, op: o0 });
    er += lab('液體', 'fluid', 14, 392, S.P([-4, 7]), { op: o0 });
    er += lab('液面：垂直重力', 'level', 14, 214, S.P([-7, 0]), { bold: true, op: o0 * T.on(0, 0.6, 0.6) });
    er += lab('重力', 'gravity', PW - 12, 150, a.gArrow, { side: 'R', bold: true, color: C_G8, lc: C_G8, op: o0 + o2 });
    er += lab('11 點裂孔', 'HST', PW - 12, 40, a.tearMid, Object.assign({ side: 'R', op: o0 }, HST));
    er += lab('11 點裂孔：在氣面以上', '', PW - 12, 40, a.tearMid, Object.assign({ side: 'R', op: o2 }, HST));
    er += lab('氣面', 'gas level', 14, 214, S.P([-7, 0]), { bold: true, color: C_G8, lc: C_G8, op: o2 });
    er += lab('水晶體', 'lens', PW - 12, 300, a.lens, { side: 'R', op: o2 }); }
  if (w[1] > 0) { const st = ST.sit81, Z = VP.headZ(st, PW, PH, VP.WIN.z81, 'z81', { tw: VP.WIN.z81T, step: 0.015 }), Gm = POSTERIOR.geom(st), T0 = Gm.tear, to = p => Z.P(G.toPlane(Z.r.plane, p)), gl = [];
    for (let s = T0.sh - 1.2; s <= T0.sh + T0.L * 1.06 + 1.2; s += 0.1) gl.push(to(stLRet(st, s)));
    const sp = POSTERIOR.laserSpots(Gm).filter(q => offPl(Z, q.p) < 0.25).map(q => to(q.p)).sort((p, q) => q[0] - p[0]);
    sr += `<g opacity="${F1(w[1])}">${Z.svg}<path d="${pth(gl)}" fill="none" stroke="#7fb4e3" stroke-width="12" stroke-linecap="round" opacity="0.45"/>` +
      sp.map(q => `<circle cx="${F1(q[0])}" cy="${F1(q[1])}" r="${F1(0.13 * Z.k)}" fill="${C_SCAR}" stroke="#2e1a0c" stroke-width="1.5"/>`).join('') + '</g>';
    er += lab('氣體', 'gas', 14, 392, to(VP.inPl(VP.SEC_H, 8.0, 0)), { bold: true, color: C_G8, lc: C_G8, op: w[1] });
    er += lab('表面張力：氣體蓋住裂孔（示意）', '', 14, 300, gl[Math.round(gl.length * 0.55)], { bold: true, color: C_G8, lc: C_G8, op: w[1] });
    er += lab('11 點裂孔', 'HST', PW - 12, 392, Z.A.tearMid, Object.assign({ side: 'R', op: w[1] }, HST));
    er += lab('雷射的疤（示意）', 'laser scar', PW - 12, 40, sp[0] || null, { side: 'R', bold: true, color: C_SCAR, lc: C_SCAR, op: w[1] * (sp.length ? 1 : 0) });
    if (w[1] > 0.5) PR = PT.s81z; }
  if (w[3] > 0) { const S = VP.head(ST.sup81, PW, PH, VP.WIN.h81, 's81s'), a = S.A;
    sr += `<g opacity="${F1(w[3])}">${S.svg}</g>`;
    er += lab('仰躺：氣泡浮到前方', 'gas', 14, 40, S.P([-4, -5]), { bold: true, color: C_G8, lc: C_G8, op: w[3] });
    er += lab('氣泡貼著水晶體後面', 'lens', PW - 12, 40, a.lensBack, { side: 'R', bold: true, color: COL.red, lc: COL.red, op: w[3] });
    er += lab('重力', 'gravity', PW - 12, 150, a.gArrow, { side: 'R', bold: true, color: C_G8, lc: C_G8, op: w[3] });
    sr += note('有晶體的眼：減少氣體碰到水晶體', w[3], PH - 14, PW - 12);
    if (w[3] > 0.5) PR = PT.s81s; }
  if (w[4] > 0) { sr += bigCard(83, 105, 440, 200, [['頭位怎麼擺、擺幾天', { size: 22, bold: true }], ['沒有共識', { size: 22, bold: true, color: COL.red }], ['→ 依主刀的醫囑', { size: 24, bold: true, color: COL.accent }]], { op: w[4], center: true, y0: 58, lh: 56 });
    if (w[4] > 0.5) PR = PT.o81; }
  return { L: { svg: sl, extra: el, P: PT.h81 }, R: { svg: sr, extra: er, P: PR } };
};

// two head views side by side (8-2): the model's head view of st in a W × H box at (x, y) with the head icon in its corner; anchors in panel px
function headBox(st, id, x, y, W, H) {
  const S = VP.head(st, W, H, VP.WIN.h82, id), A = {}; for (const [k, v] of Object.entries(S.A)) A[k] = [v[0] + x, v[1] + y];
  return { svg: `<g transform="translate(${x} ${y})">${S.svg}${POSTERIOR.headIcon(st, 4, H - 52, 48)}</g>`, A, P: p => { const q = S.P(p); return [q[0] + x, q[1] + y]; } };
}

DRAW2['8-2'] = T => {
  const ST = VP.ST, w1 = T.on(1, 0.6), w3 = T.on(3, 0.6), kPost = w1 * (1 - w3), w2 = T.on(2, 0.6);
  // ---------------- left: the chart around the macula — before the operation (line 0; line 3 for the comparison), after it with the retina sliding down (lines 1–2, 示意)
  let sl = '', el = '', PL = PT.c82;
  const pre = 1 - kPost;
  if (pre > 0) { const v = VP.fundus(ST.rrd, PW, PH, VP.WIN.mac, 'f82'), a = v.A, mc = v.P([0, 0]);
    sl += `<g opacity="${F1(pre)}">${v.svg}<circle cx="${F1(mc[0])}" cy="${F1(mc[1])}" r="${F1(2.75 * v.k)}" fill="none" stroke="${COL.accent}" stroke-width="2" stroke-dasharray="5 4"/>${VIEWS.sbar(v.k, 1)}</g>`;
    el += lab('fovea 還貼著', 'fovea on', PW - 12, 60, a.fovea, { side: 'R', bold: true, op: pre });
    el += lab('下半部黃斑剝離過', 'inferior macula off', PW - 12, 330, v.P([1.6, 2.2]), { side: 'R', bold: true, color: RDC, lc: RDC, op: pre * (1 - w3) });
    el += lab('視盤', 'optic disc', 14, 60, a.disc, { op: pre * (1 - w3) });
    if (w3 > 0) { sl += ring8(a.fovea, 22, COL.accent, w3);
      sl += bigCard(14, 232, 330, 116, [['試驗收的：fovea 已掉的病人', { size: 17, bold: true, color: COL.red }], ['本例：fovea 還貼著', { size: 17, bold: true, color: COL.accent }], ['→ 不完全一樣', { size: 17, bold: true }]], { op: w3, lh: 32, y0: 32 });
      if (w3 > 0.5) PL = PT.c82c; } }
  if (kPost > 0) { const v = VP.fundus(ST.sit81, PW, PH, VP.WIN.mac, 'f82b'), a = v.A, k = v.k, D = VP.DISP82, d = D.px * T.p(1, 0.35, 0.8), f = a.fovea, rr = 2.75 * k, g = [f[0] + D.dir[0] * d, f[1] + D.dir[1] * d];
    sl += `<g opacity="${F1(kPost)}">${v.svg}` + ring8(f, 18, '#ffffff', 1, '5 4') + ring8(g, 18, COL.amber, d > 0.5 ? 1 : 0) +
      arrowP([[f[0] + rr * 0.55, f[1] - 46], [f[0] + rr * 0.55 + D.dir[0] * 92, f[1] - 46 + D.dir[1] * 92]], COL.amber, T.p(1, 0.35, 0.5), 'arrM', 5) + VIEWS.sbar(k, 1) + '</g>';
    el += lab('術後可能往下滑（示意）', 'retinal displacement', PW - 12, 60, [f[0] + rr * 0.55, f[1] - 30], { side: 'R', bold: true, color: COL.amber, lc: COL.amber, op: kPost * T.p(1, 0.35, 0.5) });
    el += lab('fovea 原本的位置（虛線圈）', '', 14, 60, [f[0] - 13, f[1] - 13], { op: kPost * T.p(1, 0.35, 0.5) });
    el += lab('滑下來之後', '', 14, 330, [g[0] - 13, g[1] + 13], { bold: true, color: COL.amber, lc: COL.amber, op: kPost * T.p(1, 0.6, 0.8) });
    sl += note('滑動的方向與幅度：示意', kPost, PH - 14, PW - 12);
    if (kPost > 0.5) PL = PT.c82b; }
  // ---------------- right: line 0 the fovea section of the case (as 1-3); lines 1–3 PostRD's two positions (face-down; support-the-break = sitting for this case),
  // the bubble large (示意); line 2 the bars (to scale); line 3 the same vision
  let sr = '', er = '', PR = PT.f82;
  if (w1 < 1) { const S = VP.sec(ST.rrd, PW, PH, VP.WIN.fov, 's82', { tw: VP.WIN.fovT, step: 0.015 }), b = S.A, o = 1 - w1;
    sr += `<g opacity="${F1(o)}">${S.svg}${VIEWS.sbar(S.k, 1)}</g>`;
    er += lab('fovea 還貼著', 'fovea on', PW - 140, 46, b.fovea, { side: 'R', bold: true, op: o });
    er += lab('下半部黃斑剝離過', 'inferior macula off', 14, 46, b.macOff, { bold: true, color: RDC, lc: RDC, op: o }); }
  if (w1 > 0) { const BW = 290, BH = 228, A = headBox(ST.fd82, 'h82a', 8, 34, BW, BH), B = headBox(ST.stb82, 'h82b', 308, 34, BW, BH), bp = VP.barPx;
    sr += `<g opacity="${F1(w1)}"><rect x="0" y="0" width="${PW}" height="${PH}" fill="#fff"/>${A.svg}${B.svg}<path d="M303 30V270" stroke="#d3dae1" stroke-width="2"/></g>`;
    er += lab('臉朝下', 'face-down', 12, 24, null, { bold: true, op: w1 }) + lab('撐住裂孔', 'support-the-break', 312, 24, null, { bold: true, op: w1 });
    sr += text(PW - 14, 254, '本例 11 點：坐正', { size: 14, bold: true, anchor: 'end', color: COL.sub, op: w1 });
    er += lab('氣泡在後極（黃斑上）', 'gas', 12, 290, A.P([1, -5]), { bold: true, color: C_G8, lc: C_G8, op: w1 * (1 - w2) });
    er += lab('氣泡在上方', 'gas', 312, 290, B.P([-3, -5]), { bold: true, color: C_G8, lc: C_G8, op: w1 * (1 - w2) });
    // line 2: displacement 42 % vs 56 % (Casswell 2020), one scale
    if (w2 > 0) { const y = 300, P8 = VP.PROS82;
      sr += `<g opacity="${F1(w2)}">` + text(20, y - 12, '視網膜往下滑', { size: 15, color: COL.sub }) + text(320, y - 12, '視網膜往下滑', { size: 15, color: COL.sub }) +
        `<rect x="20" y="${y}" width="${F1(bp(P8.fd))}" height="22" rx="3" fill="${COL.amber}"/><rect x="320" y="${y}" width="${F1(bp(P8.stb))}" height="22" rx="3" fill="${COL.amber}"/>` +
        text(F1(28 + bp(P8.fd)), y + 18, `${P8.fd}%`, { size: 20, bold: true, color: COL.amber }) + text(F1(328 + bp(P8.stb)), y + 18, `${P8.stb}%`, { size: 20, bold: true, color: COL.amber }) + '</g>'; }
    if (w3 > 0) sr += `<g opacity="${F1(w3)}"><rect x="20" y="346" width="566" height="46" rx="8" fill="#e7f3ef" stroke="${COL.accent}" stroke-width="2"/>` +
      text(PW / 2, 376, '最後的視力：兩組相同', { size: 19, bold: true, anchor: 'middle', color: COL.accent }) + '</g>';
    if (w1 > 0.5) PR = PT.h82; }
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: PR } };
};

// a dial (示意: no numbers) at (cx, cy), radius r; k 0 → 1 sweeps the needle from the left (low) to the right (high, red)
function dial8(cx, cy, r, k, op) {
  const arc = (a0, a1, col) => { const p = a => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)], s = p(a0), e = p(a1);
    return `<path d="M${F1(s[0])} ${F1(s[1])}A${r} ${r} 0 0 1 ${F1(e[0])} ${F1(e[1])}" fill="none" stroke="${col}" stroke-width="12"/>`; };
  const a = (180 - 170 * Math.max(0, Math.min(1, k))) * Math.PI / 180;
  return `<g opacity="${F1(op)}"><rect x="${cx - r - 14}" y="${cy - r - 14}" width="${2 * r + 28}" height="${r + 34}" rx="8" fill="#fff" stroke="#d3dae1"/>${arc(180, 120, '#3aa676')}${arc(120, 60, '#e8a33a')}${arc(60, 0, COL.red)}` +
    `<path d="M${cx} ${cy}L${F1(cx + (r - 10) * Math.cos(a))} ${F1(cy - (r - 10) * Math.sin(a))}" stroke="${COL.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="${COL.ink}"/></g>`;
}
// an aeroplane and a mountain (icons), each with a no-entry sign
function plane8(x, y, s, op) { return `<g opacity="${F1(op)}" transform="translate(${x} ${y}) scale(${s})" fill="#7d8a96"><rect x="-50" y="-6" width="100" height="12" rx="6"/>` +
  `<path d="M10 -5L-12 -44L-24 -44L-10 -5ZM10 5L-12 44L-24 44L-10 5ZM-36 -5L-44 -20L-51 -20L-48 -5ZM-36 5L-44 20L-51 20L-48 5Z"/></g>`; }
function mount8(x, y, s, op) { return `<g opacity="${F1(op)}" transform="translate(${x} ${y}) scale(${s})"><path d="M-52 26L-14 -30L4 -4L18 -22L52 26Z" fill="#8a7a66"/><path d="M-14 -30L-24 -15L-14 -19L-6 -13Z" fill="#fff"/></g>`; }

DRAW2['8-3'] = T => {
  const ST = VP.ST, w = [0, 1, 2, 3, 4].map(i => wLine(T, i, 5)), kN = T.p(0, 0.15, 0.7), n01 = w[0] + w[1];
  // ---------------- left: line 0–1 lying supine under general anaesthesia, the bubble growing with N2O (示意: no factor, no pressure); line 2 the warning card;
  // line 3 flying and mountains; line 4 the bubble getting smaller (示意)
  let sl = '', el = '', PL = PT.n83;
  if (n01 > 0) { const S = VP.head(VP.n2oStep(kN), PW, PH, VP.WIN.n83, 'n83'), a = S.A, opA = T.on(0, 0.6) * (1 - T.p(0, 0.7, 0.8));
    sl += `<g opacity="${F1(n01)}">${S.svg}${POSTERIOR.headIcon(ST.sup81, 14, PH - 92, 76)}`;
    [[4, -4.5], [7, -3.6], [9.5, -3]].forEach((p, i) => { const q = S.P(p); sl += arrowP([[PW - 14, 150 + 35 * i], q], COL.amber, opA, 'arrM', 3, '6 5'); });   // N2O into the bubble (示意)
    sl += dial8(492, 300, 54, kN, 1) + '</g>';
    el += lab('N2O 跑進氣泡', 'N2O', PW - 12, 132, null, { side: 'R', bold: true, color: COL.amber, op: n01 * opA });
    el += lab('氣泡迅速變大（示意）', 'gas', 14, 40, S.P([-3, (S.M.gasLineA || [0, 0])[1] - 1.5]), { bold: true, color: C_G8, lc: C_G8, op: n01 * T.p(0, 0.2, 0.3) });
    el += lab('眼壓衝高', 'IOP', PW - 12, 226, [492, 262], { side: 'R', bold: true, color: COL.red, lc: COL.red, op: n01 * T.p(0, 0.55, 0.65) });
    if (w[1] > 0) sl += badge(330, PH - 46, '有病人因此失明', COL.red, w[1]); }
  if (w[2] > 0) { const o = w[2];
    sl += `<g opacity="${F1(o)}"><rect x="63" y="58" width="480" height="270" rx="16" fill="#fff" stroke="${COL.red}" stroke-width="3"/><path d="M63 74a16 16 0 0 1 16 -16h448a16 16 0 0 1 16 16v42H63z" fill="${COL.red}"/>` +
      text(PW / 2, 98, '警示卡（示意）', { size: 22, bold: true, color: '#fff', anchor: 'middle' }) + text(PW / 2, 166, '眼內有氣體（C3F8）', { size: 24, bold: true, anchor: 'middle' }) +
      text(PW / 2, 220, '以後任何手術：先告訴麻醉科', { size: 21, bold: true, anchor: 'middle', color: COL.red }) + text(PW / 2, 272, '絕不能用 N2O 麻醉', { size: 21, bold: true, anchor: 'middle', color: COL.red }) + '</g>';
    if (o > 0.5) PL = PT.k83; }
  if (w[3] > 0) { const o = w[3], y = 300, ip = VP.iopPx, up = 1 + VP.MILLS / 100;
    sl += plane8(160, 96, 1.5, o) + cross8(160, 96, 62, o) + mount8(440, 100, 1.3, o) + cross8(440, 96, 62, o);
    sl += text(PW / 2, 196, '氣體完全吸收之前：不搭飛機、不上高山', { size: 18, bold: true, anchor: 'middle', op: o });
    sl += `<g opacity="${F1(o)}">` + text(20, y - 50, '模擬上升時的眼壓（平均）', { size: 15, color: COL.sub }) + text(20, y - 14, '上升前', { size: 15, bold: true }) + text(20, y + 36, '上升時', { size: 15, bold: true, color: COL.red }) +
      `<rect x="90" y="${y - 30}" width="${F1(ip(1))}" height="22" rx="3" fill="#9aa5b1"/><rect x="90" y="${y + 20}" width="${F1(ip(up))}" height="22" rx="3" fill="${COL.red}"/>` +
      text(F1(100 + ip(up)), y + 38, `平均升高 ${VP.MILLS}%`, { size: 18, bold: true, color: COL.red }) + text(20, y + 88, '就算氣泡只剩一小部分', { size: 16, bold: true }) + '</g>';
    if (o > 0.5) PL = PT.a83; }
  if (w[4] > 0) { const o = w[4];
    VP.GAS83.forEach((g, j) => { const F = headFig(VP.shrink83(g), 'g83' + j, 0, 0, 0, [101 + 202 * j, 180], 84, o, false); sl += F.svg; if (j < 2) sl += arrowP([[101 + 202 * j + 92, 180], [101 + 202 * (j + 1) - 92, 180]], COL.sub, o, 'arrK', 3); });
    sl += text(PW / 2, 326, '氣泡慢慢被吸收（大小示意）', { size: 17, bold: true, anchor: 'middle', color: C_G8, op: o }) + text(PW / 2, 360, '有晶體的眼：氣體留得更久', { size: 18, bold: true, anchor: 'middle', op: o });
    if (o > 0.5) PL = PT.g83; }
  // ---------------- right: line 0 the chain from N2O to CRAO; lines 1–4 the time line after the operation, to scale (days)
  let sr = '', er = '', PR = PT.c83;
  if (w[0] > 0) { const rows = ['N2O 全身麻醉', 'N2O 跑進眼內的氣泡', '氣泡迅速變大', '眼壓衝高', 'CRAO：視網膜中央動脈阻塞'], o = w[0];
    rows.forEach((t, i) => { const y = 14 + i * 78, on = kN * 5 >= i - 0.01 ? 1 : 0.25, red = i >= 3;
      sr += `<g opacity="${F1(o * on)}"><rect x="103" y="${y}" width="400" height="52" rx="10" fill="${red ? '#fdecea' : '#f7f9fa'}" stroke="${red ? COL.red : '#c9d1d9'}" stroke-width="2"/>` + text(PW / 2, y + 33, t, { size: 18, bold: true, anchor: 'middle', color: red ? COL.red : COL.ink }) + '</g>';
      if (i < 4) sr += arrowP([[PW / 2, y + 55], [PW / 2, y + 74]], COL.sub, o * (kN * 5 >= i + 1 ? 1 : 0.25), 'arrK', 3); }); }
  const tl = 1 - w[0];
  if (tl > 0) { const L = VP.TL83, x0 = 40, x1 = 566, X = d => VP.x83(d, x0, x1), y = 150, m3 = L.risk * L.dpm, o1 = T.on(1, 0.6), o2 = T.on(2, 0.6), o3 = T.on(3, 0.6), o4 = T.on(4, 0.6);
    let s = `<g opacity="${F1(tl)}"><path d="M${x0} ${y}H${x1 + 16}" stroke="${COL.ink}" stroke-width="2.5"/><path d="M${x0} ${y - 8}V${y + 8}" stroke="${COL.ink}" stroke-width="2.5"/>` + text(x0, y + 30, '手術', { size: 15, bold: true, anchor: 'middle' });
    // N2O risk: at least 3 months (Silvanus 2008), the arrow carrying on; loss of vision as late as day 37 (Lee 2004)
    s += `<g opacity="${F1(o1)}"><rect x="${x0}" y="${y - 52}" width="${F1(X(m3) - x0)}" height="34" fill="${COL.red}" opacity="0.16"/>` + arrowP([[X(m3), y - 35], [x1 + 4, y - 35]], COL.red, 1, 'arrR', 3, '6 5') +
      `<path d="M${F1(X(m3))} ${y - 8}V${y + 8}" stroke="${COL.ink}" stroke-width="2.5"/>` + text(F1(X(m3)), y + 30, `${L.risk} 個月`, { size: 15, bold: true, anchor: 'middle' }) +
      text(x0 + 8, y - 62, `N2O 的風險期：至少 ${L.risk} 個月`, { size: 16, bold: true, color: COL.red }) +
      `<circle cx="${F1(X(L.lee))}" cy="${y}" r="8" fill="${COL.red}"/><path d="M${F1(X(L.lee))} ${y + 8}V${y + 42}" stroke="${COL.red}" stroke-width="1.5"/>` + text(F1(X(L.lee)), y + 60, `術後 ${L.lee} 天仍發生`, { size: 15, bold: true, anchor: 'middle', color: COL.red }) + '</g>';
    s += `<g opacity="${F1(o2)}"><rect x="${x0 + 14}" y="${y - 47}" width="40" height="24" rx="3" fill="#fff" stroke="${COL.red}" stroke-width="2"/><rect x="${x0 + 14}" y="${y - 47}" width="40" height="8" fill="${COL.red}"/>` + text(x0 + 62, y - 29, '這段期間：帶著警示卡', { size: 14, bold: true, color: COL.red }) + '</g>';
    // no flying / mountains until the gas is all gone (no day written: the end is fuzzy); 15 % C3F8 gone at 67.7 days on average (Kontos 2017a), phakic longer
    s += `<g opacity="${F1(o3)}"><defs><linearGradient id="t83g" x1="${x0}" x2="${x1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C_G8}" stop-opacity="0.3"/><stop offset="${F1((X(50) - x0) / (x1 - x0))}" stop-color="${C_G8}" stop-opacity="0.3"/><stop offset="${F1((X(110) - x0) / (x1 - x0))}" stop-color="${C_G8}" stop-opacity="0"/></linearGradient></defs>` +
      `<rect x="${x0}" y="${y + 84}" width="${x1 - x0}" height="34" fill="url(#t83g)"/>` + text(x0 + 8, y + 106, '不搭飛機、不上高山：直到氣體完全吸收', { size: 14, bold: true, color: C_G8 }) + '</g>';
    s += `<g opacity="${F1(o4)}"><path d="M${F1(X(L.gone))} ${y - 8}V${y + 160}" stroke="${C_G8}" stroke-width="2" stroke-dasharray="5 4"/>` + arrowP([[X(L.gone), y + 202], [X(L.gone) + 110, y + 202]], COL.suture, 1, 'arrB', 3) +
      text(F1(X(L.gone) - 6), y + 178, `15% C3F8：平均 ${L.gone} 天完全消失`, { size: 15, bold: true, anchor: 'end', color: C_G8 }) + text(F1(X(L.gone) + 116), y + 207, '有晶體：更久', { size: 15, bold: true, color: C_G8 }) + '</g>';
    sr += s + '</g>' + note('時間軸依比例：橫軸是術後天數', tl, PH - 14, PW - 12);
    if (tl > 0.5) PR = PT.t83; }
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: PR } };
};

// the four things to look at in the first week (8-4 line 2; icons 示意), one per 280 × 340 px tile at (x, y): a wound leaking, the bubble's level,
// gas in the anterior chamber, the retina on; hl highlights the tile. Each icon is drawn round (0, 0) and scaled
function tile8(x, y, n, op, hl = 0) {
  const I = [
    `<rect x="-90" y="-20" width="180" height="34" fill="#f2efe6" stroke="#9c8f78" stroke-width="1.5"/><path d="M-50 -20L30 14" stroke="#7d6a5a" stroke-width="3"/>` +
      `<path d="M-58 -30c-6 -10 -6 -16 0 -22c6 6 6 12 0 22z" fill="#5aa0d8"/><circle cx="-40" cy="-40" r="5" fill="#fff" stroke="#5aa0d8" stroke-width="1.5"/>`,
    `<circle cx="0" cy="0" r="46" fill="#dff0e6" stroke="#9c8f78" stroke-width="2"/><path d="M-44 6A46 46 0 0 1 44 6Z" fill="#eaf3fb" stroke="${C_G8}" stroke-width="1.5"/>` +
      `<path d="M64 -40V4" stroke="${C_G8}" stroke-width="2.5" marker-end="url(#arrB)"/><path d="M54 6H74" stroke="${C_G8}" stroke-width="2.5"/>`,
    `<path d="M-60 40Q0 -70 60 40" fill="#eef7fb" stroke="#86b9d6" stroke-width="3"/><path d="M-62 30H-18M18 30H62" stroke="#7a5a44" stroke-width="5"/>` +
      `<ellipse cx="0" cy="44" rx="34" ry="16" fill="#f4f1e6" stroke="#b9ae95" stroke-width="1.5"/><circle cx="0" cy="4" r="10" fill="#ffffff" stroke="${C_G8}" stroke-width="2"/>`,
    `<path d="M-80 30Q0 -40 80 30" fill="none" stroke="#b7795d" stroke-width="8"/><path d="M-80 22Q0 -48 80 22" fill="none" stroke="#e6a06e" stroke-width="4"/>` +
      `<path d="M52 -40l10 10l20 -22" fill="none" stroke="${COL.accent}" stroke-width="5" stroke-linecap="round"/>`];
  return `<g opacity="${F1(op)}"><rect x="${x}" y="${y}" width="280" height="340" rx="10" fill="${hl ? '#e7f3ef' : '#f7f9fa'}" stroke="${hl ? COL.accent : '#d3dae1'}" stroke-width="${hl ? 2.5 : 1}"/>` +
    `<g transform="translate(${x + 140} ${y + 150}) scale(1.45)">${I[n]}</g></g>`;
}

DRAW2['8-4'] = T => {
  const w = [0, 1, 2, 3, 4].map(i => wLine(T, i, 5)), w01 = w[0] + w[1], bp = VP.barPx;
  // ---------------- left: lines 0–1 IOP after gas (Chen 1997: 43 % over 25 mmHg, 88 % of them within 24 h; bars to scale); line 2 two of the four things to look at;
  // line 3 redetachment among the failures (Lee 2014: 72.9 % within two months); line 4 the lens clouding (示意)
  let sl = '', el = '', PL = PT.i84;
  if (w01 > 0) { const C = VP.CHEN, x = 20, o = w01, y1 = 80, y2 = 214;
    sl += `<g opacity="${F1(o)}">` + text(x, y1 - 16, '眼壓超過 25 mmHg 的眼（佔全部有氣體的眼）', { size: 15, color: COL.sub }) +
      `<rect x="${x}" y="${y1}" width="${F1(bp(100))}" height="30" rx="3" fill="#e1e6ea"/><rect x="${x}" y="${y1}" width="${F1(bp(C.gt25))}" height="30" rx="3" fill="${COL.red}"/>` + text(F1(x + bp(C.gt25) + 10), y1 + 23, `${C.gt25}%`, { size: 22, bold: true, color: COL.red }) +
      text(x, y2 - 16, '眼壓升高的眼裡，發生在 24 小時內的', { size: 15, color: COL.sub }) +
      `<rect x="${x}" y="${y2}" width="${F1(bp(100))}" height="30" rx="3" fill="#f6d5d1"/><rect x="${x}" y="${y2}" width="${F1(bp(C.in24))}" height="30" rx="3" fill="${COL.red}"/>` + text(F1(x + bp(C.in24) - 10), y2 + 23, `${C.in24}%`, { size: 22, bold: true, color: '#fff', anchor: 'end' }) + '</g>';
    sl += bigCard(14, 300, 578, 96, [['→ 當晚到隔天早上，都要量眼壓', { size: 20, bold: true, color: COL.accent }]], { op: w[1], y0: 56 }); }
  if (w[2] > 0) { sl += tile8(14, 20, 0, w[2]) + tile8(312, 20, 1, w[2]);
    sl += text(154, 322, '① 傷口有沒有漏', { size: 18, bold: true, anchor: 'middle', op: w[2] }) + text(452, 322, '② 氣泡大小', { size: 18, bold: true, anchor: 'middle', op: w[2] });
    PL = w[2] > 0.5 ? PT.l84 : PL; }
  if (w[3] > 0) { const o = w[3], x = 20, y = 150, p = VP.LEE14;
    sl += `<g opacity="${F1(o)}">` + text(x, y - 76, '失敗（再剝離）的病例：何時被診斷', { size: 17, bold: true }) + text(x, y - 46, '全部失敗的病例＝整條', { size: 15, color: COL.sub }) +
      `<rect x="${x}" y="${y}" width="${F1(bp(100))}" height="34" rx="3" fill="#e1e6ea"/><rect x="${x}" y="${y}" width="${F1(bp(p))}" height="34" rx="3" fill="${COL.amber}"/>` +
      text(F1(x + bp(p) - 10), y + 24, `${p}%`, { size: 22, bold: true, color: '#fff', anchor: 'end' }) + text(x, y + 64, '兩個月內被診斷', { size: 16, bold: true, color: COL.amber }) + text(F1(x + bp(100)), y + 64, '之後', { size: 16, color: COL.sub, anchor: 'end' }) + '</g>';
    sl += bigCard(14, 290, 578, 100, [['這是「失敗病例裡」的比例', { size: 18, bold: true }], ['不是再剝離率', { size: 18, bold: true, color: COL.red }]], { op: o, lh: 32, y0: 40 });
    if (o > 0.5) PL = PT.r84; }
  if (w[4] > 0) { const o = w[4], lens = (cx, cy, cl) => `<ellipse cx="${cx}" cy="${cy}" rx="44" ry="74" fill="${cl ? '#e9dcb4' : '#f4f8fb'}" stroke="#9aa5b1" stroke-width="2.5"/>` + (cl ? `<ellipse cx="${cx}" cy="${cy}" rx="28" ry="48" fill="#cdb67a" opacity="0.8"/>` : '');
    sl += `<g opacity="${F1(o)}">${lens(160, 170, 0)}${lens(446, 170, 1)}` + arrowP([[222, 170], [384, 170]], COL.sub, 1, 'arrK', 4) + text(160, 286, '術前：有晶體', { size: 16, bold: true, anchor: 'middle' }) +
      text(446, 286, '做完 PPV 之後', { size: 16, bold: true, anchor: 'middle' }) + text(PW / 2, 346, '大多會長白內障（混濁的畫法為示意）', { size: 17, bold: true, anchor: 'middle', color: '#8a6400' }) + '</g>';
    if (o > 0.5) PL = PT.e84; }
  // ---------------- right: lines 0–1 the first 24 hours to scale (the 8–12 h band, Muether 2011); lines 2–3 two of the four things (line 3: the retina highlighted);
  // line 4 cataract surgery by one and two years (Jackson 2013, UK; bars to scale)
  let sr = '', er = '', PR = PT.t84;
  if (w01 > 0) { const L = VP.TL84, x0 = 40, x1 = 560, X = h => VP.x84(h, x0, x1), y = 150, o = w01, o1 = T.on(1, 0.6);
    sr += `<g opacity="${F1(o)}"><path d="M${x0} ${y}H${x1}" stroke="${COL.ink}" stroke-width="2.5"/>` + [0, L.end].map(h => `<path d="M${F1(X(h))} ${y - 8}V${y + 8}" stroke="${COL.ink}" stroke-width="2.5"/>`).join('') +
      text(x0, y + 32, '手術', { size: 15, bold: true, anchor: 'middle' }) + text(F1(X(L.end)), y + 32, `${L.end} 小時`, { size: 15, bold: true, anchor: 'middle' }) +
      `<rect x="${x0}" y="${y - 54}" width="${F1(X(L.end) - x0)}" height="36" fill="${COL.red}" opacity="0.14"/>` + text(x0 + 8, y - 30, `眼壓升高的 ${VP.CHEN.in24}% 發生在這 ${L.end} 小時內`, { size: 15, bold: true, color: COL.red }) +
      `<g opacity="${F1(o1)}"><rect x="${F1(X(L.band[0]))}" y="${y}" width="${F1(X(L.band[1]) - X(L.band[0]))}" height="48" fill="${COL.amber}" opacity="0.22"/>` +
      [L.band[0], L.band[1]].map(h => `<path d="M${F1(X(h))} ${y - 8}V${y + 48}" stroke="${COL.amber}" stroke-width="2"/>` + text(F1(X(h)), y + 68, `${h}`, { size: 15, bold: true, anchor: 'middle', color: COL.amber })).join('') +
      text(F1((X(L.band[0]) + X(L.band[1])) / 2), y + 96, `RRD 常在 ${L.band[0]} 到 ${L.band[1]} 小時升高`, { size: 15, bold: true, anchor: 'middle', color: COL.amber }) + '</g>' +
      `<g opacity="${F1(o1)}">` + text(x0, y + 156, '當晚', { size: 17, bold: true, color: COL.accent }) + arrowP([[x0 + 46, y + 150], [x0 + 140, y + 150]], COL.accent, 1, 'arrA', 3) +
      text(x0 + 150, y + 156, '隔天早上：都量眼壓', { size: 17, bold: true, color: COL.accent }) + '</g></g>' + note('時間軸依比例：橫軸是術後小時', o, PH - 14, PW - 12); }
  if (w[2] + w[3] > 0) { const o = w[2] + w[3];
    sr += tile8(14, 20, 2, o) + tile8(312, 20, 3, o, w[3] > 0.5 ? 1 : 0);
    sr += text(154, 322, '③ 氣體有沒有跑進前房', { size: 18, bold: true, anchor: 'middle', op: o }) + text(452, 322, '④ 視網膜有沒有貼回', { size: 18, bold: true, anchor: 'middle', op: o });
    PR = PT.l84; }
  if (w[4] > 0) { const o = w[4], x = 20, J = VP.JACK;
    sr += `<g opacity="${F1(o)}">` + J.map((r, i) => { const y = 70 + i * 84; return text(x, y - 12, ['一年內', '兩年內'][i], { size: 16, bold: true }) +
      `<rect x="${x}" y="${y}" width="${F1(bp(100))}" height="30" rx="3" fill="#e1e6ea"/><rect x="${x}" y="${y}" width="${F1(bp(r.p))}" height="30" rx="3" fill="#8a6400"/>` +
      text(F1(x + bp(r.p) - 10), y + 22, `${r.p}%`, { size: 20, bold: true, color: '#fff', anchor: 'end' }); }).join('') + '</g>';
    sr += bigCard(14, 250, 578, 140, [['英國資料庫：有晶體的眼做完玻璃體切除', { size: 16, bold: true }], ['（各種原因的 PPV，不只 RRD）', { size: 16, color: COL.sub }], ['→ 做了白內障手術的比例', { size: 16, bold: true, color: '#8a6400' }]], { op: o, lh: 30, y0: 36 });
    if (o > 0.5) PR = PT.j84; }
  return { L: { svg: sl, extra: el, P: PL }, R: { svg: sr, extra: er, P: PR } };
};

// ---------------------------------------------------------------- 9 助手記住這八件事
// Chapter 9 (one full-width panel): line 0 the heading only; lines 1–8 add one card each to a 4 × 2 grid (VP.GRID9, reading order), the card of the
// current line highlighted, the earlier ones kept. Each card: its number (一…八), a title, a small picture and a column of words. The pictures are
// states their chapters already draw, in the same view (VP.CH9: 1 = 3-2's wide view turned toward 11, 2 = 2-2's infusion section, 3 = 5-2's mound,
// 5 = 6-2's bead, 7 = 7-3's microscope, 8 = 8-1's sitting head); 4 = three icons (示意) and 6 = 7-2's syringe in three steps (C3F8: no scale and no
// mL amount, 依院內常規). No hours or days for the head position. Nothing here is a VIEWS.lab2 label: check.js (M62) measures every text and picture box
// of this panel on the rendered page (inside the panel and inside its card, not overlapping).
const NUM9 = ['一', '二', '三', '四', '五', '六', '七', '八'];
const TX9 = {
  head: '助手記住這八件事', sub: '依手術的順序：從架設到術後', mound: '隆起',
  t: ['先在腦中定好方位', '開 infusion 之前', '壓鞏膜', '看到就馬上說', 'PFCL 要吸乾淨', '備氣：50 mL 針筒', '拔 cannula 之後', '術後'],
  r1: ['左眼 11 點', '在畫面下方', '略偏右', '術者坐 12 點', 'inverter 開'],
  r2: ['看到套管尖端', '在玻璃體腔', '術中也要不時再看', 'infusion（4 點半）'],
  r3: ['主刀說幾點', '就壓幾點', '深度、時間', '聽口令', '隆起＝壓的位置'],
  r4: ['視網膜被吸起', '新的裂孔', '器械靠近水晶體', '→ 馬上說出來', '圖示為示意'],
  r5: ['視網膜下', '可疑的小珠子', '→ 提出來', '讓主刀確認'],
  r6: ['① 抽純氣', '② 排到需要的量（依院內常規）', '③ 用無菌空氣補到 50 mL', '→ 和主刀確認氣體與濃度', '50 mL', '純 C3F8'],
  r7: ['每個傷口', '漏不漏', '量眼壓', '一直漏 → 縫一針'],
  r8: ['頭位：依醫囑', '眼壓：當晚到隔天', '不用 N2O', '不搭飛機', '給警示卡', '例：坐正'],
  P: { title: '跟刀清單的回顧', orient: '左眼 OS　小圖取自前面各章（看向 11 點、壓的位置、小珠子、圖示皆為示意）' },
};
window.PRELOAD_EXTRA = JSON.stringify(PT) + JSON.stringify(TX3) + JSON.stringify(TX4) + JSON.stringify(TX5) + JSON.stringify(TX6) + JSON.stringify(TX7) + JSON.stringify(POSE8) + JSON.stringify(TX9);
const t9 = (x, y, s, o = {}) => text(x, y, s, Object.assign({ cls: 't9' }, o));
// a column of words at (x, y): rows [text, { size, bold, color }]; each row's baseline 1.5 × its size below the previous one (gap: extra px before a row)
const col9 = (x, y, rows) => { let s = '', yy = y; rows.forEach(([t, o = {}], i) => { if (i) yy += (o.size || 15) * 1.5 + (o.gap || 0); s += t9(x, yy, t, o); }); return s; };
// the picture box of a card (VP.PIC9 px at GRID9.pic, rounded, clipped); the model's picture drawn into it once (a pure function of constants: cached)
const PICS9 = {};
const pic9 = (n, make, bg = '#fff') => { const [W, H] = VP.PIC9, [px, py] = VP.GRID9.pic, s = PICS9[n] || (PICS9[n] = make(W, H));
  return `<clipPath id="c9p${n}"><rect x="${px}" y="${py}" width="${W}" height="${H}" rx="6"/></clipPath><g clip-path="url(#c9p${n})"><g transform="translate(${px} ${py})"><rect width="${W}" height="${H}" fill="${bg}"/>${s}</g></g>` +
    `<rect class="p9" x="${px}" y="${py}" width="${W}" height="${H}" rx="6" fill="none" stroke="#c9d1d9" stroke-width="1.2"/>`; };
const ring9 = (p, r, col, w = 2.4, dash) => `<circle cx="${F1(p[0])}" cy="${F1(p[1])}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const slash9 = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${COL.red}" stroke-width="2.6"/><path d="M${F1(x - r * 0.7)} ${F1(y - r * 0.7)}L${F1(x + r * 0.7)} ${F1(y + r * 0.7)}" stroke="${COL.red}" stroke-width="2.6"/>`;
// the eight pictures (W × H px boxes; I = VP.CH9[n − 1])
const PIC9F = {
  1: (W, H) => { const I = VP.CH9[0], V = VP.wide(I.st, W, H, I.win, 'n9w1'), Wt = { A: V.A, c: V.P([0, 0]), r: V.M.R * V.k };   // 3-2 line 2: turned toward 11
    const a = rimPt(Wt, 11, -6), b = rimPt(Wt, 11, 4), q = rimPt(Wt, 11, 13);
    return `<rect width="${W}" height="${H}" fill="#0c0d0f"/>` + V.svg + clockNums(Wt, 1, { size: 12, gap: 10 }).replace(/<text /g, '<text class="t9" ') + `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="${TEAR_C}" stroke-width="3" stroke-linecap="round"/>` +
      t9(F1(q[0]), F1(q[1] + 4.3), '11', { size: 12, bold: true, color: TEAR_C, anchor: 'middle' }) + arrowP([Wt.c, rimPt(Wt, 11, -10)], TEAR_C, 1, 'arrR', 2.2, '6 4') + ring9(Wt.A.tear, 7, TEAR_C, 2); },
  2: (W, H) => { const I = VP.CH9[1], S = VP.sec(I.st, W, H, I.win, 'n9s2', { h: I.h, tw: Object.assign({ h: I.win.w * H / W }, I.win), step: 0.02 }), t = POSTERIOR.troc(POSTERIOR.geom(I.st)).find(x => x.inf);   // 2-2: the tip in the cavity
    return S.svg + ring9(S.P(GLOBE.toPlane(S.r.plane, t.tip)), 9, COL.accent, 2.6); },
  3: (W, H) => { const I = VP.CH9[2], V = VP.wide(I.st, W, H, I.win, 'n9w3'), Wt = { A: V.A, c: V.P([0, 0]), r: V.M.R * V.k }, a = rimPt(Wt, 11, -6), b = rimPt(Wt, 11, 4), q = rimPt(Wt, 11, 12);   // 5-2: the mound at 11
    return `<rect width="${W}" height="${H}" fill="#0c0d0f"/>` + V.svg + `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="${TEAR_C}" stroke-width="3" stroke-linecap="round"/>` +
      t9(F1(q[0]), F1(q[1] + 4.3), '11', { size: 12, bold: true, color: TEAR_C, anchor: 'middle' }) + htext(F1(V.A.dep[0] - 22), F1(V.A.dep[1] + 4), TX9.mound, { size: 12, bold: true, anchor: 'end', cls: 't9' }); },   // the model's dashed ring marks the mound
  5: (W, H) => { const I = VP.CH9[4], V = VP.wide(I.st, W, H, I.win, 'n9w5'), f = V.A.fovea;   // 6-2 lines 2–4: the retained bead by the fovea
    return V.svg + ring9(V.A.bead, F1(VP.BEAD.r * V.k * 2.2), COL.red, 2.6) + htext(F1(f[0] + 10), F1(f[1] + 22), 'fovea', { size: 12, bold: true, color: COL.ink, cls: 't9' }); },
  7: (W, H) => { const I = VP.CH9[6], E = VP.ext(I.st, W, H, I.win, 'n9e7');   // 7-3 line 2: every cannula out, each wound checked
    return E.svg + ['it', 'st', 'sn'].map(id => ring9(E.A['cj_' + id] || E.A['troc_' + id], 10, COL.accent, 2.4, '4 3')).join(''); },
  8: (W, H) => { const I = VP.CH9[7], F = headFig(I.st, 'n9h8', 0, 48, 78, [108, 52], 36);   // 8-1: sitting, the bubble at the top over the 11 o'clock tear
    return F.svg + ring8(F.m(F.M.tearMid), 5, '#c8361f', 1) + t9(108, 112, TX9.r8[5], { size: 12, bold: true, color: COL.sub, anchor: 'middle' }); },
};
// card 4's icons (示意), centred at (x, y): the retina sucked up to the cutter's port; a new break; an instrument close to the back of the lens
const ICON9 = [
  (x, y) => `<g transform="translate(${x} ${y})"><path d="M-24 10C-8 10 -7 -4 0 -4C7 -4 8 10 24 10" fill="none" stroke="#c97b6a" stroke-width="3.5"/><path d="M6 -8L24 -22" stroke="#6b737c" stroke-width="7" stroke-linecap="round"/></g>`,
  (x, y) => `<g transform="translate(${x} ${y})"><rect x="-24" y="-13" width="48" height="26" rx="6" fill="#d9703c"/><path d="M-7 -8V2A7 7 0 0 0 7 2V-8" fill="none" stroke="#7e1c10" stroke-width="3"/></g>`,
  (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="-8" cy="0" rx="9" ry="14" fill="#eef3f7" stroke="#9aa5b1" stroke-width="2"/><path d="M24 -10L5 2" stroke="#6b737c" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M2 -16v8" stroke="${COL.red}" stroke-width="2.6" stroke-linecap="round"/><circle cx="2" cy="-3.5" r="1.6" fill="${COL.red}"/></g>`,
];
// card 8's icons: a gas cylinder, an aeroplane (8-3's) and the warning card (8-3's, small), the first two struck out
const ICON8 = [
  (x, y) => `<g transform="translate(${x} ${y})"><rect x="-5" y="-8" width="10" height="17" rx="4" fill="#9aa5b1"/><rect x="-2.5" y="-11" width="5" height="4" fill="#5b6878"/></g>` + slash9(x, y, 11),
  (x, y) => plane8(x, y, 0.16, 1) + slash9(x, y, 11),
  (x, y) => `<g transform="translate(${x} ${y})"><rect x="-11" y="-8" width="22" height="16" rx="2.5" fill="#fff" stroke="${COL.red}" stroke-width="1.6"/><rect x="-11" y="-8" width="22" height="5" fill="${COL.red}"/></g>`,
];

DRAW2['9'] = T => {
  const G9 = VP.GRID9, W9 = G9.w, H9 = G9.h, R = (s, o) => [s, o];
  let s = '';
  // line 0: the heading only (fades as the first card comes in)
  const opH = 1 - T.on(1, 0.6);
  if (opH > 0) s += `<g opacity="${F1(opH)}">` + text(FW / 2, 186, TX9.head, { size: 38, bold: true, anchor: 'middle', cls: 'h9' }) + text(FW / 2, 236, TX9.sub, { size: 19, color: COL.sub, anchor: 'middle', cls: 'h9' }) + '</g>';
  // card 6: 7-2's syringe in three steps over line 6 (C3F8: no scale; the amount kept is a hatched band, 依院內常規)
  const syr6 = () => { const rg = VP.SYR.c3f8.range, F50 = VP.SYR.full, vEnd = rg[1] * F50, p1 = T.p(6, 0.05, 0.3), p2 = T.p(6, 0.35, 0.55), p3 = T.p(6, 0.6, 0.85), sc = 0.62, X0 = 30, Y0 = 74;
    const S = p3 > 0 || p2 >= 1 ? { total: lerp(vEnd, F50, p3), keep: null, range: rg } : { total: p2 > 0 ? lerp(F50, vEnd, p2) : F50 * p1, keep: null, range: rg, pureAll: true };
    const ph = p3 > 0 ? 3 : p2 > 0 ? 2 : 1, done = p3 >= 1, r = TX9.r6;
    return `<g transform="translate(${X0} ${Y0}) scale(${sc})">${syringe(0, 200, 0, Object.assign({ id: 'n9sy', label: false }, S))}</g>` + t9(F1(X0 + 200 * sc), Y0 - 22, r[4], { size: 13, bold: true, color: '#3b4752', anchor: 'middle' }) +
      t9(X0, Y0 - 22, r[5], { size: 13, bold: true, color: '#9a6412', op: ph < 3 ? 1 : 0 }) +
      col9(14, 120, [0, 1, 2].map(i => R(r[i], { size: 14, bold: !done && i + 1 === ph, color: !done && i + 1 === ph ? COL.accent : COL.ink })).concat([R(r[3], { size: 14, bold: true, color: COL.red, gap: 2 })])); };
  const body = {
    1: () => pic9(1, PIC9F[1], '#0c0d0f') + col9(G9.tx, 64, [R(TX9.r1[0], Object.assign({ size: 16 }, HST)), R(TX9.r1[1], { size: 16, bold: true }), R(TX9.r1[2], { size: 16, bold: true, color: COL.accent }),
      R(TX9.r1[3], { size: 13, color: COL.sub, gap: 6 }), R(TX9.r1[4], { size: 13, color: COL.sub })]),
    2: () => pic9(2, PIC9F[2]) + col9(G9.tx, 64, [R(TX9.r2[0], { size: 15, bold: true }), R(TX9.r2[1], { size: 15, bold: true, color: COL.accent }), R(TX9.r2[2], { size: 13, color: COL.sub, gap: 6 }), R(TX9.r2[3], { size: 13, color: '#24527d' })]),
    3: () => pic9(3, PIC9F[3], '#0c0d0f') + col9(G9.tx, 64, [R(TX9.r3[0], { size: 15, bold: true }), R(TX9.r3[1], { size: 15, bold: true, color: COL.accent }), R(TX9.r3[2], { size: 15, bold: true }), R(TX9.r3[3], { size: 15, bold: true, color: COL.accent }),
      R(TX9.r3[4], { size: 13, color: COL.sub, gap: 4 })]),
    4: () => [0, 1, 2].map(i => ICON9[i](40, 62 + i * 36) + t9(78, 68 + i * 36, TX9.r4[i], { size: 15, bold: true })).join('') + t9(14, 174, TX9.r4[3], { size: 17, bold: true, color: COL.red }) + t9(W9 - 10, 174, TX9.r4[4], { size: 12, color: COL.sub, anchor: 'end' }),
    5: () => pic9(5, PIC9F[5]) + col9(G9.tx, 64, [R(TX9.r5[0], { size: 15, bold: true }), R(TX9.r5[1], { size: 15, bold: true, color: C_PF }), R(TX9.r5[2], { size: 15, bold: true, color: COL.accent }), R(TX9.r5[3], { size: 13, color: COL.sub })]),
    6: syr6,
    7: () => pic9(7, PIC9F[7]) + col9(G9.tx, 64, [R(TX9.r7[0], { size: 15, bold: true, color: COL.accent }), R(TX9.r7[1], { size: 15, bold: true }), R(TX9.r7[2], { size: 15, bold: true, color: COL.accent }), R(TX9.r7[3], { size: 13, color: COL.sub, gap: 6 })]),
    8: () => pic9(8, PIC9F[8]) + col9(G9.tx, 62, [R(TX9.r8[0], { size: 14, bold: true }), R(TX9.r8[1], { size: 14, bold: true })]) +
      [0, 1, 2].map(i => ICON8[i](G9.tx + 12, 112 + i * 27) + t9(G9.tx + 32, 117 + i * 27, TX9.r8[2 + i], { size: 14, bold: true, color: COL.red })).join(''),
  };
  // lines 1–8: card n comes in with line n and stays; the card of the current line is highlighted
  for (let n = 1; n <= 8; n++) { const op = T.on(n, 0.6); if (!(op > 0)) continue;
    const hl = T.on(n, 0.4) * (n < 8 ? 1 - T.on(n + 1, 0.4) : 1) > 0.5, [x, y] = VP.card9(n);
    s += `<g class="c9" data-n="${n}" data-hl="${hl ? 1 : 0}" transform="translate(${x} ${y})" opacity="${F1(op)}">` +
      `<rect class="cb9" width="${W9}" height="${H9}" rx="10" fill="${hl ? '#eaf5f1' : '#f7f9fa'}" stroke="${hl ? COL.accent : '#d3dae1'}" stroke-width="${hl ? 3 : 1.2}"/>` +
      `<circle cx="22" cy="23" r="14" fill="${hl ? COL.accent : '#5b6878'}"/>` + t9(22, 29, NUM9[n - 1], { size: 16, bold: true, color: '#fff', anchor: 'middle' }) +
      t9(44, 29, TX9.t[n - 1], { size: 17, bold: true, color: hl ? COL.accent : COL.ink }) + body[n]() + '</g>'; }
  return { F: { svg: s, extra: '', P: TX9.P } };
};
