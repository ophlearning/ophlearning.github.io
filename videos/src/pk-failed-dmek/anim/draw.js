// ============================================================================
// Drawing of every segment of the video「Failed DMEK 後的 PK（助手版）」(text is in segments.js). DRAW2[id](T) returns { L, R } (dual),
// { F } (full) or { R } (title): { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels: PW × PH px (video-kit/kit.js).
// Both views are the same 3D left eye of videos/models/globe/pk.js (st.pk; sources and the 示意 list in that file and globe/CARD.md):
//   left  = 機轉切面: the meridional section through 12 and 6 o'clock (left = 12, right = 6, anterior up); 1-1 line 3 and 3-2 use the section
//           through 1 and 7 o'clock (right = 7, the LI);
//   right = 術者視角: the microscope view of the OS eye, surgeon at 12 (下＝12 點、左＝3 點 temporal).
// The case states are the ones of the printed sheets (print/video.js: ST.pre … ST.leak, the same numbers), so video and sheets agree.
// 示意 (no source, said on screen): trephine and donor sizes (7.5 / 7.75 mm, 依主刀), how far the DMEK graft is detached, PAS extent, hyphema
// height, the epithelial defect, the IOL type, the leak position (4 o'clock), the Flieringa ring position, the TSCL size, the forward bulge.
// window.SYNC records what check.js compares (the same clock hour in both views; cardinal order; the hyphema state; suture count).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, G = GLOBE, K = PK;
const OR = K.orient({ eye: 'OS', surgeon: 12 });
const M12 = G.enfaceMap(12);
const WARN = '#b3262c', INK2 = '#3c4a57', HYC = '#86161b', IRC = '#4a2b19', DMC = '#2f6f6a', IOLC = '#7a6a1e', DONC = '#3c6f93', SUTC = '#1f2a44',
  ENDC = '#9a5f14', LIC = '#7a2614', GRN = '#1d6b3a', BLU = '#2a6f9a', STEEL = '#4e5964';
const f1 = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// labels at the panel edge (left x 14, right W − 12); when the anchor is far across, the label slides along its row toward it (leader ≤ LEAD_MAX px)
const LEAD_MAX = 120;
function slideX(zh, en, tx, ty, a, o, W) {
  if (!a || o.fix) return tx; const w = lw(zh, en, o), right = o.side === 'R', y1 = ty - (o.size || 15) * 0.36, dy = Math.abs(a[1] - y1), keep = Math.sqrt(Math.max(0, LEAD_MAX * LEAD_MAX - dy * dy));
  if (!right) { const dx = a[0] - (tx + w + 7); return dx > keep ? Math.min(tx + dx - Math.max(keep, 26), W - 12 - w) : tx; }
  const dx = (tx - w - 7) - a[0]; return dx > keep ? Math.max(tx - dx + Math.max(keep, 26), 14 + w) : tx;
}
const labL = (zh, en, y, a, o = {}, W = PW) => a ? lab(zh, en, slideX(zh, en, 14, y, a, o, W), y, a, o) : '';
const labR = (zh, en, y, a, o = {}, W = PW) => a ? lab(zh, en, slideX(zh, en, W - 12, y, a, { ...o, side: 'R' }, W), y, a, { ...o, side: 'R' }) : '';
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op = 1, col = WARN, y = 28, x = PW / 2) => op > 0.01 ? `<g opacity="${(+op).toFixed(2)}"><rect x="${(x - measure(s, 16, true) / 2 - 12).toFixed(1)}" y="${y - 20}" width="${(measure(s, 16, true) + 24).toFixed(1)}" height="28" rx="6" fill="#fff" stroke="${col}" stroke-width="1.6"/>${text(x, y, s, { size: 16, bold: true, color: col, anchor: 'middle' })}</g>` : '';
// a white box with lines of text (first line bold); x, y top left
const tbox = (x, y, w, rows, op = 1, col = INK2, o = {}) => { if (op <= 0.01) return ''; const lh = o.lh || 22, h = rows.length * lh + 16;
  return `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" opacity="0.94" stroke="${col}" stroke-width="1.5"/>` +
    rows.map((r, i) => text(x + 12, y + 24 + i * lh, r, { size: o.size || 15, bold: i === 0, color: i === 0 ? col : INK2 })).join('') + `</g>`; };
const dot = (q, col, r = 5.5, op = 1) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.6" opacity="${op}"/>`;
const arrow = (pts, col, w = 2.4, op = 1) => { if (op <= 0.01 || pts.length < 2) return ''; const a = pts[pts.length - 2], b = pts[pts.length - 1], d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1, u = [d[0] / l, d[1] / l], n = [-u[1], u[0]], h = 9;
  const dd = 'M' + pts.map(f1).join('L');
  return `<g opacity="${(+op).toFixed(2)}"><path d="${dd}" fill="none" stroke="#fff" stroke-width="${w + 3}" opacity="0.8"/><path d="${dd}" fill="none" stroke="${col}" stroke-width="${w}"/><path d="M${f1(b)}L${f1([b[0] - u[0] * h + n[0] * h * 0.55, b[1] - u[1] * h + n[1] * h * 0.55])}L${f1([b[0] - u[0] * h - n[0] * h * 0.55, b[1] - u[1] * h - n[1] * h * 0.55])}Z" fill="${col}"/></g>`; };
const sbar = (v, op = 1) => VIEWS.sbar(v.k, op, 2);
const badge = (q, n, op = 1, col = SUTC) => op > 0.01 ? `<g opacity="${(+op).toFixed(2)}"><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="11" fill="${col}" stroke="#fff" stroke-width="1.6"/>${text(q[0], q[1] + 5, String(n), { size: 14, bold: true, color: '#fff', anchor: 'middle' })}</g>` : '';
const fade = (svg, op) => op >= 0.999 ? svg : op <= 0.001 ? '' : `<g opacity="${op.toFixed(3)}">${svg}</g>`;

// ---------------------------------------------------------------- panel titles (window.PRELOAD_EXTRA: top-level strings are not in the font preload)
const secT = h => { const o = K.orient({ eye: 'OS', view: 'section', h }); return { title: `機轉切面：經 ${o.left} 點與 ${o.right} 點（模型）`, orient: `左＝${o.left} 點　右＝${o.right} 點　上＝前` }; };
const SEC6 = secT(6), SEC7 = secT(7);
const SCOPE_T = { title: '術者視角　左眼 OS（模型）', orient: `下＝${OR.bottom} 點　左＝${OR.left} 點 ${OR.leftSide}` };
const TXT_T = (t, o = '') => ({ title: t, orient: o });
window.PRELOAD_EXTRA = JSON.stringify([SEC6, SEC7, SCOPE_T]) + OR.text + '示意模型依主刀院內常規危險示範0123456789.–→°×';

// ---------------------------------------------------------------- states (st.pk; = print/video.js ST, case A: OS, pseudophakic, LI at 7)
const A0 = { eye: 'OS', soft: 0.3, edema: 0.3, haze: 0.35, dmek: { d: 8.0, h: 6, detach: 0.4, gap: 0.35 }, lens: 'iol', ac: 0.4, bombe: 0.3, pas: 0.8,
  li: { h: 7, r: 4.3, d: 0.3 }, hy: { pos: 'supine' } };
const pk = o => ({ pk: { ...A0, ...o } });
const TD = 7.5, DD = 7.75;                                                       // 示意 (院內範本留白、依主刀)
const T1 = { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 };
const CLEAN = { pas: 0, hy: null, ac: 1, bombe: 0, dmek: null };                // after the chamber is dealt with (依主刀); the host button (with the DMEK graft) is gone
const OPEN = { tre: T1, open: 1, dmek: null };
const SEWN = { ...OPEN, ...CLEAN, donor: { d: DD, place: 1 } };
const ST = {
  pre: pk({}),
  tre: pk({ press: 0.4, tre: { d: TD, depth: 0.6 } }),
  open: pk(OPEN),
  clean: pk({ ...OPEN, ...CLEAN }),
  card: pk({ ...SEWN, sut: { n: 16, placed: 4, tie: 1 } }),
  all: pk({ ...SEWN, sut: { n: 16, placed: 16, tie: 1, bury: 1 } }),
  leak: pk({ ...SEWN, sut: { n: 16, placed: 16, tie: 1, bury: 1 }, fl: 1, leak: { h: 4, amt: 0.6 } }),
};
const CARD_H = K.sutOrder(16).slice(0, 4).map(o => o.h);                         // 12, 6, 3, 9 (the model's order; check.js compares with the narration)

// ---------------------------------------------------------------- views (the same 3D eye; v.Q maps a 3D point into panel px)
const WS = { x: -6.8, y: -14.85, w: 13.6 };                                     // section window (mm): limbus to limbus, the donor held above to the IOL
const WSC = { x: -10, y: -6.77, w: 20 };  
const WS4 = { x: -6.8, y: -16.0, w: 13.6 };                                     // 4-1: 1.15 mm higher (the donor held above the eye)                                     // microscope window (mm): the whole cornea and the sclera round it
const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, o = {}) {
  const win = o.win || WS, W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), hh = win.w * H / W;
  const r = K.section({ st, h: o.h ?? 6, win: { x: win.x, y: win.y, w: win.w, h: hh }, step: o.step || +(win.w / 300).toFixed(4), id: o.id || 's' });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, h: o.h ?? 6, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, id, o = {}) {
  const win = o.win || WSC, W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), r = K.enface({ st, id, surgeon: 12 });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(M12(p3)), C: c.P(M12([0, 0, 0])) };
}
const cd = h => G.clockDir(h);
const at = (h, rho, z = 0) => [rho * cd(h)[0], rho * cd(h)[1], z];
// a point inside the host cornea (mid-thickness) at clock h, radius rho (drawn frame: the soft eye's sag included)
const hostPt = (st, h, rho, f = 0.5) => { const c = K.norm(st), s = K.sOfR(rho); return K.toDrawn(c, G.P3(h, s, K.Th(c, s) * f)); };
// orientation tag of the microscope view and clock numerals round it
const orientTag = (op = 1) => { const s = `${OR.text.split('　')[0]}　術者坐 ${OR.bottom} 點`; return `<g opacity="${op}"><rect x="10" y="8" width="${(measure(s, 15, true) + 22).toFixed(0)}" height="30" rx="6" fill="#1d2733" opacity="0.85"/>` + text(21, 29, s, { size: 15, bold: true, color: '#fff' }) + `</g>`; };
const clockNums = (v, hours = [12, 3, 6, 9], rho = 6.2, op = 1) => hours.map(h => { const q = v.Q(at(h, rho)); return htext(q[0], q[1] + 6, String(h), { size: 16, bold: true, color: INK2, anchor: 'middle', op }); }).join('');
// overlays drawn by this file (示意): epithelial defect, Flieringa ring, darkening red reflex, TSCL
const blob = (v, c3, r0, op) => { const pts = []; for (let k = 0; k < 64; k++) { const t = 2 * Math.PI * k / 64, r = r0 * (1 + 0.13 * Math.sin(3 * t + 0.7) + 0.07 * Math.sin(5 * t)); pts.push(v.Q([c3[0] + r * Math.cos(t), c3[1] + r * Math.sin(t), 0])); }
  return { svg: `<path d="M${pts.map(f1).join('L')}Z" fill="#ffffff" fill-opacity="${(0.22 * op).toFixed(2)}" stroke="#55707f" stroke-width="1.8" stroke-dasharray="6 4" opacity="${op.toFixed(2)}"/>`, edge: pts[56] }; };
const ringPx = (v, rho, n = 120) => { const pts = []; for (let k = 0; k < n; k++) pts.push(v.Q(at(12 * k / n, rho))); return 'M' + pts.map(f1).join('L') + 'Z'; };
const flieringa = (v, op) => { const rho = G.surfAt(3.0).rho, d = ringPx(v, rho); return op > 0.01 ? `<g opacity="${op.toFixed(2)}"><path d="${d}" fill="none" stroke="#fff" stroke-width="7"/><path d="${d}" fill="none" stroke="${STEEL}" stroke-width="3.4" stroke-dasharray="10 6"/></g>` : ''; };
const reflexDark = (v, k) => k > 0.01 ? `<circle cx="${v.C[0].toFixed(1)}" cy="${v.C[1].toFixed(1)}" r="${(K.PN.pupil * v.k).toFixed(1)}" fill="#000" opacity="${(0.6 * k).toFixed(2)}"/>` : '';
// TSCL (示意): 0.12 mm above the surface, from 1 mm past the limbus over the apex; section: both meridians; microscope: its edge
const tsclSec = (v, st, op) => { if (op <= 0.01) return ''; const c = K.norm(st), side = h => { const pts = []; for (let s = 1.0; s >= G.S_APEX; s -= 0.1) pts.push(v.Q(K.toDrawn(c, G.P3(h, s, -0.12)))); return pts; };
  const pts = [...side(v.h + 6), ...side(v.h).reverse()], d = 'M' + pts.map(f1).join('L');
  return `<g opacity="${op.toFixed(2)}"><path d="${d}" fill="none" stroke="#fff" stroke-width="6"/><path d="${d}" fill="none" stroke="${BLU}" stroke-width="2.6"/></g>`; };
const tsclScope = (v, op) => { if (op <= 0.01) return ''; const d = ringPx(v, G.surfAt(1.0).rho); return `<g opacity="${op.toFixed(2)}"><path d="${d}" fill="${BLU}" fill-opacity="0.07" stroke="#fff" stroke-width="6"/><path d="${d}" fill="none" stroke="${BLU}" stroke-width="2.6"/></g>`; };
// record for check.js
window.SYNC = {};
const rec = (id, k, v) => { (window.SYNC[id] = window.SYNC[id] || {})[k] = JSON.parse(JSON.stringify(v)); };
const recOrient = (id, v) => rec(id, 'orient', { c: v.C, p12: v.Q(at(12, K.RHO_L)), p3: v.Q(at(3, K.RHO_L)), title: SCOPE_T.orient });
const recLI = (id, s, v) => rec(id, 'li', { scope: v.A.li, c: v.C, secH: s.h, sec: s.A.li || null, axis: s.Q([0, 0, K.APEX_Z]) });
// a second rendering faded in over the first (two different states or planes; both are opaque)
const xfade = (a, b, k) => k <= 0.001 ? a.svg : k >= 0.999 ? b.svg : a.svg + fade(b.svg, k);

// ---------------------------------------------------------------- 片頭: the sutured graft
DRAW2['title'] = T => {
  const v = scope(ST.all, 'ti');
  let x = labR('供體角膜 donor', '', 300, v.A.donor, { bold: true, color: DONC, lc: '#5d9bc4', op: T.on(0, 0.6, 0.8) });
  x += labL('縫線 sutures', '', 352, v.A.knot3, { bold: true, color: SUTC, lc: SUTC, op: T.on(1, 0.6) });
  x += labR('雷射虹膜切開 LI', '7 點', 64, v.A.li, { color: LIC, lc: LIC, op: T.on(1, 0.6, 0.8) });
  return { R: { svg: v.svg + orientTag(), extra: x + note('模型示意', 1), P: { title: '縫好的樣子：術者視角（模型）', orient: SCOPE_T.orient } } };
};

// ---------------------------------------------------------------- 1 為什麼改 PK
DRAW2['1-1'] = T => {
  const st = ST.pre, k7 = T.on(3, 0.8), a = sec(st, { id: 's6' }), b = k7 > 0 ? sec(st, { h: 7, id: 's7' }) : null, s = k7 >= 0.5 ? b : a;
  const o0 = T.on(0) * (1 - k7), o1 = T.on(1) * (1 - k7), o2 = T.on(2) * (1 - k7);
  let L = xfade(a, b, k7), lx = '';
  lx += labL('角膜水腫 corneal edema', '', 40, a.Q(hostPt(st, 12, 2.4)), { bold: true, color: INK2, op: o0 });
  lx += labL('人工水晶體 PCIOL', '', 344, a.A.iol, { color: IOLC, lc: IOLC, op: o0 });
  lx += labR('DMEK graft 翹起', 'detached（示意）', 40, a.A.dmek6, { bold: true, color: DMC, lc: '#2f8f8a', op: o1 });
  const acTop = a.Q(hostPt(st, 12, 0.01, 1.0)), acBot = a.A.lensFront, acDim = o2 > 0.01 ? VIEWS.dim([acTop[0], acTop[1] + 6], [acBot[0], acBot[1] - 2], BLU, o2) + htext(acTop[0] - 10, (acTop[1] + acBot[1]) / 2 - 4, '前房淺 shallow AC', { size: 15, bold: true, color: BLU, anchor: 'end', op: o2 }) : '';
  lx += labL('周邊虹膜貼角膜 PAS', '', 270, a.A.pasL, { color: IRC, lc: IRC, op: o2 });
  lx += labR('虹膜往前鼓 iris bombé', '', 300, a.A.iris, { bold: true, color: IRC, lc: IRC, op: o2 });
  lx += labR('前房積血 hyphema', '平躺：沉在後方', 344, a.A.hy, { bold: true, color: HYC, lc: HYC, op: o2 });
  if (b) { lx += labR('雷射虹膜切開 LI', '7 點', 300, b.A.li, { bold: true, color: LIC, lc: LIC, op: ss(0.5, 1, k7) });
    lx += labL('人工水晶體 PCIOL', '', 344, b.A.iol, { color: IOLC, lc: IOLC, op: ss(0.5, 1, k7) }); recLI('1-1', b, scope(st, 'o11')); }
  const v = scope(st, 'o11'), ed = blob(v, at(8.5, 2.4), 1.5, T.on(2));
  let rx = labL('人工水晶體 PCIOL', '虛線', 300, v.A.iol, { color: IOLC, lc: IOLC, op: T.on(0) });
  rx += labR('DMEK graft 翹起（示意）', 'detached', 64, v.A.dmek, { bold: true, color: DMC, lc: '#2f8f8a', op: T.on(1) });
  rx += labR('上皮缺損（示意）', 'epithelial defect', 300, ed.edge, { bold: true, color: '#3d5866', lc: '#55707f', op: T.on(2) }, PW - 16);   // 16 px spare: this one renders wider than measured
  rx += labL('前房積血 hyphema', '', 352, v.A.hy, { bold: true, color: HYC, lc: HYC, op: T.on(2) });
  rx += labR('雷射虹膜切開 LI', '7 點', 112, v.A.li, { bold: true, color: LIC, lc: LIC, op: T.on(3) });
  recOrient('1-1', v); rec('1-1', 'hy', { st, label: '平躺', secH: a.h });
  return { L: { svg: L + acDim + sbar(s), extra: lx, P: k7 >= 0.5 ? SEC7 : SEC6 },
           R: { svg: v.svg + ed.svg + orientTag() + clockNums(v), extra: rx, P: SCOPE_T } };
};

DRAW2['1-2'] = T => {
  const st = ST.pre, a = sec(st), k2 = T.on(2);
  // the trephine's place (示意, size 依主刀): dashed verticals at the trephine radius on both sides
  const cut = [12, 6].map(h => { const top = a.Q(at(h, TD / 2, K.APEX_Z + 0.6)), bot = a.Q(at(h, TD / 2, K.APEX_Z - 1.6)); return `<path d="M${f1(top)}L${f1(bot)}" stroke="${WARN}" stroke-width="2.4" stroke-dasharray="7 5" opacity="${k2.toFixed(2)}"/>`; }).join('');
  let lx = labR('DMEK graft 翹起', 'detached（示意）', 40, a.A.dmek6, { bold: true, color: DMC, lc: '#2f8f8a', op: T.on(0) * (1 - k2) });
  lx += labL('全層切開的位置', '大小依主刀', 40, a.Q(at(12, TD / 2, K.APEX_Z + 0.4)), { bold: true, color: WARN, lc: WARN, op: k2 });
  lx += labR('前房積血 hyphema', '', 300, a.A.hy, { bold: true, color: HYC, lc: HYC, op: k2 });
  lx += labL('沾黏 PAS', '', 300, a.A.pasL, { bold: true, color: IRC, lc: IRC, op: k2 });
  // right: the literature as cards
  let R = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  R += tbox(16, 16, PW - 32, ['DMEK 失敗最常見的原因', 'primary graft failure：64.1%', '多中心系列（Gómez-Benlloch 2021）'], T.on(0), DMC, { size: 16, lh: 26 });
  R += tbox(16, 134, PW - 32, ['也可以再做一次 DMEK', '55 眼：早期再做的視力，', '和對側眼第一次 DMEK 差不多（Price 2015）'], T.on(1), BLU, { size: 16, lh: 26 });
  R += tbox(16, 278, PW - 32, ['這台：改做 PK（主治決定）', '全層打開以後，前房的血和沾黏', '可以直接處理'], k2, WARN, { size: 16, lh: 26 });
  return { L: { svg: a.svg + cut + sbar(a), extra: lx, P: SEC6 }, R: { svg: R, extra: '', P: TXT_T('文獻：DMEK 失敗之後', '摘要') } };
};

// ---------------------------------------------------------------- 2 Trephine 與 open sky
// line 0: partial depth (0–0.36), the blade into the chamber at 12 (0.4), scissors round clockwise (0.46–0.86), the button lifted off (0.88–1)
function treState(p) {
  const dep = 0.6 * ss(0, 0.34, p), press = 0.4 * ss(0, 0.08, p) * (1 - ss(0.34, 0.4, p)), ent = p >= 0.4, scis = 360 * ss(0.46, 0.86, p), open = ss(0.88, 1, p);
  const tre = ent ? { d: TD, depth: 0.6, enter: { h: 12, w: 1.0 }, scis, dir: 1 } : { d: TD, depth: dep };
  const inst = p > 0 && p < 0.36 ? [{ kind: 'trephine' }] : p > 0.46 && p < 0.86 ? [{ kind: 'scissors', h: (12 + scis / 30) % 12 || 12, dir: 1 }] : [];
  return { st: pk({ press, tre, ...(open > 0 ? { open, dmek: null } : {}), inst }), dep, ent, scis, open };
}
DRAW2['2-1'] = T => {
  const p0 = T.p(0, 0.04, 0.96), S0 = treState(p0), k3 = T.p(3, 0.12, 0.6), bulge = 0.9 * k3, st = bulge > 0 ? pk({ ...OPEN, bulge }) : S0.st;
  const a = sec(st), v = scope(st, 'o21'), on1 = T.on(1), on2 = T.on(2), on3 = T.on(3);
  const stage = S0.open > 0 ? 3 : S0.scis > 0 ? 2 : S0.ent ? 1 : 0;
  let lx = '', rx = '';
  // line 0: what is being cut
  const l0 = T.on(0) * (1 - on1);
  lx += labL('Trephine', '部分深度（約六成，示意）', 40, stage === 0 ? (a.A.blade12 || a.A.treBot12) : a.A.treBot12, { bold: true, color: INK2, op: l0 * (stage <= 1 ? 1 : 0.0) });
  lx += labL('進前房 entry', '12 點', 40, a.A.tre12, { bold: true, color: INK2, op: l0 * (stage === 1 || stage === 2 ? 1 : 0) });
  lx += labL('取下受體角膜', 'host button', 40, a.A.hostEdgeL, { bold: true, color: INK2, op: l0 * (stage === 3 ? 1 : 0) });
  rx += labR('Trephine', '依主刀', 64, v.A.trephine, { bold: true, color: INK2, op: T.on(0) * (stage === 0 ? 1 : 0) });
  rx += labR('角膜剪 scissors', '順時針剪完一圈', 64, v.A.scissors, { bold: true, color: INK2, op: T.on(0) * (stage === 2 ? 1 : 0) });
  rx += labR('Open sky', '開口邊緣 host rim', 64, v.A.hostEdge, { bold: true, color: INK2, op: (stage === 3 ? 1 : 0) * (1 - on3) });
  // lines 1–2: risk and the ring (依主刀)
  lx += labL('人工水晶體 PCIOL', '', 344, a.A.iol, { color: IOLC, lc: IOLC, op: on1 * (1 - on3) });
  const risk = tbox(16, 14, 420, ['Suprachoroidal hemorrhage', '危險因子：以前的眼內手術（Ingraham 1989）'], on1 * (1 - on2), WARN);
  rx += labR('Flieringa ring', '撐住鞏膜（依主刀，位置示意）', 352, v.Q(at(10.4, G.surfAt(3.0).rho)), { bold: true, color: STEEL, lc: STEEL, op: on2 * (1 - on3) });
  // line 3: danger demonstration
  lx += labR('虹膜與 IOL 往前鼓', 'bulge（示意）', 112, a.A.lensFront, { bold: true, color: WARN, lc: WARN, op: on3 });
  lx += labL('開口邊緣 host rim', '', 300, a.A.hostEdgeL, { color: INK2, op: on3 });
  rx += labR('紅光變暗', '→ 馬上講', 112, v.C, { bold: true, color: WARN, lc: WARN, op: ss(0.4, 0.8, k3) });
  const warn = tag('危險示範（示意）', on3), keep = tag('不壓眼球、不扳開瞼器', on3, WARN, PH - 18, PW - 106);
  return { L: { svg: a.svg + risk + sbar(a) + warn, extra: lx, P: SEC6 },
           R: { svg: v.svg + flieringa(v, on2 * (1 - on3)) + reflexDark(v, ss(0.4, 0.8, k3)) + orientTag() + clockNums(v) + warn + keep, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 3 前房的處理
// line 0: open sky (blood, synechiae, IOL); line 1: the synechiae separated (示意 sweep; the last 0.03 mm let go once the blood is out, otherwise the
// supine blood would run into the opened angle and leave the centre); line 2: blood cleared (依主刀) and Healon filling the chamber (院內常規)
DRAW2['3-1'] = T => {
  const p1 = T.p(1, 0.15, 0.9), p2a = T.p(2, 0.05, 0.5), p2b = T.p(2, 0.45, 0.95), hyH = 0.8 * (1 - p2a);
  const st = pk({ ...OPEN, pas: hyH > 0.02 ? lerp(0.8, 0.03, p1) : 0, hy: hyH > 0.02 ? { pos: 'supine', h: hyH } : null, ovd: p2b, ac: lerp(0.4, 1, p2b), bombe: lerp(0.3, 0, p2b) });
  const a = sec(st), v = scope(st, 'o31'), on0 = T.on(0), on1 = T.on(1), on2 = T.on(2);
  let lx = '', rx = '';
  lx += labR('前房積血 hyphema', '', 300, a.A.hy, { bold: true, color: HYC, lc: HYC, op: on0 * (1 - ss(0.6, 0.9, p2a)) });
  lx += labL('人工水晶體 PCIOL', '', 344, a.A.iol, { color: IOLC, lc: IOLC, op: on0 });
  lx += labL('虹膜貼在角膜後 PAS', '', 260, a.A.pasL, { bold: true, color: IRC, lc: IRC, op: on0 * (1 - ss(0.7, 1, p1)) });
  lx += labL('輕輕分開 separate', '先分開再縫', 260, a.A.irisL, { bold: true, color: GRN, lc: GRN, op: ss(0.7, 1, p1) * (1 - on2) });
  const sweep = [12, 6].map(h => { const pA = a.Q(at(h, 5.5, 10.5)), pB = a.Q(at(h, 4.6, 10.2)); return arrow([pA, pB], GRN, 2.6, on1 * (1 - ss(0.8, 1, p1))); }).join('');
  lx += labR('清血', '方法依主刀', 112, a.Q(at(6, 1.4, 10.5)), { bold: true, color: HYC, lc: HYC, op: on2 * (1 - ss(0.6, 1, p2b)) });
  lx += labR('Healon 撐起前房', '院內常規', 112, a.A.ac, { bold: true, color: BLU, lc: BLU, op: ss(0.3, 0.8, p2b) });
  rx += labR('前房積血 hyphema', '', 64, v.A.hy, { bold: true, color: HYC, lc: HYC, op: on0 * (1 - ss(0.6, 0.9, p2a)) });
  rx += labL('人工水晶體 PCIOL', '虛線', 352, v.A.iol, { color: IOLC, lc: IOLC, op: on0 });
  rx += labL('開口邊緣 host rim', '', 64, v.A.hostEdge, { color: INK2, op: on0 });
  rx += labR('Healon', '院內常規', 64, v.Q(at(10.5, 2.8)), { bold: true, color: BLU, lc: BLU, op: ss(0.3, 0.8, p2b) });
  return { L: { svg: a.svg + sweep + sbar(a), extra: lx, P: SEC6 }, R: { svg: v.svg + orientTag() + clockNums(v), extra: rx, P: SCOPE_T } };
};

// lines 0–1: before surgery (pupillary block: aqueous behind the iris pushes it forward); lines 2–3: open sky after 3-1 (LI at 7, IOL)
DRAW2['3-2'] = T => {
  const k2 = T.on(2, 0.8), a = sec(ST.pre, { h: 7, id: 's7a' }), b = k2 > 0 ? sec(pk({ ...OPEN, ...CLEAN, ovd: 1 }), { h: 7, id: 's7b' }) : null, s = k2 >= 0.5 ? b : a;
  const va = scope(ST.pre, 'o32a'), vb = k2 > 0 ? scope(pk({ ...OPEN, ...CLEAN, ovd: 1 }), 'o32b') : null, v = k2 >= 0.5 ? vb : va;
  const on0 = T.on(0) * (1 - k2), on1 = T.on(1) * (1 - k2), n2 = ss(0.5, 1, k2), on3 = T.on(3);
  let lx = '', rx = '';
  // aqueous trapped behind the iris (arrows from the posterior chamber forward, 示意)
  const push = [[1, 3.0], [7, 3.0]].map(([h, r]) => { const z0 = 9.55, p0 = a.Q(at(h, r, z0 - 0.15)), p1 = a.Q(at(h, r, z0 + 0.35)); return arrow([p0, p1], BLU, 2.4, on0); }).join('');
  lx += tag('術前（DMEK 後）', on0 + on1 > 0 ? Math.max(on0, on1) : 0, INK2, 28, PW / 2);
  lx += labR('虹膜往前鼓 iris bombé', '', 112, a.A.iris, { bold: true, color: IRC, lc: IRC, op: on0 });
  lx += labL('房水卡在虹膜後', 'aqueous behind iris', 344, a.Q(at(1, 3.0, 9.45)), { bold: true, color: BLU, lc: BLU, op: on0 });
  lx += labR('雷射虹膜切開 LI', '7 點', 300, s.A.li, { bold: true, color: LIC, lc: LIC, op: Math.max(on1, n2) });
  lx += labR('確認通不通', '必要時加做 PI（依主刀）', 344, s.A.li, { bold: true, color: WARN, lc: WARN, op: n2 });
  lx += labL('人工水晶體 PCIOL', '看位置（依主刀）', 344, s.A.iol, { bold: true, color: IOLC, lc: IOLC, op: on3 });
  rx += labR('雷射虹膜切開 LI', '7 點', 112, v.A.li, { bold: true, color: LIC, lc: LIC, op: Math.max(on1, n2) });
  rx += labL('人工水晶體 PCIOL', '虛線', 352, v.A.iol, { bold: true, color: IOLC, lc: IOLC, op: on3 });
  if (b) recLI('3-2', b, vb);
  return { L: { svg: xfade(a, b, k2) + push + sbar(s), extra: lx, P: SEC7 }, R: { svg: xfade(va, vb, k2) + orientTag() + clockNums(v), extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 4 供體與縫合
// line 0: the donor on the punch block, endothelium up (Healon on it), turned over and laid in; line 1: cardinal sutures 12 → 6 → 3 → 9;
// line 2: the other 12 sutures, then the knots buried; line 3: the assistant holds on the side opposite the surgeon's needle (示意 positions)
DRAW2['4-1'] = T => {
  const p0 = T.p(0, 0.05, 0.98), flip = ss(0.5, 0.62, p0), place = ss(0.66, 1, p0), p1 = T.p(1, 0.08, 0.95), p2 = T.p(2, 0.05, 0.8), bury = T.p(2, 0.82, 1), on3 = T.on(3);
  const placed = 4 * p1 + 12 * p2, base = { ...OPEN, ...CLEAN };
  const sut = placed > 0 ? { n: 16, placed, tie: 1, bury } : null;
  const cur = placed > 0 && placed < 4 ? CARD_H[Math.min(3, Math.floor(placed))] : null;
  const inst = cur ? [{ kind: 'holder', h: cur, pass: placed - Math.floor(placed) }] : on3 > 0 ? [{ kind: 'holder', h: 4.5, pass: 0.55 }, { kind: 'forceps', h: 10.5, r: TD / 2 + 0.45 }] : [];
  const stU = pk({ ...base, donor: { d: DD, place: 0, endoUp: true } }), stD = pk({ ...base, donor: { d: DD, place }, sut, inst });
  const a = flip > 0 && flip < 1 ? sec(stU, { id: 'sU', win: WS4 }) : null, b = sec(flip <= 0 ? stU : stD, { id: 'sD', win: WS4 });
  const va = flip > 0 && flip < 1 ? scope(stU, 'o41a') : null, vb = scope(flip <= 0 ? stU : stD, 'o41b');
  const Lsvg = a ? xfade(a, b, flip) : b.svg, Rsvg = va ? xfade(va, vb, flip) : vb.svg;
  const on0 = T.on(0), on1 = T.on(1), on2 = T.on(2);
  let lx = '', rx = '';
  lx += labL('供體 donor', 'punch 台上', 130, b.A.donorTop, { bold: true, color: DONC, lc: '#5d9bc4', op: on0 * (1 - flip) });
  lx += labR('內皮朝上 endothelium', '塗 Healon', 130, b.A.endo6, { bold: true, color: ENDC, lc: '#c7832a', op: on0 * (1 - flip) });
  lx += labL('翻面放上', '內皮朝下，不碰', 40, b.A.donorTop, { bold: true, color: DONC, lc: '#5d9bc4', op: flip * (1 - on1) });
  lx += labR('內皮 endothelium', '朝下', 112, b.A.endo6, { bold: true, color: ENDC, lc: '#c7832a', op: flip * (1 - on1) });
  // cardinal badges: section (12 left, 6 right) and microscope, the same numbers
  let bs = '', bv = '';
  CARD_H.forEach((h, i) => { const op = clamp01((placed - i) * 1.5) * (1 - on3 * 0.6);
    const q = vb.A['sutIn' + h]; if (q) { const d = [q[0] - vb.C[0], q[1] - vb.C[1]], l = Math.hypot(...d) || 1; bv += badge([q[0] - d[0] / l * 20, q[1] - d[1] / l * 20], i + 1, op); }
    const qs = b.A['sutOut' + h]; if (qs) bs += badge([qs[0], qs[1] - 34], i + 1, op); });
  lx += labR('縫線深度約九成', '示意', 300, b.A.sutDeep6, { color: SUTC, lc: SUTC, op: on1 * (1 - on2) });
  rx += labR('Cardinal', '12 → 6 → 3 → 9', 64, vb.A.sutOut9 || vb.A.sutOut6 || vb.A.sutOut12, { bold: true, color: SUTC, lc: SUTC, op: on1 * (1 - on2) * (placed > 3.2 ? 1 : 0) });
  rx += labR('持針器 needle holder', '', 64, vb.A.needle, { color: INK2, op: on1 * (placed < 3.5 ? 1 : 0) });
  rx += labR('16 針 10-0 nylon', 'interrupted（院內常規）', 352, vb.A.sutOut10_5 || vb.A['sutOut10.5'], { bold: true, color: SUTC, lc: SUTC, op: on2 * (1 - on3) });
  lx += labR('線結埋起來 buried', '', 300, b.A.knot6, { bold: true, color: SUTC, lc: SUTC, op: ss(0.4, 1, bury) * (1 - on3) });
  rx += labR('主刀下針', 'needle', 64, vb.A.needle, { bold: true, color: INK2, op: on3 });
  rx += labL('助手在對側固定', 'forceps', 352, vb.A.forceps, { bold: true, color: GRN, lc: GRN, op: on3 });
  const asst = on3 > 0.01 ? htext(14, 300, '遞針、剪線、記針數', { size: 15, bold: true, color: GRN, op: on3 }) : '';
  rec('4-1', 'card', { c: vb.C, hours: CARD_H, scope: CARD_H.map(h => vb.A['sutOut' + h] || null), sec12: b.A.sutOut12 || null, sec6: b.A.sutOut6 || null, axis: b.Q([0, 0, K.APEX_Z]), placed });
  rec('4-1', 'nSut', Object.keys(vb.A).filter(k => /^sutOut/.test(k)).length);
  return { L: { svg: Lsvg + bs + sbar(b), extra: lx, P: SEC6 }, R: { svg: Rsvg + bv + orientTag() + clockNums(vb) + asst, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 5 收尾與術後
// line 0: BSS through the cannula between two sutures (chamber deepens, 示意 amount), fluorescein painted, a leak shown at 4 o'clock (示意);
// line 1: TSCL (示意 size), ointment, patch and shield (院內常規); lines 2–4: pathology, IOP, regraft survival as cards on the right
DRAW2['5-1'] = T => {
  const p0 = T.p(0, 0.02, 0.98), bss = ss(0.05, 0.42, p0), fl = ss(0.5, 0.7, p0), lk = ss(0.72, 0.95, p0), on1 = T.on(1), k2 = T.on(2), gone = ss(0, 0.6, T.p(1, 0, 0.4));
  const cann = p0 > 0.02 && p0 < 0.46 ? [{ kind: 'cannula', h: 6.375 }] : [];
  const st = pk({ ...SEWN, sut: { n: 16, placed: 16, tie: 1, bury: 1 }, ac: lerp(0.55, 1, bss), fl: fl * (1 - gone), leak: lk > 0 && gone < 1 ? { h: 4, amt: 0.6 * lk * (1 - gone) } : null, inst: cann });
  const a = sec(st), v = scope(st, 'o51');
  let lx = '', rx = '';
  lx += labR('BSS 重建前房', 'AC reformed', 112, a.A.ac, { bold: true, color: BLU, lc: BLU, op: T.on(0) * (1 - on1) });
  rx += labR('BSS cannula', '從縫線之間', 64, v.A.cannula, { bold: true, color: INK2, op: T.on(0) * (p0 < 0.46 ? 1 : 0) });
  rx += labR('Seidel test', '漏的地方沖成亮綠細流（位置示意）', 64, v.A.leak, { bold: true, color: GRN, lc: GRN, op: ss(0.3, 1, lk) * (1 - gone) });
  lx += labL('治療用隱形眼鏡 TSCL', '大小示意', 40, a.Q(K.toDrawn(K.norm(st), G.P3(12, -3.2, -0.12))), { bold: true, color: BLU, lc: BLU, op: on1 });
  const pack = tbox(16, 300, 420, ['院內常規', 'Maxitrol 藥膏，壓迫包紮＋金屬眼罩'], on1 * (1 - k2), INK2);
  rx += labR('隱形眼鏡 TSCL', '大小示意', 352, v.Q(at(10.5, G.surfAt(1.0).rho)), { bold: true, color: BLU, lc: BLU, op: on1 * (1 - k2) });
  // right panel turns into the post-op cards from line 2
  let C = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  C += tbox(16, 14, PW - 32, ['送病理（院內常規）', '取下的角膜＋DMEK graft'], 1, INK2, { size: 16, lh: 26 });
  C += tbox(16, 112, PW - 32, ['術後盯眼壓', 'PK 後早期眼壓升高，和瞳孔固定散大的', 'Urrets-Zavalia syndrome 有關（Figueiredo 2013）'], T.on(3), WARN, { size: 16, lh: 26 });
  C += tbox(16, 252, PW - 32, ['這是第二次移植（regraft）', 'PK 的 regraft 5 年存活 53%', '第一次 graft 90%（Thompson 2003）'], T.on(4), DMC, { size: 16, lh: 26 });
  const Rsvg = v.svg + tsclScope(v, on1) + orientTag() + clockNums(v);
  return { L: { svg: a.svg + tsclSec(a, st, on1) + pack + sbar(a), extra: lx, P: SEC6 },
           R: { svg: k2 >= 0.999 ? C : Rsvg + fade(C, k2), extra: k2 >= 0.5 ? '' : rx, P: k2 >= 0.5 ? TXT_T('術後要注意', '') : SCOPE_T } };
};

// ---------------------------------------------------------------- 6 助手清單 (full width: five items on the left, the orientation picture on the right)
DRAW2['6'] = T => {
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  const items = [['一', '方位', '術者坐 12 點：下方是 12 點，左眼的 temporal 在左；LI 在 7 點'], ['二', 'Open sky', '不壓、不扳；看虹膜和紅光'], ['三', '前房處理時', '主刀分沾黏、清前房，保持視野清楚'],
    ['四', '供體與固定', '內皮不碰；在主刀下針的對側固定'], ['五', '收尾與術後', '記針數、剪線、測漏；術後盯眼壓']];
  items.forEach(([n, h, s], i) => { const op = T.on(i + 1), y = 22 + i * 76;
    o += `<g opacity="${op.toFixed(2)}"><rect x="16" y="${y}" width="740" height="64" rx="10" fill="#f7f9fa" stroke="${COL.accent}" stroke-width="1.4"/>` +
      `<circle cx="50" cy="${y + 32}" r="20" fill="${COL.accent}"/>` + text(50, y + 39, n, { size: 20, bold: true, color: '#fff', anchor: 'middle' }) +
      text(84, y + 27, h, { size: 18, bold: true, color: COL.accent }) + text(84, y + 52, s, { size: 17, bold: true }) + `</g>`; });
  // the eye as the assistant sees it (OS, surgeon at 12), LI at 7
  const X0 = 772, W2 = FW - X0 - 2, v = scope(ST.pre, 'o6', { W: W2, win: { x: -8.2, y: -8.2 * PH / W2 + 0.2, w: 16.4 } });
  const sh = q => [q[0] + X0, q[1]];
  o += `<g transform="translate(${X0} 0)"><clipPath id="c6"><rect width="${W2}" height="${PH}"/></clipPath><g clip-path="url(#c6)">${v.svg}${clockNums(v, [12, 3, 6, 9], 6.4)}</g></g>`;
  o += htext(X0 + 10, PH - 14, '左眼 OS　術者坐 12 點', { size: 15, bold: true, color: INK2 });
  const x = labR('雷射虹膜切開 LI', '7 點', 40, sh(v.A.li), { bold: true, color: LIC, lc: LIC, op: T.on(1) }, FW) +
    lab('顳側 temporal', '', X0 + 12, 230, sh(v.Q(at(3, 5.0))), { bold: true, color: INK2, op: T.on(1) });
  return { F: { svg: o, extra: x, P: TXT_T('助手記住這五件事', '') } };
};
