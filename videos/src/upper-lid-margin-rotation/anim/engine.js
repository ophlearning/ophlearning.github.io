// ============================================================================
// Upper lid margin rotation — rendering engine (external-eye design)
// Layout: header · two panels (sagittal + frontal) or one wide panel · key box · caption
// Everything is a pure function of time t (seconds) → frame-exact rendering.
// ============================================================================
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const ss = (a, b, x) => ease((x - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = x => Math.max(0, Math.min(1, x));
const D2R = Math.PI / 180;
const psin = a => Math.max(0, Math.sin(a));
const f = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const COL = { ink: '#1d2733', sub: '#5b6878', line: '#97a4b2', accent: '#0e7c6b', red: '#d23c3c', suture: '#2463eb', amber: '#b86e00' };
const _cv = document.createElement('canvas').getContext('2d');
function measure(txt, size = 15.5, bold = false) { _cv.font = `${bold ? 700 : 400} ${size}px "Noto Sans TC"`; return _cv.measureText(txt).width; }

// label with leader line: text at (tx,ty) (left-anchored unless side 'R'), leader to anchor a
function lab(txt, tx, ty, a, o = {}) {
  const size = o.size || 15.5, right = o.side === 'R', w = measure(txt, size, o.bold);
  const color = o.color || (o.bold ? COL.ink : '#3c4a5a'), lc = o.color || COL.line;
  const x1 = right ? tx - w - 8 : tx + w + 8;
  const line = a ? `<line x1="${x1}" y1="${ty - size * 0.38}" x2="${a[0]}" y2="${a[1]}" stroke="${lc}" stroke-width="1.2"/><circle cx="${a[0]}" cy="${a[1]}" r="2.6" fill="${lc}"/>` : '';
  return `<g opacity="${o.op ?? 1}">${line}<text x="${tx}" y="${ty}" fill="${color}" font-size="${size}" font-weight="${o.bold ? 700 : 400}" text-anchor="${right ? 'end' : 'start'}">${esc(txt)}</text></g>`;
}
function text(x, y, s, o = {}) {
  return `<text x="${x}" y="${y}" fill="${o.color || COL.ink}" font-size="${o.size || 16}" font-weight="${o.bold ? 700 : (o.w || 400)}" text-anchor="${o.anchor || 'start'}" opacity="${o.op ?? 1}">${esc(s)}</text>`;
}
// multi-line text block (lines array), returns svg
function tblock(x, y, lines, o = {}) {
  const lh = o.lh || (o.size || 16) * 1.55;
  return lines.map((l, i) => text(x, y + i * lh, l, o)).join('');
}
function card(x, y, w, h, o = {}) {
  const hl = o.hl ?? 0;
  return `<g opacity="${o.op ?? 1}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${hl > 0 ? `rgba(14,124,107,${0.07 * hl})` : '#f7f9fa'}" stroke="${hl > 0.5 ? COL.accent : '#d3dae1'}" stroke-width="${hl > 0.5 ? 2 : 1}"/></g>`;
}

// ============================================================================
// SAGITTAL MODEL (upper lid, anterior = left, superior = up). 30 px = 1 mm.
// centreline = interface between anterior lamella (u<0) and posterior lamella (u>0),
// parameterised by arclength s (0 = top of drawing, L = lid margin).
// ============================================================================
const SAG = (() => {
  const L = 470, S_TT = 170, S_CUT = L - 90, S_A = 290;
  const U = { skin0: -46, orb0: -39, orb1: -1, tar1: 32, conj1: 38 };
  const GLOBE = { x: 790, y: 130, r: 700 };
  const RI = GLOBE.r + U.conj1, BETA0 = Math.asin((-170 - GLOBE.y) / RI);
  const CURL = 34 * D2R;
  const cache = new Map();
  function centreline(c) {
    const key = c.toFixed(4); if (cache.has(key)) return cache.get(key);
    const p = [], th = []; let x = GLOBE.x - RI * Math.cos(BETA0), y = GLOBE.y + RI * Math.sin(BETA0);
    for (let s = 0; s <= L; s++) { const a = BETA0 + s / RI + c * ss(240, L, s); p.push([x, y]); th.push(a); x += Math.sin(a); y += Math.cos(a); }
    const r = { p, th }; if (cache.size > 400) cache.clear(); cache.set(key, r); return r;
  }
  const tan = a => [Math.sin(a), Math.cos(a)], nrm = a => [Math.cos(a), -Math.sin(a)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const at = (cl, s, u) => { const i = Math.max(0, Math.min(L, Math.round(s))); return add(cl.p[i], nrm(cl.th[i]), u); };
  const chordPose = cl => { const O = cl.p[L], top = cl.p[S_CUT]; return { O, g: Math.atan2(O[0] - top[0], O[1] - top[1]) }; };
  const CL_N = centreline(0);
  const POSE_N = { O: add(CL_N.p[L], nrm(CL_N.th[L]), 4), g: CL_N.th[L] - 12 * D2R };
  function band(F, s0, s1, u0, u1, step = 3) {
    const pts = []; for (let s = s0; s <= s1; s += step) pts.push(F(s, u0)); pts.push(F(s1, u0)); pts.push(F(s1, u1));
    for (let s = s1; s >= s0; s -= step) pts.push(F(s, u1)); pts.push(F(s0, u1));
    return 'M' + pts.map(f).join('L') + 'Z';
  }
  // S: { curl, cut, plane, suture, k, over(deg), tuck, mcj, mcjShift, round, scar, contract, bltr, flap, flapCut,
  //      misdirected, metaplastic, labels, cutLabels, view:{tx,ty,k}, buried, hideSuture, globe }
  function draw(S, W, H) {
    const view = S.view || { tx: 244, ty: 34, k: 0.74 };
    const curl = (S.curl ?? 1) * CURL;
    const k = S.k || 0, over = (S.over || 0) * D2R, tuck = S.tuck ?? (0.7 * k);
    const CLc = centreline(curl);
    const CLU = centreline(curl * (1 - 0.65 * k));
    const P0 = chordPose(CLc);
    const B = { O: [lerp(P0.O[0], POSE_N.O[0], k), lerp(P0.O[1], POSE_N.O[1], k)], g: lerp(P0.g, POSE_N.g, k) - over };
    const BF = (v, u) => add(add(B.O, tan(B.g), v), nrm(B.g), u);
    const cutDone = (S.cut || 0) >= 1 || k > 0;
    const UF = (s, u) => { const g = ss(S_CUT - 55, S_CUT, s) * tuck, i = Math.round(Math.min(s, L));
      return add(add(at(CLU, s, u), tan(CLU.th[i]), 18 * g), nrm(CLU.th[i]), -12 * g); };
    const flap = S.flap || 0;
    const AF = (s, u) => {
      let p;
      if (s <= S_A) p = at(CLU, s, u);
      else {
        const lam = (s - S_A) / (L - S_A), A0 = CLU.p[S_A], A1 = B.O, d = Math.hypot(A1[0] - A0[0], A1[1] - A0[1]) * 1.1;
        const m0 = tan(CLU.th[S_A]).map(c => c * d), m1 = tan(B.g).map(c => c * d), l2 = lam * lam, l3 = l2 * lam;
        const h = [2 * l3 - 3 * l2 + 1, l3 - 2 * l2 + lam, -2 * l3 + 3 * l2, l3 - l2], dh = [6 * l2 - 6 * lam, 3 * l2 - 4 * lam + 1, -6 * l2 + 6 * lam, 3 * l2 - 2 * lam];
        const P = [0, 1].map(j => h[0] * A0[j] + h[1] * m0[j] + h[2] * A1[j] + h[3] * m1[j]);
        const D = [0, 1].map(j => dh[0] * A0[j] + dh[1] * m0[j] + dh[2] * A1[j] + dh[3] * m1[j]);
        p = add(P, nrm(Math.atan2(D[0], D[1])), u);
      }
      if (flap > 0) { // lid-crease approach: pretarsal skin-muscle flap lifted forward between crease (s≈262) and lash roots
        const w = ss(258, 285, s) * (1 - ss(L - 24, L - 4, s)); const i = Math.round(Math.min(s, L));
        p = add(p, nrm(CLU.th[i]), -16 * flap * w);
      }
      return p;
    };
    const o = [];
    o.push(`<g transform="translate(${view.tx} ${view.ty}) scale(${view.k})">`);
    // globe
    if (S.globe !== false) {
      o.push(`<circle cx="${GLOBE.x}" cy="${GLOBE.y}" r="${GLOBE.r}" fill="url(#globeS)"/>`);
      o.push(`<circle cx="${GLOBE.x}" cy="${GLOBE.y}" r="${GLOBE.r}" fill="none" stroke="#8fa6b8" stroke-width="2.4"/>`);
      const gp = a => [GLOBE.x - GLOBE.r * Math.cos(a), GLOBE.y + GLOBE.r * Math.sin(a)];
      o.push(`<path d="M${f(gp(Math.asin((250 - GLOBE.y) / GLOBE.r)))}A${GLOBE.r} ${GLOBE.r} 0 0 0 ${f(gp(Math.asin((560 - GLOBE.y) / GLOBE.r)))}" fill="none" stroke="#4aa3d8" stroke-width="5"/>`);
    }
    // dissected space (anterior to the marginal strip)
    if (S.plane) o.push(`<path d="${band(BF, -90, -4, -6, 0)}" fill="${COL.accent}" opacity="${0.3 * S.plane}"/>`);
    // marginal strip (rigid). rounding of posterior margin via clip
    const rr = 14 * (S.round || 0);
    const outline = (() => { const pts = [BF(-90, 0), BF(-90, U.conj1)]; for (let v = -90; v <= -rr; v += 3) pts.push(BF(v, U.conj1));
      for (let a = 0; a <= 90; a += 10) { const c = BF(-rr, U.conj1 - rr); pts.push(add(add(c, nrm(B.g), rr * Math.cos(a * D2R)), tan(B.g), rr * Math.sin(a * D2R))); }
      pts.push(BF(0, 0)); return 'M' + pts.map(f).join('L') + 'Z'; })();
    o.push(`<clipPath id="blk"><path d="${outline}"/></clipPath><g clip-path="url(#blk)">`);
    o.push(`<path d="${band(BF, -90, 0, 0, U.tar1)}" fill="#f2e6c4"/>`);
    o.push(`<path d="${band(BF, -90, 0, U.tar1, U.conj1)}" fill="#e3949a"/>`);
    for (let v = -80; v < -4; v += 12) { const p = BF(v, 16); o.push(`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#e9c35e"/>`); }
    o.push(`</g><path d="${outline}" fill="none" stroke="#c9b98f" stroke-width="1.2"/>`);
    // anterior lamella
    o.push(`<path d="${band(AF, 0, L, U.skin0, 0)}" fill="#e8bfa0"/>`);
    o.push(`<path d="${band(AF, 0, L - 8, U.orb0, U.orb1)}" fill="#b5525c"/>`);
    for (let s = 8; s < L - 10; s += 11) o.push(`<path d="M${f(AF(s, -36))}L${f(AF(s, -4))}" stroke="#c9707a" stroke-width="2" opacity="0.7"/>`);
    // upper posterior lamella (extends a bit over the strip while uncut to hide the joint)
    const sEnd = cutDone ? S_CUT : S_CUT + 8;
    o.push(`<path d="${band(UF, 0, S_TT, 0, U.tar1)}" fill="#c3cad3"/>`);
    o.push(`<path d="${band(UF, S_TT, sEnd, 0, U.tar1)}" fill="#f2e6c4"/>`);
    o.push(`<path d="${band(UF, 0, sEnd, U.tar1, U.conj1)}" fill="#e3949a"/>`);
    o.push(`<path d="M${f(UF(S_TT, 0))}L${f(UF(S_TT, U.tar1))}" stroke="#c9b98f" stroke-width="1.2"/>`);
    o.push(`<path d="M${[...Array(Math.floor((sEnd - S_TT) / 3) + 1)].map((_, i) => f(UF(S_TT + i * 3, 0))).join('L')}" stroke="#c9b98f" stroke-width="1.2" fill="none"/>`);
    for (let s = S_TT + 18; s < S_CUT - 6; s += 12) { const p = UF(s, 16); o.push(`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#e9c35e"/>`); }
    // conjunctival scars
    const scarOp = 0.55 + 0.45 * (S.scar ?? 1);
    for (const s of [200, 255, 310, 360]) o.push(`<path d="M${f(UF(s, 33.5))}L${f(UF(s + 13, 37))}" stroke="#fff" stroke-width="${1.8 + 1.5 * (S.scar || 0)}" opacity="${scarOp}"/>`);
    for (const v of [-60, -25]) o.push(`<path d="M${f(BF(v, 33.5))}L${f(BF(v + 13, 37))}" stroke="#fff" stroke-width="${1.8 + 1.5 * (S.scar || 0)}" opacity="${scarOp}"/>`);
    if (S.contract) { // contraction arrows along the conjunctiva
      for (const [s, dir] of [[230, 1], [330, -1]]) { const a = UF(s, 52), b = UF(s + dir * 50, 52);
        o.push(`<path d="M${f(a)}L${f(b)}" stroke="${COL.red}" stroke-width="4" marker-end="url(#arrR)" opacity="${S.contract}"/>`); }
    }
    // incision
    if (S.cut > 0) {
      const a = UF(S_CUT, U.conj1), b = UF(S_CUT, 0), e = [lerp(a[0], b[0], clamp01(S.cut)), lerp(a[1], b[1], clamp01(S.cut))];
      o.push(`<path d="M${f(a)}L${f(e)}" stroke="${COL.red}" stroke-width="3.5"/>`);
      if (cutDone) o.push(`<path d="M${f(BF(-90, 0))}L${f(BF(-90, U.conj1))}" stroke="${COL.red}" stroke-width="3.5"/>`);
    }
    if (S.bltr > 0) { // full-thickness incision (skin → conjunctiva) 3 mm above the margin
      const a = AF(S_CUT, U.skin0), b = UF(S_CUT, U.conj1), e = [lerp(a[0], b[0], clamp01(S.bltr)), lerp(a[1], b[1], clamp01(S.bltr))];
      o.push(`<path d="M${f(a)}L${f(e)}" stroke="${COL.red}" stroke-width="3.5"/>`);
    }
    if (S.flapCut > 0) { const a = AF(262, U.skin0), b = AF(262, 0); o.push(`<path d="M${f(a)}L${f([lerp(a[0], b[0], clamp01(S.flapCut)), lerp(a[1], b[1], clamp01(S.flapCut))])}" stroke="${COL.red}" stroke-width="3.5"/>`); }
    // lashes
    const lashes = [[-40, 1], [-35, 1.08], [-30, 0.95], [-25, 1.02]];
    for (const [u0, len] of lashes) o.push(`<path d="M${f(BF(-2, u0))}Q${f(BF(58 * len, u0 - 6))} ${f(BF(86 * len, u0 - 46 * len))}" stroke="#2a2018" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
    if (S.misdirected) { const r = BF(-2, -22); o.push(`<path d="M${f(r)}Q${f(BF(40, -2))} ${f(BF(70, 30))}" stroke="${COL.amber}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="${S.misdirected}"/>`); }
    if (S.metaplastic) { const r = BF(-2, 22); o.push(`<path d="M${f(r)}Q${f(BF(36, 34))} ${f(BF(60, 62))}" stroke="${COL.amber}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="${S.metaplastic}"/>`); }
    // MCJ marker on the margin surface: normal posterior to the meibomian orifice (u=16) → anterior migration
    if (S.mcj) { const u = lerp(27, 6, S.mcjShift || 0), p = BF(0, u), q = BF(14, u), mo = BF(0, 16);
      o.push(`<g opacity="${S.mcj}"><circle cx="${mo[0]}" cy="${mo[1]}" r="5" fill="#e9c35e" stroke="#9c7a20" stroke-width="1.5"/>
        <path d="M${f(p)}L${f(q)}" stroke="${COL.accent}" stroke-width="4" stroke-linecap="round"/></g>`); }
    // suture
    const SU = UF(S_CUT - 6, 5), SM = BF(-40, -4), SE = S.buried ? BF(-14, -14) : AF(L - 16, U.skin0);
    const sp = clamp01(S.suture || 0);
    if (sp > 0 && !S.hideSuture) {
      const N = 30, pts = []; for (let i = 0; i <= N * sp; i++) { const tt = i / N; pts.push([(1 - tt) ** 2 * SU[0] + 2 * (1 - tt) * tt * SM[0] + tt * tt * SE[0], (1 - tt) ** 2 * SU[1] + 2 * (1 - tt) * tt * SM[1] + tt * tt * SE[1]]); }
      o.push(`<path d="M${pts.map(f).join('L')}" stroke="${COL.suture}" stroke-width="3.2" fill="none"/>`);
      if (sp >= 1 && !S.buried) { const tA = nrm(B.g), tB = tan(B.g);
        for (const kk of [-1, 1]) o.push(`<path d="M${f(SE)}l${(-tA[0] * 24 + kk * tB[0] * 12).toFixed(1)} ${(-tA[1] * 24 + kk * tB[1] * 12).toFixed(1)}" stroke="${COL.suture}" stroke-width="3" stroke-linecap="round"/>`);
        o.push(`<circle cx="${SE[0]}" cy="${SE[1]}" r="5" fill="${COL.suture}"/>`); }
      if (sp >= 1 && S.buried) o.push(`<circle cx="${SE[0]}" cy="${SE[1]}" r="4.5" fill="${COL.suture}"/>`);
    }
    o.push(`</g>`);
    // anchors in panel coordinates
    const sc = p => [view.tx + p[0] * view.k, view.ty + p[1] * view.k];
    const gpA = y => { const a = Math.asin((y - GLOBE.y) / GLOBE.r); return [GLOBE.x - GLOBE.r * Math.cos(a), y]; };
    const A = { skin: sc(AF(215, -44)), orb: sc(AF(245, -20)), upper: sc(UF(300, 14)), strip: sc(BF(-50, 16)), conj: sc(UF(300, 36)),
      suture: sc([(SU[0] + 2 * SM[0] + SE[0]) / 4, (SU[1] + 2 * SM[1] + SE[1]) / 4]), lash: sc(BF(72, -64)), cornea: sc(gpA(350)),
      wedge: sc(UF(S_CUT - 8, 18)), postMargin: sc(BF(-3, U.conj1 - 3)), mcj: sc(BF(6, lerp(27, 6, S.mcjShift || 0))), meib: sc(BF(0, 16)),
      cut: sc(UF(S_CUT, 16)), plane: sc(BF(-45, -3)), flap: sc(AF(300, -30)), crease: sc(AF(262, -46)), misd: sc(BF(55, 20)), meta: sc(BF(45, 50)) };
    let labels = '';
    if (S.labels !== false) {
      const cutNames = cutDone || S.cutLabels;
      labels += lab('皮膚', 20, 56, A.skin) + lab('orbicularis', 20, 94, A.orb);
      labels += lab(cutNames ? '上方那片 tarsus' : 'tarsus', 20, 146, A.upper, { bold: true });
      if (cutNames) labels += lab('瞼緣側那片 tarsus', 20, 226, A.strip, { bold: true });
      if (sp > 0 && !S.hideSuture) labels += lab('縫線', 20, 276, A.suture, { color: COL.suture, bold: true });
      labels += lab('睫毛', 20, 336, A.lash);
      labels += lab('角膜', W - 20, 336, A.cornea, { side: 'R' });
      labels += lab('結膜', W - 20, 120, A.conj, { side: 'R' });
    }
    return { svg: o.join(''), labels, A };
  }
  // local coordinates of a point on the marginal strip for an uncut lid with the given curl (used to aim zoomed views)
  function marginLocal(curlAmt, v = 0, u = 10) { const P0 = chordPose(centreline(curlAmt * CURL)); return add(add(P0.O, tan(P0.g), v), nrm(P0.g), u); }
  return { draw, L, S_CUT, marginLocal };
})();

// ============================================================================
// FRONTAL MODEL — right eye, examiner's view (temporal = left, nasal = right). 15 px = 1 mm, drawn at scale CK.
// ============================================================================
const COR = (() => {
  const CK = 0.78, MM = 15, LC = [-232, 4], MC = [228, 12], SECTION_X = 18, SUT_X = [-118, 18, 152];
  const tt = x => (x - LC[0]) / (MC[0] - LC[0]);
  const upperMargin = x => lerp(LC[1], MC[1], tt(x)) - 92 * Math.pow(psin(Math.PI * tt(x)), 0.9) * (1 + 0.06 * (tt(x) - 0.5));
  const lowerMargin = x => lerp(LC[1], MC[1], tt(x)) + 50 * Math.pow(psin(Math.PI * tt(x)), 1.1);
  const tx0 = LC[0] + 40, tx1 = MC[0] - 44;
  const tH = (x, nasalShort = 0) => { const base = 10 * MM * Math.pow(psin(Math.PI * (x - tx0) / (tx1 - tx0)), 0.75); return base * (1 - 0.25 * nasalShort * ss(20, 180, x)); };
  const xs = []; for (let x = LC[0]; x <= MC[0]; x += 4) xs.push(x);
  const tXs = []; for (let x = tx0; x <= tx1; x += 4) tXs.push(x);
  function eyeBall(fissPath) {
    return `<clipPath id="fissC"><path d="${fissPath}"/></clipPath><path d="${fissPath}" fill="#f4f1ea"/>
      <g clip-path="url(#fissC)"><circle cx="4" cy="-6" r="78" fill="url(#irisG)"/><circle cx="4" cy="-6" r="27" fill="#0d0b0a"/>
      <circle cx="-14" cy="-26" r="7" fill="#fff" opacity="0.85"/><circle cx="4" cy="-6" r="78" fill="none" stroke="#2b1a10" stroke-width="2"/></g>`;
  }
  function lowerLid() {
    let s = `<path d="M${xs.map(x => f([x, lowerMargin(x)])).join('L')}" stroke="#b97a63" stroke-width="2.5" fill="none"/>`;
    for (let x = LC[0] + 40; x < MC[0] - 40; x += 13) { const y = lowerMargin(x) + 3; s += `<path d="M${x} ${y}q ${(x * 0.02).toFixed(1)} 9 ${(x * 0.03).toFixed(1)} 13" stroke="#3a2a20" stroke-width="1.6" fill="none"/>`; }
    return s + `<ellipse cx="${MC[0] - 18}" cy="${MC[1] - 4}" rx="13" ry="10" fill="#e48f95"/>`;
  }
  // C: { evert, misdirected, metaplastic, tarsus, incision, incWavy, incShort, marks, spacing, sutures, tight, section, ends, nasalShort,
  //      periph, bleed, notch, inject, everted, scar, lenArrow }
  function draw(C, W, H) {
    const cx = 304, cy = 248, o = [], ev = C.evert ?? 0;
    const sc = p => [cx + p[0] * CK, cy + p[1] * CK];
    o.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#skinC)"/>`);
    o.push(`<g transform="translate(${cx} ${cy}) scale(${CK})">`);
    const everted = C.everted || 0;
    const A = {};
    if (everted < 1) {
      const g = []; const op = 1 - everted;
      const upMarg = x => upperMargin(x) + 4.5 * Math.max(0, -ev) * psin(Math.PI * tt(x));
      const fiss = 'M' + xs.map(x => f([x, upMarg(x)])).join('L') + 'L' + xs.slice().reverse().map(x => f([x, lowerMargin(x)])).join('L') + 'Z';
      g.push(eyeBall(fiss)); g.push(lowerLid());
      const mv = Math.max(0, ev) * 9 + (ev > -0.5 ? lerp(0, 3, ss(-0.5, 0, ev)) : 0);
      if (mv > 0.2) g.push(`<path d="M${xs.map(x => f([x, upMarg(x)])).join('L')}L${xs.slice().reverse().map(x => f([x, upMarg(x) + mv * psin(Math.PI * tt(x))])).join('L')}Z" fill="#d98a8f"/>`);
      g.push(`<path d="M${xs.map(x => f([x, upMarg(x)])).join('L')}" stroke="#9b6450" stroke-width="3" fill="none"/>`);
      // lashes
      for (let x = LC[0] + 26; x < MC[0] - 22; x += 7.5) {
        const lean = x / 230, y = upMarg(x), j = Math.sin(x * 12.9898) * 0.5 + 0.5;
        const misd = C.misdirected && [-150, -60, 40, 110].some(m => Math.abs(m - x) < 4);
        const e = misd ? lerp(ev, -1, C.misdirected) : ev;
        const inv = Math.max(0, -e), out = Math.max(0, e), nk = 1 - inv;
        const len = (20 + 8 * j) * (1 - 0.45 * inv);
        const c1x = x + lean * (3 * inv + 7 * nk), c1y = y + 10 * inv + 14 * nk - 4 * out;
        const t1x = x + lean * (5 * inv + 15 * nk + 6 * out), t1y = y + len * inv + (2 - 10 * out) * nk;
        const col = misd ? COL.amber : '#2a1d15';
        g.push(`<path d="M${x.toFixed(1)} ${(y + 1).toFixed(1)}Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${t1x.toFixed(1)} ${t1y.toFixed(1)}" stroke="${col}" stroke-width="${misd ? 2.6 : 2}" fill="none" stroke-linecap="round" opacity="${misd ? 1 : 0.55 + 0.45 * nk}"/>`);
      }
      if (C.metaplastic) for (const x of [-90, 70]) { const y = upMarg(x) + 4; g.push(`<path d="M${x} ${y}q 2 12 4 22" stroke="${COL.amber}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${C.metaplastic}"/><circle cx="${x}" cy="${y}" r="2.4" fill="${COL.amber}" opacity="${C.metaplastic}"/>`); }
      if (C.periph) for (const x0 of [-200, 180]) g.push(`<ellipse cx="${x0}" cy="${upperMargin(x0) + 8}" rx="34" ry="24" fill="none" stroke="${COL.amber}" stroke-width="3" stroke-dasharray="6 5" opacity="${C.periph}"/>`);
      // crease
      g.push(`<path d="M${xs.filter(x => x > LC[0] + 60 && x < MC[0] - 50).map(x => f([x, upperMargin(x) - 6 * MM * Math.pow(psin(Math.PI * tt(x)), 1.2) - 4])).join('L')}" stroke="#c0927a" stroke-width="2.2" fill="none" opacity="0.8"/>`);
      // tarsus outline (behind skin)
      if (C.tarsus) g.push(`<path d="M${tXs.map(x => f([x, upperMargin(x)])).join('L')}L${tXs.slice().reverse().map(x => f([x, upperMargin(x) - tH(x, C.nasalShort || 0)])).join('L')}Z" fill="#f2e6c4" fill-opacity="${0.22 * C.tarsus}" stroke="#9c8a5c" stroke-width="1.6" stroke-dasharray="6 5" opacity="${C.tarsus}"/>`);
      if (C.inject) g.push(`<path d="M${tXs.map(x => f([x, upperMargin(x) - 4])).join('L')}L${tXs.slice().reverse().map(x => f([x, upperMargin(x) - tH(x) - 10])).join('L')}Z" fill="#8fc8ef" opacity="${0.45 * C.inject}"/>`);
      // incision (dashed: on the conjunctival side)
      if (C.incision) { const xsI = tXs.filter(x => tH(x) > 3.6 * MM); const n = Math.max(2, Math.round(xsI.length * clamp01(C.incision)));
        g.push(`<path d="M${xsI.slice(0, n).map(x => f([x, upperMargin(x) - 3 * MM])).join('L')}" stroke="${COL.red}" stroke-width="3" stroke-dasharray="9 6" fill="none"/>`); }
      // skin marks before injection
      if (C.marks) for (const sx of SUT_X) g.push(`<circle cx="${sx}" cy="${upperMargin(sx) - 12}" r="5" fill="#5b3fa0" opacity="${C.marks}"/>`);
      if (C.spacing) { const y = upperMargin(SUT_X[1]) - 52; g.push(`<g opacity="${C.spacing}" stroke="${COL.accent}" stroke-width="2.4" fill="none">
          <path d="M${SUT_X[0]} ${y}L${SUT_X[1]} ${y}M${SUT_X[1]} ${y}L${SUT_X[2]} ${y}"/><path d="M${SUT_X[0]} ${y - 8}v16M${SUT_X[1]} ${y - 8}v16M${SUT_X[2]} ${y - 8}v16"/></g>`); }
      // sutures
      if (C.sutures) { const tight = C.tight || 0;
        for (const sx of SUT_X) { const yTop = upperMargin(sx) - 3 * MM - 4, yK = upperMargin(sx) - 10 + 3 * tight;
          for (const dx of [-7, 7]) g.push(`<path d="M${sx + dx} ${yTop}L${sx + dx * (1 - 0.6 * tight)} ${yK}" stroke="${COL.suture}" stroke-width="2.4" stroke-dasharray="5 4" opacity="${C.sutures}"/>`);
          g.push(`<path d="M${sx - 7 * (1 - 0.6 * tight)} ${yK}L${sx + 7 * (1 - 0.6 * tight)} ${yK}" stroke="${COL.suture}" stroke-width="3.2" stroke-linecap="round" opacity="${C.sutures}"/><circle cx="${sx}" cy="${yK}" r="${4 + 2 * tight}" fill="${COL.suture}" opacity="${C.sutures}"/>`); } }
      o.push(`<g opacity="${op}">${g.join('')}</g>`);
      Object.assign(A, { incision: sc([110, upperMargin(110) - 3 * MM]), tarsus: sc([120, upperMargin(120) - 0.6 * tH(120)]), suture: sc([SUT_X[0] - 7, upperMargin(SUT_X[0]) - 24]),
        lashes: sc([-150, upperMargin(-150) + 14]), margin: sc([60, upperMargin(60)]), skinLid: sc([-40, upperMargin(-40) - 70]), mark: sc([SUT_X[0], upperMargin(SUT_X[0]) - 12]) });
    }
    if (everted > 0) {
      // upper lid everted: tarsal conjunctiva faces the viewer, lid margin (with lashes) on top, fold at the bottom
      const g = [];
      const fold = x => upperMargin(x) + 22 * psin(Math.PI * tt(x));
      const fiss = 'M' + xs.map(x => f([x, fold(x)])).join('L') + 'L' + xs.slice().reverse().map(x => f([x, lowerMargin(x)])).join('L') + 'Z';
      g.push(eyeBall(fiss)); g.push(lowerLid());
      const top = x => fold(x) - tH(x, C.nasalShort || 0) * 0.92 - 6;
      const conj = `M${tXs.map(x => f([x, fold(x)])).join('L')}L${tXs.slice().reverse().map(x => f([x, top(x)])).join('L')}Z`;
      g.push(`<path d="M${xs.map(x => f([x, fold(x)])).join('L')}L${xs.slice().reverse().map(x => f([x, fold(x) - 10 * psin(Math.PI * tt(x))])).join('L')}Z" fill="#d9a48e"/>`);
      g.push(`<path d="${conj}" fill="#e7a0a3" stroke="#b9666c" stroke-width="2"/>`);
      for (let x = tx0 + 26; x < tx1 - 20; x += 16) g.push(`<path d="M${x} ${fold(x) - 6}L${x} ${top(x) + 10}" stroke="#f0cf73" stroke-width="5" opacity="0.45" stroke-linecap="round"/>`);
      // scars: fine lines → dense
      const sc0 = C.scar ?? 0.3;
      for (let i = 0; i < 9; i++) { const x0 = tx0 + 40 + i * 33, y0 = lerp(fold(x0), top(x0), 0.45 + 0.25 * Math.sin(i * 2.1)); const opk = ss(i / 9 * 0.9, i / 9 * 0.9 + 0.1, sc0);
        g.push(`<path d="M${x0 - 20} ${y0}q 20 ${(-6 + (i % 3) * 5)} 40 ${(i % 2 ? 4 : -3)}" stroke="#fff" stroke-width="${2 + 2.5 * sc0}" opacity="${0.35 + 0.6 * opk}" fill="none" stroke-linecap="round"/>`); }
      if (sc0 > 0.6) g.push(`<path d="${conj}" fill="#fff" opacity="${0.35 * ss(0.6, 1, sc0)}"/>`);
      // margin with lashes pointing up
      g.push(`<path d="M${tXs.map(x => f([x, top(x)])).join('L')}" stroke="#9b6450" stroke-width="3" fill="none"/>`);
      for (let x = tx0 + 8; x < tx1 - 6; x += 7.5) { const y = top(x), lean = x / 230; g.push(`<path d="M${x} ${y}q ${(lean * 4).toFixed(1)} -10 ${(lean * 10).toFixed(1)} -20" stroke="#2a1d15" stroke-width="2" fill="none"/>`); }
      // incision 3 mm from the margin, parallel to it
      const inc = x => top(x) + 3 * MM;
      const xsI = tXs.filter(x => tH(x) > 3.6 * MM);
      if (C.incision) { const n = Math.max(2, Math.round(xsI.length * clamp01(C.incision)));
        const wav = C.incWavy || 0, short = C.incShort || 0;
        const pts = xsI.slice(0, n).filter(x => Math.abs(x - 10) < lerp(999, 60, short)).map(x => [x, inc(x) + wav * 7 * Math.sin(x / 9) * (Math.abs(x) < 90 ? 1 : 0)]);
        if (pts.length > 1) g.push(`<path d="M${pts.map(f).join('L')}" stroke="${COL.red}" stroke-width="3.5" fill="none"/>`);
        if (short > 0) for (const sgn of [-1, 1]) { const x2 = sgn < 0 ? xsI[0] : xsI[xsI.length - 1]; g.push(`<path d="M${10 + sgn * 60} ${inc(10 + sgn * 60)}L${x2} ${inc(x2)}" stroke="#7d8a97" stroke-width="2.5" stroke-dasharray="4 5" opacity="${short}"/>`); }
      }
      if (C.ends) for (const x0 of [xsI[0], xsI[xsI.length - 1]]) g.push(`<circle cx="${x0}" cy="${inc(x0)}" r="22" fill="none" stroke="${COL.amber}" stroke-width="3" stroke-dasharray="6 5" opacity="${C.ends}"/>`);
      if (C.lenArrow) { const y = fold(10) + 26; g.push(`<g opacity="${C.lenArrow}" stroke="${COL.accent}" stroke-width="2.4"><path d="M${xsI[0]} ${y}H${xsI[xsI.length - 1]}"/><path d="M${xsI[0]} ${y - 8}v16M${xsI[xsI.length - 1]} ${y - 8}v16"/></g>`); }
      if (C.bleed) for (const [x, r] of [[-40, 9], [-10, 7], [30, 10], [70, 6], [5, 5]]) g.push(`<circle cx="${x}" cy="${inc(x) + 6}" r="${r}" fill="#b3122b" opacity="${0.8 * C.bleed}"/>`);
      if (C.notch) { const x = -120; g.push(`<path d="M${x} ${top(x)}L${x} ${inc(x)}" stroke="#b3122b" stroke-width="5" opacity="${C.notch}"/><circle cx="${x}" cy="${top(x)}" r="20" fill="none" stroke="${COL.amber}" stroke-width="3" stroke-dasharray="6 5" opacity="${C.notch}"/>`); }
      if (C.nasalShort) { const x = 150; g.push(`<path d="M${x} ${fold(x)}L${x} ${top(x)}" stroke="${COL.amber}" stroke-width="3" opacity="${C.nasalShort}"/><path d="M${x - 8} ${fold(x)}h16M${x - 8} ${top(x)}h16" stroke="${COL.amber}" stroke-width="3" opacity="${C.nasalShort}"/>`); }
      o.push(`<g opacity="${everted}">${g.join('')}</g>`);
      Object.assign(A, { evMargin: sc([-60, top(-60)]), evConj: sc([60, lerp(fold(60), top(60), 0.4)]), evInc: sc([120, inc(120)]), evFold: sc([-150, fold(-150)]),
        evEndL: sc([xsI[0], inc(xsI[0])]), evEndR: sc([xsI[xsI.length - 1], inc(xsI[xsI.length - 1])]), evNotch: sc([-120, top(-120)]), evNasal: sc([150, lerp(fold(150), top(150), 0.5)]),
        evLen: sc([10, fold(10) + 26]), evBleed: sc([30, inc(30) + 6]), evCentre: sc([0, inc(0)]) });
    }
    if (C.section) o.push(`<line x1="${SECTION_X}" y1="-240" x2="${SECTION_X}" y2="150" stroke="${COL.accent}" stroke-width="2" stroke-dasharray="3 5" opacity="${C.section}"/>`);
    o.push(`</g>`);
    A.section = sc([SECTION_X, -232]);
    let labels = `<text x="14" y="${H - 12}" fill="${COL.sub}" font-size="13">temporal</text><text x="${W - 14}" y="${H - 12}" fill="${COL.sub}" font-size="13" text-anchor="end">nasal</text>`;
    if (C.section) labels += lab('左圖切面', W - 16, 26, A.section, { side: 'R', color: COL.accent, bold: true, op: C.section });
    return { svg: o.join(''), labels, A };
  }
  return { draw, SUT_X };
})();
