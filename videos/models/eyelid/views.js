// Eyelid model: the views it offers to videos/tools (model-view.html). win = default window [left, top, width] in mm.
MODEL_VIEWS.eyelid = {
  sag: { title: '矢狀切面 sagittal', win: [-31, -28, 37], draw: (state, id, variant) => LID.draw({ variant, state, id }).svg },
  cor: { title: '正面 coronal', win: [-21, -16, 40], draw: (state, id, variant) => CORONAL.draw({ variant, state, id, section: false }).svg },
  ev: { title: '翻瞼 everted', win: [-17, -15, 32], draw: (state, id) => CORONAL.drawEverted({ state, id }).svg },
};
