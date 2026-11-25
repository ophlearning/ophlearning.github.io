// Printable OR-wall sheets (videos/tools/print, README there) for an OS lower-lid Hotz with partial fat removal (2026-11-23; the case summary
// confirmed by the site owner that day). There is no video yet: the states below follow the eyelid model's Hotz states (videos/models/eyelid
// CARD.md: hotzExc → septOpen → hotzFat → hotzFix), the entropion of ../lower-lid-entropion-revision (entr ≥ 0.95 so the lashes really touch
// the cornea; no previous scar: the earlier treatment is unknown) and its windows. The figures are the right eye (OD); this case is OS.
PRINT.video({
  id: 'lower-lid-hotz-fat-removal',
  title: '下眼瞼 Hotz＋去眼袋',
  surgery: ['OS 下眼瞼 Hotz＋去眼袋', 'recurrent involutional entropion＋lid bag', '右眼 OD 示意圖；本台 OS，左右相反'],
  steps: 8,
  models: ['eyelid/lid.js', 'eyelid/coronal.js', 'eyelid/lower.js', 'eyelid/lower-coronal.js', 'eyelid/canthus.js'],
  scripts: ['anim/segments.js'],
  setup() {
    const PRE = { entr: 0.95, dehis: 1, override: 0.6 };      // involutional entropion, retractor dehiscence, preseptal override (degree 示意)
    const EXC = { ...PRE, hotzExc: 1 };                       // skin, subcutaneous tissue and orbicularis excised (width 示意)
    const SEPT = { ...EXC, septOpen: 1, hotzSept: 1 };        // through the septum to the retractor aponeurosis
    const FAT = { ...SEPT, hotzFat: 1 };                      // partial fat removal (amount 院內常規; the septal bow flattens, 示意)
    const FIX = { ...FAT, hotzFix: 1, tie: 1, override: 0 };  // orbicularis → aponeurosis (6-0 Prolene ×5, 院內常規); margin turned out
    const LCC = { canthotomy: 1, cantholysis: 1 };            // lateral canthotomy + inferior cantholysis (axial and coronal canthus)
    // windows (model mm): lower-lid section, coronal lower lid, margin zoom; the canthus pair shares x (axial + coronal line up)
    // sag = the lid (margin to rim); deep = back to the inferior oblique (model x 6.3, its position in this plane 示意); zoom = margin and cornea
    const WIN = { sag: { x: -19.5, y: 1.5, w: 15, h: 16 }, deep: { x: -19.5, y: 1.5, w: 27, h: 18 }, zoom: { x: -18.7, y: 0.3, w: 10, h: 10 }, fix: { x: -18.5, y: 2.5, w: 12, h: 13 },
      cor: { x: -15.5, y: -6, w: 27 }, axc: { x: -26.0, y: -10.0, w: 19, h: 19 }, canth: { x: -26.0, y: -8.0, w: 19, h: 19 } };
    // what the opened septum shows in the surgeon's view: the three fat pads and the inferior oblique (window from the excision down to
    // the rim, depth 3 = fat-pad layer). The extent is schematic (示意): the model's Hotz window stops at the excised strip.
    const fatWin = st => { const c = CORONAL.draw({ variant: 'asian', state: {}, lower: st, id: 'hzw', windows: [], section: false }), X = [];
      for (let x = -15.5; x <= 12.5 + 1e-9; x += 0.25) X.push(+x.toFixed(2));
      return [{ poly: [...X.map(x => [x, Math.max(c.hotzHiY(x), c.fusLY(x) - 0.4)]), ...X.slice().reverse().map(x => [x, c.rimLY(x) - 0.6])], depth: 3 }]; };
    const FAT_WIN = fatWin(FAT);
    // Hotz excision edges in the section: skin to the depth of the orbicularis at hotzLo and hotzHi (model q along the skin)
    const hzEdge = (V, k) => { const q = V.r.A.lower[k]; return [V.P(V.r.SK.off(q, 0)), V.P(V.r.SK.off(q, -V.r.deepAt(q)))]; };
    return { PRE, EXC, SEPT, FAT, FIX, LCC, WIN, FAT_WIN, hzEdge };
  },
});
