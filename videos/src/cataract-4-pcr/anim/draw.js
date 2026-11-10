// ============================================================================
// Drawing of every segment of video ④ (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full) / { R } (title):
// { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Left: case B footage (術者視角, LEFT eye OS, footage.js) or the model; right: the globe model (videos/models/globe/cataract.js, CARD.md 白內障 ④) —
// the meridional section through the main incision (11–5: left = 11 o'clock = the main incision, up = anterior) or the microscope view
// (下＝12 點、右＝9 點 nasal, never mirrored). In footage segments the right panel is a function of the source time of the frame on screen
// (caseAt…(s)): instruments only while the recording shows them, through the incision the recording shows.
// The PCR cues are 動畫示意 (the recording's red reflex is too weak to show them); rent, piece and gel geometry are 示意 (CARD.md 白內障 ④).
// Case parameters: params.js (CASE).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, K = CATARACT, G = GLOBE;
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op = 1, col = COL.accent, y = 34, x = PW / 2) => htext(x, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const wtext = (x, y, s, o = {}) => htext(x, y, s, { size: 15, bold: true, color: '#fff', ...o }).replace('stroke="#fff"', 'stroke="#1d2733"');   // white text on footage
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// a label whose leader starts dx, dy px from its anchor (the text left of that point when dx < 0, right of it otherwise)
const labNear = (zh, en, a, dx, dy, o = {}) => { const w = lw(zh, en, o), x = a[0] + dx, y = a[1] + dy + (o.size || 15) * 0.36;
  return dx < 0 ? lab(zh, en, x - w - 7, y, a, o) : lab(zh, en, x + w + 7, y, a, { ...o, side: 'R' }); };
const box = (y, s, op, col = COL.accent, h = 36, size = 16, W = PW) => `<g opacity="${(+op).toFixed(2)}"><rect x="10" y="${y}" width="${W - 20}" height="${h}" rx="8" fill="#fff" stroke="${col}" stroke-width="1.6"/>${text(W / 2, y + h / 2 + size * 0.36, s, { size, bold: true, color: col, anchor: 'middle' })}</g>`;
const arrowPath = (pts, col, w = 2.2, op = 1) => { if (pts.length < 2) return ''; const a = pts[pts.length - 2], b = pts[pts.length - 1], d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1, u = [d[0] / l, d[1] / l], n = [-u[1], u[0]], h = 9;
  const dd = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  return `<g opacity="${op}"><path d="${dd}" fill="none" stroke="#fff" stroke-width="${w + 3}" opacity="0.8"/><path d="${dd}" fill="none" stroke="${col}" stroke-width="${w}"/><path d="M${b[0].toFixed(1)} ${b[1].toFixed(1)}L${(b[0] - u[0] * h + n[0] * h * 0.55).toFixed(1)} ${(b[1] - u[1] * h + n[1] * h * 0.55).toFixed(1)}L${(b[0] - u[0] * h - n[0] * h * 0.55).toFixed(1)} ${(b[1] - u[1] * h - n[1] * h * 0.55).toFixed(1)}Z" fill="${col}"/></g>`; };
const YB = PH - 48;
const WARN = '#b3262c', NUC = '#7a5418', CAP = '#1d5d93', OVDC = '#5b4b9a', IOLC = '#7a6a1e', INK2 = '#3c4a57', VITC = '#4f6478', IRRC = '#2a8fc7', YEL = '#7a4b00', YELL = '#ffd34d';

// ---------------------------------------------------------------- case states (params.js) and views
const MAIN = { ...CASE.main, cut: 1 }, SIDE = { ...CASE.side, cut: 1 }, HP = CASE.HP, L0 = K.LENS, CN = K.CN;
const CCC = { ...CASE.ccc, cut: 1, prog: 1, fold: 1, out: 1 };
const BASE = { main: MAIN, side: SIDE, ccc: CCC };
const cat = x => ({ eye: CASE.eye, cat: Object.assign({}, BASE, x) });
const RENT = CASE.rent, PIECE = CASE.piece;
const frag = st => K.pcrOf(st).FR;
// the phaco tip on the piece's top (0.4 mm toward 11 from its centre) before the rent: after the rent it stays there while the piece drops away
const onTop = (FR, a, b) => { let n = 0; while (FR.fld(FR.at3(a, b, n)) < 0 && n < 2) n += 0.005; const q = FR.at3(a, b, n); return [q[0], q[1], q[2] + 0.47]; };
const REST = cat({ bag: {}, pcr: { rent: RENT, frag: PIECE } }), PHC = { kind: 'phaco', p: onTop(frag(REST), 0.4, 0.1), bevel: 'up' };
const CHOP = { kind: 'chopper', via: 'side', p: onTop(frag(REST), -1.4, 1.2) };            // second instrument on the piece (示意 pose)
const NORM = cat({ bag: {}, pcr: { frag: PIECE }, inst: [PHC] });                             // normal: no rent, the piece under the tip
const pcrSt = (o = {}) => cat({ bag: {}, pcr: { rent: RENT, deep: o.deep ?? 1, vit: o.vit || { bulge: 1 }, frag: { ...PIECE, sink: o.sink ?? 1 } }, inst: o.inst || [PHC] });
const REC = pcrSt();
const PRO = k => pcrSt({ vit: { prolapse: k, to: 'tip' } });
const DROP = cat({ bag: {}, pcr: { rent: { ...RENT, size: 2.4, ext: 0.5 }, vit: { prolapse: 0.35, to: 'main' }, frag: { ...PIECE, drop: 1 } } });
// first step: tip in place, dispersive OVD through the side port onto the rent (Rajan 2025); the cannula's tip over the rent, inside the bag
const OC = (() => { const P = K.pcrOf(REC), R0 = K.pcrOf(REST); return [P.R.c3[0] * 0.6, P.R.c3[1] * 0.6, R0.zRim3 - 0.6]; })();
const OVDCAN = { kind: 'cannula', via: 'side', p: OC };
const FIRST = (k, o = {}) => cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 1 }, ovdD: { tamp: k }, frag: { ...PIECE, sink: 1 } }, inst: o.inst || [PHC, OVDCAN] });
const WITH = k => cat({ bag: {}, pcr: { rent: { ...RENT, ext: 0.6 * k }, collapse: k, frag: { ...PIECE, sink: 1 } } });
// the piece floated on dispersive OVD (bag and lower chamber filled, endothelium coated), a straight instrument under it, the phaco on its straight edge
const FLOAT = (fl, eat) => cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: 1, coat: fl, fill: fl * (CN.pcr.frag.cushion + 0.25) }, frag: { h: 5, float: fl, eat } } });
const phacoAt = st => { const F = frag(st); return { kind: 'phaco', p: F.at3(0, F.bE - 0.42, -0.6), bevel: 'down', occl: 1 }; };
const spatAt = st => ({ kind: 'spatula', via: 'side', p: frag(st).under(0.8) });
const FLT = (eat = 0.25) => { const s0 = FLOAT(1, eat); return cat({ ...s0.cat, inst: [phacoAt(s0), spatAt(s0)] }); };
// bimanual limbal anterior vitrectomy: cutter through the main incision at the rent (port up), irrigation through the side port high in the chamber;
// the emptied bag has collapsed (示意: only then does a straight cutter from 11 o'clock reach the rent)
const CLEAN = { cortex: new Array(12).fill(0), sub: 0 }, BAGC = { ...CLEAN, collapse: 1 };
const PV = K.pcrOf(cat({ bag: BAGC, pcr: { rent: RENT } })), CUT = { kind: 'vitrector', p: [PV.R.c3[0], PV.R.c3[1], PV.R.c3[2] - 0.25], port: 'up' };
const IRR = { kind: 'irrig', via: 'side', p: (() => { const d = G.clockDir(CASE.side.h); return [d[0] * 3.0, d[1] * 3.0, 9.9]; })() };
const VIT = (cut, ta = 0, inst = [CUT, IRR], to = 'main') => cat({ bag: BAGC, pcr: { rent: RENT, vit: { prolapse: 1, to, cut, ta } }, inst });
// pars plana: 23G cutter 3.5 mm behind the 11 o'clock limbus (Rajan 2025: 3.5–4 mm; the site 示意), irrigation through the side port
const P0 = K.pcrOf(cat({ bag: {}, pcr: { rent: RENT } })), PPT = [P0.R.c3[0], P0.R.c3[1], P0.zHy3(P0.R.c0[0], P0.R.c0[1]) - 2.4];
const PPS = cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 0.55, to: 'main', cut: 0.2, ta: 1 }, pp: { h: CASE.main.h, s: CN.pcr.pp.s } }, inst: [{ kind: 'vitrector', via: 'pp', p: PPT, port: 'up' }, IRR] });
// IOL: in the bag (small rent, ③'s final position), one-piece in the sulcus (the case, by the surgeon's account), three-piece in the sulcus, optic capture
const BAGIOL = cat({ bag: BAGC, ovdBag: 1, ovdOut: { behind: 1, front: 1 }, pcr: { rent: { ...RENT, size: 0.6 } }, iol: { rot: -35 } });
const SUL1 = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', rot: -35, chafe: 1 } });
const SUL3 = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', kind: '3pc', rot: -35, chafe: 1 } });
const CAPT = cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, iol: { pos: 'sulcus', kind: '3pc', capture: 1, rot: -35, chafe: 1 } });
const under = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L0.zAnt(r) - dep]; };
const IA = (p, o = {}) => ({ kind: 'ia', p, port: o.port || 'up', occl: o.occl || 0 });
const P_RIM5 = under(HP, 3.0, 0.55);                                                       // I/A under the rim on the 5 o'clock side (straight tip reaches it)

const W_DEEP = { x: -9.1, y: -12.6, w: 18.2 }, W_SEC = { x: -6.4, y: -12.7, w: 12.8 }, W_IOL = { x: -7.4, y: -10.9, w: 6.6 }, W_IOL3 = { x: -7.6, y: -11.1, w: 7.0 }, W_FRONT = { x: -6.6, y: -12.9, w: 11.6 };
const W_SCOPE = { x: -6.0, y: -4.06, w: 12 }, W_SCOPE_N = { x: -4.8, y: -3.25, w: 9.6 }, W_SCOPE_W = { x: -12, y: -6.6, w: 24 };
const SEC_T = { title: '經主切口的切面（模型）', orient: '左＝11 點（主切口）　上＝前' };
const SECX_T = { title: '經主切口的切面（模型；IOL 為投影）', orient: '左＝11 點　上＝前' };
const SYNC_T = { title: '經主切口的切面（模型，依錄影時間）', orient: '左＝11 點　上＝前' };
const NORM_T = { title: '正常（模型）', orient: '左＝11 點（主切口）　上＝前' };
const PCR_T = { title: 'PCR（動畫示意）', orient: '左＝11 點（主切口）　上＝前' };
const SCOPE_T = { title: '術者視角　左眼 OS（模型）', orient: '下＝12 點　右＝9 點 nasal' };
const SCOPEN_T = { title: '正常：術者視角（模型）', orient: '左眼 OS　右＝nasal' };
const SCOPEP_T = { title: 'PCR：術者視角（動畫示意）', orient: '左眼 OS　右＝nasal' };
const TXT_T = (t) => ({ title: t, orient: '' });
window.PRELOAD_EXTRA = JSON.stringify([SEC_T, SECX_T, SYNC_T, NORM_T, PCR_T, SCOPE_T, SCOPEN_T, SCOPEP_T]) +
  '經主切口的切面模型依錄影時間器械為投影術者視角左眼正常動畫示意下點右上前左主切口停格看得到看不清楚看不出可能不確定0123456789.–→✓✗×';

const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = K.section({ st, h: o.hp ?? HP, off: o.off || 0, cut: !!o.cut, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 260).toFixed(4), id });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), r = K.enface({ st, id, surgeon: 12 }), A = mapA(r.A, c.P);
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A, P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
// a point of the remaining piece: the end nearest the rent (sinking pole) or its round side away from the tip (label anchors, panel px)
const fragPt = (v, st, which) => { const P = K.pcrOf(st), F = P.FR; if (!F) return null; let best = null;
  const tgt = which === 'pole' && P.R ? P.R.c3 : F.at3(0, CN.pcr.frag.rb * 0.6, 0);
  for (const q of F.pts) { const d = Math.hypot(q[0] - tgt[0], q[1] - tgt[1]) + (which === 'pole' ? 0 : Math.abs(q[2] - tgt[2])); if (!best || d < best[0]) best = [d, q]; }
  return v.Q(best[1]); };
// a point on instrument i, d mm back from its tip along the shaft (label anchor on the visible metal)
const instPt = (v, st, i, d = 0.6) => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]), o = g.bend && d > G.len(G.sub(g.bend, g.tip)) ? g.bend : g.tip, ax = g.bend && o === g.tip ? G.unit(G.sub(g.bend, g.tip)) : g.axis; return v.Q([o[0] + ax[0] * d, o[1] + ax[1] * d, o[2] + ax[2] * d]); };
const secPt = (v, r, z) => v.P([r, -z]);
const leftmost = (v, pts) => pts && pts.length ? v.P(pts.reduce((a, q) => q[0] < a[0] ? q : a)) : null;           // the 11 o'clock side of a list of plane points
// where a haptic crosses this section on the 11 o'clock side (the projected tip is off the plane)
const hapPt = (v, st) => { const IO = K.iolOf(K.norm(st)); if (!IO) return null; const n = [v.r.pl.U[1], -v.r.pl.U[0], 0]; let best = null;
  for (const H of IO.haps) for (const p of H) { const d = Math.abs((p[0] - v.r.pl.O[0]) * n[0] + (p[1] - v.r.pl.O[1]) * n[1]), q = G.toPlane(v.r.pl, p); if (q[0] < -3.2 && (!best || d < best[0])) best = [d, q]; }
  return best ? v.P(best[1]) : null; };                                                     // section point: r mm toward 5 o'clock (− = toward 11), eye z
const inPanel = (q, m = 24) => q && q[0] > m && q[0] < PW - m && q[1] > m && q[1] < PH - m;
// the rent's edge point farthest from the piece (where the clear area shows), in a microscope view
const clearPt = v => { const E = v.r.A.rentEdge, F = v.r.A.frag; if (!E) return null; const f = F || E[0]; let b = E[0]; for (const q of E) if (Math.hypot(q[0] - f[0], q[1] - f[1]) > Math.hypot(b[0] - f[0], b[1] - f[1])) b = q; return v.P(b); };
const rentEnd = v => { const E = v.r.A.rentEnds || []; return E.length ? v.P(E[E.length - 1]) : null; };
const postQ = (v, r, h) => { const d = G.clockDir(h); return v.Q([r * d[0], r * d[1], L0.zPost(r)]); };
const sbar = v => VIEWS.sbar(v.k, 1, 1);
// text panel (full white, rows of cards)
const rbox = (x, y, w, h, title, rows, op, col = COL.accent, ts = 18, rs = 16.5) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="${col}" stroke-width="1.5"/>${text(x + 16, y + 28, title, { size: ts, bold: true, color: col })}` +
  rows.map((r, i) => text(x + 16, y + 60 + i * 28, r[0], { size: rs, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;

// ---------------------------------------------------------------- footage clock
// parts: [{ clip, ev, line, dt }]: event `ev` of `clip` lands at the start of narration line `line` (+dt s); the last part already started is shown
// (the first one is shown from the segment start). The source time on screen is kept in window.LAST_FOOT for check.js.
const FOOT_PARTS = {
  '2-6': [{ clip: 'moment', ev: 'phaco-out', line: 2, dt: -0.2 }, { clip: 'moment', ev: 'm-frz', line: 3, from: 'line' }],
  '3-3': [{ clip: 'withdraw', ev: 'phaco-out', line: 0, dt: 0.6 }, { clip: 'ovd1', ev: 'can-in', line: 2 }],
  '4-2': [{ clip: 'lev', ev: 'lev-in', line: 0, dt: 0.3 }, { clip: 'lev', ev: 'lev-frz', line: 2, from: 'line' }],
  '4-3': [{ clip: 'emul', ev: 'ph-in', line: 0, dt: 0.3 }],
  '5-1': [{ clip: 'ia', ev: 'ia', line: 1, dt: 0.3 }],
  '5-4': [{ clip: 'vit', ev: 'two-in', line: 0, dt: 0.3 }, { clip: 'vit', ev: 'vit-frz', line: 1, from: 'line' }],
  '5-5': [{ clip: 'ta', ev: 'ta-white', line: 1, dt: 0.8 }, { clip: 'ta', ev: 'ta-frz', line: 2, from: 'line' }, { clip: 'ta2', ev: 'clear', line: 3, dt: 2.6, from: 'line' }],
  '6-3': [{ clip: 'iol', ev: 'unfold', line: 0, dt: 2.2 }, { clip: 'iol2', ev: 'hook-in', line: 1, dt: 0.3 }],
};
// a part takes over when its clip starts (a) — or, with from: 'line', when its narration line starts (a jump, e.g. onto the freeze a 「停格」 line names)
function footClock(id, T) {
  const parts = FOOT_PARTS[id]; let pick = parts[0], at0 = T.st(parts[0].line) + (parts[0].dt || 0) - FOOTAGE.ev(parts[0].clip, parts[0].ev);
  for (const p of parts.slice(1)) { const a = T.st(p.line) + (p.dt || 0) - FOOTAGE.ev(p.clip, p.ev), on = p.from === 'line' ? T.st(p.line) : a; if (T.u >= on) { pick = p; at0 = a; } }
  return { clip: pick.clip, tau: T.u - at0 };
}
function fplay(T, id) { const { clip, tau } = footClock(id, T), L = FOOTAGE.panel(clip, tau); return { L, clip, tau, s: L.s }; }
// for check.js: the footage on screen in segment id at video time t (the same clock the drawing uses)
window.FOOT_AT = (id, t) => { const s = TL_EXPORT.find(x => x.id === id), T = KIT.timing(s, t), r = footClock(id, T), a = FOOTAGE.at(r.clip, r.tau); return { clip: r.clip, s: a.s, frozen: !!a.frozen }; };
window.FOOT_SEGS = Object.keys(FOOT_PARTS);
const EVS = (() => { const o = {}; for (const [id, c] of Object.entries(FOOTAGE_DEF.clips)) for (const [n, v] of Object.entries(c.events || {})) o[n] = v; return o; })();
const ev = n => { if (EVS[n] === undefined) throw new Error('no footage event ' + n); return EVS[n]; };
const fpt = (clip, name, tau) => FOOTAGE.point(clip, name, tau);
const frozenOp = (clip, tau, at, d = 0.35) => { const f = (FOOTAGE_DEF.clips[clip].freeze || []).find(z => z.at === at); if (!f) return 0; const a = FOOTAGE.videoTime(clip, at); return ss(a, a + d, tau) * (1 - ss(a + f.dur - d, a + f.dur, tau)); };
const flab = (zh, en, a, dx, dy, op) => labNear(zh, en, a, dx, dy, { bold: true, color: YEL, lc: YELL, op });

// ---------------------------------------------------------------- footage clock → model state (the right panel of footage segments)
// 3-3 (withdraw, ovd1): phaco + chopper until they leave; nothing for ≈ 10 s; the side-port cannula; OVD over the rent (amount 示意). The rent is
// drawn as 示意 (the recording does not show it); the chamber is not drawn collapsing (the recording cannot show its depth either).
function firstAt(s) {
  const inst = [], k = ss(ev('can-in') + 1, ev('can-out'), s);
  if (s < ev('phaco-out')) inst.push(PHC, CHOP); else if (s < ev('out')) inst.push(CHOP);
  if (s >= ev('can-in') && s <= ev('can-out')) inst.push(OVDCAN);
  return cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: k }, frag: PIECE }, inst });
}
// 4-2 (lev): a cannula through the main incision under the piece; the piece floated to the rhexis plane (height 示意) on OVD
const LEVCAN = st => { const P = K.pcrOf(st), F = P.FR, q = F.under(0.15), rmax = CN.cccD / 2 - 0.6, r = Math.hypot(q[0], q[1]), k = r > rmax ? rmax / r : 1;
  return { kind: 'cannula', via: 'main', p: [q[0] * k, q[1] * k, Math.max(q[2], P.zRim3 + 0.2)] }; };
function levAt(s) {
  const fl = ss(ev('lev-in') + 4, ev('lev-out') - 6, s), st = FLOAT(fl, 0);
  return s >= ev('lev-in') && s <= ev('lev-out') ? cat({ ...st.cat, inst: [LEVCAN(st)] }) : st;
}
// 4-3 (emul): phaco on the straight edge, the straight instrument under the piece; eaten from ph-in to ph-out
function emulAt(s) {
  const e = lerp(0.05, 0.95, ss(ev('ph-in') + 3, ev('ph-out') - 6, s));
  if (s >= ev('ph-out')) return cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: 1, coat: 1, fill: CN.pcr.frag.cushion + 0.25 } } });
  const st = FLOAT(1, e); return s >= ev('ph-in') ? cat({ ...st.cat, inst: [phacoAt(st), spatAt(st)] }) : st;
}
// 5-1 (ia): coaxial I/A under the rim on the 5 o'clock side, cortex cleared over the clip (sectors 示意), OVD over the rent
function iaAt(s, c) { const k = ss(c.in, c.out, s); return cat({ bag: { cortex: K.cortexSweep(k, HP, 1), sub: 1 - k }, pcr: { rent: RENT, ovdD: { tamp: 1 } }, inst: [IA(P_RIM5)] }); }
// 5-4 (vit): the gel cut over the clip (amount 示意); both instruments from two-in
function vitAt(s, c) { const k = lerp(0.1, 0.75, ss(ev('two-in'), c.out, s)); return VIT(k, 0, s >= ev('two-in') ? [CUT, IRR] : []); }
window.CASE_AT = { firstAt, levAt, emulAt, iaAt: s => iaAt(s, FOOTAGE_DEF.clips.ia), vitAt: s => vitAt(s, FOOTAGE_DEF.clips.vit) };

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const R = FOOTAGE.panel('title', 0, { badge: false });
  R.extra = wtext(14, PH - 14, '本例：雙手前段玻璃體切除（錄影 24:25）', { size: 14 });
  return { R };
};

// ---------------------------------------------------------------- 1 為什麼要早認出
DRAW2['1-1'] = T => {
  const sv = scope(NORM, W_SCOPE, 'sL'), A = sv.A;
  let ex = '';
  ex += labNear('最後一塊核', 'last piece', fragPt(sv, NORM, 'round'), 60, -70, { bold: true, color: NUC, lc: NUC, op: T.on(2) });
  ex += labNear('phaco', '', instPt(sv, NORM, 0, 1.4), 60, 60, { color: INK2 });
  ex += note('模型示意', 1);
  const cv = sec(NORM, W_SEC, 'cR');
  let rx = lab('後囊 約 3.5 µm', 'posterior capsule', PW - 12, YB, postQ(cv, 1.2, HP), { side: 'R', bold: true, color: CAP, lc: CAP });
  rx += labNear('前玻璃體面（緊貼後囊）', '', secPt(cv, -1.6, L0.zPost(1.6) - 0.1), -10, -40, { color: VITC, lc: VITC, op: T.on(0) });
  if (cv.A.tip0) rx += labNear('tip 往下吃，靠近後囊', '', cv.A.tip0, 30, -120, { bold: true, color: WARN, lc: WARN, op: T.on(2) });
  rx += sbar(cv) + note('核塊的大小為示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPE_T }, R: { svg: cv.svg, extra: rx, P: SEC_T } };
};
DRAW2['1-2'] = T => {
  const lv = sec(DROP, W_DEEP, 'sL');
  let ex = tag('核掉進玻璃體腔', 1, WARN);
  if (lv.A.frag) ex += labNear('掉落的核塊', 'dropped', lv.A.frag, 70, -30, { bold: true, color: NUC, lc: NUC });
  const re = rentEnd(lv); if (re) ex += labNear('破口變大', 'rent', re, 40, -70, { color: CAP, lc: CAP });
  ex += note('動畫示意', 1);
  const st = WITH(1), rv = sec(st, W_SEC, 'cR');
  let rx = tag('玻璃體跑到前面', 1, WARN);
  if (rv.A.vitTip) rx += labNear('玻璃體到切口', 'vitreous', rv.A.vitTip, 50, 90, { bold: true, color: VITC, lc: VITC });
  rx += box(PH - 110, '沒處理好：CME、RD、眼壓高、感染', T.on(1, 0.6), WARN, 36, 15);
  rx += sbar(rv) + note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: PCR_T }, R: { svg: rv.svg, extra: rx, P: PCR_T } };
};
DRAW2['1-3'] = T => {
  const L = FOOTAGE.panel('case', 0, { badge: false });
  L.extra = wtext(14, PH - 14, '錄影 12:40：硬核、red reflex 弱', { size: 14 });
  const st = cat({ bag: {}, pcr: { frag: PIECE }, inst: [PHC, CHOP] }), sv = scope(st, { x: -7.5, y: -5.07, w: 15 }, 'cR'), OR = K.orient({ eye: 'OS', surgeon: 12 });
  const main = sv.Q(G.P3(CASE.main.h, -0.3, 0)), side = sv.Q(G.P3(CASE.side.h, -0.3, 0));
  let rx = `<rect x="10" y="8" width="252" height="54" rx="6" fill="#1d2733" opacity="0.85"/>` + text(20, 30, `${OR.eyeZh}　術者坐 ${OR.bottom} 點`, { size: 15, bold: true, color: '#fff' }) + text(20, 52, `下＝${OR.bottom} 點　右＝${OR.right} 點 ${OR.rightAnat.en}`, { size: 15, bold: true, color: '#fff' });
  rx += htext(PW - 12, PH / 2 - 60, '鼻側 nasal →', { size: 14, bold: true, color: INK2, anchor: 'end' }) + htext(12, PH / 2 - 60, '← 顳側 temporal', { size: 14, bold: true, color: INK2 });
  rx += labNear('主切口 11 點', 'main', main, 40, -40, { bold: true, color: INK2, op: T.on(1) });
  rx += labNear('side port 2 點', '', side, 40, -60, { bold: true, color: INK2, op: T.on(1) });
  rx += note('模型：不鏡像，鐘點以病人為準', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 2 認出 PCR 的線索
DRAW2['2-1'] = T => {
  const k = T.p(1, 0.3, 0.95), lv = sec(NORM, W_SEC, 'sL'), st = pcrSt({ deep: k, sink: 0, vit: { bulge: k } }), rv = sec(st, W_SEC, 'cR');
  let ex = tag('正常', 1, COL.accent);
  ex += labNear('前房深度', 'ACD', [lv.A.antPole[0], lv.A.antPole[1] - 30], 80, -50, { bold: true, color: COL.accent, lc: COL.accent });
  if (lv.A['pm-']) ex += labNear('瞳孔緣', 'pupil margin', lv.A['pm-'], 10, 70, { color: INK2 });
  ex += sbar(lv) + note('正常', 1);
  let rx = tag('後囊剛破（動畫示意）', 1, WARN);
  rx += labNear('前房變深', 'deeper', [rv.A.antPole[0], rv.A.antPole[1] - 30], 80, -50, { bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.8, k) });
  if (rv.A['pm-']) rx += labNear('瞳孔變大', 'wider', rv.A['pm-'], 10, 70, { bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.8, k) });
  const re = rentEnd(rv); if (re) rx += lab('破口', 'rent', PW - 12, YB, re, { side: 'R', color: CAP, lc: CAP, op: T.on(1) });
  // the normal anterior pole as a dashed line on the PCR side: how far the diaphragm went back
  const y0 = lv.A.antPole[1], y1 = rv.A.antPole[1];
  rx += `<path d="M${rv.A.antPole[0] - 70} ${y0.toFixed(1)}H${rv.A.antPole[0] + 70}" stroke="${COL.accent}" stroke-width="1.6" stroke-dasharray="5 4" opacity="${ss(0.2, 0.6, k).toFixed(2)}"/>`;
  rx += arrowPath([[rv.A.antPole[0] + 60, y0 + 2], [rv.A.antPole[0] + 60, Math.max(y0 + 6, y1 - 2)]], WARN, 2.2, ss(0.3, 0.8, k));
  rx += sbar(rv) + note('量為示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: NORM_T }, R: { svg: rv.svg, extra: rx, P: PCR_T } };
};
DRAW2['2-2'] = T => {
  const k = T.p(2, 0, 0.8), lv = scope(NORM, W_SCOPE_N, 'sL'), st = pcrSt({ sink: Math.max(T.p(1, 0, 1) * 0.5, k), deep: 1 }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = tag('正常：核塊跟著 tip', 1, COL.accent);
  ex += labNear('核塊', 'piece', fragPt(lv, NORM, 'round'), 60, -60, { bold: true, color: NUC, lc: NUC });
  ex += labNear('tip', '', instPt(lv, NORM, 0, 0.4), 70, 50, { color: INK2 });
  ex += note('模型示意', 1);
  let rx = tag('PCR：核塊離開 tip（動畫示意）', 1, WARN);
  rx += labNear('一端歪下去', 'tilting', fragPt(rv, st, 'pole'), -40, 80, { bold: true, color: NUC, lc: NUC, op: T.on(2) });
  rx += labNear('tip 還在原處', '', instPt(rv, st, 0, 0.4), 70, 50, { bold: true, color: WARN, lc: WARN, op: T.on(3) });
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SCOPEN_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};
DRAW2['2-3'] = T => {
  const sv = scope(REC, W_SCOPE_N, 'sL'), c = clearPt(sv);
  let ex = tag('動畫示意', 1, WARN);
  if (c) ex += labNear('特別清亮的區域', 'clear area', c, 90, 40, { bold: true, color: WARN, lc: WARN });
  ex += box(PH - 110, 'I/A 吸到後囊：皺褶匯向吸口、紅光更亮、瞳孔拉尖', T.on(2, 0.6), WARN, 36, 14.5);
  ex += note('左眼 OS　動畫示意', 1);
  const cv = sec(REC, W_SEC, 'cR');
  let rx = '';
  const re = rentEnd(cv); if (re) rx += lab('破口：前面沒有後囊', 'rent', PW - 12, YB, re, { side: 'R', bold: true, color: CAP, lc: CAP });
  if (cv.A.rentC) { const a = cv.A.rentC, y0 = Math.min(PH - 20, a[1] + 40); rx += arrowPath([[a[0] + 20, y0], [a[0] + 20, a[1] - 150]], '#e26b2c', 3, T.on(1)) + htext(a[0] - 200, a[1] - 160, '紅光直接透出（示意）', { size: 14, bold: true, color: '#c4561c', op: T.on(1) }); }
  rx += sbar(cv) + note('動畫示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPEP_T }, R: { svg: cv.svg, extra: rx, P: PCR_T } };
};
DRAW2['2-4'] = T => {
  const k = T.p(0, 0.2, 1) * 0.5 + T.p(1, 0, 0.9) * 0.5, st = PRO(k), lv = sec(st, W_SEC, 'sL'), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = tag('玻璃體跑到前面（動畫示意）', 1, WARN);
  if (lv.A.vitMid && k > 0.4) ex += labNear('玻璃體', 'vitreous', lv.A.vitMid, 60, 80, { bold: true, color: VITC, lc: VITC });
  if (lv.A.tip0) ex += labNear('tip', '', lv.A.tip0, -40, -70, { color: INK2 });
  const re = rentEnd(lv); if (re) ex += lab('破口', 'rent', PW - 12, YB, re, { side: 'R', color: CAP, lc: CAP });
  ex += sbar(lv) + note('形狀為示意', 1);
  let rx = '';
  if (rv.A.vitMid && k > 0.6) rx += labNear('玻璃體條（透明）', 'strand', rv.A.vitMid, 60, 80, { bold: true, color: VITC, lc: VITC });
  rx += box(PH - 110, '玻璃體本身看不到：看到的是核塊跑不動、轉不動', T.on(2, 0.6), INK2, 36, 14.5);
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: PCR_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};
DRAW2['2-5'] = T => {
  const st = pcrSt({ vit: { prolapse: 0.6, to: 'tip' } }), sv = scope(st, W_SCOPE_N, 'sL'), cv = sec(st, W_SEC, 'cR');
  let ex = '';
  const c = clearPt(sv); if (c) ex += labNear('清亮區', 'rent', c, 50, 90, { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  ex += labNear('核塊歪', 'tilt', fragPt(sv, st, 'pole'), -40, 80, { bold: true, color: NUC, lc: NUC, op: T.on(1) });
  ex += labNear('瞳孔變大', 'wider', sv.Q(under(9.5, K.norm(st).pupil / 2, 0)), -20, -60, { color: WARN, lc: WARN, op: T.on(1) });
  ex += note('動畫示意', 1);
  let rx = '';
  rx += labNear('前房變深', 'deeper', [cv.A.antPole[0], cv.A.antPole[1] - 30], 80, -50, { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  if (cv.A.frag) rx += labNear('一端歪進破口', '', cv.A.frag, -60, -60, { bold: true, color: NUC, lc: NUC, op: T.on(1) });
  rx += box(10, '看到任何一個 → 第一步（第 3 章）', T.on(2, 0.6));
  rx += sbar(cv) + note('動畫示意', 1);
  return { L: { svg: sv.svg, extra: ex, P: SCOPEP_T }, R: { svg: cv.svg, extra: rx, P: PCR_T } };
};
DRAW2['2-6'] = T => {
  const f = fplay(T, '2-6'), L = f.L, s = f.s;
  const op = frozenOp('moment', f.tau, 779.0);
  if (op > 0) L.extra = flab('橘紅色反光', 'orange reflex', fpt('moment', 'orange', f.tau), 40, 110, op);
  // right: the four cue groups and what this recording shows of them, revealed with the footage events and the narration
  const rows = [['前房突然變深', '看不清楚', T.on(3)], ['瞳孔一下子變大', '看不清楚', T.on(3)], ['核塊不跟 tip、一端歪', '看不出來', T.on(4)], ['清亮的紅光', '左下的橘紅色反光（不確定）', s >= ev('orange') ? 1 : 0]];
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + text(20, 34, '四組線索：本例錄影看得到嗎？', { size: 17, bold: true, color: COL.accent });
  rows.forEach(([a, b, o], i) => { const y = 64 + i * 72;
    r += `<rect x="16" y="${y}" width="${PW - 32}" height="60" rx="8" fill="#f7f9fa" stroke="#d3dae1"/>` + text(32, y + 25, a, { size: 16, bold: true });
    r += `<g opacity="${(+o).toFixed(2)}">${text(32, y + 49, b, { size: 15, bold: true, color: i === 3 ? '#c4561c' : COL.sub })}</g>`; });
  r += `<g opacity="${(s >= ev('out') ? 1 : 0)}">${text(20, PH - 20, '器械退出：12:58（錄影）', { size: 14, color: INK2 })}</g>`;
  return { L, R: { svg: r, extra: '', P: TXT_T('本例錄影上看得到的線索') } };
};
DRAW2['2-7'] = T => {
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  const cols = [['線索', 300], ['紅光好的眼睛', 460], ['紅光弱的眼睛（推論）', 470]], rows = [['前房深度突然改變', '看得到', '看得到'], ['核塊不跟 tip、轉不動、一端歪', '看得到', '看得到'], ['清亮的紅光', '看得到', '不明顯'], ['玻璃體（透明）', '要靠 TA', '要靠 TA']];
  let x = 20; cols.forEach(([h, w]) => { o += text(x + 14, 40, h, { size: 17, bold: true, color: COL.accent }); x += w; });
  rows.forEach((r, i) => { const y = 56 + i * 72, op = i < 2 ? T.on(1) : T.on(0); let xx = 20;
    o += `<g opacity="${(+op).toFixed(2)}"><rect x="16" y="${y}" width="${FW - 32}" height="60" rx="8" fill="#f7f9fa" stroke="#d3dae1"/>`;
    r.forEach((c, j) => { o += text(xx + 14, y + 38, c, { size: 18, bold: j === 0 || c === '不明顯', color: c === '不明顯' ? WARN : c === '看得到' ? COL.accent : COL.ink }); xx += cols[j][1]; });
    o += `</g>`; });
  o += box(PH - 50, '紅光弱的眼睛：乳化時盯著前房深度和核塊的動作', T.on(2, 0.6), COL.accent, 40, 17, FW).replace('x="10"', 'x="16"');
  return { F: { svg: o, extra: '', P: TXT_T('紅光弱的時候：靠什麼認') } };
};

// ---------------------------------------------------------------- 3 當下第一步
DRAW2['3-1'] = T => {
  const k = T.p(2, 0.2, 1), st = FIRST(k), lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  if (lv.A.tip0) ex += lab('phaco 留在原位', 'stay', 14, 64, lv.A.tip0, { bold: true, color: INK2, op: T.on(1) });
  if (lv.A.ovdd && k > 0.3) ex += lab('dispersive OVD', '蓋住破口', PW - 12, YB, lv.A.ovdd, { side: 'R', bold: true, color: OVDC, lc: OVDC });
  ex += box(10, '不要突然抽出器械', T.on(0, 0.6) * (1 - T.on(1, 0.4)), WARN);
  ex += box(10, '前房穩了 → 慢慢退出', T.on(4, 0.6) * (1 - T.on(5, 0.4)));
  ex += box(10, '掉下去的核塊：不要追', T.on(5, 0.6), WARN);
  ex += sbar(lv) + note('動畫示意（OVD 的量為示意）', 1);
  let rx = '';
  if (rv.A.tip1) rx += labNear('side port 的 cannula', '', rv.A.tip1, -40, -90, { bold: true, color: INK2, op: T.on(2) });
  if (rv.r.A.ovddEdge && k > 0.3) rx += labNear('OVD', '', rv.P(rv.r.A.ovddEdge), 60, 90, { bold: true, color: OVDC, lc: OVDC });
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: PCR_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};
DRAW2['3-2'] = T => {
  const kw = T.p(1, 0, 0.8), lv = sec(WITH(kw), W_SEC, 'sL'), rv = sec(FIRST(1), W_SEC, 'cR', { cut: true });
  let ex = '';
  if (lv.A.vitTip && kw > 0.5) ex += labNear('玻璃體到切口', 'vitreous', lv.A.vitTip, 50, 90, { bold: true, color: WARN, lc: WARN });
  ex += labNear('前房變淺', 'shallow', [lv.A.antPole[0] + 40, lv.A.antPole[1] - 20], 80, 40, { bold: true, color: WARN, lc: WARN, op: ss(0.3, 0.8, kw) });
  ex += box(10, '前房不穩 → 破口變大、核塊掉落', T.on(2, 0.6), WARN);
  ex += sbar(lv) + note('動畫示意；量為示意', 1);
  let rx = '';
  if (rv.A.ovdd) rx += lab('OVD 擋住玻璃體', '', PW - 12, YB, rv.A.ovdd, { side: 'R', bold: true, color: OVDC, lc: OVDC });
  rx += box(10, '維持壓力關係，限制玻璃體往前跑', T.on(3, 0.6));
  rx += sbar(rv) + note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: { title: '直接退出（動畫示意）', orient: '左＝11 點（主切口）　上＝前' } }, R: { svg: rv.svg, extra: rx, P: { title: 'tip 留著＋OVD（動畫示意）', orient: '左＝11 點（主切口）　上＝前' } } };
};
DRAW2['3-3'] = T => {
  const f = fplay(T, '3-3'), L = f.L, s = f.s;
  if (f.clip === 'ovd1') { const op = frozenOp('ovd1', f.tau, 795.0); if (op > 0) L.extra = flab('side port 的 cannula', '', fpt('ovd1', 'cannula', f.tau), 60, 90, op); }
  if (f.clip === 'withdraw' && s >= ev('out')) L.extra = wtext(14, PH - 14, '前房裡沒有器械', { size: 14 });
  const st = firstAt(s), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st), ki = k => (c.inst || []).some(g => g.kind === k);
  let rx = '';
  if (ki('phaco') && cv.A.tip0) rx += labNear('phaco（主切口）', '', cv.A.tip0, -40, -80, { bold: true, color: INK2 });
  const sideTxt = ki('chopper') ? 'chopper（side port；切面上是它的截面）' : ki('cannula') ? 'cannula（side port；切面上是它的截面）' : '';
  if (sideTxt) rx += htext(PW - 12, 64, sideTxt, { size: 14, bold: true, color: INK2, anchor: 'end' });
  if (!(c.inst || []).length) rx += tag('器械都退出了', 1, INK2, 64);
  if (c.pcr.ovdD.tamp > 0.3 && cv.A.ovdd) rx += lab('OVD（範圍示意）', '', PW - 12, YB, cv.A.ovdd, { side: 'R', bold: true, color: OVDC, lc: OVDC });
  const re = rentEnd(cv); if (re) rx += labNear('破口（示意）', '', re, -40, 50, { color: CAP, lc: CAP });
  rx += box(PH - 110, '建議：tip 留著、先打 OVD 再退（綜論）', T.on(3, 0.6) * (1 - T.on(4, 0.4)));
  rx += sbar(cv) + note('依錄影時間：器械進出與 OVD', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['3-4'] = T => {
  const k = T.p(1, 0.1, 0.8), st = cat({ bag: { cortex: K.cortexSweep(0.5, HP, 1), sub: 1 }, pcr: { rent: RENT, ovdD: { tamp: k } }, inst: [IA(P_RIM5), OVDCAN] });
  const lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  if (lv.A.tip0) ex += lab('I/A 留著', 'stay', 14, 64, lv.A.tip0, { bold: true, color: INK2 });
  if (lv.A.ovdd && k > 0.3) ex += lab('大量 OVD', '', PW - 12, YB, lv.A.ovdd, { side: 'R', bold: true, color: OVDC, lc: OVDC });
  ex += sbar(lv) + note('動畫示意', 1);
  let rx = '';
  if (rv.A.tip1) rx += labNear('cannula（side port）', '', rv.A.tip1, -40, -90, { bold: true, color: INK2 });
  rx += box(PH - 110, '剩下的皮質：降低瓶高，或用 vitrector', T.on(2, 0.6));
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: PCR_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};
DRAW2['3-5'] = T => {
  const steps = [['1', '停止乳化，phaco 留在原位'], ['2', 'side port 打 dispersive OVD'], ['3', '前房穩了，慢慢退出'], ['4', '掉下去的核塊不要追'], ['5', '評估：破口、剩下的核、玻璃體']];
  let l = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + text(20, 34, '第一步的順序（綜論）', { size: 17, bold: true, color: COL.accent });
  steps.forEach(([n, s2], i) => { const y = 56 + i * 58, hl = i === 4 ? T.on(0) : 1;
    l += `<g opacity="${(0.35 + 0.65 * hl).toFixed(2)}"><circle cx="38" cy="${y + 22}" r="16" fill="${i === 4 ? WARN : COL.accent}"/>${text(38, y + 28, n, { size: 16, bold: true, color: '#fff', anchor: 'middle' })}${text(66, y + 28, s2, { size: 17, bold: i === 4 })}</g>`; });
  l += box(PH - 50, '團隊事先演練過這套流程', T.on(2, 0.6), INK2, 36, 15);
  const st = cat({ bag: {}, pcr: { rent: RENT, vit: { prolapse: 1 }, ovdD: { tamp: 1 }, frag: { ...PIECE, sink: 1 } } }), cv = sec(st, W_SEC, 'cR');
  let rx = '';
  const re = rentEnd(cv); if (re) rx += lab('破口多大', 'rent', PW - 12, YB, re, { side: 'R', bold: true, color: CAP, lc: CAP, op: T.on(0) });
  if (cv.A.frag) rx += lab('還剩多少核', 'piece', PW - 12, 64, cv.A.frag, { side: 'R', bold: true, color: NUC, lc: NUC, op: T.on(0) });
  if (cv.A.rentC) rx += lab('玻璃體有沒有出來', 'vitreous', 14, YB, [cv.A.rentC[0] - 10, cv.A.rentC[1] + 24], { bold: true, color: VITC, lc: VITC, op: T.on(0) });
  rx += sbar(cv) + note('動畫示意', 1);
  return { L: { svg: l, extra: '', P: TXT_T('第一步之後') }, R: { svg: cv.svg, extra: rx, P: PCR_T } };
};

// ---------------------------------------------------------------- 4 剩下的核
DRAW2['4-1'] = T => {
  const st = FLT(0.25), lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  if (lv.A.frag) ex += lab('核塊', 'piece', PW - 12, 64, lv.A.frag, { side: 'R', bold: true, color: NUC, lc: NUC });
  if (lv.A.tip1) ex += lab('鈍器械墊在下面', '切口', PW - 12, YB, lv.A.tip1, { side: 'R', color: INK2, op: T.on(0) });
  if (lv.A.rentC) ex += lab('dispersive OVD', '', 14, YB, [lv.A.rentC[0] - 50, lv.A.rentC[1] - 70], { color: OVDC, lc: OVDC });
  ex += sbar(lv) + note('高度與 OVD 範圍為示意', 1);
  let rx = '';
  if (rv.A.frag) rx += labNear('核塊在前房', '', rv.A.frag, 60, -90, { bold: true, color: NUC, lc: NUC });
  if (rv.A.tip1) rx += labNear('side port 的器械', '', rv.A.tip1, -40, 80, { color: INK2 });
  rx += note('模型示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SEC_T }, R: { svg: rv.svg, extra: rx, P: SCOPE_T } };
};
DRAW2['4-2'] = T => {
  const f = fplay(T, '4-2'), L = f.L, op = frozenOp('lev', f.tau, 830.0);
  if (op > 0) L.extra = flab('核塊', 'piece', fpt('lev', 'piece', f.tau), -40, -60, op) + flab('cannula（主切口）', '', fpt('lev', 'lev-can', f.tau), 30, 80, op);
  const st = levAt(f.s), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st);
  let rx = '';
  if (cv.A.frag) rx += labNear('核塊', 'piece', cv.A.frag, 80, -50, { bold: true, color: NUC, lc: NUC });
  if (c.inst.length && cv.A.tip0) rx += labNear('cannula（主切口）', '', cv.A.tip0, -40, -80, { color: INK2 });
  if (c.pcr.ovdD.fill > 0.1 && cv.A.rentC) rx += lab('OVD', '', 14, YB, [cv.A.rentC[0] - 50, cv.A.rentC[1] - 70], { color: OVDC, lc: OVDC });
  rx += sbar(cv) + note('依錄影時間；高度為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['4-3'] = T => {
  const f = fplay(T, '4-3'), L = f.L, op = frozenOp('emul', f.tau, 892.0);
  if (op > 0) L.extra = flab('phaco', '', fpt('emul', 'phaco', f.tau), 50, 80, op) + flab('直的器械', 'side port', fpt('emul', 'straight', f.tau), 20, -110, op);
  const st = emulAt(f.s), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st);
  let rx = '';
  if (cv.A.frag) rx += labNear('核塊', 'piece', cv.A.frag, 80, -50, { bold: true, color: NUC, lc: NUC });
  if (c.inst.length > 1 && cv.A.tip1) rx += lab('直器械墊在下面（示意）', '', PW - 12, YB, cv.A.tip1, { side: 'R', color: INK2 });
  if (c.inst.length && cv.A.tip0) rx += labNear('phaco（主切口）', '', cv.A.tip0, -40, -80, { color: INK2 });
  rx += sbar(cv) + note('依錄影時間；器械的層次為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['4-4'] = T => {
  const lv = sec(DROP, W_DEEP, 'sL'), rv = scope(DROP, W_SCOPE, 'cR');
  let ex = tag('核塊掉進玻璃體腔', 1, WARN);
  if (lv.A.frag) ex += labNear('掉落的核塊', 'dropped', lv.A.frag, 70, -30, { bold: true, color: NUC, lc: NUC });
  ex += box(46, '不要撈：拉扯玻璃體 → 巨大裂孔', T.on(1, 0.6), WARN);
  ex += sbar(lv) + note('動畫示意', 1);
  let rx = '';
  if (rv.A.frag) rx += labNear('瞳孔裡看到的核塊（在後面）', '', rv.A.frag, 40, -100, { bold: true, color: NUC, lc: NUC });
  rx += box(PH - 110, '前段處理乾淨 → 轉 VR', T.on(2, 0.6));
  rx += note('動畫示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: PCR_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};

// ---------------------------------------------------------------- 5 皮質與玻璃體
DRAW2['5-1'] = T => {
  const f = fplay(T, '5-1'), L = f.L;
  const st = iaAt(f.s, FOOTAGE_DEF.clips.ia), cv = sec(st, W_SEC, 'cR');
  let rx = '';
  if (cv.A.tip0) rx += labNear('I/A（主切口）', '', cv.A.tip0, -40, -80, { bold: true, color: INK2 });
  if (cv.A.ovdd) rx += lab('破口上的 OVD（示意）', '', PW - 12, YB, cv.A.ovdd, { side: 'R', color: OVDC, lc: OVDC });
  rx += box(PH - 110, '降低瓶高；或 vitrector 低切速 400–600 次／分', T.on(0, 0.6) * (1 - T.on(1, 0.4)), COL.accent, 36, 15);
  rx += sbar(cv) + note('依錄影時間；吸的範圍為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['5-2'] = T => {
  const pp = T.u >= T.st(2) - 0.2;
  if (pp) {   // pars plana option (lines 2–3)
    const lv = sec(PPS, { x: -9.6, y: -13.2, w: 17.6 }, 'sL', { cut: true }), rv = scope(PPS, W_SCOPE_W, 'cR');
    let ex = '';
    if (lv.A.sclerotomy) ex += lab('角膜緣後 3.5 mm', 'sclerotomy', 14, YB, lv.A.sclerotomy, { bold: true, color: INK2 });
    if (lv.A.tip0) ex += lab('切割頭在破口後', '23G', PW - 12, YB, lv.A.tip0, { side: 'R', color: INK2 });
    ex += box(10, 'pars plana＋染色最有效（綜論）', T.on(3, 0.6), INK2, 36, 15);
    ex += sbar(lv) + note('切口的鐘點為示意', 1);
    let rx = '';
    if (rv.A.sclerotomy) rx += labNear('pars plana 切口', '11 點', rv.A.sclerotomy, -30, -70, { bold: true, color: INK2 });
    rx += note('模型示意', 1);
    return { L: { svg: lv.svg, extra: ex, P: { title: '經 pars plana 的前段玻璃體切除（模型）', orient: '左＝11 點　上＝前' } }, R: { svg: rv.svg, extra: rx, P: SCOPE_T } };
  }
  const st = VIT(0.45, 0), lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  const gI = lv.r.A.inst1, Pp = q => lv.Q(q);
  for (const pp2 of (gI && gI.ports) || []) { const q = Pp(pp2); ex += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="5" fill="#c9ecfb" stroke="${IRRC}" stroke-width="1.6"/>`; }
  const F4 = K.pcrFlows(st), fo = T.on(1, 0.8);
  for (const k of [1, 4]) if (F4.irr[k]) ex += arrowPath(F4.irr[k].map(Pp), IRRC, 2.2, fo);
  for (const pl of F4.asp) ex += arrowPath(pl.map(Pp), WARN, 2.2, fo);
  if (gI && gI.ports && gI.ports[0]) ex += lab('灌流（2 點，投影）', 'irrigation', PW - 12, 64, Pp(gI.ports[0]), { side: 'R', bold: true, color: IRRC, lc: IRRC, op: T.on(1) });
  if (lv.A.tip0) ex += labNear('切割在破口', 'vitrector', lv.A.tip0, -40, 90, { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  ex += sbar(lv) + note('流向與位置為示意', 1);
  let rx = '';
  if (rv.A.tip0) rx += labNear('vitrector（主切口）', '', rv.A.tip0, 40, 90, { bold: true, color: INK2 });
  if (rv.A.tip1) rx += labNear('灌流（side port）', '', rv.A.tip1, 60, -60, { bold: true, color: IRRC, lc: IRRC });
  rx += box(PH - 110, '不用棉棒、鑷子拉；不用 I/A、phaco 碰', T.on(0, 0.6) * (1 - T.on(1, 0.4)), WARN, 36, 15);
  rx += note('模型示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: { title: '雙手前段玻璃體切除（模型）', orient: '左＝11 點　上＝前' } }, R: { svg: rv.svg, extra: rx, P: SCOPE_T } };
};
DRAW2['5-4'] = T => {
  const f = fplay(T, '5-4'), L = f.L, op = frozenOp('vit', f.tau, 1465.0);
  if (op > 0) L.extra = flab('左：灌流？', 'left incision', fpt('vit', 'irr', f.tau), -50, 90, op) + flab('右：vitrector？', 'main', fpt('vit', 'cutter', f.tau), 40, -90, op);
  const st = vitAt(f.s, FOOTAGE_DEF.clips.vit), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st);
  let rx = '';
  if (c.inst.length && cv.A.tip0) rx += labNear('vitrector（主切口）', '', cv.A.tip0, -30, 80, { bold: true, color: INK2 });
  if (c.inst.length) rx += htext(PW - 12, 64, '灌流經 side port（不在切面上）', { size: 14, bold: true, color: IRRC, anchor: 'end' });
  if (cv.A.vitMid && c.pcr.vit.cut < 0.7) rx += labNear('玻璃體', 'vitreous', cv.A.vitMid, 60, -60, { color: VITC, lc: VITC });
  rx += sbar(cv) + note('依錄影時間；玻璃體的量與形狀為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['5-5'] = T => {
  const f = fplay(T, '5-5'), L = f.L, s = f.s;
  if (f.clip === 'ta') { const op = frozenOp('ta', f.tau, 2706.0); if (op > 0) L.extra = flab('白色顆粒', 'TA?', fpt('ta', 'clump', f.tau), 50, -90, op) + flab('往左側切口拉出細條', '', fpt('ta', 'streak', f.tau), 20, 100, op); }
  // right: the model's TA on the gel (Burk 2003), following the footage (amounts 示意); the case's IOL is not drawn here (see 6-3)
  const ta = f.clip === 'ta' ? ss(ev('ta-white'), ev('ta-out'), s) : 1, cut = f.clip === 'ta2' ? ss(FOOTAGE_DEF.clips.ta2.in, ev('clear'), s) : 0.3;
  const st = VIT(Math.max(0.3, cut), cut >= 1 ? 0 : ta, [], 'side'), sv = scope(st, W_SCOPE_N, 'cR');
  let rx = '';
  if (sv.r.A.ta && sv.r.A.ta.length > 8) { const q = sv.P(sv.r.A.ta[sv.r.A.ta.length - 3]); rx += labNear('TA 黏在玻璃體上', 'Burk 2003', q, 50, 90, { bold: true, color: VITC, lc: VITC }); }
  rx += note('依錄影時間；玻璃體往 side port（示意；模型未畫 IOL）', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 6 IOL 放哪裡
DRAW2['6-1'] = T => {
  const W3 = (FW - 20) / 3, H3 = 250, mk = (st, i, id, ttl, lbl, op) => { const c = VIEWS.cam(W_IOL3, W3 - 8, H3), h = W_IOL3.w * H3 / (W3 - 8);
      const r = K.section({ st, h: HP, win: { x: W_IOL3.x, y: W_IOL3.y, w: W_IOL3.w, h }, step: 0.02, id }), x0 = 10 + i * W3, A = mapA(r.A, c.P);
      let s = `<g opacity="${(0.25 + 0.75 * op).toFixed(2)}"><rect x="${x0}" y="10" width="${W3 - 8}" height="${H3 + 66}" rx="8" fill="#fff" stroke="${op > 0.5 ? COL.accent : '#d3dae1'}" stroke-width="${op > 0.5 ? 2 : 1}"/>` +
        `<svg x="${x0}" y="46" width="${W3 - 8}" height="${H3}" viewBox="0 0 ${W3 - 8} ${H3}"><g transform="${c.tf}">${r.svg}</g></svg>` + text(x0 + 12, 34, ttl, { size: 16, bold: true, color: COL.accent }) + `</g>`;
      const a = lbl && (lbl[1] === 'hap' ? hapPt({ r, P: c.P }, st) : A[lbl[1]]);
      const ex = a ? lab(lbl[0], '', x0 + 12, 46 + H3 + 22, [x0 + a[0], 46 + a[1]], { bold: true, color: IOLC, lc: IOLC, op }) : '';
      return { s, ex }; };
  const p1 = mk(BAGIOL, 0, 'f1', '破口小：in the bag', ['haptic 在囊袋裡', 'hap'], T.on(0)), p2 = mk(SUL3, 1, 'f2', '前囊完整：sulcus（3-piece）', ['haptic 在 sulcus', 'hap'], T.on(1)), p3 = mk(CAPT, 2, 'f3', 'optic capture', ['haptic 在 sulcus、optic 在後', 'hap'], T.on(2));
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>` + p1.s + p2.s + p3.s;
  o += box(PH - 46, '支撐不夠：鞏膜固定、虹膜固定或前房 IOL', T.on(3, 0.6), INK2, 36, 15, FW);
  return { F: { svg: o, extra: p1.ex + p2.ex + p3.ex, P: { title: 'IOL 放哪裡：經主切口的切面（模型）', orient: '左＝11 點　上＝前　位置為示意' } } };
};
DRAW2['6-2'] = T => {
  const lv = sec(SUL1, W_IOL, 'sL', { step: 0.02 }), rv = sec(SUL3, W_IOL, 'cR', { step: 0.02 });
  let ex = tag('one-piece 放 sulcus', 1, WARN);
  const ch = leftmost(lv, lv.r.A.chafe); if (ch) ex += labNear('厚 haptic 貼近虹膜', '示意', ch, 40, 110, { bold: true, color: WARN, lc: WARN });
  if (lv.A['optEdge-']) ex += labNear('optic 在前囊前', '', lv.A['optEdge-'], -20, -80, { bold: true, color: IOLC, lc: IOLC });
  ex += box(46, '30 人轉診系列：93% 再手術；備好 backup IOL', T.on(1, 0.6), WARN, 36, 14.5);
  ex += sbar(lv) + note('位置為示意', 1);
  let rx = tag('3-piece 放 sulcus', 1, COL.accent);
  const hp3 = hapPt(rv, SUL3); if (hp3) rx += labNear('細的 PMMA haptic', '', hp3, 40, 110, { bold: true, color: IOLC, lc: IOLC });
  rx += box(46, 'sulcus：往前 0.62–0.75 mm → 度數 −1.00 D', T.on(2, 0.6), COL.accent, 36, 15);
  rx += sbar(rv) + note('位置為示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SECX_T }, R: { svg: rv.svg, extra: rx, P: SECX_T } };
};
DRAW2['6-3'] = T => {
  const f = fplay(T, '6-3'), L = f.L;
  if (f.clip === 'iol') { const op = frozenOp('iol', f.tau, 2611.0); if (op > 0) L.extra = flab('IOL 打開', 'IOL', fpt('iol', 'iol', f.tau), -40, -90, op); }
  else { const op = frozenOp('iol2', f.tau, 2660.0); if (op > 0) L.extra = flab('IOL', '', fpt('iol2', 'iol2', f.tau), -40, -90, op); }
  const placed = f.clip === 'iol2' || f.s >= ev('unfold'), st = placed ? SUL1 : cat({ bag: BAGC, pcr: { rent: RENT, vit: { cut: 1 } }, inst: [{ kind: 'injector', p: (() => { const d = G.clockDir(CASE.main.h); return [3.5 * d[0], 3.5 * d[1], 10.6]; })() }] });
  const cv = sec(st, placed ? W_IOL : W_FRONT, 'cR', { step: placed ? 0.02 : 0 });
  let rx = '';
  if (!placed && cv.A.tip0) rx += lab('injector（主切口）', '', 14, 64, cv.A.tip0, { bold: true, color: INK2 });
  if (placed && cv.A['optEdge-']) rx += labNear('optic 在前囊前', '依術者說明', cv.A['optEdge-'], -20, -80, { bold: true, color: IOLC, lc: IOLC, op: T.on(2) });
  if (placed) { const ch = leftmost(cv, cv.r.A.chafe) || hapPt(cv, SUL1); if (ch) rx += labNear('haptic 在 sulcus', '示意', ch, 40, 110, { bold: true, color: IOLC, lc: IOLC, op: T.on(2) }); }
  if (!placed) rx += box(PH - 110, 'IOL 打開的過程：看左邊錄影', 1, INK2, 36, 15);
  rx += sbar(cv) + note('最後位置依術者說明（AAB00 放 sulcus）；示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SECX_T } };
};

// ---------------------------------------------------------------- 7 收尾與轉診
DRAW2['7-1'] = T => {
  const lv = sec(cat({ bag: BAGC, pcr: { rent: RENT, vit: { prolapse: 1, to: 'main', cut: 0.2, ta: 1 } } }), W_FRONT, 'sL');
  let ex = tag('切口有玻璃體（示意）', 1, WARN);
  if (lv.A.vitTip) ex += labNear('TA 標出玻璃體條', 'strand', lv.A.vitTip, 60, 90, { bold: true, color: VITC, lc: VITC });
  ex += sbar(lv) + note('動畫示意', 1);
  const rv = sec(SUL1, W_FRONT, 'cR');
  let rx = tag('前房、切口乾淨', 1, COL.accent);
  if (rv.A.mainInt) rx += labNear('主切口', 'main', rv.A.mainInt, 60, 80, { color: INK2 });
  rx += box(PH - 110, '本例：最後縫合了切口', T.on(1, 0.6), INK2, 36, 15);
  rx += sbar(rv) + note('模型示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SEC_T }, R: { svg: rv.svg, extra: rx, P: SEC_T } };
};
DRAW2['7-2'] = T => {
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += rbox(16, 14, 590, 120, '術後要追（綜論）', [['CME、視網膜剝離、眼內炎較常見', true], ['→ 追發炎、CME、眼壓']], T.on(0));
  o += rbox(16, 150, 590, 120, '核碎片留在玻璃體腔（登錄研究）', [['6105 眼：第一週 12.5% 眼壓飆高', true], ['（Rothman 2026）', false, COL.sub]], T.on(1), WARN);
  o += rbox(624, 14, 590, 120, '玻璃體切除的時機（統合分析）', [['越早做，視力、RD、眼壓、發炎越好', true], ['（Vanner 2011；回溯病例系列）', false, COL.sub]], T.on(2), '#2463eb');
  o += rbox(624, 150, 590, 120, '當天 vs 3–14 天內（統合分析）', [['結果沒有明顯差別', true], ['（Vanner 2014）', false, COL.sub]], T.on(3), '#2463eb');
  o += box(PH - 110, '儘快轉給玻璃體視網膜醫師；不必為了當天手術而轉院', T.on(3, 0.6), COL.accent, 44, 18, FW);
  return { F: { svg: o, extra: '', P: TXT_T('術後追蹤與轉診') } };
};

// ---------------------------------------------------------------- 8 練習清單
DRAW2['8'] = T => {
  const bx = (x, y, w, h, title, rows, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="#d3dae1"/>${text(x + 20, y + 36, title, { size: 19, bold: true, color: COL.accent })}` +
    rows.map((r, i) => text(x + 20, y + 76 + i * 34, r[0], { size: 16.5, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += bx(20, 20, 540, 260, '為什麼要先練', [['英國第 1–2 年住院醫師：'], ['有模擬器之後 PCR 4.2% → 2.6%', true], ['相關，不是因果'], ['（Ferris 2020）', false, COL.sub]], T.on(0));
  const items = [['一', '四組線索：前房、核塊、紅光、玻璃體'], ['二', '第一步：停、tip 留著、side port 打 OVD、穩了再退'], ['三', '雙手前段玻璃體切除：灌流與切割的手位'], ['四', 'IOL 的決定：看前囊與後囊；備好 backup IOL']];
  o += `<g opacity="${T.on(1)}"><rect x="580" y="20" width="630" height="${PH - 40}" rx="10" fill="#f7f9fa" stroke="${COL.accent}" stroke-width="2"/>${text(600, 56, 'Wet lab／模擬器：上刀前練這四件事', { size: 19, bold: true, color: COL.accent })}</g>`;
  items.forEach(([n, s], i) => { const k = T.on(Math.min(1 + i, 3)); const cut = s.indexOf('：') + 1, parts = [s.slice(0, cut), s.slice(cut)];
    o += `<g opacity="${k}"><circle cx="622" cy="${104 + i * 76}" r="18" fill="${COL.accent}"/>${text(622, 110 + i * 76, n, { size: 17, bold: true, color: '#fff', anchor: 'middle' })}` +
      parts.map((p, j) => text(654, 110 + i * 76 + j * 26, p, { size: 18, bold: j === 0 })).join('') + `</g>`; });
  return { F: { svg: o, extra: '', P: TXT_T('練習清單') } };
};
