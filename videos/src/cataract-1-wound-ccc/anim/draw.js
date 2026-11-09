// ============================================================================
// Drawing of every segment of video ① (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full) / { R } (title):
// { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Left: case A footage (术者視角, footage.js) or the model's microscope view; right: the globe model's section through the measured main
// incision meridian (videos/models/globe/cataract.js), driven by the SAME footage clock: every model state in a footage segment is
// a function of the source time of the frame on screen (caseAt(s)), so both panels show the same moment.
// Case parameters: params.js (CASE). Model numbers and sources: videos/models/globe/CARD.md 白內障.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, K = CATARACT, G = GLOBE;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const circ = (c, r, col, op = 1, dash = '', w = 2) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const YB = PH - 48;   // bottom label row (the note row is PH − 14)
const OVD_COL = '#6a5a9a', CAP_COL = '#1d5d93', WARN = '#b3262c';

// ---------------------------------------------------------------- case states (params.js); model windows (mm: left, top, width)
const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
const HP = (CASE.main.h + 6) % 12;            // section plane through the main incision: left = main incision (11 o'clock-ish), right = 5 o'clock-ish
const HP_SIDE = (CASE.side.h + 6) % 12;       // section through the side port: left = side port
const BASE = { main: MAIN, side: SIDE, ovd: 1 };
const cccS = o => ({ ...CASE.ccc, cut: 1, ...o });
const DONE = { cat: { ...BASE, ccc: cccS({ prog: 1, fold: 1, out: 1 }) } };
const MIDc = { ...BASE, ccc: cccS({ prog: 0.3, fold: 1 }) };
const W_CAT = { x: -8.6, y: -14.5, w: 17.2 }, W_TUN = { x: -8.3, y: -13.3, w: 6.2 };
const W_MID = { x: -8.4, y: -14.2, w: 10.4 };
const W_SCOPE = { x: -8.0, y: -5.41, w: 16 }, W_SCOPE_IN = { x: -6.2, y: -4.2, w: 12.4 };
const CAT_T = { title: '經主切口的切面（模型）', orient: '左＝主切口（11 點多）　上＝前' };
const SIDE_T = { title: '經側切口的切面（模型）', orient: '左＝側切口（約 2 點）　上＝前' };
const TUN_T = { title: '主切口隧道放大（模型）', orient: '左＝周邊　上＝前' };
const SCOPE_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝temporal' };
const SYNC_T = { title: '同一刻的切面（模型，依錄影時間）', orient: '左＝主切口　上＝前' };
window.PRELOAD_EXTRA = JSON.stringify([CAT_T, SIDE_T, TUN_T, SCOPE_T, SYNC_T]);

// ---------------------------------------------------------------- views: model window → panel (px), anchors mapped to panel px
const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, win, id, o = {}) {
  const c = VIEWS.cam(win, PW, PH), h = win.w * PH / PW;
  const r = K.section({ st, h: o.hp ?? HP, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 250).toFixed(4), id });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id) {
  const c = VIEWS.cam(win, PW, PH), r = K.enface({ st, id, surgeon: 12 });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
// a point on the anterior capsule (lens-local clock hour h, radius r) in a view
const capP = (v, st, r, h, lift = 0) => v.Q(K.capPt(K.norm(st), r, h, lift));
// leader anchors inside the lens / chamber of a section (plane coordinates: u along the plane, v = −z)
const L0 = K.LENS;

// ---------------------------------------------------------------- footage clock → model state (the same events drive both panels)
const EVS = (() => { const o = {}; for (const c of Object.values(FOOTAGE_DEF.clips)) Object.assign(o, c.events || {}); return o; })();
const ev = n => { if (EVS[n] === undefined) throw new Error('no footage event ' + n); return EVS[n]; };
const PASSES = [1, 2, 3, 4].map(i => [ev(`pass${i}-in`), ev(`pass${i}-out`)]);
const GRASPS = Object.keys(EVS).filter(n => /^grasp-\d+$/.test(n)).map(ev).sort((a, b) => a - b);
const OVDS = Object.keys(EVS).filter(n => /^ovd-refill-\d+$/.test(n)).map(ev).sort((a, b) => a - b);
const WIPES = Object.keys(EVS).filter(n => /^wipe-\d+$/.test(n)).map(ev).sort((a, b) => a - b);
const pw = (keys, s) => { if (s <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (s <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return va + (vb - va) * ss(a, b, s); } return keys[keys.length - 1][1]; };
const inPass = s => PASSES.some(([a, b]) => s >= a && s <= b);
// model state at source time s of case A (示意 where the recording does not show it: the tear front, the flap shape)
function caseAt(s) {
  const prog = pw(CASE.prog, s), cut = pw([[ev('pinch'), 0], [ev('wrinkles-gone'), 0.4], [90, 1]], s), fold = pw([[76, 0], [100, 1]], s), out = pw([[ev('flap-out'), 0], [ev('flap-out-end'), 1]], s);
  const pull = pw([[ev('wrinkles') - 0.4, 0], [ev('wrinkles'), 1], [ev('wrinkles-gone'), 1], [ev('wrinkles-gone') + 0.5, 0]], s);
  const c = { ...BASE, ccc: s >= ev('pinch') ? cccS({ cut, prog, fold, out }) : null, zonule: { weak: 1, pull } };
  const inst = [];
  if (s >= ev('pass1-in') && s < ev('wrinkles-gone')) {        // approach from the main incision, then pinch at the centre
    const k = ss(ev('pass1-in'), ev('pinch'), s);
    inst.push({ kind: 'forceps', at: { h: lerp(CASE.main.h, CASE.ccc.h0, k), r: lerp(4.3, 0.35, k), lift: lerp(0.9, 0.02, k) }, open: 0 });
  } else if (inPass(s) || (s >= ev('flap-out') && s <= ev('flap-out-end'))) {
    const g = K.graspAt(K.norm({ cat: c }));
    inst.push({ kind: 'forceps', at: c.ccc && c.ccc.out > 0 ? { h: CASE.main.h, r: lerp(1.0, 4.3, c.ccc.out), lift: lerp(0.3, 0.9, c.ccc.out) } : g, open: 0 });
  }
  c.inst = inst;
  return { cat: c };
}
// footage panel + the synced section; at0 = when the clip starts in the segment
function footSeg(T, clip, o = {}) {
  const tau = T.u - (o.at0 ?? 0.3), L = FOOTAGE.panel(clip, tau, { badge: o.badge }), st = (o.state || caseAt)(L.s);
  return { tau, L, st, s: L.s };
}
const fpt = (clip, name, tau) => FOOTAGE.point(clip, name, tau);
const frozenOp = (clip, tau, d = 0.35) => { const f = (FOOTAGE_DEF.clips[clip].freeze || [])[0]; if (!f) return 0; const a = FOOTAGE.ev(clip, 'freeze'); return ss(a, a + d, tau) * (1 - ss(a + f.dur - d, a + f.dur, tau)); };
// labels for the synced section: forceps (projected), flap, OVD, main incision
function secLabels(v, st, op = 1) {
  let ex = '';
  const c = K.norm(st);
  const k0 = ((c.inst || [])[0] || {}).kind;
  if (v.A.tip0) ex += lab(k0 === 'cannula' ? 'cannula（投影到切面）' : '撕囊鉗（投影到切面）', k0 === 'cannula' ? 'OVD' : 'forceps', PW - 12, 64, v.A.tip0, { side: 'R', color: '#3c4a57', op });
  if (v.A.mainPivot) ex += lab('主切口', 'main incision', 14, 64, v.A.mainPivot, { op });
  ex += lab('前房 OVD', '', 14, YB, v.P([-2.2, -(L0.za + 1.0)]), { color: OVD_COL, lc: OVD_COL, op });
  if (c.ccc && c.ccc.prog > 0.02 && c.ccc.out < 0.5) ex += note('撕囊進度依錄影時間重建（示意）', op, PH - 14);
  return ex;
}

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const R = FOOTAGE.panel('title', 0, { badge: false });
  R.extra = note('案例 A：撕囊鉗夾著前囊瓣（錄影 3:12）', 1, PH - 14);
  return { R };
};

// ---------------------------------------------------------------- 1 目標
DRAW2['1-1'] = T => {
  const sv = scope(DONE, W_SCOPE, 'sL'), A = sv.A, cv = sec(DONE, W_CAT, 'cR'), B = cv.A;
  const k1 = T.on(1), k2 = T.on(2), k3 = T.on(3), k4 = T.on(4);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let ex = lab('側切口', 'side port', 14, A.sideExt[1] - 44, A.sideExt, { bold: true, op: ss(0, 1, k1) });
  ex += lab('主切口', 'main incision', PW - 12, YB, mid(A.mainExt, A.mainInt), { side: 'R', bold: true, op: k2 });
  ex += lab('撕囊邊緣', 'CCC edge', PW - 12, A.edge9[1] - 6, A.edge9, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: k4 });
  // optic outline (6.0 mm) under the rhexis edge
  ex += `<g opacity="${k4}">${circ(sv.P([0, 0]), CASE.optic / 2 * sv.k, '#2463eb', 0.9, '6 4', 1.8)}</g>` + lab(`IOL optic ${CASE.optic.toFixed(1)} mm`, '', 14, YB, sv.P([-CASE.optic / 2 * 0.71, CASE.optic / 2 * 0.71]), { color: '#2463eb', lc: '#2463eb', op: k4 });
  let rx = lab('主切口', 'main incision', 14, 64, B.mainPivot || B.mainExt, { bold: true, op: k2 });
  rx += lab('前房 OVD', '', 14, 150, cv.P([-3.6, -(L0.za + 0.9)]), { color: OVD_COL, lc: OVD_COL, op: k3 });
  rx += lab('撕囊後的開口', 'capsulorhexis', PW - 12, 64, cv.P([1.0, -(L0.za + 0.02)]), { side: 'R', color: CAP_COL, lc: CAP_COL, op: k4 });
  rx += lab('水晶體', 'lens', PW - 12, 300, cv.P([3.6, -L0.zMid]), { side: 'R' });
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
DRAW2['1-2'] = T => {
  // still frame: the forceps just inside the main incision (1:06.1), the incision point measured on that frame
  const tau = FOOTAGE.ev('pinch', 'pass1-in'), L = FOOTAGE.panel('pinch', tau, { badge: false });
  const k1 = T.on(1), k3 = T.on(3);
  const inc = fpt('pinch', 'incision', tau);   // label just above-left of the incision, the leader drops to it (does not run back under the text)
  L.extra = lab('主切口：12 點偏 temporal 約 22°', 'main incision', 14, inc[1] - 9, [inc[0], inc[1]], { bold: true, color: COL.accent, lc: COL.accent, op: k1 }) +
    note('錄影 1:06', 1, 58);
  const cv = sec({ cat: BASE }, W_CAT, 'cR'), B = cv.A;
  let rx = lab('主切口', 'main incision', 14, 64, B.mainPivot || B.mainExt, { bold: true, color: COL.accent, lc: COL.accent, op: k1 });
  rx += lab('小帶', 'zonules', PW - 12, 262, B['eq+'], { side: 'R', color: COL.amber, lc: COL.amber, bold: true, op: k3 });
  rx += lab('水晶體', 'lens', PW - 12, 330, cv.P([3.6, -L0.zMid]), { side: 'R' });
  rx += note('本例 zonule 弱：切面的形狀是 routine 模型', k3, PH - 14);
  return { L, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};

// ---------------------------------------------------------------- 2 Side port 與 OVD
DRAW2['2-1'] = T => {
  const f = footSeg(T, 'sideport', { at0: Math.min(0.3, T.st(1) + 0.6 - FOOTAGE.ev('sideport', 'freeze')) }), L = f.L, op = frozenOp('sideport', f.tau);   // the freeze (blade tip in the chamber) during line 1
  if (op > 0) { const bt = fpt('sideport', 'blade-tip', f.tau); L.extra = lab('刀尖在前房', 'blade tip', 14, bt[1] - 48, bt, { bold: true, op }); }
  // model: the side-port blade advancing with the footage (limbus 6.4 s → anterior chamber 7.5 s → out 9.0 s)
  const adv = f.s < ev('blade-out') ? pw([[ev('blade-limbus'), 0], [ev('blade-ac'), 1.15]], f.s) : 0;
  const cut = pw([[ev('blade-limbus'), 0], [ev('blade-ac'), 1]], f.s);
  const st = { cat: { side: { ...SIDE, cut }, inst: adv > 0 && f.s < ev('blade-out') ? [{ kind: 'sideblade', adv }] : [] } };
  const cv = sec(st, W_TUN, 'cR', { hp: HP_SIDE }), B = cv.A;
  const sp = B.sideInt || B.sideExt || cv.P([W_TUN.x + 2, W_TUN.y + 1]);
  let rx = lab('側切口', 'side port', PW - 12, sp[1] + 44, sp, { side: 'R', bold: true, op: ss(0, 1, cut) });
  rx += lab('角膜', 'cornea', PW - 12, 64, cv.P([W_TUN.x + 4.6, -(G.keyPoints({}).apexZ - 0.5)]), { side: 'R' });
  rx += note('寬與長為示意', 1, PH - 14);
  return { L, R: { svg: cv.svg, extra: rx, P: SIDE_T } };
};
DRAW2['2-2'] = T => {
  const f = footSeg(T, 'ovd'), L = f.L, op = frozenOp('ovd', f.tau);
  if (op > 0) L.extra = lab('cannula（經側切口）', 'OVD', PW - 12, 64, fpt('ovd', 'cannula-tip', f.tau), { side: 'R', bold: true, op });
  const ovdSync = pw([[ev('cannula-in'), 0.05], [ev('fill-1-end'), 0.6], [ev('cannula-2-in'), 0.6], [ev('ovd-end'), 1]], f.s);
  const inEye = (f.s >= ev('cannula-in') && f.s <= ev('fill-1-end')) || (f.s >= ev('cannula-2-in') && f.s <= ev('ovd-end'));
  // lines 2–3 are the model alone (示意, not this moment of the footage): OVD lost → posterior pressure pushes the lens–iris diaphragm
  // forward (shallow chamber, anterior capsule bulging: the tear gets an outward pull); line 3: OVD topped up → deep chamber, flat capsule again
  const kS = T.on(2, 1.4, 0.2) * (1 - T.on(3, 1.6, 0.5)), refill = T.on(3, 0.3, 0.3) * (1 - T.on(3, 0.4, 2.3));
  const ovd = lerp(ovdSync, 0.5, kS), cannula = (inEye && kS < 0.02 && !(T.u > T.st(2))) || refill > 0.5;
  const st = { cat: { main: null, side: SIDE, ovd, push: kS, inst: cannula ? [{ kind: 'cannula', via: 'side', at: { h: CASE.side.h, r: 1.2, lift: 0.9 } }] : [] } };
  const cv = sec(st, W_CAT, 'cR', { hp: HP_SIDE }), B = cv.A, c = K.norm(st);
  const capV = u => -(L0.zAnt(Math.abs(u)) + K.liftZ(c, Math.abs(u)));     // anterior capsule height in this frame (plane v)
  // the flat capsule of a full chamber (dashed) under the bulging one
  const flat = []; for (let u = -4.4; u <= 4.4001; u += 0.2) flat.push(cv.P([u, -L0.zAnt(Math.abs(u))]));
  let rsv = cv.svg + `<path d="${pathOf(flat)}" fill="none" stroke="${CAP_COL}" stroke-width="1.6" stroke-dasharray="6 4" opacity="${(0.85 * ss(0.15, 0.6, kS)).toFixed(2)}"/>`;
  const kA = ss(0.75, 1, kS);
  rsv += `<g opacity="${kA.toFixed(2)}">${arrow(cv.P([0, -(L0.zp + K.liftZ(c, 0) - 0.9)]), cv.P([0, -(L0.zp + K.liftZ(c, 0) + 0.9)]), WARN, 1, 'arrR', 3)}` +
    `${arrow(cv.P([1.9, capV(1.9) - 0.18]), cv.P([3.8, capV(3.8) - 0.18]), WARN, 1, 'arrR', 3)}</g>`;
  let rx = lab('OVD', '', PW / 2 - 70, 132, null, { bold: true, color: OVD_COL, size: 17 });   // written inside the chamber it fills
  rx += lab('前囊被壓平', 'anterior capsule', PW - 12, 64, cv.P([1.4, capV(1.4)]), { side: 'R', color: CAP_COL, lc: CAP_COL, op: T.on(1) * (1 - ss(0.05, 0.3, kS)) });
  rx += lab('前囊往前凸', 'bulging', PW - 12, 64, cv.P([1.4, capV(1.4)]), { side: 'R', bold: true, color: WARN, lc: WARN, op: ss(0.4, 0.8, kS) });
  rx += lab('後方壓力', 'posterior pressure', PW - 12, 330, cv.P([0, -(L0.zp + K.liftZ(c, 0) - 0.5)]), { side: 'R', bold: true, color: WARN, lc: WARN, op: kA });
  if (B.tip0 && B.sidePivot) { const t = B.tip0, q = B.sidePivot, sh = [lerp(t[0], q[0], 1.25), lerp(t[1], q[1], 1.25)]; rx += lab('cannula', '', 14, 64, sh, { color: '#3c4a57' }); }   // on the shaft just outside the side port
  rx += `<g opacity="${kA.toFixed(2)}">${tag('示意：前房淺 → 撕囊往外跑', 1, WARN)}</g>` + `<g opacity="${T.on(3, 0.6, 1.2).toFixed(2)}">${tag('補 OVD → 前房加深、前囊壓平', 1)}</g>`;
  rx += kS > 0.02 ? note('虛線＝OVD 撐滿時的前囊；前房變淺為示意', 1, PH - 14) : note('切面經側切口；OVD 的擴散為示意', 1, PH - 14);
  return { L, R: { svg: rsv, extra: rx, P: SIDE_T } };
};

// ---------------------------------------------------------------- 3 主切口
DRAW2['3-1'] = T => {
  const f = footSeg(T, 'keratome'), L = f.L;
  L.extra = htext(14, PH - 14, 'keratome 從 12 點附近的透明角膜進入', { size: 14, bold: true, color: '#fff', op: FOOTAGE.k('keratome', 'k-touch', f.tau, 0.4) }).replace('stroke="#fff"', 'stroke="#1d2733"');
  const adv = f.s < ev('k-out') ? pw([[ev('k-touch'), 0], [ev('k-ac'), 1], [ev('k-out'), 1.25]], f.s) : 0;
  const cut = pw([[ev('k-touch'), 0], [ev('k-ac'), 1]], f.s);
  const st = { cat: { side: SIDE, ovd: 1, main: { ...MAIN, cut }, inst: adv > 0 ? [{ kind: 'keratome', adv }] : [] } };
  const cv = sec(st, W_TUN, 'cR'), B = cv.A, k2 = T.on(2), k3 = T.on(3);
  let rx = lab('keratome', '', PW - 12, 130, B.tip0 || cv.P([W_TUN.x + 3, W_TUN.y + 1.5]), { side: 'R', color: '#3c4a57', op: adv > 0 ? 1 : 0 });
  rx += lab('三平面隧道', 'tri-planar', 100, 170, B.mainPivot || B.mainExt || cv.P([W_TUN.x + 1, W_TUN.y + 1]), { bold: true, color: COL.accent, lc: COL.accent, op: k2 * ss(0.2, 1, cut) });
  if (B.mainExt && B.mainInt) rx += `<g opacity="${k3 * ss(0.95, 1, cut)}">${VIEWS.dim(B.mainExt, B.mainInt, COL.accent)}</g>` + lab(`長 ${CASE.main.L.toFixed(1)} mm`, 'tunnel', 470, 262, [(B.mainExt[0] + B.mainInt[0]) / 2, (B.mainExt[1] + B.mainInt[1]) / 2], { side: 'R', color: COL.accent, lc: COL.accent, bold: true, op: k3 * ss(0.95, 1, cut) });
  rx += VIEWS.sbar(cv.k, 1, 1);
  return { L, R: { svg: cv.svg, extra: rx, P: TUN_T } };
};
DRAW2['3-2'] = T => {
  // left: microscope close-up of the incision (width and tunnel seen through the cornea); right: the tunnel section with its length
  const st = { cat: BASE }, e = K.enface({ st, id: 'x' }), mE = e.A.mainExt, mI = e.A.mainInt;
  const cxm = (mE[0] + mI[0]) / 2, cym = (mE[1] + mI[1]) / 2, win = { x: cxm - 3.4, y: cym - 3.4 * PH / PW, w: 6.8 };
  const sv = scope(st, win, 'sL'), A = sv.A;
  const lat = (() => { const d = G.clockDir(CASE.main.h); return [d[1], -d[0]]; })();   // lateral direction (examiner X, Y)
  const ext = K.tunnelOf(CASE.main).ext, wE = [-1, 1].map(sg => sv.Q([...[0, 1].map(i => ext[0] * G.clockDir(CASE.main.h)[i] + sg * CASE.main.w / 2 * lat[i]), ext[1]]));
  // width along the outer opening, length along the tunnel axis (outer → inner opening; seen from above it is the tunnel's horizontal extent)
  const wR = wE[0][0] > wE[1][0] ? wE[0] : wE[1];
  let ex = `<g opacity="${T.on(0)}">${VIEWS.dim(wE[0], wE[1], '#2463eb')}${VIEWS.dim(A.mainExt, A.mainInt, COL.accent)}</g>` + lab(`寬 ${CASE.main.w.toFixed(1)} mm`, 'width', PW - 12, YB, wR, { side: 'R', color: '#2463eb', lc: '#2463eb', bold: true, op: T.on(0) });
  ex += lab('長（隧道）', 'length', 14, A.mainInt[1] + 4, A.mainInt, { color: COL.accent, lc: COL.accent, bold: true, op: T.on(0) });
  ex += note('長≈寬＝方形切口', 1, PH - 14);
  const cv = sec(st, W_TUN, 'cR'), B = cv.A;
  let rx = '';
  if (B.mainExt && B.mainInt) rx += VIEWS.dim(B.mainExt, B.mainInt, COL.accent) + lab(`長 ${CASE.main.L.toFixed(1)} mm`, 'tunnel', 470, 262, [(B.mainExt[0] + B.mainInt[0]) / 2, (B.mainExt[1] + B.mainInt[1]) / 2], { side: 'R', color: COL.accent, lc: COL.accent, bold: true });
  rx += lab('外口', 'outer', 120, B.mainExt[1] + 2, B.mainExt) + lab('內口', 'inner', PW - 12, B.mainInt[1] + 5, B.mainInt, { side: 'R' });
  // evidence card (lines 1–4)
  const card2 = (y, rows, op) => `<g opacity="${op}"><rect x="${PW - 300}" y="${y}" width="288" height="${16 + rows.length * 24}" rx="8" fill="#fff" stroke="#d3dae1"/>${rows.map((r, i) => text(PW - 288, y + 28 + i * 24, r[0], { size: 14, bold: r[1], color: r[2] || COL.ink })).join('')}</g>`;
  rx += card2(PH - 108, [['屍眼（Ernest 1994）', true], ['方形 2.0×2.0：525 psi 不漏'], ['長方形 3.2×2.0：13 psi 就漏', false, WARN]], T.on(1) * (1 - T.on(3)));
  rx += card2(PH - 108, [['臨床', true], ['方形切口 60 人：沒有低眼壓（Masket）'], ['Superior 長隧道：SIA 最大（Sonmez）', false, WARN]], T.on(3));
  rx += VIEWS.sbar(cv.k, 1, 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: TUN_T } };
};
DRAW2['3-3'] = T => {
  // left: the well-built tunnel at rest; right: the SAME window with the forceps reaching across the pupil (示意 deformation of the model:
  // roof lifted, posterior lip pressed down, Descemet folds central to it), the rest cornea dashed, and an overview inset (the forceps tip)
  const at = { h: CASE.main.h + 6, r: 2.0, lift: 0.1 };   // forceps reaching across the pupil to the far anterior capsule (lens-local)
  const s0 = { cat: { ...BASE } }, s1 = { cat: { ...BASE, folds: 1, inst: [{ kind: 'forceps', at, open: 0 }] } };
  const lv = sec(s0, W_TUN, 'sL'), rv = sec(s1, W_TUN, 'cR'), A = lv.A, B = rv.A;
  let ex = lab('隧道閉合', 'self-sealing', 104, 150, A.mainPivot, { bold: true, color: COL.accent, lc: COL.accent });
  ex += `<g opacity="${T.on(0) * (1 - T.on(1))}">${htext(PW / 2, PH - 64, '太短：前房一淺就漏、虹膜往切口跑', { size: 15, bold: true, color: WARN, anchor: 'middle' })}</g>`;
  ex += VIEWS.sbar(lv.k, 1, 1) + note('模型：三平面隧道', 1, PH - 14);
  // right: rest outline (dashed) over the deformed section, within the deformation zone; lift / push arrows
  const ghost = (lv.r.outline.cornea.match(/M[^MZ]+Z?/g) || []).map(seg => 'M' + seg.replace(/[MZ]/g, '').split('L').map(q => rv.P(q.trim().split(/\s+/).map(Number)).map(v => v.toFixed(1)).join(' ')).join('L')).join('');
  const zx0 = rv.P([-(K.deformer(K.norm(s1)).parts[0].rOut + 0.05), 0])[0], zx1 = rv.P([-(K.deformer(K.norm(s1)).parts[0].rIn - 1.45), 0])[0];
  const k2 = T.on(2), k2b = T.on(2, 0.6, 1.2), k2c = T.on(2, 0.6, 2.4);
  let rsv = rv.svg + `<clipPath id="cR_gz"><rect x="${zx0.toFixed(1)}" y="0" width="${(zx1 - zx0).toFixed(1)}" height="${PH}"/></clipPath>` +
    `<path d="${ghost}" clip-path="url(#cR_gz)" fill="none" stroke="#2c4a63" stroke-width="1.3" stroke-dasharray="5 4" opacity="0.7"/>`;
  rsv += `<g opacity="${k2}">${arrow(B.mainRoofRest, B.mainRoof, WARN, 1, 'arrR', 3)}</g><g opacity="${k2b}">${arrow(B.mainLipRest, B.mainLip, WARN, 1, 'arrR', 3)}</g>`;
  // overview inset (top left, air above the cornea): the whole section, forceps tip on the far capsule, the zoom window boxed
  const IW = { x: -7.6, y: -13.55, w: 11.2 }, ix = 10, iy = 8, iw = 236, ih = 116, ic = VIEWS.cam({ ...IW, h: IW.w * ih / iw }, iw, ih);
  const ir = K.section({ st: s1, h: HP, win: { x: IW.x, y: IW.y, w: IW.w, h: IW.w * ih / iw }, step: 0.05, id: 'cI' }), bx = ic.P([W_TUN.x, W_TUN.y]), bw = W_TUN.w * ic.k, bh = W_TUN.w * PH / PW * ic.k;
  rsv += `<g transform="translate(${ix} ${iy})"><clipPath id="cR_in"><rect x="0" y="0" width="${iw}" height="${ih}" rx="6"/></clipPath><rect x="0" y="0" width="${iw}" height="${ih}" rx="6" fill="#f4f7f9"/>` +
    `<g clip-path="url(#cR_in)"><g transform="${ic.tf}">${ir.svg}</g><rect x="${bx[0].toFixed(1)}" y="${bx[1].toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="none" stroke="${COL.accent}" stroke-width="1.6" stroke-dasharray="4 3"/></g>` +
    `<rect x="0" y="0" width="${iw}" height="${ih}" rx="6" fill="none" stroke="#9aa8b4" stroke-width="1.2"/>${htext(7, 16, '全景：鉗尖伸到對側', { size: 12, bold: true, color: '#3c4a57' })}</g>`;
  // a point on the top of the forceps shaft in the chamber, just left of its label (the shaft's centre line is the instrument axis)
  const gF = K.instGeom(K.norm(s1), K.norm(s1).inst[0]), uF = -3.55, tF = (uF - rv.r.A.mainPivot[0]) / (G.toPlane(rv.r.pl, gF.bend)[0] - rv.r.A.mainPivot[0]);
  const shaft = rv.P([uF, lerp(rv.r.A.mainPivot[1], G.toPlane(rv.r.pl, gF.bend)[1], tF)]);
  let rx = lab('撕囊鉗', 'forceps', PW - 12, 182, [shaft[0], shaft[1] - 13], { side: 'R', color: '#3c4a57' });
  rx += lab('頂蓋被抬起', 'roof lifted', 14, 168, B.mainRoof, { bold: true, color: WARN, lc: WARN, op: k2 });
  rx += lab('後唇被壓下', 'posterior lip', PW - 12, 318, B.mainLip, { side: 'R', bold: true, color: WARN, lc: WARN, op: k2b });
  rx += lab('角膜皺褶（示意）', 'folds', PW - 12, 64, B.mainFolds, { side: 'R', bold: true, color: WARN, lc: WARN, op: k2c });
  rx += VIEWS.sbar(rv.k, 1, 1) + note('虛線＝器械進來前；變形為機轉示意', 1, PH - 14);
  return { L: { svg: lv.svg, extra: ex, P: TUN_T }, R: { svg: rsv, extra: rx, P: { title: '器械伸到對側：隧道被撐開（模型）', orient: '左＝周邊　上＝前' } } };
};

// ---------------------------------------------------------------- 4 CCC 的目標與力學
// Shared by ch 4 and 6. (1) The rim section: a meridian at the tear front zoomed on the capsule rim (rhexis edge, optic edge, zonule insertion,
// pupil margin, equator; the 12–6 section at 35 px/mm cannot show which radius the edge is at). (2) Pull vectors are the SAME 3D vectors in
// both views, starting at the grasp point on the flap (model graspAt): in a meridian the tangent of the circle crosses the plane (⊙ / ⊗), the
// outward (or centripetal) part lies in it. (3) Routine | weak zonules: two microscope views side by side, the same pull at the same grasp.
const W_RIM = { x: 0.8, y: -10.95, w: 5.6 }, W_RIM41 = { x: 1.0, y: -10.75, w: 4.2 }, W_42 = { x: -3.0, y: -1.75, w: 8.6 }, W_SPLIT = { x: -1.2, y: -0.94, w: 4.2 }, W_62 = { x: -1.3, y: -0.77, w: 7.0 }, W_PULL = { x: -6.3, y: -11.25, w: 12.6 };
const RIM_T = { title: '撕囊前緣的切面（模型）', orient: '右＝周邊　上＝前' };
const PULL_T = { title: '沿拉力方向的切面（模型）', orient: '右＝拉的方向　上＝前' };
const SPLIT_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝temporal' };
window.PRELOAD_EXTRA += JSON.stringify([RIM_T, PULL_T, SPLIT_T]);
const BROWN = '#8a3b12', BLUE = '#2463eb';
const add3 = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + (v[2] || 0) * s];
const lerpH = (a, b, k) => a + ((((b - a) % 12) + 18) % 12 - 6) * k;
// outward radial unit d and the tangent tg in the tear's direction of travel at lens clock hour h (examiner X/Y, z 0)
const dirsAt = h => { const d = G.clockDir(h); return { d: [d[0], d[1], 0], tg: [CASE.ccc.dir * d[1], -CASE.ccc.dir * d[0], 0] }; };
// a horizontal vector t crossing a section: ⊙ toward the viewer, ⊗ away (into the screen = U × V of the plane, V = −z)
function oop(v, t, at, col, op = 1, r = 10) {
  const U = v.r.pl.U, away = t[0] * -U[1] + t[1] * U[0] > 0, [x, y] = at, q = r * 0.5, f = n => n.toFixed(1);
  const m = away ? `<path d="M${f(x - q)} ${f(y - q)}L${f(x + q)} ${f(y + q)}M${f(x - q)} ${f(y + q)}L${f(x + q)} ${f(y - q)}" stroke="${col}" stroke-width="2.4"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.3)}" fill="${col}"/>`;
  return `<g opacity="${op}"><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#fff" stroke="${col}" stroke-width="2.4"/>${m}</g>`;
}
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// a label whose leader starts dx, dy px from its anchor (the text left of that point when dx < 0, right of it otherwise)
const labNear = (zh, en, a, dx, dy, o = {}) => { const w = lw(zh, en, o), x = a[0] + dx, y = a[1] + dy + (o.size || 15) * 0.36;
  return dx < 0 ? lab(zh, en, x - w - 7, y, a, o) : lab(zh, en, x + w + 7, y, a, { ...o, side: 'R' }); };
// arrow with a white halo underneath (readable over the red reflex)
const arrowH = (a, b, col, mk, w = 3.2, op = 1) => `<g opacity="${op}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#fff" stroke-width="${w + 3}" stroke-linecap="round" opacity="0.85"/>${arrow(a, b, col, 1, mk, w)}</g>`;
// a point on an instrument's shaft (section view) whose panel y is about yT: anchor for its label
const onShaft = (v, gI, yT) => { let best = null; for (let s = 0; s <= 12; s += 0.1) { const q = v.Q(add3(gI.bend, gI.axis, s)); if (q[0] > 20 && q[0] < PW - 20 && q[1] > 20 && q[1] < PH - 20 && (!best || Math.abs(q[1] - yT) < Math.abs(best[1] - yT))) best = q; } return best; };
const dash = (q, col, op = 1, w = 2, da = '6 4') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${da}" opacity="${op}"/>`;
// short vertical tick above the capsule at radius r (rim view), from 0.1 mm to `up` mm above it
const tick = (v, c, r, h, col, up, op = 1) => { const a = v.Q(K.capPt(c, r, h, 0.1)), b = v.Q(K.capPt(c, r, h, up)); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="2.6" opacity="${op}"/>`; };
// microscope view of the model drawn into a box of a panel (box px; win mm of the scope map: x = −X, y = Y)
function scopeBox(st, win, id, box) {
  const c = VIEWS.cam(win, box.w, box.h), r = K.enface({ st, id, surgeon: 12 }), P = p => { const q = c.P(p); return [q[0] + box.x, q[1] + box.y]; };
  return { svg: `<clipPath id="${id}_bx"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"/></clipPath><g clip-path="url(#${id}_bx)"><g transform="translate(${box.x} ${box.y}) ${c.tf}">${r.svg}</g></g>`,
    A: mapA(r.A, P), P, k: c.k, r, Q: p3 => P(r.M(p3)) };
}
// routine | weak zonules, the tear at 110°, the forceps on the flap pulling along the tangent: `pull` 0→1 on both halves, `pw` scales the weak
// pull (6-3: a smaller pull). Returns the svg and the labels; the halves share the window, so the bag shift reads against the fixed pupil.
function splitScope(pull, pw, idp, o = {}) {
  const half = { w: PW / 2, h: PH }, S = [], ex = [], P0 = K.norm({ cat: MIDc }), g = K.graspAt(P0), X = K.rhex(P0.ccc), { tg } = dirsAt(X.hf), kL = ss(0.1, 0.4, pull);
  const edgeOf = (c, v) => { const q = []; for (let k = 0; k <= 48; k++) { const t = X.span * k / 48; q.push(v.Q(K.capPt(c, X.R(t), (CASE.ccc.h0 + CASE.ccc.dir * t + 12) % 12))); } return q; };
  for (const [i, weak] of [[0, 0], [1, 1]]) {
    const st = { cat: { ...MIDc, zonule: { weak, pull: weak ? pull * pw : 0 }, inst: [{ kind: 'forceps', at: g }] } }, c = K.norm(st), box = { x: i * half.w, y: 0, ...half };
    const v = scopeBox(st, W_SPLIT, `${idp}${i}`, box), gp = v.Q(K.capPt(c, g.r, g.h, g.lift)), xm = box.x + half.w / 2;
    // annotations, clipped to this half: the torn edge traced (where the bag is now), for weak zonules the routine edge dashed (where it would
    // be) and the shift of the front; the same pull (green) at the same grasp point in both halves
    let a = `<path d="${pathOf(edgeOf(c, v))}" fill="none" stroke="#fff3e6" stroke-width="2.2" opacity="0.9"/>`;
    if (weak) { const sh = K.lensShift(c).k, f0 = v.Q(K.capPt(P0, X.front[0], X.front[1])), f1 = v.A.front;
      a += `<g opacity="${(0.95 * ss(0.05, 0.3, sh)).toFixed(2)}">${dash(edgeOf(P0, v), '#1d2733', 0.7, 3.4, '6 5')}${dash(edgeOf(P0, v), '#fff', 1, 2, '6 5')}</g>`;
      if (sh > 0.05) a += `<g opacity="${ss(0.15, 0.5, sh).toFixed(2)}">${arrowH(f0, [lerp(f0[0], f1[0], 1.5), lerp(f0[1], f1[1], 1.5)], COL.amber, 'arrM', 3)}</g>`;
      const wr = o.wrText || ['前囊皺褶（示意）', 'wrinkles'], mv = o.mvText || ['囊袋跟著動', 'bag moves'];
      ex.push(labNear(wr[0], wr[1], v.A.striae || gp, -20, -60, { bold: true, color: BROWN, lc: BROWN, op: (o.wrOp ?? 1) * kL }));
      ex.push(lab(mv[0], mv[1], PW - 12, o.yMove ?? YB, f0, { side: 'R', bold: true, color: BROWN, lc: BROWN, op: kL })); }
    else ex.push(lab('同樣的拉法', 'same pull', 14, 92, v.Q(add3(K.capPt(c, g.r, g.h, g.lift), tg, 0.9)), { color: COL.accent, lc: COL.accent, op: kL }));
    a += `<g opacity="${ss(0.02, 0.25, pull)}">${arrowH(gp, v.Q(add3(K.capPt(c, g.r, g.h, g.lift), tg, 1.2 * (weak ? pw : 1))), COL.accent, 'arrA', 3)}</g>`;   // a smaller pull: a shorter arrow
    S.push(v.svg + `<g clip-path="url(#${idp}${i}_bx)">${a}</g>` + htext(xm, 30, weak ? 'Zonule 弱（示意）' : 'Routine', { size: 17, bold: true, color: weak ? BROWN : COL.accent, anchor: 'middle' }));
  }
  return { svg: S.join('') + `<path d="M${PW / 2} 0V${PH}" stroke="#fff" stroke-width="4"/>`, extra: ex.join('') };
}

DRAW2['4-1'] = T => {
  const sv = scope(DONE, W_SCOPE_IN, 'sL'), A = sv.A, k2 = T.on(2), k6 = T.on(6), cx = sv.P([0, 0]);
  let ex = lab('連續的撕囊邊緣', 'continuous edge', 14, 64, A.edge6, { bold: true, color: COL.accent, lc: COL.accent });
  ex += `<g opacity="${k2}">${circ(cx, CASE.optic / 2 * sv.k, BLUE, 0.9, '6 4', 1.8)}</g>`;
  ex += lab(`IOL optic ${CASE.optic.toFixed(1)} mm`, '', PW - 12, YB, sv.P([CASE.optic / 2 * 0.71, CASE.optic / 2 * 0.71]), { side: 'R', color: BLUE, lc: BLUE, op: k2 });
  // the diameter across the centre, its value right under the line (inside the reflex, no leader)
  const s525 = `${(2 * CASE.ccc.r).toFixed(2)} mm（目標 5.0–5.5）`, dl = sv.P([-CASE.ccc.r, 0]), dr = sv.P([CASE.ccc.r, 0]);
  ex += `<g opacity="${k6}">${VIEWS.dim(dl, dr, COL.accent)}</g>` + lab(s525, '', cx[0] - measure(s525, 15, true) / 2, dl[1] + 28, null, { color: COL.accent, bold: true, op: k6 });
  ex += note('虛線＝IOL optic（依院內型號）', k2, PH - 14);
  // right: the finished rhexis at 3 o'clock, zoomed on the rim: edge, optic edge, zonule insertion as ticks (the optic is where the IOL will sit)
  const c = K.norm(DONE), tv = sec(DONE, W_RIM41, 'cR', { hp: 3 }), B = tv.A, H = 3, rE = CASE.ccc.r, rO = CASE.optic / 2, rZ = K.R_AZI;
  const top = (r, up) => tv.Q(K.capPt(c, r, H, up));
  let rs = tv.svg + tick(tv, c, rE, H, COL.accent, 0.3) + tick(tv, c, rO, H, BLUE, 0.62, k2) + tick(tv, c, rZ, H, COL.amber, 0.45, k2);
  // the anterior capsule that will lie on the optic (edge → optic edge): a blue band just above the capsule
  const band = []; for (let r = rE; r <= rO + 1e-9; r += 0.025) band.push(tv.Q(K.capPt(c, r, H, 0.05)));
  rs += `<g opacity="${k2}">${dash(band, BLUE, 0.9, 5, '')}</g>`;
  let rx = lab('IOL optic 邊緣', 'optic edge', 14, 64, top(rO, 0.62), { color: BLUE, lc: BLUE, op: k2 });
  rx += lab('撕囊邊緣', 'CCC edge', 14, 112, top(rE, 0.3), { bold: true, color: COL.accent, lc: COL.accent });
  rx += lab('zonule 附著', 'zonular insertion', PW - 12, 64, top(rZ, 0.45), { side: 'R', color: COL.amber, lc: COL.amber, op: k2 });
  rx += labNear('前囊蓋住 optic 邊緣', 'overlap', band[Math.floor(band.length / 2)], -30, 70, { bold: true, color: BLUE, lc: BLUE, op: k2 });
  rx += lab('赤道', 'equator', PW - 12, YB, B['eq+'], { side: 'R' });
  rx += VIEWS.sbar(tv.k, 1, 1) + note('optic 邊緣＝IOL 放好後的位置', k2, PH - 14);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: rs, extra: rx, P: { title: '3 點方向的子午切面（模型）', orient: '右＝周邊（3 點）　上＝前' } } };
};
DRAW2['4-2'] = T => {
  // line 3: the front advances while the forceps keep the same piece of flap (it rides ahead of the front twice as fast: the folded flap
  // mirrors the torn sector about the hinge), so the grasp drifts away from the front; then the forceps let go and regrasp near the new front
  const p0 = 0.3, k3 = T.p(3, 0.05, 0.55), kR = T.p(3, 0.62, 0.95), prog = lerp(p0, 0.4, k3);
  const c0 = K.norm({ cat: MIDc }), g0 = K.graspAt(c0), cS = { ...BASE, ccc: cccS({ prog, fold: 1 }) }, g1 = K.graspAt(K.norm({ cat: cS }));
  const held = { h: (g0.h + CASE.ccc.dir * 2 * (prog - p0) * 12 + 24) % 12, r: g0.r, lift: g0.lift };
  const at = kR > 0 ? { h: lerpH(held.h, g1.h, kR), r: lerp(held.r, g1.r, kR), lift: g0.lift + 0.3 * Math.sin(Math.PI * kR) } : held;
  const st = { cat: { ...cS, inst: [{ kind: 'forceps', at }] } }, c = K.norm(st), X = K.rhex(c.ccc);
  const sv = scope(st, W_42, 'sL'), A = sv.A, hp = K.tearPlane(c0), tv = sec(st, W_RIM, 'cR', { hp }), B = tv.A;
  // line 1: the same two pulls from the grasp point in both views — along the tangent (green) and with an outward part (red)
  const { d, tg } = dirsAt(X.hf), G3 = K.capPt(c, at.r, at.h, at.lift), gS = sv.Q(G3), gT = tv.Q(G3);
  const vG = add3(G3, tg, 2.0), vR = add3(add3(G3, tg, 1.6), d, 1.1), k1 = T.on(1, 0.6) * (1 - T.on(2, 0.5));
  const circAhead = [], outPath = []; for (let s = 0; s <= 1.5001; s += 0.05) circAhead.push(sv.Q(K.capPt(c, CASE.ccc.r, X.hf + CASE.ccc.dir * s)));
  for (let s = 0; s <= 1.2001; s += 0.05) { const r = CASE.ccc.r + 1.1 * ss(0, 1.2, s); if (r > c.pupil / 2 - 0.05) break; outPath.push(sv.Q(K.capPt(c, r, X.hf + CASE.ccc.dir * s))); }
  let ls = sv.svg + `<g opacity="${(0.55 * T.on(0, 0.6)).toFixed(2)}">${circ(sv.P([0, 0]), CASE.ccc.r * sv.k, COL.accent, 1, '5 5', 1.4)}</g>`;
  const pathA = (q, col, mk) => `<path d="${pathOf(q)}" fill="none" stroke="#fff" stroke-width="5.5" opacity="0.8"/><path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="2.8" stroke-dasharray="7 4" marker-end="url(#${mk})"/>`;
  ls += `<g opacity="${k1.toFixed(2)}">${pathA(circAhead, COL.accent, 'arrA')}${pathA(outPath, WARN, 'arrR')}${arrowH(gS, sv.Q(vG), COL.accent, 'arrA')}${arrowH(gS, sv.Q(vR), WARN, 'arrR')}</g>`;
  let ex = labNear('撕開的前緣', 'tear front', A.front, -40, 48, { bold: true, op: T.on(0) * (1 - T.on(2, 0.5)) + T.on(3, 0.4) });
  ex += lab('沿切線拉 → 照著圓走', 'tangent', PW - 12, 160, sv.Q(vG), { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: k1 });
  ex += lab('偏外 → 往外跑', 'outward', PW - 12, YB, sv.Q(vR), { side: 'R', bold: true, color: WARN, lc: WARN, op: k1 });
  const k2 = T.on(2) * (1 - T.on(3, 0.4));
  ex += labNear('夾點：瓣上、靠近前緣', 'grasp', gS, -40, -50, { bold: true, color: COL.accent, lc: COL.accent, op: k2 });
  ex += labNear('前囊瓣（翻折）', 'flap', A.flapEdge, 30, -50, { color: CAP_COL, lc: CAP_COL, op: k2 });
  // line 3: the gap front ↔ grasp grows (dotted), then the regrasp
  const kG = ss(0.25, 0.6, k3) * (1 - ss(0.1, 0.5, kR));
  const gd = [gS[0] - A.front[0], gS[1] - A.front[1]], gl = Math.hypot(gd[0], gd[1]) || 1, nr = [-gd[1] / gl, gd[0] / gl], sg = nr[0] < 0 ? 22 : -22;   // offset to the left of the shaft
  const ga = [A.front[0] + nr[0] * sg, A.front[1] + nr[1] * sg], gb = [gS[0] + nr[0] * sg, gS[1] + nr[1] * sg];
  ls += `<g opacity="${kG.toFixed(2)}">${dash([A.front, ga], WARN, 0.9, 1.4, '2 3')}${dash([gS, gb], WARN, 0.9, 1.4, '2 3')}${dash([ga, gb], '#fff', 0.85, 6, '')}${VIEWS.dim(ga, gb, WARN)}</g>` + `<g opacity="${T.on(3, 0.3).toFixed(2)}"><circle cx="${A.front[0].toFixed(1)}" cy="${A.front[1].toFixed(1)}" r="4.5" fill="${WARN}" stroke="#fff" stroke-width="1.6"/></g>`;
  ex += labNear('前緣離夾點越來越遠', 'gap grows', [(ga[0] + gb[0]) / 2, (ga[1] + gb[1]) / 2], -40, -50, { bold: true, color: WARN, lc: WARN, op: kG });
  ex += lab('放開，靠近前緣重新夾', 'regrasp', PW - 12, 262, gS, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: ss(0.6, 1, kR) });
  ex += note('虛線＝預定的圓；箭頭長短為示意', 1, PH - 14);
  // right: the rim section just behind the front (plane fixed at the line-1 moment): the edge sits on the circle; the tangent crosses the
  // plane (⊙ / ⊗), the outward part of the red pull lies in it and points to the periphery
  const fE = tv.Q(K.capPt(c0, CASE.ccc.r, hp));
  let rs = tv.svg + `<g opacity="${k1.toFixed(2)}">${arrow(gT, tv.Q(vR), WARN, 1, 'arrR', 3.2)}</g>` + oop(tv, tg, gT, COL.accent, k1);
  const gI = K.instGeom(c, c.inst[0]);
  const fA = onShaft(tv, gI, 40);
  let rx = lab('撕囊鉗（投影到切面）', 'forceps', PW - 12, 64, fA, { side: 'R', color: '#3c4a57', op: fA ? 1 : 0 });
  rx += lab('前緣在預定的圓上', 'tear front', 14, 262, fE, { bold: true, op: T.on(0) });
  rx += lab('沿切線（垂直於切面）', 'tangent', 14, 64, [gT[0], gT[1] - 10], { bold: true, color: COL.accent, lc: COL.accent, op: k1 });
  rx += labNear('偏外的分量 → 往周邊', 'outward', tv.Q(vR), 20, -50, { bold: true, color: WARN, lc: WARN, op: k1 });
  rx += lab('夾點（瓣上）', 'grasp', 14, 112, [gT[0], gT[1] - 4], { bold: true, color: COL.accent, lc: COL.accent, op: k2 });
  rx += labNear('虹膜', 'iris', B['pm+'], 50, -50);
  rx += VIEWS.sbar(tv.k, 1, 1) + note('鉗子與夾點投影到切面', 1, PH - 14);
  return { L: { svg: ls, extra: ex, P: SCOPE_T }, R: { svg: rs, extra: rx, P: RIM_T } };
};
DRAW2['4-3'] = T => {
  // left: routine | weak zonules, the same pull (line 0 animates it); right: the meridian along the pull — the bag (solid) moves with the
  // forceps, dashed = where it sits with normal zonules; the zonules on the far side are stretched (示意 shift and wrinkles)
  const pull = T.on(0, 1.6, 0.6), sp = splitScope(pull, 1, 'sp', { wrOp: T.on(2) > 0 ? 1 : 0.85 });
  const st = { cat: { ...MIDc, zonule: { weak: 1, pull }, inst: [{ kind: 'forceps', at: K.graspAt(K.norm({ cat: MIDc })) }] } }, c = K.norm(st);
  const { tg } = dirsAt(K.rhex(c.ccc).hf), hp = G.clockOf(tg[0], tg[1]), cv = sec(st, W_PULL, 'cR', { hp }), B = cv.A;
  const rest = []; for (let u = -L0.Req; u <= L0.Req + 1e-9; u += 0.1) rest.push(cv.P([u, -L0.zAnt(Math.min(Math.abs(u), L0.Req - 1e-6))]));
  for (let u = L0.Req; u >= -L0.Req - 1e-9; u -= 0.1) rest.push(cv.P([u, -L0.zPost(Math.min(Math.abs(u), L0.Req - 1e-6))]));
  const g = K.graspAt(c), G3 = K.capPt(c, g.r, g.h, g.lift), gp = cv.Q(G3), sh = K.lensShift(c).k;
  const eq0 = cv.P([L0.Req, -L0.zc]), eq1 = B['eq+'];
  let rs = cv.svg + `<g opacity="${(0.85 * ss(0.05, 0.3, sh)).toFixed(2)}">${dash(rest, '#2c4a63', 1, 1.5, '5 4')}</g>`;
  rs += `<g opacity="${ss(0.02, 0.25, pull).toFixed(2)}">${arrowH(gp, cv.Q(add3(G3, tg, 1.6)), COL.accent, 'arrA', 3)}</g>`;
  rs += `<g opacity="${ss(0.15, 0.5, sh).toFixed(2)}">${arrow([eq0[0] + 6, eq0[1] - 26], [eq1[0] + 26, eq1[1] - 26], COL.amber, 1, 'arrM', 3)}</g>`;
  const fA = onShaft(cv, K.instGeom(c, c.inst[0]), 50);
  let rx = lab('撕囊鉗（投影到切面）', 'forceps', 14, 64, fA, { color: '#3c4a57', op: fA ? 1 : 0 });
  rx += lab('同樣的拉法', 'pull', PW - 12, 64, cv.Q(add3(G3, tg, 1.6)), { side: 'R', color: COL.accent, lc: COL.accent, op: ss(0.1, 0.4, pull) });
  rx += labNear('囊袋跟著鉗子移動', 'bag moves', [eq1[0] + 10, eq1[1] - 26], -30, 60, { bold: true, color: BROWN, lc: BROWN, op: ss(0.3, 0.7, sh) * (1 - T.on(3, 0.4)) });
  rx += labNear('被拉動的距離（分三級）', 'displacement', [eq1[0] + 10, eq1[1] - 26], -30, 60, { bold: true, color: BROWN, lc: BROWN, op: T.on(3, 0.4) });
  rx += lab('小帶（弱）', 'zonules', 14, 200, B['azi-'], { color: COL.amber, lc: COL.amber, bold: true });
  rx += note('虛線＝zonule 正常時；位移與皺褶為示意', 1, PH - 14);
  return { L: { svg: sp.svg, extra: sp.extra + note('動畫示意', 1, PH - 14), P: SPLIT_T }, R: { svg: rs, extra: rx, P: PULL_T } };
};

// ---------------------------------------------------------------- 5 實錄：案例 A 的撕囊 (footage left, synced section right)
const syncR = (f, extra = '') => { const cv = sec(f.st, W_CAT, 'cR'); return { svg: cv.svg, extra: secLabels(cv, f.st) + extra, P: SYNC_T, cv }; };
// (labels follow the instrument in the section: cannula while OVD is added, forceps otherwise)
DRAW2['5-1'] = T => {
  const f = footSeg(T, 'pinch', { at0: T.st(2) - FOOTAGE.ev('pinch', 'pinch') }), L = f.L, op = frozenOp('pinch', f.tau);   // the pinch at line 2, the freeze at line 3
  if (op > 0) L.extra = lab('前囊放射狀皺褶', 'capsule wrinkling', 14, 64, fpt('pinch', 'wrinkle', f.tau), { bold: true, lc: '#ffd34d', op }) +
    lab('撕囊鉗夾住前囊', 'forceps', PW - 12, YB, fpt('pinch', 'forceps-tip', f.tau), { side: 'R', bold: true, op });
  const R = syncR(f), sh = K.lensShift(K.norm(f.st)).k;
  R.extra += `<g opacity="${sh}">${htext(PW / 2, PH - 50, '囊袋被拉動（模型示意）', { size: 15, bold: true, color: '#8a3b12', anchor: 'middle' })}</g>`;
  return { L, R };
};
DRAW2['5-2'] = T => { const f = footSeg(T, 'pass1'); return { L: f.L, R: syncR(f) }; };
DRAW2['5-3'] = T => {
  const f = footSeg(T, 'gap1'), L = f.L;
  const wip = f.s >= ev('wipe-1') && f.s < ev('ovd-refill-1') - 2, ovd = f.s >= ev('ovd-refill-1') && f.s <= ev('ovd-refill-1-end');
  L.extra = htext(14, PH - 14, wip ? '擦切口的血' : ovd ? '經側切口補 OVD' : '', { size: 15, bold: true, color: '#fff' }).replace('stroke="#fff"', 'stroke="#1d2733"');
  const st = f.st; if (ovd) st.cat.inst = [{ kind: 'cannula', via: 'side', at: { h: CASE.side.h, r: 1.2, lift: 0.9 } }];
  return { L, R: syncR(f) };
};
DRAW2['5-4'] = T => {
  const f = footSeg(T, 'pass2', { at0: T.st(2) - FOOTAGE.ev('pass2', 'grasp-3') }), L = f.L, op = frozenOp('pass2', f.tau);   // the regrasp freeze at line 2 (停格)
  if (op > 0) L.extra = lab('鉗子張開，重新夾', 'regrasp', PW - 12, YB, fpt('pass2', 'regrasp-tips', f.tau), { side: 'R', bold: true, op });
  // direction cue (line 1): counter-clockwise arc on the footage, centred on the cornea of the frame
  const k1 = T.on(1) * (1 - T.on(2));
  if (k1 > 0) { const c = FOOTAGE.toPanel('pass2', [438, 314], f.tau), r = 92, pts = []; for (let a = 150; a >= -10; a -= 8) { const t = a * Math.PI / 180; pts.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }   // lower left → bottom (12 o'clock) → right: the pass-2 sweep
    L.extra = (L.extra || '') + `<path d="${pathOf(pts)}" fill="none" stroke="#ffd34d" stroke-width="3.2" marker-end="url(#arrM)" opacity="${k1}"/>` + htext(14, PH - 14, '術者看：逆時針', { size: 15, bold: true, color: '#ffd34d', op: k1 }).replace('stroke="#fff"', 'stroke="#1d2733"'); }
  return { L, R: syncR(f) };
};
DRAW2['5-5'] = T => {
  const f = footSeg(T, 'pass3', { at0: T.en(2) + 0.3 - FOOTAGE.ev('pass3', 'pass3-out') }), L = f.L, n = GRASPS.filter(g => g >= ev('pass3-in') && g <= f.s).length;
  if (f.s >= ev('pass3-in')) { const all = GRASPS.filter(g => g >= ev('pass3-in') && g <= ev('pass3-out')).length;   // one dot per grasp of pass 3, filled once it has happened
    L.extra = htext(14, PH - 14, '這段夾瓣', { size: 15, bold: true, color: '#fff' }).replace('stroke="#fff"', 'stroke="#1d2733"') +
      Array.from({ length: all }, (_, i) => `<circle cx="${92 + i * 20}" cy="${PH - 19}" r="6.5" fill="${i < n ? '#ffd34d' : 'none'}" stroke="#ffd34d" stroke-width="2"/>`).join(''); }
  else L.extra = htext(14, PH - 14, f.s < ev('ovd-refill-2') ? '擦血' : '補 OVD', { size: 15, bold: true, color: '#fff' }).replace('stroke="#fff"', 'stroke="#1d2733"');
  return { L, R: syncR(f) };
};
DRAW2['5-6'] = T => {
  // three clips in a row: gap3 (6×), pass4 (6×) from line 1, flap (0.5×) from line 2
  const t1 = T.st(1) - 0.3, t2 = T.st(2) - 1.0;
  const [clip, at0] = T.u < t1 ? ['gap3', 0.3] : T.u < t2 ? ['pass4', t1] : ['flap', t2];
  const f = footSeg(T, clip, { at0 }), L = f.L;
  if (clip === 'flap') L.extra = htext(14, PH - 14, '前囊瓣從主切口帶出來', { size: 15, bold: true, color: '#fff', op: FOOTAGE.k('flap', 'flap-out', f.tau, 0.4) }).replace('stroke="#fff"', 'stroke="#1d2733"');
  if (clip === 'gap3') { const st = f.st; if (f.s >= ev('ovd-refill-3') && f.s <= ev('ovd-refill-3-end')) st.cat.inst = [{ kind: 'cannula', via: 'main', at: { h: CASE.main.h + 6, r: 0.8, lift: 0.9 } }]; }
  return { L, R: syncR(f) };
};
DRAW2['5-7'] = T => {
  // timeline of the capsulorhexis of case A (source seconds 60–305): passes, grasps, OVD, wipes, flap out
  const x0 = 70, x1 = FW - 40, s0 = 60, s1 = 305, X = s => x0 + (s - s0) / (s1 - s0) * (x1 - x0), y = 190;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += `<path d="M${x0} ${y}H${x1}" stroke="#cfd6dd" stroke-width="10" stroke-linecap="round"/>`;
  PASSES.forEach(([a, b], i) => { o += `<path d="M${X(a).toFixed(1)} ${y}H${X(b).toFixed(1)}" stroke="${COL.accent}" stroke-width="10" stroke-linecap="round" opacity="${T.on(1)}"/>` + text((X(a) + X(b)) / 2, y - 22, `第 ${i + 1} 段`, { size: 15, bold: true, color: COL.accent, anchor: 'middle', op: T.on(1) }); });
  GRASPS.forEach(g => { o += `<circle cx="${X(g).toFixed(1)}" cy="${y}" r="7" fill="#ffd34d" stroke="#1d2733" stroke-width="1.5" opacity="${T.on(1)}"/>`; });
  OVDS.forEach(g => { o += `<path d="M${X(g).toFixed(1)} ${y + 18}v30" stroke="${OVD_COL}" stroke-width="3" opacity="${T.on(1)}"/>` + text(X(g), y + 66, 'OVD', { size: 13.5, bold: true, color: OVD_COL, anchor: 'middle', op: T.on(1) }); });
  WIPES.forEach(g => { o += `<path d="M${X(g).toFixed(1)} ${y + 18}v18" stroke="${COL.sub}" stroke-width="3" opacity="${T.on(1)}"/>` + text(X(g), y + 88, '擦血', { size: 13.5, color: COL.sub, anchor: 'middle', op: T.on(1) }); });
  o += `<path d="M${X(ev('pinch')).toFixed(1)} ${y - 46}v30" stroke="#8a3b12" stroke-width="2.5"/>` + text(X(ev('pinch')) - 4, y - 52, '夾破前囊（起皺）', { size: 13.5, bold: true, color: '#8a3b12' });
  o += `<path d="M${X(ev('flap-out')).toFixed(1)} ${y - 46}v30" stroke="${CAP_COL}" stroke-width="2.5"/>` + text(X(ev('flap-out')) + 4, y - 52, '取出前囊瓣', { size: 13.5, bold: true, color: CAP_COL, anchor: 'end' });
  for (let m = 60; m <= 300; m += 60) o += `<path d="M${X(m).toFixed(1)} ${y + 110}v8" stroke="${COL.sub}"/>` + text(X(m), y + 136, `${m / 60}:00`, { size: 13, color: COL.sub, anchor: 'middle' });
  o += text(x0, y + 160, '錄影時間（分:秒）', { size: 13, color: COL.sub });
  // legend
  o += `<g opacity="${T.on(1)}"><path d="M${x0} 50H${x0 + 40}" stroke="${COL.accent}" stroke-width="10" stroke-linecap="round"/>${text(x0 + 52, 55, '撕囊鉗在眼內', { size: 15 })}` +
    `<circle cx="${x0 + 230}" cy="50" r="7" fill="#ffd34d" stroke="#1d2733" stroke-width="1.5"/>${text(x0 + 244, 55, `夾瓣（${GRASPS.length} 次）`, { size: 15 })}` +
    `<path d="M${x0 + 400} 38v24" stroke="${OVD_COL}" stroke-width="3"/>${text(x0 + 410, 55, `補 OVD（${OVDS.length} 次）`, { size: 15 })}</g>`;
  o += `<g opacity="${T.on(2)}">${htext(FW / 2, PH - 40, '重新夾＝控制撕囊的方法；前房一淺，先停下來補 OVD', { size: 19, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  return { F: { svg: o, extra: '', P: { title: '案例 A 撕囊的時間軸（錄影實測）', orient: '每次夾瓣在 2–4 fps 判讀，短暫的可能漏掉' } } };
};

// ---------------------------------------------------------------- 6 出錯的線索與第一步
// run-out (示意): the tear goes on from runAt 0.26 and its radius grows toward the equator (model `run`); k 0→1 = how far the front has gone.
// The forceps stay on the flap where the surgeon can see it (r ≤ 3.0 in the 7 mm pupil).
const RUN_AT = 0.26;
const runC = (k, o = {}) => ({ ...BASE, ccc: cccS({ prog: lerp(0.27, 0.42, k), fold: 1, run: 1, runAt: RUN_AT, ...o }) });
const runSt = k => { const cc = runC(k), g = K.graspAt(K.norm({ cat: cc })); return { cat: { ...cc, inst: [{ kind: 'forceps', at: { ...g, r: Math.min(g.r, 3.0) } }] } }; };
// clock hours travelled when the run-out edge reaches radius r (bisection on the model's R(t)); clock hour after t hours of tearing
const tAtR = (X, r) => { let a = 12 * RUN_AT, b = 12 * RUN_AT + 2.3; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; X.R(m) < r ? a = m : b = m; } return (a + b) / 2; };
const hAt = t => (((CASE.ccc.h0 + CASE.ccc.dir * t) % 12) + 12) % 12;
const dot5 = (p, col, r = 4.5) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
// numbered steps in a row (the current one filled, the done ones ticked off): the first-step sequence at a glance
function chips(items, act, x0, y0) {
  let x = x0, s = '';
  items.forEach((t, i) => { const w = measure(t, 14, true) + 22, on = act === i, done = act > i;
    s += `<rect x="${x.toFixed(1)}" y="${y0}" width="${w.toFixed(1)}" height="28" rx="14" fill="${on ? COL.accent : done ? '#e3f1ee' : '#fff'}" stroke="${on || done ? COL.accent : '#c3ccd5'}" stroke-width="1.5" opacity="0.96"/>` +
      text(x + w / 2, y0 + 19, t, { size: 14, bold: true, color: on ? '#fff' : done ? COL.accent : COL.sub, anchor: 'middle' });
    x += w; if (i < items.length - 1) { s += htext(x + 9, y0 + 19, '→', { size: 14, bold: true, color: COL.sub, anchor: 'middle' }); x += 18; } });
  return s;
}

DRAW2['6-1'] = T => {
  // the front slowly veers out (lines 0–2) in both views; the scope loses it under the iris, the rim section (at the front) still shows it
  const k = 0.3 * T.p(0, 0.25, 1) + 0.35 * T.p(1, 0, 1) + 0.35 * T.p(2, 0, 0.75), st = runSt(k), c = K.norm(st), X = K.rhex(c.ccc);
  const sv = scope(st, W_SCOPE_IN, 'sL'), A = sv.A, pr = c.pupil / 2, tV = tAtR(X, 3.1), tH = tAtR(X, pr);   // edge visibly off the circle / under the iris
  const pV = sv.Q(K.capPt(c, X.R(Math.min(tV, X.span)), hAt(Math.min(tV, X.span)))), pH = sv.Q(K.capPt(c, pr, hAt(tH)));
  const kH = T.on(2) * ss(0, 0.05, X.span - tH);
  let ls = sv.svg + `<g opacity="${T.on(1)}">${circ(sv.P([0, 0]), CASE.ccc.r * sv.k, COL.accent, 0.75, '5 4', 1.6)}</g>`;
  // the visible part of the run-out edge traced in red over everything (the forceps shaft crosses it: the incision is at 11 o'clock-ish)
  const vis = []; for (let t = 12 * RUN_AT - 0.5; t <= Math.min(X.span, tH) + 1e-9; t += 0.04) vis.push(sv.Q(K.capPt(c, X.R(t), hAt(t))));
  ls += `<g opacity="${T.on(1)}"><path d="${pathOf(vis)}" fill="none" stroke="#fff" stroke-width="5" opacity="0.75"/><path d="${pathOf(vis)}" fill="none" stroke="${WARN}" stroke-width="2.6"/></g>`;
  if (!sv.r.A.frontHidden) ls += dot5(A.front, WARN);
  ls += `<g opacity="${kH.toFixed(2)}"><circle cx="${pH[0].toFixed(1)}" cy="${pH[1].toFixed(1)}" r="7" fill="none" stroke="${WARN}" stroke-width="2.6"/></g>`;
  let ex = labNear('前緣偏離圓、往外走', 'veering out', X.span > tV ? pV : A.front, -70, -60, { bold: true, color: WARN, lc: WARN, op: T.on(1) * (1 - 0.6 * kH) });
  ex += labNear('跑到虹膜下，看不到', 'hidden', pH, -40, 52, { bold: true, color: WARN, lc: WARN, op: kH });
  ex += note('虛線＝原本的圓；動畫示意', 1, PH - 14);
  // right: the rim section just behind the front (follows it): the planned circle, how far out the edge is now, zonule insertion, iris, equator
  const hp = K.tearPlane(c), tv = sec({ cat: runC(k) }, W_RIM, 'cR', { hp }), B = tv.A, rE = X.R(Math.max(0, X.span - 0.12)), up = 0.32;
  const e = tv.Q(K.capPt(c, rE, hp)), c0 = tv.Q(K.capPt(c, CASE.ccc.r, hp, up));
  let rs = tv.svg + tick(tv, c, CASE.ccc.r, hp, COL.accent, up, T.on(1)) + tick(tv, c, K.R_AZI, hp, COL.amber, 0.22, T.on(3));
  if (rE > CASE.ccc.r + 0.08) rs += `<g opacity="${T.on(1)}">${arrow(c0, tv.Q(K.capPt(c, rE, hp, up)), WARN, 1, 'arrR', 2.6)}</g>`;
  rs += dot5(e, WARN);
  let rx = lab('原本的圓', 'planned edge', 14, 112, c0, { color: COL.accent, lc: COL.accent, op: T.on(1) });
  rx += lab('zonule 附著', 'zonular insertion', 14, 64, tv.Q(K.capPt(c, K.R_AZI, hp, 0.22)), { bold: true, color: COL.amber, lc: COL.amber, op: T.on(3) });
  rx += labNear('撕開的前囊邊緣', 'capsule edge', e, e[0] > PW / 2 ? -40 : 30, 80, { bold: true, color: WARN, lc: WARN });
  rx += labNear('虹膜', 'iris', B['pm+'], 50, -50);
  rx += lab('赤道', 'equator', PW - 12, YB, B['eq+'], { side: 'R', op: T.on(3) });
  rx += VIEWS.sbar(tv.k, 1, 1) + note('動畫示意：run-out（切面不畫撕囊鉗）', 1, PH - 14);
  return { L: { svg: ls, extra: ex, P: SCOPE_T }, R: { svg: rs, extra: rx, P: RIM_T } };
};
DRAW2['6-2'] = T => {
  // the first step in order: 1 stop (line 0) → 2 OVD through the side port, the lifted flap pressed flat back in place (line 1) → 3 regrasp on
  // the flap as near the front as can be seen → 4 pull back (against the tear), then toward the centre (line 2) → the front turns back (示意).
  // Left zoomed on the lower right of the pupil where all of it happens; right: the meridian through the regrasp point (the backward pull
  // crosses it, the centripetal pull lies in it).
  const X = K.rhex(K.norm({ cat: runC(1) }).ccc), tg0 = X.span - 0.5, hg = hAt(tg0), gAt = { h: hg, r: 3.2, lift: 0.03 };
  const kO = T.p(1, 0.15, 0.85), kIn = T.on(2, 0.25, 0.05), k1 = T.p(2, 0.18, 0.42), k2 = T.p(2, 0.42, 0.66), kT = T.p(2, 0.66, 0.95);
  const ovdIn = T.on(1, 0.25, 0.05) * (1 - kIn), inst = ovdIn > 0.5 ? [{ kind: 'cannula', via: 'side', at: { h: CASE.side.h, r: 1.2, lift: 0.9 } }] : kIn > 0.5 ? [{ kind: 'forceps', at: gAt }] : runSt(1).cat.inst;
  const st = { cat: { ...runC(1, { fold: 1 - kO }), inst } }, c = K.norm(st), sv = scope(st, W_62, 'sL'), A = sv.A, pr = c.pupil / 2;
  const act = T.on(1, 0.05) < 0.5 ? 0 : kIn < 0.5 ? 1 : k1 < 0.02 ? 2 : 3;
  // line 0: stop — the forward pull crossed out
  const f0 = runSt(1).cat.inst[0].at, F3 = K.capPt(c, f0.r, f0.h, f0.lift), fw = dirsAt(f0.h), Fe = sv.Q(add3(F3, fw.tg, 1.5)), Fm = sv.Q(add3(F3, fw.tg, 0.8)), kS = T.on(0, 0.5) * (1 - T.on(1, 0.4));
  let ls = sv.svg + `<g opacity="${kS.toFixed(2)}">${dash([sv.Q(F3), Fe], '#fff', 0.8, 6, '')}${dash([sv.Q(F3), Fe], WARN, 1, 3, '6 4')}<path d="M${Fm[0] - 10} ${Fm[1] - 10}L${Fm[0] + 10} ${Fm[1] + 10}M${Fm[0] - 10} ${Fm[1] + 10}L${Fm[0] + 10} ${Fm[1] - 10}" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M${Fm[0] - 10} ${Fm[1] - 10}L${Fm[0] + 10} ${Fm[1] + 10}M${Fm[0] - 10} ${Fm[1] + 10}L${Fm[0] + 10} ${Fm[1] - 10}" stroke="${WARN}" stroke-width="4" stroke-linecap="round"/></g>`;
  // line 2: the two pulls from the regrasp point; the front's new path (solid where it can be seen, dotted under the iris)
  const G3 = K.capPt(c, gAt.r, gAt.h, gAt.lift), dg = dirsAt(hg), P1 = add3(G3, dg.tg, -1.4), P2 = add3(P1, dg.d, -1.0);
  const seen = [], under = [], hid = [];
  for (let s = 0; s <= 1.1001; s += 0.05) { const r = X.front[0] - (X.front[0] - 2.9) * ss(0, 1.1, s), q = sv.Q(K.capPt(c, r, hAt(X.span + s))); (r < pr - 0.04 ? seen : under).push(q); }
  for (let t = tAtR(X, pr); t <= X.span + 1e-9; t += 0.04) hid.push(sv.Q(K.capPt(c, X.R(t), hAt(t))));   // the run-out edge under the iris
  if (under.length && seen.length) under.push(seen[0]);
  const kH = T.on(2, 0.6);
  const vis = []; for (let t = 12 * RUN_AT - 0.5; t <= tAtR(X, pr) + 1e-9; t += 0.04) vis.push(sv.Q(K.capPt(c, X.R(t), hAt(t))));   // the run-out edge as far as it can be seen (as in 6-1)
  ls += `<path d="${pathOf(vis)}" fill="none" stroke="#fff" stroke-width="5" opacity="0.75"/><path d="${pathOf(vis)}" fill="none" stroke="${WARN}" stroke-width="2.6"/>`;
  ls += `<g opacity="${(0.85 * kH).toFixed(2)}">${dash(hid, WARN, 1, 2.2, '2 4')}${dot5(sv.Q(K.capPt(c, X.front[0], X.front[1])), WARN, 4)}</g>`;
  ls += `<g opacity="${k1.toFixed(2)}">${arrowH(sv.Q(G3), sv.Q(P1), COL.accent, 'arrA', 3.4)}</g><g opacity="${k2.toFixed(2)}">${arrowH(sv.Q(P1), sv.Q(P2), COL.accent, 'arrA', 3.4)}</g>`;
  if (seen.length > 1) ls += `<g opacity="${kT.toFixed(2)}">${dash(under, '#7cf0c8', 1, 2.4, '2 4')}<path d="${pathOf(seen)}" fill="none" stroke="#fff" stroke-width="6" opacity="0.8"/><path d="${pathOf(seen)}" fill="none" stroke="${COL.accent}" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#arrA)"/></g>`;
  ls += chips(['1 停', '2 補 OVD', '3 靠近前緣重夾', '4 往回拉、再往中央'], act, 10, 8);
  let ex = lab('不要繼續往前拉', 'stop', PW - 12, 100, Fe, { side: 'R', bold: true, color: WARN, lc: WARN, op: kS });
  const fE = A.flapEdge || sv.Q(G3);
  ex += labNear('瓣壓平、攤回原位', 'flap flat', fE, fE[0] > PW / 2 ? -40 : 40, 60, { bold: true, color: OVD_COL, lc: OVD_COL, op: ss(0.5, 0.9, kO) * (1 - kIn) });
  ex += labNear('靠近前緣重夾', 'regrasp', sv.Q(G3), 40, -40, { bold: true, color: COL.accent, lc: COL.accent, op: kIn * (1 - k2) });
  ex += labNear('1 往撕囊的反方向拉', 'backward', sv.Q(P1), 40, 22, { bold: true, color: COL.accent, lc: COL.accent, op: k1 });
  ex += lab('2 再往中央', 'centripetal', 14, 230, sv.Q(P2), { bold: true, color: COL.accent, lc: COL.accent, op: k2 });
  ex += lab('前緣在虹膜下', 'hidden front', PW - 12, 300, sv.Q(K.capPt(c, X.front[0], X.front[1])), { side: 'R', color: WARN, lc: WARN, op: kH * (1 - kT) });
  if (seen.length > 1) ex += lab('前緣轉回來（示意）', 'turns back', PW - 12, 100, seen[seen.length - 1], { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: kT });
  ex += note(T.on(2, 0.6) > 0.5 ? '點線＝虹膜下、看不到；Little 法，動畫示意' : 'Little 法；動畫示意', 1, PH - 14);
  // right: the rim section through the regrasp point: the edge under the iris beyond the zonule insertion; OVD; the pulls
  const tv = sec(st, W_RIM, 'cR', { hp: hg }), B = tv.A, e = tv.Q(K.capPt(c, X.R(tg0), hg)), gT = tv.Q(G3);
  let rs = tv.svg + dot5(e, WARN) + tick(tv, c, K.R_AZI, hg, COL.amber, 0.22);
  rs += oop(tv, [-dg.tg[0], -dg.tg[1]], gT, COL.accent, k1 * (kIn > 0.5 ? 1 : 0)) + `<g opacity="${k2.toFixed(2)}">${arrowH([gT[0] - 12, gT[1]], tv.Q(add3(G3, dg.d, -1.0)), COL.accent, 'arrA', 3.4)}</g>`;
  let rx = labNear('撕開的前緣（在虹膜下）', 'capsule edge', e, -30, 90, { bold: true, color: WARN, lc: WARN });
  rx += labNear('zonule 附著', 'zonular insertion', tv.Q(K.capPt(c, K.R_AZI, hg, 0.22)), 40, -60, { color: COL.amber, lc: COL.amber });
  rx += lab('補 OVD：壓平前囊和瓣', '', 14, 64, tv.P([3.2, -(L0.za + 0.3)]), { bold: true, color: OVD_COL, lc: OVD_COL, op: T.on(1, 0.6) * (1 - kIn) });
  rx += lab('1 往反方向（垂直於切面）', 'backward', 14, 64, [gT[0], gT[1] - 10], { bold: true, color: COL.accent, lc: COL.accent, op: k1 * (1 - k2) });
  rx += lab('2 再往中央', 'centripetal', 14, 112, tv.Q(add3(G3, dg.d, -1.0)), { bold: true, color: COL.accent, lc: COL.accent, op: k2 });
  rx += VIEWS.sbar(tv.k, 1, 1) + note('鉗子與夾點投影到切面；動畫示意', 1, PH - 14);
  return { L: { svg: ls, extra: ex, P: SCOPE_T }, R: { svg: rs, extra: rx, P: { title: '經夾點的切面（模型）', orient: '右＝周邊　上＝前' } } };
};
DRAW2['6-3'] = T => {
  // left: case A frozen on the wrinkled capsule (1:12; the label point measured on that frame, footage.js); right: routine | weak zonules,
  // the same pull (line 1); line 2: the first step — a smaller pull, the bag moves less (示意); line 3: unstable bag → CTR (video ③)
  const tau = FOOTAGE.ev('pinch', 'freeze') + 1.0, L = FOOTAGE.panel('pinch', tau, { badge: false });
  L.extra = lab('前囊放射狀皺褶', 'capsule wrinkling', 14, 64, fpt('pinch', 'wrinkle', tau), { bold: true, lc: '#ffd34d' }) + note('案例 A　錄影 1:12', 1, 58);
  const k2 = T.on(2, 1.4, 0.6), pull = T.on(1, 1.6, 0.4), red = k2 > 0.5;
  const sp = splitScope(pull, lerp(1, 0.35, k2), 'sq', { yMove: 330, mvText: red ? ['拉力小 → 動得少', 'smaller pull'] : null, wrText: red ? ['皺褶也少（示意）', 'fewer wrinkles'] : null });
  const ban = (s, op, col) => `<g opacity="${op}"><rect x="10" y="${PH - 44}" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${col}" stroke-width="1.6" opacity="0.95"/>${text(PW / 2, PH - 20, s, { size: 16, bold: true, color: col, anchor: 'middle' })}</g>`;
  const k3 = T.on(3, 0.6);
  const bx = ban('第一步：放慢、減小每次的拉力、前房用 OVD 撐滿', T.on(2, 0.6) * (1 - k3), COL.accent) + ban('撕囊時囊袋不穩 → 考慮 CTR（第三支影片）', k3, BROWN);
  return { L, R: { svg: sp.svg + bx, extra: sp.extra, P: SPLIT_T } };
};

// ---------------------------------------------------------------- 7 練習清單
DRAW2['7'] = T => {
  const box = (x, y, w, h, title, rows, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="#d3dae1"/>${text(x + 20, y + 36, title, { size: 19, bold: true, color: COL.accent })}` +
    rows.map((r, i) => text(x + 20, y + 76 + i * 34, r[0], { size: 16.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += box(20, 20, 560, 200, '為什麼要先練', [['CCC：住院醫師自評 3.30／5、完成率 74.4%'], ['（Dooley 2006）', false, COL.sub], ['有 Eyesi 之後 PCR 4.2% → 2.6%（第 1–2 年）'], ['觀察性研究，只能說相關（Ferris 2020）', false, COL.sub]], T.on(0));
  const items = [['一', '三平面隧道，長度接近寬度'], ['二', 'OVD 撐滿再撕'], ['三', '夾在靠近前緣的瓣上，勤重新夾'], ['四', 'Run-out：停、補 OVD、往反方向拉']];
  o += `<g opacity="${T.on(3)}"><rect x="600" y="20" width="610" height="${PH - 40}" rx="10" fill="#f7f9fa" stroke="${COL.accent}" stroke-width="2"/>${text(620, 56, 'Wet lab／模擬器：上刀前練這四件事', { size: 19, bold: true, color: COL.accent })}</g>`;
  items.forEach(([n, s], i) => { const k = i === 0 ? T.on(3) : i < 3 ? T.on(4) : T.on(5);
    o += `<g opacity="${k}"><circle cx="642" cy="${110 + i * 72}" r="18" fill="${COL.accent}"/>${text(642, 116 + i * 72, n, { size: 17, bold: true, color: '#fff', anchor: 'middle' })}${text(674, 116 + i * 72, s, { size: 19, bold: i === 3 })}</g>`; });
  return { F: { svg: o, extra: '', P: { title: '練習清單', orient: '' } } };
};
