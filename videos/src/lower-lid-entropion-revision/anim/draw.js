// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the eyelid model (videos/models/eyelid), both from the same state:
//   · the lower-lid sagittal section (mechanism) + the coronal skin side (surgeon's view, examiner facing the patient: left = temporal);
//   · for the lateral tarsal strip: the axial section at the canthal level (seen from below like CT: anterior up, temporal left) + the
//     coronal lateral canthus; both panels use the same x window, so the canthus, the rim and the fixation point line up.
// Lower-lid views: views-lower.js (VL). Surgical parameters and states: params.js (LLP, LS).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14, W = PW) => htext(W - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width. AX and CANTH share x (axial and coronal lateral canthus side by side line up)
const SAG = { x: -19.2, y: 1.2, w: 24 }, SAG_Z = { x: -16.9, y: 2.3, w: 8.4 }, SAG_M = { x: -18.2, y: 0.6, w: 19 };
const COR = { x: -21, y: -7.5, w: 38 }, COR_L = { x: -17.5, y: -3.2, w: 31 };
const AX = { x: -29, y: -24, w: 38 }, AXC = { x: -24.6, y: -7.2, w: 16 }, CANTH = { x: -24.6, y: -6.6, w: 16 };   // AX: distraction; AXC + CANTH: the strip (same x)
const SAG_P = { title: '下眼瞼矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD　術者視角', orient: '面對病人：左＝temporal　右＝nasal' };
const AX_P = { title: '外眥水平切面 axial（從下往上看，同 CT）', orient: '上＝前　左＝temporal' };
const CANTH_P = { title: '正面：外眥　右眼 OD　術者視角', orient: '面對病人：左＝temporal' };
const NAT_P = { title: '對照：未手術的亞洲人下眼瞼 sagittal', orient: '左＝前　上＝上' };
const LTS_C = { canthotomy: 1, cantholysis: 1 }, LTS_FIXED = { ...LTS_C, strip: 1, stripFix: 1 }, LTS_AFTER = { stripFix: 1 };   // coronal canthus after the strip (wound closure not drawn)
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, COR_P, AX_P, CANTH_P, NAT_P]);
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const curve = (q, col, w = 2.4, op = 1, dash = '') => `<path d="${pathOf(q)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}"/>`;
const dot = (p, col, r = 4, op = 1) => p ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>` : '';
const arrow = (a, b, col = COL.accent, op = 1, mk = 'arrA', w = 2.4) => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#${mk})" opacity="${op}"/>`;
const fade = (a, b, k) => `<g opacity="${(1 - k).toFixed(3)}">${a}</g><g opacity="${k.toFixed(3)}">${b}</g>`;
const xsr = (x0, x1, st = 0.25) => { const r = []; for (let x = x0; x <= x1 + 1e-9; x += st) r.push(x); return r; };
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 26;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 14, y + 26 + i * 26, t, { size: ro.size || 15, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}
// a point offset from the projected lower lid in the axial view (d mm toward the front = away from the globe), at fraction f of its length
function lidOff(av, f, d) {
  const T = LID.track(av.r.lidPts), q = T.L * f, p = T.off(q, 0), n = T.off(q, 1), s = n[1] < p[1] ? 1 : -1;
  return av.P(T.off(q, s * d));
}
// the 1 mm scale bar of a panel
const sbar = (k, op, n = 1) => VIEWS.sbar(k, op, n);

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VL.lcor(LS.PRE, PW, PH, COR, 'tR'), B = cv.A;
  let ex = lab('睫毛往內碰到角膜（示意）', 'inturned lashes', 14, 60, B.lashMidL, { color: COL.red, bold: true });
  ex += lab('前次手術的疤痕（位置示意）', 'previous scar', PW - 12, PH - 28, B.scarL, { side: 'R', color: COL.amber, bold: true });
  ex += note('一年前做過 marginal rotation', 1, PH - 64);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 為什麼會復發
DRAW2['1-1'] = T => {
  const k1 = T.p(1, 0.1, 0.8), k2 = T.on(2, 0.8), k3 = T.p(3, 0.1, 0.8), ax = T.on(2, 0.6) * (1 - T.on(3, 0.6));
  const st = { dehis: k1, override: k3, entr: 0.4 * k1 + 0.2 * k2 + 0.4 * k3 };
  const sv = VL.lsag(st, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor(st, PW, PH, COR, 'cR'), B = cv.A;
  let svg = sv.svg, ex = '', P = SAG_P;
  const s0 = 1 - ax;
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R', bold: true, op: s0 });
  ex += lab('囊瞼筋膜（retractor）', 'capsulopalpebral fascia', PW - 12, 250, A.cpfEnd, { side: 'R', bold: true, color: k1 > 0.3 ? COL.red : COL.ink, op: s0 * T.on(1, 0.6) });
  if (A.dehisGap) ex += lab('① 從瞼板下緣鬆脫', 'retractor dehiscence', PW - 12, 300, A.dehisGap, { side: 'R', color: COL.red, bold: true, op: s0 * ss(0.4, 0.8, k1) });
  ex += lab('瞼板前眼輪匝肌', 'pretarsal orbicularis', 14, 150, A.orbPT, { op: s0 * T.on(3, 0.6) });
  if (A.override) ex += lab('③ 眶隔前眼輪匝肌往上跨', 'preseptal override', 14, 196, A.override, { color: COL.red, bold: true, op: s0 * ss(0.3, 0.7, k3) });
  ex += lab('角膜', 'cornea', 14, 64, A.cornea, { op: s0 });
  if (ax > 0.01) {   // line 2: horizontal laxity in the axial section — the lax lid can be pulled far off the globe
    const av = VL.axial({ lax: 1, distract: T.p(2, 0.3, 0.75) }, PW, PH, AX, 'aL'), X = av.A;
    svg = fade(sv.svg, av.svg, ax); P = ax > 0.5 ? AX_P : SAG_P;
    ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 236, X.tendon, { op: ax });
    ex += lab('② 整片眼瞼變鬆：拉得離眼球很遠', 'horizontal laxity', PW - 12, 64, X.distract, { side: 'R', color: COL.red, bold: true, op: ax * T.on(2, 0.6, 1.0) });
    ex += lab('下眼瞼（投影）', 'lower lid, projected', 14, 150, lidOff(av, 0.82, 1.2), { op: ax });
  }
  let rx = '';
  rx += lab('下瞼緣往內翻', 'margin turns in', 14, 64, B.lashMidL, { color: COL.red, bold: true, op: ss(0.45, 0.75, st.entr) });
  const m = T.on(5, 0.6);
  rx += infoCard(12, 262, 582, [['對應的術式成分（經結膜同時處理三個機轉的系列）', { bold: true, color: COL.accent }], ['① vertical laxity　→　retractor 重新固定', {}], ['② horizontal laxity　→　lateral tarsal strip', {}],
    ['③ orbicularis 上跨　→　切除一條 preseptal orbicularis', {}]], m, { h: 132 });
  rx += tag('回顧：retractors 變弱是多數病人的主因', T.on(4) * (1 - m), COL.accent, PH - 20);
  return { L: { svg, extra: ex, P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-2'] = T => {
  const sag = T.on(3, 0.6);
  // lines 0–2 (axial): distraction test on the lax lid, then the lid is let go and comes back only partly (snap-back, schematic)
  const pull = T.p(0, 0.25, 0.85) * (1 - 0.75 * T.p(2, 0.1, 0.9));
  const av = VL.axial({ lax: 1, distract: pull }, PW, PH, AX, 'aL'), X = av.A, S = av.M.state, P0 = CANTHUS.marginAt(0);
  const forced = T.p(5, 0.15, 0.8), sv = VL.lsag({ dehis: 1, entr: lerp(0.25, 0.85, forced) }, PW, PH, SAG, 'sL'), A = sv.A;
  let ex = '';
  { const a = av.P([1.6, P0[1]]), b = av.P([1.6, P0[1] - S.Dnow]), o = (1 - sag) * T.on(0, 0.6, 0.8) * (1 - T.on(2, 0.6));
    const t0 = av.P([-5.5, P0[1] - LLP.distractSig[0]]), t1 = av.P([5.5, P0[1] - LLP.distractSig[1]]);
    ex += `<g opacity="${((1 - sag) * T.on(1, 0.6) * (1 - T.on(2, 0.6))).toFixed(3)}"><rect x="${t0[0].toFixed(1)}" y="${t1[1].toFixed(1)}" width="${(t1[0] - t0[0]).toFixed(1)}" height="${(t0[1] - t1[1]).toFixed(1)}" fill="${COL.amber}" opacity="0.18"/>` +
      `<path d="M${t0[0].toFixed(1)} ${t0[1].toFixed(1)}H${t1[0].toFixed(1)}M${t0[0].toFixed(1)} ${t1[1].toFixed(1)}H${t1[0].toFixed(1)}" stroke="${COL.amber}" stroke-width="1.6" stroke-dasharray="5 4"/></g>`;
    ex += `<g opacity="${o.toFixed(3)}">${VIEWS.dim(a, b, COL.accent)}</g>`;
    ex += lab('拉開的距離', 'distraction', PW - 12, 106, [a[0] + 2, (a[1] + b[1]) / 2], { side: 'R', color: COL.accent, bold: true, op: o * (1 - T.on(2)) });
    ex += lab('6–8 mm：算明顯', 'significant laxity', 14, 64, [t0[0], (t0[1] + t1[1]) / 2], { color: COL.amber, bold: true, op: (1 - sag) * T.on(1, 0.6) * (1 - T.on(2, 0.6)) });
    ex += lab('放開：眨好幾次眼還貼不回（示意）', 'poor snap-back', PW - 12, 106, X.distract, { side: 'R', color: COL.red, bold: true, op: (1 - sag) * T.on(2, 0.6, 1.2) }); }
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 290, X.tendon, { op: 1 - sag });
  ex += lab('眼球', 'globe', PW - 12, 340, av.P([4, 0]), { side: 'R', op: 1 - sag });
  // lines 3–5 (sagittal): retractor dehiscence, the central fat behind it; forced closure turns the margin in
  ex += lab('囊瞼筋膜鬆脫', 'retractor dehiscence', PW - 12, 236, A.dehisGap, { side: 'R', color: COL.red, bold: true, op: sag });
  ex += lab('下穹窿', 'inferior fornix', PW - 12, 340, A.fornixL, { side: 'R', op: sag });
  ex += lab('中央脂肪墊', 'central fat pad', 14, 340, A.fatL, { color: '#9c7a20', bold: true, op: sag * T.on(4, 0.6) * (1 - T.on(5)) });
  ex += lab('用力閉眼：瞼緣往內翻（示意）', 'forced closure', 14, 64, A.lashL, { color: COL.red, bold: true, op: ss(0.4, 0.8, forced) });
  const svg = fade(av.svg, sv.svg, sag), P = sag > 0.5 ? SAG_P : AX_P;
  // right: the patient (coronal) with the tests as cards
  const cv = VL.lcor(LS.PRE, PW, PH, COR, 'cR');
  let rx = '';
  rx += infoCard(12, 262, 582, [['Distraction test（horizontal laxity）', { bold: true, color: COL.accent }], ['往前拉離眼球：> 6–8 mm 算明顯', {}], ['80 位單側內翻病人：7.5–11 mm（Beigi 2008）', { color: COL.sub }]], T.on(0, 0.6) * (1 - T.on(2)), { h: 104 });
  rx += infoCard(12, 262, 582, [['Snap-back（orbicularis 張力）', { bold: true, color: COL.accent }], ['放開後眨好幾次眼還貼不回眼球 → 張力明顯變差', {}]], T.on(2, 0.6) * (1 - T.on(3)), { h: 78 });
  rx += infoCard(12, 262, 582, [['Retractors（vertical laxity）', { bold: true, color: COL.accent }], ['往下看時下眼瞼的移動：正常約 3–4 mm', {}], ['把下眼瞼拉到眶下緣：下穹窿脂肪脫出更準（Beigi 2008）', { color: COL.sub }]], T.on(3, 0.6) * (1 - T.on(5)), { h: 104 });
  rx += infoCard(12, 262, 582, [['用力閉眼（誘發試驗）', { bold: true, color: COL.accent }], ['成功：休息時正常、用力閉眼也誘發不出來', {}]], T.on(5, 0.6), { h: 78 });
  return { L: { svg, extra: ex, P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['1-3'] = T => {
  let s = '';
  const x0 = 430, K = 520 / 50;   // 50 % = 520 px
  const head = T.on(1, 0.5);
  s += `<g opacity="${head}">${text(24, 32, '復發或失敗的比例（各研究的術式、定義與追蹤時間不同）', { size: 17, bold: true })}<path d="M${x0} 48V372" stroke="#7d8a97" stroke-width="1.6"/></g>`;
  const G = [
    [1, 'Nakos 2019　隨機試驗', '12 個月復發', [['只縫 everting sutures', 42.9, '42.9%', COL.red], ['Lateral tarsal strip', 11.5, '11.5%', COL.accent]]],
    [2, 'Scheepers 2010　隨機試驗', '18 個月失敗', [['只縫 everting sutures', 600 / 29, '6/29', COL.red], ['＋lateral tarsal strip', 0, '0/26', COL.accent]]],
    [3, 'Erb 2006　三個機轉一起處理', '經結膜，151 個眼瞼', [['復發', 3.3, '3.3%', COL.accent]]],
    [4, 'Auguste 2023　系列', '平均追蹤 15.7 個月', [['只做 horizontal shortening', 7, '7%', COL.accent], ['合併術式', 8, '8%', COL.accent]]]];
  let y = 54;
  G.forEach(([li, h1, h2, bars]) => { const op = T.on(li, 0.5), g = ss(T.st(li) + 0.3, T.st(li) + 1.4, T.u);
    s += `<g opacity="${op}">${text(24, y + 20, h1, { size: 15.5, bold: true })}${text(24, y + 42, h2, { size: 13.5, color: COL.sub })}`;
    bars.forEach(([nm, v, lbl, col], j) => { const by = y + 6 + j * 30, w = v * K * g;
      s += text(x0 - 12, by + 17, nm, { size: 14, anchor: 'end' }) + `<rect x="${x0}" y="${by}" width="${w.toFixed(1)}" height="22" rx="4" fill="${col}"/>` + text(x0 + w + 8, by + 17, lbl, { size: 15, bold: true, color: col, op: g }); });
    s += `</g>`; y += bars.length * 30 + 22; });
  s += infoCard(800, 160, 410, [['數字不能直接套用', { bold: true, color: COL.amber, size: 16 }], ['院內的 marginal rotation 會剝開 retractor、', {}], ['切開瞼板，不等於單純的 everting sutures', {}]], T.on(5, 0.6), { h: 104, stroke: COL.amber });
  s += infoCard(800, 278, 410, [['這位病人', { bold: true, size: 16 }], ['一年前的手術細節：不詳，本片不臆測', {}], ['這次復發的原因：依主治判斷', {}]], T.on(6, 0.6), { h: 104 });
  s += tag('只處理 vertical、不處理 horizontal，會不會比較容易復發？', T.on(0, 0.5) * (1 - T.on(1)), COL.ink, 200).replace(`x="${PW / 2}"`, `x="${FW / 2}"`);
  return { F: { svg: s, P: { title: '只轉瞼緣 vs 加上 horizontal tightening', orient: '各研究的追蹤時間不同' } } };
};

// ---------------------------------------------------------------- 2 這次怎麼選 (full: the three department procedures)
DRAW2['2'] = T => {
  const cw = 388, ch = 352, Y0 = 8, xs = [16, 421, 826];
  const cards = [
    { li: 1, n: '1', name: 'Marginal rotation', steps: ['睫毛下 2.5 mm 切開', '剝開眶隔與 retractor，到結膜', '瞼板切一半深度（tarsal fracture）', '4-0 vicryl mattress suture ×2'], tagT: '處理：vertical', tagL: 2, kind: 'sag', st: { ...LS.TIED, lts: 0 } },
    { li: 3, n: '2', name: '＋Lateral tarsal strip', steps: ['先做 lateral tarsal strip', '4-0 vicryl ×1 固定到外側眶緣骨膜', '再做同樣的 marginal rotation', 'Mattress suture ×3'], tagT: '處理：vertical＋horizontal', tagL: 3, kind: 'ax', st: { lax: 1, ...LTS_FIXED } },
    { li: 4, n: '3', name: 'Hotz', steps: ['切除皮膚、皮下與 orbicularis', '露出 retractor aponeurosis，部分去脂', 'Orbicularis 固定到 aponeurosis', '6-0 Prolene ×5'], kind: 'sag', st: { entr: 0.85, hotzExc: 1, septOpen: 1, hotzFat: 1, hotzFix: 1, tie: 0.9 } }];
  const pick = T.on(6, 0.6);
  let s = '';
  cards.forEach((c, i) => { const x = xs[i], op = Math.max(0.3 * T.on(0, 0.6, i * 0.2), T.on(c.li, 0.6)), hl = i === 1 ? pick : 0;
    s += card(x, Y0, cw, ch, { op, hl }) + `<g opacity="${op}"><circle cx="${x + 26}" cy="${Y0 + 28}" r="15" fill="${hl > 0.5 ? COL.accent : COL.ink}"/>${text(x + 26, Y0 + 34, c.n, { size: 16, bold: true, anchor: 'middle', color: '#fff' })}${text(x + 50, Y0 + 35, c.name, { size: 18, bold: true })}`;
    // thumbnail: the model in the state the procedure ends in (sagittal; the strip in the axial section)
    const bw = cw - 24, bh = 150, bx = x + 12, by = Y0 + 50, cid = 'th' + i;
    const r = c.kind === 'ax' ? CANTHUS.draw({ state: c.st, id: cid }) : LOWER.draw({ state: c.st, id: cid, upper: false }), win = c.kind === 'ax' ? { x: -27, y: -14, w: 41 } : { x: -20.5, y: 1.6, w: 24 }, cm = VIEWS.cam(win, bw, bh);
    s += `<clipPath id="${cid}C"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6"/></clipPath><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fff" stroke="#d3dae1"/><g clip-path="url(#${cid}C)"><g transform="translate(${bx} ${by}) ${cm.tf}">${r.svg}</g></g>`;
    s += text(bx + bw - 8, by + bh - 8, c.kind === 'ax' ? '外眥水平切面（示意）' : '矢狀切面（示意）', { size: 12, color: COL.sub, anchor: 'end' });
    c.steps.forEach((t2, j) => { s += text(x + 18, by + bh + 26 + j * 25, '· ' + t2, { size: 14.5 }); });
    if (c.tagT) { const to = T.on(c.tagL, 0.6), w = measure(c.tagT, 14.5, true) + 24; s += `<g opacity="${to}"><rect x="${x + 14}" y="${Y0 + ch - 40}" width="${w}" height="28" rx="14" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + 14 + w / 2, Y0 + ch - 21, c.tagT, { size: 14.5, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; }
    if (i === 1) { const w = measure('本片示範', 14.5, true) + 24; s += `<g opacity="${pick}"><rect x="${x + cw - w - 14}" y="${Y0 + 14}" width="${w}" height="28" rx="14" fill="${COL.accent}"/>${text(x + cw - 14 - w / 2, Y0 + 33, '本片示範', { size: 14.5, bold: true, color: '#fff', anchor: 'middle' })}</g>`; }
    s += `</g>`; });
  s += htext(FW / 2, Y0 + ch + 34, 'Horizontal laxity 明顯 → 加 horizontal tightening；兩個成分都處理，長期效果最好', { size: 16, bold: true, color: COL.accent, anchor: 'middle', op: T.on(5, 0.6) * (1 - pick) });
  s += htext(FW / 2, Y0 + ch + 34, '假設術前 distraction test 顯示 horizontal laxity；實際用哪一種，依主治判斷', { size: 16, bold: true, color: COL.ink, anchor: 'middle', op: pick });
  return { F: { svg: s, P: { title: '院內常用的下眼瞼內翻術式（依院內常規）', orient: '縫線與針數依院內常規' } } };
};

// ---------------------------------------------------------------- 3 術前準備
DRAW2['3'] = T => {
  const sv = VL.lsag(LS.PRE, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor({ ...LS.PRE, rimShow: T.on(1, 0.6) > 0.5 ? 1 : 0 }, PW, PH, COR, 'cR'), B = cv.A, r = cv.r;
  const o0 = T.on(0, 0.6, 0.4), o1 = T.on(1, 0.6, 0.3), o2 = T.on(2, 0.6), o3 = T.on(3, 0.6);
  let ex = `${dot(A.lashSkinL, COL.ink, 4)}${dot(A.incL, COL.purple, 5, o0)}<g opacity="${o0}">${VIEWS.dim(A.lashSkinL, A.incL, COL.purple)}</g>`;
  ex += lab('睫毛線', 'lash line', 14, 64, A.lashSkinL, { bold: true });
  ex += lab('切口線：睫毛下 2.5 mm（沿皮膚量）', 'subciliary line', 14, 150, A.incL, { color: COL.purple, bold: true, size: 14, op: o0 });
  if (A.scarL) ex += lab('前次的疤痕（示意）', 'previous scar', PW - 12, 236, A.scarL, { side: 'R', color: COL.amber, bold: true, op: o2 });
  ex += lab('眶隔', 'orbital septum', PW - 12, 340, A.septumL, { side: 'R' });
  let rx = '';
  const XL = xsr(-12.4, 9.8, 0.2), line = XL.map(x => cv.P([x, r.incLY(x)]));
  rx += curve(line, COL.purple, 2.6, o0, '7 5');
  const LC = CORONAL.LC, c0 = cv.P(LC), c1 = cv.P([r.latRimX + 0.6, LC[1]]);
  rx += curve([c0, c1], COL.purple, 2.6, o1, '7 5');
  rx += lab('睫毛下 2.5 mm', 'subciliary line', 14, PH - 28, cv.P([-8, r.incLY(-8)]), { color: COL.purple, bold: true, op: o0 });
  rx += lab('外眥：canthotomy 的線（位置示意）', 'canthotomy line', 14, 64, [(c0[0] + c1[0]) / 2, c0[1]], { color: COL.purple, bold: true, op: o1 });
  if (B.scarL) rx += lab('舊疤（示意）', 'previous scar', PW - 12, PH - 28, B.scarL, { side: 'R', color: COL.amber, bold: true, op: o2 });
  rx += tag('局部麻醉：依院內常規', o3, COL.accent, PH - 70);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 4 手術步驟
// lateral tarsal strip: axial (left) + coronal lateral canthus (right), same x window
DRAW2['4-1'] = T => {
  const c1 = T.p(1, 0.1, 0.8), c2 = T.p(2, 0.1, 0.7);
  const av = VL.axial({ lax: 1, canthotomy: c1, cantholysis: c2 > 0.5 ? 1 : 0 }, PW, PH, AXC, 'aL'), X = av.A;
  const cv = VL.lcor({ canthotomy: c1, cantholysis: c2, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim, { bold: true });
  ex += lab('外眥韌帶', 'lateral canthal tendon', 14, 196, X.tendon, { bold: true, op: 1 - ss(0.5, 1, c2) });
  ex += lab('外眥', 'lateral canthus', 14, 106, av.P(av.M.lc), { op: 1 - T.on(1) });
  if (X.canthotomy) ex += lab('canthotomy', '', 14, 106, X.canthotomy, { color: COL.red, bold: true, op: T.on(1, 0.6) });
  if (X.cantholysis) ex += lab('cantholysis：剪斷下支', 'inferior crus cut', 14, 196, X.cantholysis, { color: COL.red, bold: true, op: ss(0.5, 1, c2) });
  ex += lab('下眼瞼（投影）', 'lower lid, projected', PW - 12, 64, lidOff(av, 0.93, 1.2), { side: 'R' });
  ex += lab('眼球', 'globe', PW - 12, 290, av.P([-10, 0.5]), { side: 'R' });
  let rx = lab('外眥', 'lateral canthus', PW - 12, 64, B.lcL, { side: 'R', bold: true });
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, 64, cv.P([cv.r.latRimX + 0.1, 3.0]));
  if (B.canthotomy) rx += lab('canthotomy：水平剪開', 'canthotomy', 14, 150, B.canthotomy, { color: COL.red, bold: true, op: T.on(1, 0.6) });
  if (B.cantholysis) rx += lab('cantholysis', 'inferior crus', 14, 236, B.cantholysis, { color: COL.red, bold: true, op: T.on(2, 0.6) });
  rx += note('Lateral tarsal strip：Anderson 1979', T.on(0, 0.6) * (1 - T.on(1)));
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['4-2'] = T => {
  const sp = T.on(1, 0.8), pull = T.p(2, 0.05, 0.5);
  const av = VL.axial({ lax: 1, ...LTS_C, strip: sp > 0.5 ? 1 : 0 }, PW, PH, AXC, 'aL'), X = av.A;
  const cv = VL.lcor({ ...LTS_C, strip: sp > 0.5 ? 1 : 0, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('前層：皮膚＋orbicularis', 'anterior lamella', PW - 12, 64, lidOff(av, 0.95, 1.95), { side: 'R', bold: true, op: T.on(0, 0.6) * (1 - T.on(2)) });
  ex += lab('後層：瞼板＋結膜', 'posterior lamella', PW - 12, 106, lidOff(av, 0.92, 0.7), { side: 'R', bold: true, color: '#9b6a2a', op: T.on(0, 0.6, 0.8) * (1 - sp) });
  if (X.strip) ex += lab('瞼板條（去掉一部分結膜）', 'tarsal strip', 14, 150, X.strip, { bold: true, color: '#9b6a2a', op: sp });
  ex += lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim);
  { const e = X.lidEnd, o = T.on(2, 0.6); if (e) ex += `<g opacity="${o}"><circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="13" fill="none" stroke="${COL.red}" stroke-width="2.2" stroke-dasharray="5 4"/></g>` +
      lab('剪掉多出來的長度（示意）', 'excess trimmed', 14, 64, e, { color: COL.red, bold: true, op: o }); }
  let rx = '';
  if (B.strip) rx += lab('瞼板條', 'tarsal strip', PW - 12, 150, B.strip, { side: 'R', bold: true, color: '#9b6a2a', op: sp });
  if (B.stripEnd) { const e = B.stripEnd, a = [e[0] + 46, e[1] - 30], o = T.on(2, 0.6);
    rx += `<g opacity="${o}">${arrow([e[0] + 70, e[1] - 30], [e[0] + 10 - 30 * pull, e[1] - 30], COL.accent, 1, 'arrA', 2.6)}<path d="M${(e[0] + 8).toFixed(1)} ${(e[1] - 14).toFixed(1)}V${(e[1] + 14).toFixed(1)}" stroke="${COL.red}" stroke-width="2.4" stroke-dasharray="4 3"/></g>`;
    rx += lab('往外拉緊，剪掉多的長度（示意）', 'pull and trim', 14, 236, [e[0] + 8, e[1] + 10], { color: COL.red, bold: true, op: o }); }
  rx += lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, 64, cv.P([cv.r.latRimX + 0.1, 3.0]));
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

DRAW2['4-3'] = T => {
  const f = T.p(0, 0.15, 0.85), tight = T.p(2, 0.35, 0.8) * (1 - T.p(2, 0.85, 1));
  const av = VL.axial({ lax: 1, ...LTS_C, strip: 1, stripFix: f }, PW, PH, AXC, 'aL'), X = av.A, M = av.M;
  const cv = VL.lcor({ ...LTS_C, strip: 1, stripFix: f, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let ex = lab('外側眶緣', 'lateral orbital rim', 14, 290, X.rim, { bold: true });
  if (X.stripFix) ex += lab('4-0 vicryl ×1：固定到骨膜', 'strip to periosteum', 14, 196, X.stripFix, { color: COL.suture, bold: true, op: ss(0.5, 1, f) });
  { const o = T.on(1, 0.6) * (1 - T.on(2, 0.6)), a = av.P(M.rimEdge), b = av.P(M.tubercle);
    ex += `<g opacity="${o}">${VIEWS.dim(a, b, COL.accent)}</g>` + lab('Whitnall 結節：眶緣後方約 1.5 mm', 'lateral orbital tubercle', 14, 64, b, { color: COL.accent, bold: true, op: o }); }
  ex += lab('眶緣內面的骨膜', 'periosteum', 14, 340, av.P(LID.track(av.r.inner).off(2.6, -0.3)), { op: T.on(0, 0.6) * (1 - T.on(1)) });
  ex += lab('眼瞼變緊、貼回眼球（示意）', 'tightened', PW - 12, 64, lidOff(av, 0.92, 1.2), { side: 'R', color: COL.accent, bold: true, op: T.on(2, 0.6) });
  ex += lab('眼球', 'globe', PW - 12, 290, av.P([-10, 0.5]), { side: 'R' });
  let rx = lab('外側眶緣（皮膚下）', 'lateral orbital rim', 14, 64, cv.P([cv.r.latRimX + 0.1, 3.0]));
  if (B.stripFix) rx += lab('固定點：眶緣內面（皮膚下，虛線）', 'fixation inside the rim', 14, 290, B.stripFix, { color: COL.suture, bold: true, op: ss(0.5, 1, f) });
  if (B.strip) rx += lab('瞼板條', 'tarsal strip', PW - 12, 150, B.strip, { side: 'R', bold: true, color: '#9b6a2a' });
  rx += lab('外眥', 'lateral canthus', PW - 12, 64, B.lcL, { side: 'R' });
  rx += tag('固定位置 → 外眥的高度與張力', T.on(2, 0.6), COL.accent, PH - 20);
  return { L: { svg: av.svg, extra: ex, P: AX_P }, R: { svg: cv.svg, extra: rx, P: CANTH_P } };
};

// marginal rotation: sagittal (left) + coronal (right)
DRAW2['4-4'] = T => {
  const c = T.p(0, 0.1, 0.85), p = T.p(2, 0.1, 0.85);
  const st = { ...LS.PRE, subcil: c, incH: LLP.incH, plane: p };
  const sv = VL.lsag(st, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor({ ...st, ...LTS_AFTER }, PW, PH, COR, 'cR'), B = cv.A;
  let ex = lab('睫毛下 2.5 mm 切開', 'subciliary incision', 14, 150, A.incL, { color: COL.red, bold: true, op: T.on(0, 0.6) });
  ex += lab('上次的疤痕（示意）', 'previous scar', PW - 12, 236, A.scarL, { side: 'R', color: COL.amber, bold: true, op: T.on(1, 0.6) });
  ex += lab('皮下的舊疤（示意）', 'scar under the skin', 14, 236, A.scarSkin, { color: COL.amber, bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  if (A.planeL) ex += lab('剝離平面：眶隔前面', 'preseptal plane', 14, 290, A.planeL, { color: COL.accent, bold: true, op: ss(0.3, 0.7, p) });
  ex += lab('眶隔', 'orbital septum', PW - 12, 340, A.septumL, { side: 'R', op: T.on(2, 0.6) });
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R' });
  let rx = '';
  if (B.incL) rx += lab('切口：睫毛下 2.5 mm', 'subciliary incision', 14, PH - 28, B.incL, { color: COL.red, bold: true, op: T.on(0, 0.6) * (1 - T.on(2)) });
  if (B.flapL) rx += lab('皮膚肌肉瓣往下翻開', 'skin–muscle flap', 14, PH - 28, B.flapL, { color: COL.accent, bold: true, op: ss(0.3, 0.7, p) });
  rx += lab('瞼板條已固定（外眥）', 'strip fixed', 14, 64, B.stripFix, { color: COL.suture, op: 0.9 });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-5'] = T => {
  const so = T.p(0, 0.05, 0.45), ro = T.p(0, 0.5, 0.95), nat = T.on(2, 0.8);
  const st = { ...LS.PLANE, septOpen: so, retrOpen: ro };
  const sv = VL.lsag(st, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor({ ...st, septOpen: so >= 1 ? 1 : 0, retrOpen: ro >= 1 ? 1 : 0, ...LTS_AFTER }, PW, PH, COR, 'cR'), B = cv.A;
  const o0 = 1 - nat;
  let svg = sv.svg, ex = '';
  if (A.septCutL) ex += lab('眶隔切開', 'septum opened', 14, 236, A.septCutL, { color: COL.red, bold: true, op: o0 * ss(0.3, 0.8, so) * (1 - T.on(1)) });
  if (A.retrCut) ex += lab('retractors 切開到結膜', 'retractors opened', PW - 12, 340, A.retrCut, { side: 'R', color: COL.red, bold: true, op: o0 * ss(0.3, 0.8, ro) });
  ex += lab('前層：囊瞼筋膜', 'capsulopalpebral fascia', PW - 12, 196, A.cpf, { side: 'R', bold: true, op: o0 * T.on(1, 0.6) });
  ex += lab('後層：下瞼板肌', 'inferior tarsal muscle', PW - 12, 250, A.itm, { side: 'R', bold: true, color: '#a2525c', op: o0 * T.on(1, 0.6) });
  ex += lab('結膜', 'conjunctiva', PW - 12, 64, A.conjL, { side: 'R', op: o0 });
  ex += lab('瞼板', 'tarsus', 14, 64, A.tarsusL, { op: o0 });
  if (nat > 0.01) {   // line 2: the unoperated Asian lower lid — the septum joins the CPF about 2.4 mm below the tarsus (Kakizaki 2006)
    const nv = VL.lsag({}, PW, PH, SAG, 'nL'), N = nv.A, a = nv.P(LOWER.LF.at(LOWER.S_TARL, LOWER.U_CPF)), b = N.fusionL;
    svg = fade(sv.svg, nv.svg, nat);
    ex += `<g opacity="${nat}">${dot(a, COL.accent, 4)}${dot(b, COL.accent, 4)}</g>`;
    ex += lab('瞼板下緣', 'inferior tarsal border', PW - 12, 64, a, { side: 'R', op: nat });
    ex += lab('融合處：約 2.4 mm（19 個中 7 個看得到）', 'septum–CPF fusion', 14, 290, b, { color: COL.accent, bold: true, size: 14, op: nat });
    ex += lab('眶隔', 'orbital septum', 14, 340, N.septumL, { op: nat });
    ex += lab('囊瞼筋膜', 'capsulopalpebral fascia', PW - 12, 196, N.cpf, { side: 'R', op: nat }); }
  let rx = '';
  if (B.flapL) rx += lab('窗內：眶隔與 retractors 打開', 'opened to the conjunctiva', 14, PH - 28, B.flapL, { color: COL.red, bold: true, op: T.on(0, 0.6) });
  rx += lab('瞼板條已固定（外眥）', 'strip fixed', 14, 64, B.stripFix, { color: COL.suture, op: 0.9 });
  return { L: { svg, extra: ex, P: nat > 0.5 ? NAT_P : SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-6'] = T => {
  const f = T.p(0, 0.2, 0.9);
  const st = { ...LS.OPEN, frac: f, fracS: LLP.fracS, fracDepth: LLP.fracDepth };
  const sv = VL.lsag(st, PW, PH, SAG_Z, 'sL'), A = sv.A, cv = VL.lcor({ ...st, ...LTS_AFTER }, PW, PH, COR, 'cR'), B = cv.A;
  let ex = '';
  if (A.fracL) ex += lab('15 號刀：切一半深度', 'tarsal fracture', 14, 64, A.fracL, { color: COL.red, bold: true, op: ss(0.2, 0.6, f) });
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R', bold: true });
  ex += lab('結膜：不切穿', 'conjunctiva intact', PW - 12, 150, A.conjL, { side: 'R', color: COL.accent, bold: true, op: T.on(1, 0.6) });
  ex += lab('瞼板腺', 'meibomian gland', PW - 12, 236, A.glandL, { side: 'R' });
  ex += lab('睫毛', 'lashes', 14, 150, A.lashL);
  ex += sbar(sv.k, 1);
  ex += note('切的面與高度：示意（前面、離瞼緣 2 mm）', T.on(2, 0.6), PH - 60);
  let rx = '';
  if (B.fracL) rx += lab('tarsal fracture（瞼板上，畫虛線）', 'under the tissue', 14, PH - 28, B.fracL, { color: COL.red, bold: true, op: ss(0.2, 0.6, f) });
  rx += lab('瞼板條已固定（外眥）', 'strip fixed', 14, 64, B.stripFix, { color: COL.suture, op: 0.9 });
  return { L: { svg: sv.svg, extra: ex, P: { title: '下眼瞼矢狀切面放大 sagittal', orient: '左＝前　上＝上' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-7'] = T => {
  const m = T.p(1, 0.05, 0.85), t = T.p(2, 0.1, 0.7);
  const st = { ...LS.FRAC, mattress: m, exitH: LLP.exitH, lts: 1, tie: t, override: lerp(LLP.mild.override, 0, t) };
  const sv = VL.lsag(st, PW, PH, SAG_M, 'sL'), A = sv.A, cv = VL.lcor({ ...st, mattress: Math.max(T.on(0, 0.8, 0.6), m), ...LTS_AFTER }, PW, PH, COR, 'cR'), B = cv.A;
  let ex = '';
  if (A.mattressIn) ex += lab('進針：下穹窿附近的結膜面', 'needle in', PW - 12, 290, A.mattressIn, { side: 'R', color: COL.suture, bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  if (A.mattress) ex += lab('穿過 retractors', 'through the retractors', PW - 12, 196, A.mattress, { side: 'R', color: COL.suture, bold: true, op: ss(0.6, 0.9, m) * (1 - T.on(2)) });
  if (A.mattressExit) ex += lab('出針：睫毛下方的皮膚（示意）', 'exit on the skin', 14, 236, A.mattressExit, { color: COL.suture, bold: true, op: ss(0.9, 1, m) });
  ex += lab(t > 0.5 ? '睫毛離開角膜' : '睫毛碰到角膜', t > 0.5 ? 'lashes off the cornea' : 'lashes on the cornea', 14, 64, A.lashL, { color: t > 0.5 ? COL.accent : COL.red, bold: true });
  ex += lab('瞼板（已切一半）', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R' });
  let rx = '';
  if (B.mattressL) rx += lab('Mattress ×3（4-0 vicryl，位置示意）', 'everting sutures', 14, PH - 28, B.mattressL, { color: COL.suture, bold: true, op: T.on(0, 0.6, 0.6) });
  rx += lab('瞼板條已固定（外眥）', 'strip fixed', 14, 64, B.stripFix, { color: COL.suture, op: 0.9 });
  rx += lab(t > 0.5 ? '綁緊：瞼緣外轉' : '下瞼緣往內翻', t > 0.5 ? 'everted' : 'inturned', PW - 12, 64, B.lashMidL, { side: 'R', color: t > 0.5 ? COL.accent : COL.red, bold: true });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['4-8'] = T => {
  const c = T.p(0, 0.1, 0.7);
  const st = { ...LS.TIED, skinClose: c };
  const sv = VL.lsag(st, PW, PH, SAG, 'sL'), A = sv.A, cv = VL.lcor({ ...st, ...LTS_AFTER }, PW, PH, COR, 'cR'), B = cv.A;
  let ex = '';
  if (A.skinClose) ex += lab('7-0 ethilone 縫皮', 'skin closure', 14, 150, A.skinClose, { color: COL.ink, bold: true, op: ss(0.3, 0.8, c) });
  ex += lab('Mattress suture（4-0 vicryl）', 'everting suture', PW - 12, 236, A.mattress, { side: 'R', color: COL.suture });
  ex += lab('睫毛離開角膜', 'lashes off the cornea', 14, 64, A.lashL, { color: COL.accent, bold: true });
  let rx = '';
  if (B.skinCloseL) rx += lab('縫皮（7-0 ethilone）', 'skin sutures', 14, PH - 28, B.skinCloseL, { bold: true, op: ss(0.3, 0.8, c) });
  rx += lab('外眥傷口：依院內常規（畫面省略）', 'canthal wound', 14, 64, B.stripFix, { color: COL.sub, op: T.on(1, 0.6) });
  rx += tag('GM 藥膏（依院內常規）', T.on(0, 0.6, 2), COL.accent, PH - 70);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 5 術中狀況 (left: the three situations; right: the model)
DRAW2['5'] = T => {
  const ov = T.on(2, 0.8) * (1 - T.on(4, 0.6)), can = T.on(4, 0.8);
  const items = [['上次手術的疤痕', '層次可能黏在一起，一層一層確認（示意）', 1], ['矯正過頭 → ectropion', '華人系列：41 個眼瞼中 12 個早期過度矯正', 2], ['瞼板條的固定位置', '決定外眥的高度與張力：固定時一起調整', 4]];
  let cur = -1; items.forEach((it, i) => { if (T.u >= T.st(it[2]) - 0.2) cur = i; });
  let svg = '';
  items.forEach(([h, d, li], i) => { const y = 24 + i * 96, op = 0.35 + 0.65 * T.on(li, 0.4), hl = cur === i ? 1 : 0;
    svg += card(18, y, 570, 80, { op: op * T.on(0, 0.5), hl }) + text(46, y + 48, '①②③'[i], { size: 26, bold: true, color: hl ? COL.accent : '#9aa7b4', op }) +
      text(84, y + 34, h, { size: 18, bold: true, op, color: hl ? COL.accent : COL.ink }) + text(84, y + 62, d, { size: 15, color: COL.sub, op }); });
  svg += text(46, 330, '多數自己恢復，最後只有 1 個需要再開刀', { size: 15, color: COL.sub, op: T.on(3, 0.6) * (1 - can) });
  const sv = VL.lsag(ov > 0.5 ? { ...LS.TIED, over: LLP.over } : LS.OPEN, PW, PH, SAG, 'sR'), A = sv.A;
  const cv = VL.lcor({ ...LTS_FIXED, rimShow: 1 }, PW, PH, CANTH, 'cR'), B = cv.A;
  let rx = '';
  rx += lab('上次的疤痕（示意）', 'previous scar', PW - 12, 236, A.scarL, { side: 'R', color: COL.amber, bold: true, op: T.on(1, 0.6) * (1 - ov) * (1 - can) });
  rx += lab('過度矯正：瞼緣離開眼球（示意）', 'overcorrection → ectropion', 14, 64, A.marginL, { color: COL.red, bold: true, op: ov * (1 - can) });
  rx += lab('固定點：外眥的高度與張力', 'fixation point', 14, 290, B.stripFix, { color: COL.suture, bold: true, op: can });
  return { L: { svg, P: { title: '三個狀況', orient: '' } }, R: { svg: fade(sv.svg, cv.svg, can), extra: rx, P: can > 0.5 ? CANTH_P : SAG_P } };
};

// ---------------------------------------------------------------- 6 術後 (full panel)
DRAW2['6'] = T => {
  let s = '';
  const chips = ['休息時不內翻', '用力閉眼也誘發不出來', '沒有過度矯正成 ectropion'];
  let x = 24; chips.forEach((c, i) => { const w = measure(c, 16, true) + 34, op = T.on(0, 0.5, i * 0.35);
    s += `<g opacity="${op}"><rect x="${x}" y="16" width="${w}" height="38" rx="19" fill="rgba(14,124,107,0.10)" stroke="${COL.accent}"/>${text(x + w / 2, 41, c, { size: 16, bold: true, color: COL.accent, anchor: 'middle' })}</g>`; x += w + 14; });
  // left: recurrence accumulating in the everting-suture arm (Nakos 2019: 28 eyes; 8 at 6 months, 12 at 12 months)
  { const op = T.on(1, 0.5), bx = 60, by = 340, h = 190 / 12, g = ss(T.st(1) + 0.4, T.st(1) + 1.6, T.u);
    s += `<g opacity="${op}">${text(24, 92, '只縫 everting sutures 那組的復發（隨機試驗）', { size: 16, bold: true })}<path d="M${bx - 10} ${by}H${bx + 300}" stroke="#7d8a97" stroke-width="1.6"/>`;
    [[6, 8], [12, 12]].forEach(([mo, n], i) => { const xx = bx + 30 + i * 140, hh = n * h * g;
      s += `<rect x="${xx}" y="${(by - hh).toFixed(1)}" width="80" height="${hh.toFixed(1)}" rx="4" fill="${COL.red}"/>${text(xx + 40, by - hh - 10, n + ' 眼', { size: 16, bold: true, color: COL.red, anchor: 'middle', op: g })}${text(xx + 40, by + 24, mo + ' 個月', { size: 15, anchor: 'middle' })}`; });
    s += `</g>`; }
  s += infoCard(460, 80, 750, [['Lateral tarsal strip 本身的併發症（151 個眼瞼）', { bold: true, color: COL.amber }], ['strip 鬆脫 2 個、外眥移位 2 個', {}]], T.on(2, 0.6), { h: 78, stroke: COL.amber });
  s += infoCard(460, 176, 750, [['睫毛下切開＋切除皮膚肌肉＋lateral tarsal strip（96 個眼瞼）', { bold: true, color: COL.accent }], ['復發 1 個；2 位輕度 ectropion，不用再開刀', {}]], T.on(3, 0.6), { h: 78 });
  s += infoCard(460, 272, 750, [['拆線時間、用藥', { bold: true }], ['依院內常規', { color: COL.accent, bold: true }]], T.on(4, 0.6), { h: 78 });
  return { F: { svg: s, P: { title: '術後追蹤', orient: '各研究的術式與追蹤時間不同' } } };
};

// ---------------------------------------------------------------- 7 跟刀清單 (full panel)
DRAW2['7'] = T => {
  const items = ['術前：distraction、snap-back、往下看、用力閉眼', '依院內常規：睫毛下 2.5 mm 畫線', 'Lateral canthotomy、cantholysis', '瞼板條、剪短；4-0 vicryl ×1 固定到眶緣內面骨膜',
    '睫毛下切開、穿過舊疤；剝開眶隔與 retractor 到結膜', '15 號刀切瞼板一半深度', '4-0 vicryl mattress ×3；睫毛離開角膜、不過度矯正', '7-0 ethilone 縫皮；GM 藥膏'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  return { F: { svg: s, P: { title: '跟刀清單', orient: '數值與縫線依院內常規' } } };
};
