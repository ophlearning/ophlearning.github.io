// ============================================================================
// Lateral canthus, horizontal (axial) section at the canthal level — right eye, seen from below like an axial CT: anterior = up,
// the patient's right (temporal side of the right eye) on the left. Units mm. x = the coronal x (temporal −, nasal +; the lateral canthus
// is at the same x as in CORONAL), y = the sagittal x (anterior −, globe centre 0), so this view shares x with the coronal view and the
// depth axis with the sagittal view. The lower lid is drawn projected onto this plane (its margin curve on the globe).
// state: lax (0–1, involutional horizontal laxity), distract (0–1, distraction test), canthotomy, cantholysis, strip, shortMm (mm cut off the
// strip, default schematic), stripFix (strip sutured to the periosteum inside the lateral rim), canthopexy.
// ============================================================================
const CANTHUS = (() => {
  const { add, sub, unit, hyp, lerp, ss, hash, poly, F, NS, gp, spline, track, C } = LID;
  const D2R = Math.PI / 180, bisect = (f, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; (f(a) > 0) === (f(m) > 0) ? a = m : b = m; } return (a + b) / 2; };
  const APEX = LOWER.APEX_X;                                                      // corneal apex −13.1
  // lateral orbital rim (Hertel footplate point): 13.91 mm behind the corneal apex, 21.07 mm temporal to the pupil centre (Tsai 2006; Gao 2025)
  const RIM_E = [LOWERC.LAT_RIM_X, APEX + LOWERC.HERTEL];
  const WALL = unit([0.35, 0.94]);                                                // inner (orbital) surface of the lateral wall just behind the rim (schematic)
  const TUB = add(RIM_E, WALL, 1.5);                                              // Whitnall (lateral orbital) tubercle 1.5 mm inside the rim (Gioia 1987)
  // lateral commissure at CORONAL.LC x; its depth makes the commissure-to-insertion distance 7.52 mm (Rosenstein 2000)
  const LCX = CORONAL.LC[0], LC_A = [LCX, TUB[1] - Math.sqrt(7.52 ** 2 - (LCX - TUB[0]) ** 2)];
  const MC_A = [CORONAL.MC[0], -4.2];                                             // medial commissure depth (schematic)
  const PERI = LID.PERI;
  // lower lid margin projected onto this plane: on the globe surface at height Ly(x), 0.1 mm in front of it
  const marginAt = x => { const rho = Math.hypot(x, CORONAL.Ly(x)); if (rho > 11.6) return null; const p = LOWER.surfAt(rho); return [x, p[0] - 0.1]; };
  const restCurve = () => { const pts = []; for (let x = 9.0; x >= -9.0; x -= 0.6) pts.push(marginAt(x)); return spline([MC_A, ...pts, LC_A], 0.1); };
  const REST = restCurve(), arcLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += hyp(sub(P[i], P[i - 1])); return L; };
  const L_TENDON = hyp(sub(LC_A, TUB)), R0 = arcLen(REST) + L_TENDON;          // resting route: medial canthus → lid on the globe → commissure → tubercle
  // distraction: the lid is pulled forward at x = 0; the taut lid wraps the globe from each canthus to a tangent point, then runs straight
  // to the pulled point (shortest path). D(material length) solves route(D) = material length.
  const P0 = marginAt(0);
  function tent(D) {
    const P = [0, P0[1] - D], mid = REST.findIndex(p => p[0] <= 0);
    let bestM = 1e9, iM = 0, accM = 0; for (let i = 0; i <= mid; i++) { if (i) accM += hyp(sub(REST[i], REST[i - 1])); const t = accM + hyp(sub(P, REST[i])); if (t < bestM) { bestM = t; iM = i; } }
    let bestL = 1e9, iL = REST.length - 1, accL = 0; for (let i = REST.length - 1; i >= mid; i--) { if (i < REST.length - 1) accL += hyp(sub(REST[i], REST[i + 1])); const t = accL + hyp(sub(P, REST[i])); if (t < bestL) { bestL = t; iL = i; } }
    return { len: bestM + bestL + L_TENDON, pts: [...REST.slice(0, iM + 1), P, ...REST.slice(iL)], P };
  }
  const dFor = M => M <= R0 ? 0 : bisect(D => tent(D).len - M, 0, 25);
  // slack (material length beyond the resting route): normal lid distracts 3 mm (schematic, normal < 6 mm: Pushker 2025); involutional
  // entropion lid 9 mm (Beigi 2008: 7.5–11 mm). LTS cuts shortMm off the strip; default = the difference (schematic, to be confirmed)
  const SLACK_N = tent(3).len - R0, SLACK_LAX = tent(9).len - R0, SHORT_DEF = SLACK_LAX - SLACK_N;
  function state(st) {
    const lax = st.lax || 0, fixed = (st.stripFix || 0) >= 1, shortMm = st.shortMm ?? SHORT_DEF;
    const slack = lerp(SLACK_N, SLACK_LAX, lax) - (fixed ? shortMm : 0);
    return { slack, D: dFor(R0 + slack), fixed, shortMm };
  }

  function draw(opt = {}) {
    const st = opt.state || {}, id = opt.id || 'ax', o = [], A = {}, S = state(st);
    // orbital fat behind the lid line and the tendon, inside the lateral wall (the space in front of the lid is outside the body)
    o.push(`<rect x="-60" y="-40" width="120" height="90" fill="#ffffff"/>`);
    // bone: lateral orbital rim and wall (frontal process of the zygoma), temporal fossa behind it; periosteum on the orbital side
    const inner = spline([RIM_E, add(RIM_E, WALL, 2.5), [RIM_E[0] + 2.4, RIM_E[1] + 6.0], [RIM_E[0] + 5.6, RIM_E[1] + 11], [RIM_E[0] + 9.5, RIM_E[1] + 16], [RIM_E[0] + 14, RIM_E[1] + 22]], 0.08);
    const outer = spline([[RIM_E[0] + 15.5, RIM_E[1] + 24], [RIM_E[0] + 10.6, RIM_E[1] + 17.6], [RIM_E[0] + 6.2, RIM_E[1] + 12.6], [RIM_E[0] - 2.0, RIM_E[1] + 9.0], [RIM_E[0] - 5.4, RIM_E[1] + 5.5], [RIM_E[0] - 5.8, RIM_E[1] + 2.0], [RIM_E[0] - 4.2, RIM_E[1] - 0.6], [RIM_E[0] - 1.6, RIM_E[1] - 0.8], RIM_E], 0.08);
    const bone = [...inner, ...outer];
    o.push(`<path d="${poly([...REST, TUB, ...inner.filter(p => p[1] > TUB[1]), [40, 50], [40, MC_A[1]]])}" fill="${C.ofat}"/>`);
    o.push(`<path d="${poly([[RIM_E[0] - 5.8, RIM_E[1] + 2], [RIM_E[0] - 2, RIM_E[1] + 9], [RIM_E[0] + 6.2, RIM_E[1] + 12.6], [RIM_E[0] + 15.5, RIM_E[1] + 24], [-60, 50], [-60, RIM_E[1] + 2]])}" fill="#d9b48f"/>`);   // temporalis / temporal fossa (schematic)
    o.push(`<path d="${poly(bone)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    const IW = track(inner); o.push(`<path d="${IW.band(0, IW.L, 0, -PERI)}" fill="${C.peri}" stroke="${C.periS}" stroke-width="0.7" ${NS}/>`);
    o.push(`<circle cx="${TUB[0].toFixed(3)}" cy="${TUB[1].toFixed(3)}" r="0.45" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1" ${NS}/>`);
    A.rim = add(RIM_E, [-1.6, 1.2]); A.tubercle = TUB; A.wall = add(RIM_E, [3.6, 8.6]); A.rimEdge = RIM_E;
    // globe (the sagittal profile turned into this plane: the globe is symmetric about the visual axis), lateral and medial rectus
    const globe = []; for (let a = 0; a < 360; a += 0.5) { const p = gp(a * D2R); globe.push([p[1], p[0]]); }
    o.push(`<path d="${poly(globe)}" fill="${C.sclera}" stroke="${C.scleraS}" stroke-width="1.2" ${NS}/>`);
    const corn = []; for (let a = 140; a <= 220; a += 0.5) { const p = gp(a * D2R); corn.push([p[1], p[0]]); }
    o.push(`<path d="${poly(corn, false)}" fill="none" stroke="${C.corneaS}" stroke-width="2.2" ${NS}/><path d="M-5.9 -9.9L5.9 -9.9" stroke="${C.iris}" stroke-width="2.4" ${NS}/><ellipse cx="0" cy="-7.9" rx="4.6" ry="2.0" fill="${C.lens}" stroke="${C.lensS}" stroke-width="1" ${NS}/>`);
    const rectus = sg => { const A0 = [], A1 = []; for (let a = 122; a >= 80; a -= 1) { const p = gp(a * D2R), n = unit(p), th = 1.2 * ss(122, 112, a); A0.push([sg * p[1], p[0]]); A1.push([sg * (p[1] + n[1] * th), p[0] + n[0] * th]); }
      return poly([...A0, [sg * 13.2, 14], [sg * 14.4, 14], ...A1.reverse()]); };
    o.push(`<path d="${rectus(-1)}" fill="${C.mus}"/><path d="${rectus(1)}" fill="${C.mus}"/>`);
    A.globe = [4, 2]; A.lr = [-12.9, 6.5]; A.cornea = [3.5, P0[1] - 0.6];
    // the lower lid (projected), lateral canthal tendon, skin; with laxity / distraction the lid leaves the globe
    const dist = st.distract || 0, D = S.D * dist, T = tent(D), curve = dist > 0 ? T.pts : REST;
    const LID_T = 2.36, fixT = S.fixed;
    const lidTrack = track(spline(curve.filter((p, i, a) => i === 0 || hyp(sub(p, a[i - 1])) > 0.05), 0.08));
    const out = q => { const p = lidTrack.off(q, 0), p2 = lidTrack.off(q, 1); return unit(sub(p2, p)); };
    const sgn = (() => { const q = lidTrack.L / 2, n = out(q); return n[1] < 0 ? 1 : -1; })();   // + offsets point anterior (away from the globe)
    const lidEnd = st.cantholysis && !fixT ? lidTrack.L - 1.5 * Math.min(1, st.cantholysis) : lidTrack.L;   // the released lid springs back medially (schematic)
    const stripL = st.stripL ?? 5, qStrip = (st.strip || 0) > 0 ? lidEnd - stripL : lidEnd;
    o.push(`<path d="${lidTrack.band(0, Math.min(lidEnd, qStrip + 0.01), 0, sgn * LID_T)}" fill="${C.orb}" opacity="0.92"/>`);
    o.push(`<path d="${lidTrack.band(0, Math.min(lidEnd, qStrip + 0.01), sgn * (LID_T - 0.13), sgn * LID_T)}" fill="${C.skin}"/>`);
    o.push(`<path d="${lidTrack.band(0, lidEnd, sgn * 0.16, sgn * 1.52)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.8" ${NS}/>`);
    o.push(`<path d="${lidTrack.band(0, Math.min(lidEnd, qStrip), 0, sgn * 0.16)}" fill="${C.conj}"/>`);
    A.lid = lidTrack.off(lidTrack.L * 0.35, sgn * 1.2); A.lidLat = lidTrack.off(lidTrack.L * 0.86, sgn * 1.2); A.tarsus = lidTrack.off(lidTrack.L * 0.6, sgn * 0.85); A.lidEnd = lidTrack.off(lidEnd, sgn * 0.8);
    if ((st.strip || 0) > 0) A.strip = lidTrack.off(lidEnd - stripL * 0.5, sgn * 0.85);
    // lateral canthal tendon from the commissure to the tubercle (cut by canthotomy / cantholysis); the strip replaces it once fixed
    const endP = lidTrack.off(lidEnd, sgn * 0.85);
    if (!fixT) { const cut = st.cantholysis ? 1 : 0; const T0 = spline([LC_A, lerpP(LC_A, TUB, 0.5), TUB], 0.05), TT = track(T0);
      o.push(`<path d="${TT.band(0, TT.L, -0.6, 0.6)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.8" opacity="${cut ? 0.45 : 1}" ${NS}/>`);
      A.tendon = TT.off(TT.L * 0.5, 0); }
    // skin lateral to the commissure (over the rim), septum and the small fat pocket in front of the tendon (Gioia 1987)
    const RT = track(REST), sgR = (() => { const n = unit(sub(RT.off(RT.L / 2, 1), RT.off(RT.L / 2, 0))); return n[1] < 0 ? 1 : -1; })(), sk0 = RT.off(RT.L, sgR * LID_T);
    const skinL = spline([sk0, [sk0[0] - 2.6, sk0[1] + 0.2], [RIM_E[0] - 2.5, RIM_E[1] - 3.4], [RIM_E[0] - 6.8, RIM_E[1] - 2.6], [RIM_E[0] - 9.5, RIM_E[1] + 1]], 0.08);
    const SKT = track(skinL);   // skin line = outer surface; skin and orbicularis lie behind it (negative offsets point posterior here)
    o.push(`<path d="${SKT.band(0, SKT.L, -0.3, -2.0)}" fill="${C.orb}"/><path d="${SKT.band(0, SKT.L, 0, -0.35)}" fill="${C.skin}" stroke="${C.skinS}" stroke-width="0.8" ${NS}/>`);
    const sept = spline([add(RIM_E, [-0.6, -0.3]), [RIM_E[0] + 1.2, RIM_E[1] - 2.4], add(LC_A, [-1.2, -0.9])], 0.05);
    o.push(`<path d="${poly(sept, false)}" fill="none" stroke="${C.septS}" stroke-width="1.6" ${NS}/>`);
    o.push(`<ellipse cx="${(RIM_E[0] + 2.4).toFixed(2)}" cy="${(RIM_E[1] - 1.2).toFixed(2)}" rx="1.2" ry="0.7" fill="${C.fat}" stroke="${C.fatS}" stroke-width="0.6" ${NS}/>`);
    A.skin = SKT.off(SKT.L * 0.45, 0); A.septum = sept[Math.floor(sept.length / 2)]; A.lc = LC_A;
    // surgical overlays
    if (st.canthotomy) { const e = lerpP(LC_A, add(RIM_E, [0.6, -0.4]), Math.min(1, st.canthotomy)); o.push(`<path d="M${F(add(LC_A, [-0.3, -1.2]))}L${F(e)}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); A.canthotomy = lerpP(LC_A, RIM_E, 0.5); }
    if (st.cantholysis && !fixT) { const c = lerpP(TUB, LC_A, 0.25), n = unit([-(LC_A[1] - TUB[1]), LC_A[0] - TUB[0]]); o.push(`<path d="M${F(add(c, n, -1.0))}L${F(add(c, n, 1.0))}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); A.cantholysis = c; }
    if ((st.strip || 0) > 0 && !fixT && S.shortMm > 0 && st.shortMark) { const p = lidTrack.off(lidEnd - S.shortMm, sgn * 0.8); o.push(`<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="0.3" fill="#d23c3c"/>`); }
    let fixPt = null;
    if (fixT || st.stripFix) { const f = Math.min(1, st.stripFix || 0), pEnd = endP, P = lerpP(pEnd, add(TUB, WALL, -0.25), f);   // the strip is pulled to the periosteum at the tubercle, 4-0 vicryl ×1 (template)
      const ST = track([pEnd, lerpP(pEnd, P, 0.5), P]); o.push(`<path d="${ST.band(0, ST.L, -0.65, 0.65)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.9" ${NS}/>`);
      o.push(`<path d="M${F(add(P, WALL, -0.6))}L${F(add(P, WALL, 0.9))}" stroke="#2463eb" stroke-width="2.2" stroke-linecap="round" ${NS}/><circle cx="${P[0].toFixed(3)}" cy="${P[1].toFixed(3)}" r="0.28" fill="#2463eb"/>`);
      fixPt = P; A.stripFix = P; A.stripBand = ST.off(ST.L * 0.5, 0); }
    if (st.canthopexy) { const P = add(TUB, WALL, -0.3), e = lerpP(lidTrack.off(lidTrack.L - 1.2, sgn * 0.85), P, Math.min(1, st.canthopexy));
      o.push(`<path d="M${F(lidTrack.off(lidTrack.L - 1.2, sgn * 0.85))}L${F(e)}" stroke="#2463eb" stroke-width="2" ${NS}/><circle cx="${P[0].toFixed(3)}" cy="${P[1].toFixed(3)}" r="0.3" fill="#2463eb"/>`); A.canthopexy = P; fixPt = fixPt || P; }
    if (dist > 0) { const P = T.P; o.push(`<path d="M${F([0, P0[1]])}L${F([0, P[1]])}" stroke="#0e7c6b" stroke-width="1.6" stroke-dasharray="4 3" ${NS}/><path d="M${F([-0.6, P[1] - 0.3])}L${F([0, P[1] - 1.6])}L${F([0.6, P[1] - 0.3])}" fill="none" stroke="#0e7c6b" stroke-width="2" ${NS}/>`); A.distract = [0.6, (P0[1] + P[1]) / 2]; }
    A.state = { D: S.D, Dnow: D, slack: S.slack, shortMm: S.shortMm, fixPt };
    const defs = '';
    return { svg: defs + o.join(''), A, lidPts: lidTrack.pts, inner, tent, state: S };
  }
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  return { draw, state, tent, RIM_E, TUB, LC_A, MC_A, WALL, R0, L_TENDON, SLACK_N, SLACK_LAX, SHORT_DEF, marginAt, dFor };
})();
if (typeof module !== 'undefined') module.exports = CANTHUS;
