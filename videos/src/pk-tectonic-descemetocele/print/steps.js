// 手術步驟圖 (assistant's version): one cell per checklist item (numbers = checklist numbers); left = the 12–6 section of globe/pk.js
// (mechanism: left = 12 o'clock, right = 6, anterior up), right = the surgeon's microscope view of the OS eye (surgeon at 12: 下＝12 點、
// 左＝3 點 temporal), the same state. Model colours → print: the trephine cut (red) = thick black line; sutures (blue) = black dotted line.
// 示意 as in spec.md / CARD.md「PK」: trephine sizes (院內範本留白), the descemetocele's place and size, the old graft's diameter, the leak at 4.
{
  const SEC = WIN.sec, SC = WIN.scope;
  const sec = (st, o = {}) => ({ kind: 'pksec', hp: 6, state: st, win: SEC, ...o });
  const scope = (st, o = {}) => ({ kind: 'pkscope', state: st, win: SC, ...o });
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '每格左：12–6 點切面　右：術者視角（方位見右下）',
    sources: ['Koo 2019'],
    ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構', '16': '院內常規' },
    grid: [3, 3],
    legend: { rows: ['cut', 'sut'], orient: ['<b>左圖 切面</b>：經 12 與 6 點；左＝12 點、右＝6 點；上＝前（術者側）', '<b>右圖 術者視角</b>：下＝12 點、左＝3 點 temporal',
      'Trephine 大小、descemetocele 的位置與大小、舊 graft 的大小：示意（依主刀、待刀後補）'] },
    steps: [
      { hd: '術前：薄、軟、有晶體', views: [
        sec(ST.pre, { labels: [['descemetocele', '', 'dcele', { side: 'R' }], ['水晶體', 'lens', 'lens', { side: 'L' }]] }),
        scope(ST.pre) ] },
      { hd: '供體：內皮面朝上、塗 Healon', views: [
        sec(ST.donor, { labels: [['供體', 'donor', 'donorTop', { side: 'L' }]] }),
        scope(ST.donor) ] },
      { hd: '受體 trephine：部分深度', views: [
        sec(ST.tre, { labels: [['切痕', 'groove', 'tre6', { side: 'R' }]] }),
        scope(ST.tre) ] },
      { hd: 'Open sky：不壓；分開 PAS、Healon', views: [
        sec(ST.open, { labels: [['水晶體', 'lens', 'lensFront', { side: 'L' }], ['虹膜', 'iris', 'iris', { side: 'R' }]] }),
        scope(ST.open) ] },
      { hd: 'Cardinal：12 → 6 → 3 → 9', views: [
        sec(ST.card, { labels: [['縫線', 'suture', 'sutDeep6', { side: 'R' }]] }),
        scope(ST.card) ] },
      { hd: '補完 16 針、埋結', views: [
        sec(ST.all, { labels: [['供體', 'donor', 'donorTop', { side: 'L' }]] }),
        scope(ST.all) ] },
      { hd: '重建前房、Seidel test（漏處示意）', views: [
        sec(ST.leak),
        scope(ST.leak) ] },
      { hd: 'TSCL、Maxitrol、壓迫包紮', views: [
        sec(ST.all),
        scope(ST.all) ] },
    ],
  });
}
