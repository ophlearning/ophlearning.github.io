// ============================================================================
// Socket model — left eye (OS): eviscerated socket (no implant) with a retained 360° encircling scleral buckle (silicone band) that has
// eroded through the conjunctiva. Self-contained (no other model needed). Numbers and sources: socket/CARD.md (most values are 示意).
// Coordinates (mm):
// - s = arc length along the outer surface of the scleral shell from its anterior pole (the closed front of the shell). The shell is an
//   ellipse in every meridional section: half-width SHELL_A (equator), half-depth SHELL_B (anterior pole → centre), schematic.
// - clock hour h as seen by an examiner facing the patient (12 = superior; OS: 3 = temporal, 9 = nasal).
// 1. SOCKET.sec({ state, h }): meridional section through clock hour h. Right = hour h, left = hour h + 6, up = anterior (toward the
//    surgeon), down = posterior (orbital apex). x = distance from the shell axis, y = depth (shell centre 0, anterior negative).
// 2. SOCKET.front({ state }): the surgeon's view of the OS socket, surgeon at 12: down = 12, right = 9 (nasal), left = 3 (temporal).
//    Radius on screen = s (arc length along the shell, an azimuthal equidistant map like a fundus chart), so the band width, the
//    insertion-to-band distance and the suture bites are the same mm in both views; the angle on screen is the clock hour.
// Shared state (both views): conformer 0/1 · expose {h, len} · open {h0, h1} (clockwise in clock hours) · hook h · sutCut [h…] · cut h ·
//   pull 0–1 (pullDir ±1) · debride 0–1 · close 0–1.
// ============================================================================
const SOCKET = (() => {
  const D2R = Math.PI / 180, TAU = 2 * Math.PI;
  // parameters (mm). Change SOCKET.P to change the defaults; every view reads them at draw time. Sources / 示意: CARD.md
  const P = {
    EYE: 'OS',
    SHELL_A: 9.5, SHELL_B: 7.0, SCL_T: 0.9,          // collapsed scleral shell, schematic
    BAND_W: 3.5, BAND_T: 0.75,                         // #41 band: 3.5 mm (Gomaa 2017); 0.75 mm (FCI GUDID listing)
    CAPS_T: 0.2,                                       // fibrous capsule around the band (Lee 2013, Suh 2007; thickness schematic)
    INS_D: 4.5,                                        // rectus insertion: arc distance anterior to the band centre, schematic
    MUS_W: 9, MUS_T: 1.4,                              // rectus width / thickness near the insertion, schematic
    TEN_T: 0.6, CONJ_T: 0.35,                          // Tenon, conjunctiva, schematic
    FORNIX: 1.5,                                       // fornix: arc distance posterior to the band's posterior edge, schematic
    SUT_H: [1.5, 4.5, 7.5, 10.5],                      // one 5-0 Dacron mattress suture per quadrant (positions schematic)
    SUT_GAP: 2.2, SUT_BITE: 1.0,                       // distance between the two limbs along the band; bite beyond the band edge
    OPEN_IN: 2.5,                                      // conjunctival incision: arc distance anterior to the band's anterior edge
    EXPO_M: 1.0,                                       // exposure hole: margin beyond each band edge
    HOOK_LIFT: 2.0,                                    // muscle hook lifts the rectus this far off the band
    FISS: [19, 17],                                    // speculum-opened palpebral fissure, half-axes on the front map
  };
  const c01 = v => Math.max(0, Math.min(1, +v || 0));
  const F = v => (Math.round(v * 1000) / 1000).toString();
  const pstr = P_ => P_.map((p, i) => (i ? 'L' : 'M') + F(p[0]) + ' ' + F(p[1])).join('');
  const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const plen = P_ => { let L = 0; for (let i = 1; i < P_.length; i++) L += hyp(P_[i], P_[i - 1]); return L; };

  // ---- clock hours
  const clk = h => ((h % 12) + 12) % 12;
  const hd = (a, b) => { const d = clk(a - b); return Math.min(d, 12 - d); };          // circular distance in hours
  const inArc = (h, h0, h1) => clk(h - h0) <= clk(h1 - h0) + 1e-9;                     // clockwise from h0 to h1
  const fdir = h => [-Math.sin(h * 30 * D2R), Math.cos(h * 30 * D2R)];                // surgeon at 12: 12 down, 3 left, 9 right
  const fpt = (h, r) => { const d = fdir(h); return [d[0] * r, d[1] * r]; };
  const hourOf = p => { const h = clk(Math.atan2(-p[0], p[1]) / D2R / 30); return h < 1e-9 ? 12 : h; };
  const temporalH = () => P.EYE === 'OS' ? 3 : 9;
  const hourName = h => {
    const t = temporalH(), q = clk(h), near = (a, b) => hd(a, b) < 0.01;
    if (near(q, 0)) return '上 superior'; if (near(q, 6)) return '下 inferior';
    if (near(q, t)) return '顳側 temporal'; if (near(q, t + 6)) return '鼻側 nasal';
    const sup = hd(q, 0) < 3, tem = hd(q, t) < 3;
    return (sup ? '上' : '下') + (tem ? '顳' : '鼻') + '側 ' + (sup ? 'supero' : 'infero') + (tem ? 'temporal' : 'nasal');
  };
  const fmtH = h => { const q = clk(h) || 12, H = Math.floor(q + 1e-6), m = Math.round((q - H) * 60); return m ? `${H}:${String(m).padStart(2, '0')}` : `${H}`; };
  const muscles = () => { const t = temporalH(); return [[12, '上直肌', 'SR'], [t, '外直肌', 'LR'], [6, '下直肌', 'IR'], [clk(t + 6), '內直肌', 'MR']]; };
  const Rb = () => P.SHELL_A + P.CAPS_T + P.BAND_T / 2;                                // band centreline radius (3D)
  const hourSpan = mm => mm / Rb() * 6 / Math.PI;                                       // circumferential mm on the band → hours
  const muscleAt = hs => muscles().find(m => hd(hs, m[0]) <= hourSpan(P.MUS_W / 2)) || null;

  // ---- shell profile (one meridional half): u = A sin t, y = −B cos t; arc-length table
  function profile() {
    const A = P.SHELL_A, B = P.SHELL_B, N = 900, T = [], S = [0];
    for (let i = 0; i <= N; i++) { const t = Math.PI * i / N; T.push([A * Math.sin(t), -B * Math.cos(t)]); if (i) S.push(S[i - 1] + hyp(T[i], T[i - 1])); }
    const at = s => { s = Math.max(0, Math.min(S[N], s)); let i = 1; while (i < N && S[i] < s) i++;
      const k = (s - S[i - 1]) / (S[i] - S[i - 1] || 1), p = [T[i - 1][0] + (T[i][0] - T[i - 1][0]) * k, T[i - 1][1] + (T[i][1] - T[i - 1][1]) * k];
      const g = [p[0] / (A * A), p[1] / (B * B)], gl = Math.hypot(g[0], g[1]) || 1; return { p, n: [g[0] / gl, g[1] / gl] }; };
    const nearestS = q => { let b = 0, bd = 1e9; for (let i = 0; i <= N; i++) { const d = hyp(q, T[i]); if (d < bd) { bd = d; b = i; } } return S[b]; };
    const sEq = S[N / 2], W = P.BAND_W;
    return { at, nearestS, sEnd: S[N], sEq, s0: sEq - W / 2, s1: sEq + W / 2, sIns: sEq - P.INS_D, sFor: sEq + W / 2 + P.FORNIX,
      sLeave: sEq + W / 2 + 2.0, sOpen: sEq - W / 2 - P.OPEN_IN, hole: [sEq - W / 2 - P.EXPO_M, sEq + W / 2 + P.EXPO_M] };
  }

  // ---- the band: cut, pull, sutures that still hold it
  function stuckBy(st) {
    if (st.cut == null || !(c01(st.pull) > 0)) return [];
    const cutS = st.sutCut || [];
    return P.SUT_H.filter(h => !cutS.some(c => hd(c, h) < 0.05));                   // an uncut suture still holds the band: it cannot slide
  }
  function band(st) {
    const R = Rb(), L = TAU * R, cut = st.cut == null ? null : clk(st.cut), dir = st.pullDir === -1 ? -1 : 1, stuck = stuckBy(st);
    const p = cut == null || stuck.length ? 0 : c01(st.pull), span = 12 * (1 - p);
    const has = h => cut == null ? true : (p >= 1 ? false : clk(dir * (h - cut)) <= span + 1e-9);
    const endH = cut == null ? null : clk(cut + dir * span);
    const arcH = cut == null ? [0, 12] : (dir > 0 ? [cut, cut + span] : [cut - span, cut]);   // occupied hours, increasing
    const ring3 = []; if (span > 0) for (let i = 0; i <= 360; i++) ring3.push(fpt(arcH[0] + (arcH[1] - arcH[0]) * i / 360, R));
    return { R, L, cut, dir, p, span, has, endH, arcH, stuck, ring3, removed: p >= 1 };
  }
  // where things are (shared by both views)
  function plan(st) {
    const B = band(st), ex = st.expose || null, op = st.open || null, close = c01(st.close);
    const opSpan = op ? clk(op.h1 - op.h0) : 0;
    const closed = hs => !!op && close > 0 && clk(hs - op.h0) <= opSpan * close + 1e-9;
    const isOpen = hs => !!op && inArc(hs, op.h0, op.h1) && !closed(hs);
    const isExpo = hs => !!ex && hd(hs, ex.h) <= hourSpan((ex.len || 6) / 2) && !closed(hs) && !isOpen(hs);
    const sutAt = hs => P.SUT_H.find(h => hd(hs, h) <= hourSpan(P.SUT_GAP / 2) + 0.03);
    const sutIsCut = h => (st.sutCut || []).some(c => hd(c, h) < 0.05);
    return { B, ex, op, opSpan, closed, isOpen, isExpo, sutAt, sutIsCut, gran: 1 - c01(st.debride), close };
  }

  // ===================================================================== section
  const COL = { bg: '#f7f5f1', fat: '#f1dfa6', fatL: '#d8bf73', skin: '#efc6a6', skinL: '#b98763', pconj: '#e9a3a0', conj: '#f0bcb6', conjL: '#c4746e',
    ten: '#f6eee2', tenL: '#c6b294', scl: '#f7f6f0', sclL: '#8e877a', fib: '#e8d7c3', mus: '#b9534d', musL: '#7c2f2b', band: '#dfe9f2', bandL: '#536b82',
    caps: '#efe6d6', capsL: '#a8977a', sut: '#2c6e3a', gran: '#c8403c', granL: '#8e2433', hook: '#7f8b97', conf: 'rgba(150,195,230,0.28)', confL: '#5f8fb8', wound: '#e2b3a6', stuck: '#d12a1f' };

  function sec(opt) {
    const st = opt.state || {}, h = clk(opt.h == null ? 12 : opt.h) || 12, id = opt.id || 'sk', S = profile(), PL = plan(st), B = PL.B;
    const W = P.BAND_W, T = P.BAND_T, CT = P.CAPS_T, MT = P.MUS_T, A = {}, sides = {}, o = [], top = [];
    const ramp = (s, a, b, m) => s < a - m || s > b + m ? 0 : (s >= a && s <= b ? 1 : 0.5 + 0.5 * Math.cos(Math.PI * (s < a ? a - s : s - b) / m));
    const pt = (sg, s, off) => { const q = S.at(s); return [sg * (q.p[0] + q.n[0] * off), q.p[1] + q.n[1] * off]; };
    const strip = (sg, s0, s1, oIn, oOut, ds = 0.08) => { const a = [], b = []; for (let s = s0; s <= s1 + 1e-9; s += ds) { a.push(pt(sg, s, oIn(s))); b.push(pt(sg, s, oOut(s))); }
      a.push(pt(sg, s1, oIn(s1))); b.push(pt(sg, s1, oOut(s1))); return a.concat(b.reverse()); };
    const poly = (P_, fill, stroke, sw, extra = '') => `<path d="${pstr(P_)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${extra}/>`;

    // background, orbital fat behind the fornices
    o.push(`<rect x="-60" y="-60" width="120" height="120" fill="${COL.bg}"/>`);
    const yF = S.at(S.sFor).p[1];
    o.push(`<rect x="-60" y="${F(yF - 0.6)}" width="120" height="80" fill="${COL.fat}"/>`);
    A.fat = [0.2, S.at(S.sEnd).p[1] + 3.5];

    for (const sg of [1, -1]) {
      const hs = sg > 0 ? h : clk(h + 6) || 12, mus = muscleAt(hs), hasBand = !B.removed && B.has(hs), sut = hasBand || PL.sutAt(hs) ? PL.sutAt(hs) : undefined;
      const hooked = mus && st.hook != null && hd(hs, st.hook) < 0.01, expo = PL.isExpo(hs), open = PL.isOpen(hs), closed = PL.closed(hs);
      const sutDrawn = sut !== undefined && !(B.removed && PL.sutIsCut(sut));
      const bandB = s => (hasBand ? (T + 2 * CT) : 0) * ramp(s, S.s0 - CT, S.s1 + CT, 0.9);          // band + capsule bulge under the muscle
      const sutB = s => sutDrawn ? 0.45 * ramp(s, S.s0 - 0.6, S.s1 + 0.6, 0.6) : 0;
      const lift = s => hooked ? P.HOOK_LIFT * ramp(s, S.sEq - 1.0, S.sEq - 1.0, 3.2) : 0;
      const musIn = s => bandB(s) + 0.05 + lift(s), musOut = s => musIn(s) + MT;
      const tenIn = s => (mus ? musOut(s) : bandB(s) + sutB(s)) + 0.05, tenOut = s => tenIn(s) + P.TEN_T;
      const conjIn = s => tenOut(s) + 0.02, conjOut = s => conjIn(s) + P.CONJ_T;
      const side = sides[sg] = { hour: hs, muscle: mus ? mus[2] : null, hasBand, hooked, expo, open, closed, sut: sutDrawn ? sut : null };
      const bIn = CT, bOut = CT + T; side.musIn = mus ? musIn : null; side.bandIn = bIn; side.bandOut = bOut; side.s0 = S.s0; side.s1 = S.s1;
      side.conjOut = conjOut; side.conjIn = conjIn;

      // lids (simplified): from the fornix forward to the margin, held open
      const Fp = pt(sg, S.sFor, conjOut(S.sFor)), M = [sg * (P.SHELL_A + 4.2), -P.SHELL_B - 3.0], M2 = [sg * (P.SHELL_A + 8.2), -P.SHELL_B - 3.0];
      const lidIn = []; for (let i = 0; i <= 20; i++) { const k = i / 20, c = [sg * (P.SHELL_A + 6.4), Fp[1] - 2.0];
        lidIn.push([(1 - k) * (1 - k) * Fp[0] + 2 * k * (1 - k) * c[0] + k * k * M[0], (1 - k) * (1 - k) * Fp[1] + 2 * k * (1 - k) * c[1] + k * k * M[1]]); }
      const lidOut = [M2, [sg * (P.SHELL_A + 11), -2], [sg * (P.SHELL_A + 11.5), Fp[1] + 1.8], [sg * (P.SHELL_A + 3.2), Fp[1] + 1.2]];
      o.push(poly(lidIn.concat(lidOut), COL.skin, COL.skinL, 0.12));
      o.push(`<path d="${pstr(lidIn)}" fill="none" stroke="${COL.pconj}" stroke-width="0.5"/>`);
      if (sg > 0) { A.lid = [sg * (P.SHELL_A + 7.5), -4]; A.fornix = Fp; }

      // rectus: insertion on the shell, over the band (and capsule), then posteriorly toward the apex
      if (mus) {
        const s0 = S.sIns, s1 = S.sLeave, inner = [], outer = [];
        for (let s = s0; s <= s1 + 1e-9; s += 0.08) { inner.push(pt(sg, s, musIn(s))); outer.push(pt(sg, s, musOut(s))); }
        const e1 = inner[inner.length - 1], e2 = outer[outer.length - 1], dv = [sg * -0.12, 1];
        inner.push([e1[0] + dv[0] * 16, e1[1] + dv[1] * 16]); outer.push([e2[0] + dv[0] * 16, e2[1] + dv[1] * 16]);
        o.push(poly(inner.concat(outer.reverse()), COL.mus, COL.musL, 0.12));
        const ins = pt(sg, S.sIns, 0); o.push(`<path d="${pstr([pt(sg, S.sIns, 0), pt(sg, S.sIns, MT + 0.05)])}" stroke="${COL.musL}" stroke-width="0.35"/>`);
        side.musPts = { ins, over: pt(sg, S.sEq, musIn(S.sEq) + MT / 2) };
        if (sg > 0) { A.rectus = pt(sg, S.sEq + 3.5, musIn(S.sEq + 3.5) + MT / 2); A.ins = ins; }
      }
      // Tenon and conjunctiva: intervals with the exposure hole or the opening removed
      let iv = [[0, S.sFor]];
      if (expo) iv = [[0, S.hole[0]], [S.hole[1], S.sFor]];
      if (open) iv = [[0, S.sOpen]];
      for (const [a, b] of iv) {
        o.push(poly(strip(sg, a, Math.min(b, S.sLeave), tenIn, tenOut), COL.ten, COL.tenL, 0.08));
        o.push(poly(strip(sg, a, b, conjIn, conjOut), COL.conj, COL.conjL, 0.08));
      }
      if (sg > 0) { A.tenon = pt(sg, S.sIns - 1.2, (tenIn(S.sIns - 1.2) + tenOut(S.sIns - 1.2)) / 2); A.conj = pt(sg, S.sIns - 2.5, conjOut(S.sIns - 2.5)); }
      if (closed && st.open) { const c = pt(sg, S.sOpen, conjOut(S.sOpen) + 0.1); top.push(`<path d="M${F(c[0] - 0.5)} ${F(c[1] - 0.5)}l1 1M${F(c[0] + 0.5)} ${F(c[1] - 0.5)}l-1 1" stroke="#1d2733" stroke-width="0.18"/>`); if (sg > 0) A.close = c; }
      if (open && sg > 0) A.open = pt(sg, S.sOpen, conjOut(S.sOpen));

      // band (flat rectangle in section, schematic) in its fibrous capsule, flat on the shell
      if (hasBand) {
        o.push(poly(strip(sg, S.s0 - CT, S.s1 + CT, () => 0, s => ramp(s, S.s0, S.s1, CT) * (T + 2 * CT), 0.03), COL.caps, COL.capsL, 0.06));
        o.push(poly(strip(sg, S.s0, S.s1, () => bIn, () => bOut, 0.05), COL.band, COL.bandL, 0.1));
        const c = pt(sg, S.sEq, (bIn + bOut) / 2); side.bandC = c;
        if (sg > 0) { A.band = c; A.capsule = pt(sg, S.s1 + 0.05, CT + T + CT * 0.5); }
        if (sg < 0) A.bandL = c;
      }
      // Dacron mattress suture straddling the band: bites in the sclera on both sides, loop over the band
      if (sutDrawn && !(B.removed && PL.sutIsCut(sut))) {
        const cutS = PL.sutIsCut(sut), b0 = pt(sg, S.s0 - P.SUT_BITE, -0.45), b1 = pt(sg, S.s1 + P.SUT_BITE, -0.45);
        const lp = []; for (let s = S.s0 - 0.35; s <= S.s1 + 0.35 + 1e-9; s += 0.1) lp.push(pt(sg, s, Math.max(0.05, bandB(s) + 0.08)));
        const path = [b0, ...lp, b1]; side.sutPath = path; side.bite = [S.s0 - P.SUT_BITE, S.s1 + P.SUT_BITE];
        if (cutS) { const m = Math.floor(path.length / 2); o.push(`<path d="${pstr(path.slice(0, m - 1))}" fill="none" stroke="${COL.sut}" stroke-width="0.2"/><path d="${pstr(path.slice(m + 2))}" fill="none" stroke="${COL.sut}" stroke-width="0.2"/>`); }
        else o.push(`<path d="${pstr(path)}" fill="none" stroke="${COL.sut}" stroke-width="0.2"/>`);
        if (sg > 0) A.sut = pt(sg, S.sEq, bandB(S.sEq) + 0.08);
        if (B.stuck.some(x => hd(x, sut) < 0.05)) { const c = pt(sg, S.sEq, bandB(S.sEq)); top.push(`<circle cx="${F(c[0])}" cy="${F(c[1])}" r="1.6" fill="none" stroke="${COL.stuck}" stroke-width="0.25"/>`); if (sg > 0) A.stuck = c; }
      }
      // exposure: granulation at the edges of the hole (shrinks with debridement)
      if (expo && PL.gran > 0.01) {
        const g = PL.gran;
        for (const [s, off, r] of [[S.hole[0] - 0.2, 0.9, 0.75], [S.hole[1] + 0.2, 0.9, 0.7], [S.hole[0] + 0.3, 1.5, 0.45], [S.hole[1] - 0.3, 1.4, 0.4]]) {
          const c = pt(sg, s, off + (mus ? MT : 0)); o.push(`<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(r * g)}" fill="${COL.gran}" stroke="${COL.granL}" stroke-width="0.08"/>`); }
        if (sg > 0) A.gran = pt(sg, S.hole[0] - 0.2, 0.9 + (mus ? MT : 0));
      }
      if (PL.ex && hd(hs, PL.ex.h) <= hourSpan((PL.ex.len || 6) / 2) && sg > 0) A.expose = hasBand ? pt(sg, S.sEq, CT + T) : pt(sg, S.sEq, 0);
      // muscle hook under the lifted rectus
      if (hooked) { const c = pt(sg, S.sEq - 1.0, musIn(S.sEq - 1.0) - 0.5); top.push(`<circle cx="${F(c[0])}" cy="${F(c[1])}" r="0.45" fill="#c9d1d9" stroke="${COL.hook}" stroke-width="0.15"/>`); if (sg > 0) A.hook = c; side.hookC = c; }
      // cut point and the pulled-out part of the band (leaves the socket toward the surgeon)
      if (B.cut != null && hd(hs, B.cut) < 0.01) {
        const c = pt(sg, S.sEq, CT + T / 2); if (sg > 0) A.cut = c;
        if (B.p > 0 && !(B.removed && PL.close > 0)) { const a = pt(sg, S.sEq - 0.4, CT + T + 0.3), sp = [a, [a[0] + sg * 2.5, a[1] - 5], [a[0] + sg * 3.2, a[1] - 40]];
          top.push(`<path d="${pstr(sp)}" fill="none" stroke="${COL.bandL}" stroke-width="${F(T + 0.25)}" stroke-linecap="round"/><path d="${pstr(sp)}" fill="none" stroke="${COL.band}" stroke-width="${F(T)}"/>`);
          if (sg > 0) A.pulled = [a[0] + sg * 2.6, a[1] - 7]; }
      }
      if (B.endH != null && !B.removed && B.p > 0 && hd(hs, B.endH) < 0.01 && sg > 0) A.bandEnd = pt(sg, S.sEq, CT + T / 2);
    }
    // scleral shell (collapsed, fibrous inside), drawn whole
    const outer = [], inner = []; for (let s = 0; s <= S.sEnd + 1e-9; s += 0.1) { outer.push(pt(1, s, 0)); inner.push(pt(1, s, -P.SCL_T)); }
    const ring = outer.concat(outer.slice().reverse().map(p => [-p[0], p[1]])), ringIn = inner.concat(inner.slice().reverse().map(p => [-p[0], p[1]]));
    o.splice(2, 0, `<path d="${pstr(ring)}Z${pstr(ringIn)}Z" fill="${COL.scl}" fill-rule="evenodd" stroke="${COL.sclL}" stroke-width="0.12"/>`,
      `<path d="${pstr(ringIn)}Z" fill="${COL.fib}" stroke="none"/>` + [[-3, -1], [2, 1.5], [-1, 3], [4, -2], [0, -3.5], [-5, 2]].map(q => `<path d="M${q[0] - 0.8} ${q[1]}q0.8 -0.6 1.6 0" fill="none" stroke="#c4ab8f" stroke-width="0.12"/>`).join(''));
    // evisceration closure of the shell (mattress suture seam at the front, schematic)
    const fy = -P.SHELL_B; top.push(`<path d="M-1.2 ${F(fy + 0.25)}h2.4M-0.7 ${F(fy - 0.15)}v0.8M0.7 ${F(fy - 0.15)}v0.8" stroke="#55606b" stroke-width="0.12" fill="none"/>`);
    A.shell = pt(1, 2.5, -P.SCL_T / 2); A.fibrous = [0, 0.8]; A.seam = [0, fy];
    // conformer: thin clear shell in front of the conjunctiva, edges in the fornices
    const confIn = (sd, s) => sd.conjOut(s) + 0.35;                    // conformer inner surface: 0.35 mm in front of the conjunctiva
    if (st.conformer) {
      const sR = sides[1], sL = sides[-1], cIn = [], cOut = [];
      const half = (sd, sg) => { const a = [], b = []; for (let s = 0; s <= S.sFor - 0.9; s += 0.1) { const off = confIn(sd, s); a.push(pt(sg, s, off)); b.push(pt(sg, s, off + 0.5)); } return [a, b]; };
      const [aR, bR] = half(sR, 1), [aL, bL] = half(sL, -1);
      cIn.push(...aL.reverse(), ...aR); cOut.push(...bL.reverse(), ...bR);
      top.push(poly(cIn.concat(cOut.reverse()), COL.conf, COL.confL, 0.1));
      A.conformer = pt(1, 3, sR.conjOut(3) + 0.6); A.confIn = s => confIn(sR, s);
    }
    const svg = o.join('') + top.join('');
    const orient = `左眼 OS　子午切面經 ${fmtH(h)} 點：右＝${fmtH(h)} 點（${hourName(h)}）、左＝${fmtH(h + 6)} 點（${hourName(h + 6)}）；上＝前（術者）、下＝後（眶尖）`;
    return { svg, A, sides, S, band: B, orient, h };
  }

  // ===================================================================== surgeon's view (front)
  function front(opt) {
    const st = opt.state || {}, id = opt.id || 'sk', S = profile(), PL = plan(st), B = PL.B, W = P.BAND_W, A = {}, o = [];
    const rB = S.sEq, [FX, FY] = P.FISS, mus = muscles();
    const arc = (h0, h1, r, n = 90) => { const a = []; for (let i = 0; i <= n; i++) a.push(fpt(h0 + (h1 - h0) * i / n, r)); return a; };
    const sector = (h0, h1, r0, r1) => arc(h0, h1, r1).concat(arc(h0, h1, r0).reverse());
    const sp = d => `<path d="${d}"`;
    // palpebral conjunctiva (fissure), bulbar conjunctiva over the shell dome (shading = the shell bulge)
    o.push(`<defs><radialGradient id="${id}-dome"><stop offset="0" stop-color="#f6d3cd"/><stop offset="0.75" stop-color="#eebdb6"/><stop offset="1" stop-color="#d99a94"/></radialGradient>`
      + `<clipPath id="${id}-fis"><ellipse cx="0" cy="0" rx="${FX}" ry="${FY}"/></clipPath></defs>`);
    o.push(`<rect x="-80" y="-80" width="160" height="160" fill="${COL.skin}"/>`);
    o.push(`<g clip-path="url(#${id}-fis)"><ellipse cx="0" cy="0" rx="${FX}" ry="${FY}" fill="${COL.pconj}"/>`);
    o.push(`<circle cx="0" cy="0" r="${F(S.sFor)}" fill="url(#${id}-dome)" stroke="${COL.conjL}" stroke-width="0.12"/>`);
    o.push(`<circle cx="0" cy="0" r="${F(rB - W / 2 - 0.4)}" fill="none" stroke="#b98a83" stroke-width="0.12" stroke-dasharray="0.5 0.5" opacity="0.8"/>`);
    // muscles (under the conjunctiva: faint, dashed)
    const musPoly = (m, r0, r1) => { const d = fdir(m), e = [-d[1], d[0]], w = P.MUS_W / 2; return [[d[0] * r0 - e[0] * w, d[1] * r0 - e[1] * w], [d[0] * r1 - e[0] * w, d[1] * r1 - e[1] * w], [d[0] * r1 + e[0] * w, d[1] * r1 + e[1] * w], [d[0] * r0 + e[0] * w, d[1] * r0 + e[1] * w]]; };
    const r1m = S.sLeave + 1.5;
    for (const [m] of mus) { o.push(sp(pstr(musPoly(m, S.sIns, r1m)) + 'Z') + ` fill="${COL.mus}" fill-opacity="0.16" stroke="${COL.musL}" stroke-width="0.12" stroke-dasharray="0.6 0.4"/>`);
      const q = musPoly(m, S.sIns, S.sIns); o.push(sp(pstr([q[0], q[3]])) + ` stroke="${COL.musL}" stroke-width="0.3" opacity="0.6"/>`); }
    A.rect = {}; A.ins = {}; for (const [m, , en] of mus) { A.rect[en] = fpt(m, S.sEq + 3.5); A.ins[en] = fpt(m, S.sIns); }
    // band (hidden: dashed edges) and sutures (hidden: dashed)
    const bandShape = () => { if (B.removed) return ''; const [a, b] = B.arcH, n = Math.max(8, Math.round((b - a) * 30));
      return pstr(sector(a, b, rB - W / 2, rB + W / 2).length ? sector(a, b, rB - W / 2, rB + W / 2) : []) + 'Z'; };
    if (!B.removed) { const [a, b] = B.arcH;
      for (const r of [rB - W / 2, rB + W / 2]) o.push(sp(pstr(arc(a, b, r, 240))) + ` fill="none" stroke="${COL.bandL}" stroke-width="0.14" stroke-dasharray="0.7 0.5"/>`);
      A.band = fpt(PL.ex ? PL.ex.h + 6 : 7, rB); }
    const sutShape = (h, cutS) => { const a = hourSpan(P.SUT_GAP / 2), r0 = rB - W / 2 - P.SUT_BITE, r1 = rB + W / 2 + P.SUT_BITE, out = [];
      for (const dh of [-a, a]) { if (cutS) { out.push([fpt(h + dh, r0), fpt(h + dh, rB - 0.5)], [fpt(h + dh, rB + 0.5), fpt(h + dh, r1)]); } else out.push([fpt(h + dh, r0), fpt(h + dh, r1)]); }
      return out; };
    const sutBites = h => { const a = hourSpan(P.SUT_GAP / 2); return [arc(h - a, h + a, rB - W / 2 - P.SUT_BITE, 8), arc(h - a, h + a, rB + W / 2 + P.SUT_BITE, 8)]; };
    const sutList = P.SUT_H.filter(h => !(B.removed && PL.sutIsCut(h)));
    for (const h of sutList) { for (const l of sutShape(h, PL.sutIsCut(h))) o.push(sp(pstr(l)) + ` stroke="${COL.sut}" stroke-width="0.16" stroke-dasharray="0.5 0.35" opacity="0.8"/>`); }
    A.sut = {}; for (const h of P.SUT_H) A.sut[h] = fpt(h, rB);
    // what is visible: the opened sector and the exposure hole (and the band under the hooked rectus)
    const vis = [];
    if (PL.op && PL.close < 1) { const h0 = PL.op.h0 + PL.opSpan * PL.close, h1 = PL.op.h0 + PL.opSpan; if (h1 - h0 > 1e-6) vis.push(sector(h0, h1, S.sOpen, S.sFor + 0.6)); }
    if (PL.ex && !PL.closed(PL.ex.h) && !PL.isOpen(PL.ex.h)) { const a = hourSpan((PL.ex.len || 6) / 2); vis.push(sector(PL.ex.h - a, PL.ex.h + a, S.hole[0], S.hole[1])); }
    const hookM = st.hook != null ? mus.find(m => hd(m[0], st.hook) < 0.01) : null;
    if (vis.length) {
      o.push(`<clipPath id="${id}-vis">${vis.map(v => sp(pstr(v) + 'Z') + '/>').join('')}</clipPath>`);
      o.push(vis.map(v => sp(pstr(v) + 'Z') + ` fill="${COL.wound}" stroke="${COL.conjL}" stroke-width="0.15"/>`).join(''));
      o.push(`<g clip-path="url(#${id}-vis)">`);
      o.push(`<circle cx="0" cy="0" r="${F(rB - W / 2 - P.CAPS_T - 0.3)}" fill="none" stroke="${COL.sclL}" stroke-width="0.1" opacity="0.5"/>`);
      if (!B.removed) o.push(sp(bandShape()) + ` fill="${COL.band}" stroke="${COL.bandL}" stroke-width="0.14"/>`);
      for (const h of sutList) { for (const l of sutShape(h, PL.sutIsCut(h))) o.push(sp(pstr(l)) + ` stroke="${COL.sut}" stroke-width="0.26" stroke-linecap="round"/>`);
        if (!PL.sutIsCut(h) && !B.removed) { const k = fpt(h + hourSpan(P.SUT_GAP / 2), rB + 0.2); o.push(`<circle cx="${F(k[0])}" cy="${F(k[1])}" r="0.32" fill="${COL.sut}"/>`); } }
      for (const [m] of mus) if (!hookM || m !== hookM[0]) o.push(sp(pstr(musPoly(m, S.sIns, r1m)) + 'Z') + ` fill="${COL.mus}" stroke="${COL.musL}" stroke-width="0.14"/>`);
      o.push('</g>');
      // retracted conjunctival edge
      if (PL.op && PL.close < 1) { const h0 = PL.op.h0 + PL.opSpan * PL.close, h1 = PL.op.h0 + PL.opSpan; o.push(sp(pstr(arc(h0, h1, S.sOpen, 60))) + ` fill="none" stroke="${COL.conjL}" stroke-width="0.45"/>`); A.open = fpt((h0 + h1) / 2, S.sOpen); }
    }
    // hooked rectus: lifted (translucent so the band below shows) with the hook passing under it
    if (hookM) { const m = hookM[0], d = fdir(m), e = [-d[1], d[0]], rH = S.sEq - 1.0, w = P.MUS_W / 2;
      o.push(sp(pstr(musPoly(m, S.sIns, r1m)) + 'Z') + ` fill="${COL.mus}" fill-opacity="0.45" stroke="${COL.musL}" stroke-width="0.18"/>`);
      if (!B.removed && B.has(m)) { const a = hourSpan(w), seg = sector(m - a, m + a, rB - W / 2, rB + W / 2); o.push(sp(pstr(seg) + 'Z') + ` fill="${COL.band}" fill-opacity="0.75" stroke="${COL.bandL}" stroke-width="0.12"/>`); }
      const c = [d[0] * rH, d[1] * rH], heel = [c[0] - e[0] * (w + 1.2), c[1] - e[1] * (w + 1.2)], tip = [c[0] + e[0] * (w + 0.9), c[1] + e[1] * (w + 0.9)];
      const handle = [heel, [heel[0] - e[0] * 9 + d[0] * 9, heel[1] - e[1] * 9 + d[1] * 9], [heel[0] - e[0] * 16 + d[0] * 16, heel[1] - e[1] * 16 + d[1] * 16]];
      o.push(sp(pstr(handle)) + ` fill="none" stroke="${COL.hook}" stroke-width="0.8" stroke-linecap="round"/>`);
      o.push(sp(pstr([heel, tip])) + ` stroke="${COL.hook}" stroke-width="0.55" stroke-dasharray="0.8 0.5"/>`);
      o.push(`<circle cx="${F(tip[0])}" cy="${F(tip[1])}" r="0.45" fill="${COL.hook}"/>`);
      A.hook = tip; A.hooked = fpt(m, S.sEq + 3.5); }
    // granulation around the exposure (shrinks with debridement)
    if (PL.ex && PL.isExpo(PL.ex.h) && PL.gran > 0.01) { const a = hourSpan((PL.ex.len || 6) / 2), g = PL.gran, bl = [];
      for (let i = 0; i <= 8; i++) { const hh = PL.ex.h - a + 2 * a * i / 8; bl.push([fpt(hh, S.hole[1] + 0.3), 0.8 + 0.35 * ((i * 7) % 3) / 2], [fpt(hh, S.hole[0] - 0.3), 0.7 + 0.3 * ((i * 5) % 3) / 2]); }
      for (const r of [S.hole[0] + 0.2, S.sEq, S.hole[1] - 0.2]) for (const s of [-1, 1]) bl.push([fpt(PL.ex.h + s * (a + 0.12), r), 0.85]);
      o.push(bl.map(([c, r]) => `<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(r * g)}" fill="${COL.gran}" stroke="${COL.granL}" stroke-width="0.08"/>`).join(''));
      A.gran = fpt(PL.ex.h + a + 0.12, S.hole[1] - 0.2); }
    if (PL.ex) A.expose = fpt(PL.ex.h, rB);
    // conjunctival closure (stitches across the incision)
    if (PL.op && PL.close > 0) { const h0 = PL.op.h0, h1 = PL.op.h0 + PL.opSpan * PL.close, n = Math.max(1, Math.round((h1 - h0) * 3));
      o.push(sp(pstr(arc(h0, h1, S.sOpen, 40))) + ` fill="none" stroke="${COL.conjL}" stroke-width="0.18"/>`);
      for (let i = 0; i <= n; i++) { const hh = h0 + (h1 - h0) * i / n; o.push(sp(pstr([fpt(hh, S.sOpen - 0.7), fpt(hh, S.sOpen + 0.7)])) + ` stroke="#1d2733" stroke-width="0.16"/>`); }
      A.close = fpt((h0 + h1) / 2, S.sOpen); }
    // sutures that still hold the band while it is pulled
    for (const h of B.stuck) { const c = fpt(h, rB); o.push(`<circle cx="${F(c[0])}" cy="${F(c[1])}" r="2.3" fill="none" stroke="${COL.stuck}" stroke-width="0.3"/>`); }
    if (B.stuck.length) A.stuck = fpt(B.stuck[0], rB);
    o.push('</g>');
    // lids around the speculum-opened fissure
    o.push(`<ellipse cx="0" cy="0" rx="${FX}" ry="${FY}" fill="none" stroke="${COL.skinL}" stroke-width="0.6"/>`);
    A.lid = [FX * 0.62, FY + 3]; A.fornix = fpt(10.5, S.sFor + 0.6); A.conj = fpt(8, S.sIns - 2); A.shell = fpt(7.3, 3);
    // conformer (clear shell filling the fornices; removed before the speculum goes in)
    if (st.conformer) { o.push(`<circle cx="0" cy="0" r="${F(S.sFor + 0.4)}" fill="${COL.conf}" stroke="${COL.confL}" stroke-width="0.3"/><circle cx="0" cy="0" r="${F(S.sFor - 0.6)}" fill="none" stroke="#fff" stroke-width="0.25" opacity="0.7"/>`
      + `<path d="M-6 -9q4 -2.5 9 -1.2" stroke="#fff" stroke-width="0.7" fill="none" opacity="0.8" stroke-linecap="round"/>`); A.conformer = fpt(5.2, S.sFor - 1); }
    else { // wire speculum: blades at the two lid margins, arms joining on the temporal side
      const t = temporalH(), sideX = fdir(t)[0] < 0 ? -1 : 1, bl = sg => { const a = []; for (let k = -0.7; k <= 0.7001; k += 0.05) a.push([FX * Math.sin(k) * 0.98, sg * FY * Math.cos(k) * 0.98]); return a; };
      for (const sg of [-1, 1]) { const b = bl(sg), end = b[sideX < 0 ? 0 : b.length - 1];
        o.push(sp(pstr(b)) + ` fill="none" stroke="#8d98a4" stroke-width="0.7" stroke-linecap="round"/>` + sp(pstr([end, [sideX * (FX + 4), sg * 3], [sideX * (FX + 9), 0]])) + ` fill="none" stroke="#8d98a4" stroke-width="0.55"/>`); }
      A.speculum = [sideX * (FX + 4), 3]; }
    // the pulled-out part of the band (radially out of the socket, over the lid and off the panel)
    if (B.cut != null) A.cut = fpt(B.cut, rB);
    if (B.endH != null && !B.removed && B.p > 0) A.bandEnd = fpt(B.endH, rB);
    let outPts = [];
    if (B.cut != null && B.p > 0) { const len = B.p * B.L, d = fdir(B.cut); for (let i = 0; i <= 40; i++) { const r = rB + len * i / 40; outPts.push([d[0] * r, d[1] * r]); }
      if (!(B.removed && PL.close > 0)) o.push(sp(pstr(outPts)) + ` fill="none" stroke="${COL.bandL}" stroke-width="${F(W + 0.3)}"/>` + sp(pstr(outPts)) + ` fill="none" stroke="${COL.band}" stroke-width="${F(W)}"/>`);
      A.pulled = fpt(B.cut, rB + Math.min(len, P.FISS[0] + 3 - rB)); }
    if (B.cut != null && !B.removed) { const c = A.cut, d = fdir(B.cut), e = [-d[1], d[0]]; o.push(sp(pstr([[c[0] - d[0] * 2.4 + e[0] * 0.2, c[1] - d[1] * 2.4 + e[1] * 0.2], [c[0] + d[0] * 2.4 + e[0] * 0.2, c[1] + d[1] * 2.4 + e[1] * 0.2]])) + ` stroke="${COL.stuck}" stroke-width="0.22" stroke-dasharray="0.4 0.3"/>`); }
    A.hours = {}; for (const hh of [12, 3, 6, 9]) A.hours[hh] = fpt(hh, Math.max(FX, FY) + 2.5);
    const orient = `左眼 OS　術者坐 12 點：下＝12 點、右＝9 點（${hourName(9)}）、左＝3 點（${hourName(3)}）`;
    return { svg: o.join(''), A, band: B, outPts, orient, S, rB };
  }
  // a point of the section (side by sign of x) → the same point on the front map (same clock hour, same s)
  function secToFront(p, h) { const S = profile(), q = [Math.abs(p[0]), p[1]], s = S.nearestS(q), hs = p[0] >= 0 ? h : h + 6; return fpt(hs, s); }
  return { P, sec, front, band, stuckBy, profile, plan, fpt, fdir, hourOf, hourName, fmtH, hd, clk, muscles, muscleAt, hourSpan, secToFront, Rb };
})();
if (typeof module !== 'undefined') module.exports = SOCKET;
