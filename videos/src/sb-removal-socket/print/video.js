// Printable OR-wall sheets of the SB removal video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files (checklist.js, steps.js, anatomy.js) draw. The video's own view wrapper anim/views-socket.js is loaded as it is (VS: every
// state the video draws, by name — VS.ST.expo, VS.ST.open, VS.ST.cut …, the clock hours), so every figure is a state the video shows.
// The socket model has none of the colours print.css turns into black overlays, so the model is the light tissue layer and the black
// overlays (exposure ring, cut, cut sutures, hook, clock numbers) are drawn here from the model's own anchors (mm, V.M → V.P).
PRINT.video({
  id: 'sb-removal-socket',
  title: 'Eviscerated socket 的 scleral buckle removal：助手版',
  surgery: ['SB removal（eviscerated socket）', '助手版：暴露 → 剪斷 → 抽出 → 核對與檢體', '左眼 OS、術者坐 12 點'],
  steps: 8,
  models: ['socket/socket.js'],
  scripts: ['anim/segments.js', 'anim/views-socket.js'],
  setup() {
    const S = SOCKET, ST = VS.ST, EH = VS.EXPO_H, PR = S.profile();
    // states composed in draw.js, the same as there: 3-3 line 1 (pulled 0.775, the next rectus — 3 o'clock — hooked)
    const PULL = (() => { const st = { ...ST.cut, pull: 0.775 }; st.hook = VS.nextRectus(st); return st; })();
    const WIN = {
      front: { x: -20.5, y: -19.5, w: 41, h: 39 },          // the whole speculum-opened socket
      sec: { x: 2.2, y: -9.6, w: 15, h: 15 },               // right half of a section: conjunctiva, Tenon, rectus, band, shell, fornix
      secAll: { x: -21, y: -14, w: 42, h: 28 },             // both halves (3 and 9 o'clock)
    };
    const f = (p, n = 2) => (+p).toFixed(n);
    const ring = (p, r, o = {}) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="none" stroke="#fff" stroke-width="${(o.w || 0.5) + 0.7}"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="none" stroke="#000" stroke-width="${o.w || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
    const X = (p, r = 1.1, w = 0.55) => `<path d="M${f(p[0] - r)} ${f(p[1] - r)}L${f(p[0] + r)} ${f(p[1] + r)}M${f(p[0] + r)} ${f(p[1] - r)}L${f(p[0] - r)} ${f(p[1] + r)}" stroke="#fff" stroke-width="${w + 0.7}"/>`
      + `<path d="M${f(p[0] - r)} ${f(p[1] - r)}L${f(p[0] + r)} ${f(p[1] + r)}M${f(p[0] + r)} ${f(p[1] - r)}L${f(p[0] - r)} ${f(p[1] + r)}" stroke="#000" stroke-width="${w}"/>`;
    const arw = (a, b, w = 0.55) => `<path d="${PRINT.pth([a, b])}" stroke="#fff" stroke-width="${w + 1.2}" stroke-linecap="round"/>` + PRINT.arrow(a, b, { w, head: 1.8 });
    // front view helpers (model mm → figure mm)
    const FP = (V, h, r) => V.P(S.fpt(h, r));
    // the band's track on the front map (radius = arc length to the equator) where the band still lies: a grey strip with a black rim
    // (thick solid black is reserved for cutting, README「設計規則」)
    const bandArc = (st, w = 1.1) => V => { const B = S.band(st); if (B.removed) return ''; const q = [];
      for (let i = 0; i <= 120; i++) q.push(FP(V, B.arcH[0] + (B.arcH[1] - B.arcH[0]) * i / 120, PR.sEq));
      return `<path d="${PRINT.pth(q)}" fill="none" stroke="#000" stroke-width="${w + 0.5}"/><path d="${PRINT.pth(q)}" fill="none" stroke="#bdbdbd" stroke-width="${w}"/>`; };
    // the cut across the band at clock h (thick black, radial)
    const cutMark = h => V => PRINT.cut([FP(V, h, PR.sEq - 2.4), FP(V, h, PR.sEq + 2.4)], { w: 0.9 });
    // clock numbers just inside the fissure: OS 3 = temporal (T), 9 = nasal (N); 12 down (surgeon at 12)
    const NAME = { 12: '12', 3: '3 T', 6: '6', 9: 'N 9' };
    const clocks = V => [12, 3, 6, 9].map(h => { const p = FP(V, h, 17.2), an = h === 3 ? 'start' : h === 9 ? 'end' : 'middle';
      return PRINT.txt(p[0] + (h === 3 ? -1.2 : h === 9 ? 1.2 : 0), p[1] + (h === 12 ? 0.4 : h === 6 ? 2.6 : 1.2), NAME[h], { pt: 9.5, bold: true, anchor: an }); }).join('');
    // sutures on the front map: intact = short black bar across the band, cut = black X (VS.SUT: one per quadrant, 示意)
    const sutures = st => V => VS.SUT.map(h => { const p = FP(V, h, PR.sEq); return (st.sutCut || []).includes(h) ? X(p, 0.9) : `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="0.75" fill="#000"/>`; }).join('');
    // the band's cross-section in a section view (right half): black ring round it
    const bandRing = (V, r = 1.9) => { const sd = V.r.sides && V.r.sides[1]; return sd && sd.bandC ? ring(V.P(sd.bandC), r, { w: 0.45 }) : ''; };
    // a 「中文 English」 label at an explicit place: side 'L' / 'R', y = baseline (figure mm), a = anchor (figure mm) or V => figure mm
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, a == null ? null : typeof a === 'function' ? a(V) : a, { side, ...o });
    const tag = (s, side = 'L', y = 3.6) => V => [].concat(s).map((t, i) => PRINT.txt(side === 'L' ? 1.3 : V.w - 1.3, y + i * 3.6, t, { pt: 9.5, bold: true, anchor: side === 'L' ? 'start' : 'end' })).join('');
    const all = (...fs) => V => fs.map(g => g(V)).join('');
    return { S, ST, EH, PR, PULL, WIN, ring, X, arw, FP, bandArc, cutMark, clocks, sutures, bandRing, lb, tag, all };
  },
});
