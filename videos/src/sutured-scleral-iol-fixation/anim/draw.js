// ============================================================================
// Drawing of every segment of the video 鞏膜縫合固定 IOL＋23G TPPV (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full)
// / { R } (title): { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Both views are the same 3D globe (videos/models/globe/sfix.js; sources and the 示意 list: CARD.md 鞏膜縫合固定 IOL):
//   left  = 機轉切面: the meridional section through 2 and 8 o'clock (right = 2 o'clock, up = anterior), whole or magnified at the 2 o'clock site;
//   right = 術者視角: the microscope view, RIGHT eye OD, surgeon at 12 (下＝12 點、右＝9 點 temporal; 2 o'clock lower left, 8 o'clock upper right).
// "x mm" = behind the posterior surgical limbus (PSL, X.sAbs) unless drawn as measured from the clear-cornea edge (visible limbus). A point shown in
// both views is the same 3D point (window.SYNC records them per segment; check.js compares them).
// Chapters 3–9 are placeholders this round (panel title + 「畫面製作中」, no numbers); spec.md 進度 lists them.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2, G = GLOBE, K = CATARACT, X = SFIX, SN = X.SN, C = X.C;
const HP = SN.hours[0];                                                       // the section runs through 2–8; right = 2 o'clock
const OR = K.orient({ eye: 'OD', surgeon: 12 });
const PUR = '#6a3fb0', BLU = '#2a8fc7', GRN = '#1d6b3a', BRN = '#7a3b1e', WARN = '#b3262c', INK2 = '#3c4a57', IOLC = '#7a6a1e', OLDC = '#7a6a1e';
const f1 = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
const note = (s, op = 1, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op = 1, col = COL.accent, y = 30, x = PW / 2) => htext(x, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const lw = (zh, en, o = {}) => measure(zh, o.size || 15, o.bold) + (en ? 6 + measure(en, o.size || 15, false) : 0);
// a label whose leader starts dx, dy px from its anchor (text left of that point when dx < 0, right of it otherwise)
const labNear = (zh, en, a, dx, dy, o = {}) => { const w = lw(zh, en, o), x = a[0] + dx, y = a[1] + dy + (o.size || 15) * 0.36;
  return dx < 0 ? lab(zh, en, x - w - 7, y, a, o) : lab(zh, en, x + w + 7, y, a, { ...o, side: 'R' }); };
const box = (y, s, op, col = COL.accent, h = 36, size = 16, W = PW, x = 10) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${W - 2 * x}" height="${h}" rx="8" fill="#fff" stroke="${col}" stroke-width="1.6"/>${text(W / 2, y + h / 2 + size * 0.36, s, { size, bold: true, color: col, anchor: 'middle' })}</g>`;
const rbox = (x, y, w, h, title, rows, op, col = COL.accent, ts = 18, rs = 16, rh = 28) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f7f9fa" stroke="${col}" stroke-width="1.5"/>${text(x + 16, y + 30, title, { size: ts, bold: true, color: col })}` +
  rows.map((r, i) => text(x + 16, y + 62 + i * rh, r[0], { size: rs, bold: r[1], color: r[2] || COL.ink })).join('') + `</g>`;
const arrowPath = (pts, col, w = 2.2, op = 1) => { if (pts.length < 2) return ''; const a = pts[pts.length - 2], b = pts[pts.length - 1], d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1, u = [d[0] / l, d[1] / l], n = [-u[1], u[0]], h = 9;
  const dd = 'M' + pts.map(f1).join('L');
  return `<g opacity="${op}"><path d="${dd}" fill="none" stroke="#fff" stroke-width="${w + 3}" opacity="0.8"/><path d="${dd}" fill="none" stroke="${col}" stroke-width="${w}"/><path d="M${f1(b)}L${f1([b[0] - u[0] * h + n[0] * h * 0.55, b[1] - u[1] * h + n[1] * h * 0.55])}L${f1([b[0] - u[0] * h - n[0] * h * 0.55, b[1] - u[1] * h - n[1] * h * 0.55])}Z" fill="${col}"/></g>`; };
const sbar = (v, n = 1, op = 1) => VIEWS.sbar(v.k, op, n);

// ---------------------------------------------------------------- panel titles (window.PRELOAD_EXTRA: top-level strings are not in the font preload)
const SEC_T = { title: '機轉切面：經 2 點與 8 點（模型）', orient: '右＝2 點　上＝前' };
const ZOOM_T = { title: '機轉切面：2 點放大（模型）', orient: '往右下＝往後　上＝前' };
const SCOPE_T = { title: '術者視角　右眼 OD（模型）', orient: '下＝12 點　右＝9 點 temporal' };
const CASE_T = { title: '本例病程（相對時間）', orient: '右眼 OD' };
const TXT_T = t => ({ title: t, orient: '' });
window.PRELOAD_EXTRA = JSON.stringify([SEC_T, ZOOM_T, SCOPE_T, CASE_T]) + '畫面製作中示意模型推論引述0123456789.–→°';

// ---------------------------------------------------------------- views (the same 3D eye; v.Q maps a 3D point into panel px)
const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
function sec(st, win, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = X.section({ st, h: HP, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 330).toFixed(4) });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scope(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), r = X.enface({ st, id, surgeon: 12 });
  return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
const M12 = G.enfaceMap(12);
const swin = (p3, w, H = PH, W = PW) => { const q = M12(p3); return { x: q[0] - w / 2, y: q[1] - w * H / W / 2, w }; };   // scope window centred on a 3D point
const S = x => ({ sfix: x });
const sAt = (mm, from = 'psl') => X.sAbs(mm, from);
const surf = (mm, from = 'psl', h = HP) => G.P3(h, sAt(mm, from), 0);        // outer surface point at clock h, mm behind the PSL (or the visible limbus)
// record the 3D points a segment draws in each view (check.js: the same fixation point / needle in both views)
window.SYNC = {};
const sync = (id, view, name, p3) => { const s = window.SYNC[id] || (window.SYNC[id] = { sec: {}, scope: {} }); s[view][name] = p3.map(v => +v.toFixed(5)); };

// ruler ticks on the outer surface: short marks along the outward normal, numbered in mm (purple from the PSL, blue from the visible limbus)
function ticksSec(v, list, from = 'psl', o = {}) {
  const len = o.len || 0.22, col = from === 'vis' ? BLU : PUR;
  return X.ticks(HP, list, from).map(t => { const a = v.Q(t.p), b = v.Q(G.add(t.p, t.n, len)), q = v.Q(G.add(t.p, t.n, len + (o.gap || 0.17)));
    return `<g opacity="${o.op ?? 1}"><path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="5"/><path d="M${f1(a)}L${f1(b)}" stroke="${col}" stroke-width="2.6"/>` +
      ((o.quiet || []).includes(t.mm) ? '' : htext(q[0] + (o.dx || 0), q[1] + 5, String(t.mm), { size: 15, bold: true, color: col, anchor: 'middle' })) + `</g>`; }).join('');
}
// a short mark across the meridian on the microscope view at clock h, s (half = half length, mm)
function tickScope(v, h, s, col, half = 0.35, w = 2.6, op = 1) {
  const rho = G.surfAt(s).rho, dh = half / (rho * Math.PI / 6), a = v.Q(G.P3(h - dh, s, 0)), b = v.Q(G.P3(h + dh, s, 0));
  return `<g opacity="${op}"><path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="${w + 3}"/><path d="M${f1(a)}L${f1(b)}" stroke="${col}" stroke-width="${w}"/></g>`;
}
const dot = (q, col, r = 5.5, op = 1) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.6" opacity="${op}"/>`;
// a ring on the microscope view: every clock hour at surface distance s (mm from the visible limbus)
function ringScope(v, s, col, o = {}) { const pts = []; for (let k = 0; k <= 180; k++) pts.push(v.Q(G.P3(12 * k / 180, s, 0)));
  return `<path d="M${pts.map(f1).join('L')}Z" fill="none" stroke="#fff" stroke-width="${(o.w || 2.2) + 2.5}" opacity="${0.7 * (o.op ?? 1)}"/><path d="M${pts.map(f1).join('L')}Z" fill="none" stroke="${col}" stroke-width="${o.w || 2.2}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity="${o.op ?? 1}"/>`; }
// needles drawn thin over the section (the model draws the straight needle at its true 0.15 mm, which hides the anatomy at this magnification):
// the same geometry as the model (X.passes: entry in the flap bed, the demonstrated angle X.DIVE, toward the dock), only the stroke is thinner (示意)
function needleThin(v, st, col, frac = 0.14, op = 1) {
  const PS = X.passes(X.norm(st)), tip = G.add(PS.E2, G.sub(PS.D, PS.E2), frac), back = G.add(tip, G.unit(G.sub(PS.E2, PS.D)), 7), a = v.Q(tip), b = v.Q(back);
  return { svg: `<g opacity="${op}"><path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="6.5" stroke-linecap="round"/><path d="M${f1(a)}L${f1(b)}" stroke="${col}" stroke-width="3.6" stroke-linecap="round"/></g>`,
    tip: a, I: v.Q(PS.I2), S: v.Q(PS.t2.E3), out: v.Q(G.add(PS.t2.E3, G.unit(G.sub(PS.E2, PS.D)), 0.9)), PS, cls: PS.t2.cls };
}
// a test needle perpendicular to the sclera (Duffey's mapping; X.track 'perp'), thin, with a dot where it leaves the uvea coloured by what it reached
function pinThin(v, mm, from = 'psl', op = 1) {
  const t = X.track(HP, sAt(mm, from), 'perp'), a = v.Q(t.to3(t.at(-0.45))), b = v.Q(t.I3), col = X.CLS_COL[t.cls] || INK2;
  return { svg: `<g opacity="${op}"><path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><path d="M${f1(a)}L${f1(b)}" stroke="#4b5563" stroke-width="2.6" stroke-linecap="round"/>${dot(b, col, 6)}</g>`,
    exit: b, E: v.Q(t.E3), cls: t.cls, t };
}
const labL = (zh, en, y, a, o = {}) => lab(zh, en, 14, y, a, o);
const labR = (zh, en, y, a, o = {}, W = PW) => lab(zh, en, W - 12, y, a, { ...o, side: 'R' });
const boxAt = (x, y, w, h, s, op, col = COL.accent, size = 16) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" stroke="${col}" stroke-width="1.6"/>${text(x + w / 2, y + h / 2 + size * 0.36, s, { size, bold: true, color: col, anchor: 'middle' })}</g>`;
const tlines = (x, y, rows, o = {}) => rows.map((r, i) => htext(x, y + i * (o.lh || 21), r, { size: o.size || 15, bold: i === 0, color: o.color || INK2, op: o.op ?? 1 })).join('');
// orientation tag of the microscope view (one line; the panel header gives 下＝12 點、右＝9 點 temporal)
const orientTag = (op = 1) => `<g opacity="${op}"><rect x="10" y="8" width="${(measure(`${OR.eyeZh}　術者坐 ${OR.bottom} 點`, 15, true) + 22).toFixed(0)}" height="32" rx="6" fill="#1d2733" opacity="0.85"/>` + text(21, 30, `${OR.eyeZh}　術者坐 ${OR.bottom} 點`, { size: 15, bold: true, color: '#fff' }) + `</g>`;
// clock numerals around the microscope view at surface distance s
const clockNums = (v, hours, s, o = {}) => hours.map(h => { const q = v.Q(G.P3(h, s, 0)); return htext(q[0], q[1] + 6, String(h), { size: o.size || 16, bold: true, color: (o.col && o.col[h]) || INK2, anchor: 'middle', op: o.op ?? 1 }); }).join('');

// ---------------------------------------------------------------- states (st.sfix; OD, surgeon at 12; fixation at 2 and 8 o'clock, 180° apart)
const FIX = S({ vit: 1, peri: 1, flap: { open: 0 }, ndl: {}, iol: {}, knot: 1 });          // IOL sutured in the sulcus, knots under the closed flaps
const ASYM = S({ vit: 1, peri: 1, flap: { open: 0 }, ndl: { s8: 2 }, iol: {}, knot: 1 });   // 8 o'clock entry at 2 mm with the same needle angle → tilt (示意)
const OLD = S({ vit: 1, old: {} });                                                         // the dislocated old IOL (type unknown; 示意)
const VITR = S({ vit: 0.55, old: {}, trocar: 1 });                                          // vitrectomy in progress (core first; 示意), old IOL still in
const BARE = S({ vit: 1, peri: 1 });                                                        // conjunctiva opened at 2 and 8: bare sclera
const MARKS = S({ vit: 1, peri: 1, marks: 1 });                                             // toric-marker dots on the limbus + caliper dots 1 mm behind the PSL
const PINS = list => S({ vit: 1, peri: 1, pins: list });                                    // perpendicular test needles (the Duffey mapping)
const PASS = (mm, from, o = {}) => S({ vit: 1, peri: 1, pins: o.pins || [], ndl: { s2: mm, s8: mm, from, pass: o.pass ?? 0.14, g27: 0, out: 0 } });   // the oblique demo needle entering at 2 o'clock

// windows (mm): the 2 o'clock site magnified, the layers from the limbus to the ora, the 2–8 overview; microscope: whole eye, wide (trocars), clock face
const W_Z = { x: 4.6, y: -11.2, w: 5.0 }, W_Z1 = { x: 4.9, y: -11.75, w: 5.0 }, W_Z2 = { x: 4.6, y: -10.9, w: 5.0 }, W_ZONE = { x: 3.2, y: -11.28, w: 8.8 };
const W_ALL = { x: -8.6, y: -13.3, w: 17.2 }, W_VIT = { x: -9.8, y: -13.4, w: 19.6 }, W_IOL = { x: -8.6, y: -12.9, w: 17.2 };
const SC_ALL = { x: -10.5, y: -7.1, w: 21 }, SC_WIDE = { x: -14.2, y: -9.6, w: 28.4 }, SC_CLOCK = { x: -12, y: -8.12, w: 24 };
const SC_2 = (() => { const q = M12(G.P3(HP, 0.9, 0)); return { x: q[0] * 0.86 - 4, y: q[1] * 0.86 - 4 * PH / PW, w: 8 }; })();   // the 2 o'clock site, medium magnification

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const v = sec(FIX, W_ALL), A = v.A;
  let rx = labR('睫狀溝 sulcus', '', 300, A.tie2, { bold: true, color: GRN, lc: GRN, op: T.on(1, 0.5) });
  rx += labL('縫線 10-0 Prolene', '', 60, A.E8, { bold: true, color: INK2, op: T.on(1, 0.5, 1.0) });
  rx += labR('線結埋在瓣下', '', 60, A.knot2, { bold: true, color: '#111827', lc: '#111827', op: T.on(1, 0.5, 2.0) });
  rx += labL('MA60AC', '', 300, A.iolC, { color: IOLC, lc: IOLC });
  rx += sbar(v, 2) + note('模型示意', 1);
  return { R: { svg: v.svg, extra: rx, P: { title: '縫好的 IOL（模型）', orient: '經 2 點與 8 點　右＝2 點　上＝前' } } };
};

// ---------------------------------------------------------------- 1 為什麼這樣做
DRAW2['1-1'] = T => {
  // left: the case course as three cards (relative time only; no dates, acuity or pressure)
  let o = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  o += rbox(16, 14, PW - 32, 104, '之前', [['IOL 往下脫位', true], ['→ 玻璃體切除＋原 IOL 縫回 12 點和 6 點']], T.on(0));
  o += arrowPath([[PW / 2, 124], [PW / 2, 146]], INK2, 2.2, T.on(1));
  o += rbox(16, 150, PW - 32, 76, '約一週後', [['又半脫位', true, WARN]], T.on(1), WARN);
  o += arrowPath([[PW / 2, 232], [PW / 2, 254]], INK2, 2.2, T.on(1, 0.6, 1.2));
  o += rbox(16, 258, PW - 32, 104, '這次（主治的範本）', [['23G TPPV → 取出舊 IOL', true], ['→ MA60AC 縫在鞏膜（鞏膜瓣、10-0 Prolene）']], T.on(1, 0.6, 1.2), '#2463eb');
  o += htext(PW / 2, PH - 16, '早期再脫位的原因：查不到專文，影片不推測', { size: 15, bold: true, color: COL.sub, anchor: 'middle', op: T.on(2) });
  // right: the dislocated old IOL in the microscope view (示意: type and pose unknown); 6 o'clock is at the top
  const v = scope(OLD, SC_ALL, 'sR');
  const svg = v.svg + clockNums(v, [12, 3, 6, 9], 1.0);
  let rx = orientTag() + labR('舊 IOL 往下脫位', '示意', 60, v.A.old, { bold: true, color: OLDC, lc: OLDC });
  rx += note('6 點在上方（術者坐 12 點）', 1);
  return { L: { svg: o, extra: '', P: CASE_T }, R: { svg, extra: rx, P: SCOPE_T } };
};
DRAW2['1-2'] = T => {
  const cw = 284, cy = 18, ch = 150, xs = [16, 16 + (cw + 18), 16 + 2 * (cw + 18), 16 + 3 * (cw + 18)];
  const hl = T.on(2), card = (i, title, rows, op, col) => rbox(xs[i], cy, cw, ch, title, rows, op, col, 18, 15.5, 27);
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  o += card(0, '放在前房', [['前房 IOL（ACIOL）'], ['虹膜完整時可放'], ['（回顧）', false, COL.sub]], T.on(0) * (1 - 0.55 * hl), INK2);
  o += card(1, '固定在虹膜', [['縫或夾在虹膜上'], ['虹膜完整時可放'], ['（回顧）', false, COL.sub]], T.on(0) * (1 - 0.55 * hl), INK2);
  o += card(2, '鞏膜固定：縫線', [['縫線綁 haptic', true], ['拉到鞏膜固定'], ['本台的做法', true, COL.accent]], T.on(0), COL.accent);
  o += card(3, '鞏膜固定：不用縫線', [['haptic 埋進鞏膜'], ['例如 Yamane 法'], ['（Yamane 2017）', false, COL.sub]], T.on(1), COL.accent);
  o += `<g opacity="${hl.toFixed(2)}"><rect x="${xs[2] - 7}" y="${cy - 8}" width="${2 * cw + 32}" height="${ch + 16}" rx="12" fill="none" stroke="${WARN}" stroke-width="2.4" stroke-dasharray="7 4"/></g>`;
  o += boxAt(xs[2] - 7, cy + ch + 22, 2 * cw + 32, 40, '沒有囊袋、也沒有虹膜支撐 → 只剩鞏膜固定', hl, WARN, 17);
  o += boxAt(16, PH - 70, FW - 32, 46, 'AAO 評估（Wagoner 2003；Shen 2020）：沒有一種方法證明較好', T.on(3), INK2, 18);
  return { F: { svg: o, extra: '', P: TXT_T('沒有囊袋支撐時：三類 IOL') } };
};
DRAW2['1-3'] = T => {
  const v = sec(FIX, W_IOL), A = v.A;
  let ex = '';
  if (A.optEdgeL && A.optEdgeR) { ex += `<g opacity="${T.on(0)}">${VIEWS.dim([A.optEdgeL[0], A.optEdgeL[1] + 30], [A.optEdgeR[0], A.optEdgeR[1] + 30], IOLC)}</g>`;
    ex += htext((A.optEdgeL[0] + A.optEdgeR[0]) / 2, Math.max(A.optEdgeL[1], A.optEdgeR[1]) + 56, 'optic 6 mm', { size: 16, bold: true, color: IOLC, anchor: 'middle', op: T.on(0) }); }
  ex += labR('睫狀溝 sulcus', '', 300, A.tie2, { bold: true, color: GRN, lc: GRN, op: T.on(1) });
  ex += labR('縫線拉到鞏膜', '', 46, A.E2, { color: INK2, op: T.on(1) });
  ex += labL('虹膜 iris', '', 46, A.pmL, { color: '#4a2b19', lc: '#4a2b19' });
  ex += sbar(v, 2) + note('模型示意', 1);
  const w = scope(FIX, SC_ALL, 'sR');
  let rx = orientTag();
  rx += labR('optic 置中', '', 40, w.A.iolC, { bold: true, color: IOLC, lc: IOLC, op: T.on(0) });
  rx += labR('haptic（虹膜後，虛線）', '', 96, w.A.hapTip1, { color: '#2f5f93', lc: '#2f5f93', op: T.on(0) });
  if (w.A.tie2) rx += labL('2 點綁線處', '', 350, w.A.tie2, { color: GRN, lc: GRN, op: T.on(1) });
  rx += note('總長 13 mm（出廠）', T.on(0));
  return { L: { svg: v.svg, extra: ex, P: SEC_T }, R: { svg: w.svg, extra: rx, P: SCOPE_T } };
};
DRAW2['1-4'] = T => {
  const v = sec(VITR, W_VIT), A = v.A;
  let ex = labR('殘留玻璃體', '示意', 340, v.P([6.6, -4.2]), { color: '#4f6478', lc: '#4f6478' });
  if (A.old) ex += labR('舊 IOL', '示意', 270, A.old, { color: OLDC, lc: OLDC });
  ex += labL('pars plana', '', 300, A.planaL, { bold: true, color: INK2, op: T.on(0) });
  ex += sbar(v, 2) + note('玻璃體切除的進度：示意', 1);
  const w = scope(VITR, SC_WIDE, 'sR');
  let rx = orientTag();
  rx += labR('灌流 infusion', '', 44, w.A.trocar7, { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  rx += labR('23G trocar', '', 300, w.A.trocar10, { color: INK2, op: T.on(0) });
  rx += labL('23G trocar', '', 330, w.A.trocar1, { color: INK2, op: T.on(0) });
  rx += note('trocar 鐘點：示意', 1);
  return { L: { svg: v.svg, extra: ex, P: SEC_T }, R: { svg: w.svg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 2 從外面找到睫狀溝
DRAW2['2-1'] = T => {
  const v = sec(BARE, W_Z1), vis = v.Q(surf(0, 'vis')), psl = v.Q(surf(0)), n = G.N3(HP, SN.psl / 2);
  let svg = v.svg + ticksSec(v, [0], 'vis', { op: T.on(0) }) + ticksSec(v, [0], 'psl', { op: T.on(1) });
  { const a = v.Q(G.add(surf(0, 'vis'), n, 0.62)), b = v.Q(G.add(surf(0), n, 0.62)); svg += `<g opacity="${T.on(2)}">${VIEWS.dim(a, b, PUR)}</g>`; }
  let ex = labR('透明角膜邊緣', 'visible limbus', 200, vis, { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  ex += labR('角膜緣後界', 'PSL', 256, psl, { bold: true, color: PUR, lc: PUR, op: T.on(1) });
  ex += labL('灰藍帶', 'limbal band', 232, v.Q(surf(-SN.psl / 2)), { color: INK2, op: T.on(0) });
  { const m = v.Q(G.add(surf(-SN.psl / 2), n, 0.95)); ex += htext(m[0] + 6, m[1] - 4, '0.85 mm（模型示意）', { size: 15, bold: true, color: PUR, op: T.on(2) }); }
  ex += sbar(v, 1);
  const w = scope(BARE, SC_2, 'sR');
  const rsvg = w.svg + tickScope(w, HP, 0, BLU, 0.5, 3, T.on(0)) + tickScope(w, HP, SN.psl, PUR, 0.5, 3, T.on(1));
  let rx = orientTag();
  rx += labL('透明角膜邊緣（實線）', '', 250, w.Q(G.P3(HP + 0.22, 0, 0)), { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  rx += labL('角膜緣後界（虛線）', '', 300, w.Q(G.P3(HP + 0.02, SN.psl, 0)), { bold: true, color: PUR, lc: PUR, op: T.on(1) });
  rx += labL('灰藍帶', '', 200, w.Q(G.P3(HP + 0.42, SN.psl / 2, 0)), { color: INK2, op: T.on(0) });
  rx += boxAt(PW - 300, 10, 290, 36, '量尺的零點抵在哪一條線？', T.on(4), WARN, 16);
  rx += VIEWS.sbar(w.k, 1, 1);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-2'] = T => {
  const v = sec(BARE, W_ZONE), A = v.A;
  const svg = v.svg + ticksSec(v, [0, 2.41], 'psl', { op: T.on(1) });
  let ex = labR('角膜緣後界', 'PSL', 40, A.psl, { bold: true, color: PUR, lc: PUR });
  ex += labL('虹膜根', 'iris root', 180, A.root, { color: '#4a2b19', lc: '#4a2b19', op: T.on(0, 0.5) });
  ex += labL('睫狀溝', 'sulcus', 230, A.apex, { bold: true, color: GRN, lc: GRN, op: T.on(0, 0.5, 0.8) });
  ex += labL('pars plicata 睫狀突', '', 280, A.procMid, { bold: true, color: BRN, lc: BRN, op: T.on(0, 0.5, 1.6) });
  ex += labR('pars plana', '', 250, A.plana, { bold: true, color: INK2, op: T.on(0, 0.5, 2.4) });
  ex += labL('ora serrata', '視網膜前緣', 330, A.ora, { color: INK2, op: T.on(0, 0.5, 3.2) });
  ex += sbar(v, 1);
  // right: where each layer lies on the surface (the same s along every meridian): rings on the microscope view
  const w = scope(BARE, SC_WIDE, 'sR');
  const rsvg = w.svg + ringScope(w, X.SUL, GRN, { op: T.on(0, 0.5, 0.8) }) + ringScope(w, X.PE, BRN, { op: T.on(1) }) + ringScope(w, X.ORA, INK2, { dash: '6 4', op: T.on(0, 0.5, 3.2) });
  let rx = orientTag();
  rx += labL('角膜緣後界', '', 60, w.Q(G.P3(4.3, SN.psl, 0)), { color: PUR, lc: PUR });
  rx += labL('睫狀溝', '', 100, w.Q(G.P3(4.0, X.SUL, 0)), { bold: true, color: GRN, lc: GRN, op: T.on(0, 0.5, 0.8) });
  rx += labL('pars plicata 終點', '', 140, w.Q(G.P3(3.7, X.PE, 0)), { bold: true, color: BRN, lc: BRN, op: T.on(1) });
  rx += labL('ora serrata', '', 180, w.Q(G.P3(3.4, X.ORA, 0)), { color: INK2, op: T.on(0, 0.5, 3.2) });
  rx += note('圈＝裡面構造在表面上的位置（模型）', T.on(2));
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-3'] = T => {
  const k1 = T.on(1), k2 = T.on(2), k3 = T.on(3), mmS = X.SUL - SN.psl, v = sec(BARE, W_Z);
  const p0 = pinThin(v, mmS, 'psl', k1), p1 = pinThin(v, 1, 'psl', k2), p2 = pinThin(v, 2, 'psl', k2), nd = needleThin(v, PASS(1, 'psl'), INK2, 0.16, k3);
  const svg = v.svg + p0.svg + p1.svg + p2.svg + nd.svg + ticksSec(v, [0, 1, 2], 'psl');
  let ex = tlines(14, 30, ['Duffey 1989（屍眼）', '垂直經線 0.83 mm、水平經線 0.46 mm'], { op: T.on(0) });
  ex += labL('0.58 mm：睫狀溝（示意）', '', 240, p0.exit, { bold: true, color: GRN, lc: GRN, op: k1 });
  ex += labL('1 mm：溝後緣、睫狀突前緣', '', 290, p1.exit, { bold: true, color: BRN, lc: BRN, op: k2 });
  ex += labL('2 mm：睫狀突上', '', 340, p2.exit, { bold: true, color: BRN, lc: BRN, op: k2 });
  ex += labR('真正的針：斜的', '角度示意', 300, nd.out, { bold: true, color: INK2, op: k3 });
  ex += sbar(v, 1);
  for (const [nm, mm] of [['0.58', mmS], ['1', 1], ['2', 2]]) { sync('2-3', 'sec', nm, X.track(HP, sAt(mm), 'perp').E3); sync('2-3', 'scope', nm, surf(mm)); }
  // right: the same three entry points on the microscope view, coloured by where the perpendicular needle lands
  const w = scope(k3 > 0.5 ? PASS(1, 'psl', { pass: 0.16 }) : BARE, SC_2, 'sR');
  const q0 = w.Q(surf(mmS)), q1 = w.Q(surf(1)), q2 = w.Q(surf(2));
  const rsvg = w.svg + tickScope(w, HP, SN.psl, PUR, 0.5) + dot(q0, X.CLS_COL[p0.cls], 6, k1) + dot(q1, X.CLS_COL[p1.cls], 6, k2) + dot(q2, X.CLS_COL[p2.cls], 6, k2);
  let rx = orientTag();
  rx += labL('後界（零點）', '', 200, w.Q(G.P3(HP + 0.4, SN.psl, 0)), { color: PUR, lc: PUR });
  rx += labL('0.58 mm（示意）', '', 250, q0, { bold: true, color: GRN, lc: GRN, op: k1 });
  rx += labL('1 mm', '', 290, q1, { bold: true, color: BRN, lc: BRN, op: k2 });
  rx += labL('2 mm', '', 330, q2, { bold: true, color: BRN, lc: BRN, op: k2 });
  rx += VIEWS.sbar(w.k, 1, 1);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-4'] = T => {
  const k1 = T.on(1), k2 = T.on(2), v = sec(BARE, W_Z);
  const good = needleThin(v, PASS(1, 'psl'), GRN, 0.14), bad = needleThin(v, PASS(1, 'vis'), WARN, 0.14, k1), pv = pinThin(v, 1, 'vis', k2);
  const svg = v.svg + good.svg + bad.svg + pv.svg + ticksSec(v, [0, 1], 'psl') + ticksSec(v, [0, 1], 'vis');
  let ex = labR('從透明角膜邊緣量 1 mm', '', 40, v.Q(surf(1, 'vis')), { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  ex += labR('從後界量 1 mm', '', 110, v.Q(surf(1)), { bold: true, color: PUR, lc: PUR });
  ex += labL('→ 隅角、虹膜前', '', 140, bad.I, { bold: true, color: WARN, lc: WARN, op: k1 });
  ex += labL('垂直：打到虹膜根', '', 250, pv.exit, { bold: true, color: WARN, lc: WARN, op: k2 });
  ex += labL('→ 睫狀溝、虹膜後', '', 310, good.I, { bold: true, color: GRN, lc: GRN });
  ex += sbar(v, 1) + note('同一個角度（模型示範）', 1);
  sync('2-4', 'sec', 'psl1', good.PS.t2.E3); sync('2-4', 'sec', 'vis1', bad.PS.t2.E3);
  const w = scope(BARE, SC_2, 'sR'), pg = surf(1), pb = surf(1, 'vis'), qg = w.Q(pg), qb = w.Q(pb);
  sync('2-4', 'scope', 'psl1', pg); sync('2-4', 'scope', 'vis1', pb);
  const rsvg = w.svg + tickScope(w, HP, SN.psl, PUR, 0.5) + tickScope(w, HP, 0, BLU, 0.5, 3, T.on(0)) + dot(qg, PUR, 6) + dot(qb, BLU, 6, T.on(0));
  let rx = orientTag();
  rx += labL('從透明角膜邊緣 1 mm', '', 230, qb, { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  rx += labL('從後界 1 mm', '', 290, qg, { bold: true, color: PUR, lc: PUR });
  rx += VIEWS.sbar(w.k, 1, 1);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-5'] = T => {
  const v = sec(BARE, W_Z2), n1 = needleThin(v, PASS(1, 'psl'), GRN, 0.14), n2 = needleThin(v, PASS(2, 'psl'), BRN, 0.16, T.on(2));
  const svg = v.svg + n1.svg + n2.svg + ticksSec(v, [0, 1, 2], 'psl');
  let ex = tlines(14, 30, ['太前（Kokame 2018）：', 'haptic 磨虹膜、optic 卡到虹膜前'], { op: T.on(1), color: WARN });
  ex += labL('1 mm：經睫狀溝到虹膜後', '', 236, n1.I, { bold: true, color: GRN, lc: GRN });
  { const t2 = n2.PS.t2, q = v.Q(t2.to3(t2.at(t2.tI * 0.7))); ex += labL('2 mm：穿過睫狀突', '出血', 320, q, { bold: true, color: BRN, lc: BRN, op: T.on(2) }); }
  ex += sbar(v, 1) + note('同一個角度（模型示範）', 1);
  sync('2-5', 'sec', 'mm1', n1.PS.t2.E3); sync('2-5', 'sec', 'mm2', n2.PS.t2.E3);
  const w = scope(BARE, SC_2, 'sR'), p1 = surf(1), p2 = surf(2), q1 = w.Q(p1), q2 = w.Q(p2);
  sync('2-5', 'scope', 'mm1', p1); sync('2-5', 'scope', 'mm2', p2);
  const rsvg = w.svg + tickScope(w, HP, SN.psl, PUR, 0.5) + dot(q1, GRN, 6) + dot(q2, BRN, 6, T.on(1, 0.6));
  let rx = orientTag();
  rx += labL('1 mm', '最接近本台的論文', 180, q1, { bold: true, color: GRN, lc: GRN });
  rx += labL('2 mm', 'Kokame 2018', 236, q2, { bold: true, color: BRN, lc: BRN, op: T.on(1, 0.6) });
  rx += boxAt(PW - 300, 10, 290, 36, '本台下針幾 mm：以主治為準', T.on(3), WARN, 16);
  rx += VIEWS.sbar(w.k, 1, 1);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-6'] = T => {
  // left: where a haptic can end up (zones of the same model, 2 o'clock magnified); right: the share really in the sulcus in UBM studies
  const mw = 470, mh = PH - 28, v = sec(BARE, { x: 5.0, y: -10.5, w: 4.6 }, { W: mw, H: mh }), A = v.A, at = a => a ? [14 + a[0], 14 + a[1]] : null;
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/><svg x="14" y="14" width="${mw}" height="${mh}" viewBox="0 0 ${mw} ${mh}" overflow="hidden"><g>${v.svg}</g></svg><rect x="14" y="14" width="${mw}" height="${mh}" rx="6" fill="none" stroke="#d3dae1"/>`;
  let ex = lab('溝前', 'anterior', 28, 66, at(A.root), { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  ex += lab('睫狀溝', 'sulcus', 28, 186, at(A.apex), { bold: true, color: GRN, lc: GRN });
  ex += lab('睫狀突上', 'ciliary process', 28, 256, at(A.procMid), { bold: true, color: BRN, lc: BRN, op: T.on(1) });
  ex += lab('更後', 'pars plana', 28, 336, at(A.plana), { bold: true, color: INK2, op: T.on(1) });
  const X0 = 560, X1 = 1180, bx = p => X0 + (X1 - X0) * p / 100, rows = [['Marianelli 2019', 15, 0], ['Alp 2009 對照組', 24, 2], ['Zhao 2025', 57.69, 0], ['Alp 2009 眼內照光', 64, 2]];
  o += text(X0, 40, 'haptic 真的在睫狀溝的比例（UBM）', { size: 19, bold: true, color: COL.accent });
  o += `<rect x="${bx(15).toFixed(1)}" y="56" width="${(bx(64) - bx(15)).toFixed(1)}" height="${rows.length * 56 + 6}" fill="rgba(14,124,107,0.08)" opacity="${T.on(0)}"/>`;
  rows.forEach(([who, p, ln], i) => { const y = 66 + i * 56, op = ln ? T.on(2, 0.6, (i - 1) * 0.5) : T.on(0, 0.6, 0.4 * i);
    o += `<g opacity="${op.toFixed(2)}"><rect x="${X0}" y="${y}" width="${(bx(p) - X0).toFixed(1)}" height="22" rx="4" fill="${ln ? '#2463eb' : COL.accent}"/>` + text(X0, y + 42, who, { size: 15, color: COL.sub }) + text(bx(p) + 8, y + 17, `${p}%`, { size: 16, bold: true }) + `</g>`; });
  o += boxAt(X0 - 10, PH - 118, X1 - X0 + 40, 40, '其餘：溝前、睫狀突上或更後（分類、樣本不同）', T.on(1), INK2, 16);
  o += boxAt(X0 - 10, PH - 66, X1 - X0 + 40, 44, '從外面下針是盲做：眼內照光 64% vs 對照 24%（隨機分組）', T.on(2), '#2463eb', 17);
  return { F: { svg: o, extra: ex, P: TXT_T('haptic 真的在睫狀溝嗎（UBM 研究）') } };
};
DRAW2['2-7'] = T => {
  const tilt = T.on(3), v = sec(tilt > 0.5 ? ASYM : FIX, W_IOL), A = v.A;
  let ex = labR('2 點 superonasal', '', 330, A.psl, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
  ex += labL('8 點 inferotemporal', '', 330, A.pslL, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
  ex += tag('正對面拉：相隔 180°', T.on(2) * (1 - tilt), COL.accent, 30);
  if (tilt > 0.5) { ex += tag('不對稱 → 傾斜（示意）', tilt, WARN, 30); if (A.tie8) ex += labL('8 點較後', '', 270, A.tie8, { bold: true, color: WARN, lc: WARN }); }
  ex += sbar(v, 2) + note('模型示意', 1);
  // right: the clock face of OD with the surgeon at 12; 3 and 9 avoided; 2 and 8 marked, 180° apart
  const w = scope(MARKS, SC_CLOCK, 'sR'), cen = w.Q([0, 0, 0]);
  let rsvg = w.svg + clockNums(w, [12, 3, 6, 9], 2.2);
  for (const h of [3, 9]) { const pts = []; for (let k = 0; k <= 12; k++) pts.push(w.Q(G.P3(h - 0.35 + 0.7 * k / 12, 1.0, 0)));
    rsvg += `<path d="M${pts.map(f1).join('L')}" fill="none" stroke="${WARN}" stroke-width="8" stroke-linecap="round" opacity="${(0.75 * T.on(0)).toFixed(2)}"/>`; }
  { const a = w.A.mark2, b = w.A.mark8; if (a && b) rsvg += `<path d="M${f1(a)}L${f1(b)}" stroke="${PUR}" stroke-width="2.2" stroke-dasharray="7 5" opacity="${T.on(2)}"/>`; }
  let rx = orientTag();
  rx += labR('避開 3、9 點', '長睫狀動脈／神經', 60, w.Q(G.P3(9, 1.0, 0)), { bold: true, color: WARN, lc: WARN, op: T.on(0) });
  rx += labL('3 點', '', 120, w.Q(G.P3(3, 1.0, 0)), { bold: true, color: WARN, lc: WARN, op: T.on(0) });
  rx += labL('2 點 superonasal', '', 370, w.A.mark2, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
  rx += labR('8 點 inferotemporal', '', 160, w.A.mark8, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
  rx += htext(cen[0] + 12, cen[1] - 14, '180°', { size: 16, bold: true, color: PUR, op: T.on(2) });
  sync('2-7', 'scope', 'mark2', G.P3(2, 0.15, 0)); sync('2-7', 'scope', 'mark8', G.P3(8, 0.15, 0));
  return { L: { svg: v.svg, extra: ex, P: SEC_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
DRAW2['2-8'] = T => {
  // left: the caliper on the 2 o'clock site in the section: zero on the PSL, the other tip 1 mm behind it (示範)
  const v = sec(BARE, W_Z), k1 = T.on(1), tipA = surf(0), tipB = surf(1), up = (p, s, d) => v.Q(G.add(p, G.N3(HP, s), d));
  let svg = v.svg + ticksSec(v, [0, 1], 'psl');
  svg += `<g opacity="${k1.toFixed(2)}">` + [[tipA, SN.psl], [tipB, sAt(1)]].map(([p, s]) => `<path d="M${f1(v.Q(p))}L${f1(up(p, s, 0.95))}" stroke="#5e6973" stroke-width="5" stroke-linecap="round"/>`).join('') +
    `<path d="M${f1(up(tipA, SN.psl, 0.95))}L${f1(up(tipB, sAt(1), 0.95))}" stroke="#5e6973" stroke-width="5" stroke-linecap="round"/>${dot(v.Q(tipB), PUR, 6)}</g>`;
  let ex = labL('量尺零點：後界', '', 60, v.Q(tipA), { bold: true, color: PUR, lc: PUR, op: k1 });
  ex += labR('1 mm：marking pen 點', '', 250, v.Q(tipB), { bold: true, color: PUR, lc: PUR, op: k1 });
  ex += sbar(v, 1) + note('示範：零點抵後界（推論）', 1);
  sync('2-8', 'sec', 'zero', tipA); sync('2-8', 'sec', 'dot', tipB);
  const w = scope(MARKS, SC_ALL, 'sR');
  const rsvg = w.svg + (w.A.dot2 ? `<path d="M${f1(w.Q(tipA))}L${f1(w.Q(tipB))}" stroke="#5e6973" stroke-width="4" stroke-linecap="round" opacity="${k1.toFixed(2)}"/>` : '');
  let rx = orientTag();
  rx += labL('記號 2 點', 'toric marker', 300, w.A.mark2, { bold: true, color: PUR, lc: PUR, op: T.on(0) });
  rx += labR('記號 8 點', '', 60, w.A.mark8, { bold: true, color: PUR, lc: PUR, op: T.on(0) });
  rx += labL('1 mm 的點', 'marking pen', 360, w.A.dot2, { bold: true, color: PUR, lc: PUR, op: k1 });
  rx += note('量尺、marking pen 的用途：推測', T.on(2));
  sync('2-8', 'scope', 'zero', tipA); sync('2-8', 'scope', 'dot', tipB);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 3–9: placeholders (this round: the panel title and 「畫面製作中」, no numbers)
const PLACE = ['3-1', '3-2', '4-1', '5-1', '5-2', '5-3', '5-4', '6-1', '7-1', '8-1', '8-2', '8-3', '8-4', '9-1'];
const ph = (W, title) => ({ svg: `<rect width="${W}" height="${PH}" fill="#f7f9fa"/>` + text(W / 2, PH / 2 + 8, '畫面製作中', { size: 22, bold: true, color: COL.sub, anchor: 'middle' }), extra: '', P: { title, orient: '' } });
for (const id of PLACE) { const sg = SEGS.find(s => s.id === id);
  DRAW2[id] = sg.layout === 'full' ? (() => ({ F: ph(FW, sg.title) })) : (() => ({ L: ph(PW, sg.title), R: ph(PW, '') })); }
window.PLACEHOLDERS = PLACE;
