// Posterior-segment view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the eyelid views only; these follow
// the same camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }) for the
// posterior-segment model (videos/models/posterior, CARD.md). Kept in this video folder so kit.js stays unchanged; check.js loads this file
// in node too (the states, windows and drawing constants below are what the video draws, and what its model checks look at).
//   VP.fundus(st, W, H, win, id)            fundus chart, examiner's drawing (12 up; OS 3 o'clock temporal on the right)
//   VP.sec(st, W, H, win, id, o)            meridional section through clock o.h (default 11: right = 11, left = 5), anterior up
//   VP.head(st, W, H, win, id)              head-position view: section through the tear with gravity straight down
//   VP.ext(st, W, H, win, id)               microscope view from above with the trocars (surgeon at 12)
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
  };
  const OR = {   // orientation lines (POSTERIOR.orient: checked in posterior/check.js B2, B5)
    chart: P.orient.chart('OS'),
    sec: (() => { const o = P.orient.section(SEC_H, 'OS'); return `左眼 OS　上＝前　右＝${P.clockName(o.right)}　從 ${P.clockName(o.from)}那側看`; })(),
    head: '左眼 OS　' + P.orient.head(ST.sit).replace('　畫面下＝重力方向', '') + '　下＝重力　右＝前',
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
  // points round the tear on the attached retina, in its tangent frame (u posterior from the hinge, c across, mm) → chart mm
  function tearChart(st, pts) { const Gm = P.geom(st), T = Gm.tear; return pts.map(([u, cc]) => chartXY(P.onRetina(Gm, T.fr0, u, cc, 1, Gm.ret0).p)); }
  return { cam, chart, chartXY, tearChart, fundus, sec, head, ext, ST, RD_ARC, LINCOFF, ST_H, SEC_H, WIN, OR, D2R };
})();
if (typeof module !== 'undefined') module.exports = VP;
