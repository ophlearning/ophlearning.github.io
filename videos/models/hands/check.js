// Self-check for the hands-and-instruments model: node check.js  (run from this folder; no browser needed)
// HANDS_PATH=<file> runs the same checks on another copy of hands.js (break a value on purpose and see a check fail).
const H = require(process.env.HANDS_PATH || './hands.js');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const R = { kind: 'holder', tip: [4.5, 3.2], dir: H.unit([0.86, 0.5]) }, L = { kind: 'forceps', tip: [5.4, 3.4], dir: H.unit([-0.62, 0.78]) };
// 1. the field overview draws each instrument from the given tip along the given direction; the hand holds it behind the tip
{ const fv = H.overview({ R, L });
  for (const [k, inst] of [['R', R], ['L', L]]) { const g = fv.A[k].grip, back = [(g[0] - inst.tip[0]) / 52, (g[1] - inst.tip[1]) / 52];
    ok(d2(back, inst.dir) < 1e-9, `${k} hand grips its instrument 52 mm behind the tip, along the instrument (示意 distance)`);
    ok(d2(fv.A[k].dir, inst.dir) < 1e-12, `${k} overview reports the same direction as the microscope view`); }
  // right hand: thumb on the left of the instrument seen from above (radial side); left hand mirrored
  const side = (inst, p) => { const f = [-inst.dir[0], -inst.dir[1]], v = [p[0] - fv.A.R.grip[0], p[1] - fv.A.R.grip[1]]; return f[0] * v[1] - f[1] * v[0]; };
  const sR = (() => { const f = [-R.dir[0], -R.dir[1]], v = [fv.A.R.thumb[0] - fv.A.R.grip[0], fv.A.R.thumb[1] - fv.A.R.grip[1]]; return f[0] * v[1] - f[1] * v[0]; })();
  const sL = (() => { const f = [-L.dir[0], -L.dir[1]], v = [fv.A.L.thumb[0] - fv.A.L.grip[0], fv.A.L.thumb[1] - fv.A.L.grip[1]]; return f[0] * v[1] - f[1] * v[0]; })();
  ok(sR < 0 && sL > 0, 'right thumb on the radial (left) side of its instrument seen from above; left hand is the mirror image');
  ok(!/NaN|undefined/.test(fv.svg), 'overview: no NaN/undefined'); }
// 2. needle: 3/8 circle of the given radius, tip tangent = direction of travel, grasp 40% of the length from the swage
{ const nd = H.needle([0, 0], [0, 1], { side: 1, grasp: 0.4 }), r = H.SZ.needleR;
  ok(nd.pts.every(p => Math.abs(d2(p, nd.centre) - r) < 1e-9), `needle is a circular arc, radius ${r} mm (示意)`);
  const chord = d2(nd.pts[0], nd.swage), want = 2 * r * Math.sin(H.SZ.needleArc * Math.PI / 360); ok(Math.abs(chord - want) < 1e-9, `needle spans ${H.SZ.needleArc}° (3/8 circle)`);
  const t0 = H.unit(H.sub(nd.pts[0], nd.pts[1])); ok(d2(t0, [0, 1]) < 0.05, 'needle tip points along the direction of travel');
  const i = nd.pts.findIndex(p => p === nd.grasp); ok(i === 24, `grasp point at 40% of the length from the swage (point ${i} of 40 from the tip; closer to the swage, Newton 2023)`); }
// 3. pen grip, side view: index on top of the instrument, middle finger under it, thumb at it; ulnar edge on the forehead; tip down at the eye
{ const g = H.gripSide(), A = g.A, up = H.rot([-A.dir[0], -A.dir[1]], -90), rel = p => { const v = H.sub(p, A.grip); return v[0] * up[0] + v[1] * up[1]; };
  ok(rel(A.index) > 3 && rel(A.middle) < -3 && Math.abs(rel(A.thumb)) < 0.5, `tripod: index ${rel(A.index).toFixed(1)} mm above, middle ${rel(A.middle).toFixed(1)} below, thumb on the instrument`);
  ok(Math.abs(A.rest[1]) < 2 && A.rest[0] < A.grip[0], 'the hand rests on the forehead (support line) behind the fingers');
  ok(A.tip[1] > 0 && d2(A.tip, A.eye) < 3, 'the instrument tip reaches down to the eye, below the forehead rest');
  ok(!/NaN|undefined/.test(g.svg), 'grip: no NaN/undefined'); }
// 4. instruments draw without NaN
for (const k of ['holder', 'forceps', 'tyer', 'scissors', 'spatula', 'cannula']) ok(!/NaN|undefined/.test(H.drawInst({ kind: k, tip: [0, 0], dir: [1, 0] })), `${k}: no NaN/undefined`);
console.log(fail ? `\n${fail} check(s) FAILED` : '\nall hands checks passed'); process.exit(fail ? 1 : 0);
