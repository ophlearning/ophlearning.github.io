// Self-check for the eyelid model: node check.js  (run from this folder; no browser needed)
// Each check is an anatomical or geometric relation the drawing must keep; a failure exits with code 1.
global.document = { createElement: () => ({}) };
global.LID = require('./lid.js');
const CORONAL = require('./coronal.js');
const { UF, LEV, geom } = LID;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const arc = (s0, s1) => { let L = 0, p = UF.at(s0, 0); for (let s = s0 + 0.01; s <= s1 + 1e-9; s += 0.01) { const q = UF.at(s, 0); L += hyp(p, q); p = q; } return L; };

// 1. upper lid margin 4 mm above the corneal light reflex (MRD1 ≈ 4)
ok(Math.abs(UF.at(0, 0)[1] - -4) < 0.15, `upper lid margin height ${UF.at(0, 0)[1].toFixed(2)} mm ≈ −4`);
// 2. tarsus 10 mm measured along the posterior lid surface (posterior surface bulges over SR/conjunctiva, allow 0.4 mm)
ok(Math.abs(arc(0, 10) - 10) < 0.4, `tarsus height along the lid ${arc(0, 10).toFixed(2)} mm ≈ 10`);
// 3. septum–aponeurosis fusion: Asian single eyelid below the superior tarsal border, Caucasian above (Jeong 1999)
const tarTopY = UF.at(10, 0.6)[1];
for (const [v, below] of [['asian', true], ['caucasian', false]]) {
  const fy = LEV.off(geom(v).S_F, -0.07)[1];
  ok(below ? fy > tarTopY : fy < tarTopY, `${v}: fusion y ${fy.toFixed(2)} is ${below ? 'below' : 'above'} the superior tarsal border y ${tarTopY.toFixed(2)}`);
}
// 4. Asian: septum always lies behind the skin by ≥ 0.8 mm (skin + subcutaneous fat + orbicularis)
{ const g = geom('asian'), sk = g.sk.pts; let worst = 1e9;
  for (const p of g.SEPT.pts) { let best = null; for (let i = 1; i < sk.length; i++) { const a = sk[i - 1], b = sk[i];
      if ((a[1] - p[1]) * (b[1] - p[1]) <= 0 && a[1] !== b[1]) { const x = a[0] + (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]); if (best === null || x > best) best = x; } }
    if (best !== null) worst = Math.min(worst, p[0] - best); }
  ok(worst >= 0.8, `asian: septum stays ≥ 0.8 mm behind the skin (closest ${worst.toFixed(2)} mm)`); }
// 5. coronal heights at the sagittal plane (x = 0) equal the sagittal model's projected heights
for (const v of ['asian', 'caucasian']) {
  const c = CORONAL.draw({ variant: v }), dm = c.Uy(0) - UF.at(0, 0)[1];
  const pairs = [['tarsal top', c.tarTopY(0), UF.at(10, 0.6)[1]], ['fusion', c.fusY(0), LEV.off(geom(v).S_F, -0.07)[1]], ['Whitnall', c.whitY(0), LEV.off(LID.S_J, 0)[1]]];
  for (const [n, a, b] of pairs) ok(Math.abs(a - dm - b) < 0.2, `${v}: coronal ${n} ${a.toFixed(2)} matches sagittal ${b.toFixed(2)}`);
}
// 6. drawings contain no NaN / undefined coordinates
for (const v of ['asian', 'caucasian']) {
  const s = LID.draw({ variant: v }).svg + CORONAL.draw({ variant: v, windows: [CORONAL.strip(-4.5, 1.5, 4)] }).svg;
  ok(!/NaN|undefined/.test(s), `${v}: no NaN/undefined in the SVG (${(s.length / 1024).toFixed(0)} KB)`);
}
// 7. PLTR incision: same height in both views (3 mm from the margin along the lid, projected for the coronal view)
{ const c = CORONAL.draw({ state: { incision: 1 } }), dm = c.Uy(0) - UF.at(0, 0)[1], ys = UF.at(LID.S_CUT, 0)[1];
  ok(Math.abs(c.cutY(0) - dm - ys) < 0.3, `incision height: coronal ${(c.cutY(0) - dm).toFixed(2)} vs sagittal ${ys.toFixed(2)}`); }
// 8. entropion: lashes touch the cornea; after the correction they are clear of it
const toGlobe = p => { const ph = Math.atan2(p[1], p[0]); return Math.hypot(p[0], p[1]) - Math.hypot(...LID.gp(ph)); };
{ const pre = LID.draw({ state: { curl: 1 } }).A, post = LID.draw({ state: { curl: 1, cut: 1, plane: 1, suture: 1, k: 1, over: 8, tuck: 1 } }).A;
  ok(toGlobe(pre.lashTip) < 0.6, `entropion: lash tip ${toGlobe(pre.lashTip).toFixed(2)} mm from the cornea (touching)`);
  ok(toGlobe(post.lashTip) > 3, `after rotation: lash tip ${toGlobe(post.lashTip).toFixed(2)} mm from the cornea (clear)`); }
// 9. after tying, the upper tarsal cut edge sits in front of the marginal strip (the wedge)
{ const r = LID.draw({ state: { curl: 1, cut: 1, plane: 1, suture: 1, k: 1, over: 8, tuck: 1 } }), edge = r.DP.at(LID.S_CUT + 0.05, 0.16), front = r.DP.at(2.6, LID.U_TAR), n = r.DP.nrm(2.6);
  const d = (edge[0] - front[0]) * n[0] + (edge[1] - front[1]) * n[1];
  ok(d > 0, `tuck: upper tarsal edge lies ${d.toFixed(2)} mm in front of the marginal strip`); }
// 10. everted view: incision sits at S_CUT / S_TAR of the tarsal height from the margin, and runs ≥ 20 mm (narration: 「切口總長至少 20 mm」)
{ const e = CORONAL.drawEverted({ state: { incision: 1 } }), r = (e.incY(0) - e.tarEdge(0)) / (e.foldY(0) - e.tarEdge(0)), len = e.XI[e.XI.length - 1] - e.XI[0];
  ok(Math.abs(r - LID.S_CUT / LID.S_TAR) < 0.02, `everted: incision at ${(r * 100).toFixed(1)}% of the tarsal height from the margin (sagittal ${(LID.S_CUT / LID.S_TAR * 100).toFixed(0)}%)`);
  ok(len >= 20, `everted: incision length ${len.toFixed(1)} mm ≥ 20 mm`);
  ok(!/NaN|undefined/.test(CORONAL.drawEverted({ state: { scar: 1, incision: 1, ends: 1, lenArrow: 1, bleed: 1, notch: 1, nasalShort: 1, incWavy: 1, incShort: 1 } }).svg), 'everted: no NaN/undefined in the SVG'); }
console.log(fail ? `${fail} check(s) failed` : 'all checks passed');
process.exit(fail ? 1 : 0);
