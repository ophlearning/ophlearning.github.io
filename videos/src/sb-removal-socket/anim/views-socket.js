// Socket-model view wrappers for this video. The kit's VIEWS (videos/tools/video-kit/kit.js) wraps the eyelid views only; these follow the
// same camera and return shape ({ svg, A = anchors in panel px, M = anchors in mm, k, P, r = the model's full return }) for the socket
// model (videos/models/socket, CARD.md). check.js loads this file in node too: the states, windows and clock hours below are what the
// video draws, and what its model checks look at.
//   VS.sec(st, W, H, win, id, h)   meridional section through clock hour h (right = h, left = h + 6), anterior (surgeon) up
//   VS.front(st, W, H, win, id)    surgeon's view of the OS socket, surgeon at 12: down = 12, left = 3 (temporal), right = 9 (nasal)
const VS = (() => {
  const S = SOCKET;
  const cam = (win, W, H) => { const k = Math.min(W / win.w, H / (win.h || win.w * H / W)), x0 = win.x, y0 = win.y;
    return { k, tf: `scale(${k}) translate(${-x0} ${-y0})`, P: p => [(p[0] - x0) * k, (p[1] - y0) * k] }; };
  const isPt = v => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number';
  const mapA = (A, Pf) => { const r = {}; for (const [n, v] of Object.entries(A)) {
    if (isPt(v)) r[n] = Pf(v);
    else if (v && typeof v === 'object' && !Array.isArray(v)) { const o = {}; for (const [m, w] of Object.entries(v)) if (isPt(w)) o[m] = Pf(w); r[n] = o; } }
    return r; };
  const wrap = (c, r) => ({ svg: `<g transform="${c.tf}">${r.svg}</g>`, A: mapA(r.A, c.P), M: r.A, k: c.k, P: c.P, r });
  const sec = (st, W, H, win, id, h) => wrap(cam(win, W, H), S.sec({ state: st, id, h }));
  const front = (st, W, H, win, id) => wrap(cam(win, W, H), S.front({ state: st, id }));

  // ---------------------------------------------------------------- the case and the steps drawn (病例: OS, band under the four recti)
  const EXPO_H = 1.5;                                  // the exposure's clock hour: 示意 (the chart does not say; Zhang 2026: mostly SN / ST)
  const EX = { h: EXPO_H, len: 6 };                    // exposed length 6 mm (示意, CARD.md)
  const OPEN = { h0: 7, h1: 5 };                       // conjunctiva / Tenon opened clockwise 7 → 5 o'clock, through the exposure (extent 依主刀決定, 示意)
  const SUT = S.P.SUT_H.slice();                       // one Dacron mattress suture per quadrant (示意)
  const openAt = a => ({ h0: S.clk(EXPO_H - (EXPO_H - OPEN.h0 + 12) % 12 * a) || 12, h1: EXPO_H + ((OPEN.h1 - EXPO_H + 12) % 12) * a });   // opening grows both ways from the exposure
  const ST = {
    hidden: {},                                                        // before the exposure (1-1): band under intact conjunctiva
    pre: { conformer: 1, expose: EX },                                 // as the patient arrives (2-1 line 0)
    expo: { expose: EX },                                              // conformer out
    open: { expose: EX, open: OPEN },
    sutCut: { expose: EX, open: OPEN, sutCut: SUT },
    cut: { expose: EX, open: OPEN, sutCut: SUT, cut: EXPO_H },
    out: { expose: EX, open: OPEN, sutCut: SUT, cut: EXPO_H, pull: 1 },
    stuckDemo: { expose: EX, open: OPEN, sutCut: SUT.filter(h => h !== 7.5), cut: EXPO_H, pull: 0.4 },   // 3-3 line 2: one suture left uncut (示範)
    clean: { expose: EX, open: OPEN, sutCut: SUT, cut: EXPO_H, pull: 1, debride: 1 },
    closed: { expose: EX, open: OPEN, sutCut: SUT, cut: EXPO_H, pull: 1, debride: 1, close: 1 },
    end: { expose: EX, open: OPEN, sutCut: SUT, cut: EXPO_H, pull: 1, debride: 1, close: 1, conformer: 1 },
  };
  // the rectus the band's free end is about to pass under while it is pulled (the assistant hooks that one); null when none ahead
  const nextRectus = st => { const B = S.band(st); if (B.endH == null || B.removed) return null;
    const toCut = S.clk(B.dir * (B.endH - B.cut));                                    // the end moves back toward the cut; ahead = between the end and the cut
    const ms = S.muscles().map(m => m[0]).filter(h => { const d = S.clk(B.dir * (B.endH - h)); return d > 0.05 && d < toCut; });
    let best = null, bd = 99; for (const h of ms) { const d = S.clk(B.dir * (B.endH - h)); if (d < bd) { bd = d; best = h; } } return bd <= 2.2 ? best : null; };

  // ---------------------------------------------------------------- windows (mm: left, top, width)
  const WIN = {
    front: { x: -27, y: -18.25, w: 54 },               // the whole speculum-opened socket
    frontExpo: { x: -21.5, y: 0.6, w: 25 },            // close-up around the 1:30 exposure (lower left)
    sec: { x: -22, y: -14, w: 44 },                    // the whole section, both halves
    secR: { x: -1.5, y: -10.6, w: 23 },                // right half: band, rectus, conjunctiva, fornix
  };
  const ORIENT = {
    front: { title: '術者視角　左眼 OS', orient: '術者坐 12 點：下＝12 點　左＝3 點 temporal　右＝9 點 nasal' },
    sec: h => ({ title: `切面經 ${S.fmtH(h).replace(':30', ' 點半').replace(/^(\d+)$/, '$1 點')}（右）`, orient: '上＝前（術者側）　下＝眶尖' }),
  };
  return { cam, sec, front, ST, EX, OPEN, SUT, EXPO_H, openAt, nextRectus, WIN, ORIENT };
})();
if (typeof module !== 'undefined') module.exports = VS;
