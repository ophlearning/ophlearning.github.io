// ============================================================================
// Phaco machine fluidics for the on-screen panel of the cataract series (video ②: hydrodissection, divide and conquer). Pure functions, no drawing.
// The machine is J&J Veritas (user-confirmed); the hospital's own settings are not available, so every setting is 示意，依院內機器設定 unless
// CARD.md (白內障 ②「流體」) gives a source. In node: const FL = require('./fluidics.js'); in a page: global FLUIDICS.
//   state({ pedal, occl, set, tOcc, tBreak, vacBreak }) → { irr, asp, us, flow, vac, iop, dip, ... }   (one moment)
//   surge(t, set, vac) → share of the anterior-chamber depth lost t s after an occlusion break (0 before the break and after it is over)
// Foot pedal: 0 nothing, 1 irrigation, 2 irrigation + aspiration, 3 irrigation + aspiration + ultrasound (power rises over the travel of 3).
// ============================================================================
function FLUIDICS_MAKE() {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
  const NUM = {
    mmHgPerCmH2O: 0.7356,          // physics: a 1 cm column of water = 0.7356 mmHg (the bottle height above the eye sets the static infusion pressure)
    advInf: 22,                    // Quesada 2022: Veritas Advanced Infusion adds 22 mmHg (30 cmH2O) to the bottle
    acv: 250,                      // Scarfone 2026: reference anterior-chamber volume of a phakic adult eye (µL)
    surgeVol450: 60,               // 示意: surge volume at a 450 mmHg vacuum limit, inside Scarfone 2026's 30–103 µL for the WhiteStar Signature Pro (Veritas's predecessor)
    vacRef: 450,                   // Soule 2026: vacuum of the standard quadrant-removal preset on Veritas (mmHg)
    surgeDur: { venturi: [[41, 1.56], [81, 2.27]], peri: [[41, 2.25], [81, 2.90]] },   // Soule 2026 bench, Veritas: surge duration (s) at bottle 41 / 81 cm
    surgePeak: 0.15,               // 示意: time from the break to the shallowest chamber (s)
    iopRest: 15,                   // 示意: chamber pressure with the pedal up (no irrigation)
    kFlow: 0.25,                   // 示意: pressure lost to the outflow, mmHg per mL/min of aspiration
    kPassive: 1.0,                 // 示意: passive (flow-resistance) vacuum with the port open, mmHg per mL/min (the component itself: Scarfone 2026)
    tauVac: 0.4,                   // 示意: vacuum rise time constant after the port is occluded (s)
  };
  // presets (示意，依院內機器設定, except vacuum 450 and bottle 81 cm of 'quad': Soule 2026's Veritas quadrant preset, bottle 81 cm one of its two test heights)
  const PRESET = {
    sculpt: { name: '刻槽 sculpt', pump: 'peri', bottle: 81, ai: false, flow: 24, vac: 80, us: 50 },
    quad: { name: '四象限 quadrant', pump: 'peri', bottle: 81, ai: false, flow: 30, vac: 450, us: 40 },
  };
  const setOf = set => typeof set === 'string' ? Object.assign({}, PRESET[set]) : Object.assign({}, PRESET.quad, set || {});
  const interp = (tab, x) => { if (x <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])); return tab[tab.length - 1][1]; };
  const surgeDur = set => { const s = setOf(set); return interp(NUM.surgeDur[s.pump === 'venturi' ? 'venturi' : 'peri'], s.bottle); };
  // the static infusion pressure at the eye (pedal ≥ 1) and its share of what the open port costs
  const pIrr = s => s.bottle * NUM.mmHgPerCmH2O + (s.ai ? NUM.advInf : 0);
  // share of the chamber depth lost after an occlusion break (Scarfone 2026: the surge grows with the vacuum limit; volume / ACV as the depth share is 示意)
  function surgePeak(set, vac) { const s = setOf(set), v = vac ?? s.vac; return Math.min(0.9, NUM.surgeVol450 * (v / NUM.vacRef) / NUM.acv); }
  function surge(t, set, vac) {
    if (!(t >= 0)) return 0; const D = surgePeak(set, vac), tp = NUM.surgePeak, dur = surgeDur(set);
    if (t >= dur) return 0;
    return t < tp ? D * Math.sin(Math.PI / 2 * t / tp) ** 2 : D * 0.5 * (1 + Math.cos(Math.PI * (t - tp) / (dur - tp)));
  }
  // one moment: pedal 0–3 (fractional inside 3 = ultrasound travel), occl 0→1 (port occluded), tOcc s since it occluded, tBreak s since it broke free
  function state(o) {
    const s = setOf(o.set), pedal = clamp(o.pedal ?? 0, 0, 3), occl = clamp(o.occl ?? 0, 0, 1);
    const irr = pedal >= 1, asp = pedal >= 2, inUS = pedal > 2;
    let flow = 0, vac = 0;
    if (asp) {
      const passive = NUM.kPassive * s.flow, build = s.vac * (1 - Math.exp(-(o.tOcc ?? 10) / NUM.tauVac));
      if (s.pump === 'venturi') { vac = s.vac; flow = s.flow * (1 - occl); }                       // venturi: the pump sets the vacuum; flow stops when occluded
      else { flow = s.flow * (1 - occl); vac = Math.min(s.vac, lerp(passive, Math.max(passive, build), occl)); }   // peristaltic: vacuum builds only when occluded
    }
    const us = inUS ? s.us * clamp(pedal - 2, 0, 1) : 0;
    const dip = o.tBreak >= 0 ? surge(o.tBreak, s, o.vacBreak ?? s.vac) : 0;
    const iop0 = irr ? pIrr(s) - NUM.kFlow * flow : NUM.iopRest;
    return { pedal, irr, asp, us, flow, vac, iop: iop0 * (1 - dip), iopStatic: irr ? pIrr(s) : NUM.iopRest, dip, occl, set: s,
      label: { pedal: `腳踏 ${Math.floor(pedal + 1e-9)}`, irr: irr ? '灌流 開' : '灌流 關', flow: `${flow.toFixed(0)} mL/min`, vac: `${vac.toFixed(0)} mmHg`, us: `${us.toFixed(0)} %`, iop: `${(iop0 * (1 - dip)).toFixed(0)} mmHg` } };
  }
  return { NUM, PRESET, state, surge, surgePeak, surgeDur, pIrr: set => pIrr(setOf(set)) };
}
const FLUIDICS = FLUIDICS_MAKE();
if (typeof module !== 'undefined') module.exports = FLUIDICS;
