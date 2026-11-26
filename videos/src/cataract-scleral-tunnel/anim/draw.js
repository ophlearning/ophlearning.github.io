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
DRAW2['title'] = T => ({ R: { svg: scope(ST0, W_EYE, 'tR').svg, extra: '', P: SCOPE_T } });
for (const id of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '3-3', '4-1', '4-2', '5-1', '5-2', '6-1', '6-2', '6-3']) DRAW2[id] = T => base2(ST0, 'p' + id.replace('-', ''));
DRAW2['7'] = T => ({ F: { svg: '', extra: '', P: { title: '練習清單', orient: '' } } });
