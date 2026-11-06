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

// ============================ lower lid (videos/src/lower-lid-entropion-revision, levator-brow-lower-lid-rotation) ============================
// The lower lid is opt-in (lower.js, lower-coronal.js, canthus.js): the checks above run without it, so they show the old drawings did not change.
global.CORONAL = CORONAL;
const LOWER = global.LOWER = require('./lower.js');
const LOWERC = global.LOWERC = require('./lower-coronal.js');
const CANTHUS = require('./canthus.js');
const LF = LOWER.LF, tg = LOWER.toGlobe, dist = hyp, sub = (a, b) => [a[0] - b[0], a[1] - b[1]], unit = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
const arcL = (fr, s0, s1, u = 0) => { let L = 0, p = fr(s0, u); for (let s = s0 + 0.01; s <= s1 + 1e-9; s += 0.01) { const q = fr(s, u); L += dist(p, q); p = q; } return L; };
// lid coordinates (s, u) of a point in the undeformed lower-lid frame: s where the point lies on the frame normal, u its depth
const lidSU = p => { let bs = 0, bd = 1e9; for (let s = 0; s <= 14; s += 0.02) { const o = LF.at(s, 0), n = LF.nrm(s), v = [p[0] - o[0], p[1] - o[1]], e = Math.abs(-v[0] * n[1] + v[1] * n[0]); if (e < bd) { bd = e; bs = s; } }
  const o = LF.at(bs, 0), n = LF.nrm(bs); return [bs, (p[0] - o[0]) * n[0] + (p[1] - o[1]) * n[1]]; };
const L0 = LOWER.draw({ state: {} });
// L1. lower margin 5 mm below the light reflex (MRD2): the coronal Ly(0) and the sagittal margin agree
ok(near(L0.A.marginL[1], 5.0, 0.1) && near(CORONAL.Ly(0), L0.A.marginL[1], 0.3), `lower margin: sagittal ${f2(L0.A.marginL[1])} / coronal Ly(0) ${f2(CORONAL.Ly(0))} mm below the light reflex (MRD2 5)`);
// L2. lower tarsus 4.12 mm along the posterior lid surface, 1.36 mm thick (Lim 2004, Asian cadavers)
{ const h = arcL((s, u) => L0.DP.at(s, u), 0, LOWER.S_TARL), th = dist(L0.DP.at(2, LOWER.U_CONJ), L0.DP.at(2, LOWER.U_TARL));
  ok(near(h, 4.12, 0.3) && near(th, 1.36, 0.05), `lower tarsus: height ${f2(h)} mm along the lid (Lim 2004: 4.12), thickness ${f2(th)} mm (1.36)`); }
// L3. retractors: CPF inserts on the inferior tarsal border; inferior tarsal muscle starts 1.44 mm below it (Lim 2004); septum joins the CPF
//     2.38 mm below the tarsus (Kakizaki 2006, Asian); lower fornix 10.9 mm from the margin (Jutley 2016)
{ const [sC] = lidSU(L0.A.cpfEnd), itm = arcL((s, u) => L0.DP.at(s, u), LOWER.S_TARL, LOWER.S_ITM), fus = arcL((s, u) => L0.DP.at(s, u), LOWER.S_TARL, LOWER.S_FUSL, LOWER.U_CPF);
  const [sF, uF] = lidSU(L0.A.fusionL), fx = arcL((s, u) => L0.DP.at(s, u), 0, LOWER.S_FORNIXL);
  ok(near(sC, LOWER.S_TARL, 0.1) && near(itm, 1.44, 0.15), `retractors: CPF starts at s ${f2(sC)} (tarsal border ${LOWER.S_TARL}); inferior tarsal muscle starts ${f2(itm)} mm below it (Lim 2004: 1.44)`);
  ok(near(fus, 2.38, 0.25) && near(sF, LOWER.S_FUSL, 0.15) && near(uF, LOWER.U_CPF, 0.1), `septum–CPF fusion ${f2(fus)} mm below the tarsus, on the CPF (u ${f2(uF)}) (Kakizaki 2006: 2.38)`);
  ok(near(fx, 10.9, 0.4), `lower fornix ${f2(fx)} mm from the margin along the lid (Jutley 2016: 10.9)`); }
// L4. orbicularis thickness: pretarsal 0.68, preseptal 0.89 mm (Vasanthapuram 2020)
{ const qP = L0.SK.near(L0.DA.at(2.0, LOWER.U_SKINL)), qS = L0.SK.near(L0.SEPT.off(L0.SEPT.L * 0.35, 1.2));
  ok(near(L0.orbW(qP), 0.68, 0.03) && near(L0.orbW(qS), 0.89, 0.06), `orbicularis: pretarsal ${f2(L0.orbW(qP))} mm, preseptal ${f2(L0.orbW(qS))} mm (Vasanthapuram 2020: 0.68 / 0.89)`); }
// L5. inferior orbital rim 7.8 mm, fat pad front 2.4 mm behind the corneal apex, cheek 1.4 mm in front of it (Kato 2025, East Asians 60–79 y)
{ const ax = LOWER.APEX_X, rim = Math.min(...LOWER.boneOut.filter(p => Math.abs(p[1] - LOWER.Y_RIM) < 3).map(p => p[0])), fat = Math.min(...L0.SEPT.pts.map(p => p[0])) + 0.075, ch = Math.min(...L0.probe.skin.filter(p => p[1] > LOWER.Y_RIM + 3).map(p => p[0]));
  ok(near(rim - ax, 7.8, 0.1) && near(fat - ax, 2.4, 0.2) && near(ax - ch, 1.4, 0.2), `profile: rim ${f2(rim - ax)} mm, fat pad ${f2(fat - ax)} mm behind the corneal apex, cheek ${f2(ax - ch)} mm in front (Kato 2025: 7.8 / 2.4 / 1.4)`);
  ok(Math.min(...L0.SEPT.pts.map(tg)) > 0, `septum outside the globe (closest ${f2(Math.min(...L0.SEPT.pts.map(tg)))} mm)`); }
// L6. inferior rectus inserts 5.72 mm behind the limbus (Kim 2024)
ok(near((LOWER.PHI_LL - LOWER.PHI_IR) * 12, 5.72, 0.01), `inferior rectus insertion ${f2((LOWER.PHI_LL - LOWER.PHI_IR) * 12)} mm behind the limbus (Kim 2024: 5.72)`);
// L7. lash follicles: 0.9 mm along the follicle (Elder 1997), at 75° to the margin surface (Singh 2024), bulb close to but outside the tarsus;
//     with Singh's 1.8 mm the bulb still lies outside the tarsus
for (const fd of [0.9, 1.8]) { const r = LOWER.draw({ state: { follicleDepth: fd } }).A, d = dist(r.bulbL, r.lashRootL), [, uB] = lidSU(r.bulbL), t = LF.tan(0.15), c = Math.abs(r.follicleDir[0] * t[0] + r.follicleDir[1] * t[1]);
  const ang = 90 - Math.acos(Math.min(1, c)) * 180 / Math.PI;   // angle to the margin surface, which is perpendicular to the lid axis
  ok(near(d, fd, 0.01) && near(ang, 75, 3) && uB > LOWER.U_TARL - 0.02 && uB - LOWER.U_TARL < 0.5, `follicle depth ${f2(d)} mm (${fd === 0.9 ? 'Elder 1997' : 'Singh 2024'}), ${ang.toFixed(0)}° to the margin surface (Singh 2024: 75°), bulb ${f2(uB - LOWER.U_TARL)} mm in front of the tarsus`); }
// L8. electrolysis needle: along the lash shaft, tip at the follicle depth (0.9 mm, Elder 1997; 1.8 mm, Singh 2024)
for (const fd of [0.9, 1.8]) { const A = LOWER.draw({ state: { needle: 1, treated: 1, follicleDepth: fd } }).A, v = unit(sub(A.needleTip, A.needleBack)), c = v[0] * A.follicleDir[0] + v[1] * A.follicleDir[1];
  ok(dist(A.needleTip, A.bulbL) < 0.05 && c > Math.cos(2 * Math.PI / 180) && near(dist(A.needleTip, A.needleIn), fd, 0.02), `needle tip ${f2(dist(A.needleTip, A.bulbL))} mm from the bulb, ${f2(dist(A.needleTip, A.needleIn))} mm in along the shaft (follicle depth ${fd})`); }
{ const c = CORONAL.draw({ lower: { needle: 1, treated: 1 } }); ok(c.A.needleL && near(c.A.needleL[1], c.lashLY(1.0), 0.01), 'coronal: the needle enters at the lash line'); }
// L9. entropion: lashes lie on the cornea, nothing enters the globe; after the everting sutures are tied the lashes are clear of the cornea
const lidPts = r => { const P = []; for (let s = 0; s <= 10; s += 0.25) for (const u of [0, 0.8, LOWER.U_TARL, LOWER.U_SKINL]) P.push(r.DP.at(s, u)); return P; };
{ const e = LOWER.draw({ state: { entr: 1, dehis: 1, override: 1 } }), m = Math.min(...e.A.lashPtsL.map(tg));
  ok(m < 0.6 && Math.min(...lidPts(e).map(tg)) >= 0, `entropion: lash ${f2(m)} mm from the cornea (touching); lid never inside the globe (closest ${f2(Math.min(...lidPts(e).map(tg)))} mm)`);
  const st = { entr: 1, dehis: 1, override: 1, subcil: 1, plane: 1, septOpen: 1, retrOpen: 1, frac: 1, mattress: 1, tie: 1 }, t = LOWER.draw({ state: st }), mt = Math.min(...t.A.lashPtsL.map(tg));
  ok(mt > 2 && tg(t.A.lashTipL) > 3 && Math.min(...lidPts(t).map(tg)) >= 0, `after tying: lash ${f2(mt)} mm (tip ${f2(tg(t.A.lashTipL))} mm) from the cornea (clear); lid outside the globe`);
  const cE = s => LOWER.draw({ state: s }).A.cpfEnd, [sD] = lidSU(cE({ dehis: 1 })), [sT] = lidSU(cE({ dehis: 1, mattress: 1, tie: 1, over: 0 }));
  ok(sD - LOWER.S_TARL > 1.5 && near(sT, LOWER.S_TARL, 0.1), `retractor disinsertion: CPF edge ${f2(sD - LOWER.S_TARL)} mm off the tarsus; after the sutures are tied ${f2(sT - LOWER.S_TARL)} mm`); }
// L10. subciliary incision 2.5 mm below the lashes along the skin (template); tarsal fracture to half the tarsal thickness from the front
{ const r = LOWER.draw({ state: { subcil: 1, frac: 1 } }), E = r.A.lower;
  ok(near(E.qInc - E.qLash, 2.5, 0.01) && dist(r.A.incL, r.SK.off(E.qInc, 0)) < 1e-6, `subciliary incision ${f2(E.qInc - E.qLash)} mm below the lash line along the skin (template 2.5)`);
  const [a, b] = r.A.fracPts, [, ua] = lidSU(a), [, ub] = lidSU(b);
  ok(near(ua, LOWER.U_TARL, 0.02) && near(ua - ub, LOWER.TAR_TH * 0.5, 0.02) && ub > LOWER.U_CONJ + 0.3, `tarsal fracture from the anterior surface ${f2(ua - ub)} mm deep (half of ${LOWER.TAR_TH}), ${f2(ub - LOWER.U_CONJ)} mm short of the conjunctiva`); }
// L11. everting mattress suture: enters the conjunctiva near the fornix, passes through the retractors, runs in front of the tarsus (never through
//      it), exits through the skin between the lash line and the incision; never inside the globe
{ const r = LOWER.draw({ state: { subcil: 1, mattress: 1 } }), P = r.A.mattressPts, SU = P.map(lidSU), E = r.A.lower;
  const [s0, u0] = SU[0], thrRetr = SU.some(([s, u]) => s > LOWER.S_TARL + 0.5 && s < LOWER.S_FORNIXL - 1 && u > LOWER.U_ITM && u < LOWER.U_CPF);
  const inTarsus = SU.some(([s, u]) => s < LOWER.S_TARL - 0.2 && u > LOWER.U_CONJ && u < LOWER.U_TARL - 0.02), ex = P[P.length - 1], qEx = r.SK.near(ex);
  ok(Math.abs(u0) < 0.02 && LOWER.S_FORNIXL - s0 > 0.5 && LOWER.S_FORNIXL - s0 < 1.5, `mattress enters the conjunctiva ${f2(LOWER.S_FORNIXL - s0)} mm from the fornix`);
  ok(thrRetr && !inTarsus, 'mattress passes through the retractors and stays in front of the tarsus');
  ok(dist(ex, r.SK.off(qEx, 0)) < 0.05 && qEx - E.qLash > 0.5 && qEx < E.qInc, `mattress exits the skin ${f2(qEx - E.qLash)} mm below the lash line, above the incision (${f2(E.qInc - E.qLash)} mm)`);
  ok(Math.min(...P.map(tg)) > 0, 'mattress suture never inside the globe'); }
// L12. Hotz: orbicularis fixed to the retractor aponeurosis (CPF), 5 sutures (template)
{ const r = LOWER.draw({ state: { hotzExc: 1, septOpen: 1, hotzFat: 1, hotzFix: 1 } }), [, u2] = lidSU(r.A.hotzFixEnds[1]), c = CORONAL.draw({ lower: { hotzExc: 1, hotzFix: 1 } });
  ok(u2 > LOWER.U_ITM && u2 < LOWER.U_CPF && c.A.hotzX.length === 5, `Hotz suture ends in the CPF (u ${f2(u2)}), ${c.A.hotzX.length} sutures in the skin view`); }
// L13. two views agree (< 0.3 mm at x = 0): lash line, inferior tarsal border, fusion, fornix, incision, suture exit, fracture, Hotz lines
for (const st of [{}, { entr: 1, dehis: 1, override: 1 }, { subcil: 1, plane: 1, septOpen: 1, retrOpen: 1, frac: 1, mattress: 1, tie: 1 }, { hotzExc: 1, hotzFix: 1 }]) {
  const K = LOWER.keyPoints(st), c = CORONAL.draw({ lower: st });
  const pairs = [['lash line', c.lashLY(0), K.lash], ['tarsal border', c.tarBotLY(0), K.tarBot], ['fusion', c.fusLY(0), K.fusion], ['fornix', c.fornixLY(0), K.fornix], ['incision', c.incLY(0), K.inc],
    ['suture exit', c.exitLY(0), K.exit], ['fracture', c.fracLY(0), K.frac], ['Hotz lower', c.hotzLoY(0), K.hotzLo], ['Hotz upper', c.hotzHiY(0), K.hotzHi]];
  const bad = pairs.filter(([, y, p]) => Math.abs((y - CORONAL.Ly(0)) - (p[1] - K.margin[1])) >= 0.3);
  ok(!bad.length, `coronal = sagittal below the margin (${Object.keys(st).length ? Object.keys(st).join('+') : 'normal'}): ${bad.length ? 'MISMATCH ' + bad.map(b => b[0]).join(', ') : pairs.length + ' heights within 0.3 mm'}`); }
// L14. lateral canthus: Hertel 13.91 mm, rim 21.07 mm temporal (Tsai 2006; Gao 2025); tubercle 1.5 mm inside the rim (Gioia 1987);
//      commissure to insertion 7.52 mm (Rosenstein 2000); axial and coronal share x
{ const X = CANTHUS, c = CORONAL.draw({ lower: { canthotomy: 1, strip: 1, stripFix: 1 } });
  ok(near(X.RIM_E[1] - LOWER.APEX_X, 13.91, 0.01) && near(-X.RIM_E[0], 21.07, 0.01), `lateral rim ${f2(X.RIM_E[1] - LOWER.APEX_X)} mm behind the corneal apex (Tsai 2006: 13.91), ${f2(-X.RIM_E[0])} mm temporal to the pupil`);
  ok(near(dist(X.TUB, X.RIM_E), 1.5, 0.01) && near(dist(X.LC_A, X.TUB), 7.52, 0.01), `tubercle ${f2(dist(X.TUB, X.RIM_E))} mm inside the rim (Gioia 1987: 1.5); commissure–insertion ${f2(dist(X.LC_A, X.TUB))} mm (Rosenstein 2000: 7.52)`);
  ok(near(X.LC_A[0], CORONAL.LC[0], 0.01) && near(c.latRimX, X.RIM_E[0], 0.01) && near(c.tubercle[0], X.TUB[0], 0.3) && near(c.A.stripFix[0], X.TUB[0], 0.3), `axial = coronal: commissure x ${f2(X.LC_A[0])} / ${f2(CORONAL.LC[0])}, tubercle and strip fixation x ${f2(X.TUB[0])} / ${f2(c.tubercle[0])}`);
  const rl = Math.min(...c.rimLine.filter(p => Math.abs(p[1] - CORONAL.LC[1]) < 1).map(p => p[0]));
  ok(near(rl, X.RIM_E[0], 0.3), `coronal lateral rim at the canthal level x ${f2(rl)} (axial ${f2(X.RIM_E[0])})`); }
// L15. LTS: the strip end is fixed on the periosteum inside the lateral rim; canthopexy likewise; distraction 9 mm with laxity (Beigi 2008: 7.5–11),
//      ≤ 6 mm after the strip is shortened and fixed (Pushker 2025: > 6–8 mm is significant)
{ const X = CANTHUS, inner = X.draw({ state: {} }).inner, onWall = p => Math.min(...inner.map(q => dist(p, q)));
  for (const [n, st] of [['strip', { lax: 1, canthotomy: 1, cantholysis: 1, strip: 1, stripFix: 1 }], ['canthopexy', { canthopexy: 1 }]]) { const A = X.draw({ state: st }).A, P = A.stripFix || A.canthopexy;
    ok(onWall(P) < LID.PERI + 0.3 && P[1] > X.RIM_E[1] + 0.8 && P[0] > X.RIM_E[0], `${n}: fixed ${f2(onWall(P))} mm from the orbital wall, ${f2(P[1] - X.RIM_E[1])} mm behind the rim edge (inside the rim)`); }
  const Dn = X.state({}).D, Dl = X.state({ lax: 1 }).D, Df = X.state({ lax: 1, stripFix: 1 }).D;
  ok(Dn < 6 && Dl >= 7.5 && Dl <= 11 && Df <= 6, `distraction: normal ${f2(Dn)}, lax ${f2(Dl)} (Beigi 2008: 7.5–11), after LTS ${f2(Df)} mm (≤ 6, Pushker 2025)`);
  const T = X.draw({ state: { lax: 1, distract: 1 } }); ok(T.lidPts.every(p => tg([p[1], p[0]]) >= -0.05), 'distracted lid never inside the globe (axial)'); }
// L16. misdirected and metaplastic lower lashes reach the cornea
{ const A = LOWER.draw({ state: { misdirected: 1, metaplastic: 1 } }).A, endM = A.misLashPts[3];
  ok(tg(endM) < 0.4 && tg(A.metaLashL) < 0.4, `misdirected / metaplastic lower lashes end ${f2(tg(endM))} / ${f2(tg(A.metaLashL))} mm from the cornea`); }
// L17. the combined view starts with the unchanged upper-lid drawing; no NaN / undefined in any new state, all views
{ const all = { entr: 1, dehis: 1, override: 1, scar: 1, subcil: 1, plane: 1, septOpen: 1, retrOpen: 1, frac: 1, mattress: 1, tie: 1, skinClose: 1, hotzExc: 1, hotzFat: 1, hotzFix: 1, misdirected: 1, metaplastic: 1, needle: 1, treated: 1, pluck: 1,
    canthotomy: 1, cantholysis: 1, strip: 1, stripFix: 1, canthopexy: 1, lts: 1, lstrips: [[-5, 1, 3]] };
  ok(LOWER.draw({ state: {}, upper: { curl: 1 } }).svg.startsWith(LID.draw({ state: { curl: 1 }, id: 'lowu' }).svg), 'combined view starts with the unchanged upper-lid drawing');
  for (const st of [all, { ...all, tie: 0.5, entr: 0.5, mattress: 0.4 }, { entr: 0.3, subcil: 0.5, frac: 0.5, hotzExc: 0.4 }, { follicleDepth: 1.8, needle: 0.5 }])
    ok(!/NaN|undefined/.test(LOWER.draw({ state: st }).svg + CORONAL.draw({ lower: st }).svg + CANTHUS.draw({ state: { ...st, lax: 1, distract: 0.6 } }).svg), `lower-lid states (${Object.keys(st).length} keys): no NaN/undefined in sagittal, coronal, axial`); }
// ---------------------------------------------------------------- margin laceration repair (laceration.js; 2026-11-06, fifth video)
{ const LAC = global.LAC = require('./laceration.js'), near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const cor = st => CORONAL.draw({ state: st, id: 'lc', section: false });
  // LAC1. a laceration state of 0 changes nothing (every older drawing is byte-for-byte the same)
  ok(cor({ lac: 0, lacPout: 0, lacStep: 0 }).svg === cor({}).svg, 'LAC1 lac = 0 draws exactly the intact lid');
  { const s = cor({}).svg; ok(!s.includes('#a5474a') && !s.includes('height="23"') && !s.includes('_m1)"/>'), 'LAC1 the intact lid has no laceration elements (no gap, no wound edges, original globe backdrop)'); }
  // LAC2. the gap: lacGap (2.4 mm, schematic) at the margin when open, 0 when closed, and the slit closes at the apex
  { const o = cor({ lac: 1 }).A, c = cor({ lac: 0, lacPout: 0.3 }).A, W = CORONAL.lacWarp({ lac: 1 });
    ok(near(o.lacEdgeN[0] - o.lacEdgeT[0], 2.4 + 0.008), `LAC2 open gap at the margin ${(o.lacEdgeN[0] - o.lacEdgeT[0]).toFixed(3)} mm = 2.4`);
    ok(near(c.lacEdgeN[0] - c.lacEdgeT[0], 0.008), 'LAC2 closed: the two edges meet');
    const ap = [0, CORONAL.Uy(0) - (UF.at(0, 0)[1] - UF.at(6, 0)[1])], d = W([ap[0] + 0.004, ap[1]])[0] - W([ap[0] - 0.004, ap[1]])[0];   // the apex in tissue coordinates
    ok(d < 0.02, `LAC2 the gap closes at the apex (${d.toFixed(3)} mm)`); }
  // LAC3. gray line silk 2 mm from the wound edge on either side (EyeWiki), in the margin view and in the coronal view
  { const st = { lac: 0, lacGrey: 1, lacGreyTie: 1 }, m = LAC.margin({ state: st }).A, r = cor(st), c = LAC.cor(r, { state: st }).A;
    ok(near(m.edgeT[0] - m.greyT[0], 2.0 - 0.004) && near(m.greyN[0] - m.edgeN[0], 2.0 - 0.004), `LAC3 gray line suture 2 mm from each wound edge (margin view ${(m.edgeT[0] - m.greyT[0] + 0.004).toFixed(2)})`);
    ok(near(m.greyT[1], -LID.U_GREY), 'LAC3 the gray line suture is at the gray line depth'); }
  // LAC4. the two synced views agree: the same stitch lands at the same x (< 0.3 mm), open and closed, for gray line and lash line sutures
  for (const lac of [1, 0.4, 0]) { const st = { lac, lacGrey: 1, lacLash: 1 }, m = LAC.margin({ state: st }).A, c = LAC.cor(cor(st), { state: st }).A, mo = cor(st).A;
    const worst = Math.max(...['greyT', 'greyN', 'lashT', 'lashN'].map(k => Math.abs(m[k][0] - c[k][0])), mo.lacEdgeT ? Math.abs(m.edgeT[0] - mo.lacEdgeT[0]) : 0);
    ok(worst < 0.3, `LAC4 lac ${lac}: margin view and coronal view agree within ${worst.toFixed(3)} mm`); }
  // LAC5. tarsal sutures: 3 upper, 2 lower (EyeWiki); all inside the wound (below its apex)
  ok(LAC.TAR.upper.length === 3 && LAC.TAR.lower.length === 2, 'LAC5 tarsal sutures: upper 3, lower 2 (EyeWiki)');
  ok(Math.max(...LAC.TAR.upper) < 6, 'LAC5 every upper tarsal suture lies below the apex of the 6 mm wound');
  // LAC6. partial thickness, anterior part of the tarsus (EyeRounds): ≥ 0.3 mm from the conjunctival side and from the anterior surface
  ok(LAC.TAR_U - LID.U_CONJ >= 0.3 && LID.U_TAR - LAC.TAR_U >= 0.3 && LAC.TAR_U > (LID.U_CONJ + LID.U_TAR) / 2,
    `LAC6 tarsal bite at u ${LAC.TAR_U}: ${(LAC.TAR_U - LID.U_CONJ).toFixed(2)} mm from the conjunctiva, ${(LID.U_TAR - LAC.TAR_U).toFixed(2)} mm from the anterior tarsal surface, in the anterior half`);
  // LAC7. pout / notch / step move the margin at the wound by exactly the parameter; lacAP shifts the nasal side in the margin view
  { const base = cor({}).Uy(0), y = st => cor(st).A.lacEdgeT[1];
    ok(near(y({ lacPout: 0.3 }) - base, 0.3), `LAC7 everted (pout 0.3): margin ${(y({ lacPout: 0.3 }) - base).toFixed(3)} mm lower`);
    ok(near(y({ lacPout: -0.5 }) - base, -0.5), `LAC7 notch (−0.5): margin ${(y({ lacPout: -0.5 }) - base).toFixed(3)} mm higher`);
    const s = cor({ lac: 1, lacStep: 0.6 }).A; ok(near(s.lacEdgeT[1] - s.lacEdgeN[1], 0.6), 'LAC7 step 0.6: nasal edge 0.6 mm higher');
    const m = LAC.margin({ state: { lac: 1, lacAP: 0.4 } }).A; ok(near(m.edgeT[1] - m.edgeN[1], 0.4), 'LAC7 lacAP 0.4: nasal gray line 0.4 mm more anterior'); }
  // LAC8. silk tails buried under the lowest skin suture point up, away from the cornea (EyeWiki)
  { const st = { lac: 0, lacGrey: 1, lacGreyTie: 1, lacLash: 1, lacLashTie: 1, lacSkin: 1, lacTails: 1 }, r = cor(st), c = LAC.cor(r, { state: st }).A;
    ok(c.tailKnot[1] < r.Uy(0) - 1, `LAC8 tails end ${(r.Uy(0) - c.tailKnot[1]).toFixed(2)} mm above the margin, away from the cornea`); }
  // LAC9. margin face, posterior → anterior: posterior edge, MCJ, meibomian orifices, gray line, lashes, anterior edge
  { const u = LAC.U; ok(0 < u.mcj && u.mcj < u.orif && u.orif < u.grey && u.grey < u.lash && u.lash < u.skin, 'LAC9 margin landmarks in order: MCJ < orifices < gray line < lashes < anterior edge'); }
  // LAC10. no NaN / undefined in any laceration state, all three views
  for (const st of [{ lac: 1 }, { lac: 0.5, lacGrey: 1, lacTar: 0.67, lacWin: [-3, 3] }, { lac: 0, lacPout: 0.3, lacGrey: 1, lacGreyTie: 1, lacTar: 1, lacLash: 1, lacLashTie: 1, lacSkin: 1, lacTails: 1 },
    { lac: 1, lacVM: 1 }, { lac: 0, lacVM: 1, lacVMTie: 1 }, { lac: 1, lacAP: 0.4, lacStep: 0.6, lacGrey: 1 }, { lacPout: -0.5 }]) {
    const r = cor(st), s = r.svg + LAC.cor(r, { state: st }).svg + LAC.margin({ state: st }).svg + LAC.sag({ state: st }).svg + LAC.sag({ state: st, lid: 'lower' }).svg;
    ok(!/NaN|undefined/.test(s), `LAC10 no NaN / undefined: ${JSON.stringify(st).slice(0, 60)}`); }
  // LAC11. a tarsal suture in the coronal view sits at the height of the same suture on the wound face (< 0.3 mm)
  { const st = { lac: 0.4, lacTar: 1, lacWin: [-3, 3] }, c = LAC.cor(cor(st), { state: st }).A, s = LAC.sag({ state: st }).A;
    const worst = Math.max(...[0, 1, 2].map(i => Math.abs(c['tar' + i][1] - s['tar' + i][1])));
    ok(worst < 0.3, `LAC11 tarsal sutures: coronal and wound-face heights agree within ${worst.toFixed(3)} mm`); }
}
console.log(fail ? `${fail} check(s) failed` : 'all checks passed');
process.exit(fail ? 1 : 0);
