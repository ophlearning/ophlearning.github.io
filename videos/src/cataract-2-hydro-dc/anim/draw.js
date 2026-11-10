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
const CAT_T = { title: '經主切口的切面（模型）', orient: '左＝主切口（11 點多）　上＝前' };
const SYNC_T = { title: '經主切口的切面（模型，依錄影時間）', orient: '左＝主切口　上＝前' };
const X_T = { title: '垂直槽的橫切面（模型）', orient: '從切口看　右＝temporal　上＝前' };
const XSYNC_T = { title: '垂直槽的橫切面（模型，依錄影時間）', orient: '從切口看　右＝temporal' };
const SCOPE_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝temporal' };
const SCOPE_SYNC_T = { title: '術者視角（模型，依錄影時間）', orient: '下＝12 點　右＝temporal' };
const TUN_T = { title: '主切口隧道放大（模型）', orient: '左＝周邊　上＝前' };
const HYT = h => ({ title: `經注水點的切面（模型）`, orient: `右＝注水點（約 ${Math.round(h)} 點）　上＝前` });
const MACH_T = { title: '腳踏與機器（示意）', orient: '數字依院內機器設定' };
window.PRELOAD_EXTRA = JSON.stringify([CAT_T, SYNC_T, X_T, XSYNC_T, SCOPE_T, SCOPE_SYNC_T, TUN_T, HYT(8), HYT(2), MACH_T]) +
  '經注水點的切面右＝注水點約點上＝前0123456789切面不畫cannula經主切口不在這個切面上俯視模型虛線＝切面腳踏灌流抽吸流量vacuum超音波前房深度不動＋示意依動作推定刻槽移除核塊';

const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
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
const onShaft = (v, st, i, yT) => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]), o = g.bend || g.tip; let best = null;
  for (let s = 0; s <= 14; s += 0.1) { const q = v.Q([o[0] + g.axis[0] * s, o[1] + g.axis[1] * s, o[2] + g.axis[2] * s]); if (q[0] > 20 && q[0] < PW - 20 && q[1] > 20 && q[1] < PH - 20 && (!best || Math.abs(q[1] - yT) < Math.abs(best[1] - yT))) best = q; }
  return best; };
// an inset microscope view (top left of a section panel) with the section's footprint (dashed) — the instruments are drawn here when the
// section does not contain the incision they come through
const BOX_TL = { x: 10, y: 10, w: 150, h: 150 }, W_INSET = { x: -6.6, y: -6.6, w: 13.2 };
function inset(st, hp, u0, u1, box, id, cap = '虛線＝切面') {
  const v = scopeBox(st, W_INSET, id, box), d = G.clockDir(hp), q = u => v.Q([d[0] * u, d[1] * u, L0.zAnt(Math.min(Math.abs(u), L0.Req - 1e-6))]), a = q(u0), b = q(u1);
  let o = `<rect x="${box.x - 2}" y="${box.y - 2}" width="${box.w + 4}" height="${box.h + 4}" rx="4" fill="#fff"/>` + v.svg;
  o += `<g clip-path="url(#${id}_bx)"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#fff" stroke-width="4.5" opacity="0.85"/>` +
    `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#1d2733" stroke-width="2" stroke-dasharray="5 3"/></g>`;
  o += `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="none" stroke="#9aa6b1" stroke-width="1.2"/>`;
  o += htext(box.x + 6, box.y + 16, '俯視（模型）', { size: 12, bold: true, color: '#1d2733' }) + htext(box.x + 6, box.y + box.h - 7, cap, { size: 12, bold: true, color: '#1d2733' });
  return o;
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
// quadrant removal of case A (model order and turns: 示意; the times are the footage's piece events)
const PIECES = [1, 2, 3, 4].map(i => ev(`piece${i}`));
const QORDER = [0, 3, 2, 1];
function quadsAt(s) {
  const quads = [], end = ev('chopper-out') - 6; let rot = 90, cur = -1;
  PIECES.forEach((t0, i) => { const t1 = i < 3 ? PIECES[i + 1] - 1 : end; rot += (i === 0 ? 45 : 90) * ss(t0 - 1, t0, s);
    const pull = ss(t0, t0 + 4, s), eat = ss(t0 + 4, t1, s); if (pull > 0 || eat > 0) quads.push({ q: QORDER[i], pull, eat }); if (s >= t0 - 1 && s < t1) cur = i; });
  return { quads, rot, cur };
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
  if (phIn) {
    let p;
    if (s < ev('sculpt-start')) p = K.capPt(K.norm(st), 1.5, CASE.main.h, 0.6);
    else if (s <= ev('sculpt-end') + 1) { const tip = K.grooveTip(st), ph = 0.5 - 0.5 * Math.cos(2 * Math.PI * (s - ev('sculpt-start')) / 4), up = gPt(st, 0.6, 0, 0.9);   // strokes every 4 s (示意)
      p = [lerp(up[0], tip[0], ph), lerp(up[1], tip[1], ph), lerp(up[2], tip[2], ph)]; }
    else if (s < ev('piece1') - 1) { const N = K.nucOf(K.norm(st)); p = gPt(st, -1.0, N.g1.hw - 0.47, 0.45); }
    else { const Q = quadsAt(s); const q = Q.cur >= 0 ? QORDER[Q.cur] : null, cq = q !== null ? c.nuc.quads.find(e => e.q === q) : null;
      p = cq && cq.eat < 1 ? K.quadTip(st, q) : K.capPt(K.norm(st), 0.5, CASE.main.h, -0.8); }
    if (s >= ev('phaco-out') - 1.5) { const k = ss(ev('phaco-out') - 1.5, ev('phaco-out'), s), q = K.capPt(K.norm(st), 3.8, CASE.main.h, 1.0); p = [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)]; }
    c.inst.push(PHACO(p, { bevel: s >= ev('piece1') - 1 ? 'down' : 'up', occl: s >= ev('piece1') - 1 ? 1 : 0 }));
  }
  if (chIn && s < ev('piece1') - 1 && c.nuc.groove) { const N = K.nucOf(K.norm(st)); if (N) c.inst.push(CHOP(gPt(st, -1.0, -(N.g1.hw - 0.2), 0.4))); }
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
const hyDemo = (prog, o = {}) => ({ cat: { ...BASE, ovd: 1, hydro: { h: CASE.hydroDemo, prog, press: o.press || 0, block: o.block || 0 },
  inst: o.noInst ? [] : [{ kind: 'cannula', via: 'main', at: { h: CASE.hydroDemo, r: 2.95, lift: -0.03 }, bend: true }] } });
DRAW2['1-1'] = T => {
  const prog = 0.08 + 0.5 * T.p(2, 0, 1) + 0.3 * T.p(3, 0, 0.8), st = hyDemo(prog);
  const sv = scope(st, W_SCOPE, 'sL'), A = sv.A;
  let ex = lab('cannula（經主切口）', '', PW - 12, YB, onShaft(sv, st, 0, PH - 70), { side: 'R', color: '#3c4a57', op: T.on(1) });
  if (A.waveFront && prog > 0.12) ex += labNear('波前', 'fluid wave', A.waveFront, -30, -70, { bold: true, color: WARN, lc: WARN, op: T.on(3) });
  ex += note('波的速度為示意', 1);
  const cv = sec(st, W_LENS, 'cR'), B = cv.A;
  let rx = lab('cannula 在撕囊邊緣下', '', PW - 12, 64, B.tip0, { side: 'R', bold: true, color: '#3c4a57', op: T.on(1) });
  if (B.fluidEq) rx += lab('BSS 在囊與皮質之間', '', PW - 12, YB, B.fluidEq, { side: 'R', bold: true, color: BSS, lc: BSS, op: T.on(2) });
  rx += lab('核', 'nucleus', 14, 200, cv.P([-1.4, -L0.zMid]), {});
  rx += lab('後囊', 'posterior capsule', 14, YB - 30, B.postPole, { color: CAP, lc: CAP, op: T.on(2) });
  rx += VIEWS.sbar(cv.k, 1, 1) + note('液體層畫成 0.15 mm（示意）', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: CAT_T } };
};
// right panel during a footage hydrodissection pass: the section through the injection site (the cannula comes through the main incision,
// which is not in that plane: it is drawn in the inset only)
function hydroR(f, o = {}) {
  const hy = f.st.hy, h = hy ? hy.h : CASE.hydro[0].h, st = { cat: { ...f.st.cat, inst: [] } };
  const cv = sec(st, W_LENS, 'cR', { hp: h }), B = cv.A;
  let svg = cv.svg + inset(f.st.cat.hydro ? { cat: f.st.cat } : st, h, W_LENS.x, W_LENS.x + W_LENS.w, BOX_TL, 'iR');
  let ex = '';
  if (B.fluidEq && f.st.cat.hydro && f.st.cat.hydro.prog > 0.05) ex += lab('BSS 在囊與皮質之間', '', PW - 12, YB, B.fluidEq, { side: 'R', bold: true, color: BSS, lc: BSS });
  ex += lab('核', 'nucleus', PW - 12, 64, cv.P([1.2, -L0.zMid]), { side: 'R' });
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
DRAW2['1-3'] = T => {
  const f = footSeg(T, 'hydro23'), L = f.L, k1 = T.on(1, 0.8, -0.3);
  if (k1 < 0.5) return { L, R: hydroR(f) };
  // lines 1–3: the model demonstration — inject, press the centre (fluid released over the rhexis rim), then nudge the nucleus round (示意)
  const press = T.p(1, 0.35, 0.95), st = hyDemo(1, { press, noInst: T.u > T.en(1) });
  const cv = sec(st, W_LENS, 'cR'), B = cv.A;
  let svg = cv.svg, ex = '';
  if (press > 0.05) { const c0 = cv.P([0, -(L0.za + 1.4)]), c1 = cv.P([0, -(L0.za + 0.25)]); svg += `<g opacity="${(T.on(1) * (1 - T.on(2, 0.5))).toFixed(2)}">${arrowH(c0, c1, COL.accent, 'arrA', 3.4)}</g>`;
    ex += lab('輕壓中央', 'press', 14, 64, c0, { bold: true, color: COL.accent, lc: COL.accent, op: T.on(1) * (1 - T.on(2, 0.5)) }); }
  if (B['release+']) ex += lab('液體排到前房', '', PW - 12, 64, cv.P(B['release+'] ? cv.r.A['release+'] : [0, 0]), { side: 'R', bold: true, color: BSS, lc: BSS, op: ss(0.3, 0.7, press) });
  // line 2: a curved arrow round the nucleus on an inset microscope view (示意)
  const k2 = T.on(2, 0.8);
  if (k2 > 0) { const box = { x: PW - 170, y: PH - 210, w: 160, h: 160 }, v = scopeBox(st, W_INSET, 'iR3', box), c = v.P([0, 0]), r = 3.1 * v.k, pts = [];
    for (let a = -150; a <= 60; a += 8) { const t = a * Math.PI / 180; pts.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
    svg += `<g opacity="${k2.toFixed(2)}"><rect x="${box.x - 2}" y="${box.y - 2}" width="${box.w + 4}" height="${box.h + 4}" rx="4" fill="#fff"/>${v.svg}<path d="${pathOf(pts)}" fill="none" stroke="#ffd34d" stroke-width="3.2" marker-end="url(#arrM)"/>` +
      htext(box.x + 6, box.y + 16, '俯視（模型）', { size: 12, bold: true, color: '#1d2733' }) + `</g>`;
    ex += lab('推核：確認轉得動', 'rotate', box.x - 16, box.y + 40, [c[0] - r, c[1]], { side: 'R', bold: true, color: '#7a4b00', lc: '#b86e00', op: k2 }); }
  ex += tag('模型示範：標準做法', 1, COL.accent, 34, PW / 2 + 40) + VIEWS.sbar(cv.k, 1, 1) + note('壓的力量與液體的路徑為示意', 1);
  return { L, R: { svg, extra: ex, P: CAT_T } };
};
DRAW2['1-4'] = T => {
  // routine (pressed, fluid out) | capsular block (示意), the same section through the injection site
  const k = T.on(0, 2.0, 0.3), stN = hyDemo(1, { press: k, noInst: true }), stB = hyDemo(1, { block: k, noInst: true });
  const lv = sec(stN, W_LENS, 'sL'), rv = sec(stB, W_LENS, 'cR'), A = lv.A, B = rv.A;
  const s0 = sec(hyDemo(0, { noInst: true }), W_LENS, 'x0');
  let ex = tag('壓中央：液體排出', 1, COL.accent) + lab('核在原位', '', 14, 64, A.antPole, {});
  if (A['release+']) ex += lab('液體排到前房', '', PW - 12, 64, lv.P(lv.r.A['release+']), { side: 'R', color: BSS, lc: BSS, bold: true, op: ss(0.4, 0.9, k) });
  ex += VIEWS.sbar(lv.k, 1, 1) + note('壓的力量為示意', 1);
  const post0 = s0.A.postPole;
  let rsv = rv.svg + `<path d="M${(post0[0] - 70).toFixed(1)} ${post0[1].toFixed(1)}H${(post0[0] + 70).toFixed(1)}" stroke="${WARN}" stroke-width="1.6" stroke-dasharray="5 4" opacity="${k.toFixed(2)}"/>`;
  let rx = tag('打太多：capsular block', 1, WARN);
  rx += lab('核往前頂住撕囊口', '', 14, 64, B.antPole, { bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.8, k) });
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
  let ex = lab('phaco（經主切口）', '', 14, 64, cv.Q(g.sEnd), { color: '#3c4a57' });
  ex += lab('灌流', 'irrigation', PW - 12, 64, cv.Q(g.ports[0]), { side: 'R', bold: true, color: BSS, lc: BSS, op: F.irr ? 1 : 0 });
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
  if (g0) { const g = K.instGeom(K.norm(st), g0); rx += lab('phaco', '', 14, 64, cv.Q(g.sEnd), { color: '#3c4a57' }); }
  if (B.grooveFloor && st.cat.nuc.groove.dep > 0.15) rx += lab('槽底', 'floor', PW - 12, YB, B.grooveFloor, { side: 'R', bold: true, color: BROWN, lc: BROWN });
  const F = FL.state({ pedal: g0 && f.s >= ev('sculpt-start') ? 2.5 : g0 ? 1 : 0, occl: 0, set: 'sculpt' });
  rx += machine(PW - 232, 8, 222, F, { title: '腳踏（依動作推定，示意）', rows: ['irr', 'flow', 'vac', 'us'] });
  rx += note('深度依錄影時間重建（示意）', 1);
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
    svg = cv.svg; rx = lab('近切口：斜坡，刻不深', 'ramp', 14, YB, cv.P([-1.6, -(L0.zMid + 0.6)]), { bold: true, color: WARN, lc: WARN }) +
      (B.grooveFloor ? lab('最深在對側', 'deepest', PW - 12, YB, B.grooveFloor, { side: 'R', bold: true, color: BROWN, lc: BROWN }) : '') + lab('phaco（經主切口）', '', 14, 64, cv.Q(K.instGeom(K.norm(st3i), K.norm(st3i).inst[0]).sEnd), { color: '#3c4a57' });
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
  let rx = lab('phaco', '', B.tip0 && B.tip0[0] > PW / 2 ? PW - 12 : 14, 64, B.tip0, { side: B.tip0 && B.tip0[0] > PW / 2 ? 'R' : undefined, color: '#3c4a57' });
  rx += lab('chopper', '', B.tip1 && B.tip1[0] > PW / 2 ? PW - 12 : 14, 112, B.tip1, { side: B.tip1 && B.tip1[0] > PW / 2 ? 'R' : undefined, color: '#3c4a57' });
  rx += lab('往兩側推', 'push apart', PW / 2 - 70, PH - 70, null, { bold: true, color: COL.accent, op: T.on(1) });
  if (B.crack) rx += lab('裂縫貫穿後板', 'crack', 14, YB, B.crack[1], { bold: true, color: BROWN, lc: BROWN, op: T.on(2) });
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
  if (B.tip0) rx += leftOf(B.tip0, B.tip1) || !B.tip1 ? lab('phaco', '', 14, 64, B.tip0, { color: '#3c4a57' }) : lab('phaco', '', PW - 12, 64, B.tip0, { side: 'R', color: '#3c4a57' });
  if (B.tip1) rx += leftOf(B.tip1, B.tip0) ? lab('chopper', '', 14, 64, B.tip1, { color: '#3c4a57' }) : lab('chopper（側切口）', '', PW - 12, 64, B.tip1, { side: 'R', color: '#3c4a57' });
  if (B.crack) rx += lab('裂縫', 'crack', 14, YB, B.crack[1], { bold: true, color: BROWN, lc: BROWN });
  rx += VIEWS.sbar(xv.k, 1, 1) + note('裂縫進度依錄影時間重建；器械位置示意', 1);
  return { L, R: { svg: xv.svg, extra: rx, P: XSYNC_T } };
};
DRAW2['4-3'] = T => {
  const f = footSeg(T, 'divide'), L = f.L;
  const st = { cat: { ...f.st.cat, inst: [] } }, sv = scope(st, W_SCOPE_N, 'cR'), A = sv.A, s = f.s;
  let rx = '';
  const kT = ss(ev('turn-start'), ev('turn-end'), s);
  if (kT > 0 && kT < 1) { const c = sv.P([0, 0]), r = 3.4 * sv.k, a0 = -120, pts = []; for (let a = a0; a <= a0 + 90 * kT + 1; a += 6) { const t = a * Math.PI / 180; pts.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
    if (pts.length > 1) rx += `<path d="${pathOf(pts)}" fill="none" stroke="#ffd34d" stroke-width="3.2" marker-end="url(#arrM)"/>`; }
  if (A.crackEnds && kT >= 1) { const e = A.crackEnds[0][0] > A.crackEnds[1][0] ? A.crackEnds[0] : A.crackEnds[1]; rx += lab('第一道裂縫（轉了 90°）', 'crack 1', PW - 12, Math.min(PH - 60, e[1] + 90), e, { side: 'R', bold: true, color: BROWN, lc: BROWN }); }
  if (A.grooveC2 && s >= ev('groove2-start')) rx += lab('第二道槽', 'groove 2', 14, 112, A.grooveC2, { bold: true, color: BROWN, lc: BROWN });
  rx += tag(s < ev('turn-start') ? '模型：分開的兩半' : s < ev('groove2-start') ? '轉 90°' : s < ev('crack2-start') ? '第二道槽' : '第二次分核 → 四塊', 1, COL.accent);
  rx += note('依錄影時間；轉的角度與第二道槽為示意', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_SYNC_T } };
};

// ---------------------------------------------------------------- 5 移除核塊
// one quadrant (model q 0, turned to the far side of the main-incision section): pull 0→1 then eat 0→1
const QSTATE = (pull, eat, o = {}) => { const nuc = DIVIDED({ rot: 135, quads: [{ q: 0, pull, eat }] }), st = { cat: { ...BASE, nuc, surge: o.surge || 0 } };
  return o.noTip ? st : { cat: { ...st.cat, inst: [PHACO(o.tip || K.quadTip(st, 0), { bevel: 'down', occl: 1 })] } }; };
DRAW2['5-1'] = T => {
  const pull = T.p(3, 0.05, 0.6), eat = T.p(3, 0.65, 1) * 0.6 + 0.4 * T.p(4, 0, 1), st = QSTATE(pull, eat);
  const cv = sec(st, W_CAT, 'sL'), B = cv.A;
  let ex = '';
  if (B.tip0) ex += lab('phaco 口吸住核塊', 'occlusion', 14, 64, B.tip0, { bold: true, color: '#3c4a57', op: T.on(1) });
  if (B.quadApex0) ex += lab('核塊拉到中央', 'quadrant', PW - 12, 64, B.quadApex0, { side: 'R', bold: true, color: NUC, lc: NUC, op: T.on(3) });
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
DRAW2['5-2'] = T => {
  const f = footSeg(T, 'quads', { at0: T.st(1) + 0.3 - FOOTAGE.videoTime('quads', 476.0) }), L = f.L, op = frozenOp('quads', f.tau, 476.0);
  if (op > 0) L.extra = labNear('露出更紅的 red reflex', 'reflex', fpt('quads', 'reflex', f.tau), 40, -10, { bold: true, color: '#7a4b00', lc: '#ffd34d', op }) +
    labNear('chopper', '', fpt('quads', 'chopper-tip', f.tau), -20, 90, { bold: true, op });
  const st = { cat: f.st.cat }, cv = sec(st, W_CAT, 'cR'), B = cv.A;
  let rx = '';
  if (B.tip0) rx += lab('phaco', '', 14, 64, B.tip0, { color: '#3c4a57' });
  const Q = quadsAt(f.s); if (Q.cur >= 0 && B['quadApex' + QORDER[Q.cur]]) rx += lab(`第 ${Q.cur + 1} 塊`, '', PW - 12, 64, B['quadApex' + QORDER[Q.cur]], { side: 'R', bold: true, color: NUC, lc: NUC });
  rx += note('核塊的時間依錄影、順序與位置為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['5-3'] = T => {
  // left: the quadrant held at the periphery near the posterior capsule (pull small) — the break there; right: the timeline (vacuum, chamber)
  const tB = T.st(1) + 0.6, tt = T.u - tB, dip = FL.surge(tt, 'quad'), kC = T.on(4, 0.8);
  const pull = kC > 0.5 ? 1 : 0.15, eat = tt > 0 ? Math.min(1, 0.4 + tt * 0.5) * (kC > 0.5 ? 0.3 : 1) : 0;
  const st0 = QSTATE(pull, kC > 0.5 ? 0.2 : eat, { surge: kC > 0.5 ? 0 : dip });
  const cv = sec(st0, W_CAT, 'sL'), B = cv.A;
  let ex = '';
  if (kC <= 0.5) { if (B.tip0) ex += lab('在周邊吸住', 'periphery', 14, 64, B.tip0, { bold: true, color: WARN, lc: WARN });
    ex += lab('後囊離口近', 'posterior capsule', PW - 12, YB, cv.P([2.6, -L0.zPost(2.6)]), { side: 'R', bold: true, color: CAP, lc: CAP });
    if (dip > 0.02) ex += tag('surge：前房變淺', 1, WARN); }
  else { if (B.tip0) ex += lab('拉到中央再乳化', 'safe', 14, 64, B.tip0, { bold: true, color: COL.accent, lc: COL.accent }); ex += tag('離後囊遠', 1, COL.accent); }
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
  if (B.tip0) rx += lab('phaco', '', 14, 64, B.tip0, { color: '#3c4a57' });
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
DRAW2['6-2'] = T => {
  // left: the microscope view with the phaco in the main incision and a whitened patch of cornea there (示意); right: the tunnel with the
  // needle in it and the heat (示意)
  const st0 = { cat: { ...BASE, nuc: nucS({ dep: 0.5 }) } }, st = { cat: { ...st0.cat, inst: [PHACO(K.grooveTip(st0))] } };
  const sv = scope(st, { x: -6.0, y: -2.2, w: 12 }, 'sL'), A = sv.A, k0 = T.on(0, 1.4);
  const m = A.mainExt, mi = A.mainInt, c = [(m[0] + mi[0]) / 2, (m[1] + mi[1]) / 2];
  let svg = sv.svg + `<g opacity="${(0.85 * k0).toFixed(2)}"><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(1.9 * sv.k).toFixed(1)}" ry="${(1.2 * sv.k).toFixed(1)}" fill="#f4f6f7" opacity="0.85"/></g>`;
  let ex = labNear('切口附近角膜變白', 'wound burn', c, -60, -40, { bold: true, color: WARN, lc: WARN, op: k0 }) + note('變白的範圍為示意', 1);
  const tv = sec(st, W_TUN, 'cR'), B = tv.A, tn = K.tunnelOf(CASE.main), mid = tv.Q(tn.to3(tn.at(0.5)));
  let rsv = tv.svg + `<g opacity="${(0.55 * T.on(1, 1.0)).toFixed(2)}"><ellipse cx="${mid[0].toFixed(1)}" cy="${mid[1].toFixed(1)}" rx="120" ry="60" fill="url(#heatG)"/></g>` +
    `<defs><radialGradient id="heatG"><stop offset="0" stop-color="#ff5a2a" stop-opacity="0.9"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient></defs>`;
  let rx = labNear('phaco 在主切口隧道裡', '', mid, 40, -90, { color: '#3c4a57' });
  rx += labNear('沒有水流 → 熱帶不走', 'heat', mid, -40, 80, { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  rx += `<g opacity="${T.on(2, 0.6).toFixed(2)}"><rect x="10" y="10" width="${PW - 20}" height="36" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>${text(PW / 2, 34, '第一步：放開 3 段；踩 3 段前先確定有水流', { size: 15.5, bold: true, color: COL.accent, anchor: 'middle' })}</g>`;
  rx += VIEWS.sbar(tv.k, 1, 1) + note('熱的範圍為示意', 1);
  return { L: { svg, extra: ex, P: SCOPE_T }, R: { svg: rsv, extra: rx, P: TUN_T } };
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
