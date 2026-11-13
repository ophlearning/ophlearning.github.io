// ============================================================================
// Posterior-segment model (videos/models/posterior/). Units: mm. Sources and caveats: CARD.md.
// It extends the globe model's eye (globe/globe.js: outer surface, cornea, limbus, scleral spur, wall thickness up to 14 mm behind the
// limbus, clock hours) backwards to the posterior pole; globe/ is not changed (its 6.2 mm ora stays for the anterior-segment videos;
// this model has its own ora from Li 2025, see CARD.md「衝突」).
// 3D frame (as globe/): X = patient's left, Y = superior, Z = anterior; origin = globe centre. Clock hours: examiner facing the patient
//   (12 superior, 3 = patient's left: OS temporal / OD nasal). The eye only renames the clock hours (st.eye 'OD' | 'OS').
// Positions in the surgeon's language: clock hour h, s = distance from the limbus along the outer surface, d = depth below it;
//   on the fundus: mm from the foveola (fundus chart coordinates fx toward 3 o'clock, fy superior).
// Views (views.js): meridional / any-plane section, fundus chart, surgeon's wide-angle view (inverter on/off), head-position view,
//   external microscope view with the trocars, cross-section of a trocar tunnel.
// ============================================================================
const POSTERIOR = (() => {
  const G = typeof GLOBE !== 'undefined' ? GLOBE : require('../globe/globe.js');
  const { D2R, F, NS, ss, lerp, clamp, add, sub, dot, len, unit, cross, hash, contour, clockDir, clockOf } = G;
  const GN = G.N, mul = (a, k) => a.map(v => v * k);

  // ---------------------------------------------------------------- numbers (mm); every value is in CARD.md with its source, 示意 or 推算
  const N = {
    oraT: 7.58, oraN: 6.96,        // limbus → ora serrata, Chinese, normal axial length 22.5–25 mm, intra-operative (Li 2025); smooth between clock hours (示意)
    plicata: 2.0,                  // pars plicata width behind the scleral spur (Guedes 2024, textbook value)
    vbAnt: 2.0,                    // vitreous base: front border 2 mm in front of the ora (Sebag 2014)
    vbPost: 2.0,                   // back border 2 mm behind the ora (示意, inside Sebag 1–4 mm and Sohn 2020 total 2–6 mm)
    discArea: 2.65, discV: 1.92, discH: 1.76,   // disc area, Chinese (Wang 2006); vertical / horizontal shape (Jonas 1988), scaled to the area (推算)
    dfDist: 4.76, dfAng: 7.76,     // disc centre → foveola 4.76 mm, the fovea 7.76° below the disc (Jonas 2015a, 2015b, Beijing)
    foveola: 0.35, fovea: 1.5, macula: 5.5,     // diameters (Curcio 1990; Köksaldı 2025)
    chorPole: 0.254, chorOra: 0.22,             // subfoveal choroid, Chinese (Wei 2013); at the ora as globe/ (示意)
    sclMid: 0.65, sclPole: 0.94,                // sclera midway equator–pole / at the posterior pole (Vurgese 2012)
    lensT: 4.5, lensD: 9.6,                     // phakic lens, Chinese: thickness (Meng 2021), equatorial diameter (Huang 2024, UBM)
    lensRa: 9.73, lensRp: 5.49,                 // lens surface radii, Chinese (Chen 2021; same as globe/cataract.js)
    pupil: 3.5,                                 // dilated pupil radius for vitrectomy (示意)
    trocS: 4.0,                                 // trocar 4 mm behind the limbus in a phakic eye (Duker 2021)
    tunnel: 25,                                 // oblique tunnel, degrees to the surface (Teixeira 2009: 20–30°; 25 示意)
    shaft: 0.6,                                 // 23G instrument shaft diameter (de Oliveira 2016)
    cannula: 0.75, hub: 1.4, cannulaL: 3.0,     // cannula outer diameter (Meyer 2014); hub diameter and cannula length (示意)
    nodal: 7.2,                                 // viewpoint of the wide-angle view: 7.2 mm behind the corneal apex (示意, near the nodal point)
    field: 130,                                 // non-contact wide-angle field, degrees (Tabandeh 2012: most systems 120–140°; 130 示意)
    vortex: 7.6,                                // vortex vein ampullae 7.6 mm behind the ora (Sohn 2020)
    pvdGap: 3.5,                                // detached posterior hyaloid in front of the retina (示意)
    pvdEnv: 3.4,                                // the hyaloid rides over a smooth envelope of the detachment: dilation radius on the fundus chart, mm (示意)
    nearCut: 4.0,                               // wide-angle view: shaft within this distance of the viewpoint not drawn (out of focus, 示意)
  };

  // ---------------------------------------------------------------- outer profile 0–180° (globe/ stops at 150°): same formula and step
  const DPHI = 0.05 * D2R, PN = 3600;
  const PZ = new Float64Array(PN + 1), PR = new Float64Array(PN + 1), PS = new Float64Array(PN + 1), NZ = new Float64Array(PN + 1), NR = new Float64Array(PN + 1);
  for (let i = 0; i <= PN; i++) { const p = G.prof(i * DPHI); PZ[i] = p[0]; PR[i] = p[1]; }
  for (let i = 1; i <= PN; i++) PS[i] = PS[i - 1] + Math.hypot(PZ[i] - PZ[i - 1], PR[i] - PR[i - 1]);
  { const iL = G.PHI_L / DPHI, i0 = Math.floor(iL), sL = lerp(PS[i0], PS[i0 + 1], iL - i0);
    for (let i = 0; i <= PN; i++) { PS[i] -= sL;
      const a = Math.max(0, i - 1), b = Math.min(PN, i + 1), tz = PZ[b] - PZ[a], tr = PR[b] - PR[a], l = Math.hypot(tz, tr) || 1;
      NZ[i] = tr / l; NR[i] = -tz / l; }
    NZ[0] = 1; NR[0] = 0; NZ[PN] = -1; NR[PN] = 0; }
  const idxOfS = s => { let a = 0, b = PN; s = clamp(s, PS[0], PS[PN]); while (b - a > 1) { const m = (a + b) >> 1; PS[m] <= s ? a = m : b = m; } return a + (s - PS[a]) / ((PS[b] - PS[a]) || 1); };
  const atIdx = (arr, x) => { const i = Math.min(PN - 1, Math.max(0, Math.floor(x))); return lerp(arr[i], arr[i + 1], x - i); };
  const surfAt = s => { const x = idxOfS(s); return { z: atIdx(PZ, x), rho: atIdx(PR, x), nz: atIdx(NZ, x), nr: atIdx(NR, x) }; };
  const phiOfS = s => idxOfS(s) * DPHI, sOfPhi = phi => atIdx(PS, clamp(phi, 0, Math.PI) / DPHI);
  const S_EQ = sOfPhi(Math.PI / 2), S_MID = sOfPhi(Math.PI * 3 / 4), S_POLE = PS[PN];
  // nearest point on the outer profile for a meridional point (z, rho ≥ 0): s, depth d (positive inside), rho at the foot point (as globe/)
  function wallOf(z, rho) {
    const cands = [Math.atan2(rho, z)], cz = z - GN.CZ, l = Math.hypot(cz, rho) || 1;
    cands.push(Math.atan2(rho / l * GN.RC, GN.CZ + cz / l * GN.RC));
    if (Math.abs(cands[0] - G.PHI_L) < 0.12 || Math.abs(cands[1] - G.PHI_L) < 0.12) cands.push(G.PHI_L);
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
  function P3(h, s, d = 0) { const f = surfAt(s), [cx, cy] = clockDir(h), r = f.rho - f.nr * d, z = f.z - f.nz * d; return [r * cx, r * cy, z]; }
  function N3(h, s) { const f = surfAt(s), [cx, cy] = clockDir(h); return [f.nr * cx, f.nr * cy, f.nz]; }   // outward normal

  // ---------------------------------------------------------------- monotone cubic (PCHIP) through [[x, y], …]; s0 / s1 = end slopes
  function pchip(pts, s0, s1) {
    const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), h = [], d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
    m[0] = s0 ?? d[0]; m[n - 1] = s1 ?? d[n - 2];
    for (let i = 1; i < n - 1; i++) { if (d[i - 1] * d[i] <= 0) m[i] = 0; else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); } }
    return x => { if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1]; let i = 0; while (x > xs[i + 1]) i++; const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1]; };
  }

  // ---------------------------------------------------------------- wall layers along s
  // sclera: globe/ up to 14 mm (its sourced points), then thickening to the midpoint equator–pole and the pole (Vurgese 2012)
  const T_BACK = pchip([[14, GN.eqT], [S_MID, N.sclMid], [S_POLE, N.sclPole]], 0, 0);
  const Tp = s => s <= 14 ? G.T(s) : T_BACK(s);
  const chorAt = s => lerp(N.chorOra, N.chorPole, ss(S_EQ, S_POLE, s));
  const K = -PZ[PN] - Tp(S_POLE) - chorAt(S_POLE);              // radius of the RPE at the posterior pole: fundus chart mm per radian
  // retinal thickness: macula fitted to the Handan Eye Study (Duan 2010: foveal minimum 150, central 1 mm 176, 1–3 mm ring 255, 3–6 mm ring 238 µm),
  // 0.18 at the equator, 0.10 at the ora (Tengroth 1966); between them smooth (示意)
  const RT_MAC = pchip([[0, 0.150], [0.15, 0.152], [0.4, 0.185], [0.7, 0.245], [1.0, 0.262], [1.3, 0.259], [1.6, 0.250], [2.1, 0.240], [2.7, 0.232], [3.2, 0.229], [5.0, 0.222], [K * Math.PI / 2, 0.18]], 0, null);

  // ---------------------------------------------------------------- eye side, clock names, ora
  const tsgnOf = st => ((st && (st.eye || (st.cat || {}).eye)) || 'OD') === 'OS' ? 1 : -1;   // +1: temporal is +X (3 o'clock)
  const oraAt = (h, ts) => (N.oraT + N.oraN) / 2 + (N.oraT - N.oraN) / 2 * clockDir(h)[0] * ts;
  const vbPostAt = (h, ts) => oraAt(h, ts) + N.vbPost, vbAntAt = (h, ts) => oraAt(h, ts) - N.vbAnt;
  const PLICATA_END = GN.spur + N.plicata;
  // anatomical name of a clock hour for an eye: { zh, en }
  function anat(h, eye) {
    const ts = eye === 'OS' ? 1 : -1, [cx, cy] = clockDir(h), t = cx * ts, c = Math.cos(22.5 * D2R);
    const v = cy > c ? ['上方', 'superior'] : cy < -c ? ['下方', 'inferior'] : null, s = t > c ? ['temporal', 'temporal'] : t < -c ? ['nasal', 'nasal'] : null;
    if (v) return { zh: v[0], en: v[1] }; if (s) return { zh: s[0], en: s[1] };
    const en = (cy > 0 ? 'supero' : 'infero') + (t > 0 ? 'temporal' : 'nasal');
    return { zh: (cy > 0 ? '上方' : '下方') + '偏' + (t > 0 ? '顳側' : '鼻側'), en };
  }
  const clockName = h => { h = ((h % 12) + 12) % 12 || 12; const H = Math.floor(h + 1e-6), m = Math.round((h - H) * 60); return m === 0 ? `${H} 點` : m === 30 ? `${H} 點半` : `${H}:${String(m).padStart(2, '0')}`; };

  // ---------------------------------------------------------------- fundus chart coordinates (azimuthal equidistant about the foveola = posterior pole)
  // math orientation: +fx toward 3 o'clock (patient's left), +fy superior; distance from the centre = K × angle from the posterior pole
  const chartHS = (h, s) => { const r = K * (Math.PI - phiOfS(s)), [cx, cy] = clockDir(h); return [r * cx, r * cy]; };
  const hsChart = (fx, fy) => ({ h: clockOf(fx, fy), s: sOfPhi(Math.PI - Math.hypot(fx, fy) / K) });
  const chart3 = p => { const rho = Math.hypot(p[0], p[1]), a = Math.atan2(rho, -p[2]); return rho < 1e-9 ? [0, 0] : [K * a * p[0] / rho, K * a * p[1] / rho]; };
  const rpeAt = (h, s) => P3(h, s, Tp(s) + chorAt(s));

  // ---------------------------------------------------------------- optic disc: a vertical ellipse in the tangent plane of the RPE at its centre
  function discOf(ts) {
    // the disc centre lies 4.76 mm from the foveola along the RPE (the chart distance is then slightly shorter: the RPE is farther from the centre away from the pole)
    const a = N.dfAng * D2R, dir = [-ts * Math.cos(a), Math.sin(a)], hd = clockOf(dir[0], dir[1]), arc = s => { let L = 0, p = rpeAt(hd, s); for (let x = s; x < S_POLE; x += 0.02) { const q = rpeAt(hd, Math.min(S_POLE, x + 0.02)); L += len(sub(q, p)); p = q; } return L; };
    let lo = S_POLE - 8, hi = S_POLE; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; arc(m) > N.dfDist ? lo = m : hi = m; }
    const r = K * (Math.PI - phiOfS((lo + hi) / 2)), c = [dir[0] * r, dir[1] * r], hs = hsChart(c[0], c[1]), C = rpeAt(hs.h, hs.s), u = unit(C);
    const ev = unit(sub([0, 1, 0], mul(u, u[1]))), eh = unit(cross(ev, u));
    const k = Math.sqrt(N.discArea / (Math.PI * N.discV * N.discH / 4));       // keep the Jonas 1988 shape, scale to the Beijing area (推算)
    return { C, u, eh, ev, a: N.discH * k / 2, b: N.discV * k / 2, chart: c, hs, R: len(C) };
  }
  const DISC = { 1: discOf(1), '-1': discOf(-1) };
  // position of a 3D direction relative to the disc: q < 1 inside; x, y in the disc's tangent plane (mm)
  const discQ = (D, p) => { const l = len(p) || 1, c = dot(p, D.u) / l; if (c < 0.9) return { q: 9 }; const k = D.R / (c * l), x = dot(p, D.eh) * k, y = dot(p, D.ev) * k; return { q: Math.hypot(x / D.a, y / D.b), x, y }; };
  const discOutline = (D, n = 72) => { const out = []; for (let i = 0; i < n; i++) { const t = 2 * Math.PI * i / n, q = add(D.C, add(mul(D.eh, D.a * Math.cos(t)), mul(D.ev, D.b * Math.sin(t)))); out.push(mul(unit(q), D.R)); } return out; };

  // retinal thickness at a fundus position (chart mm), with the peripapillary thickening (0.56 at the disc margin, Tengroth 1966; decay 示意)
  function rtAt(fx, fy, s, ora, D) {
    let r = s < S_EQ ? lerp(0.10, 0.18, clamp((s - ora) / (S_EQ - ora), 0, 1)) : RT_MAC(Math.hypot(fx, fy));
    const dq = Math.hypot((fx - D.chart[0]) / D.a, (fy - D.chart[1]) / D.b);
    if (dq < 4) r = lerp(r, 0.56, Math.exp(-(((Math.max(0, dq - 1)) * D.a / 0.55) ** 2)));
    return r;
  }

  // ---------------------------------------------------------------- the case: OS RRD 11:30 → 12 → 3 → 5 o'clock, HST at 11, inferior macula off, fovea on
  // RD region on the fundus chart, closed polygon (mm, math orientation), drawn for OS; its anterior part runs outside the ora (the retina ends there).
  // Peripheral corners in the surgeon's language (clock, mm from the limbus); posterior border in chart mm from the foveola (示意 shape).
  const CASE_RD = (() => {
    const P = (h, s) => chartHS(h, s), out = [];
    for (let h = 11.5; h <= 17.0 + 1e-9; h += 0.25) out.push(P(h, 1.0));        // outside the ora, 11:30 clockwise via 12 and 3 to 5 o'clock
    out.push(P(5.0, 7.27), P(5.0, 9.0), P(5.25, 12), P(5.6, 15.5));               // inferior edge: from the ora at 5 o'clock back toward the macula
    out.push([4.0, -6.5], [1.8, -4.1], [-0.6, -3.5], [-2.2, -2.6], [-2.4, -1.4], [-1.3, -0.78], [0, -0.62], [1.3, -0.68], [2.9, -0.5]);   // tongue under the fovea
    out.push([4.8, 0.6], [6.6, 3.6], [6.2, 7.6], [3.4, 10.6], [-0.4, 12.6]);    // posterior border, temporal and superior (attached macula above)
    out.push(P(11.15, 14.2), P(10.55, 12.4), P(10.45, 10.4), P(10.5, 9.0), P(10.9, 8.4), P(11.4, 7.7), P(11.5, 7.15), P(11.5, 4.0));   // around the 11 o'clock tear, back to 11:30 at the ora
    return out;
  })();
  // a closed Catmull–Rom curve through the control points (smooth border)
  function smoothClosed(pts, k = 8) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); } }
    return out;
  }
  // signed distance raster of a closed polygon in chart mm (positive inside), cached
  const SDF_CACHE = new Map();
  function sdfOf(poly) {
    const key = JSON.stringify(poly.map(p => p.map(v => +v.toFixed(3)))); if (SDF_CACHE.has(key)) return SDF_CACHE.get(key);
    const X0 = -32, ST = 0.2, NX = 321, buf = new Float32Array(NX * NX), n = poly.length;
    for (let j = 0; j < NX; j++) for (let i = 0; i < NX; i++) { const x = X0 + i * ST, y = X0 + j * ST; let bd = 1e18, inside = false;
      for (let k = 0, m = n - 1; k < n; m = k++) { const ax = poly[m][0], ay = poly[m][1], bx = poly[k][0], by = poly[k][1], ex = bx - ax, ey = by - ay, L2 = ex * ex + ey * ey || 1;
        let t = ((x - ax) * ex + (y - ay) * ey) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dx = x - ax - ex * t, dy = y - ay - ey * t, d = dx * dx + dy * dy; if (d < bd) bd = d;
        if ((ay > y) !== (by > y) && x < ax + (y - ay) * ex / (ey || 1e-12)) inside = !inside; }
      buf[j * NX + i] = (inside ? 1 : -1) * Math.sqrt(bd); }
    const f = (x, y) => { const u = (x - X0) / ST, v = (y - X0) / ST; if (u < 0 || v < 0 || u >= NX - 1 || v >= NX - 1) return -9;
      const i = Math.floor(u), j = Math.floor(v), a = u - i, b = v - j, q = j * NX + i; return lerp(lerp(buf[q], buf[q + 1], a), lerp(buf[q + NX], buf[q + NX + 1], a), b); };
    f.key = key; if (SDF_CACHE.size > 20) SDF_CACHE.delete(SDF_CACHE.keys().next().value); SDF_CACHE.set(key, f); return f;
  }
  // smooth upper envelope of a height field on the fundus chart (2026-11-12; the posterior hyaloid over a detachment): fn (chart mm → mm) sampled on the
  // sdf's raster, dilated (square, radius 2B + 1 cells ≈ N.pvdEnv) and blurred twice by boxes of B cells (support 2B), so at every point the envelope
  // ≥ fn within a cell (smooth: no bumps where the field has them); bilinear, cached by key
  const ENV_CACHE = new Map();
  function envOf(key, fn) {
    if (ENV_CACHE.has(key)) return ENV_CACHE.get(key);
    const X0 = -32, ST = 0.2, NX = 321, n = NX * NX, B = Math.max(1, Math.floor((N.pvdEnv / ST - 1) / 2)), RR = 2 * B + 1, a = new Float32Array(n), b = new Float32Array(n);
    for (let j = 0; j < NX; j++) for (let i = 0; i < NX; i++) a[j * NX + i] = fn(X0 + i * ST, X0 + j * ST);
    const pass = (src, dst, r, max, dx) => { for (let j = 0; j < NX; j++) for (let i = 0; i < NX; i++) { let m = 0, cnt = 0;
        for (let k = -r; k <= r; k++) { const ii = i + k * dx, jj = j + k * (1 - dx); if (ii < 0 || jj < 0 || ii >= NX || jj >= NX) continue; const v = src[jj * NX + ii]; if (max) { if (v > m) m = v; } else { m += v; cnt++; } }
        dst[j * NX + i] = max ? m : m / cnt; } };
    pass(a, b, RR, true, 1); pass(b, a, RR, true, 0); for (let k = 0; k < 2; k++) { pass(a, b, B, false, 1); pass(b, a, B, false, 0); }
    const f = (x, y) => { const u = (x - X0) / ST, v = (y - X0) / ST; if (!(u >= 0 && v >= 0 && u < NX - 1 && v < NX - 1)) return 0;
      const i = Math.floor(u), j = Math.floor(v), p = u - i, q = v - j, o = j * NX + i; return lerp(lerp(a[o], a[o + 1], p), lerp(a[o + NX], a[o + NX + 1], p), q); };
    if (ENV_CACHE.size > 12) ENV_CACHE.delete(ENV_CACHE.keys().next().value); ENV_CACHE.set(key, f); return f;
  }

  // ---------------------------------------------------------------- state
  // eye 'OD' | 'OS'; rd { amt 0→1, border [[fx, fy]…] (OS chart, mirrored for OD), lo, hi (peak heights, mm) }; tear { h, w, L, flap (deg), s (hinge) };
  // pvd 0→1 (posterior hyaloid detached from the pole out to the vitreous base); vit { cut, shave } 0→1; ta 0→1;
  // troc [{ id, h, s, ang, ins, out, inf, tip: 'vit' | 'sub' | 'supra' }]; inst [{ kind: 'vitrector' | 'light' | 'laser', port, tip }];
  // dep { h, s, depth, w }; pfcl, gas: volume fractions of the vitreous cavity; gasKind; laser 0→1; head { pose: 'supine' | 'sit' | 'facedown', tilt };
  // suck { h, s, amt, w } (optional): detached retina lifted amt mm toward the cutter round (h, s) (geom's H; 示意);
  // inverter (wide view), look { h, deg }, surgeon (clock hour at the bottom of the surgeon's views)
  const DEF = { eye: 'OD', rd: null, tear: null, pvd: 0, vit: null, ta: 0, troc: null, inst: [], dep: null, pfcl: 0, gas: 0, gasKind: 'air', laser: 0,
    head: null, inverter: true, look: null, surgeon: 12 };
  const S = st => Object.assign({}, DEF, st || {});
  const trocarsFor = eye => { const os = eye === 'OS'; return [{ id: 'it', h: os ? 4.5 : 7.5, inf: true }, { id: 'st', h: os ? 1.5 : 10.5 }, { id: 'sn', h: os ? 10.5 : 1.5 }]; };

  // ---------------------------------------------------------------- gravity from the head position (eye frame)
  // tilt: the patient's left side goes down by tilt degrees (sit: left ear toward the left shoulder; supine / face-down: face turned)
  function gravity(st) {
    const hd = Object.assign({ pose: 'supine', tilt: 0 }, (st && st.head) || {}), t = hd.tilt * D2R;
    if (hd.g) return unit(hd.g);
    if (hd.pose === 'sit') return [Math.sin(t), -Math.cos(t), 0];
    if (hd.pose === 'facedown') return [Math.sin(t), 0, Math.cos(t)];
    return [Math.sin(t), 0, -Math.cos(t)];
  }

  // ---------------------------------------------------------------- lens (phakic, Chinese) and iris (dilated)
  const LENS = (() => {
    const za = PZ[0] - GN.acd, zp = za - N.lensT, c1 = za - N.lensRa, c2 = zp + N.lensRp;
    const g0 = (z, rho, r) => { const a = Math.hypot(z - c1, rho) - N.lensRa, b = Math.hypot(z - c2, rho) - N.lensRp; return Math.min(-r, Math.max(a, b)) + Math.hypot(Math.max(r + a, 0), Math.max(r + b, 0)); };
    const eqR = r => { let best = 0; for (let z = zp; z <= za; z += 0.01) { if (g0(z, 0, r) > 0) continue; let lo = 0, hi = 6; for (let k = 0; k < 36; k++) { const m = (lo + hi) / 2; g0(z, m, r) < 0 ? lo = m : hi = m; } best = Math.max(best, lo); } return best; };
    let lo = 0, hi = 2; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; eqR(m) > N.lensD / 2 ? lo = m : hi = m; }
    const r = (lo + hi) / 2;                                              // equatorial rounding that gives the diameter (示意)
    return { za, zp, c1, c2, r, g: (z, rho) => g0(z, rho, r), zAnt: rho => c1 + Math.sqrt(N.lensRa ** 2 - rho * rho), zPost: rho => c2 - Math.sqrt(N.lensRp ** 2 - rho * rho) };
  })();
  const IRIS = (() => {
    const rf = surfAt(GN.spur + 0.35), tr = G.T(GN.spur + 0.35) + 0.45, root = [rf.z - rf.nz * tr, rf.rho - rf.nr * tr];
    const pm = [LENS.zAnt(N.pupil) + 0.12, N.pupil], c = [lerp(pm[0], root[0], 0.45) + 0.22, lerp(pm[1], root[1], 0.5)], line = [];
    for (let k = 0; k <= 48; k++) { const t = k / 48, u = 1 - t; line.push([u * u * pm[0] + 2 * u * t * c[0] + t * t * root[0], u * u * pm[1] + 2 * u * t * c[1] + t * t * root[1]]); }
    const th = t => 0.22 + 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.3)) * (t < 0.7 ? 1 : 1 - ss(0.7, 1, t) * 0.5);   // bunched when dilated (示意)
    return { root, pm, line, th };
  })();
  // ciliary body thickness at x = s − spur (globe/'s shape; pars plana runs to this model's ora)
  const cilTh = (x, oraX) => x < 0 ? -1 : x < N.plicata ? lerp(0.35, 1.05, ss(0, 0.6, x)) * (1 - ss(N.plicata - 0.6, N.plicata + 0.4, x) * 0.7) + 0.06 * Math.sin(x * 9) * ss(0.4, 0.8, x) * (1 - ss(N.plicata - 0.4, N.plicata, x)) : lerp(0.32, 0.22, ss(N.plicata, oraX, x));
  // front of the vitreous cavity in the meridional half-plane: posterior lens surface, then the anterior hyaloid to the start of the pars plana
  const HYF = (() => { const r1 = 3.8, z1 = LENS.zPost(r1), f = surfAt(PLICATA_END + 0.3), d = G.T(PLICATA_END + 0.3) + cilTh(N.plicata + 0.3, 4) + 0.02;
    const p2 = [f.z - f.nz * d, f.rho - f.nr * d]; return { r1, z1, p2, zh: rho => rho <= r1 ? LENS.zPost(rho) : z1 + (p2[0] - z1) * (rho - r1) / (p2[1] - r1) }; })();

  // ---------------------------------------------------------------- per-state geometry (RD heights, tear frame, depression, trocars, instruments, fluids)
  function geom(st0) {
    const st = S(st0), ts = tsgnOf(st), D = DISC[ts], g = gravity(st);
    const rd = st.rd ? Object.assign({ amt: 1, lo: 0.5, hi: 3.5 }, st.rd) : null;
    const poly = rd ? smoothClosed((rd.border || CASE_RD).map(p => [p[0] * ts, p[1]])) : null, sdf = poly ? sdfOf(poly) : null;
    const lev = levels(g, st.pfcl || 0, st.gas || 0);
    const dep = st.dep ? Object.assign({ depth: 1.5, w: 1.8 }, st.dep) : null;
    // PFCL presses the retina flat where it lies below the PFCL level
    const flat = (h, s) => { if (!(st.pfcl > 0)) return 1; const up = -dot(rpeAt(h, s), g); return ss(lev.pfcl - 0.2, lev.pfcl + 0.8, up); };
    const Hpk = (fx, fy) => lerp(rd.lo, rd.hi, ss(-6, 10, fy) * ss(5, 14, Math.hypot(fx, fy)));
    const H0 = (s, h) => { if (!rd || !(rd.amt > 0)) return 0; const ora = oraAt(h, ts); if (s < ora) return 0; const [fx, fy] = chartHS(h, s), d = sdf(fx, fy); if (d <= 0) return 0;
      return rd.amt * Hpk(fx, fy) * ss(0, 1.2, d) * ss(ora, ora + 5.0, s) * flat(h, s); };
    // optional st.suck { h, s, amt, w } (2026-11-12, RRD video 4-2): detached retina sucked toward the cutter's port, a Gaussian lift of amt mm
    // (width w, 示意) round (h, s), only where the retina is detached; without st.suck H is H0 itself (nothing else changes)
    const sk = st.suck ? Object.assign({ w: 1.0 }, st.suck) : null;
    const H1 = !sk ? H0 : (s, h) => { const b = H0(s, h); if (!(b > 0)) return b; const ds = s - sk.s; let dh = h - sk.h; dh -= 12 * Math.round(dh / 12);
      const dc = dh * 30 * D2R * surfAt(sk.s).rho; return b + sk.amt * ss(0, 0.3, b) * Math.exp(-(ds * ds + dc * dc) / (sk.w * sk.w)); };
    // optional st.bead { h, s, r, ht } (2026-11-12, RRD video 6-2): a bead of PFCL left under the retina (place and size 示意): the retina is lifted
    // over a round dome of radius r (mm along the wall) and height ht at its centre (h, s); the space under the dome is PFCL (field 'bead', not 'srf').
    // Without st.bead H is the function above (nothing else changes)
    const bd = st.bead ? Object.assign({ r: 0.35, ht: 0.3 }, st.bead) : null;
    const beadH = !bd ? null : (s, h) => { const ds = s - bd.s; let dh = h - bd.h; dh -= 12 * Math.round(dh / 12);
      const dc = dh * 30 * D2R * surfAt(bd.s).rho, q = (ds * ds + dc * dc) / (bd.r * bd.r); return q < 1 ? bd.ht * (1 - q) ** 1.5 : 0; };
    const H = !bd ? H1 : (s, h) => H1(s, h) + beadH(s, h);
    // posterior hyaloid (2026-11-12): hya(s, h) = how far it lies in front of where the retina's inner surface is when attached (mm). In the vitreous
    // base, and where it has not come off yet (pvd), it lies on the retina as it is now (H0, detached or not). Behind the line where it comes off
    // (hyaSp) it leaves the retina for env, a smooth upper envelope of the detachment (env ≥ H0), within 1.5 mm (B 0 → 1), and its gap above env
    // rises to N.pvdGap over 5 mm (R 0 → 1): it keeps a gap ≥ R × N.pvdGap from the bulging retina, and away from where it comes off it does not
    // follow the bumps of the border (the macular tongue). env is the detachment for amt 1 (without suck) on the fundus chart, built on first use.
    let ENV = null;
    const env = (fx, fy) => { if (!rd || !(rd.amt > 0)) return 0;
      if (!ENV) ENV = envOf(sdf.key + JSON.stringify([ts, rd.lo, rd.hi, st.pfcl > 0 ? [lev.pfcl, g] : 0]), (x, y) => { const hs = hsChart(x, y), ora = oraAt(hs.h, ts); if (hs.s < ora) return 0;
        const d = sdf(x, y); return d <= 0 ? 0 : Hpk(x, y) * ss(0, 1.2, d) * ss(ora, ora + 5.0, hs.s) * flat(hs.h, hs.s); });
      return rd.amt * ENV(fx, fy); };
    const hyaSp = h => lerp(S_POLE + 2, vbPostAt(h, ts), st.pvd || 0);
    const hya = (s, h) => { const h0 = H0(s, h); if (s < oraAt(h, ts)) return h0; const sp = hyaSp(h), R = ss(sp, sp + 5, s), B = ss(sp, sp + 1.5, s); if (!(R > 0)) return h0;
      const [fx, fy] = chartHS(h, s), he = Math.max(env(fx, fy), h0); return h0 + B * (he - h0) + R * N.pvdGap; };
    const Dp = (s, h) => { if (!dep) return 0; const ds = s - dep.s; let dh = h - dep.h; dh -= 12 * Math.round(dh / 12); const dc = dh * 30 * D2R * surfAt(dep.s).rho; return dep.depth * Math.exp(-(ds * ds + dc * dc) / (dep.w * dep.w)); };
    const rtHS = (h, s) => { const [fx, fy] = chartHS(h, s); return rtAt(fx, fy, s, oraAt(h, ts), D); };
    // a point on the retina: frac 0 = outer (photoreceptor) side, 1 = inner (ILM) side; includes the detachment and the indentation
    const ret = (h, s, frac = 0.5) => P3(h, s, Tp(s) + chorAt(s) + H(s, h) + frac * rtHS(h, s) + Dp(s, h));
    const ret0 = (h, s, frac = 0.5) => P3(h, s, Tp(s) + chorAt(s) + frac * rtHS(h, s));          // attached, not indented
    // tear: U-shaped hole hinged at its anterior edge on the posterior border of the vitreous base; local tangent frame at the hinge
    let tear = null;
    if (st.tear) { const t = Object.assign({ h: 11, w: 1.8, L: 1.8, flap: 95 }, st.tear), sh = t.s ?? vbPostAt(t.h, ts);
      const fr = (fn) => { const Q = fn(t.h, sh, 0.5), eu = unit(sub(fn(t.h, sh + 0.05, 0.5), fn(t.h, sh - 0.05, 0.5))), ec0 = unit(sub(fn(t.h + 0.005, sh, 0.5), fn(t.h - 0.005, sh, 0.5)));
        const ec = unit(sub(ec0, mul(eu, dot(ec0, eu)))); let en = unit(cross(ec, eu)); if (dot(en, Q) > 0) en = mul(en, -1); return { Q, eu, ec, en }; };
      tear = Object.assign({ sh, ts }, t, { fr: fr(ret), fr0: fr(ret0), th: rtHS(t.h, sh), ang: t.flap * D2R }); }
    return { st, ts, D, g, rd, poly, sdf, H, H0, Dp, lev, dep, ret, ret0, rtHS, tear, flat, suck: sk, env, hyaSp, hya, bead: bd, beadH };
  }
  // U-shaped hole in tangent coordinates (u posterior from the hinge, c across): signed distance, negative inside
  function sdU(u, c, W, L) { const r = W / 2, cx = (L - r) / 2, hx = (L - r) / 2, qx = Math.abs(u - cx) - hx, qy = Math.abs(c) - r;
    const box = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0), circ = Math.hypot(u - (L - r), c) - r; return Math.min(box, circ); }
  // the U outline in tangent coordinates, from one end of the hinge round the arc to the other
  function uOutline(W, L, n = 40) { const r = W / 2, out = []; for (let i = 0; i <= 8; i++) out.push([(L - r) * i / 8, -r]);
    for (let i = 1; i < n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; out.push([L - r + r * Math.cos(a), r * Math.sin(a)]); }
    for (let i = 8; i >= 0; i--) out.push([(L - r) * i / 8, r]); return out; }
  const tanPt = (fr, u, c, n = 0) => add(fr.Q, add(add(mul(fr.eu, u), mul(fr.ec, c)), mul(fr.en, n)));
  const flapPt = (T, u, c, fr = T.fr) => { const a = T.ang; return add(fr.Q, add(add(mul(fr.eu, u * Math.cos(a)), mul(fr.en, u * Math.sin(a))), mul(fr.ec, c))); };
  // project a tangent-plane point of the tear frame back onto the retina surface: find (h, s) whose retina point projects there
  function onRetina(Gm, fr, u, c, frac = 0.5, fn = Gm.ret) {
    const T = Gm.tear; let h = T.h + c / (Math.hypot(fr.Q[0], fr.Q[1]) * 30 * D2R), s = T.sh + u * 1.06;
    for (let k = 0; k < 14; k++) { const p = fn(h, s, frac), du = dot(sub(p, fr.Q), fr.eu) - u, dc = dot(sub(p, fr.Q), fr.ec) - c; if (Math.abs(du) + Math.abs(dc) < 1e-5) break;
      const ps = fn(h, s + 0.01, frac), ph = fn(h + 0.002, s, frac), a11 = dot(sub(ps, p), fr.eu) / 0.01, a12 = dot(sub(ph, p), fr.eu) / 0.002, a21 = dot(sub(ps, p), fr.ec) / 0.01, a22 = dot(sub(ph, p), fr.ec) / 0.002, det = a11 * a22 - a12 * a21;
      const ds = (du * a22 - dc * a12) / det, dh = (a11 * dc - a21 * du) / det; if (!isFinite(ds) || !isFinite(dh)) break;
      s -= clamp(ds, -0.5, 0.5); h -= clamp(dh, -0.05, 0.05); }   // damped Newton steps (the indentation makes the surface steep)
    return { h, s, p: fn(h, s, frac) };
  }

  // ---------------------------------------------------------------- vitreous cavity volume and fluid levels (voxels, attached retina)
  let VOX = null;
  function cavity0(p) {   // inside the vitreous cavity of the attached, undeformed eye
    const z = p[2], rho = Math.hypot(p[0], p[1]); if (z > HYF.zh(rho)) return false;
    const W = wallOf(z, rho), h = clockOf(p[0], p[1]), ts = 1, ora = oraAt(h, ts);   // the cavity's shape does not depend on the eye side within 0.1 mm³
    const inner = W.s < ora ? G.T(W.s) + cilTh(W.s - GN.spur, ora - GN.spur) : Tp(W.s) + chorAt(W.s) + (W.s < S_EQ ? lerp(0.10, 0.18, clamp((W.s - ora) / (S_EQ - ora), 0, 1)) : 0.22);
    return W.d > inner;
  }
  function voxels() {
    if (VOX) return VOX; const st = 0.4, pts = [];
    let k = 0; for (let x = -12 + st / 2; x < 12; x += st) for (let y = -12 + st / 2; y < 12; y += st) for (let z = -12 + st / 2; z < 9; z += st) { k++; const p = [x + st * (hash(k, 1) - 0.5), y + st * (hash(k, 2) - 0.5), z + st * (hash(k, 3) - 0.5)]; if (dot(p, p) < 144.5 && cavity0(p)) pts.push(p); }   // one point at a random place in each cell: heights never tie
    const xs = new Float32Array(pts.length * 3); pts.forEach((p, i) => { xs[3 * i] = p[0]; xs[3 * i + 1] = p[1]; xs[3 * i + 2] = p[2]; });
    VOX = { xs, n: pts.length, dv: st ** 3, vol: pts.length * st ** 3 }; return VOX;
  }
  const LEV_CACHE = new Map();
  // level (height along −g, mm from the globe centre) of the gas surface (fraction f at the top) and of the PFCL surface (fraction at the bottom)
  function levels(g, pf, gf) {
    const key = [g.map(v => v.toFixed(4)), pf.toFixed(4), gf.toFixed(4)].join('|'); if (LEV_CACHE.has(key)) return LEV_CACHE.get(key);
    let out = { pfcl: -1e9, gas: 1e9 };
    if (pf > 0 || gf > 0) { const V = voxels(), up = new Float32Array(V.n); for (let i = 0; i < V.n; i++) up[i] = -(V.xs[3 * i] * g[0] + V.xs[3 * i + 1] * g[1] + V.xs[3 * i + 2] * g[2]);
      const sorted = Array.from(up).sort((a, b) => a - b), q = f => sorted[clamp(Math.round(f * (V.n - 1)), 0, V.n - 1)];
      out = { pfcl: pf > 0 ? q(pf) : -1e9, gas: gf > 0 ? q(1 - gf) : 1e9 }; }
    if (LEV_CACHE.size > 200) LEV_CACHE.delete(LEV_CACHE.keys().next().value); LEV_CACHE.set(key, out); return out;
  }
  // fraction of the cavity above a height (along −g)
  function fracAbove(g, level) { const V = voxels(); let n = 0; for (let i = 0; i < V.n; i++) if (-(V.xs[3 * i] * g[0] + V.xs[3 * i + 1] * g[1] + V.xs[3 * i + 2] * g[2]) > level) n++; return n / V.n; }

  // ---------------------------------------------------------------- trocars, cannulas and instruments
  const portOf = (Gm, id) => { const T = troc(Gm); return typeof id === 'number' ? T[id] : T.find(t => t.id === id); };
  const TROC_CACHE = new WeakMap();
  function troc(Gm) {
    if (TROC_CACHE.has(Gm)) return TROC_CACHE.get(Gm);
    const st = Gm.st, list = st.troc === true ? trocarsFor(st.eye) : (st.troc || []);
    const out = list.map((t0, i) => {
      const t = Object.assign({ s: N.trocS, ang: N.tunnel, ins: 1, out: 0, tip: 'vit' }, t0), h = t.h, s = t.s, Tw = Tp(s), nin = mul(N3(h, s), -1);
      const entry = P3(h, s, 0), pivot = P3(h, s, Tw * 0.5), ec = unit(sub(P3(h + 0.01, s), P3(h - 0.01, s)));
      const a = t.ang * D2R, tdir = unit(add(mul(ec, Math.cos(a)), mul(nin, Math.sin(a))));            // tunnel parallel to the limbus, oblique (示意 direction)
      // the instrument in this port, if any, sets the cannula axis; otherwise it aims at the middle of the vitreous cavity (示意)
      const ins = (st.inst || []).find(x => x.port === t.id || x.port === i);
      let tipTarget = ins ? instTip(Gm, ins) : [0, 0, -3];
      if (t.inf && t.tip === 'sub') { const ss_ = oraAt(h, Gm.ts) + 1.0; tipTarget = P3(h, ss_, Tp(ss_) + chorAt(ss_) + Math.max(0.05, Gm.H(ss_, h) * 0.5)); }
      if (t.inf && t.tip === 'supra') tipTarget = P3(h, s + 1.6, Tw + 0.02);
      const axis = unit(sub(tipTarget, pivot));
      const L = N.cannulaL, base = sub(pivot, mul(axis, Tw * 0.5 + 0.25)), tip = t.inf && t.tip !== 'vit' ? tipTarget : add(base, mul(axis, L));
      // optional conjunctival opening (t.cj, mm along the tunnel direction ec from the scleral entry): 0 while the conjunctiva is held pushed
      // over the entry; after release it slides back and the opening no longer lies over the scleral one. Without t.cj the conjunctiva is intact.
      const cjC = typeof t.cj === 'number' ? P3(h + t.cj / (surfAt(s).rho * 30 * D2R), s, 0) : null, cjN = cjC ? N3(h + t.cj / (surfAt(s).rho * 30 * D2R), s) : null;
      return Object.assign({}, t, { i, entry, pivot, nin, ec, tdir, axis, base, tip, hubTop: sub(base, mul(axis, 1.1)), Tw, inst: ins || null, cjC, cjN });
    });
    TROC_CACHE.set(Gm, out); return out;
  }
  // instrument tip: [X, Y, Z] or { h, s, e } = clock, mm from the limbus, mm in front of the retina's inner surface
  function instTip(Gm, ins) { const t = ins.tip; if (Array.isArray(t)) return t; const s = t.s, h = t.h; return P3(h, s, Tp(s) + chorAt(s) + Gm.H(s, h) + Gm.rtHS(h, s) + Gm.Dp(s, h) + (t.e ?? 1)); }
  function instGeom(Gm, ins) {
    const port = portOf(Gm, ins.port), tip = instTip(Gm, ins), dir = unit(sub(port.pivot, tip)), out = add(port.pivot, mul(dir, 22));
    return { kind: ins.kind, port, tip, dir, out, r: N.shaft / 2, portAt: ins.kind === 'vitrector' ? add(tip, mul(dir, 0.5)) : null };
  }
  // distance from a point to a segment
  const segDist = (p, a, b) => { const e = sub(b, a), t = clamp(dot(sub(p, a), e) / (dot(e, e) || 1), 0, 1); return len(sub(p, add(a, mul(e, t)))); };

  // ---------------------------------------------------------------- tissue fields at a 3D point (g < 0 inside)
  function makeCtx(Gm) {
    const st = Gm.st, ts = Gm.ts, D = Gm.D, T = Gm.tear, TR = troc(Gm), IN = (st.inst || []).map(x => instGeom(Gm, x)), CJ = TR.filter(t => t.cjC);
    const gf = G.makeField({}).g;                                       // globe/'s cornea, limbus band, sclera (same anterior segment)
    const vit = Object.assign({ cut: 0, shave: 0 }, st.vit || {}), lev = Gm.lev, g = Gm.g;
    const cord = T ? (() => { const fe = flapPt(T, T.L, 0), dir = unit(add(mul(T.fr.en, 1), mul(T.fr.eu, -0.35))); return { a: fe, b: add(fe, mul(dir, 1.6 * (1 - vit.shave))) }; })() : null;
    const at = p => {
      const z = p[2], rho = Math.hypot(p[0], p[1]), W = wallOf(z, rho), h = clockOf(p[0], p[1]), s = W.s;
      const c = { p, z, rho, h, s, d: W.d, rhoF: W.rhoF, T: Tp(s), ora: oraAt(h, ts) };
      c.Dp = Gm.Dp(s, h); c.dd = W.d - c.Dp;
      c.cil = s < c.ora + 0.5 ? cilTh(s - GN.spur, c.ora - GN.spur) : 0;
      if (s > c.ora - 0.3) { const [fx, fy] = chartHS(h, s); c.fx = fx; c.fy = fy; c.ch = chorAt(s); c.H = Gm.H(s, h); c.Hb = Gm.beadH ? Gm.beadH(s, h) : 0; c.rt = rtAt(fx, fy, s, c.ora, D); c.dq = discQ(D, p).q; }
      else { c.ch = 0; c.H = 0; c.Hb = 0; c.rt = 0; c.dq = 9; }
      // the tear frame (detached position)
      if (T) { const q = sub(p, T.fr.Q); c.tu = dot(q, T.fr.eu); c.tc = dot(q, T.fr.ec); c.tn = dot(q, T.fr.en); }
      return c; };
    const Wg = c => ({ s: c.s, d: c.dd, T: c.T, c: 1e3, gap: 0, m: { z: c.z, rho: c.rho } });
    const innerD = c => c.s < c.ora ? c.T + Math.max(0, c.cil ?? 0) : c.dq < 1 ? c.T + c.ch + 0.25 - 0.45 * Math.max(0, 1 - c.dq * 1.6) : c.T + c.ch + c.H + c.rt;
    const hole = c => T && Math.abs(c.tn) < 1.2 && Math.abs(c.tu) < 4 ? sdU(c.tu, c.tc, T.w, T.L) : 9;
    const cav = c => Math.max(innerD(c) - c.dd, c.z - HYF.zh(c.rho));
    const capsule = (p, a, b, r) => segDist(p, a, b) - r;
    const f = {
      at,
      cornea: c => gf.cornea(Wg(c)), limbus: c => gf.limbus(Wg(c)),
      sclera: c => Math.max(gf.sclera(Wg(c)), Math.min((0.85 - c.dq) * 0.9, c.dd - 0.3)),               // scleral canal at the disc (continuous field: smooth edge)
      conj: c => { let g = Math.max(-c.dd - GN.conj, c.dd, 0.25 - c.s, c.s - 12);                         // to the fornix, ~12 mm (示意)
        for (const t of CJ) { const q = sub(c.p, t.cjC), a = dot(q, t.cjN); if (Math.abs(a) < 1) g = Math.max(g, N.cannula / 2 - len(sub(q, mul(t.cjN, a)))); }   // opening as wide as the cannula
        return g; },
      ciliary: c => c.s >= c.ora + 0.02 ? 1 : Math.max(c.T - c.dd, c.dd - c.T - (c.cil ?? 0), GN.spur - 0.02 - c.s),
      choroid: c => c.s < c.ora ? 1 : Math.max(c.T - c.dd, c.dd - c.T - c.ch, 0.92 - c.dq),
      srf: c => c.s < c.ora || c.H - c.Hb < 0.002 ? 1 : Math.max(c.T + c.ch + c.Hb - c.dd, c.dd - c.T - c.ch - c.H, 1 - c.dq),
      bead: c => !(c.Hb > 0.002) ? 1 : Math.max(c.T + c.ch - c.dd, c.dd - c.T - c.ch - c.Hb, 1 - c.dq),            // PFCL left under the retina (st.bead)
      retina: c => c.s < c.ora ? 1 : Math.max(c.T + c.ch + c.H - c.dd, c.dd - c.T - c.ch - c.H - c.rt, 1 - c.dq, -hole(c)),
      flap: c => { if (!T || Math.abs(c.tu) > 4 || Math.abs(c.tn) > 4) return 1; const a = T.ang, u = c.tu * Math.cos(a) + c.tn * Math.sin(a), n = -c.tu * Math.sin(a) + c.tn * Math.cos(a); return Math.max(sdU(u, c.tc, T.w, T.L), Math.abs(n) - T.th / 2); },
      onh: c => c.dq > 1 ? 1 : Math.max(c.dd - (c.T + c.ch + 0.25 - 0.45 * Math.max(0, 1 - c.dq * 1.6)), 0.25 - c.dd, c.dq - 1),   // nerve head in the disc and the scleral canal, cup (示意)
      nerve: c => { if (c.dq > 1.9 || c.dd > 0.3) return 1; const p = c.p, dir = D.u, t = -dot(p, dir) + D.R, ax = sub(p, mul(dir, dot(p, dir))); return Math.max(len(ax) - (1.6 + 0.12 * clamp(-c.dd, 0, 3)), c.dd - 0.3, -c.dd - 9); },
      interior: c => innerD(c) - c.dd,
      cavity: cav,
      lens: c => LENS.g(c.z, c.rho),
      iris: c => { if (c.rho < N.pupil - 0.3 || c.rho > IRIS.root[1] + 0.8 || c.z < IRIS.root[0] - 0.8 || c.z > IRIS.pm[0] + 1.0) return 1; const q = [c.z, c.rho];
        let bd = 1e9, bt = 0; const L = IRIS.line; for (let i = 1; i < L.length; i++) { const a = L[i - 1], e = [L[i][0] - a[0], L[i][1] - a[1]], l2 = e[0] * e[0] + e[1] * e[1]; let t = ((q[0] - a[0]) * e[0] + (q[1] - a[1]) * e[1]) / l2; t = clamp(t, 0, 1);
          const d = Math.hypot(q[0] - a[0] - e[0] * t, q[1] - a[1] - e[1] * t); if (d < bd) { bd = d; bt = (i - 1 + t) / (L.length - 1); } } return bd - IRIS.th(bt) / 2; },
      // vitreous gel: in the cavity, in front of the posterior hyaloid (detached by pvd: Gm.hya, the same formula), within the shell left by the cutter;
      // a cord holds the flap. Where the hyaloid has come off, the gel body rides over the detachment's envelope (B × he): the shell keeps its thickness
      gel: c => { const cv = cav(c); if (cv > 0.5) return 1; const e = c.dd - innerD(c) + c.H;   // mm in front of where the retina's inner surface lies when attached
        const vbp = vbPostAt(c.h, ts), sp = Gm.hyaSp(c.h), R = c.s < c.ora ? 0 : ss(sp, sp + 5, c.s), B = R > 0 ? ss(sp, sp + 1.5, c.s) : 0;
        const h0 = Gm.suck ? Gm.H0(c.s, c.h) : c.H, he = R > 0 ? Math.max(Gm.env(c.fx, c.fy), h0) : h0, hy = h0 + B * (he - h0) + R * N.pvdGap;
        let shell = lerp(30, 3.0, vit.cut); if (vit.shave > 0) shell = c.s < vbp + 0.5 ? lerp(shell, 0.45, vit.shave) : lerp(shell, 0, vit.shave);
        let gg = Math.max(cv, hy - e, e - shell - B * he);
        if (cord && cord.b) gg = Math.min(gg, Math.max(cv, capsule(c.p, cord.a, cord.b, 0.32 * (1 - vit.shave))));
        return gg; },
      // vitreous base (示意 thickness 1.2 mm): the gel firmly attached from 2 mm in front of the ora to its posterior border
      vb: c => { if (c.s > vbPostAt(c.h, ts) + 0.5 || c.s < vbAntAt(c.h, ts) - 0.5) return 1; const e = c.dd - innerD(c);
        return Math.max(f.gel(c), e - 1.2, vbAntAt(c.h, ts) - c.s, c.s - vbPostAt(c.h, ts)); },
      pfcl: c => st.pfcl > 0 ? Math.max(cav(c), -dot(c.p, g) - lev.pfcl) : 1,
      gas: c => st.gas > 0 ? Math.max(cav(c), lev.gas + dot(c.p, g)) : 1,
      cannula: c => { let m = 1; for (const t of TR) { if (!(t.ins > 0) || t.out >= 1) continue; const tip = t.ins < 1 ? add(t.entry, mul(t.tdir, (t.Tw / Math.sin(t.ang * D2R) + 0.4) * t.ins)) : t.tip;
          if (t.ins < 1) { m = Math.min(m, capsule(c.p, t.entry, tip, 0.32)); continue; }
          m = Math.min(m, Math.max(capsule(c.p, t.base, t.tip, N.cannula / 2), -capsule(c.p, t.base, t.tip, N.cannula / 2 - 0.08) - (t.inst ? 0 : 1))); } return m; },
      hub: c => { let m = 1; for (const t of TR) if (t.ins >= 1 && !(t.out >= 1)) m = Math.min(m, capsule(c.p, t.hubTop, t.base, N.hub / 2)); return m; },
      inst: c => { let m = 1; for (const I of IN) m = Math.min(m, capsule(c.p, I.tip, I.out, I.r)); return m; },
      depressor: c => { if (!Gm.dep) return 1; const dp = Gm.dep, r = 0.9, cen = P3(dp.h, dp.s, dp.depth - GN.conj - r - 0.01), out = add(cen, mul(N3(dp.h, dp.s), 14)); return capsule(c.p, cen, out, r); },
    };
    f.TR = TR; f.IN = IN; f.cord = cord;
    return f;
  }

  // ---------------------------------------------------------------- colours
  const C = {
    bg: '#f4f7f9', sclera: '#f8f6f2', scleraS: '#9aaab7', cornea: '#d8edf8', corneaS: '#7fb3d3', limb: '#e3edf2', conj: '#f2c9c9', conjS: '#cf8f93',
    aq: '#eef7fc', bss: '#e6f1f6', iris: '#6a4128', irisS: '#4a2b19', cil: '#8a5a41', cilS: '#6b432f', chor: '#a46f5a', chorS: '#6b3f2e', rpe: '#4e2a1d',
    ret: '#e9b3aa', retS: '#b8736a', srf: '#f1e1a2', srfS: '#c9b45e', lens: '#edf1f7', lensS: '#aebdcd', gel: '#dfead3', gelS: '#8ea67c', vb: '#c4d6b0', vbS: '#6f8c5a',
    gas: '#ffffff', gasS: '#4a6a8c', pfcl: '#d9ccf0', pfclS: '#6f58a3', onh: '#f1ddc6', onhS: '#c49f7f', nerve: '#efe2cf', nerveS: '#b7a185',
    cannula: '#8b97a3', cannulaS: '#4f5b66', hub: '#3a6db3', hubS: '#22477d', inst: '#a6aeb6', instS: '#59626b', dep: '#6b737c', depS: '#3c434a',
    ta: '#ffffff', taS: '#8b9399', laser: '#f7f1df', laserS: '#7b5a2c', light: '#fff4b8',
  };

  // ---------------------------------------------------------------- section through any plane (marching squares, as globe/)
  // opt: plane { O, U, V } (G.planes.meridian(h) or a custom one), win { x, y, w, h } (screen mm), step, st, id, noTissue (anchors only)
  const SEC_CACHE = new Map();
  function section(opt) {
    const Gm = geom(opt.st), st = Gm.st, pl = opt.plane || G.planes.meridian(((st.view || {}).h) ?? 11), win = opt.win, step = opt.step || 0.05;
    const toPl = p => G.toPlane(pl, p), A = {};
    let tis = '';
    if (!opt.noTissue) { const key = JSON.stringify([pl.O, pl.U, pl.V, win, step, st]);
      tis = SEC_CACHE.get(key); if (tis == null) { tis = sectionTissue(Gm, pl, win, step); if (SEC_CACHE.size > 40) SEC_CACHE.delete(SEC_CACHE.keys().next().value); SEC_CACHE.set(key, tis); } }
    const o = [tis];
    // anchors in screen mm (3D points projected; dist = how far from the plane)
    const anc = (name, p) => { const q = toPl(p); A[name] = q; A[name + '_off'] = Math.abs(dot(sub(p, pl.O), unit(cross(pl.U, pl.V)))); A[name + '_3'] = p; };
    const ts = Gm.ts;
    if (pl.kind === 'meridian') { const h = pl.h;
      for (const [k, hh] of [['R', h], ['L', ((h + 6 - 1) % 12) + 1]]) { const ora = oraAt(hh, ts);
        anc('ora' + k, Gm.ret0(hh, ora, 0.5)); anc('vbA' + k, P3(hh, vbAntAt(hh, ts), Tp(vbAntAt(hh, ts)))); anc('vbP' + k, Gm.ret(hh, vbPostAt(hh, ts), 1));
        anc('plana' + k, P3(hh, (PLICATA_END + ora) / 2, G.T((PLICATA_END + ora) / 2) + 0.1)); anc('plicata' + k, P3(hh, GN.spur + 1.0, G.T(GN.spur + 1.0) + 0.5)); anc('limbus' + k, P3(hh, 0, 0));
        anc('equator' + k, Gm.ret(hh, S_EQ, 1)); anc('choroid' + k, P3(hh, S_EQ + 3, Tp(S_EQ + 3) + chorAt(S_EQ + 3) / 2)); anc('sclera' + k, P3(hh, S_EQ + 3, Tp(S_EQ + 3) / 2));
        anc('vb' + k, P3(hh, ora, G.T(ora) + cilTh(ora - GN.spur, ora - GN.spur) + 0.6));
        const sp = S_POLE - 4; anc('hyaloid' + k, P3(hh, sp, Tp(sp) + chorAt(sp) + Gm.rtHS(hh, sp) + Gm.hya(sp, hh))); }
      A.hyaloid = A.hyaloidL;
      anc('fovea', Gm.ret(12, S_POLE, 1)); anc('lens', [0, 0, (LENS.za + LENS.zp) / 2]); anc('lensBack', [0, 0, LENS.zp]); }
    anc('centre', [0, 0, 0]);
    if (Gm.tear) { const T = Gm.tear; anc('hinge', T.fr.Q); anc('flapEdge', flapPt(T, T.L, 0)); anc('tearApex', onRetina(Gm, T.fr, T.L, 0, 0.5).p); anc('tearMid', onRetina(Gm, T.fr, T.L / 2, 0, 0.0).p);
      anc('srf', P3(T.h, T.sh + 2.5, Tp(T.sh + 2.5) + chorAt(T.sh + 2.5) + Gm.H(T.sh + 2.5, T.h) * 0.5)); }
    for (const t of troc(Gm)) { anc('troc_' + t.id, t.entry); anc('cannulaTip_' + t.id, t.tip); if (t.cjC) anc('cj_' + t.id, t.cjC); }
    if (Gm.bead) { const b = Gm.bead; anc('bead', P3(b.h, b.s, Tp(b.s) + chorAt(b.s) + b.ht / 2)); }   // the bead's centre (half its height above the RPE)
    if (Gm.dep) { anc('dep', Gm.ret(Gm.dep.h, Gm.dep.s, 1)); anc('depressor', P3(Gm.dep.h, Gm.dep.s, Gm.dep.depth - GN.conj - 0.9 - 2.5)); }
    for (const [i, ins] of (st.inst || []).entries()) { const I = instGeom(Gm, ins); anc('inst' + i, I.tip); }
    // fluid surfaces: the interface line in this plane (intersection with the level plane), clipped to the cavity
    const lineOf = (lev, name) => { const n = Gm.g, Un = dot(pl.U, n), Vn = dot(pl.V, n), On = dot(pl.O, n); // points with dot(p, −g) = lev ⇔ dot(p, n) = −lev
      if (Math.hypot(Un, Vn) < 1e-6) return; const pts = []; const dir = [-Vn, Un], l = Math.hypot(...dir), base = [-(lev + On) * Un / (Un * Un + Vn * Vn), -(lev + On) * Vn / (Un * Un + Vn * Vn)];
      const f = makeCtx(Gm); for (let t = -16; t <= 16; t += 0.05) { const q = [base[0] + dir[0] / l * t, base[1] + dir[1] / l * t], p3 = G.onPlane(pl, q[0], q[1]); if (f.cavity(f.at(p3)) < 0) pts.push(q); }
      if (pts.length > 1) { A[name + 'A'] = pts[0]; A[name + 'B'] = pts[pts.length - 1]; } };
    if (st.gas > 0) lineOf(Gm.lev.gas, 'gasLine'); if (st.pfcl > 0) lineOf(Gm.lev.pfcl, 'pfclLine');
    if (!opt.noTissue) { // laser marks near the plane, instrument details
      for (const sp of laserSpots(Gm)) { const off = Math.abs(dot(sub(sp.p, pl.O), unit(cross(pl.U, pl.V)))); if (off < 0.25) { const q = toPl(sp.p); o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="0.12" fill="${C.laser}" stroke="${C.laserS}" stroke-width="0.8" ${NS}/>`); } }
      for (const ins of (st.inst || [])) { const I = instGeom(Gm, ins), off = Math.abs(dot(sub(I.tip, pl.O), unit(cross(pl.U, pl.V))));
        if (I.kind === 'light' && off < 1.5) { const q = toPl(I.tip); o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="0.45" fill="${C.light}" opacity="0.8"/>`); }
        if (I.portAt && off < 0.6) { const q = toPl(I.portAt); o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="0.16" fill="#2b3036"/>`); } }
      for (const t of troc(Gm)) if (t.out >= 1) { const a = toPl(t.entry), b = toPl(add(t.entry, mul(t.tdir, t.Tw / Math.sin(t.ang * D2R)))), off = Math.abs(dot(sub(t.entry, pl.O), unit(cross(pl.U, pl.V))));
        if (off < 1) o.push(`<path d="M${F(a)}L${F(b)}" stroke="#7d6a5a" stroke-width="1.4" ${NS}/>`); } }
    return { svg: o.join(''), A, plane: pl, Gm };
  }
  function sectionTissue(Gm, pl, win, step) {
    const f = makeCtx(Gm), st = Gm.st, nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(win.h / step) + 1, CT = new Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) CT[j * nx + i] = f.at(G.onPlane(pl, win.x + i * step, win.y + j * step));
    const vals = new Float64Array(nx * ny);
    const layer = (name, fill, stroke, sw = 0.9, extra = '') => { const g = f[name]; let any = false;
      for (let k = 0; k < CT.length; k++) { vals[k] = g(CT[k]); if (vals[k] < 0) any = true; }
      if (!any) return ''; return `<path d="${contour(vals, nx, ny, win.x, win.y, step).map(l => 'M' + l.map(p => p[0].toFixed(3) + ' ' + p[1].toFixed(3)).join('L') + 'Z').join('')}" fill="${fill}" fill-rule="evenodd" ${stroke ? `stroke="${stroke}" stroke-width="${sw}" ${NS}` : ''} ${extra}/>`; };
    const o = [`<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="${C.bg}"/>`];
    o.push(layer('interior', C.aq), layer('cavity', C.bss), layer('gel', C.gel, C.gelS, 0.8), layer('vb', C.vb, C.vbS, 0.7, 'stroke-dasharray="3 2"'));
    o.push(layer('pfcl', C.pfcl, C.pfclS, 1.1), layer('gas', C.gas, C.gasS, 1.1));
    o.push(layer('srf', C.srf, C.srfS, 0.6), layer('bead', C.pfcl, C.pfclS, 0.8), layer('lens', C.lens, C.lensS), layer('iris', C.iris, C.irisS, 0.6));
    o.push(layer('choroid', C.chor, C.chorS, 0.6), layer('ciliary', C.cil, C.cilS, 0.6), layer('retina', C.ret, C.retS, 0.7), layer('flap', C.ret, C.retS, 0.7));
    o.push(layer('sclera', C.sclera, C.scleraS), layer('limbus', C.limb, null), layer('cornea', C.cornea, C.corneaS), layer('conj', C.conj, C.conjS, 0.6));
    o.push(layer('onh', C.onh, C.onhS, 0.6), layer('nerve', C.nerve, C.nerveS, 0.6));
    o.push(taDots(Gm, f, pl, win));
    o.push(layer('cannula', C.cannula, C.cannulaS, 0.7), layer('hub', C.hub, C.hubS, 0.7), layer('inst', C.inst, C.instS, 0.8), layer('depressor', C.dep, C.depS, 0.8));
    // zonules (示意): three strands each side from the pars plicata to the lens equator, in meridional planes
    if (pl.kind === 'meridian') { const Z = []; for (const hh of [pl.h, ((pl.h + 5) % 12) + 1]) for (const [s, zr] of [[GN.spur + 1.0, 0.55], [GN.spur + 1.4, 0], [GN.spur + 1.8, -0.55]]) {
        const dd = G.T(s) + cilTh(s - GN.spur, 7) + 0.02, a = G.toPlane(pl, P3(hh, s, dd)), [cx, cy] = clockDir(hh), r = N.lensD / 2 - 0.25, b = G.toPlane(pl, [r * cx, r * cy, (LENS.za + LENS.zp) / 2 + 0.6 + zr]);
        Z.push(`<path d="M${F(a)}L${F(b)}" stroke="#b9b2a4" stroke-width="0.6" opacity="0.8" ${NS}/>`); } o.push(Z.join('')); }
    return o.join('');
  }
  // TA: white specks stuck on and in the gel (Burk 2003); deterministic positions on a 0.42 mm lattice in the plane
  function taDots(Gm, f, pl, win) {
    const st = Gm.st; if (!(st.ta > 0)) return ''; const o = [], cell = 0.42;
    for (let y = Math.floor(win.y / cell); y * cell < win.y + win.h; y++) for (let x = Math.floor(win.x / cell); x * cell < win.x + win.w; x++) {
      const r1 = hash(x * 3.1, y * 1.7), r2 = hash(x * 1.3, y * 2.9), r3 = hash(x * 0.7, y * 0.3); if (r3 > 0.55 * st.ta) continue;
      const u = (x + r1) * cell, v = (y + r2) * cell, c = f.at(G.onPlane(pl, u, v)), gg = f.gel(c); if (!(gg < 0)) continue;
      o.push(`<circle cx="${u.toFixed(3)}" cy="${v.toFixed(3)}" r="${(0.05 + 0.03 * r1).toFixed(3)}" fill="${C.ta}" stroke="${C.taS}" stroke-width="0.5" ${NS}/>`); }
    return o.join('');
  }

  // ---------------------------------------------------------------- laser spots round the tear (on the retina, tangent frame of the tear)
  function laserSpots(Gm) {
    const T = Gm.tear, st = Gm.st; if (!T || !(st.laser > 0)) return [];
    const W = T.w, L = T.L, out = [];
    for (const [ri, off] of [[0, 0.55], [1, 1.05]]) {
      // offset outline of the U (closed across the hinge): straight sides, posterior arc, anterior side at u = −off with rounded corners
      const r = W / 2 + off, pts = [], add_ = (u, c) => pts.push([u, c]);
      for (let u = -0.0; u <= L - W / 2; u += 0.05) add_(u, -r);
      for (let a = -90; a <= 90; a += 2) add_(L - W / 2 + r * Math.cos(a * D2R), r * Math.sin(a * D2R));
      for (let u = L - W / 2; u >= 0; u -= 0.05) add_(u, r);
      for (let a = 90; a <= 180; a += 3) add_(off * Math.cos(a * D2R), W / 2 + off * Math.sin(a * D2R));
      for (let c = W / 2; c >= -W / 2; c -= 0.05) add_(-off, c);
      for (let a = 180; a <= 270; a += 3) add_(off * Math.cos(a * D2R), -W / 2 + off * Math.sin(a * D2R));
      let acc = 0; const sp = 0.5; out.push({ u: pts[0][0], c: pts[0][1], ring: ri });
      for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc >= sp) { acc = 0; out.push({ u: pts[i][0], c: pts[i][1], ring: ri }); } }
    }
    const n = Math.round(out.length * clamp(st.laser, 0, 1));
    return out.slice(0, n).map(q => Object.assign(q, onRetina(Gm, T.fr, q.u, q.c, 1)));
  }

  // ---------------------------------------------------------------- fundus features shared by the fundus chart and the wide-angle view
  // vessels (示意), drawn for OS in chart mm (temporal +x); arteries lighter and thinner than veins
  const VESSELS = [
    [[-4.5, 1.25], [-3.0, 2.7], [-0.6, 3.9], [2.5, 4.4], [6.0, 4.7], [10, 5.6], [14.5, 7.6], [18.5, 10.2]],
    [[-4.6, 0.1], [-3.1, -1.5], [-0.6, -3.1], [2.5, -3.7], [6.0, -4.0], [10, -5.1], [14.5, -7.4], [18.5, -10.0]],
    [[-5.0, 1.3], [-6.8, 2.8], [-10, 5.2], [-14, 8.2], [-17.5, 11]],
    [[-5.0, 0.0], [-6.8, -1.4], [-10, -4.2], [-14, -7.2], [-17.5, -10]],
    [[-3.0, 2.7], [-3.6, 6], [-3.0, 11], [-1.8, 16.5]], [[-3.1, -1.5], [-3.6, -5], [-3.0, -10], [-1.8, -15.5]],
    [[2.5, 4.4], [4.2, 7.4], [6.4, 11.4], [8.6, 15.6]], [[2.5, -3.7], [4.2, -7.0], [6.4, -11.0], [8.6, -15.2]],
    [[-0.6, 3.9], [0.4, 2.6], [1.0, 1.8]], [[-0.6, -3.1], [0.4, -2.0], [1.0, -1.4]], [[6.0, 4.7], [7.6, 2.4], [8.4, 0.8]], [[6.0, -4.0], [7.6, -2.0], [8.4, -0.6]],
  ];
  const densify = (pts, step = 0.4) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return out; };
  const smoothOpen = (pts, k = 6) => { const out = [], n = pts.length; for (let i = 0; i < n - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); } }
    out.push(pts[n - 1]); return out; };

  // build the drawing for a projection: proj(p3) → screen [x, y] or null (not visible); pos(h, s, frac) → the 3D retina point to use
  function fundusLayers(Gm, proj, pos, o, A, mode, id) {
    const st = Gm.st, ts = Gm.ts, D = Gm.D;
    const path = (pts3, close) => { const segs = []; let cur = []; for (const p of pts3) { const q = p && proj(p); if (q) cur.push(q); else if (cur.length) { segs.push(cur); cur = []; } } if (cur.length) segs.push(cur);
      return segs.filter(s => s.length > 1).map(s => 'M' + s.map(F).join('L') + (close && segs.length === 1 ? 'Z' : '')).join(''); };
    const chartPos = (fx, fy, frac = 1) => { const hs = hsChart(fx, fy); return pos(hs.h, hs.s, frac); };
    // pars plana ring, vitreous base, ora (scalloped), equator, vortex veins
    const ring = (fn, n = 240) => { const pts = []; for (let k = 0; k <= n; k++) { const h = 12 * k / n; pts.push(fn(h)); } return pts; };
    const oraP = ring(h => pos(h, oraAt(h, ts) + 0.04 * Math.abs(Math.sin(h * 30 * D2R * 24)) * 3, 0.5), 720);
    const vbA = ring(h => P3(h, vbAntAt(h, ts), Tp(vbAntAt(h, ts)) + 0.6)), vbP = ring(h => pos(h, vbPostAt(h, ts), 1)), pl0 = ring(h => P3(h, PLICATA_END, G.T(PLICATA_END) + 0.4));
    o.push(`<path d="${path(pl0, true)}${path(oraP, true)}" fill="#7d6152" fill-rule="evenodd" opacity="0.9"/>`);                       // pars plana (dark, pigmented epithelium)
    o.push(`<path d="${path(vbA, true)}${path(vbP, true)}" fill="#f3eee2" fill-rule="evenodd" opacity="0.32"/>`);                        // vitreous base band (示意 tint)
    o.push(`<path d="${path(vbP, true)}" fill="none" stroke="#efe6cf" stroke-width="1" stroke-dasharray="3 3" opacity="0.8" ${NS}/>`);
    o.push(`<path d="${path(oraP, true)}" fill="none" stroke="#e7c9a1" stroke-width="1.3" ${NS}/>`);
    if (mode === 'chart') o.push(`<path d="${path(ring(h => pos(h, S_EQ, 1)), true)}" fill="none" stroke="#f4d2b8" stroke-width="0.9" stroke-dasharray="5 4" opacity="0.7" ${NS}/>`);
    for (const h of [1.5, 4.5, 7.5, 10.5]) { const s = oraAt(h, ts) + N.vortex, pts = []; for (let k = 0; k <= 24; k++) { const a = 2 * Math.PI * k / 24; pts.push(pos(h + 0.09 * Math.cos(a), s + 0.55 * Math.sin(a), 1)); }
      o.push(`<path d="${path(pts, true)}" fill="#4f2a1d" opacity="0.55"/>`); A['vortex' + h] = proj(pos(h, s, 1)); }
    // macula, fovea, foveola (pigment and reflex, 示意 colours)
    const circ = (r, n = 72) => { const pts = []; for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; pts.push(chartPos(r * Math.cos(a) + 1e-6, r * Math.sin(a), 1)); } return pts; };
    o.push(`<path d="${path(circ(N.macula / 2), true)}" fill="#7a2f1d" opacity="0.28"/><path d="${path(circ(N.fovea / 2), true)}" fill="#5c2214" opacity="0.35"/><path d="${path(circ(N.foveola / 2, 36), true)}" fill="#fff3d6" opacity="0.75"/>`);
    A.fovea = proj(pos(12, S_POLE, 1)); A.macula = proj(chartPos(0, -N.macula / 2 * 0.7, 1));
    // vessels (with the detachment they ride on the detached retina)
    const VS = VESSELS.map(v => smoothOpen(v.map(p => [p[0] * ts, p[1]])).map(p => densify([p])[0]));
    const vpath = v => path(densify(v, 0.3).map(p => chartPos(p[0], p[1], 1)));
    for (const v of VS) { const d = vpath(v); o.push(`<path d="${d}" fill="none" stroke="#8e2219" stroke-width="2.2" stroke-linecap="round" opacity="0.85" ${NS}/>`); }
    for (const v of VS) { const d = vpath(v.map(p => [p[0] + 0.22, p[1] + 0.22])); o.push(`<path d="${d}" fill="none" stroke="#c4483a" stroke-width="1.4" stroke-linecap="round" opacity="0.85" ${NS}/>`); }
    // optic disc and cup
    const dOut = discOutline(D).map(p => { const hs = hsChart(...chart3(p)); return pos(hs.h, hs.s, 1); }), dc = D.chart;
    o.push(`<path d="${path(dOut, true)}" fill="#f2c9a0" stroke="#d99a6a" stroke-width="1" ${NS}/>`);
    const cup = []; for (let k = 0; k <= 48; k++) { const a = 2 * Math.PI * k / 48; cup.push(chartPos(dc[0] + 0.3 * D.a * 2 * Math.cos(a), dc[1] + 0.3 * D.b * 2 * Math.sin(a), 1)); }
    o.push(`<path d="${path(cup, true)}" fill="#fbebd6" opacity="0.9"/>`); A.disc = proj(chartPos(dc[0], dc[1], 1)); A.discTop = proj(chartPos(dc[0], dc[1] + D.b, 1));
    // retinal detachment: grey-white elevated retina (示意 colour), its border
    if (Gm.poly && Gm.rd.amt > 0) { const bd = densify(Gm.poly, 0.3).map(p => { const hs = hsChart(p[0], p[1]), ora = oraAt(hs.h, ts); return hs.s < ora ? pos(hs.h, ora, 1) : pos(hs.h, hs.s, 1); });
      const dpath = path(bd, true); o.push(`<clipPath id="${id}_rd"><path d="${dpath}"/></clipPath>`);
      o.push(`<path d="${dpath}" fill="#e9e6df" opacity="${(0.62 * Math.min(1, Gm.rd.amt * 1.5)).toFixed(2)}"/>`);
      o.push(`<g clip-path="url(#${id}_rd)" opacity="${(0.55 * Gm.rd.amt).toFixed(2)}">` + VS.map(v => `<path d="${vpath(v)}" fill="none" stroke="#5a1a14" stroke-width="2" stroke-linecap="round" ${NS}/>`).join('') + '</g>');
      o.push(`<path d="${dpath}" fill="none" stroke="#bfb8aa" stroke-width="1.1" ${NS}/>`);
      A.rd = proj(pos(1.5, oraAt(1.5, ts) + 6, 1)); A.rdMac = proj(chartPos(0.2 * ts, -1.8, 1)); }
    if (mode === 'wide' && Gm.dep) mound(Gm, proj, pos, o, A, id);
    // the tear: bare RPE (red) in the U, the flap (retina) lifted toward the vitreous base
    if (Gm.tear) { const T = Gm.tear, fr = mode === 'chart' ? T.fr0 : T.fr, fn = mode === 'chart' ? Gm.ret0 : Gm.ret;
      const U = uOutline(T.w, T.L), hole = U.map(q => mode === 'chart' ? onRetina(Gm, fr, q[0], q[1], 0, fn).p : onRetina(Gm, fr, q[0], q[1], 0, fn).p);
      o.push(`<path d="${path(hole, true)}" fill="#c8361f" stroke="#7e1c10" stroke-width="1" ${NS}/>`);
      const flap = U.map(q => flapPt(T, q[0], q[1], fr)); o.push(`<path d="${path(flap, true)}" fill="#ece3d6" stroke="#9f9384" stroke-width="1" opacity="0.92" ${NS}/>`);
      A.tear = proj(onRetina(Gm, fr, T.L / 2, 0, 0, fn).p); A.tearApex = proj(onRetina(Gm, fr, T.L, 0, 0, fn).p); A.hinge = proj(fr.Q); A.flapEdge = proj(flapPt(T, T.L, 0, fr)); }
    // a PFCL bead left under the retina (st.bead): a round, glistening spot on the retina over it (示意 colours); anchor bead = its centre
    if (Gm.bead) { const b = Gm.bead, rr = surfAt(b.s).rho * 30 * D2R, pts = [];
      for (let i = 0; i <= 48; i++) { const a = 2 * Math.PI * i / 48; pts.push(pos(b.h + b.r * Math.cos(a) / rr, b.s + b.r * Math.sin(a), 1)); }
      const c = proj(pos(b.h, b.s, 1)); A.bead = c;
      o.push(`<path d="${path(pts, true)}" fill="#f3eeff" fill-opacity="0.8" stroke="#7d6bb5" stroke-width="1" ${NS}/>`);
      if (c) o.push(`<circle cx="${(c[0] - b.r * 0.3).toFixed(3)}" cy="${(c[1] - b.r * 0.3).toFixed(3)}" r="${(b.r * 0.28).toFixed(3)}" fill="#ffffff" opacity="0.95"/>`); }
    // laser spots
    for (const sp of laserSpots(Gm)) { const q = proj(mode === 'chart' ? Gm.ret0(sp.h, sp.s, 1) : sp.p); if (q) o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="${(mode === 'chart' ? 0.16 : 0.16).toFixed(3)}" fill="${C.laser}" stroke="${C.laserS}" stroke-width="0.9" opacity="0.95" ${NS}/>`); }
  }

  // indentation seen in the wide-angle view: the mound of retina pushed into view; lit on the side toward the centre, shadow on the far side (示意)
  function mound(Gm, proj, pos, o, A, id) {
    const dp = Gm.dep, rr = surfAt(dp.s).rho * 30 * D2R, ring = (k, ds) => { const pts = []; for (let i = 0; i <= 48; i++) { const a = 2 * Math.PI * i / 48; pts.push(proj(pos(dp.h + k * dp.w * Math.cos(a) / rr, dp.s + ds + k * dp.w * Math.sin(a), 1))); } return pts; };
    const c = proj(pos(dp.h, dp.s - 0.2, 1)), outer = ring(1.35, 0.35), r = Math.max(...outer.map(q => Math.hypot(q[0] - c[0], q[1] - c[1])));
    o.push(`<defs><radialGradient id="${id}_md" cx="${c[0].toFixed(3)}" cy="${c[1].toFixed(3)}" r="${r.toFixed(3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2c4" stop-opacity="0.75"/><stop offset="0.55" stop-color="#f7b98c" stop-opacity="0.4"/><stop offset="1" stop-color="#5a2010" stop-opacity="0.45"/></radialGradient></defs>`);
    o.push(`<path d="M${outer.map(F).join('L')}Z" fill="url(#${id}_md)"/><path d="M${ring(1.35, 0.35).map(F).join('L')}Z" fill="none" stroke="#fff3e2" stroke-width="1" stroke-dasharray="3 3" opacity="0.7" ${NS}/>`);
    A.dep = proj(pos(dp.h, dp.s, 1));
  }

  // ---------------------------------------------------------------- fundus chart (examiner's drawing): 12 o'clock up, OS 3 o'clock (temporal) right
  function fundus(opt) {
    const Gm = geom(opt.st), st = Gm.st, id = opt.id || 'fd', ts = Gm.ts, o = [], A = {};
    const proj = p => { const c = chart3(p); return [c[0], -c[1]]; };
    const pos = (h, s, frac = 1) => Gm.ret0(h, s, frac);
    const rEdge = K * (Math.PI - phiOfS(PLICATA_END));
    o.push(`<defs><radialGradient id="${id}_bg" cx="0" cy="0" r="${rEdge}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e2793f"/><stop offset="0.55" stop-color="#d4642f"/><stop offset="0.85" stop-color="#b44a26"/><stop offset="1" stop-color="#8f3a20"/></radialGradient></defs>`);
    o.push(`<circle cx="0" cy="0" r="${rEdge.toFixed(3)}" fill="url(#${id}_bg)"/>`);
    fundusLayers(Gm, proj, pos, o, A, 'chart', id);
    for (const t of troc(Gm)) { const q = proj(P3(t.h, t.s, 0.6)); o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="0.55" fill="${t.inf ? '#9ec5e8' : C.hub}" stroke="#fff" stroke-width="1.2" ${NS}/>`); A['troc_' + t.id] = q; }
    if (Gm.dep) { const q = proj(Gm.ret0(Gm.dep.h, Gm.dep.s, 1)); o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="${(Gm.dep.w * 1.3).toFixed(2)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="4 3" ${NS}/>`); A.dep = q; }
    A.centre = [0, 0]; A.rEdge = rEdge;
    for (let h = 1; h <= 12; h++) { const r = rEdge + 1.4, [cx, cy] = clockDir(h); A['clock' + h] = [r * cx, -r * cy]; }
    return { svg: o.join(''), A, proj, Gm };
  }

  // ---------------------------------------------------------------- surgeon's wide-angle view (non-contact system through the pupil)
  // Viewpoint V on the axis (N.nodal behind the corneal apex); a point is drawn at its angle β from the viewing axis (equidistant, K_W mm per radian),
  // out to half the field. Erect image (inverter on), surgeon at 12: 12 o'clock at the bottom. Inverter off: the inverted image (rotated 180°).
  const VZ = PZ[0] - N.nodal, K_W = Math.abs(VZ - PZ[PN]) - Tp(S_POLE) - chorAt(S_POLE);   // 1 screen mm ≈ 1 retinal mm at the pole
  function wideMap(st) {
    st = S(st); const lk = st.look || { h: 12, deg: 0 }, a = (lk.deg || 0) * D2R, [cx, cy] = clockDir(lk.h ?? 12);
    const d = [Math.sin(a) * cx, Math.sin(a) * cy, -Math.cos(a)], axis = cross([0, 0, -1], d), al = len(axis);
    const rot = v => { if (al < 1e-9) return v; const k = mul(axis, 1 / al), c = Math.cos(a), s = Math.sin(a); return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))); };
    const ex = rot([1, 0, 0]), ey = rot([0, 1, 0]), M = G.enfaceMap(st.surgeon ?? 12), inv = st.inverter === false ? -1 : 1, bmax = N.field / 2 * D2R;
    const raw = p => { const q = sub(p, [0, 0, VZ]), l = len(q) || 1, b = Math.acos(clamp(dot(q, d) / l, -1, 1)), x = dot(q, ex), y = dot(q, ey), r = Math.hypot(x, y) || 1e-12;
      return { b, sx: K_W * b * x / r, sy: -K_W * b * y / r }; };
    // beyond the field a point is pushed just outside the field circle (clipped away), so rings and fills stay closed
    const proj = p => { const w = raw(p), k = w.b > bmax * 1.06 ? bmax * 1.06 / w.b : 1, m = M([w.sx * k, -w.sy * k, 0]); return [inv * m[0], inv * m[1]]; };
    return { proj, raw, beta: p => raw(p).b, R: K_W * bmax, bmax, d, inv };
  }
  function wide(opt) {
    const Gm = geom(opt.st), st = Gm.st, id = opt.id || 'wd', o = [], A = {}, W = wideMap(st), R = W.R;
    const pos = (h, s, frac = 1) => Gm.ret(h, s, frac);
    const cen = W.proj([0, 0, -12]);
    o.push(`<defs><radialGradient id="${id}_bg" cx="${cen[0]}" cy="${cen[1]}" r="${R * 1.25}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e57c40"/><stop offset="0.6" stop-color="#cf5f2c"/><stop offset="1" stop-color="#8f3a20"/></radialGradient>` +
      `<clipPath id="${id}_f"><circle cx="0" cy="0" r="${R.toFixed(3)}"/></clipPath><radialGradient id="${id}_vg" cx="0" cy="0" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="0.72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs>`);
    o.push(`<rect x="${-R * 1.6}" y="${-R * 1.6}" width="${R * 3.2}" height="${R * 3.2}" fill="#0c0d0f"/><g clip-path="url(#${id}_f)"><circle cx="0" cy="0" r="${R}" fill="url(#${id}_bg)"/>`);
    fundusLayers(Gm, W.proj, pos, o, A, 'wide', id);
    // fluid levels where they meet the retina (bright meniscus line, 示意)
    for (const [k, lev, col] of [['gas', Gm.lev.gas, '#ffffff'], ['pfcl', Gm.lev.pfcl, '#efe4ff']]) { if (!(st[k] > 0.005 && st[k] < 0.995)) continue;
      const g = Gm.g, n = unit(g), a1 = unit(cross(n, Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), a2 = cross(n, a1), pts = [];
      for (let t = 0; t <= 360; t += 2) { const dir = add(mul(a1, Math.cos(t * D2R)), mul(a2, Math.sin(t * D2R))); let lo = 0, hi = 13, base = mul(n, -lev);
        const f = makeCtx(Gm); for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; f.cavity(f.at(add(base, mul(dir, m)))) < 0 ? lo = m : hi = m; } pts.push(add(base, mul(dir, lo))); }
      const pr = pts.map(W.proj); const segs = []; let cur = []; for (const q of pr) { if (q && Math.hypot(...q) < R * 1.05) cur.push(q); else if (cur.length) { segs.push(cur); cur = []; } } if (cur.length) segs.push(cur);
      o.push(segs.filter(s => s.length > 1).map(s => `<path d="M${s.map(F).join('L')}" fill="none" stroke="${col}" stroke-width="2.4" opacity="0.9" ${NS}/>`).join('')); }
    // TA specks over the gel (sampled once in 3D, kept where the gel is)
    if (st.ta > 0) { const f = makeCtx(Gm); for (let k = 0; k < 900; k++) { if (hash(k, 11) > 0.6 * st.ta) continue; const p = [24 * hash(k, 12) - 12, 24 * hash(k, 13) - 12, 20 * hash(k, 14) - 12];
        if (len(p) > 12) continue; if (!(f.gel(f.at(p)) < 0)) continue; const q = W.proj(p); if (q) o.push(`<circle cx="${q[0].toFixed(3)}" cy="${q[1].toFixed(3)}" r="${(0.1 + 0.06 * hash(k, 15)).toFixed(3)}" fill="#fff" opacity="0.85"/>`); } }
    // instruments seen through the pupil: shaft from the cannula to the tip, width from the distance to the viewpoint. A shaft that passes within
    // N.nearCut of the viewpoint (right behind the lens: reaching the far periphery, 2026-11-12) is drawn from its tip up to there only (that part
    // would fill the field and is far out of focus; 示意)
    for (const [i, ins] of (st.inst || []).entries()) { const I = instGeom(Gm, ins), pts = [];
      for (let t = 0; t <= 1.0001; t += 0.02) { const p = add(I.tip, mul(sub(I.port.tip, I.tip), t)), q = W.proj(p), dv = len(sub(p, [0, 0, VZ])); if (dv < N.nearCut) break; if (!q) continue; pts.push([q, K_W * N.shaft / dv]); }
      if (pts.length > 1) { const L = [], Rr = []; for (let k = 0; k < pts.length; k++) { const [q, w] = pts[k], nb = pts[Math.min(pts.length - 1, k + 1)][0], pb = pts[Math.max(0, k - 1)][0], t = unit([nb[0] - pb[0], nb[1] - pb[1], 0]), nrm = [-t[1], t[0]];
          L.push([q[0] + nrm[0] * w / 2, q[1] + nrm[1] * w / 2]); Rr.push([q[0] - nrm[0] * w / 2, q[1] - nrm[1] * w / 2]); }
        o.push(`<path d="M${[...L, ...Rr.reverse()].map(F).join('L')}Z" fill="#b4bcc4" stroke="#4b545d" stroke-width="1" ${NS}/>`); }
      const q = W.proj(I.tip); A['inst' + i] = q;
      if (I.kind === 'light' && q) o.push(`<circle cx="${q[0]}" cy="${q[1]}" r="1.8" fill="${C.light}" opacity="0.55"/><circle cx="${q[0]}" cy="${q[1]}" r="0.5" fill="#fff"/>`);
      if (I.kind === 'laser' && q) o.push(`<circle cx="${q[0]}" cy="${q[1]}" r="0.25" fill="#ff3b30"/>`); }
    o.push(`<circle cx="0" cy="0" r="${R}" fill="url(#${id}_vg)"/></g><circle cx="0" cy="0" r="${R.toFixed(3)}" fill="none" stroke="#2a2d31" stroke-width="2" ${NS}/>`);
    A.centre = [0, 0]; A.pole = W.proj([0, 0, -12]); A.R = R;
    for (let h = 1; h <= 12; h++) { const m = G.enfaceMap(st.surgeon ?? 12)([clockDir(h)[0], clockDir(h)[1], 0]); A['clock' + h] = [W.inv * m[0] * (R + 1.6), W.inv * m[1] * (R + 1.6)]; }
    return { svg: o.join(''), A, map: W, Gm };
  }

  // ---------------------------------------------------------------- external microscope view: globe/'s en-face view with the trocars (and a dilated pupil)
  function ext(opt) {
    const Gm = geom(opt.st), st = Gm.st, id = opt.id || 'ex', sur = st.surgeon ?? 12, base = G.enface({ st: {}, id, surgeon: sur }), M = G.enfaceMap(sur), o = [base.svg], A = Object.assign({}, base.A);
    const pts = []; for (let k = 0; k <= 72; k++) { const a = 2 * Math.PI * k / 72; pts.push(M([N.pupil * Math.sin(a), N.pupil * Math.cos(a), 0])); }
    o.push(`<path d="M${pts.map(F).join('L')}Z" fill="#8c2f17" stroke="#2e1a0f" stroke-width="1.2" ${NS}/>`);
    for (const t of troc(Gm)) { if (t.out >= 1) { const q = M(t.entry); A['troc_' + t.id] = q;   // the closed wound; with t.cj the opening seen from above is the conjunctival one
        const v = t.cjC ? M(t.cjC) : q; o.push(`<circle cx="${v[0].toFixed(3)}" cy="${v[1].toFixed(3)}" r="0.3" fill="#c9a49c"/>`); if (t.cjC) A['cj_' + t.id] = v; continue; }
      const q = M(t.entry), top = M(t.hubTop); A['troc_' + t.id] = q;
      if (t.inf) { const out = M(add(t.entry, mul(N3(t.h, t.s), 1.5))), far = M(P3(t.h, t.s + 9, -3)); o.push(`<path d="M${F(top)}Q${F(out)} ${F(far)}" fill="none" stroke="#9ec5e8" stroke-width="5" stroke-linecap="round" ${NS}/>`); }
      o.push(`<circle cx="${top[0].toFixed(3)}" cy="${top[1].toFixed(3)}" r="${N.hub / 2}" fill="${C.hub}" stroke="${C.hubS}" stroke-width="1" ${NS}/><circle cx="${top[0].toFixed(3)}" cy="${top[1].toFixed(3)}" r="0.22" fill="#1d2a3a"/>`); }
    if (Gm.dep) { const dp = Gm.dep, a = M(P3(dp.h, dp.s, -0.8)), b = M(P3(dp.h, dp.s + 8, -5)); o.push(`<path d="M${F(a)}L${F(b)}" stroke="${C.dep}" stroke-width="7" stroke-linecap="round" ${NS}/>`); A.dep = a; }
    return { svg: o.join(''), A, M, Gm };
  }

  // ---------------------------------------------------------------- head position: eye section with gravity straight down, and a head icon (示意)
  // The section is the meridional plane through the tear's clock hour (12 without a tear), seen like a head profile facing right when sitting
  // (right = anterior, up = that clock hour); for any head position the same picture is rotated by rot° so that gravity's component in the
  // plane points straight down. The fluid surfaces (perpendicular to gravity) are then horizontal lines.
  function headPlane(st) {
    const Gm = geom(st), g = Gm.g, h = Gm.tear ? Gm.tear.h : 12, [cx, cy] = clockDir(h), e1 = [0, 0, 1], e2 = [cx, cy, 0];
    const gx = dot(g, e1), gy = -dot(g, e2), rot = Math.atan2(gx, gy), c = Math.cos(rot), sn = Math.sin(rot);   // gravity on the unrotated screen = (gx, gy)
    // rotate the screen by −rot: screen x' = x cos rot − y sin rot … expressed as the 3D directions of screen right (U) and screen down (V)
    const Xs = e1, Ys = mul(e2, -1), U = unit(add(mul(Xs, c), mul(Ys, -sn))), V = unit(add(mul(Xs, sn), mul(Ys, c)));
    return { O: [0, 0, 0], U, V, kind: 'meridian', h, rotDeg: rot / D2R, inPlane: Math.hypot(gx, gy) };
  }
  function head(opt) {
    const st = S(opt.st), pl = headPlane(st), win = opt.win || { x: -13.5, y: -13.5, w: 27, h: 27 }, sec = section({ st, plane: pl, win, step: opt.step || 0.06, noTissue: opt.noTissue, id: opt.id });
    const hd = Object.assign({ pose: 'supine', tilt: 0 }, st.head || {}), o = [sec.svg], A = sec.A, ax = win.x + win.w - 2.2, ay = win.y + 1.5;
    o.push(`<path d="M${ax} ${ay}L${ax} ${ay + 4.5}" stroke="#2b5a8a" stroke-width="3" ${NS}/><path d="M${ax - 0.9} ${ay + 3.6}L${ax} ${ay + 5.2}L${ax + 0.9} ${ay + 3.6}Z" fill="#2b5a8a"/>`);
    A.gArrow = [ax, ay + 2.5];
    return { svg: o.join(''), A, plane: pl, pose: hd, Gm: sec.Gm };
  }
  // head icon in a unit box (示意, not to scale): profile facing right when sitting, rotated with the eye section; a front view for a sideways tilt
  function headIcon(st, x, y, k) {
    const hd = Object.assign({ pose: 'supine', tilt: 0 }, (st || {}).head || {}), pl = headPlane(S(st));
    const prof = 'M0.50 0.06C0.74 0.06 0.86 0.22 0.86 0.42L0.94 0.55L0.87 0.58L0.88 0.70C0.88 0.76 0.83 0.78 0.78 0.78L0.74 0.90L0.44 0.94C0.30 0.94 0.18 0.80 0.15 0.62C0.10 0.40 0.20 0.06 0.50 0.06Z';
    const face = 'M0.5 0.05C0.78 0.05 0.88 0.30 0.86 0.52C0.84 0.78 0.66 0.95 0.5 0.95C0.34 0.95 0.16 0.78 0.14 0.52C0.12 0.30 0.22 0.05 0.5 0.05Z';
    if (hd.pose === 'sit' && hd.tilt) return `<g transform="translate(${x} ${y}) scale(${k}) rotate(${-hd.tilt} 0.5 0.5)"><path d="${face}" fill="#f1dccb" stroke="#8a6a55" stroke-width="0.02"/><ellipse cx="0.66" cy="0.45" rx="0.07" ry="0.04" fill="#2b3a4a"/><ellipse cx="0.34" cy="0.45" rx="0.07" ry="0.04" fill="#9aa5b1"/></g>`;
    return `<g transform="translate(${x} ${y}) scale(${k}) rotate(${pl.rotDeg.toFixed(2)} 0.5 0.5)"><path d="${prof}" fill="#f1dccb" stroke="#8a6a55" stroke-width="0.02"/><ellipse cx="0.74" cy="0.44" rx="0.05" ry="0.035" fill="#2b3a4a"/></g>`;
  }

  // ---------------------------------------------------------------- orientation texts (畫面方位)
  const orient = {
    section: (h, eye) => { const ts = eye === 'OS' ? 1 : -1, hl = ((h + 5) % 12) + 1, U = [clockDir(h)[0], clockDir(h)[1], 0], look = cross(U, [0, 0, -1]), hv = clockOf(-look[0], -look[1]);
      return { right: h, left: hl, from: hv, text: `${eye === 'OS' ? '左眼 OS' : '右眼 OD'}　上＝前　右＝${clockName(h)}（${anat(h, eye).zh}）　從 ${clockName(hv)}那側看` }; },
    chart: eye => `${eye === 'OS' ? '左眼 OS' : '右眼 OD'}　檢查者畫法：12 點在上、${eye === 'OS' ? '3 點 temporal 在右' : '9 點 temporal 在左'}`,
    wide: (eye, inverter = true, surgeon = 12) => { const M = G.enfaceMap(surgeon), inv = inverter === false ? -1 : 1, side = h => { const m = M([clockDir(h)[0], clockDir(h)[1], 0]); return [inv * m[0], inv * m[1]]; };
      const tH = eye === 'OS' ? 3 : 9, t = side(tH), b = [12, 3, 6, 9].find(h => side(h)[1] > 0.9);
      return `${eye === 'OS' ? '左眼 OS' : '右眼 OD'}　術者坐 ${surgeon} 點　inverter ${inverter === false ? '關（倒像）' : '開'}：下＝${b} 點　temporal 在${t[0] > 0 ? '右' : '左'}`; },
    head: st => { const hd = Object.assign({ pose: 'supine', tilt: 0 }, (st || {}).head || {}); return { supine: '仰躺 supine', sit: '坐正 sitting', facedown: '臉朝下 face-down' }[hd.pose] + (hd.tilt ? `，頭往${hd.tilt > 0 ? '左' : '右'}肩倒 ${Math.abs(hd.tilt)}°` : '') + '　畫面下＝重力方向'; },
  };

  // ---------------------------------------------------------------- the case and its phases (presets for samples and videos)
  const CASE = { eye: 'OS', rd: { amt: 1 }, tear: { h: 11 }, pvd: 1 };
  const PRESET = {
    normal: { eye: 'OS' },
    rrd: Object.assign({}, CASE),
    setup: Object.assign({}, CASE, { troc: true }),
    core: Object.assign({}, CASE, { troc: true, ta: 1, vit: { cut: 0.6 }, inst: [{ kind: 'vitrector', port: 'sn', tip: [0.5, 1.5, -3] }, { kind: 'light', port: 'st', tip: [1.5, 0.5, -4] }] }),
    depress: Object.assign({}, CASE, { troc: true, vit: { cut: 1, shave: 0.5 }, dep: { h: 11, s: 9.3, depth: 1.6 }, look: { h: 11, deg: 32 }, inst: [{ kind: 'vitrector', port: 'sn', tip: { h: 11, s: 9.6, e: 1.0 } }, { kind: 'light', port: 'st', tip: [0.5, 2.5, -2.5] }] }),
    pfcl: Object.assign({}, CASE, { troc: true, vit: { cut: 1, shave: 1 }, pfcl: 0.45 }),
    air: Object.assign({}, CASE, { rd: { amt: 0 }, troc: true, vit: { cut: 1, shave: 1 }, gas: 0.6 }),
    laser: Object.assign({}, CASE, { rd: { amt: 0 }, troc: true, vit: { cut: 1, shave: 1 }, gas: 1, laser: 1 }),
    sitGas: Object.assign({}, CASE, { rd: { amt: 0 }, vit: { cut: 1, shave: 1 }, gas: 0.5, laser: 1, head: { pose: 'sit' } }),
  };

  // ---------------------------------------------------------------- helpers for checks and videos
  // how much of the cavity must be gas for the bubble to cover the whole tear in a head position (flat interface; 推算)
  function coverFraction(st, extra = 0) {
    const Gm = geom(Object.assign({}, st, { rd: { amt: 0 } })), T = Gm.tear; if (!T) return null; const g = Gm.g;
    let low = 1e9; for (const q of uOutline(T.w + 2 * extra, T.L + extra).map(([u, c]) => [u - (extra ? extra / 2 : 0), c])) { const p = onRetina(Gm, T.fr0, q[0], q[1], 1, Gm.ret0).p; low = Math.min(low, -dot(p, g)); }
    return fracAbove(g, low);
  }
  const keyPoints = () => ({ apexZ: PZ[0], poleZ: PZ[PN], rpePole: -K, K, VZ, K_W, lens: LENS, iris: IRIS, S_EQ, S_MID, S_POLE, PLICATA_END });

  return { N, C, G, K, LENS, IRIS, HYF, CASE_RD, CASE, PRESET, DISC, P3, N3, surfAt, wallOf, phiOfS, sOfPhi, Tp, chorAt, rtAt, oraAt, vbAntAt, vbPostAt, cilTh, anat, clockName,
    chartHS, hsChart, chart3, rpeAt, discQ, discOutline, geom, gravity, levels, fracAbove, voxels, cavity0, troc, trocarsFor, instGeom, instTip, makeCtx, section, fundus, wide, wideMap, ext, head, headPlane, headIcon,
    orient, laserSpots, coverFraction, uOutline, sdU, flapPt, onRetina, tanPt, keyPoints, segDist, PLICATA_END, S_EQ, S_MID, S_POLE };
})();
if (typeof module !== 'undefined') module.exports = POSTERIOR;
