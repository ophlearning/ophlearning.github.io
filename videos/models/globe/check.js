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

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall globe checks passed');
process.exit(fail ? 1 : 0);
