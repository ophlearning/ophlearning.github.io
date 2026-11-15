// Self-check for the socket model: node check.js  (run from any folder; no browser needed)
// Each check is an anatomical, geometric or physical relation the drawing must keep; a failure exits with code 1.
// SOCKET_JS=<path> loads another copy of socket.js (used to make sure every check can fail).
const K = require(process.env.SOCKET_JS ? require('path').resolve(process.env.SOCKET_JS) : './socket.js');
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const len = P => { let L = 0; for (let i = 1; i < P.length; i++) L += hyp(P[i], P[i - 1]); return L; };
const hEq = (a, b, t = 0.02) => K.hd(a, b) <= t;
const ALL = [1.5, 4.5, 7.5, 10.5];
const BASE = { expose: { h: 1.5, len: 6 }, open: { h0: 11, h1: 4 } };
const S = K.profile(), P = K.P;
// distance of a section point from the outer scleral surface (positive = outside)
const offOf = (p) => { const q = [Math.abs(p[0]), p[1]], s = S.nearestS(q), a = S.at(s); return { s, d: (q[0] - a.p[0]) * a.n[0] + (q[1] - a.p[1]) * a.n[1] }; };

// 1. orientation, OS, surgeon at 12: 3 o'clock (temporal) left, 9 (nasal) right, 12 down, 6 up; hour names
{ const p3 = K.fpt(3, 10), p9 = K.fpt(9, 10), p12 = K.fpt(12, 10), p6 = K.fpt(6, 10);
  ok(p3[0] < -9.9 && p9[0] > 9.9 && p12[1] > 9.9 && p6[1] < -9.9, `front view: 3 o'clock x ${p3[0].toFixed(1)} (left), 9 x ${p9[0].toFixed(1)} (right), 12 y ${p12[1].toFixed(1)} (down), 6 y ${p6[1].toFixed(1)} (up)`);
  ok(/temporal/.test(K.hourName(3)) && /nasal/.test(K.hourName(9)) && K.hourName(1.5) === '上顳側 superotemporal' && K.hourName(4.5) === '下顳側 inferotemporal',
    `OS hour names: 3 = ${K.hourName(3)}, 9 = ${K.hourName(9)}, 1:30 = ${K.hourName(1.5)}, 4:30 = ${K.hourName(4.5)}`);
  ok([1.5, 4.5, 7.5, 10.5, 12].every(h => hEq(K.hourOf(K.fpt(h, 7)), h, 1e-6)), 'front view: position ↔ clock hour round trip'); }
// 2. the two views agree: exposure, cut and the band at the same clock hour and the same distance along the shell (≤ 0.5 mm)
{ const st = { expose: { h: 1.5, len: 6 }, cut: 1.5 }, fr = K.front({ state: st }), sc = K.sec({ state: st, h: 1.5 });
  ok(hEq(K.hourOf(fr.A.expose), 1.5) && sc.A.expose && sc.A.expose[0] > 0 && hyp(K.secToFront(sc.A.expose, 1.5), fr.A.expose) < 0.5,
    `exposure: front at ${K.fmtH(K.hourOf(fr.A.expose))} o'clock; section through 1:30 shows it on the right, ${sc.A.expose ? hyp(K.secToFront(sc.A.expose, 1.5), fr.A.expose).toFixed(2) : '—'} mm from the front point`);
  ok(hEq(K.hourOf(fr.A.cut), 1.5) && sc.A.cut && hyp(K.secToFront(sc.A.cut, 1.5), fr.A.cut) < 0.5, `cut: front at ${K.fmtH(K.hourOf(fr.A.cut))} o'clock = section 1:30 (right side)`);
  const s7 = K.sec({ state: st, h: 7.5 }); ok(s7.A.bandL && hyp(K.secToFront(s7.A.bandL, 7.5), K.fpt(1.5, fr.rB)) < 0.5, 'band in the 7:30 section, left side (= 1:30) maps onto the front band at 1:30'); }
// 3. hooked rectus: same muscle and clock hour in both views; the hook lies between the band and the lifted muscle
{ const st = { ...BASE, hook: 3 }, fr = K.front({ state: st }), sc = K.sec({ state: st, h: 3 }), sd = sc.sides[1];
  ok(fr.A.hook && hEq(K.hourOf(fr.A.hooked), 3) && sd.hooked && sd.muscle === 'LR', `hook: front hooked rectus at ${K.fmtH(K.hourOf(fr.A.hooked))} o'clock = section 3 o'clock, muscle ${sd.muscle} (OS 3 = lateral rectus)`);
  const o = offOf(sc.A.hook).d; ok(o > sd.bandOut + P.CAPS_T + 0.3 && o < sd.musIn(offOf(sc.A.hook).s), `hook ${o.toFixed(2)} mm off the sclera: above the band (${(sd.bandOut + P.CAPS_T).toFixed(2)}) and below the lifted muscle (${sd.musIn(offOf(sc.A.hook).s).toFixed(2)})`); }
// 4. the band runs under every rectus (deeper than the muscle, with its capsule) and the muscles insert anterior to it
for (const [h, nm] of [[12, 'SR'], [3, 'LR'], [6, 'IR'], [9, 'MR']]) { const sd = K.sec({ state: {}, h }).sides[1]; let minGap = 1e9;
  for (let s = sd.s0; s <= sd.s1; s += 0.05) minGap = Math.min(minGap, sd.musIn(s) - (sd.bandOut + P.CAPS_T));
  ok(sd.muscle === nm && minGap > 0 && S.sIns < sd.s0, `${nm} at ${h}: band under the muscle (gap ≥ ${minGap.toFixed(2)} mm), insertion ${(S.sEq - S.sIns).toFixed(1)} mm anterior to the band centre`); }
// 5. the band lies flat on the outside of the shell, inside its fibrous capsule (inner surface ≤ 0.3 mm from the sclera), thickness = BAND_T
{ const r = K.sec({ state: {}, h: 1.5 }), sd = r.sides[1], dc = offOf(r.A.band).d;
  ok(Math.abs(dc - (sd.bandIn + sd.bandOut) / 2) < 0.05 && sd.bandIn >= 0 && sd.bandIn <= 0.3 && Math.abs(sd.bandOut - sd.bandIn - P.BAND_T) < 1e-9 && Math.abs(sd.s1 - sd.s0 - P.BAND_W) < 1e-9,
    `band on the shell: inner ${sd.bandIn.toFixed(2)} mm off the sclera (capsule), ${P.BAND_W} × ${P.BAND_T} mm`); }
// 6. oblique sections have no rectus
ok(ALL.every(h => K.sec({ state: {}, h }).sides[1].muscle === null && K.sec({ state: {}, h }).sides[-1].muscle === null), 'no rectus in the 1:30, 4:30, 7:30, 10:30 sections');
// 7. pulling: the band keeps its length (ring left + pulled out = circumference); the free end recedes from the cut
for (const pl of [0.25, 0.5, 0.9]) { const st = { ...BASE, sutCut: ALL, cut: 1.5, pull: pl }, b = K.band(st), fr = K.front({ state: st });
  ok(Math.abs(len(b.ring3) + len(fr.outPts) - b.L) < 0.1, `pull ${pl}: ring ${len(b.ring3).toFixed(2)} + pulled ${len(fr.outPts).toFixed(2)} = ${b.L.toFixed(2)} mm (2π × ${b.R.toFixed(2)})`); }
{ const st = { ...BASE, sutCut: ALL, cut: 1.5, pull: 0.5 }, b = K.band(st), fr = K.front({ state: st });
  ok(hEq(K.hourOf(fr.A.bandEnd), 7.5) && !b.has(12) && b.has(3), `pull 0.5: free end at ${K.fmtH(K.hourOf(fr.A.bandEnd))} o'clock, band gone at 12, still at 3`); }
// 8. an uncut Dacron suture holds the band: nothing slides, and the model names the suture
{ const st = { ...BASE, sutCut: [1.5], cut: 1.5, pull: 0.5 }, b = K.band(st), fr = K.front({ state: st }), stuck = K.stuckBy(st);
  ok(stuck.join() === '4.5,7.5,10.5' && b.p === 0 && fr.outPts.length === 0 && fr.A.stuck, `sutures 4:30, 7:30, 10:30 uncut: stuck by [${stuck.map(K.fmtH)}], nothing pulled out`);
  ok(K.stuckBy({ ...st, sutCut: ALL }).length === 0 && K.stuckBy({ ...st, sutCut: [1.5, 4.5, 7.5] }).join() === '10.5', 'all cut: not stuck; one left uncut: stuck by that one'); }
// 9. each mattress suture straddles the band: bites on both sides in the sclera, loop outside the band
{ const sd = K.sec({ state: {}, h: 4.5 }).sides[1], over = sd.sutPath.map(offOf).filter(q => q.s > sd.s0 && q.s < sd.s1);
  ok(sd.bite[0] < sd.s0 && sd.bite[1] > sd.s1 && offOf(sd.sutPath[0]).d < 0 && offOf(sd.sutPath[sd.sutPath.length - 1]).d < 0 && over.length > 5 && over.every(q => q.d > sd.bandOut),
    'Dacron suture at 4:30: anterior and posterior bites in the sclera, loop over the band'); }
// 10. debridement removes the granulation in both views; closure covers the exposure in both views
{ const g0 = { expose: { h: 1.5, len: 6 } }, g1 = { ...g0, debride: 1 };
  ok(K.front({ state: g0 }).A.gran && K.sec({ state: g0, h: 1.5 }).A.gran && !K.front({ state: g1 }).A.gran && !K.sec({ state: g1, h: 1.5 }).A.gran, 'granulation: present before, gone after debridement (both views)');
  const c1 = { ...BASE, sutCut: ALL, cut: 1.5, pull: 1, debride: 1, close: 1 }, sd = K.sec({ state: c1, h: 1.5 }).sides[1];
  ok(sd.closed && !sd.expo && !sd.open && !sd.hasBand && K.front({ state: c1 }).A.close, 'after removal and closure: no band, conjunctiva closed over 1:30 (both views)'); }
// 11. the conformer sits in front of the conjunctiva (does not cut into it)
{ const r = K.sec({ state: { conformer: 1, expose: { h: 1.5, len: 6 } }, h: 3 }); let m = 1e9; for (let s = 0; s <= S.sFor - 0.9; s += 0.1) m = Math.min(m, r.A.confIn(s) - r.sides[1].conjOut(s));
  ok(m > 0.1, `conformer ≥ ${m.toFixed(2)} mm in front of the conjunctiva`); }
// 12. no NaN / undefined in any state, both views, several sections
{ const sts = [{}, { conformer: 1, expose: { h: 1.5, len: 6 } }, BASE, { ...BASE, hook: 3 }, { ...BASE, sutCut: [1.5], cut: 1.5 }, { ...BASE, sutCut: [1.5], cut: 1.5, pull: 0.5 },
    { ...BASE, sutCut: ALL, cut: 1.5, pull: 0.5, debride: 0.5 }, { ...BASE, sutCut: ALL, cut: 1.5, pull: 1, debride: 1, close: 0.5 }, { ...BASE, sutCut: ALL, cut: 1.5, pull: 0.5, pullDir: -1, close: 1 }];
  const svg = sts.map(st => K.front({ state: st }).svg + [1.5, 3, 4.5, 6, 7.5, 9, 12].map(h => K.sec({ state: st, h }).svg).join('')).join('');
  ok(!/NaN|undefined/.test(svg), `${sts.length} states × (front + 7 sections): no NaN/undefined`); }

console.log(fail ? `\n${fail} check(s) FAILED` : '\nall socket checks passed');
process.exit(fail ? 1 : 0);
