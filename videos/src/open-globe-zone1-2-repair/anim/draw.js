// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual), { F } (full) or { R } (title):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the globe model (videos/models/globe): a section (mechanism) and the microscope view (surgeon
// at 12, the surgeon's view). Instruments come from videos/models/hands; the field overview and the microscope view use the same tips and
// directions (RIG below), so an instrument points the same way in both.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, G = GLOBE, H = HANDS;
const note = (s, op, y = PH - 14, x = PW - 12, anchor = 'end') => htext(x, y, s, { size: 13, color: COL.sub, anchor, op });
const add2 = (a, d, s = 1) => [a[0] + d[0] * s, a[1] + d[1] * s], sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
const unit2 = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
const qz = (x, n = 12) => Math.round(clamp01(x) * n) / n;            // animated tissue states are quantised so the sections are cached
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;

// ---------------------------------------------------------------- the case (spec.md「病例情境」) and its states
const WND = { h: 10, s0: -3.5, s1: 4.0 };                              // 10 o'clock, 3.5 mm onto the cornea → 4 mm behind the limbus
const SU = {                                                           // b = bite each side (mm), dep = depth as a fraction of the wall (示意)
  L0: { s: 0, b: 1.0, dep: 0.8 },                                      // limbus, 9-0
  C1: { s: -0.9, b: 1.0, dep: 0.72 }, C2: { s: -2.1, b: 0.85, dep: 0.8 }, C3: { s: -3.0, b: 0.65, dep: 0.88 },   // cornea, 10-0: peripheral long and shallow → central short and deep
  S1: { s: 1.2, b: 1.0, dep: 0.7 }, S2: { s: 2.4, b: 1.0, dep: 0.7 }, S3: { s: 3.5, b: 1.0, dep: 0.7 },          // sclera, 8-0 (count and spacing 示意)
};
const PRE = { wound: WND, prolapse: 1, ac: 0.6, heme: 0.7 };
const REP = { wound: WND, prolapse: 1, reposit: 1, ac: 1, ovd: 1, heme: 0.7, para: [{ h: 4 }] };      // after the iris is back
// corneal knots are buried from 5-3 on (where the narration explains it); scleral knots are drawn on the surface
const sut = (keys, buried = true) => keys.map(k => ({ ...SU[k], tie: 1, bury: buried && k[0] !== 'S' ? 1 : 0 }));
const CORNEA = ['L0', 'C1', 'C2', 'C3'], ALL = [...CORNEA, 'S1', 'S2', 'S3'];

// ---------------------------------------------------------------- windows (screen mm: left, top, width) and panel titles
const SCW = { x: 0.3, y: -0.7, w: 11 }, SFW = { x: -9.5, y: -6.43, w: 19 }, MERW = { x: 1.0, y: -14.5, w: 11.6 }, ACW = { x: -1.7, y: -0.95, w: 3.4 };
const FOV = { x: -178, y: -74, w: 356 }, GRW = { x: -128, y: -96, w: 286 };
const SC_P = { title: '顯微鏡俯視　右眼 OD', orient: '術者坐 12 點：下＝12 點　右＝temporal' };
const AC_P = { title: '垂直傷口的切面', orient: '從角膜中心沿傷口往外看　上＝表面' };
const MR_P = { title: '經傷口的子午切面（10 點）', orient: '上＝前　右＝往周邊' };
const FV_P = { title: '手術野俯視（顯微鏡外）', orient: '術者坐 12 點：下＝病人額頭　示意' };
const GR_P = { title: '握筆式持針（側面）', orient: '右手，從拇指側看　示意' };
window.PRELOAD_EXTRA = JSON.stringify([SC_P, AC_P, MR_P, FV_P, GR_P]) + '持針器有齒鑷綁線鑷剪刀針尖針尾夾在這裡不要夾針尖附近示意';

// ---------------------------------------------------------------- views
function scope(st, win, id, mm = '') { const c = VIEWS.cam(win, PW, PH), r = G.enface({ st, id }); return { svg: `<g transform="${c.tf}">${r.svg}${mm}</g>`, P: c.P, k: c.k, A: r.A }; }
function sec(st, plane, win, id, step) {
  const c = VIEWS.cam(win, PW, PH), h = win.w * PH / PW, r = G.section({ plane, win: { x: win.x, y: win.y, w: win.w, h }, st, id, step });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, P: c.P, k: c.k, A: r.A, pl: plane };
}
const mer = (st, id) => sec(st, G.planes.meridian(WND.h), MERW, id, 0.03);
const across = (st, s, id, win = ACW) => sec(st, G.planes.across(WND.h, s), win, id, 0.008);
const M12 = G.enfaceMap(12);
const ef = (s, d = 0, c = 0) => { const rho = G.surfAt(s).rho; return M12(G.P3(WND.h + c / rho / 6 / (Math.PI / 180) / 5, s, d)); };   // en-face point at distance s, c mm across the wound
// zone ruler along the outer surface of the meridional section (1.1 mm outside it), ticks at the limbus and at 5 mm
function zoneRuler(v, op, label5 = true) {
  const Q = p3 => v.P(G.toPlane(v.pl, p3)), arc = []; for (let s = -5.4; s <= 7.6; s += 0.1) arc.push(Q(G.P3(WND.h, s, -1.1)));
  const tick = s => { const a = Q(G.P3(WND.h, s, -0.8)), b = Q(G.P3(WND.h, s, -1.4)); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${COL.accent}" stroke-width="2.2"/>`; };
  const zl = (s, t) => { const p = Q(G.P3(WND.h, s, -1.75)); return htext(p[0], p[1], t, { size: 15, bold: true, color: COL.accent, anchor: 'middle' }); };
  const l5 = Q(G.P3(WND.h, 5, -1.4));
  return `<g opacity="${op}"><path d="M${arc.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}" fill="none" stroke="${COL.accent}" stroke-width="1.6"/>${tick(0)}${tick(5)}${zl(-2.6, 'Zone I')}${zl(2.5, 'Zone II')}${zl(7.0, 'Zone III')}${label5 ? htext(l5[0] + 8, l5[1] + 2, '5 mm', { size: 13, bold: true, color: COL.accent }) : ''}</g>`;
}

// ---------------------------------------------------------------- instruments in the microscope view and the field (one RIG for both)
const R_SIDE = [0.6, 0.8], L_SIDE = unit2([-0.62, 0.78]);                // the right hand comes from the lower right, the left from the lower left
// needle through suture `su` at progress `pass` (0 = tip at the entry, 1 = tip out of the exit). The needle lies in the plane across the wound
// (it curves in depth), so the microscope sees it almost end-on along the suture line: the same 3D needle as in the cross-section, projected.
// The holder grips it at right angles, 40% of its length from the swage (slightly closer to the swage, Newton 2023), so from above the holder
// runs along the wound toward the right hand; the left forceps holds the entry-side edge.
const NEEDLE_L = 2.4;   // needle length drawn in the sections (示意)
function rig(st, su, pass) {
  const pl = G.planes.across(WND.h, su.s), p = G.suturePath(st, su), pts = p.track.map(q => G.toPlane(pl, q)), n = Math.max(2, Math.round(41 * clamp01(pass)));
  const nd3 = G.needleIn(pts, n, NEEDLE_L).map(([u, v]) => M12(G.onPlane(pl, u, v))), inside = Math.min(n, nd3.length);
  let acc = 0, gi = nd3.length - 1; const total = nd3.reduce((a, q, i) => i ? a + Math.hypot(q[0] - nd3[i - 1][0], q[1] - nd3[i - 1][1]) : 0, 0);
  for (let i = 1; i < nd3.length; i++) { acc += Math.hypot(nd3[i][0] - nd3[i - 1][0], nd3[i][1] - nd3[i - 1][1]); if (acc >= 0.6 * total) { gi = i; break; } }
  const a = M12(p.entry), b = M12(p.exit), t = unit2(sub2(b, a)); let hd = [-t[1], t[0]]; if (hd[0] * R_SIDE[0] + hd[1] * R_SIDE[1] < 0) hd = [-hd[0], -hd[1]];
  const gap = G.gapAt(st, su.s), fT = ef(su.s + 0.55, 0, gap / 2 + 0.15);
  return { needle: { pts: nd3, inside }, R: { kind: 'holder', tip: nd3[gi], dir: hd }, L: { kind: 'forceps', tip: fT, dir: L_SIDE, open: 0 }, entry: a, exit: b, tip: nd3[0] };
}
function rigSvg(r, o = {}) {   // in screen mm (inside the scope transform); the part inside the cornea is seen faintly through it
  const nd = r.needle, ins = nd.pts.slice(0, nd.inside), out = nd.pts.slice(Math.max(0, nd.inside - 1));
  let s = '';
  if (o.L !== false) s += H.drawInst(r.L, { clip: 40 });
  if (ins.length > 1) s += `<path d="M${ins.map(H.F).join('L')}" fill="none" stroke="${H.C.needle}" stroke-width="2.4" stroke-linecap="round" opacity="0.45" ${H.NS}/>`;
  if (out.length > 1) s += H.needleSvg({ pts: out }, { w: 3.4 });
  return s + H.drawInst(r.R, { clip: 40 });
}
// tying: tying forceps (left) and needle holder (right) pulling the two suture ends apart along the suture, at the crossing point
function tieSvg(st, su, op) {
  const p = G.suturePath(st, su), a = M12(p.entry), b = M12(p.exit), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], t = unit2(sub2(b, a));
  const lt = add2(m, t, -1.6), rt = add2(m, t, 1.6), thread = `<path d="M${H.F(lt)}L${H.F(m)}L${H.F(rt)}" stroke="#fff" stroke-width="3" fill="none" ${H.NS}/><path d="M${H.F(lt)}L${H.F(m)}L${H.F(rt)}" stroke="${G.C.suture}" stroke-width="1.4" fill="none" ${H.NS}/>`;
  return `<g opacity="${op}">${thread}${H.drawInst({ kind: 'tyer', tip: lt, dir: L_SIDE, open: 0 }, { clip: 40 })}${H.drawInst({ kind: 'holder', tip: rt, dir: unit2(R_SIDE) }, { clip: 40 })}</g>`;
}

// ---------------------------------------------------------------- 片頭
DRAW2.title = T => { const v = scope(PRE, SFW, 'ti'); return { R: { svg: v.svg, P: SC_P } }; };

// ---------------------------------------------------------------- 1-1 zones
DRAW2['1-1'] = T => {
  const L = mer(PRE, 'm11'), Q = p3 => L.P(G.toPlane(L.pl, p3)), oz = T.on(1), ow = T.on(2), oc = T.on(3);
  const lx = [
    lab('角膜', 'cornea', 14, 150, Q(G.P3(WND.h, -4.4, 0.3)), { bold: true }),
    lab('角膜緣', 'limbus', 270, 64, Q(G.P3(WND.h, 0, -1.1)), { color: COL.accent, bold: true, op: oz }),
    lab('脫出的虹膜', 'prolapsed iris', 14, 196, Q(G.P3(WND.h, G.PRO.s, -0.45)), { op: ow }),
    lab('傷口（切面在傷口裡）', 'wound', 14, 300, Q(G.P3(WND.h, 2.6, 0.25)), { bold: true, color: COL.red, op: ow }),
    lab('睫狀體', 'ciliary body', 14, 352, Q(G.P3(WND.h, 2.2, G.T(2.2) + 0.45)), { bold: true, op: oc }),
    lab('ora serrata（角膜緣後 6.2 mm）', '', PW - 12, 330, Q(G.P3(WND.h, 6.2, G.T(6.2) + 0.2)), { side: 'R', op: oc }),
  ];
  const R = scope(PRE, SFW, 's11'), P = R.P, ring = r => `<circle cx="${P([0, 0])[0].toFixed(1)}" cy="${P([0, 0])[1].toFixed(1)}" r="${(r * R.k).toFixed(1)}" fill="none" stroke="${COL.accent}" stroke-width="2" stroke-dasharray="7 5" opacity="${oz}"/>`;
  const rx = [
    lab('角膜緣', 'limbus', 14, 40, P(M12(G.P3(4.6, 0))), { op: oz }),
    lab('角膜緣後 5 mm（zone II 終點）', '', 14, 380, P(M12(G.P3(1.2, 5))), { color: COL.accent, bold: true, op: oz }),
    lab('傷口　10 點', 'laceration', PW - 12, 190, P(ef(-1.5)), { side: 'R', bold: true, color: COL.red, op: ow }),
    lab('停在角膜緣後 4 mm', '', PW - 12, 372, P(ef(WND.s1)), { side: 'R', op: ow }),
  ];
  const bot = P(M12(G.P3(12, 0.9)));
  return { L: { svg: L.svg + zoneRuler(L, oz), extra: lx.join(''), P: MR_P },
           R: { svg: R.svg + ring(G.surfAt(5).rho), extra: rx.join('') + htext(bot[0], Math.min(bot[1] + 6, PH - 12), '12 點', { size: 14, bold: true, anchor: 'middle' }), P: SC_P } };
};

// ---------------------------------------------------------------- 1-2 what to look at
DRAW2['1-2'] = T => {
  const L = across(PRE, G.PRO.s, 'a12'), o1 = T.on(1), o3 = T.on(3), o4 = T.on(4);
  const lx = [
    lab('脫出的虹膜', 'prolapsed iris', 14, 40, L.P([0, -0.5]), { bold: true, color: '#8a3b12', op: o1 }),
    lab('角膜緣處的牆', 'limbal wall', PW - 12, 160, L.P([0.9, 0.25]), { side: 'R' }),
    lab('前房', 'anterior chamber', PW - 12, 300, L.P([0.8, 0.85]), { side: 'R' }),
  ];
  const R = scope(PRE, SCW, 's12'), A = R.A, P = R.P;
  const rx = [
    lab('瞳孔被拉向傷口', 'peaked pupil', 14, 40, P(A.pupilPeak), { bold: true, op: o1 }),
    lab('脫出的虹膜', 'prolapsed iris', PW - 12, 40, P(A.prolapse), { side: 'R', bold: true, color: '#8a3b12', op: o1 }),
    lab('結膜下出血蓋住鞏膜段', 'subconj. hemorrhage', PW - 12, 380, P(ef(2.6, 0, 0.9)), { side: 'R', color: COL.red, op: o3 }),
  ];
  const warn = `<g opacity="${o4}"><rect x="14" y="${PH - 64}" width="232" height="44" rx="8" fill="#fff" stroke="${COL.red}" stroke-width="2"/>${text(30, PH - 36, '不要壓眼球', { size: 18, bold: true, color: COL.red })}${text(130, PH - 36, '（Zhou 2022）', { size: 13, color: COL.sub })}</g>`;
  return { L: { svg: L.svg, extra: lx.join('') + VIEWS.sbar(L.k, 1), P: { ...AC_P, title: '垂直傷口的切面（角膜緣）' } }, R: { svg: R.svg, extra: rx.join('') + warn, P: SC_P } };
};

// ---------------------------------------------------------------- 2-1 instruments (tray)
DRAW2['2-1'] = T => {
  const win = { x: -6, y: -8, w: 236 }, c = VIEWS.cam(win, FW, PH), P = c.P, rows = [
    ['持針器', 'needle holder', '右手；夾針', 'holder', 0, 0],
    ['有齒鑷', 'toothed forceps', '左手；夾組織', 'forceps', 1, 2],
    ['綁線鑷', 'tying forceps', '沒有齒、有平台；打結', 'tyer', 1, 2],
    ['剪刀', 'scissors', '剪線', 'scissors', 3, 3],
    ['Cyclodialysis spatula', '', '把虹膜掃回眼內', 'spatula', 3, 3],
    ['OVD 套管', 'cannula', '從 paracentesis 打進前房', 'cannula', 3, 3],
  ];
  let svg = '', ex = '';
  rows.forEach(([zh, en, use, kind, li], i) => { const y = i * 11.4, op = T.on(li), tip = [0, y];
    svg += `<g opacity="${op}">${H.drawInst({ kind, tip, dir: [1, 0], open: kind === 'scissors' ? 0.4 : 0 })}</g>`;
    const p = P([150, y]); ex += `<g opacity="${op}">${text(p[0], p[1] + 6, zh, { size: 18, bold: true })}${en ? text(p[0] + measure(zh, 18, true) + 8, p[1] + 6, en, { size: 15, color: COL.sub }) : ''}${text(P([196, y])[0], p[1] + 6, use, { size: 15, color: COL.accent })}</g>`; });
  ex += note('器械外形與大小為示意；型號依院內常規', 1, PH - 12, FW - 12);
  return { F: { svg: `<g transform="${c.tf}">${svg}</g>`, extra: ex, P: { title: '器械（由上往下看）', orient: '尖端在左' } } };
};

// ---------------------------------------------------------------- 2-2 right hand: pen grip
const RIG_FIELD = rig(REP, SU.L0, 0.35);
DRAW2['2-2'] = T => {
  const g = H.gripSide(), c = VIEWS.cam(GRW, PW, PH), P = c.P, o1 = T.on(1), o3 = T.on(3);
  const lx = [
    lab('食指：壓在上面', 'index', 14, 40, P(g.A.index), { bold: true }),
    lab('拇指：從旁邊夾', 'thumb', 14, 82, P(g.A.thumb), { bold: true }),
    lab('中指：從下面撐', 'middle', PW - 12, 40, P(g.A.middle), { side: 'R', bold: true }),
    lab('手靠在額頭（或腕托）', 'hand rest', 14, PH - 60, P(g.A.rest), { color: COL.accent, bold: true, op: o1 }),
    lab('眼睛', 'eye', PW - 12, PH - 60, P(g.A.eye), { side: 'R' }),
  ];
  const tip = P(g.A.tip), curve = `<path d="M${tip[0] - 70} ${tip[1] - 64}A70 70 0 0 0 ${tip[0] + 6} ${tip[1] - 18}" fill="none" stroke="${COL.accent}" stroke-width="2.6" marker-end="url(#arrA)" opacity="${o3}"/>` + htext(tip[0] - 150, tip[1] - 76, '順著針的弧度轉', { size: 15, bold: true, color: COL.accent, op: o3 });
  const fv = H.overview({ R: RIG_FIELD.R, L: RIG_FIELD.L }), c2 = VIEWS.cam(FOV, PW, PH), Q = c2.P;
  const rx = [
    lab('右手：持針器', 'needle holder', PW - 12, 40, Q(fv.A.R.grip), { side: 'R', bold: true }),
    lab('左手：有齒鑷', 'toothed forceps', 14, 40, Q(fv.A.L.grip), { bold: true }),
    lab('手靠穩', 'rest', PW - 12, PH - 30, Q(fv.A.R.rest), { side: 'R', color: COL.accent, bold: true, op: o1 }),
    lab('眼睛', 'eye', 14, PH - 30, Q([0, 6]), {}),
  ];
  return { L: { svg: `<g transform="${c.tf}">${g.svg}</g>`, extra: lx.join('') + curve, P: GR_P }, R: { svg: `<g transform="${c2.tf}">${fv.svg}</g>`, extra: rx.join(''), P: FV_P } };
};

// ---------------------------------------------------------------- 2-3 where to hold the needle; perpendicular entry
DRAW2['2-3'] = T => {
  // the needle as usually drawn: tip on the right pointing down, body arching over to the swage at the upper left; the holder grips it at
  // right angles (along the radius), 40% of the length from the swage, coming from below (needle and holder sizes 示意)
  const win = { x: -4.6, y: -3.4, w: 9.4 }, c = VIEWS.cam(win, PW, PH), P = c.P, tip = [2.7, 1.2], nd = H.needle(tip, [0, 1], { side: 1, grasp: 0.4 });
  let hd = unit2(sub2(nd.centre, nd.grasp)); if (hd[1] < 0) hd = [-hd[0], -hd[1]];
  const thread = add2(nd.swage, unit2(sub2(nd.swage, nd.pts[38])), 4);
  const bad = nd.pts[6], o0 = T.on(0, 0.6, 0.8);
  const svg = `<g transform="${c.tf}"><rect x="-20" y="-20" width="40" height="40" fill="#f4f7f9"/><path d="M${H.F(nd.swage)}L${H.F(thread)}" stroke="${G.C.suture}" stroke-width="1.6" ${H.NS}/>${H.needleSvg(nd, { w: 4 })}${H.holder(nd.grasp, hd, { clip: 30 })}</g>`;
  const pb = P(bad), X = `<g opacity="${o0}" stroke="${COL.red}" stroke-width="3.2"><path d="M${pb[0] - 11} ${pb[1] - 11}L${pb[0] + 11} ${pb[1] + 11}M${pb[0] + 11} ${pb[1] - 11}L${pb[0] - 11} ${pb[1] + 11}"/></g>`;
  const lx = [
    lab('針尖', 'tip', PW - 12, PH - 110, P(nd.pts[0]), { side: 'R', bold: true }),
    lab('針尾（接線處）', 'swage', 14, 40, P(nd.swage), { bold: true }),
    lab('夾在這裡：針身、稍靠針尾', '', 14, PH - 50, P(nd.grasp), { bold: true, color: COL.accent }),
    lab('不要夾針尖附近', '', PW - 12, 40, [pb[0] + 6, pb[1] - 6], { side: 'R', bold: true, color: COL.red, op: o0 }),
  ];
  const pass = 0.15 + 0.85 * T.p(1, 0.1, 0.9) * (1 - 0) , st = { ...REP, sutures: [{ ...SU.C1, pass: Math.max(0.05, pass), needle: 2.6 }] };
  const R = across(st, SU.C1.s, 'a23'), A = R.A;
  const rx = [lab('垂直刺入', 'perpendicular entry', PW - 12, 40, A.in0 ? R.P(A.in0) : null, { side: 'R', bold: true, color: COL.accent }),
              lab('傷口', 'wound', 14, 40, R.P([0, -0.02]), { bold: true, color: COL.red }),
              lab('角膜', 'cornea', 14, PH - 90, R.P([-1.1, 0.3]), {})];
  return { L: { svg, extra: lx.join('') + X + note('針與持針器的大小為示意（由上往下看）', 1), P: { title: '夾針的位置', orient: '由上往下看　示意' } },
           R: { svg: R.svg, extra: rx.join('') + VIEWS.sbar(R.k, 1), P: AC_P } };
};

// ---------------------------------------------------------------- 2-4 left hand; backhand; switching hands
DRAW2['2-4'] = T => {
  const fv = H.overview({ R: RIG_FIELD.R, L: RIG_FIELD.L }), c = VIEWS.cam(FOV, PW, PH), Q = c.P;
  const lx = [lab('左手：有齒鑷', 'toothed forceps', 14, 40, Q(fv.A.L.grip), { bold: true }), lab('右手：持針器', 'needle holder', PW - 12, 40, Q(fv.A.R.grip), { side: 'R', bold: true })];
  const st = { ...REP, sutures: [] }, R = scope(st, SCW, 's24', rigSvg(RIG_FIELD)), P = R.P;
  const rx = [lab('有齒鑷夾住傷口邊緣', 'grasp the edge', 14, PH - 40, P(RIG_FIELD.L.tip), { bold: true, color: COL.accent }),
              lab('持針器', 'needle holder', PW - 12, PH - 40, P(add2(RIG_FIELD.R.tip, RIG_FIELD.R.dir, 2.5)), { side: 'R', bold: true }),
              lab('針', 'needle', PW - 12, 40, P(RIG_FIELD.needle.pts[30]), { side: 'R' })];
  const o1 = T.on(1), card2 = `<g opacity="${o1}"><rect x="14" y="62" width="300" height="70" rx="9" fill="#fff" stroke="#d3dae1"/>${text(28, 90, '右手反手的夾針方向', { size: 15, bold: true })}${text(28, 116, '＝ 左手正手的夾針方向', { size: 15, bold: true, color: COL.accent })}</g>`;
  return { L: { svg: `<g transform="${c.tf}">${fv.svg}</g>`, extra: lx.join('') + card2, P: FV_P }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 3-1 cut or put back
DRAW2['3-1'] = T => {
  const L = mer(PRE, 'm31'), Q = p3 => L.P(G.toPlane(L.pl, p3));
  const lx = [lab('脫出的虹膜', 'prolapsed iris', 14, 150, Q(G.P3(WND.h, G.PRO.s, -0.45)), { bold: true, color: '#8a3b12' }),
              lab('虹膜', 'iris', 14, 300, Q((() => { const kp = G.keyPoints(PRE), m = [(kp.pm[0] + kp.root[0]) / 2 + 0.25, 3.6]; const [cx, cy] = G.clockDir(WND.h); return [m[1] * cx, m[1] * cy, m[0]]; })()), {})];
  const R = scope(PRE, SCW, 's31'), P = R.P, o4 = T.on(4);
  const rx = [lab('回納', 'reposit', PW - 12, 40, P(R.A.prolapse), { side: 'R', bold: true, color: COL.accent, op: o4 })];
  const rows = [['明顯沒有活性 → 切', T.on(1)], ['脫出 > 24 小時 → 清掉（兒童綜論）', T.on(2)], ['回納的風險：上皮內生', T.on(3)], ['本例：< 24 小時、有活性 → 回納', T.on(4)]];
  const card = `<rect x="14" y="${PH - 150}" width="330" height="136" rx="9" fill="#fff" stroke="#d3dae1" opacity="${T.on(1)}"/>` + rows.map(([s, op], i) => text(28, PH - 120 + i * 30, s, { size: 15, bold: i === 3, color: i === 3 ? COL.accent : COL.ink, op })).join('');
  return { L: { svg: L.svg, extra: lx.join(''), P: MR_P }, R: { svg: R.svg, extra: rx.join('') + card, P: SC_P } };
};

// ---------------------------------------------------------------- 3-2 paracentesis, OVD, spatula
DRAW2['3-2'] = T => {
  const op0 = T.on(0), fill = qz(T.p(1, 0.1, 0.9)), back = qz(T.p(2, 0.1, 0.95));
  const st = { wound: WND, prolapse: 1, reposit: back, ac: 0.6 + 0.4 * fill, ovd: fill, heme: 0.7, para: [{ h: 4, open: op0 }] };
  const L = mer(st, 'm32'), Q = p3 => L.P(G.toPlane(L.pl, p3));
  const lx = [lab('OVD 撐起前房', 'OVD', 14, 230, L.P([3.2, -11.6]), { bold: true, color: COL.accent, op: T.on(1) }),
              lab('虹膜回到眼內', 'iris back', 14, 300, Q(G.P3(WND.h, 0.6, 1.1)), { bold: true, op: T.on(2, 0.6, 1.5) })];
  // instruments through the paracentesis at 4 o'clock (opposite the wound): cannula (line 1), spatula sweeping to the wound (line 2–3)
  const para = M12(G.P3(4, -0.55)), out = unit2(sub2(para, [0, 0]));
  const cTip = add2(para, out, -1.6), cann = H.cannula(cTip, out, { op: T.on(1) * (1 - T.on(2)), clip: 60 });
  const sw = T.p(2, 0.05, 0.9), sTip = (() => { const a = add2(para, out, -2.0), b = ef(-0.4, 0.9, 0), m = [(a[0] + b[0]) / 2 + 1.2, (a[1] + b[1]) / 2 - 1.2]; const u = sw, w = 1 - u; return [w * w * a[0] + 2 * w * u * m[0] + u * u * b[0], w * w * a[1] + 2 * w * u * m[1] + u * u * b[1]]; })();
  const spat = H.spatula(sTip, unit2(sub2(para, sTip)), { op: T.on(2) * (1 - T.on(4)), clip: 90 });
  const R = scope(st, SFW, 's32', cann + spat), P = R.P;
  const rx = [lab('Paracentesis（傷口對側）', '', 14, 40, P(R.A.para0), { bold: true, op: op0 }),
              lab('Cyclodialysis spatula', '', 14, PH - 40, P(sTip), { bold: true, color: COL.accent, op: T.on(2) * (1 - T.on(4)) }),
              lab('瞳孔恢復圓形', 'round pupil', PW - 12, 40, P(R.A.pupilPeak), { side: 'R', bold: true, op: T.on(4) })];
  return { L: { svg: L.svg, extra: lx.join(''), P: MR_P }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 4-1 why the limbus first
DRAW2['4-1'] = T => {
  const o2 = T.on(2), st = { ...REP, sutures: o2 > 0.5 ? sut(['L0'], false) : [] };
  const L = mer(st, 'm41'), Q = p3 => L.P(G.toPlane(L.pl, p3));
  const lx = [lab('角膜緣：解剖標記', 'limbus', 270, 64, Q(G.P3(WND.h, 0, -1.1)), { bold: true, color: COL.accent, op: T.on(1) }),
              lab('第一針（最深處）', 'first suture', PW - 12, 300, L.A.deep0 ? L.P(L.A.deep0) : null, { side: 'R', bold: true, op: o2 })];
  const R = scope(st, SCW, 's41'), P = R.P;
  const rx = [lab('角膜段', 'cornea', 14, 40, P(ef(-2)), { bold: true }), lab('鞏膜段', 'sclera', PW - 12, PH - 40, P(ef(2.6)), { side: 'R', bold: true }),
              lab('9-0 nylon　不縫全層', '', PW - 12, 40, P(ef(0)), { side: 'R', bold: true, color: COL.accent, op: o2 })];
  return { L: { svg: L.svg + zoneRuler(L, 0.35, false), extra: lx.join(''), P: MR_P }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 4-2 pass and tie (limbus)
DRAW2['4-2'] = T => {
  const pass = T.p(0, 0.35, 1) * 0.45 + T.p(1, 0, 0.9) * 0.55, tie = qz(T.p(3, 0.1, 0.8), 4), o2 = T.on(2);
  const su = { ...SU.L0, pass: Math.max(0.03, pass), tie, needle: tie > 0 ? 0 : 2.4 }, st = { ...REP, sutures: [su] };
  const L = across(st, 0, 'a42'), A = L.A;
  const dim = A.in0 && A.out0 ? `<g opacity="${o2}">${VIEWS.dim([L.P(A.out0)[0], L.P(A.out0)[1] - 24], [L.P([0, 0])[0], L.P([0, 0])[1] - 24])}${htext(L.P([-0.5, 0])[0], L.P([0, 0])[1] - 34, '1 mm（示意）', { size: 13, bold: true, color: COL.accent, anchor: 'middle' })}</g>` : '';
  const lx = [lab('深度 80%（示意）', 'depth', 14, PH - 50, A.deep0 ? L.P(A.deep0) : null, { bold: true, op: o2 }),
              lab('垂直刺入', 'entry', PW - 12, 40, A.in0 ? L.P(A.in0) : null, { side: 'R', bold: true, color: COL.accent, op: T.on(0) * (1 - T.on(3)) })];
  const r = rig(st, su, su.pass), R = scope(st, SCW, 's42', tie > 0 ? tieSvg(st, su, 1 - T.on(3, 0.6, 1.6)) : rigSvg(r)), P = R.P;
  const rx = [lab('左手：有齒鑷', 'forceps', 14, PH - 40, P(r.L.tip), { bold: true, op: tie > 0 ? 0 : 1 }),
              lab('右手：持針器', 'needle holder', PW - 12, PH - 40, P(add2(r.R.tip, r.R.dir, 2.5)), { side: 'R', bold: true, op: tie > 0 ? 0 : 1 }),
              lab('打結、剪線', 'tie', PW - 12, 40, P(ef(0)), { side: 'R', bold: true, color: COL.accent, op: T.on(3) })];
  return { L: { svg: L.svg, extra: lx.join('') + dim + VIEWS.sbar(L.k, 1), P: { ...AC_P, title: '垂直傷口的切面（角膜緣，9-0）' } }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 5-1 one corneal suture
DRAW2['5-1'] = T => {
  const pass = T.p(0, 0.3, 1) * 0.35 + T.p(1, 0, 1) * 0.4 + T.p(2, 0, 0.8) * 0.25, o1 = T.on(1);
  const su = { ...SU.C2, pass: Math.max(0.03, pass), needle: 2.4 }, st = { ...REP, sutures: [...sut(['L0'], false), su] };
  const L = across(st, SU.C2.s, 'a51'), A = L.A, i = 1;
  const band = A['deep' + i] ? (() => { const top = L.P([0, 0]), y70 = L.P([0, 0.7 * G.T(SU.C2.s)])[1], y90 = L.P([0, 0.9 * G.T(SU.C2.s)])[1];
    return `<g opacity="${o1}"><rect x="${top[0] - 150}" y="${y70.toFixed(1)}" width="300" height="${(y90 - y70).toFixed(1)}" fill="${COL.accent}" opacity="0.14"/>${htext(top[0] + 158, (y70 + y90) / 2 + 5, '70–90%', { size: 14, bold: true, color: COL.accent })}</g>`; })() : '';
  const lx = [lab('10-0 nylon', '', 14, 40, A['in' + i] ? L.P(A['in' + i]) : null, { bold: true }),
              lab('深度 80%（示意）', 'depth', 14, PH - 50, A['deep' + i] ? L.P(A['deep' + i]) : null, { bold: true, op: o1 }),
              lab('兩邊對稱', 'mirrored', PW - 12, PH - 50, A['out' + i] ? L.P(A['out' + i]) : null, { side: 'R', bold: true, color: COL.accent, op: T.on(2) })];
  const r = rig(st, su, su.pass), R = scope(st, SCW, 's51', rigSvg(r)), P = R.P, o3 = T.on(3);
  const e = P(r.entry), w0 = P(ef(SU.C2.s)), d3 = `<g opacity="${o3}">${VIEWS.dim(w0, e)}${htext((w0[0] + e[0]) / 2 - 12, (w0[1] + e[1]) / 2 - 10, '0.85 mm（示意）', { size: 13, bold: true, color: COL.accent, anchor: 'end' })}</g>`;
  const rx = [lab('垂直傷口', 'perpendicular', PW - 12, 40, P(ef(SU.C2.s - 0.4)), { side: 'R', bold: true, op: T.on(2) }),
              lab('有齒鑷', 'forceps', 14, PH - 40, P(r.L.tip), { bold: true }), lab('持針器', 'needle holder', PW - 12, PH - 40, P(add2(r.R.tip, r.R.dir, 2.5)), { side: 'R', bold: true })];
  return { L: { svg: L.svg, extra: lx.join('') + band + VIEWS.sbar(L.k, 1), P: { ...AC_P, title: '垂直傷口的切面（角膜，10-0）' } }, R: { svg: R.svg, extra: rx.join('') + d3, P: SC_P } };
};

// ---------------------------------------------------------------- 5-2 peripheral long and shallow, central short and deep
DRAW2['5-2'] = T => {
  const st = { ...REP, sutures: sut(CORNEA, false) }, L = mer(st, 'm52'), A = L.A;
  const lx = [lab('周邊：長而淺', 'peripheral', PW - 12, 64, A.deep1 ? L.P(A.deep1) : null, { side: 'R', bold: true }),
              lab('中央：短而深', 'central', 14, 64, A.deep3 ? L.P(A.deep3) : null, { bold: true })];
  const R = scope(st, SFW, 's52'), P = R.P, c = P([0, 0]), o2 = T.on(2);
  const vis = `<g opacity="${o2}"><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(3 * R.k).toFixed(1)}" fill="none" stroke="${COL.accent}" stroke-width="2.2" stroke-dasharray="6 5"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="4" fill="${COL.accent}"/></g>`;
  const rx = [lab('長而淺', 'C1', PW - 12, 64, P(ef(SU.C1.s, 0, SU.C1.b)), { side: 'R', bold: true, op: T.on(0) }),
              lab('短而深', 'C3', 14, 64, P(ef(SU.C3.s, 0, -SU.C3.b)), { bold: true, op: T.on(0) }),
              lab('角膜段 3.5 mm：3 針', '', PW - 12, PH - 40, P(ef(-1.8, 0, -1.2)), { side: 'R', bold: true, color: COL.accent, op: T.on(1) }),
              lab('離視軸 3 mm', 'visual axis', 14, PH - 40, [c[0] - 3 * R.k * 0.7, c[1] + 3 * R.k * 0.7], { bold: true, color: COL.accent, op: o2 })];
  return { L: { svg: L.svg, extra: lx.join('') + note('點＝每針最深處', 1), P: MR_P }, R: { svg: R.svg + vis, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 5-3 tying and burying
DRAW2['5-3'] = T => {
  const tie = qz(T.p(0, 0.2, 1), 4), bury = T.p(2, 0.2, 0.9), su = { ...SU.C2, tie, bury };
  const st = { ...REP, sutures: [...sut(['L0'], bury > 0.5), su] }, L = across(st, SU.C2.s, 'a53'), A = L.A;
  const lx = [lab('結', 'knot', PW - 12, 40, A.knot1 ? L.P(A.knot1) : null, { side: 'R', bold: true, op: tie > 0.5 ? 1 : 0 }),
              lab('轉進針道埋起來', 'buried', 14, PH - 50, A.knot1 ? L.P(A.knot1) : null, { bold: true, color: COL.accent, op: T.on(2, 0.6, 1.2) })];
  const R = scope(st, SCW, 's53', tieSvg(st, su, 1 - T.on(2))), P = R.P;
  const p = G.suturePath(st, su), m = P(M12(p.deep));
  const rx = [lab('左手：綁線鑷', 'tying forceps', 14, PH - 40, P(add2(M12(p.entry), [-0.6, 0.8], 0.4)), { bold: true, op: 1 - T.on(2) }),
              lab('右手：持針器', 'needle holder', PW - 12, PH - 40, P(add2(M12(p.exit), [0.6, 0.8], 0.4)), { side: 'R', bold: true, op: 1 - T.on(2) }),
              lab('3-1-1 或 2-1-1', '', PW - 12, 40, m, { side: 'R', bold: true, color: COL.accent, op: T.on(1) })];
  return { L: { svg: L.svg, extra: lx.join('') + VIEWS.sbar(L.k, 1), P: { ...AC_P, title: '垂直傷口的切面（角膜）' } }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 6-1 360° peritomy, find the end
DRAW2['6-1'] = T => {
  const pe = qz(T.p(1, 0.1, 0.9)), st = { ...REP, sutures: sut(CORNEA), peri360: pe };
  const L = mer(st, 'm61'), Q = p3 => L.P(G.toPlane(L.pl, p3));
  const lx = [lab('結膜往後退', 'conjunctiva', PW - 12, 230, Q(G.P3(WND.h, 7.3, -0.15)), { side: 'R', op: T.on(1) }),
              lab('傷口盡頭：角膜緣後 4 mm', '', PW - 12, 300, Q(G.P3(WND.h, WND.s1, 0.1)), { side: 'R', bold: true, color: COL.red, op: T.on(2) })];
  const R = scope(st, SFW, 's61'), P = R.P, a = P(ef(0.6, 0, 1.6)), b = P(ef(3.4, 0, 1.6));
  const rx = [lab('360° 剪開結膜', 'peritomy', PW - 12, 40, P(M12(G.P3(8, 3))), { side: 'R', bold: true, op: T.on(1) }),
              lab('傷口停在角膜緣後 4 mm', '', PW - 12, PH - 40, P(ef(WND.s1)), { side: 'R', bold: true, color: COL.red, op: T.on(2) })];
  return { L: { svg: L.svg + zoneRuler(L, 0.4, false), extra: lx.join(''), P: MR_P }, R: { svg: R.svg, extra: rx.join('') + arrow(a, b, COL.accent, T.on(3)) + htext(b[0] + 8, b[1] + 22, '由前往後', { size: 15, bold: true, color: COL.accent, op: T.on(3) }), P: SC_P } };
};

// ---------------------------------------------------------------- 6-2 scleral sutures
DRAW2['6-2'] = T => {
  const pass = T.p(0, 0.2, 1), done = T.on(2, 0.6, 1.2), su = { ...SU.S2, pass: Math.max(0.03, pass), needle: done > 0.5 ? 0 : 2.4, tie: done > 0.5 ? 1 : 0 };
  const scl = done > 0.5 ? sut(['S1', 'S2', 'S3']) : [...sut(['S1']), su], st = { ...REP, sutures: [...sut(CORNEA), ...scl], peri360: 1 };
  const L = across(st, SU.S2.s, 'a62', { x: -1.7, y: -0.7, w: 3.4 }), A = L.A, i = 5;
  const lx = [lab('8-0 nylon', '', 14, 40, A['in' + i] ? L.P(A['in' + i]) : null, { bold: true }),
              lab('鞏膜', 'sclera', PW - 12, 40, L.P([1.0, 0.2]), { side: 'R' }),
              lab('睫狀體', 'ciliary body', 14, PH - 50, L.P([-0.6, G.T(SU.S2.s) + 0.25]), { bold: true, op: T.on(1) })];
  const r = rig(st, su, su.pass), R = scope(st, SCW, 's62', done > 0.5 ? '' : rigSvg(r)), P = R.P;
  const rx = [lab('鞏膜段：3 針（示意）', '', PW - 12, PH - 40, P(ef(3.5, 0, -1.0)), { side: 'R', bold: true, color: COL.accent, op: T.on(2) })];
  return { L: { svg: L.svg, extra: lx.join('') + VIEWS.sbar(L.k, 1), P: { ...AC_P, title: '垂直傷口的切面（鞏膜，8-0）' } }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 7-1 closing
DRAW2['7-1'] = T => {
  const close = qz(T.p(1, 0.1, 0.9)), st = { wound: WND, prolapse: 1, reposit: 1, ac: 1, para: [{ h: 4 }], sutures: sut(ALL), peri360: 1 - close };
  const L = mer(st, 'm71'), Q = p3 => L.P(G.toPlane(L.pl, p3));
  const lx = [lab('前房重建', 'AC reformed', 14, 230, L.P([3.2, -11.6]), { bold: true, color: COL.accent }),
              lab('結膜蓋回去', 'conjunctiva', PW - 12, 300, Q(G.P3(WND.h, 3.0, -0.15)), { side: 'R', op: T.on(1) })];
  const R = scope(st, SFW, 's71'), P = R.P;
  const rx = [lab('確認不漏水', 'watertight', 14, 40, P(ef(-1.5)), { bold: true, color: COL.accent }),
              lab('依院內常規', '縫線、測試、術後用藥', PW - 12, PH - 40, P(ef(2.5, 0, 1)), { side: 'R', op: T.on(2) })];
  return { L: { svg: L.svg, extra: lx.join(''), P: MR_P }, R: { svg: R.svg, extra: rx.join(''), P: SC_P } };
};

// ---------------------------------------------------------------- 8 checklist
DRAW2['8'] = T => {
  const rows = ['1　不壓眼球；看 zone、脫出的組織與瞳孔', '2　傷口對側 paracentesis；OVD＋spatula 回納虹膜', '3　第一針對齊角膜緣：9-0 nylon',
    '4　角膜 10-0 nylon：垂直、對稱、深度 70–90%；周邊長淺、中央短深', '5　結剪短、轉進針道，埋在遠離視軸的一側', '6　360° 剪開結膜探查；鞏膜由前往後，8-0 nylon',
    '7　右手握筆、手靠穩；左手夾組織；角度不順就反手或換手'];
  let cur = -1; rows.forEach((_, i) => { if (T.u >= T.st(i + 1) - 0.2) cur = i; });
  let s = `<rect x="40" y="14" width="${FW - 80}" height="${PH - 28}" rx="12" fill="#fff" stroke="#d3dae1"/>`;
  rows.forEach((r, i) => { const y = 66 + i * 50, op = T.on(i + 1, 0.5);
    if (cur === i) s += `<rect x="56" y="${y - 32}" width="${FW - 112}" height="44" rx="8" fill="rgba(14,124,107,0.10)"/>`;
    s += text(80, y, r, { size: 21, bold: cur === i, color: cur === i ? COL.accent : COL.ink, op }); });
  return { F: { svg: s, P: { title: '模擬練習清單', orient: '照順序默念一次' } } };
};
