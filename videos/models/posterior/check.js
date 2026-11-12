// Self-check for the posterior-segment model: node check.js   (run from any folder; no browser needed; videos/tools/check-all.js runs it)
// Every check compares what the model draws (tissue fields, anchors of the drawn views, 3D points) with numbers written here from the
// literature, the case summary (spec.md「病例情境」, 病例) or the narration (anim/segments.js) — never with the model's own parameters.
// Then the selftest breaks the model on purpose (text substitutions in posterior.js / views.js, or a changed narration) and requires that
// every check is caught by at least one mutation: each mutation names the checks it must make fail.
//   node check.js            checks + selftest          node check.js --no-selftest   checks only
global.document = { createElement: () => ({}) };
const fs = require('fs'), path = require('path');
global.GLOBE = require('../globe/globe.js');
const G = global.GLOBE, D2R = Math.PI / 180;
const SRC = fs.readFileSync(path.join(__dirname, 'posterior.js'), 'utf8'), VSRC = fs.readFileSync(path.join(__dirname, 'views.js'), 'utf8');
const SEGS_PATH = path.join(__dirname, '..', '..', 'src', 'rrd-ppv-c3f8', 'anim', 'segments.js');
const NARR0 = require(SEGS_PATH).SEGS.map(s => [s.id, (s.lines || []).join('')]);
const load = src => { const m = { exports: {} }; new Function('module', 'require', 'GLOBE', src)(m, require, G); return m.exports; };
const loadViews = (src, P) => { const MV = {}; new Function('MODEL_VIEWS', 'POSTERIOR', 'GLOBE', src)(MV, P, G); return MV.posterior; };
const near = (a, b, t) => Math.abs(a - b) <= t;
const { add, sub, dot, len, unit, cross, clockDir, clockOf } = G;
const mul = (a, k) => a.map(v => v * k);
const angDeg = (a, b) => { let d = Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d) / D2R; };
const hdiff = (a, b) => { let d = a - b; d -= 12 * Math.round(d / 12); return d; };
// clock hour of a point on a screen whose clock 12 points in screen direction up12 (unit 2D) and clock 3 in direction r3
const clockOn = (v, up12, r3) => { const y = dot2(v, up12), x = dot2(v, r3); let h = Math.atan2(x, y) / (30 * D2R); if (h <= 0) h += 12; return h; };
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];

// literature and case numbers (CARD.md「數值與出處」)
const LIT = {
  oraT: 7.58, oraN: 6.96,                 // Li 2025 (Chinese, intra-operative, normal axial length)
  spur: 0.85,                             // Le 2018 (globe/)
  plicata: [1.8, 2.6],                    // Guedes 2024: pars plicata ~2 mm
  plana: [2.8, 4.9],                      // Guedes 2024: pars plana 3.8 (2.8–4.9) mm
  vbAnt: 2, vbPostRange: [1, 4], vbWidth: [2, 6],   // Sebag 2014 (2 mm of pars plana; 1–4 mm of retina); Sohn 2020 (2–6 mm wide)
  discArea: 2.65, discRatio: 1.92 / 1.76, // Wang 2006; Jonas 1988
  dfDist: 4.76, dfAng: 7.76,              // Jonas 2015a, 2015b
  fovMin: 0.150, c1: 0.176, inner: 0.255, outer: 0.238,   // Duan 2010 (Handan)
  eqRet: 0.18, oraRet: 0.10,              // Tengroth 1966
  chor: 0.254,                            // Wei 2013
  sclPole: 0.94, sclMid: 0.65, sclEq: 0.42,  // Vurgese 2012
  lensT: 4.51, lensD: 9.58, acd: 2.96,    // Meng 2021; Huang 2024; Fu 2015 (globe/)
  vol: [4.96 - 0.69, 4.96 + 0.69],        // de Santana 2020: vitreous chamber 4.96 ± 0.69 mL
  DD: 4.76 / 2.65,                        // 1 disc diameter ≈ 1.80 mm (Jonas 2015a ratio, 推算)
  troc: 4.0,                              // Duker 2021: phakic, 4 mm behind the limbus
  tunnel: [20, 30],                       // Teixeira 2009
  shaft: 0.6,                             // de Oliveira 2016 (23G)
  foveola: 0.35,                          // Curcio 1990
  coverSit: 0.035,                        // 推算 (CARD.md): smallest gas fraction that covers the whole 11 o'clock tear sitting upright, flat interface
  pvdGap: 3.5, pvdRise: 5,                // 示意 (CARD.md): with a PVD the hyaloid lies 3.5 mm in front of the retina, reached 5 mm behind the vitreous base
};
const CASE = { eye: 'OS', tear: 11, rdFrom: 11.5, rdTo: 5 };   // 病例 (spec.md, 2026-11-12)
const oraLit = (h, eye = 'OS') => { const ts = eye === 'OS' ? 1 : -1; return (LIT.oraT + LIT.oraN) / 2 + (LIT.oraT - LIT.oraN) / 2 * clockDir(h)[0] * ts; };   // smooth between clock hours (示意)

// ---------------------------------------------------------------- the checks
const CHECKS = [];
const def = (id, fn) => CHECKS.push({ id, fn });
// helpers that read the drawn tissue fields
const fieldOf = (P, st) => P.makeCtx(P.geom(st));
const inside = (f, name, p) => f[name](f.at(p)) < 0;
// thickness of a layer along the inward normal at (h, s): first and last depth where the layer's field is negative
function thick(P, f, name, h, s, d0 = -0.5, d1 = 3, step = 0.002) { let a = null, b = null; for (let d = d0; d <= d1; d += step) { if (inside(f, name, P.P3(h, s, d))) { if (a === null) a = d; b = d; } else if (a !== null) break; } return a === null ? 0 : b - a + step; }
// s where a layer starts along a meridian (scan posteriorly at the mid-depth of the layer)
function startOf(P, f, name, h, s0, s1, depthAt) { for (let s = s0; s <= s1; s += 0.005) if (inside(f, name, P.P3(h, s, depthAt(s)))) return s; return null; }

// A1 ora: where the retina (and choroid) begin, OS temporal (3) and nasal (9) meridians; 12 o'clock in between
def('A1', (P, ok) => { const f = fieldOf(P, { eye: 'OS' }), mid = s => P.Tp(s) + P.chorAt(s) + 0.05;
  for (const [h, v, nm] of [[3, LIT.oraT, 'temporal'], [9, LIT.oraN, 'nasal'], [12, (LIT.oraT + LIT.oraN) / 2, '12 o\'clock (smooth between, 示意)']]) {
    const r = startOf(P, f, 'retina', h, 5, 10, mid), c = startOf(P, f, 'choroid', h, 5, 10, s => P.Tp(s) + 0.1);
    ok(r !== null && near(r, v, 0.03) && near(c, v, 0.03), `ora ${nm}: retina begins ${r && r.toFixed(2)}, choroid ${c && c.toFixed(2)} mm behind the limbus ≈ ${v.toFixed(2)} (Li 2025)`); } });
// A2 pars plicata ~2 mm behind the spur, pars plana 2.8–4.9 mm (Guedes 2024) on the temporal and nasal sides
def('A2', (P, ok) => { const f = fieldOf(P, { eye: 'OS' });
  for (const h of [3, 9]) { const th = s => thick(P, f, 'ciliary', h, s, P.Tp(s) - 0.05, P.Tp(s) + 1.4, 0.004);
    let end = null; for (let s = LIT.spur + 1.0; s < 5; s += 0.02) if (th(s) < 0.45) { end = s; break; }
    const plana = oraLit(h) - end;
    ok(end !== null && end - LIT.spur >= LIT.plicata[0] && end - LIT.spur <= LIT.plicata[1], `pars plicata (processes > 0.45 mm thick) ends ${(end - LIT.spur).toFixed(2)} mm behind the spur at ${h} o'clock (Guedes 2024: ~2 mm)`);
    ok(plana >= LIT.plana[0] && plana <= LIT.plana[1], `pars plana ${plana.toFixed(2)} mm wide at ${h} o'clock (Guedes 2024: 2.8–4.9)`); } });
// A3 vitreous base straddles the ora: front border 2 mm in front (Sebag 2014); with a complete PVD the hyaloid stays attached back to 1–4 mm behind the ora
def('A3', (P, ok) => { const st = { eye: 'OS', pvd: 1 }, f = fieldOf(P, st), Gm = P.geom(st);
  for (const h of [3, 9, 11, 6]) { const sec = P.section({ st, plane: G.planes.meridian(h), win: { x: 0, y: 0, w: 1, h: 1 }, noTissue: true }), sA = P.wallOf(sec.A.vbAR_3[2], Math.hypot(sec.A.vbAR_3[0], sec.A.vbAR_3[1])).s;
    let post = null; for (let s = oraLit(h); s < oraLit(h) + 8; s += 0.02) { const p = P.P3(h, s, P.Tp(s) + P.chorAt(s) + Gm.rtHS(h, s) + 0.08); if (!inside(f, 'gel', p)) { post = s; break; } }
    ok(near(oraLit(h) - sA, LIT.vbAnt, 0.05), `${h} o'clock: vitreous base front border ${(oraLit(h) - sA).toFixed(2)} mm in front of the ora (Sebag 2014: 2 mm of pars plana)`);
    ok(post !== null && post - oraLit(h) >= LIT.vbPostRange[0] && post - oraLit(h) <= LIT.vbPostRange[1] && post - sA >= LIT.vbWidth[0] && post - sA <= LIT.vbWidth[1],
      `${h} o'clock: with PVD the gel stays on the retina to ${post && (post - oraLit(h)).toFixed(2)} mm behind the ora (Sebag 1–4), base ${post && (post - sA).toFixed(2)} mm wide (Sohn 2020: 2–6)`); } });
// A4 optic disc: area (Wang 2006) and vertical/horizontal shape (Jonas 1988), measured on the drawn 3D outline in its tangent plane
def('A4', (P, ok) => { for (const eye of ['OS', 'OD']) { const D = P.DISC[eye === 'OS' ? 1 : -1], O = P.discOutline(D, 360), c = mul(O.reduce((a, p) => add(a, p), [0, 0, 0]), 1 / O.length), u = unit(c);
    const ev = unit(sub([0, 1, 0], mul(u, u[1]))), eh = unit(cross(ev, u)), xy = O.map(p => { const q = mul(p, len(c) / dot(p, u)); return [dot(sub(q, c), eh), dot(sub(q, c), ev)]; });
    let A = 0; for (let i = 0; i < xy.length; i++) { const a = xy[i], b = xy[(i + 1) % xy.length]; A += a[0] * b[1] - a[1] * b[0]; } A = Math.abs(A) / 2;
    const W = Math.max(...xy.map(p => p[0])) - Math.min(...xy.map(p => p[0])), H = Math.max(...xy.map(p => p[1])) - Math.min(...xy.map(p => p[1]));
    ok(near(A, LIT.discArea, 0.04), `${eye} disc area ${A.toFixed(2)} mm² ≈ 2.65 (Wang 2006)`); ok(near(H / W, LIT.discRatio, 0.02) && H > W, `${eye} disc vertical/horizontal ${H.toFixed(2)}/${W.toFixed(2)} = ${(H / W).toFixed(3)} ≈ 1.92/1.76 (Jonas 1988)`); } });
// A5 disc–fovea distance and angle on the drawn fundus chart and along the RPE (Jonas 2015)
def('A5', (P, ok) => { const fd = P.fundus({ st: { eye: 'OS' } }), d = sub(fd.A.disc, fd.A.fovea), dist = Math.hypot(...d), ang = Math.atan2(d[1], Math.abs(d[0])) / D2R;   // screen y down
  const D = P.DISC[1], hd = clockOf(D.u[0], D.u[1]), s0 = P.wallOf(D.C[2], Math.hypot(D.C[0], D.C[1])).s; let arc = 0, pp = P.rpeAt(hd, s0); for (let s = s0; s < P.S_POLE; s += 0.01) { const q = P.rpeAt(hd, Math.min(P.S_POLE, s + 0.01)); arc += len(sub(q, pp)); pp = q; }
  ok(near(arc, LIT.dfDist, 0.03) && near(dist, LIT.dfDist, 0.1), `disc–fovea along the RPE ${arc.toFixed(2)} mm ≈ 4.76 (Jonas 2015a); ${dist.toFixed(2)} mm on the chart`);
  ok(near(-ang, LIT.dfAng, 0.3), `the fovea ${(-ang).toFixed(2)}° below the disc centre ≈ 7.76° (Jonas 2015b)`); });
// A7 retinal thickness from the drawn field: fovea and ETDRS rings (Duan 2010), equator and ora (Tengroth 1966)
def('A7', (P, ok) => { const st = { eye: 'OS' }, f = fieldOf(P, st), Gm = P.geom(st);
  const at = (fx, fy) => { const hs = P.hsChart(fx, fy); return thick(P, f, 'retina', hs.h, hs.s, P.Tp(hs.s) + P.chorAt(hs.s) - 0.05, P.Tp(hs.s) + P.chorAt(hs.s) + 0.7, 0.001); };
  const ring = (a, b) => { let s = 0, w = 0; for (let r = a + 0.05; r < b; r += 0.1) for (const t of [30, 150, 210, 330]) { const v = at(r * Math.cos(t * D2R), r * Math.sin(t * D2R)); s += v * r; w += r; } return s / w; };
  const c0 = at(0.001, 0.001), c1 = ring(0, 0.5), r1 = ring(0.5, 1.5), r2 = ring(1.5, 3);
  ok(near(c0, LIT.fovMin, 0.006), `foveal minimum ${(c0 * 1000).toFixed(0)} µm ≈ 150 (Duan 2010)`);
  ok(near(c1, LIT.c1, 0.008) && near(r1, LIT.inner, 0.008) && near(r2, LIT.outer, 0.008), `macular rings: central 1 mm ${(c1 * 1000).toFixed(0)}, 1–3 mm ${(r1 * 1000).toFixed(0)}, 3–6 mm ${(r2 * 1000).toFixed(0)} µm ≈ 176 / 255 / 238 (Duan 2010)`);
  const eq = thick(P, f, 'retina', 1.5, P.S_EQ, P.Tp(P.S_EQ) + P.chorAt(P.S_EQ) - 0.05, P.Tp(P.S_EQ) + 0.9, 0.001), so = oraLit(1.5) + 0.05, ora = thick(P, f, 'retina', 1.5, so, P.Tp(so) + P.chorAt(so) - 0.05, P.Tp(so) + 0.6, 0.001);
  ok(near(eq, LIT.eqRet, 0.01) && near(ora, LIT.oraRet, 0.012), `retina ${eq.toFixed(3)} mm at the equator, ${ora.toFixed(3)} mm at the ora ≈ 0.18 / 0.10 (Tengroth 1966)`); });
// A8 subfoveal choroid (Wei 2013)   A9 sclera at the pole, midway and the equator (Vurgese 2012)
def('A8', (P, ok) => { const f = fieldOf(P, { eye: 'OS' }), c = thick(P, f, 'choroid', 12, P.S_POLE - 0.01, 0.5, 1.6, 0.001); ok(near(c, LIT.chor, 0.006), `subfoveal choroid ${(c * 1000).toFixed(0)} µm ≈ 254 (Wei 2013)`); });
def('A9', (P, ok) => { const f = fieldOf(P, { eye: 'OS' });
  for (const [s, v, nm] of [[P.S_POLE - 0.6, LIT.sclPole, 'posterior pole'], [P.sOfPhi(135 * D2R), LIT.sclMid, 'midway equator–pole'], [P.sOfPhi(90 * D2R), LIT.sclEq, 'equator']]) {
    const t = thick(P, f, 'sclera', 1.5, s, -0.1, 1.5, 0.002); ok(near(t, v, 0.015), `sclera at the ${nm}: ${t.toFixed(3)} mm ≈ ${v} (Vurgese 2012)`); } });
// A10 phakic lens (Meng 2021 thickness, Huang 2024 diameter), anterior chamber depth from the epithelium (Fu 2015, as globe/)
def('A10', (P, ok) => { const f = fieldOf(P, { eye: 'OS' }), apex = G.prof(0)[0]; let za = null, zp = null;
  for (let z = 13; z > 3; z -= 0.002) if (inside(f, 'lens', [0, 0, z])) { if (za === null) za = z; zp = z; }
  let rmax = 0; for (let z = zp; z <= za; z += 0.01) for (let r = 4.3; r < 5.6; r += 0.002) if (inside(f, 'lens', [r, 0, z])) rmax = Math.max(rmax, r);
  ok(near(za - zp, LIT.lensT, 0.05), `lens thickness ${(za - zp).toFixed(2)} mm ≈ 4.51 (Meng 2021)`); ok(near(2 * rmax, LIT.lensD, 0.06), `lens diameter ${(2 * rmax).toFixed(2)} mm ≈ 9.58 (Huang 2024)`);
  ok(near(apex - za, LIT.acd, 0.01), `anterior chamber ${(apex - za).toFixed(2)} mm from the epithelium = 2.96 (Fu 2015, as globe/)`); });
// A11 vitreous cavity volume (de Santana 2020 range); the Zhou 2020 regression at this axial length is reported (CARD.md)
def('A11', (P, ok) => { const V = P.voxels(), mL = V.vol / 1000, AL = G.prof(0)[0] + P.K, zhou = (458.35 * AL - 6331.14) / 1000;
  ok(mL >= LIT.vol[0] && mL <= LIT.vol[1], `vitreous cavity ${mL.toFixed(2)} mL within 4.96 ± 0.69 (de Santana 2020); Zhou 2020 regression at AL ${AL.toFixed(2)} mm: ${zhou.toFixed(2)} mL`); });
// A12 one globe: the outer surface and the anterior segment are globe/'s
def('A12', (P, ok) => { let worst = 0; for (let s = -5; s <= 25; s += 0.25) { const a = P.surfAt(s), b = G.surfAt(Math.min(s, 20)); if (s <= 20) worst = Math.max(worst, Math.hypot(a.z - b.z, a.rho - b.rho)); }
  ok(worst < 1e-6, `outer surface = globe/'s (max difference ${worst.toExponential(1)} mm)`);
  const f = fieldOf(P, { eye: 'OS' }), gf = G.makeField({}); let diff = 0; for (const [h, s, d] of [[10, -2, 0.2], [10, -0.3, 0.3], [2, 0.5, 0.25], [7, 1.5, 0.2], [5, -4, 0.4]]) { const p = G.P3(h, s, d), W = gf.wall(p);
    for (const k of ['cornea', 'limbus', 'sclera']) diff += (f[k](f.at(p)) < 0) !== (gf.g[k](W) < 0) ? 1 : 0; }
  ok(diff === 0, `anterior segment tissues (cornea, limbus, sclera) = globe/'s at sample points (${diff} differ)`); });

// B1 clock-hour names (narration 1-1: 左眼的 3 點是 temporal，9 點是 nasal; 3-2: 11 點 … 上方略偏鼻側)
def('B1', (P, ok) => { const a = (h, e) => P.anat(h, e).en;
  ok(a(3, 'OS') === 'temporal' && a(9, 'OS') === 'nasal' && a(3, 'OD') === 'nasal' && a(9, 'OD') === 'temporal', 'OS 3 temporal, 9 nasal; OD the other way');
  ok(a(11, 'OS') === 'superonasal' && a(1.5, 'OS') === 'superotemporal' && a(4.5, 'OS') === 'inferotemporal', 'OS 11 superonasal, 1:30 superotemporal, 4:30 inferotemporal'); });
// B2 fundus chart (OS): 12 up, 3 (temporal) right; the disc nasal (left) and the macula temporal to it (narration 1-1)
def('B2', (P, ok) => { for (const eye of ['OS', 'OD']) { const A = P.fundus({ st: { eye } }).A, c12 = A.clock12, c3 = A.clock3;
    ok(c12[1] < -20 && Math.abs(c12[0]) < 1e-6 && c3[0] > 20, `${eye} chart: 12 o'clock at the top, 3 o'clock on the right`);
    ok(eye === 'OS' ? A.disc[0] < A.fovea[0] - 4 : A.disc[0] > A.fovea[0] + 4, `${eye} chart: the disc ${eye === 'OS' ? 'left' : 'right'} of the fovea (nasal), the macula temporal to the disc`); } });
// B3 surgeon's wide-angle view, OS, surgeon at 12, inverter on: 12 down, temporal left; 11 o'clock down and 30° to the right (narration 3-2)
def('B3', (P, ok) => { const st = { eye: 'OS' }, W = P.wide({ st }), A = W.A, Gm = P.geom(st), pole = A.pole, pr = p => sub(W.map.proj(p), pole);
  const v12 = pr(Gm.ret(12, 14, 1)), v3 = pr(Gm.ret(3, 14, 1)), v11 = pr(Gm.ret(11, 14, 1));
  ok(v12[1] > 5 && Math.abs(v12[0]) < 0.01, `12 o'clock at the bottom (${v12.map(x => x.toFixed(2))})`); ok(v3[0] < -5 && Math.abs(v3[1]) < 0.01, `OS 3 o'clock (temporal) on the left (${v3.map(x => x.toFixed(2))})`);
  const a11 = Math.atan2(v11[0], v11[1]) / D2R; ok(v11[1] > 0 && near(a11, 30, 0.5), `OS 11 o'clock: down, ${a11.toFixed(1)}° to the right of straight down (畫面下方略偏右)`); });
// B4 inverter off = upside down and laterally reversed = rotated 180° (Lantz 2005; Chalam 2004)
def('B4', (P, ok) => { const st = Object.assign({}, P.PRESET.depress), on = P.wide({ st }).A, off = P.wide({ st: Object.assign({}, st, { inverter: false }) }).A; let worst = 0;
  for (const k of ['pole', 'fovea', 'disc', 'tear', 'dep', 'inst0', 'inst1']) worst = Math.max(worst, Math.hypot(on[k][0] + off[k][0], on[k][1] + off[k][1]));
  ok(worst < 1e-6, `inverter off: every anchor rotated 180° about the field centre (max ${worst.toExponential(1)})`);
  const d = sub(off.dep, off.pole); ok(d[1] < 0 && d[0] < 0, 'inverter off: the 11 o\'clock mound appears up and to the left (not where the inverted image puts 11 o\'clock)'); });
// B5 section orientation: 11–5 meridian, anterior up, 11 o'clock on the right, seen from the 2 o'clock side
def('B5', (P, ok) => { const o = P.orient.section(11, 'OS'), sec = P.section({ st: P.PRESET.rrd, plane: G.planes.meridian(11), win: { x: 0, y: 0, w: 1, h: 1 }, noTissue: true }).A;
  ok(o.right === 11 && o.left === 5 && near(o.from, 2, 1e-6), `orient: right ${o.right}, left ${o.left}, seen from ${o.from} o'clock (${o.text})`);
  ok(sec.tearMid[0] > 5 && sec.oraL[0] < -8 && sec.lens[1] < sec.centre[1] - 5, 'section: the tear on the right, 5 o\'clock on the left, the lens up'); });

// C1 the tear at 11 o'clock in the section, the fundus chart and the wide-angle view
def('C1', (P, ok) => { const st = P.PRESET.rrd, sec = P.section({ st, plane: G.planes.meridian(CASE.tear), win: { x: 0, y: 0, w: 1, h: 1 }, noTissue: true }).A;
  ok(sec.tearMid_off < 0.02 && sec.tearMid[0] > 0, `section: the tear lies in the 11 o'clock meridian (${sec.tearMid_off.toFixed(3)} mm off), on its right side`);
  const fd = P.fundus({ st }).A, hf = clockOn(sub(fd.tear, fd.centre), [0, -1], [1, 0]); ok(near(hdiff(hf, CASE.tear), 0, 0.05), `fundus chart: the tear at ${hf.toFixed(2)} o'clock`);
  const wd = P.wide({ st }).A, hw = clockOn(sub(wd.tear, wd.pole), [0, 1], [-1, 0]); ok(near(hdiff(hw, CASE.tear), 0, 0.05), `wide view (inverter on): the tear at ${hw.toFixed(2)} o'clock`); });
// C2 detachment from 11:30 clockwise through 12 and 3 to 5 o'clock, about five and a half clock hours, not at 9 (病例; narration 1-1)
def('C2', (P, ok) => { const Gm = P.geom(P.PRESET.rrd), det = h => Gm.H(oraLit(h) + 0.5, h) > 0.01, list = []; for (let h = 0; h < 12; h += 0.05) if (det(h)) list.push(h);
  let a = null; for (let h = 9; h < 12.5; h += 0.01) if (det(h % 12)) { a = h; break; } let b = null; for (let h = 9 - 0.01; h > 2; h -= 0.01) if (det(h)) { b = h; break; }
  ok(a !== null && near(a, CASE.rdFrom, 0.25), `detached 0.5 mm behind the ora from ${a && a.toFixed(2)} o'clock (病例 11:30)`); ok(b !== null && near(b, CASE.rdTo, 0.25), `… to ${b && b.toFixed(2)} o'clock (病例 5)`);
  ok(det(12) && det(3) && !det(9) && !det(7) && near((b + 12 - a), 5.5, 0.5), `through 12 and 3 (temporal), not 9 or 7; ${(b + 12 - a).toFixed(2)} clock hours (約五個半鐘點)`); });
// C3 the tear lies inside the detachment, near its highest edge: within 1 h of the 11:30 edge and within 1.5 h of 12 (Lincoff rule, Yoshida 2018)
def('C3', (P, ok) => { const Gm = P.geom(P.PRESET.rrd), T = Gm.tear, U = P.uOutline(T.w, T.L), H = U.map(q => { const r = P.onRetina(Gm, T.fr0, q[0], q[1], 0.5, Gm.ret0); return Gm.H(r.s, r.h); });
  ok(Math.min(...H) > 0.3, `every point of the tear's edge is on detached retina (lowest ${Math.min(...H).toFixed(2)} mm)`);
  ok(Math.abs(hdiff(CASE.rdFrom, T.h)) <= 1 && Math.abs(hdiff(12, T.h)) <= 1.5, 'the 11 o\'clock tear is within 1 h of the 11:30 edge and within 1.5 h of 12 (Yoshida 2018)'); });
// C4 inferior macula off, foveola on (病例; narration 1-1)
def('C4', (P, ok) => { const Gm = P.geom(P.PRESET.rrd), Hc = (fx, fy) => { const hs = P.hsChart(fx, fy); return Gm.H(hs.s, hs.h); };
  let fov = 0; for (let r = 0; r <= LIT.foveola / 2; r += 0.025) for (let t = 0; t < 360; t += 30) fov = Math.max(fov, Hc(r * Math.cos(t * D2R) + 1e-6, r * Math.sin(t * D2R)));
  const inf = [[0, -1.6], [0, -2.4], [0.8, -2.0], [-1.0, -2.0]].map(p => Hc(...p)), sup = [[0, 1.6], [0, 2.4], [1.5, 1.5]].map(p => Hc(...p));
  ok(fov === 0, `foveola (radius ${LIT.foveola / 2} mm) attached (max height ${fov.toFixed(3)})`); ok(Math.min(...inf) > 0.1, `inferior macula detached (${inf.map(x => x.toFixed(2)).join(', ')} mm)`);
  ok(Math.max(...sup) === 0, 'superior macula attached'); });
// C5 bullous superior detachment (PVD with a tear: Park 2018), shallow over the macula (示意 heights)
def('C5', (P, ok) => { const Gm = P.geom(P.PRESET.rrd); let mx = 0; for (let h = 11.5; h <= 14.5; h += 0.1) for (let s = 8; s < 20; s += 0.5) mx = Math.max(mx, Gm.H(s, h % 12 || 12));
  const hs = P.hsChart(0, -2.0), mac = Gm.H(hs.s, hs.h); ok(mx >= 2 && mac < 1, `superior detachment bullous (up to ${mx.toFixed(2)} mm), macula shallow (${mac.toFixed(2)} mm)`); });
// C6 horseshoe tear: on the posterior border of the vitreous base (Sohn 2020; Sebag 1–4 mm behind the ora), arc toward the pole, flap hinge in front, 1 DD wide
def('C6', (P, ok) => { const Gm = P.geom(Object.assign({}, P.PRESET.rrd, { rd: { amt: 0 } })), T = Gm.tear, w = q => { const r = P.onRetina(Gm, T.fr0, q[0], q[1], 0, Gm.ret0); return r; };
  const hinge = P.wallOf(T.fr0.Q[2], Math.hypot(T.fr0.Q[0], T.fr0.Q[1])).s, apex = w([T.L, 0]), sides = [w([T.L / 2, T.w / 2]), w([T.L / 2, -T.w / 2])];
  ok(hinge - oraLit(11) >= LIT.vbPostRange[0] && hinge - oraLit(11) <= LIT.vbPostRange[1], `flap hinge ${(hinge - oraLit(11)).toFixed(2)} mm behind the ora (vitreous base posterior border, Sebag 1–4)`);
  const U = P.uOutline(T.w, T.L).map(w), smax = Math.max(...U.map(r => r.s));
  ok(near(apex.s, smax, 0.01) && near(hdiff(apex.h, 11), 0, 0.01) && smax > hinge + 1, `the U's arc points to the pole: its apex is the tear's most posterior point (${smax.toFixed(2)} mm), on the 11 o'clock meridian`);
  const width = len(sub(sides[0].p, sides[1].p)); ok(near(width, LIT.DD, 0.1), `tear width ${width.toFixed(2)} mm ≈ 1 DD (${LIT.DD.toFixed(2)} mm, Jonas 2015a ratio)`); });
// C7 the flap is pulled forward into the vitreous cavity and the gel holds it (Govetto 2024: traction at the anterior edge; McEwan 2008: flap displaced anteriorly)
def('C7', (P, ok) => { const st = P.PRESET.rrd, Gm = P.geom(st), T = Gm.tear, f = P.makeCtx(Gm), fe = P.flapPt(T, T.L, 0), d = sub(fe, T.fr.Q), fwd = -dot(d, T.fr.eu), up = dot(d, T.fr.en);
  ok(fwd > 0 && up > 1.0, `flap free edge ${fwd.toFixed(2)} mm in front of the hinge (along the retina) and lifted ${up.toFixed(2)} mm into the cavity`);
  const near_ = (fn, p) => [[0, 0, 0], [0.12, 0, 0], [0, 0.12, 0], [0, 0, 0.12], [-0.12, 0, 0], [0, -0.12, 0], [0, 0, -0.12]].some(e => inside(fn, 'gel', add(p, e)));
  ok(near_(f, fe), 'gel attached at the flap\'s free edge');
  const pull = s2 => { const st2 = Object.assign({}, st, { vit: { cut: 1, shave: s2 } }), G2 = P.geom(st2), T2 = G2.tear, f2 = P.makeCtx(G2), e2 = P.flapPt(T2, T2.L, 0), dir = unit(add(T2.fr.en, mul(T2.fr.eu, -0.35))); return near_(f2, add(e2, mul(dir, 0.2))); };
  ok(pull(0.8) && !pull(1), 'while shaving, a strand of gel still pulls on the flap (beyond the shell left on the retina); full shaving releases it'); });
// D1 trocars 4 mm behind the limbus (Duker 2021), in the pars plana (behind the plicata, in front of the Li 2025 ora), cannula tips in front of the ora
def('D1', (P, ok) => { const st = { eye: 'OS', troc: true }, Gm = P.geom(st), f = P.makeCtx(Gm);
  for (const t of P.troc(Gm)) { const s = P.wallOf(t.entry[2], Math.hypot(t.entry[0], t.entry[1])).s, tip = P.wallOf(t.tip[2], Math.hypot(t.tip[0], t.tip[1])), o = oraLit(t.h);
    ok(near(s, LIT.troc, 0.01) && s > LIT.spur + LIT.plicata[1] && s < o - 2, `trocar ${t.id} (${t.h} o'clock, ${P.anat(t.h, 'OS').en}): ${s.toFixed(2)} mm behind the limbus, pars plana (ora ${o.toFixed(2)} mm, Li 2025)`);
    ok(tip.s < o && !inside(f, 'retina', t.tip) && inside(f, 'cavity', t.tip), `cannula ${t.id}: tip in the vitreous cavity ${(o - tip.s).toFixed(2)} mm in front of the ora, not through the retina`); } });
// D2 ports: infusion inferotemporal, working ports superotemporal and superonasal (Tei 2005)
def('D2', (P, ok) => { const T = P.troc(P.geom({ eye: 'OS', troc: true })), inf = T.filter(t => t.inf), oth = T.filter(t => !t.inf).map(t => P.anat(t.h, 'OS').en).sort();
  ok(inf.length === 1 && P.anat(inf[0].h, 'OS').en === 'inferotemporal' && oth.join() === 'superonasal,superotemporal', `OS ports: infusion ${inf.map(t => P.anat(t.h, 'OS').en)}, others ${oth.join(', ')}`); });
// D3 oblique tunnel 20–30° to the surface (Teixeira 2009)
def('D3', (P, ok) => { for (const t of P.troc(P.geom({ eye: 'OS', troc: true }))) { const a = Math.asin(Math.abs(dot(t.tdir, t.nin))) / D2R; ok(a >= LIT.tunnel[0] && a <= LIT.tunnel[1], `trocar ${t.id}: tunnel ${a.toFixed(1)}° to the surface (Teixeira 2009: 20–30°)`); } });
// D4 instruments only through their trocar: the shaft passes the port's pivot, and from the cannula to the tip stays in the eye's cavity; 23G = 0.6 mm (de Oliveira 2016)
def('D4', (P, ok) => { for (const k of ['core', 'depress']) { const st = P.PRESET[k], Gm = P.geom(st), f = P.makeCtx(Gm);
    for (const ins of st.inst) { const I = P.instGeom(Gm, ins), miss = P.segDist(I.port.pivot, I.tip, I.out); let bad = 0, n = 0;
      for (let t = 0; t <= 1; t += 0.02) { const p = add(I.tip, mul(sub(I.port.tip, I.tip), t)), c = f.at(p); n++; if (!(f.interior(c) < 0) || f.lens(c) < 0 || f.iris(c) < 0 || f.retina(c) < 0) bad++; }
      const r = (() => { const ax = unit(sub(I.out, I.tip)), side = unit(cross(ax, [0, 0, 1])), mid = add(I.tip, mul(ax, 2)); let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; f.inst(f.at(add(mid, mul(side, m)))) < 0 ? lo = m : hi = m; } return 2 * lo; })();
      ok(miss < 0.02 && bad === 0, `${k}: ${ins.kind} through trocar ${ins.port} (axis ${miss.toFixed(3)} mm from its pivot), cannula → tip inside the cavity (${bad}/${n} samples outside)`);
      ok(near(r, LIT.shaft, 0.01), `${k}: ${ins.kind} shaft ${r.toFixed(3)} mm (23G 0.6, de Oliveira 2016)`); } } });
// D5 phakic eye: no shaft passes through or touches the lens (≥ 0.5 mm away)
def('D5', (P, ok) => { for (const k of ['core', 'depress']) { const st = P.PRESET[k], Gm = P.geom(st), f = P.makeCtx(Gm);
    for (const ins of st.inst) { const I = P.instGeom(Gm, ins); let m = 9; for (let t = 0; t <= 1; t += 0.01) { const p = add(I.tip, mul(sub(I.port.pivot, I.tip), t)); m = Math.min(m, f.lens(f.at(p))); }
      ok(m > 0.5, `${k}: ${ins.kind} shaft stays ${m.toFixed(2)} mm from the lens`); } } });
// D6 infusion: tip in the vitreous cavity (default); the demonstration tip under the retina; under the 4:30 infusion port the retina is detached (narration 2-2)
def('D6', (P, ok) => { const base = Object.assign({}, P.PRESET.rrd, { troc: true }), Gm = P.geom(base), f = P.makeCtx(Gm), inf = P.troc(Gm).find(t => t.inf);
  ok(inside(f, 'cavity', inf.tip) && !inside(f, 'srf', inf.tip) && !inside(f, 'retina', inf.tip), 'infusion tip in the vitreous cavity');
  const sub_ = Object.assign({}, base, { troc: P.trocarsFor('OS').map(t => t.inf ? Object.assign({}, t, { tip: 'sub' }) : t) }), G2 = P.geom(sub_), f2 = P.makeCtx(G2), i2 = P.troc(G2).find(t => t.inf);
  ok(inside(f2, 'srf', i2.tip), 'demonstration: the misplaced infusion tip lies under the retina (subretinal fluid)');
  const sup = Object.assign({}, base, { troc: P.trocarsFor('OS').map(t => t.inf ? Object.assign({}, t, { tip: 'supra' }) : t) }), G3 = P.geom(sup), f3 = P.makeCtx(G3), i3 = P.troc(G3).find(t => t.inf), c3 = f3.at(i3.tip);
  ok(!inside(f3, 'cavity', i3.tip) && c3.dd > c3.T - 0.02 && c3.dd < c3.T + 0.1, 'demonstration: the suprachoroidal tip stays in the wall, just inside the sclera (not in the cavity)');
  let det = true; for (let s = oraLit(inf.h) + 1; s <= oraLit(inf.h) + 4; s += 0.5) if (!(Gm.H(s, inf.h) > 0.05)) det = false;
  ok(det, `under the ${inf.h} o'clock infusion the retina 1–4 mm behind the ora is detached (本例的剝離經過 temporal 下方)`); });
// D7 scleral depression at 11 o'clock: same clock in the section, the fundus chart and the wide view; pushed into view (narration 3-2, 5-2)
def('D7', (P, ok) => { const st = P.PRESET.depress, Gm = P.geom(st), dp = Gm.dep, p0 = Gm.ret0(dp.h, dp.s, 1), p1 = Gm.ret(dp.h, dp.s, 1), rd = Gm.H(dp.s, dp.h);
  ok(near(len(sub(p0, p1)), dp.depth + rd, 0.02), `indentation moves the retina inward by ${(len(sub(p0, p1)) - rd).toFixed(2)} mm (+ ${rd.toFixed(2)} mm detachment)`);
  const sec = P.section({ st, plane: G.planes.meridian(11), win: { x: 0, y: 0, w: 1, h: 1 }, noTissue: true }).A; ok(sec.dep_off < 0.02 && sec.dep[0] > 0, `section: the dent in the 11 o'clock meridian (${sec.dep_off.toFixed(3)} mm off), right side`);
  const fd = P.fundus({ st }).A, hf = clockOn(sub(fd.dep, fd.centre), [0, -1], [1, 0]); ok(near(hdiff(hf, 11), 0, 0.05), `fundus chart: the dent at ${hf.toFixed(2)} o'clock`);
  const W = P.wide({ st }), hw = clockOn(sub(W.A.dep, W.A.pole), [0, 1], [-1, 0]); ok(near(hdiff(hw, 11), 0, 0.05), `wide view: the mound at ${hw.toFixed(2)} o'clock (inverter on)`);
  const b0 = W.map.beta(P.geom(Object.assign({}, st, { dep: null })).ret(dp.h, dp.s, 1)), b1 = W.map.beta(p1);
  ok(b1 < b0 - 1 * D2R && b1 < W.map.bmax, `pushed into view: ${(b0 / D2R).toFixed(1)}° → ${(b1 / D2R).toFixed(1)}° from the viewing axis (field ±${(W.map.bmax / D2R).toFixed(0)}°)`); });
// D8 trocars at the same clock hour in the section, the fundus chart and the external microscope view
def('D8', (P, ok) => { const st = { eye: 'OS', troc: true }, fd = P.fundus({ st }).A, ex = P.ext({ st }).A;
  for (const t of P.troc(P.geom(st))) { const sec = P.section({ st, plane: G.planes.meridian(t.h), win: { x: 0, y: 0, w: 1, h: 1 }, noTissue: true }).A, k = 'troc_' + t.id;
    const hf = clockOn(fd[k], [0, -1], [1, 0]), he = clockOn(ex[k], [0, 1], [-1, 0]);
    ok(sec[k + '_off'] < 0.01 && sec[k][0] > 0 && near(hdiff(hf, t.h), 0, 0.02) && near(hdiff(he, t.h), 0, 0.02), `trocar ${t.id} at ${t.h} o'clock: section (right side), chart ${hf.toFixed(2)}, microscope ${he.toFixed(2)}`); } });
// D9 TA specks only on and in the gel (Burk 2003)
def('D9', (P, ok) => { const run = st => { const pl = G.planes.meridian(11), win = { x: -6, y: 4, w: 12, h: 8 }, s = P.section({ st, plane: pl, win, step: 0.12 }), f = P.makeCtx(P.geom(st)); let n = 0, bad = 0;
    for (const m of s.svg.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="[\d.]+" fill="#ffffff"/g)) { n++; if (!(f.gel(f.at(G.onPlane(pl, +m[1], +m[2]))) < 0)) bad++; } return { n, bad }; };
  const a = run({ eye: 'OS', ta: 1, pvd: 1, vit: { cut: 0.7 } }), b = run({ eye: 'OS', ta: 0, pvd: 1, vit: { cut: 0.7 } });
  ok(a.n > 20 && a.bad === 0, `TA: ${a.n} specks, ${a.bad} outside the gel`); ok(b.n === 0, 'no TA: no specks'); });
// D10 PVD: attached hyaloid at the pole before; detached behind the vitreous base but still attached there after
def('D10', (P, ok) => { const at = (st, h, s, e) => { const Gm = P.geom(st), f = P.makeCtx(Gm); return inside(f, 'gel', P.P3(h, s, P.Tp(s) + P.chorAt(s) + Gm.rtHS(h, s) + e)); };
  ok(at({ eye: 'OS', pvd: 0 }, 12, P.S_POLE - 0.5, 0.1), 'no PVD: gel on the retina at the posterior pole');
  ok(!at({ eye: 'OS', pvd: 1 }, 12, P.S_POLE - 0.5, 0.1) && !at({ eye: 'OS', pvd: 1 }, 12, P.S_POLE - 0.5, 2.0), 'PVD: no gel within 2 mm of the posterior pole');
  ok(at({ eye: 'OS', pvd: 1 }, 3, oraLit(3) + 0.5, 0.1), 'PVD: gel still on the retina at the vitreous base'); });
// D13 PVD over the detachment (2026-11-12; Govetto 2024: every eye with a tear has a PVD). Measured on the drawn gel along the wall's inward normal from the
// retina as it is now (detached, bulging): behind the vitreous base (outside the tear and its flap, not at the disc) the hyaloid is off the retina from 1 mm
// on and ≥ 3.5 mm off it from 5 mm on (示意, CARD.md), also over the bullous part; in the vitreous base and on the flap's free edge the gel touches it.
// Smooth: along the 5 o'clock meridian (the section of the videos) the retina rises twice (the inferior detachment, then the macular tongue) but the
// hyaloid rises once and stays (it does not follow the tongue), and along 11 o'clock it has one hump at most. After a core vitrectomy the gel left over the
// bulge is as thick as over attached retina (the gel body is displaced, not cut away)
def('D13', (P, ok) => { const st = P.PRESET.rrd, Gm = P.geom(st), f = P.makeCtx(Gm), T = Gm.tear, vbp = h => P.vbPostAt(h, 1);
  // the first gel along n from p (mm; 0 when p is in the gel) and where that gel ends
  const gelRun = (ff, p, n, max = 14) => { const g = d => ff.gel(ff.at(add(p, mul(n, d)))) < 0; let d = 0; while (d <= max && !g(d)) d += 0.05; if (d > max) return [max, max];
    let a = d; if (d > 0) { let lo = d - 0.05, hi = d; for (let k = 0; k < 8; k++) { const m = (lo + hi) / 2; g(m) ? hi = m : lo = m; } a = hi; }
    let e = d; while (e <= max && g(e)) e += 0.05; return [a, e]; };
  const inward = (h, s) => mul(P.N3(h, s), -1), gapAt = (h, s, ff = f, G2 = Gm) => gelRun(ff, G2.ret(h, s, 1), inward(h, s))[0];
  const skip = (h, s) => (Math.abs(hdiff(h, CASE.tear)) < 0.6 && s < vbp(h) + T.L + 1.5) || f.at(Gm.ret(h, s, 1)).dq < 1.3;   // the tear and its flap; the disc
  let off = 9, full = 9, offAt = '', fullAt = '', n = 0, Hbig = 0, nBig = 0;
  for (let h = 0.5; h <= 12; h += 0.5) for (let s = vbp(h) + 1; s <= P.S_POLE - 0.4; s += 0.5) { if (skip(h, s)) continue; const g = gapAt(h, s), H = Gm.H(s, h); n++;
    if (s < vbp(h) + LIT.pvdRise) { if (g < off) { off = g; offAt = `${h} o'clock ${(s - vbp(h)).toFixed(1)} mm behind the base`; } }
    else { if (g < full) { full = g; fullAt = `${h} o'clock ${(s - vbp(h)).toFixed(1)} mm behind the base, retina detached ${H.toFixed(2)} mm`; } if (H >= 3) { nBig++; Hbig = Math.max(Hbig, H); } } }
  ok(n > 300 && off >= 0.1 && full >= LIT.pvdGap - 0.05 && nBig > 10,
    `PVD, ${n} points behind the vitreous base: hyaloid off the retina as it is now ≥ ${off.toFixed(2)} mm within ${LIT.pvdRise} mm of the base (${offAt}), ≥ ${full.toFixed(2)} mm beyond (${fullAt}; 示意 ${LIT.pvdGap}), ${nBig} of them over retina detached ≥ 3 mm (up to ${Hbig.toFixed(2)})`);
  let vb = 0; for (let h = 0.5; h <= 12; h += 1) for (const s of [oraLit(h) + 0.3, (oraLit(h) + vbp(h)) / 2, vbp(h) - 0.3]) vb = Math.max(vb, gapAt(h, s));
  const fe = P.flapPt(T, T.L, 0), onFlap = [[0, 0, 0], [0.12, 0, 0], [0, 0.12, 0], [0, 0, 0.12], [-0.12, 0, 0], [0, -0.12, 0], [0, 0, -0.12]].some(e => inside(f, 'gel', add(fe, e)));
  ok(vb <= 0.05 && onFlap, `gel on the retina in the vitreous base all round (gap ≤ ${vb.toFixed(2)} mm) and on the flap's free edge (${onFlap ? 'yes' : 'no'})`);
  // smoothness: humps of a profile (a rise then a fall, each more than 0.1 mm; the macular tongue is 0.5 mm high)
  const humps = v => { let n = 0, up = null, ext = v[0];
    for (const x of v) { if (up === null) { if (Math.abs(x - ext) > 0.1) { up = x > ext; ext = x; } }
      else if (up) { if (x > ext) ext = x; else if (x < ext - 0.1) { n++; up = false; ext = x; } }
      else { if (x < ext) ext = x; else if (x > ext + 0.1) { up = true; ext = x; } } }
    return n; };
  const prof = h => { const hy = [], rt = []; for (let s = vbp(h) + 1; s <= P.S_POLE - 0.4; s += 0.25) { hy.push(gelRun(f, Gm.ret0(h, s, 1), inward(h, s))[0]); rt.push(Gm.H(s, h)); } return { hy: humps(hy), rt: humps(rt) }; };
  const p5 = prof(5), p11 = prof(11);
  ok(p5.rt >= 2 && p5.hy === 0 && p11.hy <= 1, `smooth hyaloid: along 5 o'clock the retina has ${p5.rt} humps (detachment, macular tongue), the hyaloid ${p5.hy}; along 11 o'clock the hyaloid has ${p11.hy}`);
  const cut = Object.assign({}, st, { vit: { cut: 0.85 } }), Gc = P.geom(cut), fc = P.makeCtx(Gc), thick = (h, s) => { const r = gelRun(fc, Gc.ret(h, s, 1), inward(h, s)); return r[1] - r[0]; };
  const tB = Math.min(...[[1, 15], [1.5, 16], [12, 15]].map(([h, s]) => thick(h, s))), tA = thick(9, 18);
  ok(Gc.H(15, 1) >= 3 && near(tB, tA, 0.2), `core vitrectomy: the gel left is ${tB.toFixed(2)} mm thick over the bullous detachment, ${tA.toFixed(2)} mm over attached retina`); });
// D11 PFCL (supine): sinks to the posterior pole, flattens the retina under it, the 11 o'clock tear above it (fluid leaves there; narration 6-1)
def('D11', (P, ok) => { const st = P.PRESET.pfcl, Gm = P.geom(st), f = P.makeCtx(Gm), up = p => -dot(p, Gm.g), L = Gm.lev.pfcl;
  ok(inside(f, 'pfcl', P.P3(12, P.S_POLE - 0.3, P.Tp(P.S_POLE) + 0.254 + 0.5)) && !inside(f, 'pfcl', [0, 0, 4]), 'PFCL at the posterior pole, not at the front of the cavity');
  let flat = 0, n = 0; for (let h = 0.5; h <= 12; h += 0.5) for (let s = 8; s < 31; s += 0.5) { const q = P.rpeAt(h, s); if (up(q) < L - 0.4) { n++; flat = Math.max(flat, Gm.H(s, h)); } }
  ok(n > 50 && flat < 0.01, `retina under the PFCL flat (${n} points, max height ${flat.toFixed(3)} mm)`);
  ok(up(Gm.tear.fr.Q) > L + 1, `the 11 o'clock tear ${(up(Gm.tear.fr.Q) - L).toFixed(1)} mm above the PFCL surface (fluid pushed forward leaves there)`); });
// D12 laser round the tear: all round, outside the hole, on attached retina (only attached retina takes laser)
def('D12', (P, ok) => { const st = P.PRESET.laser, Gm = P.geom(st), T = Gm.tear, sp = P.laserSpots(Gm), c0 = [T.L / 2 - 0.2, 0];
  const angs = sp.map(q => { const d = sub(q.p, T.fr.Q); return Math.atan2(dot(d, T.fr.ec) - c0[1], dot(d, T.fr.eu) - c0[0]) / D2R; }).sort((a, b) => a - b);
  let gap = 0; for (let i = 0; i < angs.length; i++) gap = Math.max(gap, ((angs[(i + 1) % angs.length] - angs[i]) + 360) % 360 || 360);
  const dist = sp.map(q => { const d = sub(q.p, T.fr.Q); return P.sdU(dot(d, T.fr.eu), dot(d, T.fr.ec), T.w, T.L); }), Hm = Math.max(...sp.map(q => Gm.H(q.s, q.h)));
  ok(sp.length > 20 && gap < 30, `${sp.length} laser spots all round the tear (largest gap ${gap.toFixed(0)}°)`);
  ok(Math.min(...dist) > 0.3 && Math.max(...dist) < 1.5, `spots ${Math.min(...dist).toFixed(2)}–${Math.max(...dist).toFixed(2)} mm outside the edge of the hole`);
  ok(Hm < 0.01, `laser only on attached retina (max height ${Hm.toFixed(3)} mm)`); });

// E1 fluid surfaces perpendicular to gravity: horizontal in the gravity-down head view, in every head position
def('E1', (P, ok) => { for (const head of [{ pose: 'supine' }, { pose: 'sit' }, { pose: 'facedown' }, { pose: 'sit', tilt: 30 }, { pose: 'supine', tilt: -20 }]) {
    const st = { eye: 'OS', tear: { h: 11 }, vit: { cut: 1, shave: 1 }, gas: 0.45, pfcl: 0.2, head }, H = P.head({ st, noTissue: true }), A = H.A, pl = H.plane, f = P.makeCtx(P.geom(st));
    const trans = (name, x) => { let last = null; for (let y = -12; y <= 12; y += 0.01) { const inn = inside(f, name, G.onPlane(pl, x, y)); if (last !== null && inn !== last && f.cavity(f.at(G.onPlane(pl, x, y))) < -0.2) return y; last = inn; } return null; };
    const gy = [-4, 0, 4].map(x => trans('gas', x)), py = [-4, 0, 4].map(x => trans('pfcl', x));
    ok(A.gasLineA && near(A.gasLineA[1], A.gasLineB[1], 0.02) && gy.every(v => v !== null && near(v, gy[0], 0.06)) && py.every(v => v !== null && near(v, py[0], 0.06)),
      `${head.pose}${head.tilt ? ' tilt ' + head.tilt : ''}: gas surface at y ${gy.map(v => v && v.toFixed(2))}, PFCL at ${py.map(v => v && v.toFixed(2))} (horizontal with gravity down)`); } });
// E2 gas rises to the highest part of the cavity and PFCL sinks, whatever the head position (narration 8-1)
def('E2', (P, ok) => { const V = P.voxels();
  for (const [pose, g] of [['supine', [0, 0, -1]], ['sit', [0, -1, 0]], ['facedown', [0, 0, 1]]]) { const st = { eye: 'OS', gas: 0.3, pfcl: 0.3, head: { pose } }, Gm = P.geom(st), f = P.makeCtx(Gm); let top = null, bot = null, tu = -1e9, bu = 1e9;   // gravity: supine → posterior, sitting → inferior, face-down → anterior
    for (let i = 0; i < V.n; i += 3) { const p = [V.xs[3 * i], V.xs[3 * i + 1], V.xs[3 * i + 2]], u = -dot(p, g); if (f.cavity(f.at(p)) > -0.3) continue; if (u > tu) { tu = u; top = p; } if (u < bu) { bu = u; bot = p; } }
    ok(inside(f, 'gas', top) && !inside(f, 'gas', bot) && inside(f, 'pfcl', bot) && !inside(f, 'pfcl', top), `${pose}: gas at the top of the cavity, PFCL at the bottom`); }
  const fov = (pose) => { const st = { eye: 'OS', gas: 0.3, head: { pose } }, f = P.makeCtx(P.geom(st)); return inside(f, 'gas', P.P3(12, P.S_POLE - 0.3, P.Tp(P.S_POLE) + 0.254 + 0.6)); };
  ok(fov('facedown') && !fov('sit') && !fov('supine'), 'changing the head position moves the bubble: over the macula only face-down'); });
// E3 the gas above its surface fills the requested share of the cavity (independent integration on a shifted grid)
def('E3', (P, ok) => { for (const [pose, fr] of [['sit', 0.2], ['supine', 0.5], ['facedown', 0.8]]) { const st = { eye: 'OS', gas: fr, head: { pose } }, Gm = P.geom(st), L = Gm.lev.gas; let n = 0, m = 0;
    let k = 0; for (let x = -11.8; x < 12; x += 0.5) for (let y = -11.8; y < 12; y += 0.5) for (let z = -11.8; z < 9; z += 0.5) { k++; const p = [x + 0.5 * G.hash(k, 7) - 0.25, y + 0.5 * G.hash(k, 8) - 0.25, z + 0.5 * G.hash(k, 9) - 0.25]; if (len(p) > 12.1 || !P.cavity0(p)) continue; n++; if (-dot(p, Gm.g) > L) m++; }
    ok(near(m / n, fr, 0.012), `${pose}: gas ${fr * 100}% → ${(m / n * 100).toFixed(1)}% of the cavity above its surface`); } });
// E4 sitting upright, the bubble must fill at least ≈ 3.5% (推算, CARD.md) to cover the whole 11 o'clock tear (narration 8-1: 坐正 … 氣泡就頂得到它)
def('E4', (P, ok) => { const st = Object.assign({}, P.PRESET.rrd, { rd: { amt: 0 }, head: { pose: 'sit' } }), fc = P.coverFraction(st);
  const covered = fr => { const Gm = P.geom(Object.assign({}, st, { gas: fr })), T = Gm.tear, L = Gm.lev.gas; return P.uOutline(T.w, T.L).every(q => -dot(P.onRetina(Gm, T.fr0, q[0], q[1], 1, Gm.ret0).p, Gm.g) > L); };
  ok(near(fc, LIT.coverSit, 0.004), `smallest bubble covering the tear sitting upright: ${(fc * 100).toFixed(1)}% of the cavity (CARD.md: 3.5%, 推算)`);
  ok(covered(LIT.coverSit + 0.006) && !covered(LIT.coverSit - 0.01), `sitting: ${((LIT.coverSit + 0.006) * 100).toFixed(1)}% covers the tear, ${((LIT.coverSit - 0.01) * 100).toFixed(1)}% does not`); });
// E5 phakic eye: gas touches the lens most when supine, less sitting, not face-down (Kanclerz 2018: avoid supine)
def('E5', (P, ok) => { const share = pose => { const st = { eye: 'OS', gas: 0.5, head: { pose } }, f = P.makeCtx(P.geom(st)), L = P.LENS; let n = 0, m = 0;
    for (let r = 0; r <= 4.2; r += 0.3) for (let t = 0; t < 360; t += 20) { const z = L.zPost(r) - 0.15, p = [r * Math.cos(t * D2R), r * Math.sin(t * D2R), z]; if (!inside(f, 'cavity', p)) continue; n++; if (inside(f, 'gas', p)) m++; } return m / n; };
  const su = share('supine'), si = share('sit'), fd = share('facedown'); ok(su > 0.95 && si < su - 0.2 && fd === 0, `gas on the back of the lens: supine ${(su * 100).toFixed(0)}%, sitting ${(si * 100).toFixed(0)}%, face-down ${(fd * 100).toFixed(0)}%`); });
// E6 face-down puts the bubble over the macula (narration 8-2); sitting with a small bubble does not
def('E6', (P, ok) => { const m = (pose, fr) => { const f = P.makeCtx(P.geom({ eye: 'OS', gas: fr, head: { pose } })); return inside(f, 'gas', P.P3(12, P.S_POLE - 0.3, P.Tp(P.S_POLE) + 0.254 + 0.6)); };
  ok(m('facedown', 0.2) && !m('sit', 0.3), 'face-down: a 20% bubble covers the fovea; sitting, a 30% bubble does not'); });
// E7 tilting the head toward the left shoulder by 30° puts the 11 o'clock meridian on top: a smaller bubble covers the tear
def('E7', (P, ok) => { const g = P.gravity({ head: { pose: 'sit', tilt: 30 } }), up = mul(g, -1), c11 = [...clockDir(11), 0];
  ok(Math.acos(Math.min(1, dot(up, c11))) / D2R < 0.5, `sitting, head 30° toward the left shoulder: up = the 11 o'clock direction (${(Math.acos(Math.min(1, dot(up, c11))) / D2R).toFixed(2)}° off)`);
  const st = Object.assign({}, P.PRESET.rrd, { rd: { amt: 0 } }), a = P.coverFraction(Object.assign({}, st, { head: { pose: 'sit' } })), b = P.coverFraction(Object.assign({}, st, { head: { pose: 'sit', tilt: 30 } }));
  ok(b < a, `bubble needed: upright ${(a * 100).toFixed(1)}%, tilted ${(b * 100).toFixed(1)}%`); });

// F1 every view of every preset draws without NaN / undefined
def('F1', (P, ok) => { let bad = []; for (const [k, st] of Object.entries(P.PRESET)) { const outs = [P.section({ st, plane: G.planes.meridian(11), win: { x: -13, y: -14, w: 26, h: 28 }, step: 0.4 }).svg, P.fundus({ st }).svg, P.wide({ st }).svg, P.head({ st, step: 0.5 }).svg, P.ext({ st }).svg];
    outs.forEach((s, i) => { if (/NaN|undefined|Infinity/.test(s)) bad.push(`${k}#${i}`); }); }
  ok(bad.length === 0, `no NaN / undefined in sections, fundus, wide, head and microscope views of ${Object.keys(P.PRESET).length} presets ${bad.join(' ')}`); });
// F2 the views registered for videos/tools draw
def('F2', (P, ok, V) => { const need = ['sec', 'secz', 'fundus', 'wide', 'head', 'ext', 'port']; const miss = need.filter(k => !V || !V[k]);
  ok(miss.length === 0, `views registered: ${need.join(', ')}${miss.length ? ' — missing ' + miss.join(', ') : ''}`);
  if (!miss.length) { const st = Object.assign({}, P.PRESET.setup, { view: { step: 0.5 } }), bad = need.filter(k => { const s = V[k].draw(st, 'c' + k); return typeof s !== 'string' || s.length < 100 || /NaN|undefined/.test(s); }); ok(bad.length === 0, `every view draws the case ${bad.join(' ')}`); } });
// N1 the narration still says what these checks verify (videos/src/rrd-ppv-c3f8/anim/segments.js)
def('N1', (P, ok, V, NARR) => { const say = (id, re) => { const s = NARR.find(x => x[0] === id); return s && re.test(s[1]); };
  for (const [id, re, what] of [['1-1', /左眼的 3 點是 temporal，9 點是 nasal/, 'B1'], ['1-1', /11 點半開始，經過 12 點和 3 點/, 'C2'], ['1-1', /一路到 5 點，大約五個半鐘點/, 'C2'], ['1-1', /fovea 還貼著/, 'C4'],
    ['1-1', /黃斑在視盤的 temporal 側/, 'B2'], ['1-1', /裂孔在 11 點/, 'C1'], ['2-1', /4 mm 落在 ora 前面的 pars plana/, 'D1'], ['2-1', /顳側約 7\.6 mm，鼻側約 7\.0 mm/, 'A1'], ['2-2', /inferotemporal 的套管底下，視網膜可能是剝離的/, 'D6'],
    ['3-1', /上下顛倒、左右相反/, 'B4'], ['3-2', /左眼的 12 點在畫面下方，temporal 在畫面左邊/, 'B3'], ['3-2', /11 點，在畫面上靠近下方、略偏右/, 'B3'], ['3-2', /上方略偏鼻側/, 'B1'], ['3-2', /畫面上會在 11 點看到一個隆起/, 'D7'],
    ['5-1', /跨在 ora 上；裂孔通常就在它的後緣/, 'A3, C6'], ['5-1', /被玻璃體往前拉著/, 'C7'], ['5-2', /周邊的視網膜被推進視野/, 'D7'], ['6-1', /從後往前把視網膜壓平/, 'D11'], ['6-1', /從原本 11 點的裂孔排出去/, 'D11'],
    ['6-2', /浮在上面/, 'E2'], ['8-1', /會浮到眼內最高的地方/, 'E2'], ['8-1', /坐正或頭抬高，氣泡就頂得到它/, 'E4'], ['8-1', /要避免平躺/, 'E5'], ['9', /左眼的 11 點，在畫面下方略偏右/, 'B3']])
    ok(say(id, re), `narration ${id} says 「${re.source.replace(/\\/g, '')}」 (checked by ${what})`); });

// ---------------------------------------------------------------- run
function runChecks(P, V, NARR, ids) { const res = []; for (const c of CHECKS) { if (ids && !ids.includes(c.id)) continue; const ok = (cond, msg) => res.push({ id: c.id, ok: !!cond, msg });
    try { c.fn(P, ok, V, NARR); } catch (e) { res.push({ id: c.id, ok: false, msg: 'threw ' + (e && e.message) }); } } return res; }
// mutations: [name, target check ids, { src: [[find, replace]…] in posterior.js, views: […] in views.js, narr: fn }]
const MUT = [
  ['ora from globe/ (6.2 mm) instead of Li 2025', ['A1'], { src: [['oraT: 7.58, oraN: 6.96,', 'oraT: 6.2, oraN: 6.2,']] }],
  ['ora interpolated along the vertical instead of temporal–nasal', ['A1'], { src: [['(N.oraT - N.oraN) / 2 * clockDir(h)[0] * ts', '(N.oraT - N.oraN) / 2 * clockDir(h)[1] * ts']] }],
  ['pars plicata 3.5 mm', ['A2'], { src: [['plicata: 2.0,', 'plicata: 3.5,']] }],
  ['vitreous base front border 0.5 mm', ['A3'], { src: [['vbAnt: 2.0,', 'vbAnt: 0.5,']] }],
  ['vitreous base back border 5 mm', ['A3', 'C6'], { src: [['vbPost: 2.0,', 'vbPost: 5.0,']] }],
  ['round disc', ['A4'], { src: [['discV: 1.92, discH: 1.76,', 'discV: 1.80, discH: 1.80,']] }],
  ['disc–fovea angle sign flipped', ['A5'], { src: [['dfDist: 4.76, dfAng: 7.76,', 'dfDist: 4.76, dfAng: -7.76,']] }],
  ['disc–fovea 3.5 mm', ['A5'], { src: [['dfDist: 4.76, dfAng: 7.76,', 'dfDist: 3.5, dfAng: 7.76,']] }],
  ['inner macular ring thickened', ['A7'], { src: [['[1.0, 0.262], [1.3, 0.259]', '[1.0, 0.32], [1.3, 0.31]']] }],
  ['peripheral retina not thinned at the ora', ['A7'], { src: [['lerp(0.10, 0.18, clamp((s - ora) / (S_EQ - ora), 0, 1)) : RT_MAC', 'lerp(0.18, 0.18, clamp((s - ora) / (S_EQ - ora), 0, 1)) : RT_MAC']] }],
  ['subfoveal choroid 0.35', ['A8'], { src: [['chorPole: 0.254,', 'chorPole: 0.35,']] }],
  ['posterior sclera kept at the equator value (globe/ beyond 14 mm)', ['A9'], { src: [['sclMid: 0.65, sclPole: 0.94,', 'sclMid: 0.42, sclPole: 0.42,']] }],
  ['globe/ lens (4.0 × 9.0)', ['A10'], { src: [['lensT: 4.5, lensD: 9.6,', 'lensT: 4.0, lensD: 9.0,']] }],
  ['cavity measured to the outside of the eye wall', ['A11'], { src: [['return W.d > inner;', 'return W.d > 0;']] }],
  ['outer profile scaled 1 %', ['A12'], { src: [['const p = G.prof(i * DPHI); PZ[i] = p[0]; PR[i] = p[1];', 'const p = G.prof(i * DPHI); PZ[i] = p[0] * 1.01; PR[i] = p[1] * 1.01;']] }],
  ['eye side swapped in the clock names', ['B1'], { src: [["const ts = eye === 'OS' ? 1 : -1, [cx, cy] = clockDir(h), t = cx * ts", "const ts = eye === 'OS' ? -1 : 1, [cx, cy] = clockDir(h), t = cx * ts"]] }],
  ['fundus chart mirrored', ['B2', 'C1', 'D7', 'D8'], { src: [['const proj = p => { const c = chart3(p); return [c[0], -c[1]]; };', 'const proj = p => { const c = chart3(p); return [-c[0], -c[1]]; };']] }],
  ['wide view drawn for a surgeon at 6', ['B3', 'C1', 'D7'], { src: [['M = G.enfaceMap(st.surgeon ?? 12), inv', 'M = G.enfaceMap(6), inv']] }],
  ['inverter off only mirrors left–right', ['B4'], { src: [['m = M([w.sx * k, -w.sy * k, 0]); return [inv * m[0], inv * m[1]]; };', 'm = M([w.sx * k, -w.sy * k, 0]); return [inv * m[0], m[1]]; };']] }],
  ['section seen from the wrong side', ['B5'], { src: [['hv = clockOf(-look[0], -look[1]);', 'hv = clockOf(look[0], look[1]);']] }],
  ['tear marker 1.5 mm off its meridian', ['C1'], { src: [['A.tear = proj(onRetina(Gm, fr, T.L / 2, 0, 0, fn).p);', 'A.tear = proj(onRetina(Gm, fr, T.L / 2, 1.5, 0, fn).p);']] }],
  ['detachment starting at 10:30', ['C2'], { src: [['for (let h = 11.5; h <= 17.0 + 1e-9; h += 0.25) out.push(P(h, 1.0));', 'for (let h = 10.5; h <= 17.0 + 1e-9; h += 0.25) out.push(P(h, 1.0));'], ['P(11.4, 7.7), P(11.5, 7.15), P(11.5, 4.0));', 'P(10.6, 7.7), P(10.5, 7.15), P(10.5, 4.0));']] }],
  ['detachment border not around the tear', ['C3'], { src: [['out.push(P(11.15, 14.2), P(10.55, 12.4), P(10.45, 10.4), P(10.5, 9.0), P(10.9, 8.4), P(11.4, 7.7), P(11.5, 7.15), P(11.5, 4.0));', 'out.push(P(11.6, 14.2), P(11.6, 12.4), P(11.6, 10.4), P(11.6, 9.0), P(11.6, 8.4), P(11.6, 7.7), P(11.5, 7.15), P(11.5, 4.0));']] }],
  ['detachment tongue over the fovea', ['C4'], { src: [['[-1.3, -0.78], [0, -0.62], [1.3, -0.68]', '[-1.3, 0.3], [0, 0.4], [1.3, 0.3]']] }],
  ['shallow detachment', ['C5'], { src: [["Object.assign({ amt: 1, lo: 0.5, hi: 3.5 }, st.rd)", "Object.assign({ amt: 1, lo: 0.5, hi: 0.8 }, st.rd)"]] }],
  ['tear hinge in front of the ora', ['C6'], { src: [['sh = t.s ?? vbPostAt(t.h, ts);', 'sh = t.s ?? oraAt(t.h, ts) - 0.5;']] }],
  ['tear 1.2 mm', ['C6'], { src: [["Object.assign({ h: 11, w: 1.8, L: 1.8, flap: 95 }, st.tear)", "Object.assign({ h: 11, w: 1.2, L: 1.8, flap: 95 }, st.tear)"]] }],
  ['flap only lifted 40°', ['C7'], { src: [["Object.assign({ h: 11, w: 1.8, L: 1.8, flap: 95 }, st.tear)", "Object.assign({ h: 11, w: 1.8, L: 1.8, flap: 40 }, st.tear)"]] }],
  ['no gel on the flap', ['C7'], { src: [['if (cord && cord.b) gg = Math.min(gg,', 'if (false) gg = Math.min(gg,']] }],
  ['trocars at 7.5 mm', ['D1'], { src: [['trocS: 4.0,', 'trocS: 7.5,']] }],
  ['infusion at 7:30 in the left eye', ['D2', 'D6'], { src: [["id: 'it', h: os ? 4.5 : 7.5, inf: true", "id: 'it', h: os ? 7.5 : 4.5, inf: true"]] }],
  ['tunnel 45°', ['D3'], { src: [['tunnel: 25,', 'tunnel: 45,']] }],
  ['shaft not through the trocar', ['D4'], { src: [['dir = unit(sub(port.pivot, tip)), out', 'dir = unit(sub(add(port.pivot, [0, 0, 1.5]), tip)), out']] }],
  ['20G shaft', ['D4'], { src: [['shaft: 0.6,', 'shaft: 0.9,']] }],
  ['vitrector reaching the opposite vitreous base', ['D5'], { src: [["inst: [{ kind: 'vitrector', port: 'sn', tip: { h: 11, s: 9.6, e: 1.0 } }", "inst: [{ kind: 'vitrector', port: 'sn', tip: { h: 4.5, s: 9.0, e: 1.0 } }"]] }],
  ['demonstration infusion tip in the cavity', ['D6'], { src: [['Math.max(0.05, Gm.H(ss_, h) * 0.5)', 'Gm.H(ss_, h) + 2']] }],
  ['suprachoroidal demonstration tip in the cavity', ['D6'], { src: [['tipTarget = P3(h, s + 1.6, Tw + 0.02);', 'tipTarget = P3(h, s + 1.6, Tw + 2);']] }],
  ['indentation 1 clock hour off', ['D7'], { src: [['const dc = dh * 30 * D2R * surfAt(dep.s).rho;', 'const dc = (dh - 1) * 30 * D2R * surfAt(dep.s).rho;']] }],
  ['indentation bulging outward', ['D7'], { src: [['frac * rtHS(h, s) + Dp(s, h));', 'frac * rtHS(h, s) - Dp(s, h));']] }],
  ['trocar marks half an hour off on the chart', ['D8'], { src: [['const q = proj(P3(t.h, t.s, 0.6));', 'const q = proj(P3(t.h + 0.5, t.s, 0.6));']] }],
  ['TA outside the gel', ['D9'], { src: [['gg = f.gel(c); if (!(gg < 0)) continue;', 'gg = f.gel(c); if (!(gg < 3)) continue;']] }],
  ['TA drawn without TA', ['D9'], { src: [["if (!(st.ta > 0)) return ''; const o = [], cell", "if (!(st.ta > -1)) return ''; const o = [], cell"], ['if (r3 > 0.55 * st.ta) continue;', 'if (r3 > 0.55) continue;']] }],
  ['PVD never detaches', ['D10'], { src: [['hy = h0 + B * (he - h0) + R * N.pvdGap;', 'hy = h0 + B * (he - h0) + R * N.pvdGap * 0;']] }],
  ['hyaloid kept where the retina lies when attached (gel on the bulging retina)', ['D13'], { src: [['hy = h0 + B * (he - h0) + R * N.pvdGap;', 'hy = R * N.pvdGap;']] }],
  ['hyaloid follows the retina as it is now (bumps of the macular tongue)', ['D13'], { src: [['he = R > 0 ? Math.max(Gm.env(c.fx, c.fy), h0) : h0, hy', 'he = h0, hy']] }],
  ['gel left after core vitrectomy cut away over the bulge', ['D13'], { src: [['e - shell - B * he);', 'e - shell);']] }],
  ['hyaloid comes off inside the vitreous base', ['D13'], { src: [['const hyaSp = h => lerp(S_POLE + 2, vbPostAt(h, ts), st.pvd || 0);', 'const hyaSp = h => lerp(S_POLE + 2, oraAt(h, ts) - 1, st.pvd || 0);']] }],
  ['PFCL does not flatten', ['D11'], { src: [['return ss(lev.pfcl - 0.2, lev.pfcl + 0.8, up); };', 'return 1; };']] }],
  ['PFCL floats', ['D11', 'E2'], { src: [['pfcl: pf > 0 ? q(pf) : -1e9', 'pfcl: pf > 0 ? q(1 - pf) : -1e9'], ['Math.max(cav(c), -dot(c.p, g) - lev.pfcl)', 'Math.max(cav(c), dot(c.p, g) + lev.pfcl)']] }],
  ['laser without the posterior arc', ['D12'], { src: [['for (let a = -90; a <= 90; a += 2) add_(', 'for (let a = -90; a <= -88; a += 2) add_(']] }],
  ['laser on detached retina', ['D12'], { src: [["laser: Object.assign({}, CASE, { rd: { amt: 0 }, troc: true, vit: { cut: 1, shave: 1 }, gas: 1, laser: 1 }),", "laser: Object.assign({}, CASE, { rd: { amt: 1 }, troc: true, vit: { cut: 1, shave: 1 }, gas: 1, laser: 1 }),"]] }],
  ['gas surface tilted', ['E1'], { src: [['Math.max(cav(c), lev.gas + dot(c.p, g))', 'Math.max(cav(c), lev.gas + dot(c.p, g) + 0.2 * c.p[0])']] }],
  ['gravity upward when sitting', ['E2'], { src: [["if (hd.pose === 'sit') return [Math.sin(t), -Math.cos(t), 0];", "if (hd.pose === 'sit') return [Math.sin(t), Math.cos(t), 0];"]] }],
  ['gas level from 80 % of the fraction', ['E3'], { src: [['gas: gf > 0 ? q(1 - gf) : 1e9', 'gas: gf > 0 ? q(1 - gf * 0.8) : 1e9']] }],
  ['tear 1 mm further back', ['E4'], { src: [['vbPost: 2.0,', 'vbPost: 3.0,']] }],
  ['supine gravity like sitting', ['E5'], { src: [['return [Math.sin(t), 0, -Math.cos(t)];\n  }', 'return [Math.sin(t), -Math.cos(t), 0];\n  }']] }],
  ['face-down gravity backwards', ['E6'], { src: [["if (hd.pose === 'facedown') return [Math.sin(t), 0, Math.cos(t)];", "if (hd.pose === 'facedown') return [Math.sin(t), 0, -Math.cos(t)];"]] }],
  ['head tilt to the wrong shoulder', ['E7'], { src: [["if (hd.pose === 'sit') return [Math.sin(t), -Math.cos(t), 0];", "if (hd.pose === 'sit') return [-Math.sin(t), -Math.cos(t), 0];"]] }],
  ['NaN in the chart', ['F1'], { src: [['r="${(Gm.dep.w * 1.3).toFixed(2)}"', 'r="${(Gm.dep.w * NaN).toFixed(2)}"']] }],
  ['wide view not registered', ['F2'], { views: [["  wide: { title:", "  wide_: { title:"]] }],
  ['narration says 略偏左', ['N1'], { narr: N => N.map(([id, t]) => [id, t.replace('略偏右', '略偏左')]) }],
];
const apply = (src, subs, what) => { for (const [a, b] of subs || []) { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`${what}: 「${a.slice(0, 60)}」 found ${n} times`); src = src.replace(a, b); } return src; };

const P0 = load(SRC), V0 = loadViews(VSRC, P0);
const res = runChecks(P0, V0, NARR0);
for (const r of res) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.id} ${r.msg}`);
let fail = res.filter(r => !r.ok).length;
const ids = CHECKS.map(c => c.id);
if (!process.argv.includes('--no-selftest')) {
  let bad = 0; const covered = new Set();
  for (const [name, targets, m] of MUT) { let P, V, NARR = NARR0, out;
    try { P = load(apply(SRC, m.src, name)); V = loadViews(apply(VSRC, m.views, name), P); if (m.narr) NARR = m.narr(NARR0); out = runChecks(P, V, NARR, targets); }
    catch (e) { console.log(`FAIL selftest 「${name}」: ${e.message}`); bad++; continue; }
    const caught = targets.filter(id => out.some(r => r.id === id && !r.ok)); caught.forEach(id => covered.add(id));
    const ok = caught.length === targets.length; if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → caught by ${caught.join(', ') || 'nothing'}${ok ? '' : ' (expected ' + targets.join(', ') + ')'}`); }
  const unc = ids.filter(id => !covered.has(id)); if (unc.length) { console.log(`FAIL selftest: checks never broken on purpose: ${unc.join(', ')}`); bad++; }
  else console.log(`PASS selftest: all ${ids.length} checks are caught by at least one of ${MUT.length} mutations`);
  fail += bad;
}
console.log(fail ? `${fail} check(s) failed` : `all posterior-model checks passed (${ids.length} checks, ${res.length} assertions)`);
process.exit(fail ? 1 : 0);
