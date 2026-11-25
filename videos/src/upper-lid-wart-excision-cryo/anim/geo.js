// Geometry of what the eyelid model (videos/models/eyelid) does not have — the lesion, the excision line and wound, the local
// anaesthetic needle, the eye shield, the cryoprobe and the ice ball — built on the model at rest (MRD1 4, the model default), the
// same construction as ../print/video.js. Used by draw.js (the video) and ../check.js (narration ↔ model), so what is drawn is what is
// checked. Sizes come from params.js WART (all 示意).
// Where the video differs from the print sheets (all 示意): the ice ball stays inside the lid (sagittal: clipped to the lid between the
// skin and the posterior lid surface; surgeon's view: stops at the posterior lid margin), because the narration says the probe and the
// ice ball must not touch the globe's conjunctiva or cornea; the local anaesthetic needle enters the skin just below the lesion and runs
// under it (on the sheets it comes from above and crosses the lesion), and the surgeon's view shows the same needle projected (x = 0).
function makeGeo(W, opt = {}) {   // opt.noClip: the ice ball not kept inside the lid (only ../check.js --selftest uses it)
  const R0 = LID.draw({ variant: 'asian', state: {}, id: 'wg0' }), C0 = CORONAL.draw({ variant: 'asian', state: {}, id: 'wg1', windows: [], section: false });
  const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const S = (q, d = 0) => R0.skinAt(q, d);                             // skin point q mm along the skin, d mm deep (model mm)
  const tan = q => unit([S(q + 0.15)[0] - S(q - 0.15)[0], S(q + 0.15)[1] - S(q - 0.15)[1]]);
  const nrm = q => { const t = tan(q); let n = [t[1], -t[0]]; if (n[0] > 0) n = [-n[0], -n[1]]; return n; };   // outward (anterior)
  const qL = R0.qOf(R0.A.lashSkin), qc = qL + W.dq, qcM = qL + W.dqM;   // lash line; centres of the skin-surface and the margin lesion
  // the globe surface (lid.js gp: the globe point at a polar angle) and the eye shield (示意: a band 0.3 mm off the globe under the lid)
  const toGlobe = p => Math.hypot(p[0], p[1]) - Math.hypot(...LID.gp(Math.atan2(p[1], p[0])));
  // the lid in this section: the skin from the margin face (q 0) up, then the posterior lid surface back down to the posterior margin
  const LIDP = (() => { const P = []; for (let q = 0; q <= qL + 7 + 1e-9; q += 0.05) P.push(S(q)); for (let s = 9.5; s >= -1e-9; s -= 0.05) P.push(R0.DP.at(Math.max(0, s), 0)); return P; })();
  const inLid = p => { let c = false; for (let i = 0, j = LIDP.length - 1; i < LIDP.length; j = i++) { const a = LIDP[i], b = LIDP[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const onLid = p => { let best = null, bd = 1e9; for (let i = 0, j = LIDP.length - 1; i < LIDP.length; j = i++) { const a = LIDP[j], b = LIDP[i], ab = [b[0] - a[0], b[1] - a[1]], L2 = ab[0] ** 2 + ab[1] ** 2 || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / L2)), c = [a[0] + ab[0] * t, a[1] + ab[1] * t], d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < bd) { bd = d; best = c; } } return best; };
  const hold = p => opt.noClip || inLid(p) ? p : onLid(p);                           // a point of the ice ball outside the lid goes to the lid's surface
  const shield = (() => { const P = []; for (let d = 192; d >= 136; d -= 2) {   // the sheets stop at 146°; here it reaches further under the lid, behind the deep part of the skin-surface ice ball
    const p = LID.gp(-d * Math.PI / 180), l = Math.hypot(p[0], p[1]); P.push([p[0] * (l + 0.3) / l, p[1] * (l + 0.3) / l]); } return P; })();
  // a lesion growing from the skin between qc ± w/2: papillary dome outward, base in the epidermis (0.1 mm)
  function lesion(q0, w, h) { const P = [], N = 48;
    for (let i = 0; i <= N; i++) { const u = -1 + 2 * i / N, q = q0 + u * w / 2, k = h * Math.sqrt(Math.max(0, 1 - u * u)) * (0.86 + 0.14 * Math.cos(u * 11)); P.push(add(S(q), nrm(q), k)); }
    for (let i = N; i >= 0; i--) P.push(S(q0 + (-1 + 2 * i / N) * w / 2, 0.1));
    return P; }
  const cutA = qc - W.w / 2 - W.margin, cutB = qc + W.w / 2 + W.margin;
  // excision: down to dEx, along the skin under the lesion, back up — kept 0.06 mm above the orbicularis where the subcutis is thinner
  // than dEx (the lower end of the cut: 0.23 mm; the sheets keep dEx everywhere)
  const SUBQ = R0.probe.subqB, orbD = q => { const b = SUBQ[Math.max(0, Math.min(SUBQ.length - 1, Math.round(q / 0.05)))], s = S(q); return Math.hypot(b[0] - s[0], b[1] - s[1]); };
  const cutD = q => Math.min(W.dEx, orbD(q) - 0.06);
  const cut = (() => { const P = [S(cutA)]; for (let q = cutA; q <= cutB + 1e-9; q += 0.1) P.push(S(q, cutD(q))); P.push(S(cutB)); return P; })();
  // the wound left after the excision (from just outside the skin down to the cut)
  const wound = (() => { const P = [], Q = []; for (let q = cutA; q <= cutB + 1e-9; q += 0.1) { P.push(add(S(q), nrm(q), 0.12)); Q.push(S(q, cutD(q))); } return [...P, ...Q.reverse()]; })();
  // the ice ball: a circle of radius r around the probe tip (skin point q), kept inside the lid (the part outside the lid goes onto its
  // surface). The sheets draw a half disc on the skin tangent; at the rounded margin that leaves out tissue next to the tip.
  const dome = (q, r) => { const c = S(q), P = []; for (let i = 0; i < 96; i++) { const f = 2 * Math.PI * i / 96; P.push([c[0] + r * Math.cos(f), c[1] + r * Math.sin(f)]); } return P.map(hold); };
  // the cryoprobe: a rod along the outward normal, its tip `lift` mm off the skin at q
  const probe = (q, len = 7, wd = 1.1, lift = 0) => { const c = add(S(q), nrm(q), lift), n = nrm(q), t = tan(q), e = add(c, n, len); return [add(c, t, wd / 2), add(e, t, wd / 2), add(e, t, -wd / 2), add(c, t, -wd / 2)]; };
  // local anaesthetic needle (straight): tip in the subcutaneous tissue under the lesion, entering the skin just below the lesion (from the
  // lash side: above the lesion the skin of this model folds forward, so a needle from above would pass back into the lid)
  const nTip = S(qc - 0.3, 0.3), nEntry = S(qc - W.w / 2 - 0.2), nDir = unit([nEntry[0] - nTip[0], nEntry[1] - nTip[1]]), needle = [add(nEntry, nDir, 3.5), nTip], needleEntry = nEntry;
  const NOUT = 3.5 / (3.5 + Math.hypot(nEntry[0] - nTip[0], nEntry[1] - nTip[1]));   // share of the needle's path outside the skin
  // the upper-lid lash follicle of this section (lid.js: lash exit E on the rounded anterior margin, bulb B), as the levator-rotation video
  const marginS = u => u < 1.58 ? 0 : 0.44 - Math.sqrt(Math.max(0, 0.44 ** 2 - (u - 1.58) ** 2));
  const E = R0.DA.at(marginS(1.70), 1.70), B = R0.DA.at(2.05, 1.56), FL = Math.hypot(B[0] - E[0], B[1] - E[1]), Fd = [(B[0] - E[0]) / FL, (B[1] - E[1]) / FL];
  // surgeon's view: the lesion at x = 0 (the section runs through the pupil centre), its height above the lash line from the section
  const lashY0 = C0.lashY(0), dy = q => S(q)[1] - S(qL)[1], toCor = p => [0, lashY0 + p[1] - S(qL)[1]];
  const COR = { toCor, c: [0, lashY0 + dy(qc)], r: Math.abs(dy(qc + W.w / 2) - dy(qc - W.w / 2)) / 2, cM: [0, lashY0 + dy(qcM)], rM: W.wM / 2,
    blob: (c, r) => { const P = []; for (let i = 0; i < 60; i++) { const f = 2 * Math.PI * i / 60, k = r * (1 + 0.1 * Math.cos(7 * f)); P.push([c[0] + k * Math.cos(f), c[1] + k * Math.sin(f)]); } return P; },
    circ: (c, r) => { const P = []; for (let i = 0; i <= 72; i++) { const f = 2 * Math.PI * i / 72; P.push([c[0] + r * Math.cos(f), c[1] + r * Math.sin(f)]); } return P; },
    // the ice ball seen from the front stops at the posterior lid margin (the shield is behind the lid)
    hold: P => P.map(p => [p[0], Math.min(p[1], C0.Uy(p[0]))]) };
  return { R0, C0, S, tan, nrm, add, qL, qc, qcM, toGlobe, LIDP, inLid, onLid, hold, shield, cutA, cutB, cut, wound, dome, probe, needle, needleEntry, NOUT, orbD, cutD,
    lesion: lesion(qc, W.w, W.h), lesionM: lesion(qcM, W.wM, W.h * 0.8), F: { E, B, L: FL, d: Fd }, COR, W };
}
if (typeof module !== 'undefined') module.exports = { makeGeo };
