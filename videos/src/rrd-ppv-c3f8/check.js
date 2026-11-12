// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 示意 / 結構 / 病例 (結構 = clock-hour names, list numbers, scale bars;
//    病例 = the case summary confirmed by 站長 2026-11-12, spec.md「病例情境」).
// 2. Narration ↔ model (M1…): each spatial claim the narration makes about the case is checked on what the video draws: the posterior-segment
//    model (videos/models/posterior) through anim/views-posterior.js (VP: the states, windows and drawing constants draw.js uses), against
//    case or literature numbers written here — never against the model's own parameters. Segments drawn so far: title, chapters 1–2.
// --selftest breaks each check once on purpose (a mutation) and fails unless every check then reports the error; a mutation that names
// a model check (M…) must make that check fail.
// --list prints the numbers found per segment (to fill the ledger).
global.document = { createElement: () => ({}) };
const path = require('path');
const { SEGS, REFS } = require('./anim/segments.js');
global.GLOBE = require('../../models/globe/globe.js');
global.POSTERIOR = require('../../models/posterior/posterior.js');
const VP0 = require('./anim/views-posterior.js');

// ---------------------------------------------------------------- 1. ledger: segment → { number: source }
const LEDGER = {
  'title': { '11': '病例', '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
  '1-1': { '3': '結構', '9': '結構', '11': '病例', '12': '病例', '5': '病例', '1': '病例', '6': '結構', '2': '結構' },
  '1-2': { '12': 'Yoshida 2018', '747': 'Yoshida 2018', '89': 'Yoshida 2018', '11': '病例', '844': 'Shunmugam 2014', '38.9': 'Shunmugam 2014',
           '3': '結構', '6': '結構', '9': '結構' },
  '1-3': { '930': 'Kontos 2017b', '1.1': 'Kontos 2017b', '1.8': 'Callizo 2017', '19.8': 'Callizo 2017', '24': 'Sothivannan 2022',
           '11': '病例', '12': '結構', '3': '結構', '6': '結構', '9': '結構', '2': '結構', '1': '結構' },
  '1-4': { '11': '病例', '12': '結構', '3': '結構', '9': '結構' },
  '2-1': { '3': 'EyeWiki 2026a', '4': 'Duker 2021', '7.6': 'Li 2025', '7.0': 'Li 2025', '83': 'Singh 2008', '39': 'Singh 2008',
           '9': '結構', '12': '結構' },
  '2-2': { '4': '示意', '7': '結構', '9': '結構', '12': '結構' },
  '3-2': { '11': '病例', '12': '結構' },
  '4-1': { '110': 'Lai 2019' },
  '5-1': { '106': 'Govetto 2024', '11': '病例', '1.2': 'Jackson 2013', '1.6': 'Jackson 2013' },
  '5-2': { '1.9': 'Neffendorf 2017', '5.8': 'Neffendorf 2017' },
  '6-1': { '11': '病例' },
  '6-2': { '4.5': 'Figueroa 2013', '10.3': 'Garg 2012' },
  '7-1': { '360': 'Wang 2020' },
  '7-2': { '4': 'Vaziri 2016', '3': 'Vaziri 2016', '14': 'Vaziri 2016', '12': 'Brosh 2014', '16': 'Foulsham 2021',
           '50': 'Kanclerz 2018b', '10': 'Kanclerz 2018b', '20': 'Kanclerz 2018b', '40': 'Kanclerz 2018b' },
  '7-3': { '25': 'Williams 1990', '35': 'Shunmugam 2011', '50': 'Shunmugam 2011', '11.2': 'Woo 2009', '38.5': 'Duval 2014' },
  '8-1': { '11': '病例' },
  '8-2': { '24': 'Casswell 2020', '42': 'Casswell 2020', '56': 'Casswell 2020' },
  '8-3': { '37': 'Lee 2004', '3': 'Silvanus 2008', '109': 'Mills 2001', '15': 'Kontos 2017a', '67.7': 'Kontos 2017a' },
  '8-4': { '43': 'Chen 1997', '25': 'Chen 1997', '88': 'Chen 1997', '24': 'Chen 1997', '8': 'Muether 2011', '12': 'Muether 2011',
           '72.9': 'Lee 2014', '50.2': 'Jackson 2013', '68.7': 'Jackson 2013' },
  '9': { '11': '病例', '50': 'Kanclerz 2018b' },
};
// citations: 「Author 2018」; two-word surnames used in this video are listed explicitly (Ferro Desideri)
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Desideri)?) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
const plainSrc = s => s.split('；').map(x => x.trim()).filter(Boolean);

async function screenText() {   // all text drawn on screen per segment, at 60 % and 98 % of every narration line
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'anim', 'video.html')); await p.waitForTimeout(200);
  const out = await p.evaluate(() => { const r = {};
    for (const s of TL_EXPORT) { if (!DRAW2[s.id]) continue; const set = new Set();
      for (const [a, e] of s.lines) for (const f of [0.6, 0.98]) { renderAt(a + (e - a) * f);
        for (const t of document.querySelectorAll('#stage text')) if (!t.classList.contains('hdr')) set.add(t.textContent); }
      r[s.id] = [...set]; }
    return r; });
  await b.close();
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  return out;
}

// ---------------------------------------------------------------- 2. narration ↔ model
// case and literature numbers (spec.md「病例情境」; posterior/CARD.md「數值與出處」)
const CASE = { tear: 11, rdFrom: 11.5, rdTo: 5, ports: 3 };          // 病例: OS, HST at 11, RD 11:30 → 5 o'clock via temporal, 23G three-port PPV
const LIT = { lincoff: 1.5, dfDist: 4.76, foveola: 0.35, oraT: 7.58, oraN: 6.96 };   // Yoshida 2018; Jonas 2015a; Curcio 1990; Li 2025
const LIT2 = { trocRange: [3, 4], troc: 4, plicata: 2.0, tunnel: [20, 30], cjPush: 2,   // EyeWiki 2026a; Duker 2021; Guedes 2024 (pars plicata 2 mm behind the spur); Teixeira 2009; Warrier 2008
  ports: { inf: 'inferotemporal', other: ['superonasal', 'superotemporal'] } };            // Tei 2005: infusion inferotemporal, the others superonasal and superotemporal
const OS_TEMPORAL = 1;                    // left eye: clock 3 (the patient's left, X > 0) is temporal; in the examiner's drawing it is on the right
const SIT_G = [0, -1, 0];                 // sitting upright: gravity toward the feet (eye frame: Y = superior)
const near = (a, b, t) => Math.abs(a - b) <= t, f2 = v => (+v).toFixed(2), D2R_ = Math.PI / 180;
const hdiff = (a, b) => { let d = a - b; d -= 12 * Math.round(d / 12); return d; };
const line = (ctx, id, i) => ctx.text[id].lines[i].replace(/\n/g, '');
const onScreen = (ctx, id, s) => (ctx.screen[id] || []).some(t => t.replace(/\s/g, '').includes(s.replace(/\s/g, '')));
// clock hour of a screen vector on a chart drawn with 12 up (screen y down)
const clockScr = d => { let h = Math.atan2(d[0], -d[1]) / (Math.PI / 6); if (h <= 0) h += 12; return h; };
// clock-hour names written from the geometry (examiner facing the patient), not from the model
const sideName = h => { const x = Math.sin(h * Math.PI / 6) * OS_TEMPORAL, y = Math.cos(h * Math.PI / 6);
  return { zh: (y > 0 ? '上方' : '下方') + '偏' + (x > 0 ? '顳側' : '鼻側'), en: (y > 0 ? 'supero' : 'infero') + (x > 0 ? 'temporal' : 'nasal') }; };
const oraLit = h => (LIT.oraT + LIT.oraN) / 2 + (LIT.oraT - LIT.oraN) / 2 * Math.sin(h * Math.PI / 6) * OS_TEMPORAL;
const W_ = 606, H_ = 410;   // dual panel drawing area (video-kit PW × PH)
// clock hour of a screen vector in the surgeon's views (microscope; wide-angle with the inverter on), surgeon at 12: screen down = 12, left = 3 (written here)
const clockSurg = d => { let h = Math.atan2(-d[0], d[1]) / (Math.PI / 6); if (h <= 0) h += 12; return h; };
const sOf = p => POSTERIOR.wallOf(p[2], Math.hypot(p[0], p[1])).s;
const onArc = (h, a, b) => ((h - a) % 12 + 12) % 12 <= ((b - a) % 12 + 12) % 12;   // h on the clockwise arc a → b
function modelChecks(ctx) {
  const VP = ctx.VP, P = POSTERIOR, R = [], ok = (id, c, m) => R.push([!!c, `${id} ${m}`]);
  const det = (st, h) => { const Gm = P.geom(st); return Gm.H(oraLit(h) + 0.5, h) > 0.01; };
  // M1 1-1 line 0: left eye, 3 o'clock temporal (right on the chart), 9 nasal (left); the section's sides named from the geometry
  { const v = VP.fundus(VP.ST.normal, W_, H_, VP.WIN.chart, 'm1'), A = v.A, c = v.P([0, 0]);
    ok('M1', line(ctx, '1-1', 0).includes('左眼的 3 點是 temporal，9 點是 nasal') && near(clockScr([A.clock3[0] - c[0], A.clock3[1] - c[1]]), 3, 0.01) && near(clockScr([A.clock9[0] - c[0], A.clock9[1] - c[1]]), 9, 0.01)
      && (A.clock3[0] - c[0]) * OS_TEMPORAL > 100 && onScreen(ctx, '1-1', '顳側temporal') && onScreen(ctx, '1-1', '鼻側nasal'),
      `1-1 chart: 3 o'clock at ${f2(clockScr([A.clock3[0] - c[0], A.clock3[1] - c[1]]))} (right, temporal), 9 at ${f2(clockScr([A.clock9[0] - c[0], A.clock9[1] - c[1]]))} (left, nasal)`);
    const hr = VP.SEC_H, hl = hr + 6 > 12 ? hr - 6 : hr + 6, nr = sideName(hr), nl = sideName(hl);
    ok('M1', hr === CASE.tear && onScreen(ctx, '1-1', `${hr} 點：${nr.zh}${nr.en}`) && onScreen(ctx, '1-1', `${hl} 點：${nl.zh}${nl.en}`) && VP.OR.sec.includes(`右＝${hr} 點`),
      `1-1 section through the tear: right ${hr} = ${nr.zh} ${nr.en}, left ${hl} = ${nl.zh} ${nl.en} on screen`); }
  // M2 1-1 line 1: detached from 11:30 clockwise through 12 and 3 to 5 o'clock (about 5.5 clock hours), not at 9 or 7; the drawn arc says the same
  for (const k of ['rdOnly', 'rrd']) { const st = VP.ST[k]; let a = null, b = null;
    for (let h = 9; h < 12.5; h += 0.01) if (det(st, h % 12 || 12)) { a = h; break; } for (let h = 8.99; h > 2; h -= 0.01) if (det(st, h)) { b = h; break; }
    ok('M2', line(ctx, '1-1', 1).includes('從 11 點半開始，經過 12 點和 3 點') && line(ctx, '1-1', 1).includes('一路到 5 點，大約五個半鐘點') && a !== null && b !== null && near(a, CASE.rdFrom, 0.25) && near(b, CASE.rdTo, 0.25)
      && det(st, 12) && det(st, 3) && !det(st, 9) && !det(st, 7), `1-1 ${k}: detached from ${a && f2(a)} to ${b && f2(b)} o'clock through 12 and 3, not 9 or 7 (病例 11:30 → 5)`); }
  { const [h0, h1] = VP.RD_ARC; ok('M2', near(h0, CASE.rdFrom, 1e-9) && near(((h1 - 1) % 12) + 1, CASE.rdTo, 1e-9) && h1 > h0 && near(h1 - h0, 5.5, 1e-9) && h0 < 12 && h1 > 15,
    `1-1 drawn extent: ${h0} → ${h1 % 12} o'clock clockwise through 12 and 3, ${h1 - h0} clock hours (病例; 約五個半鐘點)`); }
  // M3 1-1 line 2: the macula temporal to the disc (OS: right of it on the chart), 4.76 mm away, the fovea a little lower (Jonas 2015a, 2015b)
  { const v = VP.fundus(VP.ST.rrd, W_, H_, VP.WIN.chart, 'm3'), A = v.A, dx = (A.fovea[0] - A.disc[0]) / v.k, dy = (A.fovea[1] - A.disc[1]) / v.k;
    ok('M3', line(ctx, '1-1', 2).includes('黃斑在視盤的 temporal 側') && dx * OS_TEMPORAL > 4 && near(Math.hypot(dx, dy), LIT.dfDist, 0.3) && dy > 0,
      `1-1 chart: fovea ${f2(dx)} mm ${dx > 0 ? 'right' : 'left'} of the disc (temporal = right for OS), ${f2(Math.hypot(dx, dy))} mm apart (Jonas 2015a 4.76), ${f2(dy)} mm lower`); }
  // M4 1-1 line 2, 1-3 line 0: foveola attached, inferior macula detached, superior macula attached; the 1-3 section labels on the right sides
  { const Gm = P.geom(VP.ST.rrd), Hc = (fx, fy) => { const hs = P.hsChart(fx, fy); return Gm.H(hs.s, hs.h); };
    let fov = 0; for (let r = 0; r <= LIT.foveola / 2; r += 0.025) for (let t = 0; t < 360; t += 30) fov = Math.max(fov, Hc(r * Math.cos(t * Math.PI / 180) + 1e-6, r * Math.sin(t * Math.PI / 180)));
    const inf = [[0, -1.6], [0, -2.4], [0.8, -2.0], [-1.0, -2.0]].map(p => Hc(...p)), sup = [[0, 1.6], [0, 2.4], [1.5, 1.5]].map(p => Hc(...p));
    ok('M4', line(ctx, '1-1', 2).includes('剝離掃過它的下半部，但 fovea 還貼著') && line(ctx, '1-3', 0).includes('Fovea 還貼著') && fov === 0 && Math.min(...inf) > 0.1 && Math.max(...sup) === 0,
      `fovea on (max height within the foveola ${f2(fov)} mm), inferior macula off (${inf.map(f2).join(', ')} mm), superior macula on`);
    const S = VP.sec(VP.ST.rrd, W_, H_, VP.WIN.fov, 'm4', { tw: VP.WIN.fovT, noTissue: true }).M, hl = VP.SEC_H + 6 > 12 ? VP.SEC_H - 6 : VP.SEC_H + 6;
    ok('M4', Math.cos(hl * Math.PI / 6) < 0 && S.macOff[0] < -1 && S.macOn[0] > 1 && near(S.fovea[0], 0, 1e-6) && onScreen(ctx, '1-3', '下半部黃斑剝離inferiormaculaoff') && onScreen(ctx, '1-3', '上半部黃斑貼著superiormaculaon'),
      `1-3 section: 「inferior macula off」 on the ${hl} o'clock (inferior) side at ${f2(S.macOff[0])} mm, 「superior macula on」 at ${f2(S.macOn[0])} mm`); }
  // M5 1-1 line 3: the tear at 11 o'clock on the chart and in the section (right side, in the plane), and in the head view of 1-2
  { const v = VP.fundus(VP.ST.rrd, W_, H_, VP.WIN.chart, 'm5'), c = v.P([0, 0]), ht = clockScr([v.A.tear[0] - c[0], v.A.tear[1] - c[1]]);
    const S = VP.sec(VP.ST.rrd, W_, H_, VP.WIN.sec, 'm5s', { tw: VP.WIN.secT, noTissue: true }).M;
    ok('M5', line(ctx, '1-1', 3).includes('裂孔在 11 點') && near(hdiff(ht, CASE.tear), 0, 0.1) && S.tearMid_off < 0.05 && S.tearMid[0] > 5 && VP.SEC_H === CASE.tear,
      `1-1 tear: chart ${f2(ht)} o'clock, section ${f2(S.tearMid_off)} mm off the plane, right side (病例 11)`); }
  // M6 1-1 line 3: the tear lies in the detachment, near its highest border (within 1 clock hour of 11:30)
  { const st = VP.ST.rrd, Gm = P.geom(st), T = Gm.tear, U = P.uOutline(T.w, T.L), Hs = U.map(q => { const r = P.onRetina(Gm, T.fr0, q[0], q[1], 0.5, Gm.ret0); return Gm.H(r.s, r.h); });
    const v = VP.fundus(st, W_, H_, VP.WIN.chart, 'm6'), c = v.P([0, 0]), ht = clockScr([v.A.tear[0] - c[0], v.A.tear[1] - c[1]]);
    ok('M6', line(ctx, '1-1', 3).includes('落在剝離最高的邊緣附近') && Math.min(...Hs) > 0.3 && Math.abs(hdiff(ht, CASE.rdFrom)) <= 1,
      `1-1 tear edge on detached retina (lowest ${f2(Math.min(...Hs))} mm), ${f2(Math.abs(hdiff(ht, CASE.rdFrom)))} h from the 11:30 border`); }
  // M7 1-2 lines 1–2: Lincoff (Yoshida 2018): a detachment crossing 12 → the break within 1.5 clock hours of 12; the drawn sector and the case
  { const L = VP.LINCOFF, st = VP.ST.rrd, v = VP.fundus(st, W_, H_, VP.WIN.chart, 'm7'), c = v.P([0, 0]), ht = clockScr([v.A.tear[0] - c[0], v.A.tear[1] - c[1]]);
    ok('M7', line(ctx, '1-2', 1).includes('跨過 12 點的上方剝離') && line(ctx, '1-2', 1).includes('12 點左右一個半鐘點內') && line(ctx, '1-2', 2).includes('本例的 11 點，正好在這個範圍裡')
      && L.c === 12 && L.half === LIT.lincoff && det(st, 11.75) && det(st, 12) && det(st, 0.25) && Math.abs(hdiff(ht, L.c)) <= L.half,
      `1-2 sector ${L.c} ± ${L.half} h (Yoshida 2018: 1.5), the detachment crosses 12, the drawn tear at ${f2(ht)} o'clock inside it`); }
  // M8 1-2 line 0: the detachment follows gravity — sitting upright, screen down = gravity; the tear above the fovea; the drawn fluid path runs down
  { const Hd = VP.head(VP.ST.sit, W_, H_, VP.WIN.head, 'm8'), pl = Hd.r.plane, gu = GLOBE.dot(pl.U, SIT_G), gv = GLOBE.dot(pl.V, SIT_G), M = Hd.M, fl = M.flow;
    ok('M8', line(ctx, '1-2', 0).includes('剝離依重力進展') && Math.abs(gu) < 1e-6 && gv > 0.8 && M.tearMid[1] < M.fovea[1] - 5 && fl[fl.length - 1][1] > fl[0][1] + 5 && onScreen(ctx, '1-2', 'SRF（示意）'),
      `1-2 head view sitting: gravity on screen (${f2(gu)}, ${f2(gv)}) = down; tear ${f2(M.fovea[1] - M.tearMid[1])} mm above the fovea; fluid path ${f2(fl[0][1])} → ${f2(fl[fl.length - 1][1])} mm (down), 示意`); }
  // M9 1-3 line 3: 「superotemporal」 points to the superotemporal quadrant of a left eye (12 → 3 o'clock), where the case is detached
  { const h = VP.ST_H, x = Math.sin(h * Math.PI / 6) * OS_TEMPORAL, y = Math.cos(h * Math.PI / 6);
    ok('M9', line(ctx, '1-3', 3).includes('superotemporal') && x > 0.3 && y > 0.3 && det(VP.ST.rrd, h) && onScreen(ctx, '1-3', '上方偏顳側superotemporal'),
      `1-3 「上方偏顳側 superotemporal」 at ${h} o'clock (OS: between 12 and 3), detached there`); }
  // M10 1-4 line 2: 23G three-port PPV (病例): three ports drawn, one infusion; the plan rows on screen; no buckle, no phaco, C3F8
  { const st = VP.ST.setup, E = VP.ext(st, 306, H_, VP.WIN.ext, 'm10'), n = Object.keys(E.A).filter(k => k.startsWith('troc_')).length, inf = P.troc(P.geom(st)).filter(t => t.inf).length;
    ok('M10', line(ctx, '1-4', 2).includes('23G 三孔 PPV') && n === CASE.ports && inf === 1 && ['23G 三孔 PPV', '不合併白內障手術（phaco）', '不加 scleral buckle', '最後打 C3F8'].every(t => onScreen(ctx, '1-4', t)),
      `1-4 microscope view: ${n} ports (${inf} infusion; 病例 三孔), plan rows on screen`); }
  // M11 2-1 lines 0–3: trocars 3–4 mm from the limbus (EyeWiki 2026a), 4 mm in a phakic eye (Duker 2021): in the pars plana, in front of the ora on the temporal
  // and the nasal side (Li 2025: 7.58, 6.96 mm). The horizontal section's sides named from the geometry; the drawn ora measured on each side
  { const G = GLOBE, n0 = line(ctx, '2-1', 0), n1 = line(ctx, '2-1', 1), n2 = line(ctx, '2-1', 2), n3 = line(ctx, '2-1', 3), d4 = +((n1.match(/角膜緣後 (\d+(?:\.\d+)?) mm/) || [])[1]);
    const hR = VP.SEC2_H, hL = hR + 6 > 12 ? hR - 6 : hR + 6, S = VP.sec(VP.ST.setup, W_, H_, VP.WIN.sec2, 'm11', { h: hR, tw: VP.WIN.sec2T, noTissue: true }).M;
    const nasR = Math.sin(hR * Math.PI / 6) * OS_TEMPORAL < 0 && Math.sin(hL * Math.PI / 6) * OS_TEMPORAL > 0, oR = sOf(S.oraR_3), oL = sOf(S.oraL_3);
    ok('M11', n0.includes(`${LIT2.trocRange[0]} 到 ${LIT2.trocRange[1]} mm`) && d4 === LIT2.troc && n2.includes('顳側約 7.6 mm，鼻側約 7.0 mm') && n3.includes('4 mm 落在 ora 前面的 pars plana')
      && nasR && S.oraR[0] > 0 && S.oraL[0] < 0 && near(oR, LIT.oraN, 0.05) && near(oL, LIT.oraT, 0.05) && VP.ORA_LBL[hL] === LIT.oraT.toFixed(1) && VP.ORA_LBL[hR] === LIT.oraN.toFixed(1)
      && onScreen(ctx, '2-1', VP.ORA_LBL[hL] + ' mm') && onScreen(ctx, '2-1', VP.ORA_LBL[hR] + ' mm') && onScreen(ctx, '2-1', '顳側temporal') && onScreen(ctx, '2-1', '鼻側nasal')
      && VP.TROC_RANGE[0] === LIT2.trocRange[0] && VP.TROC_RANGE[1] === d4 && d4 < LIT.oraN - 1 && d4 < LIT.oraT - 1 && d4 > G.N.spur + LIT2.plicata,
      `2-1 section: right ${hR} o'clock nasal, ora drawn ${f2(oR)} mm (Li 2025 ${LIT.oraN}), left ${hL} temporal ${f2(oL)} mm (${LIT.oraT}); marks at ${VP.TROC_RANGE.join('–')} mm; narration 4 mm < both, behind the pars plicata (${f2(G.N.spur + LIT2.plicata)} mm)`);
    const Gm = P.geom(VP.ST.setup), f = P.makeCtx(Gm), T3 = P.troc(Gm);
    ok('M11', T3.length === CASE.ports && T3.every(t => near(sOf(t.entry), d4, 0.01) && sOf(t.entry) < oraLit(t.h) - 1 && sOf(t.tip) < oraLit(t.h) && f.cavity(f.at(t.tip)) < 0 && !(f.retina(f.at(t.tip)) < 0)),
      `2-1 the three drawn trocars: ${T3.map(t => `${t.id} ${f2(sOf(t.entry))} mm (ora ${f2(oraLit(t.h))})`).join(', ')}; cannula tips in the vitreous cavity in front of the ora, not in the retina`); }
  // M12 2-1 lines 4–5: the conjunctiva pushed aside, the trocar in obliquely (tunnel 20–30° to the surface, Teixeira 2009) in the drawn plane; while it is in, the
  // conjunctival opening lies over the scleral one; after it comes out, the conjunctiva slides back about 2 mm (Warrier 2008): the openings no longer line up,
  // the conjunctiva closes over the scleral opening, its own opening lies away from the tunnel; the microscope view shows the same offset
  { const G = GLOBE, n4 = line(ctx, '2-1', 4), n5 = line(ctx, '2-1', 5), Vin = VP.port(VP.ST.portIn, W_, H_, VP.WIN.port, 'm12a', VP.PORT, { noTissue: true }), Vout = VP.port(VP.ST.portOut, W_, H_, VP.WIN.port, 'm12b', VP.PORT, { noTissue: true });
    const t = Vout.t, ang = Math.asin(Math.abs(G.dot(t.tdir, t.nin))) / D2R_, e = Vout.M.entry, te = Vout.M.tunnelEnd, scr = Math.atan2(te[1] - e[1], te[0] - e[0]) / D2R_;
    ok('M12', n4.includes('先把結膜推開，再斜著插進鞏膜') && ang >= LIT2.tunnel[0] && ang <= LIT2.tunnel[1] && Vout.inPlane < 1e-6 && scr >= LIT2.tunnel[0] - 1 && scr <= LIT2.tunnel[1] + 1 && onScreen(ctx, '2-1', '斜著插oblique'),
      `2-1 tunnel ${f2(ang)}° to the surface (Teixeira 2009: 20–30°), in the cross-section plane, drawn ${f2(scr)}° below the wall line`);
    const f = P.makeCtx(P.geom(VP.ST.portOut)), cj = t.cjC, dIn = Vin.t.cjC ? G.len(G.sub(Vin.t.cjC, Vin.t.entry)) : 9, dOut = cj ? G.len(G.sub(cj, t.entry)) : 0, cg = G.N.conj / 2;
    const closed = f.conj(f.at(G.add(t.entry, P.N3(t.h, t.s).map(v => v * cg)))) < 0, open = cj && f.conj(f.at(G.add(cj, t.cjN.map(v => v * cg)))) > 0, away = cj && G.dot(G.sub(cj, t.entry), t.tdir) < 0;
    const E = VP.ext(VP.ST.portOut, W_, H_, VP.WIN.extZ, 'm12e').M, mm = E.cj_it && Math.hypot(E.cj_it[0] - E.troc_it[0], E.cj_it[1] - E.troc_it[1]);
    const back = (() => { const M = VP.ext(VP.ST.portOut, W_, H_, VP.WIN.extZ, 'm12f').r.M, a = M(t.entry), b = M(G.sub(t.entry, t.tdir)); return E.cj_it && (E.cj_it[0] - E.troc_it[0]) * (b[0] - a[0]) + (E.cj_it[1] - E.troc_it[1]) * (b[1] - a[1]) > 0; })();
    ok('M12', n5.includes('結膜和鞏膜的開口錯開') && dIn <= 0.05 && near(dOut, LIT2.cjPush, 0.25) && closed && open && away && near(mm, dOut, 0.3) && back
      && onScreen(ctx, '2-1', '結膜的開口conjunctiva') && onScreen(ctx, '2-1', '鞏膜的開口（被結膜蓋住）sclera'),
      `2-1 openings: aligned while the trocar is in (${f2(dIn)} mm); after removal ${f2(dOut)} mm apart (Warrier 2008 ≈ ${LIT2.cjPush}), conjunctiva closed over the scleral opening, its opening on the side the trocar came from; microscope ${f2(mm)} mm`); }
  // M13 2-2 lines 1–2: the left eye's inferotemporal infusion lies on the detachment (11:30 clockwise via 12 and 3 to 5 o'clock); the retina under it is detached
  { const n1 = line(ctx, '2-2', 1), n2 = line(ctx, '2-2', 2), Gm = P.geom(VP.ST.setup), it = P.troc(Gm).find(t => t.inf) || { h: NaN }, h = it.h;
    let detd = true; for (let s = oraLit(h) + 1; s <= oraLit(h) + 4; s += 0.5) if (!(Gm.H(s, h) > 0.05)) detd = false;
    const S = VP.sec(VP.ST.setup, W_, H_, VP.WIN.inf, 'm13', { h: VP.INF_H, tw: VP.WIN.infT, noTissue: true }).M;
    ok('M13', n1.includes('套管常見放在 inferotemporal') && n2.includes('剝離經過 temporal 下方') && n2.includes('inferotemporal 的套管底下，視網膜可能是剝離的')
      && sideName(h).en === LIT2.ports.inf && onArc(h, CASE.rdFrom, CASE.rdTo) && onArc(3, CASE.rdFrom, CASE.rdTo) && detd && VP.INF_H === h && S.troc_it_off < 0.01 && S.troc_it[0] > 0
      && onScreen(ctx, '2-2', '剝離的視網膜detachedretina') && onScreen(ctx, '2-2', sideName(h).en),
      `2-2 infusion at ${h} o'clock = ${sideName(h).zh} ${sideName(h).en} (OS), on the arc ${CASE.rdFrom} → ${CASE.rdTo} via 3; retina 1–4 mm behind the ora detached; drawn section through it (right side)`); }
  // M14 2-1, 2-2: the three ports in the same quadrants in every view — microscope (2-1, 2-2), the section through the infusion (2-2), the wide-angle view (2-2)
  { const E = VP.ext(VP.ST.setup, W_, H_, VP.WIN.extF, 'm14').M, c = E.centre, names = {}, want = { it: LIT2.ports.inf };
    for (const k of ['it', 'st', 'sn']) { const q = E['troc_' + k]; names[k] = q ? sideName(clockSurg([q[0] - c[0], q[1] - c[1]])).en : 'missing'; }
    const oth = [names.st, names.sn].sort().join(), labs = ['灌注inferotemporal', '器械孔superotemporal', '器械孔superonasal'];
    const S = VP.sec(VP.ST.setup, W_, H_, VP.WIN.inf, 'm14s', { h: VP.INF_H, tw: VP.WIN.infT, noTissue: true }).M, hl = VP.INF_H + 6 > 12 ? VP.INF_H - 6 : VP.INF_H + 6;
    const Wv = VP.wide(Object.assign({}, VP.ST.setup, { look: VP.LOOK_INF }), W_, H_, VP.WIN.wide, 'm14w').M, hw = Wv.cannula_it && clockSurg([Wv.cannula_it[0] - Wv.pole[0], Wv.cannula_it[1] - Wv.pole[1]]);
    ok('M14', names.it === want.it && oth === LIT2.ports.other.join() && labs.every(t => onScreen(ctx, '2-1', t) && onScreen(ctx, '2-2', t))
      && S.troc_it && S.troc_it_off < 0.01 && S.troc_it[0] > 0 && sideName(VP.INF_H).en === names.it && S.troc_sn && S.troc_sn_off < 0.01 && S.troc_sn[0] < 0 && sideName(hl).en === names.sn
      && hw && sideName(hw).en === names.it && Math.hypot(Wv.cannula_it[0], Wv.cannula_it[1]) < Wv.R,
      `ports — microscope: infusion ${names.it}, ${names.st}, ${names.sn} (Tei 2005); 2-2 section: infusion right (${sideName(VP.INF_H).en}), superonasal port left (${sideName(hl).en}); wide view: infusion cannula at ${hw && f2(hw)} o'clock, inside the field`); }
  // M15 2-2 lines 0, 3–5: the infusion tip — in the vitreous cavity (drawn in the wide view), under the retina in the 錯誤示範, in the wall (示意) when air goes under the choroid
  { const tipOf = st => { const Gm = P.geom(st), f = P.makeCtx(Gm), t = P.troc(Gm).find(x => x.inf) || { tip: [0, 0, 30] }; return { c: f.at(t.tip), f, t }; };
    const A = tipOf(VP.ST.setup), B = tipOf(VP.ST.infSub), C = tipOf(VP.ST.infAir), Wv = VP.wide(Object.assign({}, VP.ST.setup, { look: VP.LOOK_INF }), W_, H_, VP.WIN.wide, 'm15w').M;
    ok('M15', line(ctx, '2-2', 4).includes('一定要看到尖端在玻璃體腔') && A.f.cavity(A.c) < 0 && !(A.f.srf(A.c) < 0) && !(A.f.retina(A.c) < 0) && Wv.cannulaU0_it > 0 && onScreen(ctx, '2-2', '尖端在玻璃體腔inthevitreous'),
      `2-2 correct: infusion tip in the vitreous cavity, drawn in the wide view from ${f2(Wv.cannulaU0_it)} of the cannula on`);
    ok('M15', line(ctx, '2-2', 3).includes('套管尖端不可以在視網膜下') && B.f.srf(B.c) < 0 && onScreen(ctx, '2-2', '錯誤示範') && onScreen(ctx, '2-2', '尖端在視網膜下subretinal'),
      '2-2 錯誤示範: the tip under the retina (in the subretinal fluid), labelled on screen');
    ok('M15', line(ctx, '2-2', 5).includes('若空氣跑到脈絡膜下') && line(ctx, '2-2', 5).includes('要立刻停止灌氣') && VP.ST.infAir.gas > 0 && !(C.f.cavity(C.c) < 0) && C.c.dd > C.c.T - 0.02 && C.c.dd < C.c.T + 0.1
      && onScreen(ctx, '2-2', '空氣跑到脈絡膜下（示意）') && onScreen(ctx, '2-2', '示意'),
      `2-2 示意: air in the eye, the slipped tip in the wall just inside the sclera (${f2(C.c.dd)} mm deep, sclera ${f2(C.c.T)} mm), not in the cavity`); }
  return R;
}

// ---------------------------------------------------------------- run
function ledgerChecks(ctx) {
  const R = [], ok = (c, m) => R.push([!!c, m]);
  for (const r of REFS) ok(/\d{4};/.test(r), `reference has 「year;」: ${r.slice(0, 50)}`);
  for (const sg of ctx.segs) {
    if (sg.chapterCard || sg.layout === 'refs') continue;
    const texts = [sg.title || '', ...(sg.lines || []), ...(sg.keys || []).map(k => k[1]), ...(ctx.screen[sg.id] || [])];
    const srcs = (sg.src || []).flatMap(s => plainSrc(s[1])), L = ctx.ledger[sg.id] || {};
    for (const s of srcs) ok(s === '院內常規' || s === '本片各章來源' || cites(s).length && cites(s).every(inRefs), `${sg.id}: source 「${s}」 is a reference of this video or 院內常規`);
    const found = new Set(), cs = [];
    for (const t of texts) { numbers(t).forEach(n => found.add(n)); cs.push(...cites(t)); }
    for (const c of cs) ok(inRefs(c), `${sg.id}: citation 「${c.all}」 on screen is in REFS`);
    for (const n of found) ok(L[n], `${sg.id}: number ${n} has a source in the ledger${L[n] ? ` (${L[n]})` : ''}`);
    for (const [n, src] of Object.entries(L)) {
      ok(found.has(n), `${sg.id}: ledger number ${n} is used on screen or in the narration`);
      const cited = srcs.includes(src) || ['結構', '示意', '病例'].includes(src) || texts.join('').includes(src);
      ok(cited, `${sg.id}: ledger source of ${n} (${src}) is cited in the segment`); }
  }
  // every reference is cited somewhere (a reference nobody cites is a leftover)
  const allSrc = ctx.segs.flatMap(s => (s.src || []).flatMap(x => plainSrc(x[1]))).flatMap(cites);
  for (const r of REFS) ok(allSrc.some(c => r.startsWith(c.who) && r.includes(c.year + ';')), `reference is cited in a segment: ${r.slice(0, 50)}`);
  return R;
}
const clone = o => JSON.parse(JSON.stringify(o));
function baseCtx(screen) {
  const text = {}; for (const s of SEGS) text[s.id] = clone(s);
  return { VP: VP0, text, segs: clone(SEGS), screen: clone(screen), ledger: clone(LEDGER) };
}
// mutation helpers: a copy of VP with some states, constants or views replaced
const vpWith = patch => Object.assign({}, VP0, patch);
const stWith = (k, patch) => vpWith({ ST: Object.assign({}, VP0.ST, { [k]: Object.assign({}, VP0.ST[k], patch) }) });
const portWith = o => Object.assign({}, POSTERIOR.CASE, { troc: POSTERIOR.trocarsFor('OS').map(t => t.id === VP0.PORT ? Object.assign({}, t, o) : t) });   // the demonstrated port changed
const mirrorChart = (keys) => vpWith({ fundus: (...a) => { const r = VP0.fundus(...a), c = r.P([0, 0]), A = Object.assign({}, r.A); for (const k of keys || Object.keys(A)) A[k] = [2 * c[0] - A[k][0], A[k][1]]; return Object.assign({}, r, { A }); } });
const runAll = ctx => [...ledgerChecks(ctx), ...modelChecks(ctx)];
(async () => {
  const screen = await screenText();
  if (process.argv.includes('--list')) { for (const s of SEGS) if (!s.chapterCard && s.layout !== 'refs') { const t = [s.title || '', ...(s.lines || []), ...(s.keys || []).map(k => k[1]), ...(screen[s.id] || [])];
    console.log(s.id, [...new Set(t.flatMap(numbers))].join(' '), '|', [...new Set(t.flatMap(x => cites(x).map(c => c.all)))].join(', ')); } return; }
  const res = runAll(baseCtx(screen));
  let fail = 0; const shown = new Set();
  for (const [c, m] of res) { if (!c) fail++; const key = (c ? 'PASS ' : 'FAIL ') + m; if (!c || !/ledger|has a source|is a reference|citation|reference/.test(m)) console.log(key); else shown.add(m); }
  console.log(`PASS ledger: ${shown.size} number / source / citation checks`);
  if (process.argv.includes('--selftest')) {   // each mutation must make at least one check fail
    const MUT = [
      ['narration number without a source', c => { c.segs.find(s => s.id === '2-1').lines[3] += '，約 5 mm'; }],
      ['key-box number without a source', c => { c.segs.find(s => s.id === '7-2').keys[0][1] += '（18%）'; }],
      ['on-screen number without a source', c => { c.screen['8-1'] = ['氣泡 60%']; }],
      ['ledger entry not used', c => { c.ledger['1-3']['99'] = 'Callizo 2017'; }],
      ['ledger source not cited in the segment', c => { c.ledger['5-2']['1.9'] = 'Jackson 2013'; }],
      ['citation not in REFS', c => { c.screen['4-2'] = ['Smith 2020']; }],
      ['source not a reference', c => { c.segs.find(s => s.id === '1-2').src[0][1] = 'Yoshida 2019'; }],
      ['two-word surname not in REFS', c => { c.segs.find(s => s.id === '1-4').src[0][1] = 'Ferro Desideri 2023'; }],
      ['reference cited nowhere', c => { const s = c.segs.find(x => x.id === '2-2'); s.src = s.src.filter(x => x[1] !== 'Tei 2005'); }],
      // narration ↔ model (each must make its own check fail)
      ['chart drawn mirrored (temporal on the left)', c => { c.VP = mirrorChart(); }, 'M1'],
      ['section side named 上方偏顳側', c => { c.screen['1-1'] = c.screen['1-1'].map(t => t.replace('上方偏鼻側', '上方偏顳側')); }, 'M1'],
      ['drawn extent from 11 o\'clock', c => { c.VP = vpWith({ RD_ARC: [11, 17] }); }, 'M2'],
      ['the detachment of a right eye (through 9)', c => { c.VP = stWith('rrd', { eye: 'OD' }); }, 'M2'],
      ['disc drawn on the temporal side', c => { c.VP = mirrorChart(['disc']); }, 'M3'],
      ['detachment 1 mm higher (over the fovea)', c => { c.VP = stWith('rrd', { rd: { amt: 1, border: POSTERIOR.CASE_RD.map(([x, y]) => [x, y + 1]) } }); }, 'M4'],
      ['tear at 10 o\'clock', c => { c.VP = stWith('rrd', { tear: { h: 10 } }); }, 'M5'],
      ['detachment turned 1.5 h clockwise (tear outside it)', c => { const r = 45 * Math.PI / 180; c.VP = stWith('rrd', { rd: { amt: 1, border: POSTERIOR.CASE_RD.map(([x, y]) => [x * Math.cos(r) + y * Math.sin(r), -x * Math.sin(r) + y * Math.cos(r)]) } }); }, 'M6'],
      ['Lincoff sector 12 ± 1 h', c => { c.VP = vpWith({ LINCOFF: { c: 12, half: 1 } }); }, 'M7'],
      ['tear at 9:30 (outside 12 ± 1.5 h)', c => { c.VP = stWith('rrd', { tear: { h: 9.5 } }); }, 'M7'],
      ['head view lying supine', c => { c.VP = stWith('sit', { head: { pose: 'supine' } }); }, 'M8'],
      ['superotemporal label at 10:30', c => { c.VP = vpWith({ ST_H: 10.5 }); }, 'M9'],
      ['two ports', c => { c.VP = stWith('setup', { troc: POSTERIOR.trocarsFor('OS').slice(0, 2) }); }, 'M10'],
      ['trocars 7.5 mm behind the limbus', c => { c.VP = stWith('setup', { troc: POSTERIOR.trocarsFor('OS').map(t => Object.assign({}, t, { s: 7.5 })) }); }, 'M11'],
      ['ora distances swapped (temporal 7.0)', c => { c.VP = vpWith({ ORA_LBL: { 3: '7.0', 9: '7.6' } }); }, 'M11'],
      ['straight insertion (tunnel 90°)', c => { c.VP = vpWith({ ST: Object.assign({}, VP0.ST, { portOut: portWith({ ins: 1, out: 1, cj: -2, ang: 90 }) }) }); }, 'M12'],
      ['conjunctiva not pushed (openings still aligned)', c => { c.VP = vpWith({ ST: Object.assign({}, VP0.ST, { portOut: portWith({ ins: 1, out: 1, cj: 0 }) }) }); }, 'M12'],
      ['infusion at 7:30', c => { c.VP = stWith('setup', { troc: POSTERIOR.trocarsFor('OS').map(t => t.inf ? Object.assign({}, t, { h: 7.5 }) : t) }); }, 'M13'],
      ['microscope with the surgeon at 6', c => { c.VP = stWith('setup', { surgeon: 6 }); }, 'M14'],
      ['error demonstration with the tip in the cavity', c => { c.VP = stWith('infSub', { troc: POSTERIOR.trocarsFor('OS') }); }, 'M15'],
    ];
    let bad = 0;
    for (const [name, mut, target] of MUT) { const c = baseCtx(screen); mut(c); const fails = runAll(c).filter(r => !r[0]), n = fails.length, hit = !target || fails.some(r => r[1].startsWith(target + ' '));
      console.log(`${n && hit ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail${target ? (hit ? `, including ${target}` : `, not ${target}`) : ''}`); if (!n || !hit) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
