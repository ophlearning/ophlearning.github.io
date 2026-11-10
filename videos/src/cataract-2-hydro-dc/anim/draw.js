// ============================================================================
// Drawing of every segment of video ② (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full) / { R } (title):
// { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Left: case A footage (術者視角, footage.js) or the model's microscope view; right: the globe model (videos/models/globe/cataract.js) — a
// meridional section (12–6 through the main incision, or through the hydrodissection site) or a cross-section across the groove — driven by the
// SAME footage clock: every model state in a footage segment is a function of the source time of the frame on screen (caseAt(s)), so both
// panels show the same moment. The machine panel (pedal 0–3, flow, vacuum, ultrasound, chamber depth; globe/fluidics.js) is 示意.
// Case parameters: params.js (CASE). Model numbers and sources: videos/models/globe/CARD.md 白內障 ②.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, K = CATARACT, G = GLOBE, FL = FLUIDICS;
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op = 1, col = COL.accent, y = 34, x = PW / 2) => htext(x, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.6) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const arrowH = (a, b, col, mk, w = 3.2, op = 1) => `<g opacity="${op}"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#fff" stroke-width="${w + 3}" stroke-linecap="round" opacity="0.85"/>${arrow(a, b, col, 1, mk, w)}</g>`;
const dot5 = (p, col, r = 4.5) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
const wtext = (x, y, s, o = {}) => htext(x, y, s, { size: 15, bold: true, color: '#fff', ...o }).replace('stroke="#fff"', 'stroke="#1d2733"');   // white text on footage
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// a label whose leader starts dx, dy px from its anchor (the text left of that point when dx < 0, right of it otherwise)
const labNear = (zh, en, a, dx, dy, o = {}) => { const w = lw(zh, en, o), x = a[0] + dx, y = a[1] + dy + (o.size || 15) * 0.36;
  return dx < 0 ? lab(zh, en, x - w - 7, y, a, o) : lab(zh, en, x + w + 7, y, a, { ...o, side: 'R' }); };
const YB = PH - 48;
const BSS = '#1f6f9c', WARN = '#b3262c', BROWN = '#8a3b12', CAP = '#1d5d93', OVDC = '#6a5a9a', NUC = '#7a5418';

// ---------------------------------------------------------------- case states (params.js) and views
const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 };
const HP = (CASE.main.h + 6) % 12;                       // meridian through the main incision: left = main incision (11 o'clock-ish), right = 5 o'clock-ish
const XH = ((CASE.grooveH - 3) % 12 + 12) % 12;          // cross-section across the groove, seen from the incision: right = temporal (8 o'clock-ish)
const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
const BASE = { main: MAIN, side: SIDE, ccc: CCC };
const W_CAT = { x: -8.6, y: -14.5, w: 17.2 }, W_LENS = { x: -6.4, y: -12.7, w: 12.8 }, W_X = { x: -4.5, y: -11.0, w: 9.0 }, W_TUN = { x: -8.3, y: -13.3, w: 6.2 };
const W_SCOPE = { x: -6.0, y: -4.06, w: 12 }, W_SCOPE_N = { x: -4.6, y: -3.11, w: 9.2 };
// hydrodissection microscope view: wide enough (14 mm) to show the main incision the cannula comes through and the rim opposite it
const W_SCOPE_H = { x: -7.0, y: -3.5, w: 14 };
// cross-section of the main tunnel (plane across the main-incision meridian, 4.75 mm from the centre: half way along the tunnel)
const TUN_OFF = 4.75, W_TUNX = { x: -3.2, y: -12.75, w: 6.4 };
const CAT_T = { title: '經主切口的切面（模型）', orient: '左＝主切口（11 點多）　上＝前' };
const SYNC_T = { title: '經主切口的切面（模型，依錄影時間）', orient: '左＝主切口　上＝前' };
const X_T = { title: '垂直槽的橫切面（模型）', orient: '從切口看　右＝temporal　上＝前' };
const XSYNC_T = { title: '垂直槽的橫切面（模型，依錄影時間）', orient: '從切口看　右＝temporal' };
const SCOPE_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝temporal' };
const SCOPE_SYNC_T = { title: '術者視角（模型，依錄影時間）', orient: '下＝12 點　右＝temporal' };
const TUN_T = { title: '主切口隧道的橫切面（模型）', orient: '從切口看　右＝temporal　上＝前' };
const SCOPE_DEMO_T = { title: '術者視角　右眼 OD（模型示範）', orient: '下＝12 點　右＝temporal' };
const X2_T = { title: '垂直第二道槽的橫切面（模型）', orient: '從切口看　右＝temporal' };
const X2SYNC_T = { title: '垂直第二道槽的橫切面（模型，依錄影時間）', orient: '從切口看　右＝temporal' };
const HYT = h => ({ title: `經注水點的切面（模型）`, orient: `右＝注水點（約 ${Math.round(h)} 點）　上＝前` });
const PCT = (n, h) => ({ title: `經第 ${n} 塊的切面（模型，依錄影時間）`, orient: `右＝第 ${n} 塊原本的位置（約 ${Math.round(h) || 12} 點）` });
const MACH_T = { title: '腳踏與機器（示意）', orient: '數字依院內機器設定' };
window.PRELOAD_EXTRA = JSON.stringify([CAT_T, SYNC_T, X_T, XSYNC_T, SCOPE_T, SCOPE_SYNC_T, TUN_T, SCOPE_DEMO_T, X2_T, X2SYNC_T, HYT(8), HYT(2), PCT(1, 6), MACH_T]) +
  '經注水點的切面右＝注水點約點上＝前0123456789切面不畫cannula經主切口不在這個切面上俯視模型虛線＝切面腳踏灌流抽吸流量vacuum超音波前房深度不動＋示意依動作推定刻槽移除核塊' +
  '第塊原本的位置大塊看不清楚側鼻溫器械姿勢標準遠端近端這一格錄影推核轉了方向往前推進再分開一次熱水流有沒有堵住針頭矽膠套切口唇變熱帶走往眼內外';

const isPt = v => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number';
// anchors to panel px: points, and pairs of points (e.g. a crack line [top, bottom] in a section)
const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (isPt(v)) r[n] = P(v); else if (Array.isArray(v) && v.length === 2 && isPt(v[0]) && isPt(v[1])) r[n] = v.map(P); return r; };
function sec(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = K.section({ st, h: o.hp ?? HP, off: o.off || 0, cut: !!o.cut, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 260).toFixed(4), id });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id) {
  const c = VIEWS.cam(win, PW, PH), r = K.enface({ st, id, surgeon: 12 }), A = mapA(r.A, c.P);
  for (const n of ['grooveEnd', 'grooveEnd2', 'crackEnds', 'crackEnds2']) if (r.A[n]) A[n] = r.A[n].map(c.P);
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A, P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
// the model's microscope view drawn into a box of a panel (box px; win mm of the scope map)
function scopeBox(st, win, id, box) {
  const c = VIEWS.cam(win, box.w, box.h), r = K.enface({ st, id, surgeon: 12 }), P = p => { const q = c.P(p); return [q[0] + box.x, q[1] + box.y]; };
  return { svg: `<clipPath id="${id}_bx"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"/></clipPath><g clip-path="url(#${id}_bx)"><g transform="translate(${box.x} ${box.y}) ${c.tf}">${r.svg}</g></g>`,
    A: mapA(r.A, P), P, k: c.k, r, Q: p3 => P(r.M(p3)) };
}
const L0 = K.LENS;
// a point on an instrument's shaft d mm behind its tip (panel px of view v): a label anchor beside the instrument, not at its far end
const shaftPt = (v, g, d) => v.Q([g.tip[0] + g.axis[0] * d, g.tip[1] + g.axis[1] * d, g.tip[2] + g.axis[2] * d]);
const onShaft = (v, st, i, yT) => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]), o = g.bend || g.tip; let best = null;
  for (let s = 0; s <= 14; s += 0.1) { const q = v.Q([o[0] + g.axis[0] * s, o[1] + g.axis[1] * s, o[2] + g.axis[2] * s]); if (q[0] > 20 && q[0] < PW - 20 && q[1] > 20 && q[1] < PH - 20 && (!best || Math.abs(q[1] - yT) < Math.abs(best[1] - yT))) best = q; }
  return best; };
// an inset microscope view (top left of a section panel) with the section's footprint (dashed) — the instruments are drawn here when the
// section does not contain the incision they come through
const BOX_TL = { x: 10, y: 10, w: 150, h: 150 }, W_INSET = { x: -6.6, y: -6.6, w: 13.2 };
function inset(st, hp, u0, u1, box, id, cap = '虛線＝切面', off = 0) {
  // off: the section plane's offset (GLOBE meridian(h, off): along [cy, −cx] of clockDir(h))
  const v = scopeBox(st, W_INSET, id, box), d = G.clockDir(hp), sd = [d[1], -d[0]], q = u => { const x = d[0] * u + sd[0] * off, y = d[1] * u + sd[1] * off;
    return v.Q([x, y, L0.zAnt(Math.min(Math.hypot(x, y), L0.Req - 1e-6))]); }, a = q(u0), b = q(u1);
  let o = `<rect x="${box.x - 2}" y="${box.y - 2}" width="${box.w + 4}" height="${box.h + 4}" rx="4" fill="#fff"/>` + v.svg;
  o += `<g clip-path="url(#${id}_bx)"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#fff" stroke-width="4.5" opacity="0.85"/>` +
    `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#1d2733" stroke-width="2" stroke-dasharray="5 3"/></g>`;
  o += `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="none" stroke="#9aa6b1" stroke-width="1.2"/>`;
  o += htext(box.x + 6, box.y + 16, '俯視（模型）', { size: 12, bold: true, color: '#1d2733' }) + htext(box.x + 6, box.y + box.h - 7, cap, { size: 12, bold: true, color: '#1d2733' });
  return o;
}
// a point on the hydrodissection wave front in the microscope view: along the injection meridian, the first crossing seen from the far side
// (the same arrival order the model's front contour is drawn from)
function waveAt(v, st) {
  const c = K.norm(st), H = K.hydroOf(c); if (!H || !(H.hy.prog > 0)) return null; const a = G.clockDir(H.hy.h + 2); let prev = null;
  for (let u = -L0.Req + 0.02; u < L0.Req - 0.02; u += 0.02) { const f = H.tau(K.postIdx(Math.abs(u)), H.phiOf(a[0] * u, a[1] * u)) - H.hy.prog;
    if (prev !== null && isFinite(f) && isFinite(prev) && (prev > 0) !== (f > 0)) return v.Q([a[0] * u, a[1] * u, 0]); prev = f; }
  return null;
}
// a light streak along each straight part of a fine round instrument in the microscope view: the model draws its true width (27G = 0.41 mm),
// the streak makes it read as a thin tube rather than a flat bar
function tubeHL(v, st, i) {
  const c = K.norm(st), g = K.instGeom(c, c.inst[i]); let s = '';
  for (const sg of g.segs) { const a = v.Q(sg.a), b = v.Q(sg.b), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, n = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l], w = 2 * sg.r * v.k, o = w * 0.2;
    s += `<path d="M${(a[0] + n[0] * o).toFixed(1)} ${(a[1] + n[1] * o).toFixed(1)}L${(b[0] + n[0] * o).toFixed(1)} ${(b[1] + n[1] * o).toFixed(1)}" stroke="#fff" stroke-width="${(w * 0.26).toFixed(2)}" stroke-linecap="round" opacity="0.8"/>`; }
  return s;
}

// ---------------------------------------------------------------- the machine panel (globe/fluidics.js; 示意，依院內機器設定)
// F = FL.state(...) plus o.pos (pedal position shown 0–3). Bars, no numbers: the numbers are the hospital's settings.
function machine(x, y, w, F, o = {}) {
  const pos = o.pos ?? (F.pedal > 2 ? 3 : Math.floor(F.pedal + 1e-9)), z = o.big ? 1.3 : 1, rows = o.rows || ['irr', 'flow', 'vac', 'us', 'ac'];
  const bh = 34 * z, rh = 15 * z, h = o.h || (34 + bh + 12 + rows.length * rh + 6);
  let s = `<g class="mach"><rect x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" rx="8" fill="#f7f9fa" stroke="#c9d2db" opacity="0.97"/>`;
  s += text(x + 10, y + 19 * z, o.title || '腳踏（示意）', { size: 13 * z, bold: true, color: '#3c4a57' });
  const bw = (w - 20 - 3 * 6) / 4, names = ['不動', '灌流', '＋抽吸', '＋超音波'], by = y + 26 * z;
  for (let i = 0; i < 4; i++) { const bx = x + 10 + i * (bw + 6), on = i === pos;
    s += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="5" fill="${on ? COL.accent : '#fff'}" stroke="${on ? COL.accent : '#c3ccd5'}"/>` +
      text(bx + bw / 2, by + 15 * z, String(i), { size: 14 * z, bold: true, color: on ? '#fff' : COL.sub, anchor: 'middle' }) + text(bx + bw / 2, by + 29 * z, names[i], { size: 11 * z, color: on ? '#fff' : COL.sub, anchor: 'middle' }); }
  const val = { irr: F.irr ? 1 : 0, flow: F.flow / 30, vac: F.vac / 450, us: F.us / 50, ac: 1 - F.dip }, nm = { irr: '灌流', flow: '抽吸流量', vac: 'vacuum', us: '超音波', ac: '前房深度' };
  const colr = { irr: BSS, flow: OVDC, vac: '#5b3fa0', us: '#c46a12', ac: CAP };
  rows.forEach((k, i) => { const ry = by + bh + 12 + i * rh, v = Math.max(0, Math.min(1, val[k])), bx = x + 78 * z, bl = w - 88 * z;
    s += text(x + 10, ry + 9 * z, nm[k], { size: 11 * z, color: '#3c4a57' }) + `<rect x="${bx}" y="${ry.toFixed(1)}" width="${bl}" height="${(9 * z).toFixed(1)}" rx="4" fill="#e3e8ed"/><rect x="${bx}" y="${ry.toFixed(1)}" width="${(bl * v).toFixed(1)}" height="${(9 * z).toFixed(1)}" rx="4" fill="${colr[k]}"/>`; });
  return s + '</g>';
}

// ---------------------------------------------------------------- nucleus states
const nucS = o => ({ groove: { h: CASE.grooveH, dep: o.dep ?? CASE.groove.dep, over: o.over || 0 }, ...(o.crack ? { crack: o.crack } : {}), rot: o.rot || 0,
  ...(o.dep2 !== undefined ? { groove2: { dep: o.dep2 } } : {}), ...(o.crack2 ? { crack2: o.crack2 } : {}), quads: o.quads || [] });
const DIVIDED = q => nucS({ crack: { prog: 1, sep: 0.5 }, dep2: CASE.groove.dep, crack2: { prog: 1, sep: 0.5 }, rot: q.rot, quads: q.quads });
// the phaco needle at a point of groove 1 (a mm along the axis, + toward the incision), hz mm above the floor
const gPt = (st, a, b = 0, hz = 0, k = 1) => K.groovePt(st, k, a, b, hz);
// the cracking pose in groove k: phaco and chopper on opposite walls at the groove's far end (where the chopper reaches the floor; 示意)
const crackTools = (st, k = 1) => { const N = K.nucOf(K.norm(st)), G0 = k === 2 ? N.g2 : N.g1; return [gPt(st, -1.0, G0.hw - 0.47, 0.45, k), gPt(st, -1.0, -(G0.hw - 0.2), 0.4, k)]; };
// phaco state: bevel up, occlusion
const PHACO = (p, o = {}) => ({ kind: 'phaco', via: 'main', p, bevel: o.bevel || 'up', occl: o.occl || 0 });
const CHOP = p => ({ kind: 'chopper', via: 'side', p });

// ---------------------------------------------------------------- footage clock → model state
const EVS = (() => { const o = {}; for (const c of Object.values(FOOTAGE_DEF.clips)) Object.assign(o, c.events || {}); return o; })();
const ev = n => { if (EVS[n] === undefined) throw new Error('no footage event ' + n); return EVS[n]; };
const pw = (keys, s) => { if (s <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (s <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return va + (vb - va) * ss(a, b, s); } return keys[keys.length - 1][1]; };
// the hydrodissection pass at source time s (its clock hour from params.js) and the wave's progress
function hydroAt(s) {
  for (const H of CASE.hydro) { const a = ev(`hydro${H.pass}-in`), b = ev(`hydro${H.pass}-out`);
    if (s >= a - 0.5 && s <= b + 0.5) { const p0 = H.pass === 1 ? ev('tip-under-rim') : a + 1.5, p1 = H.pass === 1 ? ev('ring-full') : b - 1.5;
      return { pass: H.pass, h: H.h, prog: ss(p0, p1, s), inEye: s >= a && s <= b }; } }
  return null;
}
// quadrant removal of case A, tied to the footage (anim/footage.js 'quads'): piece n starts at the footage's piece<n> event and is gone when the
// footage shows the red reflex where it was (reflex-<n>; piece 3: one second before piece 4 starts — its reflex is not readable). Each piece
// comes out where it lies (no turning between pieces): CASE.pieceQ maps it to the model quadrant whose clock position matches the footage
// (pieces 1, 2, 4 measured; piece 3 not readable → the remaining quadrant; check.js compares them). Quadrant q's clock in the eye after the 90° turn:
const ROT_Q = 90, qHour = q => ((CASE.grooveH + 1.5 + 3 * q + ROT_Q / 30) % 12 + 12) % 12;
const PIECES = [1, 2, 3, 4].map(i => ({ n: i, t0: ev(`piece${i}`), tg: EVS[`reflex-${i}`] ?? (i < 4 ? ev(`piece${i + 1}`) - 1 : ev('chopper-out') - 6), q: CASE.pieceQ[i - 1] }));
function quadsAt(s) {
  const quads = []; let cur = -1, last = -1;
  PIECES.forEach((P, i) => { const pull = ss(P.t0, P.t0 + 3, s), eat = ss(P.t0 + 3, P.tg, s); if (pull > 0 || eat > 0) quads.push({ q: P.q, pull, eat });
    if (s >= P.t0) last = i; if (s >= P.t0 && s < P.tg) cur = i; });
  return { quads, rot: ROT_Q, cur, last };
}
// model state of case A at source time s; view: which panel the moment needs
function caseAt(s) {
  const c = { ...BASE, ovd: s < ev('phaco-in') ? 1 : 0, inst: [] };
  const hy = hydroAt(s);
  if (s < ev('phaco-in')) {
    // hydrodissection (no nucleus work yet). The wave of the latest pass stays released afterwards (prog 1, press 1)
    if (hy) { c.hydro = { h: hy.h, prog: hy.prog, press: 0 }; if (hy.inEye) c.inst.push({ kind: 'cannula', via: 'main', at: { h: hy.h, r: 2.95, lift: -0.03 }, bend: true }); }
    return { cat: c, hy };
  }
  const dep = CASE.groove.dep * ss(ev('sculpt-start'), ev('sculpt-end'), s);
  const crack = s >= ev('crack-start') ? { prog: ss(ev('crack-start'), ev('gap-open'), s), sep: 0.5 * ss(ev('gap-open'), ev('gap-open') + 1.5, s) } : null;
  const rot = 90 * ss(ev('turn-start'), ev('turn-end'), s);
  const dep2 = s >= ev('groove2-start') ? CASE.groove.dep * ss(ev('groove2-start'), ev('groove2-end'), s) : undefined;
  const crack2 = s >= ev('crack2-start') ? { prog: ss(ev('crack2-start'), ev('crack2-end') - 1, s), sep: 0.5 * ss(ev('crack2-end') - 1, ev('crack2-end'), s) } : null;
  let nuc;
  if (s < ev('piece1') - 1) nuc = nucS({ dep, crack, rot, dep2, crack2 });
  else { const Q = quadsAt(s); nuc = DIVIDED({ rot: Q.rot, quads: Q.quads }); }
  c.nuc = nuc;
  const phIn = s >= ev('phaco-in') && s <= ev('phaco-out'), chIn = s >= ev('chopper-in') && s <= ev('chopper-out');
  const st = { cat: c };
  const rest = K.capPt(K.norm(st), 1.5, CASE.main.h, 0.6), lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const crackPose = k => crackTools(st, k);
  const stroke = (k, t0) => { const ph = 0.5 - 0.5 * Math.cos(2 * Math.PI * (s - t0) / 4); return lerp3(gPt(st, 1.2, 0, 0.9, k), K.grooveTip(st, k), ph); };   // strokes every 4 s from the proximal end (示意)
  const Q = s >= ev('piece1') - 1 ? quadsAt(s) : null;
  if (phIn) {
    let p;
    if (s < ev('sculpt-start')) p = rest;
    else if (s <= ev('sculpt-end') + 1) p = stroke(1, ev('sculpt-start'));
    else if (s < ev('turn-end')) p = crackPose(1)[0];                                   // cracking, then holding while the nucleus turns
    else if (s < ev('groove2-start')) p = rest;
    else if (s <= ev('groove2-end') + 1) p = stroke(2, ev('groove2-start'));            // the second groove (not clearly visible in the footage: 示意)
    else if (s < ev('piece1') - 1) p = s >= ev('crack2-start') ? crackPose(2)[0] : rest;
    else { const P = Q.cur >= 0 ? PIECES[Q.cur] : null, cq = P ? c.nuc.quads.find(e => e.q === P.q) : null;
      p = cq && cq.eat < 1 ? K.quadTip(st, P.q) : K.capPt(K.norm(st), 0.5, CASE.main.h, -0.8); }
    if (s >= ev('phaco-out') - 1.5) p = lerp3(p, K.capPt(K.norm(st), 3.8, CASE.main.h, 1.0), ss(ev('phaco-out') - 1.5, ev('phaco-out'), s));
    c.inst.push(PHACO(p, { bevel: s >= ev('piece1') - 1 ? 'down' : 'up', occl: s >= ev('piece1') - 1 ? 1 : 0 }));
  }
  if (chIn) {   // the chopper: cracking pose in the groove; resting above the nasal half; beside the piece being removed, pushing it in (示意)
    const restC = K.capPt(K.norm(st), 1.8, CASE.side.h, 0.8);
    let p = null;
    if (s < ev('turn-end')) p = crackPose(1)[1];
    else if (s < ev('crack2-start')) p = restC;
    else if (s < ev('piece1') - 1) p = crackPose(2)[1];
    else { const P = Q.cur >= 0 ? PIECES[Q.cur] : null, cq = P ? c.nuc.quads.find(e => e.q === P.q) : null;
      p = cq && cq.eat < 1 ? K.capPt(K.norm(st), lerp(2.6, 1.6, cq.pull), qHour(P.q), 0.4) : restC; }
    if (p) c.inst.push(CHOP(p));
  }
  return { cat: c, hy };
}
// footage panel + the synced model state; at0 = when the clip starts in the segment
function footSeg(T, clip, o = {}) {
  const tau = T.u - (o.at0 ?? 0.3), L = FOOTAGE.panel(clip, tau, { badge: o.badge }), st = caseAt(L.s);
  return { tau, L, st, s: L.s };
}
const fpt = (clip, name, tau) => FOOTAGE.point(clip, name, tau);
const frozenOp = (clip, tau, at, d = 0.35) => { const f = (FOOTAGE_DEF.clips[clip].freeze || []).find(z => z.at === at); if (!f) return 0; const a = FOOTAGE.videoTime(clip, at); return ss(a, a + d, tau) * (1 - ss(a + f.dur - d, a + f.dur, tau)); };
// for check.js: the model state the right panel draws at source time s (same function the segments use)
window.CASE_AT = s => { const z = caseAt(s); return { st: z.st || { cat: z.cat }, hy: z.hy }; };

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const R = FOOTAGE.panel('title', 0, { badge: false });
  R.extra = wtext(14, PH - 14, '案例 A：刻槽中（錄影 6:06）', { size: 14 });
  return { R };
};

// ---------------------------------------------------------------- 1 Hydrodissection
// model demonstration: injected opposite the main incision, so the cannula lies in the main-incision section
const hyDemo = (prog, o = {}) => { const h = o.h ?? CASE.hydroDemo; return { cat: { ...BASE, ovd: 1, hydro: { h, prog, press: o.press || 0, block: o.block || 0 },
  inst: o.noInst ? [] : [{ kind: 'cannula', via: 'main', at: o.at || { h, r: 2.95, lift: -0.03 }, bend: true }] } }; };
DRAW2['1-1'] = T => {
  const prog = 0.08 + 0.5 * T.p(2, 0, 1) + 0.3 * T.p(3, 0, 0.8), st = hyDemo(prog);
  // the 14 mm window shows the main incision; the cannula is drawn at its true width (27G, 0.41 mm: compare the 1 mm bar)
  const sv = scope(st, W_SCOPE_H, 'sL'), A = sv.A;
  let ex = labNear('cannula 經主切口', '', A.mainInt, 40, -36, { color: '#3c4a57', op: T.on(1) });
  const wf = prog > 0.12 ? waveAt(sv, st) : null;
  if (wf) ex += labNear('波前', 'fluid wave', wf, -40, wf[1] < 150 ? 60 : -50, { bold: true, color: WARN, lc: WARN, op: T.on(3) });
  ex += VIEWS.sbar(sv.k, 1, 1) + note('波的速度為示意', 1);
  const cv = sec(st, W_LENS, 'cR'), B = cv.A;
  let rx = lab('cannula 在撕囊邊緣下', '', PW - 12, 64, B.tip0, { side: 'R', bold: true, color: '#3c4a57', op: T.on(1) });
  if (B.fluidEq) rx += labNear('BSS 在囊與皮質之間', '', B.fluidEq, -30, 70, { bold: true, color: BSS, lc: BSS, op: T.on(2) });
  rx += labNear('核', 'nucleus', cv.P([-2.2, -L0.zMid]), -40, -40, {});
  rx += lab('後囊', 'posterior capsule', 14, YB - 30, B.postPole, { color: CAP, lc: CAP, op: T.on(2) });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('液體層畫成 0.15 mm（示意）', 1);
  return { L: { svg: sv.svg + tubeHL(sv, st, 0), extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
// right panel during a footage hydrodissection pass: the section through the injection site (the cannula comes through the main incision,
// which is not in that plane: it is drawn in the inset only)
function hydroR(f, o = {}) {
  const hy = f.st.hy, h = hy ? hy.h : CASE.hydro[0].h, st = { cat: { ...f.st.cat, inst: [] } };
  const cv = sec(st, W_LENS, 'cR', { hp: h }), B = cv.A;
  let svg = cv.svg + inset(f.st.cat.hydro ? { cat: f.st.cat } : st, h, W_LENS.x, W_LENS.x + W_LENS.w, BOX_TL, 'iR');
  let ex = '';
  if (B.fluidEq && f.st.cat.hydro && f.st.cat.hydro.prog > 0.05) ex += labNear('BSS 在囊與皮質之間', '', B.fluidEq, -30, 70, { bold: true, color: BSS, lc: BSS });
  ex += labNear('核', 'nucleus', cv.P([-2.2, -L0.zMid]), -40, -40, {});
  ex += VIEWS.sbar(cv.k, 1, 1, PH) + note(o.note || '切面不畫 cannula（經主切口，不在這個切面上）', 1);
  return { svg, extra: ex + (o.extra || ''), P: HYT(h) };
}
DRAW2['1-2'] = T => {
  const f = footSeg(T, 'hydro1', { at0: T.st(2) - FOOTAGE.videoTime('hydro1', 323.9) }), L = f.L;   // the ring freeze at line 2
  const opT = frozenOp('hydro1', f.tau, 320.5), opR = frozenOp('hydro1', f.tau, 323.9);
  let ex = '';
  if (opT > 0) ex += labNear('cannula 尖端在撕囊邊緣下', '', fpt('hydro1', 'cannula-tip', f.tau), -40, -40, { bold: true, op: opT });
  if (opR > 0) ex += labNear('金色的環', 'golden ring', fpt('hydro1', 'ring', f.tau), 40, -110, { bold: true, color: '#7a4b00', lc: '#ffd34d', op: opR });
  L.extra = ex;
  return { L, R: hydroR(f, { note: '模型畫 hydrodissection 的液體層；切面不畫 cannula' }) };
};
// lines 1–3 of 1-3: the standard steps on the model (示意; the footage cannot show them): the tip goes from under the rim to the centre and
// presses (fluid released over the rhexis rim), a second injection under the rim elsewhere (where case A's third pass was), then the tip pushes
// the nucleus edge round. Both panels draw this same state (left: microscope view; right: the main-incision section).
function demo13(T) {
  const kIn = T.p(1, 0.0, 0.3), press = T.p(1, 0.35, 0.95), k2 = T.p(2, 0.05, 0.45), kR = T.p(2, 0.5, 0.95), H2 = CASE.hydro[2].h;
  if (T.u < T.st(2)) return { ph: 1, press, st: hyDemo(1, { press, at: { h: CASE.hydroDemo, r: lerp(2.95, 0.15, kIn), lift: lerp(-0.03, 0, kIn) } }) };
  if (kR <= 0) return { ph: 2, st: hyDemo(k2, { h: H2, at: { h: H2, r: 2.95, lift: -0.03 } }) };
  return { ph: 3, kR, st: hyDemo(1, { h: H2, at: { h: lerp(2.9, 3.9, kR), r: 2.2, lift: 0 } }) };
}
DRAW2['1-3'] = T => {
  const f = footSeg(T, 'hydro23'), k1 = T.on(1, 0.8, -0.3), tEnd = 0.3 + FOOTAGE.videoTime('hydro23', FOOTAGE_DEF.clips.hydro23.out);
  if (k1 < 0.5) return { L: f.L, R: hydroR(f) };
  const D = demo13(T), st = D.st;
  // left: the footage until the clip ends (no long freeze), then the model's microscope view of the same demonstration
  let L = f.L;
  if (T.u >= tEnd) { const sv = scope(st, W_SCOPE_H, 'sL'), A = sv.A; let svg = sv.svg + tubeHL(sv, st, 0), ex = '';
    if (D.ph === 1) ex += labNear('輕壓中央', 'press', A.tip0, -50, -50, { bold: true, color: COL.accent, lc: COL.accent, op: ss(0.3, 0.6, D.press) });
    if (D.ph === 2) ex += labNear('換一處再打', '', A.tip0, 40, 50, { bold: true, color: BSS, lc: BSS });
    if (D.ph === 3) { const pts = []; for (let h = 2.5; h <= 2.5 + 1.7 * D.kR + 1e-6; h += 0.1) { const d = G.clockDir(h); pts.push(sv.Q([d[0] * 2.75, d[1] * 2.75, 0])); }
      if (pts.length > 1) svg += `<path d="${pathOf(pts)}" fill="none" stroke="#fff" stroke-width="6" opacity="0.7"/><path d="${pathOf(pts)}" fill="none" stroke="#ffd34d" stroke-width="3.2" marker-end="url(#arrM)"/>`;
      ex += labNear('推核：轉得動', 'rotate', pts[0], 30, 60, { bold: true, color: '#7a4b00', lc: '#b86e00' }); }
    ex += tag('模型示範：標準做法', 1, COL.accent) + VIEWS.sbar(sv.k, 1, 1) + note('壓與推的力量為示意', 1);
    L = { svg, extra: ex, P: SCOPE_DEMO_T }; }
  // right: the main-incision section; the cannula is in this plane only while it presses the centre (line 1)
  const stR = D.ph === 1 ? st : { cat: { ...st.cat, inst: [] } }, cv = sec(stR, W_LENS, 'cR'), B = cv.A;
  let svg = cv.svg, ex = '';
  const opP = D.ph === 1 ? ss(0.0, 0.25, D.press) : 0;
  if (opP > 0 && B.tip0) { const c1 = [B.tip0[0], B.tip0[1] - 14], c0 = [B.tip0[0], B.tip0[1] - 74]; svg += `<g opacity="${opP.toFixed(2)}">${arrowH(c0, c1, COL.accent, 'arrA', 3.4)}</g>`;
    ex += labNear('輕壓中央', 'press', c0, -40, -10, { bold: true, color: COL.accent, lc: COL.accent, op: opP }); }
  if (D.ph === 1 && cv.r.A['release+']) ex += lab('液體排到前房', '', PW - 12, 64, cv.P(cv.r.A['release+']), { side: 'R', bold: true, color: BSS, lc: BSS, op: ss(0.3, 0.7, D.press) });
  if (D.ph >= 2 && B.fluidEq && st.cat.hydro.prog > 0.1) ex += labNear('第二處：液體再繞一圈', '', B.fluidEq, -30, 70, { bold: true, color: BSS, lc: BSS });
  ex += tag('模型示範：標準做法', 1, COL.accent, 34, PW / 2 + 40) + VIEWS.sbar(cv.k, 1, 1) + note(D.ph === 1 ? '壓的力量與液體的路徑為示意' : '切面不畫 cannula（不在這個切面上）', 1);
  return { L, R: { svg, extra: ex, P: CAT_T } };
};
DRAW2['1-4'] = T => {
  // routine (pressed, fluid out) | capsular block (示意), the same section through the injection site
  const k = T.on(0, 2.0, 0.3), stN = hyDemo(1, { press: k, noInst: true }), stB = hyDemo(1, { block: k, noInst: true });
  const lv = sec(stN, W_LENS, 'sL'), rv = sec(stB, W_LENS, 'cR'), A = lv.A, B = rv.A;
  const s0 = sec(hyDemo(0, { noInst: true }), W_LENS, 'x0');
  let ex = tag('壓中央：液體排出', 1, COL.accent) + labNear('核在原位', '', A.antPole, -40, -60, {});
  if (A['release+']) ex += lab('液體排到前房', '', PW - 12, 64, lv.P(lv.r.A['release+']), { side: 'R', color: BSS, lc: BSS, bold: true, op: ss(0.4, 0.9, k) });
  ex += VIEWS.sbar(lv.k, 1, 1) + note('壓的力量為示意', 1);
  const post0 = s0.A.postPole;
  let rsv = rv.svg + `<path d="M${(post0[0] - 70).toFixed(1)} ${post0[1].toFixed(1)}H${(post0[0] + 70).toFixed(1)}" stroke="${WARN}" stroke-width="1.6" stroke-dasharray="5 4" opacity="${k.toFixed(2)}"/>`;
  let rx = tag('打太多：capsular block', 1, WARN);
  rx += labNear('核往前頂住撕囊口', '', B.antPole, -40, 60, { bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.8, k) });
  if (B.fluidMax) rx += lab('水困在核後面', 'trapped', PW - 12, YB, B.fluidMax, { side: 'R', bold: true, color: BSS, lc: BSS, op: ss(0.3, 0.8, k) });
  rx += lab('後囊原本的位置', '', 14, YB, [post0[0] - 60, post0[1]], { color: WARN, lc: WARN, op: ss(0.3, 0.8, k) });
  rx += `<g opacity="${(T.on(3, 0.6) * (1 - T.on(4, 0.4))).toFixed(2)}"><rect x="10" y="86" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 110, '第一步：停止打水；每打一處就壓中央', { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  rx += `<g opacity="${T.on(4, 0.6).toFixed(2)}"><rect x="10" y="86" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 110, '預防：先壓切口後唇，放掉一點 OVD', { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  rx += note('動畫示意（量為示意）', 1);
  return { L: { svg: lv.svg, extra: ex, P: CAT_T }, R: { svg: rsv, extra: rx, P: { title: '經主切口的切面（模型）', orient: '同一切面　上＝前' } } };
};

// ---------------------------------------------------------------- 2 腳踏與面板
// flows drawn at the phaco: irrigation out of the sleeve ports (blue), aspiration into the needle (purple), ultrasound (orange arcs)
function flows(v, g, F, op = 1) {
  let s = '';
  if (F.irr) for (const pp of g.ports) { const a = v.Q(pp), d = [a[0] - v.Q(g.sEnd)[0], a[1] - v.Q(g.sEnd)[1]], l = Math.hypot(d[0], d[1]) || 1, b = [a[0] + d[0] / l * 30, a[1] + d[1] / l * 30 + 14];
    s += arrowH(a, b, BSS, 'arrB', 2.6, op); }
  if (F.asp && F.flow > 0.5) { const t = v.Q(g.tip), u = v.Q([g.tip[0] - g.axis[0] * 1.6, g.tip[1] - g.axis[1] * 1.6, g.tip[2] - g.axis[2] * 1.6]); s += arrowH(u, t, OVDC, 'arrK', 2.6, op); }
  if (F.us > 0) { const t = v.Q(g.tip); for (let i = 1; i <= 3; i++) s += `<circle cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" r="${(6 + 7 * i).toFixed(1)}" fill="none" stroke="#e07a1f" stroke-width="2" opacity="${(op * F.us / 50 * (1 - i / 4)).toFixed(2)}"/>`; }
  return s;
}
DRAW2['2-1'] = T => {
  const ped = T.u < T.st(1) + 1.2 ? 0 : T.u < T.st(2) ? 1 : T.u < T.st(2) + 1.6 ? 2 : T.u < T.st(3) ? 2 + T.p(2, 0.35, 0.95) : T.u < T.st(3) + 1.4 ? 3 : T.u < T.en(3) - 1.0 ? 2 : 1;
  const F = FL.state({ pedal: ped, occl: 0, set: 'sculpt' });
  const st0 = { cat: { ...BASE, nuc: nucS({ dep: 0.35 }) } }, tip = K.grooveTip(st0), st = { cat: { ...st0.cat, inst: [PHACO(tip)] } };
  const cv = sec(st, W_LENS, 'sL'), g = K.instGeom(K.norm(st), K.norm(st).inst[0]);
  let svg = cv.svg + flows(cv, g, F);
  let ex = labNear('phaco（經主切口）', '', shaftPt(cv, g, 5.0), 10, -55, { color: '#3c4a57' });
  ex += labNear('灌流', 'irrigation', cv.Q(g.ports[0]), 50, -70, { bold: true, color: BSS, lc: BSS, op: F.irr ? 1 : 0 });
  ex += lab('抽吸', 'aspiration', PW - 12, 112, cv.Q(g.tip), { side: 'R', bold: true, color: OVDC, lc: OVDC, op: F.asp ? 1 : 0 });
  ex += lab('超音波', 'ultrasound', PW - 12, 160, cv.Q(g.tip), { side: 'R', bold: true, color: '#c46a12', lc: '#c46a12', op: F.us > 0 ? 1 : 0 });
  ex += VIEWS.sbar(cv.k, 1, 1) + note('流向為示意', 1);
  // right: the machine panel, large, with the presets (示意，依院內機器設定; vacuum 450 and bottle 81 cm: Soule 2026)
  let r = machine(40, 30, PW - 80, F, { big: true, title: '腳踏（示意）' });
  const k3 = T.on(4, 0.6), k4 = T.on(5, 0.6);
  r += `<g opacity="${k3.toFixed(2)}"><rect x="40" y="234" width="${PW - 80}" height="58" rx="8" fill="#fff" stroke="#c9d2db"/>${text(54, 257, 'Veritas：peristaltic＋venturi 兩種幫浦', { size: 14.5, bold: true })}${text(54, 280, 'Advanced Infusion：瓶高之外再加壓 22 mmHg', { size: 14.5 })}</g>`;
  r += `<g opacity="${k4.toFixed(2)}"><rect x="40" y="302" width="${PW - 80}" height="72" rx="8" fill="#fff8e6" stroke="#e2c27a"/>${text(54, 324, '設定（示意，依院內機器設定）', { size: 13.5, bold: true, color: '#8a5a00' })}` +
    `${text(54, 346, '刻槽：vacuum 低（模型 80 mmHg）', { size: 13.5 })}${text(54, 366, '移除核塊：vacuum 高（實驗台 450 mmHg）', { size: 13.5 })}</g>`;
  return { L: { svg, extra: ex, P: CAT_T }, R: { svg: `<rect width="${PW}" height="${PH}" fill="#fff"/>` + r, extra: '', P: MACH_T } };
};

// ---------------------------------------------------------------- 3 刻槽
const GROOVED = dep => ({ cat: { ...BASE, nuc: nucS({ dep }) } });
// the depth (share) at which the plate under the floor is rem mm (bisection on the model)
// the cross-sections across the groove sit just proximal to the deepest stroke point (where the floor is deepest and still full width)
const OFFX = (() => { const N = K.nucOf(K.norm(GROOVED(CASE.groove.dep))); return N.g1.tipA + 0.15; })();
const depFor = rem => { let a = 0, b = 1; for (let i = 0; i < 30; i++) { const m = (a + b) / 2, r = K.nucOf(K.norm(GROOVED(m))).g1.remAt(OFFX); r > rem ? a = m : b = m; } return (a + b) / 2; };
const DEP3 = depFor(3.0), DEP2 = depFor(2.0), DEP1 = depFor(1.0);
// cross-section across groove 1 at its deepest point (or at the given offset), with the floor → posterior capsule dimension
function xsec(st, id, o = {}) {
  return sec(st, W_X, id, { hp: XH, off: o.off ?? OFFX, cut: true, step: 0.02 });
}
function plateDim(v, o = {}) {
  const X = v.r.A.grooveX; if (!X) return '';
  const a = v.P(X.floor), b = v.P(X.post), x = a[0] + (o.dx ?? 58);
  return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}H${(x + 5).toFixed(1)}M${b[0].toFixed(1)} ${b[1].toFixed(1)}H${(x + 5).toFixed(1)}" stroke="${COL.accent}" stroke-width="1" stroke-dasharray="3 2"/>` + VIEWS.dim([x, a[1]], [x, b[1]], COL.accent);
}
DRAW2['3-1'] = T => {
  const st = GROOVED(DEP1), sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
  let ex = '';
  if (A.grooveEnd) { const [e0, e1] = A.grooveEnd, up = e0[1] < e1[1] ? e0 : e1; ex += `<g opacity="${T.on(1).toFixed(2)}">${VIEWS.dim(e0, e1, '#2463eb')}</g>` + labNear('長：到撕囊邊緣內', 'length', up, 40, 20, { bold: true, color: '#2463eb', lc: '#2463eb', op: T.on(1) }); }
  if (A.grooveC) ex += labNear('槽', 'groove', A.grooveC, -60, -60, { bold: true, color: BROWN, lc: BROWN });
  ex += lab('撕囊邊緣', 'CCC edge', 14, 112, A.edge3 || A.edge9, { color: CAP, lc: CAP });
  ex += note('槽的寬、長為示意', 1);
  const xv = xsec(st, 'cR'), B = xv.A, X = xv.r.A.grooveX;
  let rx = '';
  if (X) { rx += labNear('槽底', 'floor', xv.P(X.floor), -70, 60, { bold: true, color: BROWN, lc: BROWN });
    rx += lab(`後板 約 ${Math.round(X.rem)} mm`, 'posterior plate', PW - 12, 300, [xv.P(X.floor)[0] + 58, (xv.P(X.floor)[1] + xv.P(X.post)[1]) / 2], { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(2) });
    const hw = X.hw, wa = xv.P([X.floor[0] - hw, X.floor[1] - 0.25]), wb = xv.P([X.floor[0] + hw, X.floor[1] - 0.25]);
    rx += `<g opacity="${T.on(2).toFixed(2)}">${VIEWS.dim(wa, wb, '#2463eb')}</g>` + labNear('寬：約 sleeve 寬', 'width', wa, -20, -80, { bold: true, color: '#2463eb', lc: '#2463eb', op: T.on(2) }); }
  rx += lab('後囊', 'posterior capsule', PW - 12, YB, B.postPole, { side: 'R', color: CAP, lc: CAP });
  const svg = xv.svg + `<g opacity="${T.on(2).toFixed(2)}">${plateDim(xv)}</g>`;
  rx += VIEWS.sbar(xv.k, 1, 1) + note('數值為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg, extra: rx, P: X_T } };
};
DRAW2['3-2'] = T => {
  // two clips: groove-a (1×) to the freeze at 6:06 (at line 3), then groove-b (3×) from the end of the freeze
  const tA = T.st(3) - FOOTAGE.videoTime('groove-a', 366.0), tB = T.st(3) + 5;
  const f = T.u < tB ? footSeg(T, 'groove-a', { at0: tA }) : footSeg(T, 'groove-b', { at0: tB }), L = f.L, op = T.u < tB ? frozenOp('groove-a', f.tau, 366.0) : 0;
  if (op > 0) L.extra = labNear('槽底：更紅、更清楚', 'groove floor', fpt('groove-a', 'groove-floor', f.tau), 40, -40, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
    labNear('槽壁', 'wall', fpt('groove-a', 'groove-wall', f.tau), -40, 70, { bold: true, op }) + labNear('phaco', '', fpt('groove-a', 'phaco-tip', f.tau), -60, -20, { bold: true, op });
  const st = { cat: f.st.cat }, cv = sec(st, W_CAT, 'cR'), B = cv.A;
  let rx = '';
  const g0 = (st.cat.inst || []).find(i => i.kind === 'phaco');
  if (g0) { const g = K.instGeom(K.norm(st), g0); rx += labNear('phaco', '', shaftPt(cv, g, 4.0), -10, -50, { color: '#3c4a57' }); }
  if (B.grooveFloor && st.cat.nuc.groove.dep > 0.15) rx += labNear('槽底', 'floor', B.grooveFloor, 40, 80, { bold: true, color: BROWN, lc: BROWN });
  const F = FL.state({ pedal: g0 && f.s >= ev('sculpt-start') ? 2.5 : g0 ? 1 : 0, occl: 0, set: 'sculpt' });
  rx += machine(PW - 232, 8, 222, F, { title: '腳踏（依動作推定，示意）', rows: ['irr', 'flow', 'vac', 'us'] });
  rx += note('深度依錄影時間重建；phaco 的來回為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['3-3'] = T => {
  // lines 1–2: three depths (plate ≈ 3, 2, 1 mm), the floor brightens in the microscope view (示意 brightness)
  const kA = T.p(3, 0.0, 0.3), kB = T.p(3, 0.35, 0.65), dep = T.u < T.st(3) ? lerp(DEP3, DEP1, T.p(1, 0.1, 0.9)) : kB > 0 ? lerp(DEP2, DEP1, kB) : lerp(DEP3, DEP2, kA);
  const st = GROOVED(dep), sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
  let ex = '';
  if (A.grooveC) ex += labNear('槽底的紅光', 'reflex', A.grooveC, -60, -70, { bold: true, color: '#7a4b00', lc: '#b86e00' });
  // swatches: brightness vs plate left (the same function the drawing uses)
  const sw = [3, 2, 1].map((r, i) => { const x = 20 + i * 92, gl = K.grooveGlow(r); return `<rect x="${x}" y="${PH - 70}" width="28" height="24" rx="4" fill="#c4542a"/><rect x="${x}" y="${PH - 70}" width="28" height="24" rx="4" fill="#ffc48a" opacity="${(0.15 + 0.8 * gl).toFixed(3)}"/>` + text(x + 34, PH - 52, `${r} mm`, { size: 14, bold: true }); }).join('');
  ex += `<rect x="10" y="${PH - 94}" width="290" height="58" rx="6" fill="#fff" opacity="0.92"/>` + text(20, PH - 78, '剩的厚度與槽底亮度（示意）', { size: 12.5, color: COL.sub }) + sw;
  let Lp = { svg: sv.svg, extra: ex, P: SCOPE_T };
  if (T.on(2, 0.5) > 0.5 && T.u < T.st(3)) { const tau = FOOTAGE.videoTime('groove-a', 366.0) + 1; Lp = FOOTAGE.panel('groove-a', tau, { badge: false });
    Lp.extra = labNear('槽底的紅溝', 'red channel', fpt('groove-a', 'groove-floor', tau), 40, -40, { bold: true, color: '#7a4b00', lc: '#ffd34d' }) + wtext(14, PH - 14, '案例 A（錄影 6:06）', { size: 14 }); }
  const xv = xsec(st, 'cR'), X = xv.r.A.grooveX;
  let rx = '';
  if (X) rx += lab(`槽底到後囊 約 ${Math.round(X.rem)} mm`, 'plate', PW - 12, 300, [xv.P(X.floor)[0] + 58, (xv.P(X.floor)[1] + xv.P(X.post)[1]) / 2], { side: 'R', bold: true, color: COL.accent, lc: COL.accent, op: T.on(3) });
  rx += lab('後囊', 'posterior capsule', 14, YB, xv.A.postPole, { color: CAP, lc: CAP });
  let svg = xv.svg + `<g opacity="${T.on(3).toFixed(2)}">${plateDim(xv)}</g>`;
  // line 3: the 12–6 section with the needle at its deepest stroke: the ramp under the incision
  const k3 = T.on(4, 0.6);
  if (k3 > 0.5) { const st3 = { cat: { ...st.cat, nuc: nucS({ dep: CASE.groove.dep }) } }, st3i = { cat: { ...st3.cat, inst: [PHACO(K.grooveTip(st3))] } }, cv = sec(st3i, W_LENS, 'cR3'), B = cv.A;
    svg = cv.svg; rx = lab('近切口：斜坡，刻不深', 'ramp', 14, 310, cv.P([-1.6, -(L0.zMid + 0.6)]), { bold: true, color: WARN, lc: WARN }) +
      (B.grooveFloor ? lab('最深在對側', 'deepest', PW - 12, YB, B.grooveFloor, { side: 'R', bold: true, color: BROWN, lc: BROWN }) : '') + labNear('phaco（經主切口）', '', shaftPt(cv, K.instGeom(K.norm(st3i), K.norm(st3i).inst[0]), 3.6), -10, -60, { color: '#3c4a57' });
    rx += VIEWS.sbar(cv.k, 1, 1) + note('模型推得（沒有出處）', 1);
    return { L: Lp, R: { svg, extra: rx, P: CAT_T } }; }
  rx += VIEWS.sbar(xv.k, 1, 1) + note('亮度與厚度為示意', 1);
  return { L: Lp, R: { svg, extra: rx, P: X_T } };
};
DRAW2['3-4'] = T => {
  const over = T.on(0, 2.0, 0.4), st = { cat: { ...BASE, nuc: nucS({ dep: 1, over }) } };
  const sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
  let ex = (A.grooveC ? labNear('槽底突然很亮', 'too bright', A.grooveC, -60, -70, { bold: true, color: WARN, lc: WARN, op: T.on(1) }) : '') + tag('錯誤示範（動畫示意）', 1, WARN) + note('亮度為示意', 1);
  const xv = xsec(st, 'cR'), B = xv.A;
  let rx = tag('刻穿後板', 1, WARN);
  if (B.breach) rx += lab('槽底穿過後囊', 'capsule breached', 14, YB, B.breach, { bold: true, color: WARN, lc: WARN, op: ss(0.6, 1, over) });
  rx += `<g opacity="${T.on(2, 0.6).toFixed(2)}"><rect x="10" y="60" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 84, '第一步：不再往下刻', { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  rx += VIEWS.sbar(xv.k, 1, 1) + note('動畫示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: xv.svg, extra: rx, P: X_T } };
};

// ---------------------------------------------------------------- 4 分核
const CRACKED = (prog, sep = 0) => ({ cat: { ...BASE, nuc: nucS({ dep: CASE.groove.dep, crack: { prog, sep } }) } });
const withTools = st => { const N = K.nucOf(K.norm(st)), hw = N.g1.hw; return { cat: { ...st.cat, inst: [PHACO(gPt(st, -1.0, hw - 0.47, 0.45)), CHOP(gPt(st, -1.0, -(hw - 0.2), 0.4))] } }; };
DRAW2['4-1'] = T => {
  const prog = T.p(2, 0.05, 0.85), sep = 0.5 * T.p(2, 0.85, 1), st = withTools(CRACKED(prog, sep));
  const sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
  let ex = labNear('chopper（側切口）', '', A.tip1 || sv.P([1, 0]), 50, -60, { color: '#3c4a57' }) + labNear('phaco（主切口）', '', A.tip0 || sv.P([0, 1]), 50, 50, { color: '#3c4a57' });
  if (A.crackEnds) { const up = A.crackEnds[0][1] < A.crackEnds[1][1] ? A.crackEnds[0] : A.crackEnds[1]; ex += labNear('裂縫跑到周邊', 'crack', up, -40, 50, { bold: true, color: BROWN, lc: BROWN, op: T.on(2) }); }
  ex += note('器械位置為示意', 1);
  const xv = sec(st, W_X, 'cR', { hp: XH, off: -0.85, cut: true, step: 0.02 }), B = xv.A;
  let svg = xv.svg;
  if (B.tip0 && B.tip1) { const k = T.on(1); svg += `<g opacity="${k.toFixed(2)}">${arrowH(B.tip0, [B.tip0[0] + (B.tip0[0] > B.tip1[0] ? 40 : -40), B.tip0[1]], COL.accent, 'arrA')}${arrowH(B.tip1, [B.tip1[0] + (B.tip1[0] > B.tip0[0] ? 40 : -40), B.tip1[1]], COL.accent, 'arrA')}</g>`; }
  const sgn = B.tip0 && B.tip1 && B.tip0[0] < B.tip1[0] ? -1 : 1;
  let rx = B.tip0 ? labNear('phaco', '', B.tip0, sgn * 50, -90, { color: '#3c4a57' }) : '';
  if (B.tip1) rx += labNear('chopper', '', B.tip1, -sgn * 50, -90, { color: '#3c4a57' });
  rx += tag('往兩側推 push apart', T.on(1), COL.accent);
  if (B.crack) rx += labNear('裂縫貫穿後板', 'crack', B.crack[1], -40, -30, { bold: true, color: BROWN, lc: BROWN, op: T.on(2) });
  rx += VIEWS.sbar(xv.k, 1, 1) + note('力的方向與裂縫的路徑為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg, extra: rx, P: X_T } };
};
DRAW2['4-2'] = T => {
  const f = footSeg(T, 'crack1', { at0: T.st(3) - FOOTAGE.videoTime('crack1', 418.0) }), L = f.L, op = frozenOp('crack1', f.tau, 418.0);
  if (op > 0) L.extra = labNear('第一道裂縫', 'crack', fpt('crack1', 'gap', f.tau), 60, -90, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
    labNear('chopper', '', fpt('crack1', 'chopper-tip', f.tau), -20, -60, { bold: true, op }) + labNear('phaco', '', fpt('crack1', 'phaco-tip', f.tau), 40, -40, { bold: true, op });
  const st = { cat: f.st.cat }, xv = sec(st, W_X, 'cR', { hp: XH, off: -0.85, cut: true, step: 0.02 }), B = xv.A;
  let rx = '';
  const leftOf = (a, b) => a && b && a[0] < b[0];
  if (B.tip0) rx += labNear('phaco', '', B.tip0, leftOf(B.tip0, B.tip1) || !B.tip1 ? -50 : 50, -90, { color: '#3c4a57' });
  if (B.tip1) rx += labNear(leftOf(B.tip1, B.tip0) ? 'chopper' : 'chopper（側切口）', '', B.tip1, leftOf(B.tip1, B.tip0) ? -50 : 50, -90, { color: '#3c4a57' });
  if (B.crack) rx += labNear('裂縫', 'crack', B.crack[1], -40, -30, { bold: true, color: BROWN, lc: BROWN });
  // the model's cracking pose is at the far end of the groove (the only place the chopper reaches the floor from the side port); in the footage the
  // halves part with both instruments near the incision — the model frame is labelled as the standard pose, not this moment
  if (f.s >= ev('chopper-in')) rx += tag('器械姿勢：模型示意（不是這一格）', 1, COL.sub, 34);
  rx += VIEWS.sbar(xv.k, 1, 1) + note('裂縫進度依錄影時間重建；器械在槽的遠端（示意）', 1);
  return { L, R: { svg: xv.svg, extra: rx, P: XSYNC_T } };
};
// lines 0–1 of 4-3: the standard steps on the model (示意): turn 90°, sculpt the second groove (12–6 again), crack it → four pieces
function std43(T) {
  const rot = 90 * T.p(0, 0.05, 0.5), on1 = T.u >= T.st(1), kG = T.p(1, 0, 0.5), cr = T.p(1, 0.55, 0.85), sep = 0.5 * T.p(1, 0.85, 1);
  const st = { cat: { ...BASE, nuc: nucS({ crack: { prog: 1, sep: 0.5 }, rot, dep2: on1 ? CASE.groove.dep * kG : undefined, crack2: cr > 0 ? { prog: cr, sep } : null }) } };
  let inst = [];
  if (on1 && kG < 1) { const ph = 0.5 - 0.5 * Math.cos(2 * Math.PI * 2 * kG), a = gPt(st, 0.6, 0, 0.9, 2), b = K.grooveTip(st, 2); inst = [PHACO([lerp(a[0], b[0], ph), lerp(a[1], b[1], ph), lerp(a[2], b[2], ph)])]; }
  else if (on1) { const [p, q] = crackTools(st, 2); inst = [PHACO(p), CHOP(q)]; }
  return { st: { cat: { ...st.cat, inst } }, rot, on1, kG, cr, sep };
}
// the plane sits 1.6 mm toward the far end: clear of groove 1, which now runs parallel to it (3–9) through the centre
const X2OFF = -1.6, X2 = (st, id) => sec(st, W_X, id, { hp: XH, off: X2OFF, cut: true, step: 0.02 });
// labels of the cross-section across groove 2: the groove floor while it deepens, the crack while it runs down, the posterior capsule
function x2labels(xv, st) {
  const X = xv.r.A.grooveX2, n = st.cat.nuc, cr2 = n.crack2; let o = '';
  if (X && n.groove2 && n.groove2.dep > 0.15 && !(cr2 && cr2.prog > 0)) o += labNear('第二道槽', 'groove 2', xv.P(X.floor), -70, 60, { bold: true, color: BROWN, lc: BROWN });
  if (xv.A.crack2 && cr2 && cr2.prog > 0) o += labNear('第二道裂縫', 'crack 2', xv.A.crack2[1], -50, -40, { bold: true, color: BROWN, lc: BROWN });
  return o + lab('後囊', 'posterior capsule', PW - 12, YB, xv.A.postPole, { side: 'R', color: CAP, lc: CAP });
}
DRAW2['4-3'] = T => {
  // lines 0–1: the standard steps, both panels on the model; lines 2–4: the footage (turn 7:04–7:11 at the start of line 2) and the model on its clock
  const at0 = T.st(2) - 0.5 - FOOTAGE.videoTime('divide', ev('turn-start')), useF = T.u >= T.st(2) - 0.35;
  if (!useF) {
    const D = std43(T), st = D.st, sv = scope(st, W_SCOPE_N, 'sL'), A = sv.A;
    let svg = sv.svg, ex = tag('模型示範：標準做法', 1, COL.accent);
    if (!D.on1) { const c = sv.P([0, 0]), r = 2.55 * sv.k, pts = []; for (let a = 15; a <= 15 + D.rot + 1; a += 6) { const t = a * Math.PI / 180; pts.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
      if (pts.length > 1) svg += `<path d="${pathOf(pts)}" fill="none" stroke="#fff" stroke-width="6" opacity="0.7"/><path d="${pathOf(pts)}" fill="none" stroke="#ffd34d" stroke-width="3.2" marker-end="url(#arrM)"/>`;
      if (pts.length > 1) ex += labNear('轉 90°', 'rotate', pts[0], 40, 40, { bold: true, color: '#7a4b00', lc: '#b86e00' }); }
    if (D.on1 && A.grooveC2) ex += labNear('第二道槽', 'groove 2', A.grooveC2, -50, -80, { bold: true, color: BROWN, lc: BROWN });
    ex += note('轉的角度與時間為示意', 1);
    const xv = X2(st, 'cR');
    let rx = x2labels(xv, st) + tag(D.cr >= 1 && D.sep > 0.2 ? '四塊' : D.on1 ? '第二道槽 → 第二次分核' : '轉 90° 之後，第二道槽在這裡', 1, COL.accent);
    rx += VIEWS.sbar(xv.k, 1, 1) + note('模型示範；深度與裂縫的路徑為示意', 1);
    return { L: { svg, extra: ex, P: SCOPE_DEMO_T }, R: { svg: xv.svg, extra: rx, P: X2_T } };
  }
  const f = footSeg(T, 'divide', { at0 }), L = f.L, s = f.s;
  // what the footage shows (captions keyed to its events; no anchored labels on a moving picture)
  const cap = s >= ev('crack2-start') ? '再一次分開' : s >= ev('groove2-start') ? 'phaco 沿新的方向往前推進（第二道槽看不清楚）' : s >= ev('turn-start') ? 'chopper 推核的周邊：核轉了方向' : '';
  if (cap) L.extra = wtext(14, PH - 14, cap, { size: 14.5 });
  const st = { cat: f.st.cat }, xv = X2(st, 'cR');
  let svg = xv.svg + inset(st, XH, -4.5, 4.5, BOX_TL, 'iR', '虛線＝切面', X2OFF);
  let rx = x2labels(xv, st) + tag(s < ev('turn-start') ? '分開的兩半' : s < ev('groove2-start') ? '轉 90°（模型）' : s < ev('crack2-start') ? '第二道槽（模型）' : '第二次分核 → 四塊', 1, COL.accent, 34, PW / 2 + 60);
  rx += VIEWS.sbar(xv.k, 1, 1) + note('依錄影時間；轉的角度與第二道槽為示意', 1);
  return { L, R: { svg, extra: rx, P: X2SYNC_T } };
};

// ---------------------------------------------------------------- 5 移除核塊
// one quadrant (model q 0, turned to the far side of the main-incision section): pull 0→1 then eat 0→1
const QSTATE = (pull, eat, o = {}) => { const nuc = DIVIDED({ rot: 135, quads: [{ q: 0, pull, eat }] }), st = { cat: { ...BASE, nuc, surge: o.surge || 0 } };
  return o.noTip ? st : { cat: { ...st.cat, inst: [PHACO(o.tip || K.quadTip(st, 0), { bevel: 'down', occl: 1 })] } }; };
DRAW2['5-1'] = T => {
  const pull = T.p(3, 0.05, 0.6), eat = T.p(3, 0.65, 1) * 0.6 + 0.4 * T.p(4, 0, 1), st = QSTATE(pull, eat);
  const cv = sec(st, W_CAT, 'sL'), B = cv.A;
  let ex = '';
  if (B.tip0) ex += labNear('phaco 口吸住核塊', 'occlusion', shaftPt(cv, cv.r.A.inst0, 1.6), 30, -60, { bold: true, color: '#3c4a57', op: T.on(1) });
  if (B.quadApex0) ex += lab('核塊拉到中央', 'quadrant', PW - 30, 244, B.quadApex0, { side: 'R', bold: true, color: NUC, lc: NUC, op: T.on(3) });
  ex += lab('後囊', 'posterior capsule', PW - 12, YB, cv.P([2.4, -(L0.zPost(2.4) - 0.0)]), { side: 'R', color: CAP, lc: CAP });
  ex += lab('皮質留在囊袋', 'cortex', 14, YB, cv.P([-3.8, -(L0.zMid)]), {});
  ex += VIEWS.sbar(cv.k, 1, 1) + note('核塊的位置與角度為示意', 1);
  const tOcc = Math.max(0, T.u - T.st(1) - 0.8), ped = T.u < T.st(1) + 0.8 ? 1 : T.u < T.st(3) + (T.en(3) - T.st(3)) * 0.6 ? 2 : 2.7;
  const F = FL.state({ pedal: ped, occl: T.u >= T.st(1) + 0.8 ? 1 : 0, set: 'quad', tOcc });
  let r = machine(40, 30, PW - 80, F, { big: true, title: '腳踏（示意）' });
  r += `<g opacity="${T.on(5, 0.6).toFixed(2)}"><rect x="40" y="240" width="${PW - 80}" height="72" rx="8" fill="#fff8e6" stroke="#e2c27a"/>${text(54, 262, 'vacuum 上限（示意，依院內機器設定）', { size: 13.5, bold: true, color: '#8a5a00' })}` +
    `${text(54, 284, '刻槽：低（模型 80 mmHg）', { size: 13.5 })}${text(54, 304, '移除核塊：高（Veritas 實驗台 450 mmHg）', { size: 13.5 })}</g>`;
  return { L: { svg: cv.svg, extra: ex, P: CAT_T }, R: { svg: `<rect width="${PW}" height="${PH}" fill="#fff"/>` + r, extra: '', P: MACH_T } };
};
const PIECE_CAP = ['第 1 塊：從 6 點側', '第 2 塊：從 temporal 側', '第 3 塊：從哪裡來看不清楚', '第 4 塊（大塊）：從 nasal 側偏上'];
DRAW2['5-2'] = T => {
  const f = footSeg(T, 'quads', { at0: T.st(1) + 0.3 - FOOTAGE.videoTime('quads', 476.0) }), L = f.L, op = frozenOp('quads', f.tau, 476.0), s = f.s;
  let ex = '';
  if (op > 0) ex += labNear('露出更紅的 red reflex', 'reflex', fpt('quads', 'reflex', f.tau), 40, -10, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
    labNear('chopper', '', fpt('quads', 'chopper-tip', f.tau), -20, 90, { bold: true, op });
  // the piece the footage is on (its clock position as read on the footage; draw.js PIECES = the model's piece removals on the same clock)
  const Q = quadsAt(s), i = Q.cur, P = PIECES[Math.max(0, Q.cur >= 0 ? Q.cur : Q.last)], h = qHour(P.q);
  if (i >= 0 && op < 0.5) ex += wtext(14, PH - 14, PIECE_CAP[i], { size: 14.5 });
  L.extra = ex;
  // right: the section through the piece's original clock position (it moves to the next piece as the footage does), instruments in the inset only
  const stS = { cat: { ...f.st.cat, inst: [] } }, cv = sec(stS, W_LENS, 'cR', { hp: h }), B = cv.A, cq = f.st.cat.nuc.quads.find(e => e.q === P.q);
  const svg = cv.svg + inset({ cat: f.st.cat }, h, -W_INSET.w / 2, W_INSET.w / 2, BOX_TL, 'iR');
  let rx = '';
  if (cq && cq.eat < 1 && B['quadApex' + P.q]) rx += labNear(`第 ${P.n} 塊：拉到中央`, '', B['quadApex' + P.q], 40, -80, { bold: true, color: NUC, lc: NUC });
  else if (cq && cq.eat >= 1) rx += tag(`第 ${P.n} 塊已清掉`, 1, NUC, 34, PW / 2 + 60);
  rx += lab('後囊', 'posterior capsule', PW - 12, YB, B.postPole, { side: 'R', color: CAP, lc: CAP });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('時間與位置依錄影；分成四塊為示意', 1);
  return { L, R: { svg, extra: rx, P: PCT(P.n, h) } };
};
DRAW2['5-3'] = T => {
  // left: the quadrant held at the periphery near the posterior capsule (pull small) — the break there; right: the timeline (vacuum, chamber)
  const tB = T.st(1) + 0.6, tt = T.u - tB, dip = FL.surge(tt, 'quad'), kC = T.on(4, 0.8);
  const pull = kC > 0.5 ? 1 : 0.15, eat = tt > 0 ? Math.min(1, 0.4 + tt * 0.5) * (kC > 0.5 ? 0.3 : 1) : 0;
  const st0 = QSTATE(pull, kC > 0.5 ? 0.2 : eat, { surge: kC > 0.5 ? 0 : dip });
  const cv = sec(st0, W_CAT, 'sL'), B = cv.A;
  let ex = '';
  if (kC <= 0.5) { if (B.tip0) ex += labNear('在周邊吸住', 'periphery', B.tip0, -40, -80, { bold: true, color: WARN, lc: WARN });
    ex += lab('後囊離口近', 'posterior capsule', PW - 12, YB, cv.P([2.6, -L0.zPost(2.6)]), { side: 'R', bold: true, color: CAP, lc: CAP });
    if (dip > 0.02) ex += tag('surge：前房變淺', 1, WARN); }
  else { if (B.tip0) ex += labNear('拉到中央再乳化', 'safe', B.tip0, -40, 90, { bold: true, color: COL.accent, lc: COL.accent }); ex += tag('離後囊遠', 1, COL.accent); }
  ex += VIEWS.sbar(cv.k, 1, 1) + note('前房變淺的量為示意（surge 體積依綜論的範圍）', 1);
  // right: vacuum and chamber depth against time around the break
  const x0 = 60, x1 = PW - 30, t0 = -3, t1 = 4, X = t => x0 + (t - t0) / (t1 - t0) * (x1 - x0), yV = 150, yA = 320;
  const vac = t => t < -2.5 ? 0.06 : t < 0 ? 1 - Math.exp(-(t + 2.5) / 0.4) : 0.06, ac = t => 1 - FL.surge(t, 'quad');
  const pv = [], pa = []; for (let t = t0; t <= t1 + 1e-9; t += 0.05) { pv.push([X(t), yV - 90 * vac(t)]); pa.push([X(t), yA - 110 * ac(t) + 110]); }
  const now = Math.min(t1, Math.max(t0, tt)), cl = X(now);
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + text(x0, 44, 'vacuum', { size: 14, bold: true, color: '#5b3fa0' }) + text(x0, 214, '前房深度', { size: 14, bold: true, color: CAP });
  r += `<clipPath id="tl_c"><rect x="0" y="0" width="${cl.toFixed(1)}" height="${PH}"/></clipPath><g clip-path="url(#tl_c)"><path d="${pathOf(pv)}" fill="none" stroke="#5b3fa0" stroke-width="3"/><path d="${pathOf(pa)}" fill="none" stroke="${CAP}" stroke-width="3"/></g>`;
  r += `<path d="M${x0} ${yV}H${x1}M${x0} ${yA}H${x1}" stroke="#cfd6dd"/><path d="M${X(-2.5).toFixed(1)} 52V${PH - 46}" stroke="${COL.sub}" stroke-dasharray="4 3"/><path d="M${X(0).toFixed(1)} 52V${PH - 46}" stroke="${WARN}" stroke-dasharray="4 3"/>`;
  r += text(X(-2.5) - 4, PH - 34, '口被堵住', { size: 13, color: COL.sub, anchor: 'end' }) + text(X(0) + 4, PH - 34, '堵塞解除', { size: 13, bold: true, color: WARN });
  r += `<g opacity="${T.on(3, 0.6).toFixed(2)}">${text(X(0) + 6, yA - 40, '持續約 1.6–2.9 秒', { size: 13.5, bold: true, color: CAP })}${text(X(0) + 6, yA - 22, '（Veritas 實驗台）', { size: 12.5, color: CAP })}</g>`;
  r += text(PW - 12, PH - 12, '曲線形狀為示意', { size: 13, color: COL.sub, anchor: 'end' });
  return { L: { svg: cv.svg, extra: ex, P: CAT_T }, R: { svg: r, extra: '', P: { title: 'Occlusion 與 surge（示意）', orient: '橫軸＝時間' } } };
};
DRAW2['5-4'] = T => {
  const f = footSeg(T, 'cleanup'), L = f.L;
  if (f.s >= ev('phaco-out')) L.extra = wtext(14, PH - 14, 'phaco 退出', {});
  const st = { cat: f.st.cat }, cv = sec(st, W_CAT, 'cR'), B = cv.A;
  let rx = lab('皮質留在囊袋', 'cortex', PW - 12, YB, cv.P([3.8, -L0.zMid]), { side: 'R', op: T.on(2) });
  if (B.tip0) rx += labNear('phaco', '', B.tip0, -40, -70, { color: '#3c4a57' });
  rx += note('依錄影時間', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};

// ---------------------------------------------------------------- 6 出錯的線索與第一步
DRAW2['6-1'] = T => {
  const tB = T.st(0) + 1.6, tt = T.u - tB, back = T.on(1, 0.8, 0.4), dip = FL.surge(tt, 'quad') * (1 - back);
  const st = QSTATE(1, 0.6, { surge: dip }), cv = sec(st, W_CAT, 'sL'), B = cv.A;
  const ref = sec(QSTATE(1, 0.6, { noTip: true }), W_CAT, 'x1'), cornea = ref.A.antPole;
  let svg = cv.svg + `<path d="M${(cornea[0] - 120).toFixed(1)} ${cornea[1].toFixed(1)}H${(cornea[0] + 120).toFixed(1)}" stroke="${CAP}" stroke-width="1.4" stroke-dasharray="5 4" opacity="${ss(0.02, 0.1, dip).toFixed(2)}"/>`;
  let ex = (dip > 0.03 ? tag('前房突然變淺', 1, WARN) : '') + lab('原本的前囊高度', '', PW - 12, 64, [cornea[0] + 100, cornea[1]], { side: 'R', color: CAP, lc: CAP, op: ss(0.02, 0.1, dip) });
  ex += VIEWS.sbar(cv.k, 1, 1) + note('變淺的量為示意', 1);
  const ped = T.u < T.st(1) + 0.4 ? 2.6 : 1, F = FL.state({ pedal: ped, occl: 0, set: 'quad', tBreak: tt, vacBreak: 450 });
  let r = machine(40, 30, PW - 80, F, { big: true, title: '腳踏（示意）' });
  r += `<g opacity="${T.on(1, 0.6).toFixed(2)}"><rect x="40" y="240" width="${PW - 80}" height="40" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 266, '第一步：腳退回 1 段（只灌流）', { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  r += `<g opacity="${T.on(2, 0.6).toFixed(2)}"><rect x="40" y="294" width="${PW - 80}" height="40" rx="8" fill="#fff" stroke="#c9d2db"/>${text(PW / 2, 320, '預防：vacuum、流量別太高；拉到中央再吃', { size: 15, bold: true, anchor: 'middle' })}</g>`;
  return { L: { svg, extra: ex, P: CAT_T }, R: { svg: `<rect width="${PW}" height="${PH}" fill="#fff"/>` + r, extra: '', P: MACH_T } };
};
// where an instrument's shaft crosses a section plane (panel px), with its cut ellipse for radius r mm (as the model's drawInstCut)
function crossCut(v, g, r) {
  const pl = v.r.pl, nrm = [pl.U[1], -pl.U[0], 0], sd = p => (p[0] - pl.O[0]) * nrm[0] + (p[1] - pl.O[1]) * nrm[1] + (p[2] - pl.O[2]) * nrm[2];
  const a = g.tip, b = [g.tip[0] + g.axis[0] * 30, g.tip[1] + g.axis[1] * 30, g.tip[2] + g.axis[2] * 30], da = sd(a), db = sd(b); if (da * db > 0) return null;
  const t = da / (da - db), q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], cs = Math.abs(g.axis[0] * nrm[0] + g.axis[1] * nrm[1] + g.axis[2] * nrm[2]);
  const dn = g.axis[0] * nrm[0] + g.axis[1] * nrm[1] + g.axis[2] * nrm[2], ad = [g.axis[0] - nrm[0] * dn, g.axis[1] - nrm[1] * dn, g.axis[2] - nrm[2] * dn];
  const Q = v.Q(q), A2 = v.Q([q[0] + ad[0], q[1] + ad[1], q[2] + ad[2]]), ang = Math.atan2(A2[1] - Q[1], A2[0] - Q[0]);
  const pt = (rr, th) => { const ex = rr / Math.max(0.25, cs) * v.k * Math.cos(th), ey = rr * v.k * Math.sin(th); return [Q[0] + ex * Math.cos(ang) - ey * Math.sin(ang), Q[1] + ex * Math.sin(ang) + ey * Math.cos(ang)]; };
  return { q, Q, ang, cs, pt, rx: r / Math.max(0.25, cs) * v.k, ry: r * v.k, mm: G.toPlane(pl, q) };
}
DRAW2['6-2'] = T => {
  // left: the microscope view with the phaco in the main incision and a whitened patch of cornea there (示意). right: the main tunnel cut across
  // (half way along it): the sleeve in the tunnel and the needle inside it; irrigation (into the eye, ⊗) between them and aspiration (out, ⊙) in
  // the needle when there is flow; heat at the wound lips when there is none (Ernest 2001: no flow → the wound heats; OVD at the tip → hotter).
  // Sequence (示意): line 0 burn; line 1 flow → no flow → OVD at the tip; line 2 3 released (ultrasound off), then flow first; line 3 flow.
  const st0 = { cat: { ...BASE, nuc: nucS({ dep: 0.5 }) } }, st = { cat: { ...st0.cat, inst: [PHACO(K.grooveTip(st0))] } };
  const sv = scope(st, { x: -6.0, y: -2.2, w: 12 }, 'sL'), A = sv.A, k0 = T.on(0, 1.4);
  const m = A.mainExt, mi = A.mainInt, c = [(m[0] + mi[0]) / 2, (m[1] + mi[1]) / 2];
  const svgL = sv.svg + `<g opacity="${(0.85 * k0).toFixed(2)}"><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(1.9 * sv.k).toFixed(1)}" ry="${(1.2 * sv.k).toFixed(1)}" fill="#f4f6f7" opacity="0.85"/></g>`;
  const exL = labNear('切口附近角膜變白', 'wound burn', c, -60, -40, { bold: true, color: WARN, lc: WARN, op: k0 }) + note('變白的範圍為示意', 1);
  const u = T.u, s1 = T.st(1), e1 = T.en(1), s2 = T.st(2), tOff = lerp(s1, e1, 0.4), tOVD = lerp(s1, e1, 0.7), tBack = lerp(s2, T.en(2), 0.5);
  const flow = (u >= s1 && u < tOff) || u >= tBack, ovd = u >= tOVD && u < tBack, us = u < s2 + 0.3;
  const heat = u < s1 ? 1 : u < tOff ? 1 - 0.85 * ss(s1, s1 + 1.2, u) : u < tOVD ? 0.15 + 0.5 * ss(tOff, tOVD, u) : u < s2 ? 0.65 + 0.35 * ss(tOVD, e1, u) : 1 - 0.85 * ss(s2, s2 + 2.5, u);
  const tv = sec(st, W_TUNX, 'cR', { hp: XH, off: TUN_OFF, cut: true, step: 0.02 }), g = K.instGeom(K.norm(st), K.norm(st).inst[0]);
  const S = crossCut(tv, g, g.rs), N = crossCut(tv, g, g.rn), cam = VIEWS.cam(W_TUNX, PW, PH);
  let svg = tv.svg, rx = '';
  if (S && N) {
    // heat: a glow round the sleeve clipped to the corneal tissue (the opened tunnel is not tissue), strongest at the lips
    const R = (CATARACT.CN.phaco.sleeveOD / 2 + 0.55).toFixed(3);
    svg += `<g transform="${cam.tf}"><defs><radialGradient id="heatG" gradientUnits="userSpaceOnUse" cx="${S.mm[0].toFixed(3)}" cy="${S.mm[1].toFixed(3)}" r="${R}"><stop offset="0.55" stop-color="#ff4a1a" stop-opacity="0.95"/><stop offset="1" stop-color="#ff4a1a" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="heatC"><path d="${tv.r.outline.cornea}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#heatC)" opacity="${(0.85 * heat).toFixed(3)}"><circle cx="${S.mm[0].toFixed(3)}" cy="${S.mm[1].toFixed(3)}" r="${R}" fill="url(#heatG)"/></g></g>`;
    // the needle inside the sleeve (coaxial), its lumen; OVD in it when occluded
    const deg = (S.ang * 180 / Math.PI).toFixed(2), el = (C, a, b, fill, extra = '') => `<ellipse cx="${C[0].toFixed(1)}" cy="${C[1].toFixed(1)}" rx="${a.toFixed(1)}" ry="${b.toFixed(1)}" transform="rotate(${deg} ${C[0].toFixed(1)} ${C[1].toFixed(1)})" fill="${fill}" ${extra}/>`;
    svg += el(N.Q, N.rx, N.ry, '#c9d1d8', 'stroke="#6f7f8b" stroke-width="1.2"') + el(N.Q, N.rx * 0.7, N.ry * 0.7, ovd ? OVDC : '#56606b', `opacity="${ovd ? 0.9 : 0.6}"`);
    // flow: irrigation into the eye between needle and sleeve (⊗), aspiration out through the needle (⊙)
    if (flow) { for (let i = 0; i < 6; i++) { const p = S.pt((g.rs + g.rn) / 2, i * Math.PI / 3), r0 = 7;
        svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r0}" fill="#fff" stroke="${BSS}" stroke-width="1.8"/><path d="M${(p[0] - 4.5).toFixed(1)} ${(p[1] - 4.5).toFixed(1)}l9 9M${(p[0] + 4.5).toFixed(1)} ${(p[1] - 4.5).toFixed(1)}l-9 9" stroke="${BSS}" stroke-width="1.8"/>`; }
      svg += `<circle cx="${N.Q[0].toFixed(1)}" cy="${N.Q[1].toFixed(1)}" r="8" fill="#fff" stroke="${OVDC}" stroke-width="1.8"/><circle cx="${N.Q[0].toFixed(1)}" cy="${N.Q[1].toFixed(1)}" r="3" fill="${OVDC}"/>`; }
    if (us) svg += [1, 2].map(i => `<ellipse cx="${N.Q[0].toFixed(1)}" cy="${N.Q[1].toFixed(1)}" rx="${(S.rx + 8 * i).toFixed(1)}" ry="${(S.ry + 8 * i).toFixed(1)}" transform="rotate(${deg} ${N.Q[0].toFixed(1)} ${N.Q[1].toFixed(1)})" fill="none" stroke="#e07a1f" stroke-width="1.6" stroke-dasharray="4 4" opacity="${(0.7 / i).toFixed(2)}"/>`).join('');
    // labels: short, in a column beside the cut, leaders to what they name (left: sleeve, irrigation; right: needle, heat)
    const side = (C, r, sg) => { let b = null; for (let i = 0; i < 72; i++) { const p = C.pt(r, i * Math.PI / 36); if (!b || sg * (p[0] - b[0]) > 0) b = p; } return b; };   // left- / rightmost point of a cut
    rx += lab('矽膠套', 'sleeve', 14, 150, side(S, g.rs, -1), { color: '#3c4a57' });
    const ports = [0, 1, 2, 3, 4, 5].map(i => S.pt((g.rs + g.rn) / 2, i * Math.PI / 3)).filter(p => p[1] > S.Q[1]).sort((a, b) => a[0] - b[0]);   // the lower-left ⊗
    if (flow) rx += lab('灌流（往眼內）', 'irrigation', 14, 250, ports[0], { bold: true, color: BSS, lc: BSS });
    const nTop = [...Array(24).keys()].map(i => N.pt(g.rn, i * Math.PI / 12)).sort((a, b) => (b[0] - b[1]) - (a[0] - a[1]))[0];   // the needle's upper-right edge (between two ⊗)
    rx += labNear(flow ? '針頭（抽吸）' : '針頭', 'needle', nTop, 70, -36, { color: flow ? OVDC : '#3c4a57', lc: flow ? OVDC : undefined });
    const lip = [S.Q[0] + 1.25 * tv.k, S.Q[1]];
    if (heat > 0.3) rx += lab('切口唇變熱', 'heat', PW - 12, 250, lip, { side: 'R', bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.5, heat) });
  }
  rx += tag(flow ? '有水流：熱被帶走' : ovd ? 'OVD 堵住針頭：更熱' : '沒有水流：熱帶不走', 1, flow ? BSS : WARN, 374);
  rx += `<g opacity="${T.on(2, 0.6).toFixed(2)}"><rect x="10" y="10" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 34, '第一步：放開 3 段；踩 3 段前先確定有水流', { size: 15.5, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  rx += VIEWS.sbar(tv.k, 1, 1) + note('熱的範圍與流向為示意', 1);
  return { L: { svg: svgL, extra: exL, P: SCOPE_T }, R: { svg, extra: rx, P: TUN_T } };
};
DRAW2['6-3'] = T => {
  const L = FOOTAGE.panel('hydro1', FOOTAGE.videoTime('hydro1', 323.9) + 1.0, { badge: false });
  L.extra = labNear('本例：注水 3 次', 'case A', fpt('hydro1', 'ring', FOOTAGE.videoTime('hydro1', 323.9) + 1.0), 40, -110, { bold: true, lc: '#ffd34d' }) + wtext(14, PH - 14, '案例 A（錄影 5:24）：zonule 弱，後來放 CTR', { size: 14 });
  const box = (x, y, w, h, title, rows, op, col = COL.accent) => `<g opacity="${op.toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="${col}" stroke-width="1.5"/>${text(x + 16, y + 28, title, { size: 16.5, bold: true, color: col })}` +
    rows.map((r, i) => text(x + 16, y + 56 + i * 24, r[0], { size: 14.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  r += box(14, 14, PW - 28, 120, 'Zonule 弱：減少拉扯（綜論）', [['hydrodissection 做足：核鬆開，少硬轉'], ['低流量、慢動作'], ['囊袋不穩時，轉核、分核都較難', false, COL.sub]], T.on(1));
  r += box(14, 146, PW - 28, 94, '技術的選擇（綜論）', [['chop 類對 zonule 的壓力小於 divide and conquer'], ['本片的病例用 divide and conquer（院內確認）', false, COL.sub]], T.on(2));
  r += box(14, 252, PW - 28, 100, '隨機試驗（117 人）', [['phaco 時間：chop 1.2 分鐘、D&C 2.4 分鐘'], ['併發症與術後視力沒有差別'], ['', false]], T.on(3), '#2463eb');
  return { L, R: { svg: r, extra: '', P: { title: 'Zonule 弱時的做法', orient: '' } } };
};

// ---------------------------------------------------------------- 7 練習清單
DRAW2['7'] = T => {
  const box = (x, y, w, h, title, rows, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="#d3dae1"/>${text(x + 20, y + 36, title, { size: 19, bold: true, color: COL.accent })}` +
    rows.map((r, i) => text(x + 20, y + 76 + i * 34, r[0], { size: 16.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += box(20, 20, 560, 230, '為什麼要先練', [['phaco：住院醫師自評 3.32／5、完成率 66.7%'], ['（Dooley 2006）', false, COL.sub], ['訓練系列：移除核塊時 PCR 1.7%'], ['（Suryawanshi 2016）', false, COL.sub]], T.on(0));
  const items = [['一', '打完水壓中央，確認核轉得動'], ['二', '槽刻到槽底變紅、到撕囊邊緣內'], ['三', '兩支器械放到槽底再推'], ['四', '核塊吸住、拉到中央再乳化；前房一淺，腳退回 1 段']];
  o += `<g opacity="${T.on(2)}"><rect x="600" y="20" width="610" height="${PH - 40}" rx="10" fill="#f7f9fa" stroke="${COL.accent}" stroke-width="2"/>${text(620, 56, 'Wet lab／模擬器：上刀前練這四件事', { size: 19, bold: true, color: COL.accent })}</g>`;
  items.forEach(([n, s], i) => { const k = i === 0 ? T.on(2) : i < 3 ? T.on(3) : T.on(4);
    const parts = s.length > 20 ? [s.slice(0, s.indexOf('；') + 1), s.slice(s.indexOf('；') + 1)] : [s];
    o += `<g opacity="${k}"><circle cx="642" cy="${110 + i * 72}" r="18" fill="${COL.accent}"/>${text(642, 116 + i * 72, n, { size: 17, bold: true, color: '#fff', anchor: 'middle' })}` +
      parts.map((p, j) => text(674, 116 + i * 72 + j * 26, p, { size: 18, bold: i === 3 })).join('') + `</g>`; });
  return { F: { svg: o, extra: '', P: { title: '練習清單', orient: '' } } };
};
