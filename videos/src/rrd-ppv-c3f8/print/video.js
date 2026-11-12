// Printable OR-wall sheets of the RRD PPV video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files (checklist.js, steps.js, anatomy.js) draw. The video's own view wrapper anim/views-posterior.js is loaded as it is (VP: every
// state the video draws, by name — VP.ST.setup, VP.ST.dep52, VP.ST.closed, VP.ST.sit81 …, the windows VP.WIN, the clock hours), so every figure is
// a state the video shows; the few states draw.js composes on the spot are copied here with the same expression and the draw.js segment
// in brackets (VIEW3_11, SETUP_INF, PORT_IN_R, W62B). The figures use the shared model directly (print-kit.js kinds psec, phead, pfundus, pwide, pscope); the
// video's extras (the cannulas in the wide view, clock numbers, gravity arrow, rings) are print overlays drawn below from the same 3D points.
PRINT.video({
  id: 'rrd-ppv-c3f8',
  title: 'RRD 的 23G PPV＋C3F8：助手版',
  surgery: ['RRD　23G 三孔 PPV＋C3F8', '助手版：架設 → 壓鞏膜 → 備氣 → 術後', '左眼 OS、術者坐 12 點'],
  steps: 10,
  models: ['globe/globe.js', 'posterior/posterior.js'],
  scripts: ['anim/segments.js', 'anim/views-posterior.js'],
  setup() {
    const P = POSTERIOR, G = GLOBE, ST = VP.ST;
    // states composed in draw.js, the same as there: 3-2 line 2 = card 一 (VP.CH9[0].st: the wide view turned toward 11), 2-2 lines 2–5 (the wide
    // view toward the infusion), 6-2 lines 2–4 = card 五 (VP.CH9[4].st: the bead, the wide view turned 16° toward 11)
    const VIEW3_11 = VP.CH9[0].st;
    const SETUP_INF = Object.assign({}, ST.setup, { look: VP.LOOK_INF });
    const PORT_IN_R = Object.assign({}, ST.setup, { troc: P.trocarsFor('OS').filter(t => t.id !== VP.PORT) });   // 2-1 line 4, right: the infusion trocar going in (drawn as a blade)
    const W62B = VP.CH9[4].st;
    // a 3D point (mm, eye frame) → figure mm in a view of any posterior kind: section / head (plane), wide (map), microscope (M), fundus chart (proj)
    const P3 = (V, p) => V.P(V.r.plane ? G.toPlane(V.r.plane, p) : V.r.map ? V.r.map.proj(p) : V.r.M ? V.r.M(p) : V.r.proj(p));
    const W3 = (V, h, s, d) => P3(V, P.P3(h, s, d));                    // a wall point: clock h, s mm from the limbus, d mm below the outer surface
    const R3 = (V, st, h, s, frac = 1) => P3(V, P.geom(st).ret(h, s, frac));   // a retina point of a state (frac 1 = inner surface)
    // print drawings (figure mm): thin dashed line, arrow with a white halo, ring, grey rod with a black rim (an instrument the model does not draw)
    const thin = (q, da = '1.1 0.8', w = 0.3) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
    const arw = (a, b, w = 0.6) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="${w + 1.2}" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w, head: 1.8 });
    const ring = (p, r, o = {}) => `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${r}" fill="none" stroke="#fff" stroke-width="${(o.w || 0.5) + 0.7}"/><circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${r}" fill="none" stroke="#000" stroke-width="${o.w || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
    const rod = (q, w) => `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${(w + 0.45).toFixed(2)}" stroke-linecap="round"/><path d="${PRINT.pth(q)}" fill="none" stroke="#d6d6d6" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
    // the cannulas seen in the wide view (as VP.wide: from where each leaves the wall into the cavity to its tip; the same 3D points as the section)
    const cannulas = st => V => { const Gm = P.geom(st), f = P.makeCtx(Gm); let s = '';
      for (const t of P.troc(Gm)) { if (!(t.ins >= 1) || t.out >= 1) continue; const at = u => G.add(t.base, G.sub(t.tip, t.base).map(v => v * u)), q = [];
        for (let k = 0; k <= 60; k++) { const p = at(k / 60); if (f.cavity(f.at(p)) < 0) q.push(P3(V, p)); }
        if (q.length > 1) s += rod(q, 0.7) + `<circle cx="${q[q.length - 1][0].toFixed(2)}" cy="${q[q.length - 1][1].toFixed(2)}" r="0.45" fill="#000"/>`; }
      return s; };
    // clock numbers round a wide field or a fundus chart, just outside the model's anchors clock<h>; OS: 3 = temporal (T), 9 = nasal (N)
    const NAME = { 12: '12', 3: '3 T', 6: '6', 9: 'N 9', 11: '11' };
    const clocks = (hrs = [12, 3, 6, 9]) => V => hrs.map(h => { const c = V.A.centre, a = V.A['clock' + h], d = [a[0] - c[0], a[1] - c[1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L];
      return PRINT.txt(a[0], a[1] + (u[1] > 0.5 ? 2.4 : u[1] < -0.5 ? 0 : 1.2), NAME[h], { pt: 9.5, bold: true, anchor: u[0] > 0.5 ? 'start' : u[0] < -0.5 ? 'end' : 'middle' }); }).join('');
    // the 11 o'clock tick on the rim of a wide field (from the centre of the field toward clock11, just inside and outside the rim)
    const tick11 = V => { const c = V.A.centre, a = V.A.clock11, d = [a[0] - c[0], a[1] - c[1]], L = Math.hypot(...d), r = V.r.A.R * V.k, u = [d[0] / L, d[1] / L];
      return `<path d="${PRINT.pth([[c[0] + u[0] * (r - 1.6), c[1] + u[1] * (r - 1.6)], [c[0] + u[0] * (r + 0.6), c[1] + u[1] * (r + 0.6)]])}" stroke="#000" stroke-width="0.9"/>`; };
    // gravity: a black arrow straight down with its label
    const grav = (x, y, L = 6) => arw([x, y], [x, y + L], 0.7);
    // a 「中文 English」 label at an explicit place: side 'L' (text from the left edge) or 'R' (text ends at the right edge), y = baseline (figure mm),
    // a = anchor ('name' | [model mm] | V => figure mm | null)
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, a == null ? null : typeof a === 'function' ? a(V) : typeof a === 'string' ? V.A[a] : V.P(a), { side, ...o });
    // a short orientation tag in a corner (lines: one string or several, from y down)
    const tag = (s, side = 'L', y = 3.6) => V => [].concat(s).map((t, i) => PRINT.txt(side === 'L' ? 1.3 : V.w - 1.3, y + i * 3.6, t, { pt: 9.5, bold: true, anchor: side === 'L' ? 'start' : 'end' })).join('');
    const all = (...fs) => V => fs.map(f => f(V)).join('');
    return { P, G, ST, VIEW3_11, SETUP_INF, PORT_IN_R, W62B, P3, W3, R3, thin, arw, ring, rod, cannulas, clocks, tick11, grav, lb, tag, all };
  },
});
