// ============================================================================
// Lower eyelid, sagittal section — right eye, mid-pupil, the same section, globe and coordinates as lid.js
// (globe centre (0,0), anterior = −x, superior = −y, mm). Opt-in: LID.draw is not touched. LOWER.draw draws the upper lid
// with LID.draw (same section, same globe) and adds the lower lid, the inferior orbit and the inferior orbital rim on top.
// Lower-lid frame: s = distance from the lower lid margin along the globe (downward), u = depth from the posterior lid surface.
// Values and sources: CARD.md (「下眼瞼」). Template-specific surgical values are parameters (依院內常規／待刀後確認).
// ============================================================================
const LOWER = (() => {
  const { add, sub, unit, hyp, lerp, ss, poly, F, NS, spline, track, gp, hash, C } = LID;
  const D2R = Math.PI / 180, lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const bisect = (f, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; (f(a) > 0) === (f(m) > 0) ? a = m : b = m; } return (a + b) / 2; };
  const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1], co = Math.cos(a), si = Math.sin(a); return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; };
  const arclen = pts => { const s = [0]; for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + hyp(sub(pts[i], pts[i - 1]))); return s; };

  // ---------------------------------------------------------------- globe (same constants as lid.js: sclera R 12, cornea r 7.8, centre −5.3)
  const R = 12, CCX = -5.3, RC = 7.8, APEX_X = CCX - RC;               // corneal apex x = −13.1
  const corneaD = phi => { const dc = CCX * Math.cos(phi); return dc + Math.sqrt(dc * dc - CCX * CCX + RC * RC); };
  const PHI_LL = bisect(p => corneaD(p) - R, 100 * D2R, 175 * D2R);     // inferior limbus
  const PHI_IR = PHI_LL - 5.72 / R;                                       // inferior rectus insertion 5.72 mm behind the limbus (Kim 2024)
  const irTh = phi => (0.35 + 1.15 * ss(PHI_IR, PHI_IR - 24 * D2R, phi)) * ss(PHI_IR + 2.5 * D2R, PHI_IR - 1.5 * D2R, phi);
  const bulbTh = phi => 0.12 * ss(PHI_LL, PHI_LL - 3 * D2R, phi);
  const gapL = phi => 0.10 + bulbTh(phi) + irTh(phi);
  const toGlobe = p => { const ph = Math.atan2(p[1], p[0]); return hyp(p) - hyp(gp(ph)); };   // + = outside the globe surface
  // surface point at transverse distance rho from the visual axis (the globe is symmetric about it): used by the coronal and axial views
  const surfAt = rho => { const ph = bisect(p => gp(p)[1] - rho, 90.0001 * D2R, 180 * D2R); return gp(ph); };

  // ---------------------------------------------------------------- lower lid frame (as lid.js buildFrame, mirrored: s runs down the globe)
  const MARGIN_YL = 5.0;                                                  // lower margin 5 mm below the corneal light reflex (MRD2 = coronal Ly(0))
  const PHI_ML = bisect(p => gp(p)[1] - MARGIN_YL, 120 * D2R, 179 * D2R);
  function buildFrame(phi0, dir, sMax, gap) {
    const raw = [], phis = []; let s = 0, prev = null;
    for (let phi = phi0; ; phi += dir * 0.0012) { const p = gp(phi); if (prev) s += hyp(sub(p, prev)); if (s > sMax + 1.5) break; raw.push(p); phis.push(phi); prev = p; }
    const W = 40, pts = raw.map((_, i) => { let x = 0, y = 0, n = 0; for (let j = i - W; j <= i + W; j++) { const q = raw[Math.max(0, Math.min(raw.length - 1, j))]; x += q[0]; y += q[1]; n++; } return [x / n, y / n]; });
    for (let i = 0; i < 12; i++) pts[i] = lerpP(raw[i], pts[i], i / 12);
    const sArr = arclen(pts);
    const ns = pts.map((p, i) => { const t = unit(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])); let n = [-t[1], t[0]]; if (n[0] * p[0] + n[1] * p[1] < 0) n = [-n[0], -n[1]]; return n; });
    const find = q => { let a = 0, b = sArr.length - 1; while (b - a > 1) { const m = (a + b) >> 1; sArr[m] <= q ? a = m : b = m; } return [a, (q - sArr[a]) / ((sArr[b] - sArr[a]) || 1)]; };
    const at = (q, u) => { const [i, k] = find(Math.max(0, q)), j = Math.min(i + 1, pts.length - 1);
      return add(lerpP(pts[i], pts[j], k), unit(lerpP(ns[i], ns[j], k)), gap(lerp(phis[i], phis[j], k)) + u); };
    const nrm = q => { const [i, k] = find(q); return unit(lerpP(ns[i], ns[Math.min(i + 1, ns.length - 1)], k)); };
    const tan = q => unit(sub(at(q + 0.05, 0), at(Math.max(0, q - 0.05), 0)));
    const phiAt = q => { const [i, k] = find(q); return lerp(phis[i], phis[Math.min(i + 1, phis.length - 1)], k); };
    return { at, nrm, tan, phiAt };
  }
  const LF = buildFrame(PHI_ML, -1, 16, gapL);

  // ---------------------------------------------------------------- lower lid layout (mm). Asian values where a paper shows a difference (CARD.md)
  const S_TARL = 4.12, TAR_TH = 1.36, U_CONJ = 0.16, U_TARL = U_CONJ + TAR_TH;   // tarsus height 4.12, thickness 1.36 (Lim 2004, Asian cadavers)
  const U_ITM = 0.79, U_CPF = U_ITM + 0.42;          // retractor–conjunctiva complex 0.79, capsulopalpebral fascia 0.42 (Vasanthapuram 2020, UBM)
  // lengths are measured along the tissue: the muscle start along the posterior lid surface, the fusion along the CPF, the fornix along the
  // palpebral conjunctiva (the frame's s runs along the globe surface, so a layer further out is slightly longer)
  const arcU = (s0, s1, u) => { let L = 0, p = LF.at(s0, u); for (let s = s0 + 0.01; s <= s1 + 1e-9; s += 0.01) { const q = LF.at(s, u); L += hyp(sub(q, p)); p = q; } return L; };
  const sFor = (s0, len, u) => bisect(s => arcU(s0, s, u) - len, s0, s0 + len + 3);
  const S_ITM = sFor(S_TARL, 1.44, 0);               // inferior tarsal muscle starts 1.44 mm below the tarsus (Lim 2004)
  const S_FUSL = sFor(S_TARL, 2.38, U_CPF);          // septum joins the CPF 2.38 mm below the tarsus (Kakizaki 2006, Asian)
  const S_FORNIXL = sFor(0, 10.9, 0);                // lower fornix depth (Jutley 2016: 10.9 mm, similar in South Asians)
  const T_POT = 0.68, T_PSO = 0.89, T_SKIN = 0.13, T_PLANE = 0.03;   // pretarsal / preseptal orbicularis (Vasanthapuram 2020); skin schematic
  const U_SKINL = U_TARL + T_PLANE + T_POT + T_SKIN;
  const U_MCJ = 0.34, U_ORIF = 0.62, U_GREY = U_TARL + 0.12;           // as in the upper lid (schematic)
  const R_M = 0.5, U_RND = U_SKINL - R_M;
  const marginS = u => u < U_RND ? 0 : R_M - Math.sqrt(Math.max(0, R_M ** 2 - (u - U_RND) ** 2));   // rounded anterior margin
  const tarBot = s => s < S_TARL - 1.0 ? 1 : Math.sqrt(Math.max(0, 1 - ((s - (S_TARL - 1.0)) / 1.0) ** 2));
  // inferior orbital rim: most anterior point 7.8 mm behind the corneal apex (Kato 2025, East Asians 60–79 y; constant with age);
  // its height is set so that the septum from the fusion to the arcus (= height of the central fat pad above the rim) is 8.9 mm (Oh 2006)
  const X_RIM = APEX_X + 7.8, Y_RIM = 16.75;
  const FAT_FRONT_X = APEX_X + 2.4, CHEEK_X = APEX_X - 1.4;           // Kato 2025, 60–79 y: fat pad 2.4 mm behind the globe, cheek 1.4 mm in front
  const PERI = LID.PERI;
  const boneOut = spline([[45, Y_RIM - 7.6], [26, Y_RIM - 4.5], [14, Y_RIM - 2.2], [8, Y_RIM - 1.15], [2, Y_RIM - 0.85], [-3.0, Y_RIM - 1.2], [-4.55, Y_RIM - 0.85], [-5.15, Y_RIM - 0.2],
    [X_RIM, Y_RIM + 0.75], [-5.2, Y_RIM + 2.3], [-4.8, Y_RIM + 5], [-4.15, Y_RIM + 9], [-3.75, Y_RIM + 14], [-3.9, 45]], 0.08);
  const boneIn = spline([[-1.7, 45], [-1.9, Y_RIM + 14], [-2.2, Y_RIM + 9], [-2.6, Y_RIM + 5], [-2.3, Y_RIM + 2.1], [-0.5, Y_RIM + 0.45], [2, Y_RIM + 0.3], [8, Y_RIM + 0.0], [14, Y_RIM - 1.1], [26, Y_RIM - 3.4], [45, Y_RIM - 6.5]], 0.08);
  const PTL = track(boneOut.filter(p => p[0] < 40 && p[1] < Y_RIM + 8));   // periosteum (periorbita on the floor): floor → rim → anterior maxilla
  const qArcL = PTL.near([-4.75, Y_RIM - 0.8]), ARC_L = PTL.off(qArcL, PERI);   // arcus marginalis on the anterior-superior lip of the rim
  // inferior oblique in this plane, under the inferior rectus and inside the split of the CPF (Lockwood): schematic position
  const IO_C = [6.3, 14.1], IO_RX = 2.1, IO_RY = 0.8;
  const IR_TOP = 84 * D2R;                                                  // where the inferior rectus leaves the globe (mirror of lid.js SR 276°)

  // ---------------------------------------------------------------- states → deformation of the lower lid
  // entr (0–1): involutional entropion — the tarsus rotates about the posterior margin edge, the margin rolls in (80° at 1, schematic: the
  // lashes are stopped by the cornea); tie (0–1): the everting mattress sutures are tied — the inward rotation is undone and the margin turns out
  // by `over` degrees (default 6, schematic) about the posterior inferior tarsal border.
  const TH_EL = 80 * D2R;
  const cpfShift = st => 3.0 * (st.dehis || 0) * (1 - (st.tie || 0));   // retractors pulled off the tarsus by up to 3 mm (schematic); tying the sutures reattaches them
  function makeDeformL(st) {
    const entr = st.entr || 0, tie = st.tie || 0, over = st.over ?? 6;
    const a = TH_EL * entr * (1 - tie) - over * D2R * tie;
    const M0 = LF.at(0, 0), PB = LF.at(S_TARL, 0);
    const wP = s => 1 - ss(S_TARL, S_TARL + 2.4, s), wA = s => 1 - ss(S_TARL + 0.2, S_TARL + 3.0, s), wO = s => 1 - ss(S_TARL - 0.3, S_TARL + 0.8, s);
    const f = (p, s, kind) => { if (!a) return p; const w = a < 0 ? wO(s) : kind === 'post' ? wP(s) : wA(s); return w > 0 ? rot(p, a > 0 ? M0 : PB, a * w) : p; };
    f.angle = a; return f;
  }
  function dframe(def, kind) {
    const at = (s, u) => def(LF.at(s, u), s, kind);
    const tan = s => unit(sub(at(s + 0.05, 0), at(Math.max(0, s - 0.05), 0)));
    const band = (s0, s1, u0, u1, step = 0.05) => { const g = (o, q) => typeof o === 'function' ? o(q) : o, A = [], B = [];
      for (let q = s0; q < s1; q += step) { A.push(at(q, g(u0, q))); B.push(at(q, g(u1, q))); } A.push(at(s1, g(u0, s1))); B.push(at(s1, g(u1, s1)));
      return poly([...A, ...B.reverse()]); };
    return { at, tan, nrm: s => { const t = tan(s); return [-t[1], t[0]]; }, band };
  }
  // preseptal orbicularis override (0–1): a band of preseptal muscle rides up in front of the pretarsal muscle toward the margin
  const ovTop = ov => lerp(S_TARL + 0.6, 1.3, ov);
  const ovT = (s, ov) => ov ? 0.55 * ov * ss(ovTop(ov) - 0.4, ovTop(ov) + 0.6, s) * (1 - ss(S_TARL + 0.4, S_TARL + 1.6, s)) : 0;

  // septum: from the fusion with the CPF to the arcus marginalis, bowed forward over the central fat pad (fat front at FAT_FRONT_X);
  // hotzFat (partial fat removal) flattens the bow (1.4 mm, schematic)
  function septumL(DP, st) {
    const fl = 1.4 * (st.hotzFat || 0), FUS = DP.at(S_FUSL, U_CPF);
    const P = [FUS, add(FUS, [-0.55 + 0.2 * fl, 1.05]), [-9.9 + 0.6 * fl, 12.45], [FAT_FRONT_X - 0.09 + fl, 13.45], [-10.25 + 0.8 * fl, 14.75], [-8.5 + 0.4 * fl, 15.75], [-6.6, 16.15], ARC_L];
    return track(spline(P, 0.04));
  }
  // skin: margin and pretarsal skin from the deformed frame; below the tarsus it lies in front of the septum (skin + preseptal muscle +
  // a thin areolar layer); then the lid–cheek junction over the rim and the cheek (schematic, most anterior point at CHEEK_X)
  function skinPathL(DA, SEPT, st, DP, DEF) {
    const ov = st.override || 0, c = [];
    for (let u = U_MCJ; u < U_RND; u += 0.08) c.push(DA.at(0, u));
    for (let u = U_RND; u <= U_SKINL + 1e-9; u += 0.04) c.push(DA.at(marginS(u), u));
    for (let s = 0.55; s <= S_TARL - 0.5 + 1e-9; s += 0.05) c.push(DA.at(s, U_SKINL + ovT(s, ov)));
    // between the tarsus and the fusion the preseptal muscle lies on the CPF (+ septum); below the fusion it lies on the septum over the fat
    // the hollow between the tarsus and the bulge is filled with suborbicularis tissue (thickness schematic)
    const off = T_SKIN + T_PSO + 0.22, onCPF = [DA.at(S_TARL + 0.2, U_SKINL + 0.12)];
    const below = [0.38, 0.5, 0.6, 0.68, 0.76].map(f => SEPT.off(SEPT.L * f, off));   // + = in front of the septum
    const cheek = [[X_RIM - 4.15, Y_RIM + 0.5], [X_RIM - 5.9, Y_RIM + 3.6], [CHEEK_X + 0.45, Y_RIM + 7.6], [CHEEK_X, Y_RIM + 10.6], [CHEEK_X + 0.35, Y_RIM + 14], [-13.0, Y_RIM + 19], [-11.8, 45]];
    const tail = spline([c[c.length - 1], ...onCPF, ...below, ...cheek], 0.05);
    // smooth the joint below the tarsus (±0.6 mm) so the offset layers never fold over a sharp corner (e.g. the ridge when the lid turns in)
    const all = [...c, ...tail.slice(1)], i0 = c.length - 8, W = 12, sm = all.map((p, i) => { if (i < i0 || i > all.length - W - 2) return p; let x = 0, y = 0;
      for (let j = i - W; j <= i + W; j++) { const q = all[j]; x += q[0]; y += q[1]; } return lerpP(p, [x / (2 * W + 1), y / (2 * W + 1)], ss(i0, i0 + 8, i)); });
    return { pts: sm };
  }
  const WOUND = '#fbf1e6', RED = '#d23c3c', BLUE = '#2463eb';
  const COL = { ...C, cpf: '#f3eedf', cpfS: '#ad9d76', itm: '#dda6aa', itmF: '#c27b84', io: '#b9525f', scar: '#ffffff', steel: '#5d6b78', steelS: '#2f3a44', coag: '#7a4a2a' };

  function lobules(o, clipId, region, x0, x1, y0, y1, r0, r1, fill, stroke, sw) {
    o.push(`<clipPath id="${clipId}"><path d="${region}"/></clipPath><g clip-path="url(#${clipId})">`);
    const st = (r0 + r1) * 0.95; let j = 0;
    for (let y = y0; y < y1; y += st * 0.87, j++) for (let x = x0 + (j % 2) * st / 2, i = 0; x < x1; x += st, i++) {
      const r = lerp(r0, r1, hash(i + 31, j)), dx = (hash(j, i + 31) - 0.5) * st * 0.3, dy = (hash(i + 38, j) - 0.5) * st * 0.3;
      o.push(`<ellipse cx="${(x + dx).toFixed(2)}" cy="${(y + dy).toFixed(2)}" rx="${r.toFixed(2)}" ry="${(r * (0.82 + 0.3 * hash(i, j + 33))).toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${NS}/>`); }
    o.push(`</g>`);
  }
  // the parts of the drawing that other views and the checks need, built the same way as draw()
  function geom(st = {}) {
    const DEF = makeDeformL(st), DP = dframe(DEF, 'post'), DA = dframe(DEF, 'ant'), SEPT = septumL(DP, st), sk = skinPathL(DA, SEPT, st, DP, DEF), SK = track(sk.pts);
    const qLash = SK.near(DA.at(marginS(U_SKINL - 0.24), U_SKINL - 0.24));
    return { DEF, DP, DA, SEPT, sk, SK, qLash };
  }
  // lashes: [u at the anterior margin, length factor, spread]; the follicle runs into the lid at 75° to the margin surface, toward the tarsus
  // (Singh 2024), to `follicleDepth` mm along its axis (default 0.9, Elder 1997; Singh 2024 measured 1.8)
  const LASHES = [[U_SKINL - 0.36, 0.9, -0.25], [U_SKINL - 0.24, 1.0, 0.25], [U_SKINL - 0.12, 0.85, 0.0]];
  function follicleL(G, k, depth) {
    const [u] = LASHES[k], E = G.DA.at(marginS(u), u), t = G.DA.tan(0.15), n = G.DP.nrm(0.15), a = 15 * D2R;   // 90° − 75°
    const dir = unit(add([t[0] * Math.cos(a), t[1] * Math.cos(a)], n, -Math.sin(a)));                         // down the lid, tilted toward the tarsus
    return { E, dir, B: add(E, dir, depth) };
  }

  // ---------------------------------------------------------------- draw. opt: { state, id, upper (state for LID.draw; false = lower lid only), variant }
  // states (0–1 unless noted): entr, dehis (retractor disinsertion), override, scar (previous operation), subcil (subciliary incision, incH mm
  // below the lashes along the skin, template 2.5), plane (preseptal dissection), septOpen, retrOpen (retractors opened to the conjunctiva),
  // frac (tarsal fracture, fracS mm from the margin, to fracDepth × the tarsal thickness), mattress (everting suture), tie, over (degrees),
  // skinClose, hotzExc / hotzFat / hotzFix (Hotz), misdirected, metaplastic, needle (electrolysis), treated, follicleDepth (mm).
  function draw(opt = {}) {
    const st = opt.state || {}, pid = opt.id || 'low', o = [], A = {};
    if (opt.upper !== false) o.push(LID.draw({ variant: opt.variant || 'asian', state: opt.upper || {}, id: pid + 'u' }).svg);
    const G = geom(st), { DEF, DP, DA, SEPT, sk, SK, qLash } = G, Ltot = SK.L;
    const dg = cpfShift(st);
    const phF = LF.phiAt(S_FORNIXL);
    // 1 orbital soft tissue below the globe; its posterior boundary is the globe surface and the (deformed) posterior lid surface, so the
    // conjunctival sac stays clear when the lid turns in
    const bp = []; for (let a = Math.atan2(6, 45); a < phF; a += 0.01) bp.push(gp(a));
    for (let s = S_FORNIXL; s > 0.02; s -= 0.1) bp.push(DP.at(s, 0));
    const base = [...sk.pts, [-11.8, 45], [45, 45], [45, 6], ...bp, DP.at(0, 0)];
    o.push(`<path d="${poly(base)}" fill="${C.ofat}"/>`);
    lobules(o, pid + 'LOF', poly(base), -8, 45, 8, 30, 0.45, 0.75, 'none', C.ofatS, 0.7);
    // 2 bone: inferior orbital rim, floor, anterior maxilla; sinus (air) below the floor; periosteum with the arcus marginalis
    o.push(`<path d="${poly([...boneIn, [45, 45], [-1.7, 45]])}" fill="${C.cranial}"/>`);
    const bo = [...boneOut, ...boneIn];
    o.push(`<path d="${poly(bo)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    o.push(`<clipPath id="${pid}LBone"><path d="${poly(bo)}"/></clipPath><g clip-path="url(#${pid}LBone)">`);
    let bj = 0; for (let y = Y_RIM - 2; y < 40; y += 0.62, bj++) for (let x = -5.6 + (bj % 2) * 0.35, bi = 0; x < 3; x += 0.7, bi++) o.push(`<circle cx="${(x + (hash(bi + 50, bj) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.1 + 0.1 * hash(bj, bi + 50)).toFixed(2)}" fill="${C.boneD}"/>`);
    o.push(`</g><path d="${PTL.band(0, PTL.L, 0, PERI)}" fill="${C.peri}" stroke="${C.periS}" stroke-width="0.7" ${NS}/>`);
    A.rimL = [X_RIM - 0.2, Y_RIM + 0.75]; A.floor = [8, Y_RIM - 2.0]; A.arcusL = ARC_L; A.sinus = [6, Y_RIM + 4];
    // 3 inferior rectus (on the globe from its insertion, then straight back) and the inferior oblique in cross-section
    const irIn = [], irOut = [];
    for (let a = PHI_IR + 2.5 * D2R; a >= IR_TOP; a -= 0.004) { const p = gp(a); irIn.push(p); irOut.push(add(p, unit(p), irTh(a))); }
    const tp = irIn[irIn.length - 1], tq = irOut[irOut.length - 1];
    o.push(`<path d="${poly([...irIn, add(tp, [14, -1.2]), add(tq, [14, -0.9]), ...irOut.reverse()])}" fill="${C.mus}"/>`);
    for (const f of [0.33, 0.66]) { const l = []; for (let a = PHI_IR - 4 * D2R; a >= IR_TOP; a -= 0.01) { const p = gp(a); l.push(add(p, unit(p), irTh(a) * f)); } l.push(add(l[l.length - 1], [14, -1.0]));
      o.push(`<path d="${poly(l, false)}" fill="none" stroke="${C.musF}" stroke-width="1" ${NS}/>`); }
    A.ir = add(gp(97 * D2R), unit(gp(97 * D2R)), 0.75);
    o.push(`<ellipse cx="${IO_C[0]}" cy="${IO_C[1]}" rx="${IO_RX}" ry="${IO_RY}" transform="rotate(-6 ${IO_C[0]} ${IO_C[1]})" fill="${COL.io}" stroke="${C.orbB}" stroke-width="0.8" ${NS}/>`);
    for (let k = 0; k < 9; k++) o.push(`<circle cx="${(IO_C[0] - 1.5 + 0.38 * k).toFixed(2)}" cy="${(IO_C[1] + (hash(k, 71) - 0.5) * 0.9).toFixed(2)}" r="0.08" fill="${C.orbB}" opacity="0.55"/>`);
    A.io = IO_C;
    // 4 retractors: capsulopalpebral fascia (anterior layer, inserts on the inferior tarsal border) and inferior tarsal muscle (posterior layer,
    // from 1.44 mm below the tarsus); beyond the fornix the CPF runs back under the inferior rectus and splits around the inferior oblique
    const cpfTop = S_TARL + dg, itmTop = S_ITM + dg * 0.8;
    const cP0 = DP.at(S_FORNIXL + 0.6, (U_ITM + U_CPF) / 2), cP1 = LF.at(S_FORNIXL + 2.4, 0.42);
    const upLimb = spline([cP0, cP1, [2.6, 13.08], [IO_C[0], 13.05], [9.6, 13.05], [12.5, 12.9]], 0.05), loLimb = spline([cP1, [2.6, 13.75], [IO_C[0] - 0.5, 15.12], [8.7, 14.98], [10.6, 13.6], [12.5, 12.95]], 0.05);
    // 5 central fat pad: behind the septum, in front of the CPF, above the floor (top at the fusion; Asian lid: high fusion, Kakizaki 2006)
    // polygon order: septum fusion → arcus, floor front → back, CPF lower limb back → front, CPF front fornix → fusion
    const cpfFront = []; for (let s = S_FORNIXL + 0.6; s >= S_FUSL; s -= 0.1) cpfFront.push(DP.at(s, U_CPF));
    const floorTop = boneOut.filter(p => p[1] < Y_RIM - 0.3 && p[0] > ARC_L[0] && p[0] < 12.5).map(p => add(p, [0, -PERI])).reverse();
    const fatPoly = [...SEPT.pts, ...floorTop, ...loLimb.slice().reverse(), ...cpfFront];
    o.push(`<path d="${poly(fatPoly)}" fill="${C.fat}"/>`);
    lobules(o, pid + 'LFat', poly(fatPoly), -12, 13, 10, 17, 0.32, 0.55, C.fatL, C.fatS, 0.7);
    A.fatL = [-8.4, 13.6]; A.fatTop = SEPT.off(0, 0);
    if ((st.hotzFat || 0) > 0) { A.fatRemoved = [FAT_FRONT_X + 1.0, 12.9]; }
    for (const P of [upLimb, loLimb]) o.push(`<path d="${track(P).band(0, track(P).L, -0.21, 0.21)}" fill="${COL.cpf}" stroke="${COL.cpfS}" stroke-width="0.6" ${NS}/>`);
    o.push(`<path d="${DP.band(cpfTop, S_FORNIXL + 0.6, U_ITM, U_CPF)}" fill="${COL.cpf}" stroke="${COL.cpfS}" stroke-width="0.7" ${NS}/>`);
    o.push(`<path d="${DP.band(itmTop, S_FORNIXL + 0.2, U_CONJ, U_ITM)}" fill="${COL.itm}"/>`);
    { const r = []; for (let s = itmTop + 0.5; s <= S_FORNIXL - 0.3; s += 0.1) r.push(DP.at(s, (U_CONJ + U_ITM) / 2));
      if (r.length > 1) o.push(`<path d="${poly(r, false)}" fill="none" stroke="${COL.itmF}" stroke-width="0.8" ${NS}/>`); }
    if (dg > 0.05) { const gapP = []; for (let s = S_TARL; s <= cpfTop; s += 0.05) gapP.push(DP.at(s, U_CONJ)); for (let s = cpfTop; s >= S_TARL; s -= 0.05) gapP.push(DP.at(s, U_CPF));
      o.push(`<path d="${poly(gapP)}" fill="${C.ofat}" opacity="0.9"/>`); A.dehisGap = DP.at((S_TARL + cpfTop) / 2, (U_CONJ + U_CPF) / 2); }
    A.cpf = DP.at(S_FORNIXL - 2.2, (U_ITM + U_CPF) / 2); A.itm = DP.at(S_FORNIXL - 2.6, (U_CONJ + U_ITM) / 2); A.cpfEnd = DP.at(cpfTop, (U_ITM + U_CPF) / 2); A.lockwood = [IO_C[0] + 2.6, 13.05];
    // 6 anterior lid / cheek tissue between skin, bone, septum, CPF and the tarsus front (filled as subcutaneous / suborbicularis fat)
    const tarFront = []; for (let s = S_TARL; s >= 0; s -= 0.1) tarFront.push(DP.at(s, U_TARL));
    const cpfAnt = []; for (let s = S_FUSL; s >= S_TARL; s -= 0.1) cpfAnt.push(DP.at(s, U_CPF));
    const maxFront = boneOut.filter(p => p[1] > Y_RIM - 0.85).map(p => add(p, [-PERI, 0])).reverse();   // anterior maxilla, bottom → rim
    const antL = [...sk.pts, [-11.8, 45], ...maxFront, ...SEPT.pts.slice().reverse(), ...cpfAnt, ...tarFront];
    o.push(`<path d="${poly(antL)}" fill="${C.sfat}"/>`);
    lobules(o, pid + 'LSF', poly(antL), -16, -3, 9, 40, 0.24, 0.42, C.sfatL, C.sfatS, 0.6);
    // 7 septum
    o.push(`<path d="${SEPT.band(0, SEPT.L, -0.075, 0.075)}" fill="${C.sept}" stroke="${C.septS}" stroke-width="0.8" ${NS}/>`);
    A.septumL = SEPT.off(SEPT.L * 0.42, 0); A.fusionL = SEPT.off(0, 0);
    // 8 conjunctiva: margin → palpebral → fornix → bulbar
    const pal = []; for (let s = 0; s < S_FORNIXL; s += 0.05) pal.push(DP.at(s, U_CONJ / 2)); pal.push(DP.at(S_FORNIXL, U_CONJ / 2));
    const bul = []; for (let a = phF; a <= PHI_LL + 0.5 * D2R; a += 0.003) { const p = gp(a); bul.push(add(p, unit(p), irTh(a) + 0.06)); }
    const pf = DP.at(S_FORNIXL, U_CONJ / 2), bf = bul[0], mid = lerpP(pf, bf, 0.5), rr = hyp(sub(pf, bf)) / 2, tdir = LF.tan(S_FORNIXL), dd = unit(sub(pf, mid));
    const cap = []; for (let k = 1; k < 14; k++) { const a = Math.PI * k / 14; cap.push(add(add(mid, dd, rr * Math.cos(a)), tdir, rr * Math.sin(a) * 1.6)); }
    { const CJ = track([...pal, ...cap, ...bul]); o.push(`<path d="${CJ.band(0, CJ.L, -0.075, 0.075)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`); }
    A.conjL = DP.at(2.2, U_CONJ / 2); A.fornixL = add(mid, tdir, rr * 1.6); A.fornixPt = DP.at(S_FORNIXL, 0);
    // 9 tarsus + meibomian glands
    o.push(`<path d="${DP.band(0, S_TARL, U_CONJ, q => U_CONJ + TAR_TH * tarBot(q))}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.9" ${NS}/>`);
    const gl = []; let gi = 0;
    for (let q = 0.6; q < S_TARL - 0.7; q += 0.24, gi++) for (const du of [-0.2, 0.2]) { const c = DP.at(q + (du > 0 ? 0.12 : 0), U_CONJ + TAR_TH * 0.45 + du + (hash(gi, du > 0 ? 61 : 62) - 0.5) * 0.06);
      gl.push(`<circle cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" r="${(0.1 + 0.03 * hash(gi, 65)).toFixed(3)}" fill="${C.gland}" stroke="${C.glandS}" stroke-width="0.6" ${NS}/>`); }
    o.push(gl.join(''));
    o.push(`<path d="${DP.band(0, S_TARL - 0.6, U_ORIF - 0.055, U_ORIF + 0.055)}" fill="${C.duct}"/>`);
    const mOut = [[0, 0], [0, U_MCJ]], mIn = [[0.06, 0], [0.06, U_MCJ]];
    o.push(`<path d="${poly([...mOut, ...mIn.reverse()].map(([q, u]) => DP.at(q, u)))}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);
    A.tarsusL = DP.at(2.6, U_CONJ + TAR_TH * 0.75); A.glandL = DP.at(1.6, U_ORIF + 0.2); A.orificeL = DP.at(0, U_ORIF); A.mcjL = DP.at(0, U_MCJ); A.tarBotL = DP.at(S_TARL, 0.6);
    // 10 anterior lamella along the skin path q: skin, orbicularis (pretarsal 0.68, preseptal 0.89, orbital part over the rim schematic)
    const sAnt = SK.near(DA.at(marginS(U_RND), U_RND)), qTar = SK.near(DA.at(S_TARL, U_SKINL)), qRim = (() => { let bi = 0, bd = 1e9; for (let q = 0; q < Ltot; q += 0.05) { const d = Math.abs(SK.off(q, 0)[1] - Y_RIM); if (d < bd) { bd = d; bi = q; } } return bi; })();
    const ov = st.override || 0, sOfQ = q => { const p = SK.off(q, 0); let bs = 0, bd = 1e9; for (let s = 0; s <= S_TARL + 1; s += 0.05) { const d = hyp(sub(DA.at(s, U_SKINL), p)); if (d < bd) { bd = d; bs = s; } } return bs; };
    const skT = q => lerp(T_SKIN, 0.45, ss(qRim + 1, qRim + 6, q));
    const orbW = q => { if (q < sAnt) return 0; const base = lerp(T_POT, T_PSO, ss(qTar - 0.3, qTar + 0.6, q)) * ss(sAnt, sAnt + 0.5, q);
      return lerp(base, 1.25, ss(qRim - 2.5, qRim - 0.2, q)) * (1 - ss(qRim + 4, qRim + 9, q)) + (q < qTar + 1.5 ? ovT(sOfQ(q), ov) : 0); };
    const subq = q => 0.2 * ss(qTar, qTar + 1.5, q) * (1 - ss(qRim - 2, qRim, q));   // thin areolar layer under the preseptal muscle (schematic)
    const deepAt = q => skT(q) + subq(q) + orbW(q);
    // incisions on the skin, measured along the skin from the lash line (as the surgeon marks them)
    const incH = st.incH ?? 2.5, qInc = qLash + incH, hzLo = qLash + (st.hotzLo ?? 2.0), hzHi = hzLo + (st.hotzW ?? 3.0), rem = st.hotzExc || 0;
    const cutSkin = (st.subcil || 0) >= 1 && !(st.skinClose >= 1);
    const plane = st.plane || 0, ft = (p, q) => plane > 0 && q > qInc ? add(p, unit(sub(SK.off(q, 1), SK.off(q, 0))), 0.38 * plane * ss(qInc, qInc + 0.6, q) * (1 - ss(qTar + 2.2, qTar + 4.0, q))) : p;   // the skin–muscle flap lifts off
    const pieces = rem > 0 ? [[0, hzLo - 0.02, 1], [hzLo + 0.02, hzHi - 0.02, 1 - rem], [hzHi + 0.02, Ltot, 1]] : cutSkin ? [[0, qInc - 0.02, 1], [qInc + 0.02, Ltot, 1]] : [[0, Ltot, 1]];
    const inn = (q, d) => ft(SK.off(q, -d), q);
    const bandF = (o0, o1, fill, extra = '') => pieces.forEach(([a, b, op]) => { if (b <= a || op <= 0) return;
      const g = (v, q) => typeof v === 'function' ? v(q) : v, P = [], Q = [];
      for (let q = a; q < b; q += 0.05) { P.push(inn(q, g(o0, q))); Q.push(inn(q, g(o1, q))); } P.push(inn(b, g(o0, b))); Q.push(inn(b, g(o1, b)));
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${fill}"${extra}${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`); });
    if (plane > 0) { const P = [], Q = []; for (let q = qInc; q <= qTar + 4.0; q += 0.05) { P.push(inn(q, deepAt(q))); Q.push(SK.off(q, -deepAt(q))); }
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${WOUND}"/>`); A.planeL = lerpP(inn(qTar + 0.6, deepAt(qTar + 0.6)), SK.off(qTar + 0.6, -deepAt(qTar + 0.6)), 0.5); }
    if (rem > 0) { const P = [], Q = []; for (let q = hzLo; q <= hzHi + 1e-9; q += 0.05) { P.push(SK.off(q, 0)); Q.push(SK.off(q, -deepAt(q))); }
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${WOUND}" opacity="${Math.min(1, rem).toFixed(2)}"/>`); A.hotzWound = SK.off((hzLo + hzHi) / 2, -deepAt((hzLo + hzHi) / 2) * 0.5); }
    bandF(q => skT(q) + subq(q) - 0.01, deepAt, C.orb);
    const dots = []; let di = 0;
    for (let q = sAnt + 0.25; q < qRim + 6; q += 0.28, di++) { const w = orbW(q); if (w < 0.28 || (cutSkin && Math.abs(q - qInc) < 0.2)) continue; let inPiece = false; for (const [a, b, op] of pieces) if (q >= a && q <= b && op >= 0.5) inPiece = true; if (!inPiece) continue;
      for (let d = skT(q) + subq(q) + 0.15, dj = 0; d < deepAt(q) - 0.08; d += 0.25, dj++) { const qq = q + (hash(di + 90, dj) - 0.5) * 0.12, c = inn(qq, d); dots.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.085" ry="0.07" fill="${C.orbB}" opacity="0.5"/>`); } }
    o.push(dots.join(''));
    if (ov > 0) { const top = ovTop(ov); o.push(`<path d="${poly((() => { const r = []; for (let s = top; s <= S_TARL - 0.5; s += 0.05) r.push(DA.at(s, U_TARL + T_PLANE + T_POT + 0.02)); return r; })(), false)}" fill="none" stroke="${C.orbB}" stroke-width="1.1" stroke-dasharray="3 2" opacity="${Math.min(1, ov * 1.5).toFixed(2)}" ${NS}/>`);
      A.override = DA.at(Math.max(top + 0.5, 2.0), U_TARL + T_PLANE + T_POT + ovT(Math.max(top + 0.5, 2.0), ov) * 0.5); }
    bandF(0, skT, C.skin);
    for (const [a, b, op] of pieces) { if (op <= 0) continue; const L = []; for (let q = a; q < b; q += 0.05) L.push(inn(q, 0)); L.push(inn(b, 0)); o.push(`<path d="${poly(L, false)}" fill="none" stroke="${C.skinS}" stroke-width="1.1" ${NS}${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`); }
    A.skinL = SK.off(qTar + 1.6, 0); A.orbPT = inn(qTar - 1.4, skT(qTar - 1.4) + orbW(qTar - 1.4) * 0.5); A.orbPS = inn(qTar + 2.4, skT(qTar + 2.4) + subq(qTar + 2.4) + orbW(qTar + 2.4) * 0.5);
    A.orbOrbital = SK.off(qRim - 0.5, -(skT(qRim - 0.5) + orbW(qRim - 0.5) * 0.5)); A.cheek = SK.off(qRim + 8, 0); A.lidCheek = SK.off(qRim, 0);
    // 11 muscle of Riolan (grey line)
    o.push(`<path d="${DA.band(0.02, 1.5, U_TARL, q => U_TARL + 0.34 * (1 - ss(1.0, 1.5, q)))}" fill="${C.riolan}"/>`);
    for (let q = 0.2; q < 1.3; q += 0.28) { const c = DA.at(q, U_TARL + 0.17); o.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.06" ry="0.05" fill="#7e2a36" opacity="0.6"/>`); }
    A.greyL = DA.at(0, U_GREY); A.margL = DA.at(2.0, U_TARL + 0.12);
    { const ma = DA.at(2.1, U_TARL + 0.12); o.push(`<circle cx="${ma[0]}" cy="${ma[1]}" r="0.11" fill="${C.art}"/>`); }
    // 12 lashes and follicles. Lashes grow forward and down; with entropion they are stopped by the cornea and lie along it
    const fd = st.follicleDepth ?? 0.9, tr = st.treated || 0;
    const onCornea = (y, off) => { const ph = bisect(p => gp(p)[1] - y, 100 * D2R, 260 * D2R), p = gp(ph); return add(p, unit(p), off); };
    // a lash is stopped by the cornea once its root has rolled to within 1.6 mm of it (lash length and curl; threshold schematic): it then lies along it
    const inward = Math.max(0, DEF.angle);
    LASHES.forEach(([u, len, j], k) => {
      const FO = follicleL(G, k, fd), E = FO.E, B = FO.B, t0 = LF.tan(0.15), n0 = LF.nrm(0.15), E0 = LF.at(marginS(u), u), dA = p => DEF(p, 0, 'ant');
      const ec = inward > 0 ? ss(1.6, 0.8, toGlobe(E)) : 0;
      o.push(`<path d="${track([E, lerpP(E, B, 0.5), B]).band(0, hyp(sub(B, E)), -0.075, 0.075)}" fill="#f1d2bb" stroke="#c09074" stroke-width="0.6" ${NS}/>`);
      o.push(`<ellipse cx="${B[0].toFixed(3)}" cy="${B[1].toFixed(3)}" rx="0.085" ry="0.085" fill="${k === 1 && tr > 0 ? COL.coag : '#8a5e43'}"/>`);
      if (k === 1 && tr > 0) o.push(`<circle cx="${B[0].toFixed(3)}" cy="${B[1].toFixed(3)}" r="${(0.28 * tr).toFixed(3)}" fill="#c98a4b" opacity="0.45" stroke="#7a4a2a" stroke-width="0.8" stroke-dasharray="2 1.5" ${NS}/>`);
      let c1 = dA(add(add(E0, n0, 1.5 * len), t0, -0.35 * len)), c2 = dA(add(add(E0, n0, 3.1 * len), t0, 0.5 * len)), tip = dA(add(add(E0, n0, 4.1 * len), t0, (1.9 + j) * len));
      if (ec > 0) { const y0 = E[1]; c1 = lerpP(c1, onCornea(y0 - 0.9, 0.12), ec); c2 = lerpP(c2, onCornea(y0 - 2.7 * len, 0.14 + 0.08 * k), ec); tip = lerpP(tip, onCornea(y0 - (4.4 + j) * len, 0.18 + 0.12 * k), ec); }
      const pl = k === 1 ? (st.pluck || 0) : 0;
      o.push(`<path d="M${F(B)}L${F(E)}" stroke="#7a5640" stroke-width="0.04"${pl ? ` opacity="${(1 - pl).toFixed(2)}"` : ''}/><path d="M${F(E)}C${F(c1)} ${F(c2)} ${F(tip)}" fill="none" stroke="${C.lash}" stroke-width="0.07" stroke-linecap="round"${pl ? ` opacity="${(1 - pl).toFixed(2)}"` : ''}/>`);
      const bez = t => [0, 1].map(i => (1 - t) ** 3 * E[i] + 3 * (1 - t) ** 2 * t * c1[i] + 3 * (1 - t) * t * t * c2[i] + t ** 3 * tip[i]);
      if (k === 1) { A.follicleL = lerpP(E, B, 0.6); A.bulbL = B; A.lashRootL = E; A.lashL = bez(0.3); A.lashTipL = tip; A.lashPtsL = [0, 0.2, 0.4, 0.6, 0.8, 1].map(bez); A.follicleDir = FO.dir; }
    });
    // misdirected (normal lash line, wrong direction) and metaplastic (from the meibomian orifices) lower lashes, both reaching the cornea
    if (st.misdirected || st.metaplastic) {
      const amber = (P, op) => `<path d="M${F(P[0])}C${F(P[1])} ${F(P[2])} ${F(P[3])}" fill="none" stroke="#b86e00" stroke-width="0.08" stroke-linecap="round" opacity="${op}"/>`;
      if (st.misdirected) { const E = DA.at(marginS(U_SKINL - 0.3), U_SKINL - 0.3), n = DA.nrm(0.2), P = [E, add(E, n, 0.8), onCornea(E[1] - 1.6, 0.12), onCornea(E[1] - 3.6, 0.16)];
        o.push(amber(P, st.misdirected)); A.misLashL = onCornea(E[1] - 2.4, 0.14); A.misLashPts = P; }
      if (st.metaplastic) { const E = DP.at(0, U_ORIF), n = DP.nrm(0.2), P = [E, add(add(E, n, 0.2), DP.tan(0), -0.5), onCornea(E[1] - 1.2, 0.1), onCornea(E[1] - 3.0, 0.14)];
        o.push(`<circle cx="${E[0].toFixed(3)}" cy="${E[1].toFixed(3)}" r="0.06" fill="#b86e00" opacity="${st.metaplastic}"/>` + amber(P, st.metaplastic)); A.metaLashL = onCornea(E[1] - 2.0, 0.12); }
    }
    // electrolysis needle along the shaft of the central lash into its follicle (tip at follicleDepth × needle)
    if (st.needle) { const FO = follicleL(G, 1, fd), tip = add(FO.E, FO.dir, fd * Math.min(1, st.needle)), back = add(FO.E, FO.dir, -4.2);
      o.push(`<path d="M${F(back)}L${F(FO.E)}" stroke="${COL.steelS}" stroke-width="2.6" stroke-linecap="round" ${NS}/><path d="M${F(back)}L${F(tip)}" stroke="#aeb8c2" stroke-width="1.5" ${NS}/>`);
      o.push(`<path d="M${F(add(back, FO.dir, -2))}L${F(back)}" stroke="#e0b64a" stroke-width="5" stroke-linecap="round" ${NS}/>`);
      A.needleTip = tip; A.needleBack = add(FO.E, FO.dir, -2.0); A.needleIn = FO.E; }
    // 13 surgical overlays
    if (st.scar) { const sc = st.scar; for (const [q0, d0, d1] of [[qLash + 2.3, 0.05, 0.9], [qLash + 2.6, 0.4, 1.3]]) { const p0 = SK.off(q0, -d0), p1 = SK.off(q0 + 0.25, -d1);   // previous subciliary scar (schematic)
        o.push(`<path d="M${F(p0)}L${F(p1)}" stroke="#fff" stroke-width="${(1.4 + 1.4 * sc).toFixed(2)}" stroke-linecap="round" opacity="${(0.55 + 0.4 * sc).toFixed(2)}" ${NS}/>`); }
      const sp = []; for (let s = S_TARL + 0.2; s <= S_FUSL + 0.4; s += 0.1) sp.push(DP.at(s, U_CPF + 0.08));
      o.push(`<path d="${poly(sp, false)}" stroke="#fff" stroke-width="${(1.6 + 1.6 * sc).toFixed(2)}" fill="none" stroke-linecap="round" opacity="${(0.5 + 0.45 * sc).toFixed(2)}" ${NS}/>`);
      A.scarL = DP.at(S_TARL + 1.2, U_CPF + 0.1); A.scarSkin = SK.off(qLash + 2.4, -0.4); }
    if (st.subcil && !(st.skinClose >= 1)) { const s0 = SK.off(qInc, 0), e = SK.off(qInc, -deepAt(qInc) * Math.min(1, st.subcil));
      o.push(`<path d="M${F(s0)}L${F(e)}" stroke="${RED}" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); }
    A.incL = SK.off(qInc, 0); A.incDeep = SK.off(qInc, -deepAt(qInc)); A.lashSkinL = SK.off(qLash, 0);
    if (st.septOpen) { const q = SEPT.L * 0.18, c = SEPT.off(q, 0), t = unit(sub(SEPT.off(q + 0.1, 0), SEPT.off(q - 0.1, 0))), n = [-t[1], t[0]];
      o.push(`<path d="M${F(add(c, n, -0.45))}L${F(add(c, n, -0.45 + 0.9 * Math.min(1, st.septOpen)))}" stroke="${RED}" stroke-width="2.4" stroke-linecap="round" ${NS}/>`); A.septCutL = c; }
    if (st.retrOpen) { const s = cpfTop + 0.7, c0 = DP.at(s, U_CPF), c1 = DP.at(s, 0.0);
      o.push(`<path d="M${F(c0)}L${F(lerpP(c0, c1, Math.min(1, st.retrOpen)))}" stroke="${RED}" stroke-width="2.4" stroke-linecap="round" ${NS}/>`); A.retrCut = lerpP(c0, c1, 0.5); A.retrCutPts = [c0, c1]; }
    const fracS = st.fracS ?? 2.0, fracD = st.fracDepth ?? 0.5;
    if (st.frac) { const c0 = DP.at(fracS, U_TARL), c1 = DP.at(fracS, U_TARL - TAR_TH * fracD * Math.min(1, st.frac));
      o.push(`<path d="M${F(c0)}L${F(c1)}" stroke="${RED}" stroke-width="2.4" stroke-linecap="round" ${NS}/>`); A.fracL = lerpP(c0, c1, 0.5); A.fracPts = [c0, c1]; }
    // everting mattress suture (one arm in this plane): enters the conjunctiva near the fornix, passes through the retractors, runs up in
    // front of the tarsus and comes out through the skin `exitH` mm below the lash line (template 4-0 vicryl; positions to be confirmed)
    const exitH = st.exitH ?? 1.2, sut = st.mattress || 0;
    const sutPts = () => { const P0 = DP.at(S_FORNIXL - 1.0, 0), P1 = DP.at(S_FORNIXL - 2.6, (U_ITM + U_CPF) / 2), P2 = DP.at(S_TARL + 0.5, U_CPF + 0.3), P3 = DP.at(fracS + 0.2, U_TARL + 0.12),
      P4 = SK.off(qLash + exitH, 0); return spline([P0, P1, P2, P3, P4], 0.03); };
    if (sut) { const T = track(sutPts()), L = T.L * Math.min(1, sut);
      if (L > 0.05) o.push(`<path d="${poly(T.line(0, L, 0), false)}" fill="none" stroke="${BLUE}" stroke-width="2.2" stroke-linecap="round" ${NS}/>`);
      const P4 = T.pts[T.pts.length - 1], P0 = T.pts[0];
      o.push(`<circle cx="${P0[0].toFixed(3)}" cy="${P0[1].toFixed(3)}" r="0.12" fill="${BLUE}"/>`);
      if (sut >= 1) { const n = unit(sub(SK.off(qLash + exitH, 0), SK.off(qLash + exitH, -1))), t = unit(sub(SK.off(qLash + exitH + 0.1, 0), SK.off(qLash + exitH - 0.1, 0)));
        o.push(`<circle cx="${P4[0].toFixed(3)}" cy="${P4[1].toFixed(3)}" r="${(0.13 + 0.06 * (st.tie || 0)).toFixed(3)}" fill="${BLUE}"/>`);
        if ((st.tie || 0) > 0.3) for (const sg of [-1, 1]) o.push(`<path d="M${F(P4)}l${(n[0] * 0.7 + t[0] * 0.3 * sg).toFixed(3)} ${(n[1] * 0.7 + t[1] * 0.3 * sg).toFixed(3)}" stroke="${BLUE}" stroke-width="2" stroke-linecap="round" ${NS}/>`); }
      A.mattress = T.off(T.L * 0.55, 0); A.mattressPts = T.pts; A.mattressIn = P0; A.mattressExit = P4; }
    if (st.skinClose) { const c = SK.off(qInc, 0), n = unit(sub(SK.off(qInc, 0), SK.off(qInc, -1))), t = unit(sub(SK.off(qInc + 0.1, 0), SK.off(qInc - 0.1, 0)));
      o.push(`<path d="M${F(add(add(c, t, -0.45), n, -0.25))}Q${F(add(c, n, 0.35))} ${F(add(add(c, t, 0.45), n, -0.25))}" fill="none" stroke="#1d2733" stroke-width="1.6" opacity="${Math.min(1, st.skinClose)}" ${NS}/>`); A.skinClose = c; }
    if (st.hotzFix) { const q0 = hzLo - 0.1, P0 = SK.off(q0, -(skT(q0) + orbW(q0) * 0.6)), P2 = DP.at(S_TARL + 0.9, U_CPF - 0.05), T = track(spline([P0, add(lerpP(P0, P2, 0.5), [0.2, -0.35]), P2], 0.03)), L = T.L * Math.min(1, st.hotzFix);
      if (L > 0.05) o.push(`<path d="${poly(T.line(0, L, 0), false)}" fill="none" stroke="${BLUE}" stroke-width="2.2" stroke-linecap="round" ${NS}/>`);
      if (st.hotzFix >= 1) o.push(`<circle cx="${P2[0].toFixed(3)}" cy="${P2[1].toFixed(3)}" r="0.14" fill="${BLUE}"/>`);
      A.hotzFix = T.off(T.L * 0.5, 0); A.hotzFixEnds = [P0, P2]; }
    // 14 globe outline over the lower seam
    { const g = []; for (let a = 60; a <= 175; a += 0.5) g.push(gp(a * D2R)); o.push(`<path d="${poly(g, false)}" fill="none" stroke="${C.scleraS}" stroke-width="1.2" ${NS}/>`); }
    A.marginL = DP.at(0, 0); A.cornea = gp(170 * D2R);
    A.lower = { fd, qLash, qInc, exitH, fracS, fracD, hzLo, hzHi, angle: DEF.angle, cpfTop, Y_RIM, X_RIM };
    return { svg: o.join(''), A, DP, DA, SK, SEPT, skT, orbW, deepAt, qLash, sutPts: sut ? sutPts() : null, probe: { skin: SK.line(0, Ltot, 0), bone: boneOut } };
  }
  // the sagittal points the coronal view needs (y = height below the corneal light reflex), without drawing
  function keyPoints(st = {}) {
    const G = geom(st), { DP, DA, SK, SEPT, qLash } = G, fracS = st.fracS ?? 2.0;
    return { margin: DP.at(0, 0), lash: SK.off(qLash, 0), tarBot: DP.at(S_TARL, 0.6), fusion: SEPT.off(0, 0), fornix: DP.at(S_FORNIXL, 0), inc: SK.off(qLash + (st.incH ?? 2.5), 0),
      frac: DP.at(fracS, U_TARL), exit: SK.off(qLash + (st.exitH ?? 1.2), 0), hotzLo: SK.off(qLash + (st.hotzLo ?? 2.0), 0), hotzHi: SK.off(qLash + (st.hotzLo ?? 2.0) + (st.hotzW ?? 3.0), 0),
      rim: [X_RIM, Y_RIM], cpfTop: DP.at(S_TARL + cpfShift(st), U_ITM), hotzFixCPF: DP.at(S_TARL + 0.9, U_CPF) };
  }
  return { draw, keyPoints, geom, follicleL, makeDeformL, LF, surfAt, toGlobe, PHI_LL, PHI_IR, PHI_ML, MARGIN_YL, APEX_X, S_TARL, TAR_TH, U_CONJ, U_TARL, U_ITM, U_CPF, S_ITM, S_FUSL, S_FORNIXL,
    T_POT, T_PSO, T_SKIN, U_SKINL, X_RIM, Y_RIM, FAT_FRONT_X, CHEEK_X, IO_C, IO_RX, IO_RY, ARC_L, TH_EL, LASHES, marginS, boneOut };
})();
if (typeof module !== 'undefined') module.exports = LOWER;
