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
  const LEV = track(spline([UF.at(2.6, U_APO), UF.at(4.5, U_APO), UF.at(6.5, U_APO), UF.at(8.4, U_APO), UF.at(9.2, 1.15), UF.at(9.95, 1.0), UF.at(10.7, 0.9),
    UF.at(11.6, 0.9), UF.at(12.5, 0.9), UF.at(13.3, 0.92), [-1.8, -15.05], [-0.8, -16.25], [1.0, -17.15], [3.5, -17.75], [9, -18.05], [20, -17.7], [45, -15.6]], 0.05));
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
    return { v, S_F, SEPT, sk: skinPath(v) };
  }
  function skinPath(v) {
    if (!v.crease) { // single eyelid: fuller lid, no crease, smooth to the brow
      const c = [];
      for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(UF.at(0, u));
      for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(UF.at(marginS(u), u));
      for (let s = 0.5; s <= 3.6; s += 0.25) c.push(UF.at(s, uSkin(v, s)));
      const up = spline([UF.at(3.6, uSkin(v, 3.6)), UF.at(4.3, uSkin(v, 4.3) + 0.12), [-12.6, -10.3], [-13.4, -12.1], [-14.2, -14.1], [-15.05, -16.1], [-15.85, -18.0], [-16.5, -20.2], [-16.9, -23], [-17.1, -32]], 0.05);
      const pts = [...c, ...up.slice(1)];
      return { pts, crease: null, foldEdge: null };
    }
    const c = [];
    for (let u = U_MCJ; u < 1.58; u += 0.08) c.push(UF.at(0, u));
    for (let u = 1.58; u <= U_SKIN + 1e-9; u += 0.04) c.push(UF.at(marginS(u), u));
    for (let s = 0.5; s <= 7.4; s += 0.25) c.push(UF.at(s, U_SKIN));
    const k = UF.at(S_CREASE, U_SKIN - 0.24);
    const fold = spline([UF.at(7.4, U_SKIN), k, add(k, [-0.45, -0.55]), add(k, [-1.6, -0.62]), add(k, [-2.75, -0.2]), add(k, [-3.35, 0.55]), add(k, [-3.85, 0.72]),
      add(k, [-4.3, 0.3]), add(k, [-4.75, -0.75]), add(k, [-5.55, -2.35]), [-14.55, -15.0], [-15.65, -17.0], [-16.45, -19.5], [-16.9, -23], [-17.1, -32]], 0.05);
    return { pts: [...c, ...fold.slice(1)], crease: k, foldEdge: add(k, [-3.85, 0.72]) };
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

  // ---------------------------------------------------------------- draw (static normal anatomy)
  function draw(opt = {}) {
    const o = [], A = {};
    const G = geom(opt.variant || 'asian'), V = G.v, sk = G.sk, SEPT = G.SEPT, S_F = G.S_F;
    // 1 orbital soft tissue (everything behind the skin)
    const base = [...sk.pts, [45, -32], [45, 6], [0, 0], UF.at(0, 0)];
    o.push(`<path d="${poly(base)}" fill="${C.ofat}"/>`);
    lobules(o, 'cOF', poly(base), -12, 45, -21, 2, 0.45, 0.75, 'none', C.ofatS, 0.7);
    // 2 anterior lid / brow connective tissue (skin → bone front → septum → aponeurosis → tarsus front)
    const ant = [...sk.pts, ...boneFront, ...SEPT.pts.slice(1), ...LEV.line(2.0, S_F, -0.07).reverse().slice(1), ...(() => { const r = []; for (let q = 2.6; q >= 0; q -= 0.1) r.push(UF.at(q, U_TAR)); return r; })()];
    o.push(`<path d="${poly(ant)}" fill="${V.crease ? C.base : C.sfat}"/>`);
    if (!V.crease) lobules(o, 'cSF', poly(ant), -18, -7, -32, -4, 0.2, 0.34, C.sfatL, C.sfatS, 0.6); // suborbicularis + pretarsal fat
    // 3 preaponeurotic fat (behind the septum, in front of the aponeurosis, under the roof)
    const fatPts = [...SEPT.pts, ...LEV.line(S_F, LEV.near([4.5, -17.9]), -0.07), [4.5, -19.5], [-2, -19.68], [-8.5, -19.18], [-11.3, -18.3]];
    o.push(`<path d="${poly(fatPts)}" fill="${C.fat}"/>`);
    lobules(o, 'cFat', poly(fatPts), -13.5, 5, -19.8, -9.5, 0.32, 0.55, C.fatL, C.fatS, 0.7);
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

    // 6 conjunctiva: margin (posterior edge → MCJ) + palpebral → fornix → bulbar
    const pal = []; for (let s = 0; s <= S_FORNIX; s += 0.05) pal.push(UF.at(s, U_CONJ / 2));
    const bul = [], phF = UF.phiAt(S_FORNIX);
    for (let a = phF; a >= PHI_LU - 0.5 * D2R; a -= 0.003) { const p = gp(a); bul.push(add(p, unit(p), srTh(a) + 0.06)); }
    const pf = pal[pal.length - 1], bf = bul[0], mid = lerpP(pf, bf, 0.5), rr = hyp(sub(pf, bf)) / 2, tdir = UF.tan(S_FORNIX), dd = unit(sub(pf, mid));
    const cap = []; for (let k = 1; k < 14; k++) { const a = Math.PI * k / 14; cap.push(add(add(mid, dd, rr * Math.cos(a)), tdir, rr * Math.sin(a) * 1.6)); }
    const CJ = track([...pal, ...cap, ...bul]);
    o.push(`<path d="${CJ.band(0, CJ.L, -0.075, 0.075)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);
    o.push(`<path d="${UF.band(0, 0.06, 0, U_MCJ)}" fill="${C.conj}" stroke="${C.conjS}" stroke-width="0.6" ${NS}/>`);
    A.conj = UF.at(5.5, U_CONJ / 2); A.fornix = add(mid, tdir, rr * 1.6);

    // 7 Müller muscle: superior tarsal border → under the levator (smooth muscle, paler)
    const sM0 = sLv(9.55), mulW = q => 0.67 * ss(sM0, sM0 + 0.5, q) * (1 - ss(S_J - 2.2, S_J + 0.6, q));
    o.push(`<path d="${LEV.band(sM0, S_J + 0.6, 0.07, q => 0.07 + mulW(q))}" fill="${C.mul}"/>`);
    o.push(`<path d="${poly(LEV.line(sM0 + 0.6, S_J - 0.6, q => 0.07 + mulW(q) * 0.5), false)}" fill="none" stroke="${C.mulF}" stroke-width="0.8" ${NS}/>`);
    A.muller = LEV.off(sLv(12.4), 0.42);

    // 8 tarsus + meibomian gland (vertical gland: duct with acini, opening on the margin)
    o.push(`<path d="${UF.band(0, S_TAR, U_CONJ, s => U_CONJ + (U_TAR - U_CONJ) * tarTop(s))}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="0.9" ${NS}/>`);
    const gl = []; let gi = 0;
    for (let s = 0.7; s < 8.9; s += 0.24, gi++) for (const du of [-0.17, 0.17]) { const c = UF.at(s + (du > 0 ? 0.12 : 0), U_ORIF + du + (hash(gi, du > 0 ? 1 : 2) - 0.5) * 0.06);
      gl.push(`<circle cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" r="${(0.095 + 0.03 * hash(gi, 5)).toFixed(3)}" fill="${C.gland}" stroke="${C.glandS}" stroke-width="0.6" ${NS}/>`); }
    o.push(gl.join(''));
    o.push(`<path d="${UF.band(0, 8.95, U_ORIF - 0.055, U_ORIF + 0.055)}" fill="${C.duct}"/>`);
    A.tarsus = UF.at(6.2, 0.95); A.gland = UF.at(4.0, U_ORIF + 0.18); A.tarsusZ = UF.at(1.5, 1.0); A.glandZ = UF.at(2.4, U_ORIF + 0.17); A.orifice = UF.at(0, U_ORIF);

    // 9 levator: aponeurosis (on the anterior tarsus, fibres to the skin crease) → muscle belly under the roof
    o.push(`<path d="${LEV.band(0, S_J + 2.2, -0.075, q => 0.075 * (1 - ss(S_J + 0.8, S_J + 2.2, q)))}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.7" ${NS}/>`);
    const musW = q => 1.75 * ss(S_J - 1.0, S_J + 2.6, q);
    o.push(`<path d="${LEV.band(S_J - 1.0, LEV.L, -0.05, musW)}" fill="${C.mus}"/>`);
    for (const f of [0.28, 0.55, 0.8]) o.push(`<path d="${poly(LEV.line(S_J + 0.8, LEV.L, q => musW(q) * f), false)}" fill="none" stroke="${C.musF}" stroke-width="1" ${NS}/>`);
    if (V.crease) for (const s of [7.0, 7.45, 7.9]) o.push(`<path d="M${F(UF.at(s, U_APO + 0.07))}Q${F(UF.at(s + 0.2, 1.62))} ${F(add(sk.crease, UF.nrm(S_CREASE), -0.1))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`);
    else for (const s of [2.9, 3.3, 3.7]) o.push(`<path d="M${F(UF.at(s, U_APO + 0.07))}Q${F(UF.at(s - 0.15, 1.6))} ${F(UF.at(s - 0.35, 1.95))}" fill="none" stroke="${C.apoS}" stroke-width="0.9" ${NS}/>`);
    A.apo = LEV.off(sLv(11.0), -0.05); A.levator = LEV.off(S_J + 6, 0.9); A.crease = sk.crease;

    // 10 orbital septum: arcus marginalis → fuses onto the aponeurosis (asian: below the superior tarsal border)
    o.push(`<path d="${SEPT.band(0, SEPT.L, q => -0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)), q => 0.075 * (1 - ss(SEPT.L - 1.2, SEPT.L, q)))}" fill="${C.sept}" stroke="${C.septS}" stroke-width="0.8" ${NS}/>`);
    A.septum = SEPT.off(SEPT.L * 0.3, 0); A.fusion = LEV.off(S_F, -0.07);

    // 11 anterior lamella: orbicularis (fibres run mediolaterally → sectioned across) + skin
    const SK = track(sk.pts), Ltot = SK.L;
    const sAnt = SK.near(UF.at(marginS(1.58), 1.58));
    let orbW, subq = () => 0;
    if (V.crease) { const sC = SK.near(sk.crease), sE = SK.near(sk.foldEdge);
      orbW = q => { if (q < sAnt) return 0; if (q < sC) return 0.6 * ss(sAnt, sAnt + 0.5, q) * (1 - 0.55 * ss(sC - 0.6, sC, q));
        return lerp(0.27, 0.62, ss(sC, sC + 0.8, q)) * (1 - 0.3 * ss(sE - 0.5, sE, q) * (1 - ss(sE, sE + 0.5, q))) + 0.8 * ss(sE + 4, sE + 9, q); };
      A.skin = SK.off(sE + 3.0, 0); A.orb = SK.off(sE + 1.6, 0.48);
    } else { const sR = SK.near([-15.85, -18.0]);
      orbW = q => q < sAnt ? 0 : 0.58 * ss(sAnt, sAnt + 0.5, q) + 0.75 * ss(sR - 4, sR + 1, q);
      subq = q => 0.2 * ss(sAnt + 0.8, sAnt + 2.5, q);                       // thicker subcutaneous fat (asian)
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
    A.pretarsalFat = UF.at(4.6, 1.5);
    // muscle of Riolan (the grey line)
    o.push(`<path d="${UF.band(0.02, 1.7, U_TAR, s => U_TAR + 0.32 * (1 - ss(1.2, 1.7, s)))}" fill="${C.riolan}"/>`);
    for (let s = 0.2; s < 1.5; s += 0.28) { const c = UF.at(s, U_TAR + 0.16); o.push(`<ellipse cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" rx="0.06" ry="0.05" fill="#7e2a36" opacity="0.6"/>`); }
    A.grey = UF.at(0, U_GREY); A.mcj = UF.at(0, U_MCJ); A.postMargin = UF.at(0, 0.02);
    // arterial arcades
    const ma = UF.at(2.45, U_TAR + 0.13), pa = LEV.off(sLv(11.0), 0.12);
    o.push(`<circle cx="${ma[0]}" cy="${ma[1]}" r="0.12" fill="${C.art}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="0.13" fill="${C.art}"/>`);
    A.marg = ma; A.peri = pa;

    // 12 lash follicles (anterior lamella) + lashes
    const t0 = UF.tan(0.2), n0 = UF.nrm(0.2);
    [[1.70, 0.9, 0.0], [1.83, 0.97, 0.35], [1.95, 0.84, -0.3]].forEach(([u, len, j], k) => {
      const E = UF.at(marginS(u), u), B = UF.at(2.05 + 0.15 * k, u - 0.14);
      o.push(`<path d="${track(spline([E, lerpP(E, B, 0.5), B], 0.05)).band(0, hyp(sub(B, E)), -0.085, 0.085)}" fill="#f1d2bb" stroke="#c09074" stroke-width="0.6" ${NS}/>`);
      o.push(`<ellipse cx="${B[0].toFixed(3)}" cy="${B[1].toFixed(3)}" rx="0.12" ry="0.12" fill="#8a5e43"/>`);
      const c1 = add(add(E, t0, -0.8 * len), n0, 1.7 * len), c2 = add(add(E, t0, -0.1 * len), n0, 5.0 * len), tip = add(add(E, t0, (2.3 + j) * len), n0, 7.4 * len);
      o.push(`<path d="M${F(B)}L${F(E)}" stroke="#7a5640" stroke-width="0.04"/><path d="M${F(E)}C${F(c1)} ${F(c2)} ${F(tip)}" fill="none" stroke="${C.lash}" stroke-width="0.075" stroke-linecap="round"/>`);
      if (k === 1) { A.follicle = lerpP(E, B, 0.62); A.lash = add(add(E, t0, -0.25), n0, 3.4); }
    });

    // 13 bone: superior orbital rim + roof; cranial side left blank
    o.push(`<path d="${poly([[-10.9, -32], [-10.2, -27], [-8.6, -23.4], [-6.2, -21.25], [-2, -20.95], [8, -20.85], [20, -20.45], [45, -19.6], [45, -32]])}" fill="${C.cranial}"/>`);
    const bo = [...spline(boneCtrl, 0.1), ...spline(roofTop, 0.1)];
    o.push(`<path d="${poly(bo)}" fill="${C.bone}" stroke="${C.boneS}" stroke-width="1.2" ${NS}/>`);
    o.push(`<clipPath id="cBone"><path d="${poly(bo)}"/></clipPath><g clip-path="url(#cBone)">`);
    let bj = 0; for (let y = -31.5; y < -17.5; y += 0.62, bj++) for (let x = -14.2 + (bj % 2) * 0.35, bi = 0; x < -8; x += 0.7, bi++) o.push(`<circle cx="${(x + (hash(bi, bj) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.1 + 0.1 * hash(bj, bi)).toFixed(2)}" fill="${C.boneD}"/>`);
    o.push(`</g>`);
    A.rim = [-12.6, -22.5];
    return { svg: o.join(''), A };
  }
  return { draw, UF, LEV, geom, VARIANTS, sLv, S_J, ARCUS, hash, spline, track, poly, F, add, sub, unit, hyp, lerp, ss, NS, C };
})();
if (typeof module !== 'undefined') module.exports = LID;
