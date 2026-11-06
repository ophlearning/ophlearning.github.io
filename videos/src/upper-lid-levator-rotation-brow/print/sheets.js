// ============================================================================
// Printable OR-wall sheets of this video (rendered by videos/tools/print/print.js): 跟刀清單, 手術步驟圖, 關鍵解剖與數字速查.
// Content is reused from the video only: the checklist chapter (segment 7) and the keys / sources of anim/segments.js, the number ledger
// (../check.js), the parameters (anim/params.js) and the states of anim/draw.js (copied below with the same names: PRE, ROT0, EXC, OPEN,
// RES, ADV, NERVE_WIN, MIS_X, the coronal lid-crease window ROT and the margin zoom EPI). What the video marks 示意 or 依院內常規
// (overview-notes.md) is marked the same way here. Step numbers = the eight checklist items of segment 7.
// ============================================================================
const META = {
  id: 'upper-lid-levator-rotation-brow', short: '上眼瞼三合一',
  videoTitle: '上眼瞼三合一：marginal rotation＋levator resection＋internal brow fixation',
  surgery: '上眼瞼三合一',
  eye: 'marginal rotation＋levator resection＋internal brow fixation<br>同一個 lid crease 切口；再加 electric epilation　右眼 OD 示意圖',
};
// ---------------------------------------------------------------- states (anim/draw.js)
const PRE = { mrd1: LRP.mrdPre };
const ROT0 = { ...PRE, curl: MRP.entr, creaseH: LRP.incH[1] };
const EXC = { ...PRE, ...INC, excCut: 1, excRemove: 1 };
const OPEN = { ...EXC, septOpen: 1, fatUp: 1 };
const RES = { ...OPEN, dis: 1, resect: 1 };
const ADV = { ...RES, advance: 1, tarSut: 1, mrd1: LRP.mrdPost };
const BROW = { ...ADV, browSut: 1, browTie: 1 };                        // 3-2 after the tie (plane no longer highlighted, brow back to 0)
const NERVE_WIN = { poly: [[5.6, -27], [12.4, -27], [12.4, -16.0], [5.6, -16.0]], depth: 1 };
const MIS_X = [-3.2, -1.2];
const { view, labels, inc, cut, num, fix, dim, txt, sbar, legend } = PRINT;
const mixP = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const unitV = v => { const L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L]; };
// the coronal lid-crease approach (draw.js ROT): incision = levator lower line carried with the in-turned lash line; flap window
const ROT = (() => {
  const XS = []; for (let x = -12.4; x <= 9.8 + 1e-9; x += 0.2) XS.push(+x.toFixed(2));
  const fns = st => { const c = CORONAL.draw({ variant: 'asian', state: { ...st, excMark: 1e-6 } }); return { inc: x => c.excLoY(x) + c.rollY(x), lash: x => c.lashY(x) + c.rollY(x), cutY: c.cutY, Uy: c.Uy }; };
  const win = f => ({ poly: [...XS.map(x => [x, f.inc(x)]), ...XS.slice().reverse().map(x => [x, f.lash(x) - 0.35])], depth: 1 });
  const cutH = m => (d => d.at(LID.S_CUT, 0)[1] - d.at(0, 0)[1])(LID.draw({ state: { mrd1: m } }).DP);
  const tarsoY = (f, m) => { const k = cutH(m) / (f.cutY(0) - f.Uy(0)); return x => f.Uy(x) + (f.cutY(x) - f.Uy(x)) * k; };
  return { XS, fns, win, tarsoY };
})();
// the upper-lid margin zoom and the electrolysis needle (draw.js EPI)
const EPI = (() => {
  const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));
  const fol = r => { const E = r.DA.at(marginS(1.70), 1.70), B = r.DA.at(2.05, 1.56), d = unitV([B[0] - E[0], B[1] - E[1]]); return { E, B, d, L: Math.hypot(B[0] - E[0], B[1] - E[1]) }; };
  const ZST = { mrd1: LRP.mrdPost, misdirected: 1 };
  const F0 = fol(LID.draw({ state: ZST }));
  return { fol, ZST, F0, win: (w, h) => ({ x: F0.E[0] - 2.2, y: F0.E[1] - 2.6, w, h }) };
})();
// needle (instrument): black outline, white core; coagulated follicle: thin ring with a light fill (示意)
const needle = (a, b) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#fff" stroke-width="0.7" stroke-linecap="round"/>`;
const coag = (c, r) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="#bbb" fill-opacity="0.45" stroke="#000" stroke-width="0.3"/>`;

// ---------------------------------------------------------------- 1 跟刀清單 (segment 7: 術前 1 件、rotation 2、levator 2、眉毛 1、電解與收尾 2)
const CK = [
  ['術前', 1, '看清楚每一根碰到角膜的睫毛：<b>entropion</b>、<b>misdirected</b> 還是 <b>metaplastic</b>', '只轉瞼緣可能不夠：60 片眼瞼中 1 片瞼緣位置正確，內側仍有 2 根碰角膜（Cruz 2015a）'],
  ['術中①　Marginal rotation（從 lid crease 進去）', 2, '依院內常規畫線：距睫毛線 內側 <b>2.5</b>、中央 <b>4</b>、外側 <b>4 mm</b>（之後 levator 用同一條）；掀起皮膚肌肉瓣，露出瞼板到<b>睫毛根</b>', '睫毛根附近的 orbicularis 要剝乾淨：縫線縫在這裡（Cruz 2015a）'],
  ['', 3, '<b>瞼板全層切開</b>（位置依院內常規）→ 縫線把遠端瞼板拉過瞼緣段，<b>瞼緣往外轉</b>（針數、縫線依院內常規）', 'Contour 異常是 margin rotation 最常見的併發症之一：縫線要分散（Cruz 2015a）'],
  ['術中②　Levator resection', 4, '轉正之後再做 levator：切除 <b>5 mm</b> 寬的皮膚肌肉 → 開眶隔 → <b>Putterman clamp</b> 切除（依院內常規）', ''],
  ['術中②　Levator resection（續）', 5, '<b>4-0 vicryl ×3</b> 固定瞼板；請病人睜眼看<b>高度</b>、<b>contour</b>，以及瞼緣有沒有<b>又往內翻</b>', 'Ptosis 手術後的 entropion：瞼板摺起來的位置 70% 在上三分之一（Cruz 2023）'],
  ['術中③　Internal brow fixation', 6, '往上剝到眉下，避開 <b>supraorbital nerve</b>；眉下組織縫到骨膜 <b>4-0 vicryl ×1</b>；再量 <b>MRD1 約 2.5 mm</b>（依院內常規）', ''],
  ['電解與收尾', 7, '轉正後<b>還碰到角膜</b>的睫毛：細針<b>沿睫毛幹</b>進到毛囊電解（機器、能量、根數依院內常規）', '上眼瞼毛囊約 1.8 mm 深；要碰到 95% 的毛囊，針要插 2.4 mm（Elder 1997）'],
  ['', 8, '<b>睜眼、閉眼</b>一起看：高度、contour、瞼緣方向、閉眼；<b>6-0 Prolene ×4</b>、<b>7-0 ethilone</b> 縫合（依院內常規）', 'Ptosis 修復後閉不緊：第 1 天 60%、1 週 33%、6–20 週 9%（Tucker 2000）'],
];
function checklistBody() {
  const item = ([, n, a, note]) => `<div class="ck-item"><div class="ck-box"></div><div class="ck-no" data-struct="step">${n}</div><div><div class="ck-act">${a}</div>${note ? `<div class="ck-note">${note}</div>` : ''}</div></div>`;
  const col = items => `<div class="ck-col">${items.map(it => (it[0] ? `<div class="ck-sec">${it[0]}</div>` : '') + item(it)).join('')}</div>`;
  return `<div class="ck">${col(CK.slice(0, 4))}${col(CK.slice(4))}</div>`;
}

// ---------------------------------------------------------------- 2 手術步驟圖 (3 × 3: steps 1–8 + legend; each step: sagittal + surgeon's view, same state)
const FW = 43, FH = 41.4;   // figure size (mm)
const ROT_SAG = { x: -21.5, y: -10.4, w: 14, h: 13.5 }, LID_SAG = { x: -21, y: -9.2, w: 14, h: 13.5 }, SAG_LID = { x: -22.5, y: -19.5, w: 22 }, SAG_BROW = { x: -27.5, y: -31.5, w: 36 };
const ROT_COR = { x: -12.5, y: -15, w: 23 }, COR_LID = { x: -14, y: -16.5, w: 27 }, COR_FACE = { x: -21, y: -29.5, w: 41 }, CZ_WIN = { x: -8.6, y: -9.6, w: 12.5 };
const LB = items => labels(items, FW, FH);
// step marker in a free spot of the figure, with a thin leader to what it marks (solid = fixation point)
const mark = (a, pos, n, solid) => `<line x1="${a[0]}" y1="${a[1]}" x2="${pos[0]}" y2="${pos[1]}" stroke="#000" stroke-width="0.28"/>` + num(pos, n, { solid });
// sagittal rotation overlays drawn here (the model's red is hidden): the lid-crease skin incision dashed, the tarsotomy solid
const creaseInc = V => { const a = V.M.creaseSkin, c = V.M.creaseCut; if (!a || !c) return ''; const t = [a[0] + (c[0] - a[0]) / 0.35, a[1] + (c[1] - a[1]) / 0.35]; return inc([V.P(a), V.P(t)]); };
const tarsotomy = V => cut([V.P(V.r.DP.at(LID.S_CUT, 0)), V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR))]);
const corRot = (st, o) => { const s = { ...INC, ...st }, f = ROT.fns(s); return { s, f, windows: o.flap ? [ROT.win(f)] : [] }; };
const levAt = V => V.P(V.r.LV.off(V.r.LV.near([1, -17.6]), 0.5));
const STEPS = [];
// 1 術前: the in-turned margin and misdirected lashes (1-1; number and position of the lashes 示意)
STEPS.push({ n: 1, hd: '術前：每根碰角膜的睫毛是哪一種機轉',
  sag: { state: { ...PRE, curl: MRP.entr, misdirected: 1 }, win: LID_SAG, red: 'none', draw: V => LB([['瞼緣內轉', 'entropion', V.A.lash], ['角膜', 'cornea', V.A.cornea], ['瞼板', 'tarsus', V.P(V.r.DP.at(4, 0.5))]]) },
  cor: { state: { ...PRE, evert: -MRP.entr, misdirected: 1 }, win: COR_LID, draw: V => LB([['歪的睫毛', 'misdirected', V.A.misLash], ['睫毛碰角膜', 'entropion', V.P([4, V.r.lashY(4) + V.r.rollY(4) + 1.2])]]) } });
// 2 畫線 2.5 / 4 / 4 mm → crease incision → skin–muscle flap down to the lash roots (2-1 end)
{ const R = corRot({ ...PRE, evert: -MRP.entr }, { flap: 1 });
  STEPS.push({ n: 2, hd: '畫線 2.5／4／4 mm → 掀瓣到睫毛根',
    sag: { state: { ...ROT0, crease: 1, flap: 1 }, win: ROT_SAG, red: 'none', draw: V => creaseInc(V) + LB([['切口', 'crease incision', V.A.creaseSkin], ['皮膚肌肉瓣', 'flap', V.A.flap], ['瞼板', 'tarsus', V.A.exposedTarsus]]) },
    cor: { state: R.s, win: ROT_COR, windows: R.windows, draw: V => { const f = R.f, X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], nm = ['外', '中', '內'];
      const top = x => f.lash(x) - 0.35, bot = x => top(x) + 1.6;
      let s = `<g opacity="0.5"><path d="${PRINT.pth([...ROT.XS.map(x => V.P([x, top(x)])), ...ROT.XS.slice().reverse().map(x => V.P([x, bot(x)]))])}Z" fill="#e9b89c" stroke="#b07a5e" stroke-width="0.3"/></g>`;
      s += inc(ROT.XS.map(x => V.P([x, f.inc(x)])));
      X.forEach((x, i) => { s += dim(V.P([x, f.lash(x) - 0.4]), V.P([x, f.inc(x)]), { w: 0.3 }) + txt(V.P([x, 0])[0], V.P([x, f.inc(x)])[1] - 1.4, `${nm[i]} ${H[i]}`, { pt: 9.5, bold: true, anchor: 'middle' }); });
      return s + LB([['翻下的瓣', 'flap', V.P([-6, f.lash(-6) + 1.25])], ['窗內瞼板', 'tarsus', V.P([3, (f.inc(3) + f.lash(3)) / 2])]]); } } }); }
// 3 tarsotomy → buried sutures → margin turned out, flap laid back (2-3 end)
{ const R = corRot({ ...PRE, evert: 0, buried: 1 }, { flap: 0 });
  STEPS.push({ n: 3, hd: '瞼板全層切開 → 埋線 → 瞼緣外轉（示意）',
    sag: { state: { ...ROT0, crease: 1, flap: 0, cut: 1, suture: 1, buried: true, curl: MRP.after }, win: ROT_SAG, red: 'none',
      draw: V => tarsotomy(V) + LB([['瞼緣外轉', 'everted', V.A.lash], ['埋線', 'buried suture', V.A.suture], ['瞼板切開', 'tarsotomy', V.P(V.r.DP.at(LID.S_CUT, LID.U_TAR * 0.5))]]) + mark(V.A.suture, [FW - 4, FH - 4], 3) },
    cor: { state: R.s, win: ROT_COR, draw: V => { const y = ROT.tarsoY(R.f, R.s.mrd1); return cut(ROT.XS.map(x => V.P([x, y(x)])), { w: 0.5 }) +
      LB([['三針', 'sutures ×3', V.A.buried], ['瞼板切開', 'tarsotomy', V.P([6.5, y(6.5)])]]) + mark(V.A.buried, [FW - 4, FH - 4], 3); } } }); }
// 4 levator: 5 mm skin–muscle strip removed, septum opened, Putterman clamp and resection (3-1, line 3 end)
STEPS.push({ n: 4, hd: 'Levator：切除 5 mm 皮膚肌肉 → clamp',
  sag: { state: { ...RES, clamp: 1 }, win: SAG_LID, draw: V => LB([['提上瞼肌', 'levator', levAt(V)], ['Putterman clamp', '', V.A.clamp], ['切除線', 'resection', V.P(V.r.LVd.off(V.M.lid.sClamp, 0.3))]]) },
  cor: { state: { ...RES, clamp: 1 }, win: COR_LID, draw: V => { const xs = ROT.XS, a = V.P([2.5, V.r.excLoY(2.5)]), b = V.P([2.5, V.r.excHiY(2.5)]);
    return cut(xs.map(x => V.P([x, V.r.excLoY(x)]))) + cut(xs.map(x => V.P([x, V.r.excHiY(x)]))) + dim(a, b, { w: 0.35 }) + LB([['Clamp（皮下虛線）', '', V.A.clamp], [`寬 ${LRP.excW} mm`, '', mixP(a, b, 0.5)]]); } } });
// 5 levator fixed to the tarsus with 4-0 vicryl ×3; height, contour, margin direction (3-1 end)
STEPS.push({ n: 5, hd: '4-0 vicryl ×3 固定瞼板；看高度與方向',
  sag: { state: ADV, win: SAG_LID, red: 'none', draw: V => num([V.A.tarSut[0] + 3.6, V.A.tarSut[1] + 4.2], 5) + LB([['固定到瞼板', 'tarsus', V.A.tarSut], ['瞼緣又內翻？', 'margin', V.P(V.r.DP.at(0, 0))]]) },
  cor: { state: ADV, win: COR_LID, red: 'none', draw: V => { let s = num([V.A.tarSutC[0] + 9.5, V.A.tarSutC[1] + 3.4], 5);
    s += `<path d="${PRINT.pth(ROT.XS.map(x => V.P([x, V.r.Uy(x)])))}" fill="none" stroke="#000" stroke-width="0.35" stroke-dasharray="0.6 0.6"/>`;
    return s + LB([['三針', 'sutures ×3', V.A.tarSutC], ['瞼緣弧度', 'contour', V.P([6, V.r.Uy(6)])]]); } } });
// 6 brow: ROOF to the periosteum, 4-0 vicryl ×1, avoiding the supraorbital nerve; MRD1 about 2.5 mm (3-2)
STEPS.push({ n: 6, hd: '剝到眉下 → 4-0 vicryl ×1；MRD1',
  sag: { state: BROW, win: SAG_BROW, red: 'none', draw: V => num([V.A.browSutP[0] + 4, V.A.browSutP[1] - 0.6], 6) + LB([['眉毛', 'eyebrow', V.A.brow], ['眉下脂肪', 'ROOF', V.A.roof], ['骨膜', 'periosteum', V.A.periosteum]]) },
  cor: { state: { ...BROW, notch: 1 }, win: COR_FACE, windows: [NERVE_WIN], red: 'none', amber: true, draw: V => { const a = V.P([0, 0]), b = V.P([0, V.r.Uy(0)]);
    return fix(V.A.browFix, null) + dim(a, b, { w: 0.4 }) + LB([['眶上神經', 'SO nerve', V.A.notch], ['固定點', 'fixation', V.A.browFix], [`MRD1 約 ${LRP.mrdPost} mm`, '', mixP(a, b, 0.5)]]) + mark(V.A.browFix, [V.A.browFix[0] - 4, V.A.browFix[1] + 7], 6, true); } } });
// 7 electrolysis of a lash still touching the cornea: the needle along the shaft to the follicle (4-2, needle in, before the lash is pulled)
{ const F = EPI.F0;
  STEPS.push({ n: 7, hd: '還碰角膜的睫毛：沿睫毛幹電解',
    sag: { state: EPI.ZST, win: EPI.win(5, 4.85), red: 'none', draw: V => { const out = V.P([F.E[0] - F.d[0] * 0.9, F.E[1] - F.d[1] * 0.9]), tip = V.P(F.B);
      return coag(tip, 0.28 * V.k) + needle(out, tip) + num([tip[0] + 4, tip[1] + 4.2], 7) + sbar(V, 1, { x: FW - 2 }) +
        LB([['電解針', 'needle', mixP(out, tip, 0.25)], ['毛囊根部', 'follicle', tip], ['歪的睫毛', 'misdirected', V.P(mixP(F.E, V.M.misLash, 0.12))]]); } },
    cor: { state: EPI.ZST, win: CZ_WIN, red: 'none', draw: V => { let s = '';
      for (const x of MIS_X) { const y = V.r.lashY(x) + V.r.rollY(x) + 0.1; s += coag(V.P([x, y - 0.45]), 0.35 * V.k) + needle(V.P([x - 0.25, y + 2.6]), V.P([x, y])); }
      return s + LB([['針從根部進', 'at the root', V.P([MIS_X[1], V.r.lashY(MIS_X[1])])], ['角膜', 'cornea', V.P([1.2, -1.0])]]); } } }); }
// 8 levator to orbicularis 6-0 Prolene ×4, skin 7-0 ethilone; open and close the eyes together (3-2 end, 5-1)
STEPS.push({ n: 8, hd: '6-0 Prolene ×4；7-0 ethilone；睜閉眼',
  sag: { state: { ...BROW, creaseFix: 1 }, win: SAG_LID, red: 'none', draw: V => num([V.A.creaseFix[0] + 3.4, V.A.creaseFix[1] + 3.6], 8) + LB([['縫到 orbicularis', '', V.A.creaseFix], ['角膜', 'cornea', V.A.cornea]]) },
  cor: { state: { ...BROW, creaseFix: 1 }, win: COR_LID, red: 'none', draw: V => num([V.A.creaseFix[0] + 9, V.A.creaseFix[1] + 3.4], 8) + LB([['四針', 'sutures ×4', V.A.creaseFix]]) } });

function stepsBody() {
  const cell = s => { const a = view({ kind: 'sag', w: FW, h: FH, red: 'cut', ...s.sag }), b = view({ kind: 'cor', w: FW, h: FH, red: 'cut', ...s.cor });
    return `<div class="cell"><div class="cell-hd"><span class="no" data-struct="step">${s.n}</span><span>${s.hd}</span></div><div class="figs">${a.html}${b.html}</div></div>`; };
  return `<div class="grid" style="grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr)">${STEPS.map(cell).join('')}<div class="cell">${legend({ rows: ['inc', 'cut', 'sut', 'fix', 'nerve'], orient: [
    '<b>左圖 矢狀切面</b>（瞳孔中央；第 <span data-struct="step">7</span> 步為瞼緣放大）：左＝前　上＝上', '<b>右圖 術者視角</b>（正面）：檢查者面對病人，左＝temporal　右＝nasal',
    '縫線位置、針數、內翻程度、睫毛根數：示意'] })}</div></div>`;
}

// ---------------------------------------------------------------- 3 關鍵解剖與數字速查
function anatomyBody() {
  const HF = 73;
  const S = view({ kind: 'sag', state: { ...INC }, win: { x: -32, y: -31.5, w: 40, h: 34 }, w: 92, h: HF, red: 'none', draw: V => {
    const DP = V.r.DP, a = V.P(DP.at(0, -0.3)), b = V.P(DP.at(LID.S_CUT, -0.3)), ia = V.A.incLo;
    let s = dim(a, b, { w: 0.4 }) + `<circle cx="${ia[0]}" cy="${ia[1]}" r="1" fill="#fff" stroke="#000" stroke-width="0.5"/>`;
    s += PRINT.column([['眉毛', 'eyebrow', V.A.brow], ['眉下脂肪', 'ROOF', V.A.roof], ['眶隔', 'septum', V.A.septum], ['切口 4 mm（院內常規）', '', ia], ['睫毛', 'lashes', V.A.lash],
      ['瞼板切開：離瞼緣 3 mm', '', mixP(a, b, 0.5)]], 'L', 1.5, 1, V.h - 0.5, { gap: 5.1 });
    s += PRINT.column([['骨膜', 'periosteum', V.A.periosteum], ['眶上緣', 'orbital rim', V.P([-12.4, -18.3])], ['提上瞼肌', 'levator', V.P(V.r.LV.off(V.r.LV.near([1, -17.6]), 0.5))], ['腱膜前脂肪', 'fat', V.A.fat],
      ['腱膜', 'aponeurosis', V.A.apo], ['穆勒氏肌', 'Müller', V.A.muller], ['瞼板', 'tarsus', V.A.tarsus]], 'R', V.w - 1.5, 1, V.h - 0.5, { gap: 5.1 });
    return s + sbar(V, 5, { x: V.w * 0.62, y: 4.5 }); } });
  const F = EPI.F0;
  const Z = view({ kind: 'sag', state: EPI.ZST, win: EPI.win(5, 7.2), w: 58, h: HF, red: 'none', draw: V => {
    const n = [F.d[1], -F.d[0]], o = n[0] < 0 ? n : [-n[0], -n[1]], a = [F.E[0] + o[0] * 0.25, F.E[1] + o[1] * 0.25], b = [a[0] + F.d[0] * EP.follicleUp, a[1] + F.d[1] * EP.follicleUp];
    const q = [F.E[0] + F.d[0] * EP.reach95Up, F.E[1] + F.d[1] * EP.reach95Up], qa = V.P([q[0] + n[0] * 0.5, q[1] + n[1] * 0.5]), qb = V.P([q[0] - n[0] * 0.5, q[1] - n[1] * 0.5]);
    let s = dim(V.P(a), V.P(b), { w: 0.4 }) + `<path d="M${qa[0]} ${qa[1]}L${qb[0]} ${qb[1]}" stroke="#000" stroke-width="0.6"/>`;
    s += labels([[`毛囊深 ${EP.follicleUp} mm`, `（下眼瞼 ${EP.follicleLo}）`, V.P(mixP(a, b, 0.5))], ['歪的睫毛', 'misdirected', V.P(mixP(F.E, V.M.misLash, 0.12))],
      [`插 ${EP.reach95Up} mm：碰到 95%`, '', mixP(qa, qb, 0.5)], ['瞼板', 'tarsus', V.A.tarsusZ || V.A.tarsus]], V.w, V.h - 7, { gap: 5.2 });
    return s + sbar(V, 1); } });
  const C = view({ kind: 'cor', state: { ...PRE, ...INC, excMark: 1, notch: 1 }, win: { x: -23, y: -29.5, w: 44, h: 31 }, w: 116, h: HF, windows: [NERVE_WIN], amber: true, red: 'none', draw: V => {
    const X = [LRP.incX[1], 0, LRP.incX[0]], H = [LRP.incH[2], LRP.incH[1], LRP.incH[0]], nm = ['外', '中', '內'];
    let s = ''; const hs = []; X.forEach((x, i) => { const p = V.P([x, V.r.lashY(x)]), q = V.P([x, V.r.excLoY(x)]); s += dim(p, q, { w: 0.3 }); hs.push([`${nm[i]} ${H[i]} mm`, '', mixP(p, q, 0.5)]); });
    const a = V.P([2.5, V.r.excLoY(2.5)]), b = V.P([2.5, V.r.excHiY(2.5)]); s += dim(a, b, { w: 0.35 });
    s += labels([['眉毛', 'eyebrow', V.A.brow], ['上切口線：切除寬 5 mm', 'upper line', V.P([-9, V.r.excHiY(-9)])], ['下切口線＝rotation 與 levator 共用', 'lower line', V.P([-10.5, V.r.excLoY(-10.5)])],
      ['眶上切跡與神經（開窗示意）', 'SO notch', V.A.notch], ...hs], V.w, V.h, { gap: 5.1 });
    return s + sbar(V, 10, { x: V.w * 0.45, y: 5 }); } });
  const row = (a, v, s) => `<tr><td>${a}</td><td class="v">${v}</td>${s ? `<td class="s">${s}</td>` : ''}</tr>`;
  const T1 = `<table class="tbl"><tr><th colspan="2">依院內常規（刀後依 OP note 確認）</th></tr>
    ${row('切口：rotation 與 levator 共用', '距睫毛線 內 2.5／中 4／外 4 mm', '')}${row('切除皮膚寬', '5 mm', '')}
    ${row('Levator → 瞼板', '4-0 vicryl ×3', '')}${row('眉下組織 → 骨膜', '4-0 vicryl ×1', '')}${row('眉毛固定後 MRD1', '約 2.5 mm', '')}
    ${row('Levator → orbicularis；縫皮', '6-0 Prolene ×4；7-0 ethilone', '')}
    ${row('Rotation：瞼板切開位置、針數、縫線', '依院內常規（圖為示意）', '')}${row('電解：機器、能量、時間、根數', '依院內常規', '')}</table>`;
  const T2 = `<table class="tbl"><tr><th>文獻的數字</th><th></th><th>出處</th></tr>
    ${row('Lid crease rotation：瞼板切開', '離瞼緣 3 mm；15 號刀＋Westcott；6-0 vicryl 三針埋線', 'Cruz 2015a')}
    ${row('只轉瞼緣', '60 片中 1 片位置正確，內側仍有 2 根碰角膜', 'Cruz 2015a')}
    ${row('Ptosis 手術後 entropion（10 位）', '瞼板摺在上三分之一 70%；9 位從 lid crease 前路', 'Cruz 2023')}
    ${row('Ptosis 修復後閉不緊', '第 1 天 60%、1 週 33%、6–20 週 9%', 'Tucker 2000')}
    ${row('矯正後眉毛下降', '平均 2.5–2.9 mm', 'Kokubo 2019')}
    ${row('上眼瞼毛囊（下眼瞼）', '深 1.8（0.9）mm；碰到 95%：插 2.4（1.4）mm', 'Elder 1997')}
    ${row('電解一次不一定好', 'RF 3 mm 深：55% 只破壞部分毛囊根部', 'Singh 2022')}
    ${row('超細針電解（24 眼瞼）', '一次成功 66.6%；瞼緣缺口 16.6%、色素變淡 8.3%', 'Sakarya 2010')}</table>`;
  return `<div style="display: flex; flex-direction: column; gap: 2.5mm; height: 100%">
    <div style="display: flex; gap: 2.5mm">${S.html}${Z.html}${C.html}</div>
    <div style="display: grid; grid-template-columns: 86mm 1fr 50mm; gap: 3mm">${T1}${T2}${legend({ rows: ['inc', 'nerve'], orient: [
      '<b>左、中圖 矢狀切面</b>（瞳孔中央；中圖＝瞼緣放大）：左＝前　上＝上', '<b>右圖 術者視角</b>（正面）：面對病人，左＝temporal　右＝nasal'] })}</div></div>`;
}

const SHEETS = {
  checklist: { name: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼', meta: META, steps: 8, body: checklistBody,
    sources: ['Cruz 2015a', 'Cruz 2023', 'Elder 1997', 'Tucker 2000'] },
  steps: { name: 'steps', title: '手術步驟圖', sub: '左＝矢狀切面（機轉）　右＝術者視角（正面），同一個狀態', meta: META, steps: 8, body: stepsBody,
    sources: ['Cruz 2015a'] },
  anatomy: { name: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規', meta: META, steps: 8, body: anatomyBody,
    sources: ['Cruz 2015a', 'Cruz 2023', 'Tucker 2000', 'Kokubo 2019', 'Elder 1997', 'Singh 2022', 'Sakarya 2010'] },
};
