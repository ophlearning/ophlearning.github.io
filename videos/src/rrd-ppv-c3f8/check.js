// Video-level checks for this video (run by videos/tools/check-all.js when present; or: node check.js [--selftest] [--list]).
// 1. Number ledger: every number in the narration, key boxes, titles and every text drawn on screen (each segment rendered at every
//    narration line) must be listed for that segment in LEDGER with its source; every citation shown must be one of REFS; every
//    ledger source must be cited in that segment (src) or be 示意 / 結構 / 病例 (結構 = clock-hour names, list numbers, scale bars;
//    病例 = the case summary confirmed by 站長 2026-11-12, spec.md「病例情境」).
// 2. Narration ↔ model (M1…): each spatial claim the narration makes about the case is checked on what the video draws: the posterior-segment
//    model (videos/models/posterior) through anim/views-posterior.js (VP: the states, windows and drawing constants draw.js uses), against
//    case or literature numbers written here — never against the model's own parameters. Segments drawn so far: title, chapters 1–6.
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
  '3-1': { '11': '病例', '5': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構', '2': '結構', '180': 'Spitznas 1987' },
  '3-2': { '11': '病例', '12': '結構', '5': '結構', '3': '結構', '6': '結構', '9': '結構', '2': '結構' },
  '4-1': { '110': 'Lai 2019', '10': '示意', '1': '示意', '4': '示意', '12': '結構', '3': '結構', '6': '結構', '9': '結構' },   // 10, 1, 4: trocar clock hours (依主刀決定)
  '4-2': { '1': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
  '5-1': { '106': 'Govetto 2024', '11': '病例', '1.2': 'Jackson 2013', '1.6': 'Jackson 2013', '2': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構',
           '10': '示意', '1': '示意' },   // 10, 1: the 10:30 port's section (trocar clock hours 依主刀決定)
  '5-2': { '1.9': 'Neffendorf 2017', '5.8': 'Neffendorf 2017', '11': '病例', '2': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
  '6-1': { '11': '病例', '2': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構', '10': '示意', '1': '示意' },   // 10, 1: the needle's 10:30 port, the light pipe's 1:30 port (trocar clock hours 依主刀決定)
  '6-2': { '4.5': 'Figueroa 2013', '10.3': 'Garg 2012', '11': '病例', '2': '結構', '12': '結構', '3': '結構', '6': '結構', '9': '結構', '4': '示意', '1': '結構' },   // 4: the 4:30 infusion (示意); 1: the 1 mm scale bar
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
  // chapter 3. Screen vectors of the surgeon's wide-angle view are taken from the field centre (VP.wide(...).M: model mm, y down) or from the pole;
  // up/down/left/right are written here (screen y down), not taken from the model's orientation code.
  const wideM = st => VP.wide(st, W_, H_, VP.WIN.wide3, 'mw').M, wideMap = st => VP.wide(st, W_, H_, VP.WIN.wide3, 'mw').r.map;
  const scr = (st, h, s = 14) => { const m = wideMap(st), Gm = P.geom(st), q = m.proj(Gm.ret(h, s, 1)), o = m.proj([0, 0, -12]); return [q[0] - o[0], q[1] - o[1]]; };
  const degFromDown = v => Math.atan2(v[0], v[1]) / D2R_, degFromUp = v => Math.atan2(-v[0], -v[1]) / D2R_;   // + = to the right of straight down / to the left of straight up
  // M16 3-1 lines 1–2: the wide-angle image is upside down and laterally reversed (Spitznas 1987) = turned 180°; the inverter turns it back.
  // (a) the light path drawn (示意): the real image of each retinal point lies on the other side of the axis, the inverter's output on the same side;
  // (b) the wide-angle view drawn with the inverter off = the inverter-on view turned 180° about the field centre (every anchor), for both pairs drawn;
  //     the 12 o'clock point goes from the bottom to the top and the 3 o'clock point from the left to the right
  { const O = VP.optics(), hs = [VP.SEC_H, ((VP.SEC_H + 5) % 12) + 1];
    const inv = hs.every(h => O.R[h][0] * O.I[h][0] < 0 && O.R[h][0] * O.E[h][0] > 0 && near(Math.abs(O.E[h][0]), Math.abs(O.I[h][0]), 1e-9) && O.I[h][1] < O.apex[1] && O.R[h][1] > O.apex[1]
      && O.rays[h].every(r => r[0] === O.R[h] && near(r[r.length - 1][0], O.I[h][0], 1e-9) && near(r[r.length - 1][1], O.I[h][1], 1e-9)));
    ok('M16', line(ctx, '3-1', 1).includes('影像上下顛倒、左右相反') && line(ctx, '3-1', 2).includes('inverter 關著時，看到的就是倒像') && inv && onScreen(ctx, '3-1', '倒像（鏡片上方的實像）inverted'),
      `3-1 light path (示意): ${hs.map(h => `${h} o'clock retina at x ${f2(O.R[h][0])} → real image ${f2(O.I[h][0])} (other side) → inverter ${f2(O.E[h][0])}`).join('; ')} mm`);
    let worst = 0, n = 0; const flips = [];
    for (const [a, b] of [['view3', 'view3Off'], ['depOn', 'depOff']]) { const on = wideM(VP.ST[a]), off = wideM(VP.ST[b]);
      for (const k of Object.keys(on)) if (Array.isArray(on[k]) && on[k].length === 2 && off[k]) { worst = Math.max(worst, Math.hypot(on[k][0] + off[k][0], on[k][1] + off[k][1])); n++; }
      const v12 = scr(VP.ST[a], 12), w12 = scr(VP.ST[b], 12), v3 = scr(VP.ST[a], 3), w3 = scr(VP.ST[b], 3); flips.push(v12[1] > 5 && w12[1] < -5 && v3[0] < -5 && w3[0] > 5); }
    ok('M16', n > 20 && worst < 1e-6 && flips.every(Boolean) && onScreen(ctx, '3-1', '整張轉 180°') && onScreen(ctx, '3-1', 'inverter 關：倒像') && onScreen(ctx, '3-1', 'inverter 開：正像'),
      `3-1, 3-2 wide view: inverter off = inverter on turned 180° (${n} anchors, max ${worst.toExponential(1)} mm); 12 o'clock bottom → top, 3 o'clock left → right`); }
  // M17 3-2 line 1: surgeon at the patient's head (12), inverter on: the left eye's 12 o'clock at the bottom of the picture, temporal (3 o'clock) on the left
  { const st = VP.ST.view3, v12 = scr(st, 12), v3 = scr(st, 3), tH = OS_TEMPORAL > 0 ? 3 : 9;
    ok('M17', line(ctx, '3-2', 1).includes('術者坐在病人頭側') && line(ctx, '3-2', 1).includes('左眼的 12 點在畫面下方，temporal 在畫面左邊') && st.eye === 'OS' && st.inverter !== false && tH === 3
      && v12[1] > 5 && Math.abs(degFromDown(v12)) < 1 && v3[0] < -5 && Math.abs(v3[1]) < 0.5 && onScreen(ctx, '3-2', '本片假設術者坐病人頭側') && onScreen(ctx, '3-2', '下＝12 點、左眼 temporal 在左'),
      `3-2 wide view (OS, inverter on): 12 o'clock ${f2(degFromDown(v12))}° from straight down, temporal 3 o'clock at (${v3.map(f2).join(', ')}) mm = left`); }
  // M18 3-2 line 2: the left eye's 11 o'clock low in the picture and a little to the right (30° from straight down); on the patient superonasal;
  // the tear seen there when the view turns toward 11 (示意), inside the field
  { const st = VP.ST.view3, v11 = scr(st, 11), d11 = degFromDown(v11), nm = sideName(11), lk = VP.lookStep(st, VP.ST.depOn.look, 1), M = wideM(lk), ht = M.tear && clockSurg([M.tear[0] - M.pole[0], M.tear[1] - M.pole[1]]);
    ok('M18', line(ctx, '3-2', 2).includes('左眼的 11 點，在畫面上靠近下方、略偏右') && line(ctx, '3-2', 2).includes('上方略偏鼻側') && v11[1] > 0 && d11 >= 15 && d11 <= 45 && near(d11, 30, 1)
      && nm.en === 'superonasal' && POSTERIOR.anat(11, st.eye).en === nm.en && onScreen(ctx, '3-2', `11 點：${nm.zh.replace('偏', '略偏')}${nm.en}`)
      && ht && near(hdiff(ht, CASE.tear), 0, 0.1) && Math.hypot(...M.tear) < M.R && onScreen(ctx, '3-2', '11 點裂孔：畫面下方略偏右HST'),
      `3-2 wide view: 11 o'clock ${f2(d11)}° right of straight down (略偏右), ${nm.zh} ${nm.en} on the patient; looking toward 11 the tear at ${ht && f2(ht)} o'clock, inside the field`); }
  // M19 3-2 line 3 (3-1 line 4): the assistant presses at 11 o'clock: the same press in the section and the wide view (every step of the animation);
  // in the 11 o'clock section the wall is pushed in by the depth at that point; in the wide view (inverter on) the mound is at 11 o'clock, pushed into view
  { const sd = VP.ST.dep.dep, same = [0, 1, 2, 3, 4, 5, 6].every(i => JSON.stringify(VP.depStep(VP.ST.dep, i / 6).dep) === JSON.stringify(VP.depStep(VP.ST.depOn, i / 6).dep) && JSON.stringify(VP.depStep(VP.ST.depOff, i / 6).dep) === JSON.stringify(VP.depStep(VP.ST.dep, i / 6).dep));
    const S = VP.sec(VP.ST.dep, W_, H_, VP.WIN.depZ, 'm19', { tw: VP.WIN.depZT, noTissue: true }).M, G0 = P.geom(VP.ST.rrd), G1 = P.geom(VP.ST.dep), inw = GLOBE.len(G0.ret(sd.h, sd.s, 1)) - GLOBE.len(G1.ret(sd.h, sd.s, 1));
    const M = wideM(VP.ST.depOn), hw = M.dep && clockSurg([M.dep[0] - M.pole[0], M.dep[1] - M.pole[1]]);
    ok('M19', line(ctx, '3-2', 3).includes('助手從外面壓 11 點的鞏膜') && line(ctx, '3-2', 3).includes('畫面上會在 11 點看到一個隆起') && VP.DEP_H === CASE.tear && sd.h === CASE.tear && same
      && S.dep_off < 0.02 && S.dep[0] > 0 && near(inw, sd.depth, 0.25) && hw && near(hdiff(hw, CASE.tear), 0, 0.1) && Math.hypot(...M.dep) < M.R && VP.ST.depOn.inverter !== false
      && onScreen(ctx, '3-2', '11 點的隆起mound') && onScreen(ctx, '3-2', '壓鞏膜器depressor') && onScreen(ctx, '3-2', '凹陷：從外面往內壓indentation'),
      `3-2 press at ${sd.h} o'clock, same state in both views (7 steps): section dent in the plane (${f2(S.dep_off)} mm off), right side, wall in by ${f2(inw)} mm (depth ${sd.depth}); wide view mound at ${hw && f2(hw)} o'clock`);
    const m = wideMap(VP.ST.depOn), b0 = m.beta(P.geom(Object.assign({}, VP.ST.depOn, { dep: null })).ret(sd.h, sd.s, 1)), b1 = m.beta(G1.ret(sd.h, sd.s, 1));
    ok('M19', line(ctx, '3-1', 4).includes('照樣可以壓鞏膜看周邊') && b1 < b0 && b1 < m.bmax && onScreen(ctx, '3-1', '壓 11 點的隆起（示意）mound') && onScreen(ctx, '3-1', '壓鞏膜器depressor'),
      `3-1 line 4: the pressed spot comes into view, ${f2(b0 / D2R_)}° → ${f2(b1 / D2R_)}° from the viewing axis (field ±${f2(m.bmax / D2R_)}°)`); }
  // M20 3-2 line 4: with the inverter off the same mound shows up high in the picture and a little to the left (turned 180°: the 5 o'clock direction)
  { const on = wideM(VP.ST.depOn), off = wideM(VP.ST.depOff), v = off.dep && [off.dep[0] - off.pole[0], off.dep[1] - off.pole[1]], u = degFromUp(v || [0, 0]);
    ok('M20', line(ctx, '3-2', 4).includes('隆起出現在別的鐘點') && line(ctx, '3-2', 4).includes('再確認 inverter 有沒有開') && VP.ST.depOff.inverter === false && v && v[1] < 0 && v[0] < 0 && u >= 15 && u <= 45
      && near(off.dep[0], -on.dep[0], 1e-6) && near(off.dep[1], -on.dep[1], 1e-6) && onScreen(ctx, '3-2', 'inverter 關（倒像）') && onScreen(ctx, '3-2', '同一個隆起') && onScreen(ctx, '3-2', '跑到上方略偏左'),
      `3-2 inverter off: the mound ${f2(u)}° left of straight up (上方略偏左), at the 180° turn of the inverter-on mound`); }
  // chapter 4. The drawn states come from VP (coreStep, pvdStep, st42), the same functions draw.js calls for both panels of a frame.
  const G = GLOBE, add = G.add, sub = G.sub, mul = (a, k) => a.map(v => v * k), range = n => [...Array(n).keys()];
  // M21 4-1 lines 0, 3; 4-2: the instruments go in only through the case's trocars — the vitrector through the superonasal port, the light pipe through
  // the superotemporal port (the working ports of 2-1 and 2-2; Tei 2005), never the infusion: in every drawn state the shaft passes its port's pivot, from the
  // cannula to the tip it stays in the eye's cavity (not in the lens, iris or retina) and the whole shaft stays ≥ 0.5 mm from the phakic lens. The 4-1
  // section through the 10:30 port holds the vitrector's whole shaft and the infusion; in the wide view (inverter on) the vitrector's cannula is superonasal, the light pipe's superotemporal
  { const states = [...range(VP.CORE_STEPS + 1).map(i => VP.coreStep(i / VP.CORE_STEPS, i % 2)), ...range(VP.PVD_STEPS + 1).map(i => VP.pvdStep(i / VP.PVD_STEPS)), ...VP.E42.map(e => VP.st42(e))];
    const want = { vitrector: 'superonasal', light: 'superotemporal' }, bad = []; let lensMin = 9, n = 0;
    for (const st of states) { const Gm = P.geom(st), f = P.makeCtx(Gm), T3 = P.troc(Gm);
      for (const ins of st.inst) { const I = P.instGeom(Gm, ins), port = T3.find(t => t.id === ins.port), name = port && !port.inf ? sideName(port.h).en : 'infusion or none';
        const miss = P.segDist(I.port.pivot, I.tip, I.out); let out = 0, lm = 9; n++;
        for (let t = 0; t <= 1; t += 0.01) { const c = f.at(add(I.tip, mul(sub(I.port.tip, I.tip), t))); if (!(f.interior(c) < 0) || f.lens(c) < 0 || f.iris(c) < 0 || f.retina(c) < 0) out++; }
        for (let t = 0; t <= 1; t += 0.01) lm = Math.min(lm, f.lens(f.at(add(I.tip, mul(sub(I.port.pivot, I.tip), t)))));
        lensMin = Math.min(lensMin, lm); if (name !== want[ins.kind] || miss > 0.02 || out || lm < 0.5) bad.push(`${ins.kind} via ${name} (miss ${f2(miss)}, ${out} samples out, lens ${f2(lm)})`); } }
    ok('M21', line(ctx, '4-1', 0).includes('core vitrectomy') && states.length > 10 && !bad.length && onScreen(ctx, '4-1', '器械孔10 點半 superonasal') && onScreen(ctx, '4-1', '光導管light pipe（從 1 點半）'),
      `ch. 4: ${n} instruments in ${states.length} drawn states go in through their trocars (vitrector superonasal, light pipe superotemporal), stay in the cavity, ≥ ${f2(lensMin)} mm from the lens${bad.length ? '; bad: ' + bad.slice(0, 3).join('; ') : ''}`);
    let sect = true, wideOk = true;
    for (const st of [VP.coreStep(0), VP.ST.core4, VP.pvdStep(0), VP.ST.pvd1]) { const S = VP.sec(st, W_, H_, VP.WIN.sec, 'm21', { h: VP.SEC4_H, tw: VP.WIN.secT, noTissue: true }), M = S.M, pl = S.r.plane, nrm = G.unit(G.cross(pl.U, pl.V));
      const I = P.instGeom(P.geom(st), st.inst[0]), pivOff = Math.abs(G.dot(sub(I.port.pivot, pl.O), nrm));
      if (!(M.inst0_off < 0.05 && pivOff < 0.05 && M.inst1_off < 0.05 && M.troc_sn_off < 0.01 && M.troc_it_off < 0.01 && M.troc_sn[0] > 0 && M.troc_it[0] < 0 && st.inst[0].port === 'sn')) sect = false;
      const Wm = VP.wide(st, W_, H_, VP.WIN.wide3, 'm21w').M, hs = k => Wm['cannulaIn_' + k] && clockSurg([Wm['cannulaIn_' + k][0] - Wm.pole[0], Wm['cannulaIn_' + k][1] - Wm.pole[1]]);
      if (!(hs('sn') && sideName(hs('sn')).en === want.vitrector && hs('st') && sideName(hs('st')).en === want.light && Wm.cannulaIn_sn[0] > 0 && Wm.cannulaIn_st[0] < 0)) wideOk = false; }
    ok('M21', VP.SEC4_H === 10.5 && sideName(VP.SEC4_H).en === want.vitrector && sect && wideOk && VP.OR.sec4.includes('右＝10 點半'),
      `4-1 section through ${VP.SEC4_H} o'clock (${sideName(VP.SEC4_H).en}): the vitrector's tip and pivot, the light pipe's tip and both ports in the plane, the 10:30 port right, the 4:30 infusion left; wide view: vitrector cannula ${want.vitrector} (right), light pipe ${want.light} (left)`); }
  // M22 4-1 lines 3–4: PVD (示意 demonstration of an eye whose posterior hyaloid is still attached). Measured on the drawn gel along the retina's inward
  // normal: at the start the gel lies on the retina at the pole; at the end it is ≥ 2 mm off the retina round the pole (6 mm) and along both drawn meridians
  // from 5 mm behind the vitreous base to the pole, and still on the retina at the vitreous base all round and on the flap's free edge (traction at the
  // anterior edge of the tear, Govetto 2024); the steps only go forward (0 → 1)
  { const gap = (st, h, s) => { const Gm = P.geom(st), f = P.makeCtx(Gm), r = Gm.ret(h, s, 1), nn = mul(P.N3(h, s), -1);
      for (let d = 0.05; d <= 3; d += 0.05) { const c = f.at(add(r, mul(nn, d))); if (f.gel(c) < 0) return d; } return 3; };
    const end = VP.pvdStep(1), start = VP.pvdStep(0), Gm = P.geom(end), notDisc = (h, s) => P.makeCtx(Gm).at(Gm.ret(h, s, 1)).dq > 1.3;
    let pole = 9, pole0 = 0, mer = 9, base = 0;
    for (let h = 1; h <= 12; h++) for (let s = P.S_POLE - 6; s <= P.S_POLE - 0.4; s += 1.4) if (notDisc(h, s)) { pole = Math.min(pole, gap(end, h, s)); pole0 = Math.max(pole0, gap(start, h, s)); }
    for (const h of [VP.SEC4_H, VP.SEC4_H - 6]) for (let s = P.vbPostAt(h, 1) + 5; s <= P.S_POLE - 0.4; s += 1) if (notDisc(h, s)) mer = Math.min(mer, gap(end, h, s));
    for (let h = 0.5; h <= 12; h += 1) { const s = (P.oraAt(h, 1) + P.vbPostAt(h, 1)) / 2; base = Math.max(base, gap(end, h, s)); }
    const f = P.makeCtx(Gm), cord = f.cord, flapOn = cord && f.gel(f.at(add(cord.a, mul(sub(cord.b, cord.a), 0.15)))) < 0 && G.len(sub(cord.a, P.flapPt(Gm.tear, Gm.tear.L, 0))) < 1e-6;
    const ks = range(21).map(i => VP.pvdStep(i / 20).pvd), fwd = ks.every((v, i) => !i || v >= ks[i - 1]) && ks[0] === 0 && ks[20] === 1;
    ok('M22', line(ctx, '4-1', 3).includes('主刀會先把它分開，造成 PVD') && line(ctx, '4-1', 4).includes('Triamcinolone 也讓後玻璃體看得見') && pole0 <= 0.1 && pole >= 2 && mer >= 2 && base <= 0.1 && flapOn && fwd && end.ta > 0
      && onScreen(ctx, '4-1', '示意：後玻璃體還沒分開時') && onScreen(ctx, '4-1', '後玻璃體posterior hyaloid') && onScreen(ctx, '4-1', 'vitreous base 仍黏著'),
      `4-1 PVD (示意): start — gel on the retina at the pole (gap ≤ ${f2(pole0)} mm); end — gel off the retina ≥ ${f2(Math.min(pole, mer))} mm round the pole and along the drawn meridians, on it at the vitreous base (≤ ${f2(base)} mm) and on the flap (cord ${flapOn ? 'attached' : 'missing'}); steps forward ${fwd}`); }
  // M23 4-2 lines 0, 3: the retina sucked into the cutter (錯誤示範). Where the cutter comes near, the retina is detached and high (mobile: > 1 mm); in the
  // plane through the cutter the sucked retina comes up to the port (its apex in the plane, ≤ 0.6 mm from the port, lifted ≥ 0.5 mm); in the wide view of
  // the same state it shows at the projection of that same apex, at the cutter's port and at the same clock hour (superotemporal, near 1 o'clock)
  { let worst = 0, bad = []; const near = VP.st42(VP.E42[VP.E42.length - 1]), G0 = P.geom(near), h0 = G0.H0(VP.SUCK_AT.s, VP.SUCK_AT.h);
    for (let i = 1; i <= VP.SUCK_STEPS; i++) { const st = VP.st42(VP.E42[VP.E42.length - 1], i / VP.SUCK_STEPS), Gm = P.geom(st), sk = Gm.suck, I = P.instGeom(Gm, st.inst[0]);
      const S = VP.instSec(st, W_, H_, VP.WIN.z42, 'm23', { noTissue: true }).M, ap = S.suck_3, lift = G.len(sub(ap, G0.ret(sk.h, sk.s, 1)));
      const Wv = VP.wide(st, W_, H_, VP.WIN.wide3, 'm23w'), Wm = Wv.r.map, wa = Wv.M.suck, same = wa && Math.hypot(wa[0] - Wm.proj(ap)[0], wa[1] - Wm.proj(ap)[1]), atPort = wa && Math.hypot(wa[0] - Wm.proj(I.portAt)[0], wa[1] - Wm.proj(I.portAt)[1]);
      const hw = wa && clockSurg([wa[0] - Wv.M.pole[0], wa[1] - Wv.M.pole[1]]), hsec = G.clockOf(ap[0], ap[1]);
      worst = G.len(sub(ap, I.portAt));   // the last step's (fully sucked) distance to the port
      if (i === VP.SUCK_STEPS && !(S.suck_off < 0.1 && G.len(sub(ap, I.portAt)) <= 0.6 && lift >= 0.5)) bad.push(`section apex ${f2(S.suck_off)} mm off the plane, ${f2(G.len(sub(ap, I.portAt)))} mm from the port, lifted ${f2(lift)}`);
      if (!(same < 0.05 && atPort < 1 && near_h(hw, hsec) && near_h(hsec, VP.SUCK_AT.h, 0.25) && sideName(hw).en === 'superotemporal')) bad.push(`step ${i}: wide apex ${same && f2(same)} mm from the section's apex, ${atPort && f2(atPort)} mm from the port, at ${hw && f2(hw)} o'clock (section ${f2(hsec)})`); }
    ok('M23', line(ctx, '4-2', 0).includes('就可能把它吸進來') && line(ctx, '4-2', 3).includes('助手看到視網膜被吸起來') && h0 > 1 && !bad.length
      && onScreen(ctx, '4-2', '錯誤示範') && onScreen(ctx, '4-2', '視網膜被吸進切割口') && onScreen(ctx, '4-2', '視網膜被吸起（示意）'),
      `4-2 sucked retina: detached ${f2(h0)} mm where the cutter comes near; fully sucked, its apex ${f2(worst)} mm from the port (in the plane); the wide view shows it at the same apex, at the port, superotemporal${bad.length ? '; bad: ' + bad.join('; ') : ''}`); }
  // M24 4-2 lines 1–2 (Teixeira 2010, porcine eyes; 示意 of the direction, no values): the drawn pull rises with the vacuum, rises as the cutter comes closer
  // and falls with the cut rate; line 1's drawn sequence follows it (vacuum up → more, closer → more, cut rate up → less); line 2's setting (high cut rate,
  // low vacuum) pulls less than every line 1 setting and its retina is not sucked; the distance bar follows the tip's real distance from the retina
  { const tr = VP.traction, s = VP.TR42, T_ = x => tr(x.vac, VP.distOf(x.e), x.cut), g = [0, 0.25, 0.5, 0.75, 1];
    let mono = true; for (const a of g) for (const b of g) for (let i = 1; i < g.length; i++) { if (!(tr(g[i], a, b) > tr(g[i - 1], a, b))) mono = false; if (!(tr(1, g[i], a) < tr(1, g[i - 1], a))) mono = false; if (!(tr(0.5, a, g[i]) < tr(0.5, a, g[i - 1]))) mono = false; }
    const seq = T_(s.s1) > T_(s.s0) && T_(s.s2) > T_(s.s1) && T_(s.s3) < T_(s.s2) && [s.s0, s.s1, s.s2, s.s3].every(x => T_(s.low) < T_(x)) && s.s1.vac > s.s0.vac && s.s2.e < s.s1.e && s.s3.cut > s.s2.cut && s.low.vac < s.s3.vac;
    const dReal = VP.E42.map(e => { const st = VP.st42(e), Gm = P.geom(st); return G.len(sub(P.instGeom(Gm, st.inst[0]).tip, Gm.ret(VP.SUCK_AT.h, VP.SUCK_AT.s, 1))); });
    const bars = VP.E42.every((e, i) => !i || (dReal[i] < dReal[i - 1] && VP.distOf(e) < VP.distOf(VP.E42[i - 1]))) && VP.E42.every((e, i) => near(dReal[i], e, 0.05)), lowFlat = !VP.st42(s.low.e, 0).suck;
    ok('M24', line(ctx, '4-2', 1).includes('吸力越大、離視網膜越近，拉力越大') && line(ctx, '4-2', 1).includes('切速越快，拉力越小') && line(ctx, '4-2', 2).includes('高切速、低吸力')
      && mono && seq && bars && lowFlat && onScreen(ctx, '4-2', '拉力的方向（示意，豬眼實驗）') && onScreen(ctx, '4-2', '拉力（示意）traction') && onScreen(ctx, '4-2', '高切速、低吸力：視網膜不被吸起'),
      `4-2 pull (示意): monotone ${mono} (up with vacuum, up when closer, down with cut rate); line 1 ${[s.s0, s.s1, s.s2, s.s3].map(x => f2(T_(x))).join(' → ')}, line 2 ${f2(T_(s.low))}; tip ${dReal.map(f2).join(' → ')} mm from the retina (bars follow)`); }
  // chapter 5. States from VP (shaveStep, ST.far5, ST.dep52 and depStep), the same functions draw.js calls for both panels of a frame.
  const LIT5 = { vbWidth: [2, 6] };   // Sohn 2020: the vitreous base is 2–6 mm wide and straddles the ora; breaks at its posterior edge
  const innerAt = (f, h, s) => f.interior(f.at(P.P3(h, s, 0)));   // depth of the eye wall's inner surface (ciliary epithelium or retina) at (h, s)
  const gelOn = (f, h, s) => { const d0 = innerAt(f, h, s), nn = mul(P.N3(h, s), -1), q = P.P3(h, s, d0); let a = null, b = 0;   // [gap to the gel, gel thickness] along the inward normal
    for (let d = 0.02; d <= 8; d += 0.02) { const g = f.gel(f.at(add(q, mul(nn, d)))) < 0; if (g && a === null) a = d; if (!g && a !== null) { b = d - a; break; } } return [a, b]; };
  // M25 5-1 line 1: the vitreous base straddles the ora (Sohn 2020): on the drawn 11 o'clock meridian (before shaving) the vitreous-base field lies on the wall
  // from in front of the ora (pars plana) to behind it, 2–6 mm wide, and the gel there touches the wall; the tear's hinge (its anterior edge) is at the base's
  // back border and the U of the tear behind it (breaks at the posterior edge, Sohn 2020)
  { const st = VP.shaveStep(0), Gm = P.geom(st), f = P.makeCtx(Gm), h = CASE.tear, ora = oraLit(h); let fr = null, bk = null;
    for (let s = ora - 4; s <= ora + 5; s += 0.02) if (f.vb(f.at(P.P3(h, s, innerAt(f, h, s) + 0.15))) < 0) { if (fr === null) fr = s; bk = s; }
    const touch = [ora - 1, ora + 1].every(s => gelOn(f, h, s)[0] <= 0.05), T = Gm.tear, hinge = sOf(T.fr0.Q), apex = P.onRetina(Gm, T.fr0, T.L, 0, 0, Gm.ret0).s;
    ok('M25', line(ctx, '5-1', 1).includes('跨在 ora 上；裂孔通常就在它的後緣') && fr !== null && fr < ora - 0.5 && bk > ora + 0.5 && bk - fr >= LIT5.vbWidth[0] && bk - fr <= LIT5.vbWidth[1] && touch
      && near(hinge, bk, 0.15) && apex > hinge + 1 && onScreen(ctx, '5-1', 'vitreous base：跨在 ora 上') && onScreen(ctx, '5-1', 'ora serrata') && onScreen(ctx, '5-1', '裂孔就在它的後緣HST'),
      `5-1 vitreous base on the 11 o'clock meridian ${f2(fr - ora)} → +${f2(bk - ora)} mm about the ora (${f2(bk - fr)} mm wide; Sohn 2020: 2–6, across the ora), gel on the wall both sides; hinge ${f2(hinge - bk)} mm from its back border, tear apex ${f2(apex - hinge)} mm behind`); }
  // M26 5-1 line 2: the flap pulled forward by the gel (Govetto 2024: traction at the anterior edge of all 106 tears): the hinge is the tear's anterior edge
  // (toward the ora), the flap's free edge lifted into the cavity and in front of the hinge, gel on it; the drawn pull (the strand) points into the cavity and forward
  { const st = VP.shaveStep(0), Gm = P.geom(st), f = P.makeCtx(Gm), T = Gm.tear, fe = P.flapPt(T, T.L, 0), d = sub(fe, T.fr.Q), fwd = -G.dot(d, T.fr.eu), up = G.dot(d, T.fr.en);
    const cd = f.cord && G.unit(sub(f.cord.b, f.cord.a)), onFlap = f.gel(f.at(add(fe, mul(cd || [0, 0, 0], 0.15)))) < 0;
    ok('M26', line(ctx, '5-1', 2).includes('瓣，被玻璃體往前拉著') && line(ctx, '5-1', 2).includes('106 個，前緣全都有玻璃體牽拉') && sOf(T.fr0.Q) > oraLit(CASE.tear) && fwd > 0 && up > 1 && onFlap && cd
      && G.dot(cd, T.fr.en) > 0 && -G.dot(cd, T.fr.eu) > 0 && onScreen(ctx, '5-1', '玻璃體把瓣往前拉traction') && onScreen(ctx, '5-1', '106 個裂孔') && onScreen(ctx, '5-1', '前緣全都有玻璃體牽拉'),
      `5-1 flap: free edge ${f2(fwd)} mm in front of the hinge, lifted ${f2(up)} mm; gel on it; the drawn pull points into the cavity (${f2(cd && G.dot(cd, T.fr.en))}) and forward (${f2(cd && -G.dot(cd, T.fr.eu))})`); }
  // M27 5-1 line 3: shaving round the 11 o'clock tear in VP.SHAVE_STEPS steps (forward only): before, the strand pulls the flap and the gel covers the vitreous
  // base; at the last step the strand is gone (the pull released) and only a thin layer is left on the base; the cutter works at the tear (within 2.5 mm of its
  // hinge, in the cavity, not in the retina or the flap) and the wide view of the same state shows the tear and the cutter at 11 o'clock
  { const n = VP.SHAVE_STEPS, ks = range(n + 1).map(i => VP.shaveStep(i / n).vit.shave), fwd = ks.every((v, i) => !i || v > ks[i - 1]) && ks[0] === 0 && ks[n] === 1;
    const pull = st => { const Gm = P.geom(st), f = P.makeCtx(Gm), T = Gm.tear, fe = P.flapPt(T, T.L, 0), dir = G.unit(add(T.fr.en, mul(T.fr.eu, -0.35))); return f.gel(f.at(add(fe, mul(dir, 0.3)))) < 0; };
    const thick = st => { const f = P.makeCtx(P.geom(st)); return gelOn(f, CASE.tear, oraLit(CASE.tear))[1]; }, s0 = VP.shaveStep(0), s1 = VP.shaveStep(1), t0 = thick(s0), t1 = thick(s1);
    const Gm = P.geom(s1), f = P.makeCtx(Gm), I = P.instGeom(Gm, s1.inst[0]), c = f.at(I.tip), dH = G.len(sub(I.tip, Gm.tear.fr.Q));
    const M = VP.wide(VP.on11(s1), W_, H_, VP.WIN.wide3, 'm27').M, ht = M.tear && clockSurg([M.tear[0] - M.pole[0], M.tear[1] - M.pole[1]]), hi = M.inst0 && clockSurg([M.inst0[0] - M.pole[0], M.inst0[1] - M.pole[1]]);
    ok('M27', line(ctx, '5-1', 3).includes('尤其 11 點裂孔周圍的玻璃體清乾淨') && fwd && pull(s0) && !pull(s1) && t0 >= 2 && t1 <= 0.6 && dH <= 2.5 && f.cavity(c) < 0 && !(f.retina(c) < 0) && !(f.flap(c) < 0)
      && s1.inst[0].port === 'sn' && near_h(ht, CASE.tear, 0.15) && near_h(hi, CASE.tear, 0.5) && onScreen(ctx, '5-1', '拉力解除：瓣不再被拉released'),
      `5-1 shaving ${ks.join(' → ')}: strand on the flap ${pull(s0) ? 'pulls' : 'missing'} → ${pull(s1) ? 'still pulls' : 'released'}; gel on the base at the ora ${f2(t0)} → ${f2(t1)} mm; cutter ${f2(dH)} mm from the hinge; wide view: tear at ${ht && f2(ht)}, cutter at ${hi && f2(hi)} o'clock`); }
  // M28 5-1 line 4 (and every chapter 5 state): instruments only through their trocars (vitrector superonasal, light pipe superotemporal), from the cannula to the
  // tip in the cavity, and no shaft touches the phakic lens; reaching the far periphery (示意) the shaft passes behind the lens much closer than when working at 11
  // (why clearing the periphery is harder with the lens in), in the drawn 10:30 section; the lens-touch numbers on screen (Jackson 2013)
  { const states = [...range(VP.SHAVE_STEPS + 1).map(i => VP.shaveStep(i / VP.SHAVE_STEPS)), VP.ST.far5, ...range(VP.DEP_STEPS + 1).map(i => VP.depStep(VP.ST.dep52, i / VP.DEP_STEPS))];
    const want = { vitrector: 'superonasal', light: 'superotemporal' }, bad = []; let minGap = 9;
    for (const st of states) { const Gm = P.geom(st), f = P.makeCtx(Gm), T3 = P.troc(Gm);
      for (const ins of st.inst) { const I = P.instGeom(Gm, ins), port = T3.find(t => t.id === ins.port), name = port && !port.inf ? sideName(port.h).en : 'infusion or none', miss = P.segDist(I.port.pivot, I.tip, I.out); let out = 0, lm = 9;
        for (let t = 0; t <= 1; t += 0.01) { const cc = f.at(add(I.tip, mul(sub(I.port.tip, I.tip), t))); if (!(f.interior(cc) < 0) || f.lens(cc) < 0 || f.iris(cc) < 0 || f.retina(cc) < 0) out++; }
        for (let t = 0; t <= 1; t += 0.0025) lm = Math.min(lm, f.lens(f.at(add(I.tip, mul(sub(I.port.pivot, I.tip), t)))) - P.N.shaft / 2);
        minGap = Math.min(minGap, lm); if (name !== want[ins.kind] || miss > 0.02 || out || lm < 0.25) bad.push(`${ins.kind} via ${name} (miss ${f2(miss)}, ${out} out, lens ${f2(lm)})`); } }
    const far = VP.lensNear(VP.ST.far5).gap, here = VP.lensNear(VP.shaveStep(0)).gap, S = VP.sec(VP.ST.far5, W_, H_, VP.WIN.sec, 'm28', { h: VP.SEC4_H, tw: VP.WIN.secT, noTissue: true }), pl = S.r.plane, nrm = G.unit(G.cross(pl.U, pl.V));
    const I = P.instGeom(P.geom(VP.ST.far5), VP.ST.far5.inst[0]), inPl = Math.abs(G.dot(sub(I.tip, pl.O), nrm)) < 0.05 && Math.abs(G.dot(sub(I.port.pivot, pl.O), nrm)) < 0.05;
    ok('M28', line(ctx, '5-1', 4).includes('有水晶體的眼，清周邊比較難') && line(ctx, '5-1', 4).includes('1.2 到 1.6%') && !bad.length && far >= 0.25 && far < here / 3 && inPl
      && onScreen(ctx, '5-1', '碰到水晶體：約 1.2–1.6%') && onScreen(ctx, '5-1', '示意：清對側的周邊') && onScreen(ctx, '5-1', '器械從水晶體後方經過'),
      `ch. 5: ${states.length} drawn states, instruments through their trocars, in the cavity, shafts ≥ ${f2(minGap)} mm from the lens${bad.length ? '; bad: ' + bad.slice(0, 3).join('; ') : ''}; far reach ${f2(far)} mm behind the lens vs ${f2(here)} mm at 11, its whole shaft in the 10:30 section`); }
  // M29 5-2 lines 1, 3: the assistant presses at 11 (chapter 3's place): the same press in the section and the wide view at every step; the dent in the 11 o'clock
  // plane, the mound at 11 o'clock and pushed toward the centre of the view; the cutter stays put and the pressed retina comes ≥ 1 mm closer to its port
  // without touching it (the flap neither)
  { const n = VP.DEP_STEPS, same = range(n + 1).every(i => JSON.stringify(VP.depStep(VP.ST.dep52, i / n).dep) === JSON.stringify(VP.depStep(VP.ST.dep52On, i / n).dep)), dp = VP.ST.dep52.dep;
    const S = VP.sec(VP.ST.dep52, W_, H_, VP.WIN.depZ, 'm29', { tw: VP.WIN.depZT, noTissue: true }).M, M = wideM(VP.ST.dep52On), hw = M.dep && clockSurg([M.dep[0] - M.pole[0], M.dep[1] - M.pole[1]]);
    const m = wideMap(VP.ST.dep52On), G0 = P.geom(VP.depStep(VP.ST.dep52, 0)), G1 = P.geom(VP.ST.dep52), b0 = m.beta(G0.ret(dp.h, dp.s, 1)), b1 = m.beta(G1.ret(dp.h, dp.s, 1));
    const tips = range(n + 1).map(i => JSON.stringify(P.instGeom(P.geom(VP.depStep(VP.ST.dep52, i / n)), VP.ST.dep52.inst[0]).tip)), still = tips.every(t => t === tips[0]);
    const I = P.instGeom(G1, VP.ST.dep52.inst[0]), dist = Gm => G.len(sub(I.portAt, Gm.ret(dp.h, dp.s, 1))), closer = dist(G0) - dist(G1);
    let clear = 9; for (let i = 0; i <= n; i++) { const Gi = P.geom(VP.depStep(VP.ST.dep52, i / n)); for (let hh = dp.h - 0.4; hh <= dp.h + 0.4; hh += 0.1) for (let s = dp.s - 2; s <= dp.s + 2; s += 0.2) clear = Math.min(clear, P.segDist(Gi.ret(hh, s, 1), I.tip, I.out) - P.N.shaft / 2);
      clear = Math.min(clear, P.segDist(P.flapPt(Gi.tear, Gi.tear.L, 0), I.tip, I.out) - P.N.shaft / 2); }
    ok('M29', line(ctx, '5-2', 3).includes('周邊的視網膜被推進視野') && line(ctx, '5-2', 3).includes('在畫面上成為一個隆起') && dp.h === CASE.tear && VP.DEP_H === CASE.tear && same && S.dep_off < 0.02 && S.dep[0] > 0
      && hw && near_h(hw, CASE.tear, 0.1) && b1 < b0 && b1 < m.bmax && still && closer >= 1 && clear > 0.1
      && onScreen(ctx, '5-2', '11 點的隆起mound') && onScreen(ctx, '5-2', '周邊被推進視野') && onScreen(ctx, '5-2', '周邊被推向切割頭') && onScreen(ctx, '5-2', '壓之前的視網膜before'),
      `5-2 press at ${dp.h} o'clock, same in both views (${n + 1} steps): dent in the plane (${f2(S.dep_off)} mm off), mound at ${hw && f2(hw)} o'clock, ${f2(b0 / D2R_)}° → ${f2(b1 / D2R_)}° from the view axis; cutter fixed, the retina ${f2(closer)} mm closer to its port, never nearer than ${f2(clear)} mm to the shaft`); }
  // M30 5-2 lines 2, 4, 5: where, how deep, how long — the surgeon's call, no common method (示意 on screen); the iatrogenic break numbers (Neffendorf 2017) on screen;
  // the call-out when a new break or bleeding is seen
  { ok('M30', line(ctx, '5-2', 2).includes('都聽主刀的口令') && line(ctx, '5-2', 2).includes('文獻沒有統一的做法') && onScreen(ctx, '5-2', '壓哪裡、多深、多久：聽口令（示意）') && onScreen(ctx, '5-2', '文獻沒有統一的做法')
      && line(ctx, '5-2', 4).includes('23G 約 1.9%，20G 是 5.8%') && ['23G', '20G', '1.9%', '5.8%'].every(t => onScreen(ctx, '5-2', t))
      && line(ctx, '5-2', 5).includes('看到新的裂孔或出血，說出來') && onScreen(ctx, '5-2', '看到新的裂孔或出血') && onScreen(ctx, '5-2', '→ 說出來，讓主刀標記'),
      '5-2: the press labelled 示意 (the surgeon\'s call, no common method), the break numbers by gauge on screen, the call-out to say it'); }
  // chapter 6. The patient lies supine: gravity toward the posterior pole (SUP_G, written here, not taken from the model). States from VP (pfclStep,
  // airStep, outStep, ST.pre61 / done62 / bead62; VP.w6 for the wide view), the same functions draw.js calls for both panels of a frame. Heavy
  // measurements on the drawn fields are memoised by state (the model itself is never mutated by this file's selftest).
  const SUP_G = [0, 0, -1], LIT6 = { fovea: 1.5, macula: 5.5 }, upS = p => -G.dot(p, SUP_G), keyOf = st => JSON.stringify(st);   // fovea and macula 1.5 and 5.5 mm across (Köksaldı 2025, posterior/CARD.md)
  const ctx6 = st => memo('f' + keyOf(st), () => P.makeCtx(P.geom(st)));
  // the highest and lowest points of the vitreous cavity (supine), at least 0.3 mm inside it, from the model's cavity sample points
  const ext6 = st => memo('e' + keyOf(st), () => { const f = ctx6(st), V = P.voxels(); let lo = null, hi = null, a = 1e9, b = -1e9;
    for (let i = 0; i < V.n; i += 3) { const p = [V.xs[3 * i], V.xs[3 * i + 1], V.xs[3 * i + 2]], u = upS(p); if (u > a && u < b) continue; if (f.cavity(f.at(p)) > -0.3) continue; if (u < a) { a = u; lo = p; } if (u > b) { b = u; hi = p; } }
    return { lo, hi }; });
  // the drawn surface of a fluid in the 11–5 section at x (mm along the section): scanning from the front (top) backward, the first change in or out of
  // that fluid well inside the cavity (as posterior/check.js E1). Returns screen y (down = posterior) or null
  const pl6 = G.planes.meridian(VP.SEC_H), inn6 = (f, name, p) => f[name](f.at(p)) < 0;
  const surf6 = (st, name, x) => memo('s' + name + x + keyOf(st), () => { const f = ctx6(st); let last = null;
    for (let y = -12; y <= 12; y += 0.01) { const p = G.onPlane(pl6, x, y), inn = inn6(f, name, p); if (last !== null && inn !== last && f.cavity(f.at(p)) < -0.2) return y; last = inn; } return null; });
  const zOf = y => G.onPlane(pl6, 0, y)[2];   // height (supine: anterior) of a screen y of the section
  const gravDown = Math.abs(G.dot(pl6.U, SUP_G)) < 1e-9 && G.dot(pl6.V, SUP_G) > 0.999;   // the section's screen down is gravity (supine): a horizontal surface is perpendicular to it
  // M31 6-1 line 1: PFCL from the posterior pole sinks to the lowest place (supine: the posterior pole), its surface a plane perpendicular to gravity (horizontal
  // in the 11–5 section, whose screen down is gravity) rising step by step; the needle's tip (示意) in the PFCL at the pole at every step
  { const n = VP.PFCL_STEPS, rows = []; let okAll = true, prev = 1e9;
    for (let i = 1; i <= n; i++) { const st = VP.pfclStep(i / n), f = ctx6(st), { lo, hi } = ext6(st), ys = [-4, 0, 4].map(x => surf6(st, 'pfcl', x)), tip = st.inst[0].tip;
      const flat = ys.every(y => y !== null && near(y, ys[0], 0.06)), rise = ys[1] !== null && ys[1] < prev - 0.3; prev = ys[1] ?? prev;
      if (!(inn6(f, 'pfcl', lo) && !inn6(f, 'pfcl', hi) && flat && rise && inn6(f, 'pfcl', tip) && st.inst[0].kind === 'needle')) okAll = false; rows.push(ys[1] === null ? 'none' : f2(zOf(ys[1]))); }
    ok('M31', line(ctx, '6-1', 1).includes('PFCL 從後極打進去') && line(ctx, '6-1', 1).includes('從後往前把視網膜壓平') && gravDown && okAll
      && onScreen(ctx, '6-1', '仰躺：重力朝後極gravity') && onScreen(ctx, '6-1', '液面：垂直重力interface') && onScreen(ctx, '6-1', 'PFCL 注射針（示意）needle') && onScreen(ctx, '6-1', 'PFCL 的量為示意'),
      `6-1 PFCL (supine, gravity down the section): at the lowest point of the cavity, not the highest, the needle tip in it; its surface horizontal at ±4 mm and rising ${rows.join(' → ')} mm (height)`); }
  // M32 6-1 line 1: below the drawn PFCL surface the retina lies flat (height 0) and above it the detachment stays as it was, and the flat part grows from the
  // pole forward with the steps (RPE points on a 0.5 h × 0.5 mm grid behind the ora)
  { const n = VP.PFCL_STEPS, G0 = P.geom(VP.ST.pre61); let okAll = true, prevF = -1, last = '';
    for (let i = 1; i <= n; i++) { const st = VP.pfclStep(i / n), Gm = P.geom(st), y = surf6(st, 'pfcl', 0); if (y === null) { okAll = false; continue; } const zS = zOf(y); let nF = 0, mF = 0, nD = 0, bD = 0;
      for (let h = 0.5; h <= 12; h += 0.5) for (let s = oraLit(h) + 0.6; s <= P.S_POLE - 0.4; s += 0.5) { const u = upS(P.rpeAt(h, s)), H = Gm.H(s, h), H0 = G0.H(s, h);
        if (u < zS - 0.25) { nF++; mF = Math.max(mF, H); } else if (u > zS + 0.85 && H0 > 0.05) { nD++; if (Math.abs(H - H0) > 1e-6) bD++; } }
      if (!(mF < 1e-6 && bD === 0 && nF > prevF && (i < n || (nF > 50 && nD > 10)))) okAll = false; prevF = nF; last = `${nF} points below flat (max ${f2(mF)} mm), ${nD} detached points above unchanged (${bD} changed)`; }
    ok('M32', okAll && onScreen(ctx, '6-1', '液面以下：視網膜壓平flattened'), `6-1 below the PFCL surface flat, above it still detached, growing step by step; last step: ${last}`); }
  // M33 6-1 line 2: at every step the PFCL surface stays below the 11 o'clock tear — every point of the hole's edge and of the flap above the surface and its
  // flattening band, so the retina round the tear stays lifted; the drawn fluid runs forward under the retina (in the subretinal fluid, nearer the ora at each
  // point), out through the hole (inside the U) into the cavity above the PFCL; on the 5 o'clock side it runs forward under the retina too, and the
  // superotemporal path drawn in the wide view runs under the retina
  { const n = VP.PFCL_STEPS; let okAll = true, minGap = 9;
    for (let i = 1; i <= n; i++) { const st = VP.pfclStep(i / n), Gm = P.geom(st), T = Gm.tear, y = surf6(st, 'pfcl', 0); if (y === null) { okAll = false; continue; } const zS = zOf(y);
      const U = P.uOutline(T.w, T.L), low = Math.min(...U.map(q => upS(P.onRetina(Gm, T.fr, q[0], q[1], 0).p)), ...U.map(q => upS(P.flapPt(T, q[0], q[1]))));
      minGap = Math.min(minGap, low - zS); if (!(low > zS + 0.85)) okAll = false; }
    const st = VP.pfclStep(1), Gm = P.geom(st), f = ctx6(st), T = Gm.tear, F = VP.flow61(st), zS = zOf(surf6(st, 'pfcl', 0) ?? 0), pre = F.tear.slice(0, -2);
    const fwd = pts => pts.every((p, i) => !i || sOf(p) < sOf(pts[i - 1])), inSrf = pts => pts.every(p => inn6(f, 'srf', p));
    const d = sub(F.hole, T.fr.Q), inU = P.sdU(G.dot(d, T.fr.eu), G.dot(d, T.fr.ec), T.w, T.L) < 0, out = inn6(f, 'cavity', F.out) && !inn6(f, 'pfcl', F.out) && upS(F.out) > zS;
    ok('M33', line(ctx, '6-1', 2).includes('從原本 11 點的裂孔排出去') && okAll && inSrf(pre) && fwd(pre) && inU && out && inSrf(F.five) && fwd(F.five) && inSrf(F.st) && Gm.H(T.sh + T.L, T.h) > 0.3
      && onScreen(ctx, '6-1', '從 11 點裂孔排出drainage') && onScreen(ctx, '6-1', '液面低於 11 點裂孔') && onScreen(ctx, '6-1', '視網膜下液往前推SRF'),
      `6-1 the tear and its flap ≥ ${f2(minGap)} mm above the PFCL surface at every step; the drawn fluid forward under the retina, through the hole, out into the cavity above the PFCL`); }
  // M34 6-1 lines 3–4: a drainage retinotomy instead (位置示意): on detached retina behind the equator, outside the macula (5.5 mm across), in the 11–5 section
  // on the 5 o'clock side and inside the wide view at the same 3D point; the drawn fluid runs under the retina to it and out into the cavity; the surgeon's choice
  { const st = VP.ST.pre61, Gm = P.geom(st), f = ctx6(st), R6 = VP.rtomy(st), m = R6.mid, hR = G.clockOf(m[0], m[1]), sR = sOf(m), off = Math.abs(G.dot(m, G.unit(G.cross(pl6.U, pl6.V)))), xs = G.toPlane(pl6, m)[0];
    const Wv = VP.wide(VP.w6(st), W_, H_, VP.WIN.wide3, 'm34'), q = Wv.r.map.proj(R6.top), inF = Math.hypot(...q) < Wv.M.R, path = R6.path.slice(0, -2).every(p => inn6(f, 'srf', p)) && inn6(f, 'cavity', R6.path[R6.path.length - 1]);
    ok('M34', line(ctx, '6-1', 3).includes('另開 drainage retinotomy 排液') && line(ctx, '6-1', 4).includes('依主刀決定') && Gm.H(sR, hR) > 0.1 && sR > P.S_EQ && Math.hypot(...P.chartHS(hR, sR)) > LIT6.macula / 2 + 1
      && off < 0.01 && xs < 0 && inF && path && onScreen(ctx, '6-1', 'drainage retinotomy（位置示意）') && onScreen(ctx, '6-1', '另一種做法（示意）') && onScreen(ctx, '6-1', '用哪一種：依主刀決定'),
      `6-1 drainage retinotomy (位置示意) at ${f2(hR)} o'clock ${f2(sR)} mm from the limbus on retina detached ${f2(Gm.H(sR, hR))} mm, ${f2(off)} mm off the 11–5 section (5 o'clock side), in the wide field; fluid out through it`); }
  // M35 6-2 line 0: air from the infusion rises to the highest place (supine: the front), its surface a plane perpendicular to gravity going down toward the pole
  // step by step to the PFCL surface (never below it); the 4:30 infusion's tip in the air from the first step; the PFCL stays at the bottom
  { const n = VP.AIR_STEPS; let okAll = true, prev = -1e9; const rows = [];
    for (let i = 1; i <= n; i++) { const st = VP.airStep(i / n), Gm = P.geom(st), f = ctx6(st), { lo, hi } = ext6(st), it = P.troc(Gm).find(t => t.inf), ys = [-6, 6].map(x => surf6(st, 'gas', x)), yp = surf6(st, 'pfcl', 0);
      const flat = ys.every(y => y !== null && near(y, ys[0], 0.06)), down = ys[0] !== null && ys[0] > prev + 0.3; prev = ys[0] ?? prev;
      if (!(inn6(f, 'gas', hi) && !inn6(f, 'gas', lo) && inn6(f, 'pfcl', lo) && it && inn6(f, 'gas', it.tip) && sideName(it.h).en === LIT2.ports.inf && flat && down && yp !== null && ys[0] <= yp + 0.02)) okAll = false; rows.push(ys[0] === null ? 'none' : f2(zOf(ys[0]))); }
    ok('M35', line(ctx, '6-2', 0).includes('空氣從 infusion 進來，浮在上面') && line(ctx, '6-2', 0).includes('主刀在後面把液體吸掉') && gravDown && okAll
      && onScreen(ctx, '6-2', 'infusion4 點半，在切面外') && onScreen(ctx, '6-2', '空氣從 infusion 進來4 點半') && onScreen(ctx, '6-2', '氣液界面：垂直重力往後極下降') && onScreen(ctx, '6-2', '順序依主刀（示意）'),
      `6-2 air (supine): at the highest point, not the lowest (PFCL there), the inferotemporal infusion tip in it; its surface horizontal and going down ${rows.join(' → ')} mm to the PFCL`); }
  // M36 6-2 line 1: then the PFCL goes (step by step) and the exchange ends with no PFCL left and the retina flat everywhere (0.25 h × 0.25 mm grid behind the ora):
  // chapter 7 lasers attached retina; the detachment left above the PFCL came down while the air went in
  { const n = VP.OUT_STEPS, pf = range(n + 1).map(i => { const st = VP.outStep(i / n), y = surf6(st, 'pfcl', 0); return y === null ? -1e9 : zOf(y); }), fin = VP.outStep(1), Gm = P.geom(fin), f = ctx6(fin), { lo } = ext6(fin);
    let mx = 0; for (let h = 0.25; h <= 12; h += 0.25) for (let s = oraLit(h); s <= P.S_POLE - 0.1; s += 0.25) mx = Math.max(mx, Gm.H(s, h));
    const down = pf.every((v, i) => !i || v < pf[i - 1] - 0.3 || (v === -1e9 && i === n)) && pf[n] === -1e9 && !inn6(f, 'pfcl', lo);
    const hs = range(VP.AIR_STEPS + 1).map(i => { const g = P.geom(VP.airStep(i / VP.AIR_STEPS)); let m = 0; for (let s = 8; s < 14; s += 0.25) m = Math.max(m, g.H(s, CASE.tear)); return m; }), comeDown = hs.every((v, i) => !i || v < hs[i - 1]) && hs[hs.length - 1] === 0;
    ok('M36', line(ctx, '6-2', 1).includes('PFCL 也要在這時吸乾淨') && down && mx === 0 && comeDown && onScreen(ctx, '6-2', 'PFCL 也要吸乾淨') && onScreen(ctx, '6-2', '交換結束：視網膜全部貼平'),
      `6-2 PFCL surface ${pf.map(v => v === -1e9 ? 'gone' : f2(v)).join(' → ')}; at the end no PFCL at the bottom and the retina flat everywhere (max height ${f2(mx)} mm); round the tear ${hs.map(f2).join(' → ')} mm while the air went in`); }
  // M37 6-2 lines 2–4: the retained bead lies under the retina (in the model's PFCL-under-the-retina field, not in the subretinal fluid, the retina or the cavity),
  // in the 11–5 section on the 5 o'clock side; the wide view marks it where the section's 3D point projects; it is outside the fovea (1.5 mm across), so the
  // fovea is marked separately for 「在 fovea 下的，作者才建議處理」; the numbers and the call-out on screen
  { const st = VP.ST.bead62, Gm = P.geom(st), f = ctx6(st), S = VP.sec(st, W_, H_, VP.WIN.fov, 'm37', { tw: VP.WIN.fovT, noTissue: true }).M, c = S.bead_3;
    const under = c && inn6(f, 'bead', c) && !inn6(f, 'srf', c) && !inn6(f, 'retina', c) && !inn6(f, 'cavity', c);
    const Wv = VP.wide(VP.w6(st), W_, H_, VP.WIN.w62z, 'm37w'), q = c && Wv.r.map.proj(c), wa = Wv.M.bead, same = q && wa ? Math.hypot(q[0] - wa[0], q[1] - wa[1]) : 9;
    const hb = c ? G.clockOf(c[0], c[1]) : 0, sb = c ? sOf(c) : 0; let se = sb; while (se < P.S_POLE && inn6(f, 'bead', P.P3(hb, se, P.Tp(se) + P.chorAt(se) + 0.03))) se += 0.005;
    const edge = Math.hypot(...P.chartHS(hb, se));
    ok('M37', line(ctx, '6-2', 2).includes('PFCL 可能殘留在視網膜下') && line(ctx, '6-2', 2).includes('4.5% 到 10.3%') && line(ctx, '6-2', 3).includes('在 fovea 下的，作者才建議處理') && line(ctx, '6-2', 4).includes('提出來讓主刀確認')
      && under && S.bead_off < 0.02 && S.bead[0] < 0 && same < 0.2 && edge > LIT6.fovea / 2 && onScreen(ctx, '6-2', '殘留的 PFCL：在視網膜下retained PFCL') && onScreen(ctx, '6-2', '可疑的小珠子視網膜下')
      && onScreen(ctx, '6-2', '約 4.5%–10.3%') && onScreen(ctx, '6-2', '在 fovea 下的，作者才建議處理') && onScreen(ctx, '6-2', '外層視網膜消失（示意）outer retina') && onScreen(ctx, '6-2', '小珠子的位置與大小為示意')
      && onScreen(ctx, '6-2', '看到視網膜下可疑的小珠子') && onScreen(ctx, '6-2', '→ 提出來讓主刀確認'),
      `6-2 bead under the retina (${under ? 'PFCL field' : 'not under it'}), ${S.bead_off != null ? f2(S.bead_off) : '?'} mm off the 11–5 section on the 5 o'clock side; the wide view's mark ${f2(same)} mm from where the section's point projects; its edge ${f2(edge)} mm from the foveola (fovea radius ${LIT6.fovea / 2})`); }
  // M38 chapter 6: instruments only through the case's trocars in every drawn state (the needle in the superonasal port, the light pipe in the superotemporal
  // port; the shaft through its pivot, cannula → tip in the cavity, ≥ 0.5 mm from the lens), and both panels of a frame draw the same state (the wide view
  // adds only the surgeon's seat, the inverter and the turn toward 11); the section is through the 11 o'clock tear, which is inside the wide field
  { const states = [VP.ST.pre61, ...range(VP.PFCL_STEPS + 1).map(i => VP.pfclStep(i / VP.PFCL_STEPS)), ...range(VP.AIR_STEPS + 1).map(i => VP.airStep(i / VP.AIR_STEPS)), ...range(VP.OUT_STEPS + 1).map(i => VP.outStep(i / VP.OUT_STEPS)), VP.ST.done62, VP.ST.bead62];
    const want = { needle: 'superonasal', light: 'superotemporal' }, bad = [], strip = o => { const r = Object.assign({}, o); delete r.surgeon; delete r.inverter; delete r.look; return keyOf(r); }; let lensMin = 9, n = 0;
    for (const st of states) { const Gm = P.geom(st), f = ctx6(st), T3 = P.troc(Gm), W = VP.w6(st);
      if (strip(W) !== strip(st) || W.inverter !== true || W.surgeon !== 12 || !W.look || W.look.h !== CASE.tear) bad.push('wide state differs');
      for (const ins of st.inst || []) { const I = P.instGeom(Gm, ins), port = T3.find(t => t.id === ins.port), name = port && !port.inf ? sideName(port.h).en : 'infusion or none', miss = P.segDist(I.port.pivot, I.tip, I.out); let out = 0, lm = 9; n++;
        for (let t = 0; t <= 1; t += 0.02) { const cc = f.at(add(I.tip, mul(sub(I.port.tip, I.tip), t))); if (!(f.interior(cc) < 0) || f.lens(cc) < 0 || f.iris(cc) < 0 || f.retina(cc) < 0) out++; }
        for (let t = 0; t <= 1; t += 0.01) lm = Math.min(lm, f.lens(f.at(add(I.tip, mul(sub(I.port.pivot, I.tip), t)))));
        lensMin = Math.min(lensMin, lm); if (name !== want[ins.kind] || miss > 0.02 || out || lm < 0.5) bad.push(`${ins.kind} via ${name} (miss ${f2(miss)}, ${out} out, lens ${f2(lm)})`); } }
    const M = VP.wide(VP.w6(VP.ST.pre61), W_, H_, VP.WIN.wide3, 'm38').M, ht = M.tear && clockSurg([M.tear[0] - M.pole[0], M.tear[1] - M.pole[1]]);
    ok('M38', VP.SEC_H === CASE.tear && !bad.length && n > 30 && M.tear && Math.hypot(...M.tear) < M.R && near_h(ht, CASE.tear, 0.15) && onScreen(ctx, '6-1', '光導管light pipe（1 點半）') && onScreen(ctx, '6-1', 'PFCL 注射針（示意）needle（10 點半）'),
      `ch. 6: ${n} instruments in ${states.length} drawn states through their trocars (needle superonasal, light pipe superotemporal), in the cavity, ≥ ${f2(lensMin)} mm from the lens; the wide view draws the same states; the tear at ${ht && f2(ht)} o'clock inside its field${bad.length ? '; bad: ' + [...new Set(bad)].slice(0, 3).join('; ') : ''}`); }
  return R;
}
const near_h = (a, b, t = 0.1) => a != null && b != null && Math.abs(hdiff(a, b)) <= t;
const MEMO = new Map(), memo = (k, fn) => { if (!MEMO.has(k)) MEMO.set(k, fn()); return MEMO.get(k); };

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
      ['inverter off drawn only mirrored left–right', c => { c.VP = vpWith({ wide: (st, ...a) => { const r = VP0.wide(st, ...a); if (st.inverter !== false) return r; const M = {};
        for (const [k, v] of Object.entries(r.M)) M[k] = Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' ? [v[0], -v[1]] : v; return Object.assign({}, r, { M }); } }); }, 'M16'],
      ['real image drawn on the same side as the retinal point', c => { c.VP = vpWith({ optics: (...a) => { const o = VP0.optics(...a); for (const h of Object.keys(o.I)) { o.I[h] = [-o.I[h][0], o.I[h][1]]; o.rays[h].forEach(r => { r[r.length - 1] = o.I[h]; }); } return o; } }); }, 'M16'],
      ['wide view with the surgeon at 6', c => { c.VP = stWith('view3', { surgeon: 6 }); }, 'M17'],
      ['wide view with the surgeon at 1 (11 o\'clock 60° off straight down)', c => { c.VP = stWith('view3', { surgeon: 1 }); }, 'M18'],
      ['mound at 10 o\'clock in the wide view, dent at 11 in the section', c => { c.VP = stWith('depOn', { dep: Object.assign({}, VP0.ST.depOn.dep, { h: 10 }) }); }, 'M19'],
      ['「inverter 關」 demonstration drawn with the inverter on', c => { c.VP = stWith('depOff', { inverter: true }); }, 'M20'],
      ['vitrector through the infusion port (4-1 core)', c => { c.VP = vpWith({ coreStep: (k, ta) => { const s = VP0.coreStep(k, ta); return Object.assign({}, s, { inst: [Object.assign({}, s.inst[0], { port: 'it' }), s.inst[1]] }); } }); }, 'M21'],
      ['light pipe tip in the lens (4-1 PVD)', c => { c.VP = vpWith({ pvdStep: k => { const s = VP0.pvdStep(k); return Object.assign({}, s, { inst: [s.inst[0], Object.assign({}, s.inst[1], { tip: [0, 0, 7] })] }); } }); }, 'M21'],
      ['PVD stops half way (4-1 line 3)', c => { c.VP = vpWith({ pvdStep: k => VP0.pvdStep(k * 0.5) }); }, 'M22'],
      ['sucked retina drawn 1 h off in the wide view (4-2)', c => { c.VP = vpWith({ wide: (st, ...a) => VP0.wide(st.suck ? Object.assign({}, st, { suck: Object.assign({}, st.suck, { h: st.suck.h + 1 }) }) : st, ...a) }); }, 'M23'],
      ['pull grows with the cut rate (4-2)', c => { c.VP = vpWith({ traction: (v, d, k) => VP0.traction(v, d, 1 - k) }); }, 'M24'],
      ['tear 2 mm behind the vitreous base (5-1)', c => { c.VP = vpWith({ shaveStep: k => Object.assign({}, VP0.shaveStep(k), { tear: { h: 11, s: POSTERIOR.vbPostAt(11, 1) + 2 } }) }); }, 'M25'],
      ['flap lying back, free edge behind its hinge (5-1)', c => { c.VP = vpWith({ shaveStep: k => Object.assign({}, VP0.shaveStep(k), { tear: { h: 11, flap: 40 } }) }); }, 'M26'],
      ['shaving stops half way (5-1)', c => { c.VP = vpWith({ shaveStep: k => VP0.shaveStep(k * 0.5) }); }, 'M27'],
      ['far reach through the lens (5-1 line 4)', c => { c.VP = stWith('far5', { inst: [{ kind: 'vitrector', port: 'sn', tip: { h: 4.5, s: 8.0, e: 1.0 } }, VP0.ST.far5.inst[1]] }); }, 'M28'],
      ['cutter moves with the pressed retina (5-2)', c => { c.VP = stWith('dep52', { inst: [{ kind: 'vitrector', port: 'sn', tip: VP0.DEP_TIP }, VP0.ST.dep52.inst[1]] }); }, 'M29'],
      ['mound at 10 o\'clock in the wide view, dent at 11 in the section (5-2)', c => { c.VP = stWith('dep52On', { dep: Object.assign({}, VP0.ST.dep52On.dep, { h: 10 }) }); }, 'M29'],
      ['press drawn without 示意 (5-2)', c => { c.screen['5-2'] = c.screen['5-2'].map(t => t.replace('（示意）', '')); }, 'M30'],
      ['PFCL floating at the front (6-1, gravity of a face-down patient)', c => { c.VP = vpWith({ pfclStep: k => Object.assign({}, VP0.pfclStep(k), { head: { pose: 'facedown' } }) }); }, 'M31'],
      ['retina flat everywhere at once, not from behind forward (6-1)', c => { c.VP = vpWith({ pfclStep: k => Object.assign({}, VP0.pfclStep(k), { rd: { amt: 0 } }) }); }, 'M32'],
      ['PFCL filled to 70 %, over the 11 o\'clock tear (6-1)', c => { c.VP = vpWith({ pfclStep: k => Object.assign({}, VP0.pfclStep(k), { pfcl: 0.7 * Math.round(k * VP0.PFCL_STEPS) / VP0.PFCL_STEPS }) }); }, 'M33'],
      ['drainage retinotomy on attached retina at 9 o\'clock (6-1)', c => { c.VP = vpWith({ rtomy: st => VP0.rtomy(st, { h: 9, s: 18 }) }); }, 'M34'],
      ['air sinking to the back (6-2, gravity of a face-down patient)', c => { c.VP = vpWith({ airStep: k => Object.assign({}, VP0.airStep(k), { head: { pose: 'facedown' } }) }); }, 'M35'],
      ['PFCL left in the eye at the end of the exchange (6-2)', c => { c.VP = vpWith({ outStep: m => VP0.outStep(m * 0.75) }); }, 'M36'],
      ['bead drawn half an hour off in the wide view (6-2)', c => { c.VP = vpWith({ w6: st => VP0.w6(st.bead ? Object.assign({}, st, { bead: Object.assign({}, st.bead, { h: st.bead.h + 0.5 }) }) : st) }); }, 'M37'],
      ['PFCL needle through the infusion port (6-1)', c => { c.VP = vpWith({ pfclStep: k => { const s = VP0.pfclStep(k); return Object.assign({}, s, { inst: [Object.assign({}, s.inst[0], { port: 'it' }), s.inst[1]] }); } }); }, 'M38'],
    ];
    let bad = 0;
    for (const [name, mut, target] of MUT) { const c = baseCtx(screen); mut(c); const fails = runAll(c).filter(r => !r[0]), n = fails.length, hit = !target || fails.some(r => r[1].startsWith(target + ' '));
      console.log(`${n && hit ? 'PASS' : 'FAIL'} selftest: breaking 「${name}」 → ${n} check(s) fail${target ? (hit ? `, including ${target}` : `, not ${target}`) : ''}`); if (!n || !hit) bad++; }
    if (bad) { console.log(`${bad} mutation(s) not caught`); fail += bad; }
  }
  console.log(fail ? `${fail} check(s) failed` : 'all video checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
