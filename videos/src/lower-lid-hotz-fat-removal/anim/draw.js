// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the eyelid model (videos/models/eyelid), both from the same state (anim/params.js HS):
//   · the lower-lid sagittal section (mechanism) + the coronal skin side (surgeon's view, examiner facing the patient: left = temporal);
//   · retrobulbar haemorrhage (chapter 5): the axial orbit section seen from below like CT + the lateral canthus from the front
//     (videos/models/orbit, as in ../../lateral-canthotomy-ocs); both share x.
// The figures are the right eye (OD); this case is OS (every coronal panel title says so). What the model does not show is drawn here and
// marked 示意, as on the printed sheets (../print/): the extent of the three fat pads seen through the opened septum, the fat removed, the
// position of the inferior oblique in the section, the margin turned out after the Hotz (the model's `tie`), the SPK dots.
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const tag = (s, op, col = COL.accent, y = 34, x = PW / 2) => htext(x, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const note = (s, op, y = PH - 14, x = PW - 12) => htext(x, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
// model windows (mm): left, top, width (height from the panel ratio)
const SAG = { x: -21.5, y: 0.6, w: 27 }, DEEP = { x: -21, y: 0.8, w: 33 }, ZOOM = { x: -18.6, y: 0.4, w: 12.5 }, FIXW = { x: -24, y: 2.2, w: 17 };
const COR = { x: -19, y: -7.2, w: 35 };
const AXW = { x: -48, y: -26, w: 96 }, AXZ = { x: -30, y: -14.5, w: 34 }, FRW = { x: -25.5, y: -7.4, w: 17 };
const SAG_P = { title: '下眼瞼矢狀切面（瞳孔中央）sagittal', orient: '左＝前　上＝上' };
const NAT_P = { title: '對照：未手術的亞洲人下眼瞼 sagittal', orient: '左＝前　上＝上' };
const COR_P = { title: '正面　右眼 OD 示意（本台 OS 左右相反）', orient: '面對病人：左＝temporal' };
const AX_P = { title: '眼窩水平切面（從下往上看，同 CT）', orient: '上＝前　左＝temporal' };
const FR_P = { title: '正面：外眥開窗　右眼 OD 示意（本台 OS 左右相反）', orient: '左＝temporal' };
window.PRELOAD_EXTRA = JSON.stringify([SAG_P, NAT_P, COR_P, AX_P, FR_P]);
const fade = (a, b, k) => k <= 0 ? a : k >= 1 ? b : `<g opacity="${(1 - k).toFixed(3)}">${a}</g><g opacity="${k.toFixed(3)}">${b}</g>`;
const dot = (p, col, r = 4, op = 1) => p ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="1.2" opacity="${op}"/>` : '';
const seg = (a, b, col, w = 2.6, op = 1, dash = '') => `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
// info card inside a panel: rows of [text, options]; each row may fade in with its own op
function infoCard(x, y, w, rows, op, o = {}) {
  const lh = o.lh || 30, h = o.h || 22 + rows.length * lh;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#fff" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 16, y + 30 + i * lh, t, { size: ro.size || 16, bold: ro.bold, color: ro.color || COL.ink, op: ro.op ?? 1 }); });
  return s + `</g>`;
}
// what the opened septum shows in the surgeon's view: the three fat pads and the inferior oblique (window from the excision down to the
// rim, depth 3 = fat-pad layer). The extent is schematic (示意), as on the printed steps sheet (../print/video.js fatWin).
const FAT_WIN = (() => { const c = CORONAL.draw({ variant: 'asian', state: {}, lower: HS.FAT, id: 'hzw', windows: [], section: false }), X = [];
  for (let x = -15.5; x <= 12.5 + 1e-9; x += 0.25) X.push(+x.toFixed(2));
  return [{ poly: [...X.map(x => [x, Math.max(c.hotzHiY(x), c.fusLY(x) - 0.4)]), ...X.slice().reverse().map(x => [x, c.rimLY(x) - 0.6])], depth: 3 }]; })();
// Hotz excision edges in the section: skin to the depth of the orbicularis at hzLo and hzHi (model q along the skin)
const hzEdge = (V, k) => { const q = V.r.A.lower[k]; return [V.P(V.r.SK.off(q, 0)), V.P(V.r.SK.off(q, -V.r.deepAt(q)))]; };

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const cv = VL.lcor(HS.PRE, PW, PH, COR, 'tR'), B = cv.A;
  let ex = lab('睫毛往內碰到角膜（示意）', 'entropion', 14, 64, B.lashMidL, { color: COL.red, bold: true });
  ex += note('前次處置不詳；血小板低：止血與術後球後出血', T.on(1, 0.6), PH - 40);
  ex += note('右眼 OD 示意；本台 OS，左右相反', 1);
  return { R: { svg: cv.svg, extra: ex, P: COR_P } };
};

// ---------------------------------------------------------------- 1 臨床決策
DRAW2['1'] = T => {
  const k = T.on(2, 0.9), kf = T.on(3, 0.6);
  const s0 = VL.lsag(HS.PRE, PW, PH, SAG, 'aL'), s1 = VL.lsag(HS.FIX, PW, PH, SAG, 'bL'), A = s0.A, F = s1.A;
  let ex = lab('睫毛碰到角膜', 'entropion', 14, 64, A.lashL, { color: COL.red, bold: true, op: 1 - k });
  ex += lab('眶脂肪前凸', 'lid bag', 14, 330, A.fatL, { color: '#9c7a20', bold: true, op: 1 - k });
  ex += lab('眶隔', 'septum', PW - 12, 250, A.septumL, { side: 'R', op: 1 - k });
  ex += lab('睫毛離開角膜（示意）', 'margin turned out', 14, 64, F.lashL, { color: COL.accent, bold: true, op: k });
  ex += lab('眼輪匝肌', 'orbicularis', 14, 196, s1.P(s1.M.hotzFixEnds[0]), { bold: true, op: k });
  ex += lab('Retractor aponeurosis', '', PW - 12, 150, s1.P(s1.M.hotzFixEnds[1]), { side: 'R', bold: true, color: COL.suture, op: k });
  ex += lab('部分去脂（示意）', 'fat', 14, 330, F.fatRemoved, { color: '#9c7a20', bold: true, op: kf });
  ex += note('術前　→　Hotz 做完（示意）', T.on(2, 0.6));
  const c0 = VL.lcor(HS.PRE, PW, PH, COR, 'aR'), c1 = VL.lcor(HS.FIX, PW, PH, COR, 'bR'), B = c0.A, G = c1.A;
  let rx = lab('睫毛往內', 'entropion', 14, 64, B.lashMidL, { color: COL.red, bold: true, op: 1 - k });
  rx += lab('五針（位置示意）', 'sutures ×5', 14, PH - 28, G.hotzFixL, { color: COL.suture, bold: true, op: k });
  rx += tag('前次處置：不詳', T.on(1, 0.6) * (1 - k), COL.amber, PH - 24);
  rx += tag('選術式、去脂量：依主治判斷', T.on(4, 0.6), COL.ink, PH - 74);
  return { L: { svg: fade(s0.svg, s1.svg, k), extra: ex, P: SAG_P }, R: { svg: fade(c0.svg, c1.svg, k), extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 2 術前
DRAW2['2-1'] = T => {
  let s = '';
  // left: what to check before the operation (the values are not in the record: blank)
  s += infoCard(24, 18, 560, [['術前核對', { bold: true, color: COL.accent, size: 18 }], ['開刀眼：OS（畫面是右眼）', { op: T.on(0, 0.5) }], ['血小板　[　　　　]　紀錄沒有，自己查', { bold: true, op: T.on(0, 0.5, 0.6) }],
    ['PT／aPTT　[　　　　]　紀錄沒有，自己查', { bold: true, op: T.on(0, 0.5, 1.2) }], ['輸不輸：依主治與血液科', { color: COL.accent, bold: true, op: T.on(2, 0.5) }]], T.on(0, 0.5), { lh: 38 });
  s += infoCard(24, 236, 560, [['眼瞼成形術後眶內出血的常見共病', { bold: true, color: COL.amber }], ['高血壓｜aspirin｜術後嘔吐｜用力', {}], ['用藥、血壓、止吐：依主治與院內常規', { color: COL.sub, op: T.on(4, 0.5) }]], T.on(3, 0.6), { lh: 36, stroke: COL.amber });
  // right: the AABB threshold for major elective non-neuraxial surgery (no axis values: only the threshold)
  const x0 = 660, x1 = 1190, xt = 820, y = 150, o = T.on(1, 0.6);
  s += `<g opacity="${o}">${text(x0, 60, 'AABB：major elective non-neuraxial surgery', { size: 17, bold: true })}` +
    `<rect x="${x0}" y="${y}" width="${xt - x0}" height="44" rx="6" fill="${COL.red}" opacity="0.85"/><rect x="${xt}" y="${y}" width="${x1 - xt}" height="44" rx="6" fill="#cfd6dd"/>` +
    `<path d="M${xt} ${y - 18}V${y + 62}" stroke="${COL.ink}" stroke-width="3"/>${text(xt, y - 26, '50 × 10⁹/L', { size: 18, bold: true, anchor: 'middle' })}` +
    text((x0 + xt) / 2, y + 28, '低於', { size: 16, bold: true, color: '#fff', anchor: 'middle' }) + text((xt + x1) / 2, y + 28, '血小板 →', { size: 16, color: COL.sub, anchor: 'middle' }) +
    text(x0, y + 96, '低於門檻：建議預防性輸血小板', { size: 17, bold: true, color: COL.red }) + `</g>`;
  s += `<g opacity="${T.on(2, 0.6)}">${text(x0, y + 140, '眼瞼手術算不算這一類：依主治與血液科', { size: 16 })}</g>`;
  s += `<g opacity="${T.on(0, 0.6, 1.6)}">${text(x0, y + 196, '本病例的血小板：[　　　　]（紀錄沒有）', { size: 16, bold: true, color: COL.amber })}</g>`;
  return { F: { svg: s, P: { title: '血小板與凝血：術前核對', orient: '數值紀錄沒有，跟刀前自己查' } } };
};

DRAW2['2-2'] = T => {
  const sv = VL.lsag(HS.PRE, PW, PH, ZOOM, 'zL'), A = sv.A;
  let ex = lab('睫毛碰到下方角膜', 'lashes on the cornea', 14, 64, A.lashL, { color: COL.red, bold: true });
  ex += note('瞼緣轉正後睫毛才離開：見手術步驟', T.on(1, 0.6) * (1 - T.on(2)), PH - 60);
  ex += lab('下方角膜', 'cornea', PW - 12, 64, A.cornea, { side: 'R' });
  ex += lab('瞼板', 'tarsus', PW - 12, 250, A.tarsusL, { side: 'R' });
  ex += VIEWS.sbar(sv.k, 1);
  const cv = VL.lcor(HS.PRE, PW, PH, COR, 'zR'), B = cv.A;
  // SPK on the lower cornea (示意: dots, position from the case 「下方 SPK」)
  let dots = ''; for (let i = 0; i < 26; i++) { const x = -3.2 + 6.4 * ((i * 0.618) % 1), y = 1.9 + 1.6 * ((i * 0.377) % 1), p = cv.P([x, y]); dots += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.1" fill="#3a9a8c" opacity="0.85"/>`; }
  let rx = `<g opacity="${T.on(0, 0.6, 1)}">${dots}</g>`;
  rx += lab('下方 SPK（示意）', 'punctate keratopathy', 14, 64, cv.P([-1.2, 2.9]), { color: COL.accent, bold: true, op: T.on(0, 0.6, 1) });
  rx += lab('睫毛往內', 'entropion', PW - 12, 110, B.lashMidL, { side: 'R', color: COL.red, bold: true, op: T.on(1, 0.6) * (1 - T.on(2)) });
  rx += infoCard(12, 262, 582, [['病例：TBUT 3 秒｜dry eye｜下方 SPK｜SCH++', { bold: true }], ['術前記下基準，術後才比得出差別', { color: COL.accent, op: T.on(3, 0.6) }]], T.on(0, 0.6) * (1 - T.on(2, 0.5)) + T.on(3, 0.5), { lh: 34 });
  rx += infoCard(12, 262, 582, [['眼瞼成形術後乾眼症狀（892 例）', { bold: true, color: COL.amber }], ['26.5%；術後 lagophthalmos → 風險上升', {}]], T.on(2, 0.6) * (1 - T.on(3, 0.5)), { lh: 34, stroke: COL.amber });
  return { L: { svg: sv.svg, extra: ex, P: { title: '下瞼緣放大 sagittal', orient: '左＝前　上＝上' } }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 3 手術步驟
DRAW2['3-1'] = T => {
  const e = T.p(0, 0.35, 0.85), mark = T.on(0, 0.6);
  const sv = VL.lsag({ ...HS.PRE, hotzExc: e }, PW, PH, FIXW, 'eL'), A = sv.A;
  const marks = e < 1 ? `<g opacity="${(mark * (1 - e)).toFixed(3)}">${[hzEdge(sv, 'hzLo'), hzEdge(sv, 'hzHi')].map(([a, b]) => seg(a, b, COL.red, 3)).join('')}</g>` : '';
  let ex = marks + lab('切除：皮膚＋皮下＋眼輪匝肌', 'skin–muscle', 14, 236, A.hotzWound || hzEdge(sv, 'hzLo')[1], { color: COL.red, bold: true, op: mark });
  ex += lab('眼輪匝肌', 'orbicularis', 14, 330, A.orbPS, { bold: true });
  ex += lab('瞼板', 'tarsus', PW - 12, 64, A.tarsusL, { side: 'R' });
  ex += lab('眶隔', 'septum', PW - 12, 290, sv.P(sv.r.SEPT.off(sv.r.SEPT.L * 0.1, 0)), { side: 'R' });
  ex += VIEWS.sbar(sv.k, 1, 1);
  ex += note('切除寬度：依院內常規（圖為示意）', T.on(0, 0.6, 1.5));
  const cv = VL.lcor({ ...HS.PRE, hotzMark: e < 0.5 ? mark : 0, hotzExc: e >= 0.5 ? 1 : 0 }, PW, PH, COR, 'eR'), B = cv.A;
  let rx = lab(e >= 0.5 ? '切除後的窗' : '畫線：切除範圍（示意）', 'excision', 14, PH - 28, B.hotzL || cv.P([-2, cv.r.hotzLoY(-2)]), { color: COL.red, bold: true, op: mark });
  rx += tag('每一層止血，再往深處走', T.on(1, 0.6), COL.red, 34);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-2'] = T => {
  const so = T.p(0, 0.2, 0.7), nat = T.on(1, 0.8);
  const sv = VL.lsag({ ...HS.EXC, septOpen: so }, PW, PH, SAG, 'sL'), A = sv.A;
  let svg = sv.svg, ex = '';
  if (A.septCutL) ex += lab('打開眶隔', 'septum opened', 14, 250, A.septCutL, { color: COL.red, bold: true, op: (1 - nat) * ss(0.3, 0.8, so) });
  ex += lab('眶脂肪', 'orbital fat', 14, 340, A.fatL, { color: '#9c7a20', bold: true, op: (1 - nat) * T.on(0, 0.6, 1.2) });
  ex += lab('Retractor aponeurosis', '', PW - 12, 250, A.cpf, { side: 'R', bold: true, color: COL.suture, op: (1 - nat) * T.on(0, 0.6, 1.6) });
  ex += lab('切除後的傷口', 'excised', 14, 150, A.hotzWound, { op: (1 - nat) * 0.9 });
  if (nat > 0.01) {   // lines 1–2: the unoperated Asian lower lid — the septum joins the CPF about 2.4 mm below the tarsus (Kakizaki 2006)
    const nv = VL.lsag({}, PW, PH, SAG, 'nL'), N = nv.A, a = nv.P(LOWER.LF.at(LOWER.S_TARL, LOWER.U_CPF)), b = N.fusionL;
    svg = fade(sv.svg, nv.svg, nat);
    ex += `<g opacity="${nat}">${dot(a, COL.accent, 4)}${dot(b, COL.accent, 4)}${VIEWS.dim(a, b, COL.accent)}</g>`;
    ex += lab('瞼板下緣', 'inferior tarsal border', PW - 12, 64, a, { side: 'R', op: nat });
    ex += lab('融合處：約 2.4 mm', 'septum–CPF fusion', 14, 196, b, { color: COL.accent, bold: true, op: nat });
    ex += lab('19 眼中 7 眼看得到明確融合', '', 14, 250, null, { color: COL.sub, op: nat * T.on(2, 0.6) });
    ex += lab('眶隔', 'orbital septum', 14, 340, N.septumL, { op: nat });
    ex += lab('囊瞼筋膜', 'capsulopalpebral fascia', PW - 12, 196, N.cpf, { side: 'R', bold: true, color: COL.suture, op: nat }); }
  const cv = VL.lcor(so >= 1 ? HS.SEPT : HS.EXC, PW, PH, COR, 'sR', { windows: so >= 1 ? FAT_WIN : [] }), B = cv.A;
  let rx = lab(so >= 1 ? '眶隔打開：眶脂肪（範圍示意）' : '切除後的窗', so >= 1 ? 'orbital fat' : 'excision', 14, PH - 28, so >= 1 ? B.fatCen : B.hotzL, { color: so >= 1 ? '#9c7a20' : COL.red, bold: true });
  rx += tag('Orbicularis 最後固定在 retractor aponeurosis', T.on(2, 0.6), COL.suture, 34);
  return { L: { svg, extra: ex, P: nat > 0.5 ? NAT_P : SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-3'] = T => {
  const sv = VL.lsag(HS.SEPT, PW, PH, DEEP, 'fL'), A = sv.A;
  let ex = lab('中央脂肪', 'central fat', 14, 330, A.fatL, { color: '#9c7a20', bold: true });
  ex += lab('下斜肌（位置示意）', 'inferior oblique', PW - 12, 380, A.io, { side: 'R', color: COL.red, bold: true, op: T.on(1, 0.6) });
  ex += lab('下直肌', 'inferior rectus', PW - 12, 150, A.ir, { side: 'R' });
  ex += lab('Retractor', 'aponeurosis', PW - 12, 236, A.cpf, { side: 'R', color: COL.suture });
  ex += lab('開眶隔', 'septum opened', 14, 236, A.septCutL, { color: COL.red });
  const cv = VL.lcor(HS.SEPT, PW, PH, COR, 'fR', { windows: FAT_WIN }), B = cv.A;
  const o0 = T.on(0, 0.6, 0.6);
  let rx = lab('外側', 'lateral', 14, PH - 74, B.fatLat, { bold: true, op: o0 });
  rx += lab('中央', 'central', 14, PH - 28, B.fatCen, { bold: true, op: o0 });
  rx += lab('內側', 'medial', PW - 12, PH - 28, B.fatMed, { side: 'R', bold: true, op: o0 });
  rx += lab('下斜肌：分開內／中', 'inferior oblique', PW - 12, 236, B.io, { side: 'R', color: COL.red, bold: true, op: T.on(1, 0.6) });
  rx += lab('弓狀擴張：分開中／外', 'arcuate expansion', 14, 190, B.arcuate, { color: COL.red, bold: true, op: T.on(1, 0.6, 0.8) });
  rx += tag('兩者都不要傷到', T.on(2, 0.6), COL.red, 34);
  rx += note('各團大小：示意', T.on(3, 0.6), PH - 60);
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-4'] = T => {
  const fl = T.p(0, 0.3, 0.9);
  const sv = VL.lsag({ ...HS.SEPT, hotzFat: fl }, PW, PH, DEEP, 'gL'), A = sv.A;
  let ex = '';
  if (A.fatRemoved) ex += lab('部分去脂（示意）', 'fat removed', 14, 236, A.fatRemoved, { color: '#9c7a20', bold: true, op: ss(0.2, 0.6, fl) });
  ex += lab('下斜肌：不要夾（位置示意）', 'inferior oblique', PW - 12, 380, A.io, { side: 'R', color: COL.red, bold: true, op: T.on(1, 0.6) });
  ex += lab('下直肌', 'inferior rectus', PW - 12, 150, A.ir, { side: 'R', bold: T.u >= T.st(2), op: 0.5 + 0.5 * T.on(2, 0.6) });
  ex += tag('斷端止血，確認不出血再放開', T.on(3, 0.6), COL.red, 34);
  const cv = VL.lcor(HS.FAT, PW, PH, COR, 'gR', { windows: FAT_WIN }), B = cv.A;
  let rx = lab('部分去脂：哪幾團依院內常規', 'fat', 14, PH - 28, B.fatCen, { color: '#9c7a20', bold: true, op: T.on(0, 0.6) });
  rx += lab('下斜肌：不要夾', 'inferior oblique', PW - 12, 236, B.io, { side: 'R', color: COL.red, bold: true, op: T.on(1, 0.6) });
  rx += infoCard(12, 12, 400, [['眼瞼成形術後持續複視 12 位', { bold: true, color: COL.amber }], ['下直肌 7｜上斜肌 5', { bold: true }]], T.on(2, 0.6) * (1 - T.on(3, 0.5)), { lh: 32, stroke: COL.amber });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

DRAW2['3-5'] = T => {
  const f = T.p(0, 0.25, 0.85), t = T.p(1, 0.1, 0.75);
  const st = { ...HS.FAT, hotzFix: Math.max(f, 1e-3), tie: t, override: lerp(HZP.entr.override, 0, t) };
  const sv = VL.lsag(st, PW, PH, SAG, 'hL'), A = sv.A;
  let ex = lab('眼輪匝肌', 'orbicularis', 14, 196, sv.P(sv.M.hotzFixEnds[0]), { bold: true, op: T.on(0, 0.6) });
  ex += lab('Retractor aponeurosis', '', PW - 12, 250, sv.P(sv.M.hotzFixEnds[1]), { side: 'R', bold: true, color: COL.suture, op: T.on(0, 0.6) });
  ex += lab('6-0 Prolene', 'suture', PW - 12, 150, A.hotzFix, { side: 'R', color: COL.suture, bold: true, op: ss(0.3, 0.7, f) });
  ex += lab(t > 0.5 ? '睫毛離開角膜（示意）' : '睫毛碰到角膜', t > 0.5 ? 'margin turned out' : 'entropion', 14, 64, A.lashL, { color: t > 0.5 ? COL.accent : COL.red, bold: true });
  ex += note('縫線位置與深度：依院內常規（圖為示意）', T.on(2, 0.6));
  const cv = VL.lcor(st, PW, PH, COR, 'hR'), B = cv.A;
  let rx = '';
  if (B.hotzFixL) rx += lab('6-0 Prolene ×5（位置示意）', 'sutures ×5', 14, PH - 28, B.hotzFixL, { color: COL.suture, bold: true, op: ss(0.3, 0.7, f) });
  rx += lab(t > 0.5 ? '瞼緣外轉' : '睫毛往內', t > 0.5 ? 'everted' : 'entropion', PW - 12, 64, B.lashMidL, { side: 'R', color: t > 0.5 ? COL.accent : COL.red, bold: true });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 4 收尾
DRAW2['4'] = T => {
  const sv = VL.lsag(HS.FIX, PW, PH, SAG, 'kL'), A = sv.A;
  let ex = lab('睫毛離開角膜（示意）', 'lashes off the cornea', 14, 64, A.lashL, { color: COL.accent, bold: true });
  ex += lab('角膜', 'cornea', PW - 12, 64, A.cornea, { side: 'R' });
  ex += lab('Orbicularis → aponeurosis', '', PW - 12, 250, A.hotzFix, { side: 'R', color: COL.suture });
  const cv = VL.lcor(HS.FIX, PW, PH, COR, 'kR'), B = cv.A;
  let rx = lab('瞼緣方向', 'lash line', 14, PH - 28, B.lashLineL, { bold: true, color: COL.accent });
  rx += infoCard(12, 16, 582, [['請病人閉眼', { bold: true, color: COL.accent }], ['閉不閉得緊｜瞼緣轉正了沒｜睫毛碰不碰角膜', {}]], T.on(0, 0.6) * (1 - T.on(1, 0.5)), { lh: 32 });
  rx += infoCard(12, 16, 582, [['術後 lagophthalmos → 乾眼症狀增加', { bold: true, color: COL.amber }], ['本病例 TBUT 3 秒', { bold: true }]], T.on(1, 0.6) * (1 - T.on(2, 0.5)), { lh: 32, stroke: COL.amber });
  rx += infoCard(12, 16, 582, [['確認沒有活動性出血', { bold: true, color: COL.red }], ['傷口縫合與敷料：依院內常規', {}]], T.on(2, 0.6), { lh: 32, stroke: COL.red });
  return { L: { svg: sv.svg, extra: ex, P: SAG_P }, R: { svg: cv.svg, extra: rx, P: COR_P } };
};

// ---------------------------------------------------------------- 5 術後：球後出血 (orbit model, as in ../../lateral-canthotomy-ocs)
DRAW2['5-1'] = T => {
  const h = 0.35 * T.p(0, 0.1, 0.9) + 0.65 * T.p(3, 0.05, 0.7), L = VO.ax({ heme: h, noTension: h < 0.9 }, PW, PH, AXW, 'oL'), a = L.A;
  let el = lab('球後血腫', 'retrobulbar hemorrhage', 14, 330, a.heme, { color: '#8e2433', bold: true, op: ss(0.05, 0.3, h) });
  el += lab('眼球往前推', 'proptosis', PW - 12, 64, a.cornea, { side: 'R', color: COL.red, bold: true, op: T.on(3, 0.6) });
  if (a.tension) el += lab('眼瞼被撐緊', 'lids stretched', 14, 64, a.tension, { color: COL.red, bold: true, op: T.on(3, 0.6, 0.8) });
  el += note('右眼示意；本台 OS', 1);
  const rows = [['眼瞼成形術後眶內出血 0.055%', { bold: true, op: T.on(0) }], ['永久視力喪失 0.0045%', { op: T.on(0, 0.6, 1) }], ['多在術後 3 小時內；24 小時後明顯減少', { bold: true, color: COL.red, op: T.on(1) }],
    ['也可能晚到幾天後', { op: T.on(1, 0.6, 1.5) }], ['徵象：眼球突出｜眼瞼繃緊｜RAPD', { bold: true, op: T.on(3) }], ['　　　IOP 升高｜視力下降', { bold: true, op: T.on(3, 0.6, 1) }],
    ['只有約 15% 會說眼痛', { bold: true, color: COL.red, op: T.on(4) }], ['IOP 正常 8–21；> 30 緊急找眼科', { op: T.on(5) }], ['> 40 立刻減壓', { bold: true, color: COL.red, op: T.on(5, 0.6, 1) }]];
  let r = infoCard(12, 10, 582, rows, 1, { lh: 40 });
  r += tag('血小板低：回病房後特別注意', T.on(2, 0.6) * (1 - T.on(3, 0.5)), COL.amber, 300);
  return { L: { svg: L.svg, extra: el, P: AX_P }, R: { svg: r, extra: '', P: { title: '時間與徵象', orient: '' } } };
};

DRAW2['5-2'] = T => {
  const c = T.p(1, 0.05, 0.45), k = T.p(1, 0.5, 0.95);
  const L = VO.ax({ heme: 1, canthotomy: c, infLysis: k, noTension: k > 0.5 ? 1 : 0 }, PW, PH, AXZ, 'pL'), a = L.A;
  const R = VO.fr({ canthotomy: c, window: 1, infLysis: k }, PW, PH, FRW, 'pR'), b = R.A;
  let el = lab('外側眶緣', 'lateral orbital rim', 14, 330, a.rim, { bold: true });
  if (a.canthotomy) el += lab('外眥切開', 'canthotomy', 14, 64, a.canthotomy, { color: COL.red, bold: true, op: ss(0.2, 0.6, c) });
  if (k > 0.5 && a.cantholysis) el += lab('下支切斷：眼瞼鬆開', 'inferior cantholysis', 14, 150, a.cantholysis, { color: COL.red, bold: true, op: ss(0.5, 0.9, k) });
  let er = '';
  if (b.canthotomy) er += lab('水平剪到外側眶緣', 'canthotomy', 14, 64, b.canthotomy, { color: COL.red, bold: true, op: ss(0.2, 0.6, c) });
  er += lab(k > 0.5 ? '下支切斷' : '下支', 'inferior crus', 14, PH - 28, b.infCrus, { color: k > 0.5 ? COL.red : COL.accent, bold: true, op: T.on(1, 0.6, 0.8) });
  er += tag('第一步：canthotomy＋inferior cantholysis', T.on(0, 0.6) * (1 - T.on(1, 0.4)), COL.red, 30);
  er += tag('2 小時內處置，視力結果較好', T.on(2, 0.6), COL.accent, 30);
  er += note('步驟影片：ophlearning.github.io/videos/#lateral-canthotomy-ocs', T.on(3, 0.6), PH - 12);
  return { L: { svg: L.svg, extra: el, P: AX_P }, R: { svg: R.svg, extra: er, P: FR_P } };
};

// ---------------------------------------------------------------- 6 跟刀清單 (full panel)
DRAW2['6'] = T => {
  const items = ['核對 OS；血小板、PT／aPTT（輸不輸依主治與血液科）', '先記下角膜：TBUT 3 秒、下方 SPK、SCH', '切除皮膚、皮下與 orbicularis；每一層止血', '開眶隔 → retractor aponeurosis；認三團脂肪',
    '部分去脂；避開 inferior oblique；斷端止血', 'Orbicularis → aponeurosis：6-0 Prolene ×5', '閉眼：瞼緣方向；沒有活動性出血', '術後球後出血 → canthotomy＋inferior cantholysis'];
  let s = '';
  items.forEach((it, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 18 + col * 606, y = 16 + row * 96, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)), now = (T.u >= T.st(i + 1) && (i === 7 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 80, { op, hl: now }) + `<circle cx="${x + 36}" cy="${y + 40}" r="18" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` + text(x + 36, y + 47, String(i + 1), { size: 18, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 68, y + 47, it, { size: 16, op }); });
  return { F: { svg: s, P: { title: '跟刀清單（和列印單同一份）', orient: '做法與數值依院內常規' } } };
};
