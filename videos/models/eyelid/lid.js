// ============================================================================
// Eyelid sagittal model — right eye, central (mid-pupil) sagittal section.
// Units: mm. Anterior = -x, superior = -y. Globe centre (0,0).
// Lid tissues live in a lid frame: s = distance from the lid margin along the globe, u = depth from the posterior lid surface.
// ============================================================================
const LID = (() => {
  const D2R = Math.PI / 180;
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const hyp = a => Math.hypot(a[0], a[1]);
  const unit = a => { const l = hyp(a) || 1; return [a[0] / l, a[1] / l]; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const ss = (a, b, x) => ease((x - a) / (b - a));
  const F = p => p[0].toFixed(3) + ' ' + p[1].toFixed(3);
  const poly = (pts, close = true) => 'M' + pts.map(F).join('L') + (close ? 'Z' : '');
  const hash = (i, j) => { const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };

  function spline(c, step = 0.06) { // Catmull-Rom through control points
    const out = [];
    for (let i = 0; i < c.length - 1; i++) {
      const p0 = c[Math.max(0, i - 1)], p1 = c[i], p2 = c[i + 1], p3 = c[Math.min(c.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(hyp(sub(p2, p1)) / step));
      for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); }
    }
    out.push(c[c.length - 1]); return out;
  }
  const arclen = pts => { const s = [0]; for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + hyp(sub(pts[i], pts[i - 1]))); return s; };
  const rnormals = pts => pts.map((p, i) => { const t = unit(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])); return [-t[1], t[0]]; });
  // a polyline with arclength + right-hand normals; off(s, o) = point offset by o along the normal
  function track(pts) {
    const s = arclen(pts), N = rnormals(pts), L = s[s.length - 1];
    const idx = q => { let a = 0, b = s.length - 1; while (b - a > 1) { const m = (a + b) >> 1; s[m] <= q ? a = m : b = m; } return a; };
    const off = (q, o) => { const i = idx(Math.max(0, Math.min(L, q))), j = Math.min(i + 1, pts.length - 1), k = (q - s[i]) / ((s[j] - s[i]) || 1);
      return add(lerpP(pts[i], pts[j], k), unit(lerpP(N[i], N[j], k)), o); };
    const near = p => { let bi = 0, bd = 1e9; pts.forEach((q, i) => { const d = hyp(sub(p, q)); if (d < bd) { bd = d; bi = i; } }); return s[bi]; };
    // band between offsets o0(s) and o1(s) for s in [a,b]
    const band = (a, b, o0, o1, step = 0.05) => { const f = (o, q) => typeof o === 'function' ? o(q) : o, A = [], B = [];
      for (let q = a; q < b; q += step) { A.push(off(q, f(o0, q))); B.push(off(q, f(o1, q))); } A.push(off(b, f(o0, b))); B.push(off(b, f(o1, b)));
      return poly([...A, ...B.reverse()]); };
    const line = (a, b, o, step = 0.05) => { const r = []; for (let q = a; q < b; q += step) r.push(off(q, typeof o === 'function' ? o(q) : o)); r.push(off(b, typeof o === 'function' ? o(b) : o)); return r; };
    return { pts, s, L, off, near, band, line };
  }

  // ---------------------------------------------------------------- globe: sclera sphere R 12, cornea sphere r 7.8 (centre −5.3)
  const R = 12, CCX = -5.3, RC = 7.8;
  const corneaD = phi => { const dc = CCX * Math.cos(phi); return dc + Math.sqrt(dc * dc - CCX * CCX + RC * RC); };
  const surfR = phi => { const dC = corneaD(phi), k = 0.5; return (R + dC + Math.sqrt((R - dC) ** 2 + k * k)) / 2; };
  const gp = phi => { const r = surfR(phi); return [r * Math.cos(phi), r * Math.sin(phi)]; };
  const bisect = (f, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; (f(a) > 0) === (f(m) > 0) ? a = m : b = m; } return (a + b) / 2; };
  const PHI_LU = bisect(p => corneaD(p) - R, 185 * D2R, 260 * D2R);   // superior limbus
  const PHI_LL = 2 * Math.PI - PHI_LU;
  const PHI_SR = PHI_LU + 7.7 / R;                                      // SR insertion 7.7 mm behind the limbus
  const srTh = phi => (0.35 + 1.15 * ss(PHI_SR, PHI_SR + 24 * D2R, phi)) * ss(PHI_SR - 2.5 * D2R, PHI_SR + 1.5 * D2R, phi);
  const bulbTh = phi => 0.12 * ss(PHI_LU, PHI_LU + 3 * D2R, phi);

  // ---------------------------------------------------------------- upper lid frame
  const MARGIN_Y = -4.0; // upper lid margin 4 mm above the corneal light reflex (MRD1 ≈ 4)
  const PHI_MU = bisect(p => gp(p)[1] - MARGIN_Y, 180 * D2R, 240 * D2R);
  function buildFrame(phi0, dir, sMax) {
    const raw = [], phis = []; let s = 0, prev = null;
    for (let phi = phi0; ; phi += dir * 0.0012) { const p = gp(phi); if (prev) s += hyp(sub(p, prev)); if (s > sMax + 1.5) break; raw.push(p); phis.push(phi); prev = p; }
    const W = 40, pts = raw.map((_, i) => { let x = 0, y = 0, n = 0; for (let j = i - W; j <= i + W; j++) { const q = raw[Math.max(0, Math.min(raw.length - 1, j))]; x += q[0]; y += q[1]; n++; } return [x / n, y / n]; });
    for (let i = 0; i < 12; i++) pts[i] = lerpP(raw[i], pts[i], i / 12);
    const sArr = arclen(pts);
    const ns = pts.map((p, i) => { const t = unit(sub(pts[Math.min(pts.length - 1, i + 1)], pts[Math.max(0, i - 1)])); let n = [-t[1], t[0]]; if (n[0] * p[0] + n[1] * p[1] < 0) n = [-n[0], -n[1]]; return n; });
    const find = q => { let a = 0, b = sArr.length - 1; while (b - a > 1) { const m = (a + b) >> 1; sArr[m] <= q ? a = m : b = m; } return [a, (q - sArr[a]) / ((sArr[b] - sArr[a]) || 1)]; };
    const gap = phi => 0.10 + bulbTh(phi) + srTh(phi);
    const at = (q, u) => { const [i, k] = find(Math.max(0, q)), j = Math.min(i + 1, pts.length - 1);
      return add(lerpP(pts[i], pts[j], k), unit(lerpP(ns[i], ns[j], k)), gap(lerp(phis[i], phis[j], k)) + u); };
    const nrm = q => { const [i, k] = find(q); return unit(lerpP(ns[i], ns[Math.min(i + 1, ns.length - 1)], k)); };
    const tan = q => unit(sub(at(q + 0.05, 0), at(Math.max(0, q - 0.05), 0)));
    const phiAt = q => { const [i, k] = find(q); return lerp(phis[i], phis[Math.min(i + 1, phis.length - 1)], k); };
    const band = (s0, s1, u0, u1, step = 0.05) => { const f = (o, q) => typeof o === 'function' ? o(q) : o, A = [], B = [];
      for (let q = s0; q < s1; q += step) { A.push(at(q, f(u0, q))); B.push(at(q, f(u1, q))); } A.push(at(s1, f(u0, s1))); B.push(at(s1, f(u1, s1)));
      return poly([...A, ...B.reverse()]); };
    return { at, nrm, tan, phiAt, band };
  }
  const UF = buildFrame(PHI_MU, +1, 17);

  // ---------------------------------------------------------------- upper lid layout (mm)
  const S_TAR = 10, S_CREASE = 8, S_FORNIX = 14.2;
  const U_CONJ = 0.16, U_TAR = 1.12, U_APO = 1.185, U_SKIN = 2.02, U_MCJ = 0.34, U_ORIF = 0.62, U_GREY = 1.27;
  const tarTop = s => s < 8.4 ? 1 : Math.sqrt(Math.max(0, 1 - ((s - 8.4) / 1.6) ** 2));
  const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2)); // rounded anterior lid margin

  // levator complex: one smooth line = anterior surface of the aponeurosis, continuing as the top of the levator muscle
  // du(s): extra depth (toward the skin) of the lid part — the levator complex freed from the tarsus and conjunctiva (levator resection);
  // fixS: the cut edge advanced onto the anterior tarsus at fixS mm from the margin (the lid part then starts there)
  const LEV_LID = [[3.3, U_APO], [4.5, U_APO], [6.5, U_APO], [8.4, U_APO], [9.2, 1.15], [9.95, 1.0], [10.7, 0.9], [11.6, 0.9], [12.5, 0.9], [13.3, 0.92]];
  const LEV_ORB = [[-1.8, -15.05], [-0.8, -16.25], [1.0, -17.15], [3.5, -17.75], [9, -18.05], [20, -17.7], [45, -15.6]];
  const levTrack = (Fr, du, fixS) => { const lid = fixS == null ? LEV_LID : [[fixS, U_APO + 0.02], ...LEV_LID.filter(([s]) => s > fixS + 0.6)];
    return track(spline([...lid.map(([s, u]) => Fr.at(s, u + (du ? du(s) : 0))), ...LEV_ORB], 0.05)); };
  const LEV = levTrack(UF);
  const sLv = q => LEV.near(UF.at(q, 0.9));            // levator-track position that faces lid position q
  const S_J = LEV.near([1.0, -17.15]);                 // aponeurosis → muscle junction (≈ Whitnall level)

  // ---------------------------------------------------------------- fixed anatomy
  const ARCUS = [-12.0, -17.85];
  const boneFront = [[-14.4, -32], [-14.35, -24], [-14.15, -20.2], [-13.55, -18.55], [-12.6, -17.75], ARCUS];
  const boneCtrl = [...boneFront, [-11.3, -18.35], [-8.5, -19.25], [-2, -19.75], [8, -19.7], [20, -19.3], [45, -18.6]];
  const roofTop = [[45, -19.75], [20, -20.45], [8, -20.85], [-2, -20.95], [-6.2, -21.25], [-8.6, -23.4], [-10.2, -27], [-10.9, -32]];
  const RIM_Y = ARCUS[1];                  // level of the superior orbital rim margin (Manta 2025 measures the brow layers here and 5 mm above / below)
  const PERI = 0.25;                       // periosteum, drawn 0.25 mm thick (schematic: thicker than real so it shows at video resolution)
  // brow: lower edge 10.66 mm above the upper lid margin at the mid-pupil line (Gao 2025, young Chinese adults: men 10.45, women 10.86);
  // vertical extent 7 mm (schematic). The margin used is the MRD1 point (y = −4), so the brow height is fixed to the face, not to the lid.
  const BROW_LO = -4.0 - 10.66, BROW_H = 7.0;
  // brow and forehead skin, shared by both variants. Soft tissue in front of the rim (Manta 2025, MRI through the globe centre):
  // subcutaneous fat + orbicularis + ROOF ≈ 7.0 mm at the rim (ROOF 63–66 %), ≈ 5.2 mm 5 mm above it (ROOF 33–34 %); the forehead is schematic.
  const BROW_SKIN = [[-21.19, -18.35], [-21.15, -20.5], [-20.3, -22.85], [-18.95, -26], [-18.45, -29], [-18.3, -32]];
  // browY (mm, + = up) moves the brow block; weight 0 in the lid, 1 from the brow upward
  const wBrow = y => ss(-10.3, -14.6, y);
  const browShift = (p, browY) => browY ? [p[0], p[1] - browY * wBrow(p[1])] : p;

  // variant geometry. asian = Asian single eyelid (Jeong 1999, Arch Ophthalmol 117:907): septum fuses onto the aponeurosis BELOW the
  // superior tarsal border (fusion height here is schematic), preaponeurotic fat descends in front of the tarsus, pretarsal + more
  // subcutaneous / suborbicularis fat, aponeurotic insertion into orbicularis/skin closer to the margin → no crease.
  // caucasian = fusion above the tarsus, crease ≈ 8 mm with a skin fold.
  const VARIANTS = {
    asian: { S_FUS: 6.5, creaseH: 6.0, sept: [ARCUS, [-12.75, -16.5], [-12.85, -14.6], [-12.15, -12.6], [-10.9, -11.3], [-9.75, -10.6]], crease: false },
    caucasian: { S_FUS: 12, creaseH: null, sept: [ARCUS, [-12.75, -16.6], [-12.95, -15.0], [-12.25, -13.75], [-10.4, -13.4], [-7.4, -13.3], [-5.2, -13.25]], crease: true },
  };
  const uSkin = (v, s) => v.crease ? U_SKIN : U_SKIN + 0.45 * ss(0.8, 3.0, s);
  function geom(name) {
    const v = VARIANTS[name], S_F = sLv(v.S_FUS);
    const SEPT = track(spline([...v.sept, LEV.off(S_F, -0.07)], 0.05));
    return { v, S_F, SEPT, sk: skinPath(v, UF) };
  }
  // crease incision on the skin: surgeons mark it on the skin, measured up from the lash line. Asian single eyelid has no crease,
  // so the planned line is used (creaseH mm along the skin from the lash line; schematic); a lid with a crease uses the crease.
  function creaseOnSkin(sk, Fr, v) {
    const T = track(sk.pts), qLash = T.near(Fr.at(marginS(1.83), 1.83)), q = v.creaseH != null ? qLash + v.creaseH : T.near(sk.crease);
    const p = T.off(q, 0); let bs = 1, bd = 1e9; for (let s1 = 1; s1 <= S_TAR; s1 += 0.05) { const d = hyp(sub(Fr.at(s1, U_APO + 0.07), p)); if (d < bd) { bd = d; bs = s1; } }
    return { q, p, sT: bs };                                   // sT: lid level of the tarsus point the incision reaches
  }
  const creasePointUF = name => creaseOnSkin(skinPath(VARIANTS[name], UF), UF, VARIANTS[name]).p;
  function skinPath(v, Fr, browY = 0) {
    const brow = BROW_SKIN.map(p => browShift(p, browY));
    if (!v.crease) { // single eyelid: fuller lid, no crease; the skin comes forward above the tarsus to the brow (East Asian ROOF reaches into the lid)
      const c = [];
      for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(Fr.at(0, u));
      for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(Fr.at(marginS(u), u));
      for (let s = 0.5; s <= 3.6; s += 0.25) c.push(Fr.at(s, uSkin(v, s)));
      const up = spline([Fr.at(3.6, uSkin(v, 3.6)), Fr.at(4.3, uSkin(v, 4.3) + 0.12), [-12.6, -10.3], ...[[-14.45, -11.5], [-16.41, -12.85], [-18.05, -14.6], [-19.2, -16.5]].map(p => browShift(p, browY)), ...brow], 0.05);
      const pts = [...c, ...up.slice(1)];
      return { pts, crease: null, foldEdge: null };
    }
    const c = [];
    for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(Fr.at(0, u));
    for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(Fr.at(marginS(u), u));
    for (let s = 0.5; s <= 7.4; s += 0.25) c.push(Fr.at(s, U_SKIN));
    const k = Fr.at(S_CREASE, U_SKIN - 0.24);
    const fold = spline([Fr.at(7.4, U_SKIN), k, add(k, [-0.45, -0.55]), add(k, [-1.6, -0.62]), add(k, [-2.75, -0.2]), add(k, [-3.35, 0.55]), add(k, [-3.85, 0.72]),
      add(k, [-4.3, 0.3]), add(k, [-4.75, -0.75]), add(k, [-5.55, -2.35]), [-14.55, -15.0], ...[[-17.6, -16.3], [-19.6, -17.4]].map(p => browShift(p, browY)), ...brow], 0.05);
    return { pts: [...c, ...fold.slice(1)], crease: k, foldEdge: add(k, [-3.85, 0.72]) };
  }

  // ---------------------------------------------------------------- surgical states → deformation of the lid
  // state: curl (cicatricial entropion 0–1), cut (PLTR incision 3 mm from the margin, conjunctival side, 0–1), plane (dissection 0–1),
  //        k (correction 0–1: marginal strip rotates out), over (extra outward rotation, degrees), tuck (upper tarsal edge pulled down
  //        into the space in front of the marginal strip, 0–1), suture (0–1), scar (0–1)
  const S_CUT = 3, TH_E = 55 * D2R;
  const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1], co = Math.cos(a), si = Math.sin(a); return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; };
  // lid height (state mrd1, mm; default 4): ptosis or elevation slides the lid along the globe — a rotation about the globe centre, with a radial
  // correction so the lid keeps its distance from the (non-spherical, corneal) surface. Full for the tarsus, fading out toward the fornix.
  const wSlide = s => 1 - ss(S_TAR + 0.5, S_FORNIX + 1.0, s);
  const slideP = (p, a) => { if (!a) return p; const r = hyp(p), ph = Math.atan2(p[1], p[0]), ph2 = ph + a, r2 = r + surfR(ph2) - surfR(ph); return [r2 * Math.cos(ph2), r2 * Math.sin(ph2)]; };
  const slideCache = {};
  const slideAngle = mrd1 => { if (mrd1 == null || Math.abs(mrd1 - 4) < 1e-9) return 0; if (slideCache[mrd1] != null) return slideCache[mrd1];
    const M = UF.at(0, 0), target = M[1] + (4 - mrd1); return slideCache[mrd1] = bisect(a => slideP(M, a)[1] - target, -40 * D2R, 25 * D2R); };
  const slide = (p, s, st) => slideP(p, slideAngle(st.mrd1) * wSlide(s));
  function makeDeform(st) {
    const curl = st.curl || 0, k = st.k || 0, cutDone = (st.cut || 0) >= 1 || k > 0;
    const dSl = slideAngle(st.mrd1), push = 0.75 * (st.prolapse || 0);   // prolapse: the oedematous fornix conjunctiva lifts the lid off the globe (schematic)
    const a = -TH_E * curl * (1 - k) + (st.over || 0) * D2R;           // net rotation of the distal lid (− = inward)
    const tuck = st.tuck ?? 0.7 * k; const plane = st.plane || 0;
    const M0 = UF.at(0, 0), PT = UF.at(S_CUT, 0), t3 = UF.tan(S_CUT), n3 = UF.nrm(S_CUT);
    const wA = s => 1 - ss(1.0, 5.5, s);                                  // anterior lamella bends smoothly
    const wP = s => cutDone ? (s <= S_CUT + 1e-9 ? 1 : wA(s) * (1 - k)) : wA(s);   // posterior lamella: rigid strip once cut
    const f = (p, s, kind) => {
      const w = kind === 'post' ? wP(s) : wA(s); let q = p;
      if (a !== 0 && w > 0) { const ang = a * w;
        q = rot(q, a < 0 ? M0 : PT, ang); }   // inward: rolls about the posterior margin edge (stays on the globe, tarsus bows forward); outward: about the strip's upper posterior corner
      if (tuck > 0) {
        if (kind === 'post' && cutDone && s > S_CUT) { const g = tuck * (1 - ss(S_CUT, 6.0, s)); q = add(add(q, t3, -1.15 * g), n3, 1.08 * g); }
        if (kind === 'ant') q = add(q, UF.nrm(Math.max(s, 0)), tuck * 1.08 * ss(1.2, 2.4, s) * (1 - ss(3.6, 5.2, s)));
      }
      if (kind === 'ant' && plane > 0) q = add(q, UF.nrm(Math.max(s, 0)), plane * 0.35 * ss(0.5, 1.3, s) * (1 - ss(3.0, 4.6, s)));   // the dissected space opens up
      if (push) q = add(q, UF.nrm(Math.max(s, 0)), push * (1 - ss(S_FORNIX - 3, S_FORNIX + 1, s)));
      if (dSl) q = slideP(q, dSl * wSlide(s));
      return q;
    };
    f.cutDone = cutDone;
    return f;
  }
  function dframe(def, kind) {
    const at = (s, u) => def(UF.at(s, u), s, kind);
    const tan = s => unit(sub(at(s + 0.05, 0), at(Math.max(0, s - 0.05), 0)));
    const band = (s0, s1, u0, u1, step = 0.05) => { const g = (o, q) => typeof o === 'function' ? o(q) : o, A = [], B = [];
      for (let q = s0; q < s1; q += step) { A.push(at(q, g(u0, q))); B.push(at(q, g(u1, q))); } A.push(at(s1, g(u0, s1))); B.push(at(s1, g(u1, s1)));
      return poly([...A, ...B.reverse()]); };
    return { at, tan, nrm: s => { const t = tan(s); return [t[1], -t[0]]; }, band };
  }

  const C = {
    skin: '#eec7a8', skinS: '#c58c6c', orb: '#c6646f', orbB: '#9b3a47', riolan: '#ad4756', sept: '#f5f2ea', septS: '#a0957e',
    apo: '#f7f3e8', apoS: '#ad9d76', mus: '#b9525f', musF: '#d9838e', mul: '#dda6aa', mulF: '#c27b84', tar: '#f5eacb', tarS: '#c3ad7c',
    gland: '#f2d277', glandS: '#c8a23f', duct: '#e6b445', conj: '#e9a0a7', conjS: '#bf6a74', fat: '#f6d778', fatL: '#f9e4a0', fatS: '#d6ad47',
    ofat: '#f7ecc9', ofatS: '#eadaa5', base: '#f2dccb', sfat: '#f6e4bf', sfatL: '#f9ecd0', sfatS: '#e2c58c', bone: '#eee3cb', boneS: '#b9a477', boneD: '#e0d2b0', cranial: '#eef0f3',
    sclera: '#f8f6f2', scleraS: '#9aaab7', cornea: '#d8edf8', corneaS: '#7fb3d3', aq: '#eef7fc', iris: '#86573a', lens: '#edf1f7', lensS: '#aebdcd',
    cil: '#93644a', vit: '#fbfcfd', art: '#c0392b', lash: '#2b2019',
    roof: '#efca8c', roofL: '#f5dba9', roofS: '#cf9d55', peri: '#e3eaf3', periS: '#7d93ab'
  };
  const NS = 'vector-effect="non-scaling-stroke"';
  function lobules(o, clipId, region, x0, x1, y0, y1, r0, r1, fill, stroke, sw) {
    o.push(`<clipPath id="${clipId}"><path d="${region}"/></clipPath><g clip-path="url(#${clipId})">`);
    const st = (r0 + r1) * 0.95; let j = 0;
    for (let y = y0; y < y1; y += st * 0.87, j++) for (let x = x0 + (j % 2) * st / 2, i = 0; x < x1; x += st, i++) {
      const r = lerp(r0, r1, hash(i, j)), dx = (hash(j, i) - 0.5) * st * 0.3, dy = (hash(i + 7, j) - 0.5) * st * 0.3;
      o.push(`<ellipse cx="${(x + dx).toFixed(2)}" cy="${(y + dy).toFixed(2)}" rx="${r.toFixed(2)}" ry="${(r * (0.82 + 0.3 * hash(i, j + 3))).toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${NS}/>`); }
    o.push(`</g>`);
  }

  // layer thickness for the brow and the upper lid above the tarsus, keyed by the level y of the skin point (rest position). The layers are
  // laid along the skin normal, which points up and back here, so at a given height the deep layers come from skin about 1 mm lower: the
  // check (check.js #17) measures the horizontal thickness at the rim and 5 mm above / below it against Manta 2025. The split of
  // subcutaneous fat vs muscle at and above the rim, and the forehead values, are schematic.
  const pl = (y, T) => { if (y >= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (y >= T[i][0]) return lerp(T[i - 1][1], T[i][1], (y - T[i - 1][0]) / (T[i][0] - T[i - 1][0])); return T[T.length - 1][1]; };
  const SUBQ_T = [[-12.0, 0.9], [-12.85, 0.99], [-18.35, 1.2], [-22.85, 1.57], [-32, 1.6]];   // table values include a correction for the skin curvature, so the measured horizontal thickness meets the target
  const MUS_T = [[-12.0, 1.3], [-12.85, 1.37], [-18.35, 1.55], [-22.85, 2.04], [-27, 1.5], [-32, 1.3]];
  const SKIN_T = [[-12.0, 0.13], [-12.85, 0.15], [-17.5, 0.45], [-32, 0.5]];
  const WOUND = '#fbf1e6';
  // skin points of the levator-resection incisions, measured along the skin from the lash line (as the surgeon marks them):
  // lower line incH[1] mm (central height; template 4 mm, to be confirmed from the OP note), skin strip excW mm wide (template 5 mm)
  function excQ(SK, DA, st) {
    const qLash = SK.near(DA.at(marginS(1.83), 1.83)), inc = (st.incH || [2.5, 4, 4])[1], w = st.excW ?? 5;
    return { qLash, qLo: qLash + inc, qHi: qLash + inc + w };
  }

  // levator complex in the current state: LV0 attached, LVd freed from tarsus and conjunctiva (dis), LV as drawn (advance: cut edge on the tarsus).
  // A position q on LVd maps to LV through mapQ.
  function levState(DP, st) {
    const dis = st.dis || 0, adv = st.advance || 0, res = st.resect || 0, fixS = st.fixS ?? 7.5, resMm = st.resectMm ?? 6;
    const newLid = slideAngle(st.mrd1) !== 0 || !!st.prolapse || dis > 0 || adv > 0;
    const LV0 = levTrack(DP), LVd = dis > 0 ? levTrack(DP, s => 0.42 * dis * (1 - ss(12.0, 13.6, s))) : LV0;
    const sLvD = q => LVd.near(DP.at(q, 0.9)), S_JD = LVd.near([1.0, -17.15]), sClamp = sLvD(S_TAR) + resMm;
    let LV = LVd, mapQ = q => q;
    if (adv > 0) { const R1 = levTrack(DP, null, fixS), L0 = LVd.L - sClamp, N = 200, pts = [];
      for (let i = 0; i <= N; i++) { const t = i / N; pts.push(lerpP(LVd.off(sClamp + L0 * t, 0), R1.off(R1.L * t, 0), adv)); }
      LV = track(pts); mapQ = q => Math.max(0, (q - sClamp) * LV.L / L0); }
    return { dis, adv, res, fixS, newLid, LV0, LVd, sLvD, S_JD, sClamp, LV, mapQ };
  }
  // conjunctival prolapse: band on the globe from the fornix down to 2.2 mm × p below the lid margin (yM), thickening toward a rounded tip
  function prolapseGeom(p, yM) {
    const phF = UF.phiAt(S_FORNIX), phT = bisect(a => gp(a)[1] - (yM + 2.2 * p), 180 * D2R, phF), inn = [], out = [];
    for (let a = phF - 1.5 * D2R; a >= phT; a -= 0.004) { const g = gp(a), n = unit(g), b = srTh(a) + 0.08, t = ss(phF - 1.5 * D2R, phF - 8 * D2R, a), tipK = ss(phT + 6 * D2R, phT, a);
      inn.push(add(g, n, b)); out.push(add(g, n, b + lerp(0.15, 0.62, t) * p + 0.45 * p * tipK)); }
    const tip = [], c0 = inn[inn.length - 1], c1 = out[out.length - 1], cm = lerpP(c0, c1, 0.5), rr2 = hyp(sub(c1, c0)) / 2, dn = unit(sub(c1, c0)), tg = [-dn[1], dn[0]], sg = tg[1] > 0 ? 1 : -1;
    for (let k = 1; k < 12; k++) { const a = Math.PI * k / 12; tip.push(add(add(cm, dn, rr2 * Math.cos(a)), tg, sg * rr2 * Math.sin(a) * 0.9)); }
    const outline = [...inn, ...tip.reverse(), ...out.slice().reverse()];
    return { outline, mid: cm, low: Math.max(...outline.map(q => q[1])) };
  }

  // ---------------------------------------------------------------- draw. opt: { variant: 'asian' | 'caucasian', state: {…} }
  // levator resection states (all 0–1 unless noted): mrd1 (mm, lid height), excCut / excRemove (skin–orbicularis strip), septOpen, fatUp,
  // dis (levator complex freed), clamp, resect, advance, tarSut, creaseFix, browPlane, browSut, browTie, browY (mm), prolapse, fornixSut;
  // parameters incH [medial, central, lateral] (mm), excW, fixS (mm from the margin on the tarsus), resectMm, browFixH (mm above the rim), browLift.
  function draw(opt = {}) {
    const o = [], A = {}, st = opt.state || {}, pid = opt.id || 'lid';
    const G = geom(opt.variant || 'asian'), V = G.v, S_F = G.S_F;
    const DEF = makeDeform(st), DP = dframe(DEF, 'post'), DA = dframe(DEF, 'ant'), cutDone = DEF.cutDone;
    const browY = (st.browY || 0) + (st.browLift ?? 1.0) * (st.browTie || 0);
    const sk = skinPath(V, DA, browY);
    // levator complex: LV0 attached, LVd freed (dis), LV drawn (advanced: cut edge on the tarsus); q on LVd maps to LV through mapQ
    const { dis, adv, res, fixS, newLid, LV0, LVd, sLvD, S_JD, sClamp, LV, mapQ } = levState(DP, st);
    const onLV = (q, d) => LV.off(mapQ(q), d);
    // septum: fixed at the arcus, its lower end on the aponeurosis; when the lid slides (mrd1) the points in between follow in proportion
    const dSl = slideAngle(st.mrd1), septC = dSl ? V.sept.map((p, i) => i ? slideP(p, dSl * wSlide(V.S_FUS) * i / V.sept.length) : p) : V.sept;
    const SEPT = newLid ? track(spline([...septC, LVd.off(sLvD(V.S_FUS), -0.07)], 0.05)) : G.SEPT;
    const sFus = newLid ? sLvD(V.S_FUS) : LV.near(LEV.off(S_F, 0));
    const split = (s0, s1, fn) => cutDone && s0 < S_CUT && s1 > S_CUT ? [fn(s0, S_CUT - 0.02), fn(S_CUT + 0.02, s1)] : [fn(s0, s1)];
    // posterior lid margin rounding (long-standing entropion): radius 0.3 mm (schematic, < MCJ depth); the corner of every
    // posterior-lamella layer follows this arc, so nothing behind it shows through as a notch
    const rnd = 0.3 * (st.round || 0), rclip = rnd > 0.01 ? `${pid}Rnd` : null;
    const arcSU = r => { const a = []; for (let d = 270; d >= 180; d -= 6) a.push([rnd + r * Math.cos(d * D2R), rnd + r * Math.sin(d * D2R)]); return a; };   // (s,u): posterior surface → margin
    const corner = rclip ? arcSU(rnd).map(([q, u]) => DP.at(q, u)) : [DP.at(0, 0)];
    // 1 orbital soft tissue (everything behind the skin)
    // When the lid curls (entropion), hug the globe surface and the deformed posterior lamella
    // so the conjunctival sac (potential space) stays clear of orbital-tissue colour
    const curl = st.curl || 0;
    let baseMid;
    if (curl > 0.01) {
      baseMid = [];
      const phF = UF.phiAt(S_FORNIX);
      for (let a = 80 * D2R; a < phF; a += 2 * D2R) baseMid.push(gp(a));
      for (let s = S_FORNIX; s > 0.1; s -= 0.2) baseMid.push(DP.at(s, 0));
    } else {
      baseMid = [[0, 0]];
    }
    const base = [...sk.pts, [45, -32], [45, 6], ...baseMid, ...corner];
    o.push(`<path d="${poly(base)}" fill="${C.ofat}"/>`);
    lobules(o, pid + 'OF', poly(base), -12, 45, -21, 2, 0.45, 0.75, 'none', C.ofatS, 0.7);
    // 2 anterior lid / brow tissue between skin, bone, septum, aponeurosis and the tarsus front
    const tarFront = []; for (let q = adv > 0 ? fixS : 3.3; q >= 0; q -= 0.1) tarFront.push(DP.at(q, U_TAR));
    const levFront = adv > 0 ? [LV.off(0, -0.07)] : LV.line(0, sFus, -0.07).reverse().slice(1);
    const ant = [...sk.pts, ...boneFront, ...SEPT.pts.slice(1), ...levFront, ...tarFront];
    o.push(`<path d="${poly(ant)}" fill="${V.crease ? C.base : C.sfat}"/>`);
    if (!V.crease) lobules(o, pid + 'SF', poly(ant), -19, -6, -32, -1, 0.2, 0.34, C.sfatL, C.sfatS, 0.6); // suborbicularis + pretarsal fat
    // 2b ROOF (retro-orbicularis oculi fat) behind the orbicularis / frontalis over the rim (Manta 2025). East Asian: it continues into the upper
    // lid as the fat in front of the septum, so its colour fades into that fat; Caucasian: centred on the rim, none 5 mm below it (fade schematic).
    { const yb = y => y - browY * wBrow(y), lo = (V.crease ? [-16.3, -15.3] : [-13.6, -11.6]).map(yb), hi = [-25.5, -27.5].map(yb), y1 = hi[1], y2 = lo[1], f = y => ((y - y1) / (y2 - y1)).toFixed(4);
      o.push(`<linearGradient id="${pid}RoofG" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${f(hi[0])}" stop-color="#fff"/><stop offset="${f(lo[0])}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
      o.push(`<mask id="${pid}RoofM" maskUnits="userSpaceOnUse" x="-40" y="-40" width="100" height="50"><rect x="-40" y="-40" width="100" height="50" fill="url(#${pid}RoofG)"/></mask><g mask="url(#${pid}RoofM)"><path d="${poly(ant)}" fill="${C.roof}"/>`);
      lobules(o, pid + 'RoofL', poly(ant), -23.5, -11, -28.5, -10.5, 0.34, 0.58, C.roofL, C.roofS, 0.6);
      o.push(`</g>`); A.roofEnd = lo[1]; }
    // 3 preaponeurotic fat (septOpen + fatUp: the fat is retracted upward and the aponeurosis below it is exposed)
    const fatPts = [...SEPT.pts, ...LV.line(adv > 0 ? LV.near(SEPT.pts[SEPT.pts.length - 1]) : sFus, LV.near([4.5, -17.9]), -0.07), [4.5, -19.5], [-2, -19.68], [-8.5, -19.18], [-11.3, -18.3]];
    const qSc = (() => { let bi = 0, bd = 1e9; SEPT.pts.forEach((p, i) => { const d = Math.abs(p[1] - (st.septCutY ?? -12.0)); if (d < bd) { bd = d; bi = i; } }); return SEPT.s[bi]; })();
    const fatUp = (st.septOpen || 0) >= 1 ? (st.fatUp || 0) : 0, yRet = SEPT.off(qSc, 0)[1] - 2.6 * fatUp;
    if (fatUp > 0) o.push(`<clipPath id="${pid}FatUp"><path d="M-40 -40H60V${yRet.toFixed(3)}H-40Z"/></clipPath><clipPath id="${pid}FatLo"><path d="M-40 ${yRet.toFixed(3)}H60V30H-40Z"/></clipPath><path d="${poly(fatPts)}" fill="${WOUND}" clip-path="url(#${pid}FatLo)"/><g clip-path="url(#${pid}FatUp)">`);
    o.push(`<path d="${poly(fatPts)}" fill="${C.fat}"/>`);
    lobules(o, pid + 'Fat', poly(fatPts), -13.5, 5, -19.8, -9.5, 0.32, 0.55, C.fatL, C.fatS, 0.7);
    if (fatUp > 0) { o.push(`</g>`); o.push(`<clipPath id="${pid}FatE"><path d="${poly(fatPts)}"/></clipPath><path d="M-16 ${yRet.toFixed(3)}H8" stroke="${C.fatS}" stroke-width="1.6" clip-path="url(#${pid}FatE)" ${NS}/>`); A.fatUp = [-6.0, yRet - 1.6]; }
    A.fat = [-9.0, -16.9];

    // 4 globe: sclera shell, cornea, anterior chamber, iris, lens, ciliary body, choroid / retina
    const globe = []; for (let a = 0; a < 360; a += 0.5) globe.push(gp(a * D2R));
    o.push(`<path d="${poly(globe)}" fill="${C.sclera}" stroke="${C.scleraS}" stroke-width="1.2" ${NS}/>`);
    o.push(`<circle cx="0" cy="0" r="11.0" fill="${C.vit}"/>`);
    const cOut = []; for (let a = PHI_LU + 0.6 * D2R; a >= PHI_LL - 0.6 * D2R; a -= 0.005) cOut.push(gp(a));
    const cInR = 7.25, cInX = CCX + 0.05, cIn = [];
    for (let k = 0; k <= 80; k++) { const y = lerp(5.95, -5.95, k / 80); cIn.push([cInX - Math.sqrt(cInR * cInR - y * y), y]); }
    const irisU = [[-9.42, -5.78], [-9.8, -4.7], [-10.2, -3.0], [-10.3, -2.0], [-10.02, -2.0], [-9.92, -3.0], [-9.55, -4.55], [-9.2, -5.6]];
    o.push(`<path d="${poly([...cIn.slice().reverse(), [-9.42, 5.78], [-10.38, 2.0], [-9.92, 0], [-10.38, -2.0], [-9.42, -5.78]])}" fill="${C.aq}"/>`);
    o.push(`<g opacity="0.7">`);
    o.push(`<ellipse cx="-7.9" cy="0" rx="2.0" ry="4.6" fill="${C.lens}" stroke="${C.lensS}" stroke-width="1" ${NS}/>`);
    for (const sg of [1, -1]) {
      o.push(`<path d="${poly(irisU.map(p => [p[0], p[1] * sg]))}" fill="${C.iris}"/>`);
      const wall = [], inner = []; for (let a = 211; a <= 239.5; a += 0.5) { const r = 11.0, th = lerp(1.05, 0.18, ss(214, 239.5, a)) * (a < 213 ? ss(211, 213, a) : 1);
        wall.push([r * Math.cos(a * D2R), r * Math.sin(a * D2R) * sg]); inner.push([(r - th) * Math.cos(a * D2R), (r - th) * Math.sin(a * D2R) * sg]); }
      o.push(`<path d="${poly([...wall, ...inner.reverse()])}" fill="${C.cil}"/>`);
      for (let k = 0; k < 5; k++) o.push(`<path d="M${F([-8.85 + k * 0.2, -6.25 * sg])}L${F([-7.95 + k * 0.08, -4.5 * sg])}" stroke="#c9bcae" stroke-width="0.6" ${NS}/>`);
    }
    o.push(`</g>`);
    const arc = (r, a0, a1) => { const p = []; for (let a = a0; a <= a1; a += 0.5) p.push([r * Math.cos(a * D2R), r * Math.sin(a * D2R)]); return p; };
    o.push(`<path d="${poly(arc(10.95, 239.5, 480.5), false)}" fill="none" stroke="#a46f5a" stroke-width="1.8" ${NS} opacity="0.6"/>`);
    o.push(`<path d="${poly(arc(10.78, 239.5, 480.5), false)}" fill="none" stroke="#e3a59d" stroke-width="1.2" ${NS} opacity="0.75"/>`);
    o.push(`<path d="${poly([...cOut, ...cIn])}" fill="${C.cornea}" stroke="${C.corneaS}" stroke-width="1" ${NS}/>`);
    A.cornea = gp(186 * D2R);

    // 5 superior rectus
    const srIn = [], srOut = [];
    for (let a = PHI_SR - 2.5 * D2R; a <= 276 * D2R; a += 0.004) { const p = gp(a); srIn.push(p); srOut.push(add(p, unit(p), srTh(a))); }
    const tp = srIn[srIn.length - 1], tq = srOut[srOut.length - 1];
    o.push(`<path d="${poly([...srIn, add(tp, [14, 1.2]), add(tq, [14, 0.9]), ...srOut.reverse()])}" fill="${C.mus}"/>`);
    for (const f of [0.33, 0.66]) { const l = []; for (let a = PHI_SR + 4 * D2R; a <= 276 * D2R; a += 0.01) { const p = gp(a); l.push(add(p, unit(p), srTh(a) * f)); } l.push(add(l[l.length - 1], [14, 1.0]));
      o.push(`<path d="${poly(l, false)}" fill="none" stroke="${C.musF}" stroke-width="1" ${NS}/>`); }
    A.sr = add(gp(272 * D2R), unit(gp(272 * D2R)), 0.8);

    // conjunctiva and tarsus are clipped to the rounded corner
    if (rclip) { const edge = (u, a, b) => { const r = []; for (let q = a; a < b ? q <= b : q >= b; q += a < b ? 0.1 : -0.1) r.push(DP.at(q, u)); return r; };   // follow the curved lid, not a straight chord
      o.push(`<clipPath id="${rclip}"><path d="${poly([...edge(3, 16, 0), ...corner.slice().reverse(), ...edge(-3, rnd, 16)])}"/></clipPath>`); }
    const gOpen = () => rclip ? `<g clip-path="url(#${rclip})">` : '<g>';
    // 6 conjunctiva: margin (posterior edge → MCJ) + palpebral → fornix → bulbar; palpebral splits at the incision
    o.push(gOpen());
    const palLine = (s0, s1) => { const r = []; for (let q = s0; q < s1; q += 0.05) r.push(DP.at(q, U_CONJ / 2)); r.push(DP.at(s1, U_CONJ / 2)); return r; };
    const bul = [], phF = UF.phiAt(S_FORNIX);
    for (let a = phF; a >= PHI_LU - 0.5 * D2R; a -= 0.003) { const p = gp(a); bul.push(add(p, unit(p), srTh(a) + 0.06)); }
    const pf = DP.at(S_FORNIX, U_CONJ / 2), bf = bul[0], mid = lerpP(pf, bf, 0.5), rr = hyp(sub(pf, bf)) / 2, tdir = UF.tan(S_FORNIX), dd = unit(sub(pf, mid));
    const cap = []; for (let k = 1; k < 14; k++) { const a = Math.PI * k / 14; cap.push(add(add(mid, dd, rr * Math.cos(a)), tdir, rr * Math.sin(a) * 1.6)); }
    const palParts = split(0, S_FORNIX, (a0, a1) => palLine(a0, a1)); palParts[palParts.length - 1].push(...cap, ...bul);
    for (const pp of palParts) { const CJ = track(pp); o.push(`<path d="${CJ.band(0, CJ.L, -0.075, 0.075)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`); }
    const uMcj = lerp(U_MCJ, 0.95, st.mcjShift || 0);                           // scarring drags the MCJ forward, past the meibomian orifices
    o.push('</g>');
    A.conj = DP.at(5.5, U_CONJ / 2); A.fornix = add(mid, tdir, rr * 1.6);
    if (st.scar) for (const q of [1.4, 2.3, 4.0, 5.2, 6.5, 7.6]) { const p0 = DP.at(q, 0.02), p1 = DP.at(q + 0.45, 0.1);
      o.push(`<path d="M${F(p0)}L${F(p1)}" stroke="#fff" stroke-width="${(1.6 + 1.6 * st.scar).toFixed(2)}" stroke-linecap="round" opacity="${(0.5 + 0.5 * st.scar).toFixed(2)}" ${NS}/>`); }
    // 6b conjunctival prolapse: the superior fornix conjunctiva, oedematous, slides down between lid and globe and bulges below the margin
    // (length below the margin 2.2 mm × prolapse, thickness schematic)
    if (st.prolapse) { const P = prolapseGeom(st.prolapse, DP.at(0, 0)[1]);
      o.push(`<path d="${poly(P.outline)}" fill="#ef9aa3" stroke="${C.conjS}" stroke-width="0.8" ${NS}/>`);
      A.prolapse = P.mid; A.prolapseLow = P.low; A.prolapsePts = P.outline; }

    // 6c surgical space left where the levator complex was freed from the tarsus and conjunctiva (and where it was resected)
    const sM0 = sLvD(9.55), mulW = q => 0.67 * ss(sM0, sM0 + 0.5, q) * (1 - ss(S_JD - 2.2, S_JD + 0.6, q));
    if (dis > 0) { const qTop = sLvD(13.3), back0 = q => q < sM0 ? 0.075 : 0.07 + mulW(q), P = [], Q = [];
      for (let q = 0; q <= qTop; q += 0.05) { P.push(LV0.off(q, back0(q))); Q.push(LVd.off(q, -0.075)); }
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${WOUND}" opacity="${Math.min(1, dis * 2).toFixed(2)}"/>`); A.disSpace = lerpP(LV0.off(sLvD(10.6), 0.5), LVd.off(sLvD(10.6), 0.5), 0.5); }

    // 7 Müller muscle (resected with the levator below the clamp; after advancement only the part above the clamp is left)
    const mulBand = (a, b, op, fib = b - 0.6) => { if (b <= a) return; const qa = mapQ(a), qb = mapQ(b), qf = mapQ(fib), w = q => mulW(adv > 0 ? sClamp + q * (LVd.L - sClamp) / LV.L : q), os = op < 1 ? ` opacity="${op.toFixed(2)}"` : '';
      o.push(`<path d="${LV.band(qa, qb, 0.07, q => 0.07 + w(q))}" fill="${C.mul}"${os}/>`);
      if (qf - qa > 0.7) o.push(`<path d="${poly(LV.line(qa + 0.6, qf, q => 0.07 + w(q) * 0.5), false)}" fill="none" stroke="${C.mulF}" stroke-width="0.8" ${NS}${os}/>`); };
    if (adv > 0) mulBand(Math.max(sM0, sClamp), S_JD + 0.6, 1, S_JD - 0.6);
    else if (res > 0) { mulBand(sM0, sClamp, 1 - res); mulBand(sClamp, S_JD + 0.6, 1, S_JD - 0.6); }
    else mulBand(sM0, S_JD + 0.6, 1, S_JD - 0.6);
    A.muller = onLV(sLvD(12.4), 0.42);

    // 8 tarsus + meibomian gland — two pieces once the incision is through
    o.push(gOpen());
    for (const t of split(0, S_TAR, (a0, a1) => DP.band(a0, a1, U_CONJ, q => U_CONJ + (U_TAR - U_CONJ) * tarTop(q))))
      o.push(`<path d="${t}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.9" ${NS}/>`);
    const gl = []; let gi = 0;
    for (let q = 0.7; q < 8.9; q += 0.24, gi++) for (const du of [-0.17, 0.17]) { const qq = q + (du > 0 ? 0.12 : 0); if (cutDone && Math.abs(qq - S_CUT) < 0.16) continue;
      const c = DP.at(qq, U_ORIF + du + (hash(gi, du > 0 ? 1 : 2) - 0.5) * 0.06);
      gl.push(`<circle cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" r="${(0.095 + 0.03 * hash(gi, 5)).toFixed(3)}" fill="${C.gland}" stroke="${C.glandS}" stroke-width="0.6" ${NS}/>`); }
    o.push(gl.join(''));
    for (const d of split(0, 8.95, (a0, a1) => DP.band(a0, a1, U_ORIF - 0.055, U_ORIF + 0.055))) o.push(`<path d="${d}" fill="${C.duct}"/>`);
    o.push('</g>');
    // margin conjunctiva (posterior edge → MCJ), drawn over the tarsal edge; wraps the corner when the margin is rounded
    const mOut = rclip ? [...arcSU(rnd), [0, U_MCJ]] : [[0, 0], [0, U_MCJ]], mIn = rclip ? [...arcSU(rnd - 0.06), [0.06, U_MCJ]] : [[0.06, 0], [0.06, U_MCJ]];
    o.push(`<path d="${poly([...mOut, ...mIn.reverse()].map(([q, u]) => DP.at(q, u)))}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);
    A.tarsus = DP.at(6.2, 0.95); A.gland = DP.at(4.0, U_ORIF + 0.18); A.tarsusZ = DP.at(1.5, 1.0); A.glandZ = DP.at(2.4, U_ORIF + 0.17); A.orifice = DP.at(0, U_ORIF);
    A.strip = DP.at(1.6, 0.64); A.upper = DP.at(4.6, 0.64); A.wedge = DP.at(3.55, 0.64);

    // 9 levator: aponeurosis on the anterior tarsus → muscle belly under the roof
    const musW = q => 1.75 * ss(S_JD - 1.0, S_JD + 2.6, q), apoW = q => 0.075 * (1 - ss(S_JD + 0.8, S_JD + 2.2, q));
    const levBands = (a, b, op) => { if (b <= a) return; const qa = mapQ(a), qb = mapQ(b), back = q => adv > 0 ? sClamp + q * (LVd.L - sClamp) / LV.L : q, os = op < 1 ? ` opacity="${op.toFixed(2)}"` : '';
      const a1 = Math.min(qb, mapQ(S_JD + 2.2)); if (a1 > qa) o.push(`<path d="${LV.band(qa, a1, -0.075, q => apoW(back(q)))}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.7" ${NS}${os}/>`);
      const m0 = Math.max(qa, mapQ(S_JD - 1.0)); if (qb > m0) { o.push(`<path d="${LV.band(m0, qb, -0.05, q => musW(back(q)))}" fill="${C.mus}"${os}/>`);
        const f0 = Math.max(qa, mapQ(S_JD + 0.8)); if (qb > f0) for (const f of [0.28, 0.55, 0.8]) o.push(`<path d="${poly(LV.line(f0, qb, q => musW(back(q)) * f), false)}" fill="none" stroke="${C.musF}" stroke-width="1" ${NS}${os}/>`); } };
    if (adv > 0) levBands(sClamp, LVd.L, 1);
    else if (res > 0) { levBands(0, sClamp, 1 - res); levBands(sClamp, LVd.L, 1); }
    else levBands(0, LVd.L, 1);
    if (!dis) { if (V.crease) for (const q of [7.0, 7.45, 7.9]) o.push(`<path d="M${F(DP.at(q, U_APO + 0.07))}Q${F(DA.at(q + 0.2, 1.62))} ${F(add(sk.crease, UF.nrm(S_CREASE), -0.1))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`);
      else for (const q of [3.6, 4.0, 4.4]) o.push(`<path d="M${F(DP.at(q, U_APO + 0.07))}Q${F(DA.at(q - 0.15, 1.6))} ${F(DA.at(q - 0.35, 1.95))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`); }
    A.apo = onLV(sLvD(11.0), -0.05); A.levator = onLV(S_JD + 6, 0.9); A.crease = sk.crease;
    A.levEnd = LV.off(0, 0); A.fix = DP.at(fixS, U_APO + 0.02); A.clampQ = sClamp;

    // 10 orbital septum (septOpen: cut at septCutY, default 2 mm above the fusion; fatUp retracts the upper flap with the fat)
    const septBand = (a, b) => SEPT.band(a, b, q => -0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)), q => 0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)));
    const sOpen = (st.septOpen || 0) >= 1, qRet = SEPT.near([SEPT.off(qSc, 0)[0], yRet]);
    const septParts = sOpen ? [[0, Math.min(qSc - 0.3, qRet)], [qSc + 0.3, SEPT.L]] : [[0, SEPT.L]];
    for (const [a, b] of septParts) if (b > a) o.push(`<path d="${septBand(a, b)}" fill="${C.sept}" stroke="${C.septS}" stroke-width="0.8" ${NS}/>`);
    if (st.septOpen && !sOpen) { const c = SEPT.off(qSc, 0), t = unit(sub(SEPT.off(qSc + 0.1, 0), SEPT.off(qSc - 0.1, 0))), n = [-t[1], t[0]], e = add(c, n, 0.5 * st.septOpen);
      o.push(`<path d="M${F(add(c, n, -0.5))}L${F(e)}" stroke="#d23c3c" stroke-width="2.4" stroke-linecap="round" ${NS}/>`); }
    A.septum = SEPT.off(SEPT.L * 0.3, 0); A.fusion = newLid ? LVd.off(sLvD(V.S_FUS), -0.07) : LEV.off(S_F, -0.07); A.septCut = SEPT.off(qSc, 0);

    // 11 anterior lamella: skin + subcutaneous fat + orbicularis (fibres run mediolaterally → sectioned across) / frontalis (vertical fibres)
    const SK = track(sk.pts), Ltot = SK.L;
    const sAnt = SK.near(DA.at(marginS(1.58), 1.58));
    const SKY = q => SK.off(q, 0)[1], NX = q => Math.abs(SK.off(q, 1)[0] - SK.off(q, 0)[0]);
    const yR = q => { const y = SKY(q); return y + browY * wBrow(y); };            // level of this skin point before the brow moved
    const wBr = V.crease ? q => ss(-15.0, -16.6, yR(q)) : q => ss(-10.3, -12.0, yR(q));   // 0 in the lid (unchanged), 1 in the brow region
    const qAtY = y => { let bi = 0, bd = 1e9; for (let q = 0; q < Ltot; q += 0.05) { const d = Math.abs(yR(q) - y); if (d < bd) { bd = d; bi = q; } } return bi; };
    let orbW, subq;
    const skT = q => lerp(0.13, pl(yR(q), SKIN_T) * NX(q), wBr(q));
    if (V.crease) { const sC = SK.near(sk.crease), sE = SK.near(sk.foldEdge);
      const orb0 = q => { if (q < sAnt) return 0; if (q < sC) return 0.6 * ss(sAnt, sAnt + 0.5, q) * (1 - 0.55 * ss(sC - 0.6, sC, q));
        return lerp(0.27, 0.62, ss(sC, sC + 0.8, q)) * (1 - 0.3 * ss(sE - 0.5, sE, q) * (1 - ss(sE, sE + 0.5, q))); };
      orbW = q => lerp(orb0(q), pl(yR(q), MUS_T) * NX(q), wBr(q)); subq = q => pl(yR(q), SUBQ_T) * NX(q) * wBr(q);
      A.skin = SK.off(sE + 3.0, 0); A.orb = SK.off(sE + 1.6, 0.48);
    } else {
      orbW = q => q < sAnt ? 0 : lerp(0.58 * ss(sAnt, sAnt + 0.5, q), pl(yR(q), MUS_T) * NX(q), wBr(q));
      subq = q => lerp(0.2 * ss(sAnt + 0.8, sAnt + 2.5, q), pl(yR(q), SUBQ_T) * NX(q), wBr(q));
      const qs = qAtY(-13.3), qo = qAtY(-12.9), qu = qAtY(-13.7);
      A.skin = SK.off(qs, 0); A.orb = SK.off(qo, skT(qo) + subq(qo) + orbW(qo) * 0.5); A.subq = SK.off(qu, skT(qu) + subq(qu) * 0.5);
    }
    const deepAt = q => skT(q) + subq(q) + orbW(q);
    // lid-crease approach: incision at the (planned) crease through skin + orbicularis; the pretarsal skin–muscle flap below it
    // swings forward, hinged near the lash line, exposing the tarsus
    const CR = creaseOnSkin(sk, DA, V), qC = CR.q, qH = SK.near(DA.at(0.7, uSkin(V, 0.7)));
    const open = (st.crease || 0) >= 1 || (st.flap || 0) > 0, H = SK.off(qH, 0), fAng = -(st.flap || 0) * 24 * D2R;
    const ft = (p, q) => (st.flap && q > qH && q <= qC) ? rot(p, H, fAng * ss(qH, qH + 0.3 * (qC - qH), q)) : p;
    // levator-resection skin incisions: lower line qLo, upper line qHi; excRemove takes the strip of skin, subcutaneous tissue and orbicularis
    const EX = excQ(SK, DA, st), exc = (st.excCut || 0) >= 1 || (st.excRemove || 0) > 0, rem = st.excRemove || 0;
    const pieces = exc ? [[0, EX.qLo - 0.02, 1], [EX.qLo + 0.02, EX.qHi - 0.02, 1 - rem], [EX.qHi + 0.02, Ltot, 1]] : open ? [[0, qC - 0.02, 1], [qC + 0.02, Ltot, 1]] : [[0, Ltot, 1]];
    const bandF = (o0, o1, fill, extra = '', qMin = 0) => pieces.forEach(([a0, b, op]) => { const a = Math.max(a0, qMin); if (b <= a || op <= 0) return;
      const g = (v, q) => typeof v === 'function' ? v(q) : v, P = [], Q = [];
      for (let q = a; q < b; q += 0.05) { P.push(ft(SK.off(q, g(o0, q)), q)); Q.push(ft(SK.off(q, g(o1, q)), q)); } P.push(ft(SK.off(b, g(o0, b)), b)); Q.push(ft(SK.off(b, g(o1, b)), b));
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${fill}"${extra}${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`); });
    const tarFrontAt = q => DP.at(q, U_APO + 0.07);
    if (st.flap) { const inner = [], back = []; for (let q = qH; q <= qC; q += 0.05) inner.push(ft(SK.off(q, skT(q) + subq(q) + orbW(q)), q));
      for (let q = CR.sT; q >= 0.8; q -= 0.1) back.push(tarFrontAt(q));
      o.push(`<path d="${poly([...inner, ...back])}" fill="#fbf1e6"/>`);
      A.exposedTarsus = DP.at((CR.sT + 1.0) / 2, U_APO); }
    if (rem > 0) { const P = SK.line(EX.qLo, EX.qHi, 0), Q = []; for (let q = EX.qLo; q <= EX.qHi + 1e-9; q += 0.05) Q.push(SK.off(q, deepAt(q)));
      o.push(`<path d="${poly([...P, ...Q.reverse()])}" fill="${WOUND}" opacity="${Math.min(1, rem).toFixed(2)}"/>`); A.wound = SK.off((EX.qLo + EX.qHi) / 2, deepAt((EX.qLo + EX.qHi) / 2) * 0.5); }
    const qBr0 = V.crease ? (() => { for (let q = 0; q < Ltot; q += 0.05) if (wBr(q) > 0) return q; return Ltot; })() : 0;
    bandF(q => skT(q) - 0.01, q => skT(q) + subq(q), C.sfat, ` stroke="${C.sfatS}" stroke-width="0.5" ${NS}`, qBr0);
    bandF(q => skT(q) + subq(q) - 0.01, q => skT(q) + subq(q) + orbW(q), C.orb);
    const pieceOp = q => { for (const [a, b, op] of pieces) if (q >= a && q <= b) return op; return 0; };
    const FRONT_Y = -21.5;                                                      // above this the muscle is frontalis (fibres run vertically)
    const dots = []; let di = 0;
    for (let q = sAnt + 0.25; q < Ltot - 0.2; q += 0.28, di++) { const w = orbW(q); if (w < 0.28 || (open && Math.abs(q - qC) < 0.2) || pieceOp(q) < 0.5 || yR(q) < FRONT_Y) continue;
      for (let d = skT(q) + subq(q) + 0.15, dj = 0; d < skT(q) + subq(q) + w - 0.08; d += 0.25, dj++) { const qq = q + (hash(di, dj) - 0.5) * 0.12, c = ft(SK.off(qq, d), qq); dots.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.085" ry="0.07" fill="${C.orbB}" opacity="0.5"/>`); } }
    o.push(dots.join(''));
    { const qF = qAtY(FRONT_Y + 0.6); for (const f of [0.3, 0.55, 0.8]) o.push(`<path d="${poly(SK.line(qF, Ltot - 0.2, q => skT(q) + subq(q) + orbW(q) * f), false)}" fill="none" stroke="${C.orbB}" stroke-width="0.9" opacity="0.55" ${NS}/>`);
      const qf = qAtY(-26), qo2 = qAtY(-18.35); A.frontalis = SK.off(qf, skT(qf) + subq(qf) + orbW(qf) * 0.5); A.orbBrow = SK.off(qo2, skT(qo2) + subq(qo2) + orbW(qo2) * 0.5); }
    bandF(0, skT, C.skin);
    for (const [a, b, op] of pieces) { if (op <= 0) continue; const L = SK.line(a, b, 0).map((p, i, arr) => ft(p, a + (b - a) * i / Math.max(1, arr.length - 1))); o.push(`<path d="${poly(L, false)}" fill="none" stroke="${C.skinS}" stroke-width="1.1" ${NS}${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`); }
    if (uMcj > U_MCJ + 0.005) o.push(`<path d="${DP.band(0, 0.13, U_MCJ, uMcj)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);   // shifted MCJ: conjunctiva now covers this part of the margin
    if (st.crease) { const sk0 = SK.off(qC, 0), tf = tarFrontAt(CR.sT), e = lerpP(sk0, tf, Math.min(1, st.crease));
      o.push(`<path d="M${F(sk0)}L${F(e)}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`); A.creaseCut = lerpP(sk0, tf, 0.35); A.creaseSkin = sk0; }
    if (st.excCut && rem < 1) for (const q of [EX.qLo, EX.qHi]) { const s0 = SK.off(q, 0), e = SK.off(q, deepAt(q) * Math.min(1, st.excCut));
      o.push(`<path d="M${F(s0)}L${F(e)}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" opacity="${(1 - rem).toFixed(2)}" ${NS}/>`); }
    A.incLo = SK.off(EX.qLo, 0); A.incHi = SK.off(EX.qHi, 0); A.lashSkin = SK.off(EX.qLash, 0); A.excQ = EX;
    A.flap = ft(SK.off((qH + qC) / 2, 0.13 + 0.35), (qH + qC) / 2);
    A.pretarsalFat = DA.at(4.6, 1.5);
    // brow: hairs from the skin between the brow's lower and upper edge (sagittal plane at mid-pupil), slanting up; follicles in the dermis
    { const lo = BROW_LO, hi = BROW_LO - BROW_H, hs = [], qLoB = qAtY(lo), qHiB = qAtY(hi); let k = 0;
      for (let q = qLoB; q <= qHiB; q += 0.42, k++) { const S0 = SK.off(q, 0), n = unit(sub(SK.off(q, 1), S0)), t = unit(sub(SK.off(q + 0.05, 0), SK.off(q - 0.05, 0))), a = (11 + 8 * hash(k, 41)) * D2R;
        const d = add([t[0] * Math.cos(a), t[1] * Math.cos(a)], n, -Math.sin(a)), len = 2.0 + 0.9 * hash(k, 42), root = SK.off(q - 0.25, skT(q) + subq(q) * 0.55), tip = add(S0, d, len), c = add(add(S0, d, len * 0.5), n, -0.25);
        hs.push(`<path d="M${F(root)}L${F(S0)}" stroke="#7a5640" stroke-width="0.05"/><circle cx="${root[0].toFixed(3)}" cy="${root[1].toFixed(3)}" r="0.1" fill="#8a5e43"/><path d="M${F(S0)}Q${F(c)} ${F(tip)}" fill="none" stroke="${C.lash}" stroke-width="0.07" stroke-linecap="round"/>`); }
      o.push(hs.join('')); A.brow = SK.off((qLoB + qHiB) / 2, -1.0); A.browLo = SK.off(qLoB, 0); A.browHi = SK.off(qHiB, 0); }
    // muscle of Riolan (the grey line)
    o.push(`<path d="${DA.band(0.02, 1.7, U_TAR, q => U_TAR + 0.32 * (1 - ss(1.2, 1.7, q)))}" fill="${C.riolan}"/>`);
    for (let q = 0.2; q < 1.5; q += 0.28) { const c = DA.at(q, U_TAR + 0.16); o.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.06" ry="0.05" fill="#7e2a36" opacity="0.6"/>`); }
    A.grey = DA.at(0, U_GREY); A.mcj = DP.at(0, uMcj); A.postMargin = DP.at(rnd * 0.3, rnd * 0.3 + 0.02);
    // arterial arcades
    const ma = DA.at(2.45, U_TAR + 0.13), pa = onLV(sLvD(11.0), 0.12);
    o.push(`<circle cx="${ma[0]}" cy="${ma[1]}" r="0.12" fill="${C.art}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="0.13" fill="${C.art}"/>`);
    A.marg = ma; A.peri = pa;

    // 12 lash follicles + lashes (lashes are built on the undeformed lid, then carried along with the margin)
    const t0 = UF.tan(0.2), n0 = UF.nrm(0.2), dA = p => DEF(p, 0, 'ant');
    const inward = Math.max(0, TH_E * (st.curl || 0) * (1 - (st.k || 0)) - (st.over || 0) * D2R), ec = ss(0, 0.6 * TH_E, inward);
    const onCornea = (y, off) => { const ph = bisect(p => gp(p)[1] - y, 100 * D2R, 260 * D2R), p = gp(ph); return add(p, unit(p), off); };
    [[1.70, 0.9, 0.0], [1.83, 0.97, 0.35], [1.95, 0.84, -0.3]].forEach(([u, len, j], k) => {
      const E0 = UF.at(marginS(u), u), E = DA.at(marginS(u), u), B = DA.at(2.05 + 0.15 * k, u - 0.14);
      o.push(`<path d="${track(spline([E, lerpP(E, B, 0.5), B], 0.05)).band(0, hyp(sub(B, E)), -0.085, 0.085)}" fill="#f1d2bb" stroke="#c09074" stroke-width="0.6" ${NS}/>`);
      o.push(`<ellipse cx="${B[0].toFixed(3)}" cy="${B[1].toFixed(3)}" rx="0.12" ry="0.12" fill="#8a5e43"/>`);
      let c1 = dA(add(add(E0, t0, -0.8 * len), n0, 1.7 * len)), c2 = dA(add(add(E0, t0, -0.1 * len), n0, 5.0 * len)), tip = dA(add(add(E0, t0, (2.3 + j) * len), n0, 7.4 * len));
      if (ec > 0) { const y0 = E[1]; c1 = lerpP(c1, onCornea(y0 + 1.6, 0.12), ec); c2 = lerpP(c2, onCornea(y0 + 4.5 * len, 0.14 + 0.1 * k), ec); tip = lerpP(tip, onCornea(y0 + (7.0 + j) * len, 0.18 + 0.15 * k), ec); }
      o.push(`<path d="M${F(B)}L${F(E)}" stroke="#7a5640" stroke-width="0.04"/><path d="M${F(E)}C${F(c1)} ${F(c2)} ${F(tip)}" fill="none" stroke="${C.lash}" stroke-width="0.075" stroke-linecap="round"/>`);
      const bez = t => [0, 1].map(j => (1 - t) ** 3 * E[j] + 3 * (1 - t) ** 2 * t * c1[j] + 3 * (1 - t) * t * t * c2[j] + t ** 3 * tip[j]);
      if (k === 1) { A.follicle = lerpP(E, B, 0.62); A.lash = bez(0.22); A.lashTip = tip; }
    });

    // 12b examination overlays: MCJ marker and meibomian orifice, conjunctival contraction, misdirected / metaplastic lashes
    if (st.mcj) { const m0 = DP.at(0, uMcj), m1 = add(m0, DP.tan(0), -0.35), oo = DP.at(0, U_ORIF);
      o.push(`<g opacity="${st.mcj}"><path d="M${F(m0)}L${F(m1)}" stroke="#0e7c6b" stroke-width="3" stroke-linecap="round" ${NS}/><circle cx="${oo[0].toFixed(3)}" cy="${oo[1].toFixed(3)}" r="0.07" fill="#e9c35e" stroke="#9c7a20" stroke-width="1" ${NS}/></g>`); }
    if (st.contract) { const arrow = (a, b) => { const d = unit(sub(b, a)), nn = [-d[1], d[0]], h = add(b, d, -0.3);
        return `<path d="M${F(a)}L${F(h)}" stroke="#d23c3c" stroke-width="2.6" ${NS}/><path d="${poly([b, add(h, nn, 0.18), add(h, nn, -0.18)])}" fill="#d23c3c"/>`; };
      o.push(`<g opacity="${st.contract}">${arrow(DP.at(7.0, -0.5), DP.at(5.2, -0.5))}${arrow(DP.at(1.4, -0.5), DP.at(3.2, -0.5))}</g>`); A.contract = DP.at(4.2, -0.5); }
    if (st.misdirected || st.metaplastic) {
      const amber = (pts, op) => `<path d="M${F(pts[0])}C${F(pts[1])} ${F(pts[2])} ${F(pts[3])}" fill="none" stroke="#b86e00" stroke-width="0.08" stroke-linecap="round" opacity="${op}"/>`;
      if (st.misdirected) { const E = DA.at(marginS(1.75), 1.75), t = DA.tan(0.2), P = [E, add(E, t, -1.0), onCornea(E[1] + 2.0, 0.12), onCornea(E[1] + 4.2, 0.16)];
        o.push(amber(P, st.misdirected)); A.misLash = onCornea(E[1] + 2.6, 0.14); }
      if (st.metaplastic) { const E = DP.at(0, U_ORIF), t = DP.tan(0.2), P = [E, add(E, t, -0.6), onCornea(E[1] + 1.4, 0.1), onCornea(E[1] + 3.4, 0.14)];
        o.push(`<circle cx="${E[0].toFixed(3)}" cy="${E[1].toFixed(3)}" r="0.06" fill="#b86e00" opacity="${st.metaplastic}"/>` + amber(P, st.metaplastic)); A.metaLash = onCornea(E[1] + 2.2, 0.12); }
    }

    // 13 surgical overlays: dissection plane, incision, suture
    if (st.plane) { const P0 = [], P1 = []; for (let q = 0.7; q <= S_CUT; q += 0.05) { P0.push(DP.at(q, U_TAR)); P1.push(DA.at(q, U_TAR + 0.02)); }
      o.push(`<path d="${poly([...P0, ...P1.reverse()])}" fill="#0e7c6b" opacity="${(0.42 * st.plane).toFixed(2)}"/>`); A.plane = DP.at(2.0, U_TAR + 0.06); }
    // BLTR: full-thickness incision from the skin (3 mm from the margin) through to the conjunctiva; ghostCut = where PLTR would cut (posterior lamella only)
    if (st.bltr) { const sk0 = DA.at(S_CUT, uSkin(V, S_CUT)), cj = DP.at(S_CUT, 0), e = lerpP(sk0, cj, Math.min(1, st.bltr));
      o.push(`<path d="M${F(sk0)}L${F(e)}" stroke="#d23c3c" stroke-width="2.8" stroke-linecap="round" ${NS}/>`); A.bltrSkin = sk0; A.bltrMid = lerpP(sk0, cj, 0.5); }
    if (st.ghostCut) o.push(`<path d="M${F(DP.at(S_CUT, 0))}L${F(DP.at(S_CUT, U_TAR))}" stroke="#d23c3c" stroke-width="2" stroke-dasharray="3 3" opacity="${st.ghostCut}" ${NS}/>`);
    if (st.ghostCut || st.bltr) A.postCut = DP.at(S_CUT, U_TAR * 0.5);
    if (st.cut) { const c0 = DP.at(S_CUT - (cutDone ? 0.02 : 0), 0), c1 = DP.at(S_CUT - (cutDone ? 0.02 : 0), U_TAR), e = lerpP(c0, c1, Math.min(1, st.cut));
      o.push(`<path d="M${F(c0)}L${F(e)}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`);
      if (cutDone) o.push(`<path d="M${F(DP.at(S_CUT + 0.02, 0))}L${F(DP.at(S_CUT + 0.02, U_TAR))}" stroke="#d23c3c" stroke-width="2.6" stroke-linecap="round" ${NS}/>`);
      A.cut = lerpP(c0, c1, 0.5); }
    if (st.suture) { const qB = qH + 0.5, P1 = DP.at(3.45, 0.55), P3 = st.buried ? ft(SK.off(qB, skT(qB) + subq(qB) + orbW(qB) * 0.55), qB) : DA.at(0.85, uSkin(V, 0.85) + 0.02);
      const P2 = st.buried ? lerpP(P1, P3, 0.5) : lerpP(DP.at(1.9, U_TAR), DA.at(1.9, U_TAR + 0.25), 0.5);
      const N = 40, pts = []; for (let i = 0; i <= N * Math.min(1, st.suture); i++) { const t = i / N; pts.push([0, 1].map(j => (1 - t) ** 2 * P1[j] + 2 * (1 - t) * t * (2 * P2[j] - (P1[j] + P3[j]) / 2) + t * t * P3[j])); }
      if (pts.length > 1) o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#2463eb" stroke-width="2.4" stroke-linecap="round" ${NS}/>`);
      if (st.suture >= 1 && st.buried) o.push(`<circle cx="${P3[0].toFixed(3)}" cy="${P3[1].toFixed(3)}" r="0.12" fill="#2463eb"/>`);
      if (st.suture >= 1 && !st.buried) { const nk = DA.nrm(0.85), tk = DA.tan(0.85);
        o.push(`<circle cx="${P3[0].toFixed(3)}" cy="${P3[1].toFixed(3)}" r="0.13" fill="#2463eb"/>`);
        for (const sg of [-1, 1]) o.push(`<path d="M${F(P3)}l${(nk[0] * 0.7 + tk[0] * 0.3 * sg).toFixed(3)} ${(nk[1] * 0.7 + tk[1] * 0.3 * sg).toFixed(3)}" stroke="#2463eb" stroke-width="2.2" stroke-linecap="round" ${NS}/>`); }
      A.suture = P2; A.sutureExit = P3; }
    // 13b levator resection overlays
    const stitch = (pts, frac, knot) => { const T = track(spline(pts, 0.03)), L = T.L * Math.min(1, frac); if (L <= 0.05) return '';
      return `<path d="${poly(T.line(0, L, 0), false)}" fill="none" stroke="#2463eb" stroke-width="2.2" stroke-linecap="round" ${NS}/>` + (knot && frac >= 1 ? `<circle cx="${knot[0].toFixed(3)}" cy="${knot[1].toFixed(3)}" r="0.16" fill="#2463eb"/>` : ''); };
    if (res > 0 && adv < 1) { const n = unit(sub(LVd.off(sClamp, 1), LVd.off(sClamp, 0))), c = LVd.off(sClamp, 0.3);   // cut line just distal to the clamp
      o.push(`<path d="M${F(add(c, n, -0.75))}L${F(add(c, n, 0.75))}" stroke="#d23c3c" stroke-width="2.4" stroke-linecap="round" opacity="${Math.min(1, res * 2).toFixed(2)}" ${NS}/>`); }
    if (st.clamp) { const qc = mapQ(sClamp) + 0.65, c = LV.off(qc, 0), t = unit(sub(LV.off(qc + 0.1, 0), LV.off(qc - 0.1, 0))), n = [-t[1], t[0]], bw = 0.07 + mulW(sClamp + 0.65);
      const jaw = (d0, d1) => poly([add(add(c, t, -0.6), n, d0), add(add(c, t, 0.6), n, d0), add(add(c, t, 0.6), n, d1), add(add(c, t, -0.6), n, d1)]);
      const hand = unit(sub(SK.off((EX.qLo + EX.qHi) / 2, 0), c)), h0 = add(c, n, -0.62);
      o.push(`<g opacity="${st.clamp}"><path d="${jaw(-0.12, -0.62)}" fill="#5d6b78" stroke="#2f3a44" stroke-width="0.8" ${NS}/><path d="${jaw(bw + 0.05, bw + 0.55)}" fill="#5d6b78" stroke="#2f3a44" stroke-width="0.8" ${NS}/>`
        + `<path d="M${F(h0)}L${F(add(h0, hand, 3.2))}" stroke="#5d6b78" stroke-width="3.2" stroke-linecap="round" opacity="0.85" ${NS}/></g>`);
      A.clamp = add(c, n, -0.4); }
    if (st.tarSut) { const bite = DP.at(fixS, 0.62), e = LV.off(0, 0), lt = unit(sub(LV.off(0.3, 0), e)), ln = [-lt[1], lt[0]], knot = add(add(e, lt, 0.55), ln, -0.3);
      o.push(stitch([bite, DP.at(fixS + 0.35, U_TAR + 0.05), add(add(e, lt, 0.9), ln, 0.15), add(add(e, lt, 0.9), ln, -0.25), knot], st.tarSut, knot));
      o.push(`<circle cx="${bite[0].toFixed(3)}" cy="${bite[1].toFixed(3)}" r="0.13" fill="#2463eb"/>`); A.tarSut = bite; A.tarKnot = knot; }
    if (st.creaseFix) { const q0 = EX.qLo - 0.35, P0 = SK.off(q0, skT(q0) + subq(q0) + orbW(q0) * 0.6), qL = LV.near(P0), P2 = LV.off(qL, -0.08), P1 = add(lerpP(P0, P2, 0.5), [0, -0.25]);
      o.push(stitch([P0, P1, P2], st.creaseFix, P2)); A.creaseFix = P1; A.creaseFixEnds = [P0, P2]; }
    if (st.fornixSut) { const P0 = DP.at(S_FORNIX - 0.8, U_CONJ / 2), q1 = EX.qLo - 0.6, P2 = SK.off(q1, 0), Pm = add(lerpP(P0, P2, 0.5), [-0.6, -0.4]);
      o.push(stitch([P0, Pm, P2], st.fornixSut, P2)); A.fornixSut = Pm; A.fornixSutPts = track(spline([P0, Pm, P2], 0.05)).pts; }

    // 14 bone: superior orbital rim + roof, with its periosteum (continuous with the septum at the arcus marginalis and with the periorbita)
    o.push(`<path d="${poly([[-10.9, -32], [-10.2, -27], [-8.6, -23.4], [-6.2, -21.25], [-2, -20.95], [8, -20.85], [20, -20.45], [45, -19.6], [45, -32]])}" fill="${C.cranial}"/>`);
    const bo = [...spline(boneCtrl, 0.1), ...spline(roofTop, 0.1)];
    o.push(`<path d="${poly(bo)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    o.push(`<clipPath id="${pid}Bone"><path d="${poly(bo)}"/></clipPath><g clip-path="url(#${pid}Bone)">`);
    let bj = 0; for (let y = -31.5; y < -17.5; y += 0.62, bj++) for (let x = -14.2 + (bj % 2) * 0.35, bi = 0; x < -8; x += 0.7, bi++) o.push(`<circle cx="${(x + (hash(bi, bj) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.1 + 0.1 * hash(bj, bi)).toFixed(2)}" fill="${C.boneD}"/>`);
    o.push(`</g>`);
    const PT = track(spline(boneCtrl.slice(0, 8), 0.05)), qArc = PT.near(ARCUS);
    o.push(`<path d="${PT.band(0, PT.L, 0, PERI)}" fill="${C.peri}" stroke="${C.periS}" stroke-width="0.7" ${NS}/>`);
    A.rim = [-12.6, -22.5]; A.periosteum = PT.off(PT.near([-14.3, -25.5]), PERI * 0.5);
    const PB = [...PT.line(0, qArc, PERI), ...SEPT.line(0, SEPT.L, 0.075)];       // deep boundary of the layers in front: periosteum, then septum
    const crossX = (pts, y) => { let best = null; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i];
      if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) { const x = a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); if (best === null || x < best) best = x; } } return best; };
    const musLine = SK.line(0, Ltot, deepAt);
    { const y = RIM_Y - 0.5, xm = crossX(musLine, y), xb = crossX(PB, y); A.roof = [(xm + xb) / 2, y]; }

    // 15 internal brow fixation: dissection plane on the deep side of ROOF (in front of the septum, then on the periosteum) from the upper wound
    // edge up past the fixation point (plane drawn 0.35 mm wide, schematic); suture from ROOF to the periosteum browFixH mm above the rim;
    // browTie lifts the brow block by browLift mm (schematic default 1 mm: the procedure mainly prevents descent)
    const fixH = st.browFixH ?? 3, yP = RIM_Y - fixH, lift = st.browLift ?? 1.0;
    if (st.browPlane) { const pTop = yP - 3.0, deep = SK.off(EX.qHi, deepAt(EX.qHi)); let i0 = 0, bd = 1e9; PB.forEach((p, i) => { const d = hyp(sub(p, deep)); if (d < bd) { bd = d; i0 = i; } });
      let i1 = 0; for (let i = 0; i < PB.length; i++) if (PB[i][1] <= pTop + 0.05 && PB[i][1] >= pTop - 0.6) { i1 = i; break; }
      const seg = PB.slice(Math.min(i0, i1), Math.max(i0, i1) + 1).reverse(), T = track(seg), L = T.L * Math.min(1, st.browPlane), sgn = T.off(T.L / 2, 0.3)[0] < T.off(T.L / 2, 0)[0] ? 1 : -1;
      // offsets toward the skin (anterior) are negative or positive depending on the direction of the trace; sgn picks the anterior side
      o.push(`<path d="${T.band(0, L, 0, 0.35 * sgn)}" fill="#0e7c6b" opacity="0.42"/>`); A.browPlane = T.off(L * 0.6, 0.18 * sgn); A.browPlanePts = T.pts; }
    if (st.browSut) { const qP = PT.near([-14.3, yP]), P2 = PT.off(qP, PERI * 0.5), yB = P2[1] + lift * (1 - Math.min(1, st.browTie || 0));
      const xm = crossX(musLine, yB), xb = crossX(PB, yB), P1 = [(xm + xb) / 2, yB], Pm = add(lerpP(P1, P2, 0.5), [-0.5, 0]);
      o.push(stitch([P1, Pm, P2], st.browSut, st.browTie >= 1 ? P2 : null)); o.push(`<circle cx="${P2[0].toFixed(3)}" cy="${P2[1].toFixed(3)}" r="0.13" fill="#2463eb"/>`);
      A.browSutP = P2; A.browSutR = P1; A.browSut = Pm; }
    A.lid = { browY, BROW_LO, BROW_H, RIM_Y, fixS, sClamp };
    return { svg: o.join(''), A, DP, DA, skinAt: (q, d) => ft(SK.off(q, d), q), qOf: p => SK.near(p),
      probe: { skin: SK.line(0, Ltot, 0), skinB: SK.line(0, Ltot, skT), subqB: SK.line(0, Ltot, q => skT(q) + subq(q)), musB: musLine, pb: PB, bone: spline(boneCtrl, 0.05) }, crossX, LV, LVd, LV0 };
  }
  // the sagittal points the coronal view needs, without drawing (same construction as draw)
  function keyPoints(st = {}, variant = 'asian') {
    const V = VARIANTS[variant], DEF = makeDeform(st), DP = dframe(DEF, 'post'), DA = dframe(DEF, 'ant'), browY = (st.browY || 0) + (st.browLift ?? 1.0) * (st.browTie || 0);
    const SK = track(skinPath(V, DA, browY).pts), EX = excQ(SK, DA, st), fixS = st.fixS ?? 7.5;
    const L = levState(DP, st), cl = L.LV.off(L.mapQ(L.sClamp) + 0.65, 0.3);
    return { margin: DP.at(0, 0), tarTop: DP.at(S_TAR, 0.6), lash: SK.off(EX.qLash, 0), incLo: SK.off(EX.qLo, 0), incHi: SK.off(EX.qHi, 0), fix: DP.at(fixS, 0.62), clamp: cl, browY,
      prolapseLow: st.prolapse ? prolapseGeom(st.prolapse, DP.at(0, 0)[1]).low : null };
  }
  return { draw, keyPoints, slide, slideAngle, wSlide, creasePointUF, makeDeform, levTrack, levState, gp, RIM_Y, PERI, BROW_LO, BROW_H, wBrow, boneCtrl, S_CUT, S_TAR, U_TAR, U_SKIN, uSkin, UF, LEV, geom, VARIANTS, sLv, S_J, ARCUS, hash, spline, track, poly, F, add, sub, unit, hyp, lerp, ss, NS, C };
})();
if (typeof module !== 'undefined') module.exports = LID;
