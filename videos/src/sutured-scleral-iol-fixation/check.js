// Video-level checks for 鞏膜縫合固定 IOL＋23G TPPV (run by videos/tools/check-all.js; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each drawn segment rendered at 60 % and 98 %
//    of every narration line) must be listed for that segment in LEDGER with its source; every citation shown must be in REFS and every reference
//    cited somewhere; every ledger source must be cited in that segment (src) or be 結構 (clock hours, ruler ticks, scale bars), 病例 (the case
//    course, spec.md 病例情境; the segment cites 本例病程), 範本 (the attending's template; the segment cites 主治範本 or names 範本／排程單) or
//    本片各章來源 (a summary of later chapters). 示意 is not a ledger source: a number the model chose itself must not be narrated (rule 3h).
// 2. Narration ↔ model: each number or spatial claim the narration makes is checked on the globe model (videos/models/globe/sfix.js) as the page
//    draws it: where a perpendicular needle 0.58 / 1 / 2 mm behind the posterior surgical limbus lands, measured from the wrong line, the demonstrated
//    angle at 1 and 2 mm, the clock hours and the OD orientation, flap, trocar, IOL and tie numbers.
// 3. Wording rules (the brief of 2026-11-12): (a) a line about 本台 names the template or says 以主治為準; (b) every step segment whose details the
//    template lacks says 以主治為準／依主治; (c) the limbus: which line the literature measures from, that the closest paper does not say,
//    that reading it as the PSL is 推論, and to watch where the attending puts the caliper; (d) the earlier surgery of this case is never explained or
//    judged, and 查不到 + 不推測 are said; (e) no date, no acuity or pressure of the case, no hospital name anywhere; (f) 「10-0 直彎針」 read as a
//    double-armed suture only with 推測／推論; (g) 圓刀 only in the follow-along list, with 依主治; (h) no number the model derived itself (needle
//    angle, dock depth, tilt…), and 0.58 / 0.85 (the model's choices within the literature) only beside 示意.
// 4. The same fixation point / needle in both views (window.SYNC, written by draw.js): every point drawn in the section and on the microscope view
//    is the same 3D point (< 0.01 mm), at its clock hour, at the distance the label gives (on the outer surface, or in the flap bed); points off the
//    wall (the dock, the haptic ties outside the eye) are the model's 3D point. Chapters 3–5: the flap's hinge and apex in the bed, the trocars,
//    the 12 o'clock wound, the needle entries in the beds and the dock, and the haptic ties (each strand on its own side, at the distal third).
//    Chapters 6–7 (2026-11-12, third round): the haptic ties and the optic centre of the lens in place (the ties at the sulcus exits under the
//    fixation points, the optic on the axis), the 2 o'clock knot (in the bed, inside the flap, under it once the flap is closed).
// 5. Spec acceptance: chapters 2 + 5 ≥ 35 % of the video; total 10–12 min (the kit's estimate until there is a timeline.js); no placeholder is
//    left: every segment draws more than its title and never 「畫面製作中」.
// 6. States drawn (window.STATES): 8-1 the symmetric lens is not tilted and the asymmetric one is (Zhao 2025: asymmetry predicts tilt; amount 示意);
//    8-4 each state shown side by side is an error state (decentred or tilted).
// --selftest breaks each check once on purpose and fails unless every check then reports the error. --list prints the numbers per segment.
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const X = require(path.join(MD, 'sfix.js'))(G);
const { SEGS, REFS, VIDEO, CHAPTERS } = require('./anim/segments.js');
const SN = X.SN;

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '12': '結構', '2': '本片各章來源', '8': '本片各章來源', '10-0': '範本' },
  '1-1': { '12': '病例', '6': '病例', '8': '結構', '3': '結構', '9': '結構', '10-0': '範本' },
  '1-2': {},
  '1-3': { '6': 'Aydin 2025', '13': 'Aydin 2025', '10-0': 'Guedes 2026', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '1-4': { '0.11': 'Abu Serhan 2026', '3.12': 'Abu Serhan 2026', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '2-1': { '0.85': 'Le 2018', '1': 'Guedes 2026', '0': '結構', '2': '結構', '12': '結構', '9': '結構' },
  '2-2': { '2.41': 'Yoon 2023', '0': '結構', '1': '結構', '2': '結構', '12': '結構', '9': '結構' },
  '2-3': { '0.83': 'Duffey 1989', '0.46': 'Duffey 1989', '0.58': 'Duffey 1989', '1': 'Duffey 1989', '2': 'Duffey 1989', '8': '結構', '0': '結構', '12': '結構', '9': '結構' },
  '2-4': { '1': 'Guedes 2026', '0.85': 'Le 2018', '0': '結構', '2': '結構', '12': '結構', '9': '結構' },
  '2-5': { '1': 'Guedes 2026', '2': 'Kokame 2018', '118': 'Kokame 2018', '2.41': 'Yoon 2023', '0': '結構', '12': '結構', '9': '結構' },
  '2-6': { '15': 'Marianelli 2019', '64': 'Alp 2009', '24': 'Alp 2009', '57.69': 'Zhao 2025' },
  '2-7': { '3': 'Groh 2002', '9': 'Groh 2002', '2': 'Kokame 2018', '8': 'Kokame 2018', '180': 'Kokame 2018', '12': '結構', '6': '結構' },
  '2-8': { '1': 'Guedes 2026', '2': '結構', '8': '結構', '0': '結構', '12': '結構', '9': '結構' },
  '3-1': { '3': 'Guedes 2026', '1': 'Guedes 2026', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '3-2': { '3.5': 'Rajan 2025', '4': 'Rajan 2025', '12': '範本', '1': '結構', '7': '結構', '0': '結構', '2': '結構', '9': '結構' },
  '4-1': { '12': '範本', '6': '結構', '2': '結構', '9': '結構' },
  '5-1': { '10-0': '範本', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '5-2': { '1': 'Guedes 2026', '0': '結構', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '5-3': { '12': '範本', '2': '結構', '8': '結構', '9': '結構' },
  '5-4': { '3-1': 'Guedes 2026', '1': 'Guedes 2026', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '6-1': { '12': '範本', '3.13': 'Zhao 2025', '5': 'Zhao 2025', '2': '結構', '8': '結構', '9': '結構' },
  '7-1': { '8-0': 'Guedes 2026', '2': '結構', '8': '結構', '0.5': '結構', '1': '結構', '12': '結構', '9': '結構' },
  '8-1': { '8.9': 'Kanclerz 2025', '8.5': 'Kanclerz 2025', '2': '結構', '8': '結構', '12': '結構', '9': '結構' },
  '8-2': { '0': 'Van Meter 1997', '26': 'Van Meter 1997', '73': 'Solomon 1993', '30': 'Solomon 1993', '10-0': 'Vote 2006', '4': 'Vote 2006', '61': 'Vote 2006', '6': 'Vote 2006',
    '214': 'Kokame 2018', '1': 'Kokame 2018', '118': 'Kokame 2018', '6.0': 'Kokame 2018', '2': '結構', '8': '結構' },
  '8-3': { '7.3': 'Kaufmann 2024', '5.1': 'Kaufmann 2024', '561': 'Kaufmann 2024', '2': '結構', '8': '結構' },
  '8-4': { '2': '結構', '8': '結構' },
  '9-1': { '10-0': '範本', '11': '範本', '2': '結構', '8': '結構' },
};
const CITE = /(Van Meter|Abu Serhan|[A-Z][A-Za-zÀ-žş'\-]+) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').replace(/\b(23G|27G)\b/g, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && (r.includes(c.year + ';') || r.includes(c.year + ' (') || r.includes(c.year + '.')));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);
const isSpecialSrc = s => ['本例病程', '主治範本', '本片各章來源'].includes(s);

async function fromPage() {   // all text drawn on screen per drawn segment (60 % and 98 % of every line), SYNC, timeline, placeholders
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const out = await p.evaluate(() => { const screen = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add(t.textContent); }
      screen[s.id] = [...set]; }
    const tl = TL_EXPORT.map(x => ({ id: x.id, ch: x.ch, t0: x.t0, t1: x.t1 }));
    // what the placeholder segments draw inside their panels (the content area, below the panel title row)
    const placed = {}; for (const id of window.PLACEHOLDERS || []) { const s = TL_EXPORT.find(x => x.id === id), set = new Set();
      for (const [a, e] of s.lines) { renderAt(a + (e - a) * 0.6); for (const t of document.querySelectorAll('#stage text')) { const r = t.getBoundingClientRect(), y = r.y + r.height / 2; if (y > CONTENT_Y && y < CONTENT_Y + CONTENT_H) set.add(t.textContent); } }
      placed[id] = [...set]; }
    return { screen, sync: window.SYNC, tl, place: window.PLACEHOLDERS, placed, source: window.TIMELINE_SOURCE, states: window.STATES }; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

// ---------------------------------------------------------------- model facts (plain numbers, so the self-test can break them)
function modelFacts() {
  const cls = (mm, from = 'psl', aim = 'perp') => X.track(SN.hours[0], X.sAbs(mm, from), aim);
  const t058 = cls(X.SUL - SN.psl), t1 = cls(1), t2 = cls(2), tv = cls(1, 'vis'), d1 = cls(1, 'psl', X.DIVE), dv = cls(1, 'vis', X.DIVE), d2 = cls(2, 'psl', X.DIVE);
  const M = G.enfaceMap(12), c0 = M([0, 0, 0]), pos = h => { const q = M(G.P3(h, 0, 0)); return [q[0] - c0[0], q[1] - c0[1]]; };
  const OR = K.orient({ eye: 'OD', surgeon: 12 }), FIX = X.norm({ sfix: { vit: 1, peri: 1, flap: { open: 0 }, ndl: {}, iol: {}, knot: 1 } }), IO = X.iolOf(FIX);
  return { psl: SN.psl, duffey: [SN.duffey.v, SN.duffey.hz], sul: X.SUL - SN.psl, plicata: X.PE - SN.psl, yoon: SN.yoonPlicata,
    cls058: t058.cls, cls1: t1.cls, cls1sI: t1.sI - X.P0, cls2: t2.cls, clsVis: tv.cls, visRoot: Math.hypot(tv.I[0] - X.IR.root[0], tv.I[1] - X.IR.root[1]),
    demo1: d1.cls, demoVis: dv.cls, demo2: d2.cls, demo2proc: d2.lens.proc || 0, hours: SN.hours.slice(), guedes: SN.guedes, kokame: SN.kokame,
    bottom: OR.bottom, right: OR.right, rightAnat: OR.rightAnat.horiz, anat2: K.anat('OD', 2).en, anat8: K.anat('OD', 8).en, pos2: pos(2), pos8: pos(8), pos3: pos(3),
    optic: SN.iol.optic, overall: SN.iol.overall, tieT: SN.iol.tieT, flapSide: SN.flap.side, flapFrac: SN.flap.frac, trocar: SN.trocar.s, inc: SN.inc.h,
    tilt: IO.tilt, centre: Math.hypot(IO.O[0], IO.O[1]) };
}

// ---------------------------------------------------------------- 2. narration ↔ model
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2);
const line = (ctx, id, i) => (ctx.text[id].lines[i] || '').replace(/\n/g, '');
const segText = (ctx, id) => ctx.text[id].lines.join('').replace(/\n/g, '');
function modelChecks(ctx) {
  const M = ctx.M, R = [], ok = (c, m) => R.push([!!c, m]);
  ok(near(M.psl, 0.85, 1e-9) && line(ctx, '2-1', 2).includes('0.85 mm'), `2-1 the PSL is ${M.psl} mm behind the clear-cornea edge in the model (narration 0.85 mm)`);
  ok(near(M.duffey[0], 0.83, 1e-9) && near(M.duffey[1], 0.46, 1e-9) && line(ctx, '2-3', 0).includes('0.83 mm（垂直經線）') && line(ctx, '2-3', 0).includes('0.46 mm（水平經線）'), `2-3 Duffey 1989 in the model ${M.duffey.join(' / ')} mm = narration`);
  ok(f2(M.sul) === '0.58' && line(ctx, '2-3', 1).includes('0.58 mm'), `2-3 the 2 / 8 o'clock sulcus ${f2(M.sul)} mm behind the PSL (narration 0.58)`);
  ok(M.cls058 === 'sulcus', `2-3 a perpendicular needle at 0.58 mm lands in the sulcus (${M.cls058})`);
  ok(M.cls1 === 'plicata' && M.cls1sI < 0.45 && line(ctx, '2-3', 2).includes('1 mm 在溝後緣、睫狀突前緣'), `2-3 1 mm lands at the front edge of the ciliary processes (${M.cls1}, ${f2(M.cls1sI)} mm behind the sulcus floor's edge)`);
  ok(M.cls2 === 'plicata' && line(ctx, '2-3', 3 - 1).includes('2 mm 在睫狀突上'), `2-3 2 mm lands on the ciliary processes (${M.cls2})`);
  ok(near(M.plicata, 2.41, 0.005) && M.yoon === 2.41 && line(ctx, '2-2', 1).includes('2.41 mm') && line(ctx, '2-5', 2).includes('2.41 mm'), `2-2 / 2-5 pars plicata ends ${f2(M.plicata)} mm behind the PSL (Yoon 2023: 2.41)`);
  ok(M.clsVis === 'iris' && M.visRoot < 0.5 && line(ctx, '2-4', 2).includes('打到虹膜根'), `2-4 perpendicular, 1 mm from the clear-cornea edge: ${M.clsVis}, ${f2(M.visRoot)} mm from the iris root (narration 虹膜根)`);
  ok(M.demoVis === 'angle' && line(ctx, '2-4', 1).includes('隅角'), `2-4 the demonstrated angle from the clear-cornea edge reaches the chamber angle (${M.demoVis})`);
  ok(M.demo1 === 'sulcus' && line(ctx, '2-3', 3).includes('從睫狀溝鑽到虹膜後面'), `2-3 / 2-4 the demonstrated pass at 1 mm from the PSL goes through the sulcus (${M.demo1})`);
  ok(M.demo2 === 'plicata' && M.demo2proc > 0.05 && line(ctx, '2-5', 2).includes('模型的 2 mm 就是'), `2-5 the same angle at 2 mm goes through the ciliary processes (${M.demo2}, ${f2(M.demo2proc)} mm of process)`);
  ok(M.guedes === 1 && M.kokame === 2 && line(ctx, '2-5', 0).includes('約 1 mm') && line(ctx, '2-5', 1).includes('2 mm 以上'), `2-5 demonstrated ${M.guedes} mm (Guedes 2026), comparison ${M.kokame} mm (Kokame 2018)`);
  { const d = ((M.hours[1] - M.hours[0]) % 12 + 12) % 12; ok(M.hours[0] === 2 && M.hours[1] === 8 && d === 6 && line(ctx, '2-7', 2).includes('2 點和 8 點、相隔 180°'), `2-7 fixation at ${M.hours.join(' and ')} o'clock, ${d * 30}° apart`); }
  ok(M.bottom === 12 && M.right === 9 && M.rightAnat === 'temporal' && M.anat2 === 'superonasal' && M.anat8 === 'inferotemporal', `OD, surgeon at 12: bottom ${M.bottom}, right ${M.right} ${M.rightAnat}; 2 = ${M.anat2}, 8 = ${M.anat8}`);
  ok(M.pos2[0] < 0 && M.pos2[1] > 0 && M.pos8[0] > 0 && M.pos8[1] < 0 && M.pos3[0] < 0 && line(ctx, '2-7', 3).includes('2 點在左下、8 點在右上'), `2-7 microscope: 2 o'clock lower left (${M.pos2.map(f2)}), 8 o'clock upper right (${M.pos8.map(f2)})`);
  ok(M.optic === 6 && M.overall === 13 && line(ctx, '1-3', 0).includes('optic 6 mm') && line(ctx, '1-3', 0).includes('總長 13 mm'), `1-3 MA60AC optic ${M.optic} mm, overall ${M.overall} mm (Aydin 2025)`);
  ok(M.flapSide === 3 && near(M.flapFrac, 1 / 3, 1e-9) && line(ctx, '3-1', 1).includes('邊長 3 mm、三分之一厚'), `3-1 flap sides ${M.flapSide} mm, ${f2(M.flapFrac)} of the scleral thickness (Guedes 2026)`);
  ok(M.trocar >= 3.5 && M.trocar <= 4 && line(ctx, '3-2', 0).includes('3.5 到 4 mm'), `3-2 trocars ${M.trocar} mm behind the PSL, inside Rajan 2025's 3.5–4 mm`);
  ok(M.tieT > 2 / 3 && line(ctx, '5-4', 0).includes('遠端三分之一'), `5-4 tie at ${M.tieT} of the haptic length (distal third)`);
  ok(M.inc === 12 && ['4-1', '5-3', '6-1'].every(id => segText(ctx, id).includes('12 點')), `4-1 / 5-3 / 6-1 the IOL wound at ${M.inc} o'clock (template)`);
  ok(M.tilt < 0.1 && M.centre < 0.01 && line(ctx, '6-1', 0).includes('置中、不傾斜'), `6-1 equal tension: optic centre ${M.centre.toFixed(3)} mm off axis, tilt ${f2(M.tilt)}°`);
  return R;
}

// ---------------------------------------------------------------- 3. wording rules
const allLines = ctx => SEGS.filter(s => s.lines).flatMap(s => ctx.text[s.id].lines.map((l, i) => ({ id: s.id, i, t: l.replace(/\n/g, ''), ch: s.ch })));
const allKeys = ctx => SEGS.filter(s => s.keys).flatMap(s => ctx.text[s.id].keys.map(k => ({ id: s.id, t: k[1].replace(/<\/?b>/g, '') })));
const DETAIL = ['2-5', '2-7', '2-8', '3-1', '3-2', '4-1', '5-1', '5-2', '5-3', '5-4', '6-1', '7-1'];
const HEDGE = /以主治為準|依主治/;
const JUDGE = /沒縫好|太鬆|不夠|做錯|失敗|不當|應該|疏失|問題|因為|所以|原因是|可能是本例|可能因為|導致/;   // explaining or judging the earlier surgery (rule d)
const MODEL_ONLY = ['30.7', '30.71', '3.87', '4.3', '0.24', '0.20', '0.36', '0.33', '0.81', '72', '145', '12.87', '12.84', '0.39', '0.79', '2.42', '3.26', '1.43', '2.47'];
function wordingChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), L = allLines(ctx), K2 = allKeys(ctx);
  const everything = [...L.map(x => x.t), ...K2.map(x => x.t), ...SEGS.map(s => ctx.text[s.id].title || ''), ...SEGS.flatMap(s => (ctx.text[s.id].src || []).map(x => x[1])),
    JSON.stringify(ctx.video), ...CHAPTERS, ...Object.values(ctx.screen).flat()];
  // (a) 本台
  { const bad = L.filter(x => /本台/.test(x.t) && !/以主治為準|依主治|主治的|範本|排程單|MA60AC|最接近本台|本台最接近/.test(x.t));
    ok(!bad.length, `(a) every line about 本台 names the template or says 以主治為準${bad.length ? ': ' + bad.map(x => x.id + ':' + x.i).join(', ') : ''}`); }
  // (b) step details
  { const bad = DETAIL.filter(id => !HEDGE.test(segText(ctx, id)));
    ok(!bad.length, `(b) step segments with details the template lacks say 以主治為準／依主治 (${DETAIL.length})${bad.length ? '; missing: ' + bad.join(', ') : ''}`); }
  // (c) the limbus
  { const t = segText(ctx, '2-1');
    ok(/灰藍帶的後緣/.test(t) && /角膜緣後界/.test(t) && /沒寫哪條線/.test(t) && /推論/.test(t) && /量尺抵在哪一條線/.test(t) && /零點/.test(segText(ctx, '2-4')),
      '(c) limbus: the literature measures from the PSL (灰藍帶的後緣), the closest paper does not say which line (沒寫哪條線, 推論), watch where the caliper sits'); }
  // (d) the earlier surgery
  { const prior = L.filter(x => /前一次|縫回|再脫位|又半脫位|又脫位/.test(x.t)), bad = prior.filter(x => JUDGE.test(x.t));
    ok(prior.length >= 3 && !bad.length && /查不到/.test(segText(ctx, '1-1')) && /不推測/.test(segText(ctx, '1-1')) && /查不到/.test(segText(ctx, '8-4')) && /不推測/.test(segText(ctx, '8-4')),
      `(d) the earlier surgery: ${prior.length} lines, none explains or judges it; 1-1 and 8-4 say 查不到 and 不推測${bad.length ? '; judging: ' + bad.map(x => x.id + ':' + x.i).join(', ') : ''}`);
    const scr = ['1-1', '8-4'].flatMap(id => (ctx.screen[id] || []).map(t => ({ id, t }))), badS = scr.filter(x => JUDGE.test(x.t));
    ok(scr.length >= 4 && !badS.length && (ctx.screen['8-4'] || []).some(t => /不推測/.test(t)), `(d) on screen in 1-1 and 8-4 (${scr.length} texts) nothing explains or judges the earlier surgery; 8-4 shows 不推測${badS.length ? '; judging: ' + badS.map(x => x.id + ' ' + x.t).join(' | ') : ''}`); }
  // (e) no dates, case acuity / pressure, hospital names
  { const date = /\d{1,2}\s*\/\s*\d{1,2}(?!\s*(mm|°))|\d{4}\s*[-./]\s*\d{1,2}|\d+\s*月\s*\d*\s*日?|星期|週[一二三四五六日]|上午|下午/, place = /醫院|長庚|Chang Gung|CGMH|林口|基隆|院區/;
    const hits = everything.filter(s => date.test(s.replace(/1\/3/g, '')) || place.test(s));
    const caseBad = L.filter(x => /本例/.test(x.t) && /視力|眼壓|VA|mmHg|logMAR|IOP/.test(x.t));
    ok(!hits.length && !caseBad.length, `(e) no date, hospital name, or acuity / pressure of the case in any text${hits.length || caseBad.length ? ': ' + [...hits.map(s => s.slice(0, 30)), ...caseBad.map(x => x.id + ':' + x.i)].join(' | ') : ''}`); }
  // (f) 「10-0 直彎針」 as a double-armed suture only as an inference
  { const interp = L.filter(x => /直彎針/.test(x.t) && /兩頭|雙頭|一支針|直針|彎針[^」]/.test(x.t.replace(/直彎針/g, ''))), bad = interp.filter(x => !/推測|推論/.test(x.t));
    const curved = SEGS.filter(s => s.lines && ctx.text[s.id].lines.some(l => /(?<!直)彎針/.test(l))).map(s => s.id), bad2 = curved.filter(id => !/推測|推論/.test(segText(ctx, id)));
    ok(interp.length >= 1 && !bad.length && !bad2.length, `(f) 「10-0 直彎針」 read as a double-armed suture with 推測 (${interp.length} line); segments using the curved needle say 推論 (${curved.join(', ')})${bad.length || bad2.length ? '; missing: ' + [...bad.map(x => x.id + ':' + x.i), ...bad2].join(', ') : ''}`); }
  // (g) 圓刀
  { const r = [...L, ...K2.map(k => ({ ...k, ch: SEGS.find(s => s.id === k.id).ch }))].filter(x => /圓刀/.test(x.t)), bad = r.filter(x => x.ch !== 9 || !/依主治|用途依主治/.test(x.t));
    ok(r.length >= 1 && !bad.length, `(g) 圓刀 only in the follow-along list, with 依主治 (${r.length})${bad.length ? '; wrong: ' + bad.map(x => x.id).join(', ') : ''}`); }
  // (h) model-only numbers; the model's own choices only beside 示意
  { const nums = s => numbers(s), hit = everything.filter(s => nums(s).some(n => MODEL_ONLY.includes(n)));
    const texts = [...L.map(x => x.t), ...K2.map(x => x.t), ...Object.values(ctx.screen).flat()], bad = texts.filter(s => nums(s).some(n => n === '0.58' || n === '0.85') && !/示意/.test(s));
    ok(!hit.length && !bad.length, `(h) no model-derived number (needle angle, dock, tilt…); 0.58 and 0.85 only beside 示意${hit.length || bad.length ? ': ' + [...hit, ...bad].map(s => s.slice(0, 40)).join(' | ') : ''}`); }
  return R;
}

// ---------------------------------------------------------------- 4. the same point in both views; 5. timing and placeholders
// expected points: [from, mm, opt] on the wall (opt.h clock hour, default 2; opt.depth 'bed' = the flap bed, 1/3 of the scleral thickness deep,
// else on the outer surface), or ['p3', point, opt] for the model's 3D point itself (opt.h / opt.depth checked when given)
const FR = SN.flap.frac, PSE = X.passes(X.norm({ sfix: { ndl: { s2: SN.guedes, s8: SN.guedes } } })), INC = X.incOf();
// the lens outside the eye in 5-4 (draw.js: 9 mm below the 12 o'clock wound, turned 180° in its plane so that each strand reaches the haptic on its
// own side); the tie is the model's (X.HAP, SN.iol.tieT)
const TIE_I = X.HAP.pts.findIndex(p => Math.abs(p[3] - SN.iol.tieT) < 0.013), O_OUT = G.add(INC.outer, [0, 9.0, 1.0]);
const HAP_OUT = [0, 1].map(j => { const ex = j === 0 ? [1, 0, 0] : [-1, 0, 0], ey = j === 0 ? [0, 1, 0] : [0, -1, 0]; return X.HAP.pts.map(p => G.add(G.add(G.add(O_OUT, ex, p[0]), ey, p[1]), [0, 0, 1], p[2])); });
// the lens in place (6-1) and the 2 o'clock knot (7-1): the model's points for the fixed state
const IOFIX = X.iolOf(X.norm({ sfix: { vit: 1, ndl: {}, iol: {} } })), K2 = X.knotOf(X.norm({ sfix: { ndl: {} } }), 0);
const EXPECT = { '2-3': { '0.58': ['psl', X.SUL - SN.psl], '1': ['psl', 1], '2': ['psl', 2] }, '2-4': { psl1: ['psl', 1], vis1: ['vis', 1] }, '2-5': { mm1: ['psl', 1], mm2: ['psl', 2] }, '2-8': { zero: ['psl', 0], dot: ['psl', 1] },
  '3-1': { hinge: ['psl', 0, { depth: 'bed' }], apex: ['psl', X.H_TRI, { depth: 'bed' }] },
  '3-2': { trocar1: ['psl', SN.trocar.s, { h: 1 }], trocar7: ['psl', SN.trocar.s, { h: 7 }] },
  '4-1': { wound: ['vis', SN.inc.s, { h: 12 }] },
  '5-2': { E2: ['p3', PSE.E2, { h: 2, depth: 'bed' }], E8: ['p3', PSE.E8, { h: 8, depth: 'bed' }], D: ['p3', PSE.D] },
  '5-3': { E2: ['p3', PSE.E2, { h: 2, depth: 'bed' }], E8: ['p3', PSE.E8, { h: 8, depth: 'bed' }] },
  '5-4': { tie2: ['p3', HAP_OUT[0][TIE_I]], tie8: ['p3', HAP_OUT[1][TIE_I]] },
  '6-1': { tie2: ['p3', IOFIX.ties[0], { h: 2 }], tie8: ['p3', IOFIX.ties[1], { h: 8 }], iolC: ['p3', IOFIX.O] },
  '7-1': { knot2: ['p3', K2.p] } };
function syncChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), bad = [], seen = [];
  for (const [id, pts] of Object.entries(EXPECT)) { const S = ctx.sync[id] || { sec: {}, scope: {} };
    for (const [nm, [from, mm, o = {}]] of Object.entries(pts)) { const a = S.sec[nm], b = S.scope[nm];
      if (!a || !b) { bad.push(`${id} ${nm} missing`); continue; }
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]), m = G.mer(a), W = G.wallOf(m.z, m.rho), h = o.h ?? 2, msg = [];
      if (d > 0.01) msg.push(`${d.toFixed(3)} mm apart`);
      if (from === 'p3') { const e = Math.hypot(a[0] - mm[0], a[1] - mm[1], a[2] - mm[2]); if (e > 0.01) msg.push(`${e.toFixed(3)} mm from the model's point`); }
      else { const mmGot = W.s - (from === 'vis' ? 0 : SN.psl); if (Math.abs(mmGot - mm) > 0.01) msg.push(`${f2(mmGot)} mm from the ${from} (expected ${f2(mm)})`); }
      if ((from !== 'p3' || o.h) && Math.abs(X.dH(m.h, h)) > 0.01) msg.push(`at ${f2(m.h)} o'clock (expected ${h})`);
      if (from !== 'p3' || o.depth) { const want = o.depth === 'bed' ? G.T(W.s) * FR : 0; if (Math.abs(W.d - want) > 0.02) msg.push(`${f2(W.d)} mm deep (expected ${o.depth === 'bed' ? 'the flap bed ' : 'the surface '}${f2(want)})`); }
      if (msg.length) bad.push(`${id} ${nm}: ${msg.join(', ')}`); else seen.push(`${id} ${nm}`); } }
  ok(!bad.length, `the same point in the section and on the microscope view (${seen.length}: < 0.01 mm, its clock hour, the labelled distance and depth)${bad.length ? '; ' + bad.join(' | ') : ''}`);
  // 5-2: the needle entering the 2 o'clock bed and the insulin needle entering the 8 o'clock bed lie on lines through the outer surface 1 mm behind the PSL
  { const sAt = p => { const m = G.mer(p); return { W: G.wallOf(m.z, m.rho), h: m.h }; }, q2 = sAt(PSE.S2), q8 = sAt(PSE.S8);
    ok(Math.abs(q2.W.s - SN.psl - SN.guedes) < 0.01 && Math.abs(q8.W.s - SN.psl - SN.guedes) < 0.01 && Math.abs(X.dH(q2.h, 2)) < 0.01 && Math.abs(X.dH(q8.h, 8)) < 0.01 && line(ctx, '5-2', 0).includes('角膜緣後約 1 mm'),
      `5-2 the needle tracks cross the outer surface ${f2(q2.W.s - SN.psl)} / ${f2(q8.W.s - SN.psl)} mm behind the PSL at 2 / 8 o'clock (narration 約 1 mm)`); }
  // 5-4: each strand tied to the haptic on its own side (the strands do not cross outside the wound), at the distal third
  { const S = ctx.sync['5-4'] || { sec: {}, scope: {} }, M = G.enfaceMap(12), wq = M(INC.outer), e2 = M(PSE.E2), t2 = S.scope.tie2 && M(S.scope.tie2), t8 = S.scope.tie8 && M(S.scope.tie8);
    const tOf = p => { let best = 1e9, t = null; HAP_OUT.forEach(H => H.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); if (d < best) { best = d; t = X.HAP.pts[i][3]; } })); return best < 0.02 ? t : null; };
    const ts = [S.scope.tie2, S.scope.tie8].map(p => p ? tOf(p) : null);
    ok(t2 && t8 && Math.sign(t2[0] - wq[0]) === Math.sign(e2[0] - wq[0]) && Math.sign(t8[0] - wq[0]) === -Math.sign(e2[0] - wq[0]),
      `5-4 the 2 o'clock strand is tied to the haptic on the 2 o'clock side of the wound, the 8 o'clock strand on the other (the strands do not cross)`);
    ok(ts.every(t => t !== null && t > 2 / 3 && t < 1) && line(ctx, '5-4', 0).includes('遠端三分之一'), `5-4 both ties on a haptic, at ${ts.map(t => t === null ? '—' : f2(t)).join(' / ')} of its length (distal third)`); }
  // 6-1: in both views the haptic ties end at the sulcus exits under the fixation points (the clock hour of the bed entry, within 0.1 mm of where the
  // suture leaves the uvea) and the optic centre is on the axis
  { const S = ctx.sync['6-1'] || { sec: {}, scope: {} }, msg = [], hr = p => G.mer(p).h;
    for (const [nm, I, E] of [['tie2', PSE.I2, PSE.E2], ['tie8', PSE.I8, PSE.E8]]) for (const vw of ['sec', 'scope']) { const p = S[vw][nm];
      if (!p) { msg.push(`${vw} ${nm} missing`); continue; } const d = Math.hypot(p[0] - I[0], p[1] - I[1], p[2] - I[2]);
      if (d > 0.1) msg.push(`${vw} ${nm} ${d.toFixed(2)} mm from the sulcus exit`); if (Math.abs(X.dH(hr(p), hr(E))) > 0.01) msg.push(`${vw} ${nm} at ${f2(hr(p))} o'clock, the entry at ${f2(hr(E))}`); }
    for (const vw of ['sec', 'scope']) { const p = S[vw].iolC; if (!p || Math.hypot(p[0], p[1]) > 0.01) msg.push(`${vw} optic centre ${p ? Math.hypot(p[0], p[1]).toFixed(2) + ' mm off the axis' : 'missing'}`); }
    ok(!msg.length && line(ctx, '6-1', 0).includes('置中、不傾斜'), `6-1 the haptic ties at the sulcus exits under the fixation points and the optic centre on the axis, in both views${msg.length ? ': ' + msg.join(', ') : ''}`); }
  // 7-1: the 2 o'clock knot drawn in both views lies in the flap bed, inside the triangle, wholly under the flap; the last drawn state has the flap
  // closed over it
  { const S = ctx.sync['7-1'] || { sec: {}, scope: {} }, msg = [], r = SN.knot.r;
    for (const vw of ['sec', 'scope']) { const p = S[vw].knot2; if (!p) { msg.push(`${vw} knot missing`); continue; }
      const m = G.mer(p), W = G.wallOf(m.z, m.rho), inTri = X.triG(2, W.s, m.h, W.rhoF) < -0.05, bed = G.T(W.s) * FR;
      if (!inTri) msg.push(`${vw} knot outside the flap triangle`); if (!(W.d - r > 0 && W.d + r <= bed + 1e-3)) msg.push(`${vw} knot ${f2(W.d)} mm deep (the bed is ${f2(bed)})`); }
    const end = ctx.states && ctx.states['7-1'] && ctx.states['7-1'].end, cov = end ? X.coveredKnot(X.norm(end), 0) : false;
    ok(!msg.length && cov && line(ctx, '7-1', 1).includes('線結埋在瓣下'), `7-1 the knot in the 2 o'clock bed under the flap in both views; the flap closed over it at the end (${cov})${msg.length ? ': ' + msg.join(', ') : ''}`); }
  return R;
}
// states drawn: 8-1 symmetric → no tilt, asymmetric → tilt; 8-4 every state side by side is an error
function stateChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), S = ctx.states || {}, io = st => st ? X.iolOf(X.norm(st)) : null;
  { const s1 = S['8-1'] || {}, a = io(s1.sym), b = io(s1.asym), n = s1.asym && s1.asym.sfix && s1.asym.sfix.ndl || {}, asym = (n.s2 ?? SN.guedes) !== (n.s8 ?? SN.guedes);
    ok(a && b && a.tilt < 0.1 && b.tilt > 2 && asym && line(ctx, '8-1', 0).includes('兩點不對稱會傾斜'), `8-1 symmetric fixation: tilt ${a ? f2(a.tilt) : '—'}°; asymmetric (${n.s2 ?? SN.guedes} / ${n.s8 ?? SN.guedes} mm): tilt ${b ? f2(b.tilt) : '—'}° (amount 示意)`); }
  { const s4 = S['8-4'] || {}, ks = ['slip', 'one', 'loose'], got = ks.map(k => io(s4[k])), bad = ks.filter((k, i) => !got[i] || !(got[i].tilt > 2 || got[i].dec > 0.1));
    ok(!bad.length, `8-4 every state side by side is an error (decentred > 0.1 mm or tilted > 2°): ${ks.map((k, i) => got[i] ? `${k} ${f2(got[i].dec)} mm / ${f2(got[i].tilt)}°` : k + ' —').join(', ')}${bad.length ? '; not an error: ' + bad.join(', ') : ''}`); }
  return R;
}
function timingChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]), tl = ctx.tl, total = tl[tl.length - 1].t1, chDur = c => tl.filter(x => x.ch === c).reduce((a, x) => a + x.t1 - x.t0, 0), share = (chDur(2) + chDur(5)) / total;
  ok(share >= 0.35, `chapters 2 + 5: ${(100 * share).toFixed(1)}% of the video (spec: ≥ 35%; ${ctx.source})`);
  ok(total >= 600 && total <= 720, `length ${(total / 60).toFixed(2)} min (target 10–12; ${ctx.source})`);
  ok(!(ctx.place || []).length, `no placeholder segment is left${(ctx.place || []).length ? ': ' + ctx.place.join(', ') : ''}`);
  { const done = SEGS.filter(x => !x.chapterCard && x.layout !== 'refs').map(x => x.id), stub = done.filter(id => (ctx.place || []).includes(id) || (ctx.screen[id] || []).some(t => t === '畫面製作中') || (ctx.screen[id] || []).length < 4);
    ok(!stub.length, `every segment is drawn (title, chapters 1–9: ${done.length}), none is a placeholder${stub.length ? '; placeholder: ' + stub.join(', ') : ''}`); }
  return R;
}

// ---------------------------------------------------------------- 1. ledger
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), Lg = ctx.ledger[sg.id] || {}, joined = texts.join('');
    for (const s of srcs) ok(isSpecialSrc(s) || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video, 本例病程, 主治範本 or 本片各章來源`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(Lg[n], `${sg.id}: number ${n} has a source in the ledger${Lg[n] ? ` (${Lg[n]})` : ''}`);
    for (const [n, src] of Object.entries(Lg)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || src === '結構' || joined.includes(src) || (src === '病例' && (srcs.includes('本例病程') || /本例/.test(joined))) ||
        (src === '範本' && (srcs.includes('主治範本') || /範本|排程單|備品/.test(joined))) || (src === '本片各章來源' && (srcs.includes('本片各章來源') || sg.id === 'title'));
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  const used = new Set(ctx.segs.flatMap(s => (s.src || []).flatMap(x => cites(x[1]).map(c => c.who + ' ' + c.year))));
  for (const r of REFS) { const m = r.match(/^(Van Meter|Abu Serhan|[A-Z][A-Za-zÀ-žş'\-]+)/), y = r.match(/ (\d{4})[;. (]/); ok(m && y && used.has(m[1] + ' ' + y[1]), `reference 「${r.slice(0, 40)}…」 is cited in a segment`); }
  return R;
}

// ---------------------------------------------------------------- run
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(page, M) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { M: clone(M), text, segs: clone(SEGS), screen: clone(page.screen), ledger: clone(LEDGER), sync: clone(page.sync), tl: clone(page.tl), place: clone(page.place || []), placed: clone(page.placed || {}), source: page.source, video: clone(VIDEO), states: clone(page.states || {}) };
}
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx), ...wordingChecks(ctx), ...syncChecks(ctx), ...timingChecks(ctx), ...stateChecks(ctx)];
if (require.main === module) (async () => {
  const page = await fromPage(), M = modelFacts();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(page.screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(page, M));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|is cited in a segment/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const seg = (c, id) => c.segs.find(s => s.id === id), setLine = (c, id, i, f) => { c.text[id].lines[i] = f(c.text[id].lines[i]); seg(c, id).lines[i] = c.text[id].lines[i]; };
    const MUT = [
      ['narration number without a source', c => setLine(c, '2-2', 2, l => l + '約 1.5 mm。')],
      ['on-screen number without a source', c => { c.screen['2-3'].push('3.2 mm'); }],
      ['ledger entry not used', c => { c.ledger['2-6']['99'] = 'Alp 2009'; }],
      ['ledger source not cited in the segment', c => { c.ledger['2-6']['24'] = 'Kokame 2018'; }],
      ['citation not in REFS', c => { c.screen['2-5'].push('Smith 2020'); }],
      ['a reference cited nowhere', c => { c.segs.find(s => s.id === '8-4').src[1][1] = 'Kokame 2018'; }],
      ['(a) 本台 stated as fact', c => setLine(c, '2-3', 3, l => l + '本台在 2 點下針。')],
      ['(b) a step segment without 以主治為準', c => { for (let i = 0; i < c.text['3-1'].lines.length; i++) setLine(c, '3-1', i, l => l.replace('以主治為準', '如圖')); }],
      ['(c) the closest paper said to measure from the PSL', c => setLine(c, '2-1', 3, () => '最接近本台的論文寫約 1 mm，就是從後界量。')],
      ['(d) the earlier surgery explained', c => setLine(c, '1-1', 1, l => l + '可能因為縫線太鬆。')],
      ['(e) a date', c => setLine(c, '1-1', 1, l => l + '手術在 11/26。')],
      ['(e) a hospital name', c => { c.video.note.push('某某醫院製作'); }],
      ['(e) the case acuity', c => setLine(c, '1-1', 0, l => l + '本例視力 0.1。')],
      ['(f) 「10-0 直彎針」 stated as a double-armed suture', c => setLine(c, '5-1', 0, () => '備品寫「10-0 直彎針」：就是一條兩頭各有一支針的 10-0 Prolene。')],
      ['(g) 圓刀 outside the list', c => setLine(c, '3-1', 1, l => l + '用圓刀做瓣。')],
      ['(h) a model-derived angle narrated', c => setLine(c, '2-3', 3, l => l + '往後斜 30.7°。')],
      ['(h) 0.58 without 示意', c => { c.text['2-3'].keys[1][1] = '2、8 點：內插 <b>0.58 mm</b>'; }],
      ['the PSL moved in the model', c => { c.M.psl = 0.5; }],
      ['Duffey numbers differ', c => { c.M.duffey = [0.93, 0.46]; }],
      ['1 mm said to land in the sulcus', c => { c.M.cls1 = 'sulcus'; }],
      ['the wrong line reaching the sulcus', c => { c.M.demoVis = 'sulcus'; }],
      ['2 mm not through the processes', c => { c.M.demo2proc = 0; }],
      ['fixation at 3 and 9', c => { c.M.hours = [3, 9]; }],
      ['OD drawn mirrored (2 o\'clock on the right)', c => { c.M.pos2 = [2, 3]; }],
      ['flap 1/2 thickness', c => { c.M.flapFrac = 0.5; }],
      ['trocar at 3.0 mm', c => { c.M.trocar = 3.0; }],
      ['IOL decentred with equal tension', c => { c.M.centre = 0.3; }],
      ['a scope dot 0.1 mm off the section pin', c => { const p = c.sync['2-3'].scope['1']; c.sync['2-3'].scope['1'] = [p[0] + 0.1, p[1], p[2]]; }],
      ['a scope dot measured from the wrong line', c => { c.sync['2-4'].scope.psl1 = c.sync['2-4'].scope.vis1; }],
      ['chapters 2 + 5 too short', c => { let k = 0; c.tl = c.tl.map(x => { const d = (x.t1 - x.t0) * ((x.ch === 2 || x.ch === 5) ? 0.3 : 1), y = { ...x, t0: k, t1: k + d }; k += d; return y; }); }],
      ['a segment left as a placeholder (8-3)', c => { c.place = ['8-3']; c.placed['8-3'] = ['畫面製作中']; }],
      ['a segment drawing 「畫面製作中」 (9-1)', c => { c.screen['9-1'].push('畫面製作中'); }],
      ['a segment drawing almost nothing (8-4)', c => { c.screen['8-4'] = ['示意']; }],
      ['a chapter 3–5 segment left as a placeholder', c => { c.place.push('4-1'); c.placed['4-1'] = ['畫面製作中']; }],
      ['a new on-screen number without a source (5-2)', c => { c.screen['5-2'].push('2.5 mm'); }],
      ['3-1 the flap apex 0.1 mm off on the microscope view', c => { const p = c.sync['3-1'].scope.apex; c.sync['3-1'].scope.apex = [p[0] + 0.1, p[1], p[2]]; }],
      ['3-1 the hinge drawn on the surface, not in the bed', c => { c.sync['3-1'].sec.hinge = c.sync['3-1'].scope.hinge = G.P3(2, SN.psl, 0); }],
      ['3-2 the trocar at 3.0 mm', c => { c.sync['3-2'].sec.trocar1 = c.sync['3-2'].scope.trocar1 = G.P3(1, SN.psl + 3.0, 0); }],
      ['4-1 the wound at 11 o\'clock', c => { c.sync['4-1'].sec.wound = c.sync['4-1'].scope.wound = G.P3(11, SN.inc.s, 0); }],
      ['5-2 the 8 o\'clock entry drawn at 2 o\'clock on the microscope view', c => { c.sync['5-2'].scope.E8 = c.sync['5-2'].scope.E2; }],
      ['5-2 the needle entering the surface instead of the bed', c => { c.sync['5-2'].sec.E2 = c.sync['5-2'].scope.E2 = PSE.S2; }],
      ['5-2 the dock 0.5 mm off in the section', c => { const p = c.sync['5-2'].sec.D; c.sync['5-2'].sec.D = [p[0], p[1], p[2] + 0.5]; }],
      ['5-3 the 2 o\'clock entry at 2 mm', c => { c.sync['5-3'].sec.E2 = c.sync['5-3'].scope.E2 = X.passes(X.norm({ sfix: { ndl: { s2: 2, s8: 1 } } })).E2; }],
      ['5-4 the strands crossing (2 o\'clock strand on the 8 o\'clock side haptic)', c => { const S = c.sync['5-4']; [S.sec.tie2, S.sec.tie8] = [S.sec.tie8, S.sec.tie2]; [S.scope.tie2, S.scope.tie8] = [S.scope.tie8, S.scope.tie2]; }],
      ['5-4 tied in the middle third', c => { const S = c.sync['5-4'], i = X.HAP.pts.findIndex(p => Math.abs(p[3] - 0.5) < 0.013); S.sec.tie2 = S.scope.tie2 = HAP_OUT[0][i]; S.sec.tie8 = S.scope.tie8 = HAP_OUT[1][i]; }],
      ['5-2 the narration entry distance changed', c => setLine(c, '5-2', 0, l => l.replace('約 1 mm', '約 2 mm'))],
      ['a new on-screen number without a source (8-2)', c => { c.screen['8-2'].push('45 眼'); }],
      ['6-1 the ties drawn where the lens hangs slack (not at the sulcus)', c => { const P0 = X.iolOf(X.norm({ sfix: { ndl: {}, iol: { pull: 0 } } })); for (const v of ['sec', 'scope']) { c.sync['6-1'][v].tie2 = P0.ties[0]; c.sync['6-1'][v].tie8 = P0.ties[1]; } }],
      ['6-1 the optic centre 0.3 mm off the axis in both views', c => { for (const v of ['sec', 'scope']) c.sync['6-1'][v].iolC = [0.3, 0, IOFIX.O[2]]; }],
      ['6-1 the 8 o\'clock tie drawn at 7 o\'clock on the microscope view', c => { const p = c.sync['6-1'].scope.tie8, r = Math.hypot(p[0], p[1]), d = G.clockDir(7); c.sync['6-1'].scope.tie8 = [r * d[0], r * d[1], p[2]]; }],
      ['7-1 the knot drawn on the outer surface', c => { for (const v of ['sec', 'scope']) c.sync['7-1'][v].knot2 = G.P3(K2.h, K2.s, 0); }],
      ['7-1 the knot drawn outside the flap (beside it)', c => { for (const v of ['sec', 'scope']) c.sync['7-1'][v].knot2 = G.P3(2.6, K2.s, K2.bed - SN.knot.r); }],
      ['7-1 the flap left open at the end', c => { c.states['7-1'].end.sfix.flap = { open: 1 }; }],
      ['8-1 the asymmetric state drawn symmetric', c => { c.states['8-1'].asym = c.states['8-1'].sym; }],
      ['8-1 the symmetric state drawn asymmetric', c => { c.states['8-1'].sym = c.states['8-1'].asym; }],
      ['8-4 a state side by side that is not an error', c => { c.states['8-4'].loose = c.states['8-1'].sym; }],
      ['(d) 8-4 on screen explains the earlier surgery', c => { c.screen['8-4'].push('前一次縫線太鬆所以脫位'); }],
    ];
    let bad = 0;
    for (const [name, mut] of MUT) { const c = baseCtx(page, M); mut(c); const n = runAll(c).filter(r => !r[0]).length; console.log(`${n ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail`); if (!n) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
if (typeof module !== 'undefined') module.exports = { LEDGER };
