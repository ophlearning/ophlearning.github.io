// Self-check for the globe (anterior segment) model: node check.js   (run from this folder; no browser needed)
// GLOBE_PATH=<file> runs the same checks on another copy of globe.js (used to break a value on purpose and see the check fail).
global.document = { createElement: () => ({}) };
const G = require(process.env.GLOBE_PATH || './globe.js');
const LID = require('../eyelid/lid.js');
const { N, T, surfAt, wallOf, P3, enface, enfaceMap, suturePath, gapAt, section, planes, makeField, keyPoints, D2R } = G;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const W = { h: 10, s0: -3.5, s1: 4.0 };                                   // the zone I–II laceration used by the first video

// 1. one globe: the outer surface equals the eyelid model's (eyelid sagittal: anterior = −x)
{ let worst = 0; for (let a = 0; a <= 120; a += 0.5) { const p = G.prof(a * D2R), q = LID.gp(Math.PI - a * D2R); worst = Math.max(worst, Math.hypot(-p[0] - q[0], p[1] - q[1])); }
  ok(worst < 1e-6, `outer surface = eyelid model's globe (max difference ${worst.toExponential(1)} mm)`); }
// 2. corneal diameter within 1 SD of Chinese adults' white-to-white 11.75 ± 0.40 (Fu 2015)
{ const d = 2 * surfAt(0).rho; ok(Math.abs(d - 11.75) <= 0.40, `corneal diameter ${d.toFixed(2)} mm within 11.75 ± 0.40 (Fu 2015)`); }
// 3. wall thickness at the sourced points
for (const [s, v, src] of [[G.S_APEX, 0.54, 'CCT, Zheng 2008 / Chua 2014'], [G.S_R3, 0.62, '3 mm from the apex, Zheng 2008'], [0, 0.53, 'limbus, Olsen 1998'], [N.ora, 0.43, 'ora, Vurgese 2012']])
  ok(near(T(s), v, 0.005), `wall at s ${s.toFixed(2)}: ${T(s).toFixed(3)} mm ≈ ${v} (${src})`);
ok(near(surfAt(G.S_R3).rho, 3, 0.01), `S_R3 is 3 mm from the optical axis (${surfAt(G.S_R3).rho.toFixed(3)})`);
// 4. anterior chamber depth from the epithelium 2.96 (Fu 2015)
ok(near(keyPoints({}).acd, 2.96, 0.005), `ACD from the epithelium ${keyPoints({}).acd.toFixed(3)} mm ≈ 2.96 (Fu 2015)`);
// 5. tissue boundaries along the wall: clear cornea before the limbus, limbal band to the spur (0.85, Le 2018), ciliary body from the spur to the ora (6.2, Liu 2014)
{ const fd = makeField({}), at = (s, f) => { const p = P3(10, s, f * T(s)); return fd.wall(p); };
  ok(fd.g.cornea(at(-0.3, 0.5)) < 0 && fd.g.limbus(at(-0.3, 0.5)) > 0, 'mid-wall 0.3 mm inside the limbus is cornea');
  ok(fd.g.limbus(at(0.5, 0.5)) < 0, 'mid-wall 0.5 mm behind the limbus is the limbal band');
  ok(fd.g.sclera(at(0.85 + 0.1, 0.5)) < 0 && fd.g.sclera(at(0.85 - 0.1, 0.5)) > 0, 'sclera begins at the scleral spur, 0.85 mm behind the limbus (Le 2018, superotemporal)');
  const under = s => fd.wall(P3(10, s, T(s) + 0.1));
  ok(fd.g.ciliary(under(0.85 + 0.3)) < 0 && fd.g.ciliary(under(6.2 - 0.2)) < 0 && fd.g.ciliary(under(6.2 + 0.2)) > 0, 'ciliary body under the sclera from the spur to the ora 6.2 mm (Liu 2014)');
  ok(fd.g.choroid(under(6.2 + 0.2)) < 0, 'choroid begins at the ora');
  ok(N.zone2 === 5 && fd.g.ciliary(under(5)) < 0, 'zone II ends 5 mm behind the limbus (Pieramici 1997), over the ciliary body');
  ok(N.zone2 < 6.40, 'zone II ends in front of the lateral (6.40) and superior (6.78) rectus insertions (Kim 2024)'); }
// 6. orientation of the microscope view: surgeon at 12 → 12 o'clock at the bottom, temporal (9, right eye) on the right
{ const M = enfaceMap(12), v = h => M(P3(h, 0)); const b = v(12), r = v(9), l = v(3), t = v(6);
  ok(b[1] > 5 && Math.abs(b[0]) < 1e-6, `surgeon at 12: 12 o'clock at the bottom (${b.map(x => x.toFixed(2))})`);
  ok(r[0] > 5 && l[0] < -5 && t[1] < -5, 'surgeon at 12: 9 o\'clock (temporal, OD) right, 3 o\'clock (nasal) left, 6 o\'clock top');
  const M9 = enfaceMap(9), b9 = M9(P3(9, 0)); ok(b9[1] > 5 && Math.abs(b9[0]) < 1e-6, 'surgeon at 9 (temporal): 9 o\'clock at the bottom');
  const w = v(10); ok(w[0] > 0 && w[1] > 0, 'a 10 o\'clock wound is lower right for a surgeon at 12'); }
// 7. sutures: perpendicular to the wound in the microscope view, mirrored bites, depth = dep × wall, needle enters and exits perpendicular to the surface
const ST = { wound: W, sutures: [{ s: 0, b: 1.0, dep: 0.8 }, { s: -0.9, b: 1.0, dep: 0.75 }, { s: -2.1, b: 0.85, dep: 0.8 }, { s: -3.0, b: 0.65, dep: 0.9 }, { s: 2.5, b: 1.0, dep: 0.75 }] };
{ const M = enfaceMap(12);
  for (const su of ST.sutures) { const p = suturePath(ST, su), a = M(p.entry), b = M(p.exit), w0 = M(P3(10, su.s - 0.3)), w1 = M(P3(10, su.s + 0.3));
    const u = [b[0] - a[0], b[1] - a[1]], v = [w1[0] - w0[0], w1[1] - w0[1]], cos = Math.abs(u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v);
    ok(cos < Math.sin(3 * D2R), `suture at s ${su.s}: perpendicular to the wound in the microscope view (${(90 - Math.acos(cos) / D2R).toFixed(1)}° off)`);
    const dw = wallOf(G.mer(p.deep).z, G.mer(p.deep).rho), ein = wallOf(G.mer(p.entry).z, G.mer(p.entry).rho), eout = wallOf(G.mer(p.exit).z, G.mer(p.exit).rho);
    ok(near(dw.d / T(dw.s), su.dep, 0.02), `suture at s ${su.s}: deepest at ${(dw.d / T(dw.s) * 100).toFixed(0)}% of the wall (asked ${su.dep * 100}%)`);
    ok(Math.abs(ein.d) < 0.01 && Math.abs(eout.d) < 0.01, `suture at s ${su.s}: enters and exits on the surface`);
    const pl = planes.across(10, su.s), sec = section({ plane: pl, win: { x: -1.5, y: -0.5, w: 3, h: 1.5 }, st: ST, step: 0.05 });
    const i = ST.sutures.indexOf(su), pin = sec.A['in' + i], pout = sec.A['out' + i];
    ok(near(pin[0], -pout[0], 0.02) && near(Math.abs(pin[0]), su.b, 0.05), `suture at s ${su.s}: bites mirrored, ${Math.abs(pin[0]).toFixed(2)} / ${Math.abs(pout[0]).toFixed(2)} mm from the wound (asked ${su.b})`);
    const t0 = G.sub(p.track[1], p.track[0]), n0 = G.N3(10 + 0, su.s), ang = Math.acos(Math.abs(G.dot(G.unit(t0), n0))) / D2R;
    ok(ang < 15, `suture at s ${su.s}: needle enters ${ang.toFixed(1)}° from perpendicular (first 1/40 of the track)`); } }
// 8. wound gap: tips closed, open in between, closed where a suture is tied
ok(gapAt({ wound: W }, W.s0) < 1e-6 && gapAt({ wound: W }, W.s1) < 1e-6 && near(gapAt({ wound: W }, -1.5), 0.22, 0.01), 'wound tips closed, gaping 0.22 mm in between (示意)');
ok(gapAt({ wound: W, sutures: [{ s: -1.5, b: 1, tie: 1 }] }, -1.5) < 0.01, 'a tied suture closes the wound where it crosses');
// 9. the two views agree on the same 3D eye: limbus, zone II end, prolapse and pupil peak
{ const st = { wound: W, prolapse: 1 }, e = enface({ st }), M = enfaceMap(12), mer = section({ plane: planes.meridian(10), win: { x: -1, y: -14.2, w: 13, h: 9 }, st, step: 0.06 });
  ok(near(Math.hypot(...e.A.woundLimbus), surfAt(0).rho, 1e-6), 'microscope view: the wound crosses the limbus on the limbus circle');
  ok(near(Math.hypot(...e.A.zone2End), surfAt(N.zone2).rho, 1e-6), 'microscope view: zone II end is the projection of s = 5 mm');
  const ang = (a, b) => { let d = Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d) / D2R; };
  ok(ang(e.A.pupilPeak, e.A.woundLimbus) < 1, 'peaked pupil points to the wound');
  const fd = makeField(st), pm = fd.wall(G.onPlane(planes.meridian(10), N.pupil + 1.1 - 0.05, -(keyPoints({ wound: W, prolapse: 1 }).pm[0])));
  ok(fd.g.iris(pm) < 0.05, 'meridional section: the iris reaches the peaked pupil margin (pupil + 1.1 mm)');
  ok(fd.g.prolapse(fd.wall(P3(10, G.PRO.s, -0.2))) < 0, 'prolapse knuckle sits on the wound above the surface at the limbus');
  ok(!/NaN|undefined/.test(e.svg + mer.svg), `no NaN/undefined in the SVG (${((e.svg.length + mer.svg.length) / 1024).toFixed(0)} KB)`); }
// 10. peritomy exposes the sclera over the wound in both views
{ const st = { wound: W, peritomy: 1 }, fd = makeField(st);
  ok(fd.g.conj(fd.wall(P3(10, 3, -0.1))) > 0 && fd.g.conj(fd.wall(P3(10.9, 3, -0.1))) < 0, 'peritomy: conjunctiva gone over the wound, still there beyond the radial cuts'); }

// =====================================================================================================================
// 11. cataract states (cataract.js; CATARACT_PATH=<file> runs these on another copy — used to break a value on purpose).
//     Sources: CARD.md 白內障. Section plane = meridian(6): screen u = −Y (12 o'clock on the LEFT), v = −Z. Microscope, surgeon at 12: screen y = Y.
const CAT = require(process.env.CATARACT_PATH || './cataract.js')(G), L = CAT.LENS, CN = CAT.CN;
const W12 = { x: -8.5, y: -14.6, w: 17, h: 10.2 }, sec6 = (st, step = 0.06, win = W12) => CAT.section({ st, h: 6, win, step });
const fitR = pts => { const [a, b, c] = pts, A = 2 * (b[0] - a[0]), B = 2 * (b[1] - a[1]), C = 2 * (c[0] - a[0]), D = 2 * (c[1] - a[1]),
  E = b[0] ** 2 - a[0] ** 2 + b[1] ** 2 - a[1] ** 2, Fv = c[0] ** 2 - a[0] ** 2 + c[1] ** 2 - a[1] ** 2, det = A * D - B * C, x = (E * D - B * Fv) / det, y = (A * Fv - E * C) / det; return Math.hypot(a[0] - x, a[1] - y); };
// 11.1 lens (Chen 2021, Chinese age-related cataract, CASIA2, dilated)
ok(near(L.za - L.zp, 4.56, 0.005), `cataract lens thickness ${(L.za - L.zp).toFixed(3)} mm = 4.56 (Chen 2021)`);
{ const ra = fitR([[-1.5, L.zAnt(1.5)], [0, L.zAnt(0)], [1.5, L.zAnt(1.5)]]), rp = fitR([[-1.5, L.zPost(1.5)], [0, L.zPost(0)], [1.5, L.zPost(1.5)]]);
  ok(near(ra, 9.73, 0.02) && near(rp, 5.49, 0.02), `lens central radii (3 mm zone) anterior ${ra.toFixed(2)} / posterior ${rp.toFixed(2)} mm = 9.73 / 5.49 (Chen 2021)`); }
{ const led = 2 * Math.max(...L.P.map(p => p[0])); ok(Math.abs(led - 9.81) <= 0.83, `lens equator diameter ${led.toFixed(2)} mm within 9.81 ± 0.83 (Chen 2021)`); }
{ const endo = G.keyPoints({}).apexZ - T(G.S_APEX); ok(near(endo - L.za, 2.72, 0.005), `ACD endothelium → lens ${(endo - L.za).toFixed(3)} mm = 2.72 (Chen 2021)`); }
// 11.2 capsule thickness as drawn (Barraquer 2006, elderly): anterior pole 15, anterior maximum 16, equator 7, posterior pole 3.5 µm; anterior > posterior
{ const s = sec6({ cat: {} }), um = r => r.pts.map((p, i) => Math.hypot(p[0] - r.band[i][0], p[1] - r.band[i][1]) * 1000);
  const run = s.A.capRuns.find(r => r.pts.some(p => p[0] > 0.5)) || s.A.capRuns[0], t = um(run), u = run.pts.map(p => p[0]);
  const iPole = u.reduce((b, x, i) => Math.abs(x) < Math.abs(u[b]) && i < u.length / 2 ? i : b, 0), iEq = u.reduce((b, x, i) => Math.abs(x) > Math.abs(u[b]) ? i : b, 0);
  const iPost = u.reduce((b, x, i) => i > iEq && Math.abs(x) < Math.abs(u[b]) ? i : b, iEq), antMax = Math.max(...t.slice(0, iEq));
  ok(near(t[iPole], 15, 0.3) && near(antMax, 16, 0.3) && near(t[iEq], 7, 0.3) && near(t[iPost], 3.5, 0.3),
    `capsule as drawn: anterior pole ${t[iPole].toFixed(1)}, anterior max ${antMax.toFixed(1)}, equator ${t[iEq].toFixed(1)}, posterior pole ${t[iPost].toFixed(1)} µm (Barraquer 2006: 15 / 16 / 7 / 3.5)`);
  let worse = 0; for (let r = 0.2; r < L.Req - 0.3; r += 0.2) if (CAT.capT(L.S[L.P.findIndex(p => p[0] >= r)]) <= CAT.capT(L.S[L.P.length - 1 - L.P.slice().reverse().findIndex(p => p[0] >= r)])) worse++;
  ok(worse === 0, 'anterior capsule thicker than the posterior capsule at every radius (Barraquer 2006)'); }
// 11.3 zonules: anterior insertion distance from the equator by Sakabe 1998's regression; the rhexis stays inside the zonule-free zone
{ const azi = 0.0079 * 69 + 0.202 * L.LED - 0.041 * 23.53 + 0.0114;
  ok(near(CAT.AZI, azi, 1e-9) && near(L.Req - CAT.R_AZI, azi, 1e-9), `anterior zonular insertion ${azi.toFixed(2)} mm inside the equator (Sakabe 1998 regression, age 69, AL 23.53, Chen 2021)`);
  const fib = CAT.zonules(CAT.norm({}), 6), antmost = Math.min(...fib.map(f => f[1][0]));
  ok(near(antmost, CAT.R_AZI, 1e-6), `the most central zonule inserts at r = ${antmost.toFixed(2)} mm, where the zonule-free zone ends`);
  ok(CN.cccD / 2 < CAT.R_AZI, `a ${CN.cccD} mm rhexis edge is ${(CAT.R_AZI - CN.cccD / 2).toFixed(2)} mm inside the zonular insertion`); }
// 11.4 dilated pupil 7.0 mm (Chiambaretta 2018): the same pupil margin in both views; the red reflex only inside the pupil
{ const s = sec6({ cat: {} }), e = CAT.enface({ st: { cat: {} }, id: 'k' });
  ok(near(s.A['pm+'][0], 3.5, 1e-6) && near(s.A['pm-'][0], -3.5, 1e-6) && near(e.A.pupilR, 3.5, 1e-9), `pupil 7.0 mm: section pupil margins at u = ±${s.A['pm+'][0].toFixed(2)}, microscope radius ${e.A.pupilR} (Chiambaretta 2018)`);
  const g = e.svg.match(/<g clip-path="url\(#k_pup\)">([\s\S]*?)<\/g>/), clip = e.svg.match(/<clipPath id="k_pup"><circle cx="[^"]+" cy="[^"]+" r="([^"]+)"/);
  const outside = e.svg.replace(g ? g[0] : '', '');
  ok(!!g && /url\(#k_rr\)/.test(g[1]) && !/url\(#k_rr\)/.test(outside) && clip && near(Number(clip[1]), 3.5, 1e-9), 'red reflex drawn only inside the pupil clip (r 3.5 mm)');
  ok(new RegExp(`Z" fill="url\\(#k_ir\\)" fill-rule="evenodd"`).test(e.svg) && e.svg.indexOf('url(#k_ir)" fill-rule') > e.svg.indexOf('clip-path="url(#k_pup)"'), 'iris annulus (pupil → limbus) drawn over the lens: anything beyond the pupil is hidden'); }
// 11.5 capsulorhexis size: 5.0–5.5 mm, rim on a 6.0 mm optic all round (Hollick 1999: rim on the optic; Haripriya 2025: no overlap → decentration, YAG)
ok(CN.cccD >= 5.0 && CN.cccD <= 5.5 && CN.cccD / 2 + 0.25 <= CN.optic / 2, `rhexis ${CN.cccD} mm in 5.0–5.5 and ≥ 0.25 mm on the ${CN.optic} mm optic all round`);
// 11.6 cross-view: a completed rhexis cuts the capsule at the same 12 and 6 o'clock points in the section and the microscope view
{ const st = { cat: { ccc: { prog: 1, fold: 1 } } }, s = sec6(st), e = CAT.enface({ st, id: 'x' }), r = CN.cccD / 2;
  const ends = s.A.capRuns.map(R => R.pts[0]), u6 = Math.min(...ends.filter(p => p[0] > 0).map(p => p[0])), u12 = Math.max(...ends.filter(p => p[0] < 0).map(p => p[0]));
  ok(near(u6, r, 0.03) && near(u12, -r, 0.03), `section: anterior capsule opening from u = ${u12.toFixed(2)} (12 o'clock) to ${u6.toFixed(2)} (6 o'clock), radius ${r}`);
  ok(near(e.A.edge12[1], -u12, 0.03) && near(e.A.edge6[1], -u6, 0.03) && Math.abs(e.A.edge12[0]) < 1e-6, `microscope: rhexis edge at 12 o'clock y = ${e.A.edge12[1].toFixed(2)} (bottom), 6 o'clock y = ${e.A.edge6[1].toFixed(2)} — same points (u = −y)`); }
// 11.7 main incision (Ernest 1995: tunnel 1.75–2.0 mm, beveled width ≤ 3.0 mm; Wilczynski 2016 1.84 ± 0.36): clear cornea, ends on the corneal back surface
{ const tn = CAT.tunnelOf(CN.main), ext = tn.to3(tn.ext), int = tn.to3(tn.int), wE = wallOf(G.mer(ext).z, G.mer(ext).rho), wI = wallOf(G.mer(int).z, G.mer(int).rho);
  ok(tn.chord >= 1.75 && tn.chord <= 2.0 && CN.main.w <= 3.0, `tunnel ${tn.chord.toFixed(2)} mm (1.75–2.0, Ernest 1995), path ${tn.Lp.toFixed(2)} mm, width ${CN.main.w} mm (≤ 3.0)`);
  ok(wE.s < 0 && Math.abs(wE.d) < 0.005, `outer opening on the surface ${(-wE.s).toFixed(2)} mm inside the visible limbus (clear cornea)`);
  ok(wI.s < 0 && near(wI.d, T(wI.s), 0.005), `inner opening on the corneal back surface (depth ${wI.d.toFixed(3)} = wall ${T(wI.s).toFixed(3)})`);
  const st = { cat: { main: { cut: 1 }, side: { cut: 1 } } }, s = sec6(st, 0.08), e = CAT.enface({ st });
  ok(near(s.A.mainExt[0], -tn.ext[0], 1e-6) && near(s.A.mainExt[1], -tn.ext[1], 1e-6) && s.A.mainExt[0] < 0, `section: main incision on the LEFT (12 o'clock), outer opening u = ${s.A.mainExt[0].toFixed(2)}`);
  ok(Math.abs(e.A.mainExt[0]) < 1e-6 && near(e.A.mainExt[1], tn.ext[0], 1e-6) && near(e.A.mainW, CN.main.w, 1e-6), `microscope: main incision at the bottom (12 o'clock), ${e.A.mainW.toFixed(2)} mm wide`);
  const sp = e.A.sideExt, hS = G.clockOf(-sp[0], sp[1]); ok(near(hS, 2, 0.01) && sp[0] < 0, `microscope: side port at ${hS.toFixed(2)} o'clock, on the left (nasal for OD, the left hand's side; 2 o'clock 示意 / 院內常規待確認)`); }
// 11.8 instruments: enter only through their incision, turning about a point in the tunnel; tip at the same place in both views; hand above the eye
{ const nst = CAT.norm({ cat: { ccc: { prog: 0.3, fold: 1 } } }), gA = CAT.graspAt(nst);
  const cases = [['forceps', { kind: 'forceps', at: gA }], ['cystotome', { kind: 'cystotome', at: { h: 6, r: 0.1, lift: 0 } }], ['cannula (main)', { kind: 'cannula', at: { h: 7, r: 1.5, lift: 0.6 } }], ['cannula (side port)', { kind: 'cannula', via: 'side', at: { h: 8, r: 1.0, lift: 0.6 } }]];
  for (const [nm, inst] of cases) { const st = { cat: { main: { cut: 1 }, side: { cut: 1 }, ccc: { prog: 0.3, fold: 1 }, inst: [inst] } }, c = CAT.norm(st), g = CAT.instGeom(c, c.inst[0]);
    const piv = g.tn.to3(g.tn.pivot), from = g.bend || g.tip, d = G.len(G.cross(G.sub(piv, from), g.axis));
    const wp = wallOf(G.mer(piv).z, G.mer(piv).rho);
    ok(d < 1e-9 && wp.d > 0 && wp.d < T(wp.s) && near(G.clockOf(piv[0], piv[1]) % 12, g.tn.h % 12, 1e-6), `${nm}: shaft passes through its tunnel (${g.via}) at depth ${wp.d.toFixed(2)} of ${T(wp.s).toFixed(2)} mm`);
    const bad = [];
    for (let t = 0.05; t < 0.95; t += 0.05) { const p = G.add(from, G.sub(piv, from), t), o = CAT.layersAt({ cat: { ovd: 0, pupil: c.pupil } }, p), w = wallOf(G.mer(p).z, G.mer(p).rho);
      if (o.lens < 0 || o.iris < 0 || (w.d < T(w.s) && w.s > g.tn.sE + 0.01) || (w.d < T(w.s) && w.s < g.tn.sI - 0.3)) bad.push(t.toFixed(2)); }
    ok(!bad.length, `${nm}: shaft from the tip to the tunnel stays in the chamber (no lens, iris or cornea outside the tunnel)${bad.length ? ' at ' + bad.join(',') : ''}`);
    const out = G.add(piv, g.axis, 6); ok(out[2] > piv[2] + 0.05, `${nm}: handle rises outward (${((out[2] - piv[2]) / 6 * 57.3).toFixed(1)}°): the hand is above the eye`);
    const s = sec6(st, 0.1), e = CAT.enface({ st }), tS = s.A.tip0, tE = e.A.tip0;
    ok(near(tS[0], -tE[1], 1e-6) && near(tS[1], -g.tip[2], 1e-6) && near(tE[0], -g.tip[0], 1e-6), `${nm}: tip at the same place in both views (section u ${tS[0].toFixed(2)} = −y ${(-tE[1]).toFixed(2)}, depth z ${g.tip[2].toFixed(2)})`); } }
// 11.9 keratome: the tip follows the tunnel inside the cornea; its blade is the incision width
{ const st = { cat: { main: { cut: 0 }, inst: [{ kind: 'keratome', adv: 0.5 }] } }, c = CAT.norm(st), g = CAT.instGeom(c, c.inst[0]), w = wallOf(G.mer(g.tip).z, G.mer(g.tip).rho);
  ok(w.d > 0.05 && w.d < T(w.s) - 0.05 && near(g.blade.W, CN.main.w, 1e-9), `keratome half-way: tip in the stroma (depth ${w.d.toFixed(2)} of ${T(w.s).toFixed(2)} mm), blade ${g.blade.W} mm`); }
// 11.10 cystotome on the capsule: the posterior capsule is a lens thickness (4.56 mm) below the tip
{ const st = { cat: { main: { cut: 1 }, ccc: { cut: 1 }, inst: [{ kind: 'cystotome', at: { h: 6, r: 0, lift: 0 } }] } }, c = CAT.norm(st), g = CAT.instGeom(c, c.inst[0]);
  ok(near(g.tip[2], L.zAnt(0), 1e-6) && near(g.tip[2] - L.zPost(0), 4.56, 0.005), `cystotome tip on the anterior capsule; posterior capsule ${(g.tip[2] - L.zPost(0)).toFixed(2)} mm below it`); }
// 11.11 the folded flap lies on the anterior capsule (a second layer), never inside the lens, ahead of the tear front
{ const c = CAT.norm({ cat: { ccc: { prog: 0.3, fold: 1 } } }), fm = CAT.flapMesh(c); let lo = 1e9, hi = -1e9, inside = 0;
  for (const row of fm.V) for (const p of row) { const r = Math.hypot(p[0], p[1]); if (r > L.Req) continue; const dz = p[2] - L.zAnt(r); lo = Math.min(lo, dz); hi = Math.max(hi, dz); if (L.g(r, p[2]) < 0) inside++; }
  const X = CAT.rhex(c.ccc), mid = fm.edge[Math.floor(fm.edge.length / 2)], hMid = G.clockOf(mid[0], mid[1]), ahead = ((X.hf - hMid) * -c.ccc.dir + 24) % 12;
  ok(inside === 0 && lo >= 0.02 && hi <= 0.06, `folded flap: ${inside} points inside the lens, ${lo.toFixed(3)}–${hi.toFixed(3)} mm above the capsule`);
  ok(ahead > 0 && ahead < 6, `folded flap lies ahead of the tear front (its free edge ${ahead.toFixed(1)} clock hours ahead)`); }
// 11.12 run-out vs normal: the run-out front reaches the zonular insertion and goes under the iris (hidden in the microscope view)
{ const n = CAT.enface({ st: { cat: { ccc: { prog: 0.42, fold: 1 } } } }), r = CAT.enface({ st: { cat: { ccc: { prog: 0.42, fold: 1, run: 1, runAt: 0.26 } } } });
  ok(near(n.A.frontR, CN.cccD / 2, 1e-9) && !n.A.frontHidden, `normal tear front at r = ${n.A.frontR.toFixed(2)} mm, visible in the pupil`);
  ok(r.A.frontR > CAT.R_AZI && r.A.frontR > CN.pupil / 2 && r.A.frontHidden, `run-out front at r = ${r.A.frontR.toFixed(2)} mm: past the zonular insertion (${CAT.R_AZI.toFixed(2)}) and under the iris (hidden)`);
  const s = CAT.section({ st: { cat: { ccc: { prog: 0.42, fold: 1, run: 1, runAt: 0.26 } } }, h: CAT.rhex(CAT.norm({ cat: { ccc: { prog: 0.42, fold: 1, run: 1, runAt: 0.26 } } }).ccc).hf, win: { x: -1, y: -12, w: 7, h: 4 }, step: 0.1 });
  ok(near(s.A.front[0], r.A.frontR, 1e-6), `tear-front section shows the same run-out radius (${s.A.front[0].toFixed(2)} mm)`); }
// 11.13 OVD fills the anterior chamber only (in front of the lens and iris), not the posterior chamber
{ const st = { cat: { ovd: 1 } }, ac = CAT.layersAt(st, [0, 0, L.za + 1]), pc = CAT.layersAt(st, [0, 4.5, (L.zAnt(4.5) + CAT.irisOf(CAT.norm(st)).root[0]) / 2 - 0.05]);
  ok(ac.ovd < 0 && pc.ovd > 0 && pc.aqueous < 0, 'OVD fills the anterior chamber; the posterior chamber (behind the iris) stays aqueous'); }
// 11.14 weak zonules (Chen 2025: anterior-capsule wrinkling during CCC; Rai 2015: bag instability during CCC): the same pull moves the bag and wrinkles
//       the capsule only when the zonules are weak; both views move by the same vector (amount and pattern 示意)
{ const base = { ccc: { prog: 0.3, fold: 1 } }, weak = CAT.norm({ cat: { ...base, zonule: { weak: 1, pull: 1 } } }), rout = CAT.norm({ cat: { ...base, zonule: { weak: 0, pull: 1 } } });
  const Sw = CAT.lensShift(weak), Sr = CAT.lensShift(rout), mv = Math.hypot(Sw.LO[0], Sw.LO[1]);
  ok(mv > 0.1 && Math.hypot(Sr.LO[0], Sr.LO[1]) === 0, `weak zonules: the bag moves ${mv.toFixed(2)} mm with the pull (示意); routine: it does not`);
  const f0 = CAT.capPt(rout, CAT.rhex(rout.ccc).front[0], CAT.rhex(rout.ccc).front[1]), r1 = CAT.norm({ cat: { ccc: { prog: 0.31, fold: 1 } } }), f1 = CAT.capPt(r1, CAT.rhex(r1.ccc).front[0], CAT.rhex(r1.ccc).front[1]);
  const go = G.unit([f1[0] - f0[0], f1[1] - f0[1], 0]); ok(Sw.LO[0] * go[0] + Sw.LO[1] * go[1] > 0.99 * mv, 'the bag moves the way the tear is going (where the forceps pull)');
  let wr = 0, wr0 = 0; for (let a = 0; a < 2 * Math.PI; a += 0.05) for (let r = 0.3; r < 3.2; r += 0.1) { if (Math.abs(CAT.striae(weak, r * Math.cos(a), r * Math.sin(a))) > 0.01) wr++; if (CAT.striae(rout, r * Math.cos(a), r * Math.sin(a)) !== 0) wr0++; }
  ok(wr > 0 && wr0 === 0, `anterior-capsule wrinkles only with weak zonules (${wr} sample points wrinkled vs ${wr0})`);
  const sw = sec6({ cat: { ...base, zonule: { weak: 1, pull: 1 } } }, 0.1), sr = sec6({ cat: { ...base } }, 0.1), ew = CAT.enface({ st: { cat: { ...base, zonule: { weak: 1, pull: 1 } } } }), er = CAT.enface({ st: { cat: base } });
  const du = sw.A.antPole[0] - sr.A.antPole[0], dy = ew.A.front[1] - er.A.front[1];
  ok(near(du, -Sw.LO[1], 1e-6) && near(dy, Sw.LO[1], 1e-6), `both views move by the same vector (section Δu ${du.toFixed(3)} = −Δy ${(-dy).toFixed(3)})`); }
// 11.15 orientation of the 12–6 section: 12 o'clock on the left, anterior up
{ const pl = G.planes.meridian(6), a = G.toPlane(pl, [0, 3, 10]), b = G.toPlane(pl, [0, -3, 10]); ok(a[0] < 0 && b[0] > 0 && a[1] === -10, '12–6 section: 12 o\'clock on the left, 6 on the right, anterior up'); }
{ const st = { cat: { main: { cut: 1 }, side: { cut: 1 }, ovd: 1, ccc: { prog: 0.3, fold: 1 }, zonule: { weak: 1, pull: 1 }, inst: [{ kind: 'forceps', at: { h: 2.1, r: 2.2, lift: 0.03 } }] } };
  const all = sec6(st, 0.08).svg + CAT.enface({ st }).svg; ok(!/NaN|undefined/.test(all), `cataract views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall globe checks passed');
process.exit(fail ? 1 : 0);
