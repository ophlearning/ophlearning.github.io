// Eyelid model: the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in mm.
MODEL_VIEWS.eyelid = {
  sag: { title: '矢狀切面 sagittal', win: [-31, -28, 37], draw: (state, id, variant) => LID.draw({ variant, state, id }).svg },
  cor: { title: '正面 coronal', win: [-21, -16, 40], draw: (state, id, variant) => CORONAL.draw({ variant, state, id, section: false }).svg },
  ev: { title: '翻瞼 everted', win: [-17, -15, 32], draw: (state, id) => CORONAL.drawEverted({ state, id }).svg },
  // lower lid (opt-in): the same sagittal section with the lower lid added; state = lower-lid state, state.upper = upper-lid state
  lsag: { title: '下眼瞼矢狀切面 lower lid sagittal', win: [-19, 1, 24], draw: (state, id, variant) => LOWER.draw({ variant, state, upper: state.upper || {}, id }).svg },
  both: { title: '上下眼瞼矢狀切面 both lids', win: [-31, -26, 50], draw: (state, id, variant) => LOWER.draw({ variant, state, upper: state.upper || {}, id }).svg },
  lzoom: { title: '下瞼緣放大 lower lid margin', win: [-14.6, 4.2, 4.5], draw: (state, id, variant) => LOWER.draw({ variant, state, upper: state.upper || {}, id }).svg },
  // coronal with the lower lid: state = lower-lid state; state.upper = upper-lid coronal state; state.windows = extra windows
  lcor: { title: '正面（含下眼瞼）coronal, lower lid', win: [-24, -8, 44], draw: (state, id, variant) => CORONAL.draw({ variant, state: state.upper || {}, lower: state, windows: state.windows || [], id, section: false }).svg },
  lcanth: { title: '外眥正面 lateral canthus', win: [-25, -7, 16], draw: (state, id, variant) => CORONAL.draw({ variant, state: state.upper || {}, lower: state, id, section: false }).svg },
  // horizontal section at the canthal level, seen from below like an axial CT (anterior up, temporal left); x shared with the coronal view
  axial: { title: '外眥水平切面 axial (canthal level)', win: [-30, -20, 44], draw: (state, id) => CANTHUS.draw({ state, id }).svg },
};
