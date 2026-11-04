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
  const levTrack = Fr => track(spline([Fr.at(3.3, U_APO), Fr.at(4.5, U_APO), Fr.at(6.5, U_APO), Fr.at(8.4, U_APO), Fr.at(9.2, 1.15), Fr.at(9.95, 1.0), Fr.at(10.7, 0.9),
    Fr.at(11.6, 0.9), Fr.at(12.5, 0.9), Fr.at(13.3, 0.92), [-1.8, -15.05], [-0.8, -16.25], [1.0, -17.15], [3.5, -17.75], [9, -18.05], [20, -17.7], [45, -15.6]], 0.05));
  const LEV = levTrack(UF);
  const sLv = q => LEV.near(UF.at(q, 0.9));            // levator-track position that faces lid position q
  const S_J = LEV.near([1.0, -17.15]);                 // aponeurosis → muscle junction (≈ Whitnall level)

  // ---------------------------------------------------------------- fixed anatomy
  const ARCUS = [-12.0, -17.85];
  const boneFront = [[-14.4, -32], [-14.35, -24], [-14.15, -20.2], [-13.55, -18.55], [-12.6, -17.75], ARCUS];
  const boneCtrl = [...boneFront, [-11.3, -18.35], [-8.5, -19.25], [-2, -19.75], [8, -19.7], [20, -19.3], [45, -18.6]];
  const roofTop = [[45, -19.75], [20, -20.45], [8, -20.85], [-2, -20.95], [-6.2, -21.25], [-8.6, -23.4], [-10.2, -27], [-10.9, -32]];

  // variant geometry. asian = Asian single eyelid (Jeong 1999, Arch Ophthalmol 117:907): septum fuses onto the aponeurosis BELOW the
  // superior tarsal border (fusion height here is schematic), preaponeurotic fat descends in front of the tarsus, pretarsal + more
  // subcutaneous / suborbicularis fat, aponeurotic insertion into orbicularis/skin closer to the margin → no crease.
  // caucasian = fusion above the tarsus, crease ≈ 8 mm with a skin fold.
  const VARIANTS = {
    asian: { S_FUS: 6.5, sept: [ARCUS, [-12.75, -16.5], [-12.85, -14.6], [-12.15, -12.6], [-10.9, -11.3], [-9.75, -10.6]], crease: false },
    caucasian: { S_FUS: 12, sept: [ARCUS, [-12.75, -16.6], [-12.95, -15.0], [-12.25, -13.75], [-10.4, -13.4], [-7.4, -13.3], [-5.2, -13.25]], crease: true },
  };
  const uSkin = (v, s) => v.crease ? U_SKIN : U_SKIN + 0.45 * ss(0.8, 3.0, s);
  function geom(name) {
    const v = VARIANTS[name], S_F = sLv(v.S_FUS);
    const SEPT = track(spline([...v.sept, LEV.off(S_F, -0.07)], 0.05));
    return { v, S_F, SEPT, sk: skinPath(v, UF) };
  }
  function skinPath(v, Fr) {
    if (!v.crease) { // single eyelid: fuller lid, no crease, smooth to the brow
      const c = [];
      for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(Fr.at(0, u));
      for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(Fr.at(marginS(u), u));
      for (let s = 0.5; s <= 3.6; s += 0.25) c.push(Fr.at(s, uSkin(v, s)));
      const up = spline([Fr.at(3.6, uSkin(v, 3.6)), Fr.at(4.3, uSkin(v, 4.3) + 0.12), [-12.6, -10.3], [-13.4, -12.1], [-14.2, -14.1], [-15.05, -16.1], [-15.85, -18.0], [-16.5, -20.2], [-16.9, -23], [-17.1, -32]], 0.05);
      const pts = [...c, ...up.slice(1)];
      return { pts, crease: null, foldEdge: null };
    }
    const c = [];
    for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(Fr.at(0, u));
    for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(Fr.at(marginS(u), u));
    for (let s = 0.5; s <= 7.4; s += 0.25) c.push(Fr.at(s, U_SKIN));
    const k = Fr.at(S_CREASE, U_SKIN - 0.24);
    const fold = spline([Fr.at(7.4, U_SKIN), k, add(k, [-0.45, -0.55]), add(k, [-1.6, -0.62]), add(k, [-2.75, -0.2]), add(k, [-3.35, 0.55]), add(k, [-3.85, 0.72]),
      add(k, [-4.3, 0.3]), add(k, [-4.75, -0.75]), add(k, [-5.55, -2.35]), [-14.55, -15.0], [-15.65, -17.0], [-16.45, -19.5], [-16.9, -23], [-17.1, -32]], 0.05);
    return { pts: [...c, ...fold.slice(1)], crease: k, foldEdge: add(k, [-3.85, 0.72]) };
  }

  // ---------------------------------------------------------------- surgical states → deformation of the lid
  // state: curl (cicatricial entropion 0–1), cut (PLTR incision 3 mm from the margin, conjunctival side, 0–1), plane (dissection 0–1),
  //        k (correction 0–1: marginal strip rotates out), over (extra outward rotation, degrees), tuck (upper tarsal edge pulled down
  //        into the space in front of the marginal strip, 0–1), suture (0–1), scar (0–1)
  const S_CUT = 3, TH_E = 55 * D2R;
  const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1], co = Math.cos(a), si = Math.sin(a); return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; };
  function makeDeform(st) {
    const curl = st.curl || 0, k = st.k || 0, cutDone = (st.cut || 0) >= 1 || k > 0;
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
    cil: '#93644a', vit: '#fbfcfd', art: '#c0392b', lash: '#2b2019'
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

  // ---------------------------------------------------------------- draw. opt: { variant: 'asian' | 'caucasian', state: {…} }
  function draw(opt = {}) {
    const o = [], A = {}, st = opt.state || {}, pid = opt.id || 'lid';
    const G = geom(opt.variant || 'asian'), V = G.v, SEPT = G.SEPT, S_F = G.S_F;
    const DEF = makeDeform(st), DP = dframe(DEF, 'post'), DA = dframe(DEF, 'ant'), cutDone = DEF.cutDone;
    const sk = skinPath(V, DA), LV = levTrack(DP), sLvD = q => LV.near(DP.at(q, 0.9)), S_JD = LV.near([1.0, -17.15]);
    const split = (s0, s1, fn) => cutDone && s0 < S_CUT && s1 > S_CUT ? [fn(s0, S_CUT - 0.02), fn(S_CUT + 0.02, s1)] : [fn(s0, s1)];
    // 1 orbital soft tissue (everything behind the skin)
    const base = [...sk.pts, [45, -32], [45, 6], [0, 0], DP.at(0, 0)];
    o.push(`<path d="${poly(base)}" fill="${C.ofat}"/>`);
    lobules(o, pid + 'OF', poly(base), -12, 45, -21, 2, 0.45, 0.75, 'none', C.ofatS, 0.7);
    // 2 anterior lid / brow tissue between skin, bone, septum, aponeurosis and the tarsus front
    const tarFront = []; for (let q = 3.3; q >= 0; q -= 0.1) tarFront.push(DP.at(q, U_TAR));
    const ant = [...sk.pts, ...boneFront, ...SEPT.pts.slice(1), ...LV.line(0, LV.near(LEV.off(S_F, 0)), -0.07).reverse().slice(1), ...tarFront];
    o.push(`<path d="${poly(ant)}" fill="${V.crease ? C.base : C.sfat}"/>`);
    if (!V.crease) lobules(o, pid + 'SF', poly(ant), -19, -6, -32, -1, 0.2, 0.34, C.sfatL, C.sfatS, 0.6); // suborbicularis + pretarsal fat
    // 3 preaponeurotic fat
    const fatPts = [...SEPT.pts, ...LV.line(LV.near(LEV.off(S_F, 0)), LV.near([4.5, -17.9]), -0.07), [4.5, -19.5], [-2, -19.68], [-8.5, -19.18], [-11.3, -18.3]];
    o.push(`<path d="${poly(fatPts)}" fill="${C.fat}"/>`);
    lobules(o, pid + 'Fat', poly(fatPts), -13.5, 5, -19.8, -9.5, 0.32, 0.55, C.fatL, C.fatS, 0.7);
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

    // 6 conjunctiva: margin (posterior edge → MCJ) + palpebral → fornix → bulbar; palpebral splits at the incision
    const palLine = (s0, s1) => { const r = []; for (let q = s0; q < s1; q += 0.05) r.push(DP.at(q, U_CONJ / 2)); r.push(DP.at(s1, U_CONJ / 2)); return r; };
    const bul = [], phF = UF.phiAt(S_FORNIX);
    for (let a = phF; a >= PHI_LU - 0.5 * D2R; a -= 0.003) { const p = gp(a); bul.push(add(p, unit(p), srTh(a) + 0.06)); }
    const pf = DP.at(S_FORNIX, U_CONJ / 2), bf = bul[0], mid = lerpP(pf, bf, 0.5), rr = hyp(sub(pf, bf)) / 2, tdir = UF.tan(S_FORNIX), dd = unit(sub(pf, mid));
    const cap = []; for (let k = 1; k < 14; k++) { const a = Math.PI * k / 14; cap.push(add(add(mid, dd, rr * Math.cos(a)), tdir, rr * Math.sin(a) * 1.6)); }
    const palParts = split(0, S_FORNIX, (a0, a1) => palLine(a0, a1)); palParts[palParts.length - 1].push(...cap, ...bul);
    for (const pp of palParts) { const CJ = track(pp); o.push(`<path d="${CJ.band(0, CJ.L, -0.075, 0.075)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`); }
    o.push(`<path d="${DP.band(0, 0.06, 0, U_MCJ)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);
    A.conj = DP.at(5.5, U_CONJ / 2); A.fornix = add(mid, tdir, rr * 1.6);
    if (st.scar) for (const q of [1.4, 2.3, 4.0, 5.2, 6.5, 7.6]) { const p0 = DP.at(q, 0.02), p1 = DP.at(q + 0.45, 0.1);
      o.push(`<path d="M${F(p0)}L${F(p1)}" stroke="#fff" stroke-width="${(1.6 + 1.6 * st.scar).toFixed(2)}" stroke-linecap="round" opacity="${(0.5 + 0.5 * st.scar).toFixed(2)}" ${NS}/>`); }

    // 7 Müller muscle
    const sM0 = sLvD(9.55), mulW = q => 0.67 * ss(sM0, sM0 + 0.5, q) * (1 - ss(S_JD - 2.2, S_JD + 0.6, q));
    o.push(`<path d="${LV.band(sM0, S_JD + 0.6, 0.07, q => 0.07 + mulW(q))}" fill="${C.mul}"/>`);
    o.push(`<path d="${poly(LV.line(sM0 + 0.6, S_JD - 0.6, q => 0.07 + mulW(q) * 0.5), false)}" fill="none" stroke="${C.mulF}" stroke-width="0.8" ${NS}/>`);
    A.muller = LV.off(sLvD(12.4), 0.42);

    // 8 tarsus + meibomian gland — two pieces once the incision is through
    for (const t of split(0, S_TAR, (a0, a1) => DP.band(a0, a1, U_CONJ, q => U_CONJ + (U_TAR - U_CONJ) * tarTop(q))))
      o.push(`<path d="${t}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.9" ${NS}/>`);
    const gl = []; let gi = 0;
    for (let q = 0.7; q < 8.9; q += 0.24, gi++) for (const du of [-0.17, 0.17]) { const qq = q + (du > 0 ? 0.12 : 0); if (cutDone && Math.abs(qq - S_CUT) < 0.16) continue;
      const c = DP.at(qq, U_ORIF + du + (hash(gi, du > 0 ? 1 : 2) - 0.5) * 0.06);
      gl.push(`<circle cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" r="${(0.095 + 0.03 * hash(gi, 5)).toFixed(3)}" fill="${C.gland}" stroke="${C.glandS}" stroke-width="0.6" ${NS}/>`); }
    o.push(gl.join(''));
    for (const d of split(0, 8.95, (a0, a1) => DP.band(a0, a1, U_ORIF - 0.055, U_ORIF + 0.055))) o.push(`<path d="${d}" fill="${C.duct}"/>`);
    A.tarsus = DP.at(6.2, 0.95); A.gland = DP.at(4.0, U_ORIF + 0.18); A.tarsusZ = DP.at(1.5, 1.0); A.glandZ = DP.at(2.4, U_ORIF + 0.17); A.orifice = DP.at(0, U_ORIF);
    A.strip = DP.at(1.6, 0.64); A.upper = DP.at(4.6, 0.64); A.wedge = DP.at(3.55, 0.64);

    // 9 levator: aponeurosis on the anterior tarsus → muscle belly under the roof
    o.push(`<path d="${LV.band(0, S_JD + 2.2, -0.075, q => 0.075 * (1 - ss(S_JD + 0.8, S_JD + 2.2, q)))}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.7" ${NS}/>`);
    const musW = q => 1.75 * ss(S_JD - 1.0, S_JD + 2.6, q);
    o.push(`<path d="${LV.band(S_JD - 1.0, LV.L, -0.05, musW)}" fill="${C.mus}"/>`);
    for (const f of [0.28, 0.55, 0.8]) o.push(`<path d="${poly(LV.line(S_JD + 0.8, LV.L, q => musW(q) * f), false)}" fill="none" stroke="${C.musF}" stroke-width="1" ${NS}/>`);
    if (V.crease) for (const q of [7.0, 7.45, 7.9]) o.push(`<path d="M${F(DP.at(q, U_APO + 0.07))}Q${F(DA.at(q + 0.2, 1.62))} ${F(add(sk.crease, UF.nrm(S_CREASE), -0.1))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`);
    else for (const q of [3.6, 4.0, 4.4]) o.push(`<path d="M${F(DP.at(q, U_APO + 0.07))}Q${F(DA.at(q - 0.15, 1.6))} ${F(DA.at(q - 0.35, 1.95))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`);
    A.apo = LV.off(sLvD(11.0), -0.05); A.levator = LV.off(S_JD + 6, 0.9); A.crease = sk.crease;

    // 10 orbital septum
    o.push(`<path d="${SEPT.band(0, SEPT.L, q => -0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)), q => 0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)))}" fill="${C.sept}" stroke="${C.septS}" stroke-width="0.8" ${NS}/>`);
    A.septum = SEPT.off(SEPT.L * 0.3, 0); A.fusion = LEV.off(S_F, -0.07);

    // 11 anterior lamella: orbicularis (fibres run mediolaterally → sectioned across) + subcutaneous fat + skin
    const SK = track(sk.pts), Ltot = SK.L;
    const sAnt = SK.near(DA.at(marginS(1.58), 1.58));
    let orbW, subq = () => 0;
    if (V.crease) { const sC = SK.near(sk.crease), sE = SK.near(sk.foldEdge);
      orbW = q => { if (q < sAnt) return 0; if (q < sC) return 0.6 * ss(sAnt, sAnt + 0.5, q) * (1 - 0.55 * ss(sC - 0.6, sC, q));
        return lerp(0.27, 0.62, ss(sC, sC + 0.8, q)) * (1 - 0.3 * ss(sE - 0.5, sE, q) * (1 - ss(sE, sE + 0.5, q))) + 0.8 * ss(sE + 4, sE + 9, q); };
      A.skin = SK.off(sE + 3.0, 0); A.orb = SK.off(sE + 1.6, 0.48);
    } else { const sR = SK.near([-15.85, -18.0]);
      orbW = q => q < sAnt ? 0 : 0.58 * ss(sAnt, sAnt + 0.5, q) + 0.75 * ss(sR - 4, sR + 1, q);
      subq = q => 0.2 * ss(sAnt + 0.8, sAnt + 2.5, q);
      A.skin = SK.off(sR - 6.5, 0); A.orb = SK.off(sR - 5.0, 0.13 + subq(sR - 5) + 0.3); A.subq = SK.off(sR - 3.2, 0.13 + 0.1);
    }
    const SKT = 0.13;
    if (!V.crease) o.push(`<path d="${SK.band(0, Ltot, SKT - 0.01, q => SKT + subq(q))}" fill="${C.sfat}" stroke="${C.sfatS}" stroke-width="0.5" ${NS}/>`);
    o.push(`<path d="${SK.band(0, Ltot, q => SKT + subq(q) - 0.01, q => SKT + subq(q) + orbW(q))}" fill="${C.orb}"/>`);
    const dots = []; let di = 0;
    for (let q = sAnt + 0.25; q < Ltot - 0.2; q += 0.28, di++) { const w = orbW(q); if (w < 0.28) continue;
      for (let d = SKT + subq(q) + 0.15, dj = 0; d < SKT + subq(q) + w - 0.08; d += 0.25, dj++) { const c = SK.off(q + (hash(di, dj) - 0.5) * 0.12, d); dots.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.085" ry="0.07" fill="${C.orbB}" opacity="0.5"/>`); } }
    o.push(dots.join(''));
    o.push(`<path d="${SK.band(0, Ltot, 0, SKT)}" fill="${C.skin}"/><path d="${poly(sk.pts, false)}" fill="none" stroke="${C.skinS}" stroke-width="1.1" ${NS}/>`);
    A.pretarsalFat = DA.at(4.6, 1.5);
    // muscle of Riolan (the grey line)
    o.push(`<path d="${DA.band(0.02, 1.7, U_TAR, q => U_TAR + 0.32 * (1 - ss(1.2, 1.7, q)))}" fill="${C.riolan}"/>`);
    for (let q = 0.2; q < 1.5; q += 0.28) { const c = DA.at(q, U_TAR + 0.16); o.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.06" ry="0.05" fill="#7e2a36" opacity="0.6"/>`); }
    A.grey = DA.at(0, U_GREY); A.mcj = DP.at(0, U_MCJ); A.postMargin = DP.at(0, 0.02);
    // arterial arcades
    const ma = DA.at(2.45, U_TAR + 0.13), pa = LV.off(sLvD(11.0), 0.12);
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
    if (st.suture) { const P1 = DP.at(3.45, 0.55), P2 = lerpP(DP.at(1.9, U_TAR), DA.at(1.9, U_TAR + 0.25), 0.5), P3 = DA.at(0.85, uSkin(V, 0.85) + 0.02);
      const N = 40, pts = []; for (let i = 0; i <= N * Math.min(1, st.suture); i++) { const t = i / N; pts.push([0, 1].map(j => (1 - t) ** 2 * P1[j] + 2 * (1 - t) * t * (2 * P2[j] - (P1[j] + P3[j]) / 2) + t * t * P3[j])); }
      if (pts.length > 1) o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#2463eb" stroke-width="2.4" stroke-linecap="round" ${NS}/>`);
      if (st.suture >= 1) { const nk = DA.nrm(0.85), tk = DA.tan(0.85);
        o.push(`<circle cx="${P3[0].toFixed(3)}" cy="${P3[1].toFixed(3)}" r="0.13" fill="#2463eb"/>`);
        for (const sg of [-1, 1]) o.push(`<path d="M${F(P3)}l${(nk[0] * 0.7 + tk[0] * 0.3 * sg).toFixed(3)} ${(nk[1] * 0.7 + tk[1] * 0.3 * sg).toFixed(3)}" stroke="#2463eb" stroke-width="2.2" stroke-linecap="round" ${NS}/>`); }
      A.suture = P2; A.sutureExit = P3; }

    // 14 bone: superior orbital rim + roof
    o.push(`<path d="${poly([[-10.9, -32], [-10.2, -27], [-8.6, -23.4], [-6.2, -21.25], [-2, -20.95], [8, -20.85], [20, -20.45], [45, -19.6], [45, -32]])}" fill="${C.cranial}"/>`);
    const bo = [...spline(boneCtrl, 0.1), ...spline(roofTop, 0.1)];
    o.push(`<path d="${poly(bo)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    o.push(`<clipPath id="${pid}Bone"><path d="${poly(bo)}"/></clipPath><g clip-path="url(#${pid}Bone)">`);
    let bj = 0; for (let y = -31.5; y < -17.5; y += 0.62, bj++) for (let x = -14.2 + (bj % 2) * 0.35, bi = 0; x < -8; x += 0.7, bi++) o.push(`<circle cx="${(x + (hash(bi, bj) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.1 + 0.1 * hash(bj, bi)).toFixed(2)}" fill="${C.boneD}"/>`);
    o.push(`</g>`);
    A.rim = [-12.6, -22.5];
    return { svg: o.join(''), A, DP, DA };
  }
  return { draw, makeDeform, gp, S_CUT, S_TAR, U_TAR, U_SKIN, uSkin, UF, LEV, geom, VARIANTS, sLv, S_J, ARCUS, hash, spline, track, poly, F, add, sub, unit, hyp, lerp, ss, NS, C };
})();
if (typeof module !== 'undefined') module.exports = LID;
