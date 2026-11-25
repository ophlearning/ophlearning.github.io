// 關鍵解剖與數字速查: three figures of the case — the 12–6 section before surgery (descemetocele, old graft junction, phakic lens), the surgeon's
// view before surgery (360° NV, old junction), the 6 o'clock graft–host junction after suturing (suture across the junction, not through the
// endothelium) — and two tables. Every table row names the ledger segment of ../check.js its numbers come from (third element).
{
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '本例：左眼 OS、DALK 兩次失敗、有晶體眼；院內範本與文獻數值，做法依主刀',
    sources: ['Price 1994', 'Ingraham 1989', 'Koo 2019', 'Lee 2012', 'Huang 2026', 'Thompson 2003'],
    ledger: { '12': '結構', '3': '結構', '6': '結構' },
    figH: 66,
    figures: [
      { w: 110, kind: 'pksec', hp: 6, state: ST.pre, win: WIN.sec,
        labels: [['descemetocele（位置示意）', '', 'dcele', { side: 'R' }], ['舊 graft 交界', 'old junction', 'old', { side: 'R' }],
          ['水晶體', 'lens', 'lens', { side: 'L' }], ['虹膜', 'iris', 'irisL', { side: 'L' }]], labelOpts: { sides: true } },
      { w: 80, kind: 'pkscope', state: ST.pre, win: WIN.scope,
        labels: [], labelOpts: { sides: true } },
      { w: 78, kind: 'pksec', hp: 6, state: ST.all, win: WIN.zoom,
        labels: [['縫線（深度示意）', 'suture', 'sutDeep6', { side: 'R' }], ['供體', 'donor', 'donorEdgeR', { side: 'L' }]], labelOpts: { sides: true } },
    ],
    bottom: '1.05fr 1.35fr 46mm',
    tables: [
      { head: '依院內範本（刀後依 OP note 確認）', rows: [
        ['縫線', '16 針 10-0 nylon interrupted', '5-1'],
        ['Trephine／punch', 'Barron radial vacuum trephine／Barron vacuum punch；大小 [ ] mm', '3-2'],
        ['前房', '分開 PAS、Healon 撐起', '3-3'],
        ['收尾', 'TSCL、Maxitrol、壓迫包紮＋金屬眼罩', '5-2'] ] },
      { head: '文獻的數字', src: true, rows: [
        ['PK 術中 SCH', '0.45%–1.08%；局麻 4.3% vs 全麻 0.56%', '2-2'],
        ['供體 +0.25 mm（光學 PK）', '12 個月 −1.35 vs −0.14 D；排除 tectonic、低眼壓', '3-1'],
        ['第一針 12 點', '86% 的醫師（英國問卷）', '4-2'],
        ['PK＋tarsorrhaphy（NK）', '上皮閉合 88.2%、平均 14.7 天（85 眼）', '6-1'],
        ['Regraft 5 年存活', '53% vs 第一次 90%', '6-1'] ] },
    ],
    legend: { rows: ['sut'], orient: ['<b>左、右圖 切面</b>：經 12 與 6 點；上＝前；右圖是 6 點側交界放大', '<b>中圖 術者視角</b>：左眼、術者坐 12 點；下＝12 點、左＝3 點 temporal',
      '舊 graft 大小、descemetocele 位置、縫線深度：示意'] },
  });
}
