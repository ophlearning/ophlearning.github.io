// ============================================================================
// Globe model, anterior segment — right eye (OD). Units: mm. Sources and caveats: CARD.md.
// The outer surface is the eyelid model's globe (videos/models/eyelid/lid.js): sclera sphere R 12, cornea sphere RC 7.8 centred 5.3 mm in
// front of the globe centre, blended over 0.5 mm at the limbus — one globe for every model (check.js compares the two).
// 3D frame, examiner facing the patient: X = patient's left (nasal for OD), Y = superior, Z = anterior; globe centre at the origin.
// Positions in the surgeon's language: clock hour h (examiner's view: 12 superior, 3 nasal, 9 temporal for OD) and
//   s = distance from the limbus along the outer surface (negative = onto the cornea, positive = back over the sclera), d = depth below the outer surface.
// Views: a section through any plane (tissues are implicit functions, contoured with marching squares, so every section is the same 3D eye),
//   and the en-face microscope view with the surgeon sitting at any clock hour.
// ============================================================================
const GLOBE = (() => {
  const D2R = Math.PI / 180;
  const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const len = a => Math.sqrt(dot(a, a));
  const unit = a => { const l = len(a) || 1; return a.map(v => v / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const ss = (a, b, x) => ease((x - a) / (b - a));
  const F = p => p[0].toFixed(3) + ' ' + p[1].toFixed(3);
  const NS = 'vector-effect="non-scaling-stroke"';
  const hash = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };

  // ---------------------------------------------------------------- numbers (mm); every value is in CARD.md with its source or 「示意」
  const N = {
    R: 12, CZ: 5.3, RC: 7.8, KL: 0.5,          // outer surface, shared with the eyelid model (corneal diameter 11.64; Chinese WTW 11.75 ± 0.40, Fu 2015)
    cct: 0.54,                                   // central corneal thickness, Chinese adults 0.537 (Zheng 2008) / 0.552 (Chua 2014)
    ct3: 0.62,                                   // corneal thickness 3 mm from the apex, between superior 0.644 and temporal 0.606 (Zheng 2008)
    limbT: 0.53,                                 // sclera at the limbus 0.53 ± 0.14 (Olsen 1998)
    oraT: 0.43, eqT: 0.42,                       // sclera at the ora serrata / equator (Vurgese 2012)
    spur: 0.85,                                  // scleral spur behind the limbus, Chinese: superior 1.03, temporal 0.66 → superotemporal 0.85 (Le 2018, interpolated)
    plicata: 2.0,                                // pars plicata width behind the spur (示意: not found)
    ora: 6.2,                                    // limbus → ora serrata, Chinese 6.2 (Liu 2014)
    acd: 2.96,                                   // anterior chamber depth from the corneal epithelium, Chinese (Fu 2015, IOLMaster)
    lensT: 4.0, lensD: 9.0, lensRa: 10.0, lensRp: 6.0,   // lens (示意)
    pupil: 1.5,                                  // pupil radius under the microscope, undilated (示意)
    zone2: 5.0,                                  // zone II ends 5 mm behind the limbus (Pieramici 1997)
    conj: 0.25,                                  // conjunctiva + Tenon over the anterior sclera (示意)
  };

  // ---------------------------------------------------------------- meridional profile: polar angle phi from the anterior pole → [z, rho]
  const corneaD = phi => { const dc = N.CZ * Math.cos(phi); return dc + Math.sqrt(dc * dc - N.CZ * N.CZ + N.RC * N.RC); };
  const surfR = phi => { const d = corneaD(phi); return (N.R + d + Math.sqrt((N.R - d) ** 2 + N.KL * N.KL)) / 2; };
  const prof = phi => { const r = surfR(phi); return [r * Math.cos(phi), r * Math.sin(phi)]; };
  const bisect = (f, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; (f(a) > 0) === (f(m) > 0) ? a = m : b = m; } return (a + b) / 2; };
  const PHI_L = bisect(p => corneaD(p) - N.R, 20 * D2R, 80 * D2R);     // visible limbus: where the two spheres meet
  // dense profile with arclength from the limbus (s) and outward normals
  const DPHI = 0.05 * D2R, PN = Math.round(150 * D2R / DPHI);
  const PZ = new Float64Array(PN + 1), PR = new Float64Array(PN + 1), PS = new Float64Array(PN + 1), NZ = new Float64Array(PN + 1), NR = new Float64Array(PN + 1);
  for (let i = 0; i <= PN; i++) { const p = prof(i * DPHI); PZ[i] = p[0]; PR[i] = p[1]; }
  for (let i = 1; i <= PN; i++) PS[i] = PS[i - 1] + Math.hypot(PZ[i] - PZ[i - 1], PR[i] - PR[i - 1]);
  const iL = PHI_L / DPHI, i0 = Math.floor(iL), sL = lerp(PS[i0], PS[i0 + 1], iL - i0);
  for (let i = 0; i <= PN; i++) { PS[i] -= sL;
    const a = Math.max(0, i - 1), b = Math.min(PN, i + 1), tz = PZ[b] - PZ[a], tr = PR[b] - PR[a], l = Math.hypot(tz, tr) || 1;
    NZ[i] = tr / l; NR[i] = -tz / l; }                                   // outward normal (tangent rotated −90°)
  NZ[0] = 1; NR[0] = 0;
  const S_APEX = PS[0];                                                  // corneal apex, negative
  // s ↔ index
  const idxOfS = s => { let a = 0, b = PN; s = clamp(s, PS[0], PS[PN]); while (b - a > 1) { const m = (a + b) >> 1; PS[m] <= s ? a = m : b = m; } return a + (s - PS[a]) / ((PS[b] - PS[a]) || 1); };
  const atIdx = (arr, x) => { const i = Math.min(PN - 1, Math.floor(x)); return lerp(arr[i], arr[i + 1], x - i); };
  const surfAt = s => { const x = idxOfS(s); return { z: atIdx(PZ, x), rho: atIdx(PR, x), nz: atIdx(NZ, x), nr: atIdx(NR, x) }; };
  // nearest point on the outer profile for a meridional point (z, rho ≥ 0): s, depth d (positive inside), rho at the foot point
  // start from the two spheres' own projections (exact away from the limbal blend), then refine on the dense profile
  function wallOf(z, rho) {
    const cands = [Math.atan2(rho, z)], cz = z - N.CZ, l = Math.hypot(cz, rho) || 1;
    cands.push(Math.atan2(rho / l * N.RC, N.CZ + cz / l * N.RC));
    if (Math.abs(cands[0] - PHI_L) < 0.12 || Math.abs(cands[1] - PHI_L) < 0.12) cands.push(PHI_L);
    let bi = 0, bd = 1e9;
    for (const ph of cands) { const c = clamp(Math.round(ph / DPHI), 0, PN);
      for (let i = Math.max(0, c - 6); i <= Math.min(PN, c + 6); i += 2) { const d = (PZ[i] - z) ** 2 + (PR[i] - rho) ** 2; if (d < bd) { bd = d; bi = i; } } }
    for (let i = Math.max(0, bi - 2); i <= Math.min(PN, bi + 2); i++) { const d = (PZ[i] - z) ** 2 + (PR[i] - rho) ** 2; if (d < bd) { bd = d; bi = i; } }
    const j = bi < PN && (bi === 0 || (PZ[bi + 1] - z) ** 2 + (PR[bi + 1] - rho) ** 2 < (PZ[bi - 1] - z) ** 2 + (PR[bi - 1] - rho) ** 2) ? bi + 1 : bi - 1;
    const a = Math.min(bi, j), b = Math.max(bi, j), ez = PZ[b] - PZ[a], er = PR[b] - PR[a], L2 = ez * ez + er * er || 1;
    const t = clamp(((z - PZ[a]) * ez + (rho - PR[a]) * er) / L2, 0, 1);
    const fz = PZ[a] + ez * t, fr = PR[a] + er * t, nz = lerp(NZ[a], NZ[b], t), nr = lerp(NR[a], NR[b], t);
    return { s: lerp(PS[a], PS[b], t), d: (fz - z) * nz + (fr - rho) * nr, rhoF: fr };
  }

  // ---------------------------------------------------------------- wall thickness along s, and the tissue boundaries inside the wall
  function spline1(pts) { // monotone-ish Catmull-Rom in 1D: pts = [[x, y], …] sorted by x
    return x => { if (x <= pts[0][0]) return pts[0][1]; if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
      let i = 0; while (x > pts[i + 1][0]) i++;
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], t = (x - p1[0]) / (p2[0] - p1[0]);
      const m1 = (p2[1] - p0[1]) / ((p2[0] - p0[0]) || 1) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / ((p3[0] - p1[0]) || 1) * (p2[0] - p1[0]);
      const t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2; };
  }
  // s where the cornea is 3 mm from the optical axis (Zheng 2008 measured thickness there)
  const S_R3 = (() => { let a = S_APEX, b = 0; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; surfAt(m).rho < 3 ? a = m : b = m; } return (a + b) / 2; })();
  // between the sourced points the thickness is interpolated (CARD.md marks which values are interpolated)
  const T = spline1([[S_APEX, N.cct], [S_R3, N.ct3], [0, N.limbT], [N.ora, N.oraT], [14, N.eqT]]);
  // limbus inside the wall: clear cornea in front of the anterior limbal line (visible limbus at the surface → Schwalbe's line at the inner surface),
  // a translucent limbal band, then opaque sclera behind the posterior limbal line (perpendicular to the surface over the scleral spur)
  const SCHW = 0.0;                                                      // Schwalbe's line under the visible limbus (示意)
  const sAnt = (d, s) => lerp(0, SCHW + 0.15, clamp(d / T(s), 0, 1));     // slightly oblique (示意)
  const sPost = () => N.spur;

  // ---------------------------------------------------------------- 3D helpers
  const clockDir = h => [Math.sin(h * 30 * D2R), Math.cos(h * 30 * D2R)];   // examiner's view: [X, Y]
  const clockOf = (X, Y) => { let h = Math.atan2(X, Y) / (30 * D2R); if (h <= 0) h += 12; return h; };
  // surface point (and normal) at clock h, distance s from the limbus, depth d
  function P3(h, s, d = 0) {
    const f = surfAt(s), [cx, cy] = clockDir(h), r = f.rho - f.nr * d, z = f.z - f.nz * d;
    return [r * cx, r * cy, z];
  }
  function N3(h, s) { const f = surfAt(s), [cx, cy] = clockDir(h); return [f.nr * cx, f.nr * cy, f.nz]; }
  function Ts3(h, s) { return unit(sub(P3(h, s + 0.02), P3(h, s - 0.02))); }   // meridian tangent, outward (toward +s)
  // meridional point of a 3D point
  const mer = p => ({ z: p[2], rho: Math.hypot(p[0], p[1]), h: clockOf(p[0], p[1]) });

  // ---------------------------------------------------------------- state
  // st.wound: { h, s0, s1, gap }   h = clock hour of the laceration (radial), s0 → s1 = its extent (cornea → sclera), gap = how far the edges gape (mm)
  // st.sutures: [{ s, b, dep, pass, tie, bury, mat }]  s = where it crosses the wound, b = bite on each side (mm, from the wound edge line),
  //   dep = depth as a fraction of the wall, pass 0→1 needle through, tie 0→1 knot tied (closes the gap there), bury 0→1 knot rotated into the track
  // st.prolapse 0→1 iris knuckle out of the limbal part of the wound; st.reposit 0→1 swept back; st.peritomy 0→1 conjunctiva opened over the scleral part
  // st.ac 0→1 anterior chamber depth (1 = normal; open globes often shallow); st.heme 0→1 subconjunctival haemorrhage over the scleral part
  const DEF = { wound: null, sutures: [], prolapse: 0, reposit: 0, peritomy: 0, ac: 1, heme: 0 };
  const S = st => Object.assign({}, DEF, st || {});
  const proEff = st => (st.prolapse || 0) * (1 - (st.reposit || 0));
  // gap of the wound at s, after the tied sutures have pulled it together; tips taper to 0
  function gapAt(st, s) {
    const w = st.wound; if (!w) return 0;
    if (s < w.s0 || s > w.s1) return 0;
    let g = (w.gap ?? 0.22) * Math.sqrt(ss(w.s0, w.s0 + 0.9, s) * (1 - ss(w.s1 - 0.9, w.s1, s)));
    const pe = proEff(st); g = Math.max(g, 0.42 * pe * Math.exp(-(((s - PRO.s) / 0.7) ** 2)));   // the knuckle holds the wound open
    for (const su of st.sutures || []) { const k = su.tie || 0; if (k > 0) g *= 1 - k * Math.exp(-(((s - su.s) / 0.85) ** 2)); }
    return g;
  }
  // prolapsed iris: knuckle centred on the wound at s = PRO.s, raised above the surface, and a stalk down to the iris near its root
  const PRO = { s: -0.15, a: 0.85, b: 0.5, c: 0.42, lift: 0.32 };

  // ---------------------------------------------------------------- internal structures in meridional coordinates (z, rho)
  // anterior chamber depth sets the lens–iris diaphragm; the lens anterior pole sits cct + acd behind the corneal apex
  function inner(st) {
    const apexZ = PZ[0], acd = lerp(N.cct + 0.9, N.acd, st.ac ?? 1), za = apexZ - acd;      // lens anterior pole (ACD measured from the epithelium)
    const lensC1 = za - N.lensRa, lensC2 = za - N.lensT + N.lensRp;                         // centres of the anterior / posterior lens spheres
    // iris root: on the ciliary body face just behind the scleral spur; pupil margin rests on the anterior lens capsule
    const rf = surfAt(N.spur + 0.35), tr = T(N.spur + 0.35) + 0.45;
    const root = [rf.z - rf.nz * tr, rf.rho - rf.nr * tr];
    const pr = N.pupil, zp = lensC1 + Math.sqrt(N.lensRa ** 2 - pr * pr) + 0.12;
    return { za, lensC1, lensC2, root, pm: [zp, pr] };
  }
  // iris centreline from the pupil margin (t = 0) to the root (t = 1): gently convex forward; thickness (示意)
  function irisLine(I, peakR = 0) {
    const a = [I.pm[0], I.pm[1] + peakR], b = I.root, c = [lerp(a[0], b[0], 0.45) + 0.28, lerp(a[1], b[1], 0.5)], out = [];
    for (let k = 0; k <= 48; k++) { const t = k / 48, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
    return out;
  }
  const irisTh = t => 0.16 + 0.42 * Math.sin(Math.PI * Math.min(1, t * 1.35)) * (t < 0.74 ? 1 : 1 - ss(0.74, 1, t) * 0.55);
  function distPoly(q, pts) { // distance from q to a polyline, and where along it (0–1); scalar maths (called for every grid point)
    let bd = 1e18, bt = 0; const qx = q[0], qy = q[1], n = pts.length - 1;
    for (let i = 1; i <= n; i++) { const ax = pts[i - 1][0], ay = pts[i - 1][1], ex = pts[i][0] - ax, ey = pts[i][1] - ay, L2 = ex * ex + ey * ey || 1;
      let t = ((qx - ax) * ex + (qy - ay) * ey) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = qx - ax - ex * t, dy = qy - ay - ey * t, d = dx * dx + dy * dy; if (d < bd) { bd = d; bt = (i - 1 + t) / n; } }
    return [Math.sqrt(bd), bt]; }

  // ---------------------------------------------------------------- implicit tissues: g(p) < 0 inside. ctx caches per-point wall coordinates.
  function makeField(st) {
    st = S(st); const I = inner(st), w = st.wound, pe = proEff(st);
    const peak = 1.1 * pe;                                              // peaked pupil toward the wound (示意: amount)
    const IL = irisLine(I), ILp = irisLine(I, peak), ILk = [];   // centrelines blended toward the peaked one, 17 levels
    for (let q = 0; q <= 16; q++) ILk.push(IL.map((p, i) => [lerp(p[0], ILp[i][0], q / 16), lerp(p[1], ILp[i][1], q / 16)]));
    // signed circumferential distance from the wound meridian, measured along the parallel at the foot point
    const circ = (p, rhoF) => { if (!w) return 1e3; let dh = clockOf(p[0], p[1]) - w.h; if (dh > 6) dh -= 12; if (dh < -6) dh += 12; return dh * 30 * D2R * rhoF; };
    const field = {
      st, I,
      wall: p => { const m = mer(p), W = wallOf(m.z, m.rho); W.c = circ(p, W.rhoF); W.m = m; W.T = T(W.s); W.gap = gapAt(st, W.s); return W; },
    };
    // wound removal: inside the wound (open) where |c| < gap/2
    const inWound = W => w && W.gap > 1e-4 ? Math.abs(W.c) - W.gap / 2 : 1;   // no gap → no wound (tips, or closed by a suture)
    const wallG = W => Math.max(-W.d, W.d - W.T);
    field.g = {
      cornea: W => Math.max(wallG(W), W.s - sAnt(W.d, W.s), -inWound(W)),
      limbus: W => Math.max(wallG(W), sAnt(W.d, W.s) - W.s, W.s - sPost(), -inWound(W)),
      sclera: W => Math.max(wallG(W), sPost() - W.s, -inWound(W)),
      // the wound face just behind a section that runs inside the wound (drawn pale): the wall without the wound removed
      woundFace: W => w && W.s >= w.s0 - 0.05 && W.s <= w.s1 + 0.05 && Math.abs(W.c) < 1.2 ? Math.max(wallG(W), inWound(W) > 0 ? 0.01 : -1e-3) : 1,
      conj: W => {
        let g = Math.max(-W.d - N.conj, W.d, 0.25 - W.s);                  // inserts ~0.25 mm behind the visible limbus (示意)
        if (st.peritomy > 0 && w) { const half = 2.6 * st.peritomy, back = lerp(0.25, 7.2, st.peritomy); if (Math.abs(W.c) < half * W.rhoF / surfAt(0).rho && W.s < back) g = Math.max(g, 0.01); }
        else if (w && W.s > 0.25 && W.s < w.s1 + 0.4) g = Math.max(g, -(Math.abs(W.c) - 0.12 - gapAt(st, Math.min(W.s, w.s1 - 0.01)) * 0.5));   // torn over the scleral wound
        return g; },
      ciliary: W => { const x = W.s - N.spur, th = W.s < N.spur ? -1 : x < N.plicata ? lerp(0.35, 1.05, ss(0, 0.6, x)) * (1 - ss(N.plicata - 0.6, N.plicata + 0.4, x) * 0.7) + 0.06 * Math.sin(x * 9) * ss(0.4, 0.8, x) * (1 - ss(N.plicata - 0.4, N.plicata, x)) : lerp(0.32, 0.22, ss(N.plicata, N.ora - N.spur, x));
        return Math.max(W.T - W.d, W.d - W.T - th, N.spur - 0.02 - W.s, W.s - N.ora); },
      choroid: W => Math.max(W.T - W.d, W.d - W.T - 0.22, N.ora - W.s),
      retina: W => Math.max(W.T + 0.22 - W.d, W.d - W.T - 0.42, N.ora - W.s),
      interior: W => W.T - W.d,
      aqueous: (W, p) => { const m = W.m; return Math.max(W.T - W.d, I.za - 0.6 - m.z - Math.max(0, 1.6 - m.rho) * 0, (m.rho < 4.6 ? I.lensC1 + Math.sqrt(Math.max(0, N.lensRa ** 2 - m.rho ** 2)) : I.root[0] - 0.3) - m.z); },
      lens: (W, p) => { const m = W.m, a = Math.hypot(m.z - I.lensC1, m.rho) - N.lensRa, b = Math.hypot(m.z - I.lensC2, m.rho) - N.lensRp; return Math.max(a, b, m.rho - N.lensD / 2); },
      iris: (W, p) => { const m = W.m; if (m.rho < 0.6 || m.rho > I.root[1] + 0.8 || m.z < I.root[0] - 0.8 || m.z > I.pm[0] + 1.0) return 1;
        // near the wound meridian the iris is pulled toward the wound (peaked pupil): blend the two centrelines by angle
        const q = [m.z, m.rho], gl = L => { const [d, t] = distPoly(q, L); return d - irisTh(t) / 2; };
        if (!(pe > 0) || !w) return gl(IL);
        const k = Math.exp(-((W.c / (0.9 * Math.max(m.rho, 0.5) * 0.35 + 0.4)) ** 2)) * 16, i = Math.floor(k);   // interpolate between neighbouring levels (no steps)
        return i >= 16 ? gl(ILk[16]) : lerp(gl(ILk[i]), gl(ILk[i + 1]), k - i); },
      // prolapse knuckle + stalk in the local wound frame (s along the wound, c across, d depth)
      prolapse: W => { if (!(pe > 0) || !w) return 1;
        const a = PRO.a * (0.55 + 0.45 * pe), b = PRO.b * (0.6 + 0.4 * pe), c = PRO.c * (0.5 + 0.5 * pe), dk = -PRO.lift * pe;
        const knuckle = Math.hypot((W.s - PRO.s) / a, W.c / b, (W.d - dk) / c) - 1;
        const dr = T(PRO.s + 0.6) + 0.45, sx = lerp(PRO.s, N.spur + 0.3, clamp((W.d - dk) / (dr - dk), 0, 1));
        const stalk = Math.max(Math.hypot((W.s - sx) / 0.5, W.c / 0.17) - 1, dk - W.d, W.d - dr);
        return Math.min(knuckle * Math.min(a, b, c), stalk * 0.17); },
    };
    return field;
  }

  // ---------------------------------------------------------------- marching squares: closed contours of g < 0 on a grid (values outside the grid = outside)
  function contour(vals, nx, ny, x0, y0, step) {
    const V = (i, j) => (i < 0 || j < 0 || i >= nx || j >= ny) ? 1 : vals[j * nx + i];
    const segs = new Map(), ends = new Map(), out = [];
    const pt = (key) => {
      const [t, si, sj] = key; // t: 'h' (i,j)-(i+1,j) or 'v' (i,j)-(i,j+1)
      const a = V(si, sj), b = t === 'h' ? V(si + 1, sj) : V(si, sj + 1), f = a / ((a - b) || 1e-12);
      return t === 'h' ? [x0 + (si + clamp(f, 0, 1)) * step, y0 + sj * step] : [x0 + si * step, y0 + (sj + clamp(f, 0, 1)) * step];
    };
    const K = k => k.join(',');
    const link = [];
    for (let j = -1; j < ny; j++) for (let i = -1; i < nx; i++) {
      const a = V(i, j) < 0, b = V(i + 1, j) < 0, c = V(i + 1, j + 1) < 0, d = V(i, j + 1) < 0, idx = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      const eT = ['h', i, j], eR = ['v', i + 1, j], eB = ['h', i, j + 1], eL = ['v', i, j];
      const S2 = [];
      switch (idx) {
        case 1: case 14: S2.push([eL, eT]); break;
        case 2: case 13: S2.push([eT, eR]); break;
        case 3: case 12: S2.push([eL, eR]); break;
        case 4: case 11: S2.push([eR, eB]); break;
        case 6: case 9: S2.push([eT, eB]); break;
        case 7: case 8: S2.push([eL, eB]); break;
        case 5: case 10: { const ctr = (V(i, j) + V(i + 1, j) + V(i + 1, j + 1) + V(i, j + 1)) / 4 < 0;
          if ((idx === 5) === ctr) S2.push([eL, eB], [eT, eR]); else S2.push([eL, eT], [eR, eB]); break; }
      }
      for (const s of S2) link.push(s);
    }
    // join segments that share an edge into polylines
    const adj = new Map(); const addA = (k, n) => { if (!adj.has(k)) adj.set(k, []); adj.get(k).push(n); };
    link.forEach((s, n) => { addA(K(s[0]), n); addA(K(s[1]), n); });
    const used = new Uint8Array(link.length);
    for (let n = 0; n < link.length; n++) {
      if (used[n]) continue; used[n] = 1;
      const chain = [link[n][0], link[n][1]];
      let grow = true;
      while (grow) { grow = false; const last = K(chain[chain.length - 1]);
        for (const m of adj.get(last) || []) if (!used[m]) { used[m] = 1; const s = link[m]; chain.push(K(s[0]) === last ? s[1] : s[0]); grow = true; break; } }
      if (chain.length > 3) out.push(chain.map(pt));
    }
    return out;
  }
  const loops2path = loops => loops.map(l => 'M' + l.map(F).join('L') + 'Z').join('');

  // ---------------------------------------------------------------- planes
  // a plane: origin O (3D), U (screen right), V (screen down); a point (u, v) on screen ↔ O + u U + v V
  const planes = {
    // through the optical axis along clock h, anterior up; screen right = away from the corneal centre toward h
    meridian: (h, off = 0) => { const [cx, cy] = clockDir(h), side = [cy, -cx, 0]; return { O: [side[0] * off, side[1] * off, 0], U: [cx, cy, 0], V: [0, 0, -1], kind: 'meridian', h }; },
    // perpendicular to a radial wound at clock h, distance s from the limbus: the wall runs left–right, inward is down.
    // Seen from the corneal centre looking outward along the wound (screen right = t × n).
    across: (h, s) => { const O = P3(h, s), n = N3(h, s), t = Ts3(h, s), U = unit(cross(t, n)); return { O, U, V: n.map(v => -v), kind: 'across', h, s }; },
  };
  const onPlane = (pl, u, v) => add(add(pl.O, pl.U, u), pl.V, v);
  // 3D → plane screen coordinates (orthogonal projection)
  const toPlane = (pl, p) => { const q = sub(p, pl.O); return [dot(q, pl.U), dot(q, pl.V)]; };

  // ---------------------------------------------------------------- colours
  const C = {
    sclera: '#f8f6f2', scleraS: '#9aaab7', limb: '#e3edf2', cornea: '#d8edf8', corneaS: '#7fb3d3', aq: '#eef7fc',
    iris: '#6a4128', irisS: '#4a2b19', cil: '#8a5a41', cilS: '#6b432f', chor: '#a46f5a', ret: '#e9b3aa', lens: '#edf1f7', lensS: '#aebdcd',
    vit: '#fbfcfd', conj: '#f2c9c9', conjS: '#cf8f93', face: '#eadfd6', faceS: '#bfa999', pro: '#5a3523', proS: '#3a2114',
    suture: '#1f2a44', heme: '#a3262b',
  };

  // ---------------------------------------------------------------- section drawing
  // opt: plane, win {x, y, w, h} in screen mm, step (grid, mm), id (unique per panel), st
  // The tissue drawing only depends on the plane, the window and the state that changes tissue (not on needle progress or knot burying),
  // so it is cached: a needle moving through a still section does not recompute the tissues.
  const SEC_CACHE = new Map();
  const tissueKey = (st, pl, win, step) => JSON.stringify([pl.O, pl.U, pl.V, pl.kind, win, step, st.wound, st.prolapse, st.reposit, st.peritomy, st.ac, st.heme,
    (st.sutures || []).map(su => [su.s, su.tie || 0])]);
  function section(opt) {
    const st = S(opt.st), pl = opt.plane, win = opt.win, step = opt.step || 0.025, key = tissueKey(st, pl, win, step);
    const hit = SEC_CACHE.get(key), tis = hit || sectionTissue(st, pl, win, step);
    if (!hit) { if (SEC_CACHE.size > 60) SEC_CACHE.delete(SEC_CACHE.keys().next().value); SEC_CACHE.set(key, tis); }
    const o = [tis.svg], A = {};
    // sutures crossing this plane
    for (const [i, su] of (st.sutures || []).entries()) {
      const path = suturePath(st, su);
      if (pl.kind === 'across' && Math.abs(su.s - pl.s) < 0.05) {
        const pts = path.track.map(p => toPlane(pl, p)), n = Math.max(2, Math.round(pts.length * clamp(su.pass ?? 1, 0, 1)));
        o.push(`<path d="M${pts.slice(0, n).map(F).join('L')}" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" ${NS}/><path d="M${pts.slice(0, n).map(F).join('L')}" fill="none" stroke="${C.suture}" stroke-width="1.6" stroke-linecap="round" ${NS}/>`);
        if ((su.tie || 0) > 0.5) { const kp = toPlane(pl, path.knot); o.push(`<circle cx="${kp[0].toFixed(3)}" cy="${kp[1].toFixed(3)}" r="0.07" fill="${C.suture}" stroke="#fff" stroke-width="0.8" ${NS}/>`); A['knot' + i] = kp; }
        A['in' + i] = pts[0]; A['out' + i] = pts[pts.length - 1]; A['deep' + i] = pts[20];
      } else if (pl.kind === 'meridian' && (su.pass ?? 1) > 0.5) {
        const dp = toPlane(pl, path.deep); o.push(`<circle cx="${dp[0].toFixed(3)}" cy="${dp[1].toFixed(3)}" r="0.06" fill="${C.suture}" stroke="#fff" stroke-width="0.8" ${NS}/>`); A['deep' + i] = dp;
      }
    }
    return { svg: o.join(''), A, field: tis.field };
  }
  function sectionTissue(st, pl, win, step) {
    const fd = makeField(st);
    const nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(win.h / step) + 1;
    const Wc = new Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) Wc[j * nx + i] = fd.wall(onPlane(pl, win.x + i * step, win.y + j * step));
    const vals = new Float64Array(nx * ny);
    const layer = (name, fill, stroke, sw = 0.9, extra = '') => { const g = fd.g[name]; let any = false;
      for (let k = 0; k < Wc.length; k++) { vals[k] = g(Wc[k]); if (vals[k] < 0) any = true; }
      if (!any) return '';
      return `<path d="${loops2path(contour(vals, nx, ny, win.x, win.y, step))}" fill="${fill}" fill-rule="evenodd" ${stroke ? `stroke="${stroke}" stroke-width="${sw}" ${NS}` : ''} ${extra}/>`; };
    const o = [`<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="#f4f7f9"/>`];
    o.push(layer('interior', C.vit));
    o.push(layer('aqueous', C.aq));
    o.push(layer('lens', C.lens, C.lensS));
    o.push(layer('retina', C.ret), layer('choroid', C.chor), layer('ciliary', C.cil, C.cilS, 0.6));
    o.push(layer('iris', C.iris, C.irisS, 0.6));
    if (st.wound && pl.kind === 'meridian') o.push(layer('woundFace', C.face, C.faceS, 0.6));   // the far wound face, seen through the slit
    o.push(layer('sclera', C.sclera, C.scleraS), layer('limbus', C.limb, null), layer('cornea', C.cornea, C.corneaS));
    o.push(layer('conj', C.conj, C.conjS, 0.6));
    o.push(layer('prolapse', C.pro, C.proS, 0.8));
    return { svg: o.join(''), field: fd };
  }

  // suture geometry (3D): perpendicular to the wound at s; entry b mm on one side (c = +b), deepest at the wound (dep × wall), exit at c = −b.
  // The track is an ellipse in the (c, depth) plane: perpendicular to the surface where the needle enters and exits.
  function suturePath(st, su) {
    const w = st.wound, h = w.h, f = surfAt(su.s), rho = f.rho, D = (su.dep ?? 0.9) * T(su.s), b = su.b, track = [];
    for (let k = 0; k <= 40; k++) { const a = Math.PI * k / 40, c = b * Math.cos(a), dep = D * Math.sin(a);
      track.push(P3(h + c / rho / (30 * D2R), su.s, dep)); }
    const bury = su.bury || 0, kc = lerp(0, b * 0.92, bury), kd = lerp(-0.03, D * 0.5, bury);           // knot: tied over the wound, then rotated into the entry side
    return { track, deep: track[20], entry: track[0], exit: track[40], knot: P3(h + kc / rho / (30 * D2R), su.s, kd), D };
  }

  // ---------------------------------------------------------------- en-face microscope view
  // surgeon = clock hour where the surgeon sits (12 = at the patient's head); that clock hour is at the bottom of the image.
  // Returns svg in screen mm (x right, y down), origin at the corneal centre.
  function enfaceMap(surgeon = 12) {
    const a = surgeon * 30 * D2R, vx = Math.sin(a), vy = -Math.cos(a);      // direction of the surgeon's clock hour on the examiner's screen (y down)
    const ang = Math.atan2(1, 0) - Math.atan2(vy, vx), ca = Math.cos(ang), sa = Math.sin(ang);
    return p => { const x = p[0], y = -p[1]; return [x * ca - y * sa, x * sa + y * ca]; };   // 3D [X, Y, Z] → screen [x, y]
  }
  function enface(opt) {
    const st = S(opt.st), id = opt.id || 'ef', M = enfaceMap(opt.surgeon ?? 12), I = inner(st), w = st.wound, pe = proEff(st), o = [], A = {};
    const rhoL = surfAt(0).rho, Pf = (h, s, d = 0) => M(P3(h, s, d));
    const ring = (r, n = 180) => { const pts = []; for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n; pts.push(M([r * Math.sin(t), r * Math.cos(t), 0])); } return 'M' + pts.map(F).join('L') + 'Z'; };
    const ctr = M([0, 0, 0]);
    // sclera + conjunctiva background with vessels
    o.push(`<defs><radialGradient id="${id}_sc" cx="${ctr[0]}" cy="${ctr[1]}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0.42" stop-color="#fbf6f3"/><stop offset="0.75" stop-color="#f6e3e0"/><stop offset="1" stop-color="#eccfcb"/></radialGradient>` +
      `<radialGradient id="${id}_ir" cx="${ctr[0]}" cy="${ctr[1]}" r="${rhoL}" gradientUnits="userSpaceOnUse"><stop offset="0.25" stop-color="#3b2416"/><stop offset="0.55" stop-color="#6d4329"/><stop offset="0.93" stop-color="#5a3622"/><stop offset="1" stop-color="#8f8a86"/></radialGradient>` +
      `<radialGradient id="${id}_pu" cx="${ctr[0]}" cy="${ctr[1]}" r="${N.pupil * 1.3}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a2a14"/><stop offset="1" stop-color="#1c0b06"/></radialGradient></defs>`);
    o.push(`<rect x="-30" y="-30" width="60" height="60" fill="url(#${id}_sc)"/>`);
    for (let k = 0; k < 26; k++) { const h0 = 12 * hash(k, 1), r0 = rhoL + 0.6 + 2.5 * hash(k, 2), pts = [];
      for (let j = 0; j <= 12; j++) { const r = r0 + j * 0.65, hh = h0 + 0.18 * Math.sin(j * 0.9 + k) * (1 + hash(k, 3)); pts.push(M([r * clockDir(hh)[0], r * clockDir(hh)[1], 0])); }
      o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#c8565c" stroke-width="${(0.6 + 0.8 * hash(k, 4)).toFixed(2)}" opacity="0.45" ${NS}/>`); }
    // subconjunctival haemorrhage over the scleral part of the wound
    if (w && st.heme > 0) { const pts = []; for (let k = 0; k <= 36; k++) { const t = 2 * Math.PI * k / 36, sc = (w.s1 + 0.6) / 2 + 0.2, cs = lerp(0.2, w.s1 + 1.6, (Math.cos(t) + 1) / 2), cc = 1.6 * Math.sin(t) * (1 + 0.15 * Math.sin(3 * t));
        pts.push(Pf(w.h + cc / surfAt(cs).rho / (30 * D2R), cs)); }
      o.push(`<filter id="${id}_bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.35"/></filter><path d="M${pts.map(F).join('L')}Z" fill="${C.heme}" opacity="${(0.8 * st.heme).toFixed(2)}" filter="url(#${id}_bl)"/>`); }
    // peritomy: bare sclera exposed in a sector, conjunctiva rolled back
    if (w && st.peritomy > 0) { const half = 2.6 * st.peritomy, back = lerp(0.25, 7.2, st.peritomy), pts = [];
      const hw = c => w.h + c / rhoL / (30 * D2R);
      for (let k = 0; k <= 20; k++) pts.push(Pf(hw(lerp(-half, half, k / 20)), 0.15));
      for (let k = 0; k <= 20; k++) pts.push(Pf(hw(lerp(half, -half, k / 20)), back));   // radial relaxing cuts: same clock hours front and back
      o.push(`<path d="M${pts.map(F).join('L')}Z" fill="#f7f4ee" stroke="#d9c9c0" stroke-width="0.8" ${NS}/>`);
      const roll = []; for (let k = 0; k <= 20; k++) roll.push(Pf(hw(lerp(-half, half, k / 20)), back + 0.25));
      o.push(`<path d="M${roll.map(F).join('L')}" fill="none" stroke="#e8aeb1" stroke-width="5" stroke-linecap="round" ${NS}/><path d="M${roll.map(F).join('L')}" fill="none" stroke="#cf8f93" stroke-width="1" ${NS}/>`);
      A.peritomy = Pf(w.h, back); }
    // iris (seen through the cornea) and pupil; the pupil peaks toward a prolapse
    o.push(`<path d="${ring(rhoL - 0.05)}" fill="url(#${id}_ir)"/>`);
    for (let k = 0; k < 90; k++) { const h = k * 12 / 90 + 0.05 * hash(k, 5), r0 = N.pupil + 0.25, r1 = rhoL - 0.5 - 0.6 * hash(k, 6), a = M([r0 * clockDir(h)[0], r0 * clockDir(h)[1], 0]), b = M([r1 * clockDir(h + 0.06)[0], r1 * clockDir(h + 0.06)[1], 0]);
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="${hash(k, 7) > 0.5 ? '#8a5a3a' : '#2e1a0f'}" stroke-width="0.7" opacity="0.5" ${NS}/>`); }
    o.push(`<path d="${ring(2.75)}" fill="none" stroke="#8b5d3d" stroke-width="1.4" opacity="0.55" ${NS}/>`);   // collarette (示意)
    const pupilPts = []; for (let k = 0; k < 120; k++) { const h = k * 12 / 120; let r = N.pupil;
      if (w && pe > 0) { let dh = h - w.h; if (dh > 6) dh -= 12; if (dh < -6) dh += 12; r += 1.1 * pe * Math.exp(-((dh / 0.55) ** 2)); }
      pupilPts.push(M([r * clockDir(h)[0], r * clockDir(h)[1], 0])); }
    o.push(`<path d="M${pupilPts.map(F).join('L')}Z" fill="url(#${id}_pu)"/>`);
    A.pupil = ctr; A.pupilPeak = pupilPts.reduce((b, p) => Math.hypot(p[0] - ctr[0], p[1] - ctr[1]) > Math.hypot(b[0] - ctr[0], b[1] - ctr[1]) ? p : b);   // the drawn pupil's farthest point
    // limbus: translucent grey-blue band from the visible limbus out to the posterior limbal line (over the spur)
    const rS = surfAt(N.spur).rho;
    o.push(`<path d="${ring(rhoL + 0.02)}${ring(rhoL - 0.45)}" fill="#c9d3d9" fill-rule="evenodd" opacity="0.55"/>`, `<path d="${ring(rS)}${ring(rhoL)}" fill="#eef2f4" fill-rule="evenodd" opacity="0.8"/>`);
    o.push(`<path d="${ring(rhoL)}" fill="none" stroke="#9fb1bd" stroke-width="1" ${NS}/>`);
    A.limbusCircle = rhoL;
    // light reflexes on the cornea (microscope coaxial light, 示意)
    o.push(`<ellipse cx="${ctr[0] - 0.9}" cy="${ctr[1] - 0.7}" rx="0.32" ry="0.22" fill="#fff" opacity="0.85"/><ellipse cx="${ctr[0] + 0.9}" cy="${ctr[1] - 0.7}" rx="0.32" ry="0.22" fill="#fff" opacity="0.85"/>`);
    // the wound: two edges gaping by gapAt(s); the scleral part is hidden under intact conjunctiva unless peritomy or a conjunctival tear shows it
    if (w) {
      const seen = s => s <= 0.25 || st.peritomy > 0.3 ? 1 : 0.55;              // through torn conjunctiva / haemorrhage: partly hidden
      const edge = sg => { const pts = []; for (let s = w.s0; s <= w.s1 + 1e-9; s += 0.05) { const g = gapAt(st, s) / 2, rho = surfAt(s).rho; pts.push(Pf(w.h + sg * g / rho / (30 * D2R), s)); } return pts; };
      // corneal part: the slit shows the iris behind it (slightly darker), its cut stromal edges are grey-white (oedema, 示意);
      // scleral part: dark uvea in the slit between white scleral edges
      const e1 = edge(1), e2 = edge(-1), slit = 'M' + [...e1, ...e2.slice().reverse()].map(F).join('L') + 'Z';
      o.push(`<clipPath id="${id}_cor"><path d="${ring(rhoL)}"/></clipPath><clipPath id="${id}_out"><path d="M-40 -40H40V40H-40Z${ring(rhoL)}" clip-rule="evenodd"/></clipPath>`);
      o.push(`<g clip-path="url(#${id}_out)"><path d="${slit}" fill="#2a160d" opacity="0.92"/></g>`, `<g clip-path="url(#${id}_cor)"><path d="${slit}" fill="#24140c" opacity="0.35"/></g>`);
      for (const e of [e1, e2]) o.push(`<path d="M${e.map(F).join('L')}" fill="none" stroke="#e9eef1" stroke-width="2.2" opacity="0.9" stroke-linecap="round" ${NS}/>`);
      if (!(st.peritomy > 0.3)) { const sh = []; for (let s = 0.3; s <= w.s1 + 0.4; s += 0.1) sh.push(Pf(w.h, s)); o.push(`<path d="M${sh.map(F).join('L')}" stroke="${C.heme}" stroke-width="4" opacity="${(0.5 * (1 - seen(2))).toFixed(2)}" ${NS}/>`); }
      A.woundTip0 = Pf(w.h, w.s0); A.woundTip1 = Pf(w.h, w.s1); A.woundLimbus = Pf(w.h, 0); A.zone2End = Pf(w.h, N.zone2);
      // prolapse knuckle
      if (pe > 0) { const pts = []; for (let k = 0; k < 40; k++) { const t = 2 * Math.PI * k / 40, s = PRO.s + PRO.a * (0.55 + 0.45 * pe) * Math.cos(t), c = PRO.b * (0.6 + 0.4 * pe) * Math.sin(t) * 1.05;
          pts.push(Pf(w.h + c / surfAt(s).rho / (30 * D2R), s, -PRO.lift * pe)); }
        o.push(`<path d="M${pts.map(F).join('L')}Z" fill="${C.pro}" stroke="${C.proS}" stroke-width="1" ${NS}/>`); A.prolapse = Pf(w.h, PRO.s); }
      // sutures
      for (const [i, su] of (st.sutures || []).entries()) { const p = suturePath(st, su), pass = clamp(su.pass ?? 1, 0, 1);
        const vis = p.track.filter((_, k) => k <= 40 * pass), a = M(p.entry), b = M(vis[vis.length - 1]);
        if (pass > 0) o.push(`<path d="M${F(a)}L${F(b)}" stroke="#fff" stroke-width="3" stroke-linecap="round" ${NS}/><path d="M${F(a)}L${F(b)}" stroke="${C.suture}" stroke-width="1.5" stroke-linecap="round" ${NS}/>`);
        if ((su.tie || 0) > 0.5) { const kp = M(p.knot); o.push(`<circle cx="${kp[0].toFixed(3)}" cy="${kp[1].toFixed(3)}" r="${(0.11 * (1 - 0.5 * (su.bury || 0))).toFixed(3)}" fill="${C.suture}" stroke="#fff" stroke-width="0.8" ${NS}/>`); A['knot' + i] = kp; }
        A['in' + i] = a; A['out' + i] = M(p.exit); A['cross' + i] = Pf(w.h, su.s); }
    }
    A.centre = ctr;
    return { svg: o.join(''), A, M };
  }

  // ---------------------------------------------------------------- key numbers for checks and narration
  const keyPoints = st => { st = S(st); const I = inner(st); return { rhoL: surfAt(0).rho, sApex: S_APEX, apexZ: PZ[0], lensZ: I.za, root: I.root, pm: I.pm, acd: PZ[0] - I.za }; };

  return { N, C, T, S_R3, surfAt, wallOf, P3, N3, Ts3, mer, clockDir, clockOf, planes, onPlane, toPlane, makeField, section, enface, enfaceMap, suturePath, gapAt, inner, keyPoints, contour,
    PRO, PHI_L, S_APEX, D2R, F, NS, ss, lerp, clamp, add, sub, dot, len, unit, cross, hash, prof, surfR };
})();
if (typeof module !== 'undefined') module.exports = GLOBE;
