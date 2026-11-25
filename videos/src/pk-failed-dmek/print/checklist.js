// 跟刀清單 (assistant's version): the hospital's PK operation-record template (院內常規) in order, with what the assistant does or watches for
// in this case; each number is in the video's ledger (check.js) or this sheet's ledger, each source in the footer. Numbers = steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單（助手）', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；trephine 大小與前房處理依主刀',
  sources: ['Ingraham 1989', 'Gonzalez 2016', 'Lee 2012', 'Figueiredo 2013'],
  ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構', '7': '病例', '16': '院內常規', '10-0': '院內常規', '0.12': '結構', '8': 'Ingraham 1989',
    '23': 'Gonzalez 2016', '6.6': 'Gonzalez 2016', '86': 'Lee 2012', '24': 'Figueiredo 2013' },
  items: [
    { sec: '術前', act: '<b>左眼 OS</b>、術者坐 12 點：<b>下＝12 點、temporal 在左</b>；<b>LI 在 7 點</b>；GA；Barraquer 開瞼器',
      note: '人工水晶體眼；前房淺、pupillary block、hyphema' },
    { sec: '術中', act: '供體：<b>Barron vacuum punch</b> 垂直切、<b>內皮面朝上</b>，內皮塗 <b>Healon</b>',
      note: '內皮保持濕潤、不碰；記下供體 [ ] mm' },
    { act: '受體：<b>Barron radial vacuum trephine</b> 垂直切；先部分深度',
      note: '記下受體 [ ] mm' },
    { act: '切完一圈、取下 button（連 DMEK graft）→ <b>open sky</b>：<b>不壓、不扳</b>',
      note: '以前做過眼內手術：SCH 9 例有 8 例（Ingraham 1989）；往前鼓、紅光變暗 → 馬上講' },
    { act: '前房：<b>沾黏先分開</b>（硬拉會撕破虹膜）、清血（依主刀）、<b>Healon</b> 撐前房；看 <b>7 點 LI</b> 與 IOL',
      note: 'DMEK 後要放氣的眼：iridotomy 被堵 23% vs 6.6%；PI、IOL 依主刀' },
    { act: '放上供體；<b>cardinal 12 → 6 → 3 → 9</b>：助手在主刀下針的<b>對側</b>用 0.12 固定',
      note: '第一針 12 點：86% 的醫師（Lee 2012）；之後依常規' },
    { act: '補完 <b>16 針 10-0 nylon interrupted</b>；遞針、剪線、<b>記針數</b>、埋結',
      note: '結埋起來，但不停在交界上（Lee 2012）' },
    { sec: '收尾與術後', act: 'BSS 重建前房、<b>Seidel test</b>；<b>TSCL</b>、Maxitrol、<b>壓迫包紮＋金屬眼罩</b>；角膜送病理',
      note: '術後 24 小時盯眼壓：Urrets-Zavalia（Figueiredo 2013）' },
  ],
});
