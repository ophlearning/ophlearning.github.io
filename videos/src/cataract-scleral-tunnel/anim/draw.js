// ============================================================================
// Drawing of every segment of the scleral-tunnel video (text is in segments.js). DRAW2[id](T) returns { L, R } (dual), { F } (full) or
// { R } (title): { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Left: the globe model's meridional section through the main incision (mechanism); right: the surgeon's microscope view of the OS eye,
// surgeon at upper-temporal (CASE.surgeon ≈ 1:30), the same state. The globe model is a right eye, but clock hours are the examiner's, so
// the incision at 1:30 sits where it does in this OS; only nasal / temporal swap names (OS: 3 o'clock = temporal), and the panels say so.
// Case parameters: params.js (CASE). Model numbers and sources: videos/models/globe/CARD.md 白內障; tunnel sources: spec.md 文獻.
// window.SYNC collects what check.js compares with the narration (M… checks), written by each segment's drawing.
// ============================================================================
const DRAW2 = {};
window.SYNC = {};
const lab = VIEWS.lab2, K = CATARACT, G = GLOBE, L0 = K.LENS;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const line2 = (q, col = COL.accent, w = 2.4, dash = '', op = 1) => `<path d="${pathOf(q)}" stroke="${col}" stroke-width="${w}" fill="none"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
const YB = PH - 48;   // bottom label row (the note row is PH − 14)
const WARN = '#b3262c', OK_COL = '#1f7a4a', SUT_COL = '#1d3f8f';

// ---------------------------------------------------------------- case states (params.js)
const SG = CASE.surgeon, MH = CASE.main.h;
const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
const HP = (MH + 6) % 12, HP_SIDE = (CASE.side.h + 6) % 12;     // sections: left = main incision / side port
const PERI = { peri360: CASE.peri };                             // conjunctiva rolled back (sections; 示意)
const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
const BASE = { main: MAIN, side: SIDE, globe: PERI };
const CLEAN = { cortex: new Array(12).fill(0), sub: 0 };
const tnM = K.tunnelOf(MAIN);
const CCI = { h: MH, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' };   // clear corneal main incision of series ① (Ernest 1995), for comparison
// a wall point (clock h, s mm behind the limbus, d mm deep) in 3D
const W3 = (s, d = 0, h = MH) => { const f = G.surfAt(s), t = K.tunnelOf({ ...MAIN, h }); return t.to3([f.rho - f.nr * d, f.z - f.nz * d]); };
const wallPath = (sd, h = MH) => { const q = []; for (let k = 1; k < sd.length; k++) for (let j = k === 1 ? 0 : 1; j <= 12; j++) { const t = j / 12;
  q.push(W3(sd[k - 1][0] + (sd[k][0] - sd[k - 1][0]) * t, sd[k - 1][1] + (sd[k][1] - sd[k - 1][1]) * t, h)); } return q; };
const tunnel3 = (cfg, f1 = 1) => { const tn = K.tunnelOf(cfg), q = []; for (let k = 0; k <= 40; k++) q.push(tn.to3(tn.at(f1 * k / 40))); return q; };
const mouth3 = cfg => { const ext = K.tunnelOf(cfg).ext, d = G.clockDir(cfg.h), lat = [d[1], -d[0]];
  return [-1, 1].map(sg => [ext[0] * d[0] + sg * cfg.w / 2 * lat[0], ext[0] * d[1] + sg * cfg.w / 2 * lat[1], ext[1]]); };

// ---------------------------------------------------------------- model windows (mm: left, top, width) and panel titles
const W_TUN = { x: -8.6, y: -13.3, w: 5.4 }, W_HALF = { x: -8.6, y: -14.6, w: 10.8 }, W_EYE = { x: -8.6, y: -6.2, w: 17.2 };
const SEC_T = { title: '經主切口的切面（模型）', orient: '左＝主切口（upper-temporal）　上＝前' };
const SIDE_T = { title: '經側切口的切面（模型）', orient: '左＝側切口　上＝前' };
const SCOPE_T = { title: '術者視角　左眼 OS（模型）', orient: '下＝主切口（約 1–2 點）　左下＝temporal' };
window.PRELOAD_EXTRA = JSON.stringify([SEC_T, SIDE_T, SCOPE_T]);

// ---------------------------------------------------------------- views: model window → panel (px), anchors mapped to panel px
const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, win, id, o = {}) {
  const c = VIEWS.cam(win, PW, PH), h = win.w * PH / PW;
  const r = K.section({ st, h: o.hp ?? HP, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 250).toFixed(4), id });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id) {
  const c = VIEWS.cam(win, PW, PH), r = K.enface({ st, id, surgeon: SG });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}

// ---------------------------------------------------------------- placeholder drawings (each chapter's helper replaces its own)
const base2 = (st, id) => { const a = sec(st, W_TUN, id + 'L'), b = scope(st, W_EYE, id + 'R');
  return { L: { svg: a.svg, extra: '', P: SEC_T }, R: { svg: b.svg, extra: '', P: SCOPE_T } }; };
const ST0 = { cat: { ...BASE } };
for (const id of ['2-2', '3-1', '3-2', '3-3', '4-1', '4-2', '5-1', '5-2', '6-1', '6-2', '6-3']) DRAW2[id] = T => base2(ST0, 'p' + id.replace('-', ''));
DRAW2['7'] = T => ({ F: { svg: '', extra: '', P: { title: '練習清單', orient: '' } } });

// ---------------------------------------------------------------- shared by 片頭 and chapters 1–2
const W_FULL = { x: -10.5, y: -6.15, w: 21 };          // microscope: the whole eye, the main incision (bottom) and its suture inside
const W_MOUTH = { x: -4.5, y: 2.95, w: 9 };           // microscope zoomed on the main incision: limbus and both outer openings
const W11 = { x: -9.1, y: -12.85, w: 6.4 };           // section around the tunnel: limbus, outer and inner opening
const thin = (q, col = COL.sub, w = 1.2, dash = '3 3', op = 1) => line2(q, col, w, dash, op);
const DONE = { ...BASE, ccc: CCC, bag: { ...CLEAN, collapse: 1 }, ovdBag: 1, ovdOut: { behind: 1, front: 1 }, ovd: 0, iol: { rot: -50 } };   // end of the case (print/steps.js cell 8)
// (s, d) of a 3D point near the main incision's meridian: s along the outer surface from the limbus (+ = over the sclera), d depth below it
const sdOf = p3 => { const rho = Math.hypot(p3[0], p3[1]), z = p3[2]; let best = 1e9, r = null;
  for (let s = -4; s <= 4; s += 0.002) { const f = G.surfAt(s), d = (f.rho - rho) * f.nr + (f.z - z) * f.nz, off = Math.hypot(f.rho - f.nr * d - rho, f.z - f.nz * d - z);
    if (off < best) { best = off; r = [s, d]; } } return r; };
// the internal corneal lip: the part of the tunnel in clear cornea (s < 0), from where it passes under the limbus to the inner opening
const LIP3 = (() => { const q = tunnel3(MAIN), sd = q.map(sdOf), i = sd.findIndex(x => x[0] <= 0), t = sd[i - 1][0] / (sd[i - 1][0] - sd[i][0]);
  return [q[i - 1].map((v, j) => v + (q[i][j] - v) * t), ...q.slice(i)]; })();
// the inner opening of an incision as two 3D points (its width), like mouth3 for the outer one
const inner3 = cfg => { const p = K.tunnelOf(cfg).int, d = G.clockDir(cfg.h), lat = [d[1], -d[0]];
  return [-1, 1].map(sg => [p[0] * d[0] + sg * cfg.w / 2 * lat[0], p[0] * d[1] + sg * cfg.w / 2 * lat[1], p[1]]); };
// conjunctiva opened over the main incision (microscope overlay, 示意 like print/steps.js): cut along the limbus (s 0.25), rolled back to s 3.0
const arc3 = (s, h0, h1) => { const q = []; for (let k = 0; k <= 30; k++) q.push(W3(s, 0, h0 + (h1 - h0) * k / 30)); return q; };
const PERI_CUT = arc3(0.25, MH - 0.75, MH + 0.75), PERI_BACK = arc3(3.0, MH + 0.75, MH - 0.75);
const bareSclera = (v, op = 1) => op <= 0 ? '' : `<path d="${pathOf([...PERI_CUT, ...PERI_BACK].map(v.Q))}Z" fill="#fbf7f2" opacity="${(0.78 * op).toFixed(3)}" stroke="${COL.sub}" stroke-width="1.1" stroke-dasharray="4 3"/>`;
const mid2 = q => [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2];
const SUT3 = [W3(2.15), W3(0.85)];                     // one radial 10-0 nylon across the outer opening (number of sutures 依主刀)
const sutureLine = (q, op = 1) => `<g opacity="${op}">${line2(q, '#fff', 4.4)}${line2(q, SUT_COL, 2)}</g>`;

// the two outer openings seen through the microscope (1-1 right, 1-2 right before the card): clear corneal (dashed, on the cornea) and
// the scleral tunnel (on the sclera, conjunctiva opened 示意); from kIn the scleral tunnel's footprint up to its inner opening
function mouthsView(kC, kS, kIn, id) {
  const w = scope({ cat: {} }, W_MOUTH, id), R = w.Q, mC = mouth3(CCI).map(R), mS = mouth3(MAIN).map(R), iS = inner3(MAIN).map(R);
  let svg = w.svg + bareSclera(w, kS);
  if (kIn > 0) svg += `<path d="${pathOf([mS[0], mS[1], iS[1], iS[0]])}Z" fill="${COL.accent}" opacity="${(0.12 * kIn).toFixed(3)}"/>` + thin(iS, COL.accent, 2.4, '6 4', kIn);
  svg += line2(mC, COL.sub, 4, '8 5', kC) + line2(mS, COL.accent, 4.5, '', kS);
  const rEnd = q => q[0][0] > q[1][0] ? q[0] : q[1], lEnd = q => q[0][0] > q[1][0] ? q[1] : q[0];
  const ex = lab('角膜緣', 'limbus', 14, 250, R(W3(0, 0, MH + 0.42)), { op: kC }) +
    lab('外口', 'clear corneal', PW - 12, 250, rEnd(mC), { side: 'R', color: COL.sub, op: kC }) +
    lab('外口', 'scleral tunnel', PW - 12, YB, rEnd(mS), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: kS }) +
    lab('內口', 'internal incision', 14, 60, lEnd(iS), { color: COL.accent, lc: COL.accent, op: kIn }) +
    note('結膜掀開的範圍：示意', kS);
  const c = w.A.centre, rL = w.r.A.limbusR * w.k;
  return { svg, extra: ex, sync: { k: w.k, centre: c, limbusR: rL, cci: mid2(mC), scleral: mid2(mS) } };
}

// ---------------------------------------------------------------- 片頭: the finished case through the microscope
DRAW2['title'] = T => {
  const v = scope({ cat: DONE }, W_FULL, 'tR'), Q = v.Q, mS = mouth3(MAIN).map(Q), su = SUT3.map(Q), k0 = T.on(0, 0.8), k1 = T.on(1);
  const svg = v.svg + bareSclera(v) + line2(mS, COL.accent, 3.6) + sutureLine(su, k0);
  const ex = lab('主切口', 'scleral tunnel', PW - 12, YB, mid2(mS), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: k0 }) +
    lab('縫線', '10-0 nylon（radial）', 14, YB, Q(W3(1.95)), { color: SUT_COL, lc: SUT_COL, op: k0 }) +
    lab('側切口', 'side port', 14, 190, v.A.sideExt, { op: k1 }) +
    note('結膜掀開的範圍、側切口的位置、縫幾針：示意', k1, 24);
  window.SYNC.title = { mouth: mS, suture: su };
  return { R: { svg, extra: ex, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 1 為什麼走鞏膜
DRAW2['1-1'] = T => {
  const v = sec({ cat: { side: SIDE, globe: PERI } }, W11, 'a11'), Q = v.Q;
  const kC = T.p(0, 0.02, 0.25), kS = T.p(0, 0.45, 0.85), k1 = T.on(1), k2 = T.on(2), fade = 1 - 0.7 * k1;
  const limb = Q(W3(0)), ext = Q(tnM.to3(tnM.ext)), int = Q(tnM.to3(tnM.int)), cci = tunnel3(CCI).map(Q), lip = LIP3.map(Q);
  const up = (s, o = 0.45) => Q(W3(s, -o)), sE = tnM.sE, sI = tnM.sI;
  let svg = v.svg + line2(cci, COL.sub, 2.4, '7 5', kC * fade);
  if (k2 > 0) svg += line2(lip, COL.accent, 11, '', 0.3 * k2);
  if (kS > 0) svg += line2(tunnel3(MAIN, kS).map(Q), COL.accent, 3.2);
  // line 1: dimension lines 0.45 mm above the outer surface: limbus → outer opening, limbus → over the inner opening (dotted drop lines)
  svg += line2([limb, up(0, 0.75)], COL.ink, 1.6, '', T.on(0));   // the limbus, carried up as the dimension lines' middle tick
  if (k1 > 0) svg += `<g opacity="${k1}">${thin([ext, up(sE, 0.62)])}${thin([int, up(sI, 0.62)])}${VIEWS.dim(up(0), up(sE))}${VIEWS.dim(up(0), up(sI))}</g>`;
  const dO = mid2([up(0), up(sE)]), dI = mid2([up(0), up(sI)]);
  let ex = lab('角膜緣', 'limbus', 14, 40, up(0, 0.75), { op: T.on(0) }) +
    lab('角膜', 'cornea', PW - 12, 150, Q(W3(-2.7, 0.27)), { side: 'R', op: T.on(0) }) +
    lab('鞏膜', 'sclera', 14, YB, Q(W3(2.3, 0.25)), { op: T.on(0) }) +
    lab('外口', 'clear corneal', 14, 150, cci[0], { color: COL.sub, op: kC * fade }) +
    lab('外口', 'scleral tunnel', 14, 236, ext, { bold: true, color: COL.accent, lc: COL.accent, op: T.p(0, 0.6, 0.9) }) +
    lab('1–2 mm', '', dO[0] - 78, dO[1] - 10, null, { bold: true, color: COL.accent, op: k1 }) +
    lab('1–2 mm', '', dI[0] - 30, dI[1] - 26, null, { bold: true, color: COL.accent, op: k1 }) +
    lab('內口', 'internal incision', PW - 12, 205, int, { side: 'R', color: COL.accent, lc: COL.accent, op: k1 }) +
    lab('內口前的角膜', 'internal corneal lip', PW - 12, 262, lip[Math.round(lip.length * 0.45)], { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: k2 });
  const m = mouthsView(kC, kS, k1, 'b11');
  window.SYNC['1-1'] = { win: W11, k: v.k, limbus: limb, ext, int, lip: [lip[0], lip[lip.length - 1]], dimO: [up(0), up(sE)], dimI: [up(0), up(sI)], scope: m.sync };
  return { L: { svg, extra: ex, P: SEC_T }, R: { svg: m.svg, extra: m.extra, P: SCOPE_T } };
};

DRAW2['1-2'] = T => {
  // left: Olsen 1997 bar chart (6-month SIA, 3.5–4.0 mm incisions), then Hayashi 2010 in words (its values are not on screen)
  const B0 = 286, SC = 225, bx = [190, 360], bw = 92, kB = T.p(0, 0.25, 0.6), kV = T.p(0, 0.55, 0.8), k1 = T.on(1);
  const vals = [0.72, 0.36], hs = vals.map(x => x * SC), cols = [COL.sub, COL.accent];
  let l = htext(24, 40, '術後 6 個月的散光（SIA）', { size: 18, bold: true }) + text(24, 66, '隨機試驗，切口 3.5–4.0 mm', { size: 14.5, color: COL.sub });
  l += `<path d="M110 ${B0}H470" stroke="${COL.ink}" stroke-width="1.6"/>`;
  vals.forEach((x, i) => { const h = hs[i] * kB;
    l += `<rect x="${bx[i] - bw / 2}" y="${(B0 - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="3" fill="${cols[i]}" opacity="0.85"/>`;
    l += text(bx[i], B0 - hs[i] - 12, x.toFixed(2) + ' D', { size: 18, bold: true, anchor: 'middle', color: cols[i], op: kV }); });
  l += text(bx[0], B0 + 24, '角膜切口 corneal', { size: 15, bold: true, anchor: 'middle', color: COL.sub }) + text(bx[1], B0 + 24, '鞏膜隧道 scleral', { size: 15, bold: true, anchor: 'middle', color: COL.accent });
  l += card(20, 326, PW - 40, 72, { op: k1 }) + `<g opacity="${k1}">` +
    text(40, 355, '切口 3.0 mm：scleral 的散光仍然較少', { size: 15.5 }) + text(40, 383, '切口 2.0 mm：兩者沒有差別', { size: 15.5, bold: true }) + '</g>';
  // right: the two openings → ESCRS 2007 endophthalmitis card (bar lengths in proportion) → conjunctiva opened (the cost)
  const kE = T.on(2) * (1 - T.on(3, 0.35)), kP = T.on(3, 0.5, 0.25), kA = 1 - T.on(2, 0.35);   // one at a time: no text of the card over the drawing
  let r = '', rx = '', P = SCOPE_T;
  if (kA > 0) { const m = mouthsView(kA, kA, 0, 'b12'); r += `<g opacity="${kA.toFixed(3)}">${m.svg}</g>`; rx += m.extra; }
  const u = 62, x0 = 168, ws = [u, 5.88 * u];
  if (kE > 0) { r += `<g opacity="${kE.toFixed(3)}"><rect width="${PW}" height="${PH}" fill="#fff"/>` + htext(24, 44, '術後 endophthalmitis 的風險', { size: 18, bold: true }) +
      text(24, 70, 'ESCRS 多中心研究：兩條長度照比例畫', { size: 14.5, color: COL.sub }) +
      text(24, 150, '鞏膜隧道', { size: 15.5, bold: true, color: COL.accent }) + text(24, 171, 'scleral tunnel', { size: 13.5, color: COL.sub }) +
      text(24, 240, '角膜切口', { size: 15.5, bold: true, color: COL.ink }) + text(24, 261, 'clear corneal', { size: 13.5, color: COL.sub }) +
      `<rect x="${x0}" y="138" width="${ws[0]}" height="30" rx="3" fill="${COL.accent}" opacity="0.85"/><rect x="${x0}" y="228" width="${(ws[1] * T.p(2, 0.1, 0.5)).toFixed(1)}" height="30" rx="3" fill="${COL.red}" opacity="0.85"/>` +
      text(x0 + ws[1], 216, '5.88 倍', { size: 20, bold: true, anchor: 'end', color: COL.red, op: T.p(2, 0.4, 0.6) }) + '</g>';
    if (kE > 0.5) P = { title: '感染的風險（多中心研究）', orient: '' }; }
  if (kP > 0) { const w = scope({ cat: { side: SIDE } }, W_MOUTH, 'c12');
    r += `<g opacity="${kP.toFixed(3)}">${w.svg}${bareSclera(w)}${line2(PERI_CUT.map(w.Q), COL.accent, 3.4)}</g>`;
    rx += lab('沿角膜緣剪開結膜', 'peritomy', PW - 12, 60, w.Q(W3(0.25, 0, MH + 0.45)), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: kP }) +
      lab('露出的鞏膜', 'bare sclera', 14, YB, w.Q(W3(1.8, 0, MH - 0.35)), { op: kP }) + note('範圍示意；之後還要止血', kP); }
  window.SYNC['1-2'] = { bars: { corneal: hs[0], scleral: hs[1] }, escrs: { scleral: ws[0], corneal: ws[1] } };
  return { L: { svg: l, extra: '', P: { title: '散光：corneal vs scleral', orient: '' } }, R: { svg: r, extra: rx, P } };
};

// ---------------------------------------------------------------- 2 定位、side port 與結膜
// orientation map (示意): the patient's face seen by an examiner facing him (his left eye on the right of the drawing), the OS enlarged
// with the examiner's clock (12 superior, 3 = temporal for OS), the surgeon at about 1:30 looking at the eye. Positions inside the OS are the
// globe model's own points (surgeon-at-6 microscope map = the examiner's view), scaled to the drawing.
function orientMap(k1, k2, k3) {
  const C = [392, 226], RL = 90, sc = RL / G.surfAt(0).rho, M6 = G.enfaceMap(6), E = p3 => { const q = M6(p3); return [C[0] + q[0] * sc, C[1] + q[1] * sc]; };
  const at = (h, r) => [C[0] + r * Math.sin(h * Math.PI / 6), C[1] - r * Math.cos(h * Math.PI / 6)];
  const F = [100, 150], OD = [78, 136], OS = [122, 136];
  let s = `<g opacity="${k1}">`;
  // face (示意), the OS ringed; an arrow to the enlarged OS
  s += `<ellipse cx="${F[0]}" cy="${F[1]}" rx="56" ry="72" fill="#f5e6d8" stroke="#b79d86" stroke-width="1.4"/>`;
  for (const e of [OD, OS]) s += `<ellipse cx="${e[0]}" cy="${e[1]}" rx="12" ry="5.5" fill="#fff" stroke="#8b7765"/><circle cx="${e[0]}" cy="${e[1]}" r="3.8" fill="#6b4a33"/>`;
  s += `<path d="M100 144L94 168L104 170" fill="none" stroke="#b79d86" stroke-width="1.4"/><path d="M86 190Q100 198 114 190" fill="none" stroke="#b79d86" stroke-width="1.6"/>`;
  s += `<circle cx="${OS[0]}" cy="${OS[1]}" r="15" fill="none" stroke="${COL.accent}" stroke-width="2.2"/>`;
  s += arrow([OS[0] + 18, OS[1] + 2], at(9.6, RL + 44), COL.accent, 1, 'arrA', 1.8);
  // the OS, enlarged: sclera, limbus, iris, pupil; the examiner's clock
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="${RL + 36}" fill="#f7ecea"/><circle cx="${C[0]}" cy="${C[1]}" r="${RL}" fill="#7a5236" stroke="#9fb1bd" stroke-width="2"/><circle cx="${C[0]}" cy="${C[1]}" r="${RL * 0.6}" fill="#d9804a"/>`;
  for (const h of [12, 3, 6, 9]) { const a = at(h, RL + 4), b = at(h, RL + 13), t = at(h, RL + 25); s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.ink}" stroke-width="2"/>` + htext(t[0], t[1] + 5, String(h), { size: 14, bold: true, anchor: 'middle' }); }
  // main incision (the model's position, behind the limbus); the surgeon at its clock hour, seen from above (shoulders, head toward the eye)
  const mS = mouth3(MAIN).map(E), sp = at(SG, RL + 92), toEye = Math.atan2(C[0] - sp[0], -(C[1] - sp[1])) * 180 / Math.PI;
  s += line2(mS, COL.accent, 4.5);
  s += `<g transform="translate(${sp[0].toFixed(1)} ${sp[1].toFixed(1)}) rotate(${toEye.toFixed(1)})"><ellipse cx="0" cy="6" rx="24" ry="10" fill="#7d8a99"/><circle cx="0" cy="-4" r="10" fill="#5b6878" stroke="#fff" stroke-width="1.5"/></g>`;
  s += arrow(at(SG, RL + 70), at(SG, RL + 28), COL.ink, 1, 'arrK', 2);
  s += '</g>';
  const sP = mouth3(SIDE).map(E);
  if (k3 > 0) s += line2(sP, '#fff', 7, '', k3) + line2(sP, COL.ink, 3.5, '5 3', k3);
  const ex = lab('左眼', 'OS', 14, 40, [OS[0] - 4, OS[1] - 14], { bold: true, op: k1 }) +
    lab('術者', 'surgeon（約 1–2 點）', 236, 40, [sp[0] - 14, sp[1] - 6], { bold: true, op: k1 }) +
    lab('主切口', 'main incision', 236, 84, mid2(mS), { color: COL.accent, lc: COL.accent, op: k1 }) +
    lab('3 點', 'temporal', PW - 12, 292, at(3, RL), { side: 'R', bold: true, op: k2 }) +
    lab('9 點', 'nasal', 14, 270, at(9, RL), { bold: true, op: k2 }) +
    lab('側切口（示意）', 'side port', PW - 12, YB, mid2(sP), { side: 'R', op: k3 });
  return { svg: s, extra: ex, sync: { centre: C, surgeon: sp, main: mid2(mS), temporal: at(3, RL), nasal: at(9, RL), side: mid2(sP) } };
}
window.PRELOAD_EXTRA += String(orientMap) + String(mouthsView);

DRAW2['2-1'] = T => {
  const k0 = T.on(0), k1 = T.on(1), k2 = T.on(2), k3 = T.on(3), kM = k1;
  // left: line 0 the peribulbar card (Friedman 2001), then the orientation map
  let l = '', lx = '', LP = { title: '麻醉：peribulbar', orient: '' };
  const kc = k0 * (1 - k1);
  if (kc > 0) l += `<g opacity="${kc.toFixed(3)}">` + htext(24, 60, 'Peribulbar 和 retrobulbar 比', { size: 18, bold: true }) +
    card(24, 92, PW - 48, 74) + text(46, 136, '止痛 analgesia', { size: 16, bold: true }) + text(PW - 46, 136, '相當', { size: 17, bold: true, anchor: 'end', color: COL.accent }) +
    card(24, 182, PW - 48, 74) + text(46, 226, '眼球不動 akinesia', { size: 16, bold: true }) + text(PW - 46, 226, '相當', { size: 17, bold: true, anchor: 'end', color: COL.accent }) +
    text(24, 300, '隨機試驗的系統性整理', { size: 14.5, color: COL.sub }) + '</g>';
  const om = orientMap(k1, k2, k3);
  if (k1 > 0) { l += om.svg; lx += om.extra; }
  if (k1 > 0.5) LP = { title: '方位小圖（示意）', orient: '面對病人看：上＝頭側' };
  // right: the microscope view before the incisions; the planned main incision (bottom), 3 / 9 o'clock, the side port (示意)
  const v = scope({ cat: {} }, W_FULL, 'r21'), Q = v.Q, mS = mouth3(MAIN).map(Q), sP = mouth3(SIDE).map(Q), c = v.A.centre, rL = v.r.A.limbusR * v.k;
  const ck = (h, r) => Q(W3(0, -r, h));   // a point r mm outside the limbus at clock h
  let r = v.svg + line2(mS, COL.accent, 4, '7 4', kM) + line2(sP, '#fff', 6.5, '', k3) + line2(sP, COL.ink, 3.4, '5 3', k3);
  r += `<g opacity="${k2}">` + [12, 3, 6, 9].map(h => { const a = ck(h, 0.15), b = ck(h, 0.6), t = ck(h, 1.15);
    return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.ink}" stroke-width="2"/>` + htext(t[0], t[1] + 5, String(h), { size: 14, bold: true, anchor: 'middle' }); }).join('') + '</g>';
  const h3 = Q(W3(0, 0, 3)), h9 = Q(W3(0, 0, 9));
  const rx = lab('主切口', 'main incision（約 1–2 點）', PW - 12, YB, mid2(mS), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: kM }) +
    lab('3 點', 'temporal', 14, 300, h3, { bold: true, op: k2 }) + lab('9 點', 'nasal', PW - 12, 60, h9, { side: 'R', bold: true, op: k2 }) +
    lab('側切口（示意）', 'side port', 14, 160, mid2(sP), { op: k3 });
  window.SYNC['2-1'] = { k: v.k, centre: c, limbusR: rL, main: mid2(mS), temporal: h3, nasal: h9, side: mid2(sP), map: om.sync };
  return { L: { svg: l, extra: lx, P: LP }, R: { svg: r, extra: rx, P: SCOPE_T } };
};
