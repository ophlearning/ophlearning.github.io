// Self-check for the orbit model: node check.js  (run from this folder; no browser needed)
// Each check is an anatomical, geometric or physical relation the drawing must keep; a failure exits with code 1.
// ORBIT_JS=<path> loads another copy of orbit.js (used to make sure every check can fail).
global.document = { createElement: () => ({}) };
global.LID = require('../eyelid/lid.js');
global.CORONAL = require('../eyelid/coronal.js');
global.LOWER = require('../eyelid/lower.js');
global.LOWERC = require('../eyelid/lower-coronal.js');
global.CANTHUS = require('../eyelid/canthus.js');
const O = require(process.env.ORBIT_JS ? require('path').resolve(process.env.ORBIT_JS) : './orbit.js');
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const near = (a, b, t) => Math.abs(a - b) <= t;
const len = P => { let L = 0; for (let i = 1; i < P.length; i++) L += hyp(P[i], P[i - 1]); return L; };
const inside = (p, slack = 0) => { const xl = O.wallX(O.LAT_IN, p[1]), xm = O.wallX(O.MED_IN, p[1]); return (xl === null || p[0] >= xl - slack) && (xm === null || p[0] <= xm + slack); };
const OCS = { heme: 1 };

// 1. the two views share x with the eyelid model: lateral commissure, rim, Whitnall's tubercle (difference < 0.3 mm)
{ const ax = O.axial({ state: {} }), fr = O.front({ state: { window: 1 } });
  ok(near(ax.A.lc[0], CORONAL.LC[0], 0.3), `lateral commissure x: axial ${ax.A.lc[0].toFixed(2)} = front ${CORONAL.LC[0].toFixed(2)}`);
  ok(near(ax.A.tubercle[0], fr.A.tubercle[0], 0.3), `Whitnall tubercle x: axial ${ax.A.tubercle[0].toFixed(2)} ≈ front ${fr.A.tubercle[0].toFixed(2)}`);
  ok(near(CANTHUS.RIM_E[0], O.LAT_RIM_X, 0.3), `lateral rim x: axial ${CANTHUS.RIM_E[0].toFixed(2)} = front ${O.LAT_RIM_X.toFixed(2)}`); }
// 2. posterior globe → orbital apex 26.3 mm at rest (Oester 2012)
ok(near(O.OAPEX[1] - O.R, 26.3, 0.05), `globe-to-apex at rest ${(O.OAPEX[1] - O.R).toFixed(2)} mm = 26.3 (Oester 2012)`);
// 3. proptosis with the haematoma: the corneal apex moves forward 4.5 mm (Oester 2012, vision-loss group)
{ const a0 = O.globeOutline(0).pts, a1 = O.globeOutline(O.axial({ state: OCS }).prop).pts, ap = P => Math.min(...P.map(p => p[1]));
  ok(near(ap(a0) - ap(a1), 4.5, 0.05), `proptosis ${(ap(a0) - ap(a1)).toFixed(2)} mm = 4.5 (Oester 2012)`); }
// 4. optic nerve: slack at rest (no tenting); with the haematoma it is taut, the globe is tented (< 120°, Dalley 1989) and the nerve keeps its length
{ const n0 = O.nerve(0), n1 = O.nerve(O.axial({ state: OCS }).prop);
  ok(n0.slack > 0.5 && n0.angle === 180, `at rest the nerve has slack ${n0.slack.toFixed(2)} mm and the globe is not tented`);
  ok(n1.e > 0 && n1.angle < 120, `OCS: posterior globe angle ${n1.angle.toFixed(1)}° < 120° (Dalley 1989: < 120° with acute proptosis = emergency)`);
  ok(near(hyp(O.OAPEX, n1.T), O.L_ON, 0.05), `OCS: the taut nerve keeps its length ${hyp(O.OAPEX, n1.T).toFixed(2)} = ${O.L_ON.toFixed(2)} mm (it does not stretch)`); }
// 5. the drawn nerve at rest (bowed) is as long as the nerve (half-sine approximation within 0.3 mm)
{ const ax = O.axial({ state: {} }); ok(near(len(ax.onPts), O.L_ON, 0.3), `at rest the drawn (bowed) nerve is ${len(ax.onPts).toFixed(2)} mm ≈ its length ${O.L_ON.toFixed(2)} mm`); }
// 6. the haematoma lies behind the globe (not in it) and inside the bony orbit
{ const ax = O.axial({ state: OCS }), G = ax.N.G, H = ax.haem;
  ok(H.length > 0 && H.every(p => hyp(p, G) >= O.R + 0.3), `haematoma stays outside the globe (closest ${Math.min(...H.map(p => hyp(p, G) - O.R)).toFixed(2)} mm from the sclera)`);
  ok(H.every(p => inside(p)), 'haematoma stays inside the lateral and medial walls'); }
// 7. the globe stays inside the walls at rest and with proptosis
for (const st of [{}, OCS]) { const pr = O.axial({ state: st }).prop, P = O.globeOutline(pr).pts;
  ok(P.every(p => inside(p, -0.3)), `globe inside the walls with ≥ 0.3 mm to spare (proptosis ${pr.toFixed(1)} mm)`); }
// 8. the recti stay inside the walls (both edges, up to 90 % of their length; they converge at the apex)
for (const st of [{}, OCS]) { const pr = O.axial({ state: st }).prop;
  for (const [sg, nm] of [[-1, 'lateral'], [1, 'medial']]) { const m = O.rectus(sg, pr), T = m.T; let okAll = true;
    for (let q = 0; q <= T.L * 0.9; q += 0.25) for (const s of [-1, 1]) if (!inside(T.off(q, s * m.th(q) / 2))) okAll = false;
    ok(okAll, `${nm} rectus inside the wall (proptosis ${pr.toFixed(1)} mm)`); } }
// 9. the front door: with the tendon intact the lid is stretched over the proptosed globe; after inferior cantholysis there is no tension and
//    the free lid end springs back medial to the commissure (door open)
{ const t0 = O.axial({ state: {} }).tension, t1 = O.axial({ state: OCS }).tension, r = O.axial({ state: { ...OCS, canthotomy: 1, infLysis: 1 } });
  ok(near(t0, 0, 0.01) && t1 > 1, `lid tension: rest ${t0.toFixed(2)}, OCS ${t1.toFixed(2)} mm of stretch (tendon intact)`);
  const end = r.lidPts[r.lidPts.length - 1];
  ok(r.tension === 0 && end[0] > CANTHUS.LC_A[0] + 1, `after inferior cantholysis: no tension, free lid end x ${end[0].toFixed(2)} is > 1 mm medial to the commissure`); }
// 10. the released lid can be pulled 4 mm off the globe (narration: cut until the whole lower lid comes away from the globe)
{ const r = O.axial({ state: { ...OCS, canthotomy: 1, infLysis: 1, pull: 1 } }), P = r.A.pull, G = r.N.G;
  const S = O.surf(r.prop), s0 = P && S.reduce((b, q) => Math.abs(q[0] - P[0]) < Math.abs(b[0] - P[0]) ? q : b, S[0]);
  ok(P && near(s0[1] - P[1], 4, 0.05), `the released lid is pulled ${P ? (s0[1] - P[1]).toFixed(2) : '—'} mm off the globe (4 mm, schematic)`);
  ok(near(len(r.lidPts), O.REST_LEN - 1.5, 0.3), `the pulled lid keeps its length ${len(r.lidPts).toFixed(2)} ≈ ${(O.REST_LEN - 1.5).toFixed(2)} mm`); }
// 11. front view: superior crus above the commissure, inferior crus below; scissors for the inferior crus point down (toward the chin), for the
//     superior crus up; the crura join next to the tubercle (within 1.5 mm)
{ const fr = O.front({ state: { window: 1 } }), A = fr.A, lcY = CORONAL.LC[1];
  ok(A.supO[1] < lcY && A.infO[1] > lcY, `crura: superior origin y ${A.supO[1].toFixed(2)} above, inferior ${A.infO[1].toFixed(2)} below the commissure y ${lcY.toFixed(2)}`);
  ok(A.scInf.dir[1] > 0.9 && A.scSup.dir[1] < -0.9, 'scissors: inferior cantholysis tips point down, superior up');
  ok(near(A.J[0], A.tubercle[0], 1.5), `crura join ${Math.abs(A.J[0] - A.tubercle[0]).toFixed(2)} mm from the tubercle`);
  ok(A.supCut[1] < lcY && A.infCut[1] > lcY, 'cut points: superior cut above, inferior cut below the canthotomy line'); }
// 12. no NaN / undefined in any state
{ const sts = [{}, OCS, { ...OCS, tentShow: 1, clamp: 1 }, { ...OCS, canthotomy: 0.5 }, { ...OCS, canthotomy: 1, infLysis: 0.5 }, { ...OCS, canthotomy: 1, infLysis: 1, supLysis: 1, pull: 0.6 }, { heme: 0.4 }];
  const svg = sts.map(st => O.axial({ state: st }).svg + O.front({ state: { ...st, window: st.infLysis ? 1 : 0.5 } }).svg).join('');
  ok(!/NaN|undefined/.test(svg), `${sts.length} states: no NaN/undefined in the axial and front drawings`); }

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall orbit checks passed');
process.exit(fail ? 1 : 0);
