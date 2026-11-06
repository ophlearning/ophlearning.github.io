// ============================================================================
// Margin laceration repair (opt-in): the margin-face view and the suture overlays for the sagittal (wound face) and coronal views.
// The laceration itself (gap, pout / notch, step) is drawn by CORONAL.draw with state.lac*; the same warp places everything here.
//
// Margin-face view (MARGIN): the upper lid margin seen from below, flattened: x = coronal x (temporal −, nasal +, right eye),
// y = −u, u = depth from the posterior lid edge (LID constants), so anterior (skin, lashes) is UP and posterior (conjunctiva) DOWN.
// Landmarks (posterior → anterior): MCJ (U_MCJ), meibomian orifices (U_ORIF), gray line (U_GREY), lash rows (schematic), anterior edge (U_SKIN).
//
// Sutures (state, 0–1 = shown / progress): lacGrey, lacGreyTie (6-0 silk through the gray line, GREY_D mm from the wound edge, tails long:
// EyeWiki), lacTar (partial-thickness tarsal sutures through the anterior tarsus — EyeRounds; 3 upper / 2 lower — EyeWiki), lacLash, lacLashTie
// (6-0 silk along the anterior lash line — EyeWiki), lacSkin (interrupted skin sutures), lacTails (silk tails buried under a skin suture,
// away from the cornea — EyeWiki), vm, lacVMTie (EyeRounds alternative: 7-0 Vicryl vertical mattress at the meibomian orifices, far–far then
// near–near). Distances other than GREY_D, the suture heights and the lash rows are schematic.
// ============================================================================
const LAC = (() => {
  const { poly, F, NS, lerp, UF } = LID;
  const U = { conj: LID.U_CONJ, mcj: LID.U_MCJ, orif: LID.U_ORIF, grey: LID.U_GREY, tar: LID.U_TAR, skin: LID.U_SKIN, lash: 1.72 };   // lash: schematic
  const GREY_D = 2.0;                                      // EyeWiki: gray line silk 2 mm from the wound edge on either side
  const LASH_D = 2.0, VM_FAR = 2.0, VM_NEAR = 1.0;         // schematic (sources give no number)
  const TAR = { upper: [2.0, 3.5, 5.0], lower: [1.3, 2.8] }, TAR_U = 0.8, TAR_D = 1.5;   // heights / bite depth / half-width: schematic
  const SKIN_A = [1.4, 2.7, 4.0], SKIN_D = 1.0;            // skin sutures: height above the margin (coronal) and half-width, schematic
  const GREY_S = 0.9, LASH_S = 0.9, SKIN_U = 0.3;          // where a margin suture crosses the wound face (sagittal), schematic
  const SKIN_S = [1.2, 2.3, 3.4];                          // skin sutures on the wound face (sagittal, s ≤ 3.6 where LID.uSkin applies), schematic
  const C = { silk: '#1b1b1b', vic: '#7b3fa0', gut: '#b8925a', wound: '#8e3b3f', woundL: '#b8575a', strip: '#dfa892', mucosa: '#e9a4a0', conj: '#f2b8b5',
    skin: '#efcfb6', grey: '#7d7f86', orif: '#c48a2a', lash: '#2b2019', edge: '#a5474a', sclera: '#f7f4ef' };
  const lacX = st => st.lacX || 0;
  // the coronal warp at the margin height, and the AP misalignment of the nasal side (lacAP mm, + = nasal side more anterior)
  function marginMap(st) {
    const W = CORONAL.lacWarp(st), x0 = lacX(st), ap = st.lacAP || 0;
    return ([x, y]) => { const xw = W ? W([x, CORONAL.Uy(x)])[0] : x, side = x - x0 >= 0 ? 1 : -1, h = 1 - LID.ss(0, CORONAL.LAC_FADE, Math.abs(x - x0));
      return [xw, y - (side > 0 ? ap * h : 0)]; };
  }
  const dot = (p, r, fill, stroke = 'none') => `<circle cx="${p[0].toFixed(3)}" cy="${p[1].toFixed(3)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="0.9" ${NS}/>`;
  const line = (P, col, w, dash = '', op = 1) => `<path d="${poly(P, false)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} opacity="${op}" ${NS}/>`;
  // one interrupted suture drawn from its two surface points a, b (already mapped): placed (dashed strand under the gap) or tied (knot)
  function stitch(a, b, col, placed, tied, tails, tailDir) {
    if (!placed) return '';
    let s = dot(a, 0.09, col) + dot(b, 0.09, col);
    if (!tied) s += line([a, b], col, 1.4, '3 2', 0.8 * Math.min(1, placed));
    else { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s += line([a, m, b], col, 1.8) + dot(m, 0.12, col); }
    if (tails) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];               // long tails, left for burying under a skin suture
      (tied ? [m, m] : [a, b]).forEach((p, i) => { const e = [p[0] + (i ? 0.45 : -0.45) + tailDir[0], p[1] + tailDir[1]];
        s += line(LID.spline([p, [lerp(p[0], e[0], 0.4), lerp(p[1], e[1], 0.6)], e], 0.05), col, 1.2); }); }
    return s;
  }

  // ---------------------------------------------------------------- margin-face view
  function margin(opt = {}) {
    const st = opt.state || {}, id = opt.id || 'mar', M = marginMap(st), x0 = lacX(st), o = [], A = {};
    const XS = []; for (let x = -16; x <= 14 + 1e-9; x += 0.1) XS.push(+x.toFixed(2));
    const L = [...XS.filter(x => x < x0 - 0.01), x0 - 0.004], R = [x0 + 0.004, ...XS.filter(x => x > x0 + 0.01)];   // each half runs right up to the wound line
    const band = (xsArr, u0, u1) => poly([...xsArr.map(x => M([x, -u0])), ...xsArr.slice().reverse().map(x => M([x, -u1]))]);
    o.push(`<rect x="-30" y="-8" width="60" height="16" fill="${C.sclera}"/>`);
    for (const P of [L, R].filter(P => P.length > 1)) {
      o.push(`<path d="${band(P, -1.4, 0)}" fill="${C.conj}"/>`);                  // tarsal conjunctiva turning up behind the margin
      o.push(`<path d="${band(P, 0, U.mcj)}" fill="${C.mucosa}"/>`);              // mucosal strip: posterior edge → MCJ
      o.push(`<path d="${band(P, U.mcj, U.skin)}" fill="${C.strip}"/>`);          // keratinised intermarginal strip
      o.push(`<path d="${band(P, U.skin, U.skin + 1.6)}" fill="${C.skin}"/>`);    // lid skin turning up in front of the margin
      for (const [u, col, w, dash] of [[0, '#c77f7b', 1.0, ''], [U.mcj, '#b0605d', 1.0, '2 2'], [U.grey, C.grey, 2.2, ''], [U.skin, '#c99476', 1.2, '']])
        o.push(line(P.map(x => M([x, -u])), col, w, dash));
      for (const x of P) { const k = Math.round(x * 100);                         // meibomian orifices every 0.5 mm (schematic)
        if (k % 50 === 0) o.push(dot(M([x, -U.orif]), 0.075, C.orif)); }
      for (const [j, u] of [1.52, 1.72, 1.9].entries()) for (const x of P) { const k = Math.round(x * 100) + j * 13;    // lash rows (schematic)
        if (k % 35 === 0) { const p = M([x + ((k * 7) % 11 - 5) * 0.012, -u]); o.push(dot(p, 0.06, C.lash) + line([p, [p[0] + 0.05, p[1] - 0.35]], C.lash, 0.9)); } }
    }
    // the wound cleft between the two edges (raw tissue)
    const eT = M([x0 - 0.004, 0]), eN = M([x0 + 0.004, 0]);
    if (eN[0] - eT[0] > 0.02) { const top = -U.skin - 1.6, bot = 1.4;
      o.push(`<path d="${poly([[eT[0], top], [eT[0], bot], [eN[0], bot], [eN[0], top]])}" fill="${C.wound}"/>`);
      for (const xx of [x0 - 0.004, x0 + 0.004]) o.push(line([M([xx, -top]), M([xx, -bot])].map((p, i) => [p[0], i ? bot : top]), C.edge, 1.6)); }
    // landmarks on each side of the wound (anchors for labels: temporal side)
    for (const [k, u] of Object.entries({ mcj: U.mcj, orif: U.orif, grey: U.grey, lash: U.lash, skin: U.skin, conj: -0.6 })) A[k] = M([x0 - 3.2, -u]);
    A.edgeT = M([x0 - 0.004, -U.grey]); A.edgeN = M([x0 + 0.004, -U.grey]);
    // sutures
    const pts = (d, u) => [M([x0 - d, -u]), M([x0 + d, -u])];
    if (st.lacVM) { const [fa, fb] = pts(VM_FAR, U.orif), [na, nb] = pts(VM_NEAR, U.orif), t = st.lacVMTie;
      o.push(dot(fa, 0.09, C.vic) + dot(fb, 0.09, C.vic) + dot(na, 0.09, C.vic) + dot(nb, 0.09, C.vic));
      o.push(t ? line([fa, na], C.vic, 1.6) + line([fb, nb], C.vic, 1.6) + dot([(na[0] + nb[0]) / 2, (na[1] + nb[1]) / 2], 0.12, C.vic)
        : line([fa, fb], C.vic, 1.4, '3 2', 0.8) + line([na, nb], C.vic, 1.4, '1.5 1.5', 0.8) + line([fb, nb], C.vic, 1.4));
      A.vmFarT = fa; A.vmNearT = na; }
    if (st.lacGrey) { const [a, b] = pts(GREY_D, U.grey); o.push(stitch(a, b, C.silk, st.lacGrey, st.lacGreyTie, !st.lacTails, [0, -2.6])); A.greyT = a; A.greyN = b; }
    if (st.lacLash) { const [a, b] = pts(LASH_D, U.lash); o.push(stitch(a, b, C.silk, st.lacLash, st.lacLashTie, !st.lacTails, [0, -2.2])); A.lashT = a; A.lashN = b; }
    return { svg: o.join(''), A, M, U, GREY_D };
  }

  // ---------------------------------------------------------------- sagittal overlay: where each suture crosses the wound face
  function sag(opt = {}) {
    const st = opt.state || {}, o = [], A = {}, lid = opt.lid || 'upper';
    const T = TAR[lid], n = Math.round((st.lacTar || 0) * T.length);
    T.slice(0, n).forEach((s, i) => { const p = UF.at(s, TAR_U); o.push(dot(p, 0.13, C.vic, '#4a2063')); A['tar' + i] = p; });
    if (st.lacGrey) { A.grey = UF.at(GREY_S, U.grey); o.push(dot(A.grey, 0.12, C.silk)); }
    if (st.lacLash) { A.lash = UF.at(LASH_S, U.lash); o.push(dot(A.lash, 0.12, C.silk)); }
    if (st.lacVM) { A.vmFar = UF.at(1.6, U.orif); A.vmNear = UF.at(0.7, U.orif); o.push(dot(A.vmFar, 0.11, C.vic) + dot(A.vmNear, 0.11, C.vic)); }
    if (st.lacSkin) for (const [i, s] of SKIN_S.entries()) { const p = UF.at(s, LID.uSkin(LID.VARIANTS[opt.variant || 'asian'], s) - SKIN_U); o.push(dot(p, 0.14, C.gut, '#5c4422')); A['skin' + i] = p; }   // ringed so it does not read as a lash follicle
    return { svg: o.join(''), A, TAR_U, T };
  }

  // ---------------------------------------------------------------- coronal overlay (rc = the CORONAL.draw result for the same state)
  function cor(rc, opt = {}) {
    const st = opt.state || {}, o = [], A = {}, x0 = lacX(st), W = rc.lacW || (p => p), lid = opt.lid || 'upper';
    const yU = (x, u) => rc.Uy(x) + (rc.lashY(x) - rc.Uy(x)) * u / U.skin;         // a point on the margin surface at depth u, projected
    const yS = (x, s, u) => UF.at(s, u)[1] + (rc.Uy(x) - rc.Uy(0));                    // a point s mm up the tarsus at depth u, projected
    const pair = (d, f) => [W([x0 - d, f(x0 - d)]), W([x0 + d, f(x0 + d)])];
    const T = TAR[lid], n = Math.round((st.lacTar || 0) * T.length), tied = (st.lac || 0) < 0.02;
    const seen = !tied || st.lacWin;                    // tarsal sutures are under the skin once the wound is closed: faint unless a window shows the tarsus
    T.slice(0, n).forEach((s, i) => { const [a, b] = pair(TAR_D, x => yS(x, s, TAR_U)); o.push(`<g opacity="${seen ? 1 : 0.3}">${stitch(a, b, C.vic, 1, tied, false)}</g>`); A['tar' + i] = [(a[0] + b[0]) / 2, a[1]]; });
    const tail = [0, -3.0];
    if (st.lacGrey) { const [a, b] = pair(GREY_D, x => yU(x, U.grey)); o.push(stitch(a, b, C.silk, st.lacGrey, st.lacGreyTie, !st.lacTails, tail)); A.greyT = a; A.greyN = b; }
    if (st.lacLash) { const [a, b] = pair(LASH_D, x => yU(x, U.lash)); o.push(stitch(a, b, C.silk, st.lacLash, st.lacLashTie, !st.lacTails, tail)); A.lashT = a; A.lashN = b; }
    if (st.lacSkin) SKIN_A.slice(0, Math.max(1, Math.round(st.lacSkin * SKIN_A.length))).forEach((h, i) => {
      const [a, b] = pair(SKIN_D, x => rc.Uy(x) - h); o.push(stitch(a, b, C.gut, 1, tied, false)); A['skin' + i] = [(a[0] + b[0]) / 2, a[1]]; });
    if (st.lacTails && st.lacSkin) { const k = W([x0, rc.Uy(x0) - SKIN_A[0]]);       // silk tails tucked under the lowest skin suture knot, pointing up
      for (const p of [A.greyT && [(A.greyT[0] + A.greyN[0]) / 2, A.greyT[1]], A.lashT && [(A.lashT[0] + A.lashN[0]) / 2, A.lashT[1]]].filter(Boolean))
        o.push(line(LID.spline([p, [lerp(p[0], k[0], 0.5) + 0.25, lerp(p[1], k[1], 0.5)], [k[0] + 0.15, k[1] - 0.6]], 0.05), C.silk, 1.2));
      A.tailKnot = k; }
    return { svg: o.join(''), A };
  }
  return { margin, sag, cor, U, SKIN_S, GREY_D, LASH_D, VM_FAR, VM_NEAR, TAR, TAR_U, TAR_D, SKIN_A, GREY_S, LASH_S, C };
})();
if (typeof module !== 'undefined') module.exports = LAC;
