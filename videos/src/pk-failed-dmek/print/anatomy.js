// 關鍵解剖與數字速查: the 12–6 section before surgery (oedema, DMEK graft, shallow chamber, iris bombé, PAS, IOL), the surgeon's view before
// surgery (LI at 7, hyphema), the 6 o'clock junction after suturing — and two tables; table rows name the ledger segment of ../check.js.
PRINT.sheet({
  type: 'anatomy', title: '關鍵解剖與數字速查', sub: '本例：左眼 OS、Fuchs、人工水晶體眼、DMEK 約一週後失敗；做法依主刀',
  sources: ['Gómez-Benlloch 2021', 'Price 2015', 'Gonzalez 2016', 'Figueiredo 2013', 'Thompson 2003'],
  ledger: { '12': '結構', '6': '結構', '3': '結構' },
  figH: 66,
  figures: [
    { w: 110, kind: 'pksec', hp: 6, state: ST.pre, win: WIN.sec,
      labels: [['DMEK graft（脫離示意）', '', 'dmek6', { side: 'R' }], ['IOL', '', 'iol', { side: 'L' }], ['虹膜', 'iris', 'irisL', { side: 'L' }]], labelOpts: { sides: true } },
    { w: 80, kind: 'pkscope', state: ST.pre, win: WIN.scope, labels: [], labelOpts: { sides: true } },
    { w: 78, kind: 'pksec', hp: 6, state: ST.all, win: WIN.zoom,
      labels: [['縫線（深度示意）', 'suture', 'sutDeep6', { side: 'R' }], ['供體', 'donor', 'donorEdgeR', { side: 'L' }]], labelOpts: { sides: true } },
  ],
  bottom: '1.05fr 1.35fr 46mm',
  tables: [
    { head: '依院內範本（刀後依 OP note 確認）', rows: [
      ['縫線', '16 針 10-0 nylon interrupted', '4-1'],
      ['Trephine／punch', 'Barron radial vacuum trephine／Barron vacuum punch；大小 [ ] mm', '2-1'],
      ['前房', '分開 PAS、Healon 撐起', '3-1'],
      ['收尾', 'TSCL、Maxitrol、壓迫包紮＋金屬眼罩', '5-1'] ] },
    { head: '文獻的數字', src: true, rows: [
      ['DMEK 失敗主因', 'primary graft failure 64.1%', '1-2'],
      ['再做 DMEK', '55 眼：早期再做與對側眼相當', '1-2'],
      ['DMEK 後前房全滿空氣', '22%；要放氣的眼 iridotomy 被堵 23% vs 6.6%', '3-2'],
      ['PK 後 Urrets-Zavalia', '與術後 24 小時內眼壓升高有關', '5-1'],
      ['Regraft 5 年存活', '53% vs 第一次 90%', '5-1'] ] },
  ],
  legend: { rows: ['sut'], orient: ['<b>左、右圖 切面</b>：經 12 與 6 點；上＝前；右圖是 6 點側交界放大', '<b>中圖 術者視角</b>：左眼、術者坐 12 點；下＝12 點、左＝3 點 temporal',
    'DMEK graft 脫離範圍、PAS、前房積血、IOL、縫線深度：示意'] },
});
