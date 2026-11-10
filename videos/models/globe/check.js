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
// 11.16 an instrument held in the main tunnel (示意; CARD.md 白內障「物理與器械」): the roof is lifted, the posterior lip pressed down and the tunnel
//       gapes around the shaft. The cornea stays one roof above and one lip below the shaft (not torn into strips), its field is continuous
//       (a smooth outline, no stair steps), the drawn position is exactly where the rest tissue was moved to, and the folds stay small.
{ const st = { cat: { main: { cut: 1 }, side: { cut: 1 }, ovd: 1, folds: 1, inst: [{ kind: 'forceps', at: { h: 6, r: 2.0, lift: 0.1 }, open: 0 }] } }, c = CAT.norm(st), def = CAT.deformer(c);
  const D = def && def.parts && def.parts[0], f = CAT.layersFn(st), a = G.clockDir(12), P = (r, z) => [r * a[0], r * a[1], z];
  if (!D || !D.fwd) ok(false, 'tunnel deformation: the deformer exposes its parts (roof lift, lip push, forward map)');
  else {
    let maxRuns = 0, two = 0, inShaft = 0, jump = 0, incons = 0, n = 0;
    for (let r = D.rIn - 1.5; r < D.rOut - 0.03; r += 0.04) { let runs = 0, prev = false, pv = null;   // the tunnel and 1.5 mm central to it (folds)
      for (let z = 10.0; z < 12.6; z += 0.004) { const o = f(P(r, z)), inC = o.cornea < 0; if (inC && !prev) runs++; prev = inC;
        if (inC && Math.abs(z - D.zLine(r)) < D.rr - 0.015) inShaft++;
        if (pv !== null && Math.abs(o.cornea - pv) > 0.012) jump++; pv = o.cornea;
        if (inC) { const q = def(P(r, z)); if (Math.abs(D.fwd(r, q.q[2]) - z) > 2e-3) incons++; n++; } }
      maxRuns = Math.max(maxRuns, runs); if (runs === 2) two++; }
    ok(maxRuns <= 2 && two > 10 && inShaft === 0, `held tunnel: at most 2 cornea pieces on each vertical line through the tunnel (roof + lip; ${two} lines with both), none inside the shaft`);
    ok(jump === 0, `held tunnel: the cornea field is continuous (no step > 0.012 per 0.004 mm${jump ? `; ${jump} steps` : ''}): smooth outline`);
    ok(incons === 0, `held tunnel: every drawn corneal point maps back to where it was (forward ∘ inverse within 2 µm; ${n} points${incons ? `, ${incons} off` : ''})`);
    const s = sec6(st, 0.1), lift = s.A.mainRoofRest[1] - s.A.mainRoof[1], push = s.A.mainLip[1] - s.A.mainLipRest[1];
    ok(lift > 0.2 && push > 0.3, `held tunnel: roof lifted ${lift.toFixed(2)} mm (toward the outer opening), posterior lip pressed ${push.toFixed(2)} mm (toward the inner opening)`);
    let d2 = 0; for (let r = D.r0 + 0.02; r < D.r1 - 0.02; r += 0.01) d2 = Math.max(d2, Math.abs(D.ue(r + 0.01) - 2 * D.ue(r) + D.ue(r - 0.01)), Math.abs(D.de(r + 0.01) - 2 * D.de(r) + D.de(r - 0.01)));
    ok(d2 < 0.002, `held tunnel: roof lift and lip push vary smoothly along the tunnel (largest second difference ${(d2 * 1000).toFixed(2)} µm per 0.01 mm)`);
    const D0 = CAT.deformer(CAT.norm({ cat: { ...st.cat, folds: 0 } })).parts[0];
    ok(D.fold > 0 && D.fold <= 0.08 && D0.fold === 0, `Descemet folds central to the pressed lip: ${(D.fold * 1000).toFixed(0)} µm (≤ 80 µm, 示意), only when asked for (folds: 1)`); } }
// 11.17 posterior pressure (st.cat.push, 示意): the lens–iris diaphragm moves forward (0.35 mm, the centre 0.6 mm), the anterior capsule is more
//       convex, the iris margin still rests on it, and the capsule drawn in the section is the lens's own surface
{ const p0 = { cat: { ovd: 0.5 } }, p1 = { cat: { ovd: 0.5, push: 1 } }, c1 = CAT.norm(p1), s0 = sec6(p0, 0.1), s1 = sec6(p1, 0.1);
  const dPole = s0.A.antPole[1] - s1.A.antPole[1], dEq = s0.A['eq+'][1] - s1.A['eq+'][1], endo = G.keyPoints({}).apexZ - T(G.S_APEX);
  ok(near(dPole, 0.6, 1e-6) && near(dEq, 0.35, 1e-6) && near(endo - (L.za + dPole), 2.12, 0.005), `push: anterior pole forward ${dPole.toFixed(2)} mm, equator ${dEq.toFixed(2)} mm → chamber ${(endo - L.za - dPole).toFixed(2)} mm deep (示意)`);
  const z = r => CAT.capPt(c1, Math.abs(r), r < 0 ? 12 : 6)[2], ra = fitR([[-1.5, z(-1.5)], [0, z(0)], [1.5, z(1.5)]]);
  ok(ra < 9.73 - 0.5, `push: anterior capsule more convex (central radius ${ra.toFixed(2)} mm < 9.73)`);
  const I0 = CAT.irisOf(CAT.norm(p0)), I1 = CAT.irisOf(c1), pr = c1.pupil / 2;
  ok(near(I1.pm[0] - I0.pm[0], CAT.liftZ(c1, pr), 1e-9) && CAT.liftZ(CAT.norm(p0), pr) === 0, `push: the pupil margin rides forward with the capsule (${CAT.liftZ(c1, pr).toFixed(2)} mm)`);
  const run = s1.A.capRuns.find(R => R.pts.some(q => Math.abs(q[0]) < 0.05)), q0 = run && run.pts.reduce((b, q) => Math.abs(q[0]) < Math.abs(b[0]) ? q : b);
  ok(!!q0 && near(q0[1], s1.A.antPole[1], 0.01) && CAT.layersAt(p1, [0, 0, -s1.A.antPole[1] - 0.05]).lens < 0, `push: the capsule line lies on the moved lens (anterior pole v ${q0 ? q0[1].toFixed(2) : '?'} = ${s1.A.antPole[1].toFixed(2)})`); }
// 11.18 the freed disc taken out: its radial cut goes with it (only the round rhexis edge is drawn)
{ const n = st => (CAT.enface({ st, id: 'q' }).svg.match(/stroke="#ffe0c2"/g) || []).length;
  ok(n({ cat: { ccc: { prog: 1, fold: 1, out: 1 } } }) === 1 && n({ cat: { ccc: { prog: 0.5, fold: 1 } } }) === 2, 'microscope: after the disc is out only the rhexis edge is drawn (no radial cut line)'); }
// 11.15 orientation of the 12–6 section: 12 o'clock on the left, anterior up
{ const pl = G.planes.meridian(6), a = G.toPlane(pl, [0, 3, 10]), b = G.toPlane(pl, [0, -3, 10]); ok(a[0] < 0 && b[0] > 0 && a[1] === -10, '12–6 section: 12 o\'clock on the left, 6 on the right, anterior up'); }
{ const st = { cat: { main: { cut: 1 }, side: { cut: 1 }, ovd: 1, ccc: { prog: 0.3, fold: 1 }, zonule: { weak: 1, pull: 1 }, inst: [{ kind: 'forceps', at: { h: 2.1, r: 2.2, lift: 0.03 } }] } };
  const all = sec6(st, 0.08).svg + CAT.enface({ st }).svg; ok(!/NaN|undefined/.test(all), `cataract views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }

// =====================================================================================================================
// 12. ② hydrodissection, divide and conquer, phaco and chopper, fluidics (cataract.js, fluidics.js; FLUIDICS_PATH=<file> for a broken copy).
//     Sources and 示意 list: CARD.md 白內障 ②. States as in sample-cataract2.html.
const FL = require(process.env.FLUIDICS_PATH || './fluidics.js');
const B2 = { main: { cut: 1 }, side: { cut: 1 }, ccc: { prog: 1, fold: 1, out: 1 } }, cat2 = x => ({ cat: Object.assign({}, B2, x) });
const ENDO = G.keyPoints({}).apexZ - T(G.S_APEX), RC = CN.cccD / 2;
const HY = cat2({ hydro: { h: 7, prog: 0.55 }, inst: [{ kind: 'cannula', via: 'side', at: { h: 7, r: 2.95, lift: -0.03 }, bend: true }] });
// 12.1 the BSS lies only between the lens surface and the capsule (inside the bag), and under the anterior capsule only outside the rhexis
{ const s = CAT.section({ st: HY, h: 7, win: { x: -6, y: -12.5, w: 12, h: 8 }, step: 0.1 }), runs = s.A.fluidRuns || []; let n = 0, inLens = 0, far = 0, inRhexis = 0;
  for (const fr of runs) for (const [inn, out, i, f] of fr) { n++; const r = L.P[i][0], z = L.P[i][1];
    for (const q of [inn, out, [(inn[0] + out[0]) / 2, (inn[1] + out[1]) / 2]]) { const rr = Math.abs(q[0]), zz = -q[1]; if (L.g(rr, zz) < -1e-6) inLens++; }
    if (Math.hypot(out[0] - inn[0], out[1] - inn[1]) > CN.hydro.tw + 1e-6) far++;
    if (i <= L.iEq && r < RC - 1e-6) inRhexis++; }
  const H = CAT.hydroOf(CAT.norm(cat2({ hydro: { h: 7, prog: 1 } }))); for (let i = 0; i <= L.iEq; i++) if (L.P[i][0] < RC - 1e-6) for (let k = 0; k <= 12; k++) if (H.thick(i, Math.PI * k / 12) > 0) inRhexis++;
  ok(n > 50 && inLens === 0 && far === 0 && inRhexis === 0, `hydro: BSS only between lens surface and capsule (${n} profile points; inside the lens ${inLens}, thicker than ${CN.hydro.tw} mm ${far}, inside the rhexis — no capsule there — ${inRhexis})`); }
// 12.2 the wave starts at the injection site and runs out, round the equator, across the posterior capsule (area grows with prog; the pole is reached)
{ const area = prog => { const H = CAT.hydroOf(CAT.norm(cat2({ hydro: { h: 7, prog } }))); let a = 0; for (let i = 0; i < L.P.length; i++) for (let k = 0; k <= 24; k++) if (H.wave(i, Math.PI * k / 24) > 0) a++; return a; };
  const A = [0.05, 0.2, 0.4, 0.6, 0.8, 1].map(area), H1 = CAT.hydroOf(CAT.norm(cat2({ hydro: { h: 7, prog: 0.12 } })));
  const near = H1.wave(L.P.findIndex(p => p[0] >= RC + 0.2), 0) > 0, far0 = H1.wave(L.P.findIndex(p => p[0] >= RC + 0.2), Math.PI) > 0;
  const Hp = CAT.hydroOf(CAT.norm(cat2({ hydro: { h: 7, prog: 0.75 } }))), pole = Hp.wave(L.P.length - 2, 0) > 0;
  ok(A.every((v, i) => i === 0 || v > A[i - 1]) && near && !far0 && pole, `hydro wave: grows with progress (${A.join(' → ')} samples), starts at the injection hour (opposite side dry at 12 %), crosses the posterior pole by 75 %`); }
// 12.3 cross-view: the front on the injection meridian has the same radius in the section through the injection hour and in the microscope view
{ const s = CAT.section({ st: HY, h: 7, win: { x: -6, y: -12.5, w: 12, h: 8 }, step: 0.1 }), e = CAT.enface({ st: HY }), fr = (s.A.waveFronts || []).filter(f => f.sg > 0);
  const rS = fr.length ? Math.min(...fr.map(f => Math.abs(f.p[0]))) : NaN, rE = e.A.waveFrontR;
  ok(fr.length && near(rS, rE, 0.04), `hydro: wave front at r ${rS.toFixed(2)} mm in the section = ${rE.toFixed(2)} mm in the microscope view (injection meridian)`);
  const hE = G.clockOf(-e.A.waveFront[0], e.A.waveFront[1]); ok(near(hE, 7, 0.02), `microscope: the front point lies on the injection meridian (${hE.toFixed(2)} o'clock)`); }
// 12.4 pressing the centre releases it: no fluid left under the capsule at press 1, and the release arrows end in the anterior chamber
{ const H = CAT.hydroOf(CAT.norm(cat2({ hydro: { h: 7, prog: 1, press: 1 } }))); let left = 0; for (let i = 0; i < L.P.length; i++) for (let k = 0; k <= 12; k++) if (H.thick(i, Math.PI * k / 12) > 0) left++;
  const s = CAT.section({ st: cat2({ hydro: { h: 7, prog: 1, press: 0.5 } }), h: 7, win: { x: -6, y: -12.5, w: 12, h: 8 }, step: 0.1 }), f = CAT.layersFn(cat2({ hydro: { h: 7, prog: 1, press: 0.5 } }));
  const ends = ['release+', 'release-'].map(k => s.A[k]).filter(Boolean), inAC = ends.filter(q => { const sg = q[0] > 0 ? 1 : -1, a = G.clockDir(sg > 0 ? 7 : 1), p = [Math.abs(q[0]) * a[0], Math.abs(q[0]) * a[1], -q[1]], o = f(p); return o.aqueous < 0 && o.lens > 0 && -q[1] > L.zAnt(Math.abs(q[0])); });
  ok(left === 0 && ends.length === 2 && inAC.length === 2, `hydro press: no fluid left under the capsule (${left}); both release arrows end in the anterior chamber (${inAC.length}/2)`); }
// 12.5 capsular block (示意): lens forward 0.3 mm (shallower chamber), BSS pocket behind the nucleus only, posterior capsule pushed back; pocket inside the bag
{ const st = cat2({ hydro: { h: 7, prog: 1, block: 1 } }), s = CAT.section({ st, h: 7, win: { x: -6, y: -12.5, w: 12, h: 9 }, step: 0.1 }), s0 = CAT.section({ st: cat2({}), h: 7, win: { x: -6, y: -12.5, w: 12, h: 9 }, step: 0.1 });
  const fwd = s0.A.antPole[1] - s.A.antPole[1], acd = ENDO - (-s.A.antPole[1]), run = s.A.capRuns.find(R => R.pts.some(q => Math.abs(q[0]) < 0.05 && -q[1] < L.zc)), q0 = run && run.pts.reduce((b, q) => Math.abs(q[0]) < Math.abs(b[0]) ? q : b);
  const back = q0 ? (-s0.A.postPole[1]) - (-q0[1]) : NaN, H = CAT.hydroOf(CAT.norm(st)); let antPocket = 0; for (let i = 0; i <= L.iEq; i++) if (H.pocket(i) > 0) antPocket++;
  ok(near(fwd, 0.3, 1e-6) && near(acd, 2.42, 0.005) && back > 0.5 && antPocket === 0, `capsular block: lens forward ${fwd.toFixed(2)} mm (chamber ${acd.toFixed(2)} mm), posterior capsule ${back.toFixed(2)} mm behind its place, pocket behind the nucleus only`); }
// 12.6 groove depth: over every depth the floor stays in front of the posterior capsule (plate ≥ 0.9 × the planned plate at full depth); only the error state goes through
{ let worst = 1e9; for (let d = 0.05; d <= 1.0001; d += 0.05) { const Gg = CAT.nucOf(CAT.norm(cat2({ nuc: { groove: { dep: d } } }))).g1; worst = Math.min(worst, Gg.rem); }
  const Go = CAT.nucOf(CAT.norm(cat2({ nuc: { groove: { dep: 1, over: 1 } } }))).g1;
  ok(worst >= 0.9 * CN.groove.plate && Go.rem < 0, `groove: thinnest plate over all depths ${worst.toFixed(2)} mm (planned ${CN.groove.plate}); over-deep error state ${Go.rem.toFixed(2)} mm (through the capsule)`);
  const st = cat2({ nuc: { groove: { dep: 1, over: 1 } } }), sx = CAT.section({ st, h: 9, off: Go.aMin + 0.1, win: { x: -4, y: -11, w: 8, h: 6 }, step: 0.05 }), sn = CAT.section({ st: cat2({ nuc: { groove: { dep: 1 } } }), h: 9, off: Go.aMin + 0.1, win: { x: -4, y: -11, w: 8, h: 6 }, step: 0.05 });
  const under = R => R.reduce((n, r) => n + r.pts.filter(q => -q[1] < L.zc && Math.abs(q[0]) < 0.3).length, 0);
  ok(under(sn.A.capRuns) > 0 && under(sx.A.capRuns) === 0, `over-deep groove: the posterior capsule under the floor is gone in the error state (${under(sx.A.capRuns)} capsule points within 0.3 mm of the groove axis vs ${under(sn.A.capRuns)} at full normal depth)`); }
// 12.7 the groove stays inside the rhexis (its edge ≥ 0.3 mm inside the rhexis edge at every depth) and is as wide as asked
{ let out = 0; for (const d of [0.3, 0.6, 0.9]) { const f = CAT.layersFn(cat2({ nuc: { groove: { dep: d } } })), f0 = CAT.layersFn(cat2({}));
    for (let a = 0; a < 2 * Math.PI; a += 0.05) for (let z = L.zp; z < L.za; z += 0.05) { const r = RC - CN.groove.margin + 0.02, p = [r * Math.cos(a), r * Math.sin(a), z]; if (f0(p).lens < 0 && f(p).lens > 0) out++; } }
  const Gg = CAT.nucOf(CAT.norm(cat2({ nuc: { groove: { dep: 0.85 } } }))).g1, fx = CAT.layersFn(cat2({ nuc: { groove: { dep: 0.85 } } })), zc = Gg.zf(0) + Gg.hw;
  let w0 = null, w1 = null; for (let x = -1.5; x <= 1.5; x += 0.005) { if (fx([x, 0, zc]).lens > 0) { if (w0 === null) w0 = x; w1 = x; } }
  ok(out === 0 && near(w1 - w0, CN.groove.w, 0.03), `groove: nothing removed beyond ${(RC - CN.groove.margin).toFixed(2)} mm (rhexis ${RC} − 0.3; ${out} points); width ${(w1 - w0).toFixed(2)} mm = ${CN.groove.w} (示意)`); }
// 12.8 the plate drawn under the floor (3–9 cut) is the one stated: floor → posterior capsule in the section = remAt(a) of the model
{ const st = cat2({ nuc: { groove: { dep: 0.85 } } }), Gg = CAT.nucOf(CAT.norm(st)).g1, off = Gg.tipA + 0.15, s = CAT.section({ st, h: 9, off, win: { x: -4, y: -11, w: 8, h: 6 }, step: 0.05 }), X = s.A.grooveX;
  const f = CAT.layersFn(st); let zFloor = null; for (let z = L.za; z > L.zp; z -= 0.002) { if (f([0, off, z]).lens < 0) { zFloor = z; break; } }
  ok(X && near(X.post[1] - X.floor[1], X.rem, 1e-6) && near(zFloor - L.zPost(Math.abs(off)), X.rem, 0.01), `groove depth panel: floor → posterior capsule ${X ? X.rem.toFixed(2) : '?'} mm, the drawn lens top under the floor at ${(zFloor - L.zPost(Math.abs(off))).toFixed(2)} mm`); }
// 12.9 red reflex at the groove floor (示意): brighter as the plate thins; the microscope's groove brightness follows the depth
{ const g = [3, 2, 1.4, 0.5].map(CAT.grooveGlow), e = [0.3, 0.6, 0.9].map(d => CAT.enface({ st: cat2({ nuc: { groove: { dep: d } } }) }).A.grooveGlow);
  ok(g.every((v, i) => i === 0 || v > g[i - 1]) && e.every((v, i) => i === 0 || v > e[i - 1]), `groove glow rises as the plate thins (${g.map(v => v.toFixed(2)).join(' < ')}) and with depth in the microscope view (${e.map(v => v.toFixed(2)).join(' < ')})`); }
// 12.10 phaco: needle and sleeve through the main incision (axis through the tunnel pivot); needle in the groove; nothing through iris, the capsule rim or the cornea
const G85 = cat2({ nuc: { groove: { dep: 0.85 } } }), PH = cat2({ nuc: G85.cat.nuc, inst: [{ kind: 'phaco', p: CAT.grooveTip(G85, 1) }] });
const CR0 = cat2({ nuc: { groove: { dep: 0.9 }, crack: { prog: 0.7 } } }), HW = CAT.nucOf(CAT.norm(CR0)).g1.hw;
const CR = cat2({ nuc: CR0.cat.nuc, inst: [{ kind: 'phaco', p: CAT.groovePt(CR0, 1, -1.0, HW - 0.47, 0.45) }, { kind: 'chopper', via: 'side', p: CAT.groovePt(CR0, 1, -1.0, -(HW - 0.2), 0.4) }] });
const QN = { groove: { dep: 0.9 }, crack: { prog: 1, sep: 0.5 }, rot: 135, groove2: { dep: 0.9 }, crack2: { prog: 1, sep: 0.5 }, quads: [{ q: 0, pull: 1, eat: 0.35 }] };
const Q0 = cat2({ nuc: QN }), QU = cat2({ nuc: QN, inst: [{ kind: 'phaco', p: CAT.quadTip(Q0, 0), bevel: 'down', occl: 1 }] });
const shaftClear = (st, i) => { const c = CAT.norm(st), g = CAT.instGeom(c, c.inst[i]), f = CAT.layersFn(Object.assign({}, st, { cat: Object.assign({}, st.cat, { inst: [] }) }));
  const piv = g.pivot || g.tn.to3(g.tn.pivot), from = g.bend || g.tip, d = G.len(G.cross(G.sub(piv, from), g.axis)), r = g.kind === 'phaco' ? g.rs : g.rr;
  const wp = wallOf(G.mer(piv).z, G.mer(piv).rho); if (!(wp.d > 0 && wp.d < T(wp.s) && near(G.clockOf(piv[0], piv[1]) % 12, g.tn.h % 12, 1e-6))) return { g, d: 1, iris: 0, lensC: 0, lensMax: 0, cornea: 0, rim: 0 };
  const side = G.unit(G.cross(g.axis, [0, 0, 1])), up = G.unit(G.cross(side, g.axis)); let iris = 0, lensC = 0, lensMax = 0, cornea = 0, rim = 0; const tEnd = G.len(G.sub(piv, from));
  for (let t = 0; t <= tEnd; t += 0.03) { const q = G.add(from, g.axis, t), w = wallOf(G.mer(q).z, G.mer(q).rho), oc = f(q);
    if (oc.lens < -0.02) lensC++; if (w.d < T(w.s) && w.s < g.tn.sI - 0.3 && w.d > -0.01) cornea++;
    for (let a = 0; a < 2 * Math.PI; a += Math.PI / 6) { const rr = t < (g.kind === 'phaco' ? CN.phaco.needleL : 0) ? g.rn : r, p = G.add(q, G.add(side.map(v => v * Math.cos(a)), up, Math.sin(a)), rr - 0.01), o = f(p);
      if (o.iris < 0) iris++; if (o.lens < 0) lensMax = Math.max(lensMax, -o.lens); const lr = Math.hypot(p[0], p[1]); if (lr > RC + 0.05 && lr < L.Req && p[2] < L.zAnt(lr) && p[2] > L.zc) rim = Math.max(rim, L.zAnt(lr) - p[2]); } }
  return { g, d, iris, lensC, lensMax, cornea, rim }; };
for (const [nm, st, i] of [['phaco in the groove (deepest stroke)', PH, 0], ['phaco cracking', CR, 0], ['phaco on a quadrant', QU, 0], ['chopper cracking (side port)', CR, 1]]) {
  const R = shaftClear(st, i);
  ok(R.d < 1e-9 && R.g.via === (R.g.kind === 'chopper' ? 'side' : 'main'), `${nm}: axis through its tunnel pivot (${R.g.via})`);
  ok(R.lensC === 0 && R.iris === 0 && R.cornea === 0, `${nm}: centre line not in lens tissue (${R.lensC}), surface not in the iris (${R.iris}) nor in the cornea outside the tunnel (${R.cornea})`);
  ok(R.lensMax <= 0.5 && R.rim <= 0.5, `${nm}: the sleeve rides over the proximal rhexis edge, pressing ≤ 0.5 mm into soft lens matter (${R.lensMax.toFixed(2)} mm) and under the rim's plane (${R.rim.toFixed(2)} mm; 示意, the capsule is not drawn deformed)`); }
// 12.11 cross-view: instrument tips at the same place in the 12–6 section and the microscope view (u = −y), for phaco and chopper
{ for (const [nm, st, i] of [['phaco', PH, 0], ['chopper', CR, 1]]) { const s = CAT.section({ st, h: 6, win: W12, step: 0.2 }), e = CAT.enface({ st }), g = CAT.instGeom(CAT.norm(st), CAT.norm(st).inst[i]);
    ok(near(s.A['tip' + i][0], -e.A['tip' + i][1], 1e-6) && near(s.A['tip' + i][1], -g.tip[2], 1e-6), `${nm}: tip at the same place in both views (u ${s.A['tip' + i][0].toFixed(2)} = −y ${(-e.A['tip' + i][1]).toFixed(2)})`); } }
// 12.12 the phaco sleeve holds the incision open and the corneal wall bends with the shaft (示意): ≤ 2 corneal pieces per vertical line, a continuous field,
//       the drawn cornea maps back exactly, the bend is smooth, and the bent cornea never reaches the iris
{ const c = CAT.norm(PH), def = CAT.deformer(c), D = def && def.parts && def.parts[0], f = CAT.layersFn(PH), a = G.clockDir(12), P = (r, z) => [r * a[0], r * a[1], z];
  if (!D || !D.bend) ok(false, 'phaco: the deformer works in bend mode');
  else { let maxRuns = 0, two = 0, jump = 0, incons = 0, n = 0, touch = 0;
    for (let r = D.rIn - 1.2; r < D.rOut - 0.03; r += 0.04) { let runs = 0, prev = false, pv = null;
      for (let z = 9.0; z < 12.8; z += 0.004) { const o = f(P(r, z)), inC = o.cornea < 0; if (inC && !prev) runs++; prev = inC;
        if (pv !== null && Math.abs(o.cornea - pv) > 0.012) jump++; pv = o.cornea; if (inC && o.iris < 0.03) touch++;
        if (inC) { const q = def(P(r, z)); if (Math.abs(D.fwd(r, q.q[2]) - z) > 2e-3) incons++; n++; } }
      maxRuns = Math.max(maxRuns, runs); if (runs === 2) two++; }
    let d2 = 0; for (let r = D.r0 + 0.02; r < D.r1 - 0.02; r += 0.01) d2 = Math.max(d2, Math.abs(D.mb(r + 0.01) - 2 * D.mb(r) + D.mb(r - 0.01)));
    ok(maxRuns <= 2 && two > 10 && jump === 0 && incons === 0, `phaco in the tunnel: ≤ 2 corneal pieces per line (${two} lines with roof + lip), continuous field (${jump} steps), maps back within 2 µm (${n} points, ${incons} off)`);
    ok(d2 < 0.003 && touch === 0, `phaco in the tunnel: the bend is smooth (second difference ${(d2 * 1000).toFixed(2)} µm / 0.01 mm), the bent cornea stays ≥ 0.03 mm off the iris (${touch} points)`); } }
// 12.13 cracking: the two instruments sit low in the groove on opposite walls; the crack runs from the floor through the plate, the same extent in both views
{ const c = CAT.norm(CR), NU = CAT.nucOf(c), Gg = NU.g1, tips = c.inst.map(i => CAT.instGeom(c, i).tip), bOf = p => p[0] * Gg.v[0] + p[1] * Gg.v[1], aOf = p => p[0] * Gg.u[0] + p[1] * Gg.u[1];
  const hgt = tips.map(p => p[2] - Gg.zf(aOf(p))), sides = tips.map(bOf);
  ok(sides[0] * sides[1] < 0 && hgt.every(h => h > 0 && h < 0.6) && Math.abs(sides[0]) < Gg.hw && Math.abs(sides[1]) < Gg.hw, `crack: phaco and chopper on opposite walls (b ${sides.map(v => v.toFixed(2)).join(' / ')} mm), ${hgt.map(v => v.toFixed(2)).join(' / ')} mm above the floor`);
  const s = CAT.section({ st: CR, h: 9, off: -0.85, win: { x: -4, y: -11, w: 8, h: 6 }, step: 0.1 }), e = CAT.enface({ st: CR }), ex = CAT.crackExt(0.7), bot = s.A.crack && -s.A.crack[1][1];
  ok(s.A.crack && near(bot, L.zPost(0.85) + 0.02, 0.03) && near(e.A.crackLe, Gg.Lh + ex.out * (CAT.NUCR() - Gg.Lh), 1e-9), `crack at 70 %: through the plate to ${bot ? bot.toFixed(2) : '?'} (posterior capsule ${L.zPost(0.85).toFixed(2)}) in the section; out to ${e.A.crackLe.toFixed(2)} mm in the microscope view (same crackExt)`); }
// 12.14 parted halves: the gap at the centre is the asked separation, the equator stays (squeeze), no lens matter outside the capsular bag
{ const st = cat2({ nuc: { groove: { dep: 0.9 }, crack: { prog: 1, sep: 0.6 } } }), f = CAT.layersFn(st); let g0 = null, g1 = null, outside = 0;
  for (let x = -1; x <= 1; x += 0.002) { if (f([x, 0.0, L.zMid]).lens > 0) { if (g0 === null) g0 = x; g1 = x; } }
  for (let a = 0; a < 2 * Math.PI; a += 0.1) for (let z = L.zp - 0.3; z < L.za + 0.3; z += 0.05) for (const dr of [0.01, 0.1]) { const r = (z > L.zp && z < L.za ? (() => { let lo = 0, hi = 6; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; L.g(m, z) < 0 ? lo = m : hi = m; } return lo; })() : 0) + dr; if (f([r * Math.cos(a), r * Math.sin(a), z]).lens < 0) outside++; }
  ok(g0 !== null && near(g1 - g0, 0.6, 0.01) && outside === 0, `crack parted 0.6 mm: gap at the centre ${(g1 - g0).toFixed(3)} mm, ${outside} lens points outside the bag`); }
// 12.15 rotation: the nucleus turned 90° clockwise (microscope) puts the first groove from 12–6 onto 3–9 (content frame turns with it)
{ const e0 = CAT.enface({ st: cat2({ nuc: { groove: { dep: 0.5 } } }) }), e1 = CAT.enface({ st: cat2({ nuc: { groove: { dep: 0.5 }, rot: 90 } }) });
  const [a0, b0] = e0.A.grooveEnd, [a1, b1] = e1.A.grooveEnd, h12 = G.clockOf(-a0[0], a0[1]), h1 = G.clockOf(-a1[0], a1[1]);
  ok(Math.abs(a0[0]) < 1e-6 && near(h12, 6, 0.01) && near(h1, 9, 0.01) && a1[0] > 0, `rotation: distal groove end at ${h12.toFixed(2)} o'clock (top) → ${h1.toFixed(2)} (right) after 90° clockwise as the surgeon sees it`); }
// 12.16 quadrant removal: only the nucleus moves (the cortex stays), its apex comes to the centre in the iris plane (safe zone, ≥ 2.5 mm in front of the
//       posterior capsule), the moved piece never reaches the iris, and the occluded phaco mouth touches it
{ const c = CAT.norm(QU), NU = CAT.nucOf(c), Q = NU.QD[0], f = CAT.layersFn(Q0), f0 = CAT.layersFn(cat2({ nuc: Object.assign({}, QN, { quads: [] }) }));
  const e = NU.toEye(Q.dq[0], Q.dq[1]), cortex = [e[0] * 4.3, e[1] * 4.3, L.zc], nucOld = [e[0] * 2.0, e[1] * 2.0, L.zMid + 0.15];
  const safe = Q.An[2] - L.zp, r = Math.hypot(Q.An[0], Q.An[1]); let iris = 0, piece = 0;
  for (let x = -4; x <= 4; x += 0.1) for (let y = -4; y <= 4; y += 0.1) for (let z = 8; z <= 11; z += 0.1) { const o = f([x, y, z]); if (o.nuc < 0 && o.iris < 0) iris++; if (o.nuc < 0) piece++; }
  const g = CAT.instGeom(c, c.inst[0]); let dmin = 1e9; for (let x = -1.5; x <= 1.5; x += 0.02) for (let z = Q.An[2] - 1.5; z <= Q.An[2] + 1.5; z += 0.02) { const pE = [x * e[0], x * e[1], z]; if (f(pE).nuc < 0) dmin = Math.min(dmin, G.len(G.sub(pE, g.tip))); }
  ok(f(cortex).lens < 0 && f0(nucOld).nuc < 0 && f(nucOld).nuc > 0, 'quadrant: its nucleus has left its place, the cortex shell stays in the bag');
  ok(r < 1e-6 && safe >= 2.5 && Q.An[2] <= L.za, `quadrant: apex at the centre, ${safe.toFixed(2)} mm in front of the posterior capsule, at or behind the anterior lens pole (iris plane)`);
  ok(iris === 0 && piece > 100, `quadrant: the lifted nucleus never reaches the iris (${iris} of ${piece} samples)`);
  const out = Q.toNow(Q.A0[0] + Q.dq[0] * 2.5, Q.A0[1] + Q.dq[1] * 2.5, Q.A0[2]), lrO = Math.hypot(out[0], out[1]);
  ok(out[2] < Q.An[2] - 0.5 && lrO < Q.An[0] + 2.5, `quadrant: tilted apex-up — a point 2.5 mm out from the apex sits ${(Q.An[2] - out[2]).toFixed(2)} mm below it (the outer part stays down in the bag)`);
  ok(dmin <= g.rn + 0.12, `quadrant: the occluded phaco mouth touches the piece (${dmin.toFixed(2)} mm from the needle centre, needle radius ${g.rn})`); }
// 12.17 fluidics (fluidics.js): foot pedal positions, static infusion pressure, the Veritas numbers with sources, occlusion, and the surge transient
{ const P = [0, 1, 2, 2.5, 3].map(p => FL.state({ pedal: p, occl: 0, set: 'quad' }));
  ok(!P[0].irr && P[1].irr && !P[1].asp && P[2].asp && P[2].us === 0 && P[3].us > 0 && P[4].us === FL.PRESET.quad.us && P[0].flow === 0 && P[1].flow === 0 && P[2].flow > 0,
    `pedal: 0 nothing, 1 irrigation, 2 + aspiration (${P[2].flow} mL/min, 示意), 3 + ultrasound (${P[3].us} % half-way, ${P[4].us} % at the end, 示意)`);
  ok(near(FL.pIrr({ bottle: 81 }), 81 * 0.7356, 1e-9) && near(FL.pIrr({ bottle: 81, ai: true }) - FL.pIrr({ bottle: 81 }), 22, 1e-9) && FL.PRESET.quad.vac === 450 && FL.PRESET.quad.bottle === 81,
    `infusion 81 cm → ${FL.pIrr({ bottle: 81 }).toFixed(1)} mmHg (hydrostatics); Advanced Infusion + 22 mmHg (Quesada 2022); quadrant preset 450 mmHg, 81 cm (Soule 2026)`);
  const o0 = FL.state({ pedal: 2, occl: 1, set: 'quad', tOcc: 0.05 }), o1 = FL.state({ pedal: 2, occl: 1, set: 'quad', tOcc: 5 });
  ok(o1.flow === 0 && o0.vac < o1.vac && near(o1.vac, 450, 1) && o1.iop > P[2].iop, `occluded: flow 0, vacuum builds ${o0.vac.toFixed(0)} → ${o1.vac.toFixed(0)} mmHg (limit 450), pressure back up to ${o1.iop.toFixed(0)} mmHg`);
  const dur = FL.surgeDur('quad'), pk = FL.surgePeak('quad'), vol = pk * FL.NUM.acv; let mx = 0, cont = 0, prev = 0;
  for (let t = 0; t <= dur + 0.5; t += 0.005) { const v = FL.surge(t, 'quad'); mx = Math.max(mx, v); cont = Math.max(cont, Math.abs(v - prev)); prev = v; }
  ok(near(dur, 2.90, 1e-9) && near(FL.surgeDur({ pump: 'venturi', bottle: 41 }), 1.56, 1e-9) && vol >= 30 && vol <= 103 && near(mx, pk, 0.002) && cont < 0.02,
    `surge: ${Math.round(vol)} µL = ${(pk * 100).toFixed(0)} % of a 250 µL chamber (inside 30–103 µL, Scarfone 2026; 示意), lasts ${dur} s (peristaltic, 81 cm; Soule 2026), smooth`);
  ok(FL.surge(dur, 'quad') === 0 && FL.surge(dur + 1, 'quad') === 0 && FL.surge(-0.1, 'quad') === 0 && FL.surge(0.15, 'quad') > 0, 'surge returns the chamber to its baseline (0 at the end and after; 0 before the break)');
  const s0 = sec6({ cat: {} }, 0.2), s1 = sec6({ cat: { surge: pk } }, 0.2), s2 = sec6({ cat: { surge: FL.surge(dur, 'quad') } }, 0.2), acd = s => ENDO + s.A.antPole[1];
  ok(near(acd(s1), 2.72 * (1 - pk), 0.005) && near(acd(s2), acd(s0), 1e-9), `section with the surge: chamber ${acd(s0).toFixed(2)} → ${acd(s1).toFixed(2)} mm at the dip, back to ${acd(s2).toFixed(2)} mm`); }
// 12.18 the new views draw without NaN
{ const all = [HY, PH, CR, QU, cat2({ hydro: { h: 7, prog: 1, block: 1 } }), cat2({ nuc: { groove: { dep: 1, over: 1 } } })].map(st => CAT.section({ st, h: 6, win: W12, step: 0.15 }).svg + CAT.section({ st, h: 9, off: -0.85, cut: true, win: W12, step: 0.15 }).svg + CAT.enface({ st }).svg).join('');
  ok(!/NaN|undefined|Infinity/.test(all), `② views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall globe checks passed');
process.exit(fail ? 1 : 0);
