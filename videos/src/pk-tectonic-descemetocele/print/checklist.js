// 跟刀清單 (assistant's version): the hospital's PK operation-record template (院內常規) in order, with what the assistant does or watches for
// in this case; each number is in the video's ledger (check.js) or this sheet's ledger, each source in the footer. Numbers = steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單（助手）', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；trephine 大小與細節依主刀',
  sources: ['Ingraham 1989', 'Lee 2012'],
  ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構', '16': '院內常規', '10-0': '院內常規', '1.08': 'Ingraham 1989', '86': 'Lee 2012', '0.12': '結構' },
  items: [
    { sec: '術前', act: '<b>左眼 OS</b>、術者坐 12 點：<b>下＝12 點、temporal 在左</b>；GA；Barraquer 開瞼器（solid blades）',
      note: '薄、軟、有晶體：消毒、上開瞼器、量角膜時<b>手不壓眼球</b>' },
    { sec: '術中', act: '供體：<b>Barron vacuum punch</b> 垂直切、<b>內皮面朝上</b>，內皮塗 <b>Healon</b>',
      note: '內皮保持濕潤、任何東西都不碰；記下供體 [ ] mm' },
    { act: '受體：<b>Barron radial vacuum trephine</b> 垂直切；先部分深度',
      note: '軟眼不好切正；記下受體 [ ] mm' },
    { act: '切完一圈、取下 button → <b>open sky</b>：<b>不壓、不扳</b>；分開周邊 <b>PAS</b>、<b>Healon</b> 撐前房',
      note: '往前鼓、紅光變暗 → 馬上講（SCH 最高 1.08%）；角膜送病理' },
    { act: '放上供體；<b>cardinal 12 → 6 → 3 → 9</b>：助手在主刀下針的<b>對側</b>用 0.12 固定',
      note: '第一針 12 點：86% 的醫師（Lee 2012）；之後依常規' },
    { act: '補完 <b>16 針 10-0 nylon interrupted</b>；遞針、剪線、<b>記針數</b>、埋結',
      note: '結埋起來，但不停在交界上（Lee 2012）' },
    { act: 'BSS 重建前房；<b>Seidel test</b>：沿交界點 fluorescein 找亮綠細流',
      note: '有漏 → 補一針' },
    { sec: '收尾與術後', act: '<b>TSCL</b>、Maxitrol 藥膏、<b>壓迫包紮＋金屬眼罩</b>',
      note: 'HSV 病史：口服抗病毒藥預防；藥物、上皮保護依主刀' },
  ],
});
