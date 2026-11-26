// Video-level checks for the scleral-tunnel cataract video (run by videos/tools/check-all.js; or: node check.js).
// 2026-11-26: only the print sheets exist (spec.md 進度). LEDGER = the planned chapters' numbers with their sources (the print sheets'
// numcheck reads it as text); the model checks below test the case geometry the sheets draw against the sources. The narration checks
// (screen text ↔ ledger) are added when the narration is written.
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const path = require('path');
const MD = path.join(__dirname, '..', '..', 'models', 'globe');
const G = require(path.join(MD, 'globe.js'));
const K = require(path.join(MD, 'cataract.js'))(G);
const { REFS } = require('./anim/segments.js');
const { CASE } = require('./anim/params.js');

// ---------------------------------------------------------------- ledger: planned chapter → { number: source }
// 1 為什麼走鞏膜　2 定位、side port、結膜　3 隧道　4 隧道出錯　5 CCC 到 IOL（本例不同處）　6 縫合與收尾
const LEDGER = {
  '1': { '3.5': 'Olsen 1997', '4.0': 'Olsen 1997', '0.72': 'Olsen 1997', '0.36': 'Olsen 1997', '6': 'Olsen 1997', '3.0': 'Hayashi 2010', '2.0': 'Hayashi 2010', '5.88': 'ESCRS 2007' },
  '2': { '1': '病例', '2': '病例', '15': '病例', '3': '示意' },
  '3': { '1': 'Goel 2022', '2': 'Goel 2022', '1.5': 'Ernest 1994', '3.2': 'Ernest 1994', '525': 'Ernest 1994', '13': 'Ernest 1994', '2.0': 'Ernest 1994', '4.0': 'Ernest 1993', '2.65': '病例', '3.0': '示意' },
  '4': { '339': 'Subudhi 2021', '12.6': 'Subudhi 2021', '10.6': 'Subudhi 2021', '34': 'John 1992', '6': 'John 1992', '1': 'John 1992', '0.27': 'John 1992', '0.17': 'John 1992' },
  '5': { '5.0': 'Hollick 1999', '5.5': 'Hollick 1999', '360': '結構', '4.0': 'Ye 2021', '6.5': '病例', '0.75': 'Soda 2012' },
  '6': { '10-0': '病例', '10': '病例', '0': '病例', '1': 'ESCRS 2007', '0.1': 'ESCRS 2007', '4.92': 'ESCRS 2007' },
};
const SPECIAL = ['病例', '示意', '結構', '院內常規'];

const R = [], ok = (c, m) => R.push([!!c, m]);
// every ledger source is a REFS entry or a special source
for (const [seg, nums] of Object.entries(LEDGER)) for (const [n, s] of Object.entries(nums)) {
  const m = s.match(/^([A-Z][A-Za-z'\-]+) (\d{4})$/);
  ok(SPECIAL.includes(s) || (m && REFS.some(r => r.startsWith(m[1]) && r.includes(m[2] + ';'))), `ledger ${seg} ${n} → ${s}`);
}
// the case geometry the sheets draw (params.js) against its sources
const tn = K.tunnelOf(CASE.main);
ok(tn.sE >= 1 && tn.sE <= 2, `outer opening ${tn.sE.toFixed(2)} mm behind the limbus (Goel 2022: 1–2 mm)`);
ok(-tn.sI >= 1 && -tn.sI <= 2, `inner opening ${(-tn.sI).toFixed(2)} mm into clear cornea (Goel 2022: 1–2 mm; Ernest 1994 lip 1.5 mm)`);
ok(Math.abs(-tn.sI - 1.5) <= 0.1, `internal corneal lip ≈ 1.5 mm as said on the sheets (${(-tn.sI).toFixed(2)})`);
ok(CASE.main.w === 2.65, 'main incision 2.65 mm (OP note keratome)');
// every inner point of the tunnel lies inside the wall: between the outer surface and the inner surface at its own s (wall coordinates)
const wallOK = tn.pts.slice(1, -1).every(([rho, z]) => { let best = 1e9, sd = null;
  for (let s = tn.sI - 0.3; s <= tn.sE + 0.3; s += 0.005) { const f = G.surfAt(s), d = (f.rho - rho) * f.nr + (f.z - z) * f.nz, off = Math.hypot(f.rho - f.nr * d - rho, f.z - f.nz * d - z);
    if (off < best) { best = off; sd = [s, d]; } } return sd && sd[1] > 0 && sd[1] < G.T(sd[0]); });
ok(wallOK, 'tunnel runs inside the wall (between outer and inner surface)');
const lh = ((CASE.side.h - CASE.surgeon) % 12 + 12) % 12;
ok(lh > 0 && lh < 6, `side port on the surgeon's left (clockwise from the surgeon's hour as the examiner sees it: ${lh.toFixed(1)} h)`);
ok(Math.abs(CASE.main.h - CASE.surgeon) < 1e-9, 'main incision in front of the surgeon (upper-temporal)');
ok(CASE.surgeon > 1 - 1e-9 && CASE.surgeon < 2 + 1e-9, 'surgeon at about 1–2 o\'clock (OS upper-temporal: 3 o\'clock is temporal in OS)');

const bad = R.filter(r => !r[0]);
for (const [c, m] of R) console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`);
console.log(bad.length ? `${bad.length} FAILED` : `all ${R.length} passed`);
if (require.main === module) process.exit(bad.length ? 1 : 0);
module.exports = { LEDGER };
