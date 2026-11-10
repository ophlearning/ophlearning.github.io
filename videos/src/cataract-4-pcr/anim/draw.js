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
// the straight instrument through the side port, 0.55 mm under the piece's bottom (OVD between, 示意) and its tip 0.3 mm past the 11–5 section toward
// 8 o'clock, so the section shows its cross-section under the piece (a = toward 8 o'clock: away from the side port at 2)
const spatAt = st => { const F = frag(st); return { kind: 'spatula', via: 'side', p: F.at3(0.3, (F.bE + CN.pcr.frag.rb) / 2, -CN.pcr.frag.rn - 0.55) }; };
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
const SCOPE2_T = { title: '術者視角：正常 vs PCR', orient: '左眼 OS　右＝nasal' };
const SEC2_T = { title: '經主切口的切面：正常 vs PCR', orient: '左＝11 點（主切口）　上＝前' };
const TXT_T = (t) => ({ title: t, orient: '' });
window.PRELOAD_EXTRA = JSON.stringify([SEC_T, SECX_T, SYNC_T, NORM_T, PCR_T, SCOPE_T, SCOPEN_T, SCOPEP_T, SCOPE2_T, SEC2_T]) +
  '經主切口的切面模型依錄影時間器械為投影術者視角左眼正常動畫示意下點右上前左主切口停格看得到看不清楚看不出可能不確定0123456789.–→✓✗×△';

const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
// every model view says what it shows (view type, eye, rent or not, px per mm): check.js reads it to verify each PCR cue has a normal view beside it
const vtag = (kind, st, k) => { const P = K.pcrOf(st); return ` data-view="${kind}" data-eye="${K.norm(st).eye}" data-rent="${P && P.R ? 1 : 0}" data-k="${k.toFixed(3)}"`; };
function sec(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = K.section({ st, h: o.hp ?? HP, off: o.off || 0, cut: !!o.cut, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 260).toFixed(4), id });
  return { svg: `<g transform="${c.tf}"${vtag('sec', st, c.k)}>${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), r = K.enface({ st, id, surgeon: 12 }), A = mapA(r.A, c.P);
  return { svg: `<g transform="${c.tf}"${vtag('scope', st, c.k)}>${r.svg}</g>`, A, P: c.P, k: c.k, r, tf: c.tf, Q: p3 => c.P(r.M(p3)) };
}
// a point of the remaining piece: the end nearest the rent (sinking pole) or its round side away from the tip (label anchors, panel px)
const fragPt = (v, st, which) => { const P = K.pcrOf(st), F = P.FR; if (!F) return null; let best = null;
  const tgt = which === 'pole' && P.R ? P.R.c3 : F.at3(0, CN.pcr.frag.rb * 0.6, 0);
  for (const q of F.pts) { const d = Math.hypot(q[0] - tgt[0], q[1] - tgt[1]) + (which === 'pole' ? 0 : Math.abs(q[2] - tgt[2])); if (!best || d < best[0]) best = [d, q]; }
  return v.Q(best[1]); };
// a point on instrument i, d mm back from its tip along the shaft (label anchor on the visible metal)
const instPt = (v, st, i, d = 0.6) => { const c = K.norm(st), g = K.instGeom(c, c.inst[i]), o = g.bend && d > G.len(G.sub(g.bend, g.tip)) ? g.bend : g.tip, ax = g.bend && o === g.tip ? G.unit(G.sub(g.bend, g.tip)) : g.axis; return v.Q([o[0] + ax[0] * d, o[1] + ax[1] * d, o[2] + ax[2] * d]); };
const secPt = (v, r, z) => v.P([r, -z]);
// where instrument i's shaft crosses the section plane (its drawn cross-section), panel px
const crossPt = (v, i) => { const g = v.r.A['inst' + i], pl = v.r.pl, n = [pl.U[1], -pl.U[0], 0], d = G.dot(G.sub(g.tip, pl.O), n), k = G.dot(g.axis, n);
  return Math.abs(k) < 1e-6 ? v.A['tip' + i] : v.Q(G.add(g.tip, g.axis, -d / k)); };
const leftmost = (v, pts) => pts && pts.length ? v.P(pts.reduce((a, q) => q[0] < a[0] ? q : a)) : null;           // the 11 o'clock side of a list of plane points
// where a haptic crosses this section on the 11 o'clock side (the projected tip is off the plane)
const hapPt = (v, st) => { const IO = K.iolOf(K.norm(st)); if (!IO) return null; const n = [v.r.pl.U[1], -v.r.pl.U[0], 0]; let best = null;
  for (const H of IO.haps) for (const p of H) { const d = Math.abs((p[0] - v.r.pl.O[0]) * n[0] + (p[1] - v.r.pl.O[1]) * n[1]), q = G.toPlane(v.r.pl, p); if (q[0] < -3.2 && (!best || d < best[0])) best = [d, q]; }
  return best ? v.P(best[1]) : null; };                                                     // section point: r mm toward 5 o'clock (− = toward 11), eye z
const inPanel = (q, m = 24) => q && q[0] > m && q[0] < PW - m && q[1] > m && q[1] < PH - m;
// the rent's edge point farthest from the piece (where the clear area shows), in a microscope view
const clearPt = v => { const E = v.r.A.rentEdge, F = v.r.A.frag; if (!E) return null; const f = F || E[0]; let b = E[0]; for (const q of E) if (Math.hypot(q[0] - f[0], q[1] - f[1]) > Math.hypot(b[0] - f[0], b[1] - f[1])) b = q; return v.P(b); };
// a point inside the clear area: 30 % of the way from its far edge toward the rent's centre (label anchor)
const clearIn = v => { const c = clearPt(v), rc = v.A.rentC; return c && rc ? [lerp(c[0], rc[0], 0.3), lerp(c[1], rc[1], 0.3)] : c; };
const rentEnd = v => { const E = v.r.A.rentEnds || []; return E.length ? v.P(E[E.length - 1]) : null; };
const postQ = (v, r, h) => { const d = G.clockDir(h); return v.Q([r * d[0], r * d[1], L0.zPost(r)]); };
const sbar = v => VIEWS.sbar(v.k, 1, 1);
// a microscope view of the model drawn into a box (x0, y0, w × h px) of a panel: clipped, with its anchors mapped to panel px
function miniScope(st, x0, y0, w, h, cx, wmm, id) {
  const win = { x: cx[0] - wmm / 2, y: cx[1] - wmm * h / w / 2, w: wmm }, v = scope(st, win, id, { W: w, H: h }), at = a => a ? [x0 + a[0], y0 + a[1]] : null;
  return { v, at, svg: `<svg x="${x0}" y="${y0}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><g>${v.svg}</g></svg><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="none" stroke="#d3dae1"/>` };
}
// the same for the 11–5 section (cx = [mm toward 5 o'clock, −eye z] at the box centre)
function miniSec(st, x0, y0, w, h, cx, wmm, id) {
  const win = { x: cx[0] - wmm / 2, y: cx[1] - wmm * h / w / 2, w: wmm }, v = sec(st, win, id, { W: w, H: h }), at = a => a ? [x0 + a[0], y0 + a[1]] : null;
  return { v, at, svg: `<svg x="${x0}" y="${y0}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="hidden"><g>${v.svg}</g></svg><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="none" stroke="#d3dae1"/>` };
}
// cues three and four: normal | PCR as two small views of one panel, same window and scale (MW × MH px each, under their headers)
const MW = 292, MH = 300, MY = 38, MXN = 8, MXP = PW - 8 - MW;
const pairHead = (n, p) => text(MXN + 4, 27, n, { size: 16, bold: true, color: COL.accent }) + text(MXP + 4, 27, p, { size: 16, bold: true, color: WARN });
const pairNote = (x, s) => htext(x + MW - 8, MY + MH - 10, s, { size: 13, color: COL.sub, anchor: 'end' });
// a checklist of what the recording shows: rows [mark, cue, status, opacity, colour]; ✓ seen, △ seen but uncertain, ✗ not seen
function seenRows(x, y, w, rows, rh = 58, gap = 6) {
  return rows.map(([m, a, b, o, col], i) => { const yy = y + i * (rh + gap), c = col || (m === '✗' ? COL.sub : m === '△' ? '#c4561c' : COL.accent);
    return `<g opacity="${(0.3 + 0.7 * o).toFixed(2)}"><rect x="${x}" y="${yy}" width="${w}" height="${rh}" rx="8" fill="#f7f9fa" stroke="${o > 0.5 ? c : '#d3dae1'}" stroke-width="${o > 0.5 ? 1.6 : 1}"/>` +
      text(x + 12, yy + 24, a, { size: 15, bold: true }) + `<g opacity="${(+o).toFixed(2)}">${text(x + 12, yy + rh - 12, `${m}　${b}`, { size: 14.5, bold: true, color: c })}</g></g>`; }).join(''); }
// text panel (full white, rows of cards)
const rbox = (x, y, w, h, title, rows, op, col = COL.accent, ts = 18, rs = 16.5) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="${col}" stroke-width="1.5"/>${text(x + 16, y + 28, title, { size: ts, bold: true, color: col })}` +
  rows.map((r, i) => text(x + 16, y + 60 + i * 28, r[0], { size: rs, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;

// ---------------------------------------------------------------- footage clock
// parts: [{ clip, ev, line, dt }]: event `ev` of `clip` lands at the start of narration line `line` (+dt s); the last part already started is shown
// (the first one is shown from the segment start). The source time on screen is kept in window.LAST_FOOT for check.js.
const FOOT_PARTS = {
  '2-6': [{ clip: 'moment', ev: 'wd', line: 2, dt: 0 }, { clip: 'moment', ev: 'm-frz', line: 3, from: 'line' }],
  '3-3': [{ clip: 'withdraw', ev: 'wd', line: 0, dt: 0.8 }, { clip: 'ovd1', ev: 'can-in', line: 2 }],
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
// 3-3 (withdraw, ovd1): phaco + chopper until they leave (the chopper first, chop-out; the phaco by out); nothing for ≈ 10 s; the side-port
// cannula; OVD over the rent (amount 示意). The rent is drawn as 示意 (the recording does not show it); the chamber is not drawn collapsing (the
// recording cannot show its depth either).
function firstAt(s) {
  const inst = [], k = ss(ev('can-in') + 1, ev('can-out'), s);
  if (s < ev('out')) inst.push(PHC); if (s < ev('chop-out')) inst.push(CHOP);
  if (s >= ev('can-in') && s <= ev('can-out')) inst.push(OVDCAN);
  return cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: k }, frag: PIECE }, inst });
}
// 4-2 (lev): a bent cannula through the main incision beside the piece's straight edge while the piece rises on OVD, then with its bent tip under that
// edge (the recording: under and beside the large piece; the piece is in the pupil centre by about 13:41). Never inside the piece (checked with
// scratch geometry: iris, cornea, capsules and the piece clear at every float value). Height, OVD and the cannula's bend are 示意.
const LEVCAN = st => { const P = K.pcrOf(st), F = P.FR, F4 = CN.pcr.frag, fl = F.fl;
  const q = F.at3(0, lerp(-0.6, -0.2, ss(0.85, 1, fl)), lerp(-F4.rn * 0.5, -F4.rn - 0.45, ss(0.55, 0.85, fl)));
  return { kind: 'cannula', via: 'main', p: [q[0], q[1], Math.max(q[2], P.zRim3 - 0.3)], bend: true }; };
function levAt(s) {
  const fl = ss(ev('lev-in') + 2, ev('lev-in') + 12, s), st = FLOAT(fl, 0);
  return s >= ev('lev-in') && s <= ev('lev-out') ? cat({ ...st.cat, inst: [LEVCAN(st)] }) : st;
}
// 4-3 (emul): phaco on the straight edge, the straight instrument under the piece; eaten from ph-in to 6.5 s before the clip's end (the pace is 示意);
// both instruments stay to the clip's end (the phaco leaves at 17:03.8, after it: CASE.phacoOut)
function emulAt(s) {
  const e = lerp(0.05, 0.95, ss(ev('ph-in') + 3, FOOTAGE_DEF.clips.emul.out - 6.5, s));
  if (s >= CASE.phacoOut) return cat({ bag: {}, pcr: { rent: RENT, ovdD: { tamp: 1, coat: 1, fill: CN.pcr.frag.cushion + 0.25 } } });
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
  // the window sits 0.5 mm low so both incisions (11 and 2 o'clock, bottom of the picture) clear the panel's lower edge
  const st = cat({ bag: {}, pcr: { frag: PIECE }, inst: [PHC, CHOP] }), sv = scope(st, { x: -8, y: -4.6, w: 16 }, 'cR'), OR = K.orient({ eye: 'OS', surgeon: 12 });
  const main = sv.Q(G.P3(CASE.main.h, -0.3, 0)), side = sv.Q(G.P3(CASE.side.h, -0.3, 0));
  // one orientation tag (the panel header already gives 下＝12、右＝9 nasal); the nasal side as one arrow on the right edge (line 0); incisions (line 1)
  let rx = `<rect x="10" y="8" width="214" height="32" rx="6" fill="#1d2733" opacity="0.85"/>` + text(20, 30, `${OR.eyeZh}　術者坐 ${OR.bottom} 點`, { size: 15, bold: true, color: '#fff' });
  rx += htext(PW - 12, PH / 2 - 30, `${OR.right} 點 鼻側 ${OR.rightAnat.en} →`, { size: 14, bold: true, color: INK2, anchor: 'end', op: T.on(0) });
  rx += labNear('主切口 11 點', 'main', main, 30, -34, { bold: true, color: INK2, op: T.on(1) });
  rx += labNear('side port 2 點', '', side, 34, 56, { bold: true, color: INK2, op: T.on(1) });
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
  // left: the microscope view, normal (capsule intact, the piece under the tip) | PCR (the rent's clear area), one window and scale for both
  const C = [-0.3, -0.7], WM = 7.2, mn = miniScope(NORM, MXN, MY, MW, MH, C, WM, 'nL'), mp = miniScope(REC, MXP, MY, MW, MH, C, WM, 'sL');
  let l = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + mn.svg + mp.svg + pairNote(MXN, '模型示意') + pairNote(MXP, '動畫示意');
  let ex = pairHead('正常（模型）', 'PCR（動畫示意）');
  const ca = clearIn(mp.v);
  // both labels on one line over the top of their views; leaders to the clear area and, in the normal eye, to the red reflex one clock hour from the rent's place (clear of the piece)
  if (ca) ex += lab('清亮區', 'clear area', MXP + MW - 8, MY + 44, mp.at(ca), { side: 'R', bold: true, color: WARN, lc: WARN });
  ex += lab('沒有清亮區', 'no clear area', MXN + MW - 8, MY + 44, mn.at(mn.v.Q(under(RENT.h - 1, 2.2, 0))), { side: 'R', bold: true, color: COL.accent, lc: COL.accent });
  ex += box(PH - 62, 'I/A 吸到後囊：皺褶匯向吸口、紅光更亮、瞳孔拉尖', T.on(2, 0.6), WARN, 36, 14.5);
  const cv = sec(REC, W_SEC, 'cR');
  let rx = '';
  const re = rentEnd(cv); if (re) rx += lab('破口：前面沒有後囊', 'rent', PW - 12, YB, re, { side: 'R', bold: true, color: CAP, lc: CAP });
  if (cv.A.rentC) { const a = cv.A.rentC, y0 = Math.min(PH - 20, a[1] + 40); rx += arrowPath([[a[0] + 20, y0], [a[0] + 20, a[1] - 150]], '#e26b2c', 3, T.on(1)) + htext(a[0] - 200, a[1] - 160, '紅光直接透出（示意）', { size: 14, bold: true, color: '#c4561c', op: T.on(1) }); }
  rx += sbar(cv) + note('動畫示意', 1);
  return { L: { svg: l, extra: ex, P: SCOPE2_T }, R: { svg: cv.svg, extra: rx, P: PCR_T } };
};
DRAW2['2-4'] = T => {
  const k = T.p(0, 0.2, 1) * 0.5 + T.p(1, 0, 0.9) * 0.5, st = PRO(k), rv = scope(st, W_SCOPE_N, 'cR');
  // left: the 11–5 section, normal (posterior capsule intact, the gel behind it) | PCR (the gel through the rent to the tip), one window and scale
  const C = [0.9, -6.9], WM = 7.6, mn = miniSec(NORM, MXN, MY, MW, MH, C, WM, 'nL'), mp = miniSec(st, MXP, MY, MW, MH, C, WM, 'sL'), lv = mp.v;
  let l = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + mn.svg + mp.svg;
  let ex = pairHead('正常（模型）', 'PCR：玻璃體跑到前面（動畫示意）');
  // normal: the capsule where PCR has its rent, the gel behind it; PCR: the rent, the gel, the tip
  ex += labNear('後囊完整', 'intact', mn.at(postQ(mn.v, 2.4, HP)), -24, 34, { bold: true, color: CAP, lc: CAP });
  ex += labNear('玻璃體在後面', 'vitreous', mn.at(secPt(mn.v, -0.6, L0.zPost(0.6) - 0.9)), 18, 44, { bold: true, color: VITC, lc: VITC });
  const re = rentEnd(lv); if (re) { const a = mp.at(re); ex += lab('破口', 'rent', MXP + MW - 8, a[1] + 50, a, { side: 'R', color: CAP, lc: CAP }); }
  if (lv.A.vitMid && k > 0.4) ex += labNear('玻璃體', 'vitreous', mp.at(lv.A.vitMid), 20, -50, { bold: true, color: VITC, lc: VITC });
  if (lv.A.tip0) ex += labNear('tip', '', mp.at(lv.A.tip0), -30, -50, { color: INK2 });
  ex += VIEWS.sbar(lv.k, 1, 1) + htext(80, PH - 22, '兩圖同一比例', { size: 13, color: COL.sub }) + note('模型示意', 1, PH - 22, MXN + MW + 4) + note('形狀為示意', 1, PH - 22);
  let rx = '';
  if (rv.A.vitMid && k > 0.6) rx += labNear('玻璃體條（透明）', 'strand', rv.A.vitMid, 60, -64, { bold: true, color: VITC, lc: VITC });
  rx += box(PH - 110, '玻璃體本身看不到：看到的是核塊跑不動、轉不動', T.on(2, 0.6), INK2, 36, 14.5);
  rx += note('動畫示意', 1);
  return { L: { svg: l, extra: ex, P: SEC2_T }, R: { svg: rv.svg, extra: rx, P: SCOPEP_T } };
};
DRAW2['2-5'] = T => {
  const st = pcrSt({ vit: { prolapse: 0.6, to: 'tip' } }), sv = scope(st, W_SCOPE_N, 'sL'), cv = sec(st, W_SEC, 'cR');
  let ex = '';
  const c = clearIn(sv); if (c) ex += labNear('清亮區', 'rent', c, 70, -10, { bold: true, color: WARN, lc: WARN, op: T.on(1) });
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
  // right, left half: what the same moment shows when the red reflex is good (the model: rent, clear area, tilted piece, phaco and chopper still in;
  // 動畫示意, not timed to the recording: when the capsule broke cannot be read from it). Right half: the four cue groups (chapter 2) and what this
  // recording shows of them, revealed with the footage events and the narration; the one action it does show plainly (the withdrawal) is its own row.
  const sg = pcrSt({ inst: [PHC, CHOP] }), ms = miniScope(sg, 8, 40, 286, 310, [0.1, 0.1], 8.0, 'cR');
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + text(14, 28, '對照：紅光好的眼睛', { size: 16, bold: true, color: WARN }) + ms.svg;
  let rx = '';
  const ca = clearIn(ms.v);
  if (ca) rx += labNear('清亮區', 'rent', ms.at(ca), 60, -24, { bold: true, color: WARN, lc: WARN });
  const pole = fragPt(ms.v, sg, 'pole'); if (pole) rx += labNear('核塊歪', 'tilt', ms.at(pole), 70, 26, { bold: true, color: NUC, lc: NUC });
  r += htext(290, PH - 44, '動畫示意', { size: 13, color: COL.sub, anchor: 'end' });
  r += text(306, 28, '本例錄影：看得到嗎？', { size: 16, bold: true, color: COL.accent });
  const seenOut = s >= ev('out') ? 1 : 0;
  r += seenRows(306, 40, 292, [
    ['✗', '線索一　前房變深、瞳孔變大', '看不清楚', T.on(3)],
    ['✗', '線索二　核塊不跟 tip、一端歪', '看不出來', T.on(4)],
    ['△', '線索三　清亮的紅光', '左下的橘紅色反光（不確定）', s >= ev('orange') ? 1 : 0],
    ['✗', '線索四　玻璃體', '透明：沒有打 TA，看不到', T.on(4)]], 56, 6);
  r += `<g opacity="${(0.3 + 0.7 * seenOut).toFixed(2)}"><rect x="306" y="290" width="292" height="60" rx="8" fill="#fff" stroke="${seenOut ? COL.accent : '#d3dae1'}" stroke-width="2"/>` +
    text(318, 313, '看得到的動作', { size: 14.5, bold: true, color: COL.accent }) + `<g opacity="${seenOut}">${text(318, 338, '✓　phaco 與 chopper 一起退出', { size: 15, bold: true })}</g></g>`;
  r += htext(PW - 8, PH - 44, '依錄影時間出現', { size: 13, color: COL.sub, anchor: 'end' });
  return { L, R: { svg: r, extra: rx, P: TXT_T('本例錄影上看得到的線索') } };
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
  if (lv.A.tip0) ex += labNear('phaco 留在原位', 'stay', lv.A.tip0, -30, 70, { bold: true, color: INK2, op: T.on(1) });
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
  // right, left half: the model's microscope view at the same source time (firstAt: instruments in and out as the recording shows, the side-port
  // cannula, OVD spreading over the rent) as a good red reflex would show it — the rent's clear area and the OVD over it are 動畫示意 (the recording
  // shows neither). Right half: what the recording does show, row by row as it happens, and (line 4) what it cannot tell.
  const st = firstAt(s), c = K.norm(st), ms = miniScope(st, 8, 40, 286, 250, [0.1, -0.3], 8.0, 'cR');
  let r = `<rect width="${PW}" height="${PH}" fill="#fff"/>` + text(14, 28, '對照：紅光好時會看到', { size: 16, bold: true, color: WARN }) + ms.svg;
  let rx = '';
  const ca = clearIn(ms.v);
  if (ca && c.pcr.ovdD.tamp < 0.3) rx += labNear('清亮區＝破口', '', ms.at(ca), 64, -14, { bold: true, color: WARN, lc: WARN });
  if (c.pcr.ovdD.tamp >= 0.3 && ms.v.r.A.ovddEdge) rx += labNear('OVD 蓋住破口', '', ms.at(ms.v.P(ms.v.r.A.ovddEdge)), 50, -30, { bold: true, color: OVDC, lc: OVDC });
  r += htext(294, 306, '依錄影時間；動畫示意', { size: 13, color: COL.sub, anchor: 'end' });
  const gone = s >= ev('out') ? 1 : 0, can = s >= ev('can-in') ? 1 : 0;
  r += text(306, 28, '本例錄影：看得到的', { size: 16, bold: true, color: COL.accent });
  r += seenRows(306, 40, 292, [
    ['✓', '一　phaco 與 chopper 一起退出', '看得到', gone],
    ['✓', '二　前房裡沒有器械', '約 10 秒', T.on(1) * gone],
    ['✓', '三　side port 的 cannula 推注', '看起來是補 OVD', can],
    ['✗', '術者那一刻是否已知道 PCR', '看不出來', T.on(4)]], 56, 6);
  // line 3: the case's order beside the recommended order (Rajan 2025)
  const o3 = T.on(3, 0.6);
  r += `<g opacity="${o3.toFixed(2)}"><rect x="8" y="318" width="${PW - 16}" height="62" rx="8" fill="#fff" stroke="${COL.accent}" stroke-width="1.6"/>` +
    text(20, 342, '本例：退出 → 約 10 秒 → side port 補 OVD', { size: 15, bold: true, color: INK2 }) +
    text(20, 368, '綜論建議：tip 留著 → side port 打 OVD → 穩了再退', { size: 15, bold: true, color: COL.accent }) + `</g>`;
  return { L, R: { svg: r, extra: rx, P: TXT_T('本例的第一個動作：錄影看得到的') } };
};
DRAW2['3-4'] = T => {
  const k = T.p(1, 0.1, 0.8), st = cat({ bag: { cortex: K.cortexSweep(0.5, HP, 1), sub: 1 }, pcr: { rent: RENT, ovdD: { tamp: k } }, inst: [IA(P_RIM5), OVDCAN] });
  const lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  if (lv.A.tip0) ex += labNear('I/A 留著', 'stay', lv.A.tip0, 30, 64, { bold: true, color: INK2 });
  if (lv.A.ovdd && k > 0.3) ex += labNear('大量 OVD', '', lv.A.ovdd, 70, 40, { bold: true, color: OVDC, lc: OVDC });
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
  if (cv.A.frag) rx += labNear('還剩多少核', 'piece', cv.A.frag, 90, -70, { bold: true, color: NUC, lc: NUC, op: T.on(0) });
  if (cv.A.rentC) rx += labNear('玻璃體有沒有出來', 'vitreous', [cv.A.rentC[0] - 10, cv.A.rentC[1] + 24], -110, -20, { bold: true, color: VITC, lc: VITC, op: T.on(0) });
  rx += sbar(cv) + note('動畫示意', 1);
  return { L: { svg: l, extra: '', P: TXT_T('第一步之後') }, R: { svg: cv.svg, extra: rx, P: PCR_T } };
};

// ---------------------------------------------------------------- 4 剩下的核
DRAW2['4-1'] = T => {
  const st = FLT(0.25), lv = sec(st, W_SEC, 'sL', { cut: true }), rv = scope(st, W_SCOPE_N, 'cR');
  let ex = '';
  if (lv.A.frag) ex += labNear('核塊', 'piece', lv.A.frag, 96, 8, { bold: true, color: NUC, lc: NUC });
  if (lv.A.tip1) ex += labNear('鈍器械墊在下面', '示意', crossPt(lv, 1), 30, 56, { bold: true, color: INK2, op: T.on(0) });
  ex += labNear('dispersive OVD', '墊著', lv.Q(frag(st).under(1.3)), -40, 56, { bold: true, color: OVDC, lc: OVDC });
  ex += sbar(lv) + note('高度與 OVD 範圍為示意', 1);
  // the model draws instruments over everything; the floated piece is redrawn over them (translucent) so the instrument under it shows as under it
  const H = rv.r.A.fragHull, cover = H ? `<g transform="${rv.tf}"><path d="M${H.map(q => q[0].toFixed(4) + ' ' + q[1].toFixed(4)).join('L')}Z" fill="#d9b25c" opacity="0.78" stroke="#7a5418" stroke-width="1" vector-effect="non-scaling-stroke"/></g>` : '';
  let rx = '';
  if (rv.A.frag) rx += labNear('核塊在前房', '', rv.A.frag, 60, -90, { bold: true, color: NUC, lc: NUC });
  if (rv.A.tip1) rx += lab('side port 的器械', '在核塊下', 14, 246, instPt(rv, st, 1, 3.4), { bold: true, color: INK2 });
  rx += note('模型示意', 1);
  return { L: { svg: lv.svg, extra: ex, P: SEC_T }, R: { svg: rv.svg + cover, extra: rx, P: SCOPE_T } };
};
DRAW2['4-2'] = T => {
  const f = fplay(T, '4-2'), L = f.L, op = frozenOp('lev', f.tau, 830.0);
  if (op > 0) L.extra = flab('核塊', 'piece', fpt('lev', 'piece', f.tau), -40, -60, op) + flab('cannula（主切口）', '', fpt('lev', 'lev-can', f.tau), 30, 80, op);
  // right: the piece rising on OVD from the bag to the rhexis plane, the bent cannula from the main incision beside and then under its straight edge
  const st = levAt(f.s), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st), F = frag(st), inC = (c.inst || []).length > 0;
  let rx = '';
  if (cv.A.frag) rx += labNear('核塊', 'piece', cv.A.frag, 70, -56, { bold: true, color: NUC, lc: NUC });
  if (inC) rx += labNear('彎 cannula（主切口）', '', instPt(cv, st, 0, 0.35), -30, 80, { bold: true, color: INK2 });
  if (F.fl > 0.2) { const a = cv.Q(F.under(1.5)), b = cv.Q(F.under(0.12));
    rx += arrowPath([a, b], OVDC, 2.4, ss(0.2, 0.5, F.fl)) + labNear('OVD 墊在核塊下面', '示意', cv.Q(F.under(0.9)), 60, 40, { bold: true, color: OVDC, lc: OVDC, op: ss(0.2, 0.5, F.fl) }); }
  rx += sbar(cv) + note('依錄影時間；高度與 OVD 為示意', 1);
  return { L, R: { svg: cv.svg, extra: rx, P: SYNC_T } };
};
DRAW2['4-3'] = T => {
  const f = fplay(T, '4-3'), L = f.L, op = frozenOp('emul', f.tau, 892.0);
  if (op > 0) L.extra = flab('phaco', '', fpt('emul', 'phaco', f.tau), 50, 80, op) + flab('直的器械', 'side port', fpt('emul', 'straight', f.tau), 20, -110, op);
  // right: three layers, top to bottom — the piece (the phaco from the main incision on its straight edge), the straight instrument from the side port
  // under it (its cross-section: the shaft runs across this section), the dispersive OVD between them and the posterior capsule. Layers 示意.
  const st = emulAt(f.s), cv = sec(st, W_SEC, 'cR', { cut: true }), c = K.norm(st), n = (c.inst || []).length;
  let rx = '';
  if (cv.A.frag) rx += labNear('核塊', 'piece', cv.A.frag, 96, 8, { bold: true, color: NUC, lc: NUC });
  if (n && cv.A.tip0) rx += labNear('phaco（主切口）吃核塊的邊', '', instPt(cv, st, 0, 1.2), 12, -62, { bold: true, color: INK2 });
  if (n > 1) rx += labNear('直器械（side port）在核塊下面', '示意', crossPt(cv, 1), -24, 58, { bold: true, color: INK2 });
  if (c.pcr.frag) rx += labNear('OVD 墊著', '示意', cv.Q(frag(st).under(1.3)), 40, 50, { bold: true, color: OVDC, lc: OVDC });
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
  if (rv.A.frag) rx += labNear('瞳孔裡看到的核塊（在後面）', '', rv.A.frag, 50, -44, { bold: true, color: NUC, lc: NUC });
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
    if (lv.A.sclerotomy) ex += lab('角膜緣後 3.5 mm', 'sclerotomy', 14 + lw('角膜緣後 3.5 mm', 'sclerotomy', { bold: true }), 290, lv.A.sclerotomy, { side: 'R', bold: true, color: INK2 });
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
  // right: the model's TA on the gel (Burk 2003), following the footage (amounts 示意), with the case's IOL already in: one-piece in the sulcus, as the
  // surgeon said (the same state as 6-3); the TA-coated gel is drawn in front of it (in the chamber, as the recording shows the white particles)
  const ta = f.clip === 'ta' ? ss(ev('ta-white'), ev('ta-out'), s) : 1, cut = f.clip === 'ta2' ? ss(FOOTAGE_DEF.clips.ta2.in, ev('clear'), s) : 0.3;
  const st0 = VIT(Math.max(0.3, cut), cut >= 1 ? 0 : ta, [], 'side'), st = cat({ ...st0.cat, iol: { pos: 'sulcus', rot: -35 } }), sv = scope(st, W_SCOPE_N, 'cR');
  let rx = '';
  // the label points at a haptic where it shows inside the pupil margin (the rest of it lies behind the iris)
  const IO = K.iolOf(K.norm(st)), pr = K.norm(st).pupil / 2; let hp = null;
  if (IO) for (const H of IO.haps) for (const p of H) { const r = Math.hypot(p[0], p[1]), q = sv.Q(p); if (r > pr - 0.75 && r < pr - 0.35 && inPanel(q, 60) && (!hp || q[0] > hp[0])) hp = q; }
  if (hp) rx += labNear('IOL（AAB00）在 sulcus', '術者說明', hp, -24, 92, { bold: true, color: IOLC, lc: IOLC });
  if (sv.r.A.ta && sv.r.A.ta.length > 8) { const q = sv.P(sv.r.A.ta[sv.r.A.ta.length - 3]); rx += labNear('TA 黏在玻璃體上', 'Burk 2003', q, 50, -60, { bold: true, color: VITC, lc: VITC }); }
  rx += note('依錄影時間；TA 與玻璃體的量為示意', 1);
  return { L, R: { svg: sv.svg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 6 IOL 放哪裡
// 6-1 zoom: the 11 o'clock periphery of the section, from the pupil margin and the rhexis edge out to the bag equator and the ciliary sulcus
const W_IOLZ = { x: -6.3, y: -10.15, w: 4.4 };
// section points of the bag (lens-local radius r on the 11 o'clock side): the anterior capsule (rhexis rim at rcOf), the equator
const capAt = (v, st, r, front = true) => { const c = K.norm(st), Bb = K.bagOf(c), S = K.lensShift(c), z = (front ? Bb.zA(r) : Bb.zP(r, 0, 0)) + K.liftZ(c, r) + S.LO[2];
  const d = G.clockDir(CASE.main.h); return v.Q([S.LO[0] + d[0] * r, S.LO[1] + d[1] * r, z]); };
DRAW2['6-1'] = T => {
  // three zoomed sections, one per choice: short labels on the haptic, the optic and the one structure that decides it; the full sentence below
  const W3 = (FW - 20) / 3, IW = W3 - 8, H3 = 236, win = W_IOLZ, cam = VIEWS.cam(win, IW, H3), h = win.w * H3 / IW;
  const mk = (st, i, id, ttl, cap, labs, op) => {
    const r = K.section({ st, h: HP, win: { x: win.x, y: win.y, w: win.w, h }, step: 0.01, id }), x0 = 10 + i * W3, A = mapA(r.A, cam.P), v = { r, A, P: cam.P, Q: p3 => cam.P(G.toPlane(r.pl, p3)) };
    const s = `<g opacity="${(0.25 + 0.75 * op).toFixed(2)}"><rect x="${x0}" y="10" width="${IW}" height="${H3 + 72}" rx="8" fill="#fff" stroke="${op > 0.5 ? COL.accent : '#d3dae1'}" stroke-width="${op > 0.5 ? 2 : 1}"/>` +
      `<svg x="${x0}" y="46" width="${IW}" height="${H3}" viewBox="0 0 ${IW} ${H3}"><g transform="${cam.tf}">${r.svg}</g></svg>` + text(x0 + 12, 34, ttl, { size: 16, bold: true, color: COL.accent }) +
      `<g transform="translate(${(x0 + IW / 2 - cam.k / 2 - 20).toFixed(1)} 46)">${VIEWS.sbar(cam.k, 1, 1, H3)}</g>` + text(x0 + 12, 46 + H3 + 24, cap, { size: 14.5, bold: true, color: IOLC }) + `</g>`;
    const ex = labs.map(([zh, en, a, dx, dy, col]) => { const q = typeof a === 'function' ? a(v, st) : A[a]; return q ? labNear(zh, en, [x0 + q[0], 46 + q[1]], dx, dy, { bold: true, color: col || IOLC, lc: col || IOLC, op }) : ''; }).join('');
    return { s, ex }; };
  const hap = (v, st) => hapPt(v, st), opt = (v, st) => v.A['optEdge-'], rim = (v, st) => capAt(v, st, K.rcOf(K.norm(st)) + 0.05), cap = (v, st) => capAt(v, st, 3.9);
  const p1 = mk(BAGIOL, 0, 'f1', '破口小、囊袋完整：in the bag', 'haptic 撐在囊袋赤道；optic 在囊袋內',
    [['虹膜', 'iris', (v, st) => v.A['pm-'], 16, -46, INK2], ['haptic', '', hap, -10, 46], ['optic', '', opt, 14, 46]], T.on(0));
  const p2 = mk(SUL3, 1, 'f2', '前囊完整：sulcus（3-piece）', 'haptic 在 sulcus（虹膜後、前囊前）；optic 在前囊前',
    [['haptic', '', hap, -10, 80], ['前囊', '', cap, 40, 58, CAP], ['optic', '', opt, 14, -52]], T.on(1));
  const p3 = mk(CAPT, 2, 'f3', '撕囊口完整：optic capture', 'haptic 在 sulcus；optic 壓到撕囊口後',
    [['haptic', '', hap, -10, 80], ['撕囊口', 'rim', rim, -16, -30, CAP], ['optic', '', opt, 14, 46]], T.on(2));
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>` + p1.s + p2.s + p3.s;
  o += box(PH - 46, '支撐不夠：鞏膜固定、虹膜固定或前房 IOL', T.on(3, 0.6), INK2, 36, 15, FW);
  return { F: { svg: o, extra: p1.ex + p2.ex + p3.ex, P: { title: 'IOL 放哪裡：經主切口的切面，放大 11 點周邊（模型）', orient: '左＝11 點　上＝前　位置為示意' } } };
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
  const lv = sec(cat({ bag: BAGC, pcr: { rent: RENT, vit: { prolapse: 1, to: 'main', cut: 0, ta: 1 } } }), W_FRONT, 'sL');
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
  // the referral line as the authors' own conclusion (Vanner 2014 abstract: "support referring … promptly to a vitreoretinal surgeon but do not
  // support interfacility transport for SD-PPV"); the referral itself also from the two reviews (Rajan 2025; Arbisser 2006)
  o += box(PH - 120, 'Vanner 2014 作者的結論：儘快轉給 VR；不支持為了當天手術而轉院', T.on(3, 0.6), COL.accent, 44, 18, FW);
  o += box(PH - 64, '核塊掉進玻璃體腔 → 轉 VR（Rajan 2025；Arbisser 2006）', T.on(3, 0.6), INK2, 36, 15, FW);
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
