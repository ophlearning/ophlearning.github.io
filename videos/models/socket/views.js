// Socket model: the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in mm.
MODEL_VIEWS.socket = {
  // meridional section through clock hour h (variant = h, default the exposure hour): right = h, up = anterior (surgeon), down = apex
  sec: { title: '子午切面 meridional section', win: [-22, -14, 44], draw: (state, id, variant) => SOCKET.sec({ state, id, h: variant != null ? +variant : (state.secH != null ? state.secH : (state.expose ? state.expose.h : 12)) }).svg },
  // OS socket seen by the surgeon sitting at 12: down = 12, right = 9 (nasal), left = 3 (temporal)
  front: { title: '術者視角 surgeon view (OS, 12 點)', win: [-31, -18, 62], draw: (state, id) => SOCKET.front({ state, id }).svg },
};
