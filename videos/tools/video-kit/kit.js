// ============================================================================
// Shared video kit (videos/tools/video-kit): layout, timeline, views and labels for teaching videos built on the shared models.
// A video page loads, in order:
//   ../../../models/fonts/package/{400,500,700}.css · this file · the model scripts (e.g. eyelid/lid.js, coronal.js)
//   · segments.js (VIDEO, CHAPTERS, REFS, SEGS) · draw.js (DRAW2) · timeline.js (optional, from tts/assemble.py) · <script>KIT.start()</script>
// Each video then only provides text (segments.js) and the drawing of each segment (draw.js: DRAW2[id](T) → { L, R } or { F }).
// Layout: header (chapter tag + title + chapter progress) · two panels (dual) or one wide panel (full) · key box with 來源 · caption bar;
// chapter cards; title layout; scrolling references with the credit line.
// Globals read by videos/tools/check-video.js and ref-check.js: PANELS, CONTENT_Y, CONTENT_H, SEGS, DRAW2, renderAt, TL_EXPORT.
// Every label drawn with VIEWS.lab2 is a <g class="lbl"> (check-video.js checks those: inside the panel, no overlap).
// ============================================================================
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const ss = (a, b, x) => ease((x - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = x => Math.max(0, Math.min(1, x));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const COL = { ink: '#1d2733', sub: '#5b6878', line: '#97a4b2', accent: '#0e7c6b', red: '#d23c3c', suture: '#2463eb', amber: '#b86e00', roof: '#9a5b12', purple: '#5b3fa0' };
const _cv = document.createElement('canvas').getContext('2d');
function measure(txt, size = 15.5, bold = false) { _cv.font = `${bold ? 700 : 400} ${size}px "Noto Sans TC"`; return _cv.measureText(txt).width; }
function text(x, y, s, o = {}) {
  return `<text x="${x}" y="${y}"${o.cls ? ` class="${o.cls}"` : ''} fill="${o.color || COL.ink}" font-size="${o.size || 16}" font-weight="${o.bold ? 700 : (o.w || 400)}" text-anchor="${o.anchor || 'start'}" opacity="${o.op ?? 1}">${esc(s)}</text>`;
}
// text with a white halo, readable over a drawing
const htext = (x, y, s, o = {}) => text(x, y, s, o).replace('<text ', '<text stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round" ');
function tblock(x, y, lines, o = {}) { const lh = o.lh || (o.size || 16) * 1.55; return lines.map((l, i) => text(x, y + i * lh, l, o)).join(''); }
function card(x, y, w, h, o = {}) {
  const hl = o.hl ?? 0;
  return `<g opacity="${o.op ?? 1}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${o.fill || (hl > 0 ? `rgba(14,124,107,${0.07 * hl})` : '#f7f9fa')}" stroke="${o.stroke || (hl > 0.5 ? COL.accent : '#d3dae1')}" stroke-width="${hl > 0.5 ? 2 : 1}"/></g>`;
}
function richLines(x, y, html, size, lh, color) { // <b>…</b> = accent bold; \n = new line
  return html.split('\n').map((ln, i) => {
    const parts = ln.split(/(<b>.*?<\/b>)/).filter(Boolean).map(p => p.startsWith('<b>') ? `<tspan fill="${COL.accent}" font-weight="700">${esc(p.slice(3, -4))}</tspan>` : `<tspan>${esc(p)}</tspan>`);
    return `<text x="${x}" y="${y + i * lh}" font-size="${size}" fill="${color}">${parts.join('')}</text>`;
  }).join('');
}

// ---------------------------------------------------------------- layout constants (check-video.js reads PANELS / CONTENT_Y / CONTENT_H)
const PANEL_Y = 64, PANEL_H = 444, CONTENT_Y = 96, CONTENT_H = 410;
const PANELS = { dual: [['L', 24, 608], ['R', 648, 608]], full: [['F', 24, 1232]] };   // [key, x, width]
const PW = 606, PH = CONTENT_H, FW = 1230;                                               // drawing area of one dual panel / the full panel (px)
const SAG_T = { title: '矢狀切面（中央）sagittal', orient: '左＝前　上＝上' };
const COR_T = { title: '正面　右眼 OD　coronal', orient: '檢查者面對病人：左＝temporal　右＝nasal' };
const EV_T = { title: '翻開上眼瞼　右眼 OD　everted', orient: '瞼緣翻到上方　左＝temporal　右＝nasal' };

// ---------------------------------------------------------------- views: a camera maps a model window (mm) onto a panel (px)
const VIEWS = (() => {
  function cam(win, W, H) {
    const k = Math.min(W / win.w, H / (win.h || win.w * H / W)), x0 = win.x, y0 = win.y;
    return { k, tf: `scale(${k}) translate(${-x0} ${-y0})`, P: p => [(p[0] - x0) * k, (p[1] - y0) * k] };
  }
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  // sagittal mechanism section (LID.draw). id must be unique per panel (clip / mask names are prefixed with it)
  function sag(state, W, H, win, id, opt = {}) {
    const c = cam(win, W, H), r = LID.draw({ variant: opt.variant || 'asian', state, id });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r };
  }
  // coronal (skin side, with dissection windows) — the surgeon's view
  function cor(state, W, H, win, id, opt = {}) {
    const c = cam(win, W, H), r = CORONAL.draw({ variant: opt.variant || 'asian', state, id, windows: opt.windows || [], section: opt.section ?? false });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r };
  }
  // everted upper lid
  function ev(state, W, H, win, id) {
    const c = cam(win, W, H), r = CORONAL.drawEverted({ state, id });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r };
  }
  // bilingual label 「中文 English」 with a leader line to anchor a (panel px). o: side 'R', bold, color, lc, op, size, enColor
  function lab2(zh, en, tx, ty, a, o = {}) {
    const z = o.size || 15, right = o.side === 'R', w = measure(zh, z, o.bold) + (en ? 6 + measure(en, z, false) : 0);
    const col = o.color || COL.ink, lc = o.lc || o.color || '#5f6d7b', x1 = right ? tx - w - 7 : tx + w + 7, x0 = right ? tx - w : tx;
    const ln = a ? `<line x1="${x1}" y1="${ty - z * 0.36}" x2="${a[0]}" y2="${a[1]}" stroke="#fff" stroke-width="3.2" opacity="0.8"/><line x1="${x1}" y1="${ty - z * 0.36}" x2="${a[0]}" y2="${a[1]}" stroke="${lc}" stroke-width="1.2"/><circle cx="${a[0]}" cy="${a[1]}" r="2.8" fill="${lc}" stroke="#fff" stroke-width="1"/>` : '';
    return `<g opacity="${o.op ?? 1}" class="lbl">${ln}<text x="${x0}" y="${ty}" font-size="${z}" stroke="#fff" stroke-width="3.6" paint-order="stroke" stroke-linejoin="round"><tspan fill="${col}" font-weight="${o.bold ? 700 : 500}">${esc(zh)}</tspan>${en ? `<tspan fill="${o.enColor || '#5b6878'}" dx="6">${esc(en)}</tspan>` : ''}</text></g>`;
  }
  // camera between two windows: width zooms geometrically, centre moves linearly
  const zwin = (a, b, z, W = PW, H = PH) => { const r = H / W, w = Math.exp(lerp(Math.log(a.w), Math.log(b.w), z)), cx = lerp(a.x + a.w / 2, b.x + b.w / 2, z), cy = lerp(a.y + a.w * r / 2, b.y + b.w * r / 2, z);
    return { x: cx - w / 2, y: cy - w * r / 2, w }; };
  // 1 mm (or n mm) scale bar, bottom left of a panel
  const sbar = (k, op, n = 1, H = PH) => `<g opacity="${op}"><rect x="14" y="${H - 46}" width="${(k * n + 12).toFixed(1)}" height="34" rx="5" fill="#fff" opacity="0.85"/><path d="M20 ${H - 20}h${(k * n).toFixed(1)}" stroke="${COL.ink}" stroke-width="3"/>${text(20 + k * n / 2, H - 27, n + ' mm', { size: 13, bold: true, anchor: 'middle' })}</g>`;
  // dimension arrow between two panel points with a label beside it
  const dim = (a, b, col = COL.accent, op = 1) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d * 5, ny = (b[0] - a[0]) / d * 5;
    return `<g opacity="${op}" stroke="${col}" stroke-width="2" fill="none"><path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/><path d="M${(a[0] - nx).toFixed(1)} ${(a[1] - ny).toFixed(1)}l${(2 * nx).toFixed(1)} ${(2 * ny).toFixed(1)}M${(b[0] - nx).toFixed(1)} ${(b[1] - ny).toFixed(1)}l${(2 * nx).toFixed(1)} ${(2 * ny).toFixed(1)}"/></g>`; };
  return { cam, sag, cor, ev, lab2, zwin, sbar, dim };
})();

// ---------------------------------------------------------------- the kit: timeline, layout, frame
const KIT = (() => {
  const LEAD = 0.7, GAP = 0.45, TAIL = 1.2, CARD = 2.8;   // same values as video-kit/tts/assemble.py
  const CREDIT = '製作　張博淳';   // no hospital name: the videos follow a department template (CLAUDE.md)
  let TL = null, DURATION = 0, CH_SPAN = [];
  // fallback when there is no timeline.js yet: estimate each narration line from its length
  function capLen(s) { const t = s.replace(/\n/g, '');
    return (t.match(/[　-鿿＀-￯]/g) || []).length + (t.match(/[A-Za-z]+/g) || []).length * 1.7 + (t.match(/[0-9.]+%?/g) || []).length * 2.2; }
  function buildTimeline() {
    const ext = window.TIMELINE; let t = 0; const out = [];
    for (const sg of SEGS) {
      if (ext && ext.segs[sg.id]) { const e = ext.segs[sg.id]; out.push({ sg, t0: e.t0, t1: e.t1, lines: e.lines }); t = e.t1; continue; }
      const t0 = t; let tt = t0 + (sg.chapterCard ? 0 : (sg.lead ?? LEAD)); const lines = [];
      for (const l of (sg.lines || [])) { const d = Math.max(1.6, capLen(l) / 4.2); lines.push([tt, tt + d]); tt += d + GAP; }
      const t1 = sg.chapterCard ? t0 + CARD : sg.dur ? t0 + sg.dur : tt - GAP + (sg.tail ?? TAIL);
      out.push({ sg, t0, t1, lines }); t = t1;
    }
    return out;
  }
  const DEFS = `<defs>${[['arrR', COL.red], ['arrA', COL.accent], ['arrK', COL.ink], ['arrB', COL.suture], ['arrM', COL.amber]].map(([id, c]) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('')}</defs>`;
  const chName = ch => `第 ${ch} 章　${CHAPTERS[ch]}`;
  function header(tl, t, progressOnly) {
    const sg = tl.sg, ch = sg.ch ?? sg.chapterCard;
    let s = '';
    if (!progressOnly) {
      if (ch > 0 && ch < CHAPTERS.length - 1) s += `<rect x="24" y="22" width="${measure(chName(ch), 14, true) + 20}" height="28" rx="5" fill="rgba(14,124,107,0.10)"/>` + text(34, 41, chName(ch), { size: 14, bold: true, color: COL.accent, cls: 'hdr' });
      const tx = ch > 0 && ch < CHAPTERS.length - 1 ? 34 + measure(chName(ch), 14, true) + 30 : 24;
      s += text(tx, 45, sg.title || (ch === 0 ? VIDEO.name : CHAPTERS[ch]), { size: 24, bold: true, cls: 'hdr' });
    }
    const x0 = 820, x1 = 1256, gaps = (CH_SPAN.length - 1) * 4; let x = x0;
    CH_SPAN.forEach(([a, b]) => { const w = (b - a) / DURATION * (x1 - x0 - gaps), k = clamp01((t - a) / (b - a));
      s += `<rect x="${x.toFixed(1)}" y="33" width="${w.toFixed(1)}" height="6" rx="3" fill="#cfd6dd"/><rect x="${x.toFixed(1)}" y="33" width="${(w * k).toFixed(1)}" height="6" rx="3" fill="${COL.accent}"/>`; x += w + 4; });
    return s;
  }
  function panelFrame(x, w, P) {
    return `<rect x="${x}" y="${PANEL_Y}" width="${w}" height="${PANEL_H}" rx="10" fill="#fff" stroke="#d3dae1"/>` +
      text(x + 16, PANEL_Y + 24, P.title || '', { size: 15, bold: true }) + text(x + w - 16, PANEL_Y + 24, P.orient || '', { size: 13, color: COL.sub, anchor: 'end' });
  }
  // panel body: the drawing is clipped to the panel; extra (labels) is not
  function panelBody(x, w, c, pid) {
    if (!c) return '';
    return `<clipPath id="clip_${pid}"><rect x="0" y="0" width="${w - 2}" height="${CONTENT_H}" rx="8"/></clipPath><g transform="translate(${x + 1} ${CONTENT_Y})"><g clip-path="url(#clip_${pid})">${c.svg || ''}</g>${c.extra || ''}</g>`;
  }
  function keyBox(tl, T, op) {
    const sg = tl.sg; if (!sg.keys) return '';
    let html = '', ks = 0; for (const [i, h] of sg.keys) if (T.u >= T.st(i) - 0.25) { html = h; ks = T.st(i) - 0.25; }
    let src = ''; for (const [i, s2] of (sg.src || [])) if (T.u >= T.st(i) - 0.25) src = s2;
    const kop = ss(ks, ks + 0.45, T.u) * op, nl = html.split('\n').length, y0 = nl > 1 ? 547 : 561;
    return `<rect x="24" y="516" width="1232" height="80" rx="10" fill="#fff" stroke="#d3dae1"/><rect x="24" y="516" width="6" height="80" rx="3" fill="${COL.accent}"/>` +
      text(46, 561, '重點', { size: 14, bold: true, color: COL.accent }) + `<g opacity="${kop}">${richLines(94, y0, html, 17, 28, COL.ink)}</g>` +
      (src ? text(1240, 588, '來源｜' + src, { size: 12.5, color: COL.sub, anchor: 'end', op, cls: 'src' }) : '');
  }
  function caption(tl, t) {
    let cap = '', op = 0;
    tl.lines.forEach(([a, b], i) => { if (t >= a - 0.15 && t <= b + GAP * 0.9) { cap = tl.sg.lines[i]; op = Math.min(ss(a - 0.15, a + 0.1, t), 1 - ss(b + 0.1, b + GAP * 0.9, t)); } });
    if (!cap) return '';
    const ls = cap.split('\n');
    return `<g opacity="${op.toFixed(3)}">${ls.map((l, i) => text(640, 656 - (ls.length - 1) * 19 + i * 40, l, { size: 28, w: 500, color: '#fff', anchor: 'middle' })).join('')}</g>`;
  }
  function timing(tl, t) {
    const u = t - tl.t0, dur = tl.t1 - tl.t0;
    const st = i => tl.lines[i] ? tl.lines[i][0] - tl.t0 : dur, en = i => tl.lines[i] ? tl.lines[i][1] - tl.t0 : dur;
    // T.on(i, d, off): 0 → 1 over d seconds from the start of line i (+off); T.p(i, a, b): 0 → 1 between fractions a and b of line i
    return { u, dur, st, en, on: (i, d = 0.6, off = 0) => ss(st(i) + off, st(i) + off + d, u), p: (i, a = 0, b = 1) => ss(lerp(st(i), en(i), a), lerp(st(i), en(i), b), u) };
  }
  // DRAW2 functions are pure functions of T. Record which T.on / T.p values a call read; if the segment's drawing did not read
  // T.u and every recorded value is the same at this frame, the drawing is the same, so reuse it instead of redrawing the model.
  // window.KIT_NO_REUSE turns this off (render.js --verify compares both ways).
  // Labels are placed with measured text widths, so nothing drawn before the fonts finish loading may be reused.
  let lastHTML = null;
  const MEMO = {};
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => { for (const k in MEMO) delete MEMO[k]; lastHTML = null; });
  function drawMemo(id, T) {
    if (document.fonts && document.fonts.status !== 'loaded') return DRAW2[id](T);
    const m = MEMO[id];
    if (!window.KIT_NO_REUSE && m && !m.usedU && m.log.every(([k, a, v]) => T[k](...a) === v)) return m.out;
    const log = []; let usedU = false;
    const R = { get u() { usedU = true; return T.u; }, dur: T.dur, st: T.st, en: T.en,
      on: (...a) => { const v = T.on(...a); log.push(['on', a, v]); return v; },
      p: (...a) => { const v = T.p(...a); log.push(['p', a, v]); return v; } };
    const out = DRAW2[id](R);
    MEMO[id] = { log, usedU, out };
    return out;
  }
  // A frame whose markup is the same as the previous frame's is not put on the page again: the page keeps its pixels, and
  // window.FRAME_CHANGED = false tells render.js to reuse the previous frame's image (identical bytes, no layout or paint).
  function setStage(stage, html) {
    window.FRAME_CHANGED = !!window.KIT_NO_REUSE || html !== lastHTML || stage.childElementCount === 0;
    if (window.FRAME_CHANGED) { stage.innerHTML = html; lastHTML = html; }
  }
  function renderAt(t) {
    t = Math.min(Math.max(t, 0), DURATION - 1e-6);
    const tl = TL.find(x => t >= x.t0 && t < x.t1) || TL[TL.length - 1], sg = tl.sg, T = timing(tl, t), u = T.u, dur = T.dur;
    const op = ss(0, 0.35, u) * (1 - ss(dur - 0.3, dur, u) * (sg.layout === 'refs' ? 0 : 1));
    const o = [DEFS, `<rect width="1280" height="720" fill="#eceff2"/>`];
    const stage = document.getElementById('stage');
    if (sg.chapterCard) {
      const ch = sg.chapterCard, k = ss(0, 0.6, u), k2 = ss(0.2, 1.0, u);
      o.push(`<g opacity="${k * (1 - ss(dur - 0.35, dur, u))}">${ch < CHAPTERS.length - 1 ? text(640, 300, `第 ${ch} 章`, { size: 30, bold: true, color: COL.accent, anchor: 'middle' }) : ''}
        ${text(640, 380, CHAPTERS[ch], { size: 62, bold: true, anchor: 'middle' })}<rect x="${640 - 160 * k2}" y="414" width="${320 * k2}" height="4" rx="2" fill="${COL.accent}"/></g>`);
      o.push(header(tl, t, true)); return setStage(stage, o.join(''));
    }
    if (sg.layout === 'refs') {
      o.push(header(tl, t), `<rect x="24" y="70" width="1232" height="638" rx="10" fill="#fff" stroke="#d3dae1"/><clipPath id="clip_r"><rect x="25" y="80" width="1230" height="620"/></clipPath><g clip-path="url(#clip_r)">`);
      const lh = 50, totalH = REFS.length * lh + 160, scroll = Math.max(0, ss(2.5, dur - 6, u) * (totalH - 560));
      REFS.forEach((r, i) => { const y = 120 + i * lh - scroll; if (y > 40 && y < 760) { const cut = r.length > 150 ? r.lastIndexOf(' ', 150) : -1, words = cut > 0 ? [r.slice(0, cut), r.slice(cut + 1)] : [r];
        o.push(text(48, y, `${i + 1}.`, { size: 14.5, bold: true, color: COL.accent, cls: 'ref' }) + words.map((w, j) => text(80, y + j * 19, w, { size: 14.5, cls: 'ref' })).join('')); } });
      o.push(text(640, 120 + REFS.length * lh - scroll + 70, VIDEO.credit || CREDIT, { size: 22, bold: true, anchor: 'middle' }), `</g>`);
      return setStage(stage, o.join(''));
    }
    if (sg.layout === 'title') {
      const D = DRAW2.title ? drawMemo('title', T) : {}, V = VIDEO.titleLayout || {};
      o.push(`<g opacity="${op}">`);
      if (D.R) { o.push(panelFrame(648, 608, D.R.P || {}), panelBody(648, 608, D.R, 'R')); }
      const z = V.size || 46; let y = 170;
      for (const l of VIDEO.title) { o.push(text(40, y, l, { size: z, bold: true })); y += z * 1.25; }
      y += 6; if (VIDEO.subtitle) { o.push(text(40, y, VIDEO.subtitle, { size: 21, w: 500, color: COL.accent })); y += 36; }
      if (VIDEO.line) { o.push(text(40, y, VIDEO.line, { size: 19 })); y += 34; }
      o.push(tblock(40, y + 34, VIDEO.note || ['示意動畫，不是手術錄影；比例不精確。', '各院做法不同的地方，依院內常規。'], { size: 15.5, color: COL.sub }), `</g>`);
    } else {
      const D = DRAW2[sg.id] ? drawMemo(sg.id, T) : {}, panels = PANELS[sg.layout === 'dual' ? 'dual' : 'full'];
      o.push(header(tl, t), `<g opacity="${op}">`);
      for (const [key, x, w] of panels) { const c = D[key]; o.push(panelFrame(x, w, (c && c.P) || {}), panelBody(x, w, c, key)); }
      o.push(keyBox(tl, T, op), `</g>`);
    }
    o.push(`<rect x="24" y="604" width="1232" height="104" rx="10" fill="#1d2733"/>`, caption(tl, t));
    return setStage(stage, o.join(''));
  }
  function start() {
    TL = buildTimeline(); DURATION = TL[TL.length - 1].t1;
    CH_SPAN = CHAPTERS.map((_, i) => { const xs = TL.filter(x => (x.sg.ch ?? x.sg.chapterCard) === i); return [xs[0].t0, xs[xs.length - 1].t1]; });
    window.SCENE_DURATION = DURATION;
    window.TL_EXPORT = TL.map(x => ({ id: x.sg.id, t0: x.t0, t1: x.t1, ch: x.sg.ch ?? x.sg.chapterCard, lines: x.lines, text: x.sg.lines || [] }));
    window.TIMELINE_SOURCE = window.TIMELINE ? 'timeline.js' : 'estimate';
    // load every font subset before the first frame: all text of the video, including the string literals of the drawing functions
    const pre = document.getElementById('preload') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'preload' }));
    pre.style.cssText = 'position:absolute;left:0;top:0;opacity:0;white-space:nowrap;pointer-events:none;font-family:"Noto Sans TC"';
    const all = SEGS.map(s => (s.lines || []).join('') + (s.title || '') + JSON.stringify(s.keys || '') + JSON.stringify(s.src || '')).join('') + CHAPTERS.join('') + REFS.join('') + JSON.stringify(VIDEO) +
      Object.values(DRAW2).map(f => f.toString()).join('') + JSON.stringify([SAG_T, COR_T, EV_T]) + (window.PRELOAD_EXTRA || '') + '第章重點來源製作張博淳示意動畫不是手術錄影比例不精確各院做法不同處依院內常規0123456789';
    pre.innerHTML = ['400', '500', '700'].map(w => `<span style="font-weight:${w}">${esc(all.replace(/[\x00-\x1f]/g, ''))}</span>`).join('');
    window.renderAt = renderAt;
    renderAt(0);
  }
  return { start, LEAD, GAP, TAIL, CARD, timing, header };
})();
