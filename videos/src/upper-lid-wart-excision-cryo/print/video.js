// Printable OR-wall sheets of this case (videos/tools/print, README there). There is no video yet, so the states and drawings live here:
// the eyelid model (videos/models/eyelid) at rest (MRD1 4, the model default) and, drawn on top of it, what the model does not have —
// the lesion, the excision line, the cryoprobe, the ice ball and the eye shield. All of these are 示意 (anim/params.js WART).
// Both views come from the same geometry: the lesion's height above the lash line in the surgeon's view is the vertical distance the
// sagittal section gives (the sagittal section runs through the pupil centre, so the lesion sits at x = 0 in the surgeon's view).
PRINT.video({
  id: 'upper-lid-wart-excision-cryo',
  title: '上眼瞼 wart 切除＋cryotherapy',
  surgery: ['上眼瞼 wart 切除＋cryotherapy', '切除送病理 → 基底 cryotherapy', '右眼 OD 示意圖'],
  steps: 8,
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],
  scripts: ['anim/segments.js', 'anim/params.js'],
  setup() {
    const ST = {};                                                       // upper lid at rest (model default MRD1 4)
    const R0 = LID.draw({ variant: 'asian', state: ST, id: 'wart0' }), C0 = CORONAL.draw({ variant: 'asian', state: ST, id: 'wart1', windows: [], section: false });
    const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
    const S = (q, d = 0) => R0.skinAt(q, d);                             // skin point q mm along the skin, d mm deep (model mm)
    const tan = q => unit([S(q + 0.15)[0] - S(q - 0.15)[0], S(q + 0.15)[1] - S(q - 0.15)[1]]);
    const nrm = q => { const t = tan(q); let n = [t[1], -t[0]]; if (n[0] > 0) n = [-n[0], -n[1]]; return n; };   // outward (anterior)
    const qL = R0.qOf(R0.A.lashSkin);                                    // the lash line on the skin
    const W = WART;
    // a lesion growing from the skin between qc ± w/2 (model mm): papillary dome outward, base in the epidermis
    function lesion(qc, w, h) { const P = [], N = 48;
      for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N, q = qc + u * w / 2, k = h * Math.sqrt(Math.max(0, 1 - u * u)) * (0.86 + 0.14 * Math.cos(u * 11)); P.push(add(S(q), nrm(q), k)); }
      for (let i = N; i >= 0; i--) P.push(S(qc + (-1 + 2 * i / N) * w / 2, 0.1));
      return P; }
    const SAG = {
      qc: qL + W.dq, qcM: qL + W.dqM,
      lesion: lesion(qL + W.dq, W.w, W.h), lesionM: lesion(qL + W.dqM, W.wM, W.h * 0.8),
      // excision: down to dEx, then along the skin under the lesion, then back up (above the orbicularis)
      cut: (() => { const a = qL + W.dq - W.w / 2 - W.margin, b = qL + W.dq + W.w / 2 + W.margin, P = [S(a)]; for (let q = a; q <= b + 1e-9; q += 0.1) P.push(S(q, W.dEx)); P.push(S(b)); return P; })(),
      // the wound left after the excision (from just outside the skin down to the cut)
      wound: (() => { const a = qL + W.dq - W.w / 2 - W.margin, b = qL + W.dq + W.w / 2 + W.margin, P = [], Q = [];
        for (let q = a; q <= b + 1e-9; q += 0.1) { P.push(add(S(q), nrm(q), 0.12)); Q.push(S(q, W.dEx)); } return [...P, ...Q.reverse()]; })(),
      // the ice ball as a dome in the tissue around the probe tip (r mm), at skin point q
      dome: (q, r) => { const c = S(q), t = tan(q), n = nrm(q), P = []; for (let i = 0; i <= 36; i++) { const f = Math.PI * i / 36; P.push([c[0] + r * (Math.cos(f) * t[0] - Math.sin(f) * n[0]), c[1] + r * (Math.cos(f) * t[1] - Math.sin(f) * n[1])]); } return P; },
      // the cryoprobe: a rod along the outward normal, tip on the skin at q
      probe: (q, len = 7, wd = 1.1) => { const c = S(q), n = nrm(q), t = tan(q), e = add(c, n, len); return [add(c, t, wd / 2), add(e, t, wd / 2), add(e, t, -wd / 2), add(c, t, -wd / 2)]; },
      // local anaesthetic needle: from outside above the lesion into the subcutaneous tissue under it
      needle: [add(S(qL + W.dq + 2.4), nrm(qL + W.dq + 2.4), 3.2), S(qL + W.dq + 0.3, 0.28)],
      // eye shield (示意): a band just off the globe surface from below the cornea up under the upper lid
      shield: (() => { const P = []; for (let d = 192; d >= 146; d -= 2) { const p = LID.gp(-d * Math.PI / 180), l = Math.hypot(p[0], p[1]); P.push([p[0] * (l + 0.3) / l, p[1] * (l + 0.3) / l]); } return P; })(),
      S, nrm, qL,
    };
    // surgeon's view: the lesion at x = 0, its height above the lash line taken from the sagittal section
    const lashY0 = C0.lashY(0), dy = q => S(q)[1] - S(qL)[1];
    const COR = { c: [0, lashY0 + dy(SAG.qc)], r: Math.abs(dy(SAG.qc + W.w / 2) - dy(SAG.qc - W.w / 2)) / 2, cM: [0, lashY0 + dy(SAG.qcM)], rM: W.wM / 2,
      blob: (c, r) => { const P = []; for (let i = 0; i < 60; i++) { const f = 2 * Math.PI * i / 60, k = r * (1 + 0.1 * Math.cos(7 * f)); P.push([c[0] + k * Math.cos(f), c[1] + k * Math.sin(f)]); } return P; },
      circ: (c, r) => { const P = []; for (let i = 0; i <= 72; i++) { const f = 2 * Math.PI * i / 72; P.push([c[0] + r * Math.cos(f), c[1] + r * Math.sin(f)]); } return P; } };
    // print styles of the drawn objects (figure mm): lesion mid grey with a black outline, wound light pink, ice ball grey with a dashed
    // outline, probe grey, shield grey band; needle as the electrolysis needle of the levator-rotation sheets (black with a white core)
    const pth = (V, P, close = true) => PRINT.pth(P.map(V.P)) + (close ? 'Z' : '');
    const DR = {
      lesion: (V, P) => `<path d="${pth(V, P)}" fill="#8f8f8f" stroke="#000" stroke-width="0.3"/>`,
      wound: (V, P) => `<path d="${pth(V, P)}" fill="#f4d3c8" stroke="none"/>`,
      ice: (V, P) => `<path d="${pth(V, P)}" fill="#c4c4c4" fill-opacity="0.55" stroke="#000" stroke-width="0.35" stroke-dasharray="0.9 0.5"/>`,
      probe: (V, P) => `<path d="${pth(V, P)}" fill="#9a9a9a" stroke="#000" stroke-width="0.3"/>`,
      needle: (V, a, b) => { a = V.P(a); b = V.P(b); return `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#fff" stroke-width="0.7" stroke-linecap="round"/>`; },
      shield: (V, P) => `<path d="${pth(V, P, false)}" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><path d="${pth(V, P, false)}" fill="none" stroke="#a8a8a8" stroke-width="0.9" stroke-linecap="round"/>`,
      dotted: (V, P) => `<path d="${pth(V, P, false)}" fill="none" stroke="#000" stroke-width="0.45" stroke-dasharray="0.01 0.9" stroke-linecap="round"/>`,
    };
    // the upper-lid margin zoom for the follicle depth (Elder 1997), as the levator-rotation sheets' EPI: lash exit E and follicle base B
    const EPI = (() => {
      const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));
      const E = R0.DA.at(marginS(1.70), 1.70), B = R0.DA.at(2.05, 1.56), L = Math.hypot(B[0] - E[0], B[1] - E[1]), d = [(B[0] - E[0]) / L, (B[1] - E[1]) / L];
      return { E, B, d, L };
    })();
    // windows (model mm); sagittal: left = anterior, up = up; surgeon's view: facing the patient, left = temporal
    const WIN = { sag: { x: -17.8, y: -12.6, w: 11.4, h: 12.2 }, cor: { x: -9.5, y: -14.2, w: 19 },
      sagM: { x: EPI.E[0] - 3.9, y: EPI.E[1] - 3.6, w: 7.4, h: 7.9 }, corM: { x: -6.5, y: -9.6, w: 13 } };
    return { ST, SAG, COR, DR, EPI, WIN };
  },
});
