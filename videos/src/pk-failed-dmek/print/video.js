// Printable OR-wall sheets of the PK-after-failed-DMEK video (videos/tools/print, README there). States use globe/pk.js (st.pk, CARD.md「PK」):
// case A = OS, pseudophakic (PCIOL), LI at 7 o'clock, a poorly attached DMEK graft, oedema, shallow chamber with pupillary block (iris bombé),
// peripheral anterior synechiae, hyphema (sizes 示意). Steps follow the hospital's PK operation-record template (院內常規, 站長 2026-11-23).
PRINT.video({
  id: 'pk-failed-dmek',
  title: 'Failed DMEK 後的 PK：助手版',
  surgery: ['PK（助手版）', 'Failed DMEK 之後', '左眼 OS、術者坐 12 點'],
  steps: 8,
  models: ['globe/globe.js', 'globe/cataract.js', 'globe/pk.js'],
  scripts: ['anim/segments.js'],
  setup() {
    const A = { eye: 'OS', soft: 0.3, edema: 0.3, haze: 0.35, dmek: { d: 8.0, h: 6, detach: 0.4, gap: 0.35 }, lens: 'iol', ac: 0.4, bombe: 0.3, pas: 0.8,
      li: { h: 7, r: 4.3, d: 0.3 }, hy: { pos: 'supine' } };
    const pk = o => ({ pk: { ...A, ...o } });
    const TD = 7.5, DD = 7.75;                                   // 示意 (院內範本留白、依主刀)
    const T1 = { d: TD, depth: 1, enter: { h: 12, w: 1.0 }, scis: 360, dir: 1 };
    const CLEAN = { pas: 0, hy: null, ac: 1, bombe: 0, dmek: null };   // after the chamber is dealt with (依主刀) and the host button (with the DMEK graft) is gone
    const ST = {
      pre: pk({}),
      donor: pk({ donor: { d: DD, place: 0, endoUp: true } }),
      tre: pk({ press: 0.4, tre: { d: TD, depth: 0.6 } }),
      open: pk({ tre: T1, open: 1, dmek: null }),
      clean: pk({ tre: T1, open: 1, ...CLEAN }),
      card: pk({ tre: T1, open: 1, ...CLEAN, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 4, tie: 1 } }),
      all: pk({ tre: T1, open: 1, ...CLEAN, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 16, tie: 1, bury: 1 } }),
      leak: pk({ tre: T1, open: 1, ...CLEAN, donor: { d: DD, place: 1 }, sut: { n: 16, placed: 16, tie: 1, bury: 1 }, fl: 1, leak: { h: 4, amt: 0.6 } }),
    };
    const WIN = { sec: { x: -8.5, y: -14.4, w: 17, h: 8.5 }, scope: { x: -9, y: -5.2, w: 18 }, zoom: { x: 2.2, y: -13.6, w: 3.6, h: 2.4 } };
    return { A, ST, WIN };
  },
});
