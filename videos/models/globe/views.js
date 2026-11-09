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
  // ---- cataract (globe/cataract.js; state under st.cat). state.view = { x, y, w, h, step } refines the computed window for close-ups.
  // 12–6 section through the main incision: anterior up, 12 o'clock (incision, surgeon's side) on the LEFT, 6 on the right (seen from the temporal side, OD)
  cat: { title: '經主切口的 12–6 點切面（左＝12 點）', win: [-8.5, -14.6, 17],
    draw: (state, id) => CATARACT.section({ st: state, h: 6, win: _cw(state, { x: -8.5, y: -14.6, w: 17, h: 10.2 }), step: (state.view || {}).step || 0.03, id }).svg },
  // close-up of the main incision (same plane)
  tunnel: { title: '主切口隧道放大（12–6 點切面，左＝12 點）', win: [-7.4, -12.7, 5],
    draw: (state, id) => CATARACT.section({ st: state, h: 6, win: _cw(state, { x: -7.4, y: -12.7, w: 5, h: 5.7 }), step: (state.view || {}).step || 0.008, id }).svg },
  // meridional section just behind the tear front of the capsulorhexis (right = toward that clock hour, periphery): the capsule's cut edge shows at its radius
  tear: { title: '撕囊前緣的子午切面（右＝周邊）', win: [-1.5, -12.6, 9.5],
    draw: (state, id) => CATARACT.section({ st: state, h: _hf(state), win: _cw(state, { x: -1.5, y: -12.6, w: 9.5, h: 8 }), step: (state.view || {}).step || 0.02, id }).svg },
  // capsule at true thickness (µm) at the rhexis edge in the tear-front plane
  capzoom: { title: '前囊真實厚度放大（撕囊邊緣，5.25 mm 撕囊）', win: [2.475, -9.62, 0.3],
    draw: (state, id) => CATARACT.section({ st: state, h: _hf(state), win: _cw(state, { x: 2.475, y: -9.62, w: 0.3, h: 0.36 }), step: (state.view || {}).step || 0.0012, id }).svg },
  // microscope view for cataract states (dilated pupil, red reflex), surgeon at 12
  cscope: { title: '顯微鏡俯視（白內障，術者坐 12 點）', win: [-8, -4.5, 16],
    draw: (state, id) => CATARACT.enface({ st: state, id, surgeon: state.surgeon ?? 12 }).svg },
};
function _cw(state, def) { const v = state.view || {}; return { x: v.x ?? def.x, y: v.y ?? def.y, w: v.w ?? def.w, h: v.h ?? def.h }; }
function _hf(state) { const c = CATARACT.norm(state); return (state.view || {}).hp ?? (c.ccc && c.ccc.prog > 0 ? CATARACT.tearPlane(c) : 6); }
