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
  };

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
  function wide(st, W, H, win, id) {
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
    const svg = `<g transform="${c.tf}">${r.svg}<g clip-path="url(#${id}_f)">${o.join('')}</g></g>`;
    return { svg, A: mapA(A, c.P), M: A, k: c.k, P: c.P, r };
  }
  // points round the tear on the attached retina, in its tangent frame (u posterior from the hinge, c across, mm) → chart mm
  function tearChart(st, pts) { const Gm = P.geom(st), T = Gm.tear; return pts.map(([u, cc]) => chartXY(P.onRetina(Gm, T.fr0, u, cc, 1, Gm.ret0).p)); }
  return { cam, chart, chartXY, tearChart, fundus, sec, head, ext, port, wide, ST, RD_ARC, LINCOFF, ST_H, SEC_H, SEC2_H, INF_H, TROC_RANGE, ORA_LBL, CJ_PUSH, PORT, LOOK_INF,
    portSt, WIN, OR, D2R, DEP_H, DEP_STEPS, depStep, lookStep, optics, OPT };
})();
if (typeof module !== 'undefined') module.exports = VP;
