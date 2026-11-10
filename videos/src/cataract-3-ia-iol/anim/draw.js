// ============================================================================
// Drawing of every segment of video ③ (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full) / { R } (title):
// { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Left: case A footage (術者視角, footage.js) or the model's microscope view; right: the globe model (videos/models/globe/cataract.js) — the
// meridional section through the main incision (left = main incision, right = the 6 o'clock side), its incision close-up, or the microscope view —
// driven by the SAME footage clock: every model state in a footage segment is a function of the source time of the frame on screen (caseAt(s)).
// Case parameters: params.js (CASE). Model numbers and sources: videos/models/globe/CARD.md 白內障 ③.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, K = CATARACT, G = GLOBE;
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op = 1, col = COL.accent, y = 34, x = PW / 2) => htext(x, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const arrowH = (a, b, col, mk, w = 3.2, op = 1) => `<g opacity="${op}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#fff" stroke-width="${w + 3}" stroke-linecap="round" opacity="0.85"/>${arrow(a, b, col, 1, mk, w)}</g>`;
const wtext = (x, y, s, o = {}) => htext(x, y, s, { size: 15, bold: true, color: '#fff', ...o }).replace('stroke="#fff"', 'stroke="#1d2733"');   // white text on footage
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// a label whose leader starts dx, dy px from its anchor (the text left of that point when dx < 0, right of it otherwise)
const labNear = (zh, en, a, dx, dy, o = {}) => { const w = lw(zh, en, o), x = a[0] + dx, y = a[1] + dy + (o.size || 15) * 0.36;
  return dx < 0 ? lab(zh, en, x - w - 7, y, a, o) : lab(zh, en, x + w + 7, y, a, { ...o, side: 'R' }); };
const box = (y, s, op, col = COL.accent, h = 36, size = 16) => `<g opacity="${op.toFixed(2)}"><rect x="10" y="${y}" width="${PW - 20}" height="${h}" rx="8" fill="#fff" stroke="${col}" stroke-width="1.6"/>${text(PW / 2, y + h / 2 + size * 0.36, s, { size, bold: true, color: col, anchor: 'middle' })}</g>`;
const YB = PH - 48;
const WARN = '#b3262c', CORT = '#7a5418', CAP = '#1d5d93', OVDC = '#5b4b9a', IOLC = '#7a6a1e', INK2 = '#3c4a57';

// ---------------------------------------------------------------- case states (params.js) and views
const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 }, HP = CASE.HP, L0 = K.LENS, CN = K.CN;
const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
const BASE = { main: MAIN, side: SIDE, ccc: CCC };
const FULL = () => new Array(12).fill(1), CLEAN = { cortex: new Array(12).fill(0), sub: 0 };
const under = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L0.zAnt(r) - dep]; };
const dirAt = (h, el) => { const d = G.clockDir(h), e = el * Math.PI / 180; return [d[0] * Math.cos(e), d[1] * Math.cos(e), -Math.sin(e)]; };
// instruments (positions: params.js; every one clears iris, cornea and anterior capsule — check.js)
const IA = (p, o = {}) => ({ kind: 'ia', p, port: o.port || 'up', occl: o.occl || 0 });
const P_RIM6 = under(HP, 3.0, 0.55), P_C = under(HP, 0.8, 0.5), P_C12 = under(HP, 1.2, 0.5), P_MAIN = under(CASE.main.h, 1.6, 0.3), P_8 = under(8, 2.0, 0.3), P_3 = under(3, 2.4, 0.45);
const P_SUBT = under(CASE.main.h, 3.3, 0.7);   // under the subincisional rim: a straight coaxial tip cannot get here (2-1)
const B = CASE.bentSub, BENT = { kind: 'iaAsp', via: 'main', p: under(B.h, B.r, B.dep), tipDir: dirAt(B.toward, B.el), port: 'up' };
const BM = CASE.bimanual, BIM = (() => { const d = G.clockDir(CASE.main.h), l = G.clockDir(CASE.main.h + 3), a = BM.az * Math.PI / 180, e = BM.el * Math.PI / 180,
  hd = [d[0] * Math.cos(a) + l[0] * Math.sin(a), d[1] * Math.cos(a) + l[1] * Math.sin(a)];
  return { kind: 'iaAsp', via: 'side', p: under(CASE.main.h, BM.r, BM.dep), tipDir: [hd[0] * Math.cos(e), hd[1] * Math.cos(e), -Math.sin(e)], port: 'up', occl: 1 }; })();
const IRR = (() => { const d = G.clockDir(CASE.main.h), q = G.clockDir(CASE.main.h + 3); return { kind: 'iaIrr', p: [2.4 * d[0] + 2.2 * q[0], 2.4 * d[1] + 2.2 * q[1], 10.2] }; })();
const HDC = (() => { const d = G.clockDir(CASE.main.h); return { kind: 'cannula', via: 'side', p: [2.2 * d[0], 2.2 * d[1], L0.zAnt(2.2) + 0.05] }; })();
const INJ = (() => { const d = G.clockDir(CASE.main.h); return { kind: 'injector', p: [3.5 * d[0], 3.5 * d[1], 10.6] }; })();
const OVDCAN = { kind: 'cannula', via: 'main', p: under(HP, 1.0, 0.3) };
const P_O1 = under(HP, 2.0, 0.6), P_O2 = under(3, 1.5, 0.6);   // I/A over the optic (OVD removal)
const W_CAT = { x: -8.6, y: -14.5, w: 17.2 }, W_LENS = { x: -6.4, y: -12.7, w: 12.8 }, W_TUN = { x: -8.3, y: -13.3, w: 6.2 };
const W_SCOPE = { x: -6.0, y: -4.06, w: 12 }, W_SCOPE_N = { x: -4.6, y: -3.11, w: 9.2 };
const CAT_T = { title: '經主切口的切面（模型）', orient: '左＝主切口（11 點多）　上＝前' };
const PROJ_T = { title: '經主切口的切面（模型；器械為投影）', orient: '左＝主切口　上＝前' };
const SYNC_T = { title: '經主切口的切面（模型，依錄影時間）', orient: '左＝主切口　上＝前' };
const SYNCP_T = { title: '經主切口的切面（依錄影時間；器械為投影）', orient: '左＝主切口' };
const SCOPE_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝temporal' };
const SCOPE_SYNC_T = { title: '術者視角（模型，依錄影時間）', orient: '下＝12 點　右＝temporal' };
const TUN_T = { title: '主切口隧道放大（模型）', orient: '左＝周邊　上＝前' };
const TUNS_T = { title: '主切口隧道放大（模型，依錄影時間）', orient: '左＝周邊　上＝前' };
window.PRELOAD_EXTRA = JSON.stringify([CAT_T, PROJ_T, SYNC_T, SYNCP_T, SCOPE_T, SCOPE_SYNC_T, TUN_T, TUNS_T]) +
  '經主切口的切面模型依錄影時間器械為投影術者視角右眼下點右上前左周邊隧道放大俯視虛線＝切面示意停格0123456789';

const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = K.section({ st, h: o.hp ?? HP, off: o.off || 0, cut: !!o.cut, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 260).toFixed(4), id });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id) {
  const c = VIEWS.cam(win, PW, PH), r = K.enface({ st, id, surgeon: 12 }), A = mapA(r.A, c.P);
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A, P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
// a point along an instrument's shaft (3D, s mm from the tip or the bend) mapped to the panel, chosen nearest to panel height yT and inside it
const onShaft = (v, st, i, yT, from = 0) => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]), o = g.bend || g.tip; let best = null;
  for (let s = from; s <= 14; s += 0.1) { const q = v.Q([o[0] + g.axis[0] * s, o[1] + g.axis[1] * s, o[2] + g.axis[2] * s]); if (q[0] > 20 && q[0] < PW - 20 && q[1] > 20 && q[1] < PH - 20 && (!best || Math.abs(q[1] - yT) < Math.abs(best[1] - yT))) best = q; }
  return best; };
// a point of the section in lens-local terms: r mm toward the 6 o'clock side (+) or the main incision (−), z mm above the lens centre plane
const secPt = (v, r, z) => v.P([r, -(L0.zc + z)]);
// on the anterior capsule at radius r, clock h (dz mm above it: negative = in the cortex under it); on the posterior capsule
const capQ = (v, st, r, h, dz = 0) => v.Q(K.capPt(K.norm(st), r, h, dz));
const postQ = (v, r, h) => { const d = G.clockDir(h); return v.Q([r * d[0], r * d[1], L0.zPost(r)]); };

// ---------------------------------------------------------------- footage clock → model state
const EVS = (() => { const o = {}; for (const c of Object.values(FOOTAGE_DEF.clips)) Object.assign(o, c.events || {}); return o; })();
const ev = n => { if (EVS[n] === undefined) throw new Error('no footage event ' + n); return EVS[n]; };
const osc = (s, t0, per) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (s - t0) / per);
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// cortex left per clock sector at source time s (params.js CASE.phases) and the extra subincisional cortex
function cortexAt(s) {
  const cortex = FULL(); let sub = 1;
  for (const P of CASE.phases) { const k = ss(ev(P.from), ev(P.to), s); for (const h of P.hours) cortex[h] = Math.min(cortex[h], lerp(1, P.to01, k)); if (P.sub) sub = Math.min(sub, 1 - k); }
  return { cortex, sub };
}
// where the I/A tip is at source time s (an instrument object, or null when out of the eye)
function iaAt(s) {
  if (s < ev('ia-in') || s > ev('ia-out')) return null;
  if (s < ev('centre')) { const u = lerp(-1.6, 0.6, osc(s, ev('ia-in'), 10)); return IA(under(u < 0 ? CASE.main.h : HP, Math.abs(u), 0.25)); }   // along the main-incision axis, 0.25 mm deep
  if (s < ev('sheet-start')) return IA(mix3(P_C, P_8, osc(s, ev('centre'), 12)));
  if (s < ev('sheet-freeze')) { const k = ss(ev('sheet-start'), ev('sheet-freeze'), s); return IA(mix3(P_RIM6, P_C12, ss(0.1, 1, k)), { occl: 1 }); }
  if (s < ev('nasal-start')) return IA(P_C12);
  if (s < ev('nasal-end')) return IA(mix3(P_C, P_3, osc(s, ev('nasal-start'), 10)));
  if (s < ev('sub-start')) return IA(P_C);
  if (s < ev('sub-end')) return BENT;
  return IA(P_C);
}
// model state of case A at source time s
function caseAt(s) {
  const c = { ...BASE, inst: [] };
  if (s < ev('ovd-in') - 0.5) {                                                  // I/A of the cortex
    const C = cortexAt(s); c.bag = { cortex: C.cortex, sub: C.sub };
    if (s >= ev('sheet-start') && s < ev('sheet-end')) c.bag.strip = { h: HP, prog: ss(ev('sheet-start'), ev('sheet-freeze'), s) };
    const t = iaAt(s); if (t) c.inst.push(t);
    return { cat: c, phase: 'ia' };
  }
  if (s < ev('inj-in') - 1) {                                                    // OVD into the bag
    c.bag = { ...CLEAN }; c.ovd = ss(ev('ovd-in'), ev('ovd-inject'), s); c.ovdBag = ss(ev('ovd-inject'), ev('ovd-out') - 1, s);
    if (s >= ev('ovd-in') && s <= ev('ovd-out')) c.inst.push(OVDCAN);
    return { cat: c, phase: 'ovd' };
  }
  if (s < ev('ia2-in') - 0.5) {                                                  // IOL: model only at out ≤ 0.3 and ≥ 0.8 (CARD.md 白內障 ③ 已知的坑)
    c.bag = { ...CLEAN }; c.ovd = 1; c.ovdBag = 1;
    const o1 = ss(ev('iol-out'), ev('iol-out') + 2.5, s), o2 = ss(ev('unfold-start'), ev('unfold-end'), s), late = s >= ev('unfold-start');
    if (s >= ev('iol-out')) c.iol = late ? { out: lerp(0.8, 1, o2), unfold: lerp(0.5, 1, o2), lead: 1, trail: 0 } : { out: 0.3 * o1, unfold: 0.15, lead: 1, trail: 0 };
    if (s >= ev('inj-in') && s <= ev('inj-out')) c.inst.push(INJ);
    return { cat: c, phase: 'iol', hold: s > ev('iol-out') + 2.5 && !late };
  }
  // OVD removal behind, then in front of the optic (order 示意), the bag closing on the IOL; then closure
  const t0 = ev('ia2-in'), t2 = ev('ia2-out'), t1 = lerp(t0, t2, 0.5), b = ss(t0 + 2, t1, s), f = ss(t1, t2 - 1, s);
  c.bag = { ...CLEAN, collapse: b }; c.ovdBag = 1; c.ovdOut = { behind: b, front: f }; c.ovd = 1 - f; c.iol = { rot: CASE.iolRot };
  if (s >= t0 && s <= t2) c.inst.push(IA(mix3(P_O1, P_O2, osc(s, t0, 9))));
  if (s > t2) c.seal = { gape: 1 - ss(ev('swab-on'), ev('swab-on') + 3, s) };
  return { cat: c, phase: 'close' };
}
// footage panel + the synced model state; at0 = when the clip starts in the segment
function footSeg(T, clip, o = {}) {
  const tau = T.u - (o.at0 ?? 0.3), L = FOOTAGE.panel(clip, tau, { badge: o.badge }), z = caseAt(L.s);
  return { tau, L, st: { cat: z.cat }, z, s: L.s };
}
const fpt = (clip, name, tau) => FOOTAGE.point(clip, name, tau);
const frozenOp = (clip, tau, at, d = 0.35) => { const f = (FOOTAGE_DEF.clips[clip].freeze || []).find(z => z.at === at); if (!f) return 0; const a = FOOTAGE.videoTime(clip, at); return ss(a, a + d, tau) * (1 - ss(a + f.dur - d, a + f.dur, tau)); };
// for check.js: the model state the right panel draws at source time s (the same function the segments use)
window.CASE_AT = s => caseAt(s);

// ---------------------------------------------------------------- shared panels
// the 12–6 section through the main incision with the cortex labels (I/A segments)
function iaSection(st, id, o = {}) {
  const cv = sec(st, o.win || W_LENS, id), A = cv.A, c = K.norm(st);
  let ex = '';
  const g = (c.inst || [])[0] ? K.instGeom(c, c.inst[0]) : null;
  if (g && o.tipLab !== false) { const a = A.tip0; if (a) ex += lab(o.tipLab || 'I/A tip', '', 14, 64, a, { color: INK2, bold: true }); }
  const S = cv.r.A.strand; if (S && o.strand !== false) ex += lab('皮質剝向中央', 'cortex', PW - 12, 112, cv.P([(S.att[0] + S.end[0]) / 2, (S.att[1] + S.end[1]) / 2]), { side: 'R', bold: true, color: CORT, lc: CORT });
  ex += lab('後囊', 'posterior capsule', PW - 12, YB, postQ(cv, 2.2, HP), { side: 'R', color: CAP, lc: CAP });
  return { cv, ex };
}
const cortexLeft = st => { const b = K.norm(st).bag; return b ? b.cortex.reduce((a, v) => a + v, 0) / 12 : 0; };

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const R = FOOTAGE.panel('title', 0, { badge: false });
  R.extra = wtext(14, PH - 14, '案例 A：IOL 剛在瞳孔裡打開（錄影 16:44）', { size: 14 });
  return { R };
};

// ---------------------------------------------------------------- 1 I/A 的原則
DRAW2['1-1'] = T => {
  const st = { cat: { ...BASE, bag: { cortex: FULL(), sub: 1 } } };
  const sv = scope(st, W_SCOPE, 'sL'), A = sv.A;
  let ex = labNear('殘留的皮質', 'cortex', sv.Q(under(7.6, 3.05, 0)), 30, -50, { bold: true, color: CORT, lc: CORT });
  if (A.edge3) ex += lab('撕囊邊緣', 'CCC edge', 14, YB - 34, A.edge3, { color: CAP, lc: CAP });
  ex += note('皮質的分布與厚度為示意', 1);
  const cv = sec(st, W_LENS, 'cR'), B2 = cv.A;
  let rx = lab('皮質：邊緣下、赤道、周邊後囊', '', PW - 12, 64, capQ(cv, st, 3.5, HP, -0.12), { side: 'R', bold: true, color: CORT, lc: CORT, op: T.on(0) });
  rx += lab('主切口下方較厚', 'subincisional', 14, 112, capQ(cv, st, 3.4, CASE.main.h, -0.3), { bold: true, color: WARN, lc: WARN, op: T.on(2) });
  rx += lab('後囊', 'posterior capsule', PW - 12, YB, postQ(cv, 2.2, HP), { side: 'R', color: CAP, lc: CAP, op: T.on(1) });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('厚度為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
DRAW2['1-2'] = T => {
  // the tip under the 6 o'clock rim (in the section plane): port up, then the sheet stripped to the centre (示意 positions)
  const prog = T.p(2, 0.4, 1) * 0.1 + 0.9 * T.p(3, 0.05, 0.9), k = ss(0.1, 1, prog);
  const tip = IA(mix3(P_RIM6, P_C12, k), { occl: prog > 0.05 ? 1 : 0 });
  const st = { cat: { ...BASE, bag: { cortex: K.cortexSweep(T.on(4, 2.5) * 5 / 12, 2, 1), sub: 1, strip: { h: HP, prog } }, inst: [tip] } };
  const sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
  let ex = '';
  if (A.tip0) ex += lab('看得到吸口', 'port up', PW - 12, 112, A.tip0, { side: 'R', bold: true, color: INK2, op: T.on(1) });
  if (A.strandAtt && prog > 0.15) ex += lab('剝下的皮質', 'cortex', 14, 64, [(A.strandAtt[0] + A.strandEnd[0]) / 2, (A.strandAtt[1] + A.strandEnd[1]) / 2], { bold: true, color: CORT, lc: CORT });
  if (T.on(4) > 0.5) ex += lab('已吸乾淨', 'clear', 14, YB, sv.Q(under(3.6, 3.3, 0)), { op: T.on(4) });
  ex += note('吸口方向、皮質條為示意', 1);
  const { cv, ex: rx0 } = iaSection(st, 'cR', { tipLab: false });
  let rx = rx0, g = K.instGeom(K.norm(st), K.norm(st).inst[0]);
  rx += lab('吸口朝上', 'port up', 14, 64, cv.Q(g.port), { bold: true, color: INK2, op: T.on(1) });
  rx += lab('前囊邊緣', 'rim', PW - 12, 162, capQ(cv, st, CN.cccD / 2 + 0.02, HP, 0), { side: 'R', color: CAP, lc: CAP, op: T.on(2) });
  const ped = T.u < T.st(2) ? 0 : T.u < T.st(2) + (T.en(2) - T.st(2)) * 0.45 ? 1 : 2;
  rx += `<g opacity="${T.on(2).toFixed(2)}"><rect x="${PW - 196}" y="8" width="184" height="58" rx="8" fill="#f7f9fa" stroke="#c9d2db"/>${text(PW - 186, 28, '腳踏', { size: 13, bold: true, color: INK2 })}` +
    [1, 2].map((n, i) => { const x = PW - 186 + i * 86, on = ped === n; return `<rect x="${x}" y="36" width="78" height="24" rx="5" fill="${on ? COL.accent : '#fff'}" stroke="${on ? COL.accent : '#c3ccd5'}"/>` +
      text(x + 39, 53, `${n} ${n === 1 ? '灌流' : '＋吸'}`, { size: 13, bold: true, color: on ? '#fff' : COL.sub, anchor: 'middle' }); }).join('') + `</g>`;
  rx += VIEWS.sbar(cv.k, 1, 1) + note('tip 的位置與皮質條為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
// right panel during an I/A clip: the section through the main incision at the source time on screen
function iaSyncR(f, o = {}) {
  const st = f.st, c = K.norm(st), g = c.inst[0];
  const { cv, ex } = iaSection(st, 'cR', { tipLab: g && g.kind === 'iaAsp' ? '彎頭 tip（示意）' : 'I/A tip' });
  let rx = ex + VIEWS.sbar(cv.k, 1, 1) + note(o.note || '依錄影時間；吸的範圍為示意', 1);
  return { svg: cv.svg, extra: rx + (o.extra || ''), P: g && Math.abs(K.dH(G.clockOf(g.p[0], g.p[1]), HP)) > 0.6 && Math.abs(K.dH(G.clockOf(g.p[0], g.p[1]), CASE.main.h)) > 0.6 ? SYNCP_T : SYNC_T };
}
DRAW2['1-3'] = T => {
  // ia-in (4×, freeze at the angled tip) → ia-strip (2×) whose freeze on the 6 o'clock sheet starts at line 3
  const tB = T.st(3) - FOOTAGE.videoTime('ia-strip', 748.0);
  const f = T.u < tB ? footSeg(T, 'ia-in', { at0: T.st(0) + 0.8 - FOOTAGE.videoTime('ia-in', 664.0) }) : footSeg(T, 'ia-strip', { at0: tB }), L = f.L;
  if (T.u < tB) { const op = frozenOp('ia-in', f.tau, 664.0); if (op > 0) L.extra = labNear('彎頭 I/A tip', 'angled tip', fpt('ia-in', 'ia-tip', f.tau), 60, -80, { bold: true, op }); }
  else { const op = frozenOp('ia-strip', f.tau, 748.0);
    if (op > 0) L.extra = labNear('整片皮質', 'cortex sheet', fpt('ia-strip', 'sheet', f.tau), 40, -12, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
      labNear('I/A tip', '', fpt('ia-strip', 'strip-tip', f.tau), -70, 80, { bold: true, op }); }
  return { L, R: iaSyncR(f, { note: '依錄影時間；吸的範圍與 tip 的位置為示意' }) };
};
DRAW2['1-4'] = T => {
  const f = footSeg(T, 'ia-mid'), L = f.L, st = { cat: { ...f.st.cat } };
  const sv = scope(st, W_SCOPE, 'cR'), A = sv.A;
  let rx = labNear('還有皮質', 'cortex', sv.Q(under(10.4, 3.1, 0)), 40, 40, { bold: true, color: CORT, lc: CORT });
  rx += labNear('吸過的區塊', 'cleared', sv.Q(under(5.5, 3.1, 0)), 50, 20, {});
  if (A.tip0) rx += labNear('I/A tip', '', A.tip0, -60, 40, { color: INK2 });
  rx += tag('一區一區變乾淨', 1, COL.accent, 34, PW / 2 + 30);
  rx += note('依錄影時間；區塊的範圍為示意', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_SYNC_T } };
};

// ---------------------------------------------------------------- 2 主切口下方的皮質
DRAW2['2-1'] = T => {
  // left: the straight tip aimed under the subincisional rim (runs into the iris; model-derived); right: the same tip under the 6 o'clock rim (clear)
  const st0 = { cat: { ...BASE, bag: { cortex: FULL(), sub: 1 } } };
  const k = T.on(1, 1.6, 0.2), bad = { cat: { ...st0.cat, inst: [IA(mix3(P_MAIN, P_SUBT, k))] } };
  const lv = sec(bad, W_LENS, 'sL'), A = lv.A;
  let ex = lab('主切口下方的皮質', 'subincisional', PW - 12, 64, capQ(lv, bad, 3.4, CASE.main.h, -0.3), { side: 'R', bold: true, color: CORT, lc: CORT });
  if (k > 0.6) { const g = K.instGeom(K.norm(bad), K.norm(bad).inst[0]), hit = lv.Q([g.tip[0] + g.axis[0] * 1.6, g.tip[1] + g.axis[1] * 1.6, g.tip[2] + g.axis[2] * 1.6]);
    ex += `<circle cx="${hit[0].toFixed(1)}" cy="${hit[1].toFixed(1)}" r="22" fill="none" stroke="${WARN}" stroke-width="3" opacity="${ss(0.6, 1, k).toFixed(2)}"/>`;
    ex += lab('撞到虹膜', 'iris', 14, Math.min(YB, hit[1] + 100), [hit[0] - 16, hit[1] + 14], { bold: true, color: WARN, lc: WARN, op: ss(0.6, 1, k) }); }
  ex += tag('直的 tip → 主切口下方', 1, WARN) + VIEWS.sbar(lv.k, 1, 1) + note('模型推得（隧道往中央上升 18°）', 1);
  const good = { cat: { ...st0.cat, inst: [IA(P_RIM6)] } }, rv = sec(good, W_LENS, 'cR');
  let rx = tag('直的 tip → 6 點那一側', T.on(2), COL.accent) + lab('伸得到邊緣下', 'under the rim', PW - 12, 64, rv.A.tip0, { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(2) });
  rx += box(PH - 110, '不要硬伸：換一個角度', T.on(3, 0.6)) + VIEWS.sbar(rv.k, 1, 1) + note('同一切面　模型', 1);
  return { L: { svg: lv.svg, extra: ex, P: CAT_T }, R: { svg: rv.svg, extra: rx, P: CAT_T } };
};
DRAW2['2-2'] = T => {
  // lines 0–2: bimanual I/A (aspiration through the side port, irrigation through the main incision); lines 3–4: hydro-dispersion (27G via the side port)
  const hd = T.u >= T.st(3) - 0.2, disp = T.p(4, 0, 0.6);
  const st = hd ? { cat: { ...BASE, bag: { cortex: FULL(), sub: 1, disp }, inst: [HDC] } } : { cat: { ...BASE, bag: { cortex: FULL(), sub: 1 }, inst: [BIM, IRR] } };
  const sv = scope(st, W_SCOPE, 'sL'), A = sv.A;
  let ex = '';
  if (!hd) { ex += lab('吸的那支（側切口）', 'aspiration', 14, 64, onShaft(sv, st, 0, 120, 0.5), { bold: true, color: INK2 });
    ex += lab('灌流（主切口）', 'irrigation', PW - 12, YB, onShaft(sv, st, 1, PH - 90, 1), { side: 'R', color: INK2, op: T.on(0) });
    ex += lab('主切口下方的皮質', 'subincisional', 14, YB, sv.Q(under(CASE.main.h - 0.9, 3.2, 0)), { bold: true, color: CORT, lc: CORT, op: T.on(1) }); }
  else { ex += lab('27G 鈍針（側切口）', 'cannula', 14, 64, onShaft(sv, st, 0, 120, 0.5), { bold: true, color: INK2 });
    ex += lab('對著主切口下方打 BSS', '', 14, YB, sv.Q(under(CASE.main.h, 3.6, 0)), { bold: true, color: '#1f6f9c', lc: '#1f6f9c' }); }
  ex += note(hd ? 'Miyoshi 2022 的做法；沖鬆的量為示意' : 'Colvard 1997 的做法；器械的彎與尺寸為示意', 1);
  const cv = sec(st, W_LENS, 'cR'), B2 = cv.A;
  let rx = '';
  if (!hd) { if (B2.tip0) rx += lab('吸口朝上，伸到邊緣下', 'port up', 14, 64, B2.tip0, { bold: true, color: INK2, op: T.on(1) }); }
  else rx += lab('皮質被沖離囊', 'dispersed', 14, 64, capQ(cv, st, 3.4, CASE.main.h, -0.35), { bold: true, color: '#1f6f9c', lc: '#1f6f9c', op: T.on(4) });
  rx += lab('後囊', 'posterior capsule', PW - 12, YB, postQ(cv, 2.2, HP), { side: 'R', color: CAP, lc: CAP });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('器械不在切面上，畫投影', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: PROJ_T } };
};
DRAW2['2-3'] = T => {
  // ia-sub (2×) with the freeze on the angled tip at line 1, then ia-end (6×) whose freeze on the even red reflex starts at line 3
  const tE = T.st(3) - FOOTAGE.videoTime('ia-end', 845.0), end = T.u >= tE;
  const f = end ? footSeg(T, 'ia-end', { at0: tE }) : footSeg(T, 'ia-sub', { at0: T.st(1) - FOOTAGE.videoTime('ia-sub', 814.5) }), L = f.L;
  const o1 = end ? 0 : frozenOp('ia-sub', f.tau, 814.5), o2 = end ? frozenOp('ia-end', f.tau, 845.0) : 0;
  let ex = '';
  if (o1 > 0) ex += labNear('彎頭轉向側邊', 'angled tip', fpt('ia-sub', 'bent-tip', f.tau), -40, -90, { bold: true, color: '#7a4b00', lc: '#ffd34d', op: o1 });
  if (o2 > 0) ex += labNear('紅光均勻', 'even red reflex', fpt('ia-end', 'reflex', f.tau), 60, -90, { bold: true, color: '#7a4b00', lc: '#ffd34d', op: o2 });
  L.extra = ex;
  const st = f.st, c = K.norm(st), v = sec(st, W_LENS, 'cR');
  let rx = '';
  if (c.inst[0] && v.A.tip0) rx += lab(c.inst[0].kind === 'iaAsp' ? '彎頭 tip（示意）' : 'I/A tip', '', PW - 12, 64, v.A.tip0, { side: 'R', color: INK2, bold: true });
  if (c.bag && c.bag.sub > 0.05) rx += lab('主切口下方較厚的皮質', 'subincisional', 14, 112, capQ(v, st, 3.4, CASE.main.h, -0.3), { bold: true, color: CORT, lc: CORT, op: Math.min(1, c.bag.sub * 3) });
  rx += lab('後囊', 'posterior capsule', PW - 12, YB, postQ(v, 2.2, HP), { side: 'R', color: CAP, lc: CAP });
  rx += VIEWS.sbar(v.k, 1, 1) + note('依錄影時間；彎頭 tip 為投影、示意', 1);
  return { L, R: { svg: v.svg, extra: rx, P: SYNCP_T } };
};

// ---------------------------------------------------------------- 3 出錯的線索與第一步
// the outer end of a stria inside the panel, right of the port (label anchor)
const striaPt = v => { const Ls = v.r.A.striaeLines; if (!Ls) return null; let best = null; for (const [a, b] of Ls) for (const q0 of [a, b]) { const q = v.P(q0); if (q[0] > 40 && q[0] < PW - 40 && q[1] > 40 && q[1] < PH - 60 && (!best || q[0] > best[0])) best = q; } return best; };
const CAUGHT = (k, port = 'down') => ({ cat: { ...BASE, bag: { ...CLEAN, caught: k }, inst: [IA(under(HP, 3.8, 0.9), { port, occl: 1 })] } });
DRAW2['3-1'] = T => {
  const k = T.on(0, 1.4, 0.3) * (1 - T.p(2, 0.45, 0.9)), st = CAUGHT(k);
  const sv = scope(st, { x: -5.2, y: -4.71, w: 9.2 }, 'sL'), A = sv.A;
  let ex = tag('錯誤示範（動畫示意）', 1, WARN, PH - 70);
  const sp = striaPt(sv); if (sp && k > 0.2) ex += lab('放射狀皺褶', 'striae', PW - 12, 64, sp, { side: 'R', bold: true, color: WARN, lc: WARN, op: T.on(1) });
  if (A.tip0) ex += lab('吸口朝下：看不到', 'port down', PW - 12, YB, A.tip0, { side: 'R', color: INK2 });
  const cv = sec(st, { x: -2.4, y: -11.6, w: 9.6 }, 'cR'), B2 = cv.A;
  let rx = '';
  if (B2.caughtPort && k > 0.2) rx += lab('後囊被吸起', 'posterior capsule', 14, YB, [B2.caughtPort[0] - 26, B2.caughtPort[1] + 36], { bold: true, color: WARN, lc: WARN });
  if (B2.tip0) rx += lab('吸口朝下', 'port down', 14, 64, B2.tip0, { bold: true, color: INK2 });
  rx += box(10, '第一步：腳退回 1 段；有 reflux 就 reflux', T.on(2, 0.6) * (1 - T.on(3, 0.4)));
  rx += box(10, '吸口內側有金屬毛邊：後囊碰到可能破', T.on(3, 0.6) * (1 - T.on(4, 0.4)), WARN, 36, 15);
  rx += box(10, '後囊破的處理：第四支影片', T.on(4, 0.6), INK2);
  rx += VIEWS.sbar(cv.k, 1, 1) + note('帳篷的高度為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
DRAW2['3-2'] = T => {
  // left: normal (port up, a strand pulled to the port); right: caught (port down, striae), the same moment and window
  const W = { x: -5.2, y: -4.71, w: 9.2 };
  const stN = { cat: { ...BASE, bag: { cortex: K.cortexSweep(5 / 12, 2, 1), sub: 1, strip: { h: HP, prog: 0.35 } }, inst: [IA(mix3(P_RIM6, P_C12, 0.3), { occl: 1 })] } };
  const lv = scope(stN, W, 'sL'), A = lv.A, rv = scope(CAUGHT(T.on(1, 1.0)), W, 'cR'), B2 = rv.A;
  let ex = tag('正常', 1, COL.accent);
  if (A.strandAtt) ex += lab('皮質條拉向吸口', 'cortex', 14, 64, [(A.strandAtt[0] + A.strandEnd[0]) / 2, (A.strandAtt[1] + A.strandEnd[1]) / 2], { bold: true, color: CORT, lc: CORT });
  ex += lab('紅光均勻', 'even reflex', PW - 12, YB, lv.Q(under(9.5, 1.5, 0)), { side: 'R', op: T.on(0) });
  ex += note('模型示意', 1);
  let rx = tag('出錯：吸到後囊', 1, WARN);
  const sp = striaPt(rv); if (sp && T.on(1) > 0.3) rx += lab('皺褶匯向吸口', 'striae', PW - 12, 64, sp, { side: 'R', bold: true, color: WARN, lc: WARN });
  rx += box(PH - 110, '一看到就停：腳退回 1 段，不往上拉', T.on(2, 0.6));
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SCOPE_T }, R: { svg: rv.svg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 4 撐開囊袋、放 IOL
DRAW2['4-1'] = T => {
  const f = footSeg(T, 'ovd', { at0: T.st(2) - FOOTAGE.videoTime('ovd', 880.0) }), L = f.L, op = frozenOp('ovd', f.tau, 880.0);
  if (op > 0) L.extra = labNear('OVD 的前緣', 'OVD front', fpt('ovd', 'ovd-front', f.tau), 50, -40, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
    labNear('cannula', '', fpt('ovd', 'ovd-cannula', f.tau), -60, 60, { bold: true, op });
  if (T.u > T.st(3)) L.extra = (L.extra || '') + wtext(14, PH - 14, '本例接著放 CTR：略過', { size: 14 });
  const st = f.st, cv = sec(st, W_LENS, 'cR'), c = K.norm(st);
  let rx = '';
  if (c.ovdBag > 0.15) rx += lab('OVD 撐開囊袋', 'OVD in the bag', PW - 12, YB, secPt(cv, 1.2, -1.2), { side: 'R', bold: true, color: OVDC, lc: OVDC });
  if (c.inst[0] && cv.A.tip0) rx += lab('cannula（主切口）', '', 14, 64, cv.A.tip0, { color: INK2 });
  rx += lab('後囊', 'posterior capsule', 14, YB, postQ(cv, 2.2, CASE.main.h), { color: CAP, lc: CAP });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('依錄影時間；撐開的量為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
// IOL stages of the model (CARD.md 白內障 ③): 1 leading haptic in (out 0.3), 2 optic open in the bag (out 0.8), 3 the trailing haptic outside, hook
const OVDB = { bag: CLEAN, ovdBag: 1, ovd: 1 };
const S1 = { cat: { ...BASE, ...OVDB, inst: [INJ], iol: { out: 0.3, unfold: 0.15, lead: 1, trail: 0 } } };
const S2 = { cat: { ...BASE, ...OVDB, inst: [INJ], iol: { out: 0.8, unfold: 0.5, lead: 1, trail: 0 } } };
const S3o = { cat: { ...BASE, ...OVDB, iol: { out: 1, unfold: 1, lead: 1, trail: 0 } } };
const HOOK = (() => { const R = K.iolOf(K.norm(S3o)).roots[1]; return { kind: 'chopper', via: 'side', p: [R[0] + 0.3, R[1], R[2] + 0.3] }; })();
const S3 = k => ({ cat: { ...BASE, ...OVDB, iol: { out: 1, unfold: 1, lead: 1, trail: k }, inst: k < 1 ? [HOOK] : [] } });
const FIN = o => ({ cat: { ...BASE, bag: { ...CLEAN, collapse: o.collapse ?? 1 }, ovdBag: 1, ovdOut: { behind: o.behind ?? 1, front: o.front ?? 1 }, ovd: o.ovd ?? 0, iol: { rot: CASE.iolRot, ...(o.iol || {}) }, inst: o.inst || [] } });
const hapVis = (v, H, yT) => { let best = null; for (const p of H) { const q = v.Q(p); if (q[0] > 30 && q[0] < PW - 30 && q[1] > 30 && q[1] < PH - 30 && (!best || Math.abs(q[1] - yT) < Math.abs(best[1] - yT))) best = q; } return best; };
const hapCross = (v, st) => { const IO = K.iolOf(K.norm(st)); let best = null;   // where a haptic crosses this section plane (the projection's tip is off-plane)
  for (const H of IO.haps) for (const p of H) { const q = G.toPlane(v.r.pl, p), d = Math.abs(p[0] * G.clockDir(HP + 3)[0] + p[1] * G.clockDir(HP + 3)[1]); if (!best || d < best[0]) best = [d, v.P(q)]; }
  return best ? best[1] : null; };
DRAW2['4-2'] = T => {
  const st = T.u < T.st(1) ? S1 : T.u < T.st(1) + (T.en(1) - T.st(1)) * 0.55 ? S1 : T.u < T.st(2) ? S2 : S3(T.p(2, 0.5, 0.95));
  const sv = scope(st, W_SCOPE, 'sL'), A = sv.A, IO = K.iolOf(K.norm(st));
  let ex = '';
  if (st === S1 || st === S2) ex += lab('injector（主切口）', '', PW - 12, YB, onShaft(sv, st, 0, PH - 70, 0.5), { side: 'R', color: INK2 });
  if (st === S1) ex += lab('前導 haptic 先進囊袋', 'leading haptic', 14, 64, hapVis(sv, IO.haps[0], 150), { bold: true, color: IOLC, lc: IOLC });
  if (st === S2) ex += lab('optic 在囊袋裡打開', 'optic', 14, 64, sv.Q(IO.ring[30]), { bold: true, color: IOLC, lc: IOLC });
  if (st !== S1 && st !== S2) { ex += lab('後 haptic', 'trailing haptic', 14, YB, sv.Q(IO.haps[1][24]), { bold: true, color: IOLC, lc: IOLC });
    if (A.tip0) ex += lab('hook（側切口）往下壓', '', 14, 64, A.tip0, { color: INK2 }); }
  if (T.on(3) > 0) ex += `<g opacity="${T.on(3).toFixed(2)}"><rect x="${PW - 238}" y="54" width="226" height="56" rx="8" fill="#fff" opacity="0.92" stroke="#c9d2db"/>` +
    text(PW - 226, 76, 'optic 6.0 mm、全長 13.0 mm', { size: 14, bold: true, color: IOLC }) + text(PW - 226, 98, '一款 one-piece（院內型號為準）', { size: 12.5, color: COL.sub }) + `</g>`;
  ex += note('姿勢與路徑為示意', 1);
  const cv = sec(st, W_CAT, 'cR');
  let rx = '';
  if (st === S1 || st === S2) { if (cv.A.tip0) rx += lab('斜面朝下', 'bevel down', 14, 64, cv.A.tip0, { bold: true, color: INK2 }); }
  const hc = hapCross(cv, st); if (hc) rx += lab('haptic（切面上的一段）', '', PW - 12, 64, hc, { side: 'R', color: IOLC, lc: IOLC });
  rx += box(PH - 110, '囊袋約 10.4 mm（in vivo）＜ 全長 13.0 mm：haptic 被壓彎', T.on(4, 0.6), COL.accent, 36, 14.5);
  rx += VIEWS.sbar(cv.k, 1, 1) + note('模型的囊袋 9.6 mm；haptic 投影', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: PROJ_T } };
};
DRAW2['4-3'] = T => {
  // iol (0.5×) with the folded-IOL freeze at line 2, then iol-b (1×) whose freeze on the open optic starts at line 4
  const tB = T.st(4) - FOOTAGE.videoTime('iol-b', 1004.5), b = T.u >= tB;
  const f = b ? footSeg(T, 'iol-b', { at0: tB }) : footSeg(T, 'iol', { at0: T.st(2) - FOOTAGE.videoTime('iol', 998.5) }), L = f.L;
  const o1 = b ? 0 : frozenOp('iol', f.tau, 998.5), o2 = b ? frozenOp('iol-b', f.tau, 1004.5) : 0;
  let ex = '';
  if (o1 > 0) ex += labNear('摺著的 IOL', 'folded IOL', fpt('iol', 'iol-folded', f.tau), 70, -60, { bold: true, color: '#7a4b00', lc: '#ffd34d', op: o1 });
  if (o2 > 0) ex += labNear('optic 打開了', 'optic', fpt('iol-b', 'optic-open', f.tau), 70, -70, { bold: true, color: '#7a4b00', lc: '#ffd34d', op: o2 });
  L.extra = ex;
  const st = f.st, cv = sec(st, W_CAT, 'cR'), c = K.norm(st);
  let rx = '';
  if (c.inst[0] && cv.A.tip0) rx += lab('injector（主切口）', '', 14, 64, cv.A.tip0, { color: INK2 });
  if (c.iol) { const hc = hapCross(cv, st); if (hc && c.iol.out > 0.05) rx += lab('前導 haptic', 'leading', PW - 12, 64, hc, { side: 'R', color: IOLC, lc: IOLC }); }
  if (f.z.hold) rx += box(PH - 110, '正在打開的這一段：看左邊錄影', 1, INK2, 36, 15);
  rx += VIEWS.sbar(cv.k, 1, 1) + note('依錄影時間；IOL 的姿勢為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNCP_T } };
};
DRAW2['4-4'] = T => {
  const f = footSeg(T, 'iol-final', { at0: T.st(1) - FOOTAGE.videoTime('iol-final', 1118.0) }), L = f.L, op = frozenOp('iol-final', f.tau, 1118.0, 0.35);
  if (T.u < T.st(1)) L.extra = wtext(14, PH - 14, '略過約 1 分半的調整', { size: 14 });
  else L.extra = lab('optic 邊緣', 'optic edge', 14, 64, fpt('iol-final', 'optic-edge', f.tau), { bold: true, color: '#7a4b00', lc: '#ffd34d', op: Math.max(op, T.u > T.st(1) + 2 ? 1 : 0) });
  const st = FIN({}), sv = scope(st, W_SCOPE_N, 'cR'), A = sv.A;
  let rx = '';
  rx += lab('CCC 邊緣', 'rhexis', 14, 64, sv.Q(under(4.6, CN.cccD / 2, 0)), { bold: true, color: '#8a3b12', lc: '#8a3b12', op: T.on(2) });
  rx += lab('optic 邊緣', '6.0 mm', PW - 12, 64, sv.Q(under(7.4, CN.iol.optic / 2, 0)), { side: 'R', bold: true, color: IOLC, lc: IOLC, op: T.on(2) });
  rx += labNear('置中', 'centred', A.iolC, 40, 70, { color: INK2, op: T.on(2) });
  rx += box(PH - 110, '沒蓋到 optic 邊緣：偏位、YAG 較多', T.on(3, 0.6), INK2, 36, 15);
  rx += note('模型的目標狀態（CCC 5.25、optic 6.0 mm）', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_T } };
};
DRAW2['4-5'] = T => {
  const k = T.on(0, 1.6, 0.3), stD = FIN({ iol: { dx: 0.8 * k } });
  const sv = scope(stD, W_SCOPE_N, 'sL');
  let ex = tag('錯誤示範（動畫示意）', 1, WARN);
  // where the rim leaves the optic: the rhexis point farthest from the decentred optic centre
  const IO = K.iolOf(K.norm(stD)); let far = null; for (let h = 0; h < 12; h += 0.25) { const p = under(h, CN.cccD / 2, 0), d = Math.hypot(p[0] - IO.O[0], p[1] - IO.O[1]); if (!far || d > far[0]) far = [d, p]; }
  if (k > 0.5) ex += labNear('這一段沒蓋到 optic', 'exposed edge', sv.Q(far[1]), -20, 90, { bold: true, color: WARN, lc: WARN });
  ex += note('偏 0.8 mm（示意）', 1);
  const ks = T.on(1, 1.2), stS = FIN({ collapse: 0, iol: { sulcus: ks } }), cv = sec(stS, W_CAT, 'cR');
  let rx = tag(ks > 0.1 ? '後 haptic 在 sulcus（示意）' : '同一顆 IOL：切面', 1, ks > 0.1 ? WARN : INK2);
  if (ks > 0.5) { const IOs = K.iolOf(K.norm(stS)), t = IOs.tips[1]; rx += labNear('haptic 在虹膜後、囊袋外', 'sulcus', cv.Q(t), 10, 100, { bold: true, color: WARN, lc: WARN }); }
  rx += box(64, '第一步：hook 撥轉 IOL，haptic 回囊袋', T.on(2, 0.6) * (1 - T.on(3, 0.4)));
  rx += box(64, 'one-piece 不留在 sulcus（30 人系列 93% 再手術）', T.on(3, 0.6), WARN, 36, 14);
  rx += VIEWS.sbar(cv.k, 1, 1) + note('動畫示意；haptic 投影', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: PROJ_T } };
};

// ---------------------------------------------------------------- 5 移除 OVD 與收尾
DRAW2['5-1'] = T => {
  const b = T.p(0, 0.3, 1) * 0.5 + 0.5 * T.p(3, 0, 0.5), f = T.p(3, 0.4, 0.9), st = FIN({ behind: b, front: f, collapse: b, ovd: 1 - f, inst: [IA(T.u < T.st(3) ? P_O1 : P_O2)] });
  const lv = sec(st, W_LENS, 'sL'), A = lv.A, c = K.norm(st);
  let ex = '';
  if (b < 0.9) ex += lab('IOL 後面的 OVD', 'behind the optic', 14, YB, secPt(lv, -2.3, -0.55), { bold: true, color: OVDC, lc: OVDC });
  if (f < 0.9) ex += lab('前房的 OVD', 'in front', PW - 12, 64, secPt(lv, 1.6, 1.5), { side: 'R', color: OVDC, lc: OVDC });
  if (A.tip0) ex += lab('I/A', '', 14, 64, A.tip0, { color: INK2, bold: true });
  if (b > 0.95 && T.on(3) > 0.5) ex += lab('囊袋貼回 IOL', 'bag closed', PW - 12, YB, A.iolC ? [A.iolC[0] + 60, A.iolC[1] + 10] : secPt(lv, 1, 0), { side: 'R', bold: true, color: COL.accent, lc: COL.accent });
  ex += VIEWS.sbar(lv.k, 1, 1) + note('清的順序與量為示意', 1);
  // right: the numbers (Biro 2006: 118 eyes; Auffarth 2004: laboratory)
  const rbox = (y, h, title, rows, op, col = COL.accent) => `<g opacity="${op.toFixed(2)}"><rect x="14" y="${y}" width="${PW - 28}" height="${h}" rx="10" fill="#f7f9fa" stroke="${col}" stroke-width="1.5"/>${text(30, y + 28, title, { size: 16.5, bold: true, color: col })}` +
    rows.map((r, i) => text(30, y + 56 + i * 24, r[0], { size: 14.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  r += rbox(14, 118, '只清前房 vs 連 IOL 後面一起清（118 眼）', [['術後 2–3、6–8、22–24 小時：'], ['只清前房的那組眼壓較高', true], ['（Biro 2006）', false, COL.sub]], T.on(1));
  r += rbox(146, 94, '實驗台（屍眼）', [['壓克力 IOL：optic 後面容易留下 OVD', true], ['（Auffarth 2004）', false, COL.sub]], T.on(2), '#2463eb');
  r += rbox(254, 94, '後面清掉之後', [['囊袋貼回 IOL、前房變深（模型示意）']], T.on(3), INK2);
  return { L: { svg: lv.svg, extra: ex, P: CAT_T }, R: { svg: r, extra: '', P: { title: '為什麼要清 IOL 後面', orient: '' } } };
};
DRAW2['5-2'] = T => {
  const f = footSeg(T, 'ovdout'), L = f.L, st = f.st, cv = sec(st, W_LENS, 'cR'), A = cv.A, c = K.norm(st);
  let rx = '';
  if (c.inst[0] && A.tip0) rx += lab('I/A（主切口）', '', 14, 64, A.tip0, { color: INK2, bold: true });
  if (c.ovdOut.behind < 0.9) rx += lab('IOL 後面的 OVD', 'behind', 14, YB, secPt(cv, -2.3, -0.55), { bold: true, color: OVDC, lc: OVDC });
  else if (c.ovdOut.front < 0.9) rx += lab('前面的 OVD', 'in front', PW - 12, 64, secPt(cv, 1.6, 1.5), { side: 'R', bold: true, color: OVDC, lc: OVDC });
  else rx += lab('囊袋貼回 IOL', 'bag closed', PW - 12, YB, A.iolC ? [A.iolC[0] + 60, A.iolC[1] + 10] : secPt(cv, 1, 0), { side: 'R', bold: true, color: COL.accent, lc: COL.accent });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('依錄影時間；清的順序為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['5-3'] = T => {
  // left: the unhealed incision gaping at its inner aspect (McDonnell 2003); right: stromal hydration closing it (Mifflin 2012), then swab pressing (Liu 2023)
  const gp = T.on(0, 1.2, 0.3), stG = FIN({}), lv = sec({ cat: { ...stG.cat, seal: { gape: gp } } }, W_TUN, 'sL', { step: 0.012 }), A = lv.A;
  let ex = labNear('低眼壓：內口先張開', 'inner gape', A.gapeAt || lv.P([-6.4, -10.9]), -20, 90, { bold: true, color: WARN, lc: WARN, op: gp });
  ex += VIEWS.sbar(lv.k, 1, 1) + note('張開的量為示意', 1);
  const hy = T.p(1, 0.2, 0.9), hyd = { cat: { ...stG.cat, seal: { gape: 1, hydr: hy }, inst: T.u < T.en(1) + 0.3 ? [{ kind: 'hcan', side: 1, f: 0.3 }] : [] } };
  const rv = sec(hyd, W_TUN, 'cR', { step: 0.012 }), B2 = rv.A;
  let rx = '';
  if (T.u < T.st(2)) { if (B2.sealWhite && hy > 0.2) rx += lab('基質變白、腫', 'stromal hydration', PW - 12, 64, B2.sealWhite, { side: 'R', bold: true, color: INK2 });
    if (B2.tip0) rx += lab('27G cannula（投影）', '', 14, 112, B2.tip0, { color: INK2 }); }
  rx += box(PH - 154, 'Swab pressing：器械一退出就壓住切口', T.on(2, 0.6), COL.accent, 36, 15);
  rx += box(PH - 110, '126 眼 RCT：閉合 96.8% vs 93.7%；前房塌陷 0 vs 35 眼', T.on(3, 0.6), '#2463eb', 36, 14);
  rx += VIEWS.sbar(rv.k, 1, 1) + note('變白的範圍為示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: TUN_T }, R: { svg: rv.svg, extra: rx, P: TUN_T } };
};
DRAW2['5-4'] = T => {
  const f = footSeg(T, 'swab', { at0: 0.3 }), L = f.L, op = frozenOp('swab', f.tau, 1176.0);
  L.extra = (op > 0 ? labNear('棉棒', 'swab', fpt('swab', 'swab', f.tau), 60, -110, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) : '') +
    (T.u > T.st(1) ? wtext(14, PH - 14, '本例接著縫合主切口：略過', { size: 14 }) : '');
  const st = f.st, tv = sec(st, W_TUN, 'cR', { step: 0.012 }), A = tv.A, c = K.norm(st);
  let rx = '';
  if (c.seal && c.seal.gape > 0.3) rx += labNear('I/A 退出：內口張開', 'gape', A.gapeAt || A.mainInt, -20, 90, { bold: true, color: WARN, lc: WARN });
  else if (c.seal) rx += labNear('壓住後兩唇貼合（示意）', '', A.mainInt, -20, 90, { bold: true, color: COL.accent, lc: COL.accent });
  rx += box(64, '確認：前房深、切口不漏（院內常規）', T.on(2, 0.6), INK2, 36, 15);
  rx += VIEWS.sbar(tv.k, 1, 1) + note('依錄影時間；張開的量為示意', 1);
  return { L, R: { svg: tv.svg, extra: rx, P: TUNS_T } };
};

// ---------------------------------------------------------------- 6 練習清單
DRAW2['7'] = T => {
  const bx = (x, y, w, h, title, rows, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="#d3dae1"/>${text(x + 20, y + 36, title, { size: 19, bold: true, color: COL.accent })}` +
    rows.map((r, i) => text(x + 20, y + 76 + i * 34, r[0], { size: 16.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += bx(20, 20, 560, 300, '為什麼要先練', [['I/A：自評 2.80／5、完成率 78.4%'], ['放 IOL：2.58／5、83.1%'], ['（Dooley 2006）', false, COL.sub], ['訓練系列：吸皮質時 PCR 2.8%'], ['（Suryawanshi 2016）', false, COL.sub]], T.on(0));
  const items = [['一', '吸口朝上，在邊緣下夾住、拉到中央再吸'], ['二', '主切口下方換角度：彎頭、雙手 I/A、hydro-dispersion'], ['三', '看到皺褶：腳退回 1 段'], ['四', 'IOL 置中、CCC 蓋住 optic；optic 後面的 OVD 也清']];
  o += `<g opacity="${T.on(2)}"><rect x="600" y="20" width="610" height="${PH - 40}" rx="10" fill="#f7f9fa" stroke="${COL.accent}" stroke-width="2"/>${text(620, 56, 'Wet lab／模擬器：上刀前練這四件事', { size: 19, bold: true, color: COL.accent })}</g>`;
  items.forEach(([n, s], i) => { const k = i === 0 ? T.on(2) : i < 3 ? T.on(3) : T.on(4);
    const cut = s.indexOf('：') > 0 && s.length > 18 ? s.indexOf('：') + 1 : s.indexOf('；') > 0 ? s.indexOf('；') + 1 : -1, parts = cut > 0 ? [s.slice(0, cut), s.slice(cut)] : [s];
    o += `<g opacity="${k}"><circle cx="642" cy="${110 + i * 80}" r="18" fill="${COL.accent}"/>${text(642, 116 + i * 80, n, { size: 17, bold: true, color: '#fff', anchor: 'middle' })}` +
      parts.map((p, j) => text(674, 116 + i * 80 + j * 26, p, { size: 18, bold: j === 0 })).join('') + `</g>`; });
  return { F: { svg: o, extra: '', P: { title: '練習清單', orient: '' } } };
};
