// Globe model (anterior segment): the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in screen mm.
// state.view (optional) chooses the plane: { h, s } for the cross-section; the wound is taken from state.wound.
MODEL_VIEWS.globe = {
  // section through the optical axis along the wound's clock hour (anterior up; right = away from the corneal centre)
  mer: { title: '經傷口的子午切面 meridional section', win: [-1, -14.2, 13],
    draw: (state, id) => { const h = (state.wound || {}).h ?? 10, w = { x: -1, y: -14.2, w: 13, h: 9 };
      return GLOBE.section({ plane: GLOBE.planes.meridian(h), win: w, st: state, id, step: 0.03 }).svg; } },
  // section perpendicular to the wound at distance s from the limbus (wall left–right, inward down)
  across: { title: '垂直傷口的切面 cross-section of the wound', win: [-2.5, -1, 5],
    draw: (state, id) => { const h = (state.wound || {}).h ?? 10, s = (state.view || {}).s ?? -1;
      return GLOBE.section({ plane: GLOBE.planes.across(h, s), win: { x: -2.5, y: -1, w: 5, h: 3.2 }, st: state, id, step: 0.01 }).svg; } },
  // microscope view, surgeon at the patient's head (12 o'clock at the bottom)
  scope: { title: '顯微鏡俯視 surgeon view (surgeon at 12)', win: [-9, -5.2, 18],
    draw: (state, id) => GLOBE.enface({ st: state, id, surgeon: state.surgeon ?? 12 }).svg },
};
