// ============================================================================
// Lower eyelid in the coronal (skin-side) view — opt-in layers for CORONAL.draw({ lower: {...state} }). Right eye, examiner's view
// (temporal = left, −x). Every height on the central line comes from the lower-lid sagittal model (LOWER.keyPoints), projected,
// and tapers toward the canthi like the upper lid. CORONAL.draw calls LOWERC.build() only when opt.lower is given, so drawings
// without it are unchanged. Layers as in coronal.js: 0 bone / deep / conjunctiva · 1 tarsus, inferior tarsal muscle · 2 capsulopalpebral
// fascia · 3 fat pads, inferior oblique · 4 septum · 5 orbicularis · 6 skin, lashes.
// ============================================================================
const LOWERC = (() => {
  const { add, sub, unit, hyp, lerp, ss, hash, poly, F, NS } = LID;
  // lateral orbital rim (Hertel point) 21.07 mm temporal to the pupil centre: base 105.82 mm (Tsai 2006, Taiwanese adults) / 2 − 31.84
  // (half the interpupillary distance, Gao 2025); 13.91 mm behind the corneal apex (Tsai 2006). Lateral canthal tendon inserts on the
  // lateral orbital (Whitnall) tubercle 1.5 mm inside the rim (Gioia 1987).
  const LAT_RIM_X = -(105.82 / 2 - 31.84), HERTEL = 13.91;
  const BLUE = '#2463eb', RED = '#d23c3c', AMBER = '#b86e00';
  // inferior orbital margin seen from the front (schematic shape through the sagittal arcus height at x = 0)
  function rimLine(arcusY, LC) {
    const y0 = LOWER.ARC_L[1];
    return LID.spline([[-19.5, arcusY(-19.5)], [-20.6, -6.0], [LAT_RIM_X, LC[1]], [-20.5, 5.0], [-18.6, 10.2], [-13.5, 14.0], [-6.5, y0 - 0.25], [0, y0], [6.5, y0 - 0.4],
      [11.6, 13.4], [14.8, 9.0], [16.7, 3.0], [17.5, -3.0], [17.5, arcusY(17.5)]], 0.1);
  }
  const yAt = (P, x) => { let best = null; for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i]; if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) { const y = a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); if (y > 0 && (best === null || y > best)) best = y; } } return best; };

  function build(opt, X) {
    const st = Object.assign({}, opt.lower), { Uy, Ly, xs, prof, arcusY, id, C, LC, MC, face, fissure } = X, A = {}, L = ['', '', '', '', '', '', ''], wins = [];
    const K = LOWER.keyPoints(st), m = K.margin[1], d = p => p[1] - m;
    const below = (x, dd, x0 = -13.6, x1 = 10.6, p = 0.35) => Ly(Math.max(LC[0], Math.min(MC[0], x))) + dd * prof(x, x0, x1, p);
    const lashY = x => Ly(x) + d(K.lash) * prof(x, LC[0], MC[0], 0.6);          // anterior lid margin (lash line), rolls up with entropion
    const tarBotY = x => below(x, d(K.tarBot)), fusY = x => below(x, d(K.fusion), -16.5, 13.5, 0.5), fornixY = x => below(x, d(K.fornix), -16.5, 14.0, 0.5);
    const RIM = rimLine(arcusY, LC), rimY = x => yAt(RIM.filter(p => p[1] > 0), x) ?? Ly(x) + 9;
    const XT = xs(-13.6, 10.6), XW = xs(-12.4, 9.8, 0.2);
    // ---- surgical heights, all measured along the skin from the lash line in the sagittal model, projected
    const lineAt = dd => x => lashY(x) + (dd - d(K.lash)) * prof(x, -12.4, 9.8, 0.35);
    const incY = lineAt(d(K.inc)), exitY = lineAt(d(K.exit)), hLoY = lineAt(d(K.hotzLo)), hHiY = x => hLoY(x) + (d(K.hotzHi) - d(K.hotzLo)) * prof(x, -12.4, 9.8, 0.5);
    const fracY = x => below(x, d(K.frac)), cpfTopY = x => below(x, d(K.cpfTop)), fixY = x => below(x, d(K.hotzFixCPF));
    // ---- windows (each removes every layer shallower than its depth)
    const cut = (st.subcil || 0) >= 1 && !(st.skinClose >= 1);
    if (cut && st.plane > 0.05) { const dep = (st.retrOpen || 0) >= 1 ? 0 : (st.septOpen || 0) >= 1 ? 2 : 4;   // flap reflected down; deeper as the septum and retractors open
      wins.push({ poly: [...XW.map(x => [x, incY(x) + 0.05]), ...XW.slice().reverse().map(x => [x, incY(x) + (fornixY(x) - incY(x)) * 0.95 * st.plane])], depth: dep });
      if ((st.septOpen || 0) >= 1) wins.push({ poly: [...XW.map(x => [x, fusY(x) + 0.3]), ...XW.slice().reverse().map(x => [x, Math.min(rimY(x) - 0.8, fusY(x) + 5.5 * prof(x, -12.4, 9.8, 0.5))])], depth: 2 });
      A.flapL = [-6, incY(-6) + 1.2]; }
    // lstrips: [[x0, x1, depth], ...] vertical strips from just below the lash line to the rim (layer-by-layer anatomy, like CORONAL.strip)
    for (const [x0, x1, dep] of st.lstrips || []) { const SX = xs(x0, x1, 0.25); wins.push({ poly: [...SX.map(x => [x, lashY(Math.max(LC[0], Math.min(MC[0], x))) + 0.6]), ...SX.slice().reverse().map(x => [x, rimY(x) + 1.5])], depth: dep }); }
    const hz = st.hotzExc || 0;
    if (hz >= 0.5) wins.push({ poly: [...XW.map(x => [x, hLoY(x)]), ...XW.slice().reverse().map(x => [x, hHiY(x)])], depth: (st.hotzFat || st.hotzSept) ? 3 : 4 });
    // ---- layer 0: orbital opening down to the inferior and lateral rims, bone below; conjunctiva behind the lower lid down to the fornix
    const outside = `<clipPath id="${id}_Lout"><path d="${face}" clip-rule="evenodd"/></clipPath>`;
    let s0 = `${outside}<g clip-path="url(#${id}_Lout)"><path d="${poly(RIM)}" fill="${C.deep}"/>`;
    s0 += `<path d="${poly([...XT.map(x => [x, Ly(x) - 0.2]), ...XT.slice().reverse().map(x => [x, fornixY(x) + 0.4])])}" fill="#e9a0a7"/>`;
    s0 += `<path d="${poly(RIM, false)}" fill="none" stroke="${C.boneS}" stroke-width="1.6" ${NS}/>`;
    for (let k = 0; k < 70; k++) { const x = lerp(-19, 15, hash(k, 81)), y = rimY(x) + 0.5 + 3 * hash(81, k); s0 += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(0.08 + 0.1 * hash(k, 83)).toFixed(2)}" fill="#ddcfaa"/>`; }
    // lateral orbital (Whitnall) tubercle on the inner side of the lateral rim, at the canthal level (seen through the rim: dotted)
    const TUB = [LAT_RIM_X + 0.55, LC[1] + 0.3];
    s0 += `<circle cx="${TUB[0]}" cy="${TUB[1]}" r="0.55" fill="none" stroke="${C.boneS}" stroke-width="1.2" stroke-dasharray="2 2" ${NS}/></g>`;
    L[0] = s0; A.rimL = [-2, rimY(-2) + 1.2]; A.latRim = [LAT_RIM_X - 0.6, LC[1] + 4]; A.tubercle = TUB; A.conjL = [-6, (tarBotY(-6) + fornixY(-6)) / 2];
    // ---- layer 1: lower tarsus (meibomian glands seen through), inferior tarsal muscle below it
    const tarsus = [...XT.map(x => [x, Ly(x) + 0.15]), ...XT.slice().reverse().map(x => [x, Math.max(Ly(x) + 0.15, tarBotY(x))])];
    const XI = xs(-12.5, 10.2), itm = [...XI.map(x => [x, Math.max(cpfTopY(x), tarBotY(x)) + 1.2 * prof(x, -12.5, 10.2, 0.5)]), ...XI.slice().reverse().map(x => [x, fornixY(x)])];
    let s1 = `<path d="${poly(itm)}" fill="${C.mul}"/>`;
    for (let x = -11.8; x < 9.8; x += 0.7) s1 += `<path d="M${F([x, tarBotY(x) + 1.4 * prof(x, -12.5, 10.2, 0.5) + 0.1])}L${F([x * 0.97, fornixY(x) - 0.2])}" stroke="${C.mulF}" stroke-width="0.7" ${NS}/>`;
    s1 += `<path d="${poly(tarsus)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="1" ${NS}/>`;
    for (let x = -12.6; x < 10; x += 0.85) { const t = tarBotY(x), u = Ly(x) + 0.25; if (t - u < 0.8) continue; s1 += `<path d="M${F([x, u])}L${F([x, t - 0.3])}" stroke="${C.gland}" stroke-width="2.2" stroke-linecap="round" ${NS} opacity="0.7"/>`; }
    L[1] = s1; A.tarsusL = [6.5, (Ly(6.5) + tarBotY(6.5)) / 2]; A.itmL = [6.0, (tarBotY(6) + fornixY(6)) / 2 + 0.6];
    // ---- layer 2: capsulopalpebral fascia from the inferior tarsal border (or, with disinsertion, from where it has slipped to)
    const XC = xs(-14.5, 12.4), cpf = [...XC.map(x => [x, cpfTopY(x) + 0.05]), [12.4, fornixY(12.4) + 1.5], ...XC.slice().reverse().map(x => [x, Math.min(rimY(x) - 1.0, fornixY(x) + 1.5)])];
    let s2 = `<path d="${poly(cpf)}" fill="${C.apo}" stroke="${C.apoS}" stroke-width="0.8" ${NS}/>`;
    for (let x = -13.8; x < 11.8; x += 0.8) s2 += `<path d="M${F([x, cpfTopY(x) + 0.3])}L${F([x * 0.98, fornixY(x) + 1.2])}" stroke="${C.apoS}" stroke-width="0.6" ${NS} opacity="0.7"/>`;
    L[2] = s2; A.cpfL = [-4, (tarBotY(-4) + fornixY(-4)) / 2 + 0.4]; A.cpfEdgeL = [2, cpfTopY(2)];
    // ---- layer 3: lower fat pads (lateral, central, medial) behind the septum; the inferior oblique runs between the medial and central pads
    // (Coban 2023; three-compartment type the most common, Oh 2006); the arcuate expansion between the central and lateral pads. Sizes schematic.
    const pad = (x0, x1, col, colL, colS, seed) => { const P = [...xs(x0, x1, 0.25).map(x => [x, fusY(x) + 0.3]), ...xs(x0, x1, 0.25).reverse().map(x => [x, rimY(x) - 0.3])];
      let g = `<path d="${poly(P)}" fill="${col}" stroke="${colS}" stroke-width="0.6" ${NS}/><clipPath id="${id}_Lp${seed}"><path d="${poly(P)}"/></clipPath><g clip-path="url(#${id}_Lp${seed})">`;
      let j = 0; for (let y = 4; y < 17; y += 0.78, j++) for (let x = x0 + (j % 2) * 0.45, i = 0; x < x1; x += 0.9, i++) g += `<ellipse cx="${(x + (hash(i + seed, j) - 0.5) * 0.3).toFixed(2)}" cy="${y.toFixed(2)}" rx="${(0.32 + 0.14 * hash(j, i + seed)).toFixed(2)}" ry="0.3" fill="${colL}" stroke="${colS}" stroke-width="0.6" ${NS}/>`;
      return g + `</g>`; };
    let s3 = pad(-16.5, -5.0, C.fat, C.fatL, C.fatS, 11) + pad(-4.6, 5.6, C.fat, C.fatL, C.fatS, 23) + pad(6.2, 13.2, C.mfat, '#fbf5e0', C.mfatS, 37);
    const IOP = LID.spline([[12.6, rimY(12.6) - 0.6], [9.5, rimY(9.5) - 1.6], [5.9, rimY(5.9) - 3.0], [3.5, fornixY(3.5) + 1.2]], 0.1);
    s3 += `<path d="${poly(IOP, false)}" fill="none" stroke="${C.musF}" stroke-width="9" stroke-linecap="round" ${NS}/><path d="${poly(IOP, false)}" fill="none" stroke="${C.mus}" stroke-width="7" stroke-linecap="round" ${NS}/>`;
    s3 += `<path d="M${F([-4.8, fusY(-4.8) + 0.5])}Q${F([-5.3, (fusY(-5) + rimY(-5)) / 2])} ${F([-5.9, rimY(-5.9) - 0.4])}" fill="none" stroke="${C.apoS}" stroke-width="2.2" ${NS}/>`;
    L[3] = s3; A.fatLat = [-11, (fusY(-11) + rimY(-11)) / 2]; A.fatCen = [0.5, (fusY(0.5) + rimY(0.5)) / 2]; A.fatMed = [10, (fusY(10) + rimY(10)) / 2]; A.io = IOP[Math.floor(IOP.length * 0.45)]; A.arcuate = [-5.3, (fusY(-5) + rimY(-5)) / 2];
    // ---- layer 4: orbital septum from the fusion line down to the inferior orbital margin
    const XS = xs(-18.4, 15.6), sept = [...XS.map(x => [x, Math.max(fusY(x), Ly(Math.max(LC[0], Math.min(MC[0], x))) + 0.5)]), ...XS.slice().reverse().map(x => [x, rimY(x)])];
    L[4] = `<path d="${poly(sept)}" fill="#ffffff" fill-opacity="0.42" stroke="${C.septS}" stroke-width="0.8" ${NS}/><path d="${poly(XS.map(x => [x, fusY(x)]), false)}" fill="none" stroke="#0e7c6b" stroke-width="1.4" stroke-dasharray="4 3" ${NS}/>`;
    A.septumL = [-9, (fusY(-9) + rimY(-9)) / 2 + 1.5]; A.fusionL = [3, fusY(3)];
    // ---- layer 5: preseptal orbicularis overriding the pretarsal part (a band riding up over the lower tarsus; height schematic)
    if (st.override) { const ov = st.override, top = x => tarBotY(x) - (tarBotY(x) - lashY(x) - 0.6) * ov * prof(x, -12, 10, 0.5), bot = x => tarBotY(x) + 1.2 * prof(x, -12, 10, 0.5);
      const XO = xs(-12, 10, 0.25); L[5] = `<path d="${poly([...XO.map(x => [x, top(x)]), ...XO.slice().reverse().map(x => [x, bot(x)])])}" fill="${C.orbF}" opacity="${(0.55 * Math.min(1, ov)).toFixed(2)}"/>`; A.overrideL = [-3, (top(-3) + bot(-3)) / 2]; }
    // ---- layer 6: lower intermarginal strip, lashes, entropion roll, previous scar
    const XL = xs(LC[0], MC[0], 0.25), roll = d(K.lash) < 0;
    let s6 = '';
    if (!roll) s6 += `<path d="${poly([...XL.map(x => [x, Ly(x)]), ...XL.slice().reverse().map(x => [x, lashY(x)])])}" fill="#dfa892" opacity="0.9"/>`;
    else s6 += `<path d="${poly([...XL.map(x => [x, lashY(x) - 0.05]), ...XL.slice().reverse().map(x => [x, Ly(x) + 0.05])])}" fill="${C.skin2}"/>`;   // skin rolled over the margin onto the cornea
    const inv = Math.max(0, Math.min(1, -d(K.lash) / 1.2)), ev = (st.tie || 0) * (1 - inv);
    const pl = st.pluck || 0;
    for (let x = LC[0] + 2.2, k = 0; x < MC[0] - 3.6; x += 0.45, k++) { const y = lashY(x), lean = x / 14, l = 1.4 + 0.9 * prof(x, LC[0], MC[0]) * (0.7 + 0.5 * hash(k, 2)), dy = lerp(1, -0.9, inv) + 0.15 * ev;
      if (Math.abs(x - 1.0) < 0.2 && pl > 0) continue;
      if (!A.lashMidL && x > -5) A.lashMidL = [x + lean * 0.4, y + dy * l * 0.6];
      s6 += `<path d="M${F([x, y + 0.05 * Math.sign(dy)])}Q${F([x + lean * 0.2, y + dy * l * 0.6])} ${F([x + lean * (0.7 + 0.3 * ev), y + dy * l])}" fill="none" stroke="${C.lash}" stroke-width="0.06" stroke-linecap="round"/>`; }
    if (ev > 0) s6 += `<path d="${poly([...XL.map(x => [x, Ly(x) - 0.05]), ...XL.slice().reverse().map(x => [x, Ly(x) - 0.6 * ev * prof(x, LC[0], MC[0], 0.6)])])}" fill="#d98a8f"/>`;   // everted: a strip of posterior margin shows
    if (st.scar) s6 += `<path d="${poly(XW.map(x => [x, lineAt(d(K.lash) + 2.4)(x)]), false)}" fill="none" stroke="#fff" stroke-width="${(1.2 + 1.4 * st.scar).toFixed(2)}" opacity="${(0.45 + 0.4 * st.scar).toFixed(2)}" ${NS}/>`;
    L[6] = s6; A.lashLineL = [-8, lashY(-8)]; A.marginL = [-4, Ly(-4)]; A.scarL = [3, lineAt(d(K.lash) + 2.4)(3)];
    // ---- overlays (skin side): incision, fracture (under the tissue: dashed), mattress sutures, skin sutures, Hotz, lashes, needle
    let ov = '';
    if (st.subcil && !(st.skinClose >= 1)) { const n = Math.max(2, Math.round(XW.length * Math.min(1, st.subcil))); ov += `<path d="${poly(XW.slice(0, n).map(x => [x, incY(x)]), false)}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linecap="round" ${NS}/>`; A.incL = [XW[n - 1], incY(XW[n - 1])]; }
    if (st.frac) { const XF = xs(-12.0, 9.5, 0.2), n = Math.max(2, Math.round(XF.length * Math.min(1, st.frac))); ov += `<path d="${poly(XF.slice(0, n).map(x => [x, fracY(x)]), false)}" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="6 4" ${NS}/>`; A.fracL = [XF[n - 1], fracY(XF[n - 1])]; }
    const SXL = st.lts ? [-7.0, -1.0, 5.0] : [-4.5, 3.5];               // mattress sutures: ×2, ×3 with a lateral tarsal strip (template; positions schematic)
    if (st.mattress) { const op = Math.min(1, st.mattress), t = st.tie || 0;
      for (const x of SXL) { const E = exitY(x), w = lerp(1.1, 0.5, t);
        for (const sg of [-1, 1]) ov += `<path d="M${F([x + sg * w, fornixY(x) - 0.2])}L${F([x + sg * w * 0.6, E])}" stroke="${BLUE}" stroke-width="1.6" stroke-dasharray="4 3" opacity="${op}" ${NS}/>`;
        ov += `<path d="M${F([x - w * 0.6, E])}L${F([x + w * 0.6, E])}" stroke="${BLUE}" stroke-width="2.4" stroke-linecap="round" opacity="${op}" ${NS}/><circle cx="${x}" cy="${E.toFixed(2)}" r="${(0.2 + 0.12 * t).toFixed(2)}" fill="${BLUE}" opacity="${op}"/>`; }
      A.mattressL = [SXL[0], exitY(SXL[0])]; A.mattressX = SXL; }
    if (st.skinClose) { const op = Math.min(1, st.skinClose); for (let x = -11; x <= 9; x += 2.5) ov += `<path d="M${F([x, incY(x) - 0.55])}L${F([x, incY(x) + 0.55])}" stroke="#1d2733" stroke-width="1.4" opacity="${op}" ${NS}/>`;
      ov += `<path d="${poly(XW.map(x => [x, incY(x)]), false)}" fill="none" stroke="${C.skinS}" stroke-width="1.4" opacity="${(0.8 * op).toFixed(2)}" ${NS}/>`; A.skinCloseL = [-1, incY(-1)]; }
    if (st.hotzMark || (hz > 0 && hz < 0.5)) for (const f of [hLoY, hHiY]) ov += `<path d="${poly(XW.map(x => [x, f(x)]), false)}" fill="none" stroke="${RED}" stroke-width="2.2" ${NS}/>`;
    const HX = [-9.0, -4.5, 0, 4.5, 8.5];                                   // Hotz: orbicularis to the retractor aponeurosis ×5 (template; positions schematic)
    if (st.hotzFix) { const op = Math.min(1, st.hotzFix); for (const x of HX) ov += `<path d="M${F([x, hLoY(x) + 0.3])}L${F([x, fixY(x)])}" stroke="${BLUE}" stroke-width="1.8" stroke-linecap="round" opacity="${op}" ${NS}/><circle cx="${x}" cy="${fixY(x).toFixed(2)}" r="0.22" fill="${BLUE}" opacity="${op}"/>`;
      A.hotzFixL = [HX[1], (hLoY(HX[1]) + fixY(HX[1])) / 2]; A.hotzX = HX; }
    if (hz > 0) A.hotzL = [-2, (hLoY(-2) + hHiY(-2)) / 2];
    if (st.misdirected) { for (const [x, l, b] of [[-2.6, 2.8, 0.4], [-1.7, 3.2, -0.2]]) { const y = lashY(x); ov += `<path d="M${F([x, y])}Q${F([x + b * 0.3, y - l * 0.5])} ${F([x + b, y - l])}" fill="none" stroke="${AMBER}" stroke-width="0.1" stroke-linecap="round" opacity="${st.misdirected}"/>`; }
      A.misLashL = [-1.7 - 0.1, lashY(-1.7) - 1.9]; }
    if (st.metaplastic) { for (const [x, l, b] of [[2.4, 2.4, 0.3], [3.3, 2.8, -0.3]]) { const y = Ly(x); ov += `<circle cx="${x}" cy="${(y + 0.05).toFixed(3)}" r="0.09" fill="${AMBER}" opacity="${st.metaplastic}"/><path d="M${F([x, y])}Q${F([x + b * 0.3, y - l * 0.5])} ${F([x + b, y - l])}" fill="none" stroke="${AMBER}" stroke-width="0.1" stroke-linecap="round" opacity="${st.metaplastic}"/>`; }
      A.metaLashL = [3.3 + 0.1, Ly(3.3) - 1.6]; }
    if (st.needle) { const x = 1.0, y = lashY(x), top = [x - 0.15, y - 2.4];   // the needle comes in along the lash shaft (from in front and above); seen from the front it is short
      ov += `<path d="M${F(top)}L${F([x, y])}" stroke="#2f3a44" stroke-width="2.6" stroke-linecap="round" ${NS}/><path d="M${F(top)}L${F([x, y])}" stroke="#aeb8c2" stroke-width="1.4" ${NS}/><circle cx="${x}" cy="${y.toFixed(2)}" r="0.13" fill="#2f3a44"/>`;
      A.needleL = [x, y]; }
    if (st.treated) { const x = 1.0, y = lashY(x); ov += `<circle cx="${x}" cy="${(y + 0.35).toFixed(2)}" r="${(0.35 * st.treated).toFixed(2)}" fill="#c98a4b" opacity="0.5" stroke="#7a4a2a" stroke-width="1" stroke-dasharray="2 1.5" ${NS}/>`; A.treatedL = [x, y + 0.35]; }
    // ---- lateral canthus: canthotomy, cantholysis, tarsal strip, fixation inside the lateral rim (Becker 1982); canthopexy without canthotomy
    const lcY = LC[1], stripL = st.stripL ?? 5, shortMm = st.shortMm ?? 0, strX0 = LC[0] + 1.6;
    if (st.canthotomy) { const x1 = lerp(LC[0], LAT_RIM_X + 0.4, Math.min(1, st.canthotomy)); ov += `<path d="M${F(LC)}L${F([x1, lcY])}" stroke="${RED}" stroke-width="2.6" stroke-linecap="round" ${NS}/>`; A.canthotomy = [(LC[0] + x1) / 2, lcY]; }
    if (st.cantholysis) { const e = [LAT_RIM_X + 0.6, lcY + 3.0 * Math.min(1, st.cantholysis)]; ov += `<path d="M${F([LAT_RIM_X + 0.4, lcY])}L${F(e)}" stroke="${RED}" stroke-width="2.6" stroke-linecap="round" ${NS}/>`; A.cantholysis = [LAT_RIM_X + 0.5, lcY + 1.6]; }
    // strip: after cantholysis the lateral lower lid is split, its anterior lamella and margin removed, leaving a strip of tarsus that is
    // held out laterally (stripL mm, schematic); shortMm is cut off its end; once fixed, its end lies on the periosteum at the tubercle
    if (st.strip) { const op = Math.min(1, st.strip), fixed = (st.stripFix || 0) >= 1, x0 = strX0, yS = lcY + 1.0;
      const xe = fixed ? TUB[0] : x0 - stripL, band = (a, b) => poly([[a, yS - 0.55], [b, yS - 0.55], [b, yS + 0.55], [a, yS + 0.55]]);
      const xVis = Math.max(xe, LAT_RIM_X + 0.2);                                  // beyond the rim edge the strip is hidden under skin and bone
      ov += `<path d="${band(xVis, x0)}" fill="${C.tar}" stroke="${C.tarS}" stroke-width="1.2" opacity="${op}" ${NS}/>`;
      if (xe < xVis) ov += `<path d="${band(xe, xVis)}" fill="none" stroke="${C.tarS}" stroke-width="1.2" stroke-dasharray="3 2" opacity="${op}" ${NS}/>`;
      if (!fixed && shortMm > 0) ov += `<path d="M${F([xe + shortMm, yS - 0.9])}L${F([xe + shortMm, yS + 0.9])}" stroke="${RED}" stroke-width="2" stroke-dasharray="3 2" opacity="${op}" ${NS}/>`;
      A.strip = [lerp(xVis, x0, 0.5), yS]; A.stripEnd = [xe, yS]; }
    if (st.stripFix) { const op = Math.min(1, st.stripFix);                         // 4-0 vicryl ×1 to the periosteum inside the rim (template); hidden: dashed
      ov += `<path d="M${F([TUB[0] + 0.9, lcY + 1.0])}Q${F([TUB[0] + 0.3, lcY + 0.2])} ${F(TUB)}" fill="none" stroke="${BLUE}" stroke-width="1.8" stroke-dasharray="4 3" opacity="${op}" ${NS}/><circle cx="${TUB[0]}" cy="${TUB[1]}" r="0.3" fill="${BLUE}" opacity="${op}"/>`; A.stripFix = TUB; }
    if (st.canthotomy || st.strip || st.stripFix || st.canthopexy || st.rimShow) ov += `<path d="${poly(RIM.filter(p => p[0] < -12 && p[1] > -8 && p[1] < 12), false)}" fill="none" stroke="${C.boneS}" stroke-width="1.6" stroke-dasharray="5 4" opacity="0.9" ${NS}/>`;   // lateral rim under the skin
    if (st.canthopexy) { const op = Math.min(1, st.canthopexy), P0 = [-13.4, Ly(-13.4) + 0.9], P1 = [TUB[0], TUB[1] - 0.9];
      ov += `<path d="M${F(P0)}Q${F([-17.5, lcY + 1.1])} ${F(P1)}" fill="none" stroke="${BLUE}" stroke-width="1.8" stroke-dasharray="4 3" opacity="${op}" ${NS}/><circle cx="${P1[0]}" cy="${P1[1]}" r="0.3" fill="${BLUE}" opacity="${op}"/>`; A.canthopexy = P1; }
    A.lcL = LC;
    return { windows: wins, L, over: ov, A, ret: { lashLY: lashY, incLY: incY, exitLY: exitY, fracLY: fracY, tarBotLY: tarBotY, fusLY: fusY, fornixLY: fornixY, rimLY: rimY, hotzLoY: hLoY, hotzHiY: hHiY, hotzFixY: fixY, latRimX: LAT_RIM_X, tubercle: TUB, mattressX: SXL, rimLine: RIM } };
  }
  return { build, LAT_RIM_X, HERTEL };
})();
if (typeof module !== 'undefined') module.exports = LOWERC;
