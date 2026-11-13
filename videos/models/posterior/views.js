// Posterior-segment model: the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in screen mm.
// state.view (optional): { h } clock hour of the meridional section (default 11; right = that clock hour), { x, y, w, h } window overrides, step.
MODEL_VIEWS.posterior = {
  // meridional section through clock h (default 11: right = 11 o'clock, left = 5), anterior up = gravity down for a supine patient
  sec: { title: '子午切面（上＝前，右＝view.h 點）', win: [-13.5, -14.4, 27],
    draw: (state, id) => { const v = state.view || {}; return POSTERIOR.section({ st: state, plane: GLOBE.planes.meridian(v.h ?? 11, v.off || 0), win: _pw(v, { x: -13.5, y: -14.4, w: 27, h: 28.6 }), step: v.step || 0.05, id }).svg; } },
  // close-up of the vitreous base and the tear in the same section (right periphery)
  secz: { title: '子午切面放大：vitreous base、裂孔（右＝view.h 點）', win: [3.5, -9.5, 9],
    draw: (state, id) => { const v = state.view || {}; return POSTERIOR.section({ st: state, plane: GLOBE.planes.meridian(v.h ?? 11, v.off || 0), win: _pw(v, { x: 3.5, y: -9.5, w: 9, h: 9.6 }), step: v.step || 0.015, id }).svg; } },
  // fundus chart, examiner's drawing: 12 o'clock up; OS 3 o'clock (temporal) right
  fundus: { title: '眼底圖（檢查者畫法：12 點在上）', win: [-29, -30, 58],
    draw: (state, id) => POSTERIOR.fundus({ st: state, id }).svg },
  // surgeon's wide-angle view, surgeon at 12: inverter on = 12 o'clock at the bottom; state.inverter false = inverted image
  wide: { title: '術者的廣角視野（術者坐 12 點）', win: [-21, -22, 42],
    draw: (state, id) => POSTERIOR.wide({ st: state, id }).svg },
  // head position: eye section with gravity straight down (plane through the globe centre and the tear)
  head: { title: '頭位：經裂孔、含重力方向的切面（下＝重力）', win: [-13.5, -13.5, 27],
    draw: (state, id) => POSTERIOR.head({ st: state, id, win: _pw(state.view || {}, { x: -13.5, y: -13.5, w: 27, h: 27 }) }).svg },
  // external microscope view with the trocars (globe/'s en-face view), surgeon at 12
  ext: { title: '顯微鏡俯視：trocar（術者坐 12 點）', win: [-13, -7.3, 26],
    draw: (state, id) => POSTERIOR.ext({ st: state, id }).svg },
  // cross-section of a trocar's tunnel: plane perpendicular to the meridian at the trocar (wall left–right, inside down)
  port: { title: 'trocar 隧道的橫切面（view.port）', win: [-2.5, -1.5, 5],
    draw: (state, id) => { const v = state.view || {}, t = POSTERIOR.troc(POSTERIOR.geom(state)).find(x => x.id === (v.port || 'st')) || { h: 1.5, s: 4 };
      return POSTERIOR.section({ st: state, plane: GLOBE.planes.across(t.h, t.s), win: _pw(v, { x: -2.5, y: -1.5, w: 5, h: 3.2 }), step: v.step || 0.01, id }).svg; } },
};
function _pw(v, def) { return { x: v.x ?? def.x, y: v.y ?? def.y, w: v.w ?? def.w, h: v.hgt ?? def.h }; }
