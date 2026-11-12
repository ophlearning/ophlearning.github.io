// ============================================================================
// Drawing of every segment of the video 鞏膜縫合固定 IOL＋23G TPPV (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full)
// / { R } (title): { svg (clipped to the panel), extra (labels, VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Both views are the same 3D globe (videos/models/globe/sfix.js; sources and the 示意 list: CARD.md 鞏膜縫合固定 IOL):
//   left  = 機轉切面: the meridional section through 2 and 8 o'clock (right = 2 o'clock, up = anterior), whole or magnified at the 2 o'clock site;
//   right = 術者視角: the microscope view, RIGHT eye OD, surgeon at 12 (下＝12 點、右＝9 點 temporal; 2 o'clock lower left, 8 o'clock upper right).
// "x mm" = behind the posterior surgical limbus (PSL, X.sAbs) unless drawn as measured from the clear-cornea edge (visible limbus). A point shown in
// both views is the same 3D point (window.SYNC records them per segment; check.js compares them).
// Chapters 3–5 (2026-11-12, second round) also use the 1–7 section through two trocars and the 12–6 section through the wound; needles, the 27G
// (insulin) needle and the suture drawn by draw.js over a section are thin strokes on the model's geometry (X.passes, X.sutureOf; the true
// thickness hides the anatomy; 示意). Chapters 6–9 (third round): the lens put in through the 12 o'clock wound along a 示意 path (lensAt; 2026-11-12 rewritten:
// through the wound only, the MA60AC's size kept, slack at its free size) and pulled into the model's fixed pose; the knot in the bed under the flap; error states of the same model (8-1, 8-2, 8-4;
// draw.js keeps a slipped haptic's knot on the suture); evidence cards on the right of 8-2 to 8-4; the follow-along list (9-1). No placeholder is left.
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
  const r = X.section({ st, h: o.h ?? HP, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 330).toFixed(4) });
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
  return X.ticks(o.h ?? HP, list, from).map(t => { const a = v.Q(t.p), b = v.Q(G.add(t.p, t.n, len)), q = v.Q(G.add(t.p, t.n, len + (o.gap || 0.17)));
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
// labels at the panel edge (left x 14, right W − 12); 2026-11-12 (出片前定稿): when the anchor is far across the panel, the label slides along its row
// toward the anchor so that the leader stays ≤ LEAD_MAX px (it keeps its row, so labels stacked on one side do not meet); o.fix keeps it at the edge
const LEAD_MAX = 112;
function slideX(zh, en, tx, ty, a, o, W) {
  if (!a || o.fix) return tx; const w = lw(zh, en, o), right = o.side === 'R', y1 = ty - (o.size || 15) * 0.36, dy = Math.abs(a[1] - y1), keep = Math.sqrt(Math.max(0, LEAD_MAX * LEAD_MAX - dy * dy));
  if (!right) { const dx = a[0] - (tx + w + 7); return dx > keep ? Math.min(tx + dx - Math.max(keep, 26), W - 12 - w) : tx; }
  const dx = (tx - w - 7) - a[0]; return dx > keep ? Math.max(tx - dx + Math.max(keep, 26), 14 + w) : tx;
}
const labL = (zh, en, y, a, o = {}, W = PW) => lab(zh, en, slideX(zh, en, 14, y, a, o, W), y, a, o);
const labR = (zh, en, y, a, o = {}, W = PW) => lab(zh, en, slideX(zh, en, W - 12, y, a, { ...o, side: 'R' }, W), y, a, { ...o, side: 'R' });
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
  let rx = labR('睫狀溝 sulcus', '', 220, A.tie2, { bold: true, color: GRN, lc: GRN, op: T.on(1, 0.5) });
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
  ex += labR('睫狀溝 sulcus', '', 200, A.tie2, { bold: true, color: GRN, lc: GRN, op: T.on(1) });
  ex += labR('縫線拉到鞏膜', '', 46, A.E2, { color: INK2, op: T.on(1) });
  ex += labL('虹膜 iris', '', 46, A.pmL, { color: '#4a2b19', lc: '#4a2b19' });
  ex += sbar(v, 2) + note('模型示意', 1);
  const w = scope(FIX, SC_ALL, 'sR');
  let rx = orientTag();
  rx += labR('optic 置中', '', 130, w.A.iolC, { bold: true, color: IOLC, lc: IOLC, op: T.on(0) });
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
  let ex = labR('透明角膜邊緣', 'visible limbus', 150, vis, { bold: true, color: BLU, lc: BLU, op: T.on(0) });
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
  ex += labR('真正的針：斜的', '角度示意', 200, nd.out, { bold: true, color: INK2, op: k3 });
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
  let ex = labL('從透明角膜邊緣量 1 mm', '', 70, v.Q(surf(1, 'vis')), { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  ex += labR('從後界量 1 mm', '', 260, v.Q(surf(1)), { bold: true, color: PUR, lc: PUR });
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
  ex += labL('更後', 'pars plana', 336, at(A.plana), { bold: true, color: INK2, op: T.on(1) });
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
  let ex = labL('2 點 superonasal', '', 212, A.psl, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
  ex += labR('8 點 inferotemporal', '', 212, A.pslL, { bold: true, color: PUR, lc: PUR, op: T.on(2) });
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
  rx += htext(PW - 12, 34, '避開 3、9 點：長睫狀動脈／神經', { size: 15, bold: true, color: WARN, anchor: 'end', op: T.on(0) }) + labR('9 點', '', 280, w.Q(G.P3(9, 1.0, 0)), { bold: true, color: WARN, lc: WARN, op: T.on(0) });
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

// ---------------------------------------------------------------- 3–5: helpers (2026-11-12, second round)
const qz = (x, n = 12) => Math.round(clamp01(x) * n) / n;                    // animation steps quantised: a section's tissue is reused between frames
const zOut = z => clamp01(1 - 3 * z), zIn = z => clamp01((z - 0.7) / 0.3);   // labels of a zoom: the old ones leave before the new ones come
const FR = SN.flap.frac, TH = X.H_TRI;
const SEC17_T = { title: '機轉切面：經 1 點與 7 點的 trocar（模型）', orient: '右＝1 點　上＝前' };
const SEC126_T = { title: '機轉切面：經 12 點與 6 點（模型）', orient: '右＝12 點　上＝前' };
const NDL_T = { title: '雙頭針：一條線、兩支針（推論）', orient: '形狀、長短：示意' };
const MAG_T = { title: '放大：haptic 的綁線處（模型＋示意）', orient: '方向同術者視角' };
window.PRELOAD_EXTRA += JSON.stringify([SEC17_T, SEC126_T, NDL_T, MAG_T]);
const PRE = o => S({ vit: 0, old: {}, marks: 1, ...o });                                   // chapter 3 before the vitrectomy: the old IOL still in (示意)
const AFTER = o => S({ vit: 1, peri: 1, marks: 1, flap: { open: 0 }, trocar: 1, ...o });  // after the vitrectomy (chapters 4–5)
const OPEN = o => AFTER({ inc: 1, flap: { open: 1 }, ...o });                              // chapter 5: wound made, both flaps lifted
const NDL = o => OPEN({ ndl: { s2: SN.guedes, s8: SN.guedes, pass: 0, g27: 0, out: 0, taut: 0, ...o } });   // the double-armed suture, 1 mm from the PSL
const PS0 = X.passes(X.norm(NDL({})));                                                    // entries in the beds, sulcus exits, the dock (2–8 plane)
const U8 = G.unit(G.sub(PS0.E8, PS0.D)), L27 = G.len(G.sub(PS0.D, PS0.E8)) + 9;            // the 27G needle: rigid, its docked pose is the model's
const LT = G.len(G.sub(PS0.D, PS0.E8)) + 14;                                               // the model's withdrawal path (dock → 8 o'clock bed → 14 mm out)
// a 3D polyline cut into runs by a test (fine steps of 0.1 mm); cb(run, flag)
function runs3(pts, test, cb) { const fine = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(G.len(G.sub(b, a)) / 0.1)); for (let k = i === 1 ? 0 : 1; k <= n; k++) fine.push(G.add(a, G.sub(b, a), k / n)); }
  let cur = [], st = null; for (const p of fine) { const s = test(p); if (st !== null && s !== st) { cur.push(p); cb(cur, st); cur = [p]; } else cur.push(p); st = s; } if (cur.length > 1) cb(cur, st); }
// the suture over a section: solid within 0.6 mm of the plane (as the model), dashed where it leaves it
function strandSec(v, pts, o = {}) { const pl = v.r.pl, nrm = [pl.U[1], -pl.U[0], 0], w = o.w || 2.2, col = o.col || C.pro; let out = '';
  runs3(pts, p => Math.abs(G.dot(G.sub(p, pl.O), nrm)) <= 0.6, (q, inP) => { const d = 'M' + q.map(p => f1(v.Q(p))).join('L');
    out += inP ? `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w + 3}" opacity="0.8" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`
      : `<path d="${d}" fill="none" stroke="${col}" stroke-width="${(w * 0.7).toFixed(1)}" stroke-dasharray="5 4" opacity="0.6"/>`; });
  return `<g opacity="${o.op ?? 1}">${out}</g>`; }
// a thin rod over a section (needles, cannulas, instruments; 示意 thickness)
function rodSec(v, a3, b3, col, w, op = 1) { const a = v.Q(a3), b = v.Q(b3);
  return `<g opacity="${op}"><path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="${w + 3}" stroke-linecap="round"/><path d="M${f1(a)}L${f1(b)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/></g>`; }
// what the microscope sees of a 3D point (the model's rule): outside the eye, through the clear cornea, in the chamber or inside the pupil
const seenScope = p => { const W = G.wallOf(p[2], Math.hypot(p[0], p[1])); if (W.d <= 0.02) return true; if (W.d < G.T(W.s)) return W.s < 0; const r = Math.hypot(p[0], p[1]); return r <= X.IR.pr - 0.02 || X.acTest(r, p[2]); };
// a 3D polyline on the microscope view, dashed where hidden (as the model's needles and suture)
function polyScope(v, pts, w, col, o = {}) { let out = '';
  runs3(pts, seenScope, (q, vis) => { const d = 'M' + q.map(p => f1(v.Q(p))).join('L');
    out += vis ? `<path d="${d}" fill="none" stroke="${o.halo || '#fff'}" stroke-width="${w + (o.hw ?? 2.4)}" opacity="${o.halo ? 1 : 0.75}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="${d}" fill="none" stroke="${col}" stroke-width="${Math.max(1, w * 0.7).toFixed(1)}" stroke-dasharray="4 3" opacity="0.55"/>`; });
  return `<g opacity="${o.op ?? 1}">${out}</g>`; }
// the first fraction k of a polyline (by length), for arrows drawn as they grow
function partial(pts, k) { const L = pts.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0); let left = L * clamp01(k); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); out.push(l <= left ? b : [a[0] + (b[0] - a[0]) * left / l, a[1] + (b[1] - a[1]) * left / l]); left -= l; } return out; }
const ring2 = (q, col, r = 7, op = 1) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}" fill="none" stroke="#fff" stroke-width="4.5" opacity="${op}"/><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r}" fill="none" stroke="${col}" stroke-width="2.2" opacity="${op}"/>`;
// the straight needle and the 27G needle of a NDL state, in 3D (the model's geometry; the 27G moves out rigidly while the needle is drawn out)
function needles(n) { const pass = n.pass ?? 0, g27 = n.g27 ?? 0, out = n.out ?? 0, R = {};
  if (out <= 0) { R.tip = G.add(PS0.E2, G.sub(PS0.D, PS0.E2), pass); R.back = G.add(R.tip, G.unit(G.sub(PS0.E2, PS0.D)), SN.needle.L); }
  if (g27 > 0) { R.tip27 = out > 0 ? G.add(PS0.D, U8, LT * out) : G.add(PS0.E8, G.sub(PS0.D, PS0.E8), g27); R.back27 = G.add(R.tip27, U8, L27); }
  return R; }
// the dislocated old IOL and the route it is drawn out along (示意: type unknown, the template gives only the 12 o'clock wound)
const INC = X.incOf(), OLDG = X.oldOf(X.norm(S({ old: {} }))), PMZ = X.IR.pm[1];
const OUT_ROUTE = [OLDG.O, [0, -0.3, PMZ - 0.7], [0, 1.6, PMZ + 0.7], INC.inner, INC.outer, G.add(INC.outer, [0, 1.0, 0.4])];
// the anterior chamber filled with viscoelastic (示意) in a meridional section: inside the wall, in front of the iris (the pupil plane inside the pupil)
const OVDC = {};
function ovdSec(v, h, win) { const key = h + JSON.stringify(win);
  if (!OVDC[key]) { const pl = G.planes.meridian(h), step = 0.05, hh = win.w * PH / PW, nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(hh / step) + 1, val = new Float64Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const p = G.onPlane(pl, win.x + i * step, win.y + j * step), m = G.mer(p), U = X.uveaAt(m.rho, m.z), r = m.rho;
      const zf = r > X.IR.root[0] ? X.IR.root[1] : r < X.IR.pr ? PMZ : (X.irisZ(r, false) ?? PMZ); val[j * nx + i] = Math.max(U.interior, zf - m.z, -U.iris); }   // interior < 0 inside the cavity
    OVDC[key] = G.contour(val, nx, ny, win.x, win.y, step); }
  return OVDC[key].map(l => 'M' + l.map(p => f1(v.P(p))).join('L') + 'Z').join(''); }
// the MA60AC outside the eye below the 12 o'clock wound while the strands are tied to it (示意 pose). The model's own outside pose (4.6 mm from the
// wound) lies over the 1 and 10 o'clock trocars and ties the 2 o'clock strand to the haptic on the 8 o'clock side, so the strands cross outside the
// wound; here the same lens lies 9 mm from the wound, turned 180° in its plane, so that each strand reaches the haptic on its own side (haptic
// shape and the tie at the distal third are the model's X.HAP)
const O_OUT = G.add(INC.outer, [0, 9.0, 1.0]), TIE_I = X.HAP.pts.findIndex(p => Math.abs(p[3] - SN.iol.tieT) < 0.013);
const HAP_OUT = [0, 1].map(j => { const ex = j === 0 ? [1, 0, 0] : [-1, 0, 0], ey = j === 0 ? [0, 1, 0] : [0, -1, 0]; return X.HAP.pts.map(p => G.add(G.add(G.add(O_OUT, ex, p[0]), ey, p[1]), [0, 0, 1], p[2])); });
const TIE_OUT = HAP_OUT.map(H => H[TIE_I]);
const CUT_ST = NDL({ pass: 1, g27: 1, out: 1, taut: 1, hook: 1, cut: 1 });
const STRANDS_OUT = X.sutureOf(X.norm(CUT_ST)).segs.map((sg, j) => [...sg.slice(0, -1), TIE_OUT[j]]);   // each strand: bed → sulcus → pupil → wound → its tie
// haptic j drawn as a tube in panel px (enface), the distal third highlighted
function hapTube(v, j, w, o = {}) { const H = HAP_OUT[j], q = H.map(p => v.Q(p)), d = 'M' + q.map(f1).join('L'), n = H.length - 1, i3 = Math.ceil(n * 2 / 3), dq = 'M' + q.slice(i3).map(f1).join('L');
  return `<path d="${dq}" fill="none" stroke="#e9b949" stroke-width="${(w + 10).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.55 * (o.hl ?? 0)).toFixed(2)}"/>` +
    `<path d="${d}" fill="none" stroke="#24476e" stroke-width="${(w + 1.6).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${C.hap}" stroke-width="${w.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function iolOut(v, w, o = {}) { const c = v.Q(O_OUT), r = X.HAP.Ro * v.k;
  return `<g opacity="${o.op ?? 1}"><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="#fffbe8" opacity="0.9" stroke="${C.iolS}" stroke-width="1.6"/>${hapTube(v, 0, w, o)}${hapTube(v, 1, w, o)}</g>`; }

// ---------------------------------------------------------------- 3 準備與 TPPV
const W_31 = { x: 3.55, y: -12.85, w: 7.4 };
const SC_F2 = (() => { const q = M12(X.flapPt(HP, TH / 2, 0, 0)); return { x: q[0] + 0.2 - 4.75, y: q[1] - 0.3 - 4.75 * PH / PW, w: 9.5 }; })();   // the 2 o'clock flap
DRAW2['3-1'] = T => {
  const kc = T.p(1, 0, 0.3), zr = T.p(1, 0.3, 0.5), kf = T.p(1, 0.35, 0.65), ko = T.p(1, 0.68, 0.95), kd = T.p(1, 0.8, 1), k2 = T.on(2);
  const flap = kf > 0 ? { cut: qz(kf), open: qz(ko) } : null;
  // left: the 2 o'clock site magnified; the conjunctiva fades as it is opened, then the flap is cut and lifted (lift angle 示意)
  const v0 = sec(PRE({}), W_31), v1 = sec(PRE({ peri: 1, flap }), W_31);
  let svg = kc <= 0 ? v0.svg : kc >= 1 ? v1.svg : v0.svg + `<g opacity="${kc.toFixed(2)}">${v1.svg}</g>`;
  const hb = X.flapPt(HP, 0, 0, FR), ab = X.flapPt(HP, TH, 0, FR), R = X.flapRot(HP, qz(ko)), tipNow = R.rot(X.flapPt(HP, TH * 0.55, 0, FR / 2)), Hh = G.P3(HP, SN.psl, 0);
  let ex = labR('結膜 conjunctiva', '', 350, v0.Q(G.P3(HP, sAt(2.6), -0.05)), { bold: true, color: '#b0505a', lc: '#b0505a', op: T.on(0) * (1 - kc) });
  ex += labR('鞏膜 sclera', '', 300, v0.Q(G.P3(HP, sAt(2.2), 0.3)), { color: INK2, op: T.on(0) * (1 - ko) });
  ex += labL('角膜緣後界', 'PSL', 250, v1.Q(Hh), { bold: true, color: PUR, lc: PUR, op: T.on(0) * (1 - ko) });
  if (ko > 0.5) { ex += labL('瓣：1/3 鞏膜厚', '掀起', 60, v1.Q(tipNow), { bold: true, color: '#7a5418', lc: '#7a5418', op: kd });
    ex += labR('瓣床 flap bed', '', 300, v1.Q(X.flapPt(HP, TH * 0.6, 0, FR)), { bold: true, color: '#7a5418', lc: '#7a5418', op: kd }); }
  ex += labL('鉸鏈：靠角膜緣、不切斷', '', 196, v1.Q(G.P3(HP, SN.psl, FR * G.T(SN.psl) / 2)), { bold: true, color: GRN, lc: GRN, op: k2 });
  ex += labR('線結之後藏在瓣下', '', 350, v1.Q(G.add(ab, G.N3(HP, SN.psl + TH), 0.02)), { color: INK2, op: k2 });
  ex += sbar(v1, 1) + note('瓣掀起的角度：示意', 1);
  sync('3-1', 'sec', 'hinge', hb); sync('3-1', 'sec', 'apex', ab);
  // right: the microscope view: the conjunctiva opened at 2 and 8 o'clock, then the 2 o'clock flap magnified: cut, lifted; its sides are 3 mm
  const w = scope(PRE({ peri: qz(kc, 24), flap }), VIEWS.zwin(SC_ALL, SC_F2, zr), 'sR'), B1 = X.flapPt(HP, 0, -SN.flap.side / 2, FR), B2 = X.flapPt(HP, 0, SN.flap.side / 2, FR);
  let rsvg = w.svg;
  const cen = w.Q(X.flapPt(HP, TH / 3, 0, FR)), side = (a, b, op) => { const qa = w.Q(a), qb = w.Q(b), m = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2], d = [m[0] - cen[0], m[1] - cen[1]], l = Math.hypot(...d) || 1, o = [d[0] / l * 12, d[1] / l * 12];
    return `<g opacity="${op.toFixed(2)}">${VIEWS.dim([qa[0] + o[0], qa[1] + o[1]], [qb[0] + o[0], qb[1] + o[1]], '#7a5418')}</g>`; };
  rsvg += side(B1, ab, kd);
  rsvg += `<g opacity="${k2.toFixed(2)}"><path d="M${f1(w.Q(B1))}L${f1(w.Q(B2))}" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M${f1(w.Q(B1))}L${f1(w.Q(B2))}" stroke="${GRN}" stroke-width="5" stroke-linecap="round"/></g>`;
  let rx = orientTag();
  rx += labL('2 點', '', 330, w.Q(G.P3(HP, SN.psl + 2.0, 0)), { bold: true, color: PUR, lc: PUR, op: T.on(0) * (1 - zr) });
  rx += labR('8 點', '', 120, w.Q(G.P3(8, SN.psl + 2.0, 0)), { bold: true, color: PUR, lc: PUR, op: T.on(0) * (1 - zr) });
  rx += labL('結膜剪開', 'conjunctiva', 345, w.Q(G.P3(HP - 0.3, SN.psl + 3.2, 0)), { bold: true, color: '#b0505a', lc: '#b0505a', op: T.on(1) * ss(0.6, 1, zr) });
  rx += labL('三角形瓣：邊長 3 mm', '', 250, w.Q(G.add(ab, G.sub(B1, ab), 0.5)), { bold: true, color: '#7a5418', lc: '#7a5418', op: kd });
  rx += labR('掀起的瓣', '1/3 厚', 250, w.Q(R.rot(X.flapPt(HP, TH * 0.6, 0, 0))), { color: '#7a5418', lc: '#7a5418', op: kd });
  rx += labL('瓣床 bed', '', 160, w.Q(X.flapPt(HP, TH * 0.45, -0.25, FR)), { color: '#7a5418', lc: '#7a5418', op: kd * (1 - T.on(2, 0.3)) });
  rx += labL('鉸鏈：靠角膜緣、不切斷', '', 110, w.Q(G.add(B1, G.sub(B2, B1), 0.75)), { bold: true, color: GRN, lc: GRN, op: T.on(2, 0.4, 0.3) });
  rx += note('瓣的大小：以主治為準', k2);
  sync('3-1', 'scope', 'hinge', hb); sync('3-1', 'scope', 'apex', ab);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
const W_17 = { x: -11, y: -13.6, w: 22 };
// instruments through the 1 and 10 o'clock cannulas, along the cannula axis (示意 depth): light pipe at 1 (in the 1–7 plane), vitrector at 10
const INSTR = h => { const Tr = X.trocarOf(h); return { E: Tr.E, tip: G.add(Tr.E, Tr.n, -7.5), back: G.add(Tr.E, Tr.n, 7), out: G.add(Tr.E, Tr.n, 2.2) }; };
DRAW2['3-2'] = T => {
  const z = T.p(1, 0, 0.35), kI = T.on(1, 0.6, 0.3), kv = T.p(2, 0.05, 0.95);
  const st = S({ vit: qz(kv, 16), old: {}, peri: 1, marks: 1, flap: { open: 0 }, trocar: 1 });
  // left: the 1–7 section (two trocars in plane: 1 o'clock and the 7 o'clock infusion): first the 1 o'clock site (3.5 / 4 mm from the PSL),
  // then the whole eye while the gel is removed from the centre (示意)
  const v = sec(st, VIEWS.zwin(W_ZONE, W_17, z), { h: 1 }), A = v.A, T1 = X.trocarOf(1), T7 = X.trocarOf(7), LP = INSTR(1), VC = INSTR(10);
  let svg = v.svg + ticksSec(v, [0, 3.5, 4], 'psl', { h: 1, op: 1 - z });
  svg += `<g opacity="${(0.45 * kI).toFixed(2)}"><path d="M${f1(v.Q(LP.tip))}L${f1(v.Q(G.add(LP.tip, T1.n, -2.6)))}" stroke="#f3d77a" stroke-width="${(0.5 * v.k).toFixed(1)}" stroke-linecap="round"/></g>` + rodSec(v, LP.tip, LP.back, '#9aa6b2', 4, kI);
  let ex = labL('23G trocar', '', 190, A.trocar1, { bold: true, color: INK2, op: zOut(z) });
  ex += labL('pars plana', '', 330, A.plana, { bold: true, color: INK2, op: T.on(0) * zOut(z) });
  ex += labL('睫狀突 pars plicata', '', 250, A.procMid, { color: BRN, lc: BRN, op: T.on(0) * zOut(z) });
  ex += labR('灌流 infusion', '', 130, A.trocar7, { bold: true, color: BLU, lc: BLU, op: zIn(z) });
  ex += labR('光纖 light pipe', '', 250, v.Q(G.add(LP.E, T1.n, -2.5)), { bold: true, color: INK2, op: zIn(z) * kI });
  ex += labR('玻璃體切除中', '範圍示意', 300, v.Q(G.onPlane(v.r.pl, 0.5, -1.8)), { bold: true, color: '#4f6478', lc: '#4f6478', op: T.on(2) });
  ex += (z < 0.5 ? sbar(v, 1, 1 - 2 * z) : sbar(v, 2, 2 * z - 1)) + note('trocar 鐘點：示意', 1);
  sync('3-2', 'sec', 'trocar1', T1.E); sync('3-2', 'sec', 'trocar7', T7.E);
  // right: the microscope view: three cannulas 3.5 mm behind the PSL, clear of the closed flaps and of where the 12 o'clock wound will be
  const w = scope(st, SC_WIDE, 'sR');
  let rsvg = w.svg + polyScope(w, [LP.tip, LP.back], 3, '#cfd6dd', { halo: '#5e6973', hw: 1.6, op: kI }) + polyScope(w, [VC.tip, VC.back], 3.4, '#cfd6dd', { halo: '#5e6973', hw: 1.6, op: kI });
  { const half = SN.inc.w / 2 / (G.surfAt(SN.inc.s).rho * Math.PI / 6), a = w.Q(G.P3(12 - half, SN.inc.s, 0)), b = w.Q(G.P3(12 + half, SN.inc.s, 0));
    rsvg += `<path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${(0.8 * T.on(1)).toFixed(2)}"/><path d="M${f1(a)}L${f1(b)}" stroke="${WARN}" stroke-width="3" stroke-dasharray="5 4" opacity="${T.on(1).toFixed(2)}"/>`; }
  let rx = orientTag();
  rx += labR('灌流 infusion', '', 60, w.A.trocar7, { bold: true, color: BLU, lc: BLU, op: T.on(0) });
  rx += labR('vitrector', '', 250, w.Q(VC.out), { bold: true, color: INK2, op: kI });
  rx += labL('光纖 light pipe', '', 330, w.Q(G.add(LP.E, X.trocarOf(1).n, 1.2)), { bold: true, color: INK2, op: kI });
  rx += labL('瓣（蓋著）', '示意', 250, w.A.flap2, { color: '#7a5418', lc: '#7a5418', op: T.on(1) });
  rx += labR('12 點切口的位置（之後做）', '', 386, w.Q(G.P3(12, SN.inc.s, 0)), { bold: true, color: WARN, lc: WARN, op: T.on(1) });
  rx += note('trocar 鐘點、器械位置：示意', 1, 30);
  sync('3-2', 'scope', 'trocar1', T1.E); sync('3-2', 'scope', 'trocar7', T7.E);
  return { L: { svg, extra: ex, P: SEC17_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 4 取出舊 IOL
const W_41 = { x: -6.2, y: -13.4, w: 13.8 };
DRAW2['4-1'] = T => {
  const ki = T.p(0, 0.05, 0.35), ko = T.p(0, 0.45, 0.9), ka = T.p(1, 0, 0.45), kr = T.p(1, 0.5, 0.85);
  // left: the 12–6 section: the wound tunnel is cut, viscoelastic fills the chamber (示意), the old IOL leaves along the route (示意) and is gone
  const vA = sec(AFTER({ old: {} }), W_41, { h: 12 }), vB = kr > 0 ? sec(AFTER({}), W_41, { h: 12 }) : null;
  let svg = kr <= 0 ? vA.svg : kr >= 1 ? vB.svg : vB.svg + `<g opacity="${(1 - kr).toFixed(2)}">${vA.svg}</g>`;
  { const d = ovdSec(vA, 12, W_41); svg += `<g opacity="${ko.toFixed(2)}"><path d="${d}" fill="#4aa3d8" fill-rule="evenodd" opacity="0.32"/><path d="${d}" fill="none" stroke="#1f6f9e" stroke-width="1.6" stroke-dasharray="6 4"/></g>`; }
  if (ki > 0) { const tin = G.add(INC.outer, G.sub(INC.inner, INC.outer), ki); svg += `<path d="M${f1(vA.Q(INC.outer))}L${f1(vA.Q(tin))}" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><path d="M${f1(vA.Q(INC.outer))}L${f1(vA.Q(tin))}" stroke="${INK2}" stroke-width="2.6" stroke-linecap="round"/>`; }
  if (ka > 0) svg += arrowPath(partial(OUT_ROUTE.map(vA.Q), ka), OLDC, 2.4, (1 - 0.6 * kr).toFixed(2));
  let ex = labR('12 點切口', 'wound', 40, vA.Q(INC.outer), { bold: true, color: INK2, op: T.on(0) });
  ex += labR('viscoelastic 撐前房', '示意', 190, vA.Q([0, -1.5, 10.6]), { bold: true, color: '#1f6f9e', lc: '#1f6f9e', op: ko });
  ex += labL('舊 IOL', '示意', 360, vA.Q(OLDG.O), { bold: true, color: OLDC, lc: OLDC, op: 1 - kr });
  ex += labL('經 12 點取出', '路線示意', 40, vA.Q(OUT_ROUTE[2]), { bold: true, color: OLDC, lc: OLDC, op: T.on(1) });
  ex += labR('虹膜 iris', '', 250, vA.Q([0, 4.8, X.irisZ(4.8, false) - 0.15]), { color: '#4a2b19', lc: '#4a2b19', op: T.on(0) });
  ex += sbar(vA, 2) + note('取法以主治為準', T.on(1));
  sync('4-1', 'sec', 'wound', INC.outer);
  // right: the microscope view: the 12 o'clock wound opens, viscoelastic over the chamber (示意), the old IOL drawn out through the wound (示意)
  const wA = scope(AFTER({ old: {}, inc: qz(ki) }), SC_ALL, 'sR'), wB = kr > 0 ? scope(AFTER({ inc: qz(ki) }), SC_ALL, 'sR2') : null;
  let rsvg = kr <= 0 ? wA.svg : kr >= 1 ? wB.svg : wB.svg + `<g opacity="${(1 - kr).toFixed(2)}">${wA.svg}</g>`;
  { const c = wA.Q([0, 0, 0]), r = G.surfAt(0).rho * wA.k; rsvg += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="#4aa3d8" opacity="${(0.2 * ko).toFixed(2)}"/>`; }
  if (ka > 0) rsvg += arrowPath(partial(OUT_ROUTE.map(wA.Q), ka), OLDC, 2.4, (1 - 0.6 * kr).toFixed(2));
  let rx = orientTag();
  rx += labL('12 點切口', '', 350, wA.Q(INC.outer), { bold: true, color: INK2, op: T.on(0) });
  rx += labR('viscoelastic', '示意', 300, wA.Q(G.P3(9.5, -1.2, 0)), { bold: true, color: '#1f6f9e', lc: '#1f6f9e', op: ko });
  rx += labR('舊 IOL', '示意', 60, wA.A.old, { bold: true, color: OLDC, lc: OLDC, op: 1 - kr });
  rx += labL('經 12 點取出', '示意', 250, wA.Q(OUT_ROUTE[2]), { bold: true, color: OLDC, lc: OLDC, op: T.on(1) });
  sync('4-1', 'scope', 'wound', INC.outer);
  return { L: { svg, extra: ex, P: SEC126_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 5 穿線與綁 haptic
DRAW2['5-1'] = T => {
  // left: the double-armed suture as the template's 「10-0 直彎針」 is read (推論; shapes and lengths 示意)
  const k1 = T.on(1);
  let o = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  const y0 = 200, sx0 = 46, sx1 = 236, cx = 496, cy = 212, cr = 48;
  o += `<path d="M${sx0} ${y0}L${sx1} ${y0 - 3.5}L${sx1 + 16} ${y0 - 3.5}L${sx1 + 16} ${y0 + 3.5}L${sx1} ${y0 + 3.5}Z" fill="#8a95a1" stroke="#3b434c" stroke-width="1.4" stroke-linejoin="round"/>`;
  const thr = `M${sx1 + 16} ${y0}C${sx1 + 90} ${y0 - 70},${cx - 170} ${y0 + 80},${cx - cr - 4} ${cy}`;
  o += `<path d="${thr}" fill="none" stroke="#fff" stroke-width="6"/><path d="${thr}" fill="none" stroke="${C.pro}" stroke-width="2.6"/>`;
  const arc = `M${cx - cr - 4} ${cy}A${cr} ${cr} 0 1 1 ${(cx + cr * Math.cos(-0.15 * Math.PI)).toFixed(1)} ${(cy + cr * Math.sin(-0.15 * Math.PI)).toFixed(1)}`;
  o += `<path d="${arc}" fill="none" stroke="#3b434c" stroke-width="8.4" stroke-linecap="round"/><path d="${arc}" fill="none" stroke="#8a95a1" stroke-width="5.4" stroke-linecap="round"/>`;
  o += boxAt(16, 14, PW - 32, 38, '排程單「10-0 直彎針」→ 推測：一條線、兩頭各一支針', T.on(0), INK2, 16);
  let ex = lab('直針', 'straight needle', 40, 130, [sx0 + 60, y0 - 2], { bold: true, color: INK2 });
  ex += lab('彎針', 'curved needle', PW - 14, 108, [cx + 30, cy - 38], { bold: true, color: INK2, side: 'R' });
  ex += lab('10-0 Prolene', '一條線', 200, 300, [sx1 + 130, y0 + 12], { bold: true, color: C.pro, lc: C.pro });
  ex += tlines(40, 252, ['→ 穿過眼球', '（2 點進、8 點出）'], { op: k1, color: GRN });
  ex += tlines(420, 312, ['→ 最後在瓣床', '咬一針打結'], { op: k1, color: '#7a5418' });
  ex += note('用法是推論，以主治為準', k1);
  // right: where each needle is used (推論): the straight one through the eye from the 2 o'clock bed to the 8 o'clock bed; the curved one bites the
  // 2 o'clock bed at the end (the knot's place in the model, 示意)
  const st = OPEN({}), w = scope(st, SC_ALL, 'sR'), Kn = X.knotOf(X.norm(NDL({})), 0);
  let rsvg = w.svg + polyScope(w, [PS0.E2, PS0.I2, PS0.D, PS0.I8, PS0.E8], 2.4, GRN, { op: k1 }) + dot(w.Q(PS0.E2), GRN, 6, k1) + dot(w.Q(PS0.E8), GRN, 6, k1);
  { const a = w.Q(Kn.biteA), b = w.Q(Kn.biteB), m = [(a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2 + 6];
    rsvg += `<path d="M${f1(a)}Q${f1(m)} ${f1(b)}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${k1.toFixed(2)}"/><path d="M${f1(a)}Q${f1(m)} ${f1(b)}" fill="none" stroke="#7a5418" stroke-width="4" stroke-linecap="round" opacity="${k1.toFixed(2)}"/>`; }
  let rx = orientTag();
  rx += labL('直針：2 點瓣床進', '', 290, w.Q(PS0.E2), { bold: true, color: GRN, lc: GRN, op: k1 });
  rx += labR('8 點瓣床出', '', 60, w.Q(PS0.E8), { bold: true, color: GRN, lc: GRN, op: k1 });
  rx += labL('彎針：2 點瓣床咬一針', '', 386, w.Q(G.add(Kn.biteA, G.sub(Kn.biteB, Kn.biteA), 0.5)), { bold: true, color: '#7a5418', lc: '#7a5418', op: k1 });
  rx += note('虛線：在虹膜後面（看不到）', k1, 30);
  return { L: { svg: o, extra: ex, P: NDL_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
const W_52 = { x: 4.4, y: -11.6, w: 5.2 }, W_CH = { x: 0.2, y: -11.7, w: 7.2 };   // the 2 o'clock bed; the suture's way behind the iris to the sulcus
DRAW2['5-2'] = T => {
  const pass = 0.2 * T.p(0, 0.08, 0.42) + 0.55 * T.p(0, 0.45, 0.95) + 0.25 * T.p(1, 0.15, 0.45), g27 = T.p(1, 0, 0.45), out = T.p(1, 0.55, 0.95), taut = T.p(2, 0, 0.3), kg = T.p(2, 0.3, 0.55);
  const z = T.p(0, 0.45, 0.8), z2 = T.p(2, 0.05, 0.35), n = { pass, g27, out, taut }, N = needles(n), c = X.norm(NDL(n)), SU = X.sutureOf(c), kD = T.on(1, 0.5, 0.7) * (1 - taut);
  // left: the 2 o'clock bed magnified (entry 1 mm behind the PSL on the original surface), then the 2–8 section: the needle passes behind the iris,
  // the insulin (27G) needle from the 8 o'clock bed takes its tip behind the pupil and brings it out; then the suture pulled straight, magnified on
  // its way behind the iris and in front of where the IOL will be (示意 dock and angle)
  const win = z2 > 0 ? VIEWS.zwin(W_ALL, W_CH, z2) : VIEWS.zwin(W_52, W_ALL, z), v = sec(OPEN({}), win);
  let svg = v.svg;
  { const sf = []; for (let k = 0; k <= 24; k++) sf.push(v.Q(G.P3(HP, SN.psl + TH * k / 24, 0))); svg += `<path d="M${sf.map(f1).join('L')}" fill="none" stroke="#7a5418" stroke-width="1.6" stroke-dasharray="4 3" opacity="${(0.8 * (1 - z)).toFixed(2)}"/>`; }
  svg += ticksSec(v, [0, 1], 'psl', { op: 1 - z });
  const nw = Math.min(3.6, SN.needle.od * v.k), gw = Math.min(7, SN.g27 * v.k), IOF = X.iolOf(X.norm(FIX));
  if (kg > 0) { const top = [], bot = []; for (let k = 0; k <= 30; k++) { const x = -X.HAP.Ro + 2 * X.HAP.Ro * k / 30, hth = X.optHalf(Math.abs(x)); top.push(v.Q(G.add(G.add(IOF.O, IOF.d, x), IOF.en, hth))); bot.unshift(v.Q(G.add(G.add(IOF.O, IOF.d, x), IOF.en, -hth))); }
    svg += `<path d="M${[...top, ...bot].map(f1).join('L')}Z" fill="${C.iol}" fill-opacity="0.35" stroke="${IOLC}" stroke-width="1.6" stroke-dasharray="5 3" opacity="${kg.toFixed(2)}"/>`; }
  for (const sg of SU.segs) svg += strandSec(v, sg, { w: Math.max(1.8, Math.min(2.6, 0.03 * v.k)), op: out > 0 ? Math.min(1, out * 6) : 1 });
  if (N.tip) svg += rodSec(v, N.tip, N.back, INK2, nw, out > 0 ? 0 : 1);
  if (N.tip27) svg += rodSec(v, N.tip27, N.back27, '#8e99a5', gw);
  for (const p of [PS0.E2, PS0.E8]) svg += dot(v.Q(p), GRN, 5);
  svg += `<g opacity="${kD.toFixed(2)}">${ring2(v.Q(PS0.D), WARN, 8)}</g>`;
  let ex = '';
  ex += labR('瓣床 flap bed', '', 300, v.Q(X.flapPt(HP, TH * 0.75, 0, FR)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.on(0) * zOut(z) });
  ex += labR('原本的表面：後界後 1 mm', '', 170, v.Q(G.P3(HP, sAt(1), 0)), { color: PUR, lc: PUR, op: T.on(0) * zOut(z) });
  ex += labL('睫狀溝 sulcus', '', 330, v.A.apex, { bold: true, color: GRN, lc: GRN, op: T.on(0) * zOut(z) });
  ex += labL('虹膜 iris', '', 250, v.Q(G.add(PS0.I2, [0, 0, 0.25])), { color: '#4a2b19', lc: '#4a2b19', op: T.on(0) * zOut(z) });
  ex += labR('直針', '推論', 60, v.Q(G.add(PS0.E2, G.unit(G.sub(PS0.E2, PS0.D)), 0.9)), { bold: true, color: INK2, op: zIn(z) * (1 - out) });
  ex += labR('經虹膜後面往對側', '', 330, v.Q(G.add(PS0.E2, G.sub(PS0.D, PS0.E2), 0.45)), { bold: true, color: GRN, lc: GRN, op: zIn(z) * (1 - T.on(1, 0.4)) });
  ex += labR('胰島素空針（8 點瓣床）', '', 150, v.Q(G.add(PS0.E8, U8, 1.4)), { bold: true, color: '#56616d', lc: '#56616d', op: T.on(1) * zOut(z2) });
  ex += labR('在瞳孔後面接住針尖', '會合點示意', 330, v.Q(PS0.D), { bold: true, color: WARN, lc: WARN, op: kD });
  ex += labL('線：虹膜後、IOL 前', '', 250, v.Q(G.add(PS0.I2, G.sub(PS0.I8, PS0.I2), 0.12)), { bold: true, color: C.pro, lc: C.pro, op: zIn(z2) });
  ex += labL('虹膜 iris', '', 100, v.Q(G.add([0, 0, X.irisZ(4.4, false) - 0.12], [...G.clockDir(HP), 0], 4.4)), { color: '#4a2b19', lc: '#4a2b19', op: zIn(z2) });
  ex += labL('之後 IOL 的位置', '示意', 330, v.Q(G.add(IOF.O, IOF.d, -2.2)), { bold: true, color: IOLC, lc: IOLC, op: kg });
  ex += labR('睫狀溝 sulcus', '', 330, v.Q(PS0.I2), { bold: true, color: GRN, lc: GRN, op: kg });
  ex += (z2 > 0 ? sbar(v, 1) : z < 0.5 ? sbar(v, 1, 1 - 2 * z) : sbar(v, 2, 2 * z - 1)) + note('角度、會合點、粗細：示意', 1);
  sync('5-2', 'sec', 'E2', PS0.E2); sync('5-2', 'sec', 'E8', PS0.E8); sync('5-2', 'sec', 'D', PS0.D);
  // right: the microscope view: the same needles (the model draws the suture; draw.js the needles, dashed behind the iris)
  const w = scope(NDL({ pass, g27: 0, out, taut }), SC_ALL, 'sR');
  let rsvg = w.svg + (N.tip && out <= 0 ? polyScope(w, [N.tip, N.back], 2.2, '#56616d') : '') + (N.tip27 ? polyScope(w, [N.tip27, N.back27], 2.4, C.g27, { halo: C.hubS, hw: 1.6 }) : '');
  for (const p of [PS0.E2, PS0.E8]) rsvg += dot(w.Q(p), GRN, 5);
  rsvg += `<g opacity="${kD.toFixed(2)}">${ring2(w.Q(PS0.D), WARN, 8)}</g>`;
  let rx = orientTag();
  rx += labL('直針：2 點瓣床', '推論', 330, w.Q(PS0.E2), { bold: true, color: GRN, lc: GRN, op: T.on(0) });
  rx += labR('胰島素空針：8 點瓣床', '', 60, w.Q(PS0.E8), { bold: true, color: '#56616d', lc: '#56616d', op: T.on(1) });
  rx += labR('會合：瞳孔後', '示意', 300, w.Q(PS0.D), { bold: true, color: WARN, lc: WARN, op: kD });
  rx += labR('線拉直：虹膜後', '虛線＝擋住', 230, w.Q(G.add(PS0.I2, G.sub(PS0.I8, PS0.I2), 0.62)), { bold: true, color: C.pro, lc: C.pro, op: T.on(2) });
  rx += note('虛線：在虹膜後面（看不到）', 1, 30);
  sync('5-2', 'scope', 'E2', PS0.E2); sync('5-2', 'scope', 'E8', PS0.E8); sync('5-2', 'scope', 'D', PS0.D);
  return { L: { svg, extra: ex, P: z < 0.5 && !z2 ? ZOOM_T : SEC_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
const SC_53 = { x: -10.5, y: -5.6, w: 21 }, S2C = '#8a3b12', S8C = '#1f6f9e';
DRAW2['5-3'] = T => {
  const kh = T.p(0, 0.08, 0.55), cut = T.p(0, 0.58, 0.62) > 0.5 ? 1 : 0, kl = T.p(0, 0.66, 0.8), kA = T.p(0, 0.12, 0.5);
  const st = NDL({ pass: 1, g27: 1, out: 1, taut: 1, hook: qz(kh, 24), cut }), c = X.norm(st), SU = X.sutureOf(c), H2 = X.hookPts(PS0, 0);
  // left: the 2–8 section: the straight strand is hooked up to the pupil and out of this plane toward the 12 o'clock wound (dashed), then cut: two
  // strands, one from each bed
  const v = sec(OPEN({}), W_ALL);
  let svg = v.svg; SU.segs.forEach((sg, j) => { svg += strandSec(v, sg, { col: cut ? (j ? S8C : S2C) : C.pro }); });
  for (const p of [PS0.E2, PS0.E8]) svg += dot(v.Q(p), GRN, 5);
  let ex = labR('拉直的線', '', 330, v.Q(G.add(PS0.I2, G.sub(PS0.I8, PS0.I2), 0.75)), { bold: true, color: C.pro, lc: C.pro, op: 1 - T.p(0, 0.05, 0.15) });
  ex += labR('勾到瞳孔', '往 12 點切口', 180, v.Q(kh < 0.5 ? [0, 0, PMZ - 0.25] : H2[1]), { bold: true, color: INK2, op: T.p(0, 0.15, 0.25) * (1 - kl) });
  ex += labR('連 2 點的線', '', 60, v.Q(PS0.I2), { bold: true, color: S2C, lc: S2C, op: kl });
  ex += labL('連 8 點的線', '', 60, v.Q(PS0.I8), { bold: true, color: S8C, lc: S8C, op: kl });
  ex += sbar(v, 2) + note('虛線：離開這個切面（往 12 點）', 1);
  sync('5-3', 'sec', 'E2', PS0.E2); sync('5-3', 'sec', 'E8', PS0.E8);
  // right: the microscope view: hooked out of the 12 o'clock wound (route 示意), cut into two strands outside the eye (coloured as on the left)
  const w = scope(st, SC_53, 'sR');
  let rsvg = w.svg;
  if (cut) SU.segs.forEach((sg, j) => { rsvg += polyScope(w, sg, 1.8, j ? S8C : S2C, { op: kl }); });
  for (const p of [PS0.E2, PS0.E8]) rsvg += dot(w.Q(p), GRN, 5);
  if (kA > 0 && kA < 1) rsvg += arrowPath(partial([w.Q([0, 0, PMZ - 0.25]), w.Q(INC.inner), w.Q(G.add(INC.outer, [0, 1.6, 0.5]))], kA), INK2, 2.2, (1 - T.p(0, 0.45, 0.55)).toFixed(2));
  const loop = G.add(INC.outer, [0, 2.2, 0.6]), lq = w.Q(loop);
  rsvg += `<g opacity="${(T.p(0, 0.55, 0.6) * (1 - kl)).toFixed(2)}" stroke="${WARN}" stroke-width="3.4" stroke-linecap="round"><path d="M${f1([lq[0] - 9, lq[1] - 9])}L${f1([lq[0] + 9, lq[1] + 9])}M${f1([lq[0] - 9, lq[1] + 9])}L${f1([lq[0] + 9, lq[1] - 9])}"/></g>`;
  let rx = orientTag();
  rx += labR('12 點切口', '', 250, w.Q(INC.outer), { bold: true, color: INK2 });
  rx += labL('從 12 點切口勾出', '', 250, w.Q([0, 0, PMZ - 0.25]), { bold: true, color: INK2, op: T.p(0, 0.08, 0.2) * (1 - T.p(0, 0.45, 0.55)) });
  rx += labR('剪斷', '', 320, lq, { bold: true, color: WARN, lc: WARN, op: T.p(0, 0.55, 0.6) * (1 - kl) });
  const ends = SU.segs.map(sg => sg[sg.length - 1]);
  rx += labL('連 2 點', '', 386, w.Q(ends[0]), { bold: true, color: S2C, lc: S2C, op: kl });
  rx += labR('連 8 點', '', 386, w.Q(ends[1] || ends[0]), { bold: true, color: S8C, lc: S8C, op: kl });
  rx += note('勾出的路線：示意', 1, 30);
  sync('5-3', 'scope', 'E2', PS0.E2); sync('5-3', 'scope', 'E8', PS0.E8);
  return { L: { svg, extra: ex, P: SEC_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
const SC_54 = { x: -15, y: -1.0, w: 30 };
const W_HAP = (() => { const q = M12(G.add(O_OUT, [3.0, -0.6, 0])); return { x: q[0] - 6.2, y: q[1] - 6.2 * PH / PW, w: 12.4 }; })();   // haptic 0 whole, optic
const W_TIE = (() => { const a = M12(HAP_OUT[0][Math.ceil((X.HAP.pts.length - 1) * 2 / 3)]), b = M12(HAP_OUT[0][X.HAP.pts.length - 1]), q = [(a[0] + b[0]) / 2 - 0.3, (a[1] + b[1]) / 2 + 0.25]; return { x: q[0] - 3.2, y: q[1] - 3.2 * PH / PW, w: 6.4 }; })();   // distal third to the tip
DRAW2['5-4'] = T => {
  const z = T.p(0, 0.3, 0.6), k0 = T.on(0), k1 = T.on(1), kc = T.p(1, 0.5, 0.8), ks = T.p(2, 0.05, 0.75), kz = T.p(0, 0.6, 0.72), kd = 1 - T.p(0, 0.5, 0.58);
  const base = OPEN({});
  // left: magnified on the haptic tied to the 2 o'clock strand (the same 3D lens as the right panel): the tie at the distal third, 3-1-1 (three
  // wraps, then two single throws), the cow hitch and the cauterised tip (Kokame 2018), and the strand slipping off the end (示意)
  const win = VIEWS.zwin(W_HAP, W_TIE, z), v = scope(base, win, 'sL'), hw = Math.max(3, SN.iol.hd * v.k), H = HAP_OUT[0], nH = H.length - 1;
  // where the knot is: at the tie, or sliding to the tip and off it (slip, 示意)
  const kpos = (() => { const L = []; for (let i = TIE_I; i <= nH; i++) L.push(H[i]); const e = G.sub(H[nH], H[nH - 1]); L.push(G.add(H[nH], G.unit(e), 0.35));
    let tot = 0; for (let i = 1; i < L.length; i++) tot += G.len(G.sub(L[i], L[i - 1])); let left = tot * ks;
    for (let i = 1; i < L.length; i++) { const l = G.len(G.sub(L[i], L[i - 1])); if (left <= l) return { p: G.add(L[i - 1], G.sub(L[i], L[i - 1]), left / l), a: L[i - 1], b: L[i] }; left -= l; }
    return { p: L[L.length - 1], a: L[L.length - 2], b: L[L.length - 1] }; })();
  const strands = STRANDS_OUT.map((sg, j) => j === 0 ? [...sg.slice(0, -1), kpos.p] : sg);
  let svg = v.svg + iolOut(v, hw, { hl: k0 });
  for (const sg of strands) svg += polyScope(v, sg, Math.max(2, Math.min(4, 0.025 * v.k)), C.pro);
  const P = v.Q(kpos.p), qa = v.Q(kpos.a), qb = v.Q(kpos.b), tl = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]) || 1, tu = [(qb[0] - qa[0]) / tl, (qb[1] - qa[1]) / tl], nu = [-tu[1], tu[0]];
  { let kn = ''; for (let i = -1; i <= 1; i++) { const c0 = [P[0] + tu[0] * i * hw * 0.75, P[1] + tu[1] * i * hw * 0.75], a = [c0[0] + nu[0] * hw * 1.1 - tu[0] * hw * 0.35, c0[1] + nu[1] * hw * 1.1 - tu[1] * hw * 0.35], b = [c0[0] - nu[0] * hw * 1.1 + tu[0] * hw * 0.35, c0[1] - nu[1] * hw * 1.1 + tu[1] * hw * 0.35];
      kn += `<path d="M${f1(a)}L${f1(b)}" stroke="#fff" stroke-width="${(hw * 0.42 + 3).toFixed(1)}" stroke-linecap="round"/><path d="M${f1(a)}L${f1(b)}" stroke="${C.pro}" stroke-width="${(hw * 0.42).toFixed(1)}" stroke-linecap="round"/>`; }
    for (let i = 0; i < 2; i++) { const c0 = [P[0] + nu[0] * hw * (1.9 + 1.1 * i), P[1] + nu[1] * hw * (1.9 + 1.1 * i)]; kn += `<circle cx="${c0[0].toFixed(1)}" cy="${c0[1].toFixed(1)}" r="${(hw * 0.45).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(hw * 0.32 + 3).toFixed(1)}"/><circle cx="${c0[0].toFixed(1)}" cy="${c0[1].toFixed(1)}" r="${(hw * 0.45).toFixed(1)}" fill="none" stroke="${C.pro}" stroke-width="${(hw * 0.32).toFixed(1)}"/>`; }
    svg += `<g opacity="${(kz * (1 - ss(0.75, 1, ks))).toFixed(2)}">${kn}</g>`; }
  const tipQ = v.Q(H[nH]);
  svg += `<circle cx="${tipQ[0].toFixed(1)}" cy="${tipQ[1].toFixed(1)}" r="${(hw * 0.95).toFixed(1)}" fill="#24476e" opacity="${(kc * (1 - ks)).toFixed(2)}"/>`;
  if (ks > 0) { const path = H.slice(TIE_I).map(p => v.Q(p)); path.push(v.Q(G.add(H[nH], G.unit(G.sub(H[nH], H[nH - 1])), 0.35)));
    svg += arrowPath(partial(path.map(p => [p[0] - nu[0] * hw * 2.4, p[1] - nu[1] * hw * 2.4]), Math.min(1, ks * 1.3)), WARN, 3, 1); }
  const i23 = Math.ceil(nH * 2 / 3);
  let ex = labR('遠端三分之一', 'distal third', 170, v.Q(H[Math.round((i23 + nH) / 2)]), { bold: true, color: '#9a6a00', lc: '#9a6a00', op: k0 * kd });
  ex += labR('綁在這裡', '', 290, v.Q(TIE_OUT[0]), { bold: true, color: C.pro, lc: C.pro, op: k0 * (1 - z) });
  ex += labL('3-1-1：繞三圈', '', 130, [P[0] - nu[0] * hw * 1.1, P[1] - nu[1] * hw * 1.1], { bold: true, color: C.pro, lc: C.pro, op: kz * (1 - k1) });
  ex += labL('＋兩個單結', '', 170, [P[0] + nu[0] * hw * 3.4, P[1] + nu[1] * hw * 3.4], { bold: true, color: C.pro, lc: C.pro, op: kz * (1 - k1) });
  ex += labL('末端燒一下：變圓防滑', '示意', 330, tipQ, { bold: true, color: '#24476e', lc: '#24476e', op: kc * (1 - T.on(2)) });
  ex += labL('線從 haptic 滑脫', '示意', 330, [tipQ[0] - nu[0] * hw * 2.4, tipQ[1] - nu[1] * hw * 2.4], { bold: true, color: WARN, lc: WARN, op: T.p(2, 0.3, 0.5) });
  ex += `<g opacity="${(k1 * (1 - T.on(2))).toFixed(2)}">` + (() => { const x0 = PW - 214, y0 = 14; let s = `<rect x="${x0}" y="${y0}" width="200" height="118" rx="8" fill="#fff" stroke="#d3dae1"/>`;
    s += `<rect x="${x0 + 22}" y="${y0 + 52}" width="156" height="12" rx="6" fill="${C.hap}" stroke="#24476e"/>`;
    for (const dx of [-11, 11]) s += `<path d="M${x0 + 100 + dx} ${y0 + 44}L${x0 + 100 + dx} ${y0 + 72}" stroke="${C.pro}" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M${x0 + 89} ${y0 + 44}Q${x0 + 100} ${y0 + 34} ${x0 + 111} ${y0 + 44}" fill="none" stroke="${C.pro}" stroke-width="4"/>`;
    s += `<path d="M${x0 + 89} ${y0 + 72}Q${x0 + 96} ${y0 + 86} ${x0 + 98} ${y0 + 104}M${x0 + 111} ${y0 + 72}Q${x0 + 104} ${y0 + 86} ${x0 + 102} ${y0 + 104}" fill="none" stroke="${C.pro}" stroke-width="3"/>`;
    return s + text(x0 + 12, y0 + 24, 'cow hitch 套結（示意）', { size: 14, bold: true, color: INK2 }); })() + `</g>`;
  ex += VIEWS.sbar(v.k, 1, z < 0.5 ? 2 : 1) + note('綁法以主治為準', T.on(2));
  sync('5-4', 'sec', 'tie2', TIE_OUT[0]); sync('5-4', 'sec', 'tie8', TIE_OUT[1]);
  // right: the microscope view: the strands out of the 12 o'clock wound, each tied to the distal third of a haptic of the lens outside the eye (示意 pose)
  const w = scope(base, SC_54, 'sR');
  let rsvg = w.svg + iolOut(w, 2.4, { hl: k0 });
  strands.forEach((sg, j) => { rsvg += polyScope(w, sg, 1.6, j ? S8C : S2C); });
  TIE_OUT.forEach((q, j) => { rsvg += dot(w.Q(q), '#111827', 4.5, j ? 1 : 1 - ks); });
  { const p0 = w.P([win.x, win.y]), p1 = w.P([win.x + win.w, win.y + win.w * PH / PW]);
    rsvg += `<rect x="${p0[0].toFixed(1)}" y="${p0[1].toFixed(1)}" width="${(p1[0] - p0[0]).toFixed(1)}" height="${(p1[1] - p0[1]).toFixed(1)}" fill="none" stroke="${PUR}" stroke-width="2" stroke-dasharray="6 4"/>`; }
  let rx = orientTag();
  rx += labR('12 點切口', '', 60, w.Q(INC.outer), { bold: true, color: INK2 });
  rx += labL('連 2 點的線', '', 200, w.Q(G.add(INC.outer, G.sub(TIE_OUT[0], INC.outer), 0.55)), { bold: true, color: S2C, lc: S2C, op: k0 });
  rx += labR('連 8 點的線', '', 200, w.Q(G.add(INC.outer, G.sub(TIE_OUT[1], INC.outer), 0.55)), { bold: true, color: S8C, lc: S8C, op: k0 });
  rx += labR('IOL 在眼外', '擺位示意', 386, w.Q(G.add(O_OUT, [-1.6, 2.0, 0])), { bold: true, color: IOLC, lc: IOLC, op: k0 });
  rx += labL('放大框＝左圖', '', 386, w.P([win.x + win.w * 0.15, win.y + win.w * PH / PW]), { color: PUR, lc: PUR });
  sync('5-4', 'scope', 'tie2', TIE_OUT[0]); sync('5-4', 'scope', 'tie8', TIE_OUT[1]);
  return { L: { svg, extra: ex, P: MAG_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 6–9 (2026-11-12, third round): helpers
const IOL_SEC_T = { title: '機轉切面：經 2 點與 8 點（模型）', orient: '右＝2 點　上＝前' };
window.STATES = {};                                                                         // states drawn, for check.js (tilt, knot under the flap, error states)
// a model section / microscope view with the tie mark on one haptic removed (the haptic slipped out of its knot: the knot stays on the suture, draw.js
// draws it there); the model draws the tie mark on the haptic itself
function dropTie(r, A, nm, rad) { const t = A[nm]; if (!t) return r; const re = new RegExp(`<circle cx="${t[0].toFixed(4)}" cy="${t[1].toFixed(4)}" r="${rad}"[^>]*/>`); return r.replace(re, ''); }
function secD(st, win, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), h = win.w * H / W;
  const r = X.section({ st, h: o.h ?? HP, win: { x: win.x, y: win.y, w: win.w, h }, step: o.step || +(win.w / 330).toFixed(4) }), svg = o.drop ? dropTie(r.svg, r.A, 'tie' + o.drop, '0.09') : r.svg;
  return { svg: `<g transform="${c.tf}">${svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(G.toPlane(r.pl, p3)) };
}
function scopeD(st, win, id, o = {}) {
  const W = o.W || PW, H = o.H || PH, c = VIEWS.cam(win, W, H), r = X.enface({ st, id, surgeon: 12 }), svg = o.drop ? dropTie(r.svg, r.A, 'tie' + o.drop, '0.12') : r.svg;
  return { svg: `<g transform="${c.tf}">${svg}</g>`, A: mapA(r.A, c.P), P: c.P, k: c.k, r, Q: p3 => c.P(r.M(p3)) };
}
const arrowOut = (v, from3, to3, col, op = 1) => arrowPath([v.Q(from3), v.Q(to3)], col, 2.6, op);

// ---------------------------------------------------------------- 6 放入 IOL 與置中
// The strands are cut and tied (5-3, 5-4); the lens goes in from the 5-4 pose outside the 12 o'clock wound (HAP_OUT). Rewritten 2026-11-12 (出片前定稿):
// the lens keeps the MA60AC's size — optic 6 mm, overall 13 mm (the model's X.HAP) outside the eye and while it hangs slack inside; only the
// haptics bend (示意) — and every point of it crosses the wall in the 12 o'clock wound only. Path (示意): outside, the lens turns so that the haptic
// tied to the 8 o'clock strand leads, the optic is folded (drawn narrower, with its crease) and both haptics are pressed toward the lens axis; it
// slides in along one straight line through the middle of the tunnel (IN6.pitch below the frontal plane, toward 6 o'clock): the leading haptic
// passes over the iris and through the pupil behind the iris, the optic reaches the pupil; the trailing haptic is pressed against the optic (the
// tuck of a three-piece lens, 示意) and so comes in through the tunnel; the lens moves onto the axis, sinks behind the iris and turns until its
// haptics point at 2 and 8 o'clock; the optic unfolds and the trailing haptic is let go behind the iris. The slack pose hangs below the sulcus at
// the free size (the model's own slack pose, iol pull 0, compresses the haptics to 10.8 mm, so draw.js draws the lens itself in both views);
// pulling both strands brings the ties up to the sulcus exits while the haptics flex into the model's fixed pose (iol pull 1: 12.84 mm).
// check.js samples the segment every 0.1 s and every drawn pose (window.LENS61, LENS61_AT): through the wall only in the wound, never in the
// iris, cornea or ciliary body; 13 mm long outside the eye and when slack.
const IN_ST = p => OPEN({ ndl: { s2: SN.guedes, s8: SN.guedes, pass: 1, g27: 1, out: 1, taut: 1, hook: 1, cut: 1 }, iol: { pull: p } });
const IOF = X.iolOf(X.norm(IN_ST(1))), D2R6 = Math.PI / 180, TN10 = Math.tan(SN.iol.ang * D2R6), RO = X.HAP.Ro;
const IN6 = { pitch: 25.5, fold: 0.4, sq: 0.28, zSlack: 7.3, kTuck: 0.05, aB: 3.9, zC: 9.5 };   // 示意: the line, the fold, the squeeze, the tuck, the slack depth
const WP = G.add(INC.outer, G.sub(INC.inner, INC.outer), 0.5), UL = [0, -Math.cos(IN6.pitch * D2R6), -Math.sin(IN6.pitch * D2R6)], onL = a => G.add(WP, UL, a);
const A0 = (() => { let t = 0; for (;;) { const p = onL(-t); if (G.wallOf(p[2], Math.hypot(p[0], p[1])).d < 0) break; t += 0.01; } return X.HAP.rTie + t + 0.25; })();   // leading tie 0.25 mm outside
// a lens pose: centre O; heading psi of the lens axis d (deg; d points to the haptic tied to the 8 o'clock strand); pitch (deg, d below the frontal
// plane); optic fold (its width across d); the haptics' squeeze across d; compression of the trailing (k0) and the leading (k1) haptic (1 = free)
function lensPose(P) {
  const psi = P.psi * D2R6, pt = P.pt * D2R6, d0 = [Math.cos(psi), Math.sin(psi), 0], eb = [-Math.sin(psi), Math.cos(psi), 0];
  const d = G.add(d0.map(x => x * Math.cos(pt)), [0, 0, 1], -Math.sin(pt)), en = G.add([0, 0, Math.cos(pt)], d0, Math.sin(pt));
  const haps = [0, 1].map(j => { const ex = j === 0 ? d.map(x => -x) : d, ey = j === 0 ? eb.map(x => -x) : eb, k = j === 0 ? P.k0 : P.k1;
    return X.HAP.pts.map(p => { const r = Math.hypot(p[0], p[1]), r2 = r <= RO ? r : RO + (r - RO) * k, f = r > 1e-9 ? r2 / r : 1;
      return G.add(G.add(G.add(P.O, ex, p[0] * f), ey, p[1] * f * P.sq), en, Math.max(0, r2 - RO) * TN10); }); });
  const rim = []; for (let m = 0; m <= 48; m++) { const th = 2 * Math.PI * m / 48; rim.push(G.add(G.add(P.O, d, RO * Math.cos(th)), eb, RO * Math.sin(th) * P.fold)); }
  return { O: P.O, d, eb, en, fold: P.fold, haps, rim, ties: haps.map(H => H[TIE_I]) };
}
const LP = (O, psi, pt, fold, sq, k0, k1) => ({ O, psi, pt, fold, sq, k0, k1 });
// keyframes [u, pose]: 0 the 5-4 pose (psi 180 = HAP_OUT) → 0.1 turned → 0.2 folded and squeezed, at the wound → 0.5 along the line (a pure
// translation through the tunnel) → 0.6 the trailing haptic tucked → 0.68 onto the axis → 0.82 behind the iris, turned to 2–8 → 0.9 unfolded → 1 slack
const LK = [[0, LP(O_OUT, 180, 0, 1, 1, 1, 1)], [0.1, LP(O_OUT, 270, 0, 1, 1, 1, 1)], [0.2, LP(onL(-A0), 270, IN6.pitch, IN6.fold, IN6.sq, 1, 1)],
  [0.5, LP(onL(IN6.aB), 270, IN6.pitch, IN6.fold, IN6.sq, 1, 1)], [0.6, LP(onL(IN6.aB), 270, IN6.pitch, IN6.fold, IN6.sq, IN6.kTuck, 1)],
  [0.68, LP([0, 0, IN6.zC], 270, IN6.pitch, IN6.fold, IN6.sq, IN6.kTuck, 1)], [0.82, LP([0, 0, IN6.zSlack], 210, 0, IN6.fold, IN6.sq, IN6.kTuck, 1)],
  [0.9, LP([0, 0, IN6.zSlack], 210, 0, 1, 1, IN6.kTuck, 1)], [1, LP([0, 0, IN6.zSlack], 210, 0, 1, 1, 1, 1)]];
function lensAt(u) {
  let i = 1; while (i < LK.length - 1 && u > LK[i][0]) i++;
  const [ua, a] = LK[i - 1], [ub, b] = LK[i], t = ss(ua, ub, u), L = (x, y) => lerp(x, y, t);
  return lensPose(LP([0, 1, 2].map(m => L(a.O[m], b.O[m])), L(a.psi, b.psi), L(a.pt, b.pt), L(a.fold, b.fold), L(a.sq, b.sq), L(a.k0, b.k0), L(a.k1, b.k1)));
}
// slack → the model's fixed pose (pull 1 = X.iolOf of IN_ST(1)): the haptics flex first, then the lens rises to the sulcus
function pulledAt(pl) { const k = lerp(1, IOF.k, ss(0, 0.3, pl)); return lensPose(LP([0, 0, lerp(IN6.zSlack, IOF.O[2], ss(0.15, 1, pl))], 210, 0, 1, 1, k, k)); }
const U61 = 120, P61 = 16;   // quantised steps of the insertion and the pull (frames reused between steps)
window.LENS61_AT = { u: k => lensAt(k / U61), pull: k => pulledAt(k / P61), U61, P61 };
// each strand from its bed to its tie on the moving lens: out through the wound while the tie is outside, through the tunnel, around the pupil
// margin while the tie is in the chamber (the hooked route of 5-3; 示意), straight behind the iris once the tie is there (sagging inward when slack)
const STR0 = X.sutureOf(X.norm(CUT_ST)).segs.map(sg => sg.slice(0, 3)), HK = [0, 1].map(j => X.hookPts(PS0, j));
function strandsTo(ties, sag = 0) { return ties.map((T, j) => { const W = G.wallOf(T[2], Math.hypot(T[0], T[1])), r = Math.hypot(T[0], T[1]);
  if (W.d < 0) return [...STR0[j], ...HK[j], INC.inner, INC.outer, T];
  if (W.d <= G.T(W.s)) return [...STR0[j], ...HK[j], INC.inner, T];
  if (X.acTest(r, T[2])) return [...STR0[j], ...HK[j], T];
  const I = STR0[j][2], M = G.add(I, G.sub(T, I), 0.5); return [...STR0[j], G.add(M, G.unit([M[0], M[1], 0]), -sag), T]; }); }
// the moving lens on the microscope view: optic (narrow while folded, with its crease), haptics dashed where hidden, the two ties
function lensScope(v, L, op = 1) {
  const q = L.rim.map(p => v.Q(p)), c = v.Q([0, 0, 0]), behind = !X.acTest(Math.hypot(L.O[0], L.O[1]), L.O[2]) && G.wallOf(L.O[2], Math.hypot(L.O[0], L.O[1])).d > 0;
  let s = `<clipPath id="pup61"><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(X.IR.pr * v.k).toFixed(1)}"/></clipPath>`;
  s += `<g ${behind ? 'clip-path="url(#pup61)"' : ''}><path d="M${q.map(f1).join('L')}Z" fill="#fff6dc" opacity="0.55"/></g>` + polyScope(v, L.rim, 1.8, C.iolS);
  if (L.fold < 0.95) { const a = v.Q(G.add(L.O, L.d, -RO)), b = v.Q(G.add(L.O, L.d, RO)); s += `<path d="M${f1(a)}L${f1(b)}" stroke="${C.iolS}" stroke-width="1.4" stroke-dasharray="4 3"/>`; }
  for (const H of L.haps) s += polyScope(v, H, 2.0, C.hap);
  for (const t of L.ties) s += dot(v.Q(t), '#111827', 3.5);
  return `<g opacity="${op}">${s}</g>`;
}
// the lens in the 2–8 section (it lies in this plane once turned): the optic's cut (thickness profile), the haptics projected (dashed: out of the
// plane, as the model draws them), the ties
function lensSec(v, L, op = 1) {
  const top = [], bot = []; for (let m = 0; m <= 30; m++) { const x = -RO + 2 * RO * m / 30, h = X.optHalf(Math.abs(x)); top.push(v.Q(G.add(G.add(L.O, L.d, x), L.en, h))); bot.unshift(v.Q(G.add(G.add(L.O, L.d, x), L.en, -h))); }
  let s = ''; for (const H of L.haps) s += `<path d="M${H.map(p => f1(v.Q(p))).join('L')}" fill="none" stroke="${C.iolS}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>`;
  s += `<path d="M${[...top, ...bot].map(f1).join('L')}Z" fill="${C.iol}" stroke="${C.iolS}" stroke-width="1.2"/>`;
  for (const t of L.ties) s += dot(v.Q(t), '#111827', 3.5);
  return `<g opacity="${op}">${s}</g>`;
}
DRAW2['6-1'] = T => {
  const pre = T.st(0) - 0.3, d0 = T.en(0) - T.st(0);   // the segment's lead (segments.js) gives the insertion time before line 0
  const u = T.on(0, pre + 0.5 * d0, -pre), pull = T.p(0, 0.6, 0.92), k1 = T.on(1), k2 = T.on(2);
  const uq = Math.round(clamp01(u) * U61), pq = Math.round(clamp01(pull) * P61), L = pq > 0 ? pulledAt(pq / P61) : lensAt(uq / U61), strands = strandsTo(L.ties, 0.35 * (1 - pq / P61));
  const uu = uq / U61, kx = ss(0.8, 0.86, uu), win = (a, b, c, d) => ss(a, b, uu) * (1 - ss(c, d, uu));   // kx: the lens lies in the 2–8 plane (turned, behind the iris)
  window.LENS61 = { u: uq, pull: pq, O: L.O, d: L.d, eb: L.eb, en: L.en, fold: L.fold, haps: L.haps };
  // left: the 2–8 section: the strands follow the lens in (out of this plane: dashed); the lens appears once it is turned into this plane behind
  // the iris (the optic unfolds, the trailing haptic is let go: hanging slack); then both strands are pulled and the haptics come up to the sulcus under the fixation points: optic centred, not tilted
  const vA = sec(OPEN({}), W_IOL);
  let svg = vA.svg; for (const sg of strands) svg += strandSec(vA, sg);
  if (kx > 0) svg += lensSec(vA, L, kx);
  const kp = pull > 0 && pull < 1 ? 1 : 0, out2 = G.add(PS0.E2, G.unit(G.sub(PS0.E2, PS0.I2)), 1.6), out8 = G.add(PS0.E8, G.unit(G.sub(PS0.E8, PS0.I8)), 1.6);
  svg += arrowOut(vA, G.add(PS0.E2, G.unit(G.sub(PS0.E2, PS0.I2)), 0.4), out2, WARN, kp) + arrowOut(vA, G.add(PS0.E8, G.unit(G.sub(PS0.E8, PS0.I8)), 0.4), out8, WARN, kp);
  if (k2 > 0) { const top = [], bot = [], back = -0.7; for (let m = 0; m <= 30; m++) { const x = -RO + 2 * RO * m / 30, hth = X.optHalf(Math.abs(x)); top.push(vA.Q(G.add(G.add(IOF.O, IOF.d, x), IOF.en, back + hth))); bot.unshift(vA.Q(G.add(G.add(IOF.O, IOF.d, x), IOF.en, back - hth))); }
    svg += `<path d="M${[...top, ...bot].map(f1).join('L')}Z" fill="none" stroke="#7d8e9b" stroke-width="1.8" stroke-dasharray="6 4" opacity="${k2.toFixed(2)}"/>`;
    const a = vA.Q(G.add(IOF.O, IOF.en, back - 0.35)), b = vA.Q(G.add(IOF.O, IOF.en, -0.45)); svg += arrowPath([a, b], COL.accent, 2.4, k2.toFixed(2)); }
  let ex = tag('IOL 從 12 點切口放入：見右圖', T.on(0, 0.6, -pre) * (1 - kx), INK2, 30);
  if (kx > 0) { ex += labR('haptic 在虹膜後', '鬆的', 160, vA.Q(L.ties[1]), { bold: true, color: '#2f5f93', lc: '#2f5f93', op: kx * (1 - pull) });
    ex += labR('拉 2 點的線', '', 210, vA.Q(PS0.E2), { bold: true, color: WARN, lc: WARN, op: kp });
    ex += labL('拉 8 點的線', '', 210, vA.Q(PS0.E8), { bold: true, color: WARN, lc: WARN, op: kp });
    ex += labR('haptic 到睫狀溝 sulcus', '', 130, vA.Q(L.ties[0]), { bold: true, color: GRN, lc: GRN, op: ss(0.85, 1, pull) * (1 - k1) });
    ex += labL('optic 置中、不傾斜', '', 230, vA.Q(L.O), { bold: true, color: IOLC, lc: IOLC, op: ss(0.85, 1, pull) * (1 - k2) });
    ex += labL('縫在溝：較前', 'sulcus', 230, vA.Q(L.O), { bold: true, color: COL.accent, lc: COL.accent, op: k2 });
    ex += labR('囊袋內的位置', '比較、示意', 260, vA.Q(G.add(G.add(IOF.O, IOF.d, -2.2), IOF.en, -0.7 - 0.25)), { bold: true, color: '#56616d', lc: '#56616d', op: k2 }); }
  // line 1: vertical tilt in the UBM study (a gauge; the lens drawn tilted by the study's mean, the 5° line the threshold it quotes)
  if (k1 > 0) { const bx = 300, by = 238, bw = 292, bh = 160, cx = bx + bw / 2, cy = by + 96, R = 120, rot = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
    let g = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="#fff" stroke="#d3dae1"/>` + text(bx + 12, by + 24, '垂直傾斜 tilt（UBM，Zhao 2025）', { size: 14, bold: true, color: INK2 });
    g += `<path d="M${f1(rot(180, R))}L${f1(rot(0, R))}" stroke="#97a4b2" stroke-width="1.4" stroke-dasharray="4 4"/>`;
    g += `<path d="M${f1(rot(180 + 5, R))}L${f1(rot(5, R))}" stroke="${WARN}" stroke-width="2" stroke-dasharray="7 4"/>`;
    { const e = 3.13, a = rot(180 + e, R - 34), b = rot(e, R - 34); g += `<path d="M${f1(a)}L${f1(b)}" stroke="${IOLC}" stroke-width="12" stroke-linecap="round" opacity="0.8"/>`; }
    g += text(bx + bw - 12, by + 52, '> 5°：可能眩光、複視（引述）', { size: 13, bold: true, color: WARN, anchor: 'end' }) + text(bx + 12, by + bh - 12, '平均 3.13°', { size: 15, bold: true, color: IOLC });
    svg += `<g opacity="${(k1 * (1 - k2)).toFixed(2)}">${g}</g>`; }
  ex += sbar(vA, 2) + note('放入的方式與路線：示意', 1);
  if (pq >= P61) { sync('6-1', 'sec', 'tie2', L.ties[0]); sync('6-1', 'sec', 'tie8', L.ties[1]); sync('6-1', 'sec', 'iolC', L.O); }
  // right: the microscope view: the folded lens through the 12 o'clock wound, the leading haptic behind the iris, the trailing haptic tucked, the
  // lens turned to 2–8 behind the iris and let go; then pulled from slack to the sulcus; dashed = behind the iris
  const zw = qz(ss(0.15, 0.45, uq / U61), 24), wA = scope(OPEN({}), VIEWS.zwin(SC_54, SC_ALL, zw), 'sR');
  let rsvg = wA.svg; for (const [j, sg] of strands.entries()) rsvg += polyScope(wA, sg, 1.6, j ? S8C : S2C);
  rsvg += lensScope(wA, L) + arrowOut(wA, G.add(PS0.E2, G.unit(G.sub(PS0.E2, PS0.I2)), 0.4), out2, WARN, kp) + arrowOut(wA, G.add(PS0.E8, G.unit(G.sub(PS0.E8, PS0.I8)), 0.4), out8, WARN, kp);
  let rx = orientTag();
  rx += labR('12 點切口', '', 386, wA.Q(INC.outer), { bold: true, color: INK2, op: 1 - pull });
  rx += labL('摺疊後放入', '方式示意', 330, wA.Q(G.add(L.O, L.d, -1.5)), { bold: true, color: IOLC, lc: IOLC, op: win(0.1, 0.18, 0.42, 0.48) });
  rx += labR('前面的 haptic 先到虹膜後', '虛線', 96, wA.Q(L.haps[1][X.HAP.pts.length - 1]), { bold: true, color: '#2f5f93', lc: '#2f5f93', op: win(0.38, 0.44, 0.52, 0.56) });
  rx += labL('後面的 haptic 壓向 optic', '示意', 300, wA.Q(L.haps[0][TIE_I]), { bold: true, color: '#2f5f93', lc: '#2f5f93', op: win(0.52, 0.56, 0.68, 0.72) });
  rx += labR('轉到 2 點與 8 點', '虹膜後', 96, wA.Q(L.ties[1]), { bold: true, color: '#2f5f93', lc: '#2f5f93', op: win(0.72, 0.76, 0.98, 1.01) * (1 - clamp01(pull * 4)) });
  if (kx > 0) { rx += labR('拉 8 點的線', '', 130, wA.Q(out8), { bold: true, color: WARN, lc: WARN, op: kp });
    rx += labL('拉 2 點的線', '', 300, wA.Q(out2), { bold: true, color: WARN, lc: WARN, op: kp });
    rx += labR('optic 置中', 'centred', 230, wA.Q(L.O), { bold: true, color: IOLC, lc: IOLC, op: ss(0.85, 1, pull) });
    rx += labL('2 點綁線處', 'haptic', 230, wA.Q(L.ties[0]), { bold: true, color: GRN, lc: GRN, op: ss(0.85, 1, pull) });
    rx += labR('8 點綁線處', 'haptic', 130, wA.Q(L.ties[1]), { bold: true, color: GRN, lc: GRN, op: ss(0.85, 1, pull) * (1 - kp) }); }
  rx += note('虛線：在虹膜後面（看不到）', 1, 30) + note('度數依主治', k2);
  if (pq >= P61) { sync('6-1', 'scope', 'tie2', L.ties[0]); sync('6-1', 'scope', 'tie8', L.ties[1]); sync('6-1', 'scope', 'iolC', L.O); }
  return { L: { svg, extra: ex, P: IOL_SEC_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// ---------------------------------------------------------------- 7 打結、埋結與收尾
// The lens is in place (6-1); each strand's other end is fixed in its flap bed: at 2 o'clock the curved needle takes a bite in the bed and the
// strand is tied (推論 from the template's 「10-0 直彎針」); how the 8 o'clock end (the straight needle's end) is fixed is up to the attending: the
// model ties it the same way (示意). Then the flaps are closed over the knots and the conjunctiva over the flaps (8-0 Vicryl in Guedes 2026).
const FIN = o => OPEN({ ndl: { s2: SN.guedes, s8: SN.guedes, pass: 1, g27: 1, out: 1, taut: 1, hook: 1, cut: 1 }, iol: {}, ...o });
const K2 = X.knotOf(X.norm(FIN({ knot: 1 })), 0), K8 = X.knotOf(X.norm(FIN({ knot: 1 })), 1);
window.STATES['7-1'] = { end: FIN({ knot: 1, flap: { open: 0 }, peri: 0 }) };
const W_K = { x: 6.3, y: -10.35, w: 2.6 }, SC_K = swin(G.add(K2.biteA, G.sub(K2.biteB, K2.biteA), 0.5), 5.5);   // the 2 o'clock bed: section, microscope
DRAW2['7-1'] = T => {
  const kb = T.p(0, 0.12, 0.42), knot = T.p(0, 0.42, 0.48) > 0.5 ? 1 : 0, zi = T.p(0, 0.02, 0.12), zo = T.p(0, 0.6, 0.72), k8 = T.p(0, 0.7, 0.8);
  const fc = T.p(1, 0.08, 0.5), zs = T.p(1, 0, 0.2), pc = T.p(2, 0.05, 0.4), open = qz(1 - fc, 12), peri = qz(1 - pc, 8);
  const st = FIN({ knot, flap: { open }, peri });
  // left: the 2 o'clock bed magnified: the strand from the sulcus through the needle track into the bed; the curved needle's bite in the bed (it runs
  // across this plane: drawn as its projection), the knot; then the flap closes over the knot and the conjunctiva over the flap
  const v = sec(st, VIEWS.zwin(W_K, W_31, zs));
  let svg = v.svg;
  if (!knot && kb > 0) { const pts = []; for (let m = 0; m <= 16; m++) pts.push(G.add(K2.biteA, G.sub(K2.biteB, K2.biteA), m / 16)); svg += strandSec(v, partial3(pts, kb), { col: '#7a5418', w: 2.4 }); }
  let ex = labR('瓣床 flap bed', '', 376, v.Q(X.flapPt(HP, TH * 0.75, 0, FR)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.on(0) * (1 - zs) });
  ex += labL('針道 needle track', '', 300, v.Q(G.add(PS0.E2, G.sub(PS0.I2, PS0.E2), 0.5)), { color: INK2, op: T.on(0) * (1 - zs) });
  ex += labR('彎針在瓣床咬一針', '推論', 330, v.Q(G.add(K2.biteA, G.sub(K2.biteB, K2.biteA), 0.5)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.p(0, 0.12, 0.2) * (1 - knot) });
  ex += labR('線結 knot', '', 250, v.Q(K2.p), { bold: true, color: '#111827', lc: '#111827', op: knot * (1 - zs) });
  ex += labR('線結在瓣下', 'knot under the flap', 250, v.Q(K2.p), { bold: true, color: '#111827', lc: '#111827', op: T.p(1, 0.4, 0.55) * (1 - T.on(2)) });
  ex += labR('瓣蓋回 flap', '', 340, v.Q(X.flapPt(HP, TH * 0.7, 0, FR / 2)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.p(1, 0.4, 0.55) });
  ex += labL('結膜縫回 conjunctiva', '', 370, v.Q(G.P3(HP, sAt(3.2), -0.04)), { bold: true, color: '#b0505a', lc: '#b0505a', op: T.p(2, 0.3, 0.45) });
  ex += sbar(v, zs < 0.5 ? 0.5 : 1, 1) + note(T.on(2) > 0 ? '論文用 8-0 Vicryl；以主治為準' : '咬針的位置、線結大小：示意', 1);
  sync('7-1', 'sec', 'knot2', K2.p);
  // right: the microscope view: in on the 2 o'clock bed (the curved needle's bite, the knot), out to both sites (the 8 o'clock end: 依主治, drawn
  // the same way), then both flaps close (the knots show through faintly) and the conjunctiva is closed over them
  const w = scope(st, VIEWS.zwin(VIEWS.zwin(SC_ALL, SC_K, zi), SC_ALL, zo), 'sR');
  let rsvg = w.svg;
  if (!knot && kb > 0) { const a = w.Q(K2.biteA), b = w.Q(K2.biteB), nn = [-(b[1] - a[1]), b[0] - a[0]], l = Math.hypot(...nn) || 1, m = [(a[0] + b[0]) / 2 + nn[0] / l * 0.35 * w.k, (a[1] + b[1]) / 2 + nn[1] / l * 0.35 * w.k];
    const tip = [lerp(lerp(a[0], m[0], kb), lerp(m[0], b[0], kb), kb), lerp(lerp(a[1], m[1], kb), lerp(m[1], b[1], kb), kb)];
    rsvg += `<path d="M${f1(a)}Q${f1(m)} ${f1(b)}" fill="none" stroke="#7a5418" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>` + `<path d="M${f1(a)}Q${f1(m)} ${f1(tip)}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M${f1(a)}Q${f1(m)} ${f1(tip)}" fill="none" stroke="#56616d" stroke-width="4" stroke-linecap="round"/>`; }
  let rx = orientTag();
  rx += labL('2 點：彎針咬一針', '推論', 280, w.Q(G.add(K2.biteA, G.sub(K2.biteB, K2.biteA), 0.5)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.p(0, 0.1, 0.18) * (1 - zo) });
  if (w.A.knot2) rx += labR('打結 knot', '', 150, w.A.knot2, { bold: true, color: '#111827', lc: '#111827', op: knot * (1 - zo) });
  if (w.A.knot8) rx += labL('8 點那頭：依主治', '畫成同樣打結（示意）', 60, w.A.knot8, { bold: true, color: WARN, lc: WARN, op: k8 * (1 - T.on(1)) });
  if (w.A.knot2) rx += labL('線結在瓣下', '隱約', 330, w.A.knot2, { bold: true, color: '#111827', lc: '#111827', op: T.p(1, 0.45, 0.6) * (1 - T.on(2)) });
  rx += labR('瓣蓋回', 'flap', 130, w.A.flap8 || w.Q(G.P3(8, sAt(1.5), 0)), { bold: true, color: '#7a5418', lc: '#7a5418', op: T.p(1, 0.45, 0.6) * (1 - T.on(2)) });
  rx += labR('結膜縫回', '8-0 Vicryl（論文）', 300, w.Q(G.P3(HP, sAt(3.4), 0)), { bold: true, color: '#b0505a', lc: '#b0505a', op: T.p(2, 0.3, 0.45) });
  rx += note('點藥、包眼：不畫（範本照錄）', T.on(2), 30);
  sync('7-1', 'scope', 'knot2', K2.p);
  return { L: { svg, extra: ex, P: ZOOM_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};
// the first fraction k of a 3D polyline (by length)
function partial3(pts, k) { const L = pts.slice(1).reduce((a, q, i) => a + G.len(G.sub(q, pts[i])), 0); let left = L * clamp01(k); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const l = G.len(G.sub(pts[i], pts[i - 1])); out.push(l <= left ? pts[i] : G.add(pts[i - 1], G.sub(pts[i], pts[i - 1]), left / l)); left -= l; } return out; }

// ---------------------------------------------------------------- 8 會出錯的地方
// error states of the same model after surgery (flaps closed; the conjunctiva left open so the flaps and the caliper dots show); amounts 示意
const ERRB = o => S({ vit: 1, peri: 1, marks: 1, inc: 1, flap: { open: 0 }, ...o });
const FIX8 = ERRB({ ndl: {}, iol: {}, knot: 1 }), ASYM8 = s8 => ERRB({ ndl: { s8 }, iol: {}, knot: 1 });
const SLIP8 = ERRB({ iol: { slip: 8 } });                                                 // the 8 o'clock haptic out of its knot (no ndl: draw.js draws the strands)
const IOFX = X.iolOf(X.norm(FIX8)), IOSL = X.iolOf(X.norm(SLIP8)), STRFX = X.sutureOf(X.norm(FIX8)).segs;   // the fixed lens and its two strands (bed → tie)
const K8F = X.knotOf(X.norm(FIX8), 1), K2F = X.knotOf(X.norm(FIX8), 0);
window.STATES['8-1'] = { sym: FIX8, asym: ASYM8(2), slip: SLIP8 };
const STR_K = '#1f2a44';
// the strands of the fixed lens over a view; the slipped side keeps its knot (an empty loop) where the haptic was tied
function slipStrands(v, sec, o = {}) { let s = '';
  const strands = o.only2 ? [STRFX[0]] : STRFX;
  for (const sg of strands) s += sec ? strandSec(v, sg, { w: 2 }) : polyScope(v, sg, 1.6, STR_K);
  if (!o.only2) { const c = v.Q(IOFX.ties[1]), r = Math.max(5, 0.16 * v.k); s += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#fff" stroke-width="4"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${STR_K}" stroke-width="2"/>`; }
  for (const K of o.only2 ? [K2F] : [K2F, K8F]) s += dot(v.Q(K.p), '#111827', 3.2, sec ? 1 : 0.45);
  return s; }
DRAW2['8-1'] = T => {
  const ka = T.p(0, 0.05, 0.32), s8 = 1 + qz(ka, 6), asym = ASYM8(s8), k1 = T.on(1), sl = T.p(1, 0, 0.15), lo = 1 - ss(0, 0.45, sl), li = ss(0.55, 1, sl);   // labels: the old leave before the new come
  // left: the 2–8 section: the 8 o'clock entry moves back (the same needle angle) → the lens tilts (Zhao 2025: asymmetry predicts tilt; amount 示意);
  // then the 8 o'clock haptic slips out of its knot (the knot stays on the suture; Kokame 2018 quoting another report)
  const vA = sec(asym, W_IOL), vB = sl > 0 ? secD(SLIP8, W_IOL, { drop: 8 }) : null, A = vA.A;
  let svg = sl <= 0 ? vA.svg : sl >= 1 ? vB.svg : vA.svg + `<g opacity="${sl.toFixed(2)}">${vB.svg}</g>`;
  if (sl > 0) svg += `<g opacity="${sl.toFixed(2)}">${slipStrands(vB, true)}</g>`;
  if (A.iolC && sl < 1) { const a = vA.Q(G.add(IOFX.O, IOFX.d, -X.HAP.Ro - 1.0)), b = vA.Q(G.add(IOFX.O, IOFX.d, X.HAP.Ro + 1.0)); svg += `<path d="M${f1(a)}L${f1(b)}" stroke="#5b6878" stroke-width="1.6" stroke-dasharray="6 5" opacity="${(ka * (1 - sl)).toFixed(2)}"/>`; }
  let ex = tag('兩點對稱 → 置中、不傾斜', T.on(0) * (1 - ka), GRN, 30) + tag('兩點不對稱 → 傾斜（量：示意）', ka * lo, WARN, 30) + tag('haptic 從線結滑出（示意）', li, WARN, 30);
  ex += labR('2 點進針點', '', 80, A.E2, { bold: true, color: PUR, lc: PUR, op: T.on(0) * lo });
  ex += labR('8 點進針點較後', '', 110, A.E8, { bold: true, color: WARN, lc: WARN, op: ka * lo });
  ex += labL('傾斜 tilt', '', 250, A.iolC, { bold: true, color: WARN, lc: WARN, op: ka * lo });
  ex += labR('原本的平面', '', 230, vA.Q(G.add(IOFX.O, IOFX.d, -X.HAP.Ro - 0.9)), { color: '#5b6878', op: ka * lo });
  if (vB) { ex += labL('線結還在', 'knot', 80, vB.Q(IOFX.ties[1]), { bold: true, color: STR_K, lc: STR_K, op: li });
    ex += labL('haptic 掉下', 'slipped', 300, vB.Q(IOSL.ties[1]), { bold: true, color: WARN, lc: WARN, op: li });
    ex += labR('IOL 偏位、傾斜', '量示意', 300, vB.A.iolC, { bold: true, color: WARN, lc: WARN, op: li }); }
  ex += sbar(vA, 2) + note('模型示意', 1);
  // right: the microscope view: the caliper dots, 8 o'clock farther back; then the slipped lens (decentred; the fallen haptic dashed)
  const wA = scope(asym, SC_ALL, 'sR'), wB = sl > 0 ? scopeD(SLIP8, SC_ALL, 'sR2', { drop: 8 }) : null;
  let rsvg = sl <= 0 ? wA.svg : sl >= 1 ? wB.svg : wA.svg + `<g opacity="${sl.toFixed(2)}">${wB.svg}</g>`;
  if (sl > 0) rsvg += `<g opacity="${sl.toFixed(2)}">${slipStrands(wB, false)}</g>`;
  let rx = orientTag();
  rx += labL('2 點的點', '', 330, wA.A.dot2, { bold: true, color: PUR, lc: PUR, op: T.on(0) * lo });
  rx += labR('8 點的點較後', 'marking pen', 60, wA.A.dot8, { bold: true, color: WARN, lc: WARN, op: ka * lo });
  if (wB) { rx += labR('optic 偏位', 'decentred', 230, wB.A.iolC, { bold: true, color: WARN, lc: WARN, op: li });
    rx += labR('haptic 掉下', '虛線', 96, wB.A.hapTip1, { bold: true, color: WARN, lc: WARN, op: li }); }
  rx += note('虛線：在虹膜後面（看不到）', 1, 30);
  return { L: { svg, extra: ex, P: SEC_T }, R: { svg: rsvg, extra: rx, P: SCOPE_T } };
};

// an evidence card (right panel of 8-2 to 8-4): blocks of [heading, rows [text, bold, colour]], each block with its own opacity
function evCard(blocks, o = {}) { let y = o.y0 || 34, s = `<rect width="${PW}" height="${PH}" fill="#fff"/>`;
  for (const b of blocks) { const op = (+b.op).toFixed(2); s += `<g opacity="${op}">`;
    if (b.head) { s += text(16, y, b.head, { size: 17, bold: true, color: b.col || COL.accent }); y += 30; }
    for (const r of b.rows) { s += text(28, y, r[0], { size: r[3] || 15.5, bold: r[1], color: r[2] || COL.ink }); y += r[4] || 25; }
    s += `</g>`; y += b.gap ?? 14; }
  return s; }
const EVID_T = { title: '文獻怎麼說', orient: '數字照論文' };
window.PRELOAD_EXTRA += JSON.stringify([EVID_T, IOL_SEC_T]);

DRAW2['8-2'] = T => {
  const ke = T.p(0, 0.1, 0.55), kp = T.p(0, 0.5, 0.62), k1 = T.on(1), sw = T.p(1, 0, 0.12), lo = 1 - ss(0, 0.45, sw), li = ss(0.55, 1, sw);
  // left, line 0: the 2 o'clock site magnified, the flap and the conjunctiva closed over the knot; the knot wears through both (erosion; 示意)
  // line 1: the 2–8 section: the 8 o'clock strand breaks late; that haptic and the lens drop (示意)
  let svg, ex = '';
  if (sw < 1) { const v = sec(ERRB({ ndl: {}, iol: {}, knot: 1, peri: 0 }), W_31), n = G.N3(K2F.h, K2F.s), top = G.add(G.P3(K2F.h, K2F.s, 0), n, 0.3);
    svg = v.svg; const a = v.Q(K2F.p), b = v.Q(G.add(K2F.p, G.sub(top, K2F.p), ke));
    svg += `<g opacity="${(1 - sw).toFixed(2)}"><path d="M${f1(a)}L${f1(b)}" stroke="${WARN}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>` + (kp > 0 ? dot(v.Q(G.add(G.P3(K2F.h, K2F.s, 0), n, 0.08)), '#111827', 6, kp) + ring2(v.Q(G.add(G.P3(K2F.h, K2F.s, 0), n, 0.08)), WARN, 12, kp) : '') + `</g>`;
    ex += labL('線結（瓣下）', 'knot', 250, a, { bold: true, color: '#111827', lc: '#111827', op: T.on(0) * (1 - ke) * lo });
    ex += labR('磨穿瓣與結膜', 'erosion（示意）', 300, v.Q(G.add(K2F.p, G.sub(top, K2F.p), 0.55)), { bold: true, color: WARN, lc: WARN, op: T.p(0, 0.2, 0.3) * lo });
    ex += labL('線結外露', 'exposed', 220, v.Q(G.add(G.P3(K2F.h, K2F.s, 0), n, 0.08)), { bold: true, color: WARN, lc: WARN, op: kp * lo });
    ex += labR('結膜 conjunctiva', '', 360, v.Q(G.P3(HP, sAt(2.8), -0.04)), { color: '#b0505a', lc: '#b0505a', op: T.on(0) * lo });
    ex += sbar(v, 1, 1 - sw); svg = `<g opacity="${(1 - sw).toFixed(2)}">${svg}</g>`; }
  if (sw > 0) { const v = secD(SLIP8, W_IOL), I8 = PS0.I8, cutA = G.add(I8, G.sub(IOFX.ties[1], I8), 0.0), tieS = IOSL.ties[1];
    let s2 = v.svg + strandSec(v, STRFX[0], { w: 2 }) + strandSec(v, [...STRFX[1].slice(0, STRFX[1].length - 1), G.add(I8, G.unit(G.sub(tieS, I8)), 0.45)], { w: 2 }) + strandSec(v, [tieS, G.add(tieS, G.unit(G.sub(I8, tieS)), 0.45)], { w: 2 });
    for (const K of [K2F, K8F]) s2 += dot(v.Q(K.p), '#111827', 3.2);
    const brk = v.Q(G.add(I8, G.sub(tieS, I8), 0.5)); s2 += `<g stroke="${WARN}" stroke-width="3" stroke-linecap="round"><path d="M${f1([brk[0] - 7, brk[1] - 7])}L${f1([brk[0] + 7, brk[1] + 7])}M${f1([brk[0] - 7, brk[1] + 7])}L${f1([brk[0] + 7, brk[1] - 7])}"/></g>`;
    svg = (svg || '') + `<g opacity="${sw.toFixed(2)}">${s2}</g>`;
    ex += labL('8 點的線斷了', '示意', 60, brk, { bold: true, color: WARN, lc: WARN, op: li });
    ex += labR('IOL 往斷的那邊掉', '示意', 300, v.A.iolC, { bold: true, color: WARN, lc: WARN, op: li });
    ex += sbar(v, 2, sw); }
  ex += note('模型示意', 1);
  // right: the numbers of the studies (design and follow-up as in the papers)
  const o = evCard([{ head: '線結磨出 erosion', op: T.on(0), rows: [['Van Meter 1997（26 例）', true, COL.sub, 15], ['結埋在部分厚度瓣下：0%', false, COL.ink, 17, 32], ['Solomon 1993（30 眼）', true, COL.sub, 15], ['穿過半厚瓣：73%', false, WARN, 17, 32]] },
    { head: '晚期斷線　10-0 Prolene', op: k1, rows: [['Vote 2006（61 眼，平均追蹤 6 年）', true, COL.sub, 15], ['平均約術後 4 年斷、年輕人多', false, WARN, 17, 32], ['Kokame 2018（118 眼，平均追蹤 6.0 年）', true, COL.sub, 15], ['214 條線只斷 1 條', false, COL.ink, 17, 32]] }]);
  return { L: { svg, extra: ex, P: sw > 0.5 ? SEC_T : ZOOM_T }, R: { svg: o, extra: '', P: EVID_T } };
};

// 8-3: where the retinal and other complications are (示意 places) on the 2–8 section; the posterior pole is outside the model's range (arrow)
const W_83 = { x: -12, y: -13.6, w: 24 }, N0 = G.N;
DRAW2['8-3'] = T => {
  const k0 = T.p(0, 0.05, 0.3), k1 = T.p(0, 0.55, 0.8);
  const v = sec(FIX8, W_83);
  let svg = v.svg;
  // a retinal tear behind the ora at 8 o'clock and the detachment behind it (lifted retina; 示意); a haze of blood in the vitreous (示意)
  const rp = (s, lift) => { const f = G.surfAt(s), d = G.T(s) + 0.3 + lift; return v.Q(G.P3(8, s, d)); };
  { const pts = []; for (let m = 0; m <= 24; m++) { const s = N0.ora + 1.3 + 6.5 * m / 24, l = 1.3 * Math.sin(Math.PI * m / 24) ** 0.7; pts.push(rp(s, l)); }
    svg += `<g opacity="${k0.toFixed(2)}"><path d="M${pts.map(f1).join('L')}" fill="none" stroke="#fff" stroke-width="7"/><path d="M${pts.map(f1).join('L')}" fill="none" stroke="#c4553d" stroke-width="3.5"/>${ring2(rp(N0.ora + 1.2, 0), WARN, 9)}</g>`; }
  { const c = v.Q([-2.6, -1.5, 3.2]), r = 2.4 * v.k; svg += `<g opacity="${(0.55 * k1).toFixed(2)}"><ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${(r * 1.3).toFixed(1)}" ry="${r.toFixed(1)}" fill="#b3262c" opacity="0.35"/><ellipse cx="${(c[0] + 18).toFixed(1)}" cy="${(c[1] + 10).toFixed(1)}" rx="${(r * 0.7).toFixed(1)}" ry="${(r * 0.5).toFixed(1)}" fill="#8e1b20" opacity="0.35"/></g>`; }
  let ex = labL('術中裂孔', 'retinal tear', 210, rp(N0.ora + 1.2, 0), { bold: true, color: WARN, lc: WARN, op: k0 });
  ex += labL('視網膜剝離', 'RD', 300, rp(N0.ora + 4.5, 1.1), { bold: true, color: '#c4553d', lc: '#c4553d', op: k0 });
  ex += labR('玻璃體出血', 'VH', 330, v.Q([-2.6, -1.5, 3.2]), { bold: true, color: '#8e1b20', lc: '#8e1b20', op: k1 });
  ex += labR('眼壓', 'IOP', 60, v.Q([0, 0, 11.2]), { bold: true, color: '#1f6f9e', lc: '#1f6f9e', op: k1 });
  { const a = [PW / 2, PH - 64], b = [PW / 2, PH - 24]; ex += `<g opacity="${k1.toFixed(2)}">${arrowPath([a, b], '#7a5418', 2.4)}</g>` + htext(PW / 2 + 14, PH - 40, '黃斑在後極：黃斑水腫 CME（不在這張圖）', { size: 15, bold: true, color: '#7a5418', op: k1 }); }
  ex += sbar(v, 2) + note('位置：示意', 1, 30);
  const o = evCard([{ head: 'Kaufmann 2024', op: k0, rows: [['回溯 561 位成人：二次植入 IOL＋PPV', true, COL.sub, 15], ['術中裂孔：7.3%', false, WARN, 18, 32], ['縫合固定術後視網膜剝離：5.1%', false, WARN, 18, 36]] },
    { head: 'Stem 2017（回顧）', op: k1, rows: [['也要追：眼壓、黃斑水腫 CME、玻璃體出血', false, COL.ink, 17, 32]] }], { y0: 40 });
  return { L: { svg, extra: ex, P: SEC_T }, R: { svg: o, extra: '', P: EVID_T } };
};

// 8-4: the closest causes in the literature, as error states of the model side by side (示意): ① the haptic slipped out of its knot, ② only one
// side sutured, the other slipping off a capsule remnant (示意 remnant), ③ loose suture + asymmetric fixation. None is about early redislocation;
// the cause in this case is not inferred (spec).
const ONE8 = ERRB({ iol: { slip: 8 } }), LOOSE8 = ERRB({ ndl: { s8: 2 }, iol: { ten: [1, 0.4] }, knot: 1 });
window.STATES['8-4'] = { slip: SLIP8, one: ONE8, loose: LOOSE8 };
const W_STRIP = { x: -8.8, y: -10.2, w: 17.6 };
DRAW2['8-4'] = T => {
  const k0 = T.on(0), ks = [T.p(1, 0, 0.12), T.p(1, 0.3, 0.42), T.p(1, 0.62, 0.74)], k2 = T.on(2);
  const sh = 128, sw = PW - 16, rows = [['① haptic 從線結滑出（線結還在）', SLIP8, 'slip'], ['② 只縫一邊：另一邊從殘留囊滑走', ONE8, 'one'], ['③ 縫線鬆＋兩邊不對稱', LOOSE8, 'loose']];
  let o = `<rect width="${PW}" height="${PH}" fill="#fff"/>`, ex = '';
  rows.forEach(([title, st, kind], i) => { const y = 8 + i * (sh + 7), op = ks[i];
    const v = kind === 'loose' ? sec(st, W_STRIP, { W: sw, H: sh }) : secD(st, W_STRIP, { W: sw, H: sh, drop: 8 });
    let g = v.svg;
    if (kind === 'slip') g += slipStrands(v, true); else if (kind === 'one') g += slipStrands(v, true, { only2: true });
    if (kind === 'one') { const c = PS0.I8, pts = []; for (let m = 0; m <= 12; m++) { const t = m / 12; pts.push(v.Q(G.add(G.add(c, G.unit([c[0], c[1], 0]), 0.2 - 1.6 * t), [0, 0, 1], -0.55 - 0.25 * Math.sin(Math.PI * t)))); }
      g += `<path d="M${pts.map(f1).join('L')}" fill="none" stroke="#fff" stroke-width="6"/><path d="M${pts.map(f1).join('L')}" fill="none" stroke="#8a97a3" stroke-width="3" stroke-dasharray="6 3"/>`; }
    o += `<g opacity="${op.toFixed(2)}"><svg x="8" y="${y}" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}" overflow="hidden">${g}</svg><rect x="8" y="${y}" width="${sw}" height="${sh}" rx="6" fill="none" stroke="#d3dae1"/>` +
      htext(18, y + 22, title, { size: 15, bold: true, color: WARN }) + `</g>`;
    const at = q => [8 + q[0], y + q[1]];
    if (kind === 'slip') ex += labNear('haptic 掉下', 'slipped', at(v.Q(IOSL.haps[1][Math.round(X.HAP.pts.length * 0.7)])), 14, -36, { bold: true, color: WARN, lc: WARN, op });
    if (kind === 'one') ex += labNear('殘留囊', '示意', at(v.Q(G.add(G.add(PS0.I8, G.unit([PS0.I8[0], PS0.I8[1], 0]), -0.6), [0, 0, 1], -0.75))), 20, 30, { bold: true, color: '#56616d', lc: '#56616d', op });
    if (kind === 'loose') ex += labNear('鬆的那邊下垂', '示意', at(v.A.tie8 || v.A.iolC), 20, 30, { bold: true, color: WARN, lc: WARN, op }); });
  o += boxAt(40, PH / 2 - 30, PW - 80, 60, '縫回後很快再脫位的專門研究：查不到', k0 * (1 - ks[0]), INK2, 19);
  // right: what each source actually reports (none is about early redislocation; this case is not inferred)
  const c = evCard([{ head: '最接近的資料（都不是早期再脫位的研究）', op: k0, col: INK2, gap: 0, rows: [] }, { op: ks[0], rows: [['① Kokame 2018 引述的報告：', true, COL.sub, 15], ['線結還在、haptic 卻滑出來', false, COL.ink, 17, 32]] },
    { op: ks[1], gap: 6, rows: [['② Kokame 2018 自己的病例：', true, COL.sub, 15], ['只縫一邊，另一邊從殘留囊上滑走', false, COL.ink, 17, 32]] },
    { op: ks[2], rows: [['③ Hudde 1996（UBM）：', true, COL.sub, 15], ['縫線鬆＋兩個 haptic 原本不對稱 → 輕度移位', false, COL.ink, 17, 32]] }], { y0: 36 });
  const fin = boxAt(16, PH - 106, PW - 32, 42, '都沒有直接連到早期再脫位', k2, WARN, 18) + boxAt(16, PH - 56, PW - 32, 42, '本例的原因：影片不推測', k2, INK2, 18);
  return { L: { svg: o, extra: ex, P: { title: '模型的錯誤狀態並排（示意）', orient: '經 2 點與 8 點　右＝2 點　量：示意' } }, R: { svg: c + fin, extra: '', P: EVID_T } };
};

// ---------------------------------------------------------------- 9 跟刀清單 (full width)
DRAW2['9-1'] = T => {
  const k0 = T.on(0), k2 = T.on(2), kr = i => T.on(1, 0.5, 0.75 * i);
  let o = `<rect width="${FW}" height="${PH}" fill="#fff"/>`;
  const col = (x, w, title, c, op) => `<g opacity="${(+op).toFixed(2)}"><rect x="${x}" y="12" width="${w}" height="${PH - 24}" rx="10" fill="#f7f9fa" stroke="${c}" stroke-width="1.6"/>${text(x + 16, 44, title, { size: 19, bold: true, color: c })}</g>`;
  // column 1: what the scheduling sheet lists
  o += col(16, 340, '備品（排程單）', COL.accent, k0);
  [['10-0 直彎針', '推測：雙頭針'], ['11 號刀片', ''], ['圓刀', '用途依主治'], ['marking pen', ''], ['量尺', '']].forEach(([a, b], i) => {
    o += `<g opacity="${k0.toFixed(2)}">` + text(36, 88 + i * 52, '□ ' + a, { size: 18, bold: true }) + (b ? text(56, 110 + i * 52, b, { size: 14, color: i === 2 ? WARN : COL.sub, bold: i === 2 }) : '') + `</g>`; });
  // column 2: each step: what to watch (the narration's six points), with what the template or the papers hand over
  o += col(372, 520, '跟刀時盯哪裡', '#2463eb', T.on(1));
  [['量位置', '量尺零點抵哪一條線', '量尺、marking pen（用法推測）'], ['記號', '兩點正對面（文獻：2 點與 8 點）', ''], ['穿線', '兩支針在瞳孔後會合', '直彎針＋胰島素空針（文獻）'],
   ['綁 haptic', '線綁的位置（文獻：遠端三分之一）', ''], ['放 IOL', 'optic 置中、不傾斜', ''], ['收尾', '線結埋好在瓣下', '彎針咬一針（推論）']].forEach(([st, look, give], i) => {
    const y = 84 + i * 48, op = kr(i);
    o += `<g opacity="${op.toFixed(2)}">` + text(392, y, st, { size: 16, bold: true, color: '#2463eb' }) + text(482, y, look, { size: 17, bold: true }) + (give ? text(482, y + 21, '遞：' + give, { size: 13.5, color: COL.sub }) : '') + `</g>`; });
  o += `<g opacity="${T.on(1).toFixed(2)}">` + text(392, PH - 26, '誰遞哪支、誰接針：以主治為準', { size: 15, bold: true, color: WARN }) + `</g>`;
  // column 3: after surgery
  o += col(908, 306, '術後追', '#7a3b1e', k2);
  [['IOL 位置與傾斜', '文獻用 UBM 量'], ['眼壓', ''], ['視網膜', '裂孔、剝離'], ['線結外露', '結膜有沒有磨穿']].forEach(([a, b], i) => {
    o += `<g opacity="${k2.toFixed(2)}">` + text(928, 88 + i * 58, '□ ' + a, { size: 18, bold: true }) + (b ? text(948, 110 + i * 58, b, { size: 14, color: COL.sub }) : '') + `</g>`; });
  return { F: { svg: o, extra: '', P: TXT_T('跟刀清單：備品、每一步盯哪裡、術後追什麼') } };
};
