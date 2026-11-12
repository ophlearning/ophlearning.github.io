// Posterior-segment view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the eyelid views only; these follow
// the same camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }) for the
// posterior-segment model (videos/models/posterior, CARD.md). Kept in this video folder so kit.js stays unchanged; check.js loads this file
// in node too (the states, windows and drawing constants below are what the video draws, and what its model checks look at).
//   VP.fundus(st, W, H, win, id)            fundus chart, examiner's drawing (12 up; OS 3 o'clock temporal on the right)
//   VP.sec(st, W, H, win, id, o)            meridional section through clock o.h (default 11: right = 11, left = 5), anterior up
//   VP.head(st, W, H, win, id)              head-position view: section through the tear with gravity straight down
//   VP.ext(st, W, H, win, id)               microscope view from above with the trocars (surgeon at 12)
//   VP.port(st, W, H, win, id, portId)      cross-section of a trocar's tunnel (wall left–right, inside down; the tunnel runs to the right)
//   VP.wide(st, W, H, win, id)              surgeon's wide-angle view, with the cannulas seen from inside (shaft from the pars plana to the tip)
//   VP.chart(h, r)                          chart mm (screen: y down) of clock hour h at r mm from the foveola
const VP = (() => {
  const P = POSTERIOR, G = GLOBE, D2R = Math.PI / 180;
  const cam = (win, W, H) => { const k = Math.min(W / win.w, H / (win.h || win.w * H / W)), x0 = win.x, y0 = win.y;
    return { k, tf: `scale(${k}) translate(${-x0} ${-y0})`, P: p => [(p[0] - x0) * k, (p[1] - y0) * k] }; };
  const mapA = (A, Pf) => { const r = {}; for (const [n, v] of Object.entries(A)) if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') r[n] = Pf(v); return r; };
  const wrap = (c, r, pre = '') => ({ svg: `${pre}<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r });
  // chart mm (screen orientation: x toward 3 o'clock, y down) of a 3D point, and of a clock hour at r mm from the foveola
  const chartXY = p => { const c = P.chart3(p); return [c[0], -c[1]]; };
  const chart = (h, r) => { const [cx, cy] = G.clockDir(h); return [r * cx, -r * cy]; };

  // ---------------------------------------------------------------- the states drawn in this video (病例 = POSTERIOR.CASE: OS, RRD, HST at 11, PVD)
  const ST = {
    normal: { eye: 'OS' },                                                     // before the detachment is shown (1-1, line 0)
    rdOnly: { eye: 'OS', rd: { amt: 1 }, pvd: 1 },                             // the detachment, tear not shown yet (1-1, line 1)
    rrd: Object.assign({}, P.CASE),                                            // the case
    sit: Object.assign({}, P.CASE, { head: { pose: 'sit' } }),                 // the case sitting upright (1-2: the detachment follows gravity)
    setup: Object.assign({}, P.CASE, { troc: true }),                          // three ports (1-4: 23G three-port PPV; clock hours 示意)
  };
  const SEC2_H = 9;                   // 2-1: horizontal section, right = 9 (OS nasal), left = 3 (temporal), seen from 12 like the surgeon
  const INF_H = 4.5;                  // 2-2: section through the infusion port (OS inferotemporal; Tei 2005; the exact clock hour 示意)
  const TROC_RANGE = [3, 4];          // trocars 3–4 mm from the limbus depending on the lens (EyeWiki 2026a); phakic 4 mm (Duker 2021)
  const ORA_LBL = { 3: '7.6', 9: '7.0' };   // limbus → ora written on screen: temporal 7.6, nasal 7.0 mm (Li 2025: 7.58, 6.96; narration 2-1 line 2)
  const CJ_PUSH = 2;                  // conjunctiva displaced before the trocar goes in; 示意 (Warrier 2008's about 2 mm is for 25G; not shown as a number); portOut's cj
  // chapter 2 (set-up). The port shown going in (2-1) is the infusion port, the one 2-2 is about; the other two stay in place.
  const PORT = 'it';
  const portSt = (ins, out, cj) => Object.assign({}, P.CASE, { troc: P.trocarsFor('OS').map(t => t.id === PORT ? Object.assign({}, t, { ins, out, cj }) : t) });
  const infSt = (tip, extra) => Object.assign({}, P.CASE, extra || {}, { troc: P.trocarsFor('OS').map(t => t.inf ? Object.assign({}, t, { tip }) : t) });
  Object.assign(ST, {
    portPush: portSt(0, 0, undefined),             // 2-1 line 4: the conjunctiva pushed aside, the trocar not in yet (no opening yet)
    portIn: portSt(0, 0, 0),                        // 2-1 line 4: the blade (drawn by draw.js along the tunnel line) through the pushed conjunctiva: openings aligned
    portOut: portSt(1, 1, -CJ_PUSH),                // 2-1 line 5: trocar out, the conjunctiva slid back (its opening CJ_PUSH mm from the scleral one)
    infSub: infSt('sub'),                           // 2-2 line 3: 錯誤示範, infusion tip under the retina
    infAir: infSt('supra', { vit: { cut: 1, shave: 1 }, gas: 0.5 }),   // 2-2 line 5: 示意, air through a slipped cannula into the suprachoroidal space (air–fluid exchange after the vitrectomy)
  });
  // chapter 3 (reading the picture): the surgeon's wide-angle view of the case, inverter on and off; the assistant pressing at 11 o'clock.
  // Where and how deep the press goes is the model's 示意 (PRESET.depress: 9.3 mm from the limbus, 1.6 mm deep; looking toward 11 by 32°).
  const DEP_H = 11;                   // 3-2: 主刀說「壓 11 點」 (the tear's clock hour, 病例)
  const DEP = Object.assign({}, P.PRESET.depress.dep, { h: DEP_H }), LOOK_DEP = Object.assign({}, P.PRESET.depress.look, { h: DEP_H });
  const DEP_STEPS = 6;                // the depressor goes in over 6 steps (each step is a new section)
  Object.assign(ST, {
    view3: Object.assign({}, P.CASE, { surgeon: 12, inverter: true }),       // 3-1, 3-2: the case seen straight through the wide-angle system, inverter on
    view3Off: Object.assign({}, P.CASE, { surgeon: 12, inverter: false }),   // the same, inverter off (the inverted image)
    dep: Object.assign({}, P.CASE, { dep: DEP }),                            // 3-1 line 4, 3-2: pressing at 11 o'clock (the section)
  });
  ST.depOn = Object.assign({}, ST.dep, { surgeon: 12, inverter: true, look: LOOK_DEP });   // the same press seen in the wide view, looking toward 11
  ST.depOff = Object.assign({}, ST.depOn, { inverter: false });                             // 3-2 line 5: the same press, inverter off
  // a dep state (section or wide view) with the depressor k (0 → 1) of the way in, in DEP_STEPS steps: both views of a frame take the same k
  const depStep = (st, k) => { const n = Math.round(Math.max(0, Math.min(1, k)) * DEP_STEPS) / DEP_STEPS;
    return Object.assign({}, st, { dep: n > 0 ? Object.assign({}, st.dep, { depth: st.dep.depth * n }) : null }); };
  // a wide-view state turned toward look.h by the fraction k of look.deg (8 steps), for the turn toward 11 in 3-2
  const lookStep = (st, look, k) => Object.assign({}, st, { look: { h: look.h, deg: look.deg * Math.round(Math.max(0, Math.min(1, k)) * 8) / 8 } });
  // 3-1: the light path of the wide-angle system (示意, not to scale) in the 11–5 section of the case (mm: x toward 11, y down = posterior).
  // A retinal point on each side, OPT.s mm from the limbus (about 30° from the viewing axis); the eye sends its light out through the pupil as a
  // parallel beam (direction: from the retinal point through the nodal point, the model's wide-angle viewpoint); the wide-angle lens, OPT.gap mm
  // above the cornea with focal length OPT.f (both 示意), focuses each beam to a point of the real image above the lens. The inverter turns the
  // picture back (erect). Returns the points of every ray: retina → pupil → lens → image.
  const OPT = { s: 22, gap: 6, f: 11, lensR: 10, pupilX: [-2.6, 0, 2.6] };
  function optics(st = ST.rrd, o = {}) {
    const Gm = P.geom(st), pl = G.planes.meridian(SEC_H), to = p => G.toPlane(pl, p), kp = P.keyPoints(), O = Object.assign({}, OPT, o);
    const nod = to([0, 0, kp.VZ]), apex = to([0, 0, kp.apexZ]), pupY = to([0, 0, P.IRIS.pm[0]])[1], lensY = apex[1] - O.gap, imgY = lensY - O.f;
    const out = { apex, nod, pupY, lensY, imgY, R: {}, I: {}, E: {}, rays: {} };
    for (const h of [SEC_H, ((SEC_H + 5) % 12) + 1]) {
      const R = to(Gm.ret(h, O.s, 1)), d0 = [nod[0] - R[0], nod[1] - R[1]], dl = Math.hypot(...d0), d = [d0[0] / dl, d0[1] / dl];
      const I = [O.f * d[0] / -d[1], imgY];
      out.R[h] = R; out.I[h] = I; out.E[h] = [-I[0], imgY];   // E: the inverter's output (the image turned back), drawn by draw.js higher up
      out.rays[h] = O.pupilX.map(x => { const q = [x, pupY], t = (lensY - q[1]) / d[1], L = [q[0] + d[0] * t, lensY]; return [R, q, L, I]; });
    }
    return out;
  }
  // chapter 4 (core vitrectomy, TA, PVD; the cutter near the detached retina). Instruments only through the case's trocars (P.trocarsFor('OS')):
  // the vitrector in the superonasal 10:30 port, the light pipe in the superotemporal 1:30 port (as PRESET.core and chapters 1–3: the surgeon at
  // 12 is right-handed, the 10:30 port is on his right). Tip positions, the amount cut, the PVD steps and the suction demonstration are 示意.
  const c01 = x => Math.max(0, Math.min(1, x)), mix3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const SEC4_H = 10.5;                // 4-1: the section through the vitrector's port (right = 10:30 superonasal; left = 4:30 inferotemporal, the infusion)
  const inPl4 = (r, z) => { const [cx, cy] = G.clockDir(SEC4_H); return [r * cx, r * cy, z]; };   // a point of that section: r mm toward 10:30, z anterior
  const LIGHT4 = { kind: 'light', port: 'st', tip: inPl4(-2.6, -3.4) };   // the light pipe's tip in the section (it comes in from the viewer's side, 1:30)
  const CUT4 = 0.85;                  // core vitrectomy: the gel left within about 7 mm of the retina (示意; the model's shell = lerp(30, 3, cut))
  const CORE_STEPS = 4, CORE_TIPS = [inPl4(1.6, -0.6), inPl4(-1.4, -2.6), inPl4(1.0, -4.6), inPl4(-0.8, -6.0), inPl4(0.4, -3.2)];   // the cutter sweeping the centre
  const PVD_STEPS = 6, PVD_TIP = [inPl4(-0.6, -9.4), inPl4(-0.6, -7.2)];   // 4-1 line 3: the cutter at the posterior pole, lifting as the hyaloid comes off
  const st4 = o => Object.assign({}, P.CASE, { troc: true }, o), vitr = tip => ({ kind: 'vitrector', port: 'sn', tip });
  // core vitrectomy k (0 → 1) of the way in CORE_STEPS steps, in the case (PVD present: P.CASE.pvd = 1); ta 0 or 1
  const coreStep = (k, ta = 0) => { const n = Math.round(c01(k) * CORE_STEPS); return st4({ vit: { cut: CUT4 * n / CORE_STEPS }, ta, inst: [vitr(CORE_TIPS[n]), LIGHT4] }); };
  // 4-1 line 3 (示意: an eye whose posterior hyaloid is still attached): the PVD k (0 → 1) of the way in PVD_STEPS steps, after the core and the TA
  const pvdStep = k => { const n = Math.round(c01(k) * PVD_STEPS) / PVD_STEPS; return st4({ vit: { cut: CUT4 }, ta: 1, pvd: n, inst: [vitr(mix3(PVD_TIP[0], PVD_TIP[1], n)), LIGHT4] }); };
  // 4-2: the cutter near mobile detached retina (superotemporal, behind the equator, bullous in the model; 示意), approaching in 3 steps (mm in front
  // of the detached retina), then the retina sucked toward its port in SUCK_STEPS steps (錯誤示範). Both views of a frame take the same state.
  const SUCK_AT = { h: 1, s: 16 }, E42 = [2.6, 1.8, 1.0], SUCK_STEPS = 3;
  const LIGHT42 = { kind: 'light', port: 'st', tip: [4.5, 2.5, -1] };   // 2 mm off PLANE42 on one side: it does not cross or glow in the 4-2 section
  // the lift that brings the retina's inner surface up to the cutter's port (the edge of the shaft), on the wall normal under the port
  function suckAt(st, k) { const Gm = P.geom(st), I = P.instGeom(Gm, st.inst[0]), q = I.portAt, h = G.clockOf(q[0], q[1]), s0 = P.wallOf(q[2], Math.hypot(q[0], q[1])).s;
    let s = s0, best = 9; for (let x = s0 - 1.5; x <= s0 + 1.5; x += 0.001) { const d = G.len(G.cross(G.sub(q, P.P3(h, x, 0)), P.N3(h, x))); if (d < best) { best = d; s = x; } }   // the wall point whose normal passes the port
    const lift = G.len(G.sub(q, Gm.ret(h, s, 1))) - P.N.shaft / 2 + 0.05; return { h, s: +s.toFixed(3), amt: lift * k, w: 1.0 }; }
  // the tip is fixed in 3D from the unsucked retina (e mm in front of it), so the cutter does not move when the retina comes up
  const st42 = (e, k = 0) => { const s0 = st4({ vit: { cut: CUT4 }, ta: 1, inst: [vitr({ h: SUCK_AT.h, s: SUCK_AT.s, e }), LIGHT42] });
    const st = Object.assign({}, s0, { inst: [vitr(P.instTip(P.geom(s0), s0.inst[0]).map(v => +v.toFixed(4))), LIGHT42] });
    const n = Math.round(c01(k) * SUCK_STEPS) / SUCK_STEPS; if (n > 0) st.suck = suckAt(st, n); return st; };
  // 4-2 line 1: the pull on the retina, 示意 of the direction only (Teixeira 2010, porcine eyes: more with higher vacuum and closer to the retina,
  // less with a higher cut rate). Inputs 0 → 1 without units (no values on screen); output 0 → 1 = the arrow's length
  const traction = (vac, dist, cut) => c01(vac) * (1 - 0.7 * c01(dist)) * (1 - 0.65 * c01(cut));
  const distOf = e => 0.1 + 0.9 * (e - E42[2]) / (E42[0] - E42[2]);   // the distance bar from the tip's distance to the retina (示意 scale)
  const TR42 = { s0: { vac: 0.3, e: 1.8, cut: 0.2 }, s1: { vac: 1, e: 1.8, cut: 0.2 }, s2: { vac: 1, e: 1.0, cut: 0.2 }, s3: { vac: 1, e: 1.0, cut: 1 },   // line 1: vacuum up, closer, cut rate up
    low: { vac: 0.3, e: 1.0, cut: 1 } };                                                                                                          // line 2: high cut rate, low vacuum
  Object.assign(ST, { core4: coreStep(1), ta4: coreStep(1, 1), pvd0: pvdStep(0), pvd1: pvdStep(1), near42: st42(E42[2]), suck42: st42(E42[2], 1) });
  // 4-2: the plane through the cutter's shaft and the wall normal at SUCK_AT (screen down = outward, the wall at the bottom; the shaft up to the right).
  // Every approach step's tip lies on that normal line, so the whole shaft is in the plane at every step.
  const PLANE42 = (() => { const st = st42(E42[2]), Gm = P.geom(st), I = P.instGeom(Gm, st.inst[0]), foot = Gm.ret(SUCK_AT.h, SUCK_AT.s, 1), V = P.N3(SUCK_AT.h, SUCK_AT.s);
    const d = G.sub(I.port.pivot, foot), U = G.unit(G.sub(d, V.map(v => v * G.dot(d, V)))); return { O: foot, U, V, kind: 'inst' }; })();
  // drawing constants checked by check.js against the case or the literature
  const RD_ARC = [11.5, 17];          // the detachment's extent drawn round the chart: 11:30 clockwise via 12 and 3 to 5 o'clock (病例)
  const LINCOFF = { c: 12, half: 1.5 };   // superior detachment crossing 12: primary break within 1.5 clock hours of 12 (Yoshida 2018)
  const ST_H = 1.5;                   // where the 「superotemporal」 label points in 1-3 (OS: 1:30)
  const SEC_H = 11;                   // the section of chapter 1: through the 11 o'clock tear (right = 11, left = 5)

  // ---------------------------------------------------------------- windows (mm)
  const WIN = {
    chart: { x: -45.8, y: -31, w: 91.6 },                  // whole fundus chart in a dual panel
    sec: { x: -20.2, y: -13.6, w: 40.4 },                  // whole eye, 11–5 section
    secT: { x: -13.6, y: -13.6, w: 27.2, h: 27.33 },       // where the section is computed (the rest of the panel is background)
    mac: { x: -7.2, y: -3.2, w: 13 },                      // fundus chart around the macula (1-3)
    fov: { x: -5, y: 7.75, w: 10 },                        // section around the fovea (1-3)
    fovT: { x: -5, y: 7.75, w: 10, h: 6.77 },
    tear: { x: -14.9, y: -20.6, w: 11 },                   // fundus chart around the 11 o'clock tear (1-4)
    head: { x: -19.5, y: -13.6, w: 40.4 },                 // head-position view (1-2)
    headT: { x: -13.5, y: -13.5, w: 27, h: 27 },
    ext: { x: -12.6, y: -16.9, w: 25.2 },                  // microscope view (1-4), in the right half of the panel (306 px)
    sec2: { x: -15.6, y: -14.6, w: 31.2 },                 // 2-1: anterior two thirds of the horizontal (9–3) section, room outside the wall for the distance marks
    sec2T: { x: -13.4, y: -14.6, w: 26.8, h: 21.2 },
    port: { x: -3.2, y: -1.95, w: 6.4 },                   // 2-1: tunnel cross-section, 6.4 mm wide (wall at the top, vitreous below)
    extF: { x: -18.5, y: -12.5, w: 37 },                   // 2-1, 2-2: microscope view filling a panel (the ora ring, about 11 mm from the centre, fits)
    extZ: { x: -11.4, y: -9.6, w: 10 },                    // 2-1 lines 4–5: microscope view around the infusion port (upper left; its entry at −6.3, −6.3)
    inf: { x: -20.2, y: -13.6, w: 40.4 },                  // 2-2: whole eye, 4:30–10:30 section
    infT: { x: -13.6, y: -13.6, w: 27.2, h: 27.33 },
    infZ: { x: 3.0, y: -10.3, w: 15 },                     // 2-2 lines 2–5: the infusion port, the ora and the detached retina behind it (labels on the right)
    infZT: { x: 3.0, y: -10.3, w: 10.6, h: 10.2 },
    wide: { x: -29.6, y: -20, w: 59.2 },                   // 2-2: whole wide-angle field
    wide3: { x: -34.93, y: -23.63, w: 69.86 },             // chapter 3: whole wide-angle field (165 px) with room for the clock numbers round it
    wideS: { x: -27.58, y: -38.99, w: 55.16 },             // 3-1 lines 2–3: one of two fields side by side (in a 290 px wide half; radius 100 px)
    opt: { x: -43.9, y: -46.2, w: 87.8 },                  // 3-1: the light path above the whole 11–5 section (eye at the bottom of the panel)
    secD: { x: -13.6, y: -21.6, w: 36, h: 35.33 },         // 3-1 line 4: the section computed wider, so the depressor at 11 o'clock is not cut off
    depZ: { x: 3.2, y: -8.6, w: 14 },                      // 3-2 lines 4–6: the 11 o'clock periphery with the dent, the tear and the depressor (11–5 section)
    depZT: { x: 3.2, y: -8.6, w: 14, h: 9.48 },
    z42: { x: -8.31, y: -5.16, w: 14 },                    // 4-2: around the cutter's tip in PLANE42 (tip at 360, 180 px; the detached retina, SRF and wall below; room top left)
    z42T: { x: -8.31, y: -5.16, w: 14, h: 9.48 },
  };
  const LOOK_INF = { h: INF_H, deg: 45 };                  // 2-2: the surgeon looks toward the infusion (示意, as the model looks toward 11 for the tear)
  const OR = {   // orientation lines (POSTERIOR.orient: checked in posterior/check.js B2, B5)
    chart: P.orient.chart('OS'),
    sec: (() => { const o = P.orient.section(SEC_H, 'OS'); return `左眼 OS　上＝前　右＝${P.clockName(o.right)}　從 ${P.clockName(o.from)}那側看`; })(),
    head: '左眼 OS　' + P.orient.head(ST.sit).replace('　畫面下＝重力方向', '') + '　下＝重力　右＝前',
    sec2: P.orient.section(SEC2_H, 'OS').text,
    inf: (() => { const o = P.orient.section(INF_H, 'OS'); return `左眼 OS　上＝前　右＝${P.clockName(o.right)}　從 ${P.clockName(o.from)}那側看`; })(),
    ext: '俯視：左眼 OS　術者坐 12 點　下＝12 點、右＝9 點 nasal',
    port: '切面平行角膜緣　上＝外（結膜）　下＝玻璃體腔',
    wide: P.orient.wide('OS', true, 12).replace('術者坐 12 點　', '').replace('：下＝12 點　', '：下＝12 點、') + '　看向灌注（示意）',
    wideOn: P.orient.wide('OS', true, 12),                 // chapter 3: 左眼 OS　術者坐 12 點　inverter 開：下＝12 點　temporal 在左
    wideOff: P.orient.wide('OS', false, 12),               // inverter 關（倒像）：下＝6 點　temporal 在右
    sec4: (() => { const o = P.orient.section(SEC4_H, 'OS'); return `左眼 OS　上＝前　右＝${P.clockName(o.right)}　從 ${P.clockName(o.from)}那側看`; })(),
    z42: '左眼 OS　上方偏顳側、赤道後　上＝玻璃體腔　下＝眼球壁',
  };
  // chapter 5 (peripheral shaving; the assistant's scleral depression), after the core vitrectomy (cut 1, TA on the gel left). The vitrector in the
  // superonasal 10:30 port, the light pipe in the superotemporal 1:30 port (PRESET.depress's tip). Tip positions, the shaving steps, the far reach
  // and where and how deep the press goes (DEP, chapter 3's) are 示意. Tips are fixed in 3D from the state without the press, so the press brings
  // the retina to the cutter instead of moving the cutter with it (CARD.md「器械尖端跟著視網膜動」).
  const LIGHT5 = P.PRESET.depress.inst[1], SHAVE_STEPS = 5;
  const st5 = o => Object.assign({}, P.CASE, { troc: true, ta: 1, vit: { cut: 1, shave: 0 } }, o);
  const tip3 = (st, tip) => P.instTip(P.geom(Object.assign({}, st, { dep: null })), { kind: 'vitrector', port: 'sn', tip }).map(v => +v.toFixed(4));
  const SHAVE_TIP = { h: 11, s: 9.6, e: 1.0 };   // 5-1: the cutter at the 11 o'clock tear, just behind its hinge (PRESET.depress's tip)
  const FAR_TIP = { h: 4.5, s: 11.5, e: 1.0 };   // 5-1 line 4 (示意): the far periphery from the 10:30 port (180° away; in the 10:30 section), behind the lens
  const DEP_TIP = { h: 11, s: 9.6, e: 2.6 };     // 5-2: the cutter held 2.6 mm in front of the retina at the 11 o'clock tear; the press brings the retina to it
  const T_SHAVE = tip3(st5(), SHAVE_TIP), T_FAR = tip3(st5(), FAR_TIP), T_DEP = tip3(st5(), DEP_TIP);
  const on11 = st => Object.assign({}, st, { surgeon: 12, inverter: true, look: LOOK_DEP });            // the wide view of a state, looking toward 11 (示意)
  // 5-1 line 3: shaving k (0 → 1) of the way in SHAVE_STEPS steps (the gel at the vitreous base thinned to its last layer, the strand on the flap cut)
  const shaveStep = k => st5({ vit: { cut: 1, shave: Math.round(c01(k) * SHAVE_STEPS) / SHAVE_STEPS }, inst: [vitr(T_SHAVE), LIGHT5] });
  Object.assign(ST, {
    far5: st5({ vit: { cut: 1, shave: 1 }, inst: [vitr(T_FAR), LIGHT5] }),                            // 5-1 line 4 (示意): reaching the far periphery
    dep52: st5({ vit: { cut: 1, shave: 0.5 }, dep: DEP, inst: [vitr(T_DEP), LIGHT5] }),               // 5-2: pressing at 11 while shaving (depStep for the steps)
  });
  ST.far5On = Object.assign({}, ST.far5, { surgeon: 12, inverter: true, look: LOOK_INF });   // the far reach seen looking toward 4:30 (LOOK_INF, 示意 as in 2-2)
  ST.dep52On = on11(ST.dep52);
  // the point of a vitrector's shaft (from its tip to the trocar's pivot) nearest the lens: { p (3D), gap (mm to the lens surface) }
  function lensNear(st) { const Gm = P.geom(st), f = P.makeCtx(Gm), I = P.instGeom(Gm, st.inst.find(x => x.kind === 'vitrector')); let best = { gap: 1e9 };
    for (let t = 0; t <= 1.0001; t += 0.0025) { const p = G.add(I.tip, G.sub(I.port.pivot, I.tip).map(v => v * t)), g = f.lens(f.at(p)) - P.N.shaft / 2; if (g < best.gap) best = { p, gap: g }; } return best; }
  Object.assign(OR, { w5: '左眼 OS　inverter 開：下＝12 點、temporal 在左　看向 11 點（示意）', w5far: '左眼 OS　inverter 開：下＝12 點、temporal 在左　看向對側周邊（示意）' });

  // ---------------------------------------------------------------- views
  function fundus(st, W, H, win, id) { const c = cam(win, W, H), r = P.fundus({ st, id }); return wrap(c, r); }
  // section; o.h clock hour (right side), o.tw the computed window (smaller than the panel: the rest is filled with the background colour)
  function sec(st, W, H, win, id, o = {}) {
    const h = o.h ?? SEC_H, c = cam(win, W, H), tw = o.tw || win, r = P.section({ st, plane: G.planes.meridian(h), win: tw, step: o.step || 0.06, id, noTissue: o.noTissue }), Gm = r.Gm, pl = r.plane;
    const to = p => G.toPlane(pl, p), hl = ((h + 5) % 12) + 1, x = { };
    // extra anchors: detached retina on the right side (s 14 mm), inferior macula 1.6 mm from the foveola on the left side, its SRF, the wall at both sides
    const onCh = (fx, fy, frac) => { const hs = P.hsChart(fx, fy); return Gm.ret(hs.h, hs.s, frac); };
    const dl = G.clockDir(hl);
    x.retDet = to(Gm.ret(h, 12.5, 1)); x.macOff = to(onCh(1.6 * dl[0], 1.6 * dl[1], 1));
    { const hs = P.hsChart(1.6 * dl[0], 1.6 * dl[1]), s = hs.s; x.srfMac = to(P.P3(hs.h, s, P.Tp(s) + P.chorAt(s) + Gm.H(s, hs.h) * 0.5)); }
    x.wallR = to(P.P3(h, 4, P.Tp(4) * 0.5)); x.wallL = to(P.P3(hl, 4, P.Tp(4) * 0.5));   // the wall (sclera over the pars plana): does not move with the detachment
    { const s = 12.5; x.srfR = to(P.P3(h, s, P.Tp(s) + P.chorAt(s) + Gm.H(s, h) * 0.5)); }
    x.macOn = to(onCh(-1.6 * dl[0], -1.6 * dl[1], 1));                                               // superior macula, same distance on the right side
    { const s = P.S_POLE - 3.6; x.chorR = to(P.P3(h, s, P.Tp(s) + P.chorAt(s) / 2)); x.sclR = to(P.P3(h, s - 0.6, P.Tp(s - 0.6) / 2)); }
    const A = Object.assign({}, r.A, x), bg = `<rect x="0" y="0" width="${W}" height="${H}" fill="${P.C.bg}"/>`;
    return { svg: `${bg}<g transform="${c.tf}">${r.svg}</g>`, A: mapA(A, c.P), M: A, k: c.k, P: c.P, r };
  }
  // head-position view; extra anchors: the path of the subretinal fluid from the tear down the wall (midway between retina and RPE)
  function head(st, W, H, win, id) {
    const c = cam(win, W, H), r = P.head({ st, id, win: WIN.headT }), Gm = r.Gm, pl = r.plane, to = p => G.toPlane(pl, p), A = Object.assign({}, r.A);
    const mid = (h, s) => P.P3(h, s, P.Tp(s) + P.chorAt(s) + Gm.H(s, h) * 0.5), flow = [];
    for (let s = Gm.tear.sh + 1.6; s <= P.S_POLE; s += 0.5) flow.push(to(mid(11, s)));
    for (let s = P.S_POLE; s >= P.S_POLE - 3.2; s -= 0.4) flow.push(to(mid(5, s)));
    A.flow = flow;   // mm, from the tear down the wall (not mapped: an array of points)
    const bg = `<rect x="0" y="0" width="${W}" height="${H}" fill="${P.C.bg}"/>`;
    return { svg: `${bg}<g transform="${c.tf}">${r.svg}</g>`, A: mapA(A, c.P), M: A, k: c.k, P: c.P, flow: flow.map(c.P), r };
  }
  function ext(st, W, H, win, id) { const c = cam(win, W, H), r = P.ext({ st, id }); return wrap(c, r); }
  // cross-section of a trocar's tunnel (plane across the meridian at the port: the wall runs left–right, inside down, the tunnel to the right).
  // Extra anchors (mm): the scleral entry, the inner end of the tunnel, the conjunctival opening, label points on each layer 1.9 mm right of the port;
  // tdir = the tunnel direction on screen; out(L) = the point L mm outside the entry along the tunnel line (the trocar's handle, drawn by draw.js)
  function port(st, W, H, win, id, portId = PORT, o = {}) {
    const c = cam(win, W, H), Gm = P.geom(st), t = P.troc(Gm).find(x => x.id === portId), pl = G.planes.across(t.h, t.s), to = q => G.toPlane(pl, q);
    const r = P.section({ st, plane: pl, win: o.tw || Object.assign({ h: win.w * H / W }, win), step: o.step || 0.016, id, noTissue: o.noTissue });
    const A = Object.assign({}, r.A), Lt = t.Tw / Math.sin(t.ang * D2R), dh = 1.9 / (P.surfAt(t.s).rho * 30 * D2R), cil = P.cilTh(t.s - G.N.spur, P.oraAt(t.h, 1) - G.N.spur);
    A.entry = to(t.entry); A.tunnelEnd = to(G.add(t.entry, t.tdir.map(v => v * Lt))); if (t.cjC) A.cj = to(t.cjC);
    A.conjL = to(P.P3(t.h + dh, t.s, -G.N.conj * 0.5)); A.sclL = to(P.P3(t.h + dh, t.s, t.Tw * 0.5)); A.planaL = to(P.P3(t.h + dh, t.s, t.Tw + cil * 0.5)); A.vitL = to(P.P3(t.h + dh, t.s, t.Tw + cil + 1.0));
    const td = [G.dot(t.tdir, pl.U), G.dot(t.tdir, pl.V)], out = L => c.P([A.entry[0] - td[0] * L, A.entry[1] - td[1] * L]);
    const bg = `<rect x="0" y="0" width="${W}" height="${H}" fill="${P.C.bg}"/>`;
    return { svg: `${bg}<g transform="${c.tf}">${r.svg}</g>`, A: mapA(A, c.P), M: A, k: c.k, P: c.P, r, t, plane: pl, tdir: td, out, inPlane: Math.abs(G.dot(t.tdir, G.unit(G.cross(pl.U, pl.V)))) };
  }
  // wide-angle view with the cannulas: each cannula drawn from where it leaves the wall into the cavity to its tip (the same 3D points as the section),
  // shaft width from the distance to the viewpoint (as the model draws instruments), clipped to the field. Anchors cannula_<id> (tip), cannulaIn_<id>
  function wide(st, W, H, win, id, o2 = {}) {
    const c = cam(win, W, H), r = P.wide({ st, id }), Gm = r.Gm, Wm = r.map, f = P.makeCtx(Gm), kp = P.keyPoints(), A = Object.assign({}, r.A), o = [];
    for (const t of P.troc(Gm)) { if (!(t.ins >= 1) || t.out >= 1) continue;
      const at = u => G.add(t.base, G.sub(t.tip, t.base).map(v => v * u));
      let u0 = null; for (let k = 0; k <= 400; k++) if (f.cavity(f.at(at(k / 400))) < 0) { u0 = k / 400; break; }
      if (u0 === null) continue;
      const pts = []; for (let k = 0; k <= 24; k++) { const p = at(u0 + (1 - u0) * k / 24); pts.push([Wm.proj(p), kp.K_W * P.N.cannula / G.len(G.sub(p, [0, 0, kp.VZ]))]); }
      const L = [], R = []; for (let k = 0; k < pts.length; k++) { const [q, w] = pts[k], nb = pts[Math.min(pts.length - 1, k + 1)][0], pb = pts[Math.max(0, k - 1)][0], d = G.unit([nb[0] - pb[0], nb[1] - pb[1], 0]), nr = [-d[1], d[0]];
        L.push([q[0] + nr[0] * w / 2, q[1] + nr[1] * w / 2]); R.push([q[0] - nr[0] * w / 2, q[1] - nr[1] * w / 2]); }
      const tip = pts[pts.length - 1];
      o.push(`<path d="M${[...L, ...R.reverse()].map(G.F).join('L')}Z" fill="#c3cad1" stroke="#4b545d" stroke-width="1" ${G.NS}/>`,
        `<circle cx="${tip[0][0].toFixed(3)}" cy="${tip[0][1].toFixed(3)}" r="${(tip[1] * 0.42).toFixed(3)}" fill="#2b3036" stroke="#e8edf1" stroke-width="1.2" ${G.NS}/>`);
      A['cannula_' + t.id] = tip[0]; A['cannulaIn_' + t.id] = pts[0][0]; A['cannulaU0_' + t.id] = u0; }
    A.rdInf = Wm.proj(Gm.ret(INF_H, P.oraAt(INF_H, 1) + 4, 1));   // the detached retina behind the infusion port
    // 4-2 (示意): the retina sucked toward the cutter — the lifted patch (rings at 1.3 w round the apex, the same 3D retina as the section), folds to the apex
    if (Gm.suck) { const sk = Gm.suck, rr = P.surfAt(sk.s).rho * 30 * D2R, ring = [], ap = Wm.proj(Gm.ret(sk.h, sk.s, 1));
      for (let i = 0; i <= 48; i++) { const a = 2 * Math.PI * i / 48; ring.push(Wm.proj(Gm.ret(sk.h + 1.3 * sk.w * Math.cos(a) / rr, sk.s + 1.3 * sk.w * Math.sin(a), 1))); }
      const rad = Math.max(...ring.map(q => Math.hypot(q[0] - ap[0], q[1] - ap[1])));
      o.push(`<defs><radialGradient id="${id}_sk" cx="${ap[0].toFixed(3)}" cy="${ap[1].toFixed(3)}" r="${rad.toFixed(3)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.6" stop-color="#f3eee6" stop-opacity="0.7"/><stop offset="1" stop-color="#d9d2c6" stop-opacity="0.25"/></radialGradient></defs>`,
        `<path d="M${ring.map(G.F).join('L')}Z" fill="url(#${id}_sk)" stroke="#8a7f70" stroke-width="1" ${G.NS}/>`,
        ring.filter((q, i) => i % 6 === 3).map(q => `<path d="M${G.F(q)}L${G.F(ap)}" stroke="#9c9182" stroke-width="1" ${G.NS}/>`).join(''));
      A.suck = ap; }
    // TA specks: the same 3D samples as the model's wide view (posterior.js wide()); anchor taSpeck = the drawn speck nearest o.taNear (field mm)
    if (st.ta > 0 && o2.taNear) { const ff = P.makeCtx(Gm); let best = 1e9;
      for (let k = 0; k < 900; k++) { if (G.hash(k, 11) > 0.6 * st.ta) continue; const p = [24 * G.hash(k, 12) - 12, 24 * G.hash(k, 13) - 12, 20 * G.hash(k, 14) - 12];
        if (G.len(p) > 12 || !(ff.gel(ff.at(p)) < 0)) continue; const q = Wm.proj(p), d = Math.hypot(q[0] - o2.taNear[0], q[1] - o2.taNear[1]); if (d < best) { best = d; A.taSpeck = q; } } }
    // 4-1 line 3 (示意): where the posterior hyaloid has come off, a ring on it half way up its rise (the model's PVD: from the pole out to the vitreous base; Gm.hya)
    if (o2.pvdRing && st.pvd > 0) { const ring = []; let ok = true;
      for (let i = 0; i <= 96 && ok; i++) { const h = 12 * i / 96, sp = P.S_POLE + 2 + (P.vbPostAt(h, Gm.ts) - P.S_POLE - 2) * st.pvd, s = sp + 2.5;
        if (s > P.S_POLE - 0.4) ok = false; else ring.push(Wm.proj(P.P3(h, s, P.Tp(s) + P.chorAt(s) + Gm.rtHS(h, s) + Gm.hya(s, h)))); }
      if (ok) { o.push(`<path d="M${ring.map(G.F).join('L')}Z" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="6 4" opacity="0.95" ${G.NS}/>`); A.pvdRing = ring[60]; A.pvdRingL = ring[12]; } }
    const svg = `<g transform="${c.tf}">${r.svg}<g clip-path="url(#${id}_f)">${o.join('')}</g></g>`;
    return { svg, A: mapA(A, c.P), M: A, k: c.k, P: c.P, r };
  }
  // 4-2: section in PLANE42 (through the cutter's shaft and the wall normal; up = the vitreous cavity, down = the wall). Extra anchors (mm): port (the
  // cutter's opening, 0.5 mm behind the tip), suck (the apex of the sucked retina, with suck_off = its distance from the plane), and label points
  // 3.2 mm left of the foot on the detached retina, the subretinal fluid under it, the choroid and the sclera (found along the screen vertical); retF 5.6 mm left
  function instSec(st, W, H, win, id, o = {}) {
    const c = cam(win, W, H), pl = PLANE42, r = P.section({ st, plane: pl, win: o.tw || Object.assign({ h: win.w * H / W }, win), step: o.step || 0.02, id, noTissue: o.noTissue });
    const Gm = r.Gm, f = P.makeCtx(Gm), to = q => G.toPlane(pl, q), A = Object.assign({}, r.A), I = P.instGeom(Gm, st.inst[0]), nrm = G.unit(G.cross(pl.U, pl.V));
    A.port = to(I.portAt); A.tip = to(I.tip);
    if (Gm.suck) { const p3 = Gm.ret(Gm.suck.h, Gm.suck.s, 1); A.suck = to(p3); A.suck_off = Math.abs(G.dot(G.sub(p3, pl.O), nrm)); A.suck_3 = p3; }
    const run = (name, x) => { let a = null, b = null; for (let y = -1; y <= 6; y += 0.01) { const v = f[name](f.at(G.onPlane(pl, x, y))) < 0; if (v && a === null) a = y; if (!v && a !== null) { b = y; break; } } return a === null ? null : [x, (a + (b ?? a)) / 2]; };
    for (const [k, name, x] of [['retL', 'retina', -3.2], ['srfL', 'srf', -3.2], ['chorL', 'choroid', -3.2], ['sclL', 'sclera', -3.2], ['retF', 'retina', -5.6]]) { const q = run(name, x); if (q) A[k] = q; }
    const bg = `<rect x="0" y="0" width="${W}" height="${H}" fill="${P.C.bg}"/>`;
    return { svg: `${bg}<g transform="${c.tf}">${r.svg}</g>`, A: mapA(A, c.P), M: A, k: c.k, P: c.P, r, plane: pl };
  }
  // points round the tear on the attached retina, in its tangent frame (u posterior from the hinge, c across, mm) → chart mm
  function tearChart(st, pts) { const Gm = P.geom(st), T = Gm.tear; return pts.map(([u, cc]) => chartXY(P.onRetina(Gm, T.fr0, u, cc, 1, Gm.ret0).p)); }
  return { cam, chart, chartXY, tearChart, fundus, sec, head, ext, port, wide, ST, RD_ARC, LINCOFF, ST_H, SEC_H, SEC2_H, INF_H, TROC_RANGE, ORA_LBL, CJ_PUSH, PORT, LOOK_INF,
    portSt, WIN, OR, D2R, DEP_H, DEP_STEPS, depStep, lookStep, optics, OPT,
    SEC4_H, inPl4, CUT4, CORE_STEPS, PVD_STEPS, coreStep, pvdStep, SUCK_AT, E42, SUCK_STEPS, st42, suckAt, traction, distOf, TR42, PLANE42, instSec,
    SHAVE_STEPS, SHAVE_TIP, FAR_TIP, DEP_TIP, shaveStep, on11, lensNear };
})();
if (typeof module !== 'undefined') module.exports = VP;
