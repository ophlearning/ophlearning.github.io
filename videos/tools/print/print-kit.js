// ============================================================================
// Print kit (videos/tools/print): drawing primitives for one-page A4 landscape sheets taped on the OR wall. sheet.html loads it, then
// layout.js (the three sheet layouts), then the video's print/ data files (README.md in this folder). print.js renders and checks.
//
// What this file gives the layouts (and a data file's draw functions):
//   PRINT.render(def)   page frame: title block (left: sheet title; right: surgery), body (def.body: html), footer
//                       (示意 line, video title + URL, def.sources = short source list for the numbers on the sheet, credit).
//   PRINT.view(o)       one figure of a shared model in two layers: the tissue drawn light (group opacity, stays vector) and the model's
//                       own overlays promoted on top in black (CSS in print.css: red → cut solid or incision dashed, purple → dashed
//                       planned line, blue → dotted suture). o.draw(V) adds print overlays and labels in figure mm (V.P maps model mm).
//   PRINT.inc / cut / sut / fix / num / lab / dim / arrow   B/W-safe overlays and the 「中文 English」 label, all in figure mm.
//   PRINT.legend()      the overlay legend and the orientation of each view type (stated once per sheet).
// Numbers: every digit on a sheet is checked by print.js against the video's ledger (check.js LEDGER) or the sheet's print ledger
// (def.ledger). Step numbers and scale bars are marked data-struct="step" / "scale" and checked separately.
// ============================================================================
const PRINT = (() => {
  const PT = 25.4 / 72;                                  // mm per point
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const f1 = v => (+v).toFixed(2);
  const pth = q => 'M' + q.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
  const cv = document.createElement('canvas').getContext('2d');
  // text width in mm of a string set at `pt` points
  function width(s, pt, bold) { cv.font = `${bold ? 700 : 500} 100px "Noto Sans TC"`; return cv.measureText(s).width / 100 * pt * PT; }

  // ---------------------------------------------------------------- camera: model window (mm) → figure (mm), window centred
  function cam(win, W, H) {
    const h = win.h || win.w * H / W, k = Math.min(W / win.w, H / h), x0 = win.x - (W / k - win.w) / 2, y0 = win.y - (H / k - h) / 2;
    return { k, tf: `scale(${k}) translate(${-x0} ${-y0})`, P: p => [(p[0] - x0) * k, (p[1] - y0) * k] };
  }
  function model(kind, state, id, o) {
    if (kind === 'sag') return LID.draw({ variant: 'asian', state, id });
    if (kind === 'cor') return CORONAL.draw({ variant: 'asian', state, id, windows: o.windows || [], section: false });
    if (kind === 'lsag') return LOWER.draw({ variant: 'asian', state, upper: o.upper ?? {}, id });
    if (kind === 'lcor') return CORONAL.draw({ variant: 'asian', state: o.upper || {}, lower: state, id, windows: o.windows || [], section: false });
    if (kind === 'axial') return CANTHUS.draw({ state, id });
    // cataract (globe/cataract.js, state { cat: … }): csec = meridional section, o.hp = the clock hour on its RIGHT (left = hp + 6; the
    // video's 12–6 section through the main incision is hp = main.h + 6); computed over the whole visible figure, not only o.win.
    // Optional (video ②): o.off = the plane's offset from the centre in mm (a cross-section across a groove, as the video's draw.js),
    // o.cut = instruments drawn where they cross the plane (cut ellipses) instead of projected; both default to the plain section.
    // cscope = microscope view, surgeon at 12 (下＝12 點、右＝temporal for OD)
    if (kind === 'csec') { const h = o.win.h || o.win.w * o.h / o.w, k = Math.min(o.w / o.win.w, o.h / h), vw = o.w / k, vh = o.h / k;
      return CATARACT.section({ st: state, h: o.hp ?? 6, off: o.off || 0, cut: !!o.cut, win: { x: o.win.x - (vw - o.win.w) / 2, y: o.win.y - (vh - h) / 2, w: vw, h: vh }, step: o.step || +(vw / 320).toFixed(4), id }); }
    if (kind === 'cscope') return CATARACT.enface({ st: state, id, surgeon: 12 });
    // posterior segment (posterior/posterior.js, state = the model's state; 2026-11-12, RRD PPV): psec = a section computed over the whole visible
    // figure — the meridional one through o.hp (the clock hour on its RIGHT, default 11; left = hp + 6; anterior up), or any o.plane { O, U, V }
    // (a trocar's tunnel GLOBE.planes.across(h, s), an instrument's shaft, the head view's POSTERIOR.headPlane(st)); o.step default visible width / 400.
    // phead = head position (the section through the tear turned so that gravity points down; the model's gravity arrow top right of the figure);
    // pfundus = fundus chart (examiner's drawing: 12 up); pwide = the surgeon's wide-angle view (the state's surgeon, inverter, look); pscope =
    // microscope view from above with the trocars (the state's surgeon, default 12). none = no model (print drawings only, o.draw).
    if (kind === 'psec' || kind === 'phead') { const v = visWin(o), step = o.step || +(v.w / 400).toFixed(4);
      return kind === 'phead' ? POSTERIOR.head({ st: state, win: v, step, id }) : POSTERIOR.section({ st: state, plane: o.plane || GLOBE.planes.meridian(o.hp ?? 11), win: v, step, id }); }
    if (kind === 'pfundus') return POSTERIOR.fundus({ st: state, id });
    if (kind === 'pwide') return POSTERIOR.wide({ st: state, id });
    if (kind === 'pscope') return POSTERIOR.ext({ st: state, id });
    // socket (socket/socket.js; 2026-11-13, SB removal in an eviscerated socket): ssec = meridional section through o.hp (right = hp, left = hp + 6,
    // anterior up); sfront = the surgeon's view of the OS socket, surgeon at 12. The model has none of the overlay colours: the sheet draws its
    // black overlays itself (draw), so both views are tissue only.
    if (kind === 'ssec') return SOCKET.sec({ state, h: o.hp ?? 12, id });
    if (kind === 'sfront') return SOCKET.front({ state, id });
    if (kind === 'none') return { svg: '', A: {} };
    throw new Error('unknown view ' + kind);
  }
  // the model window that fills the whole figure (o.win centred in a figure of o.w × o.h mm)
  const visWin = o => { const h = o.win.h || o.win.w * o.h / o.w, k = Math.min(o.w / o.win.w, o.h / h), vw = o.w / k, vh = o.h / k;
    return { x: o.win.x - (vw - o.win.w) / 2, y: o.win.y - (vh - h) / 2, w: vw, h: vh }; };
  const POST = /^p(sec|head|fundus|wide|scope)$/;
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  // tissue opacity per view kind (o.light overrides). 2026-11-13, first printout on the OR's B/W laser printer: at 50 % the pastel
  // fills and thin outlines of the eyelid sections almost vanished, while the coronal views stayed readable. Sections are drawn at
  // full strength; coronal views only a little darker (at 100 % the iris turns near-black and hides black dimension lines over it).
  // The same rule for the cataract and posterior-segment views (sections 100 %; microscope, fundus, wide-angle and head views 65 %).
  const TISSUE = { sag: 1, lsag: 1, axial: 1, csec: 1, psec: 1, phead: 1, cor: 0.65, lcor: 0.65, cscope: 0.65, pfundus: 0.65, pwide: 0.65, pscope: 0.65, ssec: 1, sfront: 0.65 };
  let nFig = 0;
  // o: { kind, state, win: {x, y, w[, h]}, w, h (figure mm), red: 'cut' | 'inc' | 'none', blue: false to hide, light (tissue opacity),
  //      windows, upper, draw: V => svg (print overlays and labels, figure mm), cap: caption under the figure }
  function view(o) {
    const id = o.id || ('pf' + (++nFig)), c = cam(o.win, o.w, o.h), a = model(o.kind, o.state, id + 'a', o), b = model(o.kind, o.state, id + 'b', o);
    const V = { P: c.P, k: c.k, A: mapA(a.A, c.P), M: a.A, r: a, w: o.w, h: o.h };
    const extra = o.draw ? o.draw(V) : '';
    const post = POST.test(o.kind), cls = ['ovl', o.red === 'inc' ? 'red-inc' : o.red === 'none' ? 'no-red' : '', o.blue === false ? 'no-blue' : '', o.amber ? 'amber' : '', ...(post ? ['post'] : [])].join(' ');
    const svg = `<svg class="fig" xmlns="http://www.w3.org/2000/svg" width="${o.w}mm" height="${o.h}mm" viewBox="0 0 ${o.w} ${o.h}">` +
      `<defs><clipPath id="${id}_clip"><rect width="${o.w}" height="${o.h}"/></clipPath></defs>` +
      `<g clip-path="url(#${id}_clip)"><g class="tis${post ? ' post' : ''}" opacity="${o.light ?? TISSUE[o.kind] ?? 0.5}"><g transform="${c.tf}">${a.svg}</g></g><g class="${cls}"><g transform="${c.tf}">${b.svg}</g></g></g>` +
      `<rect width="${o.w}" height="${o.h}" fill="none" stroke="#000" stroke-width="0.25"/>${extra}</svg>`;
    return { svg, V, html: `<div class="fig-wrap">${svg}${o.cap ? `<div class="fig-cap">${o.cap}</div>` : ''}</div>` };
  }

  // ---------------------------------------------------------------- B/W-safe overlays (figure mm)
  const W_INC = 0.75, W_CUT = 0.8, W_SUT = 0.7;
  const inc = (q, o = {}) => `<path d="${pth(q)}" fill="none" stroke="#000" stroke-width="${o.w || W_INC}" stroke-dasharray="${o.dash || '1.9 1.0'}" stroke-linecap="butt"/>`;
  const cut = (q, o = {}) => `<path d="${pth(q)}" fill="none" stroke="#000" stroke-width="${o.w || W_CUT}" stroke-linecap="round"/>`;
  const sut = (q, o = {}) => `<path d="${pth(q)}" fill="none" stroke="#000" stroke-width="${o.w || W_SUT}" stroke-dasharray="0.01 1.2" stroke-linecap="round"/>`;
  // numbered marker: suture = white disc with black ring; fixation point = filled black disc with a white number (data-struct="step")
  function num(p, n, o = {}) {
    const r = o.r || 2.1, fill = o.solid ? '#000' : '#fff', col = o.solid ? '#fff' : '#000', pt = o.pt || 9.5;
    return `<g><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="${fill}" stroke="#000" stroke-width="0.4"/>` +
      `<text data-struct="step" x="${f1(p[0])}" y="${f1(p[1] + pt * PT * 0.36)}" font-size="${f1(pt * PT)}" font-weight="700" text-anchor="middle" fill="${col}">${n}</text></g>`;
  }
  const fix = (p, n, o = {}) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${o.r || 0.9}" fill="#000"/>` + (n != null ? num([p[0] + (o.dx ?? 3.0), p[1] + (o.dy ?? -2.6)], n, { solid: true }) : '');
  const dot = (p, r = 0.55) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" fill="#000"/>`;
  // dimension line with end ticks
  function dim(a, b, o = {}) {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * 0.9, ny = (b[0] - a[0]) / d * 0.9;
    return `<g stroke="#000" stroke-width="${o.w || 0.35}" fill="none"><path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}"/>` +
      `<path d="M${f1(a[0] - nx)} ${f1(a[1] - ny)}l${f1(2 * nx)} ${f1(2 * ny)}M${f1(b[0] - nx)} ${f1(b[1] - ny)}l${f1(2 * nx)} ${f1(2 * ny)}"/></g>`;
  }
  function arrow(a, b, o = {}) {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d, s = o.head || 1.6;
    const l = [b[0] - ux * s - uy * s * 0.55, b[1] - uy * s + ux * s * 0.55], r = [b[0] - ux * s + uy * s * 0.55, b[1] - uy * s - ux * s * 0.55];
    return `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0] - ux * s * 0.6)} ${f1(b[1] - uy * s * 0.6)}" stroke="#000" stroke-width="${o.w || 0.45}" fill="none"/><path d="M${f1(b[0])} ${f1(b[1])}L${f1(l[0])} ${f1(l[1])}L${f1(r[0])} ${f1(r[1])}Z" fill="#000"/>`;
  }
  // 「中文 English」 label at text position (tx, ty) (figure mm, ty = baseline); leader line to anchor a. o: side 'R' (text ends at tx),
  // pt (default 9.5), bold, en false
  function lab(zh, en, tx, ty, a, o = {}) {
    const pt = o.pt || 9.5, z = pt * PT, right = o.side === 'R', w = width(zh, pt, o.bold ?? true) + (en ? 1.2 + width(en, pt, false) : 0);
    const x0 = right ? tx - w : tx, xe = right ? tx - w - 0.9 : tx + w + 0.9, ym = ty - z * 0.36;
    const ln = a ? `<line x1="${f1(xe)}" y1="${f1(ym)}" x2="${f1(a[0])}" y2="${f1(a[1])}" stroke="#fff" stroke-width="0.9"/><line x1="${f1(xe)}" y1="${f1(ym)}" x2="${f1(a[0])}" y2="${f1(a[1])}" stroke="#000" stroke-width="0.28"/>${dot(a, 0.45)}` : '';
    return `<g class="lbl">${ln}<text x="${f1(x0)}" y="${f1(ty)}" font-size="${f1(z)}" stroke="#fff" stroke-width="${f1(z * 0.32)}" paint-order="stroke" stroke-linejoin="round">` +
      `<tspan font-weight="${o.bold ?? true ? 700 : 500}">${esc(zh)}</tspan>${en ? `<tspan font-weight="400" dx="${f1(1.2)}">${esc(en)}</tspan>` : ''}</text></g>`;
  }
  // plain text in a figure
  const txt = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${f1((o.pt || 9.5) * PT)}" font-weight="${o.bold ? 700 : 500}" text-anchor="${o.anchor || 'start'}" stroke="#fff" stroke-width="${f1((o.pt || 9.5) * PT * 0.3)}" paint-order="stroke"${o.struct ? ` data-struct="${o.struct}"` : ''}>${esc(s)}</text>`;
  // scale bar of n mm (model) in figure mm, bottom-right by default
  function sbar(V, n = 5, o = {}) {
    const L = n * V.k, x1 = o.x ?? V.w - 2, x0 = x1 - L, y = o.y ?? V.h - 2;
    return `<g><path d="M${f1(x0)} ${f1(y)}H${f1(x1)}" stroke="#000" stroke-width="0.6"/><path d="M${f1(x0)} ${f1(y - 0.8)}v1.6M${f1(x1)} ${f1(y - 0.8)}v1.6" stroke="#000" stroke-width="0.35"/>` +
      txt(Math.min((x0 + x1) / 2, V.w - width(`${n} mm`, 9) / 2 - 0.6), y - 1.2, `${n} mm`, { pt: 9, anchor: 'middle', struct: 'scale' }) + `</g>`;   // label kept inside the figure
  }

  // ---------------------------------------------------------------- legend: overlays and orientation (once per sheet)
  const sample = (s, w = 14) => `<svg width="${w}mm" height="4mm" viewBox="0 0 ${w} 4">${s}</svg>`;
  function legend(o = {}) {
    const rows = {
      inc: [sample(inc([[1, 2], [13, 2]])), '<b>切口</b> incision：粗黑虛線'],
      cut: [sample(cut([[1, 2], [13, 2]])), '<b>切開・切除</b> cut：粗黑實線'],
      sut: [sample(sut([[1, 2], [10, 2]]) + num([12, 2], 'n', { r: 1.8, pt: 9.5 }).replace(' data-struct="step"', '')), '<b>縫線</b> suture：黑點線＋圈號（＝步驟）'],
      fix: [sample(fix([3, 2], null, { r: 1.0 }) + num([10, 2], 'n', { solid: true, r: 1.8, pt: 9.5 }).replace(' data-struct="step"', '')), '<b>固定點</b> fixation：黑點＋黑底號碼'],
      nerve: [sample(`<path d="M1 2H13" stroke="#000" stroke-width="0.4" stroke-dasharray="1.3 0.45 0.3 0.45"/>`), '<b>神經投影</b> nerve：細黑點劃線'],
    };
    let s = `<div class="legend">${(o.rows || ['inc', 'cut', 'sut', 'fix']).map(k => `<div class="row">${rows[k][0]}<span>${rows[k][1]}</span></div>`).join('')}`;
    s += `<div class="row"><span>淡色＝組織；黑色＝手術動作</span></div>`;
    for (const t of (o.orient || ORIENT_DEFAULT)) s += `<div class="row"><span>${t}</span></div>`;
    return s + `</div>`;
  }
  const ORIENT_DEFAULT = ['<b>術者視角</b>（正面）：檢查者面對病人，左＝temporal　右＝nasal', '<b>矢狀切面</b>（瞳孔中央）：左＝前　上＝上'];

  // ---------------------------------------------------------------- page frame
  // Built twice: the first pass puts every string on the page so the font subsets it needs can be loaded (labels are measured with
  // canvas, which needs the real font), the second pass builds the sheet with correct widths. window.SHEET_META marks it ready.
  async function render(def) {
    const build = () => {
      const M = def.meta, url = `https://ophlearning.github.io/videos/#${M.id}`, body = typeof def.body === 'function' ? def.body() : def.body;
      document.title = def.title + '｜' + M.short;
      document.body.innerHTML = `<div class="sheet" data-sheet="${esc(def.name)}">
      <div class="hd-left"><div class="hd-title">${esc(def.title)}</div><div class="hd-sub">${def.sub || ''}</div></div>
      <div class="hd-right"><b>${M.surgery}</b><br>${M.eye || ''}</div>
      <div class="body">${body}</div>
      <div class="footer"><div>${def.note || '示意圖，非手術錄影；各院做法不同處依院內常規。'}　教學影片：${url}</div><div class="credit">製作　張博淳</div>
      <div class="src">數字出處：${def.sources.map(esc).join('；')}</div></div></div>`; };
    build();
    const all = document.body.textContent + document.title;
    await Promise.all(['400', '500', '700'].map(w => document.fonts.load(`${w} 16px "Noto Sans TC"`, all)));
    await document.fonts.ready;
    build();
    fit();
    window.SHEET_META = { name: def.name, video: def.meta.id, sources: def.sources, ledger: def.ledger || {}, steps: def.steps || 0 };
  }
  // Narrower paper (LSs 270 mm) gets the same content: the title shrinks (not below 22 pt) until it ends before the left punched hole,
  // step headers (not below 9 pt) shrink until they fit on one line, and checklist items (not below 14 pt) and table text (not below
  // 9.5 pt) shrink in 0.5 pt steps until nothing overflows.
  // print.js still checks every box, so anything that cannot fit fails loudly instead of being cut.
  function fit() {
    const MMPX = 96 / 25.4, W = (window.PAPER || { w: 297 }).w;
    const t = document.querySelector('.hd-title');
    if (t) { const tw = () => { const r = document.createRange(); r.selectNodeContents(t); return r.getBoundingClientRect().width; };
      for (let pt = 25; tw() > (W / 2 - 40 - 4.5 - 1 - 10) * MMPX && pt > 22; ) { pt -= 0.5; t.style.fontSize = pt + 'pt'; } }
    const body = document.querySelector('.body'); if (!body) return;
    const over = () => body.scrollHeight > body.clientHeight + 1 || [...body.querySelectorAll('.ck-col, .fl-col')].some(c => c.scrollHeight > c.clientHeight + 1);
    // a header wraps when its text has line boxes at more than one height (the cell is a flex column, so its height alone does not show it)
    const lines = el => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].map(q => Math.round(q.top))).size; };
    body.querySelectorAll('.cell-hd').forEach(h => { const t = h.lastElementChild;
      for (let pt = 11; lines(t) > 1 && pt > 9; ) { pt -= 0.5; h.style.fontSize = pt + 'pt'; h.querySelectorAll('.no').forEach(n => n.style.fontSize = '11pt'); } });
    for (let pt = 16; over() && pt > 14 && body.querySelector('.ck-item, .fl-item'); ) { pt -= 0.5; body.querySelectorAll('.ck-item, .fl-item').forEach(e => e.style.fontSize = pt + 'pt'); }
    for (let pt = 10.5; over() && pt > 9.5 && body.querySelector('.tbl'); ) { pt -= 0.5; body.querySelectorAll('.tbl').forEach(e => e.style.fontSize = pt + 'pt'); }
  }
  // labels of one figure, one row each (rows ordered by anchor height, so labels never overlap and leaders do not cross); each label
  // sits at the edge nearer its anchor when the text fits between that edge and the anchor, else at the other edge. items: [zh, en, anchor, o]
  function labels(items, W, H, o = {}) {
    const its = items.filter(it => it && it[2]).map(it => ({ it, ay: it[2][1] })).sort((a, b) => a.ay - b.ay), n = its.length;
    if (!n) return '';
    const pt = o.pt || 9.5, z = pt * PT, g = o.gap || z * 1.45, m = o.inset ?? 1.3, lo = (o.y0 ?? 0.6) + z, hi = (o.y1 ?? H - 0.6) - 0.35;
    const ty = its.map(t => Math.min(hi, Math.max(lo, t.ay + z * 0.36)));
    for (let i = 1; i < n; i++) ty[i] = Math.max(ty[i], ty[i - 1] + g);
    if (ty[n - 1] > hi) { ty[n - 1] = hi; for (let i = n - 2; i >= 0; i--) ty[i] = Math.min(ty[i], ty[i + 1] - g); }
    return its.map((t, i) => { const [zh, en, a, lo2 = {}] = t.it, w = width(zh, pt, lo2.bold ?? true) + (en ? 1.2 + width(en, pt, false) : 0);
      const canL = a[0] > m + w + 1.5, canR = a[0] < W - m - w - 1.5;
      const left = lo2.side ? lo2.side === 'L' : canL && canR ? a[0] < W / 2 : canL ? true : canR ? false : a[0] > W / 2;
      return lab(zh, en, left ? m : W - m, ty[i], a, { pt, side: left ? 'L' : 'R', ...lo2 }); }).join('');
  }
  // labels in a column on one side of a figure, ordered by anchor height so leader lines do not cross. items: [zh, en, anchor, o]
  // side 'L' (text starts at x) or 'R' (text ends at x); y0 / y1 = top and bottom limits (figure mm); gap = min. baseline spacing
  function column(items, side, x, y0, y1, o = {}) {
    const its = items.filter(it => it && it[2]).map(it => ({ it, ay: it[2][1] })).sort((a, b) => a.ay - b.ay), n = its.length;
    if (!n) return '';
    const pt = o.pt || 9.5, z = pt * PT, g = o.gap || z * 1.5, lo = y0 + z, hi = y1 - 0.4;
    const ty = its.map(t => Math.min(hi, Math.max(lo, t.ay + z * 0.36)));
    for (let i = 1; i < n; i++) ty[i] = Math.max(ty[i], ty[i - 1] + g);
    if (ty[n - 1] > hi) { ty[n - 1] = hi; for (let i = n - 2; i >= 0; i--) ty[i] = Math.min(ty[i], ty[i + 1] - g); }
    return its.map((t, i) => lab(t.it[0], t.it[1], x, ty[i], t.it[2], { pt, side: side === 'R' ? 'R' : 'L', ...(t.it[3] || {}) })).join('');
  }
  return { PT, render, labels, column, view, cam, inc, cut, sut, num, fix, dot, dim, arrow, lab, txt, sbar, legend, width, esc, pth };
})();
