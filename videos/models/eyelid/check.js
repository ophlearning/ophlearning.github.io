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
// 11. suture spacing (narration: 中央到內側、中央到外側的距離差在 2 mm 以內)
{ const X = CORONAL.draw({ state: { sutures: 1 } }).SX, d = Math.abs((X[1] - X[0]) - (X[2] - X[1]));
  ok(d <= 2, `sutures: central–temporal ${(X[1] - X[0]).toFixed(1)} mm vs central–nasal ${(X[2] - X[1]).toFixed(1)} mm, difference ${d.toFixed(1)} ≤ 2 mm`); }
// 12. BLTR skin incision: the same height in both views (the skin point 3 mm from the margin, projected)
{ const c = CORONAL.draw({ state: { skinCut: 1 } }), dm = c.Uy(0) - UF.at(0, 0)[1], ys = UF.at(LID.S_CUT, LID.uSkin(LID.VARIANTS.asian, LID.S_CUT))[1];
  ok(Math.abs(c.skinCutY(0) - dm - ys) < 0.3, `BLTR skin incision height: coronal ${(c.skinCutY(0) - dm).toFixed(2)} vs sagittal ${ys.toFixed(2)}`);
  ok(!/NaN|undefined/.test(LID.draw({ state: { curl: 1, bltr: 1, ghostCut: 1 } }).svg + CORONAL.draw({ state: { skinCut: 1, skinBleed: 1 } }).svg), 'BLTR states: no NaN/undefined in the SVG'); }
// 13. what the viewer measures on the skin-side view: from the lash line (narration: 「從皮膚面離瞼緣 3 mm」「從睫毛線正上方的皮膚穿出」)
{ const c = CORONAL.draw({ state: { skinCut: 1, sutures: 1 } }), d = c.lashY(0) - c.skinCutY(0), ex = c.lashY(0.5) - c.A.sutureExit[1];
  ok(Math.abs(d - LID.S_CUT) < 0.3, `skin view: BLTR skin incision ${d.toFixed(2)} mm above the lash line (narration 3 mm)`);
  ok(ex > 0 && ex < 1, `skin view: suture exits ${ex.toFixed(2)} mm above the lash line (just above it)`); }
{ const c = CORONAL.draw({ state: { evert: -1, skinCut: 1, sutures: 1 } }), root = x => c.lashY(x) + c.rollY(x), d = root(0) - c.skinCutY(0), ex = root(0.5) - c.A.sutureExit[1];
  ok(Math.abs(d - LID.S_CUT) < 0.3 && ex > 0 && ex < 1, `skin view, inturned margin: incision ${d.toFixed(2)} mm and suture exit ${ex.toFixed(2)} mm above the rolled-in lash line`); }
// 14. lid-crease approach: crease incision at the same height in both views; the buried suture ends inside the lid, not on the skin
{ const c = CORONAL.draw({ state: { crease: 1, flap: 1, buried: 1 } }), dm = c.Uy(0) - UF.at(0, 0)[1], ys = LID.creasePointUF('asian')[1];
  ok(Math.abs(c.creaseY(0) - dm - ys) < 0.3, `crease incision height: coronal ${(c.creaseY(0) - dm).toFixed(2)} vs sagittal ${ys.toFixed(2)}`);
  const r = LID.draw({ state: { curl: 0.25, crease: 1, flap: 1, cut: 1, suture: 1, buried: true } }), P3 = r.A.sutureExit, skin = r.skinAt(r.qOf(P3), 0), depth = Math.hypot(P3[0] - skin[0], P3[1] - skin[1]);
  ok(depth > 0.2, `buried suture ends ${depth.toFixed(2)} mm under the skin (not on the skin)`);
  ok(!/NaN|undefined/.test(r.svg + c.svg), 'lid-crease states: no NaN/undefined in the SVG'); }
// 15. examination (narration of 1-2): the MCJ lies behind the meibomian orifices; scarring drags it in front of them.
//     Measured from the posterior lid edge, so "behind" = closer to the globe side of the margin.
{ const n = LID.draw({ state: { mcj: 1 } }), sh = LID.draw({ state: { curl: 1, round: 1, mcj: 1, mcjShift: 1 } }), e = r => r.DP.at(0, 0), d = (r, k) => Math.hypot(r.A[k][0] - e(r)[0], r.A[k][1] - e(r)[1]);
  ok(d(n, 'mcj') < d(n, 'orifice'), `normal: MCJ ${d(n, 'mcj').toFixed(2)} mm from the posterior edge, behind the orifice (${d(n, 'orifice').toFixed(2)} mm)`);
  ok(d(sh, 'mcj') > d(sh, 'orifice'), `scarred: MCJ ${d(sh, 'mcj').toFixed(2)} mm from the posterior edge, in front of the orifice (${d(sh, 'orifice').toFixed(2)} mm)`);
// 16. misdirected and metaplastic lashes reach the cornea (narration of 1-1: lashes touching the eye)
  const m = LID.draw({ state: { misdirected: 1, metaplastic: 1 } }).A;
  ok(toGlobe(m.misLash) < 0.4 && toGlobe(m.metaLash) < 0.4, `misdirected / metaplastic lashes ${toGlobe(m.misLash).toFixed(2)} / ${toGlobe(m.metaLash).toFixed(2)} mm from the cornea (touching)`);
  const c = CORONAL.draw({ state: { misdirected: 1, metaplastic: 1 } });
  ok(!/NaN|undefined/.test(sh.svg + c.svg) && c.A.misLash && c.A.metaLash, 'examination states: no NaN/undefined in the SVG, anchors present'); }

// ============================ brow region and levator resection (videos/src/levator-resection-brow-fixation) ============================
const near = (a, b, tol) => Math.abs(a - b) <= tol, f2 = v => v.toFixed(2);
// 17. layers in front of the rim, horizontal (anteroposterior) thickness in the sagittal plane through the globe centre (Manta 2025, MRI):
//     East Asian 5 mm below the rim: subcutaneous fat 0.9, orbicularis 1.2, ROOF 1.8 mm; at the rim ROOF 4.5–4.7 mm = 63–66 % of
//     subcutaneous fat + orbicularis + ROOF; 5 mm above ROOF 1.7–1.8 mm = 33–34 %. Caucasian: no ROOF 5 mm below the rim.
const layersAt = (r, y) => { const X = k => r.crossX(r.probe[k], y), a = X('skinB'), b = X('subqB'), c = X('musB'), d = X('pb'); return { subq: b - a, mus: c - b, roof: d - c, tot: d - a }; };
{ const RY = LID.RIM_Y;
  for (const v of ['asian', 'caucasian']) { const r = LID.draw({ variant: v }), at = layersAt(r, RY - 0.5), ab = layersAt(r, RY - 5);
    ok(near(at.roof, 4.6, 0.4) && at.roof / at.tot >= 0.6 && at.roof / at.tot <= 0.7, `${v}: ROOF at the rim ${f2(at.roof)} mm, ${(at.roof / at.tot * 100).toFixed(0)} % of the layers in front (Manta 2025: 4.5–4.7 mm, 63–66 %)`);
    ok(near(ab.roof, 1.75, 0.35) && ab.roof / ab.tot >= 0.28 && ab.roof / ab.tot <= 0.40, `${v}: ROOF 5 mm above the rim ${f2(ab.roof)} mm, ${(ab.roof / ab.tot * 100).toFixed(0)} % (Manta 2025: 1.7–1.8 mm, 33–34 %)`); }
  const r = LID.draw({ variant: 'asian' }), lo = layersAt(r, RY + 5);
  ok(near(lo.subq, 0.9, 0.3) && near(lo.mus, 1.2, 0.3) && near(lo.roof, 1.8, 0.4), `asian 5 mm below the rim: subcutaneous fat ${f2(lo.subq)}, orbicularis ${f2(lo.mus)}, ROOF ${f2(lo.roof)} mm (Manta 2025: 0.9 / 1.2 / 1.8)`);
  const ca = LID.draw({ variant: 'caucasian' });
  ok(r.A.roofEnd > RY + 5 && ca.A.roofEnd < RY + 5, `ROOF reaches ${f2(r.A.roofEnd - RY)} mm below the rim in the East Asian lid, ends ${f2(ca.A.roofEnd - RY)} mm below it in the Caucasian (Manta 2025: none at 5 mm)`); }
// 18. brow: lower edge 10.66 mm above the upper lid margin at mid-pupil (Gao 2025); same height in both views; it moves with browY in both views
{ const s0 = LID.draw({}), c0 = CORONAL.draw({}), dm = c0.Uy(0) - UF.at(0, 0)[1];
  ok(near(-4 - s0.A.browLo[1], 10.66, 0.15), `sagittal: brow lower edge ${f2(-4 - s0.A.browLo[1])} mm above the lid margin (Gao 2025: 10.66)`);
  ok(near(c0.browLoY(0) - dm, s0.A.browLo[1], 0.3), `brow lower edge: coronal ${f2(c0.browLoY(0) - dm)} vs sagittal ${f2(s0.A.browLo[1])}`);
  const G = [['lateral canthus', CORONAL.LC[0], 14.38, CORONAL.LC[1]], ['lateral limbus', -CORONAL.LIMB, 10.33], ['pupil centre', 0, 10.66], ['medial limbus', CORONAL.LIMB, 11.33], ['medial canthus', CORONAL.MC[0], 18.99, CORONAL.MC[1]]];
  for (const [n, x, d, ref] of G) { const h = (ref ?? CORONAL.U4(x)) - CORONAL.browLoY(x); ok(near(h, d, 0.2), `coronal: brow lower edge above the ${n} ${f2(h)} mm (Gao 2025: ${d})`); }
  const s1 = LID.draw({ state: { browY: 2.7 } }), c1 = CORONAL.draw({ state: { browY: 2.7 } });
  ok(near(s0.A.browLo[1] - s1.A.browLo[1], 2.7, 0.1) && near(c0.browLoY(0) - c1.browLoY(0), 2.7, 0.1), `browY 2.7: brow moves ${f2(s0.A.browLo[1] - s1.A.browLo[1])} (sagittal) / ${f2(c0.browLoY(0) - c1.browLoY(0))} mm (coronal)`); }
// 19. supraorbital notch 22.96 mm from the midline (Pruksapong 2022; midline = half of Gao 2025 PD 31.84 mm); the brow fixation stays lateral to it
{ const c = CORONAL.draw({ state: { notch: 1, excRemove: 1, browSut: 1 } });
  ok(near(31.84 - CORONAL.NOTCH_X, 22.96, 0.05) && c.A.notch, `supraorbital notch ${f2(31.84 - CORONAL.NOTCH_X)} mm from the midline, ${f2(CORONAL.NOTCH_X)} mm nasal to the pupil centre`);
  ok(c.A.browFix[0] < CORONAL.NOTCH_X - CORONAL.NOTCH_W / 2 - 2, `brow fixation point ${f2(CORONAL.NOTCH_X - c.A.browFix[0])} mm lateral to the notch centre (clear of the notch by > 2 mm)`); }
// 20. lid height (mrd1): margin and superior tarsal border at the same height in both views
for (const m of [1.5, 2.5, 5]) { const s = LID.draw({ state: { mrd1: m } }), c = CORONAL.draw({ state: { mrd1: m } }), dm = c.Uy(0) - s.DP.at(0, 0)[1];
  ok(near(-c.Uy(0), m, 0.05) && near(dm, 0.05, 0.1) && near(c.tarTopY(0) - dm, s.DP.at(10, 0.6)[1], 0.3), `mrd1 ${m}: coronal margin ${f2(c.Uy(0))} / sagittal ${f2(s.DP.at(0, 0)[1])}, tarsal border coronal ${f2(c.tarTopY(0) - dm)} / sagittal ${f2(s.DP.at(10, 0.6)[1])}`); }
// 21. skin incisions: measured along the skin from the lash line (template 4 mm, 5 mm strip; to be confirmed from the OP note); same heights in both views
for (const incH of [[2.5, 4, 4], [2.5, 3, 4]]) { const st = { incH, excCut: 1, excRemove: 1 }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: st }), E = s.A.excQ;
  ok(near(E.qLo - E.qLash, incH[1], 0.01) && near(E.qHi - E.qLo, 5, 0.01), `incH ${incH}: lower incision ${f2(E.qLo - E.qLash)} mm from the lash line along the skin, strip ${f2(E.qHi - E.qLo)} mm`);
  const sl = s.A.lashSkin[1], dLo = s.A.incLo[1] - sl, dHi = s.A.incHi[1] - sl, cl = c.lashY(0);
  ok(near(c.excLoY(0) - cl, dLo, 0.3) && near(c.excHiY(0) - cl, dHi, 0.3), `incisions above the lash line: coronal ${f2(c.excLoY(0) - cl)} / ${f2(c.excHiY(0) - cl)} vs sagittal ${f2(dLo)} / ${f2(dHi)}`);
  ok(near((c.excLoY(7) - c.lashY(7)) / (c.excLoY(0) - cl), incH[0] / incH[1] * Math.pow(Math.max(0, Math.sin(Math.PI * (7 + 12.4) / 22.2)), 0.35), 0.03), `medial incision height in proportion to incH (${incH[0]} / ${incH[1]})`); }
// 22. levator advancement: cut edge sits on the anterior tarsus at fixS; the tarsal bite is partial thickness (clear of the conjunctiva); both views
{ const st = { mrd1: 3.5, excRemove: 1, septOpen: 1, fatUp: 1, dis: 1, resect: 1, advance: 1, tarSut: 1 }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: st });
  ok(hyp(s.A.levEnd, s.A.fix) < 0.2, `advanced levator: cut edge ${f2(hyp(s.A.levEnd, s.A.fix))} mm from the fixation point on the tarsus`);
  const b = s.A.tarSut, post = s.DP.at(st.fixS ?? 7.5, 0.16), ant = s.DP.at(st.fixS ?? 7.5, LID.U_TAR);
  ok(hyp(b, post) >= 0.3 && hyp(b, ant) >= 0.3, `tarsal bite partial thickness: ${f2(hyp(b, post))} mm from the conjunctival surface, ${f2(hyp(b, ant))} mm from the anterior surface`);
  const dS = b[1] - s.DP.at(0, 0)[1], dC = c.fixY(0) - c.Uy(0);
  ok(near(dS, dC, 0.3), `tarsal sutures above the margin: coronal ${f2(dC)} vs sagittal ${f2(dS)}`);
  const sc = LID.draw({ state: { ...st, advance: 0, clamp: 1 } }), cc = CORONAL.draw({ state: { ...st, advance: 0, clamp: 1 } });
  ok(near(cc.clampY(0) - cc.Uy(0), LID.keyPoints({ ...st, advance: 0, clamp: 1 }).clamp[1] - sc.DP.at(0, 0)[1], 0.3) && sc.A.clamp, `clamp height: coronal ${f2(cc.clampY(0) - cc.Uy(0))} vs sagittal ${f2(LID.keyPoints({ ...st, advance: 0 }).clamp[1] - sc.DP.at(0, 0)[1])} above the margin`); }
// 23. internal brow fixation: periosteal bite in the periosteum above the rim, ROOF bite inside ROOF, dissection plane reaches above the bite;
//     tying lifts the brow by browLift in both views
{ const st = { excRemove: 1, browPlane: 1, browSut: 1 }, s = LID.draw({ state: st }), P2 = s.A.browSutP, P1 = s.A.browSutR;
  const bone = s.probe.bone; let dB = 1e9; for (const q of bone) dB = Math.min(dB, hyp(q, P2));
  ok(dB <= LID.PERI + 0.05 && P2[1] < LID.RIM_Y - 1, `periosteal bite ${f2(dB)} mm from the bone (periosteum ${LID.PERI} mm), ${f2(LID.RIM_Y - P2[1])} mm above the rim`);
  const xm = s.crossX(s.probe.musB, P1[1]), xb = s.crossX(s.probe.pb, P1[1]);
  ok(P1[0] > xm + 0.3 && P1[0] < xb - 0.3, `ROOF bite inside ROOF (${f2(P1[0] - xm)} mm behind the orbicularis, ${f2(xb - P1[0])} mm in front of the periosteum)`);
  ok(Math.min(...s.A.browPlanePts.map(p => p[1])) < P2[1] - 1, `dissection plane reaches ${f2(P2[1] - Math.min(...s.A.browPlanePts.map(p => p[1])))} mm above the periosteal bite`);
  const t = LID.draw({ state: { ...st, browTie: 1 } }), c0 = CORONAL.draw({ state: st }), c1 = CORONAL.draw({ state: { ...st, browTie: 1 } });
  ok(near(s.A.browLo[1] - t.A.browLo[1], 1, 0.1) && near(c0.browLoY(0) - c1.browLoY(0), 1, 0.1) && near(t.A.browSutR[1], t.A.browSutP[1], 0.05), `brow tie: brow up ${f2(s.A.browLo[1] - t.A.browLo[1])} (sagittal) / ${f2(c0.browLoY(0) - c1.browLoY(0))} mm (coronal), bites meet`); }
// 24. conjunctival prolapse: below the lid margin, outside the globe; same depth in both views. Fornix suture exits the skin below the incision
{ const st = { prolapse: 1, excRemove: 1, fornixSut: 1 }, s = LID.draw({ state: st }), c = CORONAL.draw({ state: st }), m = s.DP.at(0, 0)[1];
  ok(s.A.prolapseLow - m > 1.5 && Math.min(...s.A.prolapsePts.map(toGlobe)) >= 0, `prolapse reaches ${f2(s.A.prolapseLow - m)} mm below the margin, closest ${f2(Math.min(...s.A.prolapsePts.map(toGlobe)))} mm from the globe`);
  ok(near(c.prolY(0) - c.Uy(0), s.A.prolapseLow - m, 0.3), `prolapse below the margin: coronal ${f2(c.prolY(0) - c.Uy(0))} vs sagittal ${f2(s.A.prolapseLow - m)}`);
  const F = s.A.fornixSutPts, ex = F[F.length - 1];
  ok(ex[1] > s.A.incLo[1] && Math.min(...F.map(toGlobe)) > 0, `fornix suture exits ${f2(ex[1] - s.A.incLo[1])} mm below the lower incision, never inside the globe`); }
// 25. every new state draws without NaN / undefined, both views and both variants
{ const all = { mrd1: 3.5, excMark: 1, excCut: 1, excRemove: 1, septOpen: 1, fatUp: 1, dis: 1, clamp: 1, resect: 1, advance: 1, tarSut: 1, creaseFix: 1, browPlane: 1, browSut: 1, browTie: 1, browY: 1, prolapse: 1, fornixSut: 1, notch: 1 };
  for (const v of ['asian', 'caucasian']) for (const st of [all, { ...all, advance: 0.5, resect: 0.5 }, { mrd1: 1.5, excCut: 0.5, septOpen: 0.5 }])
    ok(!/NaN|undefined/.test(LID.draw({ variant: v, state: st }).svg + CORONAL.draw({ variant: v, state: st }).svg), `${v}: levator resection states ${Object.keys(st).length} keys — no NaN/undefined`); }
console.log(fail ? `${fail} check(s) failed` : 'all checks passed');
process.exit(fail ? 1 : 0);
