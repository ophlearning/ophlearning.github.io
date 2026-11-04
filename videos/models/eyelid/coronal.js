// ============================================================================
// Eyelid coronal (frontal-plane) model — right eye, examiner's view: temporal = left (−x), nasal = right (+x), superior = −y.
// Origin = corneal light reflex. Units mm. Heights of every upper-lid structure on the central line come from the sagittal
// model (LID) projected onto the frontal plane, so the two views always agree.
// Layers (deep → superficial): 0 globe / bone / deep orbit · 1 tarsus, Müller, levator · 2 aponeurosis, Whitnall · 3 fat pads ·
// 4 septum (+ pretarsal fat) · 5 orbicularis · 6 skin (+ subcutaneous fat, lashes, brow).
// Windows {poly, depth}: inside a window every layer shallower than `depth` is removed (layer-by-layer dissection / incisions).
// opt.state (skin-side view during PLTR): evert (−1 inturned … 0 normal … >0 everted), incision (0–1, dashed: it is on the
// conjunctival side), marks, spacing, sutures (0–1), tight (0–1). The incision height comes from the sagittal model (s = 3 mm).
// ============================================================================
const CORONAL = (() => {
  const { add, sub, unit, hyp, lerp, ss, hash, poly, F, NS } = LID;
  const psin = a => Math.max(0, Math.sin(a));
  function heights(variant) {               // central heights from the sagittal model (y of the projected point)
    const G = LID.geom(variant), UF = LID.UF;
    return { margin: UF.at(0, 0)[1], tarTop: UF.at(10, 0.6)[1], fus: LID.LEV.off(G.S_F, -0.07)[1], whit: LID.LEV.off(LID.S_J, 0)[1], arc: LID.ARCUS[1] };
  }
  // palpebral fissure (Asian adult, schematic): lateral canthus higher than medial
  const LC = [-15.0, -1.3], MC = [13.0, 0.9];
  const tq = x => (x - LC[0]) / (MC[0] - LC[0]);
  const baseY = x => lerp(LC[1], MC[1], tq(x));
  const Uy = x => baseY(x) - 3.885 * Math.pow(psin(Math.PI * tq(x)), 0.85) * (1 + 0.12 * (tq(x) - 0.5));   // U(0) = −4 (MRD1)
  const Ly = x => baseY(x) + 5.18 * Math.pow(psin(Math.PI * tq(x)), 1.1) * (1 - 0.15 * (tq(x) - 0.5));    // L(0) = +5 (MRD2)
  const xs = (a, b, st = 0.25) => { const r = []; for (let x = a; x < b; x += st) r.push(x); r.push(b); return r; };
  const FX = xs(LC[0], MC[0]);
  const fissure = () => [...FX.map(x => [x, Uy(x)]), ...FX.slice().reverse().map(x => [x, Ly(x)])];
  // lateral profile of a structure that sits d mm above the margin at the centre (tapers toward the canthi)
  const prof = (x, x0, x1, p = 0.6) => Math.pow(psin(Math.PI * (x - x0) / (x1 - x0)), p);
  const above = (x, d, x0, x1, p) => Uy(Math.max(LC[0], Math.min(MC[0], x))) + d * prof(x, x0, x1, p);
  const arcY = (h, x) => h + 0.016 * (x + 1) ** 2;                      // orbital rim / Whitnall: broad arch

  const C = { skin: '#efcfb6', skin2: '#e7bfa2', skinS: '#c99476', orb: '#c6646f', orbF: '#9b3a47', sept: '#ffffff', septS: '#b7ad99', fat: '#f6d778', fatL: '#f9e4a0',
    fatS: '#d6ad47', mfat: '#f7efd2', mfatS: '#d9cc9f', apo: '#f5f0e2', apoS: '#bfb08a', whit: '#ece4cf', mul: '#dda6aa', mulF: '#c27b84', mus: '#b9525f', musF: '#d9838e',
    tar: '#f5eacb', tarS: '#c3ad7c', gland: '#ecd28a', bone: '#eee3cb', boneS: '#b9a477', deep: '#9b6b5f', sclera: '#f7f4ef', lash: '#2b2019', brow: '#3a2b20', cut: '#7a4f45' };

  function draw(opt = {}) {
    const H = heights(opt.variant || 'asian'), o = [], A = {}, id = opt.id || 'cor', st = opt.state || {};
    const ev = st.evert || 0, inv = Math.max(0, -ev), out = Math.max(0, ev);
    const dT = H.tarTop - H.margin, dF = H.fus - H.margin;
    // ---------------- geometry of each structure (mm)
    const tarTopY = x => above(x, dT, -13.6, 10.6, 0.35);   // crescent: flat top, tapering ends
    const tarsus = [...xs(-13.6, 10.6).map(x => [x, Uy(x) - 0.15]), ...xs(-13.6, 10.6).reverse().map(x => [x, Math.min(Uy(x) - 0.15, tarTopY(x))])];
    const fusY = x => above(x, dF, -16.5, 13.5, 0.5);
    const whitY = x => arcY(H.whit, x), arcusY = x => arcY(H.arc, x);
    const rimTop = x => arcusY(x) - 4.2;
    const muller = [...xs(-9.8, 10.2).map(x => [x, tarTopY(x) + 0.1]), ...xs(-9.8, 10.2).reverse().map(x => [x, whitY(x) + 0.4])];
    const levator = [...xs(-10.5, 9.0).map(x => [x, whitY(x) + 0.6]), ...xs(-10.5, 9.0).reverse().map(x => [x, arcusY(x) + 0.05])]; // behind the rim: only the part inside the orbital opening shows
    const insY = x => Uy(x) - 2.3 * prof(x, -13.6, 10.6, 0.5) - 0.3;     // aponeurosis inserts on the lower anterior tarsus
    const apo = [...xs(-12.2, 10.2).map(x => [x, whitY(x) - 0.2]), [10.2, whitY(10.2) + 1.5], [12.6, -1.6], [11.6, -0.6], ...xs(-11.6, 10.0).reverse().map(x => [x, insY(x)]), [-15.4, -2.6], [-16.2, -3.8], [-12.2, whitY(-12.2) + 1.2]];
    const whit = [...xs(-15.5, 13.2).map(x => [x, whitY(x) - 0.55]), ...xs(-15.5, 13.2).reverse().map(x => [x, whitY(x) + 0.55])];
    const cfat = [...xs(-11.2, 7.4).map(x => [x, whitY(x) + 0.2]), ...xs(-11.2, 7.4).reverse().map(x => [x, fusY(x)])];
    const mfat = [...xs(7.4, 12.6).map(x => [x, whitY(x) + 0.9]), ...xs(7.4, 12.6).reverse().map(x => [x, Math.min(fusY(x), -3.2)])];
    const septum = [...xs(-17.5, 15.5).map(x => [x, arcusY(x)]), ...xs(-17.5, 15.5).reverse().map(x => [x, Math.min(fusY(x), Uy(Math.max(LC[0], Math.min(MC[0], x))) - 0.5)])];
    const ptfat = [...xs(-12.6, 10.2).map(x => [x, fusY(x)]), ...xs(-12.6, 10.2).reverse().map(x => [x, Uy(x) - 1.1])];
    const face = 'M-40 -40H40V30H-40Z' + poly(fissure());

    // ---------------- windows → per-layer masks
    const wins = opt.windows || [];
    const masks = [];
    for (let L = 1; L <= 6; L++) { const cut = wins.filter(w => w.depth < L).map(w => poly(w.poly)).join('');
      masks.push(`<mask id="${id}_m${L}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="80" height="70"><rect x="-40" y="-40" width="80" height="70" fill="#fff"/>${cut ? `<path d="${cut}" fill="#000"/>` : ''}</mask>`); }
    o.push(masks.join(''));
    const layer = (L, svg) => o.push(`<g mask="url(#${id}_m${L})">${svg}</g>`);

    // ---------------- layer 0: deep orbit, bone rim, globe
    const opening = [...xs(-19.5, 17.5).map(x => [x, arcusY(x)]), [17.5, 6], [-19.5, 6]];
    let s0 = `<rect x="-40" y="-40" width="80" height="70" fill="${C.bone}"/><path d="${poly(opening)}" fill="${C.deep}"/>`;
    s0 += `<path d="${poly(xs(-19.5, 17.5).map(x => [x, arcusY(x)]), false)}" fill="none" stroke="${C.boneS}" stroke-width="1.6" ${NS}/>`;
    for (let k = 0; k < 90; k++) { const x = lerp(-19, 17, hash(k, 21)), y = arcusY(x) - 0.4 - 4 * hash(21, k); s0 += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.08 + 0.1 * hash(k, 3)).toFixed(2)}" fill="#ddcfaa"/>`; }
    // globe in the fissure
    s0 += `<clipPath id="${id}_fis"><path d="${poly(fissure())}"/></clipPath><g clip-path="url(#${id}_fis)"><rect x="-20" y="-8" width="40" height="16" fill="${C.sclera}"/>
      <circle cx="0" cy="0" r="5.6" fill="url(#${id}_iris)"/><circle cx="0" cy="0" r="5.6" fill="none" stroke="#24150d" stroke-width="1.6" ${NS}/><circle cx="0" cy="0" r="2.0" fill="#0c0908"/>
      <ellipse cx="-0.9" cy="-1.2" rx="0.55" ry="0.45" fill="#fff" opacity="0.85"/>
      <path d="${poly([...FX.map(x => [x, Uy(x)]), ...FX.slice().reverse().map(x => [x, Uy(x) + 1.1])])}" fill="#000" opacity="0.13"/>
      <ellipse cx="11.6" cy="0.55" rx="1.25" ry="0.95" fill="#e48f95"/><path d="M10.25 -1.1 Q9.7 0.5 10.3 2.0" fill="none" stroke="#e7a3a6" stroke-width="1.6" ${NS}/></g>`;
    s0 += `<path d="${poly(fissure())}" fill="none" stroke="#9b6450" stroke-width="1.2" ${NS}/>`;
    o.push(s0); // layer 0 is never removed

    // ---------------- layer 1: tarsus (meibomian glands seen through), Müller, levator
    let s1 = `<path d="${poly(levator)}" fill="${C.mus}"/>`;
    for (let x = -9.5; x < 8.8; x += 0.9) s1 += `<path d="M${F([x, arcusY(x) + 0.15])}L${F([x * 0.98, whitY(x) + 0.5])}" stroke="${C.musF}" stroke-width="0.8" ${NS}/>`;
    s1 += `<path d="${poly(muller)}" fill="${C.mul}"/>`;
    for (let x = -9.2; x < 8.8; x += 0.7) s1 += `<path d="M${F([x, tarTopY(x) - 0.2])}L${F([x * 0.97, whitY(x) + 0.6])}" stroke="${C.mulF}" stroke-width="0.7" ${NS}/>`;
    s1 += `<path d="${poly(tarsus)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="1" ${NS}/>`;
    for (let x = -12.6; x < 10; x += 0.85) { const t = tarTopY(x), u = Uy(x) - 0.2; if (u - t < 0.8) continue; s1 += `<path d="M${F([x, u])}L${F([x, t + 0.35])}" stroke="${C.gland}" stroke-width="2.2" stroke-linecap="round" ${NS} opacity="0.7"/>`; }
    layer(1, s1);
    A.tarsus = [7.6, (tarTopY(7.6) + Uy(7.6)) / 2]; A.muller = [7.2, (tarTopY(7.2) + whitY(7.2)) / 2];

    // ---------------- layer 2: levator aponeurosis (fan, horns) + Whitnall ligament
    let s2 = `<path d="${poly(apo)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.8" ${NS}/>`;
    for (let x = -11; x < 9.6; x += 0.8) s2 += `<path d="M${F([x * 0.9, whitY(x) + 0.4])}L${F([x, insY(x) - 0.2])}" stroke="${C.apoS}" stroke-width="0.6" ${NS} opacity="0.75"/>`;
    s2 += `<path d="${poly(whit)}" fill="${C.whit}" stroke="${C.apoS}" stroke-width="0.8" ${NS}/>`;
    layer(2, s2);
    A.apo = [3.6, (whitY(3.6) + insY(3.6)) / 2 + 1.0]; A.whit = [4.4, whitY(4.4)];

    // ---------------- layer 3: preaponeurotic (central) fat pad + medial fat pad
    let s3 = `<path d="${poly(cfat)}" fill="${C.fat}"/><clipPath id="${id}_cf"><path d="${poly(cfat)}"/></clipPath><g clip-path="url(#${id}_cf)">`;
    let j = 0; for (let y = -18; y < -3; y += 0.78, j++) for (let x = -11.5 + (j % 2) * 0.45, i = 0; x < 7.6; x += 0.9, i++) s3 += `<ellipse cx="${(x + (hash(i, j) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" rx="${(0.32 + 0.14 * hash(j, i)).toFixed(2)}" ry="0.3" fill="${C.fatL}" stroke="${C.fatS}" stroke-width="0.6" ${NS}/>`;
    s3 += `</g><path d="${poly(mfat)}" fill="${C.mfat}" stroke="${C.mfatS}" stroke-width="0.6" ${NS}/>`;
    layer(3, s3);
    A.fat = [-1.8, (whitY(-1.8) + fusY(-1.8)) / 2];

    // ---------------- layer 4: orbital septum (thin, translucent) + pretarsal fat below the fusion line
    let s4 = `<path d="${poly(septum)}" fill="${C.sept}" fill-opacity="0.42" stroke="${C.septS}" stroke-width="0.8" ${NS}/>`;
    for (let y = -17; y < -5; y += 0.9) s4 += `<path d="M-17 ${y}Q0 ${y - 1.2} 15 ${y}" fill="none" stroke="#fff" stroke-width="0.6" opacity="0.5" ${NS}/>`;
    s4 = `<clipPath id="${id}_sp"><path d="${poly(septum)}"/></clipPath><g>${s4.replace(/<path d="M-17/g, `<path clip-path="url(#${id}_sp)" d="M-17`)}</g>`;
    s4 += `<path d="${poly(ptfat)}" fill="#f6e4bf"/><clipPath id="${id}_pt"><path d="${poly(ptfat)}"/></clipPath><g clip-path="url(#${id}_pt)">`;
    j = 0; for (let y = -12; y < -2; y += 0.5, j++) for (let x = -12.6 + (j % 2) * 0.3, i = 0; x < 10.2; x += 0.6, i++) s4 += `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="0.24" ry="0.2" fill="#f9ecd0" stroke="#e2c58c" stroke-width="0.5" ${NS}/>`;
    s4 += `</g><path d="${poly(xs(-16.5, 13.5).map(x => [x, fusY(x)]), false)}" fill="none" stroke="#0e7c6b" stroke-width="1.6" stroke-dasharray="4 3" ${NS}/>`;
    layer(4, s4);
    A.septum = [-2.4, arcusY(-2.4) + 1.6]; A.fusion = [-1.0, fusY(-1.0)]; A.ptfat = [-2.2, (fusY(-2.2) + Uy(-2.2) - 1.1) / 2]; A.rim = [2.0, rimTop(2) + 1.6];

    // ---------------- layer 5: orbicularis oculi (fibres concentric around the fissure)
    const orbR = [...Array(73)].map((_, k) => { const a = k / 72 * Math.PI * 2; return [-1 + 25 * Math.cos(a), 0.4 + 23 * Math.sin(a)]; });
    let s5 = `<path d="${poly(orbR)}${poly(fissure())}" fill="${C.orb}" fill-rule="evenodd"/>`;
    for (let k = 1; k < 26; k++) { const rx = 14.6 + k * 0.82, ry = 4.6 + k * 0.82 + (k < 6 ? -0.4 : 0);
      s5 += `<ellipse cx="-1" cy="${(0.35 - 0.02 * k).toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="none" stroke="${C.orbF}" stroke-width="0.7" opacity="0.55" ${NS}/>`; }
    layer(5, `<clipPath id="${id}_or"><path d="${poly(orbR)}${poly(fissure())}" clip-rule="evenodd"/></clipPath><g clip-path="url(#${id}_or)">${s5}</g>`);
    A.orb = [-7.4, -11.5];

    // ---------------- layer 6: skin (Asian single eyelid: no crease), epicanthal fold, lashes, brow
    let s6 = `<path d="${face}" fill="url(#${id}_skin)" fill-rule="evenodd"/>`;
    s6 += `<path d="${poly(xs(-13.5, 11).map(x => [x, Uy(x) - 0.75 - 0.3 * prof(x, -13.5, 11)]), false)}" fill="none" stroke="${C.skinS}" stroke-width="1.2" opacity="0.45" ${NS}/>`;
    // lashes: upper (up and outward), lower (down)
    if (out > 0) s6 += `<path d="${poly([...FX.map(x => [x, Uy(x) - 0.05]), ...FX.slice().reverse().map(x => [x, Uy(x) + 0.75 * out * prof(x, LC[0], MC[0], 0.6)])])}" fill="#d98a8f"/>`;
    if (inv > 0) s6 += `<path d="${poly([...FX.map(x => [x, Uy(x) - 0.05]), ...FX.slice().reverse().map(x => [x, Uy(x) + 0.45 * inv * prof(x, LC[0], MC[0], 0.6)])])}" fill="${C.skin2}"/>`;
    for (let x = LC[0] + 1.6, k = 0; x < MC[0] - 3.4; x += 0.3, k++) { const y = Uy(x) + 0.45 * inv * prof(x, LC[0], MC[0], 0.6), lean = x / 14, l0 = 2.2 + 1.4 * prof(x, LC[0], MC[0], 0.8) * (0.8 + 0.4 * hash(k, 1));
      const dy = lerp(-1, 0.75, inv) - 0.12 * out, l = l0 * (1 - 0.25 * inv);
      s6 += `<path d="M${F([x, y + 0.1])}Q${F([x + lean * 0.4, y + dy * l * 0.55])} ${F([x + lean * (1.2 + 0.5 * out), y + dy * l])}" fill="none" stroke="${C.lash}" stroke-width="0.07" stroke-linecap="round"/>`; }
    for (let x = LC[0] + 2.5, k = 0; x < MC[0] - 4; x += 0.55, k++) { const y = Ly(x), lean = x / 14, l = 1.1 + 0.8 * prof(x, LC[0], MC[0]) * (0.7 + 0.5 * hash(k, 2));
      s6 += `<path d="M${F([x, y - 0.1])}Q${F([x + lean * 0.2, y + l * 0.6])} ${F([x + lean * 0.7, y + l])}" fill="none" stroke="${C.lash}" stroke-width="0.055" stroke-linecap="round"/>`; }
    // epicanthal fold (mild): skin crescent from the upper lid over the medial canthus
    const epi = [[8.3, -3.6], [10.6, -2.6], [12.0, -1.0], [12.45, 0.9], [11.8, 2.7], [10.8, 3.6], [11.9, 3.8], [13.4, 2.4], [13.9, 0.4], [13.3, -1.8], [11.6, -3.6], [9.4, -4.5]];
    const epiP = LID.spline(epi, 0.08);
    s6 += `<path d="${poly(epiP)}" fill="${C.skin2}"/><path d="${poly(LID.spline(epi.slice(0, 6), 0.08), false)}" fill="none" stroke="${C.skinS}" stroke-width="1.3" ${NS}/>`;
    // brow
    for (let k = 0; k < 260; k++) { const x = lerp(-18, 11.5, hash(k, 9)), w = 0.5 + 0.5 * prof(x, -19, 12.5, 0.5), yb = H.arc - 5.0 + 0.006 * (x + 2) ** 2 + (hash(k, 4) - 0.5) * 1.6 * w;
      const ang = x > 7 ? -1.35 : x > 2 ? -0.75 : -0.22 - 0.1 * hash(k, 6), len = 0.9 + 0.6 * hash(k, 7);
      s6 += `<path d="M${F([x, yb])}l${(-Math.cos(ang) * len).toFixed(2)} ${(Math.sin(ang) * len).toFixed(2)}" stroke="${C.brow}" stroke-width="0.045" opacity="${(0.4 + 0.35 * w).toFixed(2)}" stroke-linecap="round"/>`; }
    layer(6, s6);
    A.epi = [12.6, 0.4]; A.skin = [-13.0, -9.0]; A.lc = LC;

    // ---------------- PLTR overlays (skin-side view)
    const dCut = LID.UF.at(LID.S_CUT, 0)[1] - LID.UF.at(0, 0)[1];               // incision height above the margin, from the sagittal model
    const cutY = x => Uy(x) + dCut * prof(x, -13.6, 10.6, 0.35);
    if (st.incision) { const xsI = xs(-12.4, 9.8, 0.2), n = Math.max(2, Math.round(xsI.length * Math.min(1, st.incision)));
      o.push(`<path d="${poly(xsI.slice(0, n).map(x => [x, cutY(x)]), false)}" fill="none" stroke="#d23c3c" stroke-width="2" stroke-dasharray="7 5" ${NS} opacity="0.85"/>`); }
    A.incision = [6.5, cutY(6.5)];
    const SX = [-8.0, 0.5, 9.0];
    if (st.marks) for (const x of SX) o.push(`<circle cx="${x}" cy="${(Uy(x) - 1.0).toFixed(2)}" r="0.32" fill="#5b3fa0" opacity="${st.marks}"/>`);
    if (st.spacing) { const y = Uy(0.5) - 4.2; o.push(`<g opacity="${st.spacing}" stroke="#0e7c6b" fill="none"><path d="M${SX[0]} ${y}H${SX[2]}" stroke-width="1.8" ${NS}/>${SX.map(x => `<path d="M${x} ${y - 0.5}v1" stroke-width="1.8" ${NS}/>`).join('')}</g>`); A.spacing = [SX[1], Uy(0.5) - 4.2]; }
    if (st.sutures) { const t = st.tight || 0, op = Math.min(1, st.sutures);
      for (const x of SX) { const E = [x, Uy(x) - 0.75 + 0.25 * t], w = lerp(0.95, 0.38, t);
        for (const sg of [-1, 1]) o.push(`<path d="M${F([x + sg * w, cutY(x) - 0.35])}L${F([x + sg * w * 0.45, E[1]])}" stroke="#2463eb" stroke-width="1.6" stroke-dasharray="4 3" ${NS} opacity="${op}"/>`);
        o.push(`<path d="M${F([x - w * 0.45, E[1]])}L${F([x + w * 0.45, E[1]])}" stroke="#2463eb" stroke-width="2.4" stroke-linecap="round" ${NS} opacity="${op}"/><circle cx="${x}" cy="${E[1].toFixed(2)}" r="${(0.2 + 0.12 * t).toFixed(2)}" fill="#2463eb" opacity="${op}"/>`);
        if (t > 0.5) for (const sg of [-1, 1]) o.push(`<path d="M${F(E)}l${(sg * 0.5).toFixed(2)} ${(-0.7).toFixed(2)}" stroke="#2463eb" stroke-width="1.8" stroke-linecap="round" ${NS} opacity="${(op * ss(0.5, 0.9, t)).toFixed(2)}"/>`); }
      A.suture = [SX[0], Uy(SX[0]) - 1.2]; }
    A.margin = [-4, Uy(-4)]; A.lashes = [-10.5, Uy(-10.5) - 1.6];

    // ---------------- cut edges of the windows
    for (const w of wins) o.push(`<path d="${poly(w.poly)}" fill="none" stroke="${C.cut}" stroke-width="1.1" ${NS} opacity="0.7"/>`);
    // sagittal plane marker
    if (opt.section !== false) o.push(`<path d="M0 ${(H.arc - 5).toFixed(2)}V7" stroke="#0e7c6b" stroke-width="1.4" stroke-dasharray="6 4" ${NS}/>`);
    A.section = [0, H.arc - 4.6];
    const defs = `<defs><radialGradient id="${id}_iris" cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stop-color="#2a170d"/><stop offset="0.75" stop-color="#4a2a17"/><stop offset="1" stop-color="#2a170d"/></radialGradient>
      <radialGradient id="${id}_skin" gradientUnits="userSpaceOnUse" cx="-1" cy="-6" r="26"><stop offset="0" stop-color="#f3d8c2"/><stop offset="0.7" stop-color="${C.skin}"/><stop offset="1" stop-color="#e2b597"/></radialGradient></defs>`;
    return { svg: defs + o.join(''), A, Uy, fusY, tarTopY, whitY, arcusY, cutY };
  }
  // vertical strip windows across the upper lid, from the rim down to just above the lash line
  function strip(x0, x1, depth, top = -21.4) { const p = []; for (let x = x0; x <= x1 + 1e-9; x += 0.25) p.push([x, top]); for (let x = x1; x >= x0 - 1e-9; x -= 0.25) p.push([x, Uy(Math.max(LC[0], Math.min(MC[0], x))) - 0.75]); return { poly: p, depth }; }
  return { draw, strip, Uy, Ly, LC, MC };
})();
if (typeof module !== 'undefined') module.exports = CORONAL;
