// Case parameters of video ① shared by the drawing (draw.js) and the checks (../check.js), so a number said in the narration and the
// number the model draws are the same value. Model numbers and their sources: videos/models/globe/CARD.md (白內障).
// Case A (OD, surgeon at 12) measured on the recording 2026-11-09 (spec.md 進度): main incision 22° temporal of 12 o'clock,
// side port about 2 o'clock; the capsulorhexis start and direction are reconstructed from the forceps track (示意).
const CASE = {
  mainDeg: 22,                                                      // main incision, degrees temporal of 12 o'clock (錄影實測 21–24°)
  main: { h: 12 - 22 / 30, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' },  // h from mainDeg; w 院內常規待確認; L Ernest 1995; s 示意
  side: { h: 2.2, w: 1.0, s: -0.3, L: 1.0, arch: 'single' },         // h 錄影實測（56–68° nasal of 12）; w, L 示意
  // capsulorhexis: radius 2.625 (5.25 mm; Hollick 1999 換算); h0 3 o'clock and dir −1 (counter-clockwise as the surgeon sees it):
  // the flap is first raised nasal of the centre (1:16–1:24) and pass 2 sweeps from about 1–2 o'clock past 12 to 9 (2:20–2:36)
  ccc: { r: 2.625, h0: 3, dir: -1 },
  optic: 6.0,                                                       // IOL optic diameter: 院內常規（型號待確認）
  pass1End: 0.36,                                                   // tear front at the end of pass 1 (clock hours travelled; the flap just raised, 示意)
};
// ---------------------------------------------------------------- the tear of case A, reconstructed from the forceps (依鉗子位置重建（示意）)
// footage.js gives, per pass, the closed forceps jaws (`grasp`) and the limbus centre (`cornea`) in source px at the same source times.
// φ = clock hours travelled from ccc.h0 in ccc.dir, so the model's prog = φ / 12 and the front's clock hour is h0 + dir·φ.
//   grasp φ: the grasp's bearing from the cornea centre (下＝12 點、右＝9 點), unwrapped in time order (the shorter way between keyframes).
//   front φ: the folded flap is the torn arc [0, φf] mirrored about the front's radius, so it covers [φf, 2φf] and a grasp on it means
//            φf ≥ ½ φg. The front is put at that bound and never goes back: the farthest grasp so far was the flap's far end.
//            Before pass 2 it is the end of pass 1 (pass1End); after the last keyframe of pass 4 it reaches 12 at pass4-out (complete).
// Pure (Node and page): tearTrack(FOOTAGE_DEF, CASE) → { keys, grasp(s), front(s), hourOf(φ) }; grasp(s) is null while the forceps are out.
const clockOfPx = (p, c) => { const a = Math.atan2(p[0] - c[0], p[1] - c[1]) * 180 / Math.PI; return (((12 - a / 30) % 12) + 12) % 12; };
function tearTrack(D, P) {
  const cc = P.ccc, E = {}; for (const c of Object.values(D.clips)) Object.assign(E, c.events || {});
  const spanOf = h => (((cc.dir * (h - cc.h0)) % 12) + 12) % 12, hourOf = f => (((cc.h0 + cc.dir * f) % 12) + 12) % 12;
  const keys = [];
  for (const [id, c] of Object.entries(D.clips)) { const g = (c.points || {}).grasp, k = (c.points || {}).cornea; if (!g) continue;
    g.forEach((q, i) => { if (!k[i] || k[i].t !== q.t) throw new Error(`tear: ${id} grasp/cornea keyframes differ at ${q.t}`); keys.push({ s: q.t, clip: id, h: clockOfPx(q.p, k[i].p) }); }); }
  keys.sort((a, b) => a.s - b.s);
  let prev = null, M = 0;
  for (const q of keys) { const r = spanOf(q.h); q.phiG = prev === null ? r : prev + ((((r - prev) % 12) + 18) % 12 - 6); prev = q.phiG; }
  const passes = [1, 2, 3, 4].map(i => [E[`pass${i}-in`], E[`pass${i}-out`]]), passAt = s => passes.findIndex(([a, b]) => s >= a && s <= b);
  const lin = (ks, s, f) => { if (s <= ks[0].s) return f(ks[0]); for (let i = 1; i < ks.length; i++) if (s <= ks[i].s) { const a = ks[i - 1], b = ks[i], u = (s - a.s) / (b.s - a.s); return f(a) + (f(b) - f(a)) * u; } return f(ks[ks.length - 1]); };
  const grasp = s => { const i = passAt(s); if (i < 0) return null; const ks = keys.filter(q => q.s >= passes[i][0] && q.s <= passes[i][1]); return ks.length ? lin(ks, s, q => q.phiG) : null; };
  // front at each keyframe: ½ × running max of the grasp, at least the end of pass 1
  for (const q of keys) { M = Math.max(M, q.phiG); q.phiF = Math.max(P.pass1End, M / 2); }
  const last = keys[keys.length - 1], done = E['pass4-out'];
  const front = s => {
    if (s <= E['pass1-out']) return P.pass1End * Math.min(1, Math.max(0, (s - E['wrinkles-gone']) / (E['pass1-out'] - E['wrinkles-gone'])));
    if (s < keys[0].s) return P.pass1End;
    if (s >= last.s) return s >= done ? 12 : lin([last, { s: done, phiF: 12 }], s, q => q.phiF);
    let m = 0; for (const q of keys) if (q.s <= s) m = Math.max(m, q.phiG);
    const g = grasp(s); return Math.max(P.pass1End, Math.max(m, g === null ? 0 : g) / 2);
  };
  return { keys, grasp, front, hourOf, spanOf, passAt };
}
if (typeof module !== 'undefined') module.exports = { CASE, tearTrack, clockOfPx };
