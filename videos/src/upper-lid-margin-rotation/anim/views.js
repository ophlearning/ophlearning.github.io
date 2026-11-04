// ============================================================================
// New views for the redo: draw the shared eyelid model (videos/models/eyelid) inside a video panel.
// A camera maps a model window (mm) onto the panel (px); anchors come back in panel px so labels can point at tissue.
// Labels are bilingual: 中文 + English.
// ============================================================================
const VIEWS = (() => {
  // camera: model window {x, y, w} (mm, top-left + width) fitted to a W×H panel, centred
  function cam(win, W, H) {
    const k = Math.min(W / win.w, H / (win.h || win.w * H / W)), x0 = win.x, y0 = win.y;
    return { k, tf: `scale(${k}) translate(${-x0} ${-y0})`, P: p => [(p[0] - x0) * k, (p[1] - y0) * k] };
  }
  const mapA = (A, P) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = P(v); return r; };
  // sagittal view of the eyelid in a given surgical state
  function sag(state, W, H, win, id) {
    const c = cam(win, W, H), r = LID.draw({ variant: 'asian', state, id });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), k: c.k, P: c.P };
  }
  // coronal (skin-side) view
  function cor(state, W, H, win, id, opt = {}) {
    const c = cam(win, W, H), r = CORONAL.draw({ variant: 'asian', state, id, windows: opt.windows || [], section: opt.section ?? false });
    return { svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), k: c.k, P: c.P };
  }
  // bilingual label with a leader line to anchor a (panel px). o: side 'R', bold, color, lc, op, size
  function lab2(zh, en, tx, ty, a, o = {}) {
    const z = o.size || 15, right = o.side === 'R', w = measure(zh, z, o.bold) + (en ? 6 + measure(en, z, false) : 0);
    const col = o.color || COL.ink, lc = o.lc || o.color || '#5f6d7b', x1 = right ? tx - w - 7 : tx + w + 7, x0 = right ? tx - w : tx;
    const ln = a ? `<line x1="${x1}" y1="${ty - z * 0.36}" x2="${a[0]}" y2="${a[1]}" stroke="#fff" stroke-width="3.2" opacity="0.8"/><line x1="${x1}" y1="${ty - z * 0.36}" x2="${a[0]}" y2="${a[1]}" stroke="${lc}" stroke-width="1.2"/><circle cx="${a[0]}" cy="${a[1]}" r="2.8" fill="${lc}" stroke="#fff" stroke-width="1"/>` : '';
    return `<g opacity="${o.op ?? 1}" class="lbl">${ln}<text x="${x0}" y="${ty}" font-size="${z}" stroke="#fff" stroke-width="3.6" paint-order="stroke" stroke-linejoin="round"><tspan fill="${col}" font-weight="${o.bold ? 700 : 500}">${esc(zh)}</tspan>${en ? `<tspan fill="${o.enColor || '#5b6878'}" dx="6">${esc(en)}</tspan>` : ''}</text></g>`;
  }
  return { cam, sag, cor, lab2 };
})();
