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

// =====================================================================================================================
// 13. ③ I/A, IOL, closure (cataract.js; sources and the 示意 list: CARD.md 白內障 ③). States as in sample-cataract3.html.
const B3 = { main: { cut: 1 }, side: { cut: 1 }, ccc: { prog: 1, fold: 1, out: 1 } }, cat3 = x => ({ cat: Object.assign({}, B3, x) }), CLEAN = { cortex: new Array(12).fill(0), sub: 0 };
const RIM = CN.cccD / 2, LI = CN.iol, RO = LI.optic / 2;
const tipUnder = (h, r, dep) => { const d = G.clockDir(h); return [r * d[0], r * d[1], L.zAnt(r) - dep]; };
const IA6 = { kind: 'ia', p: tipUnder(6, 3.0, 0.55), port: 'up', occl: 1 };
const SUBT = tipUnder(12, 3.3, 0.7), ASP = { kind: 'iaAsp', via: 'side', p: SUBT, tipDir: [0, 0.866, -0.5], port: 'up', occl: 1 }, IRR = { kind: 'iaIrr', p: [-2.2, 2.4, 10.2] };
const CAUGHT = { kind: 'ia', p: tipUnder(6, 3.8, 0.9), port: 'down', occl: 1 };
const INJ = { kind: 'injector', p: [0, 3.5, 10.6] };
const OVDB = { bag: CLEAN, ovdBag: 1, ovd: 1 };
const S1 = cat3({ ...OVDB, inst: [INJ], iol: { out: 0.3, unfold: 0.15, lead: 1, trail: 0 } }), S2 = cat3({ ...OVDB, inst: [INJ], iol: { out: 0.8, unfold: 0.5, lead: 1, trail: 0 } });
const S3 = cat3({ ...OVDB, iol: { out: 1, unfold: 1, lead: 1, trail: 0 } }), S4 = cat3({ ...OVDB, iol: { rot: -50 } });
const FIN = cat3({ bag: Object.assign({}, CLEAN, { collapse: 1 }), ovdBag: 1, ovdOut: { behind: 1, front: 1 }, iol: { rot: -50 } });
// clearance of an instrument shaft (tip → bend → its tunnel pivot): iris, cornea outside the tunnel, the anterior capsule sheet (a cross-section of the
// shaft with points on both sides of it where the capsule is still there), behind the posterior capsule
function shaft3(st, i) {
  const c = CAT.norm(st), g = CAT.instGeom(c, c.inst[i]), f = CAT.layersFn(Object.assign({}, st, { cat: Object.assign({}, st.cat, { inst: [] }) })), Bb = CAT.bagOf(c);
  const piv = g.pivot || g.tn.to3(g.tn.pivot), segs = g.bend ? [[g.tip, g.bend], [g.bend, piv]] : [[g.tip, piv]], R = { iris: 0, cornea: 0, antCap: 0, postCap: 0, g, piv };
  for (const [a, b] of segs) { const L3 = G.len(G.sub(b, a)), ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let t = 0; t <= L3; t += 0.03) { const q = G.add(a, ax, t), rr = g.kind === 'ia' && a === g.tip && t > CN.ia.sleeveBack ? g.rs : (g.rn || g.ro || g.rr || 0.2); let above = 0, below = 0;
      for (let k = 0; k < 12; k++) { const an = 2 * Math.PI * k / 12, p = G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), rr - 0.01), o = f(p), w = wallOf(G.mer(p).z, G.mer(p).rho);
        if (o.iris < 0) R.iris++; if (w.d < T(w.s) && w.d > -0.01 && w.s < g.tn.sI - 0.3) R.cornea++;
        const r = Math.hypot(p[0], p[1]); if (Bb && r < L.Req) { if (!CAT.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { if (p[2] > Bb.zA(r)) above++; else below++; } if (p[2] < Bb.zP(r, p[0], p[1])) R.postCap++; } }
      if (above && below) R.antCap++; } }
  R.axisOK = G.len(G.cross(G.sub(piv, g.bend || g.tip), g.axis)) < 1e-9; return R; }
// the IOL against the eye: sample points on the optic (both faces) and round each haptic; hidden ones (still in the nozzle) skipped
function iolPts(IO) { const pts = [], hr = IO.hr;
  for (let u = -RO; u <= RO + 1e-9; u += 0.25) for (let v = -RO; v <= RO + 1e-9; v += 0.25) { const rho = Math.hypot(u, v); if (rho > RO) continue; for (const sg of [1, -1]) pts.push({ p: IO.toEye(u, v, sg * CAT.optHalf(rho) * 0.98), part: 'optic' }); }
  IO.haps.forEach((H, j) => { for (let i = 0; i < H.length; i++) { const a = H[Math.max(0, i - 1)], b = H[Math.min(H.length - 1, i + 1)], ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let k = 0; k < 8; k++) { const an = 2 * Math.PI * k / 8; pts.push({ p: G.add(H[i], G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), hr * 0.95), part: 'hap' + j, i }); } } });
  return pts.filter(q => !(IO.hid(q.p) > 0)); }
function iolClash(st) {
  const c = CAT.norm(st), IO = CAT.iolOf(c), Bb = CAT.bagOf(c), f = CAT.layersFn(st), Lf = CAT.liftZ(c, 0), pts = iolPts(IO), bins = new Map(); let iris = 0, cornea = 0, post = 0, outBag = { optic: 0, hap0: 0, hap1: 0 };
  for (const q of pts) { const p = q.p, o = f(p), r = Math.hypot(p[0], p[1]), z = p[2] - Lf; if (o.iris < 0) iris++; if (o.cornea < 0) cornea++;
    if (r < L.Req && z < Bb.zP(r, p[0], p[1])) post++; if (Bb.g(r, z, p[0], p[1]) > 0) outBag[q.part]++;
    if (r > RIM + 0.02 && r < L.Req - 0.05 && !CAT.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { const k = Math.round(p[0] / 0.15) + ',' + Math.round(p[1] / 0.15), e = bins.get(k) || [0, 0]; e[z > Bb.zA(r) ? 0 : 1]++; bins.set(k, e); } }
  let straddle = 0; for (const e of bins.values()) if (e[0] && e[1]) straddle++;
  // a haptic centreline passing through the anterior capsule sheet (not through the rhexis opening): sign change of z − zA along it where the capsule is
  for (const H of IO.haps) { let prev = null; for (let i = 1; i < H.length; i++) for (let t = 0; t < 1; t += 0.05) { const p = H[i - 1].map((v, j) => v + (H[i][j] - v) * t);
    if (IO.hid(p) > 0) { prev = null; continue; } const r = Math.hypot(p[0], p[1]); if (!(r > RIM + 0.02 && r < L.Req - 0.05) || CAT.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { prev = null; continue; }
    const sg = p[2] - Lf > Bb.zA(r); if (prev !== null && prev !== sg) straddle++; prev = sg; } }
  return { iris, cornea, post, straddle, outBag, n: pts.length, IO, c, Bb }; }
// 13.1 IOL sizes (Osawa 2021: a one-piece hydrophobic acrylic IOL with a 6.0 mm optic and 13.0 mm overall; 院內型號待確認), the ① optic agrees
{ const IO = CAT.iolOf(CAT.norm(S4)), [F0, F1] = IO.shapes.map(H => H.free), span = G.len(G.sub(F0[F0.length - 1], F1[F1.length - 1]));
  const ring = IO.ring, dia = Math.max(...ring.map(p => G.len(G.sub(p, IO.O)))) * 2;
  ok(near(span, 13.0, 0.05) && near(dia, 6.0, 0.01) && LI.optic === CN.optic, `IOL as made: overall ${span.toFixed(2)} mm (haptic tip to tip), optic ${dia.toFixed(2)} mm = 13.0 / 6.0 (Osawa 2021), same optic as ① (${CN.optic})`);
  // in the bag the haptics are compressed: 13.0 is wider than the bag (model 9.64; Vass 1999 in vivo 10.37 ± 0.25 with a ring), the centrelines stay inside the equator
  let rMax = 0; for (const H of IO.haps) for (const p of H) rMax = Math.max(rMax, Math.hypot(p[0], p[1]));
  ok(LI.overall > 10.37 + 3 * 0.25 && rMax + LI.hw / 2 <= L.Req - 0.02, `haptics compressed in the bag: 13.0 mm > bag diameter (Vass 1999 10.37 ± 0.25; model ${L.LED.toFixed(2)}); haptic edge ${(rMax + LI.hw / 2).toFixed(2)} mm ≤ equator ${L.Req.toFixed(2)} − capsule`); }
// 13.2 the emptied bag: no nucleus; cortex only as a sheet on the capsule (none inside the rhexis in front), thicker under the main incision (12 o'clock)
{ const f = CAT.layersFn(cat3({ bag: {} })); let nuc = 0, deep = 0, inRhexis = 0, n = 0;
  for (let x = -4.8; x <= 4.8; x += 0.2) for (let z = L.zp - 0.1; z <= L.za + 0.1; z += 0.05) { const p = [x, 0.07, z], o = f(p); if (o.nuc < 0) nuc++; if (o.lens < 0) { n++; if (-o.bag > CN.cortex.sheet + CN.cortex.sub + 0.02) deep++; if (Math.abs(x) < RIM - 0.1 && z > L.zc) inRhexis++; } }
  const thick = h => { const d = G.clockDir(h), r = RIM + 0.6; let t = 0; for (let z = L.zAnt(r); z > L.zAnt(r) - 1.2; z -= 0.005) if (f([r * d[0], r * d[1], z]).lens < 0) t += 0.005; return t; };
  const t12 = thick(12), t6 = thick(6);
  ok(nuc === 0 && n > 50 && deep === 0 && inRhexis === 0, `emptied bag: no nucleus (${nuc}); cortex only within ${(CN.cortex.sheet + CN.cortex.sub).toFixed(2)} mm of the capsule (${deep} deeper of ${n}); none in front more than 0.1 mm inside the rhexis edge (${inRhexis})`);
  ok(t12 > 2 * t6 && t6 > 0.1, `subincisional cortex: ${t12.toFixed(2)} mm thick under the 12 o'clock rim vs ${t6.toFixed(2)} at 6 o'clock (示意)`); }
// 13.3 aspiration progress by clock sector: the sweep clears the sectors it has passed; the microscope haze and the section follow the same sector values
{ const sw = CAT.cortexSweep(4 / 12, 2, 1), st = cat3({ bag: { cortex: sw } }), e = CAT.enface({ st, id: 'w' }), f = CAT.layersFn(st);
  const cleared = [2, 3, 4, 5], kept = [7, 8, 9, 10, 11, 0], opC = cleared.map(k => e.A.cortexOp[k]), opK = kept.map(k => e.A.cortexOp[k]);
  const sec = h => { const d = G.clockDir(h), r = RIM + 0.6; let n = 0; for (let z = L.zAnt(r); z > L.zAnt(r) - 0.6; z -= 0.01) if (f([r * d[0], r * d[1], z]).lens < 0) n++; return n; };
  ok(cleared.every(k => sw[k] < 1e-9) && kept.every(k => sw[k] > 1 - 1e-9) && Math.max(...opC) < 0.02 && Math.min(...opK) > 0.2 && sec(3) === 0 && sec(9) > 5,
    `sweep 2→5 o'clock: those sectors cleared (haze ${Math.max(...opC).toFixed(2)}, section ${sec(3)}), the rest kept (haze ≥ ${Math.min(...opK).toFixed(2)}, section ${sec(9)} samples)`); }
// 13.4 coaxial I/A under the 6 o'clock rim: through the main incision, nothing touched on the way; the tip under the rim; port up, in the cortex, seen in the microscope
{ const st = cat3({ bag: {}, inst: [IA6] }), R = shaft3(st, 0), g = R.g, f = CAT.layersFn(cat3({ bag: {} })), rT = Math.hypot(g.tip[0], g.tip[1]);
  ok(R.axisOK && g.via === 'main' && R.iris + R.cornea + R.antCap + R.postCap === 0, `coaxial I/A (6 o'clock): axis through the main tunnel pivot; iris ${R.iris}, cornea ${R.cornea}, anterior capsule ${R.antCap}, posterior capsule ${R.postCap}`);
  ok(rT > RIM + 0.2 && g.tip[2] + g.rn < L.zAnt(rT) && g.pdir[2] > 0.9 && f(G.add(g.port, g.pdir, 0.05)).lens < 0, `tip ${(rT - RIM).toFixed(2)} mm under the rim, below the capsule; port faces up (${g.pdir[2].toFixed(2)}) into the cortex`);
  const eU = CAT.enface({ st, id: 'u' }), eD = CAT.enface({ st: cat3({ bag: {}, inst: [Object.assign({}, IA6, { port: 'down' })] }), id: 'u' }), n = s => (s.match(/<ellipse [^>]*fill="(#1c232a|#f4efe0)"/g) || []).length;
  ok(n(eU.svg) === 1 && n(eD.svg) === 0, `microscope: the port shows when it faces up (${n(eU.svg)}), not when it faces down (${n(eD.svg)})`);
  const s = sec6(st, 0.2); ok(near(s.A.tip0[0], -eU.A.tip0[1], 1e-6) && near(s.A.tip0[1], -g.tip[2], 1e-6), `I/A tip at the same place in both views (u ${s.A.tip0[0].toFixed(2)} = −y)`); }
// 13.5 centripetal stripping: the sheet peels from the rim outward as the strip goes on; the strand hangs from the port (both views)
{ const vol = p => { const f = CAT.layersFn(cat3({ bag: { strip: { h: 6, prog: p } }, inst: [IA6] })); let n = 0; for (let r = 2.4; r < 4.85; r += 0.05) for (let z = L.zp; z < L.za; z += 0.03) if (f([0, -r, z]).lens < 0) n++; return n; };
  const V = [0, 0.3, 0.6, 0.9].map(vol), st = cat3({ bag: { strip: { h: 6, prog: 0.35 } }, inst: [IA6] }), c = CAT.norm(st), S = CAT.stripStrand(c), g = CAT.instGeom(c, c.inst[0]);
  const F1 = CAT.stripFront(c, 0.2), F2 = CAT.stripFront(c, 0.5), e = CAT.enface({ st }), s = sec6(st, 0.2);
  ok(V.every((v, i) => i === 0 || v < V[i - 1]) && F2.rA > F1.rA, `stripping: the 6 o'clock sheet shrinks ${V.join(' → ')} samples; the peel front moves out ${F1.rA.toFixed(2)} → ${F2.rA.toFixed(2)} mm`);
  ok(G.len(G.sub(S.end, g.port)) < 1e-9 && near(e.A.strandEnd[0], -g.port[0], 1e-6) && s.A.strand && near(s.A.strand.end[0], -e.A.strandEnd[1], 1e-6), 'stripped strand ends at the port, the same point in the section and the microscope'); }
// 13.6 subincisional cortex (Colvard 1997; 示意 geometry): a straight coaxial tip from the 12 o'clock incision cannot get under the 12 o'clock rim (it runs
//      into the iris or the anterior capsule); the bimanual aspirator through the side port reaches it, port up in the thick subincisional cortex
{ const R0 = shaft3(cat3({ bag: {}, inst: [{ kind: 'ia', p: SUBT, port: 'up' }] }), 0), st = cat3({ bag: {}, inst: [ASP, IRR] }), R1 = shaft3(st, 0), R2 = shaft3(st, 1), g = R1.g, f = CAT.layersFn(cat3({ bag: {} }));
  ok(R0.iris + R0.antCap > 0, `coaxial from the main incision to the subincisional cortex: blocked (iris ${R0.iris}, anterior capsule ${R0.antCap})`);
  ok(R1.axisOK && g.via === 'side' && R1.iris + R1.cornea + R1.antCap + R1.postCap === 0 && R2.axisOK && R2.g.via === 'main' && R2.iris + R2.cornea + R2.antCap === 0,
    `bimanual: aspirator through the side port (iris ${R1.iris}, cornea ${R1.cornea}, anterior capsule ${R1.antCap}), irrigation through the main incision (iris ${R2.iris}, cornea ${R2.cornea})`);
  const hT = G.clockOf(g.tip[0], g.tip[1]), rT = Math.hypot(g.tip[0], g.tip[1]);
  ok(Math.abs(CAT.dH(hT, 12)) < 0.3 && rT > RIM + 0.3 && g.pdir[2] > 0.8 && f(G.add(g.port, g.pdir, 0.05)).lens < 0, `aspirator tip at ${hT.toFixed(1)} o'clock, ${(rT - RIM).toFixed(2)} mm under the rim, port up in the subincisional cortex`); }
// 13.7 hydro-dispersion (Miyoshi 2022: 27G blunt cannula through the side port, BSS toward the fornix under the incision): the subincisional cortex is lifted off
{ const HD = { kind: 'cannula', via: 'side', p: [0, 2.2, L.zAnt(2.2) + 0.05] }, st = cat3({ bag: { disp: 1 }, inst: [HD] }), R = shaft3(st, 0), f0 = CAT.layersFn(cat3({ bag: {} })), f1 = CAT.layersFn(st);
  const col = f => { const r = 3.4, z0 = L.zAnt(r) - 0.03, out = []; for (let z = z0; z > z0 - 0.9; z -= 0.01) out.push(f([0, r, z]).lens < 0 ? 1 : 0); return out; }, c0 = col(f0), c1 = col(f1);
  const gap = c1.indexOf(1) * 0.01;
  ok(R.axisOK && R.g.via === 'side' && R.iris + R.cornea + R.antCap === 0 && near(G.clockOf(R.g.tip[0], R.g.tip[1]) % 12, 0, 0.05) && c0[0] === 1 && gap >= CN.cortex.disp - 0.05, `hydro-dispersion: 27G cannula via the side port, tip at the 12 o'clock rim aimed at the fornix (clear); the subincisional cortex lifted ${gap.toFixed(2)} mm off the capsule (示意)`); }
// 13.8 posterior capsule caught in the port (動畫示意): the capsule tents up to the port's lower edge right under it, only when caught; radial striae converge on it
{ const st = cat3({ bag: { ...CLEAN, caught: 1 }, inst: [CAUGHT] }), c = CAT.norm(st), Bb = CAT.bagOf(c), g = CAT.instGeom(c, c.inst[0]), R = shaft3(cat3({ bag: CLEAN, inst: [CAUGHT] }), 0);
  let best = null; for (let x = -1.5; x <= 1.5; x += 0.02) for (let y = -4.5; y <= -1.5; y += 0.02) { const t = Bb.tent(x, y); if (!best || t > best[2]) best = [x, y, t]; }
  const rp = Math.hypot(g.port[0], g.port[1]), zTop = Bb.zP(rp, g.port[0], g.port[1]), B0 = CAT.bagOf(CAT.norm(cat3({ bag: CLEAN, inst: [CAUGHT] })));
  ok(R.iris + R.cornea + R.antCap + R.postCap === 0 && g.pdir[2] < -0.9 && Math.hypot(best[0] - g.port[0], best[1] - g.port[1]) < 0.03 && near(zTop, g.port[2] - CN.ia.portD / 2, 0.02) && B0.amp === 0,
    `caught: port down (${g.pdir[2].toFixed(2)}); the posterior capsule peaks ${Math.hypot(best[0] - g.port[0], best[1] - g.port[1]).toFixed(3)} mm from under the port and reaches its lower edge (${zTop.toFixed(2)} vs ${(g.port[2] - CN.ia.portD / 2).toFixed(2)}); not caught → no tent`);
  const e = CAT.enface({ st }), C0 = e.A.striaeC, L0 = e.A.striaeLines || []; let worst = 0;
  for (const [a, b] of L0) { const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d), n = [-d[1] / l, d[0] / l]; worst = Math.max(worst, Math.abs((C0[0] - a[0]) * n[0] + (C0[1] - a[1]) * n[1])); }
  const pE = [-g.port[0], g.port[1]];
  ok(L0.length >= 10 && worst < 1e-6 && Math.hypot(C0[0] - pE[0], C0[1] - pE[1]) < 1e-6, `microscope: ${L0.length} radial striae all point at the port (worst ${worst.toExponential(1)} mm off), the port's place in both views`);
  const s = sec6(st, 0.1), run = s.A.capRuns.find(Rr => Rr.pts.some(q => q[0] > 2.5 && -q[1] < L.zc)), q = run && run.pts.reduce((b, q) => Math.abs(q[0] - rp) < Math.abs(b[0] - rp) ? q : b);
  ok(!!q && near(-q[1], zTop, 0.05), `section: the drawn posterior capsule rises to ${q ? (-q[1]).toFixed(2) : '?'} mm under the port (${zTop.toFixed(2)})`); }
// 13.9 OVD compartments: cohesive OVD in the bag only inside the bag, the chamber's OVD only in front of it; removal behind and in front of the optic
//      empties both; the bag cannot close on the IOL while OVD is still behind the optic
{ const st = cat3({ bag: CLEAN, ovdBag: 1, ovd: 1, iol: { rot: -50 } }), f = CAT.layersFn(st); let outB = 0, inBag = 0, nB = 0, nA = 0, behind = 0;
  for (let x = -6; x <= 6; x += 0.15) for (let z = 5; z <= 12; z += 0.1) { const o = f([x, 0.05, z]); if (o.ovdb < 0) { nB++; if (o.bag > 0) outB++; if (z < L.zc - 0.5) behind++; } if (o.ovd < 0) { nA++; if (o.bag < 0) inBag++; } }
  const fR = CAT.layersFn(cat3({ bag: CLEAN, ovdBag: 1, ovd: 0, ovdOut: { behind: 1, front: 1 }, iol: { rot: -50 } })), fH = CAT.layersFn(cat3({ bag: CLEAN, ovdBag: 1, ovd: 1, ovdOut: { behind: 1 }, iol: { rot: -50 } }));
  let left = 0, behindH = 0, frontH = 0; for (let x = -6; x <= 6; x += 0.15) for (let z = 5; z <= 12; z += 0.1) { const o = fR([x, 0.05, z]); if (o.ovdb < 0 || o.ovd < 0) left++; const h = fH([x, 0.05, z]); if (h.ovdb < 0) { if (z < L.zc) behindH++; else frontH++; } }
  const cl = CAT.norm(cat3({ bag: Object.assign({}, CLEAN, { collapse: 1 }), ovdBag: 1, ovdOut: { behind: 0.3 } })).bag.collapse;
  ok(nB > 100 && outB === 0 && behind > 20 && nA > 100 && inBag === 0, `OVD: in the bag ${nB} samples (outside the bag ${outB}, behind the optic ${behind}); in the chamber ${nA} (inside the bag ${inBag})`);
  ok(left === 0 && behindH === 0 && frontH > 20 && near(cl, 0.3, 1e-12), `OVD removal: none left after both (${left}); behind the optic cleared first (${behindH} behind, ${frontH} in front); the bag closes no further than the OVD behind is out (${cl})`); }
// 13.10 IOL insertion stages: the injector through the main incision, bevel down; at every stage the IOL touches neither iris nor cornea and never passes
//       through a capsule; the leading haptic goes into the bag first; the trailing haptic lies outside the bag until it is tucked
{ const R = shaft3(S1, 0), g = R.g; ok(R.axisOK && g.via === 'main' && R.iris + R.cornea + R.antCap === 0 && g.pdir[2] < -0.8 && CN.inj.od < CN.main.w, `injector: through the main incision (iris ${R.iris}, cornea ${R.cornea}), bevel down (${g.pdir[2].toFixed(2)}), nozzle ${CN.inj.od} mm < incision ${CN.main.w} mm (示意)`);
  for (const [nm, st] of [['1 leading haptic in', S1], ['2 optic unfolding', S2], ['3 trailing haptic out', S3], ['4 in the bag (OVD)', S4], ['final (bag closed)', FIN]]) { const X = iolClash(st);
    ok(X.n > 200 && X.iris === 0 && X.cornea === 0 && X.straddle === 0 && X.post === 0, `IOL stage ${nm}: ${X.n} points — iris ${X.iris}, cornea ${X.cornea}, through the anterior capsule ${X.straddle}, behind the posterior capsule ${X.post}`); }
  const Rt = CAT.iolOf(CAT.norm(S3)).roots[1], RH = shaft3(cat3({ ...S3.cat, inst: [{ kind: 'chopper', via: 'side', p: [Rt[0], Rt[1], Rt[2] + 0.3] }] }), 0);
  ok(RH.axisOK && RH.g.via === 'side' && RH.iris + RH.cornea + RH.antCap === 0, `hook through the side port onto the trailing optic–haptic junction: clear (iris ${RH.iris}, cornea ${RH.cornea}, anterior capsule ${RH.antCap})`);
  const X1 = iolClash(S1), lt = X1.IO.tips[0], Bb = X1.Bb, X3 = iolClash(S3), X4 = iolClash(S4), t3 = X3.IO.haps[1];
  const outside = t3.filter(p => { const r = Math.hypot(p[0], p[1]); return r > RIM + 0.1 && r < L.Req && p[2] > X3.Bb.zA(r); }).length;
  ok(Bb.g(Math.hypot(lt[0], lt[1]), lt[2], lt[0], lt[1]) < -0.1 && outside > 8 && X4.outBag.hap1 === 0, `leading haptic tip inside the bag at stage 1; trailing haptic over the anterior capsule (outside the bag) at stage 3 (${outside} points), inside after the tuck`); }
// 13.11 final IOL (Hollick 1999 / Haripriya 2025: optic edge covered by the CCC all round): every IOL point inside the closed bag, haptics at the equator,
//       optic centred, overlap ≥ 0.25 mm at every clock hour; the decentred and the sulcus errors (示意) fail these tests
const finalOK = st => { const X = iolClash(st), IO = X.IO, c = X.c, X0 = CAT.rhex(c.ccc); let ov = 1e9; for (let k = 0; k < 120; k++) { const t = 12 * k / 120, h = (c.ccc.h0 + c.ccc.dir * t + 12) % 12, d = G.clockDir(h), Rr = X0.R(t);
    ov = Math.min(ov, RO - Math.hypot(Rr * d[0] - IO.O[0], Rr * d[1] - IO.O[1])); }
  let rH = 0; for (const H of IO.haps) for (const p of H.slice(-10)) rH = Math.max(rH, Math.hypot(p[0], p[1]));
  return { inBag: X.outBag.optic + X.outBag.hap0 + X.outBag.hap1 === 0, ov, centred: Math.hypot(IO.O[0], IO.O[1]), rH, X }; };
{ const A = finalOK(FIN), D = finalOK(cat3({ ...FIN.cat, iol: { rot: -50, dx: 0.8 } })), Sl = finalOK(cat3({ ...FIN.cat, bag: CLEAN, ovdOut: { behind: 1, front: 1 }, iol: { rot: -50, sulcus: 1 } }));
  ok(A.inBag && A.centred < 1e-9 && A.ov >= 0.25 && A.rH <= L.Req && A.rH > L.Req - 0.6, `final IOL: all inside the bag, centred, optic edge under the CCC by ≥ ${A.ov.toFixed(3)} mm all round, haptics at the equator (r ${A.rH.toFixed(2)} ≤ ${L.Req.toFixed(2)})`);
  ok(D.ov < 0 && !Sl.inBag && Sl.X.outBag.hap1 > 0, `errors fail the test: decentred 0.8 mm → overlap ${D.ov.toFixed(2)} mm (edge exposed); sulcus → trailing haptic outside the bag (${Sl.X.outBag.hap1} points)`); }
// 13.12 the bag closed on the IOL after the OVD behind it is out: posterior capsule on the optic's back, the rim on its front; the chamber is deeper than before
//       (示意 amount); a shallow chamber (surge-like collapse, Liu 2023) and its restoration move the whole diaphragm
{ const c = CAT.norm(FIN), Bb = CAT.bagOf(c), IO = CAT.iolOf(c), rR = RIM + 0.05, back = IO.O[2] - CAT.optHalf(0), front = IO.O[2] + CAT.optHalf(rR);
  const gB = back - Bb.zP(0, 0, 0), gF = Bb.zA(rR) - front, endo = ENDO, acd = endo - (IO.O[2] + CAT.optHalf(0));
  ok(gB > 0 && gB < 0.01 && gF > 0 && gF < CN.cap.antMax + 0.005, `closed bag: posterior capsule ${(gB * 1000).toFixed(0)} µm behind the optic, rim ${(gF * 1000).toFixed(0)} µm in front of it (one capsule thickness)`);
  const sh = CAT.iolOf(CAT.norm(cat3({ ...FIN.cat, surge: 0.4 }))), acdS = endo - (sh.O[2] + CAT.optHalf(0));
  ok(acd > 2.72 + 1.0 && near(acd - acdS, 0.4 * 2.72, 1e-6), `pseudophakic chamber ${acd.toFixed(2)} mm (phakic 2.72; 示意 position); shallowed by 40 % → ${acdS.toFixed(2)} mm, restored at 0`); }
// 13.13 cross-view: IOL centre and haptic tips at the same place in the 12–6 section and the microscope view
{ for (const st of [S2, FIN]) { const s = sec6(st, 0.3), e = CAT.enface({ st }), IO = CAT.iolOf(CAT.norm(st));
    ok(near(s.A.iolC[0], -e.A.iolC[1], 1e-6) && near(e.A.iolC[0], -IO.O[0], 1e-6) && near(s.A.hapTip0[0], -e.A.hapTip0[1], 1e-6) && near(s.A.hapTip1[0], -e.A.hapTip1[1], 1e-6) && near(e.A.hapTip0[0], -IO.tips[0][0], 1e-6) && near(s.A.iolC[1], -IO.O[2], 1e-6),
      `IOL (${st === FIN ? 'final' : 'unfolding'}): centre and haptic tips the same in both views (u = −y)`); } }
// 13.14 closure: the unhealed wound gapes at its inner aspect (McDonnell 2003; size 示意) and stromal hydration closes it; the hydration cannula's tip is in the
//       stroma of the lateral wall (Mifflin 2012: hydrate the lateral walls; the stroma whitens), the whitening stays in the cornea, at both lateral ends
{ const sG = CAT.section({ st: cat3({ ...FIN.cat, seal: { gape: 1 } }), h: 6, win: { x: -7.4, y: -12.7, w: 5, h: 5.7 }, step: 0.05, id: 'g' }), tn = CAT.tunnelOf(CN.main);
  const sH = CAT.section({ st: cat3({ ...FIN.cat, seal: { gape: 1, hydr: 1 } }), h: 6, win: { x: -7.4, y: -12.7, w: 5, h: 5.7 }, step: 0.05, id: 'h' }), inn = [-tn.int[0], -tn.int[1]];
  ok(sG.A.gape > 0 && Math.hypot(sG.A.gapeAt[0] - inn[0], sG.A.gapeAt[1] - inn[1]) < 0.15 && sH.A.gape === 0, `wound: gapes ${(sG.A.gape * 1000).toFixed(0)} µm at the inner opening (示意); closed after stromal hydration`);
  const st = cat3({ ...FIN.cat, seal: { hydr: 1 }, inst: [{ kind: 'hcan', side: 1, f: 0.3 }, { kind: 'hcan', side: -1, f: 0.3 }] }), c = CAT.norm(st), f = CAT.layersFn(cat3({ ...FIN.cat })); let bad = 0;
  for (const i of [0, 1]) { const g = CAT.instGeom(c, c.inst[i]), w = wallOf(G.mer(g.tip).z, G.mer(g.tip).rho), lat = g.tip[0] * G.clockDir(15)[0] + g.tip[1] * G.clockDir(15)[1];
    if (!(w.d > 0.05 && w.d < T(w.s) - 0.05 && Math.abs(lat) > CN.main.w / 2 && f(g.tip).cornea < 0 && f(g.tip).aqueous > 0 && G.add(g.tip, g.axis, 3)[2] > g.tip[2])) bad++; }
  const e = CAT.enface({ st }), ends = [e.A.mainExt], wE = CN.main.w / 2, blobs = e.A.sealBlobs || [], dist = blobs.map(b => Math.abs(Math.abs(b[0] - e.A.mainExt[0]) - wE));
  const clip = /clipPath id="h_sealc"><path d="[^"]+" clip-rule="evenodd"\/><\/clipPath><path d="[^"]+" fill="#ffffff"[^>]*clip-path="url\(#h_sealc\)"/.test(sH.svg);
  ok(bad === 0 && blobs.length === 2 && Math.max(...dist) < 1e-6 && clip, `stromal hydration: both cannula tips in the lateral walls' stroma (${bad} off); whitening at both incision ends (${blobs.length}) and, in the section, clipped to the cornea`); }
// 13.15 the ③ views draw without NaN
{ const all = [S1, S2, S3, S4, FIN, cat3({ bag: {}, inst: [IA6] }), cat3({ bag: { ...CLEAN, caught: 1 }, inst: [CAUGHT] }), cat3({ bag: {}, inst: [ASP, IRR] }), cat3({ ...FIN.cat, seal: { gape: 1, hydr: 0.5 }, inst: [{ kind: 'hcan', side: 1 }] })]
    .map(st => CAT.section({ st, h: 6, win: W12, step: 0.2 }).svg + CAT.section({ st, h: 9, cut: true, win: W12, step: 0.2 }).svg + CAT.enface({ st }).svg).join('');
  ok(!/NaN|undefined|Infinity/.test(all), `③ views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }
// 13.16 angled coaxial I/A tip (optional inst.ang; case A used one angled tip for all of the cortex). CN.iaAng: bend 90°, bent part 1.8 mm, sleeve from
//       0.5 mm behind the bend, port on the face toward the cornea when the bend points to the surgeon's left, ±0.45 mm play of the sleeve in the
//       incision (示意; the bend and length read on the 13:34.5 freeze). Clearance as 13.4 (iris, cornea outside the tunnel, a cross-section straddling the
//       anterior capsule, behind the posterior capsule) plus a stricter capsule test: a sign change of (z − anterior capsule) along any of 13 lines
//       parallel to the shaft where the capsule is still there — a steep shaft piercing the capsule never shows up as one horizontal cross-section
//       straddling it. Incision at 12 here (the video's is 11.3: the same reach turned by the difference).
const AG = CN.iaAng;
function clear3(st, i) {
  const c = CAT.norm(st), g = CAT.instGeom(c, c.inst[i]), f = CAT.layersFn(Object.assign({}, st, { cat: Object.assign({}, st.cat, { inst: [] }) })), Bb = CAT.bagOf(c);
  const piv = g.pivot, segs = g.bend ? [[g.tip, g.bend], [g.bend, piv]] : [[g.tip, piv]], R = { iris: 0, cornea: 0, antCap: 0, pierce: 0, postCap: 0, g }, prev = new Array(13).fill(null);
  for (const [a, b] of segs) { const L3 = G.len(G.sub(b, a)), ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let t = 0; t <= L3; t += 0.03) { const q = G.add(a, ax, t), rr = g.ang ? (a === g.bend && t > AG.sleeveBack ? g.rs : g.rn) : g.kind === 'ia' && a === g.tip && t > CN.ia.sleeveBack ? g.rs : (g.rn || g.rr || 0.2); let above = 0, below = 0;
      for (let k = 0; k < 13; k++) { const an = 2 * Math.PI * k / 12, p = k === 12 ? q : G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), rr - 0.01), o = f(p), w = wallOf(G.mer(p).z, G.mer(p).rho);
        if (o.iris < 0) R.iris++; if (w.d < T(w.s) && w.d > -0.01 && w.s < g.tn.sI - 0.3) R.cornea++;
        const r = Math.hypot(p[0], p[1]);
        if (Bb && r < L.Req && !CAT.bare(c.ccc, r, G.clockOf(p[0], p[1]))) { const sg = p[2] > Bb.zA(r); if (sg) above++; else below++; if (prev[k] !== null && prev[k] !== sg) R.pierce++; prev[k] = sg; } else prev[k] = null;
        if (Bb && r < L.Req && p[2] < Bb.zP(r, p[0], p[1])) R.postCap++; }
      if (above && below) R.antCap++; } }
  R.n = R.iris + R.cornea + R.antCap + R.pierce + R.postCap; return R; }
const ANGT = (h, la, r, dep, roll, o = {}) => Object.assign({ kind: 'ia', ang: true, roll, lat: la, p: tipUnder(h, RIM + r, dep), occl: 1 }, o);
const angSt = (...a) => cat3({ bag: {}, inst: [ANGT(...a)] });
// poses found by a search on the model (2026-11-10): [clock hour, lateral play mm, mm beyond the rim, mm under the capsule, handpiece turn °]
const REACH = [[1, -0.45, 0.15, 0.8, 40], [1.5, -0.45, 0.25, 0.69, 50], [2, -0.45, 0.25, 0.58, 60], [2.5, -0.45, 0.4, 0.58, 70], [3, -0.45, 0.4, 0.47, 80], [3.5, -0.45, 0.55, 0.47, 90],
  [4, -0.45, 0.4, 0.47, 90], [4.5, 0, 0.55, 0.47, 90], [5, -0.45, 0.15, 0.47, 90], [5.5, 0.45, 0.15, 0.47, 90], [6, 0.45, 0.25, 0.47, 100], [6.5, 0.45, 0.4, 0.47, 110],
  [7, 0.45, 0.55, 0.58, -110], [7.5, 0.45, 0.55, 0.47, -110], [8, 0, 0.55, 0.8, -70], [8.5, 0.45, 0.55, 0.69, -90], [9, -0.45, 0.25, 0.8, -50], [9.5, -0.45, 0.15, 0.8, -50],
  [10, 0, 0.15, 0.8, -40], [10.5, -0.45, 0.15, 0.8, -40], [11, 0.45, 0.15, 0.8, -40]];
// rigid shape through the main incision: the bend angle and length as made, the shaft through the main tunnel pivot (within the play), the sleeve in the eye
{ let worst = 0, piv = 0, via = 0; for (const q of REACH) { const c = CAT.norm(angSt(...q)), g = CAT.instGeom(c, c.inst[0]), tn = CAT.tunnelOf(c.main), pv = tn.to3(tn.at(CN.ia.pivotF), q[1]);
    worst = Math.max(worst, Math.abs(Math.acos(-G.dot(g.axis, g.u)) / D2R - AG.ang), Math.abs(G.len(G.sub(g.tip, g.bend)) - AG.L)); piv = Math.max(piv, G.len(G.cross(G.sub(pv, g.bend), g.axis))); if (g.via !== 'main' || g.tn !== tn) via++; }
  const gS = CAT.instGeom(CAT.norm(angSt(3, 0, 0.4, 0.47, 80)), Object.assign(ANGT(3, 0, 0.4, 0.47, 80), { via: 'side' })), gL = CAT.instGeom(CAT.norm(angSt(3, 2, 0.4, 0.47, 80)), ANGT(3, 2, 0.4, 0.47, 80)), tn = CAT.tunnelOf(CN.main);
  const off = G.len(G.sub(gL.pivot, tn.to3(tn.at(CN.ia.pivotF)))), sideFit = CN.ia.sleeveOD > CN.side.w && CN.ia.sleeveOD + 2 * AG.play <= CN.main.w + 1e-9;
  const sPiv = G.len(G.sub(gS.pivot, tn.to3(tn.at(CN.ia.pivotF))));
  ok(worst < 1e-6 && piv < 1e-9 && via === 0 && gS.via === 'main' && gS.tn === tn && sPiv < 1e-9 && near(off, AG.play, 1e-9) && sideFit,
    `angled I/A tip: rigid (bend ${AG.ang}°, ${AG.L} mm; worst error ${worst.toExponential(1)}), shaft through the main tunnel pivot (${piv.toExponential(1)} mm off) in all ${REACH.length} poses; asked through the side port it still goes through the main incision (sleeve ${CN.ia.sleeveOD} mm > side port ${CN.side.w} mm); play clamped to ±${AG.play} mm (asked 2 → ${off.toFixed(2)})`); }
// reach: under the rim at every half hour from 1 to 11 o'clock (the incision at 12), nothing touched; the straight tip only reaches 4–8 (13.6); directly
// under the incision (11.5–0.5) no pose of a coarse search clears — there the cortex is engaged from the side (case A: the bend turned sideways to 1.6 h)
{ const bad = []; for (const q of REACH) { const R = clear3(angSt(...q), 0), g = R.g, rT = Math.hypot(g.tip[0], g.tip[1]), Bb = CAT.bagOf(CAT.norm(angSt(...q)));
    if (R.n || !(rT > RIM + 0.1) || !(g.tip[2] + g.rn < Bb.zA(rT)) || Math.abs(CAT.dH(G.clockOf(g.tip[0], g.tip[1]), q[0])) > 0.01) bad.push(`${q[0]}h (${['iris', 'cornea', 'antCap', 'pierce', 'postCap'].map(k => k + ' ' + R[k]).join(', ')})`); }
  ok(!bad.length, `angled tip under the rim (≥ 0.1 mm beyond it, below the capsule) at ${REACH.length} clock positions 1–11 o'clock, nothing touched${bad.length ? '; failed: ' + bad.join('; ') : ''}`);
  let found = 0, tried = 0; for (const h of [11.5, 12, 0.5]) for (const la of [-AG.play, 0, AG.play]) for (const r of [0.15, 0.3]) for (const dep of [0.3, 0.55, 0.8]) for (let roll = -180; roll < 180; roll += 15) { tried++; if (!clear3(angSt(h, la, r, dep, roll), 0).n) found++; }
  const R6 = clear3(cat3({ bag: {}, inst: [IA6] }), 0);
  ok(found === 0 && R6.n === 0, `directly under the incision (11.5, 12, 0.5 o'clock): 0 of ${tried} angled-tip poses clear (found ${found}); the straight tip under the 6 o'clock rim passes the stricter test too (${R6.n})`); }
// the port turns with the handpiece: in the handpiece's own frame (shaft, bend direction, their normal) it stays put whatever the turn; it faces the cornea
// when the bend points to the surgeon's left (1–6.5 o'clock) and the posterior capsule when it points right (7–11); on the bent part's surface
{ const fr = g => { const d = G.unit(g.axis.map(v => -v)), b = G.unit(G.sub(g.u, d.map(v => v * G.dot(g.u, d)))), n = G.cross(d, b); return [G.dot(g.pdir, d), G.dot(g.pdir, b), G.dot(g.pdir, n)]; };
  const F = [-90, 0, 90, 180].map(roll => fr(CAT.instGeom(CAT.norm(angSt(4, 0, 0.4, 0.47, roll)), ANGT(4, 0, 0.4, 0.47, roll)))), spread = Math.max(...[0, 1, 2].map(k => Math.max(...F.map(f => f[k])) - Math.min(...F.map(f => f[k]))));
  let up = 0, down = 0, surf = 0; for (const q of REACH) { const g = CAT.instGeom(CAT.norm(angSt(...q)), ANGT(...q)), sb = G.add(g.tip, g.u, -CN.ia.portBack);
    if (q[4] > 0 ? g.pdir[2] > 0.5 : g.pdir[2] < 0) (q[4] > 0 ? up++ : down++); surf = Math.max(surf, Math.abs(G.len(G.sub(g.port, sb)) - g.rn), Math.abs(G.dot(g.pdir, g.u))); }
  const nU = REACH.filter(q => q[4] > 0).length, nD = REACH.length - nU;
  ok(spread < 1e-9 && up === nU && down === nD && surf < 1e-9, `angled-tip port fixed on the handpiece (spread ${spread.toExponential(1)} over four turns); faces the cornea in ${up}/${nU} poses with the bend to the left, the posterior capsule in ${down}/${nD} with it to the right; on the tip's surface`); }
// both views: the port shows in the microscope only when it faces the cornea; tip and port at the same place in the 12–6 section and the microscope view
{ const sU = angSt(5.5, 0.45, 0.15, 0.47, 90), sD = angSt(7.5, 0.45, 0.55, 0.47, -110), n = s => (s.match(/<ellipse [^>]*fill="(#1c232a|#f4efe0)"/g) || []).length;
  const eU = CAT.enface({ st: sU, id: 'u' }), eD = CAT.enface({ st: sD, id: 'u' }), s = sec6(sU, 0.2), g = CAT.instGeom(CAT.norm(sU), CAT.norm(sU).inst[0]);
  ok(n(eU.svg) === 1 && n(eD.svg) === 0 && near(s.A.tip0[0], -eU.A.tip0[1], 1e-6) && near(s.A.tip0[1], -g.tip[2], 1e-6) && near(eU.A.tip0[0], -g.tip[0], 1e-6),
    `angled tip in both views: port drawn when it faces the cornea (${n(eU.svg)}), hidden when it faces down (${n(eD.svg)}); tip the same in the section and the microscope (u = −y)`);
  const all = REACH.filter((_, i) => i % 4 === 0).map(q => { const st = angSt(...q); return CAT.section({ st, h: 6, win: W12, step: 0.2 }).svg + CAT.section({ st, h: 9, cut: true, win: W12, step: 0.2 }).svg + CAT.enface({ st }).svg; }).join('');
  ok(!/NaN|undefined|Infinity/.test(all), `angled-tip views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }

// =====================================================================================================================
// 14. ④ PCR and the left eye (cataract.js; sources and the 示意 list: CARD.md 白內障 ④). States as in sample-cataract4.html: OS, surgeon at 12,
//     main incision 11 o'clock, side port 2 o'clock (the case, 2026-11-10); sections through 11–5 (left = 11).
const P4 = CN.pcr, HP4 = 5, U4 = G.clockDir(HP4);
const B4 = { main: { h: 11, cut: 1 }, side: { h: 2, cut: 1 }, ccc: { prog: 1, fold: 1, out: 1 } }, cat4 = x => ({ eye: 'OS', cat: Object.assign({}, B4, x) });
const RENT4 = { h: 5, r: 1.6, size: 1.4 }, PIECE4 = { h: 8 }, pc4 = st => CAT.pcrOf(st);
const REC40 = cat4({ bag: {}, pcr: { rent: RENT4, deep: 1, vit: { bulge: 1 }, frag: Object.assign({ sink: 1 }, PIECE4) } });
const onTop4 = (FR, a, b) => { let n = 0; while (FR.fld(FR.at3(a, b, n)) < 0 && n < 2) n += 0.005; const q = FR.at3(a, b, n); return [q[0], q[1], q[2] + 0.47]; };
const REST4 = cat4({ bag: {}, pcr: { rent: RENT4, frag: PIECE4 } }), PH4 = { kind: 'phaco', p: onTop4(pc4(REST4).FR, 0.4, 0.1), bevel: 'up' }, REC4 = cat4({ ...REC40.cat, inst: [PH4] });
const PRO4 = cat4({ bag: {}, pcr: { rent: RENT4, deep: 1, vit: { prolapse: 1, to: 'tip' }, frag: Object.assign({ sink: 1 }, PIECE4) }, inst: [PH4] });
const DROP4 = cat4({ bag: {}, pcr: { rent: Object.assign({}, RENT4, { size: 2.4, ext: 0.5 }), vit: { prolapse: 0.35, to: 'main' }, frag: Object.assign({ drop: 1 }, PIECE4) } });
const OC4 = (() => { const P = pc4(REC40); return [P.R.c3[0] * 0.6, P.R.c3[1] * 0.6, pc4(REST4).zRim3 - 0.6]; })();
const FIRST4 = cat4({ bag: {}, pcr: { rent: RENT4, vit: { prolapse: 1 }, ovdD: { tamp: 1 }, frag: Object.assign({ sink: 1 }, PIECE4) }, inst: [PH4, { kind: 'cannula', via: 'side', p: OC4 }] });
const WITH4 = cat4({ bag: {}, pcr: { rent: Object.assign({}, RENT4, { ext: 0.6 }), collapse: 1, frag: Object.assign({ sink: 1 }, PIECE4) } });
const FL40 = cat4({ bag: {}, pcr: { rent: RENT4, ovdD: { tamp: 1, coat: 1, fill: P4.frag.cushion + 0.25 }, frag: { h: 5, float: 1, eat: 0.25 } } }), FR40 = pc4(FL40).FR;
const FLT4 = cat4({ ...FL40.cat, inst: [{ kind: 'phaco', p: FR40.at3(0, FR40.bE - 0.42, -0.6), bevel: 'down', occl: 1 }, { kind: 'spatula', via: 'side', p: FR40.under(0.8) }] });
const CLEAN4 = { cortex: new Array(12).fill(0), sub: 0 }, BAGC4 = Object.assign({}, CLEAN4, { collapse: 1 });
const PV4 = pc4(cat4({ bag: BAGC4, pcr: { rent: RENT4 } })), CUT4 = { kind: 'vitrector', p: [PV4.R.c3[0], PV4.R.c3[1], PV4.R.c3[2] - 0.25], port: 'up' };
const IRR4 = { kind: 'irrig', via: 'side', p: (() => { const d = G.clockDir(2); return [d[0] * 3.0, d[1] * 3.0, 9.9]; })() };
const VITX = cut => cat4({ bag: BAGC4, pcr: { rent: RENT4, vit: { prolapse: 1, to: 'main', cut, ta: 1 } }, inst: [CUT4, IRR4] }), VIT4 = VITX(0.45);
const P04 = pc4(cat4({ bag: {}, pcr: { rent: RENT4 } }));
const PPS4 = cat4({ bag: {}, pcr: { rent: RENT4, vit: { prolapse: 0.55, to: 'main', cut: 0.2, ta: 1 }, pp: { h: 11, s: P4.pp.s } }, inst: [{ kind: 'vitrector', via: 'pp', p: [P04.R.c3[0], P04.R.c3[1], P04.zHy3(P04.R.c0[0], P04.R.c0[1]) - 2.4], port: 'up' }, IRR4] });
const BAGIOL4 = cat4({ bag: Object.assign({}, CLEAN4, { collapse: 1 }), ovdBag: 1, ovdOut: { behind: 1, front: 1 }, iol: { rot: -35 } });
const SUL14 = cat4({ bag: Object.assign({}, CLEAN4, { collapse: 1 }), pcr: { rent: RENT4, vit: { cut: 1 } }, iol: { pos: 'sulcus', rot: -35, chafe: 1 } });
const CAPT4 = cat4({ bag: Object.assign({}, CLEAN4, { collapse: 1 }), pcr: { rent: RENT4, vit: { cut: 1 } }, iol: { pos: 'sulcus', kind: '3pc', capture: 1, rot: -35, chafe: 1 } });
const W4 = { x: -6.3, y: -12.9, w: 12.7, h: 9.7 }, sec4 = (st, step = 0.1, h = HP4) => CAT.section({ st, h, win: W4, step, id: 'q' });
const toU = (p, h = HP4) => p[0] * G.clockDir(h)[0] + p[1] * G.clockDir(h)[1];          // 3D → section u (meridional plane through the axis)
const scopeU = (s, h = HP4) => -s[0] * G.clockDir(h)[0] + s[1] * G.clockDir(h)[1];       // microscope (surgeon at 12: x = −X, y = Y) → the same u
const zA4 = (c, r) => { const Bb = CAT.bagOf(c); return (Bb ? Bb.zA(Math.min(r, L.Req)) : L.zAnt(Math.min(r, L.Req))) + CAT.liftZ(c, r); };
const fragGrid = (PC, f) => { const FR = PC.FR, out = []; let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const q of FR.pts) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
  for (let x = lo[0]; x <= hi[0]; x += 0.08) for (let y = lo[1]; y <= hi[1]; y += 0.08) for (let z = lo[2]; z <= hi[2]; z += 0.05) { const q = [x, y, z]; if (FR.fld(q) < 0) out.push(f ? f(q) : q); } return out; };
// 14.1 laterality (principle 6): clock hours are the examiner's in both eyes; OS 3 o'clock temporal, 9 nasal; the microscope with the surgeon at 12 has 12 at the
//      bottom and 9 on the right (nasal for OS); a 12–6 section of OD is seen from the temporal side (①), an 11–5 section of OS from the inferonasal side
{ const O = CAT.orient({ eye: 'OS', surgeon: 12 }), D = CAT.orient({ eye: 'OD', surgeon: 12 }), S5 = CAT.orient({ eye: 'OS', view: 'section', h: 5 }), S6 = CAT.orient({ eye: 'OD', view: 'section', h: 6 });
  const a = (e, h) => CAT.anat(e, h).en;
  ok(O.bottom === 12 && O.right === 9 && O.top === 6 && O.rightAnat.horiz === 'nasal' && O.leftAnat.horiz === 'temporal' && D.right === 9 && D.rightAnat.horiz === 'temporal',
    `microscope, surgeon at 12: bottom ${O.bottom}, right ${O.right} o'clock = ${O.rightAnat.horiz} (OS) / ${D.rightAnat.horiz} (OD), top ${O.top}`);
  ok(a('OS', 3) === 'temporal' && a('OS', 9) === 'nasal' && a('OD', 3) === 'nasal' && a('OD', 9) === 'temporal' && a('OS', 11) === 'superonasal' && a('OS', 2) === 'superotemporal' && a('OD', 11) === 'superotemporal' && CAT.mirrorH(11) === 1 && a('OD', CAT.mirrorH(11)) === a('OS', 11),
    `clock hours: OS 3 ${a('OS', 3)}, 9 ${a('OS', 9)}; case main 11 = ${a('OS', 11)}, side port 2 = ${a('OS', 2)} (OD 11 would be ${a('OD', 11)}; the same place in OD is ${CAT.mirrorH(11)} o'clock)`);
  ok(S6.from === 9 && S6.fromAnat.horiz === 'temporal' && S5.left === 11 && S5.right === 5 && S5.leftAnat.en === 'superonasal' && S5.fromAnat.en === 'inferonasal',
    `sections: OD 12–6 seen from ${S6.from} o'clock (${S6.fromAnat.en}); OS 11–5 left = ${S5.left} (${S5.leftAnat.en}), seen from ${S5.fromAnat.en}`); }
// 14.2 the OS case's incisions land where the footage shows them (footage-notes 2.2: main incision 31–38° right of straight down, side port 59–68° left)
{ const e = CAT.enface({ st: cat4({}) }), ang = q => Math.atan2(q[0] - e.A.centre[0], q[1] - e.A.centre[1]) / D2R, am = ang(e.A.mainExt), as = ang(e.A.sideExt);
  ok(e.A.mainExt[0] > 0 && Math.abs(am - 34.5) <= 10 && e.A.sideExt[0] < 0 && Math.abs(as + 63.5) <= 10, `OS microscope: main incision ${am.toFixed(0)}° right of straight down (footage 31–38°), side port ${(-as).toFixed(0)}° left (footage 59–68°)`); }
// 14.3 OS: the same structure on the same clock hour in both views (11–5 section and the microscope): main incision, rent, gel tip, TA particles, the piece
{ const s = sec4(VIT4, 0.2), e = CAT.enface({ st: VIT4 }), c = CAT.norm(VIT4), PC = pc4(VIT4), tn = CAT.tunnelOf(c.main), m3 = tn.to3(tn.ext);
  const hS = G.clockOf(-e.A.mainExt[0], e.A.mainExt[1]); let worst = 0; const pairs = [[s.A.mainExt, e.A.mainExt], [s.A.rentC, e.A.rentC], [s.A.tip0, e.A.tip0]];
  for (const [a, b] of pairs) worst = Math.max(worst, Math.abs(a[0] - scopeU(b)));
  let taW = 0, taN = 0; for (const q of PC.ta) { const d = Math.abs(q[0] * G.clockDir(HP4 + 3)[0] + q[1] * G.clockDir(HP4 + 3)[1]); if (d < 0.15) { taN++; const sq = G.toPlane(G.planes.meridian(HP4), q), mq = e.M(q); taW = Math.max(taW, Math.abs(sq[0] - scopeU(mq)), Math.abs(sq[1] + q[2])); } }
  ok(near(hS, 11, 0.01) && s.A.mainExt[0] < 0 && near(s.A.mainExt[0], toU(m3), 1e-9) && worst < 1e-6, `OS: main incision at ${hS.toFixed(2)} o'clock in the microscope and on the left of the 11–5 section; incision, rent centre, cutter tip agree (u off ≤ ${worst.toExponential(1)} mm)`);
  ok(taN > 5 && taW < 1e-6, `OS: ${taN} TA particles near the plane sit at the same u in the section and the microscope (worst ${taW.toExponential(1)} mm)`); }
// 14.4 OS draws exactly like OD with the same clock hours (the anatomy has no nasal–temporal difference); only the names change. OD output is the old output
//      (the ①–③ reference images, 0.000 %); st.eye 'OD' changes nothing
{ let same = 0, n = 0; for (const st of [HY, PH, FIN, REC4, SUL14]) for (const v of [s => CAT.enface({ st: s, id: 'x' }).svg, s => CAT.section({ st: s, h: 6, win: W12, step: 0.2, id: 'x' }).svg]) {
    const base = v(st), od = v(Object.assign({}, st, { eye: 'OD' })), os = v(Object.assign({}, st, { eye: 'OS' })); n++; if (base === od && od === os) same++; }
  const eD = CAT.enface({ st: PH }), eS = CAT.enface({ st: Object.assign({}, PH, { eye: 'OS' }) });
  ok(same === n && eD.A.eye === 'OD' && eS.A.eye === 'OS', `OD / OS / no eye: ${same} of ${n} drawings byte-identical; the eye is reported (${eD.A.eye} / ${eS.A.eye})`); }
// 14.5 sourced numbers: pars plana 3.5–4 mm behind the limbus (Rajan 2025), in the pars plana (spur + plicata .. ora); 23G = 0.6414 mm; Suto 2003 (sulcus ELP
//      0.62–0.75 mm shorter, power 1.00 D less); Rajan 2025 sign: the chamber deepens and the pupil widens (amounts 示意), the same in both views
{ const s = P4.pp.s, cOn = CAT.norm(SUL14), cB = CAT.norm(BAGIOL4), dElp = CAT.iolOf(cOn).O[2] - CAT.iolOf(cB).O[2];
  ok(s >= 3.5 && s <= 4.0 && s > G.N.spur + G.N.plicata && s < G.N.ora && near(P4.vitrector.od, 0.6414, 0.005), `sclerotomy ${s} mm behind the limbus (Rajan 2025: 3.5–4), in the pars plana (${(G.N.spur + G.N.plicata).toFixed(2)}–${G.N.ora}); 23G probe ${P4.vitrector.od} mm`);
  ok(dElp >= P4.elp[0] && dElp <= P4.elp[1] && P4.elp[0] === 0.62 && P4.elp[1] === 0.75 && P4.dD === -1.0, `sulcus one-piece optic ${dElp.toFixed(2)} mm in front of the in-the-bag position (Suto 2003: ELP 0.62–0.75 mm shorter; power ${P4.dD.toFixed(2)} D)`);
  const n0 = cat4({ bag: {}, pcr: { rent: RENT4 } }), n1 = cat4({ bag: {}, pcr: { rent: RENT4, deep: 1 } }), s0 = sec4(n0, 0.2), s1 = sec4(n1, 0.2), e0 = CAT.enface({ st: n0 }), e1 = CAT.enface({ st: n1 });
  const acd = s => ENDO + s.A.antPole[1];
  ok(near(acd(s1) - acd(s0), P4.deep, 1e-6) && e1.A.pupilR > e0.A.pupilR && near(e1.A.pupilR, s1.A['pm+'][0], 1e-6) && near(e0.A.pupilR, s0.A['pm+'][0], 1e-6),
    `PCR sign (Rajan 2025): chamber ${acd(s0).toFixed(2)} → ${acd(s1).toFixed(2)} mm, pupil ${(2 * e0.A.pupilR).toFixed(1)} → ${(2 * e1.A.pupilR).toFixed(1)} mm, the same margin in both views (amounts 示意)`); }
// 14.6 the rent: the posterior capsule drawn in the section stops at its edges (nothing drawn inside it), the microscope's edge is the same 3D edge; a radial
//      tear carries it toward the equator
{ const c = CAT.norm(REC4), PC = pc4(REC4), s = sec4(REC4, 0.05), e = CAT.enface({ st: REC4 }); let inside = 0, post = 0;
  for (const run of s.A.capRuns) for (const q of run.pts) { const lx = q[0] * U4[0], ly = q[0] * U4[1]; if (-q[1] < L.zc && Math.hypot(lx, ly) < L.Req - 0.3) { post++; if (PC.R.f(lx, ly) < -0.02) inside++; } }
  const endsOK = s.A.rentEnds.length === 2 && s.A.rentEnds.every(p => Math.abs(PC.R.f(p[0] * U4[0], p[0] * U4[1])) < 0.02);
  let edgeW = 0; PC.R.edge3.forEach((q, i) => { edgeW = Math.max(edgeW, Math.hypot(e.M(q)[0] - e.A.rentEdge[i][0], e.M(q)[1] - e.A.rentEdge[i][1]), Math.abs(PC.R.f(q[0], q[1]))); });
  const rMax = st => Math.max(...pc4(st).R.edge.map(q => Math.hypot(q[0], q[1])));
  ok(post > 50 && inside === 0 && endsOK && edgeW < 0.01, `rent: section shows no capsule inside it (${inside} of ${post} posterior points), ends on its edge (${s.A.rentEnds.length}); microscope edge = the same 3D edge (${edgeW.toFixed(3)} mm)`);
  ok(rMax(WITH4) > rMax(REC4) + 0.5 && rMax(cat4({ bag: {}, pcr: { rent: Object.assign({}, RENT4, { ext: 1 }) } })) >= L.Req - 0.2, `radial tear: reaches ${rMax(REC4).toFixed(2)} → ${rMax(WITH4).toFixed(2)} mm (ext 0.6) → equator at ext 1`); }
// 14.7 vitreous only behind the posterior capsule or through the rent: along the gel the posterior capsule is crossed only inside the rent (the whole cross-section),
//      the anterior capsule only through the rhexis; no gel in the cornea, iris, piece or OVD. Withdrawing first brings it to the main incision and shallows the
//      chamber; with the tip kept in and dispersive OVD on the rent none comes forward (Rajan 2025)
// visit grid points (step d, z step 0.6·d) in the box around a state's full gel path (± its radius + 0.2 mm)
const gelBox = (st, d, fn) => { const V = pc4(st).V, P = V.P, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9], m = V.r0 + 0.2; for (const q of P) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i] - m); hi[i] = Math.max(hi[i], q[i] + m); }
  for (let x = lo[0]; x <= hi[0]; x += d) for (let y = lo[1]; y <= hi[1]; y += d) for (let z = lo[2]; z <= hi[2]; z += 0.6 * d) fn([x, y, z]); };
const gelPath = st => { const c = CAT.norm(st), PC = pc4(st), V = PC.V, rcap = r => r; let badP = 0, badA = 0, crossP = 0;
  for (let i = 1; i < V.seg.length; i++) { const a = V.seg[i - 1], b = V.seg[i], la = PC.toL(a), lb = PC.toL(b), ra = Math.hypot(...la), rb = Math.hypot(...lb);
    const sa = a[2] - PC.zPost3(la[0], la[1]), sb = b[2] - PC.zPost3(lb[0], lb[1]); if (ra < L.Req && sa * sb <= 0) { crossP++; const t = sa / (sa - sb || 1), q = [la[0] + (lb[0] - la[0]) * t, la[1] + (lb[1] - la[1]) * t]; if (!(PC.R.f(q[0], q[1]) < -V.rad(V.sSeg[i]) * 0.95)) badP++; }
    const ta = a[2] - zA4(c, ra), tb = b[2] - zA4(c, rb); if (ra < L.Req && ta * tb <= 0) { const t = ta / (ta - tb || 1), q = [la[0] + (lb[0] - la[0]) * t, la[1] + (lb[1] - la[1]) * t]; if (!CAT.bare(c.ccc, Math.hypot(...q) + V.rad(V.sSeg[i]), G.clockOf(q[0], q[1]))) badA++; } }
  return { badP, badA, crossP }; };
{ for (const [nm, st] of [['to the tip', PRO4], ['withdrawn first', WITH4], ['vitrectomy 45 %', VIT4], ['dropped piece', DROP4], ['pars plana', PPS4]]) { const g = gelPath(st);
    ok(g.crossP >= 1 && g.badP === 0 && g.badA === 0, `gel ${nm}: crosses the posterior capsule ${g.crossP}× inside the rent (outside ${g.badP}), the anterior capsule only through the rhexis (${g.badA} off)`); }
  let bad = 0, n = 0; for (const st of [PRO4, WITH4, VIT4, DROP4]) { const f = CAT.layersFn(st); gelBox(st, 0.16, q => { const o = f(q); if (o.vitp < 0) { n++; if (o.cornea < 0 || o.iris < 0 || o.frag < 0 || o.ovdd < 0 || o.iol < 0) bad++; } }); }
  ok(n > 300 && bad === 0, `gel: ${n} samples, none in the cornea, iris, piece, OVD or IOL (${bad})`);
  const tipE = G.len(G.sub(pc4(PRO4).V.tip, CAT.instGeom(CAT.norm(PRO4), CAT.norm(PRO4).inst[0]).tip)), tn = CAT.tunnelOf(CAT.norm(WITH4).main), wE = G.len(G.sub(pc4(WITH4).V.tip, tn.to3(tn.int)));
  const acd = st => ENDO + sec4(st, 0.25).A.antPole[1];
  ok(tipE < 1e-9 && wE < 0.2 && acd(WITH4) < acd(REC4) - 0.5, `gel reaches the phaco tip (${tipE.toFixed(3)} mm); withdrawn first: to the main incision (${wE.toFixed(2)} mm), chamber ${acd(REC4).toFixed(2)} → ${acd(WITH4).toFixed(2)} mm (示意)`);
  const f = CAT.layersFn(FIRST4), PC = pc4(FIRST4); let fwd = 0, plug = 0, ovB = 0, ovN = 0;
  for (let x = -5; x <= 5; x += 0.1) for (let y = -5; y <= 5; y += 0.25) for (let z = 4; z <= 12.7; z += 0.06) { const o = f([x, y, z]), l = PC.toL([x, y, z]), r = Math.hypot(...l), zp = PC.zPost3(l[0], l[1]);
    if (o.vitp < 0 && z > zp + 0.02) fwd++; if (o.ovdd < 0) { ovN++; if (r < L.Req && z < zp - 0.35 || o.iris < 0 || o.cornea < 0 || o.lens < 0 || o.frag < 0) ovB++; if (PC.R.f(l[0], l[1]) < -0.2 && Math.abs(z - zp - 0.1) < 0.06) plug++; } }
  ok(fwd === 0 && plug > 5 && ovN > 200 && ovB === 0, `tip kept in + dispersive OVD on the rent: no gel in front of the capsule (${fwd}), OVD over the rent (${plug}) and only in the bag / chamber (${ovB} of ${ovN} off)`); }
// 14.8 the remaining piece: at rest inside the bag; one pole tilted through the rent only inside it (Rajan 2025: tilting of one pole); dropped: all behind the
//      hyaloid in the vitreous cavity; floated: on a cushion over the rim plane, ≥ 0.5 mm off the endothelium, clear of the iris, a second instrument under it,
//      the phaco on its eaten edge; eating takes it away
{ const st0 = cat4({ bag: {}, pcr: { rent: RENT4, frag: PIECE4 } }), P0 = pc4(st0), c0 = CAT.norm(st0), Bb = CAT.bagOf(c0); let outBag = 0;
  for (const q of fragGrid(P0)) { const l = P0.toL(q), r = Math.hypot(...l), z = q[2] - CAT.liftZ(c0, r); if (Bb.g(r, z, l[0], l[1]) > 0) outBag++; }
  const PC = pc4(REC4); let thr = 0, bad = 0, deep = 0; for (const q of fragGrid(PC)) { const l = PC.toL(q), zp = PC.zPost3(l[0], l[1]); if (Math.hypot(...l) < L.Req && q[2] < zp) { thr++; deep = Math.max(deep, zp - q[2]); if (!(PC.R.f(l[0], l[1]) < 0)) bad++; } }
  ok(outBag === 0 && thr > 5 && bad === 0 && deep >= 0.1, `piece: at rest inside the bag (${outBag} out); tilted, its pole is ${deep.toFixed(2)} mm through the posterior capsule, all ${thr} samples there inside the rent (${bad} outside)`);
  const gap = st => { let d = 1e9; const tip = CAT.instGeom(CAT.norm(st), CAT.norm(st).inst[0]).tip; for (const q of fragGrid(pc4(st))) d = Math.min(d, G.len(G.sub(q, tip))); return d - CN.phaco.needleOD / 2; };
  const g0 = gap(cat4({ ...REST4.cat, inst: [PH4] })), g1 = gap(REC4);
  ok(g0 <= 0.1 && g1 >= 0.3, `loss of followability (Rajan 2025): the phaco on the piece (${g0.toFixed(2)} mm) stays where it was while the piece drops away (${g1.toFixed(2)} mm)`);
  const PD = pc4(DROP4), fD = CAT.layersFn(DROP4); let front = 0, notVit = 0, nD = 0; for (const q of fragGrid(PD)) { nD++; const l = PD.toL(q), o = fD(q); if (q[2] > PD.zHy3(l[0], l[1]) - 0.05) front++; if (!(o.interior < 0) || o.retina < 0 || o.ciliary < 0) notVit++; }
  ok(nD > 100 && front === 0 && notVit === 0, `dropped piece: all ${nD} samples behind the hyaloid (${front} in front), in the vitreous cavity (${notVit} off)`);
  const PF = pc4(FLT4), cF = CAT.norm(FLT4), fF = CAT.layersFn(cat4({ ...FL40.cat })); let lo = 1e9, hi = -1e9, iris = 0, endo = 1e9;
  for (const q of fragGrid(PF)) { lo = Math.min(lo, q[2]); hi = Math.max(hi, q[2]); if (fF(q).iris < 0.02) iris++; endo = Math.min(endo, CAT.wallZ(Math.hypot(q[0], q[1]), true) - q[2]); }
  ok(lo >= PF.zRim3 + P4.frag.cushion - 0.01 && endo >= 0.5 && iris === 0, `floated piece: bottom ${(lo - PF.zRim3).toFixed(2)} mm over the rim plane (OVD cushion), ${endo.toFixed(2)} mm off the endothelium, clear of the iris (${iris})`);
  const gS = CAT.instGeom(cF, cF.inst[1]), gP = CAT.instGeom(cF, cF.inst[0]), l = PF.toL(gS.tip), zp = PF.zPost3(l[0], l[1]); let above = -1e9; for (let z = gS.tip[2]; z < gS.tip[2] + 3; z += 0.01) if (PF.FR.fld([gS.tip[0], gS.tip[1], z]) < 0) { above = z; break; }
  let dmin = 1e9; for (const q of PF.FR.pts) dmin = Math.min(dmin, G.len(G.sub(q, gP.tip)));
  ok(gS.via === 'side' && above > gS.tip[2] + gS.rn && gS.tip[2] > zp + 0.5 && dmin <= gP.rn + 0.15, `second instrument under the piece (${(above - gS.tip[2]).toFixed(2)} mm below it, ${(gS.tip[2] - zp).toFixed(2)} mm over the posterior capsule) through the side port; phaco on the eaten edge (${dmin.toFixed(2)} mm)`);
  const vol = e => fragGrid(pc4(cat4({ ...FL40.cat, pcr: Object.assign({}, FL40.cat.pcr, { frag: { h: 5, float: 1, eat: e } }) }))).length, V = [0, 0.25, 0.6, 1].map(vol);
  ok(V[0] > V[1] && V[1] > V[2] && V[3] === 0, `eating the piece: ${V.join(' → ')} samples`); }
// 14.9 instruments only through their incisions (④): axis through the tunnel pivot, nothing touched on the way (iris, cornea outside the tunnel, the anterior
//      capsule outside the rhexis, the piece), the posterior capsule crossed only inside the rent; bimanual: cutter through the main incision down at the rent,
//      irrigation through the side port high and away from the rent (separated flows, 示意); vitrectomy progress removes the gel
function shaft4(st, i) {
  const c = CAT.norm(st), g = CAT.instGeom(c, c.inst[i]), PC = pc4(st), f = CAT.layersFn(Object.assign({}, st, { cat: Object.assign({}, st.cat, { inst: [] }) })), piv = g.pivot || g.tn.to3(g.tn.pivot);
  const R = { g, iris: 0, cornea: 0, antCap: 0, postCap: 0, frag: 0, axisOK: G.len(G.cross(G.sub(piv, g.bend || g.tip), g.axis)) < 1e-9 }, rr = g.kind === 'phaco' ? g.rn : g.rr || g.rn || 0.2;
  const segs = g.bend ? [[g.tip, g.bend], [g.bend, piv]] : [[g.tip, piv]];
  for (const [a, b] of segs) { const L3 = G.len(G.sub(b, a)), ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
    for (let t = 0; t <= L3; t += 0.03) { const q = G.add(a, ax, t); let above = 0, below = 0; const rad = g.kind === 'phaco' && t > CN.phaco.needleL ? g.rs : rr;
      for (let k = 0; k < 12; k++) { const an = 2 * Math.PI * k / 12, p = G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), rad - 0.01), o = f(p), w = wallOf(G.mer(p).z, G.mer(p).rho), l = PC.toL(p), r = Math.hypot(...l);
        if (o.iris < 0) R.iris++; if (g.tn && w.d < T(w.s) && w.d > -0.01 && w.s < g.tn.sI - 0.3) R.cornea++; if (o.frag < 0) R.frag++;
        if (r < L.Req) { if (!CAT.bare(c.ccc, r, G.clockOf(l[0], l[1]))) { if (p[2] > zA4(c, r)) above++; else if (p[2] > L.zc) below++; } if (p[2] < PC.zPost3(l[0], l[1]) && !(PC.R && PC.R.f(l[0], l[1]) < 0)) R.postCap++; } }
      if (above && below) R.antCap++; } }
  return R; }
{ for (const [nm, st, i, via] of [['phaco at the PCR moment', REC4, 0, 'main'], ['OVD cannula (first step)', FIRST4, 1, 'side'], ['phaco on the floated piece', FLT4, 0, 'main'], ['second instrument under it', FLT4, 1, 'side'], ['vitrector', VIT4, 0, 'main'], ['irrigation', VIT4, 1, 'side']]) {
    const R = shaft4(st, i); ok(R.axisOK && R.g.via === via && R.iris + R.cornea + R.antCap + R.postCap + R.frag === 0, `${nm}: through the ${via} incision; iris ${R.iris}, cornea ${R.cornea}, anterior capsule ${R.antCap}, posterior capsule outside the rent ${R.postCap}, piece ${R.frag}`); }
  const c = CAT.norm(VIT4), PC = pc4(VIT4), gC = CAT.instGeom(c, c.inst[0]), gI = CAT.instGeom(c, c.inst[1]), lC = PC.toL(gC.cport), lI = PC.toL(gI.tip);
  const toRent = G.unit(G.sub(PC.R.c3, gI.tip)), cosA = Math.max(...gI.flow.map(d => G.dot(d, toRent))), level = Math.max(...gI.flow.map(d => Math.abs(d[2]))), dR = Math.hypot(lI[0] - PC.R.c0[0], lI[1] - PC.R.c0[1]);
  ok(PC.R.f(lC[0], lC[1]) < -0.2 && Math.abs(gC.cport[2] - PC.zPost3(lC[0], lC[1])) <= 0.3 && gI.tip[2] >= PC.zRim3 + 0.6 && dR >= 1.5 && cosA < 0.5 && level < 0.05,
    `bimanual: cutter port inside the rent at the capsule (${(gC.cport[2] - PC.zPost3(lC[0], lC[1])).toFixed(2)} mm), irrigation ${(gI.tip[2] - PC.zRim3).toFixed(2)} mm over the rim plane, ${dR.toFixed(1)} mm from the rent, its flows level and ≥ ${(Math.acos(cosA) / D2R).toFixed(0)}° off the rent`);
  const gelN = st => { const f = CAT.layersFn(st), P = pc4(st); let n = 0; gelBox(VITX(0), 0.16, q => { const l = P.toL(q); if (f(q).vitp < 0 && q[2] > P.zPost3(l[0], l[1])) n++; }); return n; };   // the same box (the uncut gel's) for all three
  const Gn = [0, 0.45, 1].map(k => gelN(VITX(k)));
  ok(Gn[0] > Gn[1] && Gn[1] > 0 && Gn[2] === 0, `vitrectomy progress: gel in front of the capsule ${Gn.join(' → ')} samples`); }
// 14.10 pars plana option: the cutter enters through the sclerotomy (pivot in the wall at 3.5 mm) and runs only through vitreous to just behind the rent
{ const c = CAT.norm(PPS4), PC = pc4(PPS4), g = CAT.instGeom(c, c.inst[0]), f = CAT.layersFn(cat4({ bag: {}, pcr: { rent: RENT4 } })), w = wallOf(G.mer(g.pivot).z, G.mer(g.pivot).rho);
  let bad = 0, n = 0; const Lw = G.len(G.sub(g.pivot, g.tip)); for (let t = 0; t <= Lw - 0.8; t += 0.03) { const q = G.add(g.tip, g.axis, t); for (let k = 0; k < 8; k++) { const an = 2 * Math.PI * k / 8, side = G.unit(G.cross(g.axis, [0, 0, 1])), up = G.unit(G.cross(side, g.axis)), p = G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), g.rn), o = f(p); n++;
      if (!(o.interior < 0) || o.lens < 0 || o.bag < 0 || o.iris < 0 || o.ciliary < 0 || o.retina < 0) bad++; } }
  const l = PC.toL(g.tip);
  ok(g.pp && near(w.s, P4.pp.s, 0.02) && w.d > 0 && w.d < T(w.s) && near(G.clockOf(g.pivot[0], g.pivot[1]), 11, 1e-6) && bad === 0 && n > 200 && PC.R.f(l[0], l[1]) < 0 && g.tip[2] < PC.zHy3(l[0], l[1]),
    `pars plana: sclerotomy ${w.s.toFixed(2)} mm behind the limbus at 11 o'clock (site 示意); the shaft only in vitreous (${bad} of ${n} off); tip ${(PC.zHy3(l[0], l[1]) - g.tip[2]).toFixed(2)} mm behind the rent`); }
// 14.11 triamcinolone (Burk 2003: trapped on and within the gel): every particle is in the gel; none without TA; none once the gel is cut away
{ let bad = 0, n = 0; for (const st of [VIT4, PPS4]) { const f = CAT.layersFn(st); for (const q of pc4(st).ta) { n++; if (!(f(q).vitp < 0.01)) bad++; } }
  ok(n > 150 && bad === 0 && pc4(cat4({ bag: {}, pcr: { rent: RENT4, vit: { prolapse: 1 } } })).ta.length === 0 && pc4(VITX(1)).ta.length === 0, `TA: ${n} particles, ${bad} outside the gel; none without TA, none after the gel is removed`); }
// 14.12 one-piece IOL in the sulcus: haptics in front of the anterior capsule and behind the iris, out to the sulcus (the angle of the iris root and the ciliary
//       body), not in the ciliary body; the optic in front of the capsule; thick haptics come within 0.1 mm of the posterior iris (contact risk, 示意; Chang 2009),
//       the three-piece's thin ones less
const hapPts = IO => { const out = []; IO.haps.forEach((H, j) => H.forEach((q, i) => { const a = H[Math.max(0, i - 1)], b = H[Math.min(H.length - 1, i + 1)], ax = G.unit(G.sub(b, a)), side = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(side, ax));
  for (let k = 0; k < 8; k++) { const an = 2 * Math.PI * k / 8; out.push({ p: G.add(q, G.add(side.map(v => v * Math.cos(an)), up, Math.sin(an)), IO.hr * 0.95), j, i }); } })); return out; };
function sulcusOK(st) {
  const c = CAT.norm(st), IO = CAT.iolOf(c), f = CAT.layersFn(st), R = { inCap: 0, iris: 0, cil: 0, behind: 0, n: 0, optic: 0 };
  for (const { p } of hapPts(IO)) { const r = Math.hypot(p[0], p[1]), o = f(p); R.n++; if (r < L.Req && !CAT.bare(c.ccc, r, G.clockOf(p[0], p[1])) && p[2] < zA4(c, r) + 0.005) R.inCap++; if (o.iris < 0) R.iris++; if (o.ciliary < 0) R.cil++; }
  for (const q of CAT.chafeOf(c, IO)) if (!q.below) R.behind++;
  for (let rr = 0; rr <= CN.iol.optic / 2 - 0.05; rr += 0.1) for (let a = 0; a < 2 * Math.PI; a += 0.2) { const p = IO.toEye(rr * Math.sin(a), rr * Math.cos(a), -CAT.optHalf(rr)), r = Math.hypot(p[0], p[1]); if (!CAT.bare(c.ccc, r, G.clockOf(p[0], p[1])) && p[2] < zA4(c, r)) R.optic++; }
  R.tips = IO.tips.map(t => { let k = 0; while (k < 1.2 && f(G.add(t, [t[0] / Math.hypot(t[0], t[1]), t[1] / Math.hypot(t[0], t[1]), 0], k)).ciliary > 0) k += 0.01; return k; });
  R.minGap = Math.min(...CAT.chafeOf(c, IO).map(q => q.gap)); R.contact = CAT.chafeOf(c, IO).filter(q => q.gap < P4.chafe).length; return R; }
{ const A = sulcusOK(SUL14), B = sulcusOK(CAPT4);
  ok(A.n > 300 && A.inCap === 0 && A.iris === 0 && A.cil === 0 && A.behind === 0 && A.optic === 0 && A.tips.every(k => k < 0.35), `one-piece in the sulcus: haptics in front of the anterior capsule (${A.inCap}), behind the iris (${A.iris} in it, ${A.behind} in front), not in the ciliary body (${A.cil}), tips ${A.tips.map(k => k.toFixed(2)).join(' / ')} mm from it; optic in front of the capsule (${A.optic})`);
  ok(A.contact > 0 && A.minGap >= 0 && B.contact < A.contact, `contact risk (示意): one-piece haptics within ${P4.chafe} mm of the posterior iris at ${A.contact} points (closest ${A.minGap.toFixed(2)} mm), three-piece ${B.contact}`); }
// 14.13 three-piece with optic capture: the rhexis rim lies on the optic all round except where it is stretched over the two haptic–optic junctions, the optic
//       behind the rim (captured), the haptics in front of the anterior capsule, behind the iris, out in the sulcus
{ const c = CAT.norm(CAPT4), IO = CAT.iolOf(c), X = CAT.rhex(c.ccc), Ro = CN.iol.optic / 2, B = sulcusOK(CAPT4); let on = 0, jn = 0, bad = 0, behind = 0;
  for (let k = 0; k < 240; k++) { const t = 12 * k / 240, h = (c.ccc.h0 + c.ccc.dir * t + 12) % 12, Rr = X.R(t), atJ = c.ccc.oval.hj.some(hj => Math.abs(CAT.dH(h, hj)) < P4.capW * 0.5);
    if (atJ) { jn++; if (!(Rr >= Ro - 0.12 + IO.hr)) bad++; } else if (Rr <= Ro - 0.25) { on++; const z = zA4(c, Rr), zo = IO.O[2] + CAT.optHalf(Rr); if (z > zo) behind++; } else if (!(Math.abs(CAT.dH(h, c.ccc.oval.hj[0])) < P4.capW * 2.2 || Math.abs(CAT.dH(h, c.ccc.oval.hj[1])) < P4.capW * 2.2)) bad++; }
  ok(on > 120 && behind === on && jn > 10 && bad === 0, `optic capture: rim on the optic (≥ 0.25 mm overlap) at ${on} of 240 points and in front of it (${behind}); stretched over the junctions at ${jn} (${bad} off)`);
  ok(B.n > 100 && B.inCap === 0 && B.iris === 0 && B.cil === 0 && B.behind === 0 && B.tips.every(k => k < 0.35), `three-piece haptics: in front of the anterior capsule (${B.inCap}), behind the iris (${B.iris}), in the sulcus (tips ${B.tips.map(k => k.toFixed(2)).join(' / ')} mm from the ciliary body)`); }
// 14.14 the ④ views draw without NaN
{ const all = [REC4, PRO4, DROP4, FIRST4, WITH4, FLT4, VIT4, PPS4, SUL14, CAPT4].map(st => sec4(st, 0.25).svg + CAT.section({ st, h: 8, cut: true, win: W4, step: 0.25 }).svg + CAT.enface({ st }).svg).join('');
  ok(!/NaN|undefined|Infinity/.test(all), `④ views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`); }

// =====================================================================================================================
// 15. sutured scleral fixation of a three-piece IOL (sfix.js; SFIX_PATH=<file> runs these on another copy — used to break a value on purpose).
//     Sources and the 示意 list: CARD.md 鞏膜縫合固定 IOL. States as in sample-sfix.html: OD, surgeon at 12, fixation at 2 and 8 o'clock;
//     "mm" = behind the posterior surgical limbus (PSL); section plane meridian(2): screen u = toward 2 o'clock, v = −Z.
const G0svg = G.enface({ st: {} }).svg + G.section({ plane: planes.meridian(10), win: { x: -1, y: -14.2, w: 13, h: 9 }, st: {}, step: 0.2 }).svg, G0N = JSON.stringify(G.N);
const SX = require(process.env.SFIX_PATH || './sfix.js')(G), SNx = SX.SN, sx = x => ({ sfix: x }), P2x = p => G.toPlane(G.planes.meridian(2), p);
const IN15 = JSON.parse(process.env.SFIX_IN || '{}');   // inputs this section uses, overridable to break the check itself on purpose
// 15.1 limbus definition and the sulcus: PSL = the model's posterior limbal line over the spur (Le 2018, 0.85); the 2/8 o'clock sulcus is Duffey 1989's
//      perpendicular entry (0.83 vertical / 0.46 horizontal behind the PSL) interpolated to 60° from vertical; plicata ends 2.41 behind the PSL (Yoon 2023, 轉述)
ok(SNx.psl === 0.85 && SNx.psl === N.spur, `sfix: the PSL is the posterior limbal line over the spur, ${SNx.psl} mm behind the visible limbus (Le 2018)`);
ok(SNx.duffey.v === 0.83 && SNx.duffey.hz === 0.46 && near(SX.SUL - SNx.psl, 0.83 + (0.46 - 0.83) * 60 / 90, 1e-9) && SX.SUL - SNx.psl >= 0.46 - 0.1 && SX.SUL - SNx.psl <= 0.83 + 0.1,
  `sfix: 2/8 o'clock sulcus ${(SX.SUL - SNx.psl).toFixed(3)} mm behind the PSL (Duffey 1989 0.83 vertical / 0.46 horizontal, interpolated; inside 0.36–0.93)`);
ok(near(SX.PE, 0.85 + 2.41, 1e-9) && SX.ORA === 6.2 && SX.procH(SX.P0 - 0.01) === 0 && SX.procH(SX.PE + 0.01) === 0 && SX.procH((SX.P0 + SX.PE) / 2) > 0.3,
  `sfix: ciliary processes only between the sulcus floor and the plicata end ${SX.PE.toFixed(2)} (PSL + 2.41, Yoon 2023); ora 6.2 (Liu 2014)`);
{ const dia = 2 * SX.SULC.apex[0]; ok(dia > SNx.davis.dia + 2 * SNx.davis.sd && SNx.davis.dia === 11.0, `sfix: sulcus diameter ${dia.toFixed(2)} mm — Davis 1991 (cadaver) 11.0 ± 0.37 NOT reproduced, as CARD.md says (the model keeps the external position)`); }
// 15.2 what a needle perpendicular to the sclera reaches (Duffey's mapping), 2 and 8 o'clock — the table in CARD.md
const TABLE15 = IN15.table || [[0, 'psl', 'iris'], [0.46, 'psl', 'sulcus'], [0.583, 'psl', 'sulcus'], [0.7, 'psl', 'sulcus'], [0.83, 'psl', 'plicata'], [1, 'psl', 'plicata'], [2, 'psl', 'plicata'],
  [2.3, 'psl', 'plicata'], [2.5, 'psl', 'plana'], [3, 'psl', 'plana'], [3.5, 'psl', 'plana'], [1, 'vis', 'iris'], [2, 'vis', 'plicata']];
{ const bad = []; for (const [mm, from, want] of TABLE15) for (const h of [2, 8]) { const t = SX.classify(h, mm, from); if (t.cls !== want) bad.push(`${h}h ${mm} ${from}: ${t.cls} ≠ ${want}`); }
  ok(!bad.length, `sfix: perpendicular landing table (${TABLE15.length} entries × 2 and 8 o'clock) matches CARD.md${bad.length ? ': ' + bad.join('; ') : ''}`); }
ok(SNx.sugiura === 3.0 && SX.classify(2, SNx.sugiura).cls === 'plana', 'sfix: Sugiura 2018 pars plana fixation 3.0 mm behind the PSL is over the pars plana');
// 15.3 the demonstrated needle angle: 1 mm (Guedes 2026) through the sulcus; the same angle at 2 mm (Kokame 2018) goes through the processes, 1 mm from the
//      visible limbus into the chamber angle, 0.5 mm through the iris
{ const D = SX.DIVE, want = IN15.dive || [[1, 'psl', 'sulcus'], [2, 'psl', 'plicata'], [1, 'vis', 'angle'], [0.5, 'psl', 'iris']], bad = [];
  for (const [mm, from, w] of want) { const t = SX.track(2, SX.sAbs(mm, from), D); if (t.cls !== w) bad.push(`${mm} ${from}: ${t.cls}`); }
  ok(SNx.guedes === 1.0 && SNx.kokame === 2.0 && D > 20 && D < 45 && !bad.length, `sfix: needle ${D.toFixed(1)}° below the iris plane: 1 mm → sulcus, 2 mm → pars plicata, 1 mm from the visible limbus → angle, 0.5 mm → iris${bad.length ? '; ' + bad.join(', ') : ''}`); }
// 15.4 the passes go only where they should: the straight needle (2 → dock) and the 27G needle (8 → dock) cross the flap bed (under the flap) and the
//      ciliary body, then open space — never iris, cornea, limbus, processes or retina; the pulled chord runs behind the iris and in front of the IOL plane
const walk = (st, a, b, step = 0.01) => { const f = SX.layersFn(st), hit = {}, n = Math.ceil(G.len(G.sub(b, a)) / step); let minIris = 1e9;
  for (let i = 0; i <= n; i++) { const q = G.add(a, G.sub(b, a), i / n), o = f(q); for (const k of ['sclera', 'limbus', 'cornea', 'iris', 'cbody', 'proc', 'retina', 'choroid', 'iol', 'old']) if (o[k] < 0) hit[k] = (hit[k] || 0) + 1; minIris = Math.min(minIris, o.iris); }
  return { hit, minIris }; };
const ST15 = sx({ vit: 1, peri: 1, flap: { open: 1 }, ndl: { pass: 1, g27: 1, out: 0 } });
{ const PS = SX.passes(SX.norm(ST15)), w2 = walk(ST15, PS.E2, PS.D), w8 = walk(ST15, PS.E8, PS.D), allowed = h => Object.keys(h).every(k => k === 'sclera' || k === 'cbody');
  const bed = q => { const W = wallOf(q[2], Math.hypot(q[0], q[1])); return W.d / T(W.s); };
  ok(allowed(w2.hit) && allowed(w8.hit) && w2.hit.sclera > 0 && w2.hit.cbody > 0 && bed(PS.E2) >= SNx.flap.frac - 0.01 && bed(PS.E8) >= SNx.flap.frac - 0.01,
    `sfix: straight needle and 27G needle cross only the flap bed (entry at ${(bed(PS.E2) * 100).toFixed(0)}% of the wall) and the ciliary body (${JSON.stringify(w2.hit)} / ${JSON.stringify(w8.hit)})`);
  ok(PS.t2.cls === 'sulcus' && PS.t8.cls === 'sulcus' && near(PS.D[0], 0, 1e-6) && PS.D[2] < SX.SULC.apex[1], `sfix: both passes reach the sulcus; they dock on the axis ${(SX.SULC.apex[1] - PS.D[2]).toFixed(2)} mm behind the sulcus (示意)`);
  const FX = sx({ vit: 1, ndl: {}, iol: {} }), PF = SX.passes(SX.norm(FX)), ch = walk(sx({ vit: 1, ndl: {} }), G.add(PF.I2, G.sub(PF.I8, PF.I2), 0.02), G.add(PF.I8, G.sub(PF.I2, PF.I8), 0.02)), IO = SX.iolOf(SX.norm(FX));
  const chZ = PF.I2[2], optFront = IO.O[2] + SX.optHalf(0);
  ok(!Object.keys(ch.hit).length && ch.minIris > 0.05 && chZ - optFront > 0.1, `sfix: the pulled chord crosses only open space, ${ch.minIris.toFixed(2)} mm behind the iris, ${(chZ - optFront).toFixed(2)} mm in front of the IOL optic`);
  const HK = sx({ vit: 1, inc: 1, ndl: { hook: 1 } }), PH = SX.passes(SX.norm(HK)), inc = SX.incOf(); let bad = 0;
  for (const j of [0, 1]) { const H = SX.hookPts(PH, j), I = j ? PH.I8 : PH.I2, segs = [[G.add(I, G.sub(H[0], I), 0.02), H[0]], [H[0], H[1]], [H[1], inc.inner]];
    for (const [a, b] of segs) { const w = walk(HK, a, G.add(b, G.unit(G.sub(a, b)), b === inc.inner ? 0.02 : 0)); bad += Object.keys(w.hit).length; } }   // stop 0.02 mm short of the wound's inner opening
  ok(bad === 0, `sfix: the strand hooked out of the 12 o'clock wound passes behind the iris, through the pupil and the chamber only (${bad} tissue hits)`); }
// 15.5 the two views agree: the caliper dots, the dock, the IOL centre and the tie points are the same 3D points in the 2–8 section and the microscope view
try { const st = sx({ vit: 1, peri: 1, marks: 1, flap: { open: 1 }, ndl: { pass: 1, g27: 1, out: 0 }, pins: [{ h: 2, mm: 1 }, { h: 8, mm: 1 }] }), e = SX.enface({ st }), s = SX.section({ st, win: { x: -9, y: -13, w: 18, h: 9 }, step: 0.2 });
  const M = enfaceMap(12), pl = G.planes.meridian(2), back = a => G.onPlane(pl, a[0], a[1]), hs = q => { const r = Math.hypot(q[0], q[1]); let h = Math.atan2(-q[0], q[1]) / (30 * D2R); if (h <= 0) h += 12; return { h, r }; };
  const sOfR = r => { let a = 0, b = 6; for (let i = 0; i < 50; i++) { const m = (a + b) / 2; surfAt(m).rho < r ? a = m : b = m; } return (a + b) / 2; };
  const d2 = hs(e.A.dot2), d8 = hs(e.A.dot8), W1 = wallOf(-s.A.pin0[1], Math.abs(s.A.pin0[0])), W2 = wallOf(-s.A.pin1[1], Math.abs(s.A.pin1[0]));
  ok(near(d2.h, 2, 0.01) && near(d8.h, 8, 0.01) && near(sOfR(d2.r), SNx.psl + 1, 0.01) && near(sOfR(d8.r), SNx.psl + 1, 0.01) && s.A.pin0[0] > 0 && s.A.pin1[0] < 0 && near(W1.s, SNx.psl + 1, 0.01) && near(W2.s, SNx.psl + 1, 0.01),
    `sfix: the 1 mm dots are at 2 and 8 o'clock, ${(sOfR(d2.r) - SNx.psl).toFixed(3)} / ${(W1.s - SNx.psl).toFixed(3)} mm behind the PSL in the microscope / the section (2 o'clock on the section's right)`);
  const same = (sa, ea) => G.len(G.sub(M(back(sa)), ea));
  const F2 = sx({ vit: 1, ndl: {}, iol: {}, knot: 1, flap: { open: 0 } }), e2 = SX.enface({ st: F2 }), s2 = SX.section({ st: F2, win: { x: -9, y: -13, w: 18, h: 9 }, step: 0.2 });
  const worst = Math.max(same(s.A.D, e.A.D), same(s2.A.iolC, e2.A.iolC), same(s2.A.tie2, e2.A.tie2), same(s2.A.tie8, e2.A.tie8));
  ok(worst < 0.01, `sfix: dock, IOL centre and the two tie points: section ↔ microscope within ${worst.toFixed(4)} mm`); }
catch (err) { ok(false, `sfix: the 1 mm dots in the two views (${err.message})`); ok(false, 'sfix: dock, IOL centre and the two tie points in the two views (anchors missing)'); }
// 15.6 orientation (principle 6): OD, surgeon at 12: 12 at the bottom, 9 temporal on the right; 2 o'clock superonasal lower left, 8 inferotemporal upper right;
//      the 2–8 section has 2 o'clock on the right, anterior up
{ const M = enfaceMap(12), a2 = M(P3(2, 1)), a8 = M(P3(8, 1)), Or = CAT.orient({ eye: 'OD', surgeon: 12 }), Os = CAT.orient({ eye: 'OD', view: 'section', h: SNx.hours[0] });
  ok(SNx.hours[0] === 2 && SNx.hours[1] === 8 && a2[0] < 0 && a2[1] > 0 && a8[0] > 0 && a8[1] < 0 && Or.bottom === 12 && Or.right === 9 && Or.rightAnat.horiz === 'temporal',
    'sfix: OD, surgeon at 12: 12 o\'clock at the bottom, 9 temporal on the right; 2 o\'clock lower left, 8 upper right');
  ok(CAT.anat('OD', 2).en === 'superonasal' && CAT.anat('OD', 8).en === 'inferotemporal' && Os.right === 2 && Os.left === 8 && G.toPlane(G.planes.meridian(2), P3(2, 1))[0] > 0 && G.toPlane(G.planes.meridian(2), [0, 0, 10])[1] === -10,
    'sfix: 2 = superonasal, 8 = inferotemporal (OD); the section has 2 o\'clock on the right, anterior up'); }
// 15.7 trocars: 23G (0.64 mm) 3.5 mm behind the PSL (Rajan 2025) over the pars plana, at 7 (infusion), 10 and 1 o'clock (示意), through intact conjunctiva,
//      ≥ 1 mm (示意) from both flaps and from the 12 o'clock wound
{ const tro = (IN15.trocarHours || SNx.trocar.hours).map(h => SX.trocarOf(h)), fd = SX.layersFn(sx({ peri: 1 })), r = SNx.trocar.od / 2, sh = [];
  const tri = hf => { const P = []; for (let k = 0; k <= 30; k++) { const t = k / 30; P.push(SX.flapPt(hf, 0, (t - 0.5) * SNx.flap.side), SX.flapPt(hf, SX.H_TRI * t, SNx.flap.side / 2 * (1 - t)), SX.flapPt(hf, SX.H_TRI * t, -SNx.flap.side / 2 * (1 - t))); } return P; };
  const inc = SX.incOf(), incPts = []; for (let k = 0; k <= 10; k++) incPts.push(P3(12 + (k / 10 - 0.5) * SNx.inc.w / (surfAt(SNx.inc.s).rho * 30 * D2R), SNx.inc.s));
  let minF = 1e9, minI = 1e9, conjOK = true;
  for (const t of tro) { for (const hf of SNx.hours) for (const q of tri(hf)) minF = Math.min(minF, G.len(G.sub(q, t.E)) - r); for (const q of incPts) minI = Math.min(minI, G.len(G.sub(q, t.E)) - r);
    if (!(fd(G.add(t.E, t.n, 0.1)).conj < 0)) conjOK = false; sh.push(t.s); }   // conjunctiva 0.1 mm above the entry: intact (transconjunctival)
  ok(SNx.trocar.s === 3.5 && SNx.trocar.od === 0.64 && sh.every(s => s - r > SX.PE && s + r < SX.ORA), `sfix: trocars ${SNx.trocar.s} mm behind the PSL (s ${sh[0].toFixed(2)}), the whole 0.64 mm cannula over the pars plana (${SX.PE.toFixed(2)}–${SX.ORA})`);
  ok(minF >= 1.0 && minI >= 1.0 && conjOK && (IN15.trocarHours || SNx.trocar.hours).join() === '7,10,1', `sfix: trocars at 7 / 10 / 1 o'clock: ${minF.toFixed(2)} mm from the flaps, ${minI.toFixed(2)} mm from the 12 o'clock wound, through intact conjunctiva`); }
// 15.8 the triangular flap (Guedes 2026): sides 3 mm, 1/3 of the scleral thickness, the limbal side (on the PSL line) left attached, apex behind; the 1 and 2 mm
//      entries lie in its bed; the two marks are 180° apart; the lifted flap stays outside the eye wall
{ const v = [SX.flapPt(2, 0, -SNx.flap.side / 2), SX.flapPt(2, 0, SNx.flap.side / 2), SX.flapPt(2, SX.H_TRI, 0)], sides = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => G.len(G.sub(v[a], v[b])));
  ok(sides.every(l => near(l, 3.0, 0.01)) && SNx.flap.side === 3.0, `sfix: flap sides ${sides.map(l => l.toFixed(2)).join(' / ')} mm (Guedes 2026: 3 mm)`);
  const f = SX.layersFn(sx({ flap: { open: 1 } })), s = SNx.psl + 1.0, th = T(s);
  ok(f(P3(2, s, th * SNx.flap.frac - 0.01)).sclera > 0 && f(P3(2, s, th * SNx.flap.frac + 0.01)).sclera < 0 && f(P3(2, s, 0.02)).sclera > 0 && SNx.flap.frac === 1 / 3,
    'sfix: the lifted flap takes the outer 1/3 of the sclera; the bed (2/3) stays');
  ok(SX.triG(2, SNx.psl + 0.05, 2, surfAt(SNx.psl).rho) < 0 && SX.triG(2, SNx.psl - 0.05, 2, surfAt(SNx.psl).rho) > 0 && SX.triG(2, SNx.psl + SX.H_TRI + 0.05, 2, 8) > 0,
    `sfix: flap from the PSL line (its limbal side, the hinge) back to the apex ${SX.H_TRI.toFixed(2)} mm behind`);
  const ins = mm => SX.triG(2, SX.sAbs(mm), 2, surfAt(SX.sAbs(mm)).rho) < -0.2; ok(ins(SNx.guedes) && ins(SNx.kokame), 'sfix: the 1 mm and the 2 mm entries are inside the flap bed');
  const e = SX.enface({ st: sx({ marks: 1 }) }), c = e.A.centre, u = G.sub(e.A.mark2, c), w = G.sub(e.A.mark8, c), cosA = (u[0] * w[0] + u[1] * w[1]) / Math.hypot(...u) / Math.hypot(...w);
  ok(cosA < -0.9999, `sfix: the two marks are 180° apart (${(Math.acos(Math.max(-1, Math.min(1, cosA))) / D2R).toFixed(2)}°)`);
  const R = SX.flapRot(2, 1); let inWall = 0; for (let k = 0; k <= 20; k++) for (const fr of [0, SNx.flap.frac]) { const q = R.rot(SX.flapPt(2, SX.H_TRI * k / 20, 0, fr)), W = wallOf(q[2], Math.hypot(q[0], q[1])); if (W.d > 0.02) inWall++; }
  ok(inWall === 0, `sfix: the lifted flap lies outside the eye wall (${inWall} points inside)`); }
// 15.9 the MA60AC (Aydin 2025 methods; Alcon label 待核對): optic 6.0, overall 13.0, haptics angled 10°; tied at the distal third (Guedes 2026)
{ const fr = SX.iolFree(); ok(near(fr.overall, 13.0, 0.05) && fr.optic === 6.0 && near(fr.ang, 10, 0.2) && SNx.iol.tieT > 2 / 3 && SNx.iol.tieT < 1,
    `sfix: MA60AC free shape: overall ${fr.overall.toFixed(2)}, optic ${fr.optic}, haptic angle ${fr.ang.toFixed(1)}°, tie at ${(SNx.iol.tieT * 100).toFixed(0)}% of the haptic (distal third)`); }
const iolTouch = st => { const c = SX.norm(st), IO = SX.iolOf(c), f = SX.layersFn(st), R = { iris: 0, cornea: 0, deep: 0, n: 0, minIris: 1e9 };
  IO.haps.forEach(H => H.forEach((q, i) => { const a = H[Math.max(0, i - 1)], b = H[Math.min(H.length - 1, i + 1)], ax = G.unit(G.sub(b, a)), sd = G.unit(G.cross(ax, [0, 0, 1])), up = G.unit(G.cross(sd, ax));
    for (let k = 0; k < 8; k++) { const an = 2 * Math.PI * k / 8, p = G.add(q, G.add(sd.map(v => v * Math.cos(an)), up, Math.sin(an)), SNx.iol.hd / 2 * 0.95), o = f(p); R.n++;
      if (o.iris < 0) R.iris++; if (o.cornea < 0 || o.limbus < 0) R.cornea++; if (o.cbody < -0.05 || o.proc < -0.05 || o.sclera < 0) R.deep++; R.minIris = Math.min(R.minIris, o.iris); } }));
  for (let r = 0; r <= 3; r += 0.25) for (let a = 0; a < 2 * Math.PI; a += 0.4) for (const sg of [1, -1]) { const p = G.add(G.add(G.add(IO.O, IO.d, r * Math.cos(a)), IO.eb, r * Math.sin(a)), IO.en, sg * SX.optHalf(r)), o = f(p); R.n++;
    if (o.iris < 0) R.iris++; if (o.cornea < 0) R.cornea++; R.minIris = Math.min(R.minIris, o.iris); }
  return R; };
{ const FX = sx({ vit: 1, ndl: {}, iol: {} }), IO = SX.iolOf(SX.norm(FX)), PS = SX.passes(SX.norm(FX)), t = iolTouch(FX);
  ok(Math.hypot(IO.O[0], IO.O[1]) < 0.01 && IO.tilt < 0.1, `sfix: equal entries and tension: optic centre ${Math.hypot(IO.O[0], IO.O[1]).toFixed(3)} mm off the axis, tilt ${IO.tilt.toFixed(2)}°`);
  ok(G.len(G.sub(IO.ties[0], PS.I2)) < 0.15 && G.len(G.sub(IO.ties[1], PS.I8)) < 0.15 && G.len(G.sub(IO.ties[0], IO.tie[0])) < 1e-6, `sfix: each haptic's tie point is where its suture leaves the uvea (${G.len(G.sub(IO.ties[0], PS.I2)).toFixed(2)} mm)`);
  ok(t.n > 500 && t.iris === 0 && t.cornea === 0 && t.deep === 0 && t.minIris > 0, `sfix: the fixed IOL touches neither iris nor cornea (closest to the iris ${t.minIris.toFixed(2)} mm; ${t.n} points), haptics not buried in the ciliary body`);
  const AS = SX.iolOf(SX.norm(sx({ vit: 1, ndl: { s8: 2 }, iol: {} }))), TN = SX.iolOf(SX.norm(sx({ vit: 1, ndl: {}, iol: { ten: [1, 0.6] } }))), SL = SX.iolOf(SX.norm(sx({ vit: 1, ndl: {}, iol: { slip: 8 } })));
  const u2 = G.clockDir(2), toward2 = TN.O[0] * u2[0] + TN.O[1] * u2[1];
  ok(AS.tilt > 2 && TN.dec > 0.1 && toward2 > 0.1 && SL.dec > 0.3 && SL.tilt > 5, `sfix: asymmetric entries (8 o'clock at 2 mm) tilt ${AS.tilt.toFixed(1)}°; unequal tension decentres ${TN.dec.toFixed(2)} mm toward the tighter side; a slipped haptic ${SL.dec.toFixed(2)} mm, ${SL.tilt.toFixed(1)}° (amounts 示意; Zhao 2025)`);
  const P0x = SX.iolOf(SX.norm(sx({ vit: 1, ndl: {}, iol: { pull: 0 } }))); ok(P0x.O[2] < IO.O[2] - 0.2, 'sfix: before the sutures are pulled the IOL lies further back (示意)'); }
// 15.10 knots: tied in the bed, under the closed flap (Stem 2017 / Lewis: buried to keep the knot from eroding through the conjunctiva); the 'exposed' error uncovers one
{ const C0 = SX.norm(sx({ ndl: {}, iol: {}, knot: 1, flap: { open: 0 } })), C1 = SX.norm(sx({ ndl: {}, iol: {}, knot: 1, flap: { open: 0 }, exposed: 2 }));
  const K = SX.knotOf(C0, 0), W = wallOf(K.p[2], Math.hypot(K.p[0], K.p[1]));
  ok(SX.coveredKnot(C0, 0) && SX.coveredKnot(C0, 1) && W.d > 0 && W.d < T(W.s) * SNx.flap.frac, `sfix: both knots in the bed under the closed flap (${W.d.toFixed(2)} mm deep; flap ${(T(W.s) * SNx.flap.frac).toFixed(2)} mm)`);
  const e = SX.enface({ st: sx({ ndl: {}, iol: {}, knot: 1, flap: { open: 0 }, exposed: 2 }) });
  ok(!SX.coveredKnot(C1, 0) && SX.coveredKnot(C1, 1) && e.A.knotCovered2 === false && e.A.knotCovered8 === true, 'sfix: the exposed error uncovers the 2 o\'clock knot only (both views)'); }
// 15.11 the strand through the steps: before pulling it runs E2 → I2 → dock → I8 → E8; hooked out of the 12 o'clock wound; cut into two; tied to the haptics
{ const inc = SX.incOf(), has = (pts, q) => pts.some(p => G.len(G.sub(p, q)) < 1e-6);
  const H = SX.sutureOf(SX.norm(sx({ inc: 1, ndl: { hook: 1 } }))), Hc = SX.sutureOf(SX.norm(sx({ inc: 1, ndl: { hook: 1, cut: 1 } }))), Fx = SX.sutureOf(SX.norm(sx({ ndl: {}, iol: {} })));
  ok(H.segs.length === 1 && has(H.segs[0], inc.inner) && has(H.segs[0], inc.outer) && Hc.segs.length === 2 && Hc.segs.every(s => has(s, inc.outer)),
    'sfix: hooked: one loop out through the 12 o\'clock wound; cut: two strands, both through the wound');
  ok(Fx.segs.length === 2 && Fx.segs.every((s, j) => G.len(G.sub(s[s.length - 1], Fx.IO.ties[j])) < 1e-6 && has(s, j ? Fx.PS.I8 : Fx.PS.I2)), 'sfix: fixed: each strand runs from its flap bed through its track to its haptic\'s tie point'); }
// 15.12 the dislocated old IOL (示意) lies in the vitreous cavity, inferior; the vitrectomy leaves gel only at the vitreous base (示意); views draw; GLOBE untouched
{ const st = sx({ vit: 0.55, old: {} }), O = SX.oldOf(SX.norm(st)), f = SX.layersFn(st); let inT = 0, n = 0;
  for (let x = -5; x <= 5; x += 0.25) for (let y = -7; y <= 3; y += 0.25) for (let z = 3; z <= 11.5; z += 0.25) { const p = [x, y, z]; if (O.field(p) < 0) { n++; const o = f(p); if (!(o.interior < 0) || o.iris < 0 || o.cbody < 0 || o.proc < 0 || o.retina < 0) inT++; } }
  ok(n > 50 && inT === 0 && O.O[1] < -1, `sfix: the old IOL (示意) lies in the vitreous cavity, toward 6 o'clock (${n} points, ${inT} in tissue)`);
  const g1 = SX.layersFn(sx({ vit: 1 })), g0 = SX.layersFn(sx({ vit: 0 }));
  ok(g1([0, 0, 2]).gel > 0 && g0([0, 0, 2]).gel < 0 && g0([0, 0, SX.SULC.apex[1] + 0.2]).gel > 0, 'sfix: vitrectomy removes the core gel (the anterior hyaloid stays behind the sulcus)');
  const sts = [sx({ vit: 1, peri: 1, marks: 1, pins: [{ h: 2, mm: 1 }] }), ST15, sx({ vit: 1, peri: 1, flap: { open: 1 }, trocar: 1, inc: 1, ndl: { hook: 1, cut: 1 }, iol: { at: 'out' } }), sx({ ndl: { s8: 2 }, iol: { slip: 8 }, knot: 1, flap: { open: 0 }, exposed: 2, old: {} })];
  const all = sts.map(st => SX.section({ st, win: { x: -9, y: -13, w: 18, h: 9 }, step: 0.25 }).svg + SX.enface({ st }).svg).join('');
  ok(!/NaN|undefined|Infinity/.test(all), `sfix views: no NaN/undefined (${(all.length / 1024).toFixed(0)} KB)`);
  const G1svg = G.enface({ st: {} }).svg + G.section({ plane: planes.meridian(10), win: { x: -1, y: -14.2, w: 13, h: 9 }, st: {}, step: 0.2 }).svg;
  ok(G1svg === G0svg && JSON.stringify(G.N) === G0N, 'sfix is optional: GLOBE\'s numbers and drawings are unchanged after loading it'); }

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall globe checks passed');
process.exit(fail ? 1 : 0);
