// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the upper-lid model at rest (videos/models/eyelid: lid.js, coronal.js): the sagittal
// section through the pupil centre (left, mechanism) and the surgeon's front view of the right eye (right), the same moment.
// The lesion, excision line, wound, needle, shield, probe and ice ball are this video's overlays (geo.js, sizes in params.js WART;
// all 示意, as on the print sheets); geo.js is shared with ../check.js, so the drawn geometry is the checked geometry.
// ============================================================================
const DRAW2 = {};
const GEO = makeGeo(WART);
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width (height from the panel)
const SAGW = { x: -21.2, y: -12.4, w: 17.5 }, SAG12 = { x: -19.6, y: -11.2, w: 13.5 };
const SAGM = { x: GEO.F.E[0] - 4.4, y: GEO.F.E[1] - 3.5, w: 9 };
const CORW = { x: -14, y: -16, w: 28 }, CORM = { x: -6.5, y: -9.6, w: 13 };
const SAG_P = { title: '矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const ZS_P = { title: '上瞼緣放大（矢狀切面）', orient: '左＝前　上＝上' };
const COR_P = { title: '術者視角　右眼 OD（正面）', orient: '面對病人：左＝temporal　右＝nasal' };
const CZ_P = { title: '術者視角：上瞼緣特寫　右眼 OD', orient: '面對病人：左＝temporal　右＝nasal' };
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, ZS_P, COR_P, CZ_P]);

// ---------------------------------------------------------------- overlay styles (panel px)
const F1 = v => v.toFixed(1);
const pathOf = q => 'M' + q.map(p => F1(p[0]) + ' ' + F1(p[1])).join('L');
const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.4) => `<path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const OV = {
  lesion: (v, P, op = 1) => `<path d="${pathOf(P.map(v.P))}Z" fill="#a48a73" stroke="#5d4532" stroke-width="1.6" opacity="${op}"/>`,
  wound: (v, P, op = 1) => `<path d="${pathOf(P.map(v.P))}Z" fill="#e39a8f" stroke="#b8645a" stroke-width="1" opacity="${op}"/>`,
  ice: (v, P, op = 1) => `<path d="${pathOf(P.map(v.P))}Z" fill="#cfeaf8" fill-opacity="0.75" stroke="#2f86c0" stroke-width="2" stroke-dasharray="6 4" opacity="${op}"/>`,
  frozen: (v, P, op = 1) => curve(P.map(v.P), '#2f86c0', 2, op, '2 5'),
  probe: (v, P, op = 1) => `<path d="${pathOf(P.map(v.P))}Z" fill="#aab4be" stroke="#3d4852" stroke-width="1.4" opacity="${op}"/>`,
  tip: (v, c, op = 1) => { const p = v.P(c); return `<g opacity="${op}"><circle cx="${F1(p[0])}" cy="${F1(p[1])}" r="${F1(0.55 * v.k)}" fill="#aab4be" stroke="#3d4852" stroke-width="1.4"/><circle cx="${F1(p[0])}" cy="${F1(p[1])}" r="${F1(0.22 * v.k)}" fill="#e6ebef"/></g>`; },
  needle: (v, a, b, op = 1) => { a = v.P(a); b = v.P(b); const d = `M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}`;
    return `<g opacity="${op}"><path d="${d}" stroke="#2f3a44" stroke-width="6" stroke-linecap="round"/><path d="${d}" stroke="#aeb8c2" stroke-width="2.8" stroke-linecap="round"/></g>`; },
  shield: (v, P, op = 1) => `<g opacity="${op}">${curve(P.map(v.P), '#3d4852', 9)}${curve(P.map(v.P), '#9fb3c4', 6)}</g>`,
  shieldC: (v, op = 1) => `<path d="${pathOf(GEO.COR.circ([0, 0.4], 6.6).map(v.P))}Z" fill="#9fb3c4" fill-opacity="0.38" stroke="#3d4852" stroke-width="2" stroke-dasharray="8 5" opacity="${op}"/>`,
};
// the specimen: the lesion moved off the skin along the outward normal (mm)
const specimen = d => { const n = GEO.nrm(GEO.qc); return GEO.lesion.map(p => [p[0] + n[0] * d, p[1] + n[1] * d]); };
const lesTop = (q, h) => GEO.add(GEO.S(q), GEO.nrm(q), h);
const domeIn = (q, r) => GEO.add(GEO.S(q), GEO.nrm(q), -r * 0.92);     // a point inside the ice ball, toward the depth
// part of a closed outline (marking / cutting as it is drawn)
const partial = (P, k) => P.slice(0, Math.max(2, Math.round(P.length * Math.min(1, k))));
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink, op: ro.op ?? 1 }); });
  return s + `</g>`;
}
const followAt = (v, k) => v.P(mixP(GEO.F.E, GEO.F.B, k));                // a point on the follicle (0 = lash exit, 1 = bulb)

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VIEWS.cor({}, PW, PH, CORW, 'tR'), C = GEO.COR;
  let svg = cv.svg + OV.lesion(cv, C.blob(C.c, C.r)) + `<path d="${pathOf(C.circ(C.cM, C.rM + 0.25).map(cv.P))}Z" fill="none" stroke="${COL.purple}" stroke-width="2.4" stroke-dasharray="6 4"/>`;
  let ex = lab('皮膚面的病灶（示意）', 'skin surface', 14, 64, cv.P([C.c[0] - C.r * 0.75, C.c[1] - C.r * 0.75]), { color: COL.amber, bold: true });
  ex += lab('或長在瞼緣（示意）', 'lid margin', PW - 12, 150, cv.P([C.cM[0] + C.rM + 0.25, C.cM[1]]), { side: 'R', color: COL.purple, bold: true });
  ex += note('位置與大小：門診紀錄沒寫，畫面為示意', 1, PH - 14);
  return { R: { svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1-1'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), A = sv.A, cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const o34 = T.on(3, 0.6);
  let ex = lab('臨床：像 wart（示意）', 'clinical', 14, 120, sv.P(lesTop(GEO.qc, WART.h)), { color: COL.amber, bold: true, op: 1 - o34 });
  ex += lab('病理才能確認', 'histology', 14, 120, sv.P(lesTop(GEO.qc, WART.h)), { color: COL.red, bold: true, op: o34 });
  ex += lab('眼輪匝肌', 'orbicularis', PW - 12, 52, sv.P(GEO.S(GEO.qc + 3.2, 0.62)), { side: 'R' });
  ex += lab('睫毛', 'lashes', 14, 290, A.lash);
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, A.cornea, { side: 'R' });
  let rx = lab('病灶（示意）', 'lesion', 14, PH - 64, cv.P([C.c[0] - C.r * 0.8, C.c[1] + C.r * 0.6]), { color: COL.amber, bold: true });
  const o1 = T.on(1, 0.5), o2 = T.on(2, 0.5), b = ss(T.st(1) + 0.6, T.st(1) + 1.8, T.u);
  rx += `<g opacity="${o1}"><rect x="12" y="10" width="582" height="${(lerp(98, 146, o2)).toFixed(1)}" rx="8" fill="#fff" stroke="#d3dae1"/>` +
    text(26, 36, '臨床判斷良性的眼瞼病灶（Kersten 1997）', { size: 15.5, bold: true, color: COL.accent }) +
    `<rect x="26" y="50" width="420" height="16" rx="3" fill="#dfe5ea"/><rect x="26" y="50" width="${(420 * 13 / 692 * b).toFixed(1)}" height="16" rx="3" fill="#b3122b"/>` +
    text(456, 63, '692 個', { size: 14.5, bold: true }) + text(26, 92, '病理惡性 13 個（1.9%）', { size: 15, bold: true, color: '#b3122b', op: b }) +
    text(26, 136, '其中 10 個 BCC；臨床診斷包括 papilloma、nevus', { size: 14.5, op: o2 }) + `</g>`;
  rx += tag('標本全部送病理：wart、病程 2 週、OD 上眼瞼', T.on(4, 0.5), COL.accent, PH - 20);
  return { L: { svg: sv.svg + OV.lesion(sv, GEO.lesion), extra: ex, P: SAG_P }, R: { svg: cv.svg + OV.lesion(cv, C.blob(C.c, C.r)), extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAG12, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const oS = T.on(0, 0.6) * (1 - 0.55 * T.on(2, 0.6) * (1 - T.on(3, 0.6))), oM = T.on(2, 0.6);
  let svg = sv.svg + OV.lesion(sv, GEO.lesion, oS) + OV.lesion(sv, GEO.lesionM, oM);
  let ex = lab('皮膚面的病灶（示意）', 'skin surface', 14, 52, sv.P(lesTop(GEO.qc, WART.h)), { color: COL.amber, bold: true, op: oS });
  ex += lab('皮膚＋皮下', 'skin + subcutis', 14, 120, sv.P(GEO.S(GEO.qc - 1.6, 0.15)), { op: T.on(1, 0.6) * (1 - T.on(2, 0.6)) });
  ex += lab('眼輪匝肌', 'orbicularis', PW - 12, 52, sv.P(GEO.S(GEO.qc + 0.4, 0.75)), { side: 'R', bold: true, op: T.on(1, 0.6) * (1 - T.on(2, 0.6)) });
  ex += lab('瞼緣的病灶（示意）', 'lid margin', 14, PH - 64, sv.P(lesTop(GEO.qcM, WART.h * 0.8)), { color: COL.purple, bold: true, op: oM });
  ex += lab('睫毛毛囊', 'lash follicle', PW - 12, PH - 30, followAt(sv, 0.6), { side: 'R', bold: true, color: '#7a4a2a', op: Math.max(T.on(1, 0.6) * 0.6, T.on(2, 0.6)) });
  let rsvg = cv.svg + OV.lesion(cv, C.blob(C.c, C.r), oS) + OV.lesion(cv, C.blob(C.cM, C.rM), oM);
  let rx = lab('皮膚面（示意）', 'skin surface', 14, 150, cv.P([C.c[0] - C.r * 0.8, C.c[1] - C.r * 0.4]), { color: COL.amber, bold: true, op: oS });
  rx += lab('瞼緣：長在睫毛之間（示意）', 'lid margin', PW - 12, PH - 30, cv.P([C.cM[0] + C.rM * 0.8, C.cM[1] + C.rM * 0.5]), { side: 'R', color: COL.purple, bold: true, op: oM });
  rx += infoCard(12, 10, 582, [['瞼緣 nevus 150 個（Custer 2024）', { bold: true, color: COL.accent }], ['superficial excision＋cauterization → 術後可見 trichiasis', { size: 14.5 }]], T.on(3, 0.5), { h: 72 });
  rx += tag('瞼緣：切除與冷凍都可能影響睫毛', T.on(4, 0.5), COL.red, 34);
  rx += note('門診紀錄沒寫位置：兩種都要會', 1 - T.on(3, 0.5), 30);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 2 切除送病理
DRAW2['2-1'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const mk = T.p(2, 0.15, 0.85), nd = T.p(3, 0.05, 0.6), on3 = T.on(3, 0.4);
  const tipS = mixP(GEO.needle[0], GEO.needle[1], nd);
  let svg = sv.svg + OV.lesion(sv, GEO.lesion) + (on3 > 0 ? OV.needle(sv, GEO.needle[0], tipS, on3) : '');
  let ex = lab('病灶（示意）', 'lesion', 14, 120, sv.P(lesTop(GEO.qc, WART.h)), { color: COL.amber, bold: true });
  ex += lab('眼輪匝肌', 'orbicularis', PW - 12, 52, sv.P(GEO.S(GEO.qc + 3.2, 0.62)), { side: 'R', op: 1 - on3 });
  ex += lab('局麻針', 'needle', 14, PH - 64, sv.P(mixP(GEO.needle[0], tipS, 0.3)), { bold: true, op: on3 });
  ex += lab('病灶下方的皮下', 'subcutis', PW - 12, PH - 64, sv.P(GEO.needle[1]), { side: 'R', bold: true, color: COL.accent, op: ss(0.6, 1, nd) });
  ex += lab('睫毛', 'lashes', 14, 290, sv.A.lash, { op: 1 - on3 });
  const ring = C.circ(C.c, C.r + WART.margin);
  let rsvg = cv.svg + OV.lesion(cv, C.blob(C.c, C.r)) + (mk > 0 ? curve(partial(ring, mk).map(cv.P), COL.purple, 2.6, 1, '6 4') : '');
  // the same needle seen from the front (projected: it runs in the section, x = 0); only the part outside the skin is visible
  const nC = [C.toCor(GEO.needle[0]), C.toCor(GEO.needleEntry)], kOut = Math.min(1, nd / GEO.NOUT), tipC = mixP(nC[0], nC[1], kOut);
  if (on3 > 0) rsvg += OV.needle(cv, nC[0], tipC, on3);
  let rx = infoCard(12, 10, 582, [['右眼 OD・上眼瞼・病程 2 週', { bold: true, color: COL.accent, size: 16 }], ['位置：［瞼緣／皮膚面］　大小：［　　］mm（現場寫）', { size: 15, op: T.on(1, 0.5) }]], T.on(0, 0.5) * (1 - T.on(2, 0.5)), { h: 74 });
  rx += lab('畫出切除範圍（示意）', 'mark', PW - 12, 150, cv.P([C.c[0] + C.r + WART.margin, C.c[1]]), { side: 'R', color: COL.purple, bold: true, op: ss(0.3, 0.8, mk) * (1 - on3) });
  rx += lab('局麻針（從前方來，投影很短）', 'needle', 14, 150, cv.P(mixP(nC[0], tipC, 0.5)), { bold: true, op: on3 });
  rx += lab('睫毛線', 'lash line', PW - 12, PH - 64, cv.P([4.5, GEO.C0.lashY(4.5)]), { side: 'R' });
  rx += tag('藥物、劑量：依院內常規', on3, COL.accent, PH - 20);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

DRAW2['2-2'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const ct = T.p(1, 0.0, 0.7), lift = T.p(2, 0.05, 0.6), o3 = T.on(3, 0.5);
  const sp = specimen(2.6 * lift), cutL = partial(GEO.cut, ct).map(sv.P);
  let svg = sv.svg + (lift > 0 ? OV.wound(sv, GEO.wound, ss(0, 0.4, lift)) : '') + OV.lesion(sv, sp) + (ct > 0 ? curve(cutL, COL.red, 3, 1 - 0.6 * lift) : '');
  if (lift > 0.05) { const n = GEO.nrm(GEO.qc), a = GEO.S(GEO.qc, -0.15); svg += arrow(sv.P(a), sv.P([a[0] + n[0] * 2.2 * lift, a[1] + n[1] * 2.2 * lift]), COL.accent, ss(0.1, 0.5, lift)); }
  let ex = lab('切除線（深度示意）', 'excision', PW - 12, 236, sv.P(GEO.S(GEO.qc + WART.w / 2 + 0.2, WART.dEx)), { side: 'R', color: COL.red, bold: true, op: ss(0.3, 0.8, ct) * (1 - o3) });
  ex += lab('眼輪匝肌', 'orbicularis', PW - 12, 52, sv.P(GEO.S(GEO.qc + 3.2, 0.62)), { side: 'R', bold: T.u >= T.st(1) && T.u < T.st(2) });
  ex += lab('病灶', 'lesion', 14, 120, sv.P(lesTop(GEO.qc, WART.h)), { color: COL.amber, bold: true, op: 1 - lift });
  ex += lab('標本 → 全部送病理', 'specimen', 14, 52, sv.P(sp[24]), { color: COL.accent, bold: true, op: ss(0.4, 1, lift) });
  ex += lab('基底', 'base', 14, 290, sv.P(GEO.S(GEO.qc - 0.7, WART.dEx)), { color: COL.red, bold: true, op: o3 });
  const ring = C.circ(C.c, C.r + WART.margin);
  let rsvg = cv.svg + (lift > 0 ? OV.wound(cv, ring, ss(0, 0.4, lift)) : '') + OV.lesion(cv, C.blob(C.c, C.r), 1 - ss(0.2, 0.8, lift)) + (ct > 0 ? curve(partial(ring, ct).map(cv.P), COL.red, 2.6, 1 - 0.6 * lift) : '');
  let rx = lab('沿範圍切下（示意）', 'excision', PW - 12, 150, cv.P([C.c[0] + C.r + WART.margin, C.c[1]]), { side: 'R', color: COL.red, bold: true, op: ss(0.3, 0.8, ct) * (1 - lift) });
  rx += lab('留下的基底', 'base', PW - 12, 150, cv.P([C.c[0] + (C.r + WART.margin) * 0.6, C.c[1]]), { side: 'R', color: COL.red, bold: true, op: Math.max(ss(0.5, 1, lift) * 0.6, o3) });
  rx += tag('Shave 或 excision：依院內常規', T.on(0, 0.5) * (1 - T.on(1, 0.5)), COL.accent, PH - 20);
  rx += tag('下一步：基底 cryotherapy', o3, COL.accent, PH - 20);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 3 Cryotherapy
// the inner end of the lid along the inward normal at the base: where the lid meets the globe (only the eyelid in between)
const LID_IN = (() => { const c = GEO.S(GEO.qc), n = GEO.nrm(GEO.qc); for (let t = 0.2; t < 12; t += 0.02) { const p = [c[0] - n[0] * t, c[1] - n[1] * t]; if (GEO.toGlobe(p) < 0.35) return p; } return c; })();
const shieldAt = y => GEO.shield.reduce((b, p) => Math.abs(p[1] - y) < Math.abs(b[1] - y) ? p : b);

DRAW2['3-1'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const sh = T.p(0, 0.1, 0.9), o2 = T.on(2, 0.6) * (1 - T.on(3, 0.6));
  let svg = sv.svg + OV.wound(sv, GEO.wound) + (sh > 0 ? OV.shield(sv, partial(GEO.shield, sh)) : '');
  svg += `<g opacity="${o2}">${VIEWS.dim(sv.P(GEO.S(GEO.qc, 0.05)), sv.P(LID_IN), COL.red)}</g>`;
  let ex = lab('基底', 'base', 14, 120, sv.P(GEO.S(GEO.qc - 0.6, WART.dEx)), { color: COL.red, bold: true });
  ex += lab('保護片（示意）', 'shield', 14, PH - 30, sv.P(shieldAt(-2.6)), { bold: true, color: '#3d4852', op: ss(0.5, 1, sh) });
  ex += lab('角膜', 'cornea', PW - 12, PH - 30, sv.A.cornea, { side: 'R' });
  ex += lab('探頭與眼球之間只隔一層眼瞼', 'eyelid', PW - 12, 52, sv.P(mixP(GEO.S(GEO.qc), LID_IN, 0.5)), { side: 'R', color: COL.red, bold: true, op: o2 });
  let rsvg = cv.svg + OV.wound(cv, C.circ(C.c, C.r + WART.margin)) + OV.shieldC(cv, ss(0.4, 1, sh));
  let rx = lab('基底', 'base', 14, 120, cv.P([C.c[0] - (C.r + WART.margin) * 0.7, C.c[1]]), { color: COL.red, bold: true });
  rx += lab('保護片（眼瞼後面，示意）', 'shield', PW - 12, PH - 64, cv.P([6.6 * Math.cos(-0.5), 0.4 + 6.6 * Math.sin(-0.5)]), { side: 'R', bold: true, color: '#3d4852', op: ss(0.5, 1, sh) });
  rx += infoCard(12, 10, 582, [['冷凍傷到眼球的報告（Wingfield 1979）', { bold: true, color: COL.accent }], ['見於治療結膜、角膜病灶；治療眼瞼病灶時沒有', { size: 14.5 }]], T.on(1, 0.5) * (1 - T.on(2, 0.5)), { h: 72 });
  rx += tag('探頭、冰球：不碰眼球的結膜、角膜', T.on(2, 0.5), COL.red, 34);
  rx += note('保護的方式：依院內常規', T.on(3, 0.5), PH - 14);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

DRAW2['3-2'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const pin = T.on(0, 0.8), fr = T.p(0, 0.3, 1) * 0.55 + T.p(1, 0, 0.6) * 0.45, th = T.p(2, 0.35, 0.95), r = WART.iceR * fr * (1 - th);
  const after = T.on(3, 0.6), probeOp = 1;
  let svg = sv.svg + OV.wound(sv, GEO.wound) + OV.shield(sv, GEO.shield, 0.9);
  if (r > 0.02) svg += OV.ice(sv, GEO.dome(GEO.qc, r), 1 - ss(0.6, 1, th) * 0.4);
  if (th > 0.4) svg += OV.frozen(sv, GEO.dome(GEO.qc, WART.iceR), ss(0.4, 1, th));
  svg += OV.probe(sv, GEO.probe(GEO.qc, 7, 1.1, 2.5 * (1 - pin)), pin * probeOp);
  let ex = lab('冷凍探頭', 'cryoprobe', 14, 52, sv.P(GEO.add(GEO.S(GEO.qc), GEO.nrm(GEO.qc), 3.2)), { bold: true, op: pin });
  ex += lab('基底', 'base', 14, PH - 64, sv.P(GEO.S(GEO.qc - 0.7, WART.dEx)), { color: COL.red, bold: true, op: 1 - T.on(1, 0.5) });
  ex += lab('冰球（大小示意）', 'ice ball', PW - 12, 236, sv.P(domeIn(GEO.qc, Math.max(r, 0.2))), { side: 'R', color: '#1f6d9e', bold: true, op: ss(0.3, 0.7, fr) * (1 - th) });
  ex += lab('解凍', 'thaw', PW - 12, 236, sv.P(domeIn(GEO.qc, WART.iceR)), { side: 'R', color: COL.accent, bold: true, op: ss(0.3, 0.8, th) * (1 - after) });
  ex += lab('冷凍過的範圍（示意）', 'frozen', PW - 12, 236, sv.P(domeIn(GEO.qc, WART.iceR)), { side: 'R', color: '#1f6d9e', bold: true, op: after });
  ex += lab('保護片（示意）', 'shield', 14, PH - 30, sv.P(shieldAt(-2.6)), { color: '#3d4852' });
  let rsvg = cv.svg + OV.wound(cv, C.circ(C.c, C.r + WART.margin)) + OV.shieldC(cv, 0.6);
  if (r > 0.02) rsvg += OV.ice(cv, C.hold(C.circ(C.c, r)), 1 - ss(0.6, 1, th) * 0.4);
  if (th > 0.4) rsvg += OV.frozen(cv, C.hold(C.circ(C.c, WART.iceR)), ss(0.4, 1, th));
  rsvg += OV.tip(cv, C.c, pin);
  let rx = lab('探頭', 'probe', 14, 120, cv.P(C.c), { bold: true, op: pin });
  rx += lab('冰球蓋過整個基底', 'ice ball', PW - 12, 150, cv.P([C.c[0] + Math.max(r, 0.3), C.c[1]]), { side: 'R', color: '#1f6d9e', bold: true, op: ss(0.5, 0.9, fr) * (1 - th) });
  rx += tag('冷凍 ＋ 解凍 ＝ 一個 freeze–thaw', T.on(2, 0.5) * (1 - after), COL.accent, 34);
  rx += infoCard(12, 10, 582, [['皮膚 common wart 的試驗劑量（Luk 2006）', { bold: true, color: COL.accent }], ['身上的疣、不是眼瞼 → 不能直接套用', { size: 15 }]], after * (1 - T.on(4, 0.5)), { h: 72 });
  rx += tag('循環次數、時間、機器：依院內常規', T.on(4, 0.5), COL.accent, 34);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 4 靠近瞼緣：睫毛毛囊
// dimension along the follicle axis from the lash exit, offset to the anterior side (as the levator-rotation video's EPI.dim)
function follDim(sv, d, col, off = 0.25) { const F = GEO.F, n = [F.d[1], -F.d[0]], o = n[0] < 0 ? n : [-n[0], -n[1]], a = [F.E[0] + o[0] * off, F.E[1] + o[1] * off], b = [a[0] + F.d[0] * d, a[1] + F.d[1] * d];
  return { svg: VIEWS.dim(sv.P(a), sv.P(b), col), mid: sv.P(mixP(a, b, 0.5)) }; }
function reachLine(sv, d, col, op) { const F = GEO.F, q = sv.P([F.E[0] + F.d[0] * d, F.E[1] + F.d[1] * d]), n = [F.d[1], -F.d[0]], a = [q[0] + n[0] * 16, q[1] + n[1] * 16], b = [q[0] - n[0] * 16, q[1] - n[1] * 16];
  return { svg: `<g opacity="${op}"><path d="M${F1(a[0])} ${F1(a[1])}L${F1(b[0])} ${F1(b[1])}" stroke="${col}" stroke-width="3"/></g>`, at: q }; }

DRAW2['4-1'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGM, 'sL'), cv = VIEWS.cor({}, PW, PH, CORM, 'cR'), C = GEO.COR;
  const o1 = T.on(1, 0.6), o2 = T.on(2, 0.6), ic = T.p(3, 0.1, 0.9), lesOp = (1 - 0.65 * o1) * (1 - T.on(3, 0.6));
  const d18 = follDim(sv, EP.follicleUp, '#7a4a2a'), r95 = reachLine(sv, EP.reach95Up, COL.suture, o2);
  let svg = sv.svg + OV.lesion(sv, GEO.lesionM, lesOp) + (ic > 0 ? OV.ice(sv, GEO.dome(GEO.qcM, WART.iceRM * ic)) : '');
  let ex = `<g opacity="${o1}">${d18.svg}</g>` + r95.svg;
  ex += lab(`毛囊平均深 ${EP.follicleUp} mm`, 'follicle depth', 14, 236, d18.mid, { color: '#7a4a2a', bold: true, op: o1 });
  ex += lab(`插 ${EP.reach95Up} mm：碰到 ${EP.pct}% 的毛囊`, 'needle reach', PW - 12, 52, r95.at, { side: 'R', color: COL.suture, bold: true, op: o2 });
  ex += lab('睫毛毛囊', 'lash follicle', 14, 52, followAt(sv, 0.75), { bold: true, op: 1 - o1 });
  ex += lab('瞼緣的病灶（示意）', 'margin lesion', 14, PH - 64, sv.P(lesTop(GEO.qcM, WART.h * 0.8)), { color: COL.purple, bold: true, op: lesOp * (1 - o1) });
  ex += lab('瞼板', 'tarsus', PW - 12, PH - 64, sv.A.tarsusZ || sv.A.tarsus, { side: 'R', op: 1 - o2 });
  ex += lab('冰球長到毛囊的深度（示意）', 'ice ball', 14, PH - 64, sv.P(domeIn(GEO.qcM, WART.iceRM * Math.max(ic, 0.3))), { color: '#1f6d9e', bold: true, op: ss(0.4, 0.9, ic) });
  ex += VIEWS.sbar(sv.k, 1, 1);
  let rsvg = cv.svg + OV.lesion(cv, C.blob(C.cM, C.rM), lesOp) + (ic > 0 ? OV.ice(cv, C.hold(C.circ(C.cM, WART.iceRM * ic))) : '');
  let rx = lab('瞼緣的病灶（示意）', 'margin lesion', 14, 52, cv.P([C.cM[0] - C.rM * 0.7, C.cM[1] - C.rM * 0.7]), { color: COL.purple, bold: true, op: lesOp });
  rx += lab('睫毛', 'lashes', PW - 12, 52, cv.P([3.6, GEO.C0.lashY(3.6) - 1.6]), { side: 'R' });
  rx += lab('後瞼緣', 'posterior margin', PW - 12, PH - 30, cv.P([3.2, GEO.C0.Uy(3.2)]), { side: 'R' });
  rx += lab('冰球（示意）', 'ice ball', 14, PH - 64, cv.P([C.cM[0] - WART.iceRM * 0.7 * Math.max(ic, 0.3), C.cM[1] - WART.iceRM * 0.5 * Math.max(ic, 0.3)]), { color: '#1f6d9e', bold: true, op: ss(0.4, 0.9, ic) });
  return { L: { svg, extra: ex, P: ZS_P }, R: { svg: rsvg, extra: rx, P: CZ_P } };
};

const ICE_HI = GEO.dome(GEO.qc + 2, WART.iceR);   // the same ice ball 2 mm higher up the skin (示意): it does not reach the follicle (../check.js)
DRAW2['4-2'] = T => {
  const z = T.on(3, 1.2) * (1 - T.on(4, 1.2)), sv = VIEWS.sag({}, PW, PH, VIEWS.zwin(SAGM, SAGW, z), 'sL'), cv = VIEWS.cor({}, PW, PH, VIEWS.zwin(CORM, CORW, z), 'cR'), C = GEO.COR;
  const pin = T.on(0, 0.8), fr = T.p(0, 0.3, 1) * 0.6 + T.p(1, 0, 0.5) * 0.4, rM = WART.iceRM * fr, mOp = 1 - z;
  let svg = sv.svg + OV.shield(sv, GEO.shield, 0.9);
  if (rM > 0.02) svg += OV.ice(sv, GEO.dome(GEO.qcM, rM), mOp);
  svg += OV.probe(sv, GEO.probe(GEO.qcM, 6, 0.9, 2 * (1 - pin)), pin * mOp);
  if (z > 0) svg += OV.wound(sv, GEO.wound, z) + OV.ice(sv, GEO.dome(GEO.qc, WART.iceR), z) + OV.probe(sv, GEO.probe(GEO.qc), z) + OV.frozen(sv, [...ICE_HI, ICE_HI[0]], z * ss(0.3, 0.8, T.p(3, 0.3, 0.9)));
  let ex = lab('毛囊被凍到', 'follicle frozen', 14, 52, followAt(sv, 0.8), { color: '#7a4a2a', bold: true, op: ss(0.6, 1, fr) * mOp });
  ex += lab('冰球（示意）', 'ice ball', PW - 12, PH - 30, sv.P(domeIn(GEO.qcM, Math.max(rM, 0.3))), { side: 'R', color: '#1f6d9e', bold: true, op: ss(0.3, 0.7, fr) * mOp });
  ex += lab('探頭', 'probe', 14, PH - 64, sv.P(GEO.add(GEO.S(GEO.qcM), GEO.nrm(GEO.qcM), 2.2)), { bold: true, op: pin * mOp * (1 - T.on(2, 0.5)) });
  ex += lab('那一段的睫毛可能會掉', 'lash loss', 14, PH - 64, sv.A.lash, { color: COL.red, bold: true, op: T.on(2, 0.6) * mOp });
  ex += lab('離睫毛線近：冰球深處碰到毛囊根部（示意）', 'ice ball', 14, 236, followAt(sv, 0.92), { color: '#1f6d9e', bold: true, size: 14, op: ss(0.7, 1, z) });
  ex += lab('離得遠：碰不到（示意）', 'higher up', 14, 52, sv.P(ICE_HI[60]), { color: COL.sub, bold: true, op: z * ss(0.3, 0.8, T.p(3, 0.3, 0.9)) });
  ex += VIEWS.sbar(sv.k, 1, 1);
  let rsvg = cv.svg + (rM > 0.02 ? OV.ice(cv, C.hold(C.circ(C.cM, rM)), mOp) : '') + OV.tip(cv, C.cM, pin * mOp);
  if (z > 0) rsvg += OV.wound(cv, C.circ(C.c, C.r + WART.margin), z) + OV.ice(cv, C.hold(C.circ(C.c, WART.iceR)), z) + OV.tip(cv, C.c, z) + OV.frozen(cv, C.circ(C.toCor(GEO.S(GEO.qc + 2)), WART.iceR), z * ss(0.3, 0.8, T.p(3, 0.3, 0.9)));
  let rx = lab('睫毛會掉', 'lash loss', PW - 12, PH - 64, cv.P([C.cM[0] + rM * 0.75, C.cM[1] - rM * 0.25]), { side: 'R', color: COL.red, bold: true, op: T.on(2, 0.6) * mOp });
  rx += lab('皮膚面：離睫毛線近（示意）', 'near the lashes', PW - 12, 236, cv.P([C.c[0] + WART.iceR, C.c[1]]), { side: 'R', color: '#1f6d9e', bold: true, op: ss(0.7, 1, z) });
  { const hi = C.toCor(GEO.S(GEO.qc + 2)); rx += lab('離得遠（示意）', 'higher up', PW - 12, 150, cv.P([hi[0] + WART.iceR, hi[1]]), { side: 'R', color: COL.sub, bold: true, op: z * ss(0.3, 0.8, T.p(3, 0.3, 0.9)) }); }
  rx += infoCard(12, 10, 582, [['Trichiasis 的冷凍治療（Sullivan 1976）', { bold: true, color: COL.accent }], ['瞼緣：液態氮 2 個 freeze–thaw', { size: 15 }], ['皮下溫度監測到 −30 °C → 破壞睫毛', { size: 15 }]], T.on(1, 0.5) * (1 - T.on(2, 0.5)), { h: 98 });
  rx += tag('瞼緣或靠近瞼緣：術前告知睫毛可能變少', T.on(4, 0.5), COL.red, 34);
  return { L: { svg, extra: ex, P: z > 0.5 ? SAG_P : ZS_P }, R: { svg: rsvg, extra: rx, P: z > 0.5 ? COR_P : CZ_P } };
};

// ---------------------------------------------------------------- 5 術後與副作用
DRAW2['5'] = T => {
  const sv = VIEWS.sag({}, PW, PH, SAGW, 'sL'), cv = VIEWS.cor({}, PW, PH, CORW, 'cR'), C = GEO.COR;
  const fz = GEO.dome(GEO.qc, WART.iceR), o2 = T.on(2, 0.6);
  let svg = sv.svg + OV.wound(sv, GEO.wound) + OV.frozen(sv, fz);
  let ex = lab('傷口', 'wound', 14, 120, sv.P(GEO.S(GEO.qc - 0.6, WART.dEx * 0.5)), { color: COL.red, bold: true });
  ex += lab('冷凍過的範圍（示意）', 'frozen', PW - 12, 236, sv.P(domeIn(GEO.qc, WART.iceR)), { side: 'R', color: '#1f6d9e', bold: true });
  ex += lab('睫毛', 'lashes', 14, 290, sv.A.lash, { op: o2 });
  ex += tag('止血、縫不縫、藥膏：依院內常規', T.on(0, 0.5) * (1 - T.on(1, 0.5)), COL.accent, PH - 20);
  let rsvg = cv.svg + OV.wound(cv, C.circ(C.c, C.r + WART.margin)) + OV.frozen(cv, C.hold(C.circ(C.c, WART.iceR)));
  if (o2 > 0) rsvg += `<path d="${pathOf(C.circ(C.c, WART.iceR).map(cv.P))}Z" fill="#fff" opacity="${(0.4 * o2).toFixed(2)}"/>`;
  const o1 = T.on(1, 0.5), o3 = T.on(3, 0.5), o4 = T.on(4, 0.5);
  let rx = infoCard(12, 10, 582, [['冷凍的副作用（Wingfield 1979）', { bold: true, color: COL.accent }], ['早期：充血、紅、水泡、水腫', { size: 15 }],
    ['晚期：色素脫失、睫毛與瞼板腺流失、眼瞼變形、疤痕', { size: 14.5, op: o2 }]], o1 * (1 - o3), { h: 100 });
  rx += infoCard(12, 10, 582, [['色素深的人（Fraunfelder 1979）', { bold: true, color: COL.accent }], ['瞼緣冷凍治 trichiasis 列為禁忌 → 術前講清楚色素脫失', { size: 14.5 }]], o3 * (1 - o4), { h: 72 });
  rx += infoCard(12, 10, 582, [['追病理報告（Kersten 1997）', { bold: true, color: COL.accent }], ['是不是 wart、有沒有惡性', { size: 15 }]], o4 * (1 - T.on(5, 0.5)), { h: 72 });
  rx += lab('色素脫失（示意）', 'depigmentation', PW - 12, PH - 64, cv.P([C.c[0] + WART.iceR * 0.75, C.c[1] + WART.iceR * 0.65]), { side: 'R', color: '#1f6d9e', bold: true, op: o2 });
  rx += tag('告知：紅腫、水泡；日後色素脫失、睫毛脫落、疤痕', T.on(5, 0.5), COL.accent, 34);
  return { L: { svg, extra: ex, P: SAG_P }, R: { svg: rsvg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 6 跟刀清單 (full panel)
DRAW2['6'] = T => {
  const items = ['核對 OD 上眼瞼、病程 2 週；位置與大小現場記下', '局麻：病灶下方的皮下（依院內常規）', 'Shave 或 excision：orbicularis 之上、整顆拿下', '標本全部送病理：wart、2 週、OD 上眼瞼',
    '先保護眼球：探頭與冰球不碰眼球的結膜、角膜', '冰球蓋過整個基底；freeze–thaw 依院內常規', '靠近瞼緣：冰球碰到毛囊（約 1.8 mm 深）→ 睫毛可能掉', '止血、傷口依院內常規；告知紅腫、水泡、色素脫失、疤痕'];
  const sec = [['術前', 0], ['切除送病理', 2], ['Cryotherapy', 4], ['收尾', 7]];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  sec.forEach(([n, i]) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606 + 588 - 10, y = 16 + row * 96 + 20; s += text(x, y, n, { size: 12.5, bold: true, color: COL.sub, anchor: 'end', op: T.on(0, 0.8) }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '做法、藥物與冷凍劑量依院內常規' } } };
};
