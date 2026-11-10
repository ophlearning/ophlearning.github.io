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
    // ---- video ② (hydrodissection, divide and conquer). Every value here is 示意 unless CARD.md 白內障 ② gives a source.
    hydro: { h: 6, tw: 0.15, front: 0.03, blockShift: 0.3, blockBow: 1.0 },   // injection clock hour; drawn fluid layer (mm); capsular block: lens forward, pocket at the pole
    groove: { w: 1.6, flare: 10, margin: 0.3, plate: 1.0, past: 0.1 },        // width, wall flare (°), inside the rhexis edge by, floor→posterior capsule at full depth, over-deep: past the capsule
    crack: { down: 0.4 },                                          // share of the crack's progress spent going down through the posterior plate (the rest runs out to the periphery)
    quad: { below: 0.6, tilt: 22 },                                // quadrant pulled up: apex to the axis, `below` mm under the anterior pole (iris plane); tilt (°)
    phaco: { needleOD: 0.9, bevel: 30, needleL: 1.0, sleeveOD: 1.5, portBack: 0.45, portD: 0.3, pivotF: 0.5 },   // needle, bevel angle, exposed needle, silicone sleeve, irrigation ports
    chopper: { d: 0.5, tipL: 1.5 },                                // second instrument through the side port: shaft diameter, bent tip length
    hcannula: { bend: 1.0, ang: 35 },                              // hydrodissection cannula: angled distal 1.0 mm, 35° down
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
  const DEF = { pupil: CN.pupil, ovd: 0, ovdAt: null, main: null, side: null, ccc: null, inst: [], zonule: null, push: 0, folds: 0, hydro: null, nuc: null, surge: 0 };
  const norm = st => { st = st || {}; const c = Object.assign({}, DEF, st.cat || {});
    c.main = c.main ? Object.assign({}, CN.main, { cut: 1 }, c.main) : null;
    c.side = c.side ? Object.assign({}, CN.side, { cut: 1 }, c.side) : null;
    c.ccc = c.ccc ? Object.assign({ r: CN.cccD / 2, h0: 6, dir: -1, cut: 1, prog: 0, fold: 0, run: 0, runAt: 0.3, out: 0 }, c.ccc) : null;
    c.zonule = c.zonule ? Object.assign({ weak: 0, pull: 0 }, c.zonule) : { weak: 0, pull: 0 };
    // ② hydrodissection { h (clock hour of the injection under the rhexis rim), prog 0→1 (fluid wave), press 0→1 (centre pressed: fluid released), block 0→1 }
    c.hydro = c.hydro ? Object.assign({ h: CN.hydro.h, prog: 0, press: 0, block: 0 }, c.hydro) : null;
    // ② nucleus { groove, crack, rot, groove2, crack2, quads } (see nucOf)
    if (c.nuc) { const n = c.nuc, g = x => x ? Object.assign({ dep: 0, w: CN.groove.w, len: null, over: 0 }, x) : null, k = x => x ? Object.assign({ prog: 0, sep: 0 }, x) : null;
      c.nuc = { groove: n.groove ? Object.assign({ h: 12 }, g(n.groove)) : null, crack: k(n.crack), rot: n.rot || 0, groove2: g(n.groove2), crack2: k(n.crack2),
        quads: (n.quads || []).map(q => Object.assign({ pull: 0, eat: 0 }, q)) }; }
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
  // ② adds a uniform forward move: capsular block (the lens pushed against the rhexis, 示意) and a post-occlusion surge (st.cat.surge = the fraction of the
  // chamber depth lost, from fluidics.js: the whole diaphragm comes forward by that share of the 2.72 mm chamber). Both 0 → exactly the ① value.
  const liftX = c => (c.hydro && c.hydro.block > 0 ? c.hydro.block * CN.hydro.blockShift : 0) + (c.surge > 0 ? c.surge * CN.acdEndo : 0);
  const liftZ = (c, r) => (c.push > 0 ? c.push * (CN.push.shift + CN.push.dome * Math.max(0, 1 - (r / LENS.Req) ** 2)) : 0) + liftX(c);
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

  // ================================================================ ② hydrodissection (示意 geometry; CARD.md 白內障 ②)
  // BSS injected under the rhexis rim at clock hy.h runs between the capsule and the cortex: out under the anterior capsule, round the equator and across
  // the posterior capsule (cortical cleaving hydrodissection, Fine 1992). Arrival order = a path length over the lens surface from the injection point
  // (along the profile, then round the axis at the smaller of the rim and the local radius; posterior points may also be reached across the pole),
  // normalised to 0→1: fluid is under the capsule where that order < prog (the front tapers over CN.hydro.front). press releases it; block traps a
  // pocket behind the nucleus (posterior only) while the lens moves forward (liftX). The capsule is pushed out along its normal by the fluid's thickness.
  const HYC = new Map();
  function hydroOf(c) {
    const hy = c.hydro; if (!hy) return null;
    const rc = c.ccc ? c.ccc.r : CN.cccD / 2, key = JSON.stringify([rc, hy.h]);
    let B = HYC.get(key);
    if (!B) { const Sc = sAt(rc), Send = LENS.S[LENS.S.length - 1];
      const dist = (i, phi) => { const S = LENS.S[i], r = LENS.P[i][0]; if (i <= LENS.iEq && S < Sc - 1e-9) return Infinity;   // inside the rhexis: no capsule, no fluid
        let d = Math.abs(S - Sc) + Math.min(rc, r) * phi; if (i > LENS.iEq) d = Math.min(d, (Send - Sc) + (Send - S)); return d; };
      let dMax = 0; for (let i = 0; i < LENS.P.length; i++) for (let k = 0; k <= 36; k++) { const d = dist(i, Math.PI * k / 36); if (isFinite(d)) dMax = Math.max(dMax, d); }
      B = { rc, Sc, Send, dist, dMax }; HYC.set(key, B); }
    const phiOf = (x, y) => { if (Math.hypot(x, y) < 1e-9) return 0; let d = (hOf(x, y) - hy.h) * H2R; d = Math.atan2(Math.sin(d), Math.cos(d)); return Math.abs(d); };
    const tau = (i, phi) => B.dist(i, phi) / B.dMax;
    const wave = (i, phi) => { const t = tau(i, phi); return hy.prog > 0 && isFinite(t) ? CN.hydro.tw * ss(0, CN.hydro.front, hy.prog - t) * (1 - clamp(hy.press, 0, 1)) : 0; };
    const pocket = i => hy.block > 0 && i > LENS.iEq ? hy.block * CN.hydro.blockBow * (1 - (LENS.P[i][0] / LENS.Req) ** 2) ** 2 : 0;
    const thick = (i, phi) => Math.max(wave(i, phi), pocket(i));
    return Object.assign({ hy, phiOf, tau, wave, pocket, thick }, B);
  }
  // posterior profile index nearest to radius r (for the wave front in the microscope view and checks)
  const postIdx = r => { for (let i = LENS.P.length - 1; i > LENS.iEq; i--) if (LENS.P[i][0] >= r) return i; return LENS.iEq + 1; };

  // ================================================================ ② nucleus: groove, crack, rotation, quadrants (示意 geometry; CARD.md 白內障 ②)
  // The lens content (cortex + nucleus) has its own frame: it turns by nuc.rot degrees about the lens axis (+ = clockwise in the microscope view =
  // toward higher clock hours). In that frame, in order: groove (axis along clock h through the centre), crack along it, groove2 and crack2 at
  // h + 3 (after a 90° turn they are sculpted in the same 12–6 line). A point is mapped back through the cracks (the two halves were pushed apart:
  // a squeeze that moves the centre by sep/2 and leaves the equator in place) to the rest lens, minus the groove cavities and the crack gaps.
  // Quadrants (after both cracks): quadrant q is the one centred at clock h + 1.5 + 3q (content frame); pull 0→1 lifts its apex to the axis in the
  // iris plane and tilts it (the outer edge stays in the bag); eat 0→1 consumes it from the apex (sphere around the phaco mouth).
  const rotH = (x, y, deg) => { const a = deg * D2R, ca = Math.cos(a), sa = Math.sin(a); return [x * ca + y * sa, y * ca - x * sa]; };   // + deg: toward higher clock hours
  function grooveGeo(c, gr) {
    const u = cd(gr.h), v = latDir(gr.h), hw = gr.w / 2, rc = c.ccc ? c.ccc.r : CN.cccD / 2, Rlim = rc - CN.groove.margin;
    const Lh = Math.min((gr.len ?? 2 * Rlim) / 2, Rlim), dep = clamp(gr.dep, 0, 1), over = clamp(gr.over || 0, 0, 1);
    const zPlate = LENS.zp + CN.groove.plate, zf0 = over > 0 ? lerp(zPlate, LENS.zp - CN.groove.past, over) : lerp(LENS.za, zPlate, dep), k = over > 0 ? 1 : dep;
    const zfb = a => zf0 + lerp(LENS.zAnt(Math.abs(a)) - LENS.za, LENS.zPost(Math.abs(a)) - LENS.zp, k);   // shallow: follows the front; deep: the back
    // the phaco sculpts from the main incision: a straight needle (and its sleeve behind it) pivoting in the tunnel cannot go deeper toward the incision
    // than its own line through the deepest stroke point tipA (distal). The proximal floor is that line's underside (a ramp) — the groove is what the
    // instrument swept. Applies when the groove pointed at the main incision when it was sculpted (rotAt: the nucleus rotation then).
    const P = CN.phaco, tn = tunnelOf(c.main || CN.main), mh = cd(tn.h), ue = rotH(u[0], u[1], gr.rotAt ?? 0), al = ue[0] * mh[0] + ue[1] * mh[1];
    const prox = al > 0.9 ? 1 : al < -0.9 ? -1 : 0, on = dep > 0 || over > 0;
    let ramp = () => -1e9, tipA = 0, tipZ = zfb(0) + P.needleOD / 2;
    if (prox && on) { tipA = gr.tipA ?? -prox * Math.max(0, Lh - 0.3); tipZ = zfb(tipA) + P.needleOD / 2 + 0.02;
      const pv = tn.at(P.pivotF), ap = prox * pv[0], tg = (pv[1] - tipZ) / (ap - tipA), cth = 1 / Math.sqrt(1 + tg * tg);
      ramp = a => (a - tipA) * prox <= 0 ? -1e9 : tipZ + (a - tipA) * tg - (P.needleOD / 2) / cth; }
    const zf = a => Math.max(zfb(a), ramp(a));
    const tf = Math.tan(CN.groove.flare * D2R);
    const field = (x, y, z) => { if (!on) return 1; const a = x * u[0] + y * u[1], b = x * v[0] + y * v[1], h = z - zf(a), ab = Math.abs(b);
      const U = h >= hw ? ab - (hw + (h - hw) * tf) : Math.hypot(b, h - hw) - hw;
      return Math.max(U, Math.abs(a) - Lh, Math.hypot(x, y) - Rlim); };
    const halfTop = a => hw + Math.max(0, LENS.zAnt(Math.abs(a)) - zf(a) - hw) * tf;   // half-width where the groove meets the lens surface
    const remAt = a => zf(a) - LENS.zPost(Math.abs(a));
    // the thinnest plate left under the floor (floor → outer surface of the posterior capsule) and where it is
    let rem = 1e9, aMin = 0; for (let i = 0; i <= 200; i++) { const a = -Lh + 2 * Lh * i / 200, r = remAt(a); if (r < rem) { rem = r; aMin = a; } }
    return { h: gr.h, u, v, hw, Lh, Rlim, zf0: zf(0), zfb, zf, field, halfTop, dep, over, on, prox, tipA, tipZ, rem, aMin, remAt };
  }
  // how far a crack has gone: down through the posterior plate (0→1), then out along the groove line to the nucleus edge (0→1)
  const crackExt = prog => ({ down: ss(0, CN.crack.down, prog), out: ss(CN.crack.down, 1, prog) });
  const NUCR = () => LENS.Req * CN.nucK[0];
  // ② eye-frame 3D point in groove k (1 or 2): a along its axis (mm, + toward its h), b across, hz above the floor (mm)
  const groovePt = (st, k, a, b = 0, hz = 0) => { const c = st.cat ? norm(st) : st, NU = nucOf(c), Gg = k === 2 ? NU.g2 : NU.g1, S = lensShift(c);
    const x = Gg.u[0] * a + Gg.v[0] * b, y = Gg.u[1] * a + Gg.v[1] * b, f = NU.fwd(x, y, Gg.zf(a), k === 2 ? 2 : 0), e = NU.toEye(f[0], f[1]);
    return [e[0] + S.LO[0], e[1] + S.LO[1], Gg.zf(a) + hz + liftZ(c, Math.hypot(e[0], e[1])) + S.LO[2]]; };
  // ② where the occluded phaco mouth is when quadrant q is pulled (eye 3D): its apex, in the iris plane at the centre (safe zone)
  const quadTip = (st, q) => { const c = st.cat ? norm(st) : st, NU = nucOf(c), Q = NU.QD.find(e => e.q === q), S = lensShift(c), e = NU.toEye(Q.An[0], Q.An[1]);
    return [e[0] + S.LO[0], e[1] + S.LO[1], Q.An[2] + liftZ(c, 0) + S.LO[2]]; };
  // ② the phaco needle's centre at the deepest stroke point of groove k (its swept ramp is cut for exactly this pose)
  const grooveTip = (st, k = 1) => { const c = st.cat ? norm(st) : st, NU = nucOf(c), Gg = k === 2 ? NU.g2 : NU.g1; return groovePt(c, k, Gg.tipA, 0, Gg.tipZ - Gg.zf(Gg.tipA)); };
  function nucOf(c) {
    const n = c.nuc; if (!n || !n.groove) return null;
    const h1 = n.groove.h, g1 = grooveGeo(c, n.groove), g2 = n.groove2 ? grooveGeo(c, Object.assign({ rotAt: 90 }, n.groove2, { h: wrapH(h1 + 3) })) : null, ops = [{ t: 'g', G: g1 }];
    const crackOp = (cr, h) => { const done = cr.prog >= 1; return { t: 'c', h, u: cd(h), v: latDir(h), prog: cr.prog, s: done ? Math.max(0, cr.sep) : 0, ext: crackExt(cr.prog) }; };
    if (n.crack) ops.push(crackOp(n.crack, h1));
    if (g2) ops.push({ t: 'g', G: g2 });
    if (n.crack2) ops.push(crackOp(n.crack2, wrapH(h1 + 3)));
    const R2 = LENS.Req * LENS.Req;
    // current content point → rest point; returns the largest removal value met (> 0: removed by a groove or inside a crack gap)
    const back = (x, y, z) => { let cav = -1e9;
      for (let k = ops.length - 1; k >= 0; k--) { const op = ops[k];
        if (op.t === 'c') { if (!(op.s > 0)) continue; const b = x * op.v[0] + y * op.v[1], ab = Math.abs(b), s2 = op.s / 2;
          if (ab < s2) cav = Math.max(cav, s2 - ab);
          const br = ab >= LENS.Req ? ab : ab <= s2 ? 0 : (R2 / op.s) * (1 - Math.sqrt(Math.max(0, 1 - 2 * op.s * (ab - s2) / R2)));
          const db = (b < 0 ? -1 : 1) * br - b; x += op.v[0] * db; y += op.v[1] * db; }
        else cav = Math.max(cav, -op.G.field(x, y, z)); }
      return { x, y, z, cav }; };
    // rest → current through the cracks (forward squeeze), for anchors and the microscope drawing
    const fwd = (x, y, z, from = 0) => { for (let k = from; k < ops.length; k++) { const op = ops[k]; if (op.t !== 'c' || !(op.s > 0)) continue; const b = x * op.v[0] + y * op.v[1], ab = Math.abs(b);
        if (ab < LENS.Req) { const bm = ab + op.s / 2 * (1 - ab * ab / R2), db = (b < 0 ? -1 : 1) * bm - b; x += op.v[0] * db; y += op.v[1] * db; } }
      return [x, y, z]; };
    const base = (x, y, z) => { const r = Math.hypot(x, y);
      return { lens: LENS.g(r, z), nuc: (Math.hypot(r / (LENS.Req * CN.nucK[0]), (z - LENS.zMid - 0.15) / (LENS.T * CN.nucK[1] / 2)) - 1) * 1.5 }; };
    const content = (x, y, z) => { const q = back(x, y, z), b0 = base(q.x, q.y, q.z); return { lens: Math.max(b0.lens, q.cav), nuc: Math.max(b0.nuc, q.cav), rest: q }; };
    // quadrants (after crack2): centre clock, the two crack normals, apex (current content frame), pull/eat transform
    const both = n.crack && n.crack2 && n.crack.prog >= 1 && n.crack2.prog >= 1;
    const QD = both ? [0, 1, 2, 3].map(q => { const hq = wrapH(h1 + 1.5 + 3 * q), dq = cd(hq), v1 = latDir(h1), v2 = latDir(wrapH(h1 + 3));
      const s1 = Math.sign(dq[0] * v1[0] + dq[1] * v1[1]), s2 = Math.sign(dq[0] * v2[0] + dq[1] * v2[1]), A0 = fwd(s1 * 1e-6 * v1[0] + s2 * 1e-6 * v2[0], s1 * 1e-6 * v1[1] + s2 * 1e-6 * v2[1], LENS.zMid + 0.15);
      const st = n.quads.find(e => e.q === q) || { pull: 0, eat: 0 }, p = clamp(st.pull, 0, 1), th = p * CN.quad.tilt * D2R;
      const T = [0, 0, LENS.za - CN.quad.below], An = [lerp(A0[0], T[0], p), lerp(A0[1], T[1], p), lerp(A0[2], T[2], p)];
      const feed = clamp(st.eat, 0, 1) * (NUCR() + 0.3), cs = Math.cos(th), sn = Math.sin(th);   // eat: the piece is fed into the mouth at An (what crosses the mouth plane is gone)
      // rotation in the (dq, z) plane about the apex: the outer part goes down relative to the apex (it stays in the bag while the apex comes up)
      const toRest = (x, y, z) => { const w = [x - An[0], y - An[1], z - An[2]], sd = w[0] * dq[0] + w[1] * dq[1], se = -w[0] * dq[1] + w[1] * dq[0];
        const sd0 = sd * cs - w[2] * sn, sz0 = sd * sn + w[2] * cs; return [A0[0] + sd0 * dq[0] - se * dq[1], A0[1] + sd0 * dq[1] + se * dq[0], A0[2] + sz0]; };
      const toNow = (x, y, z) => { const w = [x - A0[0], y - A0[1], z - A0[2]], sd = w[0] * dq[0] + w[1] * dq[1], se = -w[0] * dq[1] + w[1] * dq[0];
        const sd1 = sd * cs + w[2] * sn, sz1 = -sd * sn + w[2] * cs; return [An[0] + sd1 * dq[0] - se * dq[1], An[1] + sd1 * dq[1] + se * dq[0], An[2] + sz1]; };
      const moved = p > 0 || st.eat > 0, gone = st.eat >= 1;
      return { q, hq, dq, s1, s2, v1, v2, A0, An, p, th, feed, toRest, toNow, moved, gone, wedge: (xr, yr) => Math.max(-s1 * (xr * v1[0] + yr * v1[1]), -s2 * (xr * v2[0] + yr * v2[1])) }; }) : null;
    const anyMoved = QD && QD.some(Q => Q.moved);
    // the lens content at a current point of the content frame (z lens-local). A moved quadrant is its NUCLEUS (the cortex shell stays in the bag,
    // to be aspirated later): its rest place loses the nucleus, and the piece is drawn where it is now, minus what the phaco has consumed.
    const at = (x, y, z) => {
      const r = content(x, y, z), bag = LENS.g(Math.hypot(x, y), z);   // pushed-apart halves stay inside the capsular bag
      r.lens = Math.max(r.lens, bag); r.nuc = Math.max(r.nuc, bag);
      if (!anyMoved) return { lens: r.lens, nuc: r.nuc };
      let gone = 1e9; for (const Q of QD) if (Q.moved) gone = Math.min(gone, Math.max(r.nuc, Q.wedge(r.rest.x, r.rest.y)));
      let lens = Math.max(r.lens, -gone), nuc = Math.max(r.nuc, -gone);
      for (const Q of QD) { if (!Q.moved || Q.gone) continue; const p = Q.toRest(x + Q.dq[0] * Q.feed, y + Q.dq[1] * Q.feed, z), q = content(p[0], p[1], p[2]);
        const e = Q.feed > 0 ? -((x - Q.An[0]) * Q.dq[0] + (y - Q.An[1]) * Q.dq[1]) : -1e9, f = Math.max(q.nuc, Q.wedge(q.rest.x, q.rest.y), e);
        lens = Math.min(lens, f); nuc = Math.min(nuc, f); }
      return { lens, nuc }; };
    return { n, h1, g1, g2, ops, back, fwd, content, at, QD, both, rot: n.rot, overG: [g1, g2].find(g => g && g.over > 0) || null,
      toContent: (x, y) => rotH(x, y, -n.rot), toEye: (x, y) => rotH(x, y, n.rot) };
  }

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
    const piv = tn.to3(inst.kind === 'phaco' ? tn.at(CN.phaco.pivotF) : tn.pivot);
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
    if (inst.kind === 'phaco') {
      // ② phaco handpiece: straight needle (bevel at the tip), silicone sleeve ending needleL behind the tip with two irrigation ports on its sides
      // (示意 sizes, CARD.md). The sleeve's own diameter holds the incision open (the slit wraps round it); straight shaft through the tunnel pivot.
      const P = CN.phaco, axis = unit(sub(piv, tip)), rn = P.needleOD / 2, rs = P.sleeveOD / 2, sEnd = add(tip, axis, P.needleL);
      const a = cd(tn.h), rTip = tip[0] * a[0] + tip[1] * a[1], kR = axis[0] * a[0] + axis[1] * a[1];
      const tIn = (tn.int[0] - rTip) / (kR || 1e-9), tOut = (tn.ext[0] - rTip) / (kR || 1e-9);
      const lat = [-axis[1], axis[0], 0], latU = unit(len(lat) > 1e-9 ? lat : [1, 0, 0]);
      const ports = [1, -1].map(sg => add(add(sEnd, axis, P.portBack), latU, sg * rs));
      const occl = inst.occl ?? 0, bevel = inst.bevel ?? 'up';
      return { kind: 'phaco', via, tn, tip, axis, rn, rs, rr: rs, sEnd, ports, lat: latU, occl, bevel, tIn, tOut, pivot: piv,
        segs: [{ a: tip, b: sEnd, r: rn }, { a: sEnd, b: add(tip, axis, 30), r: rs }] };
    }
    if (inst.kind === 'chopper') {
      // ② chopper / second instrument through the side port: the bent tip (tipL, 示意) points down at the capsule; the shaft runs to the side port
      const P = CN.chopper, dn = inst.tipDir ? unit(inst.tipDir) : [0, 0, -1], bend = add(tip, dn, -P.tipL), axis = unit(sub(piv, bend));
      return { kind: 'chopper', via, tn, tip, bend, axis, rr: P.d / 2, pivot: piv, segs: [{ a: tip, b: bend, r: P.d * 0.35 }, { a: bend, b: add(bend, axis, 30), r: P.d / 2 }] };
    }
    if (inst.bend) {
      // ② hydrodissection cannula: angled distal part (bend mm, ang° below the shaft's horizontal heading; 示意) so the tip slips under the rhexis rim
      const L = inst.bend === true ? CN.hcannula.bend : inst.bend, b0 = CN.hcannula.ang * D2R, h0 = u2([piv[0] - tip[0], piv[1] - tip[1]]);
      const bend = add(tip, [h0[0] * Math.cos(b0), h0[1] * Math.cos(b0), Math.sin(b0)], L), axis = unit(sub(piv, bend));
      return { kind: 'cannula', via, tn, tip, bend, axis, segs: [{ a: tip, b: bend, r: r27 }, { a: bend, b: add(bend, axis, 30), r: r27 }] };
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
      // ② bend mode (phaco sleeve, chopper): the tunnel follows the straight instrument (the corneal wall bends with it, fading away from the tunnel),
      // and the slit gapes by the instrument's own half-thickness. The ① instruments keep the open-only mode below.
      const bendMode = g.kind === 'phaco' || g.kind === 'chopper';
      const rr = bendMode ? g.rr + 0.01 : (g.kind === 'forceps' ? 0.16 : CN.gauge27 / 2) + 0.01;   // what lies in the tunnel: the two arms, or a 27G shaft (+ 10 µm)
      const P = tn.pts, rOut = P[0][0], rIn = P[P.length - 1][0];
      const zTun = r => { r = clamp(r, rIn, rOut); for (let i = 1; i < P.length; i++) if ((P[i - 1][0] - r) * (P[i][0] - r) <= 0) { const k = (r - P[i - 1][0]) / ((P[i][0] - P[i - 1][0]) || 1e-9); return lerp(P[i - 1][1], P[i][1], k); } return P[0][1]; };
      // bend shift m(r): instrument line − tunnel inside the tunnel, fading (Gaussian, 0.6 mm) beyond the openings, then smoothed (σ 0.25 mm)
      const mRaw = r => { if (!bendMode) return 0; if (r < rIn) return (zLine(rIn) - zTun(rIn)) * Math.exp(-(((rIn - r) / 0.6) ** 2)); if (r > rOut) return (zLine(rOut) - zTun(rOut)) * Math.exp(-(((r - rOut) / 0.6) ** 2)); return zLine(r) - zTun(r); };
      // how far the instrument's surface is past the (bent) tunnel, sampled every 0.01 mm of r (dense: an envelope of sparse samples ripples)
      const RS = []; for (let r = rIn; r <= rOut + 1e-9; r += 0.01) { const zt = zTun(r) + mRaw(r); RS.push([r, Math.max(0, zLine(r) + rr - zt), Math.min(0, zLine(r) - rr - zt)]); }
      // tables over r (0.004 mm): tunnel height, envelopes of the roof lift and the lip push
      const r0 = rIn - 1.6, r1 = rOut + 0.8, dr = 0.004, n = Math.ceil((r1 - r0) / dr) + 1, ZT = new Float64Array(n), UE = new Float64Array(n), DE = new Float64Array(n);
      for (let k = 0; k < n; k++) { const r = r0 + k * dr; ZT[k] = zTun(r); let u = 0, d = 0;
        for (const [ri, ui, di] of RS) { if (Math.abs(r - ri) > 1.2) continue; const w = Math.exp(-(((r - ri) / 0.35) ** 2)); if (ui * w > u) u = ui * w; if (di * w < d) d = di * w; }
        UE[k] = u; DE[k] = d; }
      const tab = (T, r) => { const x = clamp((r - r0) / dr, 0, n - 1), i = Math.min(n - 2, Math.floor(x)); return lerp(T[i], T[i + 1], x - i); };
      const maxUp = Math.max(...UE), maxDn = -Math.min(...DE);
      if (!bendMode) { const sv = Math.max(0.6, 1.25 * Math.max(maxUp, maxDn));
        out.push({ cfg, tn, a, l: latDir(cfg.h), zLine, rr, rIn, rOut, r0, r1, sv, maxUp, maxDn, zt: r => tab(ZT, r), ue: r => tab(UE, r), de: r => tab(DE, r),
          fold: clamp(c.folds || 0, 0, 1) * Math.min(FOLD.max, FOLD.k * -tab(DE, rIn + 0.05)), g });
        continue; }
      // bend table (smoothed) and the decay lengths that keep the map monotonic in height (bend σb ≥ 3|m|, gape σv ≥ 3 × the gape)
      const MR = new Float64Array(n), MB = new Float64Array(n); for (let k = 0; k < n; k++) MR[k] = mRaw(r0 + k * dr);
      const ks = Math.ceil(0.75 / dr); for (let k = 0; k < n; k++) { let s = 0, w = 0; for (let j = -ks; j <= ks; j++) { const i = clamp(k + j, 0, n - 1), e = Math.exp(-(((j * dr) / 0.25) ** 2)); s += MR[i] * e; w += e; } MB[k] = s / w; }
      const mMax = Math.max(...MB.map(Math.abs)), sv = Math.max(0.6, 3 * Math.max(maxUp, maxDn)), sb = Math.max(1.0, 3 * mMax);
      out.push({ bend: true, cfg, tn, a, l: latDir(cfg.h), zLine, rr, rIn, rOut, r0, r1, sv, sb, mMax, maxUp, maxDn, zt: r => tab(ZT, r), ue: r => tab(UE, r), de: r => tab(DE, r), mb: r => tab(MB, r),
        fold: clamp(c.folds || 0, 0, 1) * Math.min(FOLD.max, FOLD.k * -tab(DE, rIn + 0.05)), g });
    }
    if (!out.length) return null;
    // forward vertical move of tissue at height h above (h > 0) or below (h < 0) the tunnel; inverted by Newton (the map is monotonic in h)
    const fwd = (D, mv, h) => mv * Math.exp(-((h / D.sv) ** 2));
    const solve = (D, mv, dz, sg) => { let h = Math.max(0, sg * (dz - mv)) * sg;                    // dz = z − zt (moved), h = z0 − zt (rest), sg = side
      for (let it = 0; it < 12; it++) { const e = Math.exp(-((h / D.sv) ** 2)), F = h + mv * e - dz, dF = 1 - mv * e * 2 * h / (D.sv * D.sv); h -= F / dF; if (sg * h < 0) h = 0; }
      return h; };
    // bend mode: rest height h → moved h + m·e_b(h) + mv·e_v(h); Newton on the sum (monotonic by the choice of σb, σv)
    const fwdB = (D, m, mv, h) => h + m * Math.exp(-((h / D.sb) ** 2)) + mv * Math.exp(-((h / D.sv) ** 2));
    const solveB = (D, m, mv, dz, sg) => { let h = Math.max(0, sg * (dz - m - mv)) * sg;
      for (let it = 0; it < 30; it++) { const eb = Math.exp(-((h / D.sb) ** 2)), ev = Math.exp(-((h / D.sv) ** 2)), F = h + m * eb + mv * ev - dz;
        const dF = 1 - m * eb * 2 * h / (D.sb * D.sb) - mv * ev * 2 * h / (D.sv * D.sv); const hn = h - F / dF; h = sg * hn < 0 ? h / 2 : hn; if (Math.abs(F) < 1e-10) break; }
      return h; };
    // Descemet folds (示意): the deep cornea central to the inner opening ripples (zero at the opening and FOLD.reach mm central to it), fading toward
    // the anterior stroma; continuous across the back surface (the chamber just behind it follows, fading over 0.4 mm)
    const foldAt = (D, r, z0) => { const x = D.rIn - r; if (!(D.fold > 0.002) || x <= 0 || x >= FOLD.reach) return 0;
      const W = G.wallOf(z0, r), T = G.T(W.s), w = W.d <= T ? ss(0.35, 0.95, W.d / T) : Math.max(0, 1 - (W.d - T) / 0.4);
      return w > 0 ? D.fold * Math.sin(2 * Math.PI * x / FOLD.lam) * Math.sin(Math.PI * x / FOLD.reach) * w : 0; };
    // forward map of a rest point (r, z0) in the incision's meridian (lateral offset 0): where it is drawn (labels, checks)
    for (const D of out) D.fwd = D.bend ? (r, z0) => { const zt = D.zt(r), h = z0 - zt; return zt + fwdB(D, D.mb(r), h >= 0 ? D.ue(r) : D.de(r), h) + foldAt(D, r, z0); }
      : (r, z0) => { const zt = D.zt(r), h = z0 - zt; return z0 + fwd(D, h >= 0 ? D.ue(r) : D.de(r), h) + foldAt(D, r, z0); };
    const map = p => { let q = p, gap = -1, bend = false;
      for (const D of out) { const r = p[0] * D.a[0] + p[1] * D.a[1], cc = p[0] * D.l[0] + p[1] * D.l[1], z = p[2];
        if (r < D.r0 || r > D.r1 || Math.abs(cc) > D.cfg.w / 2 + 0.5) continue;
        if (D.bend) { const zt = D.zt(r), lw = 1 - ss(D.cfg.w / 2, D.cfg.w / 2 + 0.5, Math.abs(cc)), m = D.mb(r) * lw;
          if (Math.abs(z - zt - m) > Math.max(3.5, 2.6 * D.sb)) continue;
          const U = D.ue(r) * lw, Dd = D.de(r) * lw, dz = z - zt, dm = dz - m;
          gap = Math.max(gap, Math.min(dm - Dd, U - dm, r - D.rIn, D.rOut - r, D.cfg.w / 2 - Math.abs(cc)));
          const back = e => { const d = dz - e; return d - m >= U ? solveB(D, m, U, d, 1) : d - m <= Dd ? solveB(D, m, Dd, d, -1) : 0; };
          let h = back(0), z0 = zt + h;
          for (let it = 0, e = foldAt(D, r, z0); e && it < 4; it++) { h = back(e); z0 = zt + h; e = foldAt(D, r, z0); }
          q = [r * D.a[0] + cc * D.l[0], r * D.a[1] + cc * D.l[1], z0]; bend = true; continue; }
        const zt = D.zt(r); if (Math.abs(z - zt) > 2.5) continue;
        const lw = 1 - ss(D.cfg.w / 2, D.cfg.w / 2 + 0.5, Math.abs(cc)), U = D.ue(r) * lw, Dd = D.de(r) * lw, dz = z - zt;
        // the gaping tunnel (and the instrument in it): positive between the moved roof and lip, inside the incision; continuous on both sides
        gap = Math.max(gap, Math.min(dz - Dd, U - dz, r - D.rIn, D.rOut - r, D.cfg.w / 2 - Math.abs(cc)));
        // where this tissue was before it was lifted (roof) / pushed (lip), and before the small ripple of the folds (fixed point on the ripple)
        const back = e => { const d = dz - e; return d >= U ? solve(D, U, d, 1) : d <= Dd ? solve(D, Dd, d, -1) : 0; };
        let h = back(0), z0 = zt + h;
        for (let it = 0, e = foldAt(D, r, z0); e && it < 4; it++) { h = back(e); z0 = zt + h; e = foldAt(D, r, z0); }
        q = [r * D.a[0] + cc * D.l[0], r * D.a[1] + cc * D.l[1], z0]; }
      return bend ? { q, gap, bend } : { q, gap }; };
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
  const C = Object.assign({}, G.C, { cortex: '#f4efe0', cortexS: '#bfb08a', nuc: '#e6c983', nucS: '#c8a457', cap: '#2f78b7', zon: '#b39a6a', ovd: '#9cc6ee', tunnel: '#3c4a57', metal: '#c3cad2', metalD: '#8e98a3', metalS: '#4c5560', bss: '#c9ecfb', bssS: '#2a8fc7', sleeve: '#dfe7ec' });
  const SEC = new Map();
  // per-point tissue values (negative inside), shared by the section and the checks
  const LAYERS = ['interior', 'aqueous', 'ovd', 'lens', 'nuc', 'retina', 'choroid', 'ciliary', 'iris', 'sclera', 'limbus', 'cornea', 'conj'];
  const fieldCtx = (c, def) => ({ c, fd: G.makeField({}), I: irisOf(c), S: lensShift(c), ovdC: c.ovdAt || [0, 0, LENS.za + 0.9], ovdR: 9.5 * clamp(c.ovd, 0, 1), def, N: nucOf(c) });
  function fieldAt(X, p0) {
    let p = p0, gap = -1, bend = false; if (X.def) { const w = X.def(p0); p = w.q; gap = w.gap; bend = !!w.bend; }
    // ② bend mode moves only the wall (cornea, limbus): lens, iris and chamber contents are taken at the unmoved point
    const pin = bend ? p0 : p;
    const { fd, I, S } = X, W = fd.wall(p), m = W.m, mi = bend ? fd.wall(p0).m : m, lr = Math.hypot(pin[0] - S.LO[0], pin[1] - S.LO[1]), lz = pin[2] - S.LO[2] - liftZ(X.c, lr), o = {};
    let lensG, nucG; const above = lr < LENS.Req ? lz - LENS.zAnt(lr) : lz - LENS.zc;
    if (X.N) { const q = X.N.toContent(pin[0] - S.LO[0], pin[1] - S.LO[1]), r = X.N.at(q[0], q[1], lz); lensG = r.lens; nucG = r.nuc; }   // ② grooves, cracks, quadrants
    else {
      lensG = LENS.g(lr, lz);
      // where the anterior capsule is gone, the cortex surface is the capsule's inner surface (one capsule thickness lower)
      if (X.c.ccc && Math.abs(lensG) < 0.05 && lz > LENS.zc && bare(X.c.ccc, lr, G.clockOf(p[0] - S.LO[0], p[1] - S.LO[1]))) lensG += capT(sAt(lr)); }
    o.interior = fd.g.interior(W);
    o.aqueous = Math.max(o.interior, Math.min(-above, lr < LENS.Req && lz > LENS.zc ? -lensG : 1), -lensG);   // −lensG: ends exactly where the lens begins   // in front of the lens (incl. where the capsule is gone)
    if (X.N) o.aqueous = Math.min(o.aqueous, Math.max(LENS.g(lr, lz), -lensG));   // ② the emptied part of the capsular bag holds chamber fluid (BSS)
    if (X.def) o.aqueous = Math.min(o.aqueous, -gap);              // the gaping tunnel is open to the chamber: chamber fluid (and OVD) fills it
    o.ovd = X.ovdR > 0 ? Math.max(o.aqueous, Math.hypot(pin[0] - X.ovdC[0], pin[1] - X.ovdC[1], pin[2] - X.ovdC[2]) - X.ovdR, mi.rho > I.pm[1] ? irisZ(I, mi.rho) - mi.z : -1) : 1;   // anterior chamber only
    o.lens = lensG; o.nuc = X.N ? nucG : (Math.hypot(lr / (LENS.Req * CN.nucK[0]), (lz - LENS.zMid - 0.15) / (LENS.T * CN.nucK[1] / 2)) - 1) * 1.5;
    o.retina = fd.g.retina(W); o.choroid = fd.g.choroid(W); o.ciliary = fd.g.ciliary(W);
    if (mi.rho < 2 || mi.rho > I.root[1] + 0.8 || mi.z < I.root[0] - 0.9 || mi.z > I.pm[0] + 1.2) o.iris = 1;
    else { const [d, t] = distPoly([mi.z, mi.rho], I.L); o.iris = d - I.th(t) / 2; }
    const cut = gap;                                                // > 0 inside the gaping tunnel: no wall tissue there (a signed field: smooth outline)
    o.sclera = Math.max(fd.g.sclera(W), cut); o.limbus = Math.max(fd.g.limbus(W), cut); o.cornea = Math.max(fd.g.cornea(W), cut); o.conj = Math.max(fd.g.conj(W), cut);
    return o;
  }
  const layersAt = (st, p) => { const c = norm(st); return fieldAt(fieldCtx(c, deformer(c)), p); };
  const layersFn = st => { const c = norm(st), X = fieldCtx(c, deformer(c)); return p => fieldAt(X, p); };   // many points of one state (checks)
  function sectionTissue(c, hp, win, step, def, off = 0) {
    const pl = off ? G.planes.meridian(hp, off) : G.planes.meridian(hp), X = fieldCtx(c, def);
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
    const S = lensShift(c), U = pl.U, nrm = [U[1], -U[0]], LX = S.LO[0] - pl.O[0], LY = S.LO[1] - pl.O[1], e = LX * nrm[0] + LY * nrm[1], uc = LX * U[0] + LY * U[1], runs = [];
    // ② fluid under the capsule (hydrodissection wave, capsular-block pocket) and an over-deep groove through the posterior capsule
    const H = hydroOf(c), N = nucOf(c), OG = N && N.overG, fl = [], fronts = [];
    for (const sg of [1, -1]) {
      let run = [], band = [], frun = [], prevF = null;
      const flush = () => { if (run.length > 1) runs.push({ pts: run, band }); run = []; band = []; };
      const fflush = () => { if (frun.length > 1) fl.push(frun); frun = []; };
      for (let i = 0; i < LENS.P.length; i++) { const [r, z] = LENS.P[i]; if (r < Math.abs(e) + 1e-6) { if (i > LENS.iEq) flush(); continue; }
        const along = sg * Math.sqrt(r * r - e * e), x = U[0] * along + nrm[0] * e, y = U[1] * along + nrm[1] * e, h = hOf(x, y) || 12;
        const ant = i <= LENS.iEq, xr = U[0] * along - nrm[0] * e, yr = U[1] * along - nrm[1] * e;   // ② the point's true lens-local position (also off the axis plane)
        let gone = ant && bare(c.ccc, r, h);
        if (OG && !ant) { const q = N.toContent(xr, yr); if (OG.field(q[0], q[1], z) < 0 || OG.field(q[0], q[1], z - 0.004) < 0) gone = true; }
        if (gone) { flush(); fflush(); continue; }
        const zz = z + (ant ? striae(c, x, y) : 0) + liftZ(c, r), u = uc + along, t = capT(LENS.S[i]), nn = LENS.N[i];
        const f = H ? H.thick(i, H.phiOf(xr, yr)) : 0;
        if (f > 0) { run.push([u + sg * nn[0] * f, -(zz + nn[1] * f)]); band.push([u + sg * nn[0] * (f - t), -(zz + nn[1] * (f - t))]); frun.push([[u, -zz], [u + sg * nn[0] * f, -(zz + nn[1] * f)], i, f]); }
        else { run.push([u, -zz]); band.push([u - sg * nn[0] * t, -(zz - nn[1] * t)]); fflush(); }
        // the wave front on the posterior capsule: where the fluid ends going from the equator toward the pole
        if (H && !ant && prevF !== null && (prevF > 0) !== (H.wave(i, H.phiOf(xr, yr)) > 0)) fronts.push({ sg, p: [u, -zz], i });
        if (H && !ant) prevF = H.wave(i, H.phiOf(xr, yr));
        if (i === LENS.P.length - 1) { flush(); fflush(); } }
      flush(); fflush();
    }
    if (H || OG) { runs.fluid = fl; runs.fronts = fronts; }
    return runs;
  }
  function section(opt) {
    const st = opt.st || {}, c = norm(st), hp = opt.h ?? 6, win = opt.win, step = opt.step || 0.03, id = opt.id || 'cs', off = opt.off || 0;
    const def = deformer(c), key = JSON.stringify([hp, win, step, c.pupil, c.ovd, c.ovdAt, c.zonule, c.ccc && lensShift(c).LO, def ? c.inst : null, c.main, c.side, c.push, c.folds, c.hydro, c.nuc, c.surge, off]);
    let tis = SEC.get(key); if (!tis) { tis = sectionTissue(c, hp, win, step, def, off); if (SEC.size > 40) SEC.delete(SEC.keys().next().value); SEC.set(key, tis); }
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
    if (runs.fluid) o.push(sectionFluid(c, runs, P2, A));      // ② BSS under the capsule (wave, pocket) and its release
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
    // ② nucleus: crack lines in this plane, groove floor and remaining plate, quadrant apex
    const NU = nucOf(c); if (NU) o.push(sectionNuc(c, NU, pl, P2, A));
    // instruments, projected onto the plane (true size)
    (c.inst || []).forEach((inst, i) => { const g = instGeom(c, inst); o.push(opt.cut ? drawInstCut(g, P2, pl) : drawInstSec(g, P2, pl)); A['tip' + i] = P2(g.tip); A['inst' + i] = g; });
    // pupil margins
    const I = irisOf(c); for (const sg of [1, -1]) { const h = wrapH(hp + (sg > 0 ? 0 : 6)), a = cd(h); A['pm' + (sg > 0 ? '+' : '-')] = P2([I.pm[1] * a[0], I.pm[1] * a[1], I.pm[0]]); }
    A.antPole = P2(add([0, 0, LENS.za + liftZ(c, 0)], lensShift(c).LO)); A.postPole = P2(add([0, 0, LENS.zp + liftZ(c, 0)], lensShift(c).LO));
    return { svg: o.join(''), A, pl, outline: tis.outline };
  }
  // ② BSS under the capsule in a meridional section: the band between the lens surface and the pushed-out capsule; arrows when the centre is pressed
  function sectionFluid(c, runs, P2, A) {
    const o = [], H = hydroOf(c);
    for (const fr of runs.fluid) { const inn = fr.map(q => q[0]), out = fr.map(q => q[1]);
      o.push(`<path d="M${inn.map(F).join('L')}L${out.slice().reverse().map(F).join('L')}Z" fill="${C.bss}"/><path d="M${inn.map(F).join('L')}" fill="none" stroke="${C.bssS}" stroke-width="0.6" opacity="0.8" ${NS}/>`); }
    A.fluidRuns = runs.fluid; A.waveFronts = runs.fronts;
    let best = null; for (const fr of runs.fluid) for (const q of fr) if (!best || q[3] > best[3]) best = q;
    if (best) A.fluidMax = [(best[0][0] + best[1][0]) / 2, (best[0][1] + best[1][1]) / 2], A.fluidMaxT = best[3];
    let eq = null; for (const fr of runs.fluid) for (const q of fr) if (!eq || Math.abs(q[0][0]) > Math.abs(eq[0][0])) eq = q;   // the band at the equator (label anchor)
    if (eq) A.fluidEq = [(eq[0][0] + eq[1][0]) / 2, (eq[0][1] + eq[1][1]) / 2];
    if (H && H.hy.press > 0 && H) {
      // released fluid (示意): round the equator, over the rhexis rim, out into the chamber — both sides
      const lift = liftZ(c, 0), S = lensShift(c), uc = 0, rc = H.rc, iRim = (() => { let k = 0; for (let i = 0; i <= LENS.iEq; i++) if (LENS.P[i][0] <= rc + 0.15) k = i; return k; })();
      for (const sg of [1, -1]) { const pts = [];
        for (let i = postIdx(2.2); i >= iRim; i -= 3) { const [r, z] = LENS.P[i], nn = LENS.N[i]; pts.push([uc + sg * (r + nn[0] * 0.09), -(z + nn[1] * 0.09 + lift)]); }
        const e0 = pts[pts.length - 1], e1 = [uc + sg * (rc - 0.35), -(LENS.zAnt(rc) + lift + 0.75)]; pts.push(e1);
        const d = u2([e1[0] - e0[0], e1[1] - e0[1]]), nn = [-d[1], d[0]], hd = 0.22;
        const head = [[e1[0] + d[0] * 0.05, e1[1] + d[1] * 0.05], [e1[0] - d[0] * hd + nn[0] * hd * 0.6, e1[1] - d[1] * hd + nn[1] * hd * 0.6], [e1[0] - d[0] * hd - nn[0] * hd * 0.6, e1[1] - d[1] * hd - nn[1] * hd * 0.6]];
        o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#fff" stroke-width="2.6" opacity="0.8" stroke-dasharray="4 2.5" ${NS}/><path d="M${pts.map(F).join('L')}" fill="none" stroke="${C.bssS}" stroke-width="1.3" stroke-dasharray="4 2.5" ${NS}/><path d="M${head.map(F).join('L')}Z" fill="${C.bssS}"/>`);
        A['release' + (sg > 0 ? '+' : '-')] = e1; }
    }
    return o.join('');
  }
  // ② nucleus in a section through the lens axis: crack lines (before the halves part), the groove floor and the plate left under it, quadrant apex
  function sectionNuc(c, NU, pl, P2, A) {
    const o = [], S = lensShift(c), lift = liftZ(c, 0), nrm = [pl.U[1], -pl.U[0]];
    const eye3 = (x, y, zl) => { const e = NU.toEye(x, y); return [e[0] + S.LO[0], e[1] + S.LO[1], zl + lift + S.LO[2]]; };
    for (const [k, Gg] of [['', NU.g1], ['2', NU.g2]]) { if (!Gg || !Gg.on) continue;
      const x = Gg.u[0] * Gg.aMin, y = Gg.u[1] * Gg.aMin, f = NU.fwd(x, y, Gg.zf(Gg.aMin), k ? 2 : 0);
      A['grooveFloor' + k] = P2(eye3(f[0], f[1], Gg.zf(Gg.aMin))); A['groovePost' + k] = P2(eye3(f[0], f[1], LENS.zPost(Math.abs(Gg.aMin)))); A['grooveRem' + k] = Gg.rem; A['grooveAMin' + k] = Gg.aMin; }
    for (const [k, Gg] of [['', NU.g1], ['2', NU.g2]]) { if (!Gg || !Gg.on) continue; const ue = NU.toEye(Gg.u[0], Gg.u[1]), dn = ue[0] * nrm[0] + ue[1] * nrm[1]; if (Math.abs(dn) < 0.2) continue;
      const as = ((pl.O[0] - S.LO[0]) * nrm[0] + (pl.O[1] - S.LO[1]) * nrm[1]) / dn; if (Math.abs(as) > Gg.Lh) continue;
      A['grooveX' + k] = { a: as, floor: P2(eye3(Gg.u[0] * as, Gg.u[1] * as, Gg.zf(as))), post: P2(eye3(Gg.u[0] * as, Gg.u[1] * as, LENS.zPost(Math.abs(as)))), rem: Gg.remAt(as), hw: Gg.hw }; }
    if (NU.overG) { const G0 = NU.overG, a = G0.aMin; A.breach = P2(eye3(G0.u[0] * a, G0.u[1] * a, LENS.zPost(Math.abs(a)))); }
    for (const op of NU.ops) { if (op.t !== 'c' || !(op.prog > 0) || op.s > 0) continue;
      const G0 = op.h === NU.h1 ? NU.g1 : NU.g2, ue = NU.toEye(op.u[0], op.u[1]), across = Math.abs(ue[0] * nrm[0] + ue[1] * nrm[1]);
      if (across > 0.2) {   // the crack plane crosses this section: a vertical line from the groove floor down through the plate, at a = as
        const as = ((pl.O[0] - S.LO[0]) * nrm[0] + (pl.O[1] - S.LO[1]) * nrm[1]) / (ue[0] * nrm[0] + ue[1] * nrm[1]), zt = G0.zf(as), zb = zt - op.ext.down * (zt - LENS.zPost(Math.abs(as)) - 0.02);
        const a = P2(eye3(op.u[0] * as, op.u[1] * as, zt)), b = P2(eye3(op.u[0] * as, op.u[1] * as, zb));
        o.push(`<path d="M${F(a)}L${F(b)}" stroke="#fff" stroke-width="3" opacity="0.8" ${NS}/><path d="M${F(a)}L${F(b)}" stroke="#4a1606" stroke-width="1.5" ${NS}/>`);
        A['crack' + (op.h === NU.h1 ? '' : '2')] = [a, b]; }
      else {                // the crack lies in this section: its outline (floor of the groove, down through the plate, out to the nucleus edge)
        const Rn = NUCR(), Le = G0.Lh + op.ext.out * (Rn - G0.Lh), pts = [], bot = [];
        for (let i = 0; i <= 40; i++) { const a = -Le + 2 * Le * i / 40, aa = Math.abs(a);
          const top = aa <= G0.Lh ? G0.zf(a) : LENS.zMid + 0.15 + (LENS.T * CN.nucK[1] / 2) * Math.sqrt(Math.max(0, 1 - (aa / Rn) ** 2));
          const btm = aa <= G0.Lh ? G0.zf(a) - op.ext.down * (G0.zf(a) - LENS.zPost(aa) - 0.02) : LENS.zMid + 0.15 - (LENS.T * CN.nucK[1] / 2) * Math.sqrt(Math.max(0, 1 - (aa / Rn) ** 2));
          pts.push(P2(eye3(op.u[0] * a, op.u[1] * a, top))); bot.push(P2(eye3(op.u[0] * a, op.u[1] * a, btm))); }
        o.push(`<path d="M${[...pts, ...bot.reverse()].map(F).join('L')}Z" fill="#4a1606" opacity="0.18" stroke="#4a1606" stroke-width="1" stroke-dasharray="3 2" ${NS}/>`); } }
    if (NU.QD) for (const Q of NU.QD) if (Q.moved && !Q.gone) A['quadApex' + Q.q] = P2(eye3(Q.An[0], Q.An[1], Q.An[2]));
    return o.join('');
  }
  // ② phaco handpiece in a section: silicone sleeve (with an irrigation port), metal needle with its bevel and lumen
  function drawPhacoSec(g, P2, seg) {
    const o = [], T0 = P2(g.tip), E = P2(g.sEnd), FAR = P2(add(g.tip, g.axis, 30)), d = u2([E[0] - T0[0], E[1] - T0[1]]), up = d[0] >= 0 ? [d[1], -d[0]] : [-d[1], d[0]];
    const nU = up[1] < 0 ? up : [-up[0], -up[1]], nB = g.bevel === 'down' ? [-nU[0], -nU[1]] : nU, rn = g.rn, tb = 2 * rn * Math.tan(CN.phaco.bevel * D2R), L = Math.hypot(E[0] - T0[0], E[1] - T0[1]) + 0.3;
    // needle: heel on the side away from the opening reaches the tip; the opening side is shorter by the bevel
    const P = (s, n) => [T0[0] + d[0] * s + nB[0] * n, T0[1] + d[1] * s + nB[1] * n];
    const poly = [P(0, -rn), P(L, -rn), P(L, rn), P(tb, rn)];
    o.push(`<path d="M${poly.map(F).join('L')}Z" fill="${C.metal}" stroke="${C.metalS}" stroke-width="0.9" stroke-linejoin="round" ${NS}/>`);
    o.push(`<path d="M${F(P(tb * 0.5, 0))}L${F(P(L, 0))}" stroke="#56606b" stroke-width="${(1.1 * rn).toFixed(3)}" opacity="0.55"/>`);   // lumen
    o.push(`<path d="M${F(P(0, -rn))}L${F(P(tb, rn))}" stroke="#2f3a44" stroke-width="1.2" ${NS}/>`);                                           // bevel face
    const S0 = [E[0] - d[0] * 0.02, E[1] - d[1] * 0.02];
    o.push(`<path d="M${F(S0)}L${F(FAR)}" stroke="#6f7f8b" stroke-width="${(2 * g.rs + 0.06).toFixed(3)}"/><path d="M${F(S0)}L${F(FAR)}" stroke="${C.sleeve}" stroke-width="${(2 * g.rs).toFixed(3)}"/>`);
    for (const pp of g.ports.slice(0, 1)) { const q = P2(pp); o.push(`<ellipse cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" rx="${(CN.phaco.portD / 2).toFixed(3)}" ry="${(CN.phaco.portD / 2).toFixed(3)}" fill="#33414c" opacity="0.85"/>`); }
    return o.join('');
  }
  // ② instruments in a plane that cuts across them: the cut (an ellipse) where a rod crosses the plane; a rod lying within its radius of the plane is drawn
  function drawInstCut(g, P2, pl) {
    const o = [], nrm = [pl.U[1], -pl.U[0], 0], sd = p => dot(sub(p, pl.O), nrm);
    const fill = (k, i) => g.kind === 'phaco' ? (i === 0 ? C.metal : C.sleeve) : C.metal;
    (g.segs || []).forEach((s, i) => { const da = sd(s.a), db = sd(s.b), r = s.r;
      if (Math.abs(da) <= r && Math.abs(db) <= r) { const A = P2(s.a), B = P2(s.b); o.push(`<path d="M${F(A)}L${F(B)}" stroke="${C.metalS}" stroke-width="${(2 * r + 0.05).toFixed(3)}" stroke-linecap="round"/><path d="M${F(A)}L${F(B)}" stroke="${fill(g.kind, i)}" stroke-width="${(2 * r).toFixed(3)}" stroke-linecap="round"/>`); return; }
      if (da * db > 0) return;
      const t = da / (da - db), q = add(s.a, sub(s.b, s.a), t), Q = P2(q), d3 = unit(sub(s.b, s.a)), cs = Math.abs(dot(d3, nrm)), ad = [d3[0] - nrm[0] * dot(d3, nrm), d3[1] - nrm[1] * dot(d3, nrm), d3[2]];
      const A2 = P2(add(q, ad, 1)), ang = Math.atan2(A2[1] - Q[1], A2[0] - Q[0]) * 180 / Math.PI, rx = r / Math.max(0.25, cs);
      o.push(`<ellipse cx="${Q[0].toFixed(4)}" cy="${Q[1].toFixed(4)}" rx="${rx.toFixed(4)}" ry="${r.toFixed(4)}" transform="rotate(${ang.toFixed(3)} ${Q[0].toFixed(4)} ${Q[1].toFixed(4)})" fill="${fill(g.kind, i)}" stroke="${C.metalS}" stroke-width="0.9" ${NS}/>`);
      if (g.kind === 'phaco' && i === 0) o.push(`<ellipse cx="${Q[0].toFixed(4)}" cy="${Q[1].toFixed(4)}" rx="${(rx * 0.62).toFixed(4)}" ry="${(r * 0.62).toFixed(4)}" transform="rotate(${ang.toFixed(3)} ${Q[0].toFixed(4)} ${Q[1].toFixed(4)})" fill="#56606b" opacity="0.6"/>`); });
    return o.join('');
  }
  function drawInstSec(g, P2, pl) {
    // a round rod: dark rim, metal, and a light streak along its upper third (reads as a shaft, not a flat bar)
    const o = [], seg = (a, b, r) => { const A = P2(a), B = P2(b), d = u2([B[0] - A[0], B[1] - A[1]]), n = d[0] >= 0 ? [d[1], -d[0]] : [-d[1], d[0]], hl = [n[0] * r * 0.38, n[1] * r * 0.38];
      return `<path d="M${F(A)}L${F(B)}" stroke="${C.metalS}" stroke-width="${(2 * r + 0.05).toFixed(3)}" stroke-linecap="round"/><path d="M${F(A)}L${F(B)}" stroke="${C.metal}" stroke-width="${(2 * r).toFixed(3)}" stroke-linecap="round"/>` +
        `<path d="M${F([A[0] + hl[0], A[1] + hl[1]])}L${F([B[0] + hl[0], B[1] + hl[1]])}" stroke="#f3f6f8" stroke-width="${(0.55 * r).toFixed(3)}" stroke-linecap="round" opacity="0.85"/>`; };
    if (g.kind === 'phaco') return drawPhacoSec(g, P2, seg);
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
    // ② hydrodissection wave and nucleus (groove, cracks, quadrants), seen through the pupil
    const HY = hydroOf(c); if (HY) L.push(enfaceHydro(c, HY, M, A));
    const NU = nucOf(c); if (NU) L.push(enfaceNuc(c, NU, M, A));
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
  // ② the fluid wave seen in the red reflex: the part of the posterior capsule the BSS has reached (faint) and its front (a bright moving line)
  const PIDX = (() => { const t = []; for (let k = 0; k <= Math.ceil(LENS.Req * 100); k++) t.push(postIdx(k / 100)); return r => t[clamp(Math.round(r * 100), 0, t.length - 1)]; })();
  function enfaceHydro(c, H, M, A) {
    const hy = H.hy; if (!(hy.prog > 0) || hy.press >= 1) return '';
    const S = lensShift(c), pr = c.pupil / 2 + 0.1, st = 0.04, n = Math.ceil(2 * pr / st) + 1, v = new Float64Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -pr + i * st, y = -pr + j * st, r = Math.hypot(x, y);
      v[j * n + i] = r >= LENS.Req - 0.01 ? 1 : H.tau(PIDX(r), H.phiOf(x, y)) - hy.prog; }
    const loops = G.contour(v, n, n, -pr, -pr, st), d = loops.map(l => 'M' + l.map(p => F(M([p[0] + S.LO[0], p[1] + S.LO[1], 0]))).join('L') + 'Z').join('');
    // the front on the injection meridian (radius where the arrival order equals prog), for labels and the cross-view check
    let rf = null; for (let r = LENS.Req - 0.01; r >= 0; r -= 0.005) if (H.tau(postIdx(r), 0) > hy.prog) { rf = r + 0.0025; break; }
    if (rf !== null) { const a = cd(hy.h); A.waveFront = M([rf * a[0] + S.LO[0], rf * a[1] + S.LO[1], 0]); A.waveFrontR = rf; } else A.waveFrontR = 0;
    const k = 1 - clamp(hy.press, 0, 1);
    return d ? `<path d="${d}" fill="#ffe6b8" opacity="${(0.24 * k).toFixed(3)}" fill-rule="evenodd"/><path d="${d}" fill="none" stroke="#5a1606" stroke-width="3.4" opacity="${(0.5 * k).toFixed(3)}" ${NS}/><path d="${d}" fill="none" stroke="#fff3cf" stroke-width="1.7" opacity="${(0.95 * k).toFixed(3)}" ${NS}/>` : '';
  }
  // ② red-reflex brightness at a groove floor (示意): the thinner the lens left under the floor, the brighter (0 = full lens, 1 = none left)
  const grooveGlow = rem => clamp(1 - rem / LENS.T, 0, 1) ** 2;
  function enfaceNuc(c, NU, M, A) {
    const o = [], S = lensShift(c), E = (x, y) => { const e = NU.toEye(x, y); return M([e[0] + S.LO[0], e[1] + S.LO[1], 0]); }, Rn = NUCR();
    // quadrants: where a moved / removed one was, the reflex is clearer; a pulled one is drawn where it is now
    if (NU.QD) for (const Q of NU.QD) { if (!Q.moved) continue;
      const foot = mv => { const pts = [], push = (x, y) => { let p = NU.fwd(x, y, LENS.zMid + 0.15); if (mv) { p = Q.toNow(p[0], p[1], p[2]); p[0] -= Q.dq[0] * Q.feed; p[1] -= Q.dq[1] * Q.feed;
          const k = (p[0] - Q.An[0]) * Q.dq[0] + (p[1] - Q.An[1]) * Q.dq[1]; if (k < 0) { p[0] -= Q.dq[0] * k; p[1] -= Q.dq[1] * k; } } pts.push(E(p[0], p[1])); };
        push(Q.dq[0] * 1e-3, Q.dq[1] * 1e-3); for (let k = 0; k <= 24; k++) { const dd = cd(Q.hq - 1.47 + 2.94 * k / 24); push(dd[0] * Rn, dd[1] * Rn); } return pts; };
      if (Q.gone) o.push(`<path d="M${foot(false).map(F).join('L')}Z" fill="#ff9a5c" opacity="0.30"/>`);
      if (!Q.gone) { const ft = foot(true), op = 1 - clamp(Q.feed / (NUCR() + 0.3), 0, 1);
        o.push(`<path d="M${ft.map(F).join('L')}Z" fill="#d9b25c" opacity="${(0.55 * op).toFixed(3)}" stroke="#7a5418" stroke-width="1" ${NS}/>`);
        A['quadApex' + Q.q] = E(Q.An[0], Q.An[1]); A['quadFoot' + Q.q] = ft; } }
    // grooves: the floor glows with the red reflex (brighter when deeper); walls darker
    for (const [k, Gg, from] of [['', NU.g1, 0], ['2', NU.g2, 2]]) { if (!Gg || !Gg.on) continue;
      const P = (a, b) => { const x = Gg.u[0] * a + Gg.v[0] * b, y = Gg.u[1] * a + Gg.v[1] * b, p = NU.fwd(x, y, Gg.zf0, from); return E(p[0], p[1]); };
      const lim = (a, w) => Math.min(w, Math.sqrt(Math.max(0, Gg.Rlim ** 2 - a * a)));
      for (const sb of [1, -1]) { const nA = 24;
        for (let i = 0; i < nA; i++) { const a0 = -Gg.Lh + 2 * Gg.Lh * i / nA, a1 = a0 + 2 * Gg.Lh / nA, am = (a0 + a1) / 2, gl = grooveGlow(Gg.remAt(am));
          o.push(`<path d="M${F(P(a0, sb * 1e-4))}L${F(P(a1, sb * 1e-4))}L${F(P(a1, sb * lim(a1, Gg.hw)))}L${F(P(a0, sb * lim(a0, Gg.hw)))}Z" fill="#ffc48a" opacity="${(0.15 + 0.8 * gl).toFixed(3)}"/>`); }
        const top = [], flo = []; for (let i = 0; i <= 30; i++) { const a = -Gg.Lh + 2 * Gg.Lh * i / 30; top.push(P(a, sb * lim(a, Gg.halfTop(a)))); flo.push(P(a, sb * lim(a, Gg.hw))); }
        o.push(`<path d="M${top.map(F).join('L')}" fill="none" stroke="#5a1f08" stroke-width="1" opacity="0.5" ${NS}/><path d="M${flo.map(F).join('L')}" fill="none" stroke="#fff0dc" stroke-width="0.7" opacity="0.6" ${NS}/>`); }
      A['grooveC' + k] = P(0, 1e-4); A['grooveEnd' + k] = [P(-Gg.Lh, 0), P(Gg.Lh, 0)]; A['grooveGlow' + k] = grooveGlow(Gg.rem); A['grooveRem' + k] = Gg.rem; A['grooveHalfW' + k] = Gg.hw; }
    // cracks: a dark line from the floor out to the nucleus edge as it runs; once through the plate the floor line shows the reflex; parted: a clear gap
    NU.ops.forEach((op, idx) => { if (op.t !== 'c' || !(op.prog > 0)) return; const G0 = op.h === NU.h1 ? NU.g1 : NU.g2, k = op.h === NU.h1 ? '' : '2', from = idx;
      const P = (a, b) => { const x = op.u[0] * a + op.v[0] * b, y = op.u[1] * a + op.v[1] * b, p = NU.fwd(x, y, LENS.zMid, from); return E(p[0], p[1]); };
      const Le = G0.Lh + op.ext.out * (Rn - G0.Lh);
      if (op.s > 0) { const R = LENS.Req, s1 = [], s2 = []; for (let i = 0; i <= 40; i++) { const a = -R + 2 * R * i / 40; s1.push(P(a, 1e-6)); s2.push(P(a, -1e-6)); }
        o.push(`<path d="M${s1.map(F).join('L')}L${s2.slice().reverse().map(F).join('L')}Z" fill="#ff7a3a" opacity="0.75"/><path d="M${s1.map(F).join('L')}M${s2.map(F).join('L')}" fill="none" stroke="#4a1606" stroke-width="0.9" opacity="0.7" ${NS}/>`); }
      else { const seg = (a0, a1, st) => `<path d="M${F(P(a0, 0))}L${F(P(a1, 0))}" ${st} ${NS}/>`;
        if (op.ext.down > 0) o.push(seg(-G0.Lh, G0.Lh, `stroke="#3a1004" stroke-width="1.3" opacity="${(0.85 * op.ext.down).toFixed(3)}"`));
        if (op.ext.down >= 1) o.push(seg(-G0.Lh, G0.Lh, 'stroke="#ff6a2a" stroke-width="0.7" opacity="0.95"'));
        if (op.ext.out > 0) for (const sgn of [1, -1]) o.push(seg(sgn * G0.Lh, sgn * Le, 'stroke="#3a1004" stroke-width="1.3" opacity="0.85"'), seg(sgn * G0.Lh, sgn * Le, 'stroke="#ff8a4a" stroke-width="0.5" opacity="0.8"')); }
      A['crackEnds' + k] = [P(-Le, 0), P(Le, 0)]; A['crackLe' + k] = Le; A['crackGap' + k] = op.s; });
    return o.join('');
  }
  function drawInstTop(g, M) {
    const o = [], band = (a, b, r, fill = C.metal) => { const A = M(a), B = M(b), d = u2([B[0] - A[0], B[1] - A[1]]), n = [-d[1] * r, d[0] * r];
      return `<path d="M${F([A[0] + n[0], A[1] + n[1]])}L${F([B[0] + n[0], B[1] + n[1]])}L${F([B[0] - n[0], B[1] - n[1]])}L${F([A[0] - n[0], A[1] - n[1]])}Z" fill="${fill}" stroke="${C.metalS}" stroke-width="0.9" stroke-linejoin="round" ${NS}/>`; };
    if (g.blade) { const b = g.blade, P = (x, y) => M(add(add(g.tip, g.axis, x), g.lat, y));
      const pts = [P(0, 0), P(b.tipL, b.W / 2), P(b.L, b.W / 2), P(b.L + 0.6, 0.4), P(b.L + 0.6, -0.4), P(b.L, -b.W / 2), P(b.tipL, -b.W / 2)];
      o.push(`<path d="M${pts.map(F).join('L')}Z" fill="#dfe5ea" stroke="${C.metalS}" stroke-width="0.9" stroke-linejoin="round" ${NS}/>`, `<path d="M${F(P(0.25, 0))}L${F(P(b.L, 0))}" stroke="#aab4be" stroke-width="0.7" ${NS}/>`);
      for (const s of g.segs) o.push(band(s.a, s.b, s.r)); return o.join(''); }
    if (g.kind === 'phaco') {   // ② sleeve (silicone) with its two irrigation ports, needle, and the bevel opening when it faces up
      o.push(band(g.segs[1].a, g.segs[1].b, g.rs, C.sleeve), band(g.segs[0].a, add(g.segs[0].b, g.axis, 0.15), g.rn));
      for (const pp of g.ports) { const q = M(pp); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${(CN.phaco.portD / 2).toFixed(3)}" fill="#33414c" opacity="0.85"/>`); }
      if (g.bevel !== 'down') { const a = M(g.tip), b = M(add(g.tip, g.axis, 2 * g.rn * Math.tan(CN.phaco.bevel * D2R) + 0.25)), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        o.push(`<ellipse cx="${cx.toFixed(4)}" cy="${cy.toFixed(4)}" rx="${(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2).toFixed(4)}" ry="${(g.rn * 0.7).toFixed(4)}" transform="rotate(${ang.toFixed(3)} ${cx.toFixed(4)} ${cy.toFixed(4)})" fill="#2b3640" opacity="0.8"/>`); }
      return o.join(''); }
    if (g.kind === 'chopper') { for (const s of g.segs.slice().reverse()) o.push(band(s.a, s.b, s.r)); const t = M(g.tip); o.push(`<circle cx="${t[0].toFixed(3)}" cy="${t[1].toFixed(3)}" r="${(CN.chopper.d * 0.35).toFixed(3)}" fill="${C.metal}" stroke="${C.metalS}" stroke-width="0.9" ${NS}/>`); return o.join(''); }
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
  return { CN, LENS, AZI, R_AZI, capT, norm, tunnel: tunnelOf, rhex, bare, flapMesh, instGeom, deformer, wallZ, FOLD, liftZ, irisOf, zonules, lensShift, striae, capPt, graspAt, tearPlane, section, enface, keyPts, layersAt, layersFn, tunnelOf, C,
    hydroOf, postIdx, nucOf, grooveGeo, groovePt, grooveTip, quadTip, crackExt, grooveGlow, NUCR, rotH, capsuleCut };
}
const CATARACT = typeof GLOBE !== 'undefined' ? CATARACT_MAKE(GLOBE) : null;
if (typeof module !== 'undefined') module.exports = CATARACT_MAKE;
