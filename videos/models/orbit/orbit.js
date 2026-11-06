// ============================================================================
// Orbit model — right eye. Loaded after the eyelid model (uses LID, CORONAL, LOWER, LOWERC, CANTHUS). Numbers and sources: orbit/CARD.md.
// 1. ORBIT.axial: horizontal (axial) section through the lateral canthus and the optic nerve, seen from below like an axial CT: anterior up,
//    the patient's right (temporal side of the right eye) on the left. Same axes as eyelid/canthus.js: x = coronal x (temporal −, nasal +,
//    pupil centre 0), y = sagittal x (anterior −, globe centre 0). Retrobulbar haematoma, proptosis, optic-nerve slack and globe tenting,
//    the lower lid + lateral canthal tendon as the "front door", hemostat crush, lateral canthotomy and cantholysis.
// 2. ORBIT.front: the front (coronal) view of the lateral canthus (CORONAL with the lower lid) with an optional window through skin and
//    orbicularis onto the lateral canthal tendon: superior and inferior crus from the tarsal plates join into the common tendon that inserts
//    on Whitnall's tubercle inside the lateral rim. Shares x with the axial view (lateral canthus, rim, tubercle).
// ============================================================================
const ORBIT = (() => {
  const { add, sub, unit, hyp, lerp, ss, poly, F, NS, gp, spline, track, C } = LID;
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const c01 = v => Math.max(0, Math.min(1, v || 0));
  const D2R = Math.PI / 180, R = 12;                                            // globe radius (eyelid/lower.js)
  const RIM_E = CANTHUS.RIM_E, TUB = CANTHUS.TUB, WALL = CANTHUS.WALL, LC_A = CANTHUS.LC_A, MC_A = CANTHUS.MC_A;
  const G2A = 26.3;                                                             // posterior globe → orbital apex (Oester 2012, normal-vision group, uninvolved eye)
  const OAPEX = [10, R + G2A];                                                  // apex x: optic canal medial to the visual axis (schematic)
  const PROP_OCS = 4.5;                                                         // involved − uninvolved globe-to-apex distance (Oester 2012, vision-loss group)
  const ON_TH = Math.asin(3 / R), ON_DIR = [Math.sin(ON_TH), Math.cos(ON_TH)];  // optic nerve leaves the globe 3 mm nasal to the posterior pole (schematic)
  const ON_R = 1.75;                                                            // optic nerve with sheath, diameter 3.5 mm [待核對出處]
  const ON_SLACK = 2.0;                                                         // slack of the intraorbital optic nerve at rest (schematic)
  const ON_EXIT0 = [R * ON_DIR[0], R * ON_DIR[1]], L_ON = hyp(sub(OAPEX, ON_EXIT0)) + ON_SLACK;
  const MUS_T = 3.6;                                                            // rectus belly thickness (schematic)
  const PULL_MAX = 4;                                                           // released lower lid pulled 4 mm off the globe (schematic)

  // ---- bone: lateral wall (first 26 mm = eyelid/canthus.js), greater wing to the apex (schematic); medial wall (lamina papyracea, schematic)
  const LAT_IN = spline([RIM_E, add(RIM_E, WALL, 2.5), [RIM_E[0] + 2.4, RIM_E[1] + 6.0], [RIM_E[0] + 5.6, RIM_E[1] + 11], [RIM_E[0] + 9.5, RIM_E[1] + 16],
    [RIM_E[0] + 14, RIM_E[1] + 22], [2.5, 31.5], OAPEX], 0.08);
  const LAT_OUT = spline([[12.6, 41.8], [4.3, 34.9], [RIM_E[0] + 15.5, RIM_E[1] + 24], [RIM_E[0] + 10.6, RIM_E[1] + 17.6], [RIM_E[0] + 6.2, RIM_E[1] + 12.6],
    [RIM_E[0] - 2.0, RIM_E[1] + 9.0], [RIM_E[0] - 5.4, RIM_E[1] + 5.5], [RIM_E[0] - 5.8, RIM_E[1] + 2.0], [RIM_E[0] - 4.2, RIM_E[1] - 0.6], [RIM_E[0] - 1.6, RIM_E[1] - 0.8], RIM_E], 0.08);
  const MED_IN = spline([OAPEX, [14.5, 30], [16.8, 19], [17.6, 8], [17.6, -1.5], [16.6, -4.4]], 0.08);
  const LIP = MED_IN[MED_IN.length - 1];                                        // posterior lacrimal crest (schematic)
  const wallX = (W, y) => { for (let i = 1; i < W.length; i++) { const a = W[i - 1], b = W[i]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return null; };
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += hyp(sub(P[i], P[i - 1])); return L; };

  // ---- globe: the sagittal profile turned into this plane (symmetric about the visual axis), shifted forward by the proptosis
  const globeCentre = prop => [0, -prop];
  // optic nerve: fixed length L_ON from its globe exit to the apex. When the globe moves forward past the slack the nerve straightens and
  // pulls the posterior sclera into a cone (globe tenting, Dalley 1989): tent apex T = centre + (R + e)·ON_DIR with |OAPEX − T| = L_ON
  function nerve(prop) {
    const G = globeCentre(prop), exit = add(G, ON_DIR, R), chord = hyp(sub(OAPEX, exit));
    if (chord <= L_ON) return { G, e: 0, T: exit, chord, slack: L_ON - chord, angle: 180 };
    let a = 0, b = 10; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; hyp(sub(OAPEX, add(G, ON_DIR, R + m))) > L_ON ? a = m : b = m; }
    const e = (a + b) / 2, T = add(G, ON_DIR, R + e);
    return { G, e, T, chord: hyp(sub(OAPEX, T)), slack: 0, angle: 2 * Math.asin(R / (R + e)) / D2R };   // posterior globe angle at the junction
  }
  function globeOutline(prop) {
    const N = nerve(prop), G = N.G, pts = [], al = N.e > 0 ? Math.acos(R / (R + N.e)) : 0;
    for (let a = 0; a < 360; a += 0.5) { const p = gp(a * D2R), q = [p[1] + G[0], p[0] + G[1]];
      const ang = Math.atan2(q[0] - G[0], q[1] - G[1]) - ON_TH;                 // angle from the nerve direction (posterior side)
      if (al > 0 && Math.abs(ang) < al) { if (!pts.tent) { pts.push(N.T); pts.tent = true; } continue; }
      pts.push(q); }
    return { pts, N };
  }
  // ---- recti: along the globe from the insertion, then along the wall to the annulus at the apex (thickness schematic)
  function rectus(sg, prop) {
    const G = globeCentre(prop), c = [];
    for (const a of [118, 108, 98, 88, 80]) c.push([sg * (R + 0.6) * Math.sin(a * D2R) + G[0], (R + 0.6) * Math.cos(a * D2R) + G[1]]);
    const back = sg < 0 ? [[-13.6, 9 - prop * 0.25], [-8.4, 17], [-0.3, 26], [7.5, 33.0], add(OAPEX, [-1.2, -1.6])]
                        : [[13.6, 9 - prop * 0.25], [14.3, 17], [13.0, 26], [10.4, 33.2], add(OAPEX, [0.2, -1.6])];
    const T = track(spline([...c, ...back], 0.1)), th = q => { const k = q / T.L; return k < 0.12 ? lerp(0.5, MUS_T, ss(0, 0.12, k)) : k > 0.8 ? lerp(MUS_T, 1.0, ss(0.8, 1, k)) : MUS_T; };
    return { T, th, path: T.band(0, T.L, q => -th(q) / 2, q => th(q) / 2), mid: T.off(T.L * 0.45, 0) };
  }
  // ---- retrobulbar haematoma (intraconal, around the nerve): an irregular blob that grows with `heme` (0–1), clipped to the muscle cone
  function haematoma(heme, prop) {
    const s = Math.sqrt(c01(heme)), G = globeCentre(prop), Hc = [3.2, 19.5 - 0.6 * prop], pts = [];
    for (let a = 0; a < 360; a += 6) { const t = a * D2R, w = 1 + 0.12 * Math.sin(3 * t + 0.7) + 0.08 * Math.sin(5 * t + 2.1);
      let p = [Hc[0] + 8.2 * s * w * Math.sin(t), Hc[1] + 8.6 * s * w * Math.cos(t)];
      const d = hyp(sub(p, G)); if (d < R + 0.35) p = add(G, unit(sub(p, G)), R + 0.35);   // haematoma sits behind the globe, not in it
      pts.push(p); }
    return pts;
  }
  // ---- the front door: lower lid margin (projected on this plane, eyelid/canthus.js) from the medial canthus over the globe to the
  // commissure, then the lateral canthal tendon to the tubercle. With proptosis the lid has to cover a longer route (shortest path):
  // the extra length is the stretch (tension). Released (inferior cantholysis) the lid lies on the globe and its free end springs back.
  // the lids are drawn as a projection hugging the front of the globe in this plane (schematic, like eyelid/canthus.js)
  const FRONT = (() => { const f = []; for (let a = 95; a <= 265; a += 0.5) { const p = gp(a * D2R); f.push([p[1], p[0]]); } return f.sort((u, v) => v[0] - u[0]); })();
  const frontY = x => { for (let i = 1; i < FRONT.length; i++) { const a = FRONT[i - 1], b = FRONT[i]; if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return null; };
  const surf = prop => { const s = []; for (let x = 9.6; x >= -9.6; x -= 0.4) s.push([x, frontY(x) - 0.1 - prop]); return s; };
  // taut lid over the globe = the anterior convex hull of the anchors and the globe-front points (points ordered nasal → temporal)
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const hullFront = P => { const h = []; for (const p of P) { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) >= 0) h.pop(); h.push(p); } return h; };
  function route(prop) {
    const S = surf(prop), pts = hullFront([MC_A, ...S, LC_A]);
    return { pts, len: polyLen(pts), S };
  }
  const REST = route(0), REST_LEN = REST.len;
  function releasedLid(prop, pull) {
    // free lid: same material length minus 1.5 mm spring-back (schematic), laid taut from the medial canthus over the globe front
    const S = surf(prop), M = REST_LEN - 1.5, D = PULL_MAX * c01(pull);
    if (D > 0) {   // pulled forward at x = −4: taut from the medial canthus to the pulled point, the rest of the free lid hangs on laterally (schematic)
      const P = add(S.reduce((b, p) => Math.abs(p[0] + 4) < Math.abs(b[0] + 4) ? p : b, S[0]), [0, -D]);
      const head = hullFront([MC_A, ...S.filter(p => p[0] > P[0]), P]), left = M - polyLen(head), dir = unit(sub(add(LC_A, [0, -D - 1.5]), P));
      const out = [...head, add(P, dir, Math.max(0.5, left))]; out.pulled = P; return out;
    }
    const H = hullFront([MC_A, ...S]), pts = [H[0]]; let L = 0;
    for (let i = 1; i < H.length; i++) { const d = hyp(sub(H[i], H[i - 1])); if (L + d > M) { pts.push(lerpP(H[i - 1], H[i], (M - L) / d)); return pts; } L += d; pts.push(H[i]); }
    const n = pts.length, dir = unit(sub(pts[n - 1], pts[n - 2])); pts.push(add(pts[n - 1], dir, M - L));   // longer than the globe front: runs on straight
    return pts;
  }

  function axial(opt = {}) {
    const st = opt.state || {}, id = opt.id || 'oax', o = [], A = {};
    const heme = c01(st.heme), prop = st.prop ?? PROP_OCS * heme;
    const cut = c01(st.canthotomy), inf = c01(st.infLysis), sup = c01(st.supLysis), released = inf >= 1;
    o.push(`<rect x="-70" y="-50" width="140" height="110" fill="#ffffff"/>`);
    // beyond the walls: ethmoid air cells (medial), temporalis / temporal fossa (lateral), cranial cavity behind the apex (all schematic)
    o.push(`<path d="${poly([...MED_IN, [17.4, -8.4], [22, -10.2], [40, -10.2], [40, 60], [OAPEX[0], 60]])}" fill="${C.cranial}"/>`);
    for (const [y0, y1] of [[-3, 7], [7, 16], [16, 24]]) o.push(`<path d="M${F([wallX(MED_IN, y1) + 0.6, y1])}L${F([30, y1])}" stroke="#c9cfd8" stroke-width="0.9" ${NS}/>`);
    o.push(`<path d="${poly([[RIM_E[0] - 5.8, RIM_E[1] + 2], [RIM_E[0] - 2, RIM_E[1] + 9], [RIM_E[0] + 6.2, RIM_E[1] + 12.6], [RIM_E[0] + 15.5, RIM_E[1] + 24], [4.3, 34.9], [-70, 60], [-70, RIM_E[1] + 2]])}" fill="#d9b48f"/>`);
    o.push(`<path d="${poly([[4.3, 34.9], [12.6, 41.8], [OAPEX[0], 60], [-70, 60]])}" fill="${C.cranial}"/>`);
    // orbital fat inside the walls and behind the door
    const door0 = REST.pts;
    o.push(`<path d="${poly([...door0, TUB, ...LAT_IN.filter(p => p[1] > TUB[1]), ...MED_IN.slice(1), [LIP[0] - 0.4, LIP[1] + 0.1]])}" fill="${C.ofat}"/>`);
    // bone: lateral rim + wall, medial wall (thin), periosteum on the orbital side
    o.push(`<path d="${poly([...LAT_IN, ...LAT_OUT])}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    const MW = track(MED_IN); o.push(`<path d="${MW.band(0, MW.L, 0, -0.7)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1" ${NS}/>`);
    o.push(`<path d="${poly([LIP, [17.4, -8.4], [22, -10.2], [22.6, -7.6], [18.4, -3.8], add(LIP, [0.7, 0.2])])}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1" ${NS}/>`);
    const LW = track(LAT_IN); o.push(`<path d="${LW.band(0, LW.L, 0, -0.5)}" fill="${C.peri}" stroke="${C.periS}" stroke-width="0.6" ${NS}/>`);
    o.push(`<circle cx="${TUB[0].toFixed(3)}" cy="${TUB[1].toFixed(3)}" r="0.45" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1" ${NS}/>`);
    o.push(`<path d="M${F(add(OAPEX, [-1.6, 1.6]))}L${F(add(OAPEX, [-0.3, 9]))}M${F(add(OAPEX, [1.6, 0.2]))}L${F(add(OAPEX, [2.9, 8]))}" stroke="${C.boneS}" stroke-width="1" ${NS}/>`);   // optic canal (schematic)
    A.rim = add(RIM_E, [-1.6, 1.2]); A.tubercle = TUB; A.latWall = LW.off(LW.L * 0.62, 1.2); A.medWall = MW.off(MW.L * 0.45, -1.4); A.apex = OAPEX; A.ethmoid = [20.6, 6]; A.temporalis = [RIM_E[0] - 6, RIM_E[1] + 14];
    // haematoma (behind the globe, inside the muscle cone), recti, globe, optic nerve
    const LR = rectus(-1, prop), MR = rectus(1, prop), cone = [...LR.T.line(0, LR.T.L, 0), ...MR.T.line(0, MR.T.L, 0).reverse()];
    if (heme > 0) { const H = haematoma(heme, prop);
      o.push(`<clipPath id="${id}-cone"><path d="${poly(cone)}"/></clipPath><path d="${poly(H)}" clip-path="url(#${id}-cone)" fill="#8e2433" opacity="${(0.55 + 0.35 * heme).toFixed(3)}" stroke="#6b1622" stroke-width="0.8" ${NS}/>`);
      A.heme = [3.2, 20.5 - 0.6 * prop]; }
    o.push(`<path d="${LR.path}" fill="${C.mus}"/><path d="${MR.path}" fill="${C.mus}"/>`); A.lr = LR.mid; A.mr = MR.mid;
    const GO = globeOutline(prop), N = GO.N, G = N.G;
    // optic nerve: straight when taut; with slack a gentle bow (half sine, amplitude from the extra length)
    const ONpts = (() => { const a = N.T, b = OAPEX, c = hyp(sub(b, a)), amp = N.slack > 0 ? (2 / Math.PI) * Math.sqrt(c * N.slack) : 0, n = unit([-(b[1] - a[1]), b[0] - a[0]]), P = [];
      for (let i = 0; i <= 40; i++) { const t = i / 40; P.push(add(lerpP(a, b, t), n, -amp * Math.sin(Math.PI * t))); } return P; })();
    const ONT = track(ONpts), CAN = track([OAPEX, add(OAPEX, [0.65, 3.7]), add(OAPEX, [1.3, 7.4])]);   // the nerve continues into the optic canal
    o.push(`<path d="${CAN.band(0, CAN.L, -ON_R * 0.85, ON_R * 0.85)}" fill="#f3e7c3" stroke="#b9a46a" stroke-width="0.9" ${NS}/>`);
    o.push(`<path d="${ONT.band(0, ONT.L, -ON_R, ON_R)}" fill="#f3e7c3" stroke="#b9a46a" stroke-width="0.9" ${NS}/><path d="${poly(ONpts, false)}" fill="none" stroke="#d9c58e" stroke-width="0.8" stroke-dasharray="3 3" ${NS}/>`);
    A.on = ONT.off(ONT.L * 0.55, 0);
    o.push(`<path d="${poly(GO.pts)}" fill="${C.sclera}" stroke="${C.scleraS}" stroke-width="1.2" ${NS}/>`);
    const corn = []; for (let a = 140; a <= 220; a += 0.5) { const p = gp(a * D2R); corn.push([p[1] + G[0], p[0] + G[1]]); }
    o.push(`<path d="${poly(corn, false)}" fill="none" stroke="${C.corneaS}" stroke-width="2.2" ${NS}/><path d="M${F([-5.9, -9.9 + G[1]])}L${F([5.9, -9.9 + G[1]])}" stroke="${C.iris}" stroke-width="2.4" ${NS}/><ellipse cx="0" cy="${(-7.9 + G[1]).toFixed(3)}" rx="4.6" ry="2.0" fill="${C.lens}" stroke="${C.lensS}" stroke-width="1" ${NS}/>`);
    A.globe = [-3, 2 + G[1]]; A.cornea = [3.5, -13.4 + G[1]]; A.tent = N.T; A.state = { prop, N, tension: 0 };
    if (N.e > 0 && st.tentShow) {   // posterior globe angle drawn at the junction (Dalley 1989: < 130° tenting, < 120° with acute proptosis = emergency)
      const al = Math.acos(R / (R + N.e)), u = ON_DIR, rot = (v, t) => [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t)];
      const t1 = add(G, rot(u, al), R), t2 = add(G, rot(u, -al), R), T = N.T;
      o.push(`<path d="M${F(add(T, unit(sub(t1, T)), 9))}L${F(T)}L${F(add(T, unit(sub(t2, T)), 9))}" fill="none" stroke="#0e7c6b" stroke-width="2" stroke-dasharray="5 3" ${NS}/>`);
      A.tentArm = add(T, unit(sub(t1, T)), 6); }
    // the door: lower lid (projected) + lateral canthal tendon; stretched with intact canthus, free after inferior cantholysis
    const R0 = route(prop), lidPts = released ? releasedLid(prop, st.pull) : R0.pts, tension = released ? 0 : Math.max(0, R0.len - REST_LEN);
    A.state.tension = tension; A.state.lidPts = lidPts;
    const LT = track(spline(lidPts.filter((p, i, a) => i === 0 || hyp(sub(p, a[i - 1])) > 0.05), 0.08)), sg = (() => { const n = unit(sub(LT.off(LT.L / 2, 1), LT.off(LT.L / 2, 0))); return n[1] < 0 ? 1 : -1; })();
    const LID_T = 2.36;
    o.push(`<path d="${LT.band(0, LT.L, 0, sg * LID_T)}" fill="${C.orb}" opacity="0.92"/><path d="${LT.band(0, LT.L, sg * (LID_T - 0.13), sg * LID_T)}" fill="${C.skin}"/>`);
    o.push(`<path d="${LT.band(0, LT.L, sg * 0.16, sg * 1.52)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.8" ${NS}/><path d="${LT.band(0, LT.L, 0, sg * 0.16)}" fill="${C.conj}"/>`);
    A.lid = LT.off(LT.L * 0.4, sg * 1.2); A.lidLat = LT.off(LT.L * 0.88, sg * 1.2); A.lidEnd = LT.off(LT.L, sg * 0.8);
    // tendon (commissure → tubercle): intact; after inferior cantholysis only the superior crus (above this plane) still holds — drawn faded;
    // after superior cantholysis only the stump on the tubercle remains
    const TT = track(spline([LC_A, lerpP(LC_A, TUB, 0.5), TUB], 0.05));
    if (sup < 1) o.push(`<path d="${TT.band(0, TT.L, -0.6, 0.6)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.8" opacity="${released ? 0.45 : 1}" ${NS}/>`);
    else o.push(`<path d="${TT.band(TT.L * 0.7, TT.L, -0.6, 0.6)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.8" ${NS}/>`);
    A.tendon = TT.off(TT.L * 0.5, 0);
    if (tension > 0.3 && !st.noTension) {   // tension arrows along the stretched lid (pulled toward both canthi)
      const k = Math.min(1, tension / 3), a1 = LT.off(LT.L * 0.2, sg * 3.6), a2 = LT.off(LT.L * 0.8, sg * 3.6), arrow = (p, q) => { const d = unit(sub(q, p)), n = [-d[1], d[0]];
        return `<path d="M${F(p)}L${F(q)}M${F(add(add(q, d, -1.1), n, 0.7))}L${F(q)}L${F(add(add(q, d, -1.1), n, -0.7))}" fill="none" stroke="#d23c3c" stroke-width="${(1.4 + 1.2 * k).toFixed(2)}" stroke-linecap="round" ${NS}/>`; };
      o.push(arrow(a1, add(a1, unit(sub(MC_A, a1)), 3)) + arrow(a2, add(a2, unit(sub(LC_A, a2)), 3))); A.tension = LT.off(LT.L * 0.5, sg * 1.6); }
    // skin lateral to the commissure over the rim, septum (eyelid/canthus.js)
    const RT = track(REST.pts), sgR = (() => { const n = unit(sub(RT.off(RT.L / 2, 1), RT.off(RT.L / 2, 0))); return n[1] < 0 ? 1 : -1; })(), sk0 = RT.off(RT.L, sgR * LID_T);
    const SKT = track(spline([sk0, [sk0[0] - 2.6, sk0[1] + 0.2], [RIM_E[0] - 2.5, RIM_E[1] - 3.4], [RIM_E[0] - 6.8, RIM_E[1] - 2.6], [RIM_E[0] - 9.5, RIM_E[1] + 1]], 0.08));
    const gap = cut ? lerp(0, 1.4, cut) : 0;   // canthotomy: the skin and orbicularis between the commissure and the rim are cut through
    o.push(`<path d="${SKT.band(gap, SKT.L, -0.3, -2.0)}" fill="${C.orb}"/><path d="${SKT.band(gap, SKT.L, 0, -0.35)}" fill="${C.skin}" stroke="${C.skinS}" stroke-width="0.8" ${NS}/>`);
    const sept = spline([add(RIM_E, [-0.6, -0.3]), [RIM_E[0] + 1.2, RIM_E[1] - 2.4], add(LC_A, [-1.2, -0.9])], 0.05);
    o.push(`<path d="${poly(sept, false)}" fill="none" stroke="${C.septS}" stroke-width="1.6" ${NS}/>`);
    A.skin = SKT.off(SKT.L * 0.45, 0); A.septum = sept[Math.floor(sept.length / 2)]; A.lc = LC_A;
    // surgical overlays
    if (st.clamp) { const k = c01(st.clamp); o.push(`<path d="M${F(add(LC_A, [-0.3, -1.2]))}L${F(add(RIM_E, [0.6, -0.4]))}" stroke="#6f6a72" stroke-width="5" stroke-linecap="round" opacity="${(0.45 * k).toFixed(3)}" ${NS}/>`); A.clamp = lerpP(LC_A, RIM_E, 0.5); }
    if (cut) { const e = lerpP(LC_A, add(RIM_E, [0.6, -0.4]), cut); o.push(`<path d="M${F(add(LC_A, [-0.3, -1.2]))}L${F(e)}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); A.canthotomy = lerpP(LC_A, RIM_E, 0.5); }
    for (const [k, f] of [[inf, 0.25], [sup, 0.42]]) if (k > 0) { const c = lerpP(TUB, LC_A, f), n = unit([-(LC_A[1] - TUB[1]), LC_A[0] - TUB[0]]);
      o.push(`<path d="M${F(add(c, n, -1.0 * k))}L${F(add(c, n, 1.0 * k))}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); }
    A.cantholysis = lerpP(TUB, LC_A, 0.25);
    if (released && c01(st.pull) > 0) { const P = lidPts.pulled; A.pull = P; o.push(`<path d="M${F([P[0], P[1] + PULL_MAX * c01(st.pull)])}L${F(P)}" stroke="#0e7c6b" stroke-width="1.6" stroke-dasharray="4 3" ${NS}/>`); }
    return { svg: o.join(''), A, N, prop, tension, lidPts, onPts: ONpts, haem: heme > 0 ? haematoma(heme, prop) : [], cone, LR, MR };
  }

  // ---- front view: CORONAL with the lower lid, plus the tendon window
  const LAT_RIM_X = LOWERC.LAT_RIM_X;
  function front(opt = {}) {
    const st = opt.state || {}, id = opt.id || 'ofr', lower = Object.assign({}, opt.lower || {}, { canthotomy: 0, cantholysis: 0 });
    const cor = CORONAL.draw({ variant: opt.variant, state: opt.upper || {}, lower, id, section: false }), Uy = cor.Uy, Ly = CORONAL.Ly, LC = CORONAL.LC, A = {}, o = [];
    const lcY = LC[1], TUBF = cor.tubercle || [LAT_RIM_X + 0.55, lcY + 0.3], win = c01(st.window);
    // tendon geometry in the front view: the superior and inferior crus run from the lateral ends of the tarsal plates and join just before
    // the tubercle inside the rim (Gioia 1987; tubercle x shared with the axial view); the canthotomy runs between them (schematic)
    const xT = LC[0] + 1.0, J = [(cor.tubercle || [LAT_RIM_X + 0.55])[0] + 1.0, lcY + 0.25];
    const supO = [xT, Uy(xT) - 0.8], infO = [xT, Ly(xT) + 0.6];
    const dropI = c01(st.infLysis) * 0.9, dropS = c01(st.supLysis) * 0.9;   // after cutting, the lid-side stump retracts toward its lid (schematic)
    if (win > 0) {
      const X0 = LC[0] + 2.6, Xr = LAT_RIM_X - 1.8, top = lcY - 4.8, bot = lcY + 4.8, XS = []; for (let x = X0; x >= LC[0] - 1e-9; x -= 0.2) XS.push(x);
      const W = [[X0, Uy(X0) - 0.35], [X0, top], [Xr, top], [Xr, bot], [X0, bot], [X0, Ly(X0) + 0.35], ...XS.map(x => [x, Ly(x) + 0.35]), [LC[0] - 0.25, lcY], ...XS.slice().reverse().map(x => [x, Uy(x) - 0.35])];
      const rim = (cor.rimLine || []).filter(p => p[0] < -12 && p[1] > top - 1 && p[1] < bot + 1).sort((a, b) => a[1] - b[1]);
      o.push(`<g opacity="${win.toFixed(3)}"><clipPath id="${id}-tw"><path d="${poly(W)}"/></clipPath><g clip-path="url(#${id}-tw)">`);
      o.push(`<rect x="${Xr - 1}" y="${top - 1}" width="${X0 - Xr + 2}" height="${bot - top + 2}" fill="${C.fatL}"/>`);
      if (rim.length > 1) o.push(`<path d="${poly([...rim, [Xr - 2, bot + 2], [Xr - 2, top - 2]])}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.4" ${NS}/>`);
      // tarsal plates (lateral ends, heights tapering, schematic)
      const tarU = [], tarL = []; for (let x = X0 + 0.3; x >= xT - 0.4; x -= 0.2) { const k = ss(xT - 0.4, X0, x); tarU.push([x, Uy(x) - 0.2]); tarL.push([x, Ly(x) + 0.2]); }
      const topU = tarU.map(([x, y]) => [x, y - lerp(1.2, 3.2, ss(xT - 0.4, X0 + 0.3, x))]).reverse(), botL = tarL.map(([x, y]) => [x, y + lerp(1.0, 2.4, ss(xT - 0.4, X0 + 0.3, x))]).reverse();
      o.push(`<path d="${poly([...tarU, ...topU])}" fill="#eadbb2" stroke="${C.tarS}" stroke-width="1.2" ${NS}/><path d="${poly([...tarL, ...botL])}" fill="#eadbb2" stroke="${C.tarS}" stroke-width="1.2" ${NS}/>`);
      // crura and common tendon
      const band = (P, w, extra = '') => { const T = track(spline(P, 0.05)); return `<path d="${T.band(0, T.L, -w, w)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.9" ${extra} ${NS}/>`; };
      const cutAt = (a, b, f, gapK) => { const m = lerpP(a, b, f), d = unit(sub(b, a)); return [add(m, d, -0.4 * gapK), add(m, d, 0.4 * gapK)]; };
      const crus = (O, k, drop) => { if (k < 1) return band([O, lerpP(O, J, 0.5), J], 0.45);
        const [g1, g2] = cutAt(O, J, 0.62, 1), Od = add(O, unit(sub(O, J)), drop * 0.4); return band([Od, lerpP(Od, g1, 0.5), g1], 0.45) + band([g2, J], 0.45); };
      o.push(crus(supO, c01(st.supLysis), dropS) + crus(infO, c01(st.infLysis), dropI));
      // common tendon to the tubercle on the inner face of the rim (1.5 mm deep to the rim edge, Gioia 1987: seen obliquely from the front)
      o.push(band([J, lerpP(J, TUBF, 0.5), TUBF], 0.6));
      o.push(`<circle cx="${TUBF[0].toFixed(3)}" cy="${TUBF[1].toFixed(3)}" r="0.5" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
      const bh = lerpP(J, TUBF, 0.5);
      o.push(`</g><path d="${poly(W)}" fill="none" stroke="#9b3a47" stroke-width="1.4" ${NS}/></g>`);
      A.supCrus = lerpP(supO, J, 0.3); A.infCrus = lerpP(infO, J, 0.3); A.common = lerpP(J, bh, 0.5); A.tarsusU = [X0 - 0.4, Uy(X0 - 0.4) - 1.6]; A.tarsusL = [X0 - 0.4, Ly(X0 - 0.4) + 1.2];
      A.rimEdge = rim.length ? rim[Math.floor(rim.length * 0.75)] : [LAT_RIM_X, lcY + 3]; A.window = [Xr + 0.6, top + 0.8];
    }
    A.supCut = lerpP(supO, J, 0.62); A.infCut = lerpP(infO, J, 0.62); A.J = J; A.supO = supO; A.infO = infO; A.tubercle = TUBF; A.lc = LC;
    // scissors guides for the video: inferior crus — tips pointed down toward the chin; superior — pointed up (directions in mm space, y down)
    A.scInf = { tip: A.infCut, dir: unit([0.3, 1]) }; A.scSup = { tip: A.supCut, dir: unit([0.3, -1]) };   // bodies come in from the temporal side
    // skin-level overlays: hemostat crush line, canthotomy cut, cantholysis cut marks
    const ov = [], skinOp = 1 - win;   // the clamp mark and the canthotomy line are on the skin: hidden where the window is open
    if (st.clamp && skinOp > 0) ov.push(`<path d="M${F(LC)}L${F([LAT_RIM_X + 0.3, lcY])}" stroke="#6f6a72" stroke-width="7" stroke-linecap="round" opacity="${(0.42 * c01(st.clamp) * skinOp).toFixed(3)}" ${NS}/>`);
    if (st.canthotomy) { const x1 = lerp(LC[0], LAT_RIM_X + 0.4, c01(st.canthotomy)); if (skinOp > 0) ov.push(`<path d="M${F(LC)}L${F([x1, lcY])}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" opacity="${skinOp.toFixed(3)}" ${NS}/>`); A.canthotomy = [(LC[0] + x1) / 2, lcY]; }
    for (const [k, c, O] of [[c01(st.infLysis), A.infCut, infO], [c01(st.supLysis), A.supCut, supO]]) if (k > 0) { const d = unit(sub(J, O)), n = [-d[1], d[0]];
      ov.push(`<path d="M${F(add(c, n, -0.9 * k))}L${F(add(c, n, 0.9 * k))}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); }
    A.clamp = [(LC[0] + LAT_RIM_X) / 2, lcY];
    return { svg: cor.svg + o.join('') + ov.join(''), A, cor, J, supO, infO, TUBF };
  }

  return { axial, front, nerve, route, surf, releasedLid, haematoma, globeOutline, rectus, wallX, polyLen,
    R, G2A, OAPEX, PROP_OCS, ON_TH, ON_DIR, ON_R, L_ON, ON_SLACK, REST_LEN, LAT_IN, MED_IN, LAT_OUT, PULL_MAX, LAT_RIM_X };
})();
if (typeof module !== 'undefined') module.exports = ORBIT;
