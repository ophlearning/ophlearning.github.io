// Hands and instruments: the views offered to videos/tools (model-view.html). State: { R, L } instruments { kind, tip, dir, open, grip }.
const _HDEF = { R: { kind: 'holder', tip: [4.5, 3], dir: HANDS.unit([0.62, 0.78]) }, L: { kind: 'forceps', tip: [3.6, 2.2], dir: HANDS.unit([-0.55, 0.83]) } };
MODEL_VIEWS.hands = {
  // the field from above, outside the microscope (surgeon at 12 = bottom)
  field: { title: '手術野俯視（顯微鏡外）field from above', win: [-170, -60, 340], draw: st => HANDS.overview(Object.assign({}, _HDEF, st)).svg },
  // instrument tips as seen in the microscope (same tips and directions)
  tips: { title: '顯微鏡下的器械尖端 instrument tips', win: [-4, -3, 16], draw: st => { const s = Object.assign({}, _HDEF, st); return ['L', 'R'].map(k => HANDS.drawInst(s[k], { clip: 40 })).join(''); } },
  // pen grip, side view
  grip: { title: '握筆式持針（側面）pen grip, side view', win: [-130, -110, 300], draw: st => HANDS.gripSide(st).svg },
};
