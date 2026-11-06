// Surgical states and schematic geometry of this video, shared by the drawing (draw.js) and the checks (../check.js), so the number said in the
// narration and the number the model draws are the same value. Source of each value in the comment; 示意 = schematic, no source (overview-notes.md).
// Needs LID, CORONAL, LOWER, LAC (videos/models/eyelid).
const LP = {
  greyD: LAC.GREY_D,              // gray line 6-0 silk 2 mm from the wound edge on either side: EyeWiki
  tarUpper: LAC.TAR.upper,        // upper lid: 3 tarsal sutures (EyeWiki; EyeRounds 影片 2); heights 示意
  tarLower: LAC.TAR.lower,        // lower lid: 2 tarsal sutures (EyeWiki; EyeRounds 影片); heights 1.3 and 2.8 mm 示意
  lowerTarH: LOWER.S_TARL,        // lower tarsus 4.12 mm high: Lim 2004 (Asian cadavers)
  lowerBiteK: 0.7,                // lower tarsal bite depth as a fraction of the tarsal thickness from the conjunctiva: 示意 (anterior half, EyeRounds 影片)
  pout: 0.3,                      // margin slightly everted after tying (EyeRounds 圖譜, Allen 影片): amount 示意
  notch: -0.5,                    // healed notch (chapter 5): 示意
  zone3: 5,                       // Zone III = wound extends more than 5 mm behind the limbus: Anant 2025
  punctaFromMC: [5.5, 6.0],       // upper / lower punctum, mm temporal to the medial canthus: 示意
  vm2U: LAC.U.lash,               // second vertical mattress at the lash follicles (EyeRounds 影片); depth 示意
  win: [-3.4, 3.4],               // coronal window down to the tarsus (x, mm) while the tarsus is sutured
};
// states (cumulative): each segment animates between two of these; check.js checks the same objects
const ST = (() => {
  const open = { lac: 1 }, grey = { lac: 1, lacGrey: 1 };
  const tarPlaced = { lac: 0.4, lacGrey: 1, lacTar: 1, lacWin: LP.win }, tarTied = { lac: 0, lacGrey: 1, lacTar: 1, lacWin: LP.win };
  const margin = { lac: 0, lacPout: LP.pout, lacGrey: 1, lacGreyTie: 1, lacTar: 1, lacLash: 1, lacLashTie: 1 };
  const skin = { ...margin, lacSkin: 1 }, done = { ...skin, lacTails: 1 };
  const vm = { lac: 0, lacTar: 1, lacVM: 1 }, vmTied = { ...vm, lacVMTie: 1, lacPout: LP.pout };
  return { open, grey, tarPlaced, tarTied, margin, skin, done, vm, vmTied, notch: { lacPout: LP.notch } };
})();

// ---------------------------------------------------------------- schematic geometry (mm), sagittal coordinates of lid.js / lower.js
const LG = (() => {
  const TAU = 2 * Math.PI, gp = LID.gp, hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const phiL = TAU - LOWER.PHI_LL;                                   // superior limbus (the globe is symmetric about the visual axis)
  const arc = (a, b) => { let L = 0, p = gp(a); const n = 400; for (let i = 1; i <= n; i++) { const q = gp(a + (b - a) * i / n); L += hyp(p, q); p = q; } return L; };
  const phiAt = d => { let lo = phiL, hi = phiL + 1.2; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; arc(phiL, m) < d ? lo = m : hi = m; } return (lo + hi) / 2; };
  const phiZ = phiAt(LP.zone3);                                      // the zone II / III boundary: 5 mm along the sclera behind the limbus
  const limbus = gp(phiL), zone3 = gp(phiZ);
  const scleraArc = (a, b, n = 40) => Array.from({ length: n + 1 }, (_, i) => gp(a + (b - a) * i / n));
  // silk tails: tucked = from where the gray line suture leaves the margin, round the anterior lid edge, up along the skin under the lowest skin
  // suture (EyeWiki: buried in the skin sutures, away from the cornea); loose = hanging down onto the cornea (what burying prevents). Paths 示意.
  const U = LAC.U, UF = LID.UF, uSk = s => LID.uSkin(LID.VARIANTS.asian, s);
  const exitPt = UF.at(0, U.grey);
  const tailTucked = () => [exitPt, UF.at(-0.25, U.skin + 0.15), UF.at(0.4, uSk(0.4) + 0.2), UF.at(LAC.SKIN_S[0], uSk(LAC.SKIN_S[0]) + 0.18), UF.at(LAC.SKIN_S[0] + 0.9, uSk(LAC.SKIN_S[0] + 0.9) + 0.25)];
  const corneaAt = y => { let lo = Math.PI * 0.9, hi = Math.PI; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; gp(TAU - m)[1] < y ? lo = m : hi = m; } return gp(TAU - (lo + hi) / 2); };
  const tailLoose = () => { const c = corneaAt(-3.0); return [exitPt, [exitPt[0] - 0.3, exitPt[1] + 0.7], [c[0] - 0.22, c[1] - 0.15], [c[0] - 0.05, c[1] + 0.4]]; };
  // a full-thickness tarsal bite (chapter 5, wrong): through the anterior tarsus and out of the conjunctival surface, the knot on the eye side
  const fullBite = s => ({ a: UF.at(s, U.tar - 0.1), b: UF.at(s, -0.02), knot: UF.at(s, -0.16) });
  // lower lid: the two tarsal suture crossings on the wound face (heights LP.tarLower, 示意), in the anterior part of the 4.12 mm tarsus
  const lowerBite = s => LOWER.LF.at(s, LOWER.U_CONJ + LP.lowerBiteK * LOWER.TAR_TH);
  const lowerTar = () => [LOWER.LF.at(0, LOWER.U_CONJ), LOWER.LF.at(LP.lowerTarH, LOWER.U_CONJ)];   // ends of the tarsus on its posterior surface
  // coronal: puncta (示意) on the posterior lid margin, LP.punctaFromMC mm temporal to the medial canthus
  const puncta = () => { const mc = CORONAL.MC[0]; return [[mc - LP.punctaFromMC[0], CORONAL.Uy(mc - LP.punctaFromMC[0])], [mc - LP.punctaFromMC[1], CORONAL.Ly(mc - LP.punctaFromMC[1])]]; };
  // vertical mattress at margin depth u: far–far and near–near points; margin face (M = LAC.margin(...).M) and coronal (rc = CORONAL.draw result)
  const vmMargin = (M, st, u) => { const x0 = st.lacX || 0; return [[x0 - LAC.VM_FAR, x0 + LAC.VM_FAR], [x0 - LAC.VM_NEAR, x0 + LAC.VM_NEAR]].map(p => p.map(x => M([x, -u]))); };
  const vmCor = (rc, st, u) => { const x0 = st.lacX || 0, W = rc.lacW || (p => p), y = x => rc.Uy(x) + (rc.lashY(x) - rc.Uy(x)) * u / U.skin;
    return [[x0 - LAC.VM_FAR, x0 + LAC.VM_FAR], [x0 - LAC.VM_NEAR, x0 + LAC.VM_NEAR]].map(p => p.map(x => W([x, y(x)]))); };
  return { phiL, phiZ, limbus, zone3, arc, scleraArc, exitPt, tailTucked, tailLoose, corneaAt, fullBite, lowerBite, lowerTar, puncta, vmMargin, vmCor };
})();
if (typeof module !== 'undefined') module.exports = { LP, ST, LG };
