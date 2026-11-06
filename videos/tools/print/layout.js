// ============================================================================
// Sheet layouts (videos/tools/print): turn a video's small data files into the three OR-wall sheets. Loaded by sheet.html after
// print-kit.js. A video provides, in videos/src/<video>/print/:
//   video.js       PRINT.video({ id, title, surgery, steps, models, scripts, setup })   — which video, which model files, the states
//   checklist.js   PRINT.sheet({ type: 'checklist', … })                                — the checklist items
//   steps.js       PRINT.sheet({ type: 'steps', … })                                    — each step: two views (state, window, labels)
//   anatomy.js     PRINT.sheet({ type: 'anatomy', … })                                  — figures + number tables
// Everything else (page frame, layout, B/W overlay styles, label placement, legend, footer) is here and in print-kit.js; PDF / PNG
// output and the checks are in print.js. The data format is documented in README.md (this folder).
// ============================================================================
(() => {
  const P = PRINT, PT = P.PT;
  const BODY = { w: 277, h: 210 - 28.2 - 22.5 };   // body box of print.css (mm)
  let VIDEO_CFG = null;

  // ---------------------------------------------------------------- the video (print/video.js)
  // cfg: { id: '<#id on the site>', title: '<video title for the footer>', surgery: ['bold first line', 'more lines' …],
  //        steps: <number of checklist items = numbered steps>, models: ['eyelid/lid.js', …] (from videos/models/),
  //        scripts: ['anim/segments.js', 'anim/params.js', …] (from the video folder), setup: () => ({ name: value, … }) }
  // setup() runs after the scripts are loaded; what it returns becomes global for the sheet data files (states, windows, helpers).
  P.video = cfg => { VIDEO_CFG = cfg; };
  P.videoConfig = () => VIDEO_CFG;

  // ---------------------------------------------------------------- anchors, paths and marks in a view (figure mm)
  // anchor: 'name' (the model's anchor A.name) · [x, y] (model mm) · V => [x, y] (figure mm)
  function at(V, a) {
    if (a == null) return null;
    if (typeof a === 'function') return a(V);
    if (typeof a === 'string') { if (!V.A[a]) throw new Error(`no anchor 「${a}」 in this view`); return V.A[a]; }
    return V.P(a);
  }
  // path: V => [figure points] · [anchor, anchor, …] · { fn: 'excLoY', from, to[, step, dy] } (a height function of the coronal model)
  function pathOf(V, p) {
    if (typeof p === 'function') return p(V);
    if (Array.isArray(p)) return p.map(a => at(V, a));
    const f = V.r[p.fn]; if (typeof f !== 'function') throw new Error(`no function 「${p.fn}」 in this view`);
    const q = []; for (let x = p.from; x <= p.to + 1e-9; x += p.step || 0.2) q.push(V.P([x, f(x) + (p.dy || 0)])); return q;
  }
  P.along = (fn, from, to, o = {}) => ({ fn, from, to, ...o });
  // corner keywords for a step marker
  const corner = (V, c) => ({ tl: [4, 4], tr: [V.w - 4, 4], bl: [4, V.h - 4], br: [V.w - 4, V.h - 4] })[c];

  // one figure from a view spec. spec: { kind, state, win, windows, red, blue, amber, light,
  //   overlays: [{ cut | inc | sut: path, w }], dims: [{ from, to, label: [zh, en] }], marks: [{ at, pos, fix }],
  //   labels: [[zh, en, anchor, { side, bold }]], labelOpts: { gap, y0, y1, sides: true }, scale: { mm, x, y }, draw: V => svg }
  // n = the step number used by the marks
  function figure(spec, w, h, n) {
    return P.view({ ...spec, w, h, draw: V => {
      let s = '', labs = (spec.labels || []).map(l => [l[0], l[1], at(V, l[2]), l[3]]);
      for (const o of spec.overlays || []) { const k = o.cut ? 'cut' : o.inc ? 'inc' : 'sut'; s += P[k](pathOf(V, o[k]), o); }
      for (const d of spec.dims || []) { const a = at(V, d.from), b = at(V, d.to); s += P.dim(a, b, { w: d.w || 0.35 }); if (d.label) labs.push([d.label[0], d.label[1] || '', [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d.label[2]]); }
      if (spec.draw) s += spec.draw(V);
      for (const m of spec.marks || []) { const a = at(V, m.at), pos = typeof m.pos === 'function' ? m.pos(V) : typeof m.pos === 'string' ? corner(V, m.pos) : [a[0] + m.pos[0], a[1] + m.pos[1]];
        if (m.fix) s += P.fix(a, null); if (Math.hypot(pos[0] - a[0], pos[1] - a[1]) > 2.6) s += `<line x1="${a[0]}" y1="${a[1]}" x2="${pos[0]}" y2="${pos[1]}" stroke="#000" stroke-width="0.28"/>`;
        s += P.num(pos, m.n ?? n, { solid: !!m.fix }); }
      if (spec.scale) s += P.sbar(V, spec.scale.mm, spec.scale);
      const lo = spec.labelOpts || {};
      if (lo.sides) { for (const side of ['L', 'R']) s += P.column(labs.filter(l => (l[3] && l[3].side || 'L') === side), side, side === 'L' ? 1.5 : V.w - 1.5, lo.y0 ?? 1, lo.y1 ?? V.h - 0.5, lo); }
      else s += P.labels(labs, V.w, V.h, lo);
      return s; } });
  }

  // ---------------------------------------------------------------- 1 checklist
  // def: { items: [{ sec: 'section heading (when it starts)', act: 'action, <b>key number / suture</b>', note: 'one short sourced pitfall' }],
  //        split: items in the left column (default half) }. Items are numbered 1 … n = the step numbers of the step sheet.
  function checklist(def) {
    const its = def.items, split = def.split ?? Math.ceil(its.length / 2);
    let lastSec = '';
    const item = (it, i, first) => { let h = '';
      if (it.sec) lastSec = it.sec;
      if (it.sec || (first && lastSec)) h += `<div class="ck-sec">${it.sec || lastSec + '（續）'}</div>`;
      return h + `<div class="ck-item"><div class="ck-box"></div><div class="ck-no" data-struct="step">${i + 1}</div><div><div class="ck-act">${it.act}</div>${it.note ? `<div class="ck-note">${it.note}</div>` : ''}</div></div>`; };
    const col = (a, off) => `<div class="ck-col">${a.map((it, j) => item(it, off + j, j === 0)).join('')}</div>`;
    return `<div class="ck">${col(its.slice(0, split), 0)}${col(its.slice(split), split)}</div>`;
  }

  // ---------------------------------------------------------------- 2 step diagram
  // def: { grid: [cols, rows], steps: [{ hd: 'header（示意 if so）', views: [sagittal spec, surgeon's view spec] }], legend: { rows, orient } }
  // The legend (overlay styles + orientation of both view types) takes the first free cell after the steps.
  function steps(def) {
    const [nc, nr] = def.grid || [3, 3], G = 2.4, cw = (BODY.w - G * (nc - 1)) / nc, ch = (BODY.h - G * (nr - 1)) / nr;
    const fw = +((cw - 0.6 - 2.8 - 1.2) / 2).toFixed(2), fh = +(ch - 0.6 - 2.0 - 6.8 - 0.5).toFixed(2);
    if (def.steps.length >= nc * nr) throw new Error(`grid ${nc} × ${nr} has no free cell for the legend (${def.steps.length} steps)`);
    const cell = (s, i) => `<div class="cell"><div class="cell-hd"><span class="no" data-struct="step">${i + 1}</span><span>${s.hd}</span></div><div class="figs">${s.views.map(v => figure(v, fw, fh, i + 1).html).join('')}</div></div>`;
    return `<div class="grid" style="grid-template-columns: repeat(${nc}, 1fr); grid-template-rows: repeat(${nr}, 1fr)">${def.steps.map(cell).join('')}<div class="cell">${P.legend(def.legend || {})}</div></div>`;
  }

  // ---------------------------------------------------------------- ledger keys (the video's check.js LEDGER, injected by print.js)
  // A table row names the ledger segment(s) its numbers come from ('3-2', or '2-2；2-3'). Every number of the row must be in one of
  // them; the source shown is the smallest set of that ledger's citations covering every number (院內常規 / 示意 / 結構 need none).
  const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
  const numbersOf = s => String(s).replace(/<[^>]*>/g, '').replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
  function sourceOf(key, value, item) {
    const L = window.VIDEO_LEDGER; if (!L) throw new Error('no video ledger (print.js injects it from check.js)');
    const segs = String(key).split('；').map(s => s.trim()), need = [];
    for (const n of new Set(numbersOf(value))) {
      const srcs = new Set(); for (const g of segs) if (L[g] && L[g][n]) String(L[g][n]).split('；').forEach(s => srcs.add(s.trim()));
      if (!srcs.size) throw new Error(`「${item}」: ${n} is not in ledger segment ${key}`);
      if (![...srcs].some(s => ['院內常規', '示意', '結構'].includes(s))) need.push(srcs); }
    const out = []; while (need.length) { const cnt = {}; need.forEach(s => s.forEach(c => cnt[c] = (cnt[c] || 0) + 1));
      const best = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; out.push(best); for (let i = need.length - 1; i >= 0; i--) if (need[i].has(best)) need.splice(i, 1); }
    return out.join('；');
  }

  // ---------------------------------------------------------------- 3 key anatomy and numbers
  // def: { figH, figures: [{ w, …view spec }], tables: [{ head, src: true (third column = source), rows: [[item, value, ledger key]] }],
  //        bottom: 'grid-template-columns of the tables row (tables …, legend)', legend: { rows, orient } }
  function anatomy(def) {
    const figs = def.figures.map((f, i) => figure(f, f.w, def.figH, null).html).join('');
    const table = t => `<table class="tbl"><tr><th${t.src ? '' : ' colspan="2"'}>${t.head}</th>${t.src ? `<th></th><th>出處</th>` : ''}</tr>` +
      t.rows.map(r => { const s = sourceOf(r[2], r[1], r[0]); return `<tr><td>${r[0]}</td><td class="v">${r[1]}</td>${t.src ? `<td class="s">${s || '院內常規'}</td>` : ''}</tr>`; }).join('') + `</table>`;
    return `<div style="display: flex; flex-direction: column; gap: 2.5mm; height: 100%"><div style="display: flex; gap: 2.5mm">${figs}</div>` +
      `<div style="display: grid; grid-template-columns: ${def.bottom || '1fr 1fr 50mm'}; gap: 3mm">${def.tables.map(table).join('')}${def.legend ? P.legend(def.legend) : ''}</div></div>`;
  }

  const LAYOUTS = { checklist, steps, anatomy };
  // the sheet: def.type picks the layout; the page frame, footer and readiness flag come from PRINT.render
  P.sheet = def => {
    const V = VIDEO_CFG, name = window.PRINT_SHEET_NAME || def.type, n = def.type === 'checklist' ? def.items.length : def.type === 'steps' ? def.steps.length : V.steps;
    if (n !== V.steps) throw new Error(`${def.type}: ${n} steps, but video.js says steps: ${V.steps} (checklist numbers = step numbers)`);
    const meta = { id: V.id, short: V.surgery[0], videoTitle: V.title, surgery: V.surgery[0], eye: V.surgery.slice(1).join('<br>') };
    return P.render({ ...def, name, meta, steps: V.steps, body: () => LAYOUTS[def.type](def) });
  };
})();
