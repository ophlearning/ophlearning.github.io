// Orbit model: the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in mm.
MODEL_VIEWS.orbit = {
  // axial section through the lateral canthus and the optic nerve, seen from below like an axial CT (anterior up, temporal left)
  oax: { title: '眼窩水平切面 axial orbit', win: [-34, -24, 62], draw: (state, id) => ORBIT.axial({ state, id }).svg },
  // the lateral canthus from the front with the tendon window; x shared with the axial view. state.lower = lower-lid state, state.upper = upper
  ofront: { title: '外眥正面＋韌帶窗 lateral canthus, tendon window', win: [-25, -7, 16], draw: (state, id, variant) => ORBIT.front({ state, lower: state.lower || {}, upper: state.upper || {}, id, variant }).svg },
};
