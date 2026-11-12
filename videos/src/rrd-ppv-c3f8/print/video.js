// Printable OR-wall sheets of the RRD PPV video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files draw. Text stage (2026-11-12): only the checklist exists (it draws no model), so no model is loaded yet; the steps and
// anatomy sheets come once the posterior-segment model (videos/models/posterior/) and anim/draw.js exist, with states copied by name.
PRINT.video({
  id: 'rrd-ppv-c3f8',
  title: 'RRD 的 23G PPV＋C3F8：助手版',
  surgery: ['RRD　23G 三孔 PPV＋C3F8', '助手版：架設 → 壓鞏膜 → 備氣 → 術後', '左眼 OS、術者坐 12 點'],
  steps: 10,
  models: [],
  scripts: ['anim/segments.js'],
  setup() { return {}; },
});
