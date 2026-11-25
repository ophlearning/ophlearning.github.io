// Printable OR-wall sheets of the tectonic PK video (videos/tools/print, README there): which video, which model files, and the states the
// sheet data files (checklist.js, steps.js, anatomy.js) draw. The states use globe/pk.js (st.pk, CARD.md「PK」): case B = OS, old DALK graft
// and its junction (diameter 示意), 360° peripheral NV, descemetocele at 6 o'clock (位置示意), phakic, soft eye. The steps follow the hospital's
// PK operation-record template (院內常規, 站長 2026-11-23): GA, Barraquer speculum, Barron vacuum punch / radial vacuum trephine, Healon,
// PAS separated, 16 interrupted 10-0 nylon, TSCL, Maxitrol, pressure dressing and metal shield. Trephine sizes are blank in the template: 依主刀.
PRINT.video({
  id: 'pk-tectonic-descemetocele',
  title: 'DALK 失敗後 descemetocele 的 tectonic PK：助手版',
  surgery: ['Tectonic PK（助手版）', 'DALK 失敗後的 descemetocele', '左眼 OS、術者坐 12 點'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js', 'globe/pk.js'],
  scripts: ['anim/segments.js'],
  setup() {
    const B = { eye: 'OS', soft: 0.6, edema: 0.12, haze: 0.45, old: { d: 7.0 }, nv: 1, dcele: { h: 6, r: 2.0, rad: 0.9, thin: 0.06, bulge: 0.15 }, lens: 'phakic' };
    const pk = o => ({ pk: { ...B, ...o } });
    const TD = 7.5, DD = 7.75;                                   // 示意 (院內範本留白、依主刀): recipient 7.5, donor +0.25 (Koo 2019)
    const ST = {
      pre: pk({}),
      donor: pk({ donor: { d: DD, place: 0, endoUp: true } }),
      tre: pk({ press: 0.6, tre: { d: TD, depth: 0.6 } }),
      scis: pk({ tre: { d: TD, depth: 0.6, enter: { h: 12, w: 1.0 }, scis: 200, dir: 1 } }),
      open: pk({ tre: { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 }, open: 1 }),
      bulge: pk({ tre: { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 }, open: 1, bulge: 0.5 }),
      card: pk({ tre: { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 }, open: 1, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 4, tie: 1 } }),
      all: pk({ tre: { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 }, open: 1, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 16, tie: 1, bury: 1 } }),
      leak: pk({ tre: { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 }, open: 1, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 16, tie: 1, bury: 1 }, fl: 1, leak: { h: 4, amt: 0.6 } }),
    };
    const WIN = { sec: { x: -8.5, y: -14.4, w: 17, h: 8.5 }, scope: { x: -9, y: -5.2, w: 18 }, zoom: { x: 2.2, y: -13.6, w: 3.6, h: 2.4 } };
    const lb = (zh, en, side, y, a, o = {}) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 1.3, y, a == null ? null : typeof a === 'function' ? a(V) : a, { side, ...o });
    const tag = (s, side = 'L', y = 3.6) => V => [].concat(s).map((t, i) => PRINT.txt(side === 'L' ? 1.3 : V.w - 1.3, y + i * 3.6, t, { pt: 9.5, bold: true, anchor: side === 'L' ? 'start' : 'end' })).join('');
    const all = (...fs) => V => fs.map(g => g(V)).join('');
    return { B, ST, WIN, lb, tag, all };
  },
});
