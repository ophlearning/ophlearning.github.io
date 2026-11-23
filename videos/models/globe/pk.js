// ============================================================================
// Penetrating keratoplasty (PK) on the shared globe — optional states for the PK videos (videos/src/pk-tectonic-descemetocele/, pk-failed-dmek/).
// Units: mm. Every number is in CARD.md (PK) with its source, or marked 示意 / [待核對出處] there.
// Nothing here changes GLOBE (or CATARACT / SFIX): the other videos never load this file, so their drawings stay byte-identical.
// Load after globe.js; in node: require('./pk.js')(GLOBE).
// Both cases are LEFT eyes (OS). Clock hours are the examiner's (3 o'clock = the patient's left = OS temporal); the model's anatomy has no
// nasal–temporal difference, so st.pk.eye only names the picture (orient). Surgeon at 12: 12 o'clock at the bottom, 3 o'clock (temporal) on the left.
// Radii r are measured from the optical axis in projection (what a vertical trephine cuts and what the microscope shows); "s" is GLOBE's distance
// from the visible limbus along the outer surface, "d" the depth below it.
// Views (the same 3D eye):
//   section(opt)  meridional section through clock h (default 6: screen right = 6 o'clock, left = 12 o'clock, anterior up, as CATARACT's 12–6 view);
//                 h 9 = the 3–9 section seen from 12 (right = 9, as in the microscope); h 7 = through the 7 o'clock LI.
//   enface(opt)   microscope view, surgeon at 12 by default.
// The cornea (host, old DALK graft, descemetocele, DMEK graft, trephine groove, donor, sutures) lives in a "material" frame that a soft eye lets sag
// (示意); the lens–iris diaphragm moves with ac / bulge; the hyphema is a level surface in the anterior chamber, perpendicular to gravity.
// ============================================================================
function PK_MAKE(G) {
  const { D2R, NS, lerp, clamp, ss, add, sub, dot, len, unit } = G;
  const F = p => p[0].toFixed(4) + ' ' + p[1].toFixed(4);
  const H2R = 30 * D2R, N = G.N;
  const wrapH = h => ((h % 12) + 12) % 12;
  const dH = (a, b) => ((a - b) % 12 + 18) % 12 - 6;              // signed clock-hour difference in [−6, 6)
  const cd = h => G.clockDir(h);
  const RHO_L = G.surfAt(0).rho, APEX_Z = G.surfAt(G.S_APEX).z;
  const sOfR = r => { let a = G.S_APEX, b = 4; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; G.surfAt(m).rho < r ? a = m : b = m; } return (a + b) / 2; };   // s where the outer surface is r from the axis

  // ---------------------------------------------------------------- numbers (CARD.md PK has the source or 示意 of each)
  const PN = {
    tre: { d: 7.5, kerf: 0.08, enterW: 1.0 },   // recipient trephine 7.5 mm (videos' default; 依主刀、待刀後補); kerf and the blade's full-thickness entry arc 示意
    over: 0.25,                                  // donor oversize 0.25 mm (Koo 2019, PMID 31220145: the 0.25 mm oversize group ended more myopic)
    lift: 1.2,                                   // 示意: the free donor held this far above its seat
    sut: { n: 16, len: 2.0, dep: 0.9 },          // 示意 / [待核對出處] (lit-notes.md): interrupted sutures, length along the surface across the junction, depth fraction
    knot: { r: 0.07, bury: 0.92 },               // 示意: knot radius as drawn; how far along the host bite a buried knot goes
    old: { d: 7.0 },                             // 示意: the old DALK graft's diameter (unknown, 待刀後補); chosen inside the 7.5 trephine
    dcele: { h: 6, r: 2.0, rad: 0.9, thin: 0.06, bulge: 0.15 },   // 示意: inferior paracentral descemetocele: centre, radius, remaining layer, forward bulge
    dmek: { d: 8.0, h: 6, detach: 0.4, gap: 0.35, t: 0.03 },      // 示意: DMEK graft diameter, detached sector (centre hour, fraction of the circle), max gap; drawn 0.03 thick
    sag: 0.25, indent: 0.45,                     // 示意: soft eye — the cornea sinks this much at the centre (and more while the trephine presses)
    acMax: 1.5,                                  // 示意: forward shift of the lens–iris diaphragm at ac 0
    pupil: N.pupil,                              // GLOBE's 1.5 mm pupil radius (a constricted pupil; 示意)
    iol: { optic: 6.0, tc: 0.7, te: 0.25, z: 8.6, hapR: 5.0, hapH: [1.5, 7.5], sweep: 100 },   // 示意 (PCIOL type unknown): in the bag, optic centre z, haptics
    bag: { ccc: 2.6, eq: 4.7 },                  // 示意: rhexis radius and bag equator radius of the pseudophakic capsule
    pas: { s1: 0.6, hw: 0.08, lap: 0.02 },       // 示意: peripheral anterior synechiae — contact starts at the trabecular meshwork (s 0.6) and runs st.pk.pas mm forward;
                                                 //   the iris is laid 0.02 mm into the corneal back (hidden under it) so no sliver of chamber is left at the contact
    li: { h: 7, r: 4.3, d: 0.3 },                // LI at 7 o'clock (case); radius and size 示意
    hy: { h: 0.8 },                              // 示意: blood level above the lowest point of the chamber
    nvN: 44,                                     // 示意: number of peripheral vessels drawn (360°)
  };
  const irisTh = t => 0.16 + 0.42 * Math.sin(Math.PI * Math.min(1, t * 1.35)) * (t < 0.74 ? 1 : 1 - ss(0.74, 1, t) * 0.55);   // = GLOBE's iris thickness (示意)
  const optHalf = rho => { const I = PN.iol, Ro = I.optic / 2; return I.te / 2 + (I.tc - I.te) / 2 * Math.max(0, 1 - (rho / Ro) ** 2); };

  // ---------------------------------------------------------------- state
  // st.pk = { eye, kd, soft, press, edema, haze, old, nv, dcele, dmek, lens, ac, bombe, pas, pasH, li, hy, tre, open, bulge, donor, sut, leak, fl, inst }
  //   eye 'OS' (names only); kd corneal diameter (default: the model's 11.88; case A 10) — moves the clear-cornea edge, not the outer surface (示意);
  //   soft 0→1 low IOP (the cornea sags, 示意), press 0→1 the trephine pressing on a soft eye; edema mm added to the back of the host cornea; haze 0→1;
  //   old { d } the old DALK graft and its junction; nv 0→1 360° peripheral vessels from the limbus to the old junction;
  //   dcele { h, r, rad, thin, bulge }; dmek { d, h, detach, gap } a poorly attached DMEK graft; lens 'phakic' | 'iol' (PCIOL in the bag);
  //   ac 0→1 chamber depth (1 normal); bombe mm the mid-iris bows forward (pupillary block); pas mm of peripheral iris on the cornea (pasH [h0, h1] limits
  //   it to a clock range); li { h, r, d } laser iridotomy; hy { h, pos: 'supine' | 'upright' } hyphema level;
  //   tre { d, depth 0→1, enter: { h, w } full thickness at one point, scis 0→360° scissors from there, dir ±1 (+1 = clockwise) }; ovd 0→1 viscoelastic in the chamber;
  //   open 0→1 the host button lifted off (1 = gone: open sky); bulge mm the lens–iris diaphragm domes forward (open-sky danger, 示意);
  //   donor { d, place 0→1, endoUp } (d default tre.d + 0.25); sut { n, len, dep, placed 0→n in the order 12, 6, 3, 9, then the rest; tie, bury, buryTo };
  //   leak { h, amt } fluorescein stream from the junction; fl 0→1 fluorescein painted; inst [{ kind: trephine | scissors | forceps | holder | cannula, … }]
  const DEF = { eye: 'OS', kd: null, soft: 0, press: 0, edema: 0, haze: 0, old: null, nv: 0, dcele: null, dmek: null, lens: 'phakic', ac: 1, bombe: 0, pas: 0, pasH: null, li: null, hy: null,
    tre: null, ovd: 0, open: 0, bulge: 0, donor: null, sut: null, leak: null, fl: 0, inst: [] };
  const norm = st => { st = st || {}; const c = Object.assign({}, DEF, st.pk || {});
    c.tre = c.tre ? Object.assign({ d: PN.tre.d, depth: 0, enter: null, scis: 0, dir: 1 }, c.tre) : null;
    if (c.tre && c.tre.enter) c.tre.enter = Object.assign({ h: 6, w: PN.tre.enterW }, c.tre.enter);
    c.old = c.old ? Object.assign({}, PN.old, c.old) : null;
    c.dcele = c.dcele ? Object.assign({}, PN.dcele, c.dcele) : null;
    if (c.dcele) { const u = cd(c.dcele.h); c.dcele.cx = c.dcele.r * u[0]; c.dcele.cy = c.dcele.r * u[1]; }
    c.dmek = c.dmek ? Object.assign({}, PN.dmek, c.dmek) : null;
    c.li = c.li ? Object.assign({}, PN.li, c.li) : null;
    c.hy = c.hy ? Object.assign({ h: PN.hy.h, pos: 'supine' }, c.hy) : null;
    const rT = (c.tre ? c.tre.d : PN.tre.d) / 2;
    c.donor = c.donor ? Object.assign({ d: 2 * rT + PN.over, place: 1, endoUp: false }, c.donor) : null;
    c.sut = c.sut ? Object.assign({ n: PN.sut.n, len: PN.sut.len, dep: PN.sut.dep, placed: 0, tie: 1, bury: 0, buryTo: 'host' }, c.sut) : null;
    c.leak = c.leak ? Object.assign({ h: 10.5, amt: 1 }, c.leak) : null;
    c.rT = rT; c.rJ = rT + PN.tre.kerf / 2;                       // trephine radius; junction (host opening) radius
    c.rK = c.kd ? c.kd / 2 : RHO_L; c.sK = c.kd ? sOfR(c.rK) : 0;   // clear-cornea edge radius and its s
    c.inst = c.inst || [];
    return c; };

  // ---------------------------------------------------------------- cornea in the material frame
  const Th = (c, s) => G.T(s) + (c.edema || 0) * (1 - ss(c.sK - 1.0, c.sK + 0.3, s));   // host thickness: oedema adds to the back, fading over the limbus
  // a soft eye (示意): the cornea sinks by a · (1 − (ρ/ρL)²)² (a grows while the trephine presses); the displacement is vertical and depends on ρ only,
  // so a drawn point p comes from the material point p + [0, 0, dzC(ρ)] exactly
  const dzC = (c, rho) => { const a = (c.soft || 0) * (PN.sag + PN.indent * (c.press || 0)); if (!(a > 0) || rho >= RHO_L) return 0; const u = 1 - (rho / RHO_L) ** 2; return a * u * u; };
  const toMat = (c, p) => { const r = Math.hypot(p[0], p[1]); return [p[0], p[1], p[2] + dzC(c, r)]; };
  const toDrawn = (c, q) => { const r = Math.hypot(q[0], q[1]); return [q[0], q[1], q[2] - dzC(c, r)]; };
  // host cornea bounds at a material point: [top, bottom, thickness] in depth below the outer surface; the descemetocele digs a crater from the front
  // (only `thin` left) and bows the back forward by `bulge`
  function hostBounds(c, W, xq, yq) {
    const T = Th(c, W.s); let top = 0, bot = T;
    const D = c.dcele;
    if (D) { const dl = Math.hypot(xq - D.cx, yq - D.cy); if (dl < D.rad) { const fb = (1 - (dl / D.rad) ** 2) ** 2, ft = 1 - ss(0.35 * D.rad, D.rad, dl); bot = T - D.bulge * fb; top = Math.max(0, bot - lerp(T, D.thin, ft)); } }
    return [top, bot, T];
  }
  // trephine: depth cut at clock h (fraction of the local thickness; 1.01 = through)
  function cutAt(c, h) { const t = c.tre; if (!t) return 0; if ((t.scis || 0) >= 360) return 1.01;
    if (t.enter) { const hw = t.enter.w / 2 / (c.rT * H2R); if (Math.abs(dH(h, t.enter.h)) <= hw) return 1.01;
      const a = wrapH((t.dir >= 0 ? 1 : -1) * dH(h, t.enter.h)) * 30; if (t.scis > 0 && a <= t.scis + 1e-9) return 1.01; }
    return clamp(t.depth || 0, 0, 1); }
  // the button lifted off (示意 motion): up 1.6 mm and tilted 25° about the 3–9 axis through the corneal apex
  const BTN = { up: 1.6, tilt: 25 };
  const btnInv = (c, p) => { const o = clamp(c.open, 0, 1), th = -BTN.tilt * o * D2R, z0 = APEX_Z + BTN.up * o, y = p[1], z = p[2] - z0;
    return [p[0], y * Math.cos(th) - z * Math.sin(th), y * Math.sin(th) + z * Math.cos(th) + APEX_Z]; };
  const btnFwd = (c, q) => { const o = clamp(c.open, 0, 1), th = BTN.tilt * o * D2R, y = q[1], z = q[2] - APEX_Z;
    return [q[0], y * Math.cos(th) - z * Math.sin(th), y * Math.sin(th) + z * Math.cos(th) + APEX_Z + BTN.up * o]; };
  // the donor: native corneal shape (GLOBE's surface and thickness, no oedema), cut vertically; free above the seat at its true diameter, seated
  // compressed to the host opening (the oversize is not drawn as a steeper graft; 示意)
  const donorK = c => lerp(1, c.rJ / (c.donor.d / 2), clamp(c.donor.place, 0, 1));
  const donorOff = c => (1 - clamp(c.donor.place, 0, 1)) * PN.lift;
  const DZC = APEX_Z - N.cct / 2;                                   // mid-thickness of the cap on the axis (the flip plane for endoUp)
  const donorMat = (c, q) => { let z = q[2] - donorOff(c); if (c.donor.endoUp && c.donor.place < 1) z = 2 * DZC - z; return [q[0], q[1], z]; };
  const donorOut = (c, qd) => { let z = qd[2]; if (c.donor.endoUp && c.donor.place < 1) z = 2 * DZC - z; return [qd[0], qd[1], z + donorOff(c)]; };   // donor material → sag frame
  // DMEK graft gap behind the host's back surface (示意): a detached sector centred at h (detach = fraction of the circle), lifting toward its edge
  const dmekGap = (c, h, rho) => { const D = c.dmek; if (!D) return 0; const half = Math.max(0.01, D.detach * 6), wh = 1 - ss(half * 0.6, half, Math.abs(dH(h, D.h))), r0 = D.d / 2;
    return D.gap * wh * ss(r0 - 2.6, r0, rho); };

  // ---------------------------------------------------------------- the lens–iris diaphragm (drawn frame; it does not sag)
  function diaph(c) {
    const I0 = G.inner({}), Zs = (1 - clamp(c.ac, 0, 1)) * PN.acMax + (c.bulge || 0), pr = PN.pupil, root = I0.root;   // root [z, rho] stays
    if (c.lens === 'iol') { const zc = PN.iol.z + Zs; return { Zs, root, pr, iol: { zc, Ro: PN.iol.optic / 2 }, lens: null, pm: [zc + optHalf(pr) + 0.12, pr] }; }   // margin 0.12 above, as GLOBE's on the lens
    const C1 = I0.lensC1 + Zs, C2 = I0.lensC2 + Zs; return { Zs, root, pr, lens: { C1, C2 }, iol: null, pm: [C1 + Math.sqrt(N.lensRa ** 2 - pr * pr) + 0.12, pr] };
  }
  // posterior corneal surface (host, drawn frame) as [z, rho] at foot s, and an offset o beyond it into the eye
  const backPt = (c, s, o = 0) => { const f = G.surfAt(s), t = Th(c, s) + o, rho = f.rho - f.nr * t; return [f.z - f.nz * t - dzC(c, rho), rho]; };
  // iris centreline [z, rho] from the pupil margin (index 0) to the root, with half-thickness per point. Without PAS = GLOBE's curve (bombe raises it);
  // with PAS the peripheral iris lies on the corneal back surface from the trabecular meshwork (s1) forward by `pas` mm
  // backAt(rho) = z of the corneal back: the iris may lie on it (PAS) but never goes through it — a bowed or bulged iris is pressed against the cornea there
  function irisGeom(c, D, pas, backAt) {
    const a = D.pm, b = D.root, bo = c.bombe || 0, L = [], hw = [], lap = PN.pas.lap;
    const fit = () => { for (let i = 0; i < L.length; i++) { const r = L[i][1], sl = (backAt(r + 0.02) - backAt(r - 0.02)) / 0.04, zm = backAt(r) - (hw[i] - lap) * Math.sqrt(1 + sl * sl); if (L[i][0] > zm) L[i][0] = zm; } return { L, hw }; };   // offset along the back's normal
    if (!(pas > 0)) { const ctl = [lerp(a[0], b[0], 0.45) + 0.28 + 2 * bo, lerp(a[1], b[1], 0.5)];
      for (let k = 0; k <= 48; k++) { const t = k / 48, u = 1 - t; L.push([u * u * a[0] + 2 * u * t * ctl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * b[1]]); hw.push(irisTh(t) / 2); }
      return fit(); }
    const s1 = PN.pas.s1, s2 = s1 - pas, o0 = PN.pas.hw - PN.pas.lap, E = backPt(c, s2, o0), ctl = [lerp(a[0], E[0], 0.45) + 0.28 + 2 * bo, lerp(a[1], E[1], 0.5)];
    for (let k = 0; k <= 40; k++) { const t = k / 40, u = 1 - t; L.push([u * u * a[0] + 2 * u * t * ctl[0] + t * t * E[0], u * u * a[1] + 2 * u * t * ctl[1] + t * t * E[1]]);
      hw.push(lerp(irisTh(t * 0.74) / 2, PN.pas.hw, ss(0.6, 1, t))); }
    for (let k = 1; k <= 16; k++) { L.push(backPt(c, lerp(s2, s1, k / 16), o0)); hw.push(PN.pas.hw); }
    const q0 = L[L.length - 1]; for (let k = 1; k <= 6; k++) { L.push([lerp(q0[0], b[0], k / 6), lerp(q0[1], b[1], k / 6)]); hw.push(PN.pas.hw); }
    return fit();
  }
  function distPoly(q, pts) { let bd = 1e18, bt = 0; const n = pts.length - 1;
    for (let i = 1; i <= n; i++) { const ax = pts[i - 1][0], ay = pts[i - 1][1], ex = pts[i][0] - ax, ey = pts[i][1] - ay, L2 = ex * ex + ey * ey || 1;
      let t = ((q[0] - ax) * ex + (q[1] - ay) * ey) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dx = q[0] - ax - ex * t, dy = q[1] - ay - ey * t, d = dx * dx + dy * dy; if (d < bd) { bd = d; bt = i - 1 + t; } }
    return [Math.sqrt(bd), bt]; }
  const irisDist = (Gm, z, rho) => { const [d, t] = distPoly([z, rho], Gm.L), i = Math.min(Gm.hw.length - 2, Math.floor(t)); return d - lerp(Gm.hw[i], Gm.hw[i + 1], t - i); };
  const pasW = (c, h) => { if (!(c.pas > 0)) return 0; if (!c.pasH) return 1; const [h0, h1] = c.pasH, span = wrapH(h1 - h0), x = wrapH(h - h0);
    const inside = x <= span ? Math.min(x, span - x) : -Math.min(x - span, 12 - x); return ss(-0.25, 0.25, inside); };

  // ---------------------------------------------------------------- per-state context: diaphragm, iris, tables, hyphema level, sutures (cached)
  const CTX = new Map();
  function ctx(c) {
    const key = JSON.stringify([c.kd, c.soft, c.press, c.edema, c.lens, c.ac, c.bombe, c.pas, c.pasH, c.bulge, c.hy, c.dcele, c.open, c.donor, c.tre && c.tre.d]);
    if (CTX.has(key)) return CTX.get(key);
    const D = diaph(c), NR = 700, back = new Float64Array(NR);
    { let s = G.S_APEX; for (let j = 0; j < NR; j++) { const r = j * 0.01; while (s < 3 && backPt(c, s)[1] < r) s += 0.004; back[j] = backPt(c, s)[0]; } }
    const backAt = r => tab(back, r), Gn = irisGeom(c, D, 0, backAt), Gp = c.pas > 0 ? irisGeom(c, D, c.pas, backAt) : null;
    const bb = Gm => { let z0 = 1e9, z1 = -1e9, r0 = 1e9, r1 = -1e9; Gm.L.forEach((p, i) => { z0 = Math.min(z0, p[0] - Gm.hw[i]); z1 = Math.max(z1, p[0] + Gm.hw[i]); r0 = Math.min(r0, p[1]); r1 = Math.max(r1, p[1]); }); return [z0 - 0.05, z1 + 0.05, r0 - 0.4, r1 + 0.3]; };
    const X = { D, Gn, Gp, bbn: bb(Gn), bbp: Gp ? bb(Gp) : null, back };
    // tables over rho (step 0.01): floor = top of the diaphragm (lens / IOL front in the pupil, iris front, root height in the angle); back = corneal back
    const fl = g => { const F = new Float64Array(NR).fill(-1e9);
      for (let i = 1; i < g.L.length; i++) { const a = g.L[i - 1], b = g.L[i]; for (let k = 0; k <= 10; k++) { const z = lerp(a[0], b[0], k / 10) + lerp(g.hw[i - 1], g.hw[i], k / 10), r = lerp(a[1], b[1], k / 10), j = Math.round(r / 0.01); if (j >= 0 && j < NR) F[j] = Math.max(F[j], z); } }
      for (let j = 0; j < NR; j++) { const r = j * 0.01; if (r < D.pr) F[j] = lensFront(D, r); else if (r > D.root[1]) F[j] = D.root[0]; }
      for (let j = 1; j < NR; j++) if (F[j] < -1e8) F[j] = F[j - 1]; return F; };
    X.floorN = fl(Gn); X.floorP = Gp ? fl(Gp) : null;
    X.zRim = tab(X.back, c.rJ);                                       // height of the opening's back edge (open-sky fluid level)
    // the chamber ends where the diaphragm first meets the corneal back going out from the axis (a closed angle: PAS); beyond it there is no chamber
    const closeR = F => { for (let j = 0; j < NR; j++) if (X.back[j] - F[j] <= 0.03) return j * 0.01; return NR * 0.01; };
    X.acRN = closeR(X.floorN); X.acRP = X.floorP ? closeR(X.floorP) : null;
    // hyphema level (a surface perpendicular to gravity): supine → up = +Z (blood on the back of the chamber); upright → up = +Y (blood at 6 o'clock)
    if (c.hy) { const P = X.floorP && pasW(c, 6) > 0.5, floor = P ? X.floorP : X.floorN, aR = P ? X.acRP : X.acRN; let zmin = 1e9, rmax = 0;
      for (let j = 0; j < NR && j * 0.01 < aR; j++) { zmin = Math.min(zmin, floor[j]); rmax = j * 0.01; }
      X.hyUp = c.hy.pos === 'upright' ? [0, 1, 0] : [0, 0, 1]; X.hyLevel = (c.hy.pos === 'upright' ? -rmax : zmin) + c.hy.h; X.hyLow = c.hy.pos === 'upright' ? -rmax : zmin; }
    CTX.set(key, X); if (CTX.size > 40) CTX.delete(CTX.keys().next().value);
    return X;
  }
  const lensFront = (D, r) => D.iol ? D.iol.zc + optHalf(Math.min(r, D.iol.Ro)) : D.lens.C1 + Math.sqrt(Math.max(0, N.lensRa ** 2 - r * r));
  const tab = (T, r) => { const j = clamp(r / 0.01, 0, T.length - 1.001), i = Math.floor(j); return lerp(T[i], T[i + 1], j - i); };

  // ---------------------------------------------------------------- tissue values at a 3D (drawn) point: g < 0 inside
  const FD = G.makeField({});
  function fieldAt(c, X, p) {
    const o = {}, rp = Math.hypot(p[0], p[1]), h = G.clockOf(p[0], p[1]), q = toMat(c, p), rq = Math.hypot(q[0], q[1]);
    const W = G.wallOf(q[2], rq), [top, bot, T] = hostBounds(c, W, q[0], q[1]), sK = c.sK, sA = 0.15 * clamp(W.d / T, 0, 1);
    const g0 = Math.max(top - W.d, W.d - bot);
    o.cornea = Math.max(g0, W.s - (sK + sA)); o.limbus = Math.max(g0, sK + sA - W.s, W.s - (sK + 0.85)); o.sclera = Math.max(g0, sK + 0.85 - W.s);
    // trephine groove (vertical cylinder at rT) and, once the button is off, nothing of the host inside the opening
    if (c.tre) { const f = cutAt(c, h), gg = Math.max(Math.abs(rq - c.rT) - PN.tre.kerf / 2, f > 1 ? -1 : W.d - f * T); if (f > 0) o.cornea = Math.max(o.cornea, -gg); }
    if (c.open > 0) o.cornea = Math.max(o.cornea, c.rJ - rq);
    o.old = c.old ? Math.max(o.cornea, rq - c.old.d / 2, W.d - (bot - 0.03)) : 1;
    // the eye's inside: below the host back surface; inside the opening once the button is off: below the donor (seated) or the smooth host envelope
    const inOpen = c.open > 0 && rq < c.rJ, seated = c.donor && c.donor.place >= 1;
    let topI = bot; if (inOpen) topI = seated ? (() => { const Wd = G.wallOf(q[2], rq); return G.T(Wd.s); })() : T;
    o.interior = topI - W.d;
    // open sky with nothing in the opening: the chamber is open to the air; its fluid stands only up to the rim's back edge (it spills over there)
    if (inOpen && !seated) o.interior = Math.max(o.interior, p[2] - X.zRim);
    // DMEK graft behind the host (the part inside the opening goes with the button)
    o.dmek = 1; if (c.dmek && rq < c.dmek.d / 2 && !inOpen) { const gp = dmekGap(c, h, rq), m = bot + gp + PN.dmek.t / 2; o.dmek = Math.max(Math.abs(W.d - m) - PN.dmek.t / 2, rq - c.dmek.d / 2); }
    // the button on its way off
    o.button = 1; if (c.open > 0 && c.open < 1) { const pb = btnInv(c, q), rb = Math.hypot(pb[0], pb[1]), Wb = G.wallOf(pb[2], rb), hb = hostBounds(c, Wb, pb[0], pb[1]); o.button = Math.max(hb[0] - Wb.d, Wb.d - hb[1], rb - (c.rT - PN.tre.kerf / 2)); }
    // donor
    o.donor = 1; o.endo = 1;
    if (c.donor) { const qd = donorMat(c, q), Wd = G.wallOf(qd[2], Math.hypot(qd[0], qd[1])), Td = G.T(Wd.s), edge = c.donor.d / 2 * donorK(c), rr = Math.hypot(q[0], q[1]);
      o.donor = Math.max(-Wd.d, Wd.d - Td, rr - edge); o.endo = Math.max(Math.abs(Wd.d - (Td - 0.006)) - 0.006, rr - edge); }
    // uvea, conjunctiva (GLOBE's, from the undeformed wall; the conjunctival insertion follows a smaller cornea)
    const Wp = q === p || rq >= RHO_L ? W : G.wallOf(p[2], rp), Wf = { s: Wp.s, d: Wp.d, T: G.T(Wp.s), c: 1e3, gap: 0, rhoF: Wp.rhoF };
    o.ciliary = FD.g.ciliary(Wf); o.choroid = FD.g.choroid(Wf); o.retina = FD.g.retina(Wf);
    o.conj = FD.g.conj({ s: Wp.s - sK, d: Wp.d, T: Wf.T, c: 1e3, gap: 0, rhoF: Wp.rhoF });
    // lens / IOL
    const Dg = X.D;
    o.lens = Dg.lens ? Math.max(Math.hypot(p[2] - Dg.lens.C1, rp) - N.lensRa, Math.hypot(p[2] - Dg.lens.C2, rp) - N.lensRp, rp - N.lensD / 2) : 1;
    o.iol = Dg.iol ? Math.max(rp - Dg.iol.Ro, Math.abs(p[2] - Dg.iol.zc) - optHalf(rp)) : 1;
    // iris (PAS blended by clock hour; the LI is a vertical hole)
    const irisOf = (Gm, b) => (rp < b[2] || rp > b[3] || p[2] < b[0] || p[2] > b[1]) ? 1 : irisDist(Gm, p[2], rp);
    const w = pasW(c, h); o.iris = w <= 0 || !X.Gp ? irisOf(X.Gn, X.bbn) : w >= 1 ? irisOf(X.Gp, X.bbp) : lerp(irisOf(X.Gn, X.bbn), irisOf(X.Gp, X.bbp), w);
    if (c.li) { const u = cd(c.li.h); o.iris = Math.max(o.iris, -(Math.hypot(p[0] - c.li.r * u[0], p[1] - c.li.r * u[1]) - c.li.d / 2)); }
    // anterior chamber: inside the eye, above the diaphragm's top; hyphema: the part below the level (along gravity)
    const P = X.Gp && w > 0.5, floor = P ? X.floorP : X.floorN;
    o.ac = Math.max(o.interior, tab(floor, rp) - p[2], rp - (P ? X.acRP : X.acRN));
    o.hy = c.hy ? Math.max(o.ac, dot(p, X.hyUp) - X.hyLevel, -o.iris, -o.lens, -o.iol) : 1;
    o.q = q; o.W = W; o.bot = bot; o.top = top; o.T = T;
    return o;
  }
  const layersFn = st => { const c = norm(st), X = ctx(c); return p => fieldAt(c, X, p); };

  // ---------------------------------------------------------------- sutures: order 12 → 6 → 3 → 9, then the quadrants (opposite pairs, mid first)
  function sutOrder(n) {
    n = Math.max(4, Math.round(n / 4) * 4); const m = n / 4 - 1, step = 12 / n, card = [12, 6, 3, 9], out = card.map(h => ({ h, cardinal: true }));
    const offs = []; for (let j = 1; j <= m; j++) offs.push(j * step); offs.sort((a, b) => Math.abs(a - 1.5) - Math.abs(b - 1.5) || a - b);
    for (const o of offs) for (const q0 of [0, 6, 3, 9]) out.push({ h: wrapH(q0 + o) || 12, cardinal: false });
    return out.map((x, i) => Object.assign(x, { i }));
  }
  function suturePath(c, h) {
    const S = c.sut, sJ = sOfR(c.rJ), Td = G.T(sJ), D = S.dep * Math.min(Td, Th(c, sJ)), half = S.len / 2, track = [];
    for (let k = 0; k <= 40; k++) { const a = Math.PI * k / 40, x = -half * Math.cos(a), d = D * Math.sin(a); track.push(toDrawn(c, G.P3(h, sJ + x, d))); }   // donor (inner) → host
    const side = S.buryTo === 'donor' ? -1 : 1, b = clamp(S.bury || 0, 0, 1), kx = lerp(0, side * half * PN.knot.bury, b), kd = lerp(-0.04, D * 0.5, b);
    return { h, track, entry: track[0], exit: track[40], deep: track[20], knot: toDrawn(c, G.P3(h, sJ + kx, kd)), D, sJ, half };
  }
  function sutures(c) { if (!c.sut) return []; return sutOrder(c.sut.n).map(o => Object.assign(o, { pass: clamp(c.sut.placed - o.i, 0, 1) })).filter(o => o.pass > 0).map(o => Object.assign(o, suturePath(c, o.h))); }
  // fluorescein stream from a leak on the junction, running down the corneal surface (supine: radially outward) to past the limbus
  function leakOf(c) { if (!c.leak) return null; const L = c.leak, s0 = sOfR(c.rJ), s1 = sOfR(Math.min(RHO_L + 0.9, c.rK + 1.4)), pts = [];
    for (let k = 0; k <= 30; k++) pts.push(toDrawn(c, G.P3(L.h, lerp(s0, s1, k / 30), -0.02))); return { h: L.h, pts, start: pts[0] }; }
  // peripheral vessels (示意): from the clear-cornea edge in to the old junction (or 1 mm inside the edge), all round
  function nvOf(c) { if (!(c.nv > 0)) return []; const rIn = c.old ? c.old.d / 2 + 0.12 : c.rK - 1.0, out = [];
    for (let k = 0; k < PN.nvN; k++) { const h0 = 12 * k / PN.nvN + 0.12 * G.hash(k, 11), r0 = c.rK + 0.15, rEnd = lerp(r0, rIn, clamp(c.nv, 0, 1)), bend = (G.hash(k, 13) - 0.5) * 0.25, pts = [];
      for (let j = 0; j <= 16; j++) { const t = j / 16, r = lerp(r0, rEnd, t), hh = h0 + bend * Math.sin(Math.PI * t) + 0.02 * Math.sin(t * 7 + k); pts.push([r * cd(hh)[0], r * cd(hh)[1], 0]); }
      const jb = 6 + Math.floor(6 * G.hash(k, 14)), br = [pts[jb]], hb = h0 + bend * Math.sin(Math.PI * jb / 16), rb = Math.hypot(pts[jb][0], pts[jb][1]), sg = G.hash(k, 15) > 0.5 ? 1 : -1;
      for (let j = 1; j <= 5; j++) { const r = Math.max(rEnd, rb - j * 0.16), hh = hb + sg * j * 0.025; br.push([r * cd(hh)[0], r * cd(hh)[1], 0]); }
      out.push({ h: h0, r0, r1: rEnd, pts, br }); }
    return out; }
  // instruments
  function instOf(c, I) {
    const k = I.kind;
    if (k === 'trephine') { const r = (I.d ?? (c.tre ? c.tre.d : PN.tre.d)) / 2, dep = I.depth ?? (c.tre ? c.tre.depth : 0); return { kind: k, r, dep }; }
    if (k === 'scissors') { const h = I.h, u = cd(h), dir = (I.dir ?? (c.tre ? c.tre.dir : 1)) >= 0 ? 1 : -1, sR = sOfR(c.rJ);
      // curved corneal scissors (示意): the blades follow the cut circle behind the tip (the already-cut side), the lower one in the chamber under the host,
      // the upper one above it; the shanks run toward the surgeon (12 o'clock side)
      const back = h - dir * 3.2 / (c.rJ * H2R), low = toDrawn(c, G.P3(h, sR, Th(c, sR) + 0.12)), up = toDrawn(c, G.P3(h, sR, -0.12)), arcL = [], arcU = [];
      for (let j = 0; j <= 12; j++) { const hh = lerp(h, back, j / 12); arcL.push(toDrawn(c, G.P3(hh, sR, Th(c, sR) + 0.12))); arcU.push(toDrawn(c, G.P3(hh, sR, -0.12))); }
      const bU = arcU[12], shank = [bU, [bU[0] * 0.5, 9.5, bU[2] + 3]];
      return { kind: k, h, dir, tipLow: low, tipUp: up, backLow: arcL[12], backUp: bU, arcL, arcU, shank, u }; }
    if (k === 'forceps') { const s = sOfR(I.r ?? c.rJ + 0.3); return { kind: k, h: I.h, tip: toDrawn(c, G.P3(I.h, s, 0.05)), out: toDrawn(c, G.P3(I.h, s + 7, -3)) }; }
    if (k === 'cannula') { const sJ = sOfR(c.rJ), entry = toDrawn(c, G.P3(I.h, sJ, 0)), u = cd(I.h), X = ctx(c), r = c.rJ - (I.reach ?? 1.4), zt = (tab(X.back, r) + tab(X.floorN, r)) / 2;
      const tip = [r * u[0], r * u[1], zt], dir = unit(sub(entry, tip)); return { kind: k, h: I.h, tip, entry, out: add(entry, dir, 5) }; }
    if (k === 'holder') { const P = suturePath(c, I.h), n = Math.max(2, Math.round(40 * clamp(I.pass ?? 0.5, 0, 1))), tip = P.track[n], tail = P.track.slice(0, n + 1).reverse();
      const t0 = unit(sub(P.track[0], P.track[1])), arc = [P.track[0]]; let d = t0, q = P.track[0]; for (let s = 0; s < 1.4; s += 0.1) { d = unit(add(d, [0, 0, 0.06])); q = add(q, d, 0.1); arc.push(q); }
      return { kind: k, h: I.h, tip, needle: [...tail, ...arc.slice(1)], jaw: arc[arc.length - 1] }; }
    return null;
  }

  // ---------------------------------------------------------------- colours
  const C = Object.assign({}, G.C, { out: '#e4e9ed', haze: '#e8ecef', hazeS: '#cfd6dc', old: '#eef1f4', oldS: '#7e8d99', donor: '#e4f3fb', donorS: '#5d9bc4', endo: '#c7832a', dmek: '#2f8f8a', hy: '#9b1d22',
    iol: '#f6f1cf', iolS: '#a8963c', bag: '#9fb3c6', cut: '#3a4650', steel: '#9aa5b0', steelS: '#4e5964', nv: '#c4383f', fl: '#e2a814', leak: '#5fe36a', blade: '#b9c3cc' });
  const mixC = (a, b, k) => { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };

  // ---------------------------------------------------------------- section
  const SEC = new Map();
  const LAYERS = ['interior', 'ac', 'hy', 'retina', 'choroid', 'ciliary', 'lens', 'iol', 'iris', 'sclera', 'limbus', 'cornea', 'old', 'button', 'donor', 'conj'];
  function sectionTissue(c, pl, win, step) {
    const X = ctx(c), nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(win.h / step) + 1, n = nx * ny, V = {};
    LAYERS.forEach(k => V[k] = new Float64Array(n));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, o = fieldAt(c, X, G.onPlane(pl, win.x + i * step, win.y + j * step)); for (const nm of LAYERS) V[nm][k] = o[nm]; }
    const pieces = {};
    const layer = (name, fill, stroke, sw = 0.9, extra = '') => { const v = V[name]; let any = false; for (let k = 0; k < n; k++) if (v[k] < 0) { any = true; break; } if (!any) { pieces[name] = 0; return ''; }
      const loops = G.contour(v, nx, ny, win.x, win.y, step); pieces[name] = loops.length;
      return `<path d="${loops.map(l => 'M' + l.map(F).join('L') + 'Z').join('')}" fill="${fill}" fill-rule="evenodd" ${stroke ? `stroke="${stroke}" stroke-width="${sw}" ${NS}` : ''} ${extra}/>`; };
    const corn = mixC(C.cornea, C.hazeS, clamp(clamp(c.haze, 0, 1) * 0.85 + clamp((c.edema || 0) / 0.4, 0, 1) * 0.3, 0, 0.9));
    const o = [`<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="${C.out}"/>`];
    o.push(layer('interior', C.vit), layer('ac', c.ovd > 0 ? mixC(C.aq, C.ovd, clamp(c.ovd, 0, 1)) : C.aq), layer('hy', C.hy, '#6e1216', 0.6, 'opacity="0.9"'), layer('retina', C.ret), layer('choroid', C.chor), layer('ciliary', C.cil, C.cilS, 0.6));
    o.push(layer('lens', C.lens, C.lensS), layer('iol', C.iol, C.iolS), layer('iris', C.iris, C.irisS, 0.6));
    o.push(layer('sclera', C.sclera, C.scleraS), layer('limbus', C.limb, null), layer('cornea', corn, C.corneaS), layer('old', mixC(C.old, '#c3cbd2', clamp(c.haze, 0, 1) * 0.8), C.oldS, 0.9));
    o.push(layer('button', corn, C.corneaS), layer('donor', C.donor, C.donorS), layer('conj', C.conj, C.conjS, 0.6));
    return { svg: o.join(''), pieces };
  }
  function section(opt) {
    const st = opt.st || {}, c = norm(st), hp = opt.h ?? 6, pl = G.planes.meridian(hp, opt.off || 0), win = opt.win, step = opt.step || 0.03;
    const key = JSON.stringify([hp, opt.off || 0, win, step, Object.assign({}, c, { inst: null, sut: null, leak: null, fl: null, eye: null })]);
    let tis = SEC.get(key); if (!tis) { tis = sectionTissue(c, pl, win, step); if (SEC.size > 40) SEC.delete(SEC.keys().next().value); SEC.set(key, tis); }
    const X = ctx(c), P2 = p => G.toPlane(pl, p), o = [tis.svg], A = { pieces: tis.pieces };
    const inPlane = h => [hp, hp + 6].some(x => Math.abs(dH(h, x)) < 0.02);
    const mer = (h, rho, z) => P2([rho * cd(h)[0], rho * cd(h)[1], z]);
    const line = (pts, col, w, extra = '') => `<path d="M${pts.map(F).join('L')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra} ${NS}/>`;
    // pseudophakic capsule (thin lines) and IOL haptics crossing the plane
    if (X.D.iol) { const Zs = X.D.Zs, zc = X.D.iol.zc, B = PN.bag, aT = r => zc + optHalf(Math.min(r, 2.99)) + 0.03, ant = [], post = [];
      for (let k = 0; k <= 20; k++) { const r = lerp(B.ccc, B.eq, k / 20); ant.push([r, r < 3 ? aT(r) : lerp(aT(3), zc + 0.05, ss(3, B.eq, r))]); }
      for (let k = 0; k <= 30; k++) { const r = lerp(B.eq, 0, k / 30); post.push([r, r < 3 ? zc - optHalf(r) - 0.03 : lerp(zc - 0.18, zc - optHalf(3) - 0.03, 1 - ss(3, B.eq, r))]); }
      for (const h of [hp, hp + 6]) { o.push(line(ant.map(q => mer(h, q[0], q[1])), C.bag, 1.1), line(post.map(q => mer(h, q[0], q[1])), C.bag, 1.1)); }
      for (const H of hapOf(X)) for (let i = 1; i < H.length; i++) { const nrm = [-pl.U[1], pl.U[0], 0], a = dot(sub(H[i - 1], pl.O), nrm), b = dot(sub(H[i], pl.O), nrm);
        if (a * b <= 0 && a !== b) { const q = P2(add(H[i - 1], sub(H[i], H[i - 1]), a / (a - b))); o.push(`<ellipse cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" rx="0.09" ry="0.07" fill="${C.iolS}"/>`); } }
      A.iol = P2([0, 0, zc]); A.bag = mer(hp, B.eq, zc); }
    // DMEK graft as a thin line (the field is for checks): host back surface + gap, both meridians of the plane
    if (c.dmek) for (const h of [hp, hp + 6]) { const pts = [], r0 = c.open > 0 ? c.rJ : 0, R = c.dmek.d / 2;
      for (let s = G.S_APEX; s < 1; s += 0.02) { const f = G.surfAt(s), q0 = G.P3(h, s, 0), hb = hostBounds(c, { s }, q0[0], q0[1]), rB = f.rho - f.nr * hb[1]; if (rB < r0) continue; if (rB > R) break;
        const dd = hb[1] + dmekGap(c, h, rB) + PN.dmek.t / 2; pts.push(P2(toDrawn(c, G.P3(h, s, dd)))); }
      if (pts.length < 2) continue;
      o.push(line(pts, '#fff', 3.2, 'opacity="0.7"'), line(pts, C.dmek, 1.7)); A['dmek' + (wrapH(h) || 12)] = pts[Math.min(pts.length - 1, Math.round(pts.length * 0.85))]; }
    // trephine cut lines (vertical, at rT) on both sides of the plane
    if (c.tre) for (const h of [hp, hp + 6]) { const f = cutAt(c, h), sT = sOfR(c.rT); if (!(f > 0)) continue;
      const qTop = toDrawn(c, G.P3(h, sT, 0)), T = Th(c, sT), bottom = (() => { let z = qTop[2]; for (let k = 0; k < 400; k++) { const zz = qTop[2] - k * 0.005, W = G.wallOf(zz + dzC(c, c.rT), c.rT); if (W.d >= Math.min(f, 1) * T) { z = zz; break; } } return z; })();
      const a = mer(h, c.rT, qTop[2]), b = mer(h, c.rT, bottom); if (!(c.open >= 1)) o.push(line([a, b], f > 1 ? '#1f2a33' : C.cut, f > 1 ? 1.5 : 1.1));
      A['tre' + (wrapH(h) || 12)] = a; A['treBot' + (wrapH(h) || 12)] = b; A['full' + (wrapH(h) || 12)] = f > 1; }
    // donor endothelium (a line along the donor's back surface) and the donor's edge points
    if (c.donor) { const edge = c.donor.d / 2 * donorK(c);
      for (const h of [hp, hp + 6]) { const pts = []; for (let s = G.S_APEX; s < 0; s += 0.02) { const qd = G.P3(h, s, G.T(s) - 0.006); if (Math.hypot(qd[0], qd[1]) > edge) break; pts.push(P2(toDrawn(c, donorOut(c, qd)))); }   // the donor's back surface
        o.push(line(pts, C.endo, 1.8)); A['endo' + (wrapH(h) || 12)] = pts[Math.round(pts.length * 0.75)]; }
      const top = toDrawn(c, donorOut(c, [0, 0, APEX_Z])); A.donorTop = P2(top); A.donorEdgeR = mer(hp, edge, toDrawn(c, donorOut(c, G.P3(hp, sOfR(edge), 0)))[2]); A.donorEdgeL = mer(hp + 6, edge, A.donorEdgeR ? -A.donorEdgeR[1] : 0); A.donorEdge = edge; }
    // peripheral vessels cut by the plane (small red dots in the stroma between the old junction and the limbus; 示意)
    if (c.nv > 0) { const rIn = c.old ? c.old.d / 2 + 0.12 : c.rK - 1.0; for (const h of [hp, hp + 6]) for (let j = 0; j < 4; j++) { const r = lerp(rIn + 0.25, c.rK - 0.15, j / 3), s = sOfR(r), q = toDrawn(c, G.P3(h, s, Th(c, s) * (0.3 + 0.15 * (j % 2))));
      if (!(c.open > 0 && r < c.rJ)) o.push(`<circle cx="${P2(q)[0].toFixed(4)}" cy="${P2(q)[1].toFixed(4)}" r="0.05" fill="${C.nv}" stroke="#fff" stroke-width="0.6" ${NS}/>`); } }
    // sutures in the plane: the whole track; others: nothing (they are radial in their own meridian)
    for (const su of sutures(c)) { if (!inPlane(su.h)) continue; const n = Math.max(2, Math.round(40 * su.pass) + 1), pts = su.track.slice(0, n).map(P2), H = wrapH(su.h) || 12;
      o.push(line(pts, '#fff', 3.2, 'opacity="0.85"'), line(pts, C.suture, 1.6)); A['sutIn' + H] = P2(su.entry); A['sutOut' + H] = P2(su.exit); A['sutDeep' + H] = P2(su.deep);
      if (su.pass >= 1 && c.sut.tie > 0.5) { const kp = P2(su.knot); o.push(`<circle cx="${kp[0].toFixed(4)}" cy="${kp[1].toFixed(4)}" r="${PN.knot.r}" fill="${C.suture}" stroke="#fff" stroke-width="0.8" ${NS}/>`); A['knot' + H] = kp; } }
    // fluorescein leak (a drop at the junction when the leak is in this plane)
    const LK = leakOf(c); if (LK && inPlane(LK.h)) { const q = P2(LK.start); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${(q[1] - 0.1).toFixed(4)}" r="0.12" fill="${C.leak}" stroke="#2c8a35" stroke-width="0.8" ${NS}/>`); A.leak = q; }
    // instruments
    for (const I of c.inst) { const g = instOf(c, I); if (!g) continue;
      if (g.kind === 'trephine') for (const h of [hp, hp + 6]) { const sT = sOfR(g.r), top = toDrawn(c, G.P3(h, sT, 0)), T = Th(c, sT), bz = (() => { for (let k = 0; k < 400; k++) { const zz = top[2] - k * 0.005, W = G.wallOf(zz + dzC(c, g.r), g.r); if (W.d >= g.dep * T) return zz; } return top[2]; })();
        const a = mer(h, g.r, bz), b = mer(h, g.r, top[2] + 3.5), w = 0.1; o.push(`<path d="M${a[0] - w / 2} ${a[1]}L${b[0] - w / 2} ${b[1]}L${b[0] + w / 2} ${b[1]}L${a[0] + w / 2} ${a[1]}Z" fill="${C.blade}" stroke="${C.steelS}" stroke-width="0.8" opacity="0.92" ${NS}/>`); A['blade' + (wrapH(h) || 12)] = a; }
      if (g.kind === 'scissors' && inPlane(g.h)) { const lo = P2(g.tipLow), up = P2(g.tipUp); o.push(`<ellipse cx="${lo[0]}" cy="${lo[1]}" rx="0.22" ry="0.07" fill="${C.steel}" stroke="${C.steelS}" stroke-width="0.8" ${NS}/><ellipse cx="${up[0]}" cy="${up[1]}" rx="0.22" ry="0.07" fill="${C.steel}" stroke="${C.steelS}" stroke-width="0.8" ${NS}/>`); A.sciLow = lo; A.sciUp = up; }
      if (g.kind === 'cannula' && inPlane(g.h)) { const pts = [g.tip, g.out].map(P2); o.push(line(pts, C.steelS, 3.2), line(pts, C.steel, 2)); A.cannula = P2(g.tip); }
      if (g.kind === 'holder' && inPlane(g.h)) { const pts = g.needle.map(P2); o.push(line(pts, '#fff', 4.2), line(pts, G.C.needle, 2.6)); A.needle = P2(g.tip); }
      if (g.kind === 'forceps' && inPlane(g.h)) { const a = P2(g.tip), b = P2(g.out); o.push(line([a, b], C.steelS, 2.4), line([a, b], C.steel, 1.4)); A.forceps = a; } }
    // anchors: structures in this plane (both meridians)
    for (const [nm, h] of [['', hp], ['L', hp + 6]]) { const S2 = s => P2(toDrawn(c, G.P3(h, s, 0)));
      A['limbus' + nm] = S2(c.sK); A['hostEdge' + nm] = c.open > 0 ? mer(h, c.rJ + 0.02, toDrawn(c, G.P3(h, sOfR(c.rJ + 0.02), 0))[2] - 0.2) : null;
      if (c.old) A['old' + nm] = S2(sOfR(c.old.d / 2));
      A['iris' + nm] = mer(h, (X.D.pr + X.D.root[1]) / 2, tab(X.floorN, (X.D.pr + X.D.root[1]) / 2) - 0.15); A['root' + nm] = mer(h, X.D.root[1], X.D.root[0]); }
    A.lens = P2([0, 0, lensFront(X.D, 0) - 0.8]); A.lensFront = P2([0, 0, lensFront(X.D, 0)]);
    if (c.pas > 0) for (const [nm, h] of [['', hp], ['L', hp + 6]]) if (pasW(c, h) > 0.5) { const q = backPt(c, PN.pas.s1 - c.pas / 2, PN.pas.hw); A['pas' + nm] = mer(h, q[1], q[0]); }   // on the contact
    if (c.li && inPlane(c.li.h)) A.li = mer(c.li.h, c.li.r, tab(X.floorP && pasW(c, c.li.h) > 0.5 ? X.floorP : X.floorN, c.li.r) - 0.1);
    if (c.dcele && inPlane(c.dcele.h)) { const u = c.dcele.r * (Math.abs(dH(c.dcele.h, hp)) < 0.02 ? 1 : -1), q = toDrawn(c, G.P3(c.dcele.h, sOfR(c.dcele.r), 0)), W = G.wallOf(q[2] + dzC(c, c.dcele.r), c.dcele.r), hb = hostBounds(c, W, c.dcele.cx, c.dcele.cy);
      A.dcele = [u, -(q[2] - hb[0])]; A.dceleBack = [u, -(q[2] - hb[1])]; }
    if (c.hy) { let best = null; for (let r = 0; r < 6; r += 0.1) for (const sg of [1, -1]) { const z = X.hyUp[2] ? X.hyLow + 0.3 : null; if (z === null) break; const p = [r * cd(hp)[0] * sg, r * cd(hp)[1] * sg, z]; if (fieldAt(c, X, p).hy < 0) { best = P2(p); break; } } if (best === null && X.hyUp[1]) { const r = -X.hyLow - 0.4; best = mer(6, r, tab(X.floorN, r) + 0.15); } A.hy = best; }
    A.ac = mer(hp, 0.6, (tab(X.back, 0.6) + tab(X.floorN, 0.6)) / 2);
    return { svg: o.join(''), A, pl };
  }
  // IOL haptics (示意 C loops in the bag, flat at the optic's height)
  function hapOf(X) { const zc = X.D.iol.zc, I = PN.iol, out = [];
    for (const h0 of I.hapH) { const pts = []; for (let k = 0; k <= 30; k++) { const t = k / 30, r = lerp(I.optic / 2 - 0.1, I.hapR, Math.sin(Math.PI / 2 * Math.min(1, t * 1.25))), h = h0 + I.sweep / 30 * t; pts.push([r * cd(h)[0], r * cd(h)[1], zc]); } out.push(pts); }
    return out; }

  // ---------------------------------------------------------------- microscope view (surgeon at 12 by default)
  function enface(opt) {
    const st = opt.st || {}, c = norm(st), id = opt.id || 'pk', M = G.enfaceMap(opt.surgeon ?? 12), o = [], A = {}, ctr = M([0, 0, 0]), X = ctx(c), pr = X.D.pr, rK = c.rK;
    const ring = (r, n = 180) => { const pts = []; for (let k = 0; k < n; k++) { const t = 2 * Math.PI * k / n; pts.push(M([r * Math.sin(t), r * Math.cos(t), 0])); } return 'M' + pts.map(F).join('L') + 'Z'; };
    const Pr = (h, r) => M([r * cd(h)[0], r * cd(h)[1], 0]);
    const path = pts => 'M' + pts.map(p => F(M(p))).join('L');
    o.push(`<defs><radialGradient id="${id}_sc" cx="${ctr[0]}" cy="${ctr[1]}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0.42" stop-color="#fbf6f3"/><stop offset="0.75" stop-color="#f6e3e0"/><stop offset="1" stop-color="#eccfcb"/></radialGradient>` +
      `<radialGradient id="${id}_ir" cx="${ctr[0]}" cy="${ctr[1]}" r="${RHO_L}" gradientUnits="userSpaceOnUse"><stop offset="0.25" stop-color="#3b2416"/><stop offset="0.55" stop-color="#6d4329"/><stop offset="0.93" stop-color="#5a3622"/><stop offset="1" stop-color="#8f8a86"/></radialGradient>` +
      `<radialGradient id="${id}_pu" cx="${ctr[0]}" cy="${ctr[1]}" r="${pr * 1.3}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${X.D.iol ? '#8a3a1c' : '#5a2312'}"/><stop offset="1" stop-color="#1c0b06"/></radialGradient>` +
      `<filter id="${id}_bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.12"/></filter></defs>`);
    o.push(`<rect x="-30" y="-30" width="60" height="60" fill="url(#${id}_sc)"/>`);
    for (let k = 0; k < 26; k++) { const h0 = 12 * G.hash(k, 1), r0 = RHO_L + 0.6 + 2.5 * G.hash(k, 2), pts = [];
      for (let j = 0; j <= 12; j++) { const r = r0 + j * 0.65, hh = h0 + 0.18 * Math.sin(j * 0.9 + k) * (1 + G.hash(k, 3)); pts.push(M([r * cd(hh)[0], r * cd(hh)[1], 0])); }
      o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#c8565c" stroke-width="${(0.6 + 0.8 * G.hash(k, 4)).toFixed(2)}" opacity="0.45" ${NS}/>`); }
    // iris, pupil, LI
    const rS = G.surfAt(c.sK + 0.85).rho, rI = Math.min(RHO_L - 0.05, rS);   // iris out to the posterior limbal line (hidden under the limbus of a smaller cornea)
    o.push(`<path d="${ring(rI)}" fill="url(#${id}_ir)"/>`);
    for (let k = 0; k < 90; k++) { const h = k * 12 / 90 + 0.05 * G.hash(k, 5), r0 = pr + 0.25, r1 = rI - 0.5 - 0.6 * G.hash(k, 6), a = M([r0 * cd(h)[0], r0 * cd(h)[1], 0]), b = M([r1 * cd(h + 0.06)[0], r1 * cd(h + 0.06)[1], 0]);
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="${G.hash(k, 7) > 0.5 ? '#8a5a3a' : '#2e1a0f'}" stroke-width="0.7" opacity="0.5" ${NS}/>`); }
    o.push(`<path d="${ring(2.75)}" fill="none" stroke="#8b5d3d" stroke-width="1.4" opacity="0.55" ${NS}/>`, `<circle cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}" fill="url(#${id}_pu)"/>`);
    A.pupil = ctr; A.irisMid = Pr(4.5, 3.6);
    if (c.li) { const q = Pr(c.li.h, c.li.r); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${c.li.d / 2}" fill="#7a2614" stroke="#1c0b06" stroke-width="0.8" ${NS}/>`); A.li = q; A.liH = c.li.h; A.liR = c.li.r; }
    // PCIOL: optic edge and haptics behind the iris (dashed: hidden, 示意)
    if (X.D.iol) { o.push(`<path d="${ring(PN.iol.optic / 2)}" fill="none" stroke="#e7dca8" stroke-width="1" stroke-dasharray="3 2" opacity="0.6" ${NS}/>`);
      for (const H of hapOf(X)) o.push(`<path d="${path(H)}" fill="none" stroke="#9bb4cf" stroke-width="1.1" stroke-dasharray="3 2" opacity="0.7" ${NS}/>`);
      o.push(`<circle cx="${ctr[0] + 0.35}" cy="${ctr[1] - 0.45}" r="0.35" fill="#fff" opacity="0.25"/>`); A.iol = Pr(1.5, 2.2); }
    // hyphema: blood column thickness over the chamber floor (supine: pooled on the back of the chamber; upright: a level at 6 o'clock)
    if (c.hy) { const gx = [], step = 0.12, n = Math.ceil(2 * rK / step) + 1, vals = new Float64Array(n * n);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -rK + i * step, y = -rK + j * step, r = Math.hypot(x, y), floor = tab(X.floorP && pasW(c, G.clockOf(x, y)) > 0.5 ? X.floorP : X.floorN, r), back = tab(X.back, r);
        let col = 0; if (r < (X.floorP && pasW(c, G.clockOf(x, y)) > 0.5 ? X.acRP : X.acRN)) col = X.hyUp[2] ? Math.max(0, Math.min(back, X.hyLevel) - floor) : (y < X.hyLevel ? back - floor : 0);
        vals[j * n + i] = 0.02 - col; }
      const loops = G.contour(vals, n, n, -rK, -rK, step).map(l => l.map(p => M([p[0], p[1], 0])));
      if (loops.length) o.push(`<path d="${loops.map(l => 'M' + l.map(F).join('L') + 'Z').join('')}" fill="#86161b" fill-rule="evenodd" opacity="0.88" filter="url(#${id}_bl)"/>`);
      let best = null, bc = 0; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (-vals[j * n + i] > bc) { bc = -vals[j * n + i]; best = [-rK + i * step, -rK + j * step]; }
      A.hy = best ? M([best[0], best[1], 0]) : null; A.hyXY = best; }
    if (c.ovd > 0) o.push(`<path d="${ring(Math.min(rK, X.acRN) - 0.1)}" fill="${C.ovd}" opacity="${(0.22 * clamp(c.ovd, 0, 1)).toFixed(2)}"/>`);   // viscoelastic in the chamber (示意)
    // cornea: haze / oedema over the clear cornea; open sky clears the opening; a seated donor is clear
    const opening = c.open >= 1 ? c.rJ : 0, clearR = c.donor && c.donor.place >= 1 ? c.rJ : opening;
    const hz = 0.08 + 0.55 * clamp(c.haze, 0, 1) + 0.25 * clamp((c.edema || 0) / 0.4, 0, 1);
    if (hz > 0.09) o.push(`<path d="${ring(rK)}${clearR > 0 ? ring(clearR) : ''}" fill="${c.edema > 0.2 ? '#dde6ec' : C.haze}" fill-rule="evenodd" opacity="${hz.toFixed(3)}"/>`);
    if (c.soft > 0 && !(c.open > 0)) for (let k = 0; k < 7; k++) { const y0 = -2.4 + k * 0.8 + 0.2 * G.hash(k, 21), pts = []; for (let j = 0; j <= 20; j++) { const x = -3.2 + 6.4 * j / 20; pts.push([x, y0 + 0.25 * Math.sin(x * 0.9 + k), 0]); }
      o.push(`<path d="${path(pts)}" fill="none" stroke="#9aa6b0" stroke-width="0.8" opacity="${(0.45 * clamp(c.soft, 0, 1)).toFixed(2)}" ${NS}/>`); }   // Descemet folds of a soft eye (示意)
    if (c.open > 0 && c.open < 1) { const pts = []; for (let k = 0; k < 120; k++) { const t = 2 * Math.PI * k / 120; pts.push(btnFwd(c, toMat(c, G.P3(12 * k / 120, sOfR(c.rT - 0.04), 0)))); } o.push(`<path d="${path(pts)}Z" fill="${C.haze}" opacity="${(0.5 + 0.4 * c.haze).toFixed(2)}" stroke="#a9b7c2" stroke-width="1" ${NS}/>`); A.button = M(btnFwd(c, [0, 0, APEX_Z])); }
    // old DALK junction, descemetocele, NV, DMEK graft (all in the host; gone inside the opening once the button is off)
    if (c.old && !(c.open > 0 && c.old.d / 2 < c.rJ)) { o.push(`<path d="${ring(c.old.d / 2)}" fill="none" stroke="#f5f7f9" stroke-width="2.6" opacity="0.9" ${NS}/><path d="${ring(c.old.d / 2)}" fill="none" stroke="#8a98a4" stroke-width="0.9" opacity="0.9" ${NS}/>`); A.oldR = c.old.d / 2; A.old = Pr(1.5, c.old.d / 2); }
    if (c.dcele && !(c.open > 0)) { const D = c.dcele, q = M([D.cx, D.cy, 0]); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${D.rad}" fill="#40281a" opacity="0.32"/><circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${(D.rad * 0.45).toFixed(3)}" fill="#24140c" opacity="0.45"/>`);
      o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${D.rad}" fill="none" stroke="#f3f6f8" stroke-width="1.4" opacity="0.8" ${NS}/><path d="M${F([q[0] - D.rad * 0.35, q[1] - D.rad * 0.25])}A${D.rad * 0.45} ${D.rad * 0.45} 0 0 1 ${F([q[0] + D.rad * 0.15, q[1] - D.rad * 0.42])}" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.85" ${NS}/>`); A.dcele = q; A.dceleXY = [D.cx, D.cy]; }
    const NV = nvOf(c); for (const v of NV) for (const [L, w] of [[v.pts, 1.0], [v.br, 0.6]]) { const pts = L.filter(p => !(c.open > 0 && Math.hypot(p[0], p[1]) < c.rJ)); if (pts.length > 1) o.push(`<path d="${path(pts)}" fill="none" stroke="${C.nv}" stroke-width="${w}" opacity="0.8" ${NS}/>`); }
    A.nv = NV.map(v => ({ h: v.h, r0: v.r0, r1: v.r1 })); if (NV.length) A.nvPt = M(NV[Math.floor(NV.length * 0.15)].pts[4]);
    if (c.dmek) { const R = c.dmek.d / 2; o.push(`<path d="${ring(R)}" fill="none" stroke="${C.dmek}" stroke-width="1" stroke-dasharray="4 2" opacity="0.55" ${NS}/>`);
      const half = c.dmek.detach * 6, pts = []; for (let k = 0; k <= 24; k++) pts.push(Pr(c.dmek.h + lerp(-half * 0.8, half * 0.8, k / 24), R - 0.9)); for (let k = 24; k >= 0; k--) pts.push(Pr(c.dmek.h + lerp(-half * 0.8, half * 0.8, k / 24), R - 0.05));
      o.push(`<path d="M${pts.map(F).join('L')}Z" fill="${C.dmek}" opacity="0.16"/>`); A.dmek = Pr(c.dmek.h, R - 0.45); A.dmekR = R; }
    // limbus (at the clear-cornea edge rK) and the limbal band
    o.push(`<path d="${ring(rK + 0.02)}${ring(rK - 0.45)}" fill="#c9d3d9" fill-rule="evenodd" opacity="0.55"/>`, `<path d="${ring(rS)}${ring(rK)}" fill="#eef2f4" fill-rule="evenodd" opacity="0.8"/>`, `<path d="${ring(rK)}" fill="none" stroke="#9fb1bd" stroke-width="1" ${NS}/>`);
    A.limbusR = rK;
    // fluorescein painted on the surface; the leak stream (aqueous dilutes it to bright green), running outward = downhill on a supine eye
    if (c.fl > 0) o.push(`<path d="${ring(rK + 0.3)}" fill="${C.fl}" opacity="${(0.38 * clamp(c.fl, 0, 1)).toFixed(3)}"/>`);
    const LK = leakOf(c); if (LK) { const L = LK.pts.map(M), w0 = 0.28 * c.leak.amt, left = [], right = [];
      for (let k = 0; k < L.length; k++) { const a = L[Math.max(0, k - 1)], b = L[Math.min(L.length - 1, k + 1)], t = unit([b[0] - a[0], b[1] - a[1], 0]), w = w0 * lerp(0.6, 1.2, k / (L.length - 1)) * (1 + 0.15 * Math.sin(k * 1.7)); left.push([L[k][0] - t[1] * w, L[k][1] + t[0] * w]); right.push([L[k][0] + t[1] * w, L[k][1] - t[0] * w]); }
      o.push(`<path d="M${[...left, ...right.reverse()].map(F).join('L')}Z" fill="${C.leak}" opacity="0.85" filter="url(#${id}_bl)"/>`, `<circle cx="${L[0][0].toFixed(4)}" cy="${L[0][1].toFixed(4)}" r="${(0.3 * c.leak.amt).toFixed(3)}" fill="#c9ffb8" opacity="0.9"/>`); A.leak = L[0]; A.leakEnd = L[L.length - 1]; }
    // trephine groove (partial: grey; through: dark), the host's cut edge in open sky, the donor
    if (c.tre && !(c.open >= 1)) { const runs = []; let cur = null; for (let k = 0; k <= 360; k++) { const h = 12 * k / 360, f = cutAt(c, h), full = f > 1, has = f > 0; if (!has) { cur = null; continue; } if (!cur || cur.full !== full) { cur = { full, pts: cur ? [cur.pts[cur.pts.length - 1]] : [] }; runs.push(cur); } cur.pts.push(Pr(h, c.rT)); }
      for (const R of runs) if (R.pts.length > 1) o.push(`<path d="M${R.pts.map(F).join('L')}" fill="none" stroke="${R.full ? '#1f2a33' : '#7d8a95'}" stroke-width="${R.full ? 1.8 : 1.2}" stroke-linecap="round" ${NS}/>`);
      [12, 3, 6, 9].forEach(h => A['tre' + h] = Pr(h, c.rT)); A.treR = c.rT; }
    if (c.open >= 1 && !(c.donor && c.donor.place >= 1)) { o.push(`<path d="${ring(c.rJ + 0.12)}${ring(c.rJ)}" fill="#f1f3f4" fill-rule="evenodd" stroke="#8b98a3" stroke-width="0.8" ${NS}/>`); A.hostEdgeR = c.rJ; A.hostEdge = Pr(4.5, c.rJ + 0.06); }
    if (c.donor) { const edge = c.donor.d / 2 * donorK(c), off = donorOff(c), sh = M([0.25 * off, -0.35 * off, 0]), dc = M([0, 0, 0]);
      if (off > 0) o.push(`<circle cx="${(dc[0] + sh[0] - ctr[0]).toFixed(4)}" cy="${(dc[1] + sh[1] - ctr[1]).toFixed(4)}" r="${edge}" fill="#000" opacity="0.12" filter="url(#${id}_bl)"/>`);
      o.push(`<circle cx="${ctr[0]}" cy="${ctr[1]}" r="${edge}" fill="${C.donor}" opacity="${off > 0 ? 0.55 : 0.18}" stroke="${C.donorS}" stroke-width="${off > 0 ? 1.2 : 0.9}" ${NS}/>`);
      if (off <= 0) { o.push(`<path d="${ring(edge)}" fill="none" stroke="#eef2f4" stroke-width="2.2" opacity="0.8" ${NS}/><path d="${ring(edge)}" fill="none" stroke="#8b98a3" stroke-width="0.8" ${NS}/>`); A.hostEdge = Pr(4.5, c.rJ + 0.06); A.hostEdgeR = c.rJ; }   // seated: a thin graft–host junction
      A.donor = Pr(10.5, edge * 0.6); A.donorEdgeR = edge; }
    // sutures and knots
    for (const su of sutures(c)) { const n = Math.max(2, Math.round(40 * su.pass) + 1), a = M(su.entry), b = M(su.track[n - 1]), H = wrapH(su.h) || 12;
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="#fff" stroke-width="3" stroke-linecap="round" ${NS}/><path d="M${F(a)}L${F(b)}" stroke="${C.suture}" stroke-width="1.5" stroke-linecap="round" ${NS}/>`);
      A['sutIn' + H] = a; A['sutOut' + H] = M(su.exit); A['sutPass' + H] = su.pass;
      if (su.pass >= 1 && c.sut.tie > 0.5) { const kp = M(su.knot); o.push(`<circle cx="${kp[0].toFixed(4)}" cy="${kp[1].toFixed(4)}" r="${(0.12 * (1 - 0.4 * (c.sut.bury || 0))).toFixed(3)}" fill="${C.suture}" stroke="#fff" stroke-width="0.8" ${NS}/>`); A['knot' + H] = kp; } }
    // instruments (simplified, 示意)
    const rod = (pts, w, col, colS, extra = '') => `<path d="${path(pts)}" fill="none" stroke="${colS}" stroke-width="${w + 1}" stroke-linecap="round" stroke-linejoin="round" ${extra} ${NS}/><path d="${path(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra} ${NS}/>`;
    for (const I of c.inst) { const g = instOf(c, I); if (!g) continue;
      if (g.kind === 'trephine') { o.push(`<path d="${ring(g.r + 0.55)}${ring(g.r + 0.06)}" fill="${C.blade}" fill-rule="evenodd" opacity="0.55" stroke="${C.steelS}" stroke-width="0.8" ${NS}/>`, `<path d="${ring(g.r)}" fill="none" stroke="${C.steelS}" stroke-width="1.6" ${NS}/>`); A.trephine = Pr(4.5, g.r + 0.3); }
      if (g.kind === 'scissors') { o.push(rod(g.arcL, 2.2, '#c3ccd4', C.steelS, 'stroke-dasharray="3 2" opacity="0.7"'), rod([...g.shank.slice().reverse(), ...g.arcU.slice().reverse().slice(1)], 2.6, C.steel, C.steelS)); A.scissors = M(g.arcU[6]); }
      if (g.kind === 'forceps') { const t = M(g.tip), side = unit([g.out[1] - g.tip[1], -(g.out[0] - g.tip[0]), 0]); o.push(rod([add(g.tip, side, 0.1), add(g.out, side, 0.6)], 1.4, C.steel, C.steelS), rod([add(g.tip, side, -0.1), add(g.out, side, -0.6)], 1.4, C.steel, C.steelS)); A.forceps = t; }
      if (g.kind === 'cannula') { o.push(rod([g.tip, g.entry, g.out], 1.6, C.steel, C.steelS)); A.cannula = M(g.tip); }
      if (g.kind === 'holder') { o.push(rod(g.needle, 1.3, '#cfd6dd', G.C.needle)); const j = g.jaw, out = add(j, unit([j[0], j[1], 0]), 7); o.push(rod([j, add(out, [0, 0, 3])], 2.6, C.steel, C.steelS)); A.needle = M(g.tip); } }
    // light reflexes (示意)
    o.push(`<ellipse cx="${ctr[0] - 0.9}" cy="${ctr[1] - 0.7}" rx="0.32" ry="0.22" fill="#fff" opacity="0.85"/><ellipse cx="${ctr[0] + 0.9}" cy="${ctr[1] - 0.7}" rx="0.32" ry="0.22" fill="#fff" opacity="0.85"/>`);
    A.centre = ctr; A.M = M;
    return { svg: o.join(''), A, M };
  }

  // ---------------------------------------------------------------- names for the picture (OS / OD; surgeon at a clock hour; a section through hp)
  const EYE = { OD: { zh: '右眼 OD', nasal: 3 }, OS: { zh: '左眼 OS', nasal: 9 } };
  const side = (eye, h) => { const x = cd(h)[0], nx = cd(EYE[eye].nasal)[0]; return Math.abs(x) < 0.26 ? '' : x * nx > 0 ? 'nasal' : 'temporal'; };
  function orient(o) { const eye = o.eye === 'OD' ? 'OD' : 'OS', E = EYE[eye], hr = h => wrapH(Math.round(h * 100) / 100) || 12;
    if (o.view === 'section') { const hp = o.h ?? 6; return { eye, view: 'section', right: hr(hp), left: hr(hp + 6), text: `${E.zh}　${hr(hp + 6)}–${hr(hp)} 點切面：左＝${hr(hp + 6)} 點　右＝${hr(hp)} 點　上＝前` }; }
    const M = G.enfaceMap(o.surgeon ?? 12); let right = 12, best = -1e9; for (let k = 0; k < 1200; k++) { const h = 12 * k / 1200, q = M([...cd(h), 0]); if (q[0] > best) { best = q[0]; right = h; } }
    const R = { eye, view: 'scope', bottom: hr(o.surgeon ?? 12), right: hr(right), left: hr(right + 6), rightSide: side(eye, right), leftSide: side(eye, right + 6) };
    R.text = `${E.zh}　術者坐 ${R.bottom} 點：下＝${R.bottom} 點　左＝${R.left} 點 ${R.leftSide}　右＝${R.right} 點 ${R.rightSide}`; return R; }

  return { PN, norm, ctx, diaph, irisGeom, hostBounds, cutAt, dzC, toMat, toDrawn, Th, sOfR, sutOrder, suturePath, sutures, leakOf, nvOf, instOf, hapOf, dmekGap, donorK, donorOff, donorMat, donorOut,
    btnInv, btnFwd, fieldAt, layersFn, section, enface, orient, lensFront, tab, C, dH, RHO_L, APEX_Z };
}
const PK = typeof GLOBE !== 'undefined' ? PK_MAKE(GLOBE) : null;
if (typeof module !== 'undefined') module.exports = PK_MAKE;
