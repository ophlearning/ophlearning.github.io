// ============================================================================
// Cataract surgery on the shared globe (OD) — optional states for the cataract series, video ① (main incision, side port, OVD, CCC).
// Units: mm. Every number is in CARD.md (白內障) with its source, or marked 示意 / 院內常規待確認 there.
// Nothing here changes GLOBE's own drawings: the open globe video loads globe.js only; all cataract views live in this file
// (GLOBE.section / GLOBE.enface are not touched). Load after globe.js; in node: require('./cataract.js')(GLOBE).
// Views (all are the same 3D eye):
//   section(opt)  meridional section through the optical axis at clock hp (default 6: screen right = 6 o'clock, left = 12 o'clock,
//                 anterior up — seen from the temporal side for OD). Lens, capsule, zonules, dilated iris, tunnels, OVD, instruments.
//   enface(opt)   microscope view (surgeon at 12: 12 o'clock at the bottom, temporal on the right), dilated pupil with red reflex.
// State: st.cat = { pupil, ovd, ovdAt, main, side, ccc, inst, zonule, push, folds } (see DEF below).
// ============================================================================
function CATARACT_MAKE(G) {
  const { D2R, NS, lerp, clamp, ss, add, sub, dot, len, unit } = G;
  const F = p => p[0].toFixed(4) + ' ' + p[1].toFixed(4);          // 0.1 µm: the capsule close-up runs at ~4000 px/mm
  const H2R = 30 * D2R;                                          // clock hour → radians
  const u2 = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
  const wrapH = h => ((h % 12) + 12) % 12;
  const fwdH = (from, to, dir) => wrapH((to - from) * dir);       // clock hours travelled from `from` to `to` going in direction dir

  // ---------------------------------------------------------------- numbers (CARD.md 白內障 has the source of each)
  const CN = {
    lensT: 4.56, lensRa: 9.73, lensRp: 5.49, ledSrc: 9.81, ledSD: 0.83, acdEndo: 2.72, age: 69, AL: 23.53,   // Chen 2021 (Chinese age-related cataract, CASIA2, dilated)
    fillet: 0.5,                                                   // 示意: rounding of the equator (it sets the model's equator diameter; checked against Chen 2021)
    pupil: 7.0,                                                    // Chiambaretta 2018: mean pupil > 7.0 mm when the capsulorhexis starts
    cap: { antPole: 0.015, antMax: 0.016, eq: 0.007, postPeriph: 0.004, postPole: 0.0035 },   // Barraquer 2006, elderly lenses
    capMaxRho: 2.5, capPostRho: 3.0,                               // 示意: where the anterior maximum / the posterior-periphery value sit
    postZon: 1.0,                                                  // 示意: posterior zonules insert up to 1 mm inside the equator
    optic: 6.0,                                                    // [院內 IOL 型號待確認] one-piece hydrophobic acrylic optic
    cccD: 5.25,                                                    // target 5.0–5.5 on a 6.0 optic (Hollick 1999; Haripriya 2025)
    main: { h: 12, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },          // w 院內常規待確認; L: Ernest 1995 (1.75–2.0), Wilczynski 2016 (1.84 ± 0.36); s 示意
    side: { h: 2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },        // 示意 / 院內常規待確認
    pivotF: 0.35,                                                  // 示意: instruments turn about a point 35 % along the tunnel from the outer opening
    nucK: [0.66, 0.68],                                            // 示意: nucleus size relative to the lens (radial, axial)
    gauge27: 0.41,                                                 // 27G outer diameter (needle gauge table); which gauge the hospital uses: 院內常規待確認
    weakShift: 0.3,                                                // 示意: how far the bag moves with the forceps when the zonules are weak
    striaeL: 0.35,                                                 // 示意: spacing of the anterior-capsule wrinkles
    push: { shift: 0.35, dome: 0.25 },                             // 示意: posterior pressure (st.cat.push = 1) moves the lens–iris diaphragm forward 0.35 mm
                                                                   //   and domes the lens 0.25 mm more at the centre (shallow chamber, convex anterior capsule)
  };

  // ---------------------------------------------------------------- lens: two spheres (central radii, thickness) joined by an equatorial fillet
  const apexZ = G.keyPoints({}).apexZ;
  const LENS = (() => {
    const T = CN.lensT, Ra = CN.lensRa, Rp = CN.lensRp, re = CN.fillet;
    const za = apexZ - G.N.cct - CN.acdEndo, zp = za - T, cA = za - Ra, cP = zp + Rp;
    const zc = (cA + cP) / 2 + ((Ra - re) ** 2 - (Rp - re) ** 2) / (2 * (cP - cA)), rc = Math.sqrt((Ra - re) ** 2 - (zc - cA) ** 2);
    const ua = u2([rc, zc - cA]), up = u2([rc, zc - cP]), aA = Math.atan2(ua[1], ua[0]), aP = Math.atan2(up[1], up[0]);
    const Ta = [rc + re * ua[0], zc + re * ua[1]], Tp = [rc + re * up[0], zc + re * up[1]];
    const Req = rc + re;
    // signed field (negative inside): spheres, except in the fillet's sector
    const g = (r, z) => { const dr = r - rc, dz = z - zc, a = Math.atan2(dz, dr);
      if (dr > 0 && a <= aA && a >= aP) return Math.hypot(dr, dz) - re;
      return Math.max(Math.hypot(r, z - cA) - Ra, Math.hypot(r, z - cP) - Rp); };
    const zAnt = r => r <= Ta[0] ? cA + Math.sqrt(Math.max(0, Ra * Ra - r * r)) : zc + Math.sqrt(Math.max(0, re * re - (r - rc) ** 2));
    const zPost = r => r <= Tp[0] ? cP - Math.sqrt(Math.max(0, Rp * Rp - r * r)) : zc - Math.sqrt(Math.max(0, re * re - (r - rc) ** 2));
    // dense profile from the anterior pole over the equator to the posterior pole: [r, z], outward normal, arclength
    const P = [], Nn = [];
    const fa = Math.atan2(ua[0], ua[1]);
    for (let k = 0; k <= 240; k++) { const f = fa * k / 240; P.push([Ra * Math.sin(f), cA + Ra * Math.cos(f)]); Nn.push([Math.sin(f), Math.cos(f)]); }
    for (let k = 1; k <= 60; k++) { const a = aA + (aP - aA) * k / 60; P.push([rc + re * Math.cos(a), zc + re * Math.sin(a)]); Nn.push([Math.cos(a), Math.sin(a)]); }
    const fp = Math.atan2(up[0], -up[1]);
    for (let k = 1; k <= 240; k++) { const f = fp * (1 - k / 240); P.push([Rp * Math.sin(f), cP - Rp * Math.cos(f)]); Nn.push([Math.sin(f), -Math.cos(f)]); }
    const S = [0]; for (let i = 1; i < P.length; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    let iEq = 0; P.forEach((p, i) => { if (p[0] > P[iEq][0]) iEq = i; });
    return { T, Ra, Rp, re, za, zp, cA, cP, zc, rc, Req, Ta, Tp, g, zAnt, zPost, P, N: Nn, S, iEq, LED: 2 * Req, zMid: (za + zp) / 2 };
  })();
  // anterior zonular insertion: distance from the equator by Sakabe 1998's regression (age, lens diameter, axial length)
  const AZI = 0.0079 * CN.age + 0.202 * LENS.LED - 0.041 * CN.AL + 0.0114;
  const R_AZI = LENS.Req - AZI;                                   // radius of the zonule-free zone
  // capsule thickness along the profile (arclength knots; Barraquer 2006 values, positions between them 示意)
  const sAt = r => { for (let i = 1; i <= LENS.iEq; i++) if (LENS.P[i][0] >= r) return LENS.S[i]; return LENS.S[LENS.iEq]; };
  const sAtPost = r => { for (let i = LENS.P.length - 1; i > LENS.iEq; i--) if (LENS.P[i][0] >= r) return LENS.S[i]; return LENS.S[LENS.iEq]; };
  const capT = (() => { const c = CN.cap, sEq = LENS.S[LENS.iEq], sEnd = LENS.S[LENS.S.length - 1];
    const knots = [[0, c.antPole], [sAt(CN.capMaxRho), c.antMax], [sEq, c.eq], [sAtPost(CN.capPostRho), c.postPeriph], [sEnd, c.postPole]];
    return s => { if (s <= 0) return knots[0][1]; for (let i = 1; i < knots.length; i++) if (s <= knots[i][0]) { const k = ss(knots[i - 1][0], knots[i][0], s); return lerp(knots[i - 1][1], knots[i][1], k); } return knots[knots.length - 1][1]; };
  })();

  // ---------------------------------------------------------------- state
  const DEF = { pupil: CN.pupil, ovd: 0, ovdAt: null, main: null, side: null, ccc: null, inst: [], zonule: null, push: 0, folds: 0 };
  const norm = st => { st = st || {}; const c = Object.assign({}, DEF, st.cat || {});
    c.main = c.main ? Object.assign({}, CN.main, { cut: 1 }, c.main) : null;
    c.side = c.side ? Object.assign({}, CN.side, { cut: 1 }, c.side) : null;
    c.ccc = c.ccc ? Object.assign({ r: CN.cccD / 2, h0: 6, dir: -1, cut: 1, prog: 0, fold: 0, run: 0, runAt: 0.3, out: 0 }, c.ccc) : null;
    c.zonule = c.zonule ? Object.assign({ weak: 0, pull: 0 }, c.zonule) : { weak: 0, pull: 0 };
    return c; };

  // ---------------------------------------------------------------- 3D helpers
  const cd = h => G.clockDir(h);                                 // [X, Y] of clock hour h
  const latDir = h => { const c = cd(h); return [c[1], -c[0]]; }; // horizontal, perpendicular to clock h (toward h + 3)
  const P3m = (h, r, z, c = 0) => { const a = cd(h), l = latDir(h); return [r * a[0] + c * l[0], r * a[1] + c * l[1], z]; };
  const hOf = (x, y) => G.clockOf(x, y);

  // ---------------------------------------------------------------- tunnels (main incision, side port): path in (s, d) wall coordinates at clock h
  function tunnel(cfg) {
    const h = cfg.h, sE = cfg.s;
    const sdPts = sI => { const TI = G.T(sI);
      if (cfg.arch === 'tri') return [[sE, 0], [sE - 0.12, 0.40 * G.T(sE)], [sI + 0.30, 0.62 * G.T(sI + 0.3)], [sI, TI]];
      if (cfg.arch === 'bi') return [[sE, 0], [sE - 0.06, 0.45 * G.T(sE)], [sI, TI]];
      return [[sE, 0], [sI, TI]]; };
    const toRZ = ([s, d]) => { const f = G.surfAt(s); return [f.rho - f.nr * d, f.z - f.nz * d]; };
    const chordOf = sI => { const a = toRZ([sE, 0]), b = toRZ([sI, G.T(sI)]); return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    let lo = sE - 4, hi = sE; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; chordOf(m) > cfg.L ? lo = m : hi = m; }
    const sI = (lo + hi) / 2, key = sdPts(sI), pts = [];
    for (let k = 1; k < key.length; k++) for (let j = k === 1 ? 0 : 1; j <= 12; j++) { const t = j / 12; pts.push(toRZ([lerp(key[k - 1][0], key[k][0], t), lerp(key[k - 1][1], key[k][1], t)])); }
    const S = [0]; for (let i = 1; i < pts.length; i++) S.push(S[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const Lp = S[S.length - 1];
    const at = f => { const s = clamp(f, 0, 1) * Lp; let i = 1; while (i < S.length - 1 && S[i] < s) i++; const k = (s - S[i - 1]) / ((S[i] - S[i - 1]) || 1);
      return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; };
    const dirAt = f => { const s = clamp(f, 0, 1) * Lp; let i = 1; while (i < S.length - 1 && S[i] < s) i++; return u2([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]); };
    const ext = pts[0], int = pts[pts.length - 1];
    return { h, w: cfg.w, sE, sI, pts, S, Lp, at, dirAt, ext, int, chord: Math.hypot(ext[0] - int[0], ext[1] - int[1]),
      to3: (rz, c = 0) => P3m(h, rz[0], rz[1], c), pivot: at(CN.pivotF), cfg };
  }
  const TUN = new Map();
  const tunnelOf = cfg => { const k = JSON.stringify([cfg.h, cfg.w, cfg.s, cfg.L, cfg.arch]); if (!TUN.has(k)) TUN.set(k, tunnel(cfg)); return TUN.get(k); };

  // ---------------------------------------------------------------- the capsulorhexis (lens-local: clock hour around the lens axis, radius)
  // ccc: { r, h0 (clock hour where the circular tear starts, at the end of the radial cut), dir (−1 = counter-clockwise as the surgeon sees it),
  //        cut 0→1 radial cut from the centre to (r, h0), prog 0→1 circular tear (0→360°), fold 0→1 flap folded over, run 0→1 run-out,
  //        runAt (fraction of the circle where the run-out starts), out 0→1 the freed disc taken out }
  const R_RUN_MAX = () => LENS.Req - 0.25;
  function rhex(c) {
    const span = 12 * clamp(c.prog, 0, 1), hf = wrapH(c.h0 + c.dir * span);
    const R = t => c.r + c.run * (R_RUN_MAX() - c.r) * ss(12 * c.runAt, 12 * c.runAt + 2.3, t);   // t = clock hours travelled
    const torn = h => { const t = fwdH(c.h0, h, c.dir); return t <= span + 1e-9 ? t : -1; };       // hours travelled to reach h, or −1 (not torn yet)
    return { span, hf, R, torn, front: [R(span), hf] };
  }
  // is the anterior capsule gone at (r, h) (lens-local)? the freed piece is lifted off (fold > 0) or taken out
  function bare(c, r, h) {
    if (!c) return false; const X = rhex(c), t = X.torn(h);
    if (t < 0 || c.prog <= 0) return false;
    return (c.out > 0.5 || c.fold > 0.02) && r < X.R(t);
  }
  // lens offset (weak zonules: the bag moves with the forceps) and the pull direction (tangent of the tear, horizontal)
  function lensShift(c) {
    const z = c.zonule, k = z.weak * z.pull;
    if (!(k > 0) || !c.ccc) return { LO: [0, 0, 0], k: 0, pull: [0, 0] };
    // pull = tangent of the tear in its direction of travel (d/dh of clockDir is ∝ [cy, −cx])
    const t = cd(rhex(c.ccc).hf), tg = u2([c.ccc.dir * t[1], -c.ccc.dir * t[0]]);
    return { LO: [tg[0] * CN.weakShift * k, tg[1] * CN.weakShift * k, 0], k, pull: tg };
  }
  // posterior pressure (c.push 0→1; 示意): every point of the lens and its capsule at distance r from the lens axis moves forward by liftZ(c, r)
  // (the whole diaphragm forward, the centre more: a shallower chamber and a more convex anterior capsule); the iris margin rides on it
  const liftZ = (c, r) => c.push > 0 ? c.push * (CN.push.shift + CN.push.dome * Math.max(0, 1 - (r / LENS.Req) ** 2)) : 0;
  // anterior capsule height (lens-local), with the wrinkles of weak zonules (radial striae along the pull, 示意 amplitude and spacing)
  function striae(c, x, y) {
    const S = lensShift(c); if (!(S.k > 0)) return 0;
    const X = rhex(c.ccc), gp = [X.front[0] * 0.82 * cd(X.hf)[0], X.front[0] * 0.82 * cd(X.hf)[1]], u = S.pull, v = [-u[1], u[0]];
    const a = (x - gp[0]) * u[0] + (y - gp[1]) * u[1], b = (x - gp[0]) * v[0] + (y - gp[1]) * v[1];
    if (a < 0 || a > 3.2) return 0;                                  // in the intact capsule ahead of the grasp, along the pull
    return 0.05 * S.k * Math.exp(-(((a - 1.3) / 1.0) ** 2)) * Math.exp(-((b / 1.0) ** 2)) * Math.cos(2 * Math.PI * b / CN.striaeL);
  }
  const capPt = (c, r, h, lift = 0) => { const S = lensShift(c), d = cd(h), x = r * d[0], y = r * d[1];
    return [x + S.LO[0], y + S.LO[1], LENS.zAnt(r) + striae(c, x, y) + lift + S.LO[2] + liftZ(c, r)]; };

  // flap: the freed sector of the disc, folded over about the radial line through the tear front (lies ahead of the front when fold = 1)
  function flapMesh(c) {
    const cc = c.ccc; if (!cc || cc.out > 0.5) return null;
    const X = rhex(cc); let span = X.span;
    if (cc.prog <= 0) return null;
    const nh = Math.max(2, Math.ceil(span / 0.15)), nr = 12, S = lensShift(c);
    const fl = cd(X.hf), dL = [fl[0], fl[1]], perpL = [-dL[1], dL[0]], ang = Math.PI * clamp(cc.fold, 0, 1), V = [];
    for (let i = 0; i <= nh; i++) { const t = span * i / nh, h = wrapH(cc.h0 + cc.dir * t), Rr = X.R(t), d = cd(h);
      const row = []; for (let j = 0; j <= nr; j++) { const r = Rr * j / nr, q = [r * d[0], r * d[1]];
        const along = q[0] * dL[0] + q[1] * dL[1], e = q[0] * perpL[0] + q[1] * perpL[1], sg = e < 0 ? -1 : 1, ae = Math.abs(e);
        // rotate the point's offset from the hinge (ae across, w0 down) about the hinge line by `ang`
        const foot = [dL[0] * along, dL[1] * along], zf = LENS.zAnt(Math.abs(along)), w0 = LENS.zAnt(r) + striae(c, q[0], q[1]) - zf;
        const pe = ae * Math.cos(ang) - w0 * Math.sin(ang), pz = ae * Math.sin(ang) + w0 * Math.cos(ang);
        const hx = foot[0] + sg * perpL[0] * pe, hy = foot[1] + sg * perpL[1] * pe, rr = Math.hypot(hx, hy);
        const zs = (rr < LENS.Req ? LENS.zAnt(rr) : LENS.zc) + striae(c, hx, hy);
        let z = zf + pz;
        if (ang > Math.PI / 2) z = Math.max(lerp(z, zs + 0.025, ss(Math.PI / 2, Math.PI, ang)), zs + 0.025);   // folded flat: a second layer on the capsule
        else z = Math.max(z, zs);                                                                          // lifting: never inside the lens
        row.push([hx + S.LO[0], hy + S.LO[1], z + liftZ(c, rr)]); }
      V.push(row); }
    // free edge: the torn edge after folding (j = nr), and the hinge
    return { V, nh, nr, edge: V.map(r => r[nr]), radial: V[0] };
  }

  // ---------------------------------------------------------------- instruments (3D): tip, axis (unit, tip → hand), segments for drawing
  // inst: { kind: 'keratome' | 'sideblade' | 'cannula' | 'cystotome' | 'forceps', via: 'main' | 'side', adv (blades: 0→1 along the tunnel, >1 into the AC),
  //         at: { h, r, lift } (tip relative to the anterior capsule, lens-local) or p: [x, y, z], open (forceps, mm) }
  function instGeom(c, inst) {
    const via = inst.via || (inst.kind === 'sideblade' ? 'side' : 'main'), cfg = via === 'side' ? (c.side || CN.side) : (c.main || CN.main), tn = tunnelOf(cfg);
    const r27 = CN.gauge27 / 2;
    if (inst.kind === 'keratome' || inst.kind === 'sideblade') {
      const adv = inst.adv ?? 0, rz = adv <= 1 ? tn.at(adv) : (() => { const d = tn.dirAt(1); return [tn.int[0] + d[0] * (adv - 1) * tn.Lp, tn.int[1] + d[1] * (adv - 1) * tn.Lp]; })();
      const d2 = tn.dirAt(Math.min(adv, 1)), tip = tn.to3(rz), back = tn.to3([rz[0] - d2[0], rz[1] - d2[1]]), axis = unit(sub(back, tip));
      const W = inst.kind === 'keratome' ? cfg.w : 1.0, tipL = inst.kind === 'keratome' ? 1.6 : 1.8, L = inst.kind === 'keratome' ? 3.4 : 3.2;
      return { kind: inst.kind, via, tn, tip, axis, lat: [...latDir(cfg.h), 0], blade: { W, tipL, L, th: 0.15 }, segs: [{ a: add(tip, axis, L), b: add(tip, axis, 30), r: inst.kind === 'keratome' ? 0.45 : 0.35 }], adv };
    }
    const S = lensShift(c);
    const tip = inst.p ? inst.p : capPt(c, inst.at.r, inst.at.h, inst.at.lift ?? 0);
    const piv = tn.to3(tn.pivot);
    if (inst.kind === 'cystotome') {
      const bend = add(tip, [0, 0, 1], 1.0), axis = unit(sub(piv, bend));                    // bent cutting tip 1.0 mm (示意)
      return { kind: 'cystotome', via, tn, tip, bend, axis, segs: [{ a: tip, b: bend, r: r27 * 0.8 }, { a: bend, b: add(bend, axis, 30), r: r27 }] };
    }
    if (inst.kind === 'forceps') {
      // capsulorhexis forceps: the distal 2.0 mm of the arms angled down 35° toward the capsule (示意), long thin arms through the tunnel
      const h0 = u2([piv[0] - tip[0], piv[1] - tip[1]]), bend = add(tip, [h0[0] * Math.cos(35 * D2R), h0[1] * Math.cos(35 * D2R), Math.sin(35 * D2R)], 2.0);
      const axis = unit(sub(piv, bend)), hz = u2([axis[0], axis[1]]), side = [-hz[1], hz[0], 0], o = (inst.open ?? 0) / 2;
      const arm = sg => { const t0 = add(tip, side, sg * (o + 0.04)), b0 = add(bend, side, sg * (o * 0.8 + 0.08)), j = add(add(bend, axis, 13), side, sg * 0.22);
        return [{ a: t0, b: b0, r: 0.1 }, { a: b0, b: j, r: 0.12 }]; };
      return { kind: 'forceps', via, tn, tip, bend, axis, open: inst.open ?? 0, segs: [...arm(1), ...arm(-1), { a: add(bend, axis, 13), b: add(bend, axis, 32), r: 0.5 }] };
    }
    const axis = unit(sub(piv, tip));
    return { kind: 'cannula', via, tn, tip, axis, segs: [{ a: tip, b: add(tip, axis, 30), r: r27 }] };
  }

  // ---------------------------------------------------------------- tunnel deformation by an instrument inside it (示意; CARD.md 白內障「物理與器械」)
  // The straight instrument crosses the tunnel at its pivot: toward the outer opening it rides above the tunnel and lifts the roof, toward the
  // inner opening it rides below and presses the posterior lip down; the tunnel gapes around it. Everything is a function of the radius r in the
  // incision's meridian (not of the nearest tunnel point, whose jumps at the tri-planar corners tore the cornea into strips):
  //   roof lift Ue(r) ≥ 0 and lip push De(r) ≤ 0 = Gaussian envelopes (σ 0.35 mm along r) of how far the instrument's surface is past the tunnel;
  //   tissue at height d above (below) the tunnel moves by Ue·f(d) (De·f(d)), f = exp(−(d/σv)²), σv = max(0.6, 1.25 × the largest move), so the
  //   map is monotonic in z and is inverted exactly (Newton); the gap between the moved roof and lip is a signed field (smooth outline, no steps).
  //   Descemet folds central to a pressed lip (only when asked for, st.cat.folds 0→1: a labelled 示意 illustration): a ripple of the deep cornea
  //   (amplitude 15 % of the push, ≤ 0.08 mm, spacing 0.4 mm; 示意).
  const FOLD = { k: 0.15, max: 0.08, lam: 0.4, reach: 1.5 };        // 示意 (CARD.md: 角膜皺褶)
  function deformer(c) {
    const out = [];
    for (const inst of c.inst || []) { const g = instGeom(c, inst), tn = g.tn, cfg = tn.cfg;
      if (g.blade) continue;                                                                      // a blade's cut is a zero-width slit (drawn as the tunnel line)
      if (!(((g.via === 'side' ? c.side : c.main)?.cut ?? 0) > 0)) continue;
      const a = cd(cfg.h), toRZ = p => [p[0] * a[0] + p[1] * a[1], p[2]];
      const A = toRZ(g.bend || g.tip), B = toRZ(add(g.bend || g.tip, g.axis, 10)), dl = u2([B[0] - A[0], B[1] - A[1]]);
      const zLine = r => A[1] + (r - A[0]) * dl[1] / (dl[0] || 1e-9);                          // instrument centre line, height at r
      const rr = (g.kind === 'forceps' ? 0.16 : CN.gauge27 / 2) + 0.01;                         // what lies in the tunnel: the two arms, or a 27G shaft (+ 10 µm)
      const P = tn.pts, rOut = P[0][0], rIn = P[P.length - 1][0];
      const zTun = r => { r = clamp(r, rIn, rOut); for (let i = 1; i < P.length; i++) if ((P[i - 1][0] - r) * (P[i][0] - r) <= 0) { const k = (r - P[i - 1][0]) / ((P[i][0] - P[i - 1][0]) || 1e-9); return lerp(P[i - 1][1], P[i][1], k); } return P[0][1]; };
      // how far the instrument's surface is past the tunnel, sampled every 0.01 mm of r (dense: an envelope of sparse samples ripples)
      const RS = []; for (let r = rIn; r <= rOut + 1e-9; r += 0.01) { const zt = zTun(r); RS.push([r, Math.max(0, zLine(r) + rr - zt), Math.min(0, zLine(r) - rr - zt)]); }
      // tables over r (0.004 mm): tunnel height, envelopes of the roof lift and the lip push
      const r0 = rIn - 1.6, r1 = rOut + 0.8, dr = 0.004, n = Math.ceil((r1 - r0) / dr) + 1, ZT = new Float64Array(n), UE = new Float64Array(n), DE = new Float64Array(n);
      for (let k = 0; k < n; k++) { const r = r0 + k * dr; ZT[k] = zTun(r); let u = 0, d = 0;
        for (const [ri, ui, di] of RS) { if (Math.abs(r - ri) > 1.2) continue; const w = Math.exp(-(((r - ri) / 0.35) ** 2)); if (ui * w > u) u = ui * w; if (di * w < d) d = di * w; }
        UE[k] = u; DE[k] = d; }
      const tab = (T, r) => { const x = clamp((r - r0) / dr, 0, n - 1), i = Math.min(n - 2, Math.floor(x)); return lerp(T[i], T[i + 1], x - i); };
      const maxUp = Math.max(...UE), maxDn = -Math.min(...DE), sv = Math.max(0.6, 1.25 * Math.max(maxUp, maxDn));
      out.push({ cfg, tn, a, l: latDir(cfg.h), zLine, rr, rIn, rOut, r0, r1, sv, maxUp, maxDn, zt: r => tab(ZT, r), ue: r => tab(UE, r), de: r => tab(DE, r),
        fold: clamp(c.folds || 0, 0, 1) * Math.min(FOLD.max, FOLD.k * -tab(DE, rIn + 0.05)), g });
    }
    if (!out.length) return null;
    // forward vertical move of tissue at height h above (h > 0) or below (h < 0) the tunnel; inverted by Newton (the map is monotonic in h)
    const fwd = (D, mv, h) => mv * Math.exp(-((h / D.sv) ** 2));
    const solve = (D, mv, dz, sg) => { let h = Math.max(0, sg * (dz - mv)) * sg;                    // dz = z − zt (moved), h = z0 − zt (rest), sg = side
      for (let it = 0; it < 12; it++) { const e = Math.exp(-((h / D.sv) ** 2)), F = h + mv * e - dz, dF = 1 - mv * e * 2 * h / (D.sv * D.sv); h -= F / dF; if (sg * h < 0) h = 0; }
      return h; };
    // Descemet folds (示意): the deep cornea central to the inner opening ripples (zero at the opening and FOLD.reach mm central to it), fading toward
    // the anterior stroma; continuous across the back surface (the chamber just behind it follows, fading over 0.4 mm)
    const foldAt = (D, r, z0) => { const x = D.rIn - r; if (!(D.fold > 0.002) || x <= 0 || x >= FOLD.reach) return 0;
      const W = G.wallOf(z0, r), T = G.T(W.s), w = W.d <= T ? ss(0.35, 0.95, W.d / T) : Math.max(0, 1 - (W.d - T) / 0.4);
      return w > 0 ? D.fold * Math.sin(2 * Math.PI * x / FOLD.lam) * Math.sin(Math.PI * x / FOLD.reach) * w : 0; };
    // forward map of a rest point (r, z0) in the incision's meridian (lateral offset 0): where it is drawn (labels, checks)
    for (const D of out) D.fwd = (r, z0) => { const zt = D.zt(r), h = z0 - zt; return z0 + fwd(D, h >= 0 ? D.ue(r) : D.de(r), h) + foldAt(D, r, z0); };
    const map = p => { let q = p, gap = -1;
      for (const D of out) { const r = p[0] * D.a[0] + p[1] * D.a[1], cc = p[0] * D.l[0] + p[1] * D.l[1], z = p[2];
        if (r < D.r0 || r > D.r1 || Math.abs(cc) > D.cfg.w / 2 + 0.5) continue;
        const zt = D.zt(r); if (Math.abs(z - zt) > 2.5) continue;
        const lw = 1 - ss(D.cfg.w / 2, D.cfg.w / 2 + 0.5, Math.abs(cc)), U = D.ue(r) * lw, Dd = D.de(r) * lw, dz = z - zt;
        // the gaping tunnel (and the instrument in it): positive between the moved roof and lip, inside the incision; continuous on both sides
        gap = Math.max(gap, Math.min(dz - Dd, U - dz, r - D.rIn, D.rOut - r, D.cfg.w / 2 - Math.abs(cc)));
        // where this tissue was before it was lifted (roof) / pushed (lip), and before the small ripple of the folds (fixed point on the ripple)
        const back = e => { const d = dz - e; return d >= U ? solve(D, U, d, 1) : d <= Dd ? solve(D, Dd, d, -1) : 0; };
        let h = back(0), z0 = zt + h;
        for (let it = 0, e = foldAt(D, r, z0); e && it < 4; it++) { h = back(e); z0 = zt + h; e = foldAt(D, r, z0); }
        q = [r * D.a[0] + cc * D.l[0], r * D.a[1] + cc * D.l[1], z0]; }
      return { q, gap }; };
    map.parts = out;
    return map;
  }
  // front (back = false) or back surface of the wall at distance r from the optical axis, in a meridian: height z (cornea, limbus)
  const wallZ = (r, back) => { let a = G.S_APEX, b = 1.5; const at = s => { const f = G.surfAt(s), d = back ? G.T(s) : 0; return [f.rho - f.nr * d, f.z - f.nz * d]; };
    for (let i = 0; i < 50; i++) { const m = (a + b) / 2; at(m)[0] < r ? a = m : b = m; } return at((a + b) / 2)[1]; };

  // ---------------------------------------------------------------- dilated iris (shape 示意): pupil margin resting on the anterior capsule
  function irisOf(c) {
    const root = G.inner({}).root, pr = c.pupil / 2, th = t => 0.2 + 0.55 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.25)), 0.8) * (t < 0.8 ? 1 : 1 - ss(0.8, 1, t) * 0.5);
    const pm = [LENS.zAnt(pr) + th(0) / 2 + 0.01 + liftZ(c, pr), pr], ctl = [lerp(pm[0], root[0], 0.5) + 0.18, lerp(pm[1], root[1], 0.5)], L = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40, u = 1 - t; L.push([u * u * pm[0] + 2 * u * t * ctl[0] + t * t * root[0], u * u * pm[1] + 2 * u * t * ctl[1] + t * t * root[1]]); }
    return { L, th, pm, root };
  }
  const irisZ = (I, r) => { const L = I.L; if (r <= L[0][1]) return L[0][0]; for (let i = 1; i < L.length; i++) if (L[i][1] >= r) { const k = (r - L[i - 1][1]) / ((L[i][1] - L[i - 1][1]) || 1); return lerp(L[i - 1][0], L[i][0], k); } return L[L.length - 1][0]; };
  const distPoly = (q, pts) => { let bd = 1e18, bt = 0; const n = pts.length - 1;
    for (let i = 1; i <= n; i++) { const ax = pts[i - 1][0], ay = pts[i - 1][1], ex = pts[i][0] - ax, ey = pts[i][1] - ay, L2 = ex * ex + ey * ey || 1;
      let t = ((q[0] - ax) * ex + (q[1] - ay) * ey) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dx = q[0] - ax - ex * t, dy = q[1] - ay - ey * t, d = dx * dx + dy * dy; if (d < bd) { bd = d; bt = (i - 1 + t) / n; } }
    return [Math.sqrt(bd), bt]; };

  // ---------------------------------------------------------------- zonules: from the ciliary body to the insertion zone on the capsule (count, origins 示意)
  function zonules(c, h) {
    const S = lensShift(c), a = cd(h), off = S.LO[0] * a[0] + S.LO[1] * a[1], fib = [], N = G.N;
    const cil = s => { const x = s - N.spur, th = x < N.plicata ? lerp(0.35, 1.05, ss(0, 0.6, x)) * (1 - ss(N.plicata - 0.6, N.plicata + 0.4, x) * 0.7) : lerp(0.32, 0.22, ss(N.plicata, N.ora - N.spur, x));
      const f = G.surfAt(s), d = G.T(s) + th - 0.02; return [f.rho - f.nr * d, f.z - f.nz * d]; };
    const ins = [];
    for (let k = 0; k <= 5; k++) { const r = lerp(R_AZI, LENS.Req - 0.12, k / 5); ins.push([r + off, LENS.zAnt(r) + liftZ(c, r)]); }      // anterior: from the AZI to the equator
    ins.push([LENS.Req + off, LENS.zc + liftZ(c, LENS.Req)]);
    for (let k = 1; k <= 4; k++) { const r = lerp(LENS.Req - 0.12, LENS.Req - CN.postZon, k / 4); ins.push([r + off, LENS.zPost(r) + liftZ(c, r)]); }   // posterior (示意 extent)
    ins.forEach((p, i) => { const s = N.spur + lerp(2.6, 0.7, i / (ins.length - 1)); fib.push([cil(s), p]); });
    return fib;
  }

  // ---------------------------------------------------------------- section: meridional plane at clock hp (screen right = toward hp)
  const C = Object.assign({}, G.C, { cortex: '#f4efe0', cortexS: '#bfb08a', nuc: '#e6c983', nucS: '#c8a457', cap: '#2f78b7', zon: '#b39a6a', ovd: '#9cc6ee', tunnel: '#3c4a57', metal: '#c3cad2', metalD: '#8e98a3', metalS: '#4c5560' });
  const SEC = new Map();
  // per-point tissue values (negative inside), shared by the section and the checks
  const LAYERS = ['interior', 'aqueous', 'ovd', 'lens', 'nuc', 'retina', 'choroid', 'ciliary', 'iris', 'sclera', 'limbus', 'cornea', 'conj'];
  const fieldCtx = (c, def) => ({ c, fd: G.makeField({}), I: irisOf(c), S: lensShift(c), ovdC: c.ovdAt || [0, 0, LENS.za + 0.9], ovdR: 9.5 * clamp(c.ovd, 0, 1), def });
  function fieldAt(X, p0) {
    let p = p0, gap = -1; if (X.def) { const w = X.def(p0); p = w.q; gap = w.gap; }
    const { fd, I, S } = X, W = fd.wall(p), m = W.m, lr = Math.hypot(p[0] - S.LO[0], p[1] - S.LO[1]), lz = p[2] - S.LO[2] - liftZ(X.c, lr), o = {};
    let lensG = LENS.g(lr, lz); const above = lr < LENS.Req ? lz - LENS.zAnt(lr) : lz - LENS.zc;
    // where the anterior capsule is gone, the cortex surface is the capsule's inner surface (one capsule thickness lower)
    if (X.c.ccc && Math.abs(lensG) < 0.05 && lz > LENS.zc && bare(X.c.ccc, lr, G.clockOf(p[0] - S.LO[0], p[1] - S.LO[1]))) lensG += capT(sAt(lr));
    o.interior = fd.g.interior(W);
    o.aqueous = Math.max(o.interior, Math.min(-above, lr < LENS.Req && lz > LENS.zc ? -lensG : 1), -lensG);   // −lensG: ends exactly where the lens begins   // in front of the lens (incl. where the capsule is gone)
    if (X.def) o.aqueous = Math.min(o.aqueous, -gap);              // the gaping tunnel is open to the chamber: chamber fluid (and OVD) fills it
    o.ovd = X.ovdR > 0 ? Math.max(o.aqueous, Math.hypot(p[0] - X.ovdC[0], p[1] - X.ovdC[1], p[2] - X.ovdC[2]) - X.ovdR, m.rho > I.pm[1] ? irisZ(I, m.rho) - m.z : -1) : 1;   // anterior chamber only
    o.lens = lensG; o.nuc = (Math.hypot(lr / (LENS.Req * CN.nucK[0]), (lz - LENS.zMid - 0.15) / (LENS.T * CN.nucK[1] / 2)) - 1) * 1.5;
    o.retina = fd.g.retina(W); o.choroid = fd.g.choroid(W); o.ciliary = fd.g.ciliary(W);
    if (m.rho < 2 || m.rho > I.root[1] + 0.8 || m.z < I.root[0] - 0.9 || m.z > I.pm[0] + 1.2) o.iris = 1;
    else { const [d, t] = distPoly([m.z, m.rho], I.L); o.iris = d - I.th(t) / 2; }
    const cut = gap;                                                // > 0 inside the gaping tunnel: no wall tissue there (a signed field: smooth outline)
    o.sclera = Math.max(fd.g.sclera(W), cut); o.limbus = Math.max(fd.g.limbus(W), cut); o.cornea = Math.max(fd.g.cornea(W), cut); o.conj = Math.max(fd.g.conj(W), cut);
    return o;
  }
  const layersAt = (st, p) => { const c = norm(st); return fieldAt(fieldCtx(c, deformer(c)), p); };
  const layersFn = st => { const c = norm(st), X = fieldCtx(c, deformer(c)); return p => fieldAt(X, p); };   // many points of one state (checks)
  function sectionTissue(c, hp, win, step, def) {
    const pl = G.planes.meridian(hp), X = fieldCtx(c, def);
    const nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(win.h / step) + 1, n = nx * ny, V = {};
    LAYERS.forEach(k => V[k] = new Float64Array(n));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, o = fieldAt(X, G.onPlane(pl, win.x + i * step, win.y + j * step)); for (const nm of LAYERS) V[nm][k] = o[nm]; }
    const D = {}, loopsD = name => { if (D[name] !== undefined) return D[name]; const v = V[name]; let any = false; for (let k = 0; k < n; k++) if (v[k] < 0) { any = true; break; }
      return (D[name] = any ? G.contour(v, nx, ny, win.x, win.y, step).map(l => 'M' + l.map(F).join('L') + 'Z').join('') : ''); };
    const layer = (name, fill, stroke, sw = 0.9, extra = '') => { const d = loopsD(name); if (!d) return '';
      return `<path d="${d}" fill="${fill}" fill-rule="evenodd" ${stroke ? `stroke="${stroke}" stroke-width="${sw}" ${NS}` : ''} ${extra}/>`; };
    const o = [`<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="#f4f7f9"/>`];
    o.push(layer('interior', C.vit), layer('aqueous', C.aq), layer('ovd', '#e4ddf4', null, 0, `opacity="${(0.55 + 0.45 * clamp(c.ovd, 0, 1)).toFixed(2)}"`));
    o.push(layer('lens', C.cortex, C.cortexS, 0.7), layer('nuc', C.nuc, C.nucS, 0.6, 'opacity="0.85"'));
    o.push(layer('retina', C.ret), layer('choroid', C.chor), layer('ciliary', C.cil, C.cilS, 0.6));
    return { pre: o.join(''), post: [layer('iris', C.iris, C.irisS, 0.6), layer('sclera', C.sclera, C.scleraS), layer('limbus', C.limb, null), layer('cornea', C.cornea, C.corneaS), layer('conj', C.conj, C.conjS, 0.6)].join(''), pl,
      outline: { cornea: loopsD('cornea') } };   // outline (path data, mm) of the cornea, e.g. drawn dashed as the rest state under a deformed one
  }
  // capsule in a meridional plane: the profile of revolution (about the shifted lens axis) cut by the plane, both sides, with the opening
  function capsuleCut(c, pl, hp) {
    const S = lensShift(c), U = pl.U, nrm = [U[1], -U[0]], e = S.LO[0] * nrm[0] + S.LO[1] * nrm[1], uc = S.LO[0] * U[0] + S.LO[1] * U[1], runs = [];
    for (const sg of [1, -1]) {
      let run = [], band = [];
      const flush = () => { if (run.length > 1) runs.push({ pts: run, band }); run = []; band = []; };
      for (let i = 0; i < LENS.P.length; i++) { const [r, z] = LENS.P[i]; if (r < Math.abs(e) + 1e-6) { if (i > LENS.iEq) flush(); continue; }
        const along = sg * Math.sqrt(r * r - e * e), x = U[0] * along + nrm[0] * e, y = U[1] * along + nrm[1] * e, h = hOf(x, y) || 12;
        const ant = i <= LENS.iEq, gone = ant && bare(c.ccc, r, h);
        if (gone) { flush(); continue; }
        const zz = z + (ant ? striae(c, x, y) : 0) + liftZ(c, r), u = uc + along, t = capT(LENS.S[i]), nn = LENS.N[i];
        run.push([u, -zz]); band.push([u - sg * nn[0] * t, -(zz - nn[1] * t)]);
        if (i === LENS.P.length - 1) flush(); }
      flush();
    }
    return runs;
  }
  function section(opt) {
    const st = opt.st || {}, c = norm(st), hp = opt.h ?? 6, win = opt.win, step = opt.step || 0.03, id = opt.id || 'cs';
    const def = deformer(c), key = JSON.stringify([hp, win, step, c.pupil, c.ovd, c.ovdAt, c.zonule, c.ccc && lensShift(c).LO, def ? c.inst : null, c.main, c.side, c.push, c.folds]);
    let tis = SEC.get(key); if (!tis) { tis = sectionTissue(c, hp, win, step, def); if (SEC.size > 40) SEC.delete(SEC.keys().next().value); SEC.set(key, tis); }
    const pl = tis.pl, P2 = p3 => G.toPlane(pl, p3), o = [tis.pre], A = {};
    // zonules (both sides), under the iris
    for (const sg of [1, -1]) { const h = wrapH(hp + (sg > 0 ? 0 : 6)), a = cd(h);
      for (const [p, q] of zonules(c, h)) { const P = P2([p[0] * a[0], p[0] * a[1], p[1]]), Q = P2([q[0] * a[0], q[0] * a[1], q[1]]);
        o.push(`<path d="M${F(P)}L${F(Q)}" stroke="${C.zon}" stroke-width="0.7" opacity="0.85" ${NS}/>`); }
      const ra = R_AZI + (lensShift(c).LO[0] * a[0] + lensShift(c).LO[1] * a[1]); A['azi' + (sg > 0 ? '+' : '-')] = P2([ra * a[0], ra * a[1], LENS.zAnt(R_AZI) + liftZ(c, R_AZI)]);
      A['eq' + (sg > 0 ? '+' : '-')] = P2(add([LENS.Req * a[0], LENS.Req * a[1], LENS.zc + liftZ(c, LENS.Req)], lensShift(c).LO)); }
    o.push(tis.post);
    // capsule: true-thickness band (visible when zoomed) and a 1.6 px line along its outer surface
    const runs = capsuleCut(c, pl, hp);
    for (const r of runs) { o.push(`<path d="M${r.pts.map(F).join('L')}L${r.band.slice().reverse().map(F).join('L')}Z" fill="#9ec5e6" stroke="${C.cap}" stroke-width="0.5" ${NS}/>`);
      o.push(`<path d="M${r.pts.map(F).join('L')}" fill="none" stroke="#fff" stroke-width="3" opacity="0.7" ${NS}/><path d="M${r.pts.map(F).join('L')}" fill="none" stroke="${C.cap}" stroke-width="1.6" ${NS}/>`); }
    A.capRuns = runs;
    // flap: intersect the folded flap mesh with the plane
    const fm = flapMesh(c); if (fm) { const nrm = [pl.U[1], -pl.U[0], 0], sd = p => dot(sub(p, pl.O), nrm), segs = [], Sx = lensShift(c);
      const tri = (a, b, d) => { const s = [sd(a), sd(b), sd(d)].map(v => Math.abs(v) < 1e-5 ? 1e-5 : v), P = [a, b, d], pts = [];
        for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; if ((s[i] > 0) !== (s[j] > 0)) { const t = s[i] / (s[i] - s[j]); pts.push(add(P[i], sub(P[j], P[i]), t)); } }
        // skip pieces lying on the capsule itself (the hinge line): the flap shows where it stands off the capsule
        const off = q => { const r = Math.hypot(q[0] - Sx.LO[0], q[1] - Sx.LO[1]); return r < LENS.Req ? q[2] - LENS.zAnt(r) - liftZ(c, r) : 1; };
        if (pts.length === 2 && Math.max(off(pts[0]), off(pts[1])) > 0.012) segs.push(pts.map(P2)); };
      for (let i = 0; i < fm.nh; i++) for (let j = 0; j < fm.nr; j++) { tri(fm.V[i][j], fm.V[i + 1][j], fm.V[i + 1][j + 1]); tri(fm.V[i][j], fm.V[i + 1][j + 1], fm.V[i][j + 1]); }
      if (segs.length) { const d = segs.map(s => `M${F(s[0])}L${F(s[1])}`).join(''); o.push(`<path d="${d}" stroke="#fff" stroke-width="3" opacity="0.7" ${NS}/><path d="${d}" stroke="#1d5d93" stroke-width="1.6" stroke-linecap="round" ${NS}/>`); A.flapSegs = segs.length; } }
    if (c.ccc && c.ccc.prog > 0) { const X = rhex(c.ccc); A.front = P2(capPt(c, X.front[0], X.front[1])); A.front3 = capPt(c, X.front[0], X.front[1]); }
    // radial cut lying in this plane (shown dashed)
    if (c.ccc && c.ccc.cut > 0 && c.ccc.prog <= 0) { const h0 = c.ccc.h0, sideOK = [hp, hp + 6].some(h => Math.abs(((h0 - h + 18) % 12) - 6) < 0.05);
      if (sideOK) { const pts = []; for (let k = 0; k <= 20; k++) pts.push(P2(capPt(c, c.ccc.r * c.ccc.cut * k / 20, h0)));
        o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="3 2" ${NS}/>`); A.cutEnd = pts[pts.length - 1]; } }
    // tunnels: the incision line (closed) or the deformed slit around the instrument; drawn when the plane passes through the incision
    for (const [nm, cfg0] of [['main', c.main], ['side', c.side]]) {
      const cfg = cfg0 || ((c.inst || []).some(i => (i.kind === 'keratome' && nm === 'main') || (i.kind === 'sideblade' && nm === 'side')) ? Object.assign({}, CN[nm], { cut: 0 }) : null);
      if (!cfg) continue; const tn = tunnelOf(cfg);
      const inPlane = [hp, hp + 6].some(h => { const dh = ((cfg.h - h + 18) % 12) - 6; return Math.abs(tn.ext[0] * Math.sin(dh * H2R)) < cfg.w / 2; });
      const blade = (c.inst || []).map(i => instGeom(c, i)).find(g => g.tn === tn && (g.kind === 'keratome' || g.kind === 'sideblade'));
      const upto = Math.max(cfg.cut, blade ? Math.min(1, blade.adv) : 0); if (!(upto > 0)) continue;
      const held = (c.inst || []).some(i => { const g = instGeom(c, i); return g.tn === tn && !g.blade; });   // an instrument holds the tunnel open: the slit shows it
      if (inPlane) { const pts = []; for (let k = 0; k <= 40; k++) pts.push(P2(tn.to3(tn.at(upto * k / 40))));
        if (!held) o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="${C.tunnel}" stroke-width="1.3" opacity="0.9" ${NS}/>`);
        A[nm + 'Ext'] = P2(tn.to3(tn.ext)); A[nm + 'Int'] = P2(tn.to3(tn.int)); A[nm + 'Pivot'] = P2(tn.to3(tn.pivot)); } }
    // a tunnel held open by an instrument (deformer): anchors on the lifted roof (front surface, 0.45 mm inside the outer opening), the pressed lip
    // (back surface, 0.25 mm outside the inner opening) and a crest of the Descemet folds (back surface)
    for (const D of (def && def.parts) || []) { const nm = c.main && D.tn === tunnelOf(c.main) ? 'main' : c.side && D.tn === tunnelOf(c.side) ? 'side' : null; if (!nm) continue;
      const Pm = (r, z) => P2([r * D.a[0], r * D.a[1], z]), rR = D.rOut - 0.45, rL = D.rIn + 0.25, rF = D.rIn + 0.15 - FOLD.lam * 1.25;
      A[nm + 'Roof'] = Pm(rR, D.fwd(rR, wallZ(rR, false))); A[nm + 'RoofRest'] = Pm(rR, wallZ(rR, false));
      A[nm + 'Lip'] = Pm(rL, D.fwd(rL, wallZ(rL, true))); A[nm + 'LipRest'] = Pm(rL, wallZ(rL, true));
      A[nm + 'Folds'] = Pm(rF, D.fwd(rF, wallZ(rF, true) + 0.005)); A[nm + 'Lift'] = D.maxUp; A[nm + 'Push'] = D.maxDn; A[nm + 'Fold'] = D.fold; }
    // instruments, projected onto the plane (true size)
    (c.inst || []).forEach((inst, i) => { const g = instGeom(c, inst); o.push(drawInstSec(g, P2, pl)); A['tip' + i] = P2(g.tip); A['inst' + i] = g; });
    // pupil margins
    const I = irisOf(c); for (const sg of [1, -1]) { const h = wrapH(hp + (sg > 0 ? 0 : 6)), a = cd(h); A['pm' + (sg > 0 ? '+' : '-')] = P2([I.pm[1] * a[0], I.pm[1] * a[1], I.pm[0]]); }
    A.antPole = P2(add([0, 0, LENS.za + liftZ(c, 0)], lensShift(c).LO)); A.postPole = P2(add([0, 0, LENS.zp + liftZ(c, 0)], lensShift(c).LO));
    return { svg: o.join(''), A, pl, outline: tis.outline };
  }
  function drawInstSec(g, P2, pl) {
    // a round rod: dark rim, metal, and a light streak along its upper third (reads as a shaft, not a flat bar)
    const o = [], seg = (a, b, r) => { const A = P2(a), B = P2(b), d = u2([B[0] - A[0], B[1] - A[1]]), n = d[0] >= 0 ? [d[1], -d[0]] : [-d[1], d[0]], hl = [n[0] * r * 0.38, n[1] * r * 0.38];
      return `<path d="M${F(A)}L${F(B)}" stroke="${C.metalS}" stroke-width="${(2 * r + 0.05).toFixed(3)}" stroke-linecap="round"/><path d="M${F(A)}L${F(B)}" stroke="${C.metal}" stroke-width="${(2 * r).toFixed(3)}" stroke-linecap="round"/>` +
        `<path d="M${F([A[0] + hl[0], A[1] + hl[1]])}L${F([B[0] + hl[0], B[1] + hl[1]])}" stroke="#f3f6f8" stroke-width="${(0.55 * r).toFixed(3)}" stroke-linecap="round" opacity="0.85"/>`; };
    for (const s of g.segs) o.push(seg(s.a, s.b, s.r));
    if (g.blade) { const b = g.blade, ax2 = (() => { const A = P2(g.tip), B = P2(add(g.tip, g.axis, 1)); return u2([B[0] - A[0], B[1] - A[1]]); })(), nn = [-ax2[1], ax2[0]], T0 = P2(g.tip), pts = [], back = [];
      for (let x = 0; x <= b.L + 1e-9; x += b.L / 24) { const t = Math.min(b.th, x * b.th / 1.2) / 2, q = [T0[0] + ax2[0] * x, T0[1] + ax2[1] * x]; pts.push([q[0] + nn[0] * t, q[1] + nn[1] * t]); back.push([q[0] - nn[0] * t, q[1] - nn[1] * t]); }
      o.push(`<path d="M${[...pts, ...back.reverse()].map(F).join('L')}Z" fill="#dfe5ea" stroke="${C.metalS}" stroke-width="0.8" ${NS}/>`); }
    return o.join('');
  }

  // ---------------------------------------------------------------- microscope view (surgeon at 12 by default)
  function enface(opt) {
    const st = opt.st || {}, c = norm(st), id = opt.id || 'ce', M = G.enfaceMap(opt.surgeon ?? 12), o = [], A = {};
    const rhoL = G.surfAt(0).rho, ctr = M([0, 0, 0]), pr = c.pupil / 2, S = lensShift(c);
    const ring = (r, n = 180, cx = 0, cy = 0) => { const pts = []; for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n; pts.push(M([cx + r * Math.sin(t), cy + r * Math.cos(t), 0])); } return 'M' + pts.map(F).join('L') + 'Z'; };
    o.push(`<defs><radialGradient id="${id}_sc" cx="${ctr[0]}" cy="${ctr[1]}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0.42" stop-color="#fbf6f3"/><stop offset="0.75" stop-color="#f6e3e0"/><stop offset="1" stop-color="#eccfcb"/></radialGradient>` +
      `<radialGradient id="${id}_ir" cx="${ctr[0]}" cy="${ctr[1]}" r="${rhoL}" gradientUnits="userSpaceOnUse"><stop offset="${(pr / rhoL).toFixed(3)}" stop-color="#2e1a0f"/><stop offset="${((pr / rhoL + 1) / 2).toFixed(3)}" stop-color="#6d4329"/><stop offset="0.93" stop-color="#5a3622"/><stop offset="1" stop-color="#8f8a86"/></radialGradient>` +
      `<radialGradient id="${id}_rr" cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f6a660"/><stop offset="0.45" stop-color="#e2692f"/><stop offset="0.8" stop-color="#b8381c"/><stop offset="1" stop-color="#5e170b"/></radialGradient>` +
      `<radialGradient id="${id}_nu" cx="${ctr[0]}" cy="${ctr[1]}" r="${(LENS.Req * CN.nucK[0]).toFixed(3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d8b25e" stop-opacity="0.55"/><stop offset="0.7" stop-color="#c99a4a" stop-opacity="0.25"/><stop offset="1" stop-color="#c99a4a" stop-opacity="0"/></radialGradient>` +
      `<clipPath id="${id}_pup"><circle cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}"/></clipPath></defs>`);
    o.push(`<rect x="-30" y="-30" width="60" height="60" fill="url(#${id}_sc)"/>`);
    for (let k = 0; k < 26; k++) { const h0 = 12 * G.hash(k, 1), r0 = rhoL + 0.6 + 2.5 * G.hash(k, 2), pts = [];
      for (let j = 0; j <= 12; j++) { const r = r0 + j * 0.65, hh = h0 + 0.18 * Math.sin(j * 0.9 + k) * (1 + G.hash(k, 3)); pts.push(M([r * cd(hh)[0], r * cd(hh)[1], 0])); }
      o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#c8565c" stroke-width="${(0.6 + 0.8 * G.hash(k, 4)).toFixed(2)}" opacity="0.45" ${NS}/>`); }
    // ---- inside the pupil: red reflex, nucleus haze, capsule, rhexis, flap, striae (clipped to the pupil: nothing red outside it)
    const L = [], Mx = (x, y, z = 0) => M([x, y, z]);
    L.push(`<circle cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}" fill="url(#${id}_rr)"/>`);
    L.push(`<circle cx="${ctr[0] + 0}" cy="${ctr[1]}" r="${(LENS.Req * CN.nucK[0]).toFixed(3)}" fill="url(#${id}_nu)" transform="translate(${(M(S.LO)[0] - ctr[0]).toFixed(3)} ${(M(S.LO)[1] - ctr[1]).toFixed(3)})"/>`);
    const cc = c.ccc;
    if (cc) { const X = rhex(cc);
      // opening (capsule gone): the reflex looks a shade clearer there; intact capsule a faint sheen
      const openPts = []; if (cc.out > 0.5 || (cc.prog >= 1 && cc.fold > 0.02)) for (let k = 0; k <= 120; k++) { const t = 12 * k / 120; openPts.push(M(capPt(c, X.R(t), wrapH(cc.h0 + cc.dir * t)))); }
      else if (cc.prog > 0 && cc.fold > 0.02) { openPts.push(M(capPt(c, 0, 0))); for (let k = 0; k <= 60; k++) { const t = X.span * k / 60; openPts.push(M(capPt(c, X.R(t), wrapH(cc.h0 + cc.dir * t)))); } }
      L.push(`<circle cx="${M(S.LO)[0]}" cy="${M(S.LO)[1]}" r="${LENS.Req}" fill="#fff" opacity="0.07"/>`);
      if (openPts.length > 2) L.push(`<path d="M${openPts.map(F).join('L')}Z" fill="#ff8a4a" opacity="0.10"/>`);
      // torn edge (and the radial cut): a fine bright line with a dark inner shadow, as the edge catches the light
      const edge = []; for (let k = 0; k <= 90; k++) { const t = X.span * k / 90; edge.push(M(capPt(c, X.R(t), wrapH(cc.h0 + cc.dir * t)))); }
      const cut = []; for (let k = 0; k <= 12; k++) cut.push(M(capPt(c, cc.r * Math.min(1, cc.cut) * k / 12, cc.h0)));
      const line = pts => `<path d="M${pts.map(F).join('L')}" fill="none" stroke="#5a1507" stroke-width="1.6" opacity="0.55" ${NS}/><path d="M${pts.map(F).join('L')}" fill="none" stroke="#ffe0c2" stroke-width="0.9" opacity="0.95" ${NS}/>`;
      if (cc.cut > 0 && !(cc.out > 0.5)) L.push(line(cut));      // once the freed disc is out, the radial cut went with it
      if (cc.prog > 0) L.push(line(edge));
      A.front = M(capPt(c, X.front[0], X.front[1])); A.frontR = X.front[0]; A.frontHidden = Math.hypot(A.front[0] - ctr[0], A.front[1] - ctr[1]) > pr;
      for (const h of [12, 6, 3, 9]) { const t = X.torn(h); if (t >= 0 && cc.prog > 0) A['edge' + h] = M(capPt(c, X.R(t), h)); }
      // folded flap: translucent double layer with a visible free edge
      const fm = flapMesh(c); if (fm) { const out = [...fm.edge, ...fm.V[fm.nh].slice().reverse(), ...fm.radial].map(p => M(p));
        L.push(`<path d="M${out.map(F).join('L')}Z" fill="#f3dccb" opacity="${(0.18 + 0.2 * cc.fold).toFixed(2)}"/>`);
        L.push(`<path d="M${fm.edge.map(p => F(M(p))).join('L')}" fill="none" stroke="#fff4ea" stroke-width="1.1" opacity="0.9" ${NS}/>`); A.flapEdge = M(fm.edge[Math.floor(fm.edge.length / 2)]); }
      // weak zonules: wrinkles of the anterior capsule along the pull (示意 pattern; Chen 2025: wrinkling during CCC)
      if (S.k > 0) { const gp = [X.front[0] * 0.82 * cd(X.hf)[0], X.front[0] * 0.82 * cd(X.hf)[1]], u = S.pull, v = [-u[1], u[0]];
        // fold crests: lines along the pull, only where the capsule is still there (not over the opening)
        for (let m = -2; m <= 2; m++) { let pts = []; const runs = [];
          for (let a = 0.25; a <= 2.6; a += 0.08) { const x = gp[0] + u[0] * a + v[0] * m * CN.striaeL, y = gp[1] + u[1] * a + v[1] * m * CN.striaeL, r = Math.hypot(x, y);
            if (r < LENS.Req && !bare(cc, r, G.clockOf(x, y))) pts.push(M([x + S.LO[0], y + S.LO[1], 0])); else { if (pts.length > 1) runs.push(pts); pts = []; } }
          if (pts.length > 1) runs.push(pts);
          const op = (0.6 * S.k * Math.exp(-((m * CN.striaeL / 1.0) ** 2))).toFixed(2);
          for (const R of runs) L.push(`<path d="M${R.map(F).join('L')}" fill="none" stroke="#ffd2ae" stroke-width="0.9" opacity="${op}" ${NS}/><path d="M${R.map(p => F([p[0] + 0.04, p[1] + 0.04])).join('L')}" fill="none" stroke="#6a1a0a" stroke-width="0.7" opacity="${op}" ${NS}/>`); }
        A.striae = M([gp[0] + u[0] * 1.3 + S.LO[0], gp[1] + u[1] * 1.3 + S.LO[1], 0]); A.lensShift = Math.hypot(S.LO[0], S.LO[1]); }
    }
    if (c.ovd > 0 && c.ovd < 1) { const oc = c.ovdAt || [0, 0, 0]; L.push(`<path d="${ring(Math.min(rhoL, 9.5 * c.ovd), 120, oc[0], oc[1])}" fill="none" stroke="#e8f3ff" stroke-width="1" opacity="0.5" ${NS}/>`); }
    o.push(`<g clip-path="url(#${id}_pup)">${L.join('')}</g>`);
    A.reflexClipR = pr;
    // ---- iris annulus from the pupil to the limbus (covers anything of the lens beyond the pupil, e.g. a run-out under the iris)
    o.push(`<path d="${ring(rhoL - 0.05)}${ring(pr, 180)}" fill="url(#${id}_ir)" fill-rule="evenodd"/>`);
    for (let k = 0; k < 110; k++) { const h = k * 12 / 110 + 0.05 * G.hash(k, 5), r0 = pr + 0.12, r1 = rhoL - 0.4 - 0.4 * G.hash(k, 6), a = M([r0 * cd(h)[0], r0 * cd(h)[1], 0]), b = M([r1 * cd(h + 0.05)[0], r1 * cd(h + 0.05)[1], 0]);
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="${G.hash(k, 7) > 0.5 ? '#8a5a3a' : '#2e1a0f'}" stroke-width="0.7" opacity="0.45" ${NS}/>`); }
    o.push(`<path d="${ring(pr + 0.04)}" fill="none" stroke="#24130a" stroke-width="1.6" opacity="0.8" ${NS}/>`);      // pupil ruff
    A.pupilR = pr;
    // limbus
    const rS = G.surfAt(G.N.spur).rho;
    o.push(`<path d="${ring(rhoL + 0.02)}${ring(rhoL - 0.45)}" fill="#c9d3d9" fill-rule="evenodd" opacity="0.55"/>`, `<path d="${ring(rS)}${ring(rhoL)}" fill="#eef2f4" fill-rule="evenodd" opacity="0.8"/>`, `<path d="${ring(rhoL)}" fill="none" stroke="#9fb1bd" stroke-width="1" ${NS}/>`);
    if (c.ovd >= 1) o.push(`<path d="${ring(rhoL - 0.1)}" fill="${C.ovd}" opacity="0.10"/>`);
    // ---- incisions: outer opening (straight cut, width w), the tunnel seen through the cornea, the inner opening
    for (const [nm, cfg0] of [['main', c.main], ['side', c.side]]) {
      const cfg = cfg0 || ((c.inst || []).some(i => (i.kind === 'keratome' && nm === 'main') || (i.kind === 'sideblade' && nm === 'side')) ? Object.assign({}, CN[nm], { cut: 0 }) : null);
      if (!cfg) continue; const tn = tunnelOf(cfg);
      const blade = (c.inst || []).map(i => instGeom(c, i)).find(g => g.tn === tn && g.blade), upto = Math.max(cfg.cut, blade ? Math.min(1, blade.adv) : 0);
      if (!(upto > 0)) continue;
      const lat = latDir(cfg.h), w2 = cfg.w / 2, Q = (rz, cl) => M(P3m(cfg.h, rz[0], rz[1], cl)), e0 = Q(tn.ext, -w2), e1 = Q(tn.ext, w2), deep = tn.at(upto), i0 = Q(deep, -w2), i1 = Q(deep, w2);
      o.push(`<path d="M${F(e0)}L${F(e1)}L${F(i1)}L${F(i0)}Z" fill="#ffffff" opacity="0.28" stroke="#b7c3cc" stroke-width="0.6" ${NS}/>`);
      o.push(`<path d="M${F(e0)}L${F(e1)}" stroke="#f1f5f8" stroke-width="3" stroke-linecap="round" ${NS}/><path d="M${F(e0)}L${F(e1)}" stroke="#6f808d" stroke-width="1.2" stroke-linecap="round" ${NS}/>`);
      if (upto >= 1) o.push(`<path d="M${F(i0)}L${F(i1)}" stroke="#7d8d99" stroke-width="1" opacity="0.7" stroke-dasharray="2 1.5" ${NS}/>`);
      A[nm + 'Ext'] = Q(tn.ext, 0); A[nm + 'Int'] = Q(tn.int, 0); A[nm + 'W'] = Math.hypot(e1[0] - e0[0], e1[1] - e0[1]); }
    // ---- instruments (above the iris)
    (c.inst || []).forEach((inst, i) => { const g = instGeom(c, inst); o.push(drawInstTop(g, M)); A['tip' + i] = M(g.tip); });
    o.push(`<ellipse cx="${ctr[0] - 0.35}" cy="${ctr[1] - 0.25}" rx="0.09" ry="0.065" fill="#fff" opacity="0.8"/><ellipse cx="${ctr[0] + 0.35}" cy="${ctr[1] - 0.25}" rx="0.09" ry="0.065" fill="#fff" opacity="0.8"/>`);
    A.centre = ctr; A.limbusR = rhoL;
    return { svg: o.join(''), A, M };
  }
  function drawInstTop(g, M) {
    const o = [], band = (a, b, r, fill = C.metal) => { const A = M(a), B = M(b), d = u2([B[0] - A[0], B[1] - A[1]]), n = [-d[1] * r, d[0] * r];
      return `<path d="M${F([A[0] + n[0], A[1] + n[1]])}L${F([B[0] + n[0], B[1] + n[1]])}L${F([B[0] - n[0], B[1] - n[1]])}L${F([A[0] - n[0], A[1] - n[1]])}Z" fill="${fill}" stroke="${C.metalS}" stroke-width="0.9" stroke-linejoin="round" ${NS}/>`; };
    if (g.blade) { const b = g.blade, P = (x, y) => M(add(add(g.tip, g.axis, x), g.lat, y));
      const pts = [P(0, 0), P(b.tipL, b.W / 2), P(b.L, b.W / 2), P(b.L + 0.6, 0.4), P(b.L + 0.6, -0.4), P(b.L, -b.W / 2), P(b.tipL, -b.W / 2)];
      o.push(`<path d="M${pts.map(F).join('L')}Z" fill="#dfe5ea" stroke="${C.metalS}" stroke-width="0.9" stroke-linejoin="round" ${NS}/>`, `<path d="M${F(P(0.25, 0))}L${F(P(b.L, 0))}" stroke="#aab4be" stroke-width="0.7" ${NS}/>`);
      for (const s of g.segs) o.push(band(s.a, s.b, s.r)); return o.join(''); }
    if (g.kind === 'forceps') { for (const s of g.segs) o.push(band(s.a, s.b, s.r));
      const t = M(g.tip); o.push(`<circle cx="${t[0].toFixed(3)}" cy="${t[1].toFixed(3)}" r="0.09" fill="${C.metalS}"/>`); return o.join(''); }
    for (const s of g.segs.slice().reverse()) o.push(band(s.a, s.b, s.r));
    return o.join('');
  }

  const tearPlane = c => { c = c.ccc ? c : norm(c); const X = rhex(c.ccc); return wrapH(X.hf - c.ccc.dir * 0.12); };
  // where to grasp the flap: on the folded flap 0.4 mm ahead of the front and 15 % central to it (lens-local h, r; 示意)
  const graspAt = c => { c = c.ccc ? c : norm(c); const X = rhex(c.ccc); return { h: wrapH(X.hf + c.ccc.dir * 0.4 / Math.max(0.5, X.front[0]) / H2R), r: 0.85 * X.front[0], lift: 0.03 }; };
  // ---------------------------------------------------------------- key points for checks and narration
  const keyPts = st => { const c = norm(st), I = irisOf(c);
    return { LENS, AZI, R_AZI, capT, I, c, rhex: c.ccc ? rhex(c.ccc) : null, main: c.main ? tunnelOf(c.main) : null, side: c.side ? tunnelOf(c.side) : null }; };
  return { CN, LENS, AZI, R_AZI, capT, norm, tunnel: tunnelOf, rhex, bare, flapMesh, instGeom, deformer, wallZ, FOLD, liftZ, irisOf, zonules, lensShift, striae, capPt, graspAt, tearPlane, section, enface, keyPts, layersAt, layersFn, tunnelOf, C };
}
const CATARACT = typeof GLOBE !== 'undefined' ? CATARACT_MAKE(GLOBE) : null;
if (typeof module !== 'undefined') module.exports = CATARACT_MAKE;
