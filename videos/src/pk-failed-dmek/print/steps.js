// 手術步驟圖 (assistant's version): one cell per checklist item; left = the 12–6 section of globe/pk.js (left = 12 o'clock, right = 6,
// anterior up), right = the surgeon's microscope view of the OS eye (surgeon at 12: 下＝12 點、左＝3 點 temporal), the same state.
// 示意: trephine sizes, the DMEK graft's detached part, PAS extent, hyphema level, IOL type, the leak at 4.
{
  const sec = (st, o = {}) => ({ kind: 'pksec', hp: 6, state: st, win: WIN.sec, ...o });
  const scope = (st, o = {}) => ({ kind: 'pkscope', state: st, win: WIN.scope, ...o });
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '每格左：12–6 點切面　右：術者視角（方位見右下）',
    sources: [],
    ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構', '16': '院內常規' },
    grid: [3, 3],
    legend: { rows: ['cut', 'sut'], orient: ['<b>左圖 切面</b>：經 12 與 6 點；左＝12 點、右＝6 點；上＝前（術者側）', '<b>右圖 術者視角</b>：下＝12 點、左＝3 點 temporal',
      'Trephine 大小、DMEK graft 脫離範圍、PAS、前房積血、IOL：示意（依主刀、待刀後補）'] },
    steps: [
      { hd: '術前：前房淺、hyphema、LI', views: [
        sec(ST.pre, { labels: [['IOL', '', 'iol', { side: 'L' }]] }), scope(ST.pre) ] },
      { hd: '供體：內皮面朝上、塗 Healon', views: [ sec(ST.donor), scope(ST.donor) ] },
      { hd: '受體 trephine：部分深度', views: [ sec(ST.tre), scope(ST.tre) ] },
      { hd: 'Open sky：不壓、不扳', views: [ sec(ST.open), scope(ST.open) ] },
      { hd: '分開沾黏、清血、Healon（依主刀）', views: [ sec(ST.clean), scope(ST.clean) ] },
      { hd: 'Cardinal：12 → 6 → 3 → 9', views: [ sec(ST.card), scope(ST.card) ] },
      { hd: '補完 16 針、埋結', views: [ sec(ST.all), scope(ST.all) ] },
      { hd: 'Seidel test、TSCL、包紮', views: [ sec(ST.leak), scope(ST.leak) ] },
    ],
  });
}
