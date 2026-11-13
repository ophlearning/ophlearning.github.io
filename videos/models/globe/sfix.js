// ============================================================================
// Sutured scleral fixation of a three-piece IOL on the shared globe (OD) — optional states for the video 鞏膜縫合固定 IOL
// (videos/src/sutured-scleral-iol-fixation/). Units: mm. Every number is in CARD.md (鞏膜縫合固定 IOL) with its source, or marked 示意 there.
// Nothing here changes GLOBE (or CATARACT): the other videos never load this file, so their drawings stay byte-identical.
// Load after globe.js; in node: require('./sfix.js')(GLOBE).
// Views (the same 3D eye):
//   section(opt)  meridional section through clock h (default 2: screen right = 2 o'clock, left = 8 o'clock, anterior up). Aphakic, no capsule;
//                 the uvea of this category (sulcus placed by Duffey 1989 from the posterior surgical limbus, pars plicata to Yoon 2023's 2.41 mm),
//                 conjunctiva and triangular scleral flaps, trocars, needles, the 10-0 polypropylene suture, the MA60AC IOL, knots.
//   enface(opt)   microscope view, OD, surgeon at 12 (12 o'clock at the bottom, 9 o'clock temporal on the right), dilated pupil, aphakic red reflex.
// "x mm behind the limbus" in this category is measured from the posterior surgical limbus (PSL) — the posterior edge of the grey-blue limbal band,
// which the model puts on its posterior limbal line over the scleral spur (Le 2018, s = 0.85 from the visible limbus). See CARD.md for why.
// ============================================================================
function SFIX_MAKE(G) {
  const { D2R, NS, lerp, clamp, ss, add, sub, dot, len, unit, cross } = G;
  const F = p => p[0].toFixed(4) + ' ' + p[1].toFixed(4);
  const H2R = 30 * D2R, N = G.N;
  const wrapH = h => ((h % 12) + 12) % 12;
  const dH = (a, b) => ((a - b) % 12 + 18) % 12 - 6;              // signed clock-hour difference in [−6, 6)
  const cd = h => G.clockDir(h);

  // ---------------------------------------------------------------- numbers (CARD.md 鞏膜縫合固定 IOL has the source of each)
  const SN = {
    psl: N.spur,                                  // posterior surgical limbus ≡ the model's posterior limbal line over the spur (Le 2018; the equivalence is 推論)
    duffey: { v: 0.83, hz: 0.46, sd: 0.1 },       // Duffey 1989: a needle perpendicular to the sclera through the sulcus enters this far behind the PSL (vertical / horizontal meridian)
    davis: { d: 0.9, dia: 11.0, sd: 0.37 },       // Davis 1991 (cadaver): limbus (undefined) → sulcus 0.9; sulcus diameter 11.0 ± 0.37 — listed, not reproduced (CARD)
    yoonPlicata: 2.41,                            // Yoon 2023 (轉述): pars plicata ends 2.41 mm behind the PSL
    sugiura: 3.0,                                 // Sugiura 2018: ab externo pars plana fixation 3.0 mm behind the PSL
    hours: [2, 8],                                // fixation clock hours, 180° apart (Kokame 2018, Van Meter 1997, Zhao 2025)
    guedes: 1.0, kokame: 2.0,                     // needle distances shown: Guedes 2026 ~1 mm (demonstrated), Kokame 2018 ≥ 2 mm (comparison)
    sulW: 0.2,                                    // 示意: half-width of the sulcus floor (perpendicular foot)
    aimIn: 0.12,                                  // 示意: the needle is aimed this far into the sulcus from its floor
    base: { spur: 0.30, sul: 0.50, pe: 0.32, ora: 0.22 },   // 示意: ciliary body (muscle → pars plana) thickness under the sclera at the spur, sulcus, plicata end, ora
    proc: { h: 0.65, rise: 0.45, fall: 0.9 },     // 示意: ciliary processes: height over the muscle, rise behind the sulcus floor, taper before the plicata end
    iris: { pupil: 7.0, th0: 0.36, thM: 0.5, thP: 0.3, rise: 0.30, back: 0.18 },   // 示意: dilated pupil, iris thickness root / collarette / margin, pupil margin forward of the root
    flap: { side: 3.0, frac: 1 / 3, lift: 145 },  // Guedes 2026: triangular flap, sides 3 mm, 1/3 scleral thickness, hinged on the limbus side; lifted angle 示意
    peri: { half: 2.0, back: 4.0 },               // 示意: conjunctiva opened ± half mm (at the limbus) around each fixation hour, back to PSL + back
    trocar: { s: 3.5, hours: [7, 10, 1], od: 0.64, hub: 0.95 },   // Rajan 2025 23G 3.5–4 mm (from the PSL here); 23G outer Ø 0.6414 mm (gauge); hours and hub size 示意
    inc: { h: 12, w: 2.75, s: -0.3, sIn: -1.9 },  // IOL entry wound at 12 o'clock (template); 2.75 mm blade (Guedes 2026); tunnel ends 示意
    g27: 0.41,                                    // 27G (insulin) needle outer Ø (gauge table)
    needle: { L: 16, od: 0.15 },                  // 示意: straight needle length and thickness as drawn
    curved: { r: 0.6, bite: 0.9 },                // 示意: curved needle radius, bite length in the flap bed
    iol: { optic: 6.0, overall: 13.0, ang: 10, tc: 0.8, te: 0.3, hd: 0.15, sweep: 112, root: -38, tieT: 0.85, curl: 0.25 },
    //   MA60AC: optic 6.0, overall 13.0, C-loop PMMA haptics angled 10° (Aydin 2025 methods; Alcon label 待核對); optic thickness, haptic Ø, sweep,
    //   root angle, where the tie sits along the haptic (Guedes 2026: distal third → 0.85 of its length), tip curl: 示意
    slack: 1.0, gap: 0.05, fall: 2.0,             // 示意: unpulled suture slack, haptic–wall gap when pulled, how far a slipped haptic falls
    knot: { r: 0.06, ds: 0.35, dc: 0.3 },         // 示意: knot radius, where it sits in the bed (behind / beside the entry)
    gel: { skirt: 10.6, hy: 0.6, base: 0.4, core: 9.5 },   // 示意: vitrectomy removes the gel within this radius of the globe centre (vit 1); anterior hyaloid this far
                                                  //   behind the sulcus; near the wall (beyond core) gel only behind PE + base (the vitreous base), none over the pars plicata
    old: { r: 3.0, c: [0, -2.4, 6.6], tilt: 35 }, // 示意: the dislocated old IOL (type unknown): optic radius, centre (toward 6 o'clock, behind), tilt
  };
  const SUL = SN.psl + lerp(SN.duffey.v, SN.duffey.hz, 60 / 90);   // 2 and 8 o'clock are 60° from the vertical meridian: interpolated (示意)
  const PE = SN.psl + SN.yoonPlicata, ORA = N.ora, P0 = SUL + SN.sulW;
  const sAbs = (mm, from) => from === 'vis' ? mm : SN.psl + mm;   // "mm behind the limbus" → model s (from the PSL unless from = 'vis')

  // ---------------------------------------------------------------- uvea of this category (perpendicular-foot s, depth e below the inner scleral surface)
  const baseM = s => s < N.spur ? 0 : s < SUL ? lerp(SN.base.spur, SN.base.sul, ss(N.spur, SUL, s)) : s < PE ? lerp(SN.base.sul, SN.base.pe, ss(SUL, PE, s)) : lerp(SN.base.pe, SN.base.ora, ss(PE, ORA, s));
  const procH = s => s <= P0 || s >= PE ? 0 : SN.proc.h * ss(P0, P0 + SN.proc.rise, s) * (1 - ss(PE - SN.proc.fall, PE, s)) * (1 + 0.08 * Math.sin((s - P0) * 11));
  // a point at foot s, depth e below the inner scleral surface, in a meridian: [rho, z]
  const mz = (s, e) => { const f = G.surfAt(s), d = G.T(s) + e; return [f.rho - f.nr * d, f.z - f.nz * d]; };
  // iris: centreline from its root (on the ciliary face, in front of the sulcus floor) to the pupil margin (flat, slightly forward; 示意)
  const IR = (() => { const sR = SUL - SN.sulW - SN.iris.back, R0 = mz(sR, baseM(sR) - 0.08), pr = SN.iris.pupil / 2, pm = [pr, R0[1] + SN.iris.rise], ctl = [lerp(R0[0], pr, 0.5), lerp(R0[1], pm[1], 0.5) + 0.06], L = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40, u = 1 - t; L.push([u * u * pm[0] + 2 * u * t * ctl[0] + t * t * R0[0], u * u * pm[1] + 2 * u * t * ctl[1] + t * t * R0[1]]); }   // t = 0 pupil margin → 1 root, [rho, z]
    const th = t => t > 0.85 ? lerp(SN.iris.thM, SN.iris.th0, ss(0.85, 1, t)) : t < 0.25 ? lerp(SN.iris.thP, SN.iris.thM, ss(0, 0.25, t)) : SN.iris.thM;
    return { L, th, root: R0, pm, sR, pr }; })();
  const distPoly = (q, pts) => { let bd = 1e18, bt = 0; const n = pts.length - 1;
    for (let i = 1; i <= n; i++) { const ax = pts[i - 1][0], ay = pts[i - 1][1], ex = pts[i][0] - ax, ey = pts[i][1] - ay, L2 = ex * ex + ey * ey || 1;
      let t = ((q[0] - ax) * ex + (q[1] - ay) * ey) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; const dx = q[0] - ax - ex * t, dy = q[1] - ay - ey * t, d = dx * dx + dy * dy; if (d < bd) { bd = d; bt = (i - 1 + t) / n; } }
    return [Math.sqrt(bd), bt]; };
  const irisG = (rho, z) => { if (rho < IR.pr - 0.4 || rho > IR.root[0] + 0.6 || z < IR.root[1] - 0.8 || z > IR.pm[1] + 0.8) return 1; const [d, t] = distPoly([rho, z], IR.L); return d - IR.th(t) / 2; };
  // iris front / back surface height at radius rho (for the anterior chamber test and clearances)
  const irisC = rho => { const L = IR.L; for (let i = 1; i < L.length; i++) if ((L[i - 1][0] - rho) * (L[i][0] - rho) <= 0) { const k = (rho - L[i - 1][0]) / ((L[i][0] - L[i - 1][0]) || 1); return { z: lerp(L[i - 1][1], L[i][1], k), t: (i - 1 + k) / (L.length - 1) }; } return null; };
  const irisZ = (rho, back) => { const q = irisC(rho); return q ? q.z + (back ? -1 : 1) * IR.th(q.t) / 2 : null; };   // the iris is nearly flat: vertical half-thickness
  // sulcus: the aim point (foot SUL, aimIn into the open space from the floor) and the apex on the floor
  const SULC = { apex: mz(SUL, baseM(SUL)), aim: mz(SUL, baseM(SUL) + SN.aimIn) };

  // ---------------------------------------------------------------- state
  // st.sfix = { vit, old, inc, peri, marks, flap: { cut, open, close }, trocar, pins, ndl, iol, knot, exposed, pupil }
  //   vit 0→1 vitrectomy (core first, a skirt at the vitreous base stays; 示意); old: {} the dislocated old IOL (示意; null once removed);
  //   inc 0→1 the 12 o'clock wound; peri 0→1 conjunctiva opened at 2 and 8; marks: toric-marker dots on the limbus + caliper dots at the entries;
  //   flap { cut 0→1, open 0→1 }; trocar: three 23G cannulas; pins [{ h, mm, from }] test needles perpendicular to the sclera (the Duffey mapping);
  //   ndl { s2, s8, from, pass, g27, out, taut, hook, cut } the double-armed 10-0 polypropylene: straight needle from 2 docked into a 27G needle from 8;
  //   iol { at: 'out' | 'eye', pull, ten: [t2, t8], slip: null | 2 | 8 }; knot 0→1 tied in the beds; exposed: 2 | 8 the flap not covering that knot
  const DEF = { vit: 1, old: null, inc: 0, peri: 0, marks: 0, flap: null, trocar: 0, pins: [], ndl: null, iol: null, knot: 0, exposed: null };
  const norm = st => { st = st || {}; const c = Object.assign({}, DEF, st.sfix || {});
    c.flap = c.flap ? Object.assign({ cut: 1, open: 0 }, c.flap) : null;
    c.ndl = c.ndl ? Object.assign({ s2: SN.guedes, s8: SN.guedes, from: 'psl', pass: 1, g27: 1, out: 1, taut: 1, hook: 0, cut: 0 }, c.ndl) : null;
    c.iol = c.iol ? Object.assign({ at: 'eye', pull: 1, ten: [1, 1], slip: null }, c.iol) : null;
    c.old = c.old ? Object.assign({}, c.old) : null;
    c.pins = (c.pins || []).map(p => Object.assign({ h: 2, mm: 1, from: 'psl' }, p));
    return c; };

  // ---------------------------------------------------------------- needle tracks (in the meridian of clock h; [rho, z]; rho < 0 = past the axis)
  // aim 'sulcus': through the sulcus aim point (the demonstrated pass, Guedes 2026: "passed behind the iris"); 'perp': perpendicular to the sclera
  // (Duffey's mapping); a number: degrees below the frontal plane
  const TRK = new Map();
  function track(h, s, aim = 'sulcus') {
    const k = JSON.stringify([wrapH(h), s, aim]); if (TRK.has(k)) return TRK.get(k);
    const f = G.surfAt(s), E = [f.rho, f.z];
    const dir = aim === 'perp' ? [-f.nr, -f.nz] : aim === 'sulcus' ? unit2([SULC.aim[0] - E[0], SULC.aim[1] - E[1]]) : [-Math.cos(aim * D2R), -Math.sin(aim * D2R)];
    const at = t => [E[0] + dir[0] * t, E[1] + dir[1] * t], to3 = q => { const c2 = cd(h); return [q[0] * c2[0], q[0] * c2[1], q[1]]; };
    // walk inward: what the line passes through until it first reaches open space behind the wall
    const seq = [], lens = {}; let I = null, tI = 0, space = null, prev = null;
    for (let t = 0; t < 8; t += 0.004) { const q = at(t), o = uveaAt(q[0], q[1]), tis = o.cornea < 0 ? 'cornea' : o.limbus < 0 ? 'limbus' : o.sclera < 0 ? 'sclera' : o.iris < 0 ? 'iris' : o.proc < 0 ? 'proc' : o.cbody < 0 ? 'cbody' : o.choroid < 0 || o.retina < 0 ? 'retina' : o.interior < 0 ? 'open' : 'outside';
      if (tis !== prev) { seq.push(tis); prev = tis; } lens[tis] = (lens[tis] || 0) + 0.004;
      if (tis === 'open' && t > 0.05) { I = q; tI = t; space = acTest(q[0], q[1]) ? 'ac' : 'pc'; break; } }
    let Eb = E; for (let t = 0; t < 2; t += 0.002) { const q = at(t), W0 = G.wallOf(q[1], Math.abs(q[0])); if (W0.d >= G.T(W0.s) * SN.flap.frac) { Eb = q; break; } }   // under a flap the needle enters the bed
    const none = !I; if (!I) I = at(1.5);
    const W = G.wallOf(I[1], Math.abs(I[0])), sI = W.s;
    // what it reached: through the iris; into the chamber angle; through a ciliary process (or out over the pars plicata); over the pars plana; else the sulcus
    const cls = none ? 'none' : seq.includes('iris') ? 'iris' : space === 'ac' || seq.includes('limbus') || seq.includes('cornea') ? 'angle' : (lens.proc || 0) > 0.05 || (sI > P0 && sI <= PE) ? 'plicata' : sI > PE ? 'plana' : 'sulcus';
    const R = { h: wrapH(h) || 12, s, aim, E, Eb, dir, at, to3, I, tI, sI, space, seq, lens, cls, E3: to3(E), Eb3: to3(Eb), I3: to3(I) };
    TRK.set(k, R); return R;
  }
  function unit2(a) { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }
  // anterior chamber: in front of the iris (or of the pupil plane inside the pupil), inside the wall; outside the iris root's radius, the angle recess
  // in front of the root (behind it there is only ciliary body)
  function acTest(rho, z) { const r = Math.abs(rho); if (r > IR.root[0]) return z > IR.root[1]; if (r < IR.pr) return z > IR.pm[1]; const zf = irisZ(r, false); return zf !== null && z > zf; }
  // tissue values at a meridional point (rho may be negative: mirrored)
  const FD = G.makeField({});
  function uveaAt(rho, z) {
    const r = Math.abs(rho), W = G.wallOf(z, r), s = W.s, d = W.d, T = G.T(s), e = d - T, o = {}, Wf = { s, d, T, c: 1e3, gap: 0, rhoF: W.rhoF };
    o.interior = T - d; o.cornea = FD.g.cornea(Wf); o.limbus = FD.g.limbus(Wf); o.sclera = FD.g.sclera(Wf);
    const m = baseM(s), p = procH(s);
    o.cbody = Math.max(-e, e - m, N.spur - 0.02 - s, s - ORA);
    o.proc = p > 0 ? Math.max(m - 0.03 - e, e - m - p, P0 - s, s - PE) : 1;
    o.choroid = Math.max(-e, e - 0.22, ORA - s); o.retina = Math.max(0.22 - e, e - 0.42, ORA - s);
    o.iris = irisG(r, z); W.e = e; o.W = W;
    return o;
  }
  // the demonstrated needle angle: the one that takes a pass entering 1 mm behind the PSL (Guedes 2026) through the sulcus — degrees below the frontal
  // (iris) plane. Both needles keep this angle; another entry distance with the same angle lands elsewhere (2 mm → pars plicata; 1 mm from the
  // visible limbus → the chamber angle). 示意: the angle itself has no source; it is what the model's anatomy needs.
  const DIVE = (() => { const t = track(SN.hours[0], sAbs(SN.guedes, 'psl'), 'sulcus'); return Math.atan2(-t.dir[1], -t.dir[0]) / D2R; })();
  // the two passes of the double-armed suture in the 2–8 meridian (plane coordinate u: + toward 2 o'clock, v = z) and the dock where they meet
  function passes(c) {
    const n = c.ndl || { s2: SN.guedes, s8: SN.guedes, from: 'psl' }, from = n.from || 'psl';
    const t2 = track(SN.hours[0], sAbs(n.s2, from), n.aim2 ?? DIVE), t8 = track(SN.hours[1], sAbs(n.s8, from), n.aim8 ?? DIVE);
    // 2D lines in the 2–8 plane: u = rho at 2 o'clock, −rho at 8 o'clock
    const a = [t2.E[0], t2.E[1]], da = [t2.dir[0], t2.dir[1]], b = [-t8.E[0], t8.E[1]], db = [-t8.dir[0], t8.dir[1]];
    const den = da[0] * db[1] - da[1] * db[0]; let D;
    if (Math.abs(den) < 1e-6) D = [0, (a[1] + b[1]) / 2]; else { const t = ((b[0] - a[0]) * db[1] - (b[1] - a[1]) * db[0]) / den; D = [a[0] + da[0] * t, a[1] + da[1] * t]; }
    const P = q => { const u = cd(SN.hours[0]); return [q[0] * u[0], q[0] * u[1], q[1]]; };   // plane point → 3D
    return { t2, t8, D2: D, D: P(D), P, E2: t2.Eb3, E8: t8.Eb3, S2: t2.E3, S8: t8.E3, I2: t2.I3, I8: t8.I3 };
  }

  // ---------------------------------------------------------------- flap geometry (triangle on the surface: base on the PSL line, apex behind)
  // a = along the meridian behind the PSL, c = circumferential (mm at that s); the base half-arc and the apex distance are solved so that the three
  // straight sides on the curved surface are all SN.flap.side (Guedes 2026: sides 3 mm)
  function flapPt0(hf, a, c, dFrac = 0) { const s = SN.psl + a, rho = G.surfAt(s).rho, h = hf + c / (rho * H2R); return G.P3(h, s, dFrac * G.T(s)); }
  const bis = (f, a, b) => { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; f(m) > 0 ? b = m : a = m; } return (a + b) / 2; };
  const C_HALF = bis(c => len(sub(flapPt0(2, 0, c), flapPt0(2, 0, -c))) - SN.flap.side, 1, 2);
  const H_TRI = bis(a => len(sub(flapPt0(2, a, 0), flapPt0(2, 0, C_HALF))) - SN.flap.side, 1.5, 3.5);
  // point of the flap: a 0 → H_TRI, c scaled so that ±side/2 is the solved base corner
  function flapPt(hf, a, c, dFrac = 0) { return flapPt0(hf, a, c * C_HALF / (SN.flap.side / 2), dFrac); }
  // local coordinates of a wall point relative to the flap at hf: a behind the PSL, c circumferential (mm at the foot), inside < 0
  function triG(hf, s, h, rhoF) { const a = s - SN.psl, c = dH(h, hf) * H2R * rhoF; return Math.max(-a, a - H_TRI, Math.abs(c) - C_HALF * (1 - a / H_TRI)); }
  // the lifted flap: rotate about the hinge (the base edge on the outer surface: the flap folds there) by lift · open
  function flapRot(hf, open) {
    const s0 = SN.psl, Hh = G.P3(hf, s0, 0), n = G.N3(hf, s0), t = G.Ts3(hf, s0), k = unit(cross(n, t)), th = SN.flap.lift * D2R * clamp(open, 0, 1);
    const rot = p => { const v = sub(p, Hh), c = Math.cos(th), sN = Math.sin(th), kv = cross(k, v), kd = dot(k, v); return add(Hh, add(add(v.map(x => x * c), kv, sN), k, kd * (1 - c))); };
    // the apex must swing outward (away from the eye) first; flip the axis if it does not
    const apex = flapPt(hf, H_TRI, 0, 0), test = (() => { const v = sub(apex, Hh), a = 0.2, kv = cross(k, v); return add(Hh, add(add(v.map(x => x * Math.cos(a)), kv, Math.sin(a)), k, dot(k, v) * (1 - Math.cos(a)))); })();
    const out = G.wallOf(test[2], Math.hypot(test[0], test[1])).d < 0;
    if (!out) { k[0] = -k[0]; k[1] = -k[1]; k[2] = -k[2]; }
    return { rot, Hh, k, th };
  }

  // how far the flap at hf is lifted (the 'exposed' error leaves that flap partly open; 示意)
  const fOpen = (c, hf) => !c.flap ? 0 : c.exposed === hf ? Math.max(c.flap.open, 0.35) : c.flap.open;

  // ---------------------------------------------------------------- the MA60AC IOL: rigid pose from the two tie points (haptic distal thirds on the sutures)
  const optHalf = rho => { const I = SN.iol, Ro = I.optic / 2; return I.te / 2 + (I.tc - I.te) / 2 * Math.max(0, 1 - (rho / Ro) ** 2); };
  // canonical haptic (local frame: in-plane x toward its tie, y, w along the optic axis): C-loop from the optic edge; rho peaks at the tie (tieT), the tip curls in
  const HAP = (() => { const I = SN.iol, Ro = I.optic / 2, A = I.overall / 2 - (Ro - 0.12), pts = [];
    for (let k = 0; k <= 40; k++) { const t = k / 40, rho = Ro - 0.12 + A * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, t / I.tieT)), 0.8) - I.curl * ss(I.tieT, 1, t), th = (I.root + I.sweep * Math.pow(t, 0.9)) * D2R;
      pts.push([rho * Math.cos(th), rho * Math.sin(th), Math.max(0, rho - Ro) * Math.tan(I.ang * D2R), t]); }
    const tie = (() => { let b = pts[0]; for (const p of pts) if (Math.abs(p[3] - I.tieT) < Math.abs(b[3] - I.tieT)) b = p; return b; })(), phi = Math.atan2(tie[1], tie[0]);
    const R = pts.map(p => { const c = Math.cos(-phi), s = Math.sin(-phi); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2], p[3]]; });   // tie on +x
    return { pts: R, rTie: Math.hypot(tie[0], tie[1]), Ro, maxR: Math.max(...pts.map(p => Math.hypot(p[0], p[1]))) }; })();
  // free shape (not compressed): overall length and the angle the haptic makes with the optic plane
  const iolFree = () => ({ overall: 2 * HAP.maxR, optic: SN.iol.optic, ang: Math.atan2(HAP.pts[30][2] - HAP.pts[20][2], Math.hypot(HAP.pts[30][0], HAP.pts[30][1]) - Math.hypot(HAP.pts[20][0], HAP.pts[20][1])) / D2R });
  const IOLM = new WeakMap();
  function iolOf(c) {
    if (!c.iol || c.iol.at !== 'eye') return null; if (IOLM.has(c)) return IOLM.get(c);
    const PS = passes(c), io = c.iol, pull = clamp(io.pull, 0, 1), tie = [];
    for (const [j, I3] of [[0, PS.I2], [1, PS.I8]]) { const rad = unit([I3[0], I3[1], 0]), tn = clamp((io.ten || [1, 1])[j] ?? 1, 0, 1) * pull, sl = SN.slack * (1 - tn) + SN.gap;
      let T = add(add(I3, rad, -sl), [0, 0, 1], -0.5 * SN.slack * (1 - tn));   // slack: the haptic hangs inward and back (supine; 示意)
      if (io.slip === SN.hours[j]) T = add(add(I3, rad, -1.0), [0, 0, 1], -SN.fall);   // slipped out of the knot: that haptic falls back (示意)
      tie.push(T); }
    const d = unit(sub(tie[1], tie[0])), Z = [0, 0, 1], en = unit(sub(Z, d.map(v => v * dot(Z, d)))), eb = unit(cross(en, d));
    const rT = len(sub(tie[1], tie[0])) / 2, k = (rT - HAP.Ro) / (HAP.rTie - HAP.Ro), wT = (rT - HAP.Ro) * Math.tan(SN.iol.ang * D2R);
    const O = add(tie[0].map((v, i) => (v + tie[1][i]) / 2), en, -wT);
    // haptic j: local x toward its tie: haptic 0 → −d (toward 2 o'clock), haptic 1 → +d; radii beyond the optic edge scaled by k (compressed / stretched)
    const haps = [0, 1].map(j => { const ex = j === 0 ? d.map(v => -v) : d, ey = j === 0 ? eb.map(v => -v) : eb;
      return HAP.pts.map(p => { const r = Math.hypot(p[0], p[1]), r2 = r <= HAP.Ro ? r : HAP.Ro + (r - HAP.Ro) * k, f = r > 1e-9 ? r2 / r : 1, w = Math.max(0, r2 - HAP.Ro) * Math.tan(SN.iol.ang * D2R);
        return add(add(add(O, ex, p[0] * f), ey, p[1] * f), en, w); }); });
    const toL = p => { const q = sub(p, O); return [dot(q, d), dot(q, eb), dot(q, en)]; };
    const optField = p => { const q = toL(p), r = Math.hypot(q[0], q[1]); return Math.max(r - HAP.Ro, Math.abs(q[2]) - optHalf(r)); };
    const hr = SN.iol.hd / 2, bb = haps.map(H => { let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const p of H) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } return [lo, hi]; });
    const hapField = p => { let f = 1e9; haps.forEach((H, j) => { const [lo, hi] = bb[j]; if (p[0] < lo[0] - 0.4 || p[0] > hi[0] + 0.4 || p[1] < lo[1] - 0.4 || p[1] > hi[1] + 0.4 || p[2] < lo[2] - 0.4 || p[2] > hi[2] + 0.4) return;
      for (let i = 1; i < H.length; i++) { const a = H[i - 1], e = sub(H[i], a), l2 = dot(e, e) || 1, t = clamp(dot(sub(p, a), e) / l2, 0, 1); f = Math.min(f, len(sub(p, add(a, e, t))) - hr); } }); return f; };
    const tieIdx = HAP.pts.findIndex(p => Math.abs(p[3] - SN.iol.tieT) < 0.013);
    const R = { O, en, d, eb, haps, tie, ties: haps.map(H => H[tieIdx]), tieIdx, rT, k, wT, field: p => Math.min(optField(p), hapField(p)), optField, hapField, toL,
      tilt: Math.acos(clamp(en[2], -1, 1)) / D2R, dec: Math.hypot(O[0], O[1]), overall: 2 * (HAP.Ro + (HAP.maxR - HAP.Ro) * k) };
    IOLM.set(c, R); return R;
  }
  // the old, dislocated IOL (type unknown: a generic disc with two C loops; 示意), lying inferiorly in the anterior vitreous; its removal through the
  // 12 o'clock wound is not drawn (spec: only "taken out through the 12 o'clock wound")
  function oldOf(c) {
    if (!c.old) return null; const O = SN.old.c, tl = SN.old.tilt * D2R;
    const ea = [1, 0, 0], en = [0, -Math.sin(tl), Math.cos(tl)], eb = cross(en, ea), Ro = SN.old.r;   // the inferior edge sunk back
    const toL = p => { const q = sub(p, O); return [dot(q, ea), dot(q, eb), dot(q, en)]; };
    const loops = [0, 1].map(j => { const out = []; for (let k = 0; k <= 24; k++) { const t = k / 24, th = (j * 180 + 60 + 100 * t) * D2R, r = Ro - 0.1 + 2.8 * Math.sin(Math.PI / 2 * t);
      out.push(add(add(O, ea, r * Math.cos(th)), eb, r * Math.sin(th))); } return out; });
    const field = p => { const q = toL(p), r = Math.hypot(q[0], q[1]); let f = Math.max(r - Ro, Math.abs(q[2]) - optHalf(r * SN.iol.optic / 2 / Ro));
      for (const H of loops) for (let i = 1; i < H.length; i++) { const a = H[i - 1], e = sub(H[i], a), t = clamp(dot(sub(p, a), e) / (dot(e, e) || 1), 0, 1); f = Math.min(f, len(sub(p, add(a, e, t))) - 0.1); } return f; };
    return { O, en, ea, eb, Ro, loops, field };
  }
  // 12 o'clock wound: outer opening in clear cornea, tunnel to the inner surface (示意)
  function incOf() { const I = SN.inc; return { outer: G.P3(I.h, I.s, 0), inner: G.P3(I.h, I.sIn, G.T(I.sIn)), h: I.h, w: I.w }; }
  // trocars: entry on the surface, cannula along the inward normal (23G), hub outside
  function trocarOf(h) { const s = sAbs(SN.trocar.s, 'psl'), E = G.P3(h, s, 0), n = G.N3(h, s); return { h, s, E, n, tipIn: add(E, n, -3.0), hubOut: add(E, n, 0.6), r: SN.trocar.od / 2 }; }
  // knots (in the flap bed beside the entry; 示意 placement) and the curved needle's bite
  function knotOf(c, j) { const n = c.ndl || {}, hf = SN.hours[j], s = sAbs(j ? n.s8 ?? SN.guedes : n.s2 ?? SN.guedes, n.from || 'psl'), a = s - SN.psl + SN.knot.ds;
    const rho = G.surfAt(SN.psl + a).rho, h = hf + SN.knot.dc / (rho * H2R), sK = SN.psl + a, dB = G.T(sK) * SN.flap.frac;   // bed surface
    return { p: G.P3(h, sK, dB - SN.knot.r), h, s: sK, bed: dB, biteA: G.P3(hf - 0.25 / (rho * H2R), sK + 0.2, dB + 0.12), biteB: G.P3(hf + 0.55 / (rho * H2R), sK + 0.2, dB + 0.12) }; }

  // ---------------------------------------------------------------- the suture as a 3D polyline for the current state (inside and outside the eye)
  function sutureOf(c) {
    const n = c.ndl; if (!n) return null; const PS = passes(c), segs = [];
    const tailOut = (E, h) => { const nn = G.N3(h, G.wallOf(E[2], Math.hypot(E[0], E[1])).s); return add(E, nn, 1.6); };
    const T2 = tailOut(PS.E2, SN.hours[0]), T8 = tailOut(PS.E8, SN.hours[1]);
    const inc = incOf(), outside = add(inc.outer, [0, 2.2, 0.6]);
    const chordMid = [(PS.I2[0] + PS.I8[0]) / 2, (PS.I2[1] + PS.I8[1]) / 2, (PS.I2[2] + PS.I8[2]) / 2];
    if (n.out < 1) {      // the straight needle on its way in (pass) or out through the 27G track (out)
      const tip = n.out > 0 ? null : add(PS.E2, sub(PS.D, PS.E2), clamp(n.pass, 0, 1));
      if (tip) { const back = add(tip, unit(sub(PS.E2, PS.D)), SN.needle.L); segs.push([back, add(back, unit(sub(PS.E2, PS.D)), 2.5), add(back, [0, 0, 1], 3.5)]); }
      else { const path = [PS.D, PS.I8, PS.E8, add(PS.E8, unit(sub(PS.E8, PS.I8)), 14)], Lt = path.slice(1).reduce((a, q, i) => a + len(sub(q, path[i])), 0); let left = Lt * clamp(n.out, 0, 1); const pts = [T2, PS.E2, PS.I2, PS.D];
        for (let i = 1; i < path.length && left > 0; i++) { const l = len(sub(path[i], path[i - 1])); pts.push(l <= left ? path[i] : add(path[i - 1], sub(path[i], path[i - 1]), left / l)); left -= l; } segs.push(pts); }
      return { segs, PS, T2, T8 }; }
    const knotted = (c.knot || 0) > 0.5, K2 = knotOf(c, 0), K8 = knotOf(c, 1);
    const end2 = knotted ? [K2.p, K2.biteB, K2.biteA] : [T2], end8 = knotted ? [K8.p, K8.biteB, K8.biteA] : [T8];
    const IO = iolOf(c);
    if (IO || (c.iol && c.iol.at !== 'eye')) {          // cut and tied to the haptics (or still outside, tied, before the IOL goes in)
      const tieP = IO ? IO.ties : null, outT = c.iol && c.iol.at !== 'eye' ? iolOutside(c) : null, tz = j => tieP ? tieP[j] : outT ? outT.ties[j] : outside;
      const via = j => tieP ? [] : [hookPts(PS, j)[0], hookPts(PS, j)[1], inc.inner, inc.outer];
      segs.push([...end2.slice().reverse(), PS.E2, PS.I2, ...via(0), tz(0)], [...end8.slice().reverse(), PS.E8, PS.I8, ...via(1), tz(1)]);
      return { segs, PS, T2, T8, IO }; }
    if (n.hook > 0) {      // the chord hooked out through the 12 o'clock wound: a loop outside (cut: two ends)
      const k = clamp(n.hook, 0, 1), H2 = hookPts(PS, 0), H8 = hookPts(PS, 1);
      if (k < 0.5) { const Q = add(chordMid, sub([0, 0, IR.pm[1] - 0.25], chordMid), k / 0.5); segs.push([...end2.slice().reverse(), PS.E2, PS.I2, Q, PS.I8, PS.E8, ...end8]); }
      else { const kk = (k - 0.5) / 0.5, loop = add(inc.outer, sub(outside, inc.outer), kk);
        if (n.cut) segs.push([...end2.slice().reverse(), PS.E2, PS.I2, H2[0], H2[1], inc.inner, inc.outer, add(loop, [0.6, 0, 0])], [...end8.slice().reverse(), PS.E8, PS.I8, H8[0], H8[1], inc.inner, inc.outer, add(loop, [-0.6, 0, 0])]);
        else segs.push([...end2.slice().reverse(), PS.E2, PS.I2, H2[0], H2[1], inc.inner, inc.outer, loop, inc.outer, inc.inner, H8[1], H8[0], PS.I8, PS.E8, ...end8]); }
      return { segs, PS, T2, T8 }; }
    const tt = clamp(n.taut, 0, 1), M = add(PS.D, sub(chordMid, PS.D), tt);
    segs.push([...end2.slice().reverse(), PS.E2, PS.I2, M, PS.I8, PS.E8, ...end8]);
    return { segs, PS, T2, T8 };
  }
  // route of a hooked strand from behind the iris into the pupil, then forward into the chamber (示意): B behind the iris plane inside the pupil, C in front
  function hookPts(PS, j) { const h = SN.hours[j], u = cd(h), inc = cd(SN.inc.h), r = IR.pr - 0.9;
    const B = [u[0] * r, u[1] * r, IR.pm[1] - 0.45], Cc = [inc[0] * 1.2 + u[0] * 0.8, inc[1] * 1.2 + u[1] * 0.8, IR.pm[1] + 0.5]; return [B, Cc]; }
  // the IOL outside the eye beyond the wound while the strands are tied to it (enface only; 示意)
  function iolOutside(c) { const inc = incOf(), O = add(inc.outer, [0, 4.6, 1.0]), d = [1, 0, 0], eb = [0, 1, 0], en = [0, 0, 1];
    const haps = [0, 1].map(j => { const ex = j === 0 ? [-1, 0, 0] : d, ey = j === 0 ? [0, -1, 0] : eb; return HAP.pts.map(p => add(add(add(O, ex, p[0]), ey, p[1]), en, p[2])); });
    const tieIdx = HAP.pts.findIndex(p => Math.abs(p[3] - SN.iol.tieT) < 0.013); return { O, haps, ties: haps.map(H => H[tieIdx]), en, d, eb }; }

  // ---------------------------------------------------------------- fields for a state (sections and checks)
  function fieldCtx(c) { return { c, IO: iolOf(c), OLD: oldOf(c), flaps: c.flap ? SN.hours.map(hf => ({ hf })) : [] }; }
  function fieldAt(X, p) {
    const c = X.c, m = G.mer(p), U = uveaAt(m.rho, m.z), W = U.W, s = W.s, d = W.d, T = G.T(s), o = U, h = m.h;
    o.conj = FD.g.conj({ s, d, T, c: 1e3, gap: 0, rhoF: W.rhoF });
    // conjunctiva opened around each fixation hour, from its limbal insertion back (示意 extent)
    if (c.peri > 0) for (const hf of SN.hours) { const cc = Math.abs(dH(h, hf)) * H2R * W.rhoF, half = SN.peri.half * clamp(c.peri, 0, 1) * W.rhoF / G.surfAt(0).rho;
      if (cc < half && s < SN.psl + SN.peri.back) o.conj = Math.max(o.conj, 0.01); }
    // flap tissue lifted out of the wall (the bed stays): 1/3 of the scleral thickness inside the triangle
    o.flapBed = 1;
    if (c.flap) for (const hf of SN.hours) if (fOpen(c, hf) > 0) { const tg = triG(hf, s, h, W.rhoF), reg = Math.max(tg, -d, d - T * SN.flap.frac);
      if (c.flap.cut > 0.5) { o.sclera = Math.max(o.sclera, -reg); o.limbus = Math.max(o.limbus, -reg); } }
    o.gel = Math.max(o.interior, SN.gel.skirt * clamp(c.vit, 0, 1) - len(p), p[2] - (SULC.apex[1] - SN.gel.hy), Math.min(PE + SN.gel.base - s, len(p) - SN.gel.core), -o.cbody, -o.proc, -o.iris, -o.retina);
    o.iol = X.IO ? X.IO.field(p) : 1; o.old = X.OLD ? X.OLD.field(p) : 1;
    return o;
  }
  const layersFn = st => { const c = norm(st), X = fieldCtx(c); return p => fieldAt(X, p); };

  // ---------------------------------------------------------------- colours
  const C = Object.assign({}, G.C, { cil: '#8a5a41', cilS: '#6b432f', proc: '#b0775c', out: '#d6dce1', bss: '#eaf5fb', gel: '#e2e9db', iol: '#f6f1cf', iolS: '#a8963c', hap: '#4f7fb3',
    pro: '#1f2a44', needle: '#6d7782', needleS: '#3b434c', g27: '#c3cad2', mark: '#6a3fb0', knot: '#111827', bed: '#efe7da', flap: '#fbf8f2', flapS: '#9aaab7', old: '#e8e4d6', oldS: '#8b8466', hub: '#d7dde3', hubS: '#5e6973' });

  // ---------------------------------------------------------------- section
  const SEC = new Map();
  const LAYERS = ['interior', 'gel', 'retina', 'choroid', 'cbody', 'proc', 'iris', 'old', 'iol', 'sclera', 'limbus', 'cornea', 'conj'];
  function sectionTissue(c, hp, win, step) {
    const pl = G.planes.meridian(hp), X = fieldCtx(c), nx = Math.ceil(win.w / step) + 1, ny = Math.ceil(win.h / step) + 1, n = nx * ny, V = {};
    LAYERS.forEach(k => V[k] = new Float64Array(n));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i, o = fieldAt(X, G.onPlane(pl, win.x + i * step, win.y + j * step)); for (const nm of LAYERS) V[nm][k] = o[nm]; }
    const layer = (name, fill, stroke, sw = 0.9, extra = '') => { const v = V[name]; let any = false; for (let k = 0; k < n; k++) if (v[k] < 0) { any = true; break; } if (!any) return '';
      return `<path d="${G.contour(v, nx, ny, win.x, win.y, step).map(l => 'M' + l.map(F).join('L') + 'Z').join('')}" fill="${fill}" fill-rule="evenodd" ${stroke ? `stroke="${stroke}" stroke-width="${sw}" ${NS}` : ''} ${extra}/>`; };
    const o = [`<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="${C.out}"/>`];   // a shade darker than GLOBE's: bare white sclera must show against it
    o.push(layer('interior', C.bss), layer('gel', C.gel, null), layer('retina', C.ret), layer('choroid', C.chor), layer('cbody', C.cil, C.cilS, 0.6), layer('proc', C.proc, C.cilS, 0.6));
    o.push(layer('iris', C.iris, C.irisS, 0.6), layer('old', C.old, C.oldS, 0.8, 'opacity="0.9"'), layer('iol', C.iol, C.iolS, 0.9));
    o.push(layer('sclera', C.sclera, C.scleraS), layer('limbus', C.limb, null), layer('cornea', C.cornea, C.corneaS), layer('conj', C.conj, C.conjS, 0.6));
    return { svg: o.join(''), pl };
  }
  const CLS_COL = { sulcus: '#1d8a4a', plicata: '#b0562a', plana: '#4f6478', iris: '#c0392b', angle: '#c0392b' };   // what a needle reached (pins)
  const rodSec = (A, B, r, col = C.needle, colS = C.needleS) => `<path d="M${F(A)}L${F(B)}" stroke="${colS}" stroke-width="${(2 * r + 0.05).toFixed(3)}" stroke-linecap="round"/><path d="M${F(A)}L${F(B)}" stroke="${col}" stroke-width="${(2 * r).toFixed(3)}" stroke-linecap="round"/>`;
  function section(opt) {
    const st = opt.st || {}, c = norm(st), hp = opt.h ?? SN.hours[0], win = opt.win, step = opt.step || 0.03, key = JSON.stringify([hp, win, step, c.vit, c.peri, c.flap, c.exposed, c.iol, c.ndl, c.old]);
    let tis = SEC.get(key); if (!tis) { tis = sectionTissue(c, hp, win, step); if (SEC.size > 40) SEC.delete(SEC.keys().next().value); SEC.set(key, tis); }
    const pl = tis.pl, P2 = p => G.toPlane(pl, p), o = [tis.svg], A = {}, nrm = [pl.U[1], -pl.U[0], 0], off = p => dot(sub(p, pl.O), nrm);
    const inPlane = h => [hp, hp + 6].some(x => Math.abs(dH(h, x)) < 0.02);
    // lifted flaps (in this plane): the strip through the flap's axis, rotated about the hinge; the closed flap shows as a cut line
    if (c.flap) for (const hf of SN.hours) if (inPlane(hf)) { const op = fOpen(c, hf), R = flapRot(hf, op), strip = [];
      for (let k = 0; k <= 20; k++) strip.push(flapPt(hf, H_TRI * k / 20, 0, 0)); for (let k = 20; k >= 0; k--) strip.push(flapPt(hf, H_TRI * k / 20, 0, SN.flap.frac));
      if (op > 0 && c.flap.cut > 0.5) { const q = strip.map(p => P2(R.rot(p)));
        // the base stays attached through its whole thickness: the bend at the hinge is the sector swept by the base's bottom edge about the pivot
        const bend = [P2(R.Hh)]; for (let k = 0; k <= 12; k++) bend.push(P2(flapRot(hf, op * k / 12).rot(flapPt(hf, 0, 0, SN.flap.frac))));
        o.push(`<path d="M${bend.map(F).join('L')}Z" fill="${C.flap}"/><path d="M${q.map(F).join('L')}Z" fill="${C.flap}" stroke="${C.flapS}" stroke-width="0.9" ${NS}/>`);
        o.push(`<path d="M${bend.slice(1).map(F).join('L')}" fill="none" stroke="${C.flapS}" stroke-width="0.9" ${NS}/>`); A['flapTip' + hf] = P2(R.rot(flapPt(hf, H_TRI, 0, 0))); }
      else if (c.flap.cut > 0) { const q = []; for (let k = 0; k <= 20; k++) q.push(P2(flapPt(hf, H_TRI * k / 20 * clamp(c.flap.cut, 0, 1), 0, SN.flap.frac))); o.push(`<path d="M${q.map(F).join('L')}" fill="none" stroke="#8a97a3" stroke-width="0.9" stroke-dasharray="2 1.5" ${NS}/>`); }
      A['hinge' + hf] = P2(flapPt(hf, 0, 0, SN.flap.frac)); A['bedEnd' + hf] = P2(flapPt(hf, H_TRI, 0, SN.flap.frac)); }
    // IOL haptics: projection onto the plane (faint, dashed: they are mostly out of this plane) and the tie knots on them
    const IO = iolOf(c);
    if (IO) { for (const H of IO.haps) o.push(`<path d="M${H.map(p => F(P2(p))).join('L')}" fill="none" stroke="${C.iolS}" stroke-width="1" stroke-dasharray="2.5 2" opacity="0.6" ${NS}/>`);
      IO.ties.forEach((q, j) => { const t = P2(q); o.push(`<circle cx="${t[0].toFixed(4)}" cy="${t[1].toFixed(4)}" r="0.09" fill="${C.knot}" stroke="#fff" stroke-width="0.7" ${NS}/>`); A['tie' + SN.hours[j]] = t; });
      A.iolC = P2(IO.O); A.optEdgeL = P2(add(IO.O, IO.d, -HAP.Ro + 0.05)); A.optEdgeR = P2(add(IO.O, IO.d, HAP.Ro - 0.05)); A.IO = IO; }
    // trocars cut by this plane
    if (c.trocar) for (const h of SN.trocar.hours) if (inPlane(h)) { const T = trocarOf(h); o.push(rodSec(P2(T.tipIn), P2(T.hubOut), T.r, C.hub, C.hubS)); A['trocar' + h] = P2(T.E); }
    // the 12 o'clock wound (in a 12–6 plane)
    if (c.inc > 0 && inPlane(SN.inc.h)) { const I = incOf(); o.push(`<path d="M${F(P2(I.outer))}L${F(P2(I.inner))}" stroke="#3c4a57" stroke-width="1.3" ${NS}/>`); A.incOuter = P2(I.outer); A.incInner = P2(I.inner); }
    // perpendicular test needles (pins) and their landing points
    // (drawn thin, 示意; the tip stops just past where the needle leaves the uvea, and a dot coloured by what it reached marks that spot)
    c.pins.forEach((pn, i) => { if (!inPlane(pn.h)) return; const tr = track(pn.h, sAbs(pn.mm, pn.from), 'perp'), tip = tr.at(tr.tI + 0.06);
      const P = q => P2(tr.to3(q)), ex = P(tr.I), col = CLS_COL[tr.cls] || '#333'; o.push(rodSec(P(tip), P(tr.at(-0.3)), 0.04));
      o.push(`<circle cx="${ex[0].toFixed(4)}" cy="${ex[1].toFixed(4)}" r="0.055" fill="${col}" stroke="#fff" stroke-width="1" ${NS}/>`);
      A['pin' + i] = P(tr.E); A['pinTip' + i] = P(tip); A['pinExit' + i] = ex; A['pinCls' + i] = tr.cls; });
    // needles, the 27G needle, the suture
    const n = c.ndl, PS = n ? passes(c) : null;
    if (n) { A.E2 = P2(PS.E2); A.E8 = P2(PS.E8); A.I2 = P2(PS.I2); A.I8 = P2(PS.I8); A.D = P2(PS.D); A.cls2 = PS.t2.cls; A.cls8 = PS.t8.cls;
      if (n.g27 > 0 && n.out < 1) { const tipG = add(PS.E8, sub(PS.D, PS.E8), clamp(n.g27, 0, 1)), back = add(PS.E8, unit(sub(PS.E8, PS.D)), 9); o.push(rodSec(P2(tipG), P2(back), SN.g27 / 2, C.g27, C.hubS)); A.g27tip = P2(tipG); }
      if (n.out < 1) { const along = n.out > 0 ? null : add(PS.E2, sub(PS.D, PS.E2), clamp(n.pass, 0, 1));
        if (along) { const back = add(along, unit(sub(PS.E2, PS.D)), SN.needle.L); o.push(rodSec(P2(along), P2(back), SN.needle.od / 2)); A.ntip = P2(along); } } }
    const SU = sutureOf(c);
    if (SU) for (const pts of SU.segs) { const q = pts.map(p => P2(p)), far = pts.some(p => Math.abs(off(p)) > 0.6); const d = 'M' + q.map(F).join('L');
      o.push(`<path d="${d}" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" stroke-linejoin="round" ${NS}/><path d="${d}" fill="none" stroke="${C.pro}" stroke-width="1.5" stroke-linejoin="round" ${far ? 'stroke-dasharray="4 2"' : ''} ${NS}/>`); }
    // knots in the beds
    if (c.knot > 0.5 && n) [0, 1].forEach(j => { const K = knotOf(c, j); if (!inPlane(SN.hours[j]) && Math.abs(off(K.p)) > 0.6) return; const q = P2(K.p); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${SN.knot.r}" fill="${C.knot}" stroke="#fff" stroke-width="0.7" ${NS}/>`); A['knot' + SN.hours[j]] = q; });
    // anchors on the outer surface along the plane's right-hand meridian (hp) and its left (hp + 6)
    for (const [nm, h] of [['', hp], ['L', hp + 6]]) { const S2 = s => P2(G.P3(h, s, 0));
      A['vis' + nm] = S2(0); A['psl' + nm] = S2(SN.psl); A['sul' + nm] = S2(SUL); A['pe' + nm] = S2(PE); A['ora' + nm] = S2(ORA);
      A['apex' + nm] = P2([SULC.apex[0] * cd(h)[0], SULC.apex[0] * cd(h)[1], SULC.apex[1]]); A['root' + nm] = P2([IR.root[0] * cd(h)[0], IR.root[0] * cd(h)[1], IR.root[1]]);
      A['pm' + nm] = P2([IR.pm[0] * cd(h)[0], IR.pm[0] * cd(h)[1], IR.pm[1]]);
      A['procMid' + nm] = P2((() => { const q = mz((P0 + PE) / 2 - 0.4, baseM((P0 + PE) / 2 - 0.4) + procH((P0 + PE) / 2 - 0.4) * 0.6); return [q[0] * cd(h)[0], q[0] * cd(h)[1], q[1]]; })());
      A['plana' + nm] = P2((() => { const q = mz((PE + ORA) / 2, baseM((PE + ORA) / 2) * 0.5); return [q[0] * cd(h)[0], q[0] * cd(h)[1], q[1]]; })()); }
    const OL = oldOf(c); if (OL) A.old = P2(OL.O);
    A.gel = P2(G.P3(hp, ORA + 0.6, G.T(ORA + 0.6) + 0.95));
    return { svg: o.join(''), A, pl };
  }
  // ruler ticks along clock h on the surface: [{ mm, p (3D), n (outward normal) }] from the PSL (or the visible limbus)
  const ticks = (h, list, from = 'psl') => list.map(mm => { const s = sAbs(mm, from); return { mm, s, p: G.P3(h, s, 0), n: G.N3(h, s) }; });

  // ---------------------------------------------------------------- microscope view (OD; surgeon at 12 by default)
  function enface(opt) {
    const st = opt.st || {}, c = norm(st), id = opt.id || 'sf', M = G.enfaceMap(opt.surgeon ?? 12), o = [], A = {}, rhoL = G.surfAt(0).rho, ctr = M([0, 0, 0]), pr = IR.pr;
    const ring = r => { const pts = []; for (let k = 0; k < 180; k++) { const t = 2 * Math.PI * k / 180; pts.push(M([r * Math.sin(t), r * Math.cos(t), 0])); } return 'M' + pts.map(F).join('L') + 'Z'; };
    const Pf = (h, s, d = 0) => M(G.P3(h, s, d));
    o.push(`<defs><radialGradient id="${id}_sc" cx="${ctr[0]}" cy="${ctr[1]}" r="13" gradientUnits="userSpaceOnUse"><stop offset="0.42" stop-color="#fbf6f3"/><stop offset="0.75" stop-color="#f6e3e0"/><stop offset="1" stop-color="#eccfcb"/></radialGradient>` +
      `<radialGradient id="${id}_ir" cx="${ctr[0]}" cy="${ctr[1]}" r="${rhoL}" gradientUnits="userSpaceOnUse"><stop offset="${(pr / rhoL).toFixed(3)}" stop-color="#2e1a0f"/><stop offset="${((pr / rhoL + 1) / 2).toFixed(3)}" stop-color="#6d4329"/><stop offset="0.93" stop-color="#5a3622"/><stop offset="1" stop-color="#8f8a86"/></radialGradient>` +
      `<radialGradient id="${id}_rr" cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f8b06e"/><stop offset="0.5" stop-color="#e8743a"/><stop offset="0.85" stop-color="#bd4222"/><stop offset="1" stop-color="#6a1c0d"/></radialGradient>` +
      `<clipPath id="${id}_pup"><circle cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}"/></clipPath></defs>`);
    o.push(`<rect x="-30" y="-30" width="60" height="60" fill="url(#${id}_sc)"/>`);
    for (let k = 0; k < 26; k++) { const h0 = 12 * G.hash(k, 1), r0 = rhoL + 0.6 + 2.5 * G.hash(k, 2), pts = [];
      for (let j = 0; j <= 12; j++) { const r = r0 + j * 0.65, hh = h0 + 0.18 * Math.sin(j * 0.9 + k) * (1 + G.hash(k, 3)); pts.push(M([r * cd(hh)[0], r * cd(hh)[1], 0])); }
      o.push(`<path d="M${pts.map(F).join('L')}" fill="none" stroke="#c8565c" stroke-width="${(0.6 + 0.8 * G.hash(k, 4)).toFixed(2)}" opacity="0.45" ${NS}/>`); }
    // conjunctiva opened at the fixation hours: bare sclera, the cut edge rolled back
    if (c.peri > 0) for (const hf of SN.hours) { const half = SN.peri.half * clamp(c.peri, 0, 1), back = SN.psl + SN.peri.back, hw = (cc, s) => hf + cc / (G.surfAt(s).rho * H2R) * G.surfAt(s).rho / rhoL, pts = [];
      for (let k = 0; k <= 20; k++) pts.push(Pf(hw(lerp(-half, half, k / 20), 0.25), 0.25)); for (let k = 0; k <= 20; k++) pts.push(Pf(hw(lerp(half, -half, k / 20), back), back));
      o.push(`<path d="M${pts.map(F).join('L')}Z" fill="#f7f4ee" stroke="#d9c9c0" stroke-width="0.8" ${NS}/>`);
      const roll = []; for (let k = 0; k <= 20; k++) roll.push(Pf(hw(lerp(-half, half, k / 20), back + 0.25), back + 0.25));
      o.push(`<path d="M${roll.map(F).join('L')}" fill="none" stroke="#e8aeb1" stroke-width="5" stroke-linecap="round" ${NS}/><path d="M${roll.map(F).join('L')}" fill="none" stroke="#cf8f93" stroke-width="1" ${NS}/>`);
      A['peri' + hf] = Pf(hf, back); }
    // iris and the dilated pupil with the aphakic red reflex; the limbal band and the PSL line
    o.push(`<path d="${ring(rhoL - 0.05)}" fill="url(#${id}_ir)"/>`);
    for (let k = 0; k < 90; k++) { const h = k * 12 / 90 + 0.05 * G.hash(k, 5), r0 = pr + 0.2, r1 = rhoL - 0.4 - 0.5 * G.hash(k, 6), a = M([r0 * cd(h)[0], r0 * cd(h)[1], 0]), b = M([r1 * cd(h + 0.06)[0], r1 * cd(h + 0.06)[1], 0]);
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="${G.hash(k, 7) > 0.5 ? '#8a5a3a' : '#2e1a0f'}" stroke-width="0.7" opacity="0.45" ${NS}/>`); }
    o.push(`<circle cx="${ctr[0]}" cy="${ctr[1]}" r="${pr}" fill="url(#${id}_rr)"/>`);
    const rS = G.surfAt(SN.psl).rho;
    o.push(`<path d="${ring(rhoL + 0.02)}${ring(rhoL - 0.45)}" fill="#c9d3d9" fill-rule="evenodd" opacity="0.55"/>`, `<path d="${ring(rS)}${ring(rhoL)}" fill="#e2e9ee" fill-rule="evenodd" opacity="0.85"/>`);
    o.push(`<path d="${ring(rhoL)}" fill="none" stroke="#9fb1bd" stroke-width="1" ${NS}/><path d="${ring(rS)}" fill="none" stroke="#7d8e9b" stroke-width="0.9" stroke-dasharray="3 2" ${NS}/>`);
    A.limbusR = rhoL; A.pslR = rS; A.centre = ctr;
    // visibility of a 3D point from the microscope: outside the eye, in the anterior chamber, or behind the iris inside the pupil
    // (inside the wall only the clear cornea lets it through; inside the eye: the chamber, or the pupil)
    const seen = p => { const W = G.wallOf(p[2], Math.hypot(p[0], p[1])); if (W.d <= 0.02) return true; if (W.d < G.T(W.s)) return W.s < 0; const r = Math.hypot(p[0], p[1]); if (r <= pr - 0.02) return true; return acTest(r, p[2]); };
    const runs = (pts, cb) => { const fine = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(len(sub(b, a)) / 0.1)); for (let k = i === 1 ? 0 : 1; k <= n; k++) fine.push(add(a, sub(b, a), k / n)); }
      let cur = [], v = null; for (const p of fine) { const s = seen(p); if (v !== null && s !== v) { cur.push(p); cb(cur, v); cur = [p]; } else cur.push(p); v = s; } if (cur.length > 1) cb(cur, v); };
    // old IOL behind the iris (seen through the pupil only)
    const OL = oldOf(c);
    if (OL) { const rim = []; for (let k = 0; k <= 72; k++) { const t = 2 * Math.PI * k / 72; rim.push(add(add(OL.O, OL.ea, OL.Ro * Math.cos(t)), OL.eb, OL.Ro * Math.sin(t))); }
      const draw = pts => runs(pts, (q, v) => o.push(`<path d="M${q.map(p => F(M(p))).join('L')}" fill="none" stroke="${v ? '#f3ead2' : '#c9bfa6'}" stroke-width="${v ? 1.4 : 0.9}" ${v ? '' : 'stroke-dasharray="2 2" opacity="0.6"'} ${NS}/>`));
      o.push(`<g clip-path="url(#${id}_pup)"><path d="M${rim.map(p => F(M(p))).join('L')}Z" fill="#fff4d6" opacity="0.28"/></g>`); draw(rim); OL.loops.forEach(draw); A.old = M(OL.O); }
    // the MA60AC: optic in the pupil, haptics behind the iris (dashed where hidden)
    const IO = iolOf(c);
    if (IO) { const rim = []; for (let k = 0; k <= 96; k++) { const t = 2 * Math.PI * k / 96; rim.push(add(add(IO.O, IO.d, HAP.Ro * Math.cos(t)), IO.eb, HAP.Ro * Math.sin(t))); }
      o.push(`<g clip-path="url(#${id}_pup)"><path d="M${rim.map(p => F(M(p))).join('L')}Z" fill="#fff6dc" opacity="0.3"/><path d="M${rim.map(p => F(M(p))).join('L')}Z" fill="none" stroke="#fff3cf" stroke-width="1.6" ${NS}/></g>`);
      for (const H of IO.haps) runs(H, (q, v) => o.push(`<path d="M${q.map(p => F(M(p))).join('L')}" fill="none" stroke="${v ? C.hap : '#9bb4cf'}" stroke-width="${v ? 1.6 : 1.1}" ${v ? '' : 'stroke-dasharray="3 2" opacity="0.75"'} ${NS}/>`));
      IO.ties.forEach((q, j) => { const t = M(q); o.push(`<circle cx="${t[0].toFixed(4)}" cy="${t[1].toFixed(4)}" r="0.12" fill="${C.knot}" opacity="${seen(q) ? 0.8 : 0.3}"/>`); A['tie' + SN.hours[j]] = t; });   // behind the iris: faint
      A.iolC = M(IO.O); A.hapTip0 = M(IO.haps[0][IO.haps[0].length - 1]); A.hapTip1 = M(IO.haps[1][IO.haps[1].length - 1]); }
    if (c.iol && c.iol.at !== 'eye') { const OT = iolOutside(c), rim = []; for (let k = 0; k <= 96; k++) { const t = 2 * Math.PI * k / 96; rim.push(add(add(OT.O, OT.d, HAP.Ro * Math.cos(t)), OT.eb, HAP.Ro * Math.sin(t))); }
      o.push(`<path d="M${rim.map(p => F(M(p))).join('L')}Z" fill="#fffbe8" opacity="0.85" stroke="${C.iolS}" stroke-width="1.2" ${NS}/>`);
      for (const H of OT.haps) o.push(`<path d="M${H.map(p => F(M(p))).join('L')}" fill="none" stroke="${C.hap}" stroke-width="1.6" ${NS}/>`); A.iolOut = M(OT.O); OT.ties.forEach((q, j) => A['tieOut' + SN.hours[j]] = M(q)); }
    // toric-marker dots on the limbus at 2 and 8 (180° apart), drawn under the flaps (a lifted flap folds over them)
    if (c.marks) SN.hours.forEach(hf => { const a = Pf(hf, 0.15); o.push(`<circle cx="${a[0].toFixed(4)}" cy="${a[1].toFixed(4)}" r="0.22" fill="${C.mark}" opacity="0.85"/>`); A['mark' + hf] = a; });
    // flaps: bed (slightly darker, 2/3 thickness left) and the lifted flap folded toward the cornea; a closed flap shows its cut outline
    if (c.flap) for (const hf of SN.hours) { const tri = (dF, rot) => { const pts = []; const P = (a, cc) => { const q = flapPt(hf, a, cc, dF); return rot ? rot(q) : q; };
        for (let k = 0; k <= 12; k++) pts.push(P(0, lerp(-SN.flap.side / 2, SN.flap.side / 2, k / 12))); for (let k = 1; k <= 12; k++) pts.push(P(H_TRI * k / 12, SN.flap.side / 2 * (1 - k / 12))); for (let k = 1; k < 12; k++) pts.push(P(H_TRI * (1 - k / 12), -SN.flap.side / 2 * k / 12)); return pts; };
      const cut = clamp(c.flap.cut, 0, 1), open = fOpen(c, hf);
      if (open > 0 && cut > 0.5) { const R = flapRot(hf, open), bed = tri(SN.flap.frac).map(M), fl = tri(0, R.rot).map(M);
        o.push(`<path d="M${bed.map(F).join('L')}Z" fill="${C.bed}" stroke="#b9a99a" stroke-width="0.9" ${NS}/>`, `<path d="M${fl.map(F).join('L')}Z" fill="${C.flap}" stroke="${C.flapS}" stroke-width="1" opacity="0.95" ${NS}/>`);
        A['flap' + hf] = M(R.rot(flapPt(hf, H_TRI * 0.6, 0, 0))); A['bed' + hf] = M(flapPt(hf, H_TRI * 0.55, 0, SN.flap.frac)); }
      else { const pts = tri(0).map(M), n = Math.max(2, Math.round(pts.length * cut)); o.push(`<path d="M${pts.slice(0, n).map(F).join('L')}${cut >= 1 ? 'Z' : ''}" fill="none" stroke="#9d8f84" stroke-width="1" ${NS}/>`); A['flap' + hf] = M(flapPt(hf, H_TRI * 0.55, 0, 0)); }
      A['hinge' + hf] = M(flapPt(hf, 0, 0, 0)); A['apex' + hf] = M(flapPt(hf, H_TRI, 0, 0)); }
    // caliper (marking pen) dots at the needle entries, measured from the PSL
    if (c.marks) { const n = c.ndl || { s2: SN.guedes, s8: SN.guedes, from: 'psl' };
      SN.hours.forEach((hf, j) => { const b = Pf(hf, sAbs(j ? n.s8 : n.s2, n.from || 'psl'));
        o.push(`<circle cx="${b[0].toFixed(4)}" cy="${b[1].toFixed(4)}" r="0.16" fill="${C.mark}" opacity="0.9"/>`); A['dot' + hf] = b; }); }
    // 12 o'clock wound
    if (c.inc > 0) { const I = SN.inc, half = I.w / 2 / (G.surfAt(I.s).rho * H2R), a = Pf(I.h - half * c.inc, I.s), b = Pf(I.h + half * c.inc, I.s);
      o.push(`<path d="M${F(a)}L${F(b)}" stroke="#eef3f6" stroke-width="3.2" stroke-linecap="round" ${NS}/><path d="M${F(a)}L${F(b)}" stroke="#7e8f9c" stroke-width="1.2" stroke-linecap="round" ${NS}/>`); A.inc = Pf(I.h, I.s); }
    // trocars (23G cannula hubs; the 7 o'clock one carries the infusion line)
    if (c.trocar) for (const h of SN.trocar.hours) { const T = trocarOf(h), q = M(T.E), hr = SN.trocar.hub;
      if (h === SN.trocar.hours[0]) { const out = M(add(T.E, [cd(h)[0] * 6, cd(h)[1] * 6, 1.5])); o.push(`<path d="M${F(q)}L${F(out)}" stroke="#c9d6df" stroke-width="5" stroke-linecap="round" ${NS}/><path d="M${F(q)}L${F(out)}" stroke="#8fa4b3" stroke-width="1" ${NS}/>`); }
      o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${hr}" fill="${C.hub}" stroke="${C.hubS}" stroke-width="1" ${NS}/><circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="${SN.trocar.od / 2}" fill="#3d4650"/>`); A['trocar' + h] = q; }
    // needles, the suture (dashed where hidden behind the iris), knots
    const n = c.ndl, PS = n ? passes(c) : null;
    const rod = (a, b, w, col) => runs([a, b], (q, v) => o.push(`<path d="M${F(M(q[0]))}L${F(M(q[q.length - 1]))}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${v ? '' : 'stroke-dasharray="3 2" opacity="0.55"'} ${NS}/>`));
    if (n) { A.E2 = M(PS.E2); A.E8 = M(PS.E8); A.D = M(PS.D);
      if (n.g27 > 0 && n.out < 1) { const tipG = add(PS.E8, sub(PS.D, PS.E8), clamp(n.g27, 0, 1)), back = add(PS.E8, unit(sub(PS.E8, PS.D)), 9); rod(tipG, back, 2.6, C.hubS); rod(tipG, back, 1.8, C.g27); A.g27tip = M(tipG); }
      if (n.out < 1 && !(n.out > 0)) { const tip = add(PS.E2, sub(PS.D, PS.E2), clamp(n.pass, 0, 1)), back = add(tip, unit(sub(PS.E2, PS.D)), SN.needle.L); rod(tip, back, 1.6, C.needleS); rod(tip, back, 1.0, '#cfd6dd'); A.ntip = M(tip); } }
    const SU = sutureOf(c);
    if (SU) for (const pts of SU.segs) runs(pts, (q, v) => { const d = 'M' + q.map(p => F(M(p))).join('L'); o.push(v ? `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.6" opacity="0.7" ${NS}/><path d="${d}" fill="none" stroke="${C.pro}" stroke-width="1.3" ${NS}/>` : `<path d="${d}" fill="none" stroke="${C.pro}" stroke-width="1" stroke-dasharray="3 2" opacity="0.5" ${NS}/>`); });
    if (n && c.knot > 0.5) [0, 1].forEach(j => { const K = knotOf(c, j), q = M(K.p), covered = coveredKnot(c, j); o.push(`<circle cx="${q[0].toFixed(4)}" cy="${q[1].toFixed(4)}" r="0.16" fill="${C.knot}" ${covered ? 'opacity="0.35"' : ''}/>`); A['knot' + SN.hours[j]] = q; A['knotCovered' + SN.hours[j]] = covered; });
    // a closed flap drawn over its knot (the knot shows through faintly)
    A.M = M;
    return { svg: o.join(''), A, M };
  }
  // a knot is covered when its flap is closed over it (cut, not lifted), the knot inside the triangle and wholly below the outer surface — the 'exposed'
  // error leaves that flap partly open (示意)
  function coveredKnot(c, j) { const K = knotOf(c, j), hf = SN.hours[j], W = G.wallOf(K.p[2], Math.hypot(K.p[0], K.p[1])), inTri = triG(hf, W.s, G.clockOf(K.p[0], K.p[1]), W.rhoF) < -0.05;
    return !!c.flap && c.flap.cut > 0.5 && fOpen(c, hf) < 0.01 && inTri && W.d - SN.knot.r > 0 && W.d + SN.knot.r <= G.T(W.s) * SN.flap.frac + 1e-6; }

  // ---------------------------------------------------------------- landing table (Duffey mapping): what a needle perpendicular to the sclera reaches
  const classify = (h, mm, from = 'psl', aim = 'perp') => track(h, sAbs(mm, from), aim);
  return { SN, SUL, PE, ORA, P0, H_TRI, DIVE, IR, SULC, HAP, sAbs, baseM, procH, mz, irisG, irisZ, acTest, uveaAt, track, classify, passes, flapPt, triG, flapRot, iolOf, iolFree, oldOf, incOf, trocarOf, knotOf,
    sutureOf, hookPts, coveredKnot, fOpen, norm, layersFn, CLS_COL, section, enface, ticks, optHalf, dH, C };
}
const SFIX = typeof GLOBE !== 'undefined' ? SFIX_MAKE(GLOBE) : null;
if (typeof module !== 'undefined') module.exports = SFIX_MAKE;
